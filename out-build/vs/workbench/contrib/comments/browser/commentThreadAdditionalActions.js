/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/workbench/contrib/comments/browser/commentFormActions"], function (require, exports, dom, lifecycle_1, commentFormActions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Bmb = void 0;
    class $Bmb extends lifecycle_1.$kc {
        constructor(container, f, g, h, j) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.a = dom.$0O(container, dom.$('.comment-additional-actions'));
            dom.$0O(this.a, dom.$('.section-separator'));
            this.b = dom.$0O(this.a, dom.$('.button-bar'));
            this.s(this.b);
        }
        m() {
            this.a?.classList.remove('hidden');
        }
        n() {
            this.a?.classList.add('hidden');
        }
        r(menu) {
            const groups = menu.getActions({ shouldForwardArgs: true });
            // Show the menu if at least one action is enabled.
            for (const group of groups) {
                const [, actions] = group;
                for (const action of actions) {
                    if (action.enabled) {
                        this.m();
                        return;
                    }
                    for (const subAction of action.actions ?? []) {
                        if (subAction.enabled) {
                            this.m();
                            return;
                        }
                    }
                }
            }
            this.n();
        }
        s(container) {
            const menu = this.h.getCommentThreadAdditionalActions(this.g);
            this.B(menu);
            this.B(menu.onDidChange(() => {
                this.c.setActions(menu, /*hasOnlySecondaryActions*/ true);
                this.r(menu);
            }));
            this.c = new commentFormActions_1.$9lb(container, async (action) => {
                this.j?.();
                action.run({
                    thread: this.f,
                    $mid: 8 /* MarshalledId.CommentThreadInstance */
                });
            }, 4);
            this.B(this.c);
            this.c.setActions(menu, /*hasOnlySecondaryActions*/ true);
            this.r(menu);
        }
    }
    exports.$Bmb = $Bmb;
});
//# sourceMappingURL=commentThreadAdditionalActions.js.map