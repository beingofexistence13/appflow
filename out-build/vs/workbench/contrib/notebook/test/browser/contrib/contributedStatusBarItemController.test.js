/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/contributedStatusBarItemController", "vs/workbench/contrib/notebook/common/notebookCellStatusBarService", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/test/browser/testNotebookEditor"], function (require, exports, assert, event_1, lifecycle_1, contributedStatusBarItemController_1, notebookCellStatusBarService_1, notebookCommon_1, testNotebookEditor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Notebook Statusbar', () => {
        const testDisposables = new lifecycle_1.$jc();
        teardown(() => {
            testDisposables.clear();
        });
        test('Calls item provider', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
            ], async (editor, viewModel, _ds, accessor) => {
                const cellStatusbarSvc = accessor.get(notebookCellStatusBarService_1.$Qmb);
                testDisposables.add(accessor.createInstance(contributedStatusBarItemController_1.$xFb, editor));
                const provider = testDisposables.add(new class extends lifecycle_1.$kc {
                    constructor() {
                        super(...arguments);
                        this.a = 0;
                        this.b = this.B(new event_1.$fd());
                        this.onProvideCalled = this.b.event;
                        this._onDidChangeStatusBarItems = this.B(new event_1.$fd());
                        this.onDidChangeStatusBarItems = this._onDidChangeStatusBarItems.event;
                        this.viewType = editor.textModel.viewType;
                    }
                    async provideCellStatusBarItems(_uri, index, _token) {
                        if (index === 0) {
                            this.a++;
                            this.b.fire(this.a);
                        }
                        return { items: [] };
                    }
                });
                const providePromise1 = asPromise(provider.onProvideCalled);
                testDisposables.add(cellStatusbarSvc.registerCellStatusBarItemProvider(provider));
                assert.strictEqual(await providePromise1, 1, 'should call provider on registration');
                const providePromise2 = asPromise(provider.onProvideCalled);
                const cell0 = editor.textModel.cells[0];
                cell0.metadata = { ...cell0.metadata, ...{ newMetadata: true } };
                assert.strictEqual(await providePromise2, 2, 'should call provider on registration');
                const providePromise3 = asPromise(provider.onProvideCalled);
                cell0.language = 'newlanguage';
                assert.strictEqual(await providePromise3, 3, 'should call provider on registration');
                const providePromise4 = asPromise(provider.onProvideCalled);
                provider._onDidChangeStatusBarItems.fire();
                assert.strictEqual(await providePromise4, 4, 'should call provider on registration');
            });
        });
    });
    async function asPromise(event, timeout = 5000) {
        const error = new Error('asPromise TIMEOUT reached');
        return new Promise((resolve, reject) => {
            const handle = setTimeout(() => {
                sub.dispose();
                reject(error);
            }, timeout);
            const sub = event(e => {
                clearTimeout(handle);
                sub.dispose();
                resolve(e);
            });
        });
    }
});
//# sourceMappingURL=contributedStatusBarItemController.test.js.map