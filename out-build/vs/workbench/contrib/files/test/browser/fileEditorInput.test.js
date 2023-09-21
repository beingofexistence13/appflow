/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/base/test/common/utils", "vs/workbench/contrib/files/browser/editors/fileEditorInput", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/common/editor", "vs/workbench/services/textfile/common/textfiles", "vs/platform/files/common/files", "vs/workbench/services/textfile/common/textFileEditorModel", "vs/base/common/async", "vs/editor/common/languages/modesRegistry", "vs/base/common/lifecycle", "vs/workbench/common/editor/binaryEditorModel", "vs/platform/registry/common/platform", "vs/workbench/contrib/files/browser/editors/fileEditorHandler", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/workbench/services/textfile/common/textEditorService"], function (require, exports, assert, uri_1, utils_1, fileEditorInput_1, workbenchTestServices_1, editor_1, textfiles_1, files_1, textFileEditorModel_1, async_1, modesRegistry_1, lifecycle_1, binaryEditorModel_1, platform_1, fileEditorHandler_1, inMemoryFilesystemProvider_1, textEditorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Files - FileEditorInput', () => {
        const disposables = new lifecycle_1.$jc();
        let instantiationService;
        let accessor;
        function createFileInput(resource, preferredResource, preferredLanguageId, preferredName, preferredDescription, preferredContents) {
            return disposables.add(instantiationService.createInstance(fileEditorInput_1.$ULb, resource, preferredResource, preferredName, preferredDescription, undefined, preferredLanguageId, preferredContents));
        }
        class TestTextEditorService extends textEditorService_1.$txb {
            createTextEditor(input) {
                return createFileInput(input.resource);
            }
            async resolveTextEditor(input) {
                return createFileInput(input.resource);
            }
        }
        setup(() => {
            instantiationService = (0, workbenchTestServices_1.$lec)({
                textEditorService: instantiationService => instantiationService.createInstance(TestTextEditorService)
            }, disposables);
            accessor = instantiationService.createInstance(workbenchTestServices_1.$mec);
        });
        teardown(() => {
            disposables.clear();
        });
        test('Basics', async function () {
            let input = createFileInput(utils_1.$0S.call(this, '/foo/bar/file.js'));
            const otherInput = createFileInput(utils_1.$0S.call(this, 'foo/bar/otherfile.js'));
            const otherInputSame = createFileInput(utils_1.$0S.call(this, 'foo/bar/file.js'));
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
            assert.strictEqual(utils_1.$0S.call(this, '/foo/bar/file.js').fsPath, input.resource.fsPath);
            assert(input.resource instanceof uri_1.URI);
            input = createFileInput(utils_1.$0S.call(this, '/foo/bar.html'));
            const inputToResolve = createFileInput(utils_1.$0S.call(this, '/foo/bar/file.js'));
            const sameOtherInput = createFileInput(utils_1.$0S.call(this, '/foo/bar/file.js'));
            let resolved = await inputToResolve.resolve();
            assert.ok(inputToResolve.isResolved());
            const resolvedModelA = resolved;
            resolved = await inputToResolve.resolve();
            assert(resolvedModelA === resolved); // OK: Resolved Model cached globally per input
            try {
                lifecycle_1.$jc.DISABLE_DISPOSED_WARNING = true; // prevent unwanted warning output from occurring
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
                const stat = (0, workbenchTestServices_1.$6ec)(resolved);
                resolved = await inputToResolve.resolve();
                await (0, async_1.$Hg)(0);
                assert(stat !== (0, workbenchTestServices_1.$6ec)(resolved)); // Different stat, because resolve always goes to the server for refresh
            }
            finally {
                lifecycle_1.$jc.DISABLE_DISPOSED_WARNING = false;
            }
        });
        test('reports as untitled without supported file scheme', async function () {
            const input = createFileInput(utils_1.$0S.call(this, '/foo/bar/file.js').with({ scheme: 'someTestingScheme' }));
            assert.ok(input.hasCapability(4 /* EditorInputCapabilities.Untitled */));
            assert.ok(!input.hasCapability(2 /* EditorInputCapabilities.Readonly */));
            assert.ok(!input.isReadonly());
        });
        test('reports as readonly with readonly file scheme', async function () {
            const inMemoryFilesystemProvider = disposables.add(new inMemoryFilesystemProvider_1.$rAb());
            inMemoryFilesystemProvider.setReadOnly(true);
            disposables.add(accessor.fileService.registerProvider('someTestingReadonlyScheme', inMemoryFilesystemProvider));
            const input = createFileInput(utils_1.$0S.call(this, '/foo/bar/file.js').with({ scheme: 'someTestingReadonlyScheme' }));
            assert.ok(!input.hasCapability(4 /* EditorInputCapabilities.Untitled */));
            assert.ok(input.hasCapability(2 /* EditorInputCapabilities.Readonly */));
            assert.ok(input.isReadonly());
        });
        test('preferred resource', function () {
            const resource = utils_1.$0S.call(this, '/foo/bar/updatefile.js');
            const preferredResource = utils_1.$0S.call(this, '/foo/bar/UPDATEFILE.js');
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
            const otherPreferredResource = utils_1.$0S.call(this, '/FOO/BAR/updateFILE.js');
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
            const input = createFileInput(utils_1.$0S.call(this, '/foo/bar/file.js'), undefined, languageId);
            assert.strictEqual(input.getPreferredLanguageId(), languageId);
            const model = disposables.add(await input.resolve());
            assert.strictEqual(model.textEditorModel.getLanguageId(), languageId);
            input.setLanguageId('text');
            assert.strictEqual(input.getPreferredLanguageId(), 'text');
            assert.strictEqual(model.textEditorModel.getLanguageId(), modesRegistry_1.$Yt);
            const input2 = createFileInput(utils_1.$0S.call(this, '/foo/bar/file.js'));
            input2.setPreferredLanguageId(languageId);
            const model2 = disposables.add(await input2.resolve());
            assert.strictEqual(model2.textEditorModel.getLanguageId(), languageId);
        });
        test('preferred contents', async function () {
            const input = createFileInput(utils_1.$0S.call(this, '/foo/bar/file.js'), undefined, undefined, undefined, undefined, 'My contents');
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
            const input2 = createFileInput(utils_1.$0S.call(this, '/foo/bar/file.js'));
            input2.setPreferredContents('My contents');
            const model2 = await input2.resolve();
            assert.strictEqual(model2.textEditorModel.getValue(), 'My contents');
            assert.strictEqual(input2.isDirty(), true);
        });
        test('matches', function () {
            const input1 = createFileInput(utils_1.$0S.call(this, '/foo/bar/updatefile.js'));
            const input2 = createFileInput(utils_1.$0S.call(this, '/foo/bar/updatefile.js'));
            const input3 = createFileInput(utils_1.$0S.call(this, '/foo/bar/other.js'));
            const input2Upper = createFileInput(utils_1.$0S.call(this, '/foo/bar/UPDATEFILE.js'));
            assert.strictEqual(input1.matches(input1), true);
            assert.strictEqual(input1.matches(input2), true);
            assert.strictEqual(input1.matches(input3), false);
            assert.strictEqual(input1.matches(input2Upper), false);
        });
        test('getEncoding/setEncoding', async function () {
            const input = createFileInput(utils_1.$0S.call(this, '/foo/bar/updatefile.js'));
            await input.setEncoding('utf16', 0 /* EncodingMode.Encode */);
            assert.strictEqual(input.getEncoding(), 'utf16');
            const resolved = disposables.add(await input.resolve());
            assert.strictEqual(input.getEncoding(), resolved.getEncoding());
        });
        test('save', async function () {
            const input = createFileInput(utils_1.$0S.call(this, '/foo/bar/updatefile.js'));
            const resolved = disposables.add(await input.resolve());
            resolved.textEditorModel.setValue('changed');
            assert.ok(input.isDirty());
            assert.ok(input.isModified());
            await input.save(0);
            assert.ok(!input.isDirty());
            assert.ok(!input.isModified());
        });
        test('revert', async function () {
            const input = createFileInput(utils_1.$0S.call(this, '/foo/bar/updatefile.js'));
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
            const input = createFileInput(utils_1.$0S.call(this, '/foo/bar/updatefile.js'));
            accessor.textFileService.setReadStreamErrorOnce(new textfiles_1.$KD('error', 0 /* TextFileOperationResult.FILE_IS_BINARY */));
            const resolved = disposables.add(await input.resolve());
            assert.ok(resolved);
        });
        test('resolve throws for too large files', async function () {
            const input = createFileInput(utils_1.$0S.call(this, '/foo/bar/updatefile.js'));
            let e = undefined;
            accessor.textFileService.setReadStreamErrorOnce(new files_1.$ok('error', 7 /* FileOperationResult.FILE_TOO_LARGE */, 1000));
            try {
                await input.resolve();
            }
            catch (error) {
                e = error;
            }
            assert.ok(e);
        });
        test('attaches to model when created and reports dirty', async function () {
            const input = createFileInput(utils_1.$0S.call(this, '/foo/bar/updatefile.js'));
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
            const input = createFileInput(utils_1.$0S.call(this, '/foo/bar/updatefile.js'));
            input.setForceOpenAsBinary();
            let resolved = disposables.add(await input.resolve());
            assert.ok(resolved instanceof binaryEditorModel_1.$Fvb);
            input.setForceOpenAsText();
            resolved = disposables.add(await input.resolve());
            assert.ok(resolved instanceof textFileEditorModel_1.$Hyb);
        });
        test('file editor serializer', async function () {
            instantiationService.invokeFunction(accessor => platform_1.$8m.as(editor_1.$GE.EditorFactory).start(accessor));
            const input = createFileInput(utils_1.$0S.call(this, '/foo/bar/updatefile.js'));
            disposables.add(platform_1.$8m.as(editor_1.$GE.EditorFactory).registerEditorSerializer('workbench.editors.files.fileEditorInput', fileEditorHandler_1.$$Lb));
            const editorSerializer = platform_1.$8m.as(editor_1.$GE.EditorFactory).getEditorSerializer(input.typeId);
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
            const preferredResource = utils_1.$0S.call(this, '/foo/bar/UPDATEfile.js');
            const inputWithPreferredResource = createFileInput(utils_1.$0S.call(this, '/foo/bar/updatefile.js'), preferredResource);
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
            const customFileInput = createFileInput(utils_1.$0S.call(this, '/foo/bar/updatefile.js').with({ scheme: 'test-custom' }), undefined, undefined, 'My Name', 'My Description');
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
            const fileInput = createFileInput(utils_1.$0S.call(this, '/foo/bar/updatefile.js'), undefined, undefined, 'My Name', 'My Description');
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
            const input = createFileInput(utils_1.$0S.call(this, '/foo/bar/updatefile.js'));
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
                accessor.fileService.readShouldThrowError = new files_1.$pk('file not modified since', { ...stat, readonly: true });
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
                accessor.fileService.readShouldThrowError = new files_1.$pk('file not modified since', { ...stat, readonly: false });
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
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=fileEditorInput.test.js.map