define(["require", "exports", "assert", "vs/workbench/services/search/common/replace"], function (require, exports, assert, replace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Replace Pattern test', () => {
        test('parse replace string', () => {
            const testParse = (input, expected, expectedHasParameters) => {
                let actual = new replace_1.ReplacePattern(input, { pattern: 'somepattern', isRegExp: true });
                assert.strictEqual(expected, actual.pattern);
                assert.strictEqual(expectedHasParameters, actual.hasParameters);
                actual = new replace_1.ReplacePattern('hello' + input + 'hi', { pattern: 'sonepattern', isRegExp: true });
                assert.strictEqual('hello' + expected + 'hi', actual.pattern);
                assert.strictEqual(expectedHasParameters, actual.hasParameters);
            };
            // no backslash => no treatment
            testParse('hello', 'hello', false);
            // \t => TAB
            testParse('\\thello', '\thello', false);
            // \n => LF
            testParse('\\nhello', '\nhello', false);
            // \\t => \t
            testParse('\\\\thello', '\\thello', false);
            // \\\t => \TAB
            testParse('\\\\\\thello', '\\\thello', false);
            // \\\\t => \\t
            testParse('\\\\\\\\thello', '\\\\thello', false);
            // \ at the end => no treatment
            testParse('hello\\', 'hello\\', false);
            // \ with unknown char => no treatment
            testParse('hello\\x', 'hello\\x', false);
            // \ with back reference => no treatment
            testParse('hello\\0', 'hello\\0', false);
            // $1 => no treatment
            testParse('hello$1', 'hello$1', true);
            // $2 => no treatment
            testParse('hello$2', 'hello$2', true);
            // $12 => no treatment
            testParse('hello$12', 'hello$12', true);
            // $99 => no treatment
            testParse('hello$99', 'hello$99', true);
            // $99a => no treatment
            testParse('hello$99a', 'hello$99a', true);
            // $100 => no treatment
            testParse('hello$100', 'hello$100', false);
            // $100a => no treatment
            testParse('hello$100a', 'hello$100a', false);
            // $10a0 => no treatment
            testParse('hello$10a0', 'hello$10a0', true);
            // $$ => no treatment
            testParse('hello$$', 'hello$$', false);
            // $$0 => no treatment
            testParse('hello$$0', 'hello$$0', false);
            // $0 => $&
            testParse('hello$0', 'hello$&', true);
            testParse('hello$02', 'hello$&2', true);
            testParse('hello$`', 'hello$`', true);
            testParse('hello$\'', 'hello$\'', true);
        });
        test('create pattern by passing regExp', () => {
            let expected = /abc/;
            let actual = new replace_1.ReplacePattern('hello', false, expected).regExp;
            assert.deepStrictEqual(actual, expected);
            expected = /abc/;
            actual = new replace_1.ReplacePattern('hello', false, /abc/g).regExp;
            assert.deepStrictEqual(actual, expected);
            let testObject = new replace_1.ReplacePattern('hello$0', false, /abc/g);
            assert.strictEqual(testObject.hasParameters, false);
            testObject = new replace_1.ReplacePattern('hello$0', true, /abc/g);
            assert.strictEqual(testObject.hasParameters, true);
        });
        test('get replace string if given text is a complete match', () => {
            let testObject = new replace_1.ReplacePattern('hello', { pattern: 'bla', isRegExp: true });
            let actual = testObject.getReplaceString('bla');
            assert.strictEqual(actual, 'hello');
            testObject = new replace_1.ReplacePattern('hello', { pattern: 'bla', isRegExp: false });
            actual = testObject.getReplaceString('bla');
            assert.strictEqual(actual, 'hello');
            testObject = new replace_1.ReplacePattern('hello', { pattern: '(bla)', isRegExp: true });
            actual = testObject.getReplaceString('bla');
            assert.strictEqual(actual, 'hello');
            testObject = new replace_1.ReplacePattern('hello$0', { pattern: '(bla)', isRegExp: true });
            actual = testObject.getReplaceString('bla');
            assert.strictEqual(actual, 'hellobla');
            testObject = new replace_1.ReplacePattern('import * as $1 from \'$2\';', { pattern: 'let\\s+(\\w+)\\s*=\\s*require\\s*\\(\\s*[\'\"]([\\w.\\-/]+)\\s*[\'\"]\\s*\\)\\s*', isRegExp: true });
            actual = testObject.getReplaceString('let fs = require(\'fs\')');
            assert.strictEqual(actual, 'import * as fs from \'fs\';');
            actual = testObject.getReplaceString('let something = require(\'fs\')');
            assert.strictEqual(actual, 'import * as something from \'fs\';');
            actual = testObject.getReplaceString('let require(\'fs\')');
            assert.strictEqual(actual, null);
            testObject = new replace_1.ReplacePattern('import * as $1 from \'$1\';', { pattern: 'let\\s+(\\w+)\\s*=\\s*require\\s*\\(\\s*[\'\"]([\\w.\\-/]+)\\s*[\'\"]\\s*\\)\\s*', isRegExp: true });
            actual = testObject.getReplaceString('let something = require(\'fs\')');
            assert.strictEqual(actual, 'import * as something from \'something\';');
            testObject = new replace_1.ReplacePattern('import * as $2 from \'$1\';', { pattern: 'let\\s+(\\w+)\\s*=\\s*require\\s*\\(\\s*[\'\"]([\\w.\\-/]+)\\s*[\'\"]\\s*\\)\\s*', isRegExp: true });
            actual = testObject.getReplaceString('let something = require(\'fs\')');
            assert.strictEqual(actual, 'import * as fs from \'something\';');
            testObject = new replace_1.ReplacePattern('import * as $0 from \'$0\';', { pattern: 'let\\s+(\\w+)\\s*=\\s*require\\s*\\(\\s*[\'\"]([\\w.\\-/]+)\\s*[\'\"]\\s*\\)\\s*', isRegExp: true });
            actual = testObject.getReplaceString('let something = require(\'fs\');');
            assert.strictEqual(actual, 'import * as let something = require(\'fs\') from \'let something = require(\'fs\')\';');
            testObject = new replace_1.ReplacePattern('import * as $1 from \'$2\';', { pattern: 'let\\s+(\\w+)\\s*=\\s*require\\s*\\(\\s*[\'\"]([\\w.\\-/]+)\\s*[\'\"]\\s*\\)\\s*', isRegExp: false });
            actual = testObject.getReplaceString('let fs = require(\'fs\');');
            assert.strictEqual(actual, null);
            testObject = new replace_1.ReplacePattern('cat$1', { pattern: 'for(.*)', isRegExp: true });
            actual = testObject.getReplaceString('for ()');
            assert.strictEqual(actual, 'cat ()');
        });
        test('case operations', () => {
            const testObject = new replace_1.ReplacePattern('a\\u$1l\\u\\l\\U$2M$3n', { pattern: 'a(l)l(good)m(e)n', isRegExp: true });
            const actual = testObject.getReplaceString('allgoodmen');
            assert.strictEqual(actual, 'aLlGoODMen');
        });
        test('case operations - no false positive', () => {
            let testObject = new replace_1.ReplacePattern('\\left $1', { pattern: '(pattern)', isRegExp: true });
            let actual = testObject.getReplaceString('pattern');
            assert.strictEqual(actual, '\\left pattern');
            testObject = new replace_1.ReplacePattern('\\hi \\left $1', { pattern: '(pattern)', isRegExp: true });
            actual = testObject.getReplaceString('pattern');
            assert.strictEqual(actual, '\\hi \\left pattern');
            testObject = new replace_1.ReplacePattern('\\left \\L$1', { pattern: 'PATT(ERN)', isRegExp: true });
            actual = testObject.getReplaceString('PATTERN');
            assert.strictEqual(actual, '\\left ern');
        });
        test('case operations and newline', () => {
            const testObject = new replace_1.ReplacePattern('$1\n\\U$2', { pattern: '(multi)(line)', isRegExp: true });
            const actual = testObject.getReplaceString('multiline');
            assert.strictEqual(actual, 'multi\nLINE');
        });
        test('get replace string for no matches', () => {
            let testObject = new replace_1.ReplacePattern('hello', { pattern: 'bla', isRegExp: true });
            let actual = testObject.getReplaceString('foo');
            assert.strictEqual(actual, null);
            testObject = new replace_1.ReplacePattern('hello', { pattern: 'bla', isRegExp: false });
            actual = testObject.getReplaceString('foo');
            assert.strictEqual(actual, null);
        });
        test('get replace string if match is sub-string of the text', () => {
            let testObject = new replace_1.ReplacePattern('hello', { pattern: 'bla', isRegExp: true });
            let actual = testObject.getReplaceString('this is a bla text');
            assert.strictEqual(actual, 'hello');
            testObject = new replace_1.ReplacePattern('hello', { pattern: 'bla', isRegExp: false });
            actual = testObject.getReplaceString('this is a bla text');
            assert.strictEqual(actual, 'hello');
            testObject = new replace_1.ReplacePattern('that', { pattern: 'this(?=.*bla)', isRegExp: true });
            actual = testObject.getReplaceString('this is a bla text');
            assert.strictEqual(actual, 'that');
            testObject = new replace_1.ReplacePattern('$1at', { pattern: '(th)is(?=.*bla)', isRegExp: true });
            actual = testObject.getReplaceString('this is a bla text');
            assert.strictEqual(actual, 'that');
            testObject = new replace_1.ReplacePattern('$1e', { pattern: '(th)is(?=.*bla)', isRegExp: true });
            actual = testObject.getReplaceString('this is a bla text');
            assert.strictEqual(actual, 'the');
            testObject = new replace_1.ReplacePattern('$1ere', { pattern: '(th)is(?=.*bla)', isRegExp: true });
            actual = testObject.getReplaceString('this is a bla text');
            assert.strictEqual(actual, 'there');
            testObject = new replace_1.ReplacePattern('$1', { pattern: '(th)is(?=.*bla)', isRegExp: true });
            actual = testObject.getReplaceString('this is a bla text');
            assert.strictEqual(actual, 'th');
            testObject = new replace_1.ReplacePattern('ma$1', { pattern: '(th)is(?=.*bla)', isRegExp: true });
            actual = testObject.getReplaceString('this is a bla text');
            assert.strictEqual(actual, 'math');
            testObject = new replace_1.ReplacePattern('ma$1s', { pattern: '(th)is(?=.*bla)', isRegExp: true });
            actual = testObject.getReplaceString('this is a bla text');
            assert.strictEqual(actual, 'maths');
            testObject = new replace_1.ReplacePattern('ma$1s', { pattern: '(th)is(?=.*bla)', isRegExp: true });
            actual = testObject.getReplaceString('this is a bla text');
            assert.strictEqual(actual, 'maths');
            testObject = new replace_1.ReplacePattern('$0', { pattern: '(th)is(?=.*bla)', isRegExp: true });
            actual = testObject.getReplaceString('this is a bla text');
            assert.strictEqual(actual, 'this');
            testObject = new replace_1.ReplacePattern('$0$1', { pattern: '(th)is(?=.*bla)', isRegExp: true });
            actual = testObject.getReplaceString('this is a bla text');
            assert.strictEqual(actual, 'thisth');
            testObject = new replace_1.ReplacePattern('foo', { pattern: 'bla(?=\\stext$)', isRegExp: true });
            actual = testObject.getReplaceString('this is a bla text');
            assert.strictEqual(actual, 'foo');
            testObject = new replace_1.ReplacePattern('f$1', { pattern: 'b(la)(?=\\stext$)', isRegExp: true });
            actual = testObject.getReplaceString('this is a bla text');
            assert.strictEqual(actual, 'fla');
            testObject = new replace_1.ReplacePattern('f$0', { pattern: 'b(la)(?=\\stext$)', isRegExp: true });
            actual = testObject.getReplaceString('this is a bla text');
            assert.strictEqual(actual, 'fbla');
            testObject = new replace_1.ReplacePattern('$0ah', { pattern: 'b(la)(?=\\stext$)', isRegExp: true });
            actual = testObject.getReplaceString('this is a bla text');
            assert.strictEqual(actual, 'blaah');
            testObject = new replace_1.ReplacePattern('newrege$1', true, /Testrege(\w*)/);
            actual = testObject.getReplaceString('Testregex', true);
            assert.strictEqual(actual, 'Newregex');
            testObject = new replace_1.ReplacePattern('newrege$1', true, /TESTREGE(\w*)/);
            actual = testObject.getReplaceString('TESTREGEX', true);
            assert.strictEqual(actual, 'NEWREGEX');
            testObject = new replace_1.ReplacePattern('new_rege$1', true, /Test_Rege(\w*)/);
            actual = testObject.getReplaceString('Test_Regex', true);
            assert.strictEqual(actual, 'New_Regex');
            testObject = new replace_1.ReplacePattern('new-rege$1', true, /Test-Rege(\w*)/);
            actual = testObject.getReplaceString('Test-Regex', true);
            assert.strictEqual(actual, 'New-Regex');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwbGFjZS50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3NlYXJjaC90ZXN0L2NvbW1vbi9yZXBsYWNlLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBT0EsS0FBSyxDQUFDLHNCQUFzQixFQUFFLEdBQUcsRUFBRTtRQUVsQyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsR0FBRyxFQUFFO1lBQ2pDLE1BQU0sU0FBUyxHQUFHLENBQUMsS0FBYSxFQUFFLFFBQWdCLEVBQUUscUJBQThCLEVBQUUsRUFBRTtnQkFDckYsSUFBSSxNQUFNLEdBQUcsSUFBSSx3QkFBYyxDQUFDLEtBQUssRUFBRSxFQUFFLE9BQU8sRUFBRSxhQUFhLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQ25GLE1BQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDN0MsTUFBTSxDQUFDLFdBQVcsQ0FBQyxxQkFBcUIsRUFBRSxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBRWhFLE1BQU0sR0FBRyxJQUFJLHdCQUFjLENBQUMsT0FBTyxHQUFHLEtBQUssR0FBRyxJQUFJLEVBQUUsRUFBRSxPQUFPLEVBQUUsYUFBYSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUNoRyxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sR0FBRyxRQUFRLEdBQUcsSUFBSSxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDOUQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxxQkFBcUIsRUFBRSxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDakUsQ0FBQyxDQUFDO1lBRUYsK0JBQStCO1lBQy9CLFNBQVMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRW5DLFlB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