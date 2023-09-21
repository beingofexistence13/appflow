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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/base/common/strings", "vs/editor/common/languages/language", "vs/editor/contrib/suggest/browser/suggest", "vs/nls", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/log/common/log", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/snippets/browser/snippetsFile", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/workbench/services/language/common/languageService", "./snippetCompletionProvider", "vs/platform/extensionResourceLoader/common/extensionResourceLoader", "vs/base/common/map", "vs/platform/storage/common/storage", "vs/base/common/types", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/textfile/common/textfiles", "vs/editor/common/languages/languageConfigurationRegistry", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/base/common/arrays"], function (require, exports, lifecycle_1, resources, strings_1, language_1, suggest_1, nls_1, environment_1, files_1, lifecycle_2, log_1, workspace_1, snippetsFile_1, extensionsRegistry_1, languageService_1, snippetCompletionProvider_1, extensionResourceLoader_1, map_1, storage_1, types_1, instantiation_1, textfiles_1, languageConfigurationRegistry_1, userDataProfile_1, arrays_1) {
    "use strict";
    var SnippetEnablement_1, SnippetUsageTimestamps_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getNonWhitespacePrefix = exports.SnippetsService = void 0;
    var snippetExt;
    (function (snippetExt) {
        function toValidSnippet(extension, snippet, languageService) {
            if ((0, strings_1.isFalsyOrWhitespace)(snippet.path)) {
                extension.collector.error((0, nls_1.localize)('invalid.path.0', "Expected string in `contributes.{0}.path`. Provided value: {1}", extension.description.name, String(snippet.path)));
                return null;
            }
            if ((0, strings_1.isFalsyOrWhitespace)(snippet.language) && !snippet.path.endsWith('.code-snippets')) {
                extension.collector.error((0, nls_1.localize)('invalid.language.0', "When omitting the language, the value of `contributes.{0}.path` must be a `.code-snippets`-file. Provided value: {1}", extension.description.name, String(snippet.path)));
                return null;
            }
            if (!(0, strings_1.isFalsyOrWhitespace)(snippet.language) && !languageService.isRegisteredLanguageId(snippet.language)) {
                extension.collector.error((0, nls_1.localize)('invalid.language', "Unknown language in `contributes.{0}.language`. Provided value: {1}", extension.description.name, String(snippet.language)));
                return null;
            }
            const extensionLocation = extension.description.extensionLocation;
            const snippetLocation = resources.joinPath(extensionLocation, snippet.path);
            if (!resources.isEqualOrParent(snippetLocation, extensionLocation)) {
                extension.collector.error((0, nls_1.localize)('invalid.path.1', "Expected `contributes.{0}.path` ({1}) to be included inside extension's folder ({2}). This might make the extension non-portable.", extension.description.name, snippetLocation.path, extensionLocation.path));
                return null;
            }
            return {
                language: snippet.language,
                location: snippetLocation
            };
        }
        snippetExt.toValidSnippet = toValidSnippet;
        snippetExt.snippetsContribution = {
            description: (0, nls_1.localize)('vscode.extension.contributes.snippets', 'Contributes snippets.'),
            type: 'array',
            defaultSnippets: [{ body: [{ language: '', path: '' }] }],
            items: {
                type: 'object',
                defaultSnippets: [{ body: { language: '${1:id}', path: './snippets/${2:id}.json.' } }],
                properties: {
                    language: {
                        description: (0, nls_1.localize)('vscode.extension.contributes.snippets-language', 'Language identifier for which this snippet is contributed to.'),
                        type: 'string'
                    },
                    path: {
                        description: (0, nls_1.localize)('vscode.extension.contributes.snippets-path', 'Path of the snippets file. The path is relative to the extension folder and typically starts with \'./snippets/\'.'),
                        type: 'string'
                    }
                }
            }
        };
        snippetExt.point = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
            extensionPoint: 'snippets',
            deps: [languageService_1.languagesExtPoint],
            jsonSchema: snippetExt.snippetsContribution
        });
    })(snippetExt || (snippetExt = {}));
    function watch(service, resource, callback) {
        return (0, lifecycle_1.combinedDisposable)(service.watch(resource), service.onDidFilesChange(e => {
            if (e.affects(resource)) {
                callback();
            }
        }));
    }
    let SnippetEnablement = class SnippetEnablement {
        static { SnippetEnablement_1 = this; }
        static { this._key = 'snippets.ignoredSnippets'; }
        constructor(_storageService) {
            this._storageService = _storageService;
            const raw = _storageService.get(SnippetEnablement_1._key, 0 /* StorageScope.PROFILE */, '');
            let data;
            try {
                data = JSON.parse(raw);
            }
            catch { }
            this._ignored = (0, types_1.isStringArray)(data) ? new Set(data) : new Set();
        }
        isIgnored(id) {
            return this._ignored.has(id);
        }
        updateIgnored(id, value) {
            let changed = false;
            if (this._ignored.has(id) && !value) {
                this._ignored.delete(id);
                changed = true;
            }
            else if (!this._ignored.has(id) && value) {
                this._ignored.add(id);
                changed = true;
            }
            if (changed) {
                this._storageService.store(SnippetEnablement_1._key, JSON.stringify(Array.from(this._ignored)), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            }
        }
    };
    SnippetEnablement = SnippetEnablement_1 = __decorate([
        __param(0, storage_1.IStorageService)
    ], SnippetEnablement);
    let SnippetUsageTimestamps = class SnippetUsageTimestamps {
        static { SnippetUsageTimestamps_1 = this; }
        static { this._key = 'snippets.usageTimestamps'; }
        constructor(_storageService) {
            this._storageService = _storageService;
            const raw = _storageService.get(SnippetUsageTimestamps_1._key, 0 /* StorageScope.PROFILE */, '');
            let data;
            try {
                data = JSON.parse(raw);
            }
            catch {
                data = [];
            }
            this._usages = Array.isArray(data) ? new Map(data) : new Map();
        }
        getUsageTimestamp(id) {
            return this._usages.get(id);
        }
        updateUsageTimestamp(id) {
            // map uses insertion order, we want most recent at the end
            this._usages.delete(id);
            this._usages.set(id, Date.now());
            // persist last 100 item
            const all = [...this._usages].slice(-100);
            this._storageService.store(SnippetUsageTimestamps_1._key, JSON.stringify(all), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
    };
    SnippetUsageTimestamps = SnippetUsageTimestamps_1 = __decorate([
        __param(0, storage_1.IStorageService)
    ], SnippetUsageTimestamps);
    let SnippetsService = class SnippetsService {
        constructor(_environmentService, _userDataProfileService, _contextService, _languageService, _logService, _fileService, _textfileService, _extensionResourceLoaderService, lifecycleService, instantiationService, languageConfigurationService) {
            this._environmentService = _environmentService;
            this._userDataProfileService = _userDataProfileService;
            this._contextService = _contextService;
            this._languageService = _languageService;
            this._logService = _logService;
            this._fileService = _fileService;
            this._textfileService = _textfileService;
            this._extensionResourceLoaderService = _extensionResourceLoaderService;
            this._disposables = new lifecycle_1.DisposableStore();
            this._pendingWork = [];
            this._files = new map_1.ResourceMap();
            this._pendingWork.push(Promise.resolve(lifecycleService.when(3 /* LifecyclePhase.Restored */).then(() => {
                this._initExtensionSnippets();
                this._initUserSnippets();
                this._initWorkspaceSnippets();
            })));
            (0, suggest_1.setSnippetSuggestSupport)(new snippetCompletionProvider_1.SnippetCompletionProvider(this._languageService, this, languageConfigurationService));
            this._enablement = instantiationService.createInstance(SnippetEnablement);
            this._usageTimestamps = instantiationService.createInstance(SnippetUsageTimestamps);
        }
        dispose() {
            this._disposables.dispose();
        }
        isEnabled(snippet) {
            return !this._enablement.isIgnored(snippet.snippetIdentifier);
        }
        updateEnablement(snippet, enabled) {
            this._enablement.updateIgnored(snippet.snippetIdentifier, !enabled);
        }
        updateUsageTimestamp(snippet) {
            this._usageTimestamps.updateUsageTimestamp(snippet.snippetIdentifier);
        }
        _joinSnippets() {
            const promises = this._pendingWork.slice(0);
            this._pendingWork.length = 0;
            return Promise.all(promises);
        }
        async getSnippetFiles() {
            await this._joinSnippets();
            return this._files.values();
        }
        async getSnippets(languageId, opts) {
            await this._joinSnippets();
            const result = [];
            const promises = [];
            if (languageId) {
                if (this._languageService.isRegisteredLanguageId(languageId)) {
                    for (const file of this._files.values()) {
                        promises.push(file.load()
                            .then(file => file.select(languageId, result))
                            .catch(err => this._logService.error(err, file.location.toString())));
                    }
                }
            }
            else {
                for (const file of this._files.values()) {
                    promises.push(file.load()
                        .then(file => (0, arrays_1.insertInto)(result, result.length, file.data))
                        .catch(err => this._logService.error(err, file.location.toString())));
                }
            }
            await Promise.all(promises);
            return this._filterAndSortSnippets(result, opts);
        }
        getSnippetsSync(languageId, opts) {
            const result = [];
            if (this._languageService.isRegisteredLanguageId(languageId)) {
                for (const file of this._files.values()) {
                    // kick off loading (which is a noop in case it's already loaded)
                    // and optimistically collect snippets
                    file.load().catch(_err => { });
                    file.select(languageId, result);
                }
            }
            return this._filterAndSortSnippets(result, opts);
        }
        _filterAndSortSnippets(snippets, opts) {
            const result = [];
            for (const snippet of snippets) {
                if (!snippet.prefix && !opts?.includeNoPrefixSnippets) {
                    // prefix or no-prefix wanted
                    continue;
                }
                if (!this.isEnabled(snippet) && !opts?.includeDisabledSnippets) {
                    // enabled or disabled wanted
                    continue;
                }
                if (typeof opts?.fileTemplateSnippets === 'boolean' && opts.fileTemplateSnippets !== snippet.isFileTemplate) {
                    // isTopLevel requested but mismatching
                    continue;
                }
                result.push(snippet);
            }
            return result.sort((a, b) => {
                let result = 0;
                if (!opts?.noRecencySort) {
                    const val1 = this._usageTimestamps.getUsageTimestamp(a.snippetIdentifier) ?? -1;
                    const val2 = this._usageTimestamps.getUsageTimestamp(b.snippetIdentifier) ?? -1;
                    result = val2 - val1;
                }
                if (result === 0) {
                    result = this._compareSnippet(a, b);
                }
                return result;
            });
        }
        _compareSnippet(a, b) {
            if (a.snippetSource < b.snippetSource) {
                return -1;
            }
            else if (a.snippetSource > b.snippetSource) {
                return 1;
            }
            else if (a.source < b.source) {
                return -1;
            }
            else if (a.source > b.source) {
                return 1;
            }
            else if (a.name > b.name) {
                return 1;
            }
            else if (a.name < b.name) {
                return -1;
            }
            else {
                return 0;
            }
        }
        // --- loading, watching
        _initExtensionSnippets() {
            snippetExt.point.setHandler(extensions => {
                for (const [key, value] of this._files) {
                    if (value.source === 3 /* SnippetSource.Extension */) {
                        this._files.delete(key);
                    }
                }
                for (const extension of extensions) {
                    for (const contribution of extension.value) {
                        const validContribution = snippetExt.toValidSnippet(extension, contribution, this._languageService);
                        if (!validContribution) {
                            continue;
                        }
                        const file = this._files.get(validContribution.location);
                        if (file) {
                            if (file.defaultScopes) {
                                file.defaultScopes.push(validContribution.language);
                            }
                            else {
                                file.defaultScopes = [];
                            }
                        }
                        else {
                            const file = new snippetsFile_1.SnippetFile(3 /* SnippetSource.Extension */, validContribution.location, validContribution.language ? [validContribution.language] : undefined, extension.description, this._fileService, this._extensionResourceLoaderService);
                            this._files.set(file.location, file);
                            if (this._environmentService.isExtensionDevelopment) {
                                file.load().then(file => {
                                    // warn about bad tabstop/variable usage
                                    if (file.data.some(snippet => snippet.isBogous)) {
                                        extension.collector.warn((0, nls_1.localize)('badVariableUse', "One or more snippets from the extension '{0}' very likely confuse snippet-variables and snippet-placeholders (see https://code.visualstudio.com/docs/editor/userdefinedsnippets#_snippet-syntax for more details)", extension.description.name));
                                    }
                                }, err => {
                                    // generic error
                                    extension.collector.warn((0, nls_1.localize)('badFile', "The snippet file \"{0}\" could not be read.", file.location.toString()));
                                });
                            }
                        }
                    }
                }
            });
        }
        _initWorkspaceSnippets() {
            // workspace stuff
            const disposables = new lifecycle_1.DisposableStore();
            const updateWorkspaceSnippets = () => {
                disposables.clear();
                this._pendingWork.push(this._initWorkspaceFolderSnippets(this._contextService.getWorkspace(), disposables));
            };
            this._disposables.add(disposables);
            this._disposables.add(this._contextService.onDidChangeWorkspaceFolders(updateWorkspaceSnippets));
            this._disposables.add(this._contextService.onDidChangeWorkbenchState(updateWorkspaceSnippets));
            updateWorkspaceSnippets();
        }
        async _initWorkspaceFolderSnippets(workspace, bucket) {
            const promises = workspace.folders.map(async (folder) => {
                const snippetFolder = folder.toResource('.vscode');
                const value = await this._fileService.exists(snippetFolder);
                if (value) {
                    this._initFolderSnippets(2 /* SnippetSource.Workspace */, snippetFolder, bucket);
                }
                else {
                    // watch
                    bucket.add(this._fileService.onDidFilesChange(e => {
                        if (e.contains(snippetFolder, 1 /* FileChangeType.ADDED */)) {
                            this._initFolderSnippets(2 /* SnippetSource.Workspace */, snippetFolder, bucket);
                        }
                    }));
                }
            });
            await Promise.all(promises);
        }
        async _initUserSnippets() {
            const disposables = new lifecycle_1.DisposableStore();
            const updateUserSnippets = async () => {
                disposables.clear();
                const userSnippetsFolder = this._userDataProfileService.currentProfile.snippetsHome;
                await this._fileService.createFolder(userSnippetsFolder);
                await this._initFolderSnippets(1 /* SnippetSource.User */, userSnippetsFolder, disposables);
            };
            this._disposables.add(disposables);
            this._disposables.add(this._userDataProfileService.onDidChangeCurrentProfile(e => e.join((async () => {
                this._pendingWork.push(updateUserSnippets());
            })())));
            await updateUserSnippets();
        }
        _initFolderSnippets(source, folder, bucket) {
            const disposables = new lifecycle_1.DisposableStore();
            const addFolderSnippets = async () => {
                disposables.clear();
                if (!await this._fileService.exists(folder)) {
                    return;
                }
                try {
                    const stat = await this._fileService.resolve(folder);
                    for (const entry of stat.children || []) {
                        disposables.add(this._addSnippetFile(entry.resource, source));
                    }
                }
                catch (err) {
                    this._logService.error(`Failed snippets from folder '${folder.toString()}'`, err);
                }
            };
            bucket.add(this._textfileService.files.onDidSave(e => {
                if (resources.isEqualOrParent(e.model.resource, folder)) {
                    addFolderSnippets();
                }
            }));
            bucket.add(watch(this._fileService, folder, addFolderSnippets));
            bucket.add(disposables);
            return addFolderSnippets();
        }
        _addSnippetFile(uri, source) {
            const ext = resources.extname(uri);
            if (source === 1 /* SnippetSource.User */ && ext === '.json') {
                const langName = resources.basename(uri).replace(/\.json/, '');
                this._files.set(uri, new snippetsFile_1.SnippetFile(source, uri, [langName], undefined, this._fileService, this._extensionResourceLoaderService));
            }
            else if (ext === '.code-snippets') {
                this._files.set(uri, new snippetsFile_1.SnippetFile(source, uri, undefined, undefined, this._fileService, this._extensionResourceLoaderService));
            }
            return {
                dispose: () => this._files.delete(uri)
            };
        }
    };
    exports.SnippetsService = SnippetsService;
    exports.SnippetsService = SnippetsService = __decorate([
        __param(0, environment_1.IEnvironmentService),
        __param(1, userDataProfile_1.IUserDataProfileService),
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, language_1.ILanguageService),
        __param(4, log_1.ILogService),
        __param(5, files_1.IFileService),
        __param(6, textfiles_1.ITextFileService),
        __param(7, extensionResourceLoader_1.IExtensionResourceLoaderService),
        __param(8, lifecycle_2.ILifecycleService),
        __param(9, instantiation_1.IInstantiationService),
        __param(10, languageConfigurationRegistry_1.ILanguageConfigurationService)
    ], SnippetsService);
    function getNonWhitespacePrefix(model, position) {
        /**
         * Do not analyze more characters
         */
        const MAX_PREFIX_LENGTH = 100;
        const line = model.getLineContent(position.lineNumber).substr(0, position.column - 1);
        const minChIndex = Math.max(0, line.length - MAX_PREFIX_LENGTH);
        for (let chIndex = line.length - 1; chIndex >= minChIndex; chIndex--) {
            const ch = line.charAt(chIndex);
            if (/\s/.test(ch)) {
                return line.substr(chIndex + 1);
            }
        }
        if (minChIndex === 0) {
            return line;
        }
        return '';
    }
    exports.getNonWhitespacePrefix = getNonWhitespacePrefix;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25pcHBldHNTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc25pcHBldHMvYnJvd3Nlci9zbmlwcGV0c1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQStCaEcsSUFBVSxVQUFVLENBb0ZuQjtJQXBGRCxXQUFVLFVBQVU7UUFZbkIsU0FBZ0IsY0FBYyxDQUFDLFNBQXlELEVBQUUsT0FBZ0MsRUFBRSxlQUFpQztZQUU1SixJQUFJLElBQUEsNkJBQW1CLEVBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUN0QyxTQUFTLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFBLGNBQVEsRUFDakMsZ0JBQWdCLEVBQ2hCLGdFQUFnRSxFQUNoRSxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUNoRCxDQUFDLENBQUM7Z0JBQ0gsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUVELElBQUksSUFBQSw2QkFBbUIsRUFBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO2dCQUN0RixTQUFTLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFBLGNBQVEsRUFDakMsb0JBQW9CLEVBQ3BCLHNIQUFzSCxFQUN0SCxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUNoRCxDQUFDLENBQUM7Z0JBQ0gsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUVELElBQUksQ0FBQyxJQUFBLDZCQUFtQixFQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxzQkFBc0IsQ0FB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