/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/uri", "vs/workbench/common/editor/diffEditorInput", "vs/workbench/services/editor/browser/editorResolverService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/test/browser/workbenchTestServices"], function (require, exports, assert, lifecycle_1, network_1, uri_1, diffEditorInput_1, editorResolverService_1, editorGroupsService_1, editorResolverService_2, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('EditorResolverService', () => {
        const TEST_EDITOR_INPUT_ID = 'testEditorInputForEditorResolverService';
        const disposables = new lifecycle_1.DisposableStore();
        teardown(() => disposables.clear());
        async function createEditorResolverService(instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, disposables)) {
            const part = await (0, workbenchTestServices_1.createEditorPart)(instantiationService, disposables);
            instantiationService.stub(editorGroupsService_1.IEditorGroupsService, part);
            const editorResolverService = instantiationService.createInstance(editorResolverService_1.EditorResolverService);
            instantiationService.stub(editorResolverService_2.IEditorResolverService, editorResolverService);
            return [part, editorResolverService, instantiationService.createInstance(workbenchTestServices_1.TestServiceAccessor)];
        }
        test('Simple Resolve', async () => {
            const [part, service] = await createEditorResolverService();
            const registeredEditor = service.registerEditor('*.test', {
                id: 'TEST_EDITOR',
                label: 'Test Editor Label',
                detail: 'Test Editor Details',
                priority: editorResolverService_2.RegisteredEditorPriority.default
            }, {}, {
                createEditorInput: ({ resource, options }, group) => ({ editor: new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse(resource.toString()), TEST_EDITOR_INPUT_ID) }),
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
                createEditorInput: ({ resource, options }, group) => ({ editor: new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse(resource.toString()), TEST_EDITOR_INPUT_ID) }),
                createUntitledEditorInput: ({ resource, options }, group) => ({ editor: new workbenchTestServices_1.TestFileEditorInput((resource ? resource : uri_1.URI.from({ scheme: network_1.Schemas.untitled })), UNTITLED_TEST_EDITOR_INPUT_ID) }),
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
                createEditorInput: ({ resource, options }, group) => ({ editor: new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse(resource.toString()), TEST_EDITOR_INPUT_ID) }),
            });
            const registeredEditorSecondary = service.registerEditor('*.test-secondary', {
                id: 'TEST_EDITOR_SECONDARY',
                label: 'Test Editor Label Secondary',
                detail: 'Test Editor Details Secondary',
                priority: editorResolverService_2.RegisteredEditorPriority.default
            }, {}, {
                createEditorInput: ({ resource, options }, group) => ({ editor: new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse(resource.toString()), TEST_EDITOR_INPUT_ID) }),
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
                createEditorInput: ({ resource, options }, group) => ({ editor: new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse(resource.toString()), TEST_EDITOR_INPUT_ID) }),
                createDiffEditorInput: ({ modified, original, options }, group) => ({
                    editor: accessor.instantiationService.createInstance(diffEditorInput_1.DiffEditorInput, 'name', 'description', new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse(original.toString()), TEST_EDITOR_INPUT_ID), new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse(modified.toString()), TEST_EDITOR_INPUT_ID), undefined)
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
                createEditorInput: ({ resource, options }, group) => ({ editor: new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse(resource.toString()), TEST_EDITOR_INPUT_ID) }),
                createDiffEditorInput: ({ modified, original, options }, group) => {
                    diffOneCounter++;
                    return {
                        editor: accessor.instantiationService.createInstance(diffEditorInput_1.DiffEditorInput, 'name', 'description', new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse(original.toString()), TEST_EDITOR_INPUT_ID), new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse(modified.toString()), TEST_EDITOR_INPUT_ID), undefined)
                    };
                }
            });
            const secondRegisteredEditor = service.registerEditor('*.test-secondDiff', {
                id: 'TEST_EDITOR_2',
                label: 'Test Editor Label',
                detail: 'Test Editor Details',
                priority: editorResolverService_2.RegisteredEditorPriority.default
            }, {}, {
                createEditorInput: ({ resource, options }, group) => ({ editor: new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse(resource.toString()), TEST_EDITOR_INPUT_ID) }),
                createDiffEditorInput: ({ modified, original, options }, group) => {
                    diffTwoCounter++;
                    return {
                        editor: accessor.instantiationService.createInstance(diffEditorInput_1.DiffEditorInput, 'name', 'description', new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse(original.toString()), TEST_EDITOR_INPUT_ID), new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse(modified.toString()), TEST_EDITOR_INPUT_ID), undefined)
                    };
                }
            });
            const defaultRegisteredEditor = service.registerEditor('*', {
                id: 'default',
                label: 'Test Editor Label',
                detail: 'Test Editor Details',
                priority: editorResolverService_2.RegisteredEditorPriority.option
            }, {}, {
                createEditorInput: ({ resource, options }, group) => ({ editor: new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse(resource.toString()), TEST_EDITOR_INPUT_ID) }),
                createDiffEditorInput: ({ modified, original, options }, group) => {
                    defaultDiffCounter++;
                    return {
                        editor: accessor.instantiationService.createInstance(diffEditorInput_1.DiffEditorInput, 'name', 'description', new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse(original.toString()), TEST_EDITOR_INPUT_ID), new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse(modified.toString()), TEST_EDITOR_INPUT_ID), undefined)
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
                createEditorInput: ({ resource, options }, group) => ({ editor: new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse(resource.toString()), TEST_EDITOR_INPUT_ID) })
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
                createEditorInput: ({ resource, options }, group) => ({ editor: new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse(resource.toString()), TEST_EDITOR_INPUT_ID) })
            });
            const registeredDiffEditor = service.registerEditor('*.test', testEditorInfo, {}, {
                createDiffEditorInput: ({ modified, original, options }, group) => ({
                    editor: accessor.instantiationService.createInstance(diffEditorInput_1.DiffEditorInput, 'name', 'description', new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse(original.toString()), TEST_EDITOR_INPUT_ID), new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse(modified.toString()), TEST_EDITOR_INPUT_ID), undefined)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yUmVzb2x2ZXJTZXJ2aWNlLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvZWRpdG9yL3Rlc3QvYnJvd3Nlci9lZGl0b3JSZXNvbHZlclNlcnZpY2UudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQWFoRyxLQUFLLENBQUMsdUJBQXVCLEVBQUUsR0FBRyxFQUFFO1FBRW5DLE1BQU0sb0JBQW9CLEdBQUcseUNBQXlDLENBQUM7UUFDdkUsTUFBTSxXQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7UUFFMUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBRXBDLEtBQUssVUFBVSwyQkFBMkIsQ0FBQyx1QkFBa0QsSUFBQSxxREFBNkIsRUFBQyxTQUFTLEVBQUUsV0FBVyxDQUFDO1lBQ2pKLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBQSx3Q0FBZ0IsRUFBQyxvQkFBb0IsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUN2RSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsMENBQW9CLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFdEQsTUFBTSxxQkFBcUIsR0FBRyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsNkNBQXFCLENBQUMsQ0FBQztZQUN6RixvQkFBb0IsQ0FBQyxJQUFJLENBQUMsOENBQXNCLEVBQUUscUJBQXFCLENBQUMsQ0FBQztZQUV6RSxPQUFPLENBQUMsSUFBSSxFQUFFLHFCQUFxQixFQUFFLG9CQUFvQixDQUFDLGNBQWMsQ0FBQywyQ0FBbUIsQ0FBQyxDQUFDLENBQUM7UUFDaEcsQ0FBQztRQUVELElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLElBQUksRUFBRTtZQUNqQyxNQUFNLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxHQUFHLE1BQU0sMkJB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