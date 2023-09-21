/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/services/textfile/common/textFileEditorModel", "vs/base/test/common/utils", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/test/common/workbenchTestServices", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/async", "vs/base/common/lifecycle"], function (require, exports, assert, textFileEditorModel_1, utils_1, workbenchTestServices_1, workbenchTestServices_2, buffer_1, cancellation_1, async_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('WorkingCopyFileService', () => {
        const disposables = new lifecycle_1.$jc();
        let instantiationService;
        let accessor;
        setup(() => {
            instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            accessor = instantiationService.createInstance(workbenchTestServices_1.$mec);
            disposables.add(accessor.textFileService.files);
        });
        teardown(() => {
            disposables.clear();
        });
        test('create - dirty file', async function () {
            await testCreate(utils_1.$0S.call(this, '/path/file.txt'), buffer_1.$Fd.fromString('Hello World'));
        });
        test('delete - dirty file', async function () {
            await testDelete([utils_1.$0S.call(this, '/path/file.txt')]);
        });
        test('delete multiple - dirty files', async function () {
            await testDelete([
                utils_1.$0S.call(this, '/path/file1.txt'),
                utils_1.$0S.call(this, '/path/file2.txt'),
                utils_1.$0S.call(this, '/path/file3.txt'),
                utils_1.$0S.call(this, '/path/file4.txt')
            ]);
        });
        test('move - dirty file', async function () {
            await testMoveOrCopy([{ source: utils_1.$0S.call(this, '/path/file.txt'), target: utils_1.$0S.call(this, '/path/file_target.txt') }], true);
        });
        test('move - source identical to target', async function () {
            const sourceModel = instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/file.txt'), 'utf8', undefined);
            accessor.textFileService.files.add(sourceModel.resource, sourceModel);
            const eventCounter = await testEventsMoveOrCopy([{ file: { source: sourceModel.resource, target: sourceModel.resource }, overwrite: true }], true);
            sourceModel.dispose();
            assert.strictEqual(eventCounter, 3);
        });
        test('move - one source == target and another source != target', async function () {
            const sourceModel1 = instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/file1.txt'), 'utf8', undefined);
            const sourceModel2 = instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/file2.txt'), 'utf8', undefined);
            const targetModel2 = instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/file_target2.txt'), 'utf8', undefined);
            accessor.textFileService.files.add(sourceModel1.resource, sourceModel1);
            accessor.textFileService.files.add(sourceModel2.resource, sourceModel2);
            accessor.textFileService.files.add(targetModel2.resource, targetModel2);
            const eventCounter = await testEventsMoveOrCopy([
                { file: { source: sourceModel1.resource, target: sourceModel1.resource }, overwrite: true },
                { file: { source: sourceModel2.resource, target: targetModel2.resource }, overwrite: true }
            ], true);
            sourceModel1.dispose();
            sourceModel2.dispose();
            targetModel2.dispose();
            assert.strictEqual(eventCounter, 3);
        });
        test('move multiple - dirty file', async function () {
            await testMoveOrCopy([
                { source: utils_1.$0S.call(this, '/path/file1.txt'), target: utils_1.$0S.call(this, '/path/file1_target.txt') },
                { source: utils_1.$0S.call(this, '/path/file2.txt'), target: utils_1.$0S.call(this, '/path/file2_target.txt') }
            ], true);
        });
        test('move - dirty file (target exists and is dirty)', async function () {
            await testMoveOrCopy([{ source: utils_1.$0S.call(this, '/path/file.txt'), target: utils_1.$0S.call(this, '/path/file_target.txt') }], true, true);
        });
        test('copy - dirty file', async function () {
            await testMoveOrCopy([{ source: utils_1.$0S.call(this, '/path/file.txt'), target: utils_1.$0S.call(this, '/path/file_target.txt') }], false);
        });
        test('copy - source identical to target', async function () {
            const sourceModel = instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/file.txt'), 'utf8', undefined);
            accessor.textFileService.files.add(sourceModel.resource, sourceModel);
            const eventCounter = await testEventsMoveOrCopy([{ file: { source: sourceModel.resource, target: sourceModel.resource }, overwrite: true }]);
            sourceModel.dispose();
            assert.strictEqual(eventCounter, 3);
        });
        test('copy - one source == target and another source != target', async function () {
            const sourceModel1 = instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/file1.txt'), 'utf8', undefined);
            const sourceModel2 = instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/file2.txt'), 'utf8', undefined);
            const targetModel2 = instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/file_target2.txt'), 'utf8', undefined);
            accessor.textFileService.files.add(sourceModel1.resource, sourceModel1);
            accessor.textFileService.files.add(sourceModel2.resource, sourceModel2);
            accessor.textFileService.files.add(targetModel2.resource, targetModel2);
            const eventCounter = await testEventsMoveOrCopy([
                { file: { source: sourceModel1.resource, target: sourceModel1.resource }, overwrite: true },
                { file: { source: sourceModel2.resource, target: targetModel2.resource }, overwrite: true }
            ]);
            sourceModel1.dispose();
            sourceModel2.dispose();
            targetModel2.dispose();
            assert.strictEqual(eventCounter, 3);
        });
        test('copy multiple - dirty file', async function () {
            await testMoveOrCopy([
                { source: utils_1.$0S.call(this, '/path/file1.txt'), target: utils_1.$0S.call(this, '/path/file_target1.txt') },
                { source: utils_1.$0S.call(this, '/path/file2.txt'), target: utils_1.$0S.call(this, '/path/file_target2.txt') },
                { source: utils_1.$0S.call(this, '/path/file3.txt'), target: utils_1.$0S.call(this, '/path/file_target3.txt') }
            ], false);
        });
        test('copy - dirty file (target exists and is dirty)', async function () {
            await testMoveOrCopy([{ source: utils_1.$0S.call(this, '/path/file.txt'), target: utils_1.$0S.call(this, '/path/file_target.txt') }], false, true);
        });
        test('getDirty', async function () {
            const model1 = instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/file-1.txt'), 'utf8', undefined);
            accessor.textFileService.files.add(model1.resource, model1);
            const model2 = instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/file-2.txt'), 'utf8', undefined);
            accessor.textFileService.files.add(model2.resource, model2);
            let dirty = accessor.workingCopyFileService.getDirty(model1.resource);
            assert.strictEqual(dirty.length, 0);
            await model1.resolve();
            model1.textEditorModel.setValue('foo');
            dirty = accessor.workingCopyFileService.getDirty(model1.resource);
            assert.strictEqual(dirty.length, 1);
            assert.strictEqual(dirty[0], model1);
            dirty = accessor.workingCopyFileService.getDirty(utils_1.$0S.call(this, '/path'));
            assert.strictEqual(dirty.length, 1);
            assert.strictEqual(dirty[0], model1);
            await model2.resolve();
            model2.textEditorModel.setValue('bar');
            dirty = accessor.workingCopyFileService.getDirty(utils_1.$0S.call(this, '/path'));
            assert.strictEqual(dirty.length, 2);
            model1.dispose();
            model2.dispose();
        });
        test('registerWorkingCopyProvider', async function () {
            const model1 = disposables.add(instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/file-1.txt'), 'utf8', undefined));
            accessor.textFileService.files.add(model1.resource, model1);
            await model1.resolve();
            model1.textEditorModel.setValue('foo');
            const testWorkingCopy = disposables.add(new workbenchTestServices_2.$9dc(utils_1.$0S.call(this, '/path/file-2.txt'), true));
            const registration = accessor.workingCopyFileService.registerWorkingCopyProvider(() => {
                return [model1, testWorkingCopy];
            });
            let dirty = accessor.workingCopyFileService.getDirty(model1.resource);
            assert.strictEqual(dirty.length, 2, 'Should return default working copy + working copy from provider');
            assert.strictEqual(dirty[0], model1);
            assert.strictEqual(dirty[1], testWorkingCopy);
            registration.dispose();
            dirty = accessor.workingCopyFileService.getDirty(model1.resource);
            assert.strictEqual(dirty.length, 1, 'Should have unregistered our provider');
            assert.strictEqual(dirty[0], model1);
        });
        test('createFolder', async function () {
            let eventCounter = 0;
            let correlationId = undefined;
            const resource = utils_1.$0S.call(this, '/path/folder');
            disposables.add(accessor.workingCopyFileService.addFileOperationParticipant({
                participate: async (files, operation) => {
                    assert.strictEqual(files.length, 1);
                    const file = files[0];
                    assert.strictEqual(file.target.toString(), resource.toString());
                    assert.strictEqual(operation, 0 /* FileOperation.CREATE */);
                    eventCounter++;
                }
            }));
            disposables.add(accessor.workingCopyFileService.onWillRunWorkingCopyFileOperation(e => {
                assert.strictEqual(e.files.length, 1);
                const file = e.files[0];
                assert.strictEqual(file.target.toString(), resource.toString());
                assert.strictEqual(e.operation, 0 /* FileOperation.CREATE */);
                correlationId = e.correlationId;
                eventCounter++;
            }));
            disposables.add(accessor.workingCopyFileService.onDidRunWorkingCopyFileOperation(e => {
                assert.strictEqual(e.files.length, 1);
                const file = e.files[0];
                assert.strictEqual(file.target.toString(), resource.toString());
                assert.strictEqual(e.operation, 0 /* FileOperation.CREATE */);
                assert.strictEqual(e.correlationId, correlationId);
                eventCounter++;
            }));
            await accessor.workingCopyFileService.createFolder([{ resource }], cancellation_1.CancellationToken.None);
            assert.strictEqual(eventCounter, 3);
        });
        test('cancellation of participants', async function () {
            const resource = utils_1.$0S.call(this, '/path/folder');
            let canceled = false;
            disposables.add(accessor.workingCopyFileService.addFileOperationParticipant({
                participate: async (files, operation, info, t, token) => {
                    await (0, async_1.$Hg)(0);
                    canceled = token.isCancellationRequested;
                }
            }));
            // Create
            let cts = new cancellation_1.$pd();
            let promise = accessor.workingCopyFileService.create([{ resource }], cts.token);
            cts.cancel();
            await promise;
            assert.strictEqual(canceled, true);
            canceled = false;
            // Create Folder
            cts = new cancellation_1.$pd();
            promise = accessor.workingCopyFileService.createFolder([{ resource }], cts.token);
            cts.cancel();
            await promise;
            assert.strictEqual(canceled, true);
            canceled = false;
            // Move
            cts = new cancellation_1.$pd();
            promise = accessor.workingCopyFileService.move([{ file: { source: resource, target: resource } }], cts.token);
            cts.cancel();
            await promise;
            assert.strictEqual(canceled, true);
            canceled = false;
            // Copy
            cts = new cancellation_1.$pd();
            promise = accessor.workingCopyFileService.copy([{ file: { source: resource, target: resource } }], cts.token);
            cts.cancel();
            await promise;
            assert.strictEqual(canceled, true);
            canceled = false;
            // Delete
            cts = new cancellation_1.$pd();
            promise = accessor.workingCopyFileService.delete([{ resource }], cts.token);
            cts.cancel();
            await promise;
            assert.strictEqual(canceled, true);
            canceled = false;
        });
        async function testEventsMoveOrCopy(files, move) {
            let eventCounter = 0;
            const participant = accessor.workingCopyFileService.addFileOperationParticipant({
                participate: async (files) => {
                    eventCounter++;
                }
            });
            const listener1 = accessor.workingCopyFileService.onWillRunWorkingCopyFileOperation(e => {
                eventCounter++;
            });
            const listener2 = accessor.workingCopyFileService.onDidRunWorkingCopyFileOperation(e => {
                eventCounter++;
            });
            if (move) {
                await accessor.workingCopyFileService.move(files, cancellation_1.CancellationToken.None);
            }
            else {
                await accessor.workingCopyFileService.copy(files, cancellation_1.CancellationToken.None);
            }
            participant.dispose();
            listener1.dispose();
            listener2.dispose();
            return eventCounter;
        }
        async function testMoveOrCopy(files, move, targetDirty) {
            let eventCounter = 0;
            const models = await Promise.all(files.map(async ({ source, target }, i) => {
                const sourceModel = instantiationService.createInstance(textFileEditorModel_1.$Hyb, source, 'utf8', undefined);
                const targetModel = instantiationService.createInstance(textFileEditorModel_1.$Hyb, target, 'utf8', undefined);
                accessor.textFileService.files.add(sourceModel.resource, sourceModel);
                accessor.textFileService.files.add(targetModel.resource, targetModel);
                await sourceModel.resolve();
                sourceModel.textEditorModel.setValue('foo' + i);
                assert.ok(accessor.textFileService.isDirty(sourceModel.resource));
                if (targetDirty) {
                    await targetModel.resolve();
                    targetModel.textEditorModel.setValue('bar' + i);
                    assert.ok(accessor.textFileService.isDirty(targetModel.resource));
                }
                return { sourceModel, targetModel };
            }));
            const participant = accessor.workingCopyFileService.addFileOperationParticipant({
                participate: async (files, operation) => {
                    for (let i = 0; i < files.length; i++) {
                        const { target, source } = files[i];
                        const { targetModel, sourceModel } = models[i];
                        assert.strictEqual(target.toString(), targetModel.resource.toString());
                        assert.strictEqual(source?.toString(), sourceModel.resource.toString());
                    }
                    eventCounter++;
                    assert.strictEqual(operation, move ? 2 /* FileOperation.MOVE */ : 3 /* FileOperation.COPY */);
                }
            });
            let correlationId;
            const listener1 = accessor.workingCopyFileService.onWillRunWorkingCopyFileOperation(e => {
                for (let i = 0; i < e.files.length; i++) {
                    const { target, source } = files[i];
                    const { targetModel, sourceModel } = models[i];
                    assert.strictEqual(target.toString(), targetModel.resource.toString());
                    assert.strictEqual(source?.toString(), sourceModel.resource.toString());
                }
                eventCounter++;
                correlationId = e.correlationId;
                assert.strictEqual(e.operation, move ? 2 /* FileOperation.MOVE */ : 3 /* FileOperation.COPY */);
            });
            const listener2 = accessor.workingCopyFileService.onDidRunWorkingCopyFileOperation(e => {
                for (let i = 0; i < e.files.length; i++) {
                    const { target, source } = files[i];
                    const { targetModel, sourceModel } = models[i];
                    assert.strictEqual(target.toString(), targetModel.resource.toString());
                    assert.strictEqual(source?.toString(), sourceModel.resource.toString());
                }
                eventCounter++;
                assert.strictEqual(e.operation, move ? 2 /* FileOperation.MOVE */ : 3 /* FileOperation.COPY */);
                assert.strictEqual(e.correlationId, correlationId);
            });
            if (move) {
                await accessor.workingCopyFileService.move(models.map(model => ({ file: { source: model.sourceModel.resource, target: model.targetModel.resource }, options: { overwrite: true } })), cancellation_1.CancellationToken.None);
            }
            else {
                await accessor.workingCopyFileService.copy(models.map(model => ({ file: { source: model.sourceModel.resource, target: model.targetModel.resource }, options: { overwrite: true } })), cancellation_1.CancellationToken.None);
            }
            for (let i = 0; i < models.length; i++) {
                const { sourceModel, targetModel } = models[i];
                assert.strictEqual(targetModel.textEditorModel.getValue(), 'foo' + i);
                if (move) {
                    assert.ok(!accessor.textFileService.isDirty(sourceModel.resource));
                }
                else {
                    assert.ok(accessor.textFileService.isDirty(sourceModel.resource));
                }
                assert.ok(accessor.textFileService.isDirty(targetModel.resource));
                sourceModel.dispose();
                targetModel.dispose();
            }
            assert.strictEqual(eventCounter, 3);
            participant.dispose();
            listener1.dispose();
            listener2.dispose();
        }
        async function testDelete(resources) {
            const models = await Promise.all(resources.map(async (resource) => {
                const model = instantiationService.createInstance(textFileEditorModel_1.$Hyb, resource, 'utf8', undefined);
                accessor.textFileService.files.add(model.resource, model);
                await model.resolve();
                model.textEditorModel.setValue('foo');
                assert.ok(accessor.workingCopyService.isDirty(model.resource));
                return model;
            }));
            let eventCounter = 0;
            let correlationId = undefined;
            const participant = accessor.workingCopyFileService.addFileOperationParticipant({
                participate: async (files, operation) => {
                    for (let i = 0; i < models.length; i++) {
                        const model = models[i];
                        const file = files[i];
                        assert.strictEqual(file.target.toString(), model.resource.toString());
                    }
                    assert.strictEqual(operation, 1 /* FileOperation.DELETE */);
                    eventCounter++;
                }
            });
            const listener1 = accessor.workingCopyFileService.onWillRunWorkingCopyFileOperation(e => {
                for (let i = 0; i < models.length; i++) {
                    const model = models[i];
                    const file = e.files[i];
                    assert.strictEqual(file.target.toString(), model.resource.toString());
                }
                assert.strictEqual(e.operation, 1 /* FileOperation.DELETE */);
                correlationId = e.correlationId;
                eventCounter++;
            });
            const listener2 = accessor.workingCopyFileService.onDidRunWorkingCopyFileOperation(e => {
                for (let i = 0; i < models.length; i++) {
                    const model = models[i];
                    const file = e.files[i];
                    assert.strictEqual(file.target.toString(), model.resource.toString());
                }
                assert.strictEqual(e.operation, 1 /* FileOperation.DELETE */);
                assert.strictEqual(e.correlationId, correlationId);
                eventCounter++;
            });
            await accessor.workingCopyFileService.delete(models.map(model => ({ resource: model.resource })), cancellation_1.CancellationToken.None);
            for (const model of models) {
                assert.ok(!accessor.workingCopyService.isDirty(model.resource));
                model.dispose();
            }
            assert.strictEqual(eventCounter, 3);
            participant.dispose();
            listener1.dispose();
            listener2.dispose();
        }
        async function testCreate(resource, contents) {
            const model = instantiationService.createInstance(textFileEditorModel_1.$Hyb, resource, 'utf8', undefined);
            accessor.textFileService.files.add(model.resource, model);
            await model.resolve();
            model.textEditorModel.setValue('foo');
            assert.ok(accessor.workingCopyService.isDirty(model.resource));
            let eventCounter = 0;
            let correlationId = undefined;
            disposables.add(accessor.workingCopyFileService.addFileOperationParticipant({
                participate: async (files, operation) => {
                    assert.strictEqual(files.length, 1);
                    const file = files[0];
                    assert.strictEqual(file.target.toString(), model.resource.toString());
                    assert.strictEqual(operation, 0 /* FileOperation.CREATE */);
                    eventCounter++;
                }
            }));
            disposables.add(accessor.workingCopyFileService.onWillRunWorkingCopyFileOperation(e => {
                assert.strictEqual(e.files.length, 1);
                const file = e.files[0];
                assert.strictEqual(file.target.toString(), model.resource.toString());
                assert.strictEqual(e.operation, 0 /* FileOperation.CREATE */);
                correlationId = e.correlationId;
                eventCounter++;
            }));
            disposables.add(accessor.workingCopyFileService.onDidRunWorkingCopyFileOperation(e => {
                assert.strictEqual(e.files.length, 1);
                const file = e.files[0];
                assert.strictEqual(file.target.toString(), model.resource.toString());
                assert.strictEqual(e.operation, 0 /* FileOperation.CREATE */);
                assert.strictEqual(e.correlationId, correlationId);
                eventCounter++;
            }));
            await accessor.workingCopyFileService.create([{ resource, contents }], cancellation_1.CancellationToken.None);
            assert.ok(!accessor.workingCopyService.isDirty(model.resource));
            model.dispose();
            assert.strictEqual(eventCounter, 3);
        }
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=workingCopyFileService.test.js.map