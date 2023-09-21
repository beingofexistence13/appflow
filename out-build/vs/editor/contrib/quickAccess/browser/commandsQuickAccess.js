/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/iconLabels", "vs/platform/quickinput/browser/commandsQuickAccess"], function (require, exports, iconLabels_1, commandsQuickAccess_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$LLb = void 0;
    class $LLb extends commandsQuickAccess_1.$JLb {
        constructor(options, instantiationService, keybindingService, commandService, telemetryService, dialogService) {
            super(options, instantiationService, keybindingService, commandService, telemetryService, dialogService);
        }
        J() {
            const activeTextEditorControl = this.I;
            if (!activeTextEditorControl) {
                return [];
            }
            const editorCommandPicks = [];
            for (const editorAction of activeTextEditorControl.getSupportedActions()) {
                editorCommandPicks.push({
                    commandId: editorAction.id,
                    commandAlias: editorAction.alias,
                    label: (0, iconLabels_1.$Tj)(editorAction.label) || editorAction.id,
                });
            }
            return editorCommandPicks;
        }
    }
    exports.$LLb = $LLb;
});
//# sourceMappingURL=commandsQuickAccess.js.map