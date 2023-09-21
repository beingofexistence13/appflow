/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/fastDomNode", "vs/editor/browser/view/viewPart"], function (require, exports, dom, fastDomNode_1, viewPart_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$mX = void 0;
    class $mX extends viewPart_1.$FW {
        constructor(context, viewDomNode) {
            super(context);
            this.a = viewDomNode;
            this.b = {};
            this.domNode = (0, fastDomNode_1.$GP)(document.createElement('div'));
            viewPart_1.$GW.write(this.domNode, 1 /* PartFingerprint.ContentWidgets */);
            this.domNode.setClassName('contentWidgets');
            this.domNode.setPosition('absolute');
            this.domNode.setTop(0);
            this.overflowingContentWidgetsDomNode = (0, fastDomNode_1.$GP)(document.createElement('div'));
            viewPart_1.$GW.write(this.overflowingContentWidgetsDomNode, 2 /* PartFingerprint.OverflowingContentWidgets */);
            this.overflowingContentWidgetsDomNode.setClassName('overflowingContentWidgets');
        }
        dispose() {
            super.dispose();
            this.b = {};
        }
        // --- begin event handlers
        onConfigurationChanged(e) {
            const keys = Object.keys(this.b);
            for (const widgetId of keys) {
                this.b[widgetId].onConfigurationChanged(e);
            }
            return true;
        }
        onDecorationsChanged(e) {
            // true for inline decorations that can end up relayouting text
            return true;
        }
        onFlushed(e) {
            return true;
        }
        onLineMappingChanged(e) {
            this.c();
            return true;
        }
        onLinesChanged(e) {
            this.c();
            return true;
        }
        onLinesDeleted(e) {
            this.c();
            return true;
        }
        onLinesInserted(e) {
            this.c();
            return true;
        }
        onScrollChanged(e) {
            return true;
        }
        onZonesChanged(e) {
            return true;
        }
        // ---- end view event handlers
        c() {
            const keys = Object.keys(this.b);
            for (const widgetId of keys) {
                this.b[widgetId].updateAnchorViewPosition();
            }
        }
        addWidget(_widget) {
            const myWidget = new Widget(this._context, this.a, _widget);
            this.b[myWidget.id] = myWidget;
            if (myWidget.allowEditorOverflow) {
                this.overflowingContentWidgetsDomNode.appendChild(myWidget.domNode);
            }
            else {
                this.domNode.appendChild(myWidget.domNode);
            }
            this.h();
        }
        setWidgetPosition(widget, primaryAnchor, secondaryAnchor, preference, affinity) {
            const myWidget = this.b[widget.getId()];
            myWidget.setPosition(primaryAnchor, secondaryAnchor, preference, affinity);
            this.h();
        }
        removeWidget(widget) {
            const widgetId = widget.getId();
            if (this.b.hasOwnProperty(widgetId)) {
                const myWidget = this.b[widgetId];
                delete this.b[widgetId];
                const domNode = myWidget.domNode.domNode;
                domNode.parentNode.removeChild(domNode);
                domNode.removeAttribute('monaco-visible-content-widget');
                this.h();
            }
        }
        shouldSuppressMouseDownOnWidget(widgetId) {
            if (this.b.hasOwnProperty(widgetId)) {
                return this.b[widgetId].suppressMouseDown;
            }
            return false;
        }
        onBeforeRender(viewportData) {
            const keys = Object.keys(this.b);
            for (const widgetId of keys) {
                this.b[widgetId].onBeforeRender(viewportData);
            }
        }
        prepareRender(ctx) {
            const keys = Object.keys(this.b);
            for (const widgetId of keys) {
                this.b[widgetId].prepareRender(ctx);
            }
        }
        render(ctx) {
            const keys = Object.keys(this.b);
            for (const widgetId of keys) {
                this.b[widgetId].render(ctx);
            }
        }
    }
    exports.$mX = $mX;
    class Widget {
        constructor(context, viewDomNode, actual) {
            this.i = new PositionPair(null, null);
            this.j = new PositionPair(null, null);
            this.a = context;
            this.b = viewDomNode;
            this.c = actual;
            this.domNode = (0, fastDomNode_1.$GP)(this.c.getDomNode());
            this.id = this.c.getId();
            this.allowEditorOverflow = this.c.allowEditorOverflow || false;
            this.suppressMouseDown = this.c.suppressMouseDown || false;
            const options = this.a.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this.d = options.get(42 /* EditorOption.fixedOverflowWidgets */);
            this.f = layoutInfo.contentWidth;
            this.g = layoutInfo.contentLeft;
            this.h = options.get(66 /* EditorOption.lineHeight */);
            this.k = null;
            this.l = [];
            this.m = -1;
            this.n = -1;
            this.o = this.s();
            this.p = false;
            this.q = null;
            this.domNode.setPosition((this.d && this.allowEditorOverflow) ? 'fixed' : 'absolute');
            this.domNode.setDisplay('none');
            this.domNode.setVisibility('hidden');
            this.domNode.setAttribute('widgetId', this.id);
            this.domNode.setMaxWidth(this.o);
        }
        onConfigurationChanged(e) {
            const options = this.a.configuration.options;
            this.h = options.get(66 /* EditorOption.lineHeight */);
            if (e.hasChanged(143 /* EditorOption.layoutInfo */)) {
                const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
                this.g = layoutInfo.contentLeft;
                this.f = layoutInfo.contentWidth;
                this.o = this.s();
            }
        }
        updateAnchorViewPosition() {
            this.r(this.k, this.i.modelPosition, this.j.modelPosition);
        }
        r(affinity, primaryAnchor, secondaryAnchor) {
            this.k = affinity;
            this.i = getValidPositionPair(primaryAnchor, this.a.viewModel, this.k);
            this.j = getValidPositionPair(secondaryAnchor, this.a.viewModel, this.k);
            function getValidPositionPair(position, viewModel, affinity) {
                if (!position) {
                    return new PositionPair(null, null);
                }
                // Do not trust that widgets give a valid position
                const validModelPosition = viewModel.model.validatePosition(position);
                if (viewModel.coordinatesConverter.modelPositionIsVisible(validModelPosition)) {
                    const viewPosition = viewModel.coordinatesConverter.convertModelPositionToViewPosition(validModelPosition, affinity ?? undefined);
                    return new PositionPair(position, viewPosition);
                }
                return new PositionPair(position, null);
            }
        }
        s() {
            const elDocument = this.domNode.domNode.ownerDocument;
            const elWindow = elDocument.defaultView;
            return (this.allowEditorOverflow
                ? elWindow?.innerWidth || elDocument.documentElement.offsetWidth || elDocument.body.offsetWidth
                : this.f);
        }
        setPosition(primaryAnchor, secondaryAnchor, preference, affinity) {
            this.r(affinity, primaryAnchor, secondaryAnchor);
            this.l = preference;
            if (this.i.viewPosition && this.l && this.l.length > 0) {
                // this content widget would like to be visible if possible
                // we change it from `display:none` to `display:block` even if it
                // might be outside the viewport such that we can measure its size
                // in `prepareRender`
                this.domNode.setDisplay('block');
            }
            else {
                this.domNode.setDisplay('none');
            }
            this.m = -1;
            this.n = -1;
        }
        t(anchor, width, height, ctx) {
            // Our visible box is split horizontally by the current line => 2 boxes
            // a) the box above the line
            const aboveLineTop = anchor.top;
            const heightAvailableAboveLine = aboveLineTop;
            // b) the box under the line
            const underLineTop = anchor.top + anchor.height;
            const heightAvailableUnderLine = ctx.viewportHeight - underLineTop;
            const aboveTop = aboveLineTop - height;
            const fitsAbove = (heightAvailableAboveLine >= height);
            const belowTop = underLineTop;
            const fitsBelow = (heightAvailableUnderLine >= height);
            // And its left
            let left = anchor.left;
            if (left + width > ctx.scrollLeft + ctx.viewportWidth) {
                left = ctx.scrollLeft + ctx.viewportWidth - width;
            }
            if (left < ctx.scrollLeft) {
                left = ctx.scrollLeft;
            }
            return { fitsAbove, aboveTop, fitsBelow, belowTop, left };
        }
        u(windowSize, domNodePosition, left, width) {
            // Leave some clearance to the left/right
            const LEFT_PADDING = 15;
            const RIGHT_PADDING = 15;
            // Initially, the limits are defined as the dom node limits
            const MIN_LIMIT = Math.max(LEFT_PADDING, domNodePosition.left - width);
            const MAX_LIMIT = Math.min(domNodePosition.left + domNodePosition.width + width, windowSize.width - RIGHT_PADDING);
            const elDocument = this.b.domNode.ownerDocument;
            const elWindow = elDocument.defaultView;
            let absoluteLeft = domNodePosition.left + left - (elWindow?.scrollX ?? 0);
            if (absoluteLeft + width > MAX_LIMIT) {
                const delta = absoluteLeft - (MAX_LIMIT - width);
                absoluteLeft -= delta;
                left -= delta;
            }
            if (absoluteLeft < MIN_LIMIT) {
                const delta = absoluteLeft - MIN_LIMIT;
                absoluteLeft -= delta;
                left -= delta;
            }
            return [left, absoluteLeft];
        }
        v(anchor, width, height, ctx) {
            const aboveTop = anchor.top - height;
            const belowTop = anchor.top + anchor.height;
            const domNodePosition = dom.$FO(this.b.domNode);
            const elDocument = this.b.domNode.ownerDocument;
            const elWindow = elDocument.defaultView;
            const absoluteAboveTop = domNodePosition.top + aboveTop - (elWindow?.scrollY ?? 0);
            const absoluteBelowTop = domNodePosition.top + belowTop - (elWindow?.scrollY ?? 0);
            const windowSize = dom.$AO(elDocument.body);
            const [left, absoluteAboveLeft] = this.u(windowSize, domNodePosition, anchor.left - ctx.scrollLeft + this.g, width);
            // Leave some clearance to the top/bottom
            const TOP_PADDING = 22;
            const BOTTOM_PADDING = 22;
            const fitsAbove = (absoluteAboveTop >= TOP_PADDING);
            const fitsBelow = (absoluteBelowTop + height <= windowSize.height - BOTTOM_PADDING);
            if (this.d) {
                return {
                    fitsAbove,
                    aboveTop: Math.max(absoluteAboveTop, TOP_PADDING),
                    fitsBelow,
                    belowTop: absoluteBelowTop,
                    left: absoluteAboveLeft
                };
            }
            return { fitsAbove, aboveTop, fitsBelow, belowTop, left };
        }
        w(topLeft) {
            return new Coordinate(topLeft.top, topLeft.left + this.g);
        }
        /**
         * Compute the coordinates above and below the primary and secondary anchors.
         * The content widget *must* touch the primary anchor.
         * The content widget should touch if possible the secondary anchor.
         */
        x(ctx) {
            const primary = getCoordinates(this.i.viewPosition, this.k, this.h);
            const secondaryViewPosition = (this.j.viewPosition?.lineNumber === this.i.viewPosition?.lineNumber ? this.j.viewPosition : null);
            const secondary = getCoordinates(secondaryViewPosition, this.k, this.h);
            return { primary, secondary };
            function getCoordinates(position, affinity, lineHeight) {
                if (!position) {
                    return null;
                }
                const horizontalPosition = ctx.visibleRangeForPosition(position);
                if (!horizontalPosition) {
                    return null;
                }
                // Left-align widgets that should appear :before content
                const left = (position.column === 1 && affinity === 3 /* PositionAffinity.LeftOfInjectedText */ ? 0 : horizontalPosition.left);
                const top = ctx.getVerticalOffsetForLineNumber(position.lineNumber) - ctx.scrollTop;
                return new AnchorCoordinate(top, left, lineHeight);
            }
        }
        y(primary, secondary, width) {
            if (!secondary) {
                return primary;
            }
            const fontInfo = this.a.configuration.options.get(50 /* EditorOption.fontInfo */);
            let left = secondary.left;
            if (left < primary.left) {
                left = Math.max(left, primary.left - width + fontInfo.typicalFullwidthCharacterWidth);
            }
            else {
                left = Math.min(left, primary.left + width - fontInfo.typicalFullwidthCharacterWidth);
            }
            return new AnchorCoordinate(primary.top, left, primary.height);
        }
        z(ctx) {
            if (!this.l || this.l.length === 0) {
                return null;
            }
            const { primary, secondary } = this.x(ctx);
            if (!primary) {
                return null;
            }
            if (this.m === -1 || this.n === -1) {
                let preferredDimensions = null;
                if (typeof this.c.beforeRender === 'function') {
                    preferredDimensions = safeInvoke(this.c.beforeRender, this.c);
                }
                if (preferredDimensions) {
                    this.m = preferredDimensions.width;
                    this.n = preferredDimensions.height;
                }
                else {
                    const domNode = this.domNode.domNode;
                    const clientRect = domNode.getBoundingClientRect();
                    this.m = Math.round(clientRect.width);
                    this.n = Math.round(clientRect.height);
                }
            }
            const anchor = this.y(primary, secondary, this.m);
            let placement;
            if (this.allowEditorOverflow) {
                placement = this.v(anchor, this.m, this.n, ctx);
            }
            else {
                placement = this.t(anchor, this.m, this.n, ctx);
            }
            // Do two passes, first for perfect fit, second picks first option
            for (let pass = 1; pass <= 2; pass++) {
                for (const pref of this.l) {
                    // placement
                    if (pref === 1 /* ContentWidgetPositionPreference.ABOVE */) {
                        if (!placement) {
                            // Widget outside of viewport
                            return null;
                        }
                        if (pass === 2 || placement.fitsAbove) {
                            return { coordinate: new Coordinate(placement.aboveTop, placement.left), position: 1 /* ContentWidgetPositionPreference.ABOVE */ };
                        }
                    }
                    else if (pref === 2 /* ContentWidgetPositionPreference.BELOW */) {
                        if (!placement) {
                            // Widget outside of viewport
                            return null;
                        }
                        if (pass === 2 || placement.fitsBelow) {
                            return { coordinate: new Coordinate(placement.belowTop, placement.left), position: 2 /* ContentWidgetPositionPreference.BELOW */ };
                        }
                    }
                    else {
                        if (this.allowEditorOverflow) {
                            return { coordinate: this.w(new Coordinate(anchor.top, anchor.left)), position: 0 /* ContentWidgetPositionPreference.EXACT */ };
                        }
                        else {
                            return { coordinate: new Coordinate(anchor.top, anchor.left), position: 0 /* ContentWidgetPositionPreference.EXACT */ };
                        }
                    }
                }
            }
            return null;
        }
        /**
         * On this first pass, we ensure that the content widget (if it is in the viewport) has the max width set correctly.
         */
        onBeforeRender(viewportData) {
            if (!this.i.viewPosition || !this.l) {
                return;
            }
            if (this.i.viewPosition.lineNumber < viewportData.startLineNumber || this.i.viewPosition.lineNumber > viewportData.endLineNumber) {
                // Outside of viewport
                return;
            }
            this.domNode.setMaxWidth(this.o);
        }
        prepareRender(ctx) {
            this.q = this.z(ctx);
        }
        render(ctx) {
            if (!this.q) {
                // This widget should be invisible
                if (this.p) {
                    this.domNode.removeAttribute('monaco-visible-content-widget');
                    this.p = false;
                    this.domNode.setVisibility('hidden');
                }
                if (typeof this.c.afterRender === 'function') {
                    safeInvoke(this.c.afterRender, this.c, null);
                }
                return;
            }
            // This widget should be visible
            if (this.allowEditorOverflow) {
                this.domNode.setTop(this.q.coordinate.top);
                this.domNode.setLeft(this.q.coordinate.left);
            }
            else {
                this.domNode.setTop(this.q.coordinate.top + ctx.scrollTop - ctx.bigNumbersDelta);
                this.domNode.setLeft(this.q.coordinate.left);
            }
            if (!this.p) {
                this.domNode.setVisibility('inherit');
                this.domNode.setAttribute('monaco-visible-content-widget', 'true');
                this.p = true;
            }
            if (typeof this.c.afterRender === 'function') {
                safeInvoke(this.c.afterRender, this.c, this.q.position);
            }
        }
    }
    class PositionPair {
        constructor(modelPosition, viewPosition) {
            this.modelPosition = modelPosition;
            this.viewPosition = viewPosition;
        }
    }
    class Coordinate {
        constructor(top, left) {
            this.top = top;
            this.left = left;
            this._coordinateBrand = undefined;
        }
    }
    class AnchorCoordinate {
        constructor(top, left, height) {
            this.top = top;
            this.left = left;
            this.height = height;
            this._anchorCoordinateBrand = undefined;
        }
    }
    function safeInvoke(fn, thisArg, ...args) {
        try {
            return fn.call(thisArg, ...args);
        }
        catch {
            // ignore
            return null;
        }
    }
});
//# sourceMappingURL=contentWidgets.js.map