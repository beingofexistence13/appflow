/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/fastDomNode", "vs/base/common/arrays", "vs/editor/browser/view/dynamicViewOverlay", "vs/editor/browser/view/viewPart", "vs/editor/common/core/range", "vs/css!./glyphMargin"], function (require, exports, fastDomNode_1, arrays_1, dynamicViewOverlay_1, viewPart_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$yX = exports.$xX = exports.$wX = exports.$vX = exports.$uX = void 0;
    /**
     * Represents a decoration that should be shown along the lines from `startLineNumber` to `endLineNumber`.
     * This can end up producing multiple `LineDecorationToRender`.
     */
    class $uX {
        constructor(startLineNumber, endLineNumber, className, zIndex) {
            this._decorationToRenderBrand = undefined;
            this.startLineNumber = +startLineNumber;
            this.endLineNumber = +endLineNumber;
            this.className = String(className);
            this.zIndex = zIndex ?? 0;
        }
    }
    exports.$uX = $uX;
    /**
     * A decoration that should be shown along a line.
     */
    class $vX {
        constructor(className, zIndex) {
            this.className = className;
            this.zIndex = zIndex;
        }
    }
    exports.$vX = $vX;
    /**
     * Decorations to render on a visible line.
     */
    class $wX {
        constructor() {
            this.c = [];
        }
        add(decoration) {
            this.c.push(decoration);
        }
        getDecorations() {
            return this.c;
        }
    }
    exports.$wX = $wX;
    class $xX extends dynamicViewOverlay_1.$eX {
        /**
         * Returns an array with an element for each visible line number.
         */
        c(visibleStartLineNumber, visibleEndLineNumber, decorations) {
            const output = [];
            for (let lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
                const lineIndex = lineNumber - visibleStartLineNumber;
                output[lineIndex] = new $wX();
            }
            if (decorations.length === 0) {
                return output;
            }
            // Sort decorations by className, then by startLineNumber and then by endLineNumber
            decorations.sort((a, b) => {
                if (a.className === b.className) {
                    if (a.startLineNumber === b.startLineNumber) {
                        return a.endLineNumber - b.endLineNumber;
                    }
                    return a.startLineNumber - b.startLineNumber;
                }
                return (a.className < b.className ? -1 : 1);
            });
            let prevClassName = null;
            let prevEndLineIndex = 0;
            for (let i = 0, len = decorations.length; i < len; i++) {
                const d = decorations[i];
                const className = d.className;
                const zIndex = d.zIndex;
                let startLineIndex = Math.max(d.startLineNumber, visibleStartLineNumber) - visibleStartLineNumber;
                const endLineIndex = Math.min(d.endLineNumber, visibleEndLineNumber) - visibleStartLineNumber;
                if (prevClassName === className) {
                    // Here we avoid rendering the same className multiple times on the same line
                    startLineIndex = Math.max(prevEndLineIndex + 1, startLineIndex);
                    prevEndLineIndex = Math.max(prevEndLineIndex, endLineIndex);
                }
                else {
                    prevClassName = className;
                    prevEndLineIndex = endLineIndex;
                }
                for (let i = startLineIndex; i <= prevEndLineIndex; i++) {
                    output[i].add(new $vX(className, zIndex));
                }
            }
            return output;
        }
    }
    exports.$xX = $xX;
    class $yX extends viewPart_1.$FW {
        constructor(context) {
            super(context);
            this.u = {};
            this._context = context;
            const options = this._context.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this.domNode = (0, fastDomNode_1.$GP)(document.createElement('div'));
            this.domNode.setClassName('glyph-margin-widgets');
            this.domNode.setPosition('absolute');
            this.domNode.setTop(0);
            this.c = options.get(66 /* EditorOption.lineHeight */);
            this.g = options.get(57 /* EditorOption.glyphMargin */);
            this.j = layoutInfo.glyphMarginLeft;
            this.m = layoutInfo.glyphMarginWidth;
            this.n = layoutInfo.glyphMarginDecorationLaneCount;
            this.s = [];
            this.t = [];
        }
        dispose() {
            this.s = [];
            this.t = [];
            this.u = {};
            super.dispose();
        }
        getWidgets() {
            return Object.values(this.u);
        }
        // --- begin event handlers
        onConfigurationChanged(e) {
            const options = this._context.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this.c = options.get(66 /* EditorOption.lineHeight */);
            this.g = options.get(57 /* EditorOption.glyphMargin */);
            this.j = layoutInfo.glyphMarginLeft;
            this.m = layoutInfo.glyphMarginWidth;
            this.n = layoutInfo.glyphMarginDecorationLaneCount;
            return true;
        }
        onDecorationsChanged(e) {
            return true;
        }
        onFlushed(e) {
            return true;
        }
        onLinesChanged(e) {
            return true;
        }
        onLinesDeleted(e) {
            return true;
        }
        onLinesInserted(e) {
            return true;
        }
        onScrollChanged(e) {
            return e.scrollTopChanged;
        }
        onZonesChanged(e) {
            return true;
        }
        // --- end event handlers
        // --- begin widget management
        addWidget(widget) {
            const domNode = (0, fastDomNode_1.$GP)(widget.getDomNode());
            this.u[widget.getId()] = {
                widget: widget,
                preference: widget.getPosition(),
                domNode: domNode,
                renderInfo: null
            };
            domNode.setPosition('absolute');
            domNode.setDisplay('none');
            domNode.setAttribute('widgetId', widget.getId());
            this.domNode.appendChild(domNode);
            this.h();
        }
        setWidgetPosition(widget, preference) {
            const myWidget = this.u[widget.getId()];
            if (myWidget.preference.lane === preference.lane
                && myWidget.preference.zIndex === preference.zIndex
                && range_1.$ks.equalsRange(myWidget.preference.range, preference.range)) {
                return false;
            }
            myWidget.preference = preference;
            this.h();
            return true;
        }
        removeWidget(widget) {
            const widgetId = widget.getId();
            if (this.u[widgetId]) {
                const widgetData = this.u[widgetId];
                const domNode = widgetData.domNode.domNode;
                delete this.u[widgetId];
                domNode.parentNode?.removeChild(domNode);
                this.h();
            }
        }
        // --- end widget management
        w(ctx, requests) {
            const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
            const visibleEndLineNumber = ctx.visibleRange.endLineNumber;
            const decorations = ctx.getDecorationsInViewport();
            for (const d of decorations) {
                const glyphMarginClassName = d.options.glyphMarginClassName;
                if (!glyphMarginClassName) {
                    continue;
                }
                const startLineNumber = Math.max(d.range.startLineNumber, visibleStartLineNumber);
                const endLineNumber = Math.min(d.range.endLineNumber, visibleEndLineNumber);
                const lane = Math.min(d.options.glyphMargin?.position ?? 1, this.n);
                const zIndex = d.options.zIndex ?? 0;
                for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
                    requests.push(new DecorationBasedGlyphRenderRequest(lineNumber, lane, zIndex, glyphMarginClassName));
                }
            }
        }
        y(ctx, requests) {
            const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
            const visibleEndLineNumber = ctx.visibleRange.endLineNumber;
            for (const widget of Object.values(this.u)) {
                const range = widget.preference.range;
                if (range.endLineNumber < visibleStartLineNumber || range.startLineNumber > visibleEndLineNumber) {
                    // The widget is not in the viewport
                    continue;
                }
                // The widget is in the viewport, find a good line for it
                const widgetLineNumber = Math.max(range.startLineNumber, visibleStartLineNumber);
                const lane = Math.min(widget.preference.lane, this.n);
                requests.push(new WidgetBasedGlyphRenderRequest(widgetLineNumber, lane, widget.preference.zIndex, widget));
            }
        }
        z(ctx) {
            const requests = [];
            this.w(ctx, requests);
            this.y(ctx, requests);
            // sort requests by lineNumber ASC, lane  ASC, zIndex DESC, type DESC (widgets first), className ASC
            // don't change this sort unless you understand `prepareRender` below.
            requests.sort((a, b) => {
                if (a.lineNumber === b.lineNumber) {
                    if (a.lane === b.lane) {
                        if (a.zIndex === b.zIndex) {
                            if (b.type === a.type) {
                                if (a.type === 0 /* GlyphRenderRequestType.Decoration */ && b.type === 0 /* GlyphRenderRequestType.Decoration */) {
                                    return (a.className < b.className ? -1 : 1);
                                }
                                return 0;
                            }
                            return b.type - a.type;
                        }
                        return b.zIndex - a.zIndex;
                    }
                    return a.lane - b.lane;
                }
                return a.lineNumber - b.lineNumber;
            });
            return requests;
        }
        /**
         * Will store render information in each widget's renderInfo and in `_decorationGlyphsToRender`.
         */
        prepareRender(ctx) {
            if (!this.g) {
                this.t = [];
                return;
            }
            for (const widget of Object.values(this.u)) {
                widget.renderInfo = null;
            }
            const requests = new arrays_1.$0b(this.z(ctx));
            const decorationGlyphsToRender = [];
            while (requests.length > 0) {
                const first = requests.peek();
                if (!first) {
                    // not possible
                    break;
                }
                // Requests are sorted by lineNumber and lane, so we read all requests for this particular location
                const requestsAtLocation = requests.takeWhile((el) => el.lineNumber === first.lineNumber && el.lane === first.lane);
                if (!requestsAtLocation || requestsAtLocation.length === 0) {
                    // not possible
                    break;
                }
                const winner = requestsAtLocation[0];
                if (winner.type === 0 /* GlyphRenderRequestType.Decoration */) {
                    // combine all decorations with the same z-index
                    const classNames = [];
                    // requests are sorted by zIndex, type, and className so we can dedup className by looking at the previous one
                    for (const request of requestsAtLocation) {
                        if (request.zIndex !== winner.zIndex || request.type !== winner.type) {
                            break;
                        }
                        if (classNames.length === 0 || classNames[classNames.length - 1] !== request.className) {
                            classNames.push(request.className);
                        }
                    }
                    decorationGlyphsToRender.push(winner.accept(classNames.join(' '))); // TODO@joyceerhl Implement overflow for remaining decorations
                }
                else {
                    // widgets cannot be combined
                    winner.widget.renderInfo = {
                        lineNumber: winner.lineNumber,
                        lane: winner.lane,
                    };
                }
            }
            this.t = decorationGlyphsToRender;
        }
        render(ctx) {
            if (!this.g) {
                for (const widget of Object.values(this.u)) {
                    widget.domNode.setDisplay('none');
                }
                while (this.s.length > 0) {
                    const domNode = this.s.pop();
                    domNode?.domNode.remove();
                }
                return;
            }
            const width = (Math.round(this.m / this.n));
            // Render widgets
            for (const widget of Object.values(this.u)) {
                if (!widget.renderInfo) {
                    // this widget is not visible
                    widget.domNode.setDisplay('none');
                }
                else {
                    const top = ctx.viewportData.relativeVerticalOffset[widget.renderInfo.lineNumber - ctx.viewportData.startLineNumber];
                    const left = this.j + (widget.renderInfo.lane - 1) * this.c;
                    widget.domNode.setDisplay('block');
                    widget.domNode.setTop(top);
                    widget.domNode.setLeft(left);
                    widget.domNode.setWidth(width);
                    widget.domNode.setHeight(this.c);
                }
            }
            // Render decorations, reusing previous dom nodes as possible
            for (let i = 0; i < this.t.length; i++) {
                const dec = this.t[i];
                const top = ctx.viewportData.relativeVerticalOffset[dec.lineNumber - ctx.viewportData.startLineNumber];
                const left = this.j + (dec.lane - 1) * this.c;
                let domNode;
                if (i < this.s.length) {
                    domNode = this.s[i];
                }
                else {
                    domNode = (0, fastDomNode_1.$GP)(document.createElement('div'));
                    this.s.push(domNode);
                    this.domNode.appendChild(domNode);
                }
                domNode.setClassName(`cgmr codicon ` + dec.combinedClassName);
                domNode.setPosition(`absolute`);
                domNode.setTop(top);
                domNode.setLeft(left);
                domNode.setWidth(width);
                domNode.setHeight(this.c);
            }
            // remove extra dom nodes
            while (this.s.length > this.t.length) {
                const domNode = this.s.pop();
                domNode?.domNode.remove();
            }
        }
    }
    exports.$yX = $yX;
    var GlyphRenderRequestType;
    (function (GlyphRenderRequestType) {
        GlyphRenderRequestType[GlyphRenderRequestType["Decoration"] = 0] = "Decoration";
        GlyphRenderRequestType[GlyphRenderRequestType["Widget"] = 1] = "Widget";
    })(GlyphRenderRequestType || (GlyphRenderRequestType = {}));
    /**
     * A request to render a decoration in the glyph margin at a certain location.
     */
    class DecorationBasedGlyphRenderRequest {
        constructor(lineNumber, lane, zIndex, className) {
            this.lineNumber = lineNumber;
            this.lane = lane;
            this.zIndex = zIndex;
            this.className = className;
            this.type = 0 /* GlyphRenderRequestType.Decoration */;
        }
        accept(combinedClassName) {
            return new DecorationBasedGlyph(this.lineNumber, this.lane, combinedClassName);
        }
    }
    /**
     * A request to render a widget in the glyph margin at a certain location.
     */
    class WidgetBasedGlyphRenderRequest {
        constructor(lineNumber, lane, zIndex, widget) {
            this.lineNumber = lineNumber;
            this.lane = lane;
            this.zIndex = zIndex;
            this.widget = widget;
            this.type = 1 /* GlyphRenderRequestType.Widget */;
        }
    }
    class DecorationBasedGlyph {
        constructor(lineNumber, lane, combinedClassName) {
            this.lineNumber = lineNumber;
            this.lane = lane;
            this.combinedClassName = combinedClassName;
        }
    }
});
//# sourceMappingURL=glyphMargin.js.map