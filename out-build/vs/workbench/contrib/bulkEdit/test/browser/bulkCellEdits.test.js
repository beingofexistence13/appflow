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
            const editorService = new workbenchTestServices_1.$Eec();
            const notebook = (0, mock_1.$sT)()();
            notebook.uri.returns(uri_1.URI.file('/project/notebook.ipynb'));
            const notebookEditorModel = (0, mock_1.$sT)()({ notebook: notebook });
            notebookEditorModel.isReadonly.returns(false);
            const notebookService = (0, mock_1.$sT)()();
            notebookService.resolve.returns({ object: notebookEditorModel, dispose: () => { } });
            const edits = [
                new bulkCellEdits_1.$3bb(inputUri, { index: 0, count: 1, editType: 1 /* CellEditType.Replace */, cells: [] })
            ];
            const bce = new bulkCellEdits_1.$4bb(new undoRedo_1.$yu(), new undoRedo_1.$zu(), progress, new cancellation_1.$pd().token, edits, editorService, notebookService);
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
//# sourceMappingURL=bulkCellEdits.test.js.map