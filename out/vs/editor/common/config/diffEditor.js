/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.diffEditorDefaultOptions = void 0;
    exports.diffEditorDefaultOptions = {
        enableSplitViewResizing: true,
        splitViewDefaultRatio: 0.5,
        renderSideBySide: true,
        renderMarginRevertIcon: true,
        maxComputationTime: 5000,
        maxFileSize: 50,
        ignoreTrimWhitespace: true,
        renderIndicators: true,
        originalEditable: false,
        diffCodeLens: false,
        renderOverviewRuler: true,
        diffWordWrap: 'inherit',
        diffAlgorithm: 'advanced',
        accessibilityVerbose: false,
        experimental: {
            showMoves: false,
            showEmptyDecorations: true,
        },
        hideUnchangedRegions: {
            enabled: false,
            contextLineCount: 3,
            minimumLineCount: 3,
            revealLineCount: 20,
        },
        isInEmbeddedEditor: false,
        onlyShowAccessibleDiffViewer: false,
        renderSideBySideInlineBreakpoint: 900,
        useInlineViewWhenSpaceIsLimited: true,
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlmZkVkaXRvci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vY29uZmlnL2RpZmZFZGl0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBSW5GLFFBQUEsd0JBQXdCLEdBQUc7UUFDdkMsdUJBQXVCLEVBQUUsSUFBSTtRQUM3QixxQkFBcUIsRUFBRSxHQUFHO1FBQzFCLGdCQUFnQixFQUFFLElBQUk7UUFDdEIsc0JBQXNCLEVBQUUsSUFBSTtRQUM1QixrQkFBa0IsRUFBRSxJQUFJO1FBQ3hCLFdBQVcsRUFBRSxFQUFFO1FBQ2Ysb0JBQW9CLEVBQUUsSUFBSTtRQUMxQixnQkFBZ0IsRUFBRSxJQUFJO1FBQ3RCLGdCQUFnQixFQUFFLEtBQUs7UUFDdkIsWUFBWSxFQUFFLEtBQUs7UUFDbkIsbUJBQW1CLEVBQUUsSUFBSTtRQUN6QixZQUFZLEVBQUUsU0FBUztRQUN2QixhQUFhLEVBQUUsVUFBVTtRQUN6QixvQkFBb0IsRUFBRSxLQUFLO1FBQzNCLFlBQVksRUFBRTtZQUNiLFNBQVMsRUFBRSxLQUFLO1lBQ2hCLG9CQUFvQixFQUFFLElBQUk7U0FDMUI7UUFDRCxvQkFBb0IsRUFBRTtZQUNyQixPQUFPLEVBQUUsS0FBSztZQUNkLGdCQUFnQixFQUFFLENBQUM7WUFDbkIsZ0JBQWdCLEVBQUUsQ0FBQztZQUNuQixlQUFlLEVBQUUsRUFBRTtTQUNuQjtRQUNELGtCQUFrQixFQUFFLEtBQUs7UUFDekIsNEJBQTRCLEVBQUUsS0FBSztRQUNuQyxnQ0FBZ0MsRUFBRSxHQUFHO1FBQ3JDLCtCQUErQixFQUFFLElBQUk7S0FDQSxDQUFDIn0=