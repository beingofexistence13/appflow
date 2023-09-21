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
            range: new range_1.$ks(selectionLineNumber, selectionColumn, positionLineNumber, positionColumn),
            text: text,
            forceMoveMarkers: false
        };
    }
    let DocBlockCommentMode = class DocBlockCommentMode extends lifecycle_1.$kc {
        static { DocBlockCommentMode_1 = this; }
        static { this.languageId = 'commentMode'; }
        constructor(languageService, languageConfigurationService) {
            super();
            this.languageId = DocBlockCommentMode_1.languageId;
            this.B(languageService.registerLanguage({ id: this.languageId }));
            this.B(languageConfigurationService.register(this.languageId, {
                brackets: [
                    ['(', ')'],
                    ['{', '}'],
                    ['[', ']']
                ],
                onEnterRules: javascriptOnEnterRules_1.$70b
            }));
        }
    };
    DocBlockCommentMode = DocBlockCommentMode_1 = __decorate([
        __param(0, language_1.$ct),
        __param(1, languageConfigurationRegistry_1.$2t)
    ], DocBlockCommentMode);
    function testShiftCommand(lines, languageId, useTabStops, selection, expectedLines, expectedSelection, prepare) {
        (0, testCommand_1.$30b)(lines, languageId, selection, (accessor, sel) => new shiftCommand_1.$8V(sel, {
            isUnshift: false,
            tabSize: 4,
            indentSize: 4,
            insertSpaces: false,
            useTabStops: useTabStops,
            autoIndent: 4 /* EditorAutoIndentStrategy.Full */,
        }, accessor.get(languageConfigurationRegistry_1.$2t)), expectedLines, expectedSelection, undefined, prepare);
    }
    function testUnshiftCommand(lines, languageId, useTabStops, selection, expectedLines, expectedSelection, prepare) {
        (0, testCommand_1.$30b)(lines, languageId, selection, (accessor, sel) => new shiftCommand_1.$8V(sel, {
            isUnshift: true,
            tabSize: 4,
            indentSize: 4,
            insertSpaces: false,
            useTabStops: useTabStops,
            autoIndent: 4 /* EditorAutoIndentStrategy.Full */,
        }, accessor.get(languageConfigurationRegistry_1.$2t)), expectedLines, expectedSelection, undefined, prepare);
    }
    function prepareDocBlockCommentLanguage(accessor, disposables) {
        const languageConfigurationService = accessor.get(languageConfigurationRegistry_1.$2t);
        const languageService = accessor.get(language_1.$ct);
        disposables.add(new DocBlockCommentMode(languageService, languageConfigurationService));
    }
    suite('Editor Commands - ShiftCommand', () => {
        (0, utils_1.$bT)();
        // --------- shift
        test('Bug 9503: Shifting without any selection', () => {
            testShiftCommand([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], null, true, new selection_1.$ms(1, 1, 1, 1), [
                '\tMy First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], new selection_1.$ms(1, 2, 1, 2));
        });
        test('shift on single line selection 1', () => {
            testShiftCommand([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], null, true, new selection_1.$ms(1, 3, 1, 1), [
                '\tMy First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], new selection_1.$ms(1, 4, 1, 1));
        });
        test('shift on single line selection 2', () => {
            testShiftCommand([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], null, true, new selection_1.$ms(1, 1, 1, 3), [
                '\tMy First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], new selection_1.$ms(1, 1, 1, 4));
        });
        test('simple shift', () => {
            testShiftCommand([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], null, true, new selection_1.$ms(1, 1, 2, 1), [
                '\tMy First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], new selection_1.$ms(1, 1, 2, 1));
        });
        test('shifting on two separate lines', () => {
            testShiftCommand([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], null, true, new selection_1.$ms(1, 1, 2, 1), [
                '\tMy First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], new selection_1.$ms(1, 1, 2, 1));
            testShiftCommand([
                '\tMy First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], null, true, new selection_1.$ms(2, 1, 3, 1), [
                '\tMy First Line',
                '\t\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], new selection_1.$ms(2, 1, 3, 1));
        });
        test('shifting on two lines', () => {
            testShiftCommand([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], null, true, new selection_1.$ms(1, 2, 2, 2), [
                '\tMy First Line',
                '\t\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], new selection_1.$ms(1, 3, 2, 2));
        });
        test('shifting on two lines again', () => {
            testShiftCommand([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], null, true, new selection_1.$ms(2, 2, 1, 2), [
                '\tMy First Line',
                '\t\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], new selection_1.$ms(2, 2, 1, 3));
        });
        test('shifting at end of file', () => {
            testShiftCommand([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], null, true, new selection_1.$ms(4, 1, 5, 2), [
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '\t123'
            ], new selection_1.$ms(4, 1, 5, 3));
        });
        test('issue #1120 TAB should not indent empty lines in a multi-line selection', () => {
            testShiftCommand([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], null, true, new selection_1.$ms(1, 1, 5, 2), [
                '\tMy First Line',
                '\t\t\tMy Second Line',
                '\t\tThird Line',
                '',
                '\t123'
            ], new selection_1.$ms(1, 1, 5, 3));
            testShiftCommand([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], null, true, new selection_1.$ms(4, 1, 5, 1), [
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '\t',
                '123'
            ], new selection_1.$ms(4, 1, 5, 1));
        });
        // --------- unshift
        test('unshift on single line selection 1', () => {
            testShiftCommand([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], null, true, new selection_1.$ms(2, 3, 2, 1), [
                'My First Line',
                '\t\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], new selection_1.$ms(2, 3, 2, 1));
        });
        test('unshift on single line selection 2', () => {
            testShiftCommand([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], null, true, new selection_1.$ms(2, 1, 2, 3), [
                'My First Line',
                '\t\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], new selection_1.$ms(2, 1, 2, 3));
        });
        test('simple unshift', () => {
            testUnshiftCommand([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], null, true, new selection_1.$ms(1, 1, 2, 1), [
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], new selection_1.$ms(1, 1, 2, 1));
        });
        test('unshifting on two lines 1', () => {
            testUnshiftCommand([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], null, true, new selection_1.$ms(1, 2, 2, 2), [
                'My First Line',
                '\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], new selection_1.$ms(1, 2, 2, 2));
        });
        test('unshifting on two lines 2', () => {
            testUnshiftCommand([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], null, true, new selection_1.$ms(2, 3, 2, 1), [
                'My First Line',
                '\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], new selection_1.$ms(2, 2, 2, 1));
        });
        test('unshifting at the end of the file', () => {
            testUnshiftCommand([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], null, true, new selection_1.$ms(4, 1, 5, 2), [
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], new selection_1.$ms(4, 1, 5, 2));
        });
        test('unshift many times + shift', () => {
            testUnshiftCommand([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], null, true, new selection_1.$ms(1, 1, 5, 4), [
                'My First Line',
                '\tMy Second Line',
                'Third Line',
                '',
                '123'
            ], new selection_1.$ms(1, 1, 5, 4));
            testUnshiftCommand([
                'My First Line',
                '\tMy Second Line',
                'Third Line',
                '',
                '123'
            ], null, true, new selection_1.$ms(1, 1, 5, 4), [
                'My First Line',
                'My Second Line',
                'Third Line',
                '',
                '123'
            ], new selection_1.$ms(1, 1, 5, 4));
            testShiftCommand([
                'My First Line',
                'My Second Line',
                'Third Line',
                '',
                '123'
            ], null, true, new selection_1.$ms(1, 1, 5, 4), [
                '\tMy First Line',
                '\tMy Second Line',
                '\tThird Line',
                '',
                '\t123'
            ], new selection_1.$ms(1, 1, 5, 5));
        });
        test('Bug 9119: Unshift from first column doesn\'t work', () => {
            testUnshiftCommand([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], null, true, new selection_1.$ms(2, 1, 2, 1), [
                'My First Line',
                '\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], new selection_1.$ms(2, 1, 2, 1));
        });
        test('issue #348: indenting around doc block comments', () => {
            testShiftCommand([
                '',
                '/**',
                ' * a doc comment',
                ' */',
                'function hello() {}'
            ], DocBlockCommentMode.languageId, true, new selection_1.$ms(1, 1, 5, 20), [
                '',
                '\t/**',
                '\t * a doc comment',
                '\t */',
                '\tfunction hello() {}'
            ], new selection_1.$ms(1, 1, 5, 21), prepareDocBlockCommentLanguage);
            testUnshiftCommand([
                '',
                '/**',
                ' * a doc comment',
                ' */',
                'function hello() {}'
            ], DocBlockCommentMode.languageId, true, new selection_1.$ms(1, 1, 5, 20), [
                '',
                '/**',
                ' * a doc comment',
                ' */',
                'function hello() {}'
            ], new selection_1.$ms(1, 1, 5, 20), prepareDocBlockCommentLanguage);
            testUnshiftCommand([
                '\t',
                '\t/**',
                '\t * a doc comment',
                '\t */',
                '\tfunction hello() {}'
            ], DocBlockCommentMode.languageId, true, new selection_1.$ms(1, 1, 5, 21), [
                '',
                '/**',
                ' * a doc comment',
                ' */',
                'function hello() {}'
            ], new selection_1.$ms(1, 1, 5, 20), prepareDocBlockCommentLanguage);
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
            ], DocBlockCommentMode.languageId, true, new selection_1.$ms(1, 1, 7, 13), [
                '',
                '\t/**',
                '\t * test',
                '\t *',
                '\t * @type {number}',
                '\t */',
                '\tvar foo = 0;'
            ], new selection_1.$ms(1, 1, 7, 14), prepareDocBlockCommentLanguage);
        });
        test('issue #1620: a) Line indent doesn\'t handle leading whitespace properly', () => {
            (0, testCommand_1.$30b)([
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
            ], null, new selection_1.$ms(1, 1, 13, 1), (accessor, sel) => new shiftCommand_1.$8V(sel, {
                isUnshift: false,
                tabSize: 4,
                indentSize: 4,
                insertSpaces: true,
                useTabStops: false,
                autoIndent: 4 /* EditorAutoIndentStrategy.Full */,
            }, accessor.get(languageConfigurationRegistry_1.$2t)), [
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
            ], new selection_1.$ms(1, 1, 13, 1));
        });
        test('issue #1620: b) Line indent doesn\'t handle leading whitespace properly', () => {
            (0, testCommand_1.$30b)([
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
            ], null, new selection_1.$ms(1, 1, 13, 1), (accessor, sel) => new shiftCommand_1.$8V(sel, {
                isUnshift: true,
                tabSize: 4,
                indentSize: 4,
                insertSpaces: true,
                useTabStops: false,
                autoIndent: 4 /* EditorAutoIndentStrategy.Full */,
            }, accessor.get(languageConfigurationRegistry_1.$2t)), [
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
            ], new selection_1.$ms(1, 1, 13, 1));
        });
        test('issue #1620: c) Line indent doesn\'t handle leading whitespace properly', () => {
            (0, testCommand_1.$30b)([
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
            ], null, new selection_1.$ms(1, 1, 13, 1), (accessor, sel) => new shiftCommand_1.$8V(sel, {
                isUnshift: true,
                tabSize: 4,
                indentSize: 4,
                insertSpaces: false,
                useTabStops: false,
                autoIndent: 4 /* EditorAutoIndentStrategy.Full */,
            }, accessor.get(languageConfigurationRegistry_1.$2t)), [
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
            ], new selection_1.$ms(1, 1, 13, 1));
        });
        test('issue #1620: d) Line indent doesn\'t handle leading whitespace properly', () => {
            (0, testCommand_1.$30b)([
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
            ], null, new selection_1.$ms(1, 1, 13, 1), (accessor, sel) => new shiftCommand_1.$8V(sel, {
                isUnshift: true,
                tabSize: 4,
                indentSize: 4,
                insertSpaces: true,
                useTabStops: false,
                autoIndent: 4 /* EditorAutoIndentStrategy.Full */,
            }, accessor.get(languageConfigurationRegistry_1.$2t)), [
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
            ], new selection_1.$ms(1, 1, 13, 1));
        });
        test('issue microsoft/monaco-editor#443: Indentation of a single row deletes selected text in some cases', () => {
            (0, testCommand_1.$30b)([
                'Hello world!',
                'another line'
            ], null, new selection_1.$ms(1, 1, 1, 13), (accessor, sel) => new shiftCommand_1.$8V(sel, {
                isUnshift: false,
                tabSize: 4,
                indentSize: 4,
                insertSpaces: false,
                useTabStops: true,
                autoIndent: 4 /* EditorAutoIndentStrategy.Full */,
            }, accessor.get(languageConfigurationRegistry_1.$2t)), [
                '\tHello world!',
                'another line'
            ], new selection_1.$ms(1, 1, 1, 14));
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
                return (0, testTextModel_1.$N0b)(text, (model) => {
                    const testLanguageConfigurationService = new testLanguageConfigurationService_1.$D0b();
                    const op = new shiftCommand_1.$8V(new selection_1.$ms(1, 1, text.length + 1, 1), {
                        isUnshift: true,
                        tabSize: tabSize,
                        indentSize: indentSize,
                        insertSpaces: insertSpaces,
                        useTabStops: true,
                        autoIndent: 4 /* EditorAutoIndentStrategy.Full */,
                    }, testLanguageConfigurationService);
                    const actual = (0, testCommand_1.$40b)(model, op);
                    assert.deepStrictEqual(actual, expected);
                    testLanguageConfigurationService.dispose();
                });
            }
            function _assertShiftCommand(tabSize, indentSize, insertSpaces, text, expected) {
                return (0, testTextModel_1.$N0b)(text, (model) => {
                    const testLanguageConfigurationService = new testLanguageConfigurationService_1.$D0b();
                    const op = new shiftCommand_1.$8V(new selection_1.$ms(1, 1, text.length + 1, 1), {
                        isUnshift: false,
                        tabSize: tabSize,
                        indentSize: indentSize,
                        insertSpaces: insertSpaces,
                        useTabStops: true,
                        autoIndent: 4 /* EditorAutoIndentStrategy.Full */,
                    }, testLanguageConfigurationService);
                    const actual = (0, testCommand_1.$40b)(model, op);
                    assert.deepStrictEqual(actual, expected);
                    testLanguageConfigurationService.dispose();
                });
            }
        });
    });
});
//# sourceMappingURL=shiftCommand.test.js.map