/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/network", "vs/base/common/path", "vs/base/common/uri", "vs/base/test/node/testUtils", "vs/workbench/services/search/common/search", "vs/workbench/services/search/node/rawSearchService"], function (require, exports, assert, network_1, path, uri_1, testUtils_1, search_1, rawSearchService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const TEST_FIXTURES = path.normalize(network_1.FileAccess.asFileUri('vs/workbench/services/search/test/node/fixtures').fsPath);
    const TEST_FIXTURES2 = path.normalize(network_1.FileAccess.asFileUri('vs/workbench/services/search/test/node/fixtures2').fsPath);
    const EXAMPLES_FIXTURES = path.join(TEST_FIXTURES, 'examples');
    const MORE_FIXTURES = path.join(TEST_FIXTURES, 'more');
    const TEST_ROOT_FOLDER = { folder: uri_1.URI.file(TEST_FIXTURES) };
    const ROOT_FOLDER_QUERY = [
        TEST_ROOT_FOLDER
    ];
    const MULTIROOT_QUERIES = [
        { folder: uri_1.URI.file(EXAMPLES_FIXTURES), folderName: 'examples_folder' },
        { folder: uri_1.URI.file(MORE_FIXTURES) }
    ];
    async function doSearchTest(query, expectedResultCount) {
        const svc = new rawSearchService_1.SearchService();
        const results = [];
        await svc.doFileSearch(query, e => {
            if (!(0, search_1.isProgressMessage)(e)) {
                if (Array.isArray(e)) {
                    results.push(...e);
                }
                else {
                    results.push(e);
                }
            }
        });
        assert.strictEqual(results.length, expectedResultCount, `rg ${results.length} !== ${expectedResultCount}`);
    }
    (0, testUtils_1.flakySuite)('FileSearch-integration', function () {
        test('File - simple', () => {
            const config = {
                type: 1 /* QueryType.File */,
                folderQueries: ROOT_FOLDER_QUERY
            };
            return doSearchTest(config, 14);
        });
        test('File - filepattern', () => {
            const config = {
                type: 1 /* QueryType.File */,
                folderQueries: ROOT_FOLDER_QUERY,
                filePattern: 'anotherfile'
            };
            return doSearchTest(config, 1);
        });
        test('File - exclude', () => {
            const config = {
                type: 1 /* QueryType.File */,
                folderQueries: ROOT_FOLDER_QUERY,
                filePattern: 'file',
                excludePattern: { '**/anotherfolder/**': true }
            };
            return doSearchTest(config, 2);
        });
        test('File - multiroot', () => {
            const config = {
                type: 1 /* QueryType.File */,
                folderQueries: MULTIROOT_QUERIES,
                filePattern: 'file',
                excludePattern: { '**/anotherfolder/**': true }
            };
            return doSearchTest(config, 2);
        });
        test('File - multiroot with folder name', () => {
            const config = {
                type: 1 /* QueryType.File */,
                folderQueries: MULTIROOT_QUERIES,
                filePattern: 'examples_folder anotherfile'
            };
            return doSearchTest(config, 1);
        });
        test('File - multiroot with folder name and sibling exclude', () => {
            const config = {
                type: 1 /* QueryType.File */,
                folderQueries: [
                    { folder: uri_1.URI.file(TEST_FIXTURES), folderName: 'folder1' },
                    { folder: uri_1.URI.file(TEST_FIXTURES2) }
                ],
                filePattern: 'folder1 site',
                excludePattern: { '*.css': { when: '$(basename).less' } }
            };
            return doSearchTest(config, 1);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZVNlYXJjaC5pbnRlZ3JhdGlvblRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvc2VhcmNoL3Rlc3Qvbm9kZS9maWxlU2VhcmNoLmludGVncmF0aW9uVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVVoRyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFVLENBQUMsU0FBUyxDQUFDLGlEQUFpRCxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDckgsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBVSxDQUFDLFNBQVMsQ0FBQyxrREFBa0QsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3ZILE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDL0QsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDdkQsTUFBTSxnQkFBZ0IsR0FBaUIsRUFBRSxNQUFNLEVBQUUsU0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDO0lBQzNFLE1BQU0saUJBQWlCLEdBQW1CO1FBQ3pDLGdCQUFnQjtLQUNoQixDQUFDO0lBRUYsTUFBTSxpQkFBaUIsR0FBbUI7UUFDekMsRUFBRSxNQUFNLEVBQUUsU0FBRyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLFVBQVUsRUFBRSxpQkFBaUIsRUFBRTtRQUN0RSxFQUFFLE1BQU0sRUFBRSxTQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFO0tBQ25DLENBQUM7SUFFRixLQUFLLFVBQVUsWUFBWSxDQUFDLEtBQWlCLEVBQUUsbUJBQXNDO1FBQ3BGLE1BQU0sR0FBRyxH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