/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/markers/browser/messages", "vs/base/common/resources", "vs/platform/markers/common/markers"], function (require, exports, nls, resources_1, markers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class $zSb {
        static { this.MARKERS_PANEL_TOGGLE_LABEL = nls.localize(0, null); }
        static { this.MARKERS_PANEL_SHOW_LABEL = nls.localize(1, null); }
        static { this.PROBLEMS_PANEL_CONFIGURATION_TITLE = nls.localize(2, null); }
        static { this.PROBLEMS_PANEL_CONFIGURATION_AUTO_REVEAL = nls.localize(3, null); }
        static { this.PROBLEMS_PANEL_CONFIGURATION_VIEW_MODE = nls.localize(4, null); }
        static { this.PROBLEMS_PANEL_CONFIGURATION_SHOW_CURRENT_STATUS = nls.localize(5, null); }
        static { this.PROBLEMS_PANEL_CONFIGURATION_COMPARE_ORDER = nls.localize(6, null); }
        static { this.PROBLEMS_PANEL_CONFIGURATION_COMPARE_ORDER_SEVERITY = nls.localize(7, null); }
        static { this.PROBLEMS_PANEL_CONFIGURATION_COMPARE_ORDER_POSITION = nls.localize(8, null); }
        static { this.MARKERS_PANEL_ORIGINAL_TITLE_PROBLEMS = 'Problems'; }
        static { this.MARKERS_PANEL_TITLE_PROBLEMS = nls.localize(9, null); }
        static { this.MARKERS_PANEL_NO_PROBLEMS_BUILT = nls.localize(10, null); }
        static { this.MARKERS_PANEL_NO_PROBLEMS_ACTIVE_FILE_BUILT = nls.localize(11, null); }
        static { this.MARKERS_PANEL_NO_PROBLEMS_FILTERS = nls.localize(12, null); }
        static { this.MARKERS_PANEL_ACTION_TOOLTIP_MORE_FILTERS = nls.localize(13, null); }
        static { this.MARKERS_PANEL_FILTER_LABEL_SHOW_ERRORS = nls.localize(14, null); }
        static { this.MARKERS_PANEL_FILTER_LABEL_SHOW_WARNINGS = nls.localize(15, null); }
        static { this.MARKERS_PANEL_FILTER_LABEL_SHOW_INFOS = nls.localize(16, null); }
        static { this.MARKERS_PANEL_FILTER_LABEL_EXCLUDED_FILES = nls.localize(17, null); }
        static { this.MARKERS_PANEL_FILTER_LABEL_ACTIVE_FILE = nls.localize(18, null); }
        static { this.MARKERS_PANEL_ACTION_TOOLTIP_FILTER = nls.localize(19, null); }
        static { this.MARKERS_PANEL_ACTION_TOOLTIP_QUICKFIX = nls.localize(20, null); }
        static { this.MARKERS_PANEL_FILTER_ARIA_LABEL = nls.localize(21, null); }
        static { this.MARKERS_PANEL_FILTER_PLACEHOLDER = nls.localize(22, null); }
        static { this.MARKERS_PANEL_FILTER_ERRORS = nls.localize(23, null); }
        static { this.MARKERS_PANEL_FILTER_WARNINGS = nls.localize(24, null); }
        static { this.MARKERS_PANEL_FILTER_INFOS = nls.localize(25, null); }
        static { this.MARKERS_PANEL_SINGLE_ERROR_LABEL = nls.localize(26, null); }
        static { this.MARKERS_PANEL_MULTIPLE_ERRORS_LABEL = (noOfErrors) => { return nls.localize(27, null, '' + noOfErrors); }; }
        static { this.MARKERS_PANEL_SINGLE_WARNING_LABEL = nls.localize(28, null); }
        static { this.MARKERS_PANEL_MULTIPLE_WARNINGS_LABEL = (noOfWarnings) => { return nls.localize(29, null, '' + noOfWarnings); }; }
        static { this.MARKERS_PANEL_SINGLE_INFO_LABEL = nls.localize(30, null); }
        static { this.MARKERS_PANEL_MULTIPLE_INFOS_LABEL = (noOfInfos) => { return nls.localize(31, null, '' + noOfInfos); }; }
        static { this.MARKERS_PANEL_SINGLE_UNKNOWN_LABEL = nls.localize(32, null); }
        static { this.MARKERS_PANEL_MULTIPLE_UNKNOWNS_LABEL = (noOfUnknowns) => { return nls.localize(33, null, '' + noOfUnknowns); }; }
        static { this.MARKERS_PANEL_AT_LINE_COL_NUMBER = (ln, col) => { return nls.localize(34, null, '' + ln, '' + col); }; }
        static { this.MARKERS_TREE_ARIA_LABEL_RESOURCE = (noOfProblems, fileName, folder) => { return nls.localize(35, null, noOfProblems, fileName, folder); }; }
        static { this.MARKERS_TREE_ARIA_LABEL_MARKER = (marker) => {
            const relatedInformationMessage = marker.relatedInformation.length ? nls.localize(36, null, marker.relatedInformation.length) : '';
            switch (marker.marker.severity) {
                case markers_1.MarkerSeverity.Error:
                    return marker.marker.source ? nls.localize(37, null, marker.marker.message, marker.marker.startLineNumber, marker.marker.startColumn, relatedInformationMessage, marker.marker.source)
                        : nls.localize(38, null, marker.marker.message, marker.marker.startLineNumber, marker.marker.startColumn, relatedInformationMessage);
                case markers_1.MarkerSeverity.Warning:
                    return marker.marker.source ? nls.localize(39, null, marker.marker.message, marker.marker.startLineNumber, marker.marker.startColumn, relatedInformationMessage, marker.marker.source)
                        : nls.localize(40, null, marker.marker.message, marker.marker.startLineNumber, marker.marker.startColumn, relatedInformationMessage, relatedInformationMessage);
                case markers_1.MarkerSeverity.Info:
                    return marker.marker.source ? nls.localize(41, null, marker.marker.message, marker.marker.startLineNumber, marker.marker.startColumn, relatedInformationMessage, marker.marker.source)
                        : nls.localize(42, null, marker.marker.message, marker.marker.startLineNumber, marker.marker.startColumn, relatedInformationMessage);
                default:
                    return marker.marker.source ? nls.localize(43, null, marker.marker.source, marker.marker.message, marker.marker.startLineNumber, marker.marker.startColumn, relatedInformationMessage, marker.marker.source)
                        : nls.localize(44, null, marker.marker.message, marker.marker.startLineNumber, marker.marker.startColumn, relatedInformationMessage);
            }
        }; }
        static { this.MARKERS_TREE_ARIA_LABEL_RELATED_INFORMATION = (relatedInformation) => nls.localize(45, null, relatedInformation.message, relatedInformation.startLineNumber, relatedInformation.startColumn, (0, resources_1.$fg)(relatedInformation.resource)); }
        static { this.SHOW_ERRORS_WARNINGS_ACTION_LABEL = nls.localize(46, null); }
    }
    exports.default = $zSb;
});
//# sourceMappingURL=messages.js.map