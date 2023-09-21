/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/services/textfile/common/textFileEditorModel", "vs/workbench/test/browser/workbenchTestServices", "vs/base/test/common/utils", "vs/editor/common/model/textModel", "vs/base/common/cancellation", "vs/base/common/buffer", "vs/base/common/lifecycle"], function (require, exports, assert, textFileEditorModel_1, workbenchTestServices_1, utils_1, textModel_1, cancellation_1, buffer_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Files - TextFileEditorModel (integration)', () => {
        const disposables = new lifecycle_1.$jc();
        let instantiationService;
        let accessor;
        let content;
        setup(() => {
            instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            accessor = instantiationService.createInstance(workbenchTestServices_1.$mec);
            content = accessor.fileService.getContent();
            disposables.add((0, lifecycle_1.$ic)(() => accessor.fileService.setContent(content)));
            disposables.add(accessor.textFileService.files);
        });
        teardown(() => {
            disposables.clear();
        });
        test('backup and restore (simple)', async function () {
            return testBackupAndRestore(utils_1.$0S.call(this, '/path/index_async.txt'), utils_1.$0S.call(this, '/path/index_async2.txt'), 'Some very small file text content.');
        });
        test('backup and restore (large, #121347)', async function () {
            const largeContent = '국어한\n'.repeat(100000);
            return testBackupAndRestore(utils_1.$0S.call(this, '/path/index_async.txt'), utils_1.$0S.call(this, '/path/index_async2.txt'), largeContent);
        });
        async function testBackupAndRestore(resourceA, resourceB, contents) {
            const originalModel = disposables.add(instantiationService.createInstance(textFileEditorModel_1.$Hyb, resourceA, 'utf8', undefined));
            await originalModel.resolve({
                contents: await (0, textModel_1.$JC)(await accessor.textFileService.getDecodedStream(resourceA, (0, buffer_1.$Td)(buffer_1.$Fd.fromString(contents))))
            });
            assert.strictEqual(originalModel.textEditorModel?.getValue(), contents);
            const backup = await originalModel.backup(cancellation_1.CancellationToken.None);
            const modelRestoredIdentifier = { typeId: originalModel.typeId, resource: resourceB };
            await accessor.workingCopyBackupService.backup(modelRestoredIdentifier, backup.content);
            const modelRestored = disposables.add(instantiationService.createInstance(textFileEditorModel_1.$Hyb, modelRestoredIdentifier.resource, 'utf8', undefined));
            await modelRestored.resolve();
            assert.strictEqual(modelRestored.textEditorModel?.getValue(), contents);
            assert.strictEqual(modelRestored.isDirty(), true);
        }
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=textFileEditorModel.integrationTest.js.map