/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalStorageKeys = void 0;
    var TerminalStorageKeys;
    (function (TerminalStorageKeys) {
        TerminalStorageKeys["NeverMeasureRenderTime"] = "terminal.integrated.neverMeasureRenderTime";
        TerminalStorageKeys["SuggestedRendererType"] = "terminal.integrated.suggestedRendererType";
        TerminalStorageKeys["TabsListWidthHorizontal"] = "tabs-list-width-horizontal";
        TerminalStorageKeys["TabsListWidthVertical"] = "tabs-list-width-vertical";
        TerminalStorageKeys["DeprecatedEnvironmentVariableCollections"] = "terminal.integrated.environmentVariableCollections";
        TerminalStorageKeys["EnvironmentVariableCollections"] = "terminal.integrated.environmentVariableCollectionsV2";
        TerminalStorageKeys["TerminalBufferState"] = "terminal.integrated.bufferState";
        TerminalStorageKeys["TerminalLayoutInfo"] = "terminal.integrated.layoutInfo";
        TerminalStorageKeys["PinnedRecentCommandsPrefix"] = "terminal.pinnedRecentCommands";
        TerminalStorageKeys["TerminalSuggestSize"] = "terminal.integrated.suggestSize";
    })(TerminalStorageKeys || (exports.TerminalStorageKeys = TerminalStorageKeys = {}));
});
//# sourceMappingURL=terminalStorageKeys.js.map