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
define(["require", "exports", "vs/nls!vs/editor/browser/widget/codeEditorWidget", "vs/base/browser/dom", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/hash", "vs/base/common/lifecycle", "vs/base/common/network", "vs/editor/browser/config/editorConfiguration", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/view", "vs/editor/browser/view/viewUserInputEvents", "vs/editor/common/config/editorOptions", "vs/editor/common/core/cursorColumns", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/editorAction", "vs/editor/common/editorCommon", "vs/editor/common/editorContextKeys", "vs/editor/common/model/textModel", "vs/editor/common/core/editorColorRegistry", "vs/platform/theme/common/colorRegistry", "vs/editor/common/viewModel/viewModelImpl", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/notification/common/notification", "vs/platform/theme/common/themeService", "vs/platform/accessibility/common/accessibility", "vs/editor/common/viewModel/monospaceLineBreaksComputer", "vs/editor/browser/view/domLineBreaksComputer", "vs/editor/common/cursor/cursorWordOperations", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/browser/config/domFontInfo", "vs/editor/common/services/languageFeatures", "vs/editor/browser/widget/codeEditorContributions", "vs/editor/browser/config/tabFocus", "vs/editor/browser/services/markerDecorations", "vs/css!./media/editor"], function (require, exports, nls, dom, errors_1, event_1, hash_1, lifecycle_1, network_1, editorConfiguration_1, editorExtensions_1, codeEditorService_1, view_1, viewUserInputEvents_1, editorOptions_1, cursorColumns_1, position_1, range_1, selection_1, editorAction_1, editorCommon, editorContextKeys_1, textModel_1, editorColorRegistry_1, colorRegistry_1, viewModelImpl_1, commands_1, contextkey_1, instantiation_1, serviceCollection_1, notification_1, themeService_1, accessibility_1, monospaceLineBreaksComputer_1, domLineBreaksComputer_1, cursorWordOperations_1, languageConfigurationRegistry_1, domFontInfo_1, languageFeatures_1, codeEditorContributions_1, tabFocus_1) {
    "use strict";
    var $uY_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$wY = exports.$vY = exports.$uY = void 0;
    let EDITOR_ID = 0;
    class ModelData {
        constructor(model, viewModel, view, hasRealView, listenersToRemove, attachedView) {
            this.model = model;
            this.viewModel = viewModel;
            this.view = view;
            this.hasRealView = hasRealView;
            this.listenersToRemove = listenersToRemove;
            this.attachedView = attachedView;
        }
        dispose() {
            (0, lifecycle_1.$fc)(this.listenersToRemove);
            this.model.onBeforeDetached(this.attachedView);
            if (this.hasRealView) {
                this.view.dispose();
            }
            this.viewModel.dispose();
        }
    }
    let $uY = class $uY extends lifecycle_1.$kc {
        static { $uY_1 = this; }
        static { this.b = textModel_1.$RC.register({
            description: 'workbench-dnd-target',
            className: 'dnd-target'
        }); }
        //#endregion
        get isSimpleWidget() {
            return this.jb.isSimpleWidget;
        }
        constructor(domElement, _options, codeEditorWidgetOptions, instantiationService, codeEditorService, commandService, contextKeyService, themeService, notificationService, accessibilityService, Bb, languageFeaturesService) {
            super();
            this.Bb = Bb;
            //#region Eventing
            this.c = (0, event_1.$gd)();
            this.f = this.B(new codeEditorContributions_1.$tY());
            this.g = this.B(new event_1.$fd());
            this.onDidDispose = this.g.event;
            this.h = this.B(new event_1.$fd({ deliveryQueue: this.c }));
            this.onDidChangeModelContent = this.h.event;
            this.j = this.B(new event_1.$fd({ deliveryQueue: this.c }));
            this.onDidChangeModelLanguage = this.j.event;
            this.m = this.B(new event_1.$fd({ deliveryQueue: this.c }));
            this.onDidChangeModelLanguageConfiguration = this.m.event;
            this.n = this.B(new event_1.$fd({ deliveryQueue: this.c }));
            this.onDidChangeModelOptions = this.n.event;
            this.t = this.B(new event_1.$fd({ deliveryQueue: this.c }));
            this.onDidChangeModelDecorations = this.t.event;
            this.u = this.B(new event_1.$fd({ deliveryQueue: this.c }));
            this.onDidChangeModelTokens = this.u.event;
            this.w = this.B(new event_1.$fd({ deliveryQueue: this.c }));
            this.onDidChangeConfiguration = this.w.event;
            this.y = this.B(new event_1.$fd({ deliveryQueue: this.c }));
            this.onDidChangeModel = this.y.event;
            this.z = this.B(new event_1.$fd({ deliveryQueue: this.c }));
            this.onDidChangeCursorPosition = this.z.event;
            this.C = this.B(new event_1.$fd({ deliveryQueue: this.c }));
            this.onDidChangeCursorSelection = this.C.event;
            this.D = this.B(new InteractionEmitter(this.f, this.c));
            this.onDidAttemptReadOnlyEdit = this.D.event;
            this.F = this.B(new event_1.$fd({ deliveryQueue: this.c }));
            this.onDidLayoutChange = this.F.event;
            this.G = this.B(new $vY({ deliveryQueue: this.c }));
            this.onDidFocusEditorText = this.G.onDidChangeToTrue;
            this.onDidBlurEditorText = this.G.onDidChangeToFalse;
            this.H = this.B(new $vY({ deliveryQueue: this.c }));
            this.onDidFocusEditorWidget = this.H.onDidChangeToTrue;
            this.onDidBlurEditorWidget = this.H.onDidChangeToFalse;
            this.I = this.B(new InteractionEmitter(this.f, this.c));
            this.onWillType = this.I.event;
            this.J = this.B(new InteractionEmitter(this.f, this.c));
            this.onDidType = this.J.event;
            this.L = this.B(new InteractionEmitter(this.f, this.c));
            this.onDidCompositionStart = this.L.event;
            this.M = this.B(new InteractionEmitter(this.f, this.c));
            this.onDidCompositionEnd = this.M.event;
            this.N = this.B(new InteractionEmitter(this.f, this.c));
            this.onDidPaste = this.N.event;
            this.O = this.B(new InteractionEmitter(this.f, this.c));
            this.onMouseUp = this.O.event;
            this.P = this.B(new InteractionEmitter(this.f, this.c));
            this.onMouseDown = this.P.event;
            this.Q = this.B(new InteractionEmitter(this.f, this.c));
            this.onMouseDrag = this.Q.event;
            this.R = this.B(new InteractionEmitter(this.f, this.c));
            this.onMouseDrop = this.R.event;
            this.S = this.B(new InteractionEmitter(this.f, this.c));
            this.onMouseDropCanceled = this.S.event;
            this.U = this.B(new InteractionEmitter(this.f, this.c));
            this.onDropIntoEditor = this.U.event;
            this.W = this.B(new InteractionEmitter(this.f, this.c));
            this.onContextMenu = this.W.event;
            this.X = this.B(new InteractionEmitter(this.f, this.c));
            this.onMouseMove = this.X.event;
            this.Y = this.B(new InteractionEmitter(this.f, this.c));
            this.onMouseLeave = this.Y.event;
            this.Z = this.B(new InteractionEmitter(this.f, this.c));
            this.onMouseWheel = this.Z.event;
            this.$ = this.B(new InteractionEmitter(this.f, this.c));
            this.onKeyUp = this.$.event;
            this.ab = this.B(new InteractionEmitter(this.f, this.c));
            this.onKeyDown = this.ab.event;
            this.bb = this.B(new event_1.$fd({ deliveryQueue: this.c }));
            this.onDidContentSizeChange = this.bb.event;
            this.cb = this.B(new event_1.$fd({ deliveryQueue: this.c }));
            this.onDidScrollChange = this.cb.event;
            this.db = this.B(new event_1.$fd({ deliveryQueue: this.c }));
            this.onDidChangeViewZones = this.db.event;
            this.eb = this.B(new event_1.$fd({ deliveryQueue: this.c }));
            this.onDidChangeHiddenAreas = this.eb.event;
            this.lb = new Map();
            this.zb = null;
            this.Ab = this.createDecorationsCollection();
            codeEditorService.willCreateCodeEditor();
            const options = { ..._options };
            this.gb = domElement;
            this.hb = options.overflowWidgetsDomNode;
            delete options.overflowWidgetsDomNode;
            this.ib = (++EDITOR_ID);
            this.xb = {};
            this.yb = {};
            this.fb = codeEditorWidgetOptions.telemetryData;
            this.jb = this.B(this.Cb(codeEditorWidgetOptions.isSimpleWidget || false, options, accessibilityService));
            this.B(this.jb.onDidChange((e) => {
                this.w.fire(e);
                const options = this.jb.options;
                if (e.hasChanged(143 /* EditorOption.layoutInfo */)) {
                    const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
                    this.F.fire(layoutInfo);
                }
            }));
            this.ob = this.B(contextKeyService.createScoped(this.gb));
            this.pb = notificationService;
            this.qb = codeEditorService;
            this.rb = commandService;
            this.sb = themeService;
            this.B(new EditorContextKeysManager(this, this.ob));
            this.B(new $wY(this, this.ob, languageFeaturesService));
            this.nb = instantiationService.createChild(new serviceCollection_1.$zh([contextkey_1.$3i, this.ob]));
            this.mb = null;
            this.tb = new CodeEditorWidgetFocusTracker(domElement);
            this.B(this.tb.onChange(() => {
                this.H.setValue(this.tb.hasFocus());
            }));
            this.ub = {};
            this.vb = {};
            this.wb = {};
            let contributions;
            if (Array.isArray(codeEditorWidgetOptions.contributions)) {
                contributions = codeEditorWidgetOptions.contributions;
            }
            else {
                contributions = editorExtensions_1.EditorExtensionsRegistry.getEditorContributions();
            }
            this.f.initialize(this, contributions, this.nb);
            for (const action of editorExtensions_1.EditorExtensionsRegistry.getEditorActions()) {
                if (this.lb.has(action.id)) {
                    (0, errors_1.$Y)(new Error(`Cannot have two actions with the same id ${action.id}`));
                    continue;
                }
                const internalAction = new editorAction_1.$UX(action.id, action.label, action.alias, action.precondition ?? undefined, () => {
                    return this.nb.invokeFunction((accessor) => {
                        return Promise.resolve(action.runEditorCommand(accessor, this, null));
                    });
                }, this.ob);
                this.lb.set(internalAction.id, internalAction);
            }
            const isDropIntoEnabled = () => {
                return !this.jb.options.get(90 /* EditorOption.readOnly */)
                    && this.jb.options.get(36 /* EditorOption.dropIntoEditor */).enabled;
            };
            this.B(new dom.$zP(this.gb, {
                onDragEnter: () => undefined,
                onDragOver: e => {
                    if (!isDropIntoEnabled()) {
                        return;
                    }
                    const target = this.getTargetAtClientPoint(e.clientX, e.clientY);
                    if (target?.position) {
                        this.ac(target.position);
                    }
                },
                onDrop: async (e) => {
                    if (!isDropIntoEnabled()) {
                        return;
                    }
                    this.bc();
                    if (!e.dataTransfer) {
                        return;
                    }
                    const target = this.getTargetAtClientPoint(e.clientX, e.clientY);
                    if (target?.position) {
                        this.U.fire({ position: target.position, event: e });
                    }
                },
                onDragLeave: () => {
                    this.bc();
                },
                onDragEnd: () => {
                    this.bc();
                },
            }));
            this.qb.addCodeEditor(this);
        }
        writeScreenReaderContent(reason) {
            this.mb?.view.writeScreenReaderContent(reason);
        }
        Cb(isSimpleWidget, options, accessibilityService) {
            return new editorConfiguration_1.$DU(isSimpleWidget, options, this.gb, accessibilityService);
        }
        getId() {
            return this.getEditorType() + ':' + this.ib;
        }
        getEditorType() {
            return editorCommon.EditorType.ICodeEditor;
        }
        dispose() {
            this.qb.removeCodeEditor(this);
            this.tb.dispose();
            this.lb.clear();
            this.ub = {};
            this.vb = {};
            this.Db();
            this.Wb(this.Xb());
            this.g.fire();
            super.dispose();
        }
        invokeWithinContext(fn) {
            return this.nb.invokeFunction(fn);
        }
        updateOptions(newOptions) {
            this.jb.updateOptions(newOptions || {});
        }
        getOptions() {
            return this.jb.options;
        }
        getOption(id) {
            return this.jb.options.get(id);
        }
        getRawOptions() {
            return this.jb.getRawOptions();
        }
        getOverflowWidgetsDomNode() {
            return this.hb;
        }
        getConfiguredWordAtPosition(position) {
            if (!this.mb) {
                return null;
            }
            return cursorWordOperations_1.$4V.getWordAtPosition(this.mb.model, this.jb.options.get(129 /* EditorOption.wordSeparators */), position);
        }
        getValue(options = null) {
            if (!this.mb) {
                return '';
            }
            const preserveBOM = (options && options.preserveBOM) ? true : false;
            let eolPreference = 0 /* EndOfLinePreference.TextDefined */;
            if (options && options.lineEnding && options.lineEnding === '\n') {
                eolPreference = 1 /* EndOfLinePreference.LF */;
            }
            else if (options && options.lineEnding && options.lineEnding === '\r\n') {
                eolPreference = 2 /* EndOfLinePreference.CRLF */;
            }
            return this.mb.model.getValue(eolPreference, preserveBOM);
        }
        setValue(newValue) {
            if (!this.mb) {
                return;
            }
            this.mb.model.setValue(newValue);
        }
        getModel() {
            if (!this.mb) {
                return null;
            }
            return this.mb.model;
        }
        setModel(_model = null) {
            const model = _model;
            if (this.mb === null && model === null) {
                // Current model is the new model
                return;
            }
            if (this.mb && this.mb.model === model) {
                // Current model is the new model
                return;
            }
            const hasTextFocus = this.hasTextFocus();
            const detachedModel = this.Xb();
            this.Ub(model);
            if (hasTextFocus && this.hasModel()) {
                this.focus();
            }
            const e = {
                oldModelUrl: detachedModel ? detachedModel.uri : null,
                newModelUrl: model ? model.uri : null
            };
            this.Db();
            this.y.fire(e);
            this.Wb(detachedModel);
            this.f.onAfterModelAttached();
        }
        Db() {
            this.xb = {};
            if (this.yb) {
                for (const decorationType in this.yb) {
                    const subTypes = this.yb[decorationType];
                    for (const subType in subTypes) {
                        this.Zb(decorationType + '-' + subType);
                    }
                }
                this.yb = {};
            }
        }
        getVisibleRanges() {
            if (!this.mb) {
                return [];
            }
            return this.mb.viewModel.getVisibleRanges();
        }
        getVisibleRangesPlusViewportAboveBelow() {
            if (!this.mb) {
                return [];
            }
            return this.mb.viewModel.getVisibleRangesPlusViewportAboveBelow();
        }
        getWhitespaces() {
            if (!this.mb) {
                return [];
            }
            return this.mb.viewModel.viewLayout.getWhitespaces();
        }
        static Eb(modelData, modelLineNumber, modelColumn, includeViewZones) {
            const modelPosition = modelData.model.validatePosition({
                lineNumber: modelLineNumber,
                column: modelColumn
            });
            const viewPosition = modelData.viewModel.coordinatesConverter.convertModelPositionToViewPosition(modelPosition);
            return modelData.viewModel.viewLayout.getVerticalOffsetAfterLineNumber(viewPosition.lineNumber, includeViewZones);
        }
        getTopForLineNumber(lineNumber, includeViewZones = false) {
            if (!this.mb) {
                return -1;
            }
            return $uY_1.Fb(this.mb, lineNumber, 1, includeViewZones);
        }
        getTopForPosition(lineNumber, column) {
            if (!this.mb) {
                return -1;
            }
            return $uY_1.Fb(this.mb, lineNumber, column, false);
        }
        static Fb(modelData, modelLineNumber, modelColumn, includeViewZones = false) {
            const modelPosition = modelData.model.validatePosition({
                lineNumber: modelLineNumber,
                column: modelColumn
            });
            const viewPosition = modelData.viewModel.coordinatesConverter.convertModelPositionToViewPosition(modelPosition);
            return modelData.viewModel.viewLayout.getVerticalOffsetForLineNumber(viewPosition.lineNumber, includeViewZones);
        }
        getBottomForLineNumber(lineNumber, includeViewZones = false) {
            if (!this.mb) {
                return -1;
            }
            return $uY_1.Eb(this.mb, lineNumber, 1, includeViewZones);
        }
        setHiddenAreas(ranges, source) {
            this.mb?.viewModel.setHiddenAreas(ranges.map(r => range_1.$ks.lift(r)), source);
        }
        getVisibleColumnFromPosition(rawPosition) {
            if (!this.mb) {
                return rawPosition.column;
            }
            const position = this.mb.model.validatePosition(rawPosition);
            const tabSize = this.mb.model.getOptions().tabSize;
            return cursorColumns_1.$mt.visibleColumnFromColumn(this.mb.model.getLineContent(position.lineNumber), position.column, tabSize) + 1;
        }
        getStatusbarColumn(rawPosition) {
            if (!this.mb) {
                return rawPosition.column;
            }
            const position = this.mb.model.validatePosition(rawPosition);
            const tabSize = this.mb.model.getOptions().tabSize;
            return cursorColumns_1.$mt.toStatusbarColumn(this.mb.model.getLineContent(position.lineNumber), position.column, tabSize);
        }
        getPosition() {
            if (!this.mb) {
                return null;
            }
            return this.mb.viewModel.getPosition();
        }
        setPosition(position, source = 'api') {
            if (!this.mb) {
                return;
            }
            if (!position_1.$js.isIPosition(position)) {
                throw new Error('Invalid arguments');
            }
            this.mb.viewModel.setSelections(source, [{
                    selectionStartLineNumber: position.lineNumber,
                    selectionStartColumn: position.column,
                    positionLineNumber: position.lineNumber,
                    positionColumn: position.column
                }]);
        }
        Gb(modelRange, verticalType, revealHorizontal, scrollType) {
            if (!this.mb) {
                return;
            }
            if (!range_1.$ks.isIRange(modelRange)) {
                throw new Error('Invalid arguments');
            }
            const validatedModelRange = this.mb.model.validateRange(modelRange);
            const viewRange = this.mb.viewModel.coordinatesConverter.convertModelRangeToViewRange(validatedModelRange);
            this.mb.viewModel.revealRange('api', revealHorizontal, viewRange, verticalType, scrollType);
        }
        revealLine(lineNumber, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this.Hb(lineNumber, 0 /* VerticalRevealType.Simple */, scrollType);
        }
        revealLineInCenter(lineNumber, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this.Hb(lineNumber, 1 /* VerticalRevealType.Center */, scrollType);
        }
        revealLineInCenterIfOutsideViewport(lineNumber, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this.Hb(lineNumber, 2 /* VerticalRevealType.CenterIfOutsideViewport */, scrollType);
        }
        revealLineNearTop(lineNumber, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this.Hb(lineNumber, 5 /* VerticalRevealType.NearTop */, scrollType);
        }
        Hb(lineNumber, revealType, scrollType) {
            if (typeof lineNumber !== 'number') {
                throw new Error('Invalid arguments');
            }
            this.Gb(new range_1.$ks(lineNumber, 1, lineNumber, 1), revealType, false, scrollType);
        }
        revealPosition(position, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this.Ib(position, 0 /* VerticalRevealType.Simple */, true, scrollType);
        }
        revealPositionInCenter(position, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this.Ib(position, 1 /* VerticalRevealType.Center */, true, scrollType);
        }
        revealPositionInCenterIfOutsideViewport(position, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this.Ib(position, 2 /* VerticalRevealType.CenterIfOutsideViewport */, true, scrollType);
        }
        revealPositionNearTop(position, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this.Ib(position, 5 /* VerticalRevealType.NearTop */, true, scrollType);
        }
        Ib(position, verticalType, revealHorizontal, scrollType) {
            if (!position_1.$js.isIPosition(position)) {
                throw new Error('Invalid arguments');
            }
            this.Gb(new range_1.$ks(position.lineNumber, position.column, position.lineNumber, position.column), verticalType, revealHorizontal, scrollType);
        }
        getSelection() {
            if (!this.mb) {
                return null;
            }
            return this.mb.viewModel.getSelection();
        }
        getSelections() {
            if (!this.mb) {
                return null;
            }
            return this.mb.viewModel.getSelections();
        }
        setSelection(something, source = 'api') {
            const isSelection = selection_1.$ms.isISelection(something);
            const isRange = range_1.$ks.isIRange(something);
            if (!isSelection && !isRange) {
                throw new Error('Invalid arguments');
            }
            if (isSelection) {
                this.Jb(something, source);
            }
            else if (isRange) {
                // act as if it was an IRange
                const selection = {
                    selectionStartLineNumber: something.startLineNumber,
                    selectionStartColumn: something.startColumn,
                    positionLineNumber: something.endLineNumber,
                    positionColumn: something.endColumn
                };
                this.Jb(selection, source);
            }
        }
        Jb(sel, source) {
            if (!this.mb) {
                return;
            }
            const selection = new selection_1.$ms(sel.selectionStartLineNumber, sel.selectionStartColumn, sel.positionLineNumber, sel.positionColumn);
            this.mb.viewModel.setSelections(source, [selection]);
        }
        revealLines(startLineNumber, endLineNumber, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this.Kb(startLineNumber, endLineNumber, 0 /* VerticalRevealType.Simple */, scrollType);
        }
        revealLinesInCenter(startLineNumber, endLineNumber, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this.Kb(startLineNumber, endLineNumber, 1 /* VerticalRevealType.Center */, scrollType);
        }
        revealLinesInCenterIfOutsideViewport(startLineNumber, endLineNumber, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this.Kb(startLineNumber, endLineNumber, 2 /* VerticalRevealType.CenterIfOutsideViewport */, scrollType);
        }
        revealLinesNearTop(startLineNumber, endLineNumber, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this.Kb(startLineNumber, endLineNumber, 5 /* VerticalRevealType.NearTop */, scrollType);
        }
        Kb(startLineNumber, endLineNumber, verticalType, scrollType) {
            if (typeof startLineNumber !== 'number' || typeof endLineNumber !== 'number') {
                throw new Error('Invalid arguments');
            }
            this.Gb(new range_1.$ks(startLineNumber, 1, endLineNumber, 1), verticalType, false, scrollType);
        }
        revealRange(range, scrollType = 0 /* editorCommon.ScrollType.Smooth */, revealVerticalInCenter = false, revealHorizontal = true) {
            this.Lb(range, revealVerticalInCenter ? 1 /* VerticalRevealType.Center */ : 0 /* VerticalRevealType.Simple */, revealHorizontal, scrollType);
        }
        revealRangeInCenter(range, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this.Lb(range, 1 /* VerticalRevealType.Center */, true, scrollType);
        }
        revealRangeInCenterIfOutsideViewport(range, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this.Lb(range, 2 /* VerticalRevealType.CenterIfOutsideViewport */, true, scrollType);
        }
        revealRangeNearTop(range, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this.Lb(range, 5 /* VerticalRevealType.NearTop */, true, scrollType);
        }
        revealRangeNearTopIfOutsideViewport(range, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this.Lb(range, 6 /* VerticalRevealType.NearTopIfOutsideViewport */, true, scrollType);
        }
        revealRangeAtTop(range, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this.Lb(range, 3 /* VerticalRevealType.Top */, true, scrollType);
        }
        Lb(range, verticalType, revealHorizontal, scrollType) {
            if (!range_1.$ks.isIRange(range)) {
                throw new Error('Invalid arguments');
            }
            this.Gb(range_1.$ks.lift(range), verticalType, revealHorizontal, scrollType);
        }
        setSelections(ranges, source = 'api', reason = 0 /* CursorChangeReason.NotSet */) {
            if (!this.mb) {
                return;
            }
            if (!ranges || ranges.length === 0) {
                throw new Error('Invalid arguments');
            }
            for (let i = 0, len = ranges.length; i < len; i++) {
                if (!selection_1.$ms.isISelection(ranges[i])) {
                    throw new Error('Invalid arguments');
                }
            }
            this.mb.viewModel.setSelections(source, ranges, reason);
        }
        getContentWidth() {
            if (!this.mb) {
                return -1;
            }
            return this.mb.viewModel.viewLayout.getContentWidth();
        }
        getScrollWidth() {
            if (!this.mb) {
                return -1;
            }
            return this.mb.viewModel.viewLayout.getScrollWidth();
        }
        getScrollLeft() {
            if (!this.mb) {
                return -1;
            }
            return this.mb.viewModel.viewLayout.getCurrentScrollLeft();
        }
        getContentHeight() {
            if (!this.mb) {
                return -1;
            }
            return this.mb.viewModel.viewLayout.getContentHeight();
        }
        getScrollHeight() {
            if (!this.mb) {
                return -1;
            }
            return this.mb.viewModel.viewLayout.getScrollHeight();
        }
        getScrollTop() {
            if (!this.mb) {
                return -1;
            }
            return this.mb.viewModel.viewLayout.getCurrentScrollTop();
        }
        setScrollLeft(newScrollLeft, scrollType = 1 /* editorCommon.ScrollType.Immediate */) {
            if (!this.mb) {
                return;
            }
            if (typeof newScrollLeft !== 'number') {
                throw new Error('Invalid arguments');
            }
            this.mb.viewModel.viewLayout.setScrollPosition({
                scrollLeft: newScrollLeft
            }, scrollType);
        }
        setScrollTop(newScrollTop, scrollType = 1 /* editorCommon.ScrollType.Immediate */) {
            if (!this.mb) {
                return;
            }
            if (typeof newScrollTop !== 'number') {
                throw new Error('Invalid arguments');
            }
            this.mb.viewModel.viewLayout.setScrollPosition({
                scrollTop: newScrollTop
            }, scrollType);
        }
        setScrollPosition(position, scrollType = 1 /* editorCommon.ScrollType.Immediate */) {
            if (!this.mb) {
                return;
            }
            this.mb.viewModel.viewLayout.setScrollPosition(position, scrollType);
        }
        hasPendingScrollAnimation() {
            if (!this.mb) {
                return false;
            }
            return this.mb.viewModel.viewLayout.hasPendingScrollAnimation();
        }
        saveViewState() {
            if (!this.mb) {
                return null;
            }
            const contributionsState = this.f.saveViewState();
            const cursorState = this.mb.viewModel.saveCursorState();
            const viewState = this.mb.viewModel.saveState();
            return {
                cursorState: cursorState,
                viewState: viewState,
                contributionsState: contributionsState
            };
        }
        restoreViewState(s) {
            if (!this.mb || !this.mb.hasRealView) {
                return;
            }
            const codeEditorState = s;
            if (codeEditorState && codeEditorState.cursorState && codeEditorState.viewState) {
                const cursorState = codeEditorState.cursorState;
                if (Array.isArray(cursorState)) {
                    if (cursorState.length > 0) {
                        this.mb.viewModel.restoreCursorState(cursorState);
                    }
                }
                else {
                    // Backwards compatibility
                    this.mb.viewModel.restoreCursorState([cursorState]);
                }
                this.f.restoreViewState(codeEditorState.contributionsState || {});
                const reducedState = this.mb.viewModel.reduceRestoreState(codeEditorState.viewState);
                this.mb.view.restoreState(reducedState);
            }
        }
        handleInitialized() {
            this._getViewModel()?.visibleLinesStabilized();
        }
        onVisible() {
            this.mb?.view.refreshFocusState();
        }
        onHide() {
            this.mb?.view.refreshFocusState();
            this.tb.refreshState();
        }
        getContribution(id) {
            return this.f.get(id);
        }
        getActions() {
            return Array.from(this.lb.values());
        }
        getSupportedActions() {
            let result = this.getActions();
            result = result.filter(action => action.isSupported());
            return result;
        }
        getAction(id) {
            return this.lb.get(id) || null;
        }
        trigger(source, handlerId, payload) {
            payload = payload || {};
            switch (handlerId) {
                case "compositionStart" /* editorCommon.Handler.CompositionStart */:
                    this.Nb();
                    return;
                case "compositionEnd" /* editorCommon.Handler.CompositionEnd */:
                    this.Ob(source);
                    return;
                case "type" /* editorCommon.Handler.Type */: {
                    const args = payload;
                    this.Pb(source, args.text || '');
                    return;
                }
                case "replacePreviousChar" /* editorCommon.Handler.ReplacePreviousChar */: {
                    const args = payload;
                    this.Qb(source, args.text || '', args.replaceCharCnt || 0, 0, 0);
                    return;
                }
                case "compositionType" /* editorCommon.Handler.CompositionType */: {
                    const args = payload;
                    this.Qb(source, args.text || '', args.replacePrevCharCnt || 0, args.replaceNextCharCnt || 0, args.positionDelta || 0);
                    return;
                }
                case "paste" /* editorCommon.Handler.Paste */: {
                    const args = payload;
                    this.Rb(source, args.text || '', args.pasteOnNewLine || false, args.multicursorText || null, args.mode || null);
                    return;
                }
                case "cut" /* editorCommon.Handler.Cut */:
                    this.Sb(source);
                    return;
            }
            const action = this.getAction(handlerId);
            if (action) {
                Promise.resolve(action.run(payload)).then(undefined, errors_1.$Y);
                return;
            }
            if (!this.mb) {
                return;
            }
            if (this.Tb(source, handlerId, payload)) {
                return;
            }
            this.Mb(handlerId, payload);
        }
        Mb(handlerId, payload) {
            this.rb.executeCommand(handlerId, payload);
        }
        Nb() {
            if (!this.mb) {
                return;
            }
            this.mb.viewModel.startComposition();
            this.L.fire();
        }
        Ob(source) {
            if (!this.mb) {
                return;
            }
            this.mb.viewModel.endComposition(source);
            this.M.fire();
        }
        Pb(source, text) {
            if (!this.mb || text.length === 0) {
                return;
            }
            if (source === 'keyboard') {
                this.I.fire(text);
            }
            this.mb.viewModel.type(text, source);
            if (source === 'keyboard') {
                this.J.fire(text);
            }
        }
        Qb(source, text, replacePrevCharCnt, replaceNextCharCnt, positionDelta) {
            if (!this.mb) {
                return;
            }
            this.mb.viewModel.compositionType(text, replacePrevCharCnt, replaceNextCharCnt, positionDelta, source);
        }
        Rb(source, text, pasteOnNewLine, multicursorText, mode) {
            if (!this.mb || text.length === 0) {
                return;
            }
            const viewModel = this.mb.viewModel;
            const startPosition = viewModel.getSelection().getStartPosition();
            viewModel.paste(text, pasteOnNewLine, multicursorText, source);
            const endPosition = viewModel.getSelection().getStartPosition();
            if (source === 'keyboard') {
                this.N.fire({
                    range: new range_1.$ks(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column),
                    languageId: mode
                });
            }
        }
        Sb(source) {
            if (!this.mb) {
                return;
            }
            this.mb.viewModel.cut(source);
        }
        Tb(source, handlerId, payload) {
            const command = editorExtensions_1.EditorExtensionsRegistry.getEditorCommand(handlerId);
            if (command) {
                payload = payload || {};
                payload.source = source;
                this.nb.invokeFunction((accessor) => {
                    Promise.resolve(command.runEditorCommand(accessor, this, payload)).then(undefined, errors_1.$Y);
                });
                return true;
            }
            return false;
        }
        _getViewModel() {
            if (!this.mb) {
                return null;
            }
            return this.mb.viewModel;
        }
        pushUndoStop() {
            if (!this.mb) {
                return false;
            }
            if (this.jb.options.get(90 /* EditorOption.readOnly */)) {
                // read only editor => sorry!
                return false;
            }
            this.mb.model.pushStackElement();
            return true;
        }
        popUndoStop() {
            if (!this.mb) {
                return false;
            }
            if (this.jb.options.get(90 /* EditorOption.readOnly */)) {
                // read only editor => sorry!
                return false;
            }
            this.mb.model.popStackElement();
            return true;
        }
        executeEdits(source, edits, endCursorState) {
            if (!this.mb) {
                return false;
            }
            if (this.jb.options.get(90 /* EditorOption.readOnly */)) {
                // read only editor => sorry!
                return false;
            }
            let cursorStateComputer;
            if (!endCursorState) {
                cursorStateComputer = () => null;
            }
            else if (Array.isArray(endCursorState)) {
                cursorStateComputer = () => endCursorState;
            }
            else {
                cursorStateComputer = endCursorState;
            }
            this.mb.viewModel.executeEdits(source, edits, cursorStateComputer);
            return true;
        }
        executeCommand(source, command) {
            if (!this.mb) {
                return;
            }
            this.mb.viewModel.executeCommand(command, source);
        }
        executeCommands(source, commands) {
            if (!this.mb) {
                return;
            }
            this.mb.viewModel.executeCommands(commands, source);
        }
        createDecorationsCollection(decorations) {
            return new EditorDecorationsCollection(this, decorations);
        }
        changeDecorations(callback) {
            if (!this.mb) {
                // callback will not be called
                return null;
            }
            return this.mb.model.changeDecorations(callback, this.ib);
        }
        getLineDecorations(lineNumber) {
            if (!this.mb) {
                return null;
            }
            return this.mb.model.getLineDecorations(lineNumber, this.ib, (0, editorOptions_1.filterValidationDecorations)(this.jb.options));
        }
        getDecorationsInRange(range) {
            if (!this.mb) {
                return null;
            }
            return this.mb.model.getDecorationsInRange(range, this.ib, (0, editorOptions_1.filterValidationDecorations)(this.jb.options));
        }
        /**
         * @deprecated
         */
        deltaDecorations(oldDecorations, newDecorations) {
            if (!this.mb) {
                return [];
            }
            if (oldDecorations.length === 0 && newDecorations.length === 0) {
                return oldDecorations;
            }
            return this.mb.model.deltaDecorations(oldDecorations, newDecorations, this.ib);
        }
        removeDecorations(decorationIds) {
            if (!this.mb || decorationIds.length === 0) {
                return;
            }
            this.mb.model.changeDecorations((changeAccessor) => {
                changeAccessor.deltaDecorations(decorationIds, []);
            });
        }
        setDecorationsByType(description, decorationTypeKey, decorationOptions) {
            const newDecorationsSubTypes = {};
            const oldDecorationsSubTypes = this.yb[decorationTypeKey] || {};
            this.yb[decorationTypeKey] = newDecorationsSubTypes;
            const newModelDecorations = [];
            for (const decorationOption of decorationOptions) {
                let typeKey = decorationTypeKey;
                if (decorationOption.renderOptions) {
                    // identify custom render options by a hash code over all keys and values
                    // For custom render options register a decoration type if necessary
                    const subType = (0, hash_1.$pi)(decorationOption.renderOptions).toString(16);
                    // The fact that `decorationTypeKey` appears in the typeKey has no influence
                    // it is just a mechanism to get predictable and unique keys (repeatable for the same options and unique across clients)
                    typeKey = decorationTypeKey + '-' + subType;
                    if (!oldDecorationsSubTypes[subType] && !newDecorationsSubTypes[subType]) {
                        // decoration type did not exist before, register new one
                        this.Yb(description, typeKey, decorationOption.renderOptions, decorationTypeKey);
                    }
                    newDecorationsSubTypes[subType] = true;
                }
                const opts = this.$b(typeKey, !!decorationOption.hoverMessage);
                if (decorationOption.hoverMessage) {
                    opts.hoverMessage = decorationOption.hoverMessage;
                }
                newModelDecorations.push({ range: decorationOption.range, options: opts });
            }
            // remove decoration sub types that are no longer used, deregister decoration type if necessary
            for (const subType in oldDecorationsSubTypes) {
                if (!newDecorationsSubTypes[subType]) {
                    this.Zb(decorationTypeKey + '-' + subType);
                }
            }
            // update all decorations
            const oldDecorationsIds = this.xb[decorationTypeKey] || [];
            this.xb[decorationTypeKey] = this.deltaDecorations(oldDecorationsIds, newModelDecorations);
        }
        setDecorationsByTypeFast(decorationTypeKey, ranges) {
            // remove decoration sub types that are no longer used, deregister decoration type if necessary
            const oldDecorationsSubTypes = this.yb[decorationTypeKey] || {};
            for (const subType in oldDecorationsSubTypes) {
                this.Zb(decorationTypeKey + '-' + subType);
            }
            this.yb[decorationTypeKey] = {};
            const opts = textModel_1.$RC.createDynamic(this.$b(decorationTypeKey, false));
            const newModelDecorations = new Array(ranges.length);
            for (let i = 0, len = ranges.length; i < len; i++) {
                newModelDecorations[i] = { range: ranges[i], options: opts };
            }
            // update all decorations
            const oldDecorationsIds = this.xb[decorationTypeKey] || [];
            this.xb[decorationTypeKey] = this.deltaDecorations(oldDecorationsIds, newModelDecorations);
        }
        removeDecorationsByType(decorationTypeKey) {
            // remove decorations for type and sub type
            const oldDecorationsIds = this.xb[decorationTypeKey];
            if (oldDecorationsIds) {
                this.deltaDecorations(oldDecorationsIds, []);
            }
            if (this.xb.hasOwnProperty(decorationTypeKey)) {
                delete this.xb[decorationTypeKey];
            }
            if (this.yb.hasOwnProperty(decorationTypeKey)) {
                delete this.yb[decorationTypeKey];
            }
        }
        getLayoutInfo() {
            const options = this.jb.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            return layoutInfo;
        }
        createOverviewRuler(cssClassName) {
            if (!this.mb || !this.mb.hasRealView) {
                return null;
            }
            return this.mb.view.createOverviewRuler(cssClassName);
        }
        getContainerDomNode() {
            return this.gb;
        }
        getDomNode() {
            if (!this.mb || !this.mb.hasRealView) {
                return null;
            }
            return this.mb.view.domNode.domNode;
        }
        delegateVerticalScrollbarPointerDown(browserEvent) {
            if (!this.mb || !this.mb.hasRealView) {
                return;
            }
            this.mb.view.delegateVerticalScrollbarPointerDown(browserEvent);
        }
        delegateScrollFromMouseWheelEvent(browserEvent) {
            if (!this.mb || !this.mb.hasRealView) {
                return;
            }
            this.mb.view.delegateScrollFromMouseWheelEvent(browserEvent);
        }
        layout(dimension) {
            this.jb.observeContainer(dimension);
            this.render();
        }
        focus() {
            if (!this.mb || !this.mb.hasRealView) {
                return;
            }
            this.mb.view.focus();
        }
        hasTextFocus() {
            if (!this.mb || !this.mb.hasRealView) {
                return false;
            }
            return this.mb.view.isFocused();
        }
        hasWidgetFocus() {
            return this.tb && this.tb.hasFocus();
        }
        addContentWidget(widget) {
            const widgetData = {
                widget: widget,
                position: widget.getPosition()
            };
            if (this.ub.hasOwnProperty(widget.getId())) {
                console.warn('Overwriting a content widget with the same id.');
            }
            this.ub[widget.getId()] = widgetData;
            if (this.mb && this.mb.hasRealView) {
                this.mb.view.addContentWidget(widgetData);
            }
        }
        layoutContentWidget(widget) {
            const widgetId = widget.getId();
            if (this.ub.hasOwnProperty(widgetId)) {
                const widgetData = this.ub[widgetId];
                widgetData.position = widget.getPosition();
                if (this.mb && this.mb.hasRealView) {
                    this.mb.view.layoutContentWidget(widgetData);
                }
            }
        }
        removeContentWidget(widget) {
            const widgetId = widget.getId();
            if (this.ub.hasOwnProperty(widgetId)) {
                const widgetData = this.ub[widgetId];
                delete this.ub[widgetId];
                if (this.mb && this.mb.hasRealView) {
                    this.mb.view.removeContentWidget(widgetData);
                }
            }
        }
        addOverlayWidget(widget) {
            const widgetData = {
                widget: widget,
                position: widget.getPosition()
            };
            if (this.vb.hasOwnProperty(widget.getId())) {
                console.warn('Overwriting an overlay widget with the same id.');
            }
            this.vb[widget.getId()] = widgetData;
            if (this.mb && this.mb.hasRealView) {
                this.mb.view.addOverlayWidget(widgetData);
            }
        }
        layoutOverlayWidget(widget) {
            const widgetId = widget.getId();
            if (this.vb.hasOwnProperty(widgetId)) {
                const widgetData = this.vb[widgetId];
                widgetData.position = widget.getPosition();
                if (this.mb && this.mb.hasRealView) {
                    this.mb.view.layoutOverlayWidget(widgetData);
                }
            }
        }
        removeOverlayWidget(widget) {
            const widgetId = widget.getId();
            if (this.vb.hasOwnProperty(widgetId)) {
                const widgetData = this.vb[widgetId];
                delete this.vb[widgetId];
                if (this.mb && this.mb.hasRealView) {
                    this.mb.view.removeOverlayWidget(widgetData);
                }
            }
        }
        addGlyphMarginWidget(widget) {
            const widgetData = {
                widget: widget,
                position: widget.getPosition()
            };
            if (this.wb.hasOwnProperty(widget.getId())) {
                console.warn('Overwriting a glyph margin widget with the same id.');
            }
            this.wb[widget.getId()] = widgetData;
            if (this.mb && this.mb.hasRealView) {
                this.mb.view.addGlyphMarginWidget(widgetData);
            }
        }
        layoutGlyphMarginWidget(widget) {
            const widgetId = widget.getId();
            if (this.wb.hasOwnProperty(widgetId)) {
                const widgetData = this.wb[widgetId];
                widgetData.position = widget.getPosition();
                if (this.mb && this.mb.hasRealView) {
                    this.mb.view.layoutGlyphMarginWidget(widgetData);
                }
            }
        }
        removeGlyphMarginWidget(widget) {
            const widgetId = widget.getId();
            if (this.wb.hasOwnProperty(widgetId)) {
                const widgetData = this.wb[widgetId];
                delete this.wb[widgetId];
                if (this.mb && this.mb.hasRealView) {
                    this.mb.view.removeGlyphMarginWidget(widgetData);
                }
            }
        }
        changeViewZones(callback) {
            if (!this.mb || !this.mb.hasRealView) {
                return;
            }
            this.mb.view.change(callback);
        }
        getTargetAtClientPoint(clientX, clientY) {
            if (!this.mb || !this.mb.hasRealView) {
                return null;
            }
            return this.mb.view.getTargetAtClientPoint(clientX, clientY);
        }
        getScrolledVisiblePosition(rawPosition) {
            if (!this.mb || !this.mb.hasRealView) {
                return null;
            }
            const position = this.mb.model.validatePosition(rawPosition);
            const options = this.jb.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            const top = $uY_1.Fb(this.mb, position.lineNumber, position.column) - this.getScrollTop();
            const left = this.mb.view.getOffsetForColumn(position.lineNumber, position.column) + layoutInfo.glyphMarginWidth + layoutInfo.lineNumbersWidth + layoutInfo.decorationsWidth - this.getScrollLeft();
            return {
                top: top,
                left: left,
                height: options.get(66 /* EditorOption.lineHeight */)
            };
        }
        getOffsetForColumn(lineNumber, column) {
            if (!this.mb || !this.mb.hasRealView) {
                return -1;
            }
            return this.mb.view.getOffsetForColumn(lineNumber, column);
        }
        render(forceRedraw = false) {
            if (!this.mb || !this.mb.hasRealView) {
                return;
            }
            this.mb.view.render(true, forceRedraw);
        }
        setAriaOptions(options) {
            if (!this.mb || !this.mb.hasRealView) {
                return;
            }
            this.mb.view.setAriaOptions(options);
        }
        applyFontInfo(target) {
            (0, domFontInfo_1.$vU)(target, this.jb.options.get(50 /* EditorOption.fontInfo */));
        }
        setBanner(domNode, domNodeHeight) {
            if (this.zb && this.gb.contains(this.zb)) {
                this.gb.removeChild(this.zb);
            }
            this.zb = domNode;
            this.jb.setReservedHeight(domNode ? domNodeHeight : 0);
            if (this.zb) {
                this.gb.prepend(this.zb);
            }
        }
        Ub(model) {
            if (!model) {
                this.mb = null;
                return;
            }
            const listenersToRemove = [];
            this.gb.setAttribute('data-mode-id', model.getLanguageId());
            this.jb.setIsDominatedByLongLines(model.isDominatedByLongLines());
            this.jb.setModelLineCount(model.getLineCount());
            const attachedView = model.onBeforeAttached();
            const viewModel = new viewModelImpl_1.$qY(this.ib, this.jb, model, domLineBreaksComputer_1.$sY.create(), monospaceLineBreaksComputer_1.$rY.create(this.jb.options), (callback) => dom.$vO(callback), this.Bb, this.sb, attachedView);
            // Someone might destroy the model from under the editor, so prevent any exceptions by setting a null model
            listenersToRemove.push(model.onWillDispose(() => this.setModel(null)));
            listenersToRemove.push(viewModel.onEvent((e) => {
                switch (e.kind) {
                    case 0 /* OutgoingViewModelEventKind.ContentSizeChanged */:
                        this.bb.fire(e);
                        break;
                    case 1 /* OutgoingViewModelEventKind.FocusChanged */:
                        this.G.setValue(e.hasFocus);
                        break;
                    case 2 /* OutgoingViewModelEventKind.ScrollChanged */:
                        this.cb.fire(e);
                        break;
                    case 3 /* OutgoingViewModelEventKind.ViewZonesChanged */:
                        this.db.fire();
                        break;
                    case 4 /* OutgoingViewModelEventKind.HiddenAreasChanged */:
                        this.eb.fire();
                        break;
                    case 5 /* OutgoingViewModelEventKind.ReadOnlyEditAttempt */:
                        this.D.fire();
                        break;
                    case 6 /* OutgoingViewModelEventKind.CursorStateChanged */: {
                        if (e.reachedMaxCursorCount) {
                            const multiCursorLimit = this.getOption(79 /* EditorOption.multiCursorLimit */);
                            const message = nls.localize(0, null, multiCursorLimit);
                            this.pb.prompt(notification_1.Severity.Warning, message, [
                                {
                                    label: 'Find and Replace',
                                    run: () => {
                                        this.rb.executeCommand('editor.action.startFindReplaceAction');
                                    }
                                },
                                {
                                    label: nls.localize(1, null),
                                    run: () => {
                                        this.rb.executeCommand('workbench.action.openSettings2', {
                                            query: 'editor.multiCursorLimit'
                                        });
                                    }
                                }
                            ]);
                        }
                        const positions = [];
                        for (let i = 0, len = e.selections.length; i < len; i++) {
                            positions[i] = e.selections[i].getPosition();
                        }
                        const e1 = {
                            position: positions[0],
                            secondaryPositions: positions.slice(1),
                            reason: e.reason,
                            source: e.source
                        };
                        this.z.fire(e1);
                        const e2 = {
                            selection: e.selections[0],
                            secondarySelections: e.selections.slice(1),
                            modelVersionId: e.modelVersionId,
                            oldSelections: e.oldSelections,
                            oldModelVersionId: e.oldModelVersionId,
                            source: e.source,
                            reason: e.reason
                        };
                        this.C.fire(e2);
                        break;
                    }
                    case 7 /* OutgoingViewModelEventKind.ModelDecorationsChanged */:
                        this.t.fire(e.event);
                        break;
                    case 8 /* OutgoingViewModelEventKind.ModelLanguageChanged */:
                        this.gb.setAttribute('data-mode-id', model.getLanguageId());
                        this.j.fire(e.event);
                        break;
                    case 9 /* OutgoingViewModelEventKind.ModelLanguageConfigurationChanged */:
                        this.m.fire(e.event);
                        break;
                    case 10 /* OutgoingViewModelEventKind.ModelContentChanged */:
                        this.h.fire(e.event);
                        break;
                    case 11 /* OutgoingViewModelEventKind.ModelOptionsChanged */:
                        this.n.fire(e.event);
                        break;
                    case 12 /* OutgoingViewModelEventKind.ModelTokensChanged */:
                        this.u.fire(e.event);
                        break;
                }
            }));
            const [view, hasRealView] = this.Vb(viewModel);
            if (hasRealView) {
                this.gb.appendChild(view.domNode.domNode);
                let keys = Object.keys(this.ub);
                for (let i = 0, len = keys.length; i < len; i++) {
                    const widgetId = keys[i];
                    view.addContentWidget(this.ub[widgetId]);
                }
                keys = Object.keys(this.vb);
                for (let i = 0, len = keys.length; i < len; i++) {
                    const widgetId = keys[i];
                    view.addOverlayWidget(this.vb[widgetId]);
                }
                keys = Object.keys(this.wb);
                for (let i = 0, len = keys.length; i < len; i++) {
                    const widgetId = keys[i];
                    view.addGlyphMarginWidget(this.wb[widgetId]);
                }
                view.render(false, true);
                view.domNode.domNode.setAttribute('data-uri', model.uri.toString());
            }
            this.mb = new ModelData(model, viewModel, view, hasRealView, listenersToRemove, attachedView);
        }
        Vb(viewModel) {
            let commandDelegate;
            if (this.isSimpleWidget) {
                commandDelegate = {
                    paste: (text, pasteOnNewLine, multicursorText, mode) => {
                        this.Rb('keyboard', text, pasteOnNewLine, multicursorText, mode);
                    },
                    type: (text) => {
                        this.Pb('keyboard', text);
                    },
                    compositionType: (text, replacePrevCharCnt, replaceNextCharCnt, positionDelta) => {
                        this.Qb('keyboard', text, replacePrevCharCnt, replaceNextCharCnt, positionDelta);
                    },
                    startComposition: () => {
                        this.Nb();
                    },
                    endComposition: () => {
                        this.Ob('keyboard');
                    },
                    cut: () => {
                        this.Sb('keyboard');
                    }
                };
            }
            else {
                commandDelegate = {
                    paste: (text, pasteOnNewLine, multicursorText, mode) => {
                        const payload = { text, pasteOnNewLine, multicursorText, mode };
                        this.rb.executeCommand("paste" /* editorCommon.Handler.Paste */, payload);
                    },
                    type: (text) => {
                        const payload = { text };
                        this.rb.executeCommand("type" /* editorCommon.Handler.Type */, payload);
                    },
                    compositionType: (text, replacePrevCharCnt, replaceNextCharCnt, positionDelta) => {
                        // Try if possible to go through the existing `replacePreviousChar` command
                        if (replaceNextCharCnt || positionDelta) {
                            // must be handled through the new command
                            const payload = { text, replacePrevCharCnt, replaceNextCharCnt, positionDelta };
                            this.rb.executeCommand("compositionType" /* editorCommon.Handler.CompositionType */, payload);
                        }
                        else {
                            const payload = { text, replaceCharCnt: replacePrevCharCnt };
                            this.rb.executeCommand("replacePreviousChar" /* editorCommon.Handler.ReplacePreviousChar */, payload);
                        }
                    },
                    startComposition: () => {
                        this.rb.executeCommand("compositionStart" /* editorCommon.Handler.CompositionStart */, {});
                    },
                    endComposition: () => {
                        this.rb.executeCommand("compositionEnd" /* editorCommon.Handler.CompositionEnd */, {});
                    },
                    cut: () => {
                        this.rb.executeCommand("cut" /* editorCommon.Handler.Cut */, {});
                    }
                };
            }
            const viewUserInputEvents = new viewUserInputEvents_1.$jW(viewModel.coordinatesConverter);
            viewUserInputEvents.onKeyDown = (e) => this.ab.fire(e);
            viewUserInputEvents.onKeyUp = (e) => this.$.fire(e);
            viewUserInputEvents.onContextMenu = (e) => this.W.fire(e);
            viewUserInputEvents.onMouseMove = (e) => this.X.fire(e);
            viewUserInputEvents.onMouseLeave = (e) => this.Y.fire(e);
            viewUserInputEvents.onMouseDown = (e) => this.P.fire(e);
            viewUserInputEvents.onMouseUp = (e) => this.O.fire(e);
            viewUserInputEvents.onMouseDrag = (e) => this.Q.fire(e);
            viewUserInputEvents.onMouseDrop = (e) => this.R.fire(e);
            viewUserInputEvents.onMouseDropCanceled = (e) => this.S.fire(e);
            viewUserInputEvents.onMouseWheel = (e) => this.Z.fire(e);
            const view = new view_1.$TX(commandDelegate, this.jb, this.sb.getColorTheme(), viewModel, viewUserInputEvents, this.hb, this.nb);
            return [view, true];
        }
        Wb(detachedModel) {
            detachedModel?.removeAllDecorationsWithOwnerId(this.ib);
        }
        Xb() {
            if (!this.mb) {
                return null;
            }
            const model = this.mb.model;
            const removeDomNode = this.mb.hasRealView ? this.mb.view.domNode.domNode : null;
            this.mb.dispose();
            this.mb = null;
            this.gb.removeAttribute('data-mode-id');
            if (removeDomNode && this.gb.contains(removeDomNode)) {
                this.gb.removeChild(removeDomNode);
            }
            if (this.zb && this.gb.contains(this.zb)) {
                this.gb.removeChild(this.zb);
            }
            return model;
        }
        Yb(description, key, options, parentTypeKey) {
            this.qb.registerDecorationType(description, key, options, parentTypeKey, this);
        }
        Zb(key) {
            this.qb.removeDecorationType(key);
        }
        $b(typeKey, writable) {
            return this.qb.resolveDecorationOptions(typeKey, writable);
        }
        getTelemetryData() {
            return this.fb;
        }
        hasModel() {
            return (this.mb !== null);
        }
        ac(position) {
            const newDecorations = [{
                    range: new range_1.$ks(position.lineNumber, position.column, position.lineNumber, position.column),
                    options: $uY_1.b
                }];
            this.Ab.set(newDecorations);
            this.revealPosition(position, 1 /* editorCommon.ScrollType.Immediate */);
        }
        bc() {
            this.Ab.clear();
        }
        setContextValue(key, value) {
            this.ob.createKey(key, value);
        }
    };
    exports.$uY = $uY;
    exports.$uY = $uY = $uY_1 = __decorate([
        __param(3, instantiation_1.$Ah),
        __param(4, codeEditorService_1.$nV),
        __param(5, commands_1.$Fr),
        __param(6, contextkey_1.$3i),
        __param(7, themeService_1.$gv),
        __param(8, notification_1.$Yu),
        __param(9, accessibility_1.$1r),
        __param(10, languageConfigurationRegistry_1.$2t),
        __param(11, languageFeatures_1.$hF)
    ], $uY);
    var BooleanEventValue;
    (function (BooleanEventValue) {
        BooleanEventValue[BooleanEventValue["NotSet"] = 0] = "NotSet";
        BooleanEventValue[BooleanEventValue["False"] = 1] = "False";
        BooleanEventValue[BooleanEventValue["True"] = 2] = "True";
    })(BooleanEventValue || (BooleanEventValue = {}));
    class $vY extends lifecycle_1.$kc {
        constructor(g) {
            super();
            this.g = g;
            this.b = this.B(new event_1.$fd(this.g));
            this.onDidChangeToTrue = this.b.event;
            this.c = this.B(new event_1.$fd(this.g));
            this.onDidChangeToFalse = this.c.event;
            this.f = 0 /* BooleanEventValue.NotSet */;
        }
        setValue(_value) {
            const value = (_value ? 2 /* BooleanEventValue.True */ : 1 /* BooleanEventValue.False */);
            if (this.f === value) {
                return;
            }
            this.f = value;
            if (this.f === 2 /* BooleanEventValue.True */) {
                this.b.fire();
            }
            else if (this.f === 1 /* BooleanEventValue.False */) {
                this.c.fire();
            }
        }
    }
    exports.$vY = $vY;
    /**
     * A regular event emitter that also makes sure contributions are instantiated if necessary
     */
    class InteractionEmitter extends event_1.$fd {
        constructor(h, deliveryQueue) {
            super({ deliveryQueue });
            this.h = h;
        }
        fire(event) {
            this.h.onBeforeInteractionEvent();
            super.fire(event);
        }
    }
    class EditorContextKeysManager extends lifecycle_1.$kc {
        constructor(editor, contextKeyService) {
            super();
            this.b = editor;
            contextKeyService.createKey('editorId', editor.getId());
            this.c = editorContextKeys_1.EditorContextKeys.editorSimpleInput.bindTo(contextKeyService);
            this.f = editorContextKeys_1.EditorContextKeys.focus.bindTo(contextKeyService);
            this.g = editorContextKeys_1.EditorContextKeys.textInputFocus.bindTo(contextKeyService);
            this.h = editorContextKeys_1.EditorContextKeys.editorTextFocus.bindTo(contextKeyService);
            this.j = editorContextKeys_1.EditorContextKeys.tabMovesFocus.bindTo(contextKeyService);
            this.m = editorContextKeys_1.EditorContextKeys.readOnly.bindTo(contextKeyService);
            this.n = editorContextKeys_1.EditorContextKeys.inDiffEditor.bindTo(contextKeyService);
            this.t = editorContextKeys_1.EditorContextKeys.columnSelection.bindTo(contextKeyService);
            this.u = editorContextKeys_1.EditorContextKeys.hasMultipleSelections.bindTo(contextKeyService);
            this.w = editorContextKeys_1.EditorContextKeys.hasNonEmptySelection.bindTo(contextKeyService);
            this.y = editorContextKeys_1.EditorContextKeys.canUndo.bindTo(contextKeyService);
            this.z = editorContextKeys_1.EditorContextKeys.canRedo.bindTo(contextKeyService);
            this.B(this.b.onDidChangeConfiguration(() => this.C()));
            this.B(this.b.onDidChangeCursorSelection(() => this.D()));
            this.B(this.b.onDidFocusEditorWidget(() => this.F()));
            this.B(this.b.onDidBlurEditorWidget(() => this.F()));
            this.B(this.b.onDidFocusEditorText(() => this.F()));
            this.B(this.b.onDidBlurEditorText(() => this.F()));
            this.B(this.b.onDidChangeModel(() => this.G()));
            this.B(this.b.onDidChangeConfiguration(() => this.G()));
            this.B(tabFocus_1.$CU.onDidChangeTabFocus((tabFocusMode) => this.j.set(tabFocusMode)));
            this.C();
            this.D();
            this.F();
            this.G();
            this.c.set(this.b.isSimpleWidget);
        }
        C() {
            const options = this.b.getOptions();
            this.j.set(tabFocus_1.$CU.getTabFocusMode());
            this.m.set(options.get(90 /* EditorOption.readOnly */));
            this.n.set(options.get(61 /* EditorOption.inDiffEditor */));
            this.t.set(options.get(22 /* EditorOption.columnSelection */));
        }
        D() {
            const selections = this.b.getSelections();
            if (!selections) {
                this.u.reset();
                this.w.reset();
            }
            else {
                this.u.set(selections.length > 1);
                this.w.set(selections.some(s => !s.isEmpty()));
            }
        }
        F() {
            this.f.set(this.b.hasWidgetFocus() && !this.b.isSimpleWidget);
            this.h.set(this.b.hasTextFocus() && !this.b.isSimpleWidget);
            this.g.set(this.b.hasTextFocus());
        }
        G() {
            const model = this.b.getModel();
            this.y.set(Boolean(model && model.canUndo()));
            this.z.set(Boolean(model && model.canRedo()));
        }
    }
    class $wY extends lifecycle_1.$kc {
        constructor(L, M, N) {
            super();
            this.L = L;
            this.M = M;
            this.N = N;
            this.b = editorContextKeys_1.EditorContextKeys.languageId.bindTo(M);
            this.c = editorContextKeys_1.EditorContextKeys.hasCompletionItemProvider.bindTo(M);
            this.f = editorContextKeys_1.EditorContextKeys.hasCodeActionsProvider.bindTo(M);
            this.g = editorContextKeys_1.EditorContextKeys.hasCodeLensProvider.bindTo(M);
            this.h = editorContextKeys_1.EditorContextKeys.hasDefinitionProvider.bindTo(M);
            this.j = editorContextKeys_1.EditorContextKeys.hasDeclarationProvider.bindTo(M);
            this.m = editorContextKeys_1.EditorContextKeys.hasImplementationProvider.bindTo(M);
            this.n = editorContextKeys_1.EditorContextKeys.hasTypeDefinitionProvider.bindTo(M);
            this.t = editorContextKeys_1.EditorContextKeys.hasHoverProvider.bindTo(M);
            this.u = editorContextKeys_1.EditorContextKeys.hasDocumentHighlightProvider.bindTo(M);
            this.w = editorContextKeys_1.EditorContextKeys.hasDocumentSymbolProvider.bindTo(M);
            this.y = editorContextKeys_1.EditorContextKeys.hasReferenceProvider.bindTo(M);
            this.z = editorContextKeys_1.EditorContextKeys.hasRenameProvider.bindTo(M);
            this.H = editorContextKeys_1.EditorContextKeys.hasSignatureHelpProvider.bindTo(M);
            this.I = editorContextKeys_1.EditorContextKeys.hasInlayHintsProvider.bindTo(M);
            this.C = editorContextKeys_1.EditorContextKeys.hasDocumentFormattingProvider.bindTo(M);
            this.D = editorContextKeys_1.EditorContextKeys.hasDocumentSelectionFormattingProvider.bindTo(M);
            this.F = editorContextKeys_1.EditorContextKeys.hasMultipleDocumentFormattingProvider.bindTo(M);
            this.G = editorContextKeys_1.EditorContextKeys.hasMultipleDocumentSelectionFormattingProvider.bindTo(M);
            this.J = editorContextKeys_1.EditorContextKeys.isInWalkThroughSnippet.bindTo(M);
            const update = () => this.O();
            // update when model/mode changes
            this.B(L.onDidChangeModel(update));
            this.B(L.onDidChangeModelLanguage(update));
            // update when registries change
            this.B(N.completionProvider.onDidChange(update));
            this.B(N.codeActionProvider.onDidChange(update));
            this.B(N.codeLensProvider.onDidChange(update));
            this.B(N.definitionProvider.onDidChange(update));
            this.B(N.declarationProvider.onDidChange(update));
            this.B(N.implementationProvider.onDidChange(update));
            this.B(N.typeDefinitionProvider.onDidChange(update));
            this.B(N.hoverProvider.onDidChange(update));
            this.B(N.documentHighlightProvider.onDidChange(update));
            this.B(N.documentSymbolProvider.onDidChange(update));
            this.B(N.referenceProvider.onDidChange(update));
            this.B(N.renameProvider.onDidChange(update));
            this.B(N.documentFormattingEditProvider.onDidChange(update));
            this.B(N.documentRangeFormattingEditProvider.onDidChange(update));
            this.B(N.signatureHelpProvider.onDidChange(update));
            this.B(N.inlayHintsProvider.onDidChange(update));
            update();
        }
        dispose() {
            super.dispose();
        }
        reset() {
            this.M.bufferChangeEvents(() => {
                this.b.reset();
                this.c.reset();
                this.f.reset();
                this.g.reset();
                this.h.reset();
                this.j.reset();
                this.m.reset();
                this.n.reset();
                this.t.reset();
                this.u.reset();
                this.w.reset();
                this.y.reset();
                this.z.reset();
                this.C.reset();
                this.D.reset();
                this.H.reset();
                this.J.reset();
            });
        }
        O() {
            const model = this.L.getModel();
            if (!model) {
                this.reset();
                return;
            }
            this.M.bufferChangeEvents(() => {
                this.b.set(model.getLanguageId());
                this.c.set(this.N.completionProvider.has(model));
                this.f.set(this.N.codeActionProvider.has(model));
                this.g.set(this.N.codeLensProvider.has(model));
                this.h.set(this.N.definitionProvider.has(model));
                this.j.set(this.N.declarationProvider.has(model));
                this.m.set(this.N.implementationProvider.has(model));
                this.n.set(this.N.typeDefinitionProvider.has(model));
                this.t.set(this.N.hoverProvider.has(model));
                this.u.set(this.N.documentHighlightProvider.has(model));
                this.w.set(this.N.documentSymbolProvider.has(model));
                this.y.set(this.N.referenceProvider.has(model));
                this.z.set(this.N.renameProvider.has(model));
                this.H.set(this.N.signatureHelpProvider.has(model));
                this.I.set(this.N.inlayHintsProvider.has(model));
                this.C.set(this.N.documentFormattingEditProvider.has(model) || this.N.documentRangeFormattingEditProvider.has(model));
                this.D.set(this.N.documentRangeFormattingEditProvider.has(model));
                this.F.set(this.N.documentFormattingEditProvider.all(model).length + this.N.documentRangeFormattingEditProvider.all(model).length > 1);
                this.G.set(this.N.documentRangeFormattingEditProvider.all(model).length > 1);
                this.J.set(model.uri.scheme === network_1.Schemas.walkThroughSnippet);
            });
        }
    }
    exports.$wY = $wY;
    class CodeEditorWidgetFocusTracker extends lifecycle_1.$kc {
        constructor(domElement) {
            super();
            this.f = this.B(new event_1.$fd());
            this.onChange = this.f.event;
            this.b = false;
            this.c = this.B(dom.$8O(domElement));
            this.B(this.c.onDidFocus(() => {
                this.b = true;
                this.f.fire(undefined);
            }));
            this.B(this.c.onDidBlur(() => {
                this.b = false;
                this.f.fire(undefined);
            }));
        }
        hasFocus() {
            return this.b;
        }
        refreshState() {
            this.c.refreshState?.();
        }
    }
    class EditorDecorationsCollection {
        get length() {
            return this.b.length;
        }
        constructor(d, decorations) {
            this.d = d;
            this.b = [];
            this.c = false;
            if (Array.isArray(decorations) && decorations.length > 0) {
                this.set(decorations);
            }
        }
        onDidChange(listener, thisArgs, disposables) {
            return this.d.onDidChangeModelDecorations((e) => {
                if (this.c) {
                    return;
                }
                listener.call(thisArgs, e);
            }, disposables);
        }
        getRange(index) {
            if (!this.d.hasModel()) {
                return null;
            }
            if (index >= this.b.length) {
                return null;
            }
            return this.d.getModel().getDecorationRange(this.b[index]);
        }
        getRanges() {
            if (!this.d.hasModel()) {
                return [];
            }
            const model = this.d.getModel();
            const result = [];
            for (const decorationId of this.b) {
                const range = model.getDecorationRange(decorationId);
                if (range) {
                    result.push(range);
                }
            }
            return result;
        }
        has(decoration) {
            return this.b.includes(decoration.id);
        }
        clear() {
            if (this.b.length === 0) {
                // nothing to do
                return;
            }
            this.set([]);
        }
        set(newDecorations) {
            try {
                this.c = true;
                this.d.changeDecorations((accessor) => {
                    this.b = accessor.deltaDecorations(this.b, newDecorations);
                });
            }
            finally {
                this.c = false;
            }
            return this.b;
        }
    }
    const squigglyStart = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 6 3' enable-background='new 0 0 6 3' height='3' width='6'><g fill='`);
    const squigglyEnd = encodeURIComponent(`'><polygon points='5.5,0 2.5,3 1.1,3 4.1,0'/><polygon points='4,0 6,2 6,0.6 5.4,0'/><polygon points='0,2 1,3 2.4,3 0,0.6'/></g></svg>`);
    function getSquigglySVGData(color) {
        return squigglyStart + encodeURIComponent(color.toString()) + squigglyEnd;
    }
    const dotdotdotStart = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" height="3" width="12"><g fill="`);
    const dotdotdotEnd = encodeURIComponent(`"><circle cx="1" cy="1" r="1"/><circle cx="5" cy="1" r="1"/><circle cx="9" cy="1" r="1"/></g></svg>`);
    function getDotDotDotSVGData(color) {
        return dotdotdotStart + encodeURIComponent(color.toString()) + dotdotdotEnd;
    }
    (0, themeService_1.$mv)((theme, collector) => {
        const errorForeground = theme.getColor(colorRegistry_1.$lw);
        if (errorForeground) {
            collector.addRule(`.monaco-editor .${"squiggly-error" /* ClassName.EditorErrorDecoration */} { background: url("data:image/svg+xml,${getSquigglySVGData(errorForeground)}") repeat-x bottom left; }`);
        }
        const warningForeground = theme.getColor(colorRegistry_1.$ow);
        if (warningForeground) {
            collector.addRule(`.monaco-editor .${"squiggly-warning" /* ClassName.EditorWarningDecoration */} { background: url("data:image/svg+xml,${getSquigglySVGData(warningForeground)}") repeat-x bottom left; }`);
        }
        const infoForeground = theme.getColor(colorRegistry_1.$rw);
        if (infoForeground) {
            collector.addRule(`.monaco-editor .${"squiggly-info" /* ClassName.EditorInfoDecoration */} { background: url("data:image/svg+xml,${getSquigglySVGData(infoForeground)}") repeat-x bottom left; }`);
        }
        const hintForeground = theme.getColor(colorRegistry_1.$tw);
        if (hintForeground) {
            collector.addRule(`.monaco-editor .${"squiggly-hint" /* ClassName.EditorHintDecoration */} { background: url("data:image/svg+xml,${getDotDotDotSVGData(hintForeground)}") no-repeat bottom left; }`);
        }
        const unnecessaryForeground = theme.getColor(editorColorRegistry_1.$nB);
        if (unnecessaryForeground) {
            collector.addRule(`.monaco-editor.showUnused .${"squiggly-inline-unnecessary" /* ClassName.EditorUnnecessaryInlineDecoration */} { opacity: ${unnecessaryForeground.rgba.a}; }`);
        }
    });
});
//# sourceMappingURL=codeEditorWidget.js.map