/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/uri", "vs/base/test/common/utils", "vs/workbench/common/editor", "vs/workbench/common/editor/diffEditorInput", "vs/workbench/common/editor/editorInput", "vs/workbench/common/editor/textResourceEditorInput", "vs/workbench/contrib/files/browser/editors/fileEditorInput", "vs/workbench/contrib/mergeEditor/browser/mergeEditorInput", "vs/workbench/services/untitled/common/untitledTextEditorInput", "vs/workbench/test/browser/workbenchTestServices"], function (require, exports, assert, lifecycle_1, network_1, uri_1, utils_1, editor_1, diffEditorInput_1, editorInput_1, textResourceEditorInput_1, fileEditorInput_1, mergeEditorInput_1, untitledTextEditorInput_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('EditorInput', () => {
        let instantiationService;
        let accessor;
        const disposables = new lifecycle_1.$jc();
        const testResource = uri_1.URI.from({ scheme: 'random', path: '/path' });
        const untypedResourceEditorInput = { resource: testResource, options: { override: editor_1.$HE.id } };
        const untypedTextResourceEditorInput = { resource: testResource, options: { override: editor_1.$HE.id } };
        const untypedResourceSideBySideEditorInput = { primary: untypedResourceEditorInput, secondary: untypedResourceEditorInput, options: { override: editor_1.$HE.id } };
        const untypedUntitledResourceEditorinput = { resource: uri_1.URI.from({ scheme: network_1.Schemas.untitled, path: '/path' }), options: { override: editor_1.$HE.id } };
        const untypedResourceDiffEditorInput = { original: untypedResourceEditorInput, modified: untypedResourceEditorInput, options: { override: editor_1.$HE.id } };
        const untypedResourceMergeEditorInput = { base: untypedResourceEditorInput, input1: untypedResourceEditorInput, input2: untypedResourceEditorInput, result: untypedResourceEditorInput, options: { override: editor_1.$HE.id } };
        // Function to easily remove the overrides from the untyped inputs
        const stripOverrides = () => {
            if (!untypedResourceEditorInput.options ||
                !untypedTextResourceEditorInput.options ||
                !untypedUntitledResourceEditorinput.options ||
                !untypedResourceDiffEditorInput.options ||
                !untypedResourceMergeEditorInput.options) {
                throw new Error('Malformed options on untyped inputs');
            }
            // Some of the tests mutate the overrides so we want to reset them on each test
            untypedResourceEditorInput.options.override = undefined;
            untypedTextResourceEditorInput.options.override = undefined;
            untypedUntitledResourceEditorinput.options.override = undefined;
            untypedResourceDiffEditorInput.options.override = undefined;
            untypedResourceMergeEditorInput.options.override = undefined;
        };
        setup(() => {
            instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            accessor = instantiationService.createInstance(workbenchTestServices_1.$mec);
            if (!untypedResourceEditorInput.options ||
                !untypedTextResourceEditorInput.options ||
                !untypedUntitledResourceEditorinput.options ||
                !untypedResourceDiffEditorInput.options ||
                !untypedResourceMergeEditorInput.options) {
                throw new Error('Malformed options on untyped inputs');
            }
            // Some of the tests mutate the overrides so we want to reset them on each test
            untypedResourceEditorInput.options.override = editor_1.$HE.id;
            untypedTextResourceEditorInput.options.override = editor_1.$HE.id;
            untypedUntitledResourceEditorinput.options.override = editor_1.$HE.id;
            untypedResourceDiffEditorInput.options.override = editor_1.$HE.id;
            untypedResourceMergeEditorInput.options.override = editor_1.$HE.id;
        });
        teardown(() => {
            disposables.clear();
        });
        class MyEditorInput extends editorInput_1.$tA {
            constructor() {
                super(...arguments);
                this.resource = undefined;
            }
            get typeId() { return 'myEditorInput'; }
            resolve() { return null; }
        }
        test('basics', () => {
            let counter = 0;
            const input = disposables.add(new MyEditorInput());
            const otherInput = disposables.add(new MyEditorInput());
            assert.ok((0, editor_1.$UE)(input));
            assert.ok(!(0, editor_1.$UE)(undefined));
            assert.ok(!(0, editor_1.$UE)({ resource: uri_1.URI.file('/') }));
            assert.ok(!(0, editor_1.$UE)({}));
            assert.ok(!(0, editor_1.$NE)(input));
            assert.ok(!(0, editor_1.$QE)(input));
            assert.ok(!(0, editor_1.$OE)(input));
            assert.ok(!(0, editor_1.$RE)(input));
            assert.ok(!(0, editor_1.$PE)(input));
            assert(input.matches(input));
            assert(!input.matches(otherInput));
            assert(input.getName());
            disposables.add(input.onWillDispose(() => {
                assert(true);
                counter++;
            }));
            input.dispose();
            assert.strictEqual(counter, 1);
        });
        test('untyped matches', () => {
            const testInputID = 'untypedMatches';
            const testInputResource = uri_1.URI.file('/fake');
            const testInput = disposables.add(new workbenchTestServices_1.$Uec(testInputResource, testInputID));
            const testUntypedInput = { resource: testInputResource, options: { override: testInputID } };
            const tetUntypedInputWrongResource = { resource: uri_1.URI.file('/incorrectFake'), options: { override: testInputID } };
            const testUntypedInputWrongId = { resource: testInputResource, options: { override: 'wrongId' } };
            const testUntypedInputWrong = { resource: uri_1.URI.file('/incorrectFake'), options: { override: 'wrongId' } };
            assert(testInput.matches(testUntypedInput));
            assert.ok(!testInput.matches(tetUntypedInputWrongResource));
            assert.ok(!testInput.matches(testUntypedInputWrongId));
            assert.ok(!testInput.matches(testUntypedInputWrong));
        });
        test('Untpyed inputs properly match TextResourceEditorInput', () => {
            const textResourceEditorInput = instantiationService.createInstance(textResourceEditorInput_1.$7eb, testResource, undefined, undefined, undefined, undefined);
            assert.ok(textResourceEditorInput.matches(untypedResourceEditorInput));
            assert.ok(textResourceEditorInput.matches(untypedTextResourceEditorInput));
            assert.ok(!textResourceEditorInput.matches(untypedResourceSideBySideEditorInput));
            assert.ok(!textResourceEditorInput.matches(untypedUntitledResourceEditorinput));
            assert.ok(!textResourceEditorInput.matches(untypedResourceDiffEditorInput));
            assert.ok(!textResourceEditorInput.matches(untypedResourceMergeEditorInput));
            textResourceEditorInput.dispose();
        });
        test('Untyped inputs properly match FileEditorInput', () => {
            const fileEditorInput = instantiationService.createInstance(fileEditorInput_1.$ULb, testResource, undefined, undefined, undefined, undefined, undefined, undefined);
            assert.ok(fileEditorInput.matches(untypedResourceEditorInput));
            assert.ok(fileEditorInput.matches(untypedTextResourceEditorInput));
            assert.ok(!fileEditorInput.matches(untypedResourceSideBySideEditorInput));
            assert.ok(!fileEditorInput.matches(untypedUntitledResourceEditorinput));
            assert.ok(!fileEditorInput.matches(untypedResourceDiffEditorInput));
            assert.ok(!fileEditorInput.matches(untypedResourceMergeEditorInput));
            // Now we remove the override on the untyped to ensure that FileEditorInput supports lightweight resource matching
            stripOverrides();
            assert.ok(fileEditorInput.matches(untypedResourceEditorInput));
            assert.ok(fileEditorInput.matches(untypedTextResourceEditorInput));
            assert.ok(!fileEditorInput.matches(untypedResourceSideBySideEditorInput));
            assert.ok(!fileEditorInput.matches(untypedUntitledResourceEditorinput));
            assert.ok(!fileEditorInput.matches(untypedResourceDiffEditorInput));
            assert.ok(!fileEditorInput.matches(untypedResourceMergeEditorInput));
            fileEditorInput.dispose();
        });
        test('Untyped inputs properly match MergeEditorInput', () => {
            const mergeData = { uri: testResource, description: undefined, detail: undefined, title: undefined };
            const mergeEditorInput = instantiationService.createInstance(mergeEditorInput_1.$hkb, testResource, mergeData, mergeData, testResource);
            assert.ok(!mergeEditorInput.matches(untypedResourceEditorInput));
            assert.ok(!mergeEditorInput.matches(untypedTextResourceEditorInput));
            assert.ok(!mergeEditorInput.matches(untypedResourceSideBySideEditorInput));
            assert.ok(!mergeEditorInput.matches(untypedUntitledResourceEditorinput));
            assert.ok(!mergeEditorInput.matches(untypedResourceDiffEditorInput));
            assert.ok(mergeEditorInput.matches(untypedResourceMergeEditorInput));
            stripOverrides();
            assert.ok(!mergeEditorInput.matches(untypedResourceEditorInput));
            assert.ok(!mergeEditorInput.matches(untypedTextResourceEditorInput));
            assert.ok(!mergeEditorInput.matches(untypedResourceSideBySideEditorInput));
            assert.ok(!mergeEditorInput.matches(untypedUntitledResourceEditorinput));
            assert.ok(!mergeEditorInput.matches(untypedResourceDiffEditorInput));
            assert.ok(mergeEditorInput.matches(untypedResourceMergeEditorInput));
            mergeEditorInput.dispose();
        });
        test('Untyped inputs properly match UntitledTextEditorInput', () => {
            const untitledModel = accessor.untitledTextEditorService.create({ associatedResource: { authority: '', path: '/path', fragment: '', query: '' } });
            const untitledTextEditorInput = instantiationService.createInstance(untitledTextEditorInput_1.$Bvb, untitledModel);
            assert.ok(!untitledTextEditorInput.matches(untypedResourceEditorInput));
            assert.ok(!untitledTextEditorInput.matches(untypedTextResourceEditorInput));
            assert.ok(!untitledTextEditorInput.matches(untypedResourceSideBySideEditorInput));
            assert.ok(untitledTextEditorInput.matches(untypedUntitledResourceEditorinput));
            assert.ok(!untitledTextEditorInput.matches(untypedResourceDiffEditorInput));
            assert.ok(!untitledTextEditorInput.matches(untypedResourceMergeEditorInput));
            stripOverrides();
            assert.ok(!untitledTextEditorInput.matches(untypedResourceEditorInput));
            assert.ok(!untitledTextEditorInput.matches(untypedTextResourceEditorInput));
            assert.ok(!untitledTextEditorInput.matches(untypedResourceSideBySideEditorInput));
            assert.ok(untitledTextEditorInput.matches(untypedUntitledResourceEditorinput));
            assert.ok(!untitledTextEditorInput.matches(untypedResourceDiffEditorInput));
            assert.ok(!untitledTextEditorInput.matches(untypedResourceMergeEditorInput));
            untitledTextEditorInput.dispose();
        });
        test('Untyped inputs properly match DiffEditorInput', () => {
            const fileEditorInput1 = instantiationService.createInstance(fileEditorInput_1.$ULb, testResource, undefined, undefined, undefined, undefined, undefined, undefined);
            const fileEditorInput2 = instantiationService.createInstance(fileEditorInput_1.$ULb, testResource, undefined, undefined, undefined, undefined, undefined, undefined);
            const diffEditorInput = instantiationService.createInstance(diffEditorInput_1.$3eb, undefined, undefined, fileEditorInput1, fileEditorInput2, false);
            assert.ok(!diffEditorInput.matches(untypedResourceEditorInput));
            assert.ok(!diffEditorInput.matches(untypedTextResourceEditorInput));
            assert.ok(!diffEditorInput.matches(untypedResourceSideBySideEditorInput));
            assert.ok(!diffEditorInput.matches(untypedUntitledResourceEditorinput));
            assert.ok(diffEditorInput.matches(untypedResourceDiffEditorInput));
            assert.ok(!diffEditorInput.matches(untypedResourceMergeEditorInput));
            stripOverrides();
            assert.ok(!diffEditorInput.matches(untypedResourceEditorInput));
            assert.ok(!diffEditorInput.matches(untypedTextResourceEditorInput));
            assert.ok(!diffEditorInput.matches(untypedResourceSideBySideEditorInput));
            assert.ok(!diffEditorInput.matches(untypedUntitledResourceEditorinput));
            assert.ok(diffEditorInput.matches(untypedResourceDiffEditorInput));
            assert.ok(!diffEditorInput.matches(untypedResourceMergeEditorInput));
            diffEditorInput.dispose();
            fileEditorInput1.dispose();
            fileEditorInput2.dispose();
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=editorInput.test.js.map