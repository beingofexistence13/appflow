/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/editor/contrib/clipboard/browser/clipboard", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/webview/browser/webview", "vs/workbench/contrib/webviewPanel/browser/webviewEditorInput", "vs/workbench/services/editor/common/editorService"], function (require, exports, editorExtensions_1, clipboard_1, nls, actions_1, contextkey_1, webview_1, webviewEditorInput_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PreventDefaultContextMenuItemsContextKeyName = void 0;
    const PRIORITY = 100;
    function overrideCommandForWebview(command, f) {
        command?.addImplementation(PRIORITY, 'webview', accessor => {
            const webviewService = accessor.get(webview_1.IWebviewService);
            const webview = webviewService.activeWebview;
            if (webview?.isFocused) {
                f(webview);
                return true;
            }
            // When focused in a custom menu try to fallback to the active webview
            // This is needed for context menu actions and the menubar
            if (document.activeElement?.classList.contains('action-menu-item')) {
                const editorService = accessor.get(editorService_1.IEditorService);
                if (editorService.activeEditor instanceof webviewEditorInput_1.WebviewInput) {
                    f(editorService.activeEditor.webview);
                    return true;
                }
            }
            return false;
        });
    }
    overrideCommandForWebview(editorExtensions_1.UndoCommand, webview => webview.undo());
    overrideCommandForWebview(editorExtensions_1.RedoCommand, webview => webview.redo());
    overrideCommandForWebview(editorExtensions_1.SelectAllCommand, webview => webview.selectAll());
    overrideCommandForWebview(clipboard_1.CopyAction, webview => webview.copy());
    overrideCommandForWebview(clipboard_1.PasteAction, webview => webview.paste());
    overrideCommandForWebview(clipboard_1.CutAction, webview => webview.cut());
    exports.PreventDefaultContextMenuItemsContextKeyName = 'preventDefaultContextMenuItems';
    if (clipboard_1.CutAction) {
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.WebviewContext, {
            command: {
                id: clipboard_1.CutAction.id,
                title: nls.localize('cut', "Cut"),
            },
            group: '5_cutcopypaste',
            order: 1,
            when: contextkey_1.ContextKeyExpr.not(exports.PreventDefaultContextMenuItemsContextKeyName),
        });
    }
    if (clipboard_1.CopyAction) {
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.WebviewContext, {
            command: {
                id: clipboard_1.CopyAction.id,
                title: nls.localize('copy', "Copy"),
            },
            group: '5_cutcopypaste',
            order: 2,
            when: contextkey_1.ContextKeyExpr.not(exports.PreventDefaultContextMenuItemsContextKeyName),
        });
    }
    if (clipboard_1.PasteAction) {
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.WebviewContext, {
            command: {
                id: clipboard_1.PasteAction.id,
                title: nls.localize('paste', "Paste"),
            },
            group: '5_cutcopypaste',
            order: 3,
            when: contextkey_1.ContextKeyExpr.not(exports.PreventDefaultContextMenuItemsContextKeyName),
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vidmlldy5jb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi93ZWJ2aWV3L2Jyb3dzZXIvd2Vidmlldy5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBWWhHLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQztJQUVyQixTQUFTLHlCQUF5QixDQUFDLE9BQWlDLEVBQUUsQ0FBOEI7UUFDbkcsT0FBTyxFQUFFLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLEVBQUU7WUFDMUQsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyx5QkFBZSxDQUFDLENBQUM7WUFDckQsTUFBTSxPQUFPLEdBQUcsY0FBYyxDQUFDLGFBQWEsQ0FBQztZQUM3QyxJQUFJLE9BQU8sRUFBRSxTQUFTLEVBQUU7Z0JBQ3ZCLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDWCxPQUFPLElBQUksQ0FBQzthQUNaO1lBRUQsc0VBQXNFO1lBQ3RFLDBEQUEwRDtZQUMxRCxJQUFJLFFBQVEsQ0FBQyxhQUFhLEVBQUUsU0FBUyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO2dCQUNuRSxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDhCQUFjLENBQUMsQ0FBQztnQkFDbkQsSUFBSSxhQUFhLENBQUMsWUFBWSxZQUFZLGlDQUFZLEVBQUU7b0JBQ3ZELENBQUMsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUN0QyxPQUFPLElBQUksQ0FBQztpQkFDWjthQUNEO1lBRUQsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRCx5QkFBeUIsQ0FBQyw4QkFBVyxFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7SUFDbEUseUJBQXlCLENBQUMsOEJBQVcsRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ2xFLHlCQUF5QixDQUFDLG1DQUFnQixFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7SUFDNUUseUJBQXlCLENBQUMsc0JBQVUsRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ2pFLHlCQUF5QixDQUFDLHVCQUFXLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUNuRSx5QkFBeUIsQ0FBQyxxQkFBUyxFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFFbEQsUUFBQSw0Q0FBNEMsR0FBRyxnQ0FBZ0MsQ0FBQztJQUU3RixJQUFJLHFCQUFTLEVBQUU7UUFDZCxzQkFBWSxDQUFDLGNBQWMsQ0FBQyxnQkFBTSxDQUFDLGNBQWMsRUFBRTtZQUNsRCxPQUFPLEVBQUU7Z0JBQ1IsRUFBRSxFQUFFLHFCQUFTLENBQUMsRUFBRTtnQkFDaEIsS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQzthQUNqQztZQUNELEtBQUssRUFBRSxnQkFBZ0I7WUFDdkIsS0FBSyxFQUFFLENBQUM7WUFDUixJQUFJLEVBQUUsMkJBQWMsQ0FBQyxHQUFHLENBQUMsb0RBQTRDLENBQUM7U0FDdEUsQ0FBQyxDQUFDO0tBQ0g7SUFFRCxJQUFJLHNCQUFVLEVBQUU7UUFDZixzQkFBWSxDQUFDLGNBQWMsQ0FBQyxnQkFBTSxDQUFDLGNBQWMsRUFBRTtZQUNsRCxPQUFPLEVBQUU7Z0JBQ1IsRUFBRSxFQUFFLHNCQUFVLENBQUMsRUFBRTtnQkFDakIsS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQzthQUNuQztZQUNELEtBQUssRUFBRSxnQkFBZ0I7WUFDdkIsS0FBSyxFQUFFLENBQUM7WUFDUixJQUFJLEVBQUUsMkJBQWMsQ0FBQyxHQUFHLENBQUMsb0RBQTRDLENBQUM7U0FDdEUsQ0FBQyxDQUFDO0tBQ0g7SUFFRCxJQUFJLHVCQUFXLEVBQUU7UUFDaEIsc0JBQVksQ0FBQyxjQUFjLENBQUMsZ0JBQU0sQ0FBQyxjQUFjLEVBQUU7WUFDbEQsT0FBTyxFQUFFO2dCQUNSLEVBQUUsRUFBRSx1QkFBVyxDQUFDLEVBQUU7Z0JBQ2xCLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUM7YUFDckM7WUFDRCxLQUFLLEVBQUUsZ0JBQWdCO1lBQ3ZCLEtBQUssRUFBRSxDQUFDO1lBQ1IsSUFBSSxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUFDLG9EQUE0QyxDQUFDO1NBQ3RFLENBQUMsQ0FBQztLQUNIIn0=