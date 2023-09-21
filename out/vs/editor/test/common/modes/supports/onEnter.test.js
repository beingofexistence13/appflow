define(["require", "exports", "assert", "vs/editor/common/languages/languageConfiguration", "vs/editor/common/languages/supports/onEnter", "vs/editor/test/common/modes/supports/javascriptOnEnterRules", "vs/base/test/common/utils"], function (require, exports, assert, languageConfiguration_1, onEnter_1, javascriptOnEnterRules_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('OnEnter', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('uses brackets', () => {
            const brackets = [
                ['(', ')'],
                ['begin', 'end']
            ];
            const support = new onEnter_1.OnEnterSupport({
                brackets: brackets
            });
            const testIndentAction = (beforeText, afterText, expected) => {
                const actual = support.onEnter(3 /* EditorAutoIndentStrategy.Advanced */, '', beforeText, afterText);
                if (expected === languageConfiguration_1.IndentAction.None) {
                    assert.strictEqual(actual, null);
                }
                else {
                    assert.strictEqual(actual.indentAction, expected);
                }
            };
            testIndentAction('a', '', languageConfiguration_1.IndentAction.None);
            testIndentAction('', 'b', languageConfiguration_1.IndentAction.None);
            testIndentAction('(', 'b', languageConfiguration_1.IndentAction.Indent);
            testIndentAction('a', ')', languageConfiguration_1.IndentAction.None);
            testIndentAction('begin', 'ending', languageConfiguration_1.IndentAction.Indent);
            testIndentAction('abegin', 'end', languageConfiguration_1.IndentAction.None);
            testIndentAction('begin', ')', languageConfiguration_1.IndentAction.Indent);
            testIndentAction('begin', 'end', languageConfiguration_1.IndentAction.IndentOutdent);
            testIndentAction('begin ', ' end', languageConfiguration_1.IndentAction.IndentOutdent);
            testIndentAction(' begin', 'end//as', languageConfiguration_1.IndentAction.IndentOutdent);
            testIndentAction('(', ')', languageConfiguration_1.IndentAction.IndentOutdent);
            testIndentAction('( ', ')', languageConfiguration_1.IndentAction.IndentOutdent);
            testIndentAction('a(', ')b', languageConfiguration_1.IndentAction.IndentOutdent);
            testIndentAction('(', '', languageConfiguration_1.IndentAction.Indent);
            testIndentAction('(', 'foo', languageConfiguration_1.IndentAction.Indent);
            testIndentAction('begin', 'foo', languageConfiguration_1.IndentAction.Indent);
            testIndentAction('begin', '', languageConfiguration_1.IndentAction.Indent);
        });
        test('Issue #121125: onEnterRules with global modifier', () => {
            const support = new onEnter_1.OnEnterSupport({
                onEnterRules: [
                    {
                        action: {
                            appendText: '/// ',
                            indentAction: languageConfiguration_1.IndentAction.Outdent
                        },
                        beforeText: /^\s*\/{3}.*$/gm
                    }
                ]
            });
            const testIndentAction = (previousLineText, beforeText, afterText, expectedIndentAction, expectedAppendText, removeText = 0) => {
                const actual = support.onEnter(3 /* EditorAutoIndentStrategy.Advanced */, previousLineText, beforeText, afterText);
                if (expectedIndentAction === null) {
                    assert.strictEqual(actual, null, 'isNull:' + beforeText);
                }
                else {
                    assert.strictEqual(actual !== null, true, 'isNotNull:' + beforeText);
                    assert.strictEqual(actual.indentAction, expectedIndentAction, 'indentAction:' + beforeText);
                    if (expectedAppendText !== null) {
                        assert.strictEqual(actual.appendText, expectedAppendText, 'appendText:' + beforeText);
                    }
                    if (removeText !== 0) {
                        assert.strictEqual(actual.removeText, removeText, 'removeText:' + beforeText);
                    }
                }
            };
            testIndentAction('/// line', '/// line', '', languageConfiguration_1.IndentAction.Outdent, '/// ');
            testIndentAction('/// line', '/// line', '', languageConfiguration_1.IndentAction.Outdent, '/// ');
        });
        test('uses regExpRules', () => {
            const support = new onEnter_1.OnEnterSupport({
                onEnterRules: javascriptOnEnterRules_1.javascriptOnEnterRules
            });
            const testIndentAction = (previousLineText, beforeText, afterText, expectedIndentAction, expectedAppendText, removeText = 0) => {
                const actual = support.onEnter(3 /* EditorAutoIndentStrategy.Advanced */, previousLineText, beforeText, afterText);
                if (expectedIndentAction === null) {
                    assert.strictEqual(actual, null, 'isNull:' + beforeText);
                }
                else {
                    assert.strictEqual(actual !== null, true, 'isNotNull:' + beforeText);
                    assert.strictEqual(actual.indentAction, expectedIndentAction, 'indentAction:' + beforeText);
                    if (expectedAppendText !== null) {
                        assert.strictEqual(actual.appendText, expectedAppendText, 'appendText:' + beforeText);
                    }
                    if (removeText !== 0) {
                        assert.strictEqual(actual.removeText, removeText, 'removeText:' + beforeText);
                    }
                }
            };
            testIndentAction('', '\t/**', ' */', languageConfiguration_1.IndentAction.IndentOutdent, ' * ');
            testIndentAction('', '\t/**', '', languageConfiguration_1.IndentAction.None, ' * ');
            testIndentAction('', '\t/** * / * / * /', '', languageConfiguration_1.IndentAction.None, ' * ');
            testIndentAction('', '\t/** /*', '', languageConfiguration_1.IndentAction.None, ' * ');
            testIndentAction('', '/**', '', languageConfiguration_1.IndentAction.None, ' * ');
            testIndentAction('', '\t/**/', '', null, null);
            testIndentAction('', '\t/***/', '', null, null);
            testIndentAction('', '\t/*******/', '', null, null);
            testIndentAction('', '\t/** * * * * */', '', null, null);
            testIndentAction('', '\t/** */', '', null, null);
            testIndentAction('', '\t/** asdfg */', '', null, null);
            testIndentAction('', '\t/* asdfg */', '', null, null);
            testIndentAction('', '\t/* asdfg */', '', null, null);
            testIndentAction('', '\t/** asdfg */', '', null, null);
            testIndentAction('', '*/', '', null, null);
            testIndentAction('', '\t/*', '', null, null);
            testIndentAction('', '\t*', '', null, null);
            testIndentAction('\t/**', '\t *', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction('\t * something', '\t *', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction('\t *', '\t *', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction('', '\t */', '', languageConfiguration_1.IndentAction.None, null, 1);
            testIndentAction('', '\t * */', '', languageConfiguration_1.IndentAction.None, null, 1);
            testIndentAction('', '\t * * / * / * / */', '', null, null);
            testIndentAction('\t/**', '\t * ', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction('\t * something', '\t * ', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction('\t *', '\t * ', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction('/**', ' * ', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction(' * something', ' * ', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction(' *', ' * asdfsfagadfg', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction('/**', ' * asdfsfagadfg * * * ', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction(' * something', ' * asdfsfagadfg * * * ', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction(' *', ' * asdfsfagadfg * * * ', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction('/**', ' * /*', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction(' * something', ' * /*', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction(' *', ' * /*', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction('/**', ' * asdfsfagadfg * / * / * /', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction(' * something', ' * asdfsfagadfg * / * / * /', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction(' *', ' * asdfsfagadfg * / * / * /', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction('/**', ' * asdfsfagadfg * / * / * /*', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction(' * something', ' * asdfsfagadfg * / * / * /*', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction(' *', ' * asdfsfagadfg * / * / * /*', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction('', ' */', '', languageConfiguration_1.IndentAction.None, null, 1);
            testIndentAction(' */', ' * test() {', '', languageConfiguration_1.IndentAction.Indent, null, 0);
            testIndentAction('', '\t */', '', languageConfiguration_1.IndentAction.None, null, 1);
            testIndentAction('', '\t\t */', '', languageConfiguration_1.IndentAction.None, null, 1);
            testIndentAction('', '   */', '', languageConfiguration_1.IndentAction.None, null, 1);
            testIndentAction('', '     */', '', languageConfiguration_1.IndentAction.None, null, 1);
            testIndentAction('', '\t     */', '', languageConfiguration_1.IndentAction.None, null, 1);
            testIndentAction('', ' *--------------------------------------------------------------------------------------------*/', '', languageConfiguration_1.IndentAction.None, null, 1);
            // issue #43469
            testIndentAction('class A {', '    * test() {', '', languageConfiguration_1.IndentAction.Indent, null, 0);
            testIndentAction('', '    * test() {', '', languageConfiguration_1.IndentAction.Indent, null, 0);
            testIndentAction('    ', '    * test() {', '', languageConfiguration_1.IndentAction.Indent, null, 0);
            testIndentAction('class A {', '  * test() {', '', languageConfiguration_1.IndentAction.Indent, null, 0);
            testIndentAction('', '  * test() {', '', languageConfiguration_1.IndentAction.Indent, null, 0);
            testIndentAction('  ', '  * test() {', '', languageConfiguration_1.IndentAction.Indent, null, 0);
        });
        test('issue #141816', () => {
            const support = new onEnter_1.OnEnterSupport({
                onEnterRules: javascriptOnEnterRules_1.javascriptOnEnterRules
            });
            const testIndentAction = (beforeText, afterText, expected) => {
                const actual = support.onEnter(3 /* EditorAutoIndentStrategy.Advanced */, '', beforeText, afterText);
                if (expected === languageConfiguration_1.IndentAction.None) {
                    assert.strictEqual(actual, null);
                }
                else {
                    assert.strictEqual(actual.indentAction, expected);
                }
            };
            testIndentAction('const r = /{/;', '', languageConfiguration_1.IndentAction.None);
            testIndentAction('const r = /{[0-9]/;', '', languageConfiguration_1.IndentAction.None);
            testIndentAction('const r = /[a-zA-Z]{/;', '', languageConfiguration_1.IndentAction.None);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib25FbnRlci50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL3Rlc3QvY29tbW9uL21vZGVzL3N1cHBvcnRzL29uRW50ZXIudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFXQSxLQUFLLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRTtRQUVyQixJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFMUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxHQUFHLEVBQUU7WUFDMUIsTUFBTSxRQUFRLEdBQW9CO2dCQUNqQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Z0JBQ1YsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDO2FBQ2hCLENBQUM7WUFDRixNQUFNLE9BQU8sR0FBRyxJQUFJLHdCQUFjLENBQUM7Z0JBQ2xDLFFBQVEsRUFBRSxRQUFRO2FBQ2xCLENBQUMsQ0FBQztZQUNILE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxVQUFrQixFQUFFLFNBQWlCLEVBQUUsUUFBc0IsRUFBRSxFQUFFO2dCQUMxRixNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsT0FBTyw0Q0FBb0MsRUFBRSxFQUFFLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDN0YsSUFBSSxRQUFRLEtBQUssb0NBQVksQ0FBQyxJQUFJLEVBQUU7b0JBQ25DLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO2lCQUNqQztxQkFBTTtvQkFDTixNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU8sQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUM7aUJBQ25EO1lBQ0YsQ0FBQyxDQUFDO1lBRUYsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxvQ0FBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzdDLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsb0NBQVksQ0FBQyxJQUFJLENB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