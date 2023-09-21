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
define(["require", "exports", "vs/editor/browser/editorBrowser", "vs/editor/browser/services/abstractCodeEditorService", "vs/platform/theme/common/themeService", "vs/workbench/services/editor/common/editorService", "vs/editor/browser/services/codeEditorService", "vs/platform/instantiation/common/extensions", "vs/base/common/resources", "vs/platform/configuration/common/configuration", "vs/workbench/common/editor/editorOptions"], function (require, exports, editorBrowser_1, abstractCodeEditorService_1, themeService_1, editorService_1, codeEditorService_1, extensions_1, resources_1, configuration_1, editorOptions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CodeEditorService = void 0;
    let CodeEditorService = class CodeEditorService extends abstractCodeEditorService_1.AbstractCodeEditorService {
        constructor(editorService, themeService, configurationService) {
            super(themeService);
            this.editorService = editorService;
            this.configurationService = configurationService;
            this._register(this.registerCodeEditorOpenHandler(this.doOpenCodeEditor.bind(this)));
            this._register(this.registerCodeEditorOpenHandler(this.doOpenCodeEditorFromDiff.bind(this)));
        }
        getActiveCodeEditor() {
            const activeTextEditorControl = this.editorService.activeTextEditorControl;
            if ((0, editorBrowser_1.isCodeEditor)(activeTextEditorControl)) {
                return activeTextEditorControl;
            }
            if ((0, editorBrowser_1.isDiffEditor)(activeTextEditorControl)) {
                return activeTextEditorControl.getModifiedEditor();
            }
            const activeControl = this.editorService.activeEditorPane?.getControl();
            if ((0, editorBrowser_1.isCompositeEditor)(activeControl) && (0, editorBrowser_1.isCodeEditor)(activeControl.activeCodeEditor)) {
                return activeControl.activeCodeEditor;
            }
            return null;
        }
        async doOpenCodeEditorFromDiff(input, source, sideBySide) {
            // Special case: If the active editor is a diff editor and the request to open originates and
            // targets the modified side of it, we just apply the request there to prevent opening the modified
            // side as separate editor.
            const activeTextEditorControl = this.editorService.activeTextEditorControl;
            if (!sideBySide && // we need the current active group to be the target
                (0, editorBrowser_1.isDiffEditor)(activeTextEditorControl) && // we only support this for active text diff editors
                input.options && // we need options to apply
                input.resource && // we need a request resource to compare with
                source === activeTextEditorControl.getModifiedEditor() && // we need the source of this request to be the modified side of the diff editor
                activeTextEditorControl.getModel() && // we need a target model to compare with
                (0, resources_1.isEqual)(input.resource, activeTextEditorControl.getModel()?.modified.uri) // we need the input resources to match with modified side
            ) {
                const targetEditor = activeTextEditorControl.getModifiedEditor();
                (0, editorOptions_1.applyTextEditorOptions)(input.options, targetEditor, 0 /* ScrollType.Smooth */);
                return targetEditor;
            }
            return null;
        }
        // Open using our normal editor service
        async doOpenCodeEditor(input, source, sideBySide) {
            // Special case: we want to detect the request to open an editor that
            // is different from the current one to decide whether the current editor
            // should be pinned or not. This ensures that the source of a navigation
            // is not being replaced by the target. An example is "Goto definition"
            // that otherwise would replace the editor everytime the user navigates.
            const enablePreviewFromCodeNavigation = this.configurationService.getValue().workbench?.editor?.enablePreviewFromCodeNavigation;
            if (!enablePreviewFromCodeNavigation && // we only need to do this if the configuration requires it
                source && // we need to know the origin of the navigation
                !input.options?.pinned && // we only need to look at preview editors that open
                !sideBySide && // we only need to care if editor opens in same group
                !(0, resources_1.isEqual)(source.getModel()?.uri, input.resource) // we only need to do this if the editor is about to change
            ) {
                for (const visiblePane of this.editorService.visibleEditorPanes) {
                    if ((0, editorBrowser_1.getCodeEditor)(visiblePane.getControl()) === source) {
                        visiblePane.group.pinEditor();
                        break;
                    }
                }
            }
            // Open as editor
            const control = await this.editorService.openEditor(input, sideBySide ? editorService_1.SIDE_GROUP : editorService_1.ACTIVE_GROUP);
            if (control) {
                const widget = control.getControl();
                if ((0, editorBrowser_1.isCodeEditor)(widget)) {
                    return widget;
                }
                if ((0, editorBrowser_1.isCompositeEditor)(widget) && (0, editorBrowser_1.isCodeEditor)(widget.activeCodeEditor)) {
                    return widget.activeCodeEditor;
                }
            }
            return null;
        }
    };
    exports.CodeEditorService = CodeEditorService;
    exports.CodeEditorService = CodeEditorService = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, themeService_1.IThemeService),
        __param(2, configuration_1.IConfigurationService)
    ], CodeEditorService);
    (0, extensions_1.registerSingleton)(codeEditorService_1.ICodeEditorService, CodeEditorService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUVkaXRvclNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvZWRpdG9yL2Jyb3dzZXIvY29kZUVkaXRvclNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBZXpGLElBQU0saUJBQWlCLEdBQXZCLE1BQU0saUJBQWtCLFNBQVEscURBQXlCO1FBRS9ELFlBQ2tDLGFBQTZCLEVBQy9DLFlBQTJCLEVBQ0Ysb0JBQTJDO1lBRW5GLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUphLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUV0Qix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBSW5GLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JGLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlGLENBQUM7UUFFRCxtQkFBbUI7WUFDbEIsTUFBTSx1QkFBdUIsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLHVCQUF1QixDQUFDO1lBQzNFLElBQUksSUFBQSw0QkFBWSxFQUFDLHVCQUF1QixDQUFDLEVBQUU7Z0JBQzFDLE9BQU8sdUJBQXVCLENBQUM7YUFDL0I7WUFFRCxJQUFJLElBQUEsNEJBQVksRUFBQyx1QkFBdUIsQ0FBQyxFQUFFO2dCQUMxQyxPQUFPLHVCQUF1QixDQUFDLGlCQUFpQixFQUFFLENBQUM7YUFDbkQ7WUFFRCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGdCQUFnQixFQUFFLFVBQVUs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