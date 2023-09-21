/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "vs/base/common/async", "vs/base/common/decorators", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, async_1, decorators_1, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getLinesForCommand = exports.CommandDetectionCapability = void 0;
    class CommandDetectionCapability extends lifecycle_1.Disposable {
        get commands() { return this._commands; }
        get executingCommand() { return this._currentCommand.command; }
        // TODO: as is unsafe here and it duplicates behavor of executingCommand
        get executingCommandObject() {
            if (this._currentCommand.commandStartMarker) {
                return { marker: this._currentCommand.commandStartMarker };
            }
            return undefined;
        }
        get currentCommand() {
            return this._currentCommand;
        }
        get cwd() { return this._cwd; }
        get _isInputting() {
            return !!(this._currentCommand.commandStartMarker && !this._currentCommand.commandExecutedMarker);
        }
        get hasInput() {
            if (!this._isInputting || !this._currentCommand?.commandStartMarker) {
                return undefined;
            }
            if (this._terminal.buffer.active.baseY + this._terminal.buffer.active.cursorY === this._currentCommand.commandStartMarker?.line) {
                const line = this._terminal.buffer.active.getLine(this._terminal.buffer.active.cursorY)?.translateToString(true, this._currentCommand.commandStartX);
                if (line === undefined) {
                    return undefined;
                }
                return line.length > 0;
            }
            return true;
        }
        constructor(_terminal, _logService) {
            super();
            this._terminal = _terminal;
            this._logService = _logService;
            this.type = 2 /* TerminalCapability.CommandDetection */;
            this._commands = [];
            this._currentCommand = {};
            this._isWindowsPty = false;
            this._commandMarkers = [];
            this.__isCommandStorageDisabled = false;
            this._onCommandStarted = this._register(new event_1.Emitter());
            this.onCommandStarted = this._onCommandStarted.event;
            this._onBeforeCommandFinished = this._register(new event_1.Emitter());
            this.onBeforeCommandFinished = this._onBeforeCommandFinished.event;
            this._onCommandFinished = this._register(new event_1.Emitter());
            this.onCommandFinished = this._onCommandFinished.event;
            this._onCommandExecuted = this._register(new event_1.Emitter());
            this.onCommandExecuted = this._onCommandExecuted.event;
            this._onCommandInvalidated = this._register(new event_1.Emitter());
            this.onCommandInvalidated = this._onCommandInvalidated.event;
            this._onCurrentCommandInvalidated = this._register(new event_1.Emitter());
            this.onCurrentCommandInvalidated = this._onCurrentCommandInvalidated.event;
            this._dimensions = {
                cols: this._terminal.cols,
                rows: this._terminal.rows
            };
            this._register(this._terminal.onResize(e => this._handleResize(e)));
            this._register(this._terminal.onCursorMove(() => this._handleCursorMove()));
            this._setupClearListeners();
        }
        _handleResize(e) {
            if (this._isWindowsPty) {
                this._preHandleResizeWindows(e);
            }
            this._dimensions.cols = e.cols;
            this._dimensions.rows = e.rows;
        }
        _handleCursorMove() {
            // Early versions of conpty do not have real support for an alt buffer, in addition certain
            // commands such as tsc watch will write to the top of the normal buffer. The following
            // checks when the cursor has moved while the normal buffer is empty and if it is above the
            // current command, all decorations within the viewport will be invalidated.
            //
            // This function is debounced so that the cursor is only checked when it is stable so
            // conpty's screen reprinting will not trigger decoration clearing.
            //
            // This is mostly a workaround for Windows but applies to all OS' because of the tsc watch
            // case.
            if (this._terminal.buffer.active === this._terminal.buffer.normal && this._currentCommand.commandStartMarker) {
                if (this._terminal.buffer.active.baseY + this._terminal.buffer.active.cursorY < this._currentCommand.commandStartMarker.line) {
                    this._clearCommandsInViewport();
                    this._currentCommand.isInvalid = true;
                    this._onCurrentCommandInvalidated.fire({ reason: "windows" /* CommandInvalidationReason.Windows */ });
                }
            }
        }
        _setupClearListeners() {
            // Setup listeners for when clear is run in the shell. Since we don't know immediately if
            // this is a Windows pty, listen to both routes and do the Windows check inside them
            // For a Windows backend we cannot listen to CSI J, instead we assume running clear or
            // cls will clear all commands in the viewport. This is not perfect but it's right most
            // of the time.
            this._register(this.onBeforeCommandFinished(command => {
                if (this._isWindowsPty) {
                    if (command.command.trim().toLowerCase() === 'clear' || command.command.trim().toLowerCase() === 'cls') {
                        this._clearCommandsInViewport();
                        this._currentCommand.isInvalid = true;
                        this._onCurrentCommandInvalidated.fire({ reason: "windows" /* CommandInvalidationReason.Windows */ });
                    }
                }
            }));
            // For non-Windows backends we can just listen to CSI J which is what the clear command
            // typically emits.
            this._terminal.parser.registerCsiHandler({ final: 'J' }, params => {
                if (!this._isWindowsPty) {
                    if (params.length >= 1 && (params[0] === 2 || params[0] === 3)) {
                        this._clearCommandsInViewport();
                    }
                }
                // We don't want to override xterm.js' default behavior, just augment it
                return false;
            });
        }
        _preHandleResizeWindows(e) {
            // Resize behavior is different under conpty; instead of bringing parts of the scrollback
            // back into the viewport, new lines are inserted at the bottom (ie. the same behavior as if
            // there was no scrollback).
            //
            // On resize this workaround will wait for a conpty reprint to occur by waiting for the
            // cursor to move, it will then calculate the number of lines that the commands within the
            // viewport _may have_ shifted. After verifying the content of the current line is
            // incorrect, the line after shifting is checked and if that matches delete events are fired
            // on the xterm.js buffer to move the markers.
            //
            // While a bit hacky, this approach is quite safe and seems to work great at least for pwsh.
            const baseY = this._terminal.buffer.active.baseY;
            const rowsDifference = e.rows - this._dimensions.rows;
            // Only do when rows increase, do in the next frame as this needs to happen after
            // conpty reprints the screen
            if (rowsDifference > 0) {
                this._waitForCursorMove().then(() => {
                    // Calculate the number of lines the content may have shifted, this will max out at
                    // scrollback count since the standard behavior will be used then
                    const potentialShiftedLineCount = Math.min(rowsDifference, baseY);
                    // For each command within the viewport, assume commands are in the correct order
                    for (let i = this.commands.length - 1; i >= 0; i--) {
                        const command = this.commands[i];
                        if (!command.marker || command.marker.line < baseY || command.commandStartLineContent === undefined) {
                            break;
                        }
                        const line = this._terminal.buffer.active.getLine(command.marker.line);
                        if (!line || line.translateToString(true) === command.commandStartLineContent) {
                            continue;
                        }
                        const shiftedY = command.marker.line - potentialShiftedLineCount;
                        const shiftedLine = this._terminal.buffer.active.getLine(shiftedY);
                        if (shiftedLine?.translateToString(true) !== command.commandStartLineContent) {
                            continue;
                        }
                        // HACK: xterm.js doesn't expose this by design as it's an internal core
                        // function an embedder could easily do damage with. Additionally, this
                        // can't really be upstreamed since the event relies on shell integration to
                        // verify the shifting is necessary.
                        this._terminal._core._bufferService.buffer.lines.onDeleteEmitter.fire({
                            index: this._terminal.buffer.active.baseY,
                            amount: potentialShiftedLineCount
                        });
                    }
                });
            }
        }
        _clearCommandsInViewport() {
            // Find the number of commands on the tail end of the array that are within the viewport
            let count = 0;
            for (let i = this._commands.length - 1; i >= 0; i--) {
                const line = this._commands[i].marker?.line;
                if (line && line < this._terminal.buffer.active.baseY) {
                    break;
                }
                count++;
            }
            // Remove them
            if (count > 0) {
                this._onCommandInvalidated.fire(this._commands.splice(this._commands.length - count, count));
            }
        }
        _waitForCursorMove() {
            const cursorX = this._terminal.buffer.active.cursorX;
            const cursorY = this._terminal.buffer.active.cursorY;
            let totalDelay = 0;
            return new Promise((resolve, reject) => {
                const interval = setInterval(() => {
                    if (cursorX !== this._terminal.buffer.active.cursorX || cursorY !== this._terminal.buffer.active.cursorY) {
                        resolve();
                        clearInterval(interval);
                        return;
                    }
                    totalDelay += 10;
                    if (totalDelay > 1000) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 10);
            });
        }
        setCwd(value) {
            this._cwd = value;
        }
        setIsWindowsPty(value) {
            this._isWindowsPty = value;
        }
        setIsCommandStorageDisabled() {
            this.__isCommandStorageDisabled = true;
        }
        getCwdForLine(line) {
            // Handle the current partial command first, anything below it's prompt is considered part
            // of the current command
            if (this._currentCommand.promptStartMarker && line >= this._currentCommand.promptStartMarker?.line) {
                return this._cwd;
            }
            // TODO: It would be more reliable to take the closest cwd above the line if it isn't found for the line
            // TODO: Use a reverse for loop to find the line to avoid creating another array
            const reversed = [...this._commands].reverse();
            return reversed.find(c => c.marker.line <= line - 1)?.cwd;
        }
        handlePromptStart(options) {
            this._currentCommand.promptStartMarker = options?.marker || this._terminal.registerMarker(0);
            this._logService.debug('CommandDetectionCapability#handlePromptStart', this._terminal.buffer.active.cursorX, this._currentCommand.promptStartMarker?.line);
        }
        handleContinuationStart() {
            this._currentCommand.currentContinuationMarker = this._terminal.registerMarker(0);
            this._logService.debug('CommandDetectionCapability#handleContinuationStart', this._currentCommand.currentContinuationMarker);
        }
        handleContinuationEnd() {
            if (!this._currentCommand.currentContinuationMarker) {
                this._logService.warn('CommandDetectionCapability#handleContinuationEnd Received continuation end without start');
                return;
            }
            if (!this._currentCommand.continuations) {
                this._currentCommand.continuations = [];
            }
            this._currentCommand.continuations.push({
                marker: this._currentCommand.currentContinuationMarker,
                end: this._terminal.buffer.active.cursorX
            });
            this._currentCommand.currentContinuationMarker = undefined;
            this._logService.debug('CommandDetectionCapability#handleContinuationEnd', this._currentCommand.continuations[this._currentCommand.continuations.length - 1]);
        }
        handleRightPromptStart() {
            this._currentCommand.commandRightPromptStartX = this._terminal.buffer.active.cursorX;
            this._logService.debug('CommandDetectionCapability#handleRightPromptStart', this._currentCommand.commandRightPromptStartX);
        }
        handleRightPromptEnd() {
            this._currentCommand.commandRightPromptEndX = this._terminal.buffer.active.cursorX;
            this._logService.debug('CommandDetectionCapability#handleRightPromptEnd', this._currentCommand.commandRightPromptEndX);
        }
        handleCommandStart(options) {
            this._handleCommandStartOptions = options;
            // Only update the column if the line has already been set
            this._currentCommand.commandStartMarker = options?.marker || this._currentCommand.commandStartMarker;
            if (this._currentCommand.commandStartMarker?.line === this._terminal.buffer.active.cursorY) {
                this._currentCommand.commandStartX = this._terminal.buffer.active.cursorX;
                this._logService.debug('CommandDetectionCapability#handleCommandStart', this._currentCommand.commandStartX, this._currentCommand.commandStartMarker?.line);
                return;
            }
            if (this._isWindowsPty) {
                this._handleCommandStartWindows();
                return;
            }
            this._currentCommand.commandStartX = this._terminal.buffer.active.cursorX;
            this._currentCommand.commandStartMarker = options?.marker || this._terminal.registerMarker(0);
            // Clear executed as it must happen after command start
            this._currentCommand.commandExecutedMarker?.dispose();
            this._currentCommand.commandExecutedMarker = undefined;
            this._currentCommand.commandExecutedX = undefined;
            for (const m of this._commandMarkers) {
                m.dispose();
            }
            this._commandMarkers.length = 0;
            this._onCommandStarted.fire({ marker: options?.marker || this._currentCommand.commandStartMarker, markProperties: options?.markProperties });
            this._logService.debug('CommandDetectionCapability#handleCommandStart', this._currentCommand.commandStartX, this._currentCommand.commandStartMarker?.line);
        }
        _handleCommandStartWindows() {
            this._currentCommand.commandStartX = this._terminal.buffer.active.cursorX;
            // On Windows track all cursor movements after the command start sequence
            this._commandMarkers.length = 0;
            // HACK: Fire command started on the following frame on Windows to allow the cursor
            // position to update as conpty often prints the sequence on a different line to the
            // actual line the command started on.
            (0, async_1.timeout)(0).then(() => {
                if (!this._currentCommand.commandExecutedMarker) {
                    this._onCursorMoveListener = this._terminal.onCursorMove(() => {
                        if (this._commandMarkers.length === 0 || this._commandMarkers[this._commandMarkers.length - 1].line !== this._terminal.buffer.active.cursorY) {
                            const marker = this._terminal.registerMarker(0);
                            if (marker) {
                                this._commandMarkers.push(marker);
                            }
                        }
                    });
                }
                this._currentCommand.commandStartMarker = this._terminal.registerMarker(0);
                if (this._currentCommand.commandStartMarker) {
                    const line = this._terminal.buffer.active.getLine(this._currentCommand.commandStartMarker.line);
                    if (line) {
                        this._currentCommand.commandStartLineContent = line.translateToString(true);
                    }
                }
                this._onCommandStarted.fire({ marker: this._currentCommand.commandStartMarker });
                this._logService.debug('CommandDetectionCapability#_handleCommandStartWindows', this._currentCommand.commandStartX, this._currentCommand.commandStartMarker?.line);
            });
        }
        handleGenericCommand(options) {
            if (options?.markProperties?.disableCommandStorage) {
                this.setIsCommandStorageDisabled();
            }
            this.handlePromptStart(options);
            this.handleCommandStart(options);
            this.handleCommandExecuted(options);
            this.handleCommandFinished(undefined, options);
        }
        handleCommandExecuted(options) {
            if (this._isWindowsPty) {
                this._handleCommandExecutedWindows();
                return;
            }
            this._currentCommand.commandExecutedMarker = options?.marker || this._terminal.registerMarker(0);
            this._currentCommand.commandExecutedX = this._terminal.buffer.active.cursorX;
            this._logService.debug('CommandDetectionCapability#handleCommandExecuted', this._currentCommand.commandExecutedX, this._currentCommand.commandExecutedMarker?.line);
            // Sanity check optional props
            if (!this._currentCommand.commandStartMarker || !this._currentCommand.commandExecutedMarker || this._currentCommand.commandStartX === undefined) {
                return;
            }
            // Calculate the command
            this._currentCommand.command = this.__isCommandStorageDisabled ? '' : this._terminal.buffer.active.getLine(this._currentCommand.commandStartMarker.line)?.translateToString(true, this._currentCommand.commandStartX, this._currentCommand.commandRightPromptStartX).trim();
            let y = this._currentCommand.commandStartMarker.line + 1;
            const commandExecutedLine = this._currentCommand.commandExecutedMarker.line;
            for (; y < commandExecutedLine; y++) {
                const line = this._terminal.buffer.active.getLine(y);
                if (line) {
                    const continuation = this._currentCommand.continuations?.find(e => e.marker.line === y);
                    if (continuation) {
                        this._currentCommand.command += '\n';
                    }
                    const startColumn = continuation?.end ?? 0;
                    this._currentCommand.command += line.translateToString(true, startColumn);
                }
            }
            if (y === commandExecutedLine) {
                this._currentCommand.command += this._terminal.buffer.active.getLine(commandExecutedLine)?.translateToString(true, undefined, this._currentCommand.commandExecutedX) || '';
            }
            this._onCommandExecuted.fire();
        }
        _handleCommandExecutedWindows() {
            // On Windows, use the gathered cursor move markers to correct the command start and
            // executed markers
            this._onCursorMoveListener?.dispose();
            this._onCursorMoveListener = undefined;
            this._evaluateCommandMarkersWindows();
            this._currentCommand.commandExecutedX = this._terminal.buffer.active.cursorX;
            this._onCommandExecuted.fire();
            this._logService.debug('CommandDetectionCapability#handleCommandExecuted', this._currentCommand.commandExecutedX, this._currentCommand.commandExecutedMarker?.line);
        }
        invalidateCurrentCommand(request) {
            this._currentCommand.isInvalid = true;
            this._onCurrentCommandInvalidated.fire(request);
        }
        handleCommandFinished(exitCode, options) {
            if (this._isWindowsPty) {
                this._preHandleCommandFinishedWindows();
            }
            this._currentCommand.commandFinishedMarker = options?.marker || this._terminal.registerMarker(0);
            let command = this._currentCommand.command;
            this._logService.debug('CommandDetectionCapability#handleCommandFinished', this._terminal.buffer.active.cursorX, this._currentCommand.commandFinishedMarker?.line, this._currentCommand.command, this._currentCommand);
            this._exitCode = exitCode;
            // HACK: Handle a special case on some versions of bash where identical commands get merged
            // in the output of `history`, this detects that case and sets the exit code to the the last
            // command's exit code. This covered the majority of cases but will fail if the same command
            // runs with a different exit code, that will need a more robust fix where we send the
            // command ID and exit code over to the capability to adjust there.
            if (this._exitCode === undefined) {
                const lastCommand = this.commands.length > 0 ? this.commands[this.commands.length - 1] : undefined;
                if (command && command.length > 0 && lastCommand?.command === command) {
                    this._exitCode = lastCommand.exitCode;
                }
            }
            if (this._currentCommand.commandStartMarker === undefined || !this._terminal.buffer.active) {
                return;
            }
            // When the command finishes and executed never fires the placeholder selector should be used.
            if (this._exitCode === undefined && command === undefined) {
                command = '';
            }
            if ((command !== undefined && !command.startsWith('\\')) || this._handleCommandStartOptions?.ignoreCommandLine) {
                const buffer = this._terminal.buffer.active;
                const timestamp = Date.now();
                const executedMarker = this._currentCommand.commandExecutedMarker;
                const endMarker = this._currentCommand.commandFinishedMarker;
                const newCommand = {
                    command: this._handleCommandStartOptions?.ignoreCommandLine ? '' : (command || ''),
                    isTrusted: !!this._currentCommand.isTrusted,
                    marker: this._currentCommand.commandStartMarker,
                    endMarker,
                    executedMarker,
                    timestamp,
                    cwd: this._cwd,
                    exitCode: this._exitCode,
                    commandStartLineContent: this._currentCommand.commandStartLineContent,
                    hasOutput: () => !executedMarker?.isDisposed && !endMarker?.isDisposed && !!(executedMarker && endMarker && executedMarker?.line < endMarker.line),
                    getOutput: () => getOutputForCommand(executedMarker, endMarker, buffer),
                    getOutputMatch: (outputMatcher) => getOutputMatchForCommand(this._isWindowsPty && (executedMarker?.line === endMarker?.line) ? this._currentCommand.commandStartMarker : executedMarker, endMarker, buffer, this._terminal.cols, outputMatcher),
                    markProperties: options?.markProperties
                };
                this._commands.push(newCommand);
                this._logService.debug('CommandDetectionCapability#onCommandFinished', newCommand);
                this._onBeforeCommandFinished.fire(newCommand);
                if (!this._currentCommand.isInvalid) {
                    this._onCommandFinished.fire(newCommand);
                }
            }
            this._currentCommand.previousCommandMarker = this._currentCommand.commandStartMarker;
            this._currentCommand = {};
            this._handleCommandStartOptions = undefined;
        }
        _preHandleCommandFinishedWindows() {
            if (this._currentCommand.commandExecutedMarker) {
                return;
            }
            // This is done on command finished just in case command executed never happens (for example
            // PSReadLine tab completion)
            if (this._commandMarkers.length === 0) {
                // If the command start timeout doesn't happen before command finished, just use the
                // current marker.
                if (!this._currentCommand.commandStartMarker) {
                    this._currentCommand.commandStartMarker = this._terminal.registerMarker(0);
                }
                if (this._currentCommand.commandStartMarker) {
                    this._commandMarkers.push(this._currentCommand.commandStartMarker);
                }
            }
            this._evaluateCommandMarkersWindows();
        }
        _evaluateCommandMarkersWindows() {
            // On Windows, use the gathered cursor move markers to correct the command start and
            // executed markers.
            if (this._commandMarkers.length === 0) {
                return;
            }
            this._commandMarkers = this._commandMarkers.sort((a, b) => a.line - b.line);
            this._currentCommand.commandStartMarker = this._commandMarkers[0];
            if (this._currentCommand.commandStartMarker) {
                const line = this._terminal.buffer.active.getLine(this._currentCommand.commandStartMarker.line);
                if (line) {
                    this._currentCommand.commandStartLineContent = line.translateToString(true);
                }
            }
            this._currentCommand.commandExecutedMarker = this._commandMarkers[this._commandMarkers.length - 1];
        }
        setCommandLine(commandLine, isTrusted) {
            this._logService.debug('CommandDetectionCapability#setCommandLine', commandLine, isTrusted);
            this._currentCommand.command = commandLine;
            this._currentCommand.isTrusted = isTrusted;
        }
        serialize() {
            const commands = this.commands.map(e => {
                return {
                    startLine: e.marker?.line,
                    startX: undefined,
                    endLine: e.endMarker?.line,
                    executedLine: e.executedMarker?.line,
                    command: this.__isCommandStorageDisabled ? '' : e.command,
                    isTrusted: e.isTrusted,
                    cwd: e.cwd,
                    exitCode: e.exitCode,
                    commandStartLineContent: e.commandStartLineContent,
                    timestamp: e.timestamp,
                    markProperties: e.markProperties,
                    aliases: e.aliases
                };
            });
            if (this._currentCommand.commandStartMarker) {
                commands.push({
                    startLine: this._currentCommand.commandStartMarker.line,
                    startX: this._currentCommand.commandStartX,
                    endLine: undefined,
                    executedLine: undefined,
                    command: '',
                    isTrusted: true,
                    cwd: this._cwd,
                    exitCode: undefined,
                    commandStartLineContent: undefined,
                    timestamp: 0,
                    markProperties: undefined
                });
            }
            return {
                isWindowsPty: this._isWindowsPty,
                commands
            };
        }
        deserialize(serialized) {
            if (serialized.isWindowsPty) {
                this.setIsWindowsPty(serialized.isWindowsPty);
            }
            const buffer = this._terminal.buffer.normal;
            for (const e of serialized.commands) {
                const marker = e.startLine !== undefined ? this._terminal.registerMarker(e.startLine - (buffer.baseY + buffer.cursorY)) : undefined;
                // Check for invalid command
                if (!marker) {
                    continue;
                }
                // Partial command
                if (!e.endLine) {
                    this._currentCommand.commandStartMarker = marker;
                    this._currentCommand.commandStartX = e.startX;
                    this._cwd = e.cwd;
                    this._onCommandStarted.fire({ marker });
                    continue;
                }
                // Full command
                const endMarker = e.endLine !== undefined ? this._terminal.registerMarker(e.endLine - (buffer.baseY + buffer.cursorY)) : undefined;
                const executedMarker = e.executedLine !== undefined ? this._terminal.registerMarker(e.executedLine - (buffer.baseY + buffer.cursorY)) : undefined;
                const newCommand = {
                    command: this.__isCommandStorageDisabled ? '' : e.command,
                    isTrusted: e.isTrusted,
                    marker,
                    endMarker,
                    executedMarker,
                    timestamp: e.timestamp,
                    cwd: e.cwd,
                    commandStartLineContent: e.commandStartLineContent,
                    exitCode: e.exitCode,
                    hasOutput: () => !executedMarker?.isDisposed && !endMarker?.isDisposed && !!(executedMarker && endMarker && executedMarker.line < endMarker.line),
                    getOutput: () => getOutputForCommand(executedMarker, endMarker, buffer),
                    getOutputMatch: (outputMatcher) => getOutputMatchForCommand(this._isWindowsPty && (executedMarker?.line === endMarker?.line) ? marker : executedMarker, endMarker, buffer, this._terminal.cols, outputMatcher),
                    markProperties: e.markProperties,
                    wasReplayed: true
                };
                this._commands.push(newCommand);
                this._logService.debug('CommandDetectionCapability#onCommandFinished', newCommand);
                this._onCommandFinished.fire(newCommand);
            }
        }
    }
    exports.CommandDetectionCapability = CommandDetectionCapability;
    __decorate([
        (0, decorators_1.debounce)(500)
    ], CommandDetectionCapability.prototype, "_handleCursorMove", null);
    function getOutputForCommand(executedMarker, endMarker, buffer) {
        if (!executedMarker || !endMarker) {
            return undefined;
        }
        const startLine = executedMarker.line;
        const endLine = endMarker.line;
        if (startLine === endLine) {
            return undefined;
        }
        let output = '';
        let line;
        for (let i = startLine; i < endLine; i++) {
            line = buffer.getLine(i);
            if (!line) {
                continue;
            }
            output += line.translateToString(!line.isWrapped) + (line.isWrapped ? '' : '\n');
        }
        return output === '' ? undefined : output;
    }
    function getOutputMatchForCommand(executedMarker, endMarker, buffer, cols, outputMatcher) {
        if (!executedMarker || !endMarker) {
            return undefined;
        }
        const endLine = endMarker.line;
        if (endLine === -1) {
            return undefined;
        }
        const startLine = Math.max(executedMarker.line, 0);
        const matcher = outputMatcher.lineMatcher;
        const linesToCheck = typeof matcher === 'string' ? 1 : outputMatcher.length || countNewLines(matcher);
        const lines = [];
        let match;
        if (outputMatcher.anchor === 'bottom') {
            for (let i = endLine - (outputMatcher.offset || 0); i >= startLine; i--) {
                let wrappedLineStart = i;
                const wrappedLineEnd = i;
                while (wrappedLineStart >= startLine && buffer.getLine(wrappedLineStart)?.isWrapped) {
                    wrappedLineStart--;
                }
                i = wrappedLineStart;
                lines.unshift(getXtermLineContent(buffer, wrappedLineStart, wrappedLineEnd, cols));
                if (!match) {
                    match = lines[0].match(matcher);
                }
                if (lines.length >= linesToCheck) {
                    break;
                }
            }
        }
        else {
            for (let i = startLine + (outputMatcher.offset || 0); i < endLine; i++) {
                const wrappedLineStart = i;
                let wrappedLineEnd = i;
                while (wrappedLineEnd + 1 < endLine && buffer.getLine(wrappedLineEnd + 1)?.isWrapped) {
                    wrappedLineEnd++;
                }
                i = wrappedLineEnd;
                lines.push(getXtermLineContent(buffer, wrappedLineStart, wrappedLineEnd, cols));
                if (!match) {
                    match = lines[lines.length - 1].match(matcher);
                }
                if (lines.length >= linesToCheck) {
                    break;
                }
            }
        }
        return match ? { regexMatch: match, outputLines: lines } : undefined;
    }
    function getLinesForCommand(buffer, command, cols, outputMatcher) {
        if (!outputMatcher) {
            return undefined;
        }
        const executedMarker = command.executedMarker;
        const endMarker = command.endMarker;
        if (!executedMarker || !endMarker) {
            return undefined;
        }
        const startLine = executedMarker.line;
        const endLine = endMarker.line;
        const linesToCheck = outputMatcher.length;
        const lines = [];
        if (outputMatcher.anchor === 'bottom') {
            for (let i = endLine - (outputMatcher.offset || 0); i >= startLine; i--) {
                let wrappedLineStart = i;
                const wrappedLineEnd = i;
                while (wrappedLineStart >= startLine && buffer.getLine(wrappedLineStart)?.isWrapped) {
                    wrappedLineStart--;
                }
                i = wrappedLineStart;
                lines.unshift(getXtermLineContent(buffer, wrappedLineStart, wrappedLineEnd, cols));
                if (lines.length > linesToCheck) {
                    lines.pop();
                }
            }
        }
        else {
            for (let i = startLine + (outputMatcher.offset || 0); i < endLine; i++) {
                const wrappedLineStart = i;
                let wrappedLineEnd = i;
                while (wrappedLineEnd + 1 < endLine && buffer.getLine(wrappedLineEnd + 1)?.isWrapped) {
                    wrappedLineEnd++;
                }
                i = wrappedLineEnd;
                lines.push(getXtermLineContent(buffer, wrappedLineStart, wrappedLineEnd, cols));
                if (lines.length === linesToCheck) {
                    lines.shift();
                }
            }
        }
        return lines;
    }
    exports.getLinesForCommand = getLinesForCommand;
    function getXtermLineContent(buffer, lineStart, lineEnd, cols) {
        // Cap the maximum number of lines generated to prevent potential performance problems. This is
        // more of a sanity check as the wrapped line should already be trimmed down at this point.
        const maxLineLength = Math.max(2048 / cols * 2);
        lineEnd = Math.min(lineEnd, lineStart + maxLineLength);
        let content = '';
        for (let i = lineStart; i <= lineEnd; i++) {
            // Make sure only 0 to cols are considered as resizing when windows mode is enabled will
            // retain buffer data outside of the terminal width as reflow is disabled.
            const line = buffer.getLine(i);
            if (line) {
                content += line.translateToString(true, 0, cols);
            }
        }
        return content;
    }
    function countNewLines(regex) {
        if (!regex.multiline) {
            return 1;
        }
        const source = regex.source;
        let count = 1;
        let i = source.indexOf('\\n');
        while (i !== -1) {
            count++;
            i = source.indexOf('\\n', i + 1);
        }
        return count;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZERldGVjdGlvbkNhcGFiaWxpdHkuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS90ZXJtaW5hbC9jb21tb24vY2FwYWJpbGl0aWVzL2NvbW1hbmREZXRlY3Rpb25DYXBhYmlsaXR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7OztJQXVEaEcsTUFBYSwwQkFBMkIsU0FBUSxzQkFBVTtRQWN6RCxJQUFJLFFBQVEsS0FBa0MsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUN0RSxJQUFJLGdCQUFnQixLQUF5QixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUNuRix3RUFBd0U7UUFDeEUsSUFBSSxzQkFBc0I7WUFDekIsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLGtCQUFrQixFQUFFO2dCQUM1QyxPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsa0JBQWtCLEVBQXNCLENBQUM7YUFDL0U7WUFDRCxPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBQ0QsSUFBSSxjQUFjO1lBQ2pCLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQztRQUM3QixDQUFDO1FBQ0QsSUFBSSxHQUFHLEtBQXlCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbkQsSUFBWSxZQUFZO1lBQ3ZCLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxrQkFBa0IsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUNuRyxDQUFDO1FBRUQsSUFBSSxRQUFRO1lBQ1gsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLGtCQUFrQixFQUFFO2dCQUNwRSxPQUFP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