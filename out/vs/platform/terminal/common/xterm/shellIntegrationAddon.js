/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/terminal/common/capabilities/terminalCapabilityStore", "vs/platform/terminal/common/capabilities/commandDetectionCapability", "vs/platform/terminal/common/capabilities/cwdDetectionCapability", "vs/platform/terminal/common/capabilities/partialCommandDetectionCapability", "vs/base/common/event", "vs/platform/terminal/common/capabilities/bufferMarkCapability", "vs/base/common/uri", "vs/platform/terminal/common/terminalEnvironment"], function (require, exports, lifecycle_1, terminalCapabilityStore_1, commandDetectionCapability_1, cwdDetectionCapability_1, partialCommandDetectionCapability_1, event_1, bufferMarkCapability_1, uri_1, terminalEnvironment_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseMarkSequence = exports.parseKeyValueAssignment = exports.deserializeMessage = exports.ShellIntegrationAddon = void 0;
    /**
     * Shell integration is a feature that enhances the terminal's understanding of what's happening
     * in the shell by injecting special sequences into the shell's prompt using the "Set Text
     * Parameters" sequence (`OSC Ps ; Pt ST`).
     *
     * Definitions:
     * - OSC: `\x1b]`
     * - Ps:  A single (usually optional) numeric parameter, composed of one or more digits.
     * - Pt:  A text parameter composed of printable characters.
     * - ST: `\x7`
     *
     * This is inspired by a feature of the same name in the FinalTerm, iTerm2 and kitty terminals.
     */
    /**
     * The identifier for the first numeric parameter (`Ps`) for OSC commands used by shell integration.
     */
    var ShellIntegrationOscPs;
    (function (ShellIntegrationOscPs) {
        /**
         * Sequences pioneered by FinalTerm.
         */
        ShellIntegrationOscPs[ShellIntegrationOscPs["FinalTerm"] = 133] = "FinalTerm";
        /**
         * Sequences pioneered by VS Code. The number is derived from the least significant digit of
         * "VSC" when encoded in hex ("VSC" = 0x56, 0x53, 0x43).
         */
        ShellIntegrationOscPs[ShellIntegrationOscPs["VSCode"] = 633] = "VSCode";
        /**
         * Sequences pioneered by iTerm.
         */
        ShellIntegrationOscPs[ShellIntegrationOscPs["ITerm"] = 1337] = "ITerm";
        ShellIntegrationOscPs[ShellIntegrationOscPs["SetCwd"] = 7] = "SetCwd";
        ShellIntegrationOscPs[ShellIntegrationOscPs["SetWindowsFriendlyCwd"] = 9] = "SetWindowsFriendlyCwd";
    })(ShellIntegrationOscPs || (ShellIntegrationOscPs = {}));
    /**
     * VS Code-specific shell integration sequences. Some of these are based on more common alternatives
     * like those pioneered in FinalTerm. The decision to move to entirely custom sequences was to try
     * to improve reliability and prevent the possibility of applications confusing the terminal. If
     * multiple shell integration scripts run, VS Code will prioritize the VS Code-specific ones.
     *
     * It's recommended that authors of shell integration scripts use the common sequences (eg. 133)
     * when building general purpose scripts and the VS Code-specific (633) when targeting only VS Code
     * or when there are no other alternatives.
     */
    var VSCodeOscPt;
    (function (VSCodeOscPt) {
        /**
         * The start of the prompt, this is expected to always appear at the start of a line.
         * Based on FinalTerm's `OSC 133 ; A ST`.
         */
        VSCodeOscPt["PromptStart"] = "A";
        /**
         * The start of a command, ie. where the user inputs their command.
         * Based on FinalTerm's `OSC 133 ; B ST`.
         */
        VSCodeOscPt["CommandStart"] = "B";
        /**
         * Sent just before the command output begins.
         * Based on FinalTerm's `OSC 133 ; C ST`.
         */
        VSCodeOscPt["CommandExecuted"] = "C";
        /**
         * Sent just after a command has finished. The exit code is optional, when not specified it
         * means no command was run (ie. enter on empty prompt or ctrl+c).
         * Based on FinalTerm's `OSC 133 ; D [; <ExitCode>] ST`.
         */
        VSCodeOscPt["CommandFinished"] = "D";
        /**
         * Explicitly set the command line. This helps workaround performance and reliability problems
         * with parsing out the command, such as conpty not guaranteeing the position of the sequence or
         * the shell not guaranteeing that the entire command is even visible.
         *
         * The command line can escape ascii characters using the `\xAB` format, where AB are the
         * hexadecimal representation of the character code (case insensitive), and escape the `\`
         * character using `\\`. It's required to escape semi-colon (`0x3b`) and characters 0x20 and
         * below, this is particularly important for new line and semi-colon.
         *
         * Some examples:
         *
         * ```
         * "\"  -> "\\"
         * "\n" -> "\x0a"
         * ";"  -> "\x3b"
         * ```
         *
         * An optional nonce can be provided which is may be required by the terminal in order enable
         * some features. This helps ensure no malicious command injection has occurred.
         *
         * Format: `OSC 633 ; E [; <CommandLine> [; <Nonce>]] ST`.
         */
        VSCodeOscPt["CommandLine"] = "E";
        /**
         * Similar to prompt start but for line continuations.
         *
         * WARNING: This sequence is unfinalized, DO NOT use this in your shell integration script.
         */
        VSCodeOscPt["ContinuationStart"] = "F";
        /**
         * Similar to command start but for line continuations.
         *
         * WARNING: This sequence is unfinalized, DO NOT use this in your shell integration script.
         */
        VSCodeOscPt["ContinuationEnd"] = "G";
        /**
         * The start of the right prompt.
         *
         * WARNING: This sequence is unfinalized, DO NOT use this in your shell integration script.
         */
        VSCodeOscPt["RightPromptStart"] = "H";
        /**
         * The end of the right prompt.
         *
         * WARNING: This sequence is unfinalized, DO NOT use this in your shell integration script.
         */
        VSCodeOscPt["RightPromptEnd"] = "I";
        /**
         * Set an arbitrary property: `OSC 633 ; P ; <Property>=<Value> ST`, only known properties will
         * be handled.
         *
         * Known properties:
         *
         * - `Cwd` - Reports the current working directory to the terminal.
         * - `IsWindows` - Indicates whether the terminal is using a Windows backend like winpty or
         *   conpty. This may be used to enable additional heuristics as the positioning of the shell
         *   integration sequences are not guaranteed to be correct. Valid values: `True`, `False`.
         *
         * WARNING: Any other properties may be changed and are not guaranteed to work in the future.
         */
        VSCodeOscPt["Property"] = "P";
        /**
         * Sets a mark/point-of-interest in the buffer. `OSC 633 ; SetMark [; Id=<string>] [; Hidden]`
         * `Id` - The identifier of the mark that can be used to reference it
         * `Hidden` - When set, the mark will be available to reference internally but will not visible
         *
         * WARNING: This sequence is unfinalized, DO NOT use this in your shell integration script.
         */
        VSCodeOscPt["SetMark"] = "SetMark";
    })(VSCodeOscPt || (VSCodeOscPt = {}));
    /**
     * ITerm sequences
     */
    var ITermOscPt;
    (function (ITermOscPt) {
        /**
         * Sets a mark/point-of-interest in the buffer. `OSC 1337 ; SetMark`
         */
        ITermOscPt["SetMark"] = "SetMark";
        /**
         * Reports current working directory (CWD). `OSC 1337 ; CurrentDir=<Cwd> ST`
         */
        ITermOscPt["CurrentDir"] = "CurrentDir";
    })(ITermOscPt || (ITermOscPt = {}));
    /**
     * The shell integration addon extends xterm by reading shell integration sequences and creating
     * capabilities and passing along relevant sequences to the capabilities. This is meant to
     * encapsulate all handling/parsing of sequences so the capabilities don't need to.
     */
    class ShellIntegrationAddon extends lifecycle_1.Disposable {
        get status() { return this._status; }
        constructor(_nonce, _disableTelemetry, _telemetryService, _logService) {
            super();
            this._nonce = _nonce;
            this._disableTelemetry = _disableTelemetry;
            this._telemetryService = _telemetryService;
            this._logService = _logService;
            this.capabilities = this._register(new terminalCapabilityStore_1.TerminalCapabilityStore());
            this._hasUpdatedTelemetry = false;
            this._commonProtocolDisposables = [];
            this._status = 0 /* ShellIntegrationStatus.Off */;
            this._onDidChangeStatus = new event_1.Emitter();
            this.onDidChangeStatus = this._onDidChangeStatus.event;
            this._register((0, lifecycle_1.toDisposable)(() => {
                this._clearActivationTimeout();
                this._disposeCommonProtocol();
            }));
        }
        _disposeCommonProtocol() {
            (0, lifecycle_1.dispose)(this._commonProtocolDisposables);
            this._commonProtocolDisposables.length = 0;
        }
        activate(xterm) {
            this._terminal = xterm;
            this.capabilities.add(3 /* TerminalCapability.PartialCommandDetection */, this._register(new partialCommandDetectionCapability_1.PartialCommandDetectionCapability(this._terminal)));
            this._register(xterm.parser.registerOscHandler(633 /* ShellIntegrationOscPs.VSCode */, data => this._handleVSCodeSequence(data)));
            this._register(xterm.parser.registerOscHandler(1337 /* ShellIntegrationOscPs.ITerm */, data => this._doHandleITermSequence(data)));
            this._commonProtocolDisposables.push(xterm.parser.registerOscHandler(133 /* ShellIntegrationOscPs.FinalTerm */, data => this._handleFinalTermSequence(data)));
            this._register(xterm.parser.registerOscHandler(7 /* ShellIntegrationOscPs.SetCwd */, data => this._doHandleSetCwd(data)));
            this._register(xterm.parser.registerOscHandler(9 /* ShellIntegrationOscPs.SetWindowsFriendlyCwd */, data => this._doHandleSetWindowsFriendlyCwd(data)));
            this._ensureCapabilitiesOrAddFailureTelemetry();
        }
        getMarkerId(terminal, vscodeMarkerId) {
            this._createOrGetBufferMarkDetection(terminal).getMark(vscodeMarkerId);
        }
        _handleFinalTermSequence(data) {
            const didHandle = this._doHandleFinalTermSequence(data);
            if (this._status === 0 /* ShellIntegrationStatus.Off */) {
                this._status = 1 /* ShellIntegrationStatus.FinalTerm */;
                this._onDidChangeStatus.fire(this._status);
            }
            return didHandle;
        }
        _doHandleFinalTermSequence(data) {
            if (!this._terminal) {
                return false;
            }
            // Pass the sequence along to the capability
            // It was considered to disable the common protocol in order to not confuse the VS Code
            // shell integration if both happen for some reason. This doesn't work for powerlevel10k
            // when instant prompt is enabled though. If this does end up being a problem we could pass
            // a type flag through the capability calls
            const [command, ...args] = data.split(';');
            switch (command) {
                case 'A':
                    this._createOrGetCommandDetection(this._terminal).handlePromptStart();
                    return true;
                case 'B':
                    // Ignore the command line for these sequences as it's unreliable for example in powerlevel10k
                    this._createOrGetCommandDetection(this._terminal).handleCommandStart({ ignoreCommandLine: true });
                    return true;
                case 'C':
                    this._createOrGetCommandDetection(this._terminal).handleCommandExecuted();
                    return true;
                case 'D': {
                    const exitCode = args.length === 1 ? parseInt(args[0]) : undefined;
                    this._createOrGetCommandDetection(this._terminal).handleCommandFinished(exitCode);
                    return true;
                }
            }
            return false;
        }
        _handleVSCodeSequence(data) {
            const didHandle = this._doHandleVSCodeSequence(data);
            if (!this._hasUpdatedTelemetry && didHandle) {
                this._telemetryService?.publicLog2('terminal/shellIntegrationActivationSucceeded');
                this._hasUpdatedTelemetry = true;
                this._clearActivationTimeout();
            }
            if (this._status !== 2 /* ShellIntegrationStatus.VSCode */) {
                this._status = 2 /* ShellIntegrationStatus.VSCode */;
                this._onDidChangeStatus.fire(this._status);
            }
            return didHandle;
        }
        async _ensureCapabilitiesOrAddFailureTelemetry() {
            if (!this._telemetryService || this._disableTelemetry) {
                return;
            }
            this._activationTimeout = setTimeout(() => {
                if (!this.capabilities.get(2 /* TerminalCapability.CommandDetection */) && !this.capabilities.get(0 /* TerminalCapability.CwdDetection */)) {
                    this._telemetryService?.publicLog2('terminal/shellIntegrationActivationTimeout');
                    this._logService.warn('Shell integration failed to add capabilities within 10 seconds');
                }
                this._hasUpdatedTelemetry = true;
            }, 10000);
        }
        _clearActivationTimeout() {
            if (this._activationTimeout !== undefined) {
                clearTimeout(this._activationTimeout);
                this._activationTimeout = undefined;
            }
        }
        _doHandleVSCodeSequence(data) {
            if (!this._terminal) {
                return false;
            }
            // Pass the sequence along to the capability
            const argsIndex = data.indexOf(';');
            const sequenceCommand = argsIndex === -1 ? data : data.substring(0, argsIndex);
            // Cast to strict checked index access
            const args = argsIndex === -1 ? [] : data.substring(argsIndex + 1).split(';');
            switch (sequenceCommand) {
                case "A" /* VSCodeOscPt.PromptStart */:
                    this._createOrGetCommandDetection(this._terminal).handlePromptStart();
                    return true;
                case "B" /* VSCodeOscPt.CommandStart */:
                    this._createOrGetCommandDetection(this._terminal).handleCommandStart();
                    return true;
                case "C" /* VSCodeOscPt.CommandExecuted */:
                    this._createOrGetCommandDetection(this._terminal).handleCommandExecuted();
                    return true;
                case "D" /* VSCodeOscPt.CommandFinished */: {
                    const arg0 = args[0];
                    const exitCode = arg0 !== undefined ? parseInt(arg0) : undefined;
                    this._createOrGetCommandDetection(this._terminal).handleCommandFinished(exitCode);
                    return true;
                }
                case "E" /* VSCodeOscPt.CommandLine */: {
                    const arg0 = args[0];
                    const arg1 = args[1];
                    let commandLine;
                    if (arg0 !== undefined) {
                        commandLine = deserializeMessage(arg0);
                    }
                    else {
                        commandLine = '';
                    }
                    this._createOrGetCommandDetection(this._terminal).setCommandLine(commandLine, arg1 === this._nonce);
                    return true;
                }
                case "F" /* VSCodeOscPt.ContinuationStart */: {
                    this._createOrGetCommandDetection(this._terminal).handleContinuationStart();
                    return true;
                }
                case "G" /* VSCodeOscPt.ContinuationEnd */: {
                    this._createOrGetCommandDetection(this._terminal).handleContinuationEnd();
                    return true;
                }
                case "H" /* VSCodeOscPt.RightPromptStart */: {
                    this._createOrGetCommandDetection(this._terminal).handleRightPromptStart();
                    return true;
                }
                case "I" /* VSCodeOscPt.RightPromptEnd */: {
                    this._createOrGetCommandDetection(this._terminal).handleRightPromptEnd();
                    return true;
                }
                case "P" /* VSCodeOscPt.Property */: {
                    const arg0 = args[0];
                    const deserialized = arg0 !== undefined ? deserializeMessage(arg0) : '';
                    const { key, value } = parseKeyValueAssignment(deserialized);
                    if (value === undefined) {
                        return true;
                    }
                    switch (key) {
                        case 'Cwd': {
                            this._updateCwd(value);
                            return true;
                        }
                        case 'IsWindows': {
                            this._createOrGetCommandDetection(this._terminal).setIsWindowsPty(value === 'True' ? true : false);
                            return true;
                        }
                        case 'Task': {
                            this._createOrGetBufferMarkDetection(this._terminal);
                            this.capabilities.get(2 /* TerminalCapability.CommandDetection */)?.setIsCommandStorageDisabled();
                            return true;
                        }
                    }
                }
                case "SetMark" /* VSCodeOscPt.SetMark */: {
                    this._createOrGetBufferMarkDetection(this._terminal).addMark(parseMarkSequence(args));
                    return true;
                }
            }
            // Unrecognized sequence
            return false;
        }
        _updateCwd(value) {
            value = (0, terminalEnvironment_1.sanitizeCwd)(value);
            this._createOrGetCwdDetection().updateCwd(value);
            const commandDetection = this.capabilities.get(2 /* TerminalCapability.CommandDetection */);
            commandDetection?.setCwd(value);
        }
        _doHandleITermSequence(data) {
            if (!this._terminal) {
                return false;
            }
            const [command] = data.split(';');
            switch (command) {
                case "SetMark" /* ITermOscPt.SetMark */: {
                    this._createOrGetBufferMarkDetection(this._terminal).addMark();
                }
                default: {
                    // Checking for known `<key>=<value>` pairs.
                    // Note that unlike `VSCodeOscPt.Property`, iTerm2 does not interpret backslash or hex-escape sequences.
                    // See: https://github.com/gnachman/iTerm2/blob/bb0882332cec5196e4de4a4225978d746e935279/sources/VT100Terminal.m#L2089-L2105
                    const { key, value } = parseKeyValueAssignment(command);
                    if (value === undefined) {
                        // No '=' was found, so it's not a property assignment.
                        return true;
                    }
                    switch (key) {
                        case "CurrentDir" /* ITermOscPt.CurrentDir */:
                            // Encountered: `OSC 1337 ; CurrentDir=<Cwd> ST`
                            this._updateCwd(value);
                            return true;
                    }
                }
            }
            // Unrecognized sequence
            return false;
        }
        _doHandleSetWindowsFriendlyCwd(data) {
            if (!this._terminal) {
                return false;
            }
            const [command, ...args] = data.split(';');
            switch (command) {
                case '9':
                    // Encountered `OSC 9 ; 9 ; <cwd> ST`
                    if (args.length) {
                        this._updateCwd(args[0]);
                    }
                    return true;
            }
            // Unrecognized sequence
            return false;
        }
        /**
         * Handles the sequence: `OSC 7 ; scheme://cwd ST`
         */
        _doHandleSetCwd(data) {
            if (!this._terminal) {
                return false;
            }
            const [command] = data.split(';');
            if (command.match(/^file:\/\/.*\//)) {
                const uri = uri_1.URI.parse(command);
                if (uri.path && uri.path.length > 0) {
                    this._updateCwd(uri.path);
                    return true;
                }
            }
            // Unrecognized sequence
            return false;
        }
        serialize() {
            if (!this._terminal || !this.capabilities.has(2 /* TerminalCapability.CommandDetection */)) {
                return {
                    isWindowsPty: false,
                    commands: []
                };
            }
            const result = this._createOrGetCommandDetection(this._terminal).serialize();
            return result;
        }
        deserialize(serialized) {
            if (!this._terminal) {
                throw new Error('Cannot restore commands before addon is activated');
            }
            this._createOrGetCommandDetection(this._terminal).deserialize(serialized);
        }
        _createOrGetCwdDetection() {
            let cwdDetection = this.capabilities.get(0 /* TerminalCapability.CwdDetection */);
            if (!cwdDetection) {
                cwdDetection = this._register(new cwdDetectionCapability_1.CwdDetectionCapability());
                this.capabilities.add(0 /* TerminalCapability.CwdDetection */, cwdDetection);
            }
            return cwdDetection;
        }
        _createOrGetCommandDetection(terminal) {
            let commandDetection = this.capabilities.get(2 /* TerminalCapability.CommandDetection */);
            if (!commandDetection) {
                commandDetection = this._register(new commandDetectionCapability_1.CommandDetectionCapability(terminal, this._logService));
                this.capabilities.add(2 /* TerminalCapability.CommandDetection */, commandDetection);
            }
            return commandDetection;
        }
        _createOrGetBufferMarkDetection(terminal) {
            let bufferMarkDetection = this.capabilities.get(4 /* TerminalCapability.BufferMarkDetection */);
            if (!bufferMarkDetection) {
                bufferMarkDetection = this._register(new bufferMarkCapability_1.BufferMarkCapability(terminal));
                this.capabilities.add(4 /* TerminalCapability.BufferMarkDetection */, bufferMarkDetection);
            }
            return bufferMarkDetection;
        }
    }
    exports.ShellIntegrationAddon = ShellIntegrationAddon;
    function deserializeMessage(message) {
        return message.replaceAll(
        // Backslash ('\') followed by an escape operator: either another '\', or 'x' and two hex chars.
        /\\(\\|x([0-9a-f]{2}))/gi, 
        // If it's a hex value, parse it to a character.
        // Otherwise the operator is '\', which we return literally, now unescaped.
        (_match, op, hex) => hex ? String.fromCharCode(parseInt(hex, 16)) : op);
    }
    exports.deserializeMessage = deserializeMessage;
    function parseKeyValueAssignment(message) {
        const separatorIndex = message.indexOf('=');
        if (separatorIndex === -1) {
            return { key: message, value: undefined }; // No '=' was found.
        }
        return {
            key: message.substring(0, separatorIndex),
            value: message.substring(1 + separatorIndex)
        };
    }
    exports.parseKeyValueAssignment = parseKeyValueAssignment;
    function parseMarkSequence(sequence) {
        let id = undefined;
        let hidden = false;
        for (const property of sequence) {
            // Sanity check, this shouldn't happen in practice
            if (property === undefined) {
                continue;
            }
            if (property === 'Hidden') {
                hidden = true;
            }
            if (property.startsWith('Id=')) {
                id = property.substring(3);
            }
        }
        return { id, hidden };
    }
    exports.parseMarkSequence = parseMarkSequence;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hlbGxJbnRlZ3JhdGlvbkFkZG9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdGVybWluYWwvY29tbW9uL3h0ZXJtL3NoZWxsSW50ZWdyYXRpb25BZGRvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFzQmhHOzs7Ozs7Ozs7Ozs7T0FZRztJQUVIOztPQUVHO0lBQ0gsSUFBVyxxQkFnQlY7SUFoQkQsV0FBVyxxQkFBcUI7UUFDL0I7O1dBRUc7UUFDSCw2RUFBZSxDQUFBO1FBQ2Y7OztXQUdHO1FBQ0gsdUVBQVksQ0FBQTtRQUNaOztXQUVHO1FBQ0gsc0VBQVksQ0FBQTtRQUNaLHFFQUFVLENBQUE7UUFDVixtR0FBeUIsQ0FBQTtJQUMxQixDQUFDLEVBaEJVLHFCQUFxQixLQUFyQixxQkFBcUIsUUFnQi9CO0lBRUQ7Ozs7Ozs7OztPQVNHO0lBQ0gsSUFBVyxXQXNHVjtJQXRHRCxXQUFXLFdBQVc7UUFDckI7OztXQUdHO1FBQ0gsZ0NBQWlCLENBQUE7UUFFakI7OztXQUdHO1FBQ0gsaUNBQWtCLENBQUE7UUFFbEI7OztXQUdHO1FBQ0gsb0NBQXFCLENBQUE7UUFFckI7Ozs7V0FJRztRQUNILG9DQUFxQixDQUFBO1FBRXJCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1dBc0JHO1FBQ0gsZ0NBQWlCLENBQUE7UUFFakI7Ozs7V0FJRztRQUNILHNDQUF1QixDQUFBO1FBRXZCOzs7O1dBSUc7UUFDSCxvQ0FBcUIsQ0FBQTtRQUVyQjs7OztXQUlHO1FBQ0gscUNBQXNCLENBQUE7UUFFdEI7Ozs7V0FJRztRQUNILG1DQUFvQixDQUFBO1FBRXBCOzs7Ozs7Ozs7Ozs7V0FZRztRQUNILDZCQUFjLENBQUE7UUFFZDs7Ozs7O1dBTUc7UUFDSCxrQ0FBbUIsQ0FBQTtJQUNwQixDQUFDLEVBdEdVLFdBQVcsS0FBWCxXQUFXLFFBc0dyQjtJQUVEOztPQUVH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