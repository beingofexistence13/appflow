/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/filters", "vs/base/common/glob", "vs/workbench/contrib/debug/common/replModel", "vs/workbench/contrib/debug/common/debugModel"], function (require, exports, filters_1, glob_1, replModel_1, debugModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReplFilter = void 0;
    class ReplFilter {
        constructor() {
            this._parsedQueries = [];
        }
        static { this.matchQuery = filters_1.matchesFuzzy; }
        set filterQuery(query) {
            this._parsedQueries = [];
            query = query.trim();
            if (query && query !== '') {
                const filters = (0, glob_1.splitGlobAware)(query, ',').map(s => s.trim()).filter(s => !!s.length);
                for (const f of filters) {
                    if (f.startsWith('!')) {
                        this._parsedQueries.push({ type: 'exclude', query: f.slice(1) });
                    }
                    else {
                        this._parsedQueries.push({ type: 'include', query: f });
                    }
                }
            }
        }
        filter(element, parentVisibility) {
            if (element instanceof replModel_1.ReplEvaluationInput || element instanceof replModel_1.ReplEvaluationResult || element instanceof debugModel_1.Variable) {
                // Only filter the output events, everything else is visible https://github.com/microsoft/vscode/issues/105863
                return 1 /* TreeVisibility.Visible */;
            }
            let includeQueryPresent = false;
            let includeQueryMatched = false;
            const text = element.toString(true);
            for (const { type, query } of this._parsedQueries) {
                if (type === 'exclude' && ReplFilter.matchQuery(query, text)) {
                    // If exclude query matches, ignore all other queries and hide
                    return false;
                }
                else if (type === 'include') {
                    includeQueryPresent = true;
                    if (ReplFilter.matchQuery(query, text)) {
                        includeQueryMatched = true;
                    }
                }
            }
            return includeQueryPresent ? includeQueryMatched : (typeof parentVisibility !== 'undefined' ? parentVisibility : 1 /* TreeVisibility.Visible */);
        }
    }
    exports.ReplFilter = ReplFilter;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwbEZpbHRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2RlYnVnL2Jyb3dzZXIvcmVwbEZpbHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFlaEcsTUFBYSxVQUFVO1FBQXZCO1lBSVMsbUJBQWMsR0FBa0IsRUFBRSxDQUFDO1FBMEM1QyxDQUFDO2lCQTVDTyxlQUFVLEdBQUcsc0JBQVksQUFBZixDQUFnQjtRQUdqQyxJQUFJLFdBQVcsQ0FBQyxLQUFhO1lBQzVCLElBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDO1lBQ3pCLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFckIsSUFBSSxLQUFLLElBQUksS0FBSyxLQUFLLEVBQUUsRUFBRTtnQkFDMUIsTUFBTSxPQUFPLEdBQUcsSUFBQSxxQkFBYyxFQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUN0RixLQUFLLE1BQU0sQ0FBQyxJQUFJLE9BQU8sRUFBRTtvQkFDeEIsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFO3dCQUN0QixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO3FCQUNqRTt5QkFBTTt3QkFDTixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7cUJBQ3hEO2lCQUNEO2FBQ0Q7UUFDRixDQUFDO1FBRUQsTUFBTSxDQUFDLE9BQXFCLEVBQUUsZ0JBQWdDO1lBQzdELElBQUksT0FBTyxZQUFZLCtCQUFtQixJQUFJLE9BQU8sWUFBWSxnQ0FBb0IsSUFBSSxPQUFPLFlBQVkscUJBQVEsRUFBRTtnQkFDckgsOEdBQThHO2dCQUM5RyxzQ0FBOEI7YUFDOUI7WUFFRCxJQUFJLG1CQUFtQixHQUFHLEtBQUssQ0FBQztZQUNoQyxJQUFJLG1CQUFtQixHQUFHLEtBQUssQ0FBQztZQUVoQyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXBDLEtBQUssTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO2dCQUNsRCxJQUFJLElBQUksS0FBSyxTQUFTLElBQUksVUFBVSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUU7b0JBQzdELDhEQUE4RDtvQkFDOUQsT0FBTyxLQUFLLENBQUM7aUJBQ2I7cUJBQU0sSUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFO29CQUM5QixtQkFBbUIsR0FBRyxJQUFJLENBQUM7b0JBQzNCLElBQUksVUFBVSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUU7d0JBQ3ZDLG1CQUFtQixHQUFHLElBQUksQ0FBQztxQkFDM0I7aUJBQ0Q7YUFDRDtZQUVELE9BQU8sbUJBQW1CLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sZ0JBQWdCLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLCtCQUF1QixDQUFDLENBQUM7UUFDMUksQ0FBQzs7SUE3Q0YsZ0NBOENDIn0=