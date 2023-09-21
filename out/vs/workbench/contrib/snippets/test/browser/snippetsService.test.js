/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/contrib/snippets/browser/snippetCompletionProvider", "vs/editor/common/core/position", "vs/editor/test/common/testTextModel", "vs/workbench/contrib/snippets/browser/snippetsFile", "vs/base/common/lifecycle", "vs/editor/test/common/modes/testLanguageConfigurationService", "vs/editor/common/core/editOperation", "vs/editor/common/languages/language", "vs/base/common/uuid", "vs/base/test/common/utils"], function (require, exports, assert, snippetCompletionProvider_1, position_1, testTextModel_1, snippetsFile_1, lifecycle_1, testLanguageConfigurationService_1, editOperation_1, language_1, uuid_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SimpleSnippetService {
        constructor(snippets) {
            this.snippets = snippets;
        }
        getSnippets() {
            return Promise.resolve(this.getSnippetsSync());
        }
        getSnippetsSync() {
            return this.snippets;
        }
        getSnippetFiles() {
            throw new Error();
        }
        isEnabled() {
            throw new Error();
        }
        updateEnablement() {
            throw new Error();
        }
        updateUsageTimestamp(snippet) {
            throw new Error();
        }
    }
    suite('SnippetsService', function () {
        const context = { triggerKind: 0 /* CompletionTriggerKind.Invoke */ };
        let disposables;
        let instantiationService;
        let languageService;
        let snippetService;
        setup(function () {
            disposables = new lifecycle_1.DisposableStore();
            instantiationService = (0, testTextModel_1.createModelServices)(disposables);
            languageService = instantiationService.get(language_1.ILanguageService);
            disposables.add(languageService.registerLanguage({
                id: 'fooLang',
                extensions: ['.fooLang',]
            }));
            snippetService = new SimpleSnippetService([new snippetsFile_1.Snippet(false, ['fooLang'], 'barTest', 'bar', '', 'barCodeSnippet', '', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)()), new snippetsFile_1.Snippet(false, ['fooLang'], 'bazzTest', 'bazz', '', 'bazzCodeSnippet', '', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)())]);
        });
        teardown(() => {
            disposables.dispose();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('snippet completions - simple', function () {
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.TestLanguageConfigurationService()));
            const model = disposables.add((0, testTextModel_1.instantiateTextModel)(instantiationService, '', 'fooLang'));
            return provider.provideCompletionItems(model, new position_1.Position(1, 1), context).then(result => {
                assert.strictEqual(result.incomplete, undefined);
                assert.strictEqual(result.suggestions.length, 2);
            });
        });
        test('snippet completions - simple 2', async function () {
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.TestLanguageConfigurationService()));
            const model = disposables.add((0, testTextModel_1.instantiateTextModel)(instantiationService, 'hello ', 'fooLang'));
            await provider.provideCompletionItems(model, new position_1.Position(1, 6) /* hello| */, context).then(result => {
                assert.strictEqual(result.incomplete, undefined);
                assert.strictEqual(result.suggestions.length, 0);
            });
            await provider.provideCompletionItems(model, new position_1.Position(1, 7) /* hello |*/, context).then(result => {
                assert.strictEqual(result.incomplete, undefined);
                assert.strictEqual(result.suggestions.length, 2);
            });
        });
        test('snippet completions - with prefix', function () {
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.TestLanguageConfigurationService()));
            const model = disposables.add((0, testTextModel_1.instantiateTextModel)(instantiationService, 'bar', 'fooLang'));
            return provider.provideCompletionItems(model, new position_1.Position(1, 4), context).then(result => {
                assert.strictEqual(result.incomplete, undefined);
                assert.strictEqual(result.suggestions.length, 1);
                assert.deepStrictEqual(result.suggestions[0].label, {
                    label: 'bar',
                    description: 'barTest'
                });
                assert.strictEqual(result.suggestions[0].range.insert.startColumn, 1);
                assert.strictEqual(result.suggestions[0].insertText, 'barCodeSnippet');
            });
        });
        test('snippet completions - with different prefixes', async function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.Snippet(false, ['fooLang'], 'barTest', 'bar', '', 's1', '', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)()), new snippetsFile_1.Snippet(false, ['fooLang'], 'name', 'bar-bar', '', 's2', '', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)())]);
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.TestLanguageConfigurationService()));
            const model = disposables.add((0, testTextModel_1.instantiateTextModel)(instantiationService, 'bar-bar', 'fooLang'));
            await provider.provideCompletionItems(model, new position_1.Position(1, 3), context).then(result => {
                assert.strictEqual(result.incomplete, undefined);
                assert.strictEqual(result.suggestions.length, 2);
                assert.deepStrictEqual(result.suggestions[0].label, {
                    label: 'bar',
                    description: 'barTest'
                });
                assert.strictEqual(result.suggestions[0].insertText, 's1');
                assert.strictEqual(result.suggestions[0].range.insert.startColumn, 1);
                assert.deepStrictEqual(result.suggestions[1].label, {
                    label: 'bar-bar',
                    description: 'name'
                });
                assert.strictEqual(result.suggestions[1].insertText, 's2');
                assert.strictEqual(result.suggestions[1].range.insert.startColumn, 1);
            });
            await provider.provideCompletionItems(model, new position_1.Position(1, 5), context).then(result => {
                assert.strictEqual(result.incomplete, undefined);
                assert.strictEqual(result.suggestions.length, 2);
                const [first, second] = result.suggestions;
                assert.deepStrictEqual(first.label, {
                    label: 'bar',
                    description: 'barTest'
                });
                assert.strictEqual(first.insertText, 's1');
                assert.strictEqual(first.range.insert.startColumn, 5);
                assert.deepStrictEqual(second.label, {
                    label: 'bar-bar',
                    description: 'name'
                });
                assert.strictEqual(second.insertText, 's2');
                assert.strictEqual(second.range.insert.startColumn, 1);
            });
            await provider.provideCompletionItems(model, new position_1.Position(1, 6), context).then(result => {
                assert.strictEqual(result.incomplete, undefined);
                assert.strictEqual(result.suggestions.length, 2);
                assert.deepStrictEqual(result.suggestions[0].label, {
                    label: 'bar',
                    description: 'barTest'
                });
                assert.strictEqual(result.suggestions[0].insertText, 's1');
                assert.strictEqual(result.suggestions[0].range.insert.startColumn, 5);
                assert.deepStrictEqual(result.suggestions[1].label, {
                    label: 'bar-bar',
                    description: 'name'
                });
                assert.strictEqual(result.suggestions[1].insertText, 's2');
                assert.strictEqual(result.suggestions[1].range.insert.startColumn, 1);
            });
        });
        test('Cannot use "<?php" as user snippet prefix anymore, #26275', function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.Snippet(false, ['fooLang'], '', '<?php', '', 'insert me', '', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)())]);
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.TestLanguageConfigurationService()));
            let model = (0, testTextModel_1.instantiateTextModel)(instantiationService, '\t<?php', 'fooLang');
            return provider.provideCompletionItems(model, new position_1.Position(1, 7), context).then(result => {
                assert.strictEqual(result.suggestions.length, 1);
                model.dispose();
                model = (0, testTextModel_1.instantiateTextModel)(instantiationService, '\t<?', 'fooLang');
                return provider.provideCompletionItems(model, new position_1.Position(1, 4), context);
            }).then(result => {
                assert.strictEqual(result.suggestions.length, 1);
                assert.strictEqual(result.suggestions[0].range.insert.startColumn, 2);
                model.dispose();
                model = (0, testTextModel_1.instantiateTextModel)(instantiationService, 'a<?', 'fooLang');
                return provider.provideCompletionItems(model, new position_1.Position(1, 4), context);
            }).then(result => {
                assert.strictEqual(result.suggestions.length, 1);
                assert.strictEqual(result.suggestions[0].range.insert.startColumn, 2);
                model.dispose();
            });
        });
        test('No user snippets in suggestions, when inside the code, #30508', function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.Snippet(false, ['fooLang'], '', 'foo', '', '<foo>$0</foo>', '', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)())]);
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.TestLanguageConfigurationService()));
            const model = disposables.add((0, testTextModel_1.instantiateTextModel)(instantiationService, '<head>\n\t\n>/head>', 'fooLang'));
            return provider.provideCompletionItems(model, new position_1.Position(1, 1), context).then(result => {
                assert.strictEqual(result.suggestions.length, 1);
                return provider.provideCompletionItems(model, new position_1.Position(2, 2), context);
            }).then(result => {
                assert.strictEqual(result.suggestions.length, 1);
            });
        });
        test('SnippetSuggest - ensure extension snippets come last ', function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.Snippet(false, ['fooLang'], 'second', 'second', '', 'second', '', 3 /* SnippetSource.Extension */, (0, uuid_1.generateUuid)()), new snippetsFile_1.Snippet(false, ['fooLang'], 'first', 'first', '', 'first', '', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)())]);
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.TestLanguageConfigurationService()));
            const model = disposables.add((0, testTextModel_1.instantiateTextModel)(instantiationService, '', 'fooLang'));
            return provider.provideCompletionItems(model, new position_1.Position(1, 1), context).then(result => {
                assert.strictEqual(result.suggestions.length, 2);
                const [first, second] = result.suggestions;
                assert.deepStrictEqual(first.label, {
                    label: 'first',
                    description: 'first'
                });
                assert.deepStrictEqual(second.label, {
                    label: 'second',
                    description: 'second'
                });
            });
        });
        test('Dash in snippets prefix broken #53945', async function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.Snippet(false, ['fooLang'], 'p-a', 'p-a', '', 'second', '', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)())]);
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.TestLanguageConfigurationService()));
            const model = disposables.add((0, testTextModel_1.instantiateTextModel)(instantiationService, 'p-', 'fooLang'));
            let result = await provider.provideCompletionItems(model, new position_1.Position(1, 2), context);
            assert.strictEqual(result.suggestions.length, 1);
            result = await provider.provideCompletionItems(model, new position_1.Position(1, 3), context);
            assert.strictEqual(result.suggestions.length, 1);
            result = await provider.provideCompletionItems(model, new position_1.Position(1, 3), context);
            assert.strictEqual(result.suggestions.length, 1);
        });
        test('No snippets suggestion on long lines beyond character 100 #58807', async function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.Snippet(false, ['fooLang'], 'bug', 'bug', '', 'second', '', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)())]);
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.TestLanguageConfigurationService()));
            const model = disposables.add((0, testTextModel_1.instantiateTextModel)(instantiationService, 'Thisisaverylonglinegoingwithmore100bcharactersandthismakesintellisensebecomea Thisisaverylonglinegoingwithmore100bcharactersandthismakesintellisensebecomea b', 'fooLang'));
            const result = await provider.provideCompletionItems(model, new position_1.Position(1, 158), context);
            assert.strictEqual(result.suggestions.length, 1);
        });
        test('Type colon will trigger snippet #60746', async function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.Snippet(false, ['fooLang'], 'bug', 'bug', '', 'second', '', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)())]);
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.TestLanguageConfigurationService()));
            const model = disposables.add((0, testTextModel_1.instantiateTextModel)(instantiationService, ':', 'fooLang'));
            const result = await provider.provideCompletionItems(model, new position_1.Position(1, 2), context);
            assert.strictEqual(result.suggestions.length, 0);
        });
        test('substring of prefix can\'t trigger snippet #60737', async function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.Snippet(false, ['fooLang'], 'mytemplate', 'mytemplate', '', 'second', '', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)())]);
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.TestLanguageConfigurationService()));
            const model = disposables.add((0, testTextModel_1.instantiateTextModel)(instantiationService, 'template', 'fooLang'));
            const result = await provider.provideCompletionItems(model, new position_1.Position(1, 9), context);
            assert.strictEqual(result.suggestions.length, 1);
            assert.deepStrictEqual(result.suggestions[0].label, {
                label: 'mytemplate',
                description: 'mytemplate'
            });
        });
        test('No snippets suggestion beyond character 100 if not at end of line #60247', async function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.Snippet(false, ['fooLang'], 'bug', 'bug', '', 'second', '', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)())]);
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.TestLanguageConfigurationService()));
            const model = disposables.add((0, testTextModel_1.instantiateTextModel)(instantiationService, 'Thisisaverylonglinegoingwithmore100bcharactersandthismakesintellisensebecomea Thisisaverylonglinegoingwithmore100bcharactersandthismakesintellisensebecomea b text_after_b', 'fooLang'));
            const result = await provider.provideCompletionItems(model, new position_1.Position(1, 158), context);
            assert.strictEqual(result.suggestions.length, 1);
        });
        test('issue #61296: VS code freezes when editing CSS file with emoji', async function () {
            const languageConfigurationService = disposables.add(new testLanguageConfigurationService_1.TestLanguageConfigurationService());
            disposables.add(languageConfigurationService.register('fooLang', {
                wordPattern: /(#?-?\d*\.\d\w*%?)|(::?[\w-]*(?=[^,{;]*[,{]))|(([@#.!])?[\w-?]+%?|[@#!.])/g
            }));
            snippetService = new SimpleSnippetService([new snippetsFile_1.Snippet(false, ['fooLang'], 'bug', '-a-bug', '', 'second', '', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)())]);
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(languageService, snippetService, languageConfigurationService);
            const model = disposables.add((0, testTextModel_1.instantiateTextModel)(instantiationService, '.🐷-a-b', 'fooLang'));
            const result = await provider.provideCompletionItems(model, new position_1.Position(1, 8), context);
            assert.strictEqual(result.suggestions.length, 1);
        });
        test('No snippets shown when triggering completions at whitespace on line that already has text #62335', async function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.Snippet(false, ['fooLang'], 'bug', 'bug', '', 'second', '', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)())]);
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.TestLanguageConfigurationService()));
            const model = disposables.add((0, testTextModel_1.instantiateTextModel)(instantiationService, 'a ', 'fooLang'));
            const result = await provider.provideCompletionItems(model, new position_1.Position(1, 3), context);
            assert.strictEqual(result.suggestions.length, 1);
        });
        test('Snippet prefix with special chars and numbers does not work #62906', async function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.Snippet(false, ['fooLang'], 'noblockwdelay', '<<', '', '<= #dly"', '', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)()), new snippetsFile_1.Snippet(false, ['fooLang'], 'noblockwdelay', '11', '', 'eleven', '', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)())]);
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.TestLanguageConfigurationService()));
            let model = (0, testTextModel_1.instantiateTextModel)(instantiationService, ' <', 'fooLang');
            let result = await provider.provideCompletionItems(model, new position_1.Position(1, 3), context);
            assert.strictEqual(result.suggestions.length, 1);
            let [first] = result.suggestions;
            assert.strictEqual(first.range.insert.startColumn, 2);
            model.dispose();
            model = (0, testTextModel_1.instantiateTextModel)(instantiationService, '1', 'fooLang');
            result = await provider.provideCompletionItems(model, new position_1.Position(1, 2), context);
            assert.strictEqual(result.suggestions.length, 1);
            [first] = result.suggestions;
            assert.strictEqual(first.range.insert.startColumn, 1);
            model.dispose();
        });
        test('Snippet replace range', async function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.Snippet(false, ['fooLang'], 'notWordTest', 'not word', '', 'not word snippet', '', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)())]);
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.TestLanguageConfigurationService()));
            let model = (0, testTextModel_1.instantiateTextModel)(instantiationService, 'not wordFoo bar', 'fooLang');
            let result = await provider.provideCompletionItems(model, new position_1.Position(1, 3), context);
            assert.strictEqual(result.suggestions.length, 1);
            let [first] = result.suggestions;
            assert.strictEqual(first.range.insert.endColumn, 3);
            assert.strictEqual(first.range.replace.endColumn, 9);
            model.dispose();
            model = (0, testTextModel_1.instantiateTextModel)(instantiationService, 'not woFoo bar', 'fooLang');
            result = await provider.provideCompletionItems(model, new position_1.Position(1, 3), context);
            assert.strictEqual(result.suggestions.length, 1);
            [first] = result.suggestions;
            assert.strictEqual(first.range.insert.endColumn, 3);
            assert.strictEqual(first.range.replace.endColumn, 3);
            model.dispose();
            model = (0, testTextModel_1.instantiateTextModel)(instantiationService, 'not word', 'fooLang');
            result = await provider.provideCompletionItems(model, new position_1.Position(1, 1), context);
            assert.strictEqual(result.suggestions.length, 1);
            [first] = result.suggestions;
            assert.strictEqual(first.range.insert.endColumn, 1);
            assert.strictEqual(first.range.replace.endColumn, 9);
            model.dispose();
        });
        test('Snippet replace-range incorrect #108894', async function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.Snippet(false, ['fooLang'], 'eng', 'eng', '', '<span></span>', '', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)())]);
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.TestLanguageConfigurationService()));
            const model = (0, testTextModel_1.instantiateTextModel)(instantiationService, 'filler e KEEP ng filler', 'fooLang');
            const result = await provider.provideCompletionItems(model, new position_1.Position(1, 9), context);
            assert.strictEqual(result.suggestions.length, 1);
            const [first] = result.suggestions;
            assert.strictEqual(first.range.insert.endColumn, 9);
            assert.strictEqual(first.range.replace.endColumn, 9);
            model.dispose();
        });
        test('Snippet will replace auto-closing pair if specified in prefix', async function () {
            const languageConfigurationService = disposables.add(new testLanguageConfigurationService_1.TestLanguageConfigurationService());
            disposables.add(languageConfigurationService.register('fooLang', {
                brackets: [
                    ['{', '}'],
                    ['[', ']'],
                    ['(', ')'],
                ]
            }));
            snippetService = new SimpleSnippetService([new snippetsFile_1.Snippet(false, ['fooLang'], 'PSCustomObject', '[PSCustomObject]', '', '[PSCustomObject] @{ Key = Value }', '', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)())]);
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(languageService, snippetService, languageConfigurationService);
            const model = (0, testTextModel_1.instantiateTextModel)(instantiationService, '[psc]', 'fooLang');
            const result = await provider.provideCompletionItems(model, new position_1.Position(1, 5), context);
            assert.strictEqual(result.suggestions.length, 1);
            const [first] = result.suggestions;
            assert.strictEqual(first.range.insert.endColumn, 5);
            // This is 6 because it should eat the `]` at the end of the text even if cursor is before it
            assert.strictEqual(first.range.replace.endColumn, 6);
            model.dispose();
        });
        test('Leading whitespace in snippet prefix #123860', async function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.Snippet(false, ['fooLang'], 'cite-name', ' cite', '', '~\\cite{$CLIPBOARD}', '', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)())]);
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.TestLanguageConfigurationService()));
            const model = (0, testTextModel_1.instantiateTextModel)(instantiationService, ' ci', 'fooLang');
            const result = await provider.provideCompletionItems(model, new position_1.Position(1, 4), context);
            assert.strictEqual(result.suggestions.length, 1);
            const [first] = result.suggestions;
            assert.strictEqual(first.label.label, ' cite');
            assert.strictEqual(first.range.insert.startColumn, 1);
            model.dispose();
        });
        test('still show suggestions in string when disable string suggestion #136611', async function () {
            snippetService = new SimpleSnippetService([
                new snippetsFile_1.Snippet(false, ['fooLang'], 'aaa', 'aaa', '', 'value', '', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)()),
                new snippetsFile_1.Snippet(false, ['fooLang'], 'bbb', 'bbb', '', 'value', '', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)()),
                // new Snippet(['fooLang'], '\'ccc', '\'ccc', '', 'value', '', SnippetSource.User, generateUuid())
            ]);
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.TestLanguageConfigurationService()));
            const model = (0, testTextModel_1.instantiateTextModel)(instantiationService, '\'\'', 'fooLang');
            const result = await provider.provideCompletionItems(model, new position_1.Position(1, 2), { triggerKind: 1 /* CompletionTriggerKind.TriggerCharacter */, triggerCharacter: '\'' });
            assert.strictEqual(result.suggestions.length, 0);
            model.dispose();
        });
        test('still show suggestions in string when disable string suggestion #136611 (part 2)', async function () {
            snippetService = new SimpleSnippetService([
                new snippetsFile_1.Snippet(false, ['fooLang'], 'aaa', 'aaa', '', 'value', '', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)()),
                new snippetsFile_1.Snippet(false, ['fooLang'], 'bbb', 'bbb', '', 'value', '', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)()),
                new snippetsFile_1.Snippet(false, ['fooLang'], '\'ccc', '\'ccc', '', 'value', '', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)())
            ]);
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.TestLanguageConfigurationService()));
            const model = (0, testTextModel_1.instantiateTextModel)(instantiationService, '\'\'', 'fooLang');
            const result = await provider.provideCompletionItems(model, new position_1.Position(1, 2), { triggerKind: 1 /* CompletionTriggerKind.TriggerCharacter */, triggerCharacter: '\'' });
            assert.strictEqual(result.suggestions.length, 1);
            model.dispose();
        });
        test('Snippet suggestions are too eager #138707 (word)', async function () {
            snippetService = new SimpleSnippetService([
                new snippetsFile_1.Snippet(false, ['fooLang'], 'tys', 'tys', '', 'value', '', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)()),
                new snippetsFile_1.Snippet(false, ['fooLang'], 'hell_or_tell', 'hell_or_tell', '', 'value', '', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)()),
                new snippetsFile_1.Snippet(false, ['fooLang'], '^y', '^y', '', 'value', '', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)()),
            ]);
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.TestLanguageConfigurationService()));
            const model = (0, testTextModel_1.instantiateTextModel)(instantiationService, '\'hellot\'', 'fooLang');
            const result = await provider.provideCompletionItems(model, new position_1.Position(1, 8), { triggerKind: 0 /* CompletionTriggerKind.Invoke */ });
            assert.strictEqual(result.suggestions.length, 1);
            assert.strictEqual(result.suggestions[0].label.label, 'hell_or_tell');
            model.dispose();
        });
        test('Snippet suggestions are too eager #138707 (no word)', async function () {
            snippetService = new SimpleSnippetService([
                new snippetsFile_1.Snippet(false, ['fooLang'], 'tys', 'tys', '', 'value', '', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)()),
                new snippetsFile_1.Snippet(false, ['fooLang'], 't', 't', '', 'value', '', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)()),
                new snippetsFile_1.Snippet(false, ['fooLang'], '^y', '^y', '', 'value', '', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)()),
            ]);
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.TestLanguageConfigurationService()));
            const model = (0, testTextModel_1.instantiateTextModel)(instantiationService, ')*&^', 'fooLang');
            const result = await provider.provideCompletionItems(model, new position_1.Position(1, 5), { triggerKind: 0 /* CompletionTriggerKind.Invoke */ });
            assert.strictEqual(result.suggestions.length, 1);
            assert.strictEqual(result.suggestions[0].label.label, '^y');
            model.dispose();
        });
        test('Snippet suggestions are too eager #138707 (word/word)', async function () {
            snippetService = new SimpleSnippetService([
                new snippetsFile_1.Snippet(false, ['fooLang'], 'async arrow function', 'async arrow function', '', 'value', '', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)()),
                new snippetsFile_1.Snippet(false, ['fooLang'], 'foobarrrrrr', 'foobarrrrrr', '', 'value', '', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)()),
            ]);
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.TestLanguageConfigurationService()));
            const model = (0, testTextModel_1.instantiateTextModel)(instantiationService, 'foobar', 'fooLang');
            const result = await provider.provideCompletionItems(model, new position_1.Position(1, 7), { triggerKind: 0 /* CompletionTriggerKind.Invoke */ });
            assert.strictEqual(result.suggestions.length, 1);
            assert.strictEqual(result.suggestions[0].label.label, 'foobarrrrrr');
            model.dispose();
        });
        test('Strange and useless autosuggestion #region/#endregion PHP #140039', async function () {
            snippetService = new SimpleSnippetService([
                new snippetsFile_1.Snippet(false, ['fooLang'], 'reg', '#region', '', 'value', '', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)()),
            ]);
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.TestLanguageConfigurationService()));
            const model = (0, testTextModel_1.instantiateTextModel)(instantiationService, 'function abc(w)', 'fooLang');
            const result = await provider.provideCompletionItems(model, new position_1.Position(1, 15), { triggerKind: 0 /* CompletionTriggerKind.Invoke */ });
            assert.strictEqual(result.suggestions.length, 0);
            model.dispose();
        });
        test.skip('Snippets disappear with . key #145960', async function () {
            snippetService = new SimpleSnippetService([
                new snippetsFile_1.Snippet(false, ['fooLang'], 'div', 'div', '', 'div', '', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)()),
                new snippetsFile_1.Snippet(false, ['fooLang'], 'div.', 'div.', '', 'div.', '', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)()),
                new snippetsFile_1.Snippet(false, ['fooLang'], 'div#', 'div#', '', 'div#', '', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)()),
            ]);
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.TestLanguageConfigurationService()));
            const model = (0, testTextModel_1.instantiateTextModel)(instantiationService, 'di', 'fooLang');
            const result = await provider.provideCompletionItems(model, new position_1.Position(1, 3), { triggerKind: 0 /* CompletionTriggerKind.Invoke */ });
            assert.strictEqual(result.suggestions.length, 3);
            model.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(1, 3), '.')]);
            assert.strictEqual(model.getValue(), 'di.');
            const result2 = await provider.provideCompletionItems(model, new position_1.Position(1, 4), { triggerKind: 1 /* CompletionTriggerKind.TriggerCharacter */, triggerCharacter: '.' });
            assert.strictEqual(result2.suggestions.length, 1);
            assert.strictEqual(result2.suggestions[0].insertText, 'div.');
            model.dispose();
        });
        test('Hyphen in snippet prefix de-indents snippet #139016', async function () {
            snippetService = new SimpleSnippetService([
                new snippetsFile_1.Snippet(false, ['fooLang'], 'foo', 'Foo- Bar', '', 'Foo', '', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)()),
            ]);
            const model = disposables.add((0, testTextModel_1.instantiateTextModel)(instantiationService, '    bar', 'fooLang'));
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.TestLanguageConfigurationService()));
            const result = await provider.provideCompletionItems(model, new position_1.Position(1, 8), { triggerKind: 0 /* CompletionTriggerKind.Invoke */ });
            assert.strictEqual(result.suggestions.length, 1);
            const first = result.suggestions[0];
            assert.strictEqual(first.range.insert.startColumn, 5);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25pcHBldHNTZXJ2aWNlLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9zbmlwcGV0cy90ZXN0L2Jyb3dzZXIvc25pcHBldHNTZXJ2aWNlLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFpQmhHLE1BQU0sb0JBQW9CO1FBRXpCLFlBQXFCLFFBQW1CO1lBQW5CLGFBQVEsR0FBUixRQUFRLENBQVc7UUFBSSxDQUFDO1FBQzdDLFdBQVc7WUFDVixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUM7UUFDaEQsQ0FBQztRQUNELGVBQWU7WUFDZCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDdEIsQ0FBQztRQUNELGVBQWU7WUFDZCxNQUFNLElBQUksS0FBSyxFQUFFLENBQUM7UUFDbkIsQ0FBQztRQUNELFNBQVM7WUFDUixNQUFNLElBQUksS0FBSyxFQUFFLENBQUM7UUFDbkIsQ0FBQztRQUNELGdCQUFnQjtZQUNmLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQztRQUNuQixDQUFDO1FBQ0Qsb0JBQW9CLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxJQUFJLEtBQUssRUFBRSxDQUFDO1FBQ25CLENBQUM7S0FDRDtJQUVELEtBQUssQ0FBQyxpQkFBaUIsRUFBRTtRQUN4QixNQUFNLE9BQU8sR0FBc0IsRUFBRSxXQUFXLHNDQUE4QixFQUFFLENBQUM7UUFFakYsSUFBSSxXQUE0QixDQUFDO1FBQ2pDLElBQUksb0JBQThDLENBQUM7UUFDbkQsSUFBSSxlQUFpQyxDQUFDO1FBQ3RDLElBQUksY0FBZ0MsQ0FBQztRQUVyQyxLQUFLLENBQUM7WUFDTCxXQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFDcEMsb0JBQW9CLEdBQUcsSUFBQSxtQ0FBbUIsRUFBQyxXQUFX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