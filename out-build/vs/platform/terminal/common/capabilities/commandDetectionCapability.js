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
    exports.$Uq = exports.$Tq = void 0;
    class $Tq extends lifecycle_1.$kc {
        get commands() { return this.f; }
        get executingCommand() { return this.j.command; }
        // TODO: as is unsafe here and it duplicates behavor of executingCommand
        get executingCommandObject() {
            if (this.j.commandStartMarker) {
                return { marker: this.j.commandStartMarker };
            }
            return undefined;
        }
        get currentCommand() {
            return this.j;
        }
        get cwd() { return this.h; }
        get z() {
            return !!(this.j.commandStartMarker && !this.j.commandExecutedMarker);
        }
        get hasInput() {
            if (!this.z || !this.j?.commandStartMarker) {
                return undefined;
            }
            if (this.J.buffer.active.baseY + this.J.buffer.active.cursorY === this.j.commandStartMarker?.line) {
                const line = this.J.buffer.active.getLine(this.J.buffer.active.cursorY)?.translateToString(true, this.j.commandStartX);
                if (line === undefined) {
                    return undefined;
                }
                return line.length > 0;
            }
            return true;
        }
        constructor(J, L) {
            super();
            this.J = J;
            this.L = L;
            this.type = 2 /* TerminalCapability.CommandDetection */;
            this.f = [];
            this.j = {};
            this.n = false;
            this.s = [];
            this.u = false;
            this.C = this.B(new event_1.$fd());
            this.onCommandStarted = this.C.event;
            this.D = this.B(new event_1.$fd());
            this.onBeforeCommandFinished = this.D.event;
            this.F = this.B(new event_1.$fd());
            this.onCommandFinished = this.F.event;
            this.G = this.B(new event_1.$fd());
            this.onCommandExecuted = this.G.event;
            this.H = this.B(new event_1.$fd());
            this.onCommandInvalidated = this.H.event;
            this.I = this.B(new event_1.$fd());
            this.onCurrentCommandInvalidated = this.I.event;
            this.t = {
                cols: this.J.cols,
                rows: this.J.rows
            };
            this.B(this.J.onResize(e => this.M(e)));
            this.B(this.J.onCursorMove(() => this.N()));
            this.O();
        }
        M(e) {
            if (this.n) {
                this.P(e);
            }
            this.t.cols = e.cols;
            this.t.rows = e.rows;
        }
        N() {
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
            if (this.J.buffer.active === this.J.buffer.normal && this.j.commandStartMarker) {
                if (this.J.buffer.active.baseY + this.J.buffer.active.cursorY < this.j.commandStartMarker.line) {
                    this.Q();
                    this.j.isInvalid = true;
                    this.I.fire({ reason: "windows" /* CommandInvalidationReason.Windows */ });
                }
            }
        }
        O() {
            // Setup listeners for when clear is run in the shell. Since we don't know immediately if
            // this is a Windows pty, listen to both routes and do the Windows check inside them
            // For a Windows backend we cannot listen to CSI J, instead we assume running clear or
            // cls will clear all commands in the viewport. This is not perfect but it's right most
            // of the time.
            this.B(this.onBeforeCommandFinished(command => {
                if (this.n) {
                    if (command.command.trim().toLowerCase() === 'clear' || command.command.trim().toLowerCase() === 'cls') {
                        this.Q();
                        this.j.isInvalid = true;
                        this.I.fire({ reason: "windows" /* CommandInvalidationReason.Windows */ });
                    }
                }
            }));
            // For non-Windows backends we can just listen to CSI J which is what the clear command
            // typically emits.
            this.J.parser.registerCsiHandler({ final: 'J' }, params => {
                if (!this.n) {
                    if (params.length >= 1 && (params[0] === 2 || params[0] === 3)) {
                        this.Q();
                    }
                }
                // We don't want to override xterm.js' default behavior, just augment it
                return false;
            });
        }
        P(e) {
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
            const baseY = this.J.buffer.active.baseY;
            const rowsDifference = e.rows - this.t.rows;
            // Only do when rows increase, do in the next frame as this needs to happen after
            // conpty reprints the screen
            if (rowsDifference > 0) {
                this.R().then(() => {
                    // Calculate the number of lines the content may have shifted, this will max out at
                    // scrollback count since the standard behavior will be used then
                    const potentialShiftedLineCount = Math.min(rowsDifference, baseY);
                    // For each command within the viewport, assume commands are in the correct order
                    for (let i = this.commands.length - 1; i >= 0; i--) {
                        const command = this.commands[i];
                        if (!command.marker || command.marker.line < baseY || command.commandStartLineContent === undefined) {
                            break;
                        }
                        const line = this.J.buffer.active.getLine(command.marker.line);
                        if (!line || line.translateToString(true) === command.commandStartLineContent) {
                            continue;
                        }
                        const shiftedY = command.marker.line - potentialShiftedLineCount;
                        const shiftedLine = this.J.buffer.active.getLine(shiftedY);
                        if (shiftedLine?.translateToString(true) !== command.commandStartLineContent) {
                            continue;
                        }
                        // HACK: xterm.js doesn't expose this by design as it's an internal core
                        // function an embedder could easily do damage with. Additionally, this
                        // can't really be upstreamed since the event relies on shell integration to
                        // verify the shifting is necessary.
                        this.J._core._bufferService.buffer.lines.onDeleteEmitter.fire({
                            index: this.J.buffer.active.baseY,
                            amount: potentialShiftedLineCount
                        });
                    }
                });
            }
        }
        Q() {
            // Find the number of commands on the tail end of the array that are within the viewport
            let count = 0;
            for (let i = this.f.length - 1; i >= 0; i--) {
                const line = this.f[i].marker?.line;
                if (line && line < this.J.buffer.active.baseY) {
                    break;
                }
                count++;
            }
            // Remove them
            if (count > 0) {
                this.H.fire(this.f.splice(this.f.length - count, count));
            }
        }
        R() {
            const cursorX = this.J.buffer.active.cursorX;
            const cursorY = this.J.buffer.active.cursorY;
            let totalDelay = 0;
            return new Promise((resolve, reject) => {
                const interval = setInterval(() => {
                    if (cursorX !== this.J.buffer.active.cursorX || cursorY !== this.J.buffer.active.cursorY) {
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
            this.h = value;
        }
        setIsWindowsPty(value) {
            this.n = value;
        }
        setIsCommandStorageDisabled() {
            this.u = true;
        }
        getCwdForLine(line) {
            // Handle the current partial command first, anything below it's prompt is considered part
            // of the current command
            if (this.j.promptStartMarker && line >= this.j.promptStartMarker?.line) {
                return this.h;
            }
            // TODO: It would be more reliable to take the closest cwd above the line if it isn't found for the line
            // TODO: Use a reverse for loop to find the line to avoid creating another array
            const reversed = [...this.f].reverse();
            return reversed.find(c => c.marker.line <= line - 1)?.cwd;
        }
        handlePromptStart(options) {
            this.j.promptStartMarker = options?.marker || this.J.registerMarker(0);
            this.L.debug('CommandDetectionCapability#handlePromptStart', this.J.buffer.active.cursorX, this.j.promptStartMarker?.line);
        }
        handleContinuationStart() {
            this.j.currentContinuationMarker = this.J.registerMarker(0);
            this.L.debug('CommandDetectionCapability#handleContinuationStart', this.j.currentContinuationMarker);
        }
        handleContinuationEnd() {
            if (!this.j.currentContinuationMarker) {
                this.L.warn('CommandDetectionCapability#handleContinuationEnd Received continuation end without start');
                return;
            }
            if (!this.j.continuations) {
                this.j.continuations = [];
            }
            this.j.continuations.push({
                marker: this.j.currentContinuationMarker,
                end: this.J.buffer.active.cursorX
            });
            this.j.currentContinuationMarker = undefined;
            this.L.debug('CommandDetectionCapability#handleContinuationEnd', this.j.continuations[this.j.continuations.length - 1]);
        }
        handleRightPromptStart() {
            this.j.commandRightPromptStartX = this.J.buffer.active.cursorX;
            this.L.debug('CommandDetectionCapability#handleRightPromptStart', this.j.commandRightPromptStartX);
        }
        handleRightPromptEnd() {
            this.j.commandRightPromptEndX = this.J.buffer.active.cursorX;
            this.L.debug('CommandDetectionCapability#handleRightPromptEnd', this.j.commandRightPromptEndX);
        }
        handleCommandStart(options) {
            this.w = options;
            // Only update the column if the line has already been set
            this.j.commandStartMarker = options?.marker || this.j.commandStartMarker;
            if (this.j.commandStartMarker?.line === this.J.buffer.active.cursorY) {
                this.j.commandStartX = this.J.buffer.active.cursorX;
                this.L.debug('CommandDetectionCapability#handleCommandStart', this.j.commandStartX, this.j.commandStartMarker?.line);
                return;
            }
            if (this.n) {
                this.S();
                return;
            }
            this.j.commandStartX = this.J.buffer.active.cursorX;
            this.j.commandStartMarker = options?.marker || this.J.registerMarker(0);
            // Clear executed as it must happen after command start
            this.j.commandExecutedMarker?.dispose();
            this.j.commandExecutedMarker = undefined;
            this.j.commandExecutedX = undefined;
            for (const m of this.s) {
                m.dispose();
            }
            this.s.length = 0;
            this.C.fire({ marker: options?.marker || this.j.commandStartMarker, markProperties: options?.markProperties });
            this.L.debug('CommandDetectionCapability#handleCommandStart', this.j.commandStartX, this.j.commandStartMarker?.line);
        }
        S() {
            this.j.commandStartX = this.J.buffer.active.cursorX;
            // On Windows track all cursor movements after the command start sequence
            this.s.length = 0;
            // HACK: Fire command started on the following frame on Windows to allow the cursor
            // position to update as conpty often prints the sequence on a different line to the
            // actual line the command started on.
            (0, async_1.$Hg)(0).then(() => {
                if (!this.j.commandExecutedMarker) {
                    this.r = this.J.onCursorMove(() => {
                        if (this.s.length === 0 || this.s[this.s.length - 1].line !== this.J.buffer.active.cursorY) {
                            const marker = this.J.registerMarker(0);
                            if (marker) {
                                this.s.push(marker);
                            }
                        }
                    });
                }
                this.j.commandStartMarker = this.J.registerMarker(0);
                if (this.j.commandStartMarker) {
                    const line = this.J.buffer.active.getLine(this.j.commandStartMarker.line);
                    if (line) {
                        this.j.commandStartLineContent = line.translateToString(true);
                    }
                }
                this.C.fire({ marker: this.j.commandStartMarker });
                this.L.debug('CommandDetectionCapability#_handleCommandStartWindows', this.j.commandStartX, this.j.commandStartMarker?.line);
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
            if (this.n) {
                this.U();
                return;
            }
            this.j.commandExecutedMarker = options?.marker || this.J.registerMarker(0);
            this.j.commandExecutedX = this.J.buffer.active.cursorX;
            this.L.debug('CommandDetectionCapability#handleCommandExecuted', this.j.commandExecutedX, this.j.commandExecutedMarker?.line);
            // Sanity check optional props
            if (!this.j.commandStartMarker || !this.j.commandExecutedMarker || this.j.commandStartX === undefined) {
                return;
            }
            // Calculate the command
            this.j.command = this.u ? '' : this.J.buffer.active.getLine(this.j.commandStartMarker.line)?.translateToString(true, this.j.commandStartX, this.j.commandRightPromptStartX).trim();
            let y = this.j.commandStartMarker.line + 1;
            const commandExecutedLine = this.j.commandExecutedMarker.line;
            for (; y < commandExecutedLine; y++) {
                const line = this.J.buffer.active.getLine(y);
                if (line) {
                    const continuation = this.j.continuations?.find(e => e.marker.line === y);
                    if (continuation) {
                        this.j.command += '\n';
                    }
                    const startColumn = continuation?.end ?? 0;
                    this.j.command += line.translateToString(true, startColumn);
                }
            }
            if (y === commandExecutedLine) {
                this.j.command += this.J.buffer.active.getLine(commandExecutedLine)?.translateToString(true, undefined, this.j.commandExecutedX) || '';
            }
            this.G.fire();
        }
        U() {
            // On Windows, use the gathered cursor move markers to correct the command start and
            // executed markers
            this.r?.dispose();
            this.r = undefined;
            this.X();
            this.j.commandExecutedX = this.J.buffer.active.cursorX;
            this.G.fire();
            this.L.debug('CommandDetectionCapability#handleCommandExecuted', this.j.commandExecutedX, this.j.commandExecutedMarker?.line);
        }
        invalidateCurrentCommand(request) {
            this.j.isInvalid = true;
            this.I.fire(request);
        }
        handleCommandFinished(exitCode, options) {
            if (this.n) {
                this.W();
            }
            this.j.commandFinishedMarker = options?.marker || this.J.registerMarker(0);
            let command = this.j.command;
            this.L.debug('CommandDetectionCapability#handleCommandFinished', this.J.buffer.active.cursorX, this.j.commandFinishedMarker?.line, this.j.command, this.j);
            this.g = exitCode;
            // HACK: Handle a special case on some versions of bash where identical commands get merged
            // in the output of `history`, this detects that case and sets the exit code to the the last
            // command's exit code. This covered the majority of cases but will fail if the same command
            // runs with a different exit code, that will need a more robust fix where we send the
            // command ID and exit code over to the capability to adjust there.
            if (this.g === undefined) {
                const lastCommand = this.commands.length > 0 ? this.commands[this.commands.length - 1] : undefined;
                if (command && command.length > 0 && lastCommand?.command === command) {
                    this.g = lastCommand.exitCode;
                }
            }
            if (this.j.commandStartMarker === undefined || !this.J.buffer.active) {
                return;
            }
            // When the command finishes and executed never fires the placeholder selector should be used.
            if (this.g === undefined && command === undefined) {
                command = '';
            }
            if ((command !== undefined && !command.startsWith('\\')) || this.w?.ignoreCommandLine) {
                const buffer = this.J.buffer.active;
                const timestamp = Date.now();
                const executedMarker = this.j.commandExecutedMarker;
                const endMarker = this.j.commandFinishedMarker;
                const newCommand = {
                    command: this.w?.ignoreCommandLine ? '' : (command || ''),
                    isTrusted: !!this.j.isTrusted,
                    marker: this.j.commandStartMarker,
                    endMarker,
                    executedMarker,
                    timestamp,
                    cwd: this.h,
                    exitCode: this.g,
                    commandStartLineContent: this.j.commandStartLineContent,
                    hasOutput: () => !executedMarker?.isDisposed && !endMarker?.isDisposed && !!(executedMarker && endMarker && executedMarker?.line < endMarker.line),
                    getOutput: () => getOutputForCommand(executedMarker, endMarker, buffer),
                    getOutputMatch: (outputMatcher) => getOutputMatchForCommand(this.n && (executedMarker?.line === endMarker?.line) ? this.j.commandStartMarker : executedMarker, endMarker, buffer, this.J.cols, outputMatcher),
                    markProperties: options?.markProperties
                };
                this.f.push(newCommand);
                this.L.debug('CommandDetectionCapability#onCommandFinished', newCommand);
                this.D.fire(newCommand);
                if (!this.j.isInvalid) {
                    this.F.fire(newCommand);
                }
            }
            this.j.previousCommandMarker = this.j.commandStartMarker;
            this.j = {};
            this.w = undefined;
        }
        W() {
            if (this.j.commandExecutedMarker) {
                return;
            }
            // This is done on command finished just in case command executed never happens (for example
            // PSReadLine tab completion)
            if (this.s.length === 0) {
                // If the command start timeout doesn't happen before command finished, just use the
                // current marker.
                if (!this.j.commandStartMarker) {
                    this.j.commandStartMarker = this.J.registerMarker(0);
                }
                if (this.j.commandStartMarker) {
                    this.s.push(this.j.commandStartMarker);
                }
            }
            this.X();
        }
        X() {
            // On Windows, use the gathered cursor move markers to correct the command start and
            // executed markers.
            if (this.s.length === 0) {
                return;
            }
            this.s = this.s.sort((a, b) => a.line - b.line);
            this.j.commandStartMarker = this.s[0];
            if (this.j.commandStartMarker) {
                const line = this.J.buffer.active.getLine(this.j.commandStartMarker.line);
                if (line) {
                    this.j.commandStartLineContent = line.translateToString(true);
                }
            }
            this.j.commandExecutedMarker = this.s[this.s.length - 1];
        }
        setCommandLine(commandLine, isTrusted) {
            this.L.debug('CommandDetectionCapability#setCommandLine', commandLine, isTrusted);
            this.j.command = commandLine;
            this.j.isTrusted = isTrusted;
        }
        serialize() {
            const commands = this.commands.map(e => {
                return {
                    startLine: e.marker?.line,
                    startX: undefined,
                    endLine: e.endMarker?.line,
                    executedLine: e.executedMarker?.line,
                    command: this.u ? '' : e.command,
                    isTrusted: e.isTrusted,
                    cwd: e.cwd,
                    exitCode: e.exitCode,
                    commandStartLineContent: e.commandStartLineContent,
                    timestamp: e.timestamp,
                    markProperties: e.markProperties,
                    aliases: e.aliases
                };
            });
            if (this.j.commandStartMarker) {
                commands.push({
                    startLine: this.j.commandStartMarker.line,
                    startX: this.j.commandStartX,
                    endLine: undefined,
                    executedLine: undefined,
                    command: '',
                    isTrusted: true,
                    cwd: this.h,
                    exitCode: undefined,
                    commandStartLineContent: undefined,
                    timestamp: 0,
                    markProperties: undefined
                });
            }
            return {
                isWindowsPty: this.n,
                commands
            };
        }
        deserialize(serialized) {
            if (serialized.isWindowsPty) {
                this.setIsWindowsPty(serialized.isWindowsPty);
            }
            const buffer = this.J.buffer.normal;
            for (const e of serialized.commands) {
                const marker = e.startLine !== undefined ? this.J.registerMarker(e.startLine - (buffer.baseY + buffer.cursorY)) : undefined;
                // Check for invalid command
                if (!marker) {
                    continue;
                }
                // Partial command
                if (!e.endLine) {
                    this.j.commandStartMarker = marker;
                    this.j.commandStartX = e.startX;
                    this.h = e.cwd;
                    this.C.fire({ marker });
                    continue;
                }
                // Full command
                const endMarker = e.endLine !== undefined ? this.J.registerMarker(e.endLine - (buffer.baseY + buffer.cursorY)) : undefined;
                const executedMarker = e.executedLine !== undefined ? this.J.registerMarker(e.executedLine - (buffer.baseY + buffer.cursorY)) : undefined;
                const newCommand = {
                    command: this.u ? '' : e.command,
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
                    getOutputMatch: (outputMatcher) => getOutputMatchForCommand(this.n && (executedMarker?.line === endMarker?.line) ? marker : executedMarker, endMarker, buffer, this.J.cols, outputMatcher),
                    markProperties: e.markProperties,
                    wasReplayed: true
                };
                this.f.push(newCommand);
                this.L.debug('CommandDetectionCapability#onCommandFinished', newCommand);
                this.F.fire(newCommand);
            }
        }
    }
    exports.$Tq = $Tq;
    __decorate([
        (0, decorators_1.$7g)(500)
    ], $Tq.prototype, "N", null);
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
    function $Uq(buffer, command, cols, outputMatcher) {
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
    exports.$Uq = $Uq;
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
//# sourceMappingURL=commandDetectionCapability.js.map