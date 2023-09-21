/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/node/pfs", "vs/workbench/services/search/node/ripgrepTextSearchEngine", "vs/workbench/services/search/node/textSearchManager"], function (require, exports, pfs, ripgrepTextSearchEngine_1, textSearchManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Hdc = void 0;
    class $Hdc {
        constructor(a) {
            this.a = a;
        }
        search(token, onResult, onMessage) {
            if ((!this.a.folderQueries || !this.a.folderQueries.length) && (!this.a.extraFileResources || !this.a.extraFileResources.length)) {
                return Promise.resolve({
                    type: 'success',
                    limitHit: false,
                    stats: {
                        type: 'searchProcess'
                    }
                });
            }
            const pretendOutputChannel = {
                appendLine(msg) {
                    onMessage({ message: msg });
                }
            };
            const textSearchManager = new textSearchManager_1.$Gdc(this.a, new ripgrepTextSearchEngine_1.$zdc(pretendOutputChannel), pfs);
            return new Promise((resolve, reject) => {
                return textSearchManager
                    .search(matches => {
                    onResult(matches.map(fileMatchToSerialized));
                }, token)
                    .then(c => resolve({ limitHit: c.limitHit, type: 'success', stats: c.stats }), reject);
            });
        }
    }
    exports.$Hdc = $Hdc;
    function fileMatchToSerialized(match) {
        return {
            path: match.resource && match.resource.fsPath,
            results: match.results,
            numMatches: (match.results || []).reduce((sum, r) => {
                if (!!r.ranges) {
                    const m = r;
                    return sum + (Array.isArray(m.ranges) ? m.ranges.length : 1);
                }
                else {
                    return sum + 1;
                }
            }, 0)
        };
    }
});
//# sourceMappingURL=textSearchAdapter.js.map