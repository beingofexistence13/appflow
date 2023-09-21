/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/platform/files/common/files", "vs/workbench/test/common/workbenchTestServices", "vs/platform/instantiation/common/instantiationService", "vs/platform/instantiation/common/serviceCollection", "vs/editor/common/services/model", "vs/base/common/uri", "vs/workbench/contrib/bulkEdit/browser/preview/bulkEditPreview", "vs/editor/common/core/range", "vs/editor/browser/services/bulkEditService", "vs/base/test/common/utils"], function (require, exports, assert, event_1, files_1, workbenchTestServices_1, instantiationService_1, serviceCollection_1, model_1, uri_1, bulkEditPreview_1, range_1, bulkEditService_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('BulkEditPreview', function () {
        const store = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        let instaService;
        setup(function () {
            const fileService = new class extends (0, workbenchTestServices_1.mock)() {
                constructor() {
                    super(...arguments);
                    this.onDidFilesChange = event_1.Event.None;
                }
                async exists() {
                    return true;
                }
            };
            const modelService = new class extends (0, workbenchTestServices_1.mock)() {
                getModel() {
                    return null;
                }
                getModels() {
                    return [];
                }
            };
            instaService = new instantiationService_1.InstantiationService(new serviceCollection_1.ServiceCollection([files_1.IFileService, fileService], [model_1.IModelService, modelService]));
        });
        test('one needsConfirmation unchecks all of file', async function () {
            const edits = [
                new bulkEditService_1.ResourceFileEdit(undefined, uri_1.URI.parse('some:///uri1'), undefined, { label: 'cat1', needsConfirmation: true }),
                new bulkEditService_1.ResourceFileEdit(uri_1.URI.parse('some:///uri1'), uri_1.URI.parse('some:///uri2'), undefined, { label: 'cat2', needsConfirmation: false }),
            ];
            const ops = await instaService.invokeFunction(bulkEditPreview_1.BulkFileOperations.create, edits);
            store.add(ops);
            assert.strictEqual(ops.fileOperations.length, 1);
            assert.strictEqual(ops.checked.isChecked(edits[0]), false);
        });
        test('has categories', async function () {
            const edits = [
                new bulkEditService_1.ResourceFileEdit(undefined, uri_1.URI.parse('some:///uri1'), undefined, { label: 'uri1', needsConfirmation: true }),
                new bulkEditService_1.ResourceFileEdit(undefined, uri_1.URI.parse('some:///uri2'), undefined, { label: 'uri2', needsConfirmation: false }),
            ];
            const ops = await instaService.invokeFunction(bulkEditPreview_1.BulkFileOperations.create, edits);
            store.add(ops);
            assert.strictEqual(ops.categories.length, 2);
            assert.strictEqual(ops.categories[0].metadata.label, 'uri1'); // unconfirmed!
            assert.strictEqual(ops.categories[1].metadata.label, 'uri2');
        });
        test('has not categories', async function () {
            const edits = [
                new bulkEditService_1.ResourceFileEdit(undefined, uri_1.URI.parse('some:///uri1'), undefined, { label: 'uri1', needsConfirmation: true }),
                new bulkEditService_1.ResourceFileEdit(undefined, uri_1.URI.parse('some:///uri2'), undefined, { label: 'uri1', needsConfirmation: false }),
            ];
            const ops = await instaService.invokeFunction(bulkEditPreview_1.BulkFileOperations.create, edits);
            store.add(ops);
            assert.strictEqual(ops.categories.length, 1);
            assert.strictEqual(ops.categories[0].metadata.label, 'uri1'); // unconfirmed!
            assert.strictEqual(ops.categories[0].metadata.label, 'uri1');
        });
        test('category selection', async function () {
            const edits = [
                new bulkEditService_1.ResourceFileEdit(undefined, uri_1.URI.parse('some:///uri1'), undefined, { label: 'C1', needsConfirmation: false }),
                new bulkEditService_1.ResourceTextEdit(uri_1.URI.parse('some:///uri2'), { text: 'foo', range: new range_1.Range(1, 1, 1, 1) }, undefined, { label: 'C2', needsConfirmation: false }),
            ];
            const ops = await instaService.invokeFunction(bulkEditPreview_1.BulkFileOperations.create, edits);
            store.add(ops);
            assert.strictEqual(ops.checked.isChecked(edits[0]), true);
            assert.strictEqual(ops.checked.isChecked(edits[1]), true);
            assert.ok(edits === ops.getWorkspaceEdit());
            // NOT taking to create, but the invalid text edit will
            // go through
            ops.checked.updateChecked(edits[0], false);
            const newEdits = ops.getWorkspaceEdit();
            assert.ok(edits !== newEdits);
            assert.strictEqual(edits.length, 2);
            assert.strictEqual(newEdits.length, 1);
        });
        test('fix bad metadata', async function () {
            // bogous edit that wants creation to be confirmed, but not it's textedit-child...
            const edits = [
                new bulkEditService_1.ResourceFileEdit(undefined, uri_1.URI.parse('some:///uri1'), undefined, { label: 'C1', needsConfirmation: true }),
                new bulkEditService_1.ResourceTextEdit(uri_1.URI.parse('some:///uri1'), { text: 'foo', range: new range_1.Range(1, 1, 1, 1) }, undefined, { label: 'C2', needsConfirmation: false })
            ];
            const ops = await instaService.invokeFunction(bulkEditPreview_1.BulkFileOperations.create, edits);
            store.add(ops);
            assert.strictEqual(ops.checked.isChecked(edits[0]), false);
            assert.strictEqual(ops.checked.isChecked(edits[1]), false);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVsa0VkaXRQcmV2aWV3LnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9idWxrRWRpdC90ZXN0L2Jyb3dzZXIvYnVsa0VkaXRQcmV2aWV3LnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFnQmhHLEtBQUssQ0FBQyxpQkFBaUIsRUFBRTtRQUV4QixNQUFNLEtBQUssR0FBRyxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFeEQsSUFBSSxZQUFtQyxDQUFDO1FBRXhDLEtBQUssQ0FBQztZQUVMLE1BQU0sV0FBVyxHQUFpQixJQUFJLEtBQU0sU0FBUSxJQUFBLDRCQUFJLEdBQWdCO2dCQUFsQzs7b0JBQzVCLHFCQUFnQixHQUFHLGFBQUssQ0FBQyxJQUFJLENBQUM7Z0JBSXhDLENBQUM7Z0JBSFMsS0FBSyxDQUFDLE1BQU07b0JBQ3BCLE9BQU8sSUFBSSxDQUFDO2dCQUNiLENBQUM7YUFDRCxDQUFDO1lBRUYsTUFBTSxZQUFZLEdBQWtCLElBQUksS0FBTSxTQUFRLElBQUEsNEJBQUksR0FBaUI7Z0JBQ2pFLFFBQVE7b0JBQ2hCLE9BQU8sSUFBSSxDQUFDO2dCQUNiLENBQUM7Z0JBQ1EsU0FBUztvQkFDakIsT0FBTyxFQUFFLENBQUM7Z0JBQ1gsQ0FBQzthQUNELENBQUM7WUFFRixZQUFZLEdBQUcsSUFBSSwyQ0FBb0IsQ0FBQyxJQUFJLHFDQUFpQixDQUM1RCxDQUFDLG9CQUFZLEVBQUUsV0FBVyxDQUFDLEVBQzNCLENBQUMscUJBQWEsRUFBRSxZQUFZLENBQUMsQ0FDN0IsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsNENBQTRDLEVBQUUsS0FBSztZQUV2RCxNQUFNLEtBQUssR0FBRztnQkFDYixJQUFJLGtDQUFnQixDQUFDLFNBQVMsRUFBRSxTQUFHLENBQUMsS0FBSyxDQUFD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