define(["require", "exports", "assert", "vs/base/test/common/mock", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/contrib/snippet/browser/snippetParser", "vs/editor/contrib/snippet/browser/snippetSession", "vs/editor/test/browser/testCodeEditor", "vs/editor/test/common/modes/testLanguageConfigurationService", "vs/editor/test/common/testTextModel", "vs/platform/instantiation/common/serviceCollection", "vs/platform/label/common/label", "vs/platform/workspace/common/workspace"], function (require, exports, assert, mock_1, position_1, range_1, selection_1, languageConfigurationRegistry_1, snippetParser_1, snippetSession_1, testCodeEditor_1, testLanguageConfigurationService_1, testTextModel_1, serviceCollection_1, label_1, workspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('SnippetSession', function () {
        let languageConfigurationService;
        let editor;
        let model;
        function assertSelections(editor, ...s) {
            for (const selection of editor.getSelections()) {
                const actual = s.shift();
                assert.ok(selection.equalsSelection(actual), `actual=${selection.toString()} <> expected=${actual.toString()}`);
            }
            assert.strictEqual(s.length, 0);
        }
        setup(function () {
            model = (0, testTextModel_1.createTextModel)('function foo() {\n    console.log(a);\n}');
            languageConfigurationService = new testLanguageConfigurationService_1.TestLanguageConfigurationService();
            const serviceCollection = new serviceCollection_1.ServiceCollection([label_1.ILabelService, new class extends (0, mock_1.mock)() {
                }], [languageConfigurationRegistry_1.ILanguageConfigurationService, languageConfigurationService], [workspace_1.IWorkspaceContextService, new class extends (0, mock_1.mock)() {
                    getWorkspace() {
                        return {
                            id: 'workspace-id',
                            folders: [],
                        };
                    }
                }]);
            editor = (0, testCodeEditor_1.createTestCodeEditor)(model, { serviceCollection });
            editor.setSelections([new selection_1.Selection(1, 1, 1, 1), new selection_1.Selection(2, 5, 2, 5)]);
            assert.strictEqual(model.getEOL(), '\n');
        });
        teardown(function () {
            model.dispose();
            editor.dispose();
        });
        test('normalize whitespace', function () {
            function assertNormalized(position, input, expected) {
                const snippet = new snippetParser_1.SnippetParser().parse(input);
                snippetSession_1.SnippetSession.adjustWhitespace(model, position, true, snippet);
                assert.strictEqual(snippet.toTextmateString(), expected);
            }
            assertNormalized(new position_1.Position(1, 1), 'foo', 'foo');
            assertNormalized(new position_1.Position(1, 1), 'foo\rbar', 'foo\nbar');
            assertNormalized(new position_1.Position(1, 1), 'foo\rbar', 'foo\nbar');
            assertNormalized(new position_1.Position(2, 5), 'foo\r\tbar', 'foo\n        bar');
            assertNormalized(new position_1.Position(2, 3), 'foo\r\tbar', 'foo\n    bar');
            assertNormalized(new position_1.Position(2, 5), 'foo\r\tbar\nfoo', 'foo\n        bar\n    foo');
            //Indentation issue with choice elements that span multiple lines #46266
            assertNormalized(new position_1.Position(2, 5), 'a\nb${1|foo,\nbar|}', 'a\n    b${1|foo,\nbar|}');
        });
        test('adjust selection (overwrite[Before|After])', function () {
            let range = snippetSession_1.SnippetSession.adjustSelection(model, new selection_1.Selection(1, 2, 1, 2), 1, 0);
            assert.ok(range.equalsRange(new range_1.Range(1, 1, 1, 2)));
            range = snippetSession_1.SnippetSession.adjustSelection(model, new selection_1.Selection(1, 2, 1, 2), 1111, 0);
            assert.ok(range.equalsRange(new range_1.Range(1, 1, 1, 2)));
            range = snippetSession_1.SnippetSession.adjustSelection(model, new selection_1.Selection(1, 2, 1, 2), 0, 10);
            assert.ok(range.equalsRange(new range_1.Range(1, 2, 1, 12)));
            range = snippetSession_1.SnippetSession.adjustSelection(model, new selection_1.Selection(1, 2, 1, 2), 0, 10111);
            assert.ok(range.equalsRange(new range_1.Range(1, 2, 1, 17)));
        });
        test('text edits & selection', function () {
            const session = new snippetSession_1.SnippetSession(editor, 'foo${1:bar}foo$0', undefined, languageConfigurationService);
            session.insert();
            assert.strictEqual(editor.getModel().getValue(), 'foobarfoofunction foo() {\n    foobarfooconsole.log(a);\n}');
            assertSelections(editor, new selection_1.Selection(1, 4, 1, 7), new selection_1.Selection(2, 8, 2, 11));
            session.next();
            assertSelections(editor, new selection_1.Selection(1, 10, 1, 10), new selection_1.Selection(2, 14, 2, 14));
        });
        test('text edit with reversed selection', function () {
            const session = new snippetSession_1.SnippetSession(editor, '${1:bar}$0', undefined, languageConfigurationService);
            editor.setSelections([new selection_1.Selection(2, 5, 2, 5), new selection_1.Selection(1, 1, 1, 1)]);
            session.insert();
            assert.strictEqual(model.getValue(), 'barfunction foo() {\n    barconsole.log(a);\n}');
            assertSelections(editor, new selection_1.Selection(2, 5, 2, 8), new selection_1.Selection(1, 1, 1, 4));
        });
        test('snippets, repeated tabstops', function () {
            const session = new snippetSession_1.SnippetSession(editor, '${1:abc}foo${1:abc}$0', undefined, languageConfigurationService);
            session.insert();
            assertSelections(editor, new selection_1.Selection(1, 1, 1, 4), new selection_1.Selection(1, 7, 1, 10), new selection_1.Selection(2, 5, 2, 8), new selection_1.Selection(2, 11, 2, 14));
            session.next();
            assertSelections(editor, new selection_1.Selection(1, 10, 1, 10), new selection_1.Selection(2, 14, 2, 14));
        });
        test('snippets, just text', function () {
            const session = new snippetSession_1.SnippetSession(editor, 'foobar', undefined, languageConfigurationService);
            session.insert();
            assert.strictEqual(model.getValue(), 'foobarfunction foo() {\n    foobarconsole.log(a);\n}');
            assertSelections(editor, new selection_1.Selection(1, 7, 1, 7), new selection_1.Selection(2, 11, 2, 11));
        });
        test('snippets, selections and new text with newlines', () => {
            const session = new snippetSession_1.SnippetSession(editor, 'foo\n\t${1:bar}\n$0', undefined, languageConfigurationService);
            session.insert();
            assert.strictEqual(editor.getModel().getValue(), 'foo\n    bar\nfunction foo() {\n    foo\n        bar\n    console.log(a);\n}');
            assertSelections(editor, new selection_1.Selection(2, 5, 2, 8), new selection_1.Selection(5, 9, 5, 12));
            session.next();
            assertSelections(editor, new selection_1.Selection(3, 1, 3, 1), new selection_1.Selection(6, 5, 6, 5));
        });
        test('snippets, newline NO whitespace adjust', () => {
            editor.setSelection(new selection_1.Selection(2, 5, 2, 5));
            const session = new snippetSession_1.SnippetSession(editor, 'abc\n    foo\n        bar\n$0', { overwriteBefore: 0, overwriteAfter: 0, adjustWhitespace: false, clipboardText: undefined, overtypingCapturer: undefined }, languageConfigurationService);
            session.insert();
            assert.strictEqual(editor.getModel().getValue(), 'function foo() {\n    abc\n    foo\n        bar\nconsole.log(a);\n}');
        });
        test('snippets, selections -> next/prev', () => {
            const session = new snippetSession_1.SnippetSession(editor, 'f$1oo${2:bar}foo$0', undefined, languageConfigurationService);
            session.insert();
            // @ $2
            assertSelections(editor, new selection_1.Selection(1, 2, 1, 2), new selection_1.Selection(2, 6, 2, 6));
            // @ $1
            session.next();
            assertSelections(editor, new selection_1.Selection(1, 4, 1, 7), new selection_1.Selection(2, 8, 2, 11));
            // @ $2
            session.prev();
            assertSelections(editor, new selection_1.Selection(1, 2, 1, 2), new selection_1.Selection(2, 6, 2, 6));
            // @ $1
            session.next();
            assertSelections(editor, new selection_1.Selection(1, 4, 1, 7), new selection_1.Selection(2, 8, 2, 11));
            // @ $0
            session.next();
            assertSelections(editor, new selection_1.Selection(1, 10, 1, 10), new selection_1.Selection(2, 14, 2, 14));
        });
        test('snippets, selections & typing', function () {
            const session = new snippetSession_1.SnippetSession(editor, 'f${1:oo}_$2_$0', undefined, languageConfigurationService);
            session.insert();
            editor.trigger('test', 'type', { text: 'X' });
            session.next();
            editor.trigger('test', 'type', { text: 'bar' });
            // go back to ${2:oo} which is now just 'X'
            session.prev();
            assertSelections(editor, new selection_1.Selection(1, 2, 1, 3), new selection_1.Selection(2, 6, 2, 7));
            // go forward to $1 which is now 'bar'
            session.next();
            assertSelections(editor, new selection_1.Selection(1, 4, 1, 7), new selection_1.Selection(2, 8, 2, 11));
            // go to final tabstop
            session.next();
            assert.strictEqual(model.getValue(), 'fX_bar_function foo() {\n    fX_bar_console.log(a);\n}');
            assertSelections(editor, new selection_1.Selection(1, 8, 1, 8), new selection_1.Selection(2, 12, 2, 12));
        });
        test('snippets, insert shorter snippet into non-empty selection', function () {
            model.setValue('foo_bar_foo');
            editor.setSelections([new selection_1.Selection(1, 1, 1, 4), new selection_1.Selection(1, 9, 1, 12)]);
            new snippetSession_1.SnippetSession(editor, 'x$0', undefined, languageConfigurationService).insert();
            assert.strictEqual(model.getValue(), 'x_bar_x');
            assertSelections(editor, new selection_1.Selection(1, 2, 1, 2), new selection_1.Selection(1, 8, 1, 8));
        });
        test('snippets, insert longer snippet into non-empty selection', function () {
            model.setValue('foo_bar_foo');
            editor.setSelections([new selection_1.Selection(1, 1, 1, 4), new selection_1.Selection(1, 9, 1, 12)]);
            new snippetSession_1.SnippetSession(editor, 'LONGER$0', undefined, languageConfigurationService).insert();
            assert.strictEqual(model.getValue(), 'LONGER_bar_LONGER');
            assertSelections(editor, new selection_1.Selection(1, 7, 1, 7), new selection_1.Selection(1, 18, 1, 18));
        });
        test('snippets, don\'t grow final tabstop', function () {
            model.setValue('foo_zzz_foo');
            editor.setSelection(new selection_1.Selection(1, 5, 1, 8));
            const session = new snippetSession_1.SnippetSession(editor, '$1bar$0', undefined, languageConfigurationService);
            session.insert();
            assertSelections(editor, new selection_1.Selection(1, 5, 1, 5));
            editor.trigger('test', 'type', { text: 'foo-' });
            session.next();
            assert.strictEqual(model.getValue(), 'foo_foo-bar_foo');
            assertSelections(editor, new selection_1.Selection(1, 12, 1, 12));
            editor.trigger('test', 'type', { text: 'XXX' });
            assert.strictEqual(model.getValue(), 'foo_foo-barXXX_foo');
            session.prev();
            assertSelections(editor, new selection_1.Selection(1, 5, 1, 9));
            session.next();
            assertSelections(editor, new selection_1.Selection(1, 15, 1, 15));
        });
        test('snippets, don\'t merge touching tabstops 1/2', function () {
            const session = new snippetSession_1.SnippetSession(editor, '$1$2$3$0', undefined, languageConfigurationService);
            session.insert();
            assertSelections(editor, new selection_1.Selection(1, 1, 1, 1), new selection_1.Selection(2, 5, 2, 5));
            session.next();
            assertSelections(editor, new selection_1.Selection(1, 1, 1, 1), new selection_1.Selection(2, 5, 2, 5));
            session.next();
            assertSelections(editor, new selection_1.Selection(1, 1, 1, 1), new selection_1.Selection(2, 5, 2, 5));
            session.next();
            assertSelections(editor, new selection_1.Selection(1, 1, 1, 1), new selection_1.Selection(2, 5, 2, 5));
            session.prev();
            session.prev();
            session.prev();
            assertSelections(editor, new selection_1.Selection(1, 1, 1, 1), new selection_1.Selection(2, 5, 2, 5));
            editor.trigger('test', 'type', { text: '111' });
            session.next();
            editor.trigger('test', 'type', { text: '222' });
            session.next();
            editor.trigger('test', 'type', { text: '333' });
            session.next();
            assert.strictEqual(model.getValue(), '111222333function foo() {\n    111222333console.log(a);\n}');
            assertSelections(editor, new selection_1.Selection(1, 10, 1, 10), new selection_1.Selection(2, 14, 2, 14));
            session.prev();
            assertSelections(editor, new selection_1.Selection(1, 7, 1, 10), new selection_1.Selection(2, 11, 2, 14));
            session.prev();
            assertSelections(editor, new selection_1.Selection(1, 4, 1, 7), new selection_1.Selection(2, 8, 2, 11));
            session.prev();
            assertSelections(editor, new selection_1.Selection(1, 1, 1, 4), new selection_1.Selection(2, 5, 2, 8));
        });
        test('snippets, don\'t merge touching tabstops 2/2', function () {
            const session = new snippetSession_1.SnippetSession(editor, '$1$2$3$0', undefined, languageConfigurationService);
            session.insert();
            assertSelections(editor, new selection_1.Selection(1, 1, 1, 1), new selection_1.Selection(2, 5, 2, 5));
            editor.trigger('test', 'type', { text: '111' });
            session.next();
            assertSelections(editor, new selection_1.Selection(1, 4, 1, 4), new selection_1.Selection(2, 8, 2, 8));
            editor.trigger('test', 'type', { text: '222' });
            session.next();
            assertSelections(editor, new selection_1.Selection(1, 7, 1, 7), new selection_1.Selection(2, 11, 2, 11));
            editor.trigger('test', 'type', { text: '333' });
            session.next();
            assert.strictEqual(session.isAtLastPlaceholder, true);
        });
        test('snippets, gracefully move over final tabstop', function () {
            const session = new snippetSession_1.SnippetSession(editor, '${1}bar$0', undefined, languageConfigurationService);
            session.insert();
            assert.strictEqual(session.isAtLastPlaceholder, false);
            assertSelections(editor, new selection_1.Selection(1, 1, 1, 1), new selection_1.Selection(2, 5, 2, 5));
            session.next();
            assert.strictEqual(session.isAtLastPlaceholder, true);
            assertSelections(editor, new selection_1.Selection(1, 4, 1, 4), new selection_1.Selection(2, 8, 2, 8));
            session.next();
            assert.strictEqual(session.isAtLastPlaceholder, true);
            assertSelections(editor, new selection_1.Selection(1, 4, 1, 4), new selection_1.Selection(2, 8, 2, 8));
        });
        test('snippets, overwriting nested placeholder', function () {
            const session = new snippetSession_1.SnippetSession(editor, 'log(${1:"$2"});$0', undefined, languageConfigurationService);
            session.insert();
            assertSelections(editor, new selection_1.Selection(1, 5, 1, 7), new selection_1.Selection(2, 9, 2, 11));
            editor.trigger('test', 'type', { text: 'XXX' });
            assert.strictEqual(model.getValue(), 'log(XXX);function foo() {\n    log(XXX);console.log(a);\n}');
            session.next();
            assert.strictEqual(session.isAtLastPlaceholder, false);
            // assertSelections(editor, new Selection(1, 7, 1, 7), new Selection(2, 11, 2, 11));
            session.next();
            assert.strictEqual(session.isAtLastPlaceholder, true);
            assertSelections(editor, new selection_1.Selection(1, 10, 1, 10), new selection_1.Selection(2, 14, 2, 14));
        });
        test('snippets, selections and snippet ranges', function () {
            const session = new snippetSession_1.SnippetSession(editor, '${1:foo}farboo${2:bar}$0', undefined, languageConfigurationService);
            session.insert();
            assert.strictEqual(model.getValue(), 'foofarboobarfunction foo() {\n    foofarboobarconsole.log(a);\n}');
            assertSelections(editor, new selection_1.Selection(1, 1, 1, 4), new selection_1.Selection(2, 5, 2, 8));
            assert.strictEqual(session.isSelectionWithinPlaceholders(), true);
            editor.setSelections([new selection_1.Selection(1, 1, 1, 1)]);
            assert.strictEqual(session.isSelectionWithinPlaceholders(), false);
            editor.setSelections([new selection_1.Selection(1, 6, 1, 6), new selection_1.Selection(2, 10, 2, 10)]);
            assert.strictEqual(session.isSelectionWithinPlaceholders(), false); // in snippet, outside placeholder
            editor.setSelections([new selection_1.Selection(1, 6, 1, 6), new selection_1.Selection(2, 10, 2, 10), new selection_1.Selection(1, 1, 1, 1)]);
            assert.strictEqual(session.isSelectionWithinPlaceholders(), false); // in snippet, outside placeholder
            editor.setSelections([new selection_1.Selection(1, 6, 1, 6), new selection_1.Selection(2, 10, 2, 10), new selection_1.Selection(2, 20, 2, 21)]);
            assert.strictEqual(session.isSelectionWithinPlaceholders(), false);
            // reset selection to placeholder
            session.next();
            assert.strictEqual(session.isSelectionWithinPlaceholders(), true);
            assertSelections(editor, new selection_1.Selection(1, 10, 1, 13), new selection_1.Selection(2, 14, 2, 17));
            // reset selection to placeholder
            session.next();
            assert.strictEqual(session.isSelectionWithinPlaceholders(), true);
            assert.strictEqual(session.isAtLastPlaceholder, true);
            assertSelections(editor, new selection_1.Selection(1, 13, 1, 13), new selection_1.Selection(2, 17, 2, 17));
        });
        test('snippets, nested sessions', function () {
            model.setValue('');
            editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
            const first = new snippetSession_1.SnippetSession(editor, 'foo${2:bar}foo$0', undefined, languageConfigurationService);
            first.insert();
            assert.strictEqual(model.getValue(), 'foobarfoo');
            assertSelections(editor, new selection_1.Selection(1, 4, 1, 7));
            const second = new snippetSession_1.SnippetSession(editor, 'ba${1:zzzz}$0', undefined, languageConfigurationService);
            second.insert();
            assert.strictEqual(model.getValue(), 'foobazzzzfoo');
            assertSelections(editor, new selection_1.Selection(1, 6, 1, 10));
            second.next();
            assert.strictEqual(second.isAtLastPlaceholder, true);
            assertSelections(editor, new selection_1.Selection(1, 10, 1, 10));
            first.next();
            assert.strictEqual(first.isAtLastPlaceholder, true);
            assertSelections(editor, new selection_1.Selection(1, 13, 1, 13));
        });
        test('snippets, typing at final tabstop', function () {
            const session = new snippetSession_1.SnippetSession(editor, 'farboo$0', undefined, languageConfigurationService);
            session.insert();
            assert.strictEqual(session.isAtLastPlaceholder, true);
            assert.strictEqual(session.isSelectionWithinPlaceholders(), false);
            editor.trigger('test', 'type', { text: 'XXX' });
            assert.strictEqual(session.isSelectionWithinPlaceholders(), false);
        });
        test('snippets, typing at beginning', function () {
            editor.setSelection(new selection_1.Selection(1, 2, 1, 2));
            const session = new snippetSession_1.SnippetSession(editor, 'farboo$0', undefined, languageConfigurationService);
            session.insert();
            editor.setSelection(new selection_1.Selection(1, 2, 1, 2));
            assert.strictEqual(session.isSelectionWithinPlaceholders(), false);
            assert.strictEqual(session.isAtLastPlaceholder, true);
            editor.trigger('test', 'type', { text: 'XXX' });
            assert.strictEqual(model.getLineContent(1), 'fXXXfarboounction foo() {');
            assert.strictEqual(session.isSelectionWithinPlaceholders(), false);
            session.next();
            assertSelections(editor, new selection_1.Selection(1, 11, 1, 11));
        });
        test('snippets, typing with nested placeholder', function () {
            editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
            const session = new snippetSession_1.SnippetSession(editor, 'This ${1:is ${2:nested}}.$0', undefined, languageConfigurationService);
            session.insert();
            assertSelections(editor, new selection_1.Selection(1, 6, 1, 15));
            session.next();
            assertSelections(editor, new selection_1.Selection(1, 9, 1, 15));
            editor.trigger('test', 'cut', {});
            assertSelections(editor, new selection_1.Selection(1, 9, 1, 9));
            editor.trigger('test', 'type', { text: 'XXX' });
            session.prev();
            assertSelections(editor, new selection_1.Selection(1, 6, 1, 12));
        });
        test('snippets, snippet with variables', function () {
            const session = new snippetSession_1.SnippetSession(editor, '@line=$TM_LINE_NUMBER$0', undefined, languageConfigurationService);
            session.insert();
            assert.strictEqual(model.getValue(), '@line=1function foo() {\n    @line=2console.log(a);\n}');
            assertSelections(editor, new selection_1.Selection(1, 8, 1, 8), new selection_1.Selection(2, 12, 2, 12));
        });
        test('snippets, merge', function () {
            editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
            const session = new snippetSession_1.SnippetSession(editor, 'This ${1:is ${2:nested}}.$0', undefined, languageConfigurationService);
            session.insert();
            session.next();
            assertSelections(editor, new selection_1.Selection(1, 9, 1, 15));
            session.merge('really ${1:nested}$0');
            assertSelections(editor, new selection_1.Selection(1, 16, 1, 22));
            session.next();
            assertSelections(editor, new selection_1.Selection(1, 22, 1, 22));
            assert.strictEqual(session.isAtLastPlaceholder, false);
            session.next();
            assert.strictEqual(session.isAtLastPlaceholder, true);
            assertSelections(editor, new selection_1.Selection(1, 23, 1, 23));
            session.prev();
            editor.trigger('test', 'type', { text: 'AAA' });
            // back to `really ${1:nested}`
            session.prev();
            assertSelections(editor, new selection_1.Selection(1, 16, 1, 22));
            // back to `${1:is ...}` which now grew
            session.prev();
            assertSelections(editor, new selection_1.Selection(1, 6, 1, 25));
        });
        test('snippets, transform', function () {
            editor.getModel().setValue('');
            editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
            const session = new snippetSession_1.SnippetSession(editor, '${1/foo/bar/}$0', undefined, languageConfigurationService);
            session.insert();
            assertSelections(editor, new selection_1.Selection(1, 1, 1, 1));
            editor.trigger('test', 'type', { text: 'foo' });
            session.next();
            assert.strictEqual(model.getValue(), 'bar');
            assert.strictEqual(session.isAtLastPlaceholder, true);
            assertSelections(editor, new selection_1.Selection(1, 4, 1, 4));
        });
        test('snippets, multi placeholder same index one transform', function () {
            editor.getModel().setValue('');
            editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
            const session = new snippetSession_1.SnippetSession(editor, '$1 baz ${1/foo/bar/}$0', undefined, languageConfigurationService);
            session.insert();
            assertSelections(editor, new selection_1.Selection(1, 1, 1, 1), new selection_1.Selection(1, 6, 1, 6));
            editor.trigger('test', 'type', { text: 'foo' });
            session.next();
            assert.strictEqual(model.getValue(), 'foo baz bar');
            assert.strictEqual(session.isAtLastPlaceholder, true);
            assertSelections(editor, new selection_1.Selection(1, 12, 1, 12));
        });
        test('snippets, transform example', function () {
            editor.getModel().setValue('');
            editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
            const session = new snippetSession_1.SnippetSession(editor, '${1:name} : ${2:type}${3/\\s:=(.*)/${1:+ :=}${1}/};\n$0', undefined, languageConfigurationService);
            session.insert();
            assertSelections(editor, new selection_1.Selection(1, 1, 1, 5));
            editor.trigger('test', 'type', { text: 'clk' });
            session.next();
            assertSelections(editor, new selection_1.Selection(1, 7, 1, 11));
            editor.trigger('test', 'type', { text: 'std_logic' });
            session.next();
            assertSelections(editor, new selection_1.Selection(1, 16, 1, 16));
            session.next();
            assert.strictEqual(model.getValue(), 'clk : std_logic;\n');
            assert.strictEqual(session.isAtLastPlaceholder, true);
            assertSelections(editor, new selection_1.Selection(2, 1, 2, 1));
        });
        test('snippets, transform with indent', function () {
            const snippet = [
                'private readonly ${1} = new Emitter<$2>();',
                'readonly ${1/^_(.*)/$1/}: Event<$2> = this.$1.event;',
                '$0'
            ].join('\n');
            const expected = [
                '{',
                '\tprivate readonly _prop = new Emitter<string>();',
                '\treadonly prop: Event<string> = this._prop.event;',
                '\t',
                '}'
            ].join('\n');
            const base = [
                '{',
                '\t',
                '}'
            ].join('\n');
            editor.getModel().setValue(base);
            editor.getModel().updateOptions({ insertSpaces: false });
            editor.setSelection(new selection_1.Selection(2, 2, 2, 2));
            const session = new snippetSession_1.SnippetSession(editor, snippet, undefined, languageConfigurationService);
            session.insert();
            assertSelections(editor, new selection_1.Selection(2, 19, 2, 19), new selection_1.Selection(3, 11, 3, 11), new selection_1.Selection(3, 28, 3, 28));
            editor.trigger('test', 'type', { text: '_prop' });
            session.next();
            assertSelections(editor, new selection_1.Selection(2, 39, 2, 39), new selection_1.Selection(3, 23, 3, 23));
            editor.trigger('test', 'type', { text: 'string' });
            session.next();
            assert.strictEqual(model.getValue(), expected);
            assert.strictEqual(session.isAtLastPlaceholder, true);
            assertSelections(editor, new selection_1.Selection(4, 2, 4, 2));
        });
        test('snippets, transform example hit if', function () {
            editor.getModel().setValue('');
            editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
            const session = new snippetSession_1.SnippetSession(editor, '${1:name} : ${2:type}${3/\\s:=(.*)/${1:+ :=}${1}/};\n$0', undefined, languageConfigurationService);
            session.insert();
            assertSelections(editor, new selection_1.Selection(1, 1, 1, 5));
            editor.trigger('test', 'type', { text: 'clk' });
            session.next();
            assertSelections(editor, new selection_1.Selection(1, 7, 1, 11));
            editor.trigger('test', 'type', { text: 'std_logic' });
            session.next();
            assertSelections(editor, new selection_1.Selection(1, 16, 1, 16));
            editor.trigger('test', 'type', { text: ' := \'1\'' });
            session.next();
            assert.strictEqual(model.getValue(), 'clk : std_logic := \'1\';\n');
            assert.strictEqual(session.isAtLastPlaceholder, true);
            assertSelections(editor, new selection_1.Selection(2, 1, 2, 1));
        });
        test('Snippet tab stop selection issue #96545, snippets, transform adjacent to previous placeholder', function () {
            editor.getModel().setValue('');
            editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
            const session = new snippetSession_1.SnippetSession(editor, '${1:{}${2:fff}${1/{/}/}', undefined, languageConfigurationService);
            session.insert();
            assertSelections(editor, new selection_1.Selection(1, 1, 1, 2), new selection_1.Selection(1, 5, 1, 6));
            session.next();
            assert.strictEqual(model.getValue(), '{fff}');
            assertSelections(editor, new selection_1.Selection(1, 2, 1, 5));
            editor.trigger('test', 'type', { text: 'ggg' });
            session.next();
            assert.strictEqual(model.getValue(), '{ggg}');
            assert.strictEqual(session.isAtLastPlaceholder, true);
            assertSelections(editor, new selection_1.Selection(1, 6, 1, 6));
        });
        test('Snippet tab stop selection issue #96545', function () {
            editor.getModel().setValue('');
            const session = new snippetSession_1.SnippetSession(editor, '${1:{}${2:fff}${1/[\\{]/}/}$0', undefined, languageConfigurationService);
            session.insert();
            assert.strictEqual(editor.getModel().getValue(), '{fff{');
            assertSelections(editor, new selection_1.Selection(1, 1, 1, 2), new selection_1.Selection(1, 5, 1, 6));
            session.next();
            assertSelections(editor, new selection_1.Selection(1, 2, 1, 5));
        });
        test('Snippet placeholder index incorrect after using 2+ snippets in a row that each end with a placeholder, #30769', function () {
            editor.getModel().setValue('');
            editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
            const session = new snippetSession_1.SnippetSession(editor, 'test ${1:replaceme}', undefined, languageConfigurationService);
            session.insert();
            editor.trigger('test', 'type', { text: '1' });
            editor.trigger('test', 'type', { text: '\n' });
            assert.strictEqual(editor.getModel().getValue(), 'test 1\n');
            session.merge('test ${1:replaceme}');
            editor.trigger('test', 'type', { text: '2' });
            editor.trigger('test', 'type', { text: '\n' });
            assert.strictEqual(editor.getModel().getValue(), 'test 1\ntest 2\n');
            session.merge('test ${1:replaceme}');
            editor.trigger('test', 'type', { text: '3' });
            editor.trigger('test', 'type', { text: '\n' });
            assert.strictEqual(editor.getModel().getValue(), 'test 1\ntest 2\ntest 3\n');
            session.merge('test ${1:replaceme}');
            editor.trigger('test', 'type', { text: '4' });
            editor.trigger('test', 'type', { text: '\n' });
            assert.strictEqual(editor.getModel().getValue(), 'test 1\ntest 2\ntest 3\ntest 4\n');
        });
        test('Snippet variable text isn\'t whitespace normalised, #31124', function () {
            editor.getModel().setValue([
                'start',
                '\t\t-one',
                '\t\t-two',
                'end'
            ].join('\n'));
            editor.getModel().updateOptions({ insertSpaces: false });
            editor.setSelection(new selection_1.Selection(2, 2, 3, 7));
            new snippetSession_1.SnippetSession(editor, '<div>\n\t$TM_SELECTED_TEXT\n</div>$0', undefined, languageConfigurationService).insert();
            let expected = [
                'start',
                '\t<div>',
                '\t\t\t-one',
                '\t\t\t-two',
                '\t</div>',
                'end'
            ].join('\n');
            assert.strictEqual(editor.getModel().getValue(), expected);
            editor.getModel().setValue([
                'start',
                '\t\t-one',
                '\t-two',
                'end'
            ].join('\n'));
            editor.getModel().updateOptions({ insertSpaces: false });
            editor.setSelection(new selection_1.Selection(2, 2, 3, 7));
            new snippetSession_1.SnippetSession(editor, '<div>\n\t$TM_SELECTED_TEXT\n</div>$0', undefined, languageConfigurationService).insert();
            expected = [
                'start',
                '\t<div>',
                '\t\t\t-one',
                '\t\t-two',
                '\t</div>',
                'end'
            ].join('\n');
            assert.strictEqual(editor.getModel().getValue(), expected);
        });
        test('Selecting text from left to right, and choosing item messes up code, #31199', function () {
            const model = editor.getModel();
            model.setValue('console.log');
            let actual = snippetSession_1.SnippetSession.adjustSelection(model, new selection_1.Selection(1, 12, 1, 9), 3, 0);
            assert.ok(actual.equalsSelection(new selection_1.Selection(1, 9, 1, 6)));
            actual = snippetSession_1.SnippetSession.adjustSelection(model, new selection_1.Selection(1, 9, 1, 12), 3, 0);
            assert.ok(actual.equalsSelection(new selection_1.Selection(1, 9, 1, 12)));
            editor.setSelections([new selection_1.Selection(1, 9, 1, 12)]);
            new snippetSession_1.SnippetSession(editor, 'far', { overwriteBefore: 3, overwriteAfter: 0, adjustWhitespace: true, clipboardText: undefined, overtypingCapturer: undefined }, languageConfigurationService).insert();
            assert.strictEqual(model.getValue(), 'console.far');
        });
        test('Tabs don\'t get replaced with spaces in snippet transformations #103818', function () {
            const model = editor.getModel();
            model.setValue('\n{\n  \n}');
            model.updateOptions({ insertSpaces: true, indentSize: 2 });
            editor.setSelections([new selection_1.Selection(1, 1, 1, 1), new selection_1.Selection(3, 6, 3, 6)]);
            const session = new snippetSession_1.SnippetSession(editor, [
                'function animate () {',
                '\tvar ${1:a} = 12;',
                '\tconsole.log(${1/(.*)/\n\t\t$1\n\t/})',
                '}'
            ].join('\n'), undefined, languageConfigurationService);
            session.insert();
            assert.strictEqual(model.getValue(), [
                'function animate () {',
                '  var a = 12;',
                '  console.log(a)',
                '}',
                '{',
                '  function animate () {',
                '    var a = 12;',
                '    console.log(a)',
                '  }',
                '}',
            ].join('\n'));
            editor.trigger('test', 'type', { text: 'bbb' });
            session.next();
            assert.strictEqual(model.getValue(), [
                'function animate () {',
                '  var bbb = 12;',
                '  console.log(',
                '    bbb',
                '  )',
                '}',
                '{',
                '  function animate () {',
                '    var bbb = 12;',
                '    console.log(',
                '      bbb',
                '    )',
                '  }',
                '}',
            ].join('\n'));
        });
        suite('createEditsAndSnippetsFromEdits', function () {
            test('empty', function () {
                const result = snippetSession_1.SnippetSession.createEditsAndSnippetsFromEdits(editor, [], true, true, undefined, undefined, languageConfigurationService);
                assert.deepStrictEqual(result.edits, []);
                assert.deepStrictEqual(result.snippets, []);
            });
            test('basic', function () {
                editor.getModel().setValue('foo("bar")');
                const result = snippetSession_1.SnippetSession.createEditsAndSnippetsFromEdits(editor, [{ range: new range_1.Range(1, 5, 1, 9), template: '$1' }, { range: new range_1.Range(1, 1, 1, 1), template: 'const ${1:new_const} = "bar"' }], true, true, undefined, undefined, languageConfigurationService);
                assert.strictEqual(result.edits.length, 2);
                assert.deepStrictEqual(result.edits[0].range, new range_1.Range(1, 1, 1, 1));
                assert.deepStrictEqual(result.edits[0].text, 'const new_const = "bar"');
                assert.deepStrictEqual(result.edits[1].range, new range_1.Range(1, 5, 1, 9));
                assert.deepStrictEqual(result.edits[1].text, 'new_const');
                assert.strictEqual(result.snippets.length, 1);
                assert.strictEqual(result.snippets[0].isTrivialSnippet, false);
            });
            test('with $SELECTION variable', function () {
                editor.getModel().setValue('Some text and a selection');
                editor.setSelections([new selection_1.Selection(1, 17, 1, 26)]);
                const result = snippetSession_1.SnippetSession.createEditsAndSnippetsFromEdits(editor, [{ range: new range_1.Range(1, 17, 1, 26), template: 'wrapped <$SELECTION>' }], true, true, undefined, undefined, languageConfigurationService);
                assert.strictEqual(result.edits.length, 1);
                assert.deepStrictEqual(result.edits[0].range, new range_1.Range(1, 17, 1, 26));
                assert.deepStrictEqual(result.edits[0].text, 'wrapped <selection>');
                assert.strictEqual(result.snippets.length, 1);
                assert.strictEqual(result.snippets[0].isTrivialSnippet, true);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25pcHBldFNlc3Npb24udGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL3NuaXBwZXQvdGVzdC9icm93c2VyL3NuaXBwZXRTZXNzaW9uLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBcUJBLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRTtRQUV2QixJQUFJLDRCQUEyRCxDQUFDO1FBQ2hFLElBQUksTUFBeUIsQ0FBQztRQUM5QixJQUFJLEtBQWdCLENBQUM7UUFFckIsU0FBUyxnQkFBZ0IsQ0FBQyxNQUF5QixFQUFFLEdBQUcsQ0FBYztZQUNyRSxLQUFLLE1BQU0sU0FBUyxJQUFJLE1BQU0sQ0FBQyxhQUFhLEVBQUUsRUFBRTtnQkFDL0MsTUFBTSxNQUFNLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRyxDQUFDO2dCQUMxQixNQUFNLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLEVBQUUsVUFBVSxTQUFTLENBQUMsUUFBUSxFQUFFLGdCQUFnQixNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQ2hIO1lBQ0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLENBQUM7UUFFRCxLQUFLLENBQUM7WUFDTCxLQUFLLEdBQUcsSUFBQSwrQkFBZSxFQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFDcEUsNEJBQTRCLEdBQUcsSUFBSSxtRUFBZ0MsRUFBRSxDQUFDO1lBQ3RFLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxxQ0FBaUIsQ0FDOUMsQ0FBQyxxQkFBYSxFQUFFLElBQUksS0FBTSxTQUFRLElBQUEsV0FBSSxHQUFpQjtpQkFBSSxDQUFDLEVBQzVELENBQUMsNkRBQTZCLEVBQUUsNEJBQTRCLENBQUMsRUFDN0QsQ0FBQyxvQ0FBd0IsRUFBRSxJQUFJ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