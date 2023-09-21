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
    let TestSnippetController = class TestSnippetController extends snippetController2_1.SnippetController2 {
        constructor(editor, _contextKeyService) {
            const testLanguageConfigurationService = new testLanguageConfigurationService_1.TestLanguageConfigurationService();
            super(editor, new log_1.NullLogService(), new languageFeaturesService_1.LanguageFeaturesService(), _contextKeyService, testLanguageConfigurationService);
            this._contextKeyService = _contextKeyService;
            this._testLanguageConfigurationService = testLanguageConfigurationService;
        }
        dispose() {
            super.dispose();
            this._testLanguageConfigurationService.dispose();
        }
        isInSnippetMode() {
            return snippetController2_1.SnippetController2.InSnippetMode.getValue(this._contextKeyService);
        }
    };
    TestSnippetController = __decorate([
        __param(1, contextkey_1.IContextKeyService)
    ], TestSnippetController);
    suite('SnippetController', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
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
            const serviceCollection = new serviceCollection_1.ServiceCollection([label_1.ILabelService, new class extends (0, mock_1.mock)() {
                }], [workspace_1.IWorkspaceContextService, new class extends (0, mock_1.mock)() {
                }]);
            (0, testCodeEditor_1.withTestCodeEditor)(lines, { serviceCollection }, (editor) => {
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
                assert.deepStrictEqual(editor.getPosition(), new position_1.Position(6, 3));
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
                assert.deepStrictEqual(editor.getPosition(), new position_1.Position(4, 16));
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
                    new selection_1.Selection(1, 1, 1, 1),
                    new selection_1.Selection(2, 1, 2, 1),
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
                    new selection_1.Selection(1, 1, 1, 1),
                    new selection_1.Selection(2, 1, 2, 1),
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
                    new selection_1.Selection(1, 1, 1, 1),
                    new selection_1.Selection(1, 5, 1, 5),
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
                    new selection_1.Selection(1, 1, 1, 1),
                    new selection_1.Selection(1, 5, 1, 5),
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
                    new selection_1.Selection(1, 1, 1, 1),
                    new selection_1.Selection(1, 5, 1, 5),
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
                    new selection_1.Selection(2, 7, 2, 7),
                ]);
                codeSnippet = 'xo$0r';
                snippetController.insert(codeSnippet, { overwriteBefore: 1 });
                assert.strictEqual(editor.getSelections().length, 1);
                assert.ok(editor.getSelection().equalsRange({ startLineNumber: 2, startColumn: 8, endColumn: 8, endLineNumber: 2 }));
            });
        });
        test('Final tabstop, #11742 simple', () => {
            snippetTest((editor, codeSnippet, controller) => {
                editor.setSelection(new selection_1.Selection(1, 19, 1, 19));
                codeSnippet = '{{% url_**$1** %}}';
                controller.insert(codeSnippet, { overwriteBefore: 2 });
                assert.strictEqual(editor.getSelections().length, 1);
                assert.ok(editor.getSelection().equalsRange({ startLineNumber: 1, startColumn: 27, endLineNumber: 1, endColumn: 27 }));
                assert.strictEqual(editor.getModel().getValue(), 'example example {{% url_**** %}}');
            }, ['example example sc']);
            snippetTest((editor, codeSnippet, controller) => {
                editor.setSelection(new selection_1.Selection(1, 3, 1, 3));
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
                editor.setSelection(new selection_1.Selection(1, 3, 1, 3));
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
                editor.setSelection(new selection_1.Selection(1, 9, 1, 9));
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
                    new selection_1.Selection(2, 4, 2, 4),
                    new selection_1.Selection(1, 3, 1, 3)
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
                    new selection_1.Selection(1, 5, 1, 5)
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
                    new selection_1.Selection(1, 3, 1, 3)
                ]);
                codeSnippet = 'afterEach';
                controller.insert(codeSnippet, { overwriteBefore: 2 });
                assert.ok(editor.getSelection().equalsRange({ startLineNumber: 1, startColumn: 10, endLineNumber: 1, endColumn: 10 }));
            }, ['af', '\taf']);
        });
        test('Multiple cursor and overwriteBefore/After, issue #11060', () => {
            snippetTest((editor, codeSnippet, controller) => {
                editor.setSelections([
                    new selection_1.Selection(1, 7, 1, 7),
                    new selection_1.Selection(2, 4, 2, 4)
                ]);
                codeSnippet = '_foo';
                controller.insert(codeSnippet, { overwriteBefore: 1 });
                assert.strictEqual(editor.getModel().getValue(), 'this._foo\nabc_foo');
            }, ['this._', 'abc']);
            snippetTest((editor, codeSnippet, controller) => {
                editor.setSelections([
                    new selection_1.Selection(1, 7, 1, 7),
                    new selection_1.Selection(2, 4, 2, 4)
                ]);
                codeSnippet = 'XX';
                controller.insert(codeSnippet, { overwriteBefore: 1 });
                assert.strictEqual(editor.getModel().getValue(), 'this.XX\nabcXX');
            }, ['this._', 'abc']);
            snippetTest((editor, codeSnippet, controller) => {
                editor.setSelections([
                    new selection_1.Selection(1, 7, 1, 7),
                    new selection_1.Selection(2, 4, 2, 4),
                    new selection_1.Selection(3, 5, 3, 5)
                ]);
                codeSnippet = '_foo';
                controller.insert(codeSnippet, { overwriteBefore: 1 });
                assert.strictEqual(editor.getModel().getValue(), 'this._foo\nabc_foo\ndef_foo');
            }, ['this._', 'abc', 'def_']);
            snippetTest((editor, codeSnippet, controller) => {
                editor.setSelections([
                    new selection_1.Selection(1, 7, 1, 7),
                    new selection_1.Selection(2, 4, 2, 4),
                    new selection_1.Selection(3, 6, 3, 6)
                ]);
                codeSnippet = '._foo';
                controller.insert(codeSnippet, { overwriteBefore: 2 });
                assert.strictEqual(editor.getModel().getValue(), 'this._foo\nabc._foo\ndef._foo');
            }, ['this._', 'abc', 'def._']);
            snippetTest((editor, codeSnippet, controller) => {
                editor.setSelections([
                    new selection_1.Selection(3, 6, 3, 6),
                    new selection_1.Selection(1, 7, 1, 7),
                    new selection_1.Selection(2, 4, 2, 4),
                ]);
                codeSnippet = '._foo';
                controller.insert(codeSnippet, { overwriteBefore: 2 });
                assert.strictEqual(editor.getModel().getValue(), 'this._foo\nabc._foo\ndef._foo');
            }, ['this._', 'abc', 'def._']);
            snippetTest((editor, codeSnippet, controller) => {
                editor.setSelections([
                    new selection_1.Selection(2, 4, 2, 4),
                    new selection_1.Selection(3, 6, 3, 6),
                    new selection_1.Selection(1, 7, 1, 7),
                ]);
                codeSnippet = '._foo';
                controller.insert(codeSnippet, { overwriteBefore: 2 });
                assert.strictEqual(editor.getModel().getValue(), 'this._._foo\na._foo\ndef._._foo');
            }, ['this._', 'abc', 'def._']);
        });
        test('Multiple cursor and overwriteBefore/After, #16277', () => {
            snippetTest((editor, codeSnippet, controller) => {
                editor.setSelections([
                    new selection_1.Selection(1, 5, 1, 5),
                    new selection_1.Selection(2, 5, 2, 5),
                ]);
                codeSnippet = 'document';
                controller.insert(codeSnippet, { overwriteBefore: 3 });
                assert.strictEqual(editor.getModel().getValue(), '{document}\n{document && true}');
            }, ['{foo}', '{foo && true}']);
        });
        test('Insert snippet twice, #19449', () => {
            snippetTest((editor, codeSnippet, controller) => {
                editor.setSelections([
                    new selection_1.Selection(1, 1, 1, 1)
                ]);
                codeSnippet = 'for (var ${1:i}=0; ${1:i}<len; ${1:i}++) { $0 }';
                controller.insert(codeSnippet);
                assert.strictEqual(editor.getModel().getValue(), 'for (var i=0; i<len; i++) {  }for (var i=0; i<len; i++) {  }');
            }, ['for (var i=0; i<len; i++) {  }']);
            snippetTest((editor, codeSnippet, controller) => {
                editor.setSelections([
                    new selection_1.Selection(1, 1, 1, 1)
                ]);
                codeSnippet = 'for (let ${1:i}=0; ${1:i}<len; ${1:i}++) { $0 }';
                controller.insert(codeSnippet);
                assert.strictEqual(editor.getModel().getValue(), 'for (let i=0; i<len; i++) {  }for (var i=0; i<len; i++) {  }');
            }, ['for (var i=0; i<len; i++) {  }']);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25pcHBldENvbnRyb2xsZXIyLm9sZC50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvc25pcHBldC90ZXN0L2Jyb3dzZXIvc25pcHBldENvbnRyb2xsZXIyLm9sZC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQW9CQSxJQUFNLHFCQUFxQixHQUEzQixNQUFNLHFCQUFzQixTQUFRLHVDQUFrQjtRQUlyRCxZQUNDLE1BQW1CLEVBQ2tCLGtCQUFzQztZQUUzRSxNQUFNLGdDQUFnQyxHQUFHLElBQUksbUVBQWdDLEVBQUUsQ0FBQztZQUNoRixLQUFLLENBQUMsTUFBTSxFQUFFLElBQUksb0JBQWMsRUFBRSxFQUFFLElBQUksaURBQXVCLEVBQUUsRUFBRSxrQkFBa0IsRUFBRSxnQ0FBZ0MsQ0FBQyxDQUFDO1lBSHBGLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7WUFJM0UsSUFBSSxDQUFDLGlDQUFpQyxHQUFHLGdDQUFnQyxDQUFDO1FBQzNFLENBQUM7UUFFUSxPQUFPO1lBQ2YsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2hCLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNsRCxDQUFDO1FBRUQsZUFBZTtZQUNkLE9BQU8sdUNBQWtCLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUUsQ0FBQztRQUM1RSxDQUFDO0tBQ0QsQ0FBQTtJQXJCSyxxQkFBcUI7UUFNeEIsV0FBQSwrQkFBa0IsQ0FBQTtPQU5mLHFCQUFxQixDQXFCMUI7SUFFRCxLQUFLLENBQUMsbUJBQW1CLEVBQUUsR0FBRyxFQUFFO1FBRS9CLElBQUEsK0NBQXVDLEdBQUUsQ0FBQztRQUUxQyxTQUFTLFdBQVcsQ0FBQyxFQUFpRyxFQUFFLEtBQWdCO1lBRXZJLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ1gsS0FBSyxHQUFHO29CQUNQLG1CQUFtQjtvQkFDbkIsY0FBYztvQkFDZCxpQkFBaUI7b0JBQ2pCLElBQUk7b0JBQ0osR0FBRztpQkFDSCxDQUFDO2FBQ0Y7WUFFRCxNQUFNLGlCQUFpQixHQUFHLElBQUkscUNBQWlCLENBQzlDLENBQUMscUJBQWEsRUFBRSxJQUFJLEtBQU0sU0FBUSxJQUFBLFdBQUksR0FBaUI7aUJBQUksQ0FBQyxFQUM1RCxDQUFDLG9DQUF3QixFQUFFLElBQUksS0FBTSxTQUFRLElBQUEsV0FBSSxHQUE0QjtpQkFBSSxDQUFDLENBQ2xGLENBQUM7WUFFRixJQUFBLG1DQUFrQixFQUFDLEtBQUssRUFBRSxFQUFFLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxNQUFNLEVBQUUsRUFBRTtnQkFDM0QsTUFBTSxDQUFDLFFBQVEsRUFBRyxDQUFDLGFBQWEsQ0FBQztvQkFDaEMsWUFBWSxFQUFFLEtBQUs7aUJBQ25CLENBQUMsQ0FBQztnQkFDSCxNQUFNLGlCQUFpQixHQUFHLE1BQU0sQ0FBQyxrQ0FBa0MsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLEVBQUUscUJBQXFCLENBQUMsQ0FBQztnQkFDckgsTUFBTSxRQUFRLEdBQUc7b0JBQ2hCLHNEQUFzRDtvQkFDdEQseUJBQXlCO29CQUN6QixNQUFNO29CQUNOLEdBQUc7aUJBQ0gsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRWIsRUFBRSxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztnQkFDeEMsaUJBQWlCLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDN0IsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsRUFBRTtZQUM1QixXQUFXLENBQUMsQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLGlCQUFpQixFQUFFLEVBQUU7Z0JBQ25ELE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUVqRCxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ25DLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBRSxvREFBb0QsQ0FBQyxDQUFDO2dCQUMvRyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUUsaUNBQWlDLENBQUMsQ0FBQztnQkFDNUYsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFHLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUNqRSxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBRWhFLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO2dCQUM5QyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUUsd0NBQXdDLENBQUMsQ0FBQztnQkFDbkcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFHLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFLDZCQUE2QixDQUFDLENBQUM7Z0JBQ3hGLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDakUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFHLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUVoRSxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDekIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7Z0JBQ2hELE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBRSxzQ0FBc0MsQ0FBQyxDQUFDO2dCQUNqRyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUUsMkJBQTJCLENBQUMsQ0FBQztnQkFDdEYsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFHLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUNqRSxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBRWhFLGlCQUFpQixDQUFDLElBQUksRUFBRSxDQUFDO2dCQUN6QixNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztnQkFDOUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFHLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFLHNDQUFzQyxDQUFDLENBQUM7Z0JBQ2pHLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBRSwyQkFBMkIsQ0FBQyxDQUFDO2dCQUN0RixNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ2pFLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFFaEUsaUJBQWlCLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ3pCLGlCQUFpQixDQUFDLElBQUksRUFBRSxDQUFDO2dCQUN6QixNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsRUFBRSxJQUFJLG1CQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEUsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLEVBQUU7WUFDNUIsV0FBVyxDQUFDLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxpQkFBaUIsRUFBRSxFQUFFO2dCQUNuRCxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFFakQsaUJBQWlCLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUNuQyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUUsb0RBQW9ELENBQUMsQ0FBQztnQkFDL0csTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFHLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFLGlDQUFpQyxDQUFDLENBQUM7Z0JBQzVGLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDakUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFHLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUVoRSxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDM0IsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLEVBQUUsSUFBSSxtQkFBUSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ25FLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSCxrREFBa0Q7UUFDbEQsNkRBQTZEO1FBQzdELHNEQUFzRDtRQUN0RCxpREFBaUQ7UUFFakQscUNBQXFDO1FBQ3JDLDhCQUE4QjtRQUM5Qix1QkFBdUI7UUFDdkIsa0NBQWtDO1FBQ2xDLG1DQUFtQztRQUNuQyxnQkFBZ0I7UUFDaEIsU0FBUztRQUVULG9FQUFvRTtRQUNwRSxPQUFPO1FBQ1AsTUFBTTtRQUVOLGtEQUFrRDtRQUNsRCw2REFBNkQ7UUFDN0Qsc0RBQXNEO1FBQ3RELDhDQUE4QztRQUU5QyxxQ0FBcUM7UUFDckMsOEJBQThCO1FBQzlCLHVCQUF1QjtRQUN2QixrQ0FBa0M7UUFDbEMscUNBQXFDO1FBQ3JDLGdCQUFnQjtRQUNoQixTQUFTO1FBRVQsb0VBQW9FO1FBQ3BFLE9BQU87UUFDUCxNQUFNO1FBRU4sbURBQW1EO1FBQ25ELDZEQUE2RDtRQUM3RCxzREFBc0Q7UUFDdEQsOENBQThDO1FBRTlDLHFDQUFxQztRQUNyQyw4QkFBOEI7UUFDOUIsdUJBQXVCO1FBQ3ZCLGtDQUFrQztRQUNsQyx1Q0FBdUM7UUFDdkMscUJBQXFCO1FBQ3JCLFNBQVM7UUFFVCxvRUFBb0U7UUFDcEUsT0FBTztRQUNQLE1BQU07UUFFTixtREFBbUQ7UUFDbkQsNkRBQTZEO1FBQzdELHNEQUFzRDtRQUN0RCw4Q0FBOEM7UUFFOUMscUNBQXFDO1FBQ3JDLDhCQUE4QjtRQUM5Qix1QkFBdUI7UUFDdkIsa0NBQWtDO1FBQ2xDLHVDQUF1QztRQUN2QyxxQkFBcUI7UUFDckIsU0FBUztRQUVULG9FQUFvRTtRQUNwRSxPQUFPO1FBQ1AsTUFBTTtRQUVOLElBQUksQ0FBQyxxQ0FBcUMsRUFBRSxHQUFHLEVBQUU7WUFDaEQsV0FBVyxDQUFDLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxpQkFBaUIsRUFBRSxFQUFFO2dCQUN0RCxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDakQsaUJBQWlCLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUV0QyxNQUFNLENBQUMsUUFBUSxFQUFHLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUV2QyxNQUFNLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLGVBQWUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2hFLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsb0JBQW9CLEVBQUUsR0FBRyxFQUFFO1lBQy9CLFdBQVcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQUUsRUFBRTtnQkFDdEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ2pELGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFFdEMsTUFBTSxDQUFDLFFBQVEsRUFBRyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUUxQixNQUFNLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLGVBQWUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2hFLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsa0NBQWtDLEVBQUUsR0FBRyxFQUFFO1lBQzdDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQUUsRUFBRTtnQkFDdEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ2pELGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFFdEMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBRWpELE1BQU0sQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsZUFBZSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDaEUsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyx1Q0FBdUMsRUFBRSxHQUFHLEVBQUU7WUFDbEQsV0FBVyxDQUFDLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxpQkFBaUIsRUFBRSxFQUFFO2dCQUN0RCxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDakQsaUJBQWlCLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUV0QyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUV0QixNQUFNLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLGVBQWUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2hFLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsNkJBQTZCLEVBQUUsR0FBRyxFQUFFO1lBQ3hDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQUUsRUFBRTtnQkFDdEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ2pELGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFFdEMsaUJBQWlCLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBRTVCLE1BQU0sQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsZUFBZSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDaEUsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyx3Q0FBd0MsRUFBRSxHQUFHLEVBQUU7WUFDbkQsV0FBVyxDQUFDLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxpQkFBaUIsRUFBRSxFQUFFO2dCQUN0RCxNQUFNLENBQUMsYUFBYSxDQUFDO29CQUNwQixJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN6QixJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUN6QixDQUFDLENBQUM7Z0JBRUgsV0FBVyxHQUFHLE9BQU8sQ0FBQztnQkFDdEIsaUJBQWlCLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUV0QyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RELE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLGFBQWEsRUFBRyxDQUFDO2dCQUNoRCxNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsRUFBRSxlQUFlLEVBQUUsQ0FBQyxFQUFFLFdBQVcsRUFBRSxDQUFDLEVBQUUsYUFBYSxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztnQkFDdkgsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsZUFBZSxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUUsQ0FBQyxFQUFFLGFBQWEsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDMUgsQ0FBQyxDQUFDLENBQUM7WUFFSCxXQUFXLENBQUMsQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixFQUFFLEVBQUU7Z0JBQ3RELE1BQU0sQ0FBQyxhQUFhLENBQUM7b0JBQ3BCLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3pCLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ3pCLENBQUMsQ0FBQztnQkFFSCxXQUFXLEdBQUcsVUFBVSxDQUFDO2dCQUN6QixpQkFBaUIsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBRXRDLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDdEQsTUFBTSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsYUFBYSxFQUFHLENBQUM7Z0JBQ2hELE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxFQUFFLGVBQWUsRUFBRSxDQUFDLEVBQUUsV0FBVyxFQUFFLENBQUMsRUFBRSxhQUFhLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2dCQUN2SCxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxlQUFlLEVBQUUsQ0FBQyxFQUFFLFdBQVcsRUFBRSxDQUFDLEVBQUUsYUFBYSxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUMxSCxDQUFDLENBQUMsQ0FBQztZQUVILFdBQVcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQUUsRUFBRTtnQkFDdEQsTUFBTSxDQUFDLGFBQWEsQ0FBQztvQkFDcEIsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDekIsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDekIsQ0FBQyxDQUFDO2dCQUVILFdBQVcsR0FBRyxVQUFVLENBQUM7Z0JBQ3pCLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFFdEMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUN0RCxNQUFNLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxhQUFhLEVBQUcsQ0FBQztnQkFDaEQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEVBQUUsZUFBZSxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUUsQ0FBQyxFQUFFLGFBQWEsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7Z0JBQ3ZILE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLGVBQWUsRUFBRSxDQUFDLEVBQUUsV0FBVyxFQUFFLEVBQUUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQzVILENBQUMsQ0FBQyxDQUFDO1lBRUgsV0FBVyxDQUFDLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxpQkFBaUIsRUFBRSxFQUFFO2dCQUN0RCxNQUFNLENBQUMsYUFBYSxDQUFDO29CQUNwQixJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN6QixJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUN6QixDQUFDLENBQUM7Z0JBRUgsV0FBVyxHQUFHLGNBQWMsQ0FBQztnQkFDN0IsaUJBQWlCLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUV0QyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RELE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLGFBQWEsRUFBRyxDQUFDO2dCQUNoRCxNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsRUFBRSxlQUFlLEVBQUUsQ0FBQyxFQUFFLFdBQVcsRUFBRSxDQUFDLEVBQUUsYUFBYSxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztnQkFDdkgsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsZUFBZSxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUUsQ0FBQyxFQUFFLGFBQWEsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDMUgsQ0FBQyxDQUFDLENBQUM7WUFFSCxXQUFXLENBQUMsQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixFQUFFLEVBQUU7Z0JBQ3RELE1BQU0sQ0FBQyxhQUFhLENBQUM7b0JBQ3BCLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3pCLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ3pCLENBQUMsQ0FBQztnQkFFSCxXQUFXLEdBQUcsY0FBYyxDQUFDO2dCQUM3QixpQkFBaUIsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBRXRDLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDdEQsTUFBTSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsYUFBYSxFQUFHLENBQUM7Z0JBQ2hELE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxFQUFFLGVBQWUsRUFBRSxDQUFDLEVBQUUsV0FBVyxFQUFFLENBQUMsRUFBRSxhQUFhLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2dCQUN2SCxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxlQUFlLEVBQUUsQ0FBQyxFQUFFLFdBQVcsRUFBRSxDQUFDLEVBQUUsYUFBYSxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUMxSCxDQUFDLENBQUMsQ0FBQztZQUVILFdBQVcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQUUsRUFBRTtnQkFDdEQsTUFBTSxDQUFDLGFBQWEsQ0FBQztvQkFDcEIsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDekIsQ0FBQyxDQUFDO2dCQUVILFdBQVcsR0FBRyxPQUFPLENBQUM7Z0JBQ3RCLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsRUFBRSxlQUFlLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFFOUQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUN0RCxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUcsQ0FBQyxXQUFXLENBQUMsRUFBRSxlQUFlLEVBQUUsQ0FBQyxFQUFFLFdBQVcsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxhQUFhLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3ZILENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsOEJBQThCLEVBQUUsR0FBRyxFQUFFO1lBQ3pDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLEVBQUU7Z0JBRS9DLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBRWpELFdBQVcsR0FBRyxvQkFBb0IsQ0FBQztnQkFDbkMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsRUFBRSxlQUFlLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFFdkQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUN0RCxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUcsQ0FBQyxXQUFXLENBQUMsRUFBRSxlQUFlLEVBQUUsQ0FBQyxFQUFFLFdBQVcsRUFBRSxFQUFFLEVBQUUsYUFBYSxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUN4SCxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxrQ0FBa0MsQ0FBQyxDQUFDO1lBRXZGLENBQUMsRUFBRSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztZQUUzQixXQUFXLENBQUMsQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxFQUFFO2dCQUUvQyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUUvQyxXQUFXLEdBQUc7b0JBQ2IsdUJBQXVCO29CQUN2QixZQUFZO29CQUNaLEtBQUs7aUJBQ0wsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRWIsVUFBVSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsRUFBRSxlQUFlLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFFdkQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUN0RCxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUcsQ0FBQyxXQUFXLENBQUMsRUFBRSxlQUFlLEVBQUUsQ0FBQyxFQUFFLFdBQVcsRUFBRSxDQUFDLEVBQUUsYUFBYSxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsWUFBWSxFQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztnQkFDekosTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsb0NBQW9DLENBQUMsQ0FBQztZQUV6RixDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRVgsV0FBVyxDQUFDLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsRUFBRTtnQkFFL0MsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFL0MsV0FBVyxHQUFHO29CQUNiLHVCQUF1QjtvQkFDdkIsWUFBWTtvQkFDWixLQUFLO2lCQUNMLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUViLFVBQVUsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLEVBQUUsZUFBZSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBRXZELE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDdEQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFHLENBQUMsV0FBVyxDQUFDLEVBQUUsZUFBZSxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUUsQ0FBQyxFQUFFLGFBQWEsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLFlBQVksRUFBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7Z0JBQ3pKLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLG9DQUFvQyxDQUFDLENBQUM7WUFFekYsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUVYLFdBQVcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLEVBQUU7Z0JBRS9DLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRS9DLFdBQVcsR0FBRztvQkFDYixXQUFXO2lCQUNYLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUViLFVBQVUsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLEVBQUUsZUFBZSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBRXZELE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUMzRCxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RELE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRyxDQUFDLFdBQVcsQ0FBQyxFQUFFLGVBQWUsRUFBRSxDQUFDLEVBQUUsV0FBVyxFQUFFLENBQUMsRUFBRSxhQUFhLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxZQUFZLEVBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBRTFKLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDbEIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMseUNBQXlDLEVBQUUsR0FBRyxFQUFFO1lBRXBELFdBQVcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLEVBQUU7Z0JBRS9DLE1BQU0sQ0FBQyxhQUFhLENBQUM7b0JBQ3BCLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3pCLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ3pCLENBQUMsQ0FBQztnQkFFSCxXQUFXLEdBQUc7b0JBQ2IsdUJBQXVCO29CQUN2QixZQUFZO29CQUNaLEtBQUs7aUJBQ0wsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRWIsVUFBVSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsRUFBRSxlQUFlLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFFdkQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUN0RCxNQUFNLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxhQUFhLEVBQUcsQ0FBQztnQkFFaEQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEVBQUUsZUFBZSxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUUsQ0FBQyxFQUFFLGFBQWEsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7Z0JBQ3ZILE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLGVBQWUsRUFBRSxDQUFDLEVBQUUsV0FBVyxFQUFFLENBQUMsRUFBRSxhQUFhLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBRTFILENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLDZDQUE2QyxFQUFFLEdBQUcsRUFBRTtZQUV4RCxXQUFXLENBQUMsQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxFQUFFO2dCQUUvQyxNQUFNLENBQUMsYUFBYSxDQUFDO29CQUNwQixJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUN6QixDQUFDLENBQUM7Z0JBRUgsV0FBVyxHQUFHO29CQUNiLHVCQUF1QjtvQkFDdkIsWUFBWTtvQkFDWixLQUFLO2lCQUNMLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUViLFVBQVUsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLEVBQUUsZUFBZSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBRXZELE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDdEQsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLE1BQU0sQ0FBQyxhQUFhLEVBQUcsQ0FBQztnQkFFeEMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEVBQUUsZUFBZSxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUUsQ0FBQyxFQUFFLGFBQWEsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFFeEgsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNkLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLDJCQUEyQixFQUFFLEdBQUcsRUFBRTtZQUV0QyxXQUFXLENBQUMsQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxFQUFFO2dCQUUvQyxNQUFNLENBQUMsYUFBYSxDQUFDO29CQUNwQixJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUN6QixDQUFDLENBQUM7Z0JBRUgsV0FBVyxHQUFHLFdBQVcsQ0FBQztnQkFFMUIsVUFBVSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsRUFBRSxlQUFlLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFFdkQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFHLENBQUMsV0FBVyxDQUFDLEVBQUUsZUFBZSxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFLGFBQWEsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUV6SCxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNwQixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyx5REFBeUQsRUFBRSxHQUFHLEVBQUU7WUFFcEUsV0FBVyxDQUFDLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsRUFBRTtnQkFFL0MsTUFBTSxDQUFDLGFBQWEsQ0FBQztvQkFDcEIsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDekIsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDekIsQ0FBQyxDQUFDO2dCQUVILFdBQVcsR0FBRyxNQUFNLENBQUM7Z0JBQ3JCLFVBQVUsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLEVBQUUsZUFBZSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3ZELE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFFekUsQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFFdEIsV0FBVyxDQUFDLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsRUFBRTtnQkFFL0MsTUFBTSxDQUFDLGFBQWEsQ0FBQztvQkFDcEIsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDekIsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDekIsQ0FBQyxDQUFDO2dCQUVILFdBQVcsR0FBRyxJQUFJLENBQUM7Z0JBQ25CLFVBQVUsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLEVBQUUsZUFBZSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3ZELE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLGdCQUFnQixDQUFDLENBQUM7WUFFckUsQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFFdEIsV0FBVyxDQUFDLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsRUFBRTtnQkFFL0MsTUFBTSxDQUFDLGFBQWEsQ0FBQztvQkFDcEIsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDekIsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDekIsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDekIsQ0FBQyxDQUFDO2dCQUVILFdBQVcsR0FBRyxNQUFNLENBQUM7Z0JBQ3JCLFVBQVUsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLEVBQUUsZUFBZSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3ZELE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLDZCQUE2QixDQUFDLENBQUM7WUFFbEYsQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBRTlCLFdBQVcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLEVBQUU7Z0JBRS9DLE1BQU0sQ0FBQyxhQUFhLENBQUM7b0JBQ3BCLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3pCLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3pCLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ3pCLENBQUMsQ0FBQztnQkFFSCxXQUFXLEdBQUcsT0FBTyxDQUFDO2dCQUN0QixVQUFVLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxFQUFFLGVBQWUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUN2RCxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSwrQkFBK0IsQ0FBQyxDQUFDO1lBRXBGLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUUvQixXQUFXLENBQUMsQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxFQUFFO2dCQUUvQyxNQUFNLENBQUMsYUFBYSxDQUFDO29CQUNwQixJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN6QixJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN6QixJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUN6QixDQUFDLENBQUM7Z0JBRUgsV0FBVyxHQUFHLE9BQU8sQ0FBQztnQkFDdEIsVUFBVSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsRUFBRSxlQUFlLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDdkQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsK0JBQStCLENBQUMsQ0FBQztZQUVwRixDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFFL0IsV0FBVyxDQUFDLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsRUFBRTtnQkFFL0MsTUFBTSxDQUFDLGFBQWEsQ0FBQztvQkFDcEIsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDekIsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDekIsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDekIsQ0FBQyxDQUFDO2dCQUVILFdBQVcsR0FBRyxPQUFPLENBQUM7Z0JBQ3RCLFVBQVUsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLEVBQUUsZUFBZSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3ZELE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLGlDQUFpQyxDQUFDLENBQUM7WUFFdEYsQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBRWhDLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLG1EQUFtRCxFQUFFLEdBQUcsRUFBRTtZQUM5RCxXQUFXLENBQUMsQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxFQUFFO2dCQUUvQyxNQUFNLENBQUMsYUFBYSxDQUFDO29CQUNwQixJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN6QixJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUN6QixDQUFDLENBQUM7Z0JBRUgsV0FBVyxHQUFHLFVBQVUsQ0FBQztnQkFDekIsVUFBVSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsRUFBRSxlQUFlLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDdkQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsZ0NBQWdDLENBQUMsQ0FBQztZQUVyRixDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FBQztRQUNoQyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyw4QkFBOEIsRUFBRSxHQUFHLEVBQUU7WUFFekMsV0FBVyxDQUFDLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsRUFBRTtnQkFFL0MsTUFBTSxDQUFDLGFBQWEsQ0FBQztvQkFDcEIsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDekIsQ0FBQyxDQUFDO2dCQUVILFdBQVcsR0FBRyxpREFBaUQsQ0FBQztnQkFDaEUsVUFBVSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDL0IsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsOERBQThELENBQUMsQ0FBQztZQUVuSCxDQUFDLEVBQUUsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUM7WUFHdkMsV0FBVyxDQUFDLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsRUFBRTtnQkFFL0MsTUFBTSxDQUFDLGFBQWEsQ0FBQztvQkFDcEIsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDekIsQ0FBQyxDQUFDO2dCQUVILFdBQVcsR0FBRyxpREFBaUQsQ0FBQztnQkFDaEUsVUFBVSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDL0IsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsOERBQThELENBQUMsQ0FBQztZQUVuSCxDQUFDLEVBQUUsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUM7UUFFeEMsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQyJ9