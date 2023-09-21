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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/aria/aria", "vs/base/browser/ui/mouseCursor/mouseCursor", "vs/base/common/async", "vs/base/common/decorators", "vs/base/common/event", "vs/base/common/history", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/base/common/themables", "vs/base/common/uri", "vs/editor/browser/editorBrowser", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/widget/codeEditorWidget", "vs/editor/common/config/editorOptions", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/editor/common/languages", "vs/editor/common/services/languageFeatures", "vs/editor/common/services/model", "vs/editor/common/services/textResourceConfiguration", "vs/editor/contrib/suggest/browser/suggestController", "vs/nls", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/clipboard/common/clipboardService", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/history/browser/contextScopedHistoryWidget", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/keybinding/common/keybinding", "vs/platform/list/browser/listService", "vs/platform/log/common/log", "vs/platform/opener/common/opener", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/views", "vs/workbench/contrib/codeEditor/browser/simpleEditorOptions", "vs/workbench/contrib/debug/browser/debugActionViewItems", "vs/workbench/contrib/debug/browser/debugIcons", "vs/workbench/contrib/debug/browser/linkDetector", "vs/workbench/contrib/debug/browser/replFilter", "vs/workbench/contrib/debug/browser/replViewer", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/contrib/debug/common/replModel", "vs/workbench/services/editor/common/editorService", "vs/workbench/browser/actions/widgetNavigationCommands", "vs/css!./media/repl"], function (require, exports, dom, aria, mouseCursor_1, async_1, decorators_1, event_1, history_1, lifecycle_1, strings_1, themables_1, uri_1, editorBrowser_1, editorExtensions_1, codeEditorService_1, codeEditorWidget_1, editorOptions_1, range_1, editorContextKeys_1, languages_1, languageFeatures_1, model_1, textResourceConfiguration_1, suggestController_1, nls_1, menuEntryActionViewItem_1, actions_1, clipboardService_1, configuration_1, contextkey_1, contextView_1, contextScopedHistoryWidget_1, instantiation_1, serviceCollection_1, keybinding_1, listService_1, log_1, opener_1, storage_1, telemetry_1, colorRegistry_1, themeService_1, viewPane_1, views_1, simpleEditorOptions_1, debugActionViewItems_1, debugIcons_1, linkDetector_1, replFilter_1, replViewer_1, debug_1, debugModel_1, replModel_1, editorService_1, widgetNavigationCommands_1) {
    "use strict";
    var Repl_1, ReplOptions_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Repl = void 0;
    const $ = dom.$;
    const HISTORY_STORAGE_KEY = 'debug.repl.history';
    const FILTER_HISTORY_STORAGE_KEY = 'debug.repl.filterHistory';
    const FILTER_VALUE_STORAGE_KEY = 'debug.repl.filterValue';
    const DECORATION_KEY = 'replinputdecoration';
    function revealLastElement(tree) {
        tree.scrollTop = tree.scrollHeight - tree.renderHeight;
        // tree.scrollTop = 1e6;
    }
    const sessionsToIgnore = new Set();
    const identityProvider = { getId: (element) => element.getId() };
    let Repl = class Repl extends viewPane_1.FilterViewPane {
        static { Repl_1 = this; }
        static { this.REFRESH_DELAY = 50; } // delay in ms to refresh the repl for new elements to show
        static { this.URI = uri_1.URI.parse(`${debug_1.DEBUG_SCHEME}:replinput`); }
        constructor(options, debugService, instantiationService, storageService, themeService, modelService, contextKeyService, codeEditorService, viewDescriptorService, contextMenuService, configurationService, textResourcePropertiesService, editorService, keybindingService, openerService, telemetryService, menuService, languageFeaturesService, logService) {
            const filterText = storageService.get(FILTER_VALUE_STORAGE_KEY, 1 /* StorageScope.WORKSPACE */, '');
            super({
                ...options,
                filterOptions: {
                    placeholder: (0, nls_1.localize)({ key: 'workbench.debug.filter.placeholder', comment: ['Text in the brackets after e.g. is not localizable'] }, "Filter (e.g. text, !exclude)"),
                    text: filterText,
                    history: JSON.parse(storageService.get(FILTER_HISTORY_STORAGE_KEY, 1 /* StorageScope.WORKSPACE */, '[]')),
                }
            }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.debugService = debugService;
            this.storageService = storageService;
            this.modelService = modelService;
            this.textResourcePropertiesService = textResourcePropertiesService;
            this.editorService = editorService;
            this.languageFeaturesService = languageFeaturesService;
            this.logService = logService;
            this.previousTreeScrollHeight = 0;
            this.replInputLineCount = 1;
            this.modelChangeListener = lifecycle_1.Disposable.None;
            this.menu = menuService.createMenu(actions_1.MenuId.DebugConsoleContext, contextKeyService);
            this._register(this.menu);
            this.history = new history_1.HistoryNavigator(JSON.parse(this.storageService.get(HISTORY_STORAGE_KEY, 1 /* StorageScope.WORKSPACE */, '[]')), 50);
            this.filter = new replFilter_1.ReplFilter();
            this.filter.filterQuery = filterText;
            this.multiSessionRepl = debug_1.CONTEXT_MULTI_SESSION_REPL.bindTo(contextKeyService);
            this.replOptions = this._register(this.instantiationService.createInstance(ReplOptions, this.id, () => this.getBackgroundColor()));
            this._register(this.replOptions.onDidChange(() => this.onDidStyleChange()));
            codeEditorService.registerDecorationType('repl-decoration', DECORATION_KEY, {});
            this.multiSessionRepl.set(this.isMultiSessionView);
            this.registerListeners();
        }
        registerListeners() {
            if (this.debugService.getViewModel().focusedSession) {
                this.onDidFocusSession(this.debugService.getViewModel().focusedSession);
            }
            this._register(this.debugService.getViewModel().onDidFocusSession(async (session) => this.onDidFocusSession(session)));
            this._register(this.debugService.getViewModel().onDidEvaluateLazyExpression(async (e) => {
                if (e instanceof debugModel_1.Variable && this.tree?.hasNode(e)) {
                    await this.tree.updateChildren(e, false, true);
                    await this.tree.expand(e);
                }
            }));
            this._register(this.debugService.onWillNewSession(async (newSession) => {
                // Need to listen to output events for sessions which are not yet fully initialised
                const input = this.tree?.getInput();
                if (!input || input.state === 0 /* State.Inactive */) {
                    await this.selectSession(newSession);
                }
                this.multiSessionRepl.set(this.isMultiSessionView);
            }));
            this._register(this.debugService.onDidEndSession(async (session) => {
                // Update view, since orphaned sessions might now be separate
                await Promise.resolve(); // allow other listeners to go first, so sessions can update parents
                this.multiSessionRepl.set(this.isMultiSessionView);
            }));
            this._register(this.themeService.onDidColorThemeChange(() => {
                this.refreshReplElements(false);
                if (this.isVisible()) {
                    this.updateInputDecoration();
                }
            }));
            this._register(this.onDidChangeBodyVisibility(visible => {
                if (visible) {
                    if (!this.model) {
                        this.model = this.modelService.getModel(Repl_1.URI) || this.modelService.createModel('', null, Repl_1.URI, true);
                    }
                    this.setMode();
                    this.replInput.setModel(this.model);
                    this.updateInputDecoration();
                    this.refreshReplElements(true);
                }
            }));
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('debug.console.wordWrap') && this.tree) {
                    this.tree.dispose();
                    this.treeContainer.innerText = '';
                    dom.clearNode(this.treeContainer);
                    this.createReplTree();
                }
                if (e.affectsConfiguration('debug.console.acceptSuggestionOnEnter')) {
                    const config = this.configurationService.getValue('debug');
                    this.replInput.updateOptions({
                        acceptSuggestionOnEnter: config.console.acceptSuggestionOnEnter === 'on' ? 'on' : 'off'
                    });
                }
            }));
            this._register(this.editorService.onDidActiveEditorChange(() => {
                this.setMode();
            }));
            this._register(this.filterWidget.onDidChangeFilterText(() => {
                this.filter.filterQuery = this.filterWidget.getFilterText();
                if (this.tree) {
                    this.tree.refilter();
                    revealLastElement(this.tree);
                }
            }));
        }
        async onDidFocusSession(session) {
            if (session) {
                sessionsToIgnore.delete(session);
                this.completionItemProvider?.dispose();
                if (session.capabilities.supportsCompletionsRequest) {
                    this.completionItemProvider = this.languageFeaturesService.completionProvider.register({ scheme: debug_1.DEBUG_SCHEME, pattern: '**/replinput', hasAccessToAllModels: true }, {
                        _debugDisplayName: 'debugConsole',
                        triggerCharacters: session.capabilities.completionTriggerCharacters || ['.'],
                        provideCompletionItems: async (_, position, _context, token) => {
                            // Disable history navigation because up and down are used to navigate through the suggest widget
                            this.setHistoryNavigationEnablement(false);
                            const model = this.replInput.getModel();
                            if (model) {
                                const word = model.getWordAtPosition(position);
                                const overwriteBefore = word ? word.word.length : 0;
                                const text = model.getValue();
                                const focusedStackFrame = this.debugService.getViewModel().focusedStackFrame;
                                const frameId = focusedStackFrame ? focusedStackFrame.frameId : undefined;
                                const response = await session.completions(frameId, focusedStackFrame?.thread.threadId || 0, text, position, overwriteBefore, token);
                                const suggestions = [];
                                const computeRange = (length) => range_1.Range.fromPositions(position.delta(0, -length), position);
                                if (response && response.body && response.body.targets) {
                                    response.body.targets.forEach(item => {
                                        if (item && item.label) {
                                            let insertTextRules = undefined;
                                            let insertText = item.text || item.label;
                                            if (typeof item.selectionStart === 'number') {
                                                // If a debug completion item sets a selection we need to use snippets to make sure the selection is selected #90974
                                                insertTextRules = 4 /* CompletionItemInsertTextRule.InsertAsSnippet */;
                                                const selectionLength = typeof item.selectionLength === 'number' ? item.selectionLength : 0;
                                                const placeholder = selectionLength > 0 ? '${1:' + insertText.substring(item.selectionStart, item.selectionStart + selectionLength) + '}$0' : '$0';
                                                insertText = insertText.substring(0, item.selectionStart) + placeholder + insertText.substring(item.selectionStart + selectionLength);
                                            }
                                            suggestions.push({
                                                label: item.label,
                                                insertText,
                                                detail: item.detail,
                                                kind: languages_1.CompletionItemKinds.fromString(item.type || 'property'),
                                                filterText: (item.start && item.length) ? text.substring(item.start, item.start + item.length).concat(item.label) : undefined,
                                                range: computeRange(item.length || overwriteBefore),
                                                sortText: item.sortText,
                                                insertTextRules
                                            });
                                        }
                                    });
                                }
                                if (this.configurationService.getValue('debug').console.historySuggestions) {
                                    const history = this.history.getHistory();
                                    const idxLength = String(history.length).length;
                                    history.forEach((h, i) => suggestions.push({
                                        label: h,
                                        insertText: h,
                                        kind: 18 /* CompletionItemKind.Text */,
                                        range: computeRange(h.length),
                                        sortText: 'ZZZ' + String(history.length - i).padStart(idxLength, '0')
                                    }));
                                }
                                return { suggestions };
                            }
                            return Promise.resolve({ suggestions: [] });
                        }
                    });
                }
            }
            await this.selectSession();
        }
        getFilterStats() {
            // This could be called before the tree is created when setting this.filterState.filterText value
            return {
                total: this.tree?.getNode().children.length ?? 0,
                filtered: this.tree?.getNode().children.filter(c => c.visible).length ?? 0
            };
        }
        get isReadonly() {
            // Do not allow to edit inactive sessions
            const session = this.tree?.getInput();
            if (session && session.state !== 0 /* State.Inactive */) {
                return false;
            }
            return true;
        }
        showPreviousValue() {
            if (!this.isReadonly) {
                this.navigateHistory(true);
            }
        }
        showNextValue() {
            if (!this.isReadonly) {
                this.navigateHistory(false);
            }
        }
        focusFilter() {
            this.filterWidget.focus();
        }
        setMode() {
            if (!this.isVisible()) {
                return;
            }
            const activeEditorControl = this.editorService.activeTextEditorControl;
            if ((0, editorBrowser_1.isCodeEditor)(activeEditorControl)) {
                this.modelChangeListener.dispose();
                this.modelChangeListener = activeEditorControl.onDidChangeModelLanguage(() => this.setMode());
                if (this.model && activeEditorControl.hasModel()) {
                    this.model.setLanguage(activeEditorControl.getModel().getLanguageId());
                }
            }
        }
        onDidStyleChange() {
            if (this.styleElement) {
                this.replInput.updateOptions({
                    fontSize: this.replOptions.replConfiguration.fontSize,
                    lineHeight: this.replOptions.replConfiguration.lineHeight,
                    fontFamily: this.replOptions.replConfiguration.fontFamily === 'default' ? editorOptions_1.EDITOR_FONT_DEFAULTS.fontFamily : this.replOptions.replConfiguration.fontFamily
                });
                const replInputLineHeight = this.replInput.getOption(66 /* EditorOption.lineHeight */);
                // Set the font size, font family, line height and align the twistie to be centered, and input theme color
                this.styleElement.textContent = `
				.repl .repl-input-wrapper .repl-input-chevron {
					line-height: ${replInputLineHeight}px
				}

				.repl .repl-input-wrapper .monaco-editor .lines-content {
					background-color: ${this.replOptions.replConfiguration.backgroundColor};
				}
			`;
                const cssFontFamily = this.replOptions.replConfiguration.fontFamily === 'default' ? 'var(--monaco-monospace-font)' : this.replOptions.replConfiguration.fontFamily;
                this.container.style.setProperty(`--vscode-repl-font-family`, cssFontFamily);
                this.container.style.setProperty(`--vscode-repl-font-size`, `${this.replOptions.replConfiguration.fontSize}px`);
                this.container.style.setProperty(`--vscode-repl-font-size-for-twistie`, `${this.replOptions.replConfiguration.fontSizeForTwistie}px`);
                this.container.style.setProperty(`--vscode-repl-line-height`, this.replOptions.replConfiguration.cssLineHeight);
                this.tree?.rerender();
                if (this.bodyContentDimension) {
                    this.layoutBodyContent(this.bodyContentDimension.height, this.bodyContentDimension.width);
                }
            }
        }
        navigateHistory(previous) {
            const historyInput = (previous ?
                (this.history.previous() ?? this.history.first()) : this.history.next())
                ?? '';
            this.replInput.setValue(historyInput);
            aria.status(historyInput);
            // always leave cursor at the end.
            this.replInput.setPosition({ lineNumber: 1, column: historyInput.length + 1 });
            this.setHistoryNavigationEnablement(true);
        }
        async selectSession(session) {
            const treeInput = this.tree?.getInput();
            if (!session) {
                const focusedSession = this.debugService.getViewModel().focusedSession;
                // If there is a focusedSession focus on that one, otherwise just show any other not ignored session
                if (focusedSession) {
                    session = focusedSession;
                }
                else if (!treeInput || sessionsToIgnore.has(treeInput)) {
                    session = this.debugService.getModel().getSessions(true).find(s => !sessionsToIgnore.has(s));
                }
            }
            if (session) {
                this.replElementsChangeListener?.dispose();
                this.replElementsChangeListener = session.onDidChangeReplElements(() => {
                    this.refreshReplElements(session.getReplElements().length === 0);
                });
                if (this.tree && treeInput !== session) {
                    try {
                        await this.tree.setInput(session);
                    }
                    catch (err) {
                        // Ignore error because this may happen multiple times while refreshing,
                        // then changing the root may fail. Log to help with debugging if needed.
                        this.logService.error(err);
                    }
                    revealLastElement(this.tree);
                }
            }
            this.replInput?.updateOptions({ readOnly: this.isReadonly });
            this.updateInputDecoration();
        }
        async clearRepl() {
            const session = this.tree?.getInput();
            if (session) {
                session.removeReplExpressions();
                if (session.state === 0 /* State.Inactive */) {
                    // Ignore inactive sessions which got cleared - so they are not shown any more
                    sessionsToIgnore.add(session);
                    await this.selectSession();
                    this.multiSessionRepl.set(this.isMultiSessionView);
                }
            }
            this.replInput.focus();
        }
        acceptReplInput() {
            const session = this.tree?.getInput();
            if (session && !this.isReadonly) {
                session.addReplExpression(this.debugService.getViewModel().focusedStackFrame, this.replInput.getValue());
                revealLastElement(this.tree);
                this.history.add(this.replInput.getValue());
                this.replInput.setValue('');
                const shouldRelayout = this.replInputLineCount > 1;
                this.replInputLineCount = 1;
                if (shouldRelayout && this.bodyContentDimension) {
                    // Trigger a layout to shrink a potential multi line input
                    this.layoutBodyContent(this.bodyContentDimension.height, this.bodyContentDimension.width);
                }
            }
        }
        getVisibleContent() {
            let text = '';
            if (this.model && this.tree) {
                const lineDelimiter = this.textResourcePropertiesService.getEOL(this.model.uri);
                const traverseAndAppend = (node) => {
                    node.children.forEach(child => {
                        if (child.visible) {
                            text += child.element.toString().trimRight() + lineDelimiter;
                            if (!child.collapsed && child.children.length) {
                                traverseAndAppend(child);
                            }
                        }
                    });
                };
                traverseAndAppend(this.tree.getNode());
            }
            return (0, strings_1.removeAnsiEscapeCodes)(text);
        }
        layoutBodyContent(height, width) {
            this.bodyContentDimension = new dom.Dimension(width, height);
            const replInputHeight = Math.min(this.replInput.getContentHeight(), height);
            if (this.tree) {
                const lastElementVisible = this.tree.scrollTop + this.tree.renderHeight >= this.tree.scrollHeight;
                const treeHeight = height - replInputHeight;
                this.tree.getHTMLElement().style.height = `${treeHeight}px`;
                this.tree.layout(treeHeight, width);
                if (lastElementVisible) {
                    revealLastElement(this.tree);
                }
            }
            this.replInputContainer.style.height = `${replInputHeight}px`;
            this.replInput.layout({ width: width - 30, height: replInputHeight });
        }
        collapseAll() {
            this.tree?.collapseAll();
        }
        getReplInput() {
            return this.replInput;
        }
        focus() {
            setTimeout(() => this.replInput.focus(), 0);
        }
        getActionViewItem(action) {
            if (action.id === selectReplCommandId) {
                const session = (this.tree ? this.tree.getInput() : undefined) ?? this.debugService.getViewModel().focusedSession;
                return this.instantiationService.createInstance(SelectReplActionViewItem, action, session);
            }
            return super.getActionViewItem(action);
        }
        get isMultiSessionView() {
            return this.debugService.getModel().getSessions(true).filter(s => s.hasSeparateRepl() && !sessionsToIgnore.has(s)).length > 1;
        }
        // --- Cached locals
        get refreshScheduler() {
            const autoExpanded = new Set();
            return new async_1.RunOnceScheduler(async () => {
                if (!this.tree) {
                    return;
                }
                if (!this.tree.getInput()) {
                    return;
                }
                await this.tree.updateChildren(undefined, true, false, { diffIdentityProvider: identityProvider });
                const session = this.tree.getInput();
                if (session) {
                    // Automatically expand repl group elements when specified
                    const autoExpandElements = async (elements) => {
                        for (const element of elements) {
                            if (element instanceof replModel_1.ReplGroup) {
                                if (element.autoExpand && !autoExpanded.has(element.getId())) {
                                    autoExpanded.add(element.getId());
                                    await this.tree.expand(element);
                                }
                                if (!this.tree.isCollapsed(element)) {
                                    // Repl groups can have children which are repl groups thus we might need to expand those as well
                                    await autoExpandElements(element.getChildren());
                                }
                            }
                        }
                    };
                    await autoExpandElements(session.getReplElements());
                }
                // Repl elements count changed, need to update filter stats on the badge
                const { total, filtered } = this.getFilterStats();
                this.filterWidget.updateBadge(total === filtered || total === 0 ? undefined : (0, nls_1.localize)('showing filtered repl lines', "Showing {0} of {1}", filtered, total));
            }, Repl_1.REFRESH_DELAY);
        }
        // --- Creation
        render() {
            super.render();
            this._register((0, widgetNavigationCommands_1.registerNavigableContainer)({
                focusNotifiers: [this, this.filterWidget],
                focusNextWidget: () => {
                    if (this.filterWidget.hasFocus()) {
                        this.tree?.domFocus();
                    }
                    else if (this.tree?.getHTMLElement() === document.activeElement) {
                        this.focus();
                    }
                },
                focusPreviousWidget: () => {
                    if (this.replInput.hasTextFocus()) {
                        this.tree?.domFocus();
                    }
                    else if (this.tree?.getHTMLElement() === document.activeElement) {
                        this.focusFilter();
                    }
                }
            }));
        }
        renderBody(parent) {
            super.renderBody(parent);
            this.container = dom.append(parent, $('.repl'));
            this.treeContainer = dom.append(this.container, $(`.repl-tree.${mouseCursor_1.MOUSE_CURSOR_TEXT_CSS_CLASS_NAME}`));
            this.createReplInput(this.container);
            this.createReplTree();
        }
        createReplTree() {
            this.replDelegate = new replViewer_1.ReplDelegate(this.configurationService, this.replOptions);
            const wordWrap = this.configurationService.getValue('debug').console.wordWrap;
            this.treeContainer.classList.toggle('word-wrap', wordWrap);
            const linkDetector = this.instantiationService.createInstance(linkDetector_1.LinkDetector);
            const tree = this.tree = this.instantiationService.createInstance(listService_1.WorkbenchAsyncDataTree, 'DebugRepl', this.treeContainer, this.replDelegate, [
                this.instantiationService.createInstance(replViewer_1.ReplVariablesRenderer, linkDetector),
                this.instantiationService.createInstance(replViewer_1.ReplOutputElementRenderer, linkDetector),
                new replViewer_1.ReplEvaluationInputsRenderer(),
                this.instantiationService.createInstance(replViewer_1.ReplGroupRenderer, linkDetector),
                new replViewer_1.ReplEvaluationResultsRenderer(linkDetector),
                new replViewer_1.ReplRawObjectsRenderer(linkDetector),
            ], 
            // https://github.com/microsoft/TypeScript/issues/32526
            new replViewer_1.ReplDataSource(), {
                filter: this.filter,
                accessibilityProvider: new replViewer_1.ReplAccessibilityProvider(),
                identityProvider,
                mouseSupport: false,
                findWidgetEnabled: false,
                keyboardNavigationLabelProvider: { getKeyboardNavigationLabel: (e) => e.toString(true) },
                horizontalScrolling: !wordWrap,
                setRowLineHeight: false,
                supportDynamicHeights: wordWrap,
                overrideStyles: {
                    listBackground: this.getBackgroundColor()
                }
            });
            this._register(tree.onDidChangeContentHeight(() => {
                if (tree.scrollHeight !== this.previousTreeScrollHeight) {
                    // Due to rounding, the scrollTop + renderHeight will not exactly match the scrollHeight.
                    // Consider the tree to be scrolled all the way down if it is within 2px of the bottom.
                    const lastElementWasVisible = tree.scrollTop + tree.renderHeight >= this.previousTreeScrollHeight - 2;
                    if (lastElementWasVisible) {
                        setTimeout(() => {
                            // Can't set scrollTop during this event listener, the list might overwrite the change
                            revealLastElement(tree);
                        }, 0);
                    }
                }
                this.previousTreeScrollHeight = tree.scrollHeight;
            }));
            this._register(tree.onContextMenu(e => this.onContextMenu(e)));
            let lastSelectedString;
            this._register(tree.onMouseClick(() => {
                const selection = window.getSelection();
                if (!selection || selection.type !== 'Range' || lastSelectedString === selection.toString()) {
                    // only focus the input if the user is not currently selecting.
                    this.replInput.focus();
                }
                lastSelectedString = selection ? selection.toString() : '';
            }));
            // Make sure to select the session if debugging is already active
            this.selectSession();
            this.styleElement = dom.createStyleSheet(this.container);
            this.onDidStyleChange();
        }
        createReplInput(container) {
            this.replInputContainer = dom.append(container, $('.repl-input-wrapper'));
            dom.append(this.replInputContainer, $('.repl-input-chevron' + themables_1.ThemeIcon.asCSSSelector(debugIcons_1.debugConsoleEvaluationPrompt)));
            const { historyNavigationBackwardsEnablement, historyNavigationForwardsEnablement } = this._register((0, contextScopedHistoryWidget_1.registerAndCreateHistoryNavigationContext)(this.scopedContextKeyService, this));
            this.setHistoryNavigationEnablement = enabled => {
                historyNavigationBackwardsEnablement.set(enabled);
                historyNavigationForwardsEnablement.set(enabled);
            };
            debug_1.CONTEXT_IN_DEBUG_REPL.bindTo(this.scopedContextKeyService).set(true);
            this.scopedInstantiationService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, this.scopedContextKeyService]));
            const options = (0, simpleEditorOptions_1.getSimpleEditorOptions)(this.configurationService);
            options.readOnly = true;
            options.suggest = { showStatusBar: true };
            const config = this.configurationService.getValue('debug');
            options.acceptSuggestionOnEnter = config.console.acceptSuggestionOnEnter === 'on' ? 'on' : 'off';
            options.ariaLabel = (0, nls_1.localize)('debugConsole', "Debug Console");
            this.replInput = this.scopedInstantiationService.createInstance(codeEditorWidget_1.CodeEditorWidget, this.replInputContainer, options, (0, simpleEditorOptions_1.getSimpleCodeEditorWidgetOptions)());
            this._register(this.replInput.onDidChangeModelContent(() => {
                const model = this.replInput.getModel();
                this.setHistoryNavigationEnablement(!!model && model.getValue() === '');
                const lineCount = model ? Math.min(10, model.getLineCount()) : 1;
                if (lineCount !== this.replInputLineCount) {
                    this.replInputLineCount = lineCount;
                    if (this.bodyContentDimension) {
                        this.layoutBodyContent(this.bodyContentDimension.height, this.bodyContentDimension.width);
                    }
                }
            }));
            // We add the input decoration only when the focus is in the input #61126
            this._register(this.replInput.onDidFocusEditorText(() => this.updateInputDecoration()));
            this._register(this.replInput.onDidBlurEditorText(() => this.updateInputDecoration()));
            this._register(dom.addStandardDisposableListener(this.replInputContainer, dom.EventType.FOCUS, () => this.replInputContainer.classList.add('synthetic-focus')));
            this._register(dom.addStandardDisposableListener(this.replInputContainer, dom.EventType.BLUR, () => this.replInputContainer.classList.remove('synthetic-focus')));
        }
        onContextMenu(e) {
            const actions = [];
            (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(this.menu, { arg: e.element, shouldForwardArgs: false }, actions);
            this.contextMenuService.showContextMenu({
                getAnchor: () => e.anchor,
                getActions: () => actions,
                getActionsContext: () => e.element
            });
        }
        // --- Update
        refreshReplElements(noDelay) {
            if (this.tree && this.isVisible()) {
                if (this.refreshScheduler.isScheduled()) {
                    return;
                }
                this.refreshScheduler.schedule(noDelay ? 0 : undefined);
            }
        }
        updateInputDecoration() {
            if (!this.replInput) {
                return;
            }
            const decorations = [];
            if (this.isReadonly && this.replInput.hasTextFocus() && !this.replInput.getValue()) {
                const transparentForeground = (0, colorRegistry_1.resolveColorValue)(colorRegistry_1.editorForeground, this.themeService.getColorTheme())?.transparent(0.4);
                decorations.push({
                    range: {
                        startLineNumber: 0,
                        endLineNumber: 0,
                        startColumn: 0,
                        endColumn: 1
                    },
                    renderOptions: {
                        after: {
                            contentText: (0, nls_1.localize)('startDebugFirst', "Please start a debug session to evaluate expressions"),
                            color: transparentForeground ? transparentForeground.toString() : undefined
                        }
                    }
                });
            }
            this.replInput.setDecorationsByType('repl-decoration', DECORATION_KEY, decorations);
        }
        saveState() {
            const replHistory = this.history.getHistory();
            if (replHistory.length) {
                this.storageService.store(HISTORY_STORAGE_KEY, JSON.stringify(replHistory), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.storageService.remove(HISTORY_STORAGE_KEY, 1 /* StorageScope.WORKSPACE */);
            }
            const filterHistory = this.filterWidget.getHistory();
            if (filterHistory.length) {
                this.storageService.store(FILTER_HISTORY_STORAGE_KEY, JSON.stringify(filterHistory), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.storageService.remove(FILTER_HISTORY_STORAGE_KEY, 1 /* StorageScope.WORKSPACE */);
            }
            const filterValue = this.filterWidget.getFilterText();
            if (filterValue) {
                this.storageService.store(FILTER_VALUE_STORAGE_KEY, filterValue, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.storageService.remove(FILTER_VALUE_STORAGE_KEY, 1 /* StorageScope.WORKSPACE */);
            }
            super.saveState();
        }
        dispose() {
            this.replInput?.dispose(); // Disposed before rendered? #174558
            this.replElementsChangeListener?.dispose();
            this.refreshScheduler.dispose();
            this.modelChangeListener.dispose();
            super.dispose();
        }
    };
    exports.Repl = Repl;
    __decorate([
        decorators_1.memoize
    ], Repl.prototype, "refreshScheduler", null);
    exports.Repl = Repl = Repl_1 = __decorate([
        __param(1, debug_1.IDebugService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, storage_1.IStorageService),
        __param(4, themeService_1.IThemeService),
        __param(5, model_1.IModelService),
        __param(6, contextkey_1.IContextKeyService),
        __param(7, codeEditorService_1.ICodeEditorService),
        __param(8, views_1.IViewDescriptorService),
        __param(9, contextView_1.IContextMenuService),
        __param(10, configuration_1.IConfigurationService),
        __param(11, textResourceConfiguration_1.ITextResourcePropertiesService),
        __param(12, editorService_1.IEditorService),
        __param(13, keybinding_1.IKeybindingService),
        __param(14, opener_1.IOpenerService),
        __param(15, telemetry_1.ITelemetryService),
        __param(16, actions_1.IMenuService),
        __param(17, languageFeatures_1.ILanguageFeaturesService),
        __param(18, log_1.ILogService)
    ], Repl);
    let ReplOptions = class ReplOptions extends lifecycle_1.Disposable {
        static { ReplOptions_1 = this; }
        static { this.lineHeightEm = 1.4; }
        get replConfiguration() {
            return this._replConfig;
        }
        constructor(viewId, backgroundColorDelegate, configurationService, themeService, viewDescriptorService) {
            super();
            this.backgroundColorDelegate = backgroundColorDelegate;
            this.configurationService = configurationService;
            this.themeService = themeService;
            this.viewDescriptorService = viewDescriptorService;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._register(this.themeService.onDidColorThemeChange(e => this.update()));
            this._register(this.viewDescriptorService.onDidChangeLocation(e => {
                if (e.views.some(v => v.id === viewId)) {
                    this.update();
                }
            }));
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('debug.console.lineHeight') || e.affectsConfiguration('debug.console.fontSize') || e.affectsConfiguration('debug.console.fontFamily')) {
                    this.update();
                }
            }));
            this.update();
        }
        update() {
            const debugConsole = this.configurationService.getValue('debug').console;
            this._replConfig = {
                fontSize: debugConsole.fontSize,
                fontFamily: debugConsole.fontFamily,
                lineHeight: debugConsole.lineHeight ? debugConsole.lineHeight : ReplOptions_1.lineHeightEm * debugConsole.fontSize,
                cssLineHeight: debugConsole.lineHeight ? `${debugConsole.lineHeight}px` : `${ReplOptions_1.lineHeightEm}em`,
                backgroundColor: this.themeService.getColorTheme().getColor(this.backgroundColorDelegate()),
                fontSizeForTwistie: debugConsole.fontSize * ReplOptions_1.lineHeightEm / 2 - 8
            };
            this._onDidChange.fire();
        }
    };
    ReplOptions = ReplOptions_1 = __decorate([
        __param(2, configuration_1.IConfigurationService),
        __param(3, themeService_1.IThemeService),
        __param(4, views_1.IViewDescriptorService)
    ], ReplOptions);
    // Repl actions and commands
    class AcceptReplInputAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'repl.action.acceptInput',
                label: (0, nls_1.localize)({ key: 'actions.repl.acceptInput', comment: ['Apply input from the debug console input box'] }, "REPL Accept Input"),
                alias: 'REPL Accept Input',
                precondition: debug_1.CONTEXT_IN_DEBUG_REPL,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 3 /* KeyCode.Enter */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor, editor) {
            suggestController_1.SuggestController.get(editor)?.cancelSuggestWidget();
            const repl = getReplView(accessor.get(views_1.IViewsService));
            repl?.acceptReplInput();
        }
    }
    class FilterReplAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'repl.action.filter',
                label: (0, nls_1.localize)('repl.action.filter', "REPL Focus Content to Filter"),
                alias: 'REPL Filter',
                precondition: debug_1.CONTEXT_IN_DEBUG_REPL,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 36 /* KeyCode.KeyF */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor, editor) {
            const repl = getReplView(accessor.get(views_1.IViewsService));
            repl?.focusFilter();
        }
    }
    class ReplCopyAllAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'repl.action.copyAll',
                label: (0, nls_1.localize)('actions.repl.copyAll', "Debug: Console Copy All"),
                alias: 'Debug Console Copy All',
                precondition: debug_1.CONTEXT_IN_DEBUG_REPL,
            });
        }
        run(accessor, editor) {
            const clipboardService = accessor.get(clipboardService_1.IClipboardService);
            const repl = getReplView(accessor.get(views_1.IViewsService));
            if (repl) {
                return clipboardService.writeText(repl.getVisibleContent());
            }
        }
    }
    (0, editorExtensions_1.registerEditorAction)(AcceptReplInputAction);
    (0, editorExtensions_1.registerEditorAction)(ReplCopyAllAction);
    (0, editorExtensions_1.registerEditorAction)(FilterReplAction);
    class SelectReplActionViewItem extends debugActionViewItems_1.FocusSessionActionViewItem {
        getSessions() {
            return this.debugService.getModel().getSessions(true).filter(s => s.hasSeparateRepl() && !sessionsToIgnore.has(s));
        }
        mapFocusedSessionToSelected(focusedSession) {
            while (focusedSession.parentSession && !focusedSession.hasSeparateRepl()) {
                focusedSession = focusedSession.parentSession;
            }
            return focusedSession;
        }
    }
    function getReplView(viewsService) {
        return viewsService.getActiveViewWithId(debug_1.REPL_VIEW_ID) ?? undefined;
    }
    const selectReplCommandId = 'workbench.action.debug.selectRepl';
    (0, actions_1.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: selectReplCommandId,
                viewId: debug_1.REPL_VIEW_ID,
                title: (0, nls_1.localize)('selectRepl', "Select Debug Console"),
                f1: false,
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', debug_1.REPL_VIEW_ID), debug_1.CONTEXT_MULTI_SESSION_REPL),
                    order: 20
                }
            });
        }
        async runInView(accessor, view, session) {
            const debugService = accessor.get(debug_1.IDebugService);
            // If session is already the focused session we need to manualy update the tree since view model will not send a focused change event
            if (session && session.state !== 0 /* State.Inactive */ && session !== debugService.getViewModel().focusedSession) {
                if (session.state !== 2 /* State.Stopped */) {
                    // Focus child session instead if it is stopped #112595
                    const stopppedChildSession = debugService.getModel().getSessions().find(s => s.parentSession === session && s.state === 2 /* State.Stopped */);
                    if (stopppedChildSession) {
                        session = stopppedChildSession;
                    }
                }
                await debugService.focusStackFrame(undefined, undefined, session, { explicit: true });
            }
            // Need to select the session in the view since the focussed session might not have changed
            await view.selectSession(session);
        }
    });
    (0, actions_1.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: 'workbench.debug.panel.action.clearReplAction',
                viewId: debug_1.REPL_VIEW_ID,
                title: { value: (0, nls_1.localize)('clearRepl', "Clear Console"), original: 'Clear Console' },
                f1: true,
                icon: debugIcons_1.debugConsoleClearAll,
                menu: [{
                        id: actions_1.MenuId.ViewTitle,
                        group: 'navigation',
                        when: contextkey_1.ContextKeyExpr.equals('view', debug_1.REPL_VIEW_ID),
                        order: 30
                    }, {
                        id: actions_1.MenuId.DebugConsoleContext,
                        group: 'z_commands',
                        order: 20
                    }]
            });
        }
        runInView(_accessor, view) {
            view.clearRepl();
            aria.status((0, nls_1.localize)('debugConsoleCleared', "Debug console was cleared"));
        }
    });
    (0, actions_1.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: 'debug.collapseRepl',
                title: (0, nls_1.localize)('collapse', "Collapse All"),
                viewId: debug_1.REPL_VIEW_ID,
                menu: {
                    id: actions_1.MenuId.DebugConsoleContext,
                    group: 'z_commands',
                    order: 10
                }
            });
        }
        runInView(_accessor, view) {
            view.collapseAll();
            view.focus();
        }
    });
    (0, actions_1.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: 'debug.replPaste',
                title: (0, nls_1.localize)('paste', "Paste"),
                viewId: debug_1.REPL_VIEW_ID,
                precondition: debug_1.CONTEXT_DEBUG_STATE.notEqualsTo((0, debug_1.getStateLabel)(0 /* State.Inactive */)),
                menu: {
                    id: actions_1.MenuId.DebugConsoleContext,
                    group: '2_cutcopypaste',
                    order: 30
                }
            });
        }
        async runInView(accessor, view) {
            const clipboardService = accessor.get(clipboardService_1.IClipboardService);
            const clipboardText = await clipboardService.readText();
            if (clipboardText) {
                const replInput = view.getReplInput();
                replInput.setValue(replInput.getValue().concat(clipboardText));
                view.focus();
                const model = replInput.getModel();
                const lineNumber = model ? model.getLineCount() : 0;
                const column = model?.getLineMaxColumn(lineNumber);
                if (typeof lineNumber === 'number' && typeof column === 'number') {
                    replInput.setPosition({ lineNumber, column });
                }
            }
        }
    });
    (0, actions_1.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: 'workbench.debug.action.copyAll',
                title: (0, nls_1.localize)('copyAll', "Copy All"),
                viewId: debug_1.REPL_VIEW_ID,
                menu: {
                    id: actions_1.MenuId.DebugConsoleContext,
                    group: '2_cutcopypaste',
                    order: 20
                }
            });
        }
        async runInView(accessor, view) {
            const clipboardService = accessor.get(clipboardService_1.IClipboardService);
            await clipboardService.writeText(view.getVisibleContent());
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'debug.replCopy',
                title: (0, nls_1.localize)('copy', "Copy"),
                menu: {
                    id: actions_1.MenuId.DebugConsoleContext,
                    group: '2_cutcopypaste',
                    order: 10
                }
            });
        }
        async run(accessor, element) {
            const clipboardService = accessor.get(clipboardService_1.IClipboardService);
            const debugService = accessor.get(debug_1.IDebugService);
            const nativeSelection = window.getSelection();
            const selectedText = nativeSelection?.toString();
            if (selectedText && selectedText.length > 0) {
                return clipboardService.writeText(selectedText);
            }
            else if (element) {
                return clipboardService.writeText(await this.tryEvaluateAndCopy(debugService, element) || element.toString());
            }
        }
        async tryEvaluateAndCopy(debugService, element) {
            // todo: we should expand DAP to allow copying more types here (#187784)
            if (!(element instanceof replModel_1.ReplEvaluationResult)) {
                return;
            }
            const stackFrame = debugService.getViewModel().focusedStackFrame;
            const session = debugService.getViewModel().focusedSession;
            if (!stackFrame || !session || !session.capabilities.supportsClipboardContext) {
                return;
            }
            try {
                const evaluation = await session.evaluate(element.originalExpression, stackFrame.frameId, 'clipboard');
                return evaluation?.body.result;
            }
            catch (e) {
                return;
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2RlYnVnL2Jyb3dzZXIvcmVwbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBcUVoRyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRWhCLE1BQU0sbUJBQW1CLEdBQUcsb0JBQW9CLENBQUM7SUFDakQsTUFBTSwwQkFBMEIsR0FBRywwQkFBMEIsQ0FBQztJQUM5RCxNQUFNLHdCQUF3QixHQUFHLHdCQUF3QixDQUFDO0lBQzFELE1BQU0sY0FBYyxHQUFHLHFCQUFxQixDQUFDO0lBRTdDLFNBQVMsaUJBQWlCLENBQUMsSUFBMkM7UUFDckUsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7UUFDdkQsd0JBQXdCO0lBQ3pCLENBQUM7SUFFRCxNQUFNLGdCQUFnQixHQUFHLElBQUksR0FBRyxFQUFpQixDQUFDO0lBQ2xELE1BQU0sZ0JBQWdCLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxPQUFxQixFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQztJQUV4RSxJQUFNLElBQUksR0FBVixNQUFNLElBQUssU0FBUSx5QkFBYzs7aUJBR2Ysa0JBQWEsR0FBRyxFQUFFLEFBQUwsQ0FBTSxHQUFDLDJEQUEyRDtpQkFDL0UsUUFBRyxHQUFHLFNBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxvQkFBWSxZQUFZLENBQUMsQUFBekMsQ0FBMEM7UUF3QnJFLFlBQ0MsT0FBeUIsRUFDVixZQUE0QyxFQUNwQyxvQkFBMkMsRUFDakQsY0FBZ0QsRUFDbEQsWUFBMkIsRUFDM0IsWUFBNEMsRUFDdkMsaUJBQXFDLEVBQ3JDLGlCQUFxQyxFQUNqQyxxQkFBNkMsRUFDaEQs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