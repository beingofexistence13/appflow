/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/contrib/contextmenu/browser/contextmenu", "vs/editor/contrib/snippet/browser/snippetController2", "vs/editor/contrib/suggest/browser/suggestController", "vs/workbench/contrib/codeEditor/browser/menuPreventer", "vs/workbench/contrib/codeEditor/browser/selectionClipboard", "vs/workbench/contrib/snippets/browser/tabCompletion", "vs/editor/browser/editorExtensions"], function (require, exports, contextmenu_1, snippetController2_1, suggestController_1, menuPreventer_1, selectionClipboard_1, tabCompletion_1, editorExtensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$vqb = exports.$uqb = void 0;
    function $uqb(configurationService) {
        return {
            wordWrap: 'on',
            overviewRulerLanes: 0,
            glyphMargin: false,
            lineNumbers: 'off',
            folding: false,
            selectOnLineNumbers: false,
            hideCursorInOverviewRuler: true,
            selectionHighlight: false,
            scrollbar: {
                horizontal: 'hidden'
            },
            lineDecorationsWidth: 0,
            overviewRulerBorder: false,
            scrollBeyondLastLine: false,
            renderLineHighlight: 'none',
            fixedOverflowWidgets: true,
            acceptSuggestionOnEnter: 'smart',
            dragAndDrop: false,
            revealHorizontalRightPadding: 5,
            minimap: {
                enabled: false
            },
            guides: {
                indentation: false
            },
            accessibilitySupport: configurationService.getValue('editor.accessibilitySupport'),
            cursorBlinking: configurationService.getValue('editor.cursorBlinking')
        };
    }
    exports.$uqb = $uqb;
    function $vqb() {
        return {
            isSimpleWidget: true,
            contributions: editorExtensions_1.EditorExtensionsRegistry.getSomeEditorContributions([
                menuPreventer_1.$0lb.ID,
                selectionClipboard_1.$tqb,
                contextmenu_1.$X6.ID,
                suggestController_1.$G6.ID,
                snippetController2_1.$05.ID,
                tabCompletion_1.$qmb.ID,
            ])
        };
    }
    exports.$vqb = $vqb;
});
//# sourceMappingURL=simpleEditorOptions.js.map