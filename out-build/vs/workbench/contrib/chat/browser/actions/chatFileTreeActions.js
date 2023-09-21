/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/chat/browser/actions/chatFileTreeActions", "vs/platform/actions/common/actions", "vs/workbench/contrib/chat/browser/actions/chatActions", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/chat/common/chatViewModel"], function (require, exports, nls_1, actions_1, chatActions_1, chat_1, chatContextKeys_1, chatViewModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$hJb = void 0;
    function $hJb() {
        (0, actions_1.$Xu)(class NextFileTreeAction extends actions_1.$Wu {
            constructor() {
                super({
                    id: 'workbench.action.chat.nextFileTree',
                    title: {
                        value: (0, nls_1.localize)(0, null),
                        original: 'Next File Tree'
                    },
                    keybinding: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 67 /* KeyCode.F9 */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: chatContextKeys_1.$JGb,
                    },
                    precondition: chatContextKeys_1.$LGb,
                    f1: true,
                    category: chatActions_1.$DIb,
                });
            }
            run(accessor, ...args) {
                navigateTrees(accessor, false);
            }
        });
        (0, actions_1.$Xu)(class PreviousFileTreeAction extends actions_1.$Wu {
            constructor() {
                super({
                    id: 'workbench.action.chat.previousFileTree',
                    title: {
                        value: (0, nls_1.localize)(1, null),
                        original: 'Previous File Tree'
                    },
                    keybinding: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 67 /* KeyCode.F9 */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: chatContextKeys_1.$JGb,
                    },
                    precondition: chatContextKeys_1.$LGb,
                    f1: true,
                    category: chatActions_1.$DIb,
                });
            }
            run(accessor, ...args) {
                navigateTrees(accessor, true);
            }
        });
    }
    exports.$hJb = $hJb;
    function navigateTrees(accessor, reverse) {
        const chatWidgetService = accessor.get(chat_1.$Nqb);
        const widget = chatWidgetService.lastFocusedWidget;
        if (!widget) {
            return;
        }
        const focused = !widget.inputEditor.hasWidgetFocus() && widget.getFocus();
        const focusedResponse = (0, chatViewModel_1.$Iqb)(focused) ? focused : undefined;
        const currentResponse = focusedResponse ?? widget.viewModel?.getItems().reverse().find((item) => (0, chatViewModel_1.$Iqb)(item));
        if (!currentResponse) {
            return;
        }
        widget.reveal(currentResponse);
        const responseFileTrees = widget.getFileTreeInfosForResponse(currentResponse);
        const lastFocusedFileTree = widget.getLastFocusedFileTreeForResponse(currentResponse);
        const focusIdx = lastFocusedFileTree ?
            (lastFocusedFileTree.treeIndex + (reverse ? -1 : 1) + responseFileTrees.length) % responseFileTrees.length :
            reverse ? responseFileTrees.length - 1 : 0;
        responseFileTrees[focusIdx]?.focus();
    }
});
//# sourceMappingURL=chatFileTreeActions.js.map