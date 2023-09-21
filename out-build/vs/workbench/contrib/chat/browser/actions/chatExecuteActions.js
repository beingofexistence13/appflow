/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/nls!vs/workbench/contrib/chat/browser/actions/chatExecuteActions", "vs/platform/actions/common/actions", "vs/workbench/contrib/chat/browser/actions/chatActions", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/chat/common/chatService"], function (require, exports, codicons_1, nls_1, actions_1, chatActions_1, chatContextKeys_1, chatService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$OGb = exports.$NGb = exports.$MGb = void 0;
    function $MGb(thing) {
        return typeof thing === 'object' && thing !== null && 'widget' in thing;
    }
    exports.$MGb = $MGb;
    class $NGb extends actions_1.$Wu {
        static { this.ID = 'workbench.action.chat.submit'; }
        constructor() {
            super({
                id: $NGb.ID,
                title: {
                    value: (0, nls_1.localize)(0, null),
                    original: 'Submit'
                },
                f1: false,
                category: chatActions_1.$DIb,
                icon: codicons_1.$Pj.send,
                precondition: chatContextKeys_1.$HGb,
                menu: {
                    id: actions_1.$Ru.ChatExecute,
                    when: chatContextKeys_1.$EGb.negate(),
                    group: 'navigation',
                }
            });
        }
        run(accessor, ...args) {
            const context = args[0];
            if (!$MGb(context)) {
                return;
            }
            context.widget.acceptInput(context.inputValue);
        }
    }
    exports.$NGb = $NGb;
    function $OGb() {
        (0, actions_1.$Xu)($NGb);
        (0, actions_1.$Xu)(class CancelAction extends actions_1.$Wu {
            constructor() {
                super({
                    id: 'workbench.action.chat.cancel',
                    title: {
                        value: (0, nls_1.localize)(1, null),
                        original: 'Cancel'
                    },
                    f1: false,
                    category: chatActions_1.$DIb,
                    icon: codicons_1.$Pj.debugStop,
                    menu: {
                        id: actions_1.$Ru.ChatExecute,
                        when: chatContextKeys_1.$EGb,
                        group: 'navigation',
                    }
                });
            }
            run(accessor, ...args) {
                const context = args[0];
                if (!$MGb(context)) {
                    return;
                }
                const chatService = accessor.get(chatService_1.$FH);
                if (context.widget.viewModel) {
                    chatService.cancelCurrentRequestForSession(context.widget.viewModel.sessionId);
                }
            }
        });
    }
    exports.$OGb = $OGb;
});
//# sourceMappingURL=chatExecuteActions.js.map