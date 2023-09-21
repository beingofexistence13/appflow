/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/search", "vs/base/test/common/utils", "vs/editor/contrib/find/browser/replacePattern"], function (require, exports, assert, search_1, utils_1, replacePattern_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Replace Pattern test', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('parse replace string', () => {
            const testParse = (input, expectedPieces) => {
                const actual = (0, replacePattern_1.parseReplaceString)(input);
                const expected = new replacePattern_1.ReplacePattern(expectedPieces);
                assert.deepStrictEqual(actual, expected, 'Parsing ' + input);
            };
            // no backslash => no treatment
            testParse('hello', [replacePattern_1.ReplacePiece.staticValue('hello')]);
            // \t => TAB
            testParse('\\thello', [replacePattern_1.ReplacePiece.staticValue('\thello')]);
            testParse('h\\tello', [replacePattern_1.ReplacePiece.staticValue('h\tello')]);
            testParse('hello\\t', [replacePattern_1.ReplacePiece.staticValue('hello\t')]);
            // \n => LF
            testParse('\\nhello', [replacePattern_1.ReplacePiece.staticValue('\nhello')]);
            // \\t => \t
            testParse('\\\\thello', [replacePattern_1.ReplacePiece.staticValue('\\thello')]);
            testParse('h\\\\tello', [replacePattern_1.ReplacePiece.staticValue('h\\tello')]);
            testParse('hello\\\\t', [replacePattern_1.ReplacePiece.staticValue('hello\\t')]);
            // \\\t => \TAB
            testParse('\\\\\\thello', [replacePattern_1.ReplacePiece.staticValue('\\\thello')]);
            // \\\\t => \\t
            testParse('\\\\\\\\thello', [replacePattern_1.ReplacePiece.staticValue('\\\\thello')]);
            // \ at the end => no treatment
            testParse('hello\\', [replacePattern_1.ReplacePiece.staticValue('hello\\')]);
            // \ with unknown char => no treatment
            testParse('hello\\x', [replacePattern_1.ReplacePiece.staticValue('hello\\x')]);
            // \ with back reference => no treatment
            testParse('hello\\0', [replacePattern_1.ReplacePiece.staticValue('hello\\0')]);
            testParse('hello$&', [replacePattern_1.ReplacePiece.staticValue('hello'), replacePattern_1.ReplacePiece.matchIndex(0)]);
            testParse('hello$0', [replacePattern_1.ReplacePiece.staticValue('hello'), replacePattern_1.ReplacePiece.matchIndex(0)]);
            testParse('hello$02', [replacePattern_1.ReplacePiece.staticValue('hello'), replacePattern_1.ReplacePiece.matchIndex(0), replacePattern_1.ReplacePiece.staticValue('2')]);
            testParse('hello$1', [replacePattern_1.ReplacePiece.staticValue('hello'), replacePattern_1.ReplacePiece.matchIndex(1)]);
            testParse('hello$2', [replacePattern_1.ReplacePiece.staticValue('hello'), replacePattern_1.ReplacePiece.matchIndex(2)]);
            testParse('hello$9', [replacePattern_1.ReplacePiece.staticValue('hello'), replacePattern_1.ReplacePiece.matchIndex(9)]);
            testParse('$9hello', [replacePattern_1.ReplacePiece.matchIndex(9), replacePattern_1.ReplacePiece.staticValue('hello')]);
            testParse('hello$12', [replacePattern_1.ReplacePiece.staticValue('hello'), replacePattern_1.ReplacePiece.matchIndex(12)]);
            testParse('hello$99', [replacePattern_1.ReplacePiece.staticValue('hello'), replacePattern_1.ReplacePiece.matchIndex(99)]);
            testParse('hello$99a', [replacePattern_1.ReplacePiece.staticValue('hello'), replacePattern_1.ReplacePiece.matchIndex(99), replacePattern_1.ReplacePiece.staticValue('a')]);
            testParse('hello$1a', [replacePattern_1.ReplacePiece.staticValue('hello'), replacePattern_1.ReplacePiece.matchIndex(1), replacePattern_1.ReplacePiece.staticValue('a')]);
            testParse('hello$100', [replacePattern_1.ReplacePiece.staticValue('hello'), replacePattern_1.ReplacePiece.matchIndex(10), replacePattern_1.ReplacePiece.staticValue('0')]);
            testParse('hello$100a', [replacePattern_1.ReplacePiece.staticValue('hello'), replacePattern_1.ReplacePiece.matchIndex(10), replacePattern_1.ReplacePiece.staticValue('0a')]);
            testParse('hello$10a0', [replacePattern_1.ReplacePiece.staticValue('hello'), replacePattern_1.ReplacePiece.matchIndex(10), replacePattern_1.ReplacePiece.staticValue('a0')]);
            testParse('hello$$', [replacePattern_1.ReplacePiece.staticValue('hello$')]);
            testParse('hello$$0', [replacePattern_1.ReplacePiece.staticValue('hello$0')]);
            testParse('hello$`', [replacePattern_1.ReplacePiece.staticValue('hello$`')]);
            testParse('hello$\'', [replacePattern_1.ReplacePiece.staticValue('hello$\'')]);
        });
        test('parse replace string with case modifiers', () => {
            const testParse = (input, expectedPieces) => {
                const actual = (0, replacePattern_1.parseReplaceString)(input);
                const expected = new replacePattern_1.ReplacePattern(expectedPieces);
                assert.deepStrictEqual(actual, expected, 'Parsing ' + input);
            };
            function assertReplace(target, search, replaceString, expected) {
                const replacePattern = (0, replacePattern_1.parseReplaceString)(replaceString);
                const m = search.exec(target);
                const actual = replacePattern.buildReplaceString(m);
                assert.strictEqual(actual, expected, `${target}.replace(${search}, ${replaceString}) === ${expected}`);
            }
            // \U, \u => uppercase  \L, \l => lowercase  \E => cancel
            testParse('hello\\U$1', [replacePattern_1.ReplacePiece.staticValue('hello'), replacePattern_1.ReplacePiece.caseOps(1, ['U'])]);
            assertReplace('func privateFunc(', /func (\w+)\(/, 'func \\U$1(', 'func PRIVATEFUNC(');
            testParse('hello\\u$1', [replacePattern_1.ReplacePiece.staticValue('hello'), replacePattern_1.ReplacePiece.caseOps(1, ['u'])]);
            assertReplace('func privateFunc(', /func (\w+)\(/, 'func \\u$1(', 'func PrivateFunc(');
            testParse('hello\\L$1', [replacePattern_1.ReplacePiece.staticValue('hello'), replacePattern_1.ReplacePiece.caseOps(1, ['L'])]);
            assertReplace('func privateFunc(', /func (\w+)\(/, 'func \\L$1(', 'func privatefunc(');
            testParse('hello\\l$1', [replacePattern_1.ReplacePiece.staticValue('hello'), replacePattern_1.ReplacePiece.caseOps(1, ['l'])]);
            assertReplace('func PrivateFunc(', /func (\w+)\(/, 'func \\l$1(', 'func privateFunc(');
            testParse('hello$1\\u\\u\\U$4goodbye', [replacePattern_1.ReplacePiece.staticValue('hello'), replacePattern_1.ReplacePiece.matchIndex(1), replacePattern_1.ReplacePiece.caseOps(4, ['u', 'u', 'U']), replacePattern_1.ReplacePiece.staticValue('goodbye')]);
            assertReplace('hellogooDbye', /hello(\w+)/, 'hello\\u\\u\\l\\l\\U$1', 'helloGOodBYE');
        });
        test('replace has JavaScript semantics', () => {
            const testJSReplaceSemantics = (target, search, replaceString, expected) => {
                const replacePattern = (0, replacePattern_1.parseReplaceString)(replaceString);
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
                const replacePattern = (0, replacePattern_1.parseReplaceString)(replaceString);
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
                const replacePattern = (0, replacePattern_1.parseReplaceString)(replaceString);
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
            const replacePattern = (0, replacePattern_1.parseReplaceString)('a{$1}');
            const matches = /a(z)?/.exec('abcd');
            const actual = replacePattern.buildReplaceString(matches);
            assert.strictEqual(actual, 'a{}');
        });
        test('buildReplaceStringWithCasePreserved test', () => {
            function assertReplace(target, replaceString, expected) {
                let actual = '';
                actual = (0, search_1.buildReplaceStringWithCasePreserved)(target, replaceString);
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
                const replacePattern = (0, replacePattern_1.parseReplaceString)(replaceString);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwbGFjZVBhdHRlcm4udGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2ZpbmQvdGVzdC9icm93c2VyL3JlcGxhY2VQYXR0ZXJuLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFPaEcsS0FBSyxDQUFDLHNCQUFzQixFQUFFLEdBQUcsRUFBRTtRQUVsQyxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFMUMsSUFBSSxDQUFDLHNCQUFzQixFQUFFLEdBQUcsRUFBRTtZQUNqQyxNQUFNLFNBQVMsR0FBRyxDQUFDLEtBQWEsRUFBRSxjQUE4QixFQUFFLEVBQUU7Z0JBQ25FLE1BQU0sTUFBTSxHQUFHLElBQUEsbUNBQWtCLEVBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3pDLE1BQU0sUUFBUSxHQUFHLElBQUksK0JBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDcEQsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLFVBQVUsR0FBRyxLQUFLLENBQUMsQ0FBQztZQUM5RCxDQUFDLENBQUM7WUFFRiwrQkFBK0I7WUFDL0IsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDLDZCQUFZLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV4RCxZQUFZO1lBQ1osU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDLDZCQUFZLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3RCxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUMsNkJBQVksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdELFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyw2QkFBWSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFN0QsV0FBVztZQUNY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