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
    var $4yb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$4yb = void 0;
    function MODEL_ID(resource) {
        return resource.toString();
    }
    function computeModelSha1(model) {
        // compute the sha1
        const shaComputer = new hash_1.$vi();
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
            this.c = new lifecycle_1.$jc();
            this.model = model;
            this.c.add(model.onWillDispose(() => onWillDispose(model)));
            this.c.add(model.onDidChangeLanguage((e) => onDidChangeLanguage(model, e)));
        }
        dispose() {
            this.c.dispose();
        }
    }
    const DEFAULT_EOL = (platform.$k || platform.$j) ? 1 /* DefaultEndOfLine.LF */ : 2 /* DefaultEndOfLine.CRLF */;
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
    let $4yb = class $4yb extends lifecycle_1.$kc {
        static { $4yb_1 = this; }
        static { this.MAX_MEMORY_FOR_CLOSED_FILES_UNDO_STACK = 20 * 1024 * 1024; }
        constructor(r, s, t, u, w) {
            super();
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.c = this.B(new event_1.$fd());
            this.onModelAdded = this.c.event;
            this.f = this.B(new event_1.$fd());
            this.onModelRemoved = this.f.event;
            this.g = this.B(new event_1.$fd());
            this.onModelLanguageChanged = this.g.event;
            this.h = Object.create(null);
            this.j = {};
            this.m = new Map();
            this.n = 0;
            this.B(this.r.onDidChangeConfiguration(e => this.D(e)));
            this.D(undefined);
        }
        static y(config, isForSimpleWidget) {
            let tabSize = textModelDefaults_1.$Ur.tabSize;
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
            let insertSpaces = textModelDefaults_1.$Ur.insertSpaces;
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
            let trimAutoWhitespace = textModelDefaults_1.$Ur.trimAutoWhitespace;
            if (config.editor && typeof config.editor.trimAutoWhitespace !== 'undefined') {
                trimAutoWhitespace = (config.editor.trimAutoWhitespace === 'false' ? false : Boolean(config.editor.trimAutoWhitespace));
            }
            let detectIndentation = textModelDefaults_1.$Ur.detectIndentation;
            if (config.editor && typeof config.editor.detectIndentation !== 'undefined') {
                detectIndentation = (config.editor.detectIndentation === 'false' ? false : Boolean(config.editor.detectIndentation));
            }
            let largeFileOptimizations = textModelDefaults_1.$Ur.largeFileOptimizations;
            if (config.editor && typeof config.editor.largeFileOptimizations !== 'undefined') {
                largeFileOptimizations = (config.editor.largeFileOptimizations === 'false' ? false : Boolean(config.editor.largeFileOptimizations));
            }
            let bracketPairColorizationOptions = textModelDefaults_1.$Ur.bracketPairColorizationOptions;
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
        z(resource, language) {
            if (resource) {
                return this.s.getEOL(resource, language);
            }
            const eol = this.r.getValue('files.eol', { overrideIdentifier: language });
            if (eol && typeof eol === 'string' && eol !== 'auto') {
                return eol;
            }
            return platform.OS === 3 /* platform.OperatingSystem.Linux */ || platform.OS === 2 /* platform.OperatingSystem.Macintosh */ ? '\n' : '\r\n';
        }
        C() {
            const result = this.r.getValue('files.restoreUndoStack');
            if (typeof result === 'boolean') {
                return result;
            }
            return true;
        }
        getCreationOptions(languageIdOrSelection, resource, isForSimpleWidget) {
            const language = (typeof languageIdOrSelection === 'string' ? languageIdOrSelection : languageIdOrSelection.languageId);
            let creationOptions = this.h[language + resource];
            if (!creationOptions) {
                const editor = this.r.getValue('editor', { overrideIdentifier: language, resource });
                const eol = this.z(resource, language);
                creationOptions = $4yb_1.y({ editor, eol }, isForSimpleWidget);
                this.h[language + resource] = creationOptions;
            }
            return creationOptions;
        }
        D(e) {
            const oldOptionsByLanguageAndResource = this.h;
            this.h = Object.create(null);
            // Update options on all models
            const keys = Object.keys(this.j);
            for (let i = 0, len = keys.length; i < len; i++) {
                const modelId = keys[i];
                const modelData = this.j[modelId];
                const language = modelData.model.getLanguageId();
                const uri = modelData.model.uri;
                if (e && !e.affectsConfiguration('editor', { overrideIdentifier: language, resource: uri }) && !e.affectsConfiguration('files.eol', { overrideIdentifier: language, resource: uri })) {
                    continue; // perf: skip if this model is not affected by configuration change
                }
                const oldOptions = oldOptionsByLanguageAndResource[language + uri];
                const newOptions = this.getCreationOptions(language, uri, modelData.model.isForSimpleWidget);
                $4yb_1.F(modelData.model, newOptions, oldOptions);
            }
        }
        static F(model, newOptions, currentOptions) {
            if (currentOptions && currentOptions.defaultEOL !== newOptions.defaultEOL && model.getLineCount() === 1) {
                model.setEOL(newOptions.defaultEOL === 1 /* DefaultEndOfLine.LF */ ? 0 /* EndOfLineSequence.LF */ : 1 /* EndOfLineSequence.CRLF */);
            }
            if (currentOptions
                && (currentOptions.detectIndentation === newOptions.detectIndentation)
                && (currentOptions.insertSpaces === newOptions.insertSpaces)
                && (currentOptions.tabSize === newOptions.tabSize)
                && (currentOptions.indentSize === newOptions.indentSize)
                && (currentOptions.trimAutoWhitespace === newOptions.trimAutoWhitespace)
                && (0, objects_1.$Zm)(currentOptions.bracketPairColorizationOptions, newOptions.bracketPairColorizationOptions)) {
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
        G(disposedModelData) {
            this.m.set(MODEL_ID(disposedModelData.uri), disposedModelData);
            this.n += disposedModelData.heapSize;
        }
        H(resource) {
            const disposedModelData = this.m.get(MODEL_ID(resource));
            if (disposedModelData) {
                this.n -= disposedModelData.heapSize;
            }
            this.m.delete(MODEL_ID(resource));
            return disposedModelData;
        }
        I(maxModelsHeapSize) {
            if (this.n > maxModelsHeapSize) {
                // we must remove some old undo stack elements to free up some memory
                const disposedModels = [];
                this.m.forEach(entry => {
                    if (!entry.sharesUndoRedoStack) {
                        disposedModels.push(entry);
                    }
                });
                disposedModels.sort((a, b) => a.time - b.time);
                while (disposedModels.length > 0 && this.n > maxModelsHeapSize) {
                    const disposedModel = disposedModels.shift();
                    this.H(disposedModel.uri);
                    if (disposedModel.initialUndoRedoSnapshot !== null) {
                        this.t.restoreSnapshot(disposedModel.initialUndoRedoSnapshot);
                    }
                }
            }
        }
        J(value, languageIdOrSelection, resource, isForSimpleWidget) {
            // create & save the model
            const options = this.getCreationOptions(languageIdOrSelection, resource, isForSimpleWidget);
            const model = new textModel_1.$MC(value, languageIdOrSelection, options, resource, this.t, this.u, this.w);
            if (resource && this.m.has(MODEL_ID(resource))) {
                const disposedModelData = this.H(resource);
                const elements = this.t.getElements(resource);
                const sha1IsEqual = (computeModelSha1(model) === disposedModelData.sha1);
                if (sha1IsEqual || disposedModelData.sharesUndoRedoStack) {
                    for (const element of elements.past) {
                        if ((0, editStack_1.$UB)(element) && element.matchesResource(resource)) {
                            element.setModel(model);
                        }
                    }
                    for (const element of elements.future) {
                        if ((0, editStack_1.$UB)(element) && element.matchesResource(resource)) {
                            element.setModel(model);
                        }
                    }
                    this.t.setElementsValidFlag(resource, true, (element) => ((0, editStack_1.$UB)(element) && element.matchesResource(resource)));
                    if (sha1IsEqual) {
                        model._overwriteVersionId(disposedModelData.versionId);
                        model._overwriteAlternativeVersionId(disposedModelData.alternativeVersionId);
                        model._overwriteInitialUndoRedoSnapshot(disposedModelData.initialUndoRedoSnapshot);
                    }
                }
                else {
                    if (disposedModelData.initialUndoRedoSnapshot !== null) {
                        this.t.restoreSnapshot(disposedModelData.initialUndoRedoSnapshot);
                    }
                }
            }
            const modelId = MODEL_ID(model.uri);
            if (this.j[modelId]) {
                // There already exists a model with this id => this is a programmer error
                throw new Error('ModelService: Cannot add model because it already exists!');
            }
            const modelData = new ModelData(model, (model) => this.O(model), (model, e) => this.P(model, e));
            this.j[modelId] = modelData;
            return modelData;
        }
        updateModel(model, value) {
            const options = this.getCreationOptions(model.getLanguageId(), model.uri, model.isForSimpleWidget);
            const { textBuffer, disposable } = (0, textModel_1.$LC)(value, options.defaultEOL);
            // Return early if the text is already set in that form
            if (model.equalsTextBuffer(textBuffer)) {
                disposable.dispose();
                return;
            }
            // Otherwise find a diff between the values and update model
            model.pushStackElement();
            model.pushEOL(textBuffer.getEOL() === '\r\n' ? 1 /* EndOfLineSequence.CRLF */ : 0 /* EndOfLineSequence.LF */);
            model.pushEditOperations([], $4yb_1._computeEdits(model, textBuffer), () => []);
            model.pushStackElement();
            disposable.dispose();
        }
        static L(a, aLen, aDelta, b, bLen, bDelta) {
            const maxResult = Math.min(aLen, bLen);
            let result = 0;
            for (let i = 0; i < maxResult && a.getLineContent(aDelta + i) === b.getLineContent(bDelta + i); i++) {
                result++;
            }
            return result;
        }
        static M(a, aLen, aDelta, b, bLen, bDelta) {
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
            const commonPrefix = this.L(model, modelLineCount, 1, textBuffer, textBufferLineCount, 1);
            if (modelLineCount === textBufferLineCount && commonPrefix === modelLineCount) {
                // equality case
                return [];
            }
            const commonSuffix = this.M(model, modelLineCount - commonPrefix, commonPrefix, textBuffer, textBufferLineCount - commonPrefix, commonPrefix);
            let oldRange;
            let newRange;
            if (commonSuffix > 0) {
                oldRange = new range_1.$ks(commonPrefix + 1, 1, modelLineCount - commonSuffix + 1, 1);
                newRange = new range_1.$ks(commonPrefix + 1, 1, textBufferLineCount - commonSuffix + 1, 1);
            }
            else if (commonPrefix > 0) {
                oldRange = new range_1.$ks(commonPrefix, model.getLineMaxColumn(commonPrefix), modelLineCount, model.getLineMaxColumn(modelLineCount));
                newRange = new range_1.$ks(commonPrefix, 1 + textBuffer.getLineLength(commonPrefix), textBufferLineCount, 1 + textBuffer.getLineLength(textBufferLineCount));
            }
            else {
                oldRange = new range_1.$ks(1, 1, modelLineCount, model.getLineMaxColumn(modelLineCount));
                newRange = new range_1.$ks(1, 1, textBufferLineCount, 1 + textBuffer.getLineLength(textBufferLineCount));
            }
            return [editOperation_1.$ls.replaceMove(oldRange, textBuffer.getValueInRange(newRange, 0 /* EndOfLinePreference.TextDefined */))];
        }
        createModel(value, languageSelection, resource, isForSimpleWidget = false) {
            let modelData;
            if (languageSelection) {
                modelData = this.J(value, languageSelection, resource, isForSimpleWidget);
            }
            else {
                modelData = this.J(value, modesRegistry_1.$Yt, resource, isForSimpleWidget);
            }
            this.c.fire(modelData.model);
            return modelData.model;
        }
        destroyModel(resource) {
            // We need to support that not all models get disposed through this service (i.e. model.dispose() should work!)
            const modelData = this.j[MODEL_ID(resource)];
            if (!modelData) {
                return;
            }
            modelData.model.dispose();
        }
        getModels() {
            const ret = [];
            const keys = Object.keys(this.j);
            for (let i = 0, len = keys.length; i < len; i++) {
                const modelId = keys[i];
                ret.push(this.j[modelId].model);
            }
            return ret;
        }
        getModel(resource) {
            const modelId = MODEL_ID(resource);
            const modelData = this.j[modelId];
            if (!modelData) {
                return null;
            }
            return modelData.model;
        }
        // --- end IModelService
        N(resource) {
            return (resource.scheme === network_1.Schemas.file
                || resource.scheme === network_1.Schemas.vscodeRemote
                || resource.scheme === network_1.Schemas.vscodeUserData
                || resource.scheme === network_1.Schemas.vscodeNotebookCell
                || resource.scheme === 'fake-fs' // for tests
            );
        }
        O(model) {
            const modelId = MODEL_ID(model.uri);
            const modelData = this.j[modelId];
            const sharesUndoRedoStack = (this.t.getUriComparisonKey(model.uri) !== model.uri.toString());
            let maintainUndoRedoStack = false;
            let heapSize = 0;
            if (sharesUndoRedoStack || (this.C() && this.N(model.uri))) {
                const elements = this.t.getElements(model.uri);
                if (elements.past.length > 0 || elements.future.length > 0) {
                    for (const element of elements.past) {
                        if ((0, editStack_1.$UB)(element) && element.matchesResource(model.uri)) {
                            maintainUndoRedoStack = true;
                            heapSize += element.heapSize(model.uri);
                            element.setModel(model.uri); // remove reference from text buffer instance
                        }
                    }
                    for (const element of elements.future) {
                        if ((0, editStack_1.$UB)(element) && element.matchesResource(model.uri)) {
                            maintainUndoRedoStack = true;
                            heapSize += element.heapSize(model.uri);
                            element.setModel(model.uri); // remove reference from text buffer instance
                        }
                    }
                }
            }
            const maxMemory = $4yb_1.MAX_MEMORY_FOR_CLOSED_FILES_UNDO_STACK;
            if (!maintainUndoRedoStack) {
                if (!sharesUndoRedoStack) {
                    const initialUndoRedoSnapshot = modelData.model.getInitialUndoRedoSnapshot();
                    if (initialUndoRedoSnapshot !== null) {
                        this.t.restoreSnapshot(initialUndoRedoSnapshot);
                    }
                }
            }
            else if (!sharesUndoRedoStack && heapSize > maxMemory) {
                // the undo stack for this file would never fit in the configured memory, so don't bother with it.
                const initialUndoRedoSnapshot = modelData.model.getInitialUndoRedoSnapshot();
                if (initialUndoRedoSnapshot !== null) {
                    this.t.restoreSnapshot(initialUndoRedoSnapshot);
                }
            }
            else {
                this.I(maxMemory - heapSize);
                // We only invalidate the elements, but they remain in the undo-redo service.
                this.t.setElementsValidFlag(model.uri, false, (element) => ((0, editStack_1.$UB)(element) && element.matchesResource(model.uri)));
                this.G(new DisposedModelInfo(model.uri, modelData.model.getInitialUndoRedoSnapshot(), Date.now(), sharesUndoRedoStack, heapSize, computeModelSha1(model), model.getVersionId(), model.getAlternativeVersionId()));
            }
            delete this.j[modelId];
            modelData.dispose();
            // clean up cache
            delete this.h[model.getLanguageId() + model.uri];
            this.f.fire(model);
        }
        P(model, e) {
            const oldLanguageId = e.oldLanguage;
            const newLanguageId = model.getLanguageId();
            const oldOptions = this.getCreationOptions(oldLanguageId, model.uri, model.isForSimpleWidget);
            const newOptions = this.getCreationOptions(newLanguageId, model.uri, model.isForSimpleWidget);
            $4yb_1.F(model, newOptions, oldOptions);
            this.g.fire({ model, oldLanguageId: oldLanguageId });
        }
    };
    exports.$4yb = $4yb;
    exports.$4yb = $4yb = $4yb_1 = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, textResourceConfiguration_1.$GA),
        __param(2, undoRedo_1.$wu),
        __param(3, language_1.$ct),
        __param(4, languageConfigurationRegistry_1.$2t)
    ], $4yb);
});
//# sourceMappingURL=modelService.js.map