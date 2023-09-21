/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/contrib/notebook/browser/contrib/layout/layoutActions"], function (require, exports, assert, layoutActions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Notebook Layout Actions', () => {
        test('Toggle Cell Toolbar Position', async function () {
            const action = new layoutActions_1.$rFb();
            // "notebook.cellToolbarLocation": "right"
            assert.deepStrictEqual(action.togglePosition('test-nb', 'right'), {
                default: 'right',
                'test-nb': 'left'
            });
            // "notebook.cellToolbarLocation": "left"
            assert.deepStrictEqual(action.togglePosition('test-nb', 'left'), {
                default: 'left',
                'test-nb': 'right'
            });
            // "notebook.cellToolbarLocation": "hidden"
            assert.deepStrictEqual(action.togglePosition('test-nb', 'hidden'), {
                default: 'hidden',
                'test-nb': 'right'
            });
            // invalid
            assert.deepStrictEqual(action.togglePosition('test-nb', ''), {
                default: 'right',
                'test-nb': 'left'
            });
            // no user config, default value
            assert.deepStrictEqual(action.togglePosition('test-nb', {
                default: 'right'
            }), {
                default: 'right',
                'test-nb': 'left'
            });
            // user config, default to left
            assert.deepStrictEqual(action.togglePosition('test-nb', {
                default: 'left'
            }), {
                default: 'left',
                'test-nb': 'right'
            });
            // user config, default to hidden
            assert.deepStrictEqual(action.togglePosition('test-nb', {
                default: 'hidden'
            }), {
                default: 'hidden',
                'test-nb': 'right'
            });
        });
    });
});
//# sourceMappingURL=layoutActions.test.js.map