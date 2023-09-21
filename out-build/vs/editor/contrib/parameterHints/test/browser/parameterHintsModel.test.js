/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/base/test/common/timeTravelScheduler", "vs/base/test/common/utils", "vs/editor/common/languageFeatureRegistry", "vs/editor/common/languages", "vs/editor/contrib/parameterHints/browser/parameterHintsModel", "vs/editor/test/browser/testCodeEditor", "vs/editor/test/common/testTextModel", "vs/platform/instantiation/common/serviceCollection", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils"], function (require, exports, assert, lifecycle_1, uri_1, timeTravelScheduler_1, utils_1, languageFeatureRegistry_1, languages, parameterHintsModel_1, testCodeEditor_1, testTextModel_1, serviceCollection_1, storage_1, telemetry_1, telemetryUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const mockFile = uri_1.URI.parse('test:somefile.ttt');
    const mockFileSelector = { scheme: 'test' };
    const emptySigHelp = {
        signatures: [{
                label: 'none',
                parameters: []
            }],
        activeParameter: 0,
        activeSignature: 0
    };
    const emptySigHelpResult = {
        value: emptySigHelp,
        dispose: () => { }
    };
    suite('ParameterHintsModel', () => {
        const disposables = new lifecycle_1.$jc();
        let registry;
        setup(() => {
            disposables.clear();
            registry = new languageFeatureRegistry_1.$dF();
        });
        teardown(() => {
            disposables.clear();
        });
        (0, utils_1.$bT)();
        function createMockEditor(fileContents) {
            const textModel = disposables.add((0, testTextModel_1.$O0b)(fileContents, undefined, undefined, mockFile));
            const editor = disposables.add((0, testCodeEditor_1.$10b)(textModel, {
                serviceCollection: new serviceCollection_1.$zh([telemetry_1.$9k, telemetryUtils_1.$bo], [storage_1.$Vo, disposables.add(new storage_1.$Zo())])
            }));
            return editor;
        }
        function getNextHint(model) {
            return new Promise(resolve => {
                const sub = disposables.add(model.onChangedHints(e => {
                    sub.dispose();
                    return resolve(e ? { value: e, dispose: () => { } } : undefined);
                }));
            });
        }
        test('Provider should get trigger character on type', async () => {
            let done;
            const donePromise = new Promise(resolve => { done = resolve; });
            const triggerChar = '(';
            const editor = createMockEditor('');
            disposables.add(new parameterHintsModel_1.$l0(editor, registry));
            disposables.add(registry.register(mockFileSelector, new class {
                constructor() {
                    this.signatureHelpTriggerCharacters = [triggerChar];
                    this.signatureHelpRetriggerCharacters = [];
                }
                provideSignatureHelp(_model, _position, _token, context) {
                    assert.strictEqual(context.triggerKind, languages.SignatureHelpTriggerKind.TriggerCharacter);
                    assert.strictEqual(context.triggerCharacter, triggerChar);
                    done();
                    return undefined;
                }
            }));
            await (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
                editor.trigger('keyboard', "type" /* Handler.Type */, { text: triggerChar });
                await donePromise;
            });
        });
        test('Provider should be retriggered if already active', async () => {
            let done;
            const donePromise = new Promise(resolve => { done = resolve; });
            const triggerChar = '(';
            const editor = createMockEditor('');
            disposables.add(new parameterHintsModel_1.$l0(editor, registry));
            let invokeCount = 0;
            disposables.add(registry.register(mockFileSelector, new class {
                constructor() {
                    this.signatureHelpTriggerCharacters = [triggerChar];
                    this.signatureHelpRetriggerCharacters = [];
                }
                provideSignatureHelp(_model, _position, _token, context) {
                    ++invokeCount;
                    try {
                        if (invokeCount === 1) {
                            assert.strictEqual(context.triggerKind, languages.SignatureHelpTriggerKind.TriggerCharacter);
                            assert.strictEqual(context.triggerCharacter, triggerChar);
                            assert.strictEqual(context.isRetrigger, false);
                            assert.strictEqual(context.activeSignatureHelp, undefined);
                            // Retrigger
                            setTimeout(() => editor.trigger('keyboard', "type" /* Handler.Type */, { text: triggerChar }), 0);
                        }
                        else {
                            assert.strictEqual(invokeCount, 2);
                            assert.strictEqual(context.triggerKind, languages.SignatureHelpTriggerKind.TriggerCharacter);
                            assert.strictEqual(context.isRetrigger, true);
                            assert.strictEqual(context.triggerCharacter, triggerChar);
                            assert.strictEqual(context.activeSignatureHelp, emptySigHelp);
                            done();
                        }
                        return emptySigHelpResult;
                    }
                    catch (err) {
                        console.error(err);
                        throw err;
                    }
                }
            }));
            await (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
                editor.trigger('keyboard', "type" /* Handler.Type */, { text: triggerChar });
                await donePromise;
            });
        });
        test('Provider should not be retriggered if previous help is canceled first', async () => {
            let done;
            const donePromise = new Promise(resolve => { done = resolve; });
            const triggerChar = '(';
            const editor = createMockEditor('');
            const hintModel = disposables.add(new parameterHintsModel_1.$l0(editor, registry));
            let invokeCount = 0;
            disposables.add(registry.register(mockFileSelector, new class {
                constructor() {
                    this.signatureHelpTriggerCharacters = [triggerChar];
                    this.signatureHelpRetriggerCharacters = [];
                }
                provideSignatureHelp(_model, _position, _token, context) {
                    try {
                        ++invokeCount;
                        if (invokeCount === 1) {
                            assert.strictEqual(context.triggerKind, languages.SignatureHelpTriggerKind.TriggerCharacter);
                            assert.strictEqual(context.triggerCharacter, triggerChar);
                            assert.strictEqual(context.isRetrigger, false);
                            assert.strictEqual(context.activeSignatureHelp, undefined);
                            // Cancel and retrigger
                            hintModel.cancel();
                            editor.trigger('keyboard', "type" /* Handler.Type */, { text: triggerChar });
                        }
                        else {
                            assert.strictEqual(invokeCount, 2);
                            assert.strictEqual(context.triggerKind, languages.SignatureHelpTriggerKind.TriggerCharacter);
                            assert.strictEqual(context.triggerCharacter, triggerChar);
                            assert.strictEqual(context.isRetrigger, true);
                            assert.strictEqual(context.activeSignatureHelp, undefined);
                            done();
                        }
                        return emptySigHelpResult;
                    }
                    catch (err) {
                        console.error(err);
                        throw err;
                    }
                }
            }));
            await (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, () => {
                editor.trigger('keyboard', "type" /* Handler.Type */, { text: triggerChar });
                return donePromise;
            });
        });
        test('Provider should get last trigger character when triggered multiple times and only be invoked once', async () => {
            let done;
            const donePromise = new Promise(resolve => { done = resolve; });
            const editor = createMockEditor('');
            disposables.add(new parameterHintsModel_1.$l0(editor, registry, 5));
            let invokeCount = 0;
            disposables.add(registry.register(mockFileSelector, new class {
                constructor() {
                    this.signatureHelpTriggerCharacters = ['a', 'b', 'c'];
                    this.signatureHelpRetriggerCharacters = [];
                }
                provideSignatureHelp(_model, _position, _token, context) {
                    try {
                        ++invokeCount;
                        assert.strictEqual(context.triggerKind, languages.SignatureHelpTriggerKind.TriggerCharacter);
                        assert.strictEqual(context.isRetrigger, false);
                        assert.strictEqual(context.triggerCharacter, 'c');
                        // Give some time to allow for later triggers
                        setTimeout(() => {
                            assert.strictEqual(invokeCount, 1);
                            done();
                        }, 50);
                        return undefined;
                    }
                    catch (err) {
                        console.error(err);
                        throw err;
                    }
                }
            }));
            await (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
                editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'a' });
                editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'b' });
                editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'c' });
                await donePromise;
            });
        });
        test('Provider should be retriggered if already active', async () => {
            let done;
            const donePromise = new Promise(resolve => { done = resolve; });
            const editor = createMockEditor('');
            disposables.add(new parameterHintsModel_1.$l0(editor, registry, 5));
            let invokeCount = 0;
            disposables.add(registry.register(mockFileSelector, new class {
                constructor() {
                    this.signatureHelpTriggerCharacters = ['a', 'b'];
                    this.signatureHelpRetriggerCharacters = [];
                }
                provideSignatureHelp(_model, _position, _token, context) {
                    try {
                        ++invokeCount;
                        if (invokeCount === 1) {
                            assert.strictEqual(context.triggerKind, languages.SignatureHelpTriggerKind.TriggerCharacter);
                            assert.strictEqual(context.triggerCharacter, 'a');
                            // retrigger after delay for widget to show up
                            setTimeout(() => editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'b' }), 50);
                        }
                        else if (invokeCount === 2) {
                            assert.strictEqual(context.triggerKind, languages.SignatureHelpTriggerKind.TriggerCharacter);
                            assert.ok(context.isRetrigger);
                            assert.strictEqual(context.triggerCharacter, 'b');
                            done();
                        }
                        else {
                            assert.fail('Unexpected invoke');
                        }
                        return emptySigHelpResult;
                    }
                    catch (err) {
                        console.error(err);
                        throw err;
                    }
                }
            }));
            await (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, () => {
                editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'a' });
                return donePromise;
            });
        });
        test('Should cancel existing request when new request comes in', async () => {
            const editor = createMockEditor('abc def');
            const hintsModel = disposables.add(new parameterHintsModel_1.$l0(editor, registry));
            let didRequestCancellationOf = -1;
            let invokeCount = 0;
            const longRunningProvider = new class {
                constructor() {
                    this.signatureHelpTriggerCharacters = [];
                    this.signatureHelpRetriggerCharacters = [];
                }
                provideSignatureHelp(_model, _position, token) {
                    try {
                        const count = invokeCount++;
                        disposables.add(token.onCancellationRequested(() => { didRequestCancellationOf = count; }));
                        // retrigger on first request
                        if (count === 0) {
                            hintsModel.trigger({ triggerKind: languages.SignatureHelpTriggerKind.Invoke }, 0);
                        }
                        return new Promise(resolve => {
                            setTimeout(() => {
                                resolve({
                                    value: {
                                        signatures: [{
                                                label: '' + count,
                                                parameters: []
                                            }],
                                        activeParameter: 0,
                                        activeSignature: 0
                                    },
                                    dispose: () => { }
                                });
                            }, 100);
                        });
                    }
                    catch (err) {
                        console.error(err);
                        throw err;
                    }
                }
            };
            disposables.add(registry.register(mockFileSelector, longRunningProvider));
            await (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
                hintsModel.trigger({ triggerKind: languages.SignatureHelpTriggerKind.Invoke }, 0);
                assert.strictEqual(-1, didRequestCancellationOf);
                return new Promise((resolve, reject) => disposables.add(hintsModel.onChangedHints(newParamterHints => {
                    try {
                        assert.strictEqual(0, didRequestCancellationOf);
                        assert.strictEqual('1', newParamterHints.signatures[0].label);
                        resolve();
                    }
                    catch (e) {
                        reject(e);
                    }
                })));
            });
        });
        test('Provider should be retriggered by retrigger character', async () => {
            let done;
            const donePromise = new Promise(resolve => { done = resolve; });
            const triggerChar = 'a';
            const retriggerChar = 'b';
            const editor = createMockEditor('');
            disposables.add(new parameterHintsModel_1.$l0(editor, registry, 5));
            let invokeCount = 0;
            disposables.add(registry.register(mockFileSelector, new class {
                constructor() {
                    this.signatureHelpTriggerCharacters = [triggerChar];
                    this.signatureHelpRetriggerCharacters = [retriggerChar];
                }
                provideSignatureHelp(_model, _position, _token, context) {
                    try {
                        ++invokeCount;
                        if (invokeCount === 1) {
                            assert.strictEqual(context.triggerKind, languages.SignatureHelpTriggerKind.TriggerCharacter);
                            assert.strictEqual(context.triggerCharacter, triggerChar);
                            // retrigger after delay for widget to show up
                            setTimeout(() => editor.trigger('keyboard', "type" /* Handler.Type */, { text: retriggerChar }), 50);
                        }
                        else if (invokeCount === 2) {
                            assert.strictEqual(context.triggerKind, languages.SignatureHelpTriggerKind.TriggerCharacter);
                            assert.ok(context.isRetrigger);
                            assert.strictEqual(context.triggerCharacter, retriggerChar);
                            done();
                        }
                        else {
                            assert.fail('Unexpected invoke');
                        }
                        return emptySigHelpResult;
                    }
                    catch (err) {
                        console.error(err);
                        throw err;
                    }
                }
            }));
            await (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
                // This should not trigger anything
                editor.trigger('keyboard', "type" /* Handler.Type */, { text: retriggerChar });
                // But a trigger character should
                editor.trigger('keyboard', "type" /* Handler.Type */, { text: triggerChar });
                return donePromise;
            });
        });
        test('should use first result from multiple providers', async () => {
            const triggerChar = 'a';
            const firstProviderId = 'firstProvider';
            const secondProviderId = 'secondProvider';
            const paramterLabel = 'parameter';
            const editor = createMockEditor('');
            const model = disposables.add(new parameterHintsModel_1.$l0(editor, registry, 5));
            disposables.add(registry.register(mockFileSelector, new class {
                constructor() {
                    this.signatureHelpTriggerCharacters = [triggerChar];
                    this.signatureHelpRetriggerCharacters = [];
                }
                async provideSignatureHelp(_model, _position, _token, context) {
                    try {
                        if (!context.isRetrigger) {
                            // retrigger after delay for widget to show up
                            setTimeout(() => editor.trigger('keyboard', "type" /* Handler.Type */, { text: triggerChar }), 50);
                            return {
                                value: {
                                    activeParameter: 0,
                                    activeSignature: 0,
                                    signatures: [{
                                            label: firstProviderId,
                                            parameters: [
                                                { label: paramterLabel }
                                            ]
                                        }]
                                },
                                dispose: () => { }
                            };
                        }
                        return undefined;
                    }
                    catch (err) {
                        console.error(err);
                        throw err;
                    }
                }
            }));
            disposables.add(registry.register(mockFileSelector, new class {
                constructor() {
                    this.signatureHelpTriggerCharacters = [triggerChar];
                    this.signatureHelpRetriggerCharacters = [];
                }
                async provideSignatureHelp(_model, _position, _token, context) {
                    if (context.isRetrigger) {
                        return {
                            value: {
                                activeParameter: 0,
                                activeSignature: context.activeSignatureHelp ? context.activeSignatureHelp.activeSignature + 1 : 0,
                                signatures: [{
                                        label: secondProviderId,
                                        parameters: context.activeSignatureHelp ? context.activeSignatureHelp.signatures[0].parameters : []
                                    }]
                            },
                            dispose: () => { }
                        };
                    }
                    return undefined;
                }
            }));
            await (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
                editor.trigger('keyboard', "type" /* Handler.Type */, { text: triggerChar });
                const firstHint = (await getNextHint(model)).value;
                assert.strictEqual(firstHint.signatures[0].label, firstProviderId);
                assert.strictEqual(firstHint.activeSignature, 0);
                assert.strictEqual(firstHint.signatures[0].parameters[0].label, paramterLabel);
                const secondHint = (await getNextHint(model)).value;
                assert.strictEqual(secondHint.signatures[0].label, secondProviderId);
                assert.strictEqual(secondHint.activeSignature, 1);
                assert.strictEqual(secondHint.signatures[0].parameters[0].label, paramterLabel);
            });
        });
        test('Quick typing should use the first trigger character', async () => {
            const editor = createMockEditor('');
            const model = disposables.add(new parameterHintsModel_1.$l0(editor, registry, 50));
            const triggerCharacter = 'a';
            let invokeCount = 0;
            disposables.add(registry.register(mockFileSelector, new class {
                constructor() {
                    this.signatureHelpTriggerCharacters = [triggerCharacter];
                    this.signatureHelpRetriggerCharacters = [];
                }
                provideSignatureHelp(_model, _position, _token, context) {
                    try {
                        ++invokeCount;
                        if (invokeCount === 1) {
                            assert.strictEqual(context.triggerKind, languages.SignatureHelpTriggerKind.TriggerCharacter);
                            assert.strictEqual(context.triggerCharacter, triggerCharacter);
                        }
                        else {
                            assert.fail('Unexpected invoke');
                        }
                        return emptySigHelpResult;
                    }
                    catch (err) {
                        console.error(err);
                        throw err;
                    }
                }
            }));
            await (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
                editor.trigger('keyboard', "type" /* Handler.Type */, { text: triggerCharacter });
                editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'x' });
                await getNextHint(model);
            });
        });
        test('Retrigger while a pending resolve is still going on should preserve last active signature #96702', async () => {
            let done;
            const donePromise = new Promise(resolve => { done = resolve; });
            const editor = createMockEditor('');
            const model = disposables.add(new parameterHintsModel_1.$l0(editor, registry, 50));
            const triggerCharacter = 'a';
            const retriggerCharacter = 'b';
            let invokeCount = 0;
            disposables.add(registry.register(mockFileSelector, new class {
                constructor() {
                    this.signatureHelpTriggerCharacters = [triggerCharacter];
                    this.signatureHelpRetriggerCharacters = [retriggerCharacter];
                }
                async provideSignatureHelp(_model, _position, _token, context) {
                    try {
                        ++invokeCount;
                        if (invokeCount === 1) {
                            assert.strictEqual(context.triggerKind, languages.SignatureHelpTriggerKind.TriggerCharacter);
                            assert.strictEqual(context.triggerCharacter, triggerCharacter);
                            setTimeout(() => editor.trigger('keyboard', "type" /* Handler.Type */, { text: retriggerCharacter }), 50);
                        }
                        else if (invokeCount === 2) {
                            // Trigger again while we wait for resolve to take place
                            setTimeout(() => editor.trigger('keyboard', "type" /* Handler.Type */, { text: retriggerCharacter }), 50);
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                        else if (invokeCount === 3) {
                            // Make sure that in a retrigger during a pending resolve, we still have the old active signature.
                            assert.strictEqual(context.activeSignatureHelp, emptySigHelp);
                            done();
                        }
                        else {
                            assert.fail('Unexpected invoke');
                        }
                        return emptySigHelpResult;
                    }
                    catch (err) {
                        console.error(err);
                        done(err);
                        throw err;
                    }
                }
            }));
            await (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
                editor.trigger('keyboard', "type" /* Handler.Type */, { text: triggerCharacter });
                await getNextHint(model);
                await getNextHint(model);
                await donePromise;
            });
        });
    });
});
//# sourceMappingURL=parameterHintsModel.test.js.map