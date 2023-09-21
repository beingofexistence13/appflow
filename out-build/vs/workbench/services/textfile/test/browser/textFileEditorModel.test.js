/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/services/textfile/common/textFileEditorModel", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/test/browser/workbenchTestServices", "vs/base/test/common/utils", "vs/platform/files/common/files", "vs/base/common/async", "vs/base/common/types", "vs/editor/common/model/textModel", "vs/base/common/lifecycle", "vs/workbench/common/editor", "vs/base/common/resources", "vs/workbench/services/textfile/common/encoding", "vs/base/common/platform"], function (require, exports, assert, textFileEditorModel_1, textfiles_1, workbenchTestServices_1, utils_1, files_1, async_1, types_1, textModel_1, lifecycle_1, editor_1, resources_1, encoding_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Files - TextFileEditorModel', () => {
        function getLastModifiedTime(model) {
            const stat = (0, workbenchTestServices_1.$6ec)(model);
            return stat ? stat.mtime : -1;
        }
        const disposables = new lifecycle_1.$jc();
        let instantiationService;
        let accessor;
        let content;
        setup(() => {
            instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            accessor = instantiationService.createInstance(workbenchTestServices_1.$mec);
            content = accessor.fileService.getContent();
            disposables.add(accessor.textFileService.files);
            disposables.add((0, lifecycle_1.$ic)(() => accessor.fileService.setContent(content)));
        });
        teardown(async () => {
            for (const textFileEditorModel of accessor.textFileService.files.models) {
                textFileEditorModel.dispose();
            }
            disposables.clear();
        });
        test('basic events', async function () {
            const model = disposables.add(instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/index_async.txt'), 'utf8', undefined));
            accessor.workingCopyService.testUnregisterWorkingCopy(model); // causes issues with subsequent resolves otherwise
            let onDidResolveCounter = 0;
            disposables.add(model.onDidResolve(() => onDidResolveCounter++));
            await model.resolve();
            assert.strictEqual(onDidResolveCounter, 1);
            let onDidChangeContentCounter = 0;
            disposables.add(model.onDidChangeContent(() => onDidChangeContentCounter++));
            let onDidChangeDirtyCounter = 0;
            disposables.add(model.onDidChangeDirty(() => onDidChangeDirtyCounter++));
            model.updateTextEditorModel((0, textModel_1.$IC)('bar'));
            assert.strictEqual(onDidChangeContentCounter, 1);
            assert.strictEqual(onDidChangeDirtyCounter, 1);
            model.updateTextEditorModel((0, textModel_1.$IC)('foo'));
            assert.strictEqual(onDidChangeContentCounter, 2);
            assert.strictEqual(onDidChangeDirtyCounter, 1);
            await model.revert();
            assert.strictEqual(onDidChangeDirtyCounter, 2);
        });
        test('isTextFileEditorModel', async function () {
            const model = instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/index_async.txt'), 'utf8', undefined);
            assert.strictEqual((0, textfiles_1.$LD)(model), true);
            model.dispose();
        });
        test('save', async function () {
            const model = instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/index_async.txt'), 'utf8', undefined);
            await model.resolve();
            assert.strictEqual(accessor.workingCopyService.dirtyCount, 0);
            let savedEvent = undefined;
            disposables.add(model.onDidSave(e => savedEvent = e));
            await model.save();
            assert.ok(!savedEvent);
            model.updateTextEditorModel((0, textModel_1.$IC)('bar'));
            assert.ok(getLastModifiedTime(model) <= Date.now());
            assert.ok(model.hasState(1 /* TextFileEditorModelState.DIRTY */));
            assert.ok(model.isModified());
            assert.strictEqual(accessor.workingCopyService.dirtyCount, 1);
            assert.strictEqual(accessor.workingCopyService.isDirty(model.resource, model.typeId), true);
            let workingCopyEvent = false;
            disposables.add(accessor.workingCopyService.onDidChangeDirty(e => {
                if (e.resource.toString() === model.resource.toString()) {
                    workingCopyEvent = true;
                }
            }));
            const source = editor_1.$SE.registerSource('testSource', 'Hello Save');
            const pendingSave = model.save({ reason: 2 /* SaveReason.AUTO */, source });
            assert.ok(model.hasState(2 /* TextFileEditorModelState.PENDING_SAVE */));
            await Promise.all([pendingSave, model.joinState(2 /* TextFileEditorModelState.PENDING_SAVE */)]);
            assert.ok(model.hasState(0 /* TextFileEditorModelState.SAVED */));
            assert.ok(!model.isDirty());
            assert.ok(!model.isModified());
            assert.ok(savedEvent);
            assert.ok(savedEvent.stat);
            assert.strictEqual(savedEvent.reason, 2 /* SaveReason.AUTO */);
            assert.strictEqual(savedEvent.source, source);
            assert.ok(workingCopyEvent);
            assert.strictEqual(accessor.workingCopyService.dirtyCount, 0);
            assert.strictEqual(accessor.workingCopyService.isDirty(model.resource, model.typeId), false);
            savedEvent = undefined;
            await model.save({ force: true });
            assert.ok(savedEvent);
            model.dispose();
            assert.ok(!accessor.modelService.getModel(model.resource));
        });
        test('save - touching also emits saved event', async function () {
            const model = instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/index_async.txt'), 'utf8', undefined);
            await model.resolve();
            let savedEvent = false;
            disposables.add(model.onDidSave(() => savedEvent = true));
            let workingCopyEvent = false;
            disposables.add(accessor.workingCopyService.onDidChangeDirty(e => {
                if (e.resource.toString() === model.resource.toString()) {
                    workingCopyEvent = true;
                }
            }));
            await model.save({ force: true });
            assert.ok(savedEvent);
            assert.ok(!workingCopyEvent);
            model.dispose();
            assert.ok(!accessor.modelService.getModel(model.resource));
        });
        test('save - touching with error turns model dirty', async function () {
            const model = instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/index_async.txt'), 'utf8', undefined);
            await model.resolve();
            let saveErrorEvent = false;
            disposables.add(model.onDidSaveError(() => saveErrorEvent = true));
            let savedEvent = false;
            disposables.add(model.onDidSave(() => savedEvent = true));
            accessor.fileService.writeShouldThrowError = new Error('failed to write');
            try {
                await model.save({ force: true });
                assert.ok(model.hasState(5 /* TextFileEditorModelState.ERROR */));
                assert.ok(model.isDirty());
                assert.ok(model.isModified());
                assert.ok(saveErrorEvent);
                assert.strictEqual(accessor.workingCopyService.dirtyCount, 1);
                assert.strictEqual(accessor.workingCopyService.isDirty(model.resource, model.typeId), true);
            }
            finally {
                accessor.fileService.writeShouldThrowError = undefined;
            }
            await model.save({ force: true });
            assert.ok(savedEvent);
            assert.strictEqual(model.isDirty(), false);
            model.dispose();
            assert.ok(!accessor.modelService.getModel(model.resource));
        });
        test('save - returns false when save fails', async function () {
            const model = instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/index_async.txt'), 'utf8', undefined);
            await model.resolve();
            accessor.fileService.writeShouldThrowError = new Error('failed to write');
            try {
                const res = await model.save({ force: true });
                assert.strictEqual(res, false);
            }
            finally {
                accessor.fileService.writeShouldThrowError = undefined;
            }
            const res = await model.save({ force: true });
            assert.strictEqual(res, true);
            model.dispose();
            assert.ok(!accessor.modelService.getModel(model.resource));
        });
        test('save error (generic)', async function () {
            const model = instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/index_async.txt'), 'utf8', undefined);
            await model.resolve();
            model.updateTextEditorModel((0, textModel_1.$IC)('bar'));
            let saveErrorEvent = false;
            disposables.add(model.onDidSaveError(() => saveErrorEvent = true));
            accessor.fileService.writeShouldThrowError = new Error('failed to write');
            try {
                const pendingSave = model.save();
                assert.ok(model.hasState(2 /* TextFileEditorModelState.PENDING_SAVE */));
                await pendingSave;
                assert.ok(model.hasState(5 /* TextFileEditorModelState.ERROR */));
                assert.ok(model.isDirty());
                assert.ok(model.isModified());
                assert.ok(saveErrorEvent);
                assert.strictEqual(accessor.workingCopyService.dirtyCount, 1);
                assert.strictEqual(accessor.workingCopyService.isDirty(model.resource, model.typeId), true);
                model.dispose();
            }
            finally {
                accessor.fileService.writeShouldThrowError = undefined;
            }
        });
        test('save error (conflict)', async function () {
            const model = instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/index_async.txt'), 'utf8', undefined);
            await model.resolve();
            model.updateTextEditorModel((0, textModel_1.$IC)('bar'));
            let saveErrorEvent = false;
            disposables.add(model.onDidSaveError(() => saveErrorEvent = true));
            accessor.fileService.writeShouldThrowError = new files_1.$nk('save conflict', 3 /* FileOperationResult.FILE_MODIFIED_SINCE */);
            try {
                const pendingSave = model.save();
                assert.ok(model.hasState(2 /* TextFileEditorModelState.PENDING_SAVE */));
                await pendingSave;
                assert.ok(model.hasState(3 /* TextFileEditorModelState.CONFLICT */));
                assert.ok(model.isDirty());
                assert.ok(model.isModified());
                assert.ok(saveErrorEvent);
                assert.strictEqual(accessor.workingCopyService.dirtyCount, 1);
                assert.strictEqual(accessor.workingCopyService.isDirty(model.resource, model.typeId), true);
                model.dispose();
            }
            finally {
                accessor.fileService.writeShouldThrowError = undefined;
            }
        });
        test('setEncoding - encode', async function () {
            const model = disposables.add(instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/index_async.txt'), 'utf8', undefined));
            let encodingEvent = false;
            disposables.add(model.onDidChangeEncoding(() => encodingEvent = true));
            await model.setEncoding('utf8', 0 /* EncodingMode.Encode */); // no-op
            assert.strictEqual(getLastModifiedTime(model), -1);
            assert.ok(!encodingEvent);
            await model.setEncoding('utf16', 0 /* EncodingMode.Encode */);
            assert.ok(encodingEvent);
            assert.ok(getLastModifiedTime(model) <= Date.now()); // indicates model was saved due to encoding change
        });
        test('setEncoding - decode', async function () {
            let model = disposables.add(instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/index_async.txt'), 'utf8', undefined));
            accessor.workingCopyService.testUnregisterWorkingCopy(model); // causes issues with subsequent resolves otherwise
            await model.setEncoding('utf16', 1 /* EncodingMode.Decode */);
            // we have to get the model again from working copy service
            // because `setEncoding` will resolve it again through the
            // text file service which is outside our scope
            model = accessor.workingCopyService.get(model);
            assert.ok(model.isResolved()); // model got resolved due to decoding
        });
        test('setEncoding - decode dirty file saves first', async function () {
            const model = disposables.add(instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/index_async.txt'), 'utf8', undefined));
            accessor.workingCopyService.testUnregisterWorkingCopy(model); // causes issues with subsequent resolves otherwise
            await model.resolve();
            model.updateTextEditorModel((0, textModel_1.$IC)('bar'));
            assert.strictEqual(model.isDirty(), true);
            await model.setEncoding('utf16', 1 /* EncodingMode.Decode */);
            assert.strictEqual(model.isDirty(), false);
        });
        test('encoding updates with language based configuration', async function () {
            const languageId = 'text-file-model-test';
            disposables.add(accessor.languageService.registerLanguage({
                id: languageId,
            }));
            accessor.testConfigurationService.setOverrideIdentifiers('files.encoding', [languageId]);
            const model = disposables.add(instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/index_async.txt'), 'utf8', undefined));
            accessor.workingCopyService.testUnregisterWorkingCopy(model); // causes issues with subsequent resolves otherwise
            await model.resolve();
            const deferredPromise = new async_1.$2g();
            // We use this listener as a way to figure out that the working
            // copy was resolved again as part of the language change
            disposables.add(accessor.workingCopyService.onDidRegister(e => {
                if ((0, resources_1.$bg)(e.resource, model.resource)) {
                    deferredPromise.complete(model);
                }
            }));
            accessor.testConfigurationService.setUserConfiguration('files.encoding', encoding_1.$dD);
            model.setLanguageId(languageId);
            await deferredPromise.p;
            assert.strictEqual(model.getEncoding(), encoding_1.$dD);
        });
        test('create with language', async function () {
            const languageId = 'text-file-model-test';
            disposables.add(accessor.languageService.registerLanguage({
                id: languageId,
            }));
            const model = instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/index_async.txt'), 'utf8', languageId);
            await model.resolve();
            assert.strictEqual(model.textEditorModel.getLanguageId(), languageId);
            model.dispose();
            assert.ok(!accessor.modelService.getModel(model.resource));
        });
        test('disposes when underlying model is destroyed', async function () {
            const model = instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/index_async.txt'), 'utf8', undefined);
            await model.resolve();
            model.textEditorModel.dispose();
            assert.ok(model.isDisposed());
        });
        test('Resolve does not trigger save', async function () {
            const model = instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/index.txt'), 'utf8', undefined);
            assert.ok(model.hasState(0 /* TextFileEditorModelState.SAVED */));
            disposables.add(model.onDidSave(() => assert.fail()));
            disposables.add(model.onDidChangeDirty(() => assert.fail()));
            await model.resolve();
            assert.ok(model.isResolved());
            model.dispose();
            assert.ok(!accessor.modelService.getModel(model.resource));
        });
        test('Resolve returns dirty model as long as model is dirty', async function () {
            const model = disposables.add(instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/index_async.txt'), 'utf8', undefined));
            await model.resolve();
            model.updateTextEditorModel((0, textModel_1.$IC)('foo'));
            assert.ok(model.isDirty());
            assert.ok(model.hasState(1 /* TextFileEditorModelState.DIRTY */));
            await model.resolve();
            assert.ok(model.isDirty());
        });
        test('Resolve with contents', async function () {
            const model = instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/index_async.txt'), 'utf8', undefined);
            await model.resolve({ contents: (0, textModel_1.$IC)('Hello World') });
            assert.strictEqual(model.textEditorModel?.getValue(), 'Hello World');
            assert.strictEqual(model.isDirty(), true);
            await model.resolve({ contents: (0, textModel_1.$IC)('Hello Changes') });
            assert.strictEqual(model.textEditorModel?.getValue(), 'Hello Changes');
            assert.strictEqual(model.isDirty(), true);
            // verify that we do not mark the model as saved when undoing once because
            // we never really had a saved state
            await model.textEditorModel.undo();
            assert.ok(model.isDirty());
            model.dispose();
            assert.ok(!accessor.modelService.getModel(model.resource));
        });
        test('Revert', async function () {
            let eventCounter = 0;
            let model = disposables.add(instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/index_async.txt'), 'utf8', undefined));
            disposables.add(model.onDidRevert(() => eventCounter++));
            let workingCopyEvent = false;
            disposables.add(accessor.workingCopyService.onDidChangeDirty(e => {
                if (e.resource.toString() === model.resource.toString()) {
                    workingCopyEvent = true;
                }
            }));
            await model.resolve();
            model.updateTextEditorModel((0, textModel_1.$IC)('foo'));
            assert.ok(model.isDirty());
            assert.ok(model.isModified());
            assert.strictEqual(accessor.workingCopyService.dirtyCount, 1);
            assert.strictEqual(accessor.workingCopyService.isDirty(model.resource, model.typeId), true);
            accessor.workingCopyService.testUnregisterWorkingCopy(model); // causes issues with subsequent resolves otherwise
            await model.revert();
            // we have to get the model again from working copy service
            // because `setEncoding` will resolve it again through the
            // text file service which is outside our scope
            model = accessor.workingCopyService.get(model);
            assert.strictEqual(model.isDirty(), false);
            assert.strictEqual(model.isModified(), false);
            assert.strictEqual(eventCounter, 1);
            assert.ok(workingCopyEvent);
            assert.strictEqual(accessor.workingCopyService.dirtyCount, 0);
            assert.strictEqual(accessor.workingCopyService.isDirty(model.resource, model.typeId), false);
        });
        test('Revert (soft)', async function () {
            let eventCounter = 0;
            const model = disposables.add(instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/index_async.txt'), 'utf8', undefined));
            disposables.add(model.onDidRevert(() => eventCounter++));
            let workingCopyEvent = false;
            disposables.add(accessor.workingCopyService.onDidChangeDirty(e => {
                if (e.resource.toString() === model.resource.toString()) {
                    workingCopyEvent = true;
                }
            }));
            await model.resolve();
            model.updateTextEditorModel((0, textModel_1.$IC)('foo'));
            assert.ok(model.isDirty());
            assert.ok(model.isModified());
            assert.strictEqual(accessor.workingCopyService.dirtyCount, 1);
            assert.strictEqual(accessor.workingCopyService.isDirty(model.resource, model.typeId), true);
            await model.revert({ soft: true });
            assert.strictEqual(model.isDirty(), false);
            assert.strictEqual(model.isModified(), false);
            assert.strictEqual(model.textEditorModel.getValue(), 'foo');
            assert.strictEqual(eventCounter, 1);
            assert.ok(workingCopyEvent);
            assert.strictEqual(accessor.workingCopyService.dirtyCount, 0);
            assert.strictEqual(accessor.workingCopyService.isDirty(model.resource, model.typeId), false);
        });
        test('Undo to saved state turns model non-dirty', async function () {
            const model = disposables.add(instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/index_async.txt'), 'utf8', undefined));
            await model.resolve();
            model.updateTextEditorModel((0, textModel_1.$IC)('Hello Text'));
            assert.ok(model.isDirty());
            await model.textEditorModel.undo();
            assert.ok(!model.isDirty());
        });
        test('Resolve and undo turns model dirty', async function () {
            const model = disposables.add(instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/index_async.txt'), 'utf8', undefined));
            await model.resolve();
            accessor.fileService.setContent('Hello Change');
            await model.resolve();
            await model.textEditorModel.undo();
            assert.ok(model.isDirty());
            assert.strictEqual(accessor.workingCopyService.dirtyCount, 1);
            assert.strictEqual(accessor.workingCopyService.isDirty(model.resource, model.typeId), true);
        });
        test('Update Dirty', async function () {
            let eventCounter = 0;
            const model = disposables.add(instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/index_async.txt'), 'utf8', undefined));
            model.setDirty(true);
            assert.ok(!model.isDirty()); // needs to be resolved
            await model.resolve();
            model.updateTextEditorModel((0, textModel_1.$IC)('foo'));
            assert.ok(model.isDirty());
            await model.revert({ soft: true });
            assert.strictEqual(model.isDirty(), false);
            disposables.add(model.onDidChangeDirty(() => eventCounter++));
            let workingCopyEvent = false;
            disposables.add(accessor.workingCopyService.onDidChangeDirty(e => {
                if (e.resource.toString() === model.resource.toString()) {
                    workingCopyEvent = true;
                }
            }));
            model.setDirty(true);
            assert.ok(model.isDirty());
            assert.strictEqual(eventCounter, 1);
            assert.ok(workingCopyEvent);
            model.setDirty(false);
            assert.strictEqual(model.isDirty(), false);
            assert.strictEqual(eventCounter, 2);
        });
        test('No Dirty or saving for readonly models', async function () {
            let workingCopyEvent = false;
            disposables.add(accessor.workingCopyService.onDidChangeDirty(e => {
                if (e.resource.toString() === model.resource.toString()) {
                    workingCopyEvent = true;
                }
            }));
            const model = disposables.add(instantiationService.createInstance(workbenchTestServices_1.$Tec, utils_1.$0S.call(this, '/path/index_async.txt'), 'utf8', undefined));
            let saveEvent = false;
            disposables.add(model.onDidSave(() => {
                saveEvent = true;
            }));
            await model.resolve();
            model.updateTextEditorModel((0, textModel_1.$IC)('foo'));
            assert.ok(!model.isDirty());
            await model.save({ force: true });
            assert.strictEqual(saveEvent, false);
            await model.revert({ soft: true });
            assert.ok(!model.isDirty());
            assert.ok(!workingCopyEvent);
        });
        test('File not modified error is handled gracefully', async function () {
            const model = disposables.add(instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/index_async.txt'), 'utf8', undefined));
            await model.resolve();
            const mtime = getLastModifiedTime(model);
            accessor.textFileService.setReadStreamErrorOnce(new files_1.$nk('error', 2 /* FileOperationResult.FILE_NOT_MODIFIED_SINCE */));
            await model.resolve();
            assert.ok(model);
            assert.strictEqual(getLastModifiedTime(model), mtime);
        });
        test('Resolve error is handled gracefully if model already exists', async function () {
            const model = disposables.add(instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/index_async.txt'), 'utf8', undefined));
            await model.resolve();
            accessor.textFileService.setReadStreamErrorOnce(new files_1.$nk('error', 1 /* FileOperationResult.FILE_NOT_FOUND */));
            await model.resolve();
            assert.ok(model);
        });
        test('save() and isDirty() - proper with check for mtimes', async function () {
            const input1 = disposables.add((0, workbenchTestServices_1.$hec)(instantiationService, utils_1.$0S.call(this, '/path/index_async2.txt')));
            const input2 = disposables.add((0, workbenchTestServices_1.$hec)(instantiationService, utils_1.$0S.call(this, '/path/index_async.txt')));
            const model1 = disposables.add(await input1.resolve());
            const model2 = disposables.add(await input2.resolve());
            model1.updateTextEditorModel((0, textModel_1.$IC)('foo'));
            const m1Mtime = (0, types_1.$uf)((0, workbenchTestServices_1.$6ec)(model1)).mtime;
            const m2Mtime = (0, types_1.$uf)((0, workbenchTestServices_1.$6ec)(model2)).mtime;
            assert.ok(m1Mtime > 0);
            assert.ok(m2Mtime > 0);
            assert.ok(accessor.textFileService.isDirty(utils_1.$0S.call(this, '/path/index_async2.txt')));
            assert.ok(!accessor.textFileService.isDirty(utils_1.$0S.call(this, '/path/index_async.txt')));
            model2.updateTextEditorModel((0, textModel_1.$IC)('foo'));
            assert.ok(accessor.textFileService.isDirty(utils_1.$0S.call(this, '/path/index_async.txt')));
            await (0, async_1.$Hg)(10);
            await accessor.textFileService.save(utils_1.$0S.call(this, '/path/index_async.txt'));
            await accessor.textFileService.save(utils_1.$0S.call(this, '/path/index_async2.txt'));
            assert.ok(!accessor.textFileService.isDirty(utils_1.$0S.call(this, '/path/index_async.txt')));
            assert.ok(!accessor.textFileService.isDirty(utils_1.$0S.call(this, '/path/index_async2.txt')));
            if (platform_1.$o) {
                // web tests does not ensure timeouts are respected at all, so we cannot
                // really assert the mtime to be different, only that it is equal or greater.
                // https://github.com/microsoft/vscode/issues/161886
                assert.ok((0, types_1.$uf)((0, workbenchTestServices_1.$6ec)(model1)).mtime >= m1Mtime);
                assert.ok((0, types_1.$uf)((0, workbenchTestServices_1.$6ec)(model2)).mtime >= m2Mtime);
            }
            else {
                // on desktop we want to assert this condition more strictly though
                assert.ok((0, types_1.$uf)((0, workbenchTestServices_1.$6ec)(model1)).mtime > m1Mtime);
                assert.ok((0, types_1.$uf)((0, workbenchTestServices_1.$6ec)(model2)).mtime > m2Mtime);
            }
        });
        test('Save Participant', async function () {
            let eventCounter = 0;
            const model = disposables.add(instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/index_async.txt'), 'utf8', undefined));
            disposables.add(model.onDidSave(() => {
                assert.strictEqual((0, textfiles_1.$MD)(model.createSnapshot()), eventCounter === 1 ? 'bar' : 'foobar');
                assert.ok(!model.isDirty());
                eventCounter++;
            }));
            const participant = accessor.textFileService.files.addSaveParticipant({
                participate: async (model) => {
                    assert.ok(model.isDirty());
                    model.updateTextEditorModel((0, textModel_1.$IC)('bar'));
                    assert.ok(model.isDirty());
                    eventCounter++;
                }
            });
            await model.resolve();
            model.updateTextEditorModel((0, textModel_1.$IC)('foo'));
            assert.ok(model.isDirty());
            await model.save();
            assert.strictEqual(eventCounter, 2);
            participant.dispose();
            model.updateTextEditorModel((0, textModel_1.$IC)('foobar'));
            assert.ok(model.isDirty());
            await model.save();
            assert.strictEqual(eventCounter, 3);
        });
        test('Save Participant - skip', async function () {
            let eventCounter = 0;
            const model = disposables.add(instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/index_async.txt'), 'utf8', undefined));
            disposables.add(accessor.textFileService.files.addSaveParticipant({
                participate: async () => {
                    eventCounter++;
                }
            }));
            await model.resolve();
            model.updateTextEditorModel((0, textModel_1.$IC)('foo'));
            await model.save({ skipSaveParticipants: true });
            assert.strictEqual(eventCounter, 0);
        });
        test('Save Participant, async participant', async function () {
            let eventCounter = 0;
            const model = disposables.add(instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/index_async.txt'), 'utf8', undefined));
            disposables.add(model.onDidSave(() => {
                assert.ok(!model.isDirty());
                eventCounter++;
            }));
            disposables.add(accessor.textFileService.files.addSaveParticipant({
                participate: model => {
                    assert.ok(model.isDirty());
                    model.updateTextEditorModel((0, textModel_1.$IC)('bar'));
                    assert.ok(model.isDirty());
                    eventCounter++;
                    return (0, async_1.$Hg)(10);
                }
            }));
            await model.resolve();
            model.updateTextEditorModel((0, textModel_1.$IC)('foo'));
            const now = Date.now();
            await model.save();
            assert.strictEqual(eventCounter, 2);
            assert.ok(Date.now() - now >= 10);
        });
        test('Save Participant, bad participant', async function () {
            const model = disposables.add(instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/index_async.txt'), 'utf8', undefined));
            disposables.add(accessor.textFileService.files.addSaveParticipant({
                participate: async () => {
                    new Error('boom');
                }
            }));
            await model.resolve();
            model.updateTextEditorModel((0, textModel_1.$IC)('foo'));
            await model.save();
        });
        test('Save Participant, participant cancelled when saved again', async function () {
            const model = disposables.add(instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/index_async.txt'), 'utf8', undefined));
            const participations = [];
            disposables.add(accessor.textFileService.files.addSaveParticipant({
                participate: async (model, context, progress, token) => {
                    await (0, async_1.$Hg)(10);
                    if (!token.isCancellationRequested) {
                        participations.push(true);
                    }
                }
            }));
            await model.resolve();
            model.updateTextEditorModel((0, textModel_1.$IC)('foo'));
            const p1 = model.save();
            model.updateTextEditorModel((0, textModel_1.$IC)('foo 1'));
            const p2 = model.save();
            model.updateTextEditorModel((0, textModel_1.$IC)('foo 2'));
            const p3 = model.save();
            model.updateTextEditorModel((0, textModel_1.$IC)('foo 3'));
            const p4 = model.save();
            await Promise.all([p1, p2, p3, p4]);
            assert.strictEqual(participations.length, 1);
        });
        test('Save Participant, calling save from within is unsupported but does not explode (sync save, no model change)', async function () {
            const model = disposables.add(instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/index_async.txt'), 'utf8', undefined));
            await testSaveFromSaveParticipant(model, false, false, false);
        });
        test('Save Participant, calling save from within is unsupported but does not explode (async save, no model change)', async function () {
            const model = disposables.add(instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/index_async.txt'), 'utf8', undefined));
            await testSaveFromSaveParticipant(model, true, false, false);
        });
        test('Save Participant, calling save from within is unsupported but does not explode (sync save, model change)', async function () {
            const model = disposables.add(instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/index_async.txt'), 'utf8', undefined));
            await testSaveFromSaveParticipant(model, false, true, false);
        });
        test('Save Participant, calling save from within is unsupported but does not explode (async save, model change)', async function () {
            const model = disposables.add(instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/index_async.txt'), 'utf8', undefined));
            await testSaveFromSaveParticipant(model, true, true, false);
        });
        test('Save Participant, calling save from within is unsupported but does not explode (force)', async function () {
            const model = disposables.add(instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/index_async.txt'), 'utf8', undefined));
            await testSaveFromSaveParticipant(model, false, false, true);
        });
        async function testSaveFromSaveParticipant(model, async, modelChange, force) {
            disposables.add(accessor.textFileService.files.addSaveParticipant({
                participate: async () => {
                    if (async) {
                        await (0, async_1.$Hg)(10);
                    }
                    if (modelChange) {
                        model.updateTextEditorModel((0, textModel_1.$IC)('bar'));
                        const newSavePromise = model.save(force ? { force } : undefined);
                        // assert that this is not the same promise as the outer one
                        assert.notStrictEqual(savePromise, newSavePromise);
                        await newSavePromise;
                    }
                    else {
                        const newSavePromise = model.save(force ? { force } : undefined);
                        // assert that this is the same promise as the outer one
                        assert.strictEqual(savePromise, newSavePromise);
                        await savePromise;
                    }
                }
            }));
            await model.resolve();
            model.updateTextEditorModel((0, textModel_1.$IC)('foo'));
            const savePromise = model.save(force ? { force } : undefined);
            await savePromise;
        }
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=textFileEditorModel.test.js.map