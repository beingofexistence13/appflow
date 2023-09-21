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
//# sourceMappingURL=capabilities.js.map