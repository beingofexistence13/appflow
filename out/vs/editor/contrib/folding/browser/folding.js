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
define(["require", "exports", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/keyCodes", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/base/common/types", "vs/editor/browser/stableEditorScroll", "vs/editor/browser/editorExtensions", "vs/editor/common/editorContextKeys", "vs/editor/common/languages", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/contrib/folding/browser/foldingModel", "vs/editor/contrib/folding/browser/hiddenRangeModel", "vs/editor/contrib/folding/browser/indentRangeProvider", "vs/nls", "vs/platform/contextkey/common/contextkey", "./foldingDecorations", "./foldingRanges", "./syntaxRangeProvider", "vs/platform/notification/common/notification", "vs/editor/common/services/languageFeatureDebounce", "vs/base/common/stopwatch", "vs/editor/common/services/languageFeatures", "vs/base/common/event", "vs/platform/commands/common/commands", "vs/base/common/uri", "vs/editor/common/services/model", "vs/platform/configuration/common/configuration", "vs/css!./folding"], function (require, exports, async_1, cancellation_1, errors_1, keyCodes_1, lifecycle_1, strings_1, types, stableEditorScroll_1, editorExtensions_1, editorContextKeys_1, languages_1, languageConfigurationRegistry_1, foldingModel_1, hiddenRangeModel_1, indentRangeProvider_1, nls, contextkey_1, foldingDecorations_1, foldingRanges_1, syntaxRangeProvider_1, notification_1, languageFeatureDebounce_1, stopwatch_1, languageFeatures_1, event_1, commands_1, uri_1, model_1, configuration_1) {
    "use strict";
    var FoldingController_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RangesLimitReporter = exports.FoldingController = void 0;
    const CONTEXT_FOLDING_ENABLED = new contextkey_1.RawContextKey('foldingEnabled', false);
    let FoldingController = class FoldingController extends lifecycle_1.Disposable {
        static { FoldingController_1 = this; }
        static { this.ID = 'editor.contrib.folding'; }
        static get(editor) {
            return editor.getContribution(FoldingController_1.ID);
        }
        static getFoldingRangeProviders(languageFeaturesService, model) {
            const foldingRangeProviders = languageFeaturesService.foldingRangeProvider.ordered(model);
            return (FoldingController_1._foldingRangeSelector?.(foldingRangeProviders, model)) ?? foldingRangeProviders;
        }
        static setFoldingRangeProviderSelector(foldingRangeSelector) {
            FoldingController_1._foldingRangeSelector = foldingRangeSelector;
            return { dispose: () => { FoldingController_1._foldingRangeSelector = undefined; } };
        }
        constructor(editor, contextKeyService, languageConfigurationService, notificationService, languageFeatureDebounceService, languageFeaturesService) {
            super();
            this.contextKeyService = contextKeyService;
            this.languageConfigurationService = languageConfigurationService;
            this.languageFeaturesService = languageFeaturesService;
            this.localToDispose = this._register(new lifecycle_1.DisposableStore());
            this.editor = editor;
            this._foldingLimitReporter = new RangesLimitReporter(editor);
            const options = this.editor.getOptions();
            this._isEnabled = options.get(43 /* EditorOption.folding */);
            this._useFoldingProviders = options.get(44 /* EditorOption.foldingStrategy */) !== 'indentation';
            this._unfoldOnClickAfterEndOfLine = options.get(48 /* EditorOption.unfoldOnClickAfterEndOfLine */);
            this._restoringViewState = false;
            this._currentModelHasFoldedImports = false;
            this._foldingImportsByDefault = options.get(46 /* EditorOption.foldingImportsByDefault */);
            this.updateDebounceInfo = languageFeatureDebounceService.for(languageFeaturesService.foldingRangeProvider, 'Folding', { min: 200 });
            this.foldingModel = null;
            this.hiddenRangeModel = null;
            this.rangeProvider = null;
            this.foldingRegionPromise = null;
            this.foldingModelPromise = null;
            this.updateScheduler = null;
            this.cursorChangedScheduler = null;
            this.mouseDownInfo = null;
            this.foldingDecorationProvider = new foldingDecorations_1.FoldingDecorationProvider(editor);
            this.foldingDecorationProvider.showFoldingControls = options.get(109 /* EditorOption.showFoldingControls */);
            this.foldingDecorationProvider.showFoldingHighlights = options.get(45 /* EditorOption.foldingHighlight */);
            this.foldingEnabled = CONTEXT_FOLDING_ENABLED.bindTo(this.contextKeyService);
            this.foldingEnabled.set(this._isEnabled);
            this._register(this.editor.onDidChangeModel(() => this.onModelChanged()));
            this._register(this.editor.onDidChangeConfiguration((e) => {
                if (e.hasChanged(43 /* EditorOption.folding */)) {
                    this._isEnabled = this.editor.getOptions().get(43 /* EditorOption.folding */);
                    this.foldingEnabled.set(this._isEnabled);
                    this.onModelChanged();
                }
                if (e.hasChanged(47 /* EditorOption.foldingMaximumRegions */)) {
                    this.onModelChanged();
                }
                if (e.hasChanged(109 /* EditorOption.showFoldingControls */) || e.hasChanged(45 /* EditorOption.foldingHighlight */)) {
                    const options = this.editor.getOptions();
                    this.foldingDecorationProvider.showFoldingControls = options.get(109 /* EditorOption.showFoldingControls */);
                    this.foldingDecorationProvider.showFoldingHighlights = options.get(45 /* EditorOption.foldingHighlight */);
                    this.triggerFoldingModelChanged();
                }
                if (e.hasChanged(44 /* EditorOption.foldingStrategy */)) {
                    this._useFoldingProviders = this.editor.getOptions().get(44 /* EditorOption.foldingStrategy */) !== 'indentation';
                    this.onFoldingStrategyChanged();
                }
                if (e.hasChanged(48 /* EditorOption.unfoldOnClickAfterEndOfLine */)) {
                    this._unfoldOnClickAfterEndOfLine = this.editor.getOptions().get(48 /* EditorOption.unfoldOnClickAfterEndOfLine */);
                }
                if (e.hasChanged(46 /* EditorOption.foldingImportsByDefault */)) {
                    this._foldingImportsByDefault = this.editor.getOptions().get(46 /* EditorOption.foldingImportsByDefault */);
                }
            }));
            this.onModelChanged();
        }
        get limitReporter() {
            return this._foldingLimitReporter;
        }
        /**
         * Store view state.
         */
        saveViewState() {
            const model = this.editor.getModel();
            if (!model || !this._isEnabled || model.isTooLargeForTokenization()) {
                return {};
            }
            if (this.foldingModel) { // disposed ?
                const collapsedRegions = this.foldingModel.getMemento();
                const provider = this.rangeProvider ? this.rangeProvider.id : undefined;
                return { collapsedRegions, lineCount: model.getLineCount(), provider, foldedImports: this._currentModelHasFoldedImports };
            }
            return undefined;
        }
        /**
         * Restore view state.
         */
        restoreViewState(state) {
            const model = this.editor.getModel();
            if (!model || !this._isEnabled || model.isTooLargeForTokenization() || !this.hiddenRangeModel) {
                return;
            }
            if (!state) {
                return;
            }
            this._currentModelHasFoldedImports = !!state.foldedImports;
            if (state.collapsedRegions && state.collapsedRegions.length > 0 && this.foldingModel) {
                this._restoringViewState = true;
                try {
                    this.foldingModel.applyMemento(state.collapsedRegions);
                }
                finally {
                    this._restoringViewState = false;
                }
            }
        }
        onModelChanged() {
            this.localToDispose.clear();
            const model = this.editor.getModel();
            if (!this._isEnabled || !model || model.isTooLargeForTokenization()) {
                // huge files get no view model, so they cannot support hidden areas
                return;
            }
            this._currentModelHasFoldedImports = false;
            this.foldingModel = new foldingModel_1.FoldingModel(model, this.foldingDecorationProvider);
            this.localToDispose.add(this.foldingModel);
            this.hiddenRangeModel = new hiddenRangeModel_1.HiddenRangeModel(this.foldingModel);
            this.localToDispose.add(this.hiddenRangeModel);
            this.localToDispose.add(this.hiddenRangeModel.onDidChange(hr => this.onHiddenRangesChanges(hr)));
            this.updateScheduler = new async_1.Delayer(this.updateDebounceInfo.get(model));
            this.cursorChangedScheduler = new async_1.RunOnceScheduler(() => this.revealCursor(), 200);
            this.localToDispose.add(this.cursorChangedScheduler);
            this.localToDispose.add(this.languageFeaturesService.foldingRangeProvider.onDidChange(() => this.onFoldingStrategyChanged()));
            this.localToDispose.add(this.editor.onDidChangeModelLanguageConfiguration(() => this.onFoldingStrategyChanged())); // covers model language changes as well
            this.localToDispose.add(this.editor.onDidChangeModelContent(e => this.onDidChangeModelContent(e)));
            this.localToDispose.add(this.editor.onDidChangeCursorPosition(() => this.onCursorPositionChanged()));
            this.localToDispose.add(this.editor.onMouseDown(e => this.onEditorMouseDown(e)));
            this.localToDispose.add(this.editor.onMouseUp(e => this.onEditorMouseUp(e)));
            this.localToDispose.add({
                dispose: () => {
                    if (this.foldingRegionPromise) {
                        this.foldingRegionPromise.cancel();
                        this.foldingRegionPromise = null;
                    }
                    this.updateScheduler?.cancel();
                    this.updateScheduler = null;
                    this.foldingModel = null;
                    this.foldingModelPromise = null;
                    this.hiddenRangeModel = null;
                    this.cursorChangedScheduler = null;
                    this.rangeProvider?.dispose();
                    this.rangeProvider = null;
                }
            });
            this.triggerFoldingModelChanged();
        }
        onFoldingStrategyChanged() {
            this.rangeProvider?.dispose();
            this.rangeProvider = null;
            this.triggerFoldingModelChanged();
        }
        getRangeProvider(editorModel) {
            if (this.rangeProvider) {
                return this.rangeProvider;
            }
            const indentRangeProvider = new indentRangeProvider_1.IndentRangeProvider(editorModel, this.languageConfigurationService, this._foldingLimitReporter);
            this.rangeProvider = indentRangeProvider; // fallback
            if (this._useFoldingProviders && this.foldingModel) {
                const selectedProviders = FoldingController_1.getFoldingRangeProviders(this.languageFeaturesService, editorModel);
                if (selectedProviders.length > 0) {
                    this.rangeProvider = new syntaxRangeProvider_1.SyntaxRangeProvider(editorModel, selectedProviders, () => this.triggerFoldingModelChanged(), this._foldingLimitReporter, indentRangeProvider);
                }
            }
            return this.rangeProvider;
        }
        getFoldingModel() {
            return this.foldingModelPromise;
        }
        onDidChangeModelContent(e) {
            this.hiddenRangeModel?.notifyChangeModelContent(e);
            this.triggerFoldingModelChanged();
        }
        triggerFoldingModelChanged() {
            if (this.updateScheduler) {
                if (this.foldingRegionPromise) {
                    this.foldingRegionPromise.cancel();
                    this.foldingRegionPromise = null;
                }
                this.foldingModelPromise = this.updateScheduler.trigger(() => {
                    const foldingModel = this.foldingModel;
                    if (!foldingModel) { // null if editor has been disposed, or folding turned off
                        return null;
                    }
                    const sw = new stopwatch_1.StopWatch();
                    const provider = this.getRangeProvider(foldingModel.textModel);
                    const foldingRegionPromise = this.foldingRegionPromise = (0, async_1.createCancelablePromise)(token => provider.compute(token));
                    return foldingRegionPromise.then(foldingRanges => {
                        if (foldingRanges && foldingRegionPromise === this.foldingRegionPromise) { // new request or cancelled in the meantime?
                            let scrollState;
                            if (this._foldingImportsByDefault && !this._currentModelHasFoldedImports) {
                                const hasChanges = foldingRanges.setCollapsedAllOfType(languages_1.FoldingRangeKind.Imports.value, true);
                                if (hasChanges) {
                                    scrollState = stableEditorScroll_1.StableEditorScrollState.capture(this.editor);
                                    this._currentModelHasFoldedImports = hasChanges;
                                }
                            }
                            // some cursors might have moved into hidden regions, make sure they are in expanded regions
                            const selections = this.editor.getSelections();
                            const selectionLineNumbers = selections ? selections.map(s => s.startLineNumber) : [];
                            foldingModel.update(foldingRanges, selectionLineNumbers);
                            scrollState?.restore(this.editor);
                            // update debounce info
                            const newValue = this.updateDebounceInfo.update(foldingModel.textModel, sw.elapsed());
                            if (this.updateScheduler) {
                                this.updateScheduler.defaultDelay = newValue;
                            }
                        }
                        return foldingModel;
                    });
                }).then(undefined, (err) => {
                    (0, errors_1.onUnexpectedError)(err);
                    return null;
                });
            }
        }
        onHiddenRangesChanges(hiddenRanges) {
            if (this.hiddenRangeModel && hiddenRanges.length && !this._restoringViewState) {
                const selections = this.editor.getSelections();
                if (selections) {
                    if (this.hiddenRangeModel.adjustSelections(selections)) {
                        this.editor.setSelections(selections);
                    }
                }
            }
            this.editor.setHiddenAreas(hiddenRanges, this);
        }
        onCursorPositionChanged() {
            if (this.hiddenRangeModel && this.hiddenRangeModel.hasRanges()) {
                this.cursorChangedScheduler.schedule();
            }
        }
        revealCursor() {
            const foldingModel = this.getFoldingModel();
            if (!foldingModel) {
                return;
            }
            foldingModel.then(foldingModel => {
                if (foldingModel) {
                    const selections = this.editor.getSelections();
                    if (selections && selections.length > 0) {
                        const toToggle = [];
                        for (const selection of selections) {
                            const lineNumber = selection.selectionStartLineNumber;
                            if (this.hiddenRangeModel && this.hiddenRangeModel.isHidden(lineNumber)) {
                                toToggle.push(...foldingModel.getAllRegionsAtLine(lineNumber, r => r.isCollapsed && lineNumber > r.startLineNumber));
                            }
                        }
                        if (toToggle.length) {
                            foldingModel.toggleCollapseState(toToggle);
                            this.reveal(selections[0].getPosition());
                        }
                    }
                }
            }).then(undefined, errors_1.onUnexpectedError);
        }
        onEditorMouseDown(e) {
            this.mouseDownInfo = null;
            if (!this.hiddenRangeModel || !e.target || !e.target.range) {
                return;
            }
            if (!e.event.leftButton && !e.event.middleButton) {
                return;
            }
            const range = e.target.range;
            let iconClicked = false;
            switch (e.target.type) {
                case 4 /* MouseTargetType.GUTTER_LINE_DECORATIONS */: {
                    const data = e.target.detail;
                    const offsetLeftInGutter = e.target.element.offsetLeft;
                    const gutterOffsetX = data.offsetX - offsetLeftInGutter;
                    // const gutterOffsetX = data.offsetX - data.glyphMarginWidth - data.lineNumbersWidth - data.glyphMarginLeft;
                    // TODO@joao TODO@alex TODO@martin this is such that we don't collide with dirty diff
                    if (gutterOffsetX < 4) { // the whitespace between the border and the real folding icon border is 4px
                        return;
                    }
                    iconClicked = true;
                    break;
                }
                case 7 /* MouseTargetType.CONTENT_EMPTY */: {
                    if (this._unfoldOnClickAfterEndOfLine && this.hiddenRangeModel.hasRanges()) {
                        const data = e.target.detail;
                        if (!data.isAfterLines) {
                            break;
                        }
                    }
                    return;
                }
                case 6 /* MouseTargetType.CONTENT_TEXT */: {
                    if (this.hiddenRangeModel.hasRanges()) {
                        const model = this.editor.getModel();
                        if (model && range.startColumn === model.getLineMaxColumn(range.startLineNumber)) {
                            break;
                        }
                    }
                    return;
                }
                default:
                    return;
            }
            this.mouseDownInfo = { lineNumber: range.startLineNumber, iconClicked };
        }
        onEditorMouseUp(e) {
            const foldingModel = this.foldingModel;
            if (!foldingModel || !this.mouseDownInfo || !e.target) {
                return;
            }
            const lineNumber = this.mouseDownInfo.lineNumber;
            const iconClicked = this.mouseDownInfo.iconClicked;
            const range = e.target.range;
            if (!range || range.startLineNumber !== lineNumber) {
                return;
            }
            if (iconClicked) {
                if (e.target.type !== 4 /* MouseTargetType.GUTTER_LINE_DECORATIONS */) {
                    return;
                }
            }
            else {
                const model = this.editor.getModel();
                if (!model || range.startColumn !== model.getLineMaxColumn(lineNumber)) {
                    return;
                }
            }
            const region = foldingModel.getRegionAtLine(lineNumber);
            if (region && region.startLineNumber === lineNumber) {
                const isCollapsed = region.isCollapsed;
                if (iconClicked || isCollapsed) {
                    const surrounding = e.event.altKey;
                    let toToggle = [];
                    if (surrounding) {
                        const filter = (otherRegion) => !otherRegion.containedBy(region) && !region.containedBy(otherRegion);
                        const toMaybeToggle = foldingModel.getRegionsInside(null, filter);
                        for (const r of toMaybeToggle) {
                            if (r.isCollapsed) {
                                toToggle.push(r);
                            }
                        }
                        // if any surrounding regions are folded, unfold those. Otherwise, fold all surrounding
                        if (toToggle.length === 0) {
                            toToggle = toMaybeToggle;
                        }
                    }
                    else {
                        const recursive = e.event.middleButton || e.event.shiftKey;
                        if (recursive) {
                            for (const r of foldingModel.getRegionsInside(region)) {
                                if (r.isCollapsed === isCollapsed) {
                                    toToggle.push(r);
                                }
                            }
                        }
                        // when recursive, first only collapse all children. If all are already folded or there are no children, also fold parent.
                        if (isCollapsed || !recursive || toToggle.length === 0) {
                            toToggle.push(region);
                        }
                    }
                    foldingModel.toggleCollapseState(toToggle);
                    this.reveal({ lineNumber, column: 1 });
                }
            }
        }
        reveal(position) {
            this.editor.revealPositionInCenterIfOutsideViewport(position, 0 /* ScrollType.Smooth */);
        }
    };
    exports.FoldingController = FoldingController;
    exports.FoldingController = FoldingController = FoldingController_1 = __decorate([
        __param(1, contextkey_1.IContextKeyService),
        __param(2, languageConfigurationRegistry_1.ILanguageConfigurationService),
        __param(3, notification_1.INotificationService),
        __param(4, languageFeatureDebounce_1.ILanguageFeatureDebounceService),
        __param(5, languageFeatures_1.ILanguageFeaturesService)
    ], FoldingController);
    class RangesLimitReporter {
        constructor(editor) {
            this.editor = editor;
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this._computed = 0;
            this._limited = false;
        }
        get limit() {
            return this.editor.getOptions().get(47 /* EditorOption.foldingMaximumRegions */);
        }
        get computed() {
            return this._computed;
        }
        get limited() {
            return this._limited;
        }
        update(computed, limited) {
            if (computed !== this._computed || limited !== this._limited) {
                this._computed = computed;
                this._limited = limited;
                this._onDidChange.fire();
            }
        }
    }
    exports.RangesLimitReporter = RangesLimitReporter;
    class FoldingAction extends editorExtensions_1.EditorAction {
        runEditorCommand(accessor, editor, args) {
            const languageConfigurationService = accessor.get(languageConfigurationRegistry_1.ILanguageConfigurationService);
            const foldingController = FoldingController.get(editor);
            if (!foldingController) {
                return;
            }
            const foldingModelPromise = foldingController.getFoldingModel();
            if (foldingModelPromise) {
                this.reportTelemetry(accessor, editor);
                return foldingModelPromise.then(foldingModel => {
                    if (foldingModel) {
                        this.invoke(foldingController, foldingModel, editor, args, languageConfigurationService);
                        const selection = editor.getSelection();
                        if (selection) {
                            foldingController.reveal(selection.getStartPosition());
                        }
                    }
                });
            }
        }
        getSelectedLines(editor) {
            const selections = editor.getSelections();
            return selections ? selections.map(s => s.startLineNumber) : [];
        }
        getLineNumbers(args, editor) {
            if (args && args.selectionLines) {
                return args.selectionLines.map(l => l + 1); // to 0-bases line numbers
            }
            return this.getSelectedLines(editor);
        }
        run(_accessor, _editor) {
        }
    }
    function foldingArgumentsConstraint(args) {
        if (!types.isUndefined(args)) {
            if (!types.isObject(args)) {
                return false;
            }
            const foldingArgs = args;
            if (!types.isUndefined(foldingArgs.levels) && !types.isNumber(foldingArgs.levels)) {
                return false;
            }
            if (!types.isUndefined(foldingArgs.direction) && !types.isString(foldingArgs.direction)) {
                return false;
            }
            if (!types.isUndefined(foldingArgs.selectionLines) && (!Array.isArray(foldingArgs.selectionLines) || !foldingArgs.selectionLines.every(types.isNumber))) {
                return false;
            }
        }
        return true;
    }
    class UnfoldAction extends FoldingAction {
        constructor() {
            super({
                id: 'editor.unfold',
                label: nls.localize('unfoldAction.label', "Unfold"),
                alias: 'Unfold',
                precondition: CONTEXT_FOLDING_ENABLED,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 94 /* KeyCode.BracketRight */,
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 94 /* KeyCode.BracketRight */
                    },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                description: {
                    description: 'Unfold the content in the editor',
                    args: [
                        {
                            name: 'Unfold editor argument',
                            description: `Property-value pairs that can be passed through this argument:
						* 'levels': Number of levels to unfold. If not set, defaults to 1.
						* 'direction': If 'up', unfold given number of levels up otherwise unfolds down.
						* 'selectionLines': Array of the start lines (0-based) of the editor selections to apply the unfold action to. If not set, the active selection(s) will be used.
						`,
                            constraint: foldingArgumentsConstraint,
                            schema: {
                                'type': 'object',
                                'properties': {
                                    'levels': {
                                        'type': 'number',
                                        'default': 1
                                    },
                                    'direction': {
                                        'type': 'string',
                                        'enum': ['up', 'down'],
                                        'default': 'down'
                                    },
                                    'selectionLines': {
                                        'type': 'array',
                                        'items': {
                                            'type': 'number'
                                        }
                                    }
                                }
                            }
                        }
                    ]
                }
            });
        }
        invoke(_foldingController, foldingModel, editor, args) {
            const levels = args && args.levels || 1;
            const lineNumbers = this.getLineNumbers(args, editor);
            if (args && args.direction === 'up') {
                (0, foldingModel_1.setCollapseStateLevelsUp)(foldingModel, false, levels, lineNumbers);
            }
            else {
                (0, foldingModel_1.setCollapseStateLevelsDown)(foldingModel, false, levels, lineNumbers);
            }
        }
    }
    class UnFoldRecursivelyAction extends FoldingAction {
        constructor() {
            super({
                id: 'editor.unfoldRecursively',
                label: nls.localize('unFoldRecursivelyAction.label', "Unfold Recursively"),
                alias: 'Unfold Recursively',
                precondition: CONTEXT_FOLDING_ENABLED,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 94 /* KeyCode.BracketRight */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        invoke(_foldingController, foldingModel, editor, _args) {
            (0, foldingModel_1.setCollapseStateLevelsDown)(foldingModel, false, Number.MAX_VALUE, this.getSelectedLines(editor));
        }
    }
    class FoldAction extends FoldingAction {
        constructor() {
            super({
                id: 'editor.fold',
                label: nls.localize('foldAction.label', "Fold"),
                alias: 'Fold',
                precondition: CONTEXT_FOLDING_ENABLED,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 92 /* KeyCode.BracketLeft */,
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 92 /* KeyCode.BracketLeft */
                    },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                description: {
                    description: 'Fold the content in the editor',
                    args: [
                        {
                            name: 'Fold editor argument',
                            description: `Property-value pairs that can be passed through this argument:
							* 'levels': Number of levels to fold.
							* 'direction': If 'up', folds given number of levels up otherwise folds down.
							* 'selectionLines': Array of the start lines (0-based) of the editor selections to apply the fold action to. If not set, the active selection(s) will be used.
							If no levels or direction is set, folds the region at the locations or if already collapsed, the first uncollapsed parent instead.
						`,
                            constraint: foldingArgumentsConstraint,
                            schema: {
                                'type': 'object',
                                'properties': {
                                    'levels': {
                                        'type': 'number',
                                    },
                                    'direction': {
                                        'type': 'string',
                                        'enum': ['up', 'down'],
                                    },
                                    'selectionLines': {
                                        'type': 'array',
                                        'items': {
                                            'type': 'number'
                                        }
                                    }
                                }
                            }
                        }
                    ]
                }
            });
        }
        invoke(_foldingController, foldingModel, editor, args) {
            const lineNumbers = this.getLineNumbers(args, editor);
            const levels = args && args.levels;
            const direction = args && args.direction;
            if (typeof levels !== 'number' && typeof direction !== 'string') {
                // fold the region at the location or if already collapsed, the first uncollapsed parent instead.
                (0, foldingModel_1.setCollapseStateUp)(foldingModel, true, lineNumbers);
            }
            else {
                if (direction === 'up') {
                    (0, foldingModel_1.setCollapseStateLevelsUp)(foldingModel, true, levels || 1, lineNumbers);
                }
                else {
                    (0, foldingModel_1.setCollapseStateLevelsDown)(foldingModel, true, levels || 1, lineNumbers);
                }
            }
        }
    }
    class ToggleFoldAction extends FoldingAction {
        constructor() {
            super({
                id: 'editor.toggleFold',
                label: nls.localize('toggleFoldAction.label', "Toggle Fold"),
                alias: 'Toggle Fold',
                precondition: CONTEXT_FOLDING_ENABLED,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 42 /* KeyCode.KeyL */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        invoke(_foldingController, foldingModel, editor) {
            const selectedLines = this.getSelectedLines(editor);
            (0, foldingModel_1.toggleCollapseState)(foldingModel, 1, selectedLines);
        }
    }
    class FoldRecursivelyAction extends FoldingAction {
        constructor() {
            super({
                id: 'editor.foldRecursively',
                label: nls.localize('foldRecursivelyAction.label', "Fold Recursively"),
                alias: 'Fold Recursively',
                precondition: CONTEXT_FOLDING_ENABLED,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 92 /* KeyCode.BracketLeft */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        invoke(_foldingController, foldingModel, editor) {
            const selectedLines = this.getSelectedLines(editor);
            (0, foldingModel_1.setCollapseStateLevelsDown)(foldingModel, true, Number.MAX_VALUE, selectedLines);
        }
    }
    class FoldAllBlockCommentsAction extends FoldingAction {
        constructor() {
            super({
                id: 'editor.foldAllBlockComments',
                label: nls.localize('foldAllBlockComments.label', "Fold All Block Comments"),
                alias: 'Fold All Block Comments',
                precondition: CONTEXT_FOLDING_ENABLED,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 90 /* KeyCode.Slash */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        invoke(_foldingController, foldingModel, editor, args, languageConfigurationService) {
            if (foldingModel.regions.hasTypes()) {
                (0, foldingModel_1.setCollapseStateForType)(foldingModel, languages_1.FoldingRangeKind.Comment.value, true);
            }
            else {
                const editorModel = editor.getModel();
                if (!editorModel) {
                    return;
                }
                const comments = languageConfigurationService.getLanguageConfiguration(editorModel.getLanguageId()).comments;
                if (comments && comments.blockCommentStartToken) {
                    const regExp = new RegExp('^\\s*' + (0, strings_1.escapeRegExpCharacters)(comments.blockCommentStartToken));
                    (0, foldingModel_1.setCollapseStateForMatchingLines)(foldingModel, regExp, true);
                }
            }
        }
    }
    class FoldAllRegionsAction extends FoldingAction {
        constructor() {
            super({
                id: 'editor.foldAllMarkerRegions',
                label: nls.localize('foldAllMarkerRegions.label', "Fold All Regions"),
                alias: 'Fold All Regions',
                precondition: CONTEXT_FOLDING_ENABLED,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 29 /* KeyCode.Digit8 */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        invoke(_foldingController, foldingModel, editor, args, languageConfigurationService) {
            if (foldingModel.regions.hasTypes()) {
                (0, foldingModel_1.setCollapseStateForType)(foldingModel, languages_1.FoldingRangeKind.Region.value, true);
            }
            else {
                const editorModel = editor.getModel();
                if (!editorModel) {
                    return;
                }
                const foldingRules = languageConfigurationService.getLanguageConfiguration(editorModel.getLanguageId()).foldingRules;
                if (foldingRules && foldingRules.markers && foldingRules.markers.start) {
                    const regExp = new RegExp(foldingRules.markers.start);
                    (0, foldingModel_1.setCollapseStateForMatchingLines)(foldingModel, regExp, true);
                }
            }
        }
    }
    class UnfoldAllRegionsAction extends FoldingAction {
        constructor() {
            super({
                id: 'editor.unfoldAllMarkerRegions',
                label: nls.localize('unfoldAllMarkerRegions.label', "Unfold All Regions"),
                alias: 'Unfold All Regions',
                precondition: CONTEXT_FOLDING_ENABLED,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 30 /* KeyCode.Digit9 */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        invoke(_foldingController, foldingModel, editor, args, languageConfigurationService) {
            if (foldingModel.regions.hasTypes()) {
                (0, foldingModel_1.setCollapseStateForType)(foldingModel, languages_1.FoldingRangeKind.Region.value, false);
            }
            else {
                const editorModel = editor.getModel();
                if (!editorModel) {
                    return;
                }
                const foldingRules = languageConfigurationService.getLanguageConfiguration(editorModel.getLanguageId()).foldingRules;
                if (foldingRules && foldingRules.markers && foldingRules.markers.start) {
                    const regExp = new RegExp(foldingRules.markers.start);
                    (0, foldingModel_1.setCollapseStateForMatchingLines)(foldingModel, regExp, false);
                }
            }
        }
    }
    class FoldAllExceptAction extends FoldingAction {
        constructor() {
            super({
                id: 'editor.foldAllExcept',
                label: nls.localize('foldAllExcept.label', "Fold All Except Selected"),
                alias: 'Fold All Except Selected',
                precondition: CONTEXT_FOLDING_ENABLED,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 88 /* KeyCode.Minus */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        invoke(_foldingController, foldingModel, editor) {
            const selectedLines = this.getSelectedLines(editor);
            (0, foldingModel_1.setCollapseStateForRest)(foldingModel, true, selectedLines);
        }
    }
    class UnfoldAllExceptAction extends FoldingAction {
        constructor() {
            super({
                id: 'editor.unfoldAllExcept',
                label: nls.localize('unfoldAllExcept.label', "Unfold All Except Selected"),
                alias: 'Unfold All Except Selected',
                precondition: CONTEXT_FOLDING_ENABLED,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 86 /* KeyCode.Equal */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        invoke(_foldingController, foldingModel, editor) {
            const selectedLines = this.getSelectedLines(editor);
            (0, foldingModel_1.setCollapseStateForRest)(foldingModel, false, selectedLines);
        }
    }
    class FoldAllAction extends FoldingAction {
        constructor() {
            super({
                id: 'editor.foldAll',
                label: nls.localize('foldAllAction.label', "Fold All"),
                alias: 'Fold All',
                precondition: CONTEXT_FOLDING_ENABLED,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 21 /* KeyCode.Digit0 */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        invoke(_foldingController, foldingModel, _editor) {
            (0, foldingModel_1.setCollapseStateLevelsDown)(foldingModel, true);
        }
    }
    class UnfoldAllAction extends FoldingAction {
        constructor() {
            super({
                id: 'editor.unfoldAll',
                label: nls.localize('unfoldAllAction.label', "Unfold All"),
                alias: 'Unfold All',
                precondition: CONTEXT_FOLDING_ENABLED,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 40 /* KeyCode.KeyJ */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        invoke(_foldingController, foldingModel, _editor) {
            (0, foldingModel_1.setCollapseStateLevelsDown)(foldingModel, false);
        }
    }
    class FoldLevelAction extends FoldingAction {
        static { this.ID_PREFIX = 'editor.foldLevel'; }
        static { this.ID = (level) => FoldLevelAction.ID_PREFIX + level; }
        getFoldingLevel() {
            return parseInt(this.id.substr(FoldLevelAction.ID_PREFIX.length));
        }
        invoke(_foldingController, foldingModel, editor) {
            (0, foldingModel_1.setCollapseStateAtLevel)(foldingModel, this.getFoldingLevel(), true, this.getSelectedLines(editor));
        }
    }
    /** Action to go to the parent fold of current line */
    class GotoParentFoldAction extends FoldingAction {
        constructor() {
            super({
                id: 'editor.gotoParentFold',
                label: nls.localize('gotoParentFold.label', "Go to Parent Fold"),
                alias: 'Go to Parent Fold',
                precondition: CONTEXT_FOLDING_ENABLED,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        invoke(_foldingController, foldingModel, editor) {
            const selectedLines = this.getSelectedLines(editor);
            if (selectedLines.length > 0) {
                const startLineNumber = (0, foldingModel_1.getParentFoldLine)(selectedLines[0], foldingModel);
                if (startLineNumber !== null) {
                    editor.setSelection({
                        startLineNumber: startLineNumber,
                        startColumn: 1,
                        endLineNumber: startLineNumber,
                        endColumn: 1
                    });
                }
            }
        }
    }
    /** Action to go to the previous fold of current line */
    class GotoPreviousFoldAction extends FoldingAction {
        constructor() {
            super({
                id: 'editor.gotoPreviousFold',
                label: nls.localize('gotoPreviousFold.label', "Go to Previous Folding Range"),
                alias: 'Go to Previous Folding Range',
                precondition: CONTEXT_FOLDING_ENABLED,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        invoke(_foldingController, foldingModel, editor) {
            const selectedLines = this.getSelectedLines(editor);
            if (selectedLines.length > 0) {
                const startLineNumber = (0, foldingModel_1.getPreviousFoldLine)(selectedLines[0], foldingModel);
                if (startLineNumber !== null) {
                    editor.setSelection({
                        startLineNumber: startLineNumber,
                        startColumn: 1,
                        endLineNumber: startLineNumber,
                        endColumn: 1
                    });
                }
            }
        }
    }
    /** Action to go to the next fold of current line */
    class GotoNextFoldAction extends FoldingAction {
        constructor() {
            super({
                id: 'editor.gotoNextFold',
                label: nls.localize('gotoNextFold.label', "Go to Next Folding Range"),
                alias: 'Go to Next Folding Range',
                precondition: CONTEXT_FOLDING_ENABLED,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        invoke(_foldingController, foldingModel, editor) {
            const selectedLines = this.getSelectedLines(editor);
            if (selectedLines.length > 0) {
                const startLineNumber = (0, foldingModel_1.getNextFoldLine)(selectedLines[0], foldingModel);
                if (startLineNumber !== null) {
                    editor.setSelection({
                        startLineNumber: startLineNumber,
                        startColumn: 1,
                        endLineNumber: startLineNumber,
                        endColumn: 1
                    });
                }
            }
        }
    }
    class FoldRangeFromSelectionAction extends FoldingAction {
        constructor() {
            super({
                id: 'editor.createFoldingRangeFromSelection',
                label: nls.localize('createManualFoldRange.label', "Create Folding Range from Selection"),
                alias: 'Create Folding Range from Selection',
                precondition: CONTEXT_FOLDING_ENABLED,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 87 /* KeyCode.Comma */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        invoke(_foldingController, foldingModel, editor) {
            const collapseRanges = [];
            const selections = editor.getSelections();
            if (selections) {
                for (const selection of selections) {
                    let endLineNumber = selection.endLineNumber;
                    if (selection.endColumn === 1) {
                        --endLineNumber;
                    }
                    if (endLineNumber > selection.startLineNumber) {
                        collapseRanges.push({
                            startLineNumber: selection.startLineNumber,
                            endLineNumber: endLineNumber,
                            type: undefined,
                            isCollapsed: true,
                            source: 1 /* FoldSource.userDefined */
                        });
                        editor.setSelection({
                            startLineNumber: selection.startLineNumber,
                            startColumn: 1,
                            endLineNumber: selection.startLineNumber,
                            endColumn: 1
                        });
                    }
                }
                if (collapseRanges.length > 0) {
                    collapseRanges.sort((a, b) => {
                        return a.startLineNumber - b.startLineNumber;
                    });
                    const newRanges = foldingRanges_1.FoldingRegions.sanitizeAndMerge(foldingModel.regions, collapseRanges, editor.getModel()?.getLineCount());
                    foldingModel.updatePost(foldingRanges_1.FoldingRegions.fromFoldRanges(newRanges));
                }
            }
        }
    }
    class RemoveFoldRangeFromSelectionAction extends FoldingAction {
        constructor() {
            super({
                id: 'editor.removeManualFoldingRanges',
                label: nls.localize('removeManualFoldingRanges.label', "Remove Manual Folding Ranges"),
                alias: 'Remove Manual Folding Ranges',
                precondition: CONTEXT_FOLDING_ENABLED,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 89 /* KeyCode.Period */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        invoke(foldingController, foldingModel, editor) {
            const selections = editor.getSelections();
            if (selections) {
                const ranges = [];
                for (const selection of selections) {
                    const { startLineNumber, endLineNumber } = selection;
                    ranges.push(endLineNumber >= startLineNumber ? { startLineNumber, endLineNumber } : { endLineNumber, startLineNumber });
                }
                foldingModel.removeManualRanges(ranges);
                foldingController.triggerFoldingModelChanged();
            }
        }
    }
    (0, editorExtensions_1.registerEditorContribution)(FoldingController.ID, FoldingController, 0 /* EditorContributionInstantiation.Eager */); // eager because it uses `saveViewState`/`restoreViewState`
    (0, editorExtensions_1.registerEditorAction)(UnfoldAction);
    (0, editorExtensions_1.registerEditorAction)(UnFoldRecursivelyAction);
    (0, editorExtensions_1.registerEditorAction)(FoldAction);
    (0, editorExtensions_1.registerEditorAction)(FoldRecursivelyAction);
    (0, editorExtensions_1.registerEditorAction)(FoldAllAction);
    (0, editorExtensions_1.registerEditorAction)(UnfoldAllAction);
    (0, editorExtensions_1.registerEditorAction)(FoldAllBlockCommentsAction);
    (0, editorExtensions_1.registerEditorAction)(FoldAllRegionsAction);
    (0, editorExtensions_1.registerEditorAction)(UnfoldAllRegionsAction);
    (0, editorExtensions_1.registerEditorAction)(FoldAllExceptAction);
    (0, editorExtensions_1.registerEditorAction)(UnfoldAllExceptAction);
    (0, editorExtensions_1.registerEditorAction)(ToggleFoldAction);
    (0, editorExtensions_1.registerEditorAction)(GotoParentFoldAction);
    (0, editorExtensions_1.registerEditorAction)(GotoPreviousFoldAction);
    (0, editorExtensions_1.registerEditorAction)(GotoNextFoldAction);
    (0, editorExtensions_1.registerEditorAction)(FoldRangeFromSelectionAction);
    (0, editorExtensions_1.registerEditorAction)(RemoveFoldRangeFromSelectionAction);
    for (let i = 1; i <= 7; i++) {
        (0, editorExtensions_1.registerInstantiatedEditorAction)(new FoldLevelAction({
            id: FoldLevelAction.ID(i),
            label: nls.localize('foldLevelAction.label', "Fold Level {0}", i),
            alias: `Fold Level ${i}`,
            precondition: CONTEXT_FOLDING_ENABLED,
            kbOpts: {
                kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | (21 /* KeyCode.Digit0 */ + i)),
                weight: 100 /* KeybindingWeight.EditorContrib */
            }
        }));
    }
    commands_1.CommandsRegistry.registerCommand('_executeFoldingRangeProvider', async function (accessor, ...args) {
        const [resource] = args;
        if (!(resource instanceof uri_1.URI)) {
            throw (0, errors_1.illegalArgument)();
        }
        const languageFeaturesService = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        const model = accessor.get(model_1.IModelService).getModel(resource);
        if (!model) {
            throw (0, errors_1.illegalArgument)();
        }
        const configurationService = accessor.get(configuration_1.IConfigurationService);
        if (!configurationService.getValue('editor.folding', { resource })) {
            return [];
        }
        const languageConfigurationService = accessor.get(languageConfigurationRegistry_1.ILanguageConfigurationService);
        const strategy = configurationService.getValue('editor.foldingStrategy', { resource });
        const foldingLimitReporter = {
            get limit() {
                return configurationService.getValue('editor.foldingMaximumRegions', { resource });
            },
            update: (computed, limited) => { }
        };
        const indentRangeProvider = new indentRangeProvider_1.IndentRangeProvider(model, languageConfigurationService, foldingLimitReporter);
        let rangeProvider = indentRangeProvider;
        if (strategy !== 'indentation') {
            const providers = FoldingController.getFoldingRangeProviders(languageFeaturesService, model);
            if (providers.length) {
                rangeProvider = new syntaxRangeProvider_1.SyntaxRangeProvider(model, providers, () => { }, foldingLimitReporter, indentRangeProvider);
            }
        }
        const ranges = await rangeProvider.compute(cancellation_1.CancellationToken.None);
        const result = [];
        try {
            if (ranges) {
                for (let i = 0; i < ranges.length; i++) {
                    const type = ranges.getType(i);
                    result.push({ start: ranges.getStartLineNumber(i), end: ranges.getEndLineNumber(i), kind: type ? languages_1.FoldingRangeKind.fromValue(type) : undefined });
                }
            }
            return result;
        }
        finally {
            rangeProvider.dispose();
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9sZGluZy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2ZvbGRpbmcvYnJvd3Nlci9mb2xkaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUF5Q2hHLE1BQU0sdUJBQXVCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBc0I3RSxJQUFNLGlCQUFpQixHQUF2QixNQUFNLGlCQUFrQixTQUFRLHNCQUFVOztpQkFFekIsT0FBRSxHQUFHLHdCQUF3QixBQUEzQixDQUE0QjtRQUU5QyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQW1CO1lBQ3BDLE9BQU8sTUFBTSxDQUFDLGVBQWUsQ0FBb0IsbUJBQWlCLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDeEUsQ0FBQztRQUlNLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyx1QkFBaUQsRUFBRSxLQUFpQjtZQUMxRyxNQUFNLHFCQUFxQixHQUFHLHVCQUF1QixDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMxRixPQUFPLENBQUMsbUJBQWlCLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxLQUFLLENBQUMsQ0FBQyxJQUFJLHFCQUFxQixDQUFDO1FBQzNHLENBQUM7UUFFTSxNQUFNLENBQUMsK0JBQStCLENBQUMsb0JBQWtEO1lBQy9GLG1CQUFpQixDQUFDLHFCQUFxQixHQUFHLG9CQUFvQixDQUFDO1lBQy9ELE9BQU8sRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFLEdBQUcsbUJBQWlCLENBQUMscUJBQXFCLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDcEYsQ0FBQztRQThCRCxZQUNDLE1BQW1CLEVBQ0MsaUJBQXNELEVBQzNDLDRCQUE0RSxFQUNyRixtQkFBeUMsRUFD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