/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/base/test/common/utils", "vs/editor/common/core/position", "vs/editor/common/core/selection", "vs/editor/contrib/editorState/browser/editorState"], function (require, exports, assert, uri_1, utils_1, position_1, selection_1, editorState_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Editor Core - Editor State', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        const allFlags = (1 /* CodeEditorStateFlag.Value */
            | 2 /* CodeEditorStateFlag.Selection */
            | 4 /* CodeEditorStateFlag.Position */
            | 8 /* CodeEditorStateFlag.Scroll */);
        test('empty editor state should be valid', () => {
            const result = validate({}, {});
            assert.strictEqual(result, true);
        });
        test('different model URIs should be invalid', () => {
            const result = validate({ model: { uri: uri_1.URI.parse('http://test1') } }, { model: { uri: uri_1.URI.parse('http://test2') } });
            assert.strictEqual(result, false);
        });
        test('different model versions should be invalid', () => {
            const result = validate({ model: { version: 1 } }, { model: { version: 2 } });
            assert.strictEqual(result, false);
        });
        test('different positions should be invalid', () => {
            const result = validate({ position: new position_1.Position(1, 2) }, { position: new position_1.Position(2, 3) });
            assert.strictEqual(result, false);
        });
        test('different selections should be invalid', () => {
            const result = validate({ selection: new selection_1.Selection(1, 2, 3, 4) }, { selection: new selection_1.Selection(5, 2, 3, 4) });
            assert.strictEqual(result, false);
        });
        test('different scroll positions should be invalid', () => {
            const result = validate({ scroll: { left: 1, top: 2 } }, { scroll: { left: 3, top: 2 } });
            assert.strictEqual(result, false);
        });
        function validate(source, target) {
            const sourceEditor = createEditor(source), targetEditor = createEditor(target);
            const result = new editorState_1.EditorState(sourceEditor, allFlags).validate(targetEditor);
            return result;
        }
        function createEditor({ model, position, selection, scroll } = {}) {
            const mappedModel = model ? { uri: model.uri ? model.uri : uri_1.URI.parse('http://dummy.org'), getVersionId: () => model.version } : null;
            return {
                getModel: () => mappedModel,
                getPosition: () => position,
                getSelection: () => selection,
                getScrollLeft: () => scroll && scroll.left,
                getScrollTop: () => scroll && scroll.top
            };
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yU3RhdGUudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2VkaXRvclN0YXRlL3Rlc3QvYnJvd3Nlci9lZGl0b3JTdGF0ZS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBa0JoRyxLQUFLLENBQUMsNEJBQTRCLEVBQUUsR0FBRyxFQUFFO1FBRXhDLElBQUEsK0NBQXVDLEdBQUUsQ0FBQztRQUUxQyxNQUFNLFFBQVEsR0FBRyxDQUNoQjttREFDK0I7a0RBQ0Q7Z0RBQ0YsQ0FDNUIsQ0FBQztRQUVGLElBQUksQ0FBQyxvQ0FBb0MsRUFBRSxHQUFHLEVBQUU7WUFDL0MsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNoQyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNsQyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyx3Q0FBd0MsRUFBRSxHQUFHLEVBQUU7WUFDbkQsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUN0QixFQUFFLEtBQUssRUFBRSxFQUFFLEdBQUcsRUFBRSxTQUFHLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxFQUFFLEVBQUUsRUFDN0MsRUFBRSxLQUFLLEVBQUUsRUFBRSxHQUFHLEVBQUUsU0FBRyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsRUFBRSxFQUFFLENBQzdDLENBQUM7WUFFRixNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNuQyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyw0Q0FBNEMsRUFBRSxHQUFHLEVBQUU7WUFDdkQsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUN0QixFQUFFLEtBQUssRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUs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