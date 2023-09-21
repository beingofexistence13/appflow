/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CommandInvalidationReason = exports.TerminalCapability = void 0;
    /**
     * Primarily driven by the shell integration feature, a terminal capability is the mechanism for
     * progressively enhancing various features that may not be supported in all terminals/shells.
     */
    var TerminalCapability;
    (function (TerminalCapability) {
        /**
         * The terminal can reliably detect the current working directory as soon as the change happens
         * within the buffer.
         */
        TerminalCapability[TerminalCapability["CwdDetection"] = 0] = "CwdDetection";
        /**
         * The terminal can reliably detect the current working directory when requested.
         */
        TerminalCapability[TerminalCapability["NaiveCwdDetection"] = 1] = "NaiveCwdDetection";
        /**
         * The terminal can reliably identify prompts, commands and command outputs within the buffer.
         */
        TerminalCapability[TerminalCapability["CommandDetection"] = 2] = "CommandDetection";
        /**
         * The terminal can often identify prompts, commands and command outputs within the buffer. It
         * may not be so good at remembering the position of commands that ran in the past. This state
         * may be enabled when something goes wrong or when using conpty for example.
         */
        TerminalCapability[TerminalCapability["PartialCommandDetection"] = 3] = "PartialCommandDetection";
        /**
         * Manages buffer marks that can be used for terminal navigation. The source of
         * the request (task, debug, etc) provides an ID, optional marker, hoverMessage, and hidden property. When
         * hidden is not provided, a generic decoration is added to the buffer and overview ruler.
         */
        TerminalCapability[TerminalCapability["BufferMarkDetection"] = 4] = "BufferMarkDetection";
    })(TerminalCapability || (exports.TerminalCapability = TerminalCapability = {}));
    var CommandInvalidationReason;
    (function (CommandInvalidationReason) {
        CommandInvalidationReason["Windows"] = "windows";
        CommandInvalidationReason["NoProblemsReported"] = "noProblemsReported";
    })(CommandInvalidationReason || (exports.CommandInvalidationReason = CommandInvalidationReason = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FwYWJpbGl0aWVzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdGVybWluYWwvY29tbW9uL2NhcGFiaWxpdGllcy9jYXBhYmlsaXRpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBc0NoRzs7O09BR0c7SUFDSCxJQUFrQixrQkEyQmpCO0lBM0JELFdBQWtCLGtCQUFrQjtRQUNuQzs7O1dBR0c7UUFDSCwyRUFBWSxDQUFBO1FBQ1o7O1dBRUc7UUFDSCxxRkFBaUIsQ0FBQTtRQUNqQjs7V0FFRztRQUNILG1GQUFnQixDQUFBO1FBQ2hCOzs7O1dBSUc7UUFDSCxpR0FBdUIsQ0FBQTtRQUV2Qjs7OztXQUlHO1FBQ0gseUZBQW1CLENBQUE7SUFDcEIsQ0FBQyxFQTNCaUIsa0JBQWtCLGtDQUFsQixrQkFBa0IsUUEyQm5DO0lBd0VELElBQWtCLHlCQUdqQjtJQUhELFdBQWtCLHlCQUF5QjtRQUMxQyxnREFBbUIsQ0FBQTtRQUNuQixzRUFBeUMsQ0FBQTtJQUMxQyxDQUFDLEVBSGlCLHlCQUF5Qix5Q0FBekIseUJBQXlCLFFBRzFDIn0=