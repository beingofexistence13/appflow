/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/contrib/files/common/files", "vs/workbench/services/textfile/common/textfiles", "vs/base/common/lifecycle", "vs/base/test/common/utils"], function (require, exports, assert, uri_1, workbenchTestServices_1, files_1, textfiles_1, lifecycle_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Files - FileOnDiskContentProvider', () => {
        const disposables = new lifecycle_1.$jc();
        let instantiationService;
        let accessor;
        setup(() => {
            instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            accessor = instantiationService.createInstance(workbenchTestServices_1.$mec);
        });
        teardown(() => {
            disposables.clear();
        });
        test('provideTextContent', async () => {
            const provider = disposables.add(instantiationService.createInstance(files_1.$$db));
            const uri = uri_1.URI.parse('testFileOnDiskContentProvider://foo');
            const content = await provider.provideTextContent(uri.with({ scheme: 'conflictResolution', query: JSON.stringify({ scheme: uri.scheme }) }));
            assert.ok(content);
            assert.strictEqual((0, textfiles_1.$MD)(content.createSnapshot()), 'Hello Html');
            assert.strictEqual(accessor.fileService.getLastReadFileUri().scheme, uri.scheme);
            assert.strictEqual(accessor.fileService.getLastReadFileUri().path, uri.path);
            content.dispose();
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=fileOnDiskProvider.test.js.map