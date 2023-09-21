/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/iconLabels", "vs/platform/quickinput/browser/commandsQuickAccess"], function (require, exports, iconLabels_1, commandsQuickAccess_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractEditorCommandsQuickAccessProvider = void 0;
    class AbstractEditorCommandsQuickAccessProvider extends commandsQuickAccess_1.AbstractCommandsQuickAccessProvider {
        constructor(options, instantiationService, keybindingService, commandService, telemetryService, dialogService) {
            super(options, instantiationService, keybindingService, commandService, telemetryService, dialogService);
        }
        getCodeEditorCommandPicks() {
            const activeTextEditorControl = this.activeTextEditorControl;
            if (!activeTextEditorControl) {
                return [];
            }
            const editorCommandPicks = [];
            for (const editorAction of activeTextEditorControl.getSupportedActions()) {
                editorCommandPicks.push({
                    commandId: editorAction.id,
                    commandAlias: editorAction.alias,
                    label: (0, iconLabels_1.stripIcons)(editorAction.label) || editorAction.id,
                });
            }
            return editorCommandPicks;
        }
    }
    exports.AbstractEditorCommandsQuickAccessProvider = AbstractEditorCommandsQuickAccessProvider;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHNRdWlja0FjY2Vzcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL3F1aWNrQWNjZXNzL2Jyb3dzZXIvY29tbWFuZHNRdWlja0FjY2Vzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFXaEcsTUFBc0IseUNBQTBDLFNBQVEseURBQW1DO1FBRTFHLFlBQ0MsT0FBb0MsRUFDcEMsb0JBQTJDLEVBQzNDLGlCQUFxQyxFQUNyQyxjQUErQixFQUMvQixnQkFBbUMsRUFDbkMsYUFBNkI7WUFFN0IsS0FBSyxDQUFDLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxpQkFBaUIsRUFBRSxjQUFjLEVBQUUsZ0JBQWdCLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDMUcsQ0FBQztRQU9TLHlCQUF5QjtZQUNsQyxNQUFNLHVCQUF1QixHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQztZQUM3RCxJQUFJLENBQUMsdUJBQXVCLEVBQUU7Z0JBQzdCLE9BQU8sRUFBRSxDQUFDO2FBQ1Y7WUFFRCxNQUFNLGtCQUFrQixHQUF3QixFQUFFLENBQUM7WUFDbkQsS0FBSyxNQUFNLFlBQVksSUFBSSx1QkFBdUIsQ0FBQyxtQkFBbUIsRUFBRSxFQUFFO2dCQUN6RSxrQkFBa0IsQ0FBQyxJQUFJLENBQUM7b0JBQ3ZCLFNBQVMsRUFBRSxZQUFZLENBQUMsRUFBRTtvQkFDMUIsWUFBWSxFQUFFLFlBQVksQ0FBQyxLQUFLO29CQUNoQyxLQUFLLEVBQUUsSUFBQSx1QkFBVSxFQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsSUFBSSxZQUFZLENBQUMsRUFBRTtpQkFDeEQsQ0FBQyxDQUFDO2FBQ0g7WUFFRCxPQUFPLGtCQUFrQixDQUFDO1FBQzNCLENBQUM7S0FDRDtJQW5DRCw4RkFtQ0MifQ==