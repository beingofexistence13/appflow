/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/nls", "vs/platform/contextkey/common/contextkey", "vs/base/common/event", "vs/workbench/contrib/comments/browser/comments", "vs/platform/actions/common/actions", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/contrib/comments/browser/commentsTreeViewer", "vs/workbench/common/contextkeys", "vs/workbench/browser/parts/views/viewFilter"], function (require, exports, lifecycle_1, nls_1, contextkey_1, event_1, comments_1, actions_1, viewPane_1, commentsTreeViewer_1, contextkeys_1, viewFilter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CommentsFilters = void 0;
    const CONTEXT_KEY_SHOW_RESOLVED = new contextkey_1.RawContextKey('commentsView.showResolvedFilter', true);
    const CONTEXT_KEY_SHOW_UNRESOLVED = new contextkey_1.RawContextKey('commentsView.showUnResolvedFilter', true);
    class CommentsFilters extends lifecycle_1.Disposable {
        constructor(options, contextKeyService) {
            super();
            this.contextKeyService = contextKeyService;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._showUnresolved = CONTEXT_KEY_SHOW_UNRESOLVED.bindTo(this.contextKeyService);
            this._showResolved = CONTEXT_KEY_SHOW_RESOLVED.bindTo(this.contextKeyService);
            this._showResolved.set(options.showResolved);
            this._showUnresolved.set(options.showUnresolved);
        }
        get showUnresolved() {
            return !!this._showUnresolved.get();
        }
        set showUnresolved(showUnresolved) {
            if (this._showUnresolved.get() !== showUnresolved) {
                this._showUnresolved.set(showUnresolved);
                this._onDidChange.fire({ showUnresolved: true });
            }
        }
        get showResolved() {
            return !!this._showResolved.get();
        }
        set showResolved(showResolved) {
            if (this._showResolved.get() !== showResolved) {
                this._showResolved.set(showResolved);
                this._onDidChange.fire({ showResolved: true });
            }
        }
    }
    exports.CommentsFilters = CommentsFilters;
    (0, actions_1.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: 'commentsFocusViewFromFilter',
                title: (0, nls_1.localize)('focusCommentsList', "Focus Comments view"),
                keybinding: {
                    when: comments_1.CommentsViewFilterFocusContextKey,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */
                },
                viewId: commentsTreeViewer_1.COMMENTS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, commentsView) {
            commentsView.focus();
        }
    });
    (0, actions_1.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: 'commentsClearFilterText',
                title: (0, nls_1.localize)('commentsClearFilterText', "Clear filter text"),
                keybinding: {
                    when: comments_1.CommentsViewFilterFocusContextKey,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 9 /* KeyCode.Escape */
                },
                viewId: commentsTreeViewer_1.COMMENTS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, commentsView) {
            commentsView.clearFilterText();
        }
    });
    (0, actions_1.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: 'commentsFocusFilter',
                title: (0, nls_1.localize)('focusCommentsFilter', "Focus comments filter"),
                keybinding: {
                    when: contextkeys_1.FocusedViewContext.isEqualTo(commentsTreeViewer_1.COMMENTS_VIEW_ID),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 36 /* KeyCode.KeyF */
                },
                viewId: commentsTreeViewer_1.COMMENTS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, commentsView) {
            commentsView.focusFilter();
        }
    });
    (0, actions_1.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: `workbench.actions.${commentsTreeViewer_1.COMMENTS_VIEW_ID}.toggleUnResolvedComments`,
                title: (0, nls_1.localize)('toggle unresolved', "Toggle Unresolved Comments"),
                category: (0, nls_1.localize)('comments', "Comments"),
                toggled: {
                    condition: CONTEXT_KEY_SHOW_UNRESOLVED,
                    title: (0, nls_1.localize)('unresolved', "Show Unresolved"),
                },
                menu: {
                    id: viewFilter_1.viewFilterSubmenu,
                    group: '1_filter',
                    when: contextkey_1.ContextKeyExpr.equals('view', commentsTreeViewer_1.COMMENTS_VIEW_ID),
                    order: 1
                },
                viewId: commentsTreeViewer_1.COMMENTS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, view) {
            view.filters.showUnresolved = !view.filters.showUnresolved;
        }
    });
    (0, actions_1.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: `workbench.actions.${commentsTreeViewer_1.COMMENTS_VIEW_ID}.toggleResolvedComments`,
                title: (0, nls_1.localize)('toggle resolved', "Toggle Resolved Comments"),
                category: (0, nls_1.localize)('comments', "Comments"),
                toggled: {
                    condition: CONTEXT_KEY_SHOW_RESOLVED,
                    title: (0, nls_1.localize)('resolved', "Show Resolved"),
                },
                menu: {
                    id: viewFilter_1.viewFilterSubmenu,
                    group: '1_filter',
                    when: contextkey_1.ContextKeyExpr.equals('view', commentsTreeViewer_1.COMMENTS_VIEW_ID),
                    order: 1
                },
                viewId: commentsTreeViewer_1.COMMENTS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, view) {
            view.filters.showResolved = !view.filters.showResolved;
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWVudHNWaWV3QWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NvbW1lbnRzL2Jyb3dzZXIvY29tbWVudHNWaWV3QWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFnQmhHLE1BQU0seUJBQXlCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLGlDQUFpQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3RHLE1BQU0sMkJBQTJCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLG1DQUFtQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBWTFHLE1BQWEsZUFBZ0IsU0FBUSxzQkFBVTtRQUs5QyxZQUFZLE9BQStCLEVBQW1CLGlCQUFxQztZQUNsRyxLQUFLLEVBQUUsQ0FBQztZQURxRCxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBSGxGLGlCQUFZLEdBQXdDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQThCLENBQUMsQ0FBQztZQUN0SCxnQkFBVyxHQUFzQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQztZQVFqRSxvQkFBZSxHQUFHLDJCQUEyQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQVd0RixrQkFBYSxHQUFHLHlCQUF5QixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQWZoRixJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDN0MsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ2xELENBQUM7UUFHRCxJQUFJLGNBQWM7WUFDakIsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztR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