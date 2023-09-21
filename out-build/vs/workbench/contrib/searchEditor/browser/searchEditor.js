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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/aria/aria", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/types", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/services/model", "vs/editor/common/services/textResourceConfiguration", "vs/editor/contrib/gotoSymbol/browser/peek/referencesController", "vs/nls!vs/workbench/contrib/searchEditor/browser/searchEditor", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/label/common/label", "vs/platform/progress/common/progress", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/platform/workspace/common/workspace", "vs/workbench/browser/parts/editor/textCodeEditor", "vs/workbench/contrib/search/browser/patternInputWidget", "vs/workbench/contrib/search/browser/searchWidget", "vs/workbench/contrib/search/common/constants", "vs/workbench/services/search/common/queryBuilder", "vs/workbench/contrib/search/common/search", "vs/workbench/contrib/search/browser/searchModel", "vs/workbench/contrib/searchEditor/browser/constants", "vs/workbench/contrib/searchEditor/browser/searchEditorSerialization", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/search/browser/searchIcons", "vs/platform/files/common/files", "vs/platform/opener/common/opener", "vs/platform/notification/common/notification", "vs/workbench/contrib/search/browser/searchMessage", "vs/editor/browser/editorExtensions", "vs/editor/contrib/unusualLineTerminators/browser/unusualLineTerminators", "vs/platform/theme/browser/defaultStyles", "vs/platform/log/common/log", "vs/css!./media/searchEditor"], function (require, exports, DOM, keyboardEvent_1, aria_1, async_1, lifecycle_1, types_1, position_1, range_1, selection_1, model_1, textResourceConfiguration_1, referencesController_1, nls_1, commands_1, configuration_1, contextkey_1, contextView_1, instantiation_1, serviceCollection_1, label_1, progress_1, storage_1, telemetry_1, colorRegistry_1, themeService_1, themables_1, workspace_1, textCodeEditor_1, patternInputWidget_1, searchWidget_1, constants_1, queryBuilder_1, search_1, searchModel_1, constants_2, searchEditorSerialization_1, editorGroupsService_1, editorService_1, searchIcons_1, files_1, opener_1, notification_1, searchMessage_1, editorExtensions_1, unusualLineTerminators_1, defaultStyles_1, log_1) {
    "use strict";
    var $4Ob_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$4Ob = void 0;
    const RESULT_LINE_REGEX = /^(\s+)(\d+)(: |  )(\s*)(.*)$/;
    const FILE_LINE_REGEX = /^(\S.*):$/;
    let $4Ob = class $4Ob extends textCodeEditor_1.$Cvb {
        static { $4Ob_1 = this; }
        static { this.ID = constants_2.$HOb; }
        static { this.SEARCH_EDITOR_VIEW_STATE_PREFERENCE_KEY = 'searchEditorViewState'; }
        get Yb() { return this.a; }
        constructor(telemetryService, themeService, storageService, pc, qc, rc, instantiationService, sc, tc, uc, vc, progressService, textResourceService, editorGroupService, editorService, wc, fileService, xc) {
            super($4Ob_1.ID, telemetryService, instantiationService, storageService, textResourceService, themeService, editorService, editorGroupService, fileService);
            this.pc = pc;
            this.qc = qc;
            this.rc = rc;
            this.sc = sc;
            this.tc = tc;
            this.uc = uc;
            this.vc = vc;
            this.wc = wc;
            this.xc = xc;
            this.fc = new async_1.$Dg(0);
            this.gc = false;
            this.hc = false;
            this.nc = 0;
            this.oc = false;
            this.lc = DOM.$('.search-editor');
            this.ic = this.B(new progress_1.$6u(progressService));
            this.B(this.kc = new lifecycle_1.$jc());
            this.jc = new async_1.$Dg(2000);
            this.mc = this.B(this.m.createInstance(searchModel_1.$2Mb));
        }
        ab(parent) {
            DOM.$0O(parent, this.lc);
            this.Zb = DOM.$0O(this.lc, DOM.$('.query-container'));
            const searchResultContainer = DOM.$0O(this.lc, DOM.$('.search-results'));
            super.ab(searchResultContainer);
            this.Dc();
            const scopedContextKeyService = (0, types_1.$uf)(this.scopedContextKeyService);
            constants_2.$DOb.bindTo(scopedContextKeyService).set(true);
            this.zc(this.Zb, this.m.createChild(new serviceCollection_1.$zh([contextkey_1.$3i, scopedContextKeyService])), constants_1.$iOb.bindTo(scopedContextKeyService));
        }
        zc(container, scopedInstantiationService, inputBoxFocusedContextKey) {
            const searchEditorInputboxStyles = (0, defaultStyles_1.$t2)({ inputBorder: searchEditorTextInputBorder });
            this.Xb = this.B(scopedInstantiationService.createInstance(searchWidget_1.$NOb, container, { _hideReplaceToggle: true, showContextToggle: true, inputBoxStyles: searchEditorInputboxStyles, toggleStyles: defaultStyles_1.$m2 }));
            this.B(this.Xb.onReplaceToggled(() => this.Lc()));
            this.B(this.Xb.onDidHeightChange(() => this.Lc()));
            this.B(this.Xb.onSearchSubmit(({ delay }) => this.triggerSearch({ delay })));
            if (this.Xb.searchInput) {
                this.B(this.Xb.searchInput.onDidOptionChange(() => this.triggerSearch({ resetCursor: false })));
            }
            else {
                this.xc.warn('SearchEditor: SearchWidget.searchInput is undefined, cannot register onDidOptionChange listener');
            }
            this.B(this.Xb.onDidToggleContext(() => this.triggerSearch({ resetCursor: false })));
            // Includes/Excludes Dropdown
            this.cc = DOM.$0O(container, DOM.$('.includes-excludes'));
            // Toggle query details button
            this.dc = DOM.$0O(this.cc, DOM.$('.expand' + themables_1.ThemeIcon.asCSSSelector(searchIcons_1.$bNb), { tabindex: 0, role: 'button', title: (0, nls_1.localize)(0, null) }));
            this.B(DOM.$nO(this.dc, DOM.$3O.CLICK, e => {
                DOM.$5O.stop(e);
                this.Oc();
            }));
            this.B(DOM.$nO(this.dc, DOM.$3O.KEY_UP, (e) => {
                const event = new keyboardEvent_1.$jO(e);
                if (event.equals(3 /* KeyCode.Enter */) || event.equals(10 /* KeyCode.Space */)) {
                    DOM.$5O.stop(e);
                    this.Oc();
                }
            }));
            this.B(DOM.$nO(this.dc, DOM.$3O.KEY_DOWN, (e) => {
                const event = new keyboardEvent_1.$jO(e);
                if (event.equals(1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */)) {
                    if (this.Xb.isReplaceActive()) {
                        this.Xb.focusReplaceAllAction();
                    }
                    else {
                        this.Xb.isReplaceShown() ? this.Xb.replaceInput?.focusOnPreserve() : this.Xb.focusRegexAction();
                    }
                    DOM.$5O.stop(e);
                }
            }));
            // Includes
            const folderIncludesList = DOM.$0O(this.cc, DOM.$('.file-types.includes'));
            const filesToIncludeTitle = (0, nls_1.localize)(1, null);
            DOM.$0O(folderIncludesList, DOM.$('h4', undefined, filesToIncludeTitle));
            this.ac = this.B(scopedInstantiationService.createInstance(patternInputWidget_1.$tNb, folderIncludesList, this.sc, {
                ariaLabel: (0, nls_1.localize)(2, null),
                inputBoxStyles: searchEditorInputboxStyles
            }));
            this.ac.onSubmit(triggeredOnType => this.triggerSearch({ resetCursor: false, delay: triggeredOnType ? this.Ec.searchOnTypeDebouncePeriod : 0 }));
            this.B(this.ac.onChangeSearchInEditorsBox(() => this.triggerSearch()));
            // Excludes
            const excludesList = DOM.$0O(this.cc, DOM.$('.file-types.excludes'));
            const excludesTitle = (0, nls_1.localize)(3, null);
            DOM.$0O(excludesList, DOM.$('h4', undefined, excludesTitle));
            this.bc = this.B(scopedInstantiationService.createInstance(patternInputWidget_1.$uNb, excludesList, this.sc, {
                ariaLabel: (0, nls_1.localize)(4, null),
                inputBoxStyles: searchEditorInputboxStyles
            }));
            this.bc.onSubmit(triggeredOnType => this.triggerSearch({ resetCursor: false, delay: triggeredOnType ? this.Ec.searchOnTypeDebouncePeriod : 0 }));
            this.B(this.bc.onChangeIgnoreBox(() => this.triggerSearch()));
            // Messages
            this.ec = DOM.$0O(container, DOM.$('.messages.text-search-provider-messages'));
            [this.Xb.searchInputFocusTracker, this.Xb.replaceInputFocusTracker, this.bc.inputFocusTracker, this.ac.inputFocusTracker]
                .forEach(tracker => {
                if (!tracker) {
                    return;
                }
                this.B(tracker.onDidFocus(() => setTimeout(() => inputBoxFocusedContextKey.set(true), 0)));
                this.B(tracker.onDidBlur(() => inputBoxFocusedContextKey.set(false)));
            });
        }
        Ac(show) {
            DOM.$lO(this.ec);
            this.kc.clear();
            if (show) {
                const runAgainLink = DOM.$0O(this.ec, DOM.$('a.pointer.prominent.message', {}, (0, nls_1.localize)(5, null)));
                this.kc.add(DOM.$nO(runAgainLink, DOM.$3O.CLICK, async () => {
                    await this.triggerSearch();
                    this.Yb.focus();
                }));
            }
        }
        Bc() {
            const skipContributions = [unusualLineTerminators_1.$d$.ID];
            return editorExtensions_1.EditorExtensionsRegistry.getEditorContributions().filter(c => skipContributions.indexOf(c.id) === -1);
        }
        Sb() {
            return { contributions: this.Bc() };
        }
        Dc() {
            this.Yb.onMouseUp(e => {
                if (e.event.detail === 2) {
                    const behaviour = this.Ec.searchEditor.doubleClickBehaviour;
                    const position = e.target.position;
                    if (position && behaviour !== 'selectWord') {
                        const line = this.Yb.getModel()?.getLineContent(position.lineNumber) ?? '';
                        if (line.match(RESULT_LINE_REGEX)) {
                            this.Yb.setSelection(range_1.$ks.fromPositions(position));
                            this.tc.executeCommand(behaviour === 'goToLocation' ? 'editor.action.goToDeclaration' : 'editor.action.openDeclarationToTheSide');
                        }
                        else if (line.match(FILE_LINE_REGEX)) {
                            this.Yb.setSelection(range_1.$ks.fromPositions(position));
                            this.tc.executeCommand('editor.action.peekDefinition');
                        }
                    }
                }
            });
            this.B(this.Yb.onDidChangeModelContent(() => {
                if (!this.oc) {
                    this.Mc()?.setDirty(true);
                }
            }));
        }
        getControl() {
            return this.Yb;
        }
        focus() {
            const viewState = this.kb(this.Mc());
            if (viewState && viewState.focused === 'editor') {
                this.Yb.focus();
            }
            else {
                this.Xb.focus();
            }
        }
        focusSearchInput() {
            this.Xb.searchInput?.focus();
        }
        focusFilesToIncludeInput() {
            if (!this.hc) {
                this.Oc(true);
            }
            this.ac.focus();
        }
        focusFilesToExcludeInput() {
            if (!this.hc) {
                this.Oc(true);
            }
            this.bc.focus();
        }
        focusNextInput() {
            if (this.Xb.searchInputHasFocus()) {
                if (this.hc) {
                    this.ac.focus();
                }
                else {
                    this.Yb.focus();
                }
            }
            else if (this.ac.inputHasFocus()) {
                this.bc.focus();
            }
            else if (this.bc.inputHasFocus()) {
                this.Yb.focus();
            }
            else if (this.Yb.hasWidgetFocus()) {
                // pass
            }
        }
        focusPrevInput() {
            if (this.Xb.searchInputHasFocus()) {
                this.Yb.focus(); // wrap
            }
            else if (this.ac.inputHasFocus()) {
                this.Xb.searchInput?.focus();
            }
            else if (this.bc.inputHasFocus()) {
                this.ac.focus();
            }
            else if (this.Yb.hasWidgetFocus()) {
                // unreachable.
            }
        }
        setQuery(query) {
            this.Xb.searchInput?.setValue(query);
        }
        selectQuery() {
            this.Xb.searchInput?.select();
        }
        toggleWholeWords() {
            this.Xb.searchInput?.setWholeWords(!this.Xb.searchInput.getWholeWords());
            this.triggerSearch({ resetCursor: false });
        }
        toggleRegex() {
            this.Xb.searchInput?.setRegex(!this.Xb.searchInput.getRegex());
            this.triggerSearch({ resetCursor: false });
        }
        toggleCaseSensitive() {
            this.Xb.searchInput?.setCaseSensitive(!this.Xb.searchInput.getCaseSensitive());
            this.triggerSearch({ resetCursor: false });
        }
        toggleContextLines() {
            this.Xb.toggleContextLines();
        }
        modifyContextLines(increase) {
            this.Xb.modifyContextLines(increase);
        }
        toggleQueryDetails(shouldShow) {
            this.Oc(shouldShow);
        }
        deleteResultBlock() {
            const linesToDelete = new Set();
            const selections = this.Yb.getSelections();
            const model = this.Yb.getModel();
            if (!(selections && model)) {
                return;
            }
            const maxLine = model.getLineCount();
            const minLine = 1;
            const deleteUp = (start) => {
                for (let cursor = start; cursor >= minLine; cursor--) {
                    const line = model.getLineContent(cursor);
                    linesToDelete.add(cursor);
                    if (line[0] !== undefined && line[0] !== ' ') {
                        break;
                    }
                }
            };
            const deleteDown = (start) => {
                linesToDelete.add(start);
                for (let cursor = start + 1; cursor <= maxLine; cursor++) {
                    const line = model.getLineContent(cursor);
                    if (line[0] !== undefined && line[0] !== ' ') {
                        return cursor;
                    }
                    linesToDelete.add(cursor);
                }
                return;
            };
            const endingCursorLines = [];
            for (const selection of selections) {
                const lineNumber = selection.startLineNumber;
                endingCursorLines.push(deleteDown(lineNumber));
                deleteUp(lineNumber);
                for (let inner = selection.startLineNumber; inner <= selection.endLineNumber; inner++) {
                    linesToDelete.add(inner);
                }
            }
            if (endingCursorLines.length === 0) {
                endingCursorLines.push(1);
            }
            const isDefined = (x) => x !== undefined;
            model.pushEditOperations(this.Yb.getSelections(), [...linesToDelete].map(line => ({ range: new range_1.$ks(line, 1, line + 1, 1), text: '' })), () => endingCursorLines.filter(isDefined).map(line => new selection_1.$ms(line, 1, line, 1)));
        }
        cleanState() {
            this.Mc()?.setDirty(false);
        }
        get Ec() {
            return this.wc.getValue('search');
        }
        Fc(reverse) {
            const model = this.Yb.getModel();
            if (!model) {
                return;
            }
            const lastLine = model.getLineCount() ?? 1;
            const lastColumn = model.getLineLength(lastLine);
            const fallbackStart = reverse ? new position_1.$js(lastLine, lastColumn) : new position_1.$js(1, 1);
            const currentPosition = this.Yb.getSelection()?.getStartPosition() ?? fallbackStart;
            const matchRanges = this.Mc()?.getMatchRanges();
            if (!matchRanges) {
                return;
            }
            const matchRange = (reverse ? findPrevRange : findNextRange)(matchRanges, currentPosition);
            this.Yb.setSelection(matchRange);
            this.Yb.revealLineInCenterIfOutsideViewport(matchRange.startLineNumber);
            this.Yb.focus();
            const matchLineText = model.getLineContent(matchRange.startLineNumber);
            const matchText = model.getValueInRange(matchRange);
            let file = '';
            for (let line = matchRange.startLineNumber; line >= 1; line--) {
                const lineText = model.getValueInRange(new range_1.$ks(line, 1, line, 2));
                if (lineText !== ' ') {
                    file = model.getLineContent(line);
                    break;
                }
            }
            (0, aria_1.$$P)((0, nls_1.localize)(6, null, matchText, matchLineText, file.slice(0, file.length - 1)));
        }
        focusNextResult() {
            this.Fc(false);
        }
        focusPreviousResult() {
            this.Fc(true);
        }
        focusAllResults() {
            this.Yb
                .setSelections((this.Mc()?.getMatchRanges() ?? []).map(range => new selection_1.$ms(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn)));
            this.Yb.focus();
        }
        async triggerSearch(_options) {
            const options = { resetCursor: true, delay: 0, ..._options };
            if (!this.gc) {
                await this.fc.trigger(async () => {
                    this.Ac(false);
                    await this.Hc();
                    if (options.resetCursor) {
                        this.Yb.setPosition(new position_1.$js(1, 1));
                        this.Yb.setScrollPosition({ scrollTop: 0, scrollLeft: 0 });
                    }
                    if (options.focusResults) {
                        this.Yb.focus();
                    }
                }, options.delay);
            }
        }
        Gc() {
            return {
                isCaseSensitive: this.Xb.searchInput?.getCaseSensitive() ?? false,
                contextLines: this.Xb.getContextLines(),
                filesToExclude: this.bc.getValue(),
                filesToInclude: this.ac.getValue(),
                query: this.Xb.searchInput?.getValue() ?? '',
                isRegexp: this.Xb.searchInput?.getRegex() ?? false,
                matchWholeWord: this.Xb.searchInput?.getWholeWords() ?? false,
                useExcludeSettingsAndIgnoreFiles: this.bc.useExcludesAndIgnoreFiles(),
                onlyOpenEditors: this.ac.onlySearchInOpenEditors(),
                showIncludesExcludes: this.hc,
                notebookSearchConfig: {
                    includeMarkupInput: this.Xb.getNotebookFilters().markupInput,
                    includeMarkupPreview: this.Xb.getNotebookFilters().markupPreview,
                    includeCodeInput: this.Xb.getNotebookFilters().codeInput,
                    includeOutput: this.Xb.getNotebookFilters().codeOutput,
                }
            };
        }
        async Hc() {
            this.mc.cancelSearch(true);
            const startInput = this.Mc();
            if (!startInput) {
                return;
            }
            this.jc.trigger(() => {
                this.Xb.searchInput?.onSearchSubmit();
                this.bc.onSearchSubmit();
                this.ac.onSearchSubmit();
            });
            const config = this.Gc();
            if (!config.query) {
                return;
            }
            const content = {
                pattern: config.query,
                isRegExp: config.isRegexp,
                isCaseSensitive: config.isCaseSensitive,
                isWordMatch: config.matchWholeWord,
            };
            const options = {
                _reason: 'searchEditor',
                extraFileResources: this.m.invokeFunction(search_1.$MI),
                maxResults: this.Ec.maxResults ?? undefined,
                disregardIgnoreFiles: !config.useExcludeSettingsAndIgnoreFiles || undefined,
                disregardExcludeSettings: !config.useExcludeSettingsAndIgnoreFiles || undefined,
                excludePattern: config.filesToExclude,
                includePattern: config.filesToInclude,
                onlyOpenEditors: config.onlyOpenEditors,
                previewOptions: {
                    matchLines: 1,
                    charsPerLine: 1000
                },
                afterContext: config.contextLines,
                beforeContext: config.contextLines,
                isSmartCase: this.Ec.smartCase,
                expandPatterns: true,
                notebookSearchConfig: {
                    includeMarkupInput: config.notebookSearchConfig.includeMarkupInput,
                    includeMarkupPreview: config.notebookSearchConfig.includeMarkupPreview,
                    includeCodeInput: config.notebookSearchConfig.includeCodeInput,
                    includeOutput: config.notebookSearchConfig.includeOutput,
                }
            };
            const folderResources = this.qc.getWorkspace().folders;
            let query;
            try {
                const queryBuilder = this.m.createInstance(queryBuilder_1.$AJ);
                query = queryBuilder.text(content, folderResources.map(folder => folder.uri), options);
            }
            catch (err) {
                return;
            }
            this.ic.start(500);
            this.nc++;
            const { configurationModel } = await startInput.resolveModels();
            configurationModel.updateConfig(config);
            const result = this.mc.search(query);
            startInput.ongoingSearchOperation = result.asyncResults.finally(() => {
                this.nc--;
                if (this.nc === 0) {
                    this.ic.stop();
                }
            });
            const searchOperation = await startInput.ongoingSearchOperation;
            await this.Ic(searchOperation, config, startInput);
        }
        async Ic(searchOperation, startConfig, startInput) {
            const input = this.Mc();
            if (!input ||
                input !== startInput ||
                JSON.stringify(startConfig) !== JSON.stringify(this.Gc())) {
                return;
            }
            input.ongoingSearchOperation = undefined;
            const sortOrder = this.Ec.sortOrder;
            if (sortOrder === "modified" /* SearchSortOrder.Modified */) {
                await this.Kc(this.mc.searchResult);
            }
            const controller = referencesController_1.$M4.get(this.Yb);
            controller?.closeWidget(false);
            const labelFormatter = (uri) => this.rc.getUriLabel(uri, { relative: true });
            const results = (0, searchEditorSerialization_1.$TOb)(this.mc.searchResult, startConfig.filesToInclude, startConfig.filesToExclude, startConfig.contextLines, labelFormatter, sortOrder, searchOperation?.limitHit);
            const { resultsModel } = await input.resolveModels();
            this.oc = true;
            this.pc.updateModel(resultsModel, results.text);
            this.oc = false;
            if (searchOperation && searchOperation.messages) {
                for (const message of searchOperation.messages) {
                    this.Jc(message);
                }
            }
            this.Lc();
            input.setDirty(!input.hasCapability(4 /* EditorInputCapabilities.Untitled */));
            input.setMatchRanges(results.matchRanges);
        }
        Jc(message) {
            let messageBox;
            if (this.ec.firstChild) {
                messageBox = this.ec.firstChild;
            }
            else {
                messageBox = DOM.$0O(this.ec, DOM.$('.message'));
            }
            DOM.$0O(messageBox, (0, searchMessage_1.$3Ob)(message, this.m, this.vc, this.uc, this.tc, this.kc, () => this.triggerSearch()));
        }
        async Kc(searchResult) {
            const files = searchResult.matches().filter(f => !f.fileStat).map(f => f.resolveFileStat(this.xb));
            await Promise.all(files);
        }
        layout(dimension) {
            this.$b = dimension;
            this.Lc();
        }
        getSelected() {
            const selection = this.Yb.getSelection();
            if (selection) {
                return this.Yb.getModel()?.getValueInRange(selection) ?? '';
            }
            return '';
        }
        Lc() {
            if (this.$b) {
                this.Xb.setWidth(this.$b.width - 28 /* container margin */);
                this.Yb.layout({ height: this.$b.height - DOM.$LO(this.Zb), width: this.$b.width });
                this.bc.setWidth(this.$b.width - 28 /* container margin */);
                this.ac.setWidth(this.$b.width - 28 /* container margin */);
            }
        }
        Mc() {
            return this.X;
        }
        setSearchConfig(config) {
            this.Nc = config;
            if (config.query !== undefined) {
                this.Xb.setValue(config.query);
            }
            if (config.isCaseSensitive !== undefined) {
                this.Xb.searchInput?.setCaseSensitive(config.isCaseSensitive);
            }
            if (config.isRegexp !== undefined) {
                this.Xb.searchInput?.setRegex(config.isRegexp);
            }
            if (config.matchWholeWord !== undefined) {
                this.Xb.searchInput?.setWholeWords(config.matchWholeWord);
            }
            if (config.contextLines !== undefined) {
                this.Xb.setContextLines(config.contextLines);
            }
            if (config.filesToExclude !== undefined) {
                this.bc.setValue(config.filesToExclude);
            }
            if (config.filesToInclude !== undefined) {
                this.ac.setValue(config.filesToInclude);
            }
            if (config.onlyOpenEditors !== undefined) {
                this.ac.setOnlySearchInOpenEditors(config.onlyOpenEditors);
            }
            if (config.useExcludeSettingsAndIgnoreFiles !== undefined) {
                this.bc.setUseExcludesAndIgnoreFiles(config.useExcludeSettingsAndIgnoreFiles);
            }
            if (config.showIncludesExcludes !== undefined) {
                this.Oc(config.showIncludesExcludes);
            }
        }
        async setInput(newInput, options, context, token) {
            await super.setInput(newInput, options, context, token);
            if (token.isCancellationRequested) {
                return;
            }
            const { configurationModel, resultsModel } = await newInput.resolveModels();
            if (token.isCancellationRequested) {
                return;
            }
            this.Yb.setModel(resultsModel);
            this.gc = true;
            this.Ac(!newInput.ongoingSearchOperation && resultsModel.getLineCount() === 1 && resultsModel.getValue() === '' && configurationModel.config.query !== '');
            this.setSearchConfig(configurationModel.config);
            this.B(configurationModel.onConfigDidUpdate(newConfig => {
                if (newConfig !== this.Nc) {
                    this.gc = true;
                    this.setSearchConfig(newConfig);
                    this.gc = false;
                }
            }));
            this.Sc(context);
            if (!options?.preserveFocus) {
                this.focus();
            }
            this.gc = false;
            if (newInput.ongoingSearchOperation) {
                const existingConfig = this.Gc();
                newInput.ongoingSearchOperation.then(complete => {
                    this.Ic(complete, existingConfig, newInput);
                });
            }
        }
        Oc(_shouldShow) {
            const cls = 'expanded';
            const shouldShow = _shouldShow ?? !this.cc.classList.contains(cls);
            if (shouldShow) {
                this.dc.setAttribute('aria-expanded', 'true');
                this.cc.classList.add(cls);
            }
            else {
                this.dc.setAttribute('aria-expanded', 'false');
                this.cc.classList.remove(cls);
            }
            this.hc = this.cc.classList.contains(cls);
            this.Lc();
        }
        qb(input) {
            if (input.typeId === constants_2.$LOb) {
                return input.modelUri;
            }
            return undefined;
        }
        nb(resource) {
            const control = this.getControl();
            const editorViewState = control.saveViewState();
            if (!editorViewState) {
                return undefined;
            }
            if (resource.toString() !== this.Mc()?.modelUri.toString()) {
                return undefined;
            }
            return { ...editorViewState, focused: this.Yb.hasWidgetFocus() ? 'editor' : 'input' };
        }
        ob(input) {
            return input.typeId === constants_2.$LOb;
        }
        Sc(context) {
            const viewState = this.kb(this.Mc(), context);
            if (viewState) {
                this.Yb.restoreViewState(viewState);
            }
        }
        getAriaLabel() {
            return this.Mc()?.getName() ?? (0, nls_1.localize)(7, null);
        }
    };
    exports.$4Ob = $4Ob;
    exports.$4Ob = $4Ob = $4Ob_1 = __decorate([
        __param(0, telemetry_1.$9k),
        __param(1, themeService_1.$gv),
        __param(2, storage_1.$Vo),
        __param(3, model_1.$yA),
        __param(4, workspace_1.$Kh),
        __param(5, label_1.$Vz),
        __param(6, instantiation_1.$Ah),
        __param(7, contextView_1.$VZ),
        __param(8, commands_1.$Fr),
        __param(9, opener_1.$NT),
        __param(10, notification_1.$Yu),
        __param(11, progress_1.$7u),
        __param(12, textResourceConfiguration_1.$FA),
        __param(13, editorGroupsService_1.$5C),
        __param(14, editorService_1.$9C),
        __param(15, configuration_1.$8h),
        __param(16, files_1.$6j),
        __param(17, log_1.$5i)
    ], $4Ob);
    const searchEditorTextInputBorder = (0, colorRegistry_1.$sv)('searchEditor.textInputBorder', { dark: colorRegistry_1.$Ov, light: colorRegistry_1.$Ov, hcDark: colorRegistry_1.$Ov, hcLight: colorRegistry_1.$Ov }, (0, nls_1.localize)(8, null));
    function findNextRange(matchRanges, currentPosition) {
        for (const matchRange of matchRanges) {
            if (position_1.$js.isBefore(currentPosition, matchRange.getStartPosition())) {
                return matchRange;
            }
        }
        return matchRanges[0];
    }
    function findPrevRange(matchRanges, currentPosition) {
        for (let i = matchRanges.length - 1; i >= 0; i--) {
            const matchRange = matchRanges[i];
            if (position_1.$js.isBefore(matchRange.getStartPosition(), currentPosition)) {
                {
                    return matchRange;
                }
            }
        }
        return matchRanges[matchRanges.length - 1];
    }
});
//# sourceMappingURL=searchEditor.js.map