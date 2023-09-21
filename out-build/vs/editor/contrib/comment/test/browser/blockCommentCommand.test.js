/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/test/common/utils", "vs/editor/common/core/selection", "vs/editor/common/languages/language", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/contrib/comment/browser/blockCommentCommand", "vs/editor/test/browser/testCommand"], function (require, exports, utils_1, selection_1, language_1, languageConfigurationRegistry_1, blockCommentCommand_1, testCommand_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function _testCommentCommand(lines, selection, commandFactory, expectedLines, expectedSelection) {
        const languageId = 'commentMode';
        const prepare = (accessor, disposables) => {
            const languageConfigurationService = accessor.get(languageConfigurationRegistry_1.$2t);
            const languageService = accessor.get(language_1.$ct);
            disposables.add(languageService.registerLanguage({ id: languageId }));
            disposables.add(languageConfigurationService.register(languageId, {
                comments: { lineComment: '!@#', blockComment: ['<0', '0>'] }
            }));
        };
        (0, testCommand_1.$30b)(lines, languageId, selection, commandFactory, expectedLines, expectedSelection, undefined, prepare);
    }
    function testBlockCommentCommand(lines, selection, expectedLines, expectedSelection) {
        _testCommentCommand(lines, selection, (accessor, sel) => new blockCommentCommand_1.$V6(sel, true, accessor.get(languageConfigurationRegistry_1.$2t)), expectedLines, expectedSelection);
    }
    suite('Editor Contrib - Block Comment Command', () => {
        (0, utils_1.$bT)();
        test('empty selection wraps itself', function () {
            testBlockCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 3, 1, 3), [
                'fi<0  0>rst',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 6, 1, 6));
        });
        test('invisible selection ignored', function () {
            testBlockCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(2, 1, 1, 1), [
                '<0 first',
                ' 0>\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 4, 2, 1));
        });
        test('bug9511', () => {
            testBlockCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 6, 1, 1), [
                '<0 first 0>',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 4, 1, 9));
            testBlockCommentCommand([
                '<0first0>',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 8, 1, 3), [
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 1, 1, 6));
        });
        test('one line selection', function () {
            testBlockCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 6, 1, 3), [
                'fi<0 rst 0>',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 6, 1, 9));
        });
        test('one line selection toggle', function () {
            testBlockCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 6, 1, 3), [
                'fi<0 rst 0>',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 6, 1, 9));
            testBlockCommentCommand([
                'fi<0rst0>',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 8, 1, 5), [
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 3, 1, 6));
            testBlockCommentCommand([
                '<0 first 0>',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 10, 1, 1), [
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 1, 1, 6));
            testBlockCommentCommand([
                '<0 first0>',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 9, 1, 1), [
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 1, 1, 6));
            testBlockCommentCommand([
                '<0first 0>',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 9, 1, 1), [
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 1, 1, 6));
            testBlockCommentCommand([
                'fi<0rst0>',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 8, 1, 5), [
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 3, 1, 6));
        });
        test('multi line selection', function () {
            testBlockCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(2, 4, 1, 1), [
                '<0 first',
                '\tse 0>cond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 4, 2, 4));
        });
        test('multi line selection toggle', function () {
            testBlockCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(2, 4, 1, 1), [
                '<0 first',
                '\tse 0>cond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 4, 2, 4));
            testBlockCommentCommand([
                '<0first',
                '\tse0>cond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(2, 4, 1, 3), [
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 1, 2, 4));
            testBlockCommentCommand([
                '<0 first',
                '\tse0>cond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(2, 4, 1, 3), [
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 1, 2, 4));
            testBlockCommentCommand([
                '<0first',
                '\tse 0>cond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(2, 4, 1, 3), [
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 1, 2, 4));
            testBlockCommentCommand([
                '<0 first',
                '\tse 0>cond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(2, 4, 1, 3), [
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 1, 2, 4));
        });
        test('fuzzy removes', function () {
            testBlockCommentCommand([
                'asd <0 qwe',
                'asd 0> qwe'
            ], new selection_1.$ms(2, 5, 1, 7), [
                'asd qwe',
                'asd qwe'
            ], new selection_1.$ms(1, 5, 2, 4));
            testBlockCommentCommand([
                'asd <0 qwe',
                'asd 0> qwe'
            ], new selection_1.$ms(2, 5, 1, 6), [
                'asd qwe',
                'asd qwe'
            ], new selection_1.$ms(1, 5, 2, 4));
            testBlockCommentCommand([
                'asd <0 qwe',
                'asd 0> qwe'
            ], new selection_1.$ms(2, 5, 1, 5), [
                'asd qwe',
                'asd qwe'
            ], new selection_1.$ms(1, 5, 2, 4));
            testBlockCommentCommand([
                'asd <0 qwe',
                'asd 0> qwe'
            ], new selection_1.$ms(2, 5, 1, 11), [
                'asd qwe',
                'asd qwe'
            ], new selection_1.$ms(1, 5, 2, 4));
            testBlockCommentCommand([
                'asd <0 qwe',
                'asd 0> qwe'
            ], new selection_1.$ms(2, 1, 1, 11), [
                'asd qwe',
                'asd qwe'
            ], new selection_1.$ms(1, 5, 2, 4));
            testBlockCommentCommand([
                'asd <0 qwe',
                'asd 0> qwe'
            ], new selection_1.$ms(2, 7, 1, 11), [
                'asd qwe',
                'asd qwe'
            ], new selection_1.$ms(1, 5, 2, 4));
        });
        test('bug #30358', function () {
            testBlockCommentCommand([
                '<0 start 0> middle end',
            ], new selection_1.$ms(1, 20, 1, 23), [
                '<0 start 0> middle <0 end 0>'
            ], new selection_1.$ms(1, 23, 1, 26));
            testBlockCommentCommand([
                '<0 start 0> middle <0 end 0>'
            ], new selection_1.$ms(1, 13, 1, 19), [
                '<0 start 0> <0 middle 0> <0 end 0>'
            ], new selection_1.$ms(1, 16, 1, 22));
        });
        test('issue #34618', function () {
            testBlockCommentCommand([
                '<0  0> middle end',
            ], new selection_1.$ms(1, 4, 1, 4), [
                ' middle end'
            ], new selection_1.$ms(1, 1, 1, 1));
        });
        test('insertSpace false', () => {
            function testLineCommentCommand(lines, selection, expectedLines, expectedSelection) {
                _testCommentCommand(lines, selection, (accessor, sel) => new blockCommentCommand_1.$V6(sel, false, accessor.get(languageConfigurationRegistry_1.$2t)), expectedLines, expectedSelection);
            }
            testLineCommentCommand([
                'some text'
            ], new selection_1.$ms(1, 1, 1, 5), [
                '<0some0> text'
            ], new selection_1.$ms(1, 3, 1, 7));
        });
        test('insertSpace false does not remove space', () => {
            function testLineCommentCommand(lines, selection, expectedLines, expectedSelection) {
                _testCommentCommand(lines, selection, (accessor, sel) => new blockCommentCommand_1.$V6(sel, false, accessor.get(languageConfigurationRegistry_1.$2t)), expectedLines, expectedSelection);
            }
            testLineCommentCommand([
                '<0 some 0> text'
            ], new selection_1.$ms(1, 4, 1, 8), [
                ' some  text'
            ], new selection_1.$ms(1, 1, 1, 7));
        });
    });
});
//# sourceMappingURL=blockCommentCommand.test.js.map