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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/editor/common/core/editOperation", "vs/editor/common/core/range", "vs/editor/common/model/textModel", "vs/editor/common/core/textModelDefaults", "vs/editor/common/languages/modesRegistry", "vs/editor/common/languages/language", "vs/editor/common/services/textResourceConfiguration", "vs/platform/configuration/common/configuration", "vs/platform/undoRedo/common/undoRedo", "vs/base/common/hash", "vs/editor/common/model/editStack", "vs/base/common/network", "vs/base/common/objects", "vs/editor/common/languages/languageConfigurationRegistry"], function (require, exports, event_1, lifecycle_1, platform, editOperation_1, range_1, textModel_1, textModelDefaults_1, modesRegistry_1, language_1, textResourceConfiguration_1, configuration_1, undoRedo_1, hash_1, editStack_1, network_1, objects_1, languageConfigurationRegistry_1) {
    "use strict";
    var ModelService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ModelService = void 0;
    function MODEL_ID(resource) {
        return resource.toString();
    }
    function computeModelSha1(model) {
        // compute the sha1
        const shaComputer = new hash_1.StringSHA1();
        const snapshot = model.createSnapshot();
        let text;
        while ((text = snapshot.read())) {
            shaComputer.update(text);
        }
        return shaComputer.digest();
    }
    class ModelData {
        constructor(model, onWillDispose, onDidChangeLanguage) {
            this.model = model;
            this._modelEventListeners = new lifecycle_1.DisposableStore();
            this.model = model;
            this._modelEventListeners.add(model.onWillDispose(() => onWillDispose(model)));
            this._modelEventListeners.add(model.onDidChangeLanguage((e) => onDidChangeLanguage(model, e)));
        }
        dispose() {
            this._modelEventListeners.dispose();
        }
    }
    const DEFAULT_EOL = (platform.isLinux || platform.isMacintosh) ? 1 /* DefaultEndOfLine.LF */ : 2 /* DefaultEndOfLine.CRLF */;
    class DisposedModelInfo {
        constructor(uri, initialUndoRedoSnapshot, time, sharesUndoRedoStack, heapSize, sha1, versionId, alternativeVersionId) {
            this.uri = uri;
            this.initialUndoRedoSnapshot = initialUndoRedoSnapshot;
            this.time = time;
            this.sharesUndoRedoStack = sharesUndoRedoStack;
            this.heapSize = heapSize;
            this.sha1 = sha1;
            this.versionId = versionId;
            this.alternativeVersionId = alternativeVersionId;
        }
    }
    let ModelService = class ModelService extends lifecycle_1.Disposable {
        static { ModelService_1 = this; }
        static { this.MAX_MEMORY_FOR_CLOSED_FILES_UNDO_STACK = 20 * 1024 * 1024; }
        constructor(_configurationService, _resourcePropertiesService, _undoRedoService, _languageService, _languageConfigurationService) {
            super();
            this._configurationService = _configurationService;
            this._resourcePropertiesService = _resourcePropertiesService;
            this._undoRedoService = _undoRedoService;
            this._languageService = _languageService;
            this._languageConfigurationService = _languageConfigurationService;
            this._onModelAdded = this._register(new event_1.Emitter());
            this.onModelAdded = this._onModelAdded.event;
            this._onModelRemoved = this._register(new event_1.Emitter());
            this.onModelRemoved = this._onModelRemoved.event;
            this._onModelModeChanged = this._register(new event_1.Emitter());
            this.onModelLanguageChanged = this._onModelModeChanged.event;
            this._modelCreationOptionsByLanguageAndResource = Object.create(null);
            this._models = {};
            this._disposedModels = new Map();
            this._disposedModelsHeapSize = 0;
            this._register(this._configurationService.onDidChangeConfiguration(e => this._updateModelOptions(e)));
            this._updateModelOptions(undefined);
        }
        static _readModelOptions(config, isForSimpleWidget) {
            let tabSize = textModelDefaults_1.EDITOR_MODEL_DEFAULTS.tabSize;
            if (config.editor && typeof config.editor.tabSize !== 'undefined') {
                const parsedTabSize = parseInt(config.editor.tabSize, 10);
                if (!isNaN(parsedTabSize)) {
                    tabSize = parsedTabSize;
                }
                if (tabSize < 1) {
                    tabSize = 1;
                }
            }
            let indentSize = 'tabSize';
            if (config.editor && typeof config.editor.indentSize !== 'undefined' && config.editor.indentSize !== 'tabSize') {
                const parsedIndentSize = parseInt(config.editor.indentSize, 10);
                if (!isNaN(parsedIndentSize)) {
                    indentSize = Math.max(parsedIndentSize, 1);
                }
            }
            let insertSpaces = textModelDefaults_1.EDITOR_MODEL_DEFAULTS.insertSpaces;
            if (config.editor && typeof config.editor.insertSpaces !== 'undefined') {
                insertSpaces = (config.editor.insertSpaces === 'false' ? false : Boolean(config.editor.insertSpaces));
            }
            let newDefaultEOL = DEFAULT_EOL;
            const eol = config.eol;
            if (eol === '\r\n') {
                newDefaultEOL = 2 /* DefaultEndOfLine.CRLF */;
            }
            else if (eol === '\n') {
                newDefaultEOL = 1 /* DefaultEndOfLine.LF */;
            }
            let trimAutoWhitespace = textModelDefaults_1.EDITOR_MODEL_DEFAULTS.trimAutoWhitespace;
            if (config.editor && typeof config.editor.trimAutoWhitespace !== 'undefined') {
                trimAutoWhitespace = (config.editor.trimAutoWhitespace === 'false' ? false : Boolean(config.editor.trimAutoWhitespace));
            }
            let detectIndentation = textModelDefaults_1.EDITOR_MODEL_DEFAULTS.detectIndentation;
            if (config.editor && typeof config.editor.detectIndentation !== 'undefined') {
                detectIndentation = (config.editor.detectIndentation === 'false' ? false : Boolean(config.editor.detectIndentation));
            }
            let largeFileOptimizations = textModelDefaults_1.EDITOR_MODEL_DEFAULTS.largeFileOptimizations;
            if (config.editor && typeof config.editor.largeFileOptimizations !== 'undefined') {
                largeFileOptimizations = (config.editor.largeFileOptimizations === 'false' ? false : Boolean(config.editor.largeFileOptimizations));
            }
            let bracketPairColorizationOptions = textModelDefaults_1.EDITOR_MODEL_DEFAULTS.bracketPairColorizationOptions;
            if (config.editor?.bracketPairColorization && typeof config.editor.bracketPairColorization === 'object') {
                bracketPairColorizationOptions = {
                    enabled: !!config.editor.bracketPairColorization.enabled,
                    independentColorPoolPerBracketType: !!config.editor.bracketPairColorization.independentColorPoolPerBracketType
                };
            }
            return {
                isForSimpleWidget: isForSimpleWidget,
                tabSize: tabSize,
                indentSize: indentSize,
                insertSpaces: insertSpaces,
                detectIndentation: detectIndentation,
                defaultEOL: newDefaultEOL,
                trimAutoWhitespace: trimAutoWhitespace,
                largeFileOptimizations: largeFileOptimizations,
                bracketPairColorizationOptions
            };
        }
        _getEOL(resource, language) {
            if (resource) {
                return this._resourcePropertiesService.getEOL(resource, language);
            }
            const eol = this._configurationService.getValue('files.eol', { overrideIdentifier: language });
            if (eol && typeof eol === 'string' && eol !== 'auto') {
                return eol;
            }
            return platform.OS === 3 /* platform.OperatingSystem.Linux */ || platform.OS === 2 /* platform.OperatingSystem.Macintosh */ ? '\n' : '\r\n';
        }
        _shouldRestoreUndoStack() {
            const result = this._configurationService.getValue('files.restoreUndoStack');
            if (typeof result === 'boolean') {
                return result;
            }
            return true;
        }
        getCreationOptions(languageIdOrSelection, resource, isForSimpleWidget) {
            const language = (typeof languageIdOrSelection === 'string' ? languageIdOrSelection : languageIdOrSelection.languageId);
            let creationOptions = this._modelCreationOptionsByLanguageAndResource[language + resource];
            if (!creationOptions) {
                const editor = this._configurationService.getValue('editor', { overrideIdentifier: language, resource });
                const eol = this._getEOL(resource, language);
                creationOptions = ModelService_1._readModelOptions({ editor, eol }, isForSimpleWidget);
                this._modelCreationOptionsByLanguageAndResource[language + resource] = creationOptions;
            }
            return creationOptions;
        }
        _updateModelOptions(e) {
            const oldOptionsByLanguageAndResource = this._modelCreationOptionsByLanguageAndResource;
            this._modelCreationOptionsByLanguageAndResource = Object.create(null);
            // Update options on all models
            const keys = Object.keys(this._models);
            for (let i = 0, len = keys.length; i < len; i++) {
                const modelId = keys[i];
                const modelData = this._models[modelId];
                const language = modelData.model.getLanguageId();
                const uri = modelData.model.uri;
                if (e && !e.affectsConfiguration('editor', { overrideIdentifier: language, resource: uri }) && !e.affectsConfiguration('files.eol', { overrideIdentifier: language, resource: uri })) {
                    continue; // perf: skip if this model is not affected by configuration change
                }
                const oldOptions = oldOptionsByLanguageAndResource[language + uri];
                const newOptions = this.getCreationOptions(language, uri, modelData.model.isForSimpleWidget);
                ModelService_1._setModelOptionsForModel(modelData.model, newOptions, oldOptions);
            }
        }
        static _setModelOptionsForModel(model, newOptions, currentOptions) {
            if (currentOptions && currentOptions.defaultEOL !== newOptions.defaultEOL && model.getLineCount() === 1) {
                model.setEOL(newOptions.defaultEOL === 1 /* DefaultEndOfLine.LF */ ? 0 /* EndOfLineSequence.LF */ : 1 /* EndOfLineSequence.CRLF */);
            }
            if (currentOptions
                && (currentOptions.detectIndentation === newOptions.detectIndentation)
                && (currentOptions.insertSpaces === newOptions.insertSpaces)
                && (currentOptions.tabSize === newOptions.tabSize)
                && (currentOptions.indentSize === newOptions.indentSize)
                && (currentOptions.trimAutoWhitespace === newOptions.trimAutoWhitespace)
                && (0, objects_1.equals)(currentOptions.bracketPairColorizationOptions, newOptions.bracketPairColorizationOptions)) {
                // Same indent opts, no need to touch the model
                return;
            }
            if (newOptions.detectIndentation) {
                model.detectIndentation(newOptions.insertSpaces, newOptions.tabSize);
                model.updateOptions({
                    trimAutoWhitespace: newOptions.trimAutoWhitespace,
                    bracketColorizationOptions: newOptions.bracketPairColorizationOptions
                });
            }
            else {
                model.updateOptions({
                    insertSpaces: newOptions.insertSpaces,
                    tabSize: newOptions.tabSize,
                    indentSize: newOptions.indentSize,
                    trimAutoWhitespace: newOptions.trimAutoWhitespace,
                    bracketColorizationOptions: newOptions.bracketPairColorizationOptions
                });
            }
        }
        // --- begin IModelService
        _insertDisposedModel(disposedModelData) {
            this._disposedModels.set(MODEL_ID(disposedModelData.uri), disposedModelData);
            this._disposedModelsHeapSize += disposedModelData.heapSize;
        }
        _removeDisposedModel(resource) {
            const disposedModelData = this._disposedModels.get(MODEL_ID(resource));
            if (disposedModelData) {
                this._disposedModelsHeapSize -= disposedModelData.heapSize;
            }
            this._disposedModels.delete(MODEL_ID(resource));
            return disposedModelData;
        }
        _ensureDisposedModelsHeapSize(maxModelsHeapSize) {
            if (this._disposedModelsHeapSize > maxModelsHeapSize) {
                // we must remove some old undo stack elements to free up some memory
                const disposedModels = [];
                this._disposedModels.forEach(entry => {
                    if (!entry.sharesUndoRedoStack) {
                        disposedModels.push(entry);
                    }
                });
                disposedModels.sort((a, b) => a.time - b.time);
                while (disposedModels.length > 0 && this._disposedModelsHeapSize > maxModelsHeapSize) {
                    const disposedModel = disposedModels.shift();
                    this._removeDisposedModel(disposedModel.uri);
                    if (disposedModel.initialUndoRedoSnapshot !== null) {
                        this._undoRedoService.restoreSnapshot(disposedModel.initialUndoRedoSnapshot);
                    }
                }
            }
        }
        _createModelData(value, languageIdOrSelection, resource, isForSimpleWidget) {
            // create & save the model
            const options = this.getCreationOptions(languageIdOrSelection, resource, isForSimpleWidget);
            const model = new textModel_1.TextModel(value, languageIdOrSelection, options, resource, this._undoRedoService, this._languageService, this._languageConfigurationService);
            if (resource && this._disposedModels.has(MODEL_ID(resource))) {
                const disposedModelData = this._removeDisposedModel(resource);
                const elements = this._undoRedoService.getElements(resource);
                const sha1IsEqual = (computeModelSha1(model) === disposedModelData.sha1);
                if (sha1IsEqual || disposedModelData.sharesUndoRedoStack) {
                    for (const element of elements.past) {
                        if ((0, editStack_1.isEditStackElement)(element) && element.matchesResource(resource)) {
                            element.setModel(model);
                        }
                    }
                    for (const element of elements.future) {
                        if ((0, editStack_1.isEditStackElement)(element) && element.matchesResource(resource)) {
                            element.setModel(model);
                        }
                    }
                    this._undoRedoService.setElementsValidFlag(resource, true, (element) => ((0, editStack_1.isEditStackElement)(element) && element.matchesResource(resource)));
                    if (sha1IsEqual) {
                        model._overwriteVersionId(disposedModelData.versionId);
                        model._overwriteAlternativeVersionId(disposedModelData.alternativeVersionId);
                        model._overwriteInitialUndoRedoSnapshot(disposedModelData.initialUndoRedoSnapshot);
                    }
                }
                else {
                    if (disposedModelData.initialUndoRedoSnapshot !== null) {
                        this._undoRedoService.restoreSnapshot(disposedModelData.initialUndoRedoSnapshot);
                    }
                }
            }
            const modelId = MODEL_ID(model.uri);
            if (this._models[modelId]) {
                // There already exists a model with this id => this is a programmer error
                throw new Error('ModelService: Cannot add model because it already exists!');
            }
            const modelData = new ModelData(model, (model) => this._onWillDispose(model), (model, e) => this._onDidChangeLanguage(model, e));
            this._models[modelId] = modelData;
            return modelData;
        }
        updateModel(model, value) {
            const options = this.getCreationOptions(model.getLanguageId(), model.uri, model.isForSimpleWidget);
            const { textBuffer, disposable } = (0, textModel_1.createTextBuffer)(value, options.defaultEOL);
            // Return early if the text is already set in that form
            if (model.equalsTextBuffer(textBuffer)) {
                disposable.dispose();
                return;
            }
            // Otherwise find a diff between the values and update model
            model.pushStackElement();
            model.pushEOL(textBuffer.getEOL() === '\r\n' ? 1 /* EndOfLineSequence.CRLF */ : 0 /* EndOfLineSequence.LF */);
            model.pushEditOperations([], ModelService_1._computeEdits(model, textBuffer), () => []);
            model.pushStackElement();
            disposable.dispose();
        }
        static _commonPrefix(a, aLen, aDelta, b, bLen, bDelta) {
            const maxResult = Math.min(aLen, bLen);
            let result = 0;
            for (let i = 0; i < maxResult && a.getLineContent(aDelta + i) === b.getLineContent(bDelta + i); i++) {
                result++;
            }
            return result;
        }
        static _commonSuffix(a, aLen, aDelta, b, bLen, bDelta) {
            const maxResult = Math.min(aLen, bLen);
            let result = 0;
            for (let i = 0; i < maxResult && a.getLineContent(aDelta + aLen - i) === b.getLineContent(bDelta + bLen - i); i++) {
                result++;
            }
            return result;
        }
        /**
         * Compute edits to bring `model` to the state of `textSource`.
         */
        static _computeEdits(model, textBuffer) {
            const modelLineCount = model.getLineCount();
            const textBufferLineCount = textBuffer.getLineCount();
            const commonPrefix = this._commonPrefix(model, modelLineCount, 1, textBuffer, textBufferLineCount, 1);
            if (modelLineCount === textBufferLineCount && commonPrefix === modelLineCount) {
                // equality case
                return [];
            }
            const commonSuffix = this._commonSuffix(model, modelLineCount - commonPrefix, commonPrefix, textBuffer, textBufferLineCount - commonPrefix, commonPrefix);
            let oldRange;
            let newRange;
            if (commonSuffix > 0) {
                oldRange = new range_1.Range(commonPrefix + 1, 1, modelLineCount - commonSuffix + 1, 1);
                newRange = new range_1.Range(commonPrefix + 1, 1, textBufferLineCount - commonSuffix + 1, 1);
            }
            else if (commonPrefix > 0) {
                oldRange = new range_1.Range(commonPrefix, model.getLineMaxColumn(commonPrefix), modelLineCount, model.getLineMaxColumn(modelLineCount));
                newRange = new range_1.Range(commonPrefix, 1 + textBuffer.getLineLength(commonPrefix), textBufferLineCount, 1 + textBuffer.getLineLength(textBufferLineCount));
            }
            else {
                oldRange = new range_1.Range(1, 1, modelLineCount, model.getLineMaxColumn(modelLineCount));
                newRange = new range_1.Range(1, 1, textBufferLineCount, 1 + textBuffer.getLineLength(textBufferLineCount));
            }
            return [editOperation_1.EditOperation.replaceMove(oldRange, textBuffer.getValueInRange(newRange, 0 /* EndOfLinePreference.TextDefined */))];
        }
        createModel(value, languageSelection, resource, isForSimpleWidget = false) {
            let modelData;
            if (languageSelection) {
                modelData = this._createModelData(value, languageSelection, resource, isForSimpleWidget);
            }
            else {
                modelData = this._createModelData(value, modesRegistry_1.PLAINTEXT_LANGUAGE_ID, resource, isForSimpleWidget);
            }
            this._onModelAdded.fire(modelData.model);
            return modelData.model;
        }
        destroyModel(resource) {
            // We need to support that not all models get disposed through this service (i.e. model.dispose() should work!)
            const modelData = this._models[MODEL_ID(resource)];
            if (!modelData) {
                return;
            }
            modelData.model.dispose();
        }
        getModels() {
            const ret = [];
            const keys = Object.keys(this._models);
            for (let i = 0, len = keys.length; i < len; i++) {
                const modelId = keys[i];
                ret.push(this._models[modelId].model);
            }
            return ret;
        }
        getModel(resource) {
            const modelId = MODEL_ID(resource);
            const modelData = this._models[modelId];
            if (!modelData) {
                return null;
            }
            return modelData.model;
        }
        // --- end IModelService
        _schemaShouldMaintainUndoRedoElements(resource) {
            return (resource.scheme === network_1.Schemas.file
                || resource.scheme === network_1.Schemas.vscodeRemote
                || resource.scheme === network_1.Schemas.vscodeUserData
                || resource.scheme === network_1.Schemas.vscodeNotebookCell
                || resource.scheme === 'fake-fs' // for tests
            );
        }
        _onWillDispose(model) {
            const modelId = MODEL_ID(model.uri);
            const modelData = this._models[modelId];
            const sharesUndoRedoStack = (this._undoRedoService.getUriComparisonKey(model.uri) !== model.uri.toString());
            let maintainUndoRedoStack = false;
            let heapSize = 0;
            if (sharesUndoRedoStack || (this._shouldRestoreUndoStack() && this._schemaShouldMaintainUndoRedoElements(model.uri))) {
                const elements = this._undoRedoService.getElements(model.uri);
                if (elements.past.length > 0 || elements.future.length > 0) {
                    for (const element of elements.past) {
                        if ((0, editStack_1.isEditStackElement)(element) && element.matchesResource(model.uri)) {
                            maintainUndoRedoStack = true;
                            heapSize += element.heapSize(model.uri);
                            element.setModel(model.uri); // remove reference from text buffer instance
                        }
                    }
                    for (const element of elements.future) {
                        if ((0, editStack_1.isEditStackElement)(element) && element.matchesResource(model.uri)) {
                            maintainUndoRedoStack = true;
                            heapSize += element.heapSize(model.uri);
                            element.setModel(model.uri); // remove reference from text buffer instance
                        }
                    }
                }
            }
            const maxMemory = ModelService_1.MAX_MEMORY_FOR_CLOSED_FILES_UNDO_STACK;
            if (!maintainUndoRedoStack) {
                if (!sharesUndoRedoStack) {
                    const initialUndoRedoSnapshot = modelData.model.getInitialUndoRedoSnapshot();
                    if (initialUndoRedoSnapshot !== null) {
                        this._undoRedoService.restoreSnapshot(initialUndoRedoSnapshot);
                    }
                }
            }
            else if (!sharesUndoRedoStack && heapSize > maxMemory) {
                // the undo stack for this file would never fit in the configured memory, so don't bother with it.
                const initialUndoRedoSnapshot = modelData.model.getInitialUndoRedoSnapshot();
                if (initialUndoRedoSnapshot !== null) {
                    this._undoRedoService.restoreSnapshot(initialUndoRedoSnapshot);
                }
            }
            else {
                this._ensureDisposedModelsHeapSize(maxMemory - heapSize);
                // We only invalidate the elements, but they remain in the undo-redo service.
                this._undoRedoService.setElementsValidFlag(model.uri, false, (element) => ((0, editStack_1.isEditStackElement)(element) && element.matchesResource(model.uri)));
                this._insertDisposedModel(new DisposedModelInfo(model.uri, modelData.model.getInitialUndoRedoSnapshot(), Date.now(), sharesUndoRedoStack, heapSize, computeModelSha1(model), model.getVersionId(), model.getAlternativeVersionId()));
            }
            delete this._models[modelId];
            modelData.dispose();
            // clean up cache
            delete this._modelCreationOptionsByLanguageAndResource[model.getLanguageId() + model.uri];
            this._onModelRemoved.fire(model);
        }
        _onDidChangeLanguage(model, e) {
            const oldLanguageId = e.oldLanguage;
            const newLanguageId = model.getLanguageId();
            const oldOptions = this.getCreationOptions(oldLanguageId, model.uri, model.isForSimpleWidget);
            const newOptions = this.getCreationOptions(newLanguageId, model.uri, model.isForSimpleWidget);
            ModelService_1._setModelOptionsForModel(model, newOptions, oldOptions);
            this._onModelModeChanged.fire({ model, oldLanguageId: oldLanguageId });
        }
    };
    exports.ModelService = ModelService;
    exports.ModelService = ModelService = ModelService_1 = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, textResourceConfiguration_1.ITextResourcePropertiesService),
        __param(2, undoRedo_1.IUndoRedoService),
        __param(3, language_1.ILanguageService),
        __param(4, languageConfigurationRegistry_1.ILanguageConfigurationService)
    ], ModelService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWxTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9zZXJ2aWNlcy9tb2RlbFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQXdCaEcsU0FBUyxRQUFRLENBQUMsUUFBYTtRQUM5QixPQUFPLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUM1QixDQUFDO0lBRUQsU0FBUyxnQkFBZ0IsQ0FBQyxLQUFpQjtRQUMxQyxtQkFBbUI7UUFDbkIsTUFBTSxXQUFXLEdBQUcsSUFBSSxpQkFBVSxFQUFFLENBQUM7UUFDckMsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3hDLElBQUksSUFBbUIsQ0FBQztRQUN4QixPQUFPLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFO1lBQ2hDLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDekI7UUFDRCxPQUFPLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUM3QixDQUFDO0lBRUQsTUFBTSxTQUFTO1FBSWQsWUFDaUIsS0FBZ0IsRUFDaEMsYUFBMEMsRUFDMUMsbUJBQStFO1lBRi9ELFVBQUssR0FBTCxLQUFLLENBQVc7WUFIaEIseUJBQW9CLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFPN0QsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDbkIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBRSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0UsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLG1CQUFtQixDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEcsQ0FBQztRQUVNLE9BQU87WUFDYixJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDckMsQ0FBQztLQUNEO0lBa0JELE1BQU0sV0FBVyxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sSUFBSSxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyw2QkFBcUIsQ0FBQyw4QkFBc0IsQ0FBQztJQUU3RyxNQUFNLGlCQUFpQjtRQUN0QixZQUNpQixHQUFRLEVBQ1IsdUJBQXlELEVBQ3pELElBQVksRUFDWixtQkFBNEIsRUFDNUIsUUFBZ0IsRUFDaEIsSUFBWSxFQUNaLFNBQWlCLEVBQ2pCLG9CQUE0QjtZQVA1QixRQUFHLEdBQUgsR0FBRyxDQUFLO1lBQ1IsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUFrQztZQUN6RCxTQUFJLEdBQUosSUFBSSxDQUFRO1lBQ1osd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFTO1lBQzVCLGFBQVEsR0FBUixRQUFRLENBQVE7WUFDaEIsU0FBSSxHQUFKLElBQUksQ0FBUTtZQUNaLGNBQVMsR0FBVCxTQUFTLENBQVE7WUFDakIseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFRO1FBQ3pDLENBQUM7S0FDTDtJQUVNLElBQU0sWUFBWSxHQUFsQixNQUFNLFlBQWEsU0FBUSxzQkFBVTs7aUJBRTdCLDJDQUFzQyxHQUFHLEVBQUUsR0FBRyxJQUFJLEdBQUcsSUFBSSxBQUFuQixDQUFvQjtRQXNCeEUsWUFDd0IscUJBQTZELEVBQ3BELDBCQUEyRSxFQUN6RixnQkFBbUQsRUFDbkQsZ0JBQW1ELEVBQ3RDLDZCQUE2RTtZQUU1RyxLQUFLLEVBQUUsQ0FBQztZQU5nQywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBQ25DLCtCQUEwQixHQUExQiwwQkFBMEIsQ0FBZ0M7WUFDeEUscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtZQUNsQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1lBQ3JCLGtDQUE2QixHQUE3Qiw2QkFBNkIsQ0FBK0I7WUF2QjVGLGtCQUFhLEdBQXdCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQWMsQ0FBQyxDQUFDO1lBQ2hGLGlCQUFZLEdBQXNCLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDO1lBRTFELG9CQUFlLEdBQXdCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQWMsQ0FBQyxDQUFDO1lBQ2xGLG1CQUFjLEdBQXNCLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDO1lBRTlELHdCQUFtQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQWdELENBQUMsQ0FBQztZQUNuRywyQkFBc0IsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDO1lBbUJ2RSxJQUFJLENBQUMsMENBQTBDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN0RSxJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUNsQixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksR0FBRyxFQUE2QixDQUFDO1lBQzVELElBQUksQ0FBQyx1QkFBdUIsR0FBRyxDQUFDLENBQUM7WUFFakMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNyQyxDQUFDO1FBRU8sTUFBTSxDQUFDLGlCQUFpQixDQUFDLE1BQWtCLEVBQUUsaUJBQTBCO1lBQzlFLElBQUksT0FBTyxHQUFHLHlDQUFxQixDQUFDLE9BQU8sQ0FBQztZQUM1QyxJQUFJLE1BQU0sQ0FBQyxNQUFNLElBQUksT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sS0FBSyxXQUFXLEVBQUU7Z0JBQ2xFLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDMUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsRUFBRTtvQkFDMUIsT0FBTyxHQUFHLGFBQWEsQ0FBQztpQkFDeEI7Z0JBQ0QsSUFBSSxPQUFPLEdBQUcsQ0FBQyxFQUFFO29CQUNoQixPQUFPLEdBQUcsQ0FBQyxDQUFDO2lCQUNaO2FBQ0Q7WUFFRCxJQUFJLFVBQVUsR0FBdUIsU0FBUyxDQUFDO1lBQy9DLElBQUksTUFBTSxDQUFDLE1BQU0sSUFBSSxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxLQUFLLFdBQVcsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsS0FBSyxTQUFTLEVBQUU7Z0JBQy9HLE1BQU0sZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUNoRSxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEVBQUU7b0JBQzdCLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUMzQzthQUNEO1lBRUQsSUFBSSxZQUFZLEdBQUcseUNBQXFCLENBQUMsWUFBWSxDQUFDO1lBQ3RELElBQUksTUFBTSxDQUFDLE1BQU0sSUFBSSxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsWUFBWSxLQUFLLFdBQVcsRUFBRTtnQkFDdkUsWUFBWSxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7YUFDdEc7WUFFRCxJQUFJLGFBQWEsR0FBRyxXQUFXLENBQUM7WUFDaEMsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQztZQUN2QixJQUFJLEdBQUcsS0FBSyxNQUFNLEVBQUU7Z0JBQ25CLGFBQWEsZ0NBQXdCLENBQUM7YUFDdEM7aUJBQU0sSUFBSSxHQUFHLEtBQUssSUFBSSxFQUFFO2dCQUN4QixhQUFhLDhCQUFzQixDQUFDO2FBQ3BDO1lBRUQsSUFBSSxrQkFBa0IsR0FBRyx5Q0FBcUIsQ0FBQyxrQkFBa0IsQ0FBQztZQUNsRSxJQUFJLE1BQU0sQ0FBQyxNQUFNLElBQUksT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLGtCQUFrQixLQUFLLFdBQVcsRUFBRTtnQkFDN0Usa0JBQWtCLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGtCQUFrQixLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7YUFDeEg7WUFFRCxJQUFJLGlCQUFpQixHQUFHLHlDQUFxQixDQUFDLGlCQUFpQixDQUFDO1lBQ2hFLElBQUksTUFBTSxDQUFDLE1BQU0sSUFBSSxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEtBQUssV0FBVyxFQUFFO2dCQUM1RSxpQkFBaUIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQzthQUNySDtZQUVELElBQUksc0JBQXNCLEdBQUcseUNBQXFCLENBQUMsc0JBQXNCLENBQUM7WUFDMUUsSUFBSSxNQUFNLENBQUMsTUFBTSxJQUFJLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxzQkFBc0IsS0FBSyxXQUFXLEVBQUU7Z0JBQ2pGLHNCQUFzQixHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxzQkFBc0IsS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDO2FBQ3BJO1lBQ0QsSUFBSSw4QkFBOEIsR0FBRyx5Q0FBcUIsQ0FBQyw4QkFBOEIsQ0FBQztZQUMxRixJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUUsdUJBQXVCLElBQUksT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLHVCQUF1QixLQUFLLFFBQVEsRUFBRTtnQkFDeEcsOEJBQThCLEdBQUc7b0JBQ2hDLE9BQU8sRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPO29CQUN4RCxrQ0FBa0MsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxrQ0FBa0M7aUJBQzlHLENBQUM7YUFDRjtZQUVELE9BQU87Z0JBQ04saUJBQWlCLEVBQUUsaUJBQWlCO2dCQUNwQyxPQUFPLEVBQUUsT0FBTztnQkFDaEIsVUFBVSxFQUFFLFVBQVU7Z0JBQ3RCLFlBQVksRUFBRSxZQUFZO2dCQUMxQixpQkFBaUIsRUFBRSxpQkFBaUI7Z0JBQ3BDLFVBQVUsRUFBRSxhQUFhO2dCQUN6QixrQkFBa0IsRUFBRSxrQkFBa0I7Z0JBQ3RDLHNCQUFzQixFQUFFLHNCQUFzQjtnQkFDOUMsOEJBQThCO2FBQzlCLENBQUM7UUFDSCxDQUFDO1FBRU8sT0FBTyxDQUFDLFFBQXlCLEVBQUUsUUFBZ0I7WUFDMUQsSUFBSSxRQUFRLEVBQUU7Z0JBQ2IsT0FBTyxJQUFJLENBQUMsMEJBQTBCLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQzthQUNsRTtZQUNELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLEVBQUUsa0JBQWtCLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUMvRixJQUFJLEdBQUcsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLElBQUksR0FBRyxLQUFLLE1BQU0sRUFBRTtnQkFDckQsT0FBTyxHQUFHLENBQUM7YUFDWDtZQUNELE9BQU8sUUFBUSxDQUFDLEVBQUUsMkNBQW1DLElBQUksUUFBUSxDQUFDLEVBQUUsK0NBQXVDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1FBQzdILENBQUM7UUFFTyx1QkFBdUI7WUFDOUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1lBQzdFLElBQUksT0FBTyxNQUFNLEtBQUssU0FBUyxFQUFFO2dCQUNoQyxPQUFPLE1BQU0sQ0FBQzthQUNkO1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sa0JBQWtCLENBQUMscUJBQWtELEVBQUUsUUFBeUIsRUFBRSxpQkFBMEI7WUFDbEksTUFBTSxRQUFRLEdBQUcsQ0FBQyxPQUFPLHFCQUFxQixLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3hILElBQUksZUFBZSxHQUFHLElBQUksQ0FBQywwQ0FBMEMsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLENBQUM7WUFDM0YsSUFBSSxDQUFDLGVBQWUsRUFBRTtnQkFDckIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsQ0FBbUIsUUFBUSxFQUFFLEVBQUUsa0JBQWtCLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7Z0JBQzNILE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUM3QyxlQUFlLEdBQUcsY0FBWSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFLGlCQUFpQixDQUFDLENBQUM7Z0JBQ3JGLElBQUksQ0FBQywwQ0FBMEMsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLEdBQUcsZUFBZSxDQUFDO2FBQ3ZGO1lBQ0QsT0FBTyxlQUFlLENBQUM7UUFDeEIsQ0FBQztRQUVPLG1CQUFtQixDQUFDLENBQXdDO1lBQ25FLE1BQU0sK0JBQStCLEdBQUcsSUFBSSxDQUFDLDBDQUEwQyxDQUFDO1lBQ3hGLElBQUksQ0FBQywwQ0FBMEMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXRFLCtCQUErQjtZQUMvQixNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN2QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNoRCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3hDLE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQ2pELE1BQU0sR0FBRyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDO2dCQUVoQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLEVBQUUsRUFBRSxrQkFBa0IsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsV0FBVyxFQUFFLEVBQUUsa0JBQWtCLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFO29CQUNyTCxTQUFTLENBQUMsbUVBQW1FO2lCQUM3RTtnQkFFRCxNQUFNLFVBQVUsR0FBRywrQkFBK0IsQ0FBQyxRQUFRLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQ25FLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztnQkFDN0YsY0FBWSxDQUFDLHdCQUF3QixDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO2FBQy9FO1FBQ0YsQ0FBQztRQUVPLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxLQUFpQixFQUFFLFVBQXFDLEVBQUUsY0FBeUM7WUFDMUksSUFBSSxjQUFjLElBQUksY0FBYyxDQUFDLFVBQVUsS0FBSyxVQUFVLENBQUMsVUFBVSxJQUFJLEtBQUssQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLEVBQUU7Z0JBQ3hHLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLFVBQVUsZ0NBQXdCLENBQUMsQ0FBQyw4QkFBc0IsQ0FBQywrQkFBdUIsQ0FBQyxDQUFDO2FBQzVHO1lBRUQsSUFBSSxjQUFjO21CQUNkLENBQUMsY0FBYyxDQUFDLGlCQUFpQixLQUFLLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQzttQkFDbkUsQ0FBQyxjQUFjLENBQUMsWUFBWSxLQUFLLFVBQVUsQ0FBQyxZQUFZLENBQUM7bUJBQ3pELENBQUMsY0FBYyxDQUFDLE9BQU8sS0FBSyxVQUFVLENBQUMsT0FBTyxDQUFDO21CQUMvQyxDQUFDLGNBQWMsQ0FBQyxVQUFVLEtBQUssVUFBVSxDQUFDLFVBQVUsQ0FBQzttQkFDckQsQ0FBQyxjQUFjLENBQUMsa0JBQWtCLEtBQUssVUFBVSxDQUFDLGtCQUFrQixDQUFDO21CQUNyRSxJQUFBLGdCQUFNLEVBQUMsY0FBYyxDQUFDLDhCQUE4QixFQUFFLFVBQVUsQ0FBQyw4QkFBOEIsQ0FBQyxFQUNsRztnQkFDRCwrQ0FBK0M7Z0JBQy9DLE9BQU87YUFDUDtZQUVELElBQUksVUFBVSxDQUFDLGlCQUFpQixFQUFFO2dCQUNqQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3JFLEtBQUssQ0FBQyxhQUFhLENBQUM7b0JBQ25CLGtCQUFrQixFQUFFLFVBQVUsQ0FBQyxrQkFBa0I7b0JBQ2pELDBCQUEwQixFQUFFLFVBQVUsQ0FBQyw4QkFBOEI7aUJBQ3JFLENBQUMsQ0FBQzthQUNIO2lCQUFNO2dCQUNOLEtBQUssQ0FBQyxhQUFhLENBQUM7b0JBQ25CLFlBQVksRUFBRSxVQUFVLENBQUMsWUFBWTtvQkFDckMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxPQUFPO29CQUMzQixVQUFVLEVBQUUsVUFBVSxDQUFDLFVBQVU7b0JBQ2pDLGtCQUFrQixFQUFFLFVBQVUsQ0FBQyxrQkFBa0I7b0JBQ2pELDBCQUEwQixFQUFFLFVBQVUsQ0FBQyw4QkFBOEI7aUJBQ3JFLENBQUMsQ0FBQzthQUNIO1FBQ0YsQ0FBQztRQUVELDBCQUEwQjtRQUVsQixvQkFBb0IsQ0FBQyxpQkFBb0M7WUFDaEUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLENBQUM7WUFDN0UsSUFBSSxDQUFDLHVCQUF1QixJQUFJLGlCQUFpQixDQUFDLFFBQVEsQ0FBQztRQUM1RCxDQUFDO1FBRU8sb0JBQW9CLENBQUMsUUFBYTtZQUN6QyxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ3ZFLElBQUksaUJBQWlCLEVBQUU7Z0JBQ3RCLElBQUksQ0FBQyx1QkFBdUIsSUFBSSxpQkFBaUIsQ0FBQyxRQUFRLENBQUM7YUFDM0Q7WUFDRCxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNoRCxPQUFPLGlCQUFpQixDQUFDO1FBQzFCLENBQUM7UUFFTyw2QkFBNkIsQ0FBQyxpQkFBeUI7WUFDOUQsSUFBSSxJQUFJLENBQUMsdUJBQXVCLEdBQUcsaUJBQWlCLEVBQUU7Z0JBQ3JELHFFQUFxRTtnQkFDckUsTUFBTSxjQUFjLEdBQXdCLEVBQUUsQ0FBQztnQkFDL0MsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQ3BDLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEVBQUU7d0JBQy9CLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7cUJBQzNCO2dCQUNGLENBQUMsQ0FBQyxDQUFDO2dCQUNILGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDL0MsT0FBTyxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsdUJBQXVCLEdBQUcsaUJBQWlCLEVBQUU7b0JBQ3JGLE1BQU0sYUFBYSxHQUFHLGNBQWMsQ0FBQyxLQUFLLEVBQUcsQ0FBQztvQkFDOUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDN0MsSUFBSSxhQUFhLENBQUMsdUJBQXVCLEtBQUssSUFBSSxFQUFFO3dCQUNuRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO3FCQUM3RTtpQkFDRDthQUNEO1FBQ0YsQ0FBQztRQUVPLGdCQUFnQixDQUFDLEtBQWtDLEVBQUUscUJBQWtELEVBQUUsUUFBeUIsRUFBRSxpQkFBMEI7WUFDckssMEJBQTBCO1lBQzFCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxxQkFBcUIsRUFBRSxRQUFRLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztZQUM1RixNQUFNLEtBQUssR0FBYyxJQUFJLHFCQUFTLENBQ3JDLEtBQUssRUFDTCxxQkFBcUIsRUFDckIsT0FBTyxFQUNQLFFBQVEsRUFDUixJQUFJLENBQUMsZ0JBQWdCLEVBQ3JCLElBQUksQ0FBQyxnQkFBZ0IsRUFDckIsSUFBSSxDQUFDLDZCQUE2QixDQUNsQyxDQUFDO1lBQ0YsSUFBSSxRQUFRLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUU7Z0JBQzdELE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBRSxDQUFDO2dCQUMvRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUM3RCxNQUFNLFdBQVcsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxLQUFLLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN6RSxJQUFJLFdBQVcsSUFBSSxpQkFBaUIsQ0FBQyxtQkFBbUIsRUFBRTtvQkFDekQsS0FBSyxNQUFNLE9BQU8sSUFBSSxRQUFRLENBQUMsSUFBSSxFQUFFO3dCQUNwQyxJQUFJLElBQUEsOEJBQWtCLEVBQUMsT0FBTyxDQUFDLElBQUksT0FBTyxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsRUFBRTs0QkFDckUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQzt5QkFDeEI7cUJBQ0Q7b0JBQ0QsS0FBSyxNQUFNLE9BQU8sSUFBSSxRQUFRLENBQUMsTUFBTSxFQUFFO3dCQUN0QyxJQUFJLElBQUEsOEJBQWtCLEVBQUMsT0FBTyxDQUFDLElBQUksT0FBTyxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsRUFBRTs0QkFDckUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQzt5QkFDeEI7cUJBQ0Q7b0JBQ0QsSUFBSSxDQUFDLGdCQUFnQixDQUFDLG9CQUFvQixDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBQSw4QkFBa0IsRUFBQyxPQUFPLENBQUMsSUFBSSxPQUFPLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDNUksSUFBSSxXQUFXLEVBQUU7d0JBQ2hCLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQzt3QkFDdkQsS0FBSyxDQUFDLDhCQUE4QixDQUFDLGlCQUFpQixDQUFDLG9CQUFvQixDQUFDLENBQUM7d0JBQzdFLEtBQUssQ0FBQyxpQ0FBaUMsQ0FBQyxpQkFBaUIsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO3FCQUNuRjtpQkFDRDtxQkFBTTtvQkFDTixJQUFJLGlCQUFpQixDQUFDLHVCQUF1QixLQUFLLElBQUksRUFBRTt3QkFDdkQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO3FCQUNqRjtpQkFDRDthQUNEO1lBQ0QsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUVwQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQzFCLDBFQUEwRTtnQkFDMUUsTUFBTSxJQUFJLEtBQUssQ0FBQywyREFBMkQsQ0FBQyxDQUFDO2FBQzdFO1lBRUQsTUFBTSxTQUFTLEdBQUcsSUFBSSxTQUFTLENBQzlCLEtBQUssRUFDTCxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsRUFDckMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUNqRCxDQUFDO1lBQ0YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxTQUFTLENBQUM7WUFFbEMsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztRQUVNLFdBQVcsQ0FBQyxLQUFpQixFQUFFLEtBQWtDO1lBQ3ZFLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNuRyxNQUFNLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxHQUFHLElBQUEsNEJBQWdCLEVBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUUvRSx1REFBdUQ7WUFDdkQsSUFBSSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQ3ZDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDckIsT0FBTzthQUNQO1lBRUQsNERBQTREO1lBQzVELEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3pCLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxLQUFLLE1BQU0sQ0FBQyxDQUFDLGdDQUF3QixDQUFDLDZCQUFxQixDQUFDLENBQUM7WUFDOUYsS0FBSyxDQUFDLGtCQUFrQixDQUN2QixFQUFFLEVBQ0YsY0FBWSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLEVBQzdDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FDUixDQUFDO1lBQ0YsS0FBSyxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDekIsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3RCLENBQUM7UUFFTyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQWEsRUFBRSxJQUFZLEVBQUUsTUFBYyxFQUFFLENBQWMsRUFBRSxJQUFZLEVBQUUsTUFBYztZQUNySCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUV2QyxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7WUFDZixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxJQUFJLENBQUMsQ0FBQyxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNwRyxNQUFNLEVBQUUsQ0FBQzthQUNUO1lBQ0QsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBRU8sTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFhLEVBQUUsSUFBWSxFQUFFLE1BQWMsRUFBRSxDQUFjLEVBQUUsSUFBWSxFQUFFLE1BQWM7WUFDckgsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFdkMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO1lBQ2YsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsSUFBSSxDQUFDLENBQUMsY0FBYyxDQUFDLE1BQU0sR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNsSCxNQUFNLEVBQUUsQ0FBQzthQUNUO1lBQ0QsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBRUQ7O1dBRUc7UUFDSSxNQUFNLENBQUMsYUFBYSxDQUFDLEtBQWlCLEVBQUUsVUFBdUI7WUFDckUsTUFBTSxjQUFjLEdBQUcsS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQzVDLE1BQU0sbUJBQW1CLEdBQUcsVUFBVSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3RELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLGNBQWMsRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRXRHLElBQUksY0FBYyxLQUFLLG1CQUFtQixJQUFJLFlBQVksS0FBSyxjQUFjLEVBQUU7Z0JBQzlFLGdCQUFnQjtnQkFDaEIsT0FBTyxFQUFFLENBQUM7YUFDVjtZQUVELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLGNBQWMsR0FBRyxZQUFZLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxtQkFBbUIsR0FBRyxZQUFZLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFFMUosSUFBSSxRQUFlLENBQUM7WUFDcEIsSUFBSSxRQUFlLENBQUM7WUFDcEIsSUFBSSxZQUFZLEdBQUcsQ0FBQyxFQUFFO2dCQUNyQixRQUFRLEdBQUcsSUFBSSxhQUFLLENBQUMsWUFBWSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsY0FBYyxHQUFHLFlBQVksR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hGLFFBQVEsR0FBRyxJQUFJLGFBQUssQ0FBQyxZQUFZLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxtQkFBbUIsR0FBRyxZQUFZLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQ3JGO2lCQUFNLElBQUksWUFBWSxHQUFHLENBQUMsRUFBRTtnQkFDNUIsUUFBUSxHQUFHLElBQUksYUFBSyxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLEVBQUUsY0FBYyxFQUFFLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO2dCQUNqSSxRQUFRLEdBQUcsSUFBSSxhQUFLLENBQUMsWUFBWSxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxFQUFFLG1CQUFtQixFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQzthQUN2SjtpQkFBTTtnQkFDTixRQUFRLEdBQUcsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxjQUFjLEVBQUUsS0FBSyxDQUFDLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25GLFFBQVEsR0FBRyxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLG1CQUFtQixFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQzthQUNuRztZQUVELE9BQU8sQ0FBQyw2QkFBYSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLGVBQWUsQ0FBQyxRQUFRLDBDQUFrQyxDQUFDLENBQUMsQ0FBQztRQUNySCxDQUFDO1FBRU0sV0FBVyxDQUFDLEtBQWtDLEVBQUUsaUJBQTRDLEVBQUUsUUFBYyxFQUFFLG9CQUE2QixLQUFLO1lBQ3RKLElBQUksU0FBb0IsQ0FBQztZQUV6QixJQUFJLGlCQUFpQixFQUFFO2dCQUN0QixTQUFTLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxpQkFBaUIsRUFBRSxRQUFRLEVBQUUsaUJBQWlCLENBQUMsQ0FBQzthQUN6RjtpQkFBTTtnQkFDTixTQUFTLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxxQ0FBcUIsRUFBRSxRQUFRLEVBQUUsaUJBQWlCLENBQUMsQ0FBQzthQUM3RjtZQUVELElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUV6QyxPQUFPLFNBQVMsQ0FBQyxLQUFLLENBQUM7UUFDeEIsQ0FBQztRQUVNLFlBQVksQ0FBQyxRQUFhO1lBQ2hDLCtHQUErRztZQUMvRyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ25ELElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ2YsT0FBTzthQUNQO1lBQ0QsU0FBUyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUMzQixDQUFDO1FBRU0sU0FBUztZQUNmLE1BQU0sR0FBRyxHQUFpQixFQUFFLENBQUM7WUFFN0IsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdkMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDaEQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN4QixHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDdEM7WUFFRCxPQUFPLEdBQUcsQ0FBQztRQUNaLENBQUM7UUFFTSxRQUFRLENBQUMsUUFBYTtZQUM1QixNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDbkMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN4QyxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNmLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFDRCxPQUFPLFNBQVMsQ0FBQyxLQUFLLENBQUM7UUFDeEIsQ0FBQztRQUVELHdCQUF3QjtRQUVkLHFDQUFxQyxDQUFDLFFBQWE7WUFDNUQsT0FBTyxDQUNOLFFBQVEsQ0FBQyxNQUFNLEtBQUssaUJBQU8sQ0FBQyxJQUFJO21CQUM3QixRQUFRLENBQUMsTUFBTSxLQUFLLGlCQUFPLENBQUMsWUFBWTttQkFDeEMsUUFBUSxDQUFDLE1BQU0sS0FBSyxpQkFBTyxDQUFDLGNBQWM7bUJBQzFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssaUJBQU8sQ0FBQyxrQkFBa0I7bUJBQzlDLFFBQVEsQ0FBQyxNQUFNLEtBQUssU0FBUyxDQUFDLFlBQVk7YUFDN0MsQ0FBQztRQUNILENBQUM7UUFFTyxjQUFjLENBQUMsS0FBaUI7WUFDdkMsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRXhDLE1BQU0sbUJBQW1CLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUM1RyxJQUFJLHFCQUFxQixHQUFHLEtBQUssQ0FBQztZQUNsQyxJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7WUFDakIsSUFBSSxtQkFBbUIsSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxJQUFJLElBQUksQ0FBQyxxQ0FBcUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtnQkFDckgsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzlELElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDM0QsS0FBSyxNQUFNLE9BQU8sSUFBSSxRQUFRLENBQUMsSUFBSSxFQUFFO3dCQUNwQyxJQUFJLElBQUEsOEJBQWtCLEVBQUMsT0FBTyxDQUFDLElBQUksT0FBTyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUU7NEJBQ3RFLHFCQUFxQixHQUFHLElBQUksQ0FBQzs0QkFDN0IsUUFBUSxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDOzRCQUN4QyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLDZDQUE2Qzt5QkFDMUU7cUJBQ0Q7b0JBQ0QsS0FBSyxNQUFNLE9BQU8sSUFBSSxRQUFRLENBQUMsTUFBTSxFQUFFO3dCQUN0QyxJQUFJLElBQUEsOEJBQWtCLEVBQUMsT0FBTyxDQUFDLElBQUksT0FBTyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUU7NEJBQ3RFLHFCQUFxQixHQUFHLElBQUksQ0FBQzs0QkFDN0IsUUFBUSxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDOzRCQUN4QyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLDZDQUE2Qzt5QkFDMUU7cUJBQ0Q7aUJBQ0Q7YUFDRDtZQUVELE1BQU0sU0FBUyxHQUFHLGNBQVksQ0FBQyxzQ0FBc0MsQ0FBQztZQUN0RSxJQUFJLENBQUMscUJBQXFCLEVBQUU7Z0JBQzNCLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtvQkFDekIsTUFBTSx1QkFBdUIsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLDBCQUEwQixFQUFFLENBQUM7b0JBQzdFLElBQUksdUJBQXVCLEtBQUssSUFBSSxFQUFFO3dCQUNyQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLHVCQUF1QixDQUFDLENBQUM7cUJBQy9EO2lCQUNEO2FBQ0Q7aUJBQU0sSUFBSSxDQUFDLG1CQUFtQixJQUFJLFFBQVEsR0FBRyxTQUFTLEVBQUU7Z0JBQ3hELGtHQUFrRztnQkFDbEcsTUFBTSx1QkFBdUIsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLDBCQUEwQixFQUFFLENBQUM7Z0JBQzdFLElBQUksdUJBQXVCLEtBQUssSUFBSSxFQUFFO29CQUNyQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLHVCQUF1QixDQUFDLENBQUM7aUJBQy9EO2FBQ0Q7aUJBQU07Z0JBQ04sSUFBSSxDQUFDLDZCQUE2QixDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsQ0FBQztnQkFDekQsNkVBQTZFO2dCQUM3RSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBQSw4QkFBa0IsRUFBQyxPQUFPLENBQUMsSUFBSSxPQUFPLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9JLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQywwQkFBMEIsRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxtQkFBbUIsRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLFlBQVksRUFBRSxFQUFFLEtBQUssQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUNyTztZQUVELE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM3QixTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFcEIsaUJBQWlCO1lBQ2pCLE9BQU8sSUFBSSxDQUFDLDBDQUEwQyxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFMUYsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbEMsQ0FBQztRQUVPLG9CQUFvQixDQUFDLEtBQWlCLEVBQUUsQ0FBNkI7WUFDNUUsTUFBTSxhQUFhLEdBQUcsQ0FBQyxDQUFDLFdBQVcsQ0FBQztZQUNwQyxNQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDNUMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQzlGLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUM5RixjQUFZLENBQUMsd0JBQXdCLENBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUNyRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUUsQ0FBQyxDQUFDO1FBQ3hFLENBQUM7O0lBamVXLG9DQUFZOzJCQUFaLFlBQVk7UUF5QnRCLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSwwREFBOEIsQ0FBQTtRQUM5QixXQUFBLDJCQUFnQixDQUFBO1FBQ2hCLFdBQUEsMkJBQWdCLENBQUE7UUFDaEIsV0FBQSw2REFBNkIsQ0FBQTtPQTdCbkIsWUFBWSxDQWtleEIifQ==