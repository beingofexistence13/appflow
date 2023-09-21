/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/base/common/platform", "vs/css!./iPadShowKeyboard"], function (require, exports, dom, lifecycle_1, editorExtensions_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$n0b = void 0;
    class $n0b extends lifecycle_1.$kc {
        static { this.ID = 'editor.contrib.iPadShowKeyboard'; }
        constructor(editor) {
            super();
            this.a = editor;
            this.b = null;
            if (platform_1.$q) {
                this.B(editor.onDidChangeConfiguration(() => this.c()));
                this.c();
            }
        }
        c() {
            const shouldHaveWidget = (!this.a.getOption(90 /* EditorOption.readOnly */));
            if (!this.b && shouldHaveWidget) {
                this.b = new ShowKeyboardWidget(this.a);
            }
            else if (this.b && !shouldHaveWidget) {
                this.b.dispose();
                this.b = null;
            }
        }
        dispose() {
            super.dispose();
            if (this.b) {
                this.b.dispose();
                this.b = null;
            }
        }
    }
    exports.$n0b = $n0b;
    class ShowKeyboardWidget extends lifecycle_1.$kc {
        static { this.a = 'editor.contrib.ShowKeyboardWidget'; }
        constructor(editor) {
            super();
            this.b = editor;
            this.c = document.createElement('textarea');
            this.c.className = 'iPadShowKeyboard';
            this.B(dom.$nO(this.c, 'touchstart', (e) => {
                this.b.focus();
            }));
            this.B(dom.$nO(this.c, 'focus', (e) => {
                this.b.focus();
            }));
            this.b.addOverlayWidget(this);
        }
        dispose() {
            this.b.removeOverlayWidget(this);
            super.dispose();
        }
        // ----- IOverlayWidget API
        getId() {
            return ShowKeyboardWidget.a;
        }
        getDomNode() {
            return this.c;
        }
        getPosition() {
            return {
                preference: 1 /* OverlayWidgetPositionPreference.BOTTOM_RIGHT_CORNER */
            };
        }
    }
    (0, editorExtensions_1.$AV)($n0b.ID, $n0b, 3 /* EditorContributionInstantiation.Eventually */);
});
//# sourceMappingURL=iPadShowKeyboard.js.map