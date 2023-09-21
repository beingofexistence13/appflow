/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/resources", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/dialogs/common/dialogs", "vs/platform/files/common/files", "vs/workbench/contrib/chat/browser/actions/chatActions", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/browser/chatEditorInput", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/chat/common/chatModel", "vs/workbench/contrib/chat/common/chatService", "vs/workbench/services/editor/common/editorService"], function (require, exports, buffer_1, resources_1, nls_1, actions_1, dialogs_1, files_1, chatActions_1, chat_1, chatEditorInput_1, chatContextKeys_1, chatModel_1, chatService_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerChatExportActions = void 0;
    const defaultFileName = 'chat.json';
    const filters = [{ name: (0, nls_1.localize)('chat.file.label', "Chat Session"), extensions: ['json'] }];
    function registerChatExportActions() {
        (0, actions_1.registerAction2)(class ExportChatAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.chat.export',
                    category: chatActions_1.CHAT_CATEGORY,
                    title: {
                        value: (0, nls_1.localize)('chat.export.label', "Export Session") + '...',
                        original: 'Export Session...'
                    },
                    precondition: chatContextKeys_1.CONTEXT_PROVIDER_EXISTS,
                    f1: true,
                });
            }
            async run(accessor, ...args) {
                const widgetService = accessor.get(chat_1.IChatWidgetService);
                const fileDialogService = accessor.get(dialogs_1.IFileDialogService);
                const fileService = accessor.get(files_1.IFileService);
                const chatService = accessor.get(chatService_1.IChatService);
                const widget = widgetService.lastFocusedWidget;
                if (!widget || !widget.viewModel) {
                    return;
                }
                const defaultUri = (0, resources_1.joinPath)(await fileDialogService.defaultFilePath(), defaultFileName);
                const result = await fileDialogService.showSaveDialog({
                    defaultUri,
                    filters
                });
                if (!result) {
                    return;
                }
                const model = chatService.getSession(widget.viewModel.sessionId);
                if (!model) {
                    return;
                }
                // Using toJSON on the model
                const content = buffer_1.VSBuffer.fromString(JSON.stringify(model.toExport(), undefined, 2));
                await fileService.writeFile(result, content);
            }
        });
        (0, actions_1.registerAction2)(class ImportChatAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.chat.import',
                    title: {
                        value: (0, nls_1.localize)('chat.import.label', "Import Session") + '...',
                        original: 'Import Session...'
                    },
                    category: chatActions_1.CHAT_CATEGORY,
                    precondition: chatContextKeys_1.CONTEXT_PROVIDER_EXISTS,
                    f1: true,
                });
            }
            async run(accessor, ...args) {
                const fileDialogService = accessor.get(dialogs_1.IFileDialogService);
                const fileService = accessor.get(files_1.IFileService);
                const editorService = accessor.get(editorService_1.IEditorService);
                const defaultUri = (0, resources_1.joinPath)(await fileDialogService.defaultFilePath(), defaultFileName);
                const result = await fileDialogService.showOpenDialog({
                    defaultUri,
                    canSelectFiles: true,
                    filters
                });
                if (!result) {
                    return;
                }
                const content = await fileService.readFile(result[0]);
                try {
                    const data = JSON.parse(content.value.toString());
                    if (!(0, chatModel_1.isExportableSessionData)(data)) {
                        throw new Error('Invalid chat session data');
                    }
                    await editorService.openEditor({ resource: chatEditorInput_1.ChatEditorInput.getNewEditorUri(), options: { target: { data }, pinned: true } });
                }
                catch (err) {
                    throw err;
                }
            }
        });
    }
    exports.registerChatExportActions = registerChatExportActions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdEltcG9ydEV4cG9ydC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NoYXQvYnJvd3Nlci9hY3Rpb25zL2NoYXRJbXBvcnRFeHBvcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBa0JoRyxNQUFNLGVBQWUsR0FBRyxXQUFXLENBQUM7SUFDcEMsTUFBTSxPQUFPLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFBLGNBQVEsRUFBQyxpQkFBaUIsRUFBRSxjQUFjLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFOUYsU0FBZ0IseUJBQXlCO1FBQ3hDLElBQUEseUJBQWUsRUFBQyxNQUFNLGdCQUFpQixTQUFRLGlCQUFPO1lBQ3JEO2dCQUNDLEtBQUssQ0FBQztvQkFDTCxFQUFFLEVBQUUsOEJBQThCO29CQUNsQyxRQUFRLEVBQUUsMkJBQWE7b0JBQ3ZCLEtBQUssRUFBRTt3QkFDTixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsbUJBQW1CLEVBQUUsZ0JBQWdCLENBQUMsR0FBRyxLQUFLO3dCQUM5RCxRQUFRLEVBQUUsbUJBQW1CO3FCQUM3QjtvQkFDRCxZQUFZLEVBQUUseUNBQXVCO29CQUNyQyxFQUFFLEVBQUUsSUFBSTtpQkFDUixDQUFDLENBQUM7WUFDSixDQUFDO1lBQ0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUEwQixFQUFFLEdBQUcsSUFBVztnQkFDbkQsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyx5QkFBa0IsQ0FBQyxDQUFDO2dCQUN2RCxNQUFNLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsNEJBQWtCLENBQUMsQ0FBQztnQkFDM0QsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxvQkFBWSxDQUFDLENBQUM7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