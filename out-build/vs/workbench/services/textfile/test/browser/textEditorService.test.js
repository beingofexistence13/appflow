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
        let FileServiceProvider = class FileServiceProvider extends lifecycle_1.$kc {
            constructor(scheme, fileService) {
                super();
                this.B(fileService.registerProvider(scheme, new nullFileSystemProvider_1.$y$b()));
            }
        };
        FileServiceProvider = __decorate([
            __param(1, files_1.$6j)
        ], FileServiceProvider);
        const disposables = new lifecycle_1.$jc();
        setup(() => {
            disposables.add((0, workbenchTestServices_1.$Vec)(TEST_EDITOR_ID, [new descriptors_1.$yh(workbenchTestServices_1.$Zec)], TEST_EDITOR_INPUT_ID));
            disposables.add((0, workbenchTestServices_1.$Xec)());
            disposables.add((0, workbenchTestServices_1.$Yec)());
        });
        teardown(() => {
            disposables.clear();
        });
        test('createTextEditor - basics', async function () {
            const instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            const languageService = instantiationService.get(language_1.$ct);
            const service = disposables.add(instantiationService.createInstance(textEditorService_1.$txb));
            const languageId = 'create-input-test';
            disposables.add(languageService.registerLanguage({
                id: languageId,
            }));
            // Untyped Input (file)
            let input = disposables.add(service.createTextEditor({ resource: utils_1.$0S.call(this, '/index.html'), options: { selection: { startLineNumber: 1, startColumn: 1 } } }));
            assert(input instanceof fileEditorInput_1.$ULb);
            let contentInput = input;
            assert.strictEqual(contentInput.resource.fsPath, utils_1.$0S.call(this, '/index.html').fsPath);
            // Untyped Input (file casing)
            input = disposables.add(service.createTextEditor({ resource: utils_1.$0S.call(this, '/index.html') }));
            const inputDifferentCase = disposables.add(service.createTextEditor({ resource: utils_1.$0S.call(this, '/INDEX.html') }));
            if (!platform_1.$k) {
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
            input = disposables.add(service.createTextEditor({ resource: utils_1.$0S.call(this, '/index.html'), encoding: 'utf16le', options: { selection: { startLineNumber: 1, startColumn: 1 } } }));
            assert(input instanceof fileEditorInput_1.$ULb);
            contentInput = input;
            assert.strictEqual(contentInput.getPreferredEncoding(), 'utf16le');
            // Untyped Input (file, language)
            input = disposables.add(service.createTextEditor({ resource: utils_1.$0S.call(this, '/index.html'), languageId: languageId }));
            assert(input instanceof fileEditorInput_1.$ULb);
            contentInput = input;
            assert.strictEqual(contentInput.getPreferredLanguageId(), languageId);
            let fileModel = disposables.add(await contentInput.resolve());
            assert.strictEqual(fileModel.textEditorModel?.getLanguageId(), languageId);
            // Untyped Input (file, contents)
            input = disposables.add(service.createTextEditor({ resource: utils_1.$0S.call(this, '/index.html'), contents: 'My contents' }));
            assert(input instanceof fileEditorInput_1.$ULb);
            contentInput = input;
            fileModel = disposables.add(await contentInput.resolve());
            assert.strictEqual(fileModel.textEditorModel?.getValue(), 'My contents');
            assert.strictEqual(fileModel.isDirty(), true);
            // Untyped Input (file, different language)
            input = disposables.add(service.createTextEditor({ resource: utils_1.$0S.call(this, '/index.html'), languageId: 'text' }));
            assert(input instanceof fileEditorInput_1.$ULb);
            contentInput = input;
            assert.strictEqual(contentInput.getPreferredLanguageId(), 'text');
            // Untyped Input (untitled)
            input = disposables.add(service.createTextEditor({ resource: undefined, options: { selection: { startLineNumber: 1, startColumn: 1 } } }));
            assert(input instanceof untitledTextEditorInput_1.$Bvb);
            // Untyped Input (untitled with contents)
            let untypedInput = { contents: 'Hello Untitled', options: { selection: { startLineNumber: 1, startColumn: 1 } } };
            input = disposables.add(service.createTextEditor(untypedInput));
            assert.ok((0, editor_1.$QE)(untypedInput));
            assert(input instanceof untitledTextEditorInput_1.$Bvb);
            let model = disposables.add(await input.resolve());
            assert.strictEqual(model.textEditorModel?.getValue(), 'Hello Untitled');
            // Untyped Input (untitled with language id)
            input = disposables.add(service.createTextEditor({ resource: undefined, languageId: languageId, options: { selection: { startLineNumber: 1, startColumn: 1 } } }));
            assert(input instanceof untitledTextEditorInput_1.$Bvb);
            model = disposables.add(await input.resolve());
            assert.strictEqual(model.getLanguageId(), languageId);
            // Untyped Input (untitled with file path)
            input = disposables.add(service.createTextEditor({ resource: uri_1.URI.file('/some/path.txt'), forceUntitled: true, options: { selection: { startLineNumber: 1, startColumn: 1 } } }));
            assert(input instanceof untitledTextEditorInput_1.$Bvb);
            assert.ok(input.model.hasAssociatedFilePath);
            // Untyped Input (untitled with untitled resource)
            untypedInput = { resource: uri_1.URI.parse('untitled://Untitled-1'), forceUntitled: true, options: { selection: { startLineNumber: 1, startColumn: 1 } } };
            assert.ok((0, editor_1.$QE)(untypedInput));
            input = disposables.add(service.createTextEditor(untypedInput));
            assert(input instanceof untitledTextEditorInput_1.$Bvb);
            assert.ok(!input.model.hasAssociatedFilePath);
            // Untyped input (untitled with custom resource, but forceUntitled)
            untypedInput = { resource: uri_1.URI.file('/fake'), forceUntitled: true };
            assert.ok((0, editor_1.$QE)(untypedInput));
            input = disposables.add(service.createTextEditor(untypedInput));
            assert(input instanceof untitledTextEditorInput_1.$Bvb);
            // Untyped Input (untitled with custom resource)
            const provider = disposables.add(instantiationService.createInstance(FileServiceProvider, 'untitled-custom'));
            input = disposables.add(service.createTextEditor({ resource: uri_1.URI.parse('untitled-custom://some/path'), forceUntitled: true, options: { selection: { startLineNumber: 1, startColumn: 1 } } }));
            assert(input instanceof untitledTextEditorInput_1.$Bvb);
            assert.ok(input.model.hasAssociatedFilePath);
            provider.dispose();
            // Untyped Input (resource)
            input = disposables.add(service.createTextEditor({ resource: uri_1.URI.parse('custom:resource') }));
            assert(input instanceof textResourceEditorInput_1.$7eb);
            // Untyped Input (diff)
            const resourceDiffInput = {
                modified: { resource: utils_1.$0S.call(this, '/modified.html') },
                original: { resource: utils_1.$0S.call(this, '/original.html') }
            };
            assert.strictEqual((0, editor_1.$OE)(resourceDiffInput), true);
            input = disposables.add(service.createTextEditor(resourceDiffInput));
            assert(input instanceof diffEditorInput_1.$3eb);
            disposables.add(input.modified);
            disposables.add(input.original);
            assert.strictEqual(input.original.resource?.toString(), resourceDiffInput.original.resource.toString());
            assert.strictEqual(input.modified.resource?.toString(), resourceDiffInput.modified.resource.toString());
            const untypedDiffInput = input.toUntyped();
            assert.strictEqual(untypedDiffInput.original.resource?.toString(), resourceDiffInput.original.resource.toString());
            assert.strictEqual(untypedDiffInput.modified.resource?.toString(), resourceDiffInput.modified.resource.toString());
            // Untyped Input (side by side)
            const sideBySideResourceInput = {
                primary: { resource: utils_1.$0S.call(this, '/primary.html') },
                secondary: { resource: utils_1.$0S.call(this, '/secondary.html') }
            };
            assert.strictEqual((0, editor_1.$PE)(sideBySideResourceInput), true);
            input = disposables.add(service.createTextEditor(sideBySideResourceInput));
            assert(input instanceof sideBySideEditorInput_1.$VC);
            disposables.add(input.primary);
            disposables.add(input.secondary);
            assert.strictEqual(input.primary.resource?.toString(), sideBySideResourceInput.primary.resource.toString());
            assert.strictEqual(input.secondary.resource?.toString(), sideBySideResourceInput.secondary.resource.toString());
            const untypedSideBySideInput = input.toUntyped();
            assert.strictEqual(untypedSideBySideInput.primary.resource?.toString(), sideBySideResourceInput.primary.resource.toString());
            assert.strictEqual(untypedSideBySideInput.secondary.resource?.toString(), sideBySideResourceInput.secondary.resource.toString());
        });
        test('createTextEditor- caching', function () {
            const instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            const service = disposables.add(instantiationService.createInstance(textEditorService_1.$txb));
            // Cached Input (Files)
            const fileResource1 = utils_1.$0S.call(this, '/foo/bar/cache1.js');
            const fileEditorInput1 = disposables.add(service.createTextEditor({ resource: fileResource1 }));
            assert.ok(fileEditorInput1);
            const fileResource2 = utils_1.$0S.call(this, '/foo/bar/cache2.js');
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
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=textEditorService.test.js.map