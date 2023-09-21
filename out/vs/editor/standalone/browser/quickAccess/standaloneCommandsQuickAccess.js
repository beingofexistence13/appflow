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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/platform/registry/common/platform", "vs/platform/quickinput/common/quickAccess", "vs/editor/common/standaloneStrings", "vs/editor/browser/services/codeEditorService", "vs/editor/contrib/quickAccess/browser/commandsQuickAccess", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/commands/common/commands", "vs/platform/telemetry/common/telemetry", "vs/platform/dialogs/common/dialogs", "vs/editor/browser/editorExtensions", "vs/editor/common/editorContextKeys", "vs/platform/quickinput/common/quickInput"], function (require, exports, platform_1, quickAccess_1, standaloneStrings_1, codeEditorService_1, commandsQuickAccess_1, instantiation_1, keybinding_1, commands_1, telemetry_1, dialogs_1, editorExtensions_1, editorContextKeys_1, quickInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GotoLineAction = exports.StandaloneCommandsQuickAccessProvider = void 0;
    let StandaloneCommandsQuickAccessProvider = class StandaloneCommandsQuickAccessProvider extends commandsQuickAccess_1.AbstractEditorCommandsQuickAccessProvider {
        get activeTextEditorControl() { return this.codeEditorService.getFocusedCodeEditor() ?? undefined; }
        constructor(instantiationService, codeEditorService, keybindingService, commandService, telemetryService, dialogService) {
            super({ showAlias: false }, instantiationService, keybindingService, commandService, telemetryService, dialogService);
            this.codeEditorService = codeEditorService;
        }
        async getCommandPicks() {
            return this.getCodeEditorCommandPicks();
        }
        hasAdditionalCommandPicks() {
            return false;
        }
        async getAdditionalCommandPicks() {
            return [];
        }
    };
    exports.StandaloneCommandsQuickAccessProvider = StandaloneCommandsQuickAccessProvider;
    exports.StandaloneCommandsQuickAccessProvider = StandaloneCommandsQuickAccessProvider = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, codeEditorService_1.ICodeEditorService),
        __param(2, keybinding_1.IKeybindingService),
        __param(3, commands_1.ICommandService),
        __param(4, telemetry_1.ITelemetryService),
        __param(5, dialogs_1.IDialogService)
    ], StandaloneCommandsQuickAccessProvider);
    class GotoLineAction extends editorExtensions_1.EditorAction {
        static { this.ID = 'editor.action.quickCommand'; }
        constructor() {
            super({
                id: GotoLineAction.ID,
                label: standaloneStrings_1.QuickCommandNLS.quickCommandActionLabel,
                alias: 'Command Palette',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                    primary: 59 /* KeyCode.F1 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                contextMenuOpts: {
                    group: 'z_commands',
                    order: 1
                }
            });
        }
        run(accessor) {
            accessor.get(quickInput_1.IQuickInputService).quickAccess.show(StandaloneCommandsQuickAccessProvider.PREFIX);
        }
    }
    exports.GotoLineAction = GotoLineAction;
    (0, editorExtensions_1.registerEditorAction)(GotoLineAction);
    platform_1.Registry.as(quickAccess_1.Extensions.Quickaccess).registerQuickAccessProvider({
        ctor: StandaloneCommandsQuickAccessProvider,
        prefix: StandaloneCommandsQuickAccessProvider.PREFIX,
        helpEntries: [{ description: standaloneStrings_1.QuickCommandNLS.quickCommandHelp, commandId: GotoLineAction.ID }]
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhbmRhbG9uZUNvbW1hbmRzUXVpY2tBY2Nlc3MuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3Ivc3RhbmRhbG9uZS9icm93c2VyL3F1aWNrQWNjZXNzL3N0YW5kYWxvbmVDb21tYW5kc1F1aWNrQWNjZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQW9CekYsSUFBTSxxQ0FBcUMsR0FBM0MsTUFBTSxxQ0FBc0MsU0FBUSwrREFBeUM7UUFFbkcsSUFBYyx1QkFBdUIsS0FBMEIsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBRW5JLFlBQ3dCLG9CQUEyQyxFQUM3QixpQkFBcUMsRUFDdEQsaUJBQXFDLEVBQ3hDLGNBQStCLEVBQzdCLGdCQUFtQyxFQUN0QyxhQUE2QjtZQUU3QyxLQUFLLENBQUMsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLEVBQUUsb0JBQW9CLEVBQUUsaUJBQWlCLEVBQUUsY0FBYyxFQUFFLGdCQUFnQixFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBTmpGLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7UUFPM0UsQ0FBQztRQUVTLEtBQUssQ0FBQyxlQUFlO1lBQzlCLE9BQU8sSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUM7UUFDekMsQ0FBQztRQUVTLHlCQUF5QjtZQUNsQyxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFUyxLQUFLLENBQUMseUJBQXlCO1lBQ3hDLE9BQU8sRUFBRSxDQUFDO1FBQ1gsQ0FBQztLQUNELENBQUE7SUExQlksc0ZBQXFDO29EQUFyQyxxQ0FBcUM7UUFLL0MsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLHNDQUFrQixDQUFBO1FBQ2xCLFdBQUEsK0JBQWtCLENBQUE7UUFDbEIsV0FBQSwwQkFBZSxDQUFBO1FBQ2YsV0FBQSw2QkFBaUIsQ0FBQTtRQUNqQixXQUFBLHdCQUFjLENBQUE7T0FWSixxQ0FBcUMsQ0EwQmpEO0lBRUQsTUFBYSxjQUFlLFNBQVEsK0JBQVk7aUJBRS9CLE9BQUUsR0FBRyw0QkFBNEIsQ0FBQztRQUVsRDtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsY0FBYyxDQUFDLEVBQUU7Z0JBQ3JCLEtBQUssRUFBRSxtQ0FBZSxDQUFDLHVCQUF1QjtnQkFDOUMsS0FBSyxFQUFFLGlCQUFpQjtnQkFDeEIsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLE1BQU0sRUFBRTtvQkFDUCxNQUFNLEVBQUUscUNBQWlCLENBQUMsS0FBSztvQkFDL0IsT0FBTyxxQkFBWTtvQkFDbkIsTUFBTSwwQ0FBZ0M7aUJBQ3RDO2dCQUNELGVBQWUsRUFBRTtvQkFDaEIsS0FBSyxFQUFFLFlBQVk7b0JBQ25CLEtBQUssRUFBRSxDQUFDO2lCQUNSO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELEdBQUcsQ0FBQyxRQUEwQjtZQUM3QixRQUFRLENBQUMsR0FBRyxDQUFDLCtCQUFrQixDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxxQ0FBcUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNqRyxDQUFDOztJQXhCRix3Q0F5QkM7SUFFRCxJQUFBLHVDQUFvQixFQUFDLGNBQWMsQ0FBQyxDQUFDO0lBRXJDLG1CQUFRLENBQUMsRUFBRSxDQUF1Qix3QkFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLDJCQUEyQixDQUFDO1FBQ3JGLElBQUksRUFBRSxxQ0FBcUM7UUFDM0MsTUFBTSxFQUFFLHFDQUFxQyxDQUFDLE1BQU07UUFDcEQsV0FBVyxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUUsbUNBQWUsQ0FBQyxnQkFBZ0IsRUFBRSxTQUFTLEVBQUUsY0FBYyxDQUFDLEVBQUUsRUFBRSxDQUFDO0tBQzlGLENBQUMsQ0FBQyJ9