/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "assert", "vs/base/common/uri", "vs/workbench/common/editor", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/common/editor/textResourceEditorInput", "vs/platform/instantiation/common/descriptors", "vs/workbench/contrib/files/browser/editors/fileEditorInput", "vs/workbench/services/untitled/common/untitledTextEditorInput", "vs/base/test/common/utils", "vs/platform/files/common/files", "vs/base/common/lifecycle", "vs/platform/files/test/common/nullFileSystemProvider", "vs/workbench/common/editor/diffEditorInput", "vs/base/common/platform", "vs/workbench/common/editor/sideBySideEditorInput", "vs/workbench/services/textfile/common/textEditorService", "vs/editor/common/languages/language"], function (require, exports, assert, uri_1, editor_1, workbenchTestServices_1, textResourceEditorInput_1, descriptors_1, fileEditorInput_1, untitledTextEditorInput_1, utils_1, files_1, lifecycle_1, nullFileSystemProvider_1, diffEditorInput_1, platform_1, sideBySideEditorInput_1, textEditorService_1, language_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('TextEditorService', () => {
        const TEST_EDITOR_ID = 'MyTestEditorForEditorService';
        const TEST_EDITOR_INPUT_ID = 'testEditorInputForEditorService';
        let FileServiceProvider = class FileServiceProvider extends lifecycle_1.Disposable {
            constructor(scheme, fileService) {
                super();
                this._register(fileService.registerProvider(scheme, new nullFileSystemProvider_1.NullFileSystemProvider()));
            }
        };
        FileServiceProvider = __decorate([
            __param(1, files_1.IFileService)
        ], FileServiceProvider);
        const disposables = new lifecycle_1.DisposableStore();
        setup(() => {
            disposables.add((0, workbenchTestServices_1.registerTestEditor)(TEST_EDITOR_ID, [new descriptors_1.SyncDescriptor(workbenchTestServices_1.TestFileEditorInput)], TEST_EDITOR_INPUT_ID));
            disposables.add((0, workbenchTestServices_1.registerTestResourceEditor)());
            disposables.add((0, workbenchTestServices_1.registerTestSideBySideEditor)());
        });
        teardown(() => {
            disposables.clear();
        });
        test('createTextEditor - basics', async function () {
            const instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, disposables);
            const languageService = instantiationService.get(language_1.ILanguageService);
            const service = disposables.add(instantiationService.createInstance(textEditorService_1.TextEditorService));
            const languageId = 'create-input-test';
            disposables.add(languageService.registerLanguage({
                id: languageId,
            }));
            // Untyped Input (file)
            let input = disposables.add(service.createTextEditor({ resource: utils_1.toResource.call(this, '/index.html'), options: { selection: { startLineNumber: 1, startColumn: 1 } } }));
            assert(input instanceof fileEditorInput_1.FileEditorInput);
            let contentInput = input;
            assert.strictEqual(contentInput.resource.fsPath, utils_1.toResource.call(this, '/index.html').fsPath);
            // Untyped Input (file casing)
            input = disposables.add(service.createTextEditor({ resource: utils_1.toResource.call(this, '/index.html') }));
            const inputDifferentCase = disposables.add(service.createTextEditor({ resource: utils_1.toResource.call(this, '/INDEX.html') }));
            if (!platform_1.isLinux) {
                assert.strictEqual(input, inputDifferentCase);
                assert.strictEqual(input.resource?.toString(), inputDifferentCase.resource?.toString());
            }
            else {
                assert.notStrictEqual(input, inputDifferentCase);
                assert.notStrictEqual(input.resource?.toString(), inputDifferentCase.resource?.toString());
            }
            // Typed Input
            assert.strictEqual(disposables.add(service.createTextEditor(input)), input);
            // Untyped Input (file, encoding)
            input = disposables.add(service.createTextEditor({ resource: utils_1.toResource.call(this, '/index.html'), encoding: 'utf16le', options: { selection: { startLineNumber: 1, startColumn: 1 } } }));
            assert(input instanceof fileEditorInput_1.FileEditorInput);
            contentInput = input;
            assert.strictEqual(contentInput.getPreferredEncoding(), 'utf16le');
            // Untyped Input (file, language)
            input = disposables.add(service.createTextEditor({ resource: utils_1.toResource.call(this, '/index.html'), languageId: languageId }));
            assert(input instanceof fileEditorInput_1.FileEditorInput);
            contentInput = input;
            assert.strictEqual(contentInput.getPreferredLanguageId(), languageId);
            let fileModel = disposables.add(await contentInput.resolve());
            assert.strictEqual(fileModel.textEditorModel?.getLanguageId(), languageId);
            // Untyped Input (file, contents)
            input = disposables.add(service.createTextEditor({ resource: utils_1.toResource.call(this, '/index.html'), contents: 'My contents' }));
            assert(input instanceof fileEditorInput_1.FileEditorInput);
            contentInput = input;
            fileModel = disposables.add(await contentInput.resolve());
            assert.strictEqual(fileModel.textEditorModel?.getValue(), 'My contents');
            assert.strictEqual(fileModel.isDirty(), true);
            // Untyped Input (file, different language)
            input = disposables.add(service.createTextEditor({ resource: utils_1.toResource.call(this, '/index.html'), languageId: 'text' }));
            assert(input instanceof fileEditorInput_1.FileEditorInput);
            contentInput = input;
            assert.strictEqual(contentInput.getPreferredLanguageId(), 'text');
            // Untyped Input (untitled)
            input = disposables.add(service.createTextEditor({ resource: undefined, options: { selection: { startLineNumber: 1, startColumn: 1 } } }));
            assert(input instanceof untitledTextEditorInput_1.UntitledTextEditorInput);
            // Untyped Input (untitled with contents)
            let untypedInput = { contents: 'Hello Untitled', options: { selection: { startLineNumber: 1, startColumn: 1 } } };
            input = disposables.add(service.createTextEditor(untypedInput));
            assert.ok((0, editor_1.isUntitledResourceEditorInput)(untypedInput));
            assert(input instanceof untitledTextEditorInput_1.UntitledTextEditorInput);
            let model = disposables.add(await input.resolve());
            assert.strictEqual(model.textEditorModel?.getValue(), 'Hello Untitled');
            // Untyped Input (untitled with language id)
            input = disposables.add(service.createTextEditor({ resource: undefined, languageId: languageId, options: { selection: { startLineNumber: 1, startColumn: 1 } } }));
            assert(input instanceof untitledTextEditorInput_1.UntitledTextEditorInput);
            model = disposables.add(await input.resolve());
            assert.strictEqual(model.getLanguageId(), languageId);
            // Untyped Input (untitled with file path)
            input = disposables.add(service.createTextEditor({ resource: uri_1.URI.file('/some/path.txt'), forceUntitled: true, options: { selection: { startLineNumber: 1, startColumn: 1 } } }));
            assert(input instanceof untitledTextEditorInput_1.UntitledTextEditorInput);
            assert.ok(input.model.hasAssociatedFilePath);
            // Untyped Input (untitled with untitled resource)
            untypedInput = { resource: uri_1.URI.parse('untitled://Untitled-1'), forceUntitled: true, options: { selection: { startLineNumber: 1, startColumn: 1 } } };
            assert.ok((0, editor_1.isUntitledResourceEditorInput)(untypedInput));
            input = disposables.add(service.createTextEditor(untypedInput));
            assert(input instanceof untitledTextEditorInput_1.UntitledTextEditorInput);
            assert.ok(!input.model.hasAssociatedFilePath);
            // Untyped input (untitled with custom resource, but forceUntitled)
            untypedInput = { resource: uri_1.URI.file('/fake'), forceUntitled: true };
            assert.ok((0, editor_1.isUntitledResourceEditorInput)(untypedInput));
            input = disposables.add(service.createTextEditor(untypedInput));
            assert(input instanceof untitledTextEditorInput_1.UntitledTextEditorInput);
            // Untyped Input (untitled with custom resource)
            const provider = disposables.add(instantiationService.createInstance(FileServiceProvider, 'untitled-custom'));
            input = disposables.add(service.createTextEditor({ resource: uri_1.URI.parse('untitled-custom://some/path'), forceUntitled: true, options: { selection: { startLineNumber: 1, startColumn: 1 } } }));
            assert(input instanceof untitledTextEditorInput_1.UntitledTextEditorInput);
            assert.ok(input.model.hasAssociatedFilePath);
            provider.dispose();
            // Untyped Input (resource)
            input = disposables.add(service.createTextEditor({ resource: uri_1.URI.parse('custom:resource') }));
            assert(input instanceof textResourceEditorInput_1.TextResourceEditorInput);
            // Untyped Input (diff)
            const resourceDiffInput = {
                modified: { resource: utils_1.toResource.call(this, '/modified.html') },
                original: { resource: utils_1.toResource.call(this, '/original.html') }
            };
            assert.strictEqual((0, editor_1.isResourceDiffEditorInput)(resourceDiffInput), true);
            input = disposables.add(service.createTextEditor(resourceDiffInput));
            assert(input instanceof diffEditorInput_1.DiffEditorInput);
            disposables.add(input.modified);
            disposables.add(input.original);
            assert.strictEqual(input.original.resource?.toString(), resourceDiffInput.original.resource.toString());
            assert.strictEqual(input.modified.resource?.toString(), resourceDiffInput.modified.resource.toString());
            const untypedDiffInput = input.toUntyped();
            assert.strictEqual(untypedDiffInput.original.resource?.toString(), resourceDiffInput.original.resource.toString());
            assert.strictEqual(untypedDiffInput.modified.resource?.toString(), resourceDiffInput.modified.resource.toString());
            // Untyped Input (side by side)
            const sideBySideResourceInput = {
                primary: { resource: utils_1.toResource.call(this, '/primary.html') },
                secondary: { resource: utils_1.toResource.call(this, '/secondary.html') }
            };
            assert.strictEqual((0, editor_1.isResourceSideBySideEditorInput)(sideBySideResourceInput), true);
            input = disposables.add(service.createTextEditor(sideBySideResourceInput));
            assert(input instanceof sideBySideEditorInput_1.SideBySideEditorInput);
            disposables.add(input.primary);
            disposables.add(input.secondary);
            assert.strictEqual(input.primary.resource?.toString(), sideBySideResourceInput.primary.resource.toString());
            assert.strictEqual(input.secondary.resource?.toString(), sideBySideResourceInput.secondary.resource.toString());
            const untypedSideBySideInput = input.toUntyped();
            assert.strictEqual(untypedSideBySideInput.primary.resource?.toString(), sideBySideResourceInput.primary.resource.toString());
            assert.strictEqual(untypedSideBySideInput.secondary.resource?.toString(), sideBySideResourceInput.secondary.resource.toString());
        });
        test('createTextEditor- caching', function () {
            const instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, disposables);
            const service = disposables.add(instantiationService.createInstance(textEditorService_1.TextEditorService));
            // Cached Input (Files)
            const fileResource1 = utils_1.toResource.call(this, '/foo/bar/cache1.js');
            const fileEditorInput1 = disposables.add(service.createTextEditor({ resource: fileResource1 }));
            assert.ok(fileEditorInput1);
            const fileResource2 = utils_1.toResource.call(this, '/foo/bar/cache2.js');
            const fileEditorInput2 = disposables.add(service.createTextEditor({ resource: fileResource2 }));
            assert.ok(fileEditorInput2);
            assert.notStrictEqual(fileEditorInput1, fileEditorInput2);
            const fileEditorInput1Again = disposables.add(service.createTextEditor({ resource: fileResource1 }));
            assert.strictEqual(fileEditorInput1Again, fileEditorInput1);
            fileEditorInput1Again.dispose();
            assert.ok(fileEditorInput1.isDisposed());
            const fileEditorInput1AgainAndAgain = disposables.add(service.createTextEditor({ resource: fileResource1 }));
            assert.notStrictEqual(fileEditorInput1AgainAndAgain, fileEditorInput1);
            assert.ok(!fileEditorInput1AgainAndAgain.isDisposed());
            // Cached Input (Resource)
            const resource1 = uri_1.URI.from({ scheme: 'custom', path: '/foo/bar/cache1.js' });
            const input1 = disposables.add(service.createTextEditor({ resource: resource1 }));
            assert.ok(input1);
            const resource2 = uri_1.URI.from({ scheme: 'custom', path: '/foo/bar/cache2.js' });
            const input2 = disposables.add(service.createTextEditor({ resource: resource2 }));
            assert.ok(input2);
            assert.notStrictEqual(input1, input2);
            const input1Again = disposables.add(service.createTextEditor({ resource: resource1 }));
            assert.strictEqual(input1Again, input1);
            input1Again.dispose();
            assert.ok(input1.isDisposed());
            const input1AgainAndAgain = disposables.add(service.createTextEditor({ resource: resource1 }));
            assert.notStrictEqual(input1AgainAndAgain, input1);
            assert.ok(!input1AgainAndAgain.isDisposed());
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dEVkaXRvclNlcnZpY2UudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy90ZXh0ZmlsZS90ZXN0L2Jyb3dzZXIvdGV4dEVkaXRvclNlcnZpY2UudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7OztJQXVCaEcsS0FBSyxDQUFDLG1CQUFtQixFQUFFLEdBQUcsRUFBRTtRQUUvQixNQUFNLGNBQWMsR0FBRyw4QkFBOEIsQ0FBQztRQUN0RCxNQUFNLG9CQUFvQixHQUFHLGlDQUFpQyxDQUFDO1FBRS9ELElBQU0sbUJBQW1CLEdBQXpCLE1BQU0sbUJBQW9CLFNBQVEsc0JBQVU7WUFDM0MsWUFBWSxNQUFjLEVBQWdCLFdBQXlCO2dCQUNsRSxLQUFLLEVBQUUsQ0FBQztnQkFFUixJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSwrQ0FBc0IsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNwRixDQUFDO1NBQ0QsQ0FBQTtRQU5LLG1CQUFtQjtZQUNLLFdBQUEsb0JBQVksQ0FBQTtXQURwQyxtQkFBbUIsQ0FNeEI7UUFFRCxNQUFNLFdBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztRQUUxQyxLQUFLLENBQUMsR0FBRyxFQUFFO1lBQ1YsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFBLDBDQUFrQixFQUFDLGNBQWMsRUFBRSxDQUFDLElBQUksNEJBQWMsQ0FBQywyQ0FBbUIsQ0FBQyxDQUFDLEVBQUUsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO1lBQ3JILFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBQSxrREFBMEIsR0FBRSxDQUFDLENBQUM7WUFDOUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFBLG9EQUE0QixHQUFFLENBQUMsQ0FBQztRQUNqRCxDQUFDLENBQUMs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