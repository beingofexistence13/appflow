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
define(["require", "exports", "vs/nls", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/editor/common/editorService", "vs/editor/contrib/quickAccess/browser/gotoLineQuickAccess", "vs/platform/registry/common/platform", "vs/platform/quickinput/common/quickAccess", "vs/platform/configuration/common/configuration", "vs/platform/actions/common/actions", "vs/workbench/services/editor/common/editorGroupsService"], function (require, exports, nls_1, quickInput_1, editorService_1, gotoLineQuickAccess_1, platform_1, quickAccess_1, configuration_1, actions_1, editorGroupsService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GotoLineQuickAccessProvider = void 0;
    let GotoLineQuickAccessProvider = class GotoLineQuickAccessProvider extends gotoLineQuickAccess_1.AbstractGotoLineQuickAccessProvider {
        constructor(editorService, editorGroupService, configurationService) {
            super();
            this.editorService = editorService;
            this.editorGroupService = editorGroupService;
            this.configurationService = configurationService;
            this.onDidActiveTextEditorControlChange = this.editorService.onDidActiveEditorChange;
        }
        get configuration() {
            const editorConfig = this.configurationService.getValue().workbench?.editor;
            return {
                openEditorPinned: !editorConfig?.enablePreviewFromQuickOpen || !editorConfig?.enablePreview
            };
        }
        get activeTextEditorControl() {
            return this.editorService.activeTextEditorControl;
        }
        gotoLocation(context, options) {
            // Check for sideBySide use
            if ((options.keyMods.alt || (this.configuration.openEditorPinned && options.keyMods.ctrlCmd) || options.forceSideBySide) && this.editorService.activeEditor) {
                context.restoreViewState?.(); // since we open to the side, restore view state in this editor
                const editorOptions = {
                    selection: options.range,
                    pinned: options.keyMods.ctrlCmd || this.configuration.openEditorPinned,
                    preserveFocus: options.preserveFocus
                };
                this.editorGroupService.sideGroup.openEditor(this.editorService.activeEditor, editorOptions);
            }
            // Otherwise let parent handle it
            else {
                super.gotoLocation(context, options);
            }
        }
    };
    exports.GotoLineQuickAccessProvider = GotoLineQuickAccessProvider;
    exports.GotoLineQuickAccessProvider = GotoLineQuickAccessProvider = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, editorGroupsService_1.IEditorGroupsService),
        __param(2, configuration_1.IConfigurationService)
    ], GotoLineQuickAccessProvider);
    class GotoLineAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.gotoLine'; }
        constructor() {
            super({
                id: GotoLineAction.ID,
                title: { value: (0, nls_1.localize)('gotoLine', "Go to Line/Column..."), original: 'Go to Line/Column...' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: null,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 37 /* KeyCode.KeyG */,
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 37 /* KeyCode.KeyG */ }
                }
            });
        }
        async run(accessor) {
            accessor.get(quickInput_1.IQuickInputService).quickAccess.show(GotoLineQuickAccessProvider.PREFIX);
        }
    }
    (0, actions_1.registerAction2)(GotoLineAction);
    platform_1.Registry.as(quickAccess_1.Extensions.Quickaccess).registerQuickAccessProvider({
        ctor: GotoLineQuickAccessProvider,
        prefix: gotoLineQuickAccess_1.AbstractGotoLineQuickAccessProvider.PREFIX,
        placeholder: (0, nls_1.localize)('gotoLineQuickAccessPlaceholder', "Type the line number and optional column to go to (e.g. 42:5 for line 42 and column 5)."),
        helpEntries: [{ description: (0, nls_1.localize)('gotoLineQuickAccess', "Go to Line/Column"), commandId: GotoLineAction.ID }]
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ290b0xpbmVRdWlja0FjY2Vzcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NvZGVFZGl0b3IvYnJvd3Nlci9xdWlja2FjY2Vzcy9nb3RvTGluZVF1aWNrQWNjZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQW1CekYsSUFBTSwyQkFBMkIsR0FBakMsTUFBTSwyQkFBNEIsU0FBUSx5REFBbUM7UUFJbkYsWUFDaUIsYUFBOEMsRUFDeEMsa0JBQXlELEVBQ3hELG9CQUE0RDtZQUVuRixLQUFLLEVBQUUsQ0FBQztZQUp5QixrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFDdkIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFzQjtZQUN2Qyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBTGpFLHVDQUFrQyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsdUJBQXVCLENBQUM7UUFRbkcsQ0FBQztRQUVELElBQVksYUFBYTtZQUN4QixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxFQUFpQyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUM7WUFFM0csT0FBTztnQkFDTixnQkFBZ0IsRUFBRSxDQUFDLFlBQVksRUFBRSwwQkFBMEIsSUFBSSxDQUFDLFlBQVksRUFBRSxhQUFhO2FBQzNGLENBQUM7UUFDSCxDQUFDO1FBRUQsSUFBYyx1QkFBdUI7WUFDcEMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLHVCQUF1QixDQUFDO1FBQ25ELENBQUM7UUFFa0IsWUFBWSxDQUFDLE9BQXNDLEVBQUUsT0FBaUc7WUFFeEssMkJBQTJCO1lBQzNCLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxPQUFPLENBQUMsZUFBZSxDQUFDLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUU7Z0JBQzVKLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLENBQUMsQ0FBQywrREFBK0Q7Z0JBRTdGLE1BQU0sYUFBYSxHQUF1QjtvQkFDekMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxLQUFLO29CQUN4QixNQUFNLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0I7b0JBQ3RFLGFBQWEsRUFBRSxPQUFPLENBQUMsYUFBYTtpQkFDcEMsQ0FBQztnQkFFRixJQUFJLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRSxhQUFhLENBQUMsQ0FBQzthQUM3RjtZQUVELGlDQUFpQztpQkFDNUI7Z0JBQ0osS0FBSyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7YUFDckM7UUFDRixDQUFDO0tBQ0QsQ0FBQTtJQTVDWSxrRUFBMkI7MENBQTNCLDJCQUEyQjtRQUtyQyxXQUFBLDhCQUFjLENBQUE7UUFDZCxXQUFBLDBDQUFvQixDQUFBO1FBQ3BCLFdBQUEscUNBQXFCLENBQUE7T0FQWCwyQkFBMkIsQ0E0Q3ZDO0lBRUQsTUFBTSxjQUFlLFNBQVEsaUJBQU87aUJBRW5CLE9BQUUsR0FBRywyQkFBMkIsQ0FBQztRQUVqRDtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsY0FBYyxDQUFDLEVBQUU7Z0JBQ3JCLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxVQUFVLEVBQUUsc0JBQXNCLENBQUMsRUFBRSxRQUFRLEVBQUUsc0JBQXNCLEVBQUU7Z0JBQ2hHLEVBQUUsRUFBRSxJQUFJO2dCQUNSLFVBQVUsRUFBRTtvQkFDWCxNQUFNLDZDQUFtQztvQkFDekMsSUFBSSxFQUFFLElBQUk7b0JBQ1YsT0FBTyxFQUFFLGlEQUE2QjtvQkFDdEMsR0FBRyxFQUFFLEVBQUUsT0FBTyxFQUFFLGdEQUE2QixFQUFFO2lCQUMvQzthQUNELENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQTBCO1lBQ25DLFFBQVEsQ0FBQyxHQUFHLENBQUMsK0JBQWtCLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZGLENBQUM7O0lBR0YsSUFBQSx5QkFBZSxFQUFDLGNBQWMsQ0FBQyxDQUFDO0lBRWhDLG1CQUFRLENBQUMsRUFBRSxDQUF1Qix3QkFBb0IsQ0FBQyxXQUFXLENBQUMsQ0FBQywyQkFBMkIsQ0FBQztRQUMvRixJQUFJLEVBQUUsMkJBQTJCO1FBQ2pDLE1BQU0sRUFBRSx5REFBbUMsQ0FBQyxNQUFNO1FBQ2xELFdBQVcsRUFBRSxJQUFBLGNBQVEsRUFBQyxnQ0FBZ0MsRUFBRSx5RkFBeUYsQ0FBQztRQUNsSixXQUFXLEVBQUUsQ0FBQyxFQUFFLFdBQVcsRUFBRSxJQUFBLGNBQVEsRUFBQyxxQkFBcUIsRUFBRSxtQkFBbUIsQ0FBQyxFQUFFLFNBQVMsRUFBRSxjQUFjLENBQUMsRUFBRSxFQUFFLENBQUM7S0FDbEgsQ0FBQyxDQUFDIn0=