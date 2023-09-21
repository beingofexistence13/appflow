/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/marked/marked", "vs/editor/browser/services/bulkEditService", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/bulkEdit/browser/bulkCellEdits", "vs/workbench/contrib/chat/browser/actions/chatActions", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/chat/common/chatService", "vs/workbench/contrib/chat/common/chatViewModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/services/editor/common/editorService"], function (require, exports, codicons_1, marked_1, bulkEditService_1, nls_1, actions_1, contextkey_1, bulkCellEdits_1, chatActions_1, chat_1, chatContextKeys_1, chatService_1, chatViewModel_1, notebookCommon_1, notebookContextKeys_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerChatTitleActions = void 0;
    function registerChatTitleActions() {
        (0, actions_1.registerAction2)(class MarkHelpfulAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.chat.markHelpful',
                    title: {
                        value: (0, nls_1.localize)('interactive.helpful.label', "Helpful"),
                        original: 'Helpful'
                    },
                    f1: false,
                    category: chatActions_1.CHAT_CATEGORY,
                    icon: codicons_1.Codicon.thumbsup,
                    toggled: chatContextKeys_1.CONTEXT_RESPONSE_VOTE.isEqualTo('up'),
                    menu: {
                        id: actions_1.MenuId.ChatMessageTitle,
                        group: 'navigation',
                        order: 1,
                        when: chatContextKeys_1.CONTEXT_RESPONSE
                    }
                });
            }
            run(accessor, ...args) {
                const item = args[0];
                if (!(0, chatViewModel_1.isResponseVM)(item)) {
                    return;
                }
                const chatService = accessor.get(chatService_1.IChatService);
                chatService.notifyUserAction({
                    providerId: item.providerId,
                    action: {
                        kind: 'vote',
                        direction: chatService_1.InteractiveSessionVoteDirection.Up,
                        responseId: item.providerResponseId
                    }
                });
                item.setVote(chatService_1.InteractiveSessionVoteDirection.Up);
            }
        });
        (0, actions_1.registerAction2)(class MarkUnhelpfulAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.chat.markUnhelpful',
                    title: {
                        value: (0, nls_1.localize)('interactive.unhelpful.label', "Unhelpful"),
                        original: 'Unhelpful'
                    },
                    f1: false,
                    category: chatActions_1.CHAT_CATEGORY,
                    icon: codicons_1.Codicon.thumbsdown,
                    toggled: chatContextKeys_1.CONTEXT_RESPONSE_VOTE.isEqualTo('down'),
                    menu: {
                        id: actions_1.MenuId.ChatMessageTitle,
                        group: 'navigation',
                        order: 2,
                        when: chatContextKeys_1.CONTEXT_RESPONSE
                    }
                });
            }
            run(accessor, ...args) {
                const item = args[0];
                if (!(0, chatViewModel_1.isResponseVM)(item)) {
                    return;
                }
                const chatService = accessor.get(chatService_1.IChatService);
                chatService.notifyUserAction({
                    providerId: item.providerId,
                    action: {
                        kind: 'vote',
                        direction: chatService_1.InteractiveSessionVoteDirection.Down,
                        responseId: item.providerResponseId
                    }
                });
                item.setVote(chatService_1.InteractiveSessionVoteDirection.Down);
            }
        });
        (0, actions_1.registerAction2)(class InsertToNotebookAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.chat.insertIntoNotebook',
                    title: {
                        value: (0, nls_1.localize)('interactive.insertIntoNotebook.label', "Insert into Notebook"),
                        original: 'Insert into Notebook'
                    },
                    f1: false,
                    category: chatActions_1.CHAT_CATEGORY,
                    icon: codicons_1.Codicon.insert,
                    menu: {
                        id: actions_1.MenuId.ChatMessageTitle,
                        group: 'navigation',
                        isHiddenByDefault: true,
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR, chatContextKeys_1.CONTEXT_RESPONSE, chatContextKeys_1.CONTEXT_RESPONSE_FILTERED.negate())
                    }
                });
            }
            async run(accessor, ...args) {
                const item = args[0];
                if (!(0, chatViewModel_1.isResponseVM)(item)) {
                    return;
                }
                const editorService = accessor.get(editorService_1.IEditorService);
                if (editorService.activeEditorPane?.getId() === notebookCommon_1.NOTEBOOK_EDITOR_ID) {
                    const notebookEditor = editorService.activeEditorPane.getControl();
                    if (!notebookEditor.hasModel()) {
                        return;
                    }
                    if (notebookEditor.isReadOnly) {
                        return;
                    }
                    const value = item.response.asString();
                    const splitContents = splitMarkdownAndCodeBlocks(value);
                    const focusRange = notebookEditor.getFocus();
                    const index = Math.max(focusRange.end, 0);
                    const bulkEditService = accessor.get(bulkEditService_1.IBulkEditService);
                    await bulkEditService.apply([
                        new bulkCellEdits_1.ResourceNotebookCellEdit(notebookEditor.textModel.uri, {
                            editType: 1 /* CellEditType.Replace */,
                            index: index,
                            count: 0,
                            cells: splitContents.map(content => {
                                const kind = content.type === 'markdown' ? notebookCommon_1.CellKind.Markup : notebookCommon_1.CellKind.Code;
                                const language = content.type === 'markdown' ? 'markdown' : content.language;
                                const mime = content.type === 'markdown' ? 'text/markdown' : `text/x-${content.language}`;
                                return {
                                    cellKind: kind,
                                    language,
                                    mime,
                                    source: content.content,
                                    outputs: [],
                                    metadata: {}
                                };
                            })
                        })
                    ], { quotableLabel: 'Insert into Notebook' });
                }
            }
        });
        (0, actions_1.registerAction2)(class RemoveAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.chat.remove',
                    title: {
                        value: (0, nls_1.localize)('chat.remove.label', "Remove Request and Response"),
                        original: 'Remove Request and Response'
                    },
                    f1: false,
                    category: chatActions_1.CHAT_CATEGORY,
                    icon: codicons_1.Codicon.x,
                    keybinding: {
                        primary: 20 /* KeyCode.Delete */,
                        mac: {
                            primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */,
                        },
                        when: contextkey_1.ContextKeyExpr.and(chatContextKeys_1.CONTEXT_IN_CHAT_SESSION, chatContextKeys_1.CONTEXT_IN_CHAT_INPUT.negate()),
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    },
                    menu: {
                        id: actions_1.MenuId.ChatMessageTitle,
                        group: 'navigation',
                        order: 2,
                        when: chatContextKeys_1.CONTEXT_REQUEST
                    }
                });
            }
            run(accessor, ...args) {
                let item = args[0];
                if (!(0, chatViewModel_1.isRequestVM)(item)) {
                    const chatWidgetService = accessor.get(chat_1.IChatWidgetService);
                    const widget = chatWidgetService.lastFocusedWidget;
                    item = widget?.getFocus();
                }
                const providerRequestId = (0, chatViewModel_1.isRequestVM)(item) ? item.providerRequestId :
                    (0, chatViewModel_1.isResponseVM)(item) ? item.providerResponseId : undefined;
                if (providerRequestId) {
                    const chatService = accessor.get(chatService_1.IChatService);
                    chatService.removeRequest(item.sessionId, providerRequestId);
                }
            }
        });
    }
    exports.registerChatTitleActions = registerChatTitleActions;
    function splitMarkdownAndCodeBlocks(markdown) {
        const lexer = new marked_1.marked.Lexer();
        const tokens = lexer.lex(markdown);
        const splitContent = [];
        let markdownPart = '';
        tokens.forEach((token) => {
            if (token.type === 'code') {
                if (markdownPart.trim()) {
                    splitContent.push({ type: 'markdown', content: markdownPart });
                    markdownPart = '';
                }
                splitContent.push({
                    type: 'code',
                    language: token.lang || '',
                    content: token.text,
                });
            }
            else {
                markdownPart += token.raw;
            }
        });
        if (markdownPart.trim()) {
            splitContent.push({ type: 'markdown', content: markdownPart });
        }
        return splitContent;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdFRpdGxlQWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NoYXQvYnJvd3Nlci9hY3Rpb25zL2NoYXRUaXRsZUFjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBc0JoRyxTQUFnQix3QkFBd0I7UUFDdkMsSUFBQSx5QkFBZSxFQUFDLE1BQU0saUJBQWtCLFNBQVEsaUJBQU87WUFDdEQ7Z0JBQ0MsS0FBSyxDQUFDO29CQUNMLEVBQUUsRUFBRSxtQ0FBbUM7b0JBQ3ZDLEtBQUssRUFBRTt3QkFDTixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsMkJBQTJCLEVBQUUsU0FBUyxDQUFDO3dCQUN2RCxRQUFRLEVBQUUsU0FBUztxQkFDbkI7b0JBQ0QsRUFBRSxFQUFFLEtBQUs7b0JBQ1QsUUFBUSxFQUFFLDJCQUFhO29CQUN2QixJQUFJLEVBQUUsa0JBQU8sQ0FBQyxRQUFRO29CQUN0QixPQUFPLEVBQUUsdUNBQXFCLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztvQkFDOUMsSUFBSSxFQUFFO3dCQUNMLEVBQUUsRUFBRSxnQkFBTSxDQUFDLGdCQUFnQjt3QkFDM0IsS0FBSyxFQUFFLFlBQVk7d0JBQ25CLEtBQUssRUFBRSxDQUFDO3dCQUNSLElBQUksRUFBRSxrQ0FBZ0I7cUJBQ3RCO2lCQUNELENBQUMsQ0FBQztZQUNKLENBQUM7WUFFRCxHQUFHLENBQUMsUUFBMEIsRUFBRSxHQUFHLElBQVc7Z0JBQzdDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckIsSUFBSSxDQUFDLElBQUEsNEJBQVksRUFBQyxJQUFJLENBQUMsRUFBRTtvQkFDeEIsT0FBTztpQkFDUDtnQkFFRCxNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDBCQUFZLENBQUMsQ0FBQztnQkFD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