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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/aria/aria", "vs/base/browser/ui/tree/tree", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/strings", "vs/base/common/uri", "vs/base/common/network", "vs/editor/browser/editorBrowser", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/editor/common/core/selection", "vs/editor/contrib/find/browser/findController", "vs/editor/contrib/multicursor/browser/multicursor", "vs/nls!vs/workbench/contrib/search/browser/searchView", "vs/platform/accessibility/common/accessibility", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/dialogs/common/dialogs", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/keybinding/common/keybinding", "vs/platform/list/browser/listService", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/progress/common/progress", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/browser/defaultStyles", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/platform/workspace/common/workspace", "vs/workbench/browser/actions/workspaceActions", "vs/workbench/browser/dnd", "vs/workbench/browser/labels", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/memento", "vs/workbench/common/views", "vs/workbench/contrib/notebook/browser/notebookEditor", "vs/workbench/contrib/search/browser/patternInputWidget", "vs/workbench/contrib/search/browser/searchActionsBase", "vs/workbench/contrib/search/browser/searchIcons", "vs/workbench/contrib/search/browser/searchMessage", "vs/workbench/contrib/search/browser/searchResultsView", "vs/workbench/contrib/search/browser/searchWidget", "vs/workbench/contrib/search/common/constants", "vs/workbench/contrib/search/browser/replace", "vs/workbench/contrib/search/common/search", "vs/workbench/contrib/search/common/searchHistoryService", "vs/workbench/contrib/search/browser/searchModel", "vs/workbench/contrib/searchEditor/browser/searchEditorActions", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/search/common/queryBuilder", "vs/workbench/services/search/common/search", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/contrib/notebook/common/notebookService", "vs/platform/log/common/log", "vs/css!./media/searchview"], function (require, exports, dom, keyboardEvent_1, aria, tree_1, async_1, errors, event_1, iterator_1, lifecycle_1, env, strings, uri_1, network, editorBrowser_1, codeEditorService_1, embeddedCodeEditorWidget_1, selection_1, findController_1, multicursor_1, nls, accessibility_1, actions_1, commands_1, configuration_1, contextkey_1, contextView_1, dialogs_1, files_1, instantiation_1, serviceCollection_1, keybinding_1, listService_1, notification_1, opener_1, progress_1, storage_1, telemetry_1, defaultStyles_1, themeService_1, themables_1, workspace_1, workspaceActions_1, dnd_1, labels_1, viewPane_1, memento_1, views_1, notebookEditor_1, patternInputWidget_1, searchActionsBase_1, searchIcons_1, searchMessage_1, searchResultsView_1, searchWidget_1, Constants, replace_1, search_1, searchHistoryService_1, searchModel_1, searchEditorActions_1, editorService_1, preferences_1, queryBuilder_1, search_2, textfiles_1, notebookService_1, log_1) {
    "use strict";
    var $lPb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$nPb = exports.$mPb = exports.$lPb = exports.SearchViewPosition = void 0;
    const $ = dom.$;
    var SearchViewPosition;
    (function (SearchViewPosition) {
        SearchViewPosition[SearchViewPosition["SideBar"] = 0] = "SideBar";
        SearchViewPosition[SearchViewPosition["Panel"] = 1] = "Panel";
    })(SearchViewPosition || (exports.SearchViewPosition = SearchViewPosition = {}));
    const SEARCH_CANCELLED_MESSAGE = nls.localize(0, null);
    const DEBOUNCE_DELAY = 75;
    let $lPb = class $lPb extends viewPane_1.$Ieb {
        static { $lPb_1 = this; }
        static { this.c = 'actions-right'; }
        constructor(options, Lc, Mc, Nc, Oc, Pc, Qc, Rc, Sc, instantiationService, viewDescriptorService, configurationService, Tc, Uc, contextKeyService, Vc, Wc, Xc, themeService, Yc, contextMenuService, Zc, keybindingService, $c, openerService, telemetryService, ad, bd) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.Lc = Lc;
            this.Mc = Mc;
            this.Nc = Nc;
            this.Oc = Oc;
            this.Pc = Pc;
            this.Qc = Qc;
            this.Rc = Rc;
            this.Sc = Sc;
            this.Tc = Tc;
            this.Uc = Uc;
            this.Vc = Vc;
            this.Wc = Wc;
            this.Xc = Xc;
            this.Yc = Yc;
            this.Zc = Zc;
            this.$c = $c;
            this.ad = ad;
            this.bd = bd;
            this.g = false;
            this.fc = 'input';
            this.pc = new lifecycle_1.$jc();
            this.Ac = false;
            this.Cc = Promise.resolve();
            this.Gc = false;
            this.Jc = 0;
            this.h = dom.$('.search-view');
            // globals
            this.t = Constants.$gOb.bindTo(this.zb);
            this.Wb = Constants.$pOb.bindTo(this.zb);
            this.Xb = Constants.$qOb.bindTo(this.zb);
            this.Yb = Constants.$rOb.bindTo(this.zb);
            this.Zb = Constants.$sOb.bindTo(this.zb);
            this.$b = Constants.$tOb.bindTo(this.zb);
            this.ac = Constants.$uOb.bindTo(this.zb);
            this.bc = Constants.$vOb.bindTo(this.zb);
            this.ec = Constants.$oOb.bindTo(this.zb);
            this.cc = Constants.$xOb.bindTo(this.zb);
            this.gc = search_1.$OI.bindTo(this.zb);
            this.hc = Constants.$yOb.bindTo(this.zb);
            this.ic = Constants.$zOb.bindTo(this.zb);
            this.jc = Constants.$AOb.bindTo(this.zb);
            this.kc = Constants.$BOb.bindTo(this.zb);
            this.Ic = Constants.$COb.bindTo(this.zb);
            // scoped
            this.zb = this.B(this.zb.createScoped(this.h));
            Constants.$hOb.bindTo(this.zb).set(true);
            this.L = Constants.$iOb.bindTo(this.zb);
            this.ab = Constants.$lOb.bindTo(this.zb);
            this.sb = Constants.$mOb.bindTo(this.zb);
            this.dc = Constants.$wOb.bindTo(this.zb);
            this.Bb = this.Bb.createChild(new serviceCollection_1.$zh([contextkey_1.$3i, this.zb]));
            this.yb.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('search.sortOrder')) {
                    if (this.ee.sortOrder === "modified" /* SearchSortOrder.Modified */) {
                        // If changing away from modified, remove all fileStats
                        // so that updated files are re-retrieved next time.
                        this.je();
                    }
                    this.refreshTree();
                }
            });
            this.n = this.B(this.Uc.searchModel);
            this.j = this.Bb.createInstance(queryBuilder_1.$AJ);
            this.s = new memento_1.$YT(this.id, $c);
            this.nc = this.s.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            this.B(this.Lc.onDidFilesChange(e => this.de(e)));
            this.B(this.Wc.untitled.onWillDispose(model => this.ce(model.resource)));
            this.B(this.Tc.onDidChangeWorkbenchState(() => this.ed()));
            this.B(this.Yc.onDidClearHistory(() => this.fe()));
            this.B(this.yb.onDidChangeConfiguration(e => this.ld(e)));
            this.zc = this.B(new async_1.$Dg(250));
            this.Dc = this.B(new async_1.$Dg(2000));
            this.Ec = this.B(new async_1.$Dg(100));
            this.Fc = this.B(new async_1.$Dg(0));
            this.Hc = this.Bb.createInstance(searchResultsView_1.$iPb, this.n);
            this.cd = this.nc['view.treeLayout'] ?? (this.ee.defaultViewMode === "tree" /* ViewMode.Tree */);
            this.Kc = this.B(new async_1.$Sg(this.Od.bind(this), 80));
            // storage service listener for for roaming changes
            this.B(this.$c.onWillSaveState(() => {
                this.ge();
            }));
            this.B(this.$c.onDidChangeValue(1 /* StorageScope.WORKSPACE */, searchHistoryService_1.$kPb.SEARCH_HISTORY_KEY, this.B(new lifecycle_1.$jc()))(() => {
                const restoredHistory = this.Yc.load();
                if (restoredHistory.include) {
                    this.wc.prependHistory(restoredHistory.include);
                }
                if (restoredHistory.exclude) {
                    this.vc.prependHistory(restoredHistory.exclude);
                }
                if (restoredHistory.search) {
                    this.rc.prependSearchHistory(restoredHistory.search);
                }
                if (restoredHistory.replace) {
                    this.rc.prependReplaceHistory(restoredHistory.replace);
                }
            }));
        }
        get cd() {
            return this.Ic.get() ?? false;
        }
        set cd(visible) {
            this.Ic.set(visible);
        }
        setTreeView(visible) {
            if (visible === this.cd) {
                return;
            }
            this.cd = visible;
            this.hd(this.Db.getFileIconTheme());
            this.refreshTree();
        }
        get dd() {
            return this.gc.get() ?? search_1.SearchUIState.Idle;
        }
        set dd(v) {
            this.gc.set(v);
        }
        getContainer() {
            return this.h;
        }
        get searchResult() {
            return this.n && this.n.searchResult;
        }
        ed() {
            if (this.Tc.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */ && this.Bc) {
                dom.$eP(this.Bc);
            }
        }
        fd() {
            this.Gc = true;
            this.rc.setValue(this.n.searchResult.query?.contentPattern.pattern ?? '');
            this.rc.setReplaceAllActionState(false);
            this.rc.toggleReplace(true);
            this.wc.setOnlySearchInOpenEditors(this.n.searchResult.query?.onlyOpenEditors || false);
            this.vc.setUseExcludesAndIgnoreFiles(!this.n.searchResult.query?.userDisabledExcludesAndIgnoreFiles || true);
            this.searchIncludePattern.setValue('');
            this.searchExcludePattern.setValue('');
            this.Gc = false;
        }
        async importSearchResult(searchModel) {
            // experimental: used by the quick access search to overwrite a search result
            searchModel.transferSearchResult(this.n);
            this.nd();
            this.fd();
            const collapseResults = this.ee.collapseResults;
            if (collapseResults !== 'alwaysCollapse' && this.n.searchResult.matches().length === 1) {
                const onlyMatch = this.n.searchResult.matches()[0];
                if (onlyMatch.count() < 50) {
                    this.lc.expand(onlyMatch);
                }
            }
        }
        U(parent) {
            super.U(parent);
            this.h = dom.$0O(parent, dom.$('.search-view'));
            this.qc = dom.$0O(this.h, $('.search-widgets-container'));
            this.kd(this.qc);
            const history = this.Yc.load();
            const filePatterns = this.nc['query.filePatterns'] || '';
            const patternExclusions = this.nc['query.folderExclusions'] || '';
            const patternExclusionsHistory = history.exclude || [];
            const patternIncludes = this.nc['query.folderIncludes'] || '';
            const patternIncludesHistory = history.include || [];
            const onlyOpenEditors = this.nc['query.onlyOpenEditors'] || false;
            const queryDetailsExpanded = this.nc['query.queryDetailsExpanded'] || '';
            const useExcludesAndIgnoreFiles = typeof this.nc['query.useExcludesAndIgnoreFiles'] === 'boolean' ?
                this.nc['query.useExcludesAndIgnoreFiles'] : true;
            this.tc = dom.$0O(this.qc, $('.query-details'));
            // Toggle query details button
            this.uc = dom.$0O(this.tc, $('.more' + themables_1.ThemeIcon.asCSSSelector(searchIcons_1.$bNb), { tabindex: 0, role: 'button', title: nls.localize(1, null) }));
            this.B(dom.$nO(this.uc, dom.$3O.CLICK, e => {
                dom.$5O.stop(e);
                this.toggleQueryDetails(!this.Zc.isScreenReaderOptimized());
            }));
            this.B(dom.$nO(this.uc, dom.$3O.KEY_UP, (e) => {
                const event = new keyboardEvent_1.$jO(e);
                if (event.equals(3 /* KeyCode.Enter */) || event.equals(10 /* KeyCode.Space */)) {
                    dom.$5O.stop(e);
                    this.toggleQueryDetails(false);
                }
            }));
            this.B(dom.$nO(this.uc, dom.$3O.KEY_DOWN, (e) => {
                const event = new keyboardEvent_1.$jO(e);
                if (event.equals(1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */)) {
                    if (this.rc.isReplaceActive()) {
                        this.rc.focusReplaceAllAction();
                    }
                    else {
                        this.rc.isReplaceShown() ? this.rc.replaceInput?.focusOnPreserve() : this.rc.focusRegexAction();
                    }
                    dom.$5O.stop(e);
                }
            }));
            // folder includes list
            const folderIncludesList = dom.$0O(this.tc, $('.file-types.includes'));
            const filesToIncludeTitle = nls.localize(2, null);
            dom.$0O(folderIncludesList, $('h4', undefined, filesToIncludeTitle));
            this.wc = this.B(this.Bb.createInstance(patternInputWidget_1.$tNb, folderIncludesList, this.Sc, {
                ariaLabel: filesToIncludeTitle,
                placeholder: nls.localize(3, null),
                showPlaceholderOnFocus: true,
                history: patternIncludesHistory,
                inputBoxStyles: defaultStyles_1.$s2
            }));
            this.wc.setValue(patternIncludes);
            this.wc.setOnlySearchInOpenEditors(onlyOpenEditors);
            this.B(this.wc.onCancel(() => this.cancelSearch(false)));
            this.B(this.wc.onChangeSearchInEditorsBox(() => this.triggerQueryChange()));
            this.md(this.wc.inputFocusTracker, this.ab);
            // excludes list
            const excludesList = dom.$0O(this.tc, $('.file-types.excludes'));
            const excludesTitle = nls.localize(4, null);
            dom.$0O(excludesList, $('h4', undefined, excludesTitle));
            this.vc = this.B(this.Bb.createInstance(patternInputWidget_1.$uNb, excludesList, this.Sc, {
                ariaLabel: excludesTitle,
                placeholder: nls.localize(5, null),
                showPlaceholderOnFocus: true,
                history: patternExclusionsHistory,
                inputBoxStyles: defaultStyles_1.$s2
            }));
            this.vc.setValue(patternExclusions);
            this.vc.setUseExcludesAndIgnoreFiles(useExcludesAndIgnoreFiles);
            this.B(this.vc.onCancel(() => this.cancelSearch(false)));
            this.B(this.vc.onChangeIgnoreBox(() => this.triggerQueryChange()));
            this.md(this.vc.inputFocusTracker, this.sb);
            const updateHasFilePatternKey = () => this.jc.set(this.wc.getValue().length > 0 || this.vc.getValue().length > 0);
            updateHasFilePatternKey();
            const onFilePatternSubmit = (triggeredOnType) => {
                this.triggerQueryChange({ triggeredOnType, delay: this.ee.searchOnTypeDebouncePeriod });
                if (triggeredOnType) {
                    updateHasFilePatternKey();
                }
            };
            this.B(this.wc.onSubmit(onFilePatternSubmit));
            this.B(this.vc.onSubmit(onFilePatternSubmit));
            this.oc = dom.$0O(this.h, $('.messages.text-search-provider-messages'));
            if (this.Tc.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */) {
                this.Zd();
            }
            this.xd(this.h);
            if (filePatterns !== '' || patternExclusions !== '' || patternIncludes !== '' || queryDetailsExpanded !== '' || !useExcludesAndIgnoreFiles) {
                this.toggleQueryDetails(true, true, true);
            }
            this.B(this.n.onSearchResultChanged((event) => this.nd(event)));
            this.B(this.onDidChangeBodyVisibility(visible => this.jd(visible)));
            this.hd(this.Db.getFileIconTheme());
            this.B(this.Db.onDidFileIconThemeChange(this.hd, this));
        }
        hd(theme) {
            this.xc.classList.toggle('hide-arrows', this.cd && theme.hidesExplorerArrows);
        }
        jd(visible) {
            this.t.set(visible);
            if (visible) {
                if (this.Ac) {
                    // Render if results changed while viewlet was hidden - #37818
                    this.od();
                    this.Ac = false;
                }
            }
            else {
                // Reset last focus to input to preserve opening the viewlet always focusing the query editor.
                this.fc = 'input';
            }
            // Enable highlights if there are searchresults
            this.n?.searchResult.toggleHighlights(visible);
        }
        get searchAndReplaceWidget() {
            return this.rc;
        }
        get searchIncludePattern() {
            return this.wc;
        }
        get searchExcludePattern() {
            return this.vc;
        }
        kd(container) {
            const contentPattern = this.nc['query.contentPattern'] || '';
            const replaceText = this.nc['query.replaceText'] || '';
            const isRegex = this.nc['query.regex'] === true;
            const isWholeWords = this.nc['query.wholeWords'] === true;
            const isCaseSensitive = this.nc['query.caseSensitive'] === true;
            const history = this.Yc.load();
            const searchHistory = history.search || this.nc['query.searchHistory'] || [];
            const replaceHistory = history.replace || this.nc['query.replaceHistory'] || [];
            const showReplace = typeof this.nc['view.showReplace'] === 'boolean' ? this.nc['view.showReplace'] : true;
            const preserveCase = this.nc['query.preserveCase'] === true;
            const isInNotebookMarkdownInput = this.nc['query.isInNotebookMarkdownInput'] ?? true;
            const isInNotebookMarkdownPreview = this.nc['query.isInNotebookMarkdownPreview'] ?? true;
            const isInNotebookCellInput = this.nc['query.isInNotebookCellInput'] ?? true;
            const isInNotebookCellOutput = this.nc['query.isInNotebookCellOutput'] ?? true;
            this.rc = this.B(this.Bb.createInstance(searchWidget_1.$NOb, container, {
                value: contentPattern,
                replaceValue: replaceText,
                isRegex: isRegex,
                isCaseSensitive: isCaseSensitive,
                isWholeWords: isWholeWords,
                searchHistory: searchHistory,
                replaceHistory: replaceHistory,
                preserveCase: preserveCase,
                inputBoxStyles: defaultStyles_1.$s2,
                toggleStyles: defaultStyles_1.$m2,
                notebookOptions: {
                    isInNotebookMarkdownInput,
                    isInNotebookMarkdownPreview,
                    isInNotebookCellInput,
                    isInNotebookCellOutput,
                }
            }));
            if (!this.rc.searchInput || !this.rc.replaceInput) {
                this.bd.warn(`Cannot fully create search widget. Search or replace input undefined. SearchInput: ${this.rc.searchInput}, ReplaceInput: ${this.rc.replaceInput}`);
                return;
            }
            if (showReplace) {
                this.rc.toggleReplace(true);
            }
            this.B(this.rc.onSearchSubmit(options => this.triggerQueryChange(options)));
            this.B(this.rc.onSearchCancel(({ focus }) => this.cancelSearch(focus)));
            this.B(this.rc.searchInput.onDidOptionChange(() => this.triggerQueryChange()));
            this.B(this.rc.getNotebookFilters().onDidChange(() => this.triggerQueryChange()));
            const updateHasPatternKey = () => this.hc.set(this.rc.searchInput ? (this.rc.searchInput.getValue().length > 0) : false);
            updateHasPatternKey();
            this.B(this.rc.searchInput.onDidChange(() => updateHasPatternKey()));
            const updateHasReplacePatternKey = () => this.ic.set(this.rc.getReplaceValue().length > 0);
            updateHasReplacePatternKey();
            this.B(this.rc.replaceInput.inputBox.onDidChange(() => updateHasReplacePatternKey()));
            this.B(this.rc.onDidHeightChange(() => this.Fd()));
            this.B(this.rc.onReplaceToggled(() => this.Fd()));
            this.B(this.rc.onReplaceStateChange((state) => {
                this.n.replaceActive = state;
                this.refreshTree();
            }));
            this.B(this.rc.onPreserveCaseChange((state) => {
                this.n.preserveCase = state;
                this.refreshTree();
            }));
            this.B(this.rc.onReplaceValueChanged(() => {
                this.n.replaceString = this.rc.getReplaceValue();
                this.zc.trigger(() => this.refreshTree());
            }));
            this.B(this.rc.onBlur(() => {
                this.uc.focus();
            }));
            this.B(this.rc.onReplaceAll(() => this.td()));
            this.md(this.rc.searchInputFocusTracker);
            this.md(this.rc.replaceInputFocusTracker);
        }
        ld(event) {
            if (event && (event.affectsConfiguration('search.decorations.colors') || event.affectsConfiguration('search.decorations.badges'))) {
                this.refreshTree();
            }
        }
        md(inputFocusTracker, contextKey) {
            if (!inputFocusTracker) {
                return;
            }
            this.B(inputFocusTracker.onDidFocus(() => {
                this.fc = 'input';
                this.L.set(true);
                contextKey?.set(true);
            }));
            this.B(inputFocusTracker.onDidBlur(() => {
                this.L.set(this.rc.searchInputHasFocus()
                    || this.rc.replaceInputHasFocus()
                    || this.wc.inputHasFocus()
                    || this.vc.inputHasFocus());
                contextKey?.set(false);
            }));
        }
        nd(event) {
            if (this.isVisible()) {
                return this.od(event);
            }
            else {
                this.Ac = true;
            }
        }
        od(event) {
            this.rc.setReplaceAllActionState(!this.n.searchResult.isEmpty());
            this.Wd(this.n.searchResult.query.userDisabledExcludesAndIgnoreFiles, this.n.searchResult.query?.onlyOpenEditors, event?.clearingAll);
            return this.refreshTree(event);
        }
        refreshTree(event) {
            const collapseResults = this.ee.collapseResults;
            if (!event || event.added || event.removed) {
                // Refresh whole tree
                if (this.ee.sortOrder === "modified" /* SearchSortOrder.Modified */) {
                    // Ensure all matches have retrieved their file stat
                    this.he()
                        .then(() => this.lc.setChildren(null, this.pd(collapseResults)));
                }
                else {
                    this.lc.setChildren(null, this.pd(collapseResults));
                }
            }
            else {
                // If updated counts affect our search order, re-sort the view.
                if (this.ee.sortOrder === "countAscending" /* SearchSortOrder.CountAscending */ ||
                    this.ee.sortOrder === "countDescending" /* SearchSortOrder.CountDescending */) {
                    this.lc.setChildren(null, this.pd(collapseResults));
                }
                else {
                    // FileMatch modified, refresh those elements
                    event.elements.forEach(element => {
                        this.lc.setChildren(element, this.sd(element, collapseResults));
                        this.lc.rerender(element);
                    });
                }
            }
        }
        pd(collapseResults) {
            const folderMatches = this.searchResult.folderMatches()
                .filter(fm => !fm.isEmpty())
                .sort(searchModel_1.$XMb);
            if (folderMatches.length === 1) {
                return this.qd(folderMatches[0], collapseResults, true);
            }
            return iterator_1.Iterable.map(folderMatches, folderMatch => {
                const children = this.qd(folderMatch, collapseResults, true);
                return { element: folderMatch, children, incompressible: true }; // roots should always be incompressible
            });
        }
        qd(folderMatch, collapseResults, childFolderIncompressible) {
            const sortOrder = this.ee.sortOrder;
            const matchArray = this.cd ? folderMatch.matches() : folderMatch.allDownstreamFileMatches();
            const matches = matchArray.sort((a, b) => (0, searchModel_1.$XMb)(a, b, sortOrder));
            return iterator_1.Iterable.map(matches, match => {
                let children;
                if (match instanceof searchModel_1.$SMb) {
                    children = this.rd(match);
                }
                else {
                    children = this.qd(match, collapseResults, false);
                }
                const collapsed = (collapseResults === 'alwaysCollapse' || (match.count() > 10 && collapseResults !== 'alwaysExpand')) ? tree_1.ObjectTreeElementCollapseState.PreserveOrCollapsed : tree_1.ObjectTreeElementCollapseState.PreserveOrExpanded;
                return { element: match, children, collapsed, incompressible: (match instanceof searchModel_1.$SMb) ? true : childFolderIncompressible };
            });
        }
        rd(fileMatch) {
            const matches = fileMatch.matches().sort(searchModel_1.$XMb);
            return iterator_1.Iterable.map(matches, r => ({ element: r, incompressible: true }));
        }
        sd(match, collapseResults) {
            return match instanceof searchModel_1.$1Mb ? this.pd(collapseResults) :
                match instanceof searchModel_1.$TMb ? this.qd(match, collapseResults, false) :
                    this.rd(match);
        }
        td() {
            if (this.n.searchResult.count() === 0) {
                return;
            }
            const occurrences = this.n.searchResult.count();
            const fileCount = this.n.searchResult.fileCount();
            const replaceValue = this.rc.getReplaceValue() || '';
            const afterReplaceAllMessage = this.ud(occurrences, fileCount, replaceValue);
            let progressComplete;
            let progressReporter;
            this.Oc.withProgress({ location: this.Qb(), delay: 100, total: occurrences }, p => {
                progressReporter = p;
                return new Promise(resolve => progressComplete = resolve);
            });
            const confirmation = {
                title: nls.localize(6, null),
                message: this.vd(occurrences, fileCount, replaceValue),
                primaryButton: nls.localize(7, null)
            };
            this.Qc.confirm(confirmation).then(res => {
                if (res.confirmed) {
                    this.rc.setReplaceAllActionState(false);
                    this.n.searchResult.replaceAll(progressReporter).then(() => {
                        progressComplete();
                        const messageEl = this.wd();
                        dom.$0O(messageEl, afterReplaceAllMessage);
                        this.Fd();
                    }, (error) => {
                        progressComplete();
                        errors.$2(error);
                        this.Pc.error(error);
                    });
                }
                else {
                    progressComplete();
                }
            });
        }
        ud(occurrences, fileCount, replaceValue) {
            if (occurrences === 1) {
                if (fileCount === 1) {
                    if (replaceValue) {
                        return nls.localize(8, null, occurrences, fileCount, replaceValue);
                    }
                    return nls.localize(9, null, occurrences, fileCount);
                }
                if (replaceValue) {
                    return nls.localize(10, null, occurrences, fileCount, replaceValue);
                }
                return nls.localize(11, null, occurrences, fileCount);
            }
            if (fileCount === 1) {
                if (replaceValue) {
                    return nls.localize(12, null, occurrences, fileCount, replaceValue);
                }
                return nls.localize(13, null, occurrences, fileCount);
            }
            if (replaceValue) {
                return nls.localize(14, null, occurrences, fileCount, replaceValue);
            }
            return nls.localize(15, null, occurrences, fileCount);
        }
        vd(occurrences, fileCount, replaceValue) {
            if (occurrences === 1) {
                if (fileCount === 1) {
                    if (replaceValue) {
                        return nls.localize(16, null, occurrences, fileCount, replaceValue);
                    }
                    return nls.localize(17, null, occurrences, fileCount);
                }
                if (replaceValue) {
                    return nls.localize(18, null, occurrences, fileCount, replaceValue);
                }
                return nls.localize(19, null, occurrences, fileCount);
            }
            if (fileCount === 1) {
                if (replaceValue) {
                    return nls.localize(20, null, occurrences, fileCount, replaceValue);
                }
                return nls.localize(21, null, occurrences, fileCount);
            }
            if (replaceValue) {
                return nls.localize(22, null, occurrences, fileCount, replaceValue);
            }
            return nls.localize(23, null, occurrences, fileCount);
        }
        wd() {
            this.Bc = undefined;
            const wasHidden = this.oc.style.display === 'none';
            dom.$lO(this.oc);
            dom.$dP(this.oc);
            this.pc.clear();
            const newMessage = dom.$0O(this.oc, $('.message'));
            if (wasHidden) {
                this.Fd();
            }
            return newMessage;
        }
        xd(container) {
            this.xc = dom.$0O(container, $('.results.show-file-icons.file-icon-themable-tree'));
            const delegate = this.Bb.createInstance(searchResultsView_1.$ePb);
            const identityProvider = {
                getId(element) {
                    return element.id();
                }
            };
            this.mc = this.B(this.Bb.createInstance(labels_1.$Llb, { onDidChangeVisibility: this.onDidChangeBodyVisibility }));
            this.lc = this.B(this.Bb.createInstance(listService_1.$u4, 'SearchView', this.xc, delegate, [
                this.B(this.Bb.createInstance(searchResultsView_1.$fPb, this, this.mc)),
                this.B(this.Bb.createInstance(searchResultsView_1.$gPb, this, this.mc)),
                this.B(this.Bb.createInstance(searchResultsView_1.$hPb, this.n, this)),
            ], {
                identityProvider,
                accessibilityProvider: this.Hc,
                dnd: this.Bb.createInstance(dnd_1.$Beb, element => {
                    if (element instanceof searchModel_1.$SMb) {
                        return element.resource;
                    }
                    if (element instanceof searchModel_1.$PMb) {
                        return (0, opener_1.$QT)(element.parent().resource, element.range());
                    }
                    return null;
                }),
                multipleSelectionSupport: true,
                selectionNavigation: true,
                overrideStyles: {
                    listBackground: this.Rb()
                },
                paddingBottom: searchResultsView_1.$ePb.ITEM_HEIGHT
            }));
            this.B(this.lc.onContextMenu(e => this.yd(e)));
            const updateHasSomeCollapsible = () => this.Ec.trigger(() => this.kc.set(this.zd()));
            updateHasSomeCollapsible();
            this.B(this.n.onSearchResultChanged(() => updateHasSomeCollapsible()));
            this.B(this.lc.onDidChangeCollapseState(() => updateHasSomeCollapsible()));
            this.B(event_1.Event.debounce(this.lc.onDidOpen, (last, event) => event, DEBOUNCE_DELAY, true)(options => {
                if (options.element instanceof searchModel_1.$PMb) {
                    const selectedMatch = options.element;
                    this.yc?.setSelectedMatch(null);
                    this.yc = selectedMatch.parent();
                    this.yc.setSelectedMatch(selectedMatch);
                    this.be(selectedMatch, options.editorOptions.preserveFocus, options.sideBySide, options.editorOptions.pinned);
                }
            }));
            this.B(event_1.Event.debounce(this.lc.onDidChangeFocus, (last, event) => event, DEBOUNCE_DELAY, true)(() => {
                const selection = this.lc.getSelection();
                const focus = this.lc.getFocus()[0];
                if (selection.length > 1 && focus instanceof searchModel_1.$PMb) {
                    this.be(focus, true);
                }
            }));
            this.B(event_1.Event.any(this.lc.onDidFocus, this.lc.onDidChangeFocus)(() => {
                const focus = this.lc.getFocus()[0];
                if (this.lc.isDOMFocused()) {
                    this.Wb.set(this.lc.navigate().first() === focus);
                    this.Xb.set(!!focus);
                    this.$b.set(focus instanceof searchModel_1.$SMb);
                    this.ac.set(focus instanceof searchModel_1.$TMb);
                    this.cc.set(focus instanceof searchModel_1.$PMb);
                    this.Yb.set(focus instanceof searchModel_1.$SMb || focus instanceof searchModel_1.$TMb);
                    this.Zb.set(focus instanceof searchModel_1.$SMb || focus instanceof searchModel_1.$UMb);
                    this.bc.set(focus instanceof searchModel_1.$UMb);
                    this.fc = 'tree';
                }
                let editable = false;
                if (focus instanceof searchModel_1.$PMb) {
                    editable = (focus instanceof searchModel_1.$RMb) ? !focus.isWebviewMatch() : true;
                }
                else if (focus instanceof searchModel_1.$SMb) {
                    editable = !focus.hasOnlyReadOnlyMatches();
                }
                else if (focus instanceof searchModel_1.$TMb) {
                    editable = !focus.hasOnlyReadOnlyMatches();
                }
                this.dc.set(editable);
            }));
            this.B(this.lc.onDidBlur(() => {
                this.Wb.reset();
                this.Xb.reset();
                this.$b.reset();
                this.ac.reset();
                this.cc.reset();
                this.Yb.reset();
                this.Zb.reset();
                this.bc.reset();
                this.dc.reset();
            }));
        }
        yd(e) {
            e.browserEvent.preventDefault();
            e.browserEvent.stopPropagation();
            this.xb.showContextMenu({
                menuId: actions_1.$Ru.SearchContext,
                menuActionOptions: { shouldForwardArgs: true },
                contextKeyService: this.zb,
                getAnchor: () => e.anchor,
                getActionsContext: () => e.element,
            });
        }
        zd() {
            const viewer = this.getControl();
            const navigator = viewer.navigate();
            let node = navigator.first();
            do {
                if (!viewer.isCollapsed(node)) {
                    return true;
                }
            } while (node = navigator.next());
            return false;
        }
        selectNextMatch() {
            if (!this.hasSearchResults()) {
                return;
            }
            const [selected] = this.lc.getSelection();
            // Expand the initial selected node, if needed
            if (selected && !(selected instanceof searchModel_1.$PMb)) {
                if (this.lc.isCollapsed(selected)) {
                    this.lc.expand(selected);
                }
            }
            const navigator = this.lc.navigate(selected);
            let next = navigator.next();
            if (!next) {
                next = navigator.first();
            }
            // Expand until first child is a Match
            while (next && !(next instanceof searchModel_1.$PMb)) {
                if (this.lc.isCollapsed(next)) {
                    this.lc.expand(next);
                }
                // Select the first child
                next = navigator.next();
            }
            // Reveal the newly selected element
            if (next) {
                if (next === selected) {
                    this.lc.setFocus([]);
                }
                const event = (0, listService_1.$s4)(undefined, false, false);
                this.lc.setFocus([next], event);
                this.lc.setSelection([next], event);
                this.lc.reveal(next);
                const ariaLabel = this.Hc.getAriaLabel(next);
                if (ariaLabel) {
                    aria.$_P(ariaLabel);
                }
            }
        }
        selectPreviousMatch() {
            if (!this.hasSearchResults()) {
                return;
            }
            const [selected] = this.lc.getSelection();
            let navigator = this.lc.navigate(selected);
            let prev = navigator.previous();
            // Select previous until find a Match or a collapsed item
            while (!prev || (!(prev instanceof searchModel_1.$PMb) && !this.lc.isCollapsed(prev))) {
                const nextPrev = prev ? navigator.previous() : navigator.last();
                if (!prev && !nextPrev) {
                    return;
                }
                prev = nextPrev;
            }
            // Expand until last child is a Match
            while (!(prev instanceof searchModel_1.$PMb)) {
                const nextItem = navigator.next();
                this.lc.expand(prev);
                navigator = this.lc.navigate(nextItem); // recreate navigator because modifying the tree can invalidate it
                prev = nextItem ? navigator.previous() : navigator.last(); // select last child
            }
            // Reveal the newly selected element
            if (prev) {
                if (prev === selected) {
                    this.lc.setFocus([]);
                }
                const event = (0, listService_1.$s4)(undefined, false, false);
                this.lc.setFocus([prev], event);
                this.lc.setSelection([prev], event);
                this.lc.reveal(prev);
                const ariaLabel = this.Hc.getAriaLabel(prev);
                if (ariaLabel) {
                    aria.$_P(ariaLabel);
                }
            }
        }
        moveFocusToResults() {
            this.lc.domFocus();
        }
        focus() {
            super.focus();
            if (this.fc === 'input' || !this.hasSearchResults()) {
                const updatedText = this.ee.seedOnFocus ? this.Bd({ allowSearchOnType: false }) : false;
                this.rc.focus(undefined, undefined, updatedText);
            }
            else {
                this.lc.domFocus();
            }
        }
        updateTextFromFindWidgetOrSelection({ allowUnselectedWord = true, allowSearchOnType = true }) {
            let activeEditor = this.Mc.activeTextEditorControl;
            if ((0, editorBrowser_1.$iV)(activeEditor) && !activeEditor?.hasTextFocus()) {
                const controller = findController_1.$W7.get(activeEditor);
                if (controller && controller.isFindInputFocused()) {
                    return this.Ad(controller, { allowSearchOnType });
                }
                const editors = this.Nc.listCodeEditors();
                activeEditor = editors.find(editor => editor instanceof embeddedCodeEditorWidget_1.$w3 && editor.getParentEditor() === activeEditor && editor.hasTextFocus())
                    ?? activeEditor;
            }
            return this.Bd({ allowUnselectedWord, allowSearchOnType }, activeEditor);
        }
        Ad(controller, { allowSearchOnType = true }) {
            if (!this.ee.seedWithNearestWord && (window.getSelection()?.toString() ?? '') === '') {
                return false;
            }
            const searchString = controller.getState().searchString;
            if (searchString === '') {
                return false;
            }
            this.rc.searchInput?.setCaseSensitive(controller.getState().matchCase);
            this.rc.searchInput?.setWholeWords(controller.getState().wholeWord);
            this.rc.searchInput?.setRegex(controller.getState().isRegex);
            this.Cd(searchString, allowSearchOnType);
            return true;
        }
        Bd({ allowUnselectedWord = true, allowSearchOnType = true }, editor) {
            const seedSearchStringFromSelection = this.yb.getValue('editor').find.seedSearchStringFromSelection;
            if (!seedSearchStringFromSelection) {
                return false;
            }
            let selectedText = this.Id(allowUnselectedWord, editor);
            if (selectedText === null) {
                return false;
            }
            if (this.rc.searchInput?.getRegex()) {
                selectedText = strings.$qe(selectedText);
            }
            this.Cd(selectedText, allowSearchOnType);
            return true;
        }
        Cd(text, allowSearchOnType = true) {
            if (allowSearchOnType && !this.n.searchResult.isDirty) {
                this.rc.setValue(text);
            }
            else {
                this.Gc = true;
                this.rc.setValue(text);
                this.Gc = false;
            }
        }
        focusNextInputBox() {
            if (this.rc.searchInputHasFocus()) {
                if (this.rc.isReplaceShown()) {
                    this.rc.focus(true, true);
                }
                else {
                    this.Dd();
                }
                return;
            }
            if (this.rc.replaceInputHasFocus()) {
                this.Dd();
                return;
            }
            if (this.wc.inputHasFocus()) {
                this.vc.focus();
                this.vc.select();
                return;
            }
            if (this.vc.inputHasFocus()) {
                this.Hd();
                return;
            }
        }
        Dd() {
            if (this.Jd()) {
                this.toggleQueryDetails(true, this.Jd());
            }
            else {
                this.Hd();
            }
        }
        focusPreviousInputBox() {
            if (this.rc.searchInputHasFocus()) {
                return;
            }
            if (this.rc.replaceInputHasFocus()) {
                this.rc.focus(true);
                return;
            }
            if (this.wc.inputHasFocus()) {
                this.rc.focus(true, true);
                return;
            }
            if (this.vc.inputHasFocus()) {
                this.wc.focus();
                this.wc.select();
                return;
            }
            if (this.lc.isDOMFocused()) {
                this.Ed();
                return;
            }
        }
        Ed() {
            if (this.Jd()) {
                this.toggleQueryDetails(true, true, false, true);
            }
            else {
                this.rc.focus(true, true);
            }
        }
        Fd() {
            if (this.g || !this.sc) {
                return;
            }
            const actionsPosition = this.ee.actionsPosition;
            this.getContainer().classList.toggle($lPb_1.c, actionsPosition === 'right');
            this.rc.setWidth(this.sc.width - 28 /* container margin */);
            this.vc.setWidth(this.sc.width - 28 /* container margin */);
            this.wc.setWidth(this.sc.width - 28 /* container margin */);
            const widgetHeight = dom.$LO(this.qc);
            const messagesHeight = dom.$LO(this.oc);
            this.lc.layout(this.sc.height - widgetHeight - messagesHeight, this.sc.width - 28);
        }
        W(height, width) {
            super.W(height, width);
            this.sc = new dom.$BO(width, height);
            this.Fd();
        }
        getControl() {
            return this.lc;
        }
        allSearchFieldsClear() {
            return this.rc.getReplaceValue() === '' &&
                (!this.rc.searchInput || this.rc.searchInput.getValue() === '');
        }
        allFilePatternFieldsClear() {
            return this.searchExcludePattern.getValue() === '' &&
                this.searchIncludePattern.getValue() === '';
        }
        hasSearchResults() {
            return !this.n.searchResult.isEmpty();
        }
        clearSearchResults(clearInput = true) {
            this.n.searchResult.clear();
            this.$d(true);
            if (this.Tc.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */) {
                this.Zd();
            }
            if (clearInput) {
                if (this.allSearchFieldsClear()) {
                    this.clearFilePatternFields();
                }
                this.rc.clear();
            }
            this.n.cancelSearch();
            this.lc.ariaLabel = nls.localize(24, null);
            aria.$_P(nls.localize(25, null));
            this.Fd();
        }
        clearFilePatternFields() {
            this.searchExcludePattern.clear();
            this.searchIncludePattern.clear();
        }
        cancelSearch(focus = true) {
            if (this.n.cancelSearch()) {
                if (focus) {
                    this.rc.focus();
                }
                return true;
            }
            return false;
        }
        Hd() {
            if (this.lc.getNode(null)) {
                this.lc.domFocus();
                const selection = this.lc.getSelection();
                if (selection.length === 0) {
                    const event = (0, listService_1.$s4)();
                    this.lc.focusNext(undefined, undefined, event);
                    this.lc.setSelection(this.lc.getFocus(), event);
                }
            }
        }
        Id(allowUnselectedWord, editor) {
            if (dom.$NO(document.activeElement, this.getContainer())) {
                return null;
            }
            editor = editor ?? this.Mc.activeTextEditorControl;
            if ((0, editorBrowser_1.$jV)(editor)) {
                if (editor.getOriginalEditor().hasTextFocus()) {
                    editor = editor.getOriginalEditor();
                }
                else {
                    editor = editor.getModifiedEditor();
                }
            }
            if (!editor) {
                return null;
            }
            const allowUnselected = this.ee.seedWithNearestWord && allowUnselectedWord;
            return $nPb(allowUnselected, editor);
        }
        Jd() {
            return this.tc.classList.contains('more');
        }
        toggleCaseSensitive() {
            this.rc.searchInput?.setCaseSensitive(!this.rc.searchInput.getCaseSensitive());
            this.triggerQueryChange();
        }
        toggleWholeWords() {
            this.rc.searchInput?.setWholeWords(!this.rc.searchInput.getWholeWords());
            this.triggerQueryChange();
        }
        toggleRegex() {
            this.rc.searchInput?.setRegex(!this.rc.searchInput.getRegex());
            this.triggerQueryChange();
        }
        togglePreserveCase() {
            this.rc.replaceInput?.setPreserveCase(!this.rc.replaceInput.getPreserveCase());
            this.triggerQueryChange();
        }
        setSearchParameters(args = {}) {
            if (typeof args.isCaseSensitive === 'boolean') {
                this.rc.searchInput?.setCaseSensitive(args.isCaseSensitive);
            }
            if (typeof args.matchWholeWord === 'boolean') {
                this.rc.searchInput?.setWholeWords(args.matchWholeWord);
            }
            if (typeof args.isRegex === 'boolean') {
                this.rc.searchInput?.setRegex(args.isRegex);
            }
            if (typeof args.filesToInclude === 'string') {
                this.searchIncludePattern.setValue(String(args.filesToInclude));
            }
            if (typeof args.filesToExclude === 'string') {
                this.searchExcludePattern.setValue(String(args.filesToExclude));
            }
            if (typeof args.query === 'string') {
                this.rc.searchInput?.setValue(args.query);
            }
            if (typeof args.replace === 'string') {
                this.rc.replaceInput?.setValue(args.replace);
            }
            else {
                if (this.rc.replaceInput && this.rc.replaceInput.getValue() !== '') {
                    this.rc.replaceInput.setValue('');
                }
            }
            if (typeof args.triggerSearch === 'boolean' && args.triggerSearch) {
                this.triggerQueryChange();
            }
            if (typeof args.preserveCase === 'boolean') {
                this.rc.replaceInput?.setPreserveCase(args.preserveCase);
            }
            if (typeof args.useExcludeSettingsAndIgnoreFiles === 'boolean') {
                this.vc.setUseExcludesAndIgnoreFiles(args.useExcludeSettingsAndIgnoreFiles);
            }
            if (typeof args.onlyOpenEditors === 'boolean') {
                this.searchIncludePattern.setOnlySearchInOpenEditors(args.onlyOpenEditors);
            }
        }
        toggleQueryDetails(moveFocus = true, show, skipLayout, reverse) {
            const cls = 'more';
            show = typeof show === 'undefined' ? !this.tc.classList.contains(cls) : Boolean(show);
            this.nc['query.queryDetailsExpanded'] = show;
            skipLayout = Boolean(skipLayout);
            if (show) {
                this.uc.setAttribute('aria-expanded', 'true');
                this.tc.classList.add(cls);
                if (moveFocus) {
                    if (reverse) {
                        this.vc.focus();
                        this.vc.select();
                    }
                    else {
                        this.wc.focus();
                        this.wc.select();
                    }
                }
            }
            else {
                this.uc.setAttribute('aria-expanded', 'false');
                this.tc.classList.remove(cls);
                if (moveFocus) {
                    this.rc.focus();
                }
            }
            if (!skipLayout && this.sc) {
                this.Fd();
            }
        }
        searchInFolders(folderPaths = []) {
            this.Kd(true, folderPaths);
        }
        searchOutsideOfFolders(folderPaths = []) {
            this.Kd(false, folderPaths);
        }
        Kd(include, folderPaths) {
            if (!folderPaths.length || folderPaths.some(folderPath => folderPath === '.')) {
                this.wc.setValue('');
                this.rc.focus();
                return;
            }
            // Show 'files to include' box
            if (!this.Jd()) {
                this.toggleQueryDetails(true, true);
            }
            (include ? this.wc : this.vc).setValue(folderPaths.join(', '));
            this.rc.focus(false);
        }
        triggerQueryChange(_options) {
            const options = { preserveFocus: true, triggeredOnType: false, delay: 0, ..._options };
            if (options.triggeredOnType && !this.ee.searchOnType) {
                return;
            }
            if (!this.Gc) {
                const delay = options.triggeredOnType ? options.delay : 0;
                this.Fc.trigger(() => {
                    this.Ld(options.preserveFocus, options.triggeredOnType);
                }, delay);
            }
        }
        Ld(preserveFocus, triggeredOnType = false) {
            if (!(this.rc.searchInput?.inputBox.isInputValid())) {
                return;
            }
            const isRegex = this.rc.searchInput.getRegex();
            const isInNotebookMarkdownInput = this.rc.getNotebookFilters().markupInput;
            const isInNotebookMarkdownPreview = this.rc.getNotebookFilters().markupPreview;
            const isInNotebookCellInput = this.rc.getNotebookFilters().codeInput;
            const isInNotebookCellOutput = this.rc.getNotebookFilters().codeOutput;
            const isWholeWords = this.rc.searchInput.getWholeWords();
            const isCaseSensitive = this.rc.searchInput.getCaseSensitive();
            const contentPattern = this.rc.searchInput.getValue();
            const excludePatternText = this.vc.getValue().trim();
            const includePatternText = this.wc.getValue().trim();
            const useExcludesAndIgnoreFiles = this.vc.useExcludesAndIgnoreFiles();
            const onlySearchInOpenEditors = this.wc.onlySearchInOpenEditors();
            if (contentPattern.length === 0) {
                this.clearSearchResults(false);
                this.wd();
                return;
            }
            const content = {
                pattern: contentPattern,
                isRegExp: isRegex,
                isCaseSensitive: isCaseSensitive,
                isWordMatch: isWholeWords,
                notebookInfo: {
                    isInNotebookMarkdownInput,
                    isInNotebookMarkdownPreview,
                    isInNotebookCellInput,
                    isInNotebookCellOutput
                }
            };
            const excludePattern = this.vc.getValue();
            const includePattern = this.wc.getValue();
            // Need the full match line to correctly calculate replace text, if this is a search/replace with regex group references ($1, $2, ...).
            // 10000 chars is enough to avoid sending huge amounts of text around, if you do a replace with a longer match, it may or may not resolve the group refs correctly.
            // https://github.com/microsoft/vscode/issues/58374
            const charsPerLine = content.isRegExp ? 10000 : 1000;
            const options = {
                _reason: 'searchView',
                extraFileResources: this.Bb.invokeFunction(search_1.$MI),
                maxResults: this.ee.maxResults ?? undefined,
                disregardIgnoreFiles: !useExcludesAndIgnoreFiles || undefined,
                disregardExcludeSettings: !useExcludesAndIgnoreFiles || undefined,
                onlyOpenEditors: onlySearchInOpenEditors,
                excludePattern,
                includePattern,
                previewOptions: {
                    matchLines: 1,
                    charsPerLine
                },
                isSmartCase: this.ee.smartCase,
                expandPatterns: true
            };
            const folderResources = this.Tc.getWorkspace().folders;
            const onQueryValidationError = (err) => {
                this.rc.searchInput?.showMessage({ content: err.message, type: 3 /* MessageType.ERROR */ });
                this.n.searchResult.clear();
            };
            let query;
            try {
                query = this.j.text(content, folderResources.map(folder => folder.uri), options);
            }
            catch (err) {
                onQueryValidationError(err);
                return;
            }
            this.Md(query).then(() => {
                this.Nd(query, options, excludePatternText, includePatternText, triggeredOnType);
                if (!preserveFocus) {
                    this.rc.focus(false, undefined, true); // focus back to input field
                }
            }, onQueryValidationError);
        }
        Md(query) {
            // Validate folderQueries
            const folderQueriesExistP = query.folderQueries.map(fq => {
                return this.Lc.exists(fq.folder).catch(() => false);
            });
            return Promise.all(folderQueriesExistP).then(existResults => {
                // If no folders exist, show an error message about the first one
                const existingFolderQueries = query.folderQueries.filter((folderQuery, i) => existResults[i]);
                if (!query.folderQueries.length || existingFolderQueries.length) {
                    query.folderQueries = existingFolderQueries;
                }
                else {
                    const nonExistantPath = query.folderQueries[0].folder.fsPath;
                    const searchPathNotFoundError = nls.localize(26, null, nonExistantPath);
                    return Promise.reject(new Error(searchPathNotFoundError));
                }
                return undefined;
            });
        }
        Nd(query, options, excludePatternText, includePatternText, triggeredOnType) {
            this.Dc.trigger(() => {
                this.rc.searchInput?.onSearchSubmit();
                this.vc.onSearchSubmit();
                this.wc.onSearchSubmit();
            });
            this.n.cancelSearch(true);
            this.Cc = this.Cc
                .then(() => this.Pd(query, excludePatternText, includePatternText, triggeredOnType))
                .then(() => undefined, () => undefined);
        }
        Od() {
            if (this.dd === search_1.SearchUIState.Idle) {
                return;
            }
            try {
                // Search result tree update
                const fileCount = this.n.searchResult.fileCount();
                if (this.Jc !== fileCount) {
                    this.Jc = fileCount;
                    this.od();
                }
            }
            finally {
                // show frequent progress and results by scheduling updates 80 ms after the last one
                this.Kc.schedule();
            }
        }
        Pd(query, excludePatternText, includePatternText, triggeredOnType) {
            let progressComplete;
            this.Oc.withProgress({ location: this.Qb(), delay: triggeredOnType ? 300 : 0 }, _progress => {
                return new Promise(resolve => progressComplete = resolve);
            });
            this.rc.searchInput?.clearMessage();
            this.dd = search_1.SearchUIState.Searching;
            this.$d();
            const slowTimer = setTimeout(() => {
                this.dd = search_1.SearchUIState.SlowSearch;
            }, 2000);
            const onComplete = (completed) => {
                clearTimeout(slowTimer);
                this.dd = search_1.SearchUIState.Idle;
                // Complete up to 100% as needed
                progressComplete();
                // Do final render, then expand if just 1 file with less than 50 matches
                this.nd();
                const collapseResults = this.ee.collapseResults;
                if (collapseResults !== 'alwaysCollapse' && this.n.searchResult.matches().length === 1) {
                    const onlyMatch = this.n.searchResult.matches()[0];
                    if (onlyMatch.count() < 50) {
                        this.lc.expand(onlyMatch);
                    }
                }
                this.n.replaceString = this.rc.getReplaceValue();
                const hasResults = !this.n.searchResult.isEmpty();
                if (completed?.exit === 1 /* SearchCompletionExitCode.NewSearchStarted */) {
                    return;
                }
                if (!hasResults) {
                    const hasExcludes = !!excludePatternText;
                    const hasIncludes = !!includePatternText;
                    let message;
                    if (!completed) {
                        message = SEARCH_CANCELLED_MESSAGE;
                    }
                    else if (this.wc.onlySearchInOpenEditors()) {
                        if (hasIncludes && hasExcludes) {
                            message = nls.localize(27, null, includePatternText, excludePatternText);
                        }
                        else if (hasIncludes) {
                            message = nls.localize(28, null, includePatternText);
                        }
                        else if (hasExcludes) {
                            message = nls.localize(29, null, excludePatternText);
                        }
                        else {
                            message = nls.localize(30, null);
                        }
                    }
                    else {
                        if (hasIncludes && hasExcludes) {
                            message = nls.localize(31, null, includePatternText, excludePatternText);
                        }
                        else if (hasIncludes) {
                            message = nls.localize(32, null, includePatternText);
                        }
                        else if (hasExcludes) {
                            message = nls.localize(33, null, excludePatternText);
                        }
                        else {
                            message = nls.localize(34, null);
                        }
                    }
                    // Indicate as status to ARIA
                    aria.$_P(message);
                    const messageEl = this.wd();
                    dom.$0O(messageEl, message);
                    if (!completed) {
                        const searchAgainButton = this.pc.add(new SearchLinkButton(nls.localize(35, null), () => this.triggerQueryChange({ preserveFocus: false })));
                        dom.$0O(messageEl, searchAgainButton.element);
                    }
                    else if (hasIncludes || hasExcludes) {
                        const searchAgainButton = this.pc.add(new SearchLinkButton(nls.localize(36, null), this.Td.bind(this)));
                        dom.$0O(messageEl, searchAgainButton.element);
                    }
                    else {
                        const openSettingsButton = this.pc.add(new SearchLinkButton(nls.localize(37, null), this.Qd.bind(this)));
                        dom.$0O(messageEl, openSettingsButton.element);
                    }
                    if (completed) {
                        dom.$0O(messageEl, $('span', undefined, ' - '));
                        const learnMoreButton = this.pc.add(new SearchLinkButton(nls.localize(38, null), this.Sd.bind(this)));
                        dom.$0O(messageEl, learnMoreButton.element);
                    }
                    if (this.Tc.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */) {
                        this.Zd();
                    }
                    this.Fd();
                }
                else {
                    this.n.searchResult.toggleHighlights(this.isVisible()); // show highlights
                    // Indicate final search result count for ARIA
                    aria.$_P(nls.localize(39, null, this.n.searchResult.count(), this.n.searchResult.fileCount()));
                }
                if (completed && completed.limitHit) {
                    completed.messages.push({ type: search_2.TextSearchCompleteMessageType.Warning, text: nls.localize(40, null) });
                }
                if (completed && completed.messages) {
                    for (const message of completed.messages) {
                        this.Xd(message);
                    }
                }
                this.Fd();
            };
            const onError = (e) => {
                clearTimeout(slowTimer);
                this.dd = search_1.SearchUIState.Idle;
                if (errors.$2(e)) {
                    return onComplete(undefined);
                }
                else {
                    progressComplete();
                    this.rc.searchInput?.showMessage({ content: e.message, type: 3 /* MessageType.ERROR */ });
                    this.n.searchResult.clear();
                    return Promise.resolve();
                }
            };
            this.Jc = 0;
            this.Kc.schedule();
            this.rc.setReplaceAllActionState(false);
            this.lc.setSelection([]);
            this.lc.setFocus([]);
            const result = this.n.search(query);
            return result.asyncResults.then(onComplete, onError);
        }
        Qd(e) {
            dom.$5O.stop(e, false);
            this.Rd('@id:files.exclude,search.exclude,search.useParentIgnoreFiles,search.useGlobalIgnoreFiles,search.useIgnoreFiles');
        }
        Rd(query) {
            const options = { query };
            return this.Tc.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */ ?
                this.Xc.openWorkspaceSettings(options) :
                this.Xc.openUserSettings(options);
        }
        Sd() {
            this.Cb.open(uri_1.URI.parse('https://go.microsoft.com/fwlink/?linkid=853977'));
        }
        Td() {
            this.vc.setValue('');
            this.wc.setValue('');
            this.wc.setOnlySearchInOpenEditors(false);
            this.triggerQueryChange({ preserveFocus: false });
        }
        Ud() {
            this.toggleQueryDetails(false, true);
            this.searchExcludePattern.setUseExcludesAndIgnoreFiles(true);
        }
        Vd() {
            this.toggleQueryDetails(false, true);
            this.wc.setOnlySearchInOpenEditors(false);
        }
        Wd(disregardExcludesAndIgnores, onlyOpenEditors, clear = false) {
            const fileCount = this.n.searchResult.fileCount();
            this.ec.set(fileCount > 0);
            const msgWasHidden = this.oc.style.display === 'none';
            const messageEl = this.wd();
            const resultMsg = clear ? '' : this.Yd(this.n.searchResult.count(), fileCount);
            this.lc.ariaLabel = resultMsg + nls.localize(41, null, this.searchResult.query?.contentPattern.pattern ?? '');
            dom.$0O(messageEl, resultMsg);
            if (fileCount > 0) {
                if (disregardExcludesAndIgnores) {
                    const excludesDisabledMessage = ' - ' + nls.localize(42, null) + ' ';
                    const enableExcludesButton = this.pc.add(new SearchLinkButton(nls.localize(43, null), this.Ud.bind(this), nls.localize(44, null)));
                    dom.$0O(messageEl, $('span', undefined, excludesDisabledMessage, '(', enableExcludesButton.element, ')'));
                }
                if (onlyOpenEditors) {
                    const searchingInOpenMessage = ' - ' + nls.localize(45, null) + ' ';
                    const disableOpenEditorsButton = this.pc.add(new SearchLinkButton(nls.localize(46, null), this.Vd.bind(this), nls.localize(47, null)));
                    dom.$0O(messageEl, $('span', undefined, searchingInOpenMessage, '(', disableOpenEditorsButton.element, ')'));
                }
                dom.$0O(messageEl, ' - ');
                const openInEditorTooltip = (0, searchActionsBase_1.$xNb)(nls.localize(48, null), this.wb.lookupKeybinding(Constants.$LNb));
                const openInEditorButton = this.pc.add(new SearchLinkButton(nls.localize(49, null), () => this.Bb.invokeFunction(searchEditorActions_1.$aPb, this.searchResult, this.searchIncludePattern.getValue(), this.searchExcludePattern.getValue(), this.searchIncludePattern.onlySearchInOpenEditors()), openInEditorTooltip));
                dom.$0O(messageEl, openInEditorButton.element);
                this.Fd();
            }
            else if (!msgWasHidden) {
                dom.$eP(this.oc);
            }
        }
        Xd(message) {
            const messageBox = this.oc.firstChild;
            if (!messageBox) {
                return;
            }
            dom.$0O(messageBox, (0, searchMessage_1.$3Ob)(message, this.Bb, this.Pc, this.Cb, this.Rc, this.pc, () => this.triggerQueryChange()));
        }
        Yd(resultCount, fileCount) {
            if (resultCount === 1 && fileCount === 1) {
                return nls.localize(50, null, resultCount, fileCount);
            }
            else if (resultCount === 1) {
                return nls.localize(51, null, resultCount, fileCount);
            }
            else if (fileCount === 1) {
                return nls.localize(52, null, resultCount, fileCount);
            }
            else {
                return nls.localize(53, null, resultCount, fileCount);
            }
        }
        Zd() {
            this.Bc = this.wd();
            const textEl = dom.$0O(this.Bc, $('p', undefined, nls.localize(54, null)));
            const openFolderButton = this.pc.add(new SearchLinkButton(nls.localize(55, null), () => {
                this.Rc.executeCommand(env.$j && env.$m ? workspaceActions_1.$6tb.ID : workspaceActions_1.$4tb.ID).catch(err => errors.$Y(err));
            }));
            dom.$0O(textEl, openFolderButton.element);
        }
        $d(forceHideMessages = false) {
            const showingCancelled = (this.oc.firstChild?.textContent?.indexOf(SEARCH_CANCELLED_MESSAGE) ?? -1) > -1;
            // clean up ui
            // this.replaceService.disposeAllReplacePreviews();
            if (showingCancelled || forceHideMessages || !this.yb.getValue().search.searchOnType) {
                // when in search to type, don't preemptively hide, as it causes flickering and shifting of the live results
                dom.$eP(this.oc);
            }
            dom.$dP(this.xc);
            this.yc = undefined;
        }
        ae(match, uri) {
            // Untitled files will return a false positive for getContributedNotebookTypes.
            // Since untitled files are already open, then untitled notebooks should return NotebookMatch results.
            return match instanceof searchModel_1.$RMb || (uri.scheme !== network.Schemas.untitled && this.ad.getContributedNotebookTypes(uri).length > 0);
        }
        be(lineMatch, preserveFocus, sideBySide, pinned) {
            const useReplacePreview = this.yb.getValue().search.useReplacePreview;
            const resource = lineMatch instanceof searchModel_1.$PMb ? lineMatch.parent().resource : lineMatch.resource;
            return (useReplacePreview && this.n.isReplaceActive() && !!this.n.replaceString && !(this.ae(lineMatch, resource))) ?
                this.Vc.openReplacePreview(lineMatch, preserveFocus, sideBySide, pinned) :
                this.open(lineMatch, preserveFocus, sideBySide, pinned, resource);
        }
        async open(element, preserveFocus, sideBySide, pinned, resourceInput) {
            const selection = $mPb(element, this.n);
            const oldParentMatches = element instanceof searchModel_1.$PMb ? element.parent().matches() : [];
            const resource = resourceInput ?? (element instanceof searchModel_1.$PMb ? element.parent().resource : element.resource);
            let editor;
            const options = {
                preserveFocus,
                pinned,
                selection,
                revealIfVisible: true,
            };
            try {
                editor = await this.Mc.openEditor({
                    resource: resource,
                    options,
                }, sideBySide ? editorService_1.$$C : editorService_1.$0C);
                const editorControl = editor?.getControl();
                if (element instanceof searchModel_1.$PMb && preserveFocus && (0, editorBrowser_1.$iV)(editorControl)) {
                    this.n.searchResult.rangeHighlightDecorations.highlightRange(editorControl.getModel(), element.range());
                }
                else {
                    this.n.searchResult.rangeHighlightDecorations.removeHighlightRange();
                }
            }
            catch (err) {
                errors.$Y(err);
                return;
            }
            if (editor instanceof notebookEditor_1.$lEb) {
                const elemParent = element.parent();
                if (element instanceof searchModel_1.$PMb) {
                    if (element instanceof searchModel_1.$RMb) {
                        element.parent().showMatch(element);
                    }
                    else {
                        const editorWidget = editor.getControl();
                        if (editorWidget) {
                            // Ensure that the editor widget is binded. If if is, then this should return immediately.
                            // Otherwise, it will bind the widget.
                            elemParent.bindNotebookEditorWidget(editorWidget);
                            await elemParent.updateMatchesForEditorWidget();
                            const matchIndex = oldParentMatches.findIndex(e => e.id() === element.id());
                            const matches = elemParent.matches();
                            const match = matchIndex >= matches.length ? matches[matches.length - 1] : matches[matchIndex];
                            if (match instanceof searchModel_1.$RMb) {
                                elemParent.showMatch(match);
                                if (!this.lc.getFocus().includes(match) || !this.lc.getSelection().includes(match)) {
                                    this.lc.setSelection([match], (0, listService_1.$s4)());
                                    this.lc.setFocus([match]);
                                }
                            }
                        }
                    }
                }
            }
        }
        openEditorWithMultiCursor(element) {
            const resource = element instanceof searchModel_1.$PMb ? element.parent().resource : element.resource;
            return this.Mc.openEditor({
                resource: resource,
                options: {
                    preserveFocus: false,
                    pinned: true,
                    revealIfVisible: true
                }
            }).then(editor => {
                if (editor) {
                    let fileMatch = null;
                    if (element instanceof searchModel_1.$SMb) {
                        fileMatch = element;
                    }
                    else if (element instanceof searchModel_1.$PMb) {
                        fileMatch = element.parent();
                    }
                    if (fileMatch) {
                        const selections = fileMatch.matches().map(m => new selection_1.$ms(m.range().startLineNumber, m.range().startColumn, m.range().endLineNumber, m.range().endColumn));
                        const codeEditor = (0, editorBrowser_1.$lV)(editor.getControl());
                        if (codeEditor) {
                            const multiCursorController = multicursor_1.$$9.get(codeEditor);
                            multiCursorController?.selectAllUsingSelections(selections);
                        }
                    }
                }
                this.n.searchResult.rangeHighlightDecorations.removeHighlightRange();
            }, errors.$Y);
        }
        ce(resource) {
            if (!this.n) {
                return;
            }
            // remove search results from this resource as it got disposed
            const matches = this.n.searchResult.matches();
            for (let i = 0, len = matches.length; i < len; i++) {
                if (resource.toString() === matches[i].resource.toString()) {
                    this.n.searchResult.remove(matches[i]);
                }
            }
        }
        de(e) {
            if (!this.n || (this.ee.sortOrder !== "modified" /* SearchSortOrder.Modified */ && !e.gotDeleted())) {
                return;
            }
            const matches = this.n.searchResult.matches();
            if (e.gotDeleted()) {
                const deletedMatches = matches.filter(m => e.contains(m.resource, 2 /* FileChangeType.DELETED */));
                this.n.searchResult.remove(deletedMatches);
            }
            else {
                // Check if the changed file contained matches
                const changedMatches = matches.filter(m => e.contains(m.resource));
                if (changedMatches.length && this.ee.sortOrder === "modified" /* SearchSortOrder.Modified */) {
                    // No matches need to be removed, but modified files need to have their file stat updated.
                    this.ie(changedMatches).then(() => this.refreshTree());
                }
            }
        }
        get ee() {
            return this.yb.getValue('search');
        }
        fe() {
            this.rc.clearHistory();
            this.vc.clearHistory();
            this.wc.clearHistory();
        }
        saveState() {
            // This can be called before renderBody() method gets called for the first time
            // if we move the searchView inside another viewPaneContainer
            if (!this.rc) {
                return;
            }
            const patternExcludes = this.vc?.getValue().trim() ?? '';
            const patternIncludes = this.wc?.getValue().trim() ?? '';
            const onlyOpenEditors = this.wc?.onlySearchInOpenEditors() ?? false;
            const useExcludesAndIgnoreFiles = this.vc?.useExcludesAndIgnoreFiles() ?? true;
            const preserveCase = this.n.preserveCase;
            if (this.rc.searchInput) {
                const isRegex = this.rc.searchInput.getRegex();
                const isWholeWords = this.rc.searchInput.getWholeWords();
                const isCaseSensitive = this.rc.searchInput.getCaseSensitive();
                const contentPattern = this.rc.searchInput.getValue();
                const isInNotebookCellInput = this.rc.getNotebookFilters().codeInput;
                const isInNotebookCellOutput = this.rc.getNotebookFilters().codeOutput;
                const isInNotebookMarkdownInput = this.rc.getNotebookFilters().markupInput;
                const isInNotebookMarkdownPreview = this.rc.getNotebookFilters().markupPreview;
                this.nc['query.contentPattern'] = contentPattern;
                this.nc['query.regex'] = isRegex;
                this.nc['query.wholeWords'] = isWholeWords;
                this.nc['query.caseSensitive'] = isCaseSensitive;
                this.nc['query.isInNotebookMarkdownInput'] = isInNotebookMarkdownInput;
                this.nc['query.isInNotebookMarkdownPreview'] = isInNotebookMarkdownPreview;
                this.nc['query.isInNotebookCellInput'] = isInNotebookCellInput;
                this.nc['query.isInNotebookCellOutput'] = isInNotebookCellOutput;
            }
            this.nc['query.folderExclusions'] = patternExcludes;
            this.nc['query.folderIncludes'] = patternIncludes;
            this.nc['query.useExcludesAndIgnoreFiles'] = useExcludesAndIgnoreFiles;
            this.nc['query.preserveCase'] = preserveCase;
            this.nc['query.onlyOpenEditors'] = onlyOpenEditors;
            const isReplaceShown = this.searchAndReplaceWidget.isReplaceShown();
            this.nc['view.showReplace'] = isReplaceShown;
            this.nc['view.treeLayout'] = this.cd;
            this.nc['query.replaceText'] = isReplaceShown && this.rc.getReplaceValue();
            this.ge();
            this.s.saveMemento();
            super.saveState();
        }
        ge() {
            if (this.rc === undefined) {
                return;
            }
            const history = Object.create(null);
            const searchHistory = this.rc.getSearchHistory();
            if (searchHistory && searchHistory.length) {
                history.search = searchHistory;
            }
            const replaceHistory = this.rc.getReplaceHistory();
            if (replaceHistory && replaceHistory.length) {
                history.replace = replaceHistory;
            }
            const patternExcludesHistory = this.vc.getHistory();
            if (patternExcludesHistory && patternExcludesHistory.length) {
                history.exclude = patternExcludesHistory;
            }
            const patternIncludesHistory = this.wc.getHistory();
            if (patternIncludesHistory && patternIncludesHistory.length) {
                history.include = patternIncludesHistory;
            }
            this.Yc.save(history);
        }
        async he() {
            const files = this.searchResult.matches().filter(f => !f.fileStat).map(f => f.resolveFileStat(this.Lc));
            await Promise.all(files);
        }
        async ie(elements) {
            const files = elements.map(f => f.resolveFileStat(this.Lc));
            await Promise.all(files);
        }
        je() {
            for (const fileMatch of this.searchResult.matches()) {
                fileMatch.fileStat = undefined;
            }
        }
        dispose() {
            this.g = true;
            this.saveState();
            super.dispose();
        }
    };
    exports.$lPb = $lPb;
    exports.$lPb = $lPb = $lPb_1 = __decorate([
        __param(1, files_1.$6j),
        __param(2, editorService_1.$9C),
        __param(3, codeEditorService_1.$nV),
        __param(4, progress_1.$2u),
        __param(5, notification_1.$Yu),
        __param(6, dialogs_1.$oA),
        __param(7, commands_1.$Fr),
        __param(8, contextView_1.$VZ),
        __param(9, instantiation_1.$Ah),
        __param(10, views_1.$_E),
        __param(11, configuration_1.$8h),
        __param(12, workspace_1.$Kh),
        __param(13, searchModel_1.$4Mb),
        __param(14, contextkey_1.$3i),
        __param(15, replace_1.$8Mb),
        __param(16, textfiles_1.$JD),
        __param(17, preferences_1.$BE),
        __param(18, themeService_1.$gv),
        __param(19, searchHistoryService_1.$jPb),
        __param(20, contextView_1.$WZ),
        __param(21, accessibility_1.$1r),
        __param(22, keybinding_1.$2D),
        __param(23, storage_1.$Vo),
        __param(24, opener_1.$NT),
        __param(25, telemetry_1.$9k),
        __param(26, notebookService_1.$ubb),
        __param(27, log_1.$5i)
    ], $lPb);
    class SearchLinkButton extends lifecycle_1.$kc {
        constructor(label, handler, tooltip) {
            super();
            this.element = $('a.pointer', { tabindex: 0, title: tooltip }, label);
            this.c(handler);
        }
        c(handler) {
            const wrappedHandler = (e) => {
                dom.$5O.stop(e, false);
                handler(e);
            };
            this.B(dom.$nO(this.element, dom.$3O.CLICK, wrappedHandler));
            this.B(dom.$nO(this.element, dom.$3O.KEY_DOWN, e => {
                const event = new keyboardEvent_1.$jO(e);
                if (event.equals(10 /* KeyCode.Space */) || event.equals(3 /* KeyCode.Enter */)) {
                    wrappedHandler(e);
                    event.preventDefault();
                    event.stopPropagation();
                }
            }));
        }
    }
    function $mPb(element, viewModel) {
        let match = null;
        if (element instanceof searchModel_1.$PMb) {
            match = element;
        }
        if (element instanceof searchModel_1.$SMb && element.count() > 0) {
            match = element.matches()[element.matches().length - 1];
        }
        if (match) {
            const range = match.range();
            if (viewModel.isReplaceActive() && !!viewModel.replaceString) {
                const replaceString = match.replaceString;
                return {
                    startLineNumber: range.startLineNumber,
                    startColumn: range.startColumn,
                    endLineNumber: range.startLineNumber,
                    endColumn: range.startColumn + replaceString.length
                };
            }
            return range;
        }
        return undefined;
    }
    exports.$mPb = $mPb;
    function $nPb(allowUnselectedWord, editor) {
        if (!(0, editorBrowser_1.$iV)(editor) || !editor.hasModel()) {
            return null;
        }
        const range = editor.getSelection();
        if (!range) {
            return null;
        }
        if (range.isEmpty()) {
            if (allowUnselectedWord) {
                const wordAtPosition = editor.getModel().getWordAtPosition(range.getStartPosition());
                return wordAtPosition?.word ?? null;
            }
            else {
                return null;
            }
        }
        let searchText = '';
        for (let i = range.startLineNumber; i <= range.endLineNumber; i++) {
            let lineText = editor.getModel().getLineContent(i);
            if (i === range.endLineNumber) {
                lineText = lineText.substring(0, range.endColumn - 1);
            }
            if (i === range.startLineNumber) {
                lineText = lineText.substring(range.startColumn - 1);
            }
            if (i !== range.startLineNumber) {
                lineText = '\n' + lineText;
            }
            searchText += lineText;
        }
        return searchText;
    }
    exports.$nPb = $nPb;
});
//# sourceMappingURL=searchView.js.map