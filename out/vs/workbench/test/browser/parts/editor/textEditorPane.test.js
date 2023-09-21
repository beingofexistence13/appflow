/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/workbench/services/editor/common/editorService", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/services/editor/common/editorGroupsService", "vs/base/common/lifecycle", "vs/workbench/services/editor/browser/editorService", "vs/workbench/common/editor", "vs/base/common/async", "vs/workbench/browser/parts/editor/textEditor", "vs/editor/common/core/selection"], function (require, exports, assert, utils_1, editorService_1, workbenchTestServices_1, editorGroupsService_1, lifecycle_1, editorService_2, editor_1, async_1, textEditor_1, selection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('TextEditorPane', () => {
        const disposables = new lifecycle_1.DisposableStore();
        setup(() => {
            disposables.add((0, workbenchTestServices_1.registerTestFileEditor)());
        });
        teardown(() => {
            disposables.clear();
        });
        async function createServices() {
            const instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, disposables);
            const part = await (0, workbenchTestServices_1.createEditorPart)(instantiationService, disposables);
            instantiationService.stub(editorGroupsService_1.IEditorGroupsService, part);
            const editorService = disposables.add(instantiationService.createInstance(editorService_2.EditorService));
            instantiationService.stub(editorService_1.IEditorService, editorService);
            return instantiationService.createInstance(workbenchTestServices_1.TestServiceAccessor);
        }
        test('editor pane selection', async function () {
            const accessor = await createServices();
            const resource = utils_1.toResource.call(this, '/path/index.txt');
            let pane = await accessor.editorService.openEditor({ resource });
            assert.ok(pane && (0, editor_1.isEditorPaneWithSelection)(pane));
            const onDidFireSelectionEventOfEditType = new async_1.DeferredPromise();
            disposables.add(pane.onDidChangeSelection(e => {
                if (e.reason === 3 /* EditorPaneSelectionChangeReason.EDIT */) {
                    onDidFireSelectionEventOfEditType.complete(e);
                }
            }));
            // Changing model reports selection change
            // of EDIT kind
            const model = disposables.add(await accessor.textFileService.files.resolve(resource));
            model.textEditorModel.setValue('Hello World');
            const event = await onDidFireSelectionEventOfEditType.p;
            assert.strictEqual(event.reason, 3 /* EditorPaneSelectionChangeReason.EDIT */);
            // getSelection() works and can be restored
            //
            // Note: this is a bit bogus because in tests our code editors have
            //       no view and no cursor can be set as such. So the selection
            //       will always report for the first line and column.
            pane.setSelection(new selection_1.Selection(1, 1, 1, 1), 2 /* EditorPaneSelectionChangeReason.USER */);
            const selection = pane.getSelection();
            assert.ok(selection);
            await pane.group?.closeAllEditors();
            const options = selection.restore({});
            pane = await accessor.editorService.openEditor({ resource, options });
            assert.ok(pane && (0, editor_1.isEditorPaneWithSelection)(pane));
            const newSelection = pane.getSelection();
            assert.ok(newSelection);
            assert.strictEqual(newSelection.compare(selection), 1 /* EditorPaneSelectionCompareResult.IDENTICAL */);
            await model.revert();
            await pane.group?.closeAllEditors();
        });
        test('TextEditorPaneSelection', function () {
            const sel1 = new textEditor_1.TextEditorPaneSelection(new selection_1.Selection(1, 1, 2, 2));
            const sel2 = new textEditor_1.TextEditorPaneSelection(new selection_1.Selection(5, 5, 6, 6));
            const sel3 = new textEditor_1.TextEditorPaneSelection(new selection_1.Selection(50, 50, 60, 60));
            const sel4 = { compare: () => { throw new Error(); }, restore: (options) => options };
            assert.strictEqual(sel1.compare(sel1), 1 /* EditorPaneSelectionCompareResult.IDENTICAL */);
            assert.strictEqual(sel1.compare(sel2), 2 /* EditorPaneSelectionCompareResult.SIMILAR */);
            assert.strictEqual(sel1.compare(sel3), 3 /* EditorPaneSelectionCompareResult.DIFFERENT */);
            assert.strictEqual(sel1.compare(sel4), 3 /* EditorPaneSelectionCompareResult.DIFFERENT */);
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dEVkaXRvclBhbmUudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC90ZXN0L2Jyb3dzZXIvcGFydHMvZWRpdG9yL3RleHRFZGl0b3JQYW5lLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFnQmhHLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLEVBQUU7UUFFNUIsTUFBTSxXQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7UUFFMUMsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNWLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBQSw4Q0FBc0IsR0FBRSxDQUFDLENBQUM7UUFDM0MsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsR0FBRyxFQUFFO1lBQ2IsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3JCLENBQUMsQ0FBQyxDQUFDO1FBRUgsS0FBSyxVQUFVLGNBQWM7WUFDNUIsTUFBTSxvQkFBb0IsR0FBRyxJQUFBLHFEQUE2QixFQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUVuRixNQUFNLElBQUksR0FBRyxNQUFNLElBQUEsd0NBQWdCLEVBQUMsb0JBQW9CLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDdkUsb0JBQW9CLENBQUMsSUFBSSxDQUFDLDBDQUFvQixFQUFFLElBQUksQ0FBQyxDQUFDO1lBRXRELE1BQU0sYUFBYSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLDZCQUFhLENBQUMsQ0FBQyxDQUFDO1lBQzFGLG9CQUFvQixDQUFDLElBQUksQ0FBQyw4QkFBYyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBRXpELE9BQU8sb0JBQW9CLENBQUMsY0FBYyxDQUFDLDJDQUFtQixDQUFDLENBQUM7UUFDakUsQ0FBQztRQUVELElBQUksQ0FBQyx1QkFBdUIsRUFBRSxL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