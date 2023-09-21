/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/editor/common/config/editorZoom", "vs/nls!vs/editor/contrib/fontZoom/browser/fontZoom"], function (require, exports, editorExtensions_1, editorZoom_1, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class EditorFontZoomIn extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.fontZoomIn',
                label: nls.localize(0, null),
                alias: 'Editor Font Zoom In',
                precondition: undefined
            });
        }
        run(accessor, editor) {
            editorZoom_1.EditorZoom.setZoomLevel(editorZoom_1.EditorZoom.getZoomLevel() + 1);
        }
    }
    class EditorFontZoomOut extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.fontZoomOut',
                label: nls.localize(1, null),
                alias: 'Editor Font Zoom Out',
                precondition: undefined
            });
        }
        run(accessor, editor) {
            editorZoom_1.EditorZoom.setZoomLevel(editorZoom_1.EditorZoom.getZoomLevel() - 1);
        }
    }
    class EditorFontZoomReset extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.fontZoomReset',
                label: nls.localize(2, null),
                alias: 'Editor Font Zoom Reset',
                precondition: undefined
            });
        }
        run(accessor, editor) {
            editorZoom_1.EditorZoom.setZoomLevel(0);
        }
    }
    (0, editorExtensions_1.$xV)(EditorFontZoomIn);
    (0, editorExtensions_1.$xV)(EditorFontZoomOut);
    (0, editorExtensions_1.$xV)(EditorFontZoomReset);
});
//# sourceMappingURL=fontZoom.js.map