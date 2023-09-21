/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/workbench/services/editor/common/editorService", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/services/editor/common/editorGroupsService", "vs/base/common/lifecycle", "vs/workbench/services/editor/browser/editorService", "vs/workbench/common/editor", "vs/base/common/async", "vs/workbench/browser/parts/editor/textEditor", "vs/editor/common/core/selection"], function (require, exports, assert, utils_1, editorService_1, workbenchTestServices_1, editorGroupsService_1, lifecycle_1, editorService_2, editor_1, async_1, textEditor_1, selection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('TextEditorPane', () => {
        const disposables = new lifecycle_1.$jc();
        setup(() => {
            disposables.add((0, workbenchTestServices_1.$Wec)());
        });
        teardown(() => {
            disposables.clear();
        });
        async function createServices() {
            const instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            const part = await (0, workbenchTestServices_1.$3ec)(instantiationService, disposables);
            instantiationService.stub(editorGroupsService_1.$5C, part);
            const editorService = disposables.add(instantiationService.createInstance(editorService_2.$Lyb));
            instantiationService.stub(editorService_1.$9C, editorService);
            return instantiationService.createInstance(workbenchTestServices_1.$mec);
        }
        test('editor pane selection', async function () {
            const accessor = await createServices();
            const resource = utils_1.$0S.call(this, '/path/index.txt');
            let pane = await accessor.editorService.openEditor({ resource });
            assert.ok(pane && (0, editor_1.$LE)(pane));
            const onDidFireSelectionEventOfEditType = new async_1.$2g();
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
            pane.setSelection(new selection_1.$ms(1, 1, 1, 1), 2 /* EditorPaneSelectionChangeReason.USER */);
            const selection = pane.getSelection();
            assert.ok(selection);
            await pane.group?.closeAllEditors();
            const options = selection.restore({});
            pane = await accessor.editorService.openEditor({ resource, options });
            assert.ok(pane && (0, editor_1.$LE)(pane));
            const newSelection = pane.getSelection();
            assert.ok(newSelection);
            assert.strictEqual(newSelection.compare(selection), 1 /* EditorPaneSelectionCompareResult.IDENTICAL */);
            await model.revert();
            await pane.group?.closeAllEditors();
        });
        test('TextEditorPaneSelection', function () {
            const sel1 = new textEditor_1.$peb(new selection_1.$ms(1, 1, 2, 2));
            const sel2 = new textEditor_1.$peb(new selection_1.$ms(5, 5, 6, 6));
            const sel3 = new textEditor_1.$peb(new selection_1.$ms(50, 50, 60, 60));
            const sel4 = { compare: () => { throw new Error(); }, restore: (options) => options };
            assert.strictEqual(sel1.compare(sel1), 1 /* EditorPaneSelectionCompareResult.IDENTICAL */);
            assert.strictEqual(sel1.compare(sel2), 2 /* EditorPaneSelectionCompareResult.SIMILAR */);
            assert.strictEqual(sel1.compare(sel3), 3 /* EditorPaneSelectionCompareResult.DIFFERENT */);
            assert.strictEqual(sel1.compare(sel4), 3 /* EditorPaneSelectionCompareResult.DIFFERENT */);
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=textEditorPane.test.js.map