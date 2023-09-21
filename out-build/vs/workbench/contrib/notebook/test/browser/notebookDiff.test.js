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
        const configurationService = new testConfigurationService_1.$G0b();
        (0, utils_1.$bT)();
        test('diff different source', async () => {
            await (0, testNotebookEditor_1.$Kfc)([
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someOtherId', outputs: [{ mime: mime_1.$Hr.text, data: buffer_1.$Fd.wrap(new Uint8Array([3])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 3 }],
            ], [
                ['y', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someOtherId', outputs: [{ mime: mime_1.$Hr.text, data: buffer_1.$Fd.wrap(new Uint8Array([3])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 3 }],
            ], (model, disposables, accessor) => {
                const diff = new diff_1.$qs(new CellSequence(model.original.notebook), new CellSequence(model.modified.notebook));
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
                const eventDispatcher = disposables.add(new eventDispatcher_1.$FEb());
                const diffViewModels = notebookDiffEditor_1.$1Eb.computeDiff(accessor, configurationService, model, eventDispatcher, {
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
            await (0, testNotebookEditor_1.$Kfc)([
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someId', outputs: [{ mime: mime_1.$Hr.text, data: buffer_1.$Fd.wrap(new Uint8Array([5])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 5 }],
                ['', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], [
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someOtherId', outputs: [{ mime: mime_1.$Hr.text, data: buffer_1.$Fd.wrap(new Uint8Array([3])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 3 }],
                ['', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (model, disposables, accessor) => {
                const diff = new diff_1.$qs(new CellSequence(model.original.notebook), new CellSequence(model.modified.notebook));
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
                const eventDispatcher = disposables.add(new eventDispatcher_1.$FEb());
                const diffViewModels = notebookDiffEditor_1.$1Eb.computeDiff(accessor, configurationService, model, eventDispatcher, {
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
            await (0, testNotebookEditor_1.$Kfc)([
                ['123456789', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], [
                ['987654321', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], (model, disposables, accessor) => {
                const diff = new diff_1.$qs(new CellSequence(model.original.notebook), new CellSequence(model.modified.notebook));
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
                const eventDispatcher = disposables.add(new eventDispatcher_1.$FEb());
                const diffViewModels = notebookDiffEditor_1.$1Eb.computeDiff(accessor, configurationService, model, eventDispatcher, {
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
            await (0, testNotebookEditor_1.$Kfc)([
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
                const diff = new diff_1.$qs(new CellSequence(model.original.notebook), new CellSequence(model.modified.notebook));
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
                const eventDispatcher = disposables.add(new eventDispatcher_1.$FEb());
                const diffViewModels = notebookDiffEditor_1.$1Eb.computeDiff(accessor, configurationService, model, eventDispatcher, {
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
            await (0, testNotebookEditor_1.$Kfc)([
                [['def foe(x, y):\n', '    return x + y\n', 'foe(3, 2)'].join(''), 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someId', outputs: [{ mime: mime_1.$Hr.text, data: buffer_1.$Fd.wrap(new Uint8Array([6])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 5 }],
                [['def foo(x, y):\n', '    return x * y\n', 'foo(1, 2)'].join(''), 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someId', outputs: [{ mime: mime_1.$Hr.text, data: buffer_1.$Fd.wrap(new Uint8Array([2])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 6 }],
                ['', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], [
                [['def foo(x, y):\n', '    return x * y\n', 'foo(1, 2)'].join(''), 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someId', outputs: [{ mime: mime_1.$Hr.text, data: buffer_1.$Fd.wrap(new Uint8Array([6])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 5 }],
                [['def foe(x, y):\n', '    return x + y\n', 'foe(3, 2)'].join(''), 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someId', outputs: [{ mime: mime_1.$Hr.text, data: buffer_1.$Fd.wrap(new Uint8Array([2])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 6 }],
                ['', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (model, disposables, accessor) => {
                const diff = new diff_1.$qs(new CellSequence(model.original.notebook), new CellSequence(model.modified.notebook));
                const diffResult = diff.ComputeDiff(false);
                const eventDispatcher = disposables.add(new eventDispatcher_1.$FEb());
                const diffViewModels = notebookDiffEditor_1.$1Eb.computeDiff(accessor, configurationService, model, eventDispatcher, {
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
            await (0, testNotebookEditor_1.$Kfc)([
                ['This is a test notebook with only markdown cells', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['Lorem ipsum dolor sit amet', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['In other news', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
            ], [
                ['This is a test notebook with markdown cells only', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['Lorem ipsum dolor sit amet', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['In the news', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
            ], (model, disposables, accessor) => {
                const diff = new diff_1.$qs(new CellSequence(model.original.notebook), new CellSequence(model.modified.notebook));
                const diffResult = diff.ComputeDiff(false);
                const eventDispatcher = disposables.add(new eventDispatcher_1.$FEb());
                const diffViewModels = notebookDiffEditor_1.$1Eb.computeDiff(accessor, configurationService, model, eventDispatcher, {
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
            await (0, testNotebookEditor_1.$Kfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], [
                ['var h = 8;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (model, disposables, accessor) => {
                const eventDispatcher = disposables.add(new eventDispatcher_1.$FEb());
                const diffResult = notebookDiffEditor_1.$1Eb.computeDiff(accessor, configurationService, model, eventDispatcher, {
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
            await (0, testNotebookEditor_1.$Kfc)([
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
                const eventDispatcher = disposables.add(new eventDispatcher_1.$FEb());
                const diffResult = notebookDiffEditor_1.$1Eb.computeDiff(accessor, configurationService, model, eventDispatcher, {
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
            await (0, testNotebookEditor_1.$Kfc)([
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
                const eventDispatcher = disposables.add(new eventDispatcher_1.$FEb());
                const diffResult = notebookDiffEditor_1.$1Eb.computeDiff(accessor, configurationService, model, eventDispatcher, {
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
            await (0, testNotebookEditor_1.$Kfc)([
                ['# Description', 'markdown', notebookCommon_1.CellKind.Markup, [], { custom: { metadata: {} } }],
                ['x = 3', 'javascript', notebookCommon_1.CellKind.Code, [], { custom: { metadata: { collapsed: true } }, executionOrder: 1 }],
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someId', outputs: [{ mime: mime_1.$Hr.text, data: buffer_1.$Fd.wrap(new Uint8Array([3])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 1 }],
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [], { custom: { metadata: { collapsed: false } } }]
            ], [
                ['# Description', 'markdown', notebookCommon_1.CellKind.Markup, [], { custom: { metadata: {} } }],
                ['x = 3', 'javascript', notebookCommon_1.CellKind.Code, [], { custom: { metadata: { collapsed: true } }, executionOrder: 1 }],
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [], { custom: { metadata: { collapsed: false } } }],
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someId', outputs: [{ mime: mime_1.$Hr.text, data: buffer_1.$Fd.wrap(new Uint8Array([3])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 1 }]
            ], async (model) => {
                const diff = new diff_1.$qs(new CellSequence(model.original.notebook), new CellSequence(model.modified.notebook));
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
            await (0, testNotebookEditor_1.$Kfc)([
                ['# Description', 'markdown', notebookCommon_1.CellKind.Markup, [], { custom: { metadata: {} } }],
                ['x = 3', 'javascript', notebookCommon_1.CellKind.Code, [], { custom: { metadata: { collapsed: true } }, executionOrder: 1 }],
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someId', outputs: [{ mime: mime_1.$Hr.text, data: buffer_1.$Fd.wrap(new Uint8Array([3])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 1 }],
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [], { custom: { metadata: { collapsed: false } } }],
                ['x = 5', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someId', outputs: [{ mime: mime_1.$Hr.text, data: buffer_1.$Fd.wrap(new Uint8Array([5])) }] }], {}],
            ], [
                ['# Description', 'markdown', notebookCommon_1.CellKind.Markup, [], { custom: { metadata: {} } }],
                ['x = 3', 'javascript', notebookCommon_1.CellKind.Code, [], { custom: { metadata: { collapsed: true } }, executionOrder: 1 }],
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [], { custom: { metadata: { collapsed: false } } }],
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someId', outputs: [{ mime: mime_1.$Hr.text, data: buffer_1.$Fd.wrap(new Uint8Array([3])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 1 }],
                ['x = 5', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someId', outputs: [{ mime: mime_1.$Hr.text, data: buffer_1.$Fd.wrap(new Uint8Array([5])) }] }], {}],
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], async (model) => {
                const diff = new diff_1.$qs(new CellSequence(model.original.notebook), new CellSequence(model.modified.notebook));
                const diffResult = diff.ComputeDiff(false);
                notebookDiffEditor_1.$1Eb.prettyChanges(model, diffResult);
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
            await (0, testNotebookEditor_1.$Kfc)([
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
                const diff = new diff_1.$qs(new CellSequence(model.original.notebook), new CellSequence(model.modified.notebook));
                const diffResult = diff.ComputeDiff(false);
                notebookDiffEditor_1.$1Eb.prettyChanges(model, diffResult);
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
            await (0, testNotebookEditor_1.$Kfc)([
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someOtherId', outputs: [{ mime: mime_1.$Hr.text, data: buffer_1.$Fd.wrap(new Uint8Array([3])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 3 }],
                ['y', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someOtherId', outputs: [{ mime: mime_1.$Hr.text, data: buffer_1.$Fd.wrap(new Uint8Array([4])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 3 }],
            ], [
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someOtherId', outputs: [{ mime: mime_1.$Hr.text, data: buffer_1.$Fd.wrap(new Uint8Array([3])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 3 }],
                ['y', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someOtherId', outputs: [{ mime: mime_1.$Hr.text, data: buffer_1.$Fd.wrap(new Uint8Array([5])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 3 }],
            ], (model, disposables, accessor) => {
                const diff = new diff_1.$qs(new CellSequence(model.original.notebook), new CellSequence(model.modified.notebook));
                const diffResult = diff.ComputeDiff(false);
                const eventDispatcher = disposables.add(new eventDispatcher_1.$FEb());
                const diffViewModels = notebookDiffEditor_1.$1Eb.computeDiff(accessor, configurationService, model, eventDispatcher, {
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
            await (0, testNotebookEditor_1.$Kfc)([
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someOtherId', outputs: [{ mime: mime_1.$Hr.text, data: buffer_1.$Fd.wrap(new Uint8Array([3])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 3 }],
                ['y', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someOtherId', outputs: [{ mime: mime_1.$Hr.text, data: buffer_1.$Fd.wrap(new Uint8Array([4])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 3 }],
            ], [
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someOtherId', outputs: [{ mime: mime_1.$Hr.text, data: buffer_1.$Fd.wrap(new Uint8Array([3])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 3 }],
                ['y', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someOtherId', outputs: [{ mime: mime_1.$Hr.text, data: buffer_1.$Fd.wrap(new Uint8Array([5])) }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 3 }],
            ], (model, disposables, accessor) => {
                const diff = new diff_1.$qs(new CellSequence(model.original.notebook), new CellSequence(model.modified.notebook));
                const diffResult = diff.ComputeDiff(false);
                const eventDispatcher = disposables.add(new eventDispatcher_1.$FEb());
                const diffViewModels = notebookDiffEditor_1.$1Eb.computeDiff(accessor, configurationService, model, eventDispatcher, {
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
//# sourceMappingURL=notebookDiff.test.js.map