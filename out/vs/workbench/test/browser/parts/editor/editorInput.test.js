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
        const disposables = new lifecycle_1.DisposableStore();
        const testResource = uri_1.URI.from({ scheme: 'random', path: '/path' });
        const untypedResourceEditorInput = { resource: testResource, options: { override: editor_1.DEFAULT_EDITOR_ASSOCIATION.id } };
        const untypedTextResourceEditorInput = { resource: testResource, options: { override: editor_1.DEFAULT_EDITOR_ASSOCIATION.id } };
        const untypedResourceSideBySideEditorInput = { primary: untypedResourceEditorInput, secondary: untypedResourceEditorInput, options: { override: editor_1.DEFAULT_EDITOR_ASSOCIATION.id } };
        const untypedUntitledResourceEditorinput = { resource: uri_1.URI.from({ scheme: network_1.Schemas.untitled, path: '/path' }), options: { override: editor_1.DEFAULT_EDITOR_ASSOCIATION.id } };
        const untypedResourceDiffEditorInput = { original: untypedResourceEditorInput, modified: untypedResourceEditorInput, options: { override: editor_1.DEFAULT_EDITOR_ASSOCIATION.id } };
        const untypedResourceMergeEditorInput = { base: untypedResourceEditorInput, input1: untypedResourceEditorInput, input2: untypedResourceEditorInput, result: untypedResourceEditorInput, options: { override: editor_1.DEFAULT_EDITOR_ASSOCIATION.id } };
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
            instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, disposables);
            accessor = instantiationService.createInstance(workbenchTestServices_1.TestServiceAccessor);
            if (!untypedResourceEditorInput.options ||
                !untypedTextResourceEditorInput.options ||
                !untypedUntitledResourceEditorinput.options ||
                !untypedResourceDiffEditorInput.options ||
                !untypedResourceMergeEditorInput.options) {
                throw new Error('Malformed options on untyped inputs');
            }
            // Some of the tests mutate the overrides so we want to reset them on each test
            untypedResourceEditorInput.options.override = editor_1.DEFAULT_EDITOR_ASSOCIATION.id;
            untypedTextResourceEditorInput.options.override = editor_1.DEFAULT_EDITOR_ASSOCIATION.id;
            untypedUntitledResourceEditorinput.options.override = editor_1.DEFAULT_EDITOR_ASSOCIATION.id;
            untypedResourceDiffEditorInput.options.override = editor_1.DEFAULT_EDITOR_ASSOCIATION.id;
            untypedResourceMergeEditorInput.options.override = editor_1.DEFAULT_EDITOR_ASSOCIATION.id;
        });
        teardown(() => {
            disposables.clear();
        });
        class MyEditorInput extends editorInput_1.EditorInput {
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
            assert.ok((0, editor_1.isEditorInput)(input));
            assert.ok(!(0, editor_1.isEditorInput)(undefined));
            assert.ok(!(0, editor_1.isEditorInput)({ resource: uri_1.URI.file('/') }));
            assert.ok(!(0, editor_1.isEditorInput)({}));
            assert.ok(!(0, editor_1.isResourceEditorInput)(input));
            assert.ok(!(0, editor_1.isUntitledResourceEditorInput)(input));
            assert.ok(!(0, editor_1.isResourceDiffEditorInput)(input));
            assert.ok(!(0, editor_1.isResourceMergeEditorInput)(input));
            assert.ok(!(0, editor_1.isResourceSideBySideEditorInput)(input));
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
            const testInput = disposables.add(new workbenchTestServices_1.TestEditorInput(testInputResource, testInputID));
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
            const textResourceEditorInput = instantiationService.createInstance(textResourceEditorInput_1.TextResourceEditorInput, testResource, undefined, undefined, undefined, undefined);
            assert.ok(textResourceEditorInput.matches(untypedResourceEditorInput));
            assert.ok(textResourceEditorInput.matches(untypedTextResourceEditorInput));
            assert.ok(!textResourceEditorInput.matches(untypedResourceSideBySideEditorInput));
            assert.ok(!textResourceEditorInput.matches(untypedUntitledResourceEditorinput));
            assert.ok(!textResourceEditorInput.matches(untypedResourceDiffEditorInput));
            assert.ok(!textResourceEditorInput.matches(untypedResourceMergeEditorInput));
            textResourceEditorInput.dispose();
        });
        test('Untyped inputs properly match FileEditorInput', () => {
            const fileEditorInput = instantiationService.createInstance(fileEditorInput_1.FileEditorInput, testResource, undefined, undefined, undefined, undefined, undefined, undefined);
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
            const mergeEditorInput = instantiationService.createInstance(mergeEditorInput_1.MergeEditorInput, testResource, mergeData, mergeData, testResource);
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
            const untitledTextEditorInput = instantiationService.createInstance(untitledTextEditorInput_1.UntitledTextEditorInput, untitledModel);
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
            const fileEditorInput1 = instantiationService.createInstance(fileEditorInput_1.FileEditorInput, testResource, undefined, undefined, undefined, undefined, undefined, undefined);
            const fileEditorInput2 = instantiationService.createInstance(fileEditorInput_1.FileEditorInput, testResource, undefined, undefined, undefined, undefined, undefined, undefined);
            const diffEditorInput = instantiationService.createInstance(diffEditorInput_1.DiffEditorInput, undefined, undefined, fileEditorInput1, fileEditorInput2, false);
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
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9ySW5wdXQudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC90ZXN0L2Jyb3dzZXIvcGFydHMvZWRpdG9yL2VkaXRvcklucHV0LnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFrQmhHLEtBQUssQ0FBQyxhQUFhLEVBQUUsR0FBRyxFQUFFO1FBRXpCLElBQUksb0JBQTJDLENBQUM7UUFDaEQsSUFBSSxRQUE2QixDQUFDO1FBQ2xDLE1BQU0sV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1FBRTFDLE1BQU0sWUFBWSxHQUFRLFNBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ3hFLE1BQU0sMEJBQTBCLEdBQXlCLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsRUFBRSxRQUFRLEVBQUUsbUNBQTBCLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQztRQUMxSSxNQUFNLDhCQUE4QixHQUE2QixFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLEVBQUUsUUFBUSxFQUFFLG1DQUEwQixDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUM7UUFDbEosTUFBTSxvQ0FBb0MsR0FBbUMsRUFBRSxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsU0FBUyxFQUFFLDBCQUEwQixFQUFFLE9BQU8sRUFBRSxFQUFFLFFBQVEsRUFBRSxtQ0FBMEIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDO1FBQ2xOLE1BQU0sa0NBQWtDLEdBQXFDLEVBQUUsUUFBUSxFQUFFLFNBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsaUJBQU8sQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLEVBQUUsUUFBUSxFQUFFLG1DQUEwQixDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUM7UUFDdk0sTUFBTSw4QkFBOEIsR0FBNkIsRUFBRSxRQUFRLEVBQUUsMEJBQTBCLEVBQUUsUUFBUSxFQUFFLDBCQUEwQixFQUFFLE9BQU8sRUFBRSxFQUFFLFFBQVEsRUFBRSxtQ0FBMEIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDO1FBQ3RNLE1BQU0sK0JBQStCLEdBQThCLEVBQUUsSUFBSSxFQUFFLDBCQUEwQixFQUFFLE1BQU0sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSxFQUFFLDBCQUEwQixFQUFFLE9BQU8sRUFBRSxFQUFFLFFBQVEsRUFBRSxtQ0FBMEIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDO1FBRTFRLGtFQUFrRTtRQUNsRSxNQUFNLGNBQWMsR0FBRyxHQUFHLEVBQUU7WUFDM0IsSUFDQyxDQUFDLDBCQUEwQixDQUFDLE9BQU87Z0JBQ25DLENBQUMsOEJBQThCLENBQUMsT0FBTztnQkFDdkMsQ0FBQyxrQ0FBa0MsQ0FBQyxPQUFPO2dCQUMzQyxDQUFDLDhCQUE4QixDQUFDLE9BQU87Z0JBQ3ZDLENBQUMsK0JBQStCLENBQUMsT0FBTyxFQUN2QztnQkFDRCxNQUFNLElBQUksS0FBSyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7YUFDdkQ7WUFDRCwrRUFBK0U7WUFDL0UsMEJBQTBCLENBQUMsT0FBTyxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUM7WUFDeEQsOEJBQThCLENBQUMsT0FBTyxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUM7WUFDNUQsa0NBQWtDLENBQUMsT0FBTyxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUM7WUFDaEUsOEJBQThCLENBQUMsT0FBTyxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUM7WUFDNUQsK0JBQStCLENBQUMsT0FBTyxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUM7UUFDOUQsQ0FBQyxDQUFDO1FBRUYsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNWLG9CQUFvQixHQUFHLElBQUEscURBQTZCLEVBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQzdFLFFBQVEsR0FBRyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsMkNBQW1CLENBQUMsQ0FBQztZQUVwRSxJQUNDLENBQUMsMEJBQTBCLENBQUMsT0FBTztnQkFDbkMsQ0FBQyw4QkFBOEIsQ0FBQyxPQUFPO2dCQUN2QyxDQUFDLGtDQUFrQyxDQUFDLE9BQU87Z0JBQzNDLENBQUMsOEJBQThCLENBQUMsT0FBTztnQkFDdkMsQ0FBQywrQkFBK0IsQ0FBQyxPQUFPLEVBQ3ZDO2dCQUNELE1BQU0sSUFBSSxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQzthQUN2RDtZQUNELCtFQUErRTtZQUMvRSwwQkFBMEIsQ0FBQyxPQUFPLENBQUMsUUFBUSxHQUFHLG1DQUEwQixDQUFDLEVBQUUsQ0FBQztZQUM1RSw4QkFBOEIsQ0FBQyxPQUFPLENBQUMsUUFBUSxHQUFHLG1DQUEwQixDQUFDLEVBQUUsQ0FBQztZQUNoRixrQ0FBa0MsQ0FBQyxPQUFPLENBQUMsUUFBUSxHQUFHLG1DQUEwQixDQUFDLEVBQUUsQ0FBQztZQUNwRiw4QkFBOEIsQ0FBQyxPQUFPLENBQUMsUUFBUSxHQUFHLG1DQUEwQixDQUFDLEVBQUUsQ0FBQztZQUNoRiwrQkFBK0IsQ0FBQyxPQUFPLENBQUMsUUFBUSxHQUFHLG1DQUEwQixDQUFDLEVBQUUsQ0FBQztRQUNsRixDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxHQUFHLEVBQUU7WUFDYixXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDckIsQ0FBQyxDQUFDLENBQUM7UUFFSCxNQUFNLGFBQWMsU0FBUSx5QkFBVztZQUF2Qzs7Z0JBQ1UsYUFBUSxHQUFHLFNBQVMsQ0FBQztZQUkvQixDQUFDO1lBRkEsSUFBYSxNQUFNLEtBQWEsT0FBTyxlQUFlLENBQUMsQ0FBQyxDQUFDO1lBQ2hELE9BQU8sS0FBVSxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUM7U0FDeEM7UUFFRCxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRTtZQUNuQixJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUM7WUFDaEIsTUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLGFBQWEsRUFBRSxDQUFDLENBQUM7WUFDbkQsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLGFBQWEsRUFBRSxDQUFDLENBQUM7WUFFeEQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFBLHNCQUFhLEVBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNoQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBQSxzQkFBYSxFQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDckMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUEsc0JBQWEsRUFBQyxFQUFFLFFBQVEsRUFBRSxTQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3ZELE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFBLHNCQUFhLEVBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUU5QixNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBQSw4QkFBcUIsRUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFBLHNDQUE2QixFQUFDLEtBQVksQ0FBQyxDQUFDLENBQUM7WUFDeEQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUEsa0NBQXlCLEVBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUM3QyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBQSxtQ0FBMEIsRUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQzlDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFBLHdDQUErQixFQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFFbkQsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUM3QixNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDbkMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBRXhCLFdBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3hDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDYixPQUFPLEVBQUUsQ0FBQztZQUNYLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDaEIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDaEMsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxFQUFFO1lBQzVCLE1BQU0sV0FBVyxHQUFHLGdCQUFnQixDQUFDO1lBQ3JDLE1BQU0saUJBQWlCLEdBQUcsU0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM1QyxNQUFNLFNBQVMsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksdUNBQWUsQ0FBQyxpQkFBaUIsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ3ZGLE1BQU0sZ0JBQWdCLEdBQUcsRUFBRSxRQUFRLEVBQUUsaUJBQWlCLEVBQUUsT0FBTyxFQUFFLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxFQUFFLENBQUM7WUFDN0YsTUFBTSw0QkFBNEIsR0FBRyxFQUFFLFFBQVEsRUFBRSxTQUFHLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsT0FBTyxFQUFFLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxFQUFFLENBQUM7WUFDbEgsTUFBTSx1QkFBdUIsR0FBRyxFQUFFLFFBQVEsRUFBRSxpQkFBaUIsRUFBRSxPQUFPLEVBQUUsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLEVBQUUsQ0FBQztZQUNsRyxNQUFNLHFCQUFxQixHQUFHLEVBQUUsUUFBUSxFQUFFLFNBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxPQUFPLEVBQUUsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLEVBQUUsQ0FBQztZQUV6RyxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7WUFDNUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDO1lBQzVELE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQztZQUN2RCxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7UUFDdEQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsdURBQXVELEVBQUUsR0FBRyxFQUFFO1lBQ2xFLE1BQU0sdUJBQXVCLEdBQUcsb0JBQW9CLENBQUMsY0FBYyxDQUFDLGlEQUF1QixFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUV2SixNQUFNLENBQUMsRUFBRSxDQUFDLHVCQUF1QixDQUFDLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLENBQUM7WUFDdkUsTUFBTSxDQUFDLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQyxDQUFDO1lBQzNFLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsb0NBQW9DLENBQUMsQ0FBQyxDQUFDO1lBQ2xGLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsa0NBQWtDLENBQUMsQ0FBQyxDQUFDO1lBQ2hGLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQyxDQUFDO1lBQzVFLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsK0JBQStCLENBQUMsQ0FBQyxDQUFDO1lBRTdFLHVCQUF1QixDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ25DLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLCtDQUErQyxFQUFFLEdBQUcsRUFBRTtZQUMxRCxNQUFNLGVBQWUsR0FBRyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsaUNBQWUsRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUU3SixNQUFNLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxDQUFDO1lBQy9ELE1BQU0sQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLENBQUM7WUFDbkUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsb0NBQW9DLENBQUMsQ0FBQyxDQUFDO1lBQzFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLGtDQUFrQyxDQUFDLENBQUMsQ0FBQztZQUN4RSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLENBQUM7WUFDcEUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsK0JBQStCLENBQUMsQ0FBQyxDQUFDO1lBRXJFLGtIQUFrSDtZQUNsSCxjQUFjLEVBQUUsQ0FBQztZQUVqQixNQUFNLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxDQUFDO1lBQy9ELE1BQU0sQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLENBQUM7WUFDbkUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsb0NBQW9DLENBQUMsQ0FBQyxDQUFDO1lBQzFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLGtDQUFrQyxDQUFDLENBQUMsQ0FBQztZQUN4RSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLENBQUM7WUFDcEUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsK0JBQStCLENBQUMsQ0FBQyxDQUFDO1lBRXJFLGVBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUMzQixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxnREFBZ0QsRUFBRSxHQUFHLEVBQUU7WUFDM0QsTUFBTSxTQUFTLEdBQXlCLEVBQUUsR0FBRyxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDO1lBQzNILE1BQU0sZ0JBQWdCLEdBQUcsb0JBQW9CLENBQUMsY0FBYyxDQUFDLG1DQUFnQixFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBRWpJLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxDQUFDO1lBQ2pFLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQyxDQUFDO1lBQ3JFLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsb0NBQW9DLENBQUMsQ0FBQyxDQUFDO1lBQzNFLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsa0NBQWtDLENBQUMsQ0FBQyxDQUFDO1lBQ3pFLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQyxDQUFDO1lBQ3JFLE1BQU0sQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLCtCQUErQixDQUFDLENBQUMsQ0FBQztZQUVyRSxjQUFjLEVBQUUsQ0FBQztZQUVqQixNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQztZQUNqRSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUMsQ0FBQztZQUNyRSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLG9DQUFvQyxDQUFDLENBQUMsQ0FBQztZQUMzRSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLGtDQUFrQyxDQUFDLENBQUMsQ0FBQztZQUN6RSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUMsQ0FBQztZQUNyRSxNQUFNLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQywrQkFBK0IsQ0FBQyxDQUFDLENBQUM7WUFFckUsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDNUIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsdURBQXVELEVBQUUsR0FBRyxFQUFFO1lBQ2xFLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyx5QkFBeUIsQ0FBQyxNQUFNLENBQUMsRUFBRSxrQkFBa0IsRUFBRSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDbkosTUFBTSx1QkFBdUIsR0FBNEIsb0JBQW9CLENBQUMsY0FBYyxDQUFDLGlEQUF1QixFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBRXJJLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxDQUFDO1lBQ3hFLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQyxDQUFDO1lBQzVFLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsb0NBQW9DLENBQUMsQ0FBQyxDQUFDO1lBQ2xGLE1BQU0sQ0FBQyxFQUFFLENBQUMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLGtDQUFrQyxDQUFDLENBQUMsQ0FBQztZQUMvRSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUMsQ0FBQztZQUM1RSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLCtCQUErQixDQUFDLENBQUMsQ0FBQztZQUU3RSxjQUFjLEVBQUUsQ0FBQztZQUVqQixNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQztZQUN4RSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUMsQ0FBQztZQUM1RSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLG9DQUFvQyxDQUFDLENBQUMsQ0FBQztZQUNsRixNQUFNLENBQUMsRUFBRSxDQUFDLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDLENBQUM7WUFDL0UsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLENBQUM7WUFDNUUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLHVCQUF1QixDQUFDLE9BQU8sQ0FBQywrQkFBK0IsQ0FBQyxDQUFDLENBQUM7WUFFN0UsdUJBQXVCLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDbkMsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsK0NBQStDLEVBQUUsR0FBRyxFQUFFO1lBQzFELE1BQU0sZ0JBQWdCLEdBQUcsb0JBQW9CLENBQUMsY0FBYyxDQUFDLGlDQUFlLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDOUosTUFBTSxnQkFBZ0IsR0FBRyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsaUNBQWUsRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUM5SixNQUFNLGVBQWUsR0FBb0Isb0JBQW9CLENBQUMsY0FBYyxDQUFDLGlDQUFlLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUUvSixNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLENBQUM7WUFDaEUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQyxDQUFDO1lBQ3BFLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLG9DQUFvQyxDQUFDLENBQUMsQ0FBQztZQUMxRSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDLENBQUM7WUFDeEUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUMsQ0FBQztZQUNuRSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQywrQkFBK0IsQ0FBQyxDQUFDLENBQUM7WUFFckUsY0FBYyxFQUFFLENBQUM7WUFFakIsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxDQUFDO1lBQ2hFLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUMsQ0FBQztZQUNwRSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDLENBQUM7WUFDMUUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsa0NBQWtDLENBQUMsQ0FBQyxDQUFDO1lBQ3hFLE1BQU0sQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLENBQUM7WUFDbkUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsK0JBQStCLENBQUMsQ0FBQyxDQUFDO1lBRXJFLGVBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUMxQixnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUMzQixnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUM1QixDQUFDLENBQUMsQ0FBQztRQUVILElBQUEsK0NBQXVDLEdBQUUsQ0FBQztJQUMzQyxDQUFDLENBQUMsQ0FBQyJ9