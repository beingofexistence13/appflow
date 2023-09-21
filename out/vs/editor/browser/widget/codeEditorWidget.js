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
define(["require", "exports", "vs/nls", "vs/base/browser/dom", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/hash", "vs/base/common/lifecycle", "vs/base/common/network", "vs/editor/browser/config/editorConfiguration", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/view", "vs/editor/browser/view/viewUserInputEvents", "vs/editor/common/config/editorOptions", "vs/editor/common/core/cursorColumns", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/editorAction", "vs/editor/common/editorCommon", "vs/editor/common/editorContextKeys", "vs/editor/common/model/textModel", "vs/editor/common/core/editorColorRegistry", "vs/platform/theme/common/colorRegistry", "vs/editor/common/viewModel/viewModelImpl", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/notification/common/notification", "vs/platform/theme/common/themeService", "vs/platform/accessibility/common/accessibility", "vs/editor/common/viewModel/monospaceLineBreaksComputer", "vs/editor/browser/view/domLineBreaksComputer", "vs/editor/common/cursor/cursorWordOperations", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/browser/config/domFontInfo", "vs/editor/common/services/languageFeatures", "vs/editor/browser/widget/codeEditorContributions", "vs/editor/browser/config/tabFocus", "vs/editor/browser/services/markerDecorations", "vs/css!./media/editor"], function (require, exports, nls, dom, errors_1, event_1, hash_1, lifecycle_1, network_1, editorConfiguration_1, editorExtensions_1, codeEditorService_1, view_1, viewUserInputEvents_1, editorOptions_1, cursorColumns_1, position_1, range_1, selection_1, editorAction_1, editorCommon, editorContextKeys_1, textModel_1, editorColorRegistry_1, colorRegistry_1, viewModelImpl_1, commands_1, contextkey_1, instantiation_1, serviceCollection_1, notification_1, themeService_1, accessibility_1, monospaceLineBreaksComputer_1, domLineBreaksComputer_1, cursorWordOperations_1, languageConfigurationRegistry_1, domFontInfo_1, languageFeatures_1, codeEditorContributions_1, tabFocus_1) {
    "use strict";
    var CodeEditorWidget_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditorModeContext = exports.BooleanEventEmitter = exports.CodeEditorWidget = void 0;
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
            (0, lifecycle_1.dispose)(this.listenersToRemove);
            this.model.onBeforeDetached(this.attachedView);
            if (this.hasRealView) {
                this.view.dispose();
            }
            this.viewModel.dispose();
        }
    }
    let CodeEditorWidget = class CodeEditorWidget extends lifecycle_1.Disposable {
        static { CodeEditorWidget_1 = this; }
        static { this.dropIntoEditorDecorationOptions = textModel_1.ModelDecorationOptions.register({
            description: 'workbench-dnd-target',
            className: 'dnd-target'
        }); }
        //#endregion
        get isSimpleWidget() {
            return this._configuration.isSimpleWidget;
        }
        constructor(domElement, _options, codeEditorWidgetOptions, instantiationService, codeEditorService, commandService, contextKeyService, themeService, notificationService, accessibilityService, languageConfigurationService, languageFeaturesService) {
            super();
            this.languageConfigurationService = languageConfigurationService;
            //#region Eventing
            this._deliveryQueue = (0, event_1.createEventDeliveryQueue)();
            this._contributions = this._register(new codeEditorContributions_1.CodeEditorContributions());
            this._onDidDispose = this._register(new event_1.Emitter());
            this.onDidDispose = this._onDidDispose.event;
            this._onDidChangeModelContent = this._register(new event_1.Emitter({ deliveryQueue: this._deliveryQueue }));
            this.onDidChangeModelContent = this._onDidChangeModelContent.event;
            this._onDidChangeModelLanguage = this._register(new event_1.Emitter({ deliveryQueue: this._deliveryQueue }));
            this.onDidChangeModelLanguage = this._onDidChangeModelLanguage.event;
            this._onDidChangeModelLanguageConfiguration = this._register(new event_1.Emitter({ deliveryQueue: this._deliveryQueue }));
            this.onDidChangeModelLanguageConfiguration = this._onDidChangeModelLanguageConfiguration.event;
            this._onDidChangeModelOptions = this._register(new event_1.Emitter({ deliveryQueue: this._deliveryQueue }));
            this.onDidChangeModelOptions = this._onDidChangeModelOptions.event;
            this._onDidChangeModelDecorations = this._register(new event_1.Emitter({ deliveryQueue: this._deliveryQueue }));
            this.onDidChangeModelDecorations = this._onDidChangeModelDecorations.event;
            this._onDidChangeModelTokens = this._register(new event_1.Emitter({ deliveryQueue: this._deliveryQueue }));
            this.onDidChangeModelTokens = this._onDidChangeModelTokens.event;
            this._onDidChangeConfiguration = this._register(new event_1.Emitter({ deliveryQueue: this._deliveryQueue }));
            this.onDidChangeConfiguration = this._onDidChangeConfiguration.event;
            this._onDidChangeModel = this._register(new event_1.Emitter({ deliveryQueue: this._deliveryQueue }));
            this.onDidChangeModel = this._onDidChangeModel.event;
            this._onDidChangeCursorPosition = this._register(new event_1.Emitter({ deliveryQueue: this._deliveryQueue }));
            this.onDidChangeCursorPosition = this._onDidChangeCursorPosition.event;
            this._onDidChangeCursorSelection = this._register(new event_1.Emitter({ deliveryQueue: this._deliveryQueue }));
            this.onDidChangeCursorSelection = this._onDidChangeCursorSelection.event;
            this._onDidAttemptReadOnlyEdit = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
            this.onDidAttemptReadOnlyEdit = this._onDidAttemptReadOnlyEdit.event;
            this._onDidLayoutChange = this._register(new event_1.Emitter({ deliveryQueue: this._deliveryQueue }));
            this.onDidLayoutChange = this._onDidLayoutChange.event;
            this._editorTextFocus = this._register(new BooleanEventEmitter({ deliveryQueue: this._deliveryQueue }));
            this.onDidFocusEditorText = this._editorTextFocus.onDidChangeToTrue;
            this.onDidBlurEditorText = this._editorTextFocus.onDidChangeToFalse;
            this._editorWidgetFocus = this._register(new BooleanEventEmitter({ deliveryQueue: this._deliveryQueue }));
            this.onDidFocusEditorWidget = this._editorWidgetFocus.onDidChangeToTrue;
            this.onDidBlurEditorWidget = this._editorWidgetFocus.onDidChangeToFalse;
            this._onWillType = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
            this.onWillType = this._onWillType.event;
            this._onDidType = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
            this.onDidType = this._onDidType.event;
            this._onDidCompositionStart = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
            this.onDidCompositionStart = this._onDidCompositionStart.event;
            this._onDidCompositionEnd = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
            this.onDidCompositionEnd = this._onDidCompositionEnd.event;
            this._onDidPaste = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
            this.onDidPaste = this._onDidPaste.event;
            this._onMouseUp = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
            this.onMouseUp = this._onMouseUp.event;
            this._onMouseDown = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
            this.onMouseDown = this._onMouseDown.event;
            this._onMouseDrag = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
            this.onMouseDrag = this._onMouseDrag.event;
            this._onMouseDrop = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
            this.onMouseDrop = this._onMouseDrop.event;
            this._onMouseDropCanceled = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
            this.onMouseDropCanceled = this._onMouseDropCanceled.event;
            this._onDropIntoEditor = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
            this.onDropIntoEditor = this._onDropIntoEditor.event;
            this._onContextMenu = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
            this.onContextMenu = this._onContextMenu.event;
            this._onMouseMove = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
            this.onMouseMove = this._onMouseMove.event;
            this._onMouseLeave = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
            this.onMouseLeave = this._onMouseLeave.event;
            this._onMouseWheel = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
            this.onMouseWheel = this._onMouseWheel.event;
            this._onKeyUp = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
            this.onKeyUp = this._onKeyUp.event;
            this._onKeyDown = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
            this.onKeyDown = this._onKeyDown.event;
            this._onDidContentSizeChange = this._register(new event_1.Emitter({ deliveryQueue: this._deliveryQueue }));
            this.onDidContentSizeChange = this._onDidContentSizeChange.event;
            this._onDidScrollChange = this._register(new event_1.Emitter({ deliveryQueue: this._deliveryQueue }));
            this.onDidScrollChange = this._onDidScrollChange.event;
            this._onDidChangeViewZones = this._register(new event_1.Emitter({ deliveryQueue: this._deliveryQueue }));
            this.onDidChangeViewZones = this._onDidChangeViewZones.event;
            this._onDidChangeHiddenAreas = this._register(new event_1.Emitter({ deliveryQueue: this._deliveryQueue }));
            this.onDidChangeHiddenAreas = this._onDidChangeHiddenAreas.event;
            this._actions = new Map();
            this._bannerDomNode = null;
            this._dropIntoEditorDecorations = this.createDecorationsCollection();
            codeEditorService.willCreateCodeEditor();
            const options = { ..._options };
            this._domElement = domElement;
            this._overflowWidgetsDomNode = options.overflowWidgetsDomNode;
            delete options.overflowWidgetsDomNode;
            this._id = (++EDITOR_ID);
            this._decorationTypeKeysToIds = {};
            this._decorationTypeSubtypes = {};
            this._telemetryData = codeEditorWidgetOptions.telemetryData;
            this._configuration = this._register(this._createConfiguration(codeEditorWidgetOptions.isSimpleWidget || false, options, accessibilityService));
            this._register(this._configuration.onDidChange((e) => {
                this._onDidChangeConfiguration.fire(e);
                const options = this._configuration.options;
                if (e.hasChanged(143 /* EditorOption.layoutInfo */)) {
                    const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
                    this._onDidLayoutChange.fire(layoutInfo);
                }
            }));
            this._contextKeyService = this._register(contextKeyService.createScoped(this._domElement));
            this._notificationService = notificationService;
            this._codeEditorService = codeEditorService;
            this._commandService = commandService;
            this._themeService = themeService;
            this._register(new EditorContextKeysManager(this, this._contextKeyService));
            this._register(new EditorModeContext(this, this._contextKeyService, languageFeaturesService));
            this._instantiationService = instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, this._contextKeyService]));
            this._modelData = null;
            this._focusTracker = new CodeEditorWidgetFocusTracker(domElement);
            this._register(this._focusTracker.onChange(() => {
                this._editorWidgetFocus.setValue(this._focusTracker.hasFocus());
            }));
            this._contentWidgets = {};
            this._overlayWidgets = {};
            this._glyphMarginWidgets = {};
            let contributions;
            if (Array.isArray(codeEditorWidgetOptions.contributions)) {
                contributions = codeEditorWidgetOptions.contributions;
            }
            else {
                contributions = editorExtensions_1.EditorExtensionsRegistry.getEditorContributions();
            }
            this._contributions.initialize(this, contributions, this._instantiationService);
            for (const action of editorExtensions_1.EditorExtensionsRegistry.getEditorActions()) {
                if (this._actions.has(action.id)) {
                    (0, errors_1.onUnexpectedError)(new Error(`Cannot have two actions with the same id ${action.id}`));
                    continue;
                }
                const internalAction = new editorAction_1.InternalEditorAction(action.id, action.label, action.alias, action.precondition ?? undefined, () => {
                    return this._instantiationService.invokeFunction((accessor) => {
                        return Promise.resolve(action.runEditorCommand(accessor, this, null));
                    });
                }, this._contextKeyService);
                this._actions.set(internalAction.id, internalAction);
            }
            const isDropIntoEnabled = () => {
                return !this._configuration.options.get(90 /* EditorOption.readOnly */)
                    && this._configuration.options.get(36 /* EditorOption.dropIntoEditor */).enabled;
            };
            this._register(new dom.DragAndDropObserver(this._domElement, {
                onDragEnter: () => undefined,
                onDragOver: e => {
                    if (!isDropIntoEnabled()) {
                        return;
                    }
                    const target = this.getTargetAtClientPoint(e.clientX, e.clientY);
                    if (target?.position) {
                        this.showDropIndicatorAt(target.position);
                    }
                },
                onDrop: async (e) => {
                    if (!isDropIntoEnabled()) {
                        return;
                    }
                    this.removeDropIndicator();
                    if (!e.dataTransfer) {
                        return;
                    }
                    const target = this.getTargetAtClientPoint(e.clientX, e.clientY);
                    if (target?.position) {
                        this._onDropIntoEditor.fire({ position: target.position, event: e });
                    }
                },
                onDragLeave: () => {
                    this.removeDropIndicator();
                },
                onDragEnd: () => {
                    this.removeDropIndicator();
                },
            }));
            this._codeEditorService.addCodeEditor(this);
        }
        writeScreenReaderContent(reason) {
            this._modelData?.view.writeScreenReaderContent(reason);
        }
        _createConfiguration(isSimpleWidget, options, accessibilityService) {
            return new editorConfiguration_1.EditorConfiguration(isSimpleWidget, options, this._domElement, accessibilityService);
        }
        getId() {
            return this.getEditorType() + ':' + this._id;
        }
        getEditorType() {
            return editorCommon.EditorType.ICodeEditor;
        }
        dispose() {
            this._codeEditorService.removeCodeEditor(this);
            this._focusTracker.dispose();
            this._actions.clear();
            this._contentWidgets = {};
            this._overlayWidgets = {};
            this._removeDecorationTypes();
            this._postDetachModelCleanup(this._detachModel());
            this._onDidDispose.fire();
            super.dispose();
        }
        invokeWithinContext(fn) {
            return this._instantiationService.invokeFunction(fn);
        }
        updateOptions(newOptions) {
            this._configuration.updateOptions(newOptions || {});
        }
        getOptions() {
            return this._configuration.options;
        }
        getOption(id) {
            return this._configuration.options.get(id);
        }
        getRawOptions() {
            return this._configuration.getRawOptions();
        }
        getOverflowWidgetsDomNode() {
            return this._overflowWidgetsDomNode;
        }
        getConfiguredWordAtPosition(position) {
            if (!this._modelData) {
                return null;
            }
            return cursorWordOperations_1.WordOperations.getWordAtPosition(this._modelData.model, this._configuration.options.get(129 /* EditorOption.wordSeparators */), position);
        }
        getValue(options = null) {
            if (!this._modelData) {
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
            return this._modelData.model.getValue(eolPreference, preserveBOM);
        }
        setValue(newValue) {
            if (!this._modelData) {
                return;
            }
            this._modelData.model.setValue(newValue);
        }
        getModel() {
            if (!this._modelData) {
                return null;
            }
            return this._modelData.model;
        }
        setModel(_model = null) {
            const model = _model;
            if (this._modelData === null && model === null) {
                // Current model is the new model
                return;
            }
            if (this._modelData && this._modelData.model === model) {
                // Current model is the new model
                return;
            }
            const hasTextFocus = this.hasTextFocus();
            const detachedModel = this._detachModel();
            this._attachModel(model);
            if (hasTextFocus && this.hasModel()) {
                this.focus();
            }
            const e = {
                oldModelUrl: detachedModel ? detachedModel.uri : null,
                newModelUrl: model ? model.uri : null
            };
            this._removeDecorationTypes();
            this._onDidChangeModel.fire(e);
            this._postDetachModelCleanup(detachedModel);
            this._contributions.onAfterModelAttached();
        }
        _removeDecorationTypes() {
            this._decorationTypeKeysToIds = {};
            if (this._decorationTypeSubtypes) {
                for (const decorationType in this._decorationTypeSubtypes) {
                    const subTypes = this._decorationTypeSubtypes[decorationType];
                    for (const subType in subTypes) {
                        this._removeDecorationType(decorationType + '-' + subType);
                    }
                }
                this._decorationTypeSubtypes = {};
            }
        }
        getVisibleRanges() {
            if (!this._modelData) {
                return [];
            }
            return this._modelData.viewModel.getVisibleRanges();
        }
        getVisibleRangesPlusViewportAboveBelow() {
            if (!this._modelData) {
                return [];
            }
            return this._modelData.viewModel.getVisibleRangesPlusViewportAboveBelow();
        }
        getWhitespaces() {
            if (!this._modelData) {
                return [];
            }
            return this._modelData.viewModel.viewLayout.getWhitespaces();
        }
        static _getVerticalOffsetAfterPosition(modelData, modelLineNumber, modelColumn, includeViewZones) {
            const modelPosition = modelData.model.validatePosition({
                lineNumber: modelLineNumber,
                column: modelColumn
            });
            const viewPosition = modelData.viewModel.coordinatesConverter.convertModelPositionToViewPosition(modelPosition);
            return modelData.viewModel.viewLayout.getVerticalOffsetAfterLineNumber(viewPosition.lineNumber, includeViewZones);
        }
        getTopForLineNumber(lineNumber, includeViewZones = false) {
            if (!this._modelData) {
                return -1;
            }
            return CodeEditorWidget_1._getVerticalOffsetForPosition(this._modelData, lineNumber, 1, includeViewZones);
        }
        getTopForPosition(lineNumber, column) {
            if (!this._modelData) {
                return -1;
            }
            return CodeEditorWidget_1._getVerticalOffsetForPosition(this._modelData, lineNumber, column, false);
        }
        static _getVerticalOffsetForPosition(modelData, modelLineNumber, modelColumn, includeViewZones = false) {
            const modelPosition = modelData.model.validatePosition({
                lineNumber: modelLineNumber,
                column: modelColumn
            });
            const viewPosition = modelData.viewModel.coordinatesConverter.convertModelPositionToViewPosition(modelPosition);
            return modelData.viewModel.viewLayout.getVerticalOffsetForLineNumber(viewPosition.lineNumber, includeViewZones);
        }
        getBottomForLineNumber(lineNumber, includeViewZones = false) {
            if (!this._modelData) {
                return -1;
            }
            return CodeEditorWidget_1._getVerticalOffsetAfterPosition(this._modelData, lineNumber, 1, includeViewZones);
        }
        setHiddenAreas(ranges, source) {
            this._modelData?.viewModel.setHiddenAreas(ranges.map(r => range_1.Range.lift(r)), source);
        }
        getVisibleColumnFromPosition(rawPosition) {
            if (!this._modelData) {
                return rawPosition.column;
            }
            const position = this._modelData.model.validatePosition(rawPosition);
            const tabSize = this._modelData.model.getOptions().tabSize;
            return cursorColumns_1.CursorColumns.visibleColumnFromColumn(this._modelData.model.getLineContent(position.lineNumber), position.column, tabSize) + 1;
        }
        getStatusbarColumn(rawPosition) {
            if (!this._modelData) {
                return rawPosition.column;
            }
            const position = this._modelData.model.validatePosition(rawPosition);
            const tabSize = this._modelData.model.getOptions().tabSize;
            return cursorColumns_1.CursorColumns.toStatusbarColumn(this._modelData.model.getLineContent(position.lineNumber), position.column, tabSize);
        }
        getPosition() {
            if (!this._modelData) {
                return null;
            }
            return this._modelData.viewModel.getPosition();
        }
        setPosition(position, source = 'api') {
            if (!this._modelData) {
                return;
            }
            if (!position_1.Position.isIPosition(position)) {
                throw new Error('Invalid arguments');
            }
            this._modelData.viewModel.setSelections(source, [{
                    selectionStartLineNumber: position.lineNumber,
                    selectionStartColumn: position.column,
                    positionLineNumber: position.lineNumber,
                    positionColumn: position.column
                }]);
        }
        _sendRevealRange(modelRange, verticalType, revealHorizontal, scrollType) {
            if (!this._modelData) {
                return;
            }
            if (!range_1.Range.isIRange(modelRange)) {
                throw new Error('Invalid arguments');
            }
            const validatedModelRange = this._modelData.model.validateRange(modelRange);
            const viewRange = this._modelData.viewModel.coordinatesConverter.convertModelRangeToViewRange(validatedModelRange);
            this._modelData.viewModel.revealRange('api', revealHorizontal, viewRange, verticalType, scrollType);
        }
        revealLine(lineNumber, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this._revealLine(lineNumber, 0 /* VerticalRevealType.Simple */, scrollType);
        }
        revealLineInCenter(lineNumber, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this._revealLine(lineNumber, 1 /* VerticalRevealType.Center */, scrollType);
        }
        revealLineInCenterIfOutsideViewport(lineNumber, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this._revealLine(lineNumber, 2 /* VerticalRevealType.CenterIfOutsideViewport */, scrollType);
        }
        revealLineNearTop(lineNumber, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this._revealLine(lineNumber, 5 /* VerticalRevealType.NearTop */, scrollType);
        }
        _revealLine(lineNumber, revealType, scrollType) {
            if (typeof lineNumber !== 'number') {
                throw new Error('Invalid arguments');
            }
            this._sendRevealRange(new range_1.Range(lineNumber, 1, lineNumber, 1), revealType, false, scrollType);
        }
        revealPosition(position, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this._revealPosition(position, 0 /* VerticalRevealType.Simple */, true, scrollType);
        }
        revealPositionInCenter(position, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this._revealPosition(position, 1 /* VerticalRevealType.Center */, true, scrollType);
        }
        revealPositionInCenterIfOutsideViewport(position, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this._revealPosition(position, 2 /* VerticalRevealType.CenterIfOutsideViewport */, true, scrollType);
        }
        revealPositionNearTop(position, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this._revealPosition(position, 5 /* VerticalRevealType.NearTop */, true, scrollType);
        }
        _revealPosition(position, verticalType, revealHorizontal, scrollType) {
            if (!position_1.Position.isIPosition(position)) {
                throw new Error('Invalid arguments');
            }
            this._sendRevealRange(new range_1.Range(position.lineNumber, position.column, position.lineNumber, position.column), verticalType, revealHorizontal, scrollType);
        }
        getSelection() {
            if (!this._modelData) {
                return null;
            }
            return this._modelData.viewModel.getSelection();
        }
        getSelections() {
            if (!this._modelData) {
                return null;
            }
            return this._modelData.viewModel.getSelections();
        }
        setSelection(something, source = 'api') {
            const isSelection = selection_1.Selection.isISelection(something);
            const isRange = range_1.Range.isIRange(something);
            if (!isSelection && !isRange) {
                throw new Error('Invalid arguments');
            }
            if (isSelection) {
                this._setSelectionImpl(something, source);
            }
            else if (isRange) {
                // act as if it was an IRange
                const selection = {
                    selectionStartLineNumber: something.startLineNumber,
                    selectionStartColumn: something.startColumn,
                    positionLineNumber: something.endLineNumber,
                    positionColumn: something.endColumn
                };
                this._setSelectionImpl(selection, source);
            }
        }
        _setSelectionImpl(sel, source) {
            if (!this._modelData) {
                return;
            }
            const selection = new selection_1.Selection(sel.selectionStartLineNumber, sel.selectionStartColumn, sel.positionLineNumber, sel.positionColumn);
            this._modelData.viewModel.setSelections(source, [selection]);
        }
        revealLines(startLineNumber, endLineNumber, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this._revealLines(startLineNumber, endLineNumber, 0 /* VerticalRevealType.Simple */, scrollType);
        }
        revealLinesInCenter(startLineNumber, endLineNumber, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this._revealLines(startLineNumber, endLineNumber, 1 /* VerticalRevealType.Center */, scrollType);
        }
        revealLinesInCenterIfOutsideViewport(startLineNumber, endLineNumber, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this._revealLines(startLineNumber, endLineNumber, 2 /* VerticalRevealType.CenterIfOutsideViewport */, scrollType);
        }
        revealLinesNearTop(startLineNumber, endLineNumber, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this._revealLines(startLineNumber, endLineNumber, 5 /* VerticalRevealType.NearTop */, scrollType);
        }
        _revealLines(startLineNumber, endLineNumber, verticalType, scrollType) {
            if (typeof startLineNumber !== 'number' || typeof endLineNumber !== 'number') {
                throw new Error('Invalid arguments');
            }
            this._sendRevealRange(new range_1.Range(startLineNumber, 1, endLineNumber, 1), verticalType, false, scrollType);
        }
        revealRange(range, scrollType = 0 /* editorCommon.ScrollType.Smooth */, revealVerticalInCenter = false, revealHorizontal = true) {
            this._revealRange(range, revealVerticalInCenter ? 1 /* VerticalRevealType.Center */ : 0 /* VerticalRevealType.Simple */, revealHorizontal, scrollType);
        }
        revealRangeInCenter(range, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this._revealRange(range, 1 /* VerticalRevealType.Center */, true, scrollType);
        }
        revealRangeInCenterIfOutsideViewport(range, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this._revealRange(range, 2 /* VerticalRevealType.CenterIfOutsideViewport */, true, scrollType);
        }
        revealRangeNearTop(range, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this._revealRange(range, 5 /* VerticalRevealType.NearTop */, true, scrollType);
        }
        revealRangeNearTopIfOutsideViewport(range, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this._revealRange(range, 6 /* VerticalRevealType.NearTopIfOutsideViewport */, true, scrollType);
        }
        revealRangeAtTop(range, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this._revealRange(range, 3 /* VerticalRevealType.Top */, true, scrollType);
        }
        _revealRange(range, verticalType, revealHorizontal, scrollType) {
            if (!range_1.Range.isIRange(range)) {
                throw new Error('Invalid arguments');
            }
            this._sendRevealRange(range_1.Range.lift(range), verticalType, revealHorizontal, scrollType);
        }
        setSelections(ranges, source = 'api', reason = 0 /* CursorChangeReason.NotSet */) {
            if (!this._modelData) {
                return;
            }
            if (!ranges || ranges.length === 0) {
                throw new Error('Invalid arguments');
            }
            for (let i = 0, len = ranges.length; i < len; i++) {
                if (!selection_1.Selection.isISelection(ranges[i])) {
                    throw new Error('Invalid arguments');
                }
            }
            this._modelData.viewModel.setSelections(source, ranges, reason);
        }
        getContentWidth() {
            if (!this._modelData) {
                return -1;
            }
            return this._modelData.viewModel.viewLayout.getContentWidth();
        }
        getScrollWidth() {
            if (!this._modelData) {
                return -1;
            }
            return this._modelData.viewModel.viewLayout.getScrollWidth();
        }
        getScrollLeft() {
            if (!this._modelData) {
                return -1;
            }
            return this._modelData.viewModel.viewLayout.getCurrentScrollLeft();
        }
        getContentHeight() {
            if (!this._modelData) {
                return -1;
            }
            return this._modelData.viewModel.viewLayout.getContentHeight();
        }
        getScrollHeight() {
            if (!this._modelData) {
                return -1;
            }
            return this._modelData.viewModel.viewLayout.getScrollHeight();
        }
        getScrollTop() {
            if (!this._modelData) {
                return -1;
            }
            return this._modelData.viewModel.viewLayout.getCurrentScrollTop();
        }
        setScrollLeft(newScrollLeft, scrollType = 1 /* editorCommon.ScrollType.Immediate */) {
            if (!this._modelData) {
                return;
            }
            if (typeof newScrollLeft !== 'number') {
                throw new Error('Invalid arguments');
            }
            this._modelData.viewModel.viewLayout.setScrollPosition({
                scrollLeft: newScrollLeft
            }, scrollType);
        }
        setScrollTop(newScrollTop, scrollType = 1 /* editorCommon.ScrollType.Immediate */) {
            if (!this._modelData) {
                return;
            }
            if (typeof newScrollTop !== 'number') {
                throw new Error('Invalid arguments');
            }
            this._modelData.viewModel.viewLayout.setScrollPosition({
                scrollTop: newScrollTop
            }, scrollType);
        }
        setScrollPosition(position, scrollType = 1 /* editorCommon.ScrollType.Immediate */) {
            if (!this._modelData) {
                return;
            }
            this._modelData.viewModel.viewLayout.setScrollPosition(position, scrollType);
        }
        hasPendingScrollAnimation() {
            if (!this._modelData) {
                return false;
            }
            return this._modelData.viewModel.viewLayout.hasPendingScrollAnimation();
        }
        saveViewState() {
            if (!this._modelData) {
                return null;
            }
            const contributionsState = this._contributions.saveViewState();
            const cursorState = this._modelData.viewModel.saveCursorState();
            const viewState = this._modelData.viewModel.saveState();
            return {
                cursorState: cursorState,
                viewState: viewState,
                contributionsState: contributionsState
            };
        }
        restoreViewState(s) {
            if (!this._modelData || !this._modelData.hasRealView) {
                return;
            }
            const codeEditorState = s;
            if (codeEditorState && codeEditorState.cursorState && codeEditorState.viewState) {
                const cursorState = codeEditorState.cursorState;
                if (Array.isArray(cursorState)) {
                    if (cursorState.length > 0) {
                        this._modelData.viewModel.restoreCursorState(cursorState);
                    }
                }
                else {
                    // Backwards compatibility
                    this._modelData.viewModel.restoreCursorState([cursorState]);
                }
                this._contributions.restoreViewState(codeEditorState.contributionsState || {});
                const reducedState = this._modelData.viewModel.reduceRestoreState(codeEditorState.viewState);
                this._modelData.view.restoreState(reducedState);
            }
        }
        handleInitialized() {
            this._getViewModel()?.visibleLinesStabilized();
        }
        onVisible() {
            this._modelData?.view.refreshFocusState();
        }
        onHide() {
            this._modelData?.view.refreshFocusState();
            this._focusTracker.refreshState();
        }
        getContribution(id) {
            return this._contributions.get(id);
        }
        getActions() {
            return Array.from(this._actions.values());
        }
        getSupportedActions() {
            let result = this.getActions();
            result = result.filter(action => action.isSupported());
            return result;
        }
        getAction(id) {
            return this._actions.get(id) || null;
        }
        trigger(source, handlerId, payload) {
            payload = payload || {};
            switch (handlerId) {
                case "compositionStart" /* editorCommon.Handler.CompositionStart */:
                    this._startComposition();
                    return;
                case "compositionEnd" /* editorCommon.Handler.CompositionEnd */:
                    this._endComposition(source);
                    return;
                case "type" /* editorCommon.Handler.Type */: {
                    const args = payload;
                    this._type(source, args.text || '');
                    return;
                }
                case "replacePreviousChar" /* editorCommon.Handler.ReplacePreviousChar */: {
                    const args = payload;
                    this._compositionType(source, args.text || '', args.replaceCharCnt || 0, 0, 0);
                    return;
                }
                case "compositionType" /* editorCommon.Handler.CompositionType */: {
                    const args = payload;
                    this._compositionType(source, args.text || '', args.replacePrevCharCnt || 0, args.replaceNextCharCnt || 0, args.positionDelta || 0);
                    return;
                }
                case "paste" /* editorCommon.Handler.Paste */: {
                    const args = payload;
                    this._paste(source, args.text || '', args.pasteOnNewLine || false, args.multicursorText || null, args.mode || null);
                    return;
                }
                case "cut" /* editorCommon.Handler.Cut */:
                    this._cut(source);
                    return;
            }
            const action = this.getAction(handlerId);
            if (action) {
                Promise.resolve(action.run(payload)).then(undefined, errors_1.onUnexpectedError);
                return;
            }
            if (!this._modelData) {
                return;
            }
            if (this._triggerEditorCommand(source, handlerId, payload)) {
                return;
            }
            this._triggerCommand(handlerId, payload);
        }
        _triggerCommand(handlerId, payload) {
            this._commandService.executeCommand(handlerId, payload);
        }
        _startComposition() {
            if (!this._modelData) {
                return;
            }
            this._modelData.viewModel.startComposition();
            this._onDidCompositionStart.fire();
        }
        _endComposition(source) {
            if (!this._modelData) {
                return;
            }
            this._modelData.viewModel.endComposition(source);
            this._onDidCompositionEnd.fire();
        }
        _type(source, text) {
            if (!this._modelData || text.length === 0) {
                return;
            }
            if (source === 'keyboard') {
                this._onWillType.fire(text);
            }
            this._modelData.viewModel.type(text, source);
            if (source === 'keyboard') {
                this._onDidType.fire(text);
            }
        }
        _compositionType(source, text, replacePrevCharCnt, replaceNextCharCnt, positionDelta) {
            if (!this._modelData) {
                return;
            }
            this._modelData.viewModel.compositionType(text, replacePrevCharCnt, replaceNextCharCnt, positionDelta, source);
        }
        _paste(source, text, pasteOnNewLine, multicursorText, mode) {
            if (!this._modelData || text.length === 0) {
                return;
            }
            const viewModel = this._modelData.viewModel;
            const startPosition = viewModel.getSelection().getStartPosition();
            viewModel.paste(text, pasteOnNewLine, multicursorText, source);
            const endPosition = viewModel.getSelection().getStartPosition();
            if (source === 'keyboard') {
                this._onDidPaste.fire({
                    range: new range_1.Range(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column),
                    languageId: mode
                });
            }
        }
        _cut(source) {
            if (!this._modelData) {
                return;
            }
            this._modelData.viewModel.cut(source);
        }
        _triggerEditorCommand(source, handlerId, payload) {
            const command = editorExtensions_1.EditorExtensionsRegistry.getEditorCommand(handlerId);
            if (command) {
                payload = payload || {};
                payload.source = source;
                this._instantiationService.invokeFunction((accessor) => {
                    Promise.resolve(command.runEditorCommand(accessor, this, payload)).then(undefined, errors_1.onUnexpectedError);
                });
                return true;
            }
            return false;
        }
        _getViewModel() {
            if (!this._modelData) {
                return null;
            }
            return this._modelData.viewModel;
        }
        pushUndoStop() {
            if (!this._modelData) {
                return false;
            }
            if (this._configuration.options.get(90 /* EditorOption.readOnly */)) {
                // read only editor => sorry!
                return false;
            }
            this._modelData.model.pushStackElement();
            return true;
        }
        popUndoStop() {
            if (!this._modelData) {
                return false;
            }
            if (this._configuration.options.get(90 /* EditorOption.readOnly */)) {
                // read only editor => sorry!
                return false;
            }
            this._modelData.model.popStackElement();
            return true;
        }
        executeEdits(source, edits, endCursorState) {
            if (!this._modelData) {
                return false;
            }
            if (this._configuration.options.get(90 /* EditorOption.readOnly */)) {
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
            this._modelData.viewModel.executeEdits(source, edits, cursorStateComputer);
            return true;
        }
        executeCommand(source, command) {
            if (!this._modelData) {
                return;
            }
            this._modelData.viewModel.executeCommand(command, source);
        }
        executeCommands(source, commands) {
            if (!this._modelData) {
                return;
            }
            this._modelData.viewModel.executeCommands(commands, source);
        }
        createDecorationsCollection(decorations) {
            return new EditorDecorationsCollection(this, decorations);
        }
        changeDecorations(callback) {
            if (!this._modelData) {
                // callback will not be called
                return null;
            }
            return this._modelData.model.changeDecorations(callback, this._id);
        }
        getLineDecorations(lineNumber) {
            if (!this._modelData) {
                return null;
            }
            return this._modelData.model.getLineDecorations(lineNumber, this._id, (0, editorOptions_1.filterValidationDecorations)(this._configuration.options));
        }
        getDecorationsInRange(range) {
            if (!this._modelData) {
                return null;
            }
            return this._modelData.model.getDecorationsInRange(range, this._id, (0, editorOptions_1.filterValidationDecorations)(this._configuration.options));
        }
        /**
         * @deprecated
         */
        deltaDecorations(oldDecorations, newDecorations) {
            if (!this._modelData) {
                return [];
            }
            if (oldDecorations.length === 0 && newDecorations.length === 0) {
                return oldDecorations;
            }
            return this._modelData.model.deltaDecorations(oldDecorations, newDecorations, this._id);
        }
        removeDecorations(decorationIds) {
            if (!this._modelData || decorationIds.length === 0) {
                return;
            }
            this._modelData.model.changeDecorations((changeAccessor) => {
                changeAccessor.deltaDecorations(decorationIds, []);
            });
        }
        setDecorationsByType(description, decorationTypeKey, decorationOptions) {
            const newDecorationsSubTypes = {};
            const oldDecorationsSubTypes = this._decorationTypeSubtypes[decorationTypeKey] || {};
            this._decorationTypeSubtypes[decorationTypeKey] = newDecorationsSubTypes;
            const newModelDecorations = [];
            for (const decorationOption of decorationOptions) {
                let typeKey = decorationTypeKey;
                if (decorationOption.renderOptions) {
                    // identify custom render options by a hash code over all keys and values
                    // For custom render options register a decoration type if necessary
                    const subType = (0, hash_1.hash)(decorationOption.renderOptions).toString(16);
                    // The fact that `decorationTypeKey` appears in the typeKey has no influence
                    // it is just a mechanism to get predictable and unique keys (repeatable for the same options and unique across clients)
                    typeKey = decorationTypeKey + '-' + subType;
                    if (!oldDecorationsSubTypes[subType] && !newDecorationsSubTypes[subType]) {
                        // decoration type did not exist before, register new one
                        this._registerDecorationType(description, typeKey, decorationOption.renderOptions, decorationTypeKey);
                    }
                    newDecorationsSubTypes[subType] = true;
                }
                const opts = this._resolveDecorationOptions(typeKey, !!decorationOption.hoverMessage);
                if (decorationOption.hoverMessage) {
                    opts.hoverMessage = decorationOption.hoverMessage;
                }
                newModelDecorations.push({ range: decorationOption.range, options: opts });
            }
            // remove decoration sub types that are no longer used, deregister decoration type if necessary
            for (const subType in oldDecorationsSubTypes) {
                if (!newDecorationsSubTypes[subType]) {
                    this._removeDecorationType(decorationTypeKey + '-' + subType);
                }
            }
            // update all decorations
            const oldDecorationsIds = this._decorationTypeKeysToIds[decorationTypeKey] || [];
            this._decorationTypeKeysToIds[decorationTypeKey] = this.deltaDecorations(oldDecorationsIds, newModelDecorations);
        }
        setDecorationsByTypeFast(decorationTypeKey, ranges) {
            // remove decoration sub types that are no longer used, deregister decoration type if necessary
            const oldDecorationsSubTypes = this._decorationTypeSubtypes[decorationTypeKey] || {};
            for (const subType in oldDecorationsSubTypes) {
                this._removeDecorationType(decorationTypeKey + '-' + subType);
            }
            this._decorationTypeSubtypes[decorationTypeKey] = {};
            const opts = textModel_1.ModelDecorationOptions.createDynamic(this._resolveDecorationOptions(decorationTypeKey, false));
            const newModelDecorations = new Array(ranges.length);
            for (let i = 0, len = ranges.length; i < len; i++) {
                newModelDecorations[i] = { range: ranges[i], options: opts };
            }
            // update all decorations
            const oldDecorationsIds = this._decorationTypeKeysToIds[decorationTypeKey] || [];
            this._decorationTypeKeysToIds[decorationTypeKey] = this.deltaDecorations(oldDecorationsIds, newModelDecorations);
        }
        removeDecorationsByType(decorationTypeKey) {
            // remove decorations for type and sub type
            const oldDecorationsIds = this._decorationTypeKeysToIds[decorationTypeKey];
            if (oldDecorationsIds) {
                this.deltaDecorations(oldDecorationsIds, []);
            }
            if (this._decorationTypeKeysToIds.hasOwnProperty(decorationTypeKey)) {
                delete this._decorationTypeKeysToIds[decorationTypeKey];
            }
            if (this._decorationTypeSubtypes.hasOwnProperty(decorationTypeKey)) {
                delete this._decorationTypeSubtypes[decorationTypeKey];
            }
        }
        getLayoutInfo() {
            const options = this._configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            return layoutInfo;
        }
        createOverviewRuler(cssClassName) {
            if (!this._modelData || !this._modelData.hasRealView) {
                return null;
            }
            return this._modelData.view.createOverviewRuler(cssClassName);
        }
        getContainerDomNode() {
            return this._domElement;
        }
        getDomNode() {
            if (!this._modelData || !this._modelData.hasRealView) {
                return null;
            }
            return this._modelData.view.domNode.domNode;
        }
        delegateVerticalScrollbarPointerDown(browserEvent) {
            if (!this._modelData || !this._modelData.hasRealView) {
                return;
            }
            this._modelData.view.delegateVerticalScrollbarPointerDown(browserEvent);
        }
        delegateScrollFromMouseWheelEvent(browserEvent) {
            if (!this._modelData || !this._modelData.hasRealView) {
                return;
            }
            this._modelData.view.delegateScrollFromMouseWheelEvent(browserEvent);
        }
        layout(dimension) {
            this._configuration.observeContainer(dimension);
            this.render();
        }
        focus() {
            if (!this._modelData || !this._modelData.hasRealView) {
                return;
            }
            this._modelData.view.focus();
        }
        hasTextFocus() {
            if (!this._modelData || !this._modelData.hasRealView) {
                return false;
            }
            return this._modelData.view.isFocused();
        }
        hasWidgetFocus() {
            return this._focusTracker && this._focusTracker.hasFocus();
        }
        addContentWidget(widget) {
            const widgetData = {
                widget: widget,
                position: widget.getPosition()
            };
            if (this._contentWidgets.hasOwnProperty(widget.getId())) {
                console.warn('Overwriting a content widget with the same id.');
            }
            this._contentWidgets[widget.getId()] = widgetData;
            if (this._modelData && this._modelData.hasRealView) {
                this._modelData.view.addContentWidget(widgetData);
            }
        }
        layoutContentWidget(widget) {
            const widgetId = widget.getId();
            if (this._contentWidgets.hasOwnProperty(widgetId)) {
                const widgetData = this._contentWidgets[widgetId];
                widgetData.position = widget.getPosition();
                if (this._modelData && this._modelData.hasRealView) {
                    this._modelData.view.layoutContentWidget(widgetData);
                }
            }
        }
        removeContentWidget(widget) {
            const widgetId = widget.getId();
            if (this._contentWidgets.hasOwnProperty(widgetId)) {
                const widgetData = this._contentWidgets[widgetId];
                delete this._contentWidgets[widgetId];
                if (this._modelData && this._modelData.hasRealView) {
                    this._modelData.view.removeContentWidget(widgetData);
                }
            }
        }
        addOverlayWidget(widget) {
            const widgetData = {
                widget: widget,
                position: widget.getPosition()
            };
            if (this._overlayWidgets.hasOwnProperty(widget.getId())) {
                console.warn('Overwriting an overlay widget with the same id.');
            }
            this._overlayWidgets[widget.getId()] = widgetData;
            if (this._modelData && this._modelData.hasRealView) {
                this._modelData.view.addOverlayWidget(widgetData);
            }
        }
        layoutOverlayWidget(widget) {
            const widgetId = widget.getId();
            if (this._overlayWidgets.hasOwnProperty(widgetId)) {
                const widgetData = this._overlayWidgets[widgetId];
                widgetData.position = widget.getPosition();
                if (this._modelData && this._modelData.hasRealView) {
                    this._modelData.view.layoutOverlayWidget(widgetData);
                }
            }
        }
        removeOverlayWidget(widget) {
            const widgetId = widget.getId();
            if (this._overlayWidgets.hasOwnProperty(widgetId)) {
                const widgetData = this._overlayWidgets[widgetId];
                delete this._overlayWidgets[widgetId];
                if (this._modelData && this._modelData.hasRealView) {
                    this._modelData.view.removeOverlayWidget(widgetData);
                }
            }
        }
        addGlyphMarginWidget(widget) {
            const widgetData = {
                widget: widget,
                position: widget.getPosition()
            };
            if (this._glyphMarginWidgets.hasOwnProperty(widget.getId())) {
                console.warn('Overwriting a glyph margin widget with the same id.');
            }
            this._glyphMarginWidgets[widget.getId()] = widgetData;
            if (this._modelData && this._modelData.hasRealView) {
                this._modelData.view.addGlyphMarginWidget(widgetData);
            }
        }
        layoutGlyphMarginWidget(widget) {
            const widgetId = widget.getId();
            if (this._glyphMarginWidgets.hasOwnProperty(widgetId)) {
                const widgetData = this._glyphMarginWidgets[widgetId];
                widgetData.position = widget.getPosition();
                if (this._modelData && this._modelData.hasRealView) {
                    this._modelData.view.layoutGlyphMarginWidget(widgetData);
                }
            }
        }
        removeGlyphMarginWidget(widget) {
            const widgetId = widget.getId();
            if (this._glyphMarginWidgets.hasOwnProperty(widgetId)) {
                const widgetData = this._glyphMarginWidgets[widgetId];
                delete this._glyphMarginWidgets[widgetId];
                if (this._modelData && this._modelData.hasRealView) {
                    this._modelData.view.removeGlyphMarginWidget(widgetData);
                }
            }
        }
        changeViewZones(callback) {
            if (!this._modelData || !this._modelData.hasRealView) {
                return;
            }
            this._modelData.view.change(callback);
        }
        getTargetAtClientPoint(clientX, clientY) {
            if (!this._modelData || !this._modelData.hasRealView) {
                return null;
            }
            return this._modelData.view.getTargetAtClientPoint(clientX, clientY);
        }
        getScrolledVisiblePosition(rawPosition) {
            if (!this._modelData || !this._modelData.hasRealView) {
                return null;
            }
            const position = this._modelData.model.validatePosition(rawPosition);
            const options = this._configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            const top = CodeEditorWidget_1._getVerticalOffsetForPosition(this._modelData, position.lineNumber, position.column) - this.getScrollTop();
            const left = this._modelData.view.getOffsetForColumn(position.lineNumber, position.column) + layoutInfo.glyphMarginWidth + layoutInfo.lineNumbersWidth + layoutInfo.decorationsWidth - this.getScrollLeft();
            return {
                top: top,
                left: left,
                height: options.get(66 /* EditorOption.lineHeight */)
            };
        }
        getOffsetForColumn(lineNumber, column) {
            if (!this._modelData || !this._modelData.hasRealView) {
                return -1;
            }
            return this._modelData.view.getOffsetForColumn(lineNumber, column);
        }
        render(forceRedraw = false) {
            if (!this._modelData || !this._modelData.hasRealView) {
                return;
            }
            this._modelData.view.render(true, forceRedraw);
        }
        setAriaOptions(options) {
            if (!this._modelData || !this._modelData.hasRealView) {
                return;
            }
            this._modelData.view.setAriaOptions(options);
        }
        applyFontInfo(target) {
            (0, domFontInfo_1.applyFontInfo)(target, this._configuration.options.get(50 /* EditorOption.fontInfo */));
        }
        setBanner(domNode, domNodeHeight) {
            if (this._bannerDomNode && this._domElement.contains(this._bannerDomNode)) {
                this._domElement.removeChild(this._bannerDomNode);
            }
            this._bannerDomNode = domNode;
            this._configuration.setReservedHeight(domNode ? domNodeHeight : 0);
            if (this._bannerDomNode) {
                this._domElement.prepend(this._bannerDomNode);
            }
        }
        _attachModel(model) {
            if (!model) {
                this._modelData = null;
                return;
            }
            const listenersToRemove = [];
            this._domElement.setAttribute('data-mode-id', model.getLanguageId());
            this._configuration.setIsDominatedByLongLines(model.isDominatedByLongLines());
            this._configuration.setModelLineCount(model.getLineCount());
            const attachedView = model.onBeforeAttached();
            const viewModel = new viewModelImpl_1.ViewModel(this._id, this._configuration, model, domLineBreaksComputer_1.DOMLineBreaksComputerFactory.create(), monospaceLineBreaksComputer_1.MonospaceLineBreaksComputerFactory.create(this._configuration.options), (callback) => dom.scheduleAtNextAnimationFrame(callback), this.languageConfigurationService, this._themeService, attachedView);
            // Someone might destroy the model from under the editor, so prevent any exceptions by setting a null model
            listenersToRemove.push(model.onWillDispose(() => this.setModel(null)));
            listenersToRemove.push(viewModel.onEvent((e) => {
                switch (e.kind) {
                    case 0 /* OutgoingViewModelEventKind.ContentSizeChanged */:
                        this._onDidContentSizeChange.fire(e);
                        break;
                    case 1 /* OutgoingViewModelEventKind.FocusChanged */:
                        this._editorTextFocus.setValue(e.hasFocus);
                        break;
                    case 2 /* OutgoingViewModelEventKind.ScrollChanged */:
                        this._onDidScrollChange.fire(e);
                        break;
                    case 3 /* OutgoingViewModelEventKind.ViewZonesChanged */:
                        this._onDidChangeViewZones.fire();
                        break;
                    case 4 /* OutgoingViewModelEventKind.HiddenAreasChanged */:
                        this._onDidChangeHiddenAreas.fire();
                        break;
                    case 5 /* OutgoingViewModelEventKind.ReadOnlyEditAttempt */:
                        this._onDidAttemptReadOnlyEdit.fire();
                        break;
                    case 6 /* OutgoingViewModelEventKind.CursorStateChanged */: {
                        if (e.reachedMaxCursorCount) {
                            const multiCursorLimit = this.getOption(79 /* EditorOption.multiCursorLimit */);
                            const message = nls.localize('cursors.maximum', "The number of cursors has been limited to {0}. Consider using [find and replace](https://code.visualstudio.com/docs/editor/codebasics#_find-and-replace) for larger changes or increase the editor multi cursor limit setting.", multiCursorLimit);
                            this._notificationService.prompt(notification_1.Severity.Warning, message, [
                                {
                                    label: 'Find and Replace',
                                    run: () => {
                                        this._commandService.executeCommand('editor.action.startFindReplaceAction');
                                    }
                                },
                                {
                                    label: nls.localize('goToSetting', 'Increase Multi Cursor Limit'),
                                    run: () => {
                                        this._commandService.executeCommand('workbench.action.openSettings2', {
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
                        this._onDidChangeCursorPosition.fire(e1);
                        const e2 = {
                            selection: e.selections[0],
                            secondarySelections: e.selections.slice(1),
                            modelVersionId: e.modelVersionId,
                            oldSelections: e.oldSelections,
                            oldModelVersionId: e.oldModelVersionId,
                            source: e.source,
                            reason: e.reason
                        };
                        this._onDidChangeCursorSelection.fire(e2);
                        break;
                    }
                    case 7 /* OutgoingViewModelEventKind.ModelDecorationsChanged */:
                        this._onDidChangeModelDecorations.fire(e.event);
                        break;
                    case 8 /* OutgoingViewModelEventKind.ModelLanguageChanged */:
                        this._domElement.setAttribute('data-mode-id', model.getLanguageId());
                        this._onDidChangeModelLanguage.fire(e.event);
                        break;
                    case 9 /* OutgoingViewModelEventKind.ModelLanguageConfigurationChanged */:
                        this._onDidChangeModelLanguageConfiguration.fire(e.event);
                        break;
                    case 10 /* OutgoingViewModelEventKind.ModelContentChanged */:
                        this._onDidChangeModelContent.fire(e.event);
                        break;
                    case 11 /* OutgoingViewModelEventKind.ModelOptionsChanged */:
                        this._onDidChangeModelOptions.fire(e.event);
                        break;
                    case 12 /* OutgoingViewModelEventKind.ModelTokensChanged */:
                        this._onDidChangeModelTokens.fire(e.event);
                        break;
                }
            }));
            const [view, hasRealView] = this._createView(viewModel);
            if (hasRealView) {
                this._domElement.appendChild(view.domNode.domNode);
                let keys = Object.keys(this._contentWidgets);
                for (let i = 0, len = keys.length; i < len; i++) {
                    const widgetId = keys[i];
                    view.addContentWidget(this._contentWidgets[widgetId]);
                }
                keys = Object.keys(this._overlayWidgets);
                for (let i = 0, len = keys.length; i < len; i++) {
                    const widgetId = keys[i];
                    view.addOverlayWidget(this._overlayWidgets[widgetId]);
                }
                keys = Object.keys(this._glyphMarginWidgets);
                for (let i = 0, len = keys.length; i < len; i++) {
                    const widgetId = keys[i];
                    view.addGlyphMarginWidget(this._glyphMarginWidgets[widgetId]);
                }
                view.render(false, true);
                view.domNode.domNode.setAttribute('data-uri', model.uri.toString());
            }
            this._modelData = new ModelData(model, viewModel, view, hasRealView, listenersToRemove, attachedView);
        }
        _createView(viewModel) {
            let commandDelegate;
            if (this.isSimpleWidget) {
                commandDelegate = {
                    paste: (text, pasteOnNewLine, multicursorText, mode) => {
                        this._paste('keyboard', text, pasteOnNewLine, multicursorText, mode);
                    },
                    type: (text) => {
                        this._type('keyboard', text);
                    },
                    compositionType: (text, replacePrevCharCnt, replaceNextCharCnt, positionDelta) => {
                        this._compositionType('keyboard', text, replacePrevCharCnt, replaceNextCharCnt, positionDelta);
                    },
                    startComposition: () => {
                        this._startComposition();
                    },
                    endComposition: () => {
                        this._endComposition('keyboard');
                    },
                    cut: () => {
                        this._cut('keyboard');
                    }
                };
            }
            else {
                commandDelegate = {
                    paste: (text, pasteOnNewLine, multicursorText, mode) => {
                        const payload = { text, pasteOnNewLine, multicursorText, mode };
                        this._commandService.executeCommand("paste" /* editorCommon.Handler.Paste */, payload);
                    },
                    type: (text) => {
                        const payload = { text };
                        this._commandService.executeCommand("type" /* editorCommon.Handler.Type */, payload);
                    },
                    compositionType: (text, replacePrevCharCnt, replaceNextCharCnt, positionDelta) => {
                        // Try if possible to go through the existing `replacePreviousChar` command
                        if (replaceNextCharCnt || positionDelta) {
                            // must be handled through the new command
                            const payload = { text, replacePrevCharCnt, replaceNextCharCnt, positionDelta };
                            this._commandService.executeCommand("compositionType" /* editorCommon.Handler.CompositionType */, payload);
                        }
                        else {
                            const payload = { text, replaceCharCnt: replacePrevCharCnt };
                            this._commandService.executeCommand("replacePreviousChar" /* editorCommon.Handler.ReplacePreviousChar */, payload);
                        }
                    },
                    startComposition: () => {
                        this._commandService.executeCommand("compositionStart" /* editorCommon.Handler.CompositionStart */, {});
                    },
                    endComposition: () => {
                        this._commandService.executeCommand("compositionEnd" /* editorCommon.Handler.CompositionEnd */, {});
                    },
                    cut: () => {
                        this._commandService.executeCommand("cut" /* editorCommon.Handler.Cut */, {});
                    }
                };
            }
            const viewUserInputEvents = new viewUserInputEvents_1.ViewUserInputEvents(viewModel.coordinatesConverter);
            viewUserInputEvents.onKeyDown = (e) => this._onKeyDown.fire(e);
            viewUserInputEvents.onKeyUp = (e) => this._onKeyUp.fire(e);
            viewUserInputEvents.onContextMenu = (e) => this._onContextMenu.fire(e);
            viewUserInputEvents.onMouseMove = (e) => this._onMouseMove.fire(e);
            viewUserInputEvents.onMouseLeave = (e) => this._onMouseLeave.fire(e);
            viewUserInputEvents.onMouseDown = (e) => this._onMouseDown.fire(e);
            viewUserInputEvents.onMouseUp = (e) => this._onMouseUp.fire(e);
            viewUserInputEvents.onMouseDrag = (e) => this._onMouseDrag.fire(e);
            viewUserInputEvents.onMouseDrop = (e) => this._onMouseDrop.fire(e);
            viewUserInputEvents.onMouseDropCanceled = (e) => this._onMouseDropCanceled.fire(e);
            viewUserInputEvents.onMouseWheel = (e) => this._onMouseWheel.fire(e);
            const view = new view_1.View(commandDelegate, this._configuration, this._themeService.getColorTheme(), viewModel, viewUserInputEvents, this._overflowWidgetsDomNode, this._instantiationService);
            return [view, true];
        }
        _postDetachModelCleanup(detachedModel) {
            detachedModel?.removeAllDecorationsWithOwnerId(this._id);
        }
        _detachModel() {
            if (!this._modelData) {
                return null;
            }
            const model = this._modelData.model;
            const removeDomNode = this._modelData.hasRealView ? this._modelData.view.domNode.domNode : null;
            this._modelData.dispose();
            this._modelData = null;
            this._domElement.removeAttribute('data-mode-id');
            if (removeDomNode && this._domElement.contains(removeDomNode)) {
                this._domElement.removeChild(removeDomNode);
            }
            if (this._bannerDomNode && this._domElement.contains(this._bannerDomNode)) {
                this._domElement.removeChild(this._bannerDomNode);
            }
            return model;
        }
        _registerDecorationType(description, key, options, parentTypeKey) {
            this._codeEditorService.registerDecorationType(description, key, options, parentTypeKey, this);
        }
        _removeDecorationType(key) {
            this._codeEditorService.removeDecorationType(key);
        }
        _resolveDecorationOptions(typeKey, writable) {
            return this._codeEditorService.resolveDecorationOptions(typeKey, writable);
        }
        getTelemetryData() {
            return this._telemetryData;
        }
        hasModel() {
            return (this._modelData !== null);
        }
        showDropIndicatorAt(position) {
            const newDecorations = [{
                    range: new range_1.Range(position.lineNumber, position.column, position.lineNumber, position.column),
                    options: CodeEditorWidget_1.dropIntoEditorDecorationOptions
                }];
            this._dropIntoEditorDecorations.set(newDecorations);
            this.revealPosition(position, 1 /* editorCommon.ScrollType.Immediate */);
        }
        removeDropIndicator() {
            this._dropIntoEditorDecorations.clear();
        }
        setContextValue(key, value) {
            this._contextKeyService.createKey(key, value);
        }
    };
    exports.CodeEditorWidget = CodeEditorWidget;
    exports.CodeEditorWidget = CodeEditorWidget = CodeEditorWidget_1 = __decorate([
        __param(3, instantiation_1.IInstantiationService),
        __param(4, codeEditorService_1.ICodeEditorService),
        __param(5, commands_1.ICommandService),
        __param(6, contextkey_1.IContextKeyService),
        __param(7, themeService_1.IThemeService),
        __param(8, notification_1.INotificationService),
        __param(9, accessibility_1.IAccessibilityService),
        __param(10, languageConfigurationRegistry_1.ILanguageConfigurationService),
        __param(11, languageFeatures_1.ILanguageFeaturesService)
    ], CodeEditorWidget);
    var BooleanEventValue;
    (function (BooleanEventValue) {
        BooleanEventValue[BooleanEventValue["NotSet"] = 0] = "NotSet";
        BooleanEventValue[BooleanEventValue["False"] = 1] = "False";
        BooleanEventValue[BooleanEventValue["True"] = 2] = "True";
    })(BooleanEventValue || (BooleanEventValue = {}));
    class BooleanEventEmitter extends lifecycle_1.Disposable {
        constructor(_emitterOptions) {
            super();
            this._emitterOptions = _emitterOptions;
            this._onDidChangeToTrue = this._register(new event_1.Emitter(this._emitterOptions));
            this.onDidChangeToTrue = this._onDidChangeToTrue.event;
            this._onDidChangeToFalse = this._register(new event_1.Emitter(this._emitterOptions));
            this.onDidChangeToFalse = this._onDidChangeToFalse.event;
            this._value = 0 /* BooleanEventValue.NotSet */;
        }
        setValue(_value) {
            const value = (_value ? 2 /* BooleanEventValue.True */ : 1 /* BooleanEventValue.False */);
            if (this._value === value) {
                return;
            }
            this._value = value;
            if (this._value === 2 /* BooleanEventValue.True */) {
                this._onDidChangeToTrue.fire();
            }
            else if (this._value === 1 /* BooleanEventValue.False */) {
                this._onDidChangeToFalse.fire();
            }
        }
    }
    exports.BooleanEventEmitter = BooleanEventEmitter;
    /**
     * A regular event emitter that also makes sure contributions are instantiated if necessary
     */
    class InteractionEmitter extends event_1.Emitter {
        constructor(_contributions, deliveryQueue) {
            super({ deliveryQueue });
            this._contributions = _contributions;
        }
        fire(event) {
            this._contributions.onBeforeInteractionEvent();
            super.fire(event);
        }
    }
    class EditorContextKeysManager extends lifecycle_1.Disposable {
        constructor(editor, contextKeyService) {
            super();
            this._editor = editor;
            contextKeyService.createKey('editorId', editor.getId());
            this._editorSimpleInput = editorContextKeys_1.EditorContextKeys.editorSimpleInput.bindTo(contextKeyService);
            this._editorFocus = editorContextKeys_1.EditorContextKeys.focus.bindTo(contextKeyService);
            this._textInputFocus = editorContextKeys_1.EditorContextKeys.textInputFocus.bindTo(contextKeyService);
            this._editorTextFocus = editorContextKeys_1.EditorContextKeys.editorTextFocus.bindTo(contextKeyService);
            this._tabMovesFocus = editorContextKeys_1.EditorContextKeys.tabMovesFocus.bindTo(contextKeyService);
            this._editorReadonly = editorContextKeys_1.EditorContextKeys.readOnly.bindTo(contextKeyService);
            this._inDiffEditor = editorContextKeys_1.EditorContextKeys.inDiffEditor.bindTo(contextKeyService);
            this._editorColumnSelection = editorContextKeys_1.EditorContextKeys.columnSelection.bindTo(contextKeyService);
            this._hasMultipleSelections = editorContextKeys_1.EditorContextKeys.hasMultipleSelections.bindTo(contextKeyService);
            this._hasNonEmptySelection = editorContextKeys_1.EditorContextKeys.hasNonEmptySelection.bindTo(contextKeyService);
            this._canUndo = editorContextKeys_1.EditorContextKeys.canUndo.bindTo(contextKeyService);
            this._canRedo = editorContextKeys_1.EditorContextKeys.canRedo.bindTo(contextKeyService);
            this._register(this._editor.onDidChangeConfiguration(() => this._updateFromConfig()));
            this._register(this._editor.onDidChangeCursorSelection(() => this._updateFromSelection()));
            this._register(this._editor.onDidFocusEditorWidget(() => this._updateFromFocus()));
            this._register(this._editor.onDidBlurEditorWidget(() => this._updateFromFocus()));
            this._register(this._editor.onDidFocusEditorText(() => this._updateFromFocus()));
            this._register(this._editor.onDidBlurEditorText(() => this._updateFromFocus()));
            this._register(this._editor.onDidChangeModel(() => this._updateFromModel()));
            this._register(this._editor.onDidChangeConfiguration(() => this._updateFromModel()));
            this._register(tabFocus_1.TabFocus.onDidChangeTabFocus((tabFocusMode) => this._tabMovesFocus.set(tabFocusMode)));
            this._updateFromConfig();
            this._updateFromSelection();
            this._updateFromFocus();
            this._updateFromModel();
            this._editorSimpleInput.set(this._editor.isSimpleWidget);
        }
        _updateFromConfig() {
            const options = this._editor.getOptions();
            this._tabMovesFocus.set(tabFocus_1.TabFocus.getTabFocusMode());
            this._editorReadonly.set(options.get(90 /* EditorOption.readOnly */));
            this._inDiffEditor.set(options.get(61 /* EditorOption.inDiffEditor */));
            this._editorColumnSelection.set(options.get(22 /* EditorOption.columnSelection */));
        }
        _updateFromSelection() {
            const selections = this._editor.getSelections();
            if (!selections) {
                this._hasMultipleSelections.reset();
                this._hasNonEmptySelection.reset();
            }
            else {
                this._hasMultipleSelections.set(selections.length > 1);
                this._hasNonEmptySelection.set(selections.some(s => !s.isEmpty()));
            }
        }
        _updateFromFocus() {
            this._editorFocus.set(this._editor.hasWidgetFocus() && !this._editor.isSimpleWidget);
            this._editorTextFocus.set(this._editor.hasTextFocus() && !this._editor.isSimpleWidget);
            this._textInputFocus.set(this._editor.hasTextFocus());
        }
        _updateFromModel() {
            const model = this._editor.getModel();
            this._canUndo.set(Boolean(model && model.canUndo()));
            this._canRedo.set(Boolean(model && model.canRedo()));
        }
    }
    class EditorModeContext extends lifecycle_1.Disposable {
        constructor(_editor, _contextKeyService, _languageFeaturesService) {
            super();
            this._editor = _editor;
            this._contextKeyService = _contextKeyService;
            this._languageFeaturesService = _languageFeaturesService;
            this._langId = editorContextKeys_1.EditorContextKeys.languageId.bindTo(_contextKeyService);
            this._hasCompletionItemProvider = editorContextKeys_1.EditorContextKeys.hasCompletionItemProvider.bindTo(_contextKeyService);
            this._hasCodeActionsProvider = editorContextKeys_1.EditorContextKeys.hasCodeActionsProvider.bindTo(_contextKeyService);
            this._hasCodeLensProvider = editorContextKeys_1.EditorContextKeys.hasCodeLensProvider.bindTo(_contextKeyService);
            this._hasDefinitionProvider = editorContextKeys_1.EditorContextKeys.hasDefinitionProvider.bindTo(_contextKeyService);
            this._hasDeclarationProvider = editorContextKeys_1.EditorContextKeys.hasDeclarationProvider.bindTo(_contextKeyService);
            this._hasImplementationProvider = editorContextKeys_1.EditorContextKeys.hasImplementationProvider.bindTo(_contextKeyService);
            this._hasTypeDefinitionProvider = editorContextKeys_1.EditorContextKeys.hasTypeDefinitionProvider.bindTo(_contextKeyService);
            this._hasHoverProvider = editorContextKeys_1.EditorContextKeys.hasHoverProvider.bindTo(_contextKeyService);
            this._hasDocumentHighlightProvider = editorContextKeys_1.EditorContextKeys.hasDocumentHighlightProvider.bindTo(_contextKeyService);
            this._hasDocumentSymbolProvider = editorContextKeys_1.EditorContextKeys.hasDocumentSymbolProvider.bindTo(_contextKeyService);
            this._hasReferenceProvider = editorContextKeys_1.EditorContextKeys.hasReferenceProvider.bindTo(_contextKeyService);
            this._hasRenameProvider = editorContextKeys_1.EditorContextKeys.hasRenameProvider.bindTo(_contextKeyService);
            this._hasSignatureHelpProvider = editorContextKeys_1.EditorContextKeys.hasSignatureHelpProvider.bindTo(_contextKeyService);
            this._hasInlayHintsProvider = editorContextKeys_1.EditorContextKeys.hasInlayHintsProvider.bindTo(_contextKeyService);
            this._hasDocumentFormattingProvider = editorContextKeys_1.EditorContextKeys.hasDocumentFormattingProvider.bindTo(_contextKeyService);
            this._hasDocumentSelectionFormattingProvider = editorContextKeys_1.EditorContextKeys.hasDocumentSelectionFormattingProvider.bindTo(_contextKeyService);
            this._hasMultipleDocumentFormattingProvider = editorContextKeys_1.EditorContextKeys.hasMultipleDocumentFormattingProvider.bindTo(_contextKeyService);
            this._hasMultipleDocumentSelectionFormattingProvider = editorContextKeys_1.EditorContextKeys.hasMultipleDocumentSelectionFormattingProvider.bindTo(_contextKeyService);
            this._isInWalkThrough = editorContextKeys_1.EditorContextKeys.isInWalkThroughSnippet.bindTo(_contextKeyService);
            const update = () => this._update();
            // update when model/mode changes
            this._register(_editor.onDidChangeModel(update));
            this._register(_editor.onDidChangeModelLanguage(update));
            // update when registries change
            this._register(_languageFeaturesService.completionProvider.onDidChange(update));
            this._register(_languageFeaturesService.codeActionProvider.onDidChange(update));
            this._register(_languageFeaturesService.codeLensProvider.onDidChange(update));
            this._register(_languageFeaturesService.definitionProvider.onDidChange(update));
            this._register(_languageFeaturesService.declarationProvider.onDidChange(update));
            this._register(_languageFeaturesService.implementationProvider.onDidChange(update));
            this._register(_languageFeaturesService.typeDefinitionProvider.onDidChange(update));
            this._register(_languageFeaturesService.hoverProvider.onDidChange(update));
            this._register(_languageFeaturesService.documentHighlightProvider.onDidChange(update));
            this._register(_languageFeaturesService.documentSymbolProvider.onDidChange(update));
            this._register(_languageFeaturesService.referenceProvider.onDidChange(update));
            this._register(_languageFeaturesService.renameProvider.onDidChange(update));
            this._register(_languageFeaturesService.documentFormattingEditProvider.onDidChange(update));
            this._register(_languageFeaturesService.documentRangeFormattingEditProvider.onDidChange(update));
            this._register(_languageFeaturesService.signatureHelpProvider.onDidChange(update));
            this._register(_languageFeaturesService.inlayHintsProvider.onDidChange(update));
            update();
        }
        dispose() {
            super.dispose();
        }
        reset() {
            this._contextKeyService.bufferChangeEvents(() => {
                this._langId.reset();
                this._hasCompletionItemProvider.reset();
                this._hasCodeActionsProvider.reset();
                this._hasCodeLensProvider.reset();
                this._hasDefinitionProvider.reset();
                this._hasDeclarationProvider.reset();
                this._hasImplementationProvider.reset();
                this._hasTypeDefinitionProvider.reset();
                this._hasHoverProvider.reset();
                this._hasDocumentHighlightProvider.reset();
                this._hasDocumentSymbolProvider.reset();
                this._hasReferenceProvider.reset();
                this._hasRenameProvider.reset();
                this._hasDocumentFormattingProvider.reset();
                this._hasDocumentSelectionFormattingProvider.reset();
                this._hasSignatureHelpProvider.reset();
                this._isInWalkThrough.reset();
            });
        }
        _update() {
            const model = this._editor.getModel();
            if (!model) {
                this.reset();
                return;
            }
            this._contextKeyService.bufferChangeEvents(() => {
                this._langId.set(model.getLanguageId());
                this._hasCompletionItemProvider.set(this._languageFeaturesService.completionProvider.has(model));
                this._hasCodeActionsProvider.set(this._languageFeaturesService.codeActionProvider.has(model));
                this._hasCodeLensProvider.set(this._languageFeaturesService.codeLensProvider.has(model));
                this._hasDefinitionProvider.set(this._languageFeaturesService.definitionProvider.has(model));
                this._hasDeclarationProvider.set(this._languageFeaturesService.declarationProvider.has(model));
                this._hasImplementationProvider.set(this._languageFeaturesService.implementationProvider.has(model));
                this._hasTypeDefinitionProvider.set(this._languageFeaturesService.typeDefinitionProvider.has(model));
                this._hasHoverProvider.set(this._languageFeaturesService.hoverProvider.has(model));
                this._hasDocumentHighlightProvider.set(this._languageFeaturesService.documentHighlightProvider.has(model));
                this._hasDocumentSymbolProvider.set(this._languageFeaturesService.documentSymbolProvider.has(model));
                this._hasReferenceProvider.set(this._languageFeaturesService.referenceProvider.has(model));
                this._hasRenameProvider.set(this._languageFeaturesService.renameProvider.has(model));
                this._hasSignatureHelpProvider.set(this._languageFeaturesService.signatureHelpProvider.has(model));
                this._hasInlayHintsProvider.set(this._languageFeaturesService.inlayHintsProvider.has(model));
                this._hasDocumentFormattingProvider.set(this._languageFeaturesService.documentFormattingEditProvider.has(model) || this._languageFeaturesService.documentRangeFormattingEditProvider.has(model));
                this._hasDocumentSelectionFormattingProvider.set(this._languageFeaturesService.documentRangeFormattingEditProvider.has(model));
                this._hasMultipleDocumentFormattingProvider.set(this._languageFeaturesService.documentFormattingEditProvider.all(model).length + this._languageFeaturesService.documentRangeFormattingEditProvider.all(model).length > 1);
                this._hasMultipleDocumentSelectionFormattingProvider.set(this._languageFeaturesService.documentRangeFormattingEditProvider.all(model).length > 1);
                this._isInWalkThrough.set(model.uri.scheme === network_1.Schemas.walkThroughSnippet);
            });
        }
    }
    exports.EditorModeContext = EditorModeContext;
    class CodeEditorWidgetFocusTracker extends lifecycle_1.Disposable {
        constructor(domElement) {
            super();
            this._onChange = this._register(new event_1.Emitter());
            this.onChange = this._onChange.event;
            this._hasFocus = false;
            this._domFocusTracker = this._register(dom.trackFocus(domElement));
            this._register(this._domFocusTracker.onDidFocus(() => {
                this._hasFocus = true;
                this._onChange.fire(undefined);
            }));
            this._register(this._domFocusTracker.onDidBlur(() => {
                this._hasFocus = false;
                this._onChange.fire(undefined);
            }));
        }
        hasFocus() {
            return this._hasFocus;
        }
        refreshState() {
            this._domFocusTracker.refreshState?.();
        }
    }
    class EditorDecorationsCollection {
        get length() {
            return this._decorationIds.length;
        }
        constructor(_editor, decorations) {
            this._editor = _editor;
            this._decorationIds = [];
            this._isChangingDecorations = false;
            if (Array.isArray(decorations) && decorations.length > 0) {
                this.set(decorations);
            }
        }
        onDidChange(listener, thisArgs, disposables) {
            return this._editor.onDidChangeModelDecorations((e) => {
                if (this._isChangingDecorations) {
                    return;
                }
                listener.call(thisArgs, e);
            }, disposables);
        }
        getRange(index) {
            if (!this._editor.hasModel()) {
                return null;
            }
            if (index >= this._decorationIds.length) {
                return null;
            }
            return this._editor.getModel().getDecorationRange(this._decorationIds[index]);
        }
        getRanges() {
            if (!this._editor.hasModel()) {
                return [];
            }
            const model = this._editor.getModel();
            const result = [];
            for (const decorationId of this._decorationIds) {
                const range = model.getDecorationRange(decorationId);
                if (range) {
                    result.push(range);
                }
            }
            return result;
        }
        has(decoration) {
            return this._decorationIds.includes(decoration.id);
        }
        clear() {
            if (this._decorationIds.length === 0) {
                // nothing to do
                return;
            }
            this.set([]);
        }
        set(newDecorations) {
            try {
                this._isChangingDecorations = true;
                this._editor.changeDecorations((accessor) => {
                    this._decorationIds = accessor.deltaDecorations(this._decorationIds, newDecorations);
                });
            }
            finally {
                this._isChangingDecorations = false;
            }
            return this._decorationIds;
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
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const errorForeground = theme.getColor(colorRegistry_1.editorErrorForeground);
        if (errorForeground) {
            collector.addRule(`.monaco-editor .${"squiggly-error" /* ClassName.EditorErrorDecoration */} { background: url("data:image/svg+xml,${getSquigglySVGData(errorForeground)}") repeat-x bottom left; }`);
        }
        const warningForeground = theme.getColor(colorRegistry_1.editorWarningForeground);
        if (warningForeground) {
            collector.addRule(`.monaco-editor .${"squiggly-warning" /* ClassName.EditorWarningDecoration */} { background: url("data:image/svg+xml,${getSquigglySVGData(warningForeground)}") repeat-x bottom left; }`);
        }
        const infoForeground = theme.getColor(colorRegistry_1.editorInfoForeground);
        if (infoForeground) {
            collector.addRule(`.monaco-editor .${"squiggly-info" /* ClassName.EditorInfoDecoration */} { background: url("data:image/svg+xml,${getSquigglySVGData(infoForeground)}") repeat-x bottom left; }`);
        }
        const hintForeground = theme.getColor(colorRegistry_1.editorHintForeground);
        if (hintForeground) {
            collector.addRule(`.monaco-editor .${"squiggly-hint" /* ClassName.EditorHintDecoration */} { background: url("data:image/svg+xml,${getDotDotDotSVGData(hintForeground)}") no-repeat bottom left; }`);
        }
        const unnecessaryForeground = theme.getColor(editorColorRegistry_1.editorUnnecessaryCodeOpacity);
        if (unnecessaryForeground) {
            collector.addRule(`.monaco-editor.showUnused .${"squiggly-inline-unnecessary" /* ClassName.EditorUnnecessaryInlineDecoration */} { opacity: ${unnecessaryForeground.rgba.a}; }`);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUVkaXRvcldpZGdldC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9icm93c2VyL3dpZGdldC9jb2RlRWRpdG9yV2lkZ2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUE0RGhHLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztJQXdCbEIsTUFBTSxTQUFTO1FBQ2QsWUFDaUIsS0FBaUIsRUFDakIsU0FBb0IsRUFDcEIsSUFBVSxFQUNWLFdBQW9CLEVBQ3BCLGlCQUFnQyxFQUNoQyxZQUEyQjtZQUwzQixVQUFLLEdBQUwsS0FBSyxDQUFZO1lBQ2pCLGNBQVMsR0FBVCxTQUFTLENBQVc7WUFDcEIsU0FBSSxHQUFKLElBQUksQ0FBTTtZQUNWLGdCQUFXLEdBQVgsV0FBVyxDQUFTO1lBQ3BCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBZTtZQUNoQyxpQkFBWSxHQUFaLFlBQVksQ0FBZTtRQUU1QyxDQUFDO1FBRU0sT0FBTztZQUNiLElBQUEsbUJBQU8sRUFBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNoQyxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUMvQyxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7YUFDcEI7WUFDRCxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzFCLENBQUM7S0FDRDtJQUVNLElBQU0sZ0JBQWdCLEdBQXRCLE1BQU0sZ0JBQWlCLFNBQVEsc0JBQVU7O2lCQUV2QixvQ0FBK0IsR0FBRyxrQ0FBc0IsQ0FBQyxRQUFRLENBQUM7WUFDekYsV0FBVyxFQUFFLHNCQUFzQjtZQUNuQyxTQUFTLEVBQUUsWUFBWTtTQUN2QixDQUFDLEFBSHFE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