define(["require", "exports", "assert", "vs/base/test/common/mock", "vs/editor/browser/coreCommands", "vs/editor/common/core/selection", "vs/editor/common/core/range", "vs/editor/contrib/snippet/browser/snippetController2", "vs/editor/test/browser/testCodeEditor", "vs/editor/test/common/testTextModel", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiationService", "vs/platform/instantiation/common/serviceCollection", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/label/common/label", "vs/platform/log/common/log", "vs/platform/workspace/common/workspace", "vs/base/test/common/utils"], function (require, exports, assert, mock_1, coreCommands_1, selection_1, range_1, snippetController2_1, testCodeEditor_1, testTextModel_1, contextkey_1, instantiationService_1, serviceCollection_1, mockKeybindingService_1, label_1, log_1, workspace_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('SnippetController2', function () {
        /** @deprecated */
        function assertSelections(editor, ...s) {
            for (const selection of editor.getSelections()) {
                const actual = s.shift();
                assert.ok(selection.equalsSelection(actual), `actual=${selection.toString()} <> expected=${actual.toString()}`);
            }
            assert.strictEqual(s.length, 0);
        }
        function assertContextKeys(service, inSnippet, hasPrev, hasNext) {
            const state = getContextState(service);
            assert.strictEqual(state.inSnippet, inSnippet, `inSnippetMode`);
            assert.strictEqual(state.hasPrev, hasPrev, `HasPrevTabstop`);
            assert.strictEqual(state.hasNext, hasNext, `HasNextTabstop`);
        }
        function getContextState(service = contextKeys) {
            return {
                inSnippet: snippetController2_1.SnippetController2.InSnippetMode.getValue(service),
                hasPrev: snippetController2_1.SnippetController2.HasPrevTabstop.getValue(service),
                hasNext: snippetController2_1.SnippetController2.HasNextTabstop.getValue(service),
            };
        }
        let ctrl;
        let editor;
        let model;
        let contextKeys;
        let instaService;
        setup(function () {
            contextKeys = new mockKeybindingService_1.MockContextKeyService();
            model = (0, testTextModel_1.createTextModel)('if\n    $state\nfi');
            const serviceCollection = new serviceCollection_1.ServiceCollection([label_1.ILabelService, new class extends (0, mock_1.mock)() {
                }], [workspace_1.IWorkspaceContextService, new class extends (0, mock_1.mock)() {
                    getWorkspace() {
                        return { id: 'foo', folders: [] };
                    }
                }], [log_1.ILogService, new log_1.NullLogService()], [contextkey_1.IContextKeyService, contextKeys]);
            instaService = new instantiationService_1.InstantiationService(serviceCollection);
            editor = (0, testCodeEditor_1.createTestCodeEditor)(model, { serviceCollection });
            editor.setSelections([new selection_1.Selection(1, 1, 1, 1), new selection_1.Selection(2, 5, 2, 5)]);
            assert.strictEqual(model.getEOL(), '\n');
        });
        teardown(function () {
            model.dispose();
            ctrl.dispose();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('creation', () => {
            ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
            assertContextKeys(contextKeys, false, false, false);
        });
        test('insert, insert -> abort', function () {
            ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
            ctrl.insert('foo${1:bar}foo$0');
            assertContextKeys(contextKeys, true, false, true);
            assertSelections(editor, new selection_1.Selection(1, 4, 1, 7), new selection_1.Selection(2, 8, 2, 11));
            ctrl.cancel();
            assertContextKeys(contextKeys, false, false, false);
            assertSelections(editor, new selection_1.Selection(1, 4, 1, 7), new selection_1.Selection(2, 8, 2, 11));
        });
        test('insert, insert -> tab, tab, done', function () {
            ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
            ctrl.insert('${1:one}${2:two}$0');
            assertContextKeys(contextKeys, true, false, true);
            ctrl.next();
            assertContextKeys(contextKeys, true, true, true);
            ctrl.next();
            assertContextKeys(contextKeys, false, false, false);
            editor.trigger('test', 'type', { text: '\t' });
            assert.strictEqual(snippetController2_1.SnippetController2.InSnippetMode.getValue(contextKeys), false);
            assert.strictEqual(snippetController2_1.SnippetController2.HasNextTabstop.getValue(contextKeys), false);
            assert.strictEqual(snippetController2_1.SnippetController2.HasPrevTabstop.getValue(contextKeys), false);
        });
        test('insert, insert -> cursor moves out (left/right)', function () {
            ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
            ctrl.insert('foo${1:bar}foo$0');
            assertContextKeys(contextKeys, true, false, true);
            assertSelections(editor, new selection_1.Selection(1, 4, 1, 7), new selection_1.Selection(2, 8, 2, 11));
            // bad selection change
            editor.setSelections([new selection_1.Selection(1, 12, 1, 12), new selection_1.Selection(2, 16, 2, 16)]);
            assertContextKeys(contextKeys, false, false, false);
        });
        test('insert, insert -> cursor moves out (up/down)', function () {
            ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
            ctrl.insert('foo${1:bar}foo$0');
            assertContextKeys(contextKeys, true, false, true);
            assertSelections(editor, new selection_1.Selection(1, 4, 1, 7), new selection_1.Selection(2, 8, 2, 11));
            // bad selection change
            editor.setSelections([new selection_1.Selection(2, 4, 2, 7), new selection_1.Selection(3, 8, 3, 11)]);
            assertContextKeys(contextKeys, false, false, false);
        });
        test('insert, insert -> cursors collapse', function () {
            ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
            ctrl.insert('foo${1:bar}foo$0');
            assert.strictEqual(snippetController2_1.SnippetController2.InSnippetMode.getValue(contextKeys), true);
            assertSelections(editor, new selection_1.Selection(1, 4, 1, 7), new selection_1.Selection(2, 8, 2, 11));
            // bad selection change
            editor.setSelections([new selection_1.Selection(1, 4, 1, 7)]);
            assertContextKeys(contextKeys, false, false, false);
        });
        test('insert, insert plain text -> no snippet mode', function () {
            ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
            ctrl.insert('foobar');
            assertContextKeys(contextKeys, false, false, false);
            assertSelections(editor, new selection_1.Selection(1, 7, 1, 7), new selection_1.Selection(2, 11, 2, 11));
        });
        test('insert, delete snippet text', function () {
            ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
            ctrl.insert('${1:foobar}$0');
            assertContextKeys(contextKeys, true, false, true);
            assertSelections(editor, new selection_1.Selection(1, 1, 1, 7), new selection_1.Selection(2, 5, 2, 11));
            editor.trigger('test', 'cut', {});
            assertContextKeys(contextKeys, true, false, true);
            assertSelections(editor, new selection_1.Selection(1, 1, 1, 1), new selection_1.Selection(2, 5, 2, 5));
            editor.trigger('test', 'type', { text: 'abc' });
            assertContextKeys(contextKeys, true, false, true);
            ctrl.next();
            assertContextKeys(contextKeys, false, false, false);
            editor.trigger('test', 'tab', {});
            assertContextKeys(contextKeys, false, false, false);
            // editor.trigger('test', 'type', { text: 'abc' });
            // assertContextKeys(contextKeys, false, false, false);
        });
        test('insert, nested trivial snippet', function () {
            ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
            ctrl.insert('${1:foo}bar$0');
            assertContextKeys(contextKeys, true, false, true);
            assertSelections(editor, new selection_1.Selection(1, 1, 1, 4), new selection_1.Selection(2, 5, 2, 8));
            ctrl.insert('FOO$0');
            assertSelections(editor, new selection_1.Selection(1, 4, 1, 4), new selection_1.Selection(2, 8, 2, 8));
            assertContextKeys(contextKeys, true, false, true);
            ctrl.next();
            assertSelections(editor, new selection_1.Selection(1, 7, 1, 7), new selection_1.Selection(2, 11, 2, 11));
            assertContextKeys(contextKeys, false, false, false);
        });
        test('insert, nested snippet', function () {
            ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
            ctrl.insert('${1:foobar}$0');
            assertContextKeys(contextKeys, true, false, true);
            assertSelections(editor, new selection_1.Selection(1, 1, 1, 7), new selection_1.Selection(2, 5, 2, 11));
            ctrl.insert('far$1boo$0');
            assertSelections(editor, new selection_1.Selection(1, 4, 1, 4), new selection_1.Selection(2, 8, 2, 8));
            assertContextKeys(contextKeys, true, false, true);
            ctrl.next();
            assertSelections(editor, new selection_1.Selection(1, 7, 1, 7), new selection_1.Selection(2, 11, 2, 11));
            assertContextKeys(contextKeys, true, true, true);
            ctrl.next();
            assertSelections(editor, new selection_1.Selection(1, 7, 1, 7), new selection_1.Selection(2, 11, 2, 11));
            assertContextKeys(contextKeys, false, false, false);
        });
        test('insert, nested plain text', function () {
            ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
            ctrl.insert('${1:foobar}$0');
            assertContextKeys(contextKeys, true, false, true);
            assertSelections(editor, new selection_1.Selection(1, 1, 1, 7), new selection_1.Selection(2, 5, 2, 11));
            ctrl.insert('farboo');
            assertSelections(editor, new selection_1.Selection(1, 7, 1, 7), new selection_1.Selection(2, 11, 2, 11));
            assertContextKeys(contextKeys, true, false, true);
            ctrl.next();
            assertSelections(editor, new selection_1.Selection(1, 7, 1, 7), new selection_1.Selection(2, 11, 2, 11));
            assertContextKeys(contextKeys, false, false, false);
        });
        test('Nested snippets without final placeholder jumps to next outer placeholder, #27898', function () {
            ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
            ctrl.insert('for(const ${1:element} of ${2:array}) {$0}');
            assertContextKeys(contextKeys, true, false, true);
            assertSelections(editor, new selection_1.Selection(1, 11, 1, 18), new selection_1.Selection(2, 15, 2, 22));
            ctrl.next();
            assertContextKeys(contextKeys, true, true, true);
            assertSelections(editor, new selection_1.Selection(1, 22, 1, 27), new selection_1.Selection(2, 26, 2, 31));
            ctrl.insert('document');
            assertContextKeys(contextKeys, true, true, true);
            assertSelections(editor, new selection_1.Selection(1, 30, 1, 30), new selection_1.Selection(2, 34, 2, 34));
            ctrl.next();
            assertContextKeys(contextKeys, false, false, false);
        });
        test('Inconsistent tab stop behaviour with recursive snippets and tab / shift tab, #27543', function () {
            ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
            ctrl.insert('1_calize(${1:nl}, \'${2:value}\')$0');
            assertContextKeys(contextKeys, true, false, true);
            assertSelections(editor, new selection_1.Selection(1, 10, 1, 12), new selection_1.Selection(2, 14, 2, 16));
            ctrl.insert('2_calize(${1:nl}, \'${2:value}\')$0');
            assertSelections(editor, new selection_1.Selection(1, 19, 1, 21), new selection_1.Selection(2, 23, 2, 25));
            ctrl.next(); // inner `value`
            assertSelections(editor, new selection_1.Selection(1, 24, 1, 29), new selection_1.Selection(2, 28, 2, 33));
            ctrl.next(); // inner `$0`
            assertSelections(editor, new selection_1.Selection(1, 31, 1, 31), new selection_1.Selection(2, 35, 2, 35));
            ctrl.next(); // outer `value`
            assertSelections(editor, new selection_1.Selection(1, 34, 1, 39), new selection_1.Selection(2, 38, 2, 43));
            ctrl.prev(); // inner `$0`
            assertSelections(editor, new selection_1.Selection(1, 31, 1, 31), new selection_1.Selection(2, 35, 2, 35));
        });
        test('Snippet tabstop selecting content of previously entered variable only works when separated by space, #23728', function () {
            ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
            model.setValue('');
            editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
            ctrl.insert('import ${2:${1:module}} from \'${1:module}\'$0');
            assertContextKeys(contextKeys, true, false, true);
            assertSelections(editor, new selection_1.Selection(1, 8, 1, 14), new selection_1.Selection(1, 21, 1, 27));
            ctrl.insert('foo');
            assertSelections(editor, new selection_1.Selection(1, 11, 1, 11), new selection_1.Selection(1, 21, 1, 21));
            ctrl.next(); // ${2:...}
            assertSelections(editor, new selection_1.Selection(1, 8, 1, 11));
        });
        test('HTML Snippets Combine, #32211', function () {
            ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
            model.setValue('');
            model.updateOptions({ insertSpaces: false, tabSize: 4, trimAutoWhitespace: false });
            editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
            ctrl.insert(`
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=\${2:device-width}, initial-scale=\${3:1.0}">
				<meta http-equiv="X-UA-Compatible" content="\${5:ie=edge}">
				<title>\${7:Document}</title>
			</head>
			<body>
				\${8}
			</body>
			</html>
		`);
            ctrl.next();
            ctrl.next();
            ctrl.next();
            ctrl.next();
            assertSelections(editor, new selection_1.Selection(11, 5, 11, 5));
            ctrl.insert('<input type="${2:text}">');
            assertSelections(editor, new selection_1.Selection(11, 18, 11, 22));
        });
        test('Problems with nested snippet insertion #39594', function () {
            ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
            model.setValue('');
            editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
            ctrl.insert('$1 = ConvertTo-Json $1');
            assertSelections(editor, new selection_1.Selection(1, 1, 1, 1), new selection_1.Selection(1, 19, 1, 19));
            editor.setSelection(new selection_1.Selection(1, 19, 1, 19));
            // snippet mode should stop because $1 has two occurrences
            // and we only have one selection left
            assertContextKeys(contextKeys, false, false, false);
        });
        test('Problems with nested snippet insertion #39594 (part2)', function () {
            // ensure selection-change-to-cancel logic isn't too aggressive
            ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
            model.setValue('a-\naaa-');
            editor.setSelections([new selection_1.Selection(2, 5, 2, 5), new selection_1.Selection(1, 3, 1, 3)]);
            ctrl.insert('log($1);$0');
            assertSelections(editor, new selection_1.Selection(2, 9, 2, 9), new selection_1.Selection(1, 7, 1, 7));
            assertContextKeys(contextKeys, true, false, true);
        });
        test('“Nested” snippets terminating abruptly in VSCode 1.19.2. #42012', function () {
            ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
            model.setValue('');
            editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
            ctrl.insert('var ${2:${1:name}} = ${1:name} + 1;${0}');
            assertSelections(editor, new selection_1.Selection(1, 5, 1, 9), new selection_1.Selection(1, 12, 1, 16));
            assertContextKeys(contextKeys, true, false, true);
            ctrl.next();
            assertContextKeys(contextKeys, true, true, true);
        });
        test('Placeholders order #58267', function () {
            ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
            model.setValue('');
            editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
            ctrl.insert('\\pth{$1}$0');
            assertSelections(editor, new selection_1.Selection(1, 6, 1, 6));
            assertContextKeys(contextKeys, true, false, true);
            ctrl.insert('\\itv{${1:left}}{${2:right}}{${3:left_value}}{${4:right_value}}$0');
            assertSelections(editor, new selection_1.Selection(1, 11, 1, 15));
            ctrl.next();
            assertSelections(editor, new selection_1.Selection(1, 17, 1, 22));
            ctrl.next();
            assertSelections(editor, new selection_1.Selection(1, 24, 1, 34));
            ctrl.next();
            assertSelections(editor, new selection_1.Selection(1, 36, 1, 47));
            ctrl.next();
            assertSelections(editor, new selection_1.Selection(1, 48, 1, 48));
            ctrl.next();
            assertSelections(editor, new selection_1.Selection(1, 49, 1, 49));
            assertContextKeys(contextKeys, false, false, false);
        });
        test('Must tab through deleted tab stops in snippets #31619', function () {
            ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
            model.setValue('');
            editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
            ctrl.insert('foo${1:a${2:bar}baz}end$0');
            assertSelections(editor, new selection_1.Selection(1, 4, 1, 11));
            editor.trigger('test', "cut" /* Handler.Cut */, null);
            assertSelections(editor, new selection_1.Selection(1, 4, 1, 4));
            ctrl.next();
            assertSelections(editor, new selection_1.Selection(1, 7, 1, 7));
            assertContextKeys(contextKeys, false, false, false);
        });
        test('Cancelling snippet mode should discard added cursors #68512 (soft cancel)', function () {
            ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
            model.setValue('');
            editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
            ctrl.insert('.REGION ${2:FUNCTION_NAME}\nCREATE.FUNCTION ${1:VOID} ${2:FUNCTION_NAME}(${3:})\n\t${4:}\nEND\n.ENDREGION$0');
            assertSelections(editor, new selection_1.Selection(2, 17, 2, 21));
            ctrl.next();
            assertSelections(editor, new selection_1.Selection(1, 9, 1, 22), new selection_1.Selection(2, 22, 2, 35));
            assertContextKeys(contextKeys, true, true, true);
            editor.setSelections([new selection_1.Selection(1, 22, 1, 22), new selection_1.Selection(2, 35, 2, 35)]);
            assertContextKeys(contextKeys, true, true, true);
            editor.setSelections([new selection_1.Selection(2, 1, 2, 1), new selection_1.Selection(2, 36, 2, 36)]);
            assertContextKeys(contextKeys, false, false, false);
            assertSelections(editor, new selection_1.Selection(2, 1, 2, 1), new selection_1.Selection(2, 36, 2, 36));
        });
        test('Cancelling snippet mode should discard added cursors #68512 (hard cancel)', function () {
            ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
            model.setValue('');
            editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
            ctrl.insert('.REGION ${2:FUNCTION_NAME}\nCREATE.FUNCTION ${1:VOID} ${2:FUNCTION_NAME}(${3:})\n\t${4:}\nEND\n.ENDREGION$0');
            assertSelections(editor, new selection_1.Selection(2, 17, 2, 21));
            ctrl.next();
            assertSelections(editor, new selection_1.Selection(1, 9, 1, 22), new selection_1.Selection(2, 22, 2, 35));
            assertContextKeys(contextKeys, true, true, true);
            editor.setSelections([new selection_1.Selection(1, 22, 1, 22), new selection_1.Selection(2, 35, 2, 35)]);
            assertContextKeys(contextKeys, true, true, true);
            ctrl.cancel(true);
            assertContextKeys(contextKeys, false, false, false);
            assertSelections(editor, new selection_1.Selection(1, 22, 1, 22));
        });
        test('User defined snippet tab stops ignored #72862', function () {
            ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
            model.setValue('');
            editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
            ctrl.insert('export default $1');
            assertContextKeys(contextKeys, true, false, true);
        });
        test('Optional tabstop in snippets #72358', function () {
            ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
            model.setValue('');
            editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
            ctrl.insert('${1:prop: {$2\\},}\nmore$0');
            assertContextKeys(contextKeys, true, false, true);
            assertSelections(editor, new selection_1.Selection(1, 1, 1, 10));
            editor.trigger('test', "cut" /* Handler.Cut */, {});
            assertSelections(editor, new selection_1.Selection(1, 1, 1, 1));
            ctrl.next();
            assertSelections(editor, new selection_1.Selection(2, 5, 2, 5));
            assertContextKeys(contextKeys, false, false, false);
        });
        test('issue #90135: confusing trim whitespace edits', function () {
            ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
            model.setValue('');
            coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
            ctrl.insert('\nfoo');
            assertSelections(editor, new selection_1.Selection(2, 8, 2, 8));
        });
        test('issue #145727: insertSnippet can put snippet selections in wrong positions (1 of 2)', function () {
            ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
            model.setValue('');
            coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
            ctrl.insert('\naProperty: aClass<${2:boolean}> = new aClass<${2:boolean}>();\n', { adjustWhitespace: false });
            assertSelections(editor, new selection_1.Selection(2, 19, 2, 26), new selection_1.Selection(2, 41, 2, 48));
        });
        test('issue #145727: insertSnippet can put snippet selections in wrong positions (2 of 2)', function () {
            ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
            model.setValue('');
            coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
            ctrl.insert('\naProperty: aClass<${2:boolean}> = new aClass<${2:boolean}>();\n');
            // This will insert \n    aProperty....
            assertSelections(editor, new selection_1.Selection(2, 23, 2, 30), new selection_1.Selection(2, 45, 2, 52));
        });
        test('leading TAB by snippets won\'t replace by spaces #101870', function () {
            ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
            model.setValue('');
            model.updateOptions({ insertSpaces: true, tabSize: 4 });
            ctrl.insert('\tHello World\n\tNew Line');
            assert.strictEqual(model.getValue(), '    Hello World\n    New Line');
        });
        test('leading TAB by snippets won\'t replace by spaces #101870 (part 2)', function () {
            ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
            model.setValue('');
            model.updateOptions({ insertSpaces: true, tabSize: 4 });
            ctrl.insert('\tHello World\n\tNew Line\n${1:\tmore}');
            assert.strictEqual(model.getValue(), '    Hello World\n    New Line\n    more');
        });
        test.skip('Snippet transformation does not work after inserting variable using intellisense, #112362', function () {
            {
                // HAPPY - no nested snippet
                ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
                model.setValue('');
                model.updateOptions({ insertSpaces: true, tabSize: 4 });
                ctrl.insert('$1\n\n${1/([A-Za-z0-9]+): ([A-Za-z]+).*/$1: \'$2\',/gm}');
                assertSelections(editor, new selection_1.Selection(1, 1, 1, 1), new selection_1.Selection(3, 1, 3, 1));
                editor.trigger('test', 'type', { text: 'foo: number;' });
                ctrl.next();
                assert.strictEqual(model.getValue(), `foo: number;\n\nfoo: 'number',`);
            }
            ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
            model.setValue('');
            model.updateOptions({ insertSpaces: true, tabSize: 4 });
            ctrl.insert('$1\n\n${1/([A-Za-z0-9]+): ([A-Za-z]+).*/$1: \'$2\',/gm}');
            assertSelections(editor, new selection_1.Selection(1, 1, 1, 1), new selection_1.Selection(3, 1, 3, 1));
            editor.trigger('test', 'type', { text: 'foo: ' });
            ctrl.insert('number;');
            ctrl.next();
            assert.strictEqual(model.getValue(), `foo: number;\n\nfoo: 'number',`);
            // editor.trigger('test', 'type', { text: ';' });
        });
        suite('createEditsAndSnippetsFromEdits', function () {
            test('apply, tab, done', function () {
                ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
                model.setValue('foo("bar")');
                ctrl.apply([
                    { range: new range_1.Range(1, 5, 1, 10), template: '$1' },
                    { range: new range_1.Range(1, 1, 1, 1), template: 'const ${1:new_const} = "bar";\n' }
                ]);
                assert.strictEqual(model.getValue(), "const new_const = \"bar\";\nfoo(new_const)");
                assertContextKeys(contextKeys, true, false, true);
                assert.deepStrictEqual(editor.getSelections(), [new selection_1.Selection(1, 7, 1, 16), new selection_1.Selection(2, 5, 2, 14)]);
                ctrl.next();
                assertContextKeys(contextKeys, false, false, false);
                assert.deepStrictEqual(editor.getSelections(), [new selection_1.Selection(2, 14, 2, 14)]);
            });
            test('apply, tab, done with special final tabstop', function () {
                model.setValue('foo("bar")');
                ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
                ctrl.apply([
                    { range: new range_1.Range(1, 5, 1, 10), template: '$1' },
                    { range: new range_1.Range(1, 1, 1, 1), template: 'const ${1:new_const}$0 = "bar";\n' }
                ]);
                assert.strictEqual(model.getValue(), "const new_const = \"bar\";\nfoo(new_const)");
                assertContextKeys(contextKeys, true, false, true);
                assert.deepStrictEqual(editor.getSelections(), [new selection_1.Selection(1, 7, 1, 16), new selection_1.Selection(2, 5, 2, 14)]);
                ctrl.next();
                assertContextKeys(contextKeys, false, false, false);
                assert.deepStrictEqual(editor.getSelections(), [new selection_1.Selection(1, 16, 1, 16)]);
            });
            test('apply, tab, tab, done', function () {
                model.setValue('foo\nbar');
                ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
                ctrl.apply([
                    { range: new range_1.Range(1, 4, 1, 4), template: '${3}' },
                    { range: new range_1.Range(2, 4, 2, 4), template: '$3' },
                    { range: new range_1.Range(1, 1, 1, 1), template: '### ${2:Header}\n' }
                ]);
                assert.strictEqual(model.getValue(), "### Header\nfoo\nbar");
                assert.deepStrictEqual(getContextState(), { inSnippet: true, hasPrev: false, hasNext: true });
                assert.deepStrictEqual(editor.getSelections(), [new selection_1.Selection(1, 5, 1, 11)]);
                ctrl.next();
                assert.deepStrictEqual(getContextState(), { inSnippet: true, hasPrev: true, hasNext: true });
                assert.deepStrictEqual(editor.getSelections(), [new selection_1.Selection(2, 4, 2, 4), new selection_1.Selection(3, 4, 3, 4)]);
                ctrl.next();
                assert.deepStrictEqual(getContextState(), { inSnippet: false, hasPrev: false, hasNext: false });
                assert.deepStrictEqual(editor.getSelections(), [new selection_1.Selection(3, 4, 3, 4)]);
            });
            test('nested into apply works', function () {
                ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
                model.setValue('onetwo');
                editor.setSelections([new selection_1.Selection(1, 1, 1, 1), new selection_1.Selection(2, 1, 2, 1)]);
                ctrl.apply([{
                        range: new range_1.Range(1, 7, 1, 7),
                        template: '$0${1:three}'
                    }]);
                assert.strictEqual(model.getValue(), 'onetwothree');
                assert.deepStrictEqual(getContextState(), { inSnippet: true, hasPrev: false, hasNext: true });
                assert.deepStrictEqual(editor.getSelections(), [new selection_1.Selection(1, 7, 1, 12)]);
                ctrl.insert('foo$1bar$1');
                assert.strictEqual(model.getValue(), 'onetwofoobar');
                assert.deepStrictEqual(editor.getSelections(), [new selection_1.Selection(1, 10, 1, 10), new selection_1.Selection(1, 13, 1, 13)]);
                assert.deepStrictEqual(getContextState(), ({ inSnippet: true, hasPrev: false, hasNext: true }));
                ctrl.next();
                assert.deepStrictEqual(getContextState(), ({ inSnippet: true, hasPrev: true, hasNext: true }));
                assert.deepStrictEqual(editor.getSelections(), [new selection_1.Selection(1, 13, 1, 13)]);
                ctrl.next();
                assert.deepStrictEqual(getContextState(), { inSnippet: false, hasPrev: false, hasNext: false });
                assert.deepStrictEqual(editor.getSelections(), [new selection_1.Selection(1, 7, 1, 7)]);
            });
            test('nested into insert abort "outer" snippet', function () {
                ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
                model.setValue('one\ntwo');
                editor.setSelections([new selection_1.Selection(1, 1, 1, 1), new selection_1.Selection(2, 1, 2, 1)]);
                ctrl.insert('foo${1:bar}bazz${1:bang}');
                assert.deepStrictEqual(editor.getSelections(), [new selection_1.Selection(1, 4, 1, 7), new selection_1.Selection(1, 11, 1, 14), new selection_1.Selection(2, 4, 2, 7), new selection_1.Selection(2, 11, 2, 14)]);
                assert.deepStrictEqual(getContextState(), { inSnippet: true, hasPrev: false, hasNext: true });
                ctrl.apply([{
                        range: new range_1.Range(1, 4, 1, 7),
                        template: '$0A'
                    }]);
                assert.strictEqual(model.getValue(), 'fooAbazzbarone\nfoobarbazzbartwo');
                assert.deepStrictEqual(getContextState(), { inSnippet: false, hasPrev: false, hasNext: false });
                assert.deepStrictEqual(editor.getSelections(), [new selection_1.Selection(1, 4, 1, 4)]);
            });
            test('nested into "insert" abort "outer" snippet (2)', function () {
                ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
                model.setValue('one\ntwo');
                editor.setSelections([new selection_1.Selection(1, 1, 1, 1), new selection_1.Selection(2, 1, 2, 1)]);
                ctrl.insert('foo${1:bar}bazz${1:bang}');
                assert.deepStrictEqual(editor.getSelections(), [new selection_1.Selection(1, 4, 1, 7), new selection_1.Selection(1, 11, 1, 14), new selection_1.Selection(2, 4, 2, 7), new selection_1.Selection(2, 11, 2, 14)]);
                assert.deepStrictEqual(getContextState(), { inSnippet: true, hasPrev: false, hasNext: true });
                const edits = [{
                        range: new range_1.Range(1, 4, 1, 7),
                        template: 'A'
                    }, {
                        range: new range_1.Range(1, 11, 1, 14),
                        template: 'B'
                    }, {
                        range: new range_1.Range(2, 4, 2, 7),
                        template: 'C'
                    }, {
                        range: new range_1.Range(2, 11, 2, 14),
                        template: 'D'
                    }];
                ctrl.apply(edits);
                assert.strictEqual(model.getValue(), "fooAbazzBone\nfooCbazzDtwo");
                assert.deepStrictEqual(getContextState(), { inSnippet: false, hasPrev: false, hasNext: false });
                assert.deepStrictEqual(editor.getSelections(), [new selection_1.Selection(1, 5, 1, 5), new selection_1.Selection(1, 10, 1, 10), new selection_1.Selection(2, 5, 2, 5), new selection_1.Selection(2, 10, 2, 10)]);
            });
        });
        test('Bug: cursor position $0 with user snippets #163808', function () {
            ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
            model.setValue('');
            ctrl.insert('<Element1 Attr1="foo" $1>\n  <Element2 Attr1="$2"/>\n$0"\n</Element1>');
            assert.deepStrictEqual(editor.getSelections(), [new selection_1.Selection(1, 23, 1, 23)]);
            ctrl.insert('Qualifier="$0"');
            assert.strictEqual(model.getValue(), '<Element1 Attr1="foo" Qualifier="">\n  <Element2 Attr1=""/>\n"\n</Element1>');
            assert.deepStrictEqual(editor.getSelections(), [new selection_1.Selection(1, 34, 1, 34)]);
        });
        test('EOL-Sequence (CRLF) shifts tab stop in isFileTemplate snippets #167386', function () {
            ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
            model.setValue('');
            model.setEOL(1 /* EndOfLineSequence.CRLF */);
            ctrl.apply([{
                    range: model.getFullModelRange(),
                    template: 'line 54321${1:FOO}\nline 54321${1:FOO}\n(no tab stop)\nline 54321${1:FOO}\nline 54321'
                }]);
            assert.deepStrictEqual(editor.getSelections(), [new selection_1.Selection(1, 11, 1, 14), new selection_1.Selection(2, 11, 2, 14), new selection_1.Selection(4, 11, 4, 14)]);
        });
        test('"Surround With" code action snippets use incorrect indentation levels and styles #169319', function () {
            model.setValue('function foo(f, x, condition) {\n    f();\n    return x;\n}');
            const sel = new range_1.Range(2, 5, 3, 14);
            editor.setSelection(sel);
            ctrl = instaService.createInstance(snippetController2_1.SnippetController2, editor);
            ctrl.apply([{
                    range: sel,
                    template: 'if (${1:condition}) {\n\t$TM_SELECTED_TEXT$0\n}'
                }]);
            assert.strictEqual(model.getValue(), `function foo(f, x, condition) {\n    if (condition) {\n        f();\n        return x;\n    }\n}`);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25pcHBldENvbnRyb2xsZXIyLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9zbmlwcGV0L3Rlc3QvYnJvd3Nlci9zbmlwcGV0Q29udHJvbGxlcjIudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUEwQkEsS0FBSyxDQUFDLG9CQUFvQixFQUFFO1FBRTNCLGtCQUFrQjtRQUNsQixTQUFTLGdCQUFnQixDQUFDLE1BQW1CLEVBQUUsR0FBRyxDQUFjO1lBQy9ELEtBQUssTUFBTSxTQUFTLElBQUksTUFBTSxDQUFDLGFBQWEsRUFBRyxFQUFFO2dCQUNoRCxNQUFNLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFHLENBQUM7Z0JBQzFCLE1BQU0sQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsRUFBRSxVQUFVLFNBQVMsQ0FBQyxRQUFRLEVBQUUsZ0JBQWdCLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7YUFDaEg7WUFDRCxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDakMsQ0FBQztRQUVELFNBQVMsaUJBQWlCLENBQUMsT0FBOEIsRUFBRSxTQUFrQixFQUFFLE9BQWdCLEVBQUUsT0FBZ0I7WUFDaEgsTUFBTSxLQUFLLEdBQUcsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZDLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFDaEUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBQzdELE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUM5RCxDQUFDO1FBRUQsU0FBUyxlQUFlLENBQUMsVUFBaUMsV0FBVztZQUNwRSxPQUFPO2dCQUNOLFNBQVMsRUFBRSx1Q0FBa0IsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQztnQkFDN0QsT0FBTyxFQUFFLHVDQUFrQixDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDO2dCQUM1RCxPQUFPLEVBQUUsdUNBQWtCLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUM7YUFDNUQsQ0FBQztRQUNILENBQUM7UUFFRCxJQUFJLElBQXdCLENBQUM7UUFDN0IsSUFBSSxNQUFtQixDQUFDO1FBQ3hCLElBQUksS0FBZ0IsQ0FBQztRQUNyQixJQUFJLFdBQWtDLENBQUM7UUFDdkMsSUFBSSxZQUFtQyxDQUFDO1FBRXhDLEtBQUssQ0FBQztZQUNMLFdBQVcsR0FBRyxJQUFJLDZDQUFxQixFQUFFLENBQUM7WUFDMUMsS0FBSyxHQUFHLElBQUEsK0JBQWUsRUFBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBQzlDLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxxQ0FBaUIsQ0FDOUMsQ0FBQyxxQkFBYSxFQUFFLElBQUksS0FBTSxTQUFRLElBQUEsV0FBSSxHQUFpQjtpQkFBSSxDQUFDLEVBQzVELENBQUMsb0NBQXdCLEVBQUUsSUFBSSxLQUFNLFNBQVEsSUFBQSxXQUFJLEdBQTRCO29CQUNuRSxZQUFZO3dCQUNwQixPQUFPLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLENBQUM7b0JBQ25DLENBQUM7aUJBQ0QsQ0FBQyxFQUNGLENBQUMsaUJBQVcsRUFBRSxJQUFJLG9CQUFjLEVBQUUsQ0FBQyxFQUNuQyxDQUFDLCtCQUFrQixFQUFFLFdBQVcsQ0FBQyxDQUNqQyxDQUFDO1lBQ0YsWUFBWSxHQUFHLElBQUksMkNBQW9CLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUMzRCxNQUFNLEdBQUcsSUFBQSxxQ0FBb0IsRUFBQyxLQUFLLEVBQUUsRUFBRSxpQkFBaUIsRUFBRSxDQUFDLENBQUM7WUFDNUQsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdFLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzFDLENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDO1lBQ1IsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2hCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNoQixDQUFDLENBQUMsQ0FBQztRQUVILElBQUEsK0NBQXVDLEdBQUUsQ0FBQztRQUUxQyxJQUFJLENBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRTtZQUNyQixJQUFJLEdBQUcsWUFBWSxDQUFDLGNBQWMsQ0FBQyx1Q0FBa0IsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUMvRCxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNyRCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyx5QkFBeUIsRUFBRTtZQUMvQixJQUFJLEdBQUcsWUFBWSxDQUFDLGNBQWMsQ0FBQyx1Q0FBa0IsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUUvRCxJQUFJLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDaEMsaUJBQWlCLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDbEQsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUVoRixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDZCxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNwRCxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pGLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGtDQUFrQyxFQUFFO1lBQ3hDLElBQUksR0FBRyxZQUFZLENBQUMsY0FBYyxDQUFDLHVDQUFrQixFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRS9ELElBQUksQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUNsQyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztZQUVsRCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDWixpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUVqRCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDWixpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztZQUVwRCxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUMvQyxNQUFNLENBQUMsV0FBVyxDQUFDLHVDQUFrQixDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDbEYsTUFBTSxDQUFDLFdBQVcsQ0FBQyx1Q0FBa0IsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ25GLE1BQU0sQ0FBQyxXQUFXLENBQUMsdUNBQWtCLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNwRixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxpREFBaUQsRUFBRTtZQUN2RCxJQUFJLEdBQUcsWUFBWSxDQUFDLGNBQWMsQ0FBQyx1Q0FBa0IsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUUvRCxJQUFJLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDaEMsaUJBQWlCLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDbEQsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUVoRix1QkFBdUI7WUFDdkIsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pGLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3JELENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLDhDQUE4QyxFQUFFO1lBQ3BELElBQUksR0FBRyxZQUFZLENBQUMsY0FBYyxDQUFDLHVDQUFrQixFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRS9ELElBQUksQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUNoQyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNsRCxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRWhGLHVCQUF1QjtZQUN2QixNQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUUsaUJBQWlCLENBQUMsV0FBVyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDckQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsb0NBQW9DLEVBQUU7WUFDMUMsSUFBSSxHQUFHLFlBQVksQ0FBQyxjQUFjLENBQUMsdUNBQWtCLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFFL0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQ2hDLE1BQU0sQ0FBQyxXQUFXLENBQUMsdUNBQWtCLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNqRixnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRWhGLHVCQUF1QjtZQUN2QixNQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsRCxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNyRCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyw4Q0FBOEMsRUFBRTtZQUNwRCxJQUFJLEdBQUcsWUFBWSxDQUFDLGNBQWMsQ0FBQyx1Q0FBa0IsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUUvRCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3RCLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3BELGdCQUFnQixDQUFDLE1BQU0sRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDbEYsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsNkJBQTZCLEVBQUU7WUFDbkMsSUFBSSxHQUFHLFlBQVksQ0FBQyxjQUFjLENBQUMsdUNBQWtCLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFFL0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUM3QixpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNsRCxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRWhGLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNsQyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNsRCxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRS9FLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQ2hELGlCQUFpQixDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRWxELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNaLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRXBELE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNsQyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztZQUVwRCxtREFBbUQ7WUFDbkQsdURBQXVEO1FBQ3hELENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGdDQUFnQyxFQUFFO1lBQ3RDLElBQUksR0FBRyxZQUFZLENBQUMsY0FBYyxDQUFDLHVDQUFrQixFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQy9ELElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDN0IsaUJBQWlCLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDbEQsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUUvRSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3JCLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0UsaUJBQWlCLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFbEQsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ1osZ0JBQWdCLENBQUMsTUFBTSxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNqRixpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNyRCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyx3QkFBd0IsRUFBRTtZQUM5QixJQUFJLEdBQUcsWUFBWSxDQUFDLGNBQWMsQ0FBQyx1Q0FBa0IsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUMvRCxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQzdCLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2xELGdCQUFnQixDQUFDLE1BQU0sRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFaEYsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUMxQixnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9FLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRWxELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNaLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDakYsaUJBQWlCLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFakQsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ1osZ0JBQWdCLENBQUMsTUFBTSxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNqRixpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNyRCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQywyQkFBMkIsRUFBRTtZQUNqQyxJQUFJLEdBQUcsWUFBWSxDQUFDLGNBQWMsQ0FBQyx1Q0FBa0IsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUMvRCxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQzdCLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2xELGdCQUFnQixDQUFDLE1BQU0sRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFaEYsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN0QixnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2pGLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRWxELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNaLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDakYsaUJBQWlCLENBQUMsV0FBVyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDckQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsbUZBQW1GLEVBQUU7WUFDekYsSUFBSSxHQUFHLFlBQVksQ0FBQyxjQUFjLENBQUMsdUNBQWtCLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFFL0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO1lBQzFELGlCQUFpQixDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2xELGdCQUFnQixDQUFDLE1BQU0sRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFbkYsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ1osaUJBQWlCLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDakQsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUVuRixJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3hCLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2pELGdCQUFnQixDQUFDLE1BQU0sRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFbkYsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ1osaUJBQWlCLENBQUMsV0FBVyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDckQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMscUZBQXFGLEVBQUU7WUFDM0YsSUFBSSxHQUFHLFlBQVksQ0FBQyxjQUFjLENBQUMsdUNBQWtCLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDL0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO1lBRW5ELGlCQUFpQixDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2xELGdCQUFnQixDQUFDLE1BQU0sRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFbkYsSUFBSSxDQUFDLE1BQU0sQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO1lBRW5ELGdCQUFnQixDQUFDLE1BQU0sRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFbkYsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsZ0JBQWdCO1lBQzdCLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFbkYsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsYUFBYTtZQUMxQixnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRW5GLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLGdCQUFnQjtZQUM3QixnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRW5GLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLGFBQWE7WUFDMUIsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNwRixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyw2R0FBNkcsRUFBRTtZQUNuSCxJQUFJLEdBQUcsWUFBWSxDQUFDLGNBQWMsQ0FBQyx1Q0FBa0IsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUUvRCxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ25CLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFL0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDO1lBRTlELGlCQUFpQixDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2xELGdCQUFnQixDQUFDLE1BQU0sRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFbEYsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNuQixnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRW5GLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFdBQVc7WUFDeEIsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3RELENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLCtCQUErQixFQUFFO1lBQ3JDLElBQUksR0FBRyxZQUFZLENBQUMsY0FBYyxDQUFDLHVDQUFrQixFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRS9ELEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDbkIsS0FBSyxDQUFDLGFBQWEsQ0FBQyxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxrQkFBa0IsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQ3BGLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFL0MsSUFBSSxDQUFDLE1BQU0sQ0FBQzs7Ozs7Ozs7Ozs7OztHQWFYLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNaLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNaLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNaLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNaLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxJQUFJLHFCQUFTLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV0RCxJQUFJLENBQUMsTUFBTSxDQUFDLDBCQUEwQixDQUFDLENBQUM7WUFDeEMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLElBQUkscUJBQVMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3pELENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLCtDQUErQyxFQUFFO1lBQ3JELElBQUksR0FBRyxZQUFZLENBQUMsY0FBYyxDQUFDLHVDQUFrQixFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRS9ELEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDbkIsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUUvQyxJQUFJLENBQUMsTUFBTSxDQUFDLHdCQUF3QixDQUFDLENBQUM7WUFDdEMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUVqRixNQUFNLENBQUMsWUFBWSxDQUFDLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRWpELDBEQUEwRDtZQUMxRCxzQ0FBc0M7WUFDdEMsaUJBQWlCLENBQUMsV0FBVyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDckQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsdURBQXVELEVBQUU7WUFDN0QsK0RBQStEO1lBQy9ELElBQUksR0FBRyxZQUFZLENBQUMsY0FBYyxDQUFDLHVDQUFrQixFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRS9ELEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDM0IsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRTdFLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDMUIsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvRSxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNuRCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxpRUFBaUUsRUFBRTtZQUV2RSxJQUFJLEdBQUcsWUFBWSxDQUFDLGNBQWMsQ0FBQyx1Q0FBa0IsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUMvRCxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ25CLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO1lBRXZELGdCQUFnQixDQUFDLE1BQU0sRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDakYsaUJBQWlCLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFbEQsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ1osaUJBQWlCLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbEQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsMkJBQTJCLEVBQUU7WUFFakMsSUFBSSxHQUFHLFlBQVksQ0FBQyxjQUFjLENBQUMsdUNBQWtCLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDL0QsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNuQixNQUFNLENBQUMsWUFBWSxDQUFDLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9DLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7WUFFM0IsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BELGlCQUFpQixDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRWxELElBQUksQ0FBQyxNQUFNLENBQUMsbUVBQW1FLENBQUMsQ0FBQztZQUNqRixnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFdEQsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ1osZ0JBQWdCLENBQUMsTUFBTSxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRXRELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNaLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUV0RCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDWixnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFdEQsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ1osZ0JBQWdCLENBQUMsTUFBTSxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRXRELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNaLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN0RCxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNyRCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyx1REFBdUQsRUFBRTtZQUM3RCxJQUFJLEdBQUcsWUFBWSxDQUFDLGNBQWMsQ0FBQyx1Q0FBa0IsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUMvRCxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ25CLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0MsSUFBSSxDQUFDLE1BQU0sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1lBQ3pDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUVyRCxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sMkJBQWUsSUFBSSxDQUFDLENBQUM7WUFDMUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXBELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNaLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwRCxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNyRCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQywyRUFBMkUsRUFBRTtZQUNqRixJQUFJLEdBQUcsWUFBWSxDQUFDLGNBQWMsQ0FBQyx1Q0FBa0IsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUMvRCxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ25CLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFL0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyw2R0FBNkcsQ0FBQyxDQUFDO1lBQzNILGdCQUFnQixDQUFDLE1BQU0sRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUV0RCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDWixnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2xGLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRWpELE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqRixpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUVqRCxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0UsaUJBQWlCLENBQUMsV0FBVyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDcEQsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNsRixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQywyRUFBMkUsRUFBRTtZQUNqRixJQUFJLEdBQUcsWUFBWSxDQUFDLGNBQWMsQ0FBQyx1Q0FBa0IsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUMvRCxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ25CLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFL0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyw2R0FBNkcsQ0FBQyxDQUFDO1lBQzNILGdCQUFnQixDQUFDLE1BQU0sRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUV0RCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDWixnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2xGLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRWpELE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqRixpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUVqRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xCLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3BELGdCQUFnQixDQUFDLE1BQU0sRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN2RCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQywrQ0FBK0MsRUFBRTtZQUNyRCxJQUFJLEdBQUcsWUFBWSxDQUFDLGNBQWMsQ0FBQyx1Q0FBa0IsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUMvRCxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ25CLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFL0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1lBQ2pDLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ25ELENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHFDQUFxQyxFQUFFO1lBQzNDLElBQUksR0FBRyxZQUFZLENBQUMsY0FBYyxDQUFDLHVDQUFrQixFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQy9ELEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDbkIsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUUvQyxJQUFJLENBQUMsTUFBTSxDQUFDLDRCQUE0QixDQUFDLENBQUM7WUFDMUMsaUJBQWlCLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFbEQsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3JELE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSwyQkFBZSxFQUFFLENBQUMsQ0FBQztZQUV4QyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFcEQsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ1osZ0JBQWdCLENBQUMsTUFBTSxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BELGlCQUFpQixDQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3JELENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLCtDQUErQyxFQUFFO1lBQ3JELElBQUksR0FBRyxZQUFZLENBQUMsY0FBYyxDQUFDLHVDQUFrQixFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQy9ELEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDbkIsa0NBQW1CLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFN0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNyQixnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMscUZBQXFGLEVBQUU7WUFDM0YsSUFBSSxHQUFHLFlBQVksQ0FBQyxjQUFjLENBQUMsdUNBQWtCLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDL0QsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNuQixrQ0FBbUIsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztZQUU3RCxJQUFJLENBQUMsTUFBTSxDQUFDLG1FQUFtRSxFQUFFLEVBQUUsZ0JBQWdCLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUM5RyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3BGLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHFGQUFxRixFQUFFO1lBQzNGLElBQUksR0FBRyxZQUFZLENBQUMsY0FBYyxDQUFDLHVDQUFrQixFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQy9ELEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDbkIsa0NBQW1CLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFN0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxtRUFBbUUsQ0FBQyxDQUFDO1lBQ2pGLHVDQUF1QztZQUN2QyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3BGLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLDBEQUEwRCxFQUFFO1lBQ2hFLElBQUksR0FBRyxZQUFZLENBQUMsY0FBYyxDQUFDLHVDQUFrQixFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQy9ELEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDbkIsS0FBSyxDQUFDLGFBQWEsQ0FBQyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEQsSUFBSSxDQUFDLE1BQU0sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1lBQ3pDLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxFQUFFLCtCQUErQixDQUFDLENBQUM7UUFDdkUsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsbUVBQW1FLEVBQUU7WUFDekUsSUFBSSxHQUFHLFlBQVksQ0FBQyxjQUFjLENBQUMsdUNBQWtCLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDL0QsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNuQixLQUFLLENBQUMsYUFBYSxDQUFDLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RCxJQUFJLENBQUMsTUFBTSxDQUFDLHdDQUF3QyxDQUFDLENBQUM7WUFDdEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEVBQUUseUNBQXlDLENBQUMsQ0FBQztRQUNqRixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxJQUFJLENBQUMsMkZBQTJGLEVBQUU7WUFFdEc7Z0JBQ0MsNEJBQTRCO2dCQUM1QixJQUFJLEdBQUcsWUFBWSxDQUFDLGNBQWMsQ0FBQyx1Q0FBa0IsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDL0QsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDbkIsS0FBSyxDQUFDLGFBQWEsQ0FBQyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3hELElBQUksQ0FBQyxNQUFNLENBQUMseURBQXlELENBQUMsQ0FBQztnQkFFdkUsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDL0UsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxDQUFDLENBQUM7Z0JBQ3pELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDWixNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsRUFBRSxnQ0FBZ0MsQ0FBQyxDQUFDO2FBQ3ZFO1lBRUQsSUFBSSxHQUFHLFlBQVksQ0FBQyxjQUFjLENBQUMsdUNBQWtCLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDL0QsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNuQixLQUFLLENBQUMsYUFBYSxDQUFDLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RCxJQUFJLENBQUMsTUFBTSxDQUFDLHlEQUF5RCxDQUFDLENBQUM7WUFFdkUsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvRSxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUNsRCxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNaLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxFQUFFLGdDQUFnQyxDQUFDLENBQUM7WUFDdkUsaURBQWlEO1FBQ2xELENBQUMsQ0FBQyxDQUFDO1FBRUgsS0FBSyxDQUFDLGlDQUFpQyxFQUFFO1lBRXhDLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtnQkFFeEIsSUFBSSxHQUFHLFlBQVksQ0FBQyxjQUFjLENBQUMsdUNBQWtCLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBRS9ELEtBQUssQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBRTdCLElBQUksQ0FBQyxLQUFLLENBQUM7b0JBQ1YsRUFBRSxLQUFLLEVBQUUsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRTtvQkFDakQsRUFBRSxLQUFLLEVBQUUsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLGlDQUFpQyxFQUFFO2lCQUM3RSxDQUFDLENBQUM7Z0JBRUgsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEVBQUUsNENBQTRDLENBQUMsQ0FBQztnQkFDbkYsaUJBQWlCLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ2xELE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXpHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDWixpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDcEQsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQyxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9FLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLDZDQUE2QyxFQUFFO2dCQUVuRCxLQUFLLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUU3QixJQUFJLEdBQUcsWUFBWSxDQUFDLGNBQWMsQ0FBQyx1Q0FBa0IsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDL0QsSUFBSSxDQUFDLEtBQUssQ0FBQztvQkFDVixFQUFFLEtBQUssRUFBRSxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFO29CQUNqRCxFQUFFLEtBQUssRUFBRSxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsbUNBQW1DLEVBQUU7aUJBQy9FLENBQUMsQ0FBQztnQkFFSCxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsRUFBRSw0Q0FBNEMsQ0FBQyxDQUFDO2dCQUNuRixpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDbEQsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQyxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFekcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNaLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNwRCxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0UsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsdUJBQXVCLEVBQUU7Z0JBRTdCLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBRTNCLElBQUksR0FBRyxZQUFZLENBQUMsY0FBYyxDQUFDLHVDQUFrQixFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUMvRCxJQUFJLENBQUMsS0FBSyxDQUFDO29CQUNWLEVBQUUsS0FBSyxFQUFFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUU7b0JBQ2xELEVBQUUsS0FBSyxFQUFFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUU7b0JBQ2hELEVBQUUsS0FBSyxFQUFFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxtQkFBbUIsRUFBRTtpQkFDL0QsQ0FBQyxDQUFDO2dCQUVILE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxFQUFFLHNCQUFzQixDQUFDLENBQUM7Z0JBQzdELE1BQU0sQ0FBQyxlQUFlLENBQUMsZUFBZSxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQzlGLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFN0UsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNaLE1BQU0sQ0FBQyxlQUFlLENBQUMsZUFBZSxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQzdGLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXZHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDWixNQUFNLENBQUMsZUFBZSxDQUFDLGVBQWUsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO2dCQUNoRyxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0UsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMseUJBQXlCLEVBQUU7Z0JBRS9CLElBQUksR0FBRyxZQUFZLENBQUMsY0FBYyxDQUFDLHVDQUFrQixFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUMvRCxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUV6QixNQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRTdFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDWCxLQUFLLEVBQUUsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUM1QixRQUFRLEVBQUUsY0FBYztxQkFDeEIsQ0FBQyxDQUFDLENBQUM7Z0JBRUosTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEVBQUUsYUFBYSxDQUFDLENBQUM7Z0JBQ3BELE1BQU0sQ0FBQyxlQUFlLENBQUMsZUFBZSxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQzlGLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFN0UsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDMUIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEVBQUUsY0FBYyxDQUFDLENBQUM7Z0JBQ3JELE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzNHLE1BQU0sQ0FBQyxlQUFlLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUVoRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ1osTUFBTSxDQUFDLGVBQWUsQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQy9GLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFOUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNaLE1BQU0sQ0FBQyxlQUFlLENBQUMsZUFBZSxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7Z0JBQ2hHLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUU3RSxDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQywwQ0FBMEMsRUFBRTtnQkFFaEQsSUFBSSxHQUFHLFlBQVksQ0FBQyxjQUFjLENBQUMsdUNBQWtCLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQy9ELEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBRTNCLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFN0UsSUFBSSxDQUFDLE1BQU0sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO2dCQUN4QyxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pLLE1BQU0sQ0FBQyxlQUFlLENBQUMsZUFBZSxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBRTlGLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDWCxLQUFLLEVBQUUsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUM1QixRQUFRLEVBQUUsS0FBSztxQkFDZixDQUFDLENBQUMsQ0FBQztnQkFFSixNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsRUFBRSxrQ0FBa0MsQ0FBQyxDQUFDO2dCQUN6RSxNQUFNLENBQUMsZUFBZSxDQUFDLGVBQWUsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO2dCQUNoRyxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0UsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsZ0RBQWdELEVBQUU7Z0JBRXRELElBQUksR0FBRyxZQUFZLENBQUMsY0FBYyxDQUFDLHVDQUFrQixFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUMvRCxLQUFLLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUUzQixNQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRTdFLElBQUksQ0FBQyxNQUFNLENBQUMsMEJBQTBCLENBQUMsQ0FBQztnQkFDeEMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQyxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNqSyxNQUFNLENBQUMsZUFBZSxDQUFDLGVBQWUsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUU5RixNQUFNLEtBQUssR0FBRyxDQUFDO3dCQUNkLEtBQUssRUFBRSxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBQzVCLFFBQVEsRUFBRSxHQUFHO3FCQUNiLEVBQUU7d0JBQ0YsS0FBSyxFQUFFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQzt3QkFDOUIsUUFBUSxFQUFFLEdBQUc7cUJBQ2IsRUFBRTt3QkFDRixLQUFLLEVBQUUsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUM1QixRQUFRLEVBQUUsR0FBRztxQkFDYixFQUFFO3dCQUNGLEtBQUssRUFBRSxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7d0JBQzlCLFFBQVEsRUFBRSxHQUFHO3FCQUNiLENBQUMsQ0FBQztnQkFDSCxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUVsQixNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsRUFBRSw0QkFBNEIsQ0FBQyxDQUFDO2dCQUNuRSxNQUFNLENBQUMsZUFBZSxDQUFDLGVBQWUsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO2dCQUNoRyxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEssQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxvREFBb0QsRUFBRTtZQUUxRCxJQUFJLEdBQUcsWUFBWSxDQUFDLGNBQWMsQ0FBQyx1Q0FBa0IsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUMvRCxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRW5CLElBQUksQ0FBQyxNQUFNLENBQUMsdUVBQXVFLENBQUMsQ0FBQztZQUNyRixNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFOUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQzlCLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxFQUFFLDZFQUE2RSxDQUFDLENBQUM7WUFDcEgsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQyxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRS9FLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHdFQUF3RSxFQUFFO1lBQzlFLElBQUksR0FBRyxZQUFZLENBQUMsY0FBYyxDQUFDLHVDQUFrQixFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQy9ELEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDbkIsS0FBSyxDQUFDLE1BQU0sZ0NBQXdCLENBQUM7WUFFckMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNYLEtBQUssRUFBRSxLQUFLLENBQUMsaUJBQWlCLEVBQUU7b0JBQ2hDLFFBQVEsRUFBRSx1RkFBdUY7aUJBQ2pHLENBQUMsQ0FBQyxDQUFDO1lBRUosTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQyxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFekksQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsMEZBQTBGLEVBQUU7WUFDaEcsS0FBSyxDQUFDLFFBQVEsQ0FBQyw2REFBNkQsQ0FBQyxDQUFDO1lBQzlFLE1BQU0sR0FBRyxHQUFHLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ25DLE1BQU0sQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDekIsSUFBSSxHQUFHLFlBQVksQ0FBQyxjQUFjLENBQUMsdUNBQWtCLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDL0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNYLEtBQUssRUFBRSxHQUFHO29CQUNWLFFBQVEsRUFBRSxpREFBaUQ7aUJBQzNELENBQUMsQ0FBQyxDQUFDO1lBRUosTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEVBQUUsa0dBQWtHLENBQUMsQ0FBQztRQUMxSSxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDIn0=