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
            disposables = new lifecycle_1.$jc();
            instantiationService = (0, testTextModel_1.$Q0b)(disposables);
            languageService = instantiationService.get(language_1.$ct);
            disposables.add(languageService.registerLanguage({
                id: 'fooLang',
                extensions: ['.fooLang',]
            }));
            snippetService = new SimpleSnippetService([new snippetsFile_1.$$lb(false, ['fooLang'], 'barTest', 'bar', '', 'barCodeSnippet', '', 1 /* SnippetSource.User */, (0, uuid_1.$4f)()), new snippetsFile_1.$$lb(false, ['fooLang'], 'bazzTest', 'bazz', '', 'bazzCodeSnippet', '', 1 /* SnippetSource.User */, (0, uuid_1.$4f)())]);
        });
        teardown(() => {
            disposables.dispose();
        });
        (0, utils_1.$bT)();
        test('snippet completions - simple', function () {
            const provider = new snippetCompletionProvider_1.$nmb(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.$D0b()));
            const model = disposables.add((0, testTextModel_1.$P0b)(instantiationService, '', 'fooLang'));
            return provider.provideCompletionItems(model, new position_1.$js(1, 1), context).then(result => {
                assert.strictEqual(result.incomplete, undefined);
                assert.strictEqual(result.suggestions.length, 2);
            });
        });
        test('snippet completions - simple 2', async function () {
            const provider = new snippetCompletionProvider_1.$nmb(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.$D0b()));
            const model = disposables.add((0, testTextModel_1.$P0b)(instantiationService, 'hello ', 'fooLang'));
            await provider.provideCompletionItems(model, new position_1.$js(1, 6) /* hello| */, context).then(result => {
                assert.strictEqual(result.incomplete, undefined);
                assert.strictEqual(result.suggestions.length, 0);
            });
            await provider.provideCompletionItems(model, new position_1.$js(1, 7) /* hello |*/, context).then(result => {
                assert.strictEqual(result.incomplete, undefined);
                assert.strictEqual(result.suggestions.length, 2);
            });
        });
        test('snippet completions - with prefix', function () {
            const provider = new snippetCompletionProvider_1.$nmb(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.$D0b()));
            const model = disposables.add((0, testTextModel_1.$P0b)(instantiationService, 'bar', 'fooLang'));
            return provider.provideCompletionItems(model, new position_1.$js(1, 4), context).then(result => {
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
            snippetService = new SimpleSnippetService([new snippetsFile_1.$$lb(false, ['fooLang'], 'barTest', 'bar', '', 's1', '', 1 /* SnippetSource.User */, (0, uuid_1.$4f)()), new snippetsFile_1.$$lb(false, ['fooLang'], 'name', 'bar-bar', '', 's2', '', 1 /* SnippetSource.User */, (0, uuid_1.$4f)())]);
            const provider = new snippetCompletionProvider_1.$nmb(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.$D0b()));
            const model = disposables.add((0, testTextModel_1.$P0b)(instantiationService, 'bar-bar', 'fooLang'));
            await provider.provideCompletionItems(model, new position_1.$js(1, 3), context).then(result => {
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
            await provider.provideCompletionItems(model, new position_1.$js(1, 5), context).then(result => {
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
            await provider.provideCompletionItems(model, new position_1.$js(1, 6), context).then(result => {
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
            snippetService = new SimpleSnippetService([new snippetsFile_1.$$lb(false, ['fooLang'], '', '<?php', '', 'insert me', '', 1 /* SnippetSource.User */, (0, uuid_1.$4f)())]);
            const provider = new snippetCompletionProvider_1.$nmb(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.$D0b()));
            let model = (0, testTextModel_1.$P0b)(instantiationService, '\t<?php', 'fooLang');
            return provider.provideCompletionItems(model, new position_1.$js(1, 7), context).then(result => {
                assert.strictEqual(result.suggestions.length, 1);
                model.dispose();
                model = (0, testTextModel_1.$P0b)(instantiationService, '\t<?', 'fooLang');
                return provider.provideCompletionItems(model, new position_1.$js(1, 4), context);
            }).then(result => {
                assert.strictEqual(result.suggestions.length, 1);
                assert.strictEqual(result.suggestions[0].range.insert.startColumn, 2);
                model.dispose();
                model = (0, testTextModel_1.$P0b)(instantiationService, 'a<?', 'fooLang');
                return provider.provideCompletionItems(model, new position_1.$js(1, 4), context);
            }).then(result => {
                assert.strictEqual(result.suggestions.length, 1);
                assert.strictEqual(result.suggestions[0].range.insert.startColumn, 2);
                model.dispose();
            });
        });
        test('No user snippets in suggestions, when inside the code, #30508', function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.$$lb(false, ['fooLang'], '', 'foo', '', '<foo>$0</foo>', '', 1 /* SnippetSource.User */, (0, uuid_1.$4f)())]);
            const provider = new snippetCompletionProvider_1.$nmb(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.$D0b()));
            const model = disposables.add((0, testTextModel_1.$P0b)(instantiationService, '<head>\n\t\n>/head>', 'fooLang'));
            return provider.provideCompletionItems(model, new position_1.$js(1, 1), context).then(result => {
                assert.strictEqual(result.suggestions.length, 1);
                return provider.provideCompletionItems(model, new position_1.$js(2, 2), context);
            }).then(result => {
                assert.strictEqual(result.suggestions.length, 1);
            });
        });
        test('SnippetSuggest - ensure extension snippets come last ', function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.$$lb(false, ['fooLang'], 'second', 'second', '', 'second', '', 3 /* SnippetSource.Extension */, (0, uuid_1.$4f)()), new snippetsFile_1.$$lb(false, ['fooLang'], 'first', 'first', '', 'first', '', 1 /* SnippetSource.User */, (0, uuid_1.$4f)())]);
            const provider = new snippetCompletionProvider_1.$nmb(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.$D0b()));
            const model = disposables.add((0, testTextModel_1.$P0b)(instantiationService, '', 'fooLang'));
            return provider.provideCompletionItems(model, new position_1.$js(1, 1), context).then(result => {
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
            snippetService = new SimpleSnippetService([new snippetsFile_1.$$lb(false, ['fooLang'], 'p-a', 'p-a', '', 'second', '', 1 /* SnippetSource.User */, (0, uuid_1.$4f)())]);
            const provider = new snippetCompletionProvider_1.$nmb(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.$D0b()));
            const model = disposables.add((0, testTextModel_1.$P0b)(instantiationService, 'p-', 'fooLang'));
            let result = await provider.provideCompletionItems(model, new position_1.$js(1, 2), context);
            assert.strictEqual(result.suggestions.length, 1);
            result = await provider.provideCompletionItems(model, new position_1.$js(1, 3), context);
            assert.strictEqual(result.suggestions.length, 1);
            result = await provider.provideCompletionItems(model, new position_1.$js(1, 3), context);
            assert.strictEqual(result.suggestions.length, 1);
        });
        test('No snippets suggestion on long lines beyond character 100 #58807', async function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.$$lb(false, ['fooLang'], 'bug', 'bug', '', 'second', '', 1 /* SnippetSource.User */, (0, uuid_1.$4f)())]);
            const provider = new snippetCompletionProvider_1.$nmb(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.$D0b()));
            const model = disposables.add((0, testTextModel_1.$P0b)(instantiationService, 'Thisisaverylonglinegoingwithmore100bcharactersandthismakesintellisensebecomea Thisisaverylonglinegoingwithmore100bcharactersandthismakesintellisensebecomea b', 'fooLang'));
            const result = await provider.provideCompletionItems(model, new position_1.$js(1, 158), context);
            assert.strictEqual(result.suggestions.length, 1);
        });
        test('Type colon will trigger snippet #60746', async function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.$$lb(false, ['fooLang'], 'bug', 'bug', '', 'second', '', 1 /* SnippetSource.User */, (0, uuid_1.$4f)())]);
            const provider = new snippetCompletionProvider_1.$nmb(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.$D0b()));
            const model = disposables.add((0, testTextModel_1.$P0b)(instantiationService, ':', 'fooLang'));
            const result = await provider.provideCompletionItems(model, new position_1.$js(1, 2), context);
            assert.strictEqual(result.suggestions.length, 0);
        });
        test('substring of prefix can\'t trigger snippet #60737', async function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.$$lb(false, ['fooLang'], 'mytemplate', 'mytemplate', '', 'second', '', 1 /* SnippetSource.User */, (0, uuid_1.$4f)())]);
            const provider = new snippetCompletionProvider_1.$nmb(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.$D0b()));
            const model = disposables.add((0, testTextModel_1.$P0b)(instantiationService, 'template', 'fooLang'));
            const result = await provider.provideCompletionItems(model, new position_1.$js(1, 9), context);
            assert.strictEqual(result.suggestions.length, 1);
            assert.deepStrictEqual(result.suggestions[0].label, {
                label: 'mytemplate',
                description: 'mytemplate'
            });
        });
        test('No snippets suggestion beyond character 100 if not at end of line #60247', async function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.$$lb(false, ['fooLang'], 'bug', 'bug', '', 'second', '', 1 /* SnippetSource.User */, (0, uuid_1.$4f)())]);
            const provider = new snippetCompletionProvider_1.$nmb(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.$D0b()));
            const model = disposables.add((0, testTextModel_1.$P0b)(instantiationService, 'Thisisaverylonglinegoingwithmore100bcharactersandthismakesintellisensebecomea Thisisaverylonglinegoingwithmore100bcharactersandthismakesintellisensebecomea b text_after_b', 'fooLang'));
            const result = await provider.provideCompletionItems(model, new position_1.$js(1, 158), context);
            assert.strictEqual(result.suggestions.length, 1);
        });
        test('issue #61296: VS code freezes when editing CSS file with emoji', async function () {
            const languageConfigurationService = disposables.add(new testLanguageConfigurationService_1.$D0b());
            disposables.add(languageConfigurationService.register('fooLang', {
                wordPattern: /(#?-?\d*\.\d\w*%?)|(::?[\w-]*(?=[^,{;]*[,{]))|(([@#.!])?[\w-?]+%?|[@#!.])/g
            }));
            snippetService = new SimpleSnippetService([new snippetsFile_1.$$lb(false, ['fooLang'], 'bug', '-a-bug', '', 'second', '', 1 /* SnippetSource.User */, (0, uuid_1.$4f)())]);
            const provider = new snippetCompletionProvider_1.$nmb(languageService, snippetService, languageConfigurationService);
            const model = disposables.add((0, testTextModel_1.$P0b)(instantiationService, '.🐷-a-b', 'fooLang'));
            const result = await provider.provideCompletionItems(model, new position_1.$js(1, 8), context);
            assert.strictEqual(result.suggestions.length, 1);
        });
        test('No snippets shown when triggering completions at whitespace on line that already has text #62335', async function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.$$lb(false, ['fooLang'], 'bug', 'bug', '', 'second', '', 1 /* SnippetSource.User */, (0, uuid_1.$4f)())]);
            const provider = new snippetCompletionProvider_1.$nmb(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.$D0b()));
            const model = disposables.add((0, testTextModel_1.$P0b)(instantiationService, 'a ', 'fooLang'));
            const result = await provider.provideCompletionItems(model, new position_1.$js(1, 3), context);
            assert.strictEqual(result.suggestions.length, 1);
        });
        test('Snippet prefix with special chars and numbers does not work #62906', async function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.$$lb(false, ['fooLang'], 'noblockwdelay', '<<', '', '<= #dly"', '', 1 /* SnippetSource.User */, (0, uuid_1.$4f)()), new snippetsFile_1.$$lb(false, ['fooLang'], 'noblockwdelay', '11', '', 'eleven', '', 1 /* SnippetSource.User */, (0, uuid_1.$4f)())]);
            const provider = new snippetCompletionProvider_1.$nmb(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.$D0b()));
            let model = (0, testTextModel_1.$P0b)(instantiationService, ' <', 'fooLang');
            let result = await provider.provideCompletionItems(model, new position_1.$js(1, 3), context);
            assert.strictEqual(result.suggestions.length, 1);
            let [first] = result.suggestions;
            assert.strictEqual(first.range.insert.startColumn, 2);
            model.dispose();
            model = (0, testTextModel_1.$P0b)(instantiationService, '1', 'fooLang');
            result = await provider.provideCompletionItems(model, new position_1.$js(1, 2), context);
            assert.strictEqual(result.suggestions.length, 1);
            [first] = result.suggestions;
            assert.strictEqual(first.range.insert.startColumn, 1);
            model.dispose();
        });
        test('Snippet replace range', async function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.$$lb(false, ['fooLang'], 'notWordTest', 'not word', '', 'not word snippet', '', 1 /* SnippetSource.User */, (0, uuid_1.$4f)())]);
            const provider = new snippetCompletionProvider_1.$nmb(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.$D0b()));
            let model = (0, testTextModel_1.$P0b)(instantiationService, 'not wordFoo bar', 'fooLang');
            let result = await provider.provideCompletionItems(model, new position_1.$js(1, 3), context);
            assert.strictEqual(result.suggestions.length, 1);
            let [first] = result.suggestions;
            assert.strictEqual(first.range.insert.endColumn, 3);
            assert.strictEqual(first.range.replace.endColumn, 9);
            model.dispose();
            model = (0, testTextModel_1.$P0b)(instantiationService, 'not woFoo bar', 'fooLang');
            result = await provider.provideCompletionItems(model, new position_1.$js(1, 3), context);
            assert.strictEqual(result.suggestions.length, 1);
            [first] = result.suggestions;
            assert.strictEqual(first.range.insert.endColumn, 3);
            assert.strictEqual(first.range.replace.endColumn, 3);
            model.dispose();
            model = (0, testTextModel_1.$P0b)(instantiationService, 'not word', 'fooLang');
            result = await provider.provideCompletionItems(model, new position_1.$js(1, 1), context);
            assert.strictEqual(result.suggestions.length, 1);
            [first] = result.suggestions;
            assert.strictEqual(first.range.insert.endColumn, 1);
            assert.strictEqual(first.range.replace.endColumn, 9);
            model.dispose();
        });
        test('Snippet replace-range incorrect #108894', async function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.$$lb(false, ['fooLang'], 'eng', 'eng', '', '<span></span>', '', 1 /* SnippetSource.User */, (0, uuid_1.$4f)())]);
            const provider = new snippetCompletionProvider_1.$nmb(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.$D0b()));
            const model = (0, testTextModel_1.$P0b)(instantiationService, 'filler e KEEP ng filler', 'fooLang');
            const result = await provider.provideCompletionItems(model, new position_1.$js(1, 9), context);
            assert.strictEqual(result.suggestions.length, 1);
            const [first] = result.suggestions;
            assert.strictEqual(first.range.insert.endColumn, 9);
            assert.strictEqual(first.range.replace.endColumn, 9);
            model.dispose();
        });
        test('Snippet will replace auto-closing pair if specified in prefix', async function () {
            const languageConfigurationService = disposables.add(new testLanguageConfigurationService_1.$D0b());
            disposables.add(languageConfigurationService.register('fooLang', {
                brackets: [
                    ['{', '}'],
                    ['[', ']'],
                    ['(', ')'],
                ]
            }));
            snippetService = new SimpleSnippetService([new snippetsFile_1.$$lb(false, ['fooLang'], 'PSCustomObject', '[PSCustomObject]', '', '[PSCustomObject] @{ Key = Value }', '', 1 /* SnippetSource.User */, (0, uuid_1.$4f)())]);
            const provider = new snippetCompletionProvider_1.$nmb(languageService, snippetService, languageConfigurationService);
            const model = (0, testTextModel_1.$P0b)(instantiationService, '[psc]', 'fooLang');
            const result = await provider.provideCompletionItems(model, new position_1.$js(1, 5), context);
            assert.strictEqual(result.suggestions.length, 1);
            const [first] = result.suggestions;
            assert.strictEqual(first.range.insert.endColumn, 5);
            // This is 6 because it should eat the `]` at the end of the text even if cursor is before it
            assert.strictEqual(first.range.replace.endColumn, 6);
            model.dispose();
        });
        test('Leading whitespace in snippet prefix #123860', async function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.$$lb(false, ['fooLang'], 'cite-name', ' cite', '', '~\\cite{$CLIPBOARD}', '', 1 /* SnippetSource.User */, (0, uuid_1.$4f)())]);
            const provider = new snippetCompletionProvider_1.$nmb(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.$D0b()));
            const model = (0, testTextModel_1.$P0b)(instantiationService, ' ci', 'fooLang');
            const result = await provider.provideCompletionItems(model, new position_1.$js(1, 4), context);
            assert.strictEqual(result.suggestions.length, 1);
            const [first] = result.suggestions;
            assert.strictEqual(first.label.label, ' cite');
            assert.strictEqual(first.range.insert.startColumn, 1);
            model.dispose();
        });
        test('still show suggestions in string when disable string suggestion #136611', async function () {
            snippetService = new SimpleSnippetService([
                new snippetsFile_1.$$lb(false, ['fooLang'], 'aaa', 'aaa', '', 'value', '', 1 /* SnippetSource.User */, (0, uuid_1.$4f)()),
                new snippetsFile_1.$$lb(false, ['fooLang'], 'bbb', 'bbb', '', 'value', '', 1 /* SnippetSource.User */, (0, uuid_1.$4f)()),
                // new Snippet(['fooLang'], '\'ccc', '\'ccc', '', 'value', '', SnippetSource.User, generateUuid())
            ]);
            const provider = new snippetCompletionProvider_1.$nmb(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.$D0b()));
            const model = (0, testTextModel_1.$P0b)(instantiationService, '\'\'', 'fooLang');
            const result = await provider.provideCompletionItems(model, new position_1.$js(1, 2), { triggerKind: 1 /* CompletionTriggerKind.TriggerCharacter */, triggerCharacter: '\'' });
            assert.strictEqual(result.suggestions.length, 0);
            model.dispose();
        });
        test('still show suggestions in string when disable string suggestion #136611 (part 2)', async function () {
            snippetService = new SimpleSnippetService([
                new snippetsFile_1.$$lb(false, ['fooLang'], 'aaa', 'aaa', '', 'value', '', 1 /* SnippetSource.User */, (0, uuid_1.$4f)()),
                new snippetsFile_1.$$lb(false, ['fooLang'], 'bbb', 'bbb', '', 'value', '', 1 /* SnippetSource.User */, (0, uuid_1.$4f)()),
                new snippetsFile_1.$$lb(false, ['fooLang'], '\'ccc', '\'ccc', '', 'value', '', 1 /* SnippetSource.User */, (0, uuid_1.$4f)())
            ]);
            const provider = new snippetCompletionProvider_1.$nmb(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.$D0b()));
            const model = (0, testTextModel_1.$P0b)(instantiationService, '\'\'', 'fooLang');
            const result = await provider.provideCompletionItems(model, new position_1.$js(1, 2), { triggerKind: 1 /* CompletionTriggerKind.TriggerCharacter */, triggerCharacter: '\'' });
            assert.strictEqual(result.suggestions.length, 1);
            model.dispose();
        });
        test('Snippet suggestions are too eager #138707 (word)', async function () {
            snippetService = new SimpleSnippetService([
                new snippetsFile_1.$$lb(false, ['fooLang'], 'tys', 'tys', '', 'value', '', 1 /* SnippetSource.User */, (0, uuid_1.$4f)()),
                new snippetsFile_1.$$lb(false, ['fooLang'], 'hell_or_tell', 'hell_or_tell', '', 'value', '', 1 /* SnippetSource.User */, (0, uuid_1.$4f)()),
                new snippetsFile_1.$$lb(false, ['fooLang'], '^y', '^y', '', 'value', '', 1 /* SnippetSource.User */, (0, uuid_1.$4f)()),
            ]);
            const provider = new snippetCompletionProvider_1.$nmb(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.$D0b()));
            const model = (0, testTextModel_1.$P0b)(instantiationService, '\'hellot\'', 'fooLang');
            const result = await provider.provideCompletionItems(model, new position_1.$js(1, 8), { triggerKind: 0 /* CompletionTriggerKind.Invoke */ });
            assert.strictEqual(result.suggestions.length, 1);
            assert.strictEqual(result.suggestions[0].label.label, 'hell_or_tell');
            model.dispose();
        });
        test('Snippet suggestions are too eager #138707 (no word)', async function () {
            snippetService = new SimpleSnippetService([
                new snippetsFile_1.$$lb(false, ['fooLang'], 'tys', 'tys', '', 'value', '', 1 /* SnippetSource.User */, (0, uuid_1.$4f)()),
                new snippetsFile_1.$$lb(false, ['fooLang'], 't', 't', '', 'value', '', 1 /* SnippetSource.User */, (0, uuid_1.$4f)()),
                new snippetsFile_1.$$lb(false, ['fooLang'], '^y', '^y', '', 'value', '', 1 /* SnippetSource.User */, (0, uuid_1.$4f)()),
            ]);
            const provider = new snippetCompletionProvider_1.$nmb(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.$D0b()));
            const model = (0, testTextModel_1.$P0b)(instantiationService, ')*&^', 'fooLang');
            const result = await provider.provideCompletionItems(model, new position_1.$js(1, 5), { triggerKind: 0 /* CompletionTriggerKind.Invoke */ });
            assert.strictEqual(result.suggestions.length, 1);
            assert.strictEqual(result.suggestions[0].label.label, '^y');
            model.dispose();
        });
        test('Snippet suggestions are too eager #138707 (word/word)', async function () {
            snippetService = new SimpleSnippetService([
                new snippetsFile_1.$$lb(false, ['fooLang'], 'async arrow function', 'async arrow function', '', 'value', '', 1 /* SnippetSource.User */, (0, uuid_1.$4f)()),
                new snippetsFile_1.$$lb(false, ['fooLang'], 'foobarrrrrr', 'foobarrrrrr', '', 'value', '', 1 /* SnippetSource.User */, (0, uuid_1.$4f)()),
            ]);
            const provider = new snippetCompletionProvider_1.$nmb(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.$D0b()));
            const model = (0, testTextModel_1.$P0b)(instantiationService, 'foobar', 'fooLang');
            const result = await provider.provideCompletionItems(model, new position_1.$js(1, 7), { triggerKind: 0 /* CompletionTriggerKind.Invoke */ });
            assert.strictEqual(result.suggestions.length, 1);
            assert.strictEqual(result.suggestions[0].label.label, 'foobarrrrrr');
            model.dispose();
        });
        test('Strange and useless autosuggestion #region/#endregion PHP #140039', async function () {
            snippetService = new SimpleSnippetService([
                new snippetsFile_1.$$lb(false, ['fooLang'], 'reg', '#region', '', 'value', '', 1 /* SnippetSource.User */, (0, uuid_1.$4f)()),
            ]);
            const provider = new snippetCompletionProvider_1.$nmb(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.$D0b()));
            const model = (0, testTextModel_1.$P0b)(instantiationService, 'function abc(w)', 'fooLang');
            const result = await provider.provideCompletionItems(model, new position_1.$js(1, 15), { triggerKind: 0 /* CompletionTriggerKind.Invoke */ });
            assert.strictEqual(result.suggestions.length, 0);
            model.dispose();
        });
        test.skip('Snippets disappear with . key #145960', async function () {
            snippetService = new SimpleSnippetService([
                new snippetsFile_1.$$lb(false, ['fooLang'], 'div', 'div', '', 'div', '', 1 /* SnippetSource.User */, (0, uuid_1.$4f)()),
                new snippetsFile_1.$$lb(false, ['fooLang'], 'div.', 'div.', '', 'div.', '', 1 /* SnippetSource.User */, (0, uuid_1.$4f)()),
                new snippetsFile_1.$$lb(false, ['fooLang'], 'div#', 'div#', '', 'div#', '', 1 /* SnippetSource.User */, (0, uuid_1.$4f)()),
            ]);
            const provider = new snippetCompletionProvider_1.$nmb(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.$D0b()));
            const model = (0, testTextModel_1.$P0b)(instantiationService, 'di', 'fooLang');
            const result = await provider.provideCompletionItems(model, new position_1.$js(1, 3), { triggerKind: 0 /* CompletionTriggerKind.Invoke */ });
            assert.strictEqual(result.suggestions.length, 3);
            model.applyEdits([editOperation_1.$ls.insert(new position_1.$js(1, 3), '.')]);
            assert.strictEqual(model.getValue(), 'di.');
            const result2 = await provider.provideCompletionItems(model, new position_1.$js(1, 4), { triggerKind: 1 /* CompletionTriggerKind.TriggerCharacter */, triggerCharacter: '.' });
            assert.strictEqual(result2.suggestions.length, 1);
            assert.strictEqual(result2.suggestions[0].insertText, 'div.');
            model.dispose();
        });
        test('Hyphen in snippet prefix de-indents snippet #139016', async function () {
            snippetService = new SimpleSnippetService([
                new snippetsFile_1.$$lb(false, ['fooLang'], 'foo', 'Foo- Bar', '', 'Foo', '', 1 /* SnippetSource.User */, (0, uuid_1.$4f)()),
            ]);
            const model = disposables.add((0, testTextModel_1.$P0b)(instantiationService, '    bar', 'fooLang'));
            const provider = new snippetCompletionProvider_1.$nmb(languageService, snippetService, disposables.add(new testLanguageConfigurationService_1.$D0b()));
            const result = await provider.provideCompletionItems(model, new position_1.$js(1, 8), { triggerKind: 0 /* CompletionTriggerKind.Invoke */ });
            assert.strictEqual(result.suggestions.length, 1);
            const first = result.suggestions[0];
            assert.strictEqual(first.range.insert.startColumn, 5);
        });
    });
});
//# sourceMappingURL=snippetsService.test.js.map