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
    exports.$02 = exports.$92 = exports.$82 = void 0;
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
    let $82 = class $82 extends lifecycle_1.$kc {
        constructor(modelService, configurationService, logService, languageConfigurationService, languageFeaturesService) {
            super();
            this.a = modelService;
            this.b = this.B(new WorkerManager(this.a, languageConfigurationService));
            this.f = logService;
            // register default link-provider and default completions-provider
            this.B(languageFeaturesService.linkProvider.register({ language: '*', hasAccessToAllModels: true }, {
                provideLinks: (model, token) => {
                    if (!canSyncModel(this.a, model.uri)) {
                        return Promise.resolve({ links: [] }); // File too large
                    }
                    return this.b.withWorker().then(client => client.computeLinks(model.uri)).then(links => {
                        return links && { links };
                    });
                }
            }));
            this.B(languageFeaturesService.completionProvider.register('*', new WordBasedCompletionItemProvider(this.b, configurationService, this.a, languageConfigurationService)));
        }
        dispose() {
            super.dispose();
        }
        canComputeUnicodeHighlights(uri) {
            return canSyncModel(this.a, uri);
        }
        computedUnicodeHighlights(uri, options, range) {
            return this.b.withWorker().then(client => client.computedUnicodeHighlights(uri, options, range));
        }
        async computeDiff(original, modified, options, algorithm) {
            const result = await this.b.withWorker().then(client => client.computeDiff(original, modified, options, algorithm));
            if (!result) {
                return null;
            }
            // Convert from space efficient JSON data to rich objects.
            const diff = {
                identical: result.identical,
                quitEarly: result.quitEarly,
                changes: toLineRangeMappings(result.changes),
                moves: result.moves.map(m => new linesDiffComputer_1.$zs(new rangeMapping_1.$vs(new lineRange_1.$ts(m[0], m[1]), new lineRange_1.$ts(m[2], m[3])), toLineRangeMappings(m[4])))
            };
            return diff;
            function toLineRangeMappings(changes) {
                return changes.map((c) => new rangeMapping_1.$ws(new lineRange_1.$ts(c[0], c[1]), new lineRange_1.$ts(c[2], c[3]), c[4]?.map((c) => new rangeMapping_1.$xs(new range_1.$ks(c[0], c[1], c[2], c[3]), new range_1.$ks(c[4], c[5], c[6], c[7])))));
            }
        }
        canComputeDirtyDiff(original, modified) {
            return (canSyncModel(this.a, original) && canSyncModel(this.a, modified));
        }
        computeDirtyDiff(original, modified, ignoreTrimWhitespace) {
            return this.b.withWorker().then(client => client.computeDirtyDiff(original, modified, ignoreTrimWhitespace));
        }
        computeMoreMinimalEdits(resource, edits, pretty = false) {
            if ((0, arrays_1.$Jb)(edits)) {
                if (!canSyncModel(this.a, resource)) {
                    return Promise.resolve(edits); // File too large
                }
                const sw = stopwatch_1.$bd.create();
                const result = this.b.withWorker().then(client => client.computeMoreMinimalEdits(resource, edits, pretty));
                result.finally(() => this.f.trace('FORMAT#computeMoreMinimalEdits', resource.toString(true), sw.elapsed()));
                return Promise.race([result, (0, async_1.$Hg)(1000).then(() => edits)]);
            }
            else {
                return Promise.resolve(undefined);
            }
        }
        computeHumanReadableDiff(resource, edits) {
            if ((0, arrays_1.$Jb)(edits)) {
                if (!canSyncModel(this.a, resource)) {
                    return Promise.resolve(edits); // File too large
                }
                const sw = stopwatch_1.$bd.create();
                const result = this.b.withWorker().then(client => client.computeHumanReadableDiff(resource, edits, { ignoreTrimWhitespace: false, maxComputationTimeMs: 1000, computeMoves: false, })).catch((err) => {
                    (0, errors_1.$Y)(err);
                    // In case of an exception, fall back to computeMoreMinimalEdits
                    return this.computeMoreMinimalEdits(resource, edits, true);
                });
                result.finally(() => this.f.trace('FORMAT#computeHumanReadableDiff', resource.toString(true), sw.elapsed()));
                return result;
            }
            else {
                return Promise.resolve(undefined);
            }
        }
        canNavigateValueSet(resource) {
            return (canSyncModel(this.a, resource));
        }
        navigateValueSet(resource, range, up) {
            return this.b.withWorker().then(client => client.navigateValueSet(resource, range, up));
        }
        canComputeWordRanges(resource) {
            return canSyncModel(this.a, resource);
        }
        computeWordRanges(resource, range) {
            return this.b.withWorker().then(client => client.computeWordRanges(resource, range));
        }
    };
    exports.$82 = $82;
    exports.$82 = $82 = __decorate([
        __param(0, model_1.$yA),
        __param(1, textResourceConfiguration_1.$FA),
        __param(2, log_1.$5i),
        __param(3, languageConfigurationRegistry_1.$2t),
        __param(4, languageFeatures_1.$hF)
    ], $82);
    class WordBasedCompletionItemProvider {
        constructor(workerManager, configurationService, modelService, f) {
            this.f = f;
            this._debugDisplayName = 'wordbasedCompletions';
            this.a = workerManager;
            this.b = configurationService;
            this.d = modelService;
        }
        async provideCompletionItems(model, position) {
            const config = this.b.getValue(model.uri, position, 'editor');
            if (!config.wordBasedSuggestions) {
                return undefined;
            }
            const models = [];
            if (config.wordBasedSuggestionsMode === 'currentDocument') {
                // only current file and only if not too large
                if (canSyncModel(this.d, model.uri)) {
                    models.push(model.uri);
                }
            }
            else {
                // either all files or files of same language
                for (const candidate of this.d.getModels()) {
                    if (!canSyncModel(this.d, candidate.uri)) {
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
            const wordDefRegExp = this.f.getLanguageConfiguration(model.getLanguageId()).getWordDefinition();
            const word = model.getWordAtPosition(position);
            const replace = !word ? range_1.$ks.fromPositions(position) : new range_1.$ks(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn);
            const insert = replace.setEndPosition(position.lineNumber, position.column);
            const client = await this.a.withWorker();
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
    class WorkerManager extends lifecycle_1.$kc {
        constructor(modelService, g) {
            super();
            this.g = g;
            this.a = modelService;
            this.b = null;
            this.f = (new Date()).getTime();
            const stopWorkerInterval = this.B(new async_1.$Rg());
            stopWorkerInterval.cancelAndSet(() => this.j(), Math.round(STOP_WORKER_DELTA_TIME_MS / 2));
            this.B(this.a.onModelRemoved(_ => this.h()));
        }
        dispose() {
            if (this.b) {
                this.b.dispose();
                this.b = null;
            }
            super.dispose();
        }
        /**
         * Check if the model service has no more models and stop the worker if that is the case.
         */
        h() {
            if (!this.b) {
                return;
            }
            const models = this.a.getModels();
            if (models.length === 0) {
                // There are no more models => nothing possible for me to do
                this.b.dispose();
                this.b = null;
            }
        }
        /**
         * Check if the worker has been idle for a while and then stop it.
         */
        j() {
            if (!this.b) {
                return;
            }
            const timeSinceLastWorkerUsedTime = (new Date()).getTime() - this.f;
            if (timeSinceLastWorkerUsedTime > STOP_WORKER_DELTA_TIME_MS) {
                this.b.dispose();
                this.b = null;
            }
        }
        withWorker() {
            this.f = (new Date()).getTime();
            if (!this.b) {
                this.b = new $02(this.a, false, 'editorWorkerService', this.g);
            }
            return Promise.resolve(this.b);
        }
    }
    class EditorModelManager extends lifecycle_1.$kc {
        constructor(proxy, modelService, keepIdleModels) {
            super();
            this.f = Object.create(null);
            this.g = Object.create(null);
            this.a = proxy;
            this.b = modelService;
            if (!keepIdleModels) {
                const timer = new async_1.$Rg();
                timer.cancelAndSet(() => this.h(), Math.round(STOP_SYNC_MODEL_DELTA_TIME_MS / 2));
                this.B(timer);
            }
        }
        dispose() {
            for (const modelUrl in this.f) {
                (0, lifecycle_1.$fc)(this.f[modelUrl]);
            }
            this.f = Object.create(null);
            this.g = Object.create(null);
            super.dispose();
        }
        ensureSyncedResources(resources, forceLargeModels) {
            for (const resource of resources) {
                const resourceStr = resource.toString();
                if (!this.f[resourceStr]) {
                    this.j(resource, forceLargeModels);
                }
                if (this.f[resourceStr]) {
                    this.g[resourceStr] = (new Date()).getTime();
                }
            }
        }
        h() {
            const currentTime = (new Date()).getTime();
            const toRemove = [];
            for (const modelUrl in this.g) {
                const elapsedTime = currentTime - this.g[modelUrl];
                if (elapsedTime > STOP_SYNC_MODEL_DELTA_TIME_MS) {
                    toRemove.push(modelUrl);
                }
            }
            for (const e of toRemove) {
                this.n(e);
            }
        }
        j(resource, forceLargeModels) {
            const model = this.b.getModel(resource);
            if (!model) {
                return;
            }
            if (!forceLargeModels && model.isTooLargeForSyncing()) {
                return;
            }
            const modelUrl = resource.toString();
            this.a.acceptNewModel({
                url: model.uri.toString(),
                lines: model.getLinesContent(),
                EOL: model.getEOL(),
                versionId: model.getVersionId()
            });
            const toDispose = new lifecycle_1.$jc();
            toDispose.add(model.onDidChangeContent((e) => {
                this.a.acceptModelChanged(modelUrl.toString(), e);
            }));
            toDispose.add(model.onWillDispose(() => {
                this.n(modelUrl);
            }));
            toDispose.add((0, lifecycle_1.$ic)(() => {
                this.a.acceptRemovedModel(modelUrl);
            }));
            this.f[modelUrl] = toDispose;
        }
        n(modelUrl) {
            const toDispose = this.f[modelUrl];
            delete this.f[modelUrl];
            delete this.g[modelUrl];
            (0, lifecycle_1.$fc)(toDispose);
        }
    }
    class SynchronousWorkerClient {
        constructor(instance) {
            this.a = instance;
            this.b = Promise.resolve(this.a);
        }
        dispose() {
            this.a.dispose();
        }
        getProxyObject() {
            return this.b;
        }
    }
    class $92 {
        constructor(workerClient) {
            this.a = workerClient;
        }
        // foreign host request
        fhr(method, args) {
            return this.a.fhr(method, args);
        }
    }
    exports.$92 = $92;
    class $02 extends lifecycle_1.$kc {
        constructor(modelService, keepIdleModels, label, n) {
            super();
            this.n = n;
            this.j = false;
            this.a = modelService;
            this.b = keepIdleModels;
            this.g = new defaultWorkerFactory_1.$WQ(label);
            this.f = null;
            this.h = null;
        }
        // foreign host request
        fhr(method, args) {
            throw new Error(`Not implemented!`);
        }
        s() {
            if (!this.f) {
                try {
                    this.f = this.B(new simpleWorker_1.SimpleWorkerClient(this.g, 'vs/editor/common/services/editorSimpleWorker', new $92(this)));
                }
                catch (err) {
                    (0, simpleWorker_1.logOnceWebWorkerWarning)(err);
                    this.f = new SynchronousWorkerClient(new editorSimpleWorker_1.EditorSimpleWorker(new $92(this), null));
                }
            }
            return this.f;
        }
        t() {
            return this.s().getProxyObject().then(undefined, (err) => {
                (0, simpleWorker_1.logOnceWebWorkerWarning)(err);
                this.f = new SynchronousWorkerClient(new editorSimpleWorker_1.EditorSimpleWorker(new $92(this), null));
                return this.s().getProxyObject();
            });
        }
        u(proxy) {
            if (!this.h) {
                this.h = this.B(new EditorModelManager(proxy, this.a, this.b));
            }
            return this.h;
        }
        async w(resources, forceLargeModels = false) {
            if (this.j) {
                return Promise.reject((0, errors_1.$4)());
            }
            return this.t().then((proxy) => {
                this.u(proxy).ensureSyncedResources(resources, forceLargeModels);
                return proxy;
            });
        }
        computedUnicodeHighlights(uri, options, range) {
            return this.w([uri]).then(proxy => {
                return proxy.computeUnicodeHighlights(uri.toString(), options, range);
            });
        }
        computeDiff(original, modified, options, algorithm) {
            return this.w([original, modified], /* forceLargeModels */ true).then(proxy => {
                return proxy.computeDiff(original.toString(), modified.toString(), options, algorithm);
            });
        }
        computeDirtyDiff(original, modified, ignoreTrimWhitespace) {
            return this.w([original, modified]).then(proxy => {
                return proxy.computeDirtyDiff(original.toString(), modified.toString(), ignoreTrimWhitespace);
            });
        }
        computeMoreMinimalEdits(resource, edits, pretty) {
            return this.w([resource]).then(proxy => {
                return proxy.computeMoreMinimalEdits(resource.toString(), edits, pretty);
            });
        }
        computeHumanReadableDiff(resource, edits, options) {
            return this.w([resource]).then(proxy => {
                return proxy.computeHumanReadableDiff(resource.toString(), edits, options);
            });
        }
        computeLinks(resource) {
            return this.w([resource]).then(proxy => {
                return proxy.computeLinks(resource.toString());
            });
        }
        computeDefaultDocumentColors(resource) {
            return this.w([resource]).then(proxy => {
                return proxy.computeDefaultDocumentColors(resource.toString());
            });
        }
        async textualSuggest(resources, leadingWord, wordDefRegExp) {
            const proxy = await this.w(resources);
            const wordDef = wordDefRegExp.source;
            const wordDefFlags = wordDefRegExp.flags;
            return proxy.textualSuggest(resources.map(r => r.toString()), leadingWord, wordDef, wordDefFlags);
        }
        computeWordRanges(resource, range) {
            return this.w([resource]).then(proxy => {
                const model = this.a.getModel(resource);
                if (!model) {
                    return Promise.resolve(null);
                }
                const wordDefRegExp = this.n.getLanguageConfiguration(model.getLanguageId()).getWordDefinition();
                const wordDef = wordDefRegExp.source;
                const wordDefFlags = wordDefRegExp.flags;
                return proxy.computeWordRanges(resource.toString(), range, wordDef, wordDefFlags);
            });
        }
        navigateValueSet(resource, range, up) {
            return this.w([resource]).then(proxy => {
                const model = this.a.getModel(resource);
                if (!model) {
                    return null;
                }
                const wordDefRegExp = this.n.getLanguageConfiguration(model.getLanguageId()).getWordDefinition();
                const wordDef = wordDefRegExp.source;
                const wordDefFlags = wordDefRegExp.flags;
                return proxy.navigateValueSet(resource.toString(), range, up, wordDef, wordDefFlags);
            });
        }
        dispose() {
            super.dispose();
            this.j = true;
        }
    }
    exports.$02 = $02;
});
//# sourceMappingURL=editorWorkerService.js.map