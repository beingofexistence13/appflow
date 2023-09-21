/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/fastDomNode", "vs/editor/browser/config/domFontInfo", "vs/editor/browser/view/viewLayer", "vs/editor/browser/view/viewPart"], function (require, exports, fastDomNode_1, domFontInfo_1, viewLayer_1, viewPart_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MarginViewOverlays = exports.ContentViewOverlays = exports.ViewOverlayLine = exports.ViewOverlays = void 0;
    class ViewOverlays extends viewPart_1.ViewPart {
        constructor(context) {
            super(context);
            this._visibleLines = new viewLayer_1.VisibleLinesCollection(this);
            this.domNode = this._visibleLines.domNode;
            const options = this._context.configuration.options;
            const fontInfo = options.get(50 /* EditorOption.fontInfo */);
            (0, domFontInfo_1.applyFontInfo)(this.domNode, fontInfo);
            this._dynamicOverlays = [];
            this._isFocused = false;
            this.domNode.setClassName('view-overlays');
        }
        shouldRender() {
            if (super.shouldRender()) {
                return true;
            }
            for (let i = 0, len = this._dynamicOverlays.length; i < len; i++) {
                const dynamicOverlay = this._dynamicOverlays[i];
                if (dynamicOverlay.shouldRender()) {
                    return true;
                }
            }
            return false;
        }
        dispose() {
            super.dispose();
            for (let i = 0, len = this._dynamicOverlays.length; i < len; i++) {
                const dynamicOverlay = this._dynamicOverlays[i];
                dynamicOverlay.dispose();
            }
            this._dynamicOverlays = [];
        }
        getDomNode() {
            return this.domNode;
        }
        // ---- begin IVisibleLinesHost
        createVisibleLine() {
            return new ViewOverlayLine(this._context.configuration, this._dynamicOverlays);
        }
        // ---- end IVisibleLinesHost
        addDynamicOverlay(overlay) {
            this._dynamicOverlays.push(overlay);
        }
        // ----- event handlers
        onConfigurationChanged(e) {
            this._visibleLines.onConfigurationChanged(e);
            const startLineNumber = this._visibleLines.getStartLineNumber();
            const endLineNumber = this._visibleLines.getEndLineNumber();
            for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
                const line = this._visibleLines.getVisibleLine(lineNumber);
                line.onConfigurationChanged(e);
            }
            const options = this._context.configuration.options;
            const fontInfo = options.get(50 /* EditorOption.fontInfo */);
            (0, domFontInfo_1.applyFontInfo)(this.domNode, fontInfo);
            return true;
        }
        onFlushed(e) {
            return this._visibleLines.onFlushed(e);
        }
        onFocusChanged(e) {
            this._isFocused = e.isFocused;
            return true;
        }
        onLinesChanged(e) {
            return this._visibleLines.onLinesChanged(e);
        }
        onLinesDeleted(e) {
            return this._visibleLines.onLinesDeleted(e);
        }
        onLinesInserted(e) {
            return this._visibleLines.onLinesInserted(e);
        }
        onScrollChanged(e) {
            return this._visibleLines.onScrollChanged(e) || true;
        }
        onTokensChanged(e) {
            return this._visibleLines.onTokensChanged(e);
        }
        onZonesChanged(e) {
            return this._visibleLines.onZonesChanged(e);
        }
        // ----- end event handlers
        prepareRender(ctx) {
            const toRender = this._dynamicOverlays.filter(overlay => overlay.shouldRender());
            for (let i = 0, len = toRender.length; i < len; i++) {
                const dynamicOverlay = toRender[i];
                dynamicOverlay.prepareRender(ctx);
                dynamicOverlay.onDidRender();
            }
        }
        render(ctx) {
            // Overwriting to bypass `shouldRender` flag
            this._viewOverlaysRender(ctx);
            this.domNode.toggleClassName('focused', this._isFocused);
        }
        _viewOverlaysRender(ctx) {
            this._visibleLines.renderLines(ctx.viewportData);
        }
    }
    exports.ViewOverlays = ViewOverlays;
    class ViewOverlayLine {
        constructor(configuration, dynamicOverlays) {
            this._configuration = configuration;
            this._lineHeight = this._configuration.options.get(66 /* EditorOption.lineHeight */);
            this._dynamicOverlays = dynamicOverlays;
            this._domNode = null;
            this._renderedContent = null;
        }
        getDomNode() {
            if (!this._domNode) {
                return null;
            }
            return this._domNode.domNode;
        }
        setDomNode(domNode) {
            this._domNode = (0, fastDomNode_1.createFastDomNode)(domNode);
        }
        onContentChanged() {
            // Nothing
        }
        onTokensChanged() {
            // Nothing
        }
        onConfigurationChanged(e) {
            this._lineHeight = this._configuration.options.get(66 /* EditorOption.lineHeight */);
        }
        renderLine(lineNumber, deltaTop, viewportData, sb) {
            let result = '';
            for (let i = 0, len = this._dynamicOverlays.length; i < len; i++) {
                const dynamicOverlay = this._dynamicOverlays[i];
                result += dynamicOverlay.render(viewportData.startLineNumber, lineNumber);
            }
            if (this._renderedContent === result) {
                // No rendering needed
                return false;
            }
            this._renderedContent = result;
            sb.appendString('<div style="position:absolute;top:');
            sb.appendString(String(deltaTop));
            sb.appendString('px;width:100%;height:');
            sb.appendString(String(this._lineHeight));
            sb.appendString('px;">');
            sb.appendString(result);
            sb.appendString('</div>');
            return true;
        }
        layoutLine(lineNumber, deltaTop) {
            if (this._domNode) {
                this._domNode.setTop(deltaTop);
                this._domNode.setHeight(this._lineHeight);
            }
        }
    }
    exports.ViewOverlayLine = ViewOverlayLine;
    class ContentViewOverlays extends ViewOverlays {
        constructor(context) {
            super(context);
            const options = this._context.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this._contentWidth = layoutInfo.contentWidth;
            this.domNode.setHeight(0);
        }
        // --- begin event handlers
        onConfigurationChanged(e) {
            const options = this._context.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this._contentWidth = layoutInfo.contentWidth;
            return super.onConfigurationChanged(e) || true;
        }
        onScrollChanged(e) {
            return super.onScrollChanged(e) || e.scrollWidthChanged;
        }
        // --- end event handlers
        _viewOverlaysRender(ctx) {
            super._viewOverlaysRender(ctx);
            this.domNode.setWidth(Math.max(ctx.scrollWidth, this._contentWidth));
        }
    }
    exports.ContentViewOverlays = ContentViewOverlays;
    class MarginViewOverlays extends ViewOverlays {
        constructor(context) {
            super(context);
            const options = this._context.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this._contentLeft = layoutInfo.contentLeft;
            this.domNode.setClassName('margin-view-overlays');
            this.domNode.setWidth(1);
            (0, domFontInfo_1.applyFontInfo)(this.domNode, options.get(50 /* EditorOption.fontInfo */));
        }
        onConfigurationChanged(e) {
            const options = this._context.configuration.options;
            (0, domFontInfo_1.applyFontInfo)(this.domNode, options.get(50 /* EditorOption.fontInfo */));
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this._contentLeft = layoutInfo.contentLeft;
            return super.onConfigurationChanged(e) || true;
        }
        onScrollChanged(e) {
            return super.onScrollChanged(e) || e.scrollHeightChanged;
        }
        _viewOverlaysRender(ctx) {
            super._viewOverlaysRender(ctx);
            const height = Math.min(ctx.scrollHeight, 1000000);
            this.domNode.setHeight(height);
            this.domNode.setWidth(this._contentLeft);
        }
    }
    exports.MarginViewOverlays = MarginViewOverlays;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld092ZXJsYXlzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2Jyb3dzZXIvdmlldy92aWV3T3ZlcmxheXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZWhHLE1BQWEsWUFBYSxTQUFRLG1CQUFRO1FBT3pDLFlBQVksT0FBb0I7WUFDL0IsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRWYsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLGtDQUFzQixDQUFrQixJQUFJLENBQUMsQ0FBQztZQUN2RSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDO1lBRTFDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQztZQUNwRCxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsR0FBRyxnQ0FBdUIsQ0FBQztZQUNwRCxJQUFBLDJCQUFhLEVBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztZQUV0QyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO1lBQzNCLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1lBRXhCLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFFZSxZQUFZO1lBQzNCLElBQUksS0FBSyxDQUFDLFlBQVksRUFBRSxFQUFFO2dCQUN6QixPQUFPLElBQUksQ0FBQzthQUNaO1lBRUQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDakUsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENB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