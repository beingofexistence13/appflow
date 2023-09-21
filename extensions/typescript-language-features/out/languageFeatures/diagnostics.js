"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosticsManager = void 0;
const vscode = __importStar(require("vscode"));
const arrays = __importStar(require("../utils/arrays"));
const dispose_1 = require("../utils/dispose");
const resourceMap_1 = require("../utils/resourceMap");
const objects_1 = require("../utils/objects");
function diagnosticsEquals(a, b) {
    if (a === b) {
        return true;
    }
    return a.code === b.code
        && a.message === b.message
        && a.severity === b.severity
        && a.source === b.source
        && a.range.isEqual(b.range)
        && arrays.equals(a.relatedInformation || arrays.empty, b.relatedInformation || arrays.empty, (a, b) => {
            return a.message === b.message
                && a.location.range.isEqual(b.location.range)
                && a.location.uri.fsPath === b.location.uri.fsPath;
        })
        && arrays.equals(a.tags || arrays.empty, b.tags || arrays.empty);
}
class FileDiagnostics {
    constructor(file, language) {
        this.file = file;
        this.language = language;
        this._diagnostics = new Map();
    }
    updateDiagnostics(language, kind, diagnostics) {
        if (language !== this.language) {
            this._diagnostics.clear();
            this.language = language;
        }
        const existing = this._diagnostics.get(kind);
        if (existing?.length === 0 && diagnostics.length === 0) {
            // No need to update
            return false;
        }
        this._diagnostics.set(kind, diagnostics);
        return true;
    }
    getAllDiagnostics(settings) {
        if (!settings.getValidate(this.language)) {
            return [];
        }
        return [
            ...this.get(0 /* DiagnosticKind.Syntax */),
            ...this.get(1 /* DiagnosticKind.Semantic */),
            ...this.getSuggestionDiagnostics(settings),
        ];
    }
    delete(toDelete) {
        for (const [type, diags] of this._diagnostics) {
            this._diagnostics.set(type, diags.filter(diag => !diagnosticsEquals(diag, toDelete)));
        }
    }
    getSuggestionDiagnostics(settings) {
        const enableSuggestions = settings.getEnableSuggestions(this.language);
        return this.get(2 /* DiagnosticKind.Suggestion */).filter(x => {
            if (!enableSuggestions) {
                // Still show unused
                return x.tags && (x.tags.includes(vscode.DiagnosticTag.Unnecessary) || x.tags.includes(vscode.DiagnosticTag.Deprecated));
            }
            return true;
        });
    }
    get(kind) {
        return this._diagnostics.get(kind) || [];
    }
}
function areLanguageDiagnosticSettingsEqual(currentSettings, newSettings) {
    return currentSettings.validate === newSettings.validate
        && currentSettings.enableSuggestions === newSettings.enableSuggestions;
}
class DiagnosticSettings {
    constructor() {
        this._languageSettings = new Map();
    }
    getValidate(language) {
        return this.get(language).validate;
    }
    setValidate(language, value) {
        return this.update(language, settings => ({
            validate: value,
            enableSuggestions: settings.enableSuggestions,
        }));
    }
    getEnableSuggestions(language) {
        return this.get(language).enableSuggestions;
    }
    setEnableSuggestions(language, value) {
        return this.update(language, settings => ({
            validate: settings.validate,
            enableSuggestions: value
        }));
    }
    get(language) {
        return this._languageSettings.get(language) || DiagnosticSettings.defaultSettings;
    }
    update(language, f) {
        const currentSettings = this.get(language);
        const newSettings = f(currentSettings);
        this._languageSettings.set(language, newSettings);
        return !areLanguageDiagnosticSettingsEqual(currentSettings, newSettings);
    }
}
DiagnosticSettings.defaultSettings = {
    validate: true,
    enableSuggestions: true
};
class DiagnosticsTelemetryManager extends dispose_1.Disposable {
    constructor(_telemetryReporter, _diagnosticsCollection) {
        super();
        this._telemetryReporter = _telemetryReporter;
        this._diagnosticsCollection = _diagnosticsCollection;
        this._diagnosticCodesMap = new Map();
        this._diagnosticSnapshotsMap = new resourceMap_1.ResourceMap(uri => uri.toString(), { onCaseInsensitiveFileSystem: false });
        this._register(vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document.languageId === 'typescript' || e.document.languageId === 'typescriptreact') {
                this._updateAllDiagnosticCodesAfterTimeout();
            }
        }));
        this._updateAllDiagnosticCodesAfterTimeout();
        this._registerTelemetryEventEmitter();
    }
    _updateAllDiagnosticCodesAfterTimeout() {
        clearTimeout(this._timeout);
        this._timeout = setTimeout(() => this._updateDiagnosticCodes(), 5000);
    }
    _increaseDiagnosticCodeCount(code) {
        if (code === undefined) {
            return;
        }
        this._diagnosticCodesMap.set(Number(code), (this._diagnosticCodesMap.get(Number(code)) || 0) + 1);
    }
    _updateDiagnosticCodes() {
        this._diagnosticsCollection.forEach((uri, diagnostics) => {
            const previousDiagnostics = this._diagnosticSnapshotsMap.get(uri);
            this._diagnosticSnapshotsMap.set(uri, diagnostics);
            const diagnosticsDiff = diagnostics.filter((diagnostic) => !previousDiagnostics?.some((previousDiagnostic) => (0, objects_1.equals)(diagnostic, previousDiagnostic)));
            diagnosticsDiff.forEach((diagnostic) => {
                const code = diagnostic.code;
                this._increaseDiagnosticCodeCount(typeof code === 'string' || typeof code === 'number' ? code : code?.value);
            });
        });
    }
    _registerTelemetryEventEmitter() {
        this._telemetryEmitter = setInterval(() => {
            if (this._diagnosticCodesMap.size > 0) {
                let diagnosticCodes = '';
                this._diagnosticCodesMap.forEach((value, key) => {
                    diagnosticCodes += `${key}:${value},`;
                });
                this._diagnosticCodesMap.clear();
                /* __GDPR__
                    "typescript.diagnostics" : {
                        "owner": "aiday-mar",
                        "diagnosticCodes" : { "classification": "PublicNonPersonalData", "purpose": "FeatureInsight" },
                        "${include}": [
                            "${TypeScriptCommonProperties}"
                        ]
                    }
                */
                this._telemetryReporter.logTelemetry('typescript.diagnostics', {
                    diagnosticCodes: diagnosticCodes
                });
            }
        }, 5 * 60 * 1000); // 5 minutes
    }
    dispose() {
        super.dispose();
        clearTimeout(this._timeout);
        clearInterval(this._telemetryEmitter);
    }
}
class DiagnosticsManager extends dispose_1.Disposable {
    constructor(owner, configuration, telemetryReporter, onCaseInsensitiveFileSystem) {
        super();
        this._settings = new DiagnosticSettings();
        this._updateDelay = 50;
        this._diagnostics = new resourceMap_1.ResourceMap(undefined, { onCaseInsensitiveFileSystem });
        this._pendingUpdates = new resourceMap_1.ResourceMap(undefined, { onCaseInsensitiveFileSystem });
        this._currentDiagnostics = this._register(vscode.languages.createDiagnosticCollection(owner));
        // Here we are selecting only 1 user out of 1000 to send telemetry diagnostics
        if (Math.random() * 1000 <= 1 || configuration.enableDiagnosticsTelemetry) {
            this._register(new DiagnosticsTelemetryManager(telemetryReporter, this._currentDiagnostics));
        }
    }
    dispose() {
        super.dispose();
        for (const value of this._pendingUpdates.values()) {
            clearTimeout(value);
        }
        this._pendingUpdates.clear();
    }
    reInitialize() {
        this._currentDiagnostics.clear();
        this._diagnostics.clear();
    }
    setValidate(language, value) {
        const didUpdate = this._settings.setValidate(language, value);
        if (didUpdate) {
            this.rebuildAll();
        }
    }
    setEnableSuggestions(language, value) {
        const didUpdate = this._settings.setEnableSuggestions(language, value);
        if (didUpdate) {
            this.rebuildAll();
        }
    }
    updateDiagnostics(file, language, kind, diagnostics) {
        let didUpdate = false;
        const entry = this._diagnostics.get(file);
        if (entry) {
            didUpdate = entry.updateDiagnostics(language, kind, diagnostics);
        }
        else if (diagnostics.length) {
            const fileDiagnostics = new FileDiagnostics(file, language);
            fileDiagnostics.updateDiagnostics(language, kind, diagnostics);
            this._diagnostics.set(file, fileDiagnostics);
            didUpdate = true;
        }
        if (didUpdate) {
            this.scheduleDiagnosticsUpdate(file);
        }
    }
    configFileDiagnosticsReceived(file, diagnostics) {
        this._currentDiagnostics.set(file, diagnostics);
    }
    deleteAllDiagnosticsInFile(resource) {
        this._currentDiagnostics.delete(resource);
        this._diagnostics.delete(resource);
    }
    deleteDiagnostic(resource, diagnostic) {
        const fileDiagnostics = this._diagnostics.get(resource);
        if (fileDiagnostics) {
            fileDiagnostics.delete(diagnostic);
            this.rebuildFile(fileDiagnostics);
        }
    }
    getDiagnostics(file) {
        return this._currentDiagnostics.get(file) || [];
    }
    scheduleDiagnosticsUpdate(file) {
        if (!this._pendingUpdates.has(file)) {
            this._pendingUpdates.set(file, setTimeout(() => this.updateCurrentDiagnostics(file), this._updateDelay));
        }
    }
    updateCurrentDiagnostics(file) {
        if (this._pendingUpdates.has(file)) {
            clearTimeout(this._pendingUpdates.get(file));
            this._pendingUpdates.delete(file);
        }
        const fileDiagnostics = this._diagnostics.get(file);
        this._currentDiagnostics.set(file, fileDiagnostics ? fileDiagnostics.getAllDiagnostics(this._settings) : []);
    }
    rebuildAll() {
        this._currentDiagnostics.clear();
        for (const fileDiagnostic of this._diagnostics.values()) {
            this.rebuildFile(fileDiagnostic);
        }
    }
    rebuildFile(fileDiagnostic) {
        this._currentDiagnostics.set(fileDiagnostic.file, fileDiagnostic.getAllDiagnostics(this._settings));
    }
}
exports.DiagnosticsManager = DiagnosticsManager;
//# sourceMappingURL=diagnostics.js.map