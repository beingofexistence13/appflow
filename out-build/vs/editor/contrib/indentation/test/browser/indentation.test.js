/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/languages", "vs/editor/common/languages/language", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/languages/nullTokenize", "vs/editor/contrib/indentation/browser/indentation", "vs/editor/test/browser/testCodeEditor", "vs/editor/test/browser/testCommand", "vs/editor/test/common/modes/supports/javascriptIndentationRules", "vs/editor/test/common/modes/supports/javascriptOnEnterRules", "vs/editor/test/common/testTextModel"], function (require, exports, assert, lifecycle_1, utils_1, range_1, selection_1, languages_1, language_1, languageConfigurationRegistry_1, nullTokenize_1, indentation_1, testCodeEditor_1, testCommand_1, javascriptIndentationRules_1, javascriptOnEnterRules_1, testTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function testIndentationToSpacesCommand(lines, selection, tabSize, expectedLines, expectedSelection) {
        (0, testCommand_1.$30b)(lines, null, selection, (accessor, sel) => new indentation_1.$i9(sel, tabSize), expectedLines, expectedSelection);
    }
    function testIndentationToTabsCommand(lines, selection, tabSize, expectedLines, expectedSelection) {
        (0, testCommand_1.$30b)(lines, null, selection, (accessor, sel) => new indentation_1.$j9(sel, tabSize), expectedLines, expectedSelection);
    }
    suite('Editor Contrib - Indentation to Spaces', () => {
        (0, utils_1.$bT)();
        test('single tabs only at start of line', function () {
            testIndentationToSpacesCommand([
                'first',
                'second line',
                'third line',
                '\tfourth line',
                '\tfifth'
            ], new selection_1.$ms(2, 3, 2, 3), 4, [
                'first',
                'second line',
                'third line',
                '    fourth line',
                '    fifth'
            ], new selection_1.$ms(2, 3, 2, 3));
        });
        test('multiple tabs at start of line', function () {
            testIndentationToSpacesCommand([
                '\t\tfirst',
                '\tsecond line',
                '\t\t\t third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 5, 1, 5), 3, [
                '      first',
                '   second line',
                '          third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 9, 1, 9));
        });
        test('multiple tabs', function () {
            testIndentationToSpacesCommand([
                '\t\tfirst\t',
                '\tsecond  \t line \t',
                '\t\t\t third line',
                ' \tfourth line',
                'fifth'
            ], new selection_1.$ms(1, 5, 1, 5), 2, [
                '    first\t',
                '  second  \t line \t',
                '       third line',
                '   fourth line',
                'fifth'
            ], new selection_1.$ms(1, 7, 1, 7));
        });
        test('empty lines', function () {
            testIndentationToSpacesCommand([
                '\t\t\t',
                '\t',
                '\t\t'
            ], new selection_1.$ms(1, 4, 1, 4), 2, [
                '      ',
                '  ',
                '    '
            ], new selection_1.$ms(1, 4, 1, 4));
        });
    });
    suite('Editor Contrib - Indentation to Tabs', () => {
        (0, utils_1.$bT)();
        test('spaces only at start of line', function () {
            testIndentationToTabsCommand([
                '    first',
                'second line',
                '    third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(2, 3, 2, 3), 4, [
                '\tfirst',
                'second line',
                '\tthird line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(2, 3, 2, 3));
        });
        test('multiple spaces at start of line', function () {
            testIndentationToTabsCommand([
                'first',
                '   second line',
                '          third line',
                'fourth line',
                '     fifth'
            ], new selection_1.$ms(1, 5, 1, 5), 3, [
                'first',
                '\tsecond line',
                '\t\t\t third line',
                'fourth line',
                '\t  fifth'
            ], new selection_1.$ms(1, 5, 1, 5));
        });
        test('multiple spaces', function () {
            testIndentationToTabsCommand([
                '      first   ',
                '  second     line \t',
                '       third line',
                '   fourth line',
                'fifth'
            ], new selection_1.$ms(1, 8, 1, 8), 2, [
                '\t\t\tfirst   ',
                '\tsecond     line \t',
                '\t\t\t third line',
                '\t fourth line',
                'fifth'
            ], new selection_1.$ms(1, 5, 1, 5));
        });
        test('issue #45996', function () {
            testIndentationToSpacesCommand([
                '\tabc',
            ], new selection_1.$ms(1, 3, 1, 3), 4, [
                '    abc',
            ], new selection_1.$ms(1, 6, 1, 6));
        });
    });
    suite('Editor Contrib - Auto Indent On Paste', () => {
        let disposables;
        setup(() => {
            disposables = new lifecycle_1.$jc();
        });
        teardown(() => {
            disposables.dispose();
        });
        (0, utils_1.$bT)();
        test('issue #119225: Do not add extra leading space when pasting JSDoc', () => {
            const languageId = 'leadingSpacePaste';
            const model = (0, testTextModel_1.$O0b)("", languageId, {});
            disposables.add(model);
            (0, testCodeEditor_1.$X0b)(model, { autoIndent: 'full' }, (editor, viewModel, instantiationService) => {
                const languageService = instantiationService.get(language_1.$ct);
                const languageConfigurationService = instantiationService.get(languageConfigurationRegistry_1.$2t);
                disposables.add(languageService.registerLanguage({ id: languageId }));
                disposables.add(languages_1.$bt.register(languageId, {
                    getInitialState: () => nullTokenize_1.$uC,
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
                        return new languages_1.$6s(tokens, state);
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
                    indentationRules: javascriptIndentationRules_1.$60b,
                    onEnterRules: javascriptOnEnterRules_1.$70b
                }));
                const autoIndentOnPasteController = editor.registerAndInstantiateContribution(indentation_1.$h9.ID, indentation_1.$h9);
                const pasteText = [
                    '/**',
                    ' * JSDoc',
                    ' */',
                    'function a() {}'
                ].join('\n');
                viewModel.paste(pasteText, true, undefined, 'keyboard');
                autoIndentOnPasteController.trigger(new range_1.$ks(1, 1, 4, 16));
                assert.strictEqual(model.getValue(), pasteText);
            });
        });
    });
    suite('Editor Contrib - Keep Indent On Paste', () => {
        let disposables;
        setup(() => {
            disposables = new lifecycle_1.$jc();
        });
        teardown(() => {
            disposables.dispose();
        });
        (0, utils_1.$bT)();
        test('issue #167299: Blank line removes indent', () => {
            const languageId = 'blankLineRemovesIndent';
            const model = (0, testTextModel_1.$O0b)("", languageId, {});
            disposables.add(model);
            (0, testCodeEditor_1.$X0b)(model, { autoIndent: 'full' }, (editor, viewModel, instantiationService) => {
                const languageService = instantiationService.get(language_1.$ct);
                const languageConfigurationService = instantiationService.get(languageConfigurationRegistry_1.$2t);
                disposables.add(languageService.registerLanguage({ id: languageId }));
                disposables.add(languageConfigurationService.register(languageId, {
                    brackets: [
                        ['{', '}'],
                        ['[', ']'],
                        ['(', ')']
                    ],
                    indentationRules: javascriptIndentationRules_1.$60b,
                    onEnterRules: javascriptOnEnterRules_1.$70b
                }));
                const autoIndentOnPasteController = editor.registerAndInstantiateContribution(indentation_1.$h9.ID, indentation_1.$h9);
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
                autoIndentOnPasteController.trigger(new range_1.$ks(1, 1, 11, 2));
                assert.strictEqual(model.getValue(), pasteText);
            });
        });
    });
});
//# sourceMappingURL=indentation.test.js.map