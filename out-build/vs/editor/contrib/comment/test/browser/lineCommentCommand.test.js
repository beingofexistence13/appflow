/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/editor/common/core/selection", "vs/editor/common/languages", "vs/editor/common/languages/language", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/languages/nullTokenize", "vs/editor/contrib/comment/browser/lineCommentCommand", "vs/editor/test/browser/testCommand", "vs/editor/test/common/modes/testLanguageConfigurationService", "vs/platform/instantiation/common/instantiation"], function (require, exports, assert, lifecycle_1, utils_1, selection_1, languages_1, language_1, languageConfigurationRegistry_1, nullTokenize_1, lineCommentCommand_1, testCommand_1, testLanguageConfigurationService_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function createTestCommandHelper(commentsConfig, commandFactory) {
        return (lines, selection, expectedLines, expectedSelection) => {
            const languageId = 'commentMode';
            const prepare = (accessor, disposables) => {
                const languageConfigurationService = accessor.get(languageConfigurationRegistry_1.$2t);
                const languageService = accessor.get(language_1.$ct);
                disposables.add(languageService.registerLanguage({ id: languageId }));
                disposables.add(languageConfigurationService.register(languageId, {
                    comments: commentsConfig
                }));
            };
            (0, testCommand_1.$30b)(lines, languageId, selection, commandFactory, expectedLines, expectedSelection, false, prepare);
        };
    }
    suite('Editor Contrib - Line Comment Command', () => {
        (0, utils_1.$bT)();
        const testLineCommentCommand = createTestCommandHelper({ lineComment: '!@#', blockComment: ['<!@#', '#@!>'] }, (accessor, sel) => new lineCommentCommand_1.$W6(accessor.get(languageConfigurationRegistry_1.$2t), sel, 4, 0 /* Type.Toggle */, true, true));
        const testAddLineCommentCommand = createTestCommandHelper({ lineComment: '!@#', blockComment: ['<!@#', '#@!>'] }, (accessor, sel) => new lineCommentCommand_1.$W6(accessor.get(languageConfigurationRegistry_1.$2t), sel, 4, 1 /* Type.ForceAdd */, true, true));
        test('comment single line', function () {
            testLineCommentCommand([
                'some text',
                '\tsome more text'
            ], new selection_1.$ms(1, 1, 1, 1), [
                '!@# some text',
                '\tsome more text'
            ], new selection_1.$ms(1, 5, 1, 5));
        });
        test('case insensitive', function () {
            const testLineCommentCommand = createTestCommandHelper({ lineComment: 'rem' }, (accessor, sel) => new lineCommentCommand_1.$W6(accessor.get(languageConfigurationRegistry_1.$2t), sel, 4, 0 /* Type.Toggle */, true, true));
            testLineCommentCommand([
                'REM some text'
            ], new selection_1.$ms(1, 1, 1, 1), [
                'some text'
            ], new selection_1.$ms(1, 1, 1, 1));
        });
        function createSimpleModel(lines) {
            return {
                getLineContent: (lineNumber) => {
                    return lines[lineNumber - 1];
                }
            };
        }
        function createBasicLinePreflightData(commentTokens) {
            return commentTokens.map((commentString) => {
                const r = {
                    ignore: false,
                    commentStr: commentString,
                    commentStrOffset: 0,
                    commentStrLength: commentString.length
                };
                return r;
            });
        }
        test('_analyzeLines', () => {
            const disposable = new lifecycle_1.$jc();
            let r;
            r = lineCommentCommand_1.$W6._analyzeLines(0 /* Type.Toggle */, true, createSimpleModel([
                '\t\t',
                '    ',
                '    c',
                '\t\td'
            ]), createBasicLinePreflightData(['//', 'rem', '!@#', '!@#']), 1, true, false, disposable.add(new testLanguageConfigurationService_1.$D0b()));
            if (!r.supported) {
                throw new Error(`unexpected`);
            }
            assert.strictEqual(r.shouldRemoveComments, false);
            // Does not change `commentStr`
            assert.strictEqual(r.lines[0].commentStr, '//');
            assert.strictEqual(r.lines[1].commentStr, 'rem');
            assert.strictEqual(r.lines[2].commentStr, '!@#');
            assert.strictEqual(r.lines[3].commentStr, '!@#');
            // Fills in `isWhitespace`
            assert.strictEqual(r.lines[0].ignore, true);
            assert.strictEqual(r.lines[1].ignore, true);
            assert.strictEqual(r.lines[2].ignore, false);
            assert.strictEqual(r.lines[3].ignore, false);
            // Fills in `commentStrOffset`
            assert.strictEqual(r.lines[0].commentStrOffset, 2);
            assert.strictEqual(r.lines[1].commentStrOffset, 4);
            assert.strictEqual(r.lines[2].commentStrOffset, 4);
            assert.strictEqual(r.lines[3].commentStrOffset, 2);
            r = lineCommentCommand_1.$W6._analyzeLines(0 /* Type.Toggle */, true, createSimpleModel([
                '\t\t',
                '    rem ',
                '    !@# c',
                '\t\t!@#d'
            ]), createBasicLinePreflightData(['//', 'rem', '!@#', '!@#']), 1, true, false, disposable.add(new testLanguageConfigurationService_1.$D0b()));
            if (!r.supported) {
                throw new Error(`unexpected`);
            }
            assert.strictEqual(r.shouldRemoveComments, true);
            // Does not change `commentStr`
            assert.strictEqual(r.lines[0].commentStr, '//');
            assert.strictEqual(r.lines[1].commentStr, 'rem');
            assert.strictEqual(r.lines[2].commentStr, '!@#');
            assert.strictEqual(r.lines[3].commentStr, '!@#');
            // Fills in `isWhitespace`
            assert.strictEqual(r.lines[0].ignore, true);
            assert.strictEqual(r.lines[1].ignore, false);
            assert.strictEqual(r.lines[2].ignore, false);
            assert.strictEqual(r.lines[3].ignore, false);
            // Fills in `commentStrOffset`
            assert.strictEqual(r.lines[0].commentStrOffset, 2);
            assert.strictEqual(r.lines[1].commentStrOffset, 4);
            assert.strictEqual(r.lines[2].commentStrOffset, 4);
            assert.strictEqual(r.lines[3].commentStrOffset, 2);
            // Fills in `commentStrLength`
            assert.strictEqual(r.lines[0].commentStrLength, 2);
            assert.strictEqual(r.lines[1].commentStrLength, 4);
            assert.strictEqual(r.lines[2].commentStrLength, 4);
            assert.strictEqual(r.lines[3].commentStrLength, 3);
            disposable.dispose();
        });
        test('_normalizeInsertionPoint', () => {
            const runTest = (mixedArr, tabSize, expected, testName) => {
                const model = createSimpleModel(mixedArr.filter((item, idx) => idx % 2 === 0));
                const offsets = mixedArr.filter((item, idx) => idx % 2 === 1).map(offset => {
                    return {
                        commentStrOffset: offset,
                        ignore: false
                    };
                });
                lineCommentCommand_1.$W6._normalizeInsertionPoint(model, offsets, 1, tabSize);
                const actual = offsets.map(item => item.commentStrOffset);
                assert.deepStrictEqual(actual, expected, testName);
            };
            // Bug 16696:[comment] comments not aligned in this case
            runTest([
                '  XX', 2,
                '    YY', 4
            ], 4, [0, 0], 'Bug 16696');
            runTest([
                '\t\t\tXX', 3,
                '    \tYY', 5,
                '        ZZ', 8,
                '\t\tTT', 2
            ], 4, [2, 5, 8, 2], 'Test1');
            runTest([
                '\t\t\t   XX', 6,
                '    \t\t\t\tYY', 8,
                '        ZZ', 8,
                '\t\t    TT', 6
            ], 4, [2, 5, 8, 2], 'Test2');
            runTest([
                '\t\t', 2,
                '\t\t\t', 3,
                '\t\t\t\t', 4,
                '\t\t\t', 3
            ], 4, [2, 2, 2, 2], 'Test3');
            runTest([
                '\t\t', 2,
                '\t\t\t', 3,
                '\t\t\t\t', 4,
                '\t\t\t', 3,
                '    ', 4
            ], 2, [2, 2, 2, 2, 4], 'Test4');
            runTest([
                '\t\t', 2,
                '\t\t\t', 3,
                '\t\t\t\t', 4,
                '\t\t\t', 3,
                '    ', 4
            ], 4, [1, 1, 1, 1, 4], 'Test5');
            runTest([
                ' \t', 2,
                '  \t', 3,
                '   \t', 4,
                '    ', 4,
                '\t', 1
            ], 4, [2, 3, 4, 4, 1], 'Test6');
            runTest([
                ' \t\t', 3,
                '  \t\t', 4,
                '   \t\t', 5,
                '    \t', 5,
                '\t', 1
            ], 4, [2, 3, 4, 4, 1], 'Test7');
            runTest([
                '\t', 1,
                '    ', 4
            ], 4, [1, 4], 'Test8:4');
            runTest([
                '\t', 1,
                '   ', 3
            ], 4, [0, 0], 'Test8:3');
            runTest([
                '\t', 1,
                '  ', 2
            ], 4, [0, 0], 'Test8:2');
            runTest([
                '\t', 1,
                ' ', 1
            ], 4, [0, 0], 'Test8:1');
            runTest([
                '\t', 1,
                '', 0
            ], 4, [0, 0], 'Test8:0');
        });
        test('detects indentation', function () {
            testLineCommentCommand([
                '\tsome text',
                '\tsome more text'
            ], new selection_1.$ms(2, 2, 1, 1), [
                '\t!@# some text',
                '\t!@# some more text'
            ], new selection_1.$ms(2, 2, 1, 1));
        });
        test('detects mixed indentation', function () {
            testLineCommentCommand([
                '\tsome text',
                '    some more text'
            ], new selection_1.$ms(2, 2, 1, 1), [
                '\t!@# some text',
                '    !@# some more text'
            ], new selection_1.$ms(2, 2, 1, 1));
        });
        test('ignores whitespace lines', function () {
            testLineCommentCommand([
                '\tsome text',
                '\t   ',
                '',
                '\tsome more text'
            ], new selection_1.$ms(4, 2, 1, 1), [
                '\t!@# some text',
                '\t   ',
                '',
                '\t!@# some more text'
            ], new selection_1.$ms(4, 2, 1, 1));
        });
        test('removes its own', function () {
            testLineCommentCommand([
                '\t!@# some text',
                '\t   ',
                '\t\t!@# some more text'
            ], new selection_1.$ms(3, 2, 1, 1), [
                '\tsome text',
                '\t   ',
                '\t\tsome more text'
            ], new selection_1.$ms(3, 2, 1, 1));
        });
        test('works in only whitespace', function () {
            testLineCommentCommand([
                '\t    ',
                '\t',
                '\t\tsome more text'
            ], new selection_1.$ms(3, 1, 1, 1), [
                '\t!@#     ',
                '\t!@# ',
                '\t\tsome more text'
            ], new selection_1.$ms(3, 1, 1, 1));
        });
        test('bug 9697 - whitespace before comment token', function () {
            testLineCommentCommand([
                '\t !@#first',
                '\tsecond line'
            ], new selection_1.$ms(1, 1, 1, 1), [
                '\t first',
                '\tsecond line'
            ], new selection_1.$ms(1, 1, 1, 1));
        });
        test('bug 10162 - line comment before caret', function () {
            testLineCommentCommand([
                'first!@#',
                '\tsecond line'
            ], new selection_1.$ms(1, 1, 1, 1), [
                '!@# first!@#',
                '\tsecond line'
            ], new selection_1.$ms(1, 5, 1, 5));
        });
        test('comment single line - leading whitespace', function () {
            testLineCommentCommand([
                'first!@#',
                '\tsecond line'
            ], new selection_1.$ms(2, 3, 2, 1), [
                'first!@#',
                '\t!@# second line'
            ], new selection_1.$ms(2, 7, 2, 1));
        });
        test('ignores invisible selection', function () {
            testLineCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(2, 1, 1, 1), [
                '!@# first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(2, 1, 1, 5));
        });
        test('multiple lines', function () {
            testLineCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(2, 4, 1, 1), [
                '!@# first',
                '!@# \tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(2, 8, 1, 5));
        });
        test('multiple modes on multiple lines', function () {
            testLineCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(4, 4, 3, 1), [
                'first',
                '\tsecond line',
                '!@# third line',
                '!@# fourth line',
                'fifth'
            ], new selection_1.$ms(4, 8, 3, 5));
        });
        test('toggle single line', function () {
            testLineCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 1, 1, 1), [
                '!@# first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 5, 1, 5));
            testLineCommentCommand([
                '!@# first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 4, 1, 4), [
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 1, 1, 1));
        });
        test('toggle multiple lines', function () {
            testLineCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(2, 4, 1, 1), [
                '!@# first',
                '!@# \tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(2, 8, 1, 5));
            testLineCommentCommand([
                '!@# first',
                '!@# \tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(2, 7, 1, 4), [
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(2, 3, 1, 1));
        });
        test('issue #5964: Ctrl+/ to create comment when cursor is at the beginning of the line puts the cursor in a strange position', () => {
            testLineCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 1, 1, 1), [
                '!@# first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 5, 1, 5));
        });
        test('issue #35673: Comment hotkeys throws the cursor before the comment', () => {
            testLineCommentCommand([
                'first',
                '',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(2, 1, 2, 1), [
                'first',
                '!@# ',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(2, 5, 2, 5));
            testLineCommentCommand([
                'first',
                '\t',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(2, 2, 2, 2), [
                'first',
                '\t!@# ',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(2, 6, 2, 6));
        });
        test('issue #2837 "Add Line Comment" fault when blank lines involved', function () {
            testAddLineCommentCommand([
                '    if displayName == "":',
                '        displayName = groupName',
                '    description = getAttr(attributes, "description")',
                '    mailAddress = getAttr(attributes, "mail")',
                '',
                '    print "||Group name|%s|" % displayName',
                '    print "||Description|%s|" % description',
                '    print "||Email address|[mailto:%s]|" % mailAddress`',
            ], new selection_1.$ms(1, 1, 8, 56), [
                '    !@# if displayName == "":',
                '    !@#     displayName = groupName',
                '    !@# description = getAttr(attributes, "description")',
                '    !@# mailAddress = getAttr(attributes, "mail")',
                '',
                '    !@# print "||Group name|%s|" % displayName',
                '    !@# print "||Description|%s|" % description',
                '    !@# print "||Email address|[mailto:%s]|" % mailAddress`',
            ], new selection_1.$ms(1, 1, 8, 60));
        });
        test('issue #47004: Toggle comments shouldn\'t move cursor', () => {
            testAddLineCommentCommand([
                '    A line',
                '    Another line'
            ], new selection_1.$ms(2, 7, 1, 1), [
                '    !@# A line',
                '    !@# Another line'
            ], new selection_1.$ms(2, 11, 1, 1));
        });
        test('insertSpace false', () => {
            const testLineCommentCommand = createTestCommandHelper({ lineComment: '!@#' }, (accessor, sel) => new lineCommentCommand_1.$W6(accessor.get(languageConfigurationRegistry_1.$2t), sel, 4, 0 /* Type.Toggle */, false, true));
            testLineCommentCommand([
                'some text'
            ], new selection_1.$ms(1, 1, 1, 1), [
                '!@#some text'
            ], new selection_1.$ms(1, 4, 1, 4));
        });
        test('insertSpace false does not remove space', () => {
            const testLineCommentCommand = createTestCommandHelper({ lineComment: '!@#' }, (accessor, sel) => new lineCommentCommand_1.$W6(accessor.get(languageConfigurationRegistry_1.$2t), sel, 4, 0 /* Type.Toggle */, false, true));
            testLineCommentCommand([
                '!@#    some text'
            ], new selection_1.$ms(1, 1, 1, 1), [
                '    some text'
            ], new selection_1.$ms(1, 1, 1, 1));
        });
    });
    suite('ignoreEmptyLines false', () => {
        (0, utils_1.$bT)();
        const testLineCommentCommand = createTestCommandHelper({ lineComment: '!@#', blockComment: ['<!@#', '#@!>'] }, (accessor, sel) => new lineCommentCommand_1.$W6(accessor.get(languageConfigurationRegistry_1.$2t), sel, 4, 0 /* Type.Toggle */, true, false));
        test('does not ignore whitespace lines', () => {
            testLineCommentCommand([
                '\tsome text',
                '\t   ',
                '',
                '\tsome more text'
            ], new selection_1.$ms(4, 2, 1, 1), [
                '!@# \tsome text',
                '!@# \t   ',
                '!@# ',
                '!@# \tsome more text'
            ], new selection_1.$ms(4, 6, 1, 5));
        });
        test('removes its own', function () {
            testLineCommentCommand([
                '\t!@# some text',
                '\t   ',
                '\t\t!@# some more text'
            ], new selection_1.$ms(3, 2, 1, 1), [
                '\tsome text',
                '\t   ',
                '\t\tsome more text'
            ], new selection_1.$ms(3, 2, 1, 1));
        });
        test('works in only whitespace', function () {
            testLineCommentCommand([
                '\t    ',
                '\t',
                '\t\tsome more text'
            ], new selection_1.$ms(3, 1, 1, 1), [
                '\t!@#     ',
                '\t!@# ',
                '\t\tsome more text'
            ], new selection_1.$ms(3, 1, 1, 1));
        });
        test('comments single line', function () {
            testLineCommentCommand([
                'some text',
                '\tsome more text'
            ], new selection_1.$ms(1, 1, 1, 1), [
                '!@# some text',
                '\tsome more text'
            ], new selection_1.$ms(1, 5, 1, 5));
        });
        test('detects indentation', function () {
            testLineCommentCommand([
                '\tsome text',
                '\tsome more text'
            ], new selection_1.$ms(2, 2, 1, 1), [
                '\t!@# some text',
                '\t!@# some more text'
            ], new selection_1.$ms(2, 2, 1, 1));
        });
    });
    suite('Editor Contrib - Line Comment As Block Comment', () => {
        (0, utils_1.$bT)();
        const testLineCommentCommand = createTestCommandHelper({ lineComment: '', blockComment: ['(', ')'] }, (accessor, sel) => new lineCommentCommand_1.$W6(accessor.get(languageConfigurationRegistry_1.$2t), sel, 4, 0 /* Type.Toggle */, true, true));
        test('fall back to block comment command', function () {
            testLineCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 1, 1, 1), [
                '( first )',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 3, 1, 3));
        });
        test('fall back to block comment command - toggle', function () {
            testLineCommentCommand([
                '(first)',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 7, 1, 2), [
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 6, 1, 1));
        });
        test('bug 9513 - expand single line to uncomment auto block', function () {
            testLineCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 1, 1, 1), [
                '( first )',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 3, 1, 3));
        });
        test('bug 9691 - always expand selection to line boundaries', function () {
            testLineCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(3, 2, 1, 3), [
                '( first',
                '\tsecond line',
                'third line )',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(3, 2, 1, 5));
            testLineCommentCommand([
                '(first',
                '\tsecond line',
                'third line)',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(3, 11, 1, 2), [
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(3, 11, 1, 1));
        });
    });
    suite('Editor Contrib - Line Comment As Block Comment 2', () => {
        (0, utils_1.$bT)();
        const testLineCommentCommand = createTestCommandHelper({ lineComment: null, blockComment: ['<!@#', '#@!>'] }, (accessor, sel) => new lineCommentCommand_1.$W6(accessor.get(languageConfigurationRegistry_1.$2t), sel, 4, 0 /* Type.Toggle */, true, true));
        test('no selection => uses indentation', function () {
            testLineCommentCommand([
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\t<!@#fifth#@!>\t\t'
            ], new selection_1.$ms(1, 1, 1, 1), [
                '\t\t<!@# first\t     #@!>',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\t<!@#fifth#@!>\t\t'
            ], new selection_1.$ms(1, 1, 1, 1));
            testLineCommentCommand([
                '\t\t<!@#first\t    #@!>',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\t<!@#fifth#@!>\t\t'
            ], new selection_1.$ms(1, 1, 1, 1), [
                '\t\tfirst\t   ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\t<!@#fifth#@!>\t\t'
            ], new selection_1.$ms(1, 1, 1, 1));
        });
        test('can remove', function () {
            testLineCommentCommand([
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\t<!@#fifth#@!>\t\t'
            ], new selection_1.$ms(5, 1, 5, 1), [
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\tfifth\t\t'
            ], new selection_1.$ms(5, 1, 5, 1));
            testLineCommentCommand([
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\t<!@#fifth#@!>\t\t'
            ], new selection_1.$ms(5, 3, 5, 3), [
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\tfifth\t\t'
            ], new selection_1.$ms(5, 3, 5, 3));
            testLineCommentCommand([
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\t<!@#fifth#@!>\t\t'
            ], new selection_1.$ms(5, 4, 5, 4), [
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\tfifth\t\t'
            ], new selection_1.$ms(5, 3, 5, 3));
            testLineCommentCommand([
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\t<!@#fifth#@!>\t\t'
            ], new selection_1.$ms(5, 16, 5, 3), [
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\tfifth\t\t'
            ], new selection_1.$ms(5, 8, 5, 3));
            testLineCommentCommand([
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\t<!@#fifth#@!>\t\t'
            ], new selection_1.$ms(5, 12, 5, 7), [
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\tfifth\t\t'
            ], new selection_1.$ms(5, 8, 5, 3));
            testLineCommentCommand([
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\t<!@#fifth#@!>\t\t'
            ], new selection_1.$ms(5, 18, 5, 18), [
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\tfifth\t\t'
            ], new selection_1.$ms(5, 10, 5, 10));
        });
        test('issue #993: Remove comment does not work consistently in HTML', () => {
            testLineCommentCommand([
                '     asd qwe',
                '     asd qwe',
                ''
            ], new selection_1.$ms(1, 1, 3, 1), [
                '     <!@# asd qwe',
                '     asd qwe #@!>',
                ''
            ], new selection_1.$ms(1, 1, 3, 1));
            testLineCommentCommand([
                '     <!@#asd qwe',
                '     asd qwe#@!>',
                ''
            ], new selection_1.$ms(1, 1, 3, 1), [
                '     asd qwe',
                '     asd qwe',
                ''
            ], new selection_1.$ms(1, 1, 3, 1));
        });
    });
    suite('Editor Contrib - Line Comment in mixed modes', () => {
        (0, utils_1.$bT)();
        const OUTER_LANGUAGE_ID = 'outerMode';
        const INNER_LANGUAGE_ID = 'innerMode';
        let OuterMode = class OuterMode extends lifecycle_1.$kc {
            constructor(commentsConfig, languageService, languageConfigurationService) {
                super();
                this.a = OUTER_LANGUAGE_ID;
                this.B(languageService.registerLanguage({ id: this.a }));
                this.B(languageConfigurationService.register(this.a, {
                    comments: commentsConfig
                }));
                this.B(languages_1.$bt.register(this.a, {
                    getInitialState: () => nullTokenize_1.$uC,
                    tokenize: () => {
                        throw new Error('not implemented');
                    },
                    tokenizeEncoded: (line, hasEOL, state) => {
                        const languageId = (/^  /.test(line) ? INNER_LANGUAGE_ID : OUTER_LANGUAGE_ID);
                        const encodedLanguageId = languageService.languageIdCodec.encodeLanguageId(languageId);
                        const tokens = new Uint32Array(1 << 1);
                        tokens[(0 << 1)] = 0;
                        tokens[(0 << 1) + 1] = ((1 /* ColorId.DefaultForeground */ << 15 /* MetadataConsts.FOREGROUND_OFFSET */)
                            | (encodedLanguageId << 0 /* MetadataConsts.LANGUAGEID_OFFSET */));
                        return new languages_1.$6s(tokens, state);
                    }
                }));
            }
        };
        OuterMode = __decorate([
            __param(1, language_1.$ct),
            __param(2, languageConfigurationRegistry_1.$2t)
        ], OuterMode);
        let InnerMode = class InnerMode extends lifecycle_1.$kc {
            constructor(commentsConfig, languageService, languageConfigurationService) {
                super();
                this.a = INNER_LANGUAGE_ID;
                this.B(languageService.registerLanguage({ id: this.a }));
                this.B(languageConfigurationService.register(this.a, {
                    comments: commentsConfig
                }));
            }
        };
        InnerMode = __decorate([
            __param(1, language_1.$ct),
            __param(2, languageConfigurationRegistry_1.$2t)
        ], InnerMode);
        function testLineCommentCommand(lines, selection, expectedLines, expectedSelection) {
            const setup = (accessor, disposables) => {
                const instantiationService = accessor.get(instantiation_1.$Ah);
                disposables.add(instantiationService.createInstance(OuterMode, { lineComment: '//', blockComment: ['/*', '*/'] }));
                disposables.add(instantiationService.createInstance(InnerMode, { lineComment: null, blockComment: ['{/*', '*/}'] }));
            };
            (0, testCommand_1.$30b)(lines, OUTER_LANGUAGE_ID, selection, (accessor, sel) => new lineCommentCommand_1.$W6(accessor.get(languageConfigurationRegistry_1.$2t), sel, 4, 0 /* Type.Toggle */, true, true), expectedLines, expectedSelection, true, setup);
        }
        test('issue #24047 (part 1): Commenting code in JSX files', () => {
            testLineCommentCommand([
                'import React from \'react\';',
                'const Loader = () => (',
                '  <div>',
                '    Loading...',
                '  </div>',
                ');',
                'export default Loader;'
            ], new selection_1.$ms(1, 1, 7, 22), [
                '// import React from \'react\';',
                '// const Loader = () => (',
                '//   <div>',
                '//     Loading...',
                '//   </div>',
                '// );',
                '// export default Loader;'
            ], new selection_1.$ms(1, 4, 7, 25));
        });
        test('issue #24047 (part 2): Commenting code in JSX files', () => {
            testLineCommentCommand([
                'import React from \'react\';',
                'const Loader = () => (',
                '  <div>',
                '    Loading...',
                '  </div>',
                ');',
                'export default Loader;'
            ], new selection_1.$ms(3, 4, 3, 4), [
                'import React from \'react\';',
                'const Loader = () => (',
                '  {/* <div> */}',
                '    Loading...',
                '  </div>',
                ');',
                'export default Loader;'
            ], new selection_1.$ms(3, 8, 3, 8));
        });
        test('issue #36173: Commenting code in JSX tag body', () => {
            testLineCommentCommand([
                '<div>',
                '  {123}',
                '</div>',
            ], new selection_1.$ms(2, 4, 2, 4), [
                '<div>',
                '  {/* {123} */}',
                '</div>',
            ], new selection_1.$ms(2, 8, 2, 8));
        });
    });
});
//# sourceMappingURL=lineCommentCommand.test.js.map