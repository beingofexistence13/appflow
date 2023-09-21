/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/base/common/uri", "vs/workbench/test/browser/workbenchTestServices", "vs/platform/instantiation/common/descriptors", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/history/browser/historyService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/editor/browser/editorService", "vs/base/common/lifecycle", "vs/workbench/services/history/common/history", "vs/base/common/async", "vs/base/common/event", "vs/workbench/common/editor", "vs/workbench/common/editor/editorInput", "vs/platform/files/common/files", "vs/base/common/platform", "vs/editor/common/core/selection", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/configuration/common/configuration"], function (require, exports, assert, utils_1, uri_1, workbenchTestServices_1, descriptors_1, editorGroupsService_1, historyService_1, editorService_1, editorService_2, lifecycle_1, history_1, async_1, event_1, editor_1, editorInput_1, files_1, platform_1, selection_1, testConfigurationService_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('HistoryService', function () {
        const TEST_EDITOR_ID = 'MyTestEditorForEditorHistory';
        const TEST_EDITOR_INPUT_ID = 'testEditorInputForHistoyService';
        async function createServices(scope = 0 /* GoScope.DEFAULT */) {
            const instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, disposables);
            const part = await (0, workbenchTestServices_1.createEditorPart)(instantiationService, disposables);
            instantiationService.stub(editorGroupsService_1.IEditorGroupsService, part);
            const editorService = disposables.add(instantiationService.createInstance(editorService_2.EditorService));
            instantiationService.stub(editorService_1.IEditorService, editorService);
            const configurationService = new testConfigurationService_1.TestConfigurationService();
            if (scope === 1 /* GoScope.EDITOR_GROUP */) {
                configurationService.setUserConfiguration('workbench.editor.navigationScope', 'editorGroup');
            }
            else if (scope === 2 /* GoScope.EDITOR */) {
                configurationService.setUserConfiguration('workbench.editor.navigationScope', 'editor');
            }
            instantiationService.stub(configuration_1.IConfigurationService, configurationService);
            const historyService = disposables.add(instantiationService.createInstance(historyService_1.HistoryService));
            instantiationService.stub(history_1.IHistoryService, historyService);
            const accessor = instantiationService.createInstance(workbenchTestServices_1.TestServiceAccessor);
            return [part, historyService, editorService, accessor.textFileService, instantiationService];
        }
        const disposables = new lifecycle_1.DisposableStore();
        setup(() => {
            disposables.add((0, workbenchTestServices_1.registerTestEditor)(TEST_EDITOR_ID, [new descriptors_1.SyncDescriptor(workbenchTestServices_1.TestFileEditorInput)]));
            disposables.add((0, workbenchTestServices_1.registerTestFileEditor)());
        });
        teardown(() => {
            disposables.clear();
        });
        test('back / forward: basics', async () => {
            const [part, historyService] = await createServices();
            const input1 = disposables.add(new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('foo://bar1'), TEST_EDITOR_INPUT_ID));
            await part.activeGroup.openEditor(input1, { pinned: true });
            assert.strictEqual(part.activeGroup.activeEditor, input1);
            const input2 = disposables.add(new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('foo://bar2'), TEST_EDITOR_INPUT_ID));
            await part.activeGroup.openEditor(input2, { pinned: true });
            assert.strictEqual(part.activeGroup.activeEditor, input2);
            await historyService.goBack();
            assert.strictEqual(part.activeGroup.activeEditor, input1);
            await historyService.goForward();
            assert.strictEqual(part.activeGroup.activeEditor, input2);
        });
        test('back / forward: is editor group aware', async function () {
            const [part, historyService, editorService, , instantiationService] = await createServices();
            const resource = utils_1.toResource.call(this, '/path/index.txt');
            const otherResource = utils_1.toResource.call(this, '/path/other.html');
            const pane1 = await editorService.openEditor({ resource, options: { pinned: true } });
            const pane2 = await editorService.openEditor({ resource, options: { pinned: true } }, editorService_1.SIDE_GROUP);
            // [index.txt] | [>index.txt<]
            assert.notStrictEqual(pane1, pane2);
            await editorService.openEditor({ resource: otherResource, options: { pinned: true } }, pane2?.group);
            // [index.txt] | [index.txt] [>other.html<]
            await historyService.goBack();
            // [index.txt] | [>index.txt<] [other.html]
            assert.strictEqual(part.activeGroup.id, pane2?.group?.id);
            assert.strictEqual(part.activeGroup.activeEditor?.resource?.toString(), resource.toString());
            await historyService.goBack();
            // [>index.txt<] | [index.txt] [other.html]
            assert.strictEqual(part.activeGroup.id, pane1?.group?.id);
            assert.strictEqual(part.activeGroup.activeEditor?.resource?.toString(), resource.toString());
            await historyService.goForward();
            // [index.txt] | [>index.txt<] [other.html]
            assert.strictEqual(part.activeGroup.id, pane2?.group?.id);
            assert.strictEqual(part.activeGroup.activeEditor?.resource?.toString(), resource.toString());
            await historyService.goForward();
            // [index.txt] | [index.txt] [>other.html<]
            assert.strictEqual(part.activeGroup.id, pane2?.group?.id);
            assert.strictEqual(part.activeGroup.activeEditor?.resource?.toString(), otherResource.toString());
            return (0, workbenchTestServices_1.workbenchTeardown)(instantiationService);
        });
        test('back / forward: in-editor text selection changes (user)', async function () {
            const [, historyService, editorService, , instantiationService] = await createServices();
            const resource = utils_1.toResource.call(this, '/path/index.txt');
            const pane = await editorService.openEditor({ resource, options: { pinned: true } });
            await setTextSelection(historyService, pane, new selection_1.Selection(1, 2, 1, 2));
            await setTextSelection(historyService, pane, new selection_1.Selection(15, 1, 15, 1)); // will be merged and dropped
            await setTextSelection(historyService, pane, new selection_1.Selection(16, 1, 16, 1)); // will be merged and dropped
            await setTextSelection(historyService, pane, new selection_1.Selection(17, 1, 17, 1));
            await setTextSelection(historyService, pane, new selection_1.Selection(30, 5, 30, 8));
            await setTextSelection(historyService, pane, new selection_1.Selection(40, 1, 40, 1));
            await historyService.goBack(0 /* GoFilter.NONE */);
            assertTextSelection(new selection_1.Selection(30, 5, 30, 8), pane);
            await historyService.goBack(0 /* GoFilter.NONE */);
            assertTextSelection(new selection_1.Selection(17, 1, 17, 1), pane);
            await historyService.goBack(0 /* GoFilter.NONE */);
            assertTextSelection(new selection_1.Selection(1, 2, 1, 2), pane);
            await historyService.goForward(0 /* GoFilter.NONE */);
            assertTextSelection(new selection_1.Selection(17, 1, 17, 1), pane);
            return (0, workbenchTestServices_1.workbenchTeardown)(instantiationService);
        });
        test('back / forward: in-editor text selection changes (navigation)', async function () {
            const [, historyService, editorService, , instantiationService] = await createServices();
            const resource = utils_1.toResource.call(this, '/path/index.txt');
            const pane = await editorService.openEditor({ resource, options: { pinned: true } });
            await setTextSelection(historyService, pane, new selection_1.Selection(2, 2, 2, 10)); // this is our starting point
            await setTextSelection(historyService, pane, new selection_1.Selection(5, 3, 5, 20), 4 /* EditorPaneSelectionChangeReason.NAVIGATION */); // this is our first target definition
            await setTextSelection(historyService, pane, new selection_1.Selection(120, 8, 120, 18), 4 /* EditorPaneSelectionChangeReason.NAVIGATION */); // this is our second target definition
            await setTextSelection(historyService, pane, new selection_1.Selection(300, 3, 300, 20)); // unrelated user navigation
            await setTextSelection(historyService, pane, new selection_1.Selection(500, 3, 500, 20)); // unrelated user navigation
            await setTextSelection(historyService, pane, new selection_1.Selection(200, 3, 200, 20)); // unrelated user navigation
            await historyService.goBack(2 /* GoFilter.NAVIGATION */); // this should reveal the last navigation entry because we are not at it currently
            assertTextSelection(new selection_1.Selection(120, 8, 120, 18), pane);
            await historyService.goBack(2 /* GoFilter.NAVIGATION */);
            assertTextSelection(new selection_1.Selection(5, 3, 5, 20), pane);
            await historyService.goBack(2 /* GoFilter.NAVIGATION */);
            assertTextSelection(new selection_1.Selection(5, 3, 5, 20), pane);
            await historyService.goForward(2 /* GoFilter.NAVIGATION */);
            assertTextSelection(new selection_1.Selection(120, 8, 120, 18), pane);
            await historyService.goPrevious(2 /* GoFilter.NAVIGATION */);
            assertTextSelection(new selection_1.Selection(5, 3, 5, 20), pane);
            await historyService.goPrevious(2 /* GoFilter.NAVIGATION */);
            assertTextSelection(new selection_1.Selection(120, 8, 120, 18), pane);
            return (0, workbenchTestServices_1.workbenchTeardown)(instantiationService);
        });
        test('back / forward: in-editor text selection changes (jump)', async function () {
            const [, historyService, editorService, , instantiationService] = await createServices();
            const resource = utils_1.toResource.call(this, '/path/index.txt');
            const pane = await editorService.openEditor({ resource, options: { pinned: true } });
            await setTextSelection(historyService, pane, new selection_1.Selection(2, 2, 2, 10), 2 /* EditorPaneSelectionChangeReason.USER */);
            await setTextSelection(historyService, pane, new selection_1.Selection(5, 3, 5, 20), 5 /* EditorPaneSelectionChangeReason.JUMP */);
            await setTextSelection(historyService, pane, new selection_1.Selection(120, 8, 120, 18), 5 /* EditorPaneSelectionChangeReason.JUMP */);
            await historyService.goBack(2 /* GoFilter.NAVIGATION */);
            assertTextSelection(new selection_1.Selection(5, 3, 5, 20), pane);
            await historyService.goBack(2 /* GoFilter.NAVIGATION */);
            assertTextSelection(new selection_1.Selection(2, 2, 2, 10), pane);
            await historyService.goForward(2 /* GoFilter.NAVIGATION */);
            assertTextSelection(new selection_1.Selection(5, 3, 5, 20), pane);
            await historyService.goLast(2 /* GoFilter.NAVIGATION */);
            assertTextSelection(new selection_1.Selection(120, 8, 120, 18), pane);
            await historyService.goPrevious(2 /* GoFilter.NAVIGATION */);
            assertTextSelection(new selection_1.Selection(5, 3, 5, 20), pane);
            await historyService.goPrevious(2 /* GoFilter.NAVIGATION */);
            assertTextSelection(new selection_1.Selection(120, 8, 120, 18), pane);
            return (0, workbenchTestServices_1.workbenchTeardown)(instantiationService);
        });
        test('back / forward: selection changes with JUMP or NAVIGATION source are not merged (#143833)', async function () {
            const [, historyService, editorService, , instantiationService] = await createServices();
            const resource = utils_1.toResource.call(this, '/path/index.txt');
            const pane = await editorService.openEditor({ resource, options: { pinned: true } });
            await setTextSelection(historyService, pane, new selection_1.Selection(2, 2, 2, 10), 2 /* EditorPaneSelectionChangeReason.USER */);
            await setTextSelection(historyService, pane, new selection_1.Selection(5, 3, 5, 20), 5 /* EditorPaneSelectionChangeReason.JUMP */);
            await setTextSelection(historyService, pane, new selection_1.Selection(6, 3, 6, 20), 4 /* EditorPaneSelectionChangeReason.NAVIGATION */);
            await historyService.goBack(0 /* GoFilter.NONE */);
            assertTextSelection(new selection_1.Selection(5, 3, 5, 20), pane);
            await historyService.goBack(0 /* GoFilter.NONE */);
            assertTextSelection(new selection_1.Selection(2, 2, 2, 10), pane);
            return (0, workbenchTestServices_1.workbenchTeardown)(instantiationService);
        });
        test('back / forward: edit selection changes', async function () {
            const [, historyService, editorService, , instantiationService] = await createServices();
            const resource = utils_1.toResource.call(this, '/path/index.txt');
            const pane = await editorService.openEditor({ resource, options: { pinned: true } });
            await setTextSelection(historyService, pane, new selection_1.Selection(2, 2, 2, 10));
            await setTextSelection(historyService, pane, new selection_1.Selection(50, 3, 50, 20), 3 /* EditorPaneSelectionChangeReason.EDIT */);
            await setTextSelection(historyService, pane, new selection_1.Selection(300, 3, 300, 20)); // unrelated user navigation
            await setTextSelection(historyService, pane, new selection_1.Selection(500, 3, 500, 20)); // unrelated user navigation
            await setTextSelection(historyService, pane, new selection_1.Selection(200, 3, 200, 20)); // unrelated user navigation
            await setTextSelection(historyService, pane, new selection_1.Selection(5, 3, 5, 20), 3 /* EditorPaneSelectionChangeReason.EDIT */);
            await setTextSelection(historyService, pane, new selection_1.Selection(200, 3, 200, 20)); // unrelated user navigation
            await historyService.goBack(1 /* GoFilter.EDITS */); // this should reveal the last navigation entry because we are not at it currently
            assertTextSelection(new selection_1.Selection(5, 3, 5, 20), pane);
            await historyService.goBack(1 /* GoFilter.EDITS */);
            assertTextSelection(new selection_1.Selection(50, 3, 50, 20), pane);
            await historyService.goForward(1 /* GoFilter.EDITS */);
            assertTextSelection(new selection_1.Selection(5, 3, 5, 20), pane);
            return (0, workbenchTestServices_1.workbenchTeardown)(instantiationService);
        });
        async function setTextSelection(historyService, pane, selection, reason = 2 /* EditorPaneSelectionChangeReason.USER */) {
            const promise = event_1.Event.toPromise(historyService.onDidChangeEditorNavigationStack);
            pane.setSelection(selection, reason);
            await promise;
        }
        function assertTextSelection(expected, pane) {
            const options = pane.options;
            if (!options) {
                assert.fail('EditorPane has no selection');
            }
            assert.strictEqual(options.selection?.startLineNumber, expected.startLineNumber);
            assert.strictEqual(options.selection?.startColumn, expected.startColumn);
            assert.strictEqual(options.selection?.endLineNumber, expected.endLineNumber);
            assert.strictEqual(options.selection?.endColumn, expected.endColumn);
        }
        test('back / forward: tracks editor moves across groups', async function () {
            const [part, historyService, editorService, , instantiationService] = await createServices();
            const resource1 = utils_1.toResource.call(this, '/path/one.txt');
            const resource2 = utils_1.toResource.call(this, '/path/two.html');
            const pane1 = await editorService.openEditor({ resource: resource1, options: { pinned: true } });
            await editorService.openEditor({ resource: resource2, options: { pinned: true } });
            // [one.txt] [>two.html<]
            const sideGroup = part.addGroup(part.activeGroup, 3 /* GroupDirection.RIGHT */);
            // [one.txt] [>two.html<] | <empty>
            const editorChangePromise = event_1.Event.toPromise(editorService.onDidActiveEditorChange);
            pane1?.group?.moveEditor(pane1.input, sideGroup);
            await editorChangePromise;
            // [one.txt] | [>two.html<]
            await historyService.goBack();
            // [>one.txt<] | [two.html]
            assert.strictEqual(part.activeGroup.id, pane1?.group?.id);
            assert.strictEqual(part.activeGroup.activeEditor?.resource?.toString(), resource1.toString());
            return (0, workbenchTestServices_1.workbenchTeardown)(instantiationService);
        });
        test('back / forward: tracks group removals', async function () {
            const [part, historyService, editorService, , instantiationService] = await createServices();
            const resource1 = utils_1.toResource.call(this, '/path/one.txt');
            const resource2 = utils_1.toResource.call(this, '/path/two.html');
            const pane1 = await editorService.openEditor({ resource: resource1, options: { pinned: true } });
            const pane2 = await editorService.openEditor({ resource: resource2, options: { pinned: true } }, editorService_1.SIDE_GROUP);
            // [one.txt] | [>two.html<]
            assert.notStrictEqual(pane1, pane2);
            await pane1?.group?.closeAllEditors();
            // [>two.html<]
            await historyService.goBack();
            // [>two.html<]
            assert.strictEqual(part.activeGroup.id, pane2?.group?.id);
            assert.strictEqual(part.activeGroup.activeEditor?.resource?.toString(), resource2.toString());
            return (0, workbenchTestServices_1.workbenchTeardown)(instantiationService);
        });
        test('back / forward: editor navigation stack - navigation', async function () {
            const [, , editorService, , instantiationService] = await createServices();
            const stack = instantiationService.createInstance(historyService_1.EditorNavigationStack, 0 /* GoFilter.NONE */, 0 /* GoScope.DEFAULT */);
            const resource = utils_1.toResource.call(this, '/path/index.txt');
            const otherResource = utils_1.toResource.call(this, '/path/index.html');
            const pane = await editorService.openEditor({ resource, options: { pinned: true } });
            let changed = false;
            disposables.add(stack.onDidChange(() => changed = true));
            assert.strictEqual(stack.canGoBack(), false);
            assert.strictEqual(stack.canGoForward(), false);
            assert.strictEqual(stack.canGoLast(), false);
            // Opening our first editor emits change event
            stack.notifyNavigation(pane, { reason: 2 /* EditorPaneSelectionChangeReason.USER */ });
            assert.strictEqual(changed, true);
            changed = false;
            assert.strictEqual(stack.canGoBack(), false);
            assert.strictEqual(stack.canGoLast(), true);
            // Opening same editor is not treated as new history stop
            stack.notifyNavigation(pane, { reason: 2 /* EditorPaneSelectionChangeReason.USER */ });
            assert.strictEqual(stack.canGoBack(), false);
            // Opening different editor allows to go back
            await editorService.openEditor({ resource: otherResource, options: { pinned: true } });
            stack.notifyNavigation(pane, { reason: 2 /* EditorPaneSelectionChangeReason.USER */ });
            assert.strictEqual(changed, true);
            changed = false;
            assert.strictEqual(stack.canGoBack(), true);
            await stack.goBack();
            assert.strictEqual(stack.canGoBack(), false);
            assert.strictEqual(stack.canGoForward(), true);
            assert.strictEqual(stack.canGoLast(), true);
            await stack.goForward();
            assert.strictEqual(stack.canGoBack(), true);
            assert.strictEqual(stack.canGoForward(), false);
            await stack.goPrevious();
            assert.strictEqual(stack.canGoBack(), false);
            assert.strictEqual(stack.canGoForward(), true);
            await stack.goPrevious();
            assert.strictEqual(stack.canGoBack(), true);
            assert.strictEqual(stack.canGoForward(), false);
            await stack.goBack();
            await stack.goLast();
            assert.strictEqual(stack.canGoBack(), true);
            assert.strictEqual(stack.canGoForward(), false);
            stack.dispose();
            assert.strictEqual(stack.canGoBack(), false);
            return (0, workbenchTestServices_1.workbenchTeardown)(instantiationService);
        });
        test('back / forward: editor navigation stack - mutations', async function () {
            const [, , editorService, , instantiationService] = await createServices();
            const stack = disposables.add(instantiationService.createInstance(historyService_1.EditorNavigationStack, 0 /* GoFilter.NONE */, 0 /* GoScope.DEFAULT */));
            const resource = utils_1.toResource.call(this, '/path/index.txt');
            const otherResource = utils_1.toResource.call(this, '/path/index.html');
            const pane = await editorService.openEditor({ resource, options: { pinned: true } });
            stack.notifyNavigation(pane);
            await editorService.openEditor({ resource: otherResource, options: { pinned: true } });
            stack.notifyNavigation(pane);
            // Clear
            assert.strictEqual(stack.canGoBack(), true);
            stack.clear();
            assert.strictEqual(stack.canGoBack(), false);
            await editorService.openEditor({ resource, options: { pinned: true } });
            stack.notifyNavigation(pane);
            await editorService.openEditor({ resource: otherResource, options: { pinned: true } });
            stack.notifyNavigation(pane);
            // Remove (via internal event)
            assert.strictEqual(stack.canGoBack(), true);
            stack.remove(new files_1.FileOperationEvent(resource, 1 /* FileOperation.DELETE */));
            assert.strictEqual(stack.canGoBack(), false);
            stack.clear();
            await editorService.openEditor({ resource, options: { pinned: true } });
            stack.notifyNavigation(pane);
            await editorService.openEditor({ resource: otherResource, options: { pinned: true } });
            stack.notifyNavigation(pane);
            // Remove (via external event)
            assert.strictEqual(stack.canGoBack(), true);
            stack.remove(new files_1.FileChangesEvent([{ resource, type: 2 /* FileChangeType.DELETED */ }], !platform_1.isLinux));
            assert.strictEqual(stack.canGoBack(), false);
            stack.clear();
            await editorService.openEditor({ resource, options: { pinned: true } });
            stack.notifyNavigation(pane);
            await editorService.openEditor({ resource: otherResource, options: { pinned: true } });
            stack.notifyNavigation(pane);
            // Remove (via editor)
            assert.strictEqual(stack.canGoBack(), true);
            stack.remove(pane.input);
            assert.strictEqual(stack.canGoBack(), false);
            stack.clear();
            await editorService.openEditor({ resource, options: { pinned: true } });
            stack.notifyNavigation(pane);
            await editorService.openEditor({ resource: otherResource, options: { pinned: true } });
            stack.notifyNavigation(pane);
            // Remove (via group)
            assert.strictEqual(stack.canGoBack(), true);
            stack.remove(pane.group.id);
            assert.strictEqual(stack.canGoBack(), false);
            stack.clear();
            await editorService.openEditor({ resource, options: { pinned: true } });
            stack.notifyNavigation(pane);
            await editorService.openEditor({ resource: otherResource, options: { pinned: true } });
            stack.notifyNavigation(pane);
            // Move
            const stat = {
                ctime: 0,
                etag: '',
                mtime: 0,
                isDirectory: false,
                isFile: true,
                isSymbolicLink: false,
                name: 'other.txt',
                readonly: false,
                locked: false,
                size: 0,
                resource: utils_1.toResource.call(this, '/path/other.txt'),
                children: undefined
            };
            stack.move(new files_1.FileOperationEvent(resource, 2 /* FileOperation.MOVE */, stat));
            await stack.goBack();
            assert.strictEqual(pane?.input?.resource?.toString(), stat.resource.toString());
            return (0, workbenchTestServices_1.workbenchTeardown)(instantiationService);
        });
        test('back / forward: editor group scope', async function () {
            const [part, historyService, editorService, , instantiationService] = await createServices(1 /* GoScope.EDITOR_GROUP */);
            const resource1 = utils_1.toResource.call(this, '/path/one.txt');
            const resource2 = utils_1.toResource.call(this, '/path/two.html');
            const resource3 = utils_1.toResource.call(this, '/path/three.html');
            const pane1 = await editorService.openEditor({ resource: resource1, options: { pinned: true } });
            await editorService.openEditor({ resource: resource2, options: { pinned: true } });
            await editorService.openEditor({ resource: resource3, options: { pinned: true } });
            // [one.txt] [two.html] [>three.html<]
            const sideGroup = part.addGroup(part.activeGroup, 3 /* GroupDirection.RIGHT */);
            // [one.txt] [two.html] [>three.html<] | <empty>
            const pane2 = await editorService.openEditor({ resource: resource1, options: { pinned: true } }, sideGroup);
            await editorService.openEditor({ resource: resource2, options: { pinned: true } });
            await editorService.openEditor({ resource: resource3, options: { pinned: true } });
            // [one.txt] [two.html] [>three.html<] | [one.txt] [two.html] [>three.html<]
            await historyService.goBack();
            await historyService.goBack();
            await historyService.goBack();
            assert.strictEqual(part.activeGroup.id, pane2?.group?.id);
            assert.strictEqual(part.activeGroup.activeEditor?.resource?.toString(), resource1.toString());
            // [one.txt] [two.html] [>three.html<] | [>one.txt<] [two.html] [three.html]
            await editorService.openEditor({ resource: resource3, options: { pinned: true } }, pane1?.group);
            await historyService.goBack();
            await historyService.goBack();
            await historyService.goBack();
            assert.strictEqual(part.activeGroup.id, pane1?.group?.id);
            assert.strictEqual(part.activeGroup.activeEditor?.resource?.toString(), resource1.toString());
            return (0, workbenchTestServices_1.workbenchTeardown)(instantiationService);
        });
        test('back / forward: editor  scope', async function () {
            const [part, historyService, editorService, , instantiationService] = await createServices(2 /* GoScope.EDITOR */);
            const resource1 = utils_1.toResource.call(this, '/path/one.txt');
            const resource2 = utils_1.toResource.call(this, '/path/two.html');
            const pane = await editorService.openEditor({ resource: resource1, options: { pinned: true } });
            await setTextSelection(historyService, pane, new selection_1.Selection(2, 2, 2, 10));
            await setTextSelection(historyService, pane, new selection_1.Selection(50, 3, 50, 20));
            await editorService.openEditor({ resource: resource2, options: { pinned: true } });
            await setTextSelection(historyService, pane, new selection_1.Selection(12, 2, 12, 10));
            await setTextSelection(historyService, pane, new selection_1.Selection(150, 3, 150, 20));
            await historyService.goBack();
            assertTextSelection(new selection_1.Selection(12, 2, 12, 10), pane);
            await historyService.goBack();
            assertTextSelection(new selection_1.Selection(12, 2, 12, 10), pane); // no change
            assert.strictEqual(part.activeGroup.activeEditor?.resource?.toString(), resource2.toString());
            await editorService.openEditor({ resource: resource1, options: { pinned: true } });
            await historyService.goBack();
            assertTextSelection(new selection_1.Selection(2, 2, 2, 10), pane);
            await historyService.goBack();
            assertTextSelection(new selection_1.Selection(2, 2, 2, 10), pane); // no change
            assert.strictEqual(part.activeGroup.activeEditor?.resource?.toString(), resource1.toString());
            return (0, workbenchTestServices_1.workbenchTeardown)(instantiationService);
        });
        test('go to last edit location', async function () {
            const [, historyService, editorService, textFileService, instantiationService] = await createServices();
            const resource = utils_1.toResource.call(this, '/path/index.txt');
            const otherResource = utils_1.toResource.call(this, '/path/index.html');
            await editorService.openEditor({ resource });
            const model = await textFileService.files.resolve(resource);
            model.textEditorModel.setValue('Hello World');
            await (0, async_1.timeout)(10); // history debounces change events
            await editorService.openEditor({ resource: otherResource });
            const onDidActiveEditorChange = new async_1.DeferredPromise();
            disposables.add(editorService.onDidActiveEditorChange(e => {
                onDidActiveEditorChange.complete(e);
            }));
            historyService.goLast(1 /* GoFilter.EDITS */);
            await onDidActiveEditorChange.p;
            assert.strictEqual(editorService.activeEditor?.resource?.toString(), resource.toString());
            return (0, workbenchTestServices_1.workbenchTeardown)(instantiationService);
        });
        test('reopen closed editor', async function () {
            const [, historyService, editorService, , instantiationService] = await createServices();
            const resource = utils_1.toResource.call(this, '/path/index.txt');
            const pane = await editorService.openEditor({ resource });
            await pane?.group?.closeAllEditors();
            const onDidActiveEditorChange = new async_1.DeferredPromise();
            disposables.add(editorService.onDidActiveEditorChange(e => {
                onDidActiveEditorChange.complete(e);
            }));
            historyService.reopenLastClosedEditor();
            await onDidActiveEditorChange.p;
            assert.strictEqual(editorService.activeEditor?.resource?.toString(), resource.toString());
            return (0, workbenchTestServices_1.workbenchTeardown)(instantiationService);
        });
        test('getHistory', async () => {
            class TestFileEditorInputWithUntyped extends workbenchTestServices_1.TestFileEditorInput {
                toUntyped() {
                    return {
                        resource: this.resource,
                        options: {
                            override: 'testOverride'
                        }
                    };
                }
            }
            const [part, historyService, , , instantiationService] = await createServices();
            let history = historyService.getHistory();
            assert.strictEqual(history.length, 0);
            const input1 = disposables.add(new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('foo://bar1'), TEST_EDITOR_INPUT_ID));
            await part.activeGroup.openEditor(input1, { pinned: true });
            const input2 = disposables.add(new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('foo://bar2'), TEST_EDITOR_INPUT_ID));
            await part.activeGroup.openEditor(input2, { pinned: true });
            const input3 = disposables.add(new TestFileEditorInputWithUntyped(uri_1.URI.parse('foo://bar3'), TEST_EDITOR_INPUT_ID));
            await part.activeGroup.openEditor(input3, { pinned: true });
            const input4 = disposables.add(new TestFileEditorInputWithUntyped(uri_1.URI.file('bar4'), TEST_EDITOR_INPUT_ID));
            await part.activeGroup.openEditor(input4, { pinned: true });
            history = historyService.getHistory();
            assert.strictEqual(history.length, 4);
            // first entry is untyped because it implements `toUntyped` and has a supported scheme
            assert.strictEqual((0, editor_1.isResourceEditorInput)(history[0]) && !(history[0] instanceof editorInput_1.EditorInput), true);
            assert.strictEqual(history[0].options?.override, 'testOverride');
            // second entry is not untyped even though it implements `toUntyped` but has unsupported scheme
            assert.strictEqual(history[1] instanceof editorInput_1.EditorInput, true);
            assert.strictEqual(history[2] instanceof editorInput_1.EditorInput, true);
            assert.strictEqual(history[3] instanceof editorInput_1.EditorInput, true);
            historyService.removeFromHistory(input2);
            history = historyService.getHistory();
            assert.strictEqual(history.length, 3);
            assert.strictEqual(history[0].resource?.toString(), input4.resource.toString());
            return (0, workbenchTestServices_1.workbenchTeardown)(instantiationService);
        });
        test('getLastActiveFile', async () => {
            const [part, historyService] = await createServices();
            assert.ok(!historyService.getLastActiveFile('foo'));
            const input1 = disposables.add(new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('foo://bar1'), TEST_EDITOR_INPUT_ID));
            await part.activeGroup.openEditor(input1, { pinned: true });
            assert.strictEqual(historyService.getLastActiveFile('foo')?.toString(), input1.resource.toString());
        });
        test('open next/previous recently used editor (single group)', async () => {
            const [part, historyService, editorService, , instantiationService] = await createServices();
            const input1 = disposables.add(new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('foo://bar1'), TEST_EDITOR_INPUT_ID));
            const input2 = disposables.add(new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('foo://bar2'), TEST_EDITOR_INPUT_ID));
            await part.activeGroup.openEditor(input1, { pinned: true });
            assert.strictEqual(part.activeGroup.activeEditor, input1);
            await part.activeGroup.openEditor(input2, { pinned: true });
            assert.strictEqual(part.activeGroup.activeEditor, input2);
            let editorChangePromise = event_1.Event.toPromise(editorService.onDidActiveEditorChange);
            historyService.openPreviouslyUsedEditor();
            await editorChangePromise;
            assert.strictEqual(part.activeGroup.activeEditor, input1);
            editorChangePromise = event_1.Event.toPromise(editorService.onDidActiveEditorChange);
            historyService.openNextRecentlyUsedEditor();
            await editorChangePromise;
            assert.strictEqual(part.activeGroup.activeEditor, input2);
            editorChangePromise = event_1.Event.toPromise(editorService.onDidActiveEditorChange);
            historyService.openPreviouslyUsedEditor(part.activeGroup.id);
            await editorChangePromise;
            assert.strictEqual(part.activeGroup.activeEditor, input1);
            editorChangePromise = event_1.Event.toPromise(editorService.onDidActiveEditorChange);
            historyService.openNextRecentlyUsedEditor(part.activeGroup.id);
            await editorChangePromise;
            assert.strictEqual(part.activeGroup.activeEditor, input2);
            return (0, workbenchTestServices_1.workbenchTeardown)(instantiationService);
        });
        test('open next/previous recently used editor (multi group)', async () => {
            const [part, historyService, editorService, , instantiationService] = await createServices();
            const rootGroup = part.activeGroup;
            const input1 = disposables.add(new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('foo://bar1'), TEST_EDITOR_INPUT_ID));
            const input2 = disposables.add(new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('foo://bar2'), TEST_EDITOR_INPUT_ID));
            const sideGroup = part.addGroup(rootGroup, 3 /* GroupDirection.RIGHT */);
            await rootGroup.openEditor(input1, { pinned: true });
            await sideGroup.openEditor(input2, { pinned: true });
            let editorChangePromise = event_1.Event.toPromise(editorService.onDidActiveEditorChange);
            historyService.openPreviouslyUsedEditor();
            await editorChangePromise;
            assert.strictEqual(part.activeGroup, rootGroup);
            assert.strictEqual(rootGroup.activeEditor, input1);
            editorChangePromise = event_1.Event.toPromise(editorService.onDidActiveEditorChange);
            historyService.openNextRecentlyUsedEditor();
            await editorChangePromise;
            assert.strictEqual(part.activeGroup, sideGroup);
            assert.strictEqual(sideGroup.activeEditor, input2);
            return (0, workbenchTestServices_1.workbenchTeardown)(instantiationService);
        });
        test('open next/previous recently is reset when other input opens', async () => {
            const [part, historyService, editorService, , instantiationService] = await createServices();
            const input1 = disposables.add(new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('foo://bar1'), TEST_EDITOR_INPUT_ID));
            const input2 = disposables.add(new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('foo://bar2'), TEST_EDITOR_INPUT_ID));
            const input3 = disposables.add(new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('foo://bar3'), TEST_EDITOR_INPUT_ID));
            const input4 = disposables.add(new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('foo://bar4'), TEST_EDITOR_INPUT_ID));
            await part.activeGroup.openEditor(input1, { pinned: true });
            await part.activeGroup.openEditor(input2, { pinned: true });
            await part.activeGroup.openEditor(input3, { pinned: true });
            let editorChangePromise = event_1.Event.toPromise(editorService.onDidActiveEditorChange);
            historyService.openPreviouslyUsedEditor();
            await editorChangePromise;
            assert.strictEqual(part.activeGroup.activeEditor, input2);
            await (0, async_1.timeout)(0);
            await part.activeGroup.openEditor(input4, { pinned: true });
            editorChangePromise = event_1.Event.toPromise(editorService.onDidActiveEditorChange);
            historyService.openPreviouslyUsedEditor();
            await editorChangePromise;
            assert.strictEqual(part.activeGroup.activeEditor, input2);
            editorChangePromise = event_1.Event.toPromise(editorService.onDidActiveEditorChange);
            historyService.openNextRecentlyUsedEditor();
            await editorChangePromise;
            assert.strictEqual(part.activeGroup.activeEditor, input4);
            return (0, workbenchTestServices_1.workbenchTeardown)(instantiationService);
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlzdG9yeVNlcnZpY2UudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9oaXN0b3J5L3Rlc3QvYnJvd3Nlci9oaXN0b3J5U2VydmljZS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBNEJoRyxLQUFLLENBQUMsZ0JBQWdCLEVBQUU7UUFFdkIsTUFBTSxjQUFjLEdBQUcsOEJBQThCLENBQUM7UUFDdEQsTUFBTSxvQkFBb0IsR0FBRyxpQ0FBaUMsQ0FBQztRQUUvRCxLQUFLLFVBQVUsY0FBYyxDQUFDLEtBQUssMEJBQWtCO1lBQ3BELE1BQU0sb0JBQW9CLEdBQUcsSUFBQSxxREFBNkIsRUFBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFFbkYsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFBLHdDQUFnQixFQUFDLG9CQUFvQixFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ3ZFLG9CQUFvQixDQUFDLElBQUksQ0FBQywwQ0FBb0IsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUV0RCxNQUFNLGFBQWEsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyw2QkFBYSxDQUFDLENBQUMsQ0FBQztZQUMxRixvQkFBb0IsQ0FBQyxJQUFJLENBQUMsOEJBQWMsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUV6RCxNQUFNLG9CQUFvQixHQUFHLElBQUksbURBQXdCLEVBQUUsQ0FBQztZQUM1RCxJQUFJLEtBQUssaUNBQXlCLEVBQUU7Z0JBQ25DLG9CQUFvQixDQUFDLG9CQUFvQixDQUFDLGtDQUFrQyxFQUFFLGFBQWEsQ0FBQyxDQUFDO2FBQzdGO2lCQUFNLElBQUksS0FBSywyQkFBbUIsRUFBRTtnQkFDcEMsb0JBQW9CLENBQUMsb0JBQW9CLENBQUMsa0NBQWtDLEVBQUUsUUFBUSxDQUFDLENBQUM7YUFD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LENBQUM7WUFDL0csTUFBTSxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsSUFBSSxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsK0NBQXVDLENBQUM7WUFDL0csTUFBTSxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsSUFBSSxFQUFFLElBQUkscUJBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsK0NBQXVDLENBQUM7WUFFbkgsTUFBTSxjQUFjLENBQUMsTUFBTSw2QkFBcUIsQ0FBQztZQUNqRCxtQkFBbUIsQ0FBQyxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFdEQsTUFBTSxjQUFjLENBQUMsTUFBTSw2QkFBcUIsQ0FBQztZQUNqRCxtQkFBbUIsQ0FBQyxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFdEQsTUFBTSxjQUFjLENBQUMsU0FBUyw2QkFBcUIsQ0FBQztZQUNwRCxtQkFBbUIsQ0FBQyxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFdEQsTUFBTSxjQUFjLENBQUMsTUFBTSw2QkFBcUIsQ0FBQztZQUNqRCxtQkFBbUIsQ0FBQyxJQUFJLHFCQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFMUQsTUFBTSxjQUFjLENBQUMsVUFBVSw2QkFBcUIsQ0FBQztZQUNyRCxtQkFBbUIsQ0FBQyxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFdEQsTUFBTSxj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QUMsU0FBUyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFNUMsTUFBTSxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDeEIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDNUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFaEQsTUFBTSxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDekIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDN0MsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFL0MsTUFBTSxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDekIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDNUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFaEQsTUFBTSxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDckIsTUFBTSxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDckIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDNUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFaEQsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2hCLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRTdDLE9BQU8sSUFBQSx5Q0FBaUIsRUFBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQ2hELENBQUMsQ0FBQyxD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