/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions"], function (require, exports, lifecycle_1, editorExtensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$0lb = void 0;
    /**
     * Prevents the top-level menu from showing up when doing Alt + Click in the editor
     */
    class $0lb extends lifecycle_1.$kc {
        static { this.ID = 'editor.contrib.menuPreventer'; }
        constructor(editor) {
            super();
            this.a = editor;
            this.b = false;
            this.c = false;
            // A global crossover handler to prevent menu bar from showing up
            // When <alt> is hold, we will listen to mouse events and prevent
            // the release event up <alt> if the mouse is triggered.
            this.B(this.a.onMouseDown((e) => {
                if (this.b) {
                    this.c = true;
                }
            }));
            this.B(this.a.onKeyDown((e) => {
                if (e.equals(512 /* KeyMod.Alt */)) {
                    if (!this.b) {
                        this.c = false;
                    }
                    this.b = true;
                }
            }));
            this.B(this.a.onKeyUp((e) => {
                if (e.equals(512 /* KeyMod.Alt */)) {
                    if (this.c) {
                        e.preventDefault();
                    }
                    this.b = false;
                    this.c = false;
                }
            }));
        }
    }
    exports.$0lb = $0lb;
    (0, editorExtensions_1.$AV)($0lb.ID, $0lb, 2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
});
//# sourceMappingURL=menuPreventer.js.map