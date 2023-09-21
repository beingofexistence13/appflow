/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/config/editorOptions", "vs/editor/common/services/editorBaseApi", "vs/editor/standalone/browser/standaloneEditor", "vs/editor/standalone/browser/standaloneLanguages", "vs/editor/contrib/format/browser/format"], function (require, exports, editorOptions_1, editorBaseApi_1, standaloneEditor_1, standaloneLanguages_1, format_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$m0b = exports.$l0b = exports.$k0b = exports.Uri = exports.$i0b = exports.$h0b = exports.$g0b = exports.$f0b = exports.$e0b = exports.$d0b = exports.$c0b = exports.$b0b = exports.$a0b = exports.$_9b = void 0;
    // Set defaults for standalone editor
    editorOptions_1.EditorOptions.wrappingIndent.defaultValue = 0 /* WrappingIndent.None */;
    editorOptions_1.EditorOptions.glyphMargin.defaultValue = false;
    editorOptions_1.EditorOptions.autoIndent.defaultValue = 3 /* EditorAutoIndentStrategy.Advanced */;
    editorOptions_1.EditorOptions.overviewRulerLanes.defaultValue = 2;
    // We need to register a formatter selector which simply picks the first available formatter.
    // See https://github.com/microsoft/monaco-editor/issues/2327
    format_1.$E8.setFormatterSelector((formatter, document, mode) => Promise.resolve(formatter[0]));
    const api = (0, editorBaseApi_1.$DY)();
    api.editor = (0, standaloneEditor_1.createMonacoEditorAPI)();
    api.languages = (0, standaloneLanguages_1.createMonacoLanguagesAPI)();
    exports.$_9b = api.CancellationTokenSource;
    exports.$a0b = api.Emitter;
    exports.$b0b = api.KeyCode;
    exports.$c0b = api.KeyMod;
    exports.$d0b = api.Position;
    exports.$e0b = api.Range;
    exports.$f0b = api.Selection;
    exports.$g0b = api.SelectionDirection;
    exports.$h0b = api.MarkerSeverity;
    exports.$i0b = api.MarkerTag;
    exports.Uri = api.Uri;
    exports.$k0b = api.Token;
    exports.$l0b = api.editor;
    exports.$m0b = api.languages;
    const monacoEnvironment = globalThis.MonacoEnvironment;
    if (monacoEnvironment?.globalAPI || (typeof define === 'function' && define.amd)) {
        globalThis.monaco = api;
    }
    if (typeof globalThis.require !== 'undefined' && typeof globalThis.require.config === 'function') {
        globalThis.require.config({
            ignoreDuplicateModules: [
                'vscode-languageserver-types',
                'vscode-languageserver-types/main',
                'vscode-languageserver-textdocument',
                'vscode-languageserver-textdocument/main',
                'vscode-nls',
                'vscode-nls/vscode-nls',
                'jsonc-parser',
                'jsonc-parser/main',
                'vscode-uri',
                'vscode-uri/index',
                'vs/basic-languages/typescript/typescript'
            ]
        });
    }
});
//# sourceMappingURL=editor.api.js.map