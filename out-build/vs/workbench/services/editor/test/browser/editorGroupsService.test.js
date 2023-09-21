/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/common/editor", "vs/base/common/uri", "vs/platform/instantiation/common/descriptors", "vs/base/common/lifecycle", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/configuration/common/configuration", "vs/workbench/common/editor/sideBySideEditorInput", "vs/base/test/common/utils"], function (require, exports, assert, workbenchTestServices_1, editorGroupsService_1, editor_1, uri_1, descriptors_1, lifecycle_1, mockKeybindingService_1, testConfigurationService_1, configuration_1, sideBySideEditorInput_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('EditorGroupsService', () => {
        const TEST_EDITOR_ID = 'MyFileEditorForEditorGroupService';
        const TEST_EDITOR_INPUT_ID = 'testEditorInputForEditorGroupService';
        const disposables = new lifecycle_1.$jc();
        let testLocalInstantiationService = undefined;
        setup(() => {
            disposables.add((0, workbenchTestServices_1.$Vec)(TEST_EDITOR_ID, [new descriptors_1.$yh(workbenchTestServices_1.$Zec), new descriptors_1.$yh(sideBySideEditorInput_1.$VC)], TEST_EDITOR_INPUT_ID));
        });
        teardown(async () => {
            if (testLocalInstantiationService) {
                await (0, workbenchTestServices_1.$hfc)(testLocalInstantiationService);
                testLocalInstantiationService = undefined;
            }
            disposables.clear();
        });
        async function createPart(instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables)) {
            const part = await (0, workbenchTestServices_1.$3ec)(instantiationService, disposables);
            instantiationService.stub(editorGroupsService_1.$5C, part);
            testLocalInstantiationService = instantiationService;
            return [part, instantiationService];
        }
        function createTestFileEditorInput(resource, typeId) {
            return disposables.add(new workbenchTestServices_1.$Zec(resource, typeId));
        }
        test('groups basics', async function () {
            const instantiationService = (0, workbenchTestServices_1.$lec)({ contextKeyService: instantiationService => instantiationService.createInstance(mockKeybindingService_1.$T0b) }, disposables);
            const [part] = await createPart(instantiationService);
            let activeGroupModelChangeCounter = 0;
            const activeGroupModelChangeListener = part.onDidChangeActiveGroup(() => {
                activeGroupModelChangeCounter++;
            });
            let groupAddedCounter = 0;
            const groupAddedListener = part.onDidAddGroup(() => {
                groupAddedCounter++;
            });
            let groupRemovedCounter = 0;
            const groupRemovedListener = part.onDidRemoveGroup(() => {
                groupRemovedCounter++;
            });
            let groupMovedCounter = 0;
            const groupMovedListener = part.onDidMoveGroup(() => {
                groupMovedCounter++;
            });
            // always a root group
            const rootGroup = part.groups[0];
            assert.strictEqual((0, editorGroupsService_1.$7C)(rootGroup), true);
            assert.strictEqual(part.groups.length, 1);
            assert.strictEqual(part.count, 1);
            assert.strictEqual(rootGroup, part.getGroup(rootGroup.id));
            assert.ok(part.activeGroup === rootGroup);
            assert.strictEqual(rootGroup.label, 'Group 1');
            let mru = part.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */);
            assert.strictEqual(mru.length, 1);
            assert.strictEqual(mru[0], rootGroup);
            const rightGroup = part.addGroup(rootGroup, 3 /* GroupDirection.RIGHT */);
            assert.strictEqual(rightGroup, part.getGroup(rightGroup.id));
            assert.strictEqual(groupAddedCounter, 1);
            assert.strictEqual(part.groups.length, 2);
            assert.strictEqual(part.count, 2);
            assert.ok(part.activeGroup === rootGroup);
            assert.strictEqual(rootGroup.label, 'Group 1');
            assert.strictEqual(rightGroup.label, 'Group 2');
            mru = part.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */);
            assert.strictEqual(mru.length, 2);
            assert.strictEqual(mru[0], rootGroup);
            assert.strictEqual(mru[1], rightGroup);
            assert.strictEqual(activeGroupModelChangeCounter, 0);
            let rootGroupActiveChangeCounter = 0;
            const rootGroupModelChangeListener = rootGroup.onDidModelChange(e => {
                if (e.kind === 0 /* GroupModelChangeKind.GROUP_ACTIVE */) {
                    rootGroupActiveChangeCounter++;
                }
            });
            let rightGroupActiveChangeCounter = 0;
            const rightGroupModelChangeListener = rightGroup.onDidModelChange(e => {
                if (e.kind === 0 /* GroupModelChangeKind.GROUP_ACTIVE */) {
                    rightGroupActiveChangeCounter++;
                }
            });
            part.activateGroup(rightGroup);
            assert.ok(part.activeGroup === rightGroup);
            assert.strictEqual(activeGroupModelChangeCounter, 1);
            assert.strictEqual(rootGroupActiveChangeCounter, 1);
            assert.strictEqual(rightGroupActiveChangeCounter, 1);
            rootGroupModelChangeListener.dispose();
            rightGroupModelChangeListener.dispose();
            mru = part.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */);
            assert.strictEqual(mru.length, 2);
            assert.strictEqual(mru[0], rightGroup);
            assert.strictEqual(mru[1], rootGroup);
            const downGroup = part.addGroup(rightGroup, 1 /* GroupDirection.DOWN */);
            let didDispose = false;
            disposables.add(downGroup.onWillDispose(() => {
                didDispose = true;
            }));
            assert.strictEqual(groupAddedCounter, 2);
            assert.strictEqual(part.groups.length, 3);
            assert.ok(part.activeGroup === rightGroup);
            assert.ok(!downGroup.activeEditorPane);
            assert.strictEqual(rootGroup.label, 'Group 1');
            assert.strictEqual(rightGroup.label, 'Group 2');
            assert.strictEqual(downGroup.label, 'Group 3');
            mru = part.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */);
            assert.strictEqual(mru.length, 3);
            assert.strictEqual(mru[0], rightGroup);
            assert.strictEqual(mru[1], rootGroup);
            assert.strictEqual(mru[2], downGroup);
            const gridOrder = part.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */);
            assert.strictEqual(gridOrder.length, 3);
            assert.strictEqual(gridOrder[0], rootGroup);
            assert.strictEqual(gridOrder[0].index, 0);
            assert.strictEqual(gridOrder[1], rightGroup);
            assert.strictEqual(gridOrder[1].index, 1);
            assert.strictEqual(gridOrder[2], downGroup);
            assert.strictEqual(gridOrder[2].index, 2);
            part.moveGroup(downGroup, rightGroup, 1 /* GroupDirection.DOWN */);
            assert.strictEqual(groupMovedCounter, 1);
            part.removeGroup(downGroup);
            assert.ok(!part.getGroup(downGroup.id));
            assert.strictEqual(didDispose, true);
            assert.strictEqual(groupRemovedCounter, 1);
            assert.strictEqual(part.groups.length, 2);
            assert.ok(part.activeGroup === rightGroup);
            assert.strictEqual(rootGroup.label, 'Group 1');
            assert.strictEqual(rightGroup.label, 'Group 2');
            mru = part.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */);
            assert.strictEqual(mru.length, 2);
            assert.strictEqual(mru[0], rightGroup);
            assert.strictEqual(mru[1], rootGroup);
            const rightGroupContextKeyService = part.activeGroup.scopedContextKeyService;
            const rootGroupContextKeyService = rootGroup.scopedContextKeyService;
            assert.ok(rightGroupContextKeyService);
            assert.ok(rootGroupContextKeyService);
            assert.ok(rightGroupContextKeyService !== rootGroupContextKeyService);
            part.removeGroup(rightGroup);
            assert.strictEqual(groupRemovedCounter, 2);
            assert.strictEqual(part.groups.length, 1);
            assert.ok(part.activeGroup === rootGroup);
            mru = part.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */);
            assert.strictEqual(mru.length, 1);
            assert.strictEqual(mru[0], rootGroup);
            part.removeGroup(rootGroup); // cannot remove root group
            assert.strictEqual(part.groups.length, 1);
            assert.strictEqual(groupRemovedCounter, 2);
            assert.ok(part.activeGroup === rootGroup);
            part.setGroupOrientation(part.orientation === 0 /* GroupOrientation.HORIZONTAL */ ? 1 /* GroupOrientation.VERTICAL */ : 0 /* GroupOrientation.HORIZONTAL */);
            activeGroupModelChangeListener.dispose();
            groupAddedListener.dispose();
            groupRemovedListener.dispose();
            groupMovedListener.dispose();
        });
        test('sideGroup', async () => {
            const instantiationService = (0, workbenchTestServices_1.$lec)({ contextKeyService: instantiationService => instantiationService.createInstance(mockKeybindingService_1.$T0b) }, disposables);
            const [part] = await createPart(instantiationService);
            const rootGroup = part.activeGroup;
            const input1 = createTestFileEditorInput(uri_1.URI.file('foo/bar1'), TEST_EDITOR_INPUT_ID);
            const input2 = createTestFileEditorInput(uri_1.URI.file('foo/bar2'), TEST_EDITOR_INPUT_ID);
            const input3 = createTestFileEditorInput(uri_1.URI.file('foo/bar3'), TEST_EDITOR_INPUT_ID);
            await rootGroup.openEditor(input1, { pinned: true });
            await part.sideGroup.openEditor(input2, { pinned: true });
            assert.strictEqual(part.count, 2);
            part.activateGroup(rootGroup);
            await part.sideGroup.openEditor(input3, { pinned: true });
            assert.strictEqual(part.count, 2);
        });
        test('save & restore state', async function () {
            const [part, instantiationService] = await createPart();
            const rootGroup = part.groups[0];
            const rightGroup = part.addGroup(rootGroup, 3 /* GroupDirection.RIGHT */);
            const downGroup = part.addGroup(rightGroup, 1 /* GroupDirection.DOWN */);
            const rootGroupInput = createTestFileEditorInput(uri_1.URI.file('foo/bar1'), TEST_EDITOR_INPUT_ID);
            await rootGroup.openEditor(rootGroupInput, { pinned: true });
            const rightGroupInput = createTestFileEditorInput(uri_1.URI.file('foo/bar2'), TEST_EDITOR_INPUT_ID);
            await rightGroup.openEditor(rightGroupInput, { pinned: true });
            assert.strictEqual(part.groups.length, 3);
            part.testSaveState();
            part.dispose();
            const [restoredPart] = await createPart(instantiationService);
            assert.strictEqual(restoredPart.groups.length, 3);
            assert.ok(restoredPart.getGroup(rootGroup.id));
            assert.ok(restoredPart.getGroup(rightGroup.id));
            assert.ok(restoredPart.getGroup(downGroup.id));
            restoredPart.clearState();
        });
        test('groups index / labels', async function () {
            const [part] = await createPart();
            const rootGroup = part.groups[0];
            const rightGroup = part.addGroup(rootGroup, 3 /* GroupDirection.RIGHT */);
            const downGroup = part.addGroup(rightGroup, 1 /* GroupDirection.DOWN */);
            let groupIndexChangedCounter = 0;
            const groupIndexChangedListener = part.onDidChangeGroupIndex(() => {
                groupIndexChangedCounter++;
            });
            let indexChangeCounter = 0;
            const labelChangeListener = downGroup.onDidModelChange(e => {
                if (e.kind === 1 /* GroupModelChangeKind.GROUP_INDEX */) {
                    indexChangeCounter++;
                }
            });
            assert.strictEqual(rootGroup.index, 0);
            assert.strictEqual(rightGroup.index, 1);
            assert.strictEqual(downGroup.index, 2);
            assert.strictEqual(rootGroup.label, 'Group 1');
            assert.strictEqual(rightGroup.label, 'Group 2');
            assert.strictEqual(downGroup.label, 'Group 3');
            part.removeGroup(rightGroup);
            assert.strictEqual(rootGroup.index, 0);
            assert.strictEqual(downGroup.index, 1);
            assert.strictEqual(rootGroup.label, 'Group 1');
            assert.strictEqual(downGroup.label, 'Group 2');
            assert.strictEqual(indexChangeCounter, 1);
            assert.strictEqual(groupIndexChangedCounter, 1);
            part.moveGroup(downGroup, rootGroup, 0 /* GroupDirection.UP */);
            assert.strictEqual(downGroup.index, 0);
            assert.strictEqual(rootGroup.index, 1);
            assert.strictEqual(downGroup.label, 'Group 1');
            assert.strictEqual(rootGroup.label, 'Group 2');
            assert.strictEqual(indexChangeCounter, 2);
            assert.strictEqual(groupIndexChangedCounter, 3);
            const newFirstGroup = part.addGroup(downGroup, 0 /* GroupDirection.UP */);
            assert.strictEqual(newFirstGroup.index, 0);
            assert.strictEqual(downGroup.index, 1);
            assert.strictEqual(rootGroup.index, 2);
            assert.strictEqual(newFirstGroup.label, 'Group 1');
            assert.strictEqual(downGroup.label, 'Group 2');
            assert.strictEqual(rootGroup.label, 'Group 3');
            assert.strictEqual(indexChangeCounter, 3);
            assert.strictEqual(groupIndexChangedCounter, 6);
            labelChangeListener.dispose();
            groupIndexChangedListener.dispose();
        });
        test('copy/merge groups', async () => {
            const [part] = await createPart();
            let groupAddedCounter = 0;
            const groupAddedListener = part.onDidAddGroup(() => {
                groupAddedCounter++;
            });
            let groupRemovedCounter = 0;
            const groupRemovedListener = part.onDidRemoveGroup(() => {
                groupRemovedCounter++;
            });
            const rootGroup = part.groups[0];
            let rootGroupDisposed = false;
            const disposeListener = rootGroup.onWillDispose(() => {
                rootGroupDisposed = true;
            });
            const input = createTestFileEditorInput(uri_1.URI.file('foo/bar'), TEST_EDITOR_INPUT_ID);
            await rootGroup.openEditor(input, { pinned: true });
            const rightGroup = part.addGroup(rootGroup, 3 /* GroupDirection.RIGHT */);
            part.activateGroup(rightGroup);
            const downGroup = part.copyGroup(rootGroup, rightGroup, 1 /* GroupDirection.DOWN */);
            assert.strictEqual(groupAddedCounter, 2);
            assert.strictEqual(downGroup.count, 1);
            assert.ok(downGroup.activeEditor instanceof workbenchTestServices_1.$Zec);
            part.mergeGroup(rootGroup, rightGroup, { mode: 0 /* MergeGroupMode.COPY_EDITORS */ });
            assert.strictEqual(rightGroup.count, 1);
            assert.ok(rightGroup.activeEditor instanceof workbenchTestServices_1.$Zec);
            part.mergeGroup(rootGroup, rightGroup, { mode: 1 /* MergeGroupMode.MOVE_EDITORS */ });
            assert.strictEqual(rootGroup.count, 0);
            part.mergeGroup(rootGroup, downGroup);
            assert.strictEqual(groupRemovedCounter, 1);
            assert.strictEqual(rootGroupDisposed, true);
            groupAddedListener.dispose();
            groupRemovedListener.dispose();
            disposeListener.dispose();
            part.dispose();
        });
        test('merge all groups', async () => {
            const [part] = await createPart();
            const rootGroup = part.groups[0];
            const input1 = createTestFileEditorInput(uri_1.URI.file('foo/bar1'), TEST_EDITOR_INPUT_ID);
            const input2 = createTestFileEditorInput(uri_1.URI.file('foo/bar2'), TEST_EDITOR_INPUT_ID);
            const input3 = createTestFileEditorInput(uri_1.URI.file('foo/bar3'), TEST_EDITOR_INPUT_ID);
            await rootGroup.openEditor(input1, { pinned: true });
            const rightGroup = part.addGroup(rootGroup, 3 /* GroupDirection.RIGHT */);
            await rightGroup.openEditor(input2, { pinned: true });
            const downGroup = part.copyGroup(rootGroup, rightGroup, 1 /* GroupDirection.DOWN */);
            await downGroup.openEditor(input3, { pinned: true });
            part.activateGroup(rootGroup);
            assert.strictEqual(rootGroup.count, 1);
            const result = part.mergeAllGroups();
            assert.strictEqual(result.id, rootGroup.id);
            assert.strictEqual(rootGroup.count, 3);
            part.dispose();
        });
        test('whenReady / whenRestored', async () => {
            const [part] = await createPart();
            await part.whenReady;
            assert.strictEqual(part.isReady, true);
            await part.whenRestored;
        });
        test('options', async () => {
            const [part] = await createPart();
            let oldOptions;
            let newOptions;
            disposables.add(part.onDidChangeEditorPartOptions(event => {
                oldOptions = event.oldPartOptions;
                newOptions = event.newPartOptions;
            }));
            const currentOptions = part.partOptions;
            assert.ok(currentOptions);
            disposables.add(part.enforcePartOptions({ showTabs: false }));
            assert.strictEqual(part.partOptions.showTabs, false);
            assert.strictEqual(newOptions.showTabs, false);
            assert.strictEqual(oldOptions, currentOptions);
        });
        test('editor basics', async function () {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            let activeEditorChangeCounter = 0;
            let editorDidOpenCounter = 0;
            const editorOpenEvents = [];
            let editorCloseCounter = 0;
            const editorCloseEvents = [];
            let editorPinCounter = 0;
            let editorStickyCounter = 0;
            let editorCapabilitiesCounter = 0;
            const editorGroupModelChangeListener = group.onDidModelChange(e => {
                if (e.kind === 3 /* GroupModelChangeKind.EDITOR_OPEN */) {
                    assert.ok(e.editor);
                    editorDidOpenCounter++;
                    editorOpenEvents.push(e);
                }
                else if (e.kind === 9 /* GroupModelChangeKind.EDITOR_PIN */) {
                    assert.ok(e.editor);
                    editorPinCounter++;
                }
                else if (e.kind === 10 /* GroupModelChangeKind.EDITOR_STICKY */) {
                    assert.ok(e.editor);
                    editorStickyCounter++;
                }
                else if (e.kind === 8 /* GroupModelChangeKind.EDITOR_CAPABILITIES */) {
                    assert.ok(e.editor);
                    editorCapabilitiesCounter++;
                }
                else if (e.kind === 4 /* GroupModelChangeKind.EDITOR_CLOSE */) {
                    assert.ok(e.editor);
                    editorCloseCounter++;
                    editorCloseEvents.push(e);
                }
            });
            const activeEditorChangeListener = group.onDidActiveEditorChange(e => {
                assert.ok(e.editor);
                activeEditorChangeCounter++;
            });
            let editorCloseCounter1 = 0;
            const editorCloseListener = group.onDidCloseEditor(() => {
                editorCloseCounter1++;
            });
            let editorWillCloseCounter = 0;
            const editorWillCloseListener = group.onWillCloseEditor(() => {
                editorWillCloseCounter++;
            });
            let editorDidCloseCounter = 0;
            const editorDidCloseListener = group.onDidCloseEditor(() => {
                editorDidCloseCounter++;
            });
            const input = createTestFileEditorInput(uri_1.URI.file('foo/bar'), TEST_EDITOR_INPUT_ID);
            const inputInactive = createTestFileEditorInput(uri_1.URI.file('foo/bar/inactive'), TEST_EDITOR_INPUT_ID);
            await group.openEditor(input, { pinned: true });
            await group.openEditor(inputInactive, { inactive: true });
            assert.strictEqual(group.isActive(input), true);
            assert.strictEqual(group.isActive(inputInactive), false);
            assert.strictEqual(group.contains(input), true);
            assert.strictEqual(group.contains(inputInactive), true);
            assert.strictEqual(group.isEmpty, false);
            assert.strictEqual(group.count, 2);
            assert.strictEqual(editorCapabilitiesCounter, 0);
            assert.strictEqual(editorDidOpenCounter, 2);
            assert.strictEqual(editorOpenEvents[0].editorIndex, 0);
            assert.strictEqual(editorOpenEvents[1].editorIndex, 1);
            assert.strictEqual(editorOpenEvents[0].editor, input);
            assert.strictEqual(editorOpenEvents[1].editor, inputInactive);
            assert.strictEqual(activeEditorChangeCounter, 1);
            assert.strictEqual(group.getEditorByIndex(0), input);
            assert.strictEqual(group.getEditorByIndex(1), inputInactive);
            assert.strictEqual(group.getIndexOfEditor(input), 0);
            assert.strictEqual(group.getIndexOfEditor(inputInactive), 1);
            assert.strictEqual(group.isFirst(input), true);
            assert.strictEqual(group.isFirst(inputInactive), false);
            assert.strictEqual(group.isLast(input), false);
            assert.strictEqual(group.isLast(inputInactive), true);
            input.capabilities = 16 /* EditorInputCapabilities.RequiresTrust */;
            assert.strictEqual(editorCapabilitiesCounter, 1);
            inputInactive.capabilities = 8 /* EditorInputCapabilities.Singleton */;
            assert.strictEqual(editorCapabilitiesCounter, 2);
            assert.strictEqual(group.previewEditor, inputInactive);
            assert.strictEqual(group.isPinned(inputInactive), false);
            group.pinEditor(inputInactive);
            assert.strictEqual(editorPinCounter, 1);
            assert.strictEqual(group.isPinned(inputInactive), true);
            assert.ok(!group.previewEditor);
            assert.strictEqual(group.activeEditor, input);
            assert.strictEqual(group.activeEditorPane?.getId(), TEST_EDITOR_ID);
            assert.strictEqual(group.count, 2);
            const mru = group.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */);
            assert.strictEqual(mru[0], input);
            assert.strictEqual(mru[1], inputInactive);
            await group.openEditor(inputInactive);
            assert.strictEqual(activeEditorChangeCounter, 2);
            assert.strictEqual(group.activeEditor, inputInactive);
            await group.openEditor(input);
            const closed = await group.closeEditor(inputInactive);
            assert.strictEqual(closed, true);
            assert.strictEqual(activeEditorChangeCounter, 3);
            assert.strictEqual(editorCloseCounter, 1);
            assert.strictEqual(editorCloseEvents[0].editorIndex, 1);
            assert.strictEqual(editorCloseEvents[0].editor, inputInactive);
            assert.strictEqual(editorCloseCounter1, 1);
            assert.strictEqual(editorWillCloseCounter, 1);
            assert.strictEqual(editorDidCloseCounter, 1);
            assert.ok(inputInactive.gotDisposed);
            assert.strictEqual(group.activeEditor, input);
            assert.strictEqual(editorStickyCounter, 0);
            group.stickEditor(input);
            assert.strictEqual(editorStickyCounter, 1);
            group.unstickEditor(input);
            assert.strictEqual(editorStickyCounter, 2);
            editorCloseListener.dispose();
            editorWillCloseListener.dispose();
            editorDidCloseListener.dispose();
            activeEditorChangeListener.dispose();
            editorGroupModelChangeListener.dispose();
        });
        test('openEditors / closeEditors', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const input = createTestFileEditorInput(uri_1.URI.file('foo/bar'), TEST_EDITOR_INPUT_ID);
            const inputInactive = createTestFileEditorInput(uri_1.URI.file('foo/bar/inactive'), TEST_EDITOR_INPUT_ID);
            await group.openEditors([
                { editor: input, options: { pinned: true } },
                { editor: inputInactive }
            ]);
            assert.strictEqual(group.count, 2);
            assert.strictEqual(group.getEditorByIndex(0), input);
            assert.strictEqual(group.getEditorByIndex(1), inputInactive);
            await group.closeEditors([input, inputInactive]);
            assert.ok(input.gotDisposed);
            assert.ok(inputInactive.gotDisposed);
            assert.strictEqual(group.isEmpty, true);
        });
        test('closeEditor - dirty editor handling', async () => {
            const [part, instantiationService] = await createPart();
            const accessor = instantiationService.createInstance(workbenchTestServices_1.$mec);
            accessor.fileDialogService.setConfirmResult(1 /* ConfirmResult.DONT_SAVE */);
            const group = part.activeGroup;
            const input = createTestFileEditorInput(uri_1.URI.file('foo/bar'), TEST_EDITOR_INPUT_ID);
            input.dirty = true;
            await group.openEditor(input);
            accessor.fileDialogService.setConfirmResult(2 /* ConfirmResult.CANCEL */);
            let closed = await group.closeEditor(input);
            assert.strictEqual(closed, false);
            assert.ok(!input.gotDisposed);
            accessor.fileDialogService.setConfirmResult(1 /* ConfirmResult.DONT_SAVE */);
            closed = await group.closeEditor(input);
            assert.strictEqual(closed, true);
            assert.ok(input.gotDisposed);
        });
        test('closeEditor (one, opened in multiple groups)', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const rightGroup = part.addGroup(group, 3 /* GroupDirection.RIGHT */);
            const input = createTestFileEditorInput(uri_1.URI.file('foo/bar'), TEST_EDITOR_INPUT_ID);
            const inputInactive = createTestFileEditorInput(uri_1.URI.file('foo/bar/inactive'), TEST_EDITOR_INPUT_ID);
            await group.openEditors([{ editor: input, options: { pinned: true } }, { editor: inputInactive }]);
            await rightGroup.openEditors([{ editor: input, options: { pinned: true } }, { editor: inputInactive }]);
            let closed = await rightGroup.closeEditor(input);
            assert.strictEqual(closed, true);
            assert.ok(!input.gotDisposed);
            closed = await group.closeEditor(input);
            assert.strictEqual(closed, true);
            assert.ok(input.gotDisposed);
        });
        test('closeEditors - dirty editor handling', async () => {
            const [part, instantiationService] = await createPart();
            const accessor = instantiationService.createInstance(workbenchTestServices_1.$mec);
            accessor.fileDialogService.setConfirmResult(1 /* ConfirmResult.DONT_SAVE */);
            let closeResult = false;
            const group = part.activeGroup;
            const input1 = createTestFileEditorInput(uri_1.URI.file('foo/bar1'), TEST_EDITOR_INPUT_ID);
            input1.dirty = true;
            const input2 = createTestFileEditorInput(uri_1.URI.file('foo/bar2'), TEST_EDITOR_INPUT_ID);
            await group.openEditor(input1);
            await group.openEditor(input2);
            accessor.fileDialogService.setConfirmResult(2 /* ConfirmResult.CANCEL */);
            closeResult = await group.closeEditors([input1, input2]);
            assert.strictEqual(closeResult, false);
            assert.ok(!input1.gotDisposed);
            assert.ok(!input2.gotDisposed);
            accessor.fileDialogService.setConfirmResult(1 /* ConfirmResult.DONT_SAVE */);
            closeResult = await group.closeEditors([input1, input2]);
            assert.strictEqual(closeResult, true);
            assert.ok(input1.gotDisposed);
            assert.ok(input2.gotDisposed);
        });
        test('closeEditors (except one)', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const input1 = createTestFileEditorInput(uri_1.URI.file('foo/bar1'), TEST_EDITOR_INPUT_ID);
            const input2 = createTestFileEditorInput(uri_1.URI.file('foo/bar2'), TEST_EDITOR_INPUT_ID);
            const input3 = createTestFileEditorInput(uri_1.URI.file('foo/bar3'), TEST_EDITOR_INPUT_ID);
            await group.openEditors([
                { editor: input1, options: { pinned: true } },
                { editor: input2, options: { pinned: true } },
                { editor: input3 }
            ]);
            assert.strictEqual(group.count, 3);
            assert.strictEqual(group.getEditorByIndex(0), input1);
            assert.strictEqual(group.getEditorByIndex(1), input2);
            assert.strictEqual(group.getEditorByIndex(2), input3);
            await group.closeEditors({ except: input2 });
            assert.strictEqual(group.count, 1);
            assert.strictEqual(group.getEditorByIndex(0), input2);
        });
        test('closeEditors (except one, sticky editor)', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const input1 = createTestFileEditorInput(uri_1.URI.file('foo/bar1'), TEST_EDITOR_INPUT_ID);
            const input2 = createTestFileEditorInput(uri_1.URI.file('foo/bar2'), TEST_EDITOR_INPUT_ID);
            const input3 = createTestFileEditorInput(uri_1.URI.file('foo/bar3'), TEST_EDITOR_INPUT_ID);
            await group.openEditors([
                { editor: input1, options: { pinned: true, sticky: true } },
                { editor: input2, options: { pinned: true } },
                { editor: input3 }
            ]);
            assert.strictEqual(group.count, 3);
            assert.strictEqual(group.stickyCount, 1);
            assert.strictEqual(group.getEditorByIndex(0), input1);
            assert.strictEqual(group.getEditorByIndex(1), input2);
            assert.strictEqual(group.getEditorByIndex(2), input3);
            await group.closeEditors({ except: input2, excludeSticky: true });
            assert.strictEqual(group.count, 2);
            assert.strictEqual(group.stickyCount, 1);
            assert.strictEqual(group.getEditorByIndex(0), input1);
            assert.strictEqual(group.getEditorByIndex(1), input2);
            await group.closeEditors({ except: input2 });
            assert.strictEqual(group.count, 1);
            assert.strictEqual(group.stickyCount, 0);
            assert.strictEqual(group.getEditorByIndex(0), input2);
        });
        test('closeEditors (saved only)', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const input1 = createTestFileEditorInput(uri_1.URI.file('foo/bar1'), TEST_EDITOR_INPUT_ID);
            const input2 = createTestFileEditorInput(uri_1.URI.file('foo/bar2'), TEST_EDITOR_INPUT_ID);
            const input3 = createTestFileEditorInput(uri_1.URI.file('foo/bar3'), TEST_EDITOR_INPUT_ID);
            await group.openEditors([
                { editor: input1, options: { pinned: true } },
                { editor: input2, options: { pinned: true } },
                { editor: input3 }
            ]);
            assert.strictEqual(group.count, 3);
            assert.strictEqual(group.getEditorByIndex(0), input1);
            assert.strictEqual(group.getEditorByIndex(1), input2);
            assert.strictEqual(group.getEditorByIndex(2), input3);
            await group.closeEditors({ savedOnly: true });
            assert.strictEqual(group.count, 0);
        });
        test('closeEditors (saved only, sticky editor)', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const input1 = createTestFileEditorInput(uri_1.URI.file('foo/bar1'), TEST_EDITOR_INPUT_ID);
            const input2 = createTestFileEditorInput(uri_1.URI.file('foo/bar2'), TEST_EDITOR_INPUT_ID);
            const input3 = createTestFileEditorInput(uri_1.URI.file('foo/bar3'), TEST_EDITOR_INPUT_ID);
            await group.openEditors([
                { editor: input1, options: { pinned: true, sticky: true } },
                { editor: input2, options: { pinned: true } },
                { editor: input3 }
            ]);
            assert.strictEqual(group.count, 3);
            assert.strictEqual(group.stickyCount, 1);
            assert.strictEqual(group.getEditorByIndex(0), input1);
            assert.strictEqual(group.getEditorByIndex(1), input2);
            assert.strictEqual(group.getEditorByIndex(2), input3);
            await group.closeEditors({ savedOnly: true, excludeSticky: true });
            assert.strictEqual(group.count, 1);
            assert.strictEqual(group.stickyCount, 1);
            assert.strictEqual(group.getEditorByIndex(0), input1);
            await group.closeEditors({ savedOnly: true });
            assert.strictEqual(group.count, 0);
        });
        test('closeEditors (direction: right)', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const input1 = createTestFileEditorInput(uri_1.URI.file('foo/bar1'), TEST_EDITOR_INPUT_ID);
            const input2 = createTestFileEditorInput(uri_1.URI.file('foo/bar2'), TEST_EDITOR_INPUT_ID);
            const input3 = createTestFileEditorInput(uri_1.URI.file('foo/bar3'), TEST_EDITOR_INPUT_ID);
            await group.openEditors([
                { editor: input1, options: { pinned: true } },
                { editor: input2, options: { pinned: true } },
                { editor: input3 }
            ]);
            assert.strictEqual(group.count, 3);
            assert.strictEqual(group.getEditorByIndex(0), input1);
            assert.strictEqual(group.getEditorByIndex(1), input2);
            assert.strictEqual(group.getEditorByIndex(2), input3);
            await group.closeEditors({ direction: 1 /* CloseDirection.RIGHT */, except: input2 });
            assert.strictEqual(group.count, 2);
            assert.strictEqual(group.getEditorByIndex(0), input1);
            assert.strictEqual(group.getEditorByIndex(1), input2);
        });
        test('closeEditors (direction: right, sticky editor)', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const input1 = createTestFileEditorInput(uri_1.URI.file('foo/bar1'), TEST_EDITOR_INPUT_ID);
            const input2 = createTestFileEditorInput(uri_1.URI.file('foo/bar2'), TEST_EDITOR_INPUT_ID);
            const input3 = createTestFileEditorInput(uri_1.URI.file('foo/bar3'), TEST_EDITOR_INPUT_ID);
            await group.openEditors([
                { editor: input1, options: { pinned: true, sticky: true } },
                { editor: input2, options: { pinned: true } },
                { editor: input3 }
            ]);
            assert.strictEqual(group.count, 3);
            assert.strictEqual(group.stickyCount, 1);
            assert.strictEqual(group.getEditorByIndex(0), input1);
            assert.strictEqual(group.getEditorByIndex(1), input2);
            assert.strictEqual(group.getEditorByIndex(2), input3);
            await group.closeEditors({ direction: 1 /* CloseDirection.RIGHT */, except: input2, excludeSticky: true });
            assert.strictEqual(group.count, 2);
            assert.strictEqual(group.stickyCount, 1);
            assert.strictEqual(group.getEditorByIndex(0), input1);
            assert.strictEqual(group.getEditorByIndex(1), input2);
            await group.closeEditors({ direction: 1 /* CloseDirection.RIGHT */, except: input2 });
            assert.strictEqual(group.count, 2);
            assert.strictEqual(group.getEditorByIndex(0), input1);
            assert.strictEqual(group.getEditorByIndex(1), input2);
        });
        test('closeEditors (direction: left)', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const input1 = createTestFileEditorInput(uri_1.URI.file('foo/bar1'), TEST_EDITOR_INPUT_ID);
            const input2 = createTestFileEditorInput(uri_1.URI.file('foo/bar2'), TEST_EDITOR_INPUT_ID);
            const input3 = createTestFileEditorInput(uri_1.URI.file('foo/bar3'), TEST_EDITOR_INPUT_ID);
            await group.openEditors([
                { editor: input1, options: { pinned: true } },
                { editor: input2, options: { pinned: true } },
                { editor: input3 }
            ]);
            assert.strictEqual(group.count, 3);
            assert.strictEqual(group.getEditorByIndex(0), input1);
            assert.strictEqual(group.getEditorByIndex(1), input2);
            assert.strictEqual(group.getEditorByIndex(2), input3);
            await group.closeEditors({ direction: 0 /* CloseDirection.LEFT */, except: input2 });
            assert.strictEqual(group.count, 2);
            assert.strictEqual(group.getEditorByIndex(0), input2);
            assert.strictEqual(group.getEditorByIndex(1), input3);
        });
        test('closeEditors (direction: left, sticky editor)', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const input1 = createTestFileEditorInput(uri_1.URI.file('foo/bar1'), TEST_EDITOR_INPUT_ID);
            const input2 = createTestFileEditorInput(uri_1.URI.file('foo/bar2'), TEST_EDITOR_INPUT_ID);
            const input3 = createTestFileEditorInput(uri_1.URI.file('foo/bar3'), TEST_EDITOR_INPUT_ID);
            await group.openEditors([
                { editor: input1, options: { pinned: true, sticky: true } },
                { editor: input2, options: { pinned: true } },
                { editor: input3 }
            ]);
            assert.strictEqual(group.count, 3);
            assert.strictEqual(group.stickyCount, 1);
            assert.strictEqual(group.getEditorByIndex(0), input1);
            assert.strictEqual(group.getEditorByIndex(1), input2);
            assert.strictEqual(group.getEditorByIndex(2), input3);
            await group.closeEditors({ direction: 0 /* CloseDirection.LEFT */, except: input2, excludeSticky: true });
            assert.strictEqual(group.count, 3);
            assert.strictEqual(group.stickyCount, 1);
            assert.strictEqual(group.getEditorByIndex(0), input1);
            assert.strictEqual(group.getEditorByIndex(1), input2);
            assert.strictEqual(group.getEditorByIndex(2), input3);
            await group.closeEditors({ direction: 0 /* CloseDirection.LEFT */, except: input2 });
            assert.strictEqual(group.count, 2);
            assert.strictEqual(group.getEditorByIndex(0), input2);
            assert.strictEqual(group.getEditorByIndex(1), input3);
        });
        test('closeAllEditors', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const input = createTestFileEditorInput(uri_1.URI.file('foo/bar'), TEST_EDITOR_INPUT_ID);
            const inputInactive = createTestFileEditorInput(uri_1.URI.file('foo/bar/inactive'), TEST_EDITOR_INPUT_ID);
            await group.openEditors([
                { editor: input, options: { pinned: true } },
                { editor: inputInactive }
            ]);
            assert.strictEqual(group.count, 2);
            assert.strictEqual(group.getEditorByIndex(0), input);
            assert.strictEqual(group.getEditorByIndex(1), inputInactive);
            await group.closeAllEditors();
            assert.strictEqual(group.isEmpty, true);
        });
        test('closeAllEditors - dirty editor handling', async () => {
            const [part, instantiationService] = await createPart();
            let closeResult = true;
            const accessor = instantiationService.createInstance(workbenchTestServices_1.$mec);
            accessor.fileDialogService.setConfirmResult(1 /* ConfirmResult.DONT_SAVE */);
            const group = part.activeGroup;
            const input1 = createTestFileEditorInput(uri_1.URI.file('foo/bar1'), TEST_EDITOR_INPUT_ID);
            input1.dirty = true;
            const input2 = createTestFileEditorInput(uri_1.URI.file('foo/bar2'), TEST_EDITOR_INPUT_ID);
            await group.openEditor(input1);
            await group.openEditor(input2);
            accessor.fileDialogService.setConfirmResult(2 /* ConfirmResult.CANCEL */);
            closeResult = await group.closeAllEditors();
            assert.strictEqual(closeResult, false);
            assert.ok(!input1.gotDisposed);
            assert.ok(!input2.gotDisposed);
            accessor.fileDialogService.setConfirmResult(1 /* ConfirmResult.DONT_SAVE */);
            closeResult = await group.closeAllEditors();
            assert.strictEqual(closeResult, true);
            assert.ok(input1.gotDisposed);
            assert.ok(input2.gotDisposed);
        });
        test('closeAllEditors (sticky editor)', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const input = createTestFileEditorInput(uri_1.URI.file('foo/bar'), TEST_EDITOR_INPUT_ID);
            const inputInactive = createTestFileEditorInput(uri_1.URI.file('foo/bar/inactive'), TEST_EDITOR_INPUT_ID);
            await group.openEditors([
                { editor: input, options: { pinned: true, sticky: true } },
                { editor: inputInactive }
            ]);
            assert.strictEqual(group.count, 2);
            assert.strictEqual(group.stickyCount, 1);
            await group.closeAllEditors({ excludeSticky: true });
            assert.strictEqual(group.count, 1);
            assert.strictEqual(group.stickyCount, 1);
            assert.strictEqual(group.getEditorByIndex(0), input);
            await group.closeAllEditors();
            assert.strictEqual(group.isEmpty, true);
        });
        test('moveEditor (same group)', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const input = createTestFileEditorInput(uri_1.URI.file('foo/bar'), TEST_EDITOR_INPUT_ID);
            const inputInactive = createTestFileEditorInput(uri_1.URI.file('foo/bar/inactive'), TEST_EDITOR_INPUT_ID);
            const moveEvents = [];
            const editorGroupModelChangeListener = group.onDidModelChange(e => {
                if (e.kind === 5 /* GroupModelChangeKind.EDITOR_MOVE */) {
                    assert.ok(e.editor);
                    moveEvents.push(e);
                }
            });
            await group.openEditors([{ editor: input, options: { pinned: true } }, { editor: inputInactive }]);
            assert.strictEqual(group.count, 2);
            assert.strictEqual(group.getEditorByIndex(0), input);
            assert.strictEqual(group.getEditorByIndex(1), inputInactive);
            group.moveEditor(inputInactive, group, { index: 0 });
            assert.strictEqual(moveEvents.length, 1);
            assert.strictEqual(moveEvents[0].editorIndex, 0);
            assert.strictEqual(moveEvents[0].oldEditorIndex, 1);
            assert.strictEqual(moveEvents[0].editor, inputInactive);
            assert.strictEqual(group.getEditorByIndex(0), inputInactive);
            assert.strictEqual(group.getEditorByIndex(1), input);
            group.moveEditors([{ editor: inputInactive, options: { index: 1 } }], group);
            assert.strictEqual(moveEvents.length, 2);
            assert.strictEqual(moveEvents[1].editorIndex, 1);
            assert.strictEqual(moveEvents[1].oldEditorIndex, 0);
            assert.strictEqual(moveEvents[1].editor, inputInactive);
            assert.strictEqual(group.getEditorByIndex(0), input);
            assert.strictEqual(group.getEditorByIndex(1), inputInactive);
            editorGroupModelChangeListener.dispose();
        });
        test('moveEditor (across groups)', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const rightGroup = part.addGroup(group, 3 /* GroupDirection.RIGHT */);
            const input = createTestFileEditorInput(uri_1.URI.file('foo/bar'), TEST_EDITOR_INPUT_ID);
            const inputInactive = createTestFileEditorInput(uri_1.URI.file('foo/bar/inactive'), TEST_EDITOR_INPUT_ID);
            await group.openEditors([{ editor: input, options: { pinned: true } }, { editor: inputInactive }]);
            assert.strictEqual(group.count, 2);
            assert.strictEqual(group.getEditorByIndex(0), input);
            assert.strictEqual(group.getEditorByIndex(1), inputInactive);
            group.moveEditor(inputInactive, rightGroup, { index: 0 });
            assert.strictEqual(group.count, 1);
            assert.strictEqual(group.getEditorByIndex(0), input);
            assert.strictEqual(rightGroup.count, 1);
            assert.strictEqual(rightGroup.getEditorByIndex(0), inputInactive);
        });
        test('moveEditors (across groups)', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const rightGroup = part.addGroup(group, 3 /* GroupDirection.RIGHT */);
            const input1 = createTestFileEditorInput(uri_1.URI.file('foo/bar1'), TEST_EDITOR_INPUT_ID);
            const input2 = createTestFileEditorInput(uri_1.URI.file('foo/bar2'), TEST_EDITOR_INPUT_ID);
            const input3 = createTestFileEditorInput(uri_1.URI.file('foo/bar3'), TEST_EDITOR_INPUT_ID);
            await group.openEditors([{ editor: input1, options: { pinned: true } }, { editor: input2, options: { pinned: true } }, { editor: input3, options: { pinned: true } }]);
            assert.strictEqual(group.getEditorByIndex(0), input1);
            assert.strictEqual(group.getEditorByIndex(1), input2);
            assert.strictEqual(group.getEditorByIndex(2), input3);
            group.moveEditors([{ editor: input2 }, { editor: input3 }], rightGroup);
            assert.strictEqual(group.count, 1);
            assert.strictEqual(rightGroup.count, 2);
            assert.strictEqual(group.getEditorByIndex(0), input1);
            assert.strictEqual(rightGroup.getEditorByIndex(0), input2);
            assert.strictEqual(rightGroup.getEditorByIndex(1), input3);
        });
        test('copyEditor (across groups)', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const rightGroup = part.addGroup(group, 3 /* GroupDirection.RIGHT */);
            const input = createTestFileEditorInput(uri_1.URI.file('foo/bar'), TEST_EDITOR_INPUT_ID);
            const inputInactive = createTestFileEditorInput(uri_1.URI.file('foo/bar/inactive'), TEST_EDITOR_INPUT_ID);
            await group.openEditors([{ editor: input, options: { pinned: true } }, { editor: inputInactive }]);
            assert.strictEqual(group.count, 2);
            assert.strictEqual(group.getEditorByIndex(0), input);
            assert.strictEqual(group.getEditorByIndex(1), inputInactive);
            group.copyEditor(inputInactive, rightGroup, { index: 0 });
            assert.strictEqual(group.count, 2);
            assert.strictEqual(group.getEditorByIndex(0), input);
            assert.strictEqual(group.getEditorByIndex(1), inputInactive);
            assert.strictEqual(rightGroup.count, 1);
            assert.strictEqual(rightGroup.getEditorByIndex(0), inputInactive);
        });
        test('copyEditors (across groups)', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const rightGroup = part.addGroup(group, 3 /* GroupDirection.RIGHT */);
            const input1 = createTestFileEditorInput(uri_1.URI.file('foo/bar1'), TEST_EDITOR_INPUT_ID);
            const input2 = createTestFileEditorInput(uri_1.URI.file('foo/bar2'), TEST_EDITOR_INPUT_ID);
            const input3 = createTestFileEditorInput(uri_1.URI.file('foo/bar3'), TEST_EDITOR_INPUT_ID);
            await group.openEditors([{ editor: input1, options: { pinned: true } }, { editor: input2, options: { pinned: true } }, { editor: input3, options: { pinned: true } }]);
            assert.strictEqual(group.getEditorByIndex(0), input1);
            assert.strictEqual(group.getEditorByIndex(1), input2);
            assert.strictEqual(group.getEditorByIndex(2), input3);
            group.copyEditors([{ editor: input1 }, { editor: input2 }, { editor: input3 }], rightGroup);
            [group, rightGroup].forEach(group => {
                assert.strictEqual(group.getEditorByIndex(0), input1);
                assert.strictEqual(group.getEditorByIndex(1), input2);
                assert.strictEqual(group.getEditorByIndex(2), input3);
            });
        });
        test('replaceEditors', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const input = createTestFileEditorInput(uri_1.URI.file('foo/bar'), TEST_EDITOR_INPUT_ID);
            const inputInactive = createTestFileEditorInput(uri_1.URI.file('foo/bar/inactive'), TEST_EDITOR_INPUT_ID);
            await group.openEditor(input);
            assert.strictEqual(group.count, 1);
            assert.strictEqual(group.getEditorByIndex(0), input);
            await group.replaceEditors([{ editor: input, replacement: inputInactive }]);
            assert.strictEqual(group.count, 1);
            assert.strictEqual(group.getEditorByIndex(0), inputInactive);
        });
        test('replaceEditors - dirty editor handling', async () => {
            const [part, instantiationService] = await createPart();
            const accessor = instantiationService.createInstance(workbenchTestServices_1.$mec);
            accessor.fileDialogService.setConfirmResult(1 /* ConfirmResult.DONT_SAVE */);
            const group = part.activeGroup;
            const input1 = createTestFileEditorInput(uri_1.URI.file('foo/bar1'), TEST_EDITOR_INPUT_ID);
            input1.dirty = true;
            const input2 = createTestFileEditorInput(uri_1.URI.file('foo/bar2'), TEST_EDITOR_INPUT_ID);
            await group.openEditor(input1);
            assert.strictEqual(group.activeEditor, input1);
            accessor.fileDialogService.setConfirmResult(2 /* ConfirmResult.CANCEL */);
            await group.replaceEditors([{ editor: input1, replacement: input2 }]);
            assert.strictEqual(group.activeEditor, input1);
            assert.ok(!input1.gotDisposed);
            accessor.fileDialogService.setConfirmResult(1 /* ConfirmResult.DONT_SAVE */);
            await group.replaceEditors([{ editor: input1, replacement: input2 }]);
            assert.strictEqual(group.activeEditor, input2);
            assert.ok(input1.gotDisposed);
        });
        test('replaceEditors - forceReplaceDirty flag', async () => {
            const [part, instantiationService] = await createPart();
            const accessor = instantiationService.createInstance(workbenchTestServices_1.$mec);
            accessor.fileDialogService.setConfirmResult(1 /* ConfirmResult.DONT_SAVE */);
            const group = part.activeGroup;
            const input1 = createTestFileEditorInput(uri_1.URI.file('foo/bar1'), TEST_EDITOR_INPUT_ID);
            input1.dirty = true;
            const input2 = createTestFileEditorInput(uri_1.URI.file('foo/bar2'), TEST_EDITOR_INPUT_ID);
            await group.openEditor(input1);
            assert.strictEqual(group.activeEditor, input1);
            accessor.fileDialogService.setConfirmResult(2 /* ConfirmResult.CANCEL */);
            await group.replaceEditors([{ editor: input1, replacement: input2, forceReplaceDirty: false }]);
            assert.strictEqual(group.activeEditor, input1);
            assert.ok(!input1.gotDisposed);
            await group.replaceEditors([{ editor: input1, replacement: input2, forceReplaceDirty: true }]);
            assert.strictEqual(group.activeEditor, input2);
            assert.ok(input1.gotDisposed);
        });
        test('replaceEditors - proper index handling', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const input1 = createTestFileEditorInput(uri_1.URI.file('foo/bar1'), TEST_EDITOR_INPUT_ID);
            const input2 = createTestFileEditorInput(uri_1.URI.file('foo/bar2'), TEST_EDITOR_INPUT_ID);
            const input3 = createTestFileEditorInput(uri_1.URI.file('foo/bar3'), TEST_EDITOR_INPUT_ID);
            const input4 = createTestFileEditorInput(uri_1.URI.file('foo/bar4'), TEST_EDITOR_INPUT_ID);
            const input5 = createTestFileEditorInput(uri_1.URI.file('foo/bar5'), TEST_EDITOR_INPUT_ID);
            const input6 = createTestFileEditorInput(uri_1.URI.file('foo/bar6'), TEST_EDITOR_INPUT_ID);
            const input7 = createTestFileEditorInput(uri_1.URI.file('foo/bar7'), TEST_EDITOR_INPUT_ID);
            const input8 = createTestFileEditorInput(uri_1.URI.file('foo/bar8'), TEST_EDITOR_INPUT_ID);
            await group.openEditor(input1, { pinned: true });
            await group.openEditor(input2, { pinned: true });
            await group.openEditor(input3, { pinned: true });
            await group.openEditor(input4, { pinned: true });
            await group.openEditor(input5, { pinned: true });
            await group.replaceEditors([
                { editor: input1, replacement: input6 },
                { editor: input3, replacement: input7 },
                { editor: input5, replacement: input8 }
            ]);
            assert.strictEqual(group.getEditorByIndex(0), input6);
            assert.strictEqual(group.getEditorByIndex(1), input2);
            assert.strictEqual(group.getEditorByIndex(2), input7);
            assert.strictEqual(group.getEditorByIndex(3), input4);
            assert.strictEqual(group.getEditorByIndex(4), input8);
        });
        test('replaceEditors - should be able to replace when side by side editor is involved with same input side by side', async () => {
            const [part, instantiationService] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const input = createTestFileEditorInput(uri_1.URI.file('foo/bar'), TEST_EDITOR_INPUT_ID);
            const sideBySideInput = instantiationService.createInstance(sideBySideEditorInput_1.$VC, undefined, undefined, input, input);
            await group.openEditor(input);
            assert.strictEqual(group.count, 1);
            assert.strictEqual(group.getEditorByIndex(0), input);
            await group.replaceEditors([{ editor: input, replacement: sideBySideInput }]);
            assert.strictEqual(group.count, 1);
            assert.strictEqual(group.getEditorByIndex(0), sideBySideInput);
            await group.replaceEditors([{ editor: sideBySideInput, replacement: input }]);
            assert.strictEqual(group.count, 1);
            assert.strictEqual(group.getEditorByIndex(0), input);
        });
        test('find editors', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            const group2 = part.addGroup(group, 3 /* GroupDirection.RIGHT */);
            assert.strictEqual(group.isEmpty, true);
            const input1 = createTestFileEditorInput(uri_1.URI.file('foo/bar1'), TEST_EDITOR_INPUT_ID);
            const input2 = createTestFileEditorInput(uri_1.URI.file('foo/bar1'), `${TEST_EDITOR_INPUT_ID}-1`);
            const input3 = createTestFileEditorInput(uri_1.URI.file('foo/bar3'), TEST_EDITOR_INPUT_ID);
            const input4 = createTestFileEditorInput(uri_1.URI.file('foo/bar4'), TEST_EDITOR_INPUT_ID);
            const input5 = createTestFileEditorInput(uri_1.URI.file('foo/bar4'), `${TEST_EDITOR_INPUT_ID}-1`);
            await group.openEditor(input1, { pinned: true });
            await group.openEditor(input2, { pinned: true });
            await group.openEditor(input3, { pinned: true });
            await group.openEditor(input4, { pinned: true });
            await group2.openEditor(input5, { pinned: true });
            let foundEditors = group.findEditors(uri_1.URI.file('foo/bar1'));
            assert.strictEqual(foundEditors.length, 2);
            foundEditors = group2.findEditors(uri_1.URI.file('foo/bar4'));
            assert.strictEqual(foundEditors.length, 1);
        });
        test('find editors (side by side support)', async () => {
            const [part, instantiationService] = await createPart();
            const accessor = instantiationService.createInstance(workbenchTestServices_1.$mec);
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const secondaryInput = createTestFileEditorInput(uri_1.URI.file('foo/bar-secondary'), TEST_EDITOR_INPUT_ID);
            const primaryInput = createTestFileEditorInput(uri_1.URI.file('foo/bar-primary'), `${TEST_EDITOR_INPUT_ID}-1`);
            const sideBySideEditor = new sideBySideEditorInput_1.$VC(undefined, undefined, secondaryInput, primaryInput, accessor.editorService);
            await group.openEditor(sideBySideEditor, { pinned: true });
            let foundEditors = group.findEditors(uri_1.URI.file('foo/bar-secondary'));
            assert.strictEqual(foundEditors.length, 0);
            foundEditors = group.findEditors(uri_1.URI.file('foo/bar-secondary'), { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            assert.strictEqual(foundEditors.length, 0);
            foundEditors = group.findEditors(uri_1.URI.file('foo/bar-primary'), { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            assert.strictEqual(foundEditors.length, 1);
            foundEditors = group.findEditors(uri_1.URI.file('foo/bar-secondary'), { supportSideBySide: editor_1.SideBySideEditor.SECONDARY });
            assert.strictEqual(foundEditors.length, 1);
            foundEditors = group.findEditors(uri_1.URI.file('foo/bar-primary'), { supportSideBySide: editor_1.SideBySideEditor.SECONDARY });
            assert.strictEqual(foundEditors.length, 0);
            foundEditors = group.findEditors(uri_1.URI.file('foo/bar-secondary'), { supportSideBySide: editor_1.SideBySideEditor.ANY });
            assert.strictEqual(foundEditors.length, 1);
            foundEditors = group.findEditors(uri_1.URI.file('foo/bar-primary'), { supportSideBySide: editor_1.SideBySideEditor.ANY });
            assert.strictEqual(foundEditors.length, 1);
        });
        test('find neighbour group (left/right)', async function () {
            const [part] = await createPart();
            const rootGroup = part.activeGroup;
            const rightGroup = part.addGroup(rootGroup, 3 /* GroupDirection.RIGHT */);
            assert.strictEqual(rightGroup, part.findGroup({ direction: 3 /* GroupDirection.RIGHT */ }, rootGroup));
            assert.strictEqual(rootGroup, part.findGroup({ direction: 2 /* GroupDirection.LEFT */ }, rightGroup));
        });
        test('find neighbour group (up/down)', async function () {
            const [part] = await createPart();
            const rootGroup = part.activeGroup;
            const downGroup = part.addGroup(rootGroup, 1 /* GroupDirection.DOWN */);
            assert.strictEqual(downGroup, part.findGroup({ direction: 1 /* GroupDirection.DOWN */ }, rootGroup));
            assert.strictEqual(rootGroup, part.findGroup({ direction: 0 /* GroupDirection.UP */ }, downGroup));
        });
        test('find group by location (left/right)', async function () {
            const [part] = await createPart();
            const rootGroup = part.activeGroup;
            const rightGroup = part.addGroup(rootGroup, 3 /* GroupDirection.RIGHT */);
            const downGroup = part.addGroup(rightGroup, 1 /* GroupDirection.DOWN */);
            assert.strictEqual(rootGroup, part.findGroup({ location: 0 /* GroupLocation.FIRST */ }));
            assert.strictEqual(downGroup, part.findGroup({ location: 1 /* GroupLocation.LAST */ }));
            assert.strictEqual(rightGroup, part.findGroup({ location: 2 /* GroupLocation.NEXT */ }, rootGroup));
            assert.strictEqual(rootGroup, part.findGroup({ location: 3 /* GroupLocation.PREVIOUS */ }, rightGroup));
            assert.strictEqual(downGroup, part.findGroup({ location: 2 /* GroupLocation.NEXT */ }, rightGroup));
            assert.strictEqual(rightGroup, part.findGroup({ location: 3 /* GroupLocation.PREVIOUS */ }, downGroup));
        });
        test('applyLayout (2x2)', async function () {
            const [part] = await createPart();
            part.applyLayout({ groups: [{ groups: [{}, {}] }, { groups: [{}, {}] }], orientation: 0 /* GroupOrientation.HORIZONTAL */ });
            assert.strictEqual(part.groups.length, 4);
        });
        test('getLayout', async function () {
            const [part] = await createPart();
            // 2x2
            part.applyLayout({ groups: [{ groups: [{}, {}] }, { groups: [{}, {}] }], orientation: 0 /* GroupOrientation.HORIZONTAL */ });
            let layout = part.getLayout();
            assert.strictEqual(layout.orientation, 0 /* GroupOrientation.HORIZONTAL */);
            assert.strictEqual(layout.groups.length, 2);
            assert.strictEqual(layout.groups[0].groups.length, 2);
            assert.strictEqual(layout.groups[1].groups.length, 2);
            // 3 columns
            part.applyLayout({ groups: [{}, {}, {}], orientation: 1 /* GroupOrientation.VERTICAL */ });
            layout = part.getLayout();
            assert.strictEqual(layout.orientation, 1 /* GroupOrientation.VERTICAL */);
            assert.strictEqual(layout.groups.length, 3);
            assert.ok(typeof layout.groups[0].size === 'number');
            assert.ok(typeof layout.groups[1].size === 'number');
            assert.ok(typeof layout.groups[2].size === 'number');
        });
        test('centeredLayout', async function () {
            const [part] = await createPart();
            part.centerLayout(true);
            assert.strictEqual(part.isLayoutCentered(), true);
        });
        test('sticky editors', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.stickyCount, 0);
            assert.strictEqual(group.getEditors(1 /* EditorsOrder.SEQUENTIAL */).length, 0);
            assert.strictEqual(group.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */).length, 0);
            assert.strictEqual(group.getEditors(1 /* EditorsOrder.SEQUENTIAL */, { excludeSticky: true }).length, 0);
            assert.strictEqual(group.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */, { excludeSticky: true }).length, 0);
            const input = createTestFileEditorInput(uri_1.URI.file('foo/bar'), TEST_EDITOR_INPUT_ID);
            const inputInactive = createTestFileEditorInput(uri_1.URI.file('foo/bar/inactive'), TEST_EDITOR_INPUT_ID);
            await group.openEditor(input, { pinned: true });
            await group.openEditor(inputInactive, { inactive: true });
            assert.strictEqual(group.stickyCount, 0);
            assert.strictEqual(group.isSticky(input), false);
            assert.strictEqual(group.isSticky(inputInactive), false);
            assert.strictEqual(group.getEditors(1 /* EditorsOrder.SEQUENTIAL */).length, 2);
            assert.strictEqual(group.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */).length, 2);
            assert.strictEqual(group.getEditors(1 /* EditorsOrder.SEQUENTIAL */, { excludeSticky: true }).length, 2);
            assert.strictEqual(group.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */, { excludeSticky: true }).length, 2);
            group.stickEditor(input);
            assert.strictEqual(group.stickyCount, 1);
            assert.strictEqual(group.isSticky(input), true);
            assert.strictEqual(group.isSticky(inputInactive), false);
            assert.strictEqual(group.getEditors(1 /* EditorsOrder.SEQUENTIAL */).length, 2);
            assert.strictEqual(group.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */).length, 2);
            assert.strictEqual(group.getEditors(1 /* EditorsOrder.SEQUENTIAL */, { excludeSticky: true }).length, 1);
            assert.strictEqual(group.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */, { excludeSticky: true }).length, 1);
            group.unstickEditor(input);
            assert.strictEqual(group.stickyCount, 0);
            assert.strictEqual(group.isSticky(input), false);
            assert.strictEqual(group.isSticky(inputInactive), false);
            assert.strictEqual(group.getIndexOfEditor(input), 0);
            assert.strictEqual(group.getIndexOfEditor(inputInactive), 1);
            assert.strictEqual(group.getEditors(1 /* EditorsOrder.SEQUENTIAL */).length, 2);
            assert.strictEqual(group.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */).length, 2);
            assert.strictEqual(group.getEditors(1 /* EditorsOrder.SEQUENTIAL */, { excludeSticky: true }).length, 2);
            assert.strictEqual(group.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */, { excludeSticky: true }).length, 2);
            let editorMoveCounter = 0;
            const editorGroupModelChangeListener = group.onDidModelChange(e => {
                if (e.kind === 5 /* GroupModelChangeKind.EDITOR_MOVE */) {
                    assert.ok(e.editor);
                    editorMoveCounter++;
                }
            });
            group.stickEditor(inputInactive);
            assert.strictEqual(group.stickyCount, 1);
            assert.strictEqual(group.isSticky(input), false);
            assert.strictEqual(group.isSticky(inputInactive), true);
            assert.strictEqual(group.getIndexOfEditor(input), 1);
            assert.strictEqual(group.getIndexOfEditor(inputInactive), 0);
            assert.strictEqual(editorMoveCounter, 1);
            assert.strictEqual(group.getEditors(1 /* EditorsOrder.SEQUENTIAL */).length, 2);
            assert.strictEqual(group.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */).length, 2);
            assert.strictEqual(group.getEditors(1 /* EditorsOrder.SEQUENTIAL */, { excludeSticky: true }).length, 1);
            assert.strictEqual(group.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */, { excludeSticky: true }).length, 1);
            const inputSticky = createTestFileEditorInput(uri_1.URI.file('foo/bar/sticky'), TEST_EDITOR_INPUT_ID);
            await group.openEditor(inputSticky, { sticky: true });
            assert.strictEqual(group.stickyCount, 2);
            assert.strictEqual(group.isSticky(input), false);
            assert.strictEqual(group.isSticky(inputInactive), true);
            assert.strictEqual(group.isSticky(inputSticky), true);
            assert.strictEqual(group.getIndexOfEditor(inputInactive), 0);
            assert.strictEqual(group.getIndexOfEditor(inputSticky), 1);
            assert.strictEqual(group.getIndexOfEditor(input), 2);
            await group.openEditor(input, { sticky: true });
            assert.strictEqual(group.stickyCount, 3);
            assert.strictEqual(group.isSticky(input), true);
            assert.strictEqual(group.isSticky(inputInactive), true);
            assert.strictEqual(group.isSticky(inputSticky), true);
            assert.strictEqual(group.getIndexOfEditor(inputInactive), 0);
            assert.strictEqual(group.getIndexOfEditor(inputSticky), 1);
            assert.strictEqual(group.getIndexOfEditor(input), 2);
            editorGroupModelChangeListener.dispose();
        });
        test('moveEditor with context (across groups)', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const rightGroup = part.addGroup(group, 3 /* GroupDirection.RIGHT */);
            const input = createTestFileEditorInput(uri_1.URI.file('foo/bar'), TEST_EDITOR_INPUT_ID);
            const inputInactive = createTestFileEditorInput(uri_1.URI.file('foo/bar/inactive'), TEST_EDITOR_INPUT_ID);
            const thirdInput = createTestFileEditorInput(uri_1.URI.file('foo/bar/third'), TEST_EDITOR_INPUT_ID);
            let leftFiredCount = 0;
            const leftGroupListener = group.onWillMoveEditor(() => {
                leftFiredCount++;
            });
            let rightFiredCount = 0;
            const rightGroupListener = rightGroup.onWillMoveEditor(() => {
                rightFiredCount++;
            });
            await group.openEditors([{ editor: input, options: { pinned: true } }, { editor: inputInactive }, { editor: thirdInput }]);
            assert.strictEqual(leftFiredCount, 0);
            assert.strictEqual(rightFiredCount, 0);
            group.moveEditor(input, rightGroup);
            assert.strictEqual(leftFiredCount, 1);
            assert.strictEqual(rightFiredCount, 0);
            group.moveEditor(inputInactive, rightGroup);
            assert.strictEqual(leftFiredCount, 2);
            assert.strictEqual(rightFiredCount, 0);
            rightGroup.moveEditor(inputInactive, group);
            assert.strictEqual(leftFiredCount, 2);
            assert.strictEqual(rightFiredCount, 1);
            leftGroupListener.dispose();
            rightGroupListener.dispose();
        });
        test('onWillOpenEditor', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const rightGroup = part.addGroup(group, 3 /* GroupDirection.RIGHT */);
            const input = createTestFileEditorInput(uri_1.URI.file('foo/bar'), TEST_EDITOR_INPUT_ID);
            const secondInput = createTestFileEditorInput(uri_1.URI.file('foo/bar/second'), TEST_EDITOR_INPUT_ID);
            const thirdInput = createTestFileEditorInput(uri_1.URI.file('foo/bar/third'), TEST_EDITOR_INPUT_ID);
            let leftFiredCount = 0;
            const leftGroupListener = group.onWillOpenEditor(() => {
                leftFiredCount++;
            });
            let rightFiredCount = 0;
            const rightGroupListener = rightGroup.onWillOpenEditor(() => {
                rightFiredCount++;
            });
            await group.openEditor(input);
            assert.strictEqual(leftFiredCount, 1);
            assert.strictEqual(rightFiredCount, 0);
            rightGroup.openEditor(secondInput);
            assert.strictEqual(leftFiredCount, 1);
            assert.strictEqual(rightFiredCount, 1);
            group.openEditor(thirdInput);
            assert.strictEqual(leftFiredCount, 2);
            assert.strictEqual(rightFiredCount, 1);
            // Ensure move fires the open event too
            rightGroup.moveEditor(secondInput, group);
            assert.strictEqual(leftFiredCount, 3);
            assert.strictEqual(rightFiredCount, 1);
            leftGroupListener.dispose();
            rightGroupListener.dispose();
        });
        test('copyEditor with context (across groups)', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            let firedCount = 0;
            const moveListener = group.onWillMoveEditor(() => firedCount++);
            const rightGroup = part.addGroup(group, 3 /* GroupDirection.RIGHT */);
            const input = createTestFileEditorInput(uri_1.URI.file('foo/bar'), TEST_EDITOR_INPUT_ID);
            const inputInactive = createTestFileEditorInput(uri_1.URI.file('foo/bar/inactive'), TEST_EDITOR_INPUT_ID);
            await group.openEditors([{ editor: input, options: { pinned: true } }, { editor: inputInactive }]);
            assert.strictEqual(firedCount, 0);
            group.copyEditor(inputInactive, rightGroup, { index: 0 });
            assert.strictEqual(firedCount, 0);
            moveListener.dispose();
        });
        test('locked groups - basics', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            const rightGroup = part.addGroup(group, 3 /* GroupDirection.RIGHT */);
            let leftFiredCountFromPart = 0;
            let rightFiredCountFromPart = 0;
            const partListener = part.onDidChangeGroupLocked(g => {
                if (g === group) {
                    leftFiredCountFromPart++;
                }
                else if (g === rightGroup) {
                    rightFiredCountFromPart++;
                }
            });
            let leftFiredCountFromGroup = 0;
            const leftGroupListener = group.onDidModelChange(e => {
                if (e.kind === 2 /* GroupModelChangeKind.GROUP_LOCKED */) {
                    leftFiredCountFromGroup++;
                }
            });
            let rightFiredCountFromGroup = 0;
            const rightGroupListener = rightGroup.onDidModelChange(e => {
                if (e.kind === 2 /* GroupModelChangeKind.GROUP_LOCKED */) {
                    rightFiredCountFromGroup++;
                }
            });
            rightGroup.lock(true);
            rightGroup.lock(true);
            assert.strictEqual(leftFiredCountFromGroup, 0);
            assert.strictEqual(leftFiredCountFromPart, 0);
            assert.strictEqual(rightFiredCountFromGroup, 1);
            assert.strictEqual(rightFiredCountFromPart, 1);
            rightGroup.lock(false);
            rightGroup.lock(false);
            assert.strictEqual(leftFiredCountFromGroup, 0);
            assert.strictEqual(leftFiredCountFromPart, 0);
            assert.strictEqual(rightFiredCountFromGroup, 2);
            assert.strictEqual(rightFiredCountFromPart, 2);
            group.lock(true);
            group.lock(true);
            assert.strictEqual(leftFiredCountFromGroup, 1);
            assert.strictEqual(leftFiredCountFromPart, 1);
            assert.strictEqual(rightFiredCountFromGroup, 2);
            assert.strictEqual(rightFiredCountFromPart, 2);
            group.lock(false);
            group.lock(false);
            assert.strictEqual(leftFiredCountFromGroup, 2);
            assert.strictEqual(leftFiredCountFromPart, 2);
            assert.strictEqual(rightFiredCountFromGroup, 2);
            assert.strictEqual(rightFiredCountFromPart, 2);
            partListener.dispose();
            leftGroupListener.dispose();
            rightGroupListener.dispose();
        });
        test('locked groups - single group is never locked', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            group.lock(true);
            assert.strictEqual(group.isLocked, false);
            const rightGroup = part.addGroup(group, 3 /* GroupDirection.RIGHT */);
            rightGroup.lock(true);
            assert.strictEqual(rightGroup.isLocked, true);
            part.removeGroup(group);
            assert.strictEqual(rightGroup.isLocked, false);
            const rightGroup2 = part.addGroup(rightGroup, 3 /* GroupDirection.RIGHT */);
            rightGroup.lock(true);
            rightGroup2.lock(true);
            assert.strictEqual(rightGroup.isLocked, true);
            assert.strictEqual(rightGroup2.isLocked, true);
            part.removeGroup(rightGroup2);
            assert.strictEqual(rightGroup.isLocked, false);
        });
        test('locked groups - auto locking via setting', async () => {
            const instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            const configurationService = new testConfigurationService_1.$G0b();
            await configurationService.setUserConfiguration('workbench', { 'editor': { 'autoLockGroups': { 'testEditorInputForEditorGroupService': true } } });
            instantiationService.stub(configuration_1.$8h, configurationService);
            const [part] = await createPart(instantiationService);
            const rootGroup = part.activeGroup;
            let rightGroup = part.addGroup(rootGroup, 3 /* GroupDirection.RIGHT */);
            let input1 = createTestFileEditorInput(uri_1.URI.file('foo/bar1'), TEST_EDITOR_INPUT_ID);
            let input2 = createTestFileEditorInput(uri_1.URI.file('foo/bar2'), TEST_EDITOR_INPUT_ID);
            // First editor opens in right group: Locked=true
            await rightGroup.openEditor(input1, { pinned: true });
            assert.strictEqual(rightGroup.isLocked, true);
            // Second editors opens in now unlocked right group: Locked=false
            rightGroup.lock(false);
            await rightGroup.openEditor(input2, { pinned: true });
            assert.strictEqual(rightGroup.isLocked, false);
            //First editor opens in root group without other groups being opened: Locked=false
            await rightGroup.closeAllEditors();
            part.removeGroup(rightGroup);
            await rootGroup.closeAllEditors();
            input1 = createTestFileEditorInput(uri_1.URI.file('foo/bar1'), TEST_EDITOR_INPUT_ID);
            input2 = createTestFileEditorInput(uri_1.URI.file('foo/bar2'), TEST_EDITOR_INPUT_ID);
            await rootGroup.openEditor(input1, { pinned: true });
            assert.strictEqual(rootGroup.isLocked, false);
            rightGroup = part.addGroup(rootGroup, 3 /* GroupDirection.RIGHT */);
            assert.strictEqual(rootGroup.isLocked, false);
            const leftGroup = part.addGroup(rootGroup, 2 /* GroupDirection.LEFT */);
            assert.strictEqual(rootGroup.isLocked, false);
            part.removeGroup(leftGroup);
            assert.strictEqual(rootGroup.isLocked, false);
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=editorGroupsService.test.js.map