/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/workbench/common/editor/textResourceEditorInput", "vs/workbench/test/browser/workbenchTestServices", "vs/base/test/common/utils", "vs/workbench/services/textfile/common/textFileEditorModel", "vs/workbench/services/textfile/common/textfiles", "vs/base/common/event", "vs/base/common/async", "vs/workbench/services/untitled/common/untitledTextEditorInput", "vs/editor/common/model/textModel", "vs/base/common/lifecycle"], function (require, exports, assert, uri_1, textResourceEditorInput_1, workbenchTestServices_1, utils_1, textFileEditorModel_1, textfiles_1, event_1, async_1, untitledTextEditorInput_1, textModel_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Workbench - TextModelResolverService', () => {
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
        test('resolve resource', async () => {
            disposables.add(accessor.textModelResolverService.registerTextModelContentProvider('test', {
                provideTextContent: async function (resource) {
                    if (resource.scheme === 'test') {
                        const modelContent = 'Hello Test';
                        const languageSelection = accessor.languageService.createById('json');
                        return accessor.modelService.createModel(modelContent, languageSelection, resource);
                    }
                    return null;
                }
            }));
            const resource = uri_1.URI.from({ scheme: 'test', authority: null, path: 'thePath' });
            const input = instantiationService.createInstance(textResourceEditorInput_1.$7eb, resource, 'The Name', 'The Description', undefined, undefined);
            const model = disposables.add(await input.resolve());
            assert.ok(model);
            assert.strictEqual((0, textfiles_1.$MD)((model.createSnapshot())), 'Hello Test');
            let disposed = false;
            const disposedPromise = new Promise(resolve => {
                event_1.Event.once(model.onWillDispose)(() => {
                    disposed = true;
                    resolve();
                });
            });
            input.dispose();
            await disposedPromise;
            assert.strictEqual(disposed, true);
        });
        test('resolve file', async function () {
            const textModel = disposables.add(instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/file_resolver.txt'), 'utf8', undefined));
            accessor.textFileService.files.add(textModel.resource, textModel);
            await textModel.resolve();
            const ref = await accessor.textModelResolverService.createModelReference(textModel.resource);
            const model = ref.object;
            const editorModel = model.textEditorModel;
            assert.ok(editorModel);
            assert.strictEqual(editorModel.getValue(), 'Hello Html');
            let disposed = false;
            event_1.Event.once(model.onWillDispose)(() => {
                disposed = true;
            });
            ref.dispose();
            await (0, async_1.$Hg)(0); // due to the reference resolving the model first which is async
            assert.strictEqual(disposed, true);
        });
        test('resolved dirty file eventually disposes', async function () {
            const textModel = disposables.add(instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/file_resolver.txt'), 'utf8', undefined));
            accessor.textFileService.files.add(textModel.resource, textModel);
            await textModel.resolve();
            textModel.updateTextEditorModel((0, textModel_1.$IC)('make dirty'));
            const ref = await accessor.textModelResolverService.createModelReference(textModel.resource);
            let disposed = false;
            event_1.Event.once(textModel.onWillDispose)(() => {
                disposed = true;
            });
            ref.dispose();
            await (0, async_1.$Hg)(0);
            assert.strictEqual(disposed, false); // not disposed because model still dirty
            textModel.revert();
            await (0, async_1.$Hg)(0);
            assert.strictEqual(disposed, true); // now disposed because model got reverted
        });
        test('resolved dirty file does not dispose when new reference created', async function () {
            const textModel = disposables.add(instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/file_resolver.txt'), 'utf8', undefined));
            accessor.textFileService.files.add(textModel.resource, textModel);
            await textModel.resolve();
            textModel.updateTextEditorModel((0, textModel_1.$IC)('make dirty'));
            const ref1 = await accessor.textModelResolverService.createModelReference(textModel.resource);
            let disposed = false;
            event_1.Event.once(textModel.onWillDispose)(() => {
                disposed = true;
            });
            ref1.dispose();
            await (0, async_1.$Hg)(0);
            assert.strictEqual(disposed, false); // not disposed because model still dirty
            const ref2 = await accessor.textModelResolverService.createModelReference(textModel.resource);
            textModel.revert();
            await (0, async_1.$Hg)(0);
            assert.strictEqual(disposed, false); // not disposed because we got another ref meanwhile
            ref2.dispose();
            await (0, async_1.$Hg)(0);
            assert.strictEqual(disposed, true); // now disposed because last ref got disposed
        });
        test('resolve untitled', async () => {
            const service = accessor.untitledTextEditorService;
            const untitledModel = disposables.add(service.create());
            const input = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.$Bvb, untitledModel));
            await input.resolve();
            const ref = await accessor.textModelResolverService.createModelReference(input.resource);
            const model = ref.object;
            assert.strictEqual(untitledModel, model);
            const editorModel = model.textEditorModel;
            assert.ok(editorModel);
            ref.dispose();
            input.dispose();
            model.dispose();
        });
        test('even loading documents should be refcounted', async () => {
            let resolveModel;
            const waitForIt = new Promise(resolve => resolveModel = resolve);
            disposables.add(accessor.textModelResolverService.registerTextModelContentProvider('test', {
                provideTextContent: async (resource) => {
                    await waitForIt;
                    const modelContent = 'Hello Test';
                    const languageSelection = accessor.languageService.createById('json');
                    return disposables.add(accessor.modelService.createModel(modelContent, languageSelection, resource));
                }
            }));
            const uri = uri_1.URI.from({ scheme: 'test', authority: null, path: 'thePath' });
            const modelRefPromise1 = accessor.textModelResolverService.createModelReference(uri);
            const modelRefPromise2 = accessor.textModelResolverService.createModelReference(uri);
            resolveModel();
            const modelRef1 = await modelRefPromise1;
            const model1 = modelRef1.object;
            const modelRef2 = await modelRefPromise2;
            const model2 = modelRef2.object;
            const textModel = model1.textEditorModel;
            assert.strictEqual(model1, model2, 'they are the same model');
            assert(!textModel.isDisposed(), 'the text model should not be disposed');
            modelRef1.dispose();
            assert(!textModel.isDisposed(), 'the text model should still not be disposed');
            const p1 = new Promise(resolve => disposables.add(textModel.onWillDispose(resolve)));
            modelRef2.dispose();
            await p1;
            assert(textModel.isDisposed(), 'the text model should finally be disposed');
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=textModelResolverService.test.js.map