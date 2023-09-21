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
define(["require", "exports", "vs/base/common/assert", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/base/common/resources", "vs/base/common/severity", "vs/editor/common/services/model", "vs/editor/common/services/resolverService", "vs/nls!vs/workbench/contrib/mergeEditor/browser/mergeEditorInputModel", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/workbench/common/editor", "vs/workbench/common/editor/editorModel", "vs/workbench/contrib/mergeEditor/browser/mergeMarkers/mergeMarkersController", "vs/workbench/contrib/mergeEditor/browser/model/diffComputer", "vs/workbench/contrib/mergeEditor/browser/model/mergeEditorModel", "vs/workbench/contrib/mergeEditor/common/mergeEditor", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/textfile/common/textfiles"], function (require, exports, assert_1, errors_1, event_1, lifecycle_1, observable_1, resources_1, severity_1, model_1, resolverService_1, nls_1, dialogs_1, instantiation_1, storage_1, editor_1, editorModel_1, mergeMarkersController_1, diffComputer_1, mergeEditorModel_1, mergeEditor_1, editorService_1, textfiles_1) {
    "use strict";
    var $fkb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$fkb = exports.$ekb = void 0;
    /* ================ Temp File ================ */
    let $ekb = class $ekb {
        constructor(a, b, c, d) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
        }
        async createInputModel(args) {
            const store = new lifecycle_1.$jc();
            const [base, result, input1Data, input2Data,] = await Promise.all([
                this.c.createModelReference(args.base),
                this.c.createModelReference(args.result),
                toInputData(args.input1, this.c, store),
                toInputData(args.input2, this.c, store),
            ]);
            store.add(base);
            store.add(result);
            const tempResultUri = result.object.textEditorModel.uri.with({ scheme: 'merge-result' });
            const temporaryResultModel = this.d.createModel('', {
                languageId: result.object.textEditorModel.getLanguageId(),
                onDidChange: event_1.Event.None,
            }, tempResultUri);
            store.add(temporaryResultModel);
            const mergeDiffComputer = this.b.createInstance(diffComputer_1.$ujb);
            const model = this.b.createInstance(mergeEditorModel_1.$Hjb, base.object.textEditorModel, input1Data, input2Data, temporaryResultModel, mergeDiffComputer, {
                resetResult: true,
            }, this.a);
            store.add(model);
            await model.onInitialized;
            return this.b.createInstance(TempFileMergeEditorInputModel, model, store, result.object, args.result);
        }
    };
    exports.$ekb = $ekb;
    exports.$ekb = $ekb = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, resolverService_1.$uA),
        __param(3, model_1.$yA)
    ], $ekb);
    let TempFileMergeEditorInputModel = class TempFileMergeEditorInputModel extends editorModel_1.$xA {
        constructor(model, g, n, resultUri, r, s, t) {
            super();
            this.model = model;
            this.g = g;
            this.n = n;
            this.resultUri = resultUri;
            this.r = r;
            this.s = s;
            this.t = t;
            this.a = (0, observable_1.observableValue)(this, this.model.resultTextModel.getAlternativeVersionId());
            this.b = (0, observable_1.observableFromEvent)(e => this.model.resultTextModel.onDidChangeContent(e), () => 
            /** @description getAlternativeVersionId */ this.model.resultTextModel.getAlternativeVersionId());
            this.isDirty = (0, observable_1.derived)(this, (reader) => this.b.read(reader) !== this.a.read(reader));
            this.c = false;
        }
        dispose() {
            this.g.dispose();
            super.dispose();
        }
        async accept() {
            const value = await this.model.resultTextModel.getValue();
            this.n.textEditorModel.setValue(value);
            this.a.set(this.model.resultTextModel.getAlternativeVersionId(), undefined);
            await this.r.save(this.n.textEditorModel.uri);
            this.c = true;
        }
        async u() {
            await this.r.revert(this.model.resultTextModel.uri);
            this.a.set(this.model.resultTextModel.getAlternativeVersionId(), undefined);
            this.c = true;
        }
        shouldConfirmClose() {
            return true;
        }
        async confirmClose(inputModels) {
            (0, assert_1.$xc)(() => inputModels.some((m) => m === this));
            const someDirty = inputModels.some((m) => m.isDirty.get());
            let choice;
            if (someDirty) {
                const isMany = inputModels.length > 1;
                const message = isMany
                    ? (0, nls_1.localize)(0, null, inputModels.length)
                    : (0, nls_1.localize)(1, null, (0, resources_1.$fg)(inputModels[0].model.resultTextModel.uri));
                const hasUnhandledConflicts = inputModels.some((m) => m.model.hasUnhandledConflicts.get());
                const buttons = [
                    {
                        label: hasUnhandledConflicts ?
                            (0, nls_1.localize)(2, null) :
                            (0, nls_1.localize)(3, null),
                        run: () => 0 /* ConfirmResult.SAVE */
                    },
                    {
                        label: (0, nls_1.localize)(4, null),
                        run: () => 1 /* ConfirmResult.DONT_SAVE */
                    }
                ];
                choice = (await this.s.prompt({
                    type: severity_1.default.Info,
                    message,
                    detail: hasUnhandledConflicts
                        ? isMany
                            ? (0, nls_1.localize)(5, null)
                            : (0, nls_1.localize)(6, null)
                        : isMany
                            ? (0, nls_1.localize)(7, null)
                            : (0, nls_1.localize)(8, null),
                    buttons,
                    cancelButton: {
                        run: () => 2 /* ConfirmResult.CANCEL */
                    }
                })).result;
            }
            else {
                choice = 1 /* ConfirmResult.DONT_SAVE */;
            }
            if (choice === 0 /* ConfirmResult.SAVE */) {
                // save with conflicts
                await Promise.all(inputModels.map(m => m.accept()));
            }
            else if (choice === 1 /* ConfirmResult.DONT_SAVE */) {
                // discard changes
                await Promise.all(inputModels.map(m => m.u()));
            }
            else {
                // cancel: stay in editor
            }
            return choice;
        }
        async save(options) {
            if (this.c) {
                return;
            }
            // It does not make sense to save anything in the temp file mode.
            // The file stays dirty from the first edit on.
            (async () => {
                const { confirmed } = await this.s.confirm({
                    message: (0, nls_1.localize)(9, null),
                    detail: (0, nls_1.localize)(10, null),
                    primaryButton: (0, nls_1.localize)(11, null)
                });
                if (confirmed) {
                    await this.accept();
                    const editors = this.t.findEditors(this.resultUri).filter(e => e.editor.typeId === 'mergeEditor.Input');
                    await this.t.closeEditors(editors);
                }
            })();
        }
        async revert(options) {
            // no op
        }
    };
    TempFileMergeEditorInputModel = __decorate([
        __param(4, textfiles_1.$JD),
        __param(5, dialogs_1.$oA),
        __param(6, editorService_1.$9C)
    ], TempFileMergeEditorInputModel);
    /* ================ Workspace ================ */
    let $fkb = class $fkb {
        static { $fkb_1 = this; }
        constructor(a, b, c, d) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
        }
        static { this.f = editor_1.$SE.registerSource('merge-editor.source', (0, nls_1.localize)(12, null)); }
        async createInputModel(args) {
            const store = new lifecycle_1.$jc();
            let resultTextFileModel = undefined;
            const modelListener = store.add(new lifecycle_1.$jc());
            const handleDidCreate = (model) => {
                if ((0, resources_1.$bg)(args.result, model.resource)) {
                    modelListener.clear();
                    resultTextFileModel = model;
                }
            };
            modelListener.add(this.d.files.onDidCreate(handleDidCreate));
            this.d.files.models.forEach(handleDidCreate);
            const [base, result, input1Data, input2Data,] = await Promise.all([
                this.c.createModelReference(args.base),
                this.c.createModelReference(args.result),
                toInputData(args.input1, this.c, store),
                toInputData(args.input2, this.c, store),
            ]);
            store.add(base);
            store.add(result);
            if (!resultTextFileModel) {
                throw new errors_1.$ab();
            }
            // So that "Don't save" does revert the file
            await resultTextFileModel.save({ source: $fkb_1.f });
            const lines = resultTextFileModel.textEditorModel.getLinesContent();
            const hasConflictMarkers = lines.some(l => l.startsWith(mergeMarkersController_1.$ckb.start));
            const resetResult = hasConflictMarkers;
            const mergeDiffComputer = this.b.createInstance(diffComputer_1.$ujb);
            const model = this.b.createInstance(mergeEditorModel_1.$Hjb, base.object.textEditorModel, input1Data, input2Data, result.object.textEditorModel, mergeDiffComputer, {
                resetResult
            }, this.a);
            store.add(model);
            await model.onInitialized;
            return this.b.createInstance(WorkspaceMergeEditorInputModel, model, store, resultTextFileModel, this.a);
        }
    };
    exports.$fkb = $fkb;
    exports.$fkb = $fkb = $fkb_1 = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, resolverService_1.$uA),
        __param(3, textfiles_1.$JD)
    ], $fkb);
    let WorkspaceMergeEditorInputModel = class WorkspaceMergeEditorInputModel extends editorModel_1.$xA {
        constructor(model, c, g, n, r, s) {
            super();
            this.model = model;
            this.c = c;
            this.g = g;
            this.n = n;
            this.r = r;
            this.s = s;
            this.isDirty = (0, observable_1.observableFromEvent)(event_1.Event.any(this.g.onDidChangeDirty, this.g.onDidSaveError), () => /** @description isDirty */ this.g.isDirty());
            this.a = false;
            this.b = new Date();
        }
        dispose() {
            this.c.dispose();
            super.dispose();
            this.t(false);
        }
        t(accepted) {
            if (!this.a) {
                const remainingConflictCount = this.model.unhandledConflictsCount.get();
                const durationOpenedMs = new Date().getTime() - this.b.getTime();
                this.n.reportMergeEditorClosed({
                    durationOpenedSecs: durationOpenedMs / 1000,
                    remainingConflictCount,
                    accepted,
                    conflictCount: this.model.conflictCount,
                    combinableConflictCount: this.model.combinableConflictCount,
                    conflictsResolvedWithBase: this.model.conflictsResolvedWithBase,
                    conflictsResolvedWithInput1: this.model.conflictsResolvedWithInput1,
                    conflictsResolvedWithInput2: this.model.conflictsResolvedWithInput2,
                    conflictsResolvedWithSmartCombination: this.model.conflictsResolvedWithSmartCombination,
                    manuallySolvedConflictCountThatEqualNone: this.model.manuallySolvedConflictCountThatEqualNone,
                    manuallySolvedConflictCountThatEqualSmartCombine: this.model.manuallySolvedConflictCountThatEqualSmartCombine,
                    manuallySolvedConflictCountThatEqualInput1: this.model.manuallySolvedConflictCountThatEqualInput1,
                    manuallySolvedConflictCountThatEqualInput2: this.model.manuallySolvedConflictCountThatEqualInput2,
                    manuallySolvedConflictCountThatEqualNoneAndStartedWithBase: this.model.manuallySolvedConflictCountThatEqualNoneAndStartedWithBase,
                    manuallySolvedConflictCountThatEqualNoneAndStartedWithInput1: this.model.manuallySolvedConflictCountThatEqualNoneAndStartedWithInput1,
                    manuallySolvedConflictCountThatEqualNoneAndStartedWithInput2: this.model.manuallySolvedConflictCountThatEqualNoneAndStartedWithInput2,
                    manuallySolvedConflictCountThatEqualNoneAndStartedWithBothNonSmart: this.model.manuallySolvedConflictCountThatEqualNoneAndStartedWithBothNonSmart,
                    manuallySolvedConflictCountThatEqualNoneAndStartedWithBothSmart: this.model.manuallySolvedConflictCountThatEqualNoneAndStartedWithBothSmart,
                });
                this.a = true;
            }
        }
        async accept() {
            this.t(true);
            await this.g.save();
        }
        get resultUri() {
            return this.g.resource;
        }
        async save(options) {
            await this.g.save(options);
        }
        /**
         * If save resets the dirty state, revert must do so too.
        */
        async revert(options) {
            await this.g.revert(options);
        }
        shouldConfirmClose() {
            // Always confirm
            return true;
        }
        async confirmClose(inputModels) {
            const isMany = inputModels.length > 1;
            const someDirty = inputModels.some(m => m.isDirty.get());
            const someUnhandledConflicts = inputModels.some(m => m.model.hasUnhandledConflicts.get());
            if (someDirty) {
                const message = isMany
                    ? (0, nls_1.localize)(13, null, inputModels.length)
                    : (0, nls_1.localize)(14, null, (0, resources_1.$fg)(inputModels[0].resultUri));
                const { result } = await this.r.prompt({
                    type: severity_1.default.Info,
                    message,
                    detail: someUnhandledConflicts ?
                        isMany
                            ? (0, nls_1.localize)(15, null)
                            : (0, nls_1.localize)(16, null)
                        : isMany
                            ? (0, nls_1.localize)(17, null)
                            : (0, nls_1.localize)(18, null),
                    buttons: [
                        {
                            label: someUnhandledConflicts
                                ? (0, nls_1.localize)(19, null)
                                : (0, nls_1.localize)(20, null),
                            run: () => 0 /* ConfirmResult.SAVE */
                        },
                        {
                            label: (0, nls_1.localize)(21, null),
                            run: () => 1 /* ConfirmResult.DONT_SAVE */
                        }
                    ],
                    cancelButton: {
                        run: () => 2 /* ConfirmResult.CANCEL */
                    }
                });
                return result;
            }
            else if (someUnhandledConflicts && !this.s.getBoolean(mergeEditor_1.$_jb, 0 /* StorageScope.PROFILE */, false)) {
                const { confirmed, checkboxChecked } = await this.r.confirm({
                    message: isMany
                        ? (0, nls_1.localize)(22, null, inputModels.length)
                        : (0, nls_1.localize)(23, null, (0, resources_1.$fg)(inputModels[0].resultUri)),
                    detail: someUnhandledConflicts ?
                        isMany
                            ? (0, nls_1.localize)(24, null)
                            : (0, nls_1.localize)(25, null)
                        : undefined,
                    primaryButton: someUnhandledConflicts
                        ? (0, nls_1.localize)(26, null)
                        : (0, nls_1.localize)(27, null),
                    checkbox: { label: (0, nls_1.localize)(28, null) }
                });
                if (checkboxChecked) {
                    this.s.store(mergeEditor_1.$_jb, true, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
                }
                return confirmed ? 0 /* ConfirmResult.SAVE */ : 2 /* ConfirmResult.CANCEL */;
            }
            else {
                // This shouldn't do anything
                return 0 /* ConfirmResult.SAVE */;
            }
        }
    };
    WorkspaceMergeEditorInputModel = __decorate([
        __param(4, dialogs_1.$oA),
        __param(5, storage_1.$Vo)
    ], WorkspaceMergeEditorInputModel);
    /* ================= Utils ================== */
    async function toInputData(data, textModelService, store) {
        const ref = await textModelService.createModelReference(data.uri);
        store.add(ref);
        return {
            textModel: ref.object.textEditorModel,
            title: data.title,
            description: data.description,
            detail: data.detail,
        };
    }
});
//# sourceMappingURL=mergeEditorInputModel.js.map