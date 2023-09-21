/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/editorContextKeys", "vs/nls!vs/workbench/contrib/webviewPanel/browser/webviewCommands", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/action/common/actionCommonCategories", "vs/workbench/contrib/webview/browser/webview", "vs/workbench/contrib/webviewPanel/browser/webviewEditor", "vs/workbench/contrib/webviewPanel/browser/webviewEditorInput", "vs/workbench/services/editor/common/editorService"], function (require, exports, editorContextKeys_1, nls, actions_1, contextkey_1, actionCommonCategories_1, webview_1, webviewEditor_1, webviewEditorInput_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$KTb = exports.$JTb = exports.$ITb = exports.$HTb = exports.$GTb = void 0;
    const webviewActiveContextKeyExpr = contextkey_1.$Ii.and(contextkey_1.$Ii.equals('activeEditor', webviewEditor_1.$gfb.ID), editorContextKeys_1.EditorContextKeys.focus.toNegated() /* https://github.com/microsoft/vscode/issues/58668 */);
    class $GTb extends actions_1.$Wu {
        static { this.ID = 'editor.action.webvieweditor.showFind'; }
        static { this.LABEL = nls.localize(0, null); }
        constructor() {
            super({
                id: $GTb.ID,
                title: $GTb.LABEL,
                keybinding: {
                    when: contextkey_1.$Ii.and(webviewActiveContextKeyExpr, webview_1.$Kbb),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 36 /* KeyCode.KeyF */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor) {
            getActiveWebviewEditor(accessor)?.showFind();
        }
    }
    exports.$GTb = $GTb;
    class $HTb extends actions_1.$Wu {
        static { this.ID = 'editor.action.webvieweditor.hideFind'; }
        static { this.LABEL = nls.localize(1, null); }
        constructor() {
            super({
                id: $HTb.ID,
                title: $HTb.LABEL,
                keybinding: {
                    when: contextkey_1.$Ii.and(webviewActiveContextKeyExpr, webview_1.$Ibb),
                    primary: 9 /* KeyCode.Escape */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor) {
            getActiveWebviewEditor(accessor)?.hideFind();
        }
    }
    exports.$HTb = $HTb;
    class $ITb extends actions_1.$Wu {
        static { this.ID = 'editor.action.webvieweditor.findNext'; }
        static { this.LABEL = nls.localize(2, null); }
        constructor() {
            super({
                id: $ITb.ID,
                title: $ITb.LABEL,
                keybinding: {
                    when: contextkey_1.$Ii.and(webviewActiveContextKeyExpr, webview_1.$Jbb),
                    primary: 3 /* KeyCode.Enter */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor) {
            getActiveWebviewEditor(accessor)?.runFindAction(false);
        }
    }
    exports.$ITb = $ITb;
    class $JTb extends actions_1.$Wu {
        static { this.ID = 'editor.action.webvieweditor.findPrevious'; }
        static { this.LABEL = nls.localize(3, null); }
        constructor() {
            super({
                id: $JTb.ID,
                title: $JTb.LABEL,
                keybinding: {
                    when: contextkey_1.$Ii.and(webviewActiveContextKeyExpr, webview_1.$Jbb),
                    primary: 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor) {
            getActiveWebviewEditor(accessor)?.runFindAction(true);
        }
    }
    exports.$JTb = $JTb;
    class $KTb extends actions_1.$Wu {
        static { this.ID = 'workbench.action.webview.reloadWebviewAction'; }
        static { this.LABEL = nls.localize(4, null); }
        constructor() {
            super({
                id: $KTb.ID,
                title: { value: $KTb.LABEL, original: 'Reload Webviews' },
                category: actionCommonCategories_1.$Nl.Developer,
                menu: [{
                        id: actions_1.$Ru.CommandPalette
                    }]
            });
        }
        async run(accessor) {
            const webviewService = accessor.get(webview_1.$Lbb);
            for (const webview of webviewService.webviews) {
                webview.reload();
            }
        }
    }
    exports.$KTb = $KTb;
    function getActiveWebviewEditor(accessor) {
        const editorService = accessor.get(editorService_1.$9C);
        const activeEditor = editorService.activeEditor;
        return activeEditor instanceof webviewEditorInput_1.$cfb ? activeEditor.webview : undefined;
    }
});
//# sourceMappingURL=webviewCommands.js.map