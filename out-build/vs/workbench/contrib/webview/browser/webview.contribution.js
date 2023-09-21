/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/editor/contrib/clipboard/browser/clipboard", "vs/nls!vs/workbench/contrib/webview/browser/webview.contribution", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/webview/browser/webview", "vs/workbench/contrib/webviewPanel/browser/webviewEditorInput", "vs/workbench/services/editor/common/editorService"], function (require, exports, editorExtensions_1, clipboard_1, nls, actions_1, contextkey_1, webview_1, webviewEditorInput_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$FTb = void 0;
    const PRIORITY = 100;
    function overrideCommandForWebview(command, f) {
        command?.addImplementation(PRIORITY, 'webview', accessor => {
            const webviewService = accessor.get(webview_1.$Lbb);
            const webview = webviewService.activeWebview;
            if (webview?.isFocused) {
                f(webview);
                return true;
            }
            // When focused in a custom menu try to fallback to the active webview
            // This is needed for context menu actions and the menubar
            if (document.activeElement?.classList.contains('action-menu-item')) {
                const editorService = accessor.get(editorService_1.$9C);
                if (editorService.activeEditor instanceof webviewEditorInput_1.$cfb) {
                    f(editorService.activeEditor.webview);
                    return true;
                }
            }
            return false;
        });
    }
    overrideCommandForWebview(editorExtensions_1.$CV, webview => webview.undo());
    overrideCommandForWebview(editorExtensions_1.$DV, webview => webview.redo());
    overrideCommandForWebview(editorExtensions_1.$EV, webview => webview.selectAll());
    overrideCommandForWebview(clipboard_1.$i1, webview => webview.copy());
    overrideCommandForWebview(clipboard_1.$j1, webview => webview.paste());
    overrideCommandForWebview(clipboard_1.$h1, webview => webview.cut());
    exports.$FTb = 'preventDefaultContextMenuItems';
    if (clipboard_1.$h1) {
        actions_1.$Tu.appendMenuItem(actions_1.$Ru.WebviewContext, {
            command: {
                id: clipboard_1.$h1.id,
                title: nls.localize(0, null),
            },
            group: '5_cutcopypaste',
            order: 1,
            when: contextkey_1.$Ii.not(exports.$FTb),
        });
    }
    if (clipboard_1.$i1) {
        actions_1.$Tu.appendMenuItem(actions_1.$Ru.WebviewContext, {
            command: {
                id: clipboard_1.$i1.id,
                title: nls.localize(1, null),
            },
            group: '5_cutcopypaste',
            order: 2,
            when: contextkey_1.$Ii.not(exports.$FTb),
        });
    }
    if (clipboard_1.$j1) {
        actions_1.$Tu.appendMenuItem(actions_1.$Ru.WebviewContext, {
            command: {
                id: clipboard_1.$j1.id,
                title: nls.localize(2, null),
            },
            group: '5_cutcopypaste',
            order: 3,
            when: contextkey_1.$Ii.not(exports.$FTb),
        });
    }
});
//# sourceMappingURL=webview.contribution.js.map