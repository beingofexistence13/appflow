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
define(["require", "exports", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/worker/simpleWorker", "vs/base/browser/defaultWorkerFactory", "vs/editor/common/core/range", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/services/editorSimpleWorker", "vs/editor/common/services/model", "vs/editor/common/services/textResourceConfiguration", "vs/base/common/arrays", "vs/platform/log/common/log", "vs/base/common/stopwatch", "vs/base/common/errors", "vs/editor/common/services/languageFeatures", "vs/editor/common/diff/linesDiffComputer", "vs/editor/common/diff/rangeMapping", "vs/editor/common/core/lineRange"], function (require, exports, async_1, lifecycle_1, simpleWorker_1, defaultWorkerFactory_1, range_1, languageConfigurationRegistry_1, editorSimpleWorker_1, model_1, textResourceConfiguration_1, arrays_1, log_1, stopwatch_1, errors_1, languageFeatures_1, linesDiffComputer_1, rangeMapping_1, lineRange_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditorWorkerClient = exports.EditorWorkerHost = exports.EditorWorkerService = void 0;
    /**
     * Stop syncing a model to the worker if it was not needed for 1 min.
     */
    const STOP_SYNC_MODEL_DELTA_TIME_MS = 60 * 1000;
    /**
     * Stop the worker if it was not needed for 5 min.
     */
    const STOP_WORKER_DELTA_TIME_MS = 5 * 60 * 1000;
    function canSyncModel(modelService, resource) {
        const model = modelService.getModel(resource);
        if (!model) {
            return false;
        }
        if (model.isTooLargeForSyncing()) {
            return false;
        }
        return true;
    }
    let EditorWorkerService = class EditorWorkerService extends lifecycle_1.Disposable {
        constructor(modelService, configurationService, logService, languageConfigurationService, languageFeaturesService) {
            super();
            this._modelService = modelService;
            this._workerManager = this._register(new WorkerManager(this._modelService, languageConfigurationService));
            this._logService = logService;
            // register default link-provider and default completions-provider
            this._register(languageFeaturesService.linkProvider.register({ language: '*', hasAccessToAllModels: true }, {
                provideLinks: (model, token) => {
                    if (!canSyncModel(this._modelService, model.uri)) {
                        return Promise.resolve({ links: [] }); // File too large
                    }
                    return this._workerManager.withWorker().then(client => client.computeLinks(model.uri)).then(links => {
                        return links && { links };
                    });
                }
            }));
            this._register(languageFeaturesService.completionProvider.register('*', new WordBasedCompletionItemProvider(this._workerManager, configurationService, this._modelService, languageConfigurationService)));
        }
        dispose() {
            super.dispose();
        }
        canComputeUnicodeHighlights(uri) {
            return canSyncModel(this._modelService, uri);
        }
        computedUnicodeHighlights(uri, options, range) {
            return this._workerManager.withWorker().then(client => client.computedUnicodeHighlights(uri, options, range));
        }
        async computeDiff(original, modified, options, algorithm) {
            const result = await this._workerManager.withWorker().then(client => client.computeDiff(original, modified, options, algorithm));
            if (!result) {
                return null;
            }
            // Convert from space efficient JSON data to rich objects.
            const diff = {
                identical: result.identical,
                quitEarly: result.quitEarly,
                changes: toLineRangeMappings(result.changes),
                moves: result.moves.map(m => new linesDiffComputer_1.MovedText(new rangeMapping_1.LineRangeMapping(new lineRange_1.LineRange(m[0], m[1]), new lineRange_1.LineRange(m[2], m[3])), toLineRangeMappings(m[4])))
            };
            return diff;
            function toLineRangeMappings(changes) {
                return changes.map((c) => new rangeMapping_1.DetailedLineRangeMapping(new lineRange_1.LineRange(c[0], c[1]), new lineRange_1.LineRange(c[2], c[3]), c[4]?.map((c) => new rangeMapping_1.RangeMapping(new range_1.Range(c[0], c[1], c[2], c[3]), new range_1.Range(c[4], c[5], c[6], c[7])))));
            }
        }
        canComputeDirtyDiff(original, modified) {
            return (canSyncModel(this._modelService, original) && canSyncModel(this._modelService, modified));
        }
        computeDirtyDiff(original, modified, ignoreTrimWhitespace) {
            return this._workerManager.withWorker().then(client => client.computeDirtyDiff(original, modified, ignoreTrimWhitespace));
        }
        computeMoreMinimalEdits(resource, edits, pretty = false) {
            if ((0, arrays_1.isNonEmptyArray)(edits)) {
                if (!canSyncModel(this._modelService, resource)) {
                    return Promise.resolve(edits); // File too large
                }
                const sw = stopwatch_1.StopWatch.create();
                const result = this._workerManager.withWorker().then(client => client.computeMoreMinimalEdits(resource, edits, pretty));
                result.finally(() => this._logService.trace('FORMAT#computeMoreMinimalEdits', resource.toString(true), sw.elapsed()));
                return Promise.race([result, (0, async_1.timeout)(1000).then(() => edits)]);
            }
            else {
                return Promise.resolve(undefined);
            }
        }
        computeHumanReadableDiff(resource, edits) {
            if ((0, arrays_1.isNonEmptyArray)(edits)) {
                if (!canSyncModel(this._modelService, resource)) {
                    return Promise.resolve(edits); // File too large
                }
                const sw = stopwatch_1.StopWatch.create();
                const result = this._workerManager.withWorker().then(client => client.computeHumanReadableDiff(resource, edits, { ignoreTrimWhitespace: false, maxComputationTimeMs: 1000, computeMoves: false, })).catch((err) => {
                    (0, errors_1.onUnexpectedError)(err);
                    // In case of an exception, fall back to computeMoreMinimalEdits
                    return this.computeMoreMinimalEdits(resource, edits, true);
                });
                result.finally(() => this._logService.trace('FORMAT#computeHumanReadableDiff', resource.toString(true), sw.elapsed()));
                return result;
            }
            else {
                return Promise.resolve(undefined);
            }
        }
        canNavigateValueSet(resource) {
            return (canSyncModel(this._modelService, resource));
        }
        navigateValueSet(resource, range, up) {
            return this._workerManager.withWorker().then(client => client.navigateValueSet(resource, range, up));
        }
        canComputeWordRanges(resource) {
            return canSyncModel(this._modelService, resource);
        }
        computeWordRanges(resource, range) {
            return this._workerManager.withWorker().then(client => client.computeWordRanges(resource, range));
        }
    };
    exports.EditorWorkerService = EditorWorkerService;
    exports.EditorWorkerService = EditorWorkerService = __decorate([
        __param(0, model_1.IModelService),
        __param(1, textResourceConfiguration_1.ITextResourceConfigurationService),
        __param(2, log_1.ILogService),
        __param(3, languageConfigurationRegistry_1.ILanguageConfigurationService),
        __param(4, languageFeatures_1.ILanguageFeaturesService)
    ], EditorWorkerService);
    class WordBasedCompletionItemProvider {
        constructor(workerManager, configurationService, modelService, languageConfigurationService) {
            this.languageConfigurationService = languageConfigurationService;
            this._debugDisplayName = 'wordbasedCompletions';
            this._workerManager = workerManager;
            this._configurationService = configurationService;
            this._modelService = modelService;
        }
        async provideCompletionItems(model, position) {
            const config = this._configurationService.getValue(model.uri, position, 'editor');
            if (!config.wordBasedSuggestions) {
                return undefined;
            }
            const models = [];
            if (config.wordBasedSuggestionsMode === 'currentDocument') {
                // only current file and only if not too large
                if (canSyncModel(this._modelService, model.uri)) {
                    models.push(model.uri);
                }
            }
            else {
                // either all files or files of same language
                for (const candidate of this._modelService.getModels()) {
                    if (!canSyncModel(this._modelService, candidate.uri)) {
                        continue;
                    }
                    if (candidate === model) {
                        models.unshift(candidate.uri);
                    }
                    else if (config.wordBasedSuggestionsMode === 'allDocuments' || candidate.getLanguageId() === model.getLanguageId()) {
                        models.push(candidate.uri);
                    }
                }
            }
            if (models.length === 0) {
                return undefined; // File too large, no other files
            }
            const wordDefRegExp = this.languageConfigurationService.getLanguageConfiguration(model.getLanguageId()).getWordDefinition();
            const word = model.getWordAtPosition(position);
            const replace = !word ? range_1.Range.fromPositions(position) : new range_1.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn);
            const insert = replace.setEndPosition(position.lineNumber, position.column);
            const client = await this._workerManager.withWorker();
            const data = await client.textualSuggest(models, word?.word, wordDefRegExp);
            if (!data) {
                return undefined;
            }
            return {
                duration: data.duration,
                suggestions: data.words.map((word) => {
                    return {
                        kind: 18 /* languages.CompletionItemKind.Text */,
                        label: word,
                        insertText: word,
                        range: { insert, replace }
                    };
                }),
            };
        }
    }
    class WorkerManager extends lifecycle_1.Disposable {
        constructor(modelService, languageConfigurationService) {
            super();
            this.languageConfigurationService = languageConfigurationService;
            this._modelService = modelService;
            this._editorWorkerClient = null;
            this._lastWorkerUsedTime = (new Date()).getTime();
            const stopWorkerInterval = this._register(new async_1.IntervalTimer());
            stopWorkerInterval.cancelAndSet(() => this._checkStopIdleWorker(), Math.round(STOP_WORKER_DELTA_TIME_MS / 2));
            this._register(this._modelService.onModelRemoved(_ => this._checkStopEmptyWorker()));
        }
        dispose() {
            if (this._editorWorkerClient) {
                this._editorWorkerClient.dispose();
                this._editorWorkerClient = null;
            }
            super.dispose();
        }
        /**
         * Check if the model service has no more models and stop the worker if that is the case.
         */
        _checkStopEmptyWorker() {
            if (!this._editorWorkerClient) {
                return;
            }
            const models = this._modelService.getModels();
            if (models.length === 0) {
                // There are no more models => nothing possible for me to do
                this._editorWorkerClient.dispose();
                this._editorWorkerClient = null;
            }
        }
        /**
         * Check if the worker has been idle for a while and then stop it.
         */
        _checkStopIdleWorker() {
            if (!this._editorWorkerClient) {
                return;
            }
            const timeSinceLastWorkerUsedTime = (new Date()).getTime() - this._lastWorkerUsedTime;
            if (timeSinceLastWorkerUsedTime > STOP_WORKER_DELTA_TIME_MS) {
                this._editorWorkerClient.dispose();
                this._editorWorkerClient = null;
            }
        }
        withWorker() {
            this._lastWorkerUsedTime = (new Date()).getTime();
            if (!this._editorWorkerClient) {
                this._editorWorkerClient = new EditorWorkerClient(this._modelService, false, 'editorWorkerService', this.languageConfigurationService);
            }
            return Promise.resolve(this._editorWorkerClient);
        }
    }
    class EditorModelManager extends lifecycle_1.Disposable {
        constructor(proxy, modelService, keepIdleModels) {
            super();
            this._syncedModels = Object.create(null);
            this._syncedModelsLastUsedTime = Object.create(null);
            this._proxy = proxy;
            this._modelService = modelService;
            if (!keepIdleModels) {
                const timer = new async_1.IntervalTimer();
                timer.cancelAndSet(() => this._checkStopModelSync(), Math.round(STOP_SYNC_MODEL_DELTA_TIME_MS / 2));
                this._register(timer);
            }
        }
        dispose() {
            for (const modelUrl in this._syncedModels) {
                (0, lifecycle_1.dispose)(this._syncedModels[modelUrl]);
            }
            this._syncedModels = Object.create(null);
            this._syncedModelsLastUsedTime = Object.create(null);
            super.dispose();
        }
        ensureSyncedResources(resources, forceLargeModels) {
            for (const resource of resources) {
                const resourceStr = resource.toString();
                if (!this._syncedModels[resourceStr]) {
                    this._beginModelSync(resource, forceLargeModels);
                }
                if (this._syncedModels[resourceStr]) {
                    this._syncedModelsLastUsedTime[resourceStr] = (new Date()).getTime();
                }
            }
        }
        _checkStopModelSync() {
            const currentTime = (new Date()).getTime();
            const toRemove = [];
            for (const modelUrl in this._syncedModelsLastUsedTime) {
                const elapsedTime = currentTime - this._syncedModelsLastUsedTime[modelUrl];
                if (elapsedTime > STOP_SYNC_MODEL_DELTA_TIME_MS) {
                    toRemove.push(modelUrl);
                }
            }
            for (const e of toRemove) {
                this._stopModelSync(e);
            }
        }
        _beginModelSync(resource, forceLargeModels) {
            const model = this._modelService.getModel(resource);
            if (!model) {
                return;
            }
            if (!forceLargeModels && model.isTooLargeForSyncing()) {
                return;
            }
            const modelUrl = resource.toString();
            this._proxy.acceptNewModel({
                url: model.uri.toString(),
                lines: model.getLinesContent(),
                EOL: model.getEOL(),
                versionId: model.getVersionId()
            });
            const toDispose = new lifecycle_1.DisposableStore();
            toDispose.add(model.onDidChangeContent((e) => {
                this._proxy.acceptModelChanged(modelUrl.toString(), e);
            }));
            toDispose.add(model.onWillDispose(() => {
                this._stopModelSync(modelUrl);
            }));
            toDispose.add((0, lifecycle_1.toDisposable)(() => {
                this._proxy.acceptRemovedModel(modelUrl);
            }));
            this._syncedModels[modelUrl] = toDispose;
        }
        _stopModelSync(modelUrl) {
            const toDispose = this._syncedModels[modelUrl];
            delete this._syncedModels[modelUrl];
            delete this._syncedModelsLastUsedTime[modelUrl];
            (0, lifecycle_1.dispose)(toDispose);
        }
    }
    class SynchronousWorkerClient {
        constructor(instance) {
            this._instance = instance;
            this._proxyObj = Promise.resolve(this._instance);
        }
        dispose() {
            this._instance.dispose();
        }
        getProxyObject() {
            return this._proxyObj;
        }
    }
    class EditorWorkerHost {
        constructor(workerClient) {
            this._workerClient = workerClient;
        }
        // foreign host request
        fhr(method, args) {
            return this._workerClient.fhr(method, args);
        }
    }
    exports.EditorWorkerHost = EditorWorkerHost;
    class EditorWorkerClient extends lifecycle_1.Disposable {
        constructor(modelService, keepIdleModels, label, languageConfigurationService) {
            super();
            this.languageConfigurationService = languageConfigurationService;
            this._disposed = false;
            this._modelService = modelService;
            this._keepIdleModels = keepIdleModels;
            this._workerFactory = new defaultWorkerFactory_1.DefaultWorkerFactory(label);
            this._worker = null;
            this._modelManager = null;
        }
        // foreign host request
        fhr(method, args) {
            throw new Error(`Not implemented!`);
        }
        _getOrCreateWorker() {
            if (!this._worker) {
                try {
                    this._worker = this._register(new simpleWorker_1.SimpleWorkerClient(this._workerFactory, 'vs/editor/common/services/editorSimpleWorker', new EditorWorkerHost(this)));
                }
                catch (err) {
                    (0, simpleWorker_1.logOnceWebWorkerWarning)(err);
                    this._worker = new SynchronousWorkerClient(new editorSimpleWorker_1.EditorSimpleWorker(new EditorWorkerHost(this), null));
                }
            }
            return this._worker;
        }
        _getProxy() {
            return this._getOrCreateWorker().getProxyObject().then(undefined, (err) => {
                (0, simpleWorker_1.logOnceWebWorkerWarning)(err);
                this._worker = new SynchronousWorkerClient(new editorSimpleWorker_1.EditorSimpleWorker(new EditorWorkerHost(this), null));
                return this._getOrCreateWorker().getProxyObject();
            });
        }
        _getOrCreateModelManager(proxy) {
            if (!this._modelManager) {
                this._modelManager = this._register(new EditorModelManager(proxy, this._modelService, this._keepIdleModels));
            }
            return this._modelManager;
        }
        async _withSyncedResources(resources, forceLargeModels = false) {
            if (this._disposed) {
                return Promise.reject((0, errors_1.canceled)());
            }
            return this._getProxy().then((proxy) => {
                this._getOrCreateModelManager(proxy).ensureSyncedResources(resources, forceLargeModels);
                return proxy;
            });
        }
        computedUnicodeHighlights(uri, options, range) {
            return this._withSyncedResources([uri]).then(proxy => {
                return proxy.computeUnicodeHighlights(uri.toString(), options, range);
            });
        }
        computeDiff(original, modified, options, algorithm) {
            return this._withSyncedResources([original, modified], /* forceLargeModels */ true).then(proxy => {
                return proxy.computeDiff(original.toString(), modified.toString(), options, algorithm);
            });
        }
        computeDirtyDiff(original, modified, ignoreTrimWhitespace) {
            return this._withSyncedResources([original, modified]).then(proxy => {
                return proxy.computeDirtyDiff(original.toString(), modified.toString(), ignoreTrimWhitespace);
            });
        }
        computeMoreMinimalEdits(resource, edits, pretty) {
            return this._withSyncedResources([resource]).then(proxy => {
                return proxy.computeMoreMinimalEdits(resource.toString(), edits, pretty);
            });
        }
        computeHumanReadableDiff(resource, edits, options) {
            return this._withSyncedResources([resource]).then(proxy => {
                return proxy.computeHumanReadableDiff(resource.toString(), edits, options);
            });
        }
        computeLinks(resource) {
            return this._withSyncedResources([resource]).then(proxy => {
                return proxy.computeLinks(resource.toString());
            });
        }
        computeDefaultDocumentColors(resource) {
            return this._withSyncedResources([resource]).then(proxy => {
                return proxy.computeDefaultDocumentColors(resource.toString());
            });
        }
        async textualSuggest(resources, leadingWord, wordDefRegExp) {
            const proxy = await this._withSyncedResources(resources);
            const wordDef = wordDefRegExp.source;
            const wordDefFlags = wordDefRegExp.flags;
            return proxy.textualSuggest(resources.map(r => r.toString()), leadingWord, wordDef, wordDefFlags);
        }
        computeWordRanges(resource, range) {
            return this._withSyncedResources([resource]).then(proxy => {
                const model = this._modelService.getModel(resource);
                if (!model) {
                    return Promise.resolve(null);
                }
                const wordDefRegExp = this.languageConfigurationService.getLanguageConfiguration(model.getLanguageId()).getWordDefinition();
                const wordDef = wordDefRegExp.source;
                const wordDefFlags = wordDefRegExp.flags;
                return proxy.computeWordRanges(resource.toString(), range, wordDef, wordDefFlags);
            });
        }
        navigateValueSet(resource, range, up) {
            return this._withSyncedResources([resource]).then(proxy => {
                const model = this._modelService.getModel(resource);
                if (!model) {
                    return null;
                }
                const wordDefRegExp = this.languageConfigurationService.getLanguageConfiguration(model.getLanguageId()).getWordDefinition();
                const wordDef = wordDefRegExp.source;
                const wordDefFlags = wordDefRegExp.flags;
                return proxy.navigateValueSet(resource.toString(), range, up, wordDef, wordDefFlags);
            });
        }
        dispose() {
            super.dispose();
            this._disposed = true;
        }
    }
    exports.EditorWorkerClient = EditorWorkerClient;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yV29ya2VyU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9icm93c2VyL3NlcnZpY2VzL2VkaXRvcldvcmtlclNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBNkJoRzs7T0FFRztJQUNILE1BQU0sNkJBQTZCLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztJQUVoRDs7T0FFRztJQUNILE1BQU0seUJBQXlCLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7SUFFaEQsU0FBUyxZQUFZLENBQUMsWUFBMkIsRUFBRSxRQUFhO1FBQy9ELE1BQU0sS0FBSyxHQUFHLFlBQVksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNYLE9BQU8sS0FBSyxDQUFDO1NBQ2I7UUFDRCxJQUFJLEtBQUssQ0FBQyxvQkFBb0IsRUFBRSxFQUFFO1lBQ2pDLE9BQU8sS0FBSyxDQUFDO1NBQ2I7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFTSxJQUFNLG1CQUFtQixHQUF6QixNQUFNLG1CQUFvQixTQUFRLHNCQUFVO1FBUWxELFlBQ2dCLFlBQTJCLEVBQ1Asb0JBQXVELEVBQzdFLFVBQXVCLEVBQ0wsNEJBQTJELEVBQ2hFLHVCQUFpRDtZQUUzRSxLQUFLLEVBQUUsQ0FBQztZQUNSLElBQUksQ0FBQyxhQUFhLEdBQUcsWUFBWSxDQUFDO1lBQ2xDLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLDRCQUE0QixDQUFDLENBQUMsQ0FBQztZQUMxRyxJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztZQUU5QixrRUFBa0U7WUFDbEUsSUFBSSxDQUFDLFNB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