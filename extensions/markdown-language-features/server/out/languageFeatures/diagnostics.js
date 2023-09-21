"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerValidateSupport = void 0;
const md = require("vscode-markdown-languageservice");
const vscode_uri_1 = require("vscode-uri");
const dispose_1 = require("../util/dispose");
const defaultDiagnosticOptions = {
    validateFileLinks: md.DiagnosticLevel.ignore,
    validateReferences: md.DiagnosticLevel.ignore,
    validateFragmentLinks: md.DiagnosticLevel.ignore,
    validateMarkdownFileLinkFragments: md.DiagnosticLevel.ignore,
    validateUnusedLinkDefinitions: md.DiagnosticLevel.ignore,
    validateDuplicateLinkDefinitions: md.DiagnosticLevel.ignore,
    ignoreLinks: [],
};
function convertDiagnosticLevel(enabled) {
    switch (enabled) {
        case 'error': return md.DiagnosticLevel.error;
        case 'warning': return md.DiagnosticLevel.warning;
        case 'ignore': return md.DiagnosticLevel.ignore;
        case 'hint': return md.DiagnosticLevel.hint;
        default: return md.DiagnosticLevel.ignore;
    }
}
function getDiagnosticsOptions(config) {
    const settings = config.getSettings();
    if (!settings) {
        return defaultDiagnosticOptions;
    }
    const validateFragmentLinks = convertDiagnosticLevel(settings.markdown.validate.fragmentLinks.enabled);
    return {
        validateFileLinks: convertDiagnosticLevel(settings.markdown.validate.fileLinks.enabled),
        validateReferences: convertDiagnosticLevel(settings.markdown.validate.referenceLinks.enabled),
        validateFragmentLinks: convertDiagnosticLevel(settings.markdown.validate.fragmentLinks.enabled),
        validateMarkdownFileLinkFragments: settings.markdown.validate.fileLinks.markdownFragmentLinks === 'inherit' ? validateFragmentLinks : convertDiagnosticLevel(settings.markdown.validate.fileLinks.markdownFragmentLinks),
        validateUnusedLinkDefinitions: convertDiagnosticLevel(settings.markdown.validate.unusedLinkDefinitions.enabled),
        validateDuplicateLinkDefinitions: convertDiagnosticLevel(settings.markdown.validate.duplicateLinkDefinitions.enabled),
        ignoreLinks: settings.markdown.validate.ignoredLinks,
    };
}
function registerValidateSupport(connection, workspace, documents, ls, config, logger) {
    let diagnosticOptions = defaultDiagnosticOptions;
    function updateDiagnosticsSetting() {
        diagnosticOptions = getDiagnosticsOptions(config);
    }
    const subs = [];
    const manager = ls.createPullDiagnosticsManager();
    subs.push(manager);
    subs.push(manager.onLinkedToFileChanged(() => {
        // TODO: We only need to refresh certain files
        connection.languages.diagnostics.refresh();
    }));
    const emptyDiagnosticsResponse = Object.freeze({ kind: 'full', items: [] });
    connection.languages.diagnostics.on(async (params, token) => {
        logger.log(md.LogLevel.Debug, 'connection.languages.diagnostics.on', { document: params.textDocument.uri });
        if (!config.getSettings()?.markdown.validate.enabled) {
            return emptyDiagnosticsResponse;
        }
        const uri = vscode_uri_1.URI.parse(params.textDocument.uri);
        if (!workspace.hasMarkdownDocument(uri)) {
            return emptyDiagnosticsResponse;
        }
        const document = await workspace.openMarkdownDocument(uri);
        if (!document) {
            return emptyDiagnosticsResponse;
        }
        const diagnostics = await manager.computeDiagnostics(document, diagnosticOptions, token);
        return {
            kind: 'full',
            items: diagnostics,
        };
    });
    updateDiagnosticsSetting();
    subs.push(config.onDidChangeConfiguration(() => {
        updateDiagnosticsSetting();
        connection.languages.diagnostics.refresh();
    }));
    subs.push(documents.onDidClose(e => {
        manager.disposeDocumentResources(vscode_uri_1.URI.parse(e.document.uri));
    }));
    return {
        dispose: () => {
            (0, dispose_1.disposeAll)(subs);
        }
    };
}
exports.registerValidateSupport = registerValidateSupport;
//# sourceMappingURL=diagnostics.js.map