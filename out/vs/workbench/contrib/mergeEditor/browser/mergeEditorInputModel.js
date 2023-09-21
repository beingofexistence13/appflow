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
define(["require", "exports", "vs/base/common/assert", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/base/common/resources", "vs/base/common/severity", "vs/editor/common/services/model", "vs/editor/common/services/resolverService", "vs/nls", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/workbench/common/editor", "vs/workbench/common/editor/editorModel", "vs/workbench/contrib/mergeEditor/browser/mergeMarkers/mergeMarkersController", "vs/workbench/contrib/mergeEditor/browser/model/diffComputer", "vs/workbench/contrib/mergeEditor/browser/model/mergeEditorModel", "vs/workbench/contrib/mergeEditor/common/mergeEditor", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/textfile/common/textfiles"], function (require, exports, assert_1, errors_1, event_1, lifecycle_1, observable_1, resources_1, severity_1, model_1, resolverService_1, nls_1, dialogs_1, instantiation_1, storage_1, editor_1, editorModel_1, mergeMarkersController_1, diffComputer_1, mergeEditorModel_1, mergeEditor_1, editorService_1, textfiles_1) {
    "use strict";
    var WorkspaceMergeEditorModeFactory_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkspaceMergeEditorModeFactory = exports.TempFileMergeEditorModeFactory = void 0;
    /* ================ Temp File ================ */
    let TempFileMergeEditorModeFactory = class TempFileMergeEditorModeFactory {
        constructor(_mergeEditorTelemetry, _instantiationService, _textModelService, _modelService) {
            this._mergeEditorTelemetry = _mergeEditorTelemetry;
            this._instantiationService = _instantiationService;
            this._textModelService = _textModelService;
            this._modelService = _modelService;
        }
        async createInputModel(args) {
            const store = new lifecycle_1.DisposableStore();
            const [base, result, input1Data, input2Data,] = await Promise.all([
                this._textModelService.createModelReference(args.base),
                this._textModelService.createModelReference(args.result),
                toInputData(args.input1, this._textModelService, store),
                toInputData(args.input2, this._textModelService, store),
            ]);
            store.add(base);
            store.add(result);
            const tempResultUri = result.object.textEditorModel.uri.with({ scheme: 'merge-result' });
            const temporaryResultModel = this._modelService.createModel('', {
                languageId: result.object.textEditorModel.getLanguageId(),
                onDidChange: event_1.Event.None,
            }, tempResultUri);
            store.add(temporaryResultModel);
            const mergeDiffComputer = this._instantiationService.createInstance(diffComputer_1.MergeDiffComputer);
            const model = this._instantiationService.createInstance(mergeEditorModel_1.MergeEditorModel, base.object.textEditorModel, input1Data, input2Data, temporaryResultModel, mergeDiffComputer, {
                resetResult: true,
            }, this._mergeEditorTelemetry);
            store.add(model);
            await model.onInitialized;
            return this._instantiationService.createInstance(TempFileMergeEditorInputModel, model, store, result.object, args.result);
        }
    };
    exports.TempFileMergeEditorModeFactory = TempFileMergeEditorModeFactory;
    exports.TempFileMergeEditorModeFactory = TempFileMergeEditorModeFactory = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, resolverService_1.ITextModelService),
        __param(3, model_1.IModelService)
    ], TempFileMergeEditorModeFactory);
    let TempFileMergeEditorInputModel = class TempFileMergeEditorInputModel extends editorModel_1.EditorModel {
        constructor(model, disposable, result, resultUri, textFileService, dialogService, editorService) {
            super();
            this.model = model;
            this.disposable = disposable;
            this.result = result;
            this.resultUri = resultUri;
            this.textFileService = textFileService;
            this.dialogService = dialogService;
            this.editorService = editorService;
            this.savedAltVersionId = (0, observable_1.observableValue)(this, this.model.resultTextModel.getAlternativeVersionId());
            this.altVersionId = (0, observable_1.observableFromEvent)(e => this.model.resultTextModel.onDidChangeContent(e), () => 
            /** @description getAlternativeVersionId */ this.model.resultTextModel.getAlternativeVersionId());
            this.isDirty = (0, observable_1.derived)(this, (reader) => this.altVersionId.read(reader) !== this.savedAltVersionId.read(reader));
            this.finished = false;
        }
        dispose() {
            this.disposable.dispose();
            super.dispose();
        }
        async accept() {
            const value = await this.model.resultTextModel.getValue();
            this.result.textEditorModel.setValue(value);
            this.savedAltVersionId.set(this.model.resultTextModel.getAlternativeVersionId(), undefined);
            await this.textFileService.save(this.result.textEditorModel.uri);
            this.finished = true;
        }
        async _discard() {
            await this.textFileService.revert(this.model.resultTextModel.uri);
            this.savedAltVersionId.set(this.model.resultTextModel.getAlternativeVersionId(), undefined);
            this.finished = true;
        }
        shouldConfirmClose() {
            return true;
        }
        async confirmClose(inputModels) {
            (0, assert_1.assertFn)(() => inputModels.some((m) => m === this));
            const someDirty = inputModels.some((m) => m.isDirty.get());
            let choice;
            if (someDirty) {
                const isMany = inputModels.length > 1;
                const message = isMany
                    ? (0, nls_1.localize)('messageN', 'Do you want keep the merge result of {0} files?', inputModels.length)
                    : (0, nls_1.localize)('message1', 'Do you want keep the merge result of {0}?', (0, resources_1.basename)(inputModels[0].model.resultTextModel.uri));
                const hasUnhandledConflicts = inputModels.some((m) => m.model.hasUnhandledConflicts.get());
                const buttons = [
                    {
                        label: hasUnhandledConflicts ?
                            (0, nls_1.localize)({ key: 'saveWithConflict', comment: ['&& denotes a mnemonic'] }, "&&Save With Conflicts") :
                            (0, nls_1.localize)({ key: 'save', comment: ['&& denotes a mnemonic'] }, "&&Save"),
                        run: () => 0 /* ConfirmResult.SAVE */
                    },
                    {
                        label: (0, nls_1.localize)({ key: 'discard', comment: ['&& denotes a mnemonic'] }, "Do&&n't Save"),
                        run: () => 1 /* ConfirmResult.DONT_SAVE */
                    }
                ];
                choice = (await this.dialogService.prompt({
                    type: severity_1.default.Info,
                    message,
                    detail: hasUnhandledConflicts
                        ? isMany
                            ? (0, nls_1.localize)('detailNConflicts', "The files contain unhandled conflicts. The merge results will be lost if you don't save them.")
                            : (0, nls_1.localize)('detail1Conflicts', "The file contains unhandled conflicts. The merge result will be lost if you don't save it.")
                        : isMany
                            ? (0, nls_1.localize)('detailN', "The merge results will be lost if you don't save them.")
                            : (0, nls_1.localize)('detail1', "The merge result will be lost if you don't save it."),
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
                await Promise.all(inputModels.map(m => m._discard()));
            }
            else {
                // cancel: stay in editor
            }
            return choice;
        }
        async save(options) {
            if (this.finished) {
                return;
            }
            // It does not make sense to save anything in the temp file mode.
            // The file stays dirty from the first edit on.
            (async () => {
                const { confirmed } = await this.dialogService.confirm({
                    message: (0, nls_1.localize)('saveTempFile.message', "Do you want to accept the merge result?"),
                    detail: (0, nls_1.localize)('saveTempFile.detail', "This will write the merge result to the original file and close the merge editor."),
                    primaryButton: (0, nls_1.localize)({ key: 'acceptMerge', comment: ['&& denotes a mnemonic'] }, '&&Accept Merge')
                });
                if (confirmed) {
                    await this.accept();
                    const editors = this.editorService.findEditors(this.resultUri).filter(e => e.editor.typeId === 'mergeEditor.Input');
                    await this.editorService.closeEditors(editors);
                }
            })();
        }
        async revert(options) {
            // no op
        }
    };
    TempFileMergeEditorInputModel = __decorate([
        __param(4, textfiles_1.ITextFileService),
        __param(5, dialogs_1.IDialogService),
        __param(6, editorService_1.IEditorService)
    ], TempFileMergeEditorInputModel);
    /* ================ Workspace ================ */
    let WorkspaceMergeEditorModeFactory = class WorkspaceMergeEditorModeFactory {
        static { WorkspaceMergeEditorModeFactory_1 = this; }
        constructor(_mergeEditorTelemetry, _instantiationService, _textModelService, textFileService) {
            this._mergeEditorTelemetry = _mergeEditorTelemetry;
            this._instantiationService = _instantiationService;
            this._textModelService = _textModelService;
            this.textFileService = textFileService;
        }
        static { this.FILE_SAVED_SOURCE = editor_1.SaveSourceRegistry.registerSource('merge-editor.source', (0, nls_1.localize)('merge-editor.source', "Before Resolving Conflicts In Merge Editor")); }
        async createInputModel(args) {
            const store = new lifecycle_1.DisposableStore();
            let resultTextFileModel = undefined;
            const modelListener = store.add(new lifecycle_1.DisposableStore());
            const handleDidCreate = (model) => {
                if ((0, resources_1.isEqual)(args.result, model.resource)) {
                    modelListener.clear();
                    resultTextFileModel = model;
                }
            };
            modelListener.add(this.textFileService.files.onDidCreate(handleDidCreate));
            this.textFileService.files.models.forEach(handleDidCreate);
            const [base, result, input1Data, input2Data,] = await Promise.all([
                this._textModelService.createModelReference(args.base),
                this._textModelService.createModelReference(args.result),
                toInputData(args.input1, this._textModelService, store),
                toInputData(args.input2, this._textModelService, store),
            ]);
            store.add(base);
            store.add(result);
            if (!resultTextFileModel) {
                throw new errors_1.BugIndicatingError();
            }
            // So that "Don't save" does revert the file
            await resultTextFileModel.save({ source: WorkspaceMergeEditorModeFactory_1.FILE_SAVED_SOURCE });
            const lines = resultTextFileModel.textEditorModel.getLinesContent();
            const hasConflictMarkers = lines.some(l => l.startsWith(mergeMarkersController_1.conflictMarkers.start));
            const resetResult = hasConflictMarkers;
            const mergeDiffComputer = this._instantiationService.createInstance(diffComputer_1.MergeDiffComputer);
            const model = this._instantiationService.createInstance(mergeEditorModel_1.MergeEditorModel, base.object.textEditorModel, input1Data, input2Data, result.object.textEditorModel, mergeDiffComputer, {
                resetResult
            }, this._mergeEditorTelemetry);
            store.add(model);
            await model.onInitialized;
            return this._instantiationService.createInstance(WorkspaceMergeEditorInputModel, model, store, resultTextFileModel, this._mergeEditorTelemetry);
        }
    };
    exports.WorkspaceMergeEditorModeFactory = WorkspaceMergeEditorModeFactory;
    exports.WorkspaceMergeEditorModeFactory = WorkspaceMergeEditorModeFactory = WorkspaceMergeEditorModeFactory_1 = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, resolverService_1.ITextModelService),
        __param(3, textfiles_1.ITextFileService)
    ], WorkspaceMergeEditorModeFactory);
    let WorkspaceMergeEditorInputModel = class WorkspaceMergeEditorInputModel extends editorModel_1.EditorModel {
        constructor(model, disposableStore, resultTextFileModel, telemetry, _dialogService, _storageService) {
            super();
            this.model = model;
            this.disposableStore = disposableStore;
            this.resultTextFileModel = resultTextFileModel;
            this.telemetry = telemetry;
            this._dialogService = _dialogService;
            this._storageService = _storageService;
            this.isDirty = (0, observable_1.observableFromEvent)(event_1.Event.any(this.resultTextFileModel.onDidChangeDirty, this.resultTextFileModel.onDidSaveError), () => /** @description isDirty */ this.resultTextFileModel.isDirty());
            this.reported = false;
            this.dateTimeOpened = new Date();
        }
        dispose() {
            this.disposableStore.dispose();
            super.dispose();
            this.reportClose(false);
        }
        reportClose(accepted) {
            if (!this.reported) {
                const remainingConflictCount = this.model.unhandledConflictsCount.get();
                const durationOpenedMs = new Date().getTime() - this.dateTimeOpened.getTime();
                this.telemetry.reportMergeEditorClosed({
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
                this.reported = true;
            }
        }
        async accept() {
            this.reportClose(true);
            await this.resultTextFileModel.save();
        }
        get resultUri() {
            return this.resultTextFileModel.resource;
        }
        async save(options) {
            await this.resultTextFileModel.save(options);
        }
        /**
         * If save resets the dirty state, revert must do so too.
        */
        async revert(options) {
            await this.resultTextFileModel.revert(options);
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
                    ? (0, nls_1.localize)('workspace.messageN', 'Do you want to save the changes you made to {0} files?', inputModels.length)
                    : (0, nls_1.localize)('workspace.message1', 'Do you want to save the changes you made to {0}?', (0, resources_1.basename)(inputModels[0].resultUri));
                const { result } = await this._dialogService.prompt({
                    type: severity_1.default.Info,
                    message,
                    detail: someUnhandledConflicts ?
                        isMany
                            ? (0, nls_1.localize)('workspace.detailN.unhandled', "The files contain unhandled conflicts. Your changes will be lost if you don't save them.")
                            : (0, nls_1.localize)('workspace.detail1.unhandled', "The file contains unhandled conflicts. Your changes will be lost if you don't save them.")
                        : isMany
                            ? (0, nls_1.localize)('workspace.detailN.handled', "Your changes will be lost if you don't save them.")
                            : (0, nls_1.localize)('workspace.detail1.handled', "Your changes will be lost if you don't save them."),
                    buttons: [
                        {
                            label: someUnhandledConflicts
                                ? (0, nls_1.localize)({ key: 'workspace.saveWithConflict', comment: ['&& denotes a mnemonic'] }, '&&Save with Conflicts')
                                : (0, nls_1.localize)({ key: 'workspace.save', comment: ['&& denotes a mnemonic'] }, '&&Save'),
                            run: () => 0 /* ConfirmResult.SAVE */
                        },
                        {
                            label: (0, nls_1.localize)({ key: 'workspace.doNotSave', comment: ['&& denotes a mnemonic'] }, "Do&&n't Save"),
                            run: () => 1 /* ConfirmResult.DONT_SAVE */
                        }
                    ],
                    cancelButton: {
                        run: () => 2 /* ConfirmResult.CANCEL */
                    }
                });
                return result;
            }
            else if (someUnhandledConflicts && !this._storageService.getBoolean(mergeEditor_1.StorageCloseWithConflicts, 0 /* StorageScope.PROFILE */, false)) {
                const { confirmed, checkboxChecked } = await this._dialogService.confirm({
                    message: isMany
                        ? (0, nls_1.localize)('workspace.messageN.nonDirty', 'Do you want to close {0} merge editors?', inputModels.length)
                        : (0, nls_1.localize)('workspace.message1.nonDirty', 'Do you want to close the merge editor for {0}?', (0, resources_1.basename)(inputModels[0].resultUri)),
                    detail: someUnhandledConflicts ?
                        isMany
                            ? (0, nls_1.localize)('workspace.detailN.unhandled.nonDirty', "The files contain unhandled conflicts.")
                            : (0, nls_1.localize)('workspace.detail1.unhandled.nonDirty', "The file contains unhandled conflicts.")
                        : undefined,
                    primaryButton: someUnhandledConflicts
                        ? (0, nls_1.localize)({ key: 'workspace.closeWithConflicts', comment: ['&& denotes a mnemonic'] }, '&&Close with Conflicts')
                        : (0, nls_1.localize)({ key: 'workspace.close', comment: ['&& denotes a mnemonic'] }, '&&Close'),
                    checkbox: { label: (0, nls_1.localize)('noMoreWarn', "Don't ask again") }
                });
                if (checkboxChecked) {
                    this._storageService.store(mergeEditor_1.StorageCloseWithConflicts, true, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
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
        __param(4, dialogs_1.IDialogService),
        __param(5, storage_1.IStorageService)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVyZ2VFZGl0b3JJbnB1dE1vZGVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbWVyZ2VFZGl0b3IvYnJvd3Nlci9tZXJnZUVkaXRvcklucHV0TW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQThEaEcsaURBQWlEO0lBRTFDLElBQU0sOEJBQThCLEdBQXBDLE1BQU0sOEJBQThCO1FBQzFDLFlBQ2tCLHFCQUEyQyxFQUNwQixxQkFBNEMsRUFDaEQsaUJBQW9DLEVBQ3hDLGFBQTRCO1lBSDNDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBc0I7WUFDcEIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUNoRCxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO1lBQ3hDLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBRTdELENBQUM7UUFFRCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsSUFBcUI7WUFDM0MsTUFBTSxLQUFLLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFFcEMsTUFBTSxDQUNMLElBQUksRUFDSixNQUFNLEVBQ04sVUFBVSxFQUNWLFVBQVUsRUFDVixHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQztnQkFDckIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQ3RELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO2dCQUN4RCxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsS0FBSyxDQUFDO2dCQUN2RCxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsS0FBSyxDQUFDO2FBQ3ZELENBQUMsQ0FB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