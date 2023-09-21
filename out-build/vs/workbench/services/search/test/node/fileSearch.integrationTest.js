/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/network", "vs/base/common/path", "vs/base/common/uri", "vs/base/test/node/testUtils", "vs/workbench/services/search/common/search", "vs/workbench/services/search/node/rawSearchService"], function (require, exports, assert, network_1, path, uri_1, testUtils_1, search_1, rawSearchService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const TEST_FIXTURES = path.$7d(network_1.$2f.asFileUri('vs/workbench/services/search/test/node/fixtures').fsPath);
    const TEST_FIXTURES2 = path.$7d(network_1.$2f.asFileUri('vs/workbench/services/search/test/node/fixtures2').fsPath);
    const EXAMPLES_FIXTURES = path.$9d(TEST_FIXTURES, 'examples');
    const MORE_FIXTURES = path.$9d(TEST_FIXTURES, 'more');
    const TEST_ROOT_FOLDER = { folder: uri_1.URI.file(TEST_FIXTURES) };
    const ROOT_FOLDER_QUERY = [
        TEST_ROOT_FOLDER
    ];
    const MULTIROOT_QUERIES = [
        { folder: uri_1.URI.file(EXAMPLES_FIXTURES), folderName: 'examples_folder' },
        { folder: uri_1.URI.file(MORE_FIXTURES) }
    ];
    async function doSearchTest(query, expectedResultCount) {
        const svc = new rawSearchService_1.$Idc();
        const results = [];
        await svc.doFileSearch(query, e => {
            if (!(0, search_1.$rI)(e)) {
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
//# sourceMappingURL=fileSearch.integrationTest.js.map