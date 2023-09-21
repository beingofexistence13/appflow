/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/cancellation", "vs/base/common/uri", "vs/base/test/common/mock", "vs/platform/undoRedo/common/undoRedo", "vs/workbench/contrib/bulkEdit/browser/bulkCellEdits", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/test/browser/workbenchTestServices"], function (require, exports, assert, cancellation_1, uri_1, mock_1, undoRedo_1, bulkCellEdits_1, notebookCommon_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('BulkCellEdits', function () {
        async function runTest(inputUri, resolveUri) {
            const progress = { report: _ => { } };
            const editorService = new workbenchTestServices_1.TestEditorService();
            const notebook = (0, mock_1.mockObject)()();
            notebook.uri.returns(uri_1.URI.file('/project/notebook.ipynb'));
            const notebookEditorModel = (0, mock_1.mockObject)()({ notebook: notebook });
            notebookEditorModel.isReadonly.returns(false);
            const notebookService = (0, mock_1.mockObject)()();
            notebookService.resolve.returns({ object: notebookEditorModel, dispose: () => { } });
            const edits = [
                new bulkCellEdits_1.ResourceNotebookCellEdit(inputUri, { index: 0, count: 1, editType: 1 /* CellEditType.Replace */, cells: [] })
            ];
            const bce = new bulkCellEdits_1.BulkCellEdits(new undoRedo_1.UndoRedoGroup(), new undoRedo_1.UndoRedoSource(), progress, new cancellation_1.CancellationTokenSource().token, edits, editorService, notebookService);
            await bce.apply();
            const resolveArgs = notebookService.resolve.args[0];
            assert.strictEqual(resolveArgs[0].toString(), resolveUri.toString());
        }
        const notebookUri = uri_1.URI.file('/foo/bar.ipynb');
        test('works with notebook URI', async () => {
            await runTest(notebookUri, notebookUri);
        });
        test('maps cell URI to notebook URI', async () => {
            await runTest(notebookCommon_1.CellUri.generate(notebookUri, 5), notebookUri);
        });
        test('throws for invalid cell URI', async () => {
            const badCellUri = notebookCommon_1.CellUri.generate(notebookUri, 5).with({ fragment: '' });
            await assert.rejects(async () => await runTest(badCellUri, notebookUri));
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVsa0NlbGxFZGl0cy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvYnVsa0VkaXQvdGVzdC9icm93c2VyL2J1bGtDZWxsRWRpdHMudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQWNoRyxLQUFLLENBQUMsZUFBZSxFQUFFO1FBQ3RCLEtBQUssVUFBVSxPQUFPLENBQUMsUUFBYSxFQUFFLFVBQWU7WUFDcEQsTUFBTSxRQUFRLEdBQW9CLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDdkQsTUFBTSxhQUFhLEdBQUcsSUFBSSx5Q0FBaUIsRUFBRSxDQUFDO1lBRTlDLE1BQU0sUUFBUSxHQUFHLElBQUEsaUJBQVUsR0FBcUIsRUFBRSxDQUFDO1lBQ25ELFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQUcsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDO1lBRTFELE1BQU0sbUJBQW1CLEdBQUcsSUFBQSxpQkFBVSxHQUFnQyxDQUFDLEVBQUUsUUFBUSxFQUFFLFFBQWUsRUFBRSxDQUFDLENBQUM7WUFDdEcsbUJBQW1CLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUU5QyxNQUFNLGVBQWUsR0FBRyxJQUFBLGlCQUFVLEdBQXVDLEVBQUUsQ0FBQztZQUM1RSxlQUFlLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLE1BQU0sRUFBRSxtQkFBbUIsRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUVyRixNQUFNLEtBQUssR0FBRztnQkFDYixJQUFJLHdDQUF3QixDQUFDLFFBQVEsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxRQUFRLDhCQUFzQixFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsQ0FBQzthQUN6RyxDQUFDO1lBQ0YsTUFBTSxHQUFHLEdBQUcsSUFBSSw2QkFBYSxDQUFDLElBQUksd0JBQWEsRUFBRSxFQUFFLElBQUkseUJBQWMsRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLHNDQUF1QixFQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsZUFBc0IsQ0FBQyxDQUFDO1lBQ3RLLE1BQU0sR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBRWxCLE1BQU0sV0FBVyxHQUFHLGVBQWUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BELE1BQU0sQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ3RFLENBQUM7UUFFRCxNQUFNLFdBQVcsR0FBRyxTQUFHLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDL0MsSUFBSSxDQUFDLHlCQUF5QixFQUFFLEtBQUssSUFBSSxFQUFFO1lBQzFDLE1BQU0sT0FBTyxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUN6QyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQywrQkFBK0IsRUFBRSxLQUFLLElBQUksRUFBRTtZQUNoRCxNQUFNLE9BQU8sQ0FBQyx3QkFBTyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDOUQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsNkJBQTZCLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDOUMsTUFBTSxVQUFVLEdBQUcsd0JBQU8sQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzNFLE1BQU0sTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDLE1BQU0sT0FBTyxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQzFFLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUMifQ==