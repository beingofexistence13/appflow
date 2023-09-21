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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/aria/aria", "vs/base/common/codicons", "vs/base/common/lifecycle", "vs/base/common/marked/marked", "vs/base/common/platform", "vs/base/common/themables", "vs/base/common/uri", "vs/editor/browser/editorExtensions", "vs/editor/browser/widget/codeEditorWidget", "vs/editor/common/core/position", "vs/editor/common/services/model", "vs/editor/common/standaloneStrings", "vs/editor/contrib/codeAction/browser/codeActionController", "vs/nls!vs/workbench/contrib/accessibility/browser/accessibleView", "vs/platform/accessibility/common/accessibility", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/browser/toolbar", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/layout/browser/layoutService", "vs/platform/opener/common/opener", "vs/platform/quickinput/common/quickInput", "vs/workbench/contrib/accessibility/browser/accessibilityConfiguration", "vs/workbench/contrib/codeEditor/browser/simpleEditorOptions"], function (require, exports, dom_1, keyboardEvent_1, aria_1, codicons_1, lifecycle_1, marked_1, platform_1, themables_1, uri_1, editorExtensions_1, codeEditorWidget_1, position_1, model_1, standaloneStrings_1, codeActionController_1, nls_1, accessibility_1, menuEntryActionViewItem_1, toolbar_1, actions_1, configuration_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, layoutService_1, opener_1, quickInput_1, accessibilityConfiguration_1, simpleEditorOptions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$yqb = exports.$xqb = exports.NavigationType = exports.AccessibleViewType = exports.$wqb = void 0;
    var DIMENSIONS;
    (function (DIMENSIONS) {
        DIMENSIONS[DIMENSIONS["MAX_WIDTH"] = 600] = "MAX_WIDTH";
    })(DIMENSIONS || (DIMENSIONS = {}));
    exports.$wqb = (0, instantiation_1.$Bh)('accessibleViewService');
    var AccessibleViewType;
    (function (AccessibleViewType) {
        AccessibleViewType["Help"] = "help";
        AccessibleViewType["View"] = "view";
    })(AccessibleViewType || (exports.AccessibleViewType = AccessibleViewType = {}));
    var NavigationType;
    (function (NavigationType) {
        NavigationType["Previous"] = "previous";
        NavigationType["Next"] = "next";
    })(NavigationType || (exports.NavigationType = NavigationType = {}));
    let $xqb = class $xqb extends lifecycle_1.$kc {
        get editorWidget() { return this.a; }
        constructor(z, C, D, F, G, H, I, J, L, M) {
            super();
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.L = L;
            this.M = M;
            this.b = accessibilityConfiguration_1.$iqb.bindTo(this.H);
            this.g = accessibilityConfiguration_1.$jqb.bindTo(this.H);
            this.h = accessibilityConfiguration_1.$kqb.bindTo(this.H);
            this.j = accessibilityConfiguration_1.$lqb.bindTo(this.H);
            this.m = accessibilityConfiguration_1.$mqb.bindTo(this.H);
            this.n = accessibilityConfiguration_1.$oqb.bindTo(this.H);
            this.f = accessibilityConfiguration_1.$nqb.bindTo(this.H);
            this.r = document.createElement('div');
            this.r.classList.add('accessible-view');
            const codeEditorWidgetOptions = {
                contributions: editorExtensions_1.EditorExtensionsRegistry.getEditorContributions().filter(c => c.id !== codeActionController_1.$Q2.ID)
            };
            const titleBar = document.createElement('div');
            titleBar.classList.add('accessible-view-title-bar');
            this.s = document.createElement('div');
            this.s.classList.add('accessible-view-title');
            titleBar.appendChild(this.s);
            const actionBar = document.createElement('div');
            actionBar.classList.add('accessible-view-action-bar');
            titleBar.appendChild(actionBar);
            this.r.appendChild(titleBar);
            this.t = this.B(C.createInstance(toolbar_1.$L6, actionBar, { orientation: 0 /* ActionsOrientation.HORIZONTAL */ }));
            this.t.context = { viewId: 'accessibleView' };
            const toolbarElt = this.t.getElement();
            toolbarElt.tabIndex = 0;
            const editorOptions = {
                ...(0, simpleEditorOptions_1.$uqb)(this.D),
                lineDecorationsWidth: 6,
                dragAndDrop: false,
                cursorWidth: 1,
                wrappingStrategy: 'advanced',
                wrappingIndent: 'none',
                padding: { top: 2, bottom: 2 },
                quickSuggestions: false,
                renderWhitespace: 'none',
                dropIntoEditor: { enabled: false },
                readOnly: true,
                fontFamily: 'var(--monaco-monospace-font)'
            };
            this.a = this.B(this.C.createInstance(codeEditorWidget_1.$uY, this.r, editorOptions, codeEditorWidgetOptions));
            this.B(this.I.onDidChangeScreenReaderOptimized(() => {
                if (this.u && this.b.get()) {
                    this.show(this.u);
                }
            }));
            this.B(this.D.onDidChangeConfiguration(e => {
                if (this.u && e.affectsConfiguration(this.u.verbositySettingKey)) {
                    if (this.b.get()) {
                        this.show(this.u);
                    }
                    this.j.set(this.D.getValue(this.u.verbositySettingKey));
                    this.R(this.u.actions, this.u.options.type);
                }
            }));
            this.B(this.a.onDidDispose(() => this.N()));
            this.B(this.a.onDidChangeCursorPosition(() => {
                this.f.set(this.a.getPosition()?.lineNumber === this.a.getModel()?.getLineCount());
            }));
        }
        N() {
            this.b.reset();
            this.g.reset();
            this.h.reset();
            this.j.reset();
            this.m.reset();
            this.n.reset();
        }
        show(provider, symbol, showAccessibleViewHelp) {
            provider = provider ?? this.u;
            if (!provider) {
                return;
            }
            const delegate = {
                getAnchor: () => { return { x: (window.innerWidth / 2) - ((Math.min(this.L.dimension.width * 0.62 /* golden cut */, 600 /* DIMENSIONS.MAX_WIDTH */)) / 2), y: this.L.offset.quickPickTop }; },
                render: (container) => {
                    container.classList.add('accessible-view-container');
                    return this.Q(provider, container, showAccessibleViewHelp);
                },
                onHide: () => {
                    if (!showAccessibleViewHelp) {
                        this.u = undefined;
                        this.N();
                    }
                }
            };
            this.G.showContextView(delegate);
            if (symbol && this.u) {
                this.showSymbol(this.u, symbol);
            }
        }
        previous() {
            if (!this.u) {
                return;
            }
            this.u.previous?.();
        }
        next() {
            if (!this.u) {
                return;
            }
            this.u.next?.();
        }
        goToSymbol() {
            if (!this.u) {
                return;
            }
            this.C.createInstance(AccessibleViewSymbolQuickPick, this).show(this.u);
        }
        getSymbols() {
            if (!this.u || !this.w) {
                return;
            }
            const symbols = this.u.getSymbols?.() || [];
            if (symbols?.length) {
                return symbols;
            }
            if (this.u.options.language && this.u.options.language !== 'markdown') {
                // Symbols haven't been provided and we cannot parse this language
                return;
            }
            const markdownTokens = marked_1.marked.lexer(this.w);
            if (!markdownTokens) {
                return;
            }
            this.O(markdownTokens, symbols);
            return symbols.length ? symbols : undefined;
        }
        O(tokens, symbols) {
            let firstListItem;
            for (const token of tokens) {
                let label = undefined;
                if ('type' in token) {
                    switch (token.type) {
                        case 'heading':
                        case 'paragraph':
                        case 'code':
                            label = token.text;
                            break;
                        case 'list': {
                            const firstItem = token.items?.[0];
                            if (!firstItem) {
                                break;
                            }
                            firstListItem = `- ${firstItem.text}`;
                            label = token.items?.map(i => i.text).join(', ');
                            break;
                        }
                    }
                }
                if (label) {
                    symbols.push({ markdownToParse: label, label: (0, nls_1.localize)(0, null, token.type, label), ariaLabel: (0, nls_1.localize)(1, null, token.type, label), firstListItem });
                    firstListItem = undefined;
                }
            }
        }
        showSymbol(provider, symbol) {
            if (!this.w) {
                return;
            }
            let lineNumber = symbol.lineNumber;
            const markdownToParse = symbol.markdownToParse;
            if (lineNumber === undefined && markdownToParse === undefined) {
                // No symbols provided and we cannot parse this language
                return;
            }
            if (lineNumber === undefined && markdownToParse) {
                // Note that this scales poorly, thus isn't used for worst case scenarios like the terminal, for which a line number will always be provided.
                // Parse the markdown to find the line number
                const index = this.w.split('\n').findIndex(line => line.includes(markdownToParse.split('\n')[0]) || (symbol.firstListItem && line.includes(symbol.firstListItem))) ?? -1;
                if (index >= 0) {
                    lineNumber = index + 1;
                }
            }
            if (lineNumber === undefined) {
                return;
            }
            this.show(provider);
            this.a.revealLine(lineNumber);
            this.a.setSelection({ startLineNumber: lineNumber, startColumn: 1, endLineNumber: lineNumber, endColumn: 1 });
            this.P(provider, true);
        }
        disableHint() {
            if (!this.u) {
                return;
            }
            this.D.updateValue(this.u?.verbositySettingKey, false);
            (0, aria_1.$$P)((0, nls_1.localize)(2, null, this.u.verbositySettingKey));
        }
        P(provider, shown) {
            if (provider.options.type === "help" /* AccessibleViewType.Help */) {
                this.b.set(shown);
                this.g.reset();
            }
            else {
                this.g.set(shown);
                this.b.reset();
            }
            if (provider.next && provider.previous) {
                this.h.set(true);
            }
            else {
                this.h.reset();
            }
            const verbosityEnabled = this.D.getValue(provider.verbositySettingKey);
            this.j.set(verbosityEnabled);
            this.m.set(this.W() ? this.getSymbols()?.length > 0 : false);
        }
        Q(provider, container, showAccessibleViewHelp) {
            if (!showAccessibleViewHelp) {
                // don't overwrite the current provider
                this.u = provider;
                this.n.set(provider.verbositySettingKey.replaceAll('accessibility.verbosity.', ''));
            }
            const value = this.D.getValue(provider.verbositySettingKey);
            const readMoreLink = provider.options.readMoreUrl ? (0, nls_1.localize)(3, null) : '';
            let disableHelpHint = '';
            if (provider.options.type === "help" /* AccessibleViewType.Help */ && !!value) {
                disableHelpHint = this.Z(provider.verbositySettingKey);
            }
            const accessibilitySupport = this.I.isScreenReaderOptimized();
            let message = '';
            if (provider.options.type === "help" /* AccessibleViewType.Help */) {
                const turnOnMessage = (platform_1.$j
                    ? standaloneStrings_1.AccessibilityHelpNLS.changeConfigToOnMac
                    : standaloneStrings_1.AccessibilityHelpNLS.changeConfigToOnWinLinux);
                if (accessibilitySupport && provider.verbositySettingKey === "accessibility.verbosity.editor" /* AccessibilityVerbositySettingId.Editor */) {
                    message = standaloneStrings_1.AccessibilityHelpNLS.auto_on;
                    message += '\n';
                }
                else if (!accessibilitySupport) {
                    message = standaloneStrings_1.AccessibilityHelpNLS.auto_off + '\n' + turnOnMessage;
                    message += '\n';
                }
            }
            this.w = message + provider.provideContent() + readMoreLink + disableHelpHint;
            this.P(provider, true);
            this.U(uri_1.URI.from({ path: `accessible-view-${provider.verbositySettingKey}`, scheme: 'accessible-view', fragment: this.w })).then((model) => {
                if (!model) {
                    return;
                }
                this.a.setModel(model);
                const domNode = this.a.getDomNode();
                if (!domNode) {
                    return;
                }
                model.setLanguage(provider.options.language ?? 'markdown');
                container.appendChild(this.r);
                let actionsHint = '';
                const verbose = this.D.getValue(provider.verbositySettingKey);
                const hasActions = this.h.get() || this.j.get() || this.m.get() || this.u?.actions;
                if (verbose && !showAccessibleViewHelp && hasActions) {
                    actionsHint = (0, nls_1.localize)(4, null);
                }
                let ariaLabel = provider.options.type === "help" /* AccessibleViewType.Help */ ? (0, nls_1.localize)(5, null) : (0, nls_1.localize)(6, null);
                this.s.textContent = ariaLabel;
                if (actionsHint && provider.options.type === "view" /* AccessibleViewType.View */) {
                    ariaLabel = (0, nls_1.localize)(7, null, actionsHint);
                }
                else if (actionsHint) {
                    ariaLabel = (0, nls_1.localize)(8, null, actionsHint);
                }
                this.a.updateOptions({ ariaLabel });
                this.a.focus();
                if (this.u?.options.positionBottom) {
                    const lastLine = this.editorWidget.getModel()?.getLineCount();
                    const position = lastLine !== undefined && lastLine > 0 ? new position_1.$js(lastLine, 1) : undefined;
                    if (position) {
                        this.a.setPosition(position);
                        this.a.revealLine(position.lineNumber);
                    }
                }
            });
            this.R(provider.actions, provider.options.type);
            const handleEscape = (e) => {
                e.stopPropagation();
                this.G.hideContextView();
                this.P(provider, false);
                // HACK: Delay to allow the context view to hide #186514
                setTimeout(() => provider.onClose(), 100);
            };
            const disposableStore = new lifecycle_1.$jc();
            disposableStore.add(this.a.onKeyUp((e) => provider.onKeyUp?.(e)));
            disposableStore.add(this.a.onKeyDown((e) => {
                if (e.keyCode === 9 /* KeyCode.Escape */) {
                    handleEscape(e);
                }
                else if (e.keyCode === 38 /* KeyCode.KeyH */ && provider.options.readMoreUrl) {
                    const url = provider.options.readMoreUrl;
                    (0, aria_1.$$P)(standaloneStrings_1.AccessibilityHelpNLS.openingDocs);
                    this.z.open(uri_1.URI.parse(url));
                    e.preventDefault();
                    e.stopPropagation();
                }
            }));
            disposableStore.add((0, dom_1.$nO)(this.t.getElement(), dom_1.$3O.KEY_DOWN, (e) => {
                const keyboardEvent = new keyboardEvent_1.$jO(e);
                if (keyboardEvent.equals(9 /* KeyCode.Escape */)) {
                    handleEscape(e);
                }
            }));
            disposableStore.add(this.a.onDidBlurEditorWidget(() => {
                if (document.activeElement !== this.t.getElement()) {
                    this.G.hideContextView();
                }
            }));
            disposableStore.add(this.a.onDidContentSizeChange(() => this.S()));
            disposableStore.add(this.L.onDidLayout(() => this.S()));
            return disposableStore;
        }
        R(providedActions, type) {
            this.t.setAriaLabel(type === "help" /* AccessibleViewType.Help */ ? (0, nls_1.localize)(9, null) : (0, nls_1.localize)(10, null));
            const menuActions = [];
            const toolbarMenu = this.B(this.M.createMenu(actions_1.$Ru.AccessibleView, this.H));
            (0, menuEntryActionViewItem_1.$B3)(toolbarMenu, {}, menuActions);
            if (providedActions) {
                for (const providedAction of providedActions) {
                    providedAction.class = providedAction.class || themables_1.ThemeIcon.asClassName(codicons_1.$Pj.primitiveSquare);
                    providedAction.checked = undefined;
                }
                this.t.setActions([...providedActions, ...menuActions]);
            }
            else {
                this.t.setActions(menuActions);
            }
        }
        S() {
            const dimension = this.L.dimension;
            const maxHeight = dimension.height && dimension.height * .4;
            const height = Math.min(maxHeight, this.a.getContentHeight());
            const width = Math.min(dimension.width * 0.62 /* golden cut */, 600 /* DIMENSIONS.MAX_WIDTH */);
            this.a.layout({ width, height });
        }
        async U(resource) {
            const existing = this.F.getModel(resource);
            if (existing && !existing.isDisposed()) {
                return existing;
            }
            return this.F.createModel(resource.fragment, null, resource, false);
        }
        W() {
            if (!this.u) {
                return false;
            }
            return this.u.options.type === "help" /* AccessibleViewType.Help */ || this.u.options.language === 'markdown' || this.u.options.language === undefined || !!this.u.getSymbols?.();
        }
        showAccessibleViewHelp() {
            if (!this.u) {
                return;
            }
            const currentProvider = Object.assign({}, this.u);
            currentProvider.options = Object.assign({}, currentProvider.options);
            const accessibleViewHelpProvider = {
                provideContent: () => this.X(this.W()),
                onClose: () => this.show(currentProvider),
                options: { type: "help" /* AccessibleViewType.Help */ },
                verbositySettingKey: this.u.verbositySettingKey
            };
            this.G.hideContextView();
            // HACK: Delay to allow the context view to hide #186514
            setTimeout(() => this.show(accessibleViewHelpProvider, undefined, true), 100);
        }
        X(providerHasSymbols) {
            const navigationHint = this.Y();
            const goToSymbolHint = this.$(providerHasSymbols);
            const toolbarHint = (0, nls_1.localize)(11, null);
            let hint = (0, nls_1.localize)(12, null);
            if (navigationHint) {
                hint += ' - ' + navigationHint + '\n';
            }
            if (goToSymbolHint) {
                hint += ' - ' + goToSymbolHint + '\n';
            }
            if (toolbarHint) {
                hint += ' - ' + toolbarHint + '\n';
            }
            return hint;
        }
        Y() {
            let hint = '';
            const nextKeybinding = this.J.lookupKeybinding("editor.action.accessibleViewNext" /* AccessibilityCommandId.ShowNext */)?.getAriaLabel();
            const previousKeybinding = this.J.lookupKeybinding("editor.action.accessibleViewPrevious" /* AccessibilityCommandId.ShowPrevious */)?.getAriaLabel();
            if (nextKeybinding && previousKeybinding) {
                hint = (0, nls_1.localize)(13, null, nextKeybinding, previousKeybinding);
            }
            else {
                hint = (0, nls_1.localize)(14, null);
            }
            return hint;
        }
        Z(verbositySettingKey) {
            if (!this.D.getValue(verbositySettingKey)) {
                return '';
            }
            let hint = '';
            const disableKeybinding = this.J.lookupKeybinding("editor.action.accessibleViewDisableHint" /* AccessibilityCommandId.DisableVerbosityHint */, this.H)?.getAriaLabel();
            if (disableKeybinding) {
                hint = (0, nls_1.localize)(15, null, disableKeybinding);
            }
            else {
                hint = (0, nls_1.localize)(16, null);
            }
            return hint;
        }
        $(providerHasSymbols) {
            const goToSymbolKb = this.J.lookupKeybinding("editor.action.accessibleViewGoToSymbol" /* AccessibilityCommandId.GoToSymbol */)?.getAriaLabel();
            let goToSymbolHint = '';
            if (providerHasSymbols) {
                if (goToSymbolKb) {
                    goToSymbolHint = (0, nls_1.localize)(17, null, goToSymbolKb);
                }
                else {
                    goToSymbolHint = (0, nls_1.localize)(18, null);
                }
            }
            return goToSymbolHint;
        }
    };
    exports.$xqb = $xqb;
    exports.$xqb = $xqb = __decorate([
        __param(0, opener_1.$NT),
        __param(1, instantiation_1.$Ah),
        __param(2, configuration_1.$8h),
        __param(3, model_1.$yA),
        __param(4, contextView_1.$VZ),
        __param(5, contextkey_1.$3i),
        __param(6, accessibility_1.$1r),
        __param(7, keybinding_1.$2D),
        __param(8, layoutService_1.$XT),
        __param(9, actions_1.$Su)
    ], $xqb);
    let $yqb = class $yqb extends lifecycle_1.$kc {
        constructor(b, f, g) {
            super();
            this.b = b;
            this.f = f;
            this.g = g;
        }
        show(provider) {
            if (!this.a) {
                this.a = this.B(this.b.createInstance($xqb));
            }
            this.a.show(provider);
        }
        next() {
            this.a?.next();
        }
        previous() {
            this.a?.previous();
        }
        goToSymbol() {
            this.a?.goToSymbol();
        }
        getOpenAriaHint(verbositySettingKey) {
            if (!this.f.getValue(verbositySettingKey)) {
                return null;
            }
            const keybinding = this.g.lookupKeybinding("editor.action.accessibleView" /* AccessibilityCommandId.OpenAccessibleView */)?.getAriaLabel();
            let hint = null;
            if (keybinding) {
                hint = (0, nls_1.localize)(19, null, keybinding);
            }
            else {
                hint = (0, nls_1.localize)(20, null);
            }
            return hint;
        }
        disableHint() {
            this.a?.disableHint();
        }
        showAccessibleViewHelp() {
            this.a?.showAccessibleViewHelp();
        }
        getPosition() {
            return this.a?.editorWidget.getPosition() ?? undefined;
        }
        getLastPosition() {
            const lastLine = this.a?.editorWidget.getModel()?.getLineCount();
            return lastLine !== undefined && lastLine > 0 ? new position_1.$js(lastLine, 1) : undefined;
        }
        setPosition(position, reveal) {
            const editorWidget = this.a?.editorWidget;
            editorWidget?.setPosition(position);
            if (reveal) {
                editorWidget?.revealLine(position.lineNumber);
            }
        }
    };
    exports.$yqb = $yqb;
    exports.$yqb = $yqb = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, configuration_1.$8h),
        __param(2, keybinding_1.$2D)
    ], $yqb);
    let AccessibleViewSymbolQuickPick = class AccessibleViewSymbolQuickPick {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        show(provider) {
            const quickPick = this.b.createQuickPick();
            quickPick.placeholder = (0, nls_1.localize)(21, null);
            quickPick.title = (0, nls_1.localize)(22, null);
            const picks = [];
            const symbols = this.a.getSymbols();
            if (!symbols) {
                return;
            }
            for (const symbol of symbols) {
                picks.push({
                    label: symbol.label,
                    ariaLabel: symbol.ariaLabel
                });
            }
            quickPick.canSelectMany = false;
            quickPick.items = symbols;
            quickPick.show();
            quickPick.onDidAccept(() => {
                this.a.showSymbol(provider, quickPick.selectedItems[0]);
                quickPick.hide();
            });
            quickPick.onDidHide(() => {
                if (quickPick.selectedItems.length === 0) {
                    // this was escaped, so refocus the accessible view
                    this.a.show(provider);
                }
            });
        }
    };
    AccessibleViewSymbolQuickPick = __decorate([
        __param(1, quickInput_1.$Gq)
    ], AccessibleViewSymbolQuickPick);
});
//# sourceMappingURL=accessibleView.js.map