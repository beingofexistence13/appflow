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
define(["require", "exports", "vs/base/common/event", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/uri", "vs/editor/common/services/model", "vs/nls", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/workbench/common/editor", "vs/workbench/common/memento", "vs/workbench/contrib/searchEditor/browser/constants", "vs/workbench/contrib/searchEditor/browser/searchEditorModel", "vs/workbench/contrib/searchEditor/browser/searchEditorSerialization", "vs/workbench/services/path/common/pathService", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/platform/configuration/common/configuration", "vs/base/common/buffer", "vs/workbench/common/editor/editorInput", "vs/css!./media/searchEditor"], function (require, exports, event_1, path_1, resources_1, uri_1, model_1, nls_1, dialogs_1, instantiation_1, storage_1, telemetry_1, editor_1, memento_1, constants_1, searchEditorModel_1, searchEditorSerialization_1, pathService_1, textfiles_1, workingCopyService_1, configuration_1, buffer_1, editorInput_1) {
    "use strict";
    var SearchEditorInput_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getOrMakeSearchEditorInput = exports.SearchEditorInput = exports.SEARCH_EDITOR_EXT = void 0;
    exports.SEARCH_EDITOR_EXT = '.code-search';
    let SearchEditorInput = class SearchEditorInput extends editorInput_1.EditorInput {
        static { SearchEditorInput_1 = this; }
        static { this.ID = constants_1.SearchEditorInputTypeId; }
        get typeId() {
            return SearchEditorInput_1.ID;
        }
        get editorId() {
            return this.typeId;
        }
        get capabilities() {
            let capabilities = 8 /* EditorInputCapabilities.Singleton */;
            if (!this.backingUri) {
                capabilities |= 4 /* EditorInputCapabilities.Untitled */;
            }
            return capabilities;
        }
        get resource() {
            return this.backingUri || this.modelUri;
        }
        constructor(modelUri, backingUri, modelService, textFileService, fileDialogService, instantiationService, workingCopyService, telemetryService, pathService, storageService) {
            super();
            this.modelUri = modelUri;
            this.backingUri = backingUri;
            this.modelService = modelService;
            this.textFileService = textFileService;
            this.fileDialogService = fileDialogService;
            this.instantiationService = instantiationService;
            this.workingCopyService = workingCopyService;
            this.telemetryService = telemetryService;
            this.pathService = pathService;
            this.dirty = false;
            this._onDidChangeContent = this._register(new event_1.Emitter());
            this.onDidChangeContent = this._onDidChangeContent.event;
            this._onDidSave = this._register(new event_1.Emitter());
            this.onDidSave = this._onDidSave.event;
            this.oldDecorationsIDs = [];
            this.model = instantiationService.createInstance(searchEditorModel_1.SearchEditorModel, modelUri);
            if (this.modelUri.scheme !== constants_1.SearchEditorScheme) {
                throw Error('SearchEditorInput must be invoked with a SearchEditorScheme uri');
            }
            this.memento = new memento_1.Memento(SearchEditorInput_1.ID, storageService);
            storageService.onWillSaveState(() => this.memento.saveMemento());
            const input = this;
            const workingCopyAdapter = new class {
                constructor() {
                    this.typeId = constants_1.SearchEditorWorkingCopyTypeId;
                    this.resource = input.modelUri;
                    this.capabilities = input.hasCapability(4 /* EditorInputCapabilities.Untitled */) ? 2 /* WorkingCopyCapabilities.Untitled */ : 0 /* WorkingCopyCapabilities.None */;
                    this.onDidChangeDirty = input.onDidChangeDirty;
                    this.onDidChangeContent = input.onDidChangeContent;
                    this.onDidSave = input.onDidSave;
                }
                get name() { return input.getName(); }
                isDirty() { return input.isDirty(); }
                isModified() { return input.isDirty(); }
                backup(token) { return input.backup(token); }
                save(options) { return input.save(0, options).then(editor => !!editor); }
                revert(options) { return input.revert(0, options); }
            };
            this._register(this.workingCopyService.registerWorkingCopy(workingCopyAdapter));
        }
        async save(group, options) {
            if (((await this.resolveModels()).resultsModel).isDisposed()) {
                return;
            }
            if (this.backingUri) {
                await this.textFileService.write(this.backingUri, await this.serializeForDisk(), options);
                this.setDirty(false);
                this._onDidSave.fire({ reason: options?.reason, source: options?.source });
                return this;
            }
            else {
                return this.saveAs(group, options);
            }
        }
        tryReadConfigSync() {
            return this._cachedConfigurationModel?.config;
        }
        async serializeForDisk() {
            const { configurationModel, resultsModel } = await this.resolveModels();
            return (0, searchEditorSerialization_1.serializeSearchConfiguration)(configurationModel.config) + '\n' + resultsModel.getValue();
        }
        registerConfigChangeListeners(model) {
            this.configChangeListenerDisposable?.dispose();
            if (!this.isDisposed()) {
                this.configChangeListenerDisposable = model.onConfigDidUpdate(() => {
                    if (this.lastLabel !== this.getName()) {
                        this._onDidChangeLabel.fire();
                        this.lastLabel = this.getName();
                    }
                    this.memento.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */).searchConfig = model.config;
                });
                this._register(this.configChangeListenerDisposable);
            }
        }
        async resolveModels() {
            return this.model.resolve().then(data => {
                this._cachedResultsModel = data.resultsModel;
                this._cachedConfigurationModel = data.configurationModel;
                if (this.lastLabel !== this.getName()) {
                    this._onDidChangeLabel.fire();
                    this.lastLabel = this.getName();
                }
                this.registerConfigChangeListeners(data.configurationModel);
                return data;
            });
        }
        async saveAs(group, options) {
            const path = await this.fileDialogService.pickFileToSave(await this.suggestFileName(), options?.availableFileSystems);
            if (path) {
                this.telemetryService.publicLog2('searchEditor/saveSearchResults');
                const toWrite = await this.serializeForDisk();
                if (await this.textFileService.create([{ resource: path, value: toWrite, options: { overwrite: true } }])) {
                    this.setDirty(false);
                    if (!(0, resources_1.isEqual)(path, this.modelUri)) {
                        const input = this.instantiationService.invokeFunction(exports.getOrMakeSearchEditorInput, { fileUri: path, from: 'existingFile' });
                        input.setMatchRanges(this.getMatchRanges());
                        return input;
                    }
                    return this;
                }
            }
            return undefined;
        }
        getName(maxLength = 12) {
            const trimToMax = (label) => (label.length < maxLength ? label : `${label.slice(0, maxLength - 3)}...`);
            if (this.backingUri) {
                const originalURI = editor_1.EditorResourceAccessor.getOriginalUri(this);
                return (0, nls_1.localize)('searchTitle.withQuery', "Search: {0}", (0, path_1.basename)((originalURI ?? this.backingUri).path, exports.SEARCH_EDITOR_EXT));
            }
            const query = this._cachedConfigurationModel?.config?.query?.trim();
            if (query) {
                return (0, nls_1.localize)('searchTitle.withQuery', "Search: {0}", trimToMax(query));
            }
            return (0, nls_1.localize)('searchTitle', "Search");
        }
        setDirty(dirty) {
            const wasDirty = this.dirty;
            this.dirty = dirty;
            if (wasDirty !== dirty) {
                this._onDidChangeDirty.fire();
            }
        }
        isDirty() {
            return this.dirty;
        }
        async rename(group, target) {
            if ((0, resources_1.extname)(target) === exports.SEARCH_EDITOR_EXT) {
                return {
                    editor: this.instantiationService.invokeFunction(exports.getOrMakeSearchEditorInput, { from: 'existingFile', fileUri: target })
                };
            }
            // Ignore move if editor was renamed to a different file extension
            return undefined;
        }
        dispose() {
            this.modelService.destroyModel(this.modelUri);
            super.dispose();
        }
        matches(other) {
            if (super.matches(other)) {
                return true;
            }
            if (other instanceof SearchEditorInput_1) {
                return !!(other.modelUri.fragment && other.modelUri.fragment === this.modelUri.fragment) || !!(other.backingUri && (0, resources_1.isEqual)(other.backingUri, this.backingUri));
            }
            return false;
        }
        getMatchRanges() {
            return (this._cachedResultsModel?.getAllDecorations() ?? [])
                .filter(decoration => decoration.options.className === constants_1.SearchEditorFindMatchClass)
                .filter(({ range }) => !(range.startColumn === 1 && range.endColumn === 1))
                .map(({ range }) => range);
        }
        async setMatchRanges(ranges) {
            this.oldDecorationsIDs = (await this.resolveModels()).resultsModel.deltaDecorations(this.oldDecorationsIDs, ranges.map(range => ({ range, options: { description: 'search-editor-find-match', className: constants_1.SearchEditorFindMatchClass, stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */ } })));
        }
        async revert(group, options) {
            if (options?.soft) {
                this.setDirty(false);
                return;
            }
            if (this.backingUri) {
                const { config, text } = await this.instantiationService.invokeFunction(searchEditorSerialization_1.parseSavedSearchEditor, this.backingUri);
                const { resultsModel, configurationModel } = await this.resolveModels();
                resultsModel.setValue(text);
                configurationModel.updateConfig(config);
            }
            else {
                (await this.resolveModels()).resultsModel.setValue('');
            }
            super.revert(group, options);
            this.setDirty(false);
        }
        async backup(token) {
            const contents = await this.serializeForDisk();
            if (token.isCancellationRequested) {
                return {};
            }
            return {
                content: (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString(contents))
            };
        }
        async suggestFileName() {
            const query = (await this.resolveModels()).configurationModel.config.query;
            const searchFileName = (query.replace(/[^\w \-_]+/g, '_') || 'Search') + exports.SEARCH_EDITOR_EXT;
            return (0, resources_1.joinPath)(await this.fileDialogService.defaultFilePath(this.pathService.defaultUriScheme), searchFileName);
        }
        toUntyped() {
            if (this.hasCapability(4 /* EditorInputCapabilities.Untitled */)) {
                return undefined;
            }
            return {
                resource: this.resource,
                options: {
                    override: SearchEditorInput_1.ID
                }
            };
        }
    };
    exports.SearchEditorInput = SearchEditorInput;
    exports.SearchEditorInput = SearchEditorInput = SearchEditorInput_1 = __decorate([
        __param(2, model_1.IModelService),
        __param(3, textfiles_1.ITextFileService),
        __param(4, dialogs_1.IFileDialogService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, workingCopyService_1.IWorkingCopyService),
        __param(7, telemetry_1.ITelemetryService),
        __param(8, pathService_1.IPathService),
        __param(9, storage_1.IStorageService)
    ], SearchEditorInput);
    const getOrMakeSearchEditorInput = (accessor, existingData) => {
        const storageService = accessor.get(storage_1.IStorageService);
        const configurationService = accessor.get(configuration_1.IConfigurationService);
        const instantiationService = accessor.get(instantiation_1.IInstantiationService);
        const modelUri = existingData.from === 'model' ? existingData.modelUri : uri_1.URI.from({ scheme: constants_1.SearchEditorScheme, fragment: `${Math.random()}` });
        if (!searchEditorModel_1.searchEditorModelFactory.models.has(modelUri)) {
            if (existingData.from === 'existingFile') {
                instantiationService.invokeFunction(accessor => searchEditorModel_1.searchEditorModelFactory.initializeModelFromExistingFile(accessor, modelUri, existingData.fileUri));
            }
            else {
                const searchEditorSettings = configurationService.getValue('search').searchEditor;
                const reuseOldSettings = searchEditorSettings.reusePriorSearchConfiguration;
                const defaultNumberOfContextLines = searchEditorSettings.defaultNumberOfContextLines;
                const priorConfig = reuseOldSettings ? new memento_1.Memento(SearchEditorInput.ID, storageService).getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */).searchConfig : {};
                const defaultConfig = (0, searchEditorSerialization_1.defaultSearchConfig)();
                const config = { ...defaultConfig, ...priorConfig, ...existingData.config };
                if (defaultNumberOfContextLines !== null && defaultNumberOfContextLines !== undefined) {
                    config.contextLines = existingData?.config?.contextLines ?? defaultNumberOfContextLines;
                }
                if (existingData.from === 'rawData') {
                    if (existingData.resultsContents) {
                        config.contextLines = 0;
                    }
                    instantiationService.invokeFunction(accessor => searchEditorModel_1.searchEditorModelFactory.initializeModelFromRawData(accessor, modelUri, config, existingData.resultsContents));
                }
                else {
                    instantiationService.invokeFunction(accessor => searchEditorModel_1.searchEditorModelFactory.initializeModelFromExistingModel(accessor, modelUri, config));
                }
            }
        }
        return instantiationService.createInstance(SearchEditorInput, modelUri, existingData.from === 'existingFile'
            ? existingData.fileUri
            : existingData.from === 'model'
                ? existingData.backupOf
                : undefined);
    };
    exports.getOrMakeSearchEditorInput = getOrMakeSearchEditorInput;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoRWRpdG9ySW5wdXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9zZWFyY2hFZGl0b3IvYnJvd3Nlci9zZWFyY2hFZGl0b3JJbnB1dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBbURuRixRQUFBLGlCQUFpQixHQUFHLGNBQWMsQ0FBQztJQUV6QyxJQUFNLGlCQUFpQixHQUF2QixNQUFNLGlCQUFrQixTQUFRLHlCQUFXOztpQkFDakMsT0FBRSxHQUFXLG1DQUF1QixBQUFsQyxDQUFtQztRQUVyRCxJQUFhLE1BQU07WUFDbEIsT0FBTyxtQkFBaUIsQ0FBQyxFQUFFLENBQUM7UUFDN0IsQ0FBQztRQUVELElBQWEsUUFBUTtZQUNwQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDcEIsQ0FBQztRQUVELElBQWEsWUFBWTtZQUN4QixJQUFJLFlBQVksNENBQW9DLENBQUM7WUFDckQsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ3JCLFlBQVksNENBQW9DLENBQUM7YUFDakQ7WUFFRCxPQUFPLFlBQVksQ0FBQztRQUNyQixDQUFDO1FBZ0JELElBQUksUUFBUTtZQUNYLE9BQU8sSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3pDLENBQUM7UUFRRCxZQUNpQixRQUFhLEVBQ2IsVUFBMkIsRUFDNUIsWUFBNEMsRUFDekMsZUFBb0QsRUFDbEQsaUJBQXNELEVBQ25ELG9CQUE0RCxFQUM5RCxrQkFBd0QsRUFDMUQsZ0JBQW9ELEVBQ3pELFdBQTBDLEVBQ3ZDLGNBQStCO1lBRWhELEtBQUssRUFBRSxDQUFDO1lBWFEsYUFBUSxHQUFSLFFBQVEsQ0FBSztZQUNiLGVBQVUsR0FBVixVQUFVLENBQWlCO1lBQ1gsaUJBQVksR0FBWixZQUFZLENBQWU7WUFDdEIs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