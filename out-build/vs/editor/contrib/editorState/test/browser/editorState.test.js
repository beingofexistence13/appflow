/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/base/test/common/utils", "vs/editor/common/core/position", "vs/editor/common/core/selection", "vs/editor/contrib/editorState/browser/editorState"], function (require, exports, assert, uri_1, utils_1, position_1, selection_1, editorState_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Editor Core - Editor State', () => {
        (0, utils_1.$bT)();
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
            const result = validate({ position: new position_1.$js(1, 2) }, { position: new position_1.$js(2, 3) });
            assert.strictEqual(result, false);
        });
        test('different selections should be invalid', () => {
            const result = validate({ selection: new selection_1.$ms(1, 2, 3, 4) }, { selection: new selection_1.$ms(5, 2, 3, 4) });
            assert.strictEqual(result, false);
        });
        test('different scroll positions should be invalid', () => {
            const result = validate({ scroll: { left: 1, top: 2 } }, { scroll: { left: 3, top: 2 } });
            assert.strictEqual(result, false);
        });
        function validate(source, target) {
            const sourceEditor = createEditor(source), targetEditor = createEditor(target);
            const result = new editorState_1.$s1(sourceEditor, allFlags).validate(targetEditor);
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
//# sourceMappingURL=editorState.test.js.map