/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/platform/files/common/files", "vs/workbench/test/common/workbenchTestServices", "vs/platform/instantiation/common/instantiationService", "vs/platform/instantiation/common/serviceCollection", "vs/editor/common/services/model", "vs/base/common/uri", "vs/workbench/contrib/bulkEdit/browser/preview/bulkEditPreview", "vs/editor/common/core/range", "vs/editor/browser/services/bulkEditService", "vs/base/test/common/utils"], function (require, exports, assert, event_1, files_1, workbenchTestServices_1, instantiationService_1, serviceCollection_1, model_1, uri_1, bulkEditPreview_1, range_1, bulkEditService_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('BulkEditPreview', function () {
        const store = (0, utils_1.$bT)();
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
            instaService = new instantiationService_1.$6p(new serviceCollection_1.$zh([files_1.$6j, fileService], [model_1.$yA, modelService]));
        });
        test('one needsConfirmation unchecks all of file', async function () {
            const edits = [
                new bulkEditService_1.$q1(undefined, uri_1.URI.parse('some:///uri1'), undefined, { label: 'cat1', needsConfirmation: true }),
                new bulkEditService_1.$q1(uri_1.URI.parse('some:///uri1'), uri_1.URI.parse('some:///uri2'), undefined, { label: 'cat2', needsConfirmation: false }),
            ];
            const ops = await instaService.invokeFunction(bulkEditPreview_1.$jMb.create, edits);
            store.add(ops);
            assert.strictEqual(ops.fileOperations.length, 1);
            assert.strictEqual(ops.checked.isChecked(edits[0]), false);
        });
        test('has categories', async function () {
            const edits = [
                new bulkEditService_1.$q1(undefined, uri_1.URI.parse('some:///uri1'), undefined, { label: 'uri1', needsConfirmation: true }),
                new bulkEditService_1.$q1(undefined, uri_1.URI.parse('some:///uri2'), undefined, { label: 'uri2', needsConfirmation: false }),
            ];
            const ops = await instaService.invokeFunction(bulkEditPreview_1.$jMb.create, edits);
            store.add(ops);
            assert.strictEqual(ops.categories.length, 2);
            assert.strictEqual(ops.categories[0].metadata.label, 'uri1'); // unconfirmed!
            assert.strictEqual(ops.categories[1].metadata.label, 'uri2');
        });
        test('has not categories', async function () {
            const edits = [
                new bulkEditService_1.$q1(undefined, uri_1.URI.parse('some:///uri1'), undefined, { label: 'uri1', needsConfirmation: true }),
                new bulkEditService_1.$q1(undefined, uri_1.URI.parse('some:///uri2'), undefined, { label: 'uri1', needsConfirmation: false }),
            ];
            const ops = await instaService.invokeFunction(bulkEditPreview_1.$jMb.create, edits);
            store.add(ops);
            assert.strictEqual(ops.categories.length, 1);
            assert.strictEqual(ops.categories[0].metadata.label, 'uri1'); // unconfirmed!
            assert.strictEqual(ops.categories[0].metadata.label, 'uri1');
        });
        test('category selection', async function () {
            const edits = [
                new bulkEditService_1.$q1(undefined, uri_1.URI.parse('some:///uri1'), undefined, { label: 'C1', needsConfirmation: false }),
                new bulkEditService_1.$p1(uri_1.URI.parse('some:///uri2'), { text: 'foo', range: new range_1.$ks(1, 1, 1, 1) }, undefined, { label: 'C2', needsConfirmation: false }),
            ];
            const ops = await instaService.invokeFunction(bulkEditPreview_1.$jMb.create, edits);
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
                new bulkEditService_1.$q1(undefined, uri_1.URI.parse('some:///uri1'), undefined, { label: 'C1', needsConfirmation: true }),
                new bulkEditService_1.$p1(uri_1.URI.parse('some:///uri1'), { text: 'foo', range: new range_1.$ks(1, 1, 1, 1) }, undefined, { label: 'C2', needsConfirmation: false })
            ];
            const ops = await instaService.invokeFunction(bulkEditPreview_1.$jMb.create, edits);
            store.add(ops);
            assert.strictEqual(ops.checked.isChecked(edits[0]), false);
            assert.strictEqual(ops.checked.isChecked(edits[1]), false);
        });
    });
});
//# sourceMappingURL=bulkEditPreview.test.js.map