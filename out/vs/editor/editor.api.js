/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/config/editorOptions", "vs/editor/common/services/editorBaseApi", "vs/editor/standalone/browser/standaloneEditor", "vs/editor/standalone/browser/standaloneLanguages", "vs/editor/contrib/format/browser/format"], function (require, exports, editorOptions_1, editorBaseApi_1, standaloneEditor_1, standaloneLanguages_1, format_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.languages = exports.editor = exports.Token = exports.Uri = exports.MarkerTag = exports.MarkerSeverity = exports.SelectionDirection = exports.Selection = exports.Range = exports.Position = exports.KeyMod = exports.KeyCode = exports.Emitter = exports.CancellationTokenSource = void 0;
    // Set defaults for standalone editor
    editorOptions_1.EditorOptions.wrappingIndent.defaultValue = 0 /* WrappingIndent.None */;
    editorOptions_1.EditorOptions.glyphMargin.defaultValue = false;
    editorOptions_1.EditorOptions.autoIndent.defaultValue = 3 /* EditorAutoIndentStrategy.Advanced */;
    editorOptions_1.EditorOptions.overviewRulerLanes.defaultValue = 2;
    // We need to register a formatter selector which simply picks the first available formatter.
    // See https://github.com/microsoft/monaco-editor/issues/2327
    format_1.FormattingConflicts.setFormatterSelector((formatter, document, mode) => Promise.resolve(formatter[0]));
    const api = (0, editorBaseApi_1.createMonacoBaseAPI)();
    api.editor = (0, standaloneEditor_1.createMonacoEditorAPI)();
    api.languages = (0, standaloneLanguages_1.createMonacoLanguagesAPI)();
    exports.CancellationTokenSource = api.CancellationTokenSource;
    exports.Emitter = api.Emitter;
    exports.KeyCode = api.KeyCode;
    exports.KeyMod = api.KeyMod;
    exports.Position = api.Position;
    exports.Range = api.Range;
    exports.Selection = api.Selection;
    exports.SelectionDirection = api.SelectionDirection;
    exports.MarkerSeverity = api.MarkerSeverity;
    exports.MarkerTag = api.MarkerTag;
    exports.Uri = api.Uri;
    exports.Token = api.Token;
    exports.editor = api.editor;
    exports.languages = api.languages;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yLmFwaS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9lZGl0b3IuYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVFoRyxxQ0FBcUM7SUFDckMsNkJBQWEsQ0FBQyxjQUFjLENBQUMsWUFBWSw4QkFBc0IsQ0FBQztJQUNoRSw2QkFBYSxDQUFDLFdBQVcsQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO0lBQy9DLDZCQUFhLENBQUMsVUFBVSxDQUFDLFlBQVksNENBQW9DLENBQUM7SUFDMUUsNkJBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDO0lBRWxELDZGQUE2RjtJQUM3Riw2REFBNkQ7SUFDN0QsNEJBQW1CLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRXZHLE1BQU0sR0FBRyxHQUFHLElBQUEsbUNBQW1CLEdBQUUsQ0FBQztJQUNsQyxHQUFHLENBQUMsTUFBTSxHQUFHLElBQUEsd0NBQXFCLEdBQUUsQ0FBQztJQUNyQyxHQUFHLENBQUMsU0FBUyxHQUFHLElBQUEsOENBQXdCLEdBQUUsQ0FBQztJQUM5QixRQUFBLHVCQUF1QixHQUFHLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQztJQUN0RCxRQUFBLE9BQU8sR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDO0lBQ3RCLFFBQUEsT0FBTyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUM7SUFDdEIsUUFBQSxNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQztJQUNwQixRQUFBLFFBQVEsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDO0lBQ3hCLFFBQUEsS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUM7SUFDbEIsUUFBQSxTQUFTLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQztJQUMxQixRQUFBLGtCQUFrQixHQUFHLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQztJQUM1QyxRQUFBLGNBQWMsR0FBRyxHQUFHLENBQUMsY0FBYyxDQUFDO0lBQ3BDLFFBQUEsU0FBUyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUM7SUFDMUIsUUFBQSxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQztJQUNkLFFBQUEsS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUM7SUFDbEIsUUFBQSxNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQztJQUNwQixRQUFBLFNBQVMsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDO0lBS3ZDLE1BQU0saUJBQWlCLEdBQW9DLFVBQWtCLENBQUMsaUJBQWlCLENBQUM7SUFDaEcsSUFBSSxpQkFBaUIsRUFBRSxTQUFTLElBQUksQ0FBQyxPQUFPLE1BQU0sS0FBSyxVQUFVLElBQVUsTUFBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQ3hGLFVBQVUsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO0tBQ3hCO0lBRUQsSUFBSSxPQUFPLFVBQVUsQ0FBQyxPQUFPLEtBQUssV0FBVyxJQUFJLE9BQU8sVUFBVSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEtBQUssVUFBVSxFQUFFO1FBQ2pHLFVBQVUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO1lBQ3pCLHNCQUFzQixFQUFFO2dCQUN2Qiw2QkFBNkI7Z0JBQzdCLGtDQUFrQztnQkFDbEMsb0NBQW9DO2dCQUNwQyx5Q0FBeUM7Z0JBQ3pDLFlBQVk7Z0JBQ1osdUJBQXVCO2dCQUN2QixjQUFjO2dCQUNkLG1CQUFtQjtnQkFDbkIsWUFBWTtnQkFDWixrQkFBa0I7Z0JBQ2xCLDBDQUEwQzthQUMxQztTQUNELENBQUMsQ0FBQztLQUNIIn0=