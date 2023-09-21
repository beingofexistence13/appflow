/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$kZ = void 0;
    exports.$kZ = {
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
//# sourceMappingURL=diffEditor.js.map