/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/marked/marked", "vs/editor/browser/services/bulkEditService", "vs/nls!vs/workbench/contrib/chat/browser/actions/chatTitleActions", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/bulkEdit/browser/bulkCellEdits", "vs/workbench/contrib/chat/browser/actions/chatActions", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/chat/common/chatService", "vs/workbench/contrib/chat/common/chatViewModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/services/editor/common/editorService"], function (require, exports, codicons_1, marked_1, bulkEditService_1, nls_1, actions_1, contextkey_1, bulkCellEdits_1, chatActions_1, chat_1, chatContextKeys_1, chatService_1, chatViewModel_1, notebookCommon_1, notebookContextKeys_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$MIb = void 0;
    function $MIb() {
        (0, actions_1.$Xu)(class MarkHelpfulAction extends actions_1.$Wu {
            constructor() {
                super({
                    id: 'workbench.action.chat.markHelpful',
                    title: {
                        value: (0, nls_1.localize)(0, null),
                        original: 'Helpful'
                    },
                    f1: false,
                    category: chatActions_1.$DIb,
                    icon: codicons_1.$Pj.thumbsup,
                    toggled: chatContextKeys_1.$CGb.isEqualTo('up'),
                    menu: {
                        id: actions_1.$Ru.ChatMessageTitle,
                        group: 'navigation',
                        order: 1,
                        when: chatContextKeys_1.$FGb
                    }
                });
            }
            run(accessor, ...args) {
                const item = args[0];
                if (!(0, chatViewModel_1.$Iqb)(item)) {
                    return;
                }
                const chatService = accessor.get(chatService_1.$FH);
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
        (0, actions_1.$Xu)(class MarkUnhelpfulAction extends actions_1.$Wu {
            constructor() {
                super({
                    id: 'workbench.action.chat.markUnhelpful',
                    title: {
                        value: (0, nls_1.localize)(1, null),
                        original: 'Unhelpful'
                    },
                    f1: false,
                    category: chatActions_1.$DIb,
                    icon: codicons_1.$Pj.thumbsdown,
                    toggled: chatContextKeys_1.$CGb.isEqualTo('down'),
                    menu: {
                        id: actions_1.$Ru.ChatMessageTitle,
                        group: 'navigation',
                        order: 2,
                        when: chatContextKeys_1.$FGb
                    }
                });
            }
            run(accessor, ...args) {
                const item = args[0];
                if (!(0, chatViewModel_1.$Iqb)(item)) {
                    return;
                }
                const chatService = accessor.get(chatService_1.$FH);
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
        (0, actions_1.$Xu)(class InsertToNotebookAction extends actions_1.$Wu {
            constructor() {
                super({
                    id: 'workbench.action.chat.insertIntoNotebook',
                    title: {
                        value: (0, nls_1.localize)(2, null),
                        original: 'Insert into Notebook'
                    },
                    f1: false,
                    category: chatActions_1.$DIb,
                    icon: codicons_1.$Pj.insert,
                    menu: {
                        id: actions_1.$Ru.ChatMessageTitle,
                        group: 'navigation',
                        isHiddenByDefault: true,
                        when: contextkey_1.$Ii.and(notebookContextKeys_1.$Wnb, chatContextKeys_1.$FGb, chatContextKeys_1.$DGb.negate())
                    }
                });
            }
            async run(accessor, ...args) {
                const item = args[0];
                if (!(0, chatViewModel_1.$Iqb)(item)) {
                    return;
                }
                const editorService = accessor.get(editorService_1.$9C);
                if (editorService.activeEditorPane?.getId() === notebookCommon_1.$TH) {
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
                    const bulkEditService = accessor.get(bulkEditService_1.$n1);
                    await bulkEditService.apply([
                        new bulkCellEdits_1.$3bb(notebookEditor.textModel.uri, {
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
        (0, actions_1.$Xu)(class RemoveAction extends actions_1.$Wu {
            constructor() {
                super({
                    id: 'workbench.action.chat.remove',
                    title: {
                        value: (0, nls_1.localize)(3, null),
                        original: 'Remove Request and Response'
                    },
                    f1: false,
                    category: chatActions_1.$DIb,
                    icon: codicons_1.$Pj.x,
                    keybinding: {
                        primary: 20 /* KeyCode.Delete */,
                        mac: {
                            primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */,
                        },
                        when: contextkey_1.$Ii.and(chatContextKeys_1.$JGb, chatContextKeys_1.$IGb.negate()),
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    },
                    menu: {
                        id: actions_1.$Ru.ChatMessageTitle,
                        group: 'navigation',
                        order: 2,
                        when: chatContextKeys_1.$GGb
                    }
                });
            }
            run(accessor, ...args) {
                let item = args[0];
                if (!(0, chatViewModel_1.$Hqb)(item)) {
                    const chatWidgetService = accessor.get(chat_1.$Nqb);
                    const widget = chatWidgetService.lastFocusedWidget;
                    item = widget?.getFocus();
                }
                const providerRequestId = (0, chatViewModel_1.$Hqb)(item) ? item.providerRequestId :
                    (0, chatViewModel_1.$Iqb)(item) ? item.providerResponseId : undefined;
                if (providerRequestId) {
                    const chatService = accessor.get(chatService_1.$FH);
                    chatService.removeRequest(item.sessionId, providerRequestId);
                }
            }
        });
    }
    exports.$MIb = $MIb;
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
//# sourceMappingURL=chatTitleActions.js.map