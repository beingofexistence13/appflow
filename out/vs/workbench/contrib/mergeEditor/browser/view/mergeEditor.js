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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/grid/grid", "vs/base/common/color", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/base/common/resources", "vs/base/common/types", "vs/editor/browser/services/codeEditorService", "vs/editor/common/services/textResourceConfiguration", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/editor/textEditor", "vs/workbench/common/editor", "vs/workbench/common/editor/editorOptions", "vs/workbench/contrib/codeEditor/browser/toggleWordWrap", "vs/workbench/contrib/mergeEditor/browser/mergeEditorInput", "vs/workbench/contrib/mergeEditor/browser/utils", "vs/workbench/contrib/mergeEditor/browser/view/editors/baseCodeEditorView", "vs/workbench/contrib/mergeEditor/browser/view/scrollSynchronizer", "vs/workbench/contrib/mergeEditor/browser/view/viewModel", "vs/workbench/contrib/mergeEditor/browser/view/viewZones", "vs/workbench/contrib/mergeEditor/common/mergeEditor", "vs/workbench/contrib/preferences/common/settingsEditorColorRegistry", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/services/editor/common/editorService", "./editors/inputCodeEditorView", "./editors/resultCodeEditorView", "vs/css!./media/mergeEditor", "./colors"], function (require, exports, dom_1, grid_1, color_1, errors_1, event_1, lifecycle_1, observable_1, resources_1, types_1, codeEditorService_1, textResourceConfiguration_1, nls_1, configuration_1, contextkey_1, files_1, instantiation_1, storage_1, telemetry_1, themeService_1, textEditor_1, editor_1, editorOptions_1, toggleWordWrap_1, mergeEditorInput_1, utils_1, baseCodeEditorView_1, scrollSynchronizer_1, viewModel_1, viewZones_1, mergeEditor_1, settingsEditorColorRegistry_1, editorGroupsService_1, editorResolverService_1, editorService_1, inputCodeEditorView_1, resultCodeEditorView_1) {
    "use strict";
    var MergeEditor_1, MergeEditorLayoutStore_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MergeEditorResolverContribution = exports.MergeEditorOpenHandlerContribution = exports.MergeEditor = void 0;
    let MergeEditor = class MergeEditor extends textEditor_1.AbstractTextEditor {
        static { MergeEditor_1 = this; }
        static { this.ID = 'mergeEditor'; }
        get viewModel() {
            return this._viewModel;
        }
        get inputModel() {
            return this._inputModel;
        }
        get model() {
            return this.inputModel.get()?.model;
        }
        get inputsWritable() {
            return !!this._configurationService.getValue('mergeEditor.writableInputs');
        }
        constructor(instantiation, contextKeyService, telemetryService, storageService, themeService, textResourceConfigurationService, _configurationService, editorService, editorGroupService, fileService, _codeEditorService, configurationService) {
            super(MergeEditor_1.ID, telemetryService, instantiation, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService, fileService);
            this.contextKeyService = contextKeyService;
            this._configurationService = _configurationService;
            this._codeEditorService = _codeEditorService;
            this.configurationService = configurationService;
            this._sessionDisposables = new lifecycle_1.DisposableStore();
            this._viewModel = (0, observable_1.observableValue)(this, undefined);
            this._grid = this._register(new lifecycle_1.MutableDisposable());
            this.input1View = this._register(this.instantiationService.createInstance(inputCodeEditorView_1.InputCodeEditorView, 1, this._viewModel));
            this.baseView = (0, observable_1.observableValue)(this, undefined);
            this.baseViewOptions = (0, observable_1.observableValue)(this, undefined);
            this.input2View = this._register(this.instantiationService.createInstance(inputCodeEditorView_1.InputCodeEditorView, 2, this._viewModel));
            this.inputResultView = this._register(this.instantiationService.createInstance(resultCodeEditorView_1.ResultCodeEditorView, this._viewModel));
            this._layoutMode = this.instantiationService.createInstance(MergeEditorLayoutStore);
            this._layoutModeObs = (0, observable_1.observableValue)(this, this._layoutMode.value);
            this._ctxIsMergeEditor = mergeEditor_1.ctxIsMergeEditor.bindTo(this.contextKeyService);
            this._ctxUsesColumnLayout = mergeEditor_1.ctxMergeEditorLayout.bindTo(this.contextKeyService);
            this._ctxShowBase = mergeEditor_1.ctxMergeEditorShowBase.bindTo(this.contextKeyService);
            this._ctxShowBaseAtTop = mergeEditor_1.ctxMergeEditorShowBaseAtTop.bindTo(this.contextKeyService);
            this._ctxResultUri = mergeEditor_1.ctxMergeResultUri.bindTo(this.contextKeyService);
            this._ctxBaseUri = mergeEditor_1.ctxMergeBaseUri.bindTo(this.contextKeyService);
            this._ctxShowNonConflictingChanges = mergeEditor_1.ctxMergeEditorShowNonConflictingChanges.bindTo(this.contextKeyService);
            this._inputModel = (0, observable_1.observableValue)(this, undefined);
            this.viewZoneComputer = new viewZones_1.ViewZoneComputer(this.input1View.editor, this.input2View.editor, this.inputResultView.editor);
            this.codeLensesVisible = (0, utils_1.observableConfigValue)('mergeEditor.showCodeLenses', true, this.configurationService);
            this.scrollSynchronizer = this._register(new scrollSynchronizer_1.ScrollSynchronizer(this._viewModel, this.input1View, this.input2View, this.baseView, this.inputResultView, this._layoutModeObs));
            // #region layout constraints
            this._onDidChangeSizeConstraints = new event_1.Emitter();
            this.onDidChangeSizeConstraints = this._onDidChangeSizeConstraints.event;
            this.baseViewDisposables = this._register(new lifecycle_1.DisposableStore());
            this.showNonConflictingChangesStore = this.instantiationService.createInstance((utils_1.PersistentStore), 'mergeEditor/showNonConflictingChanges');
            this.showNonConflictingChanges = (0, observable_1.observableValue)(this, this.showNonConflictingChangesStore.get() ?? false);
        }
        dispose() {
            this._sessionDisposables.dispose();
            this._ctxIsMergeEditor.reset();
            this._ctxUsesColumnLayout.reset();
            this._ctxShowNonConflictingChanges.reset();
            super.dispose();
        }
        get minimumWidth() {
            return this._layoutMode.value.kind === 'mixed'
                ? this.input1View.view.minimumWidth + this.input2View.view.minimumWidth
                : this.input1View.view.minimumWidth + this.input2View.view.minimumWidth + this.inputResultView.view.minimumWidth;
        }
        // #endregion
        getTitle() {
            if (this.input) {
                return this.input.getName();
            }
            return (0, nls_1.localize)('mergeEditor', "Text Merge Editor");
        }
        createEditorControl(parent, initialOptions) {
            this.rootHtmlElement = parent;
            parent.classList.add('merge-editor');
            this.applyLayout(this._layoutMode.value);
            this.applyOptions(initialOptions);
        }
        updateEditorControlOptions(options) {
            this.applyOptions(options);
        }
        applyOptions(options) {
            const inputOptions = (0, utils_1.deepMerge)(options, {
                minimap: { enabled: false },
                glyphMargin: false,
                lineNumbersMinChars: 2,
                readOnly: !this.inputsWritable
            });
            this.input1View.updateOptions(inputOptions);
            this.input2View.updateOptions(inputOptions);
            this.baseViewOptions.set({ ...this.input2View.editor.getRawOptions() }, undefined);
            this.inputResultView.updateOptions(options);
        }
        getMainControl() {
            return this.inputResultView.editor;
        }
        layout(dimension) {
            this._grid.value?.layout(dimension.width, dimension.height);
        }
        async setInput(input, options, context, token) {
            if (!(input instanceof mergeEditorInput_1.MergeEditorInput)) {
                throw new errors_1.BugIndicatingError('ONLY MergeEditorInput is supported');
            }
            await super.setInput(input, options, context, token);
            this._sessionDisposables.clear();
            (0, observable_1.transaction)(tx => {
                this._viewModel.set(undefined, tx);
                this._inputModel.set(undefined, tx);
            });
            const inputModel = await input.resolve();
            const model = inputModel.model;
            const viewModel = this.instantiationService.createInstance(viewModel_1.MergeEditorViewModel, model, this.input1View, this.input2View, this.inputResultView, this.baseView, this.showNonConflictingChanges);
            model.telemetry.reportMergeEditorOpened({
                combinableConflictCount: model.combinableConflictCount,
                conflictCount: model.conflictCount,
                baseTop: this._layoutModeObs.get().showBaseAtTop,
                baseVisible: this._layoutModeObs.get().showBase,
                isColumnView: this._layoutModeObs.get().kind === 'columns',
            });
            (0, observable_1.transaction)(tx => {
                this._viewModel.set(viewModel, tx);
                this._inputModel.set(inputModel, tx);
            });
            this._sessionDisposables.add(viewModel);
            // Set/unset context keys based on input
            this._ctxResultUri.set(inputModel.resultUri.toString());
            this._ctxBaseUri.set(model.base.uri.toString());
            this._sessionDisposables.add((0, lifecycle_1.toDisposable)(() => {
                this._ctxBaseUri.reset();
                this._ctxResultUri.reset();
            }));
            // Set the view zones before restoring view state!
            // Otherwise scrolling will be off
            this._sessionDisposables.add((0, observable_1.autorunWithStore)((reader, store) => {
                /** @description update alignment view zones */
                const baseView = this.baseView.read(reader);
                this.inputResultView.editor.changeViewZones(resultViewZoneAccessor => {
                    const layout = this._layoutModeObs.read(reader);
                    const shouldAlignResult = layout.kind === 'columns';
                    const shouldAlignBase = layout.kind === 'mixed' && !layout.showBaseAtTop;
                    this.input1View.editor.changeViewZones(input1ViewZoneAccessor => {
                        this.input2View.editor.changeViewZones(input2ViewZoneAccessor => {
                            if (baseView) {
                                baseView.editor.changeViewZones(baseViewZoneAccessor => {
                                    store.add(this.setViewZones(reader, viewModel, this.input1View.editor, input1ViewZoneAccessor, this.input2View.editor, input2ViewZoneAccessor, baseView.editor, baseViewZoneAccessor, shouldAlignBase, this.inputResultView.editor, resultViewZoneAccessor, shouldAlignResult));
                                });
                            }
                            else {
                                store.add(this.setViewZones(reader, viewModel, this.input1View.editor, input1ViewZoneAccessor, this.input2View.editor, input2ViewZoneAccessor, undefined, undefined, false, this.inputResultView.editor, resultViewZoneAccessor, shouldAlignResult));
                            }
                        });
                    });
                });
                this.scrollSynchronizer.updateScrolling();
            }));
            const viewState = this.loadEditorViewState(input, context);
            if (viewState) {
                this._applyViewState(viewState);
            }
            else {
                this._sessionDisposables.add((0, utils_1.thenIfNotDisposed)(model.onInitialized, () => {
                    const firstConflict = model.modifiedBaseRanges.get().find(r => r.isConflicting);
                    if (!firstConflict) {
                        return;
                    }
                    this.input1View.editor.revealLineInCenter(firstConflict.input1Range.startLineNumber);
                    (0, observable_1.transaction)(tx => {
                        /** @description setActiveModifiedBaseRange */
                        viewModel.setActiveModifiedBaseRange(firstConflict, tx);
                    });
                }));
            }
            // word wrap special case - sync transient state from result model to input[1|2] models
            const mirrorWordWrapTransientState = (candidate) => {
                const candidateState = (0, toggleWordWrap_1.readTransientState)(candidate, this._codeEditorService);
                (0, toggleWordWrap_1.writeTransientState)(model.input2.textModel, candidateState, this._codeEditorService);
                (0, toggleWordWrap_1.writeTransientState)(model.input1.textModel, candidateState, this._codeEditorService);
                (0, toggleWordWrap_1.writeTransientState)(model.resultTextModel, candidateState, this._codeEditorService);
                const baseTextModel = this.baseView.get()?.editor.getModel();
                if (baseTextModel) {
                    (0, toggleWordWrap_1.writeTransientState)(baseTextModel, candidateState, this._codeEditorService);
                }
            };
            this._sessionDisposables.add(this._codeEditorService.onDidChangeTransientModelProperty(candidate => {
                mirrorWordWrapTransientState(candidate);
            }));
            mirrorWordWrapTransientState(this.inputResultView.editor.getModel());
            // detect when base, input1, and input2 become empty and replace THIS editor with its result editor
            // TODO@jrieken@hediet this needs a better/cleaner solution
            // https://github.com/microsoft/vscode/issues/155940
            const that = this;
            this._sessionDisposables.add(new class {
                constructor() {
                    this._disposable = new lifecycle_1.DisposableStore();
                    for (const model of this.baseInput1Input2()) {
                        this._disposable.add(model.onDidChangeContent(() => this._checkBaseInput1Input2AllEmpty()));
                    }
                }
                dispose() {
                    this._disposable.dispose();
                }
                *baseInput1Input2() {
                    yield model.base;
                    yield model.input1.textModel;
                    yield model.input2.textModel;
                }
                _checkBaseInput1Input2AllEmpty() {
                    for (const model of this.baseInput1Input2()) {
                        if (model.getValueLength() > 0) {
                            return;
                        }
                    }
                    // all empty -> replace this editor with a normal editor for result
                    that.editorService.replaceEditors([{ editor: input, replacement: { resource: input.result, options: { preserveFocus: true } }, forceReplaceDirty: true }], that.group ?? that.editorGroupService.activeGroup);
                }
            });
        }
        setViewZones(reader, viewModel, input1Editor, input1ViewZoneAccessor, input2Editor, input2ViewZoneAccessor, baseEditor, baseViewZoneAccessor, shouldAlignBase, resultEditor, resultViewZoneAccessor, shouldAlignResult) {
            const input1ViewZoneIds = [];
            const input2ViewZoneIds = [];
            const baseViewZoneIds = [];
            const resultViewZoneIds = [];
            const viewZones = this.viewZoneComputer.computeViewZones(reader, viewModel, {
                codeLensesVisible: this.codeLensesVisible.read(reader),
                showNonConflictingChanges: this.showNonConflictingChanges.read(reader),
                shouldAlignBase,
                shouldAlignResult,
            });
            const disposableStore = new lifecycle_1.DisposableStore();
            if (baseViewZoneAccessor) {
                for (const v of viewZones.baseViewZones) {
                    v.create(baseViewZoneAccessor, baseViewZoneIds, disposableStore);
                }
            }
            for (const v of viewZones.resultViewZones) {
                v.create(resultViewZoneAccessor, resultViewZoneIds, disposableStore);
            }
            for (const v of viewZones.input1ViewZones) {
                v.create(input1ViewZoneAccessor, input1ViewZoneIds, disposableStore);
            }
            for (const v of viewZones.input2ViewZones) {
                v.create(input2ViewZoneAccessor, input2ViewZoneIds, disposableStore);
            }
            disposableStore.add({
                dispose: () => {
                    input1Editor.changeViewZones(a => {
                        for (const zone of input1ViewZoneIds) {
                            a.removeZone(zone);
                        }
                    });
                    input2Editor.changeViewZones(a => {
                        for (const zone of input2ViewZoneIds) {
                            a.removeZone(zone);
                        }
                    });
                    baseEditor?.changeViewZones(a => {
                        for (const zone of baseViewZoneIds) {
                            a.removeZone(zone);
                        }
                    });
                    resultEditor.changeViewZones(a => {
                        for (const zone of resultViewZoneIds) {
                            a.removeZone(zone);
                        }
                    });
                }
            });
            return disposableStore;
        }
        setOptions(options) {
            super.setOptions(options);
            if (options) {
                (0, editorOptions_1.applyTextEditorOptions)(options, this.inputResultView.editor, 0 /* ScrollType.Smooth */);
            }
        }
        clearInput() {
            super.clearInput();
            this._sessionDisposables.clear();
            for (const { editor } of [this.input1View, this.input2View, this.inputResultView]) {
                editor.setModel(null);
            }
        }
        focus() {
            (this.getControl() ?? this.inputResultView.editor).focus();
        }
        hasFocus() {
            for (const { editor } of [this.input1View, this.input2View, this.inputResultView]) {
                if (editor.hasTextFocus()) {
                    return true;
                }
            }
            return super.hasFocus();
        }
        setEditorVisible(visible, group) {
            super.setEditorVisible(visible, group);
            for (const { editor } of [this.input1View, this.input2View, this.inputResultView]) {
                if (visible) {
                    editor.onVisible();
                }
                else {
                    editor.onHide();
                }
            }
            this._ctxIsMergeEditor.set(visible);
        }
        // ---- interact with "outside world" via`getControl`, `scopedContextKeyService`: we only expose the result-editor keep the others internal
        getControl() {
            return this.inputResultView.editor;
        }
        get scopedContextKeyService() {
            const control = this.getControl();
            return control?.invokeWithinContext(accessor => accessor.get(contextkey_1.IContextKeyService));
        }
        // --- layout
        toggleBase() {
            this.setLayout({
                ...this._layoutMode.value,
                showBase: !this._layoutMode.value.showBase
            });
        }
        toggleShowBaseTop() {
            const showBaseTop = this._layoutMode.value.showBase && this._layoutMode.value.showBaseAtTop;
            this.setLayout({
                ...this._layoutMode.value,
                showBaseAtTop: true,
                showBase: !showBaseTop,
            });
        }
        toggleShowBaseCenter() {
            const showBaseCenter = this._layoutMode.value.showBase && !this._layoutMode.value.showBaseAtTop;
            this.setLayout({
                ...this._layoutMode.value,
                showBaseAtTop: false,
                showBase: !showBaseCenter,
            });
        }
        setLayoutKind(kind) {
            this.setLayout({
                ...this._layoutMode.value,
                kind
            });
        }
        setLayout(newLayout) {
            const value = this._layoutMode.value;
            if (JSON.stringify(value) === JSON.stringify(newLayout)) {
                return;
            }
            this.model?.telemetry.reportLayoutChange({
                baseTop: newLayout.showBaseAtTop,
                baseVisible: newLayout.showBase,
                isColumnView: newLayout.kind === 'columns',
            });
            this.applyLayout(newLayout);
        }
        applyLayout(layout) {
            (0, observable_1.transaction)(tx => {
                /** @description applyLayout */
                if (layout.showBase && !this.baseView.get()) {
                    this.baseViewDisposables.clear();
                    const baseView = this.baseViewDisposables.add(this.instantiationService.createInstance(baseCodeEditorView_1.BaseCodeEditorView, this.viewModel));
                    this.baseViewDisposables.add((0, observable_1.autorun)(reader => {
                        /** @description Update base view options */
                        const options = this.baseViewOptions.read(reader);
                        if (options) {
                            baseView.updateOptions(options);
                        }
                    }));
                    this.baseView.set(baseView, tx);
                }
                else if (!layout.showBase && this.baseView.get()) {
                    this.baseView.set(undefined, tx);
                    this.baseViewDisposables.clear();
                }
                if (layout.kind === 'mixed') {
                    this.setGrid([
                        layout.showBaseAtTop && layout.showBase ? {
                            size: 38,
                            data: this.baseView.get().view
                        } : undefined,
                        {
                            size: 38,
                            groups: [
                                { data: this.input1View.view },
                                !layout.showBaseAtTop && layout.showBase ? { data: this.baseView.get().view } : undefined,
                                { data: this.input2View.view }
                            ].filter(types_1.isDefined)
                        },
                        {
                            size: 62,
                            data: this.inputResultView.view
                        },
                    ].filter(types_1.isDefined));
                }
                else if (layout.kind === 'columns') {
                    this.setGrid([
                        layout.showBase ? {
                            size: 40,
                            data: this.baseView.get().view
                        } : undefined,
                        {
                            size: 60,
                            groups: [{ data: this.input1View.view }, { data: this.inputResultView.view }, { data: this.input2View.view }]
                        },
                    ].filter(types_1.isDefined));
                }
                this._layoutMode.value = layout;
                this._ctxUsesColumnLayout.set(layout.kind);
                this._ctxShowBase.set(layout.showBase);
                this._ctxShowBaseAtTop.set(layout.showBaseAtTop);
                this._onDidChangeSizeConstraints.fire();
                this._layoutModeObs.set(layout, tx);
            });
        }
        setGrid(descriptor) {
            let width = -1;
            let height = -1;
            if (this._grid.value) {
                width = this._grid.value.width;
                height = this._grid.value.height;
            }
            this._grid.value = grid_1.SerializableGrid.from({
                orientation: 0 /* Orientation.VERTICAL */,
                size: 100,
                groups: descriptor,
            }, {
                styles: { separatorBorder: this.theme.getColor(settingsEditorColorRegistry_1.settingsSashBorder) ?? color_1.Color.transparent },
                proportionalLayout: true
            });
            (0, dom_1.reset)(this.rootHtmlElement, this._grid.value.element);
            // Only call layout after the elements have been added to the DOM,
            // so that they have a defined size.
            if (width !== -1) {
                this._grid.value.layout(width, height);
            }
        }
        _applyViewState(state) {
            if (!state) {
                return;
            }
            this.inputResultView.editor.restoreViewState(state);
            if (state.input1State) {
                this.input1View.editor.restoreViewState(state.input1State);
            }
            if (state.input2State) {
                this.input2View.editor.restoreViewState(state.input2State);
            }
            if (state.focusIndex >= 0) {
                [this.input1View.editor, this.input2View.editor, this.inputResultView.editor][state.focusIndex].focus();
            }
        }
        computeEditorViewState(resource) {
            if (!(0, resources_1.isEqual)(this.inputModel.get()?.resultUri, resource)) {
                return undefined;
            }
            const result = this.inputResultView.editor.saveViewState();
            if (!result) {
                return undefined;
            }
            const input1State = this.input1View.editor.saveViewState() ?? undefined;
            const input2State = this.input2View.editor.saveViewState() ?? undefined;
            const focusIndex = [this.input1View.editor, this.input2View.editor, this.inputResultView.editor].findIndex(editor => editor.hasWidgetFocus());
            return { ...result, input1State, input2State, focusIndex };
        }
        tracksEditorViewState(input) {
            return input instanceof mergeEditorInput_1.MergeEditorInput;
        }
        toggleShowNonConflictingChanges() {
            this.showNonConflictingChanges.set(!this.showNonConflictingChanges.get(), undefined);
            this.showNonConflictingChangesStore.set(this.showNonConflictingChanges.get());
            this._ctxShowNonConflictingChanges.set(this.showNonConflictingChanges.get());
        }
    };
    exports.MergeEditor = MergeEditor;
    exports.MergeEditor = MergeEditor = MergeEditor_1 = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, contextkey_1.IContextKeyService),
        __param(2, telemetry_1.ITelemetryService),
        __param(3, storage_1.IStorageService),
        __param(4, themeService_1.IThemeService),
        __param(5, textResourceConfiguration_1.ITextResourceConfigurationService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, editorService_1.IEditorService),
        __param(8, editorGroupsService_1.IEditorGroupsService),
        __param(9, files_1.IFileService),
        __param(10, codeEditorService_1.ICodeEditorService),
        __param(11, configuration_1.IConfigurationService)
    ], MergeEditor);
    // TODO use PersistentStore
    let MergeEditorLayoutStore = class MergeEditorLayoutStore {
        static { MergeEditorLayoutStore_1 = this; }
        static { this._key = 'mergeEditor/layout'; }
        constructor(_storageService) {
            this._storageService = _storageService;
            this._value = { kind: 'mixed', showBase: false, showBaseAtTop: true };
            const value = _storageService.get(MergeEditorLayoutStore_1._key, 0 /* StorageScope.PROFILE */, 'mixed');
            if (value === 'mixed' || value === 'columns') {
                this._value = { kind: value, showBase: false, showBaseAtTop: true };
            }
            else if (value) {
                try {
                    this._value = JSON.parse(value);
                }
                catch (e) {
                    (0, errors_1.onUnexpectedError)(e);
                }
            }
        }
        get value() {
            return this._value;
        }
        set value(value) {
            if (this._value !== value) {
                this._value = value;
                this._storageService.store(MergeEditorLayoutStore_1._key, JSON.stringify(this._value), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            }
        }
    };
    MergeEditorLayoutStore = MergeEditorLayoutStore_1 = __decorate([
        __param(0, storage_1.IStorageService)
    ], MergeEditorLayoutStore);
    let MergeEditorOpenHandlerContribution = class MergeEditorOpenHandlerContribution extends lifecycle_1.Disposable {
        constructor(_editorService, codeEditorService) {
            super();
            this._editorService = _editorService;
            this._store.add(codeEditorService.registerCodeEditorOpenHandler(this.openCodeEditorFromMergeEditor.bind(this)));
        }
        async openCodeEditorFromMergeEditor(input, _source, sideBySide) {
            const activePane = this._editorService.activeEditorPane;
            if (!sideBySide
                && input.options
                && activePane instanceof MergeEditor
                && activePane.getControl()
                && activePane.input instanceof mergeEditorInput_1.MergeEditorInput
                && (0, resources_1.isEqual)(input.resource, activePane.input.result)) {
                // Special: stay inside the merge editor when it is active and when the input
                // targets the result editor of the merge editor.
                const targetEditor = activePane.getControl();
                (0, editorOptions_1.applyTextEditorOptions)(input.options, targetEditor, 0 /* ScrollType.Smooth */);
                return targetEditor;
            }
            // cannot handle this
            return null;
        }
    };
    exports.MergeEditorOpenHandlerContribution = MergeEditorOpenHandlerContribution;
    exports.MergeEditorOpenHandlerContribution = MergeEditorOpenHandlerContribution = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, codeEditorService_1.ICodeEditorService)
    ], MergeEditorOpenHandlerContribution);
    let MergeEditorResolverContribution = class MergeEditorResolverContribution extends lifecycle_1.Disposable {
        constructor(editorResolverService, instantiationService) {
            super();
            const mergeEditorInputFactory = (mergeEditor) => {
                return {
                    editor: instantiationService.createInstance(mergeEditorInput_1.MergeEditorInput, mergeEditor.base.resource, {
                        uri: mergeEditor.input1.resource,
                        title: mergeEditor.input1.label ?? (0, resources_1.basename)(mergeEditor.input1.resource),
                        description: mergeEditor.input1.description ?? '',
                        detail: mergeEditor.input1.detail
                    }, {
                        uri: mergeEditor.input2.resource,
                        title: mergeEditor.input2.label ?? (0, resources_1.basename)(mergeEditor.input2.resource),
                        description: mergeEditor.input2.description ?? '',
                        detail: mergeEditor.input2.detail
                    }, mergeEditor.result.resource)
                };
            };
            this._register(editorResolverService.registerEditor(`*`, {
                id: editor_1.DEFAULT_EDITOR_ASSOCIATION.id,
                label: editor_1.DEFAULT_EDITOR_ASSOCIATION.displayName,
                detail: editor_1.DEFAULT_EDITOR_ASSOCIATION.providerDisplayName,
                priority: editorResolverService_1.RegisteredEditorPriority.builtin
            }, {}, {
                createMergeEditorInput: mergeEditorInputFactory
            }));
        }
    };
    exports.MergeEditorResolverContribution = MergeEditorResolverContribution;
    exports.MergeEditorResolverContribution = MergeEditorResolverContribution = __decorate([
        __param(0, editorResolverService_1.IEditorResolverService),
        __param(1, instantiation_1.IInstantiationService)
    ], MergeEditorResolverContribution);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVyZ2VFZGl0b3IuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9tZXJnZUVkaXRvci9icm93c2VyL3ZpZXcvbWVyZ2VFZGl0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQW9EekYsSUFBTSxXQUFXLEdBQWpCLE1BQU0sV0FBWSxTQUFRLCtCQUF5Qzs7aUJBRXpELE9BQUUsR0FBRyxhQUFhLEFBQWhCLENBQWlCO1FBS25DLElBQVcsU0FBUztZQUNuQixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDeEIsQ0FBQztRQW9CRCxJQUFXLFVBQVU7WUFDcEIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ3pCLENBQUM7UUFDRCxJQUFXLEtBQUs7WUFDZixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLEVBQUUsS0FBSyxDQUFDO1FBQ3JDLENBQUM7UUFFRCxJQUFZLGNBQWM7WUFDekIsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsQ0FBVSw0QkFBNEIsQ0FBQyxDQUFDO1FBQ3JGLENBQUM7UUFnQkQsWUFDd0IsYUFBb0MsRUFDdkMsaUJBQXNELEVBQ3ZELGdCQUFtQyxFQUNyQyxjQUErQixFQUNqQyxZQUEyQixFQUNQLGdDQUFtRSxFQUMvRSxxQkFBNkQsRUFDcEUsYUFBNkIsRUFDdkIsa0JBQXdDLEVBQ2hELFdBQXlCLEVBQ25CLGtCQUF1RCxFQUNwRCxvQkFBNEQ7WUFFbkYsS0FBSyxDQUFDLGFBQVcsQ0FBQyxFQUFFLEVBQUUsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFLGNBQWMsRUFBRSxnQ0FBZ0MsRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLGtCQUFrQixFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBWmxJLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFL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