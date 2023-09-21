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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/base/common/strings", "vs/editor/common/languages/language", "vs/editor/contrib/suggest/browser/suggest", "vs/nls!vs/workbench/contrib/snippets/browser/snippetsService", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/log/common/log", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/snippets/browser/snippetsFile", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/workbench/services/language/common/languageService", "./snippetCompletionProvider", "vs/platform/extensionResourceLoader/common/extensionResourceLoader", "vs/base/common/map", "vs/platform/storage/common/storage", "vs/base/common/types", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/textfile/common/textfiles", "vs/editor/common/languages/languageConfigurationRegistry", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/base/common/arrays"], function (require, exports, lifecycle_1, resources, strings_1, language_1, suggest_1, nls_1, environment_1, files_1, lifecycle_2, log_1, workspace_1, snippetsFile_1, extensionsRegistry_1, languageService_1, snippetCompletionProvider_1, extensionResourceLoader_1, map_1, storage_1, types_1, instantiation_1, textfiles_1, languageConfigurationRegistry_1, userDataProfile_1, arrays_1) {
    "use strict";
    var SnippetEnablement_1, SnippetUsageTimestamps_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$pmb = exports.$omb = void 0;
    var snippetExt;
    (function (snippetExt) {
        function toValidSnippet(extension, snippet, languageService) {
            if ((0, strings_1.$me)(snippet.path)) {
                extension.collector.error((0, nls_1.localize)(0, null, extension.description.name, String(snippet.path)));
                return null;
            }
            if ((0, strings_1.$me)(snippet.language) && !snippet.path.endsWith('.code-snippets')) {
                extension.collector.error((0, nls_1.localize)(1, null, extension.description.name, String(snippet.path)));
                return null;
            }
            if (!(0, strings_1.$me)(snippet.language) && !languageService.isRegisteredLanguageId(snippet.language)) {
                extension.collector.error((0, nls_1.localize)(2, null, extension.description.name, String(snippet.language)));
                return null;
            }
            const extensionLocation = extension.description.extensionLocation;
            const snippetLocation = resources.$ig(extensionLocation, snippet.path);
            if (!resources.$cg(snippetLocation, extensionLocation)) {
                extension.collector.error((0, nls_1.localize)(3, null, extension.description.name, snippetLocation.path, extensionLocation.path));
                return null;
            }
            return {
                language: snippet.language,
                location: snippetLocation
            };
        }
        snippetExt.toValidSnippet = toValidSnippet;
        snippetExt.snippetsContribution = {
            description: (0, nls_1.localize)(4, null),
            type: 'array',
            defaultSnippets: [{ body: [{ language: '', path: '' }] }],
            items: {
                type: 'object',
                defaultSnippets: [{ body: { language: '${1:id}', path: './snippets/${2:id}.json.' } }],
                properties: {
                    language: {
                        description: (0, nls_1.localize)(5, null),
                        type: 'string'
                    },
                    path: {
                        description: (0, nls_1.localize)(6, null),
                        type: 'string'
                    }
                }
            }
        };
        snippetExt.point = extensionsRegistry_1.$2F.registerExtensionPoint({
            extensionPoint: 'snippets',
            deps: [languageService_1.$kmb],
            jsonSchema: snippetExt.snippetsContribution
        });
    })(snippetExt || (snippetExt = {}));
    function watch(service, resource, callback) {
        return (0, lifecycle_1.$hc)(service.watch(resource), service.onDidFilesChange(e => {
            if (e.affects(resource)) {
                callback();
            }
        }));
    }
    let SnippetEnablement = class SnippetEnablement {
        static { SnippetEnablement_1 = this; }
        static { this.c = 'snippets.ignoredSnippets'; }
        constructor(f) {
            this.f = f;
            const raw = f.get(SnippetEnablement_1.c, 0 /* StorageScope.PROFILE */, '');
            let data;
            try {
                data = JSON.parse(raw);
            }
            catch { }
            this.d = (0, types_1.$kf)(data) ? new Set(data) : new Set();
        }
        isIgnored(id) {
            return this.d.has(id);
        }
        updateIgnored(id, value) {
            let changed = false;
            if (this.d.has(id) && !value) {
                this.d.delete(id);
                changed = true;
            }
            else if (!this.d.has(id) && value) {
                this.d.add(id);
                changed = true;
            }
            if (changed) {
                this.f.store(SnippetEnablement_1.c, JSON.stringify(Array.from(this.d)), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            }
        }
    };
    SnippetEnablement = SnippetEnablement_1 = __decorate([
        __param(0, storage_1.$Vo)
    ], SnippetEnablement);
    let SnippetUsageTimestamps = class SnippetUsageTimestamps {
        static { SnippetUsageTimestamps_1 = this; }
        static { this.c = 'snippets.usageTimestamps'; }
        constructor(f) {
            this.f = f;
            const raw = f.get(SnippetUsageTimestamps_1.c, 0 /* StorageScope.PROFILE */, '');
            let data;
            try {
                data = JSON.parse(raw);
            }
            catch {
                data = [];
            }
            this.d = Array.isArray(data) ? new Map(data) : new Map();
        }
        getUsageTimestamp(id) {
            return this.d.get(id);
        }
        updateUsageTimestamp(id) {
            // map uses insertion order, we want most recent at the end
            this.d.delete(id);
            this.d.set(id, Date.now());
            // persist last 100 item
            const all = [...this.d].slice(-100);
            this.f.store(SnippetUsageTimestamps_1.c, JSON.stringify(all), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
    };
    SnippetUsageTimestamps = SnippetUsageTimestamps_1 = __decorate([
        __param(0, storage_1.$Vo)
    ], SnippetUsageTimestamps);
    let $omb = class $omb {
        constructor(i, j, k, l, m, n, o, p, lifecycleService, instantiationService, languageConfigurationService) {
            this.i = i;
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
            this.n = n;
            this.o = o;
            this.p = p;
            this.c = new lifecycle_1.$jc();
            this.d = [];
            this.f = new map_1.$zi();
            this.d.push(Promise.resolve(lifecycleService.when(3 /* LifecyclePhase.Restored */).then(() => {
                this.t();
                this.w();
                this.u();
            })));
            (0, suggest_1.$15)(new snippetCompletionProvider_1.$nmb(this.l, this, languageConfigurationService));
            this.g = instantiationService.createInstance(SnippetEnablement);
            this.h = instantiationService.createInstance(SnippetUsageTimestamps);
        }
        dispose() {
            this.c.dispose();
        }
        isEnabled(snippet) {
            return !this.g.isIgnored(snippet.snippetIdentifier);
        }
        updateEnablement(snippet, enabled) {
            this.g.updateIgnored(snippet.snippetIdentifier, !enabled);
        }
        updateUsageTimestamp(snippet) {
            this.h.updateUsageTimestamp(snippet.snippetIdentifier);
        }
        q() {
            const promises = this.d.slice(0);
            this.d.length = 0;
            return Promise.all(promises);
        }
        async getSnippetFiles() {
            await this.q();
            return this.f.values();
        }
        async getSnippets(languageId, opts) {
            await this.q();
            const result = [];
            const promises = [];
            if (languageId) {
                if (this.l.isRegisteredLanguageId(languageId)) {
                    for (const file of this.f.values()) {
                        promises.push(file.load()
                            .then(file => file.select(languageId, result))
                            .catch(err => this.m.error(err, file.location.toString())));
                    }
                }
            }
            else {
                for (const file of this.f.values()) {
                    promises.push(file.load()
                        .then(file => (0, arrays_1.$3b)(result, result.length, file.data))
                        .catch(err => this.m.error(err, file.location.toString())));
                }
            }
            await Promise.all(promises);
            return this.r(result, opts);
        }
        getSnippetsSync(languageId, opts) {
            const result = [];
            if (this.l.isRegisteredLanguageId(languageId)) {
                for (const file of this.f.values()) {
                    // kick off loading (which is a noop in case it's already loaded)
                    // and optimistically collect snippets
                    file.load().catch(_err => { });
                    file.select(languageId, result);
                }
            }
            return this.r(result, opts);
        }
        r(snippets, opts) {
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
                    const val1 = this.h.getUsageTimestamp(a.snippetIdentifier) ?? -1;
                    const val2 = this.h.getUsageTimestamp(b.snippetIdentifier) ?? -1;
                    result = val2 - val1;
                }
                if (result === 0) {
                    result = this.s(a, b);
                }
                return result;
            });
        }
        s(a, b) {
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
        t() {
            snippetExt.point.setHandler(extensions => {
                for (const [key, value] of this.f) {
                    if (value.source === 3 /* SnippetSource.Extension */) {
                        this.f.delete(key);
                    }
                }
                for (const extension of extensions) {
                    for (const contribution of extension.value) {
                        const validContribution = snippetExt.toValidSnippet(extension, contribution, this.l);
                        if (!validContribution) {
                            continue;
                        }
                        const file = this.f.get(validContribution.location);
                        if (file) {
                            if (file.defaultScopes) {
                                file.defaultScopes.push(validContribution.language);
                            }
                            else {
                                file.defaultScopes = [];
                            }
                        }
                        else {
                            const file = new snippetsFile_1.$_lb(3 /* SnippetSource.Extension */, validContribution.location, validContribution.language ? [validContribution.language] : undefined, extension.description, this.n, this.p);
                            this.f.set(file.location, file);
                            if (this.i.isExtensionDevelopment) {
                                file.load().then(file => {
                                    // warn about bad tabstop/variable usage
                                    if (file.data.some(snippet => snippet.isBogous)) {
                                        extension.collector.warn((0, nls_1.localize)(7, null, extension.description.name));
                                    }
                                }, err => {
                                    // generic error
                                    extension.collector.warn((0, nls_1.localize)(8, null, file.location.toString()));
                                });
                            }
                        }
                    }
                }
            });
        }
        u() {
            // workspace stuff
            const disposables = new lifecycle_1.$jc();
            const updateWorkspaceSnippets = () => {
                disposables.clear();
                this.d.push(this.v(this.k.getWorkspace(), disposables));
            };
            this.c.add(disposables);
            this.c.add(this.k.onDidChangeWorkspaceFolders(updateWorkspaceSnippets));
            this.c.add(this.k.onDidChangeWorkbenchState(updateWorkspaceSnippets));
            updateWorkspaceSnippets();
        }
        async v(workspace, bucket) {
            const promises = workspace.folders.map(async (folder) => {
                const snippetFolder = folder.toResource('.vscode');
                const value = await this.n.exists(snippetFolder);
                if (value) {
                    this.x(2 /* SnippetSource.Workspace */, snippetFolder, bucket);
                }
                else {
                    // watch
                    bucket.add(this.n.onDidFilesChange(e => {
                        if (e.contains(snippetFolder, 1 /* FileChangeType.ADDED */)) {
                            this.x(2 /* SnippetSource.Workspace */, snippetFolder, bucket);
                        }
                    }));
                }
            });
            await Promise.all(promises);
        }
        async w() {
            const disposables = new lifecycle_1.$jc();
            const updateUserSnippets = async () => {
                disposables.clear();
                const userSnippetsFolder = this.j.currentProfile.snippetsHome;
                await this.n.createFolder(userSnippetsFolder);
                await this.x(1 /* SnippetSource.User */, userSnippetsFolder, disposables);
            };
            this.c.add(disposables);
            this.c.add(this.j.onDidChangeCurrentProfile(e => e.join((async () => {
                this.d.push(updateUserSnippets());
            })())));
            await updateUserSnippets();
        }
        x(source, folder, bucket) {
            const disposables = new lifecycle_1.$jc();
            const addFolderSnippets = async () => {
                disposables.clear();
                if (!await this.n.exists(folder)) {
                    return;
                }
                try {
                    const stat = await this.n.resolve(folder);
                    for (const entry of stat.children || []) {
                        disposables.add(this.y(entry.resource, source));
                    }
                }
                catch (err) {
                    this.m.error(`Failed snippets from folder '${folder.toString()}'`, err);
                }
            };
            bucket.add(this.o.files.onDidSave(e => {
                if (resources.$cg(e.model.resource, folder)) {
                    addFolderSnippets();
                }
            }));
            bucket.add(watch(this.n, folder, addFolderSnippets));
            bucket.add(disposables);
            return addFolderSnippets();
        }
        y(uri, source) {
            const ext = resources.$gg(uri);
            if (source === 1 /* SnippetSource.User */ && ext === '.json') {
                const langName = resources.$fg(uri).replace(/\.json/, '');
                this.f.set(uri, new snippetsFile_1.$_lb(source, uri, [langName], undefined, this.n, this.p));
            }
            else if (ext === '.code-snippets') {
                this.f.set(uri, new snippetsFile_1.$_lb(source, uri, undefined, undefined, this.n, this.p));
            }
            return {
                dispose: () => this.f.delete(uri)
            };
        }
    };
    exports.$omb = $omb;
    exports.$omb = $omb = __decorate([
        __param(0, environment_1.$Ih),
        __param(1, userDataProfile_1.$CJ),
        __param(2, workspace_1.$Kh),
        __param(3, language_1.$ct),
        __param(4, log_1.$5i),
        __param(5, files_1.$6j),
        __param(6, textfiles_1.$JD),
        __param(7, extensionResourceLoader_1.$2$),
        __param(8, lifecycle_2.$7y),
        __param(9, instantiation_1.$Ah),
        __param(10, languageConfigurationRegistry_1.$2t)
    ], $omb);
    function $pmb(model, position) {
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
    exports.$pmb = $pmb;
});
//# sourceMappingURL=snippetsService.js.map