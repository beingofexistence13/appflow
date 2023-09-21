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
define(["require", "exports", "vs/nls", "vs/base/common/network", "vs/base/common/lifecycle", "vs/workbench/contrib/search/browser/replace", "vs/workbench/services/editor/common/editorService", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/workbench/contrib/search/browser/searchModel", "vs/editor/common/services/resolverService", "vs/platform/instantiation/common/instantiation", "vs/editor/common/model/textModel", "vs/workbench/services/textfile/common/textfiles", "vs/editor/browser/services/bulkEditService", "vs/editor/common/core/range", "vs/editor/common/core/editOperation", "vs/platform/label/common/label", "vs/base/common/resources", "vs/base/common/async", "vs/workbench/common/editor", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookEditorModelResolverService"], function (require, exports, nls, network, lifecycle_1, replace_1, editorService_1, model_1, language_1, searchModel_1, resolverService_1, instantiation_1, textModel_1, textfiles_1, bulkEditService_1, range_1, editOperation_1, label_1, resources_1, async_1, editor_1, notebookCommon_1, notebookEditorModelResolverService_1) {
    "use strict";
    var ReplaceService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReplaceService = exports.ReplacePreviewContentProvider = void 0;
    const REPLACE_PREVIEW = 'replacePreview';
    const toReplaceResource = (fileResource) => {
        return fileResource.with({ scheme: network.Schemas.internal, fragment: REPLACE_PREVIEW, query: JSON.stringify({ scheme: fileResource.scheme }) });
    };
    const toFileResource = (replaceResource) => {
        return replaceResource.with({ scheme: JSON.parse(replaceResource.query)['scheme'], fragment: '', query: '' });
    };
    let ReplacePreviewContentProvider = class ReplacePreviewContentProvider {
        constructor(instantiationService, textModelResolverService) {
            this.instantiationService = instantiationService;
            this.textModelResolverService = textModelResolverService;
            this.textModelResolverService.registerTextModelContentProvider(network.Schemas.internal, this);
        }
        provideTextContent(uri) {
            if (uri.fragment === REPLACE_PREVIEW) {
                return this.instantiationService.createInstance(ReplacePreviewModel).resolve(uri);
            }
            return null;
        }
    };
    exports.ReplacePreviewContentProvider = ReplacePreviewContentProvider;
    exports.ReplacePreviewContentProvider = ReplacePreviewContentProvider = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, resolverService_1.ITextModelService)
    ], ReplacePreviewContentProvider);
    let ReplacePreviewModel = class ReplacePreviewModel extends lifecycle_1.Disposable {
        constructor(modelService, languageService, textModelResolverService, replaceService, searchWorkbenchService) {
            super();
            this.modelService = modelService;
            this.languageService = languageService;
            this.textModelResolverService = textModelResolverService;
            this.replaceService = replaceService;
            this.searchWorkbenchService = searchWorkbenchService;
        }
        async resolve(replacePreviewUri) {
            const fileResource = toFileResource(replacePreviewUri);
            const fileMatch = this.searchWorkbenchService.searchModel.searchResult.matches().filter(match => match.resource.toString() === fileResource.toString())[0];
            const ref = this._register(await this.textModelResolverService.createModelReference(fileResource));
            const sourceModel = ref.object.textEditorModel;
            const sourceModelLanguageId = sourceModel.getLanguageId();
            const replacePreviewModel = this.modelService.createModel((0, textModel_1.createTextBufferFactoryFromSnapshot)(sourceModel.createSnapshot()), this.languageService.createById(sourceModelLanguageId), replacePreviewUri);
            this._register(fileMatch.onChange(({ forceUpdateModel }) => this.update(sourceModel, replacePreviewModel, fileMatch, forceUpdateModel)));
            this._register(this.searchWorkbenchService.searchModel.onReplaceTermChanged(() => this.update(sourceModel, replacePreviewModel, fileMatch)));
            this._register(fileMatch.onDispose(() => replacePreviewModel.dispose())); // TODO@Sandeep we should not dispose a model directly but rather the reference (depends on https://github.com/microsoft/vscode/issues/17073)
            this._register(replacePreviewModel.onWillDispose(() => this.dispose()));
            this._register(sourceModel.onWillDispose(() => this.dispose()));
            return replacePreviewModel;
        }
        update(sourceModel, replacePreviewModel, fileMatch, override = false) {
            if (!sourceModel.isDisposed() && !replacePreviewModel.isDisposed()) {
                this.replaceService.updateReplacePreview(fileMatch, override);
            }
        }
    };
    ReplacePreviewModel = __decorate([
        __param(0, model_1.IModelService),
        __param(1, language_1.ILanguageService),
        __param(2, resolverService_1.ITextModelService),
        __param(3, replace_1.IReplaceService),
        __param(4, searchModel_1.ISearchViewModelWorkbenchService)
    ], ReplacePreviewModel);
    let ReplaceService = class ReplaceService {
        static { ReplaceService_1 = this; }
        static { this.REPLACE_SAVE_SOURCE = editor_1.SaveSourceRegistry.registerSource('searchReplace.source', nls.localize('searchReplace.source', "Search and Replace")); }
        constructor(textFileService, editorService, textModelResolverService, bulkEditorService, labelService, notebookEditorModelResolverService) {
            this.textFileService = textFileService;
            this.editorService = editorService;
            this.textModelResolverService = textModelResolverService;
            this.bulkEditorService = bulkEditorService;
            this.labelService = labelService;
            this.notebookEditorModelResolverService = notebookEditorModelResolverService;
        }
        async replace(arg, progress = undefined, resource = null) {
            const edits = this.createEdits(arg, resource);
            await this.bulkEditorService.apply(edits, { progress });
            const rawTextPromises = edits.map(async (e) => {
                if (e.resource.scheme === network.Schemas.vscodeNotebookCell) {
                    const notebookResource = notebookCommon_1.CellUri.parse(e.resource)?.notebook;
                    if (notebookResource) {
                        let ref;
                        try {
                            ref = await this.notebookEditorModelResolverService.resolve(notebookResource);
                            await ref.object.save({ source: ReplaceService_1.REPLACE_SAVE_SOURCE });
                        }
                        finally {
                            ref?.dispose();
                        }
                    }
                    return;
                }
                else {
                    return this.textFileService.files.get(e.resource)?.save({ source: ReplaceService_1.REPLACE_SAVE_SOURCE });
                }
            });
            return async_1.Promises.settled(rawTextPromises);
        }
        async openReplacePreview(element, preserveFocus, sideBySide, pinned) {
            const fileMatch = element instanceof searchModel_1.Match ? element.parent() : element;
            const editor = await this.editorService.openEditor({
                original: { resource: fileMatch.resource },
                modified: { resource: toReplaceResource(fileMatch.resource) },
                label: nls.localize('fileReplaceChanges', "{0} ↔ {1} (Replace Preview)", fileMatch.name(), fileMatch.name()),
                description: this.labelService.getUriLabel((0, resources_1.dirname)(fileMatch.resource), { relative: true }),
                options: {
                    preserveFocus,
                    pinned,
                    revealIfVisible: true
                }
            });
            const input = editor?.input;
            const disposable = fileMatch.onDispose(() => {
                input?.dispose();
                disposable.dispose();
            });
            await this.updateReplacePreview(fileMatch);
            if (editor) {
                const editorControl = editor.getControl();
                if (element instanceof searchModel_1.Match && editorControl) {
                    editorControl.revealLineInCenter(element.range().startLineNumber, 1 /* ScrollType.Immediate */);
                }
            }
        }
        async updateReplacePreview(fileMatch, override = false) {
            const replacePreviewUri = toReplaceResource(fileMatch.resource);
            const [sourceModelRef, replaceModelRef] = await Promise.all([this.textModelResolverService.createModelReference(fileMatch.resource), this.textModelResolverService.createModelReference(replacePreviewUri)]);
            const sourceModel = sourceModelRef.object.textEditorModel;
            const replaceModel = replaceModelRef.object.textEditorModel;
            // If model is disposed do not update
            try {
                if (sourceModel && replaceModel) {
                    if (override) {
                        replaceModel.setValue(sourceModel.getValue());
                    }
                    else {
                        replaceModel.undo();
                    }
                    this.applyEditsToPreview(fileMatch, replaceModel);
                }
            }
            finally {
                sourceModelRef.dispose();
                replaceModelRef.dispose();
            }
        }
        applyEditsToPreview(fileMatch, replaceModel) {
            const resourceEdits = this.createEdits(fileMatch, replaceModel.uri);
            const modelEdits = [];
            for (const resourceEdit of resourceEdits) {
                modelEdits.push(editOperation_1.EditOperation.replaceMove(range_1.Range.lift(resourceEdit.textEdit.range), resourceEdit.textEdit.text));
            }
            replaceModel.pushEditOperations([], modelEdits.sort((a, b) => range_1.Range.compareRangesUsingStarts(a.range, b.range)), () => []);
        }
        createEdits(arg, resource = null) {
            const edits = [];
            if (arg instanceof searchModel_1.Match) {
                if (arg instanceof searchModel_1.MatchInNotebook) {
                    if (!arg.isWebviewMatch()) {
                        // only apply edits if it's not a webview match, since webview matches are read-only
                        const match = arg;
                        edits.push(this.createEdit(match, match.replaceString, match.cell.uri));
                    }
                }
                else {
                    const match = arg;
                    edits.push(this.createEdit(match, match.replaceString, resource));
                }
            }
            if (arg instanceof searchModel_1.FileMatch) {
                arg = [arg];
            }
            if (arg instanceof Array) {
                arg.forEach(element => {
                    const fileMatch = element;
                    if (fileMatch.count() > 0) {
                        edits.push(...fileMatch.matches().flatMap(match => this.createEdits(match, resource)));
                    }
                });
            }
            return edits;
        }
        createEdit(match, text, resource = null) {
            const fileMatch = match.parent();
            return new bulkEditService_1.ResourceTextEdit(resource ?? fileMatch.resource, { range: match.range(), text }, undefined, undefined);
        }
    };
    exports.ReplaceService = ReplaceService;
    exports.ReplaceService = ReplaceService = ReplaceService_1 = __decorate([
        __param(0, textfiles_1.ITextFileService),
        __param(1, editorService_1.IEditorService),
        __param(2, resolverService_1.ITextModelService),
        __param(3, bulkEditService_1.IBulkEditService),
        __param(4, label_1.ILabelService),
        __param(5, notebookEditorModelResolverService_1.INotebookEditorModelResolverService)
    ], ReplaceService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwbGFjZVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9zZWFyY2gvYnJvd3Nlci9yZXBsYWNlU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBNkJoRyxNQUFNLGVBQWUsR0FBRyxnQkFBZ0IsQ0FBQztJQUV6QyxNQUFNLGlCQUFpQixHQUFHLENBQUMsWUFBaUIsRUFBTyxFQUFFO1FBQ3BELE9BQU8sWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsTUFBTSxFQUFFLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNuSixDQUFDLENBQUM7SUFFRixNQUFNLGNBQWMsR0FBRyxDQUFDLGVBQW9CLEVBQU8sRUFBRTtRQUNwRCxPQUFPLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUMvRyxDQUFDLENBQUM7SUFFSyxJQUFNLDZCQUE2QixHQUFuQyxNQUFNLDZCQUE2QjtRQUV6QyxZQUN5QyxvQkFBMkMsRUFDL0Msd0JBQTJDO1lBRHZDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDL0MsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUFtQjtZQUUvRSxJQUFJLENBQUMsd0JBQXdCLENBQUMsZ0NBQWdDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsSUFBSSxD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