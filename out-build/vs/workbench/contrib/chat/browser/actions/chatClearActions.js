/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/nls!vs/workbench/contrib/chat/browser/actions/chatClearActions", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/contextkeys", "vs/workbench/contrib/chat/browser/actions/chatActions", "vs/workbench/contrib/chat/browser/actions/chatClear", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/browser/chatEditorInput", "vs/workbench/contrib/chat/common/chatContextKeys"], function (require, exports, codicons_1, nls_1, actions_1, contextkey_1, viewPane_1, contextkeys_1, chatActions_1, chatClear_1, chat_1, chatEditorInput_1, chatContextKeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$QIb = exports.$PIb = exports.$OIb = void 0;
    exports.$OIb = `workbench.action.chat.clear`;
    function $PIb() {
        (0, actions_1.$Xu)(class ClearEditorAction extends actions_1.$Wu {
            constructor() {
                super({
                    id: 'workbench.action.chatEditor.clear',
                    title: {
                        value: (0, nls_1.localize)(0, null),
                        original: 'Clear'
                    },
                    icon: codicons_1.$Pj.clearAll,
                    f1: false,
                    menu: [{
                            id: actions_1.$Ru.EditorTitle,
                            group: 'navigation',
                            order: 0,
                            when: contextkeys_1.$$cb.isEqualTo(chatEditorInput_1.$yGb.EditorID),
                        }]
                });
            }
            async run(accessor, ...args) {
                await (0, chatClear_1.$BIb)(accessor);
            }
        });
        (0, actions_1.$Xu)(class GlobalClearChatAction extends actions_1.$Wu {
            constructor() {
                super({
                    id: exports.$OIb,
                    title: {
                        value: (0, nls_1.localize)(1, null),
                        original: 'Clear'
                    },
                    category: chatActions_1.$DIb,
                    icon: codicons_1.$Pj.clearAll,
                    precondition: chatContextKeys_1.$LGb,
                    f1: true,
                    keybinding: {
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        primary: 2048 /* KeyMod.CtrlCmd */ | 42 /* KeyCode.KeyL */,
                        mac: {
                            primary: 256 /* KeyMod.WinCtrl */ | 42 /* KeyCode.KeyL */
                        },
                        when: chatContextKeys_1.$JGb
                    }
                });
            }
            run(accessor, ...args) {
                const widgetService = accessor.get(chat_1.$Nqb);
                const widget = widgetService.lastFocusedWidget;
                if (!widget) {
                    return;
                }
                widget.clear();
            }
        });
    }
    exports.$PIb = $PIb;
    const getClearChatActionDescriptorForViewTitle = (viewId, providerId) => ({
        viewId,
        id: `workbench.action.chat.${providerId}.clear`,
        title: {
            value: (0, nls_1.localize)(2, null),
            original: 'Clear'
        },
        menu: {
            id: actions_1.$Ru.ViewTitle,
            when: contextkey_1.$Ii.equals('view', viewId),
            group: 'navigation',
            order: 0
        },
        category: chatActions_1.$DIb,
        icon: codicons_1.$Pj.clearAll,
        f1: false
    });
    function $QIb(viewId, providerId) {
        return class ClearAction extends viewPane_1.$Keb {
            constructor() {
                super(getClearChatActionDescriptorForViewTitle(viewId, providerId));
            }
            async runInView(accessor, view) {
                await view.clear();
            }
        };
    }
    exports.$QIb = $QIb;
});
//# sourceMappingURL=chatClearActions.js.map