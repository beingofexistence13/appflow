/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/base/test/common/utils", "vs/workbench/contrib/files/browser/editors/fileEditorInput", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/common/editor", "vs/workbench/services/textfile/common/textfiles", "vs/platform/files/common/files", "vs/workbench/services/textfile/common/textFileEditorModel", "vs/base/common/async", "vs/editor/common/languages/modesRegistry", "vs/base/common/lifecycle", "vs/workbench/common/editor/binaryEditorModel", "vs/platform/registry/common/platform", "vs/workbench/contrib/files/browser/editors/fileEditorHandler", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/workbench/services/textfile/common/textEditorService"], function (require, exports, assert, uri_1, utils_1, fileEditorInput_1, workbenchTestServices_1, editor_1, textfiles_1, files_1, textFileEditorModel_1, async_1, modesRegistry_1, lifecycle_1, binaryEditorModel_1, platform_1, fileEditorHandler_1, inMemoryFilesystemProvider_1, textEditorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Files - FileEditorInput', () => {
        const disposables = new lifecycle_1.DisposableStore();
        let instantiationService;
        let accessor;
        function createFileInput(resource, preferredResource, preferredLanguageId, preferredName, preferredDescription, preferredContents) {
            return disposables.add(instantiationService.createInstance(fileEditorInput_1.FileEditorInput, resource, preferredResource, preferredName, preferredDescription, undefined, preferredLanguageId, preferredContents));
        }
        class TestTextEditorService extends textEditorService_1.TextEditorService {
            createTextEditor(input) {
                return createFileInput(input.resource);
            }
            async resolveTextEditor(input) {
                return createFileInput(input.resource);
            }
        }
        setup(() => {
            instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)({
                textEditorService: instantiationService => instantiationService.createInstance(TestTextEditorService)
            }, disposables);
            accessor = instantiationService.createInstance(workbenchTestServices_1.TestServiceAccessor);
        });
        teardown(() => {
            disposables.clear();
        });
        test('Basics', async function () {
            let input = createFileInput(utils_1.toResource.call(this, '/foo/bar/file.js'));
            const otherInput = createFileInput(utils_1.toResource.call(this, 'foo/bar/otherfile.js'));
            const otherInputSame = createFileInput(utils_1.toResource.call(this, 'foo/bar/file.js'));
            assert(input.matches(input));
            assert(input.matches(otherInputSame));
            assert(!input.matches(otherInput));
            assert.ok(input.getName());
            assert.ok(input.getDescription());
            assert.ok(input.getTitle(0 /* Verbosity.SHORT */));
            assert.ok(!input.hasCapability(4 /* EditorInputCapabilities.Untitled */));
            assert.ok(!input.hasCapability(2 /* EditorInputCapabilities.Readonly */));
            assert.ok(!input.isReadonly());
            assert.ok(!input.hasCapability(8 /* EditorInputCapabilities.Singleton */));
            assert.ok(!input.hasCapability(16 /* EditorInputCapabilities.RequiresTrust */));
            const untypedInput = input.toUntyped({ preserveViewState: 0 });
            assert.strictEqual(untypedInput.resource.toString(), input.resource.toString());
            assert.strictEqual('file.js', input.getName());
            assert.strictEqual(utils_1.toResource.call(this, '/foo/bar/file.js').fsPath, input.resource.fsPath);
            assert(input.resource instanceof uri_1.URI);
            input = createFileInput(utils_1.toResource.call(this, '/foo/bar.html'));
            const inputToResolve = createFileInput(utils_1.toResource.call(this, '/foo/bar/file.js'));
            const sameOtherInput = createFileInput(utils_1.toResource.call(this, '/foo/bar/file.js'));
            let resolved = await inputToResolve.resolve();
            assert.ok(inputToResolve.isResolved());
            const resolvedModelA = resolved;
            resolved = await inputToResolve.resolve();
            assert(resolvedModelA === resolved); // OK: Resolved Model cached globally per input
            try {
                lifecycle_1.DisposableStore.DISABLE_DISPOSED_WARNING = true; // prevent unwanted warning output from occurring
                const otherResolved = await sameOtherInput.resolve();
                assert(otherResolved === resolvedModelA); // OK: Resolved Model cached globally per input
                inputToResolve.dispose();
                resolved = await inputToResolve.resolve();
                assert(resolvedModelA === resolved); // Model is still the same because we had 2 clients
                inputToResolve.dispose();
                sameOtherInput.dispose();
                resolvedModelA.dispose();
                resolved = await inputToResolve.resolve();
                assert(resolvedModelA !== resolved); // Different instance, because input got disposed
                const stat = (0, workbenchTestServices_1.getLastResolvedFileStat)(resolved);
                resolved = await inputToResolve.resolve();
                await (0, async_1.timeout)(0);
                assert(stat !== (0, workbenchTestServices_1.getLastResolvedFileStat)(resolved)); // Different stat, because resolve always goes to the server for refresh
            }
            finally {
                lifecycle_1.DisposableStore.DISABLE_DISPOSED_WARNING = false;
            }
        });
        test('reports as untitled without supported file scheme', async function () {
            const input = createFileInput(utils_1.toResource.call(this, '/foo/bar/file.js').with({ scheme: 'someTestingScheme' }));
            assert.ok(input.hasCapability(4 /* EditorInputCapabilities.Untitled */));
            assert.ok(!input.hasCapability(2 /* EditorInputCapabilities.Readonly */));
            assert.ok(!input.isReadonly());
        });
        test('reports as readonly with readonly file scheme', async function () {
            const inMemoryFilesystemProvider = disposables.add(new inMemoryFilesystemProvider_1.InMemoryFileSystemProvider());
            inMemoryFilesystemProvider.setReadOnly(true);
            disposables.add(accessor.fileService.registerProvider('someTestingReadonlyScheme', inMemoryFilesystemProvider));
            const input = createFileInput(utils_1.toResource.call(this, '/foo/bar/file.js').with({ scheme: 'someTestingReadonlyScheme' }));
            assert.ok(!input.hasCapability(4 /* EditorInputCapabilities.Untitled */));
            assert.ok(input.hasCapability(2 /* EditorInputCapabilities.Readonly */));
            assert.ok(input.isReadonly());
        });
        test('preferred resource', function () {
            const resource = utils_1.toResource.call(this, '/foo/bar/updatefile.js');
            const preferredResource = utils_1.toResource.call(this, '/foo/bar/UPDATEFILE.js');
            const inputWithoutPreferredResource = createFileInput(resource);
            assert.strictEqual(inputWithoutPreferredResource.resource.toString(), resource.toString());
            assert.strictEqual(inputWithoutPreferredResource.preferredResource.toString(), resource.toString());
            const inputWithPreferredResource = createFileInput(resource, preferredResource);
            assert.strictEqual(inputWithPreferredResource.resource.toString(), resource.toString());
            assert.strictEqual(inputWithPreferredResource.preferredResource.toString(), preferredResource.toString());
            let didChangeLabel = false;
            disposables.add(inputWithPreferredResource.onDidChangeLabel(e => {
                didChangeLabel = true;
            }));
            assert.strictEqual(inputWithPreferredResource.getName(), 'UPDATEFILE.js');
            const otherPreferredResource = utils_1.toResource.call(this, '/FOO/BAR/updateFILE.js');
            inputWithPreferredResource.setPreferredResource(otherPreferredResource);
            assert.strictEqual(inputWithPreferredResource.resource.toString(), resource.toString());
            assert.strictEqual(inputWithPreferredResource.preferredResource.toString(), otherPreferredResource.toString());
            assert.strictEqual(inputWithPreferredResource.getName(), 'updateFILE.js');
            assert.strictEqual(didChangeLabel, true);
        });
        test('preferred language', async function () {
            const languageId = 'file-input-test';
            disposables.add(accessor.languageService.registerLanguage({
                id: languageId,
            }));
            const input = createFileInput(utils_1.toResource.call(this, '/foo/bar/file.js'), undefined, languageId);
            assert.strictEqual(input.getPreferredLanguageId(), languageId);
            const model = disposables.add(await input.resolve());
            assert.strictEqual(model.textEditorModel.getLanguageId(), languageId);
            input.setLanguageId('text');
            assert.strictEqual(input.getPreferredLanguageId(), 'text');
            assert.strictEqual(model.textEditorModel.getLanguageId(), modesRegistry_1.PLAINTEXT_LANGUAGE_ID);
            const input2 = createFileInput(utils_1.toResource.call(this, '/foo/bar/file.js'));
            input2.setPreferredLanguageId(languageId);
            const model2 = disposables.add(await input2.resolve());
            assert.strictEqual(model2.textEditorModel.getLanguageId(), languageId);
        });
        test('preferred contents', async function () {
            const input = createFileInput(utils_1.toResource.call(this, '/foo/bar/file.js'), undefined, undefined, undefined, undefined, 'My contents');
            const model = disposables.add(await input.resolve());
            assert.strictEqual(model.textEditorModel.getValue(), 'My contents');
            assert.strictEqual(input.isDirty(), true);
            const untypedInput = input.toUntyped({ preserveViewState: 0 });
            assert.strictEqual(untypedInput.contents, 'My contents');
            const untypedInputWithoutContents = input.toUntyped();
            assert.strictEqual(untypedInputWithoutContents.contents, undefined);
            input.setPreferredContents('Other contents');
            await input.resolve();
            assert.strictEqual(model.textEditorModel.getValue(), 'Other contents');
            model.textEditorModel?.setValue('Changed contents');
            await input.resolve();
            assert.strictEqual(model.textEditorModel.getValue(), 'Changed contents'); // preferred contents only used once
            const input2 = createFileInput(utils_1.toResource.call(this, '/foo/bar/file.js'));
            input2.setPreferredContents('My contents');
            const model2 = await input2.resolve();
            assert.strictEqual(model2.textEditorModel.getValue(), 'My contents');
            assert.strictEqual(input2.isDirty(), true);
        });
        test('matches', function () {
            const input1 = createFileInput(utils_1.toResource.call(this, '/foo/bar/updatefile.js'));
            const input2 = createFileInput(utils_1.toResource.call(this, '/foo/bar/updatefile.js'));
            const input3 = createFileInput(utils_1.toResource.call(this, '/foo/bar/other.js'));
            const input2Upper = createFileInput(utils_1.toResource.call(this, '/foo/bar/UPDATEFILE.js'));
            assert.strictEqual(input1.matches(input1), true);
            assert.strictEqual(input1.matches(input2), true);
            assert.strictEqual(input1.matches(input3), false);
            assert.strictEqual(input1.matches(input2Upper), false);
        });
        test('getEncoding/setEncoding', async function () {
            const input = createFileInput(utils_1.toResource.call(this, '/foo/bar/updatefile.js'));
            await input.setEncoding('utf16', 0 /* EncodingMode.Encode */);
            assert.strictEqual(input.getEncoding(), 'utf16');
            const resolved = disposables.add(await input.resolve());
            assert.strictEqual(input.getEncoding(), resolved.getEncoding());
        });
        test('save', async function () {
            const input = createFileInput(utils_1.toResource.call(this, '/foo/bar/updatefile.js'));
            const resolved = disposables.add(await input.resolve());
            resolved.textEditorModel.setValue('changed');
            assert.ok(input.isDirty());
            assert.ok(input.isModified());
            await input.save(0);
            assert.ok(!input.isDirty());
            assert.ok(!input.isModified());
        });
        test('revert', async function () {
            const input = createFileInput(utils_1.toResource.call(this, '/foo/bar/updatefile.js'));
            const resolved = disposables.add(await input.resolve());
            resolved.textEditorModel.setValue('changed');
            assert.ok(input.isDirty());
            assert.ok(input.isModified());
            await input.revert(0);
            assert.ok(!input.isDirty());
            assert.ok(!input.isModified());
            input.dispose();
            assert.ok(input.isDisposed());
        });
        test('resolve handles binary files', async function () {
            const input = createFileInput(utils_1.toResource.call(this, '/foo/bar/updatefile.js'));
            accessor.textFileService.setReadStreamErrorOnce(new textfiles_1.TextFileOperationError('error', 0 /* TextFileOperationResult.FILE_IS_BINARY */));
            const resolved = disposables.add(await input.resolve());
            assert.ok(resolved);
        });
        test('resolve throws for too large files', async function () {
            const input = createFileInput(utils_1.toResource.call(this, '/foo/bar/updatefile.js'));
            let e = undefined;
            accessor.textFileService.setReadStreamErrorOnce(new files_1.TooLargeFileOperationError('error', 7 /* FileOperationResult.FILE_TOO_LARGE */, 1000));
            try {
                await input.resolve();
            }
            catch (error) {
                e = error;
            }
            assert.ok(e);
        });
        test('attaches to model when created and reports dirty', async function () {
            const input = createFileInput(utils_1.toResource.call(this, '/foo/bar/updatefile.js'));
            let listenerCount = 0;
            disposables.add(input.onDidChangeDirty(() => {
                listenerCount++;
            }));
            // instead of going through file input resolve method
            // we resolve the model directly through the service
            const model = disposables.add(await accessor.textFileService.files.resolve(input.resource));
            model.textEditorModel?.setValue('hello world');
            assert.strictEqual(listenerCount, 1);
            assert.ok(input.isDirty());
        });
        test('force open text/binary', async function () {
            const input = createFileInput(utils_1.toResource.call(this, '/foo/bar/updatefile.js'));
            input.setForceOpenAsBinary();
            let resolved = disposables.add(await input.resolve());
            assert.ok(resolved instanceof binaryEditorModel_1.BinaryEditorModel);
            input.setForceOpenAsText();
            resolved = disposables.add(await input.resolve());
            assert.ok(resolved instanceof textFileEditorModel_1.TextFileEditorModel);
        });
        test('file editor serializer', async function () {
            instantiationService.invokeFunction(accessor => platform_1.Registry.as(editor_1.EditorExtensions.EditorFactory).start(accessor));
            const input = createFileInput(utils_1.toResource.call(this, '/foo/bar/updatefile.js'));
            disposables.add(platform_1.Registry.as(editor_1.EditorExtensions.EditorFactory).registerEditorSerializer('workbench.editors.files.fileEditorInput', fileEditorHandler_1.FileEditorInputSerializer));
            const editorSerializer = platform_1.Registry.as(editor_1.EditorExtensions.EditorFactory).getEditorSerializer(input.typeId);
            if (!editorSerializer) {
                assert.fail('File Editor Input Serializer missing');
            }
            assert.strictEqual(editorSerializer.canSerialize(input), true);
            const inputSerialized = editorSerializer.serialize(input);
            if (!inputSerialized) {
                assert.fail('Unexpected serialized file input');
            }
            const inputDeserialized = editorSerializer.deserialize(instantiationService, inputSerialized);
            assert.strictEqual(inputDeserialized ? input.matches(inputDeserialized) : false, true);
            const preferredResource = utils_1.toResource.call(this, '/foo/bar/UPDATEfile.js');
            const inputWithPreferredResource = createFileInput(utils_1.toResource.call(this, '/foo/bar/updatefile.js'), preferredResource);
            const inputWithPreferredResourceSerialized = editorSerializer.serialize(inputWithPreferredResource);
            if (!inputWithPreferredResourceSerialized) {
                assert.fail('Unexpected serialized file input');
            }
            const inputWithPreferredResourceDeserialized = editorSerializer.deserialize(instantiationService, inputWithPreferredResourceSerialized);
            assert.strictEqual(inputWithPreferredResource.resource.toString(), inputWithPreferredResourceDeserialized.resource.toString());
            assert.strictEqual(inputWithPreferredResource.preferredResource.toString(), inputWithPreferredResourceDeserialized.preferredResource.toString());
        });
        test('preferred name/description', async function () {
            // Works with custom file input
            const customFileInput = createFileInput(utils_1.toResource.call(this, '/foo/bar/updatefile.js').with({ scheme: 'test-custom' }), undefined, undefined, 'My Name', 'My Description');
            let didChangeLabelCounter = 0;
            disposables.add(customFileInput.onDidChangeLabel(() => {
                didChangeLabelCounter++;
            }));
            assert.strictEqual(customFileInput.getName(), 'My Name');
            assert.strictEqual(customFileInput.getDescription(), 'My Description');
            customFileInput.setPreferredName('My Name 2');
            customFileInput.setPreferredDescription('My Description 2');
            assert.strictEqual(customFileInput.getName(), 'My Name 2');
            assert.strictEqual(customFileInput.getDescription(), 'My Description 2');
            assert.strictEqual(didChangeLabelCounter, 2);
            customFileInput.dispose();
            // Disallowed with local file input
            const fileInput = createFileInput(utils_1.toResource.call(this, '/foo/bar/updatefile.js'), undefined, undefined, 'My Name', 'My Description');
            didChangeLabelCounter = 0;
            disposables.add(fileInput.onDidChangeLabel(() => {
                didChangeLabelCounter++;
            }));
            assert.notStrictEqual(fileInput.getName(), 'My Name');
            assert.notStrictEqual(fileInput.getDescription(), 'My Description');
            fileInput.setPreferredName('My Name 2');
            fileInput.setPreferredDescription('My Description 2');
            assert.notStrictEqual(fileInput.getName(), 'My Name 2');
            assert.notStrictEqual(fileInput.getDescription(), 'My Description 2');
            assert.strictEqual(didChangeLabelCounter, 0);
        });
        test('reports readonly changes', async function () {
            const input = createFileInput(utils_1.toResource.call(this, '/foo/bar/updatefile.js'));
            let listenerCount = 0;
            disposables.add(input.onDidChangeCapabilities(() => {
                listenerCount++;
            }));
            const model = disposables.add(await accessor.textFileService.files.resolve(input.resource));
            assert.strictEqual(model.isReadonly(), false);
            assert.strictEqual(input.hasCapability(2 /* EditorInputCapabilities.Readonly */), false);
            assert.strictEqual(input.isReadonly(), false);
            const stat = await accessor.fileService.resolve(input.resource, { resolveMetadata: true });
            try {
                accessor.fileService.readShouldThrowError = new files_1.NotModifiedSinceFileOperationError('file not modified since', { ...stat, readonly: true });
                await input.resolve();
            }
            finally {
                accessor.fileService.readShouldThrowError = undefined;
            }
            assert.strictEqual(!!model.isReadonly(), true);
            assert.strictEqual(input.hasCapability(2 /* EditorInputCapabilities.Readonly */), true);
            assert.strictEqual(!!input.isReadonly(), true);
            assert.strictEqual(listenerCount, 1);
            try {
                accessor.fileService.readShouldThrowError = new files_1.NotModifiedSinceFileOperationError('file not modified since', { ...stat, readonly: false });
                await input.resolve();
            }
            finally {
                accessor.fileService.readShouldThrowError = undefined;
            }
            assert.strictEqual(model.isReadonly(), false);
            assert.strictEqual(input.hasCapability(2 /* EditorInputCapabilities.Readonly */), false);
            assert.strictEqual(input.isReadonly(), false);
            assert.strictEqual(listenerCount, 2);
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZUVkaXRvcklucHV0LnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9maWxlcy90ZXN0L2Jyb3dzZXIvZmlsZUVkaXRvcklucHV0LnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFzQmhHLEtBQUssQ0FBQyx5QkFBeUIsRUFBRSxHQUFHLEVBQUU7UUFFckMsTUFBTSxXQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7UUFDMUMsSUFBSSxvQkFBMkMsQ0FBQztRQUNoRCxJQUFJLFFBQTZCLENBQUM7UUFFbEMsU0FBUyxlQUFlLENBQUMsUUFBYSxFQUFFLGlCQUF1QixFQUFFLG1CQUE0QixFQUFFLGFBQXNCLEVBQUUsb0JBQTZCLEVBQUUsaUJBQTBCO1lBQy9LLE9BQU8sV0FBVyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsaUNBQWUsRUFBRSxRQUFRLEVBQUUsaUJBQWlCLEVBQUUsYUFBYSxFQUFFLG9CQUFvQixFQUFFLFNBQVMsRUFBRSxtQkFBbUIsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7UUFDbk0sQ0FBQztRQUVELE1BQU0scUJBQXNCLFNBQVEscUNBQWlCO1lBQzNDLGdCQUFnQixDQUFDLEtBQTJCO2dCQUNwRCxPQUFPLGVBQWUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDeEMsQ0FBQztZQUVRLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxLQUEyQjtnQkFDM0QsT0FBTyxlQUFlLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3hDLENBQUM7U0FDRDtRQUVELEtBQUssQ0FBQyxHQUFHLEVBQUU7WUFDVixvQkFBb0IsR0FBRyxJQUFBLHFEQUE2QixFQUFDO2dCQUNwRCxpQkFBaUIsRUFBRSxvQkFBb0IsQ0FBQyxFQUFFLENBQUMsb0JBQW9CLENB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