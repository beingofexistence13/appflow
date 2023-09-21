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
define(["require", "exports", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/keyCodes", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/base/common/types", "vs/editor/browser/stableEditorScroll", "vs/editor/browser/editorExtensions", "vs/editor/common/editorContextKeys", "vs/editor/common/languages", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/contrib/folding/browser/foldingModel", "vs/editor/contrib/folding/browser/hiddenRangeModel", "vs/editor/contrib/folding/browser/indentRangeProvider", "vs/nls!vs/editor/contrib/folding/browser/folding", "vs/platform/contextkey/common/contextkey", "./foldingDecorations", "./foldingRanges", "./syntaxRangeProvider", "vs/platform/notification/common/notification", "vs/editor/common/services/languageFeatureDebounce", "vs/base/common/stopwatch", "vs/editor/common/services/languageFeatures", "vs/base/common/event", "vs/platform/commands/common/commands", "vs/base/common/uri", "vs/editor/common/services/model", "vs/platform/configuration/common/configuration", "vs/css!./folding"], function (require, exports, async_1, cancellation_1, errors_1, keyCodes_1, lifecycle_1, strings_1, types, stableEditorScroll_1, editorExtensions_1, editorContextKeys_1, languages_1, languageConfigurationRegistry_1, foldingModel_1, hiddenRangeModel_1, indentRangeProvider_1, nls, contextkey_1, foldingDecorations_1, foldingRanges_1, syntaxRangeProvider_1, notification_1, languageFeatureDebounce_1, stopwatch_1, languageFeatures_1, event_1, commands_1, uri_1, model_1, configuration_1) {
    "use strict";
    var $z8_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$A8 = exports.$z8 = void 0;
    const CONTEXT_FOLDING_ENABLED = new contextkey_1.$2i('foldingEnabled', false);
    let $z8 = class $z8 extends lifecycle_1.$kc {
        static { $z8_1 = this; }
        static { this.ID = 'editor.contrib.folding'; }
        static get(editor) {
            return editor.getContribution($z8_1.ID);
        }
        static getFoldingRangeProviders(languageFeaturesService, model) {
            const foldingRangeProviders = languageFeaturesService.foldingRangeProvider.ordered(model);
            return ($z8_1.c?.(foldingRangeProviders, model)) ?? foldingRangeProviders;
        }
        static setFoldingRangeProviderSelector(foldingRangeSelector) {
            $z8_1.c = foldingRangeSelector;
            return { dispose: () => { $z8_1.c = undefined; } };
        }
        constructor(editor, M, N, notificationService, languageFeatureDebounceService, O) {
            super();
            this.M = M;
            this.N = N;
            this.O = O;
            this.J = this.B(new lifecycle_1.$jc());
            this.f = editor;
            this._foldingLimitReporter = new $A8(editor);
            const options = this.f.getOptions();
            this.g = options.get(43 /* EditorOption.folding */);
            this.h = options.get(44 /* EditorOption.foldingStrategy */) !== 'indentation';
            this.j = options.get(48 /* EditorOption.unfoldOnClickAfterEndOfLine */);
            this.m = false;
            this.t = false;
            this.n = options.get(46 /* EditorOption.foldingImportsByDefault */);
            this.G = languageFeatureDebounceService.for(O.foldingRangeProvider, 'Folding', { min: 200 });
            this.w = null;
            this.y = null;
            this.z = null;
            this.C = null;
            this.D = null;
            this.F = null;
            this.I = null;
            this.L = null;
            this.u = new foldingDecorations_1.$w8(editor);
            this.u.showFoldingControls = options.get(109 /* EditorOption.showFoldingControls */);
            this.u.showFoldingHighlights = options.get(45 /* EditorOption.foldingHighlight */);
            this.H = CONTEXT_FOLDING_ENABLED.bindTo(this.M);
            this.H.set(this.g);
            this.B(this.f.onDidChangeModel(() => this.P()));
            this.B(this.f.onDidChangeConfiguration((e) => {
                if (e.hasChanged(43 /* EditorOption.folding */)) {
                    this.g = this.f.getOptions().get(43 /* EditorOption.folding */);
                    this.H.set(this.g);
                    this.P();
                }
                if (e.hasChanged(47 /* EditorOption.foldingMaximumRegions */)) {
                    this.P();
                }
                if (e.hasChanged(109 /* EditorOption.showFoldingControls */) || e.hasChanged(45 /* EditorOption.foldingHighlight */)) {
                    const options = this.f.getOptions();
                    this.u.showFoldingControls = options.get(109 /* EditorOption.showFoldingControls */);
                    this.u.showFoldingHighlights = options.get(45 /* EditorOption.foldingHighlight */);
                    this.triggerFoldingModelChanged();
                }
                if (e.hasChanged(44 /* EditorOption.foldingStrategy */)) {
                    this.h = this.f.getOptions().get(44 /* EditorOption.foldingStrategy */) !== 'indentation';
                    this.Q();
                }
                if (e.hasChanged(48 /* EditorOption.unfoldOnClickAfterEndOfLine */)) {
                    this.j = this.f.getOptions().get(48 /* EditorOption.unfoldOnClickAfterEndOfLine */);
                }
                if (e.hasChanged(46 /* EditorOption.foldingImportsByDefault */)) {
                    this.n = this.f.getOptions().get(46 /* EditorOption.foldingImportsByDefault */);
                }
            }));
            this.P();
        }
        get limitReporter() {
            return this._foldingLimitReporter;
        }
        /**
         * Store view state.
         */
        saveViewState() {
            const model = this.f.getModel();
            if (!model || !this.g || model.isTooLargeForTokenization()) {
                return {};
            }
            if (this.w) { // disposed ?
                const collapsedRegions = this.w.getMemento();
                const provider = this.z ? this.z.id : undefined;
                return { collapsedRegions, lineCount: model.getLineCount(), provider, foldedImports: this.t };
            }
            return undefined;
        }
        /**
         * Restore view state.
         */
        restoreViewState(state) {
            const model = this.f.getModel();
            if (!model || !this.g || model.isTooLargeForTokenization() || !this.y) {
                return;
            }
            if (!state) {
                return;
            }
            this.t = !!state.foldedImports;
            if (state.collapsedRegions && state.collapsedRegions.length > 0 && this.w) {
                this.m = true;
                try {
                    this.w.applyMemento(state.collapsedRegions);
                }
                finally {
                    this.m = false;
                }
            }
        }
        P() {
            this.J.clear();
            const model = this.f.getModel();
            if (!this.g || !model || model.isTooLargeForTokenization()) {
                // huge files get no view model, so they cannot support hidden areas
                return;
            }
            this.t = false;
            this.w = new foldingModel_1.$c8(model, this.u);
            this.J.add(this.w);
            this.y = new hiddenRangeModel_1.$o8(this.w);
            this.J.add(this.y);
            this.J.add(this.y.onDidChange(hr => this.U(hr)));
            this.F = new async_1.$Dg(this.G.get(model));
            this.I = new async_1.$Sg(() => this.X(), 200);
            this.J.add(this.I);
            this.J.add(this.O.foldingRangeProvider.onDidChange(() => this.Q()));
            this.J.add(this.f.onDidChangeModelLanguageConfiguration(() => this.Q())); // covers model language changes as well
            this.J.add(this.f.onDidChangeModelContent(e => this.S(e)));
            this.J.add(this.f.onDidChangeCursorPosition(() => this.W()));
            this.J.add(this.f.onMouseDown(e => this.Y(e)));
            this.J.add(this.f.onMouseUp(e => this.Z(e)));
            this.J.add({
                dispose: () => {
                    if (this.C) {
                        this.C.cancel();
                        this.C = null;
                    }
                    this.F?.cancel();
                    this.F = null;
                    this.w = null;
                    this.D = null;
                    this.y = null;
                    this.I = null;
                    this.z?.dispose();
                    this.z = null;
                }
            });
            this.triggerFoldingModelChanged();
        }
        Q() {
            this.z?.dispose();
            this.z = null;
            this.triggerFoldingModelChanged();
        }
        R(editorModel) {
            if (this.z) {
                return this.z;
            }
            const indentRangeProvider = new indentRangeProvider_1.$p8(editorModel, this.N, this._foldingLimitReporter);
            this.z = indentRangeProvider; // fallback
            if (this.h && this.w) {
                const selectedProviders = $z8_1.getFoldingRangeProviders(this.O, editorModel);
                if (selectedProviders.length > 0) {
                    this.z = new syntaxRangeProvider_1.$x8(editorModel, selectedProviders, () => this.triggerFoldingModelChanged(), this._foldingLimitReporter, indentRangeProvider);
                }
            }
            return this.z;
        }
        getFoldingModel() {
            return this.D;
        }
        S(e) {
            this.y?.notifyChangeModelContent(e);
            this.triggerFoldingModelChanged();
        }
        triggerFoldingModelChanged() {
            if (this.F) {
                if (this.C) {
                    this.C.cancel();
                    this.C = null;
                }
                this.D = this.F.trigger(() => {
                    const foldingModel = this.w;
                    if (!foldingModel) { // null if editor has been disposed, or folding turned off
                        return null;
                    }
                    const sw = new stopwatch_1.$bd();
                    const provider = this.R(foldingModel.textModel);
                    const foldingRegionPromise = this.C = (0, async_1.$ug)(token => provider.compute(token));
                    return foldingRegionPromise.then(foldingRanges => {
                        if (foldingRanges && foldingRegionPromise === this.C) { // new request or cancelled in the meantime?
                            let scrollState;
                            if (this.n && !this.t) {
                                const hasChanges = foldingRanges.setCollapsedAllOfType(languages_1.$_s.Imports.value, true);
                                if (hasChanges) {
                                    scrollState = stableEditorScroll_1.$TZ.capture(this.f);
                                    this.t = hasChanges;
                                }
                            }
                            // some cursors might have moved into hidden regions, make sure they are in expanded regions
                            const selections = this.f.getSelections();
                            const selectionLineNumbers = selections ? selections.map(s => s.startLineNumber) : [];
                            foldingModel.update(foldingRanges, selectionLineNumbers);
                            scrollState?.restore(this.f);
                            // update debounce info
                            const newValue = this.G.update(foldingModel.textModel, sw.elapsed());
                            if (this.F) {
                                this.F.defaultDelay = newValue;
                            }
                        }
                        return foldingModel;
                    });
                }).then(undefined, (err) => {
                    (0, errors_1.$Y)(err);
                    return null;
                });
            }
        }
        U(hiddenRanges) {
            if (this.y && hiddenRanges.length && !this.m) {
                const selections = this.f.getSelections();
                if (selections) {
                    if (this.y.adjustSelections(selections)) {
                        this.f.setSelections(selections);
                    }
                }
            }
            this.f.setHiddenAreas(hiddenRanges, this);
        }
        W() {
            if (this.y && this.y.hasRanges()) {
                this.I.schedule();
            }
        }
        X() {
            const foldingModel = this.getFoldingModel();
            if (!foldingModel) {
                return;
            }
            foldingModel.then(foldingModel => {
                if (foldingModel) {
                    const selections = this.f.getSelections();
                    if (selections && selections.length > 0) {
                        const toToggle = [];
                        for (const selection of selections) {
                            const lineNumber = selection.selectionStartLineNumber;
                            if (this.y && this.y.isHidden(lineNumber)) {
                                toToggle.push(...foldingModel.getAllRegionsAtLine(lineNumber, r => r.isCollapsed && lineNumber > r.startLineNumber));
                            }
                        }
                        if (toToggle.length) {
                            foldingModel.toggleCollapseState(toToggle);
                            this.reveal(selections[0].getPosition());
                        }
                    }
                }
            }).then(undefined, errors_1.$Y);
        }
        Y(e) {
            this.L = null;
            if (!this.y || !e.target || !e.target.range) {
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
                    if (this.j && this.y.hasRanges()) {
                        const data = e.target.detail;
                        if (!data.isAfterLines) {
                            break;
                        }
                    }
                    return;
                }
                case 6 /* MouseTargetType.CONTENT_TEXT */: {
                    if (this.y.hasRanges()) {
                        const model = this.f.getModel();
                        if (model && range.startColumn === model.getLineMaxColumn(range.startLineNumber)) {
                            break;
                        }
                    }
                    return;
                }
                default:
                    return;
            }
            this.L = { lineNumber: range.startLineNumber, iconClicked };
        }
        Z(e) {
            const foldingModel = this.w;
            if (!foldingModel || !this.L || !e.target) {
                return;
            }
            const lineNumber = this.L.lineNumber;
            const iconClicked = this.L.iconClicked;
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
                const model = this.f.getModel();
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
            this.f.revealPositionInCenterIfOutsideViewport(position, 0 /* ScrollType.Smooth */);
        }
    };
    exports.$z8 = $z8;
    exports.$z8 = $z8 = $z8_1 = __decorate([
        __param(1, contextkey_1.$3i),
        __param(2, languageConfigurationRegistry_1.$2t),
        __param(3, notification_1.$Yu),
        __param(4, languageFeatureDebounce_1.$52),
        __param(5, languageFeatures_1.$hF)
    ], $z8);
    class $A8 {
        constructor(c) {
            this.c = c;
            this.d = new event_1.$fd();
            this.onDidChange = this.d.event;
            this.f = 0;
            this.g = false;
        }
        get limit() {
            return this.c.getOptions().get(47 /* EditorOption.foldingMaximumRegions */);
        }
        get computed() {
            return this.f;
        }
        get limited() {
            return this.g;
        }
        update(computed, limited) {
            if (computed !== this.f || limited !== this.g) {
                this.f = computed;
                this.g = limited;
                this.d.fire();
            }
        }
    }
    exports.$A8 = $A8;
    class FoldingAction extends editorExtensions_1.$sV {
        runEditorCommand(accessor, editor, args) {
            const languageConfigurationService = accessor.get(languageConfigurationRegistry_1.$2t);
            const foldingController = $z8.get(editor);
            if (!foldingController) {
                return;
            }
            const foldingModelPromise = foldingController.getFoldingModel();
            if (foldingModelPromise) {
                this.q(accessor, editor);
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
        d(editor) {
            const selections = editor.getSelections();
            return selections ? selections.map(s => s.startLineNumber) : [];
        }
        h(args, editor) {
            if (args && args.selectionLines) {
                return args.selectionLines.map(l => l + 1); // to 0-bases line numbers
            }
            return this.d(editor);
        }
        run(_accessor, _editor) {
        }
    }
    function foldingArgumentsConstraint(args) {
        if (!types.$qf(args)) {
            if (!types.$lf(args)) {
                return false;
            }
            const foldingArgs = args;
            if (!types.$qf(foldingArgs.levels) && !types.$nf(foldingArgs.levels)) {
                return false;
            }
            if (!types.$qf(foldingArgs.direction) && !types.$jf(foldingArgs.direction)) {
                return false;
            }
            if (!types.$qf(foldingArgs.selectionLines) && (!Array.isArray(foldingArgs.selectionLines) || !foldingArgs.selectionLines.every(types.$nf))) {
                return false;
            }
        }
        return true;
    }
    class UnfoldAction extends FoldingAction {
        constructor() {
            super({
                id: 'editor.unfold',
                label: nls.localize(0, null),
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
            const lineNumbers = this.h(args, editor);
            if (args && args.direction === 'up') {
                (0, foldingModel_1.$f8)(foldingModel, false, levels, lineNumbers);
            }
            else {
                (0, foldingModel_1.$e8)(foldingModel, false, levels, lineNumbers);
            }
        }
    }
    class UnFoldRecursivelyAction extends FoldingAction {
        constructor() {
            super({
                id: 'editor.unfoldRecursively',
                label: nls.localize(1, null),
                alias: 'Unfold Recursively',
                precondition: CONTEXT_FOLDING_ENABLED,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 94 /* KeyCode.BracketRight */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        invoke(_foldingController, foldingModel, editor, _args) {
            (0, foldingModel_1.$e8)(foldingModel, false, Number.MAX_VALUE, this.d(editor));
        }
    }
    class FoldAction extends FoldingAction {
        constructor() {
            super({
                id: 'editor.fold',
                label: nls.localize(2, null),
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
            const lineNumbers = this.h(args, editor);
            const levels = args && args.levels;
            const direction = args && args.direction;
            if (typeof levels !== 'number' && typeof direction !== 'string') {
                // fold the region at the location or if already collapsed, the first uncollapsed parent instead.
                (0, foldingModel_1.$g8)(foldingModel, true, lineNumbers);
            }
            else {
                if (direction === 'up') {
                    (0, foldingModel_1.$f8)(foldingModel, true, levels || 1, lineNumbers);
                }
                else {
                    (0, foldingModel_1.$e8)(foldingModel, true, levels || 1, lineNumbers);
                }
            }
        }
    }
    class ToggleFoldAction extends FoldingAction {
        constructor() {
            super({
                id: 'editor.toggleFold',
                label: nls.localize(3, null),
                alias: 'Toggle Fold',
                precondition: CONTEXT_FOLDING_ENABLED,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 42 /* KeyCode.KeyL */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        invoke(_foldingController, foldingModel, editor) {
            const selectedLines = this.d(editor);
            (0, foldingModel_1.$d8)(foldingModel, 1, selectedLines);
        }
    }
    class FoldRecursivelyAction extends FoldingAction {
        constructor() {
            super({
                id: 'editor.foldRecursively',
                label: nls.localize(4, null),
                alias: 'Fold Recursively',
                precondition: CONTEXT_FOLDING_ENABLED,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 92 /* KeyCode.BracketLeft */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        invoke(_foldingController, foldingModel, editor) {
            const selectedLines = this.d(editor);
            (0, foldingModel_1.$e8)(foldingModel, true, Number.MAX_VALUE, selectedLines);
        }
    }
    class FoldAllBlockCommentsAction extends FoldingAction {
        constructor() {
            super({
                id: 'editor.foldAllBlockComments',
                label: nls.localize(5, null),
                alias: 'Fold All Block Comments',
                precondition: CONTEXT_FOLDING_ENABLED,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 90 /* KeyCode.Slash */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        invoke(_foldingController, foldingModel, editor, args, languageConfigurationService) {
            if (foldingModel.regions.hasTypes()) {
                (0, foldingModel_1.$k8)(foldingModel, languages_1.$_s.Comment.value, true);
            }
            else {
                const editorModel = editor.getModel();
                if (!editorModel) {
                    return;
                }
                const comments = languageConfigurationService.getLanguageConfiguration(editorModel.getLanguageId()).comments;
                if (comments && comments.blockCommentStartToken) {
                    const regExp = new RegExp('^\\s*' + (0, strings_1.$qe)(comments.blockCommentStartToken));
                    (0, foldingModel_1.$j8)(foldingModel, regExp, true);
                }
            }
        }
    }
    class FoldAllRegionsAction extends FoldingAction {
        constructor() {
            super({
                id: 'editor.foldAllMarkerRegions',
                label: nls.localize(6, null),
                alias: 'Fold All Regions',
                precondition: CONTEXT_FOLDING_ENABLED,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 29 /* KeyCode.Digit8 */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        invoke(_foldingController, foldingModel, editor, args, languageConfigurationService) {
            if (foldingModel.regions.hasTypes()) {
                (0, foldingModel_1.$k8)(foldingModel, languages_1.$_s.Region.value, true);
            }
            else {
                const editorModel = editor.getModel();
                if (!editorModel) {
                    return;
                }
                const foldingRules = languageConfigurationService.getLanguageConfiguration(editorModel.getLanguageId()).foldingRules;
                if (foldingRules && foldingRules.markers && foldingRules.markers.start) {
                    const regExp = new RegExp(foldingRules.markers.start);
                    (0, foldingModel_1.$j8)(foldingModel, regExp, true);
                }
            }
        }
    }
    class UnfoldAllRegionsAction extends FoldingAction {
        constructor() {
            super({
                id: 'editor.unfoldAllMarkerRegions',
                label: nls.localize(7, null),
                alias: 'Unfold All Regions',
                precondition: CONTEXT_FOLDING_ENABLED,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 30 /* KeyCode.Digit9 */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        invoke(_foldingController, foldingModel, editor, args, languageConfigurationService) {
            if (foldingModel.regions.hasTypes()) {
                (0, foldingModel_1.$k8)(foldingModel, languages_1.$_s.Region.value, false);
            }
            else {
                const editorModel = editor.getModel();
                if (!editorModel) {
                    return;
                }
                const foldingRules = languageConfigurationService.getLanguageConfiguration(editorModel.getLanguageId()).foldingRules;
                if (foldingRules && foldingRules.markers && foldingRules.markers.start) {
                    const regExp = new RegExp(foldingRules.markers.start);
                    (0, foldingModel_1.$j8)(foldingModel, regExp, false);
                }
            }
        }
    }
    class FoldAllExceptAction extends FoldingAction {
        constructor() {
            super({
                id: 'editor.foldAllExcept',
                label: nls.localize(8, null),
                alias: 'Fold All Except Selected',
                precondition: CONTEXT_FOLDING_ENABLED,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 88 /* KeyCode.Minus */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        invoke(_foldingController, foldingModel, editor) {
            const selectedLines = this.d(editor);
            (0, foldingModel_1.$i8)(foldingModel, true, selectedLines);
        }
    }
    class UnfoldAllExceptAction extends FoldingAction {
        constructor() {
            super({
                id: 'editor.unfoldAllExcept',
                label: nls.localize(9, null),
                alias: 'Unfold All Except Selected',
                precondition: CONTEXT_FOLDING_ENABLED,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 86 /* KeyCode.Equal */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        invoke(_foldingController, foldingModel, editor) {
            const selectedLines = this.d(editor);
            (0, foldingModel_1.$i8)(foldingModel, false, selectedLines);
        }
    }
    class FoldAllAction extends FoldingAction {
        constructor() {
            super({
                id: 'editor.foldAll',
                label: nls.localize(10, null),
                alias: 'Fold All',
                precondition: CONTEXT_FOLDING_ENABLED,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 21 /* KeyCode.Digit0 */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        invoke(_foldingController, foldingModel, _editor) {
            (0, foldingModel_1.$e8)(foldingModel, true);
        }
    }
    class UnfoldAllAction extends FoldingAction {
        constructor() {
            super({
                id: 'editor.unfoldAll',
                label: nls.localize(11, null),
                alias: 'Unfold All',
                precondition: CONTEXT_FOLDING_ENABLED,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 40 /* KeyCode.KeyJ */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        invoke(_foldingController, foldingModel, _editor) {
            (0, foldingModel_1.$e8)(foldingModel, false);
        }
    }
    class FoldLevelAction extends FoldingAction {
        static { this.j = 'editor.foldLevel'; }
        static { this.ID = (level) => FoldLevelAction.j + level; }
        m() {
            return parseInt(this.id.substr(FoldLevelAction.j.length));
        }
        invoke(_foldingController, foldingModel, editor) {
            (0, foldingModel_1.$h8)(foldingModel, this.m(), true, this.d(editor));
        }
    }
    /** Action to go to the parent fold of current line */
    class GotoParentFoldAction extends FoldingAction {
        constructor() {
            super({
                id: 'editor.gotoParentFold',
                label: nls.localize(12, null),
                alias: 'Go to Parent Fold',
                precondition: CONTEXT_FOLDING_ENABLED,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        invoke(_foldingController, foldingModel, editor) {
            const selectedLines = this.d(editor);
            if (selectedLines.length > 0) {
                const startLineNumber = (0, foldingModel_1.$l8)(selectedLines[0], foldingModel);
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
                label: nls.localize(13, null),
                alias: 'Go to Previous Folding Range',
                precondition: CONTEXT_FOLDING_ENABLED,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        invoke(_foldingController, foldingModel, editor) {
            const selectedLines = this.d(editor);
            if (selectedLines.length > 0) {
                const startLineNumber = (0, foldingModel_1.$m8)(selectedLines[0], foldingModel);
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
                label: nls.localize(14, null),
                alias: 'Go to Next Folding Range',
                precondition: CONTEXT_FOLDING_ENABLED,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        invoke(_foldingController, foldingModel, editor) {
            const selectedLines = this.d(editor);
            if (selectedLines.length > 0) {
                const startLineNumber = (0, foldingModel_1.$n8)(selectedLines[0], foldingModel);
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
                label: nls.localize(15, null),
                alias: 'Create Folding Range from Selection',
                precondition: CONTEXT_FOLDING_ENABLED,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 87 /* KeyCode.Comma */),
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
                    const newRanges = foldingRanges_1.$a8.sanitizeAndMerge(foldingModel.regions, collapseRanges, editor.getModel()?.getLineCount());
                    foldingModel.updatePost(foldingRanges_1.$a8.fromFoldRanges(newRanges));
                }
            }
        }
    }
    class RemoveFoldRangeFromSelectionAction extends FoldingAction {
        constructor() {
            super({
                id: 'editor.removeManualFoldingRanges',
                label: nls.localize(16, null),
                alias: 'Remove Manual Folding Ranges',
                precondition: CONTEXT_FOLDING_ENABLED,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 89 /* KeyCode.Period */),
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
    (0, editorExtensions_1.$AV)($z8.ID, $z8, 0 /* EditorContributionInstantiation.Eager */); // eager because it uses `saveViewState`/`restoreViewState`
    (0, editorExtensions_1.$xV)(UnfoldAction);
    (0, editorExtensions_1.$xV)(UnFoldRecursivelyAction);
    (0, editorExtensions_1.$xV)(FoldAction);
    (0, editorExtensions_1.$xV)(FoldRecursivelyAction);
    (0, editorExtensions_1.$xV)(FoldAllAction);
    (0, editorExtensions_1.$xV)(UnfoldAllAction);
    (0, editorExtensions_1.$xV)(FoldAllBlockCommentsAction);
    (0, editorExtensions_1.$xV)(FoldAllRegionsAction);
    (0, editorExtensions_1.$xV)(UnfoldAllRegionsAction);
    (0, editorExtensions_1.$xV)(FoldAllExceptAction);
    (0, editorExtensions_1.$xV)(UnfoldAllExceptAction);
    (0, editorExtensions_1.$xV)(ToggleFoldAction);
    (0, editorExtensions_1.$xV)(GotoParentFoldAction);
    (0, editorExtensions_1.$xV)(GotoPreviousFoldAction);
    (0, editorExtensions_1.$xV)(GotoNextFoldAction);
    (0, editorExtensions_1.$xV)(FoldRangeFromSelectionAction);
    (0, editorExtensions_1.$xV)(RemoveFoldRangeFromSelectionAction);
    for (let i = 1; i <= 7; i++) {
        (0, editorExtensions_1.$zV)(new FoldLevelAction({
            id: FoldLevelAction.ID(i),
            label: nls.localize(17, null, i),
            alias: `Fold Level ${i}`,
            precondition: CONTEXT_FOLDING_ENABLED,
            kbOpts: {
                kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | (21 /* KeyCode.Digit0 */ + i)),
                weight: 100 /* KeybindingWeight.EditorContrib */
            }
        }));
    }
    commands_1.$Gr.registerCommand('_executeFoldingRangeProvider', async function (accessor, ...args) {
        const [resource] = args;
        if (!(resource instanceof uri_1.URI)) {
            throw (0, errors_1.$5)();
        }
        const languageFeaturesService = accessor.get(languageFeatures_1.$hF);
        const model = accessor.get(model_1.$yA).getModel(resource);
        if (!model) {
            throw (0, errors_1.$5)();
        }
        const configurationService = accessor.get(configuration_1.$8h);
        if (!configurationService.getValue('editor.folding', { resource })) {
            return [];
        }
        const languageConfigurationService = accessor.get(languageConfigurationRegistry_1.$2t);
        const strategy = configurationService.getValue('editor.foldingStrategy', { resource });
        const foldingLimitReporter = {
            get limit() {
                return configurationService.getValue('editor.foldingMaximumRegions', { resource });
            },
            update: (computed, limited) => { }
        };
        const indentRangeProvider = new indentRangeProvider_1.$p8(model, languageConfigurationService, foldingLimitReporter);
        let rangeProvider = indentRangeProvider;
        if (strategy !== 'indentation') {
            const providers = $z8.getFoldingRangeProviders(languageFeaturesService, model);
            if (providers.length) {
                rangeProvider = new syntaxRangeProvider_1.$x8(model, providers, () => { }, foldingLimitReporter, indentRangeProvider);
            }
        }
        const ranges = await rangeProvider.compute(cancellation_1.CancellationToken.None);
        const result = [];
        try {
            if (ranges) {
                for (let i = 0; i < ranges.length; i++) {
                    const type = ranges.getType(i);
                    result.push({ start: ranges.getStartLineNumber(i), end: ranges.getEndLineNumber(i), kind: type ? languages_1.$_s.fromValue(type) : undefined });
                }
            }
            return result;
        }
        finally {
            rangeProvider.dispose();
        }
    });
});
//# sourceMappingURL=folding.js.map