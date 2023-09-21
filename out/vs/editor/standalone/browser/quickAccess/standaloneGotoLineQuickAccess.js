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
define(["require", "exports", "vs/editor/contrib/quickAccess/browser/gotoLineQuickAccess", "vs/platform/registry/common/platform", "vs/platform/quickinput/common/quickAccess", "vs/editor/browser/services/codeEditorService", "vs/editor/common/standaloneStrings", "vs/base/common/event", "vs/editor/browser/editorExtensions", "vs/editor/common/editorContextKeys", "vs/platform/quickinput/common/quickInput"], function (require, exports, gotoLineQuickAccess_1, platform_1, quickAccess_1, codeEditorService_1, standaloneStrings_1, event_1, editorExtensions_1, editorContextKeys_1, quickInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GotoLineAction = exports.StandaloneGotoLineQuickAccessProvider = void 0;
    let StandaloneGotoLineQuickAccessProvider = class StandaloneGotoLineQuickAccessProvider extends gotoLineQuickAccess_1.AbstractGotoLineQuickAccessProvider {
        constructor(editorService) {
            super();
            this.editorService = editorService;
            this.onDidActiveTextEditorControlChange = event_1.Event.None;
        }
        get activeTextEditorControl() {
            return this.editorService.getFocusedCodeEditor() ?? undefined;
        }
    };
    exports.StandaloneGotoLineQuickAccessProvider = StandaloneGotoLineQuickAccessProvider;
    exports.StandaloneGotoLineQuickAccessProvider = StandaloneGotoLineQuickAccessProvider = __decorate([
        __param(0, codeEditorService_1.ICodeEditorService)
    ], StandaloneGotoLineQuickAccessProvider);
    class GotoLineAction extends editorExtensions_1.EditorAction {
        static { this.ID = 'editor.action.gotoLine'; }
        constructor() {
            super({
                id: GotoLineAction.ID,
                label: standaloneStrings_1.GoToLineNLS.gotoLineActionLabel,
                alias: 'Go to Line/Column...',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 37 /* KeyCode.KeyG */,
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 37 /* KeyCode.KeyG */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor) {
            accessor.get(quickInput_1.IQuickInputService).quickAccess.show(StandaloneGotoLineQuickAccessProvider.PREFIX);
        }
    }
    exports.GotoLineAction = GotoLineAction;
    (0, editorExtensions_1.registerEditorAction)(GotoLineAction);
    platform_1.Registry.as(quickAccess_1.Extensions.Quickaccess).registerQuickAccessProvider({
        ctor: StandaloneGotoLineQuickAccessProvider,
        prefix: StandaloneGotoLineQuickAccessProvider.PREFIX,
        helpEntries: [{ description: standaloneStrings_1.GoToLineNLS.gotoLineActionLabel, commandId: GotoLineAction.ID }]
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhbmRhbG9uZUdvdG9MaW5lUXVpY2tBY2Nlc3MuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3Ivc3RhbmRhbG9uZS9icm93c2VyL3F1aWNrQWNjZXNzL3N0YW5kYWxvbmVHb3RvTGluZVF1aWNrQWNjZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWN6RixJQUFNLHFDQUFxQyxHQUEzQyxNQUFNLHFDQUFzQyxTQUFRLHlEQUFtQztRQUk3RixZQUFnQyxhQUFrRDtZQUNqRixLQUFLLEVBQUUsQ0FBQztZQUR3QyxrQkFBYSxHQUFiLGFBQWEsQ0FBb0I7WUFGL0QsdUNBQWtDLEdBQUcsYUFBSyxDQUFDLElBQUksQ0FBQztRQUluRSxDQUFDO1FBRUQsSUFBYyx1QkFBdUI7WUFDcEMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLG9CQUFvQixFQUFFLElBQUksU0FBUyxDQUFDO1FBQy9ELENBQUM7S0FDRCxDQUFBO0lBWFksc0ZBQXFDO29EQUFyQyxxQ0FBcUM7UUFJcEMsV0FBQSxzQ0FBa0IsQ0FBQTtPQUpuQixxQ0FBcUMsQ0FXakQ7SUFFRCxNQUFhLGNBQWUsU0FBUSwrQkFBWTtpQkFFL0IsT0FBRSxHQUFHLHdCQUF3QixDQUFDO1FBRTlDO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSxjQUFjLENBQUMsRUFBRTtnQkFDckIsS0FBSyxFQUFFLCtCQUFXLENBQUMsbUJBQW1CO2dCQUN0QyxLQUFLLEVBQUUsc0JBQXNCO2dCQUM3QixZQUFZLEVBQUUsU0FBUztnQkFDdkIsTUFBTSxFQUFFO29CQUNQLE1BQU0sRUFBRSxxQ0FBaUIsQ0FBQyxLQUFLO29CQUMvQixPQUFPLEVBQUUsaURBQTZCO29CQUN0QyxHQUFHLEVBQUUsRUFBRSxPQUFPLEVBQUUsZ0RBQTZCLEVBQUU7b0JBQy9DLE1BQU0sMENBQWdDO2lCQUN0QzthQUNELENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxHQUFHLENBQUMsUUFBMEI7WUFDN0IsUUFBUSxDQUFDLEdBQUcsQ0FBQywrQkFBa0IsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMscUNBQXFDLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDakcsQ0FBQzs7SUFyQkYsd0NBc0JDO0lBRUQsSUFBQSx1Q0FBb0IsRUFBQyxjQUFjLENBQUMsQ0FBQztJQUVyQyxtQkFBUSxDQUFDLEVBQUUsQ0FBdUIsd0JBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQywyQkFBMkIsQ0FBQztRQUNyRixJQUFJLEVBQUUscUNBQXFDO1FBQzNDLE1BQU0sRUFBRSxxQ0FBcUMsQ0FBQyxNQUFNO1FBQ3BELFdBQVcsRUFBRSxDQUFDLEVBQUUsV0FBVyxFQUFFLCtCQUFXLENBQUMsbUJBQW1CLEVBQUUsU0FBUyxFQUFFLGNBQWMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztLQUM3RixDQUFDLENBQUMifQ==