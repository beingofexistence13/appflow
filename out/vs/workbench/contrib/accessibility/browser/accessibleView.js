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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/aria/aria", "vs/base/common/codicons", "vs/base/common/lifecycle", "vs/base/common/marked/marked", "vs/base/common/platform", "vs/base/common/themables", "vs/base/common/uri", "vs/editor/browser/editorExtensions", "vs/editor/browser/widget/codeEditorWidget", "vs/editor/common/core/position", "vs/editor/common/services/model", "vs/editor/common/standaloneStrings", "vs/editor/contrib/codeAction/browser/codeActionController", "vs/nls", "vs/platform/accessibility/common/accessibility", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/browser/toolbar", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/layout/browser/layoutService", "vs/platform/opener/common/opener", "vs/platform/quickinput/common/quickInput", "vs/workbench/contrib/accessibility/browser/accessibilityConfiguration", "vs/workbench/contrib/codeEditor/browser/simpleEditorOptions"], function (require, exports, dom_1, keyboardEvent_1, aria_1, codicons_1, lifecycle_1, marked_1, platform_1, themables_1, uri_1, editorExtensions_1, codeEditorWidget_1, position_1, model_1, standaloneStrings_1, codeActionController_1, nls_1, accessibility_1, menuEntryActionViewItem_1, toolbar_1, actions_1, configuration_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, layoutService_1, opener_1, quickInput_1, accessibilityConfiguration_1, simpleEditorOptions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AccessibleViewService = exports.AccessibleView = exports.NavigationType = exports.AccessibleViewType = exports.IAccessibleViewService = void 0;
    var DIMENSIONS;
    (function (DIMENSIONS) {
        DIMENSIONS[DIMENSIONS["MAX_WIDTH"] = 600] = "MAX_WIDTH";
    })(DIMENSIONS || (DIMENSIONS = {}));
    exports.IAccessibleViewService = (0, instantiation_1.createDecorator)('accessibleViewService');
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
    let AccessibleView = class AccessibleView extends lifecycle_1.Disposable {
        get editorWidget() { return this._editorWidget; }
        constructor(_openerService, _instantiationService, _configurationService, _modelService, _contextViewService, _contextKeyService, _accessibilityService, _keybindingService, _layoutService, _menuService) {
            super();
            this._openerService = _openerService;
            this._instantiationService = _instantiationService;
            this._configurationService = _configurationService;
            this._modelService = _modelService;
            this._contextViewService = _contextViewService;
            this._contextKeyService = _contextKeyService;
            this._accessibilityService = _accessibilityService;
            this._keybindingService = _keybindingService;
            this._layoutService = _layoutService;
            this._menuService = _menuService;
            this._accessiblityHelpIsShown = accessibilityConfiguration_1.accessibilityHelpIsShown.bindTo(this._contextKeyService);
            this._accessibleViewIsShown = accessibilityConfiguration_1.accessibleViewIsShown.bindTo(this._contextKeyService);
            this._accessibleViewSupportsNavigation = accessibilityConfiguration_1.accessibleViewSupportsNavigation.bindTo(this._contextKeyService);
            this._accessibleViewVerbosityEnabled = accessibilityConfiguration_1.accessibleViewVerbosityEnabled.bindTo(this._contextKeyService);
            this._accessibleViewGoToSymbolSupported = accessibilityConfiguration_1.accessibleViewGoToSymbolSupported.bindTo(this._contextKeyService);
            this._accessibleViewCurrentProviderId = accessibilityConfiguration_1.accessibleViewCurrentProviderId.bindTo(this._contextKeyService);
            this._onLastLine = accessibilityConfiguration_1.accessibleViewOnLastLine.bindTo(this._contextKeyService);
            this._container = document.createElement('div');
            this._container.classList.add('accessible-view');
            const codeEditorWidgetOptions = {
                contributions: editorExtensions_1.EditorExtensionsRegistry.getEditorContributions().filter(c => c.id !== codeActionController_1.CodeActionController.ID)
            };
            const titleBar = document.createElement('div');
            titleBar.classList.add('accessible-view-title-bar');
            this._title = document.createElement('div');
            this._title.classList.add('accessible-view-title');
            titleBar.appendChild(this._title);
            const actionBar = document.createElement('div');
            actionBar.classList.add('accessible-view-action-bar');
            titleBar.appendChild(actionBar);
            this._container.appendChild(titleBar);
            this._toolbar = this._register(_instantiationService.createInstance(toolbar_1.WorkbenchToolBar, actionBar, { orientation: 0 /* ActionsOrientation.HORIZONTAL */ }));
            this._toolbar.context = { viewId: 'accessibleView' };
            const toolbarElt = this._toolbar.getElement();
            toolbarElt.tabIndex = 0;
            const editorOptions = {
                ...(0, simpleEditorOptions_1.getSimpleEditorOptions)(this._configurationService),
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
            this._editorWidget = this._register(this._instantiationService.createInstance(codeEditorWidget_1.CodeEditorWidget, this._container, editorOptions, codeEditorWidgetOptions));
            this._register(this._accessibilityService.onDidChangeScreenReaderOptimized(() => {
                if (this._currentProvider && this._accessiblityHelpIsShown.get()) {
                    this.show(this._currentProvider);
                }
            }));
            this._register(this._configurationService.onDidChangeConfiguration(e => {
                if (this._currentProvider && e.affectsConfiguration(this._currentProvider.verbositySettingKey)) {
                    if (this._accessiblityHelpIsShown.get()) {
                        this.show(this._currentProvider);
                    }
                    this._accessibleViewVerbosityEnabled.set(this._configurationService.getValue(this._currentProvider.verbositySettingKey));
                    this._updateToolbar(this._currentProvider.actions, this._currentProvider.options.type);
                }
            }));
            this._register(this._editorWidget.onDidDispose(() => this._resetContextKeys()));
            this._register(this._editorWidget.onDidChangeCursorPosition(() => {
                this._onLastLine.set(this._editorWidget.getPosition()?.lineNumber === this._editorWidget.getModel()?.getLineCount());
            }));
        }
        _resetContextKeys() {
            this._accessiblityHelpIsShown.reset();
            this._accessibleViewIsShown.reset();
            this._accessibleViewSupportsNavigation.reset();
            this._accessibleViewVerbosityEnabled.reset();
            this._accessibleViewGoToSymbolSupported.reset();
            this._accessibleViewCurrentProviderId.reset();
        }
        show(provider, symbol, showAccessibleViewHelp) {
            provider = provider ?? this._currentProvider;
            if (!provider) {
                return;
            }
            const delegate = {
                getAnchor: () => { return { x: (window.innerWidth / 2) - ((Math.min(this._layoutService.dimension.width * 0.62 /* golden cut */, 600 /* DIMENSIONS.MAX_WIDTH */)) / 2), y: this._layoutService.offset.quickPickTop }; },
                render: (container) => {
                    container.classList.add('accessible-view-container');
                    return this._render(provider, container, showAccessibleViewHelp);
                },
                onHide: () => {
                    if (!showAccessibleViewHelp) {
                        this._currentProvider = undefined;
                        this._resetContextKeys();
                    }
                }
            };
            this._contextViewService.showContextView(delegate);
            if (symbol && this._currentProvider) {
                this.showSymbol(this._currentProvider, symbol);
            }
        }
        previous() {
            if (!this._currentProvider) {
                return;
            }
            this._currentProvider.previous?.();
        }
        next() {
            if (!this._currentProvider) {
                return;
            }
            this._currentProvider.next?.();
        }
        goToSymbol() {
            if (!this._currentProvider) {
                return;
            }
            this._instantiationService.createInstance(AccessibleViewSymbolQuickPick, this).show(this._currentProvider);
        }
        getSymbols() {
            if (!this._currentProvider || !this._currentContent) {
                return;
            }
            const symbols = this._currentProvider.getSymbols?.() || [];
            if (symbols?.length) {
                return symbols;
            }
            if (this._currentProvider.options.language && this._currentProvider.options.language !== 'markdown') {
                // Symbols haven't been provided and we cannot parse this language
                return;
            }
            const markdownTokens = marked_1.marked.lexer(this._currentContent);
            if (!markdownTokens) {
                return;
            }
            this._convertTokensToSymbols(markdownTokens, symbols);
            return symbols.length ? symbols : undefined;
        }
        _convertTokensToSymbols(tokens, symbols) {
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
                    symbols.push({ markdownToParse: label, label: (0, nls_1.localize)('symbolLabel', "({0}) {1}", token.type, label), ariaLabel: (0, nls_1.localize)('symbolLabelAria', "({0}) {1}", token.type, label), firstListItem });
                    firstListItem = undefined;
                }
            }
        }
        showSymbol(provider, symbol) {
            if (!this._currentContent) {
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
                const index = this._currentContent.split('\n').findIndex(line => line.includes(markdownToParse.split('\n')[0]) || (symbol.firstListItem && line.includes(symbol.firstListItem))) ?? -1;
                if (index >= 0) {
                    lineNumber = index + 1;
                }
            }
            if (lineNumber === undefined) {
                return;
            }
            this.show(provider);
            this._editorWidget.revealLine(lineNumber);
            this._editorWidget.setSelection({ startLineNumber: lineNumber, startColumn: 1, endLineNumber: lineNumber, endColumn: 1 });
            this._updateContextKeys(provider, true);
        }
        disableHint() {
            if (!this._currentProvider) {
                return;
            }
            this._configurationService.updateValue(this._currentProvider?.verbositySettingKey, false);
            (0, aria_1.alert)((0, nls_1.localize)('disableAccessibilityHelp', '{0} accessibility verbosity is now disabled', this._currentProvider.verbositySettingKey));
        }
        _updateContextKeys(provider, shown) {
            if (provider.options.type === "help" /* AccessibleViewType.Help */) {
                this._accessiblityHelpIsShown.set(shown);
                this._accessibleViewIsShown.reset();
            }
            else {
                this._accessibleViewIsShown.set(shown);
                this._accessiblityHelpIsShown.reset();
            }
            if (provider.next && provider.previous) {
                this._accessibleViewSupportsNavigation.set(true);
            }
            else {
                this._accessibleViewSupportsNavigation.reset();
            }
            const verbosityEnabled = this._configurationService.getValue(provider.verbositySettingKey);
            this._accessibleViewVerbosityEnabled.set(verbosityEnabled);
            this._accessibleViewGoToSymbolSupported.set(this._goToSymbolsSupported() ? this.getSymbols()?.length > 0 : false);
        }
        _render(provider, container, showAccessibleViewHelp) {
            if (!showAccessibleViewHelp) {
                // don't overwrite the current provider
                this._currentProvider = provider;
                this._accessibleViewCurrentProviderId.set(provider.verbositySettingKey.replaceAll('accessibility.verbosity.', ''));
            }
            const value = this._configurationService.getValue(provider.verbositySettingKey);
            const readMoreLink = provider.options.readMoreUrl ? (0, nls_1.localize)("openDoc", "\n\nPress H now to open a browser window with more information related to accessibility.\n\n") : '';
            let disableHelpHint = '';
            if (provider.options.type === "help" /* AccessibleViewType.Help */ && !!value) {
                disableHelpHint = this._getDisableVerbosityHint(provider.verbositySettingKey);
            }
            const accessibilitySupport = this._accessibilityService.isScreenReaderOptimized();
            let message = '';
            if (provider.options.type === "help" /* AccessibleViewType.Help */) {
                const turnOnMessage = (platform_1.isMacintosh
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
            this._currentContent = message + provider.provideContent() + readMoreLink + disableHelpHint;
            this._updateContextKeys(provider, true);
            this._getTextModel(uri_1.URI.from({ path: `accessible-view-${provider.verbositySettingKey}`, scheme: 'accessible-view', fragment: this._currentContent })).then((model) => {
                if (!model) {
                    return;
                }
                this._editorWidget.setModel(model);
                const domNode = this._editorWidget.getDomNode();
                if (!domNode) {
                    return;
                }
                model.setLanguage(provider.options.language ?? 'markdown');
                container.appendChild(this._container);
                let actionsHint = '';
                const verbose = this._configurationService.getValue(provider.verbositySettingKey);
                const hasActions = this._accessibleViewSupportsNavigation.get() || this._accessibleViewVerbosityEnabled.get() || this._accessibleViewGoToSymbolSupported.get() || this._currentProvider?.actions;
                if (verbose && !showAccessibleViewHelp && hasActions) {
                    actionsHint = (0, nls_1.localize)('ariaAccessibleViewActions', "Use Shift+Tab to explore actions such as disabling this hint.");
                }
                let ariaLabel = provider.options.type === "help" /* AccessibleViewType.Help */ ? (0, nls_1.localize)('accessibility-help', "Accessibility Help") : (0, nls_1.localize)('accessible-view', "Accessible View");
                this._title.textContent = ariaLabel;
                if (actionsHint && provider.options.type === "view" /* AccessibleViewType.View */) {
                    ariaLabel = (0, nls_1.localize)('accessible-view-hint', "Accessible View, {0}", actionsHint);
                }
                else if (actionsHint) {
                    ariaLabel = (0, nls_1.localize)('accessibility-help-hint', "Accessibility Help, {0}", actionsHint);
                }
                this._editorWidget.updateOptions({ ariaLabel });
                this._editorWidget.focus();
                if (this._currentProvider?.options.positionBottom) {
                    const lastLine = this.editorWidget.getModel()?.getLineCount();
                    const position = lastLine !== undefined && lastLine > 0 ? new position_1.Position(lastLine, 1) : undefined;
                    if (position) {
                        this._editorWidget.setPosition(position);
                        this._editorWidget.revealLine(position.lineNumber);
                    }
                }
            });
            this._updateToolbar(provider.actions, provider.options.type);
            const handleEscape = (e) => {
                e.stopPropagation();
                this._contextViewService.hideContextView();
                this._updateContextKeys(provider, false);
                // HACK: Delay to allow the context view to hide #186514
                setTimeout(() => provider.onClose(), 100);
            };
            const disposableStore = new lifecycle_1.DisposableStore();
            disposableStore.add(this._editorWidget.onKeyUp((e) => provider.onKeyUp?.(e)));
            disposableStore.add(this._editorWidget.onKeyDown((e) => {
                if (e.keyCode === 9 /* KeyCode.Escape */) {
                    handleEscape(e);
                }
                else if (e.keyCode === 38 /* KeyCode.KeyH */ && provider.options.readMoreUrl) {
                    const url = provider.options.readMoreUrl;
                    (0, aria_1.alert)(standaloneStrings_1.AccessibilityHelpNLS.openingDocs);
                    this._openerService.open(uri_1.URI.parse(url));
                    e.preventDefault();
                    e.stopPropagation();
                }
            }));
            disposableStore.add((0, dom_1.addDisposableListener)(this._toolbar.getElement(), dom_1.EventType.KEY_DOWN, (e) => {
                const keyboardEvent = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (keyboardEvent.equals(9 /* KeyCode.Escape */)) {
                    handleEscape(e);
                }
            }));
            disposableStore.add(this._editorWidget.onDidBlurEditorWidget(() => {
                if (document.activeElement !== this._toolbar.getElement()) {
                    this._contextViewService.hideContextView();
                }
            }));
            disposableStore.add(this._editorWidget.onDidContentSizeChange(() => this._layout()));
            disposableStore.add(this._layoutService.onDidLayout(() => this._layout()));
            return disposableStore;
        }
        _updateToolbar(providedActions, type) {
            this._toolbar.setAriaLabel(type === "help" /* AccessibleViewType.Help */ ? (0, nls_1.localize)('accessibleHelpToolbar', 'Accessibility Help') : (0, nls_1.localize)('accessibleViewToolbar', "Accessible View"));
            const menuActions = [];
            const toolbarMenu = this._register(this._menuService.createMenu(actions_1.MenuId.AccessibleView, this._contextKeyService));
            (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(toolbarMenu, {}, menuActions);
            if (providedActions) {
                for (const providedAction of providedActions) {
                    providedAction.class = providedAction.class || themables_1.ThemeIcon.asClassName(codicons_1.Codicon.primitiveSquare);
                    providedAction.checked = undefined;
                }
                this._toolbar.setActions([...providedActions, ...menuActions]);
            }
            else {
                this._toolbar.setActions(menuActions);
            }
        }
        _layout() {
            const dimension = this._layoutService.dimension;
            const maxHeight = dimension.height && dimension.height * .4;
            const height = Math.min(maxHeight, this._editorWidget.getContentHeight());
            const width = Math.min(dimension.width * 0.62 /* golden cut */, 600 /* DIMENSIONS.MAX_WIDTH */);
            this._editorWidget.layout({ width, height });
        }
        async _getTextModel(resource) {
            const existing = this._modelService.getModel(resource);
            if (existing && !existing.isDisposed()) {
                return existing;
            }
            return this._modelService.createModel(resource.fragment, null, resource, false);
        }
        _goToSymbolsSupported() {
            if (!this._currentProvider) {
                return false;
            }
            return this._currentProvider.options.type === "help" /* AccessibleViewType.Help */ || this._currentProvider.options.language === 'markdown' || this._currentProvider.options.language === undefined || !!this._currentProvider.getSymbols?.();
        }
        showAccessibleViewHelp() {
            if (!this._currentProvider) {
                return;
            }
            const currentProvider = Object.assign({}, this._currentProvider);
            currentProvider.options = Object.assign({}, currentProvider.options);
            const accessibleViewHelpProvider = {
                provideContent: () => this._getAccessibleViewHelpDialogContent(this._goToSymbolsSupported()),
                onClose: () => this.show(currentProvider),
                options: { type: "help" /* AccessibleViewType.Help */ },
                verbositySettingKey: this._currentProvider.verbositySettingKey
            };
            this._contextViewService.hideContextView();
            // HACK: Delay to allow the context view to hide #186514
            setTimeout(() => this.show(accessibleViewHelpProvider, undefined, true), 100);
        }
        _getAccessibleViewHelpDialogContent(providerHasSymbols) {
            const navigationHint = this._getNavigationHint();
            const goToSymbolHint = this._getGoToSymbolHint(providerHasSymbols);
            const toolbarHint = (0, nls_1.localize)('toolbar', "Navigate to the toolbar (Shift+Tab))");
            let hint = (0, nls_1.localize)('intro', "In the accessible view, you can:\n");
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
        _getNavigationHint() {
            let hint = '';
            const nextKeybinding = this._keybindingService.lookupKeybinding("editor.action.accessibleViewNext" /* AccessibilityCommandId.ShowNext */)?.getAriaLabel();
            const previousKeybinding = this._keybindingService.lookupKeybinding("editor.action.accessibleViewPrevious" /* AccessibilityCommandId.ShowPrevious */)?.getAriaLabel();
            if (nextKeybinding && previousKeybinding) {
                hint = (0, nls_1.localize)('accessibleViewNextPreviousHint', "Show the next ({0}) or previous ({1}) item", nextKeybinding, previousKeybinding);
            }
            else {
                hint = (0, nls_1.localize)('chatAccessibleViewNextPreviousHintNoKb', "Show the next or previous item by configuring keybindings for the Show Next & Previous in Accessible View commands");
            }
            return hint;
        }
        _getDisableVerbosityHint(verbositySettingKey) {
            if (!this._configurationService.getValue(verbositySettingKey)) {
                return '';
            }
            let hint = '';
            const disableKeybinding = this._keybindingService.lookupKeybinding("editor.action.accessibleViewDisableHint" /* AccessibilityCommandId.DisableVerbosityHint */, this._contextKeyService)?.getAriaLabel();
            if (disableKeybinding) {
                hint = (0, nls_1.localize)('acessibleViewDisableHint', "Disable accessibility verbosity for this feature ({0}). This will disable the hint to open the accessible view for example.\n", disableKeybinding);
            }
            else {
                hint = (0, nls_1.localize)('accessibleViewDisableHintNoKb', "Add a keybinding for the command Disable Accessible View Hint, which disables accessibility verbosity for this feature.\n");
            }
            return hint;
        }
        _getGoToSymbolHint(providerHasSymbols) {
            const goToSymbolKb = this._keybindingService.lookupKeybinding("editor.action.accessibleViewGoToSymbol" /* AccessibilityCommandId.GoToSymbol */)?.getAriaLabel();
            let goToSymbolHint = '';
            if (providerHasSymbols) {
                if (goToSymbolKb) {
                    goToSymbolHint = (0, nls_1.localize)('goToSymbolHint', 'Go to a symbol ({0})', goToSymbolKb);
                }
                else {
                    goToSymbolHint = (0, nls_1.localize)('goToSymbolHintNoKb', 'To go to a symbol, configure a keybinding for the command Go To Symbol in Accessible View');
                }
            }
            return goToSymbolHint;
        }
    };
    exports.AccessibleView = AccessibleView;
    exports.AccessibleView = AccessibleView = __decorate([
        __param(0, opener_1.IOpenerService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, model_1.IModelService),
        __param(4, contextView_1.IContextViewService),
        __param(5, contextkey_1.IContextKeyService),
        __param(6, accessibility_1.IAccessibilityService),
        __param(7, keybinding_1.IKeybindingService),
        __param(8, layoutService_1.ILayoutService),
        __param(9, actions_1.IMenuService)
    ], AccessibleView);
    let AccessibleViewService = class AccessibleViewService extends lifecycle_1.Disposable {
        constructor(_instantiationService, _configurationService, _keybindingService) {
            super();
            this._instantiationService = _instantiationService;
            this._configurationService = _configurationService;
            this._keybindingService = _keybindingService;
        }
        show(provider) {
            if (!this._accessibleView) {
                this._accessibleView = this._register(this._instantiationService.createInstance(AccessibleView));
            }
            this._accessibleView.show(provider);
        }
        next() {
            this._accessibleView?.next();
        }
        previous() {
            this._accessibleView?.previous();
        }
        goToSymbol() {
            this._accessibleView?.goToSymbol();
        }
        getOpenAriaHint(verbositySettingKey) {
            if (!this._configurationService.getValue(verbositySettingKey)) {
                return null;
            }
            const keybinding = this._keybindingService.lookupKeybinding("editor.action.accessibleView" /* AccessibilityCommandId.OpenAccessibleView */)?.getAriaLabel();
            let hint = null;
            if (keybinding) {
                hint = (0, nls_1.localize)('acessibleViewHint', "Inspect this in the accessible view with {0}", keybinding);
            }
            else {
                hint = (0, nls_1.localize)('acessibleViewHintNoKbEither', "Inspect this in the accessible view via the command Open Accessible View which is currently not triggerable via keybinding.");
            }
            return hint;
        }
        disableHint() {
            this._accessibleView?.disableHint();
        }
        showAccessibleViewHelp() {
            this._accessibleView?.showAccessibleViewHelp();
        }
        getPosition() {
            return this._accessibleView?.editorWidget.getPosition() ?? undefined;
        }
        getLastPosition() {
            const lastLine = this._accessibleView?.editorWidget.getModel()?.getLineCount();
            return lastLine !== undefined && lastLine > 0 ? new position_1.Position(lastLine, 1) : undefined;
        }
        setPosition(position, reveal) {
            const editorWidget = this._accessibleView?.editorWidget;
            editorWidget?.setPosition(position);
            if (reveal) {
                editorWidget?.revealLine(position.lineNumber);
            }
        }
    };
    exports.AccessibleViewService = AccessibleViewService;
    exports.AccessibleViewService = AccessibleViewService = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, keybinding_1.IKeybindingService)
    ], AccessibleViewService);
    let AccessibleViewSymbolQuickPick = class AccessibleViewSymbolQuickPick {
        constructor(_accessibleView, _quickInputService) {
            this._accessibleView = _accessibleView;
            this._quickInputService = _quickInputService;
        }
        show(provider) {
            const quickPick = this._quickInputService.createQuickPick();
            quickPick.placeholder = (0, nls_1.localize)('accessibleViewSymbolQuickPickPlaceholder', "Type to search symbols");
            quickPick.title = (0, nls_1.localize)('accessibleViewSymbolQuickPickTitle', "Go to Symbol Accessible View");
            const picks = [];
            const symbols = this._accessibleView.getSymbols();
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
                this._accessibleView.showSymbol(provider, quickPick.selectedItems[0]);
                quickPick.hide();
            });
            quickPick.onDidHide(() => {
                if (quickPick.selectedItems.length === 0) {
                    // this was escaped, so refocus the accessible view
                    this._accessibleView.show(provider);
                }
            });
        }
    };
    AccessibleViewSymbolQuickPick = __decorate([
        __param(1, quickInput_1.IQuickInputService)
    ], AccessibleViewSymbolQuickPick);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjZXNzaWJsZVZpZXcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9hY2Nlc3NpYmlsaXR5L2Jyb3dzZXIvYWNjZXNzaWJsZVZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBd0NoRyxJQUFXLFVBRVY7SUFGRCxXQUFXLFVBQVU7UUFDcEIsdURBQWUsQ0FBQTtJQUNoQixDQUFDLEVBRlUsVUFBVSxLQUFWLFVBQVUsUUFFcEI7SUFxQlksUUFBQSxzQkFBc0IsR0FBRyxJQUFBLCtCQUFlLEVBQXlCLHVCQUF1QixDQUFDLENBQUM7SUFvQnZHLElBQWtCLGtCQUdqQjtJQUhELFdBQWtCLGtCQUFrQjtRQUNuQyxtQ0FBYSxDQUFBO1FBQ2IsbUNBQWEsQ0FBQTtJQUNkLENBQUMsRUFIaUIsa0JBQWtCLGtDQUFsQixrQkFBa0IsUUFHbkM7SUFFRCxJQUFrQixjQUdqQjtJQUhELFdBQWtCLGNBQWM7UUFDL0IsdUNBQXFCLENBQUE7UUFDckIsK0JBQWEsQ0FBQTtJQUNkLENBQUMsRUFIaUIsY0FBYyw4QkFBZCxjQUFjLFFBRy9CO0lBWU0sSUFBTSxjQUFjLEdBQXBCLE1BQU0sY0FBZSxTQUFRLHNCQUFVO1FBVzdDLElBQUksWUFBWSxLQUFLLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7UUFRakQsWUFDa0MsY0FBOEIsRUFDdkIscUJBQTRDLEVBQzVDLHFCQUE0QyxFQUNwRCxhQUE0QixFQUN0QixtQkFBd0MsRUFDekMsa0JBQXNDLEVBQ25DLHFCQUE0QyxFQUMvQyxrQkFBc0MsRUFDMUMsY0FBOEIsRUFDaEMsWUFBMEI7WUFFekQsS0FBSyxFQUFFLENBQUM7WUFYeUIsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1lBQ3ZCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFDNUMsMEJBQXFCLEdB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