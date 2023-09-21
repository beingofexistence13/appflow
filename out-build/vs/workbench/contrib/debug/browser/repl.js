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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/aria/aria", "vs/base/browser/ui/mouseCursor/mouseCursor", "vs/base/common/async", "vs/base/common/decorators", "vs/base/common/event", "vs/base/common/history", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/base/common/themables", "vs/base/common/uri", "vs/editor/browser/editorBrowser", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/widget/codeEditorWidget", "vs/editor/common/config/editorOptions", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/editor/common/languages", "vs/editor/common/services/languageFeatures", "vs/editor/common/services/model", "vs/editor/common/services/textResourceConfiguration", "vs/editor/contrib/suggest/browser/suggestController", "vs/nls!vs/workbench/contrib/debug/browser/repl", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/clipboard/common/clipboardService", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/history/browser/contextScopedHistoryWidget", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/keybinding/common/keybinding", "vs/platform/list/browser/listService", "vs/platform/log/common/log", "vs/platform/opener/common/opener", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/views", "vs/workbench/contrib/codeEditor/browser/simpleEditorOptions", "vs/workbench/contrib/debug/browser/debugActionViewItems", "vs/workbench/contrib/debug/browser/debugIcons", "vs/workbench/contrib/debug/browser/linkDetector", "vs/workbench/contrib/debug/browser/replFilter", "vs/workbench/contrib/debug/browser/replViewer", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/contrib/debug/common/replModel", "vs/workbench/services/editor/common/editorService", "vs/workbench/browser/actions/widgetNavigationCommands", "vs/css!./media/repl"], function (require, exports, dom, aria, mouseCursor_1, async_1, decorators_1, event_1, history_1, lifecycle_1, strings_1, themables_1, uri_1, editorBrowser_1, editorExtensions_1, codeEditorService_1, codeEditorWidget_1, editorOptions_1, range_1, editorContextKeys_1, languages_1, languageFeatures_1, model_1, textResourceConfiguration_1, suggestController_1, nls_1, menuEntryActionViewItem_1, actions_1, clipboardService_1, configuration_1, contextkey_1, contextView_1, contextScopedHistoryWidget_1, instantiation_1, serviceCollection_1, keybinding_1, listService_1, log_1, opener_1, storage_1, telemetry_1, colorRegistry_1, themeService_1, viewPane_1, views_1, simpleEditorOptions_1, debugActionViewItems_1, debugIcons_1, linkDetector_1, replFilter_1, replViewer_1, debug_1, debugModel_1, replModel_1, editorService_1, widgetNavigationCommands_1) {
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
    let Repl = class Repl extends viewPane_1.$Jeb {
        static { Repl_1 = this; }
        static { this.f = 50; } // delay in ms to refresh the repl for new elements to show
        static { this.m = uri_1.URI.parse(`${debug_1.$jH}:replinput`); }
        constructor(options, lc, instantiationService, mc, themeService, nc, contextKeyService, codeEditorService, viewDescriptorService, contextMenuService, configurationService, oc, pc, keybindingService, openerService, telemetryService, menuService, qc, rc) {
            const filterText = mc.get(FILTER_VALUE_STORAGE_KEY, 1 /* StorageScope.WORKSPACE */, '');
            super({
                ...options,
                filterOptions: {
                    placeholder: (0, nls_1.localize)(0, null),
                    text: filterText,
                    history: JSON.parse(mc.get(FILTER_HISTORY_STORAGE_KEY, 1 /* StorageScope.WORKSPACE */, '[]')),
                }
            }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.lc = lc;
            this.mc = mc;
            this.nc = nc;
            this.oc = oc;
            this.pc = pc;
            this.qc = qc;
            this.rc = rc;
            this.ab = 0;
            this.ac = 1;
            this.hc = lifecycle_1.$kc.None;
            this.kc = menuService.createMenu(actions_1.$Ru.DebugConsoleContext, contextKeyService);
            this.B(this.kc);
            this.r = new history_1.$pR(JSON.parse(this.mc.get(HISTORY_STORAGE_KEY, 1 /* StorageScope.WORKSPACE */, '[]')), 50);
            this.ic = new replFilter_1.$6Rb();
            this.ic.filterQuery = filterText;
            this.jc = debug_1.$aH.bindTo(contextKeyService);
            this.L = this.B(this.Bb.createInstance(ReplOptions, this.id, () => this.Rb()));
            this.B(this.L.onDidChange(() => this.vc()));
            codeEditorService.registerDecorationType('repl-decoration', DECORATION_KEY, {});
            this.jc.set(this.yc);
            this.sc();
        }
        sc() {
            if (this.lc.getViewModel().focusedSession) {
                this.tc(this.lc.getViewModel().focusedSession);
            }
            this.B(this.lc.getViewModel().onDidFocusSession(async (session) => this.tc(session)));
            this.B(this.lc.getViewModel().onDidEvaluateLazyExpression(async (e) => {
                if (e instanceof debugModel_1.$JFb && this.t?.hasNode(e)) {
                    await this.t.updateChildren(e, false, true);
                    await this.t.expand(e);
                }
            }));
            this.B(this.lc.onWillNewSession(async (newSession) => {
                // Need to listen to output events for sessions which are not yet fully initialised
                const input = this.t?.getInput();
                if (!input || input.state === 0 /* State.Inactive */) {
                    await this.selectSession(newSession);
                }
                this.jc.set(this.yc);
            }));
            this.B(this.lc.onDidEndSession(async (session) => {
                // Update view, since orphaned sessions might now be separate
                await Promise.resolve(); // allow other listeners to go first, so sessions can update parents
                this.jc.set(this.yc);
            }));
            this.B(this.Db.onDidColorThemeChange(() => {
                this.Ec(false);
                if (this.isVisible()) {
                    this.Fc();
                }
            }));
            this.B(this.onDidChangeBodyVisibility(visible => {
                if (visible) {
                    if (!this.bc) {
                        this.bc = this.nc.getModel(Repl_1.m) || this.nc.createModel('', null, Repl_1.m, true);
                    }
                    this.uc();
                    this.Yb.setModel(this.bc);
                    this.Fc();
                    this.Ec(true);
                }
            }));
            this.B(this.yb.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('debug.console.wordWrap') && this.t) {
                    this.t.dispose();
                    this.Xb.innerText = '';
                    dom.$lO(this.Xb);
                    this.Bc();
                }
                if (e.affectsConfiguration('debug.console.acceptSuggestionOnEnter')) {
                    const config = this.yb.getValue('debug');
                    this.Yb.updateOptions({
                        acceptSuggestionOnEnter: config.console.acceptSuggestionOnEnter === 'on' ? 'on' : 'off'
                    });
                }
            }));
            this.B(this.pc.onDidActiveEditorChange(() => {
                this.uc();
            }));
            this.B(this.filterWidget.onDidChangeFilterText(() => {
                this.ic.filterQuery = this.filterWidget.getFilterText();
                if (this.t) {
                    this.t.refilter();
                    revealLastElement(this.t);
                }
            }));
        }
        async tc(session) {
            if (session) {
                sessionsToIgnore.delete(session);
                this.gc?.dispose();
                if (session.capabilities.supportsCompletionsRequest) {
                    this.gc = this.qc.completionProvider.register({ scheme: debug_1.$jH, pattern: '**/replinput', hasAccessToAllModels: true }, {
                        _debugDisplayName: 'debugConsole',
                        triggerCharacters: session.capabilities.completionTriggerCharacters || ['.'],
                        provideCompletionItems: async (_, position, _context, token) => {
                            // Disable history navigation because up and down are used to navigate through the suggest widget
                            this.cc(false);
                            const model = this.Yb.getModel();
                            if (model) {
                                const word = model.getWordAtPosition(position);
                                const overwriteBefore = word ? word.word.length : 0;
                                const text = model.getValue();
                                const focusedStackFrame = this.lc.getViewModel().focusedStackFrame;
                                const frameId = focusedStackFrame ? focusedStackFrame.frameId : undefined;
                                const response = await session.completions(frameId, focusedStackFrame?.thread.threadId || 0, text, position, overwriteBefore, token);
                                const suggestions = [];
                                const computeRange = (length) => range_1.$ks.fromPositions(position.delta(0, -length), position);
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
                                if (this.yb.getValue('debug').console.historySuggestions) {
                                    const history = this.r.getHistory();
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
                total: this.t?.getNode().children.length ?? 0,
                filtered: this.t?.getNode().children.filter(c => c.visible).length ?? 0
            };
        }
        get isReadonly() {
            // Do not allow to edit inactive sessions
            const session = this.t?.getInput();
            if (session && session.state !== 0 /* State.Inactive */) {
                return false;
            }
            return true;
        }
        showPreviousValue() {
            if (!this.isReadonly) {
                this.wc(true);
            }
        }
        showNextValue() {
            if (!this.isReadonly) {
                this.wc(false);
            }
        }
        focusFilter() {
            this.filterWidget.focus();
        }
        uc() {
            if (!this.isVisible()) {
                return;
            }
            const activeEditorControl = this.pc.activeTextEditorControl;
            if ((0, editorBrowser_1.$iV)(activeEditorControl)) {
                this.hc.dispose();
                this.hc = activeEditorControl.onDidChangeModelLanguage(() => this.uc());
                if (this.bc && activeEditorControl.hasModel()) {
                    this.bc.setLanguage(activeEditorControl.getModel().getLanguageId());
                }
            }
        }
        vc() {
            if (this.fc) {
                this.Yb.updateOptions({
                    fontSize: this.L.replConfiguration.fontSize,
                    lineHeight: this.L.replConfiguration.lineHeight,
                    fontFamily: this.L.replConfiguration.fontFamily === 'default' ? editorOptions_1.EDITOR_FONT_DEFAULTS.fontFamily : this.L.replConfiguration.fontFamily
                });
                const replInputLineHeight = this.Yb.getOption(66 /* EditorOption.lineHeight */);
                // Set the font size, font family, line height and align the twistie to be centered, and input theme color
                this.fc.textContent = `
				.repl .repl-input-wrapper .repl-input-chevron {
					line-height: ${replInputLineHeight}px
				}

				.repl .repl-input-wrapper .monaco-editor .lines-content {
					background-color: ${this.L.replConfiguration.backgroundColor};
				}
			`;
                const cssFontFamily = this.L.replConfiguration.fontFamily === 'default' ? 'var(--monaco-monospace-font)' : this.L.replConfiguration.fontFamily;
                this.Wb.style.setProperty(`--vscode-repl-font-family`, cssFontFamily);
                this.Wb.style.setProperty(`--vscode-repl-font-size`, `${this.L.replConfiguration.fontSize}px`);
                this.Wb.style.setProperty(`--vscode-repl-font-size-for-twistie`, `${this.L.replConfiguration.fontSizeForTwistie}px`);
                this.Wb.style.setProperty(`--vscode-repl-line-height`, this.L.replConfiguration.cssLineHeight);
                this.t?.rerender();
                if (this.$b) {
                    this.n(this.$b.height, this.$b.width);
                }
            }
        }
        wc(previous) {
            const historyInput = (previous ?
                (this.r.previous() ?? this.r.first()) : this.r.next())
                ?? '';
            this.Yb.setValue(historyInput);
            aria.$_P(historyInput);
            // always leave cursor at the end.
            this.Yb.setPosition({ lineNumber: 1, column: historyInput.length + 1 });
            this.cc(true);
        }
        async selectSession(session) {
            const treeInput = this.t?.getInput();
            if (!session) {
                const focusedSession = this.lc.getViewModel().focusedSession;
                // If there is a focusedSession focus on that one, otherwise just show any other not ignored session
                if (focusedSession) {
                    session = focusedSession;
                }
                else if (!treeInput || sessionsToIgnore.has(treeInput)) {
                    session = this.lc.getModel().getSessions(true).find(s => !sessionsToIgnore.has(s));
                }
            }
            if (session) {
                this.ec?.dispose();
                this.ec = session.onDidChangeReplElements(() => {
                    this.Ec(session.getReplElements().length === 0);
                });
                if (this.t && treeInput !== session) {
                    try {
                        await this.t.setInput(session);
                    }
                    catch (err) {
                        // Ignore error because this may happen multiple times while refreshing,
                        // then changing the root may fail. Log to help with debugging if needed.
                        this.rc.error(err);
                    }
                    revealLastElement(this.t);
                }
            }
            this.Yb?.updateOptions({ readOnly: this.isReadonly });
            this.Fc();
        }
        async clearRepl() {
            const session = this.t?.getInput();
            if (session) {
                session.removeReplExpressions();
                if (session.state === 0 /* State.Inactive */) {
                    // Ignore inactive sessions which got cleared - so they are not shown any more
                    sessionsToIgnore.add(session);
                    await this.selectSession();
                    this.jc.set(this.yc);
                }
            }
            this.Yb.focus();
        }
        acceptReplInput() {
            const session = this.t?.getInput();
            if (session && !this.isReadonly) {
                session.addReplExpression(this.lc.getViewModel().focusedStackFrame, this.Yb.getValue());
                revealLastElement(this.t);
                this.r.add(this.Yb.getValue());
                this.Yb.setValue('');
                const shouldRelayout = this.ac > 1;
                this.ac = 1;
                if (shouldRelayout && this.$b) {
                    // Trigger a layout to shrink a potential multi line input
                    this.n(this.$b.height, this.$b.width);
                }
            }
        }
        getVisibleContent() {
            let text = '';
            if (this.bc && this.t) {
                const lineDelimiter = this.oc.getEOL(this.bc.uri);
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
                traverseAndAppend(this.t.getNode());
            }
            return (0, strings_1.$8e)(text);
        }
        n(height, width) {
            this.$b = new dom.$BO(width, height);
            const replInputHeight = Math.min(this.Yb.getContentHeight(), height);
            if (this.t) {
                const lastElementVisible = this.t.scrollTop + this.t.renderHeight >= this.t.scrollHeight;
                const treeHeight = height - replInputHeight;
                this.t.getHTMLElement().style.height = `${treeHeight}px`;
                this.t.layout(treeHeight, width);
                if (lastElementVisible) {
                    revealLastElement(this.t);
                }
            }
            this.Zb.style.height = `${replInputHeight}px`;
            this.Yb.layout({ width: width - 30, height: replInputHeight });
        }
        collapseAll() {
            this.t?.collapseAll();
        }
        getReplInput() {
            return this.Yb;
        }
        focus() {
            setTimeout(() => this.Yb.focus(), 0);
        }
        getActionViewItem(action) {
            if (action.id === selectReplCommandId) {
                const session = (this.t ? this.t.getInput() : undefined) ?? this.lc.getViewModel().focusedSession;
                return this.Bb.createInstance(SelectReplActionViewItem, action, session);
            }
            return super.getActionViewItem(action);
        }
        get yc() {
            return this.lc.getModel().getSessions(true).filter(s => s.hasSeparateRepl() && !sessionsToIgnore.has(s)).length > 1;
        }
        // --- Cached locals
        get zc() {
            const autoExpanded = new Set();
            return new async_1.$Sg(async () => {
                if (!this.t) {
                    return;
                }
                if (!this.t.getInput()) {
                    return;
                }
                await this.t.updateChildren(undefined, true, false, { diffIdentityProvider: identityProvider });
                const session = this.t.getInput();
                if (session) {
                    // Automatically expand repl group elements when specified
                    const autoExpandElements = async (elements) => {
                        for (const element of elements) {
                            if (element instanceof replModel_1.$8Pb) {
                                if (element.autoExpand && !autoExpanded.has(element.getId())) {
                                    autoExpanded.add(element.getId());
                                    await this.t.expand(element);
                                }
                                if (!this.t.isCollapsed(element)) {
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
                this.filterWidget.updateBadge(total === filtered || total === 0 ? undefined : (0, nls_1.localize)(1, null, filtered, total));
            }, Repl_1.f);
        }
        // --- Creation
        render() {
            super.render();
            this.B((0, widgetNavigationCommands_1.$Cmb)({
                focusNotifiers: [this, this.filterWidget],
                focusNextWidget: () => {
                    if (this.filterWidget.hasFocus()) {
                        this.t?.domFocus();
                    }
                    else if (this.t?.getHTMLElement() === document.activeElement) {
                        this.focus();
                    }
                },
                focusPreviousWidget: () => {
                    if (this.Yb.hasTextFocus()) {
                        this.t?.domFocus();
                    }
                    else if (this.t?.getHTMLElement() === document.activeElement) {
                        this.focusFilter();
                    }
                }
            }));
        }
        U(parent) {
            super.U(parent);
            this.Wb = dom.$0O(parent, $('.repl'));
            this.Xb = dom.$0O(this.Wb, $(`.repl-tree.${mouseCursor_1.$WR}`));
            this.Cc(this.Wb);
            this.Bc();
        }
        Bc() {
            this.sb = new replViewer_1.$dSb(this.yb, this.L);
            const wordWrap = this.yb.getValue('debug').console.wordWrap;
            this.Xb.classList.toggle('word-wrap', wordWrap);
            const linkDetector = this.Bb.createInstance(linkDetector_1.$2Pb);
            const tree = this.t = this.Bb.createInstance(listService_1.$w4, 'DebugRepl', this.Xb, this.sb, [
                this.Bb.createInstance(replViewer_1.$bSb, linkDetector),
                this.Bb.createInstance(replViewer_1.$aSb, linkDetector),
                new replViewer_1.$0Rb(),
                this.Bb.createInstance(replViewer_1.$$Rb, linkDetector),
                new replViewer_1.$_Rb(linkDetector),
                new replViewer_1.$cSb(linkDetector),
            ], 
            // https://github.com/microsoft/TypeScript/issues/32526
            new replViewer_1.$eSb(), {
                filter: this.ic,
                accessibilityProvider: new replViewer_1.$fSb(),
                identityProvider,
                mouseSupport: false,
                findWidgetEnabled: false,
                keyboardNavigationLabelProvider: { getKeyboardNavigationLabel: (e) => e.toString(true) },
                horizontalScrolling: !wordWrap,
                setRowLineHeight: false,
                supportDynamicHeights: wordWrap,
                overrideStyles: {
                    listBackground: this.Rb()
                }
            });
            this.B(tree.onDidChangeContentHeight(() => {
                if (tree.scrollHeight !== this.ab) {
                    // Due to rounding, the scrollTop + renderHeight will not exactly match the scrollHeight.
                    // Consider the tree to be scrolled all the way down if it is within 2px of the bottom.
                    const lastElementWasVisible = tree.scrollTop + tree.renderHeight >= this.ab - 2;
                    if (lastElementWasVisible) {
                        setTimeout(() => {
                            // Can't set scrollTop during this event listener, the list might overwrite the change
                            revealLastElement(tree);
                        }, 0);
                    }
                }
                this.ab = tree.scrollHeight;
            }));
            this.B(tree.onContextMenu(e => this.Dc(e)));
            let lastSelectedString;
            this.B(tree.onMouseClick(() => {
                const selection = window.getSelection();
                if (!selection || selection.type !== 'Range' || lastSelectedString === selection.toString()) {
                    // only focus the input if the user is not currently selecting.
                    this.Yb.focus();
                }
                lastSelectedString = selection ? selection.toString() : '';
            }));
            // Make sure to select the session if debugging is already active
            this.selectSession();
            this.fc = dom.$XO(this.Wb);
            this.vc();
        }
        Cc(container) {
            this.Zb = dom.$0O(container, $('.repl-input-wrapper'));
            dom.$0O(this.Zb, $('.repl-input-chevron' + themables_1.ThemeIcon.asCSSSelector(debugIcons_1.$znb)));
            const { historyNavigationBackwardsEnablement, historyNavigationForwardsEnablement } = this.B((0, contextScopedHistoryWidget_1.$R5)(this.vb, this));
            this.cc = enabled => {
                historyNavigationBackwardsEnablement.set(enabled);
                historyNavigationForwardsEnablement.set(enabled);
            };
            debug_1.$zG.bindTo(this.vb).set(true);
            this.dc = this.Bb.createChild(new serviceCollection_1.$zh([contextkey_1.$3i, this.vb]));
            const options = (0, simpleEditorOptions_1.$uqb)(this.yb);
            options.readOnly = true;
            options.suggest = { showStatusBar: true };
            const config = this.yb.getValue('debug');
            options.acceptSuggestionOnEnter = config.console.acceptSuggestionOnEnter === 'on' ? 'on' : 'off';
            options.ariaLabel = (0, nls_1.localize)(2, null);
            this.Yb = this.dc.createInstance(codeEditorWidget_1.$uY, this.Zb, options, (0, simpleEditorOptions_1.$vqb)());
            this.B(this.Yb.onDidChangeModelContent(() => {
                const model = this.Yb.getModel();
                this.cc(!!model && model.getValue() === '');
                const lineCount = model ? Math.min(10, model.getLineCount()) : 1;
                if (lineCount !== this.ac) {
                    this.ac = lineCount;
                    if (this.$b) {
                        this.n(this.$b.height, this.$b.width);
                    }
                }
            }));
            // We add the input decoration only when the focus is in the input #61126
            this.B(this.Yb.onDidFocusEditorText(() => this.Fc()));
            this.B(this.Yb.onDidBlurEditorText(() => this.Fc()));
            this.B(dom.$oO(this.Zb, dom.$3O.FOCUS, () => this.Zb.classList.add('synthetic-focus')));
            this.B(dom.$oO(this.Zb, dom.$3O.BLUR, () => this.Zb.classList.remove('synthetic-focus')));
        }
        Dc(e) {
            const actions = [];
            (0, menuEntryActionViewItem_1.$A3)(this.kc, { arg: e.element, shouldForwardArgs: false }, actions);
            this.xb.showContextMenu({
                getAnchor: () => e.anchor,
                getActions: () => actions,
                getActionsContext: () => e.element
            });
        }
        // --- Update
        Ec(noDelay) {
            if (this.t && this.isVisible()) {
                if (this.zc.isScheduled()) {
                    return;
                }
                this.zc.schedule(noDelay ? 0 : undefined);
            }
        }
        Fc() {
            if (!this.Yb) {
                return;
            }
            const decorations = [];
            if (this.isReadonly && this.Yb.hasTextFocus() && !this.Yb.getValue()) {
                const transparentForeground = (0, colorRegistry_1.$5y)(colorRegistry_1.$xw, this.Db.getColorTheme())?.transparent(0.4);
                decorations.push({
                    range: {
                        startLineNumber: 0,
                        endLineNumber: 0,
                        startColumn: 0,
                        endColumn: 1
                    },
                    renderOptions: {
                        after: {
                            contentText: (0, nls_1.localize)(3, null),
                            color: transparentForeground ? transparentForeground.toString() : undefined
                        }
                    }
                });
            }
            this.Yb.setDecorationsByType('repl-decoration', DECORATION_KEY, decorations);
        }
        saveState() {
            const replHistory = this.r.getHistory();
            if (replHistory.length) {
                this.mc.store(HISTORY_STORAGE_KEY, JSON.stringify(replHistory), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.mc.remove(HISTORY_STORAGE_KEY, 1 /* StorageScope.WORKSPACE */);
            }
            const filterHistory = this.filterWidget.getHistory();
            if (filterHistory.length) {
                this.mc.store(FILTER_HISTORY_STORAGE_KEY, JSON.stringify(filterHistory), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.mc.remove(FILTER_HISTORY_STORAGE_KEY, 1 /* StorageScope.WORKSPACE */);
            }
            const filterValue = this.filterWidget.getFilterText();
            if (filterValue) {
                this.mc.store(FILTER_VALUE_STORAGE_KEY, filterValue, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.mc.remove(FILTER_VALUE_STORAGE_KEY, 1 /* StorageScope.WORKSPACE */);
            }
            super.saveState();
        }
        dispose() {
            this.Yb?.dispose(); // Disposed before rendered? #174558
            this.ec?.dispose();
            this.zc.dispose();
            this.hc.dispose();
            super.dispose();
        }
    };
    exports.Repl = Repl;
    __decorate([
        decorators_1.$6g
    ], Repl.prototype, "zc", null);
    exports.Repl = Repl = Repl_1 = __decorate([
        __param(1, debug_1.$nH),
        __param(2, instantiation_1.$Ah),
        __param(3, storage_1.$Vo),
        __param(4, themeService_1.$gv),
        __param(5, model_1.$yA),
        __param(6, contextkey_1.$3i),
        __param(7, codeEditorService_1.$nV),
        __param(8, views_1.$_E),
        __param(9, contextView_1.$WZ),
        __param(10, configuration_1.$8h),
        __param(11, textResourceConfiguration_1.$GA),
        __param(12, editorService_1.$9C),
        __param(13, keybinding_1.$2D),
        __param(14, opener_1.$NT),
        __param(15, telemetry_1.$9k),
        __param(16, actions_1.$Su),
        __param(17, languageFeatures_1.$hF),
        __param(18, log_1.$5i)
    ], Repl);
    let ReplOptions = class ReplOptions extends lifecycle_1.$kc {
        static { ReplOptions_1 = this; }
        static { this.a = 1.4; }
        get replConfiguration() {
            return this.f;
        }
        constructor(viewId, g, j, m, n) {
            super();
            this.g = g;
            this.j = j;
            this.m = m;
            this.n = n;
            this.b = this.B(new event_1.$fd());
            this.onDidChange = this.b.event;
            this.B(this.m.onDidColorThemeChange(e => this.r()));
            this.B(this.n.onDidChangeLocation(e => {
                if (e.views.some(v => v.id === viewId)) {
                    this.r();
                }
            }));
            this.B(this.j.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('debug.console.lineHeight') || e.affectsConfiguration('debug.console.fontSize') || e.affectsConfiguration('debug.console.fontFamily')) {
                    this.r();
                }
            }));
            this.r();
        }
        r() {
            const debugConsole = this.j.getValue('debug').console;
            this.f = {
                fontSize: debugConsole.fontSize,
                fontFamily: debugConsole.fontFamily,
                lineHeight: debugConsole.lineHeight ? debugConsole.lineHeight : ReplOptions_1.a * debugConsole.fontSize,
                cssLineHeight: debugConsole.lineHeight ? `${debugConsole.lineHeight}px` : `${ReplOptions_1.a}em`,
                backgroundColor: this.m.getColorTheme().getColor(this.g()),
                fontSizeForTwistie: debugConsole.fontSize * ReplOptions_1.a / 2 - 8
            };
            this.b.fire();
        }
    };
    ReplOptions = ReplOptions_1 = __decorate([
        __param(2, configuration_1.$8h),
        __param(3, themeService_1.$gv),
        __param(4, views_1.$_E)
    ], ReplOptions);
    // Repl actions and commands
    class AcceptReplInputAction extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'repl.action.acceptInput',
                label: (0, nls_1.localize)(4, null),
                alias: 'REPL Accept Input',
                precondition: debug_1.$zG,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 3 /* KeyCode.Enter */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor, editor) {
            suggestController_1.$G6.get(editor)?.cancelSuggestWidget();
            const repl = getReplView(accessor.get(views_1.$$E));
            repl?.acceptReplInput();
        }
    }
    class FilterReplAction extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'repl.action.filter',
                label: (0, nls_1.localize)(5, null),
                alias: 'REPL Filter',
                precondition: debug_1.$zG,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 36 /* KeyCode.KeyF */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor, editor) {
            const repl = getReplView(accessor.get(views_1.$$E));
            repl?.focusFilter();
        }
    }
    class ReplCopyAllAction extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'repl.action.copyAll',
                label: (0, nls_1.localize)(6, null),
                alias: 'Debug Console Copy All',
                precondition: debug_1.$zG,
            });
        }
        run(accessor, editor) {
            const clipboardService = accessor.get(clipboardService_1.$UZ);
            const repl = getReplView(accessor.get(views_1.$$E));
            if (repl) {
                return clipboardService.writeText(repl.getVisibleContent());
            }
        }
    }
    (0, editorExtensions_1.$xV)(AcceptReplInputAction);
    (0, editorExtensions_1.$xV)(ReplCopyAllAction);
    (0, editorExtensions_1.$xV)(FilterReplAction);
    class SelectReplActionViewItem extends debugActionViewItems_1.$dRb {
        L() {
            return this.a.getModel().getSessions(true).filter(s => s.hasSeparateRepl() && !sessionsToIgnore.has(s));
        }
        M(focusedSession) {
            while (focusedSession.parentSession && !focusedSession.hasSeparateRepl()) {
                focusedSession = focusedSession.parentSession;
            }
            return focusedSession;
        }
    }
    function getReplView(viewsService) {
        return viewsService.getActiveViewWithId(debug_1.$rG) ?? undefined;
    }
    const selectReplCommandId = 'workbench.action.debug.selectRepl';
    (0, actions_1.$Xu)(class extends viewPane_1.$Keb {
        constructor() {
            super({
                id: selectReplCommandId,
                viewId: debug_1.$rG,
                title: (0, nls_1.localize)(7, null),
                f1: false,
                menu: {
                    id: actions_1.$Ru.ViewTitle,
                    group: 'navigation',
                    when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', debug_1.$rG), debug_1.$aH),
                    order: 20
                }
            });
        }
        async runInView(accessor, view, session) {
            const debugService = accessor.get(debug_1.$nH);
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
    (0, actions_1.$Xu)(class extends viewPane_1.$Keb {
        constructor() {
            super({
                id: 'workbench.debug.panel.action.clearReplAction',
                viewId: debug_1.$rG,
                title: { value: (0, nls_1.localize)(8, null), original: 'Clear Console' },
                f1: true,
                icon: debugIcons_1.$rnb,
                menu: [{
                        id: actions_1.$Ru.ViewTitle,
                        group: 'navigation',
                        when: contextkey_1.$Ii.equals('view', debug_1.$rG),
                        order: 30
                    }, {
                        id: actions_1.$Ru.DebugConsoleContext,
                        group: 'z_commands',
                        order: 20
                    }]
            });
        }
        runInView(_accessor, view) {
            view.clearRepl();
            aria.$_P((0, nls_1.localize)(9, null));
        }
    });
    (0, actions_1.$Xu)(class extends viewPane_1.$Keb {
        constructor() {
            super({
                id: 'debug.collapseRepl',
                title: (0, nls_1.localize)(10, null),
                viewId: debug_1.$rG,
                menu: {
                    id: actions_1.$Ru.DebugConsoleContext,
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
    (0, actions_1.$Xu)(class extends viewPane_1.$Keb {
        constructor() {
            super({
                id: 'debug.replPaste',
                title: (0, nls_1.localize)(11, null),
                viewId: debug_1.$rG,
                precondition: debug_1.$uG.notEqualsTo((0, debug_1.$lH)(0 /* State.Inactive */)),
                menu: {
                    id: actions_1.$Ru.DebugConsoleContext,
                    group: '2_cutcopypaste',
                    order: 30
                }
            });
        }
        async runInView(accessor, view) {
            const clipboardService = accessor.get(clipboardService_1.$UZ);
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
    (0, actions_1.$Xu)(class extends viewPane_1.$Keb {
        constructor() {
            super({
                id: 'workbench.debug.action.copyAll',
                title: (0, nls_1.localize)(12, null),
                viewId: debug_1.$rG,
                menu: {
                    id: actions_1.$Ru.DebugConsoleContext,
                    group: '2_cutcopypaste',
                    order: 20
                }
            });
        }
        async runInView(accessor, view) {
            const clipboardService = accessor.get(clipboardService_1.$UZ);
            await clipboardService.writeText(view.getVisibleContent());
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'debug.replCopy',
                title: (0, nls_1.localize)(13, null),
                menu: {
                    id: actions_1.$Ru.DebugConsoleContext,
                    group: '2_cutcopypaste',
                    order: 10
                }
            });
        }
        async run(accessor, element) {
            const clipboardService = accessor.get(clipboardService_1.$UZ);
            const debugService = accessor.get(debug_1.$nH);
            const nativeSelection = window.getSelection();
            const selectedText = nativeSelection?.toString();
            if (selectedText && selectedText.length > 0) {
                return clipboardService.writeText(selectedText);
            }
            else if (element) {
                return clipboardService.writeText(await this.a(debugService, element) || element.toString());
            }
        }
        async a(debugService, element) {
            // todo: we should expand DAP to allow copying more types here (#187784)
            if (!(element instanceof replModel_1.$7Pb)) {
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
//# sourceMappingURL=repl.js.map