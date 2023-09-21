/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/resources", "vs/nls!vs/workbench/contrib/chat/browser/actions/chatImportExport", "vs/platform/actions/common/actions", "vs/platform/dialogs/common/dialogs", "vs/platform/files/common/files", "vs/workbench/contrib/chat/browser/actions/chatActions", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/browser/chatEditorInput", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/chat/common/chatModel", "vs/workbench/contrib/chat/common/chatService", "vs/workbench/services/editor/common/editorService"], function (require, exports, buffer_1, resources_1, nls_1, actions_1, dialogs_1, files_1, chatActions_1, chat_1, chatEditorInput_1, chatContextKeys_1, chatModel_1, chatService_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$NIb = void 0;
    const defaultFileName = 'chat.json';
    const filters = [{ name: (0, nls_1.localize)(0, null), extensions: ['json'] }];
    function $NIb() {
        (0, actions_1.$Xu)(class ExportChatAction extends actions_1.$Wu {
            constructor() {
                super({
                    id: 'workbench.action.chat.export',
                    category: chatActions_1.$DIb,
                    title: {
                        value: (0, nls_1.localize)(1, null) + '...',
                        original: 'Export Session...'
                    },
                    precondition: chatContextKeys_1.$LGb,
                    f1: true,
                });
            }
            async run(accessor, ...args) {
                const widgetService = accessor.get(chat_1.$Nqb);
                const fileDialogService = accessor.get(dialogs_1.$qA);
                const fileService = accessor.get(files_1.$6j);
                const chatService = accessor.get(chatService_1.$FH);
                const widget = widgetService.lastFocusedWidget;
                if (!widget || !widget.viewModel) {
                    return;
                }
                const defaultUri = (0, resources_1.$ig)(await fileDialogService.defaultFilePath(), defaultFileName);
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
                const content = buffer_1.$Fd.fromString(JSON.stringify(model.toExport(), undefined, 2));
                await fileService.writeFile(result, content);
            }
        });
        (0, actions_1.$Xu)(class ImportChatAction extends actions_1.$Wu {
            constructor() {
                super({
                    id: 'workbench.action.chat.import',
                    title: {
                        value: (0, nls_1.localize)(2, null) + '...',
                        original: 'Import Session...'
                    },
                    category: chatActions_1.$DIb,
                    precondition: chatContextKeys_1.$LGb,
                    f1: true,
                });
            }
            async run(accessor, ...args) {
                const fileDialogService = accessor.get(dialogs_1.$qA);
                const fileService = accessor.get(files_1.$6j);
                const editorService = accessor.get(editorService_1.$9C);
                const defaultUri = (0, resources_1.$ig)(await fileDialogService.defaultFilePath(), defaultFileName);
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
                    if (!(0, chatModel_1.$yH)(data)) {
                        throw new Error('Invalid chat session data');
                    }
                    await editorService.openEditor({ resource: chatEditorInput_1.$yGb.getNewEditorUri(), options: { target: { data }, pinned: true } });
                }
                catch (err) {
                    throw err;
                }
            }
        });
    }
    exports.$NIb = $NIb;
});
//# sourceMappingURL=chatImportExport.js.map