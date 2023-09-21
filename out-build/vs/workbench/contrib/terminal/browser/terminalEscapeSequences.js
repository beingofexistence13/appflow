/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$EXb = exports.$DXb = exports.ITermOscPt = exports.VSCodeOscProperty = exports.VSCodeOscPt = void 0;
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
    })(ShellIntegrationOscPs || (ShellIntegrationOscPs = {}));
    /**
     * VS Code-specific shell integration sequences. Some of these are based on common alternatives like
     * those pioneered in FinalTerm. The decision to move to entirely custom sequences was to try to
     * improve reliability and prevent the possibility of applications confusing the terminal.
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
         * Explicitly set the command line. This helps workaround problems with conpty not having a
         * passthrough mode by providing an option on Windows to send the command that was run. With
         * this sequence there's no need for the guessing based on the unreliable cursor positions that
         * would otherwise be required.
         */
        VSCodeOscPt["CommandLine"] = "E";
        /**
         * Similar to prompt start but for line continuations.
         */
        VSCodeOscPt["ContinuationStart"] = "F";
        /**
         * Similar to command start but for line continuations.
         */
        VSCodeOscPt["ContinuationEnd"] = "G";
        /**
         * The start of the right prompt.
         */
        VSCodeOscPt["RightPromptStart"] = "H";
        /**
         * The end of the right prompt.
         */
        VSCodeOscPt["RightPromptEnd"] = "I";
        /**
         * Set an arbitrary property: `OSC 633 ; P ; <Property>=<Value> ST`, only known properties will
         * be handled.
         */
        VSCodeOscPt["Property"] = "P";
    })(VSCodeOscPt || (exports.VSCodeOscPt = VSCodeOscPt = {}));
    var VSCodeOscProperty;
    (function (VSCodeOscProperty) {
        VSCodeOscProperty["Task"] = "Task";
        VSCodeOscProperty["Cwd"] = "Cwd";
    })(VSCodeOscProperty || (exports.VSCodeOscProperty = VSCodeOscProperty = {}));
    /**
     * ITerm sequences
     */
    var ITermOscPt;
    (function (ITermOscPt) {
        /**
         * Based on ITerm's `OSC 1337 ; SetMark` sets a mark on the scrollbar
         */
        ITermOscPt["SetMark"] = "SetMark";
    })(ITermOscPt || (exports.ITermOscPt = ITermOscPt = {}));
    function $DXb(osc, data) {
        return oscSequence(633 /* ShellIntegrationOscPs.VSCode */, osc, data);
    }
    exports.$DXb = $DXb;
    function $EXb(osc, data) {
        return oscSequence(1337 /* ShellIntegrationOscPs.ITerm */, osc, data);
    }
    exports.$EXb = $EXb;
    function oscSequence(ps, pt, data) {
        let result = `\x1b]${ps};${pt}`;
        if (data) {
            result += `;${data}`;
        }
        result += `\x07`;
        return result;
    }
});
//# sourceMappingURL=terminalEscapeSequences.js.map