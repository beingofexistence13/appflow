/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/terminal/common/capabilities/terminalCapabilityStore", "vs/platform/terminal/common/capabilities/commandDetectionCapability", "vs/platform/terminal/common/capabilities/cwdDetectionCapability", "vs/platform/terminal/common/capabilities/partialCommandDetectionCapability", "vs/base/common/event", "vs/platform/terminal/common/capabilities/bufferMarkCapability", "vs/base/common/uri", "vs/platform/terminal/common/terminalEnvironment"], function (require, exports, lifecycle_1, terminalCapabilityStore_1, commandDetectionCapability_1, cwdDetectionCapability_1, partialCommandDetectionCapability_1, event_1, bufferMarkCapability_1, uri_1, terminalEnvironment_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$mib = exports.$lib = exports.$kib = exports.$jib = void 0;
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
    class $jib extends lifecycle_1.$kc {
        get status() { return this.g; }
        constructor(j, m, n, r) {
            super();
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.capabilities = this.B(new terminalCapabilityStore_1.$eib());
            this.b = false;
            this.f = [];
            this.g = 0 /* ShellIntegrationStatus.Off */;
            this.h = new event_1.$fd();
            this.onDidChangeStatus = this.h.event;
            this.B((0, lifecycle_1.$ic)(() => {
                this.z();
                this.s();
            }));
        }
        s() {
            (0, lifecycle_1.$fc)(this.f);
            this.f.length = 0;
        }
        activate(xterm) {
            this.a = xterm;
            this.capabilities.add(3 /* TerminalCapability.PartialCommandDetection */, this.B(new partialCommandDetectionCapability_1.$hib(this.a)));
            this.B(xterm.parser.registerOscHandler(633 /* ShellIntegrationOscPs.VSCode */, data => this.w(data)));
            this.B(xterm.parser.registerOscHandler(1337 /* ShellIntegrationOscPs.ITerm */, data => this.F(data)));
            this.f.push(xterm.parser.registerOscHandler(133 /* ShellIntegrationOscPs.FinalTerm */, data => this.t(data)));
            this.B(xterm.parser.registerOscHandler(7 /* ShellIntegrationOscPs.SetCwd */, data => this.H(data)));
            this.B(xterm.parser.registerOscHandler(9 /* ShellIntegrationOscPs.SetWindowsFriendlyCwd */, data => this.G(data)));
            this.y();
        }
        getMarkerId(terminal, vscodeMarkerId) {
            this.L(terminal).getMark(vscodeMarkerId);
        }
        t(data) {
            const didHandle = this.u(data);
            if (this.g === 0 /* ShellIntegrationStatus.Off */) {
                this.g = 1 /* ShellIntegrationStatus.FinalTerm */;
                this.h.fire(this.g);
            }
            return didHandle;
        }
        u(data) {
            if (!this.a) {
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
                    this.J(this.a).handlePromptStart();
                    return true;
                case 'B':
                    // Ignore the command line for these sequences as it's unreliable for example in powerlevel10k
                    this.J(this.a).handleCommandStart({ ignoreCommandLine: true });
                    return true;
                case 'C':
                    this.J(this.a).handleCommandExecuted();
                    return true;
                case 'D': {
                    const exitCode = args.length === 1 ? parseInt(args[0]) : undefined;
                    this.J(this.a).handleCommandFinished(exitCode);
                    return true;
                }
            }
            return false;
        }
        w(data) {
            const didHandle = this.C(data);
            if (!this.b && didHandle) {
                this.n?.publicLog2('terminal/shellIntegrationActivationSucceeded');
                this.b = true;
                this.z();
            }
            if (this.g !== 2 /* ShellIntegrationStatus.VSCode */) {
                this.g = 2 /* ShellIntegrationStatus.VSCode */;
                this.h.fire(this.g);
            }
            return didHandle;
        }
        async y() {
            if (!this.n || this.m) {
                return;
            }
            this.c = setTimeout(() => {
                if (!this.capabilities.get(2 /* TerminalCapability.CommandDetection */) && !this.capabilities.get(0 /* TerminalCapability.CwdDetection */)) {
                    this.n?.publicLog2('terminal/shellIntegrationActivationTimeout');
                    this.r.warn('Shell integration failed to add capabilities within 10 seconds');
                }
                this.b = true;
            }, 10000);
        }
        z() {
            if (this.c !== undefined) {
                clearTimeout(this.c);
                this.c = undefined;
            }
        }
        C(data) {
            if (!this.a) {
                return false;
            }
            // Pass the sequence along to the capability
            const argsIndex = data.indexOf(';');
            const sequenceCommand = argsIndex === -1 ? data : data.substring(0, argsIndex);
            // Cast to strict checked index access
            const args = argsIndex === -1 ? [] : data.substring(argsIndex + 1).split(';');
            switch (sequenceCommand) {
                case "A" /* VSCodeOscPt.PromptStart */:
                    this.J(this.a).handlePromptStart();
                    return true;
                case "B" /* VSCodeOscPt.CommandStart */:
                    this.J(this.a).handleCommandStart();
                    return true;
                case "C" /* VSCodeOscPt.CommandExecuted */:
                    this.J(this.a).handleCommandExecuted();
                    return true;
                case "D" /* VSCodeOscPt.CommandFinished */: {
                    const arg0 = args[0];
                    const exitCode = arg0 !== undefined ? parseInt(arg0) : undefined;
                    this.J(this.a).handleCommandFinished(exitCode);
                    return true;
                }
                case "E" /* VSCodeOscPt.CommandLine */: {
                    const arg0 = args[0];
                    const arg1 = args[1];
                    let commandLine;
                    if (arg0 !== undefined) {
                        commandLine = $kib(arg0);
                    }
                    else {
                        commandLine = '';
                    }
                    this.J(this.a).setCommandLine(commandLine, arg1 === this.j);
                    return true;
                }
                case "F" /* VSCodeOscPt.ContinuationStart */: {
                    this.J(this.a).handleContinuationStart();
                    return true;
                }
                case "G" /* VSCodeOscPt.ContinuationEnd */: {
                    this.J(this.a).handleContinuationEnd();
                    return true;
                }
                case "H" /* VSCodeOscPt.RightPromptStart */: {
                    this.J(this.a).handleRightPromptStart();
                    return true;
                }
                case "I" /* VSCodeOscPt.RightPromptEnd */: {
                    this.J(this.a).handleRightPromptEnd();
                    return true;
                }
                case "P" /* VSCodeOscPt.Property */: {
                    const arg0 = args[0];
                    const deserialized = arg0 !== undefined ? $kib(arg0) : '';
                    const { key, value } = $lib(deserialized);
                    if (value === undefined) {
                        return true;
                    }
                    switch (key) {
                        case 'Cwd': {
                            this.D(value);
                            return true;
                        }
                        case 'IsWindows': {
                            this.J(this.a).setIsWindowsPty(value === 'True' ? true : false);
                            return true;
                        }
                        case 'Task': {
                            this.L(this.a);
                            this.capabilities.get(2 /* TerminalCapability.CommandDetection */)?.setIsCommandStorageDisabled();
                            return true;
                        }
                    }
                }
                case "SetMark" /* VSCodeOscPt.SetMark */: {
                    this.L(this.a).addMark($mib(args));
                    return true;
                }
            }
            // Unrecognized sequence
            return false;
        }
        D(value) {
            value = (0, terminalEnvironment_1.$RM)(value);
            this.I().updateCwd(value);
            const commandDetection = this.capabilities.get(2 /* TerminalCapability.CommandDetection */);
            commandDetection?.setCwd(value);
        }
        F(data) {
            if (!this.a) {
                return false;
            }
            const [command] = data.split(';');
            switch (command) {
                case "SetMark" /* ITermOscPt.SetMark */: {
                    this.L(this.a).addMark();
                }
                default: {
                    // Checking for known `<key>=<value>` pairs.
                    // Note that unlike `VSCodeOscPt.Property`, iTerm2 does not interpret backslash or hex-escape sequences.
                    // See: https://github.com/gnachman/iTerm2/blob/bb0882332cec5196e4de4a4225978d746e935279/sources/VT100Terminal.m#L2089-L2105
                    const { key, value } = $lib(command);
                    if (value === undefined) {
                        // No '=' was found, so it's not a property assignment.
                        return true;
                    }
                    switch (key) {
                        case "CurrentDir" /* ITermOscPt.CurrentDir */:
                            // Encountered: `OSC 1337 ; CurrentDir=<Cwd> ST`
                            this.D(value);
                            return true;
                    }
                }
            }
            // Unrecognized sequence
            return false;
        }
        G(data) {
            if (!this.a) {
                return false;
            }
            const [command, ...args] = data.split(';');
            switch (command) {
                case '9':
                    // Encountered `OSC 9 ; 9 ; <cwd> ST`
                    if (args.length) {
                        this.D(args[0]);
                    }
                    return true;
            }
            // Unrecognized sequence
            return false;
        }
        /**
         * Handles the sequence: `OSC 7 ; scheme://cwd ST`
         */
        H(data) {
            if (!this.a) {
                return false;
            }
            const [command] = data.split(';');
            if (command.match(/^file:\/\/.*\//)) {
                const uri = uri_1.URI.parse(command);
                if (uri.path && uri.path.length > 0) {
                    this.D(uri.path);
                    return true;
                }
            }
            // Unrecognized sequence
            return false;
        }
        serialize() {
            if (!this.a || !this.capabilities.has(2 /* TerminalCapability.CommandDetection */)) {
                return {
                    isWindowsPty: false,
                    commands: []
                };
            }
            const result = this.J(this.a).serialize();
            return result;
        }
        deserialize(serialized) {
            if (!this.a) {
                throw new Error('Cannot restore commands before addon is activated');
            }
            this.J(this.a).deserialize(serialized);
        }
        I() {
            let cwdDetection = this.capabilities.get(0 /* TerminalCapability.CwdDetection */);
            if (!cwdDetection) {
                cwdDetection = this.B(new cwdDetectionCapability_1.$gib());
                this.capabilities.add(0 /* TerminalCapability.CwdDetection */, cwdDetection);
            }
            return cwdDetection;
        }
        J(terminal) {
            let commandDetection = this.capabilities.get(2 /* TerminalCapability.CommandDetection */);
            if (!commandDetection) {
                commandDetection = this.B(new commandDetectionCapability_1.$Tq(terminal, this.r));
                this.capabilities.add(2 /* TerminalCapability.CommandDetection */, commandDetection);
            }
            return commandDetection;
        }
        L(terminal) {
            let bufferMarkDetection = this.capabilities.get(4 /* TerminalCapability.BufferMarkDetection */);
            if (!bufferMarkDetection) {
                bufferMarkDetection = this.B(new bufferMarkCapability_1.$iib(terminal));
                this.capabilities.add(4 /* TerminalCapability.BufferMarkDetection */, bufferMarkDetection);
            }
            return bufferMarkDetection;
        }
    }
    exports.$jib = $jib;
    function $kib(message) {
        return message.replaceAll(
        // Backslash ('\') followed by an escape operator: either another '\', or 'x' and two hex chars.
        /\\(\\|x([0-9a-f]{2}))/gi, 
        // If it's a hex value, parse it to a character.
        // Otherwise the operator is '\', which we return literally, now unescaped.
        (_match, op, hex) => hex ? String.fromCharCode(parseInt(hex, 16)) : op);
    }
    exports.$kib = $kib;
    function $lib(message) {
        const separatorIndex = message.indexOf('=');
        if (separatorIndex === -1) {
            return { key: message, value: undefined }; // No '=' was found.
        }
        return {
            key: message.substring(0, separatorIndex),
            value: message.substring(1 + separatorIndex)
        };
    }
    exports.$lib = $lib;
    function $mib(sequence) {
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
    exports.$mib = $mib;
});
//# sourceMappingURL=shellIntegrationAddon.js.map