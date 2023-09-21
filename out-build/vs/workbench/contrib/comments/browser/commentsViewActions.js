/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/nls!vs/workbench/contrib/comments/browser/commentsViewActions", "vs/platform/contextkey/common/contextkey", "vs/base/common/event", "vs/workbench/contrib/comments/browser/comments", "vs/platform/actions/common/actions", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/contrib/comments/browser/commentsTreeViewer", "vs/workbench/common/contextkeys", "vs/workbench/browser/parts/views/viewFilter"], function (require, exports, lifecycle_1, nls_1, contextkey_1, event_1, comments_1, actions_1, viewPane_1, commentsTreeViewer_1, contextkeys_1, viewFilter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$5lb = void 0;
    const CONTEXT_KEY_SHOW_RESOLVED = new contextkey_1.$2i('commentsView.showResolvedFilter', true);
    const CONTEXT_KEY_SHOW_UNRESOLVED = new contextkey_1.$2i('commentsView.showUnResolvedFilter', true);
    class $5lb extends lifecycle_1.$kc {
        constructor(options, b) {
            super();
            this.b = b;
            this.a = this.B(new event_1.$fd());
            this.onDidChange = this.a.event;
            this.c = CONTEXT_KEY_SHOW_UNRESOLVED.bindTo(this.b);
            this.f = CONTEXT_KEY_SHOW_RESOLVED.bindTo(this.b);
            this.f.set(options.showResolved);
            this.c.set(options.showUnresolved);
        }
        get showUnresolved() {
            return !!this.c.get();
        }
        set showUnresolved(showUnresolved) {
            if (this.c.get() !== showUnresolved) {
                this.c.set(showUnresolved);
                this.a.fire({ showUnresolved: true });
            }
        }
        get showResolved() {
            return !!this.f.get();
        }
        set showResolved(showResolved) {
            if (this.f.get() !== showResolved) {
                this.f.set(showResolved);
                this.a.fire({ showResolved: true });
            }
        }
    }
    exports.$5lb = $5lb;
    (0, actions_1.$Xu)(class extends viewPane_1.$Keb {
        constructor() {
            super({
                id: 'commentsFocusViewFromFilter',
                title: (0, nls_1.localize)(0, null),
                keybinding: {
                    when: comments_1.$6lb,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */
                },
                viewId: commentsTreeViewer_1.$Wlb
            });
        }
        async runInView(serviceAccessor, commentsView) {
            commentsView.focus();
        }
    });
    (0, actions_1.$Xu)(class extends viewPane_1.$Keb {
        constructor() {
            super({
                id: 'commentsClearFilterText',
                title: (0, nls_1.localize)(1, null),
                keybinding: {
                    when: comments_1.$6lb,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 9 /* KeyCode.Escape */
                },
                viewId: commentsTreeViewer_1.$Wlb
            });
        }
        async runInView(serviceAccessor, commentsView) {
            commentsView.clearFilterText();
        }
    });
    (0, actions_1.$Xu)(class extends viewPane_1.$Keb {
        constructor() {
            super({
                id: 'commentsFocusFilter',
                title: (0, nls_1.localize)(2, null),
                keybinding: {
                    when: contextkeys_1.$Hdb.isEqualTo(commentsTreeViewer_1.$Wlb),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 36 /* KeyCode.KeyF */
                },
                viewId: commentsTreeViewer_1.$Wlb
            });
        }
        async runInView(serviceAccessor, commentsView) {
            commentsView.focusFilter();
        }
    });
    (0, actions_1.$Xu)(class extends viewPane_1.$Keb {
        constructor() {
            super({
                id: `workbench.actions.${commentsTreeViewer_1.$Wlb}.toggleUnResolvedComments`,
                title: (0, nls_1.localize)(3, null),
                category: (0, nls_1.localize)(4, null),
                toggled: {
                    condition: CONTEXT_KEY_SHOW_UNRESOLVED,
                    title: (0, nls_1.localize)(5, null),
                },
                menu: {
                    id: viewFilter_1.$Feb,
                    group: '1_filter',
                    when: contextkey_1.$Ii.equals('view', commentsTreeViewer_1.$Wlb),
                    order: 1
                },
                viewId: commentsTreeViewer_1.$Wlb
            });
        }
        async runInView(serviceAccessor, view) {
            view.filters.showUnresolved = !view.filters.showUnresolved;
        }
    });
    (0, actions_1.$Xu)(class extends viewPane_1.$Keb {
        constructor() {
            super({
                id: `workbench.actions.${commentsTreeViewer_1.$Wlb}.toggleResolvedComments`,
                title: (0, nls_1.localize)(6, null),
                category: (0, nls_1.localize)(7, null),
                toggled: {
                    condition: CONTEXT_KEY_SHOW_RESOLVED,
                    title: (0, nls_1.localize)(8, null),
                },
                menu: {
                    id: viewFilter_1.$Feb,
                    group: '1_filter',
                    when: contextkey_1.$Ii.equals('view', commentsTreeViewer_1.$Wlb),
                    order: 1
                },
                viewId: commentsTreeViewer_1.$Wlb
            });
        }
        async runInView(serviceAccessor, view) {
            view.filters.showResolved = !view.filters.showResolved;
        }
    });
});
//# sourceMappingURL=commentsViewActions.js.map