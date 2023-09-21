/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/buffer", "vs/base/common/lifecycle", "vs/base/common/mime", "vs/editor/common/languages/language", "vs/platform/undoRedo/common/undoRedo", "vs/workbench/contrib/notebook/common/model/notebookTextModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/test/browser/testNotebookEditor"], function (require, exports, assert, buffer_1, lifecycle_1, mime_1, language_1, undoRedo_1, notebookTextModel_1, notebookCommon_1, testNotebookEditor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('NotebookTextModel', () => {
        let disposables;
        let instantiationService;
        let languageService;
        suiteSetup(() => {
            disposables = new lifecycle_1.$jc();
            instantiationService = (0, testNotebookEditor_1.$Ifc)(disposables);
            languageService = instantiationService.get(language_1.$ct);
            instantiationService.spy(undoRedo_1.$wu, 'pushElement');
        });
        suiteTeardown(() => disposables.dispose());
        test('insert', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var d = 4;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor) => {
                const textModel = editor.textModel;
                textModel.applyEdits([
                    { editType: 1 /* CellEditType.Replace */, index: 1, count: 0, cells: [disposables.add(new testNotebookEditor_1.$Gfc(textModel.viewType, 5, 'var e = 5;', 'javascript', notebookCommon_1.CellKind.Code, [], languageService))] },
                    { editType: 1 /* CellEditType.Replace */, index: 3, count: 0, cells: [disposables.add(new testNotebookEditor_1.$Gfc(textModel.viewType, 6, 'var f = 6;', 'javascript', notebookCommon_1.CellKind.Code, [], languageService))] },
                ], true, undefined, () => undefined, undefined, true);
                assert.strictEqual(textModel.cells.length, 6);
                assert.strictEqual(textModel.cells[1].getValue(), 'var e = 5;');
                assert.strictEqual(textModel.cells[4].getValue(), 'var f = 6;');
            });
        });
        test('multiple inserts at same position', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var d = 4;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor) => {
                const textModel = editor.textModel;
                textModel.applyEdits([
                    { editType: 1 /* CellEditType.Replace */, index: 1, count: 0, cells: [disposables.add(new testNotebookEditor_1.$Gfc(textModel.viewType, 5, 'var e = 5;', 'javascript', notebookCommon_1.CellKind.Code, [], languageService))] },
                    { editType: 1 /* CellEditType.Replace */, index: 1, count: 0, cells: [disposables.add(new testNotebookEditor_1.$Gfc(textModel.viewType, 6, 'var f = 6;', 'javascript', notebookCommon_1.CellKind.Code, [], languageService))] },
                ], true, undefined, () => undefined, undefined, true);
                assert.strictEqual(textModel.cells.length, 6);
                assert.strictEqual(textModel.cells[1].getValue(), 'var e = 5;');
                assert.strictEqual(textModel.cells[2].getValue(), 'var f = 6;');
            });
        });
        test('delete', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var d = 4;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor) => {
                const textModel = editor.textModel;
                textModel.applyEdits([
                    { editType: 1 /* CellEditType.Replace */, index: 1, count: 1, cells: [] },
                    { editType: 1 /* CellEditType.Replace */, index: 3, count: 1, cells: [] },
                ], true, undefined, () => undefined, undefined, true);
                assert.strictEqual(textModel.cells[0].getValue(), 'var a = 1;');
                assert.strictEqual(textModel.cells[1].getValue(), 'var c = 3;');
            });
        });
        test('delete + insert', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var d = 4;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor) => {
                const textModel = editor.textModel;
                textModel.applyEdits([
                    { editType: 1 /* CellEditType.Replace */, index: 1, count: 1, cells: [] },
                    { editType: 1 /* CellEditType.Replace */, index: 3, count: 0, cells: [new testNotebookEditor_1.$Gfc(textModel.viewType, 5, 'var e = 5;', 'javascript', notebookCommon_1.CellKind.Code, [], languageService)] },
                ], true, undefined, () => undefined, undefined, true);
                assert.strictEqual(textModel.cells.length, 4);
                assert.strictEqual(textModel.cells[0].getValue(), 'var a = 1;');
                assert.strictEqual(textModel.cells[2].getValue(), 'var e = 5;');
            });
        });
        test('delete + insert at same position', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var d = 4;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor) => {
                const textModel = editor.textModel;
                textModel.applyEdits([
                    { editType: 1 /* CellEditType.Replace */, index: 1, count: 1, cells: [] },
                    { editType: 1 /* CellEditType.Replace */, index: 1, count: 0, cells: [new testNotebookEditor_1.$Gfc(textModel.viewType, 5, 'var e = 5;', 'javascript', notebookCommon_1.CellKind.Code, [], languageService)] },
                ], true, undefined, () => undefined, undefined, true);
                assert.strictEqual(textModel.cells.length, 4);
                assert.strictEqual(textModel.cells[0].getValue(), 'var a = 1;');
                assert.strictEqual(textModel.cells[1].getValue(), 'var e = 5;');
                assert.strictEqual(textModel.cells[2].getValue(), 'var c = 3;');
            });
        });
        test('(replace) delete + insert at same position', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var d = 4;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor) => {
                const textModel = editor.textModel;
                textModel.applyEdits([
                    { editType: 1 /* CellEditType.Replace */, index: 1, count: 1, cells: [new testNotebookEditor_1.$Gfc(textModel.viewType, 5, 'var e = 5;', 'javascript', notebookCommon_1.CellKind.Code, [], languageService)] },
                ], true, undefined, () => undefined, undefined, true);
                assert.strictEqual(textModel.cells.length, 4);
                assert.strictEqual(textModel.cells[0].getValue(), 'var a = 1;');
                assert.strictEqual(textModel.cells[1].getValue(), 'var e = 5;');
                assert.strictEqual(textModel.cells[2].getValue(), 'var c = 3;');
            });
        });
        test('output', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], (editor) => {
                const textModel = editor.textModel;
                // invalid index 1
                assert.throws(() => {
                    textModel.applyEdits([{
                            index: Number.MAX_VALUE,
                            editType: 2 /* CellEditType.Output */,
                            outputs: []
                        }], true, undefined, () => undefined, undefined, true);
                });
                // invalid index 2
                assert.throws(() => {
                    textModel.applyEdits([{
                            index: -1,
                            editType: 2 /* CellEditType.Output */,
                            outputs: []
                        }], true, undefined, () => undefined, undefined, true);
                });
                textModel.applyEdits([{
                        index: 0,
                        editType: 2 /* CellEditType.Output */,
                        outputs: [{
                                outputId: 'someId',
                                outputs: [{ mime: mime_1.$Hr.markdown, data: (0, testNotebookEditor_1.$Nfc)('_Hello_') }]
                            }]
                    }], true, undefined, () => undefined, undefined, true);
                assert.strictEqual(textModel.cells.length, 1);
                assert.strictEqual(textModel.cells[0].outputs.length, 1);
                // append
                textModel.applyEdits([{
                        index: 0,
                        editType: 2 /* CellEditType.Output */,
                        append: true,
                        outputs: [{
                                outputId: 'someId2',
                                outputs: [{ mime: mime_1.$Hr.markdown, data: (0, testNotebookEditor_1.$Nfc)('_Hello2_') }]
                            }]
                    }], true, undefined, () => undefined, undefined, true);
                assert.strictEqual(textModel.cells.length, 1);
                assert.strictEqual(textModel.cells[0].outputs.length, 2);
                let [first, second] = textModel.cells[0].outputs;
                assert.strictEqual(first.outputId, 'someId');
                assert.strictEqual(second.outputId, 'someId2');
                // replace all
                textModel.applyEdits([{
                        index: 0,
                        editType: 2 /* CellEditType.Output */,
                        outputs: [{
                                outputId: 'someId3',
                                outputs: [{ mime: mime_1.$Hr.text, data: (0, testNotebookEditor_1.$Nfc)('Last, replaced output') }]
                            }]
                    }], true, undefined, () => undefined, undefined, true);
                assert.strictEqual(textModel.cells.length, 1);
                assert.strictEqual(textModel.cells[0].outputs.length, 1);
                [first] = textModel.cells[0].outputs;
                assert.strictEqual(first.outputId, 'someId3');
            });
        });
        test('multiple append output in one position', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], (editor) => {
                const textModel = editor.textModel;
                // append
                textModel.applyEdits([
                    {
                        index: 0,
                        editType: 2 /* CellEditType.Output */,
                        append: true,
                        outputs: [{
                                outputId: 'append1',
                                outputs: [{ mime: mime_1.$Hr.markdown, data: (0, testNotebookEditor_1.$Nfc)('append 1') }]
                            }]
                    },
                    {
                        index: 0,
                        editType: 2 /* CellEditType.Output */,
                        append: true,
                        outputs: [{
                                outputId: 'append2',
                                outputs: [{ mime: mime_1.$Hr.markdown, data: (0, testNotebookEditor_1.$Nfc)('append 2') }]
                            }]
                    }
                ], true, undefined, () => undefined, undefined, true);
                assert.strictEqual(textModel.cells.length, 1);
                assert.strictEqual(textModel.cells[0].outputs.length, 2);
                const [first, second] = textModel.cells[0].outputs;
                assert.strictEqual(first.outputId, 'append1');
                assert.strictEqual(second.outputId, 'append2');
            });
        });
        test('append to output created in same batch', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], (editor) => {
                const textModel = editor.textModel;
                textModel.applyEdits([
                    {
                        index: 0,
                        editType: 2 /* CellEditType.Output */,
                        append: true,
                        outputs: [{
                                outputId: 'append1',
                                outputs: [{ mime: mime_1.$Hr.markdown, data: (0, testNotebookEditor_1.$Nfc)('append 1') }]
                            }]
                    },
                    {
                        editType: 7 /* CellEditType.OutputItems */,
                        append: true,
                        outputId: 'append1',
                        items: [{
                                mime: mime_1.$Hr.markdown, data: (0, testNotebookEditor_1.$Nfc)('append 2')
                            }]
                    }
                ], true, undefined, () => undefined, undefined, true);
                assert.strictEqual(textModel.cells.length, 1);
                assert.strictEqual(textModel.cells[0].outputs.length, 1, 'has 1 output');
                const [first] = textModel.cells[0].outputs;
                assert.strictEqual(first.outputId, 'append1');
                assert.strictEqual(first.outputs.length, 2, 'has 2 items');
            });
        });
        const stdOutMime = 'application/vnd.code.notebook.stdout';
        const stdErrMime = 'application/vnd.code.notebook.stderr';
        test('appending streaming outputs', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], (editor) => {
                const textModel = editor.textModel;
                textModel.applyEdits([
                    {
                        index: 0,
                        editType: 2 /* CellEditType.Output */,
                        append: true,
                        outputs: [{
                                outputId: 'append1',
                                outputs: [{ mime: stdOutMime, data: (0, testNotebookEditor_1.$Nfc)('append 1') }]
                            }]
                    }
                ], true, undefined, () => undefined, undefined, true);
                const [output] = textModel.cells[0].outputs;
                assert.strictEqual(output.versionId, 0, 'initial output version should be 0');
                textModel.applyEdits([
                    {
                        editType: 7 /* CellEditType.OutputItems */,
                        append: true,
                        outputId: 'append1',
                        items: [
                            { mime: stdOutMime, data: (0, testNotebookEditor_1.$Nfc)('append 2') },
                            { mime: stdOutMime, data: (0, testNotebookEditor_1.$Nfc)('append 3') }
                        ]
                    }
                ], true, undefined, () => undefined, undefined, true);
                assert.strictEqual(output.versionId, 1, 'version should bump per append');
                textModel.applyEdits([
                    {
                        editType: 7 /* CellEditType.OutputItems */,
                        append: true,
                        outputId: 'append1',
                        items: [
                            { mime: stdOutMime, data: (0, testNotebookEditor_1.$Nfc)('append 4') },
                            { mime: stdOutMime, data: (0, testNotebookEditor_1.$Nfc)('append 5') }
                        ]
                    }
                ], true, undefined, () => undefined, undefined, true);
                assert.strictEqual(output.versionId, 2, 'version should bump per append');
                assert.strictEqual(textModel.cells.length, 1);
                assert.strictEqual(textModel.cells[0].outputs.length, 1, 'has 1 output');
                assert.strictEqual(output.outputId, 'append1');
                assert.strictEqual(output.outputs.length, 1, 'outputs are compressed');
                assert.strictEqual(output.outputs[0].data.toString(), 'append 1append 2append 3append 4append 5');
                assert.strictEqual(output.appendedSinceVersion(0, stdOutMime)?.toString(), 'append 2append 3append 4append 5');
                assert.strictEqual(output.appendedSinceVersion(1, stdOutMime)?.toString(), 'append 4append 5');
                assert.strictEqual(output.appendedSinceVersion(2, stdOutMime), undefined);
                assert.strictEqual(output.appendedSinceVersion(2, stdErrMime), undefined);
            });
        });
        test('replacing streaming outputs', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], (editor) => {
                const textModel = editor.textModel;
                textModel.applyEdits([
                    {
                        index: 0,
                        editType: 2 /* CellEditType.Output */,
                        append: true,
                        outputs: [{
                                outputId: 'append1',
                                outputs: [{ mime: stdOutMime, data: (0, testNotebookEditor_1.$Nfc)('append 1') }]
                            }]
                    }
                ], true, undefined, () => undefined, undefined, true);
                const [output] = textModel.cells[0].outputs;
                assert.strictEqual(output.versionId, 0, 'initial output version should be 0');
                textModel.applyEdits([
                    {
                        editType: 7 /* CellEditType.OutputItems */,
                        append: true,
                        outputId: 'append1',
                        items: [{
                                mime: stdOutMime, data: (0, testNotebookEditor_1.$Nfc)('append 2')
                            }]
                    }
                ], true, undefined, () => undefined, undefined, true);
                assert.strictEqual(output.versionId, 1, 'version should bump per append');
                textModel.applyEdits([
                    {
                        editType: 7 /* CellEditType.OutputItems */,
                        append: false,
                        outputId: 'append1',
                        items: [{
                                mime: stdOutMime, data: (0, testNotebookEditor_1.$Nfc)('replace 3')
                            }]
                    }
                ], true, undefined, () => undefined, undefined, true);
                assert.strictEqual(output.versionId, 2, 'version should bump per replace');
                textModel.applyEdits([
                    {
                        editType: 7 /* CellEditType.OutputItems */,
                        append: true,
                        outputId: 'append1',
                        items: [{
                                mime: stdOutMime, data: (0, testNotebookEditor_1.$Nfc)('append 4')
                            }]
                    }
                ], true, undefined, () => undefined, undefined, true);
                assert.strictEqual(output.versionId, 3, 'version should bump per append');
                assert.strictEqual(output.outputs[0].data.toString(), 'replace 3append 4');
                assert.strictEqual(output.appendedSinceVersion(0, stdOutMime), undefined, 'replacing output should clear out previous versioned output buffers');
                assert.strictEqual(output.appendedSinceVersion(1, stdOutMime), undefined, 'replacing output should clear out previous versioned output buffers');
                assert.strictEqual(output.appendedSinceVersion(2, stdOutMime)?.toString(), 'append 4');
            });
        });
        test('appending streaming outputs with move cursor compression', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], (editor) => {
                const textModel = editor.textModel;
                textModel.applyEdits([
                    {
                        index: 0,
                        editType: 2 /* CellEditType.Output */,
                        append: true,
                        outputs: [{
                                outputId: 'append1',
                                outputs: [
                                    { mime: stdOutMime, data: (0, testNotebookEditor_1.$Nfc)('append 1') },
                                    { mime: stdOutMime, data: (0, testNotebookEditor_1.$Nfc)('\nappend 1') }
                                ]
                            }]
                    }
                ], true, undefined, () => undefined, undefined, true);
                const [output] = textModel.cells[0].outputs;
                assert.strictEqual(output.versionId, 0, 'initial output version should be 0');
                textModel.applyEdits([
                    {
                        editType: 7 /* CellEditType.OutputItems */,
                        append: true,
                        outputId: 'append1',
                        items: [{
                                mime: stdOutMime, data: (0, testNotebookEditor_1.$Nfc)(notebookCommon_1.$$H + '\nappend 2')
                            }]
                    }
                ], true, undefined, () => undefined, undefined, true);
                assert.strictEqual(output.versionId, 1, 'version should bump per append');
                assert.strictEqual(output.outputs[0].data.toString(), 'append 1\nappend 2');
                assert.strictEqual(output.appendedSinceVersion(0, stdOutMime), undefined, 'compressing outputs should clear out previous versioned output buffers');
            });
        });
        test('appending streaming outputs with carraige return compression', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], (editor) => {
                const textModel = editor.textModel;
                textModel.applyEdits([
                    {
                        index: 0,
                        editType: 2 /* CellEditType.Output */,
                        append: true,
                        outputs: [{
                                outputId: 'append1',
                                outputs: [
                                    { mime: stdOutMime, data: (0, testNotebookEditor_1.$Nfc)('append 1') },
                                    { mime: stdOutMime, data: (0, testNotebookEditor_1.$Nfc)('\nappend 1') }
                                ]
                            }]
                    }
                ], true, undefined, () => undefined, undefined, true);
                const [output] = textModel.cells[0].outputs;
                assert.strictEqual(output.versionId, 0, 'initial output version should be 0');
                textModel.applyEdits([
                    {
                        editType: 7 /* CellEditType.OutputItems */,
                        append: true,
                        outputId: 'append1',
                        items: [{
                                mime: stdOutMime, data: (0, testNotebookEditor_1.$Nfc)('\rappend 2')
                            }]
                    }
                ], true, undefined, () => undefined, undefined, true);
                assert.strictEqual(output.versionId, 1, 'version should bump per append');
                assert.strictEqual(output.outputs[0].data.toString(), 'append 1\nappend 2');
                assert.strictEqual(output.appendedSinceVersion(0, stdOutMime), undefined, 'compressing outputs should clear out previous versioned output buffers');
            });
        });
        test('appending multiple different mime streaming outputs', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], (editor) => {
                const textModel = editor.textModel;
                textModel.applyEdits([
                    {
                        index: 0,
                        editType: 2 /* CellEditType.Output */,
                        append: true,
                        outputs: [{
                                outputId: 'append1',
                                outputs: [
                                    { mime: stdOutMime, data: (0, testNotebookEditor_1.$Nfc)('stdout 1') },
                                    { mime: stdErrMime, data: (0, testNotebookEditor_1.$Nfc)('stderr 1') }
                                ]
                            }]
                    }
                ], true, undefined, () => undefined, undefined, true);
                const [output] = textModel.cells[0].outputs;
                assert.strictEqual(output.versionId, 0, 'initial output version should be 0');
                textModel.applyEdits([
                    {
                        editType: 7 /* CellEditType.OutputItems */,
                        append: true,
                        outputId: 'append1',
                        items: [
                            { mime: stdOutMime, data: (0, testNotebookEditor_1.$Nfc)('stdout 2') },
                            { mime: stdErrMime, data: (0, testNotebookEditor_1.$Nfc)('stderr 2') }
                        ]
                    }
                ], true, undefined, () => undefined, undefined, true);
                assert.strictEqual(output.versionId, 1, 'version should bump per replace');
                assert.strictEqual(output.appendedSinceVersion(0, stdErrMime)?.toString(), 'stderr 2');
                assert.strictEqual(output.appendedSinceVersion(0, stdOutMime)?.toString(), 'stdout 2');
            });
        });
        test('metadata', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], (editor) => {
                const textModel = editor.textModel;
                // invalid index 1
                assert.throws(() => {
                    textModel.applyEdits([{
                            index: Number.MAX_VALUE,
                            editType: 3 /* CellEditType.Metadata */,
                            metadata: {}
                        }], true, undefined, () => undefined, undefined, true);
                });
                // invalid index 2
                assert.throws(() => {
                    textModel.applyEdits([{
                            index: -1,
                            editType: 3 /* CellEditType.Metadata */,
                            metadata: {}
                        }], true, undefined, () => undefined, undefined, true);
                });
                textModel.applyEdits([{
                        index: 0,
                        editType: 3 /* CellEditType.Metadata */,
                        metadata: { customProperty: 15 },
                    }], true, undefined, () => undefined, undefined, true);
                textModel.applyEdits([{
                        index: 0,
                        editType: 3 /* CellEditType.Metadata */,
                        metadata: {},
                    }], true, undefined, () => undefined, undefined, true);
                assert.strictEqual(textModel.cells.length, 1);
                assert.strictEqual(textModel.cells[0].metadata.customProperty, undefined);
            });
        });
        test('partial metadata', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], (editor) => {
                const textModel = editor.textModel;
                textModel.applyEdits([{
                        index: 0,
                        editType: 8 /* CellEditType.PartialMetadata */,
                        metadata: { customProperty: 15 },
                    }], true, undefined, () => undefined, undefined, true);
                textModel.applyEdits([{
                        index: 0,
                        editType: 8 /* CellEditType.PartialMetadata */,
                        metadata: {},
                    }], true, undefined, () => undefined, undefined, true);
                assert.strictEqual(textModel.cells.length, 1);
                assert.strictEqual(textModel.cells[0].metadata.customProperty, 15);
            });
        });
        test('multiple inserts in one edit', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var d = 4;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor) => {
                const textModel = editor.textModel;
                let changeEvent = undefined;
                const eventListener = textModel.onDidChangeContent(e => {
                    changeEvent = e;
                });
                const willChangeEvents = [];
                const willChangeListener = textModel.onWillAddRemoveCells(e => {
                    willChangeEvents.push(e);
                });
                const version = textModel.versionId;
                textModel.applyEdits([
                    { editType: 1 /* CellEditType.Replace */, index: 1, count: 1, cells: [] },
                    { editType: 1 /* CellEditType.Replace */, index: 1, count: 0, cells: [new testNotebookEditor_1.$Gfc(textModel.viewType, 5, 'var e = 5;', 'javascript', notebookCommon_1.CellKind.Code, [], languageService)] },
                ], true, undefined, () => ({ kind: notebookCommon_1.SelectionStateType.Index, focus: { start: 0, end: 1 }, selections: [{ start: 0, end: 1 }] }), undefined, true);
                assert.strictEqual(textModel.cells.length, 4);
                assert.strictEqual(textModel.cells[0].getValue(), 'var a = 1;');
                assert.strictEqual(textModel.cells[1].getValue(), 'var e = 5;');
                assert.strictEqual(textModel.cells[2].getValue(), 'var c = 3;');
                assert.notStrictEqual(changeEvent, undefined);
                assert.strictEqual(changeEvent.rawEvents.length, 2);
                assert.deepStrictEqual(changeEvent.endSelectionState?.selections, [{ start: 0, end: 1 }]);
                assert.strictEqual(willChangeEvents.length, 2);
                assert.strictEqual(textModel.versionId, version + 1);
                eventListener.dispose();
                willChangeListener.dispose();
            });
        });
        test('insert and metadata change in one edit', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var d = 4;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor) => {
                const textModel = editor.textModel;
                let changeEvent = undefined;
                const eventListener = textModel.onDidChangeContent(e => {
                    changeEvent = e;
                });
                const willChangeEvents = [];
                const willChangeListener = textModel.onWillAddRemoveCells(e => {
                    willChangeEvents.push(e);
                });
                const version = textModel.versionId;
                textModel.applyEdits([
                    { editType: 1 /* CellEditType.Replace */, index: 1, count: 1, cells: [] },
                    {
                        index: 0,
                        editType: 3 /* CellEditType.Metadata */,
                        metadata: {},
                    }
                ], true, undefined, () => ({ kind: notebookCommon_1.SelectionStateType.Index, focus: { start: 0, end: 1 }, selections: [{ start: 0, end: 1 }] }), undefined, true);
                assert.notStrictEqual(changeEvent, undefined);
                assert.strictEqual(changeEvent.rawEvents.length, 2);
                assert.deepStrictEqual(changeEvent.endSelectionState?.selections, [{ start: 0, end: 1 }]);
                assert.strictEqual(willChangeEvents.length, 1);
                assert.strictEqual(textModel.versionId, version + 1);
                eventListener.dispose();
                willChangeListener.dispose();
            });
        });
        test('Updating appending/updating output in Notebooks does not work as expected #117273', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor) => {
                const model = editor.textModel;
                assert.strictEqual(model.cells.length, 1);
                assert.strictEqual(model.cells[0].outputs.length, 0);
                const success1 = model.applyEdits([{
                        editType: 2 /* CellEditType.Output */, index: 0, outputs: [
                            { outputId: 'out1', outputs: [{ mime: 'application/x.notebook.stream', data: buffer_1.$Fd.wrap(new Uint8Array([1])) }] }
                        ],
                        append: false
                    }], true, undefined, () => undefined, undefined, false);
                assert.ok(success1);
                assert.strictEqual(model.cells[0].outputs.length, 1);
                const success2 = model.applyEdits([{
                        editType: 2 /* CellEditType.Output */, index: 0, outputs: [
                            { outputId: 'out2', outputs: [{ mime: 'application/x.notebook.stream', data: buffer_1.$Fd.wrap(new Uint8Array([1])) }] }
                        ],
                        append: true
                    }], true, undefined, () => undefined, undefined, false);
                assert.ok(success2);
                assert.strictEqual(model.cells[0].outputs.length, 2);
            });
        });
        test('Clearing output of an empty notebook makes it dirty #119608', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor) => {
                const model = editor.textModel;
                let event;
                model.onDidChangeContent(e => { event = e; });
                {
                    // 1: add ouput -> event
                    const success = model.applyEdits([{
                            editType: 2 /* CellEditType.Output */, index: 0, outputs: [
                                { outputId: 'out1', outputs: [{ mime: 'application/x.notebook.stream', data: buffer_1.$Fd.wrap(new Uint8Array([1])) }] }
                            ],
                            append: false
                        }], true, undefined, () => undefined, undefined, false);
                    assert.ok(success);
                    assert.strictEqual(model.cells[0].outputs.length, 1);
                    assert.ok(event);
                }
                {
                    // 2: clear all output w/ output -> event
                    event = undefined;
                    const success = model.applyEdits([{
                            editType: 2 /* CellEditType.Output */,
                            index: 0,
                            outputs: [],
                            append: false
                        }, {
                            editType: 2 /* CellEditType.Output */,
                            index: 1,
                            outputs: [],
                            append: false
                        }], true, undefined, () => undefined, undefined, false);
                    assert.ok(success);
                    assert.ok(event);
                }
                {
                    // 2: clear all output wo/ output -> NO event
                    event = undefined;
                    const success = model.applyEdits([{
                            editType: 2 /* CellEditType.Output */,
                            index: 0,
                            outputs: [],
                            append: false
                        }, {
                            editType: 2 /* CellEditType.Output */,
                            index: 1,
                            outputs: [],
                            append: false
                        }], true, undefined, () => undefined, undefined, false);
                    assert.ok(success);
                    assert.ok(event === undefined);
                }
            });
        });
        test('Cell metadata/output change should update version id and alternative id #121807', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor, viewModel) => {
                assert.strictEqual(editor.textModel.versionId, 0);
                const firstAltVersion = '0_0,1;1,1';
                assert.strictEqual(editor.textModel.alternativeVersionId, firstAltVersion);
                editor.textModel.applyEdits([
                    {
                        index: 0,
                        editType: 3 /* CellEditType.Metadata */,
                        metadata: {
                            inputCollapsed: true
                        }
                    }
                ], true, undefined, () => undefined, undefined, true);
                assert.strictEqual(editor.textModel.versionId, 1);
                assert.notStrictEqual(editor.textModel.alternativeVersionId, firstAltVersion);
                const secondAltVersion = '1_0,1;1,1';
                assert.strictEqual(editor.textModel.alternativeVersionId, secondAltVersion);
                await viewModel.undo();
                assert.strictEqual(editor.textModel.versionId, 2);
                assert.strictEqual(editor.textModel.alternativeVersionId, firstAltVersion);
                await viewModel.redo();
                assert.strictEqual(editor.textModel.versionId, 3);
                assert.notStrictEqual(editor.textModel.alternativeVersionId, firstAltVersion);
                assert.strictEqual(editor.textModel.alternativeVersionId, secondAltVersion);
                editor.textModel.applyEdits([
                    {
                        index: 1,
                        editType: 3 /* CellEditType.Metadata */,
                        metadata: {
                            inputCollapsed: true
                        }
                    }
                ], true, undefined, () => undefined, undefined, true);
                assert.strictEqual(editor.textModel.versionId, 4);
                assert.strictEqual(editor.textModel.alternativeVersionId, '4_0,1;1,1');
                await viewModel.undo();
                assert.strictEqual(editor.textModel.versionId, 5);
                assert.strictEqual(editor.textModel.alternativeVersionId, secondAltVersion);
            });
        });
        test('Destructive sorting in _doApplyEdits #121994', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'i42', outputs: [{ mime: 'm/ime', data: (0, testNotebookEditor_1.$Nfc)('test') }] }], {}]
            ], async (editor) => {
                const notebook = editor.textModel;
                assert.strictEqual(notebook.cells[0].outputs.length, 1);
                assert.strictEqual(notebook.cells[0].outputs[0].outputs.length, 1);
                assert.deepStrictEqual(notebook.cells[0].outputs[0].outputs[0].data, (0, testNotebookEditor_1.$Nfc)('test'));
                const edits = [
                    {
                        editType: 2 /* CellEditType.Output */, handle: 0, outputs: []
                    },
                    {
                        editType: 2 /* CellEditType.Output */, handle: 0, append: true, outputs: [{
                                outputId: 'newOutput',
                                outputs: [{ mime: mime_1.$Hr.text, data: (0, testNotebookEditor_1.$Nfc)('cba') }, { mime: 'application/foo', data: (0, testNotebookEditor_1.$Nfc)('cba') }]
                            }]
                    }
                ];
                editor.textModel.applyEdits(edits, true, undefined, () => undefined, undefined, true);
                assert.strictEqual(notebook.cells[0].outputs.length, 1);
                assert.strictEqual(notebook.cells[0].outputs[0].outputs.length, 2);
            });
        });
        test('Destructive sorting in _doApplyEdits #121994. cell splice between output changes', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'i42', outputs: [{ mime: 'm/ime', data: (0, testNotebookEditor_1.$Nfc)('test') }] }], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'i43', outputs: [{ mime: 'm/ime', data: (0, testNotebookEditor_1.$Nfc)('test') }] }], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'i44', outputs: [{ mime: 'm/ime', data: (0, testNotebookEditor_1.$Nfc)('test') }] }], {}]
            ], async (editor) => {
                const notebook = editor.textModel;
                const edits = [
                    {
                        editType: 2 /* CellEditType.Output */, index: 0, outputs: []
                    },
                    {
                        editType: 1 /* CellEditType.Replace */, index: 1, count: 1, cells: []
                    },
                    {
                        editType: 2 /* CellEditType.Output */, index: 2, append: true, outputs: [{
                                outputId: 'newOutput',
                                outputs: [{ mime: mime_1.$Hr.text, data: (0, testNotebookEditor_1.$Nfc)('cba') }, { mime: 'application/foo', data: (0, testNotebookEditor_1.$Nfc)('cba') }]
                            }]
                    }
                ];
                editor.textModel.applyEdits(edits, true, undefined, () => undefined, undefined, true);
                assert.strictEqual(notebook.cells.length, 2);
                assert.strictEqual(notebook.cells[0].outputs.length, 0);
                assert.strictEqual(notebook.cells[1].outputs.length, 2);
                assert.strictEqual(notebook.cells[1].outputs[0].outputId, 'i44');
                assert.strictEqual(notebook.cells[1].outputs[1].outputId, 'newOutput');
            });
        });
        test('Destructive sorting in _doApplyEdits #121994. cell splice between output changes 2', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'i42', outputs: [{ mime: 'm/ime', data: (0, testNotebookEditor_1.$Nfc)('test') }] }], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'i43', outputs: [{ mime: 'm/ime', data: (0, testNotebookEditor_1.$Nfc)('test') }] }], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'i44', outputs: [{ mime: 'm/ime', data: (0, testNotebookEditor_1.$Nfc)('test') }] }], {}]
            ], async (editor) => {
                const notebook = editor.textModel;
                const edits = [
                    {
                        editType: 2 /* CellEditType.Output */, index: 1, append: true, outputs: [{
                                outputId: 'newOutput',
                                outputs: [{ mime: mime_1.$Hr.text, data: (0, testNotebookEditor_1.$Nfc)('cba') }, { mime: 'application/foo', data: (0, testNotebookEditor_1.$Nfc)('cba') }]
                            }]
                    },
                    {
                        editType: 1 /* CellEditType.Replace */, index: 1, count: 1, cells: []
                    },
                    {
                        editType: 2 /* CellEditType.Output */, index: 1, append: true, outputs: [{
                                outputId: 'newOutput2',
                                outputs: [{ mime: mime_1.$Hr.text, data: (0, testNotebookEditor_1.$Nfc)('cba') }, { mime: 'application/foo', data: (0, testNotebookEditor_1.$Nfc)('cba') }]
                            }]
                    }
                ];
                editor.textModel.applyEdits(edits, true, undefined, () => undefined, undefined, true);
                assert.strictEqual(notebook.cells.length, 2);
                assert.strictEqual(notebook.cells[0].outputs.length, 1);
                assert.strictEqual(notebook.cells[1].outputs.length, 1);
                assert.strictEqual(notebook.cells[1].outputs[0].outputId, 'i44');
            });
        });
        test('Output edits splice', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor) => {
                const model = editor.textModel;
                assert.strictEqual(model.cells.length, 1);
                assert.strictEqual(model.cells[0].outputs.length, 0);
                const success1 = model.applyEdits([{
                        editType: 2 /* CellEditType.Output */, index: 0, outputs: [
                            { outputId: 'out1', outputs: [{ mime: 'application/x.notebook.stream', data: (0, testNotebookEditor_1.$Nfc)('1') }] },
                            { outputId: 'out2', outputs: [{ mime: 'application/x.notebook.stream', data: (0, testNotebookEditor_1.$Nfc)('2') }] },
                            { outputId: 'out3', outputs: [{ mime: 'application/x.notebook.stream', data: (0, testNotebookEditor_1.$Nfc)('3') }] },
                            { outputId: 'out4', outputs: [{ mime: 'application/x.notebook.stream', data: (0, testNotebookEditor_1.$Nfc)('4') }] }
                        ],
                        append: false
                    }], true, undefined, () => undefined, undefined, false);
                assert.ok(success1);
                assert.strictEqual(model.cells[0].outputs.length, 4);
                const success2 = model.applyEdits([{
                        editType: 2 /* CellEditType.Output */, index: 0, outputs: [
                            { outputId: 'out1', outputs: [{ mime: 'application/x.notebook.stream', data: (0, testNotebookEditor_1.$Nfc)('1') }] },
                            { outputId: 'out5', outputs: [{ mime: 'application/x.notebook.stream', data: (0, testNotebookEditor_1.$Nfc)('5') }] },
                            { outputId: 'out3', outputs: [{ mime: 'application/x.notebook.stream', data: (0, testNotebookEditor_1.$Nfc)('3') }] },
                            { outputId: 'out6', outputs: [{ mime: 'application/x.notebook.stream', data: (0, testNotebookEditor_1.$Nfc)('6') }] }
                        ],
                        append: false
                    }], true, undefined, () => undefined, undefined, false);
                assert.ok(success2);
                assert.strictEqual(model.cells[0].outputs.length, 4);
                assert.strictEqual(model.cells[0].outputs[0].outputId, 'out1');
                assert.strictEqual(model.cells[0].outputs[1].outputId, 'out5');
                assert.strictEqual(model.cells[0].outputs[2].outputId, 'out3');
                assert.strictEqual(model.cells[0].outputs[3].outputId, 'out6');
            });
        });
        test('computeEdits no insert', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor) => {
                const model = editor.textModel;
                const edits = notebookTextModel_1.$MH.computeEdits(model, [
                    { source: 'var a = 1;', language: 'javascript', cellKind: notebookCommon_1.CellKind.Code, mime: undefined, outputs: [], metadata: undefined }
                ]);
                assert.deepStrictEqual(edits, [
                    { editType: 3 /* CellEditType.Metadata */, index: 0, metadata: {} }
                ]);
            });
        });
        test('computeEdits cell content changed', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor) => {
                const model = editor.textModel;
                const cells = [
                    { source: 'var a = 2;', language: 'javascript', cellKind: notebookCommon_1.CellKind.Code, mime: undefined, outputs: [], metadata: undefined }
                ];
                const edits = notebookTextModel_1.$MH.computeEdits(model, cells);
                assert.deepStrictEqual(edits, [
                    { editType: 1 /* CellEditType.Replace */, index: 0, count: 1, cells },
                ]);
            });
        });
        test('computeEdits last cell content changed', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor) => {
                const model = editor.textModel;
                const cells = [
                    { source: 'var a = 1;', language: 'javascript', cellKind: notebookCommon_1.CellKind.Code, mime: undefined, outputs: [], metadata: undefined },
                    { source: 'var b = 2;', language: 'javascript', cellKind: notebookCommon_1.CellKind.Code, mime: undefined, outputs: [], metadata: undefined }
                ];
                const edits = notebookTextModel_1.$MH.computeEdits(model, cells);
                assert.deepStrictEqual(edits, [
                    { editType: 3 /* CellEditType.Metadata */, index: 0, metadata: {} },
                    { editType: 1 /* CellEditType.Replace */, index: 1, count: 1, cells: cells.slice(1) },
                ]);
            });
        });
        test('computeEdits first cell content changed', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor) => {
                const model = editor.textModel;
                const cells = [
                    { source: 'var a = 2;', language: 'javascript', cellKind: notebookCommon_1.CellKind.Code, mime: undefined, outputs: [], metadata: undefined },
                    { source: 'var b = 1;', language: 'javascript', cellKind: notebookCommon_1.CellKind.Code, mime: undefined, outputs: [], metadata: undefined }
                ];
                const edits = notebookTextModel_1.$MH.computeEdits(model, cells);
                assert.deepStrictEqual(edits, [
                    { editType: 1 /* CellEditType.Replace */, index: 0, count: 1, cells: cells.slice(0, 1) },
                    { editType: 3 /* CellEditType.Metadata */, index: 1, metadata: {} },
                ]);
            });
        });
        test('computeEdits middle cell content changed', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], (editor) => {
                const model = editor.textModel;
                const cells = [
                    { source: 'var a = 1;', language: 'javascript', cellKind: notebookCommon_1.CellKind.Code, mime: undefined, outputs: [], metadata: undefined },
                    { source: 'var b = 2;', language: 'javascript', cellKind: notebookCommon_1.CellKind.Code, mime: undefined, outputs: [], metadata: undefined },
                    { source: 'var c = 1;', language: 'javascript', cellKind: notebookCommon_1.CellKind.Code, mime: undefined, outputs: [], metadata: undefined }
                ];
                const edits = notebookTextModel_1.$MH.computeEdits(model, cells);
                assert.deepStrictEqual(edits, [
                    { editType: 3 /* CellEditType.Metadata */, index: 0, metadata: {} },
                    { editType: 1 /* CellEditType.Replace */, index: 1, count: 1, cells: cells.slice(1, 2) },
                    { editType: 3 /* CellEditType.Metadata */, index: 2, metadata: {} },
                ]);
            });
        });
        test('computeEdits cell metadata changed', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor) => {
                const model = editor.textModel;
                const cells = [
                    { source: 'var a = 1;', language: 'javascript', cellKind: notebookCommon_1.CellKind.Code, mime: undefined, outputs: [], metadata: { name: 'foo' } },
                    { source: 'var b = 1;', language: 'javascript', cellKind: notebookCommon_1.CellKind.Code, mime: undefined, outputs: [], metadata: undefined }
                ];
                const edits = notebookTextModel_1.$MH.computeEdits(model, cells);
                assert.deepStrictEqual(edits, [
                    { editType: 3 /* CellEditType.Metadata */, index: 0, metadata: { name: 'foo' } },
                    { editType: 3 /* CellEditType.Metadata */, index: 1, metadata: {} },
                ]);
            });
        });
        test('computeEdits cell language changed', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor) => {
                const model = editor.textModel;
                const cells = [
                    { source: 'var a = 1;', language: 'typescript', cellKind: notebookCommon_1.CellKind.Code, mime: undefined, outputs: [], metadata: undefined },
                    { source: 'var b = 1;', language: 'javascript', cellKind: notebookCommon_1.CellKind.Code, mime: undefined, outputs: [], metadata: undefined }
                ];
                const edits = notebookTextModel_1.$MH.computeEdits(model, cells);
                assert.deepStrictEqual(edits, [
                    { editType: 1 /* CellEditType.Replace */, index: 0, count: 1, cells: cells.slice(0, 1) },
                    { editType: 3 /* CellEditType.Metadata */, index: 1, metadata: {} },
                ]);
            });
        });
        test('computeEdits cell kind changed', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor) => {
                const model = editor.textModel;
                const cells = [
                    { source: 'var a = 1;', language: 'javascript', cellKind: notebookCommon_1.CellKind.Code, mime: undefined, outputs: [], metadata: undefined },
                    { source: 'var b = 1;', language: 'javascript', cellKind: notebookCommon_1.CellKind.Markup, mime: undefined, outputs: [], metadata: undefined }
                ];
                const edits = notebookTextModel_1.$MH.computeEdits(model, cells);
                assert.deepStrictEqual(edits, [
                    { editType: 3 /* CellEditType.Metadata */, index: 0, metadata: {} },
                    { editType: 1 /* CellEditType.Replace */, index: 1, count: 1, cells: cells.slice(1) },
                ]);
            });
        });
        test('computeEdits cell metadata & content changed', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor) => {
                const model = editor.textModel;
                const cells = [
                    { source: 'var a = 1;', language: 'javascript', cellKind: notebookCommon_1.CellKind.Code, mime: undefined, outputs: [], metadata: { name: 'foo' } },
                    { source: 'var b = 2;', language: 'javascript', cellKind: notebookCommon_1.CellKind.Code, mime: undefined, outputs: [], metadata: { name: 'bar' } }
                ];
                const edits = notebookTextModel_1.$MH.computeEdits(model, cells);
                assert.deepStrictEqual(edits, [
                    { editType: 3 /* CellEditType.Metadata */, index: 0, metadata: { name: 'foo' } },
                    { editType: 1 /* CellEditType.Replace */, index: 1, count: 1, cells: cells.slice(1) }
                ]);
            });
        });
        test('computeEdits cell internal metadata changed', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor) => {
                const model = editor.textModel;
                const cells = [
                    { source: 'var a = 1;', language: 'javascript', cellKind: notebookCommon_1.CellKind.Code, mime: undefined, outputs: [], metadata: undefined, internalMetadata: { executionOrder: 1 } },
                    { source: 'var b = 1;', language: 'javascript', cellKind: notebookCommon_1.CellKind.Code, mime: undefined, outputs: [], metadata: undefined }
                ];
                const edits = notebookTextModel_1.$MH.computeEdits(model, cells);
                assert.deepStrictEqual(edits, [
                    { editType: 1 /* CellEditType.Replace */, index: 0, count: 1, cells: cells.slice(0, 1) },
                    { editType: 3 /* CellEditType.Metadata */, index: 1, metadata: {} },
                ]);
            });
        });
        test('computeEdits cell insertion', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor) => {
                const model = editor.textModel;
                const cells = [
                    { source: 'var a = 1;', language: 'javascript', cellKind: notebookCommon_1.CellKind.Code, mime: undefined, outputs: [], metadata: undefined, },
                    { source: 'var c = 1;', language: 'javascript', cellKind: notebookCommon_1.CellKind.Code, mime: undefined, outputs: [], metadata: undefined, },
                    { source: 'var b = 1;', language: 'javascript', cellKind: notebookCommon_1.CellKind.Code, mime: undefined, outputs: [], metadata: { foo: 'bar' } }
                ];
                const edits = notebookTextModel_1.$MH.computeEdits(model, cells);
                assert.deepStrictEqual(edits, [
                    { editType: 3 /* CellEditType.Metadata */, index: 0, metadata: {} },
                    { editType: 1 /* CellEditType.Replace */, index: 1, count: 0, cells: cells.slice(1, 2) },
                    { editType: 3 /* CellEditType.Metadata */, index: 1, metadata: { foo: 'bar' } },
                ]);
                model.applyEdits(edits, true, undefined, () => undefined, undefined, true);
                assert.equal(model.cells.length, 3);
                assert.equal(model.cells[1].getValue(), 'var c = 1;');
                assert.equal(model.cells[2].getValue(), 'var b = 1;');
                assert.deepStrictEqual(model.cells[2].metadata, { foo: 'bar' });
            });
        });
        test('computeEdits output changed', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor) => {
                const model = editor.textModel;
                const cells = [
                    {
                        source: 'var a = 1;', language: 'javascript', cellKind: notebookCommon_1.CellKind.Code, mime: undefined, outputs: [{
                                outputId: 'someId',
                                outputs: [{ mime: mime_1.$Hr.markdown, data: (0, testNotebookEditor_1.$Nfc)('_World_') }]
                            }], metadata: undefined,
                    },
                    { source: 'var b = 1;', language: 'javascript', cellKind: notebookCommon_1.CellKind.Code, mime: undefined, outputs: [], metadata: { foo: 'bar' } }
                ];
                const edits = notebookTextModel_1.$MH.computeEdits(model, cells);
                assert.deepStrictEqual(edits, [
                    { editType: 3 /* CellEditType.Metadata */, index: 0, metadata: {} },
                    {
                        editType: 2 /* CellEditType.Output */, index: 0, outputs: [{
                                outputId: 'someId',
                                outputs: [{ mime: mime_1.$Hr.markdown, data: (0, testNotebookEditor_1.$Nfc)('_World_') }]
                            }], append: false
                    },
                    { editType: 3 /* CellEditType.Metadata */, index: 1, metadata: { foo: 'bar' } },
                ]);
                model.applyEdits(edits, true, undefined, () => undefined, undefined, true);
                assert.equal(model.cells.length, 2);
                assert.strictEqual(model.cells[0].outputs.length, 1);
                assert.equal(model.cells[0].outputs[0].outputId, 'someId');
                assert.equal(model.cells[0].outputs[0].outputs[0].data.toString(), '_World_');
            });
        });
        test('computeEdits output items changed', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [{
                            outputId: 'someId',
                            outputs: [{ mime: mime_1.$Hr.markdown, data: (0, testNotebookEditor_1.$Nfc)('_Hello_') }]
                        }], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor) => {
                const model = editor.textModel;
                const cells = [
                    {
                        source: 'var a = 1;', language: 'javascript', cellKind: notebookCommon_1.CellKind.Code, mime: undefined, outputs: [{
                                outputId: 'someId',
                                outputs: [{ mime: mime_1.$Hr.markdown, data: (0, testNotebookEditor_1.$Nfc)('_World_') }]
                            }], metadata: undefined,
                    },
                    { source: 'var b = 1;', language: 'javascript', cellKind: notebookCommon_1.CellKind.Code, mime: undefined, outputs: [], metadata: { foo: 'bar' } }
                ];
                const edits = notebookTextModel_1.$MH.computeEdits(model, cells);
                assert.deepStrictEqual(edits, [
                    { editType: 3 /* CellEditType.Metadata */, index: 0, metadata: {} },
                    { editType: 7 /* CellEditType.OutputItems */, outputId: 'someId', items: [{ mime: mime_1.$Hr.markdown, data: (0, testNotebookEditor_1.$Nfc)('_World_') }], append: false },
                    { editType: 3 /* CellEditType.Metadata */, index: 1, metadata: { foo: 'bar' } },
                ]);
                model.applyEdits(edits, true, undefined, () => undefined, undefined, true);
                assert.equal(model.cells.length, 2);
                assert.strictEqual(model.cells[0].outputs.length, 1);
                assert.equal(model.cells[0].outputs[0].outputId, 'someId');
                assert.equal(model.cells[0].outputs[0].outputs[0].data.toString(), '_World_');
            });
        });
        test('Append multiple text/plain output items', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [{
                            outputId: '1',
                            outputs: [{ mime: 'text/plain', data: (0, testNotebookEditor_1.$Nfc)('foo') }]
                        }], {}]
            ], (editor) => {
                const model = editor.textModel;
                const edits = [
                    {
                        editType: 7 /* CellEditType.OutputItems */,
                        outputId: '1',
                        append: true,
                        items: [{ mime: 'text/plain', data: buffer_1.$Fd.fromString('bar') }, { mime: 'text/plain', data: buffer_1.$Fd.fromString('baz') }]
                    }
                ];
                model.applyEdits(edits, true, undefined, () => undefined, undefined, true);
                assert.equal(model.cells.length, 1);
                assert.equal(model.cells[0].outputs.length, 1);
                assert.equal(model.cells[0].outputs[0].outputs.length, 3);
                assert.equal(model.cells[0].outputs[0].outputs[0].mime, 'text/plain');
                assert.equal(model.cells[0].outputs[0].outputs[0].data.toString(), 'foo');
                assert.equal(model.cells[0].outputs[0].outputs[1].mime, 'text/plain');
                assert.equal(model.cells[0].outputs[0].outputs[1].data.toString(), 'bar');
                assert.equal(model.cells[0].outputs[0].outputs[2].mime, 'text/plain');
                assert.equal(model.cells[0].outputs[0].outputs[2].data.toString(), 'baz');
            });
        });
        test('Append multiple stdout stream output items to an output with another mime', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [{
                            outputId: '1',
                            outputs: [{ mime: 'text/plain', data: (0, testNotebookEditor_1.$Nfc)('foo') }]
                        }], {}]
            ], (editor) => {
                const model = editor.textModel;
                const edits = [
                    {
                        editType: 7 /* CellEditType.OutputItems */,
                        outputId: '1',
                        append: true,
                        items: [{ mime: 'application/vnd.code.notebook.stdout', data: buffer_1.$Fd.fromString('bar') }, { mime: 'application/vnd.code.notebook.stdout', data: buffer_1.$Fd.fromString('baz') }]
                    }
                ];
                model.applyEdits(edits, true, undefined, () => undefined, undefined, true);
                assert.equal(model.cells.length, 1);
                assert.equal(model.cells[0].outputs.length, 1);
                assert.equal(model.cells[0].outputs[0].outputs.length, 3);
                assert.equal(model.cells[0].outputs[0].outputs[0].mime, 'text/plain');
                assert.equal(model.cells[0].outputs[0].outputs[0].data.toString(), 'foo');
                assert.equal(model.cells[0].outputs[0].outputs[1].mime, 'application/vnd.code.notebook.stdout');
                assert.equal(model.cells[0].outputs[0].outputs[1].data.toString(), 'bar');
                assert.equal(model.cells[0].outputs[0].outputs[2].mime, 'application/vnd.code.notebook.stdout');
                assert.equal(model.cells[0].outputs[0].outputs[2].data.toString(), 'baz');
            });
        });
        test('Compress multiple stdout stream output items', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [{
                            outputId: '1',
                            outputs: [{ mime: 'application/vnd.code.notebook.stdout', data: (0, testNotebookEditor_1.$Nfc)('foo') }]
                        }], {}]
            ], (editor) => {
                const model = editor.textModel;
                const edits = [
                    {
                        editType: 7 /* CellEditType.OutputItems */,
                        outputId: '1',
                        append: true,
                        items: [{ mime: 'application/vnd.code.notebook.stdout', data: buffer_1.$Fd.fromString('bar') }, { mime: 'application/vnd.code.notebook.stdout', data: buffer_1.$Fd.fromString('baz') }]
                    }
                ];
                model.applyEdits(edits, true, undefined, () => undefined, undefined, true);
                assert.equal(model.cells.length, 1);
                assert.equal(model.cells[0].outputs.length, 1);
                assert.equal(model.cells[0].outputs[0].outputs.length, 1);
                assert.equal(model.cells[0].outputs[0].outputs[0].mime, 'application/vnd.code.notebook.stdout');
                assert.equal(model.cells[0].outputs[0].outputs[0].data.toString(), 'foobarbaz');
            });
        });
        test('Compress multiple stderr stream output items', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [{
                            outputId: '1',
                            outputs: [{ mime: 'application/vnd.code.notebook.stderr', data: (0, testNotebookEditor_1.$Nfc)('foo') }]
                        }], {}]
            ], (editor) => {
                const model = editor.textModel;
                const edits = [
                    {
                        editType: 7 /* CellEditType.OutputItems */,
                        outputId: '1',
                        append: true,
                        items: [{ mime: 'application/vnd.code.notebook.stderr', data: buffer_1.$Fd.fromString('bar') }, { mime: 'application/vnd.code.notebook.stderr', data: buffer_1.$Fd.fromString('baz') }]
                    }
                ];
                model.applyEdits(edits, true, undefined, () => undefined, undefined, true);
                assert.equal(model.cells.length, 1);
                assert.equal(model.cells[0].outputs.length, 1);
                assert.equal(model.cells[0].outputs[0].outputs.length, 1);
                assert.equal(model.cells[0].outputs[0].outputs[0].mime, 'application/vnd.code.notebook.stderr');
                assert.equal(model.cells[0].outputs[0].outputs[0].data.toString(), 'foobarbaz');
            });
        });
    });
});
//# sourceMappingURL=notebookTextModel.test.js.map