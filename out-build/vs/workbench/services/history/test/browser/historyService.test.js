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
            const instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            const part = await (0, workbenchTestServices_1.$3ec)(instantiationService, disposables);
            instantiationService.stub(editorGroupsService_1.$5C, part);
            const editorService = disposables.add(instantiationService.createInstance(editorService_2.$Lyb));
            instantiationService.stub(editorService_1.$9C, editorService);
            const configurationService = new testConfigurationService_1.$G0b();
            if (scope === 1 /* GoScope.EDITOR_GROUP */) {
                configurationService.setUserConfiguration('workbench.editor.navigationScope', 'editorGroup');
            }
            else if (scope === 2 /* GoScope.EDITOR */) {
                configurationService.setUserConfiguration('workbench.editor.navigationScope', 'editor');
            }
            instantiationService.stub(configuration_1.$8h, configurationService);
            const historyService = disposables.add(instantiationService.createInstance(historyService_1.$Oyb));
            instantiationService.stub(history_1.$SM, historyService);
            const accessor = instantiationService.createInstance(workbenchTestServices_1.$mec);
            return [part, historyService, editorService, accessor.textFileService, instantiationService];
        }
        const disposables = new lifecycle_1.$jc();
        setup(() => {
            disposables.add((0, workbenchTestServices_1.$Vec)(TEST_EDITOR_ID, [new descriptors_1.$yh(workbenchTestServices_1.$Zec)]));
            disposables.add((0, workbenchTestServices_1.$Wec)());
        });
        teardown(() => {
            disposables.clear();
        });
        test('back / forward: basics', async () => {
            const [part, historyService] = await createServices();
            const input1 = disposables.add(new workbenchTestServices_1.$Zec(uri_1.URI.parse('foo://bar1'), TEST_EDITOR_INPUT_ID));
            await part.activeGroup.openEditor(input1, { pinned: true });
            assert.strictEqual(part.activeGroup.activeEditor, input1);
            const input2 = disposables.add(new workbenchTestServices_1.$Zec(uri_1.URI.parse('foo://bar2'), TEST_EDITOR_INPUT_ID));
            await part.activeGroup.openEditor(input2, { pinned: true });
            assert.strictEqual(part.activeGroup.activeEditor, input2);
            await historyService.goBack();
            assert.strictEqual(part.activeGroup.activeEditor, input1);
            await historyService.goForward();
            assert.strictEqual(part.activeGroup.activeEditor, input2);
        });
        test('back / forward: is editor group aware', async function () {
            const [part, historyService, editorService, , instantiationService] = await createServices();
            const resource = utils_1.$0S.call(this, '/path/index.txt');
            const otherResource = utils_1.$0S.call(this, '/path/other.html');
            const pane1 = await editorService.openEditor({ resource, options: { pinned: true } });
            const pane2 = await editorService.openEditor({ resource, options: { pinned: true } }, editorService_1.$$C);
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
            return (0, workbenchTestServices_1.$hfc)(instantiationService);
        });
        test('back / forward: in-editor text selection changes (user)', async function () {
            const [, historyService, editorService, , instantiationService] = await createServices();
            const resource = utils_1.$0S.call(this, '/path/index.txt');
            const pane = await editorService.openEditor({ resource, options: { pinned: true } });
            await setTextSelection(historyService, pane, new selection_1.$ms(1, 2, 1, 2));
            await setTextSelection(historyService, pane, new selection_1.$ms(15, 1, 15, 1)); // will be merged and dropped
            await setTextSelection(historyService, pane, new selection_1.$ms(16, 1, 16, 1)); // will be merged and dropped
            await setTextSelection(historyService, pane, new selection_1.$ms(17, 1, 17, 1));
            await setTextSelection(historyService, pane, new selection_1.$ms(30, 5, 30, 8));
            await setTextSelection(historyService, pane, new selection_1.$ms(40, 1, 40, 1));
            await historyService.goBack(0 /* GoFilter.NONE */);
            assertTextSelection(new selection_1.$ms(30, 5, 30, 8), pane);
            await historyService.goBack(0 /* GoFilter.NONE */);
            assertTextSelection(new selection_1.$ms(17, 1, 17, 1), pane);
            await historyService.goBack(0 /* GoFilter.NONE */);
            assertTextSelection(new selection_1.$ms(1, 2, 1, 2), pane);
            await historyService.goForward(0 /* GoFilter.NONE */);
            assertTextSelection(new selection_1.$ms(17, 1, 17, 1), pane);
            return (0, workbenchTestServices_1.$hfc)(instantiationService);
        });
        test('back / forward: in-editor text selection changes (navigation)', async function () {
            const [, historyService, editorService, , instantiationService] = await createServices();
            const resource = utils_1.$0S.call(this, '/path/index.txt');
            const pane = await editorService.openEditor({ resource, options: { pinned: true } });
            await setTextSelection(historyService, pane, new selection_1.$ms(2, 2, 2, 10)); // this is our starting point
            await setTextSelection(historyService, pane, new selection_1.$ms(5, 3, 5, 20), 4 /* EditorPaneSelectionChangeReason.NAVIGATION */); // this is our first target definition
            await setTextSelection(historyService, pane, new selection_1.$ms(120, 8, 120, 18), 4 /* EditorPaneSelectionChangeReason.NAVIGATION */); // this is our second target definition
            await setTextSelection(historyService, pane, new selection_1.$ms(300, 3, 300, 20)); // unrelated user navigation
            await setTextSelection(historyService, pane, new selection_1.$ms(500, 3, 500, 20)); // unrelated user navigation
            await setTextSelection(historyService, pane, new selection_1.$ms(200, 3, 200, 20)); // unrelated user navigation
            await historyService.goBack(2 /* GoFilter.NAVIGATION */); // this should reveal the last navigation entry because we are not at it currently
            assertTextSelection(new selection_1.$ms(120, 8, 120, 18), pane);
            await historyService.goBack(2 /* GoFilter.NAVIGATION */);
            assertTextSelection(new selection_1.$ms(5, 3, 5, 20), pane);
            await historyService.goBack(2 /* GoFilter.NAVIGATION */);
            assertTextSelection(new selection_1.$ms(5, 3, 5, 20), pane);
            await historyService.goForward(2 /* GoFilter.NAVIGATION */);
            assertTextSelection(new selection_1.$ms(120, 8, 120, 18), pane);
            await historyService.goPrevious(2 /* GoFilter.NAVIGATION */);
            assertTextSelection(new selection_1.$ms(5, 3, 5, 20), pane);
            await historyService.goPrevious(2 /* GoFilter.NAVIGATION */);
            assertTextSelection(new selection_1.$ms(120, 8, 120, 18), pane);
            return (0, workbenchTestServices_1.$hfc)(instantiationService);
        });
        test('back / forward: in-editor text selection changes (jump)', async function () {
            const [, historyService, editorService, , instantiationService] = await createServices();
            const resource = utils_1.$0S.call(this, '/path/index.txt');
            const pane = await editorService.openEditor({ resource, options: { pinned: true } });
            await setTextSelection(historyService, pane, new selection_1.$ms(2, 2, 2, 10), 2 /* EditorPaneSelectionChangeReason.USER */);
            await setTextSelection(historyService, pane, new selection_1.$ms(5, 3, 5, 20), 5 /* EditorPaneSelectionChangeReason.JUMP */);
            await setTextSelection(historyService, pane, new selection_1.$ms(120, 8, 120, 18), 5 /* EditorPaneSelectionChangeReason.JUMP */);
            await historyService.goBack(2 /* GoFilter.NAVIGATION */);
            assertTextSelection(new selection_1.$ms(5, 3, 5, 20), pane);
            await historyService.goBack(2 /* GoFilter.NAVIGATION */);
            assertTextSelection(new selection_1.$ms(2, 2, 2, 10), pane);
            await historyService.goForward(2 /* GoFilter.NAVIGATION */);
            assertTextSelection(new selection_1.$ms(5, 3, 5, 20), pane);
            await historyService.goLast(2 /* GoFilter.NAVIGATION */);
            assertTextSelection(new selection_1.$ms(120, 8, 120, 18), pane);
            await historyService.goPrevious(2 /* GoFilter.NAVIGATION */);
            assertTextSelection(new selection_1.$ms(5, 3, 5, 20), pane);
            await historyService.goPrevious(2 /* GoFilter.NAVIGATION */);
            assertTextSelection(new selection_1.$ms(120, 8, 120, 18), pane);
            return (0, workbenchTestServices_1.$hfc)(instantiationService);
        });
        test('back / forward: selection changes with JUMP or NAVIGATION source are not merged (#143833)', async function () {
            const [, historyService, editorService, , instantiationService] = await createServices();
            const resource = utils_1.$0S.call(this, '/path/index.txt');
            const pane = await editorService.openEditor({ resource, options: { pinned: true } });
            await setTextSelection(historyService, pane, new selection_1.$ms(2, 2, 2, 10), 2 /* EditorPaneSelectionChangeReason.USER */);
            await setTextSelection(historyService, pane, new selection_1.$ms(5, 3, 5, 20), 5 /* EditorPaneSelectionChangeReason.JUMP */);
            await setTextSelection(historyService, pane, new selection_1.$ms(6, 3, 6, 20), 4 /* EditorPaneSelectionChangeReason.NAVIGATION */);
            await historyService.goBack(0 /* GoFilter.NONE */);
            assertTextSelection(new selection_1.$ms(5, 3, 5, 20), pane);
            await historyService.goBack(0 /* GoFilter.NONE */);
            assertTextSelection(new selection_1.$ms(2, 2, 2, 10), pane);
            return (0, workbenchTestServices_1.$hfc)(instantiationService);
        });
        test('back / forward: edit selection changes', async function () {
            const [, historyService, editorService, , instantiationService] = await createServices();
            const resource = utils_1.$0S.call(this, '/path/index.txt');
            const pane = await editorService.openEditor({ resource, options: { pinned: true } });
            await setTextSelection(historyService, pane, new selection_1.$ms(2, 2, 2, 10));
            await setTextSelection(historyService, pane, new selection_1.$ms(50, 3, 50, 20), 3 /* EditorPaneSelectionChangeReason.EDIT */);
            await setTextSelection(historyService, pane, new selection_1.$ms(300, 3, 300, 20)); // unrelated user navigation
            await setTextSelection(historyService, pane, new selection_1.$ms(500, 3, 500, 20)); // unrelated user navigation
            await setTextSelection(historyService, pane, new selection_1.$ms(200, 3, 200, 20)); // unrelated user navigation
            await setTextSelection(historyService, pane, new selection_1.$ms(5, 3, 5, 20), 3 /* EditorPaneSelectionChangeReason.EDIT */);
            await setTextSelection(historyService, pane, new selection_1.$ms(200, 3, 200, 20)); // unrelated user navigation
            await historyService.goBack(1 /* GoFilter.EDITS */); // this should reveal the last navigation entry because we are not at it currently
            assertTextSelection(new selection_1.$ms(5, 3, 5, 20), pane);
            await historyService.goBack(1 /* GoFilter.EDITS */);
            assertTextSelection(new selection_1.$ms(50, 3, 50, 20), pane);
            await historyService.goForward(1 /* GoFilter.EDITS */);
            assertTextSelection(new selection_1.$ms(5, 3, 5, 20), pane);
            return (0, workbenchTestServices_1.$hfc)(instantiationService);
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
            const resource1 = utils_1.$0S.call(this, '/path/one.txt');
            const resource2 = utils_1.$0S.call(this, '/path/two.html');
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
            return (0, workbenchTestServices_1.$hfc)(instantiationService);
        });
        test('back / forward: tracks group removals', async function () {
            const [part, historyService, editorService, , instantiationService] = await createServices();
            const resource1 = utils_1.$0S.call(this, '/path/one.txt');
            const resource2 = utils_1.$0S.call(this, '/path/two.html');
            const pane1 = await editorService.openEditor({ resource: resource1, options: { pinned: true } });
            const pane2 = await editorService.openEditor({ resource: resource2, options: { pinned: true } }, editorService_1.$$C);
            // [one.txt] | [>two.html<]
            assert.notStrictEqual(pane1, pane2);
            await pane1?.group?.closeAllEditors();
            // [>two.html<]
            await historyService.goBack();
            // [>two.html<]
            assert.strictEqual(part.activeGroup.id, pane2?.group?.id);
            assert.strictEqual(part.activeGroup.activeEditor?.resource?.toString(), resource2.toString());
            return (0, workbenchTestServices_1.$hfc)(instantiationService);
        });
        test('back / forward: editor navigation stack - navigation', async function () {
            const [, , editorService, , instantiationService] = await createServices();
            const stack = instantiationService.createInstance(historyService_1.$Pyb, 0 /* GoFilter.NONE */, 0 /* GoScope.DEFAULT */);
            const resource = utils_1.$0S.call(this, '/path/index.txt');
            const otherResource = utils_1.$0S.call(this, '/path/index.html');
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
            return (0, workbenchTestServices_1.$hfc)(instantiationService);
        });
        test('back / forward: editor navigation stack - mutations', async function () {
            const [, , editorService, , instantiationService] = await createServices();
            const stack = disposables.add(instantiationService.createInstance(historyService_1.$Pyb, 0 /* GoFilter.NONE */, 0 /* GoScope.DEFAULT */));
            const resource = utils_1.$0S.call(this, '/path/index.txt');
            const otherResource = utils_1.$0S.call(this, '/path/index.html');
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
            stack.remove(new files_1.$kk(resource, 1 /* FileOperation.DELETE */));
            assert.strictEqual(stack.canGoBack(), false);
            stack.clear();
            await editorService.openEditor({ resource, options: { pinned: true } });
            stack.notifyNavigation(pane);
            await editorService.openEditor({ resource: otherResource, options: { pinned: true } });
            stack.notifyNavigation(pane);
            // Remove (via external event)
            assert.strictEqual(stack.canGoBack(), true);
            stack.remove(new files_1.$lk([{ resource, type: 2 /* FileChangeType.DELETED */ }], !platform_1.$k));
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
                resource: utils_1.$0S.call(this, '/path/other.txt'),
                children: undefined
            };
            stack.move(new files_1.$kk(resource, 2 /* FileOperation.MOVE */, stat));
            await stack.goBack();
            assert.strictEqual(pane?.input?.resource?.toString(), stat.resource.toString());
            return (0, workbenchTestServices_1.$hfc)(instantiationService);
        });
        test('back / forward: editor group scope', async function () {
            const [part, historyService, editorService, , instantiationService] = await createServices(1 /* GoScope.EDITOR_GROUP */);
            const resource1 = utils_1.$0S.call(this, '/path/one.txt');
            const resource2 = utils_1.$0S.call(this, '/path/two.html');
            const resource3 = utils_1.$0S.call(this, '/path/three.html');
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
            return (0, workbenchTestServices_1.$hfc)(instantiationService);
        });
        test('back / forward: editor  scope', async function () {
            const [part, historyService, editorService, , instantiationService] = await createServices(2 /* GoScope.EDITOR */);
            const resource1 = utils_1.$0S.call(this, '/path/one.txt');
            const resource2 = utils_1.$0S.call(this, '/path/two.html');
            const pane = await editorService.openEditor({ resource: resource1, options: { pinned: true } });
            await setTextSelection(historyService, pane, new selection_1.$ms(2, 2, 2, 10));
            await setTextSelection(historyService, pane, new selection_1.$ms(50, 3, 50, 20));
            await editorService.openEditor({ resource: resource2, options: { pinned: true } });
            await setTextSelection(historyService, pane, new selection_1.$ms(12, 2, 12, 10));
            await setTextSelection(historyService, pane, new selection_1.$ms(150, 3, 150, 20));
            await historyService.goBack();
            assertTextSelection(new selection_1.$ms(12, 2, 12, 10), pane);
            await historyService.goBack();
            assertTextSelection(new selection_1.$ms(12, 2, 12, 10), pane); // no change
            assert.strictEqual(part.activeGroup.activeEditor?.resource?.toString(), resource2.toString());
            await editorService.openEditor({ resource: resource1, options: { pinned: true } });
            await historyService.goBack();
            assertTextSelection(new selection_1.$ms(2, 2, 2, 10), pane);
            await historyService.goBack();
            assertTextSelection(new selection_1.$ms(2, 2, 2, 10), pane); // no change
            assert.strictEqual(part.activeGroup.activeEditor?.resource?.toString(), resource1.toString());
            return (0, workbenchTestServices_1.$hfc)(instantiationService);
        });
        test('go to last edit location', async function () {
            const [, historyService, editorService, textFileService, instantiationService] = await createServices();
            const resource = utils_1.$0S.call(this, '/path/index.txt');
            const otherResource = utils_1.$0S.call(this, '/path/index.html');
            await editorService.openEditor({ resource });
            const model = await textFileService.files.resolve(resource);
            model.textEditorModel.setValue('Hello World');
            await (0, async_1.$Hg)(10); // history debounces change events
            await editorService.openEditor({ resource: otherResource });
            const onDidActiveEditorChange = new async_1.$2g();
            disposables.add(editorService.onDidActiveEditorChange(e => {
                onDidActiveEditorChange.complete(e);
            }));
            historyService.goLast(1 /* GoFilter.EDITS */);
            await onDidActiveEditorChange.p;
            assert.strictEqual(editorService.activeEditor?.resource?.toString(), resource.toString());
            return (0, workbenchTestServices_1.$hfc)(instantiationService);
        });
        test('reopen closed editor', async function () {
            const [, historyService, editorService, , instantiationService] = await createServices();
            const resource = utils_1.$0S.call(this, '/path/index.txt');
            const pane = await editorService.openEditor({ resource });
            await pane?.group?.closeAllEditors();
            const onDidActiveEditorChange = new async_1.$2g();
            disposables.add(editorService.onDidActiveEditorChange(e => {
                onDidActiveEditorChange.complete(e);
            }));
            historyService.reopenLastClosedEditor();
            await onDidActiveEditorChange.p;
            assert.strictEqual(editorService.activeEditor?.resource?.toString(), resource.toString());
            return (0, workbenchTestServices_1.$hfc)(instantiationService);
        });
        test('getHistory', async () => {
            class TestFileEditorInputWithUntyped extends workbenchTestServices_1.$Zec {
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
            const input1 = disposables.add(new workbenchTestServices_1.$Zec(uri_1.URI.parse('foo://bar1'), TEST_EDITOR_INPUT_ID));
            await part.activeGroup.openEditor(input1, { pinned: true });
            const input2 = disposables.add(new workbenchTestServices_1.$Zec(uri_1.URI.parse('foo://bar2'), TEST_EDITOR_INPUT_ID));
            await part.activeGroup.openEditor(input2, { pinned: true });
            const input3 = disposables.add(new TestFileEditorInputWithUntyped(uri_1.URI.parse('foo://bar3'), TEST_EDITOR_INPUT_ID));
            await part.activeGroup.openEditor(input3, { pinned: true });
            const input4 = disposables.add(new TestFileEditorInputWithUntyped(uri_1.URI.file('bar4'), TEST_EDITOR_INPUT_ID));
            await part.activeGroup.openEditor(input4, { pinned: true });
            history = historyService.getHistory();
            assert.strictEqual(history.length, 4);
            // first entry is untyped because it implements `toUntyped` and has a supported scheme
            assert.strictEqual((0, editor_1.$NE)(history[0]) && !(history[0] instanceof editorInput_1.$tA), true);
            assert.strictEqual(history[0].options?.override, 'testOverride');
            // second entry is not untyped even though it implements `toUntyped` but has unsupported scheme
            assert.strictEqual(history[1] instanceof editorInput_1.$tA, true);
            assert.strictEqual(history[2] instanceof editorInput_1.$tA, true);
            assert.strictEqual(history[3] instanceof editorInput_1.$tA, true);
            historyService.removeFromHistory(input2);
            history = historyService.getHistory();
            assert.strictEqual(history.length, 3);
            assert.strictEqual(history[0].resource?.toString(), input4.resource.toString());
            return (0, workbenchTestServices_1.$hfc)(instantiationService);
        });
        test('getLastActiveFile', async () => {
            const [part, historyService] = await createServices();
            assert.ok(!historyService.getLastActiveFile('foo'));
            const input1 = disposables.add(new workbenchTestServices_1.$Zec(uri_1.URI.parse('foo://bar1'), TEST_EDITOR_INPUT_ID));
            await part.activeGroup.openEditor(input1, { pinned: true });
            assert.strictEqual(historyService.getLastActiveFile('foo')?.toString(), input1.resource.toString());
        });
        test('open next/previous recently used editor (single group)', async () => {
            const [part, historyService, editorService, , instantiationService] = await createServices();
            const input1 = disposables.add(new workbenchTestServices_1.$Zec(uri_1.URI.parse('foo://bar1'), TEST_EDITOR_INPUT_ID));
            const input2 = disposables.add(new workbenchTestServices_1.$Zec(uri_1.URI.parse('foo://bar2'), TEST_EDITOR_INPUT_ID));
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
            return (0, workbenchTestServices_1.$hfc)(instantiationService);
        });
        test('open next/previous recently used editor (multi group)', async () => {
            const [part, historyService, editorService, , instantiationService] = await createServices();
            const rootGroup = part.activeGroup;
            const input1 = disposables.add(new workbenchTestServices_1.$Zec(uri_1.URI.parse('foo://bar1'), TEST_EDITOR_INPUT_ID));
            const input2 = disposables.add(new workbenchTestServices_1.$Zec(uri_1.URI.parse('foo://bar2'), TEST_EDITOR_INPUT_ID));
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
            return (0, workbenchTestServices_1.$hfc)(instantiationService);
        });
        test('open next/previous recently is reset when other input opens', async () => {
            const [part, historyService, editorService, , instantiationService] = await createServices();
            const input1 = disposables.add(new workbenchTestServices_1.$Zec(uri_1.URI.parse('foo://bar1'), TEST_EDITOR_INPUT_ID));
            const input2 = disposables.add(new workbenchTestServices_1.$Zec(uri_1.URI.parse('foo://bar2'), TEST_EDITOR_INPUT_ID));
            const input3 = disposables.add(new workbenchTestServices_1.$Zec(uri_1.URI.parse('foo://bar3'), TEST_EDITOR_INPUT_ID));
            const input4 = disposables.add(new workbenchTestServices_1.$Zec(uri_1.URI.parse('foo://bar4'), TEST_EDITOR_INPUT_ID));
            await part.activeGroup.openEditor(input1, { pinned: true });
            await part.activeGroup.openEditor(input2, { pinned: true });
            await part.activeGroup.openEditor(input3, { pinned: true });
            let editorChangePromise = event_1.Event.toPromise(editorService.onDidActiveEditorChange);
            historyService.openPreviouslyUsedEditor();
            await editorChangePromise;
            assert.strictEqual(part.activeGroup.activeEditor, input2);
            await (0, async_1.$Hg)(0);
            await part.activeGroup.openEditor(input4, { pinned: true });
            editorChangePromise = event_1.Event.toPromise(editorService.onDidActiveEditorChange);
            historyService.openPreviouslyUsedEditor();
            await editorChangePromise;
            assert.strictEqual(part.activeGroup.activeEditor, input2);
            editorChangePromise = event_1.Event.toPromise(editorService.onDidActiveEditorChange);
            historyService.openNextRecentlyUsedEditor();
            await editorChangePromise;
            assert.strictEqual(part.activeGroup.activeEditor, input4);
            return (0, workbenchTestServices_1.$hfc)(instantiationService);
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=historyService.test.js.map