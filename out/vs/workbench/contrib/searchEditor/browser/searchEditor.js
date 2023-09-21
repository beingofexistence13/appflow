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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/aria/aria", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/types", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/services/model", "vs/editor/common/services/textResourceConfiguration", "vs/editor/contrib/gotoSymbol/browser/peek/referencesController", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/label/common/label", "vs/platform/progress/common/progress", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/platform/workspace/common/workspace", "vs/workbench/browser/parts/editor/textCodeEditor", "vs/workbench/contrib/search/browser/patternInputWidget", "vs/workbench/contrib/search/browser/searchWidget", "vs/workbench/contrib/search/common/constants", "vs/workbench/services/search/common/queryBuilder", "vs/workbench/contrib/search/common/search", "vs/workbench/contrib/search/browser/searchModel", "vs/workbench/contrib/searchEditor/browser/constants", "vs/workbench/contrib/searchEditor/browser/searchEditorSerialization", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/search/browser/searchIcons", "vs/platform/files/common/files", "vs/platform/opener/common/opener", "vs/platform/notification/common/notification", "vs/workbench/contrib/search/browser/searchMessage", "vs/editor/browser/editorExtensions", "vs/editor/contrib/unusualLineTerminators/browser/unusualLineTerminators", "vs/platform/theme/browser/defaultStyles", "vs/platform/log/common/log", "vs/css!./media/searchEditor"], function (require, exports, DOM, keyboardEvent_1, aria_1, async_1, lifecycle_1, types_1, position_1, range_1, selection_1, model_1, textResourceConfiguration_1, referencesController_1, nls_1, commands_1, configuration_1, contextkey_1, contextView_1, instantiation_1, serviceCollection_1, label_1, progress_1, storage_1, telemetry_1, colorRegistry_1, themeService_1, themables_1, workspace_1, textCodeEditor_1, patternInputWidget_1, searchWidget_1, constants_1, queryBuilder_1, search_1, searchModel_1, constants_2, searchEditorSerialization_1, editorGroupsService_1, editorService_1, searchIcons_1, files_1, opener_1, notification_1, searchMessage_1, editorExtensions_1, unusualLineTerminators_1, defaultStyles_1, log_1) {
    "use strict";
    var SearchEditor_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SearchEditor = void 0;
    const RESULT_LINE_REGEX = /^(\s+)(\d+)(: |  )(\s*)(.*)$/;
    const FILE_LINE_REGEX = /^(\S.*):$/;
    let SearchEditor = class SearchEditor extends textCodeEditor_1.AbstractTextCodeEditor {
        static { SearchEditor_1 = this; }
        static { this.ID = constants_2.SearchEditorID; }
        static { this.SEARCH_EDITOR_VIEW_STATE_PREFERENCE_KEY = 'searchEditorViewState'; }
        get searchResultEditor() { return this.editorControl; }
        constructor(telemetryService, themeService, storageService, modelService, contextService, labelService, instantiationService, contextViewService, commandService, openerService, notificationService, progressService, textResourceService, editorGroupService, editorService, configurationService, fileService, logService) {
            super(SearchEditor_1.ID, telemetryService, instantiationService, storageService, textResourceService, themeService, editorService, editorGroupService, fileService);
            this.modelService = modelService;
            this.contextService = contextService;
            this.labelService = labelService;
            this.contextViewService = contextViewService;
            this.commandService = commandService;
            this.openerService = openerService;
            this.notificationService = notificationService;
            this.configurationService = configurationService;
            this.logService = logService;
            this.runSearchDelayer = new async_1.Delayer(0);
            this.pauseSearching = false;
            this.showingIncludesExcludes = false;
            this.ongoingOperations = 0;
            this.updatingModelForSearch = false;
            this.container = DOM.$('.search-editor');
            this.searchOperation = this._register(new progress_1.LongRunningOperation(progressService));
            this._register(this.messageDisposables = new lifecycle_1.DisposableStore());
            this.searchHistoryDelayer = new async_1.Delayer(2000);
            this.searchModel = this._register(this.instantiationService.createInstance(searchModel_1.SearchModel));
        }
        createEditor(parent) {
            DOM.append(parent, this.container);
            this.queryEditorContainer = DOM.append(this.container, DOM.$('.query-container'));
            const searchResultContainer = DOM.append(this.container, DOM.$('.search-results'));
            super.createEditor(searchResultContainer);
            this.registerEditorListeners();
            const scopedContextKeyService = (0, types_1.assertIsDefined)(this.scopedContextKeyService);
            constants_2.InSearchEditor.bindTo(scopedContextKeyService).set(true);
            this.createQueryEditor(this.queryEditorContainer, this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, scopedContextKeyService])), constants_1.InputBoxFocusedKey.bindTo(scopedContextKeyService));
        }
        createQueryEditor(container, scopedInstantiationService, inputBoxFocusedContextKey) {
            const searchEditorInputboxStyles = (0, defaultStyles_1.getInputBoxStyle)({ inputBorder: searchEditorTextInputBorder });
            this.queryEditorWidget = this._register(scopedInstantiationService.createInstance(searchWidget_1.SearchWidget, container, { _hideReplaceToggle: true, showContextToggle: true, inputBoxStyles: searchEditorInputboxStyles, toggleStyles: defaultStyles_1.defaultToggleStyles }));
            this._register(this.queryEditorWidget.onReplaceToggled(() => this.reLayout()));
            this._register(this.queryEditorWidget.onDidHeightChange(() => this.reLayout()));
            this._register(this.queryEditorWidget.onSearchSubmit(({ delay }) => this.triggerSearch({ delay })));
            if (this.queryEditorWidget.searchInput) {
                this._register(this.queryEditorWidget.searchInput.onDidOptionChange(() => this.triggerSearch({ resetCursor: false })));
            }
            else {
                this.logService.warn('SearchEditor: SearchWidget.searchInput is undefined, cannot register onDidOptionChange listener');
            }
            this._register(this.queryEditorWidget.onDidToggleContext(() => this.triggerSearch({ resetCursor: false })));
            // Includes/Excludes Dropdown
            this.includesExcludesContainer = DOM.append(container, DOM.$('.includes-excludes'));
            // Toggle query details button
            this.toggleQueryDetailsButton = DOM.append(this.includesExcludesContainer, DOM.$('.expand' + themables_1.ThemeIcon.asCSSSelector(searchIcons_1.searchDetailsIcon), { tabindex: 0, role: 'button', title: (0, nls_1.localize)('moreSearch', "Toggle Search Details") }));
            this._register(DOM.addDisposableListener(this.toggleQueryDetailsButton, DOM.EventType.CLICK, e => {
                DOM.EventHelper.stop(e);
                this.toggleIncludesExcludes();
            }));
            this._register(DOM.addDisposableListener(this.toggleQueryDetailsButton, DOM.EventType.KEY_UP, (e) => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.equals(3 /* KeyCode.Enter */) || event.equals(10 /* KeyCode.Space */)) {
                    DOM.EventHelper.stop(e);
                    this.toggleIncludesExcludes();
                }
            }));
            this._register(DOM.addDisposableListener(this.toggleQueryDetailsButton, DOM.EventType.KEY_DOWN, (e) => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.equals(1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */)) {
                    if (this.queryEditorWidget.isReplaceActive()) {
                        this.queryEditorWidget.focusReplaceAllAction();
                    }
                    else {
                        this.queryEditorWidget.isReplaceShown() ? this.queryEditorWidget.replaceInput?.focusOnPreserve() : this.queryEditorWidget.focusRegexAction();
                    }
                    DOM.EventHelper.stop(e);
                }
            }));
            // Includes
            const folderIncludesList = DOM.append(this.includesExcludesContainer, DOM.$('.file-types.includes'));
            const filesToIncludeTitle = (0, nls_1.localize)('searchScope.includes', "files to include");
            DOM.append(folderIncludesList, DOM.$('h4', undefined, filesToIncludeTitle));
            this.inputPatternIncludes = this._register(scopedInstantiationService.createInstance(patternInputWidget_1.IncludePatternInputWidget, folderIncludesList, this.contextViewService, {
                ariaLabel: (0, nls_1.localize)('label.includes', 'Search Include Patterns'),
                inputBoxStyles: searchEditorInputboxStyles
            }));
            this.inputPatternIncludes.onSubmit(triggeredOnType => this.triggerSearch({ resetCursor: false, delay: triggeredOnType ? this.searchConfig.searchOnTypeDebouncePeriod : 0 }));
            this._register(this.inputPatternIncludes.onChangeSearchInEditorsBox(() => this.triggerSearch()));
            // Excludes
            const excludesList = DOM.append(this.includesExcludesContainer, DOM.$('.file-types.excludes'));
            const excludesTitle = (0, nls_1.localize)('searchScope.excludes', "files to exclude");
            DOM.append(excludesList, DOM.$('h4', undefined, excludesTitle));
            this.inputPatternExcludes = this._register(scopedInstantiationService.createInstance(patternInputWidget_1.ExcludePatternInputWidget, excludesList, this.contextViewService, {
                ariaLabel: (0, nls_1.localize)('label.excludes', 'Search Exclude Patterns'),
                inputBoxStyles: searchEditorInputboxStyles
            }));
            this.inputPatternExcludes.onSubmit(triggeredOnType => this.triggerSearch({ resetCursor: false, delay: triggeredOnType ? this.searchConfig.searchOnTypeDebouncePeriod : 0 }));
            this._register(this.inputPatternExcludes.onChangeIgnoreBox(() => this.triggerSearch()));
            // Messages
            this.messageBox = DOM.append(container, DOM.$('.messages.text-search-provider-messages'));
            [this.queryEditorWidget.searchInputFocusTracker, this.queryEditorWidget.replaceInputFocusTracker, this.inputPatternExcludes.inputFocusTracker, this.inputPatternIncludes.inputFocusTracker]
                .forEach(tracker => {
                if (!tracker) {
                    return;
                }
                this._register(tracker.onDidFocus(() => setTimeout(() => inputBoxFocusedContextKey.set(true), 0)));
                this._register(tracker.onDidBlur(() => inputBoxFocusedContextKey.set(false)));
            });
        }
        toggleRunAgainMessage(show) {
            DOM.clearNode(this.messageBox);
            this.messageDisposables.clear();
            if (show) {
                const runAgainLink = DOM.append(this.messageBox, DOM.$('a.pointer.prominent.message', {}, (0, nls_1.localize)('runSearch', "Run Search")));
                this.messageDisposables.add(DOM.addDisposableListener(runAgainLink, DOM.EventType.CLICK, async () => {
                    await this.triggerSearch();
                    this.searchResultEditor.focus();
                }));
            }
        }
        _getContributions() {
            const skipContributions = [unusualLineTerminators_1.UnusualLineTerminatorsDetector.ID];
            return editorExtensions_1.EditorExtensionsRegistry.getEditorContributions().filter(c => skipContributions.indexOf(c.id) === -1);
        }
        getCodeEditorWidgetOptions() {
            return { contributions: this._getContributions() };
        }
        registerEditorListeners() {
            this.searchResultEditor.onMouseUp(e => {
                if (e.event.detail === 2) {
                    const behaviour = this.searchConfig.searchEditor.doubleClickBehaviour;
                    const position = e.target.position;
                    if (position && behaviour !== 'selectWord') {
                        const line = this.searchResultEditor.getModel()?.getLineContent(position.lineNumber) ?? '';
                        if (line.match(RESULT_LINE_REGEX)) {
                            this.searchResultEditor.setSelection(range_1.Range.fromPositions(position));
                            this.commandService.executeCommand(behaviour === 'goToLocation' ? 'editor.action.goToDeclaration' : 'editor.action.openDeclarationToTheSide');
                        }
                        else if (line.match(FILE_LINE_REGEX)) {
                            this.searchResultEditor.setSelection(range_1.Range.fromPositions(position));
                            this.commandService.executeCommand('editor.action.peekDefinition');
                        }
                    }
                }
            });
            this._register(this.searchResultEditor.onDidChangeModelContent(() => {
                if (!this.updatingModelForSearch) {
                    this.getInput()?.setDirty(true);
                }
            }));
        }
        getControl() {
            return this.searchResultEditor;
        }
        focus() {
            const viewState = this.loadEditorViewState(this.getInput());
            if (viewState && viewState.focused === 'editor') {
                this.searchResultEditor.focus();
            }
            else {
                this.queryEditorWidget.focus();
            }
        }
        focusSearchInput() {
            this.queryEditorWidget.searchInput?.focus();
        }
        focusFilesToIncludeInput() {
            if (!this.showingIncludesExcludes) {
                this.toggleIncludesExcludes(true);
            }
            this.inputPatternIncludes.focus();
        }
        focusFilesToExcludeInput() {
            if (!this.showingIncludesExcludes) {
                this.toggleIncludesExcludes(true);
            }
            this.inputPatternExcludes.focus();
        }
        focusNextInput() {
            if (this.queryEditorWidget.searchInputHasFocus()) {
                if (this.showingIncludesExcludes) {
                    this.inputPatternIncludes.focus();
                }
                else {
                    this.searchResultEditor.focus();
                }
            }
            else if (this.inputPatternIncludes.inputHasFocus()) {
                this.inputPatternExcludes.focus();
            }
            else if (this.inputPatternExcludes.inputHasFocus()) {
                this.searchResultEditor.focus();
            }
            else if (this.searchResultEditor.hasWidgetFocus()) {
                // pass
            }
        }
        focusPrevInput() {
            if (this.queryEditorWidget.searchInputHasFocus()) {
                this.searchResultEditor.focus(); // wrap
            }
            else if (this.inputPatternIncludes.inputHasFocus()) {
                this.queryEditorWidget.searchInput?.focus();
            }
            else if (this.inputPatternExcludes.inputHasFocus()) {
                this.inputPatternIncludes.focus();
            }
            else if (this.searchResultEditor.hasWidgetFocus()) {
                // unreachable.
            }
        }
        setQuery(query) {
            this.queryEditorWidget.searchInput?.setValue(query);
        }
        selectQuery() {
            this.queryEditorWidget.searchInput?.select();
        }
        toggleWholeWords() {
            this.queryEditorWidget.searchInput?.setWholeWords(!this.queryEditorWidget.searchInput.getWholeWords());
            this.triggerSearch({ resetCursor: false });
        }
        toggleRegex() {
            this.queryEditorWidget.searchInput?.setRegex(!this.queryEditorWidget.searchInput.getRegex());
            this.triggerSearch({ resetCursor: false });
        }
        toggleCaseSensitive() {
            this.queryEditorWidget.searchInput?.setCaseSensitive(!this.queryEditorWidget.searchInput.getCaseSensitive());
            this.triggerSearch({ resetCursor: false });
        }
        toggleContextLines() {
            this.queryEditorWidget.toggleContextLines();
        }
        modifyContextLines(increase) {
            this.queryEditorWidget.modifyContextLines(increase);
        }
        toggleQueryDetails(shouldShow) {
            this.toggleIncludesExcludes(shouldShow);
        }
        deleteResultBlock() {
            const linesToDelete = new Set();
            const selections = this.searchResultEditor.getSelections();
            const model = this.searchResultEditor.getModel();
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
            model.pushEditOperations(this.searchResultEditor.getSelections(), [...linesToDelete].map(line => ({ range: new range_1.Range(line, 1, line + 1, 1), text: '' })), () => endingCursorLines.filter(isDefined).map(line => new selection_1.Selection(line, 1, line, 1)));
        }
        cleanState() {
            this.getInput()?.setDirty(false);
        }
        get searchConfig() {
            return this.configurationService.getValue('search');
        }
        iterateThroughMatches(reverse) {
            const model = this.searchResultEditor.getModel();
            if (!model) {
                return;
            }
            const lastLine = model.getLineCount() ?? 1;
            const lastColumn = model.getLineLength(lastLine);
            const fallbackStart = reverse ? new position_1.Position(lastLine, lastColumn) : new position_1.Position(1, 1);
            const currentPosition = this.searchResultEditor.getSelection()?.getStartPosition() ?? fallbackStart;
            const matchRanges = this.getInput()?.getMatchRanges();
            if (!matchRanges) {
                return;
            }
            const matchRange = (reverse ? findPrevRange : findNextRange)(matchRanges, currentPosition);
            this.searchResultEditor.setSelection(matchRange);
            this.searchResultEditor.revealLineInCenterIfOutsideViewport(matchRange.startLineNumber);
            this.searchResultEditor.focus();
            const matchLineText = model.getLineContent(matchRange.startLineNumber);
            const matchText = model.getValueInRange(matchRange);
            let file = '';
            for (let line = matchRange.startLineNumber; line >= 1; line--) {
                const lineText = model.getValueInRange(new range_1.Range(line, 1, line, 2));
                if (lineText !== ' ') {
                    file = model.getLineContent(line);
                    break;
                }
            }
            (0, aria_1.alert)((0, nls_1.localize)('searchResultItem', "Matched {0} at {1} in file {2}", matchText, matchLineText, file.slice(0, file.length - 1)));
        }
        focusNextResult() {
            this.iterateThroughMatches(false);
        }
        focusPreviousResult() {
            this.iterateThroughMatches(true);
        }
        focusAllResults() {
            this.searchResultEditor
                .setSelections((this.getInput()?.getMatchRanges() ?? []).map(range => new selection_1.Selection(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn)));
            this.searchResultEditor.focus();
        }
        async triggerSearch(_options) {
            const options = { resetCursor: true, delay: 0, ..._options };
            if (!this.pauseSearching) {
                await this.runSearchDelayer.trigger(async () => {
                    this.toggleRunAgainMessage(false);
                    await this.doRunSearch();
                    if (options.resetCursor) {
                        this.searchResultEditor.setPosition(new position_1.Position(1, 1));
                        this.searchResultEditor.setScrollPosition({ scrollTop: 0, scrollLeft: 0 });
                    }
                    if (options.focusResults) {
                        this.searchResultEditor.focus();
                    }
                }, options.delay);
            }
        }
        readConfigFromWidget() {
            return {
                isCaseSensitive: this.queryEditorWidget.searchInput?.getCaseSensitive() ?? false,
                contextLines: this.queryEditorWidget.getContextLines(),
                filesToExclude: this.inputPatternExcludes.getValue(),
                filesToInclude: this.inputPatternIncludes.getValue(),
                query: this.queryEditorWidget.searchInput?.getValue() ?? '',
                isRegexp: this.queryEditorWidget.searchInput?.getRegex() ?? false,
                matchWholeWord: this.queryEditorWidget.searchInput?.getWholeWords() ?? false,
                useExcludeSettingsAndIgnoreFiles: this.inputPatternExcludes.useExcludesAndIgnoreFiles(),
                onlyOpenEditors: this.inputPatternIncludes.onlySearchInOpenEditors(),
                showIncludesExcludes: this.showingIncludesExcludes,
                notebookSearchConfig: {
                    includeMarkupInput: this.queryEditorWidget.getNotebookFilters().markupInput,
                    includeMarkupPreview: this.queryEditorWidget.getNotebookFilters().markupPreview,
                    includeCodeInput: this.queryEditorWidget.getNotebookFilters().codeInput,
                    includeOutput: this.queryEditorWidget.getNotebookFilters().codeOutput,
                }
            };
        }
        async doRunSearch() {
            this.searchModel.cancelSearch(true);
            const startInput = this.getInput();
            if (!startInput) {
                return;
            }
            this.searchHistoryDelayer.trigger(() => {
                this.queryEditorWidget.searchInput?.onSearchSubmit();
                this.inputPatternExcludes.onSearchSubmit();
                this.inputPatternIncludes.onSearchSubmit();
            });
            const config = this.readConfigFromWidget();
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
                extraFileResources: this.instantiationService.invokeFunction(search_1.getOutOfWorkspaceEditorResources),
                maxResults: this.searchConfig.maxResults ?? undefined,
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
                isSmartCase: this.searchConfig.smartCase,
                expandPatterns: true,
                notebookSearchConfig: {
                    includeMarkupInput: config.notebookSearchConfig.includeMarkupInput,
                    includeMarkupPreview: config.notebookSearchConfig.includeMarkupPreview,
                    includeCodeInput: config.notebookSearchConfig.includeCodeInput,
                    includeOutput: config.notebookSearchConfig.includeOutput,
                }
            };
            const folderResources = this.contextService.getWorkspace().folders;
            let query;
            try {
                const queryBuilder = this.instantiationService.createInstance(queryBuilder_1.QueryBuilder);
                query = queryBuilder.text(content, folderResources.map(folder => folder.uri), options);
            }
            catch (err) {
                return;
            }
            this.searchOperation.start(500);
            this.ongoingOperations++;
            const { configurationModel } = await startInput.resolveModels();
            configurationModel.updateConfig(config);
            const result = this.searchModel.search(query);
            startInput.ongoingSearchOperation = result.asyncResults.finally(() => {
                this.ongoingOperations--;
                if (this.ongoingOperations === 0) {
                    this.searchOperation.stop();
                }
            });
            const searchOperation = await startInput.ongoingSearchOperation;
            await this.onSearchComplete(searchOperation, config, startInput);
        }
        async onSearchComplete(searchOperation, startConfig, startInput) {
            const input = this.getInput();
            if (!input ||
                input !== startInput ||
                JSON.stringify(startConfig) !== JSON.stringify(this.readConfigFromWidget())) {
                return;
            }
            input.ongoingSearchOperation = undefined;
            const sortOrder = this.searchConfig.sortOrder;
            if (sortOrder === "modified" /* SearchSortOrder.Modified */) {
                await this.retrieveFileStats(this.searchModel.searchResult);
            }
            const controller = referencesController_1.ReferencesController.get(this.searchResultEditor);
            controller?.closeWidget(false);
            const labelFormatter = (uri) => this.labelService.getUriLabel(uri, { relative: true });
            const results = (0, searchEditorSerialization_1.serializeSearchResultForEditor)(this.searchModel.searchResult, startConfig.filesToInclude, startConfig.filesToExclude, startConfig.contextLines, labelFormatter, sortOrder, searchOperation?.limitHit);
            const { resultsModel } = await input.resolveModels();
            this.updatingModelForSearch = true;
            this.modelService.updateModel(resultsModel, results.text);
            this.updatingModelForSearch = false;
            if (searchOperation && searchOperation.messages) {
                for (const message of searchOperation.messages) {
                    this.addMessage(message);
                }
            }
            this.reLayout();
            input.setDirty(!input.hasCapability(4 /* EditorInputCapabilities.Untitled */));
            input.setMatchRanges(results.matchRanges);
        }
        addMessage(message) {
            let messageBox;
            if (this.messageBox.firstChild) {
                messageBox = this.messageBox.firstChild;
            }
            else {
                messageBox = DOM.append(this.messageBox, DOM.$('.message'));
            }
            DOM.append(messageBox, (0, searchMessage_1.renderSearchMessage)(message, this.instantiationService, this.notificationService, this.openerService, this.commandService, this.messageDisposables, () => this.triggerSearch()));
        }
        async retrieveFileStats(searchResult) {
            const files = searchResult.matches().filter(f => !f.fileStat).map(f => f.resolveFileStat(this.fileService));
            await Promise.all(files);
        }
        layout(dimension) {
            this.dimension = dimension;
            this.reLayout();
        }
        getSelected() {
            const selection = this.searchResultEditor.getSelection();
            if (selection) {
                return this.searchResultEditor.getModel()?.getValueInRange(selection) ?? '';
            }
            return '';
        }
        reLayout() {
            if (this.dimension) {
                this.queryEditorWidget.setWidth(this.dimension.width - 28 /* container margin */);
                this.searchResultEditor.layout({ height: this.dimension.height - DOM.getTotalHeight(this.queryEditorContainer), width: this.dimension.width });
                this.inputPatternExcludes.setWidth(this.dimension.width - 28 /* container margin */);
                this.inputPatternIncludes.setWidth(this.dimension.width - 28 /* container margin */);
            }
        }
        getInput() {
            return this._input;
        }
        setSearchConfig(config) {
            this.priorConfig = config;
            if (config.query !== undefined) {
                this.queryEditorWidget.setValue(config.query);
            }
            if (config.isCaseSensitive !== undefined) {
                this.queryEditorWidget.searchInput?.setCaseSensitive(config.isCaseSensitive);
            }
            if (config.isRegexp !== undefined) {
                this.queryEditorWidget.searchInput?.setRegex(config.isRegexp);
            }
            if (config.matchWholeWord !== undefined) {
                this.queryEditorWidget.searchInput?.setWholeWords(config.matchWholeWord);
            }
            if (config.contextLines !== undefined) {
                this.queryEditorWidget.setContextLines(config.contextLines);
            }
            if (config.filesToExclude !== undefined) {
                this.inputPatternExcludes.setValue(config.filesToExclude);
            }
            if (config.filesToInclude !== undefined) {
                this.inputPatternIncludes.setValue(config.filesToInclude);
            }
            if (config.onlyOpenEditors !== undefined) {
                this.inputPatternIncludes.setOnlySearchInOpenEditors(config.onlyOpenEditors);
            }
            if (config.useExcludeSettingsAndIgnoreFiles !== undefined) {
                this.inputPatternExcludes.setUseExcludesAndIgnoreFiles(config.useExcludeSettingsAndIgnoreFiles);
            }
            if (config.showIncludesExcludes !== undefined) {
                this.toggleIncludesExcludes(config.showIncludesExcludes);
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
            this.searchResultEditor.setModel(resultsModel);
            this.pauseSearching = true;
            this.toggleRunAgainMessage(!newInput.ongoingSearchOperation && resultsModel.getLineCount() === 1 && resultsModel.getValue() === '' && configurationModel.config.query !== '');
            this.setSearchConfig(configurationModel.config);
            this._register(configurationModel.onConfigDidUpdate(newConfig => {
                if (newConfig !== this.priorConfig) {
                    this.pauseSearching = true;
                    this.setSearchConfig(newConfig);
                    this.pauseSearching = false;
                }
            }));
            this.restoreViewState(context);
            if (!options?.preserveFocus) {
                this.focus();
            }
            this.pauseSearching = false;
            if (newInput.ongoingSearchOperation) {
                const existingConfig = this.readConfigFromWidget();
                newInput.ongoingSearchOperation.then(complete => {
                    this.onSearchComplete(complete, existingConfig, newInput);
                });
            }
        }
        toggleIncludesExcludes(_shouldShow) {
            const cls = 'expanded';
            const shouldShow = _shouldShow ?? !this.includesExcludesContainer.classList.contains(cls);
            if (shouldShow) {
                this.toggleQueryDetailsButton.setAttribute('aria-expanded', 'true');
                this.includesExcludesContainer.classList.add(cls);
            }
            else {
                this.toggleQueryDetailsButton.setAttribute('aria-expanded', 'false');
                this.includesExcludesContainer.classList.remove(cls);
            }
            this.showingIncludesExcludes = this.includesExcludesContainer.classList.contains(cls);
            this.reLayout();
        }
        toEditorViewStateResource(input) {
            if (input.typeId === constants_2.SearchEditorInputTypeId) {
                return input.modelUri;
            }
            return undefined;
        }
        computeEditorViewState(resource) {
            const control = this.getControl();
            const editorViewState = control.saveViewState();
            if (!editorViewState) {
                return undefined;
            }
            if (resource.toString() !== this.getInput()?.modelUri.toString()) {
                return undefined;
            }
            return { ...editorViewState, focused: this.searchResultEditor.hasWidgetFocus() ? 'editor' : 'input' };
        }
        tracksEditorViewState(input) {
            return input.typeId === constants_2.SearchEditorInputTypeId;
        }
        restoreViewState(context) {
            const viewState = this.loadEditorViewState(this.getInput(), context);
            if (viewState) {
                this.searchResultEditor.restoreViewState(viewState);
            }
        }
        getAriaLabel() {
            return this.getInput()?.getName() ?? (0, nls_1.localize)('searchEditor', "Search");
        }
    };
    exports.SearchEditor = SearchEditor;
    exports.SearchEditor = SearchEditor = SearchEditor_1 = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, themeService_1.IThemeService),
        __param(2, storage_1.IStorageService),
        __param(3, model_1.IModelService),
        __param(4, workspace_1.IWorkspaceContextService),
        __param(5, label_1.ILabelService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, contextView_1.IContextViewService),
        __param(8, commands_1.ICommandService),
        __param(9, opener_1.IOpenerService),
        __param(10, notification_1.INotificationService),
        __param(11, progress_1.IEditorProgressService),
        __param(12, textResourceConfiguration_1.ITextResourceConfigurationService),
        __param(13, editorGroupsService_1.IEditorGroupsService),
        __param(14, editorService_1.IEditorService),
        __param(15, configuration_1.IConfigurationService),
        __param(16, files_1.IFileService),
        __param(17, log_1.ILogService)
    ], SearchEditor);
    const searchEditorTextInputBorder = (0, colorRegistry_1.registerColor)('searchEditor.textInputBorder', { dark: colorRegistry_1.inputBorder, light: colorRegistry_1.inputBorder, hcDark: colorRegistry_1.inputBorder, hcLight: colorRegistry_1.inputBorder }, (0, nls_1.localize)('textInputBoxBorder', "Search editor text input box border."));
    function findNextRange(matchRanges, currentPosition) {
        for (const matchRange of matchRanges) {
            if (position_1.Position.isBefore(currentPosition, matchRange.getStartPosition())) {
                return matchRange;
            }
        }
        return matchRanges[0];
    }
    function findPrevRange(matchRanges, currentPosition) {
        for (let i = matchRanges.length - 1; i >= 0; i--) {
            const matchRange = matchRanges[i];
            if (position_1.Position.isBefore(matchRange.getStartPosition(), currentPosition)) {
                {
                    return matchRange;
                }
            }
        }
        return matchRanges[matchRanges.length - 1];
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoRWRpdG9yLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc2VhcmNoRWRpdG9yL2Jyb3dzZXIvc2VhcmNoRWRpdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUE4RGhHLE1BQU0saUJBQWlCLEdBQUcsOEJBQThCLENBQUM7SUFDekQsTUFBTSxlQUFlLEdBQUcsV0FBVyxDQUFDO0lBSTdCLElBQU0sWUFBWSxHQUFsQixNQUFNLFlBQWEsU0FBUSx1Q0FBNkM7O2lCQUM5RCxPQUFFLEdBQVcsMEJBQWMsQUFBekIsQ0FBMEI7aUJBRTVCLDRDQUF1QyxHQUFHLHVCQUF1QixBQUExQixDQUEyQjtRQUdsRixJQUFZLGtCQUFrQixLQUFLLE9BQU8sSUFBSSxDQUFDLGFBQWMsQ0FBQyxDQUFDLENBQUM7UUFvQmhFLFlBQ29CLGdCQUFtQyxFQUN2QyxZQUEyQixFQUN6QixjQUErQixFQUNqQyxZQUE0QyxFQUNqQyxjQUF5RCxFQUNwRSxZQUE0QyxFQUNwQyxvQkFBMkMsRUFDN0Msa0JBQXdELEVBQzVELGNBQWdELEVBQ2pELGFBQThDLEVBQ3hDLG1CQUEwRCxFQUN4RCxlQUF1QyxFQUM1QixtQkFBc0QsRUFDbkUsa0JBQXdDLEVBQzlDLGFBQTZCLEVBQ3RCLG9CQUFxRCxFQUM5RCxXQUF5QixFQUMxQixVQUF3QztZQUVyRCxLQUFLLENBQUMsY0FBWSxDQUFDLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxvQkFBb0IsRUFBRSxjQUFjLEVBQUUsbUJBQW1CLEVBQUUsWUFBWSxFQUFFLGFBQWEsRUFBRSxrQkFBa0IsRUFBRSxXQUFXLENBQUMsQ0FBQztZQWhCbEksaUJBQVksR0FBWixZQUFZLENBQWU7WUFDaEIsbUJBQWMsR0FBZCxjQUFjLENBQTBCO1lBQ25ELGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBRXJCLHVC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