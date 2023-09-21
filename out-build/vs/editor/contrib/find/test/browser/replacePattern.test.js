/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/search", "vs/base/test/common/utils", "vs/editor/contrib/find/browser/replacePattern"], function (require, exports, assert, search_1, utils_1, replacePattern_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Replace Pattern test', () => {
        (0, utils_1.$bT)();
        test('parse replace string', () => {
            const testParse = (input, expectedPieces) => {
                const actual = (0, replacePattern_1.$x7)(input);
                const expected = new replacePattern_1.$v7(expectedPieces);
                assert.deepStrictEqual(actual, expected, 'Parsing ' + input);
            };
            // no backslash => no treatment
            testParse('hello', [replacePattern_1.$w7.staticValue('hello')]);
            // \t => TAB
            testParse('\\thello', [replacePattern_1.$w7.staticValue('\thello')]);
            testParse('h\\tello', [replacePattern_1.$w7.staticValue('h\tello')]);
            testParse('hello\\t', [replacePattern_1.$w7.staticValue('hello\t')]);
            // \n => LF
            testParse('\\nhello', [replacePattern_1.$w7.staticValue('\nhello')]);
            // \\t => \t
            testParse('\\\\thello', [replacePattern_1.$w7.staticValue('\\thello')]);
            testParse('h\\\\tello', [replacePattern_1.$w7.staticValue('h\\tello')]);
            testParse('hello\\\\t', [replacePattern_1.$w7.staticValue('hello\\t')]);
            // \\\t => \TAB
            testParse('\\\\\\thello', [replacePattern_1.$w7.staticValue('\\\thello')]);
            // \\\\t => \\t
            testParse('\\\\\\\\thello', [replacePattern_1.$w7.staticValue('\\\\thello')]);
            // \ at the end => no treatment
            testParse('hello\\', [replacePattern_1.$w7.staticValue('hello\\')]);
            // \ with unknown char => no treatment
            testParse('hello\\x', [replacePattern_1.$w7.staticValue('hello\\x')]);
            // \ with back reference => no treatment
            testParse('hello\\0', [replacePattern_1.$w7.staticValue('hello\\0')]);
            testParse('hello$&', [replacePattern_1.$w7.staticValue('hello'), replacePattern_1.$w7.matchIndex(0)]);
            testParse('hello$0', [replacePattern_1.$w7.staticValue('hello'), replacePattern_1.$w7.matchIndex(0)]);
            testParse('hello$02', [replacePattern_1.$w7.staticValue('hello'), replacePattern_1.$w7.matchIndex(0), replacePattern_1.$w7.staticValue('2')]);
            testParse('hello$1', [replacePattern_1.$w7.staticValue('hello'), replacePattern_1.$w7.matchIndex(1)]);
            testParse('hello$2', [replacePattern_1.$w7.staticValue('hello'), replacePattern_1.$w7.matchIndex(2)]);
            testParse('hello$9', [replacePattern_1.$w7.staticValue('hello'), replacePattern_1.$w7.matchIndex(9)]);
            testParse('$9hello', [replacePattern_1.$w7.matchIndex(9), replacePattern_1.$w7.staticValue('hello')]);
            testParse('hello$12', [replacePattern_1.$w7.staticValue('hello'), replacePattern_1.$w7.matchIndex(12)]);
            testParse('hello$99', [replacePattern_1.$w7.staticValue('hello'), replacePattern_1.$w7.matchIndex(99)]);
            testParse('hello$99a', [replacePattern_1.$w7.staticValue('hello'), replacePattern_1.$w7.matchIndex(99), replacePattern_1.$w7.staticValue('a')]);
            testParse('hello$1a', [replacePattern_1.$w7.staticValue('hello'), replacePattern_1.$w7.matchIndex(1), replacePattern_1.$w7.staticValue('a')]);
            testParse('hello$100', [replacePattern_1.$w7.staticValue('hello'), replacePattern_1.$w7.matchIndex(10), replacePattern_1.$w7.staticValue('0')]);
            testParse('hello$100a', [replacePattern_1.$w7.staticValue('hello'), replacePattern_1.$w7.matchIndex(10), replacePattern_1.$w7.staticValue('0a')]);
            testParse('hello$10a0', [replacePattern_1.$w7.staticValue('hello'), replacePattern_1.$w7.matchIndex(10), replacePattern_1.$w7.staticValue('a0')]);
            testParse('hello$$', [replacePattern_1.$w7.staticValue('hello$')]);
            testParse('hello$$0', [replacePattern_1.$w7.staticValue('hello$0')]);
            testParse('hello$`', [replacePattern_1.$w7.staticValue('hello$`')]);
            testParse('hello$\'', [replacePattern_1.$w7.staticValue('hello$\'')]);
        });
        test('parse replace string with case modifiers', () => {
            const testParse = (input, expectedPieces) => {
                const actual = (0, replacePattern_1.$x7)(input);
                const expected = new replacePattern_1.$v7(expectedPieces);
                assert.deepStrictEqual(actual, expected, 'Parsing ' + input);
            };
            function assertReplace(target, search, replaceString, expected) {
                const replacePattern = (0, replacePattern_1.$x7)(replaceString);
                const m = search.exec(target);
                const actual = replacePattern.buildReplaceString(m);
                assert.strictEqual(actual, expected, `${target}.replace(${search}, ${replaceString}) === ${expected}`);
            }
            // \U, \u => uppercase  \L, \l => lowercase  \E => cancel
            testParse('hello\\U$1', [replacePattern_1.$w7.staticValue('hello'), replacePattern_1.$w7.caseOps(1, ['U'])]);
            assertReplace('func privateFunc(', /func (\w+)\(/, 'func \\U$1(', 'func PRIVATEFUNC(');
            testParse('hello\\u$1', [replacePattern_1.$w7.staticValue('hello'), replacePattern_1.$w7.caseOps(1, ['u'])]);
            assertReplace('func privateFunc(', /func (\w+)\(/, 'func \\u$1(', 'func PrivateFunc(');
            testParse('hello\\L$1', [replacePattern_1.$w7.staticValue('hello'), replacePattern_1.$w7.caseOps(1, ['L'])]);
            assertReplace('func privateFunc(', /func (\w+)\(/, 'func \\L$1(', 'func privatefunc(');
            testParse('hello\\l$1', [replacePattern_1.$w7.staticValue('hello'), replacePattern_1.$w7.caseOps(1, ['l'])]);
            assertReplace('func PrivateFunc(', /func (\w+)\(/, 'func \\l$1(', 'func privateFunc(');
            testParse('hello$1\\u\\u\\U$4goodbye', [replacePattern_1.$w7.staticValue('hello'), replacePattern_1.$w7.matchIndex(1), replacePattern_1.$w7.caseOps(4, ['u', 'u', 'U']), replacePattern_1.$w7.staticValue('goodbye')]);
            assertReplace('hellogooDbye', /hello(\w+)/, 'hello\\u\\u\\l\\l\\U$1', 'helloGOodBYE');
        });
        test('replace has JavaScript semantics', () => {
            const testJSReplaceSemantics = (target, search, replaceString, expected) => {
                const replacePattern = (0, replacePattern_1.$x7)(replaceString);
                const m = search.exec(target);
                const actual = replacePattern.buildReplaceString(m);
                assert.deepStrictEqual(actual, expected, `${target}.replace(${search}, ${replaceString})`);
            };
            testJSReplaceSemantics('hi', /hi/, 'hello', 'hi'.replace(/hi/, 'hello'));
            testJSReplaceSemantics('hi', /hi/, '\\t', 'hi'.replace(/hi/, '\t'));
            testJSReplaceSemantics('hi', /hi/, '\\n', 'hi'.replace(/hi/, '\n'));
            testJSReplaceSemantics('hi', /hi/, '\\\\t', 'hi'.replace(/hi/, '\\t'));
            testJSReplaceSemantics('hi', /hi/, '\\\\n', 'hi'.replace(/hi/, '\\n'));
            // implicit capture group 0
            testJSReplaceSemantics('hi', /hi/, 'hello$&', 'hi'.replace(/hi/, 'hello$&'));
            testJSReplaceSemantics('hi', /hi/, 'hello$0', 'hi'.replace(/hi/, 'hello$&'));
            testJSReplaceSemantics('hi', /hi/, 'hello$&1', 'hi'.replace(/hi/, 'hello$&1'));
            testJSReplaceSemantics('hi', /hi/, 'hello$01', 'hi'.replace(/hi/, 'hello$&1'));
            // capture groups have funny semantics in replace strings
            // the replace string interprets $nn as a captured group only if it exists in the search regex
            testJSReplaceSemantics('hi', /(hi)/, 'hello$10', 'hi'.replace(/(hi)/, 'hello$10'));
            testJSReplaceSemantics('hi', /(hi)()()()()()()()()()/, 'hello$10', 'hi'.replace(/(hi)()()()()()()()()()/, 'hello$10'));
            testJSReplaceSemantics('hi', /(hi)/, 'hello$100', 'hi'.replace(/(hi)/, 'hello$100'));
            testJSReplaceSemantics('hi', /(hi)/, 'hello$20', 'hi'.replace(/(hi)/, 'hello$20'));
        });
        test('get replace string if given text is a complete match', () => {
            function assertReplace(target, search, replaceString, expected) {
                const replacePattern = (0, replacePattern_1.$x7)(replaceString);
                const m = search.exec(target);
                const actual = replacePattern.buildReplaceString(m);
                assert.strictEqual(actual, expected, `${target}.replace(${search}, ${replaceString}) === ${expected}`);
            }
            assertReplace('bla', /bla/, 'hello', 'hello');
            assertReplace('bla', /(bla)/, 'hello', 'hello');
            assertReplace('bla', /(bla)/, 'hello$0', 'hellobla');
            const searchRegex = /let\s+(\w+)\s*=\s*require\s*\(\s*['"]([\w\.\-/]+)\s*['"]\s*\)\s*/;
            assertReplace('let fs = require(\'fs\')', searchRegex, 'import * as $1 from \'$2\';', 'import * as fs from \'fs\';');
            assertReplace('let something = require(\'fs\')', searchRegex, 'import * as $1 from \'$2\';', 'import * as something from \'fs\';');
            assertReplace('let something = require(\'fs\')', searchRegex, 'import * as $1 from \'$1\';', 'import * as something from \'something\';');
            assertReplace('let something = require(\'fs\')', searchRegex, 'import * as $2 from \'$1\';', 'import * as fs from \'something\';');
            assertReplace('let something = require(\'fs\')', searchRegex, 'import * as $0 from \'$0\';', 'import * as let something = require(\'fs\') from \'let something = require(\'fs\')\';');
            assertReplace('let fs = require(\'fs\')', searchRegex, 'import * as $1 from \'$2\';', 'import * as fs from \'fs\';');
            assertReplace('for ()', /for(.*)/, 'cat$1', 'cat ()');
            // issue #18111
            assertReplace('HRESULT OnAmbientPropertyChange(DISPID   dispid);', /\b\s{3}\b/, ' ', ' ');
        });
        test('get replace string if match is sub-string of the text', () => {
            function assertReplace(target, search, replaceString, expected) {
                const replacePattern = (0, replacePattern_1.$x7)(replaceString);
                const m = search.exec(target);
                const actual = replacePattern.buildReplaceString(m);
                assert.strictEqual(actual, expected, `${target}.replace(${search}, ${replaceString}) === ${expected}`);
            }
            assertReplace('this is a bla text', /bla/, 'hello', 'hello');
            assertReplace('this is a bla text', /this(?=.*bla)/, 'that', 'that');
            assertReplace('this is a bla text', /(th)is(?=.*bla)/, '$1at', 'that');
            assertReplace('this is a bla text', /(th)is(?=.*bla)/, '$1e', 'the');
            assertReplace('this is a bla text', /(th)is(?=.*bla)/, '$1ere', 'there');
            assertReplace('this is a bla text', /(th)is(?=.*bla)/, '$1', 'th');
            assertReplace('this is a bla text', /(th)is(?=.*bla)/, 'ma$1', 'math');
            assertReplace('this is a bla text', /(th)is(?=.*bla)/, 'ma$1s', 'maths');
            assertReplace('this is a bla text', /(th)is(?=.*bla)/, '$0', 'this');
            assertReplace('this is a bla text', /(th)is(?=.*bla)/, '$0$1', 'thisth');
            assertReplace('this is a bla text', /bla(?=\stext$)/, 'foo', 'foo');
            assertReplace('this is a bla text', /b(la)(?=\stext$)/, 'f$1', 'fla');
            assertReplace('this is a bla text', /b(la)(?=\stext$)/, 'f$0', 'fbla');
            assertReplace('this is a bla text', /b(la)(?=\stext$)/, '$0ah', 'blaah');
        });
        test('issue #19740 Find and replace capture group/backreference inserts `undefined` instead of empty string', () => {
            const replacePattern = (0, replacePattern_1.$x7)('a{$1}');
            const matches = /a(z)?/.exec('abcd');
            const actual = replacePattern.buildReplaceString(matches);
            assert.strictEqual(actual, 'a{}');
        });
        test('buildReplaceStringWithCasePreserved test', () => {
            function assertReplace(target, replaceString, expected) {
                let actual = '';
                actual = (0, search_1.$MS)(target, replaceString);
                assert.strictEqual(actual, expected);
            }
            assertReplace(['abc'], 'Def', 'def');
            assertReplace(['Abc'], 'Def', 'Def');
            assertReplace(['ABC'], 'Def', 'DEF');
            assertReplace(['abc', 'Abc'], 'Def', 'def');
            assertReplace(['Abc', 'abc'], 'Def', 'Def');
            assertReplace(['ABC', 'abc'], 'Def', 'DEF');
            assertReplace(['aBc', 'abc'], 'Def', 'def');
            assertReplace(['AbC'], 'Def', 'Def');
            assertReplace(['aBC'], 'Def', 'def');
            assertReplace(['aBc'], 'DeF', 'deF');
            assertReplace(['Foo-Bar'], 'newfoo-newbar', 'Newfoo-Newbar');
            assertReplace(['Foo-Bar-Abc'], 'newfoo-newbar-newabc', 'Newfoo-Newbar-Newabc');
            assertReplace(['Foo-Bar-abc'], 'newfoo-newbar', 'Newfoo-newbar');
            assertReplace(['foo-Bar'], 'newfoo-newbar', 'newfoo-Newbar');
            assertReplace(['foo-BAR'], 'newfoo-newbar', 'newfoo-NEWBAR');
            assertReplace(['foO-BAR'], 'NewFoo-NewBar', 'newFoo-NEWBAR');
            assertReplace(['Foo_Bar'], 'newfoo_newbar', 'Newfoo_Newbar');
            assertReplace(['Foo_Bar_Abc'], 'newfoo_newbar_newabc', 'Newfoo_Newbar_Newabc');
            assertReplace(['Foo_Bar_abc'], 'newfoo_newbar', 'Newfoo_newbar');
            assertReplace(['Foo_Bar-abc'], 'newfoo_newbar-abc', 'Newfoo_newbar-abc');
            assertReplace(['foo_Bar'], 'newfoo_newbar', 'newfoo_Newbar');
            assertReplace(['Foo_BAR'], 'newfoo_newbar', 'Newfoo_NEWBAR');
        });
        test('preserve case', () => {
            function assertReplace(target, replaceString, expected) {
                const replacePattern = (0, replacePattern_1.$x7)(replaceString);
                const actual = replacePattern.buildReplaceString(target, true);
                assert.strictEqual(actual, expected);
            }
            assertReplace(['abc'], 'Def', 'def');
            assertReplace(['Abc'], 'Def', 'Def');
            assertReplace(['ABC'], 'Def', 'DEF');
            assertReplace(['abc', 'Abc'], 'Def', 'def');
            assertReplace(['Abc', 'abc'], 'Def', 'Def');
            assertReplace(['ABC', 'abc'], 'Def', 'DEF');
            assertReplace(['aBc', 'abc'], 'Def', 'def');
            assertReplace(['AbC'], 'Def', 'Def');
            assertReplace(['aBC'], 'Def', 'def');
            assertReplace(['aBc'], 'DeF', 'deF');
            assertReplace(['Foo-Bar'], 'newfoo-newbar', 'Newfoo-Newbar');
            assertReplace(['Foo-Bar-Abc'], 'newfoo-newbar-newabc', 'Newfoo-Newbar-Newabc');
            assertReplace(['Foo-Bar-abc'], 'newfoo-newbar', 'Newfoo-newbar');
            assertReplace(['foo-Bar'], 'newfoo-newbar', 'newfoo-Newbar');
            assertReplace(['foo-BAR'], 'newfoo-newbar', 'newfoo-NEWBAR');
            assertReplace(['foO-BAR'], 'NewFoo-NewBar', 'newFoo-NEWBAR');
            assertReplace(['Foo_Bar'], 'newfoo_newbar', 'Newfoo_Newbar');
            assertReplace(['Foo_Bar_Abc'], 'newfoo_newbar_newabc', 'Newfoo_Newbar_Newabc');
            assertReplace(['Foo_Bar_abc'], 'newfoo_newbar', 'Newfoo_newbar');
            assertReplace(['Foo_Bar-abc'], 'newfoo_newbar-abc', 'Newfoo_newbar-abc');
            assertReplace(['foo_Bar'], 'newfoo_newbar', 'newfoo_Newbar');
            assertReplace(['foo_BAR'], 'newfoo_newbar', 'newfoo_NEWBAR');
        });
    });
});
//# sourceMappingURL=replacePattern.test.js.map