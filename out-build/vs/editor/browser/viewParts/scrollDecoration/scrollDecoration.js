/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/fastDomNode", "vs/editor/browser/view/viewPart", "vs/css!./scrollDecoration"], function (require, exports, fastDomNode_1, viewPart_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$NX = void 0;
    class $NX extends viewPart_1.$FW {
        constructor(context) {
            super(context);
            this.b = 0;
            this.c = 0;
            this.n();
            this.g = false;
            const options = this._context.configuration.options;
            const scrollbar = options.get(102 /* EditorOption.scrollbar */);
            this.j = scrollbar.useShadows;
            this.a = (0, fastDomNode_1.$GP)(document.createElement('div'));
            this.a.setAttribute('role', 'presentation');
            this.a.setAttribute('aria-hidden', 'true');
        }
        dispose() {
            super.dispose();
        }
        m() {
            const newShouldShow = (this.j && this.b > 0);
            if (this.g !== newShouldShow) {
                this.g = newShouldShow;
                return true;
            }
            return false;
        }
        getDomNode() {
            return this.a;
        }
        n() {
            const options = this._context.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            if (layoutInfo.minimap.renderMinimap === 0 || (layoutInfo.minimap.minimapWidth > 0 && layoutInfo.minimap.minimapLeft === 0)) {
                this.c = layoutInfo.width;
            }
            else {
                this.c = layoutInfo.width - layoutInfo.verticalScrollbarWidth;
            }
        }
        // --- begin event handlers
        onConfigurationChanged(e) {
            const options = this._context.configuration.options;
            const scrollbar = options.get(102 /* EditorOption.scrollbar */);
            this.j = scrollbar.useShadows;
            this.n();
            this.m();
            return true;
        }
        onScrollChanged(e) {
            this.b = e.scrollTop;
            return this.m();
        }
        // --- end event handlers
        prepareRender(ctx) {
            // Nothing to read
        }
        render(ctx) {
            this.a.setWidth(this.c);
            this.a.setClassName(this.g ? 'scroll-decoration' : '');
        }
    }
    exports.$NX = $NX;
});
//# sourceMappingURL=scrollDecoration.js.map