/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/services/untitled/common/untitledTextEditorInput", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/base/test/common/utils"], function (require, exports, assert, workbenchTestServices_1, untitledTextEditorInput_1, cancellation_1, lifecycle_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Untitled text editors', () => {
        const disposables = new lifecycle_1.$jc();
        let instantiationService;
        let accessor;
        setup(() => {
            instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            accessor = instantiationService.createInstance(workbenchTestServices_1.$mec);
            disposables.add(accessor.untitledTextEditorService);
        });
        teardown(() => {
            disposables.clear();
        });
        test('backup and restore (simple)', async function () {
            return testBackupAndRestore('Some very small file text content.');
        });
        test('backup and restore (large, #121347)', async function () {
            const largeContent = '국어한\n'.repeat(100000);
            return testBackupAndRestore(largeContent);
        });
        async function testBackupAndRestore(content) {
            const service = accessor.untitledTextEditorService;
            const originalInput = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.$Bvb, service.create()));
            const restoredInput = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.$Bvb, service.create()));
            const originalModel = disposables.add(await originalInput.resolve());
            originalModel.textEditorModel?.setValue(content);
            const backup = await originalModel.backup(cancellation_1.CancellationToken.None);
            const modelRestoredIdentifier = { typeId: originalModel.typeId, resource: restoredInput.resource };
            await accessor.workingCopyBackupService.backup(modelRestoredIdentifier, backup.content);
            const restoredModel = disposables.add(await restoredInput.resolve());
            assert.strictEqual(restoredModel.textEditorModel?.getValue(), content);
            assert.strictEqual(restoredModel.isDirty(), true);
        }
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=untitledTextEditor.integrationTest.js.map