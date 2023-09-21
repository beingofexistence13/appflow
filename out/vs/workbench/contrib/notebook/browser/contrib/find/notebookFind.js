/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network", "vs/base/common/resources", "vs/editor/browser/services/codeEditorService", "vs/editor/common/editorContextKeys", "vs/editor/contrib/find/browser/findController", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/notebook/browser/contrib/find/notebookFindWidget", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/notebookEditorExtensions", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/services/editor/common/editorService", "vs/css!./media/notebookFind"], function (require, exports, network_1, resources_1, codeEditorService_1, editorContextKeys_1, findController_1, nls_1, actions_1, contextkey_1, notebookFindWidget_1, notebookBrowser_1, notebookEditorExtensions_1, notebookCommon_1, notebookContextKeys_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, notebookEditorExtensions_1.registerNotebookContribution)(notebookFindWidget_1.NotebookFindContrib.id, notebookFindWidget_1.NotebookFindContrib);
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'notebook.hideFind',
                title: { value: (0, nls_1.localize)('notebookActions.hideFind', "Hide Find in Notebook"), original: 'Hide Find in Notebook' },
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED, notebookContextKeys_1.KEYBINDING_CONTEXT_NOTEBOOK_FIND_WIDGET_FOCUSED),
                    primary: 9 /* KeyCode.Escape */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                }
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const editor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(editorService.activeEditorPane);
            if (!editor) {
                return;
            }
            const controller = editor.getContribution(notebookFindWidget_1.NotebookFindContrib.id);
            controller.hide();
            editor.focus();
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'notebook.find',
                title: { value: (0, nls_1.localize)('notebookActions.findInNotebook', "Find in Notebook"), original: 'Find in Notebook' },
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED, contextkey_1.ContextKeyExpr.or(notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR, notebookContextKeys_1.INTERACTIVE_WINDOW_IS_ACTIVE_EDITOR), editorContextKeys_1.EditorContextKeys.focus.toNegated()),
                    primary: 36 /* KeyCode.KeyF */ | 2048 /* KeyMod.CtrlCmd */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                }
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const editor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(editorService.activeEditorPane);
            if (!editor) {
                return;
            }
            const controller = editor.getContribution(notebookFindWidget_1.NotebookFindContrib.id);
            controller.show();
        }
    });
    function notebookContainsTextModel(uri, textModel) {
        if (textModel.uri.scheme === network_1.Schemas.vscodeNotebookCell) {
            const cellUri = notebookCommon_1.CellUri.parse(textModel.uri);
            if (cellUri && (0, resources_1.isEqual)(cellUri.notebook, uri)) {
                return true;
            }
        }
        return false;
    }
    function getSearchStringOptions(editor, opts) {
        // Get the search string result, following the same logic in _start function in 'vs/editor/contrib/find/browser/findController'
        if (opts.seedSearchStringFromSelection === 'single') {
            const selectionSearchString = (0, findController_1.getSelectionSearchString)(editor, opts.seedSearchStringFromSelection, opts.seedSearchStringFromNonEmptySelection);
            if (selectionSearchString) {
                return {
                    searchString: selectionSearchString,
                    selection: editor.getSelection()
                };
            }
        }
        else if (opts.seedSearchStringFromSelection === 'multiple' && !opts.updateSearchScope) {
            const selectionSearchString = (0, findController_1.getSelectionSearchString)(editor, opts.seedSearchStringFromSelection);
            if (selectionSearchString) {
                return {
                    searchString: selectionSearchString,
                    selection: editor.getSelection()
                };
            }
        }
        return undefined;
    }
    findController_1.StartFindAction.addImplementation(100, (accessor, codeEditor, args) => {
        const editorService = accessor.get(editorService_1.IEditorService);
        const editor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(editorService.activeEditorPane);
        if (!editor) {
            return false;
        }
        if (!codeEditor.hasModel()) {
            return false;
        }
        if (!editor.hasEditorFocus() && !editor.hasWebviewFocus()) {
            const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
            // check if the active pane contains the active text editor
            const textEditor = codeEditorService.getFocusedCodeEditor() || codeEditorService.getActiveCodeEditor();
            if (editor.hasModel() && textEditor && textEditor.hasModel() && notebookContainsTextModel(editor.textModel.uri, textEditor.getModel())) {
                // the active text editor is in notebook editor
            }
            else {
                return false;
            }
        }
        const controller = editor.getContribution(notebookFindWidget_1.NotebookFindContrib.id);
        const searchStringOptions = getSearchStringOptions(codeEditor, {
            forceRevealReplace: false,
            seedSearchStringFromSelection: codeEditor.getOption(41 /* EditorOption.find */).seedSearchStringFromSelection !== 'never' ? 'single' : 'none',
            seedSearchStringFromNonEmptySelection: codeEditor.getOption(41 /* EditorOption.find */).seedSearchStringFromSelection === 'selection',
            seedSearchStringFromGlobalClipboard: codeEditor.getOption(41 /* EditorOption.find */).globalFindClipboard,
            shouldFocus: 1 /* FindStartFocusAction.FocusFindInput */,
            shouldAnimate: true,
            updateSearchScope: false,
            loop: codeEditor.getOption(41 /* EditorOption.find */).loop
        });
        let options = undefined;
        const uri = codeEditor.getModel().uri;
        const data = notebookCommon_1.CellUri.parse(uri);
        if (searchStringOptions?.selection && data) {
            const cell = editor.getCellByHandle(data.handle);
            if (cell) {
                options = {
                    searchStringSeededFrom: { cell, range: searchStringOptions.selection },
                };
            }
        }
        controller.show(searchStringOptions?.searchString, options);
        return true;
    });
    findController_1.StartFindReplaceAction.addImplementation(100, (accessor, codeEditor, args) => {
        const editorService = accessor.get(editorService_1.IEditorService);
        const editor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(editorService.activeEditorPane);
        if (!editor) {
            return false;
        }
        if (!codeEditor.hasModel()) {
            return false;
        }
        const controller = editor.getContribution(notebookFindWidget_1.NotebookFindContrib.id);
        const searchStringOptions = getSearchStringOptions(codeEditor, {
            forceRevealReplace: false,
            seedSearchStringFromSelection: codeEditor.getOption(41 /* EditorOption.find */).seedSearchStringFromSelection !== 'never' ? 'single' : 'none',
            seedSearchStringFromNonEmptySelection: codeEditor.getOption(41 /* EditorOption.find */).seedSearchStringFromSelection === 'selection',
            seedSearchStringFromGlobalClipboard: codeEditor.getOption(41 /* EditorOption.find */).globalFindClipboard,
            shouldFocus: 1 /* FindStartFocusAction.FocusFindInput */,
            shouldAnimate: true,
            updateSearchScope: false,
            loop: codeEditor.getOption(41 /* EditorOption.find */).loop
        });
        if (controller) {
            controller.replace(searchStringOptions?.searchString);
            return true;
        }
        return false;
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tGaW5kLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci9jb250cmliL2ZpbmQvbm90ZWJvb2tGaW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBeUJoRyxJQUFBLHVEQUE0QixFQUFDLHdDQUFtQixDQUFDLEVBQUUsRUFBRSx3Q0FBbUIsQ0FBQyxDQUFDO0lBRTFFLElBQUEseUJBQWUsRUFBQyxLQUFNLFNBQVEsaUJBQU87UUFDcEM7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLG1CQUFtQjtnQkFDdkIsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLDBCQUEwQixFQUFFLHVCQUF1QixDQUFDLEVBQUUsUUFBUSxFQUFFLHVCQUF1QixFQUFFO2dCQUNsSCxVQUFVLEVBQUU7b0JBQ1gsSUFBSSxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUFDLDZDQUF1QixFQUFFLHFFQUErQyxDQUFDO29CQUNsRyxPQUFPLHdCQUFnQjtvQkFDdkIsTUFBTSw2Q0FBbUM7aUJBQ3pDO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBMEI7WUFDbkMsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyw4QkFBYyxDQUFDLENBQUM7WUFDbkQsTUFBTSxNQUFNLEdBQUcsSUFBQSxpREFBK0IsRUFBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUUvRSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNaLE9BQU87YUFDUDtZQUVELE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQXNCLHdDQUFtQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZGLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNsQixNQUFN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