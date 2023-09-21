/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls", "vs/base/browser/dom", "vs/base/common/resources", "vs/editor/browser/editorBrowser", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/workbench/contrib/comments/common/commentModel", "vs/workbench/contrib/comments/browser/commentService", "vs/workbench/services/editor/common/editorService", "vs/platform/commands/common/commands", "vs/platform/theme/common/colorRegistry", "vs/workbench/browser/labels", "vs/workbench/contrib/comments/browser/commentsTreeViewer", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/views", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/keybinding/common/keybinding", "vs/platform/opener/common/opener", "vs/platform/telemetry/common/telemetry", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/actions/common/actions", "vs/base/common/codicons", "vs/editor/common/model/textModel", "vs/workbench/contrib/comments/browser/comments", "vs/workbench/contrib/comments/browser/commentsViewActions", "vs/workbench/common/memento", "vs/platform/storage/common/storage", "vs/workbench/contrib/comments/browser/commentsFilterOptions", "vs/workbench/services/activity/common/activity", "vs/editor/common/languages", "vs/base/common/lifecycle", "vs/base/common/iterator", "vs/workbench/contrib/comments/browser/commentsController", "vs/editor/common/core/range", "vs/workbench/browser/actions/widgetNavigationCommands", "vs/css!./media/panel"], function (require, exports, nls, dom, resources_1, editorBrowser_1, instantiation_1, themeService_1, commentModel_1, commentService_1, editorService_1, commands_1, colorRegistry_1, labels_1, commentsTreeViewer_1, viewPane_1, views_1, configuration_1, contextkey_1, contextView_1, keybinding_1, opener_1, telemetry_1, uriIdentity_1, actions_1, codicons_1, textModel_1, comments_1, commentsViewActions_1, memento_1, storage_1, commentsFilterOptions_1, activity_1, languages_1, lifecycle_1, iterator_1, commentsController_1, range_1, widgetNavigationCommands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CommentsPanel = void 0;
    const CONTEXT_KEY_HAS_COMMENTS = new contextkey_1.RawContextKey('commentsView.hasComments', false);
    const CONTEXT_KEY_SOME_COMMENTS_EXPANDED = new contextkey_1.RawContextKey('commentsView.someCommentsExpanded', false);
    const VIEW_STORAGE_ID = 'commentsViewState';
    function createResourceCommentsIterator(model) {
        return iterator_1.Iterable.map(model.resourceCommentThreads, m => {
            const CommentNodeIt = iterator_1.Iterable.from(m.commentThreads);
            const children = iterator_1.Iterable.map(CommentNodeIt, r => ({ element: r }));
            return { element: m, children };
        });
    }
    let CommentsPanel = class CommentsPanel extends viewPane_1.FilterViewPane {
        constructor(options, instantiationService, viewDescriptorService, editorService, configurationService, contextKeyService, contextMenuService, keybindingService, openerService, themeService, commentService, telemetryService, uriIdentityService, activityService, storageService) {
            const stateMemento = new memento_1.Memento(VIEW_STORAGE_ID, storageService);
            const viewState = stateMemento.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            super({
                ...options,
                filterOptions: {
                    placeholder: nls.localize('comments.filter.placeholder', "Filter (e.g. text, author)"),
                    ariaLabel: nls.localize('comments.filter.ariaLabel', "Filter comments"),
                    history: viewState['filterHistory'] || [],
                    text: viewState['filter'] || '',
                    focusContextKey: comments_1.CommentsViewFilterFocusContextKey.key
                }
            }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.editorService = editorService;
            this.commentService = commentService;
            this.uriIdentityService = uriIdentityService;
            this.activityService = activityService;
            this.totalComments = 0;
            this.totalUnresolved = 0;
            this.activity = this._register(new lifecycle_1.MutableDisposable());
            this.currentHeight = 0;
            this.currentWidth = 0;
            this.cachedFilterStats = undefined;
            this.onDidChangeVisibility = this.onDidChangeBodyVisibility;
            this.hasCommentsContextKey = CONTEXT_KEY_HAS_COMMENTS.bindTo(contextKeyService);
            this.someCommentsExpandedContextKey = CONTEXT_KEY_SOME_COMMENTS_EXPANDED.bindTo(contextKeyService);
            this.stateMemento = stateMemento;
            this.viewState = viewState;
            this.filters = this._register(new commentsViewActions_1.CommentsFilters({
                showResolved: this.viewState['showResolved'] !== false,
                showUnresolved: this.viewState['showUnresolved'] !== false,
            }, this.contextKeyService));
            this.filter = new commentsTreeViewer_1.Filter(new commentsFilterOptions_1.FilterOptions(this.filterWidget.getFilterText(), this.filters.showResolved, this.filters.showUnresolved));
            this._register(this.filters.onDidChange((event) => {
                if (event.showResolved || event.showUnresolved) {
                    this.updateFilter();
                }
            }));
            this._register(this.filterWidget.onDidChangeFilterText(() => this.updateFilter()));
        }
        updateBadge(unresolved) {
            if (unresolved === this.totalUnresolved) {
                return;
            }
            this.totalUnresolved = unresolved;
            const message = nls.localize('totalUnresolvedComments', '{0} Unresolved Comments', this.totalUnresolved);
            this.activity.value = this.activityService.showViewActivity(this.id, { badge: new activity_1.NumberBadge(this.totalUnresolved, () => message) });
        }
        saveState() {
            this.viewState['filter'] = this.filterWidget.getFilterText();
            this.viewState['filterHistory'] = this.filterWidget.getHistory();
            this.viewState['showResolved'] = this.filters.showResolved;
            this.viewState['showUnresolved'] = this.filters.showUnresolved;
            this.stateMemento.saveMemento();
            super.saveState();
        }
        render() {
            super.render();
            this._register((0, widgetNavigationCommands_1.registerNavigableContainer)({
                focusNotifiers: [this, this.filterWidget],
                focusNextWidget: () => {
                    if (this.filterWidget.hasFocus()) {
                        this.focus();
                    }
                },
                focusPreviousWidget: () => {
                    if (!this.filterWidget.hasFocus()) {
                        this.focusFilter();
                    }
                }
            }));
        }
        focusFilter() {
            this.filterWidget.focus();
        }
        clearFilterText() {
            this.filterWidget.setFilterText('');
        }
        getFilterStats() {
            if (!this.cachedFilterStats) {
                this.cachedFilterStats = {
                    total: this.totalComments,
                    filtered: this.tree?.getVisibleItemCount() ?? 0
                };
            }
            return this.cachedFilterStats;
        }
        updateFilter() {
            this.filter.options = new commentsFilterOptions_1.FilterOptions(this.filterWidget.getFilterText(), this.filters.showResolved, this.filters.showUnresolved);
            this.tree?.filterComments();
            this.cachedFilterStats = undefined;
            const { total, filtered } = this.getFilterStats();
            this.filterWidget.updateBadge(total === filtered || total === 0 ? undefined : nls.localize('showing filtered results', "Showing {0} of {1}", filtered, total));
            this.filterWidget.checkMoreFilters(!this.filters.showResolved || !this.filters.showUnresolved);
        }
        renderBody(container) {
            super.renderBody(container);
            container.classList.add('comments-panel');
            const domContainer = dom.append(container, dom.$('.comments-panel-container'));
            this.treeContainer = dom.append(domContainer, dom.$('.tree-container'));
            this.treeContainer.classList.add('file-icon-themable-tree', 'show-file-icons');
            this.commentsModel = new commentModel_1.CommentsModel();
            this.cachedFilterStats = undefined;
            this.createTree();
            this.createMessageBox(domContainer);
            this._register(this.commentService.onDidSetAllCommentThreads(this.onAllCommentsChanged, this));
            this._register(this.commentService.onDidUpdateCommentThreads(this.onCommentsUpdated, this));
            this._register(this.commentService.onDidDeleteDataProvider(this.onDataProviderDeleted, this));
            const styleElement = dom.createStyleSheet(container);
            this.applyStyles(styleElement);
            this._register(this.themeService.onDidColorThemeChange(_ => this.applyStyles(styleElement)));
            this._register(this.onDidChangeBodyVisibility(visible => {
                if (visible) {
                    this.refresh();
                }
            }));
            this.renderComments();
        }
        focus() {
            if (this.tree && this.tree.getHTMLElement() === document.activeElement) {
                return;
            }
            if (!this.commentsModel.hasCommentThreads() && this.messageBoxContainer) {
                this.messageBoxContainer.focus();
            }
            else if (this.tree) {
                this.tree.domFocus();
            }
        }
        applyStyles(styleElement) {
            const content = [];
            const theme = this.themeService.getColorTheme();
            const linkColor = theme.getColor(colorRegistry_1.textLinkForeground);
            if (linkColor) {
                content.push(`.comments-panel .comments-panel-container a { color: ${linkColor}; }`);
            }
            const linkActiveColor = theme.getColor(colorRegistry_1.textLinkActiveForeground);
            if (linkActiveColor) {
                content.push(`.comments-panel .comments-panel-container a:hover, a:active { color: ${linkActiveColor}; }`);
            }
            const focusColor = theme.getColor(colorRegistry_1.focusBorder);
            if (focusColor) {
                content.push(`.comments-panel .comments-panel-container a:focus { outline-color: ${focusColor}; }`);
            }
            const codeTextForegroundColor = theme.getColor(colorRegistry_1.textPreformatForeground);
            if (codeTextForegroundColor) {
                content.push(`.comments-panel .comments-panel-container .text code { color: ${codeTextForegroundColor}; }`);
            }
            styleElement.textContent = content.join('\n');
        }
        async renderComments() {
            this.treeContainer.classList.toggle('hidden', !this.commentsModel.hasCommentThreads());
            this.renderMessage();
            await this.tree?.setChildren(null, createResourceCommentsIterator(this.commentsModel));
        }
        collapseAll() {
            if (this.tree) {
                this.tree.collapseAll();
                this.tree.setSelection([]);
                this.tree.setFocus([]);
                this.tree.domFocus();
                this.tree.focusFirst();
            }
        }
        expandAll() {
            if (this.tree) {
                this.tree.expandAll();
                this.tree.setSelection([]);
                this.tree.setFocus([]);
                this.tree.domFocus();
                this.tree.focusFirst();
            }
        }
        get hasRendered() {
            return !!this.tree;
        }
        layoutBodyContent(height = this.currentHeight, width = this.currentWidth) {
            if (this.messageBoxContainer) {
                this.messageBoxContainer.style.height = `${height}px`;
            }
            this.tree?.layout(height, width);
            this.currentHeight = height;
            this.currentWidth = width;
        }
        createMessageBox(parent) {
            this.messageBoxContainer = dom.append(parent, dom.$('.message-box-container'));
            this.messageBoxContainer.setAttribute('tabIndex', '0');
        }
        renderMessage() {
            this.messageBoxContainer.textContent = this.commentsModel.getMessage();
            this.messageBoxContainer.classList.toggle('hidden', this.commentsModel.hasCommentThreads());
        }
        createTree() {
            this.treeLabels = this._register(this.instantiationService.createInstance(labels_1.ResourceLabels, this));
            this.tree = this._register(this.instantiationService.createInstance(commentsTreeViewer_1.CommentsList, this.treeLabels, this.treeContainer, {
                overrideStyles: { listBackground: this.getBackgroundColor() },
                selectionNavigation: true,
                filter: this.filter,
                keyboardNavigationLabelProvider: {
                    getKeyboardNavigationLabel: (item) => {
                        return undefined;
                    }
                },
                accessibilityProvider: {
                    getAriaLabel(element) {
                        if (element instanceof commentModel_1.CommentsModel) {
                            return nls.localize('rootCommentsLabel', "Comments for current workspace");
                        }
                        if (element instanceof commentModel_1.ResourceWithCommentThreads) {
                            return nls.localize('resourceWithCommentThreadsLabel', "Comments in {0}, full path {1}", (0, resources_1.basename)(element.resource), element.resource.fsPath);
                        }
                        if (element instanceof commentModel_1.CommentNode) {
                            if (element.range) {
                                return nls.localize('resourceWithCommentLabel', "Comment from ${0} at line {1} column {2} in {3}, source: {4}", element.comment.userName, element.range.startLineNumber, element.range.startColumn, (0, resources_1.basename)(element.resource), (typeof element.comment.body === 'string') ? element.comment.body : element.comment.body.value);
                            }
                            else {
                                return nls.localize('resourceWithCommentLabelFile', "Comment from ${0} in {1}, source: {2}", element.comment.userName, (0, resources_1.basename)(element.resource), (typeof element.comment.body === 'string') ? element.comment.body : element.comment.body.value);
                            }
                        }
                        return '';
                    },
                    getWidgetAriaLabel() {
                        return commentsTreeViewer_1.COMMENTS_VIEW_TITLE;
                    }
                }
            }));
            this._register(this.tree.onDidOpen(e => {
                this.openFile(e.element, e.editorOptions.pinned, e.editorOptions.preserveFocus, e.sideBySide);
            }));
            this._register(this.tree.onDidChangeModel(() => {
                this.updateSomeCommentsExpanded();
            }));
            this._register(this.tree.onDidChangeCollapseState(() => {
                this.updateSomeCommentsExpanded();
            }));
        }
        openFile(element, pinned, preserveFocus, sideBySide) {
            if (!element) {
                return false;
            }
            if (!(element instanceof commentModel_1.ResourceWithCommentThreads || element instanceof commentModel_1.CommentNode)) {
                return false;
            }
            if (!this.commentService.isCommentingEnabled) {
                this.commentService.enableCommenting(true);
            }
            const range = element instanceof commentModel_1.ResourceWithCommentThreads ? element.commentThreads[0].range : element.range;
            const activeEditor = this.editorService.activeTextEditorControl;
            // If the active editor is a diff editor where one of the sides has the comment,
            // then we try to reveal the comment in the diff editor.
            const currentActiveResources = (0, editorBrowser_1.isDiffEditor)(activeEditor) ? [activeEditor.getOriginalEditor(), activeEditor.getModifiedEditor()]
                : (activeEditor ? [activeEditor] : []);
            for (const editor of currentActiveResources) {
                const model = editor.getModel();
                if ((model instanceof textModel_1.TextModel) && this.uriIdentityService.extUri.isEqual(element.resource, model.uri)) {
                    const threadToReveal = element instanceof commentModel_1.ResourceWithCommentThreads ? element.commentThreads[0].threadId : element.threadId;
                    const commentToReveal = element instanceof commentModel_1.ResourceWithCommentThreads ? element.commentThreads[0].comment.uniqueIdInThread : element.comment.uniqueIdInThread;
                    if (threadToReveal && (0, editorBrowser_1.isCodeEditor)(editor)) {
                        const controller = commentsController_1.CommentController.get(editor);
                        controller?.revealCommentThread(threadToReveal, commentToReveal, true, !preserveFocus);
                    }
                    return true;
                }
            }
            const threadToReveal = element instanceof commentModel_1.ResourceWithCommentThreads ? element.commentThreads[0].threadId : element.threadId;
            const commentToReveal = element instanceof commentModel_1.ResourceWithCommentThreads ? element.commentThreads[0].comment : element.comment;
            this.editorService.openEditor({
                resource: element.resource,
                options: {
                    pinned: pinned,
                    preserveFocus: preserveFocus,
                    selection: range ?? new range_1.Range(1, 1, 1, 1)
                }
            }, sideBySide ? editorService_1.SIDE_GROUP : editorService_1.ACTIVE_GROUP).then(editor => {
                if (editor) {
                    const control = editor.getControl();
                    if (threadToReveal && (0, editorBrowser_1.isCodeEditor)(control)) {
                        const controller = commentsController_1.CommentController.get(control);
                        controller?.revealCommentThread(threadToReveal, commentToReveal.uniqueIdInThread, true, !preserveFocus);
                    }
                }
            });
            return true;
        }
        async refresh() {
            if (!this.tree) {
                return;
            }
            if (this.isVisible()) {
                this.hasCommentsContextKey.set(this.commentsModel.hasCommentThreads());
                this.treeContainer.classList.toggle('hidden', !this.commentsModel.hasCommentThreads());
                this.cachedFilterStats = undefined;
                this.renderMessage();
                this.tree?.setChildren(null, createResourceCommentsIterator(this.commentsModel));
                if (this.tree.getSelection().length === 0 && this.commentsModel.hasCommentThreads()) {
                    const firstComment = this.commentsModel.resourceCommentThreads[0].commentThreads[0];
                    if (firstComment) {
                        this.tree.setFocus([firstComment]);
                        this.tree.setSelection([firstComment]);
                    }
                }
            }
        }
        onAllCommentsChanged(e) {
            this.cachedFilterStats = undefined;
            this.commentsModel.setCommentThreads(e.ownerId, e.commentThreads);
            this.totalComments += e.commentThreads.length;
            let unresolved = 0;
            for (const thread of e.commentThreads) {
                if (thread.state === languages_1.CommentThreadState.Unresolved) {
                    unresolved++;
                }
            }
            this.updateBadge(unresolved);
            this.refresh();
        }
        onCommentsUpdated(e) {
            this.cachedFilterStats = undefined;
            const didUpdate = this.commentsModel.updateCommentThreads(e);
            this.totalComments += e.added.length;
            this.totalComments -= e.removed.length;
            let unresolved = 0;
            for (const resource of this.commentsModel.resourceCommentThreads) {
                for (const thread of resource.commentThreads) {
                    if (thread.threadState === languages_1.CommentThreadState.Unresolved) {
                        unresolved++;
                    }
                }
            }
            this.updateBadge(unresolved);
            if (didUpdate) {
                this.refresh();
            }
        }
        onDataProviderDeleted(owner) {
            this.cachedFilterStats = undefined;
            this.commentsModel.deleteCommentsByOwner(owner);
            this.totalComments = 0;
            this.refresh();
        }
        updateSomeCommentsExpanded() {
            this.someCommentsExpandedContextKey.set(this.isSomeCommentsExpanded());
        }
        areAllCommentsExpanded() {
            if (!this.tree) {
                return false;
            }
            const navigator = this.tree.navigate();
            while (navigator.next()) {
                if (this.tree.isCollapsed(navigator.current())) {
                    return false;
                }
            }
            return true;
        }
        isSomeCommentsExpanded() {
            if (!this.tree) {
                return false;
            }
            const navigator = this.tree.navigate();
            while (navigator.next()) {
                if (!this.tree.isCollapsed(navigator.current())) {
                    return true;
                }
            }
            return false;
        }
    };
    exports.CommentsPanel = CommentsPanel;
    exports.CommentsPanel = CommentsPanel = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, views_1.IViewDescriptorService),
        __param(3, editorService_1.IEditorService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, contextkey_1.IContextKeyService),
        __param(6, contextView_1.IContextMenuService),
        __param(7, keybinding_1.IKeybindingService),
        __param(8, opener_1.IOpenerService),
        __param(9, themeService_1.IThemeService),
        __param(10, commentService_1.ICommentService),
        __param(11, telemetry_1.ITelemetryService),
        __param(12, uriIdentity_1.IUriIdentityService),
        __param(13, activity_1.IActivityService),
        __param(14, storage_1.IStorageService)
    ], CommentsPanel);
    commands_1.CommandsRegistry.registerCommand({
        id: 'workbench.action.focusCommentsPanel',
        handler: async (accessor) => {
            const viewsService = accessor.get(views_1.IViewsService);
            viewsService.openView(commentsTreeViewer_1.COMMENTS_VIEW_ID, true);
        }
    });
    (0, actions_1.registerAction2)(class Collapse extends viewPane_1.ViewAction {
        constructor() {
            super({
                viewId: commentsTreeViewer_1.COMMENTS_VIEW_ID,
                id: 'comments.collapse',
                title: nls.localize('collapseAll', "Collapse All"),
                f1: false,
                icon: codicons_1.Codicon.collapseAll,
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', commentsTreeViewer_1.COMMENTS_VIEW_ID), CONTEXT_KEY_HAS_COMMENTS), CONTEXT_KEY_SOME_COMMENTS_EXPANDED),
                    order: 100
                }
            });
        }
        runInView(_accessor, view) {
            view.collapseAll();
        }
    });
    (0, actions_1.registerAction2)(class Expand extends viewPane_1.ViewAction {
        constructor() {
            super({
                viewId: commentsTreeViewer_1.COMMENTS_VIEW_ID,
                id: 'comments.expand',
                title: nls.localize('expandAll', "Expand All"),
                f1: false,
                icon: codicons_1.Codicon.expandAll,
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', commentsTreeViewer_1.COMMENTS_VIEW_ID), CONTEXT_KEY_HAS_COMMENTS), contextkey_1.ContextKeyExpr.not(CONTEXT_KEY_SOME_COMMENTS_EXPANDED.key)),
                    order: 100
                }
            });
        }
        runInView(_accessor, view) {
            view.expandAll();
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWVudHNWaWV3LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY29tbWVudHMvYnJvd3Nlci9jb21tZW50c1ZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBMkNoRyxNQUFNLHdCQUF3QixHQUFHLElBQUksMEJBQWEsQ0FBVSwwQkFBMEIsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUMvRixNQUFNLGtDQUFrQyxHQUFHLElBQUksMEJBQWEsQ0FBVSxtQ0FBbUMsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNsSCxNQUFNLGVBQWUsR0FBRyxtQkFBbUIsQ0FBQztJQUU1QyxTQUFTLDhCQUE4QixDQUFDLEtBQW9CO1FBQzNELE9BQU8sbUJBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLHNCQUFzQixFQUFFLENBQUMsQ0FBQyxFQUFFO1lBQ3JELE1BQU0sYUFBYSxHQUFHLG1CQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUN0RCxNQUFNLFFBQVEsR0FBRyxtQkFBUSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUVwRSxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQztRQUNqQyxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFTSxJQUFNLGFBQWEsR0FBbkIsTUFBTSxhQUFjLFNBQVEseUJBQWM7UUFzQmhELFlBQ0MsT0FBeUIsRUFDRixvQkFBMkMsRUFDMUMscUJBQTZDLEVBQ3JELGFBQThDLEVBQ3ZDLG9CQUEyQyxFQUM5QyxpQkFBcUMsRUFDcEMsa0JBQXVDLEVBQ3hDLGlCQUFxQyxFQUN6QyxhQUE2QixFQUM5QixZ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