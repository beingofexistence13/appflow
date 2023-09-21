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
define(["require", "exports", "vs/base/common/network", "vs/editor/browser/editorExtensions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/keybinding/common/keybinding", "vs/platform/product/common/productService", "vs/platform/telemetry/common/telemetry", "vs/workbench/contrib/codeEditor/browser/emptyTextEditorHint/emptyTextEditorHint", "vs/workbench/contrib/inlineChat/browser/inlineChatSession", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService"], function (require, exports, network_1, editorExtensions_1, commands_1, configuration_1, keybinding_1, productService_1, telemetry_1, emptyTextEditorHint_1, inlineChatSession_1, inlineChat_1, notebookBrowser_1, editorGroupsService_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EmptyCellEditorHintContribution = void 0;
    let EmptyCellEditorHintContribution = class EmptyCellEditorHintContribution extends emptyTextEditorHint_1.EmptyTextEditorHintContribution {
        static { this.CONTRIB_ID = 'notebook.editor.contrib.emptyCellEditorHint'; }
        constructor(editor, _editorService, editorGroupsService, commandService, configurationService, keybindingService, inlineChatSessionService, inlineChatService, telemetryService, productService) {
            super(editor, editorGroupsService, commandService, configurationService, keybindingService, inlineChatSessionService, inlineChatService, telemetryService, productService);
            this._editorService = _editorService;
            const activeEditor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(this._editorService.activeEditorPane);
            if (!activeEditor) {
                return;
            }
            this.toDispose.push(activeEditor.onDidChangeActiveCell(() => this.update()));
        }
        _shouldRenderHint() {
            const shouldRenderHint = super._shouldRenderHint();
            if (!shouldRenderHint) {
                return false;
            }
            const model = this.editor.getModel();
            if (!model) {
                return false;
            }
            const isNotebookCell = model?.uri.scheme === network_1.Schemas.vscodeNotebookCell;
            if (!isNotebookCell) {
                return false;
            }
            const activeEditor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(this._editorService.activeEditorPane);
            if (!activeEditor) {
                return false;
            }
            const activeCell = activeEditor.getActiveCell();
            if (activeCell?.uri.fragment !== model.uri.fragment) {
                return false;
            }
            return true;
        }
    };
    exports.EmptyCellEditorHintContribution = EmptyCellEditorHintContribution;
    exports.EmptyCellEditorHintContribution = EmptyCellEditorHintContribution = __decorate([
        __param(1, editorService_1.IEditorService),
        __param(2, editorGroupsService_1.IEditorGroupsService),
        __param(3, commands_1.ICommandService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, keybinding_1.IKeybindingService),
        __param(6, inlineChatSession_1.IInlineChatSessionService),
        __param(7, inlineChat_1.IInlineChatService),
        __param(8, telemetry_1.ITelemetryService),
        __param(9, productService_1.IProductService)
    ], EmptyCellEditorHintContribution);
    (0, editorExtensions_1.registerEditorContribution)(EmptyCellEditorHintContribution.CONTRIB_ID, EmptyCellEditorHintContribution, 0 /* EditorContributionInstantiation.Eager */); // eager because it needs to render a help message
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1wdHlDZWxsRWRpdG9ySGludC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvY29udHJpYi9lZGl0b3JIaW50L2VtcHR5Q2VsbEVkaXRvckhpbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBaUJ6RixJQUFNLCtCQUErQixHQUFyQyxNQUFNLCtCQUFnQyxTQUFRLHFEQUErQjtpQkFDNUQsZUFBVSxHQUFHLDZDQUE2QyxBQUFoRCxDQUFpRDtRQUNsRixZQUNDLE1BQW1CLEVBQ2MsY0FBOEIsRUFDekMsbUJBQXlDLEVBQzlDLGNBQStCLEVBQ3pCLG9CQUEyQyxFQUM5QyxpQkFBcUMsRUFDOUIsd0JBQW1ELEVBQzFELGlCQUFxQyxFQUN0QyxnQkFBbUMsRUFDckMsY0FBK0I7WUFFaEQsS0FBSyxDQUNKLE1BQU0sRUFDTixtQkFBbUIsRUFDbkIsY0FBYyxFQUNkLG9CQUFvQixFQUNwQixpQkFBaUIsRUFDakIsd0JBQXdCLEVBQ3hCLGlCQUFpQixFQUNqQixnQkFBZ0IsRUFDaEIsY0FBYyxDQUNkLENBQUM7WUFwQitCLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtZQXNCL0QsTUFBTSxZQUFZLEdBQUcsSUFBQSxpREFBK0IsRUFBQyxJQUFJLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFFM0YsSUFBSSxDQUFDLFlBQVksRUFBRTtnQkFDbEIsT0FBTzthQUNQO1lBRUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDOUUsQ0FBQztRQUVrQixpQkFBaUI7WUFDbkMsTUFBTSxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUNuRCxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQ3RCLE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFFRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ1gsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELE1BQU0sY0FBYyxHQUFHLEtBQUssRUFBRSxHQUFHLENBQUMsTUFBTSxLQUFLLGlCQUFPLENBQUMsa0JBQWtCLENBQUM7WUFDeEUsSUFBSSxDQUFDLGNBQWMsRUFBRTtnQkFDcEIsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELE1BQU0sWUFBWSxHQUFHLElBQUEsaURBQStCLEVBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQzNGLElBQUksQ0FBQyxZQUFZLEVBQUU7Z0JBQ2xCLE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFFRCxNQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsYUFBYSxFQUFFLENBQUM7WUFFaEQsSUFBSSxVQUFVLEVBQUUsR0FBRyxDQUFDLFFBQVEsS0FBSyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRTtnQkFDcEQsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQzs7SUEvRFcsMEVBQStCOzhDQUEvQiwrQkFBK0I7UUFJekMsV0FBQSw4QkFBYyxDQUFBO1FBQ2QsV0FBQSwwQ0FBb0IsQ0FBQTtRQUNwQixXQUFBLDBCQUFlLENBQUE7UUFDZixXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEsK0JBQWtCLENBQUE7UUFDbEIsV0FBQSw2Q0FBeUIsQ0FBQTtRQUN6QixXQUFBLCtCQUFrQixDQUFBO1FBQ2xCLFdBQUEsNkJBQWlCLENBQUE7UUFDakIsV0FBQSxnQ0FBZSxDQUFBO09BWkwsK0JBQStCLENBZ0UzQztJQUVELElBQUEsNkNBQTBCLEVBQUMsK0JBQStCLENBQUMsVUFBVSxFQUFFLCtCQUErQixnREFBd0MsQ0FBQyxDQUFDLGtEQUFrRCJ9