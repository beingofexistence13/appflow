/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/languages", "vs/editor/common/languages/language", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/languages/nullTokenize", "vs/editor/contrib/indentation/browser/indentation", "vs/editor/test/browser/testCodeEditor", "vs/editor/test/browser/testCommand", "vs/editor/test/common/modes/supports/javascriptIndentationRules", "vs/editor/test/common/modes/supports/javascriptOnEnterRules", "vs/editor/test/common/testTextModel"], function (require, exports, assert, lifecycle_1, utils_1, range_1, selection_1, languages_1, language_1, languageConfigurationRegistry_1, nullTokenize_1, indentation_1, testCodeEditor_1, testCommand_1, javascriptIndentationRules_1, javascriptOnEnterRules_1, testTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function testIndentationToSpacesCommand(lines, selection, tabSize, expectedLines, expectedSelection) {
        (0, testCommand_1.testCommand)(lines, null, selection, (accessor, sel) => new indentation_1.IndentationToSpacesCommand(sel, tabSize), expectedLines, expectedSelection);
    }
    function testIndentationToTabsCommand(lines, selection, tabSize, expectedLines, expectedSelection) {
        (0, testCommand_1.testCommand)(lines, null, selection, (accessor, sel) => new indentation_1.IndentationToTabsCommand(sel, tabSize), expectedLines, expectedSelection);
    }
    suite('Editor Contrib - Indentation to Spaces', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('single tabs only at start of line', function () {
            testIndentationToSpacesCommand([
                'first',
                'second line',
                'third line',
                '\tfourth line',
                '\tfifth'
            ], new selection_1.Selection(2, 3, 2, 3), 4, [
                'first',
                'second line',
                'third line',
                '    fourth line',
                '    fifth'
            ], new selection_1.Selection(2, 3, 2, 3));
        });
        test('multiple tabs at start of line', function () {
            testIndentationToSpacesCommand([
                '\t\tfirst',
                '\tsecond line',
                '\t\t\t third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 5, 1, 5), 3, [
                '      first',
                '   second line',
                '          third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 9, 1, 9));
        });
        test('multiple tabs', function () {
            testIndentationToSpacesCommand([
                '\t\tfirst\t',
                '\tsecond  \t line \t',
                '\t\t\t third line',
                ' \tfourth line',
                'fifth'
            ], new selection_1.Selection(1, 5, 1, 5), 2, [
                '    first\t',
                '  second  \t line \t',
                '       third line',
                '   fourth line',
                'fifth'
            ], new selection_1.Selection(1, 7, 1, 7));
        });
        test('empty lines', function () {
            testIndentationToSpacesCommand([
                '\t\t\t',
                '\t',
                '\t\t'
            ], new selection_1.Selection(1, 4, 1, 4), 2, [
                '      ',
                '  ',
                '    '
            ], new selection_1.Selection(1, 4, 1, 4));
        });
    });
    suite('Editor Contrib - Indentation to Tabs', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('spaces only at start of line', function () {
            testIndentationToTabsCommand([
                '    first',
                'second line',
                '    third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 3, 2, 3), 4, [
                '\tfirst',
                'second line',
                '\tthird line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 3, 2, 3));
        });
        test('multiple spaces at start of line', function () {
            testIndentationToTabsCommand([
                'first',
                '   second line',
                '          third line',
                'fourth line',
                '     fifth'
            ], new selection_1.Selection(1, 5, 1, 5), 3, [
                'first',
                '\tsecond line',
                '\t\t\t third line',
                'fourth line',
                '\t  fifth'
            ], new selection_1.Selection(1, 5, 1, 5));
        });
        test('multiple spaces', function () {
            testIndentationToTabsCommand([
                '      first   ',
                '  second     line \t',
                '       third line',
                '   fourth line',
                'fifth'
            ], new selection_1.Selection(1, 8, 1, 8), 2, [
                '\t\t\tfirst   ',
                '\tsecond     line \t',
                '\t\t\t third line',
                '\t fourth line',
                'fifth'
            ], new selection_1.Selection(1, 5, 1, 5));
        });
        test('issue #45996', function () {
            testIndentationToSpacesCommand([
                '\tabc',
            ], new selection_1.Selection(1, 3, 1, 3), 4, [
                '    abc',
            ], new selection_1.Selection(1, 6, 1, 6));
        });
    });
    suite('Editor Contrib - Auto Indent On Paste', () => {
        let disposables;
        setup(() => {
            disposables = new lifecycle_1.DisposableStore();
        });
        teardown(() => {
            disposables.dispose();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('issue #119225: Do not add extra leading space when pasting JSDoc', () => {
            const languageId = 'leadingSpacePaste';
            const model = (0, testTextModel_1.createTextModel)("", languageId, {});
            disposables.add(model);
            (0, testCodeEditor_1.withTestCodeEditor)(model, { autoIndent: 'full' }, (editor, viewModel, instantiationService) => {
                const languageService = instantiationService.get(language_1.ILanguageService);
                const languageConfigurationService = instantiationService.get(languageConfigurationRegistry_1.ILanguageConfigurationService);
                disposables.add(languageService.registerLanguage({ id: languageId }));
                disposables.add(languages_1.TokenizationRegistry.register(languageId, {
                    getInitialState: () => nullTokenize_1.NullState,
                    tokenize: () => {
                        throw new Error('not implemented');
                    },
                    tokenizeEncoded: (line, hasEOL, state) => {
                        const tokensArr = [];
                        if (line.indexOf('*') !== -1) {
                            tokensArr.push(0);
                            tokensArr.push(1 /* StandardTokenType.Comment */ << 8 /* MetadataConsts.TOKEN_TYPE_OFFSET */);
                        }
                        else {
                            tokensArr.push(0);
                            tokensArr.push(0 /* StandardTokenType.Other */ << 8 /* MetadataConsts.TOKEN_TYPE_OFFSET */);
                        }
                        const tokens = new Uint32Array(tokensArr.length);
                        for (let i = 0; i < tokens.length; i++) {
                            tokens[i] = tokensArr[i];
                        }
                        return new languages_1.EncodedTokenizationResult(tokens, state);
                    }
                }));
                disposables.add(languageConfigurationService.register(languageId, {
                    brackets: [
                        ['{', '}'],
                        ['[', ']'],
                        ['(', ')']
                    ],
                    comments: {
                        lineComment: '//',
                        blockComment: ['/*', '*/']
                    },
                    indentationRules: javascriptIndentationRules_1.javascriptIndentationRules,
                    onEnterRules: javascriptOnEnterRules_1.javascriptOnEnterRules
                }));
                const autoIndentOnPasteController = editor.registerAndInstantiateContribution(indentation_1.AutoIndentOnPaste.ID, indentation_1.AutoIndentOnPaste);
                const pasteText = [
                    '/**',
                    ' * JSDoc',
                    ' */',
                    'function a() {}'
                ].join('\n');
                viewModel.paste(pasteText, true, undefined, 'keyboard');
                autoIndentOnPasteController.trigger(new range_1.Range(1, 1, 4, 16));
                assert.strictEqual(model.getValue(), pasteText);
            });
        });
    });
    suite('Editor Contrib - Keep Indent On Paste', () => {
        let disposables;
        setup(() => {
            disposables = new lifecycle_1.DisposableStore();
        });
        teardown(() => {
            disposables.dispose();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('issue #167299: Blank line removes indent', () => {
            const languageId = 'blankLineRemovesIndent';
            const model = (0, testTextModel_1.createTextModel)("", languageId, {});
            disposables.add(model);
            (0, testCodeEditor_1.withTestCodeEditor)(model, { autoIndent: 'full' }, (editor, viewModel, instantiationService) => {
                const languageService = instantiationService.get(language_1.ILanguageService);
                const languageConfigurationService = instantiationService.get(languageConfigurationRegistry_1.ILanguageConfigurationService);
                disposables.add(languageService.registerLanguage({ id: languageId }));
                disposables.add(languageConfigurationService.register(languageId, {
                    brackets: [
                        ['{', '}'],
                        ['[', ']'],
                        ['(', ')']
                    ],
                    indentationRules: javascriptIndentationRules_1.javascriptIndentationRules,
                    onEnterRules: javascriptOnEnterRules_1.javascriptOnEnterRules
                }));
                const autoIndentOnPasteController = editor.registerAndInstantiateContribution(indentation_1.AutoIndentOnPaste.ID, indentation_1.AutoIndentOnPaste);
                const pasteText = [
                    '',
                    'export type IncludeReference =',
                    '	| BaseReference',
                    '	| SelfReference',
                    '	| RelativeReference;',
                    '',
                    'export const enum IncludeReferenceKind {',
                    '	Base,',
                    '	Self,',
                    '	RelativeReference,',
                    '}'
                ].join('\n');
                viewModel.paste(pasteText, true, undefined, 'keyboard');
                autoIndentOnPasteController.trigger(new range_1.Range(1, 1, 11, 2));
                assert.strictEqual(model.getValue(), pasteText);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZW50YXRpb24udGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2luZGVudGF0aW9uL3Rlc3QvYnJvd3Nlci9pbmRlbnRhdGlvbi50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBbUJoRyxTQUFTLDhCQUE4QixDQUFDLEtBQWUsRUFBRSxTQUFvQixFQUFFLE9BQWUsRUFBRSxhQUF1QixFQUFFLGlCQUE0QjtRQUNwSixJQUFBLHlCQUFXLEVBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxJQUFJLHdDQUEwQixDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsRUFBRSxhQUFhLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztJQUN4SSxDQUFDO0lBRUQsU0FBUyw0QkFBNEIsQ0FBQyxLQUFlLEVBQUUsU0FBb0IsRUFBRSxPQUFlLEVBQUUsYUFBdUIsRUFBRSxpQkFBNEI7UUFDbEosSUFBQSx5QkFBVyxFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsSUFBSSxzQ0FBd0IsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLEVBQUUsYUFBYSxFQUFFLGlCQUFpQixDQUFDLENBQUM7SUFDdEksQ0FBQztJQUVELEtBQUssQ0FBQyx3Q0FBd0MsRUFBRSxHQUFHLEVBQUU7UUFFcEQsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRTFDLElBQUksQ0FBQyxtQ0FBbUMsRUFBRTtZQUN6Qyw4QkFBOEIsQ0FDN0I7Z0JBQ0MsT0FBTztnQkFDUCxhQUFhO2dCQUNiLFlBQVk7Z0JBQ1osZUFBZTtnQkFDZixTQUFTO2FBQ1QsRUFDRCxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFD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