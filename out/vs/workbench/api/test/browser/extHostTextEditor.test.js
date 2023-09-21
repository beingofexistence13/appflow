define(["require", "exports", "assert", "vs/workbench/api/common/extHostTypes", "vs/editor/common/config/editorOptions", "vs/workbench/api/common/extHostTextEditor", "vs/workbench/api/common/extHostDocumentData", "vs/base/common/uri", "vs/base/test/common/mock", "vs/platform/log/common/log", "vs/base/common/lazy"], function (require, exports, assert, extHostTypes_1, editorOptions_1, extHostTextEditor_1, extHostDocumentData_1, uri_1, mock_1, log_1, lazy_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtHostTextEditor', () => {
        let editor;
        const doc = new extHostDocumentData_1.ExtHostDocumentData(undefined, uri_1.URI.file(''), [
            'aaaa bbbb+cccc abc'
        ], '\n', 1, 'text', false);
        setup(() => {
            editor = new extHostTextEditor_1.ExtHostTextEditor('fake', null, new log_1.NullLogService(), new lazy_1.Lazy(() => doc.document), [], { cursorStyle: editorOptions_1.TextEditorCursorStyle.Line, insertSpaces: true, lineNumbers: 1, tabSize: 4, indentSize: 4 }, [], 1);
        });
        test('disposed editor', () => {
            assert.ok(editor.value.document);
            editor._acceptViewColumn(3);
            assert.strictEqual(3, editor.value.viewColumn);
            editor.dispose();
            assert.throws(() => editor._acceptViewColumn(2));
            assert.strictEqual(3, editor.value.viewColumn);
            assert.ok(editor.value.document);
            assert.throws(() => editor._acceptOptions(null));
            assert.throws(() => editor._acceptSelections([]));
        });
        test('API [bug]: registerTextEditorCommand clears redo stack even if no edits are made #55163', async function () {
            let applyCount = 0;
            const editor = new extHostTextEditor_1.ExtHostTextEditor('edt1', new class extends (0, mock_1.mock)() {
                $tryApplyEdits() {
                    applyCount += 1;
                    return Promise.resolve(true);
                }
            }, new log_1.NullLogService(), new lazy_1.Lazy(() => doc.document), [], { cursorStyle: editorOptions_1.TextEditorCursorStyle.Line, insertSpaces: true, lineNumbers: 1, tabSize: 4, indentSize: 4 }, [], 1);
            await editor.value.edit(edit => { });
            assert.strictEqual(applyCount, 0);
            await editor.value.edit(edit => { edit.setEndOfLine(1); });
            assert.strictEqual(applyCount, 1);
            await editor.value.edit(edit => { edit.delete(new extHostTypes_1.Range(0, 0, 1, 1)); });
            assert.strictEqual(applyCount, 2);
        });
    });
    suite('ExtHostTextEditorOptions', () => {
        let opts;
        let calls = [];
        setup(() => {
            calls = [];
            const mockProxy = {
                dispose: undefined,
                $trySetOptions: (id, options) => {
                    assert.strictEqual(id, '1');
                    calls.push(options);
                    return Promise.resolve(undefined);
                },
                $tryShowTextDocument: undefined,
                $registerTextEditorDecorationType: undefined,
                $removeTextEditorDecorationType: undefined,
                $tryShowEditor: undefined,
                $tryHideEditor: undefined,
                $trySetDecorations: undefined,
                $trySetDecorationsFast: undefined,
                $tryRevealRange: undefined,
                $trySetSelections: undefined,
                $tryApplyEdits: undefined,
                $tryInsertSnippet: undefined,
                $getDiffInformation: undefined
            };
            opts = new extHostTextEditor_1.ExtHostTextEditorOptions(mockProxy, '1', {
                tabSize: 4,
                indentSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* RenderLineNumbersType.On */
            }, new log_1.NullLogService());
        });
        teardown(() => {
            opts = null;
            calls = null;
        });
        function assertState(opts, expected) {
            const actual = {
                tabSize: opts.value.tabSize,
                indentSize: opts.value.indentSize,
                insertSpaces: opts.value.insertSpaces,
                cursorStyle: opts.value.cursorStyle,
                lineNumbers: opts.value.lineNumbers
            };
            assert.deepStrictEqual(actual, expected);
        }
        test('can set tabSize to the same value', () => {
            opts.value.tabSize = 4;
            assertState(opts, {
                tabSize: 4,
                indentSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* RenderLineNumbersType.On */
            });
            assert.deepStrictEqual(calls, []);
        });
        test('can change tabSize to positive integer', () => {
            opts.value.tabSize = 1;
            assertState(opts, {
                tabSize: 1,
                indentSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* RenderLineNumbersType.On */
            });
            assert.deepStrictEqual(calls, [{ tabSize: 1 }]);
        });
        test('can change tabSize to positive float', () => {
            opts.value.tabSize = 2.3;
            assertState(opts, {
                tabSize: 2,
                indentSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* RenderLineNumbersType.On */
            });
            assert.deepStrictEqual(calls, [{ tabSize: 2 }]);
        });
        test('can change tabSize to a string number', () => {
            opts.value.tabSize = '2';
            assertState(opts, {
                tabSize: 2,
                indentSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* RenderLineNumbersType.On */
            });
            assert.deepStrictEqual(calls, [{ tabSize: 2 }]);
        });
        test('tabSize can request indentation detection', () => {
            opts.value.tabSize = 'auto';
            assertState(opts, {
                tabSize: 4,
                indentSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* RenderLineNumbersType.On */
            });
            assert.deepStrictEqual(calls, [{ tabSize: 'auto' }]);
        });
        test('ignores invalid tabSize 1', () => {
            opts.value.tabSize = null;
            assertState(opts, {
                tabSize: 4,
                indentSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* RenderLineNumbersType.On */
            });
            assert.deepStrictEqual(calls, []);
        });
        test('ignores invalid tabSize 2', () => {
            opts.value.tabSize = -5;
            assertState(opts, {
                tabSize: 4,
                indentSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* RenderLineNumbersType.On */
            });
            assert.deepStrictEqual(calls, []);
        });
        test('ignores invalid tabSize 3', () => {
            opts.value.tabSize = 'hello';
            assertState(opts, {
                tabSize: 4,
                indentSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* RenderLineNumbersType.On */
            });
            assert.deepStrictEqual(calls, []);
        });
        test('ignores invalid tabSize 4', () => {
            opts.value.tabSize = '-17';
            assertState(opts, {
                tabSize: 4,
                indentSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* RenderLineNumbersType.On */
            });
            assert.deepStrictEqual(calls, []);
        });
        test('can set indentSize to the same value', () => {
            opts.value.indentSize = 4;
            assertState(opts, {
                tabSize: 4,
                indentSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* RenderLineNumbersType.On */
            });
            assert.deepStrictEqual(calls, []);
        });
        test('can change indentSize to positive integer', () => {
            opts.value.indentSize = 1;
            assertState(opts, {
                tabSize: 4,
                indentSize: 1,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* RenderLineNumbersType.On */
            });
            assert.deepStrictEqual(calls, [{ indentSize: 1 }]);
        });
        test('can change indentSize to positive float', () => {
            opts.value.indentSize = 2.3;
            assertState(opts, {
                tabSize: 4,
                indentSize: 2,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* RenderLineNumbersType.On */
            });
            assert.deepStrictEqual(calls, [{ indentSize: 2 }]);
        });
        test('can change indentSize to a string number', () => {
            opts.value.indentSize = '2';
            assertState(opts, {
                tabSize: 4,
                indentSize: 2,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* RenderLineNumbersType.On */
            });
            assert.deepStrictEqual(calls, [{ indentSize: 2 }]);
        });
        test('indentSize can request to use tabSize', () => {
            opts.value.indentSize = 'tabSize';
            assertState(opts, {
                tabSize: 4,
                indentSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* RenderLineNumbersType.On */
            });
            assert.deepStrictEqual(calls, [{ indentSize: 'tabSize' }]);
        });
        test('indentSize cannot request indentation detection', () => {
            opts.value.indentSize = 'auto';
            assertState(opts, {
                tabSize: 4,
                indentSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* RenderLineNumbersType.On */
            });
            assert.deepStrictEqual(calls, []);
        });
        test('ignores invalid indentSize 1', () => {
            opts.value.indentSize = null;
            assertState(opts, {
                tabSize: 4,
                indentSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* RenderLineNumbersType.On */
            });
            assert.deepStrictEqual(calls, []);
        });
        test('ignores invalid indentSize 2', () => {
            opts.value.indentSize = -5;
            assertState(opts, {
                tabSize: 4,
                indentSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* RenderLineNumbersType.On */
            });
            assert.deepStrictEqual(calls, []);
        });
        test('ignores invalid indentSize 3', () => {
            opts.value.indentSize = 'hello';
            assertState(opts, {
                tabSize: 4,
                indentSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* RenderLineNumbersType.On */
            });
            assert.deepStrictEqual(calls, []);
        });
        test('ignores invalid indentSize 4', () => {
            opts.value.indentSize = '-17';
            assertState(opts, {
                tabSize: 4,
                indentSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* RenderLineNumbersType.On */
            });
            assert.deepStrictEqual(calls, []);
        });
        test('can set insertSpaces to the same value', () => {
            opts.value.insertSpaces = false;
            assertState(opts, {
                tabSize: 4,
                indentSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* RenderLineNumbersType.On */
            });
            assert.deepStrictEqual(calls, []);
        });
        test('can set insertSpaces to boolean', () => {
            opts.value.insertSpaces = true;
            assertState(opts, {
                tabSize: 4,
                indentSize: 4,
                insertSpaces: true,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* RenderLineNumbersType.On */
            });
            assert.deepStrictEqual(calls, [{ insertSpaces: true }]);
        });
        test('can set insertSpaces to false string', () => {
            opts.value.insertSpaces = 'false';
            assertState(opts, {
                tabSize: 4,
                indentSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* RenderLineNumbersType.On */
            });
            assert.deepStrictEqual(calls, []);
        });
        test('can set insertSpaces to truey', () => {
            opts.value.insertSpaces = 'hello';
            assertState(opts, {
                tabSize: 4,
                indentSize: 4,
                insertSpaces: true,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* RenderLineNumbersType.On */
            });
            assert.deepStrictEqual(calls, [{ insertSpaces: true }]);
        });
        test('insertSpaces can request indentation detection', () => {
            opts.value.insertSpaces = 'auto';
            assertState(opts, {
                tabSize: 4,
                indentSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* RenderLineNumbersType.On */
            });
            assert.deepStrictEqual(calls, [{ insertSpaces: 'auto' }]);
        });
        test('can set cursorStyle to same value', () => {
            opts.value.cursorStyle = editorOptions_1.TextEditorCursorStyle.Line;
            assertState(opts, {
                tabSize: 4,
                indentSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* RenderLineNumbersType.On */
            });
            assert.deepStrictEqual(calls, []);
        });
        test('can change cursorStyle', () => {
            opts.value.cursorStyle = editorOptions_1.TextEditorCursorStyle.Block;
            assertState(opts, {
                tabSize: 4,
                indentSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Block,
                lineNumbers: 1 /* RenderLineNumbersType.On */
            });
            assert.deepStrictEqual(calls, [{ cursorStyle: editorOptions_1.TextEditorCursorStyle.Block }]);
        });
        test('can set lineNumbers to same value', () => {
            opts.value.lineNumbers = extHostTypes_1.TextEditorLineNumbersStyle.On;
            assertState(opts, {
                tabSize: 4,
                indentSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* RenderLineNumbersType.On */
            });
            assert.deepStrictEqual(calls, []);
        });
        test('can change lineNumbers', () => {
            opts.value.lineNumbers = extHostTypes_1.TextEditorLineNumbersStyle.Off;
            assertState(opts, {
                tabSize: 4,
                indentSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 0 /* RenderLineNumbersType.Off */
            });
            assert.deepStrictEqual(calls, [{ lineNumbers: 0 /* RenderLineNumbersType.Off */ }]);
        });
        test('can do bulk updates 0', () => {
            opts.assign({
                tabSize: 4,
                indentSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: extHostTypes_1.TextEditorLineNumbersStyle.On
            });
            assertState(opts, {
                tabSize: 4,
                indentSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* RenderLineNumbersType.On */
            });
            assert.deepStrictEqual(calls, []);
        });
        test('can do bulk updates 1', () => {
            opts.assign({
                tabSize: 'auto',
                insertSpaces: true
            });
            assertState(opts, {
                tabSize: 4,
                indentSize: 4,
                insertSpaces: true,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* RenderLineNumbersType.On */
            });
            assert.deepStrictEqual(calls, [{ tabSize: 'auto', insertSpaces: true }]);
        });
        test('can do bulk updates 2', () => {
            opts.assign({
                tabSize: 3,
                insertSpaces: 'auto'
            });
            assertState(opts, {
                tabSize: 3,
                indentSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* RenderLineNumbersType.On */
            });
            assert.deepStrictEqual(calls, [{ tabSize: 3, insertSpaces: 'auto' }]);
        });
        test('can do bulk updates 3', () => {
            opts.assign({
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Block,
                lineNumbers: extHostTypes_1.TextEditorLineNumbersStyle.Relative
            });
            assertState(opts, {
                tabSize: 4,
                indentSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Block,
                lineNumbers: 2 /* RenderLineNumbersType.Relative */
            });
            assert.deepStrictEqual(calls, [{ cursorStyle: editorOptions_1.TextEditorCursorStyle.Block, lineNumbers: 2 /* RenderLineNumbersType.Relative */ }]);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFRleHRFZGl0b3IudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvdGVzdC9icm93c2VyL2V4dEhvc3RUZXh0RWRpdG9yLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBZUEsS0FBSyxDQUFDLG1CQUFtQixFQUFFLEdBQUcsRUFBRTtRQUUvQixJQUFJLE1BQXlCLENBQUM7UUFDOUIsTUFBTSxHQUFHLEdBQUcsSUFBSSx5Q0FBbUIsQ0FBQyxTQUFVLEVBQUUsU0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUM3RCxvQkFBb0I7U0FDcEIsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUUzQixLQUFLLENBQUMsR0FBRyxFQUFFO1lBQ1YsTUFBTSxHQUFHLElBQUkscUNBQWlCLENBQUMsTUFBTSxFQUFFLElBQUssRUFBRSxJQUFJLG9CQUFjLEVBQUUsRUFBRSxJQUFJLFdBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLHFDQUFxQixDQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzFOLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsRUFBRTtZQUU1QixNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDakMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVCLE1BQU0sQ0FBQyxXQUFXLENBQUMs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