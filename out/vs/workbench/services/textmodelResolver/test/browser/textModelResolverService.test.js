/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/workbench/common/editor/textResourceEditorInput", "vs/workbench/test/browser/workbenchTestServices", "vs/base/test/common/utils", "vs/workbench/services/textfile/common/textFileEditorModel", "vs/workbench/services/textfile/common/textfiles", "vs/base/common/event", "vs/base/common/async", "vs/workbench/services/untitled/common/untitledTextEditorInput", "vs/editor/common/model/textModel", "vs/base/common/lifecycle"], function (require, exports, assert, uri_1, textResourceEditorInput_1, workbenchTestServices_1, utils_1, textFileEditorModel_1, textfiles_1, event_1, async_1, untitledTextEditorInput_1, textModel_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Workbench - TextModelResolverService', () => {
        const disposables = new lifecycle_1.DisposableStore();
        let instantiationService;
        let accessor;
        setup(() => {
            instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, disposables);
            accessor = instantiationService.createInstance(workbenchTestServices_1.TestServiceAccessor);
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
            const input = instantiationService.createInstance(textResourceEditorInput_1.TextResourceEditorInput, resource, 'The Name', 'The Description', undefined, undefined);
            const model = disposables.add(await input.resolve());
            assert.ok(model);
            assert.strictEqual((0, textfiles_1.snapshotToString)((model.createSnapshot())), 'Hello Test');
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
            const textModel = disposables.add(instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/file_resolver.txt'), 'utf8', undefined));
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
            await (0, async_1.timeout)(0); // due to the reference resolving the model first which is async
            assert.strictEqual(disposed, true);
        });
        test('resolved dirty file eventually disposes', async function () {
            const textModel = disposables.add(instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/file_resolver.txt'), 'utf8', undefined));
            accessor.textFileService.files.add(textModel.resource, textModel);
            await textModel.resolve();
            textModel.updateTextEditorModel((0, textModel_1.createTextBufferFactory)('make dirty'));
            const ref = await accessor.textModelResolverService.createModelReference(textModel.resource);
            let disposed = false;
            event_1.Event.once(textModel.onWillDispose)(() => {
                disposed = true;
            });
            ref.dispose();
            await (0, async_1.timeout)(0);
            assert.strictEqual(disposed, false); // not disposed because model still dirty
            textModel.revert();
            await (0, async_1.timeout)(0);
            assert.strictEqual(disposed, true); // now disposed because model got reverted
        });
        test('resolved dirty file does not dispose when new reference created', async function () {
            const textModel = disposables.add(instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/file_resolver.txt'), 'utf8', undefined));
            accessor.textFileService.files.add(textModel.resource, textModel);
            await textModel.resolve();
            textModel.updateTextEditorModel((0, textModel_1.createTextBufferFactory)('make dirty'));
            const ref1 = await accessor.textModelResolverService.createModelReference(textModel.resource);
            let disposed = false;
            event_1.Event.once(textModel.onWillDispose)(() => {
                disposed = true;
            });
            ref1.dispose();
            await (0, async_1.timeout)(0);
            assert.strictEqual(disposed, false); // not disposed because model still dirty
            const ref2 = await accessor.textModelResolverService.createModelReference(textModel.resource);
            textModel.revert();
            await (0, async_1.timeout)(0);
            assert.strictEqual(disposed, false); // not disposed because we got another ref meanwhile
            ref2.dispose();
            await (0, async_1.timeout)(0);
            assert.strictEqual(disposed, true); // now disposed because last ref got disposed
        });
        test('resolve untitled', async () => {
            const service = accessor.untitledTextEditorService;
            const untitledModel = disposables.add(service.create());
            const input = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.UntitledTextEditorInput, untitledModel));
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
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dE1vZGVsUmVzb2x2ZXJTZXJ2aWNlLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvdGV4dG1vZGVsUmVzb2x2ZXIvdGVzdC9icm93c2VyL3RleHRNb2RlbFJlc29sdmVyU2VydmljZS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBbUJoRyxLQUFLLENBQUMsc0NBQXNDLEVBQUUsR0FBRyxFQUFFO1FBRWxELE1BQU0sV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1FBQzFDLElBQUksb0JBQTJDLENBQUM7UUFDaEQsSUFBSSxRQUE2QixDQUFDO1FBRWxDLEtBQUssQ0FBQyxHQUFHLEVBQUU7WUFDVixvQkFBb0IsR0FBRyxJQUFBLHFEQUE2QixFQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUM3RSxRQUFRLEdBQUcsb0JBQW9CLENBQUMsY0FBYyxDQUFDLDJDQUFtQixDQUFDLENBQUM7WUFDcEUsV0FBVyxDQUFDLEdBQUcsQ0FBNkIsUUFBUSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM3RSxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxHQUFHLEVBQUU7WUFDYixXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDckIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsa0JBQWtCLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDbkMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsd0JBQXdCLENBQUMsZ0NBQWdDLENBQUMsTUFBTSxFQUFFO2dCQUMxRixrQkFBa0IsRUFBRSxLQUFLLFdBQVcsUUFBYTtvQkFDaEQsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLE1BQU0sRUFBRTt3QkFDL0IsTUFBTSxZQUFZLEdBQUcsWUFBWSxDQUFDO3dCQUNsQyxNQUFNLGlC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