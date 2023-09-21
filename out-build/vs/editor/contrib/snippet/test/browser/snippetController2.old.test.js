var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "assert", "vs/base/test/common/mock", "vs/base/test/common/utils", "vs/editor/common/core/position", "vs/editor/common/core/selection", "vs/editor/common/services/languageFeaturesService", "vs/editor/contrib/snippet/browser/snippetController2", "vs/editor/test/browser/testCodeEditor", "vs/editor/test/common/modes/testLanguageConfigurationService", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/serviceCollection", "vs/platform/label/common/label", "vs/platform/log/common/log", "vs/platform/workspace/common/workspace"], function (require, exports, assert, mock_1, utils_1, position_1, selection_1, languageFeaturesService_1, snippetController2_1, testCodeEditor_1, testLanguageConfigurationService_1, contextkey_1, serviceCollection_1, label_1, log_1, workspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let TestSnippetController = class TestSnippetController extends snippetController2_1.$05 {
        constructor(editor, t) {
            const testLanguageConfigurationService = new testLanguageConfigurationService_1.$D0b();
            super(editor, new log_1.$fj(), new languageFeaturesService_1.$oBb(), t, testLanguageConfigurationService);
            this.t = t;
            this.s = testLanguageConfigurationService;
        }
        dispose() {
            super.dispose();
            this.s.dispose();
        }
        isInSnippetMode() {
            return snippetController2_1.$05.InSnippetMode.getValue(this.t);
        }
    };
    TestSnippetController = __decorate([
        __param(1, contextkey_1.$3i)
    ], TestSnippetController);
    suite('SnippetController', () => {
        (0, utils_1.$bT)();
        function snippetTest(cb, lines) {
            if (!lines) {
                lines = [
                    'function test() {',
                    '\tvar x = 3;',
                    '\tvar arr = [];',
                    '\t',
                    '}'
                ];
            }
            const serviceCollection = new serviceCollection_1.$zh([label_1.$Vz, new class extends (0, mock_1.$rT)() {
                }], [workspace_1.$Kh, new class extends (0, mock_1.$rT)() {
                }]);
            (0, testCodeEditor_1.$X0b)(lines, { serviceCollection }, (editor) => {
                editor.getModel().updateOptions({
                    insertSpaces: false
                });
                const snippetController = editor.registerAndInstantiateContribution(TestSnippetController.ID, TestSnippetController);
                const template = [
                    'for (var ${1:index}; $1 < ${2:array}.length; $1++) {',
                    '\tvar element = $2[$1];',
                    '\t$0',
                    '}'
                ].join('\n');
                cb(editor, template, snippetController);
                snippetController.dispose();
            });
        }
        test('Simple accepted', () => {
            snippetTest((editor, template, snippetController) => {
                editor.setPosition({ lineNumber: 4, column: 2 });
                snippetController.insert(template);
                assert.strictEqual(editor.getModel().getLineContent(4), '\tfor (var index; index < array.length; index++) {');
                assert.strictEqual(editor.getModel().getLineContent(5), '\t\tvar element = array[index];');
                assert.strictEqual(editor.getModel().getLineContent(6), '\t\t');
                assert.strictEqual(editor.getModel().getLineContent(7), '\t}');
                editor.trigger('test', 'type', { text: 'i' });
                assert.strictEqual(editor.getModel().getLineContent(4), '\tfor (var i; i < array.length; i++) {');
                assert.strictEqual(editor.getModel().getLineContent(5), '\t\tvar element = array[i];');
                assert.strictEqual(editor.getModel().getLineContent(6), '\t\t');
                assert.strictEqual(editor.getModel().getLineContent(7), '\t}');
                snippetController.next();
                editor.trigger('test', 'type', { text: 'arr' });
                assert.strictEqual(editor.getModel().getLineContent(4), '\tfor (var i; i < arr.length; i++) {');
                assert.strictEqual(editor.getModel().getLineContent(5), '\t\tvar element = arr[i];');
                assert.strictEqual(editor.getModel().getLineContent(6), '\t\t');
                assert.strictEqual(editor.getModel().getLineContent(7), '\t}');
                snippetController.prev();
                editor.trigger('test', 'type', { text: 'j' });
                assert.strictEqual(editor.getModel().getLineContent(4), '\tfor (var j; j < arr.length; j++) {');
                assert.strictEqual(editor.getModel().getLineContent(5), '\t\tvar element = arr[j];');
                assert.strictEqual(editor.getModel().getLineContent(6), '\t\t');
                assert.strictEqual(editor.getModel().getLineContent(7), '\t}');
                snippetController.next();
                snippetController.next();
                assert.deepStrictEqual(editor.getPosition(), new position_1.$js(6, 3));
            });
        });
        test('Simple canceled', () => {
            snippetTest((editor, template, snippetController) => {
                editor.setPosition({ lineNumber: 4, column: 2 });
                snippetController.insert(template);
                assert.strictEqual(editor.getModel().getLineContent(4), '\tfor (var index; index < array.length; index++) {');
                assert.strictEqual(editor.getModel().getLineContent(5), '\t\tvar element = array[index];');
                assert.strictEqual(editor.getModel().getLineContent(6), '\t\t');
                assert.strictEqual(editor.getModel().getLineContent(7), '\t}');
                snippetController.cancel();
                assert.deepStrictEqual(editor.getPosition(), new position_1.$js(4, 16));
            });
        });
        // test('Stops when deleting lines above', () => {
        // 	snippetTest((editor, codeSnippet, snippetController) => {
        // 		editor.setPosition({ lineNumber: 4, column: 2 });
        // 		snippetController.insert(codeSnippet, 0, 0);
        // 		editor.getModel()!.applyEdits([{
        // 			forceMoveMarkers: false,
        // 			identifier: null,
        // 			isAutoWhitespaceEdit: false,
        // 			range: new Range(1, 1, 3, 1),
        // 			text: null
        // 		}]);
        // 		assert.strictEqual(snippetController.isInSnippetMode(), false);
        // 	});
        // });
        // test('Stops when deleting lines below', () => {
        // 	snippetTest((editor, codeSnippet, snippetController) => {
        // 		editor.setPosition({ lineNumber: 4, column: 2 });
        // 		snippetController.run(codeSnippet, 0, 0);
        // 		editor.getModel()!.applyEdits([{
        // 			forceMoveMarkers: false,
        // 			identifier: null,
        // 			isAutoWhitespaceEdit: false,
        // 			range: new Range(8, 1, 8, 100),
        // 			text: null
        // 		}]);
        // 		assert.strictEqual(snippetController.isInSnippetMode(), false);
        // 	});
        // });
        // test('Stops when inserting lines above', () => {
        // 	snippetTest((editor, codeSnippet, snippetController) => {
        // 		editor.setPosition({ lineNumber: 4, column: 2 });
        // 		snippetController.run(codeSnippet, 0, 0);
        // 		editor.getModel()!.applyEdits([{
        // 			forceMoveMarkers: false,
        // 			identifier: null,
        // 			isAutoWhitespaceEdit: false,
        // 			range: new Range(1, 100, 1, 100),
        // 			text: '\nHello'
        // 		}]);
        // 		assert.strictEqual(snippetController.isInSnippetMode(), false);
        // 	});
        // });
        // test('Stops when inserting lines below', () => {
        // 	snippetTest((editor, codeSnippet, snippetController) => {
        // 		editor.setPosition({ lineNumber: 4, column: 2 });
        // 		snippetController.run(codeSnippet, 0, 0);
        // 		editor.getModel()!.applyEdits([{
        // 			forceMoveMarkers: false,
        // 			identifier: null,
        // 			isAutoWhitespaceEdit: false,
        // 			range: new Range(8, 100, 8, 100),
        // 			text: '\nHello'
        // 		}]);
        // 		assert.strictEqual(snippetController.isInSnippetMode(), false);
        // 	});
        // });
        test('Stops when calling model.setValue()', () => {
            snippetTest((editor, codeSnippet, snippetController) => {
                editor.setPosition({ lineNumber: 4, column: 2 });
                snippetController.insert(codeSnippet);
                editor.getModel().setValue('goodbye');
                assert.strictEqual(snippetController.isInSnippetMode(), false);
            });
        });
        test('Stops when undoing', () => {
            snippetTest((editor, codeSnippet, snippetController) => {
                editor.setPosition({ lineNumber: 4, column: 2 });
                snippetController.insert(codeSnippet);
                editor.getModel().undo();
                assert.strictEqual(snippetController.isInSnippetMode(), false);
            });
        });
        test('Stops when moving cursor outside', () => {
            snippetTest((editor, codeSnippet, snippetController) => {
                editor.setPosition({ lineNumber: 4, column: 2 });
                snippetController.insert(codeSnippet);
                editor.setPosition({ lineNumber: 1, column: 1 });
                assert.strictEqual(snippetController.isInSnippetMode(), false);
            });
        });
        test('Stops when disconnecting editor model', () => {
            snippetTest((editor, codeSnippet, snippetController) => {
                editor.setPosition({ lineNumber: 4, column: 2 });
                snippetController.insert(codeSnippet);
                editor.setModel(null);
                assert.strictEqual(snippetController.isInSnippetMode(), false);
            });
        });
        test('Stops when disposing editor', () => {
            snippetTest((editor, codeSnippet, snippetController) => {
                editor.setPosition({ lineNumber: 4, column: 2 });
                snippetController.insert(codeSnippet);
                snippetController.dispose();
                assert.strictEqual(snippetController.isInSnippetMode(), false);
            });
        });
        test('Final tabstop with multiple selections', () => {
            snippetTest((editor, codeSnippet, snippetController) => {
                editor.setSelections([
                    new selection_1.$ms(1, 1, 1, 1),
                    new selection_1.$ms(2, 1, 2, 1),
                ]);
                codeSnippet = 'foo$0';
                snippetController.insert(codeSnippet);
                assert.strictEqual(editor.getSelections().length, 2);
                const [first, second] = editor.getSelections();
                assert.ok(first.equalsRange({ startLineNumber: 1, startColumn: 4, endLineNumber: 1, endColumn: 4 }), first.toString());
                assert.ok(second.equalsRange({ startLineNumber: 2, startColumn: 4, endLineNumber: 2, endColumn: 4 }), second.toString());
            });
            snippetTest((editor, codeSnippet, snippetController) => {
                editor.setSelections([
                    new selection_1.$ms(1, 1, 1, 1),
                    new selection_1.$ms(2, 1, 2, 1),
                ]);
                codeSnippet = 'foo$0bar';
                snippetController.insert(codeSnippet);
                assert.strictEqual(editor.getSelections().length, 2);
                const [first, second] = editor.getSelections();
                assert.ok(first.equalsRange({ startLineNumber: 1, startColumn: 4, endLineNumber: 1, endColumn: 4 }), first.toString());
                assert.ok(second.equalsRange({ startLineNumber: 2, startColumn: 4, endLineNumber: 2, endColumn: 4 }), second.toString());
            });
            snippetTest((editor, codeSnippet, snippetController) => {
                editor.setSelections([
                    new selection_1.$ms(1, 1, 1, 1),
                    new selection_1.$ms(1, 5, 1, 5),
                ]);
                codeSnippet = 'foo$0bar';
                snippetController.insert(codeSnippet);
                assert.strictEqual(editor.getSelections().length, 2);
                const [first, second] = editor.getSelections();
                assert.ok(first.equalsRange({ startLineNumber: 1, startColumn: 4, endLineNumber: 1, endColumn: 4 }), first.toString());
                assert.ok(second.equalsRange({ startLineNumber: 1, startColumn: 14, endLineNumber: 1, endColumn: 14 }), second.toString());
            });
            snippetTest((editor, codeSnippet, snippetController) => {
                editor.setSelections([
                    new selection_1.$ms(1, 1, 1, 1),
                    new selection_1.$ms(1, 5, 1, 5),
                ]);
                codeSnippet = 'foo\n$0\nbar';
                snippetController.insert(codeSnippet);
                assert.strictEqual(editor.getSelections().length, 2);
                const [first, second] = editor.getSelections();
                assert.ok(first.equalsRange({ startLineNumber: 2, startColumn: 1, endLineNumber: 2, endColumn: 1 }), first.toString());
                assert.ok(second.equalsRange({ startLineNumber: 4, startColumn: 1, endLineNumber: 4, endColumn: 1 }), second.toString());
            });
            snippetTest((editor, codeSnippet, snippetController) => {
                editor.setSelections([
                    new selection_1.$ms(1, 1, 1, 1),
                    new selection_1.$ms(1, 5, 1, 5),
                ]);
                codeSnippet = 'foo\n$0\nbar';
                snippetController.insert(codeSnippet);
                assert.strictEqual(editor.getSelections().length, 2);
                const [first, second] = editor.getSelections();
                assert.ok(first.equalsRange({ startLineNumber: 2, startColumn: 1, endLineNumber: 2, endColumn: 1 }), first.toString());
                assert.ok(second.equalsRange({ startLineNumber: 4, startColumn: 1, endLineNumber: 4, endColumn: 1 }), second.toString());
            });
            snippetTest((editor, codeSnippet, snippetController) => {
                editor.setSelections([
                    new selection_1.$ms(2, 7, 2, 7),
                ]);
                codeSnippet = 'xo$0r';
                snippetController.insert(codeSnippet, { overwriteBefore: 1 });
                assert.strictEqual(editor.getSelections().length, 1);
                assert.ok(editor.getSelection().equalsRange({ startLineNumber: 2, startColumn: 8, endColumn: 8, endLineNumber: 2 }));
            });
        });
        test('Final tabstop, #11742 simple', () => {
            snippetTest((editor, codeSnippet, controller) => {
                editor.setSelection(new selection_1.$ms(1, 19, 1, 19));
                codeSnippet = '{{% url_**$1** %}}';
                controller.insert(codeSnippet, { overwriteBefore: 2 });
                assert.strictEqual(editor.getSelections().length, 1);
                assert.ok(editor.getSelection().equalsRange({ startLineNumber: 1, startColumn: 27, endLineNumber: 1, endColumn: 27 }));
                assert.strictEqual(editor.getModel().getValue(), 'example example {{% url_**** %}}');
            }, ['example example sc']);
            snippetTest((editor, codeSnippet, controller) => {
                editor.setSelection(new selection_1.$ms(1, 3, 1, 3));
                codeSnippet = [
                    'afterEach((done) => {',
                    '\t${1}test',
                    '});'
                ].join('\n');
                controller.insert(codeSnippet, { overwriteBefore: 2 });
                assert.strictEqual(editor.getSelections().length, 1);
                assert.ok(editor.getSelection().equalsRange({ startLineNumber: 2, startColumn: 2, endLineNumber: 2, endColumn: 2 }), editor.getSelection().toString());
                assert.strictEqual(editor.getModel().getValue(), 'afterEach((done) => {\n\ttest\n});');
            }, ['af']);
            snippetTest((editor, codeSnippet, controller) => {
                editor.setSelection(new selection_1.$ms(1, 3, 1, 3));
                codeSnippet = [
                    'afterEach((done) => {',
                    '${1}\ttest',
                    '});'
                ].join('\n');
                controller.insert(codeSnippet, { overwriteBefore: 2 });
                assert.strictEqual(editor.getSelections().length, 1);
                assert.ok(editor.getSelection().equalsRange({ startLineNumber: 2, startColumn: 1, endLineNumber: 2, endColumn: 1 }), editor.getSelection().toString());
                assert.strictEqual(editor.getModel().getValue(), 'afterEach((done) => {\n\ttest\n});');
            }, ['af']);
            snippetTest((editor, codeSnippet, controller) => {
                editor.setSelection(new selection_1.$ms(1, 9, 1, 9));
                codeSnippet = [
                    'aft${1}er'
                ].join('\n');
                controller.insert(codeSnippet, { overwriteBefore: 8 });
                assert.strictEqual(editor.getModel().getValue(), 'after');
                assert.strictEqual(editor.getSelections().length, 1);
                assert.ok(editor.getSelection().equalsRange({ startLineNumber: 1, startColumn: 4, endLineNumber: 1, endColumn: 4 }), editor.getSelection().toString());
            }, ['afterone']);
        });
        test('Final tabstop, #11742 different indents', () => {
            snippetTest((editor, codeSnippet, controller) => {
                editor.setSelections([
                    new selection_1.$ms(2, 4, 2, 4),
                    new selection_1.$ms(1, 3, 1, 3)
                ]);
                codeSnippet = [
                    'afterEach((done) => {',
                    '\t${0}test',
                    '});'
                ].join('\n');
                controller.insert(codeSnippet, { overwriteBefore: 2 });
                assert.strictEqual(editor.getSelections().length, 2);
                const [first, second] = editor.getSelections();
                assert.ok(first.equalsRange({ startLineNumber: 5, startColumn: 3, endLineNumber: 5, endColumn: 3 }), first.toString());
                assert.ok(second.equalsRange({ startLineNumber: 2, startColumn: 2, endLineNumber: 2, endColumn: 2 }), second.toString());
            }, ['af', '\taf']);
        });
        test('Final tabstop, #11890 stay at the beginning', () => {
            snippetTest((editor, codeSnippet, controller) => {
                editor.setSelections([
                    new selection_1.$ms(1, 5, 1, 5)
                ]);
                codeSnippet = [
                    'afterEach((done) => {',
                    '${1}\ttest',
                    '});'
                ].join('\n');
                controller.insert(codeSnippet, { overwriteBefore: 2 });
                assert.strictEqual(editor.getSelections().length, 1);
                const [first] = editor.getSelections();
                assert.ok(first.equalsRange({ startLineNumber: 2, startColumn: 3, endLineNumber: 2, endColumn: 3 }), first.toString());
            }, ['  af']);
        });
        test('Final tabstop, no tabstop', () => {
            snippetTest((editor, codeSnippet, controller) => {
                editor.setSelections([
                    new selection_1.$ms(1, 3, 1, 3)
                ]);
                codeSnippet = 'afterEach';
                controller.insert(codeSnippet, { overwriteBefore: 2 });
                assert.ok(editor.getSelection().equalsRange({ startLineNumber: 1, startColumn: 10, endLineNumber: 1, endColumn: 10 }));
            }, ['af', '\taf']);
        });
        test('Multiple cursor and overwriteBefore/After, issue #11060', () => {
            snippetTest((editor, codeSnippet, controller) => {
                editor.setSelections([
                    new selection_1.$ms(1, 7, 1, 7),
                    new selection_1.$ms(2, 4, 2, 4)
                ]);
                codeSnippet = '_foo';
                controller.insert(codeSnippet, { overwriteBefore: 1 });
                assert.strictEqual(editor.getModel().getValue(), 'this._foo\nabc_foo');
            }, ['this._', 'abc']);
            snippetTest((editor, codeSnippet, controller) => {
                editor.setSelections([
                    new selection_1.$ms(1, 7, 1, 7),
                    new selection_1.$ms(2, 4, 2, 4)
                ]);
                codeSnippet = 'XX';
                controller.insert(codeSnippet, { overwriteBefore: 1 });
                assert.strictEqual(editor.getModel().getValue(), 'this.XX\nabcXX');
            }, ['this._', 'abc']);
            snippetTest((editor, codeSnippet, controller) => {
                editor.setSelections([
                    new selection_1.$ms(1, 7, 1, 7),
                    new selection_1.$ms(2, 4, 2, 4),
                    new selection_1.$ms(3, 5, 3, 5)
                ]);
                codeSnippet = '_foo';
                controller.insert(codeSnippet, { overwriteBefore: 1 });
                assert.strictEqual(editor.getModel().getValue(), 'this._foo\nabc_foo\ndef_foo');
            }, ['this._', 'abc', 'def_']);
            snippetTest((editor, codeSnippet, controller) => {
                editor.setSelections([
                    new selection_1.$ms(1, 7, 1, 7),
                    new selection_1.$ms(2, 4, 2, 4),
                    new selection_1.$ms(3, 6, 3, 6)
                ]);
                codeSnippet = '._foo';
                controller.insert(codeSnippet, { overwriteBefore: 2 });
                assert.strictEqual(editor.getModel().getValue(), 'this._foo\nabc._foo\ndef._foo');
            }, ['this._', 'abc', 'def._']);
            snippetTest((editor, codeSnippet, controller) => {
                editor.setSelections([
                    new selection_1.$ms(3, 6, 3, 6),
                    new selection_1.$ms(1, 7, 1, 7),
                    new selection_1.$ms(2, 4, 2, 4),
                ]);
                codeSnippet = '._foo';
                controller.insert(codeSnippet, { overwriteBefore: 2 });
                assert.strictEqual(editor.getModel().getValue(), 'this._foo\nabc._foo\ndef._foo');
            }, ['this._', 'abc', 'def._']);
            snippetTest((editor, codeSnippet, controller) => {
                editor.setSelections([
                    new selection_1.$ms(2, 4, 2, 4),
                    new selection_1.$ms(3, 6, 3, 6),
                    new selection_1.$ms(1, 7, 1, 7),
                ]);
                codeSnippet = '._foo';
                controller.insert(codeSnippet, { overwriteBefore: 2 });
                assert.strictEqual(editor.getModel().getValue(), 'this._._foo\na._foo\ndef._._foo');
            }, ['this._', 'abc', 'def._']);
        });
        test('Multiple cursor and overwriteBefore/After, #16277', () => {
            snippetTest((editor, codeSnippet, controller) => {
                editor.setSelections([
                    new selection_1.$ms(1, 5, 1, 5),
                    new selection_1.$ms(2, 5, 2, 5),
                ]);
                codeSnippet = 'document';
                controller.insert(codeSnippet, { overwriteBefore: 3 });
                assert.strictEqual(editor.getModel().getValue(), '{document}\n{document && true}');
            }, ['{foo}', '{foo && true}']);
        });
        test('Insert snippet twice, #19449', () => {
            snippetTest((editor, codeSnippet, controller) => {
                editor.setSelections([
                    new selection_1.$ms(1, 1, 1, 1)
                ]);
                codeSnippet = 'for (var ${1:i}=0; ${1:i}<len; ${1:i}++) { $0 }';
                controller.insert(codeSnippet);
                assert.strictEqual(editor.getModel().getValue(), 'for (var i=0; i<len; i++) {  }for (var i=0; i<len; i++) {  }');
            }, ['for (var i=0; i<len; i++) {  }']);
            snippetTest((editor, codeSnippet, controller) => {
                editor.setSelections([
                    new selection_1.$ms(1, 1, 1, 1)
                ]);
                codeSnippet = 'for (let ${1:i}=0; ${1:i}<len; ${1:i}++) { $0 }';
                controller.insert(codeSnippet);
                assert.strictEqual(editor.getModel().getValue(), 'for (let i=0; i<len; i++) {  }for (var i=0; i<len; i++) {  }');
            }, ['for (var i=0; i<len; i++) {  }']);
        });
    });
});
//# sourceMappingURL=snippetController2.old.test.js.map