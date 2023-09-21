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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/grid/grid", "vs/base/common/color", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/base/common/resources", "vs/base/common/types", "vs/editor/browser/services/codeEditorService", "vs/editor/common/services/textResourceConfiguration", "vs/nls!vs/workbench/contrib/mergeEditor/browser/view/mergeEditor", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/editor/textEditor", "vs/workbench/common/editor", "vs/workbench/common/editor/editorOptions", "vs/workbench/contrib/codeEditor/browser/toggleWordWrap", "vs/workbench/contrib/mergeEditor/browser/mergeEditorInput", "vs/workbench/contrib/mergeEditor/browser/utils", "vs/workbench/contrib/mergeEditor/browser/view/editors/baseCodeEditorView", "vs/workbench/contrib/mergeEditor/browser/view/scrollSynchronizer", "vs/workbench/contrib/mergeEditor/browser/view/viewModel", "vs/workbench/contrib/mergeEditor/browser/view/viewZones", "vs/workbench/contrib/mergeEditor/common/mergeEditor", "vs/workbench/contrib/preferences/common/settingsEditorColorRegistry", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/services/editor/common/editorService", "./editors/inputCodeEditorView", "./editors/resultCodeEditorView", "vs/css!./media/mergeEditor", "./colors"], function (require, exports, dom_1, grid_1, color_1, errors_1, event_1, lifecycle_1, observable_1, resources_1, types_1, codeEditorService_1, textResourceConfiguration_1, nls_1, configuration_1, contextkey_1, files_1, instantiation_1, storage_1, telemetry_1, themeService_1, textEditor_1, editor_1, editorOptions_1, toggleWordWrap_1, mergeEditorInput_1, utils_1, baseCodeEditorView_1, scrollSynchronizer_1, viewModel_1, viewZones_1, mergeEditor_1, settingsEditorColorRegistry_1, editorGroupsService_1, editorResolverService_1, editorService_1, inputCodeEditorView_1, resultCodeEditorView_1) {
    "use strict";
    var $YSb_1, MergeEditorLayoutStore_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$1Sb = exports.$ZSb = exports.$YSb = void 0;
    let $YSb = class $YSb extends textEditor_1.$oeb {
        static { $YSb_1 = this; }
        static { this.ID = 'mergeEditor'; }
        get viewModel() {
            return this.f;
        }
        get inputModel() {
            return this.gc;
        }
        get model() {
            return this.inputModel.get()?.model;
        }
        get hc() {
            return !!this.mc.getValue('mergeEditor.writableInputs');
        }
        constructor(instantiation, lc, telemetryService, storageService, themeService, textResourceConfigurationService, mc, editorService, editorGroupService, fileService, nc, oc) {
            super($YSb_1.ID, telemetryService, instantiation, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService, fileService);
            this.lc = lc;
            this.mc = mc;
            this.nc = nc;
            this.oc = oc;
            this.c = new lifecycle_1.$jc();
            this.f = (0, observable_1.observableValue)(this, undefined);
            this.Sb = this.B(new lifecycle_1.$lc());
            this.Tb = this.B(this.m.createInstance(inputCodeEditorView_1.$1jb, 1, this.f));
            this.Ub = (0, observable_1.observableValue)(this, undefined);
            this.Vb = (0, observable_1.observableValue)(this, undefined);
            this.Wb = this.B(this.m.createInstance(inputCodeEditorView_1.$1jb, 2, this.f));
            this.Xb = this.B(this.m.createInstance(resultCodeEditorView_1.$akb, this.f));
            this.Yb = this.m.createInstance(MergeEditorLayoutStore);
            this.Zb = (0, observable_1.observableValue)(this, this.Yb.value);
            this.$b = mergeEditor_1.$4jb.bindTo(this.lc);
            this.ac = mergeEditor_1.$6jb.bindTo(this.lc);
            this.bc = mergeEditor_1.$7jb.bindTo(this.lc);
            this.cc = mergeEditor_1.$8jb.bindTo(this.lc);
            this.dc = mergeEditor_1.$$jb.bindTo(this.lc);
            this.ec = mergeEditor_1.$0jb.bindTo(this.lc);
            this.fc = mergeEditor_1.$9jb.bindTo(this.lc);
            this.gc = (0, observable_1.observableValue)(this, undefined);
            this.ic = new viewZones_1.$VSb(this.Tb.editor, this.Wb.editor, this.Xb.editor);
            this.jc = (0, utils_1.$fjb)('mergeEditor.showCodeLenses', true, this.oc);
            this.kc = this.B(new scrollSynchronizer_1.$QSb(this.f, this.Tb, this.Wb, this.Ub, this.Xb, this.Zb));
            // #region layout constraints
            this.pc = new event_1.$fd();
            this.onDidChangeSizeConstraints = this.pc.event;
            this.wc = this.B(new lifecycle_1.$jc());
            this.Cc = this.m.createInstance((utils_1.$ejb), 'mergeEditor/showNonConflictingChanges');
            this.Dc = (0, observable_1.observableValue)(this, this.Cc.get() ?? false);
        }
        dispose() {
            this.c.dispose();
            this.$b.reset();
            this.ac.reset();
            this.fc.reset();
            super.dispose();
        }
        get minimumWidth() {
            return this.Yb.value.kind === 'mixed'
                ? this.Tb.view.minimumWidth + this.Wb.view.minimumWidth
                : this.Tb.view.minimumWidth + this.Wb.view.minimumWidth + this.Xb.view.minimumWidth;
        }
        // #endregion
        getTitle() {
            if (this.input) {
                return this.input.getName();
            }
            return (0, nls_1.localize)(0, null);
        }
        Lb(parent, initialOptions) {
            this.$ = parent;
            parent.classList.add('merge-editor');
            this.xc(this.Yb.value);
            this.sc(initialOptions);
        }
        Mb(options) {
            this.sc(options);
        }
        sc(options) {
            const inputOptions = (0, utils_1.$djb)(options, {
                minimap: { enabled: false },
                glyphMargin: false,
                lineNumbersMinChars: 2,
                readOnly: !this.hc
            });
            this.Tb.updateOptions(inputOptions);
            this.Wb.updateOptions(inputOptions);
            this.Vb.set({ ...this.Wb.editor.getRawOptions() }, undefined);
            this.Xb.updateOptions(options);
        }
        Nb() {
            return this.Xb.editor;
        }
        layout(dimension) {
            this.Sb.value?.layout(dimension.width, dimension.height);
        }
        async setInput(input, options, context, token) {
            if (!(input instanceof mergeEditorInput_1.$hkb)) {
                throw new errors_1.$ab('ONLY MergeEditorInput is supported');
            }
            await super.setInput(input, options, context, token);
            this.c.clear();
            (0, observable_1.transaction)(tx => {
                this.f.set(undefined, tx);
                this.gc.set(undefined, tx);
            });
            const inputModel = await input.resolve();
            const model = inputModel.model;
            const viewModel = this.m.createInstance(viewModel_1.$bkb, model, this.Tb, this.Wb, this.Xb, this.Ub, this.Dc);
            model.telemetry.reportMergeEditorOpened({
                combinableConflictCount: model.combinableConflictCount,
                conflictCount: model.conflictCount,
                baseTop: this.Zb.get().showBaseAtTop,
                baseVisible: this.Zb.get().showBase,
                isColumnView: this.Zb.get().kind === 'columns',
            });
            (0, observable_1.transaction)(tx => {
                this.f.set(viewModel, tx);
                this.gc.set(inputModel, tx);
            });
            this.c.add(viewModel);
            // Set/unset context keys based on input
            this.dc.set(inputModel.resultUri.toString());
            this.ec.set(model.base.uri.toString());
            this.c.add((0, lifecycle_1.$ic)(() => {
                this.ec.reset();
                this.dc.reset();
            }));
            // Set the view zones before restoring view state!
            // Otherwise scrolling will be off
            this.c.add((0, observable_1.autorunWithStore)((reader, store) => {
                /** @description update alignment view zones */
                const baseView = this.Ub.read(reader);
                this.Xb.editor.changeViewZones(resultViewZoneAccessor => {
                    const layout = this.Zb.read(reader);
                    const shouldAlignResult = layout.kind === 'columns';
                    const shouldAlignBase = layout.kind === 'mixed' && !layout.showBaseAtTop;
                    this.Tb.editor.changeViewZones(input1ViewZoneAccessor => {
                        this.Wb.editor.changeViewZones(input2ViewZoneAccessor => {
                            if (baseView) {
                                baseView.editor.changeViewZones(baseViewZoneAccessor => {
                                    store.add(this.uc(reader, viewModel, this.Tb.editor, input1ViewZoneAccessor, this.Wb.editor, input2ViewZoneAccessor, baseView.editor, baseViewZoneAccessor, shouldAlignBase, this.Xb.editor, resultViewZoneAccessor, shouldAlignResult));
                                });
                            }
                            else {
                                store.add(this.uc(reader, viewModel, this.Tb.editor, input1ViewZoneAccessor, this.Wb.editor, input2ViewZoneAccessor, undefined, undefined, false, this.Xb.editor, resultViewZoneAccessor, shouldAlignResult));
                            }
                        });
                    });
                });
                this.kc.updateScrolling();
            }));
            const viewState = this.kb(input, context);
            if (viewState) {
                this.zc(viewState);
            }
            else {
                this.c.add((0, utils_1.$bjb)(model.onInitialized, () => {
                    const firstConflict = model.modifiedBaseRanges.get().find(r => r.isConflicting);
                    if (!firstConflict) {
                        return;
                    }
                    this.Tb.editor.revealLineInCenter(firstConflict.input1Range.startLineNumber);
                    (0, observable_1.transaction)(tx => {
                        /** @description setActiveModifiedBaseRange */
                        viewModel.setActiveModifiedBaseRange(firstConflict, tx);
                    });
                }));
            }
            // word wrap special case - sync transient state from result model to input[1|2] models
            const mirrorWordWrapTransientState = (candidate) => {
                const candidateState = (0, toggleWordWrap_1.$Onb)(candidate, this.nc);
                (0, toggleWordWrap_1.$Nnb)(model.input2.textModel, candidateState, this.nc);
                (0, toggleWordWrap_1.$Nnb)(model.input1.textModel, candidateState, this.nc);
                (0, toggleWordWrap_1.$Nnb)(model.resultTextModel, candidateState, this.nc);
                const baseTextModel = this.Ub.get()?.editor.getModel();
                if (baseTextModel) {
                    (0, toggleWordWrap_1.$Nnb)(baseTextModel, candidateState, this.nc);
                }
            };
            this.c.add(this.nc.onDidChangeTransientModelProperty(candidate => {
                mirrorWordWrapTransientState(candidate);
            }));
            mirrorWordWrapTransientState(this.Xb.editor.getModel());
            // detect when base, input1, and input2 become empty and replace THIS editor with its result editor
            // TODO@jrieken@hediet this needs a better/cleaner solution
            // https://github.com/microsoft/vscode/issues/155940
            const that = this;
            this.c.add(new class {
                constructor() {
                    this.b = new lifecycle_1.$jc();
                    for (const model of this.c()) {
                        this.b.add(model.onDidChangeContent(() => this.d()));
                    }
                }
                dispose() {
                    this.b.dispose();
                }
                *c() {
                    yield model.base;
                    yield model.input1.textModel;
                    yield model.input2.textModel;
                }
                d() {
                    for (const model of this.c()) {
                        if (model.getValueLength() > 0) {
                            return;
                        }
                    }
                    // all empty -> replace this editor with a normal editor for result
                    that.u.replaceEditors([{ editor: input, replacement: { resource: input.result, options: { preserveFocus: true } }, forceReplaceDirty: true }], that.group ?? that.y.activeGroup);
                }
            });
        }
        uc(reader, viewModel, input1Editor, input1ViewZoneAccessor, input2Editor, input2ViewZoneAccessor, baseEditor, baseViewZoneAccessor, shouldAlignBase, resultEditor, resultViewZoneAccessor, shouldAlignResult) {
            const input1ViewZoneIds = [];
            const input2ViewZoneIds = [];
            const baseViewZoneIds = [];
            const resultViewZoneIds = [];
            const viewZones = this.ic.computeViewZones(reader, viewModel, {
                codeLensesVisible: this.jc.read(reader),
                showNonConflictingChanges: this.Dc.read(reader),
                shouldAlignBase,
                shouldAlignResult,
            });
            const disposableStore = new lifecycle_1.$jc();
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
                (0, editorOptions_1.applyTextEditorOptions)(options, this.Xb.editor, 0 /* ScrollType.Smooth */);
            }
        }
        clearInput() {
            super.clearInput();
            this.c.clear();
            for (const { editor } of [this.Tb, this.Wb, this.Xb]) {
                editor.setModel(null);
            }
        }
        focus() {
            (this.getControl() ?? this.Xb.editor).focus();
        }
        hasFocus() {
            for (const { editor } of [this.Tb, this.Wb, this.Xb]) {
                if (editor.hasTextFocus()) {
                    return true;
                }
            }
            return super.hasFocus();
        }
        bb(visible, group) {
            super.bb(visible, group);
            for (const { editor } of [this.Tb, this.Wb, this.Xb]) {
                if (visible) {
                    editor.onVisible();
                }
                else {
                    editor.onHide();
                }
            }
            this.$b.set(visible);
        }
        // ---- interact with "outside world" via`getControl`, `scopedContextKeyService`: we only expose the result-editor keep the others internal
        getControl() {
            return this.Xb.editor;
        }
        get scopedContextKeyService() {
            const control = this.getControl();
            return control?.invokeWithinContext(accessor => accessor.get(contextkey_1.$3i));
        }
        // --- layout
        toggleBase() {
            this.setLayout({
                ...this.Yb.value,
                showBase: !this.Yb.value.showBase
            });
        }
        toggleShowBaseTop() {
            const showBaseTop = this.Yb.value.showBase && this.Yb.value.showBaseAtTop;
            this.setLayout({
                ...this.Yb.value,
                showBaseAtTop: true,
                showBase: !showBaseTop,
            });
        }
        toggleShowBaseCenter() {
            const showBaseCenter = this.Yb.value.showBase && !this.Yb.value.showBaseAtTop;
            this.setLayout({
                ...this.Yb.value,
                showBaseAtTop: false,
                showBase: !showBaseCenter,
            });
        }
        setLayoutKind(kind) {
            this.setLayout({
                ...this.Yb.value,
                kind
            });
        }
        setLayout(newLayout) {
            const value = this.Yb.value;
            if (JSON.stringify(value) === JSON.stringify(newLayout)) {
                return;
            }
            this.model?.telemetry.reportLayoutChange({
                baseTop: newLayout.showBaseAtTop,
                baseVisible: newLayout.showBase,
                isColumnView: newLayout.kind === 'columns',
            });
            this.xc(newLayout);
        }
        xc(layout) {
            (0, observable_1.transaction)(tx => {
                /** @description applyLayout */
                if (layout.showBase && !this.Ub.get()) {
                    this.wc.clear();
                    const baseView = this.wc.add(this.m.createInstance(baseCodeEditorView_1.$Zjb, this.viewModel));
                    this.wc.add((0, observable_1.autorun)(reader => {
                        /** @description Update base view options */
                        const options = this.Vb.read(reader);
                        if (options) {
                            baseView.updateOptions(options);
                        }
                    }));
                    this.Ub.set(baseView, tx);
                }
                else if (!layout.showBase && this.Ub.get()) {
                    this.Ub.set(undefined, tx);
                    this.wc.clear();
                }
                if (layout.kind === 'mixed') {
                    this.yc([
                        layout.showBaseAtTop && layout.showBase ? {
                            size: 38,
                            data: this.Ub.get().view
                        } : undefined,
                        {
                            size: 38,
                            groups: [
                                { data: this.Tb.view },
                                !layout.showBaseAtTop && layout.showBase ? { data: this.Ub.get().view } : undefined,
                                { data: this.Wb.view }
                            ].filter(types_1.$rf)
                        },
                        {
                            size: 62,
                            data: this.Xb.view
                        },
                    ].filter(types_1.$rf));
                }
                else if (layout.kind === 'columns') {
                    this.yc([
                        layout.showBase ? {
                            size: 40,
                            data: this.Ub.get().view
                        } : undefined,
                        {
                            size: 60,
                            groups: [{ data: this.Tb.view }, { data: this.Xb.view }, { data: this.Wb.view }]
                        },
                    ].filter(types_1.$rf));
                }
                this.Yb.value = layout;
                this.ac.set(layout.kind);
                this.bc.set(layout.showBase);
                this.cc.set(layout.showBaseAtTop);
                this.pc.fire();
                this.Zb.set(layout, tx);
            });
        }
        yc(descriptor) {
            let width = -1;
            let height = -1;
            if (this.Sb.value) {
                width = this.Sb.value.width;
                height = this.Sb.value.height;
            }
            this.Sb.value = grid_1.$iR.from({
                orientation: 0 /* Orientation.VERTICAL */,
                size: 100,
                groups: descriptor,
            }, {
                styles: { separatorBorder: this.h.getColor(settingsEditorColorRegistry_1.$3Cb) ?? color_1.$Os.transparent },
                proportionalLayout: true
            });
            (0, dom_1.$_O)(this.$, this.Sb.value.element);
            // Only call layout after the elements have been added to the DOM,
            // so that they have a defined size.
            if (width !== -1) {
                this.Sb.value.layout(width, height);
            }
        }
        zc(state) {
            if (!state) {
                return;
            }
            this.Xb.editor.restoreViewState(state);
            if (state.input1State) {
                this.Tb.editor.restoreViewState(state.input1State);
            }
            if (state.input2State) {
                this.Wb.editor.restoreViewState(state.input2State);
            }
            if (state.focusIndex >= 0) {
                [this.Tb.editor, this.Wb.editor, this.Xb.editor][state.focusIndex].focus();
            }
        }
        nb(resource) {
            if (!(0, resources_1.$bg)(this.inputModel.get()?.resultUri, resource)) {
                return undefined;
            }
            const result = this.Xb.editor.saveViewState();
            if (!result) {
                return undefined;
            }
            const input1State = this.Tb.editor.saveViewState() ?? undefined;
            const input2State = this.Wb.editor.saveViewState() ?? undefined;
            const focusIndex = [this.Tb.editor, this.Wb.editor, this.Xb.editor].findIndex(editor => editor.hasWidgetFocus());
            return { ...result, input1State, input2State, focusIndex };
        }
        ob(input) {
            return input instanceof mergeEditorInput_1.$hkb;
        }
        toggleShowNonConflictingChanges() {
            this.Dc.set(!this.Dc.get(), undefined);
            this.Cc.set(this.Dc.get());
            this.fc.set(this.Dc.get());
        }
    };
    exports.$YSb = $YSb;
    exports.$YSb = $YSb = $YSb_1 = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, contextkey_1.$3i),
        __param(2, telemetry_1.$9k),
        __param(3, storage_1.$Vo),
        __param(4, themeService_1.$gv),
        __param(5, textResourceConfiguration_1.$FA),
        __param(6, configuration_1.$8h),
        __param(7, editorService_1.$9C),
        __param(8, editorGroupsService_1.$5C),
        __param(9, files_1.$6j),
        __param(10, codeEditorService_1.$nV),
        __param(11, configuration_1.$8h)
    ], $YSb);
    // TODO use PersistentStore
    let MergeEditorLayoutStore = class MergeEditorLayoutStore {
        static { MergeEditorLayoutStore_1 = this; }
        static { this.b = 'mergeEditor/layout'; }
        constructor(d) {
            this.d = d;
            this.c = { kind: 'mixed', showBase: false, showBaseAtTop: true };
            const value = d.get(MergeEditorLayoutStore_1.b, 0 /* StorageScope.PROFILE */, 'mixed');
            if (value === 'mixed' || value === 'columns') {
                this.c = { kind: value, showBase: false, showBaseAtTop: true };
            }
            else if (value) {
                try {
                    this.c = JSON.parse(value);
                }
                catch (e) {
                    (0, errors_1.$Y)(e);
                }
            }
        }
        get value() {
            return this.c;
        }
        set value(value) {
            if (this.c !== value) {
                this.c = value;
                this.d.store(MergeEditorLayoutStore_1.b, JSON.stringify(this.c), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            }
        }
    };
    MergeEditorLayoutStore = MergeEditorLayoutStore_1 = __decorate([
        __param(0, storage_1.$Vo)
    ], MergeEditorLayoutStore);
    let $ZSb = class $ZSb extends lifecycle_1.$kc {
        constructor(b, codeEditorService) {
            super();
            this.b = b;
            this.q.add(codeEditorService.registerCodeEditorOpenHandler(this.c.bind(this)));
        }
        async c(input, _source, sideBySide) {
            const activePane = this.b.activeEditorPane;
            if (!sideBySide
                && input.options
                && activePane instanceof $YSb
                && activePane.getControl()
                && activePane.input instanceof mergeEditorInput_1.$hkb
                && (0, resources_1.$bg)(input.resource, activePane.input.result)) {
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
    exports.$ZSb = $ZSb;
    exports.$ZSb = $ZSb = __decorate([
        __param(0, editorService_1.$9C),
        __param(1, codeEditorService_1.$nV)
    ], $ZSb);
    let $1Sb = class $1Sb extends lifecycle_1.$kc {
        constructor(editorResolverService, instantiationService) {
            super();
            const mergeEditorInputFactory = (mergeEditor) => {
                return {
                    editor: instantiationService.createInstance(mergeEditorInput_1.$hkb, mergeEditor.base.resource, {
                        uri: mergeEditor.input1.resource,
                        title: mergeEditor.input1.label ?? (0, resources_1.$fg)(mergeEditor.input1.resource),
                        description: mergeEditor.input1.description ?? '',
                        detail: mergeEditor.input1.detail
                    }, {
                        uri: mergeEditor.input2.resource,
                        title: mergeEditor.input2.label ?? (0, resources_1.$fg)(mergeEditor.input2.resource),
                        description: mergeEditor.input2.description ?? '',
                        detail: mergeEditor.input2.detail
                    }, mergeEditor.result.resource)
                };
            };
            this.B(editorResolverService.registerEditor(`*`, {
                id: editor_1.$HE.id,
                label: editor_1.$HE.displayName,
                detail: editor_1.$HE.providerDisplayName,
                priority: editorResolverService_1.RegisteredEditorPriority.builtin
            }, {}, {
                createMergeEditorInput: mergeEditorInputFactory
            }));
        }
    };
    exports.$1Sb = $1Sb;
    exports.$1Sb = $1Sb = __decorate([
        __param(0, editorResolverService_1.$pbb),
        __param(1, instantiation_1.$Ah)
    ], $1Sb);
});
//# sourceMappingURL=mergeEditor.js.map