/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/buffer", "vs/base/common/diff/diff", "vs/base/common/mime", "vs/base/test/common/utils", "vs/platform/configuration/test/common/testConfigurationService", "vs/workbench/contrib/notebook/browser/diff/eventDispatcher", "vs/workbench/contrib/notebook/browser/diff/notebookDiffEditor", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/test/browser/testNotebookEditor"], function (require, exports, assert, buffer_1, diff_1, mime_1, utils_1, testConfigurationService_1, eventDispatcher_1, notebookDiffEditor_1, notebookCommon_1, testNotebookEditor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CellSequence {
        constructor(textModel) {
            this.textModel = textModel;
        }
        getElements() {
            const hashValue = new Int32Array(this.textModel.cells.length);
            for (let i = 0; i < this.textModel.cells.length; i++) {
                hashValue[i] = this.textModel.cells[i].getHashValue();
            }
            return hashValue;
        }
    }
    suite('NotebookCommon', () => {
        const configurationService = new testConfigurationService_1.TestConfigurationService();
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('diff different source', async () => {
            await (0, testNotebookEditor_1.withTestNotebookDiffModel)([
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someOtherId', outputs: [{ mime: mime_1.Mimes.text, data: buffer_1.VSBuffer.wrap(new Uint8Array([3])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 3 }],
            ], [
                ['y', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someOtherId', outputs: [{ mime: mime_1.Mimes.text, data: buffer_1.VSBuffer.wrap(new Uint8Array([3])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 3 }],
            ], (model, disposables, accessor) => {
                const diff = new diff_1.LcsDiff(new CellSequence(model.original.notebook), new CellSequence(model.modified.notebook));
                const diffResult = diff.ComputeDiff(false);
                assert.strictEqual(diffResult.changes.length, 1);
                assert.deepStrictEqual(diffResult.changes.map(change => ({
                    originalStart: change.originalStart,
                    originalLength: change.originalLength,
                    modifiedStart: change.modifiedStart,
                    modifiedLength: change.modifiedLength
                })), [{
                        originalStart: 0,
                        originalLength: 1,
                        modifiedStart: 0,
                        modifiedLength: 1
                    }]);
                const eventDispatcher = disposables.add(new eventDispatcher_1.NotebookDiffEditorEventDispatcher());
                const diffViewModels = notebookDiffEditor_1.NotebookTextDiffEditor.computeDiff(accessor, configurationService, model, eventDispatcher, {
                    cellsDiff: diffResult
                }, undefined);
                assert.strictEqual(diffViewModels.viewModels.length, 1);
                assert.strictEqual(diffViewModels.viewModels[0].type, 'modified');
                diffViewModels.viewModels.forEach(vm => {
                    vm.original?.dispose();
                    vm.modified?.dispose();
                    vm.dispose();
                });
                model.original.notebook.dispose();
                model.modified.notebook.dispose();
            });
        });
        test('diff different output', async () => {
            await (0, testNotebookEditor_1.withTestNotebookDiffModel)([
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someId', outputs: [{ mime: mime_1.Mimes.text, data: buffer_1.VSBuffer.wrap(new Uint8Array([5])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 5 }],
                ['', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], [
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someOtherId', outputs: [{ mime: mime_1.Mimes.text, data: buffer_1.VSBuffer.wrap(new Uint8Array([3])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 3 }],
                ['', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (model, disposables, accessor) => {
                const diff = new diff_1.LcsDiff(new CellSequence(model.original.notebook), new CellSequence(model.modified.notebook));
                const diffResult = diff.ComputeDiff(false);
                assert.strictEqual(diffResult.changes.length, 1);
                assert.deepStrictEqual(diffResult.changes.map(change => ({
                    originalStart: change.originalStart,
                    originalLength: change.originalLength,
                    modifiedStart: change.modifiedStart,
                    modifiedLength: change.modifiedLength
                })), [{
                        originalStart: 0,
                        originalLength: 1,
                        modifiedStart: 0,
                        modifiedLength: 1
                    }]);
                const eventDispatcher = disposables.add(new eventDispatcher_1.NotebookDiffEditorEventDispatcher());
                const diffViewModels = notebookDiffEditor_1.NotebookTextDiffEditor.computeDiff(accessor, configurationService, model, eventDispatcher, {
                    cellsDiff: diffResult
                }, undefined);
                assert.strictEqual(diffViewModels.viewModels.length, 2);
                assert.strictEqual(diffViewModels.viewModels[0].type, 'modified');
                assert.strictEqual(diffViewModels.viewModels[1].type, 'unchanged');
                diffViewModels.viewModels.forEach(vm => {
                    vm.original?.dispose();
                    vm.modified?.dispose();
                    vm.dispose();
                });
                model.original.notebook.dispose();
                model.modified.notebook.dispose();
            });
        });
        test('diff test small source', async () => {
            await (0, testNotebookEditor_1.withTestNotebookDiffModel)([
                ['123456789', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], [
                ['987654321', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], (model, disposables, accessor) => {
                const diff = new diff_1.LcsDiff(new CellSequence(model.original.notebook), new CellSequence(model.modified.notebook));
                const diffResult = diff.ComputeDiff(false);
                assert.strictEqual(diffResult.changes.length, 1);
                assert.deepStrictEqual(diffResult.changes.map(change => ({
                    originalStart: change.originalStart,
                    originalLength: change.originalLength,
                    modifiedStart: change.modifiedStart,
                    modifiedLength: change.modifiedLength
                })), [{
                        originalStart: 0,
                        originalLength: 1,
                        modifiedStart: 0,
                        modifiedLength: 1
                    }]);
                const eventDispatcher = disposables.add(new eventDispatcher_1.NotebookDiffEditorEventDispatcher());
                const diffViewModels = notebookDiffEditor_1.NotebookTextDiffEditor.computeDiff(accessor, configurationService, model, eventDispatcher, {
                    cellsDiff: diffResult
                }, undefined);
                assert.strictEqual(diffViewModels.viewModels.length, 1);
                assert.strictEqual(diffViewModels.viewModels[0].type, 'modified');
                diffViewModels.viewModels.forEach(vm => {
                    vm.original?.dispose();
                    vm.modified?.dispose();
                    vm.dispose();
                });
                model.original.notebook.dispose();
                model.modified.notebook.dispose();
            });
        });
        test('diff test data single cell', async () => {
            await (0, testNotebookEditor_1.withTestNotebookDiffModel)([
                [[
                        '# This version has a bug\n',
                        'def mult(a, b):\n',
                        '    return a / b'
                    ].join(''), 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], [
                [[
                        'def mult(a, b):\n',
                        '    \'This version is debugged.\'\n',
                        '    return a * b'
                    ].join(''), 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], (model, disposables, accessor) => {
                const diff = new diff_1.LcsDiff(new CellSequence(model.original.notebook), new CellSequence(model.modified.notebook));
                const diffResult = diff.ComputeDiff(false);
                assert.strictEqual(diffResult.changes.length, 1);
                assert.deepStrictEqual(diffResult.changes.map(change => ({
                    originalStart: change.originalStart,
                    originalLength: change.originalLength,
                    modifiedStart: change.modifiedStart,
                    modifiedLength: change.modifiedLength
                })), [{
                        originalStart: 0,
                        originalLength: 1,
                        modifiedStart: 0,
                        modifiedLength: 1
                    }]);
                const eventDispatcher = disposables.add(new eventDispatcher_1.NotebookDiffEditorEventDispatcher());
                const diffViewModels = notebookDiffEditor_1.NotebookTextDiffEditor.computeDiff(accessor, configurationService, model, eventDispatcher, {
                    cellsDiff: diffResult
                }, undefined);
                assert.strictEqual(diffViewModels.viewModels.length, 1);
                assert.strictEqual(diffViewModels.viewModels[0].type, 'modified');
                diffViewModels.viewModels.forEach(vm => {
                    vm.original?.dispose();
                    vm.modified?.dispose();
                    vm.dispose();
                });
                model.original.notebook.dispose();
                model.modified.notebook.dispose();
            });
        });
        test('diff foo/foe', async () => {
            await (0, testNotebookEditor_1.withTestNotebookDiffModel)([
                [['def foe(x, y):\n', '    return x + y\n', 'foe(3, 2)'].join(''), 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someId', outputs: [{ mime: mime_1.Mimes.text, data: buffer_1.VSBuffer.wrap(new Uint8Array([6])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 5 }],
                [['def foo(x, y):\n', '    return x * y\n', 'foo(1, 2)'].join(''), 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someId', outputs: [{ mime: mime_1.Mimes.text, data: buffer_1.VSBuffer.wrap(new Uint8Array([2])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 6 }],
                ['', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], [
                [['def foo(x, y):\n', '    return x * y\n', 'foo(1, 2)'].join(''), 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someId', outputs: [{ mime: mime_1.Mimes.text, data: buffer_1.VSBuffer.wrap(new Uint8Array([6])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 5 }],
                [['def foe(x, y):\n', '    return x + y\n', 'foe(3, 2)'].join(''), 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someId', outputs: [{ mime: mime_1.Mimes.text, data: buffer_1.VSBuffer.wrap(new Uint8Array([2])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 6 }],
                ['', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (model, disposables, accessor) => {
                const diff = new diff_1.LcsDiff(new CellSequence(model.original.notebook), new CellSequence(model.modified.notebook));
                const diffResult = diff.ComputeDiff(false);
                const eventDispatcher = disposables.add(new eventDispatcher_1.NotebookDiffEditorEventDispatcher());
                const diffViewModels = notebookDiffEditor_1.NotebookTextDiffEditor.computeDiff(accessor, configurationService, model, eventDispatcher, {
                    cellsDiff: diffResult
                }, undefined);
                assert.strictEqual(diffViewModels.viewModels.length, 3);
                assert.strictEqual(diffViewModels.viewModels[0].type, 'modified');
                assert.strictEqual(diffViewModels.viewModels[1].type, 'modified');
                assert.strictEqual(diffViewModels.viewModels[2].type, 'unchanged');
                diffViewModels.viewModels.forEach(vm => {
                    vm.original?.dispose();
                    vm.modified?.dispose();
                    vm.dispose();
                });
                model.original.notebook.dispose();
                model.modified.notebook.dispose();
            });
        });
        test('diff markdown', async () => {
            await (0, testNotebookEditor_1.withTestNotebookDiffModel)([
                ['This is a test notebook with only markdown cells', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['Lorem ipsum dolor sit amet', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['In other news', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
            ], [
                ['This is a test notebook with markdown cells only', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['Lorem ipsum dolor sit amet', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['In the news', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
            ], (model, disposables, accessor) => {
                const diff = new diff_1.LcsDiff(new CellSequence(model.original.notebook), new CellSequence(model.modified.notebook));
                const diffResult = diff.ComputeDiff(false);
                const eventDispatcher = disposables.add(new eventDispatcher_1.NotebookDiffEditorEventDispatcher());
                const diffViewModels = notebookDiffEditor_1.NotebookTextDiffEditor.computeDiff(accessor, configurationService, model, eventDispatcher, {
                    cellsDiff: diffResult
                }, undefined);
                assert.strictEqual(diffViewModels.viewModels.length, 3);
                assert.strictEqual(diffViewModels.viewModels[0].type, 'modified');
                assert.strictEqual(diffViewModels.viewModels[1].type, 'unchanged');
                assert.strictEqual(diffViewModels.viewModels[2].type, 'modified');
                diffViewModels.viewModels.forEach(vm => {
                    vm.original?.dispose();
                    vm.modified?.dispose();
                    vm.dispose();
                });
                model.original.notebook.dispose();
                model.modified.notebook.dispose();
            });
        });
        test('diff insert', async () => {
            await (0, testNotebookEditor_1.withTestNotebookDiffModel)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], [
                ['var h = 8;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (model, disposables, accessor) => {
                const eventDispatcher = disposables.add(new eventDispatcher_1.NotebookDiffEditorEventDispatcher());
                const diffResult = notebookDiffEditor_1.NotebookTextDiffEditor.computeDiff(accessor, configurationService, model, eventDispatcher, {
                    cellsDiff: {
                        changes: [{
                                originalStart: 0,
                                originalLength: 0,
                                modifiedStart: 0,
                                modifiedLength: 1
                            }],
                        quitEarly: false
                    }
                }, undefined);
                assert.strictEqual(diffResult.firstChangeIndex, 0);
                assert.strictEqual(diffResult.viewModels[0].type, 'insert');
                assert.strictEqual(diffResult.viewModels[1].type, 'unchanged');
                assert.strictEqual(diffResult.viewModels[2].type, 'unchanged');
                diffResult.viewModels.forEach(vm => {
                    vm.original?.dispose();
                    vm.modified?.dispose();
                    vm.dispose();
                });
                model.original.notebook.dispose();
                model.modified.notebook.dispose();
            });
        });
        test('diff insert 2', async () => {
            await (0, testNotebookEditor_1.withTestNotebookDiffModel)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var d = 4;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var e = 5;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var f = 6;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var g = 7;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], [
                ['var h = 8;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var d = 4;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var e = 5;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var f = 6;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var g = 7;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], async (model, disposables, accessor) => {
                const eventDispatcher = disposables.add(new eventDispatcher_1.NotebookDiffEditorEventDispatcher());
                const diffResult = notebookDiffEditor_1.NotebookTextDiffEditor.computeDiff(accessor, configurationService, model, eventDispatcher, {
                    cellsDiff: {
                        changes: [{
                                originalStart: 0,
                                originalLength: 0,
                                modifiedStart: 0,
                                modifiedLength: 1
                            }, {
                                originalStart: 0,
                                originalLength: 6,
                                modifiedStart: 1,
                                modifiedLength: 6
                            }],
                        quitEarly: false
                    }
                }, undefined);
                assert.strictEqual(diffResult.firstChangeIndex, 0);
                assert.strictEqual(diffResult.viewModels[0].type, 'insert');
                assert.strictEqual(diffResult.viewModels[1].type, 'unchanged');
                assert.strictEqual(diffResult.viewModels[2].type, 'unchanged');
                assert.strictEqual(diffResult.viewModels[3].type, 'unchanged');
                assert.strictEqual(diffResult.viewModels[4].type, 'unchanged');
                assert.strictEqual(diffResult.viewModels[5].type, 'unchanged');
                assert.strictEqual(diffResult.viewModels[6].type, 'unchanged');
                assert.strictEqual(diffResult.viewModels[7].type, 'unchanged');
                diffResult.viewModels.forEach(vm => {
                    vm.original?.dispose();
                    vm.modified?.dispose();
                    vm.dispose();
                });
                model.original.notebook.dispose();
                model.modified.notebook.dispose();
            });
        });
        test('diff insert 3', async () => {
            await (0, testNotebookEditor_1.withTestNotebookDiffModel)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var d = 4;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var e = 5;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var f = 6;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var g = 7;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], [
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var d = 4;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var h = 8;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var e = 5;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var f = 6;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var g = 7;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], async (model, disposables, accessor) => {
                const eventDispatcher = disposables.add(new eventDispatcher_1.NotebookDiffEditorEventDispatcher());
                const diffResult = notebookDiffEditor_1.NotebookTextDiffEditor.computeDiff(accessor, configurationService, model, eventDispatcher, {
                    cellsDiff: {
                        changes: [{
                                originalStart: 4,
                                originalLength: 0,
                                modifiedStart: 4,
                                modifiedLength: 1
                            }],
                        quitEarly: false
                    }
                }, undefined);
                // assert.strictEqual(diffResult.firstChangeIndex, 4);
                assert.strictEqual(diffResult.viewModels[0].type, 'unchanged');
                assert.strictEqual(diffResult.viewModels[1].type, 'unchanged');
                assert.strictEqual(diffResult.viewModels[2].type, 'unchanged');
                assert.strictEqual(diffResult.viewModels[3].type, 'unchanged');
                assert.strictEqual(diffResult.viewModels[4].type, 'insert');
                assert.strictEqual(diffResult.viewModels[5].type, 'unchanged');
                assert.strictEqual(diffResult.viewModels[6].type, 'unchanged');
                assert.strictEqual(diffResult.viewModels[7].type, 'unchanged');
                diffResult.viewModels.forEach(vm => {
                    vm.original?.dispose();
                    vm.modified?.dispose();
                    vm.dispose();
                });
                model.original.notebook.dispose();
                model.modified.notebook.dispose();
            });
        });
        test('LCS', async () => {
            await (0, testNotebookEditor_1.withTestNotebookDiffModel)([
                ['# Description', 'markdown', notebookCommon_1.CellKind.Markup, [], { custom: { metadata: {} } }],
                ['x = 3', 'javascript', notebookCommon_1.CellKind.Code, [], { custom: { metadata: { collapsed: true } }, executionOrder: 1 }],
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someId', outputs: [{ mime: mime_1.Mimes.text, data: buffer_1.VSBuffer.wrap(new Uint8Array([3])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 1 }],
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [], { custom: { metadata: { collapsed: false } } }]
            ], [
                ['# Description', 'markdown', notebookCommon_1.CellKind.Markup, [], { custom: { metadata: {} } }],
                ['x = 3', 'javascript', notebookCommon_1.CellKind.Code, [], { custom: { metadata: { collapsed: true } }, executionOrder: 1 }],
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [], { custom: { metadata: { collapsed: false } } }],
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someId', outputs: [{ mime: mime_1.Mimes.text, data: buffer_1.VSBuffer.wrap(new Uint8Array([3])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 1 }]
            ], async (model) => {
                const diff = new diff_1.LcsDiff(new CellSequence(model.original.notebook), new CellSequence(model.modified.notebook));
                const diffResult = diff.ComputeDiff(false);
                assert.deepStrictEqual(diffResult.changes.map(change => ({
                    originalStart: change.originalStart,
                    originalLength: change.originalLength,
                    modifiedStart: change.modifiedStart,
                    modifiedLength: change.modifiedLength
                })), [{
                        originalStart: 2,
                        originalLength: 0,
                        modifiedStart: 2,
                        modifiedLength: 1
                    }, {
                        originalStart: 3,
                        originalLength: 1,
                        modifiedStart: 4,
                        modifiedLength: 0
                    }]);
            });
        });
        test('LCS 2', async () => {
            await (0, testNotebookEditor_1.withTestNotebookDiffModel)([
                ['# Description', 'markdown', notebookCommon_1.CellKind.Markup, [], { custom: { metadata: {} } }],
                ['x = 3', 'javascript', notebookCommon_1.CellKind.Code, [], { custom: { metadata: { collapsed: true } }, executionOrder: 1 }],
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someId', outputs: [{ mime: mime_1.Mimes.text, data: buffer_1.VSBuffer.wrap(new Uint8Array([3])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 1 }],
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [], { custom: { metadata: { collapsed: false } } }],
                ['x = 5', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someId', outputs: [{ mime: mime_1.Mimes.text, data: buffer_1.VSBuffer.wrap(new Uint8Array([5])) }] }], {}],
            ], [
                ['# Description', 'markdown', notebookCommon_1.CellKind.Markup, [], { custom: { metadata: {} } }],
                ['x = 3', 'javascript', notebookCommon_1.CellKind.Code, [], { custom: { metadata: { collapsed: true } }, executionOrder: 1 }],
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [], { custom: { metadata: { collapsed: false } } }],
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someId', outputs: [{ mime: mime_1.Mimes.text, data: buffer_1.VSBuffer.wrap(new Uint8Array([3])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 1 }],
                ['x = 5', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someId', outputs: [{ mime: mime_1.Mimes.text, data: buffer_1.VSBuffer.wrap(new Uint8Array([5])) }] }], {}],
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], async (model) => {
                const diff = new diff_1.LcsDiff(new CellSequence(model.original.notebook), new CellSequence(model.modified.notebook));
                const diffResult = diff.ComputeDiff(false);
                notebookDiffEditor_1.NotebookTextDiffEditor.prettyChanges(model, diffResult);
                assert.deepStrictEqual(diffResult.changes.map(change => ({
                    originalStart: change.originalStart,
                    originalLength: change.originalLength,
                    modifiedStart: change.modifiedStart,
                    modifiedLength: change.modifiedLength
                })), [{
                        originalStart: 2,
                        originalLength: 0,
                        modifiedStart: 2,
                        modifiedLength: 1
                    }, {
                        originalStart: 3,
                        originalLength: 1,
                        modifiedStart: 4,
                        modifiedLength: 0
                    }, {
                        originalStart: 5,
                        originalLength: 0,
                        modifiedStart: 5,
                        modifiedLength: 1
                    }, {
                        originalStart: 6,
                        originalLength: 1,
                        modifiedStart: 7,
                        modifiedLength: 0
                    }]);
            });
        });
        test('LCS 3', async () => {
            await (0, testNotebookEditor_1.withTestNotebookDiffModel)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var d = 4;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var e = 5;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var f = 6;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var g = 7;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], [
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var d = 4;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var h = 8;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var e = 5;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var f = 6;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var g = 7;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], async (model) => {
                const diff = new diff_1.LcsDiff(new CellSequence(model.original.notebook), new CellSequence(model.modified.notebook));
                const diffResult = diff.ComputeDiff(false);
                notebookDiffEditor_1.NotebookTextDiffEditor.prettyChanges(model, diffResult);
                assert.deepStrictEqual(diffResult.changes.map(change => ({
                    originalStart: change.originalStart,
                    originalLength: change.originalLength,
                    modifiedStart: change.modifiedStart,
                    modifiedLength: change.modifiedLength
                })), [{
                        originalStart: 4,
                        originalLength: 0,
                        modifiedStart: 4,
                        modifiedLength: 1
                    }]);
            });
        });
        test('diff output', async () => {
            await (0, testNotebookEditor_1.withTestNotebookDiffModel)([
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someOtherId', outputs: [{ mime: mime_1.Mimes.text, data: buffer_1.VSBuffer.wrap(new Uint8Array([3])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 3 }],
                ['y', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someOtherId', outputs: [{ mime: mime_1.Mimes.text, data: buffer_1.VSBuffer.wrap(new Uint8Array([4])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 3 }],
            ], [
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someOtherId', outputs: [{ mime: mime_1.Mimes.text, data: buffer_1.VSBuffer.wrap(new Uint8Array([3])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 3 }],
                ['y', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someOtherId', outputs: [{ mime: mime_1.Mimes.text, data: buffer_1.VSBuffer.wrap(new Uint8Array([5])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 3 }],
            ], (model, disposables, accessor) => {
                const diff = new diff_1.LcsDiff(new CellSequence(model.original.notebook), new CellSequence(model.modified.notebook));
                const diffResult = diff.ComputeDiff(false);
                const eventDispatcher = disposables.add(new eventDispatcher_1.NotebookDiffEditorEventDispatcher());
                const diffViewModels = notebookDiffEditor_1.NotebookTextDiffEditor.computeDiff(accessor, configurationService, model, eventDispatcher, {
                    cellsDiff: diffResult
                }, undefined);
                assert.strictEqual(diffViewModels.viewModels.length, 2);
                assert.strictEqual(diffViewModels.viewModels[0].type, 'unchanged');
                assert.strictEqual(diffViewModels.viewModels[0].checkIfOutputsModified(), false);
                assert.strictEqual(diffViewModels.viewModels[1].type, 'modified');
                diffViewModels.viewModels.forEach(vm => {
                    vm.original?.dispose();
                    vm.modified?.dispose();
                    vm.dispose();
                });
                model.original.notebook.dispose();
                model.modified.notebook.dispose();
            });
        });
        test('diff output fast check', async () => {
            await (0, testNotebookEditor_1.withTestNotebookDiffModel)([
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someOtherId', outputs: [{ mime: mime_1.Mimes.text, data: buffer_1.VSBuffer.wrap(new Uint8Array([3])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 3 }],
                ['y', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someOtherId', outputs: [{ mime: mime_1.Mimes.text, data: buffer_1.VSBuffer.wrap(new Uint8Array([4])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 3 }],
            ], [
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someOtherId', outputs: [{ mime: mime_1.Mimes.text, data: buffer_1.VSBuffer.wrap(new Uint8Array([3])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 3 }],
                ['y', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someOtherId', outputs: [{ mime: mime_1.Mimes.text, data: buffer_1.VSBuffer.wrap(new Uint8Array([5])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 3 }],
            ], (model, disposables, accessor) => {
                const diff = new diff_1.LcsDiff(new CellSequence(model.original.notebook), new CellSequence(model.modified.notebook));
                const diffResult = diff.ComputeDiff(false);
                const eventDispatcher = disposables.add(new eventDispatcher_1.NotebookDiffEditorEventDispatcher());
                const diffViewModels = notebookDiffEditor_1.NotebookTextDiffEditor.computeDiff(accessor, configurationService, model, eventDispatcher, {
                    cellsDiff: diffResult
                }, undefined);
                assert.strictEqual(diffViewModels.viewModels.length, 2);
                assert.strictEqual(diffViewModels.viewModels[0].original.textModel.equal(diffViewModels.viewModels[0].modified.textModel), true);
                assert.strictEqual(diffViewModels.viewModels[1].original.textModel.equal(diffViewModels.viewModels[1].modified.textModel), false);
                diffViewModels.viewModels.forEach(vm => {
                    vm.original?.dispose();
                    vm.modified?.dispose();
                    vm.dispose();
                });
                model.original.notebook.dispose();
                model.modified.notebook.dispose();
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tEaWZmLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay90ZXN0L2Jyb3dzZXIvbm90ZWJvb2tEaWZmLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFhaEcsTUFBTSxZQUFZO1FBRWpCLFlBQXFCLFNBQTZCO1lBQTdCLGNBQVMsR0FBVCxTQUFTLENBQW9CO1FBQ2xELENBQUM7UUFFRCxXQUFXO1lBQ1YsTUFBTSxTQUFTLEdBQUcsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDOUQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDckQsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDO2FBQ3REO1lBRUQsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztLQUNEO0lBRUQsS0FBSyxDQUFDLGdCQUFnQixFQUFFLEdBQUcsRUFBRTtRQUM1QixNQUFNLG9CQUFvQixHQUFHLElBQUksbURBQXdCLEVBQUUsQ0FBQztRQUM1RCxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFMUMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLEtBQUssSUFBSSxFQUFFO1lBQ3hDLE1BQU0sSUFBQSw4Q0FBeUIsRUFBQztnQkFDL0IsQ0FBQyxHQUFHLEVBQUUsWUFBWSxFQUFFLHlCQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLFlB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QUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQzVELE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUM7Z0JBQy9ELE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUM7Z0JBQy9ELE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUM7Z0JBQy9ELE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUM7Z0JBQy9ELE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUM7Z0JBQy9ELE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUM7Z0JBQy9ELE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUM7Z0JBRS9ELFVBQVUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFO29CQUNsQyxFQUFFLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxDQUFDO29CQUN2QixFQUFFLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxDQUFDO29CQUN2QixFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ2QsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ2xDLEtBQUss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QUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDO2dCQUMvRCxNQUFNLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDO2dCQUMvRCxNQUFNLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDO2dCQUMvRCxNQUFNLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUM1RCxNQUFNLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDO2dCQUMvRCxNQUFNLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDO2dCQUMvRCxNQUFNLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDO2dCQUUvRCxVQUFVLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRTtvQkFDbEMsRUFBRSxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsQ0FBQztvQkFDdkIsRUFBRSxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsQ0FBQztvQkFDdkIsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNkLENBQUMsQ0FBQyxDQUFDO2dCQUNILEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNsQyxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNuQyxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO1FB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