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
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/editor/common/commands/shiftCommand", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/languages/language", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/test/browser/testCommand", "vs/editor/test/common/modes/supports/javascriptOnEnterRules", "vs/editor/test/common/modes/testLanguageConfigurationService", "vs/editor/test/common/testTextModel"], function (require, exports, assert, lifecycle_1, utils_1, shiftCommand_1, range_1, selection_1, language_1, languageConfigurationRegistry_1, testCommand_1, javascriptOnEnterRules_1, testLanguageConfigurationService_1, testTextModel_1) {
    "use strict";
    var DocBlockCommentMode_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Create single edit operation
     */
    function createSingleEditOp(text, positionLineNumber, positionColumn, selectionLineNumber = positionLineNumber, selectionColumn = positionColumn) {
        return {
            range: new range_1.Range(selectionLineNumber, selectionColumn, positionLineNumber, positionColumn),
            text: text,
            forceMoveMarkers: false
        };
    }
    let DocBlockCommentMode = class DocBlockCommentMode extends lifecycle_1.Disposable {
        static { DocBlockCommentMode_1 = this; }
        static { this.languageId = 'commentMode'; }
        constructor(languageService, languageConfigurationService) {
            super();
            this.languageId = DocBlockCommentMode_1.languageId;
            this._register(languageService.registerLanguage({ id: this.languageId }));
            this._register(languageConfigurationService.register(this.languageId, {
                brackets: [
                    ['(', ')'],
                    ['{', '}'],
                    ['[', ']']
                ],
                onEnterRules: javascriptOnEnterRules_1.javascriptOnEnterRules
            }));
        }
    };
    DocBlockCommentMode = DocBlockCommentMode_1 = __decorate([
        __param(0, language_1.ILanguageService),
        __param(1, languageConfigurationRegistry_1.ILanguageConfigurationService)
    ], DocBlockCommentMode);
    function testShiftCommand(lines, languageId, useTabStops, selection, expectedLines, expectedSelection, prepare) {
        (0, testCommand_1.testCommand)(lines, languageId, selection, (accessor, sel) => new shiftCommand_1.ShiftCommand(sel, {
            isUnshift: false,
            tabSize: 4,
            indentSize: 4,
            insertSpaces: false,
            useTabStops: useTabStops,
            autoIndent: 4 /* EditorAutoIndentStrategy.Full */,
        }, accessor.get(languageConfigurationRegistry_1.ILanguageConfigurationService)), expectedLines, expectedSelection, undefined, prepare);
    }
    function testUnshiftCommand(lines, languageId, useTabStops, selection, expectedLines, expectedSelection, prepare) {
        (0, testCommand_1.testCommand)(lines, languageId, selection, (accessor, sel) => new shiftCommand_1.ShiftCommand(sel, {
            isUnshift: true,
            tabSize: 4,
            indentSize: 4,
            insertSpaces: false,
            useTabStops: useTabStops,
            autoIndent: 4 /* EditorAutoIndentStrategy.Full */,
        }, accessor.get(languageConfigurationRegistry_1.ILanguageConfigurationService)), expectedLines, expectedSelection, undefined, prepare);
    }
    function prepareDocBlockCommentLanguage(accessor, disposables) {
        const languageConfigurationService = accessor.get(languageConfigurationRegistry_1.ILanguageConfigurationService);
        const languageService = accessor.get(language_1.ILanguageService);
        disposables.add(new DocBlockCommentMode(languageService, languageConfigurationService));
    }
    suite('Editor Commands - ShiftCommand', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        // --------- shift
        test('Bug 9503: Shifting without any selection', () => {
            testShiftCommand([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], null, true, new selection_1.Selection(1, 1, 1, 1), [
                '\tMy First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], new selection_1.Selection(1, 2, 1, 2));
        });
        test('shift on single line selection 1', () => {
            testShiftCommand([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], null, true, new selection_1.Selection(1, 3, 1, 1), [
                '\tMy First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], new selection_1.Selection(1, 4, 1, 1));
        });
        test('shift on single line selection 2', () => {
            testShiftCommand([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], null, true, new selection_1.Selection(1, 1, 1, 3), [
                '\tMy First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], new selection_1.Selection(1, 1, 1, 4));
        });
        test('simple shift', () => {
            testShiftCommand([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], null, true, new selection_1.Selection(1, 1, 2, 1), [
                '\tMy First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], new selection_1.Selection(1, 1, 2, 1));
        });
        test('shifting on two separate lines', () => {
            testShiftCommand([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], null, true, new selection_1.Selection(1, 1, 2, 1), [
                '\tMy First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], new selection_1.Selection(1, 1, 2, 1));
            testShiftCommand([
                '\tMy First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], null, true, new selection_1.Selection(2, 1, 3, 1), [
                '\tMy First Line',
                '\t\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], new selection_1.Selection(2, 1, 3, 1));
        });
        test('shifting on two lines', () => {
            testShiftCommand([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], null, true, new selection_1.Selection(1, 2, 2, 2), [
                '\tMy First Line',
                '\t\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], new selection_1.Selection(1, 3, 2, 2));
        });
        test('shifting on two lines again', () => {
            testShiftCommand([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], null, true, new selection_1.Selection(2, 2, 1, 2), [
                '\tMy First Line',
                '\t\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], new selection_1.Selection(2, 2, 1, 3));
        });
        test('shifting at end of file', () => {
            testShiftCommand([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], null, true, new selection_1.Selection(4, 1, 5, 2), [
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '\t123'
            ], new selection_1.Selection(4, 1, 5, 3));
        });
        test('issue #1120 TAB should not indent empty lines in a multi-line selection', () => {
            testShiftCommand([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], null, true, new selection_1.Selection(1, 1, 5, 2), [
                '\tMy First Line',
                '\t\t\tMy Second Line',
                '\t\tThird Line',
                '',
                '\t123'
            ], new selection_1.Selection(1, 1, 5, 3));
            testShiftCommand([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], null, true, new selection_1.Selection(4, 1, 5, 1), [
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '\t',
                '123'
            ], new selection_1.Selection(4, 1, 5, 1));
        });
        // --------- unshift
        test('unshift on single line selection 1', () => {
            testShiftCommand([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], null, true, new selection_1.Selection(2, 3, 2, 1), [
                'My First Line',
                '\t\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], new selection_1.Selection(2, 3, 2, 1));
        });
        test('unshift on single line selection 2', () => {
            testShiftCommand([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], null, true, new selection_1.Selection(2, 1, 2, 3), [
                'My First Line',
                '\t\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], new selection_1.Selection(2, 1, 2, 3));
        });
        test('simple unshift', () => {
            testUnshiftCommand([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], null, true, new selection_1.Selection(1, 1, 2, 1), [
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], new selection_1.Selection(1, 1, 2, 1));
        });
        test('unshifting on two lines 1', () => {
            testUnshiftCommand([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], null, true, new selection_1.Selection(1, 2, 2, 2), [
                'My First Line',
                '\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], new selection_1.Selection(1, 2, 2, 2));
        });
        test('unshifting on two lines 2', () => {
            testUnshiftCommand([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], null, true, new selection_1.Selection(2, 3, 2, 1), [
                'My First Line',
                '\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], new selection_1.Selection(2, 2, 2, 1));
        });
        test('unshifting at the end of the file', () => {
            testUnshiftCommand([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], null, true, new selection_1.Selection(4, 1, 5, 2), [
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], new selection_1.Selection(4, 1, 5, 2));
        });
        test('unshift many times + shift', () => {
            testUnshiftCommand([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], null, true, new selection_1.Selection(1, 1, 5, 4), [
                'My First Line',
                '\tMy Second Line',
                'Third Line',
                '',
                '123'
            ], new selection_1.Selection(1, 1, 5, 4));
            testUnshiftCommand([
                'My First Line',
                '\tMy Second Line',
                'Third Line',
                '',
                '123'
            ], null, true, new selection_1.Selection(1, 1, 5, 4), [
                'My First Line',
                'My Second Line',
                'Third Line',
                '',
                '123'
            ], new selection_1.Selection(1, 1, 5, 4));
            testShiftCommand([
                'My First Line',
                'My Second Line',
                'Third Line',
                '',
                '123'
            ], null, true, new selection_1.Selection(1, 1, 5, 4), [
                '\tMy First Line',
                '\tMy Second Line',
                '\tThird Line',
                '',
                '\t123'
            ], new selection_1.Selection(1, 1, 5, 5));
        });
        test('Bug 9119: Unshift from first column doesn\'t work', () => {
            testUnshiftCommand([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], null, true, new selection_1.Selection(2, 1, 2, 1), [
                'My First Line',
                '\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], new selection_1.Selection(2, 1, 2, 1));
        });
        test('issue #348: indenting around doc block comments', () => {
            testShiftCommand([
                '',
                '/**',
                ' * a doc comment',
                ' */',
                'function hello() {}'
            ], DocBlockCommentMode.languageId, true, new selection_1.Selection(1, 1, 5, 20), [
                '',
                '\t/**',
                '\t * a doc comment',
                '\t */',
                '\tfunction hello() {}'
            ], new selection_1.Selection(1, 1, 5, 21), prepareDocBlockCommentLanguage);
            testUnshiftCommand([
                '',
                '/**',
                ' * a doc comment',
                ' */',
                'function hello() {}'
            ], DocBlockCommentMode.languageId, true, new selection_1.Selection(1, 1, 5, 20), [
                '',
                '/**',
                ' * a doc comment',
                ' */',
                'function hello() {}'
            ], new selection_1.Selection(1, 1, 5, 20), prepareDocBlockCommentLanguage);
            testUnshiftCommand([
                '\t',
                '\t/**',
                '\t * a doc comment',
                '\t */',
                '\tfunction hello() {}'
            ], DocBlockCommentMode.languageId, true, new selection_1.Selection(1, 1, 5, 21), [
                '',
                '/**',
                ' * a doc comment',
                ' */',
                'function hello() {}'
            ], new selection_1.Selection(1, 1, 5, 20), prepareDocBlockCommentLanguage);
        });
        test('issue #1609: Wrong indentation of block comments', () => {
            testShiftCommand([
                '',
                '/**',
                ' * test',
                ' *',
                ' * @type {number}',
                ' */',
                'var foo = 0;'
            ], DocBlockCommentMode.languageId, true, new selection_1.Selection(1, 1, 7, 13), [
                '',
                '\t/**',
                '\t * test',
                '\t *',
                '\t * @type {number}',
                '\t */',
                '\tvar foo = 0;'
            ], new selection_1.Selection(1, 1, 7, 14), prepareDocBlockCommentLanguage);
        });
        test('issue #1620: a) Line indent doesn\'t handle leading whitespace properly', () => {
            (0, testCommand_1.testCommand)([
                '   Written | Numeric',
                '       one | 1',
                '       two | 2',
                '     three | 3',
                '      four | 4',
                '      five | 5',
                '       six | 6',
                '     seven | 7',
                '     eight | 8',
                '      nine | 9',
                '       ten | 10',
                '    eleven | 11',
                '',
            ], null, new selection_1.Selection(1, 1, 13, 1), (accessor, sel) => new shiftCommand_1.ShiftCommand(sel, {
                isUnshift: false,
                tabSize: 4,
                indentSize: 4,
                insertSpaces: true,
                useTabStops: false,
                autoIndent: 4 /* EditorAutoIndentStrategy.Full */,
            }, accessor.get(languageConfigurationRegistry_1.ILanguageConfigurationService)), [
                '       Written | Numeric',
                '           one | 1',
                '           two | 2',
                '         three | 3',
                '          four | 4',
                '          five | 5',
                '           six | 6',
                '         seven | 7',
                '         eight | 8',
                '          nine | 9',
                '           ten | 10',
                '        eleven | 11',
                '',
            ], new selection_1.Selection(1, 1, 13, 1));
        });
        test('issue #1620: b) Line indent doesn\'t handle leading whitespace properly', () => {
            (0, testCommand_1.testCommand)([
                '       Written | Numeric',
                '           one | 1',
                '           two | 2',
                '         three | 3',
                '          four | 4',
                '          five | 5',
                '           six | 6',
                '         seven | 7',
                '         eight | 8',
                '          nine | 9',
                '           ten | 10',
                '        eleven | 11',
                '',
            ], null, new selection_1.Selection(1, 1, 13, 1), (accessor, sel) => new shiftCommand_1.ShiftCommand(sel, {
                isUnshift: true,
                tabSize: 4,
                indentSize: 4,
                insertSpaces: true,
                useTabStops: false,
                autoIndent: 4 /* EditorAutoIndentStrategy.Full */,
            }, accessor.get(languageConfigurationRegistry_1.ILanguageConfigurationService)), [
                '   Written | Numeric',
                '       one | 1',
                '       two | 2',
                '     three | 3',
                '      four | 4',
                '      five | 5',
                '       six | 6',
                '     seven | 7',
                '     eight | 8',
                '      nine | 9',
                '       ten | 10',
                '    eleven | 11',
                '',
            ], new selection_1.Selection(1, 1, 13, 1));
        });
        test('issue #1620: c) Line indent doesn\'t handle leading whitespace properly', () => {
            (0, testCommand_1.testCommand)([
                '       Written | Numeric',
                '           one | 1',
                '           two | 2',
                '         three | 3',
                '          four | 4',
                '          five | 5',
                '           six | 6',
                '         seven | 7',
                '         eight | 8',
                '          nine | 9',
                '           ten | 10',
                '        eleven | 11',
                '',
            ], null, new selection_1.Selection(1, 1, 13, 1), (accessor, sel) => new shiftCommand_1.ShiftCommand(sel, {
                isUnshift: true,
                tabSize: 4,
                indentSize: 4,
                insertSpaces: false,
                useTabStops: false,
                autoIndent: 4 /* EditorAutoIndentStrategy.Full */,
            }, accessor.get(languageConfigurationRegistry_1.ILanguageConfigurationService)), [
                '   Written | Numeric',
                '       one | 1',
                '       two | 2',
                '     three | 3',
                '      four | 4',
                '      five | 5',
                '       six | 6',
                '     seven | 7',
                '     eight | 8',
                '      nine | 9',
                '       ten | 10',
                '    eleven | 11',
                '',
            ], new selection_1.Selection(1, 1, 13, 1));
        });
        test('issue #1620: d) Line indent doesn\'t handle leading whitespace properly', () => {
            (0, testCommand_1.testCommand)([
                '\t   Written | Numeric',
                '\t       one | 1',
                '\t       two | 2',
                '\t     three | 3',
                '\t      four | 4',
                '\t      five | 5',
                '\t       six | 6',
                '\t     seven | 7',
                '\t     eight | 8',
                '\t      nine | 9',
                '\t       ten | 10',
                '\t    eleven | 11',
                '',
            ], null, new selection_1.Selection(1, 1, 13, 1), (accessor, sel) => new shiftCommand_1.ShiftCommand(sel, {
                isUnshift: true,
                tabSize: 4,
                indentSize: 4,
                insertSpaces: true,
                useTabStops: false,
                autoIndent: 4 /* EditorAutoIndentStrategy.Full */,
            }, accessor.get(languageConfigurationRegistry_1.ILanguageConfigurationService)), [
                '   Written | Numeric',
                '       one | 1',
                '       two | 2',
                '     three | 3',
                '      four | 4',
                '      five | 5',
                '       six | 6',
                '     seven | 7',
                '     eight | 8',
                '      nine | 9',
                '       ten | 10',
                '    eleven | 11',
                '',
            ], new selection_1.Selection(1, 1, 13, 1));
        });
        test('issue microsoft/monaco-editor#443: Indentation of a single row deletes selected text in some cases', () => {
            (0, testCommand_1.testCommand)([
                'Hello world!',
                'another line'
            ], null, new selection_1.Selection(1, 1, 1, 13), (accessor, sel) => new shiftCommand_1.ShiftCommand(sel, {
                isUnshift: false,
                tabSize: 4,
                indentSize: 4,
                insertSpaces: false,
                useTabStops: true,
                autoIndent: 4 /* EditorAutoIndentStrategy.Full */,
            }, accessor.get(languageConfigurationRegistry_1.ILanguageConfigurationService)), [
                '\tHello world!',
                'another line'
            ], new selection_1.Selection(1, 1, 1, 14));
        });
        test('bug #16815:Shift+Tab doesn\'t go back to tabstop', () => {
            const repeatStr = (str, cnt) => {
                let r = '';
                for (let i = 0; i < cnt; i++) {
                    r += str;
                }
                return r;
            };
            const testOutdent = (tabSize, indentSize, insertSpaces, lineText, expectedIndents) => {
                const oneIndent = insertSpaces ? repeatStr(' ', indentSize) : '\t';
                const expectedIndent = repeatStr(oneIndent, expectedIndents);
                if (lineText.length > 0) {
                    _assertUnshiftCommand(tabSize, indentSize, insertSpaces, [lineText + 'aaa'], [createSingleEditOp(expectedIndent, 1, 1, 1, lineText.length + 1)]);
                }
                else {
                    _assertUnshiftCommand(tabSize, indentSize, insertSpaces, [lineText + 'aaa'], []);
                }
            };
            const testIndent = (tabSize, indentSize, insertSpaces, lineText, expectedIndents) => {
                const oneIndent = insertSpaces ? repeatStr(' ', indentSize) : '\t';
                const expectedIndent = repeatStr(oneIndent, expectedIndents);
                _assertShiftCommand(tabSize, indentSize, insertSpaces, [lineText + 'aaa'], [createSingleEditOp(expectedIndent, 1, 1, 1, lineText.length + 1)]);
            };
            const testIndentation = (tabSize, indentSize, lineText, expectedOnOutdent, expectedOnIndent) => {
                testOutdent(tabSize, indentSize, true, lineText, expectedOnOutdent);
                testOutdent(tabSize, indentSize, false, lineText, expectedOnOutdent);
                testIndent(tabSize, indentSize, true, lineText, expectedOnIndent);
                testIndent(tabSize, indentSize, false, lineText, expectedOnIndent);
            };
            // insertSpaces: true
            // 0 => 0
            testIndentation(4, 4, '', 0, 1);
            // 1 => 0
            testIndentation(4, 4, '\t', 0, 2);
            testIndentation(4, 4, ' ', 0, 1);
            testIndentation(4, 4, ' \t', 0, 2);
            testIndentation(4, 4, '  ', 0, 1);
            testIndentation(4, 4, '  \t', 0, 2);
            testIndentation(4, 4, '   ', 0, 1);
            testIndentation(4, 4, '   \t', 0, 2);
            testIndentation(4, 4, '    ', 0, 2);
            // 2 => 1
            testIndentation(4, 4, '\t\t', 1, 3);
            testIndentation(4, 4, '\t ', 1, 2);
            testIndentation(4, 4, '\t \t', 1, 3);
            testIndentation(4, 4, '\t  ', 1, 2);
            testIndentation(4, 4, '\t  \t', 1, 3);
            testIndentation(4, 4, '\t   ', 1, 2);
            testIndentation(4, 4, '\t   \t', 1, 3);
            testIndentation(4, 4, '\t    ', 1, 3);
            testIndentation(4, 4, ' \t\t', 1, 3);
            testIndentation(4, 4, ' \t ', 1, 2);
            testIndentation(4, 4, ' \t \t', 1, 3);
            testIndentation(4, 4, ' \t  ', 1, 2);
            testIndentation(4, 4, ' \t  \t', 1, 3);
            testIndentation(4, 4, ' \t   ', 1, 2);
            testIndentation(4, 4, ' \t   \t', 1, 3);
            testIndentation(4, 4, ' \t    ', 1, 3);
            testIndentation(4, 4, '  \t\t', 1, 3);
            testIndentation(4, 4, '  \t ', 1, 2);
            testIndentation(4, 4, '  \t \t', 1, 3);
            testIndentation(4, 4, '  \t  ', 1, 2);
            testIndentation(4, 4, '  \t  \t', 1, 3);
            testIndentation(4, 4, '  \t   ', 1, 2);
            testIndentation(4, 4, '  \t   \t', 1, 3);
            testIndentation(4, 4, '  \t    ', 1, 3);
            testIndentation(4, 4, '   \t\t', 1, 3);
            testIndentation(4, 4, '   \t ', 1, 2);
            testIndentation(4, 4, '   \t \t', 1, 3);
            testIndentation(4, 4, '   \t  ', 1, 2);
            testIndentation(4, 4, '   \t  \t', 1, 3);
            testIndentation(4, 4, '   \t   ', 1, 2);
            testIndentation(4, 4, '   \t   \t', 1, 3);
            testIndentation(4, 4, '   \t    ', 1, 3);
            testIndentation(4, 4, '    \t', 1, 3);
            testIndentation(4, 4, '     ', 1, 2);
            testIndentation(4, 4, '     \t', 1, 3);
            testIndentation(4, 4, '      ', 1, 2);
            testIndentation(4, 4, '      \t', 1, 3);
            testIndentation(4, 4, '       ', 1, 2);
            testIndentation(4, 4, '       \t', 1, 3);
            testIndentation(4, 4, '        ', 1, 3);
            // 3 => 2
            testIndentation(4, 4, '         ', 2, 3);
            function _assertUnshiftCommand(tabSize, indentSize, insertSpaces, text, expected) {
                return (0, testTextModel_1.withEditorModel)(text, (model) => {
                    const testLanguageConfigurationService = new testLanguageConfigurationService_1.TestLanguageConfigurationService();
                    const op = new shiftCommand_1.ShiftCommand(new selection_1.Selection(1, 1, text.length + 1, 1), {
                        isUnshift: true,
                        tabSize: tabSize,
                        indentSize: indentSize,
                        insertSpaces: insertSpaces,
                        useTabStops: true,
                        autoIndent: 4 /* EditorAutoIndentStrategy.Full */,
                    }, testLanguageConfigurationService);
                    const actual = (0, testCommand_1.getEditOperation)(model, op);
                    assert.deepStrictEqual(actual, expected);
                    testLanguageConfigurationService.dispose();
                });
            }
            function _assertShiftCommand(tabSize, indentSize, insertSpaces, text, expected) {
                return (0, testTextModel_1.withEditorModel)(text, (model) => {
                    const testLanguageConfigurationService = new testLanguageConfigurationService_1.TestLanguageConfigurationService();
                    const op = new shiftCommand_1.ShiftCommand(new selection_1.Selection(1, 1, text.length + 1, 1), {
                        isUnshift: false,
                        tabSize: tabSize,
                        indentSize: indentSize,
                        insertSpaces: insertSpaces,
                        useTabStops: true,
                        autoIndent: 4 /* EditorAutoIndentStrategy.Full */,
                    }, testLanguageConfigurationService);
                    const actual = (0, testCommand_1.getEditOperation)(model, op);
                    assert.deepStrictEqual(actual, expected);
                    testLanguageConfigurationService.dispose();
                });
            }
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hpZnRDb21tYW5kLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvdGVzdC9icm93c2VyL2NvbW1hbmRzL3NoaWZ0Q29tbWFuZC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWtCaEc7O09BRUc7SUFDSCxTQUFTLGtCQUFrQixDQUFDLElBQVksRUFBRSxrQkFBMEIsRUFBRSxjQUFzQixFQUFFLHNCQUE4QixrQkFBa0IsRUFBRSxrQkFBMEIsY0FBYztRQUN2TCxPQUFPO1lBQ04sS0FBSyxFQUFFLElBQUksYUFBSyxDQUFDLG1CQUFtQixFQUFFLGVBQWUsRUFBRSxrQkFBa0IsRUFBRSxjQUFjLENBQUM7WUFDMUYsSUFBSSxFQUFFLElBQUk7WUFDVixnQkFBZ0IsRUFBRSxLQUFLO1NBQ3ZCLENBQUM7SUFDSCxDQUFDO0lBRUQsSUFBTSxtQkFBbUIsR0FBekIsTUFBTSxtQkFBb0IsU0FBUSxzQkFBVTs7aUJBRTdCLGVBQVUsR0FBRyxhQUFhLEFBQWhCLENBQWlCO1FBR3pDLFlBQ21CLGVBQWlDLEVBQ3BCLDRCQUEyRDtZQUUxRixLQUFLLEVBQUUsQ0FBQztZQU5PLGVBQVUsR0FBRyxxQkFBbUIsQ0FBQyxVQUFVLENBQUM7WUFPM0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxRSxJQUFJLENBQUMsU0FBUyxDQUFDLDRCQUE0QixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO2dCQUNyRSxRQUFRLEVBQUU7b0JBQ1QsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO29CQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztvQkFDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7aUJBQ1Y7Z0JBRUQsWUFBWSxFQUFFLCtDQUFzQjthQUNwQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7O0lBcEJJLG1CQUFtQjtRQU10QixXQUFBLDJCQUFnQixDQUFBO1FBQ2hCLFdBQUEsNkRBQTZCLENBQUE7T0FQMUIsbUJBQW1CLENBcUJ4QjtJQUVELFNBQVMsZ0JBQWdCLENBQUMsS0FBZSxFQUFFLFVBQXlCLEVBQUUsV0FBb0IsRUFBRSxTQUFvQixFQUFFLGFBQXVCLEVBQUUsaUJBQTRCLEVBQUUsT0FBNEU7UUFDcFAsSUFBQSx5QkFBVyxFQUFDLEtBQUssRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsSUFBSSwyQkFBWSxDQUFDLEdBQUcsRUFBRTtZQUNsRixTQUFTLEVBQUUsS0FBSztZQUNoQixPQUFPLEVBQUUsQ0FBQztZQUNWLFVBQVUsRUFBRSxDQUFDO1lBQ2IsWUFBWSxFQUFFLEtBQUs7WUFDbkIsV0FBVyxFQUFFLFdBQVc7WUFDeEIsVUFBVSx1Q0FBK0I7U0FDekMsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLDZEQUE2QixDQUFDLENBQUMsRUFBRSxhQUFhLEVBQUUsaUJBQWlCLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3hHLENBQUM7SUFFRCxTQUFTLGtCQUFrQixDQUFDLEtBQWUsRUFBRSxVQUF5QixFQUFFLFdBQW9CLEVBQUUsU0FBb0IsRUFBRSxhQUF1QixFQUFFLGlCQUE0QixFQUFFLE9BQTRFO1FBQ3RQLElBQUEseUJBQVcsRUFBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLElBQUksMkJBQVksQ0FBQyxHQUFHLEVBQUU7WUFDbEYsU0FBUyxFQUFFLElBQUk7WUFDZixPQUFPLEVBQUUsQ0FBQztZQUNWLFVBQVUsRUFBRSxDQUFDO1lBQ2IsWUFBWSxFQUFFLEtBQUs7WUFDbkIsV0FBVyxFQUFFLFdBQVc7WUFDeEIsVUFBVSx1Q0FBK0I7U0FDekMsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLDZEQUE2QixDQUFDLENBQUMsRUFBRSxhQUFhLEVBQUUsaUJBQWlCLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3hHLENBQUM7SUFFRCxTQUFTLDhCQUE4QixDQUFDLFFBQTBCLEVBQUUsV0FBNEI7UUFDL0YsTUFBTSw0QkFBNEIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDZEQUE2QixDQUFDLENBQUM7UUFDakYsTUFBTSxlQUFlLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywyQkFBZ0IsQ0FBQyxDQUFDO1FBQ3ZELFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxtQkFBbUIsQ0FBQyxlQUFlLEVBQUUsNEJBQTRCLENBQUMsQ0FBQyxDQUFDO0lBQ3pGLENBQUM7SUFFRCxLQUFLLENBQUMsZ0NBQWdDLEVBQUUsR0FBRyxFQUFFO1FBRTVDLElBQUEsK0NBQXVDLEdBQUUsQ0FBQztRQUUxQyxrQkFBa0I7UUFFbEIsSUFBSSxDQUFDLDBDQUEwQyxFQUFFLEdBQUcsRUFBRTtZQUNyRCxnQkFBZ0IsQ0FDZjtnQkFDQyxlQUFlO2dCQUNmLG9CQUFvQjtnQkFDcEIsZ0JBQWdCO2dCQUNoQixFQUFFO2dCQUNGLEtBQUs7YUFDTCxFQUNELElBQUksRUFDSixJQUFJLEVBQ0osSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN6QjtnQkFDQyxpQkFBaUI7Z0JBQ2pCLG9CQUFvQjtnQkFDcEIsZ0JBQWdCO2dCQUNoQixFQUFFO2dCQUNGLEtBQUs7YUFDTCxFQUNELElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FDekIsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGtDQUFrQyxFQUFFLEdBQUcsRUFBRTtZQUM3QyxnQkFBZ0IsQ0FDZjtnQkFDQyxlQUFlO2dCQUNmLG9CQUFvQjtnQkFDcEIsZ0JBQWdCO2dCQUNoQixFQUFFO2dCQUNGLEtBQUs7YUFDTCxFQUNELElBQUksRUFDSixJQUFJLEVBQ0osSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN6QjtnQkFDQyxpQkFBaUI7Z0JBQ2pCLG9CQUFvQjtnQkFDcEIsZ0JBQWdCO2dCQUNoQixFQUFFO2dCQUNGLEtBQUs7YUFDTCxFQUNELElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FDekIsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGtDQUFrQyxFQUFFLEdBQUcsRUFBRTtZQUM3QyxnQkFBZ0IsQ0FDZjtnQkFDQyxlQUFlO2dCQUNmLG9CQUFvQjtnQkFDcEIsZ0JBQWdCO2dCQUNoQixFQUFFO2dCQUNGLEtBQUs7YUFDTCxFQUNELElBQUksRUFDSixJQUFJLEVBQ0osSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN6QjtnQkFDQyxpQkFBaUI7Z0JBQ2pCLG9CQUFvQjtnQkFDcEIsZ0JBQWdCO2dCQUNoQixFQUFFO2dCQUNGLEtBQUs7YUFDTCxFQUNELElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FDekIsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGNBQWMsRUFBRSxHQUFHLEVBQUU7WUFDekIsZ0JBQWdCLENBQ2Y7Z0JBQ0MsZUFBZTtnQkFDZixvQkFBb0I7Z0JBQ3BCLGdCQUFnQjtnQkFDaEIsRUFBRTtnQkFDRixLQUFLO2FBQ0wsRUFDRCxJQUFJLEVBQ0osSUFBSSxFQUNKLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDekI7Z0JBQ0MsaUJBQWlCO2dCQUNqQixvQkFBb0I7Z0JBQ3BCLGdCQUFnQjtnQkFDaEIsRUFBRTtnQkFDRixLQUFLO2FBQ0wsRUFDRCxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQ3pCLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxnQ0FBZ0MsRUFBRSxHQUFHLEVBQUU7WUFDM0MsZ0JBQWdCLENBQ2Y7Z0JBQ0MsZUFBZTtnQkFDZixvQkFBb0I7Z0JBQ3BCLGdCQUFnQjtnQkFDaEIsRUFBRTtnQkFDRixLQUFLO2FBQ0wsRUFDRCxJQUFJLEVBQ0osSUFBSSxFQUNKLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDekI7Z0JBQ0MsaUJBQWlCO2dCQUNqQixvQkFBb0I7Z0JBQ3BCLGdCQUFnQjtnQkFDaEIsRUFBRTtnQkFDRixLQUFLO2FBQ0wsRUFDRCxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQ3pCLENBQUM7WUFFRixnQkFBZ0IsQ0FDZjtnQkFDQyxpQkFBaUI7Z0JBQ2pCLG9CQUFvQjtnQkFDcEIsZ0JBQWdCO2dCQUNoQixFQUFFO2dCQUNGLEtBQUs7YUFDTCxFQUNELElBQUksRUFDSixJQUFJLEVBQ0osSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN6QjtnQkFDQyxpQkFBaUI7Z0JBQ2pCLHNCQUFzQjtnQkFDdEIsZ0JBQWdCO2dCQUNoQixFQUFFO2dCQUNGLEtBQUs7YUFDTCxFQUNELElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FDekIsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHVCQUF1QixFQUFFLEdBQUcsRUFBRTtZQUNsQyxnQkFBZ0IsQ0FDZjtnQkFDQyxlQUFlO2dCQUNmLG9CQUFvQjtnQkFDcEIsZ0JBQWdCO2dCQUNoQixFQUFFO2dCQUNGLEtBQUs7YUFDTCxFQUNELElBQUksRUFDSixJQUFJLEVBQ0osSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN6QjtnQkFDQyxpQkFBaUI7Z0JBQ2pCLHNCQUFzQjtnQkFDdEIsZ0JBQWdCO2dCQUNoQixFQUFFO2dCQUNGLEtBQUs7YUFDTCxFQUNELElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FDekIsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLDZCQUE2QixFQUFFLEdBQUcsRUFBRTtZQUN4QyxnQkFBZ0IsQ0FDZjtnQkFDQyxlQUFlO2dCQUNmLG9CQUFvQjtnQkFDcEIsZ0JBQWdCO2dCQUNoQixFQUFFO2dCQUNGLEtBQUs7YUFDTCxFQUNELElBQUksRUFDSixJQUFJLEVBQ0osSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN6QjtnQkFDQyxpQkFBaUI7Z0JBQ2pCLHNCQUFzQjtnQkFDdEIsZ0JBQWdCO2dCQUNoQixFQUFFO2dCQUNGLEtBQUs7YUFDTCxFQUNELElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FDekIsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHlCQUF5QixFQUFFLEdBQUcsRUFBRTtZQUNwQyxnQkFBZ0IsQ0FDZjtnQkFDQyxlQUFlO2dCQUNmLG9CQUFvQjtnQkFDcEIsZ0JBQWdCO2dCQUNoQixFQUFFO2dCQUNGLEtBQUs7YUFDTCxFQUNELElBQUksRUFDSixJQUFJLEVBQ0osSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN6QjtnQkFDQyxlQUFlO2dCQUNmLG9CQUFvQjtnQkFDcEIsZ0JBQWdCO2dCQUNoQixFQUFFO2dCQUNGLE9BQU87YUFDUCxFQUNELElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FDekIsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHlFQUF5RSxFQUFFLEdBQUcsRUFBRTtZQUNwRixnQkFBZ0IsQ0FDZjtnQkFDQyxlQUFlO2dCQUNmLG9CQUFvQjtnQkFDcEIsZ0JBQWdCO2dCQUNoQixFQUFFO2dCQUNGLEtBQUs7YUFDTCxFQUNELElBQUksRUFDSixJQUFJLEVBQ0osSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN6QjtnQkFDQyxpQkFBaUI7Z0JBQ2pCLHNCQUFzQjtnQkFDdEIsZ0JBQWdCO2dCQUNoQixFQUFFO2dCQUNGLE9BQU87YUFDUCxFQUNELElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FDekIsQ0FBQztZQUVGLGdCQUFnQixDQUNmO2dCQUNDLGVBQWU7Z0JBQ2Ysb0JBQW9CO2dCQUNwQixnQkFBZ0I7Z0JBQ2hCLEVBQUU7Z0JBQ0YsS0FBSzthQUNMLEVBQ0QsSUFBSSxFQUNKLElBQUksRUFDSixJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3pCO2dCQUNDLGVBQWU7Z0JBQ2Ysb0JBQW9CO2dCQUNwQixnQkFBZ0I7Z0JBQ2hCLElBQUk7Z0JBQ0osS0FBSzthQUNMLEVBQ0QsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUN6QixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxvQkFBb0I7UUFFcEIsSUFBSSxDQUFDLG9DQUFvQyxFQUFFLEdBQUcsRUFBRTtZQUMvQyxnQkFBZ0IsQ0FDZjtnQkFDQyxlQUFlO2dCQUNmLG9CQUFvQjtnQkFDcEIsZ0JBQWdCO2dCQUNoQixFQUFFO2dCQUNGLEtBQUs7YUFDTCxFQUNELElBQUksRUFDSixJQUFJLEVBQ0osSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN6QjtnQkFDQyxlQUFlO2dCQUNmLHNCQUFzQjtnQkFDdEIsZ0JBQWdCO2dCQUNoQixFQUFFO2dCQUNGLEtBQUs7YUFDTCxFQUNELElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FDekIsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLG9DQUFvQyxFQUFFLEdBQUcsRUFBRTtZQUMvQyxnQkFBZ0IsQ0FDZjtnQkFDQyxlQUFlO2dCQUNmLG9CQUFvQjtnQkFDcEIsZ0JBQWdCO2dCQUNoQixFQUFFO2dCQUNGLEtBQUs7YUFDTCxFQUNELElBQUksRUFDSixJQUFJLEVBQ0osSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN6QjtnQkFDQyxlQUFlO2dCQUNmLHNCQUFzQjtnQkFDdEIsZ0JBQWdCO2dCQUNoQixFQUFFO2dCQUNGLEtBQUs7YUFDTCxFQUNELElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FDekIsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEdBQUcsRUFBRTtZQUMzQixrQkFBa0IsQ0FDakI7Z0JBQ0MsZUFBZTtnQkFDZixvQkFBb0I7Z0JBQ3BCLGdCQUFnQjtnQkFDaEIsRUFBRTtnQkFDRixLQUFLO2FBQ0wsRUFDRCxJQUFJLEVBQ0osSUFBSSxFQUNKLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDekI7Z0JBQ0MsZUFBZTtnQkFDZixvQkFBb0I7Z0JBQ3BCLGdCQUFnQjtnQkFDaEIsRUFBRTtnQkFDRixLQUFLO2FBQ0wsRUFDRCxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQ3pCLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQywyQkFBMkIsRUFBRSxHQUFHLEVBQUU7WUFDdEMsa0JBQWtCLENBQ2pCO2dCQUNDLGVBQWU7Z0JBQ2Ysb0JBQW9CO2dCQUNwQixnQkFBZ0I7Z0JBQ2hCLEVBQUU7Z0JBQ0YsS0FBSzthQUNMLEVBQ0QsSUFBSSxFQUNKLElBQUksRUFDSixJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3pCO2dCQUNDLGVBQWU7Z0JBQ2Ysa0JBQWtCO2dCQUNsQixnQkFBZ0I7Z0JBQ2hCLEVBQUU7Z0JBQ0YsS0FBSzthQUNMLEVBQ0QsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUN6QixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsMkJBQTJCLEVBQUUsR0FBRyxFQUFFO1lBQ3RDLGtCQUFrQixDQUNqQjtnQkFDQyxlQUFlO2dCQUNmLG9CQUFvQjtnQkFDcEIsZ0JBQWdCO2dCQUNoQixFQUFFO2dCQUNGLEtBQUs7YUFDTCxFQUNELElBQUksRUFDSixJQUFJLEVBQ0osSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN6QjtnQkFDQyxlQUFlO2dCQUNmLGtCQUFrQjtnQkFDbEIsZ0JBQWdCO2dCQUNoQixFQUFFO2dCQUNGLEtBQUs7YUFDTCxFQUNELElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FDekIsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLG1DQUFtQyxFQUFFLEdBQUcsRUFBRTtZQUM5QyxrQkFBa0IsQ0FDakI7Z0JBQ0MsZUFBZTtnQkFDZixvQkFBb0I7Z0JBQ3BCLGdCQUFnQjtnQkFDaEIsRUFBRTtnQkFDRixLQUFLO2FBQ0wsRUFDRCxJQUFJLEVBQ0osSUFBSSxFQUNKLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDekI7Z0JBQ0MsZUFBZTtnQkFDZixvQkFBb0I7Z0JBQ3BCLGdCQUFnQjtnQkFDaEIsRUFBRTtnQkFDRixLQUFLO2FBQ0wsRUFDRCxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQ3pCLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyw0QkFBNEIsRUFBRSxHQUFHLEVBQUU7WUFDdkMsa0JBQWtCLENBQ2pCO2dCQUNDLGVBQWU7Z0JBQ2Ysb0JBQW9CO2dCQUNwQixnQkFBZ0I7Z0JBQ2hCLEVBQUU7Z0JBQ0YsS0FBSzthQUNMLEVBQ0QsSUFBSSxFQUNKLElBQUksRUFDSixJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3pCO2dCQUNDLGVBQWU7Z0JBQ2Ysa0JBQWtCO2dCQUNsQixZQUFZO2dCQUNaLEVBQUU7Z0JBQ0YsS0FBSzthQUNMLEVBQ0QsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUN6QixDQUFDO1lBRUYsa0JBQWtCLENBQ2pCO2dCQUNDLGVBQWU7Z0JBQ2Ysa0JBQWtCO2dCQUNsQixZQUFZO2dCQUNaLEVBQUU7Z0JBQ0YsS0FBSzthQUNMLEVBQ0QsSUFBSSxFQUNKLElBQUksRUFDSixJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3pCO2dCQUNDLGVBQWU7Z0JBQ2YsZ0JBQWdCO2dCQUNoQixZQUFZO2dCQUNaLEVBQUU7Z0JBQ0YsS0FBSzthQUNMLEVBQ0QsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUN6QixDQUFDO1lBRUYsZ0JBQWdCLENBQ2Y7Z0JBQ0MsZUFBZTtnQkFDZixnQkFBZ0I7Z0JBQ2hCLFlBQVk7Z0JBQ1osRUFBRTtnQkFDRixLQUFLO2FBQ0wsRUFDRCxJQUFJLEVBQ0osSUFBSSxFQUNKLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDekI7Z0JBQ0MsaUJBQWlCO2dCQUNqQixrQkFBa0I7Z0JBQ2xCLGNBQWM7Z0JBQ2QsRUFBRTtnQkFDRixPQUFPO2FBQ1AsRUFDRCxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQ3pCLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxtREFBbUQsRUFBRSxHQUFHLEVBQUU7WUFDOUQsa0JBQWtCLENBQ2pCO2dCQUNDLGVBQWU7Z0JBQ2Ysb0JBQW9CO2dCQUNwQixnQkFBZ0I7Z0JBQ2hCLEVBQUU7Z0JBQ0YsS0FBSzthQUNMLEVBQ0QsSUFBSSxFQUNKLElBQUksRUFDSixJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3pCO2dCQUNDLGVBQWU7Z0JBQ2Ysa0JBQWtCO2dCQUNsQixnQkFBZ0I7Z0JBQ2hCLEVBQUU7Z0JBQ0YsS0FBSzthQUNMLEVBQ0QsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUN6QixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsaURBQWlELEVBQUUsR0FBRyxFQUFFO1lBQzVELGdCQUFnQixDQUNmO2dCQUNDLEVBQUU7Z0JBQ0YsS0FBSztnQkFDTCxrQkFBa0I7Z0JBQ2xCLEtBQUs7Z0JBQ0wscUJBQXFCO2FBQ3JCLEVBQ0QsbUJBQW1CLENBQUMsVUFBVSxFQUM5QixJQUFJLEVBQ0osSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUMxQjtnQkFDQyxFQUFFO2dCQUNGLE9BQU87Z0JBQ1Asb0JBQW9CO2dCQUNwQixPQUFPO2dCQUNQLHVCQUF1QjthQUN2QixFQUNELElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFDMUIsOEJBQThCLENBQzlCLENBQUM7WUFFRixrQkFBa0IsQ0FDakI7Z0JBQ0MsRUFBRTtnQkFDRixLQUFLO2dCQUNMLGtCQUFrQjtnQkFDbEIsS0FBSztnQkFDTCxxQkFBcUI7YUFDckIsRUFDRCxtQkFBbUIsQ0FBQyxVQUFVLEVBQzlCLElBQUksRUFDSixJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQzFCO2dCQUNDLEVBQUU7Z0JBQ0YsS0FBSztnQkFDTCxrQkFBa0I7Z0JBQ2xCLEtBQUs7Z0JBQ0wscUJBQXFCO2FBQ3JCLEVBQ0QsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUMxQiw4QkFBOEIsQ0FDOUIsQ0FBQztZQUVGLGtCQUFrQixDQUNqQjtnQkFDQyxJQUFJO2dCQUNKLE9BQU87Z0JBQ1Asb0JBQW9CO2dCQUNwQixPQUFPO2dCQUNQLHVCQUF1QjthQUN2QixFQUNELG1CQUFtQixDQUFDLFVBQVUsRUFDOUIsSUFBSSxFQUNKLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFDMUI7Z0JBQ0MsRUFBRTtnQkFDRixLQUFLO2dCQUNMLGtCQUFrQjtnQkFDbEIsS0FBSztnQkFDTCxxQkFBcUI7YUFDckIsRUFDRCxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQzFCLDhCQUE4QixDQUM5QixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsa0RBQWtELEVBQUUsR0FBRyxFQUFFO1lBQzdELGdCQUFnQixDQUNmO2dCQUNDLEVBQUU7Z0JBQ0YsS0FBSztnQkFDTCxTQUFTO2dCQUNULElBQUk7Z0JBQ0osbUJBQW1CO2dCQUNuQixLQUFLO2dCQUNMLGNBQWM7YUFDZCxFQUNELG1CQUFtQixDQUFDLFVBQVUsRUFDOUIsSUFBSSxFQUNKLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFDMUI7Z0JBQ0MsRUFBRTtnQkFDRixPQUFPO2dCQUNQLFdBQVc7Z0JBQ1gsTUFBTTtnQkFDTixxQkFBcUI7Z0JBQ3JCLE9BQU87Z0JBQ1AsZ0JBQWdCO2FBQ2hCLEVBQ0QsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUMxQiw4QkFBOEIsQ0FDOUIsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHlFQUF5RSxFQUFFLEdBQUcsRUFBRTtZQUNwRixJQUFBLHlCQUFXLEVBQ1Y7Z0JBQ0Msc0JBQXNCO2dCQUN0QixnQkFBZ0I7Z0JBQ2hCLGdCQUFnQjtnQkFDaEIsZ0JBQWdCO2dCQUNoQixnQkFBZ0I7Z0JBQ2hCLGdCQUFnQjtnQkFDaEIsZ0JBQWdCO2dCQUNoQixnQkFBZ0I7Z0JBQ2hCLGdCQUFnQjtnQkFDaEIsZ0JBQWdCO2dCQUNoQixpQkFBaUI7Z0JBQ2pCLGlCQUFpQjtnQkFDakIsRUFBRTthQUNGLEVBQ0QsSUFBSSxFQUNKLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFDMUIsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxJQUFJLDJCQUFZLENBQUMsR0FBRyxFQUFFO2dCQUN4QyxTQUFTLEVBQUUsS0FBSztnQkFDaEIsT0FBTyxFQUFFLENBQUM7Z0JBQ1YsVUFBVSxFQUFFLENBQUM7Z0JBQ2IsWUFBWSxFQUFFLElBQUk7Z0JBQ2xCLFdBQVcsRUFBRSxLQUFLO2dCQUNsQixVQUFVLHVDQUErQjthQUN6QyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsNkRBQTZCLENBQUMsQ0FBQyxFQUMvQztnQkFDQywwQkFBMEI7Z0JBQzFCLG9CQUFvQjtnQkFDcEIsb0JBQW9CO2dCQUNwQixvQkFBb0I7Z0JBQ3BCLG9CQUFvQjtnQkFDcEIsb0JBQW9CO2dCQUNwQixvQkFBb0I7Z0JBQ3BCLG9CQUFvQjtnQkFDcEIsb0JBQW9CO2dCQUNwQixvQkFBb0I7Z0JBQ3BCLHFCQUFxQjtnQkFDckIscUJBQXFCO2dCQUNyQixFQUFFO2FBQ0YsRUFDRCxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQzFCLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyx5RUFBeUUsRUFBRSxHQUFHLEVBQUU7WUFDcEYsSUFBQSx5QkFBVyxFQUNWO2dCQUNDLDBCQUEwQjtnQkFDMUIsb0JBQW9CO2dCQUNwQixvQkFBb0I7Z0JBQ3BCLG9CQUFvQjtnQkFDcEIsb0JBQW9CO2dCQUNwQixvQkFBb0I7Z0JBQ3BCLG9CQUFvQjtnQkFDcEIsb0JBQW9CO2dCQUNwQixvQkFBb0I7Z0JBQ3BCLG9CQUFvQjtnQkFDcEIscUJBQXFCO2dCQUNyQixxQkFBcUI7Z0JBQ3JCLEVBQUU7YUFDRixFQUNELElBQUksRUFDSixJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQzFCLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsSUFBSSwyQkFBWSxDQUFDLEdBQUcsRUFBRTtnQkFDeEMsU0FBUyxFQUFFLElBQUk7Z0JBQ2YsT0FBTyxFQUFFLENBQUM7Z0JBQ1YsVUFBVSxFQUFFLENBQUM7Z0JBQ2IsWUFBWSxFQUFFLElBQUk7Z0JBQ2xCLFdBQVcsRUFBRSxLQUFLO2dCQUNsQixVQUFVLHVDQUErQjthQUN6QyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsNkRBQTZCLENBQUMsQ0FBQyxFQUMvQztnQkFDQyxzQkFBc0I7Z0JBQ3RCLGdCQUFnQjtnQkFDaEIsZ0JBQWdCO2dCQUNoQixnQkFBZ0I7Z0JBQ2hCLGdCQUFnQjtnQkFDaEIsZ0JBQWdCO2dCQUNoQixnQkFBZ0I7Z0JBQ2hCLGdCQUFnQjtnQkFDaEIsZ0JBQWdCO2dCQUNoQixnQkFBZ0I7Z0JBQ2hCLGlCQUFpQjtnQkFDakIsaUJBQWlCO2dCQUNqQixFQUFFO2FBQ0YsRUFDRCxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQzFCLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyx5RUFBeUUsRUFBRSxHQUFHLEVBQUU7WUFDcEYsSUFBQSx5QkFBVyxFQUNWO2dCQUNDLDBCQUEwQjtnQkFDMUIsb0JBQW9CO2dCQUNwQixvQkFBb0I7Z0JBQ3BCLG9CQUFvQjtnQkFDcEIsb0JBQW9CO2dCQUNwQixvQkFBb0I7Z0JBQ3BCLG9CQUFvQjtnQkFDcEIsb0JBQW9CO2dCQUNwQixvQkFBb0I7Z0JBQ3BCLG9CQUFvQjtnQkFDcEIscUJBQXFCO2dCQUNyQixxQkFBcUI7Z0JBQ3JCLEVBQUU7YUFDRixFQUNELElBQUksRUFDSixJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQzFCLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsSUFBSSwyQkFBWSxDQUFDLEdBQUcsRUFBRTtnQkFDeEMsU0FBUyxFQUFFLElBQUk7Z0JBQ2YsT0FBTyxFQUFFLENBQUM7Z0JBQ1YsVUFBVSxFQUFFLENBQUM7Z0JBQ2IsWUFBWSxFQUFFLEtBQUs7Z0JBQ25CLFdBQVcsRUFBRSxLQUFLO2dCQUNsQixVQUFVLHVDQUErQjthQUN6QyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsNkRBQTZCLENBQUMsQ0FBQyxFQUMvQztnQkFDQyxzQkFBc0I7Z0JBQ3RCLGdCQUFnQjtnQkFDaEIsZ0JBQWdCO2dCQUNoQixnQkFBZ0I7Z0JBQ2hCLGdCQUFnQjtnQkFDaEIsZ0JBQWdCO2dCQUNoQixnQkFBZ0I7Z0JBQ2hCLGdCQUFnQjtnQkFDaEIsZ0JBQWdCO2dCQUNoQixnQkFBZ0I7Z0JBQ2hCLGlCQUFpQjtnQkFDakIsaUJBQWlCO2dCQUNqQixFQUFFO2FBQ0YsRUFDRCxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQzFCLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyx5RUFBeUUsRUFBRSxHQUFHLEVBQUU7WUFDcEYsSUFBQSx5QkFBVyxFQUNWO2dCQUNDLHdCQUF3QjtnQkFDeEIsa0JBQWtCO2dCQUNsQixrQkFBa0I7Z0JBQ2xCLGtCQUFrQjtnQkFDbEIsa0JBQWtCO2dCQUNsQixrQkFBa0I7Z0JBQ2xCLGtCQUFrQjtnQkFDbEIsa0JBQWtCO2dCQUNsQixrQkFBa0I7Z0JBQ2xCLGtCQUFrQjtnQkFDbEIsbUJBQW1CO2dCQUNuQixtQkFBbUI7Z0JBQ25CLEVBQUU7YUFDRixFQUNELElBQUksRUFDSixJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQzFCLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsSUFBSSwyQkFBWSxDQUFDLEdBQUcsRUFBRTtnQkFDeEMsU0FBUyxFQUFFLElBQUk7Z0JBQ2YsT0FBTyxFQUFFLENBQUM7Z0JBQ1YsVUFBVSxFQUFFLENBQUM7Z0JBQ2IsWUFBWSxFQUFFLElBQUk7Z0JBQ2xCLFdBQVcsRUFBRSxLQUFLO2dCQUNsQixVQUFVLHVDQUErQjthQUN6QyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsNkRBQTZCLENBQUMsQ0FBQyxFQUMvQztnQkFDQyxzQkFBc0I7Z0JBQ3RCLGdCQUFnQjtnQkFDaEIsZ0JBQWdCO2dCQUNoQixnQkFBZ0I7Z0JBQ2hCLGdCQUFnQjtnQkFDaEIsZ0JBQWdCO2dCQUNoQixnQkFBZ0I7Z0JBQ2hCLGdCQUFnQjtnQkFDaEIsZ0JBQWdCO2dCQUNoQixnQkFBZ0I7Z0JBQ2hCLGlCQUFpQjtnQkFDakIsaUJBQWlCO2dCQUNqQixFQUFFO2FBQ0YsRUFDRCxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQzFCLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxvR0FBb0csRUFBRSxHQUFHLEVBQUU7WUFDL0csSUFBQSx5QkFBVyxFQUNWO2dCQUNDLGNBQWM7Z0JBQ2QsY0FBYzthQUNkLEVBQ0QsSUFBSSxFQUNKLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFDMUIsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxJQUFJLDJCQUFZLENBQUMsR0FBRyxFQUFFO2dCQUN4QyxTQUFTLEVBQUUsS0FBSztnQkFDaEIsT0FBTyxFQUFFLENBQUM7Z0JBQ1YsVUFBVSxFQUFFLENBQUM7Z0JBQ2IsWUFBWSxFQUFFLEtBQUs7Z0JBQ25CLFdBQVcsRUFBRSxJQUFJO2dCQUNqQixVQUFVLHVDQUErQjthQUN6QyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsNkRBQTZCLENBQUMsQ0FBQyxFQUMvQztnQkFDQyxnQkFBZ0I7Z0JBQ2hCLGNBQWM7YUFDZCxFQUNELElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FDMUIsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGtEQUFrRCxFQUFFLEdBQUcsRUFBRTtZQUU3RCxNQUFNLFNBQVMsR0FBRyxDQUFDLEdBQVcsRUFBRSxHQUFXLEVBQVUsRUFBRTtnQkFDdEQsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNYLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQzdCLENBQUMsSUFBSSxHQUFHLENBQUM7aUJBQ1Q7Z0JBQ0QsT0FBTyxDQUFDLENBQUM7WUFDVixDQUFDLENBQUM7WUFFRixNQUFNLFdBQVcsR0FBRyxDQUFDLE9BQWUsRUFBRSxVQUFrQixFQUFFLFlBQXFCLEVBQUUsUUFBZ0IsRUFBRSxlQUF1QixFQUFFLEVBQUU7Z0JBQzdILE1BQU0sU0FBUyxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUNuRSxNQUFNLGNBQWMsR0FBRyxTQUFTLENBQUMsU0FBUyxFQUFFLGVBQWUsQ0FBQyxDQUFDO2dCQUM3RCxJQUFJLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO29CQUN4QixxQkFBcUIsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsRUFBRSxDQUFDLGtCQUFrQixDQUFDLGNBQWMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDako7cUJBQU07b0JBQ04scUJBQXFCLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7aUJBQ2pGO1lBQ0YsQ0FBQyxDQUFDO1lBRUYsTUFBTSxVQUFVLEdBQUcsQ0FBQyxPQUFlLEVBQUUsVUFBa0IsRUFBRSxZQUFxQixFQUFFLFFBQWdCLEVBQUUsZUFBdUIsRUFBRSxFQUFFO2dCQUM1SCxNQUFNLFNBQVMsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDbkUsTUFBTSxjQUFjLEdBQUcsU0FBUyxDQUFDLFNBQVMsRUFBRSxlQUFlLENBQUMsQ0FBQztnQkFDN0QsbUJBQW1CLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEosQ0FBQyxDQUFDO1lBRUYsTUFBTSxlQUFlLEdBQUcsQ0FBQyxPQUFlLEVBQUUsVUFBa0IsRUFBRSxRQUFnQixFQUFFLGlCQUF5QixFQUFFLGdCQUF3QixFQUFFLEVBQUU7Z0JBQ3RJLFdBQVcsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztnQkFDcEUsV0FBVyxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO2dCQUVyRSxVQUFVLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixDQUFDLENBQUM7Z0JBQ2xFLFVBQVUsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQUNwRSxDQUFDLENBQUM7WUFFRixxQkFBcUI7WUFDckIsU0FBUztZQUNULGVBQWUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFaEMsU0FBUztZQUNULGVBQWUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbEMsZUFBZSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNqQyxlQUFlLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ25DLGVBQWUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbEMsZUFBZSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNwQyxlQUFlLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ25DLGVBQWUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDckMsZUFBZSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUVwQyxTQUFTO1lBQ1QsZUFBZSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNwQyxlQUFlLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ25DLGVBQWUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDckMsZUFBZSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNwQyxlQUFlLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLGVBQWUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDckMsZUFBZSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2QyxlQUFlLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLGVBQWUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDckMsZUFBZSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNwQyxlQUFlLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLGVBQWUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDckMsZUFBZSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2QyxlQUFlLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLGVBQWUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEMsZUFBZSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2QyxlQUFlLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLGVBQWUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDckMsZUFBZSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2QyxlQUFlLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLGVBQWUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEMsZUFBZSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2QyxlQUFlLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLGVBQWUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEMsZUFBZSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2QyxlQUFlLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLGVBQWUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEMsZUFBZSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2QyxlQUFlLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLGVBQWUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEMsZUFBZSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsWUFBWSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxQyxlQUFlLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLGVBQWUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFD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