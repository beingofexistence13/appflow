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
define(["require", "exports", "vs/nls", "vs/base/browser/ui/selectBox/selectBox", "vs/base/common/lifecycle", "vs/base/browser/dom", "vs/editor/common/core/position", "vs/editor/contrib/zoneWidget/browser/zoneWidget", "vs/platform/contextview/browser/contextView", "vs/workbench/contrib/debug/common/debug", "vs/platform/theme/common/themeService", "vs/platform/instantiation/common/instantiation", "vs/platform/contextkey/common/contextkey", "vs/editor/browser/editorExtensions", "vs/editor/common/editorContextKeys", "vs/editor/common/services/model", "vs/base/common/uri", "vs/editor/contrib/suggest/browser/suggest", "vs/editor/browser/services/codeEditorService", "vs/platform/theme/common/colorRegistry", "vs/platform/instantiation/common/serviceCollection", "vs/editor/browser/widget/codeEditorWidget", "vs/workbench/contrib/codeEditor/browser/simpleEditorOptions", "vs/editor/common/core/range", "vs/base/common/errors", "vs/platform/configuration/common/configuration", "vs/editor/common/languages/modesRegistry", "vs/editor/common/services/languageFeatures", "vs/platform/theme/browser/defaultStyles", "vs/platform/keybinding/common/keybinding", "vs/css!./media/breakpointWidget"], function (require, exports, nls, selectBox_1, lifecycle, dom, position_1, zoneWidget_1, contextView_1, debug_1, themeService_1, instantiation_1, contextkey_1, editorExtensions_1, editorContextKeys_1, model_1, uri_1, suggest_1, codeEditorService_1, colorRegistry_1, serviceCollection_1, codeEditorWidget_1, simpleEditorOptions_1, range_1, errors_1, configuration_1, modesRegistry_1, languageFeatures_1, defaultStyles_1, keybinding_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BreakpointWidget = void 0;
    const $ = dom.$;
    const IPrivateBreakpointWidgetService = (0, instantiation_1.createDecorator)('privateBreakpointWidgetService');
    const DECORATION_KEY = 'breakpointwidgetdecoration';
    function isPositionInCurlyBracketBlock(input) {
        const model = input.getModel();
        const bracketPairs = model.bracketPairs.getBracketPairsInRange(range_1.Range.fromPositions(input.getPosition()));
        return bracketPairs.some(p => p.openingBracketInfo.bracketText === '{');
    }
    function createDecorations(theme, placeHolder) {
        const transparentForeground = theme.getColor(colorRegistry_1.editorForeground)?.transparent(0.4);
        return [{
                range: {
                    startLineNumber: 0,
                    endLineNumber: 0,
                    startColumn: 0,
                    endColumn: 1
                },
                renderOptions: {
                    after: {
                        contentText: placeHolder,
                        color: transparentForeground ? transparentForeground.toString() : undefined
                    }
                }
            }];
    }
    let BreakpointWidget = class BreakpointWidget extends zoneWidget_1.ZoneWidget {
        constructor(editor, lineNumber, column, context, contextViewService, debugService, themeService, contextKeyService, instantiationService, modelService, codeEditorService, _configurationService, languageFeaturesService, keybindingService) {
            super(editor, { showFrame: true, showArrow: false, frameWidth: 1, isAccessible: true });
            this.lineNumber = lineNumber;
            this.column = column;
            this.contextViewService = contextViewService;
            this.debugService = debugService;
            this.themeService = themeService;
            this.contextKeyService = contextKeyService;
            this.instantiationService = instantiationService;
            this.modelService = modelService;
            this.codeEditorService = codeEditorService;
            this._configurationService = _configurationService;
            this.languageFeaturesService = languageFeaturesService;
            this.keybindingService = keybindingService;
            this.conditionInput = '';
            this.hitCountInput = '';
            this.logMessageInput = '';
            this.toDispose = [];
            const model = this.editor.getModel();
            if (model) {
                const uri = model.uri;
                const breakpoints = this.debugService.getModel().getBreakpoints({ lineNumber: this.lineNumber, column: this.column, uri });
                this.breakpoint = breakpoints.length ? breakpoints[0] : undefined;
            }
            if (context === undefined) {
                if (this.breakpoint && !this.breakpoint.condition && !this.breakpoint.hitCondition && this.breakpoint.logMessage) {
                    this.context = 2 /* Context.LOG_MESSAGE */;
                }
                else if (this.breakpoint && !this.breakpoint.condition && this.breakpoint.hitCondition) {
                    this.context = 1 /* Context.HIT_COUNT */;
                }
                else {
                    this.context = 0 /* Context.CONDITION */;
                }
            }
            else {
                this.context = context;
            }
            this.toDispose.push(this.debugService.getModel().onDidChangeBreakpoints(e => {
                if (this.breakpoint && e && e.removed && e.removed.indexOf(this.breakpoint) >= 0) {
                    this.dispose();
                }
            }));
            this.codeEditorService.registerDecorationType('breakpoint-widget', DECORATION_KEY, {});
            this.create();
        }
        get placeholder() {
            const acceptString = this.keybindingService.lookupKeybinding(AcceptBreakpointWidgetInputAction.ID)?.getLabel() || 'Enter';
            const closeString = this.keybindingService.lookupKeybinding(CloseBreakpointWidgetCommand.ID)?.getLabel() || 'Escape';
            switch (this.context) {
                case 2 /* Context.LOG_MESSAGE */:
                    return nls.localize('breakpointWidgetLogMessagePlaceholder', "Message to log when breakpoint is hit. Expressions within {} are interpolated. '{0}' to accept, '{1}' to cancel.", acceptString, closeString);
                case 1 /* Context.HIT_COUNT */:
                    return nls.localize('breakpointWidgetHitCountPlaceholder', "Break when hit count condition is met. '{0}' to accept, '{1}' to cancel.", acceptString, closeString);
                default:
                    return nls.localize('breakpointWidgetExpressionPlaceholder', "Break when expression evaluates to true. '{0}' to accept, '{1}' to cancel.", acceptString, closeString);
            }
        }
        getInputValue(breakpoint) {
            switch (this.context) {
                case 2 /* Context.LOG_MESSAGE */:
                    return breakpoint && breakpoint.logMessage ? breakpoint.logMessage : this.logMessageInput;
                case 1 /* Context.HIT_COUNT */:
                    return breakpoint && breakpoint.hitCondition ? breakpoint.hitCondition : this.hitCountInput;
                default:
                    return breakpoint && breakpoint.condition ? breakpoint.condition : this.conditionInput;
            }
        }
        rememberInput() {
            const value = this.input.getModel().getValue();
            switch (this.context) {
                case 2 /* Context.LOG_MESSAGE */:
                    this.logMessageInput = value;
                    break;
                case 1 /* Context.HIT_COUNT */:
                    this.hitCountInput = value;
                    break;
                default:
                    this.conditionInput = value;
            }
        }
        setInputMode() {
            if (this.editor.hasModel()) {
                // Use plaintext language for log messages, otherwise respect underlying editor language #125619
                const languageId = this.context === 2 /* Context.LOG_MESSAGE */ ? modesRegistry_1.PLAINTEXT_LANGUAGE_ID : this.editor.getModel().getLanguageId();
                this.input.getModel().setLanguage(languageId);
            }
        }
        show(rangeOrPos) {
            const lineNum = this.input.getModel().getLineCount();
            super.show(rangeOrPos, lineNum + 1);
        }
        fitHeightToContent() {
            const lineNum = this.input.getModel().getLineCount();
            this._relayout(lineNum + 1);
        }
        _fillContainer(container) {
            this.setCssClass('breakpoint-widget');
            const selectBox = new selectBox_1.SelectBox([{ text: nls.localize('expression', "Expression") }, { text: nls.localize('hitCount', "Hit Count") }, { text: nls.localize('logMessage', "Log Message") }], this.context, this.contextViewService, defaultStyles_1.defaultSelectBoxStyles, { ariaLabel: nls.localize('breakpointType', 'Breakpoint Type') });
            this.selectContainer = $('.breakpoint-select-container');
            selectBox.render(dom.append(container, this.selectContainer));
            selectBox.onDidSelect(e => {
                this.rememberInput();
                this.context = e.index;
                this.setInputMode();
                const value = this.getInputValue(this.breakpoint);
                this.input.getModel().setValue(value);
                this.input.focus();
            });
            this.inputContainer = $('.inputContainer');
            this.createBreakpointInput(dom.append(container, this.inputContainer));
            this.input.getModel().setValue(this.getInputValue(this.breakpoint));
            this.toDispose.push(this.input.getModel().onDidChangeContent(() => {
                this.fitHeightToContent();
            }));
            this.input.setPosition({ lineNumber: 1, column: this.input.getModel().getLineMaxColumn(1) });
            // Due to an electron bug we have to do the timeout, otherwise we do not get focus
            setTimeout(() => this.input.focus(), 150);
        }
        _doLayout(heightInPixel, widthInPixel) {
            this.heightInPx = heightInPixel;
            this.input.layout({ height: heightInPixel, width: widthInPixel - 113 });
            this.centerInputVertically();
        }
        _onWidth(widthInPixel) {
            if (typeof this.heightInPx === 'number') {
                this._doLayout(this.heightInPx, widthInPixel);
            }
        }
        createBreakpointInput(container) {
            const scopedContextKeyService = this.contextKeyService.createScoped(container);
            this.toDispose.push(scopedContextKeyService);
            const scopedInstatiationService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, scopedContextKeyService], [IPrivateBreakpointWidgetService, this]));
            const options = this.createEditorOptions();
            const codeEditorWidgetOptions = (0, simpleEditorOptions_1.getSimpleCodeEditorWidgetOptions)();
            this.input = scopedInstatiationService.createInstance(codeEditorWidget_1.CodeEditorWidget, container, options, codeEditorWidgetOptions);
            debug_1.CONTEXT_IN_BREAKPOINT_WIDGET.bindTo(scopedContextKeyService).set(true);
            const model = this.modelService.createModel('', null, uri_1.URI.parse(`${debug_1.DEBUG_SCHEME}:${this.editor.getId()}:breakpointinput`), true);
            if (this.editor.hasModel()) {
                model.setLanguage(this.editor.getModel().getLanguageId());
            }
            this.input.setModel(model);
            this.setInputMode();
            this.toDispose.push(model);
            const setDecorations = () => {
                const value = this.input.getModel().getValue();
                const decorations = !!value ? [] : createDecorations(this.themeService.getColorTheme(), this.placeholder);
                this.input.setDecorationsByType('breakpoint-widget', DECORATION_KEY, decorations);
            };
            this.input.getModel().onDidChangeContent(() => setDecorations());
            this.themeService.onDidColorThemeChange(() => setDecorations());
            this.toDispose.push(this.languageFeaturesService.completionProvider.register({ scheme: debug_1.DEBUG_SCHEME, hasAccessToAllModels: true }, {
                _debugDisplayName: 'breakpointWidget',
                provideCompletionItems: (model, position, _context, token) => {
                    let suggestionsPromise;
                    const underlyingModel = this.editor.getModel();
                    if (underlyingModel && (this.context === 0 /* Context.CONDITION */ || (this.context === 2 /* Context.LOG_MESSAGE */ && isPositionInCurlyBracketBlock(this.input)))) {
                        suggestionsPromise = (0, suggest_1.provideSuggestionItems)(this.languageFeaturesService.completionProvider, underlyingModel, new position_1.Position(this.lineNumber, 1), new suggest_1.CompletionOptions(undefined, new Set().add(27 /* CompletionItemKind.Snippet */)), _context, token).then(suggestions => {
                            let overwriteBefore = 0;
                            if (this.context === 0 /* Context.CONDITION */) {
                                overwriteBefore = position.column - 1;
                            }
                            else {
                                // Inside the currly brackets, need to count how many useful characters are behind the position so they would all be taken into account
                                const value = this.input.getModel().getValue();
                                while ((position.column - 2 - overwriteBefore >= 0) && value[position.column - 2 - overwriteBefore] !== '{' && value[position.column - 2 - overwriteBefore] !== ' ') {
                                    overwriteBefore++;
                                }
                            }
                            return {
                                suggestions: suggestions.items.map(s => {
                                    s.completion.range = range_1.Range.fromPositions(position.delta(0, -overwriteBefore), position);
                                    return s.completion;
                                })
                            };
                        });
                    }
                    else {
                        suggestionsPromise = Promise.resolve({ suggestions: [] });
                    }
                    return suggestionsPromise;
                }
            }));
            this.toDispose.push(this._configurationService.onDidChangeConfiguration((e) => {
                if (e.affectsConfiguration('editor.fontSize') || e.affectsConfiguration('editor.lineHeight')) {
                    this.input.updateOptions(this.createEditorOptions());
                    this.centerInputVertically();
                }
            }));
        }
        createEditorOptions() {
            const editorConfig = this._configurationService.getValue('editor');
            const options = (0, simpleEditorOptions_1.getSimpleEditorOptions)(this._configurationService);
            options.fontSize = editorConfig.fontSize;
            options.fontFamily = editorConfig.fontFamily;
            options.lineHeight = editorConfig.lineHeight;
            options.fontLigatures = editorConfig.fontLigatures;
            options.ariaLabel = this.placeholder;
            return options;
        }
        centerInputVertically() {
            if (this.container && typeof this.heightInPx === 'number') {
                const lineHeight = this.input.getOption(66 /* EditorOption.lineHeight */);
                const lineNum = this.input.getModel().getLineCount();
                const newTopMargin = (this.heightInPx - lineNum * lineHeight) / 2;
                this.inputContainer.style.marginTop = newTopMargin + 'px';
            }
        }
        close(success) {
            if (success) {
                // if there is already a breakpoint on this location - remove it.
                let condition = this.breakpoint && this.breakpoint.condition;
                let hitCondition = this.breakpoint && this.breakpoint.hitCondition;
                let logMessage = this.breakpoint && this.breakpoint.logMessage;
                this.rememberInput();
                if (this.conditionInput || this.context === 0 /* Context.CONDITION */) {
                    condition = this.conditionInput;
                }
                if (this.hitCountInput || this.context === 1 /* Context.HIT_COUNT */) {
                    hitCondition = this.hitCountInput;
                }
                if (this.logMessageInput || this.context === 2 /* Context.LOG_MESSAGE */) {
                    logMessage = this.logMessageInput;
                }
                if (this.breakpoint) {
                    const data = new Map();
                    data.set(this.breakpoint.getId(), {
                        condition,
                        hitCondition,
                        logMessage
                    });
                    this.debugService.updateBreakpoints(this.breakpoint.originalUri, data, false).then(undefined, errors_1.onUnexpectedError);
                }
                else {
                    const model = this.editor.getModel();
                    if (model) {
                        this.debugService.addBreakpoints(model.uri, [{
                                lineNumber: this.lineNumber,
                                column: this.column,
                                enabled: true,
                                condition,
                                hitCondition,
                                logMessage
                            }]);
                    }
                }
            }
            this.dispose();
        }
        dispose() {
            super.dispose();
            this.input.dispose();
            lifecycle.dispose(this.toDispose);
            setTimeout(() => this.editor.focus(), 0);
        }
    };
    exports.BreakpointWidget = BreakpointWidget;
    exports.BreakpointWidget = BreakpointWidget = __decorate([
        __param(4, contextView_1.IContextViewService),
        __param(5, debug_1.IDebugService),
        __param(6, themeService_1.IThemeService),
        __param(7, contextkey_1.IContextKeyService),
        __param(8, instantiation_1.IInstantiationService),
        __param(9, model_1.IModelService),
        __param(10, codeEditorService_1.ICodeEditorService),
        __param(11, configuration_1.IConfigurationService),
        __param(12, languageFeatures_1.ILanguageFeaturesService),
        __param(13, keybinding_1.IKeybindingService)
    ], BreakpointWidget);
    class AcceptBreakpointWidgetInputAction extends editorExtensions_1.EditorCommand {
        static { this.ID = 'breakpointWidget.action.acceptInput'; }
        constructor() {
            super({
                id: AcceptBreakpointWidgetInputAction.ID,
                precondition: debug_1.CONTEXT_BREAKPOINT_WIDGET_VISIBLE,
                kbOpts: {
                    kbExpr: debug_1.CONTEXT_IN_BREAKPOINT_WIDGET,
                    primary: 3 /* KeyCode.Enter */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        runEditorCommand(accessor, editor) {
            accessor.get(IPrivateBreakpointWidgetService).close(true);
        }
    }
    class CloseBreakpointWidgetCommand extends editorExtensions_1.EditorCommand {
        static { this.ID = 'closeBreakpointWidget'; }
        constructor() {
            super({
                id: CloseBreakpointWidgetCommand.ID,
                precondition: debug_1.CONTEXT_BREAKPOINT_WIDGET_VISIBLE,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 9 /* KeyCode.Escape */,
                    secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */],
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        runEditorCommand(accessor, editor, args) {
            const debugContribution = editor.getContribution(debug_1.BREAKPOINT_EDITOR_CONTRIBUTION_ID);
            if (debugContribution) {
                // if focus is in outer editor we need to use the debug contribution to close
                return debugContribution.closeBreakpointWidget();
            }
            accessor.get(IPrivateBreakpointWidgetService).close(false);
        }
    }
    (0, editorExtensions_1.registerEditorCommand)(new AcceptBreakpointWidgetInputAction());
    (0, editorExtensions_1.registerEditorCommand)(new CloseBreakpointWidgetCommand());
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJlYWtwb2ludFdpZGdldC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2RlYnVnL2Jyb3dzZXIvYnJlYWtwb2ludFdpZGdldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUF3Q2hHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDaEIsTUFBTSwrQkFBK0IsR0FBRyxJQUFBLCtCQUFlLEVBQWtDLGdDQUFnQyxDQUFDLENBQUM7SUFLM0gsTUFBTSxjQUFjLEdBQUcsNEJBQTRCLENBQUM7SUFFcEQsU0FBUyw2QkFBNkIsQ0FBQyxLQUF3QjtRQUM5RCxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDL0IsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQyxzQkFBc0IsQ0FBQyxhQUFLLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDekcsT0FBTyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLFdBQVcsS0FBSyxHQUFHLENBQUMsQ0FBQztJQUN6RSxDQUFDO0lBRUQsU0FBUyxpQkFBaUIsQ0FBQyxLQUFrQixFQUFFLFdBQW1CO1FBQ2pFLE1BQU0scUJBQXFCLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxnQ0FBZ0IsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNqRixPQUFPLENBQUM7Z0JBQ1AsS0FBSyxFQUFFO29CQUNOLGVBQWUsRUFBRSxDQUFDO29CQUNsQixhQUFhLEVBQUUsQ0FBQztvQkFDaEIsV0FBVyxFQUFFLENBQUM7b0JBQ2QsU0FBUyxFQUFFLENBQUM7aUJBQ1o7Z0JBQ0QsYUFBYSxFQUFFO29CQUNk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