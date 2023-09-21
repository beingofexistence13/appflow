/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/test/common/mock", "vs/base/test/common/utils", "vs/editor/browser/diff/testDiffProviderFactoryService", "vs/editor/browser/widget/diffEditor/diffProviderFactoryService", "vs/editor/common/core/range", "vs/editor/common/services/model", "vs/editor/test/browser/testCodeEditor", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/serviceCollection", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/progress/common/progress", "vs/workbench/contrib/accessibility/browser/accessibleView", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/inlineChat/browser/inlineChatController", "vs/workbench/contrib/inlineChat/browser/inlineChatSession", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/workbench/contrib/inlineChat/common/inlineChatServiceImpl", "vs/workbench/test/browser/workbenchTestServices"], function (require, exports, assert, arrays_1, event_1, lifecycle_1, mock_1, utils_1, testDiffProviderFactoryService_1, diffProviderFactoryService_1, range_1, model_1, testCodeEditor_1, contextkey_1, descriptors_1, serviceCollection_1, mockKeybindingService_1, progress_1, accessibleView_1, chat_1, inlineChatController_1, inlineChatSession_1, inlineChat_1, inlineChatServiceImpl_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('InteractiveChatController', function () {
        class TestController extends inlineChatController_1.$Qqb {
            constructor() {
                super(...arguments);
                this.P = new event_1.$fd();
                this.onDidChangeState = this.P.event;
                this.states = [];
            }
            static { this.INIT_SEQUENCE = ["CREATE_SESSION" /* State.CREATE_SESSION */, "INIT_UI" /* State.INIT_UI */, "WAIT_FOR_INPUT" /* State.WAIT_FOR_INPUT */]; }
            static { this.INIT_SEQUENCE_AUTO_SEND = [...this.INIT_SEQUENCE, "MAKE_REQUEST" /* State.MAKE_REQUEST */, "APPLY_RESPONSE" /* State.APPLY_RESPONSE */, "SHOW_RESPONSE" /* State.SHOW_RESPONSE */, "WAIT_FOR_INPUT" /* State.WAIT_FOR_INPUT */]; }
            waitFor(states) {
                const actual = [];
                return new Promise((resolve, reject) => {
                    const d = this.onDidChangeState(state => {
                        actual.push(state);
                        if ((0, arrays_1.$sb)(states, actual)) {
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
            async L(state, options) {
                let nextState = state;
                while (nextState) {
                    this.P.fire(nextState);
                    this.states.push(nextState);
                    nextState = await this[nextState](options);
                }
            }
            dispose() {
                super.dispose();
                this.P.dispose();
            }
        }
        const store = new lifecycle_1.$jc();
        let editor;
        let model;
        let ctrl;
        // let contextKeys: MockContextKeyService;
        let inlineChatService;
        let inlineChatSessionService;
        let instaService;
        setup(function () {
            const contextKeyService = new mockKeybindingService_1.$S0b();
            inlineChatService = new inlineChatServiceImpl_1.$GJb(contextKeyService);
            const serviceCollection = new serviceCollection_1.$zh([contextkey_1.$3i, contextKeyService], [inlineChat_1.$dz, inlineChatService], [diffProviderFactoryService_1.$6Y, new descriptors_1.$yh(testDiffProviderFactoryService_1.$w0b)], [inlineChatSession_1.$bqb, new descriptors_1.$yh(inlineChatSession_1.$cqb)], [progress_1.$7u, new class extends (0, mock_1.$rT)() {
                    show(total, delay) {
                        return {
                            total() { },
                            worked(value) { },
                            done() { },
                        };
                    }
                }], [chat_1.$Pqb, new class extends (0, mock_1.$rT)() {
                    acceptResponse(response) { }
                    acceptRequest() { }
                }], [accessibleView_1.$wqb, new class extends (0, mock_1.$rT)() {
                    getOpenAriaHint(verbositySettingKey) {
                        return null;
                    }
                }]);
            instaService = store.add((0, workbenchTestServices_1.$lec)(undefined, store).createChild(serviceCollection));
            inlineChatSessionService = store.add(instaService.get(inlineChatSession_1.$bqb));
            model = store.add(instaService.get(model_1.$yA).createModel('Hello\nWorld\nHello Again\nHello World\n', null));
            editor = store.add((0, testCodeEditor_1.$20b)(instaService, model));
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
                                range: new range_1.$ks(1, 1, 1, 1),
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
        (0, utils_1.$bT)();
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
            editor.setSelection(new range_1.$ks(1, 1, 1, 3));
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
            assert.deepStrictEqual(session.wholeRange.value, new range_1.$ks(1, 1, 1, 6));
            ctrl.cancelSession();
            d.dispose();
        });
        test('wholeRange expands to whole lines, session provided', async function () {
            editor.setSelection(new range_1.$ks(1, 1, 1, 1));
            ctrl = instaService.createInstance(TestController, editor);
            const d = inlineChatService.addProvider({
                debugName: 'Unit Test',
                label: 'Unit Test',
                prepareInlineChatSession() {
                    return {
                        id: Math.random(),
                        wholeRange: new range_1.$ks(1, 1, 1, 3)
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
            assert.deepStrictEqual(session.wholeRange.value, new range_1.$ks(1, 1, 1, 6));
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
            assert.deepStrictEqual(session.wholeRange.value, new range_1.$ks(1, 1, 1, 11));
            editor.setSelection(new range_1.$ks(2, 1, 2, 1));
            editor.trigger('test', 'type', { text: 'a' });
            await ctrl.waitFor(["DONE" /* State.ACCEPT */]);
            await r;
        });
        test('\'whole range\' isn\'t updated for edits outside whole range #4346', async function () {
            editor.setSelection(new range_1.$ks(3, 1, 3, 1));
            const d = inlineChatService.addProvider({
                debugName: 'Unit Test',
                label: 'Unit Test',
                prepareInlineChatSession() {
                    return {
                        id: Math.random(),
                        wholeRange: new range_1.$ks(3, 1, 3, 3)
                    };
                },
                provideResponse(session, request) {
                    return {
                        type: "editorEdit" /* InlineChatResponseType.EditorEdit */,
                        id: Math.random(),
                        edits: [{
                                range: new range_1.$ks(1, 1, 1, 1),
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
            assert.deepStrictEqual(session.wholeRange.value, new range_1.$ks(3, 1, 3, 12));
            ctrl.acceptInput();
            await ctrl.waitFor(["MAKE_REQUEST" /* State.MAKE_REQUEST */, "APPLY_RESPONSE" /* State.APPLY_RESPONSE */, "SHOW_RESPONSE" /* State.SHOW_RESPONSE */, "WAIT_FOR_INPUT" /* State.WAIT_FOR_INPUT */]);
            assert.deepStrictEqual(session.wholeRange.value, new range_1.$ks(1, 1, 4, 12));
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
                        wholeRange: new range_1.$ks(3, 1, 3, 3)
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
//# sourceMappingURL=inlineChatController.test.js.map