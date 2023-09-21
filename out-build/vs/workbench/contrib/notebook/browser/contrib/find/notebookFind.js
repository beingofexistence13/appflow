/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network", "vs/base/common/resources", "vs/editor/browser/services/codeEditorService", "vs/editor/common/editorContextKeys", "vs/editor/contrib/find/browser/findController", "vs/nls!vs/workbench/contrib/notebook/browser/contrib/find/notebookFind", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/notebook/browser/contrib/find/notebookFindWidget", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/notebookEditorExtensions", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/services/editor/common/editorService", "vs/css!./media/notebookFind"], function (require, exports, network_1, resources_1, codeEditorService_1, editorContextKeys_1, findController_1, nls_1, actions_1, contextkey_1, notebookFindWidget_1, notebookBrowser_1, notebookEditorExtensions_1, notebookCommon_1, notebookContextKeys_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, notebookEditorExtensions_1.$Fnb)(notebookFindWidget_1.$nFb.id, notebookFindWidget_1.$nFb);
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'notebook.hideFind',
                title: { value: (0, nls_1.localize)(0, null), original: 'Hide Find in Notebook' },
                keybinding: {
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, notebookContextKeys_1.$Unb),
                    primary: 9 /* KeyCode.Escape */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                }
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            const editor = (0, notebookBrowser_1.$Zbb)(editorService.activeEditorPane);
            if (!editor) {
                return;
            }
            const controller = editor.getContribution(notebookFindWidget_1.$nFb.id);
            controller.hide();
            editor.focus();
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'notebook.find',
                title: { value: (0, nls_1.localize)(1, null), original: 'Find in Notebook' },
                keybinding: {
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, contextkey_1.$Ii.or(notebookContextKeys_1.$Wnb, notebookContextKeys_1.$Xnb), editorContextKeys_1.EditorContextKeys.focus.toNegated()),
                    primary: 36 /* KeyCode.KeyF */ | 2048 /* KeyMod.CtrlCmd */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                }
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            const editor = (0, notebookBrowser_1.$Zbb)(editorService.activeEditorPane);
            if (!editor) {
                return;
            }
            const controller = editor.getContribution(notebookFindWidget_1.$nFb.id);
            controller.show();
        }
    });
    function notebookContainsTextModel(uri, textModel) {
        if (textModel.uri.scheme === network_1.Schemas.vscodeNotebookCell) {
            const cellUri = notebookCommon_1.CellUri.parse(textModel.uri);
            if (cellUri && (0, resources_1.$bg)(cellUri.notebook, uri)) {
                return true;
            }
        }
        return false;
    }
    function getSearchStringOptions(editor, opts) {
        // Get the search string result, following the same logic in _start function in 'vs/editor/contrib/find/browser/findController'
        if (opts.seedSearchStringFromSelection === 'single') {
            const selectionSearchString = (0, findController_1.$V7)(editor, opts.seedSearchStringFromSelection, opts.seedSearchStringFromNonEmptySelection);
            if (selectionSearchString) {
                return {
                    searchString: selectionSearchString,
                    selection: editor.getSelection()
                };
            }
        }
        else if (opts.seedSearchStringFromSelection === 'multiple' && !opts.updateSearchScope) {
            const selectionSearchString = (0, findController_1.$V7)(editor, opts.seedSearchStringFromSelection);
            if (selectionSearchString) {
                return {
                    searchString: selectionSearchString,
                    selection: editor.getSelection()
                };
            }
        }
        return undefined;
    }
    findController_1.$Y7.addImplementation(100, (accessor, codeEditor, args) => {
        const editorService = accessor.get(editorService_1.$9C);
        const editor = (0, notebookBrowser_1.$Zbb)(editorService.activeEditorPane);
        if (!editor) {
            return false;
        }
        if (!codeEditor.hasModel()) {
            return false;
        }
        if (!editor.hasEditorFocus() && !editor.hasWebviewFocus()) {
            const codeEditorService = accessor.get(codeEditorService_1.$nV);
            // check if the active pane contains the active text editor
            const textEditor = codeEditorService.getFocusedCodeEditor() || codeEditorService.getActiveCodeEditor();
            if (editor.hasModel() && textEditor && textEditor.hasModel() && notebookContainsTextModel(editor.textModel.uri, textEditor.getModel())) {
                // the active text editor is in notebook editor
            }
            else {
                return false;
            }
        }
        const controller = editor.getContribution(notebookFindWidget_1.$nFb.id);
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
    findController_1.$97.addImplementation(100, (accessor, codeEditor, args) => {
        const editorService = accessor.get(editorService_1.$9C);
        const editor = (0, notebookBrowser_1.$Zbb)(editorService.activeEditorPane);
        if (!editor) {
            return false;
        }
        if (!codeEditor.hasModel()) {
            return false;
        }
        const controller = editor.getContribution(notebookFindWidget_1.$nFb.id);
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
//# sourceMappingURL=notebookFind.js.map