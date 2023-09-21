/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/editor/common/editor", "vs/base/common/uri", "vs/base/common/event", "vs/workbench/common/editor", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/services/editor/browser/editorService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/platform/instantiation/common/descriptors", "vs/workbench/contrib/files/browser/editors/fileEditorInput", "vs/base/common/async", "vs/platform/files/common/files", "vs/base/common/lifecycle", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/common/editor/sideBySideEditorInput", "vs/workbench/browser/parts/editor/editorPlaceholder", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/configuration/common/configuration", "vs/editor/common/languages/modesRegistry", "vs/base/test/common/utils"], function (require, exports, assert, editor_1, uri_1, event_1, editor_2, workbenchTestServices_1, editorService_1, editorGroupsService_1, editorService_2, descriptors_1, fileEditorInput_1, async_1, files_1, lifecycle_1, mockKeybindingService_1, editorResolverService_1, sideBySideEditorInput_1, editorPlaceholder_1, testConfigurationService_1, configuration_1, modesRegistry_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('EditorService', () => {
        const TEST_EDITOR_ID = 'MyTestEditorForEditorService';
        const TEST_EDITOR_INPUT_ID = 'testEditorInputForEditorService';
        const disposables = new lifecycle_1.DisposableStore();
        let testLocalInstantiationService = undefined;
        setup(() => {
            disposables.add((0, workbenchTestServices_1.registerTestEditor)(TEST_EDITOR_ID, [new descriptors_1.SyncDescriptor(workbenchTestServices_1.TestFileEditorInput), new descriptors_1.SyncDescriptor(workbenchTestServices_1.TestSingletonFileEditorInput)], TEST_EDITOR_INPUT_ID));
            disposables.add((0, workbenchTestServices_1.registerTestResourceEditor)());
            disposables.add((0, workbenchTestServices_1.registerTestSideBySideEditor)());
        });
        teardown(async () => {
            if (testLocalInstantiationService) {
                await (0, workbenchTestServices_1.workbenchTeardown)(testLocalInstantiationService);
                testLocalInstantiationService = undefined;
            }
            disposables.clear();
        });
        async function createEditorService(instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, disposables)) {
            const part = await (0, workbenchTestServices_1.createEditorPart)(instantiationService, disposables);
            instantiationService.stub(editorGroupsService_1.IEditorGroupsService, part);
            const editorService = disposables.add(instantiationService.createInstance(editorService_1.EditorService));
            instantiationService.stub(editorService_2.IEditorService, editorService);
            testLocalInstantiationService = instantiationService;
            return [part, editorService, instantiationService.createInstance(workbenchTestServices_1.TestServiceAccessor)];
        }
        function createTestFileEditorInput(resource, typeId) {
            return disposables.add(new workbenchTestServices_1.TestFileEditorInput(resource, typeId));
        }
        test('openEditor() - basics', async () => {
            const [, service] = await createEditorService();
            let input = createTestFileEditorInput(uri_1.URI.parse('my://resource-basics'), TEST_EDITOR_INPUT_ID);
            let otherInput = createTestFileEditorInput(uri_1.URI.parse('my://resource2-basics'), TEST_EDITOR_INPUT_ID);
            let activeEditorChangeEventCounter = 0;
            const activeEditorChangeListener = service.onDidActiveEditorChange(() => {
                activeEditorChangeEventCounter++;
            });
            let visibleEditorChangeEventCounter = 0;
            const visibleEditorChangeListener = service.onDidVisibleEditorsChange(() => {
                visibleEditorChangeEventCounter++;
            });
            let didCloseEditorListenerCounter = 0;
            const didCloseEditorListener = service.onDidCloseEditor(() => {
                didCloseEditorListenerCounter++;
            });
            // Open input
            let editor = await service.openEditor(input, { pinned: true });
            assert.strictEqual(editor?.getId(), TEST_EDITOR_ID);
            assert.strictEqual(editor, service.activeEditorPane);
            assert.strictEqual(1, service.count);
            assert.strictEqual(input, service.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */)[0].editor);
            assert.strictEqual(input, service.getEditors(1 /* EditorsOrder.SEQUENTIAL */)[0].editor);
            assert.strictEqual(input, service.activeEditor);
            assert.strictEqual(service.visibleEditorPanes.length, 1);
            assert.strictEqual(service.visibleEditorPanes[0], editor);
            assert.ok(!service.activeTextEditorControl);
            assert.ok(!service.activeTextEditorLanguageId);
            assert.strictEqual(service.visibleTextEditorControls.length, 0);
            assert.strictEqual(service.isOpened(input), true);
            assert.strictEqual(service.isOpened({ resource: input.resource, typeId: input.typeId, editorId: input.editorId }), true);
            assert.strictEqual(service.isOpened({ resource: input.resource, typeId: input.typeId, editorId: 'unknownTypeId' }), false);
            assert.strictEqual(service.isOpened({ resource: input.resource, typeId: 'unknownTypeId', editorId: input.editorId }), false);
            assert.strictEqual(service.isOpened({ resource: input.resource, typeId: 'unknownTypeId', editorId: 'unknownTypeId' }), false);
            assert.strictEqual(service.isVisible(input), true);
            assert.strictEqual(service.isVisible(otherInput), false);
            assert.strictEqual(activeEditorChangeEventCounter, 1);
            assert.strictEqual(visibleEditorChangeEventCounter, 1);
            // Close input
            await editor?.group?.closeEditor(input);
            assert.strictEqual(0, service.count);
            assert.strictEqual(0, service.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */).length);
            assert.strictEqual(0, service.getEditors(1 /* EditorsOrder.SEQUENTIAL */).length);
            assert.strictEqual(didCloseEditorListenerCounter, 1);
            assert.strictEqual(activeEditorChangeEventCounter, 2);
            assert.strictEqual(visibleEditorChangeEventCounter, 2);
            assert.ok(input.gotDisposed);
            // Open again 2 inputs (disposed editors are ignored!)
            await service.openEditor(input, { pinned: true });
            assert.strictEqual(0, service.count);
            // Open again 2 inputs (recreate because disposed)
            input = createTestFileEditorInput(uri_1.URI.parse('my://resource-basics'), TEST_EDITOR_INPUT_ID);
            otherInput = createTestFileEditorInput(uri_1.URI.parse('my://resource2-basics'), TEST_EDITOR_INPUT_ID);
            await service.openEditor(input, { pinned: true });
            editor = await service.openEditor(otherInput, { pinned: true });
            assert.strictEqual(2, service.count);
            assert.strictEqual(otherInput, service.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */)[0].editor);
            assert.strictEqual(input, service.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */)[1].editor);
            assert.strictEqual(input, service.getEditors(1 /* EditorsOrder.SEQUENTIAL */)[0].editor);
            assert.strictEqual(otherInput, service.getEditors(1 /* EditorsOrder.SEQUENTIAL */)[1].editor);
            assert.strictEqual(service.visibleEditorPanes.length, 1);
            assert.strictEqual(service.isOpened(input), true);
            assert.strictEqual(service.isOpened({ resource: input.resource, typeId: input.typeId, editorId: input.editorId }), true);
            assert.strictEqual(service.isOpened(otherInput), true);
            assert.strictEqual(service.isOpened({ resource: otherInput.resource, typeId: otherInput.typeId, editorId: otherInput.editorId }), true);
            assert.strictEqual(activeEditorChangeEventCounter, 4);
            assert.strictEqual(visibleEditorChangeEventCounter, 4);
            const stickyInput = createTestFileEditorInput(uri_1.URI.parse('my://resource3-basics'), TEST_EDITOR_INPUT_ID);
            await service.openEditor(stickyInput, { sticky: true });
            assert.strictEqual(3, service.count);
            const allSequentialEditors = service.getEditors(1 /* EditorsOrder.SEQUENTIAL */);
            assert.strictEqual(allSequentialEditors.length, 3);
            assert.strictEqual(stickyInput, allSequentialEditors[0].editor);
            assert.strictEqual(input, allSequentialEditors[1].editor);
            assert.strictEqual(otherInput, allSequentialEditors[2].editor);
            const sequentialEditorsExcludingSticky = service.getEditors(1 /* EditorsOrder.SEQUENTIAL */, { excludeSticky: true });
            assert.strictEqual(sequentialEditorsExcludingSticky.length, 2);
            assert.strictEqual(input, sequentialEditorsExcludingSticky[0].editor);
            assert.strictEqual(otherInput, sequentialEditorsExcludingSticky[1].editor);
            const mruEditorsExcludingSticky = service.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */, { excludeSticky: true });
            assert.strictEqual(mruEditorsExcludingSticky.length, 2);
            assert.strictEqual(input, sequentialEditorsExcludingSticky[0].editor);
            assert.strictEqual(otherInput, sequentialEditorsExcludingSticky[1].editor);
            activeEditorChangeListener.dispose();
            visibleEditorChangeListener.dispose();
            didCloseEditorListener.dispose();
        });
        test('openEditor() - multiple calls are cancelled and indicated as such', async () => {
            const [, service] = await createEditorService();
            const input = createTestFileEditorInput(uri_1.URI.parse('my://resource-basics'), TEST_EDITOR_INPUT_ID);
            const otherInput = createTestFileEditorInput(uri_1.URI.parse('my://resource2-basics'), TEST_EDITOR_INPUT_ID);
            let activeEditorChangeEventCounter = 0;
            const activeEditorChangeListener = service.onDidActiveEditorChange(() => {
                activeEditorChangeEventCounter++;
            });
            let visibleEditorChangeEventCounter = 0;
            const visibleEditorChangeListener = service.onDidVisibleEditorsChange(() => {
                visibleEditorChangeEventCounter++;
            });
            const editorP1 = service.openEditor(input, { pinned: true });
            const editorP2 = service.openEditor(otherInput, { pinned: true });
            const editor1 = await editorP1;
            assert.strictEqual(editor1, undefined);
            const editor2 = await editorP2;
            assert.strictEqual(editor2?.input, otherInput);
            assert.strictEqual(activeEditorChangeEventCounter, 1);
            assert.strictEqual(visibleEditorChangeEventCounter, 1);
            activeEditorChangeListener.dispose();
            visibleEditorChangeListener.dispose();
        });
        test('openEditor() - same input does not cancel previous one - https://github.com/microsoft/vscode/issues/136684', async () => {
            const [, service] = await createEditorService();
            let input = createTestFileEditorInput(uri_1.URI.parse('my://resource-basics'), TEST_EDITOR_INPUT_ID);
            let editorP1 = service.openEditor(input, { pinned: true });
            let editorP2 = service.openEditor(input, { pinned: true });
            let editor1 = await editorP1;
            assert.strictEqual(editor1?.input, input);
            let editor2 = await editorP2;
            assert.strictEqual(editor2?.input, input);
            assert.ok(editor2.group);
            await editor2.group.closeAllEditors();
            input = createTestFileEditorInput(uri_1.URI.parse('my://resource-basics'), TEST_EDITOR_INPUT_ID);
            const inputSame = createTestFileEditorInput(uri_1.URI.parse('my://resource-basics'), TEST_EDITOR_INPUT_ID);
            editorP1 = service.openEditor(input, { pinned: true });
            editorP2 = service.openEditor(inputSame, { pinned: true });
            editor1 = await editorP1;
            assert.strictEqual(editor1?.input, input);
            editor2 = await editorP2;
            assert.strictEqual(editor2?.input, input);
        });
        test('openEditor() - singleton typed editors reveal instead of split', async () => {
            const [part, service] = await createEditorService();
            const input1 = disposables.add(new workbenchTestServices_1.TestSingletonFileEditorInput(uri_1.URI.parse('my://resource-basics1'), TEST_EDITOR_INPUT_ID));
            const input2 = disposables.add(new workbenchTestServices_1.TestSingletonFileEditorInput(uri_1.URI.parse('my://resource-basics2'), TEST_EDITOR_INPUT_ID));
            const input1Group = (await service.openEditor(input1, { pinned: true }))?.group;
            const input2Group = (await service.openEditor(input2, { pinned: true }, editorService_2.SIDE_GROUP))?.group;
            assert.strictEqual(part.activeGroup, input2Group);
            await service.openEditor(input1, { pinned: true });
            assert.strictEqual(part.activeGroup, input1Group);
        });
        test('openEditor() - locked groups', async () => {
            disposables.add((0, workbenchTestServices_1.registerTestFileEditor)());
            const [part, service, accessor] = await createEditorService();
            disposables.add(accessor.editorResolverService.registerEditor('*.editor-service-locked-group-tests', { id: TEST_EDITOR_INPUT_ID, label: 'Label', priority: editorResolverService_1.RegisteredEditorPriority.exclusive }, {}, {
                createEditorInput: editor => ({ editor: createTestFileEditorInput(editor.resource, TEST_EDITOR_INPUT_ID) })
            }));
            const input1 = { resource: uri_1.URI.parse('file://resource-basics.editor-service-locked-group-tests'), options: { pinned: true } };
            const input2 = { resource: uri_1.URI.parse('file://resource2-basics.editor-service-locked-group-tests'), options: { pinned: true } };
            const input3 = { resource: uri_1.URI.parse('file://resource3-basics.editor-service-locked-group-tests'), options: { pinned: true } };
            const input4 = { resource: uri_1.URI.parse('file://resource4-basics.editor-service-locked-group-tests'), options: { pinned: true } };
            const input5 = { resource: uri_1.URI.parse('file://resource5-basics.editor-service-locked-group-tests'), options: { pinned: true } };
            const input6 = { resource: uri_1.URI.parse('file://resource6-basics.editor-service-locked-group-tests'), options: { pinned: true } };
            const input7 = { resource: uri_1.URI.parse('file://resource7-basics.editor-service-locked-group-tests'), options: { pinned: true } };
            const editor1 = await service.openEditor(input1, { pinned: true });
            const editor2 = await service.openEditor(input2, { pinned: true }, editorService_2.SIDE_GROUP);
            const group1 = editor1?.group;
            assert.strictEqual(group1?.count, 1);
            const group2 = editor2?.group;
            assert.strictEqual(group2?.count, 1);
            group2.lock(true);
            part.activateGroup(group2.id);
            // Will open in group 1 because group 2 is locked
            await service.openEditor(input3, { pinned: true });
            assert.strictEqual(group1.count, 2);
            assert.strictEqual(group1.activeEditor?.resource?.toString(), input3.resource.toString());
            assert.strictEqual(group2.count, 1);
            // Will open in group 2 because group was provided
            await service.openEditor(input3, { pinned: true }, group2.id);
            assert.strictEqual(group1.count, 2);
            assert.strictEqual(group2.count, 2);
            assert.strictEqual(group2.activeEditor?.resource?.toString(), input3.resource.toString());
            // Will reveal editor in group 2 because it is contained
            await service.openEditor(input2, { pinned: true }, group2);
            await service.openEditor(input2, { pinned: true }, editorService_2.ACTIVE_GROUP);
            assert.strictEqual(group1.count, 2);
            assert.strictEqual(group2.count, 2);
            assert.strictEqual(group2.activeEditor?.resource?.toString(), input2.resource.toString());
            // Will open a new group because side group is locked
            part.activateGroup(group1.id);
            const editor3 = await service.openEditor(input4, { pinned: true }, editorService_2.SIDE_GROUP);
            assert.strictEqual(part.count, 3);
            const group3 = editor3?.group;
            assert.strictEqual(group3?.count, 1);
            // Will reveal editor in group 2 because it is contained
            await service.openEditor(input3, { pinned: true }, group2);
            part.activateGroup(group1.id);
            await service.openEditor(input3, { pinned: true }, editorService_2.SIDE_GROUP);
            assert.strictEqual(part.count, 3);
            // Will open a new group if all groups are locked
            group1.lock(true);
            group2.lock(true);
            group3.lock(true);
            part.activateGroup(group1.id);
            const editor5 = await service.openEditor(input5, { pinned: true });
            const group4 = editor5?.group;
            assert.strictEqual(group4?.count, 1);
            assert.strictEqual(group4.activeEditor?.resource?.toString(), input5.resource.toString());
            assert.strictEqual(part.count, 4);
            // Will open editor in most recently non-locked group
            group1.lock(false);
            group2.lock(false);
            group3.lock(false);
            group4.lock(false);
            part.activateGroup(group3.id);
            part.activateGroup(group2.id);
            part.activateGroup(group4.id);
            group4.lock(true);
            group2.lock(true);
            await service.openEditor(input6, { pinned: true });
            assert.strictEqual(part.count, 4);
            assert.strictEqual(part.activeGroup, group3);
            assert.strictEqual(group3.activeEditor?.resource?.toString(), input6.resource.toString());
            // Will find the right group where editor is already opened in when all groups are locked
            group1.lock(true);
            group2.lock(true);
            group3.lock(true);
            group4.lock(true);
            part.activateGroup(group1.id);
            await service.openEditor(input6, { pinned: true });
            assert.strictEqual(part.count, 4);
            assert.strictEqual(part.activeGroup, group3);
            assert.strictEqual(group3.activeEditor?.resource?.toString(), input6.resource.toString());
            assert.strictEqual(part.activeGroup, group3);
            assert.strictEqual(group3.activeEditor?.resource?.toString(), input6.resource.toString());
            part.activateGroup(group1.id);
            await service.openEditor(input6, { pinned: true });
            assert.strictEqual(part.count, 4);
            assert.strictEqual(part.activeGroup, group3);
            assert.strictEqual(group3.activeEditor?.resource?.toString(), input6.resource.toString());
            // Will reveal an opened editor in the active locked group
            await service.openEditor(input7, { pinned: true }, group3);
            await service.openEditor(input6, { pinned: true });
            assert.strictEqual(part.count, 4);
            assert.strictEqual(part.activeGroup, group3);
            assert.strictEqual(group3.activeEditor?.resource?.toString(), input6.resource.toString());
        });
        test('locked groups - workbench.editor.revealIfOpen', async () => {
            const instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, disposables);
            const configurationService = new testConfigurationService_1.TestConfigurationService();
            await configurationService.setUserConfiguration('workbench', { 'editor': { 'revealIfOpen': true } });
            instantiationService.stub(configuration_1.IConfigurationService, configurationService);
            disposables.add((0, workbenchTestServices_1.registerTestFileEditor)());
            const [part, service, accessor] = await createEditorService(instantiationService);
            disposables.add(accessor.editorResolverService.registerEditor('*.editor-service-locked-group-tests', { id: TEST_EDITOR_INPUT_ID, label: 'Label', priority: editorResolverService_1.RegisteredEditorPriority.exclusive }, {}, {
                createEditorInput: editor => ({ editor: createTestFileEditorInput(editor.resource, TEST_EDITOR_INPUT_ID) })
            }));
            const rootGroup = part.activeGroup;
            const rightGroup = part.addGroup(rootGroup, 3 /* GroupDirection.RIGHT */);
            part.activateGroup(rootGroup);
            const input1 = { resource: uri_1.URI.parse('file://resource-basics.editor-service-locked-group-tests'), options: { pinned: true } };
            const input2 = { resource: uri_1.URI.parse('file://resource2-basics.editor-service-locked-group-tests'), options: { pinned: true } };
            const input3 = { resource: uri_1.URI.parse('file://resource3-basics.editor-service-locked-group-tests'), options: { pinned: true } };
            const input4 = { resource: uri_1.URI.parse('file://resource4-basics.editor-service-locked-group-tests'), options: { pinned: true } };
            await service.openEditor(input1, rootGroup.id);
            await service.openEditor(input2, rootGroup.id);
            assert.strictEqual(part.activeGroup.id, rootGroup.id);
            await service.openEditor(input3, rightGroup.id);
            await service.openEditor(input4, rightGroup.id);
            assert.strictEqual(part.activeGroup.id, rightGroup.id);
            rootGroup.lock(true);
            rightGroup.lock(true);
            await service.openEditor(input1);
            assert.strictEqual(part.activeGroup.id, rootGroup.id);
            assert.strictEqual(part.activeGroup.activeEditor?.resource?.toString(), input1.resource.toString());
            await service.openEditor(input3);
            assert.strictEqual(part.activeGroup.id, rightGroup.id);
            assert.strictEqual(part.activeGroup.activeEditor?.resource?.toString(), input3.resource.toString());
            assert.strictEqual(part.groups.length, 2);
        });
        test('locked groups - revealIfVisible', async () => {
            disposables.add((0, workbenchTestServices_1.registerTestFileEditor)());
            const [part, service, accessor] = await createEditorService();
            disposables.add(accessor.editorResolverService.registerEditor('*.editor-service-locked-group-tests', { id: TEST_EDITOR_INPUT_ID, label: 'Label', priority: editorResolverService_1.RegisteredEditorPriority.exclusive }, {}, {
                createEditorInput: editor => ({ editor: createTestFileEditorInput(editor.resource, TEST_EDITOR_INPUT_ID) })
            }));
            const rootGroup = part.activeGroup;
            const rightGroup = part.addGroup(rootGroup, 3 /* GroupDirection.RIGHT */);
            part.activateGroup(rootGroup);
            const input1 = { resource: uri_1.URI.parse('file://resource-basics.editor-service-locked-group-tests'), options: { pinned: true } };
            const input2 = { resource: uri_1.URI.parse('file://resource2-basics.editor-service-locked-group-tests'), options: { pinned: true } };
            const input3 = { resource: uri_1.URI.parse('file://resource3-basics.editor-service-locked-group-tests'), options: { pinned: true } };
            const input4 = { resource: uri_1.URI.parse('file://resource4-basics.editor-service-locked-group-tests'), options: { pinned: true } };
            await service.openEditor(input1, rootGroup.id);
            await service.openEditor(input2, rootGroup.id);
            assert.strictEqual(part.activeGroup.id, rootGroup.id);
            await service.openEditor(input3, rightGroup.id);
            await service.openEditor(input4, rightGroup.id);
            assert.strictEqual(part.activeGroup.id, rightGroup.id);
            rootGroup.lock(true);
            rightGroup.lock(true);
            await service.openEditor({ ...input2, options: { ...input2.options, revealIfVisible: true } });
            assert.strictEqual(part.activeGroup.id, rootGroup.id);
            assert.strictEqual(part.activeGroup.activeEditor?.resource?.toString(), input2.resource.toString());
            await service.openEditor({ ...input4, options: { ...input4.options, revealIfVisible: true } });
            assert.strictEqual(part.activeGroup.id, rightGroup.id);
            assert.strictEqual(part.activeGroup.activeEditor?.resource?.toString(), input4.resource.toString());
            assert.strictEqual(part.groups.length, 2);
        });
        test('locked groups - revealIfOpened', async () => {
            disposables.add((0, workbenchTestServices_1.registerTestFileEditor)());
            const [part, service, accessor] = await createEditorService();
            disposables.add(accessor.editorResolverService.registerEditor('*.editor-service-locked-group-tests', { id: TEST_EDITOR_INPUT_ID, label: 'Label', priority: editorResolverService_1.RegisteredEditorPriority.exclusive }, {}, {
                createEditorInput: editor => ({ editor: createTestFileEditorInput(editor.resource, TEST_EDITOR_INPUT_ID) })
            }));
            const rootGroup = part.activeGroup;
            const rightGroup = part.addGroup(rootGroup, 3 /* GroupDirection.RIGHT */);
            part.activateGroup(rootGroup);
            const input1 = { resource: uri_1.URI.parse('file://resource-basics.editor-service-locked-group-tests'), options: { pinned: true } };
            const input2 = { resource: uri_1.URI.parse('file://resource2-basics.editor-service-locked-group-tests'), options: { pinned: true } };
            const input3 = { resource: uri_1.URI.parse('file://resource3-basics.editor-service-locked-group-tests'), options: { pinned: true } };
            const input4 = { resource: uri_1.URI.parse('file://resource4-basics.editor-service-locked-group-tests'), options: { pinned: true } };
            await service.openEditor(input1, rootGroup.id);
            await service.openEditor(input2, rootGroup.id);
            assert.strictEqual(part.activeGroup.id, rootGroup.id);
            await service.openEditor(input3, rightGroup.id);
            await service.openEditor(input4, rightGroup.id);
            assert.strictEqual(part.activeGroup.id, rightGroup.id);
            rootGroup.lock(true);
            rightGroup.lock(true);
            await service.openEditor({ ...input1, options: { ...input1.options, revealIfOpened: true } });
            assert.strictEqual(part.activeGroup.id, rootGroup.id);
            assert.strictEqual(part.activeGroup.activeEditor?.resource?.toString(), input1.resource.toString());
            await service.openEditor({ ...input3, options: { ...input3.options, revealIfOpened: true } });
            assert.strictEqual(part.activeGroup.id, rightGroup.id);
            assert.strictEqual(part.activeGroup.activeEditor?.resource?.toString(), input3.resource.toString());
            assert.strictEqual(part.groups.length, 2);
        });
        test('openEditor() - untyped, typed', () => {
            return testOpenEditors(false);
        });
        test('openEditors() - untyped, typed', () => {
            return testOpenEditors(true);
        });
        async function testOpenEditors(useOpenEditors) {
            disposables.add((0, workbenchTestServices_1.registerTestFileEditor)());
            const [part, service, accessor] = await createEditorService();
            let rootGroup = part.activeGroup;
            let editorFactoryCalled = 0;
            let untitledEditorFactoryCalled = 0;
            let diffEditorFactoryCalled = 0;
            let lastEditorFactoryEditor = undefined;
            let lastUntitledEditorFactoryEditor = undefined;
            let lastDiffEditorFactoryEditor = undefined;
            disposables.add(accessor.editorResolverService.registerEditor('*.editor-service-override-tests', { id: TEST_EDITOR_INPUT_ID, label: 'Label', priority: editorResolverService_1.RegisteredEditorPriority.exclusive }, {}, {
                createEditorInput: editor => {
                    editorFactoryCalled++;
                    lastEditorFactoryEditor = editor;
                    return { editor: createTestFileEditorInput(editor.resource, TEST_EDITOR_INPUT_ID) };
                },
                createUntitledEditorInput: untitledEditor => {
                    untitledEditorFactoryCalled++;
                    lastUntitledEditorFactoryEditor = untitledEditor;
                    return { editor: createTestFileEditorInput(untitledEditor.resource ?? uri_1.URI.parse(`untitled://my-untitled-editor-${untitledEditorFactoryCalled}`), TEST_EDITOR_INPUT_ID) };
                },
                createDiffEditorInput: diffEditor => {
                    diffEditorFactoryCalled++;
                    lastDiffEditorFactoryEditor = diffEditor;
                    return { editor: createTestFileEditorInput(uri_1.URI.file(`diff-editor-${diffEditorFactoryCalled}`), TEST_EDITOR_INPUT_ID) };
                }
            }));
            async function resetTestState() {
                editorFactoryCalled = 0;
                untitledEditorFactoryCalled = 0;
                diffEditorFactoryCalled = 0;
                lastEditorFactoryEditor = undefined;
                lastUntitledEditorFactoryEditor = undefined;
                lastDiffEditorFactoryEditor = undefined;
                await (0, workbenchTestServices_1.workbenchTeardown)(accessor.instantiationService);
                rootGroup = part.activeGroup;
            }
            async function openEditor(editor, group) {
                if (useOpenEditors) {
                    // The type safety isn't super good here, so we assist with runtime checks
                    // Open editors expects untyped or editor input with options, you cannot pass a typed editor input
                    // without options
                    if (!(0, editor_2.isEditorInputWithOptions)(editor) && (0, editor_2.isEditorInput)(editor)) {
                        editor = { editor: editor, options: {} };
                    }
                    const panes = await service.openEditors([editor], group);
                    return panes[0];
                }
                if ((0, editor_2.isEditorInputWithOptions)(editor)) {
                    return service.openEditor(editor.editor, editor.options, group);
                }
                return service.openEditor(editor, group);
            }
            // untyped
            {
                // untyped resource editor, no options, no group
                {
                    const untypedEditor = { resource: uri_1.URI.file('file.editor-service-override-tests') };
                    const pane = await openEditor(untypedEditor);
                    let typedEditor = pane?.input;
                    assert.strictEqual(pane?.group, rootGroup);
                    assert.ok(typedEditor instanceof workbenchTestServices_1.TestFileEditorInput);
                    assert.strictEqual(typedEditor.resource.toString(), untypedEditor.resource.toString());
                    assert.strictEqual(editorFactoryCalled, 1);
                    assert.strictEqual(untitledEditorFactoryCalled, 0);
                    assert.strictEqual(diffEditorFactoryCalled, 0);
                    assert.strictEqual(lastEditorFactoryEditor, untypedEditor);
                    assert.ok(!lastUntitledEditorFactoryEditor);
                    assert.ok(!lastDiffEditorFactoryEditor);
                    // opening the same editor should not create
                    // a new editor input
                    await openEditor(untypedEditor);
                    assert.strictEqual(pane?.group.activeEditor, typedEditor);
                    // replaceEditors should work too
                    const untypedEditorReplacement = { resource: uri_1.URI.file('file-replaced.editor-service-override-tests') };
                    await service.replaceEditors([{
                            editor: typedEditor,
                            replacement: untypedEditorReplacement
                        }], rootGroup);
                    typedEditor = rootGroup.activeEditor;
                    assert.ok(typedEditor instanceof workbenchTestServices_1.TestFileEditorInput);
                    assert.strictEqual(typedEditor?.resource?.toString(), untypedEditorReplacement.resource.toString());
                    assert.strictEqual(editorFactoryCalled, 3);
                    assert.strictEqual(untitledEditorFactoryCalled, 0);
                    assert.strictEqual(diffEditorFactoryCalled, 0);
                    assert.strictEqual(lastEditorFactoryEditor, untypedEditorReplacement);
                    assert.ok(!lastUntitledEditorFactoryEditor);
                    assert.ok(!lastDiffEditorFactoryEditor);
                    await resetTestState();
                }
                // untyped resource editor, options (override text), no group
                {
                    const untypedEditor = { resource: uri_1.URI.file('file.editor-service-override-tests'), options: { override: editor_2.DEFAULT_EDITOR_ASSOCIATION.id } };
                    const pane = await openEditor(untypedEditor);
                    const typedEditor = pane?.input;
                    assert.strictEqual(pane?.group, rootGroup);
                    assert.ok(typedEditor instanceof fileEditorInput_1.FileEditorInput);
                    assert.strictEqual(typedEditor.resource.toString(), untypedEditor.resource.toString());
                    assert.strictEqual(editorFactoryCalled, 0);
                    assert.strictEqual(untitledEditorFactoryCalled, 0);
                    assert.strictEqual(diffEditorFactoryCalled, 0);
                    assert.ok(!lastEditorFactoryEditor);
                    assert.ok(!lastUntitledEditorFactoryEditor);
                    assert.ok(!lastDiffEditorFactoryEditor);
                    // opening the same editor should not create
                    // a new editor input
                    await openEditor(untypedEditor);
                    assert.strictEqual(pane?.group.activeEditor, typedEditor);
                    await resetTestState();
                }
                // untyped resource editor, options (override text, sticky: true, preserveFocus: true), no group
                {
                    const untypedEditor = { resource: uri_1.URI.file('file.editor-service-override-tests'), options: { sticky: true, preserveFocus: true, override: editor_2.DEFAULT_EDITOR_ASSOCIATION.id } };
                    const pane = await openEditor(untypedEditor);
                    assert.strictEqual(pane?.group, rootGroup);
                    assert.ok(pane.input instanceof fileEditorInput_1.FileEditorInput);
                    assert.strictEqual(pane.input.resource.toString(), untypedEditor.resource.toString());
                    assert.strictEqual(pane.group.isSticky(pane.input), true);
                    assert.strictEqual(editorFactoryCalled, 0);
                    assert.strictEqual(untitledEditorFactoryCalled, 0);
                    assert.strictEqual(diffEditorFactoryCalled, 0);
                    assert.ok(!lastEditorFactoryEditor);
                    assert.ok(!lastUntitledEditorFactoryEditor);
                    assert.ok(!lastDiffEditorFactoryEditor);
                    await resetTestState();
                    await part.activeGroup.closeEditor(pane.input);
                }
                // untyped resource editor, options (override default), no group
                {
                    const untypedEditor = { resource: uri_1.URI.file('file.editor-service-override-tests'), options: { override: editor_2.DEFAULT_EDITOR_ASSOCIATION.id } };
                    const pane = await openEditor(untypedEditor);
                    assert.strictEqual(pane?.group, rootGroup);
                    assert.ok(pane.input instanceof fileEditorInput_1.FileEditorInput);
                    assert.strictEqual(pane.input.resource.toString(), untypedEditor.resource.toString());
                    assert.strictEqual(editorFactoryCalled, 0);
                    assert.strictEqual(untitledEditorFactoryCalled, 0);
                    assert.strictEqual(diffEditorFactoryCalled, 0);
                    assert.ok(!lastEditorFactoryEditor);
                    assert.ok(!lastUntitledEditorFactoryEditor);
                    assert.ok(!lastDiffEditorFactoryEditor);
                    await resetTestState();
                }
                // untyped resource editor, options (override: TEST_EDITOR_INPUT_ID), no group
                {
                    const untypedEditor = { resource: uri_1.URI.file('file.editor-service-override-tests'), options: { override: TEST_EDITOR_INPUT_ID } };
                    const pane = await openEditor(untypedEditor);
                    assert.strictEqual(pane?.group, rootGroup);
                    assert.ok(pane.input instanceof workbenchTestServices_1.TestFileEditorInput);
                    assert.strictEqual(pane.input.resource.toString(), untypedEditor.resource.toString());
                    assert.strictEqual(editorFactoryCalled, 1);
                    assert.strictEqual(untitledEditorFactoryCalled, 0);
                    assert.strictEqual(diffEditorFactoryCalled, 0);
                    assert.strictEqual(lastEditorFactoryEditor, untypedEditor);
                    assert.ok(!lastUntitledEditorFactoryEditor);
                    assert.ok(!lastDiffEditorFactoryEditor);
                    await resetTestState();
                }
                // untyped resource editor, options (sticky: true, preserveFocus: true), no group
                {
                    const untypedEditor = { resource: uri_1.URI.file('file.editor-service-override-tests'), options: { sticky: true, preserveFocus: true } };
                    const pane = await openEditor(untypedEditor);
                    assert.strictEqual(pane?.group, rootGroup);
                    assert.ok(pane.input instanceof workbenchTestServices_1.TestFileEditorInput);
                    assert.strictEqual(pane.input.resource.toString(), untypedEditor.resource.toString());
                    assert.strictEqual(pane.group.isSticky(pane.input), true);
                    assert.strictEqual(editorFactoryCalled, 1);
                    assert.strictEqual(untitledEditorFactoryCalled, 0);
                    assert.strictEqual(diffEditorFactoryCalled, 0);
                    assert.strictEqual(lastEditorFactoryEditor.resource.toString(), untypedEditor.resource.toString());
                    assert.strictEqual(lastEditorFactoryEditor.options?.preserveFocus, true);
                    assert.ok(!lastUntitledEditorFactoryEditor);
                    assert.ok(!lastDiffEditorFactoryEditor);
                    await resetTestState();
                    await part.activeGroup.closeEditor(pane.input);
                }
                // untyped resource editor, options (override: TEST_EDITOR_INPUT_ID, sticky: true, preserveFocus: true), no group
                {
                    const untypedEditor = { resource: uri_1.URI.file('file.editor-service-override-tests'), options: { sticky: true, preserveFocus: true, override: TEST_EDITOR_INPUT_ID } };
                    const pane = await openEditor(untypedEditor);
                    assert.strictEqual(pane?.group, rootGroup);
                    assert.ok(pane.input instanceof workbenchTestServices_1.TestFileEditorInput);
                    assert.strictEqual(pane.input.resource.toString(), untypedEditor.resource.toString());
                    assert.strictEqual(pane.group.isSticky(pane.input), true);
                    assert.strictEqual(editorFactoryCalled, 1);
                    assert.strictEqual(untitledEditorFactoryCalled, 0);
                    assert.strictEqual(diffEditorFactoryCalled, 0);
                    assert.strictEqual(lastEditorFactoryEditor.resource.toString(), untypedEditor.resource.toString());
                    assert.strictEqual(lastEditorFactoryEditor.options?.preserveFocus, true);
                    assert.ok(!lastUntitledEditorFactoryEditor);
                    assert.ok(!lastDiffEditorFactoryEditor);
                    await resetTestState();
                    await part.activeGroup.closeEditor(pane.input);
                }
                // untyped resource editor, no options, SIDE_GROUP
                {
                    const untypedEditor = { resource: uri_1.URI.file('file.editor-service-override-tests') };
                    const pane = await openEditor(untypedEditor, editorService_2.SIDE_GROUP);
                    assert.strictEqual(accessor.editorGroupService.groups.length, 2);
                    assert.notStrictEqual(pane?.group, rootGroup);
                    assert.ok(pane?.input instanceof workbenchTestServices_1.TestFileEditorInput);
                    assert.strictEqual(pane?.input.resource.toString(), untypedEditor.resource.toString());
                    assert.strictEqual(editorFactoryCalled, 1);
                    assert.strictEqual(untitledEditorFactoryCalled, 0);
                    assert.strictEqual(diffEditorFactoryCalled, 0);
                    assert.strictEqual(lastEditorFactoryEditor, untypedEditor);
                    assert.ok(!lastUntitledEditorFactoryEditor);
                    assert.ok(!lastDiffEditorFactoryEditor);
                    await resetTestState();
                }
                // untyped resource editor, options (override text), SIDE_GROUP
                {
                    const untypedEditor = { resource: uri_1.URI.file('file.editor-service-override-tests'), options: { override: editor_2.DEFAULT_EDITOR_ASSOCIATION.id } };
                    const pane = await openEditor(untypedEditor, editorService_2.SIDE_GROUP);
                    assert.strictEqual(accessor.editorGroupService.groups.length, 2);
                    assert.notStrictEqual(pane?.group, rootGroup);
                    assert.ok(pane?.input instanceof fileEditorInput_1.FileEditorInput);
                    assert.strictEqual(pane.input.resource.toString(), untypedEditor.resource.toString());
                    assert.strictEqual(editorFactoryCalled, 0);
                    assert.strictEqual(untitledEditorFactoryCalled, 0);
                    assert.strictEqual(diffEditorFactoryCalled, 0);
                    assert.ok(!lastEditorFactoryEditor);
                    assert.ok(!lastUntitledEditorFactoryEditor);
                    assert.ok(!lastDiffEditorFactoryEditor);
                    await resetTestState();
                }
            }
            // Typed
            {
                // typed editor, no options, no group
                {
                    const typedEditor = createTestFileEditorInput(uri_1.URI.file('file.editor-service-override-tests'), TEST_EDITOR_INPUT_ID);
                    const pane = await openEditor({ editor: typedEditor });
                    let typedInput = pane?.input;
                    assert.strictEqual(pane?.group, rootGroup);
                    assert.ok(typedInput instanceof workbenchTestServices_1.TestFileEditorInput);
                    assert.strictEqual(typedInput.resource.toString(), typedEditor.resource.toString());
                    // It's a typed editor input so the resolver should not have been called
                    assert.strictEqual(editorFactoryCalled, 0);
                    assert.strictEqual(untitledEditorFactoryCalled, 0);
                    assert.strictEqual(diffEditorFactoryCalled, 0);
                    assert.ok(!lastEditorFactoryEditor);
                    assert.ok(!lastUntitledEditorFactoryEditor);
                    assert.ok(!lastDiffEditorFactoryEditor);
                    // opening the same editor should not create
                    // a new editor input
                    await openEditor(typedEditor);
                    assert.strictEqual(pane?.group.activeEditor, typedInput);
                    // replaceEditors should work too
                    const typedEditorReplacement = createTestFileEditorInput(uri_1.URI.file('file-replaced.editor-service-override-tests'), TEST_EDITOR_INPUT_ID);
                    await service.replaceEditors([{
                            editor: typedEditor,
                            replacement: typedEditorReplacement
                        }], rootGroup);
                    typedInput = rootGroup.activeEditor;
                    assert.ok(typedInput instanceof workbenchTestServices_1.TestFileEditorInput);
                    assert.strictEqual(typedInput.resource.toString(), typedEditorReplacement.resource.toString());
                    assert.strictEqual(editorFactoryCalled, 0);
                    assert.strictEqual(untitledEditorFactoryCalled, 0);
                    assert.strictEqual(diffEditorFactoryCalled, 0);
                    assert.ok(!lastUntitledEditorFactoryEditor);
                    assert.ok(!lastDiffEditorFactoryEditor);
                    await resetTestState();
                }
                // typed editor, no options, no group
                {
                    const typedEditor = createTestFileEditorInput(uri_1.URI.file('file.editor-service-override-tests'), TEST_EDITOR_INPUT_ID);
                    const pane = await openEditor({ editor: typedEditor });
                    const typedInput = pane?.input;
                    assert.strictEqual(pane?.group, rootGroup);
                    assert.ok(typedInput instanceof workbenchTestServices_1.TestFileEditorInput);
                    assert.strictEqual(typedInput.resource.toString(), typedEditor.resource.toString());
                    assert.strictEqual(editorFactoryCalled, 0);
                    assert.strictEqual(untitledEditorFactoryCalled, 0);
                    assert.strictEqual(diffEditorFactoryCalled, 0);
                    assert.ok(!lastEditorFactoryEditor);
                    assert.ok(!lastUntitledEditorFactoryEditor);
                    assert.ok(!lastDiffEditorFactoryEditor);
                    // opening the same editor should not create
                    // a new editor input
                    await openEditor(typedEditor);
                    assert.strictEqual(pane?.group.activeEditor, typedEditor);
                    await resetTestState();
                }
                // typed editor, options (no override, sticky: true, preserveFocus: true), no group
                {
                    const typedEditor = createTestFileEditorInput(uri_1.URI.file('file.editor-service-override-tests'), TEST_EDITOR_INPUT_ID);
                    const pane = await openEditor({ editor: typedEditor, options: { sticky: true, preserveFocus: true } });
                    assert.strictEqual(pane?.group, rootGroup);
                    assert.ok(pane.input instanceof workbenchTestServices_1.TestFileEditorInput);
                    assert.strictEqual(pane.input.resource.toString(), typedEditor.resource.toString());
                    assert.strictEqual(pane.group.isSticky(pane.input), true);
                    assert.strictEqual(editorFactoryCalled, 0);
                    assert.strictEqual(untitledEditorFactoryCalled, 0);
                    assert.strictEqual(diffEditorFactoryCalled, 0);
                    assert.ok(!lastEditorFactoryEditor);
                    assert.ok(!lastUntitledEditorFactoryEditor);
                    assert.ok(!lastDiffEditorFactoryEditor);
                    await resetTestState();
                    await part.activeGroup.closeEditor(pane.input);
                }
                // typed editor, options (override default), no group
                {
                    const typedEditor = createTestFileEditorInput(uri_1.URI.file('file.editor-service-override-tests'), TEST_EDITOR_INPUT_ID);
                    const pane = await openEditor({ editor: typedEditor, options: { override: editor_2.DEFAULT_EDITOR_ASSOCIATION.id } });
                    assert.strictEqual(pane?.group, rootGroup);
                    // We shouldn't have resolved because it is a typed editor, even though we have an override specified
                    assert.ok(pane.input instanceof workbenchTestServices_1.TestFileEditorInput);
                    assert.strictEqual(pane.input.resource.toString(), typedEditor.resource.toString());
                    assert.strictEqual(editorFactoryCalled, 0);
                    assert.strictEqual(untitledEditorFactoryCalled, 0);
                    assert.strictEqual(diffEditorFactoryCalled, 0);
                    assert.ok(!lastEditorFactoryEditor);
                    assert.ok(!lastUntitledEditorFactoryEditor);
                    assert.ok(!lastDiffEditorFactoryEditor);
                    await resetTestState();
                }
                // typed editor, options (override: TEST_EDITOR_INPUT_ID), no group
                {
                    const typedEditor = createTestFileEditorInput(uri_1.URI.file('file.editor-service-override-tests'), TEST_EDITOR_INPUT_ID);
                    const pane = await openEditor({ editor: typedEditor, options: { override: TEST_EDITOR_INPUT_ID } });
                    assert.strictEqual(pane?.group, rootGroup);
                    assert.ok(pane.input instanceof workbenchTestServices_1.TestFileEditorInput);
                    assert.strictEqual(pane.input.resource.toString(), typedEditor.resource.toString());
                    assert.strictEqual(editorFactoryCalled, 0);
                    assert.strictEqual(untitledEditorFactoryCalled, 0);
                    assert.strictEqual(diffEditorFactoryCalled, 0);
                    assert.ok(!lastEditorFactoryEditor);
                    assert.ok(!lastUntitledEditorFactoryEditor);
                    assert.ok(!lastDiffEditorFactoryEditor);
                    await resetTestState();
                }
                // typed editor, options (sticky: true, preserveFocus: true), no group
                {
                    const typedEditor = createTestFileEditorInput(uri_1.URI.file('file.editor-service-override-tests'), TEST_EDITOR_INPUT_ID);
                    const pane = await openEditor({ editor: typedEditor, options: { sticky: true, preserveFocus: true } });
                    assert.strictEqual(pane?.group, rootGroup);
                    assert.ok(pane.input instanceof workbenchTestServices_1.TestFileEditorInput);
                    assert.strictEqual(pane.input.resource.toString(), typedEditor.resource.toString());
                    assert.strictEqual(pane.group.isSticky(pane.input), true);
                    assert.strictEqual(editorFactoryCalled, 0);
                    assert.strictEqual(untitledEditorFactoryCalled, 0);
                    assert.strictEqual(diffEditorFactoryCalled, 0);
                    assert.ok(!lastEditorFactoryEditor);
                    assert.ok(!lastUntitledEditorFactoryEditor);
                    assert.ok(!lastDiffEditorFactoryEditor);
                    await resetTestState();
                    await part.activeGroup.closeEditor(pane.input);
                }
                // typed editor, options (override: TEST_EDITOR_INPUT_ID, sticky: true, preserveFocus: true), no group
                {
                    const typedEditor = createTestFileEditorInput(uri_1.URI.file('file.editor-service-override-tests'), TEST_EDITOR_INPUT_ID);
                    const pane = await openEditor({ editor: typedEditor, options: { sticky: true, preserveFocus: true, override: TEST_EDITOR_INPUT_ID } });
                    assert.strictEqual(pane?.group, rootGroup);
                    assert.ok(pane.input instanceof workbenchTestServices_1.TestFileEditorInput);
                    assert.strictEqual(pane.input.resource.toString(), typedEditor.resource.toString());
                    assert.strictEqual(pane.group.isSticky(pane.input), true);
                    assert.strictEqual(editorFactoryCalled, 0);
                    assert.strictEqual(untitledEditorFactoryCalled, 0);
                    assert.strictEqual(diffEditorFactoryCalled, 0);
                    assert.ok(!lastEditorFactoryEditor);
                    assert.ok(!lastUntitledEditorFactoryEditor);
                    assert.ok(!lastDiffEditorFactoryEditor);
                    await resetTestState();
                    await part.activeGroup.closeEditor(pane.input);
                }
                // typed editor, no options, SIDE_GROUP
                {
                    const typedEditor = createTestFileEditorInput(uri_1.URI.file('file.editor-service-override-tests'), TEST_EDITOR_INPUT_ID);
                    const pane = await openEditor({ editor: typedEditor }, editorService_2.SIDE_GROUP);
                    assert.strictEqual(accessor.editorGroupService.groups.length, 2);
                    assert.notStrictEqual(pane?.group, rootGroup);
                    assert.ok(pane?.input instanceof workbenchTestServices_1.TestFileEditorInput);
                    assert.strictEqual(pane?.input.resource.toString(), typedEditor.resource.toString());
                    assert.strictEqual(editorFactoryCalled, 0);
                    assert.strictEqual(untitledEditorFactoryCalled, 0);
                    assert.strictEqual(diffEditorFactoryCalled, 0);
                    assert.ok(!lastEditorFactoryEditor);
                    assert.ok(!lastUntitledEditorFactoryEditor);
                    assert.ok(!lastDiffEditorFactoryEditor);
                    await resetTestState();
                }
                // typed editor, options (no override), SIDE_GROUP
                {
                    const typedEditor = createTestFileEditorInput(uri_1.URI.file('file.editor-service-override-tests'), TEST_EDITOR_INPUT_ID);
                    const pane = await openEditor({ editor: typedEditor }, editorService_2.SIDE_GROUP);
                    assert.strictEqual(accessor.editorGroupService.groups.length, 2);
                    assert.notStrictEqual(pane?.group, rootGroup);
                    assert.ok(pane?.input instanceof workbenchTestServices_1.TestFileEditorInput);
                    assert.strictEqual(pane.input.resource.toString(), typedEditor.resource.toString());
                    assert.strictEqual(editorFactoryCalled, 0);
                    assert.strictEqual(untitledEditorFactoryCalled, 0);
                    assert.strictEqual(diffEditorFactoryCalled, 0);
                    assert.ok(!lastEditorFactoryEditor);
                    assert.ok(!lastUntitledEditorFactoryEditor);
                    assert.ok(!lastDiffEditorFactoryEditor);
                    await resetTestState();
                }
            }
            // Untyped untitled
            {
                // untyped untitled editor, no options, no group
                {
                    const untypedEditor = { resource: undefined, options: { override: TEST_EDITOR_INPUT_ID } };
                    const pane = await openEditor(untypedEditor);
                    assert.strictEqual(pane?.group, rootGroup);
                    assert.ok(pane.input instanceof workbenchTestServices_1.TestFileEditorInput);
                    assert.strictEqual(pane.input.resource.scheme, 'untitled');
                    assert.strictEqual(editorFactoryCalled, 0);
                    assert.strictEqual(untitledEditorFactoryCalled, 1);
                    assert.strictEqual(diffEditorFactoryCalled, 0);
                    assert.ok(!lastEditorFactoryEditor);
                    assert.strictEqual(lastUntitledEditorFactoryEditor, untypedEditor);
                    assert.ok(!lastDiffEditorFactoryEditor);
                    await resetTestState();
                }
                // untyped untitled editor, no options, SIDE_GROUP
                {
                    const untypedEditor = { resource: undefined, options: { override: TEST_EDITOR_INPUT_ID } };
                    const pane = await openEditor(untypedEditor, editorService_2.SIDE_GROUP);
                    assert.strictEqual(accessor.editorGroupService.groups.length, 2);
                    assert.notStrictEqual(pane?.group, rootGroup);
                    assert.ok(pane?.input instanceof workbenchTestServices_1.TestFileEditorInput);
                    assert.strictEqual(pane?.input.resource.scheme, 'untitled');
                    assert.strictEqual(editorFactoryCalled, 0);
                    assert.strictEqual(untitledEditorFactoryCalled, 1);
                    assert.strictEqual(diffEditorFactoryCalled, 0);
                    assert.ok(!lastEditorFactoryEditor);
                    assert.strictEqual(lastUntitledEditorFactoryEditor, untypedEditor);
                    assert.ok(!lastDiffEditorFactoryEditor);
                    await resetTestState();
                }
                // untyped untitled editor with associated resource, no options, no group
                {
                    const untypedEditor = { resource: uri_1.URI.file('file-original.editor-service-override-tests').with({ scheme: 'untitled' }) };
                    const pane = await openEditor(untypedEditor);
                    const typedEditor = pane?.input;
                    assert.strictEqual(pane?.group, rootGroup);
                    assert.ok(typedEditor instanceof workbenchTestServices_1.TestFileEditorInput);
                    assert.strictEqual(typedEditor.resource.scheme, 'untitled');
                    assert.strictEqual(editorFactoryCalled, 0);
                    assert.strictEqual(untitledEditorFactoryCalled, 1);
                    assert.strictEqual(diffEditorFactoryCalled, 0);
                    assert.ok(!lastEditorFactoryEditor);
                    assert.strictEqual(lastUntitledEditorFactoryEditor, untypedEditor);
                    assert.ok(!lastDiffEditorFactoryEditor);
                    // opening the same editor should not create
                    // a new editor input
                    await openEditor(untypedEditor);
                    assert.strictEqual(pane?.group.activeEditor, typedEditor);
                    await resetTestState();
                }
                // untyped untitled editor, options (sticky: true, preserveFocus: true), no group
                {
                    const untypedEditor = { resource: undefined, options: { sticky: true, preserveFocus: true, override: TEST_EDITOR_INPUT_ID } };
                    const pane = await openEditor(untypedEditor);
                    assert.strictEqual(pane?.group, rootGroup);
                    assert.ok(pane.input instanceof workbenchTestServices_1.TestFileEditorInput);
                    assert.strictEqual(pane.input.resource.scheme, 'untitled');
                    assert.strictEqual(pane.group.isSticky(pane.input), true);
                    assert.strictEqual(editorFactoryCalled, 0);
                    assert.strictEqual(untitledEditorFactoryCalled, 1);
                    assert.strictEqual(diffEditorFactoryCalled, 0);
                    assert.ok(!lastEditorFactoryEditor);
                    assert.strictEqual(lastUntitledEditorFactoryEditor, untypedEditor);
                    assert.strictEqual(lastUntitledEditorFactoryEditor.options?.preserveFocus, true);
                    assert.strictEqual(lastUntitledEditorFactoryEditor.options?.sticky, true);
                    assert.ok(!lastDiffEditorFactoryEditor);
                    await resetTestState();
                }
            }
            // Untyped diff
            {
                // untyped diff editor, no options, no group
                {
                    const untypedEditor = {
                        original: { resource: uri_1.URI.file('file-original.editor-service-override-tests') },
                        modified: { resource: uri_1.URI.file('file-modified.editor-service-override-tests') },
                        options: { override: TEST_EDITOR_INPUT_ID }
                    };
                    const pane = await openEditor(untypedEditor);
                    const typedEditor = pane?.input;
                    assert.strictEqual(pane?.group, rootGroup);
                    assert.ok(typedEditor instanceof workbenchTestServices_1.TestFileEditorInput);
                    assert.strictEqual(editorFactoryCalled, 0);
                    assert.strictEqual(untitledEditorFactoryCalled, 0);
                    assert.strictEqual(diffEditorFactoryCalled, 1);
                    assert.ok(!lastEditorFactoryEditor);
                    assert.ok(!lastUntitledEditorFactoryEditor);
                    assert.strictEqual(lastDiffEditorFactoryEditor, untypedEditor);
                    await resetTestState();
                }
                // untyped diff editor, no options, SIDE_GROUP
                {
                    const untypedEditor = {
                        original: { resource: uri_1.URI.file('file-original.editor-service-override-tests') },
                        modified: { resource: uri_1.URI.file('file-modified.editor-service-override-tests') },
                        options: { override: TEST_EDITOR_INPUT_ID }
                    };
                    const pane = await openEditor(untypedEditor, editorService_2.SIDE_GROUP);
                    assert.strictEqual(accessor.editorGroupService.groups.length, 2);
                    assert.notStrictEqual(pane?.group, rootGroup);
                    assert.ok(pane?.input instanceof workbenchTestServices_1.TestFileEditorInput);
                    assert.strictEqual(editorFactoryCalled, 0);
                    assert.strictEqual(untitledEditorFactoryCalled, 0);
                    assert.strictEqual(diffEditorFactoryCalled, 1);
                    assert.ok(!lastEditorFactoryEditor);
                    assert.ok(!lastUntitledEditorFactoryEditor);
                    assert.strictEqual(lastDiffEditorFactoryEditor, untypedEditor);
                    await resetTestState();
                }
                // untyped diff editor, options (sticky: true, preserveFocus: true), no group
                {
                    const untypedEditor = {
                        original: { resource: uri_1.URI.file('file-original.editor-service-override-tests') },
                        modified: { resource: uri_1.URI.file('file-modified.editor-service-override-tests') },
                        options: {
                            override: TEST_EDITOR_INPUT_ID, sticky: true, preserveFocus: true
                        }
                    };
                    const pane = await openEditor(untypedEditor);
                    assert.strictEqual(pane?.group, rootGroup);
                    assert.ok(pane.input instanceof workbenchTestServices_1.TestFileEditorInput);
                    assert.strictEqual(pane.group.isSticky(pane.input), true);
                    assert.strictEqual(editorFactoryCalled, 0);
                    assert.strictEqual(untitledEditorFactoryCalled, 0);
                    assert.strictEqual(diffEditorFactoryCalled, 1);
                    assert.ok(!lastEditorFactoryEditor);
                    assert.ok(!lastUntitledEditorFactoryEditor);
                    assert.strictEqual(lastDiffEditorFactoryEditor, untypedEditor);
                    assert.strictEqual(lastDiffEditorFactoryEditor.options?.preserveFocus, true);
                    assert.strictEqual(lastDiffEditorFactoryEditor.options?.sticky, true);
                    await resetTestState();
                }
            }
            // typed editor, not registered
            {
                // no options, no group
                {
                    const typedEditor = createTestFileEditorInput(uri_1.URI.file('file.something'), TEST_EDITOR_INPUT_ID);
                    const pane = await openEditor({ editor: typedEditor });
                    assert.strictEqual(pane?.group, rootGroup);
                    assert.ok(pane.input instanceof workbenchTestServices_1.TestFileEditorInput);
                    assert.strictEqual(pane.input, typedEditor);
                    assert.strictEqual(editorFactoryCalled, 0);
                    assert.strictEqual(untitledEditorFactoryCalled, 0);
                    assert.strictEqual(diffEditorFactoryCalled, 0);
                    assert.ok(!lastEditorFactoryEditor);
                    assert.ok(!lastUntitledEditorFactoryEditor);
                    assert.ok(!lastDiffEditorFactoryEditor);
                    await resetTestState();
                }
                // no options, SIDE_GROUP
                {
                    const typedEditor = createTestFileEditorInput(uri_1.URI.file('file.something'), TEST_EDITOR_INPUT_ID);
                    const pane = await openEditor({ editor: typedEditor }, editorService_2.SIDE_GROUP);
                    assert.strictEqual(accessor.editorGroupService.groups.length, 2);
                    assert.notStrictEqual(pane?.group, rootGroup);
                    assert.ok(pane?.input instanceof workbenchTestServices_1.TestFileEditorInput);
                    assert.strictEqual(pane?.input, typedEditor);
                    assert.strictEqual(editorFactoryCalled, 0);
                    assert.strictEqual(untitledEditorFactoryCalled, 0);
                    assert.strictEqual(diffEditorFactoryCalled, 0);
                    assert.ok(!lastEditorFactoryEditor);
                    assert.ok(!lastUntitledEditorFactoryEditor);
                    assert.ok(!lastDiffEditorFactoryEditor);
                    await resetTestState();
                }
            }
            // typed editor, not supporting `toUntyped`
            {
                // no options, no group
                {
                    const typedEditor = createTestFileEditorInput(uri_1.URI.file('file.something'), TEST_EDITOR_INPUT_ID);
                    typedEditor.disableToUntyped = true;
                    const pane = await openEditor({ editor: typedEditor });
                    assert.strictEqual(pane?.group, rootGroup);
                    assert.ok(pane.input instanceof workbenchTestServices_1.TestFileEditorInput);
                    assert.strictEqual(pane.input, typedEditor);
                    assert.strictEqual(editorFactoryCalled, 0);
                    assert.strictEqual(untitledEditorFactoryCalled, 0);
                    assert.strictEqual(diffEditorFactoryCalled, 0);
                    assert.ok(!lastEditorFactoryEditor);
                    assert.ok(!lastUntitledEditorFactoryEditor);
                    assert.ok(!lastDiffEditorFactoryEditor);
                    await resetTestState();
                }
                // no options, SIDE_GROUP
                {
                    const typedEditor = createTestFileEditorInput(uri_1.URI.file('file.something'), TEST_EDITOR_INPUT_ID);
                    typedEditor.disableToUntyped = true;
                    const pane = await openEditor({ editor: typedEditor }, editorService_2.SIDE_GROUP);
                    assert.strictEqual(accessor.editorGroupService.groups.length, 2);
                    assert.notStrictEqual(pane?.group, rootGroup);
                    assert.ok(pane?.input instanceof workbenchTestServices_1.TestFileEditorInput);
                    assert.strictEqual(pane?.input, typedEditor);
                    assert.strictEqual(editorFactoryCalled, 0);
                    assert.strictEqual(untitledEditorFactoryCalled, 0);
                    assert.strictEqual(diffEditorFactoryCalled, 0);
                    assert.ok(!lastEditorFactoryEditor);
                    assert.ok(!lastUntitledEditorFactoryEditor);
                    assert.ok(!lastDiffEditorFactoryEditor);
                    await resetTestState();
                }
            }
            // openEditors with >1 editor
            if (useOpenEditors) {
                // mix of untyped and typed editors
                {
                    const untypedEditor1 = { resource: uri_1.URI.file('file1.editor-service-override-tests') };
                    const untypedEditor2 = { resource: uri_1.URI.file('file2.editor-service-override-tests') };
                    const untypedEditor3 = { editor: createTestFileEditorInput(uri_1.URI.file('file3.editor-service-override-tests'), TEST_EDITOR_INPUT_ID) };
                    const untypedEditor4 = { editor: createTestFileEditorInput(uri_1.URI.file('file4.editor-service-override-tests'), TEST_EDITOR_INPUT_ID) };
                    const untypedEditor5 = { resource: uri_1.URI.file('file5.editor-service-override-tests') };
                    const pane = (await service.openEditors([untypedEditor1, untypedEditor2, untypedEditor3, untypedEditor4, untypedEditor5]))[0];
                    assert.strictEqual(pane?.group, rootGroup);
                    assert.strictEqual(pane?.group.count, 5);
                    // Only the untyped editors should have had factories called (3 untyped editors)
                    assert.strictEqual(editorFactoryCalled, 3);
                    assert.strictEqual(untitledEditorFactoryCalled, 0);
                    assert.strictEqual(diffEditorFactoryCalled, 0);
                    assert.ok(lastEditorFactoryEditor);
                    assert.ok(!lastUntitledEditorFactoryEditor);
                    assert.ok(!lastDiffEditorFactoryEditor);
                    await resetTestState();
                }
            }
            // untyped default editor
            {
                // untyped default editor, options: revealIfVisible
                {
                    const untypedEditor1 = { resource: uri_1.URI.file('file-1'), options: { revealIfVisible: true, pinned: true } };
                    const untypedEditor2 = { resource: uri_1.URI.file('file-2'), options: { pinned: true } };
                    const rootPane = await openEditor(untypedEditor1);
                    const sidePane = await openEditor(untypedEditor2, editorService_2.SIDE_GROUP);
                    assert.strictEqual(rootPane?.group?.count, 1);
                    assert.strictEqual(sidePane?.group?.count, 1);
                    accessor.editorGroupService.activateGroup(sidePane.group);
                    await openEditor(untypedEditor1);
                    assert.strictEqual(rootPane?.group?.count, 1);
                    assert.strictEqual(sidePane?.group?.count, 1);
                    await resetTestState();
                }
                // untyped default editor, options: revealIfOpened
                {
                    const untypedEditor1 = { resource: uri_1.URI.file('file-1'), options: { revealIfOpened: true, pinned: true } };
                    const untypedEditor2 = { resource: uri_1.URI.file('file-2'), options: { pinned: true } };
                    const rootPane = await openEditor(untypedEditor1);
                    await openEditor(untypedEditor2);
                    assert.strictEqual(rootPane?.group?.activeEditor?.resource?.toString(), untypedEditor2.resource.toString());
                    const sidePane = await openEditor(untypedEditor2, editorService_2.SIDE_GROUP);
                    assert.strictEqual(rootPane?.group?.count, 2);
                    assert.strictEqual(sidePane?.group?.count, 1);
                    accessor.editorGroupService.activateGroup(sidePane.group);
                    await openEditor(untypedEditor1);
                    assert.strictEqual(rootPane?.group?.count, 2);
                    assert.strictEqual(sidePane?.group?.count, 1);
                    await resetTestState();
                }
            }
        }
        test('openEditor() applies options if editor already opened', async () => {
            disposables.add((0, workbenchTestServices_1.registerTestFileEditor)());
            const [, service, accessor] = await createEditorService();
            disposables.add(accessor.editorResolverService.registerEditor('*.editor-service-override-tests', { id: TEST_EDITOR_INPUT_ID, label: 'Label', priority: editorResolverService_1.RegisteredEditorPriority.exclusive }, {}, {
                createEditorInput: editor => ({ editor: createTestFileEditorInput(editor.resource, TEST_EDITOR_INPUT_ID) })
            }));
            // Typed editor
            let pane = await service.openEditor(createTestFileEditorInput(uri_1.URI.parse('my://resource-openEditors'), TEST_EDITOR_INPUT_ID));
            pane = await service.openEditor(createTestFileEditorInput(uri_1.URI.parse('my://resource-openEditors'), TEST_EDITOR_INPUT_ID), { sticky: true, preserveFocus: true });
            assert.strictEqual(pane?.options?.sticky, true);
            assert.strictEqual(pane?.options?.preserveFocus, true);
            await pane.group?.closeAllEditors();
            // Untyped editor (without registered editor)
            pane = await service.openEditor({ resource: uri_1.URI.file('resource-openEditors') });
            pane = await service.openEditor({ resource: uri_1.URI.file('resource-openEditors'), options: { sticky: true, preserveFocus: true } });
            assert.ok(pane instanceof workbenchTestServices_1.TestTextFileEditor);
            assert.strictEqual(pane?.options?.sticky, true);
            assert.strictEqual(pane?.options?.preserveFocus, true);
            // Untyped editor (with registered editor)
            pane = await service.openEditor({ resource: uri_1.URI.file('file.editor-service-override-tests') });
            pane = await service.openEditor({ resource: uri_1.URI.file('file.editor-service-override-tests'), options: { sticky: true, preserveFocus: true } });
            assert.strictEqual(pane?.options?.sticky, true);
            assert.strictEqual(pane?.options?.preserveFocus, true);
        });
        test('isOpen() with side by side editor', async () => {
            const [part, service] = await createEditorService();
            const input = createTestFileEditorInput(uri_1.URI.parse('my://resource-openEditors'), TEST_EDITOR_INPUT_ID);
            const otherInput = createTestFileEditorInput(uri_1.URI.parse('my://resource2-openEditors'), TEST_EDITOR_INPUT_ID);
            const sideBySideInput = new sideBySideEditorInput_1.SideBySideEditorInput('sideBySide', '', input, otherInput, service);
            const editor1 = await service.openEditor(sideBySideInput, { pinned: true });
            assert.strictEqual(part.activeGroup.count, 1);
            assert.strictEqual(service.isOpened(input), false);
            assert.strictEqual(service.isOpened(otherInput), true);
            assert.strictEqual(service.isOpened({ resource: input.resource, typeId: input.typeId, editorId: input.editorId }), false);
            assert.strictEqual(service.isOpened({ resource: otherInput.resource, typeId: otherInput.typeId, editorId: otherInput.editorId }), true);
            const editor2 = await service.openEditor(input, { pinned: true });
            assert.strictEqual(part.activeGroup.count, 2);
            assert.strictEqual(service.isOpened(input), true);
            assert.strictEqual(service.isOpened(otherInput), true);
            assert.strictEqual(service.isOpened({ resource: input.resource, typeId: input.typeId, editorId: input.editorId }), true);
            assert.strictEqual(service.isOpened({ resource: otherInput.resource, typeId: otherInput.typeId, editorId: otherInput.editorId }), true);
            await editor2?.group?.closeEditor(input);
            assert.strictEqual(part.activeGroup.count, 1);
            assert.strictEqual(service.isOpened(input), false);
            assert.strictEqual(service.isOpened(otherInput), true);
            assert.strictEqual(service.isOpened({ resource: input.resource, typeId: input.typeId, editorId: input.editorId }), false);
            assert.strictEqual(service.isOpened({ resource: otherInput.resource, typeId: otherInput.typeId, editorId: otherInput.editorId }), true);
            await editor1?.group?.closeEditor(sideBySideInput);
            assert.strictEqual(service.isOpened(input), false);
            assert.strictEqual(service.isOpened(otherInput), false);
            assert.strictEqual(service.isOpened({ resource: input.resource, typeId: input.typeId, editorId: input.editorId }), false);
            assert.strictEqual(service.isOpened({ resource: otherInput.resource, typeId: otherInput.typeId, editorId: otherInput.editorId }), false);
        });
        test('openEditors() / replaceEditors()', async () => {
            const [part, service] = await createEditorService();
            const input = createTestFileEditorInput(uri_1.URI.parse('my://resource-openEditors'), TEST_EDITOR_INPUT_ID);
            const otherInput = createTestFileEditorInput(uri_1.URI.parse('my://resource2-openEditors'), TEST_EDITOR_INPUT_ID);
            const replaceInput = createTestFileEditorInput(uri_1.URI.parse('my://resource3-openEditors'), TEST_EDITOR_INPUT_ID);
            // Open editors
            await service.openEditors([{ editor: input }, { editor: otherInput }]);
            assert.strictEqual(part.activeGroup.count, 2);
            // Replace editors
            await service.replaceEditors([{ editor: input, replacement: replaceInput }], part.activeGroup);
            assert.strictEqual(part.activeGroup.count, 2);
            assert.strictEqual(part.activeGroup.getIndexOfEditor(replaceInput), 0);
        });
        test('openEditors() handles workspace trust (typed editors)', async () => {
            const [part, service, accessor] = await createEditorService();
            const input1 = createTestFileEditorInput(uri_1.URI.parse('my://resource1-openEditors'), TEST_EDITOR_INPUT_ID);
            const input2 = createTestFileEditorInput(uri_1.URI.parse('my://resource2-openEditors'), TEST_EDITOR_INPUT_ID);
            const input3 = createTestFileEditorInput(uri_1.URI.parse('my://resource3-openEditors'), TEST_EDITOR_INPUT_ID);
            const input4 = createTestFileEditorInput(uri_1.URI.parse('my://resource4-openEditors'), TEST_EDITOR_INPUT_ID);
            const sideBySideInput = new sideBySideEditorInput_1.SideBySideEditorInput('side by side', undefined, input3, input4, service);
            const oldHandler = accessor.workspaceTrustRequestService.requestOpenUrisHandler;
            try {
                // Trust: cancel
                let trustEditorUris = [];
                accessor.workspaceTrustRequestService.requestOpenUrisHandler = async (uris) => {
                    trustEditorUris = uris;
                    return 3 /* WorkspaceTrustUriResponse.Cancel */;
                };
                await service.openEditors([{ editor: input1 }, { editor: input2 }, { editor: sideBySideInput }], undefined, { validateTrust: true });
                assert.strictEqual(part.activeGroup.count, 0);
                assert.strictEqual(trustEditorUris.length, 4);
                assert.strictEqual(trustEditorUris.some(uri => uri.toString() === input1.resource.toString()), true);
                assert.strictEqual(trustEditorUris.some(uri => uri.toString() === input2.resource.toString()), true);
                assert.strictEqual(trustEditorUris.some(uri => uri.toString() === input3.resource.toString()), true);
                assert.strictEqual(trustEditorUris.some(uri => uri.toString() === input4.resource.toString()), true);
                // Trust: open in new window
                accessor.workspaceTrustRequestService.requestOpenUrisHandler = async (uris) => 2 /* WorkspaceTrustUriResponse.OpenInNewWindow */;
                await service.openEditors([{ editor: input1 }, { editor: input2 }, { editor: sideBySideInput }], undefined, { validateTrust: true });
                assert.strictEqual(part.activeGroup.count, 0);
                // Trust: allow
                accessor.workspaceTrustRequestService.requestOpenUrisHandler = async (uris) => 1 /* WorkspaceTrustUriResponse.Open */;
                await service.openEditors([{ editor: input1 }, { editor: input2 }, { editor: sideBySideInput }], undefined, { validateTrust: true });
                assert.strictEqual(part.activeGroup.count, 3);
            }
            finally {
                accessor.workspaceTrustRequestService.requestOpenUrisHandler = oldHandler;
            }
        });
        test('openEditors() ignores trust when `validateTrust: false', async () => {
            const [part, service, accessor] = await createEditorService();
            const input1 = createTestFileEditorInput(uri_1.URI.parse('my://resource1-openEditors'), TEST_EDITOR_INPUT_ID);
            const input2 = createTestFileEditorInput(uri_1.URI.parse('my://resource2-openEditors'), TEST_EDITOR_INPUT_ID);
            const input3 = createTestFileEditorInput(uri_1.URI.parse('my://resource3-openEditors'), TEST_EDITOR_INPUT_ID);
            const input4 = createTestFileEditorInput(uri_1.URI.parse('my://resource4-openEditors'), TEST_EDITOR_INPUT_ID);
            const sideBySideInput = new sideBySideEditorInput_1.SideBySideEditorInput('side by side', undefined, input3, input4, service);
            const oldHandler = accessor.workspaceTrustRequestService.requestOpenUrisHandler;
            try {
                // Trust: cancel
                accessor.workspaceTrustRequestService.requestOpenUrisHandler = async (uris) => 3 /* WorkspaceTrustUriResponse.Cancel */;
                await service.openEditors([{ editor: input1 }, { editor: input2 }, { editor: sideBySideInput }]);
                assert.strictEqual(part.activeGroup.count, 3);
            }
            finally {
                accessor.workspaceTrustRequestService.requestOpenUrisHandler = oldHandler;
            }
        });
        test('openEditors() extracts proper resources from untyped editors for workspace trust', async () => {
            const [, service, accessor] = await createEditorService();
            const input = { resource: uri_1.URI.file('resource-openEditors') };
            const otherInput = {
                original: { resource: uri_1.URI.parse('my://resource2-openEditors') },
                modified: { resource: uri_1.URI.parse('my://resource3-openEditors') }
            };
            const oldHandler = accessor.workspaceTrustRequestService.requestOpenUrisHandler;
            try {
                let trustEditorUris = [];
                accessor.workspaceTrustRequestService.requestOpenUrisHandler = async (uris) => {
                    trustEditorUris = uris;
                    return oldHandler(uris);
                };
                await service.openEditors([input, otherInput], undefined, { validateTrust: true });
                assert.strictEqual(trustEditorUris.length, 3);
                assert.strictEqual(trustEditorUris.some(uri => uri.toString() === input.resource.toString()), true);
                assert.strictEqual(trustEditorUris.some(uri => uri.toString() === otherInput.original.resource?.toString()), true);
                assert.strictEqual(trustEditorUris.some(uri => uri.toString() === otherInput.modified.resource?.toString()), true);
            }
            finally {
                accessor.workspaceTrustRequestService.requestOpenUrisHandler = oldHandler;
            }
        });
        test('close editor does not dispose when editor opened in other group', async () => {
            const [part, service] = await createEditorService();
            const input = createTestFileEditorInput(uri_1.URI.parse('my://resource-close1'), TEST_EDITOR_INPUT_ID);
            const rootGroup = part.activeGroup;
            const rightGroup = part.addGroup(rootGroup, 3 /* GroupDirection.RIGHT */);
            // Open input
            await service.openEditor(input, { pinned: true });
            await service.openEditor(input, { pinned: true }, rightGroup);
            const editors = service.editors;
            assert.strictEqual(editors.length, 2);
            assert.strictEqual(editors[0], input);
            assert.strictEqual(editors[1], input);
            // Close input
            await rootGroup.closeEditor(input);
            assert.strictEqual(input.isDisposed(), false);
            await rightGroup.closeEditor(input);
            assert.strictEqual(input.isDisposed(), true);
        });
        test('open to the side', async () => {
            const [part, service] = await createEditorService();
            const input1 = createTestFileEditorInput(uri_1.URI.parse('my://resource1-openside'), TEST_EDITOR_INPUT_ID);
            const input2 = createTestFileEditorInput(uri_1.URI.parse('my://resource2-openside'), TEST_EDITOR_INPUT_ID);
            const rootGroup = part.activeGroup;
            await service.openEditor(input1, { pinned: true }, rootGroup);
            let editor = await service.openEditor(input1, { pinned: true, preserveFocus: true }, editorService_2.SIDE_GROUP);
            assert.strictEqual(part.activeGroup, rootGroup);
            assert.strictEqual(part.count, 2);
            assert.strictEqual(editor?.group, part.groups[1]);
            assert.strictEqual(service.isVisible(input1), true);
            assert.strictEqual(service.isOpened(input1), true);
            // Open to the side uses existing neighbour group if any
            editor = await service.openEditor(input2, { pinned: true, preserveFocus: true }, editorService_2.SIDE_GROUP);
            assert.strictEqual(part.activeGroup, rootGroup);
            assert.strictEqual(part.count, 2);
            assert.strictEqual(editor?.group, part.groups[1]);
            assert.strictEqual(service.isVisible(input2), true);
            assert.strictEqual(service.isOpened(input2), true);
        });
        test('editor group activation', async () => {
            const [part, service] = await createEditorService();
            const input1 = createTestFileEditorInput(uri_1.URI.parse('my://resource1-openside'), TEST_EDITOR_INPUT_ID);
            const input2 = createTestFileEditorInput(uri_1.URI.parse('my://resource2-openside'), TEST_EDITOR_INPUT_ID);
            const rootGroup = part.activeGroup;
            await service.openEditor(input1, { pinned: true }, rootGroup);
            let editor = await service.openEditor(input2, { pinned: true, preserveFocus: true, activation: editor_1.EditorActivation.ACTIVATE }, editorService_2.SIDE_GROUP);
            const sideGroup = editor?.group;
            assert.strictEqual(part.activeGroup, sideGroup);
            editor = await service.openEditor(input1, { pinned: true, preserveFocus: true, activation: editor_1.EditorActivation.PRESERVE }, rootGroup);
            assert.strictEqual(part.activeGroup, sideGroup);
            editor = await service.openEditor(input1, { pinned: true, preserveFocus: true, activation: editor_1.EditorActivation.ACTIVATE }, rootGroup);
            assert.strictEqual(part.activeGroup, rootGroup);
            editor = await service.openEditor(input2, { pinned: true, activation: editor_1.EditorActivation.PRESERVE }, sideGroup);
            assert.strictEqual(part.activeGroup, rootGroup);
            editor = await service.openEditor(input2, { pinned: true, activation: editor_1.EditorActivation.ACTIVATE }, sideGroup);
            assert.strictEqual(part.activeGroup, sideGroup);
            part.arrangeGroups(0 /* GroupsArrangement.MAXIMIZE */);
            editor = await service.openEditor(input1, { pinned: true, preserveFocus: true, activation: editor_1.EditorActivation.RESTORE }, rootGroup);
            assert.strictEqual(part.activeGroup, sideGroup);
        });
        test('inactive editor group does not activate when closing editor (#117686)', async () => {
            const [part, service] = await createEditorService();
            const input1 = createTestFileEditorInput(uri_1.URI.parse('my://resource1-openside'), TEST_EDITOR_INPUT_ID);
            const input2 = createTestFileEditorInput(uri_1.URI.parse('my://resource2-openside'), TEST_EDITOR_INPUT_ID);
            const rootGroup = part.activeGroup;
            await service.openEditor(input1, { pinned: true }, rootGroup);
            await service.openEditor(input2, { pinned: true }, rootGroup);
            const sideGroup = (await service.openEditor(input2, { pinned: true }, editorService_2.SIDE_GROUP))?.group;
            assert.strictEqual(part.activeGroup, sideGroup);
            assert.notStrictEqual(rootGroup, sideGroup);
            part.arrangeGroups(0 /* GroupsArrangement.MAXIMIZE */, part.activeGroup);
            await rootGroup.closeEditor(input2);
            assert.strictEqual(part.activeGroup, sideGroup);
            assert(!part.isGroupMaximized(rootGroup));
            assert(part.isGroupMaximized(part.activeGroup));
        });
        test('active editor change / visible editor change events', async function () {
            const [part, service] = await createEditorService();
            let input = createTestFileEditorInput(uri_1.URI.parse('my://resource-active'), TEST_EDITOR_INPUT_ID);
            let otherInput = createTestFileEditorInput(uri_1.URI.parse('my://resource2-active'), TEST_EDITOR_INPUT_ID);
            let activeEditorChangeEventFired = false;
            const activeEditorChangeListener = service.onDidActiveEditorChange(() => {
                activeEditorChangeEventFired = true;
            });
            let visibleEditorChangeEventFired = false;
            const visibleEditorChangeListener = service.onDidVisibleEditorsChange(() => {
                visibleEditorChangeEventFired = true;
            });
            function assertActiveEditorChangedEvent(expected) {
                assert.strictEqual(activeEditorChangeEventFired, expected, `Unexpected active editor change state (got ${activeEditorChangeEventFired}, expected ${expected})`);
                activeEditorChangeEventFired = false;
            }
            function assertVisibleEditorsChangedEvent(expected) {
                assert.strictEqual(visibleEditorChangeEventFired, expected, `Unexpected visible editors change state (got ${visibleEditorChangeEventFired}, expected ${expected})`);
                visibleEditorChangeEventFired = false;
            }
            async function closeEditorAndWaitForNextToOpen(group, input) {
                await group.closeEditor(input);
                await (0, async_1.timeout)(0); // closing an editor will not immediately open the next one, so we need to wait
            }
            // 1.) open, open same, open other, close
            let editor = await service.openEditor(input, { pinned: true });
            const group = editor?.group;
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            editor = await service.openEditor(input);
            assertActiveEditorChangedEvent(false);
            assertVisibleEditorsChangedEvent(false);
            editor = await service.openEditor(otherInput);
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            await closeEditorAndWaitForNextToOpen(group, otherInput);
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            await closeEditorAndWaitForNextToOpen(group, input);
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            // 2.) open, open same (forced open) (recreate inputs that got disposed)
            input = createTestFileEditorInput(uri_1.URI.parse('my://resource-active'), TEST_EDITOR_INPUT_ID);
            otherInput = createTestFileEditorInput(uri_1.URI.parse('my://resource2-active'), TEST_EDITOR_INPUT_ID);
            editor = await service.openEditor(input);
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            editor = await service.openEditor(input, { forceReload: true });
            assertActiveEditorChangedEvent(false);
            assertVisibleEditorsChangedEvent(false);
            await closeEditorAndWaitForNextToOpen(group, input);
            // 3.) open, open inactive, close (recreate inputs that got disposed)
            input = createTestFileEditorInput(uri_1.URI.parse('my://resource-active'), TEST_EDITOR_INPUT_ID);
            otherInput = createTestFileEditorInput(uri_1.URI.parse('my://resource2-active'), TEST_EDITOR_INPUT_ID);
            editor = await service.openEditor(input, { pinned: true });
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            editor = await service.openEditor(otherInput, { inactive: true });
            assertActiveEditorChangedEvent(false);
            assertVisibleEditorsChangedEvent(false);
            await group.closeAllEditors();
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            // 4.) open, open inactive, close inactive (recreate inputs that got disposed)
            input = createTestFileEditorInput(uri_1.URI.parse('my://resource-active'), TEST_EDITOR_INPUT_ID);
            otherInput = createTestFileEditorInput(uri_1.URI.parse('my://resource2-active'), TEST_EDITOR_INPUT_ID);
            editor = await service.openEditor(input, { pinned: true });
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            editor = await service.openEditor(otherInput, { inactive: true });
            assertActiveEditorChangedEvent(false);
            assertVisibleEditorsChangedEvent(false);
            await closeEditorAndWaitForNextToOpen(group, otherInput);
            assertActiveEditorChangedEvent(false);
            assertVisibleEditorsChangedEvent(false);
            await group.closeAllEditors();
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            // 5.) add group, remove group (recreate inputs that got disposed)
            input = createTestFileEditorInput(uri_1.URI.parse('my://resource-active'), TEST_EDITOR_INPUT_ID);
            otherInput = createTestFileEditorInput(uri_1.URI.parse('my://resource2-active'), TEST_EDITOR_INPUT_ID);
            editor = await service.openEditor(input, { pinned: true });
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            let rightGroup = part.addGroup(part.activeGroup, 3 /* GroupDirection.RIGHT */);
            assertActiveEditorChangedEvent(false);
            assertVisibleEditorsChangedEvent(false);
            rightGroup.focus();
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(false);
            part.removeGroup(rightGroup);
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(false);
            await group.closeAllEditors();
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            // 6.) open editor in inactive group (recreate inputs that got disposed)
            input = createTestFileEditorInput(uri_1.URI.parse('my://resource-active'), TEST_EDITOR_INPUT_ID);
            otherInput = createTestFileEditorInput(uri_1.URI.parse('my://resource2-active'), TEST_EDITOR_INPUT_ID);
            editor = await service.openEditor(input, { pinned: true });
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            rightGroup = part.addGroup(part.activeGroup, 3 /* GroupDirection.RIGHT */);
            assertActiveEditorChangedEvent(false);
            assertVisibleEditorsChangedEvent(false);
            await rightGroup.openEditor(otherInput);
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            await closeEditorAndWaitForNextToOpen(rightGroup, otherInput);
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            await group.closeAllEditors();
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            // 7.) activate group (recreate inputs that got disposed)
            input = createTestFileEditorInput(uri_1.URI.parse('my://resource-active'), TEST_EDITOR_INPUT_ID);
            otherInput = createTestFileEditorInput(uri_1.URI.parse('my://resource2-active'), TEST_EDITOR_INPUT_ID);
            editor = await service.openEditor(input, { pinned: true });
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            rightGroup = part.addGroup(part.activeGroup, 3 /* GroupDirection.RIGHT */);
            assertActiveEditorChangedEvent(false);
            assertVisibleEditorsChangedEvent(false);
            await rightGroup.openEditor(otherInput);
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            group.focus();
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(false);
            await closeEditorAndWaitForNextToOpen(rightGroup, otherInput);
            assertActiveEditorChangedEvent(false);
            assertVisibleEditorsChangedEvent(true);
            await group.closeAllEditors();
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            // 8.) move editor (recreate inputs that got disposed)
            input = createTestFileEditorInput(uri_1.URI.parse('my://resource-active'), TEST_EDITOR_INPUT_ID);
            otherInput = createTestFileEditorInput(uri_1.URI.parse('my://resource2-active'), TEST_EDITOR_INPUT_ID);
            editor = await service.openEditor(input, { pinned: true });
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            editor = await service.openEditor(otherInput, { pinned: true });
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            group.moveEditor(otherInput, group, { index: 0 });
            assertActiveEditorChangedEvent(false);
            assertVisibleEditorsChangedEvent(false);
            await group.closeAllEditors();
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            // 9.) close editor in inactive group (recreate inputs that got disposed)
            input = createTestFileEditorInput(uri_1.URI.parse('my://resource-active'), TEST_EDITOR_INPUT_ID);
            otherInput = createTestFileEditorInput(uri_1.URI.parse('my://resource2-active'), TEST_EDITOR_INPUT_ID);
            editor = await service.openEditor(input, { pinned: true });
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            rightGroup = part.addGroup(part.activeGroup, 3 /* GroupDirection.RIGHT */);
            assertActiveEditorChangedEvent(false);
            assertVisibleEditorsChangedEvent(false);
            await rightGroup.openEditor(otherInput);
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            await closeEditorAndWaitForNextToOpen(group, input);
            assertActiveEditorChangedEvent(false);
            assertVisibleEditorsChangedEvent(true);
            // cleanup
            activeEditorChangeListener.dispose();
            visibleEditorChangeListener.dispose();
        });
        test('editors change event', async function () {
            const [part, service] = await createEditorService();
            const rootGroup = part.activeGroup;
            let input = createTestFileEditorInput(uri_1.URI.parse('my://resource-active'), TEST_EDITOR_INPUT_ID);
            let otherInput = createTestFileEditorInput(uri_1.URI.parse('my://resource2-active'), TEST_EDITOR_INPUT_ID);
            let editorsChangeEventCounter = 0;
            async function assertEditorsChangeEvent(fn, expected) {
                const p = event_1.Event.toPromise(service.onDidEditorsChange);
                await fn();
                await p;
                editorsChangeEventCounter++;
                assert.strictEqual(editorsChangeEventCounter, expected);
            }
            // open
            await assertEditorsChangeEvent(() => service.openEditor(input, { pinned: true }), 1);
            // open (other)
            await assertEditorsChangeEvent(() => service.openEditor(otherInput, { pinned: true }), 2);
            // close (inactive)
            await assertEditorsChangeEvent(() => rootGroup.closeEditor(input), 3);
            // close (active)
            await assertEditorsChangeEvent(() => rootGroup.closeEditor(otherInput), 4);
            input = createTestFileEditorInput(uri_1.URI.parse('my://resource-active'), TEST_EDITOR_INPUT_ID);
            otherInput = createTestFileEditorInput(uri_1.URI.parse('my://resource2-active'), TEST_EDITOR_INPUT_ID);
            // open editors
            await assertEditorsChangeEvent(() => service.openEditors([{ editor: input, options: { pinned: true } }, { editor: otherInput, options: { pinned: true } }]), 5);
            // active editor change
            await assertEditorsChangeEvent(() => service.openEditor(otherInput), 6);
            // move editor (in group)
            await assertEditorsChangeEvent(() => service.openEditor(input, { pinned: true, index: 1 }), 7);
            const rightGroup = part.addGroup(part.activeGroup, 3 /* GroupDirection.RIGHT */);
            await assertEditorsChangeEvent(async () => rootGroup.moveEditor(input, rightGroup), 8);
            // move group
            await assertEditorsChangeEvent(async () => part.moveGroup(rightGroup, rootGroup, 2 /* GroupDirection.LEFT */), 9);
        });
        test('two active editor change events when opening editor to the side', async function () {
            const [, service] = await createEditorService();
            const input = createTestFileEditorInput(uri_1.URI.parse('my://resource-active'), TEST_EDITOR_INPUT_ID);
            let activeEditorChangeEvents = 0;
            const activeEditorChangeListener = service.onDidActiveEditorChange(() => {
                activeEditorChangeEvents++;
            });
            function assertActiveEditorChangedEvent(expected) {
                assert.strictEqual(activeEditorChangeEvents, expected, `Unexpected active editor change state (got ${activeEditorChangeEvents}, expected ${expected})`);
                activeEditorChangeEvents = 0;
            }
            await service.openEditor(input, { pinned: true });
            assertActiveEditorChangedEvent(1);
            await service.openEditor(input, { pinned: true }, editorService_2.SIDE_GROUP);
            // we expect 2 active editor change events: one for the fact that the
            // active editor is now in the side group but also one for when the
            // editor has finished loading. we used to ignore that second change
            // event, however many listeners are interested on the active editor
            // when it has fully loaded (e.g. a model is set). as such, we cannot
            // simply ignore that second event from the editor service, even though
            // the actual editor input is the same
            assertActiveEditorChangedEvent(2);
            // cleanup
            activeEditorChangeListener.dispose();
        });
        test('activeTextEditorControl / activeTextEditorMode', async () => {
            const [, service] = await createEditorService();
            // Open untitled input
            const editor = await service.openEditor({ resource: undefined });
            assert.strictEqual(service.activeEditorPane, editor);
            assert.strictEqual(service.activeTextEditorControl, editor?.getControl());
            assert.strictEqual(service.activeTextEditorLanguageId, modesRegistry_1.PLAINTEXT_LANGUAGE_ID);
        });
        test('openEditor returns undefined when inactive', async function () {
            const [, service] = await createEditorService();
            const input = createTestFileEditorInput(uri_1.URI.parse('my://resource-active'), TEST_EDITOR_INPUT_ID);
            const otherInput = createTestFileEditorInput(uri_1.URI.parse('my://resource2-inactive'), TEST_EDITOR_INPUT_ID);
            const editor = await service.openEditor(input, { pinned: true });
            assert.ok(editor);
            const otherEditor = await service.openEditor(otherInput, { inactive: true });
            assert.ok(!otherEditor);
        });
        test('openEditor shows placeholder when opening fails', async function () {
            const [, service] = await createEditorService();
            const failingInput = createTestFileEditorInput(uri_1.URI.parse('my://resource-failing'), TEST_EDITOR_INPUT_ID);
            failingInput.setFailToOpen();
            const failingEditor = await service.openEditor(failingInput);
            assert.ok(failingEditor instanceof editorPlaceholder_1.ErrorPlaceholderEditor);
        });
        test('openEditor shows placeholder when restoring fails', async function () {
            const [, service] = await createEditorService();
            const input = createTestFileEditorInput(uri_1.URI.parse('my://resource-active'), TEST_EDITOR_INPUT_ID);
            const failingInput = createTestFileEditorInput(uri_1.URI.parse('my://resource-failing'), TEST_EDITOR_INPUT_ID);
            await service.openEditor(input, { pinned: true });
            await service.openEditor(failingInput, { inactive: true });
            failingInput.setFailToOpen();
            const failingEditor = await service.openEditor(failingInput);
            assert.ok(failingEditor instanceof editorPlaceholder_1.ErrorPlaceholderEditor);
        });
        test('save, saveAll, revertAll', async function () {
            const [part, service] = await createEditorService();
            const input1 = createTestFileEditorInput(uri_1.URI.parse('my://resource1'), TEST_EDITOR_INPUT_ID);
            input1.dirty = true;
            const input2 = createTestFileEditorInput(uri_1.URI.parse('my://resource2'), TEST_EDITOR_INPUT_ID);
            input2.dirty = true;
            const sameInput1 = createTestFileEditorInput(uri_1.URI.parse('my://resource1'), TEST_EDITOR_INPUT_ID);
            sameInput1.dirty = true;
            const rootGroup = part.activeGroup;
            await service.openEditor(input1, { pinned: true });
            await service.openEditor(input2, { pinned: true });
            await service.openEditor(sameInput1, { pinned: true }, editorService_2.SIDE_GROUP);
            const res1 = await service.save({ groupId: rootGroup.id, editor: input1 });
            assert.strictEqual(res1.success, true);
            assert.strictEqual(res1.editors[0], input1);
            assert.strictEqual(input1.gotSaved, true);
            input1.gotSaved = false;
            input1.gotSavedAs = false;
            input1.gotReverted = false;
            input1.dirty = true;
            input2.dirty = true;
            sameInput1.dirty = true;
            const res2 = await service.save({ groupId: rootGroup.id, editor: input1 }, { saveAs: true });
            assert.strictEqual(res2.success, true);
            assert.strictEqual(res2.editors[0], input1);
            assert.strictEqual(input1.gotSavedAs, true);
            input1.gotSaved = false;
            input1.gotSavedAs = false;
            input1.gotReverted = false;
            input1.dirty = true;
            input2.dirty = true;
            sameInput1.dirty = true;
            const revertRes = await service.revertAll();
            assert.strictEqual(revertRes, true);
            assert.strictEqual(input1.gotReverted, true);
            input1.gotSaved = false;
            input1.gotSavedAs = false;
            input1.gotReverted = false;
            input1.dirty = true;
            input2.dirty = true;
            sameInput1.dirty = true;
            const res3 = await service.saveAll();
            assert.strictEqual(res3.success, true);
            assert.strictEqual(res3.editors.length, 2);
            assert.strictEqual(input1.gotSaved, true);
            assert.strictEqual(input2.gotSaved, true);
            input1.gotSaved = false;
            input1.gotSavedAs = false;
            input1.gotReverted = false;
            input2.gotSaved = false;
            input2.gotSavedAs = false;
            input2.gotReverted = false;
            input1.dirty = true;
            input2.dirty = true;
            sameInput1.dirty = true;
            await service.saveAll({ saveAs: true });
            assert.strictEqual(input1.gotSavedAs, true);
            assert.strictEqual(input2.gotSavedAs, true);
            // services dedupes inputs automatically
            assert.strictEqual(sameInput1.gotSaved, false);
            assert.strictEqual(sameInput1.gotSavedAs, false);
            assert.strictEqual(sameInput1.gotReverted, false);
        });
        test('saveAll, revertAll (sticky editor)', async function () {
            const [, service] = await createEditorService();
            const input1 = createTestFileEditorInput(uri_1.URI.parse('my://resource1'), TEST_EDITOR_INPUT_ID);
            input1.dirty = true;
            const input2 = createTestFileEditorInput(uri_1.URI.parse('my://resource2'), TEST_EDITOR_INPUT_ID);
            input2.dirty = true;
            const sameInput1 = createTestFileEditorInput(uri_1.URI.parse('my://resource1'), TEST_EDITOR_INPUT_ID);
            sameInput1.dirty = true;
            await service.openEditor(input1, { pinned: true, sticky: true });
            await service.openEditor(input2, { pinned: true });
            await service.openEditor(sameInput1, { pinned: true }, editorService_2.SIDE_GROUP);
            const revertRes = await service.revertAll({ excludeSticky: true });
            assert.strictEqual(revertRes, true);
            assert.strictEqual(input1.gotReverted, false);
            assert.strictEqual(sameInput1.gotReverted, true);
            input1.gotSaved = false;
            input1.gotSavedAs = false;
            input1.gotReverted = false;
            sameInput1.gotSaved = false;
            sameInput1.gotSavedAs = false;
            sameInput1.gotReverted = false;
            input1.dirty = true;
            input2.dirty = true;
            sameInput1.dirty = true;
            const saveRes = await service.saveAll({ excludeSticky: true });
            assert.strictEqual(saveRes.success, true);
            assert.strictEqual(saveRes.editors.length, 2);
            assert.strictEqual(input1.gotSaved, false);
            assert.strictEqual(input2.gotSaved, true);
            assert.strictEqual(sameInput1.gotSaved, true);
        });
        test('saveAll, revertAll untitled (exclude untitled)', async function () {
            await testSaveRevertUntitled({}, false, false);
            await testSaveRevertUntitled({ includeUntitled: false }, false, false);
        });
        test('saveAll, revertAll untitled (include untitled)', async function () {
            await testSaveRevertUntitled({ includeUntitled: true }, true, false);
            await testSaveRevertUntitled({ includeUntitled: { includeScratchpad: false } }, true, false);
        });
        test('saveAll, revertAll untitled (include scratchpad)', async function () {
            await testSaveRevertUntitled({ includeUntitled: { includeScratchpad: true } }, true, true);
        });
        async function testSaveRevertUntitled(options, expectUntitled, expectScratchpad) {
            const [, service] = await createEditorService();
            const input1 = createTestFileEditorInput(uri_1.URI.parse('my://resource1'), TEST_EDITOR_INPUT_ID);
            input1.dirty = true;
            const untitledInput = createTestFileEditorInput(uri_1.URI.parse('my://resource2'), TEST_EDITOR_INPUT_ID);
            untitledInput.dirty = true;
            untitledInput.capabilities = 4 /* EditorInputCapabilities.Untitled */;
            const scratchpadInput = createTestFileEditorInput(uri_1.URI.parse('my://resource3'), TEST_EDITOR_INPUT_ID);
            scratchpadInput.modified = true;
            scratchpadInput.capabilities = 512 /* EditorInputCapabilities.Scratchpad */ | 4 /* EditorInputCapabilities.Untitled */;
            await service.openEditor(input1, { pinned: true, sticky: true });
            await service.openEditor(untitledInput, { pinned: true });
            await service.openEditor(scratchpadInput, { pinned: true });
            const revertRes = await service.revertAll(options);
            assert.strictEqual(revertRes, true);
            assert.strictEqual(input1.gotReverted, true);
            assert.strictEqual(untitledInput.gotReverted, expectUntitled);
            assert.strictEqual(scratchpadInput.gotReverted, expectScratchpad);
            input1.gotSaved = false;
            untitledInput.gotSavedAs = false;
            scratchpadInput.gotReverted = false;
            input1.gotSaved = false;
            untitledInput.gotSavedAs = false;
            scratchpadInput.gotReverted = false;
            input1.dirty = true;
            untitledInput.dirty = true;
            scratchpadInput.modified = true;
            const saveRes = await service.saveAll(options);
            assert.strictEqual(saveRes.success, true);
            assert.strictEqual(saveRes.editors.length, expectScratchpad ? 3 : expectUntitled ? 2 : 1);
            assert.strictEqual(input1.gotSaved, true);
            assert.strictEqual(untitledInput.gotSaved, expectUntitled);
            assert.strictEqual(scratchpadInput.gotSaved, expectScratchpad);
        }
        test('file delete closes editor', async function () {
            return testFileDeleteEditorClose(false);
        });
        test('file delete leaves dirty editors open', function () {
            return testFileDeleteEditorClose(true);
        });
        async function testFileDeleteEditorClose(dirty) {
            const [part, service, accessor] = await createEditorService();
            const input1 = createTestFileEditorInput(uri_1.URI.parse('my://resource1'), TEST_EDITOR_INPUT_ID);
            input1.dirty = dirty;
            const input2 = createTestFileEditorInput(uri_1.URI.parse('my://resource2'), TEST_EDITOR_INPUT_ID);
            input2.dirty = dirty;
            const rootGroup = part.activeGroup;
            await service.openEditor(input1, { pinned: true });
            await service.openEditor(input2, { pinned: true });
            assert.strictEqual(rootGroup.activeEditor, input2);
            const activeEditorChangePromise = awaitActiveEditorChange(service);
            accessor.fileService.fireAfterOperation(new files_1.FileOperationEvent(input2.resource, 1 /* FileOperation.DELETE */));
            if (!dirty) {
                await activeEditorChangePromise;
            }
            if (dirty) {
                assert.strictEqual(rootGroup.activeEditor, input2);
            }
            else {
                assert.strictEqual(rootGroup.activeEditor, input1);
            }
        }
        test('file move asks input to move', async function () {
            const [part, service, accessor] = await createEditorService();
            const input1 = createTestFileEditorInput(uri_1.URI.parse('my://resource1'), TEST_EDITOR_INPUT_ID);
            const movedInput = createTestFileEditorInput(uri_1.URI.parse('my://resource2'), TEST_EDITOR_INPUT_ID);
            input1.movedEditor = { editor: movedInput };
            const rootGroup = part.activeGroup;
            await service.openEditor(input1, { pinned: true });
            const activeEditorChangePromise = awaitActiveEditorChange(service);
            accessor.fileService.fireAfterOperation(new files_1.FileOperationEvent(input1.resource, 2 /* FileOperation.MOVE */, {
                resource: movedInput.resource,
                ctime: 0,
                etag: '',
                isDirectory: false,
                isFile: true,
                mtime: 0,
                name: 'resource2',
                size: 0,
                isSymbolicLink: false,
                readonly: false,
                locked: false,
                children: undefined
            }));
            await activeEditorChangePromise;
            assert.strictEqual(rootGroup.activeEditor, movedInput);
        });
        function awaitActiveEditorChange(editorService) {
            return event_1.Event.toPromise(event_1.Event.once(editorService.onDidActiveEditorChange));
        }
        test('file watcher gets installed for out of workspace files', async function () {
            const [, service, accessor] = await createEditorService();
            const input1 = createTestFileEditorInput(uri_1.URI.parse('file://resource1'), TEST_EDITOR_INPUT_ID);
            const input2 = createTestFileEditorInput(uri_1.URI.parse('file://resource2'), TEST_EDITOR_INPUT_ID);
            await service.openEditor(input1, { pinned: true });
            assert.strictEqual(accessor.fileService.watches.length, 1);
            assert.strictEqual(accessor.fileService.watches[0].toString(), input1.resource.toString());
            const editor = await service.openEditor(input2, { pinned: true });
            assert.strictEqual(accessor.fileService.watches.length, 1);
            assert.strictEqual(accessor.fileService.watches[0].toString(), input2.resource.toString());
            await editor?.group?.closeAllEditors();
            assert.strictEqual(accessor.fileService.watches.length, 0);
        });
        test('activeEditorPane scopedContextKeyService', async function () {
            const instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)({ contextKeyService: instantiationService => instantiationService.createInstance(mockKeybindingService_1.MockScopableContextKeyService) }, disposables);
            const [part, service] = await createEditorService(instantiationService);
            const input1 = createTestFileEditorInput(uri_1.URI.parse('file://resource1'), TEST_EDITOR_INPUT_ID);
            createTestFileEditorInput(uri_1.URI.parse('file://resource2'), TEST_EDITOR_INPUT_ID);
            await service.openEditor(input1, { pinned: true });
            const editorContextKeyService = service.activeEditorPane?.scopedContextKeyService;
            assert.ok(!!editorContextKeyService);
            assert.strictEqual(editorContextKeyService, part.activeGroup.activeEditorPane?.scopedContextKeyService);
        });
        test('editorResolverService - openEditor', async function () {
            const [, service, accessor] = await createEditorService();
            const editorResolverService = accessor.editorResolverService;
            const textEditorService = accessor.textEditorService;
            let editorCount = 0;
            const registrationDisposable = editorResolverService.registerEditor('*.md', {
                id: 'TestEditor',
                label: 'Test Editor',
                detail: 'Test Editor Provider',
                priority: editorResolverService_1.RegisteredEditorPriority.builtin
            }, {}, {
                createEditorInput: (editorInput) => {
                    editorCount++;
                    return ({ editor: textEditorService.createTextEditor(editorInput) });
                },
                createDiffEditorInput: diffEditor => ({ editor: textEditorService.createTextEditor(diffEditor) })
            });
            assert.strictEqual(editorCount, 0);
            const input1 = { resource: uri_1.URI.parse('file://test/path/resource1.txt') };
            const input2 = { resource: uri_1.URI.parse('file://test/path/resource1.md') };
            // Open editor input 1 and it shouln't trigger override as the glob doesn't match
            await service.openEditor(input1);
            assert.strictEqual(editorCount, 0);
            // Open editor input 2 and it should trigger override as the glob doesn match
            await service.openEditor(input2);
            assert.strictEqual(editorCount, 1);
            // Because we specify an override we shouldn't see it triggered even if it matches
            await service.openEditor({ ...input2, options: { override: 'default' } });
            assert.strictEqual(editorCount, 1);
            registrationDisposable.dispose();
        });
        test('editorResolverService - openEditors', async function () {
            const [, service, accessor] = await createEditorService();
            const editorResolverService = accessor.editorResolverService;
            const textEditorService = accessor.textEditorService;
            let editorCount = 0;
            const registrationDisposable = editorResolverService.registerEditor('*.md', {
                id: 'TestEditor',
                label: 'Test Editor',
                detail: 'Test Editor Provider',
                priority: editorResolverService_1.RegisteredEditorPriority.builtin
            }, {}, {
                createEditorInput: (editorInput) => {
                    editorCount++;
                    return ({ editor: textEditorService.createTextEditor(editorInput) });
                },
                createDiffEditorInput: diffEditor => ({ editor: textEditorService.createTextEditor(diffEditor) })
            });
            assert.strictEqual(editorCount, 0);
            const input1 = createTestFileEditorInput(uri_1.URI.parse('file://test/path/resource1.txt'), TEST_EDITOR_INPUT_ID).toUntyped();
            const input2 = createTestFileEditorInput(uri_1.URI.parse('file://test/path/resource2.txt'), TEST_EDITOR_INPUT_ID).toUntyped();
            const input3 = createTestFileEditorInput(uri_1.URI.parse('file://test/path/resource3.md'), TEST_EDITOR_INPUT_ID).toUntyped();
            const input4 = createTestFileEditorInput(uri_1.URI.parse('file://test/path/resource4.md'), TEST_EDITOR_INPUT_ID).toUntyped();
            assert.ok(input1);
            assert.ok(input2);
            assert.ok(input3);
            assert.ok(input4);
            // Open editor inputs
            await service.openEditors([input1, input2, input3, input4]);
            // Only two matched the factory glob
            assert.strictEqual(editorCount, 2);
            registrationDisposable.dispose();
        });
        test('editorResolverService - replaceEditors', async function () {
            const [part, service, accessor] = await createEditorService();
            const editorResolverService = accessor.editorResolverService;
            const textEditorService = accessor.textEditorService;
            let editorCount = 0;
            const registrationDisposable = editorResolverService.registerEditor('*.md', {
                id: 'TestEditor',
                label: 'Test Editor',
                detail: 'Test Editor Provider',
                priority: editorResolverService_1.RegisteredEditorPriority.builtin
            }, {}, {
                createEditorInput: (editorInput) => {
                    editorCount++;
                    return ({ editor: textEditorService.createTextEditor(editorInput) });
                },
                createDiffEditorInput: diffEditor => ({ editor: textEditorService.createTextEditor(diffEditor) })
            });
            assert.strictEqual(editorCount, 0);
            const input1 = createTestFileEditorInput(uri_1.URI.parse('file://test/path/resource2.md'), TEST_EDITOR_INPUT_ID);
            const untypedInput1 = input1.toUntyped();
            assert.ok(untypedInput1);
            // Open editor input 1 and it shouldn't trigger because typed inputs aren't overriden
            await service.openEditor(input1);
            assert.strictEqual(editorCount, 0);
            await service.replaceEditors([{
                    editor: input1,
                    replacement: untypedInput1,
                }], part.activeGroup);
            assert.strictEqual(editorCount, 1);
            registrationDisposable.dispose();
        });
        test('closeEditor', async () => {
            const [part, service] = await createEditorService();
            const input = createTestFileEditorInput(uri_1.URI.parse('my://resource-openEditors'), TEST_EDITOR_INPUT_ID);
            const otherInput = createTestFileEditorInput(uri_1.URI.parse('my://resource2-openEditors'), TEST_EDITOR_INPUT_ID);
            // Open editors
            await service.openEditors([{ editor: input }, { editor: otherInput }]);
            assert.strictEqual(part.activeGroup.count, 2);
            // Close editor
            await service.closeEditor({ editor: input, groupId: part.activeGroup.id });
            assert.strictEqual(part.activeGroup.count, 1);
            await service.closeEditor({ editor: input, groupId: part.activeGroup.id });
            assert.strictEqual(part.activeGroup.count, 1);
            await service.closeEditor({ editor: otherInput, groupId: part.activeGroup.id });
            assert.strictEqual(part.activeGroup.count, 0);
            await service.closeEditor({ editor: otherInput, groupId: 999 });
            assert.strictEqual(part.activeGroup.count, 0);
        });
        test('closeEditors', async () => {
            const [part, service] = await createEditorService();
            const input = createTestFileEditorInput(uri_1.URI.parse('my://resource-openEditors'), TEST_EDITOR_INPUT_ID);
            const otherInput = createTestFileEditorInput(uri_1.URI.parse('my://resource2-openEditors'), TEST_EDITOR_INPUT_ID);
            // Open editors
            await service.openEditors([{ editor: input }, { editor: otherInput }]);
            assert.strictEqual(part.activeGroup.count, 2);
            // Close editors
            await service.closeEditors([{ editor: input, groupId: part.activeGroup.id }, { editor: otherInput, groupId: part.activeGroup.id }]);
            assert.strictEqual(part.activeGroup.count, 0);
        });
        test('findEditors (in group)', async () => {
            const [part, service] = await createEditorService();
            const input = createTestFileEditorInput(uri_1.URI.parse('my://resource-openEditors'), TEST_EDITOR_INPUT_ID);
            const otherInput = createTestFileEditorInput(uri_1.URI.parse('my://resource2-openEditors'), TEST_EDITOR_INPUT_ID);
            // Open editors
            await service.openEditors([{ editor: input }, { editor: otherInput }]);
            assert.strictEqual(part.activeGroup.count, 2);
            // Try using find editors for opened editors
            {
                const found1 = service.findEditors(input.resource, undefined, part.activeGroup);
                assert.strictEqual(found1.length, 1);
                assert.strictEqual(found1[0], input);
                const found2 = service.findEditors(input, undefined, part.activeGroup);
                assert.strictEqual(found2, input);
            }
            {
                const found1 = service.findEditors(otherInput.resource, undefined, part.activeGroup);
                assert.strictEqual(found1.length, 1);
                assert.strictEqual(found1[0], otherInput);
                const found2 = service.findEditors(otherInput, undefined, part.activeGroup);
                assert.strictEqual(found2, otherInput);
            }
            // Make sure we don't find non-opened editors
            {
                const found1 = service.findEditors(uri_1.URI.parse('my://no-such-resource'), undefined, part.activeGroup);
                assert.strictEqual(found1.length, 0);
                const found2 = service.findEditors({ resource: uri_1.URI.parse('my://no-such-resource'), typeId: '', editorId: TEST_EDITOR_INPUT_ID }, undefined, part.activeGroup);
                assert.strictEqual(found2, undefined);
            }
            // Make sure we don't find editors across groups
            {
                const newEditor = await service.openEditor(createTestFileEditorInput(uri_1.URI.parse('my://other-group-resource'), TEST_EDITOR_INPUT_ID), { pinned: true, preserveFocus: true }, editorService_2.SIDE_GROUP);
                const found1 = service.findEditors(input.resource, undefined, newEditor.group.id);
                assert.strictEqual(found1.length, 0);
                const found2 = service.findEditors(input, undefined, newEditor.group.id);
                assert.strictEqual(found2, undefined);
            }
            // Check we don't find editors after closing them
            await part.activeGroup.closeAllEditors();
            {
                const found1 = service.findEditors(input.resource, undefined, part.activeGroup);
                assert.strictEqual(found1.length, 0);
                const found2 = service.findEditors(input, undefined, part.activeGroup);
                assert.strictEqual(found2, undefined);
            }
        });
        test('findEditors (across groups)', async () => {
            const [part, service] = await createEditorService();
            const rootGroup = part.activeGroup;
            const input = createTestFileEditorInput(uri_1.URI.parse('my://resource-openEditors'), TEST_EDITOR_INPUT_ID);
            const otherInput = createTestFileEditorInput(uri_1.URI.parse('my://resource2-openEditors'), TEST_EDITOR_INPUT_ID);
            // Open editors
            await service.openEditors([{ editor: input }, { editor: otherInput }]);
            const sideEditor = await service.openEditor(input, { pinned: true }, editorService_2.SIDE_GROUP);
            // Try using find editors for opened editors
            {
                const found1 = service.findEditors(input.resource);
                assert.strictEqual(found1.length, 2);
                assert.strictEqual(found1[0].editor, input);
                assert.strictEqual(found1[0].groupId, sideEditor?.group?.id);
                assert.strictEqual(found1[1].editor, input);
                assert.strictEqual(found1[1].groupId, rootGroup.id);
                const found2 = service.findEditors(input);
                assert.strictEqual(found2.length, 2);
                assert.strictEqual(found2[0].editor, input);
                assert.strictEqual(found2[0].groupId, sideEditor?.group?.id);
                assert.strictEqual(found2[1].editor, input);
                assert.strictEqual(found2[1].groupId, rootGroup.id);
            }
            {
                const found1 = service.findEditors(otherInput.resource);
                assert.strictEqual(found1.length, 1);
                assert.strictEqual(found1[0].editor, otherInput);
                assert.strictEqual(found1[0].groupId, rootGroup.id);
                const found2 = service.findEditors(otherInput);
                assert.strictEqual(found2.length, 1);
                assert.strictEqual(found2[0].editor, otherInput);
                assert.strictEqual(found2[0].groupId, rootGroup.id);
            }
            // Make sure we don't find non-opened editors
            {
                const found1 = service.findEditors(uri_1.URI.parse('my://no-such-resource'));
                assert.strictEqual(found1.length, 0);
                const found2 = service.findEditors({ resource: uri_1.URI.parse('my://no-such-resource'), typeId: '', editorId: TEST_EDITOR_INPUT_ID });
                assert.strictEqual(found2.length, 0);
            }
            // Check we don't find editors after closing them
            await rootGroup.closeAllEditors();
            await sideEditor?.group?.closeAllEditors();
            {
                const found1 = service.findEditors(input.resource);
                assert.strictEqual(found1.length, 0);
                const found2 = service.findEditors(input);
                assert.strictEqual(found2.length, 0);
            }
        });
        test('findEditors (support side by side via options)', async () => {
            const [, service] = await createEditorService();
            const secondaryInput = createTestFileEditorInput(uri_1.URI.parse('my://resource-findEditors-secondary'), TEST_EDITOR_INPUT_ID);
            const primaryInput = createTestFileEditorInput(uri_1.URI.parse('my://resource-findEditors-primary'), TEST_EDITOR_INPUT_ID);
            const sideBySideInput = new sideBySideEditorInput_1.SideBySideEditorInput(undefined, undefined, secondaryInput, primaryInput, service);
            await service.openEditor(sideBySideInput, { pinned: true });
            let foundEditors = service.findEditors(uri_1.URI.parse('my://resource-findEditors-primary'));
            assert.strictEqual(foundEditors.length, 0);
            foundEditors = service.findEditors(uri_1.URI.parse('my://resource-findEditors-primary'), { supportSideBySide: editor_2.SideBySideEditor.PRIMARY });
            assert.strictEqual(foundEditors.length, 1);
            foundEditors = service.findEditors(uri_1.URI.parse('my://resource-findEditors-secondary'), { supportSideBySide: editor_2.SideBySideEditor.PRIMARY });
            assert.strictEqual(foundEditors.length, 0);
            foundEditors = service.findEditors(uri_1.URI.parse('my://resource-findEditors-primary'), { supportSideBySide: editor_2.SideBySideEditor.SECONDARY });
            assert.strictEqual(foundEditors.length, 0);
            foundEditors = service.findEditors(uri_1.URI.parse('my://resource-findEditors-secondary'), { supportSideBySide: editor_2.SideBySideEditor.SECONDARY });
            assert.strictEqual(foundEditors.length, 1);
            foundEditors = service.findEditors(uri_1.URI.parse('my://resource-findEditors-primary'), { supportSideBySide: editor_2.SideBySideEditor.ANY });
            assert.strictEqual(foundEditors.length, 1);
            foundEditors = service.findEditors(uri_1.URI.parse('my://resource-findEditors-secondary'), { supportSideBySide: editor_2.SideBySideEditor.ANY });
            assert.strictEqual(foundEditors.length, 1);
        });
        test('side by side editor is not matching all other editors (https://github.com/microsoft/vscode/issues/132859)', async () => {
            const [part, service] = await createEditorService();
            const rootGroup = part.activeGroup;
            const input = createTestFileEditorInput(uri_1.URI.parse('my://resource-openEditors'), TEST_EDITOR_INPUT_ID);
            const otherInput = createTestFileEditorInput(uri_1.URI.parse('my://resource2-openEditors'), TEST_EDITOR_INPUT_ID);
            const sideBySideInput = new sideBySideEditorInput_1.SideBySideEditorInput(undefined, undefined, input, input, service);
            const otherSideBySideInput = new sideBySideEditorInput_1.SideBySideEditorInput(undefined, undefined, otherInput, otherInput, service);
            await service.openEditor(sideBySideInput, undefined, editorService_2.SIDE_GROUP);
            part.activateGroup(rootGroup);
            await service.openEditor(otherSideBySideInput, { revealIfOpened: true, revealIfVisible: true });
            assert.strictEqual(rootGroup.count, 1);
        });
        test('onDidCloseEditor indicates proper context when moving editor across groups', async () => {
            const [part, service] = await createEditorService();
            const rootGroup = part.activeGroup;
            const input1 = createTestFileEditorInput(uri_1.URI.parse('my://resource-onDidCloseEditor1'), TEST_EDITOR_INPUT_ID);
            const input2 = createTestFileEditorInput(uri_1.URI.parse('my://resource-onDidCloseEditor2'), TEST_EDITOR_INPUT_ID);
            await service.openEditor(input1, { pinned: true });
            await service.openEditor(input2, { pinned: true });
            const sidegroup = part.addGroup(rootGroup, 3 /* GroupDirection.RIGHT */);
            const events = [];
            disposables.add(service.onDidCloseEditor(e => {
                events.push(e);
            }));
            rootGroup.moveEditor(input1, sidegroup);
            assert.strictEqual(events[0].context, editor_2.EditorCloseContext.MOVE);
            await sidegroup.closeEditor(input1);
            assert.strictEqual(events[1].context, editor_2.EditorCloseContext.UNKNOWN);
        });
        test('onDidCloseEditor indicates proper context when replacing an editor', async () => {
            const [part, service] = await createEditorService();
            const rootGroup = part.activeGroup;
            const input1 = createTestFileEditorInput(uri_1.URI.parse('my://resource-onDidCloseEditor1'), TEST_EDITOR_INPUT_ID);
            const input2 = createTestFileEditorInput(uri_1.URI.parse('my://resource-onDidCloseEditor2'), TEST_EDITOR_INPUT_ID);
            await service.openEditor(input1, { pinned: true });
            const events = [];
            disposables.add(service.onDidCloseEditor(e => {
                events.push(e);
            }));
            await rootGroup.replaceEditors([{ editor: input1, replacement: input2 }]);
            assert.strictEqual(events[0].context, editor_2.EditorCloseContext.REPLACE);
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yU2VydmljZS50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2VkaXRvci90ZXN0L2Jyb3dzZXIvZWRpdG9yU2VydmljZS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBNEJoRyxLQUFLLENBQUMsZUFBZSxFQUFFLEdBQUcsRUFBRTtRQUUzQixNQUFNLGNBQWMsR0FBRyw4QkFBOEIsQ0FBQztRQUN0RCxNQUFNLG9CQUFvQixHQUFHLGlDQUFpQyxDQUFDO1FBRS9ELE1BQU0sV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1FBRTFDLElBQUksNkJBQTZCLEdBQTBDLFNBQVMsQ0FBQztRQUVyRixLQUFLLENBQUMsR0FBRyxFQUFFO1lBQ1YsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFBLDBDQUFrQixFQUFDLGNBQWMsRUFBRSxDQUFDLElBQUksNEJBQWMsQ0FBQywyQ0FBbUIsQ0FBQyxFQUFFLElBQUksNEJBQWMsQ0FBQyxvREFBNEIsQ0FBQyxDQUFDLEVBQUUsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO1lBQ3ZLLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBQSxrREFBMEIsR0FBRSxDQUFDLENBQUM7WUFDOUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFBLG9EQUE0QixHQUFFLENBQUMsQ0FBQztRQUNqRCxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxLQUFLLElBQUksRUFBRTtZQUNuQixJQUFJLDZCQUE2QixFQUFFO2dCQUNsQyxNQUFNLElBQUEseUNBQWlCLEVBQUMsNkJBQTZCLENBQUMsQ0FBQztnQkFDdkQsNkJBQTZCLEdBQUcsU0FBUyxDQUFDO2FBQzFDO1lBRUQsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3JCLENBQUMsQ0FBQyxDQUFDO1FBRUgsS0FBSyxVQUFVLG1CQUFtQixD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TSxFQUFFLElBQUksRUFBRSxFQUFFLENBQUM7WUFFckosTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDL0MsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7WUFFL0MsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7WUFFdEQsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDaEQsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7WUFFaEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7WUFFdkQsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNyQixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXRCLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUVqQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN0RCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFFcEcsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRWpDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUUsVUFBVSxDQUFDLEVBQUUs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LFFBQVEsRUFBRSxLQUFLLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDckcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDckcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDckcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFFckcsNEJBQTRCO2dCQUM1QixRQUFRLENBQUMsNEJBQTRCLENBQUMsc0JBQXNCLEdBQUcsS0FBSyxFQUFDLElBQUksRUFBQyxFQUFFLGtEQUEwQyxDQUFDO2dCQUV2SCxNQUFNLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxlQUFlLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUNySSxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUU5QyxlQUFlO2dCQUNmLFFBQVEsQ0FBQyw0QkFBNEIsQ0FBQyxzQkFBc0IsR0FBRyxLQUFLLEVBQUMsSUFBSSxFQUFDLEVBQUUsdUNBQStCLENBQUM7Z0JBRTVHLE1BQU0sT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLGVBQWUsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQ3JJLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDOUM7b0JBQVM7Z0JBQ1QsUUFBUSxDQUFDLDRCQUE0QixDQUFDLHNCQUFzQixHQUFHLFVBQVUsQ0FBQzthQUMxRTtRQUNGLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHdEQUF3RCxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQ3pFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxHQUFHLE1BQU0sbUJBQW1CLEVBQUUsQ0FBQztZQUU5RCxNQUFNLE1BQU0sR0FBRyx5QkFBeUIsQ0FBQyxTQUFHLENBQUMsS0FBSyxDQUFDLDRCQUE0QixDQUFDLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQUN4RyxNQUFNLE1BQU0sR0FBRyx5QkFBeUIsQ0FBQyxTQUFHLENBQUMsS0FBSyxDQUFDLDRCQUE0QixDQUFDLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQUV4RyxNQUFNLE1BQU0sR0FBRyx5QkFBeUIsQ0FBQyxTQUFHLENBQUMsS0FBSyxDQUFDLDRCQUE0QixDQUFDLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQUN4RyxNQUFNLE1BQU0sR0FBRyx5QkFBeUIsQ0FBQyxTQUFHLENBQUMsS0FBSyxDQUFDLDRCQUE0QixDQUFDLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQUN4RyxNQUFNLGVBQWUsR0FBRyxJQUFJLDZDQUFxQixDQUFDLGNBQWMsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztZQUV0RyxNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsNEJBQTRCLENBQUMsc0JBQXNCLENBQUM7WUFFaEYsSUFBSTtnQkFFSCxnQkFBZ0I7Z0JBQ2hCLFFBQVEsQ0FBQyw0QkFBNEIsQ0FBQyxzQkFBc0IsR0FBRyxLQUFLLEVBQUMsSUFBSSxFQUFDLEVBQUUseUNBQWlDLENBQUM7Z0JBRTlHLE1BQU0sT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLGVBQWUsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDakcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQzthQUM5QztvQkFBUztnQkFDVCxRQUFRLENBQUMsNEJBQTRCLENBQUMsc0JBQXNCLEdBQUcsVUFBVSxDQUFDO2FBQzFFO1FBQ0YsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsa0ZBQWtGLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDbkcsTUFBTSxDQUFDLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxHQUFHLE1BQU0sbUJBQW1CLEVBQUUsQ0FBQztZQUUxRCxNQUFNLEtBQUssR0FBRyxFQUFFLFFBQVEsRUFBRSxTQUFHLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEVBQUUsQ0FBQztZQUM3RCxNQUFNLFVBQVUsR0FBNkI7Z0JBQzVDLFFBQVEsRUFBRSxFQUFFLFFBQVEsRUFBRSxTQUFHLENBQUMsS0FBSyxDQUFDLDRCQUE0QixDQUFDLEVBQUU7Z0JBQy9ELFFBQVEsRUFBRSxFQUFFLFFBQVEsRUFBRSxTQUFHLENBQUMsS0FBSyxDQUFDLDRCQUE0QixDQUFDLEVBQUU7YUFDL0QsQ0FBQztZQUVGLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyw0QkFBNEIsQ0FBQyxzQkFBc0IsQ0FBQztZQUVoRixJQUFJO2dCQUNILElBQUksZUFBZSxHQUFVLEVBQUUsQ0FBQztnQkFDaEMsUUFBUSxDQUFDLDRCQUE0QixDQUFDLHNCQUFzQixHQUFHLEtBQUssRUFBQyxJQUFJLEVBQUMsRUFBRTtvQkFDM0UsZUFBZSxHQUFHLElBQUksQ0FBQztvQkFDdkIsT0FBTyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3pCLENBQUMsQ0FBQztnQkFFRixNQUFNLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQ25GLE1BQU0sQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDOUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDcEcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLFVBQVUsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ25ILE1BQU0sQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsS0FBSyxVQUFVLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQ25IO29CQUFTO2dCQUNULFFBQVEsQ0FBQyw0QkFBNEIsQ0FBQyxzQkFBc0IsR0FBRyxVQUFVLENBQUM7YUFDMUU7UUFDRixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxpRUFBaUUsRUFBRSxLQUFLLElBQUksRUFBRTtZQUNsRixNQUFNLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxHQUFHLE1BQU0sbUJBQW1CLEVBQUUsQ0FBQztZQUVwRCxNQUFNLEtBQUssR0FBRyx5QkFBeUIsQ0FBQyxTQUFHLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQUVqRyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQ25DLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUywrQkFBdUIsQ0FBQztZQUVsRSxhQUFhO1lBQ2IsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ2xELE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFFOUQsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQztZQUNoQyxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdEMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDdEMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFdEMsY0FBYztZQUNkLE1BQU0sU0FBUyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNuQyxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUU5QyxNQUFNLFVBQVUsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDcEMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDOUMsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsa0JBQWtCLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDbkMsTUFBTSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsR0FBRyxNQUFNLG1CQUFtQixFQUFFLENBQUM7WUFFcEQsTUFBTSxNQUFNLEdBQUcseUJBQXlCLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFDckcsTUFBTSxNQUFNLEdBQUcseUJBQXlCLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFFckcsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUVuQyxNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQzlELElBQUksTUFBTSxHQUFHLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsRUFBRSwwQkFBVSxDQUFDLENBQUM7WUFFakcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ2hELE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsQyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRWxELE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNwRCxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFbkQsd0RBQXdEO1lBQ3hELE1BQU0sR0FBRyxNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLEVBQUUsMEJBQVUsQ0FBQyxDQUFDO1lBQzdGLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUNoRCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbEMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVsRCxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDcEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3BELENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHlCQUF5QixFQUFFLEtBQUssSUFBSSxFQUFFO1lBQzFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEdBQUcsTUFBTSxtQkFBbUIsRUFBRSxDQUFDO1lBRXBELE1BQU0sTUFBTSxHQUFHLHlCQUF5QixDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMseUJBQXlCLENBQUMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQ3JHLE1BQU0sTUFBTSxHQUFHLHlCQUF5QixDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMseUJBQXlCLENBQUMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBRXJHLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7WUFFbkMsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUM5RCxJQUFJLE1BQU0sR0FBRyxNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSx5QkFBZ0IsQ0FBQyxRQUFRLEVBQUUsRUFBRSwwQkFBVSxDQUFDLENBQUM7WUFDeEksTUFBTSxTQUFTLEdBQUcsTUFBTSxFQUFFLEtBQUssQ0FBQztZQUVoQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFFaEQsTUFBTSxHQUFHLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLHlCQUFnQixDQUFDLFFBQVEsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ25JLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUVoRCxNQUFNLEdBQUcsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUseUJBQWdCLENBQUMsUUFBUSxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDbkksTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBRWhELE1BQU0sR0FBRyxNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUseUJBQWdCLENBQUMsUUFBUSxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDOUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBRWhELE1BQU0sR0FBRyxNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUseUJBQWdCLENBQUMsUUFBUSxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDOUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBRWhELElBQUksQ0FBQyxhQUFhLG9DQUE0QixDQUFDO1lBQy9DLE1BQU0sR0FBRyxNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSx5QkFBZ0IsQ0FBQyxPQUFPLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUNsSSxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDakQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsdUVBQXVFLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDeEYsTUFBTSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsR0FBRyxNQUFNLG1CQUFtQixFQUFFLENBQUM7WUFFcEQsTUFBTSxNQUFNLEdBQUcseUJBQXlCLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFDckcsTUFBTSxNQUFNLEdBQUcseUJBQXlCLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFFckcsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUVuQyxNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQzlELE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFFOUQsTUFBTSxTQUFTLEdBQUcsQ0FBQyxNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLDBCQUFVLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQztZQUMxRixNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDaEQsTUFBTSxDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFFNUMsSUFBSSxDQUFDLGFBQWEscUNBQTZCLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUVqRSxNQUFNLFNBQVMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDcEMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBRWhELE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQzFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDakQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMscURBQXFELEVBQUUsS0FBSztZQUNoRSxNQUFNLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxHQUFHLE1BQU0sbUJBQW1CLEVBQUUsQ0FBQztZQUVwRCxJQUFJLEtBQUssR0FBRyx5QkFBeUIsQ0FBQyxTQUFHLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQUMvRixJQUFJLFVBQVUsR0FBRyx5QkFBeUIsQ0FBQyxTQUFHLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQUVyRyxJQUFJLDRCQUE0QixHQUFHLEtBQUssQ0FBQztZQUN6QyxNQUFNLDBCQUEwQixHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3ZFLDRCQUE0QixHQUFHLElBQUksQ0FBQztZQUNyQyxDQUFDLENBQUMsQ0FBQztZQUVILElBQUksNkJBQTZCLEdBQUcsS0FBSyxDQUFDO1lBQzFDLE1BQU0sMkJBQTJCLEdBQUcsT0FBTyxDQUFDLHlCQUF5QixDQUFDLEdBQUcsRUFBRTtnQkFDMUUsNkJBQTZCLEdBQUcsSUFBSSxDQUFDO1lBQ3RDLENBQUMsQ0FBQyxDQUFDO1lBRUgsU0FBUyw4QkFBOEIsQ0FBQyxRQUFpQjtnQkFDeEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyw0QkFBNEIsRUFBRSxRQUFRLEVBQUUsOENBQThDLDRCQUE0QixjQUFjLFFBQVEsR0FBRyxDQUFDLENBQUM7Z0JBQ2hLLDRCQUE0QixHQUFHLEtBQUssQ0FBQztZQUN0QyxDQUFDO1lBRUQsU0FBUyxnQ0FBZ0MsQ0FBQyxRQUFpQjtnQkFDMUQsTUFBTSxDQUFDLFdBQVcsQ0FBQyw2QkFBNkIsRUFBRSxRQUFRLEVBQUUsZ0RBQWdELDZCQUE2QixjQUFjLFFBQVEsR0FBRyxDQUFDLENBQUM7Z0JBQ3BLLDZCQUE2QixHQUFHLEtBQUssQ0FBQztZQUN2QyxDQUFDO1lBRUQsS0FBSyxVQUFVLCtCQUErQixDQUFDLEtBQW1CLEVBQUUsS0FBa0I7Z0JBQ3JGLE1BQU0sS0FBSyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDL0IsTUFBTSxJQUFBLGVBQU8sRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLCtFQUErRTtZQUNsRyxDQUFDO1lBRUQseUNBQXlDO1lBQ3pDLElBQUksTUFBTSxHQUFHLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUMvRCxNQUFNLEtBQUssR0FBRyxNQUFNLEVBQUUsS0FBTSxDQUFDO1lBQzdCLDhCQUE4QixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3JDLGdDQUFnQyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXZDLE1BQU0sR0FBRyxNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDekMsOEJBQThCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdEMsZ0NBQWdDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFeEMsTUFBTSxHQUFHLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUM5Qyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNyQyxnQ0FBZ0MsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUV2QyxNQUFNLCtCQUErQixDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztZQUN6RCw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNyQyxnQ0FBZ0MsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUV2QyxNQUFNLCtCQUErQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNwRCw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNyQyxnQ0FBZ0MsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUV2Qyx3RUFBd0U7WUFDeEUsS0FBSyxHQUFHLHlCQUF5QixDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsc0JBQXNCLENBQUMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQzNGLFVBQVUsR0FBRyx5QkFBeUIsQ0FBQyxTQUFHLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQUNqRyxNQUFNLEdBQUcsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3pDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3JDLGdDQUFnQyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXZDLE1BQU0sR0FBRyxNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFDaEUsOEJBQThCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdEMsZ0NBQWdDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFeEMsTUFBTSwrQkFBK0IsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFcEQscUVBQXFFO1lBQ3JFLEtBQUssR0FBRyx5QkFBeUIsQ0FBQyxTQUFHLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQUMzRixVQUFVLEdBQUcseUJBQXlCLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFDakcsTUFBTSxHQUFHLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUMzRCw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNyQyxnQ0FBZ0MsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUV2QyxNQUFNLEdBQUcsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ2xFLDhCQUE4QixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3RDLGdDQUFnQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRXhDLE1BQU0sS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQzlCLDhCQUE4QixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3JDLGdDQUFnQyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXZDLDhFQUE4RTtZQUM5RSxLQUFLLEdBQUcseUJBQXlCLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFDM0YsVUFBVSxHQUFHLHlCQUF5QixDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsdUJBQXVCLENBQUMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQ2pHLE1BQU0sR0FBRyxNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFDM0QsOEJBQThCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDckMsZ0NBQWdDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFdkMsTUFBTSxHQUFHLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUNsRSw4QkFBOEIsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN0QyxnQ0FBZ0MsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUV4QyxNQUFNLCtCQUErQixDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztZQUN6RCw4QkFBOEIsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN0QyxnQ0FBZ0MsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUV4QyxNQUFNLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUM5Qiw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNyQyxnQ0FBZ0MsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUV2QyxrRUFBa0U7WUFDbEUsS0FBSyxHQUFHLHlCQUF5QixDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsc0JBQXNCLENBQUMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQzNGLFVBQVUsR0FBRyx5QkFBeUIsQ0FBQyxTQUFHLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQUNqRyxNQUFNLEdBQUcsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQzNELDhCQUE4QixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3JDLGdDQUFnQyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXZDLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsK0JBQXVCLENBQUM7WUFDdkUsOEJBQThCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdEMsZ0NBQWdDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFeEMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ25CLDhCQUE4QixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3JDLGdDQUFnQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRXhDLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDN0IsOEJBQThCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDckMsZ0NBQWdDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFeEMsTUFBTSxLQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDOUIsOEJBQThCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDckMsZ0NBQWdDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFdkMsd0VBQXdFO1lBQ3hFLEtBQUssR0FBRyx5QkFBeUIsQ0FBQyxTQUFHLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQUMzRixVQUFVLEdBQUcseUJBQXlCLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFDakcsTUFBTSxHQUFHLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUMzRCw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNyQyxnQ0FBZ0MsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUV2QyxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVywrQkFBdUIsQ0FBQztZQUNuRSw4QkFBOEIsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN0QyxnQ0FBZ0MsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUV4QyxNQUFNLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDeEMsOEJBQThCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDckMsZ0NBQWdDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFdkMsTUFBTSwrQkFBK0IsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDOUQsOEJBQThCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDckMsZ0NBQWdDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFdkMsTUFBTSxLQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDOUIsOEJBQThCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDckMsZ0NBQWdDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFdkMseURBQXlEO1lBQ3pELEtBQUssR0FBRyx5QkFBeUIsQ0FBQyxTQUFHLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQUMzRixVQUFVLEdBQUcseUJBQXlCLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFDakcsTUFBTSxHQUFHLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUMzRCw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNyQyxnQ0FBZ0MsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUV2QyxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVywrQkFBdUIsQ0FBQztZQUNuRSw4QkFBOEIsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN0QyxnQ0FBZ0MsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUV4QyxNQUFNLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDeEMsOEJBQThCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDckMsZ0NBQWdDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFdkMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2QsOEJBQThCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDckMsZ0NBQWdDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFeEMsTUFBTSwrQkFBK0IsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDOUQsOEJBQThCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdEMsZ0NBQWdDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFdkMsTUFBTSxLQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDOUIsOEJBQThCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDckMsZ0NBQWdDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFdkMsc0RBQXNEO1lBQ3RELEtBQUssR0FBRyx5QkFBeUIsQ0FBQyxTQUFHLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQUMzRixVQUFVLEdBQUcseUJBQXlCLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFDakcsTUFBTSxHQUFHLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUMzRCw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNyQyxnQ0FBZ0MsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUV2QyxNQUFNLEdBQUcsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ2hFLDhCQUE4QixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3JDLGdDQUFnQyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXZDLEtBQUssQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2xELDhCQUE4QixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3RDLGdDQUFnQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRXhDLE1BQU0sS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQzlCLDhCQUE4QixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3JDLGdDQUFnQyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXZDLHlFQUF5RTtZQUN6RSxLQUFLLEdBQUcseUJBQXlCLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFDM0YsVUFBVSxHQUFHLHlCQUF5QixDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsdUJBQXVCLENBQUMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQ2pHLE1BQU0sR0FBRyxNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFDM0QsOEJBQThCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDckMsZ0NBQWdDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFdkMsVUFBVSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsK0JBQXVCLENBQUM7WUFDbkUsOEJBQThCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdEMsZ0NBQWdDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFeEMsTUFBTSxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3hDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3JDLGdDQUFnQyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXZDLE1BQU0sK0JBQStCLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3BELDhCQUE4QixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3RDLGdDQUFnQyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXZDLFVBQVU7WUFDViwwQkFBMEIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNyQywyQkFBMkIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN2QyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxzQkFBc0IsRUFBRSxLQUFLO1lBQ2pDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEdBQUcsTUFBTSxtQkFBbUIsRUFBRSxDQUFDO1lBQ3BELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7WUFFbkMsSUFBSSxLQUFLLEdBQUcseUJBQXlCLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFDL0YsSUFBSSxVQUFVLEdBQUcseUJBQXlCLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFFckcsSUFBSSx5QkFBeUIsR0FBRyxDQUFDLENBQUM7WUFDbEMsS0FBSyxVQUFVLHdCQUF3QixDQUFDLEVBQTBCLEVBQUUsUUFBZ0I7Z0JBQ25GLE1BQU0sQ0FBQyxHQUFHLGFBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7Z0JBQ3RELE1BQU0sRUFBRSxFQUFFLENBQUM7Z0JBQ1gsTUFBTSxDQUFDLENBQUM7Z0JBQ1IseUJBQXlCLEVBQUUsQ0FBQztnQkFFNUIsTUFBTSxDQUFDLFdBQVcsQ0FBQyx5QkFBeUIsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUN6RCxDQUFDO1lBRUQsT0FBTztZQUNQLE1BQU0sd0JBQXdCLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUVyRixlQUFlO1lBQ2YsTUFBTSx3QkFBd0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRTFGLG1CQUFtQjtZQUNuQixNQUFNLHdCQUF3QixDQUFDLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFdEUsaUJBQWlCO1lBQ2pCLE1BQU0sd0JBQXdCLENBQUMsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUUzRSxLQUFLLEdBQUcseUJBQXlCLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFDM0YsVUFBVSxHQUFHLHlCQUF5QixDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsdUJBQXVCLENBQUMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBRWpHLGVBQWU7WUFDZixNQUFNLHdCQUF3QixDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUVoSyx1QkFBdUI7WUFDdkIsTUFBTSx3QkFBd0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRXhFLHlCQUF5QjtZQUN6QixNQUFNLHdCQUF3QixDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUUvRixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLCtCQUF1QixDQUFDO1lBQ3pFLE1BQU0sd0JBQXdCLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUV2RixhQUFhO1lBQ2IsTUFBTSx3QkFBd0IsQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLFNBQVMsOEJBQXNCLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDM0csQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsaUVBQWlFLEVBQUUsS0FBSztZQUM1RSxNQUFNLENBQUMsRUFBRSxPQUFPLENBQUMsR0FBRyxNQUFNLG1CQUFtQixFQUFFLENBQUM7WUFFaEQsTUFBTSxLQUFLLEdBQUcseUJBQXlCLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFFakcsSUFBSSx3QkFBd0IsR0FBRyxDQUFDLENBQUM7WUFDakMsTUFBTSwwQkFBMEIsR0FBRyxPQUFPLENBQUMsdUJBQXVCLENBQUMsR0FBRyxFQUFFO2dCQUN2RSx3QkFBd0IsRUFBRSxDQUFDO1lBQzVCLENBQUMsQ0FBQyxDQUFDO1lBRUgsU0FBUyw4QkFBOEIsQ0FBQyxRQUFnQjtnQkFDdkQsTUFBTSxDQUFDLFdBQVcsQ0FBQyx3QkFBd0IsRUFBRSxRQUFRLEVBQUUsOENBQThDLHdCQUF3QixjQUFjLFFBQVEsR0FBRyxDQUFDLENBQUM7Z0JBQ3hKLHdCQUF3QixHQUFHLENBQUMsQ0FBQztZQUM5QixDQUFDO1lBRUQsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ2xELDhCQUE4QixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRWxDLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEVBQUUsMEJBQVUsQ0FBQyxDQUFDO1lBRTlELHFFQUFxRTtZQUNyRSxtRUFBbUU7WUFDbkUsb0VBQW9FO1lBQ3BFLG9FQUFvRTtZQUNwRSxxRUFBcUU7WUFDckUsdUVBQXVFO1lBQ3ZFLHNDQUFzQztZQUN0Qyw4QkFBOEIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVsQyxVQUFVO1lBQ1YsMEJBQTBCLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDdEMsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsZ0RBQWdELEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDakUsTUFBTSxDQUFDLEVBQUUsT0FBTyxDQUFDLEdBQUcsTUFBTSxtQkFBbUIsRUFBRSxDQUFDO1lBRWhELHNCQUFzQjtZQUN0QixNQUFNLE1BQU0sR0FBRyxNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQztZQUVqRSxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNyRCxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyx1QkFBdUIsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQztZQUMxRSxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQywwQkFBMEIsRUFBRSxxQ0FBcUIsQ0FBQyxDQUFDO1FBQy9FLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLDRDQUE0QyxFQUFFLEtBQUs7WUFDdkQsTUFBTSxDQUFDLEVBQUUsT0FBTyxDQUFDLEdBQUcsTUFBTSxtQkFBbUIsRUFBRSxDQUFDO1lBRWhELE1BQU0sS0FBSyxHQUFHLHlCQUF5QixDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsc0JBQXNCLENBQUMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQ2pHLE1BQU0sVUFBVSxHQUFHLHlCQUF5QixDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMseUJBQXlCLENBQUMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBRXpHLE1BQU0sTUFBTSxHQUFHLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUNqRSxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRWxCLE1BQU0sV0FBVyxHQUFHLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUM3RSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDekIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsaURBQWlELEVBQUUsS0FBSztZQUM1RCxNQUFNLENBQUMsRUFBRSxPQUFPLENBQUMsR0FBRyxNQUFNLG1CQUFtQixFQUFFLENBQUM7WUFFaEQsTUFBTSxZQUFZLEdBQUcseUJBQXlCLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFDekcsWUFBWSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBRTdCLE1BQU0sYUFBYSxHQUFHLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsRUFBRSxDQUFDLGFBQWEsWUFBWSwwQ0FBc0IsQ0FBQyxDQUFDO1FBQzVELENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLG1EQUFtRCxFQUFFLEtBQUs7WUFDOUQsTUFBTSxDQUFDLEVBQUUsT0FBTyxDQUFDLEdBQUcsTUFBTSxtQkFBbUIsRUFBRSxDQUFDO1lBRWhELE1BQU0sS0FBSyxHQUFHLHlCQUF5QixDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsc0JBQXNCLENBQUMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQ2pHLE1BQU0sWUFBWSxHQUFHLHlCQUF5QixDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsdUJBQXVCLENBQUMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBRXpHLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUNsRCxNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsWUFBWSxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFFM0QsWUFBWSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQzdCLE1BQU0sYUFBYSxHQUFHLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsRUFBRSxDQUFDLGFBQWEsWUFBWSwwQ0FBc0IsQ0FBQyxDQUFDO1FBQzVELENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLDBCQUEwQixFQUFFLEtBQUs7WUFDckMsTUFBTSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsR0FBRyxNQUFNLG1CQUFtQixFQUFFLENBQUM7WUFFcEQsTUFBTSxNQUFNLEdBQUcseUJBQXlCLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFDNUYsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDcEIsTUFBTSxNQUFNLEdBQUcseUJBQXlCLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFDNUYsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDcEIsTUFBTSxVQUFVLEdBQUcseUJBQXlCLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFDaEcsVUFBVSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7WUFFeEIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUVuQyxNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFDbkQsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ25ELE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEVBQUUsMEJBQVUsQ0FBQyxDQUFDO1lBRW5FLE1BQU0sSUFBSSxHQUFHLE1BQU0sT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUMsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQzNFLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN2QyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDNUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRTFDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1lBQ3hCLE1BQU0sQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1lBQzFCLE1BQU0sQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1lBRTNCLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQ3BCLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQ3BCLFVBQVUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBRXhCLE1BQU0sSUFBSSxHQUFHLE1BQU0sT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUMsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQzdGLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN2QyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDNUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRTVDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1lBQ3hCLE1BQU0sQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1lBQzFCLE1BQU0sQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1lBRTNCLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQ3BCLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQ3BCLFVBQVUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBRXhCLE1BQU0sU0FBUyxHQUFHLE1BQU0sT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQzVDLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUU3QyxNQUFNLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztZQUN4QixNQUFNLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztZQUMxQixNQUFNLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztZQUUzQixNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztZQUNwQixNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztZQUNwQixVQUFVLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztZQUV4QixNQUFNLElBQUksR0FBRyxNQUFNLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNyQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDdkMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMzQyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDMUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRTFDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1lBQ3hCLE1BQU0sQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1lBQzFCLE1BQU0sQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1lBQzNCLE1BQU0sQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1lBQ3hCLE1BQU0sQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1lBQzFCLE1BQU0sQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1lBRTNCLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQ3BCLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQ3BCLFVBQVUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBRXhCLE1BQU0sT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBRXhDLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM1QyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFNUMsd0NBQXdDO1lBQ3hDLE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUMvQyxNQUFNLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDakQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ25ELENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLG9DQUFvQyxFQUFFLEtBQUs7WUFDL0MsTUFBTSxDQUFDLEVBQUUsT0FBTyxDQUFDLEdBQUcsTUFBTSxtQkFBbUIsRUFBRSxDQUFDO1lBRWhELE1BQU0sTUFBTSxHQUFHLHlCQUF5QixDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQzVGLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQ3BCLE1BQU0sTUFBTSxHQUFHLHlCQUF5QixDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQzVGLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQ3BCLE1BQU0sVUFBVSxHQUFHLHlCQUF5QixDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQ2hHLFVBQVUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBRXhCLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ2pFLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUNuRCxNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLDBCQUFVLENBQUMsQ0FBQztZQUVuRSxNQUFNLFNBQVMsR0FBRyxNQUFNLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUNuRSxNQUFNLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNwQyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDOUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRWpELE1BQU0sQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1lBQ3hCLE1BQU0sQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1lBQzFCLE1BQU0sQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1lBRTNCLFVBQVUsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1lBQzVCLFVBQVUsQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1lBQzlCLFVBQVUsQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1lBRS9CLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQ3BCLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQ3BCLFVBQVUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBRXhCLE1BQU0sT0FBTyxHQUFHLE1BQU0sT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQy9ELE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMxQyxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzlDLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUMzQyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDMUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQy9DLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGdEQUFnRCxFQUFFLEtBQUs7WUFDM0QsTUFBTSxzQkFBc0IsQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQy9DLE1BQU0sc0JBQXNCLENBQUMsRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3hFLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGdEQUFnRCxFQUFFLEtBQUs7WUFDM0QsTUFBTSxzQkFBc0IsQ0FBQyxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDckUsTUFBTSxzQkFBc0IsQ0FBQyxFQUFFLGVBQWUsRUFBRSxFQUFFLGlCQUFpQixFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzlGLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGtEQUFrRCxFQUFFLEtBQUs7WUFDN0QsTUFBTSxzQkFBc0IsQ0FBQyxFQUFFLGVBQWUsRUFBRSxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzVGLENBQUMsQ0FBQyxDQUFDO1FBRUgsS0FBSyxVQUFVLHNCQUFzQixDQUFDLE9BQXdDLEVBQUUsY0FBdUIsRUFBRSxnQkFBeUI7WUFDakksTUFBTSxDQUFDLEVBQUUsT0FBTyxDQUFDLEdBQUcsTUFBTSxtQkFBbUIsRUFBRSxDQUFDO1lBQ2hELE1BQU0sTUFBTSxHQUFHLHlCQUF5QixDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQzVGLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQ3BCLE1BQU0sYUFBYSxHQUFHLHlCQUF5QixDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQ25HLGFBQWEsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQzNCLGFBQWEsQ0FBQyxZQUFZLDJDQUFtQyxDQUFDO1lBQzlELE1BQU0sZUFBZSxHQUFHLHlCQUF5QixDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQ3JHLGVBQWUsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1lBQ2hDLGVBQWUsQ0FBQyxZQUFZLEdBQUcsdUZBQXFFLENBQUM7WUFFckcsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFDakUsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQzFELE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxlQUFlLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUU1RCxNQUFNLFNBQVMsR0FBRyxNQUFNLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbkQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDcEMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzdDLE1BQU0sQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSxjQUFjLENBQUMsQ0FBQztZQUM5RCxNQUFNLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQUVsRSxNQUFNLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztZQUN4QixhQUFhLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztZQUNqQyxlQUFlLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztZQUVwQyxNQUFNLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztZQUN4QixhQUFhLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztZQUNqQyxlQUFlLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztZQUVwQyxNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztZQUNwQixhQUFhLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztZQUMzQixlQUFlLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztZQUVoQyxNQUFNLE9BQU8sR0FBRyxNQUFNLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDL0MsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFGLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMxQyxNQUFNLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDM0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFDaEUsQ0FBQztRQUVELElBQUksQ0FBQywyQkFBMkIsRUFBRSxLQUFLO1lBQ3RDLE9BQU8seUJBQXlCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDekMsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsdUNBQXVDLEVBQUU7WUFDN0MsT0FBTyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4QyxDQUFDLENBQUMsQ0FBQztRQUVILEtBQUssVUFBVSx5QkFBeUIsQ0FBQyxLQUFjO1lBQ3RELE1BQU0sQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxHQUFHLE1BQU0sbUJBQW1CLEVBQUUsQ0FBQztZQUU5RCxNQUFNLE1BQU0sR0FBRyx5QkFBeUIsQ0FBQyxTQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQUM1RixNQUFNLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNyQixNQUFNLE1BQU0sR0FBRyx5QkFBeUIsQ0FBQyxTQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQUM1RixNQUFNLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUVyQixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1lBRW5DLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUNuRCxNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFFbkQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRW5ELE1BQU0seUJBQXlCLEdBQUcsdUJBQXVCLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbkUsUUFBUSxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLDBCQUFrQixDQUFDLE1BQU0sQ0FBQyxRQUFRLCtCQUF1QixDQUFDLENBQUM7WUFDdkcsSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDWCxNQUFNLHlCQUF5QixDQUFDO2FBQ2hDO1lBRUQsSUFBSSxLQUFLLEVBQUU7Z0JBQ1YsTUFBTSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQ25EO2lCQUFNO2dCQUNOLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQzthQUNuRDtRQUNGLENBQUM7UUFFRCxJQUFJLENBQUMsOEJBQThCLEVBQUUsS0FBSztZQUN6QyxNQUFNLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsR0FBRyxNQUFNLG1CQUFtQixFQUFFLENBQUM7WUFFOUQsTUFBTSxNQUFNLEdBQUcseUJBQXlCLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFDNUYsTUFBTSxVQUFVLEdBQUcseUJBQXlCLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFDaEcsTUFBTSxDQUFDLFdBQVcsR0FBRyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsQ0FBQztZQUU1QyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1lBRW5DLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUVuRCxNQUFNLHlCQUF5QixHQUFHLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ25FLFFBQVEsQ0FBQyxXQUFXLENBQUMsa0JBQWtCLENBQUMsSUFBSSwwQkFBa0IsQ0FBQyxNQUFNLENBQUMsUUFBUSw4QkFBc0I7Z0JBQ25HLFFBQVEsRUFBRSxVQUFVLENBQUMsUUFBUTtnQkFDN0IsS0FBSyxFQUFFLENBQUM7Z0JBQ1IsSUFBSSxFQUFFLEVBQUU7Z0JBQ1IsV0FBVyxFQUFFLEtBQUs7Z0JBQ2xCLE1BQU0sRUFBRSxJQUFJO2dCQUNaLEtBQUssRUFBRSxDQUFDO2dCQUNSLElBQUksRUFBRSxXQUFXO2dCQUNqQixJQUFJLEVBQUUsQ0FBQztnQkFDUCxjQUFjLEVBQUUsS0FBSztnQkFDckIsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsUUFBUSxFQUFFLFNBQVM7YUFDbkIsQ0FBQyxDQUFDLENBQUM7WUFDSixNQUFNLHlCQUF5QixDQUFDO1lBRWhDLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUN4RCxDQUFDLENBQUMsQ0FBQztRQUVILFNBQVMsdUJBQXVCLENBQUMsYUFBNkI7WUFDN0QsT0FBTyxhQUFLLENBQUMsU0FBUyxDQUFDLGFBQUssQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQztRQUMzRSxDQUFDO1FBRUQsSUFBSSxDQUFDLHdEQUF3RCxFQUFFLEtBQUs7WUFDbkUsTUFBTSxDQUFDLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxHQUFHLE1BQU0sbUJBQW1CLEVBQUUsQ0FBQztZQUUxRCxNQUFNLE1BQU0sR0FBRyx5QkFBeUIsQ0FBQyxTQUFHLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQUM5RixNQUFNLE1BQU0sR0FBRyx5QkFBeUIsQ0FBQyxTQUFHLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQUU5RixNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFDbkQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDM0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFFM0YsTUFBTSxNQUFNLEdBQUcsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ2xFLE1BQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzNELE1BQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBRTNGLE1BQU0sTUFBTSxFQUFFLEtBQUssRUFBRSxlQUFlLEVBQUUsQ0FBQztZQUN2QyxNQUFNLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM1RCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQywwQ0FBMEMsRUFBRSxLQUFLO1lBQ3JELE1BQU0sb0JBQW9CLEdBQUcsSUFBQSxxREFBNkIsRUFBQyxFQUFFLGlCQUFpQixFQUFFLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMscURBQTZCLENBQUMsRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQzNMLE1BQU0sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEdBQUcsTUFBTSxtQkFBbUIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBRXhFLE1BQU0sTUFBTSxHQUFHLHlCQUF5QixDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQzlGLHlCQUF5QixDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBRS9FLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUVuRCxNQUFNLHVCQUF1QixHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSx1QkFBdUIsQ0FBQztZQUNsRixNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1lBQ3JDLE1BQU0sQ0FBQyxXQUFXLENBQUMsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO1FBQ3pHLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLG9DQUFvQyxFQUFFLEtBQUs7WUFDL0MsTUFBTSxDQUFDLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxHQUFHLE1BQU0sbUJBQW1CLEVBQUUsQ0FBQztZQUMxRCxNQUFNLHFCQUFxQixHQUFHLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQztZQUM3RCxNQUFNLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQztZQUVyRCxJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUM7WUFFcEIsTUFBTSxzQkFBc0IsR0FBRyxxQkFBcUIsQ0FBQyxjQUFjLENBQ2xFLE1BQU0sRUFDTjtnQkFDQyxFQUFFLEVBQUUsWUFBWTtnQkFDaEIsS0FBSyxFQUFFLGFBQWE7Z0JBQ3BCLE1BQU0sRUFBRSxzQkFBc0I7Z0JBQzlCLFFBQVEsRUFBRSxnREFBd0IsQ0FBQyxPQUFPO2FBQzFDLEVBQ0QsRUFBRSxFQUNGO2dCQUNDLGlCQUFpQixFQUFFLENBQUMsV0FBVyxFQUFFLEVBQUU7b0JBQ2xDLFdBQVcsRUFBRSxDQUFDO29CQUNkLE9BQU8sQ0FBQyxFQUFFLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3RFLENBQUM7Z0JBQ0QscUJBQXFCLEVBQUUsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7YUFDakcsQ0FDRCxDQUFDO1lBQ0YsTUFBTSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFbkMsTUFBTSxNQUFNLEdBQUcsRUFBRSxRQUFRLEVBQUUsU0FBRyxDQUFDLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxFQUFFLENBQUM7WUFDekUsTUFBTSxNQUFNLEdBQUcsRUFBRSxRQUFRLEVBQUUsU0FBRyxDQUFDLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxFQUFFLENBQUM7WUFFeEUsaUZBQWlGO1lBQ2pGLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNqQyxNQUFNLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUVuQyw2RUFBNkU7WUFDN0UsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2pDLE1BQU0sQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRW5DLGtGQUFrRjtZQUNsRixNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRSxHQUFHLE1BQU0sRUFBRSxPQUFPLEVBQUUsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzFFLE1BQU0sQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRW5DLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2xDLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHFDQUFxQyxFQUFFLEtBQUs7WUFDaEQsTUFBTSxDQUFDLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxHQUFHLE1BQU0sbUJBQW1CLEVBQUUsQ0FBQztZQUMxRCxNQUFNLHFCQUFxQixHQUFHLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQztZQUM3RCxNQUFNLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQztZQUVyRCxJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUM7WUFFcEIsTUFBTSxzQkFBc0IsR0FBRyxxQkFBcUIsQ0FBQyxjQUFjLENBQ2xFLE1BQU0sRUFDTjtnQkFDQyxFQUFFLEVBQUUsWUFBWTtnQkFDaEIsS0FBSyxFQUFFLGFBQWE7Z0JBQ3BCLE1BQU0sRUFBRSxzQkFBc0I7Z0JBQzlCLFFBQVEsRUFBRSxnREFBd0IsQ0FBQyxPQUFPO2FBQzFDLEVBQ0QsRUFBRSxFQUNGO2dCQUNDLGlCQUFpQixFQUFFLENBQUMsV0FBVyxFQUFFLEVBQUU7b0JBQ2xDLFdBQVcsRUFBRSxDQUFDO29CQUNkLE9BQU8sQ0FBQyxFQUFFLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3RFLENBQUM7Z0JBQ0QscUJBQXFCLEVBQUUsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7YUFDakcsQ0FDRCxDQUFDO1lBQ0YsTUFBTSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFbkMsTUFBTSxNQUFNLEdBQUcseUJBQXlCLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxFQUFFLG9CQUFvQixDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDeEgsTUFBTSxNQUFNLEdBQUcseUJBQXlCLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxFQUFFLG9CQUFvQixDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDeEgsTUFBTSxNQUFNLEdBQUcseUJBQXlCLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxFQUFFLG9CQUFvQixDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDdkgsTUFBTSxNQUFNLEdBQUcseUJBQXlCLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxFQUFFLG9CQUFvQixDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7WUFFdkgsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNsQixNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2xCLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbEIsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUVsQixxQkFBcUI7WUFDckIsTUFBTSxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUM1RCxvQ0FBb0M7WUFDcEMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFbkMsc0JBQXNCLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDbEMsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsd0NBQXdDLEVBQUUsS0FBSztZQUNuRCxNQUFNLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsR0FBRyxNQUFNLG1CQUFtQixFQUFFLENBQUM7WUFDOUQsTUFBTSxxQkFBcUIsR0FBRyxRQUFRLENBQUMscUJBQXFCLENBQUM7WUFDN0QsTUFBTSxpQkFBaUIsR0FBRyxRQUFRLENBQUMsaUJBQWlCLENBQUM7WUFFckQsSUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDO1lBRXBCLE1BQU0sc0JBQXNCLEdBQUcscUJBQXFCLENBQUMsY0FBYyxDQUNsRSxNQUFNLEVBQ047Z0JBQ0MsRUFBRSxFQUFFLFlBQVk7Z0JBQ2hCLEtBQUssRUFBRSxhQUFhO2dCQUNwQixNQUFNLEVBQUUsc0JBQXNCO2dCQUM5QixRQUFRLEVBQUUsZ0RBQXdCLENBQUMsT0FBTzthQUMxQyxFQUNELEVBQUUsRUFDRjtnQkFDQyxpQkFBaUIsRUFBRSxDQUFDLFdBQVcsRUFBRSxFQUFFO29CQUNsQyxXQUFXLEVBQUUsQ0FBQztvQkFDZCxPQUFPLENBQUMsRUFBRSxNQUFNLEVBQUUsaUJBQWlCLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUN0RSxDQUFDO2dCQUNELHFCQUFxQixFQUFFLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO2FBQ2pHLENBQ0QsQ0FBQztZQUVGLE1BQU0sQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRW5DLE1BQU0sTUFBTSxHQUFHLHlCQUF5QixDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsK0JBQStCLENBQUMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQzNHLE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUN6QyxNQUFNLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRXpCLHFGQUFxRjtZQUNyRixNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDakMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFbkMsTUFBTSxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7b0JBQzdCLE1BQU0sRUFBRSxNQUFNO29CQUNkLFdBQVcsRUFBRSxhQUFhO2lCQUMxQixDQUFDLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3RCLE1BQU0sQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRW5DLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2xDLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGFBQWEsRUFBRSxLQUFLLElBQUksRUFBRTtZQUM5QixNQUFNLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxHQUFHLE1BQU0sbUJBQW1CLEVBQUUsQ0FBQztZQUVwRCxNQUFNLEtBQUssR0FBRyx5QkFBeUIsQ0FBQyxTQUFHLENBQUMsS0FBSyxDQUFDLDJCQUEyQixDQUFDLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQUN0RyxNQUFNLFVBQVUsR0FBRyx5QkFBeUIsQ0FBQyxTQUFHLENBQUMsS0FBSyxDQUFDLDRCQUE0QixDQUFDLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQUU1RyxlQUFlO1lBQ2YsTUFBTSxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3ZFLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFOUMsZUFBZTtZQUNmLE1BQU0sT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMzRSxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRTlDLE1BQU0sT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMzRSxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRTlDLE1BQU0sT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNoRixNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRTlDLE1BQU0sT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDaEUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMvQyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxjQUFjLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDL0IsTUFBTSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsR0FBRyxNQUFNLG1CQUFtQixFQUFFLENBQUM7WUFFcEQsTUFBTSxLQUFLLEdBQUcseUJBQXlCLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFDdEcsTUFBTSxVQUFVLEdBQUcseUJBQXlCLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFFNUcsZUFBZTtZQUNmLE1BQU0sT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2RSxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRTlDLGdCQUFnQjtZQUNoQixNQUFNLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNwSSxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQy9DLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHdCQUF3QixFQUFFLEtBQUssSUFBSSxFQUFFO1lBQ3pDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEdBQUcsTUFBTSxtQkFBbUIsRUFBRSxDQUFDO1lBRXBELE1BQU0sS0FBSyxHQUFHLHlCQUF5QixDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsMkJBQTJCLENBQUMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQ3RHLE1BQU0sVUFBVSxHQUFHLHlCQUF5QixDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsNEJBQTRCLENBQUMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBRTVHLGVBQWU7WUFDZixNQUFNLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdkUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztZQUU5Qyw0Q0FBNEM7WUFDNUM7Z0JBQ0MsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ2hGLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDckMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBRXJDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ3ZFLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ2xDO1lBQ0Q7Z0JBQ0MsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ3JGLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDckMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7Z0JBRTFDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQzVFLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO2FBQ3ZDO1lBRUQsNkNBQTZDO1lBQzdDO2dCQUNDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ3BHLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFFckMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFFLFFBQVEsRUFBRSxTQUFHLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsb0JBQW9CLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUM5SixNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQzthQUN0QztZQUVELGdEQUFnRDtZQUNoRDtnQkFDQyxNQUFNLFNBQVMsR0FBRyxNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMseUJBQXlCLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxFQUFFLG9CQUFvQixDQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsRUFBRSwwQkFBVSxDQUFDLENBQUM7Z0JBRXZMLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsU0FBVSxDQUFDLEtBQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDcEYsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUVyQyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsU0FBVSxDQUFDLEtBQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDM0UsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7YUFDdEM7WUFFRCxpREFBaUQ7WUFDakQsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ3pDO2dCQUNDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUNoRixNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBRXJDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ3ZFLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDO2FBQ3RDO1FBQ0YsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsNkJBQTZCLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDOUMsTUFBTSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsR0FBRyxNQUFNLG1CQUFtQixFQUFFLENBQUM7WUFFcEQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUVuQyxNQUFNLEtBQUssR0FBRyx5QkFBeUIsQ0FBQyxTQUFHLENBQUMsS0FBSyxDQUFDLDJCQUEyQixDQUFDLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQUN0RyxNQUFNLFVBQVUsR0FBRyx5QkFBeUIsQ0FBQyxTQUFHLENBQUMsS0FBSyxDQUFDLDRCQUE0QixDQUFDLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQUU1RyxlQUFlO1lBQ2YsTUFBTSxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3ZFLE1BQU0sVUFBVSxHQUFHLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEVBQUUsMEJBQVUsQ0FBQyxDQUFDO1lBRWpGLDRDQUE0QztZQUM1QztnQkFDQyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDbkQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNyQyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQzVDLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUM3RCxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQzVDLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBRXBELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDckMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUM1QyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUM1QyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQ3BEO1lB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