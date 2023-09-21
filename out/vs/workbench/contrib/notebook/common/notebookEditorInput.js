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
define(["require", "exports", "vs/base/common/glob", "vs/workbench/contrib/notebook/common/notebookService", "vs/base/common/resources", "vs/platform/instantiation/common/instantiation", "vs/platform/dialogs/common/dialogs", "vs/workbench/contrib/notebook/common/notebookEditorModelResolverService", "vs/platform/label/common/label", "vs/base/common/network", "vs/platform/files/common/files", "vs/workbench/common/editor/resourceEditorInput", "vs/base/common/errors", "vs/base/common/buffer", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/extensions/common/extensions", "vs/nls", "vs/workbench/services/editor/common/editorService"], function (require, exports, glob, notebookService_1, resources_1, instantiation_1, dialogs_1, notebookEditorModelResolverService_1, label_1, network_1, files_1, resourceEditorInput_1, errors_1, buffer_1, filesConfigurationService_1, extensions_1, nls_1, editorService_1) {
    "use strict";
    var NotebookEditorInput_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isCompositeNotebookEditorInput = exports.NotebookEditorInput = void 0;
    let NotebookEditorInput = class NotebookEditorInput extends resourceEditorInput_1.AbstractResourceEditorInput {
        static { NotebookEditorInput_1 = this; }
        static create(instantiationService, resource, viewType, options = {}) {
            return instantiationService.createInstance(NotebookEditorInput_1, resource, viewType, options);
        }
        static { this.ID = 'workbench.input.notebook'; }
        constructor(resource, viewType, options, _notebookService, _notebookModelResolverService, _fileDialogService, _instantiationService, labelService, fileService, filesConfigurationService, extensionService, editorService) {
            super(resource, undefined, labelService, fileService, filesConfigurationService);
            this.viewType = viewType;
            this.options = options;
            this._notebookService = _notebookService;
            this._notebookModelResolverService = _notebookModelResolverService;
            this._fileDialogService = _fileDialogService;
            this._instantiationService = _instantiationService;
            this._editorModelReference = null;
            this._defaultDirtyState = false;
            this._defaultDirtyState = !!options.startDirty;
            // Automatically resolve this input when the "wanted" model comes to life via
            // some other way. This happens only once per input and resolve disposes
            // this listener
            this._sideLoadedListener = _notebookService.onDidAddNotebookDocument(e => {
                if (e.viewType === this.viewType && e.uri.toString() === this.resource.toString()) {
                    this.resolve().catch(errors_1.onUnexpectedError);
                }
            });
            this._register(extensionService.onWillStop(e => {
                if (!this.isDirty()) {
                    return;
                }
                e.veto((async () => {
                    const editors = editorService.findEditors(this);
                    if (editors.length > 0) {
                        const result = await editorService.save(editors[0]);
                        if (result.success) {
                            return false; // Don't Veto
                        }
                    }
                    return true; // Veto
                })(), (0, nls_1.localize)('vetoExtHostRestart', "Notebook '{0}' could not be saved.", this.resource.path));
            }));
        }
        dispose() {
            this._sideLoadedListener.dispose();
            this._editorModelReference?.dispose();
            this._editorModelReference = null;
            super.dispose();
        }
        get typeId() {
            return NotebookEditorInput_1.ID;
        }
        get editorId() {
            return this.viewType;
        }
        get capabilities() {
            let capabilities = 0 /* EditorInputCapabilities.None */;
            if (this.resource.scheme === network_1.Schemas.untitled) {
                capabilities |= 4 /* EditorInputCapabilities.Untitled */;
            }
            if (this._editorModelReference) {
                if (this._editorModelReference.object.isReadonly()) {
                    capabilities |= 2 /* EditorInputCapabilities.Readonly */;
                }
            }
            else {
                if (this.filesConfigurationService.isReadonly(this.resource)) {
                    capabilities |= 2 /* EditorInputCapabilities.Readonly */;
                }
            }
            if (!(capabilities & 2 /* EditorInputCapabilities.Readonly */)) {
                capabilities |= 128 /* EditorInputCapabilities.CanDropIntoEditor */;
            }
            return capabilities;
        }
        getDescription(verbosity = 1 /* Verbosity.MEDIUM */) {
            if (!this.hasCapability(4 /* EditorInputCapabilities.Untitled */) || this._editorModelReference?.object.hasAssociatedFilePath()) {
                return super.getDescription(verbosity);
            }
            return undefined; // no description for untitled notebooks without associated file path
        }
        isReadonly() {
            if (!this._editorModelReference) {
                return this.filesConfigurationService.isReadonly(this.resource);
            }
            return this._editorModelReference.object.isReadonly();
        }
        isDirty() {
            if (!this._editorModelReference) {
                return this._defaultDirtyState;
            }
            return this._editorModelReference.object.isDirty();
        }
        isSaving() {
            const model = this._editorModelReference?.object;
            if (!model || !model.isDirty() || model.hasErrorState || this.hasCapability(4 /* EditorInputCapabilities.Untitled */)) {
                return false; // require the model to be dirty, file-backed and not in an error state
            }
            // if a short auto save is configured, treat this as being saved
            return this.filesConfigurationService.getAutoSaveMode() === 1 /* AutoSaveMode.AFTER_SHORT_DELAY */;
        }
        async save(group, options) {
            if (this._editorModelReference) {
                if (this.hasCapability(4 /* EditorInputCapabilities.Untitled */)) {
                    return this.saveAs(group, options);
                }
                else {
                    await this._editorModelReference.object.save(options);
                }
                return this;
            }
            return undefined;
        }
        async saveAs(group, options) {
            if (!this._editorModelReference) {
                return undefined;
            }
            const provider = this._notebookService.getContributedNotebookType(this.viewType);
            if (!provider) {
                return undefined;
            }
            const pathCandidate = this.hasCapability(4 /* EditorInputCapabilities.Untitled */) ? await this._suggestName(provider, this.labelService.getUriBasenameLabel(this.resource)) : this._editorModelReference.object.resource;
            let target;
            if (this._editorModelReference.object.hasAssociatedFilePath()) {
                target = pathCandidate;
            }
            else {
                target = await this._fileDialogService.pickFileToSave(pathCandidate, options?.availableFileSystems);
                if (!target) {
                    return undefined; // save cancelled
                }
            }
            if (!provider.matches(target)) {
                const patterns = provider.selectors.map(pattern => {
                    if (typeof pattern === 'string') {
                        return pattern;
                    }
                    if (glob.isRelativePattern(pattern)) {
                        return `${pattern} (base ${pattern.base})`;
                    }
                    if (pattern.exclude) {
                        return `${pattern.include} (exclude: ${pattern.exclude})`;
                    }
                    else {
                        return `${pattern.include}`;
                    }
                }).join(', ');
                throw new Error(`File name ${target} is not supported by ${provider.providerDisplayName}.\n\nPlease make sure the file name matches following patterns:\n${patterns}`);
            }
            return await this._editorModelReference.object.saveAs(target);
        }
        async _suggestName(provider, suggestedFilename) {
            // guess file extensions
            const firstSelector = provider.selectors[0];
            let selectorStr = firstSelector && typeof firstSelector === 'string' ? firstSelector : undefined;
            if (!selectorStr && firstSelector) {
                const include = firstSelector.include;
                if (typeof include === 'string') {
                    selectorStr = include;
                }
            }
            if (selectorStr) {
                const matches = /^\*\.([A-Za-z_-]*)$/.exec(selectorStr);
                if (matches && matches.length > 1) {
                    const fileExt = matches[1];
                    if (!suggestedFilename.endsWith(fileExt)) {
                        return (0, resources_1.joinPath)(await this._fileDialogService.defaultFilePath(), suggestedFilename + '.' + fileExt);
                    }
                }
            }
            return (0, resources_1.joinPath)(await this._fileDialogService.defaultFilePath(), suggestedFilename);
        }
        // called when users rename a notebook document
        async rename(group, target) {
            if (this._editorModelReference) {
                const contributedNotebookProviders = this._notebookService.getContributedNotebookTypes(target);
                if (contributedNotebookProviders.find(provider => provider.id === this._editorModelReference.object.viewType)) {
                    return this._move(group, target);
                }
            }
            return undefined;
        }
        _move(_group, newResource) {
            const editorInput = NotebookEditorInput_1.create(this._instantiationService, newResource, this.viewType);
            return { editor: editorInput };
        }
        async revert(_group, options) {
            if (this._editorModelReference && this._editorModelReference.object.isDirty()) {
                await this._editorModelReference.object.revert(options);
            }
        }
        async resolve(_options, perf) {
            if (!await this._notebookService.canResolve(this.viewType)) {
                return null;
            }
            perf?.mark('extensionActivated');
            // we are now loading the notebook and don't need to listen to
            // "other" loading anymore
            this._sideLoadedListener.dispose();
            if (!this._editorModelReference) {
                const ref = await this._notebookModelResolverService.resolve(this.resource, this.viewType);
                if (this._editorModelReference) {
                    // Re-entrant, double resolve happened. Dispose the addition references and proceed
                    // with the truth.
                    ref.dispose();
                    return this._editorModelReference.object;
                }
                this._editorModelReference = ref;
                if (this.isDisposed()) {
                    this._editorModelReference.dispose();
                    this._editorModelReference = null;
                    return null;
                }
                this._register(this._editorModelReference.object.onDidChangeDirty(() => this._onDidChangeDirty.fire()));
                this._register(this._editorModelReference.object.onDidChangeReadonly(() => this._onDidChangeCapabilities.fire()));
                this._register(this._editorModelReference.object.onDidRevertUntitled(() => this.dispose()));
                if (this._editorModelReference.object.isDirty()) {
                    this._onDidChangeDirty.fire();
                }
            }
            else {
                this._editorModelReference.object.load();
            }
            if (this.options._backupId) {
                const info = await this._notebookService.withNotebookDataProvider(this._editorModelReference.object.notebook.viewType);
                if (!(info instanceof notebookService_1.SimpleNotebookProviderInfo)) {
                    throw new Error('CANNOT open file notebook with this provider');
                }
                const data = await info.serializer.dataToNotebook(buffer_1.VSBuffer.fromString(JSON.stringify({ __webview_backup: this.options._backupId })));
                this._editorModelReference.object.notebook.applyEdits([
                    {
                        editType: 1 /* CellEditType.Replace */,
                        index: 0,
                        count: this._editorModelReference.object.notebook.length,
                        cells: data.cells
                    }
                ], true, undefined, () => undefined, undefined, false);
                if (this.options._workingCopy) {
                    this.options._backupId = undefined;
                    this.options._workingCopy = undefined;
                    this.options.startDirty = undefined;
                }
            }
            return this._editorModelReference.object;
        }
        toUntyped() {
            return {
                resource: this.preferredResource,
                options: {
                    override: this.viewType
                }
            };
        }
        matches(otherInput) {
            if (super.matches(otherInput)) {
                return true;
            }
            if (otherInput instanceof NotebookEditorInput_1) {
                return this.viewType === otherInput.viewType && (0, resources_1.isEqual)(this.resource, otherInput.resource);
            }
            return false;
        }
    };
    exports.NotebookEditorInput = NotebookEditorInput;
    exports.NotebookEditorInput = NotebookEditorInput = NotebookEditorInput_1 = __decorate([
        __param(3, notebookService_1.INotebookService),
        __param(4, notebookEditorModelResolverService_1.INotebookEditorModelResolverService),
        __param(5, dialogs_1.IFileDialogService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, label_1.ILabelService),
        __param(8, files_1.IFileService),
        __param(9, filesConfigurationService_1.IFilesConfigurationService),
        __param(10, extensions_1.IExtensionService),
        __param(11, editorService_1.IEditorService)
    ], NotebookEditorInput);
    function isCompositeNotebookEditorInput(thing) {
        return !!thing
            && typeof thing === 'object'
            && Array.isArray(thing.editorInputs)
            && (thing.editorInputs.every(input => input instanceof NotebookEditorInput));
    }
    exports.isCompositeNotebookEditorInput = isCompositeNotebookEditorInput;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tFZGl0b3JJbnB1dC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2NvbW1vbi9ub3RlYm9va0VkaXRvcklucHV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFzQ3pGLElBQU0sbUJBQW1CLEdBQXpCLE1BQU0sbUJBQW9CLFNBQVEsaURBQTJCOztRQUVuRSxNQUFNLENBQUMsTUFBTSxDQUFDLG9CQUEyQyxFQUFFLFFBQWEsRUFBRSxRQUFnQixFQUFFLFVBQXNDLEVBQUU7WUFDbkksT0FBTyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMscUJBQW1CLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM5RixDQUFDO2lCQUVlLE9BQUUsR0FBVywwQkFBMEIsQUFBckMsQ0FBc0M7UUFNeEQsWUFDQyxRQUFhLEVBQ0csUUFBZ0IsRUFDaEIsT0FBbUMsRUFDakMsZ0JBQW1ELEVBQ2hDLDZCQUFtRixFQUNwRyxrQkFBdUQsRUFDcEQscUJBQTZELEVBQ3JFLFlBQTJCLEVBQzVCLFdBQXlCLEVBQ1gseUJBQXFELEVBQzlELGdCQUFtQyxFQUN0QyxhQUE2QjtZQUU3QyxLQUFLLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLHlCQUF5QixDQUFDLENBQUM7WUFaakUsYUFBUSxHQUFSLFFBQVEsQ0FBUTtZQUNoQixZQUFPLEdBQVAsT0FBTyxDQUE0QjtZQUNoQixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1lBQ2Ysa0NBQTZCLEdBQTdCLDZCQUE2QixDQUFxQztZQUNuRix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1lBQ25DLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFYN0UsMEJBQXFCLEdBQW9ELElBQUksQ0FBQztZQUU5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