/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/fastDomNode", "vs/base/common/errors", "vs/editor/browser/view/viewPart", "vs/editor/common/core/position"], function (require, exports, fastDomNode_1, errors_1, viewPart_1, position_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ViewZones = void 0;
    const invalidFunc = () => { throw new Error(`Invalid change accessor`); };
    class ViewZones extends viewPart_1.ViewPart {
        constructor(context) {
            super(context);
            const options = this._context.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this._lineHeight = options.get(66 /* EditorOption.lineHeight */);
            this._contentWidth = layoutInfo.contentWidth;
            this._contentLeft = layoutInfo.contentLeft;
            this.domNode = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
            this.domNode.setClassName('view-zones');
            this.domNode.setPosition('absolute');
            this.domNode.setAttribute('role', 'presentation');
            this.domNode.setAttribute('aria-hidden', 'true');
            this.marginDomNode = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
            this.marginDomNode.setClassName('margin-view-zones');
            this.marginDomNode.setPosition('absolute');
            this.marginDomNode.setAttribute('role', 'presentation');
            this.marginDomNode.setAttribute('aria-hidden', 'true');
            this._zones = {};
        }
        dispose() {
            super.dispose();
            this._zones = {};
        }
        // ---- begin view event handlers
        _recomputeWhitespacesProps() {
            const whitespaces = this._context.viewLayout.getWhitespaces();
            const oldWhitespaces = new Map();
            for (const whitespace of whitespaces) {
                oldWhitespaces.set(whitespace.id, whitespace);
            }
            let hadAChange = false;
            this._context.viewModel.changeWhitespace((whitespaceAccessor) => {
                const keys = Object.keys(this._zones);
                for (let i = 0, len = keys.length; i < len; i++) {
                    const id = keys[i];
                    const zone = this._zones[id];
                    const props = this._computeWhitespaceProps(zone.delegate);
                    zone.isInHiddenArea = props.isInHiddenArea;
                    const oldWhitespace = oldWhitespaces.get(id);
                    if (oldWhitespace && (oldWhitespace.afterLineNumber !== props.afterViewLineNumber || oldWhitespace.height !== props.heightInPx)) {
                        whitespaceAccessor.changeOneWhitespace(id, props.afterViewLineNumber, props.heightInPx);
                        this._safeCallOnComputedHeight(zone.delegate, props.heightInPx);
                        hadAChange = true;
                    }
                }
            });
            return hadAChange;
        }
        onConfigurationChanged(e) {
            const options = this._context.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this._lineHeight = options.get(66 /* EditorOption.lineHeight */);
            this._contentWidth = layoutInfo.contentWidth;
            this._contentLeft = layoutInfo.contentLeft;
            if (e.hasChanged(66 /* EditorOption.lineHeight */)) {
                this._recomputeWhitespacesProps();
            }
            return true;
        }
        onLineMappingChanged(e) {
            return this._recomputeWhitespacesProps();
        }
        onLinesDeleted(e) {
            return true;
        }
        onScrollChanged(e) {
            return e.scrollTopChanged || e.scrollWidthChanged;
        }
        onZonesChanged(e) {
            return true;
        }
        onLinesInserted(e) {
            return true;
        }
        // ---- end view event handlers
        _getZoneOrdinal(zone) {
            return zone.ordinal ?? zone.afterColumn ?? 10000;
        }
        _computeWhitespaceProps(zone) {
            if (zone.afterLineNumber === 0) {
                return {
                    isInHiddenArea: false,
                    afterViewLineNumber: 0,
                    heightInPx: this._heightInPixels(zone),
                    minWidthInPx: this._minWidthInPixels(zone)
                };
            }
            let zoneAfterModelPosition;
            if (typeof zone.afterColumn !== 'undefined') {
                zoneAfterModelPosition = this._context.viewModel.model.validatePosition({
                    lineNumber: zone.afterLineNumber,
                    column: zone.afterColumn
                });
            }
            else {
                const validAfterLineNumber = this._context.viewModel.model.validatePosition({
                    lineNumber: zone.afterLineNumber,
                    column: 1
                }).lineNumber;
                zoneAfterModelPosition = new position_1.Position(validAfterLineNumber, this._context.viewModel.model.getLineMaxColumn(validAfterLineNumber));
            }
            let zoneBeforeModelPosition;
            if (zoneAfterModelPosition.column === this._context.viewModel.model.getLineMaxColumn(zoneAfterModelPosition.lineNumber)) {
                zoneBeforeModelPosition = this._context.viewModel.model.validatePosition({
                    lineNumber: zoneAfterModelPosition.lineNumber + 1,
                    column: 1
                });
            }
            else {
                zoneBeforeModelPosition = this._context.viewModel.model.validatePosition({
                    lineNumber: zoneAfterModelPosition.lineNumber,
                    column: zoneAfterModelPosition.column + 1
                });
            }
            const viewPosition = this._context.viewModel.coordinatesConverter.convertModelPositionToViewPosition(zoneAfterModelPosition, zone.afterColumnAffinity, true);
            const isVisible = zone.showInHiddenAreas || this._context.viewModel.coordinatesConverter.modelPositionIsVisible(zoneBeforeModelPosition);
            return {
                isInHiddenArea: !isVisible,
                afterViewLineNumber: viewPosition.lineNumber,
                heightInPx: (isVisible ? this._heightInPixels(zone) : 0),
                minWidthInPx: this._minWidthInPixels(zone)
            };
        }
        changeViewZones(callback) {
            let zonesHaveChanged = false;
            this._context.viewModel.changeWhitespace((whitespaceAccessor) => {
                const changeAccessor = {
                    addZone: (zone) => {
                        zonesHaveChanged = true;
                        return this._addZone(whitespaceAccessor, zone);
                    },
                    removeZone: (id) => {
                        if (!id) {
                            return;
                        }
                        zonesHaveChanged = this._removeZone(whitespaceAccessor, id) || zonesHaveChanged;
                    },
                    layoutZone: (id) => {
                        if (!id) {
                            return;
                        }
                        zonesHaveChanged = this._layoutZone(whitespaceAccessor, id) || zonesHaveChanged;
                    }
                };
                safeInvoke1Arg(callback, changeAccessor);
                // Invalidate changeAccessor
                changeAccessor.addZone = invalidFunc;
                changeAccessor.removeZone = invalidFunc;
                changeAccessor.layoutZone = invalidFunc;
            });
            return zonesHaveChanged;
        }
        _addZone(whitespaceAccessor, zone) {
            const props = this._computeWhitespaceProps(zone);
            const whitespaceId = whitespaceAccessor.insertWhitespace(props.afterViewLineNumber, this._getZoneOrdinal(zone), props.heightInPx, props.minWidthInPx);
            const myZone = {
                whitespaceId: whitespaceId,
                delegate: zone,
                isInHiddenArea: props.isInHiddenArea,
                isVisible: false,
                domNode: (0, fastDomNode_1.createFastDomNode)(zone.domNode),
                marginDomNode: zone.marginDomNode ? (0, fastDomNode_1.createFastDomNode)(zone.marginDomNode) : null
            };
            this._safeCallOnComputedHeight(myZone.delegate, props.heightInPx);
            myZone.domNode.setPosition('absolute');
            myZone.domNode.domNode.style.width = '100%';
            myZone.domNode.setDisplay('none');
            myZone.domNode.setAttribute('monaco-view-zone', myZone.whitespaceId);
            this.domNode.appendChild(myZone.domNode);
            if (myZone.marginDomNode) {
                myZone.marginDomNode.setPosition('absolute');
                myZone.marginDomNode.domNode.style.width = '100%';
                myZone.marginDomNode.setDisplay('none');
                myZone.marginDomNode.setAttribute('monaco-view-zone', myZone.whitespaceId);
                this.marginDomNode.appendChild(myZone.marginDomNode);
            }
            this._zones[myZone.whitespaceId] = myZone;
            this.setShouldRender();
            return myZone.whitespaceId;
        }
        _removeZone(whitespaceAccessor, id) {
            if (this._zones.hasOwnProperty(id)) {
                const zone = this._zones[id];
                delete this._zones[id];
                whitespaceAccessor.removeWhitespace(zone.whitespaceId);
                zone.domNode.removeAttribute('monaco-visible-view-zone');
                zone.domNode.removeAttribute('monaco-view-zone');
                zone.domNode.domNode.parentNode.removeChild(zone.domNode.domNode);
                if (zone.marginDomNode) {
                    zone.marginDomNode.removeAttribute('monaco-visible-view-zone');
                    zone.marginDomNode.removeAttribute('monaco-view-zone');
                    zone.marginDomNode.domNode.parentNode.removeChild(zone.marginDomNode.domNode);
                }
                this.setShouldRender();
                return true;
            }
            return false;
        }
        _layoutZone(whitespaceAccessor, id) {
            if (this._zones.hasOwnProperty(id)) {
                const zone = this._zones[id];
                const props = this._computeWhitespaceProps(zone.delegate);
                zone.isInHiddenArea = props.isInHiddenArea;
                // const newOrdinal = this._getZoneOrdinal(zone.delegate);
                whitespaceAccessor.changeOneWhitespace(zone.whitespaceId, props.afterViewLineNumber, props.heightInPx);
                // TODO@Alex: change `newOrdinal` too
                this._safeCallOnComputedHeight(zone.delegate, props.heightInPx);
                this.setShouldRender();
                return true;
            }
            return false;
        }
        shouldSuppressMouseDownOnViewZone(id) {
            if (this._zones.hasOwnProperty(id)) {
                const zone = this._zones[id];
                return Boolean(zone.delegate.suppressMouseDown);
            }
            return false;
        }
        _heightInPixels(zone) {
            if (typeof zone.heightInPx === 'number') {
                return zone.heightInPx;
            }
            if (typeof zone.heightInLines === 'number') {
                return this._lineHeight * zone.heightInLines;
            }
            return this._lineHeight;
        }
        _minWidthInPixels(zone) {
            if (typeof zone.minWidthInPx === 'number') {
                return zone.minWidthInPx;
            }
            return 0;
        }
        _safeCallOnComputedHeight(zone, height) {
            if (typeof zone.onComputedHeight === 'function') {
                try {
                    zone.onComputedHeight(height);
                }
                catch (e) {
                    (0, errors_1.onUnexpectedError)(e);
                }
            }
        }
        _safeCallOnDomNodeTop(zone, top) {
            if (typeof zone.onDomNodeTop === 'function') {
                try {
                    zone.onDomNodeTop(top);
                }
                catch (e) {
                    (0, errors_1.onUnexpectedError)(e);
                }
            }
        }
        prepareRender(ctx) {
            // Nothing to read
        }
        render(ctx) {
            const visibleWhitespaces = ctx.viewportData.whitespaceViewportData;
            const visibleZones = {};
            let hasVisibleZone = false;
            for (const visibleWhitespace of visibleWhitespaces) {
                if (this._zones[visibleWhitespace.id].isInHiddenArea) {
                    continue;
                }
                visibleZones[visibleWhitespace.id] = visibleWhitespace;
                hasVisibleZone = true;
            }
            const keys = Object.keys(this._zones);
            for (let i = 0, len = keys.length; i < len; i++) {
                const id = keys[i];
                const zone = this._zones[id];
                let newTop = 0;
                let newHeight = 0;
                let newDisplay = 'none';
                if (visibleZones.hasOwnProperty(id)) {
                    newTop = visibleZones[id].verticalOffset - ctx.bigNumbersDelta;
                    newHeight = visibleZones[id].height;
                    newDisplay = 'block';
                    // zone is visible
                    if (!zone.isVisible) {
                        zone.domNode.setAttribute('monaco-visible-view-zone', 'true');
                        zone.isVisible = true;
                    }
                    this._safeCallOnDomNodeTop(zone.delegate, ctx.getScrolledTopFromAbsoluteTop(visibleZones[id].verticalOffset));
                }
                else {
                    if (zone.isVisible) {
                        zone.domNode.removeAttribute('monaco-visible-view-zone');
                        zone.isVisible = false;
                    }
                    this._safeCallOnDomNodeTop(zone.delegate, ctx.getScrolledTopFromAbsoluteTop(-1000000));
                }
                zone.domNode.setTop(newTop);
                zone.domNode.setHeight(newHeight);
                zone.domNode.setDisplay(newDisplay);
                if (zone.marginDomNode) {
                    zone.marginDomNode.setTop(newTop);
                    zone.marginDomNode.setHeight(newHeight);
                    zone.marginDomNode.setDisplay(newDisplay);
                }
            }
            if (hasVisibleZone) {
                this.domNode.setWidth(Math.max(ctx.scrollWidth, this._contentWidth));
                this.marginDomNode.setWidth(this._contentLeft);
            }
        }
    }
    exports.ViewZones = ViewZones;
    function safeInvoke1Arg(func, arg1) {
        try {
            return func(arg1);
        }
        catch (e) {
            (0, errors_1.onUnexpectedError)(e);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld1pvbmVzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2Jyb3dzZXIvdmlld1BhcnRzL3ZpZXdab25lcy92aWV3Wm9uZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBNkJoRyxNQUFNLFdBQVcsR0FBRyxHQUFHLEVBQUUsR0FBRyxNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFMUUsTUFBYSxTQUFVLFNBQVEsbUJBQVE7UUFXdEMsWUFBWSxPQUFvQjtZQUMvQixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDZixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUM7WUFDcEQsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLEdBQUcsbUNBQXlCLENBQUM7WUFFeEQsSUFBSSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsR0FBRyxrQ0FBeUIsQ0FBQztZQUN4RCxJQUFJLENBQUMsYUFBYSxHQUFHLFVBQVUsQ0FBQyxZQUFZLENBQUM7WUFDN0MsSUFBSSxDQUFDLFlBQVksR0FBRyxVQUFVLENBQUMsV0FBVyxDQUFDO1lBRTNDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBQSwrQkFBaUIsRUFBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDaEUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDeEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDckMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ2xELElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxNQUFN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