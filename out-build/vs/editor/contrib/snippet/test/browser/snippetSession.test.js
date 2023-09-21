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
            model = (0, testTextModel_1.$O0b)('function foo() {\n    console.log(a);\n}');
            languageConfigurationService = new testLanguageConfigurationService_1.$D0b();
            const serviceCollection = new serviceCollection_1.$zh([label_1.$Vz, new class extends (0, mock_1.$rT)() {
                }], [languageConfigurationRegistry_1.$2t, languageConfigurationService], [workspace_1.$Kh, new class extends (0, mock_1.$rT)() {
                    getWorkspace() {
                        return {
                            id: 'workspace-id',
                            folders: [],
                        };
                    }
                }]);
            editor = (0, testCodeEditor_1.$10b)(model, { serviceCollection });
            editor.setSelections([new selection_1.$ms(1, 1, 1, 1), new selection_1.$ms(2, 5, 2, 5)]);
            assert.strictEqual(model.getEOL(), '\n');
        });
        teardown(function () {
            model.dispose();
            editor.dispose();
        });
        test('normalize whitespace', function () {
            function assertNormalized(position, input, expected) {
                const snippet = new snippetParser_1.$G5().parse(input);
                snippetSession_1.$l6.adjustWhitespace(model, position, true, snippet);
                assert.strictEqual(snippet.toTextmateString(), expected);
            }
            assertNormalized(new position_1.$js(1, 1), 'foo', 'foo');
            assertNormalized(new position_1.$js(1, 1), 'foo\rbar', 'foo\nbar');
            assertNormalized(new position_1.$js(1, 1), 'foo\rbar', 'foo\nbar');
            assertNormalized(new position_1.$js(2, 5), 'foo\r\tbar', 'foo\n        bar');
            assertNormalized(new position_1.$js(2, 3), 'foo\r\tbar', 'foo\n    bar');
            assertNormalized(new position_1.$js(2, 5), 'foo\r\tbar\nfoo', 'foo\n        bar\n    foo');
            //Indentation issue with choice elements that span multiple lines #46266
            assertNormalized(new position_1.$js(2, 5), 'a\nb${1|foo,\nbar|}', 'a\n    b${1|foo,\nbar|}');
        });
        test('adjust selection (overwrite[Before|After])', function () {
            let range = snippetSession_1.$l6.adjustSelection(model, new selection_1.$ms(1, 2, 1, 2), 1, 0);
            assert.ok(range.equalsRange(new range_1.$ks(1, 1, 1, 2)));
            range = snippetSession_1.$l6.adjustSelection(model, new selection_1.$ms(1, 2, 1, 2), 1111, 0);
            assert.ok(range.equalsRange(new range_1.$ks(1, 1, 1, 2)));
            range = snippetSession_1.$l6.adjustSelection(model, new selection_1.$ms(1, 2, 1, 2), 0, 10);
            assert.ok(range.equalsRange(new range_1.$ks(1, 2, 1, 12)));
            range = snippetSession_1.$l6.adjustSelection(model, new selection_1.$ms(1, 2, 1, 2), 0, 10111);
            assert.ok(range.equalsRange(new range_1.$ks(1, 2, 1, 17)));
        });
        test('text edits & selection', function () {
            const session = new snippetSession_1.$l6(editor, 'foo${1:bar}foo$0', undefined, languageConfigurationService);
            session.insert();
            assert.strictEqual(editor.getModel().getValue(), 'foobarfoofunction foo() {\n    foobarfooconsole.log(a);\n}');
            assertSelections(editor, new selection_1.$ms(1, 4, 1, 7), new selection_1.$ms(2, 8, 2, 11));
            session.next();
            assertSelections(editor, new selection_1.$ms(1, 10, 1, 10), new selection_1.$ms(2, 14, 2, 14));
        });
        test('text edit with reversed selection', function () {
            const session = new snippetSession_1.$l6(editor, '${1:bar}$0', undefined, languageConfigurationService);
            editor.setSelections([new selection_1.$ms(2, 5, 2, 5), new selection_1.$ms(1, 1, 1, 1)]);
            session.insert();
            assert.strictEqual(model.getValue(), 'barfunction foo() {\n    barconsole.log(a);\n}');
            assertSelections(editor, new selection_1.$ms(2, 5, 2, 8), new selection_1.$ms(1, 1, 1, 4));
        });
        test('snippets, repeated tabstops', function () {
            const session = new snippetSession_1.$l6(editor, '${1:abc}foo${1:abc}$0', undefined, languageConfigurationService);
            session.insert();
            assertSelections(editor, new selection_1.$ms(1, 1, 1, 4), new selection_1.$ms(1, 7, 1, 10), new selection_1.$ms(2, 5, 2, 8), new selection_1.$ms(2, 11, 2, 14));
            session.next();
            assertSelections(editor, new selection_1.$ms(1, 10, 1, 10), new selection_1.$ms(2, 14, 2, 14));
        });
        test('snippets, just text', function () {
            const session = new snippetSession_1.$l6(editor, 'foobar', undefined, languageConfigurationService);
            session.insert();
            assert.strictEqual(model.getValue(), 'foobarfunction foo() {\n    foobarconsole.log(a);\n}');
            assertSelections(editor, new selection_1.$ms(1, 7, 1, 7), new selection_1.$ms(2, 11, 2, 11));
        });
        test('snippets, selections and new text with newlines', () => {
            const session = new snippetSession_1.$l6(editor, 'foo\n\t${1:bar}\n$0', undefined, languageConfigurationService);
            session.insert();
            assert.strictEqual(editor.getModel().getValue(), 'foo\n    bar\nfunction foo() {\n    foo\n        bar\n    console.log(a);\n}');
            assertSelections(editor, new selection_1.$ms(2, 5, 2, 8), new selection_1.$ms(5, 9, 5, 12));
            session.next();
            assertSelections(editor, new selection_1.$ms(3, 1, 3, 1), new selection_1.$ms(6, 5, 6, 5));
        });
        test('snippets, newline NO whitespace adjust', () => {
            editor.setSelection(new selection_1.$ms(2, 5, 2, 5));
            const session = new snippetSession_1.$l6(editor, 'abc\n    foo\n        bar\n$0', { overwriteBefore: 0, overwriteAfter: 0, adjustWhitespace: false, clipboardText: undefined, overtypingCapturer: undefined }, languageConfigurationService);
            session.insert();
            assert.strictEqual(editor.getModel().getValue(), 'function foo() {\n    abc\n    foo\n        bar\nconsole.log(a);\n}');
        });
        test('snippets, selections -> next/prev', () => {
            const session = new snippetSession_1.$l6(editor, 'f$1oo${2:bar}foo$0', undefined, languageConfigurationService);
            session.insert();
            // @ $2
            assertSelections(editor, new selection_1.$ms(1, 2, 1, 2), new selection_1.$ms(2, 6, 2, 6));
            // @ $1
            session.next();
            assertSelections(editor, new selection_1.$ms(1, 4, 1, 7), new selection_1.$ms(2, 8, 2, 11));
            // @ $2
            session.prev();
            assertSelections(editor, new selection_1.$ms(1, 2, 1, 2), new selection_1.$ms(2, 6, 2, 6));
            // @ $1
            session.next();
            assertSelections(editor, new selection_1.$ms(1, 4, 1, 7), new selection_1.$ms(2, 8, 2, 11));
            // @ $0
            session.next();
            assertSelections(editor, new selection_1.$ms(1, 10, 1, 10), new selection_1.$ms(2, 14, 2, 14));
        });
        test('snippets, selections & typing', function () {
            const session = new snippetSession_1.$l6(editor, 'f${1:oo}_$2_$0', undefined, languageConfigurationService);
            session.insert();
            editor.trigger('test', 'type', { text: 'X' });
            session.next();
            editor.trigger('test', 'type', { text: 'bar' });
            // go back to ${2:oo} which is now just 'X'
            session.prev();
            assertSelections(editor, new selection_1.$ms(1, 2, 1, 3), new selection_1.$ms(2, 6, 2, 7));
            // go forward to $1 which is now 'bar'
            session.next();
            assertSelections(editor, new selection_1.$ms(1, 4, 1, 7), new selection_1.$ms(2, 8, 2, 11));
            // go to final tabstop
            session.next();
            assert.strictEqual(model.getValue(), 'fX_bar_function foo() {\n    fX_bar_console.log(a);\n}');
            assertSelections(editor, new selection_1.$ms(1, 8, 1, 8), new selection_1.$ms(2, 12, 2, 12));
        });
        test('snippets, insert shorter snippet into non-empty selection', function () {
            model.setValue('foo_bar_foo');
            editor.setSelections([new selection_1.$ms(1, 1, 1, 4), new selection_1.$ms(1, 9, 1, 12)]);
            new snippetSession_1.$l6(editor, 'x$0', undefined, languageConfigurationService).insert();
            assert.strictEqual(model.getValue(), 'x_bar_x');
            assertSelections(editor, new selection_1.$ms(1, 2, 1, 2), new selection_1.$ms(1, 8, 1, 8));
        });
        test('snippets, insert longer snippet into non-empty selection', function () {
            model.setValue('foo_bar_foo');
            editor.setSelections([new selection_1.$ms(1, 1, 1, 4), new selection_1.$ms(1, 9, 1, 12)]);
            new snippetSession_1.$l6(editor, 'LONGER$0', undefined, languageConfigurationService).insert();
            assert.strictEqual(model.getValue(), 'LONGER_bar_LONGER');
            assertSelections(editor, new selection_1.$ms(1, 7, 1, 7), new selection_1.$ms(1, 18, 1, 18));
        });
        test('snippets, don\'t grow final tabstop', function () {
            model.setValue('foo_zzz_foo');
            editor.setSelection(new selection_1.$ms(1, 5, 1, 8));
            const session = new snippetSession_1.$l6(editor, '$1bar$0', undefined, languageConfigurationService);
            session.insert();
            assertSelections(editor, new selection_1.$ms(1, 5, 1, 5));
            editor.trigger('test', 'type', { text: 'foo-' });
            session.next();
            assert.strictEqual(model.getValue(), 'foo_foo-bar_foo');
            assertSelections(editor, new selection_1.$ms(1, 12, 1, 12));
            editor.trigger('test', 'type', { text: 'XXX' });
            assert.strictEqual(model.getValue(), 'foo_foo-barXXX_foo');
            session.prev();
            assertSelections(editor, new selection_1.$ms(1, 5, 1, 9));
            session.next();
            assertSelections(editor, new selection_1.$ms(1, 15, 1, 15));
        });
        test('snippets, don\'t merge touching tabstops 1/2', function () {
            const session = new snippetSession_1.$l6(editor, '$1$2$3$0', undefined, languageConfigurationService);
            session.insert();
            assertSelections(editor, new selection_1.$ms(1, 1, 1, 1), new selection_1.$ms(2, 5, 2, 5));
            session.next();
            assertSelections(editor, new selection_1.$ms(1, 1, 1, 1), new selection_1.$ms(2, 5, 2, 5));
            session.next();
            assertSelections(editor, new selection_1.$ms(1, 1, 1, 1), new selection_1.$ms(2, 5, 2, 5));
            session.next();
            assertSelections(editor, new selection_1.$ms(1, 1, 1, 1), new selection_1.$ms(2, 5, 2, 5));
            session.prev();
            session.prev();
            session.prev();
            assertSelections(editor, new selection_1.$ms(1, 1, 1, 1), new selection_1.$ms(2, 5, 2, 5));
            editor.trigger('test', 'type', { text: '111' });
            session.next();
            editor.trigger('test', 'type', { text: '222' });
            session.next();
            editor.trigger('test', 'type', { text: '333' });
            session.next();
            assert.strictEqual(model.getValue(), '111222333function foo() {\n    111222333console.log(a);\n}');
            assertSelections(editor, new selection_1.$ms(1, 10, 1, 10), new selection_1.$ms(2, 14, 2, 14));
            session.prev();
            assertSelections(editor, new selection_1.$ms(1, 7, 1, 10), new selection_1.$ms(2, 11, 2, 14));
            session.prev();
            assertSelections(editor, new selection_1.$ms(1, 4, 1, 7), new selection_1.$ms(2, 8, 2, 11));
            session.prev();
            assertSelections(editor, new selection_1.$ms(1, 1, 1, 4), new selection_1.$ms(2, 5, 2, 8));
        });
        test('snippets, don\'t merge touching tabstops 2/2', function () {
            const session = new snippetSession_1.$l6(editor, '$1$2$3$0', undefined, languageConfigurationService);
            session.insert();
            assertSelections(editor, new selection_1.$ms(1, 1, 1, 1), new selection_1.$ms(2, 5, 2, 5));
            editor.trigger('test', 'type', { text: '111' });
            session.next();
            assertSelections(editor, new selection_1.$ms(1, 4, 1, 4), new selection_1.$ms(2, 8, 2, 8));
            editor.trigger('test', 'type', { text: '222' });
            session.next();
            assertSelections(editor, new selection_1.$ms(1, 7, 1, 7), new selection_1.$ms(2, 11, 2, 11));
            editor.trigger('test', 'type', { text: '333' });
            session.next();
            assert.strictEqual(session.isAtLastPlaceholder, true);
        });
        test('snippets, gracefully move over final tabstop', function () {
            const session = new snippetSession_1.$l6(editor, '${1}bar$0', undefined, languageConfigurationService);
            session.insert();
            assert.strictEqual(session.isAtLastPlaceholder, false);
            assertSelections(editor, new selection_1.$ms(1, 1, 1, 1), new selection_1.$ms(2, 5, 2, 5));
            session.next();
            assert.strictEqual(session.isAtLastPlaceholder, true);
            assertSelections(editor, new selection_1.$ms(1, 4, 1, 4), new selection_1.$ms(2, 8, 2, 8));
            session.next();
            assert.strictEqual(session.isAtLastPlaceholder, true);
            assertSelections(editor, new selection_1.$ms(1, 4, 1, 4), new selection_1.$ms(2, 8, 2, 8));
        });
        test('snippets, overwriting nested placeholder', function () {
            const session = new snippetSession_1.$l6(editor, 'log(${1:"$2"});$0', undefined, languageConfigurationService);
            session.insert();
            assertSelections(editor, new selection_1.$ms(1, 5, 1, 7), new selection_1.$ms(2, 9, 2, 11));
            editor.trigger('test', 'type', { text: 'XXX' });
            assert.strictEqual(model.getValue(), 'log(XXX);function foo() {\n    log(XXX);console.log(a);\n}');
            session.next();
            assert.strictEqual(session.isAtLastPlaceholder, false);
            // assertSelections(editor, new Selection(1, 7, 1, 7), new Selection(2, 11, 2, 11));
            session.next();
            assert.strictEqual(session.isAtLastPlaceholder, true);
            assertSelections(editor, new selection_1.$ms(1, 10, 1, 10), new selection_1.$ms(2, 14, 2, 14));
        });
        test('snippets, selections and snippet ranges', function () {
            const session = new snippetSession_1.$l6(editor, '${1:foo}farboo${2:bar}$0', undefined, languageConfigurationService);
            session.insert();
            assert.strictEqual(model.getValue(), 'foofarboobarfunction foo() {\n    foofarboobarconsole.log(a);\n}');
            assertSelections(editor, new selection_1.$ms(1, 1, 1, 4), new selection_1.$ms(2, 5, 2, 8));
            assert.strictEqual(session.isSelectionWithinPlaceholders(), true);
            editor.setSelections([new selection_1.$ms(1, 1, 1, 1)]);
            assert.strictEqual(session.isSelectionWithinPlaceholders(), false);
            editor.setSelections([new selection_1.$ms(1, 6, 1, 6), new selection_1.$ms(2, 10, 2, 10)]);
            assert.strictEqual(session.isSelectionWithinPlaceholders(), false); // in snippet, outside placeholder
            editor.setSelections([new selection_1.$ms(1, 6, 1, 6), new selection_1.$ms(2, 10, 2, 10), new selection_1.$ms(1, 1, 1, 1)]);
            assert.strictEqual(session.isSelectionWithinPlaceholders(), false); // in snippet, outside placeholder
            editor.setSelections([new selection_1.$ms(1, 6, 1, 6), new selection_1.$ms(2, 10, 2, 10), new selection_1.$ms(2, 20, 2, 21)]);
            assert.strictEqual(session.isSelectionWithinPlaceholders(), false);
            // reset selection to placeholder
            session.next();
            assert.strictEqual(session.isSelectionWithinPlaceholders(), true);
            assertSelections(editor, new selection_1.$ms(1, 10, 1, 13), new selection_1.$ms(2, 14, 2, 17));
            // reset selection to placeholder
            session.next();
            assert.strictEqual(session.isSelectionWithinPlaceholders(), true);
            assert.strictEqual(session.isAtLastPlaceholder, true);
            assertSelections(editor, new selection_1.$ms(1, 13, 1, 13), new selection_1.$ms(2, 17, 2, 17));
        });
        test('snippets, nested sessions', function () {
            model.setValue('');
            editor.setSelection(new selection_1.$ms(1, 1, 1, 1));
            const first = new snippetSession_1.$l6(editor, 'foo${2:bar}foo$0', undefined, languageConfigurationService);
            first.insert();
            assert.strictEqual(model.getValue(), 'foobarfoo');
            assertSelections(editor, new selection_1.$ms(1, 4, 1, 7));
            const second = new snippetSession_1.$l6(editor, 'ba${1:zzzz}$0', undefined, languageConfigurationService);
            second.insert();
            assert.strictEqual(model.getValue(), 'foobazzzzfoo');
            assertSelections(editor, new selection_1.$ms(1, 6, 1, 10));
            second.next();
            assert.strictEqual(second.isAtLastPlaceholder, true);
            assertSelections(editor, new selection_1.$ms(1, 10, 1, 10));
            first.next();
            assert.strictEqual(first.isAtLastPlaceholder, true);
            assertSelections(editor, new selection_1.$ms(1, 13, 1, 13));
        });
        test('snippets, typing at final tabstop', function () {
            const session = new snippetSession_1.$l6(editor, 'farboo$0', undefined, languageConfigurationService);
            session.insert();
            assert.strictEqual(session.isAtLastPlaceholder, true);
            assert.strictEqual(session.isSelectionWithinPlaceholders(), false);
            editor.trigger('test', 'type', { text: 'XXX' });
            assert.strictEqual(session.isSelectionWithinPlaceholders(), false);
        });
        test('snippets, typing at beginning', function () {
            editor.setSelection(new selection_1.$ms(1, 2, 1, 2));
            const session = new snippetSession_1.$l6(editor, 'farboo$0', undefined, languageConfigurationService);
            session.insert();
            editor.setSelection(new selection_1.$ms(1, 2, 1, 2));
            assert.strictEqual(session.isSelectionWithinPlaceholders(), false);
            assert.strictEqual(session.isAtLastPlaceholder, true);
            editor.trigger('test', 'type', { text: 'XXX' });
            assert.strictEqual(model.getLineContent(1), 'fXXXfarboounction foo() {');
            assert.strictEqual(session.isSelectionWithinPlaceholders(), false);
            session.next();
            assertSelections(editor, new selection_1.$ms(1, 11, 1, 11));
        });
        test('snippets, typing with nested placeholder', function () {
            editor.setSelection(new selection_1.$ms(1, 1, 1, 1));
            const session = new snippetSession_1.$l6(editor, 'This ${1:is ${2:nested}}.$0', undefined, languageConfigurationService);
            session.insert();
            assertSelections(editor, new selection_1.$ms(1, 6, 1, 15));
            session.next();
            assertSelections(editor, new selection_1.$ms(1, 9, 1, 15));
            editor.trigger('test', 'cut', {});
            assertSelections(editor, new selection_1.$ms(1, 9, 1, 9));
            editor.trigger('test', 'type', { text: 'XXX' });
            session.prev();
            assertSelections(editor, new selection_1.$ms(1, 6, 1, 12));
        });
        test('snippets, snippet with variables', function () {
            const session = new snippetSession_1.$l6(editor, '@line=$TM_LINE_NUMBER$0', undefined, languageConfigurationService);
            session.insert();
            assert.strictEqual(model.getValue(), '@line=1function foo() {\n    @line=2console.log(a);\n}');
            assertSelections(editor, new selection_1.$ms(1, 8, 1, 8), new selection_1.$ms(2, 12, 2, 12));
        });
        test('snippets, merge', function () {
            editor.setSelection(new selection_1.$ms(1, 1, 1, 1));
            const session = new snippetSession_1.$l6(editor, 'This ${1:is ${2:nested}}.$0', undefined, languageConfigurationService);
            session.insert();
            session.next();
            assertSelections(editor, new selection_1.$ms(1, 9, 1, 15));
            session.merge('really ${1:nested}$0');
            assertSelections(editor, new selection_1.$ms(1, 16, 1, 22));
            session.next();
            assertSelections(editor, new selection_1.$ms(1, 22, 1, 22));
            assert.strictEqual(session.isAtLastPlaceholder, false);
            session.next();
            assert.strictEqual(session.isAtLastPlaceholder, true);
            assertSelections(editor, new selection_1.$ms(1, 23, 1, 23));
            session.prev();
            editor.trigger('test', 'type', { text: 'AAA' });
            // back to `really ${1:nested}`
            session.prev();
            assertSelections(editor, new selection_1.$ms(1, 16, 1, 22));
            // back to `${1:is ...}` which now grew
            session.prev();
            assertSelections(editor, new selection_1.$ms(1, 6, 1, 25));
        });
        test('snippets, transform', function () {
            editor.getModel().setValue('');
            editor.setSelection(new selection_1.$ms(1, 1, 1, 1));
            const session = new snippetSession_1.$l6(editor, '${1/foo/bar/}$0', undefined, languageConfigurationService);
            session.insert();
            assertSelections(editor, new selection_1.$ms(1, 1, 1, 1));
            editor.trigger('test', 'type', { text: 'foo' });
            session.next();
            assert.strictEqual(model.getValue(), 'bar');
            assert.strictEqual(session.isAtLastPlaceholder, true);
            assertSelections(editor, new selection_1.$ms(1, 4, 1, 4));
        });
        test('snippets, multi placeholder same index one transform', function () {
            editor.getModel().setValue('');
            editor.setSelection(new selection_1.$ms(1, 1, 1, 1));
            const session = new snippetSession_1.$l6(editor, '$1 baz ${1/foo/bar/}$0', undefined, languageConfigurationService);
            session.insert();
            assertSelections(editor, new selection_1.$ms(1, 1, 1, 1), new selection_1.$ms(1, 6, 1, 6));
            editor.trigger('test', 'type', { text: 'foo' });
            session.next();
            assert.strictEqual(model.getValue(), 'foo baz bar');
            assert.strictEqual(session.isAtLastPlaceholder, true);
            assertSelections(editor, new selection_1.$ms(1, 12, 1, 12));
        });
        test('snippets, transform example', function () {
            editor.getModel().setValue('');
            editor.setSelection(new selection_1.$ms(1, 1, 1, 1));
            const session = new snippetSession_1.$l6(editor, '${1:name} : ${2:type}${3/\\s:=(.*)/${1:+ :=}${1}/};\n$0', undefined, languageConfigurationService);
            session.insert();
            assertSelections(editor, new selection_1.$ms(1, 1, 1, 5));
            editor.trigger('test', 'type', { text: 'clk' });
            session.next();
            assertSelections(editor, new selection_1.$ms(1, 7, 1, 11));
            editor.trigger('test', 'type', { text: 'std_logic' });
            session.next();
            assertSelections(editor, new selection_1.$ms(1, 16, 1, 16));
            session.next();
            assert.strictEqual(model.getValue(), 'clk : std_logic;\n');
            assert.strictEqual(session.isAtLastPlaceholder, true);
            assertSelections(editor, new selection_1.$ms(2, 1, 2, 1));
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
            editor.setSelection(new selection_1.$ms(2, 2, 2, 2));
            const session = new snippetSession_1.$l6(editor, snippet, undefined, languageConfigurationService);
            session.insert();
            assertSelections(editor, new selection_1.$ms(2, 19, 2, 19), new selection_1.$ms(3, 11, 3, 11), new selection_1.$ms(3, 28, 3, 28));
            editor.trigger('test', 'type', { text: '_prop' });
            session.next();
            assertSelections(editor, new selection_1.$ms(2, 39, 2, 39), new selection_1.$ms(3, 23, 3, 23));
            editor.trigger('test', 'type', { text: 'string' });
            session.next();
            assert.strictEqual(model.getValue(), expected);
            assert.strictEqual(session.isAtLastPlaceholder, true);
            assertSelections(editor, new selection_1.$ms(4, 2, 4, 2));
        });
        test('snippets, transform example hit if', function () {
            editor.getModel().setValue('');
            editor.setSelection(new selection_1.$ms(1, 1, 1, 1));
            const session = new snippetSession_1.$l6(editor, '${1:name} : ${2:type}${3/\\s:=(.*)/${1:+ :=}${1}/};\n$0', undefined, languageConfigurationService);
            session.insert();
            assertSelections(editor, new selection_1.$ms(1, 1, 1, 5));
            editor.trigger('test', 'type', { text: 'clk' });
            session.next();
            assertSelections(editor, new selection_1.$ms(1, 7, 1, 11));
            editor.trigger('test', 'type', { text: 'std_logic' });
            session.next();
            assertSelections(editor, new selection_1.$ms(1, 16, 1, 16));
            editor.trigger('test', 'type', { text: ' := \'1\'' });
            session.next();
            assert.strictEqual(model.getValue(), 'clk : std_logic := \'1\';\n');
            assert.strictEqual(session.isAtLastPlaceholder, true);
            assertSelections(editor, new selection_1.$ms(2, 1, 2, 1));
        });
        test('Snippet tab stop selection issue #96545, snippets, transform adjacent to previous placeholder', function () {
            editor.getModel().setValue('');
            editor.setSelection(new selection_1.$ms(1, 1, 1, 1));
            const session = new snippetSession_1.$l6(editor, '${1:{}${2:fff}${1/{/}/}', undefined, languageConfigurationService);
            session.insert();
            assertSelections(editor, new selection_1.$ms(1, 1, 1, 2), new selection_1.$ms(1, 5, 1, 6));
            session.next();
            assert.strictEqual(model.getValue(), '{fff}');
            assertSelections(editor, new selection_1.$ms(1, 2, 1, 5));
            editor.trigger('test', 'type', { text: 'ggg' });
            session.next();
            assert.strictEqual(model.getValue(), '{ggg}');
            assert.strictEqual(session.isAtLastPlaceholder, true);
            assertSelections(editor, new selection_1.$ms(1, 6, 1, 6));
        });
        test('Snippet tab stop selection issue #96545', function () {
            editor.getModel().setValue('');
            const session = new snippetSession_1.$l6(editor, '${1:{}${2:fff}${1/[\\{]/}/}$0', undefined, languageConfigurationService);
            session.insert();
            assert.strictEqual(editor.getModel().getValue(), '{fff{');
            assertSelections(editor, new selection_1.$ms(1, 1, 1, 2), new selection_1.$ms(1, 5, 1, 6));
            session.next();
            assertSelections(editor, new selection_1.$ms(1, 2, 1, 5));
        });
        test('Snippet placeholder index incorrect after using 2+ snippets in a row that each end with a placeholder, #30769', function () {
            editor.getModel().setValue('');
            editor.setSelection(new selection_1.$ms(1, 1, 1, 1));
            const session = new snippetSession_1.$l6(editor, 'test ${1:replaceme}', undefined, languageConfigurationService);
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
            editor.setSelection(new selection_1.$ms(2, 2, 3, 7));
            new snippetSession_1.$l6(editor, '<div>\n\t$TM_SELECTED_TEXT\n</div>$0', undefined, languageConfigurationService).insert();
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
            editor.setSelection(new selection_1.$ms(2, 2, 3, 7));
            new snippetSession_1.$l6(editor, '<div>\n\t$TM_SELECTED_TEXT\n</div>$0', undefined, languageConfigurationService).insert();
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
            let actual = snippetSession_1.$l6.adjustSelection(model, new selection_1.$ms(1, 12, 1, 9), 3, 0);
            assert.ok(actual.equalsSelection(new selection_1.$ms(1, 9, 1, 6)));
            actual = snippetSession_1.$l6.adjustSelection(model, new selection_1.$ms(1, 9, 1, 12), 3, 0);
            assert.ok(actual.equalsSelection(new selection_1.$ms(1, 9, 1, 12)));
            editor.setSelections([new selection_1.$ms(1, 9, 1, 12)]);
            new snippetSession_1.$l6(editor, 'far', { overwriteBefore: 3, overwriteAfter: 0, adjustWhitespace: true, clipboardText: undefined, overtypingCapturer: undefined }, languageConfigurationService).insert();
            assert.strictEqual(model.getValue(), 'console.far');
        });
        test('Tabs don\'t get replaced with spaces in snippet transformations #103818', function () {
            const model = editor.getModel();
            model.setValue('\n{\n  \n}');
            model.updateOptions({ insertSpaces: true, indentSize: 2 });
            editor.setSelections([new selection_1.$ms(1, 1, 1, 1), new selection_1.$ms(3, 6, 3, 6)]);
            const session = new snippetSession_1.$l6(editor, [
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
                const result = snippetSession_1.$l6.createEditsAndSnippetsFromEdits(editor, [], true, true, undefined, undefined, languageConfigurationService);
                assert.deepStrictEqual(result.edits, []);
                assert.deepStrictEqual(result.snippets, []);
            });
            test('basic', function () {
                editor.getModel().setValue('foo("bar")');
                const result = snippetSession_1.$l6.createEditsAndSnippetsFromEdits(editor, [{ range: new range_1.$ks(1, 5, 1, 9), template: '$1' }, { range: new range_1.$ks(1, 1, 1, 1), template: 'const ${1:new_const} = "bar"' }], true, true, undefined, undefined, languageConfigurationService);
                assert.strictEqual(result.edits.length, 2);
                assert.deepStrictEqual(result.edits[0].range, new range_1.$ks(1, 1, 1, 1));
                assert.deepStrictEqual(result.edits[0].text, 'const new_const = "bar"');
                assert.deepStrictEqual(result.edits[1].range, new range_1.$ks(1, 5, 1, 9));
                assert.deepStrictEqual(result.edits[1].text, 'new_const');
                assert.strictEqual(result.snippets.length, 1);
                assert.strictEqual(result.snippets[0].isTrivialSnippet, false);
            });
            test('with $SELECTION variable', function () {
                editor.getModel().setValue('Some text and a selection');
                editor.setSelections([new selection_1.$ms(1, 17, 1, 26)]);
                const result = snippetSession_1.$l6.createEditsAndSnippetsFromEdits(editor, [{ range: new range_1.$ks(1, 17, 1, 26), template: 'wrapped <$SELECTION>' }], true, true, undefined, undefined, languageConfigurationService);
                assert.strictEqual(result.edits.length, 1);
                assert.deepStrictEqual(result.edits[0].range, new range_1.$ks(1, 17, 1, 26));
                assert.deepStrictEqual(result.edits[0].text, 'wrapped <selection>');
                assert.strictEqual(result.snippets.length, 1);
                assert.strictEqual(result.snippets[0].isTrivialSnippet, true);
            });
        });
    });
});
//# sourceMappingURL=snippetSession.test.js.map