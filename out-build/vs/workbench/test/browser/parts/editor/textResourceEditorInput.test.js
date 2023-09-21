/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/workbench/common/editor/textResourceEditorInput", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/services/textfile/common/textfiles", "vs/editor/common/languages/modesRegistry", "vs/base/common/lifecycle", "vs/base/test/common/utils"], function (require, exports, assert, uri_1, textResourceEditorInput_1, workbenchTestServices_1, textfiles_1, modesRegistry_1, lifecycle_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('TextResourceEditorInput', () => {
        const disposables = new lifecycle_1.$jc();
        let instantiationService;
        let accessor;
        setup(() => {
            instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            accessor = instantiationService.createInstance(workbenchTestServices_1.$mec);
        });
        teardown(() => {
            disposables.clear();
        });
        test('basics', async () => {
            const resource = uri_1.URI.from({ scheme: 'inmemory', authority: null, path: 'thePath' });
            accessor.modelService.createModel('function test() {}', accessor.languageService.createById(modesRegistry_1.$Yt), resource);
            const input = disposables.add(instantiationService.createInstance(textResourceEditorInput_1.$7eb, resource, 'The Name', 'The Description', undefined, undefined));
            const model = disposables.add(await input.resolve());
            assert.ok(model);
            assert.strictEqual((0, textfiles_1.$MD)((model.createSnapshot())), 'function test() {}');
        });
        test('preferred language (via ctor)', async () => {
            const registration = accessor.languageService.registerLanguage({
                id: 'resource-input-test',
            });
            const resource = uri_1.URI.from({ scheme: 'inmemory', authority: null, path: 'thePath' });
            accessor.modelService.createModel('function test() {}', accessor.languageService.createById(modesRegistry_1.$Yt), resource);
            const input = disposables.add(instantiationService.createInstance(textResourceEditorInput_1.$7eb, resource, 'The Name', 'The Description', 'resource-input-test', undefined));
            const model = disposables.add(await input.resolve());
            assert.ok(model);
            assert.strictEqual(model.textEditorModel?.getLanguageId(), 'resource-input-test');
            input.setLanguageId('text');
            assert.strictEqual(model.textEditorModel?.getLanguageId(), modesRegistry_1.$Yt);
            disposables.add(await input.resolve());
            assert.strictEqual(model.textEditorModel?.getLanguageId(), modesRegistry_1.$Yt);
            registration.dispose();
        });
        test('preferred language (via setPreferredLanguageId)', async () => {
            const registration = accessor.languageService.registerLanguage({
                id: 'resource-input-test',
            });
            const resource = uri_1.URI.from({ scheme: 'inmemory', authority: null, path: 'thePath' });
            accessor.modelService.createModel('function test() {}', accessor.languageService.createById(modesRegistry_1.$Yt), resource);
            const input = disposables.add(instantiationService.createInstance(textResourceEditorInput_1.$7eb, resource, 'The Name', 'The Description', undefined, undefined));
            input.setPreferredLanguageId('resource-input-test');
            const model = disposables.add(await input.resolve());
            assert.ok(model);
            assert.strictEqual(model.textEditorModel?.getLanguageId(), 'resource-input-test');
            registration.dispose();
        });
        test('preferred contents (via ctor)', async () => {
            const resource = uri_1.URI.from({ scheme: 'inmemory', authority: null, path: 'thePath' });
            accessor.modelService.createModel('function test() {}', accessor.languageService.createById(modesRegistry_1.$Yt), resource);
            const input = disposables.add(instantiationService.createInstance(textResourceEditorInput_1.$7eb, resource, 'The Name', 'The Description', undefined, 'My Resource Input Contents'));
            const model = disposables.add(await input.resolve());
            assert.ok(model);
            assert.strictEqual(model.textEditorModel?.getValue(), 'My Resource Input Contents');
            model.textEditorModel.setValue('Some other contents');
            assert.strictEqual(model.textEditorModel?.getValue(), 'Some other contents');
            disposables.add(await input.resolve());
            assert.strictEqual(model.textEditorModel?.getValue(), 'Some other contents'); // preferred contents only used once
        });
        test('preferred contents (via setPreferredContents)', async () => {
            const resource = uri_1.URI.from({ scheme: 'inmemory', authority: null, path: 'thePath' });
            accessor.modelService.createModel('function test() {}', accessor.languageService.createById(modesRegistry_1.$Yt), resource);
            const input = disposables.add(instantiationService.createInstance(textResourceEditorInput_1.$7eb, resource, 'The Name', 'The Description', undefined, undefined));
            input.setPreferredContents('My Resource Input Contents');
            const model = disposables.add(await input.resolve());
            assert.ok(model);
            assert.strictEqual(model.textEditorModel?.getValue(), 'My Resource Input Contents');
            model.textEditorModel.setValue('Some other contents');
            assert.strictEqual(model.textEditorModel?.getValue(), 'Some other contents');
            disposables.add(await input.resolve());
            assert.strictEqual(model.textEditorModel?.getValue(), 'Some other contents'); // preferred contents only used once
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=textResourceEditorInput.test.js.map