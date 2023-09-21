/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/actions", "vs/base/common/codicons", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/nls!vs/workbench/contrib/comments/browser/commentThreadHeader", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/theme/common/iconRegistry", "vs/base/common/themables", "vs/base/browser/mouseEvent"], function (require, exports, dom, actionbar_1, actions_1, codicons_1, lifecycle_1, strings, nls, menuEntryActionViewItem_1, iconRegistry_1, themables_1, mouseEvent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Amb = void 0;
    const collapseIcon = (0, iconRegistry_1.$9u)('review-comment-collapse', codicons_1.$Pj.chevronUp, nls.localize(0, null));
    const COLLAPSE_ACTION_CLASS = 'expand-review-action ' + themables_1.ThemeIcon.asClassName(collapseIcon);
    class $Amb extends lifecycle_1.$kc {
        constructor(container, g, h, j, m, n, s) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.s = s;
            this.a = dom.$('.head');
            container.appendChild(this.a);
            this.t();
        }
        t() {
            const titleElement = dom.$0O(this.a, dom.$('.review-title'));
            this.b = dom.$0O(titleElement, dom.$('span.filename'));
            this.createThreadLabel();
            const actionsContainer = dom.$0O(this.a, dom.$('.review-actions'));
            this.c = new actionbar_1.$1P(actionsContainer, {
                actionViewItemProvider: menuEntryActionViewItem_1.$F3.bind(undefined, this.n)
            });
            this.B(this.c);
            this.f = new actions_1.$gi('review.expand', nls.localize(1, null), COLLAPSE_ACTION_CLASS, true, () => this.g.collapse());
            const menu = this.h.getCommentThreadTitleActions(this.m);
            this.u(menu);
            this.B(menu);
            this.B(menu.onDidChange(e => {
                this.u(menu);
            }));
            this.B(dom.$nO(this.a, dom.$3O.CONTEXT_MENU, e => {
                return this.w(e);
            }));
            this.c.context = this.j;
        }
        u(menu) {
            const groups = menu.getActions({ shouldForwardArgs: true }).reduce((r, [, actions]) => [...r, ...actions], []);
            this.c.clear();
            this.c.push([...groups, this.f], { label: false, icon: true });
        }
        updateCommentThread(commentThread) {
            this.j = commentThread;
            this.c.context = this.j;
            this.createThreadLabel();
        }
        createThreadLabel() {
            let label;
            label = this.j.label;
            if (label === undefined) {
                if (!(this.j.comments && this.j.comments.length)) {
                    label = nls.localize(2, null);
                }
            }
            if (label) {
                this.b.textContent = strings.$pe(label);
                this.b.setAttribute('aria-label', label);
            }
        }
        updateHeight(headHeight) {
            this.a.style.height = `${headHeight}px`;
            this.a.style.lineHeight = this.a.style.height;
        }
        w(e) {
            const actions = this.h.getCommentThreadTitleContextActions(this.m).getActions({ shouldForwardArgs: true }).map((value) => value[1]).flat();
            if (!actions.length) {
                return;
            }
            const event = new mouseEvent_1.$eO(e);
            this.s.showContextMenu({
                getAnchor: () => event,
                getActions: () => actions,
                actionRunner: new actions_1.$hi(),
                getActionsContext: () => {
                    return {
                        commentControlHandle: this.j.controllerHandle,
                        commentThreadHandle: this.j.commentThreadHandle,
                        $mid: 7 /* MarshalledId.CommentThread */
                    };
                },
            });
        }
    }
    exports.$Amb = $Amb;
});
//# sourceMappingURL=commentThreadHeader.js.map