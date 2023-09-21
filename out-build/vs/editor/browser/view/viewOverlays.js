/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/fastDomNode", "vs/editor/browser/config/domFontInfo", "vs/editor/browser/view/viewLayer", "vs/editor/browser/view/viewPart"], function (require, exports, fastDomNode_1, domFontInfo_1, viewLayer_1, viewPart_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$lX = exports.$kX = exports.$jX = exports.$iX = void 0;
    class $iX extends viewPart_1.$FW {
        constructor(context) {
            super(context);
            this.a = new viewLayer_1.$IW(this);
            this.b = this.a.domNode;
            const options = this._context.configuration.options;
            const fontInfo = options.get(50 /* EditorOption.fontInfo */);
            (0, domFontInfo_1.$vU)(this.b, fontInfo);
            this.c = [];
            this.g = false;
            this.b.setClassName('view-overlays');
        }
        shouldRender() {
            if (super.shouldRender()) {
                return true;
            }
            for (let i = 0, len = this.c.length; i < len; i++) {
                const dynamicOverlay = this.c[i];
                if (dynamicOverlay.shouldRender()) {
                    return true;
                }
            }
            return false;
        }
        dispose() {
            super.dispose();
            for (let i = 0, len = this.c.length; i < len; i++) {
                const dynamicOverlay = this.c[i];
                dynamicOverlay.dispose();
            }
            this.c = [];
        }
        getDomNode() {
            return this.b;
        }
        // ---- begin IVisibleLinesHost
        createVisibleLine() {
            return new $jX(this._context.configuration, this.c);
        }
        // ---- end IVisibleLinesHost
        addDynamicOverlay(overlay) {
            this.c.push(overlay);
        }
        // ----- event handlers
        onConfigurationChanged(e) {
            this.a.onConfigurationChanged(e);
            const startLineNumber = this.a.getStartLineNumber();
            const endLineNumber = this.a.getEndLineNumber();
            for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
                const line = this.a.getVisibleLine(lineNumber);
                line.onConfigurationChanged(e);
            }
            const options = this._context.configuration.options;
            const fontInfo = options.get(50 /* EditorOption.fontInfo */);
            (0, domFontInfo_1.$vU)(this.b, fontInfo);
            return true;
        }
        onFlushed(e) {
            return this.a.onFlushed(e);
        }
        onFocusChanged(e) {
            this.g = e.isFocused;
            return true;
        }
        onLinesChanged(e) {
            return this.a.onLinesChanged(e);
        }
        onLinesDeleted(e) {
            return this.a.onLinesDeleted(e);
        }
        onLinesInserted(e) {
            return this.a.onLinesInserted(e);
        }
        onScrollChanged(e) {
            return this.a.onScrollChanged(e) || true;
        }
        onTokensChanged(e) {
            return this.a.onTokensChanged(e);
        }
        onZonesChanged(e) {
            return this.a.onZonesChanged(e);
        }
        // ----- end event handlers
        prepareRender(ctx) {
            const toRender = this.c.filter(overlay => overlay.shouldRender());
            for (let i = 0, len = toRender.length; i < len; i++) {
                const dynamicOverlay = toRender[i];
                dynamicOverlay.prepareRender(ctx);
                dynamicOverlay.onDidRender();
            }
        }
        render(ctx) {
            // Overwriting to bypass `shouldRender` flag
            this._viewOverlaysRender(ctx);
            this.b.toggleClassName('focused', this.g);
        }
        _viewOverlaysRender(ctx) {
            this.a.renderLines(ctx.viewportData);
        }
    }
    exports.$iX = $iX;
    class $jX {
        constructor(configuration, dynamicOverlays) {
            this.a = configuration;
            this.f = this.a.options.get(66 /* EditorOption.lineHeight */);
            this.b = dynamicOverlays;
            this.c = null;
            this.d = null;
        }
        getDomNode() {
            if (!this.c) {
                return null;
            }
            return this.c.domNode;
        }
        setDomNode(domNode) {
            this.c = (0, fastDomNode_1.$GP)(domNode);
        }
        onContentChanged() {
            // Nothing
        }
        onTokensChanged() {
            // Nothing
        }
        onConfigurationChanged(e) {
            this.f = this.a.options.get(66 /* EditorOption.lineHeight */);
        }
        renderLine(lineNumber, deltaTop, viewportData, sb) {
            let result = '';
            for (let i = 0, len = this.b.length; i < len; i++) {
                const dynamicOverlay = this.b[i];
                result += dynamicOverlay.render(viewportData.startLineNumber, lineNumber);
            }
            if (this.d === result) {
                // No rendering needed
                return false;
            }
            this.d = result;
            sb.appendString('<div style="position:absolute;top:');
            sb.appendString(String(deltaTop));
            sb.appendString('px;width:100%;height:');
            sb.appendString(String(this.f));
            sb.appendString('px;">');
            sb.appendString(result);
            sb.appendString('</div>');
            return true;
        }
        layoutLine(lineNumber, deltaTop) {
            if (this.c) {
                this.c.setTop(deltaTop);
                this.c.setHeight(this.f);
            }
        }
    }
    exports.$jX = $jX;
    class $kX extends $iX {
        constructor(context) {
            super(context);
            const options = this._context.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this.j = layoutInfo.contentWidth;
            this.b.setHeight(0);
        }
        // --- begin event handlers
        onConfigurationChanged(e) {
            const options = this._context.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this.j = layoutInfo.contentWidth;
            return super.onConfigurationChanged(e) || true;
        }
        onScrollChanged(e) {
            return super.onScrollChanged(e) || e.scrollWidthChanged;
        }
        // --- end event handlers
        _viewOverlaysRender(ctx) {
            super._viewOverlaysRender(ctx);
            this.b.setWidth(Math.max(ctx.scrollWidth, this.j));
        }
    }
    exports.$kX = $kX;
    class $lX extends $iX {
        constructor(context) {
            super(context);
            const options = this._context.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this.j = layoutInfo.contentLeft;
            this.b.setClassName('margin-view-overlays');
            this.b.setWidth(1);
            (0, domFontInfo_1.$vU)(this.b, options.get(50 /* EditorOption.fontInfo */));
        }
        onConfigurationChanged(e) {
            const options = this._context.configuration.options;
            (0, domFontInfo_1.$vU)(this.b, options.get(50 /* EditorOption.fontInfo */));
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this.j = layoutInfo.contentLeft;
            return super.onConfigurationChanged(e) || true;
        }
        onScrollChanged(e) {
            return super.onScrollChanged(e) || e.scrollHeightChanged;
        }
        _viewOverlaysRender(ctx) {
            super._viewOverlaysRender(ctx);
            const height = Math.min(ctx.scrollHeight, 1000000);
            this.b.setHeight(height);
            this.b.setWidth(this.j);
        }
    }
    exports.$lX = $lX;
});
//# sourceMappingURL=viewOverlays.js.map