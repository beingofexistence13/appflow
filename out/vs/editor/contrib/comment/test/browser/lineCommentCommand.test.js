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
                const languageConfigurationService = accessor.get(languageConfigurationRegistry_1.ILanguageConfigurationService);
                const languageService = accessor.get(language_1.ILanguageService);
                disposables.add(languageService.registerLanguage({ id: languageId }));
                disposables.add(languageConfigurationService.register(languageId, {
                    comments: commentsConfig
                }));
            };
            (0, testCommand_1.testCommand)(lines, languageId, selection, commandFactory, expectedLines, expectedSelection, false, prepare);
        };
    }
    suite('Editor Contrib - Line Comment Command', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        const testLineCommentCommand = createTestCommandHelper({ lineComment: '!@#', blockComment: ['<!@#', '#@!>'] }, (accessor, sel) => new lineCommentCommand_1.LineCommentCommand(accessor.get(languageConfigurationRegistry_1.ILanguageConfigurationService), sel, 4, 0 /* Type.Toggle */, true, true));
        const testAddLineCommentCommand = createTestCommandHelper({ lineComment: '!@#', blockComment: ['<!@#', '#@!>'] }, (accessor, sel) => new lineCommentCommand_1.LineCommentCommand(accessor.get(languageConfigurationRegistry_1.ILanguageConfigurationService), sel, 4, 1 /* Type.ForceAdd */, true, true));
        test('comment single line', function () {
            testLineCommentCommand([
                'some text',
                '\tsome more text'
            ], new selection_1.Selection(1, 1, 1, 1), [
                '!@# some text',
                '\tsome more text'
            ], new selection_1.Selection(1, 5, 1, 5));
        });
        test('case insensitive', function () {
            const testLineCommentCommand = createTestCommandHelper({ lineComment: 'rem' }, (accessor, sel) => new lineCommentCommand_1.LineCommentCommand(accessor.get(languageConfigurationRegistry_1.ILanguageConfigurationService), sel, 4, 0 /* Type.Toggle */, true, true));
            testLineCommentCommand([
                'REM some text'
            ], new selection_1.Selection(1, 1, 1, 1), [
                'some text'
            ], new selection_1.Selection(1, 1, 1, 1));
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
            const disposable = new lifecycle_1.DisposableStore();
            let r;
            r = lineCommentCommand_1.LineCommentCommand._analyzeLines(0 /* Type.Toggle */, true, createSimpleModel([
                '\t\t',
                '    ',
                '    c',
                '\t\td'
            ]), createBasicLinePreflightData(['//', 'rem', '!@#', '!@#']), 1, true, false, disposable.add(new testLanguageConfigurationService_1.TestLanguageConfigurationService()));
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
            r = lineCommentCommand_1.LineCommentCommand._analyzeLines(0 /* Type.Toggle */, true, createSimpleModel([
                '\t\t',
                '    rem ',
                '    !@# c',
                '\t\t!@#d'
            ]), createBasicLinePreflightData(['//', 'rem', '!@#', '!@#']), 1, true, false, disposable.add(new testLanguageConfigurationService_1.TestLanguageConfigurationService()));
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
                lineCommentCommand_1.LineCommentCommand._normalizeInsertionPoint(model, offsets, 1, tabSize);
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
            ], new selection_1.Selection(2, 2, 1, 1), [
                '\t!@# some text',
                '\t!@# some more text'
            ], new selection_1.Selection(2, 2, 1, 1));
        });
        test('detects mixed indentation', function () {
            testLineCommentCommand([
                '\tsome text',
                '    some more text'
            ], new selection_1.Selection(2, 2, 1, 1), [
                '\t!@# some text',
                '    !@# some more text'
            ], new selection_1.Selection(2, 2, 1, 1));
        });
        test('ignores whitespace lines', function () {
            testLineCommentCommand([
                '\tsome text',
                '\t   ',
                '',
                '\tsome more text'
            ], new selection_1.Selection(4, 2, 1, 1), [
                '\t!@# some text',
                '\t   ',
                '',
                '\t!@# some more text'
            ], new selection_1.Selection(4, 2, 1, 1));
        });
        test('removes its own', function () {
            testLineCommentCommand([
                '\t!@# some text',
                '\t   ',
                '\t\t!@# some more text'
            ], new selection_1.Selection(3, 2, 1, 1), [
                '\tsome text',
                '\t   ',
                '\t\tsome more text'
            ], new selection_1.Selection(3, 2, 1, 1));
        });
        test('works in only whitespace', function () {
            testLineCommentCommand([
                '\t    ',
                '\t',
                '\t\tsome more text'
            ], new selection_1.Selection(3, 1, 1, 1), [
                '\t!@#     ',
                '\t!@# ',
                '\t\tsome more text'
            ], new selection_1.Selection(3, 1, 1, 1));
        });
        test('bug 9697 - whitespace before comment token', function () {
            testLineCommentCommand([
                '\t !@#first',
                '\tsecond line'
            ], new selection_1.Selection(1, 1, 1, 1), [
                '\t first',
                '\tsecond line'
            ], new selection_1.Selection(1, 1, 1, 1));
        });
        test('bug 10162 - line comment before caret', function () {
            testLineCommentCommand([
                'first!@#',
                '\tsecond line'
            ], new selection_1.Selection(1, 1, 1, 1), [
                '!@# first!@#',
                '\tsecond line'
            ], new selection_1.Selection(1, 5, 1, 5));
        });
        test('comment single line - leading whitespace', function () {
            testLineCommentCommand([
                'first!@#',
                '\tsecond line'
            ], new selection_1.Selection(2, 3, 2, 1), [
                'first!@#',
                '\t!@# second line'
            ], new selection_1.Selection(2, 7, 2, 1));
        });
        test('ignores invisible selection', function () {
            testLineCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 1, 1, 1), [
                '!@# first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 1, 1, 5));
        });
        test('multiple lines', function () {
            testLineCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 4, 1, 1), [
                '!@# first',
                '!@# \tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 8, 1, 5));
        });
        test('multiple modes on multiple lines', function () {
            testLineCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(4, 4, 3, 1), [
                'first',
                '\tsecond line',
                '!@# third line',
                '!@# fourth line',
                'fifth'
            ], new selection_1.Selection(4, 8, 3, 5));
        });
        test('toggle single line', function () {
            testLineCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 1, 1, 1), [
                '!@# first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 5, 1, 5));
            testLineCommentCommand([
                '!@# first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 4, 1, 4), [
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 1, 1, 1));
        });
        test('toggle multiple lines', function () {
            testLineCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 4, 1, 1), [
                '!@# first',
                '!@# \tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 8, 1, 5));
            testLineCommentCommand([
                '!@# first',
                '!@# \tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 7, 1, 4), [
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 3, 1, 1));
        });
        test('issue #5964: Ctrl+/ to create comment when cursor is at the beginning of the line puts the cursor in a strange position', () => {
            testLineCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 1, 1, 1), [
                '!@# first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 5, 1, 5));
        });
        test('issue #35673: Comment hotkeys throws the cursor before the comment', () => {
            testLineCommentCommand([
                'first',
                '',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 1, 2, 1), [
                'first',
                '!@# ',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 5, 2, 5));
            testLineCommentCommand([
                'first',
                '\t',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 2, 2, 2), [
                'first',
                '\t!@# ',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 6, 2, 6));
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
            ], new selection_1.Selection(1, 1, 8, 56), [
                '    !@# if displayName == "":',
                '    !@#     displayName = groupName',
                '    !@# description = getAttr(attributes, "description")',
                '    !@# mailAddress = getAttr(attributes, "mail")',
                '',
                '    !@# print "||Group name|%s|" % displayName',
                '    !@# print "||Description|%s|" % description',
                '    !@# print "||Email address|[mailto:%s]|" % mailAddress`',
            ], new selection_1.Selection(1, 1, 8, 60));
        });
        test('issue #47004: Toggle comments shouldn\'t move cursor', () => {
            testAddLineCommentCommand([
                '    A line',
                '    Another line'
            ], new selection_1.Selection(2, 7, 1, 1), [
                '    !@# A line',
                '    !@# Another line'
            ], new selection_1.Selection(2, 11, 1, 1));
        });
        test('insertSpace false', () => {
            const testLineCommentCommand = createTestCommandHelper({ lineComment: '!@#' }, (accessor, sel) => new lineCommentCommand_1.LineCommentCommand(accessor.get(languageConfigurationRegistry_1.ILanguageConfigurationService), sel, 4, 0 /* Type.Toggle */, false, true));
            testLineCommentCommand([
                'some text'
            ], new selection_1.Selection(1, 1, 1, 1), [
                '!@#some text'
            ], new selection_1.Selection(1, 4, 1, 4));
        });
        test('insertSpace false does not remove space', () => {
            const testLineCommentCommand = createTestCommandHelper({ lineComment: '!@#' }, (accessor, sel) => new lineCommentCommand_1.LineCommentCommand(accessor.get(languageConfigurationRegistry_1.ILanguageConfigurationService), sel, 4, 0 /* Type.Toggle */, false, true));
            testLineCommentCommand([
                '!@#    some text'
            ], new selection_1.Selection(1, 1, 1, 1), [
                '    some text'
            ], new selection_1.Selection(1, 1, 1, 1));
        });
    });
    suite('ignoreEmptyLines false', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        const testLineCommentCommand = createTestCommandHelper({ lineComment: '!@#', blockComment: ['<!@#', '#@!>'] }, (accessor, sel) => new lineCommentCommand_1.LineCommentCommand(accessor.get(languageConfigurationRegistry_1.ILanguageConfigurationService), sel, 4, 0 /* Type.Toggle */, true, false));
        test('does not ignore whitespace lines', () => {
            testLineCommentCommand([
                '\tsome text',
                '\t   ',
                '',
                '\tsome more text'
            ], new selection_1.Selection(4, 2, 1, 1), [
                '!@# \tsome text',
                '!@# \t   ',
                '!@# ',
                '!@# \tsome more text'
            ], new selection_1.Selection(4, 6, 1, 5));
        });
        test('removes its own', function () {
            testLineCommentCommand([
                '\t!@# some text',
                '\t   ',
                '\t\t!@# some more text'
            ], new selection_1.Selection(3, 2, 1, 1), [
                '\tsome text',
                '\t   ',
                '\t\tsome more text'
            ], new selection_1.Selection(3, 2, 1, 1));
        });
        test('works in only whitespace', function () {
            testLineCommentCommand([
                '\t    ',
                '\t',
                '\t\tsome more text'
            ], new selection_1.Selection(3, 1, 1, 1), [
                '\t!@#     ',
                '\t!@# ',
                '\t\tsome more text'
            ], new selection_1.Selection(3, 1, 1, 1));
        });
        test('comments single line', function () {
            testLineCommentCommand([
                'some text',
                '\tsome more text'
            ], new selection_1.Selection(1, 1, 1, 1), [
                '!@# some text',
                '\tsome more text'
            ], new selection_1.Selection(1, 5, 1, 5));
        });
        test('detects indentation', function () {
            testLineCommentCommand([
                '\tsome text',
                '\tsome more text'
            ], new selection_1.Selection(2, 2, 1, 1), [
                '\t!@# some text',
                '\t!@# some more text'
            ], new selection_1.Selection(2, 2, 1, 1));
        });
    });
    suite('Editor Contrib - Line Comment As Block Comment', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        const testLineCommentCommand = createTestCommandHelper({ lineComment: '', blockComment: ['(', ')'] }, (accessor, sel) => new lineCommentCommand_1.LineCommentCommand(accessor.get(languageConfigurationRegistry_1.ILanguageConfigurationService), sel, 4, 0 /* Type.Toggle */, true, true));
        test('fall back to block comment command', function () {
            testLineCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 1, 1, 1), [
                '( first )',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 3, 1, 3));
        });
        test('fall back to block comment command - toggle', function () {
            testLineCommentCommand([
                '(first)',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 7, 1, 2), [
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 6, 1, 1));
        });
        test('bug 9513 - expand single line to uncomment auto block', function () {
            testLineCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 1, 1, 1), [
                '( first )',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 3, 1, 3));
        });
        test('bug 9691 - always expand selection to line boundaries', function () {
            testLineCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(3, 2, 1, 3), [
                '( first',
                '\tsecond line',
                'third line )',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(3, 2, 1, 5));
            testLineCommentCommand([
                '(first',
                '\tsecond line',
                'third line)',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(3, 11, 1, 2), [
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(3, 11, 1, 1));
        });
    });
    suite('Editor Contrib - Line Comment As Block Comment 2', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        const testLineCommentCommand = createTestCommandHelper({ lineComment: null, blockComment: ['<!@#', '#@!>'] }, (accessor, sel) => new lineCommentCommand_1.LineCommentCommand(accessor.get(languageConfigurationRegistry_1.ILanguageConfigurationService), sel, 4, 0 /* Type.Toggle */, true, true));
        test('no selection => uses indentation', function () {
            testLineCommentCommand([
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\t<!@#fifth#@!>\t\t'
            ], new selection_1.Selection(1, 1, 1, 1), [
                '\t\t<!@# first\t     #@!>',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\t<!@#fifth#@!>\t\t'
            ], new selection_1.Selection(1, 1, 1, 1));
            testLineCommentCommand([
                '\t\t<!@#first\t    #@!>',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\t<!@#fifth#@!>\t\t'
            ], new selection_1.Selection(1, 1, 1, 1), [
                '\t\tfirst\t   ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\t<!@#fifth#@!>\t\t'
            ], new selection_1.Selection(1, 1, 1, 1));
        });
        test('can remove', function () {
            testLineCommentCommand([
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\t<!@#fifth#@!>\t\t'
            ], new selection_1.Selection(5, 1, 5, 1), [
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\tfifth\t\t'
            ], new selection_1.Selection(5, 1, 5, 1));
            testLineCommentCommand([
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\t<!@#fifth#@!>\t\t'
            ], new selection_1.Selection(5, 3, 5, 3), [
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\tfifth\t\t'
            ], new selection_1.Selection(5, 3, 5, 3));
            testLineCommentCommand([
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\t<!@#fifth#@!>\t\t'
            ], new selection_1.Selection(5, 4, 5, 4), [
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\tfifth\t\t'
            ], new selection_1.Selection(5, 3, 5, 3));
            testLineCommentCommand([
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\t<!@#fifth#@!>\t\t'
            ], new selection_1.Selection(5, 16, 5, 3), [
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\tfifth\t\t'
            ], new selection_1.Selection(5, 8, 5, 3));
            testLineCommentCommand([
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\t<!@#fifth#@!>\t\t'
            ], new selection_1.Selection(5, 12, 5, 7), [
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\tfifth\t\t'
            ], new selection_1.Selection(5, 8, 5, 3));
            testLineCommentCommand([
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\t<!@#fifth#@!>\t\t'
            ], new selection_1.Selection(5, 18, 5, 18), [
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\tfifth\t\t'
            ], new selection_1.Selection(5, 10, 5, 10));
        });
        test('issue #993: Remove comment does not work consistently in HTML', () => {
            testLineCommentCommand([
                '     asd qwe',
                '     asd qwe',
                ''
            ], new selection_1.Selection(1, 1, 3, 1), [
                '     <!@# asd qwe',
                '     asd qwe #@!>',
                ''
            ], new selection_1.Selection(1, 1, 3, 1));
            testLineCommentCommand([
                '     <!@#asd qwe',
                '     asd qwe#@!>',
                ''
            ], new selection_1.Selection(1, 1, 3, 1), [
                '     asd qwe',
                '     asd qwe',
                ''
            ], new selection_1.Selection(1, 1, 3, 1));
        });
    });
    suite('Editor Contrib - Line Comment in mixed modes', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        const OUTER_LANGUAGE_ID = 'outerMode';
        const INNER_LANGUAGE_ID = 'innerMode';
        let OuterMode = class OuterMode extends lifecycle_1.Disposable {
            constructor(commentsConfig, languageService, languageConfigurationService) {
                super();
                this.languageId = OUTER_LANGUAGE_ID;
                this._register(languageService.registerLanguage({ id: this.languageId }));
                this._register(languageConfigurationService.register(this.languageId, {
                    comments: commentsConfig
                }));
                this._register(languages_1.TokenizationRegistry.register(this.languageId, {
                    getInitialState: () => nullTokenize_1.NullState,
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
                        return new languages_1.EncodedTokenizationResult(tokens, state);
                    }
                }));
            }
        };
        OuterMode = __decorate([
            __param(1, language_1.ILanguageService),
            __param(2, languageConfigurationRegistry_1.ILanguageConfigurationService)
        ], OuterMode);
        let InnerMode = class InnerMode extends lifecycle_1.Disposable {
            constructor(commentsConfig, languageService, languageConfigurationService) {
                super();
                this.languageId = INNER_LANGUAGE_ID;
                this._register(languageService.registerLanguage({ id: this.languageId }));
                this._register(languageConfigurationService.register(this.languageId, {
                    comments: commentsConfig
                }));
            }
        };
        InnerMode = __decorate([
            __param(1, language_1.ILanguageService),
            __param(2, languageConfigurationRegistry_1.ILanguageConfigurationService)
        ], InnerMode);
        function testLineCommentCommand(lines, selection, expectedLines, expectedSelection) {
            const setup = (accessor, disposables) => {
                const instantiationService = accessor.get(instantiation_1.IInstantiationService);
                disposables.add(instantiationService.createInstance(OuterMode, { lineComment: '//', blockComment: ['/*', '*/'] }));
                disposables.add(instantiationService.createInstance(InnerMode, { lineComment: null, blockComment: ['{/*', '*/}'] }));
            };
            (0, testCommand_1.testCommand)(lines, OUTER_LANGUAGE_ID, selection, (accessor, sel) => new lineCommentCommand_1.LineCommentCommand(accessor.get(languageConfigurationRegistry_1.ILanguageConfigurationService), sel, 4, 0 /* Type.Toggle */, true, true), expectedLines, expectedSelection, true, setup);
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
            ], new selection_1.Selection(1, 1, 7, 22), [
                '// import React from \'react\';',
                '// const Loader = () => (',
                '//   <div>',
                '//     Loading...',
                '//   </div>',
                '// );',
                '// export default Loader;'
            ], new selection_1.Selection(1, 4, 7, 25));
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
            ], new selection_1.Selection(3, 4, 3, 4), [
                'import React from \'react\';',
                'const Loader = () => (',
                '  {/* <div> */}',
                '    Loading...',
                '  </div>',
                ');',
                'export default Loader;'
            ], new selection_1.Selection(3, 8, 3, 8));
        });
        test('issue #36173: Commenting code in JSX tag body', () => {
            testLineCommentCommand([
                '<div>',
                '  {123}',
                '</div>',
            ], new selection_1.Selection(2, 4, 2, 4), [
                '<div>',
                '  {/* {123} */}',
                '</div>',
            ], new selection_1.Selection(2, 8, 2, 8));
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZUNvbW1lbnRDb21tYW5kLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9jb21tZW50L3Rlc3QvYnJvd3Nlci9saW5lQ29tbWVudENvbW1hbmQudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7OztJQWtCaEcsU0FBUyx1QkFBdUIsQ0FBQyxjQUEyQixFQUFFLGNBQThFO1FBQzNJLE9BQU8sQ0FBQyxLQUFlLEVBQUUsU0FBb0IsRUFBRSxhQUF1QixFQUFFLGlCQUE0QixFQUFFLEVBQUU7WUFDdkcsTUFBTSxVQUFVLEdBQUcsYUFBYSxDQUFDO1lBQ2pDLE1BQU0sT0FBTyxHQUFHLENBQUMsUUFBMEIsRUFBRSxXQUE0QixFQUFFLEVBQUU7Z0JBQzVFLE1BQU0sNEJBQTRCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyw2REFBNkIsQ0FBQyxDQUFDO2dCQUNqRixNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDJCQUFnQixDQUFDLENBQUM7Z0JBQ3ZELFdBQVcsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDdEUsV0FBVyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFO29CQUNqRSxRQUFRLEVBQUUsY0FBYztpQkFDeEIsQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDLENBQUM7WUFDRixJQUFBLHlCQUFXLEVBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLGFBQWEsRUFBRSxpQkFBaUIsRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDN0csQ0FBQyxDQUFDO0lBQ0gsQ0FBQztJQUVELEtBQUssQ0FBQyx1Q0FBdUMsRUFB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QzthQUNmLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFN0IsT0FBTyxDQUFDO2dCQUNQLE1BQU0sRUFBRSxDQUFDO2dCQUNULFFBQVEsRUFBRSxDQUFDO2dCQUNYLFVBQVUsRUFBRSxDQUFDO2dCQUNiLFFBQVEsRUFBRSxDQUFDO2FBQ1gsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUU3QixPQUFPLENBQUM7Z0JBQ1AsTUFBTSxFQUFFLENBQUM7Z0JBQ1QsUUFBUSxFQUFFLENBQUM7Z0JBQ1gsVUFBVSxFQUFFLENBQUM7Z0JBQ2IsUUFBUSxFQUFFLENBQUM7Z0JBQ1gsTUFBTSxFQUFFLENBQUM7YUFDVCxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUVoQyxPQUFPLENBQUM7Z0JBQ1AsTUFBTSxFQUFFLENBQUM7Z0JBQ1QsUUFBUSxFQUFFLENBQUM7Z0JBQ1gsVUFBVSxFQUFFLENBQUM7Z0JBQ2IsUUFBUSxFQUFFLENBQUM7Z0JBQ1gsTUFBTSxFQUFFLENBQUM7YUFDVCxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUVoQyxPQUFPLENBQUM7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7Z0JBQ1IsTUFBTSxFQUFFLENBQUM7Z0JBQ1QsT0FBTyxFQUFFLENBQUM7Z0JBQ1YsTUFBTSxFQUFFLENBQUM7Z0JBQ1QsSUFBSSxFQUFFLENBQUM7YUFDUCxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUVoQyxPQUFPLENBQUM7Z0JBQ1AsT0FBTyxFQUFFLENBQUM7Z0JBQ1YsUUFBUSxFQUFFLENBQUM7Z0JBQ1gsU0FBUyxFQUFFLENBQUM7Z0JBQ1osUUFBUSxFQUFFLENBQUM7Z0JBQ1gsSUFBSSxFQUFFLENBQUM7YUFDUCxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUVoQyxPQUFPLENBQUM7Z0JBQ1AsSUFBSSxFQUFFLENBQUM7Z0JBQ1AsTUFBTSxFQUFFLENBQUM7YUFDVCxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUN6QixPQUFPLENBQUM7Z0JBQ1AsSUFBSSxFQUFFLENBQUM7Z0JBQ1AsS0FBSyxFQUFFLENBQUM7YUFDUixFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUN6QixPQUFPLENBQUM7Z0JBQ1AsSUFBSSxFQUFFLENBQUM7Z0JBQ1AsSUFBSSxFQUFFLENBQUM7YUFDUCxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUN6QixPQUFPLENBQUM7Z0JBQ1AsSUFBSSxFQUFFLENBQUM7Z0JBQ1AsR0FBRyxFQUFFLENBQUM7YUFDTixFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUN6QixPQUFPLENBQUM7Z0JBQ1AsSUFBSSxFQUFFLENBQUM7Z0JBQ1AsRUFBRSxFQUFFLENBQUM7YUFDTCxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUMxQixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxxQkFBcUIsRUFBRTtZ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