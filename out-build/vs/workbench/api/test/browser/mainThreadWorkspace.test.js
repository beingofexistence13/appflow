/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/cancellation", "vs/base/test/common/utils", "vs/platform/configuration/common/configuration", "vs/workbench/api/browser/mainThreadWorkspace", "vs/workbench/api/test/common/testRPCProtocol", "vs/workbench/services/search/common/search", "vs/workbench/test/browser/workbenchTestServices"], function (require, exports, assert, cancellation_1, utils_1, configuration_1, mainThreadWorkspace_1, testRPCProtocol_1, search_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('MainThreadWorkspace', () => {
        const disposables = (0, utils_1.$bT)();
        let configService;
        let instantiationService;
        setup(() => {
            instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            configService = instantiationService.get(configuration_1.$8h);
            configService.setUserConfiguration('search', {});
        });
        test('simple', () => {
            instantiationService.stub(search_1.$oI, {
                fileSearch(query) {
                    assert.strictEqual(query.folderQueries.length, 1);
                    assert.strictEqual(query.folderQueries[0].disregardIgnoreFiles, true);
                    assert.deepStrictEqual({ ...query.includePattern }, { 'foo': true });
                    assert.strictEqual(query.maxResults, 10);
                    return Promise.resolve({ results: [], messages: [] });
                }
            });
            const mtw = disposables.add(instantiationService.createInstance(mainThreadWorkspace_1.$Clb, (0, testRPCProtocol_1.$2dc)({ $initializeWorkspace: () => { } })));
            return mtw.$startFileSearch('foo', null, null, 10, new cancellation_1.$pd().token);
        });
        test('exclude defaults', () => {
            configService.setUserConfiguration('search', {
                'exclude': { 'searchExclude': true }
            });
            configService.setUserConfiguration('files', {
                'exclude': { 'filesExclude': true }
            });
            instantiationService.stub(search_1.$oI, {
                fileSearch(query) {
                    assert.strictEqual(query.folderQueries.length, 1);
                    assert.strictEqual(query.folderQueries[0].disregardIgnoreFiles, true);
                    assert.deepStrictEqual(query.folderQueries[0].excludePattern, { 'filesExclude': true });
                    return Promise.resolve({ results: [], messages: [] });
                }
            });
            const mtw = disposables.add(instantiationService.createInstance(mainThreadWorkspace_1.$Clb, (0, testRPCProtocol_1.$2dc)({ $initializeWorkspace: () => { } })));
            return mtw.$startFileSearch('', null, null, 10, new cancellation_1.$pd().token);
        });
        test('disregard excludes', () => {
            configService.setUserConfiguration('search', {
                'exclude': { 'searchExclude': true }
            });
            configService.setUserConfiguration('files', {
                'exclude': { 'filesExclude': true }
            });
            instantiationService.stub(search_1.$oI, {
                fileSearch(query) {
                    assert.strictEqual(query.folderQueries[0].excludePattern, undefined);
                    assert.deepStrictEqual(query.excludePattern, undefined);
                    return Promise.resolve({ results: [], messages: [] });
                }
            });
            const mtw = disposables.add(instantiationService.createInstance(mainThreadWorkspace_1.$Clb, (0, testRPCProtocol_1.$2dc)({ $initializeWorkspace: () => { } })));
            return mtw.$startFileSearch('', null, false, 10, new cancellation_1.$pd().token);
        });
        test('exclude string', () => {
            instantiationService.stub(search_1.$oI, {
                fileSearch(query) {
                    assert.strictEqual(query.folderQueries[0].excludePattern, undefined);
                    assert.deepStrictEqual({ ...query.excludePattern }, { 'exclude/**': true });
                    return Promise.resolve({ results: [], messages: [] });
                }
            });
            const mtw = disposables.add(instantiationService.createInstance(mainThreadWorkspace_1.$Clb, (0, testRPCProtocol_1.$2dc)({ $initializeWorkspace: () => { } })));
            return mtw.$startFileSearch('', null, 'exclude/**', 10, new cancellation_1.$pd().token);
        });
    });
});
//# sourceMappingURL=mainThreadWorkspace.test.js.map