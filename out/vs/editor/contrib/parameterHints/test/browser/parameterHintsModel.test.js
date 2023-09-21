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
        const disposables = new lifecycle_1.DisposableStore();
        let registry;
        setup(() => {
            disposables.clear();
            registry = new languageFeatureRegistry_1.LanguageFeatureRegistry();
        });
        teardown(() => {
            disposables.clear();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        function createMockEditor(fileContents) {
            const textModel = disposables.add((0, testTextModel_1.createTextModel)(fileContents, undefined, undefined, mockFile));
            const editor = disposables.add((0, testCodeEditor_1.createTestCodeEditor)(textModel, {
                serviceCollection: new serviceCollection_1.ServiceCollection([telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService], [storage_1.IStorageService, disposables.add(new storage_1.InMemoryStorageService())])
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
            disposables.add(new parameterHintsModel_1.ParameterHintsModel(editor, registry));
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
            await (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
                editor.trigger('keyboard', "type" /* Handler.Type */, { text: triggerChar });
                await donePromise;
            });
        });
        test('Provider should be retriggered if already active', async () => {
            let done;
            const donePromise = new Promise(resolve => { done = resolve; });
            const triggerChar = '(';
            const editor = createMockEditor('');
            disposables.add(new parameterHintsModel_1.ParameterHintsModel(editor, registry));
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
            await (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
                editor.trigger('keyboard', "type" /* Handler.Type */, { text: triggerChar });
                await donePromise;
            });
        });
        test('Provider should not be retriggered if previous help is canceled first', async () => {
            let done;
            const donePromise = new Promise(resolve => { done = resolve; });
            const triggerChar = '(';
            const editor = createMockEditor('');
            const hintModel = disposables.add(new parameterHintsModel_1.ParameterHintsModel(editor, registry));
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
            await (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, () => {
                editor.trigger('keyboard', "type" /* Handler.Type */, { text: triggerChar });
                return donePromise;
            });
        });
        test('Provider should get last trigger character when triggered multiple times and only be invoked once', async () => {
            let done;
            const donePromise = new Promise(resolve => { done = resolve; });
            const editor = createMockEditor('');
            disposables.add(new parameterHintsModel_1.ParameterHintsModel(editor, registry, 5));
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
            await (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
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
            disposables.add(new parameterHintsModel_1.ParameterHintsModel(editor, registry, 5));
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
            await (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, () => {
                editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'a' });
                return donePromise;
            });
        });
        test('Should cancel existing request when new request comes in', async () => {
            const editor = createMockEditor('abc def');
            const hintsModel = disposables.add(new parameterHintsModel_1.ParameterHintsModel(editor, registry));
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
            await (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
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
            disposables.add(new parameterHintsModel_1.ParameterHintsModel(editor, registry, 5));
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
            await (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
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
            const model = disposables.add(new parameterHintsModel_1.ParameterHintsModel(editor, registry, 5));
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
            await (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
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
            const model = disposables.add(new parameterHintsModel_1.ParameterHintsModel(editor, registry, 50));
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
            await (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
                editor.trigger('keyboard', "type" /* Handler.Type */, { text: triggerCharacter });
                editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'x' });
                await getNextHint(model);
            });
        });
        test('Retrigger while a pending resolve is still going on should preserve last active signature #96702', async () => {
            let done;
            const donePromise = new Promise(resolve => { done = resolve; });
            const editor = createMockEditor('');
            const model = disposables.add(new parameterHintsModel_1.ParameterHintsModel(editor, registry, 50));
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
            await (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
                editor.trigger('keyboard', "type" /* Handler.Type */, { text: triggerCharacter });
                await getNextHint(model);
                await getNextHint(model);
                await donePromise;
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyYW1ldGVySGludHNNb2RlbC50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvcGFyYW1ldGVySGludHMvdGVzdC9icm93c2VyL3BhcmFtZXRlckhpbnRzTW9kZWwudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQXFCaEcsTUFBTSxRQUFRLEdBQUcsU0FBRyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0lBQ2hELE1BQU0sZ0JBQWdCLEdBQUcsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLENBQUM7SUFHNUMsTUFBTSxZQUFZLEdBQTRCO1FBQzdDLFVBQVUsRUFBRSxDQUFDO2dCQUNaLEtBQUssRUFBRSxNQUFNO2dCQUNiLFVBQVUsRUFBRSxFQUFFO2FBQ2QsQ0FBQztRQUNGLGVBQWUsRUFBRSxDQUFDO1FBQ2xCLGVBQWUsRUFBRSxDQUFDO0tBQ2xCLENBQUM7SUFFRixNQUFNLGtCQUFrQixHQUFrQztRQUN6RCxLQUFLLEVBQUUsWUFBWTtRQUNuQixPQUFPLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztLQUNsQixDQUFDO0lBRUYsS0FBSyxDQUFDLHFCQUFxQixFQUFFLEdBQUcsRUFBRTtRQUNqQyxNQUFNLFdBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztRQUMxQyxJQUFJLFFBQWtFLENBQUM7UUFFdkUsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNWLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNwQixRQUFRLEdBQUcsSUFBSSxpREFBdUIsRUFBbUMsQ0FBQztRQUMzRSxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxHQUFHLEVBQUU7WUFDYixXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDckIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFMUMs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