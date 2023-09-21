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
        const storeService = new storage_1.InMemoryStorageService();
        const editor = (0, testCodeEditor_1.createTestCodeEditor)(model, {
            serviceCollection: new serviceCollection_1.ServiceCollection([languageFeatures_1.ILanguageFeaturesService, languageFeaturesService], [telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService], [storage_1.IStorageService, storeService], [keybinding_1.IKeybindingService, new mockKeybindingService_1.MockKeybindingService()], [suggestMemory_1.ISuggestMemoryService, new class {
                    memorize() {
                    }
                    select() {
                        return -1;
                    }
                }], [label_1.ILabelService, new class extends (0, mock_1.mock)() {
                }], [workspace_1.IWorkspaceContextService, new class extends (0, mock_1.mock)() {
                }], [environment_1.IEnvironmentService, new class extends (0, mock_1.mock)() {
                    constructor() {
                        super(...arguments);
                        this.isBuilt = true;
                        this.isExtensionDevelopment = false;
                    }
                }]),
        });
        const ctrl = editor.registerAndInstantiateContribution(snippetController2_1.SnippetController2.ID, snippetController2_1.SnippetController2);
        editor.hasWidgetFocus = () => true;
        editor.registerDisposable(ctrl);
        editor.registerDisposable(storeService);
        return editor;
    }
    suite('SuggestModel - Context', function () {
        const OUTER_LANGUAGE_ID = 'outerMode';
        const INNER_LANGUAGE_ID = 'innerMode';
        let OuterMode = class OuterMode extends lifecycle_1.Disposable {
            constructor(languageService, languageConfigurationService) {
                super();
                this.languageId = OUTER_LANGUAGE_ID;
                this._register(languageService.registerLanguage({ id: this.languageId }));
                this._register(languageConfigurationService.register(this.languageId, {}));
                this._register(languages_1.TokenizationRegistry.register(this.languageId, {
                    getInitialState: () => nullTokenize_1.NullState,
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
                        return new languages_1.EncodedTokenizationResult(tokens, state);
                    }
                }));
            }
        };
        OuterMode = __decorate([
            __param(0, language_1.ILanguageService),
            __param(1, languageConfigurationRegistry_1.ILanguageConfigurationService)
        ], OuterMode);
        let InnerMode = class InnerMode extends lifecycle_1.Disposable {
            constructor(languageService, languageConfigurationService) {
                super();
                this.languageId = INNER_LANGUAGE_ID;
                this._register(languageService.registerLanguage({ id: this.languageId }));
                this._register(languageConfigurationService.register(this.languageId, {}));
            }
        };
        InnerMode = __decorate([
            __param(0, language_1.ILanguageService),
            __param(1, languageConfigurationRegistry_1.ILanguageConfigurationService)
        ], InnerMode);
        const assertAutoTrigger = (model, offset, expected, message) => {
            const pos = model.getPositionAt(offset);
            const editor = createMockEditor(model, new languageFeaturesService_1.LanguageFeaturesService());
            editor.setPosition(pos);
            assert.strictEqual(suggestModel_1.LineContext.shouldAutoTrigger(editor), expected, message);
            editor.dispose();
        };
        let disposables;
        setup(() => {
            disposables = new lifecycle_1.DisposableStore();
        });
        teardown(function () {
            disposables.dispose();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('Context - shouldAutoTrigger', function () {
            const model = (0, testTextModel_1.createTextModel)('Das Pferd frisst keinen Gurkensalat - Philipp Reis 1861.\nWer hat\'s erfunden?');
            disposables.add(model);
            assertAutoTrigger(model, 3, true, 'end of word, Das|');
            assertAutoTrigger(model, 4, false, 'no word Das |');
            assertAutoTrigger(model, 1, true, 'typing a single character before a word: D|as');
            assertAutoTrigger(model, 55, false, 'number, 1861|');
            model.dispose();
        });
        test('shouldAutoTrigger at embedded language boundaries', () => {
            const disposables = new lifecycle_1.DisposableStore();
            const instantiationService = (0, testTextModel_1.createModelServices)(disposables);
            const outerMode = disposables.add(instantiationService.createInstance(OuterMode));
            disposables.add(instantiationService.createInstance(InnerMode));
            const model = disposables.add((0, testTextModel_1.instantiateTextModel)(instantiationService, 'a<xx>a<x>', outerMode.languageId));
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
            return new range_1.Range(position.lineNumber, wordUntil.startColumn, position.lineNumber, wordUntil.endColumn);
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
        const languageFeaturesService = new languageFeaturesService_1.LanguageFeaturesService();
        const registry = languageFeaturesService.completionProvider;
        setup(function () {
            disposables = new lifecycle_1.DisposableStore();
            model = (0, testTextModel_1.createTextModel)('abc def', undefined, undefined, uri_1.URI.parse('test:somefile.ttt'));
            disposables.add(model);
        });
        teardown(() => {
            disposables.dispose();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        function withOracle(callback) {
            return new Promise((resolve, reject) => {
                const editor = createMockEditor(model, languageFeaturesService);
                const oracle = editor.invokeWithinContext(accessor => accessor.get(instantiation_1.IInstantiationService).createInstance(suggestModel_1.SuggestModel, editor));
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
                                range: range_1.Range.fromPositions(pos.with(undefined, 1), pos)
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
                                range: range_1.Range.fromPositions(pos.delta(0, doc.getLineContent(pos.lineNumber)[pos.column - 2] === '.' ? 0 : -1), pos)
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
                                range: range_1.Range.fromPositions(pos.with(undefined, 1), pos)
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
                                range: range_1.Range.fromPositions(pos.with(undefined, 1), pos)
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
                                range: range_1.Range.fromPositions(pos.with(undefined, 1), pos)
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
                                range: range_1.Range.fromPositions(pos.with(undefined, 1), pos)
                            }, {
                                label: 'äbc',
                                kind: 9 /* CompletionItemKind.Property */,
                                insertText: 'äbc',
                                range: range_1.Range.fromPositions(pos.with(undefined, 1), pos)
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
                        editor.executeEdits('test', [editOperation_1.EditOperation.replace(new range_1.Range(1, 1, 1, 2), 'ä')]);
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
                                range: range_1.Range.fromPositions(pos.delta(0, -2), pos),
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
                class TestCtrl extends suggestController_1.SuggestController {
                    _insertSuggestion_publicForTest(item, flags = 0) {
                        super._insertSuggestion(item, flags);
                    }
                }
                const ctrl = editor.registerAndInstantiateContribution(TestCtrl.ID, TestCtrl);
                editor.registerAndInstantiateContribution(snippetController2_1.SnippetController2.ID, snippetController2_1.SnippetController2);
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
                    editor.setSelection(new selection_1.Selection(1, 1, 1, 2));
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
                    editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
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
                                range: new range_1.Range(1, 1, pos.lineNumber, pos.column)
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
                    editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
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
                                range: new range_1.Range(pos.lineNumber, pos.column, pos.lineNumber, pos.column)
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
                                range: new range_1.Range(pos.lineNumber, pos.column, pos.lineNumber, pos.column)
                            }],
                    };
                },
            }));
            return withOracle(async (model, editor) => {
                await assertEvent(model.onDidSuggest, () => {
                    editor.setValue('');
                    editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
                    editor.trigger('keyboard', "type" /* Handler.Type */, { text: '.' });
                }, event => {
                    assert.strictEqual(event.triggerOptions.auto, true);
                    assert.strictEqual(event.completionModel.items.length, 1);
                });
                editor.getModel().setValue('');
                await assertEvent(model.onDidSuggest, () => {
                    editor.setValue('');
                    editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
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
                                range: new range_1.Range(pos.lineNumber, word.startColumn, pos.lineNumber, word.endColumn)
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
                                range: new range_1.Range(pos.lineNumber, 1, pos.lineNumber, pos.column)
                            }],
                    };
                },
            }));
            return withOracle(async function (model, editor) {
                await assertEvent(model.onDidSuggest, () => {
                    editor.setValue('gi');
                    editor.setSelection(new selection_1.Selection(1, 3, 1, 3));
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
                                range: new range_1.Range(pos.lineNumber, 1, pos.lineNumber, pos.column)
                            }, {
                                kind: 18 /* CompletionItemKind.Text */,
                                label: 'foo-hello',
                                insertText: 'foo-hello',
                                range: new range_1.Range(pos.lineNumber, 1, pos.lineNumber, pos.column)
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
                                range: new range_1.Range(pos.lineNumber, 1, pos.lineNumber, pos.column)
                            }],
                    };
                },
            }));
            return withOracle(async function (model, editor) {
                await assertEvent(model.onDidSuggest, () => {
                    editor.setValue('foo');
                    editor.setSelection(new selection_1.Selection(1, 4, 1, 4));
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
                    editor.setSelection(new selection_1.Selection(1, 4, 1, 4));
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
            const old = (0, suggest_1.setSnippetSuggestSupport)(snippetProvider);
            disposables.add((0, lifecycle_1.toDisposable)(() => {
                if ((0, suggest_1.getSnippetSuggestSupport)() === snippetProvider) {
                    (0, suggest_1.setSnippetSuggestSupport)(old);
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
                    editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VnZ2VzdE1vZGVsLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9zdWdnZXN0L3Rlc3QvYnJvd3Nlci9zdWdnZXN0TW9kZWwudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUE2Q0EsU0FBUyxnQkFBZ0IsQ0FBQyxLQUFnQixFQUFFLHVCQUFpRDtRQUU1RixNQUFNLFlBQVksR0FBRyxJQUFJLGdDQUFzQixFQUFFLENBQUM7UUFDbEQsTUFBTSxNQUFNLEdBQUcsSUFBQSxxQ0FBb0IsRUFBQyxLQUFLLEVBQUU7WUFDMUMsaUJBQWlCLEVBQUUsSUFBSSxxQ0FBaUIsQ0FDdkMsQ0FBQywyQ0FBd0IsRUFBRSx1QkFBdUIsQ0FBQyxFQUNuRCxDQUFDLDZCQUFpQixFQUFFLHFDQUFvQixDQUFDLEVBQ3pDLENBQUMseUJBQWUsRUFBRSxZQUFZLENBQUMsRUFDL0IsQ0FBQywrQkFBa0IsRUFBRSxJQUFJLDZDQUFxQixFQUFFLENBQUMsRUFDakQsQ0FBQyxxQ0FBcUIsRUFBRSxJQUFJO29CQUUzQixRQUFRO29CQUNSLENBQUM7b0JBQ0QsTUFBTTt3QkFDTCxPQUFPLENBQUMsQ0FBQyxDQUFDO29CQUNYLENBQUM7aUJBQ0QsQ0FBQyxFQUNGLENBQUMscUJBQWEsRUFBRSxJQUFJLEtBQU0sU0FBUSxJQUFBLFdBQUksR0FBaUI7aUJBQUksQ0FBQyxFQUM1RCxDQUFDLG9DQUF3QixFQUFFLElBQUksS0FBTSxTQUFRLElBQUEsV0FBSSxHQUE0QjtpQkFBSSxDQUFDLEVBQ2xGLENBQUMsaUNBQW1CLEVBQUUsSUFBSSxLQUFNLFNBQVEsSUFBQSxXQUFJLEdBQXVCO29CQUF6Qzs7d0JBQ2hCLFlBQU8sR0FBWSxJQUFJLENBQUM7d0JBQ3hCLDJCQUFzQixHQUFZLEtBQUssQ0FBQztvQkFDbEQsQ0FBQztpQkFBQSxDQUFDLENBQ0Y7U0FDRCxDQUFD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