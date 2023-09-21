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
define(["require", "exports", "vs/nls!vs/workbench/contrib/comments/browser/commentsView", "vs/base/browser/dom", "vs/base/common/resources", "vs/editor/browser/editorBrowser", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/workbench/contrib/comments/common/commentModel", "vs/workbench/contrib/comments/browser/commentService", "vs/workbench/services/editor/common/editorService", "vs/platform/commands/common/commands", "vs/platform/theme/common/colorRegistry", "vs/workbench/browser/labels", "vs/workbench/contrib/comments/browser/commentsTreeViewer", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/views", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/keybinding/common/keybinding", "vs/platform/opener/common/opener", "vs/platform/telemetry/common/telemetry", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/actions/common/actions", "vs/base/common/codicons", "vs/editor/common/model/textModel", "vs/workbench/contrib/comments/browser/comments", "vs/workbench/contrib/comments/browser/commentsViewActions", "vs/workbench/common/memento", "vs/platform/storage/common/storage", "vs/workbench/contrib/comments/browser/commentsFilterOptions", "vs/workbench/services/activity/common/activity", "vs/editor/common/languages", "vs/base/common/lifecycle", "vs/base/common/iterator", "vs/workbench/contrib/comments/browser/commentsController", "vs/editor/common/core/range", "vs/workbench/browser/actions/widgetNavigationCommands", "vs/css!./media/panel"], function (require, exports, nls, dom, resources_1, editorBrowser_1, instantiation_1, themeService_1, commentModel_1, commentService_1, editorService_1, commands_1, colorRegistry_1, labels_1, commentsTreeViewer_1, viewPane_1, views_1, configuration_1, contextkey_1, contextView_1, keybinding_1, opener_1, telemetry_1, uriIdentity_1, actions_1, codicons_1, textModel_1, comments_1, commentsViewActions_1, memento_1, storage_1, commentsFilterOptions_1, activity_1, languages_1, lifecycle_1, iterator_1, commentsController_1, range_1, widgetNavigationCommands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Mmb = void 0;
    const CONTEXT_KEY_HAS_COMMENTS = new contextkey_1.$2i('commentsView.hasComments', false);
    const CONTEXT_KEY_SOME_COMMENTS_EXPANDED = new contextkey_1.$2i('commentsView.someCommentsExpanded', false);
    const VIEW_STORAGE_ID = 'commentsViewState';
    function createResourceCommentsIterator(model) {
        return iterator_1.Iterable.map(model.resourceCommentThreads, m => {
            const CommentNodeIt = iterator_1.Iterable.from(m.commentThreads);
            const children = iterator_1.Iterable.map(CommentNodeIt, r => ({ element: r }));
            return { element: m, children };
        });
    }
    let $Mmb = class $Mmb extends viewPane_1.$Jeb {
        constructor(options, instantiationService, viewDescriptorService, dc, configurationService, contextKeyService, contextMenuService, keybindingService, openerService, themeService, ec, telemetryService, fc, gc, storageService) {
            const stateMemento = new memento_1.$YT(VIEW_STORAGE_ID, storageService);
            const viewState = stateMemento.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            super({
                ...options,
                filterOptions: {
                    placeholder: nls.localize(0, null),
                    ariaLabel: nls.localize(1, null),
                    history: viewState['filterHistory'] || [],
                    text: viewState['filter'] || '',
                    focusContextKey: comments_1.$6lb.key
                }
            }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.dc = dc;
            this.ec = ec;
            this.fc = fc;
            this.gc = gc;
            this.L = 0;
            this.ab = 0;
            this.Yb = this.B(new lifecycle_1.$lc());
            this.Zb = 0;
            this.$b = 0;
            this.cc = undefined;
            this.onDidChangeVisibility = this.onDidChangeBodyVisibility;
            this.sb = CONTEXT_KEY_HAS_COMMENTS.bindTo(contextKeyService);
            this.Wb = CONTEXT_KEY_SOME_COMMENTS_EXPANDED.bindTo(contextKeyService);
            this.bc = stateMemento;
            this.ac = viewState;
            this.filters = this.B(new commentsViewActions_1.$5lb({
                showResolved: this.ac['showResolved'] !== false,
                showUnresolved: this.ac['showUnresolved'] !== false,
            }, this.zb));
            this.Xb = new commentsTreeViewer_1.$3lb(new commentsFilterOptions_1.$Vlb(this.filterWidget.getFilterText(), this.filters.showResolved, this.filters.showUnresolved));
            this.B(this.filters.onDidChange((event) => {
                if (event.showResolved || event.showUnresolved) {
                    this.ic();
                }
            }));
            this.B(this.filterWidget.onDidChangeFilterText(() => this.ic()));
        }
        hc(unresolved) {
            if (unresolved === this.ab) {
                return;
            }
            this.ab = unresolved;
            const message = nls.localize(2, null, this.ab);
            this.Yb.value = this.gc.showViewActivity(this.id, { badge: new activity_1.$IV(this.ab, () => message) });
        }
        saveState() {
            this.ac['filter'] = this.filterWidget.getFilterText();
            this.ac['filterHistory'] = this.filterWidget.getHistory();
            this.ac['showResolved'] = this.filters.showResolved;
            this.ac['showUnresolved'] = this.filters.showUnresolved;
            this.bc.saveMemento();
            super.saveState();
        }
        render() {
            super.render();
            this.B((0, widgetNavigationCommands_1.$Cmb)({
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
            if (!this.cc) {
                this.cc = {
                    total: this.L,
                    filtered: this.f?.getVisibleItemCount() ?? 0
                };
            }
            return this.cc;
        }
        ic() {
            this.Xb.options = new commentsFilterOptions_1.$Vlb(this.filterWidget.getFilterText(), this.filters.showResolved, this.filters.showUnresolved);
            this.f?.filterComments();
            this.cc = undefined;
            const { total, filtered } = this.getFilterStats();
            this.filterWidget.updateBadge(total === filtered || total === 0 ? undefined : nls.localize(3, null, filtered, total));
            this.filterWidget.checkMoreFilters(!this.filters.showResolved || !this.filters.showUnresolved);
        }
        U(container) {
            super.U(container);
            container.classList.add('comments-panel');
            const domContainer = dom.$0O(container, dom.$('.comments-panel-container'));
            this.h = dom.$0O(domContainer, dom.$('.tree-container'));
            this.h.classList.add('file-icon-themable-tree', 'show-file-icons');
            this.t = new commentModel_1.$Flb();
            this.cc = undefined;
            this.pc();
            this.nc(domContainer);
            this.B(this.ec.onDidSetAllCommentThreads(this.sc, this));
            this.B(this.ec.onDidUpdateCommentThreads(this.tc, this));
            this.B(this.ec.onDidDeleteDataProvider(this.uc, this));
            const styleElement = dom.$XO(container);
            this.kc(styleElement);
            this.B(this.Db.onDidColorThemeChange(_ => this.kc(styleElement)));
            this.B(this.onDidChangeBodyVisibility(visible => {
                if (visible) {
                    this.rc();
                }
            }));
            this.lc();
        }
        focus() {
            if (this.f && this.f.getHTMLElement() === document.activeElement) {
                return;
            }
            if (!this.t.hasCommentThreads() && this.s) {
                this.s.focus();
            }
            else if (this.f) {
                this.f.domFocus();
            }
        }
        kc(styleElement) {
            const content = [];
            const theme = this.Db.getColorTheme();
            const linkColor = theme.getColor(colorRegistry_1.$Ev);
            if (linkColor) {
                content.push(`.comments-panel .comments-panel-container a { color: ${linkColor}; }`);
            }
            const linkActiveColor = theme.getColor(colorRegistry_1.$Fv);
            if (linkActiveColor) {
                content.push(`.comments-panel .comments-panel-container a:hover, a:active { color: ${linkActiveColor}; }`);
            }
            const focusColor = theme.getColor(colorRegistry_1.$zv);
            if (focusColor) {
                content.push(`.comments-panel .comments-panel-container a:focus { outline-color: ${focusColor}; }`);
            }
            const codeTextForegroundColor = theme.getColor(colorRegistry_1.$Gv);
            if (codeTextForegroundColor) {
                content.push(`.comments-panel .comments-panel-container .text code { color: ${codeTextForegroundColor}; }`);
            }
            styleElement.textContent = content.join('\n');
        }
        async lc() {
            this.h.classList.toggle('hidden', !this.t.hasCommentThreads());
            this.oc();
            await this.f?.setChildren(null, createResourceCommentsIterator(this.t));
        }
        collapseAll() {
            if (this.f) {
                this.f.collapseAll();
                this.f.setSelection([]);
                this.f.setFocus([]);
                this.f.domFocus();
                this.f.focusFirst();
            }
        }
        expandAll() {
            if (this.f) {
                this.f.expandAll();
                this.f.setSelection([]);
                this.f.setFocus([]);
                this.f.domFocus();
                this.f.focusFirst();
            }
        }
        get hasRendered() {
            return !!this.f;
        }
        n(height = this.Zb, width = this.$b) {
            if (this.s) {
                this.s.style.height = `${height}px`;
            }
            this.f?.layout(height, width);
            this.Zb = height;
            this.$b = width;
        }
        nc(parent) {
            this.s = dom.$0O(parent, dom.$('.message-box-container'));
            this.s.setAttribute('tabIndex', '0');
        }
        oc() {
            this.s.textContent = this.t.getMessage();
            this.s.classList.toggle('hidden', this.t.hasCommentThreads());
        }
        pc() {
            this.c = this.B(this.Bb.createInstance(labels_1.$Llb, this));
            this.f = this.B(this.Bb.createInstance(commentsTreeViewer_1.$4lb, this.c, this.h, {
                overrideStyles: { listBackground: this.Rb() },
                selectionNavigation: true,
                filter: this.Xb,
                keyboardNavigationLabelProvider: {
                    getKeyboardNavigationLabel: (item) => {
                        return undefined;
                    }
                },
                accessibilityProvider: {
                    getAriaLabel(element) {
                        if (element instanceof commentModel_1.$Flb) {
                            return nls.localize(4, null);
                        }
                        if (element instanceof commentModel_1.$Elb) {
                            return nls.localize(5, null, (0, resources_1.$fg)(element.resource), element.resource.fsPath);
                        }
                        if (element instanceof commentModel_1.$Dlb) {
                            if (element.range) {
                                return nls.localize(6, null, element.comment.userName, element.range.startLineNumber, element.range.startColumn, (0, resources_1.$fg)(element.resource), (typeof element.comment.body === 'string') ? element.comment.body : element.comment.body.value);
                            }
                            else {
                                return nls.localize(7, null, element.comment.userName, (0, resources_1.$fg)(element.resource), (typeof element.comment.body === 'string') ? element.comment.body : element.comment.body.value);
                            }
                        }
                        return '';
                    },
                    getWidgetAriaLabel() {
                        return commentsTreeViewer_1.$Zlb;
                    }
                }
            }));
            this.B(this.f.onDidOpen(e => {
                this.qc(e.element, e.editorOptions.pinned, e.editorOptions.preserveFocus, e.sideBySide);
            }));
            this.B(this.f.onDidChangeModel(() => {
                this.vc();
            }));
            this.B(this.f.onDidChangeCollapseState(() => {
                this.vc();
            }));
        }
        qc(element, pinned, preserveFocus, sideBySide) {
            if (!element) {
                return false;
            }
            if (!(element instanceof commentModel_1.$Elb || element instanceof commentModel_1.$Dlb)) {
                return false;
            }
            if (!this.ec.isCommentingEnabled) {
                this.ec.enableCommenting(true);
            }
            const range = element instanceof commentModel_1.$Elb ? element.commentThreads[0].range : element.range;
            const activeEditor = this.dc.activeTextEditorControl;
            // If the active editor is a diff editor where one of the sides has the comment,
            // then we try to reveal the comment in the diff editor.
            const currentActiveResources = (0, editorBrowser_1.$jV)(activeEditor) ? [activeEditor.getOriginalEditor(), activeEditor.getModifiedEditor()]
                : (activeEditor ? [activeEditor] : []);
            for (const editor of currentActiveResources) {
                const model = editor.getModel();
                if ((model instanceof textModel_1.$MC) && this.fc.extUri.isEqual(element.resource, model.uri)) {
                    const threadToReveal = element instanceof commentModel_1.$Elb ? element.commentThreads[0].threadId : element.threadId;
                    const commentToReveal = element instanceof commentModel_1.$Elb ? element.commentThreads[0].comment.uniqueIdInThread : element.comment.uniqueIdInThread;
                    if (threadToReveal && (0, editorBrowser_1.$iV)(editor)) {
                        const controller = commentsController_1.$Lmb.get(editor);
                        controller?.revealCommentThread(threadToReveal, commentToReveal, true, !preserveFocus);
                    }
                    return true;
                }
            }
            const threadToReveal = element instanceof commentModel_1.$Elb ? element.commentThreads[0].threadId : element.threadId;
            const commentToReveal = element instanceof commentModel_1.$Elb ? element.commentThreads[0].comment : element.comment;
            this.dc.openEditor({
                resource: element.resource,
                options: {
                    pinned: pinned,
                    preserveFocus: preserveFocus,
                    selection: range ?? new range_1.$ks(1, 1, 1, 1)
                }
            }, sideBySide ? editorService_1.$$C : editorService_1.$0C).then(editor => {
                if (editor) {
                    const control = editor.getControl();
                    if (threadToReveal && (0, editorBrowser_1.$iV)(control)) {
                        const controller = commentsController_1.$Lmb.get(control);
                        controller?.revealCommentThread(threadToReveal, commentToReveal.uniqueIdInThread, true, !preserveFocus);
                    }
                }
            });
            return true;
        }
        async rc() {
            if (!this.f) {
                return;
            }
            if (this.isVisible()) {
                this.sb.set(this.t.hasCommentThreads());
                this.h.classList.toggle('hidden', !this.t.hasCommentThreads());
                this.cc = undefined;
                this.oc();
                this.f?.setChildren(null, createResourceCommentsIterator(this.t));
                if (this.f.getSelection().length === 0 && this.t.hasCommentThreads()) {
                    const firstComment = this.t.resourceCommentThreads[0].commentThreads[0];
                    if (firstComment) {
                        this.f.setFocus([firstComment]);
                        this.f.setSelection([firstComment]);
                    }
                }
            }
        }
        sc(e) {
            this.cc = undefined;
            this.t.setCommentThreads(e.ownerId, e.commentThreads);
            this.L += e.commentThreads.length;
            let unresolved = 0;
            for (const thread of e.commentThreads) {
                if (thread.state === languages_1.CommentThreadState.Unresolved) {
                    unresolved++;
                }
            }
            this.hc(unresolved);
            this.rc();
        }
        tc(e) {
            this.cc = undefined;
            const didUpdate = this.t.updateCommentThreads(e);
            this.L += e.added.length;
            this.L -= e.removed.length;
            let unresolved = 0;
            for (const resource of this.t.resourceCommentThreads) {
                for (const thread of resource.commentThreads) {
                    if (thread.threadState === languages_1.CommentThreadState.Unresolved) {
                        unresolved++;
                    }
                }
            }
            this.hc(unresolved);
            if (didUpdate) {
                this.rc();
            }
        }
        uc(owner) {
            this.cc = undefined;
            this.t.deleteCommentsByOwner(owner);
            this.L = 0;
            this.rc();
        }
        vc() {
            this.Wb.set(this.isSomeCommentsExpanded());
        }
        areAllCommentsExpanded() {
            if (!this.f) {
                return false;
            }
            const navigator = this.f.navigate();
            while (navigator.next()) {
                if (this.f.isCollapsed(navigator.current())) {
                    return false;
                }
            }
            return true;
        }
        isSomeCommentsExpanded() {
            if (!this.f) {
                return false;
            }
            const navigator = this.f.navigate();
            while (navigator.next()) {
                if (!this.f.isCollapsed(navigator.current())) {
                    return true;
                }
            }
            return false;
        }
    };
    exports.$Mmb = $Mmb;
    exports.$Mmb = $Mmb = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, views_1.$_E),
        __param(3, editorService_1.$9C),
        __param(4, configuration_1.$8h),
        __param(5, contextkey_1.$3i),
        __param(6, contextView_1.$WZ),
        __param(7, keybinding_1.$2D),
        __param(8, opener_1.$NT),
        __param(9, themeService_1.$gv),
        __param(10, commentService_1.$Ilb),
        __param(11, telemetry_1.$9k),
        __param(12, uriIdentity_1.$Ck),
        __param(13, activity_1.$HV),
        __param(14, storage_1.$Vo)
    ], $Mmb);
    commands_1.$Gr.registerCommand({
        id: 'workbench.action.focusCommentsPanel',
        handler: async (accessor) => {
            const viewsService = accessor.get(views_1.$$E);
            viewsService.openView(commentsTreeViewer_1.$Wlb, true);
        }
    });
    (0, actions_1.$Xu)(class Collapse extends viewPane_1.$Keb {
        constructor() {
            super({
                viewId: commentsTreeViewer_1.$Wlb,
                id: 'comments.collapse',
                title: nls.localize(8, null),
                f1: false,
                icon: codicons_1.$Pj.collapseAll,
                menu: {
                    id: actions_1.$Ru.ViewTitle,
                    group: 'navigation',
                    when: contextkey_1.$Ii.and(contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', commentsTreeViewer_1.$Wlb), CONTEXT_KEY_HAS_COMMENTS), CONTEXT_KEY_SOME_COMMENTS_EXPANDED),
                    order: 100
                }
            });
        }
        runInView(_accessor, view) {
            view.collapseAll();
        }
    });
    (0, actions_1.$Xu)(class Expand extends viewPane_1.$Keb {
        constructor() {
            super({
                viewId: commentsTreeViewer_1.$Wlb,
                id: 'comments.expand',
                title: nls.localize(9, null),
                f1: false,
                icon: codicons_1.$Pj.expandAll,
                menu: {
                    id: actions_1.$Ru.ViewTitle,
                    group: 'navigation',
                    when: contextkey_1.$Ii.and(contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', commentsTreeViewer_1.$Wlb), CONTEXT_KEY_HAS_COMMENTS), contextkey_1.$Ii.not(CONTEXT_KEY_SOME_COMMENTS_EXPANDED.key)),
                    order: 100
                }
            });
        }
        runInView(_accessor, view) {
            view.expandAll();
        }
    });
});
//# sourceMappingURL=commentsView.js.map