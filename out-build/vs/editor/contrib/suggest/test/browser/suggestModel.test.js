var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/base/test/common/mock", "vs/editor/browser/coreCommands", "vs/editor/common/core/editOperation", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/languages", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/languages/nullTokenize", "vs/editor/common/languages/language", "vs/editor/contrib/snippet/browser/snippetController2", "vs/editor/contrib/suggest/browser/suggestController", "vs/editor/contrib/suggest/browser/suggestMemory", "vs/editor/contrib/suggest/browser/suggestModel", "vs/editor/test/browser/testCodeEditor", "vs/editor/test/common/testTextModel", "vs/platform/instantiation/common/serviceCollection", "vs/platform/keybinding/common/keybinding", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/label/common/label", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/workspace/common/workspace", "vs/editor/common/services/languageFeaturesService", "vs/editor/common/services/languageFeatures", "vs/platform/instantiation/common/instantiation", "vs/editor/contrib/suggest/browser/suggest", "vs/platform/environment/common/environment", "vs/base/test/common/utils"], function (require, exports, assert, lifecycle_1, uri_1, mock_1, coreCommands_1, editOperation_1, range_1, selection_1, languages_1, languageConfigurationRegistry_1, nullTokenize_1, language_1, snippetController2_1, suggestController_1, suggestMemory_1, suggestModel_1, testCodeEditor_1, testTextModel_1, serviceCollection_1, keybinding_1, mockKeybindingService_1, label_1, storage_1, telemetry_1, telemetryUtils_1, workspace_1, languageFeaturesService_1, languageFeatures_1, instantiation_1, suggest_1, environment_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function createMockEditor(model, languageFeaturesService) {
        const storeService = new storage_1.$Zo();
        const editor = (0, testCodeEditor_1.$10b)(model, {
            serviceCollection: new serviceCollection_1.$zh([languageFeatures_1.$hF, languageFeaturesService], [telemetry_1.$9k, telemetryUtils_1.$bo], [storage_1.$Vo, storeService], [keybinding_1.$2D, new mockKeybindingService_1.$U0b()], [suggestMemory_1.$r6, new class {
                    memorize() {
                    }
                    select() {
                        return -1;
                    }
                }], [label_1.$Vz, new class extends (0, mock_1.$rT)() {
                }], [workspace_1.$Kh, new class extends (0, mock_1.$rT)() {
                }], [environment_1.$Ih, new class extends (0, mock_1.$rT)() {
                    constructor() {
                        super(...arguments);
                        this.isBuilt = true;
                        this.isExtensionDevelopment = false;
                    }
                }]),
        });
        const ctrl = editor.registerAndInstantiateContribution(snippetController2_1.$05.ID, snippetController2_1.$05);
        editor.hasWidgetFocus = () => true;
        editor.registerDisposable(ctrl);
        editor.registerDisposable(storeService);
        return editor;
    }
    suite('SuggestModel - Context', function () {
        const OUTER_LANGUAGE_ID = 'outerMode';
        const INNER_LANGUAGE_ID = 'innerMode';
        let OuterMode = class OuterMode extends lifecycle_1.$kc {
            constructor(languageService, languageConfigurationService) {
                super();
                this.languageId = OUTER_LANGUAGE_ID;
                this.B(languageService.registerLanguage({ id: this.languageId }));
                this.B(languageConfigurationService.register(this.languageId, {}));
                this.B(languages_1.$bt.register(this.languageId, {
                    getInitialState: () => nullTokenize_1.$uC,
                    tokenize: undefined,
                    tokenizeEncoded: (line, hasEOL, state) => {
                        const tokensArr = [];
                        let prevLanguageId = undefined;
                        for (let i = 0; i < line.length; i++) {
                            const languageId = (line.charAt(i) === 'x' ? INNER_LANGUAGE_ID : OUTER_LANGUAGE_ID);
                            const encodedLanguageId = languageService.languageIdCodec.encodeLanguageId(languageId);
                            if (prevLanguageId !== languageId) {
                                tokensArr.push(i);
                                tokensArr.push((encodedLanguageId << 0 /* MetadataConsts.LANGUAGEID_OFFSET */));
                            }
                            prevLanguageId = languageId;
                        }
                        const tokens = new Uint32Array(tokensArr.length);
                        for (let i = 0; i < tokens.length; i++) {
                            tokens[i] = tokensArr[i];
                        }
                        return new languages_1.$6s(tokens, state);
                    }
                }));
            }
        };
        OuterMode = __decorate([
            __param(0, language_1.$ct),
            __param(1, languageConfigurationRegistry_1.$2t)
        ], OuterMode);
        let InnerMode = class InnerMode extends lifecycle_1.$kc {
            constructor(languageService, languageConfigurationService) {
                super();
                this.languageId = INNER_LANGUAGE_ID;
                this.B(languageService.registerLanguage({ id: this.languageId }));
                this.B(languageConfigurationService.register(this.languageId, {}));
            }
        };
        InnerMode = __decorate([
            __param(0, language_1.$ct),
            __param(1, languageConfigurationRegistry_1.$2t)
        ], InnerMode);
        const assertAutoTrigger = (model, offset, expected, message) => {
            const pos = model.getPositionAt(offset);
            const editor = createMockEditor(model, new languageFeaturesService_1.$oBb());
            editor.setPosition(pos);
            assert.strictEqual(suggestModel_1.$$5.shouldAutoTrigger(editor), expected, message);
            editor.dispose();
        };
        let disposables;
        setup(() => {
            disposables = new lifecycle_1.$jc();
        });
        teardown(function () {
            disposables.dispose();
        });
        (0, utils_1.$bT)();
        test('Context - shouldAutoTrigger', function () {
            const model = (0, testTextModel_1.$O0b)('Das Pferd frisst keinen Gurkensalat - Philipp Reis 1861.\nWer hat\'s erfunden?');
            disposables.add(model);
            assertAutoTrigger(model, 3, true, 'end of word, Das|');
            assertAutoTrigger(model, 4, false, 'no word Das |');
            assertAutoTrigger(model, 1, true, 'typing a single character before a word: D|as');
            assertAutoTrigger(model, 55, false, 'number, 1861|');
            model.dispose();
        });
        test('shouldAutoTrigger at embedded language boundaries', () => {
            const disposables = new lifecycle_1.$jc();
            const instantiationService = (0, testTextModel_1.$Q0b)(disposables);
            const outerMode = disposables.add(instantiationService.createInstance(OuterMode));
            disposables.add(instantiationService.createInstance(InnerMode));
            const model = disposables.add((0, testTextModel_1.$P0b)(instantiationService, 'a<xx>a<x>', outerMode.languageId));
            assertAutoTrigger(model, 1, true, 'a|<x — should trigger at end of word');
            assertAutoTrigger(model, 2, false, 'a<|x — should NOT trigger at start of word');
            assertAutoTrigger(model, 3, true, 'a<x|x —  should trigger after typing a single character before a word');
            assertAutoTrigger(model, 4, true, 'a<xx|> — should trigger at boundary between languages');
            assertAutoTrigger(model, 5, false, 'a<xx>|a — should NOT trigger at start of word');
            assertAutoTrigger(model, 6, true, 'a<xx>a|< — should trigger at end of word');
            assertAutoTrigger(model, 8, true, 'a<xx>a<x|> — should trigger at end of word at boundary');
            disposables.dispose();
        });
    });
    suite('SuggestModel - TriggerAndCancelOracle', function () {
        function getDefaultSuggestRange(model, position) {
            const wordUntil = model.getWordUntilPosition(position);
            return new range_1.$ks(position.lineNumber, wordUntil.startColumn, position.lineNumber, wordUntil.endColumn);
        }
        const alwaysEmptySupport = {
            _debugDisplayName: 'test',
            provideCompletionItems(doc, pos) {
                return {
                    incomplete: false,
                    suggestions: []
                };
            }
        };
        const alwaysSomethingSupport = {
            _debugDisplayName: 'test',
            provideCompletionItems(doc, pos) {
                return {
                    incomplete: false,
                    suggestions: [{
                            label: doc.getWordUntilPosition(pos).word,
                            kind: 9 /* CompletionItemKind.Property */,
                            insertText: 'foofoo',
                            range: getDefaultSuggestRange(doc, pos)
                        }]
                };
            }
        };
        let disposables;
        let model;
        const languageFeaturesService = new languageFeaturesService_1.$oBb();
        const registry = languageFeaturesService.completionProvider;
        setup(function () {
            disposables = new lifecycle_1.$jc();
            model = (0, testTextModel_1.$O0b)('abc def', undefined, undefined, uri_1.URI.parse('test:somefile.ttt'));
            disposables.add(model);
        });
        teardown(() => {
            disposables.dispose();
        });
        (0, utils_1.$bT)();
        function withOracle(callback) {
            return new Promise((resolve, reject) => {
                const editor = createMockEditor(model, languageFeaturesService);
                const oracle = editor.invokeWithinContext(accessor => accessor.get(instantiation_1.$Ah).createInstance(suggestModel_1.$_5, editor));
                disposables.add(oracle);
                disposables.add(editor);
                try {
                    resolve(callback(oracle, editor));
                }
                catch (err) {
                    reject(err);
                }
            });
        }
        function assertEvent(event, action, assert) {
            return new Promise((resolve, reject) => {
                const sub = event(e => {
                    sub.dispose();
                    try {
                        resolve(assert(e));
                    }
                    catch (err) {
                        reject(err);
                    }
                });
                try {
                    action();
                }
                catch (err) {
                    sub.dispose();
                    reject(err);
                }
            });
        }
        test('events - cancel/trigger', function () {
            return withOracle(model => {
                return Promise.all([
                    assertEvent(model.onDidTrigger, function () {
                        model.trigger({ auto: true });
                    }, function (event) {
                        assert.strictEqual(event.auto, true);
                        return assertEvent(model.onDidCancel, function () {
                            model.cancel();
                        }, function (event) {
                            assert.strictEqual(event.retrigger, false);
                        });
                    }),
                    assertEvent(model.onDidTrigger, function () {
                        model.trigger({ auto: true });
                    }, function (event) {
                        assert.strictEqual(event.auto, true);
                    }),
                    assertEvent(model.onDidTrigger, function () {
                        model.trigger({ auto: false });
                    }, function (event) {
                        assert.strictEqual(event.auto, false);
                    })
                ]);
            });
        });
        test('events - suggest/empty', function () {
            disposables.add(registry.register({ scheme: 'test' }, alwaysEmptySupport));
            return withOracle(model => {
                return Promise.all([
                    assertEvent(model.onDidCancel, function () {
                        model.trigger({ auto: true });
                    }, function (event) {
                        assert.strictEqual(event.retrigger, false);
                    }),
                    assertEvent(model.onDidSuggest, function () {
                        model.trigger({ auto: false });
                    }, function (event) {
                        assert.strictEqual(event.triggerOptions.auto, false);
                        assert.strictEqual(event.isFrozen, false);
                        assert.strictEqual(event.completionModel.items.length, 0);
                    })
                ]);
            });
        });
        test('trigger - on type', function () {
            disposables.add(registry.register({ scheme: 'test' }, alwaysSomethingSupport));
            return withOracle((model, editor) => {
                return assertEvent(model.onDidSuggest, () => {
                    editor.setPosition({ lineNumber: 1, column: 4 });
                    editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'd' });
                }, event => {
                    assert.strictEqual(event.triggerOptions.auto, true);
                    assert.strictEqual(event.completionModel.items.length, 1);
                    const [first] = event.completionModel.items;
                    assert.strictEqual(first.provider, alwaysSomethingSupport);
                });
            });
        });
        test('#17400: Keep filtering suggestModel.ts after space', function () {
            disposables.add(registry.register({ scheme: 'test' }, {
                _debugDisplayName: 'test',
                provideCompletionItems(doc, pos) {
                    return {
                        incomplete: false,
                        suggestions: [{
                                label: 'My Table',
                                kind: 9 /* CompletionItemKind.Property */,
                                insertText: 'My Table',
                                range: getDefaultSuggestRange(doc, pos)
                            }]
                    };
                }
            }));
            model.setValue('');
            return withOracle((model, editor) => {
                return assertEvent(model.onDidSuggest, () => {
                    // make sure completionModel starts here!
                    model.trigger({ auto: true });
                }, event => {
                    return assertEvent(model.onDidSuggest, () => {
                        editor.setPosition({ lineNumber: 1, column: 1 });
                        editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'My' });
                    }, event => {
                        assert.strictEqual(event.triggerOptions.auto, true);
                        assert.strictEqual(event.completionModel.items.length, 1);
                        const [first] = event.completionModel.items;
                        assert.strictEqual(first.completion.label, 'My Table');
                        return assertEvent(model.onDidSuggest, () => {
                            editor.setPosition({ lineNumber: 1, column: 3 });
                            editor.trigger('keyboard', "type" /* Handler.Type */, { text: ' ' });
                        }, event => {
                            assert.strictEqual(event.triggerOptions.auto, true);
                            assert.strictEqual(event.completionModel.items.length, 1);
                            const [first] = event.completionModel.items;
                            assert.strictEqual(first.completion.label, 'My Table');
                        });
                    });
                });
            });
        });
        test('#21484: Trigger character always force a new completion session', function () {
            disposables.add(registry.register({ scheme: 'test' }, {
                _debugDisplayName: 'test',
                provideCompletionItems(doc, pos) {
                    return {
                        incomplete: false,
                        suggestions: [{
                                label: 'foo.bar',
                                kind: 9 /* CompletionItemKind.Property */,
                                insertText: 'foo.bar',
                                range: range_1.$ks.fromPositions(pos.with(undefined, 1), pos)
                            }]
                    };
                }
            }));
            disposables.add(registry.register({ scheme: 'test' }, {
                _debugDisplayName: 'test',
                triggerCharacters: ['.'],
                provideCompletionItems(doc, pos) {
                    return {
                        incomplete: false,
                        suggestions: [{
                                label: 'boom',
                                kind: 9 /* CompletionItemKind.Property */,
                                insertText: 'boom',
                                range: range_1.$ks.fromPositions(pos.delta(0, doc.getLineContent(pos.lineNumber)[pos.column - 2] === '.' ? 0 : -1), pos)
                            }]
                    };
                }
            }));
            model.setValue('');
            return withOracle(async (model, editor) => {
                await assertEvent(model.onDidSuggest, () => {
                    editor.setPosition({ lineNumber: 1, column: 1 });
                    editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'foo' });
                }, event => {
                    assert.strictEqual(event.triggerOptions.auto, true);
                    assert.strictEqual(event.completionModel.items.length, 1);
                    const [first] = event.completionModel.items;
                    assert.strictEqual(first.completion.label, 'foo.bar');
                });
                await assertEvent(model.onDidSuggest, () => {
                    editor.trigger('keyboard', "type" /* Handler.Type */, { text: '.' });
                }, event => {
                    // SYNC
                    assert.strictEqual(event.triggerOptions.auto, true);
                    assert.strictEqual(event.completionModel.items.length, 1);
                    const [first] = event.completionModel.items;
                    assert.strictEqual(first.completion.label, 'foo.bar');
                });
                await assertEvent(model.onDidSuggest, () => {
                    // nothing -> triggered by the trigger character typing (see above)
                }, event => {
                    // ASYNC
                    assert.strictEqual(event.triggerOptions.auto, true);
                    assert.strictEqual(event.completionModel.items.length, 2);
                    const [first, second] = event.completionModel.items;
                    assert.strictEqual(first.completion.label, 'foo.bar');
                    assert.strictEqual(second.completion.label, 'boom');
                });
            });
        });
        test('Intellisense Completion doesn\'t respect space after equal sign (.html file), #29353 [1/2]', function () {
            disposables.add(registry.register({ scheme: 'test' }, alwaysSomethingSupport));
            return withOracle((model, editor) => {
                editor.getModel().setValue('fo');
                editor.setPosition({ lineNumber: 1, column: 3 });
                return assertEvent(model.onDidSuggest, () => {
                    model.trigger({ auto: false });
                }, event => {
                    assert.strictEqual(event.triggerOptions.auto, false);
                    assert.strictEqual(event.isFrozen, false);
                    assert.strictEqual(event.completionModel.items.length, 1);
                    return assertEvent(model.onDidCancel, () => {
                        editor.trigger('keyboard', "type" /* Handler.Type */, { text: '+' });
                    }, event => {
                        assert.strictEqual(event.retrigger, false);
                    });
                });
            });
        });
        test('Intellisense Completion doesn\'t respect space after equal sign (.html file), #29353 [2/2]', function () {
            disposables.add(registry.register({ scheme: 'test' }, alwaysSomethingSupport));
            return withOracle((model, editor) => {
                editor.getModel().setValue('fo');
                editor.setPosition({ lineNumber: 1, column: 3 });
                return assertEvent(model.onDidSuggest, () => {
                    model.trigger({ auto: false });
                }, event => {
                    assert.strictEqual(event.triggerOptions.auto, false);
                    assert.strictEqual(event.isFrozen, false);
                    assert.strictEqual(event.completionModel.items.length, 1);
                    return assertEvent(model.onDidCancel, () => {
                        editor.trigger('keyboard', "type" /* Handler.Type */, { text: ' ' });
                    }, event => {
                        assert.strictEqual(event.retrigger, false);
                    });
                });
            });
        });
        test('Incomplete suggestion results cause re-triggering when typing w/o further context, #28400 (1/2)', function () {
            disposables.add(registry.register({ scheme: 'test' }, {
                _debugDisplayName: 'test',
                provideCompletionItems(doc, pos) {
                    return {
                        incomplete: true,
                        suggestions: [{
                                label: 'foo',
                                kind: 9 /* CompletionItemKind.Property */,
                                insertText: 'foo',
                                range: range_1.$ks.fromPositions(pos.with(undefined, 1), pos)
                            }]
                    };
                }
            }));
            return withOracle((model, editor) => {
                editor.getModel().setValue('foo');
                editor.setPosition({ lineNumber: 1, column: 4 });
                return assertEvent(model.onDidSuggest, () => {
                    model.trigger({ auto: false });
                }, event => {
                    assert.strictEqual(event.triggerOptions.auto, false);
                    assert.strictEqual(event.completionModel.getIncompleteProvider().size, 1);
                    assert.strictEqual(event.completionModel.items.length, 1);
                    return assertEvent(model.onDidCancel, () => {
                        editor.trigger('keyboard', "type" /* Handler.Type */, { text: ';' });
                    }, event => {
                        assert.strictEqual(event.retrigger, false);
                    });
                });
            });
        });
        test('Incomplete suggestion results cause re-triggering when typing w/o further context, #28400 (2/2)', function () {
            disposables.add(registry.register({ scheme: 'test' }, {
                _debugDisplayName: 'test',
                provideCompletionItems(doc, pos) {
                    return {
                        incomplete: true,
                        suggestions: [{
                                label: 'foo;',
                                kind: 9 /* CompletionItemKind.Property */,
                                insertText: 'foo',
                                range: range_1.$ks.fromPositions(pos.with(undefined, 1), pos)
                            }]
                    };
                }
            }));
            return withOracle((model, editor) => {
                editor.getModel().setValue('foo');
                editor.setPosition({ lineNumber: 1, column: 4 });
                return assertEvent(model.onDidSuggest, () => {
                    model.trigger({ auto: false });
                }, event => {
                    assert.strictEqual(event.triggerOptions.auto, false);
                    assert.strictEqual(event.completionModel.getIncompleteProvider().size, 1);
                    assert.strictEqual(event.completionModel.items.length, 1);
                    return assertEvent(model.onDidSuggest, () => {
                        // while we cancel incrementally enriching the set of
                        // completions we still filter against those that we have
                        // until now
                        editor.trigger('keyboard', "type" /* Handler.Type */, { text: ';' });
                    }, event => {
                        assert.strictEqual(event.triggerOptions.auto, false);
                        assert.strictEqual(event.completionModel.getIncompleteProvider().size, 1);
                        assert.strictEqual(event.completionModel.items.length, 1);
                    });
                });
            });
        });
        test('Trigger character is provided in suggest context', function () {
            let triggerCharacter = '';
            disposables.add(registry.register({ scheme: 'test' }, {
                _debugDisplayName: 'test',
                triggerCharacters: ['.'],
                provideCompletionItems(doc, pos, context) {
                    assert.strictEqual(context.triggerKind, 1 /* CompletionTriggerKind.TriggerCharacter */);
                    triggerCharacter = context.triggerCharacter;
                    return {
                        incomplete: false,
                        suggestions: [
                            {
                                label: 'foo.bar',
                                kind: 9 /* CompletionItemKind.Property */,
                                insertText: 'foo.bar',
                                range: range_1.$ks.fromPositions(pos.with(undefined, 1), pos)
                            }
                        ]
                    };
                }
            }));
            model.setValue('');
            return withOracle((model, editor) => {
                return assertEvent(model.onDidSuggest, () => {
                    editor.setPosition({ lineNumber: 1, column: 1 });
                    editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'foo.' });
                }, event => {
                    assert.strictEqual(triggerCharacter, '.');
                });
            });
        });
        test('Mac press and hold accent character insertion does not update suggestions, #35269', function () {
            disposables.add(registry.register({ scheme: 'test' }, {
                _debugDisplayName: 'test',
                provideCompletionItems(doc, pos) {
                    return {
                        incomplete: true,
                        suggestions: [{
                                label: 'abc',
                                kind: 9 /* CompletionItemKind.Property */,
                                insertText: 'abc',
                                range: range_1.$ks.fromPositions(pos.with(undefined, 1), pos)
                            }, {
                                label: 'äbc',
                                kind: 9 /* CompletionItemKind.Property */,
                                insertText: 'äbc',
                                range: range_1.$ks.fromPositions(pos.with(undefined, 1), pos)
                            }]
                    };
                }
            }));
            model.setValue('');
            return withOracle((model, editor) => {
                return assertEvent(model.onDidSuggest, () => {
                    editor.setPosition({ lineNumber: 1, column: 1 });
                    editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'a' });
                }, event => {
                    assert.strictEqual(event.completionModel.items.length, 1);
                    assert.strictEqual(event.completionModel.items[0].completion.label, 'abc');
                    return assertEvent(model.onDidSuggest, () => {
                        editor.executeEdits('test', [editOperation_1.$ls.replace(new range_1.$ks(1, 1, 1, 2), 'ä')]);
                    }, event => {
                        // suggest model changed to äbc
                        assert.strictEqual(event.completionModel.items.length, 1);
                        assert.strictEqual(event.completionModel.items[0].completion.label, 'äbc');
                    });
                });
            });
        });
        test('Backspace should not always cancel code completion, #36491', function () {
            disposables.add(registry.register({ scheme: 'test' }, alwaysSomethingSupport));
            return withOracle(async (model, editor) => {
                await assertEvent(model.onDidSuggest, () => {
                    editor.setPosition({ lineNumber: 1, column: 4 });
                    editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'd' });
                }, event => {
                    assert.strictEqual(event.triggerOptions.auto, true);
                    assert.strictEqual(event.completionModel.items.length, 1);
                    const [first] = event.completionModel.items;
                    assert.strictEqual(first.provider, alwaysSomethingSupport);
                });
                await assertEvent(model.onDidSuggest, () => {
                    coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                }, event => {
                    assert.strictEqual(event.triggerOptions.auto, true);
                    assert.strictEqual(event.completionModel.items.length, 1);
                    const [first] = event.completionModel.items;
                    assert.strictEqual(first.provider, alwaysSomethingSupport);
                });
            });
        });
        test('Text changes for completion CodeAction are affected by the completion #39893', function () {
            disposables.add(registry.register({ scheme: 'test' }, {
                _debugDisplayName: 'test',
                provideCompletionItems(doc, pos) {
                    return {
                        incomplete: true,
                        suggestions: [{
                                label: 'bar',
                                kind: 9 /* CompletionItemKind.Property */,
                                insertText: 'bar',
                                range: range_1.$ks.fromPositions(pos.delta(0, -2), pos),
                                additionalTextEdits: [{
                                        text: ', bar',
                                        range: { startLineNumber: 1, endLineNumber: 1, startColumn: 17, endColumn: 17 }
                                    }]
                            }]
                    };
                }
            }));
            model.setValue('ba; import { foo } from "./b"');
            return withOracle(async (sugget, editor) => {
                class TestCtrl extends suggestController_1.$G6 {
                    _insertSuggestion_publicForTest(item, flags = 0) {
                        super.p(item, flags);
                    }
                }
                const ctrl = editor.registerAndInstantiateContribution(TestCtrl.ID, TestCtrl);
                editor.registerAndInstantiateContribution(snippetController2_1.$05.ID, snippetController2_1.$05);
                await assertEvent(sugget.onDidSuggest, () => {
                    editor.setPosition({ lineNumber: 1, column: 3 });
                    sugget.trigger({ auto: false });
                }, event => {
                    assert.strictEqual(event.completionModel.items.length, 1);
                    const [first] = event.completionModel.items;
                    assert.strictEqual(first.completion.label, 'bar');
                    ctrl._insertSuggestion_publicForTest({ item: first, index: 0, model: event.completionModel });
                });
                assert.strictEqual(model.getValue(), 'bar; import { foo, bar } from "./b"');
            });
        });
        test('Completion unexpectedly triggers on second keypress of an edit group in a snippet #43523', function () {
            disposables.add(registry.register({ scheme: 'test' }, alwaysSomethingSupport));
            return withOracle((model, editor) => {
                return assertEvent(model.onDidSuggest, () => {
                    editor.setValue('d');
                    editor.setSelection(new selection_1.$ms(1, 1, 1, 2));
                    editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'e' });
                }, event => {
                    assert.strictEqual(event.triggerOptions.auto, true);
                    assert.strictEqual(event.completionModel.items.length, 1);
                    const [first] = event.completionModel.items;
                    assert.strictEqual(first.provider, alwaysSomethingSupport);
                });
            });
        });
        test('Fails to render completion details #47988', function () {
            let disposeA = 0;
            let disposeB = 0;
            disposables.add(registry.register({ scheme: 'test' }, {
                _debugDisplayName: 'test',
                provideCompletionItems(doc, pos) {
                    return {
                        incomplete: true,
                        suggestions: [{
                                kind: 23 /* CompletionItemKind.Folder */,
                                label: 'CompleteNot',
                                insertText: 'Incomplete',
                                sortText: 'a',
                                range: getDefaultSuggestRange(doc, pos)
                            }],
                        dispose() { disposeA += 1; }
                    };
                }
            }));
            disposables.add(registry.register({ scheme: 'test' }, {
                _debugDisplayName: 'test',
                provideCompletionItems(doc, pos) {
                    return {
                        incomplete: false,
                        suggestions: [{
                                kind: 23 /* CompletionItemKind.Folder */,
                                label: 'Complete',
                                insertText: 'Complete',
                                sortText: 'z',
                                range: getDefaultSuggestRange(doc, pos)
                            }],
                        dispose() { disposeB += 1; }
                    };
                },
                resolveCompletionItem(item) {
                    return item;
                },
            }));
            return withOracle(async (model, editor) => {
                await assertEvent(model.onDidSuggest, () => {
                    editor.setValue('');
                    editor.setSelection(new selection_1.$ms(1, 1, 1, 1));
                    editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'c' });
                }, event => {
                    assert.strictEqual(event.triggerOptions.auto, true);
                    assert.strictEqual(event.completionModel.items.length, 2);
                    assert.strictEqual(disposeA, 0);
                    assert.strictEqual(disposeB, 0);
                });
                await assertEvent(model.onDidSuggest, () => {
                    editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'o' });
                }, event => {
                    assert.strictEqual(event.triggerOptions.auto, true);
                    assert.strictEqual(event.completionModel.items.length, 2);
                    // clean up
                    model.clear();
                    assert.strictEqual(disposeA, 2); // provide got called two times!
                    assert.strictEqual(disposeB, 1);
                });
            });
        });
        test('Trigger (full) completions when (incomplete) completions are already active #99504', function () {
            let countA = 0;
            let countB = 0;
            disposables.add(registry.register({ scheme: 'test' }, {
                _debugDisplayName: 'test',
                provideCompletionItems(doc, pos) {
                    countA += 1;
                    return {
                        incomplete: false,
                        suggestions: [{
                                kind: 5 /* CompletionItemKind.Class */,
                                label: 'Z aaa',
                                insertText: 'Z aaa',
                                range: new range_1.$ks(1, 1, pos.lineNumber, pos.column)
                            }],
                    };
                }
            }));
            disposables.add(registry.register({ scheme: 'test' }, {
                _debugDisplayName: 'test',
                provideCompletionItems(doc, pos) {
                    countB += 1;
                    if (!doc.getWordUntilPosition(pos).word.startsWith('a')) {
                        return;
                    }
                    return {
                        incomplete: false,
                        suggestions: [{
                                kind: 23 /* CompletionItemKind.Folder */,
                                label: 'aaa',
                                insertText: 'aaa',
                                range: getDefaultSuggestRange(doc, pos)
                            }],
                    };
                },
            }));
            return withOracle(async (model, editor) => {
                await assertEvent(model.onDidSuggest, () => {
                    editor.setValue('');
                    editor.setSelection(new selection_1.$ms(1, 1, 1, 1));
                    editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'Z' });
                }, event => {
                    assert.strictEqual(event.triggerOptions.auto, true);
                    assert.strictEqual(event.completionModel.items.length, 1);
                    assert.strictEqual(event.completionModel.items[0].textLabel, 'Z aaa');
                });
                await assertEvent(model.onDidSuggest, () => {
                    // started another word: Z a|
                    // item should be: Z aaa, aaa
                    editor.trigger('keyboard', "type" /* Handler.Type */, { text: ' a' });
                }, event => {
                    assert.strictEqual(event.triggerOptions.auto, true);
                    assert.strictEqual(event.completionModel.items.length, 2);
                    assert.strictEqual(event.completionModel.items[0].textLabel, 'Z aaa');
                    assert.strictEqual(event.completionModel.items[1].textLabel, 'aaa');
                    assert.strictEqual(countA, 1); // should we keep the suggestions from the "active" provider?, Yes! See: #106573
                    assert.strictEqual(countB, 2);
                });
            });
        });
        test('registerCompletionItemProvider with letters as trigger characters block other completion items to show up #127815', async function () {
            disposables.add(registry.register({ scheme: 'test' }, {
                _debugDisplayName: 'test',
                provideCompletionItems(doc, pos) {
                    return {
                        suggestions: [{
                                kind: 5 /* CompletionItemKind.Class */,
                                label: 'AAAA',
                                insertText: 'WordTriggerA',
                                range: new range_1.$ks(pos.lineNumber, pos.column, pos.lineNumber, pos.column)
                            }],
                    };
                }
            }));
            disposables.add(registry.register({ scheme: 'test' }, {
                _debugDisplayName: 'test',
                triggerCharacters: ['a', '.'],
                provideCompletionItems(doc, pos) {
                    return {
                        suggestions: [{
                                kind: 5 /* CompletionItemKind.Class */,
                                label: 'AAAA',
                                insertText: 'AutoTriggerA',
                                range: new range_1.$ks(pos.lineNumber, pos.column, pos.lineNumber, pos.column)
                            }],
                    };
                },
            }));
            return withOracle(async (model, editor) => {
                await assertEvent(model.onDidSuggest, () => {
                    editor.setValue('');
                    editor.setSelection(new selection_1.$ms(1, 1, 1, 1));
                    editor.trigger('keyboard', "type" /* Handler.Type */, { text: '.' });
                }, event => {
                    assert.strictEqual(event.triggerOptions.auto, true);
                    assert.strictEqual(event.completionModel.items.length, 1);
                });
                editor.getModel().setValue('');
                await assertEvent(model.onDidSuggest, () => {
                    editor.setValue('');
                    editor.setSelection(new selection_1.$ms(1, 1, 1, 1));
                    editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'a' });
                }, event => {
                    assert.strictEqual(event.triggerOptions.auto, true);
                    assert.strictEqual(event.completionModel.items.length, 2);
                });
            });
        });
        test('Unexpected suggest scoring #167242', async function () {
            disposables.add(registry.register('*', {
                // word-based
                _debugDisplayName: 'test',
                provideCompletionItems(doc, pos) {
                    const word = doc.getWordUntilPosition(pos);
                    return {
                        suggestions: [{
                                kind: 18 /* CompletionItemKind.Text */,
                                label: 'pull',
                                insertText: 'pull',
                                range: new range_1.$ks(pos.lineNumber, word.startColumn, pos.lineNumber, word.endColumn)
                            }],
                    };
                }
            }));
            disposables.add(registry.register({ scheme: 'test' }, {
                // JSON-based
                _debugDisplayName: 'test',
                provideCompletionItems(doc, pos) {
                    return {
                        suggestions: [{
                                kind: 5 /* CompletionItemKind.Class */,
                                label: 'git.pull',
                                insertText: 'git.pull',
                                range: new range_1.$ks(pos.lineNumber, 1, pos.lineNumber, pos.column)
                            }],
                    };
                },
            }));
            return withOracle(async function (model, editor) {
                await assertEvent(model.onDidSuggest, () => {
                    editor.setValue('gi');
                    editor.setSelection(new selection_1.$ms(1, 3, 1, 3));
                    editor.trigger('keyboard', "type" /* Handler.Type */, { text: 't' });
                }, event => {
                    assert.strictEqual(event.triggerOptions.auto, true);
                    assert.strictEqual(event.completionModel.items.length, 1);
                    assert.strictEqual(event.completionModel.items[0].textLabel, 'git.pull');
                });
                editor.trigger('keyboard', "type" /* Handler.Type */, { text: '.' });
                await assertEvent(model.onDidSuggest, () => {
                    editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'p' });
                }, event => {
                    assert.strictEqual(event.triggerOptions.auto, true);
                    assert.strictEqual(event.completionModel.items.length, 1);
                    assert.strictEqual(event.completionModel.items[0].textLabel, 'git.pull');
                });
            });
        });
        test('Completion list closes unexpectedly when typing a digit after a word separator #169390', function () {
            const requestCounts = [0, 0];
            disposables.add(registry.register({ scheme: 'test' }, {
                _debugDisplayName: 'test',
                provideCompletionItems(doc, pos) {
                    requestCounts[0] += 1;
                    return {
                        suggestions: [{
                                kind: 18 /* CompletionItemKind.Text */,
                                label: 'foo-20',
                                insertText: 'foo-20',
                                range: new range_1.$ks(pos.lineNumber, 1, pos.lineNumber, pos.column)
                            }, {
                                kind: 18 /* CompletionItemKind.Text */,
                                label: 'foo-hello',
                                insertText: 'foo-hello',
                                range: new range_1.$ks(pos.lineNumber, 1, pos.lineNumber, pos.column)
                            }],
                    };
                }
            }));
            disposables.add(registry.register({ scheme: 'test' }, {
                _debugDisplayName: 'test',
                triggerCharacters: ['2'],
                provideCompletionItems(doc, pos, ctx) {
                    requestCounts[1] += 1;
                    if (ctx.triggerKind !== 1 /* CompletionTriggerKind.TriggerCharacter */) {
                        return;
                    }
                    return {
                        suggestions: [{
                                kind: 5 /* CompletionItemKind.Class */,
                                label: 'foo-210',
                                insertText: 'foo-210',
                                range: new range_1.$ks(pos.lineNumber, 1, pos.lineNumber, pos.column)
                            }],
                    };
                },
            }));
            return withOracle(async function (model, editor) {
                await assertEvent(model.onDidSuggest, () => {
                    editor.setValue('foo');
                    editor.setSelection(new selection_1.$ms(1, 4, 1, 4));
                    model.trigger({ auto: false });
                }, event => {
                    assert.strictEqual(event.triggerOptions.auto, false);
                    assert.strictEqual(event.completionModel.items.length, 2);
                    assert.strictEqual(event.completionModel.items[0].textLabel, 'foo-20');
                    assert.strictEqual(event.completionModel.items[1].textLabel, 'foo-hello');
                });
                editor.trigger('keyboard', "type" /* Handler.Type */, { text: '-' });
                await assertEvent(model.onDidSuggest, () => {
                    editor.trigger('keyboard', "type" /* Handler.Type */, { text: '2' });
                }, event => {
                    assert.strictEqual(event.triggerOptions.auto, true);
                    assert.strictEqual(event.completionModel.items.length, 2);
                    assert.strictEqual(event.completionModel.items[0].textLabel, 'foo-20');
                    assert.strictEqual(event.completionModel.items[1].textLabel, 'foo-210');
                    assert.deepStrictEqual(requestCounts, [1, 2]);
                });
            });
        });
        test('Set refilter-flag, keep triggerKind', function () {
            disposables.add(registry.register({ scheme: 'test' }, {
                _debugDisplayName: 'test',
                triggerCharacters: ['.'],
                provideCompletionItems(doc, pos, ctx) {
                    return {
                        suggestions: [{
                                label: doc.getWordUntilPosition(pos).word || 'hello',
                                kind: 9 /* CompletionItemKind.Property */,
                                insertText: 'foofoo',
                                range: getDefaultSuggestRange(doc, pos)
                            }]
                    };
                },
            }));
            return withOracle(async function (model, editor) {
                await assertEvent(model.onDidSuggest, () => {
                    editor.setValue('foo');
                    editor.setSelection(new selection_1.$ms(1, 4, 1, 4));
                    editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'o' });
                }, event => {
                    assert.strictEqual(event.triggerOptions.auto, true);
                    assert.strictEqual(event.triggerOptions.triggerCharacter, undefined);
                    assert.strictEqual(event.triggerOptions.triggerKind, undefined);
                    assert.strictEqual(event.completionModel.items.length, 1);
                });
                await assertEvent(model.onDidSuggest, () => {
                    editor.trigger('keyboard', "type" /* Handler.Type */, { text: '.' });
                }, event => {
                    assert.strictEqual(event.triggerOptions.auto, true);
                    assert.strictEqual(event.triggerOptions.refilter, undefined);
                    assert.strictEqual(event.triggerOptions.triggerCharacter, '.');
                    assert.strictEqual(event.triggerOptions.triggerKind, 1 /* CompletionTriggerKind.TriggerCharacter */);
                    assert.strictEqual(event.completionModel.items.length, 1);
                });
                await assertEvent(model.onDidSuggest, () => {
                    editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'h' });
                }, event => {
                    assert.strictEqual(event.triggerOptions.auto, true);
                    assert.strictEqual(event.triggerOptions.refilter, true);
                    assert.strictEqual(event.triggerOptions.triggerCharacter, '.');
                    assert.strictEqual(event.triggerOptions.triggerKind, 1 /* CompletionTriggerKind.TriggerCharacter */);
                    assert.strictEqual(event.completionModel.items.length, 1);
                });
            });
        });
        test('Snippets gone from IntelliSense #173244', function () {
            const snippetProvider = {
                _debugDisplayName: 'test',
                provideCompletionItems(doc, pos, ctx) {
                    return {
                        suggestions: [{
                                label: 'log',
                                kind: 27 /* CompletionItemKind.Snippet */,
                                insertText: 'log',
                                range: getDefaultSuggestRange(doc, pos)
                            }]
                    };
                }
            };
            const old = (0, suggest_1.$15)(snippetProvider);
            disposables.add((0, lifecycle_1.$ic)(() => {
                if ((0, suggest_1.$Z5)() === snippetProvider) {
                    (0, suggest_1.$15)(old);
                }
            }));
            disposables.add(registry.register({ scheme: 'test' }, {
                _debugDisplayName: 'test',
                triggerCharacters: ['.'],
                provideCompletionItems(doc, pos, ctx) {
                    return {
                        suggestions: [{
                                label: 'locals',
                                kind: 9 /* CompletionItemKind.Property */,
                                insertText: 'locals',
                                range: getDefaultSuggestRange(doc, pos)
                            }],
                        incomplete: true
                    };
                },
            }));
            return withOracle(async function (model, editor) {
                await assertEvent(model.onDidSuggest, () => {
                    editor.setValue('');
                    editor.setSelection(new selection_1.$ms(1, 1, 1, 1));
                    editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'l' });
                }, event => {
                    assert.strictEqual(event.triggerOptions.auto, true);
                    assert.strictEqual(event.triggerOptions.triggerCharacter, undefined);
                    assert.strictEqual(event.triggerOptions.triggerKind, undefined);
                    assert.strictEqual(event.completionModel.items.length, 2);
                    assert.strictEqual(event.completionModel.items[0].textLabel, 'locals');
                    assert.strictEqual(event.completionModel.items[1].textLabel, 'log');
                });
                await assertEvent(model.onDidSuggest, () => {
                    editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'o' });
                }, event => {
                    assert.strictEqual(event.triggerOptions.triggerKind, 2 /* CompletionTriggerKind.TriggerForIncompleteCompletions */);
                    assert.strictEqual(event.triggerOptions.auto, true);
                    assert.strictEqual(event.completionModel.items.length, 2);
                    assert.strictEqual(event.completionModel.items[0].textLabel, 'locals');
                    assert.strictEqual(event.completionModel.items[1].textLabel, 'log');
                });
            });
        });
    });
});
//# sourceMappingURL=suggestModel.test.js.map