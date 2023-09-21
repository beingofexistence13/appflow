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
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/services/languageDetection/common/languageDetectionWorkerService", "vs/base/common/network", "vs/workbench/services/environment/common/environmentService", "vs/platform/configuration/common/configuration", "vs/editor/common/languages/language", "vs/base/common/uri", "vs/base/common/platform", "vs/platform/instantiation/common/extensions", "vs/editor/common/services/model", "vs/base/common/worker/simpleWorker", "vs/platform/telemetry/common/telemetry", "vs/editor/browser/services/editorWorkerService", "vs/editor/common/languages/languageConfigurationRegistry", "vs/platform/diagnostics/common/diagnostics", "vs/platform/workspace/common/workspace", "vs/workbench/services/editor/common/editorService", "vs/platform/storage/common/storage", "vs/base/common/map", "vs/platform/log/common/log"], function (require, exports, lifecycle_1, languageDetectionWorkerService_1, network_1, environmentService_1, configuration_1, language_1, uri_1, platform_1, extensions_1, model_1, simpleWorker_1, telemetry_1, editorWorkerService_1, languageConfigurationRegistry_1, diagnostics_1, workspace_1, editorService_1, storage_1, map_1, log_1) {
    "use strict";
    var $lBb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$nBb = exports.$mBb = exports.$lBb = void 0;
    const TOP_LANG_COUNTS = 12;
    const regexpModuleLocation = `${network_1.$Yf}/vscode-regexp-languagedetection`;
    const regexpModuleLocationAsar = `${network_1.$Zf}/vscode-regexp-languagedetection`;
    const moduleLocation = `${network_1.$Yf}/@vscode/vscode-languagedetection`;
    const moduleLocationAsar = `${network_1.$Zf}/@vscode/vscode-languagedetection`;
    let $lBb = class $lBb extends lifecycle_1.$kc {
        static { $lBb_1 = this; }
        static { this.enablementSettingKey = 'workbench.editor.languageDetection'; }
        static { this.historyBasedEnablementConfig = 'workbench.editor.historyBasedLanguageDetection'; }
        static { this.preferHistoryConfig = 'workbench.editor.preferHistoryBasedLanguageDetection'; }
        static { this.workspaceOpenedLanguagesStorageKey = 'workbench.editor.languageDetectionOpenedLanguages.workspace'; }
        static { this.globalOpenedLanguagesStorageKey = 'workbench.editor.languageDetectionOpenedLanguages.global'; }
        constructor(n, languageService, r, s, t, modelService, u, telemetryService, storageService, w, languageConfigurationService) {
            super();
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.b = false;
            this.c = new Set();
            this.f = new Set();
            this.g = new map_1.$Ci(TOP_LANG_COUNTS);
            this.h = new map_1.$Ci(TOP_LANG_COUNTS);
            this.j = true;
            this.m = {};
            this.a = this.B(new $nBb(modelService, languageService, telemetryService, 
            // TODO: See if it's possible to bundle vscode-languagedetection
            this.n.isBuilt && !platform_1.$o
                ? network_1.$2f.asBrowserUri(`${moduleLocationAsar}/dist/lib/index.js`).toString(true)
                : network_1.$2f.asBrowserUri(`${moduleLocation}/dist/lib/index.js`).toString(true), this.n.isBuilt && !platform_1.$o
                ? network_1.$2f.asBrowserUri(`${moduleLocationAsar}/model/model.json`).toString(true)
                : network_1.$2f.asBrowserUri(`${moduleLocation}/model/model.json`).toString(true), this.n.isBuilt && !platform_1.$o
                ? network_1.$2f.asBrowserUri(`${moduleLocationAsar}/model/group1-shard1of1.bin`).toString(true)
                : network_1.$2f.asBrowserUri(`${moduleLocation}/model/group1-shard1of1.bin`).toString(true), this.n.isBuilt && !platform_1.$o
                ? network_1.$2f.asBrowserUri(`${regexpModuleLocationAsar}/dist/index.js`).toString(true)
                : network_1.$2f.asBrowserUri(`${regexpModuleLocation}/dist/index.js`).toString(true), languageConfigurationService));
            this.C(storageService);
        }
        async y() {
            if (this.b) {
                return;
            }
            this.b = true;
            const fileExtensions = await this.s.getWorkspaceFileExtensions(this.t.getWorkspace());
            let count = 0;
            for (const ext of fileExtensions.extensions) {
                const langId = this.a.getLanguageId(ext);
                if (langId && count < TOP_LANG_COUNTS) {
                    this.c.add(langId);
                    count++;
                    if (count > TOP_LANG_COUNTS) {
                        break;
                    }
                }
            }
            this.j = true;
        }
        isEnabledForLanguage(languageId) {
            return !!languageId && this.r.getValue($lBb_1.enablementSettingKey, { overrideIdentifier: languageId });
        }
        z() {
            if (!this.j) {
                return this.m;
            }
            const biases = {};
            // Give different weight to the biases depending on relevance of source
            this.f.forEach(lang => biases[lang] = (biases[lang] ?? 0) + 7);
            this.c.forEach(lang => biases[lang] = (biases[lang] ?? 0) + 5);
            [...this.h.keys()].forEach(lang => biases[lang] = (biases[lang] ?? 0) + 3);
            [...this.g.keys()].forEach(lang => biases[lang] = (biases[lang] ?? 0) + 1);
            this.w.trace('Session Languages:', JSON.stringify([...this.f]));
            this.w.trace('Workspace Languages:', JSON.stringify([...this.c]));
            this.w.trace('Historical Workspace Opened Languages:', JSON.stringify([...this.h.keys()]));
            this.w.trace('Historical Globally Opened Languages:', JSON.stringify([...this.g.keys()]));
            this.w.trace('Computed Language Detection Biases:', JSON.stringify(biases));
            this.j = false;
            this.m = biases;
            return biases;
        }
        async detectLanguage(resource, supportedLangs) {
            const useHistory = this.r.getValue($lBb_1.historyBasedEnablementConfig);
            const preferHistory = this.r.getValue($lBb_1.preferHistoryConfig);
            if (useHistory) {
                await this.y();
            }
            const biases = useHistory ? this.z() : undefined;
            return this.a.detectLanguage(resource, biases, preferHistory, supportedLangs);
        }
        // TODO: explore using the history service or something similar to provide this list of opened editors
        // so this service can support delayed instantiation. This may be tricky since it seems the IHistoryService
        // only gives history for a workspace... where this takes advantage of history at a global level as well.
        C(storageService) {
            try {
                const globalLangHistoryData = JSON.parse(storageService.get($lBb_1.globalOpenedLanguagesStorageKey, 0 /* StorageScope.PROFILE */, '[]'));
                this.g.fromJSON(globalLangHistoryData);
            }
            catch (e) {
                console.error(e);
            }
            try {
                const workspaceLangHistoryData = JSON.parse(storageService.get($lBb_1.workspaceOpenedLanguagesStorageKey, 1 /* StorageScope.WORKSPACE */, '[]'));
                this.h.fromJSON(workspaceLangHistoryData);
            }
            catch (e) {
                console.error(e);
            }
            this.B(this.u.onDidActiveEditorChange(() => {
                const activeLanguage = this.u.activeTextEditorLanguageId;
                if (activeLanguage && this.u.activeEditor?.resource?.scheme !== network_1.Schemas.untitled) {
                    this.f.add(activeLanguage);
                    this.g.set(activeLanguage, true);
                    this.h.set(activeLanguage, true);
                    storageService.store($lBb_1.globalOpenedLanguagesStorageKey, JSON.stringify(this.g.toJSON()), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
                    storageService.store($lBb_1.workspaceOpenedLanguagesStorageKey, JSON.stringify(this.h.toJSON()), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
                    this.j = true;
                }
            }));
        }
    };
    exports.$lBb = $lBb;
    exports.$lBb = $lBb = $lBb_1 = __decorate([
        __param(0, environmentService_1.$hJ),
        __param(1, language_1.$ct),
        __param(2, configuration_1.$8h),
        __param(3, diagnostics_1.$gm),
        __param(4, workspace_1.$Kh),
        __param(5, model_1.$yA),
        __param(6, editorService_1.$9C),
        __param(7, telemetry_1.$9k),
        __param(8, storage_1.$Vo),
        __param(9, log_1.$5i),
        __param(10, languageConfigurationRegistry_1.$2t)
    ], $lBb);
    class $mBb {
        constructor(a, b, c, d) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
        }
        async getIndexJsUri() {
            return this.a;
        }
        async getModelJsonUri() {
            return this.b;
        }
        async getWeightsUri() {
            return this.c;
        }
        async sendTelemetryEvent(languages, confidences, timeSpent) {
            this.d.publicLog2('automaticlanguagedetection.stats', {
                languages: languages.join(','),
                confidences: confidences.join(','),
                timeSpent
            });
        }
    }
    exports.$mBb = $mBb;
    class $nBb extends editorWorkerService_1.$02 {
        constructor(modelService, z, C, D, F, G, H, languageConfigurationService) {
            super(modelService, true, 'languageDetectionWorkerService', languageConfigurationService);
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
        }
        I() {
            if (this.y) {
                return this.y;
            }
            this.y = new Promise((resolve, reject) => {
                resolve(this.B(new simpleWorker_1.SimpleWorkerClient(this.g, 'vs/workbench/services/languageDetection/browser/languageDetectionSimpleWorker', new editorWorkerService_1.$92(this))));
            });
            return this.y;
        }
        J(uri) {
            const guess = this.z.guessLanguageIdByFilepathOrFirstLine(uri);
            if (guess && guess !== 'unknown') {
                return guess;
            }
            return undefined;
        }
        async t() {
            return (await this.I()).getProxyObject();
        }
        // foreign host request
        async fhr(method, args) {
            switch (method) {
                case 'getIndexJsUri':
                    return this.getIndexJsUri();
                case 'getModelJsonUri':
                    return this.getModelJsonUri();
                case 'getWeightsUri':
                    return this.getWeightsUri();
                case 'getRegexpModelUri':
                    return this.getRegexpModelUri();
                case 'getLanguageId':
                    return this.getLanguageId(args[0]);
                case 'sendTelemetryEvent':
                    return this.sendTelemetryEvent(args[0], args[1], args[2]);
                default:
                    return super.fhr(method, args);
            }
        }
        async getIndexJsUri() {
            return this.D;
        }
        getLanguageId(languageIdOrExt) {
            if (!languageIdOrExt) {
                return undefined;
            }
            if (this.z.isRegisteredLanguageId(languageIdOrExt)) {
                return languageIdOrExt;
            }
            const guessed = this.J(uri_1.URI.file(`file.${languageIdOrExt}`));
            if (!guessed || guessed === 'unknown') {
                return undefined;
            }
            return guessed;
        }
        async getModelJsonUri() {
            return this.F;
        }
        async getWeightsUri() {
            return this.G;
        }
        async getRegexpModelUri() {
            return this.H;
        }
        async sendTelemetryEvent(languages, confidences, timeSpent) {
            this.C.publicLog2(languageDetectionWorkerService_1.$CA, {
                languages: languages.join(','),
                confidences: confidences.join(','),
                timeSpent
            });
        }
        async detectLanguage(resource, langBiases, preferHistory, supportedLangs) {
            const startTime = Date.now();
            const quickGuess = this.J(resource);
            if (quickGuess) {
                return quickGuess;
            }
            await this.w([resource]);
            const modelId = await (await this.t()).detectLanguage(resource.toString(), langBiases, preferHistory, supportedLangs);
            const languageId = this.getLanguageId(modelId);
            const LanguageDetectionStatsId = 'automaticlanguagedetection.perf';
            this.C.publicLog2(LanguageDetectionStatsId, {
                timeSpent: Date.now() - startTime,
                detection: languageId || 'unknown',
            });
            return languageId;
        }
    }
    exports.$nBb = $nBb;
    // For now we use Eager until we handle keeping track of history better.
    (0, extensions_1.$mr)(languageDetectionWorkerService_1.$zA, $lBb, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=languageDetectionWorkerServiceImpl.js.map