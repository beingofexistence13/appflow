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
    exports.ContextScopedSuggestEnabledInputWithHistory = exports.SuggestEnabledInputWithHistory = exports.SuggestEnabledInput = void 0;
    let SuggestEnabledInput = class SuggestEnabledInput extends widget_1.Widget {
        constructor(id, parent, suggestionProvider, ariaLabel, resourceHandle, options, defaultInstantiationService, modelService, contextKeyService, languageFeaturesService, configurationService) {
            super();
            this._onShouldFocusResults = new event_1.Emitter();
            this.onShouldFocusResults = this._onShouldFocusResults.event;
            this._onInputDidChange = new event_1.Emitter();
            this.onInputDidChange = this._onInputDidChange.event;
            this._onDidFocus = this._register(new event_1.Emitter());
            this.onDidFocus = this._onDidFocus.event;
            this._onDidBlur = this._register(new event_1.Emitter());
            this.onDidBlur = this._onDidBlur.event;
            this.stylingContainer = (0, dom_1.append)(parent, (0, dom_1.$)('.suggest-input-container'));
            this.element = parent;
            this.placeholderText = (0, dom_1.append)(this.stylingContainer, (0, dom_1.$)('.suggest-input-placeholder', undefined, options.placeholderText || ''));
            const editorOptions = (0, objects_1.mixin)((0, simpleEditorOptions_1.getSimpleEditorOptions)(configurationService), getSuggestEnabledInputOptions(ariaLabel));
            editorOptions.overflowWidgetsDomNode = options.overflowWidgetsDomNode;
            const scopedContextKeyService = this.getScopedContextKeyService(contextKeyService);
            const instantiationService = scopedContextKeyService
                ? defaultInstantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, scopedContextKeyService]))
                : defaultInstantiationService;
            this.inputWidget = this._register(instantiationService.createInstance(codeEditorWidget_1.CodeEditorWidget, this.stylingContainer, editorOptions, {
                contributions: editorExtensions_1.EditorExtensionsRegistry.getSomeEditorContributions([
                    suggestController_1.SuggestController.ID,
                    snippetController2_1.SnippetController2.ID,
                    contextmenu_1.ContextMenuController.ID,
                    menuPreventer_1.MenuPreventer.ID,
                    selectionClipboard_1.SelectionClipboardContributionID,
                ]),
                isSimpleWidget: true,
            }));
            this._register(configurationService.onDidChangeConfiguration((e) => {
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
            this._register(this.inputWidget.onDidFocusEditorText(() => this._onDidFocus.fire()));
            this._register(this.inputWidget.onDidBlurEditorText(() => this._onDidBlur.fire()));
            const scopeHandle = uri_1.URI.parse(resourceHandle);
            this.inputModel = modelService.createModel('', null, scopeHandle, true);
            this._register(this.inputModel);
            this.inputWidget.setModel(this.inputModel);
            this._register(this.inputWidget.onDidPaste(() => this.setValue(this.getValue()))); // setter cleanses
            this._register((this.inputWidget.onDidFocusEditorText(() => {
                if (options.focusContextKey) {
                    options.focusContextKey.set(true);
                }
                this.stylingContainer.classList.add('synthetic-focus');
            })));
            this._register((this.inputWidget.onDidBlurEditorText(() => {
                if (options.focusContextKey) {
                    options.focusContextKey.set(false);
                }
                this.stylingContainer.classList.remove('synthetic-focus');
            })));
            this._register(event_1.Event.chain(this.inputWidget.onKeyDown, $ => $.filter(e => e.keyCode === 3 /* KeyCode.Enter */))(e => { e.preventDefault(); /** Do nothing. Enter causes new line which is not expected. */ }, this));
            this._register(event_1.Event.chain(this.inputWidget.onKeyDown, $ => $.filter(e => e.keyCode === 18 /* KeyCode.DownArrow */ && (platform_1.isMacintosh ? e.metaKey : e.ctrlKey)))(() => this._onShouldFocusResults.fire(), this));
            let preexistingContent = this.getValue();
            const inputWidgetModel = this.inputWidget.getModel();
            if (inputWidgetModel) {
                this._register(inputWidgetModel.onDidChangeContent(() => {
                    const content = this.getValue();
                    this.placeholderText.style.visibility = content ? 'hidden' : 'visible';
                    if (preexistingContent.trim() === content.trim()) {
                        return;
                    }
                    this._onInputDidChange.fire(undefined);
                    preexistingContent = content;
                }));
            }
            const validatedSuggestProvider = {
                provideResults: suggestionProvider.provideResults,
                sortKey: suggestionProvider.sortKey || (a => a),
                triggerCharacters: suggestionProvider.triggerCharacters || [],
                wordDefinition: suggestionProvider.wordDefinition ? (0, wordHelper_1.ensureValidWordDefinition)(suggestionProvider.wordDefinition) : undefined,
                alwaysShowSuggestions: !!suggestionProvider.alwaysShowSuggestions,
            };
            this.setValue(options.value || '');
            this._register(languageFeaturesService.completionProvider.register({ scheme: scopeHandle.scheme, pattern: '**/' + scopeHandle.path, hasAccessToAllModels: true }, {
                _debugDisplayName: `suggestEnabledInput/${id}`,
                triggerCharacters: validatedSuggestProvider.triggerCharacters,
                provideCompletionItems: (model, position, _context) => {
                    const query = model.getValue();
                    const zeroIndexedColumn = position.column - 1;
                    let alreadyTypedCount = 0, zeroIndexedWordStart = 0;
                    if (validatedSuggestProvider.wordDefinition) {
                        const wordAtText = (0, wordHelper_1.getWordAtText)(position.column, validatedSuggestProvider.wordDefinition, query, 0);
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
                                range: range_1.Range.fromPositions(position.delta(0, -alreadyTypedCount), position),
                                sortText: validatedSuggestProvider.sortKey(label),
                                kind: 17 /* languages.CompletionItemKind.Keyword */,
                                ...rest
                            };
                        })
                    };
                }
            }));
            this.style(options.styleOverrides || {});
        }
        getScopedContextKeyService(_contextKeyService) {
            return undefined;
        }
        updateAriaLabel(label) {
            this.inputWidget.updateOptions({ ariaLabel: label });
        }
        setValue(val) {
            val = val.replace(/\s/g, ' ');
            const fullRange = this.inputModel.getFullModelRange();
            this.inputWidget.executeEdits('suggestEnabledInput.setValue', [editOperation_1.EditOperation.replace(fullRange, val)]);
            this.inputWidget.setScrollTop(0);
            this.inputWidget.setPosition(new position_1.Position(1, val.length + 1));
        }
        getValue() {
            return this.inputWidget.getValue();
        }
        style(styleOverrides) {
            this.stylingContainer.style.backgroundColor = (0, colorRegistry_1.asCssVariable)(styleOverrides.inputBackground ?? colorRegistry_1.inputBackground);
            this.stylingContainer.style.color = (0, colorRegistry_1.asCssVariable)(styleOverrides.inputForeground ?? colorRegistry_1.inputForeground);
            this.placeholderText.style.color = (0, colorRegistry_1.asCssVariable)(styleOverrides.inputPlaceholderForeground ?? colorRegistry_1.inputPlaceholderForeground);
            this.stylingContainer.style.borderWidth = '1px';
            this.stylingContainer.style.borderStyle = 'solid';
            this.stylingContainer.style.borderColor = (0, colorRegistry_1.asCssVariableWithDefault)(styleOverrides.inputBorder ?? colorRegistry_1.inputBorder, 'transparent');
            const cursor = this.stylingContainer.getElementsByClassName('cursor')[0];
            if (cursor) {
                cursor.style.backgroundColor = (0, colorRegistry_1.asCssVariable)(styleOverrides.inputForeground ?? colorRegistry_1.inputForeground);
            }
        }
        focus(selectAll) {
            this.inputWidget.focus();
            if (selectAll && this.inputWidget.getValue()) {
                this.selectAll();
            }
        }
        onHide() {
            this.inputWidget.onHide();
        }
        layout(dimension) {
            this.inputWidget.layout(dimension);
            this.placeholderText.style.width = `${dimension.width - 2}px`;
        }
        selectAll() {
            this.inputWidget.setSelection(new range_1.Range(1, 1, 1, this.getValue().length + 1));
        }
    };
    exports.SuggestEnabledInput = SuggestEnabledInput;
    exports.SuggestEnabledInput = SuggestEnabledInput = __decorate([
        __param(6, instantiation_1.IInstantiationService),
        __param(7, model_1.IModelService),
        __param(8, contextkey_1.IContextKeyService),
        __param(9, languageFeatures_1.ILanguageFeaturesService),
        __param(10, configuration_1.IConfigurationService)
    ], SuggestEnabledInput);
    let SuggestEnabledInputWithHistory = class SuggestEnabledInputWithHistory extends SuggestEnabledInput {
        constructor({ id, parent, ariaLabel, suggestionProvider, resourceHandle, suggestOptions, history }, instantiationService, modelService, contextKeyService, languageFeaturesService, configurationService) {
            super(id, parent, suggestionProvider, ariaLabel, resourceHandle, suggestOptions, instantiationService, modelService, contextKeyService, languageFeaturesService, configurationService);
            this.history = new history_1.HistoryNavigator(history, 100);
        }
        addToHistory() {
            const value = this.getValue();
            if (value && value !== this.getCurrentValue()) {
                this.history.add(value);
            }
        }
        getHistory() {
            return this.history.getHistory();
        }
        showNextValue() {
            if (!this.history.has(this.getValue())) {
                this.addToHistory();
            }
            let next = this.getNextValue();
            if (next) {
                next = next === this.getValue() ? this.getNextValue() : next;
            }
            this.setValue(next ?? '');
        }
        showPreviousValue() {
            if (!this.history.has(this.getValue())) {
                this.addToHistory();
            }
            let previous = this.getPreviousValue();
            if (previous) {
                previous = previous === this.getValue() ? this.getPreviousValue() : previous;
            }
            if (previous) {
                this.setValue(previous);
                this.inputWidget.setPosition({ lineNumber: 0, column: 0 });
            }
        }
        clearHistory() {
            this.history.clear();
        }
        getCurrentValue() {
            let currentValue = this.history.current();
            if (!currentValue) {
                currentValue = this.history.last();
                this.history.next();
            }
            return currentValue;
        }
        getPreviousValue() {
            return this.history.previous() || this.history.first();
        }
        getNextValue() {
            return this.history.next();
        }
    };
    exports.SuggestEnabledInputWithHistory = SuggestEnabledInputWithHistory;
    exports.SuggestEnabledInputWithHistory = SuggestEnabledInputWithHistory = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, model_1.IModelService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, languageFeatures_1.ILanguageFeaturesService),
        __param(5, configuration_1.IConfigurationService)
    ], SuggestEnabledInputWithHistory);
    let ContextScopedSuggestEnabledInputWithHistory = class ContextScopedSuggestEnabledInputWithHistory extends SuggestEnabledInputWithHistory {
        constructor(options, instantiationService, modelService, contextKeyService, languageFeaturesService, configurationService) {
            super(options, instantiationService, modelService, contextKeyService, languageFeaturesService, configurationService);
            const { historyNavigationBackwardsEnablement, historyNavigationForwardsEnablement } = this.historyContext;
            this._register(this.inputWidget.onDidChangeCursorPosition(({ position }) => {
                const viewModel = this.inputWidget._getViewModel();
                const lastLineNumber = viewModel.getLineCount();
                const lastLineCol = viewModel.getLineLength(lastLineNumber) + 1;
                const viewPosition = viewModel.coordinatesConverter.convertModelPositionToViewPosition(position);
                historyNavigationBackwardsEnablement.set(viewPosition.lineNumber === 1 && viewPosition.column === 1);
                historyNavigationForwardsEnablement.set(viewPosition.lineNumber === lastLineNumber && viewPosition.column === lastLineCol);
            }));
        }
        getScopedContextKeyService(contextKeyService) {
            const scopedContextKeyService = this._register(contextKeyService.createScoped(this.element));
            this.historyContext = this._register((0, contextScopedHistoryWidget_1.registerAndCreateHistoryNavigationContext)(scopedContextKeyService, this));
            return scopedContextKeyService;
        }
    };
    exports.ContextScopedSuggestEnabledInputWithHistory = ContextScopedSuggestEnabledInputWithHistory;
    exports.ContextScopedSuggestEnabledInputWithHistory = ContextScopedSuggestEnabledInputWithHistory = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, model_1.IModelService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, languageFeatures_1.ILanguageFeaturesService),
        __param(5, configuration_1.IConfigurationService)
    ], ContextScopedSuggestEnabledInputWithHistory);
    // Override styles in selections.ts
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const selectionBackgroundColor = theme.getColor(colorRegistry_1.selectionBackground);
        if (selectionBackgroundColor) {
            // Override inactive selection bg
            const inputBackgroundColor = theme.getColor(colorRegistry_1.inputBackground);
            if (inputBackgroundColor) {
                collector.addRule(`.suggest-input-container .monaco-editor .selected-text { background-color: ${inputBackgroundColor.transparent(0.4)}; }`);
            }
            // Override selected fg
            const inputForegroundColor = theme.getColor(colorRegistry_1.inputForeground);
            if (inputForegroundColor) {
                collector.addRule(`.suggest-input-container .monaco-editor .view-line span.inline-selected-text { color: ${inputForegroundColor}; }`);
            }
            const backgroundColor = theme.getColor(colorRegistry_1.inputBackground);
            if (backgroundColor) {
                collector.addRule(`.suggest-input-container .monaco-editor-background { background-color: ${backgroundColor}; } `);
            }
            collector.addRule(`.suggest-input-container .monaco-editor .focused .selected-text { background-color: ${selectionBackgroundColor}; }`);
        }
        else {
            // Use editor selection color if theme has not set a selection background color
            collector.addRule(`.suggest-input-container .monaco-editor .focused .selected-text { background-color: ${theme.getColor(colorRegistry_1.editorSelectionBackground)}; }`);
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
            fontFamily: style_1.DEFAULT_FONT_FAMILY,
            ariaLabel: ariaLabel || '',
            snippetSuggestions: 'none',
            suggest: { filterGraceful: false, showIcons: false },
            autoClosingBrackets: 'never'
        };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VnZ2VzdEVuYWJsZWRJbnB1dC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NvZGVFZGl0b3IvYnJvd3Nlci9zdWdnZXN0RW5hYmxlZElucHV0L3N1Z2dlc3RFbmFibGVkSW5wdXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBa0h6RixJQUFNLG1CQUFtQixHQUF6QixNQUFNLG1CQUFvQixTQUFRLGVBQU07UUFvQjlDLFlBQ0MsRUFBVSxFQUNWLE1BQW1CLEVBQ25CLGtCQUEwQyxFQUMxQyxTQUFpQixFQUNqQixjQUFzQixFQUN0QixPQUFtQyxFQUNaLDJCQUFrRCxFQUMxRCxZQUEyQixFQUN0QixpQkFBcUMsRUFDL0IsdUJBQWlELEVBQ3BELG9CQUEyQztZQUVsRSxLQUFLLEVBQUUsQ0FBQztZQS9CUSwwQkFBcUIsR0FBRyxJQUFJLGVBQU8sRUFBUSxDQUFDO1lBQ3BELHlCQUFvQixHQUFnQixJQUFJLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDO1lBRTdELHNCQUFpQixHQUFHLElBQUksZUFBTyxFQUFzQixDQUFDO1lBQzlELHFCQUFnQixHQUE4QixJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDO1lBRW5FLGdCQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7WUFDMUQsZUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDO1lBRTVCLGVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUN6RCxjQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUM7WUF1QjFDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFBLFlBQU0sRUFBQyxNQUFNLEVBQUUsSUFBQSxP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