/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookEditorInput", "vs/workbench/contrib/notebook/common/notebookRange"], function (require, exports, notebookCommon_1, notebookEditorInput_1, notebookRange_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CellFoldingState = exports.$2bb = exports.$1bb = exports.$Zbb = exports.CursorAtLineBoundary = exports.CursorAtBoundary = exports.CellFocusMode = exports.CellEditState = exports.CellRevealType = exports.CellRevealRangeType = exports.CellRevealSyncType = exports.NotebookOverviewRulerLane = exports.CellLayoutContext = exports.CellLayoutState = exports.ScrollToRevealBehavior = exports.RenderOutputType = exports.$Ybb = exports.$Xbb = exports.$Wbb = exports.$Vbb = exports.$Ubb = exports.$Tbb = exports.$Sbb = exports.$Rbb = exports.$Qbb = exports.$Pbb = void 0;
    //#region Shared commands
    exports.$Pbb = 'notebook.cell.expandCellInput';
    exports.$Qbb = 'notebook.cell.execute';
    exports.$Rbb = 'notebook.cell.detectLanguage';
    exports.$Sbb = 'notebook.cell.changeLanguage';
    exports.$Tbb = 'notebook.cell.quitEdit';
    exports.$Ubb = 'notebook.cell.expandCellOutput';
    //#endregion
    //#region Notebook extensions
    // Hardcoding viewType/extension ID for now. TODO these should be replaced once we can
    // look them up in the marketplace dynamically.
    exports.$Vbb = 'jupyter-notebook';
    exports.$Wbb = 'ms-toolsai.jupyter';
    /** @deprecated use the notebookKernel<Type> "keyword" instead */
    exports.$Xbb = new Map([
        [exports.$Vbb, exports.$Wbb],
    ]);
    // @TODO lramos15, place this in a similar spot to our normal recommendations.
    exports.$Ybb = new Map();
    exports.$Ybb.set(exports.$Vbb, new Map());
    exports.$Ybb.get(exports.$Vbb)?.set('python', {
        extensionIds: [
            'ms-python.python',
            exports.$Wbb
        ],
        displayName: 'Python + Jupyter',
    });
    //#endregion
    //#region  Output related types
    // !! IMPORTANT !! ----------------------------------------------------------------------------------
    // NOTE that you MUST update vs/workbench/contrib/notebook/browser/view/renderers/webviewPreloads.ts#L1986
    // whenever changing the values of this const enum. The webviewPreloads-files manually inlines these values
    // because it cannot have dependencies.
    // !! IMPORTANT !! ----------------------------------------------------------------------------------
    var RenderOutputType;
    (function (RenderOutputType) {
        RenderOutputType[RenderOutputType["Html"] = 0] = "Html";
        RenderOutputType[RenderOutputType["Extension"] = 1] = "Extension";
    })(RenderOutputType || (exports.RenderOutputType = RenderOutputType = {}));
    var ScrollToRevealBehavior;
    (function (ScrollToRevealBehavior) {
        ScrollToRevealBehavior[ScrollToRevealBehavior["fullCell"] = 0] = "fullCell";
        ScrollToRevealBehavior[ScrollToRevealBehavior["firstLine"] = 1] = "firstLine";
    })(ScrollToRevealBehavior || (exports.ScrollToRevealBehavior = ScrollToRevealBehavior = {}));
    //#endregion
    var CellLayoutState;
    (function (CellLayoutState) {
        CellLayoutState[CellLayoutState["Uninitialized"] = 0] = "Uninitialized";
        CellLayoutState[CellLayoutState["Estimated"] = 1] = "Estimated";
        CellLayoutState[CellLayoutState["FromCache"] = 2] = "FromCache";
        CellLayoutState[CellLayoutState["Measured"] = 3] = "Measured";
    })(CellLayoutState || (exports.CellLayoutState = CellLayoutState = {}));
    var CellLayoutContext;
    (function (CellLayoutContext) {
        CellLayoutContext[CellLayoutContext["Fold"] = 0] = "Fold";
    })(CellLayoutContext || (exports.CellLayoutContext = CellLayoutContext = {}));
    /**
     * Vertical Lane in the overview ruler of the notebook editor.
     */
    var NotebookOverviewRulerLane;
    (function (NotebookOverviewRulerLane) {
        NotebookOverviewRulerLane[NotebookOverviewRulerLane["Left"] = 1] = "Left";
        NotebookOverviewRulerLane[NotebookOverviewRulerLane["Center"] = 2] = "Center";
        NotebookOverviewRulerLane[NotebookOverviewRulerLane["Right"] = 4] = "Right";
        NotebookOverviewRulerLane[NotebookOverviewRulerLane["Full"] = 7] = "Full";
    })(NotebookOverviewRulerLane || (exports.NotebookOverviewRulerLane = NotebookOverviewRulerLane = {}));
    var CellRevealSyncType;
    (function (CellRevealSyncType) {
        CellRevealSyncType[CellRevealSyncType["Default"] = 1] = "Default";
        CellRevealSyncType[CellRevealSyncType["Top"] = 2] = "Top";
        CellRevealSyncType[CellRevealSyncType["Center"] = 3] = "Center";
        CellRevealSyncType[CellRevealSyncType["CenterIfOutsideViewport"] = 4] = "CenterIfOutsideViewport";
        CellRevealSyncType[CellRevealSyncType["FirstLineIfOutsideViewport"] = 5] = "FirstLineIfOutsideViewport";
    })(CellRevealSyncType || (exports.CellRevealSyncType = CellRevealSyncType = {}));
    var CellRevealRangeType;
    (function (CellRevealRangeType) {
        CellRevealRangeType[CellRevealRangeType["Default"] = 1] = "Default";
        CellRevealRangeType[CellRevealRangeType["Center"] = 2] = "Center";
        CellRevealRangeType[CellRevealRangeType["CenterIfOutsideViewport"] = 3] = "CenterIfOutsideViewport";
    })(CellRevealRangeType || (exports.CellRevealRangeType = CellRevealRangeType = {}));
    var CellRevealType;
    (function (CellRevealType) {
        CellRevealType[CellRevealType["NearTopIfOutsideViewport"] = 0] = "NearTopIfOutsideViewport";
        CellRevealType[CellRevealType["CenterIfOutsideViewport"] = 1] = "CenterIfOutsideViewport";
    })(CellRevealType || (exports.CellRevealType = CellRevealType = {}));
    var CellEditState;
    (function (CellEditState) {
        /**
         * Default state.
         * For markup cells, this is the renderer version of the markup.
         * For code cell, the browser focus should be on the container instead of the editor
         */
        CellEditState[CellEditState["Preview"] = 0] = "Preview";
        /**
         * Editing mode. Source for markup or code is rendered in editors and the state will be persistent.
         */
        CellEditState[CellEditState["Editing"] = 1] = "Editing";
    })(CellEditState || (exports.CellEditState = CellEditState = {}));
    var CellFocusMode;
    (function (CellFocusMode) {
        CellFocusMode[CellFocusMode["Container"] = 0] = "Container";
        CellFocusMode[CellFocusMode["Editor"] = 1] = "Editor";
        CellFocusMode[CellFocusMode["Output"] = 2] = "Output";
    })(CellFocusMode || (exports.CellFocusMode = CellFocusMode = {}));
    var CursorAtBoundary;
    (function (CursorAtBoundary) {
        CursorAtBoundary[CursorAtBoundary["None"] = 0] = "None";
        CursorAtBoundary[CursorAtBoundary["Top"] = 1] = "Top";
        CursorAtBoundary[CursorAtBoundary["Bottom"] = 2] = "Bottom";
        CursorAtBoundary[CursorAtBoundary["Both"] = 3] = "Both";
    })(CursorAtBoundary || (exports.CursorAtBoundary = CursorAtBoundary = {}));
    var CursorAtLineBoundary;
    (function (CursorAtLineBoundary) {
        CursorAtLineBoundary[CursorAtLineBoundary["None"] = 0] = "None";
        CursorAtLineBoundary[CursorAtLineBoundary["Start"] = 1] = "Start";
        CursorAtLineBoundary[CursorAtLineBoundary["End"] = 2] = "End";
        CursorAtLineBoundary[CursorAtLineBoundary["Both"] = 3] = "Both";
    })(CursorAtLineBoundary || (exports.CursorAtLineBoundary = CursorAtLineBoundary = {}));
    function $Zbb(editorPane) {
        if (!editorPane) {
            return;
        }
        if (editorPane.getId() === notebookCommon_1.$TH) {
            return editorPane.getControl();
        }
        const input = editorPane.input;
        if (input && (0, notebookEditorInput_1.$Abb)(input)) {
            return editorPane.getControl()?.notebookEditor;
        }
        return undefined;
    }
    exports.$Zbb = $Zbb;
    /**
     * ranges: model selections
     * this will convert model selections to view indexes first, and then include the hidden ranges in the list view
     */
    function $1bb(editor, ranges) {
        // assuming ranges are sorted and no overlap
        const indexes = (0, notebookRange_1.$PH)(ranges);
        const modelRanges = [];
        indexes.forEach(index => {
            const viewCell = editor.cellAt(index);
            if (!viewCell) {
                return;
            }
            const viewIndex = editor.getViewIndexByModelIndex(index);
            if (viewIndex < 0) {
                return;
            }
            const nextViewIndex = viewIndex + 1;
            const range = editor.getCellRangeFromViewRange(viewIndex, nextViewIndex);
            if (range) {
                modelRanges.push(range);
            }
        });
        return (0, notebookRange_1.$QH)(modelRanges);
    }
    exports.$1bb = $1bb;
    function $2bb(editor, ranges) {
        const cells = [];
        (0, notebookRange_1.$QH)(ranges).forEach(range => {
            cells.push(...editor.getCellsInRange(range));
        });
        return cells;
    }
    exports.$2bb = $2bb;
    //#region Cell Folding
    var CellFoldingState;
    (function (CellFoldingState) {
        CellFoldingState[CellFoldingState["None"] = 0] = "None";
        CellFoldingState[CellFoldingState["Expanded"] = 1] = "Expanded";
        CellFoldingState[CellFoldingState["Collapsed"] = 2] = "Collapsed";
    })(CellFoldingState || (exports.CellFoldingState = CellFoldingState = {}));
});
//#endregion
//# sourceMappingURL=notebookBrowser.js.map