/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/fastDomNode", "vs/editor/browser/view/viewPart", "vs/css!./margin"], function (require, exports, fastDomNode_1, viewPart_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$gX = void 0;
    class $gX extends viewPart_1.$FW {
        static { this.CLASS_NAME = 'glyph-margin'; }
        static { this.OUTER_CLASS_NAME = 'margin'; }
        constructor(context) {
            super(context);
            const options = this._context.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this.b = !options.get(32 /* EditorOption.disableLayerHinting */);
            this.c = layoutInfo.contentLeft;
            this.g = layoutInfo.glyphMarginLeft;
            this.j = layoutInfo.glyphMarginWidth;
            this.a = (0, fastDomNode_1.$GP)(document.createElement('div'));
            this.a.setClassName($gX.OUTER_CLASS_NAME);
            this.a.setPosition('absolute');
            this.a.setAttribute('role', 'presentation');
            this.a.setAttribute('aria-hidden', 'true');
            this.m = (0, fastDomNode_1.$GP)(document.createElement('div'));
            this.m.setClassName($gX.CLASS_NAME);
            this.a.appendChild(this.m);
        }
        dispose() {
            super.dispose();
        }
        getDomNode() {
            return this.a;
        }
        // --- begin event handlers
        onConfigurationChanged(e) {
            const options = this._context.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this.b = !options.get(32 /* EditorOption.disableLayerHinting */);
            this.c = layoutInfo.contentLeft;
            this.g = layoutInfo.glyphMarginLeft;
            this.j = layoutInfo.glyphMarginWidth;
            return true;
        }
        onScrollChanged(e) {
            return super.onScrollChanged(e) || e.scrollTopChanged;
        }
        // --- end event handlers
        prepareRender(ctx) {
            // Nothing to read
        }
        render(ctx) {
            this.a.setLayerHinting(this.b);
            this.a.setContain('strict');
            const adjustedScrollTop = ctx.scrollTop - ctx.bigNumbersDelta;
            this.a.setTop(-adjustedScrollTop);
            const height = Math.min(ctx.scrollHeight, 1000000);
            this.a.setHeight(height);
            this.a.setWidth(this.c);
            this.m.setLeft(this.g);
            this.m.setWidth(this.j);
            this.m.setHeight(height);
        }
    }
    exports.$gX = $gX;
});
//# sourceMappingURL=margin.js.map