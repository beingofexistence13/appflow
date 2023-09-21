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
define(["require", "exports", "vs/editor/contrib/quickAccess/browser/gotoSymbolQuickAccess", "vs/platform/registry/common/platform", "vs/platform/quickinput/common/quickAccess", "vs/editor/browser/services/codeEditorService", "vs/editor/common/standaloneStrings", "vs/base/common/event", "vs/editor/browser/editorExtensions", "vs/editor/common/editorContextKeys", "vs/platform/quickinput/common/quickInput", "vs/editor/contrib/documentSymbols/browser/outlineModel", "vs/editor/common/services/languageFeatures", "vs/base/browser/ui/codicons/codiconStyles", "vs/editor/contrib/symbolIcons/browser/symbolIcons"], function (require, exports, gotoSymbolQuickAccess_1, platform_1, quickAccess_1, codeEditorService_1, standaloneStrings_1, event_1, editorExtensions_1, editorContextKeys_1, quickInput_1, outlineModel_1, languageFeatures_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GotoSymbolAction = exports.StandaloneGotoSymbolQuickAccessProvider = void 0;
    let StandaloneGotoSymbolQuickAccessProvider = class StandaloneGotoSymbolQuickAccessProvider extends gotoSymbolQuickAccess_1.AbstractGotoSymbolQuickAccessProvider {
        constructor(editorService, languageFeaturesService, outlineModelService) {
            super(languageFeaturesService, outlineModelService);
            this.editorService = editorService;
            this.onDidActiveTextEditorControlChange = event_1.Event.None;
        }
        get activeTextEditorControl() {
            return this.editorService.getFocusedCodeEditor() ?? undefined;
        }
    };
    exports.StandaloneGotoSymbolQuickAccessProvider = StandaloneGotoSymbolQuickAccessProvider;
    exports.StandaloneGotoSymbolQuickAccessProvider = StandaloneGotoSymbolQuickAccessProvider = __decorate([
        __param(0, codeEditorService_1.ICodeEditorService),
        __param(1, languageFeatures_1.ILanguageFeaturesService),
        __param(2, outlineModel_1.IOutlineModelService)
    ], StandaloneGotoSymbolQuickAccessProvider);
    class GotoSymbolAction extends editorExtensions_1.EditorAction {
        static { this.ID = 'editor.action.quickOutline'; }
        constructor() {
            super({
                id: GotoSymbolAction.ID,
                label: standaloneStrings_1.QuickOutlineNLS.quickOutlineActionLabel,
                alias: 'Go to Symbol...',
                precondition: editorContextKeys_1.EditorContextKeys.hasDocumentSymbolProvider,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 45 /* KeyCode.KeyO */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                contextMenuOpts: {
                    group: 'navigation',
                    order: 3
                }
            });
        }
        run(accessor) {
            accessor.get(quickInput_1.IQuickInputService).quickAccess.show(gotoSymbolQuickAccess_1.AbstractGotoSymbolQuickAccessProvider.PREFIX, { itemActivation: quickInput_1.ItemActivation.NONE });
        }
    }
    exports.GotoSymbolAction = GotoSymbolAction;
    (0, editorExtensions_1.registerEditorAction)(GotoSymbolAction);
    platform_1.Registry.as(quickAccess_1.Extensions.Quickaccess).registerQuickAccessProvider({
        ctor: StandaloneGotoSymbolQuickAccessProvider,
        prefix: gotoSymbolQuickAccess_1.AbstractGotoSymbolQuickAccessProvider.PREFIX,
        helpEntries: [
            { description: standaloneStrings_1.QuickOutlineNLS.quickOutlineActionLabel, prefix: gotoSymbolQuickAccess_1.AbstractGotoSymbolQuickAccessProvider.PREFIX, commandId: GotoSymbolAction.ID },
            { description: standaloneStrings_1.QuickOutlineNLS.quickOutlineByCategoryActionLabel, prefix: gotoSymbolQuickAccess_1.AbstractGotoSymbolQuickAccessProvider.PREFIX_BY_CATEGORY }
        ]
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhbmRhbG9uZUdvdG9TeW1ib2xRdWlja0FjY2Vzcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9zdGFuZGFsb25lL2Jyb3dzZXIvcXVpY2tBY2Nlc3Mvc3RhbmRhbG9uZUdvdG9TeW1ib2xRdWlja0FjY2Vzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFtQnpGLElBQU0sdUNBQXVDLEdBQTdDLE1BQU0sdUNBQXdDLFNBQVEsNkRBQXFDO1FBSWpHLFlBQ3FCLGFBQWtELEVBQzVDLHVCQUFpRCxFQUNyRCxtQkFBeUM7WUFFL0QsS0FBSyxDQUFDLHVCQUF1QixFQUFFLG1CQUFtQixDQUFDLENBQUM7WUFKZixrQkFBYSxHQUFiLGFBQWEsQ0FBb0I7WUFIcEQsdUNBQWtDLEdBQUcsYUFBSyxDQUFDLElBQUksQ0FBQztRQVFuRSxDQUFDO1FBRUQsSUFBYyx1QkFBdUI7WUFDcEMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLG9CQUFvQixFQUFFLElBQUksU0FBUyxDQUFDO1FBQy9ELENBQUM7S0FDRCxDQUFBO0lBZlksMEZBQXVDO3NEQUF2Qyx1Q0FBdUM7UUFLakQsV0FBQSxzQ0FBa0IsQ0FBQTtRQUNsQixXQUFBLDJDQUF3QixDQUFBO1FBQ3hCLFdBQUEsbUNBQW9CLENBQUE7T0FQVix1Q0FBdUMsQ0FlbkQ7SUFFRCxNQUFhLGdCQUFpQixTQUFRLCtCQUFZO2lCQUVqQyxPQUFFLEdBQUcsNEJBQTRCLENBQUM7UUFFbEQ7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLGdCQUFnQixDQUFDLEVBQUU7Z0JBQ3ZCLEtBQUssRUFBRSxtQ0FBZSxDQUFDLHVCQUF1QjtnQkFDOUMsS0FBSyxFQUFFLGlCQUFpQjtnQkFDeEIsWUFBWSxFQUFFLHFDQUFpQixDQUFDLHlCQUF5QjtnQkFDekQsTUFBTSxFQUFFO29CQUNQLE1BQU0sRUFBRSxxQ0FBaUIsQ0FBQyxLQUFLO29CQUMvQixPQUFPLEVBQUUsbURBQTZCLHdCQUFlO29CQUNyRCxNQUFNLDBDQUFnQztpQkFDdEM7Z0JBQ0QsZUFBZSxFQUFFO29CQUNoQixLQUFLLEVBQUUsWUFBWTtvQkFDbkIsS0FBSyxFQUFFLENBQUM7aUJBQ1I7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsR0FBRyxDQUFDLFFBQTBCO1lBQzdCLFFBQVEsQ0FBQyxHQUFHLENBQUMsK0JBQWtCLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLDZEQUFxQyxDQUFDLE1BQU0sRUFBRSxFQUFFLGNBQWMsRUFBRSwyQkFBYyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7UUFDMUksQ0FBQzs7SUF4QkYsNENBeUJDO0lBRUQsSUFBQSx1Q0FBb0IsRUFBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBRXZDLG1CQUFRLENBQUMsRUFBRSxDQUF1Qix3QkFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLDJCQUEyQixDQUFDO1FBQ3JGLElBQUksRUFBRSx1Q0FBdUM7UUFDN0MsTUFBTSxFQUFFLDZEQUFxQyxDQUFDLE1BQU07UUFDcEQsV0FBVyxFQUFFO1lBQ1osRUFBRSxXQUFXLEVBQUUsbUNBQWUsQ0FBQyx1QkFBdUIsRUFBRSxNQUFNLEVBQUUsNkRBQXFDLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxnQkFBZ0IsQ0FBQyxFQUFFLEVBQUU7WUFDOUksRUFBRSxXQUFXLEVBQUUsbUNBQWUsQ0FBQyxpQ0FBaUMsRUFBRSxNQUFNLEVBQUUsNkRBQXFDLENBQUMsa0JBQWtCLEVBQUU7U0FDcEk7S0FDRCxDQUFDLENBQUMifQ==