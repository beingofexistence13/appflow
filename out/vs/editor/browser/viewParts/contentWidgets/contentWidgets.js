/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/fastDomNode", "vs/editor/browser/view/viewPart"], function (require, exports, dom, fastDomNode_1, viewPart_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ViewContentWidgets = void 0;
    class ViewContentWidgets extends viewPart_1.ViewPart {
        constructor(context, viewDomNode) {
            super(context);
            this._viewDomNode = viewDomNode;
            this._widgets = {};
            this.domNode = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
            viewPart_1.PartFingerprints.write(this.domNode, 1 /* PartFingerprint.ContentWidgets */);
            this.domNode.setClassName('contentWidgets');
            this.domNode.setPosition('absolute');
            this.domNode.setTop(0);
            this.overflowingContentWidgetsDomNode = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
            viewPart_1.PartFingerprints.write(this.overflowingContentWidgetsDomNode, 2 /* PartFingerprint.OverflowingContentWidgets */);
            this.overflowingContentWidgetsDomNode.setClassName('overflowingContentWidgets');
        }
        dispose() {
            super.dispose();
            this._widgets = {};
        }
        // --- begin event handlers
        onConfigurationChanged(e) {
            const keys = Object.keys(this._widgets);
            for (const widgetId of keys) {
                this._widgets[widgetId].onConfigurationChanged(e);
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
            this._updateAnchorsViewPositions();
            return true;
        }
        onLinesChanged(e) {
            this._updateAnchorsViewPositions();
            return true;
        }
        onLinesDeleted(e) {
            this._updateAnchorsViewPositions();
            return true;
        }
        onLinesInserted(e) {
            this._updateAnchorsViewPositions();
            return true;
        }
        onScrollChanged(e) {
            return true;
        }
        onZonesChanged(e) {
            return true;
        }
        // ---- end view event handlers
        _updateAnchorsViewPositions() {
            const keys = Object.keys(this._widgets);
            for (const widgetId of keys) {
                this._widgets[widgetId].updateAnchorViewPosition();
            }
        }
        addWidget(_widget) {
            const myWidget = new Widget(this._context, this._viewDomNode, _widget);
            this._widgets[myWidget.id] = myWidget;
            if (myWidget.allowEditorOverflow) {
                this.overflowingContentWidgetsDomNode.appendChild(myWidget.domNode);
            }
            else {
                this.domNode.appendChild(myWidget.domNode);
            }
            this.setShouldRender();
        }
        setWidgetPosition(widget, primaryAnchor, secondaryAnchor, preference, affinity) {
            const myWidget = this._widgets[widget.getId()];
            myWidget.setPosition(primaryAnchor, secondaryAnchor, preference, affinity);
            this.setShouldRender();
        }
        removeWidget(widget) {
            const widgetId = widget.getId();
            if (this._widgets.hasOwnProperty(widgetId)) {
                const myWidget = this._widgets[widgetId];
                delete this._widgets[widgetId];
                const domNode = myWidget.domNode.domNode;
                domNode.parentNode.removeChild(domNode);
                domNode.removeAttribute('monaco-visible-content-widget');
                this.setShouldRender();
            }
        }
        shouldSuppressMouseDownOnWidget(widgetId) {
            if (this._widgets.hasOwnProperty(widgetId)) {
                return this._widgets[widgetId].suppressMouseDown;
            }
            return false;
        }
        onBeforeRender(viewportData) {
            const keys = Object.keys(this._widgets);
            for (const widgetId of keys) {
                this._widgets[widgetId].onBeforeRender(viewportData);
            }
        }
        prepareRender(ctx) {
            const keys = Object.keys(this._widgets);
            for (const widgetId of keys) {
                this._widgets[widgetId].prepareRender(ctx);
            }
        }
        render(ctx) {
            const keys = Object.keys(this._widgets);
            for (const widgetId of keys) {
                this._widgets[widgetId].render(ctx);
            }
        }
    }
    exports.ViewContentWidgets = ViewContentWidgets;
    class Widget {
        constructor(context, viewDomNode, actual) {
            this._primaryAnchor = new PositionPair(null, null);
            this._secondaryAnchor = new PositionPair(null, null);
            this._context = context;
            this._viewDomNode = viewDomNode;
            this._actual = actual;
            this.domNode = (0, fastDomNode_1.createFastDomNode)(this._actual.getDomNode());
            this.id = this._actual.getId();
            this.allowEditorOverflow = this._actual.allowEditorOverflow || false;
            this.suppressMouseDown = this._actual.suppressMouseDown || false;
            const options = this._context.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this._fixedOverflowWidgets = options.get(42 /* EditorOption.fixedOverflowWidgets */);
            this._contentWidth = layoutInfo.contentWidth;
            this._contentLeft = layoutInfo.contentLeft;
            this._lineHeight = options.get(66 /* EditorOption.lineHeight */);
            this._affinity = null;
            this._preference = [];
            this._cachedDomNodeOffsetWidth = -1;
            this._cachedDomNodeOffsetHeight = -1;
            this._maxWidth = this._getMaxWidth();
            this._isVisible = false;
            this._renderData = null;
            this.domNode.setPosition((this._fixedOverflowWidgets && this.allowEditorOverflow) ? 'fixed' : 'absolute');
            this.domNode.setDisplay('none');
            this.domNode.setVisibility('hidden');
            this.domNode.setAttribute('widgetId', this.id);
            this.domNode.setMaxWidth(this._maxWidth);
        }
        onConfigurationChanged(e) {
            const options = this._context.configuration.options;
            this._lineHeight = options.get(66 /* EditorOption.lineHeight */);
            if (e.hasChanged(143 /* EditorOption.layoutInfo */)) {
                const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
                this._contentLeft = layoutInfo.contentLeft;
                this._contentWidth = layoutInfo.contentWidth;
                this._maxWidth = this._getMaxWidth();
            }
        }
        updateAnchorViewPosition() {
            this._setPosition(this._affinity, this._primaryAnchor.modelPosition, this._secondaryAnchor.modelPosition);
        }
        _setPosition(affinity, primaryAnchor, secondaryAnchor) {
            this._affinity = affinity;
            this._primaryAnchor = getValidPositionPair(primaryAnchor, this._context.viewModel, this._affinity);
            this._secondaryAnchor = getValidPositionPair(secondaryAnchor, this._context.viewModel, this._affinity);
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
        _getMaxWidth() {
            const elDocument = this.domNode.domNode.ownerDocument;
            const elWindow = elDocument.defaultView;
            return (this.allowEditorOverflow
                ? elWindow?.innerWidth || elDocument.documentElement.offsetWidth || elDocument.body.offsetWidth
                : this._contentWidth);
        }
        setPosition(primaryAnchor, secondaryAnchor, preference, affinity) {
            this._setPosition(affinity, primaryAnchor, secondaryAnchor);
            this._preference = preference;
            if (this._primaryAnchor.viewPosition && this._preference && this._preference.length > 0) {
                // this content widget would like to be visible if possible
                // we change it from `display:none` to `display:block` even if it
                // might be outside the viewport such that we can measure its size
                // in `prepareRender`
                this.domNode.setDisplay('block');
            }
            else {
                this.domNode.setDisplay('none');
            }
            this._cachedDomNodeOffsetWidth = -1;
            this._cachedDomNodeOffsetHeight = -1;
        }
        _layoutBoxInViewport(anchor, width, height, ctx) {
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
        _layoutHorizontalSegmentInPage(windowSize, domNodePosition, left, width) {
            // Leave some clearance to the left/right
            const LEFT_PADDING = 15;
            const RIGHT_PADDING = 15;
            // Initially, the limits are defined as the dom node limits
            const MIN_LIMIT = Math.max(LEFT_PADDING, domNodePosition.left - width);
            const MAX_LIMIT = Math.min(domNodePosition.left + domNodePosition.width + width, windowSize.width - RIGHT_PADDING);
            const elDocument = this._viewDomNode.domNode.ownerDocument;
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
        _layoutBoxInPage(anchor, width, height, ctx) {
            const aboveTop = anchor.top - height;
            const belowTop = anchor.top + anchor.height;
            const domNodePosition = dom.getDomNodePagePosition(this._viewDomNode.domNode);
            const elDocument = this._viewDomNode.domNode.ownerDocument;
            const elWindow = elDocument.defaultView;
            const absoluteAboveTop = domNodePosition.top + aboveTop - (elWindow?.scrollY ?? 0);
            const absoluteBelowTop = domNodePosition.top + belowTop - (elWindow?.scrollY ?? 0);
            const windowSize = dom.getClientArea(elDocument.body);
            const [left, absoluteAboveLeft] = this._layoutHorizontalSegmentInPage(windowSize, domNodePosition, anchor.left - ctx.scrollLeft + this._contentLeft, width);
            // Leave some clearance to the top/bottom
            const TOP_PADDING = 22;
            const BOTTOM_PADDING = 22;
            const fitsAbove = (absoluteAboveTop >= TOP_PADDING);
            const fitsBelow = (absoluteBelowTop + height <= windowSize.height - BOTTOM_PADDING);
            if (this._fixedOverflowWidgets) {
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
        _prepareRenderWidgetAtExactPositionOverflowing(topLeft) {
            return new Coordinate(topLeft.top, topLeft.left + this._contentLeft);
        }
        /**
         * Compute the coordinates above and below the primary and secondary anchors.
         * The content widget *must* touch the primary anchor.
         * The content widget should touch if possible the secondary anchor.
         */
        _getAnchorsCoordinates(ctx) {
            const primary = getCoordinates(this._primaryAnchor.viewPosition, this._affinity, this._lineHeight);
            const secondaryViewPosition = (this._secondaryAnchor.viewPosition?.lineNumber === this._primaryAnchor.viewPosition?.lineNumber ? this._secondaryAnchor.viewPosition : null);
            const secondary = getCoordinates(secondaryViewPosition, this._affinity, this._lineHeight);
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
        _reduceAnchorCoordinates(primary, secondary, width) {
            if (!secondary) {
                return primary;
            }
            const fontInfo = this._context.configuration.options.get(50 /* EditorOption.fontInfo */);
            let left = secondary.left;
            if (left < primary.left) {
                left = Math.max(left, primary.left - width + fontInfo.typicalFullwidthCharacterWidth);
            }
            else {
                left = Math.min(left, primary.left + width - fontInfo.typicalFullwidthCharacterWidth);
            }
            return new AnchorCoordinate(primary.top, left, primary.height);
        }
        _prepareRenderWidget(ctx) {
            if (!this._preference || this._preference.length === 0) {
                return null;
            }
            const { primary, secondary } = this._getAnchorsCoordinates(ctx);
            if (!primary) {
                return null;
            }
            if (this._cachedDomNodeOffsetWidth === -1 || this._cachedDomNodeOffsetHeight === -1) {
                let preferredDimensions = null;
                if (typeof this._actual.beforeRender === 'function') {
                    preferredDimensions = safeInvoke(this._actual.beforeRender, this._actual);
                }
                if (preferredDimensions) {
                    this._cachedDomNodeOffsetWidth = preferredDimensions.width;
                    this._cachedDomNodeOffsetHeight = preferredDimensions.height;
                }
                else {
                    const domNode = this.domNode.domNode;
                    const clientRect = domNode.getBoundingClientRect();
                    this._cachedDomNodeOffsetWidth = Math.round(clientRect.width);
                    this._cachedDomNodeOffsetHeight = Math.round(clientRect.height);
                }
            }
            const anchor = this._reduceAnchorCoordinates(primary, secondary, this._cachedDomNodeOffsetWidth);
            let placement;
            if (this.allowEditorOverflow) {
                placement = this._layoutBoxInPage(anchor, this._cachedDomNodeOffsetWidth, this._cachedDomNodeOffsetHeight, ctx);
            }
            else {
                placement = this._layoutBoxInViewport(anchor, this._cachedDomNodeOffsetWidth, this._cachedDomNodeOffsetHeight, ctx);
            }
            // Do two passes, first for perfect fit, second picks first option
            for (let pass = 1; pass <= 2; pass++) {
                for (const pref of this._preference) {
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
                            return { coordinate: this._prepareRenderWidgetAtExactPositionOverflowing(new Coordinate(anchor.top, anchor.left)), position: 0 /* ContentWidgetPositionPreference.EXACT */ };
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
            if (!this._primaryAnchor.viewPosition || !this._preference) {
                return;
            }
            if (this._primaryAnchor.viewPosition.lineNumber < viewportData.startLineNumber || this._primaryAnchor.viewPosition.lineNumber > viewportData.endLineNumber) {
                // Outside of viewport
                return;
            }
            this.domNode.setMaxWidth(this._maxWidth);
        }
        prepareRender(ctx) {
            this._renderData = this._prepareRenderWidget(ctx);
        }
        render(ctx) {
            if (!this._renderData) {
                // This widget should be invisible
                if (this._isVisible) {
                    this.domNode.removeAttribute('monaco-visible-content-widget');
                    this._isVisible = false;
                    this.domNode.setVisibility('hidden');
                }
                if (typeof this._actual.afterRender === 'function') {
                    safeInvoke(this._actual.afterRender, this._actual, null);
                }
                return;
            }
            // This widget should be visible
            if (this.allowEditorOverflow) {
                this.domNode.setTop(this._renderData.coordinate.top);
                this.domNode.setLeft(this._renderData.coordinate.left);
            }
            else {
                this.domNode.setTop(this._renderData.coordinate.top + ctx.scrollTop - ctx.bigNumbersDelta);
                this.domNode.setLeft(this._renderData.coordinate.left);
            }
            if (!this._isVisible) {
                this.domNode.setVisibility('inherit');
                this.domNode.setAttribute('monaco-visible-content-widget', 'true');
                this._isVisible = true;
            }
            if (typeof this._actual.afterRender === 'function') {
                safeInvoke(this._actual.afterRender, this._actual, this._renderData.position);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudFdpZGdldHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvYnJvd3Nlci92aWV3UGFydHMvY29udGVudFdpZGdldHMvY29udGVudFdpZGdldHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZ0JoRyxNQUFhLGtCQUFtQixTQUFRLG1CQUFRO1FBUS9DLFlBQVksT0FBb0IsRUFBRSxXQUFxQztZQUN0RSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDZixJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQztZQUNoQyxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztZQUVuQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUEsK0JBQWlCLEVBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ2hFLDJCQUFnQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyx5Q0FBaUMsQ0FBQztZQUNyRSxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQzVDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXZCLElBQUksQ0FBQyxnQ0FBZ0MsR0FBRyxJQUFBLCtCQUFpQixFQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUN6RiwyQkFBZ0IsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGdDQUFnQyxvREFBNEMsQ0FBQztZQUN6RyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsWUFBWSxDQUFDLDJCQUEyQixDQUFDLENBQUM7UUFDakYsQ0FBQztRQUVlLE9BQU87WUFDdEIsS0FBSyxDQUFDLE9BQU8sRUFBRSxD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