/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/cancellation", "vs/base/common/uri", "vs/workbench/services/search/node/textSearchManager"], function (require, exports, assert, cancellation_1, uri_1, textSearchManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('NativeTextSearchManager', () => {
        test('fixes encoding', async () => {
            let correctEncoding = false;
            const provider = {
                provideTextSearchResults(query, options, progress, token) {
                    correctEncoding = options.encoding === 'windows-1252';
                    return null;
                }
            };
            const query = {
                type: 2 /* QueryType.Text */,
                contentPattern: {
                    pattern: 'a'
                },
                folderQueries: [{
                        folder: uri_1.URI.file('/some/folder'),
                        fileEncoding: 'windows1252'
                    }]
            };
            const m = new textSearchManager_1.NativeTextSearchManager(query, provider);
            await m.search(() => { }, new cancellation_1.CancellationTokenSource().token);
            assert.ok(correctEncoding);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dFNlYXJjaE1hbmFnZXIudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9zZWFyY2gvdGVzdC9ub2RlL3RleHRTZWFyY2hNYW5hZ2VyLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFVaEcsS0FBSyxDQUFDLHlCQUF5QixFQUFFLEdBQUcsRUFBRTtRQUNyQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDakMsSUFBSSxlQUFlLEdBQUcsS0FBSyxDQUFDO1lBQzVCLE1BQU0sUUFBUSxHQUF1QjtnQkFDcEMsd0JBQXdCLENBQUMsS0FBc0IsRUFBRSxPQUEwQixFQUFFLFFBQW9DLEVBQUUsS0FBd0I7b0JBQzFJLGVBQWUsR0FBRyxPQUFPLENBQUMsUUFBUSxLQUFLLGNBQWMsQ0FBQztvQkFFdEQsT0FBTyxJQUFJLENBQUM7Z0JBQ2IsQ0FBQzthQUNELENBQUM7WUFFRixNQUFNLEtBQUssR0FBZTtnQkFDekIsSUFBSSx3QkFBZ0I7Z0JBQ3BCLGNBQWMsRUFBRTtvQkFDZixPQUFPLEVBQUUsR0FBRztpQkFDWjtnQkFDRCxhQUFhLEVBQUUsQ0FBQzt3QkFDZixNQUFNLEVBQUUsU0FBRyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUM7d0JBQ2hDLFlBQVksRUFBRSxhQUFhO3FCQUMzQixDQUFDO2FBQ0YsQ0FBQztZQUVGLE1BQU0sQ0FBQyxHQUFHLElBQUksMkNBQXVCLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ3ZELE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxzQ0FBdUIsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRS9ELE1BQU0sQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDNUIsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQyJ9