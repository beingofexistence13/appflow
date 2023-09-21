/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ITermSequence = exports.VSCodeSequence = exports.ITermOscPt = exports.VSCodeOscProperty = exports.VSCodeOscPt = void 0;
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
    function VSCodeSequence(osc, data) {
        return oscSequence(633 /* ShellIntegrationOscPs.VSCode */, osc, data);
    }
    exports.VSCodeSequence = VSCodeSequence;
    function ITermSequence(osc, data) {
        return oscSequence(1337 /* ShellIntegrationOscPs.ITerm */, osc, data);
    }
    exports.ITermSequence = ITermSequence;
    function oscSequence(ps, pt, data) {
        let result = `\x1b]${ps};${pt}`;
        if (data) {
            result += `;${data}`;
        }
        result += `\x07`;
        return result;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxFc2NhcGVTZXF1ZW5jZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbC9icm93c2VyL3Rlcm1pbmFsRXNjYXBlU2VxdWVuY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUVoRzs7T0FFRztJQUNILElBQVcscUJBY1Y7SUFkRCxXQUFXLHFCQUFxQjtRQUMvQjs7V0FFRztRQUNILDZFQUFlLENBQUE7UUFDZjs7O1dBR0c7UUFDSCx1RUFBWSxDQUFBO1FBQ1o7O1dBRUc7UUFDSCxzRUFBWSxDQUFBO0lBQ2IsQ0FBQyxFQWRVLHFCQUFxQixLQUFyQixxQkFBcUIsUUFjL0I7SUFFRDs7OztPQUlHO0lBQ0gsSUFBa0IsV0EyRGpCO0lBM0RELFdBQWtCLFdBQVc7UUFDNUI7OztXQUdHO1FBQ0gsZ0NBQWlCLENBQUE7UUFFakI7OztXQUdHO1FBQ0gsaUNBQWtCLENBQUE7UUFFbEI7OztXQUdHO1FBQ0gsb0NBQXFCLENBQUE7UUFFckI7Ozs7V0FJRztRQUNILG9DQUFxQixDQUFBO1FBRXJCOzs7OztXQUtHO1FBQ0gsZ0NBQWlCLENBQUE7UUFFakI7O1dBRUc7UUFDSCxzQ0FBdUIsQ0FBQTtRQUV2Qjs7V0FFRztRQUNILG9DQUFxQixDQUFBO1FBRXJCOztXQUVHO1FBQ0gscUNBQXNCLENBQUE7UUFFdEI7O1dBRUc7UUFDSCxtQ0FBb0IsQ0FBQTtRQUVwQjs7O1dBR0c7UUFDSCw2QkFBYyxDQUFBO0lBQ2YsQ0FBQyxFQTNEaUIsV0FBVywyQkFBWCxXQUFXLFFBMkQ1QjtJQUVELElBQWtCLGlCQUdqQjtJQUhELFdBQWtCLGlCQUFpQjtRQUNsQyxrQ0FBYSxDQUFBO1FBQ2IsZ0NBQVcsQ0FBQTtJQUNaLENBQUMsRUFIaUIsaUJBQWlCLGlDQUFqQixpQkFBaUIsUUFHbEM7SUFFRDs7T0FFRztJQUNILElBQWtCLFVBS2pCO0lBTEQsV0FBa0IsVUFBVTtRQUMzQjs7V0FFRztRQUNILGlDQUFtQixDQUFBO0lBQ3BCLENBQUMsRUFMaUIsVUFBVSwwQkFBVixVQUFVLFFBSzNCO0lBRUQsU0FBZ0IsY0FBYyxDQUFDLEdBQWdCLEVBQUUsSUFBaUM7UUFDakYsT0FBTyxXQUFXLHlDQUErQixHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUZELHdDQUVDO0lBRUQsU0FBZ0IsYUFBYSxDQUFDLEdBQWUsRUFBRSxJQUFhO1FBQzNELE9BQU8sV0FBVyx5Q0FBOEIsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzVELENBQUM7SUFGRCxzQ0FFQztJQUVELFNBQVMsV0FBVyxDQUFDLEVBQVUsRUFBRSxFQUFVLEVBQUUsSUFBYTtRQUN6RCxJQUFJLE1BQU0sR0FBRyxRQUFRLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQztRQUNoQyxJQUFJLElBQUksRUFBRTtZQUNULE1BQU0sSUFBSSxJQUFJLElBQUksRUFBRSxDQUFDO1NBQ3JCO1FBQ0QsTUFBTSxJQUFJLE1BQU0sQ0FBQztRQUNqQixPQUFPLE1BQU0sQ0FBQztJQUVmLENBQUMifQ==