/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/uri", "vs/workbench/common/editor/diffEditorInput", "vs/workbench/services/editor/browser/editorResolverService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/test/browser/workbenchTestServices"], function (require, exports, assert, lifecycle_1, network_1, uri_1, diffEditorInput_1, editorResolverService_1, editorGroupsService_1, editorResolverService_2, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('EditorResolverService', () => {
        const TEST_EDITOR_INPUT_ID = 'testEditorInputForEditorResolverService';
        const disposables = new lifecycle_1.$jc();
        teardown(() => disposables.clear());
        async function createEditorResolverService(instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables)) {
            const part = await (0, workbenchTestServices_1.$3ec)(instantiationService, disposables);
            instantiationService.stub(editorGroupsService_1.$5C, part);
            const editorResolverService = instantiationService.createInstance(editorResolverService_1.$Myb);
            instantiationService.stub(editorResolverService_2.$pbb, editorResolverService);
            return [part, editorResolverService, instantiationService.createInstance(workbenchTestServices_1.$mec)];
        }
        test('Simple Resolve', async () => {
            const [part, service] = await createEditorResolverService();
            const registeredEditor = service.registerEditor('*.test', {
                id: 'TEST_EDITOR',
                label: 'Test Editor Label',
                detail: 'Test Editor Details',
                priority: editorResolverService_2.RegisteredEditorPriority.default
            }, {}, {
                createEditorInput: ({ resource, options }, group) => ({ editor: new workbenchTestServices_1.$Zec(uri_1.URI.parse(resource.toString()), TEST_EDITOR_INPUT_ID) }),
            });
            const resultingResolution = await service.resolveEditor({ resource: uri_1.URI.file('my://resource-basics.test') }, part.activeGroup);
            assert.ok(resultingResolution);
            assert.notStrictEqual(typeof resultingResolution, 'number');
            if (resultingResolution !== 1 /* ResolvedStatus.ABORT */ && resultingResolution !== 2 /* ResolvedStatus.NONE */) {
                assert.strictEqual(resultingResolution.editor.typeId, TEST_EDITOR_INPUT_ID);
                resultingResolution.editor.dispose();
            }
            registeredEditor.dispose();
        });
        test('Untitled Resolve', async () => {
            const UNTITLED_TEST_EDITOR_INPUT_ID = 'UNTITLED_TEST_INPUT';
            const [part, service] = await createEditorResolverService();
            const registeredEditor = service.registerEditor('*.test', {
                id: 'TEST_EDITOR',
                label: 'Test Editor Label',
                detail: 'Test Editor Details',
                priority: editorResolverService_2.RegisteredEditorPriority.default
            }, {}, {
                createEditorInput: ({ resource, options }, group) => ({ editor: new workbenchTestServices_1.$Zec(uri_1.URI.parse(resource.toString()), TEST_EDITOR_INPUT_ID) }),
                createUntitledEditorInput: ({ resource, options }, group) => ({ editor: new workbenchTestServices_1.$Zec((resource ? resource : uri_1.URI.from({ scheme: network_1.Schemas.untitled })), UNTITLED_TEST_EDITOR_INPUT_ID) }),
            });
            // Untyped untitled - no resource
            let resultingResolution = await service.resolveEditor({ resource: undefined }, part.activeGroup);
            assert.ok(resultingResolution);
            // We don't expect untitled to match the *.test glob
            assert.strictEqual(typeof resultingResolution, 'number');
            // Untyped untitled - with untitled resource
            resultingResolution = await service.resolveEditor({ resource: uri_1.URI.from({ scheme: network_1.Schemas.untitled, path: 'foo.test' }) }, part.activeGroup);
            assert.ok(resultingResolution);
            assert.notStrictEqual(typeof resultingResolution, 'number');
            if (resultingResolution !== 1 /* ResolvedStatus.ABORT */ && resultingResolution !== 2 /* ResolvedStatus.NONE */) {
                assert.strictEqual(resultingResolution.editor.typeId, UNTITLED_TEST_EDITOR_INPUT_ID);
                resultingResolution.editor.dispose();
            }
            // Untyped untitled - file resource with forceUntitled
            resultingResolution = await service.resolveEditor({ resource: uri_1.URI.file('/fake.test'), forceUntitled: true }, part.activeGroup);
            assert.ok(resultingResolution);
            assert.notStrictEqual(typeof resultingResolution, 'number');
            if (resultingResolution !== 1 /* ResolvedStatus.ABORT */ && resultingResolution !== 2 /* ResolvedStatus.NONE */) {
                assert.strictEqual(resultingResolution.editor.typeId, UNTITLED_TEST_EDITOR_INPUT_ID);
                resultingResolution.editor.dispose();
            }
            registeredEditor.dispose();
        });
        test('Side by side Resolve', async () => {
            const [part, service] = await createEditorResolverService();
            const registeredEditorPrimary = service.registerEditor('*.test-primary', {
                id: 'TEST_EDITOR_PRIMARY',
                label: 'Test Editor Label Primary',
                detail: 'Test Editor Details Primary',
                priority: editorResolverService_2.RegisteredEditorPriority.default
            }, {}, {
                createEditorInput: ({ resource, options }, group) => ({ editor: new workbenchTestServices_1.$Zec(uri_1.URI.parse(resource.toString()), TEST_EDITOR_INPUT_ID) }),
            });
            const registeredEditorSecondary = service.registerEditor('*.test-secondary', {
                id: 'TEST_EDITOR_SECONDARY',
                label: 'Test Editor Label Secondary',
                detail: 'Test Editor Details Secondary',
                priority: editorResolverService_2.RegisteredEditorPriority.default
            }, {}, {
                createEditorInput: ({ resource, options }, group) => ({ editor: new workbenchTestServices_1.$Zec(uri_1.URI.parse(resource.toString()), TEST_EDITOR_INPUT_ID) }),
            });
            const resultingResolution = await service.resolveEditor({
                primary: { resource: uri_1.URI.file('my://resource-basics.test-primary') },
                secondary: { resource: uri_1.URI.file('my://resource-basics.test-secondary') }
            }, part.activeGroup);
            assert.ok(resultingResolution);
            assert.notStrictEqual(typeof resultingResolution, 'number');
            if (resultingResolution !== 1 /* ResolvedStatus.ABORT */ && resultingResolution !== 2 /* ResolvedStatus.NONE */) {
                assert.strictEqual(resultingResolution.editor.typeId, 'workbench.editorinputs.sidebysideEditorInput');
                resultingResolution.editor.dispose();
            }
            else {
                assert.fail();
            }
            registeredEditorPrimary.dispose();
            registeredEditorSecondary.dispose();
        });
        test('Diff editor Resolve', async () => {
            const [part, service, accessor] = await createEditorResolverService();
            const registeredEditor = service.registerEditor('*.test-diff', {
                id: 'TEST_EDITOR',
                label: 'Test Editor Label',
                detail: 'Test Editor Details',
                priority: editorResolverService_2.RegisteredEditorPriority.default
            }, {}, {
                createEditorInput: ({ resource, options }, group) => ({ editor: new workbenchTestServices_1.$Zec(uri_1.URI.parse(resource.toString()), TEST_EDITOR_INPUT_ID) }),
                createDiffEditorInput: ({ modified, original, options }, group) => ({
                    editor: accessor.instantiationService.createInstance(diffEditorInput_1.$3eb, 'name', 'description', new workbenchTestServices_1.$Zec(uri_1.URI.parse(original.toString()), TEST_EDITOR_INPUT_ID), new workbenchTestServices_1.$Zec(uri_1.URI.parse(modified.toString()), TEST_EDITOR_INPUT_ID), undefined)
                })
            });
            const resultingResolution = await service.resolveEditor({
                original: { resource: uri_1.URI.file('my://resource-basics.test-diff') },
                modified: { resource: uri_1.URI.file('my://resource-basics.test-diff') }
            }, part.activeGroup);
            assert.ok(resultingResolution);
            assert.notStrictEqual(typeof resultingResolution, 'number');
            if (resultingResolution !== 1 /* ResolvedStatus.ABORT */ && resultingResolution !== 2 /* ResolvedStatus.NONE */) {
                assert.strictEqual(resultingResolution.editor.typeId, 'workbench.editors.diffEditorInput');
                resultingResolution.editor.dispose();
            }
            else {
                assert.fail();
            }
            registeredEditor.dispose();
        });
        test('Diff editor Resolve - Different Types', async () => {
            const [part, service, accessor] = await createEditorResolverService();
            let diffOneCounter = 0;
            let diffTwoCounter = 0;
            let defaultDiffCounter = 0;
            const registeredEditor = service.registerEditor('*.test-diff', {
                id: 'TEST_EDITOR',
                label: 'Test Editor Label',
                detail: 'Test Editor Details',
                priority: editorResolverService_2.RegisteredEditorPriority.default
            }, {}, {
                createEditorInput: ({ resource, options }, group) => ({ editor: new workbenchTestServices_1.$Zec(uri_1.URI.parse(resource.toString()), TEST_EDITOR_INPUT_ID) }),
                createDiffEditorInput: ({ modified, original, options }, group) => {
                    diffOneCounter++;
                    return {
                        editor: accessor.instantiationService.createInstance(diffEditorInput_1.$3eb, 'name', 'description', new workbenchTestServices_1.$Zec(uri_1.URI.parse(original.toString()), TEST_EDITOR_INPUT_ID), new workbenchTestServices_1.$Zec(uri_1.URI.parse(modified.toString()), TEST_EDITOR_INPUT_ID), undefined)
                    };
                }
            });
            const secondRegisteredEditor = service.registerEditor('*.test-secondDiff', {
                id: 'TEST_EDITOR_2',
                label: 'Test Editor Label',
                detail: 'Test Editor Details',
                priority: editorResolverService_2.RegisteredEditorPriority.default
            }, {}, {
                createEditorInput: ({ resource, options }, group) => ({ editor: new workbenchTestServices_1.$Zec(uri_1.URI.parse(resource.toString()), TEST_EDITOR_INPUT_ID) }),
                createDiffEditorInput: ({ modified, original, options }, group) => {
                    diffTwoCounter++;
                    return {
                        editor: accessor.instantiationService.createInstance(diffEditorInput_1.$3eb, 'name', 'description', new workbenchTestServices_1.$Zec(uri_1.URI.parse(original.toString()), TEST_EDITOR_INPUT_ID), new workbenchTestServices_1.$Zec(uri_1.URI.parse(modified.toString()), TEST_EDITOR_INPUT_ID), undefined)
                    };
                }
            });
            const defaultRegisteredEditor = service.registerEditor('*', {
                id: 'default',
                label: 'Test Editor Label',
                detail: 'Test Editor Details',
                priority: editorResolverService_2.RegisteredEditorPriority.option
            }, {}, {
                createEditorInput: ({ resource, options }, group) => ({ editor: new workbenchTestServices_1.$Zec(uri_1.URI.parse(resource.toString()), TEST_EDITOR_INPUT_ID) }),
                createDiffEditorInput: ({ modified, original, options }, group) => {
                    defaultDiffCounter++;
                    return {
                        editor: accessor.instantiationService.createInstance(diffEditorInput_1.$3eb, 'name', 'description', new workbenchTestServices_1.$Zec(uri_1.URI.parse(original.toString()), TEST_EDITOR_INPUT_ID), new workbenchTestServices_1.$Zec(uri_1.URI.parse(modified.toString()), TEST_EDITOR_INPUT_ID), undefined)
                    };
                }
            });
            let resultingResolution = await service.resolveEditor({
                original: { resource: uri_1.URI.file('my://resource-basics.test-diff') },
                modified: { resource: uri_1.URI.file('my://resource-basics.test-diff') }
            }, part.activeGroup);
            assert.ok(resultingResolution);
            assert.notStrictEqual(typeof resultingResolution, 'number');
            if (resultingResolution !== 1 /* ResolvedStatus.ABORT */ && resultingResolution !== 2 /* ResolvedStatus.NONE */) {
                assert.strictEqual(diffOneCounter, 1);
                assert.strictEqual(diffTwoCounter, 0);
                assert.strictEqual(defaultDiffCounter, 0);
                assert.strictEqual(resultingResolution.editor.typeId, 'workbench.editors.diffEditorInput');
                resultingResolution.editor.dispose();
            }
            else {
                assert.fail();
            }
            resultingResolution = await service.resolveEditor({
                original: { resource: uri_1.URI.file('my://resource-basics.test-secondDiff') },
                modified: { resource: uri_1.URI.file('my://resource-basics.test-secondDiff') }
            }, part.activeGroup);
            assert.ok(resultingResolution);
            assert.notStrictEqual(typeof resultingResolution, 'number');
            if (resultingResolution !== 1 /* ResolvedStatus.ABORT */ && resultingResolution !== 2 /* ResolvedStatus.NONE */) {
                assert.strictEqual(diffOneCounter, 1);
                assert.strictEqual(diffTwoCounter, 1);
                assert.strictEqual(defaultDiffCounter, 0);
                assert.strictEqual(resultingResolution.editor.typeId, 'workbench.editors.diffEditorInput');
                resultingResolution.editor.dispose();
            }
            else {
                assert.fail();
            }
            resultingResolution = await service.resolveEditor({
                original: { resource: uri_1.URI.file('my://resource-basics.test-secondDiff') },
                modified: { resource: uri_1.URI.file('my://resource-basics.test-diff') }
            }, part.activeGroup);
            assert.ok(resultingResolution);
            assert.notStrictEqual(typeof resultingResolution, 'number');
            if (resultingResolution !== 1 /* ResolvedStatus.ABORT */ && resultingResolution !== 2 /* ResolvedStatus.NONE */) {
                assert.strictEqual(diffOneCounter, 1);
                assert.strictEqual(diffTwoCounter, 1);
                assert.strictEqual(defaultDiffCounter, 1);
                assert.strictEqual(resultingResolution.editor.typeId, 'workbench.editors.diffEditorInput');
                resultingResolution.editor.dispose();
            }
            else {
                assert.fail();
            }
            resultingResolution = await service.resolveEditor({
                original: { resource: uri_1.URI.file('my://resource-basics.test-diff') },
                modified: { resource: uri_1.URI.file('my://resource-basics.test-secondDiff') }
            }, part.activeGroup);
            assert.ok(resultingResolution);
            assert.notStrictEqual(typeof resultingResolution, 'number');
            if (resultingResolution !== 1 /* ResolvedStatus.ABORT */ && resultingResolution !== 2 /* ResolvedStatus.NONE */) {
                assert.strictEqual(diffOneCounter, 1);
                assert.strictEqual(diffTwoCounter, 1);
                assert.strictEqual(defaultDiffCounter, 2);
                assert.strictEqual(resultingResolution.editor.typeId, 'workbench.editors.diffEditorInput');
                resultingResolution.editor.dispose();
            }
            else {
                assert.fail();
            }
            resultingResolution = await service.resolveEditor({
                original: { resource: uri_1.URI.file('my://resource-basics.test-secondDiff') },
                modified: { resource: uri_1.URI.file('my://resource-basics.test-diff') },
                options: { override: 'TEST_EDITOR' }
            }, part.activeGroup);
            assert.ok(resultingResolution);
            assert.notStrictEqual(typeof resultingResolution, 'number');
            if (resultingResolution !== 1 /* ResolvedStatus.ABORT */ && resultingResolution !== 2 /* ResolvedStatus.NONE */) {
                assert.strictEqual(diffOneCounter, 2);
                assert.strictEqual(diffTwoCounter, 1);
                assert.strictEqual(defaultDiffCounter, 2);
                assert.strictEqual(resultingResolution.editor.typeId, 'workbench.editors.diffEditorInput');
                resultingResolution.editor.dispose();
            }
            else {
                assert.fail();
            }
            registeredEditor.dispose();
            secondRegisteredEditor.dispose();
            defaultRegisteredEditor.dispose();
        });
        test('Registry & Events', async () => {
            const [, service] = await createEditorResolverService();
            let eventCounter = 0;
            service.onDidChangeEditorRegistrations(() => {
                eventCounter++;
            });
            const editors = service.getEditors();
            const registeredEditor = service.registerEditor('*.test', {
                id: 'TEST_EDITOR',
                label: 'Test Editor Label',
                detail: 'Test Editor Details',
                priority: editorResolverService_2.RegisteredEditorPriority.default
            }, {}, {
                createEditorInput: ({ resource, options }, group) => ({ editor: new workbenchTestServices_1.$Zec(uri_1.URI.parse(resource.toString()), TEST_EDITOR_INPUT_ID) })
            });
            assert.strictEqual(eventCounter, 1);
            assert.strictEqual(service.getEditors().length, editors.length + 1);
            assert.strictEqual(service.getEditors().some(editor => editor.id === 'TEST_EDITOR'), true);
            registeredEditor.dispose();
            assert.strictEqual(eventCounter, 2);
            assert.strictEqual(service.getEditors().length, editors.length);
            assert.strictEqual(service.getEditors().some(editor => editor.id === 'TEST_EDITOR'), false);
        });
        test('Multiple registrations to same glob and id #155859', async () => {
            const [part, service, accessor] = await createEditorResolverService();
            const testEditorInfo = {
                id: 'TEST_EDITOR',
                label: 'Test Editor Label',
                detail: 'Test Editor Details',
                priority: editorResolverService_2.RegisteredEditorPriority.default
            };
            const registeredSingleEditor = service.registerEditor('*.test', testEditorInfo, {}, {
                createEditorInput: ({ resource, options }, group) => ({ editor: new workbenchTestServices_1.$Zec(uri_1.URI.parse(resource.toString()), TEST_EDITOR_INPUT_ID) })
            });
            const registeredDiffEditor = service.registerEditor('*.test', testEditorInfo, {}, {
                createDiffEditorInput: ({ modified, original, options }, group) => ({
                    editor: accessor.instantiationService.createInstance(diffEditorInput_1.$3eb, 'name', 'description', new workbenchTestServices_1.$Zec(uri_1.URI.parse(original.toString()), TEST_EDITOR_INPUT_ID), new workbenchTestServices_1.$Zec(uri_1.URI.parse(modified.toString()), TEST_EDITOR_INPUT_ID), undefined)
                })
            });
            // Resolve a diff
            let resultingResolution = await service.resolveEditor({
                original: { resource: uri_1.URI.file('my://resource-basics.test') },
                modified: { resource: uri_1.URI.file('my://resource-basics.test') }
            }, part.activeGroup);
            assert.ok(resultingResolution);
            assert.notStrictEqual(typeof resultingResolution, 'number');
            if (resultingResolution !== 1 /* ResolvedStatus.ABORT */ && resultingResolution !== 2 /* ResolvedStatus.NONE */) {
                assert.strictEqual(resultingResolution.editor.typeId, 'workbench.editors.diffEditorInput');
                resultingResolution.editor.dispose();
            }
            else {
                assert.fail();
            }
            // Remove diff registration
            registeredDiffEditor.dispose();
            // Resolve a diff again, expected failure
            resultingResolution = await service.resolveEditor({
                original: { resource: uri_1.URI.file('my://resource-basics.test') },
                modified: { resource: uri_1.URI.file('my://resource-basics.test') }
            }, part.activeGroup);
            assert.ok(resultingResolution);
            assert.strictEqual(typeof resultingResolution, 'number');
            if (resultingResolution !== 2 /* ResolvedStatus.NONE */) {
                assert.fail();
            }
            registeredSingleEditor.dispose();
        });
    });
});
//# sourceMappingURL=editorResolverService.test.js.map