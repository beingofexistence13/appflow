/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/common/editor", "vs/workbench/common/editor/diffEditorInput", "vs/base/common/uri", "vs/workbench/test/browser/workbenchTestServices", "vs/base/common/network", "vs/workbench/services/untitled/common/untitledTextEditorInput", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/platform/instantiation/common/descriptors", "vs/workbench/browser/editor", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/browser/editorService", "vs/workbench/services/editor/common/editorService", "vs/workbench/common/editor/sideBySideEditorInput", "vs/platform/editor/common/editor", "vs/editor/common/core/position"], function (require, exports, assert, editor_1, diffEditorInput_1, uri_1, workbenchTestServices_1, network_1, untitledTextEditorInput_1, lifecycle_1, utils_1, descriptors_1, editor_2, editorGroupsService_1, editorService_1, editorService_2, sideBySideEditorInput_1, editor_3, position_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Workbench editor utils', () => {
        class TestEditorInputWithPreferredResource extends workbenchTestServices_1.$Uec {
            constructor(resource, preferredResource, typeId) {
                super(resource, typeId);
                this.preferredResource = preferredResource;
            }
        }
        const disposables = new lifecycle_1.$jc();
        const TEST_EDITOR_ID = 'MyTestEditorForEditors';
        let instantiationService;
        let accessor;
        setup(() => {
            instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            accessor = instantiationService.createInstance(workbenchTestServices_1.$mec);
            disposables.add(accessor.untitledTextEditorService);
            disposables.add((0, workbenchTestServices_1.$Wec)());
            disposables.add((0, workbenchTestServices_1.$Yec)());
            disposables.add((0, workbenchTestServices_1.$Xec)());
            disposables.add((0, workbenchTestServices_1.$Vec)(TEST_EDITOR_ID, [new descriptors_1.$yh(workbenchTestServices_1.$Zec)]));
        });
        teardown(() => {
            disposables.clear();
        });
        test('untyped check functions', () => {
            assert.ok(!(0, editor_1.$NE)(undefined));
            assert.ok(!(0, editor_1.$NE)({}));
            assert.ok(!(0, editor_1.$NE)({ original: { resource: uri_1.URI.file('/') }, modified: { resource: uri_1.URI.file('/') } }));
            assert.ok((0, editor_1.$NE)({ resource: uri_1.URI.file('/') }));
            assert.ok(!(0, editor_1.$QE)(undefined));
            assert.ok((0, editor_1.$QE)({}));
            assert.ok((0, editor_1.$QE)({ resource: uri_1.URI.file('/').with({ scheme: network_1.Schemas.untitled }) }));
            assert.ok((0, editor_1.$QE)({ resource: uri_1.URI.file('/'), forceUntitled: true }));
            assert.ok(!(0, editor_1.$OE)(undefined));
            assert.ok(!(0, editor_1.$OE)({}));
            assert.ok(!(0, editor_1.$OE)({ resource: uri_1.URI.file('/') }));
            assert.ok((0, editor_1.$OE)({ original: { resource: uri_1.URI.file('/') }, modified: { resource: uri_1.URI.file('/') } }));
            assert.ok((0, editor_1.$OE)({ original: { resource: uri_1.URI.file('/') }, modified: { resource: uri_1.URI.file('/') }, primary: { resource: uri_1.URI.file('/') }, secondary: { resource: uri_1.URI.file('/') } }));
            assert.ok(!(0, editor_1.$OE)({ primary: { resource: uri_1.URI.file('/') }, secondary: { resource: uri_1.URI.file('/') } }));
            assert.ok(!(0, editor_1.$PE)(undefined));
            assert.ok(!(0, editor_1.$PE)({}));
            assert.ok(!(0, editor_1.$PE)({ resource: uri_1.URI.file('/') }));
            assert.ok((0, editor_1.$PE)({ primary: { resource: uri_1.URI.file('/') }, secondary: { resource: uri_1.URI.file('/') } }));
            assert.ok(!(0, editor_1.$PE)({ original: { resource: uri_1.URI.file('/') }, modified: { resource: uri_1.URI.file('/') } }));
            assert.ok(!(0, editor_1.$PE)({ primary: { resource: uri_1.URI.file('/') }, secondary: { resource: uri_1.URI.file('/') }, original: { resource: uri_1.URI.file('/') }, modified: { resource: uri_1.URI.file('/') } }));
            assert.ok(!(0, editor_1.$RE)(undefined));
            assert.ok(!(0, editor_1.$RE)({}));
            assert.ok(!(0, editor_1.$RE)({ resource: uri_1.URI.file('/') }));
            assert.ok((0, editor_1.$RE)({ input1: { resource: uri_1.URI.file('/') }, input2: { resource: uri_1.URI.file('/') }, base: { resource: uri_1.URI.file('/') }, result: { resource: uri_1.URI.file('/') } }));
        });
        test('EditorInputCapabilities', () => {
            const testInput1 = disposables.add(new workbenchTestServices_1.$Zec(uri_1.URI.file('resource1'), 'testTypeId'));
            const testInput2 = disposables.add(new workbenchTestServices_1.$Zec(uri_1.URI.file('resource2'), 'testTypeId'));
            testInput1.capabilities = 0 /* EditorInputCapabilities.None */;
            assert.strictEqual(testInput1.hasCapability(0 /* EditorInputCapabilities.None */), true);
            assert.strictEqual(testInput1.hasCapability(2 /* EditorInputCapabilities.Readonly */), false);
            assert.strictEqual(testInput1.isReadonly(), false);
            assert.strictEqual(testInput1.hasCapability(4 /* EditorInputCapabilities.Untitled */), false);
            assert.strictEqual(testInput1.hasCapability(16 /* EditorInputCapabilities.RequiresTrust */), false);
            assert.strictEqual(testInput1.hasCapability(8 /* EditorInputCapabilities.Singleton */), false);
            testInput1.capabilities |= 2 /* EditorInputCapabilities.Readonly */;
            assert.strictEqual(testInput1.hasCapability(2 /* EditorInputCapabilities.Readonly */), true);
            assert.strictEqual(!!testInput1.isReadonly(), true);
            assert.strictEqual(testInput1.hasCapability(0 /* EditorInputCapabilities.None */), false);
            assert.strictEqual(testInput1.hasCapability(4 /* EditorInputCapabilities.Untitled */), false);
            assert.strictEqual(testInput1.hasCapability(16 /* EditorInputCapabilities.RequiresTrust */), false);
            assert.strictEqual(testInput1.hasCapability(8 /* EditorInputCapabilities.Singleton */), false);
            testInput1.capabilities = 0 /* EditorInputCapabilities.None */;
            testInput2.capabilities = 0 /* EditorInputCapabilities.None */;
            const sideBySideInput = instantiationService.createInstance(sideBySideEditorInput_1.$VC, 'name', undefined, testInput1, testInput2);
            assert.strictEqual(sideBySideInput.hasCapability(256 /* EditorInputCapabilities.MultipleEditors */), true);
            assert.strictEqual(sideBySideInput.hasCapability(2 /* EditorInputCapabilities.Readonly */), false);
            assert.strictEqual(sideBySideInput.isReadonly(), false);
            assert.strictEqual(sideBySideInput.hasCapability(4 /* EditorInputCapabilities.Untitled */), false);
            assert.strictEqual(sideBySideInput.hasCapability(16 /* EditorInputCapabilities.RequiresTrust */), false);
            assert.strictEqual(sideBySideInput.hasCapability(8 /* EditorInputCapabilities.Singleton */), false);
            testInput1.capabilities |= 2 /* EditorInputCapabilities.Readonly */;
            assert.strictEqual(sideBySideInput.hasCapability(2 /* EditorInputCapabilities.Readonly */), false);
            assert.strictEqual(sideBySideInput.isReadonly(), false);
            testInput2.capabilities |= 2 /* EditorInputCapabilities.Readonly */;
            assert.strictEqual(sideBySideInput.hasCapability(2 /* EditorInputCapabilities.Readonly */), true);
            assert.strictEqual(!!sideBySideInput.isReadonly(), true);
            testInput1.capabilities |= 4 /* EditorInputCapabilities.Untitled */;
            assert.strictEqual(sideBySideInput.hasCapability(4 /* EditorInputCapabilities.Untitled */), false);
            testInput2.capabilities |= 4 /* EditorInputCapabilities.Untitled */;
            assert.strictEqual(sideBySideInput.hasCapability(4 /* EditorInputCapabilities.Untitled */), true);
            testInput1.capabilities |= 16 /* EditorInputCapabilities.RequiresTrust */;
            assert.strictEqual(sideBySideInput.hasCapability(16 /* EditorInputCapabilities.RequiresTrust */), true);
            testInput2.capabilities |= 16 /* EditorInputCapabilities.RequiresTrust */;
            assert.strictEqual(sideBySideInput.hasCapability(16 /* EditorInputCapabilities.RequiresTrust */), true);
            testInput1.capabilities |= 8 /* EditorInputCapabilities.Singleton */;
            assert.strictEqual(sideBySideInput.hasCapability(8 /* EditorInputCapabilities.Singleton */), true);
            testInput2.capabilities |= 8 /* EditorInputCapabilities.Singleton */;
            assert.strictEqual(sideBySideInput.hasCapability(8 /* EditorInputCapabilities.Singleton */), true);
        });
        test('EditorResourceAccessor - typed inputs', () => {
            const service = accessor.untitledTextEditorService;
            assert.ok(!editor_1.$3E.getCanonicalUri(null));
            assert.ok(!editor_1.$3E.getOriginalUri(null));
            const untitled = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.$Bvb, service.create()));
            assert.strictEqual(editor_1.$3E.getCanonicalUri(untitled)?.toString(), untitled.resource.toString());
            assert.strictEqual(editor_1.$3E.getCanonicalUri(untitled, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY })?.toString(), untitled.resource.toString());
            assert.strictEqual(editor_1.$3E.getCanonicalUri(untitled, { supportSideBySide: editor_1.SideBySideEditor.ANY })?.toString(), untitled.resource.toString());
            assert.strictEqual(editor_1.$3E.getCanonicalUri(untitled, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY })?.toString(), untitled.resource.toString());
            assert.strictEqual(editor_1.$3E.getCanonicalUri(untitled, { supportSideBySide: editor_1.SideBySideEditor.BOTH })?.toString(), untitled.resource.toString());
            assert.strictEqual(editor_1.$3E.getCanonicalUri(untitled, { filterByScheme: network_1.Schemas.untitled })?.toString(), untitled.resource.toString());
            assert.strictEqual(editor_1.$3E.getCanonicalUri(untitled, { filterByScheme: [network_1.Schemas.file, network_1.Schemas.untitled] })?.toString(), untitled.resource.toString());
            assert.ok(!editor_1.$3E.getCanonicalUri(untitled, { filterByScheme: network_1.Schemas.file }));
            assert.strictEqual(editor_1.$3E.getOriginalUri(untitled)?.toString(), untitled.resource.toString());
            assert.strictEqual(editor_1.$3E.getOriginalUri(untitled, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY })?.toString(), untitled.resource.toString());
            assert.strictEqual(editor_1.$3E.getOriginalUri(untitled, { supportSideBySide: editor_1.SideBySideEditor.ANY })?.toString(), untitled.resource.toString());
            assert.strictEqual(editor_1.$3E.getOriginalUri(untitled, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY })?.toString(), untitled.resource.toString());
            assert.strictEqual(editor_1.$3E.getOriginalUri(untitled, { supportSideBySide: editor_1.SideBySideEditor.BOTH })?.toString(), untitled.resource.toString());
            assert.strictEqual(editor_1.$3E.getOriginalUri(untitled, { filterByScheme: network_1.Schemas.untitled })?.toString(), untitled.resource.toString());
            assert.strictEqual(editor_1.$3E.getOriginalUri(untitled, { filterByScheme: [network_1.Schemas.file, network_1.Schemas.untitled] })?.toString(), untitled.resource.toString());
            assert.ok(!editor_1.$3E.getOriginalUri(untitled, { filterByScheme: network_1.Schemas.file }));
            const file = disposables.add(new workbenchTestServices_1.$Uec(uri_1.URI.file('/some/path.txt'), 'editorResourceFileTest'));
            assert.strictEqual(editor_1.$3E.getCanonicalUri(file)?.toString(), file.resource.toString());
            assert.strictEqual(editor_1.$3E.getCanonicalUri(file, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY })?.toString(), file.resource.toString());
            assert.strictEqual(editor_1.$3E.getCanonicalUri(file, { supportSideBySide: editor_1.SideBySideEditor.ANY })?.toString(), file.resource.toString());
            assert.strictEqual(editor_1.$3E.getCanonicalUri(file, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY })?.toString(), file.resource.toString());
            assert.strictEqual(editor_1.$3E.getCanonicalUri(file, { supportSideBySide: editor_1.SideBySideEditor.BOTH })?.toString(), file.resource.toString());
            assert.strictEqual(editor_1.$3E.getCanonicalUri(file, { filterByScheme: network_1.Schemas.file })?.toString(), file.resource.toString());
            assert.strictEqual(editor_1.$3E.getCanonicalUri(file, { filterByScheme: [network_1.Schemas.file, network_1.Schemas.untitled] })?.toString(), file.resource.toString());
            assert.ok(!editor_1.$3E.getCanonicalUri(file, { filterByScheme: network_1.Schemas.untitled }));
            assert.strictEqual(editor_1.$3E.getOriginalUri(file)?.toString(), file.resource.toString());
            assert.strictEqual(editor_1.$3E.getOriginalUri(file, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY })?.toString(), file.resource.toString());
            assert.strictEqual(editor_1.$3E.getOriginalUri(file, { supportSideBySide: editor_1.SideBySideEditor.ANY })?.toString(), file.resource.toString());
            assert.strictEqual(editor_1.$3E.getOriginalUri(file, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY })?.toString(), file.resource.toString());
            assert.strictEqual(editor_1.$3E.getOriginalUri(file, { supportSideBySide: editor_1.SideBySideEditor.BOTH })?.toString(), file.resource.toString());
            assert.strictEqual(editor_1.$3E.getOriginalUri(file, { filterByScheme: network_1.Schemas.file })?.toString(), file.resource.toString());
            assert.strictEqual(editor_1.$3E.getOriginalUri(file, { filterByScheme: [network_1.Schemas.file, network_1.Schemas.untitled] })?.toString(), file.resource.toString());
            assert.ok(!editor_1.$3E.getOriginalUri(file, { filterByScheme: network_1.Schemas.untitled }));
            const diffInput = instantiationService.createInstance(diffEditorInput_1.$3eb, 'name', 'description', untitled, file, undefined);
            const sideBySideInput = instantiationService.createInstance(sideBySideEditorInput_1.$VC, 'name', 'description', untitled, file);
            for (const input of [diffInput, sideBySideInput]) {
                assert.ok(!editor_1.$3E.getCanonicalUri(input));
                assert.ok(!editor_1.$3E.getCanonicalUri(input, { filterByScheme: network_1.Schemas.file }));
                assert.strictEqual(editor_1.$3E.getCanonicalUri(input, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY })?.toString(), file.resource.toString());
                assert.strictEqual(editor_1.$3E.getCanonicalUri(input, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY, filterByScheme: network_1.Schemas.file })?.toString(), file.resource.toString());
                assert.strictEqual(editor_1.$3E.getCanonicalUri(input, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY, filterByScheme: [network_1.Schemas.file, network_1.Schemas.untitled] })?.toString(), file.resource.toString());
                assert.strictEqual(editor_1.$3E.getCanonicalUri(input, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY })?.toString(), untitled.resource.toString());
                assert.strictEqual(editor_1.$3E.getCanonicalUri(input, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY, filterByScheme: network_1.Schemas.untitled })?.toString(), untitled.resource.toString());
                assert.strictEqual(editor_1.$3E.getCanonicalUri(input, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY, filterByScheme: [network_1.Schemas.file, network_1.Schemas.untitled] })?.toString(), untitled.resource.toString());
                assert.strictEqual(editor_1.$3E.getCanonicalUri(input, { supportSideBySide: editor_1.SideBySideEditor.BOTH }).primary.toString(), file.resource.toString());
                assert.strictEqual(editor_1.$3E.getCanonicalUri(input, { supportSideBySide: editor_1.SideBySideEditor.BOTH, filterByScheme: network_1.Schemas.file }).primary.toString(), file.resource.toString());
                assert.strictEqual(editor_1.$3E.getCanonicalUri(input, { supportSideBySide: editor_1.SideBySideEditor.BOTH, filterByScheme: [network_1.Schemas.file, network_1.Schemas.untitled] }).primary.toString(), file.resource.toString());
                assert.strictEqual(editor_1.$3E.getCanonicalUri(input, { supportSideBySide: editor_1.SideBySideEditor.BOTH }).secondary.toString(), untitled.resource.toString());
                assert.strictEqual(editor_1.$3E.getCanonicalUri(input, { supportSideBySide: editor_1.SideBySideEditor.BOTH, filterByScheme: network_1.Schemas.untitled }).secondary.toString(), untitled.resource.toString());
                assert.strictEqual(editor_1.$3E.getCanonicalUri(input, { supportSideBySide: editor_1.SideBySideEditor.BOTH, filterByScheme: [network_1.Schemas.file, network_1.Schemas.untitled] }).secondary.toString(), untitled.resource.toString());
                assert.ok(!editor_1.$3E.getOriginalUri(input));
                assert.ok(!editor_1.$3E.getOriginalUri(input, { filterByScheme: network_1.Schemas.file }));
                assert.strictEqual(editor_1.$3E.getOriginalUri(input, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY })?.toString(), file.resource.toString());
                assert.strictEqual(editor_1.$3E.getOriginalUri(input, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY, filterByScheme: network_1.Schemas.file })?.toString(), file.resource.toString());
                assert.strictEqual(editor_1.$3E.getOriginalUri(input, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY, filterByScheme: [network_1.Schemas.file, network_1.Schemas.untitled] })?.toString(), file.resource.toString());
                assert.strictEqual(editor_1.$3E.getOriginalUri(input, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY })?.toString(), untitled.resource.toString());
                assert.strictEqual(editor_1.$3E.getOriginalUri(input, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY, filterByScheme: network_1.Schemas.untitled })?.toString(), untitled.resource.toString());
                assert.strictEqual(editor_1.$3E.getOriginalUri(input, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY, filterByScheme: [network_1.Schemas.file, network_1.Schemas.untitled] })?.toString(), untitled.resource.toString());
                assert.strictEqual(editor_1.$3E.getOriginalUri(input, { supportSideBySide: editor_1.SideBySideEditor.BOTH }).primary.toString(), file.resource.toString());
                assert.strictEqual(editor_1.$3E.getOriginalUri(input, { supportSideBySide: editor_1.SideBySideEditor.BOTH, filterByScheme: network_1.Schemas.file }).primary.toString(), file.resource.toString());
                assert.strictEqual(editor_1.$3E.getOriginalUri(input, { supportSideBySide: editor_1.SideBySideEditor.BOTH, filterByScheme: [network_1.Schemas.file, network_1.Schemas.untitled] }).primary.toString(), file.resource.toString());
                assert.strictEqual(editor_1.$3E.getOriginalUri(input, { supportSideBySide: editor_1.SideBySideEditor.BOTH }).secondary.toString(), untitled.resource.toString());
                assert.strictEqual(editor_1.$3E.getOriginalUri(input, { supportSideBySide: editor_1.SideBySideEditor.BOTH, filterByScheme: network_1.Schemas.untitled }).secondary.toString(), untitled.resource.toString());
                assert.strictEqual(editor_1.$3E.getOriginalUri(input, { supportSideBySide: editor_1.SideBySideEditor.BOTH, filterByScheme: [network_1.Schemas.file, network_1.Schemas.untitled] }).secondary.toString(), untitled.resource.toString());
            }
            const resource = uri_1.URI.file('/some/path.txt');
            const preferredResource = uri_1.URI.file('/some/PATH.txt');
            const fileWithPreferredResource = disposables.add(new TestEditorInputWithPreferredResource(uri_1.URI.file('/some/path.txt'), uri_1.URI.file('/some/PATH.txt'), 'editorResourceFileTest'));
            assert.strictEqual(editor_1.$3E.getCanonicalUri(fileWithPreferredResource)?.toString(), resource.toString());
            assert.strictEqual(editor_1.$3E.getOriginalUri(fileWithPreferredResource)?.toString(), preferredResource.toString());
        });
        test('EditorResourceAccessor - untyped inputs', () => {
            assert.ok(!editor_1.$3E.getCanonicalUri(null));
            assert.ok(!editor_1.$3E.getOriginalUri(null));
            const untitledURI = uri_1.URI.from({
                scheme: network_1.Schemas.untitled,
                authority: 'foo',
                path: '/bar'
            });
            const untitled = {
                resource: untitledURI
            };
            assert.strictEqual(editor_1.$3E.getCanonicalUri(untitled)?.toString(), untitled.resource?.toString());
            assert.strictEqual(editor_1.$3E.getCanonicalUri(untitled, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY })?.toString(), untitled.resource?.toString());
            assert.strictEqual(editor_1.$3E.getCanonicalUri(untitled, { supportSideBySide: editor_1.SideBySideEditor.ANY })?.toString(), untitled.resource?.toString());
            assert.strictEqual(editor_1.$3E.getCanonicalUri(untitled, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY })?.toString(), untitled.resource?.toString());
            assert.strictEqual(editor_1.$3E.getCanonicalUri(untitled, { supportSideBySide: editor_1.SideBySideEditor.BOTH })?.toString(), untitled.resource?.toString());
            assert.strictEqual(editor_1.$3E.getCanonicalUri(untitled, { filterByScheme: network_1.Schemas.untitled })?.toString(), untitled.resource?.toString());
            assert.strictEqual(editor_1.$3E.getCanonicalUri(untitled, { filterByScheme: [network_1.Schemas.file, network_1.Schemas.untitled] })?.toString(), untitled.resource?.toString());
            assert.ok(!editor_1.$3E.getCanonicalUri(untitled, { filterByScheme: network_1.Schemas.file }));
            assert.strictEqual(editor_1.$3E.getOriginalUri(untitled)?.toString(), untitled.resource?.toString());
            assert.strictEqual(editor_1.$3E.getOriginalUri(untitled, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY })?.toString(), untitled.resource?.toString());
            assert.strictEqual(editor_1.$3E.getOriginalUri(untitled, { supportSideBySide: editor_1.SideBySideEditor.ANY })?.toString(), untitled.resource?.toString());
            assert.strictEqual(editor_1.$3E.getOriginalUri(untitled, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY })?.toString(), untitled.resource?.toString());
            assert.strictEqual(editor_1.$3E.getOriginalUri(untitled, { supportSideBySide: editor_1.SideBySideEditor.BOTH })?.toString(), untitled.resource?.toString());
            assert.strictEqual(editor_1.$3E.getOriginalUri(untitled, { filterByScheme: network_1.Schemas.untitled })?.toString(), untitled.resource?.toString());
            assert.strictEqual(editor_1.$3E.getOriginalUri(untitled, { filterByScheme: [network_1.Schemas.file, network_1.Schemas.untitled] })?.toString(), untitled.resource?.toString());
            assert.ok(!editor_1.$3E.getOriginalUri(untitled, { filterByScheme: network_1.Schemas.file }));
            const file = {
                resource: uri_1.URI.file('/some/path.txt')
            };
            assert.strictEqual(editor_1.$3E.getCanonicalUri(file)?.toString(), file.resource.toString());
            assert.strictEqual(editor_1.$3E.getCanonicalUri(file, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY })?.toString(), file.resource.toString());
            assert.strictEqual(editor_1.$3E.getCanonicalUri(file, { supportSideBySide: editor_1.SideBySideEditor.ANY })?.toString(), file.resource.toString());
            assert.strictEqual(editor_1.$3E.getCanonicalUri(file, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY })?.toString(), file.resource.toString());
            assert.strictEqual(editor_1.$3E.getCanonicalUri(file, { supportSideBySide: editor_1.SideBySideEditor.BOTH })?.toString(), file.resource.toString());
            assert.strictEqual(editor_1.$3E.getCanonicalUri(file, { filterByScheme: network_1.Schemas.file })?.toString(), file.resource.toString());
            assert.strictEqual(editor_1.$3E.getCanonicalUri(file, { filterByScheme: [network_1.Schemas.file, network_1.Schemas.untitled] })?.toString(), file.resource.toString());
            assert.ok(!editor_1.$3E.getCanonicalUri(file, { filterByScheme: network_1.Schemas.untitled }));
            assert.strictEqual(editor_1.$3E.getOriginalUri(file)?.toString(), file.resource.toString());
            assert.strictEqual(editor_1.$3E.getOriginalUri(file, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY })?.toString(), file.resource.toString());
            assert.strictEqual(editor_1.$3E.getOriginalUri(file, { supportSideBySide: editor_1.SideBySideEditor.ANY })?.toString(), file.resource.toString());
            assert.strictEqual(editor_1.$3E.getOriginalUri(file, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY })?.toString(), file.resource.toString());
            assert.strictEqual(editor_1.$3E.getOriginalUri(file, { supportSideBySide: editor_1.SideBySideEditor.BOTH })?.toString(), file.resource.toString());
            assert.strictEqual(editor_1.$3E.getOriginalUri(file, { filterByScheme: network_1.Schemas.file })?.toString(), file.resource.toString());
            assert.strictEqual(editor_1.$3E.getOriginalUri(file, { filterByScheme: [network_1.Schemas.file, network_1.Schemas.untitled] })?.toString(), file.resource.toString());
            assert.ok(!editor_1.$3E.getOriginalUri(file, { filterByScheme: network_1.Schemas.untitled }));
            const diffInput = { original: untitled, modified: file };
            const sideBySideInput = { primary: file, secondary: untitled };
            for (const untypedInput of [diffInput, sideBySideInput]) {
                assert.ok(!editor_1.$3E.getCanonicalUri(untypedInput));
                assert.ok(!editor_1.$3E.getCanonicalUri(untypedInput, { filterByScheme: network_1.Schemas.file }));
                assert.strictEqual(editor_1.$3E.getCanonicalUri(untypedInput, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY })?.toString(), file.resource.toString());
                assert.strictEqual(editor_1.$3E.getCanonicalUri(untypedInput, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY, filterByScheme: network_1.Schemas.file })?.toString(), file.resource.toString());
                assert.strictEqual(editor_1.$3E.getCanonicalUri(untypedInput, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY, filterByScheme: [network_1.Schemas.file, network_1.Schemas.untitled] })?.toString(), file.resource.toString());
                assert.strictEqual(editor_1.$3E.getCanonicalUri(untypedInput, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY })?.toString(), untitled.resource?.toString());
                assert.strictEqual(editor_1.$3E.getCanonicalUri(untypedInput, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY, filterByScheme: network_1.Schemas.untitled })?.toString(), untitled.resource?.toString());
                assert.strictEqual(editor_1.$3E.getCanonicalUri(untypedInput, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY, filterByScheme: [network_1.Schemas.file, network_1.Schemas.untitled] })?.toString(), untitled.resource?.toString());
                assert.strictEqual(editor_1.$3E.getCanonicalUri(untypedInput, { supportSideBySide: editor_1.SideBySideEditor.BOTH }).primary.toString(), file.resource.toString());
                assert.strictEqual(editor_1.$3E.getCanonicalUri(untypedInput, { supportSideBySide: editor_1.SideBySideEditor.BOTH, filterByScheme: network_1.Schemas.file }).primary.toString(), file.resource.toString());
                assert.strictEqual(editor_1.$3E.getCanonicalUri(untypedInput, { supportSideBySide: editor_1.SideBySideEditor.BOTH, filterByScheme: [network_1.Schemas.file, network_1.Schemas.untitled] }).primary.toString(), file.resource.toString());
                assert.strictEqual(editor_1.$3E.getCanonicalUri(untypedInput, { supportSideBySide: editor_1.SideBySideEditor.BOTH }).secondary.toString(), untitled.resource?.toString());
                assert.strictEqual(editor_1.$3E.getCanonicalUri(untypedInput, { supportSideBySide: editor_1.SideBySideEditor.BOTH, filterByScheme: network_1.Schemas.untitled }).secondary.toString(), untitled.resource?.toString());
                assert.strictEqual(editor_1.$3E.getCanonicalUri(untypedInput, { supportSideBySide: editor_1.SideBySideEditor.BOTH, filterByScheme: [network_1.Schemas.file, network_1.Schemas.untitled] }).secondary.toString(), untitled.resource?.toString());
                assert.ok(!editor_1.$3E.getOriginalUri(untypedInput));
                assert.ok(!editor_1.$3E.getOriginalUri(untypedInput, { filterByScheme: network_1.Schemas.file }));
                assert.strictEqual(editor_1.$3E.getOriginalUri(untypedInput, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY })?.toString(), file.resource.toString());
                assert.strictEqual(editor_1.$3E.getOriginalUri(untypedInput, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY, filterByScheme: network_1.Schemas.file })?.toString(), file.resource.toString());
                assert.strictEqual(editor_1.$3E.getOriginalUri(untypedInput, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY, filterByScheme: [network_1.Schemas.file, network_1.Schemas.untitled] })?.toString(), file.resource.toString());
                assert.strictEqual(editor_1.$3E.getOriginalUri(untypedInput, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY })?.toString(), untitled.resource?.toString());
                assert.strictEqual(editor_1.$3E.getOriginalUri(untypedInput, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY, filterByScheme: network_1.Schemas.untitled })?.toString(), untitled.resource?.toString());
                assert.strictEqual(editor_1.$3E.getOriginalUri(untypedInput, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY, filterByScheme: [network_1.Schemas.file, network_1.Schemas.untitled] })?.toString(), untitled.resource?.toString());
                assert.strictEqual(editor_1.$3E.getOriginalUri(untypedInput, { supportSideBySide: editor_1.SideBySideEditor.BOTH }).primary.toString(), file.resource.toString());
                assert.strictEqual(editor_1.$3E.getOriginalUri(untypedInput, { supportSideBySide: editor_1.SideBySideEditor.BOTH, filterByScheme: network_1.Schemas.file }).primary.toString(), file.resource.toString());
                assert.strictEqual(editor_1.$3E.getOriginalUri(untypedInput, { supportSideBySide: editor_1.SideBySideEditor.BOTH, filterByScheme: [network_1.Schemas.file, network_1.Schemas.untitled] }).primary.toString(), file.resource.toString());
                assert.strictEqual(editor_1.$3E.getOriginalUri(untypedInput, { supportSideBySide: editor_1.SideBySideEditor.BOTH }).secondary.toString(), untitled.resource?.toString());
                assert.strictEqual(editor_1.$3E.getOriginalUri(untypedInput, { supportSideBySide: editor_1.SideBySideEditor.BOTH, filterByScheme: network_1.Schemas.untitled }).secondary.toString(), untitled.resource?.toString());
                assert.strictEqual(editor_1.$3E.getOriginalUri(untypedInput, { supportSideBySide: editor_1.SideBySideEditor.BOTH, filterByScheme: [network_1.Schemas.file, network_1.Schemas.untitled] }).secondary.toString(), untitled.resource?.toString());
            }
            const fileMerge = {
                input1: { resource: uri_1.URI.file('/some/remote.txt') },
                input2: { resource: uri_1.URI.file('/some/local.txt') },
                base: { resource: uri_1.URI.file('/some/base.txt') },
                result: { resource: uri_1.URI.file('/some/merged.txt') }
            };
            assert.strictEqual(editor_1.$3E.getCanonicalUri(fileMerge)?.toString(), fileMerge.result.resource.toString());
            assert.strictEqual(editor_1.$3E.getOriginalUri(fileMerge)?.toString(), fileMerge.result.resource.toString());
        });
        test('isEditorIdentifier', () => {
            assert.strictEqual((0, editor_1.$1E)(undefined), false);
            assert.strictEqual((0, editor_1.$1E)('undefined'), false);
            const testInput1 = disposables.add(new workbenchTestServices_1.$Zec(uri_1.URI.file('resource1'), 'testTypeId'));
            assert.strictEqual((0, editor_1.$1E)(testInput1), false);
            assert.strictEqual((0, editor_1.$1E)({ editor: testInput1, groupId: 3 }), true);
        });
        test('isEditorInputWithOptionsAndGroup', () => {
            const editorInput = disposables.add(new workbenchTestServices_1.$Zec(uri_1.URI.file('resource1'), 'testTypeId'));
            assert.strictEqual((0, editor_1.$UE)(editorInput), true);
            assert.strictEqual((0, editor_1.$YE)(editorInput), false);
            assert.strictEqual((0, editor_1.$ZE)(editorInput), false);
            const editorInputWithOptions = { editor: editorInput, options: { override: editor_3.EditorResolution.PICK } };
            assert.strictEqual((0, editor_1.$UE)(editorInputWithOptions), false);
            assert.strictEqual((0, editor_1.$YE)(editorInputWithOptions), true);
            assert.strictEqual((0, editor_1.$ZE)(editorInputWithOptions), false);
            const service = accessor.editorGroupService;
            const editorInputWithOptionsAndGroup = { editor: editorInput, options: { override: editor_3.EditorResolution.PICK }, group: service.activeGroup };
            assert.strictEqual((0, editor_1.$UE)(editorInputWithOptionsAndGroup), false);
            assert.strictEqual((0, editor_1.$YE)(editorInputWithOptionsAndGroup), true);
            assert.strictEqual((0, editor_1.$ZE)(editorInputWithOptionsAndGroup), true);
        });
        test('isTextEditorViewState', () => {
            assert.strictEqual((0, editor_1.$5E)(undefined), false);
            assert.strictEqual((0, editor_1.$5E)({}), false);
            const codeEditorViewState = {
                contributionsState: {},
                cursorState: [],
                viewState: {
                    scrollLeft: 0,
                    firstPosition: new position_1.$js(1, 1),
                    firstPositionDeltaTop: 1
                }
            };
            assert.strictEqual((0, editor_1.$5E)(codeEditorViewState), true);
            const diffEditorViewState = {
                original: codeEditorViewState,
                modified: codeEditorViewState
            };
            assert.strictEqual((0, editor_1.$5E)(diffEditorViewState), true);
        });
        test('whenEditorClosed (single editor)', async function () {
            return testWhenEditorClosed(false, false, utils_1.$0S.call(this, '/path/index.txt'));
        });
        test('whenEditorClosed (multiple editor)', async function () {
            return testWhenEditorClosed(false, false, utils_1.$0S.call(this, '/path/index.txt'), utils_1.$0S.call(this, '/test.html'));
        });
        test('whenEditorClosed (single editor, diff editor)', async function () {
            return testWhenEditorClosed(true, false, utils_1.$0S.call(this, '/path/index.txt'));
        });
        test('whenEditorClosed (multiple editor, diff editor)', async function () {
            return testWhenEditorClosed(true, false, utils_1.$0S.call(this, '/path/index.txt'), utils_1.$0S.call(this, '/test.html'));
        });
        test('whenEditorClosed (single custom editor)', async function () {
            return testWhenEditorClosed(false, true, utils_1.$0S.call(this, '/path/index.txt'));
        });
        test('whenEditorClosed (multiple custom editor)', async function () {
            return testWhenEditorClosed(false, true, utils_1.$0S.call(this, '/path/index.txt'), utils_1.$0S.call(this, '/test.html'));
        });
        async function createServices() {
            const instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            const part = await (0, workbenchTestServices_1.$3ec)(instantiationService, disposables);
            instantiationService.stub(editorGroupsService_1.$5C, part);
            const editorService = disposables.add(instantiationService.createInstance(editorService_1.$Lyb));
            instantiationService.stub(editorService_2.$9C, editorService);
            return instantiationService.createInstance(workbenchTestServices_1.$mec);
        }
        async function testWhenEditorClosed(sideBySide, custom, ...resources) {
            const accessor = await createServices();
            for (const resource of resources) {
                if (custom) {
                    await accessor.editorService.openEditor(new workbenchTestServices_1.$Zec(resource, 'testTypeId'), { pinned: true });
                }
                else if (sideBySide) {
                    await accessor.editorService.openEditor(instantiationService.createInstance(sideBySideEditorInput_1.$VC, 'testSideBySideEditor', undefined, new workbenchTestServices_1.$Zec(resource, 'testTypeId'), new workbenchTestServices_1.$Zec(resource, 'testTypeId')), { pinned: true });
                }
                else {
                    await accessor.editorService.openEditor({ resource, options: { pinned: true } });
                }
            }
            const closedPromise = accessor.instantitionService.invokeFunction(accessor => (0, editor_2.$bU)(accessor, resources));
            accessor.editorGroupService.activeGroup.closeAllEditors();
            await closedPromise;
        }
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=editor.test.js.map