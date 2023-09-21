/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/common/types", "vs/base/common/uri", "vs/base/test/common/timeTravelScheduler", "vs/editor/common/languageFeatureRegistry", "vs/editor/contrib/codeAction/browser/codeActionModel", "vs/editor/test/browser/testCodeEditor", "vs/editor/test/common/testTextModel", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/markers/common/markerService"], function (require, exports, assert, lifecycle_1, types_1, uri_1, timeTravelScheduler_1, languageFeatureRegistry_1, codeActionModel_1, testCodeEditor_1, testTextModel_1, mockKeybindingService_1, markerService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const testProvider = {
        provideCodeActions() {
            return {
                actions: [
                    { title: 'test', command: { id: 'test-command', title: 'test', arguments: [] } }
                ],
                dispose() { }
            };
        }
    };
    suite('CodeActionModel', () => {
        const languageId = 'foo-lang';
        const uri = uri_1.URI.parse('untitled:path');
        let model;
        let markerService;
        let editor;
        let registry;
        const disposables = new lifecycle_1.$jc();
        setup(() => {
            disposables.clear();
            markerService = new markerService_1.$MBb();
            model = (0, testTextModel_1.$O0b)('foobar  foo bar\nfarboo far boo', languageId, undefined, uri);
            editor = (0, testCodeEditor_1.$10b)(model);
            editor.setPosition({ lineNumber: 1, column: 1 });
            registry = new languageFeatureRegistry_1.$dF();
        });
        teardown(() => {
            disposables.clear();
            editor.dispose();
            model.dispose();
            markerService.dispose();
        });
        test('Oracle -> marker added', async () => {
            let done;
            const donePromise = new Promise(resolve => {
                done = resolve;
            });
            await (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, () => {
                const reg = registry.register(languageId, testProvider);
                disposables.add(reg);
                const contextKeys = new mockKeybindingService_1.$S0b();
                const model = disposables.add(new codeActionModel_1.$P2(editor, registry, markerService, contextKeys, undefined));
                disposables.add(model.onDidChangeState((e) => {
                    (0, types_1.$tf)(e.type === 1 /* CodeActionsState.Type.Triggered */);
                    assert.strictEqual(e.trigger.type, 2 /* languages.CodeActionTriggerType.Auto */);
                    assert.ok(e.actions);
                    e.actions.then(fixes => {
                        model.dispose();
                        assert.strictEqual(fixes.validActions.length, 1);
                        done();
                    }, done);
                }));
                // start here
                markerService.changeOne('fake', uri, [{
                        startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 6,
                        message: 'error',
                        severity: 1,
                        code: '',
                        source: ''
                    }]);
                return donePromise;
            });
        });
        test('Oracle -> position changed', async () => {
            await (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, () => {
                const reg = registry.register(languageId, testProvider);
                disposables.add(reg);
                markerService.changeOne('fake', uri, [{
                        startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 6,
                        message: 'error',
                        severity: 1,
                        code: '',
                        source: ''
                    }]);
                editor.setPosition({ lineNumber: 2, column: 1 });
                return new Promise((resolve, reject) => {
                    const contextKeys = new mockKeybindingService_1.$S0b();
                    const model = disposables.add(new codeActionModel_1.$P2(editor, registry, markerService, contextKeys, undefined));
                    disposables.add(model.onDidChangeState((e) => {
                        (0, types_1.$tf)(e.type === 1 /* CodeActionsState.Type.Triggered */);
                        assert.strictEqual(e.trigger.type, 2 /* languages.CodeActionTriggerType.Auto */);
                        assert.ok(e.actions);
                        e.actions.then(fixes => {
                            model.dispose();
                            assert.strictEqual(fixes.validActions.length, 1);
                            resolve(undefined);
                        }, reject);
                    }));
                    // start here
                    editor.setPosition({ lineNumber: 1, column: 1 });
                });
            });
        });
        test('Oracle -> should only auto trigger once for cursor and marker update right after each other', async () => {
            let done;
            const donePromise = new Promise(resolve => { done = resolve; });
            await (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, () => {
                const reg = registry.register(languageId, testProvider);
                disposables.add(reg);
                let triggerCount = 0;
                const contextKeys = new mockKeybindingService_1.$S0b();
                const model = disposables.add(new codeActionModel_1.$P2(editor, registry, markerService, contextKeys, undefined));
                disposables.add(model.onDidChangeState((e) => {
                    (0, types_1.$tf)(e.type === 1 /* CodeActionsState.Type.Triggered */);
                    assert.strictEqual(e.trigger.type, 2 /* languages.CodeActionTriggerType.Auto */);
                    ++triggerCount;
                    // give time for second trigger before completing test
                    setTimeout(() => {
                        model.dispose();
                        assert.strictEqual(triggerCount, 1);
                        done();
                    }, 0);
                }, 5 /*delay*/));
                markerService.changeOne('fake', uri, [{
                        startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 6,
                        message: 'error',
                        severity: 1,
                        code: '',
                        source: ''
                    }]);
                editor.setSelection({ startLineNumber: 1, startColumn: 1, endLineNumber: 4, endColumn: 1 });
                return donePromise;
            });
        });
    });
});
//# sourceMappingURL=codeActionModel.test.js.map