/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/test/common/mock", "vs/base/test/common/utils", "vs/editor/browser/diff/testDiffProviderFactoryService", "vs/editor/browser/widget/diffEditor/diffProviderFactoryService", "vs/editor/common/core/range", "vs/editor/common/services/model", "vs/editor/test/browser/testCodeEditor", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/serviceCollection", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/progress/common/progress", "vs/workbench/contrib/accessibility/browser/accessibleView", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/inlineChat/browser/inlineChatController", "vs/workbench/contrib/inlineChat/browser/inlineChatSession", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/workbench/contrib/inlineChat/common/inlineChatServiceImpl", "vs/workbench/test/browser/workbenchTestServices"], function (require, exports, assert, arrays_1, event_1, lifecycle_1, mock_1, utils_1, testDiffProviderFactoryService_1, diffProviderFactoryService_1, range_1, model_1, testCodeEditor_1, contextkey_1, descriptors_1, serviceCollection_1, mockKeybindingService_1, progress_1, accessibleView_1, chat_1, inlineChatController_1, inlineChatSession_1, inlineChat_1, inlineChatServiceImpl_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('InteractiveChatController', function () {
        class TestController extends inlineChatController_1.InlineChatController {
            constructor() {
                super(...arguments);
                this._onDidChangeState = new event_1.Emitter();
                this.onDidChangeState = this._onDidChangeState.event;
                this.states = [];
            }
            static { this.INIT_SEQUENCE = ["CREATE_SESSION" /* State.CREATE_SESSION */, "INIT_UI" /* State.INIT_UI */, "WAIT_FOR_INPUT" /* State.WAIT_FOR_INPUT */]; }
            static { this.INIT_SEQUENCE_AUTO_SEND = [...this.INIT_SEQUENCE, "MAKE_REQUEST" /* State.MAKE_REQUEST */, "APPLY_RESPONSE" /* State.APPLY_RESPONSE */, "SHOW_RESPONSE" /* State.SHOW_RESPONSE */, "WAIT_FOR_INPUT" /* State.WAIT_FOR_INPUT */]; }
            waitFor(states) {
                const actual = [];
                return new Promise((resolve, reject) => {
                    const d = this.onDidChangeState(state => {
                        actual.push(state);
                        if ((0, arrays_1.equals)(states, actual)) {
                            d.dispose();
                            resolve();
                        }
                    });
                    setTimeout(() => {
                        d.dispose();
                        reject(`timeout, \nWANTED ${states.join('>')}, \nGOT ${actual.join('>')}`);
                    }, 1000);
                });
            }
            async _nextState(state, options) {
                let nextState = state;
                while (nextState) {
                    this._onDidChangeState.fire(nextState);
                    this.states.push(nextState);
                    nextState = await this[nextState](options);
                }
            }
            dispose() {
                super.dispose();
                this._onDidChangeState.dispose();
            }
        }
        const store = new lifecycle_1.DisposableStore();
        let editor;
        let model;
        let ctrl;
        // let contextKeys: MockContextKeyService;
        let inlineChatService;
        let inlineChatSessionService;
        let instaService;
        setup(function () {
            const contextKeyService = new mockKeybindingService_1.MockContextKeyService();
            inlineChatService = new inlineChatServiceImpl_1.InlineChatServiceImpl(contextKeyService);
            const serviceCollection = new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, contextKeyService], [inlineChat_1.IInlineChatService, inlineChatService], [diffProviderFactoryService_1.IDiffProviderFactoryService, new descriptors_1.SyncDescriptor(testDiffProviderFactoryService_1.TestDiffProviderFactoryService)], [inlineChatSession_1.IInlineChatSessionService, new descriptors_1.SyncDescriptor(inlineChatSession_1.InlineChatSessionService)], [progress_1.IEditorProgressService, new class extends (0, mock_1.mock)() {
                    show(total, delay) {
                        return {
                            total() { },
                            worked(value) { },
                            done() { },
                        };
                    }
                }], [chat_1.IChatAccessibilityService, new class extends (0, mock_1.mock)() {
                    acceptResponse(response) { }
                    acceptRequest() { }
                }], [accessibleView_1.IAccessibleViewService, new class extends (0, mock_1.mock)() {
                    getOpenAriaHint(verbositySettingKey) {
                        return null;
                    }
                }]);
            instaService = store.add((0, workbenchTestServices_1.workbenchInstantiationService)(undefined, store).createChild(serviceCollection));
            inlineChatSessionService = store.add(instaService.get(inlineChatSession_1.IInlineChatSessionService));
            model = store.add(instaService.get(model_1.IModelService).createModel('Hello\nWorld\nHello Again\nHello World\n', null));
            editor = store.add((0, testCodeEditor_1.instantiateTestCodeEditor)(instaService, model));
            store.add(inlineChatService.addProvider({
                debugName: 'Unit Test',
                label: 'Unit Test',
                prepareInlineChatSession() {
                    return {
                        id: Math.random()
                    };
                },
                provideResponse(session, request) {
                    return {
                        type: "editorEdit" /* InlineChatResponseType.EditorEdit */,
                        id: Math.random(),
                        edits: [{
                                range: new range_1.Range(1, 1, 1, 1),
                                text: request.prompt
                            }]
                    };
                }
            }));
        });
        teardown(function () {
            store.clear();
            ctrl?.dispose();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('creation, not showing anything', function () {
            ctrl = instaService.createInstance(TestController, editor);
            assert.ok(ctrl);
            assert.strictEqual(ctrl.getWidgetPosition(), undefined);
        });
        test('run (show/hide)', async function () {
            ctrl = instaService.createInstance(TestController, editor);
            const p = ctrl.waitFor(TestController.INIT_SEQUENCE_AUTO_SEND);
            const run = ctrl.run({ message: 'Hello', autoSend: true });
            await p;
            assert.ok(ctrl.getWidgetPosition() !== undefined);
            ctrl.cancelSession();
            await run;
            assert.ok(ctrl.getWidgetPosition() === undefined);
        });
        test('wholeRange expands to whole lines, editor selection default', async function () {
            editor.setSelection(new range_1.Range(1, 1, 1, 3));
            ctrl = instaService.createInstance(TestController, editor);
            const d = inlineChatService.addProvider({
                debugName: 'Unit Test',
                label: 'Unit Test',
                prepareInlineChatSession() {
                    return {
                        id: Math.random()
                    };
                },
                provideResponse(session, request) {
                    throw new Error();
                }
            });
            ctrl.run({});
            await event_1.Event.toPromise(event_1.Event.filter(ctrl.onDidChangeState, e => e === "WAIT_FOR_INPUT" /* State.WAIT_FOR_INPUT */));
            const session = inlineChatSessionService.getSession(editor, editor.getModel().uri);
            assert.ok(session);
            assert.deepStrictEqual(session.wholeRange.value, new range_1.Range(1, 1, 1, 6));
            ctrl.cancelSession();
            d.dispose();
        });
        test('wholeRange expands to whole lines, session provided', async function () {
            editor.setSelection(new range_1.Range(1, 1, 1, 1));
            ctrl = instaService.createInstance(TestController, editor);
            const d = inlineChatService.addProvider({
                debugName: 'Unit Test',
                label: 'Unit Test',
                prepareInlineChatSession() {
                    return {
                        id: Math.random(),
                        wholeRange: new range_1.Range(1, 1, 1, 3)
                    };
                },
                provideResponse(session, request) {
                    throw new Error();
                }
            });
            ctrl.run({});
            await event_1.Event.toPromise(event_1.Event.filter(ctrl.onDidChangeState, e => e === "WAIT_FOR_INPUT" /* State.WAIT_FOR_INPUT */));
            const session = inlineChatSessionService.getSession(editor, editor.getModel().uri);
            assert.ok(session);
            assert.deepStrictEqual(session.wholeRange.value, new range_1.Range(1, 1, 1, 6));
            ctrl.cancelSession();
            d.dispose();
        });
        test('typing outside of wholeRange finishes session', async function () {
            ctrl = instaService.createInstance(TestController, editor);
            const p = ctrl.waitFor(TestController.INIT_SEQUENCE_AUTO_SEND);
            const r = ctrl.run({ message: 'Hello', autoSend: true });
            await p;
            const session = inlineChatSessionService.getSession(editor, editor.getModel().uri);
            assert.ok(session);
            assert.deepStrictEqual(session.wholeRange.value, new range_1.Range(1, 1, 1, 11));
            editor.setSelection(new range_1.Range(2, 1, 2, 1));
            editor.trigger('test', 'type', { text: 'a' });
            await ctrl.waitFor(["DONE" /* State.ACCEPT */]);
            await r;
        });
        test('\'whole range\' isn\'t updated for edits outside whole range #4346', async function () {
            editor.setSelection(new range_1.Range(3, 1, 3, 1));
            const d = inlineChatService.addProvider({
                debugName: 'Unit Test',
                label: 'Unit Test',
                prepareInlineChatSession() {
                    return {
                        id: Math.random(),
                        wholeRange: new range_1.Range(3, 1, 3, 3)
                    };
                },
                provideResponse(session, request) {
                    return {
                        type: "editorEdit" /* InlineChatResponseType.EditorEdit */,
                        id: Math.random(),
                        edits: [{
                                range: new range_1.Range(1, 1, 1, 1),
                                text: `${request.prompt}\n${request.prompt}`
                            }]
                    };
                }
            });
            store.add(d);
            ctrl = instaService.createInstance(TestController, editor);
            const p = ctrl.waitFor(TestController.INIT_SEQUENCE);
            const r = ctrl.run({ message: 'Hello', autoSend: false });
            await p;
            const session = inlineChatSessionService.getSession(editor, editor.getModel().uri);
            assert.ok(session);
            assert.deepStrictEqual(session.wholeRange.value, new range_1.Range(3, 1, 3, 12));
            ctrl.acceptInput();
            await ctrl.waitFor(["MAKE_REQUEST" /* State.MAKE_REQUEST */, "APPLY_RESPONSE" /* State.APPLY_RESPONSE */, "SHOW_RESPONSE" /* State.SHOW_RESPONSE */, "WAIT_FOR_INPUT" /* State.WAIT_FOR_INPUT */]);
            assert.deepStrictEqual(session.wholeRange.value, new range_1.Range(1, 1, 4, 12));
            ctrl.cancelSession();
            await r;
        });
        test('Stuck inline chat widget #211', async function () {
            const d = inlineChatService.addProvider({
                debugName: 'Unit Test',
                label: 'Unit Test',
                prepareInlineChatSession() {
                    return {
                        id: Math.random(),
                        wholeRange: new range_1.Range(3, 1, 3, 3)
                    };
                },
                provideResponse(session, request) {
                    return new Promise(() => { });
                }
            });
            store.add(d);
            ctrl = instaService.createInstance(TestController, editor);
            const p = ctrl.waitFor([...TestController.INIT_SEQUENCE, "MAKE_REQUEST" /* State.MAKE_REQUEST */]);
            const r = ctrl.run({ message: 'Hello', autoSend: true });
            await p;
            ctrl.acceptSession();
            await r;
            assert.strictEqual(ctrl.getWidgetPosition(), undefined);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lQ2hhdENvbnRyb2xsZXIudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2lubGluZUNoYXQvdGVzdC9icm93c2VyL2lubGluZUNoYXRDb250cm9sbGVyLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUErQmhHLEtBQUssQ0FBQywyQkFBMkIsRUFBRTtRQUNsQyxNQUFNLGNBQWUsU0FBUSwyQ0FBb0I7WUFBakQ7O2dCQUtrQixzQkFBaUIsR0FBRyxJQUFJLGVBQU8sRUFBUyxDQUFDO2dCQUNqRCxxQkFBZ0IsR0FBaUIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQztnQkFFOUQsV0FBTSxHQUFxQixFQUFFLENBQUM7WUFrQ3hDLENBQUM7cUJBeENPLGtCQUFhLEdBQXFCLHlIQUEyRCxBQUFoRixDQUFpRjtxQkFDOUYsNEJBQXVCLEdBQXFCLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSwrS0FBc0YsQUFBakksQ0FBa0k7WUFPaEssT0FBTyxDQUFDLE1BQXdCO2dCQUMvQixNQUFNLE1BQU0sR0FBWSxFQUFFLENBQUM7Z0JBRTNCLE9BQU8sSUFBSSxPQUFPLENBQU8sQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7b0JBQzVDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsRUFBRTt3QkFDdkMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDbkIsSUFBSSxJQUFBLGVBQU0sRUFBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLEVBQUU7NEJBQzNCLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQzs0QkFDWixPQUFPLEVBQUUsQ0FBQzt5QkFDVjtvQkFDRixDQUFDLENBQUMsQ0FBQztvQkFFSCxVQUFVLENBQUMsR0FBRyxFQUFFO3dCQUNmLENB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