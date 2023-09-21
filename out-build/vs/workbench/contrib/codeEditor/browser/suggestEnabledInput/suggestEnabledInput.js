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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/widget", "vs/base/common/event", "vs/base/common/objects", "vs/base/common/platform", "vs/base/common/uri", "vs/editor/browser/widget/codeEditorWidget", "vs/editor/common/core/editOperation", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/services/model", "vs/editor/contrib/contextmenu/browser/contextmenu", "vs/editor/contrib/snippet/browser/snippetController2", "vs/editor/contrib/suggest/browser/suggestController", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/contrib/codeEditor/browser/menuPreventer", "vs/workbench/contrib/codeEditor/browser/simpleEditorOptions", "vs/workbench/contrib/codeEditor/browser/selectionClipboard", "vs/editor/browser/editorExtensions", "vs/workbench/browser/style", "vs/base/common/history", "vs/platform/history/browser/contextScopedHistoryWidget", "vs/platform/instantiation/common/serviceCollection", "vs/editor/common/services/languageFeatures", "vs/editor/common/core/wordHelper", "vs/platform/configuration/common/configuration", "vs/css!./suggestEnabledInput"], function (require, exports, dom_1, widget_1, event_1, objects_1, platform_1, uri_1, codeEditorWidget_1, editOperation_1, position_1, range_1, model_1, contextmenu_1, snippetController2_1, suggestController_1, contextkey_1, instantiation_1, colorRegistry_1, themeService_1, menuPreventer_1, simpleEditorOptions_1, selectionClipboard_1, editorExtensions_1, style_1, history_1, contextScopedHistoryWidget_1, serviceCollection_1, languageFeatures_1, wordHelper_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$XCb = exports.$WCb = exports.$VCb = void 0;
    let $VCb = class $VCb extends widget_1.$IP {
        constructor(id, parent, suggestionProvider, ariaLabel, resourceHandle, options, defaultInstantiationService, modelService, contextKeyService, languageFeaturesService, configurationService) {
            super();
            this.b = new event_1.$fd();
            this.onShouldFocusResults = this.b.event;
            this.c = new event_1.$fd();
            this.onInputDidChange = this.c.event;
            this.g = this.B(new event_1.$fd());
            this.onDidFocus = this.g.event;
            this.h = this.B(new event_1.$fd());
            this.onDidBlur = this.h.event;
            this.r = (0, dom_1.$0O)(parent, (0, dom_1.$)('.suggest-input-container'));
            this.element = parent;
            this.s = (0, dom_1.$0O)(this.r, (0, dom_1.$)('.suggest-input-placeholder', undefined, options.placeholderText || ''));
            const editorOptions = (0, objects_1.$Ym)((0, simpleEditorOptions_1.$uqb)(configurationService), getSuggestEnabledInputOptions(ariaLabel));
            editorOptions.overflowWidgetsDomNode = options.overflowWidgetsDomNode;
            const scopedContextKeyService = this.t(contextKeyService);
            const instantiationService = scopedContextKeyService
                ? defaultInstantiationService.createChild(new serviceCollection_1.$zh([contextkey_1.$3i, scopedContextKeyService]))
                : defaultInstantiationService;
            this.inputWidget = this.B(instantiationService.createInstance(codeEditorWidget_1.$uY, this.r, editorOptions, {
                contributions: editorExtensions_1.EditorExtensionsRegistry.getSomeEditorContributions([
                    suggestController_1.$G6.ID,
                    snippetController2_1.$05.ID,
                    contextmenu_1.$X6.ID,
                    menuPreventer_1.$0lb.ID,
                    selectionClipboard_1.$tqb,
                ]),
                isSimpleWidget: true,
            }));
            this.B(configurationService.onDidChangeConfiguration((e) => {
                if (e.affectsConfiguration('editor.accessibilitySupport') ||
                    e.affectsConfiguration('editor.cursorBlinking')) {
                    const accessibilitySupport = configurationService.getValue('editor.accessibilitySupport');
                    const cursorBlinking = configurationService.getValue('editor.cursorBlinking');
                    this.inputWidget.updateOptions({
                        accessibilitySupport,
                        cursorBlinking
                    });
                }
            }));
            this.B(this.inputWidget.onDidFocusEditorText(() => this.g.fire()));
            this.B(this.inputWidget.onDidBlurEditorText(() => this.h.fire()));
            const scopeHandle = uri_1.URI.parse(resourceHandle);
            this.n = modelService.createModel('', null, scopeHandle, true);
            this.B(this.n);
            this.inputWidget.setModel(this.n);
            this.B(this.inputWidget.onDidPaste(() => this.setValue(this.getValue()))); // setter cleanses
            this.B((this.inputWidget.onDidFocusEditorText(() => {
                if (options.focusContextKey) {
                    options.focusContextKey.set(true);
                }
                this.r.classList.add('synthetic-focus');
            })));
            this.B((this.inputWidget.onDidBlurEditorText(() => {
                if (options.focusContextKey) {
                    options.focusContextKey.set(false);
                }
                this.r.classList.remove('synthetic-focus');
            })));
            this.B(event_1.Event.chain(this.inputWidget.onKeyDown, $ => $.filter(e => e.keyCode === 3 /* KeyCode.Enter */))(e => { e.preventDefault(); /** Do nothing. Enter causes new line which is not expected. */ }, this));
            this.B(event_1.Event.chain(this.inputWidget.onKeyDown, $ => $.filter(e => e.keyCode === 18 /* KeyCode.DownArrow */ && (platform_1.$j ? e.metaKey : e.ctrlKey)))(() => this.b.fire(), this));
            let preexistingContent = this.getValue();
            const inputWidgetModel = this.inputWidget.getModel();
            if (inputWidgetModel) {
                this.B(inputWidgetModel.onDidChangeContent(() => {
                    const content = this.getValue();
                    this.s.style.visibility = content ? 'hidden' : 'visible';
                    if (preexistingContent.trim() === content.trim()) {
                        return;
                    }
                    this.c.fire(undefined);
                    preexistingContent = content;
                }));
            }
            const validatedSuggestProvider = {
                provideResults: suggestionProvider.provideResults,
                sortKey: suggestionProvider.sortKey || (a => a),
                triggerCharacters: suggestionProvider.triggerCharacters || [],
                wordDefinition: suggestionProvider.wordDefinition ? (0, wordHelper_1.$Xr)(suggestionProvider.wordDefinition) : undefined,
                alwaysShowSuggestions: !!suggestionProvider.alwaysShowSuggestions,
            };
            this.setValue(options.value || '');
            this.B(languageFeaturesService.completionProvider.register({ scheme: scopeHandle.scheme, pattern: '**/' + scopeHandle.path, hasAccessToAllModels: true }, {
                _debugDisplayName: `suggestEnabledInput/${id}`,
                triggerCharacters: validatedSuggestProvider.triggerCharacters,
                provideCompletionItems: (model, position, _context) => {
                    const query = model.getValue();
                    const zeroIndexedColumn = position.column - 1;
                    let alreadyTypedCount = 0, zeroIndexedWordStart = 0;
                    if (validatedSuggestProvider.wordDefinition) {
                        const wordAtText = (0, wordHelper_1.$Zr)(position.column, validatedSuggestProvider.wordDefinition, query, 0);
                        alreadyTypedCount = wordAtText?.word.length ?? 0;
                        zeroIndexedWordStart = wordAtText ? wordAtText.startColumn - 1 : 0;
                    }
                    else {
                        zeroIndexedWordStart = query.lastIndexOf(' ', zeroIndexedColumn - 1) + 1;
                        alreadyTypedCount = zeroIndexedColumn - zeroIndexedWordStart;
                    }
                    // dont show suggestions if the user has typed something, but hasn't used the trigger character
                    if (!validatedSuggestProvider.alwaysShowSuggestions && alreadyTypedCount > 0 && validatedSuggestProvider.triggerCharacters?.indexOf(query[zeroIndexedWordStart]) === -1) {
                        return { suggestions: [] };
                    }
                    return {
                        suggestions: suggestionProvider.provideResults(query).map((result) => {
                            let label;
                            let rest;
                            if (typeof result === 'string') {
                                label = result;
                            }
                            else {
                                label = result.label;
                                rest = result;
                            }
                            return {
                                label,
                                insertText: label,
                                range: range_1.$ks.fromPositions(position.delta(0, -alreadyTypedCount), position),
                                sortText: validatedSuggestProvider.sortKey(label),
                                kind: 17 /* languages.CompletionItemKind.Keyword */,
                                ...rest
                            };
                        })
                    };
                }
            }));
            this.w(options.styleOverrides || {});
        }
        t(_contextKeyService) {
            return undefined;
        }
        updateAriaLabel(label) {
            this.inputWidget.updateOptions({ ariaLabel: label });
        }
        setValue(val) {
            val = val.replace(/\s/g, ' ');
            const fullRange = this.n.getFullModelRange();
            this.inputWidget.executeEdits('suggestEnabledInput.setValue', [editOperation_1.$ls.replace(fullRange, val)]);
            this.inputWidget.setScrollTop(0);
            this.inputWidget.setPosition(new position_1.$js(1, val.length + 1));
        }
        getValue() {
            return this.inputWidget.getValue();
        }
        w(styleOverrides) {
            this.r.style.backgroundColor = (0, colorRegistry_1.$pv)(styleOverrides.inputBackground ?? colorRegistry_1.$Mv);
            this.r.style.color = (0, colorRegistry_1.$pv)(styleOverrides.inputForeground ?? colorRegistry_1.$Nv);
            this.s.style.color = (0, colorRegistry_1.$pv)(styleOverrides.inputPlaceholderForeground ?? colorRegistry_1.$Tv);
            this.r.style.borderWidth = '1px';
            this.r.style.borderStyle = 'solid';
            this.r.style.borderColor = (0, colorRegistry_1.$qv)(styleOverrides.inputBorder ?? colorRegistry_1.$Ov, 'transparent');
            const cursor = this.r.getElementsByClassName('cursor')[0];
            if (cursor) {
                cursor.style.backgroundColor = (0, colorRegistry_1.$pv)(styleOverrides.inputForeground ?? colorRegistry_1.$Nv);
            }
        }
        focus(selectAll) {
            this.inputWidget.focus();
            if (selectAll && this.inputWidget.getValue()) {
                this.y();
            }
        }
        onHide() {
            this.inputWidget.onHide();
        }
        layout(dimension) {
            this.inputWidget.layout(dimension);
            this.s.style.width = `${dimension.width - 2}px`;
        }
        y() {
            this.inputWidget.setSelection(new range_1.$ks(1, 1, 1, this.getValue().length + 1));
        }
    };
    exports.$VCb = $VCb;
    exports.$VCb = $VCb = __decorate([
        __param(6, instantiation_1.$Ah),
        __param(7, model_1.$yA),
        __param(8, contextkey_1.$3i),
        __param(9, languageFeatures_1.$hF),
        __param(10, configuration_1.$8h)
    ], $VCb);
    let $WCb = class $WCb extends $VCb {
        constructor({ id, parent, ariaLabel, suggestionProvider, resourceHandle, suggestOptions, history }, instantiationService, modelService, contextKeyService, languageFeaturesService, configurationService) {
            super(id, parent, suggestionProvider, ariaLabel, resourceHandle, suggestOptions, instantiationService, modelService, contextKeyService, languageFeaturesService, configurationService);
            this.J = new history_1.$pR(history, 100);
        }
        addToHistory() {
            const value = this.getValue();
            if (value && value !== this.L()) {
                this.J.add(value);
            }
        }
        getHistory() {
            return this.J.getHistory();
        }
        showNextValue() {
            if (!this.J.has(this.getValue())) {
                this.addToHistory();
            }
            let next = this.N();
            if (next) {
                next = next === this.getValue() ? this.N() : next;
            }
            this.setValue(next ?? '');
        }
        showPreviousValue() {
            if (!this.J.has(this.getValue())) {
                this.addToHistory();
            }
            let previous = this.M();
            if (previous) {
                previous = previous === this.getValue() ? this.M() : previous;
            }
            if (previous) {
                this.setValue(previous);
                this.inputWidget.setPosition({ lineNumber: 0, column: 0 });
            }
        }
        clearHistory() {
            this.J.clear();
        }
        L() {
            let currentValue = this.J.current();
            if (!currentValue) {
                currentValue = this.J.last();
                this.J.next();
            }
            return currentValue;
        }
        M() {
            return this.J.previous() || this.J.first();
        }
        N() {
            return this.J.next();
        }
    };
    exports.$WCb = $WCb;
    exports.$WCb = $WCb = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, model_1.$yA),
        __param(3, contextkey_1.$3i),
        __param(4, languageFeatures_1.$hF),
        __param(5, configuration_1.$8h)
    ], $WCb);
    let $XCb = class $XCb extends $WCb {
        constructor(options, instantiationService, modelService, contextKeyService, languageFeaturesService, configurationService) {
            super(options, instantiationService, modelService, contextKeyService, languageFeaturesService, configurationService);
            const { historyNavigationBackwardsEnablement, historyNavigationForwardsEnablement } = this.O;
            this.B(this.inputWidget.onDidChangeCursorPosition(({ position }) => {
                const viewModel = this.inputWidget._getViewModel();
                const lastLineNumber = viewModel.getLineCount();
                const lastLineCol = viewModel.getLineLength(lastLineNumber) + 1;
                const viewPosition = viewModel.coordinatesConverter.convertModelPositionToViewPosition(position);
                historyNavigationBackwardsEnablement.set(viewPosition.lineNumber === 1 && viewPosition.column === 1);
                historyNavigationForwardsEnablement.set(viewPosition.lineNumber === lastLineNumber && viewPosition.column === lastLineCol);
            }));
        }
        t(contextKeyService) {
            const scopedContextKeyService = this.B(contextKeyService.createScoped(this.element));
            this.O = this.B((0, contextScopedHistoryWidget_1.$R5)(scopedContextKeyService, this));
            return scopedContextKeyService;
        }
    };
    exports.$XCb = $XCb;
    exports.$XCb = $XCb = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, model_1.$yA),
        __param(3, contextkey_1.$3i),
        __param(4, languageFeatures_1.$hF),
        __param(5, configuration_1.$8h)
    ], $XCb);
    // Override styles in selections.ts
    (0, themeService_1.$mv)((theme, collector) => {
        const selectionBackgroundColor = theme.getColor(colorRegistry_1.$Cv);
        if (selectionBackgroundColor) {
            // Override inactive selection bg
            const inputBackgroundColor = theme.getColor(colorRegistry_1.$Mv);
            if (inputBackgroundColor) {
                collector.addRule(`.suggest-input-container .monaco-editor .selected-text { background-color: ${inputBackgroundColor.transparent(0.4)}; }`);
            }
            // Override selected fg
            const inputForegroundColor = theme.getColor(colorRegistry_1.$Nv);
            if (inputForegroundColor) {
                collector.addRule(`.suggest-input-container .monaco-editor .view-line span.inline-selected-text { color: ${inputForegroundColor}; }`);
            }
            const backgroundColor = theme.getColor(colorRegistry_1.$Mv);
            if (backgroundColor) {
                collector.addRule(`.suggest-input-container .monaco-editor-background { background-color: ${backgroundColor}; } `);
            }
            collector.addRule(`.suggest-input-container .monaco-editor .focused .selected-text { background-color: ${selectionBackgroundColor}; }`);
        }
        else {
            // Use editor selection color if theme has not set a selection background color
            collector.addRule(`.suggest-input-container .monaco-editor .focused .selected-text { background-color: ${theme.getColor(colorRegistry_1.$Nw)}; }`);
        }
    });
    function getSuggestEnabledInputOptions(ariaLabel) {
        return {
            fontSize: 13,
            lineHeight: 20,
            wordWrap: 'off',
            scrollbar: { vertical: 'hidden', },
            roundedSelection: false,
            guides: {
                indentation: false
            },
            cursorWidth: 1,
            fontFamily: style_1.$hqb,
            ariaLabel: ariaLabel || '',
            snippetSuggestions: 'none',
            suggest: { filterGraceful: false, showIcons: false },
            autoClosingBrackets: 'never'
        };
    }
});
//# sourceMappingURL=suggestEnabledInput.js.map