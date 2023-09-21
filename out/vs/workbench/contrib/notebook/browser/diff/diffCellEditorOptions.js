/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.fixedDiffEditorOptions = exports.fixedEditorOptions = exports.fixedEditorPadding = void 0;
    exports.fixedEditorPadding = {
        top: 12,
        bottom: 12
    };
    exports.fixedEditorOptions = {
        padding: exports.fixedEditorPadding,
        scrollBeyondLastLine: false,
        scrollbar: {
            verticalScrollbarSize: 14,
            horizontal: 'auto',
            vertical: 'auto',
            useShadows: true,
            verticalHasArrows: false,
            horizontalHasArrows: false,
            alwaysConsumeMouseWheel: false,
        },
        renderLineHighlightOnlyWhenFocus: true,
        overviewRulerLanes: 0,
        overviewRulerBorder: false,
        selectOnLineNumbers: false,
        wordWrap: 'off',
        lineNumbers: 'off',
        lineDecorationsWidth: 0,
        glyphMargin: false,
        fixedOverflowWidgets: true,
        minimap: { enabled: false },
        renderValidationDecorations: 'on',
        renderLineHighlight: 'none',
        readOnly: true
    };
    exports.fixedDiffEditorOptions = {
        ...exports.fixedEditorOptions,
        glyphMargin: true,
        enableSplitViewResizing: false,
        renderIndicators: true,
        renderMarginRevertIcon: false,
        readOnly: false,
        isInEmbeddedEditor: true,
        renderOverviewRuler: false,
        wordWrap: 'off',
        diffWordWrap: 'off',
        diffAlgorithm: 'advanced',
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlmZkNlbGxFZGl0b3JPcHRpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci9kaWZmL2RpZmZDZWxsRWRpdG9yT3B0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFLbkYsUUFBQSxrQkFBa0IsR0FBRztRQUNqQyxHQUFHLEVBQUUsRUFBRTtRQUNQLE1BQU0sRUFBRSxFQUFFO0tBQ1YsQ0FBQztJQUVXLFFBQUEsa0JBQWtCLEdBQW1CO1FBQ2pELE9BQU8sRUFBRSwwQkFBa0I7UUFDM0Isb0JBQW9CLEVBQUUsS0FBSztRQUMzQixTQUFTLEVBQUU7WUFDVixxQkFBcUIsRUFBRSxFQUFFO1lBQ3pCLFVBQVUsRUFBRSxNQUFNO1lBQ2xCLFFBQVEsRUFBRSxNQUFNO1lBQ2hCLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLGlCQUFpQixFQUFFLEtBQUs7WUFDeEIsbUJBQW1CLEVBQUUsS0FBSztZQUMxQix1QkFBdUIsRUFBRSxLQUFLO1NBQzlCO1FBQ0QsZ0NBQWdDLEVBQUUsSUFBSTtRQUN0QyxrQkFBa0IsRUFBRSxDQUFDO1FBQ3JCLG1CQUFtQixFQUFFLEtBQUs7UUFDMUIsbUJBQW1CLEVBQUUsS0FBSztRQUMxQixRQUFRLEVBQUUsS0FBSztRQUNmLFdBQVcsRUFBRSxLQUFLO1FBQ2xCLG9CQUFvQixFQUFFLENBQUM7UUFDdkIsV0FBVyxFQUFFLEtBQUs7UUFDbEIsb0JBQW9CLEVBQUUsSUFBSTtRQUMxQixPQUFPLEVBQUUsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFO1FBQzNCLDJCQUEyQixFQUFFLElBQUk7UUFDakMsbUJBQW1CLEVBQUUsTUFBTTtRQUMzQixRQUFRLEVBQUUsSUFBSTtLQUNkLENBQUM7SUFFVyxRQUFBLHNCQUFzQixHQUFtQztRQUNyRSxHQUFHLDBCQUFrQjtRQUNyQixXQUFXLEVBQUUsSUFBSTtRQUNqQix1QkFBdUIsRUFBRSxLQUFLO1FBQzlCLGdCQUFnQixFQUFFLElBQUk7UUFDdEIsc0JBQXNCLEVBQUUsS0FBSztRQUM3QixRQUFRLEVBQUUsS0FBSztRQUNmLGtCQUFrQixFQUFFLElBQUk7UUFDeEIsbUJBQW1CLEVBQUUsS0FBSztRQUMxQixRQUFRLEVBQUUsS0FBSztRQUNmLFlBQVksRUFBRSxLQUFLO1FBQ25CLGFBQWEsRUFBRSxVQUFVO0tBQ3pCLENBQUMifQ==