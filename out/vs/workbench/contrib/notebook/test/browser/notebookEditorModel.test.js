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
        const configurationService = new testConfigurationService_1.TestConfigurationService();
        teardown(() => disposables.dispose());
        setup(() => {
            disposables = new lifecycle_1.DisposableStore();
            instantiationService = (0, testNotebookEditor_1.setupInstantiationService)(disposables);
        });
        test('no transient output is send to serializer', async function () {
            const notebook = instantiationService.createInstance(notebookTextModel_1.NotebookTextModel, 'notebook', uri_1.URI.file('test'), [{ cellKind: notebookCommon_1.CellKind.Code, language: 'foo', mime: 'foo', source: 'foo', outputs: [{ outputId: 'id', outputs: [{ mime: mime_1.Mimes.text, data: buffer_1.VSBuffer.fromString('Hello Out') }] }] }], {}, { transientCellMetadata: {}, transientDocumentMetadata: {}, cellContentMetadata: {}, transientOutputs: false });
            { // transient output
                let callCount = 0;
                const model = disposables.add(new notebookEditorModel_1.NotebookFileWorkingCopyModel(notebook, mockNotebookService(notebook, new class extends (0, mock_1.mock)() {
                    constructor() {
                        super(...arguments);
                        this.options = { transientOutputs: true, transientCellMetadata: {}, transientDocumentMetadata: {}, cellContentMetadata: {} };
                    }
                    async notebookToData(notebook) {
                        callCount += 1;
                        assert.strictEqual(notebook.cells.length, 1);
                        assert.strictEqual(notebook.cells[0].outputs.length, 0);
                        return buffer_1.VSBuffer.fromString('');
                    }
                }), configurationService));
                await model.snapshot(cancellation_1.CancellationToken.None);
                assert.strictEqual(callCount, 1);
            }
            { // NOT transient output
                let callCount = 0;
                const model = disposables.add(new notebookEditorModel_1.NotebookFileWorkingCopyModel(notebook, mockNotebookService(notebook, new class extends (0, mock_1.mock)() {
                    constructor() {
                        super(...arguments);
                        this.options = { transientOutputs: false, transientCellMetadata: {}, transientDocumentMetadata: {}, cellContentMetadata: {} };
                    }
                    async notebookToData(notebook) {
                        callCount += 1;
                        assert.strictEqual(notebook.cells.length, 1);
                        assert.strictEqual(notebook.cells[0].outputs.length, 1);
                        return buffer_1.VSBuffer.fromString('');
                    }
                }), configurationService));
                await model.snapshot(cancellation_1.CancellationToken.None);
                assert.strictEqual(callCount, 1);
            }
        });
        test('no transient metadata is send to serializer', async function () {
            const notebook = instantiationService.createInstance(notebookTextModel_1.NotebookTextModel, 'notebook', uri_1.URI.file('test'), [{ cellKind: notebookCommon_1.CellKind.Code, language: 'foo', mime: 'foo', source: 'foo', outputs: [] }], { foo: 123, bar: 456 }, { transientCellMetadata: {}, transientDocumentMetadata: {}, cellContentMetadata: {}, transientOutputs: false });
            { // transient
                let callCount = 0;
                const model = new notebookEditorModel_1.NotebookFileWorkingCopyModel(notebook, mockNotebookService(notebook, new class extends (0, mock_1.mock)() {
                    constructor() {
                        super(...arguments);
                        this.options = { transientOutputs: true, transientCellMetadata: {}, transientDocumentMetadata: { bar: true }, cellContentMetadata: {} };
                    }
                    async notebookToData(notebook) {
                        callCount += 1;
                        assert.strictEqual(notebook.metadata.foo, 123);
                        assert.strictEqual(notebook.metadata.bar, undefined);
                        return buffer_1.VSBuffer.fromString('');
                    }
                }), configurationService);
                await model.snapshot(cancellation_1.CancellationToken.None);
                assert.strictEqual(callCount, 1);
            }
            { // NOT transient
                let callCount = 0;
                const model = new notebookEditorModel_1.NotebookFileWorkingCopyModel(notebook, mockNotebookService(notebook, new class extends (0, mock_1.mock)() {
                    constructor() {
                        super(...arguments);
                        this.options = { transientOutputs: false, transientCellMetadata: {}, transientDocumentMetadata: {}, cellContentMetadata: {} };
                    }
                    async notebookToData(notebook) {
                        callCount += 1;
                        assert.strictEqual(notebook.metadata.foo, 123);
                        assert.strictEqual(notebook.metadata.bar, 456);
                        return buffer_1.VSBuffer.fromString('');
                    }
                }), configurationService);
                await model.snapshot(cancellation_1.CancellationToken.None);
                assert.strictEqual(callCount, 1);
            }
        });
        test('no transient cell metadata is send to serializer', async function () {
            const notebook = instantiationService.createInstance(notebookTextModel_1.NotebookTextModel, 'notebook', uri_1.URI.file('test'), [{ cellKind: notebookCommon_1.CellKind.Code, language: 'foo', mime: 'foo', source: 'foo', outputs: [], metadata: { foo: 123, bar: 456 } }], {}, { transientCellMetadata: {}, transientDocumentMetadata: {}, cellContentMetadata: {}, transientOutputs: false, });
            { // transient
                let callCount = 0;
                const model = new notebookEditorModel_1.NotebookFileWorkingCopyModel(notebook, mockNotebookService(notebook, new class extends (0, mock_1.mock)() {
                    constructor() {
                        super(...arguments);
                        this.options = { transientOutputs: true, transientDocumentMetadata: {}, transientCellMetadata: { bar: true }, cellContentMetadata: {} };
                    }
                    async notebookToData(notebook) {
                        callCount += 1;
                        assert.strictEqual(notebook.cells[0].metadata.foo, 123);
                        assert.strictEqual(notebook.cells[0].metadata.bar, undefined);
                        return buffer_1.VSBuffer.fromString('');
                    }
                }), configurationService);
                await model.snapshot(cancellation_1.CancellationToken.None);
                assert.strictEqual(callCount, 1);
            }
            { // NOT transient
                let callCount = 0;
                const model = new notebookEditorModel_1.NotebookFileWorkingCopyModel(notebook, mockNotebookService(notebook, new class extends (0, mock_1.mock)() {
                    constructor() {
                        super(...arguments);
                        this.options = { transientOutputs: false, transientCellMetadata: {}, transientDocumentMetadata: {}, cellContentMetadata: {} };
                    }
                    async notebookToData(notebook) {
                        callCount += 1;
                        assert.strictEqual(notebook.cells[0].metadata.foo, 123);
                        assert.strictEqual(notebook.cells[0].metadata.bar, 456);
                        return buffer_1.VSBuffer.fromString('');
                    }
                }), configurationService);
                await model.snapshot(cancellation_1.CancellationToken.None);
                assert.strictEqual(callCount, 1);
            }
        });
    });
    function mockNotebookService(notebook, notebookSerializer) {
        return new class extends (0, mock_1.mock)() {
            async withNotebookDataProvider(viewType) {
                return new notebookService_1.SimpleNotebookProviderInfo(notebook.viewType, notebookSerializer, {
                    id: new extensions_1.ExtensionIdentifier('test'),
                    location: undefined
                });
            }
        };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tFZGl0b3JNb2RlbC50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svdGVzdC9icm93c2VyL25vdGVib29rRWRpdG9yTW9kZWwudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQWtCaEcsS0FBSyxDQUFDLDhCQUE4QixFQUFFO1FBRXJDLElBQUksV0FBNEIsQ0FBQztRQUNqQyxJQUFJLG9CQUE4QyxDQUFDO1FBQ25ELE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxtREFBd0IsRUFBRSxDQUFDO1FBRTVELFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUV0QyxLQUFLLENBQUMsR0FBRyxFQUFFO1lBQ1YsV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBQ3BDLG9CQUFvQixHQUFHLElBQUEsOENBQXlCLEVBQUMsV0FBVyxDQUFDLENBQUM7UUFDL0QsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsMkNBQTJDLEVBQUUsS0FBSztZQUV0RCxNQUFNLFFBQVEsR0FBRyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMscUNBQWlCLEVBQ3JFLFVBQVUsRUFDVixTQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUNoQixDQUFDLEVBQUUsUUFBUSxFQUFFLHlCQUFRLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxZQUFLLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxpQkFBUSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMs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