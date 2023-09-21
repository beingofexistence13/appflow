/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/fastDomNode", "vs/base/common/arrays", "vs/editor/browser/view/dynamicViewOverlay", "vs/editor/browser/view/viewPart", "vs/editor/common/core/range", "vs/css!./glyphMargin"], function (require, exports, fastDomNode_1, arrays_1, dynamicViewOverlay_1, viewPart_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GlyphMarginWidgets = exports.DedupOverlay = exports.VisibleLineDecorationsToRender = exports.LineDecorationToRender = exports.DecorationToRender = void 0;
    /**
     * Represents a decoration that should be shown along the lines from `startLineNumber` to `endLineNumber`.
     * This can end up producing multiple `LineDecorationToRender`.
     */
    class DecorationToRender {
        constructor(startLineNumber, endLineNumber, className, zIndex) {
            this._decorationToRenderBrand = undefined;
            this.startLineNumber = +startLineNumber;
            this.endLineNumber = +endLineNumber;
            this.className = String(className);
            this.zIndex = zIndex ?? 0;
        }
    }
    exports.DecorationToRender = DecorationToRender;
    /**
     * A decoration that should be shown along a line.
     */
    class LineDecorationToRender {
        constructor(className, zIndex) {
            this.className = className;
            this.zIndex = zIndex;
        }
    }
    exports.LineDecorationToRender = LineDecorationToRender;
    /**
     * Decorations to render on a visible line.
     */
    class VisibleLineDecorationsToRender {
        constructor() {
            this.decorations = [];
        }
        add(decoration) {
            this.decorations.push(decoration);
        }
        getDecorations() {
            return this.decorations;
        }
    }
    exports.VisibleLineDecorationsToRender = VisibleLineDecorationsToRender;
    class DedupOverlay extends dynamicViewOverlay_1.DynamicViewOverlay {
        /**
         * Returns an array with an element for each visible line number.
         */
        _render(visibleStartLineNumber, visibleEndLineNumber, decorations) {
            const output = [];
            for (let lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
                const lineIndex = lineNumber - visibleStartLineNumber;
                output[lineIndex] = new VisibleLineDecorationsToRender();
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
                    output[i].add(new LineDecorationToRender(className, zIndex));
                }
            }
            return output;
        }
    }
    exports.DedupOverlay = DedupOverlay;
    class GlyphMarginWidgets extends viewPart_1.ViewPart {
        constructor(context) {
            super(context);
            this._widgets = {};
            this._context = context;
            const options = this._context.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this.domNode = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
            this.domNode.setClassName('glyph-margin-widgets');
            this.domNode.setPosition('absolute');
            this.domNode.setTop(0);
            this._lineHeight = options.get(66 /* EditorOption.lineHeight */);
            this._glyphMargin = options.get(57 /* EditorOption.glyphMargin */);
            this._glyphMarginLeft = layoutInfo.glyphMarginLeft;
            this._glyphMarginWidth = layoutInfo.glyphMarginWidth;
            this._glyphMarginDecorationLaneCount = layoutInfo.glyphMarginDecorationLaneCount;
            this._managedDomNodes = [];
            this._decorationGlyphsToRender = [];
        }
        dispose() {
            this._managedDomNodes = [];
            this._decorationGlyphsToRender = [];
            this._widgets = {};
            super.dispose();
        }
        getWidgets() {
            return Object.values(this._widgets);
        }
        // --- begin event handlers
        onConfigurationChanged(e) {
            const options = this._context.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this._lineHeight = options.get(66 /* EditorOption.lineHeight */);
            this._glyphMargin = options.get(57 /* EditorOption.glyphMargin */);
            this._glyphMarginLeft = layoutInfo.glyphMarginLeft;
            this._glyphMarginWidth = layoutInfo.glyphMarginWidth;
            this._glyphMarginDecorationLaneCount = layoutInfo.glyphMarginDecorationLaneCount;
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
            const domNode = (0, fastDomNode_1.createFastDomNode)(widget.getDomNode());
            this._widgets[widget.getId()] = {
                widget: widget,
                preference: widget.getPosition(),
                domNode: domNode,
                renderInfo: null
            };
            domNode.setPosition('absolute');
            domNode.setDisplay('none');
            domNode.setAttribute('widgetId', widget.getId());
            this.domNode.appendChild(domNode);
            this.setShouldRender();
        }
        setWidgetPosition(widget, preference) {
            const myWidget = this._widgets[widget.getId()];
            if (myWidget.preference.lane === preference.lane
                && myWidget.preference.zIndex === preference.zIndex
                && range_1.Range.equalsRange(myWidget.preference.range, preference.range)) {
                return false;
            }
            myWidget.preference = preference;
            this.setShouldRender();
            return true;
        }
        removeWidget(widget) {
            const widgetId = widget.getId();
            if (this._widgets[widgetId]) {
                const widgetData = this._widgets[widgetId];
                const domNode = widgetData.domNode.domNode;
                delete this._widgets[widgetId];
                domNode.parentNode?.removeChild(domNode);
                this.setShouldRender();
            }
        }
        // --- end widget management
        _collectDecorationBasedGlyphRenderRequest(ctx, requests) {
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
                const lane = Math.min(d.options.glyphMargin?.position ?? 1, this._glyphMarginDecorationLaneCount);
                const zIndex = d.options.zIndex ?? 0;
                for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
                    requests.push(new DecorationBasedGlyphRenderRequest(lineNumber, lane, zIndex, glyphMarginClassName));
                }
            }
        }
        _collectWidgetBasedGlyphRenderRequest(ctx, requests) {
            const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
            const visibleEndLineNumber = ctx.visibleRange.endLineNumber;
            for (const widget of Object.values(this._widgets)) {
                const range = widget.preference.range;
                if (range.endLineNumber < visibleStartLineNumber || range.startLineNumber > visibleEndLineNumber) {
                    // The widget is not in the viewport
                    continue;
                }
                // The widget is in the viewport, find a good line for it
                const widgetLineNumber = Math.max(range.startLineNumber, visibleStartLineNumber);
                const lane = Math.min(widget.preference.lane, this._glyphMarginDecorationLaneCount);
                requests.push(new WidgetBasedGlyphRenderRequest(widgetLineNumber, lane, widget.preference.zIndex, widget));
            }
        }
        _collectSortedGlyphRenderRequests(ctx) {
            const requests = [];
            this._collectDecorationBasedGlyphRenderRequest(ctx, requests);
            this._collectWidgetBasedGlyphRenderRequest(ctx, requests);
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
            if (!this._glyphMargin) {
                this._decorationGlyphsToRender = [];
                return;
            }
            for (const widget of Object.values(this._widgets)) {
                widget.renderInfo = null;
            }
            const requests = new arrays_1.ArrayQueue(this._collectSortedGlyphRenderRequests(ctx));
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
            this._decorationGlyphsToRender = decorationGlyphsToRender;
        }
        render(ctx) {
            if (!this._glyphMargin) {
                for (const widget of Object.values(this._widgets)) {
                    widget.domNode.setDisplay('none');
                }
                while (this._managedDomNodes.length > 0) {
                    const domNode = this._managedDomNodes.pop();
                    domNode?.domNode.remove();
                }
                return;
            }
            const width = (Math.round(this._glyphMarginWidth / this._glyphMarginDecorationLaneCount));
            // Render widgets
            for (const widget of Object.values(this._widgets)) {
                if (!widget.renderInfo) {
                    // this widget is not visible
                    widget.domNode.setDisplay('none');
                }
                else {
                    const top = ctx.viewportData.relativeVerticalOffset[widget.renderInfo.lineNumber - ctx.viewportData.startLineNumber];
                    const left = this._glyphMarginLeft + (widget.renderInfo.lane - 1) * this._lineHeight;
                    widget.domNode.setDisplay('block');
                    widget.domNode.setTop(top);
                    widget.domNode.setLeft(left);
                    widget.domNode.setWidth(width);
                    widget.domNode.setHeight(this._lineHeight);
                }
            }
            // Render decorations, reusing previous dom nodes as possible
            for (let i = 0; i < this._decorationGlyphsToRender.length; i++) {
                const dec = this._decorationGlyphsToRender[i];
                const top = ctx.viewportData.relativeVerticalOffset[dec.lineNumber - ctx.viewportData.startLineNumber];
                const left = this._glyphMarginLeft + (dec.lane - 1) * this._lineHeight;
                let domNode;
                if (i < this._managedDomNodes.length) {
                    domNode = this._managedDomNodes[i];
                }
                else {
                    domNode = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
                    this._managedDomNodes.push(domNode);
                    this.domNode.appendChild(domNode);
                }
                domNode.setClassName(`cgmr codicon ` + dec.combinedClassName);
                domNode.setPosition(`absolute`);
                domNode.setTop(top);
                domNode.setLeft(left);
                domNode.setWidth(width);
                domNode.setHeight(this._lineHeight);
            }
            // remove extra dom nodes
            while (this._managedDomNodes.length > this._decorationGlyphsToRender.length) {
                const domNode = this._managedDomNodes.pop();
                domNode?.domNode.remove();
            }
        }
    }
    exports.GlyphMarginWidgets = GlyphMarginWidgets;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2x5cGhNYXJnaW4uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvYnJvd3Nlci92aWV3UGFydHMvZ2x5cGhNYXJnaW4vZ2x5cGhNYXJnaW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBY2hHOzs7T0FHRztJQUNILE1BQWEsa0JBQWtCO1FBUTlCLFlBQVksZUFBdUIsRUFBRSxhQUFxQixFQUFFLFNBQWlCLEVBQUUsTUFBMEI7WUFQekcsNkJBQXdCLEdBQVMsU0FBUyxDQUFDO1lBUTFDLElBQUksQ0FBQyxlQUFlLEdBQUcsQ0FBQyxlQUFlLENBQUM7WUFDeEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLGFBQWEsQ0FBQztZQUNwQyxJQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNuQyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLENBQUM7UUFDM0IsQ0FBQztLQUNEO0lBZEQsZ0RBY0M7SUFFRDs7T0FFRztJQUNILE1BQWEsc0JBQXNCO1FBQ2xDLFlBQ2lCLFNBQWlCLEVBQ2pCLE1BQWM7WUFEZCxjQUFTLEdBQVQsU0FBUyxDQUFRO1lBQ2pCLFdBQU0sR0FBTixNQUFNLENBQVE7UUFDM0IsQ0FBQztLQUNMO0lBTEQsd0RBS0M7SUFFRDs7T0FFRztJQUNILE1BQWEsOEJBQThCO1FBQTNDO1lBRWtCLGdCQUFXLEdBQTZCLEVBQUUsQ0FBQztRQVM3RCxDQUFDO1FBUE8sR0FBRyxDQUFDLFVBQWtDO1lBQzVDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFFTSxjQUFjO1lBQ3BCLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUN6QixDQUFDO0tBQ0Q7SUFYRCx3RUFXQztJQUVELE1BQXNCLFlBQWEsU0FBUSx1Q0FBa0I7UUFFNUQ7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