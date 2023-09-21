/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/node/pfs", "vs/workbench/services/search/node/ripgrepTextSearchEngine", "vs/workbench/services/search/node/textSearchManager"], function (require, exports, pfs, ripgrepTextSearchEngine_1, textSearchManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextSearchEngineAdapter = void 0;
    class TextSearchEngineAdapter {
        constructor(query) {
            this.query = query;
        }
        search(token, onResult, onMessage) {
            if ((!this.query.folderQueries || !this.query.folderQueries.length) && (!this.query.extraFileResources || !this.query.extraFileResources.length)) {
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
            const textSearchManager = new textSearchManager_1.NativeTextSearchManager(this.query, new ripgrepTextSearchEngine_1.RipgrepTextSearchEngine(pretendOutputChannel), pfs);
            return new Promise((resolve, reject) => {
                return textSearchManager
                    .search(matches => {
                    onResult(matches.map(fileMatchToSerialized));
                }, token)
                    .then(c => resolve({ limitHit: c.limitHit, type: 'success', stats: c.stats }), reject);
            });
        }
    }
    exports.TextSearchEngineAdapter = TextSearchEngineAdapter;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dFNlYXJjaEFkYXB0ZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvc2VhcmNoL25vZGUvdGV4dFNlYXJjaEFkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHLE1BQWEsdUJBQXVCO1FBRW5DLFlBQW9CLEtBQWlCO1lBQWpCLFVBQUssR0FBTCxLQUFLLENBQVk7UUFBSSxDQUFDO1FBRTFDLE1BQU0sQ0FBQyxLQUF3QixFQUFFLFFBQW1ELEVBQUUsU0FBOEM7WUFDbkksSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ2pKLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBMkI7b0JBQ2hELElBQUksRUFBRSxTQUFTO29CQUNmLFFBQVEsRUFBRSxLQUFLO29CQUNmLEtBQUssRUFBb0I7d0JBQ3hCLElBQUksRUFBRSxlQUFlO3FCQUNyQjtpQkFDRCxDQUFDLENBQUM7YUFDSDtZQUVELE1BQU0sb0JBQW9CLEdBQUc7Z0JBQzVCLFVBQVUsQ0FBQyxHQUFXO29CQUNyQixTQUFTLENBQUMsRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztnQkFDN0IsQ0FBQzthQUNELENBQUM7WUFDRixNQUFNLGlCQUFpQixHQUFHLElBQUksMkNBQXVCLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLGlEQUF1QixDQUFDLG9CQUFvQixDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDMUgsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtnQkFDdEMsT0FBTyxpQkFBaUI7cUJBQ3RCLE1BQU0sQ0FDTixPQUFPLENBQUMsRUFBRTtvQkFDVCxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7Z0JBQzlDLENBQUMsRUFDRCxLQUFLLENBQUM7cUJBQ04sSUFBSSxDQUNKLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBOEIsQ0FBQyxFQUNuRyxNQUFNLENBQUMsQ0FBQztZQUNYLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztLQUNEO0lBakNELDBEQWlDQztJQUVELFNBQVMscUJBQXFCLENBQUMsS0FBaUI7UUFDL0MsT0FBTztZQUNOLElBQUksRUFBRSxLQUFLLENBQUMsUUFBUSxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTTtZQUM3QyxPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU87WUFDdEIsVUFBVSxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ25ELElBQUksQ0FBQyxDQUFvQixDQUFFLENBQUMsTUFBTSxFQUFFO29CQUNuQyxNQUFNLENBQUMsR0FBcUIsQ0FBQyxDQUFDO29CQUM5QixPQUFPLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQzdEO3FCQUFNO29CQUNOLE9BQU8sR0FBRyxHQUFHLENBQUMsQ0FBQztpQkFDZjtZQUNGLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDTCxDQUFDO0lBQ0gsQ0FBQyJ9