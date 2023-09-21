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
define(["require", "exports", "vs/base/common/event", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/uri", "vs/editor/common/services/model", "vs/nls!vs/workbench/contrib/searchEditor/browser/searchEditorInput", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/workbench/common/editor", "vs/workbench/common/memento", "vs/workbench/contrib/searchEditor/browser/constants", "vs/workbench/contrib/searchEditor/browser/searchEditorModel", "vs/workbench/contrib/searchEditor/browser/searchEditorSerialization", "vs/workbench/services/path/common/pathService", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/platform/configuration/common/configuration", "vs/base/common/buffer", "vs/workbench/common/editor/editorInput", "vs/css!./media/searchEditor"], function (require, exports, event_1, path_1, resources_1, uri_1, model_1, nls_1, dialogs_1, instantiation_1, storage_1, telemetry_1, editor_1, memento_1, constants_1, searchEditorModel_1, searchEditorSerialization_1, pathService_1, textfiles_1, workingCopyService_1, configuration_1, buffer_1, editorInput_1) {
    "use strict";
    var $1Ob_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$2Ob = exports.$1Ob = exports.$ZOb = void 0;
    exports.$ZOb = '.code-search';
    let $1Ob = class $1Ob extends editorInput_1.$tA {
        static { $1Ob_1 = this; }
        static { this.ID = constants_1.$LOb; }
        get typeId() {
            return $1Ob_1.ID;
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
        constructor(modelUri, backingUri, w, y, z, C, D, F, G, storageService) {
            super();
            this.modelUri = modelUri;
            this.backingUri = backingUri;
            this.w = w;
            this.y = y;
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.j = false;
            this.n = this.B(new event_1.$fd());
            this.onDidChangeContent = this.n.event;
            this.r = this.B(new event_1.$fd());
            this.onDidSave = this.r.event;
            this.s = [];
            this.model = C.createInstance(searchEditorModel_1.$XOb, modelUri);
            if (this.modelUri.scheme !== constants_1.$EOb) {
                throw Error('SearchEditorInput must be invoked with a SearchEditorScheme uri');
            }
            this.c = new memento_1.$YT($1Ob_1.ID, storageService);
            storageService.onWillSaveState(() => this.c.saveMemento());
            const input = this;
            const workingCopyAdapter = new class {
                constructor() {
                    this.typeId = constants_1.$FOb;
                    this.resource = input.modelUri;
                    this.capabilities = input.hasCapability(4 /* EditorInputCapabilities.Untitled */) ? 2 /* WorkingCopyCapabilities.Untitled */ : 0 /* WorkingCopyCapabilities.None */;
                    this.onDidChangeDirty = input.onDidChangeDirty;
                    this.onDidChangeContent = input.onDidChangeContent;
                    this.onDidSave = input.onDidSave;
                }
                get name() { return input.getName(); }
                isDirty() { return input.isDirty(); }
                isModified() { return input.isDirty(); }
                backup(token) { return input.L(token); }
                save(options) { return input.save(0, options).then(editor => !!editor); }
                revert(options) { return input.revert(0, options); }
            };
            this.B(this.D.registerWorkingCopy(workingCopyAdapter));
        }
        async save(group, options) {
            if (((await this.resolveModels()).resultsModel).isDisposed()) {
                return;
            }
            if (this.backingUri) {
                await this.y.write(this.backingUri, await this.H(), options);
                this.setDirty(false);
                this.r.fire({ reason: options?.reason, source: options?.source });
                return this;
            }
            else {
                return this.saveAs(group, options);
            }
        }
        tryReadConfigSync() {
            return this.u?.config;
        }
        async H() {
            const { configurationModel, resultsModel } = await this.resolveModels();
            return (0, searchEditorSerialization_1.$POb)(configurationModel.config) + '\n' + resultsModel.getValue();
        }
        J(model) {
            this.I?.dispose();
            if (!this.isDisposed()) {
                this.I = model.onConfigDidUpdate(() => {
                    if (this.m !== this.getName()) {
                        this.b.fire();
                        this.m = this.getName();
                    }
                    this.c.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */).searchConfig = model.config;
                });
                this.B(this.I);
            }
        }
        async resolveModels() {
            return this.model.resolve().then(data => {
                this.t = data.resultsModel;
                this.u = data.configurationModel;
                if (this.m !== this.getName()) {
                    this.b.fire();
                    this.m = this.getName();
                }
                this.J(data.configurationModel);
                return data;
            });
        }
        async saveAs(group, options) {
            const path = await this.z.pickFileToSave(await this.M(), options?.availableFileSystems);
            if (path) {
                this.F.publicLog2('searchEditor/saveSearchResults');
                const toWrite = await this.H();
                if (await this.y.create([{ resource: path, value: toWrite, options: { overwrite: true } }])) {
                    this.setDirty(false);
                    if (!(0, resources_1.$bg)(path, this.modelUri)) {
                        const input = this.C.invokeFunction(exports.$2Ob, { fileUri: path, from: 'existingFile' });
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
                const originalURI = editor_1.$3E.getOriginalUri(this);
                return (0, nls_1.localize)(0, null, (0, path_1.$ae)((originalURI ?? this.backingUri).path, exports.$ZOb));
            }
            const query = this.u?.config?.query?.trim();
            if (query) {
                return (0, nls_1.localize)(1, null, trimToMax(query));
            }
            return (0, nls_1.localize)(2, null);
        }
        setDirty(dirty) {
            const wasDirty = this.j;
            this.j = dirty;
            if (wasDirty !== dirty) {
                this.a.fire();
            }
        }
        isDirty() {
            return this.j;
        }
        async rename(group, target) {
            if ((0, resources_1.$gg)(target) === exports.$ZOb) {
                return {
                    editor: this.C.invokeFunction(exports.$2Ob, { from: 'existingFile', fileUri: target })
                };
            }
            // Ignore move if editor was renamed to a different file extension
            return undefined;
        }
        dispose() {
            this.w.destroyModel(this.modelUri);
            super.dispose();
        }
        matches(other) {
            if (super.matches(other)) {
                return true;
            }
            if (other instanceof $1Ob_1) {
                return !!(other.modelUri.fragment && other.modelUri.fragment === this.modelUri.fragment) || !!(other.backingUri && (0, resources_1.$bg)(other.backingUri, this.backingUri));
            }
            return false;
        }
        getMatchRanges() {
            return (this.t?.getAllDecorations() ?? [])
                .filter(decoration => decoration.options.className === constants_1.$GOb)
                .filter(({ range }) => !(range.startColumn === 1 && range.endColumn === 1))
                .map(({ range }) => range);
        }
        async setMatchRanges(ranges) {
            this.s = (await this.resolveModels()).resultsModel.deltaDecorations(this.s, ranges.map(range => ({ range, options: { description: 'search-editor-find-match', className: constants_1.$GOb, stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */ } })));
        }
        async revert(group, options) {
            if (options?.soft) {
                this.setDirty(false);
                return;
            }
            if (this.backingUri) {
                const { config, text } = await this.C.invokeFunction(searchEditorSerialization_1.$UOb, this.backingUri);
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
        async L(token) {
            const contents = await this.H();
            if (token.isCancellationRequested) {
                return {};
            }
            return {
                content: (0, buffer_1.$Qd)(buffer_1.$Fd.fromString(contents))
            };
        }
        async M() {
            const query = (await this.resolveModels()).configurationModel.config.query;
            const searchFileName = (query.replace(/[^\w \-_]+/g, '_') || 'Search') + exports.$ZOb;
            return (0, resources_1.$ig)(await this.z.defaultFilePath(this.G.defaultUriScheme), searchFileName);
        }
        toUntyped() {
            if (this.hasCapability(4 /* EditorInputCapabilities.Untitled */)) {
                return undefined;
            }
            return {
                resource: this.resource,
                options: {
                    override: $1Ob_1.ID
                }
            };
        }
    };
    exports.$1Ob = $1Ob;
    exports.$1Ob = $1Ob = $1Ob_1 = __decorate([
        __param(2, model_1.$yA),
        __param(3, textfiles_1.$JD),
        __param(4, dialogs_1.$qA),
        __param(5, instantiation_1.$Ah),
        __param(6, workingCopyService_1.$TC),
        __param(7, telemetry_1.$9k),
        __param(8, pathService_1.$yJ),
        __param(9, storage_1.$Vo)
    ], $1Ob);
    const $2Ob = (accessor, existingData) => {
        const storageService = accessor.get(storage_1.$Vo);
        const configurationService = accessor.get(configuration_1.$8h);
        const instantiationService = accessor.get(instantiation_1.$Ah);
        const modelUri = existingData.from === 'model' ? existingData.modelUri : uri_1.URI.from({ scheme: constants_1.$EOb, fragment: `${Math.random()}` });
        if (!searchEditorModel_1.$YOb.models.has(modelUri)) {
            if (existingData.from === 'existingFile') {
                instantiationService.invokeFunction(accessor => searchEditorModel_1.$YOb.initializeModelFromExistingFile(accessor, modelUri, existingData.fileUri));
            }
            else {
                const searchEditorSettings = configurationService.getValue('search').searchEditor;
                const reuseOldSettings = searchEditorSettings.reusePriorSearchConfiguration;
                const defaultNumberOfContextLines = searchEditorSettings.defaultNumberOfContextLines;
                const priorConfig = reuseOldSettings ? new memento_1.$YT($1Ob.ID, storageService).getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */).searchConfig : {};
                const defaultConfig = (0, searchEditorSerialization_1.$ROb)();
                const config = { ...defaultConfig, ...priorConfig, ...existingData.config };
                if (defaultNumberOfContextLines !== null && defaultNumberOfContextLines !== undefined) {
                    config.contextLines = existingData?.config?.contextLines ?? defaultNumberOfContextLines;
                }
                if (existingData.from === 'rawData') {
                    if (existingData.resultsContents) {
                        config.contextLines = 0;
                    }
                    instantiationService.invokeFunction(accessor => searchEditorModel_1.$YOb.initializeModelFromRawData(accessor, modelUri, config, existingData.resultsContents));
                }
                else {
                    instantiationService.invokeFunction(accessor => searchEditorModel_1.$YOb.initializeModelFromExistingModel(accessor, modelUri, config));
                }
            }
        }
        return instantiationService.createInstance($1Ob, modelUri, existingData.from === 'existingFile'
            ? existingData.fileUri
            : existingData.from === 'model'
                ? existingData.backupOf
                : undefined);
    };
    exports.$2Ob = $2Ob;
});
//# sourceMappingURL=searchEditorInput.js.map