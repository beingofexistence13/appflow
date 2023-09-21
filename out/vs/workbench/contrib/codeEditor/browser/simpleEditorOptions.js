/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/contrib/contextmenu/browser/contextmenu", "vs/editor/contrib/snippet/browser/snippetController2", "vs/editor/contrib/suggest/browser/suggestController", "vs/workbench/contrib/codeEditor/browser/menuPreventer", "vs/workbench/contrib/codeEditor/browser/selectionClipboard", "vs/workbench/contrib/snippets/browser/tabCompletion", "vs/editor/browser/editorExtensions"], function (require, exports, contextmenu_1, snippetController2_1, suggestController_1, menuPreventer_1, selectionClipboard_1, tabCompletion_1, editorExtensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getSimpleCodeEditorWidgetOptions = exports.getSimpleEditorOptions = void 0;
    function getSimpleEditorOptions(configurationService) {
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
    exports.getSimpleEditorOptions = getSimpleEditorOptions;
    function getSimpleCodeEditorWidgetOptions() {
        return {
            isSimpleWidget: true,
            contributions: editorExtensions_1.EditorExtensionsRegistry.getSomeEditorContributions([
                menuPreventer_1.MenuPreventer.ID,
                selectionClipboard_1.SelectionClipboardContributionID,
                contextmenu_1.ContextMenuController.ID,
                suggestController_1.SuggestController.ID,
                snippetController2_1.SnippetController2.ID,
                tabCompletion_1.TabCompletionController.ID,
            ])
        };
    }
    exports.getSimpleCodeEditorWidgetOptions = getSimpleCodeEditorWidgetOptions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ltcGxlRWRpdG9yT3B0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NvZGVFZGl0b3IvYnJvd3Nlci9zaW1wbGVFZGl0b3JPcHRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWFoRyxTQUFnQixzQkFBc0IsQ0FBQyxvQkFBMkM7UUFDakYsT0FBTztZQUNOLFFBQVEsRUFBRSxJQUFJO1lBQ2Qsa0JBQWtCLEVBQUUsQ0FBQztZQUNyQixXQUFXLEVBQUUsS0FBSztZQUNsQixXQUFXLEVBQUUsS0FBSztZQUNsQixPQUFPLEVBQUUsS0FBSztZQUNkLG1CQUFtQixFQUFFLEtBQUs7WUFDMUIseUJBQXlCLEVBQUUsSUFBSTtZQUMvQixrQkFBa0IsRUFBRSxLQUFLO1lBQ3pCLFNBQVMsRUFBRTtnQkFDVixVQUFVLEVBQUUsUUFBUTthQUNwQjtZQUNELG9CQUFvQixFQUFFLENBQUM7WUFDdkIsbUJBQW1CLEVBQUUsS0FBSztZQUMxQixvQkFBb0IsRUFBRSxLQUFLO1lBQzNCLG1CQUFtQixFQUFFLE1BQU07WUFDM0Isb0JBQW9CLEVBQUUsSUFBSTtZQUMxQix1QkFBdUIsRUFBRSxPQUFPO1lBQ2hDLFdBQVcsRUFBRSxLQUFLO1lBQ2xCLDRCQUE0QixFQUFFLENBQUM7WUFDL0IsT0FBTyxFQUFFO2dCQUNSLE9BQU8sRUFBRSxLQUFLO2FBQ2Q7WUFDRCxNQUFNLEVBQUU7Z0JBQ1AsV0FBVyxFQUFFLEtBQUs7YUFDbEI7WUFDRCxvQkFBb0IsRUFBRSxvQkFBb0IsQ0FBQyxRQUFRLENBQXdCLDZCQUE2QixDQUFDO1lBQ3pHLGNBQWMsRUFBRSxvQkFBb0IsQ0FBQyxRQUFRLENBQW9ELHVCQUF1QixDQUFDO1NBQ3pILENBQUM7SUFDSCxDQUFDO0lBOUJELHdEQThCQztJQUVELFNBQWdCLGdDQUFnQztRQUMvQyxPQUFPO1lBQ04sY0FBYyxFQUFFLElBQUk7WUFDcEIsYUFBYSxFQUFFLDJDQUF3QixDQUFDLDBCQUEwQixDQUFDO2dCQUNsRSw2QkFBYSxDQUFDLEVBQUU7Z0JBQ2hCLHFEQUFnQztnQkFDaEMsbUNBQXFCLENBQUMsRUFBRTtnQkFDeEIscUNBQWlCLENBQUMsRUFBRTtnQkFDcEIsdUNBQWtCLENBQUMsRUFBRTtnQkFDckIsdUNBQXVCLENBQUMsRUFBRTthQUMxQixDQUFDO1NBQ0YsQ0FBQztJQUNILENBQUM7SUFaRCw0RUFZQyJ9