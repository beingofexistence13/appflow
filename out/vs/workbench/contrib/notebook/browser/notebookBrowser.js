/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookEditorInput", "vs/workbench/contrib/notebook/common/notebookRange"], function (require, exports, notebookCommon_1, notebookEditorInput_1, notebookRange_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CellFoldingState = exports.cellRangeToViewCells = exports.expandCellRangesWithHiddenCells = exports.getNotebookEditorFromEditorPane = exports.CursorAtLineBoundary = exports.CursorAtBoundary = exports.CellFocusMode = exports.CellEditState = exports.CellRevealType = exports.CellRevealRangeType = exports.CellRevealSyncType = exports.NotebookOverviewRulerLane = exports.CellLayoutContext = exports.CellLayoutState = exports.ScrollToRevealBehavior = exports.RenderOutputType = exports.KERNEL_RECOMMENDATIONS = exports.KERNEL_EXTENSIONS = exports.JUPYTER_EXTENSION_ID = exports.IPYNB_VIEW_TYPE = exports.EXPAND_CELL_OUTPUT_COMMAND_ID = exports.QUIT_EDIT_CELL_COMMAND_ID = exports.CHANGE_CELL_LANGUAGE = exports.DETECT_CELL_LANGUAGE = exports.EXECUTE_CELL_COMMAND_ID = exports.EXPAND_CELL_INPUT_COMMAND_ID = void 0;
    //#region Shared commands
    exports.EXPAND_CELL_INPUT_COMMAND_ID = 'notebook.cell.expandCellInput';
    exports.EXECUTE_CELL_COMMAND_ID = 'notebook.cell.execute';
    exports.DETECT_CELL_LANGUAGE = 'notebook.cell.detectLanguage';
    exports.CHANGE_CELL_LANGUAGE = 'notebook.cell.changeLanguage';
    exports.QUIT_EDIT_CELL_COMMAND_ID = 'notebook.cell.quitEdit';
    exports.EXPAND_CELL_OUTPUT_COMMAND_ID = 'notebook.cell.expandCellOutput';
    //#endregion
    //#region Notebook extensions
    // Hardcoding viewType/extension ID for now. TODO these should be replaced once we can
    // look them up in the marketplace dynamically.
    exports.IPYNB_VIEW_TYPE = 'jupyter-notebook';
    exports.JUPYTER_EXTENSION_ID = 'ms-toolsai.jupyter';
    /** @deprecated use the notebookKernel<Type> "keyword" instead */
    exports.KERNEL_EXTENSIONS = new Map([
        [exports.IPYNB_VIEW_TYPE, exports.JUPYTER_EXTENSION_ID],
    ]);
    // @TODO lramos15, place this in a similar spot to our normal recommendations.
    exports.KERNEL_RECOMMENDATIONS = new Map();
    exports.KERNEL_RECOMMENDATIONS.set(exports.IPYNB_VIEW_TYPE, new Map());
    exports.KERNEL_RECOMMENDATIONS.get(exports.IPYNB_VIEW_TYPE)?.set('python', {
        extensionIds: [
            'ms-python.python',
            exports.JUPYTER_EXTENSION_ID
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
    function getNotebookEditorFromEditorPane(editorPane) {
        if (!editorPane) {
            return;
        }
        if (editorPane.getId() === notebookCommon_1.NOTEBOOK_EDITOR_ID) {
            return editorPane.getControl();
        }
        const input = editorPane.input;
        if (input && (0, notebookEditorInput_1.isCompositeNotebookEditorInput)(input)) {
            return editorPane.getControl()?.notebookEditor;
        }
        return undefined;
    }
    exports.getNotebookEditorFromEditorPane = getNotebookEditorFromEditorPane;
    /**
     * ranges: model selections
     * this will convert model selections to view indexes first, and then include the hidden ranges in the list view
     */
    function expandCellRangesWithHiddenCells(editor, ranges) {
        // assuming ranges are sorted and no overlap
        const indexes = (0, notebookRange_1.cellRangesToIndexes)(ranges);
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
        return (0, notebookRange_1.reduceCellRanges)(modelRanges);
    }
    exports.expandCellRangesWithHiddenCells = expandCellRangesWithHiddenCells;
    function cellRangeToViewCells(editor, ranges) {
        const cells = [];
        (0, notebookRange_1.reduceCellRanges)(ranges).forEach(range => {
            cells.push(...editor.getCellsInRange(range));
        });
        return cells;
    }
    exports.cellRangeToViewCells = cellRangeToViewCells;
    //#region Cell Folding
    var CellFoldingState;
    (function (CellFoldingState) {
        CellFoldingState[CellFoldingState["None"] = 0] = "None";
        CellFoldingState[CellFoldingState["Expanded"] = 1] = "Expanded";
        CellFoldingState[CellFoldingState["Collapsed"] = 2] = "Collapsed";
    })(CellFoldingState || (exports.CellFoldingState = CellFoldingState = {}));
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tCcm93c2VyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci9ub3RlYm9va0Jyb3dzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBOEJoRyx5QkFBeUI7SUFDWixRQUFBLDRCQUE0QixHQUFHLCtCQUErQixDQUFDO0lBQy9ELFFBQUEsdUJBQXVCLEdBQUcsdUJBQXVCLENBQUM7SUFDbEQsUUFBQSxvQkFBb0IsR0FBRyw4QkFBOEIsQ0FBQztJQUN0RCxRQUFBLG9CQUFvQixHQUFHLDhCQUE4QixDQUFDO0lBQ3RELFFBQUEseUJBQXlCLEdBQUcsd0JBQXdCLENBQUM7SUFDckQsUUFBQSw2QkFBNkIsR0FBRyxnQ0FBZ0MsQ0FBQztJQUc5RSxZQUFZO0lBRVosNkJBQTZCO0lBRTdCLHNGQUFzRjtJQUN0RiwrQ0FBK0M7SUFDbEMsUUFBQSxlQUFlLEdBQUcsa0JBQWtCLENBQUM7SUFDckMsUUFBQSxvQkFBb0IsR0FBRyxvQkFBb0IsQ0FBQztJQUN6RCxpRUFBaUU7SUFDcEQsUUFBQSxpQkFBaUIsR0FBRyxJQUFJLEdBQUcsQ0FBaUI7UUFDeEQsQ0FBQyx1QkFBZSxFQUFFLDRCQUFvQixDQUFDO0tBQ3ZDLENBQUMsQ0FBQztJQUNILDhFQUE4RTtJQUNqRSxRQUFBLHNCQUFzQixHQUFHLElBQUksR0FBRyxFQUF5RCxDQUFDO0lBQ3ZHLDhCQUFzQixDQUFDLEdBQUcsQ0FBQyx1QkFBZSxFQUFFLElBQUksR0FBRyxFQUE0QyxDQUFDLENBQUM7SUFDakcsOEJBQXNCLENBQUMsR0FBRyxDQUFDLHVCQUFlLENBQUMsRUFBRSxHQUFHLENBQUMsUUFBUSxFQUFFO1FBQzFELFlBQVksRUFBRTtZQUNiLGtCQUFrQjtZQUNsQiw0QkFBb0I7U0FDcEI7UUFDRCxXQUFXLEVBQUUsa0JBQWtCO0tBQy9C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