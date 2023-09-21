/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/filters", "vs/base/common/glob", "vs/workbench/contrib/debug/common/replModel", "vs/workbench/contrib/debug/common/debugModel"], function (require, exports, filters_1, glob_1, replModel_1, debugModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$6Rb = void 0;
    class $6Rb {
        constructor() {
            this.a = [];
        }
        static { this.matchQuery = filters_1.$Ej; }
        set filterQuery(query) {
            this.a = [];
            query = query.trim();
            if (query && query !== '') {
                const filters = (0, glob_1.$pj)(query, ',').map(s => s.trim()).filter(s => !!s.length);
                for (const f of filters) {
                    if (f.startsWith('!')) {
                        this.a.push({ type: 'exclude', query: f.slice(1) });
                    }
                    else {
                        this.a.push({ type: 'include', query: f });
                    }
                }
            }
        }
        filter(element, parentVisibility) {
            if (element instanceof replModel_1.$6Pb || element instanceof replModel_1.$7Pb || element instanceof debugModel_1.$JFb) {
                // Only filter the output events, everything else is visible https://github.com/microsoft/vscode/issues/105863
                return 1 /* TreeVisibility.Visible */;
            }
            let includeQueryPresent = false;
            let includeQueryMatched = false;
            const text = element.toString(true);
            for (const { type, query } of this.a) {
                if (type === 'exclude' && $6Rb.matchQuery(query, text)) {
                    // If exclude query matches, ignore all other queries and hide
                    return false;
                }
                else if (type === 'include') {
                    includeQueryPresent = true;
                    if ($6Rb.matchQuery(query, text)) {
                        includeQueryMatched = true;
                    }
                }
            }
            return includeQueryPresent ? includeQueryMatched : (typeof parentVisibility !== 'undefined' ? parentVisibility : 1 /* TreeVisibility.Visible */);
        }
    }
    exports.$6Rb = $6Rb;
});
//# sourceMappingURL=replFilter.js.map