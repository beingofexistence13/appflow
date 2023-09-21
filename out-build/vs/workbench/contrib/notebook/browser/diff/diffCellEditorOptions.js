/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$xEb = exports.$wEb = exports.$vEb = void 0;
    exports.$vEb = {
        top: 12,
        bottom: 12
    };
    exports.$wEb = {
        padding: exports.$vEb,
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
    exports.$xEb = {
        ...exports.$wEb,
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
//# sourceMappingURL=diffCellEditorOptions.js.map