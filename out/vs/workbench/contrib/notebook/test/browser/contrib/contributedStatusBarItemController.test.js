/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/contributedStatusBarItemController", "vs/workbench/contrib/notebook/common/notebookCellStatusBarService", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/test/browser/testNotebookEditor"], function (require, exports, assert, event_1, lifecycle_1, contributedStatusBarItemController_1, notebookCellStatusBarService_1, notebookCommon_1, testNotebookEditor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Notebook Statusbar', () => {
        const testDisposables = new lifecycle_1.DisposableStore();
        teardown(() => {
            testDisposables.clear();
        });
        test('Calls item provider', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
            ], async (editor, viewModel, _ds, accessor) => {
                const cellStatusbarSvc = accessor.get(notebookCellStatusBarService_1.INotebookCellStatusBarService);
                testDisposables.add(accessor.createInstance(contributedStatusBarItemController_1.ContributedStatusBarItemController, editor));
                const provider = testDisposables.add(new class extends lifecycle_1.Disposable {
                    constructor() {
                        super(...arguments);
                        this.provideCalls = 0;
                        this._onProvideCalled = this._register(new event_1.Emitter());
                        this.onProvideCalled = this._onProvideCalled.event;
                        this._onDidChangeStatusBarItems = this._register(new event_1.Emitter());
                        this.onDidChangeStatusBarItems = this._onDidChangeStatusBarItems.event;
                        this.viewType = editor.textModel.viewType;
                    }
                    async provideCellStatusBarItems(_uri, index, _token) {
                        if (index === 0) {
                            this.provideCalls++;
                            this._onProvideCalled.fire(this.provideCalls);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJpYnV0ZWRTdGF0dXNCYXJJdGVtQ29udHJvbGxlci50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svdGVzdC9icm93c2VyL2NvbnRyaWIvY29udHJpYnV0ZWRTdGF0dXNCYXJJdGVtQ29udHJvbGxlci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBWWhHLEtBQUssQ0FBQyxvQkFBb0IsRUFBRSxHQUFHLEVBQUU7UUFDaEMsTUFBTSxlQUFlLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7UUFFOUMsUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUNiLGVBQWUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN6QixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxxQkFBcUIsRUFBRSxLQUFLO1lBQ2hDLE1BQU0sSUFBQSxxQ0FBZ0IsRUFDckI7Z0JBQ0MsQ0FBQyxZQUFZLEVBQUUsWUFBWSxFQUFFLHlCQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7Z0JBQ25ELENBQUMsWUFBWSxFQUFFLFVBQVUsRUFBRSx5QkFBUSxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO2FBQ25ELEVBQ0QsS0FBSyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxFQUFFO2dCQUMxQyxNQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsNERBQTZCLENBQUMsQ0FBQztnQkFDckUsZUFBZSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLHVFQUFrQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBRXpGLE1BQU0sUUFBUSxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFNLFNBQVEsc0JBQVU7b0JBQXhCOzt3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