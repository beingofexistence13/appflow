/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/base/common/mime", "vs/base/common/uri", "vs/base/test/common/mock", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/extensions/common/extensions", "vs/workbench/contrib/notebook/common/model/notebookTextModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookEditorModel", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/contrib/notebook/test/browser/testNotebookEditor"], function (require, exports, assert, buffer_1, cancellation_1, lifecycle_1, mime_1, uri_1, mock_1, testConfigurationService_1, extensions_1, notebookTextModel_1, notebookCommon_1, notebookEditorModel_1, notebookService_1, testNotebookEditor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('NotebookFileWorkingCopyModel', function () {
        let disposables;
        let instantiationService;
        const configurationService = new testConfigurationService_1.$G0b();
        teardown(() => disposables.dispose());
        setup(() => {
            disposables = new lifecycle_1.$jc();
            instantiationService = (0, testNotebookEditor_1.$Ifc)(disposables);
        });
        test('no transient output is send to serializer', async function () {
            const notebook = instantiationService.createInstance(notebookTextModel_1.$MH, 'notebook', uri_1.URI.file('test'), [{ cellKind: notebookCommon_1.CellKind.Code, language: 'foo', mime: 'foo', source: 'foo', outputs: [{ outputId: 'id', outputs: [{ mime: mime_1.$Hr.text, data: buffer_1.$Fd.fromString('Hello Out') }] }] }], {}, { transientCellMetadata: {}, transientDocumentMetadata: {}, cellContentMetadata: {}, transientOutputs: false });
            { // transient output
                let callCount = 0;
                const model = disposables.add(new notebookEditorModel_1.$asb(notebook, mockNotebookService(notebook, new class extends (0, mock_1.$rT)() {
                    constructor() {
                        super(...arguments);
                        this.options = { transientOutputs: true, transientCellMetadata: {}, transientDocumentMetadata: {}, cellContentMetadata: {} };
                    }
                    async notebookToData(notebook) {
                        callCount += 1;
                        assert.strictEqual(notebook.cells.length, 1);
                        assert.strictEqual(notebook.cells[0].outputs.length, 0);
                        return buffer_1.$Fd.fromString('');
                    }
                }), configurationService));
                await model.snapshot(cancellation_1.CancellationToken.None);
                assert.strictEqual(callCount, 1);
            }
            { // NOT transient output
                let callCount = 0;
                const model = disposables.add(new notebookEditorModel_1.$asb(notebook, mockNotebookService(notebook, new class extends (0, mock_1.$rT)() {
                    constructor() {
                        super(...arguments);
                        this.options = { transientOutputs: false, transientCellMetadata: {}, transientDocumentMetadata: {}, cellContentMetadata: {} };
                    }
                    async notebookToData(notebook) {
                        callCount += 1;
                        assert.strictEqual(notebook.cells.length, 1);
                        assert.strictEqual(notebook.cells[0].outputs.length, 1);
                        return buffer_1.$Fd.fromString('');
                    }
                }), configurationService));
                await model.snapshot(cancellation_1.CancellationToken.None);
                assert.strictEqual(callCount, 1);
            }
        });
        test('no transient metadata is send to serializer', async function () {
            const notebook = instantiationService.createInstance(notebookTextModel_1.$MH, 'notebook', uri_1.URI.file('test'), [{ cellKind: notebookCommon_1.CellKind.Code, language: 'foo', mime: 'foo', source: 'foo', outputs: [] }], { foo: 123, bar: 456 }, { transientCellMetadata: {}, transientDocumentMetadata: {}, cellContentMetadata: {}, transientOutputs: false });
            { // transient
                let callCount = 0;
                const model = new notebookEditorModel_1.$asb(notebook, mockNotebookService(notebook, new class extends (0, mock_1.$rT)() {
                    constructor() {
                        super(...arguments);
                        this.options = { transientOutputs: true, transientCellMetadata: {}, transientDocumentMetadata: { bar: true }, cellContentMetadata: {} };
                    }
                    async notebookToData(notebook) {
                        callCount += 1;
                        assert.strictEqual(notebook.metadata.foo, 123);
                        assert.strictEqual(notebook.metadata.bar, undefined);
                        return buffer_1.$Fd.fromString('');
                    }
                }), configurationService);
                await model.snapshot(cancellation_1.CancellationToken.None);
                assert.strictEqual(callCount, 1);
            }
            { // NOT transient
                let callCount = 0;
                const model = new notebookEditorModel_1.$asb(notebook, mockNotebookService(notebook, new class extends (0, mock_1.$rT)() {
                    constructor() {
                        super(...arguments);
                        this.options = { transientOutputs: false, transientCellMetadata: {}, transientDocumentMetadata: {}, cellContentMetadata: {} };
                    }
                    async notebookToData(notebook) {
                        callCount += 1;
                        assert.strictEqual(notebook.metadata.foo, 123);
                        assert.strictEqual(notebook.metadata.bar, 456);
                        return buffer_1.$Fd.fromString('');
                    }
                }), configurationService);
                await model.snapshot(cancellation_1.CancellationToken.None);
                assert.strictEqual(callCount, 1);
            }
        });
        test('no transient cell metadata is send to serializer', async function () {
            const notebook = instantiationService.createInstance(notebookTextModel_1.$MH, 'notebook', uri_1.URI.file('test'), [{ cellKind: notebookCommon_1.CellKind.Code, language: 'foo', mime: 'foo', source: 'foo', outputs: [], metadata: { foo: 123, bar: 456 } }], {}, { transientCellMetadata: {}, transientDocumentMetadata: {}, cellContentMetadata: {}, transientOutputs: false, });
            { // transient
                let callCount = 0;
                const model = new notebookEditorModel_1.$asb(notebook, mockNotebookService(notebook, new class extends (0, mock_1.$rT)() {
                    constructor() {
                        super(...arguments);
                        this.options = { transientOutputs: true, transientDocumentMetadata: {}, transientCellMetadata: { bar: true }, cellContentMetadata: {} };
                    }
                    async notebookToData(notebook) {
                        callCount += 1;
                        assert.strictEqual(notebook.cells[0].metadata.foo, 123);
                        assert.strictEqual(notebook.cells[0].metadata.bar, undefined);
                        return buffer_1.$Fd.fromString('');
                    }
                }), configurationService);
                await model.snapshot(cancellation_1.CancellationToken.None);
                assert.strictEqual(callCount, 1);
            }
            { // NOT transient
                let callCount = 0;
                const model = new notebookEditorModel_1.$asb(notebook, mockNotebookService(notebook, new class extends (0, mock_1.$rT)() {
                    constructor() {
                        super(...arguments);
                        this.options = { transientOutputs: false, transientCellMetadata: {}, transientDocumentMetadata: {}, cellContentMetadata: {} };
                    }
                    async notebookToData(notebook) {
                        callCount += 1;
                        assert.strictEqual(notebook.cells[0].metadata.foo, 123);
                        assert.strictEqual(notebook.cells[0].metadata.bar, 456);
                        return buffer_1.$Fd.fromString('');
                    }
                }), configurationService);
                await model.snapshot(cancellation_1.CancellationToken.None);
                assert.strictEqual(callCount, 1);
            }
        });
    });
    function mockNotebookService(notebook, notebookSerializer) {
        return new class extends (0, mock_1.$rT)() {
            async withNotebookDataProvider(viewType) {
                return new notebookService_1.$vbb(notebook.viewType, notebookSerializer, {
                    id: new extensions_1.$Vl('test'),
                    location: undefined
                });
            }
        };
    }
});
//# sourceMappingURL=notebookEditorModel.test.js.map