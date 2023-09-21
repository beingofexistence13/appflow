/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/editorContextKeys", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/action/common/actionCommonCategories", "vs/workbench/contrib/webview/browser/webview", "vs/workbench/contrib/webviewPanel/browser/webviewEditor", "vs/workbench/contrib/webviewPanel/browser/webviewEditorInput", "vs/workbench/services/editor/common/editorService"], function (require, exports, editorContextKeys_1, nls, actions_1, contextkey_1, actionCommonCategories_1, webview_1, webviewEditor_1, webviewEditorInput_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReloadWebviewAction = exports.WebViewEditorFindPreviousCommand = exports.WebViewEditorFindNextCommand = exports.HideWebViewEditorFindCommand = exports.ShowWebViewEditorFindWidgetAction = void 0;
    const webviewActiveContextKeyExpr = contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('activeEditor', webviewEditor_1.WebviewEditor.ID), editorContextKeys_1.EditorContextKeys.focus.toNegated() /* https://github.com/microsoft/vscode/issues/58668 */);
    class ShowWebViewEditorFindWidgetAction extends actions_1.Action2 {
        static { this.ID = 'editor.action.webvieweditor.showFind'; }
        static { this.LABEL = nls.localize('editor.action.webvieweditor.showFind', "Show find"); }
        constructor() {
            super({
                id: ShowWebViewEditorFindWidgetAction.ID,
                title: ShowWebViewEditorFindWidgetAction.LABEL,
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(webviewActiveContextKeyExpr, webview_1.KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_ENABLED),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 36 /* KeyCode.KeyF */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor) {
            getActiveWebviewEditor(accessor)?.showFind();
        }
    }
    exports.ShowWebViewEditorFindWidgetAction = ShowWebViewEditorFindWidgetAction;
    class HideWebViewEditorFindCommand extends actions_1.Action2 {
        static { this.ID = 'editor.action.webvieweditor.hideFind'; }
        static { this.LABEL = nls.localize('editor.action.webvieweditor.hideFind', "Stop find"); }
        constructor() {
            super({
                id: HideWebViewEditorFindCommand.ID,
                title: HideWebViewEditorFindCommand.LABEL,
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(webviewActiveContextKeyExpr, webview_1.KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_VISIBLE),
                    primary: 9 /* KeyCode.Escape */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor) {
            getActiveWebviewEditor(accessor)?.hideFind();
        }
    }
    exports.HideWebViewEditorFindCommand = HideWebViewEditorFindCommand;
    class WebViewEditorFindNextCommand extends actions_1.Action2 {
        static { this.ID = 'editor.action.webvieweditor.findNext'; }
        static { this.LABEL = nls.localize('editor.action.webvieweditor.findNext', 'Find next'); }
        constructor() {
            super({
                id: WebViewEditorFindNextCommand.ID,
                title: WebViewEditorFindNextCommand.LABEL,
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(webviewActiveContextKeyExpr, webview_1.KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_FOCUSED),
                    primary: 3 /* KeyCode.Enter */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor) {
            getActiveWebviewEditor(accessor)?.runFindAction(false);
        }
    }
    exports.WebViewEditorFindNextCommand = WebViewEditorFindNextCommand;
    class WebViewEditorFindPreviousCommand extends actions_1.Action2 {
        static { this.ID = 'editor.action.webvieweditor.findPrevious'; }
        static { this.LABEL = nls.localize('editor.action.webvieweditor.findPrevious', 'Find previous'); }
        constructor() {
            super({
                id: WebViewEditorFindPreviousCommand.ID,
                title: WebViewEditorFindPreviousCommand.LABEL,
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(webviewActiveContextKeyExpr, webview_1.KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_FOCUSED),
                    primary: 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor) {
            getActiveWebviewEditor(accessor)?.runFindAction(true);
        }
    }
    exports.WebViewEditorFindPreviousCommand = WebViewEditorFindPreviousCommand;
    class ReloadWebviewAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.webview.reloadWebviewAction'; }
        static { this.LABEL = nls.localize('refreshWebviewLabel', "Reload Webviews"); }
        constructor() {
            super({
                id: ReloadWebviewAction.ID,
                title: { value: ReloadWebviewAction.LABEL, original: 'Reload Webviews' },
                category: actionCommonCategories_1.Categories.Developer,
                menu: [{
                        id: actions_1.MenuId.CommandPalette
                    }]
            });
        }
        async run(accessor) {
            const webviewService = accessor.get(webview_1.IWebviewService);
            for (const webview of webviewService.webviews) {
                webview.reload();
            }
        }
    }
    exports.ReloadWebviewAction = ReloadWebviewAction;
    function getActiveWebviewEditor(accessor) {
        const editorService = accessor.get(editorService_1.IEditorService);
        const activeEditor = editorService.activeEditor;
        return activeEditor instanceof webviewEditorInput_1.WebviewInput ? activeEditor.webview : undefined;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vidmlld0NvbW1hbmRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvd2Vidmlld1BhbmVsL2Jyb3dzZXIvd2Vidmlld0NvbW1hbmRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWVoRyxNQUFNLDJCQUEyQixHQUFHLDJCQUFjLENBQUMsR0FBRyxDQUFDLDJCQUFjLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSw2QkFBYSxDQUFDLEVBQUUsQ0FBQyxFQUFFLHFDQUFpQixDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQyxzREFBc0QsQ0FBRSxDQUFDO0lBRTdNLE1BQWEsaUNBQWtDLFNBQVEsaUJBQU87aUJBQ3RDLE9BQUUsR0FBRyxzQ0FBc0MsQ0FBQztpQkFDNUMsVUFBSyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsc0NBQXNDLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFFakc7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLGlDQUFpQyxDQUFDLEVBQUU7Z0JBQ3hDLEtBQUssRUFBRSxpQ0FBaUMsQ0FBQyxLQUFLO2dCQUM5QyxVQUFVLEVBQUU7b0JBQ1gsSUFBSSxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUFDLDJCQUEyQixFQUFFLHdEQUE4QyxDQUFDO29CQUNyRyxPQUFPLEVBQUUsaURBQTZCO29CQUN0QyxNQUFNLDBDQUFnQztpQkFDdEM7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO1FBRU0sR0FBRyxDQUFDLFFBQTBCO1lBQ3BDLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDO1FBQzlDLENBQUM7O0lBbEJGLDhFQW1CQztJQUVELE1BQWEsNEJBQTZCLFNBQVEsaUJBQU87aUJBQ2pDLE9BQUUsR0FBRyxzQ0FBc0MsQ0FBQztpQkFDNUMsVUFBSyxHQUFHLEdBQUcsQ0FBQyxR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