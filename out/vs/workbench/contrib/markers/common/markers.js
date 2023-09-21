/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/contextkey/common/contextkey"], function (require, exports, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MarkersContextKeys = exports.Markers = exports.MarkersViewMode = void 0;
    var MarkersViewMode;
    (function (MarkersViewMode) {
        MarkersViewMode["Table"] = "table";
        MarkersViewMode["Tree"] = "tree";
    })(MarkersViewMode || (exports.MarkersViewMode = MarkersViewMode = {}));
    var Markers;
    (function (Markers) {
        Markers.MARKERS_CONTAINER_ID = 'workbench.panel.markers';
        Markers.MARKERS_VIEW_ID = 'workbench.panel.markers.view';
        Markers.MARKERS_VIEW_STORAGE_ID = 'workbench.panel.markers';
        Markers.MARKER_COPY_ACTION_ID = 'problems.action.copy';
        Markers.MARKER_COPY_MESSAGE_ACTION_ID = 'problems.action.copyMessage';
        Markers.RELATED_INFORMATION_COPY_MESSAGE_ACTION_ID = 'problems.action.copyRelatedInformationMessage';
        Markers.FOCUS_PROBLEMS_FROM_FILTER = 'problems.action.focusProblemsFromFilter';
        Markers.MARKERS_VIEW_FOCUS_FILTER = 'problems.action.focusFilter';
        Markers.MARKERS_VIEW_CLEAR_FILTER_TEXT = 'problems.action.clearFilterText';
        Markers.MARKERS_VIEW_SHOW_MULTILINE_MESSAGE = 'problems.action.showMultilineMessage';
        Markers.MARKERS_VIEW_SHOW_SINGLELINE_MESSAGE = 'problems.action.showSinglelineMessage';
        Markers.MARKER_OPEN_ACTION_ID = 'problems.action.open';
        Markers.MARKER_OPEN_SIDE_ACTION_ID = 'problems.action.openToSide';
        Markers.MARKER_SHOW_PANEL_ID = 'workbench.action.showErrorsWarnings';
        Markers.MARKER_SHOW_QUICK_FIX = 'problems.action.showQuickFixes';
        Markers.TOGGLE_MARKERS_VIEW_ACTION_ID = 'workbench.actions.view.toggleProblems';
    })(Markers || (exports.Markers = Markers = {}));
    var MarkersContextKeys;
    (function (MarkersContextKeys) {
        MarkersContextKeys.MarkersViewModeContextKey = new contextkey_1.RawContextKey('problemsViewMode', "tree" /* MarkersViewMode.Tree */);
        MarkersContextKeys.MarkersTreeVisibilityContextKey = new contextkey_1.RawContextKey('problemsVisibility', false);
        MarkersContextKeys.MarkerFocusContextKey = new contextkey_1.RawContextKey('problemFocus', false);
        MarkersContextKeys.MarkerViewFilterFocusContextKey = new contextkey_1.RawContextKey('problemsFilterFocus', false);
        MarkersContextKeys.RelatedInformationFocusContextKey = new contextkey_1.RawContextKey('relatedInformationFocus', false);
        MarkersContextKeys.ShowErrorsFilterContextKey = new contextkey_1.RawContextKey('problems.filter.errors', true);
        MarkersContextKeys.ShowWarningsFilterContextKey = new contextkey_1.RawContextKey('problems.filter.warnings', true);
        MarkersContextKeys.ShowInfoFilterContextKey = new contextkey_1.RawContextKey('problems.filter.info', true);
        MarkersContextKeys.ShowActiveFileFilterContextKey = new contextkey_1.RawContextKey('problems.filter.activeFile', false);
        MarkersContextKeys.ShowExcludedFilesFilterContextKey = new contextkey_1.RawContextKey('problems.filter.excludedFiles', true);
    })(MarkersContextKeys || (exports.MarkersContextKeys = MarkersContextKeys = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Vycy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL21hcmtlcnMvY29tbW9uL21hcmtlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBSWhHLElBQWtCLGVBR2pCO0lBSEQsV0FBa0IsZUFBZTtRQUNoQyxrQ0FBZSxDQUFBO1FBQ2YsZ0NBQWEsQ0FBQTtJQUNkLENBQUMsRUFIaUIsZUFBZSwrQkFBZixlQUFlLFFBR2hDO0lBRUQsSUFBaUIsT0FBTyxDQWlCdkI7SUFqQkQsV0FBaUIsT0FBTztRQUNWLDRCQUFvQixHQUFHLHlCQUF5QixDQUFDO1FBQ2pELHVCQUFlLEdBQUcsOEJBQThCLENBQUM7UUFDakQsK0JBQXVCLEdBQUcseUJBQXlCLENBQUM7UUFDcEQsNkJBQXFCLEdBQUcsc0JBQXNCLENBQUM7UUFDL0MscUNBQTZCLEdBQUcsNkJBQTZCLENBQUM7UUFDOUQsa0RBQTBDLEdBQUcsK0NBQStDLENBQUM7UUFDN0Ysa0NBQTBCLEdBQUcseUNBQXlDLENBQUM7UUFDdkUsaUNBQXlCLEdBQUcsNkJBQTZCLENBQUM7UUFDMUQsc0NBQThCLEdBQUcsaUNBQWlDLENBQUM7UUFDbkUsMkNBQW1DLEdBQUcsc0NBQXNDLENBQUM7UUFDN0UsNENBQW9DLEdBQUcsdUNBQXVDLENBQUM7UUFDL0UsNkJBQXFCLEdBQUcsc0JBQXNCLENBQUM7UUFDL0Msa0NBQTBCLEdBQUcsNEJBQTRCLENBQUM7UUFDMUQsNEJBQW9CLEdBQUcscUNBQXFDLENBQUM7UUFDN0QsNkJBQXFCLEdBQUcsZ0NBQWdDLENBQUM7UUFDekQscUNBQTZCLEdBQUcsdUNBQXVDLENBQUM7SUFDdEYsQ0FBQyxFQWpCZ0IsT0FBTyx1QkFBUCxPQUFPLFFBaUJ2QjtJQUVELElBQWlCLGtCQUFrQixDQVdsQztJQVhELFdBQWlCLGtCQUFrQjtRQUNyQiw0Q0FBeUIsR0FBRyxJQUFJLDBCQUFhLENBQWtCLGtCQUFrQixvQ0FBdUIsQ0FBQztRQUN6RyxrREFBK0IsR0FBRyxJQUFJLDBCQUFhLENBQVUsb0JBQW9CLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDMUYsd0NBQXFCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLGNBQWMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMxRSxrREFBK0IsR0FBRyxJQUFJLDBCQUFhLENBQVUscUJBQXFCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDM0Ysb0RBQWlDLEdBQUcsSUFBSSwwQkFBYSxDQUFVLHlCQUF5QixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2pHLDZDQUEwQixHQUFHLElBQUksMEJBQWEsQ0FBVSx3QkFBd0IsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN4RiwrQ0FBNEIsR0FBRyxJQUFJLDBCQUFhLENBQVUsMEJBQTBCLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDNUYsMkNBQXdCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLHNCQUFzQixFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3BGLGlEQUE4QixHQUFHLElBQUksMEJBQWEsQ0FBVSw0QkFBNEIsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNqRyxvREFBaUMsR0FBRyxJQUFJLDBCQUFhLENBQVUsK0JBQStCLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDcEgsQ0FBQyxFQVhnQixrQkFBa0Isa0NBQWxCLGtCQUFrQixRQVdsQyJ9