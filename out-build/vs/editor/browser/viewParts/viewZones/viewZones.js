/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/fastDomNode", "vs/base/common/errors", "vs/editor/browser/view/viewPart", "vs/editor/common/core/position"], function (require, exports, fastDomNode_1, errors_1, viewPart_1, position_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$QX = void 0;
    const invalidFunc = () => { throw new Error(`Invalid change accessor`); };
    class $QX extends viewPart_1.$FW {
        constructor(context) {
            super(context);
            const options = this._context.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this.b = options.get(66 /* EditorOption.lineHeight */);
            this.c = layoutInfo.contentWidth;
            this.g = layoutInfo.contentLeft;
            this.domNode = (0, fastDomNode_1.$GP)(document.createElement('div'));
            this.domNode.setClassName('view-zones');
            this.domNode.setPosition('absolute');
            this.domNode.setAttribute('role', 'presentation');
            this.domNode.setAttribute('aria-hidden', 'true');
            this.marginDomNode = (0, fastDomNode_1.$GP)(document.createElement('div'));
            this.marginDomNode.setClassName('margin-view-zones');
            this.marginDomNode.setPosition('absolute');
            this.marginDomNode.setAttribute('role', 'presentation');
            this.marginDomNode.setAttribute('aria-hidden', 'true');
            this.a = {};
        }
        dispose() {
            super.dispose();
            this.a = {};
        }
        // ---- begin view event handlers
        j() {
            const whitespaces = this._context.viewLayout.getWhitespaces();
            const oldWhitespaces = new Map();
            for (const whitespace of whitespaces) {
                oldWhitespaces.set(whitespace.id, whitespace);
            }
            let hadAChange = false;
            this._context.viewModel.changeWhitespace((whitespaceAccessor) => {
                const keys = Object.keys(this.a);
                for (let i = 0, len = keys.length; i < len; i++) {
                    const id = keys[i];
                    const zone = this.a[id];
                    const props = this.n(zone.delegate);
                    zone.isInHiddenArea = props.isInHiddenArea;
                    const oldWhitespace = oldWhitespaces.get(id);
                    if (oldWhitespace && (oldWhitespace.afterLineNumber !== props.afterViewLineNumber || oldWhitespace.height !== props.heightInPx)) {
                        whitespaceAccessor.changeOneWhitespace(id, props.afterViewLineNumber, props.heightInPx);
                        this.z(zone.delegate, props.heightInPx);
                        hadAChange = true;
                    }
                }
            });
            return hadAChange;
        }
        onConfigurationChanged(e) {
            const options = this._context.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this.b = options.get(66 /* EditorOption.lineHeight */);
            this.c = layoutInfo.contentWidth;
            this.g = layoutInfo.contentLeft;
            if (e.hasChanged(66 /* EditorOption.lineHeight */)) {
                this.j();
            }
            return true;
        }
        onLineMappingChanged(e) {
            return this.j();
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
        m(zone) {
            return zone.ordinal ?? zone.afterColumn ?? 10000;
        }
        n(zone) {
            if (zone.afterLineNumber === 0) {
                return {
                    isInHiddenArea: false,
                    afterViewLineNumber: 0,
                    heightInPx: this.w(zone),
                    minWidthInPx: this.y(zone)
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
                zoneAfterModelPosition = new position_1.$js(validAfterLineNumber, this._context.viewModel.model.getLineMaxColumn(validAfterLineNumber));
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
                heightInPx: (isVisible ? this.w(zone) : 0),
                minWidthInPx: this.y(zone)
            };
        }
        changeViewZones(callback) {
            let zonesHaveChanged = false;
            this._context.viewModel.changeWhitespace((whitespaceAccessor) => {
                const changeAccessor = {
                    addZone: (zone) => {
                        zonesHaveChanged = true;
                        return this.s(whitespaceAccessor, zone);
                    },
                    removeZone: (id) => {
                        if (!id) {
                            return;
                        }
                        zonesHaveChanged = this.t(whitespaceAccessor, id) || zonesHaveChanged;
                    },
                    layoutZone: (id) => {
                        if (!id) {
                            return;
                        }
                        zonesHaveChanged = this.u(whitespaceAccessor, id) || zonesHaveChanged;
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
        s(whitespaceAccessor, zone) {
            const props = this.n(zone);
            const whitespaceId = whitespaceAccessor.insertWhitespace(props.afterViewLineNumber, this.m(zone), props.heightInPx, props.minWidthInPx);
            const myZone = {
                whitespaceId: whitespaceId,
                delegate: zone,
                isInHiddenArea: props.isInHiddenArea,
                isVisible: false,
                domNode: (0, fastDomNode_1.$GP)(zone.domNode),
                marginDomNode: zone.marginDomNode ? (0, fastDomNode_1.$GP)(zone.marginDomNode) : null
            };
            this.z(myZone.delegate, props.heightInPx);
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
            this.a[myZone.whitespaceId] = myZone;
            this.h();
            return myZone.whitespaceId;
        }
        t(whitespaceAccessor, id) {
            if (this.a.hasOwnProperty(id)) {
                const zone = this.a[id];
                delete this.a[id];
                whitespaceAccessor.removeWhitespace(zone.whitespaceId);
                zone.domNode.removeAttribute('monaco-visible-view-zone');
                zone.domNode.removeAttribute('monaco-view-zone');
                zone.domNode.domNode.parentNode.removeChild(zone.domNode.domNode);
                if (zone.marginDomNode) {
                    zone.marginDomNode.removeAttribute('monaco-visible-view-zone');
                    zone.marginDomNode.removeAttribute('monaco-view-zone');
                    zone.marginDomNode.domNode.parentNode.removeChild(zone.marginDomNode.domNode);
                }
                this.h();
                return true;
            }
            return false;
        }
        u(whitespaceAccessor, id) {
            if (this.a.hasOwnProperty(id)) {
                const zone = this.a[id];
                const props = this.n(zone.delegate);
                zone.isInHiddenArea = props.isInHiddenArea;
                // const newOrdinal = this._getZoneOrdinal(zone.delegate);
                whitespaceAccessor.changeOneWhitespace(zone.whitespaceId, props.afterViewLineNumber, props.heightInPx);
                // TODO@Alex: change `newOrdinal` too
                this.z(zone.delegate, props.heightInPx);
                this.h();
                return true;
            }
            return false;
        }
        shouldSuppressMouseDownOnViewZone(id) {
            if (this.a.hasOwnProperty(id)) {
                const zone = this.a[id];
                return Boolean(zone.delegate.suppressMouseDown);
            }
            return false;
        }
        w(zone) {
            if (typeof zone.heightInPx === 'number') {
                return zone.heightInPx;
            }
            if (typeof zone.heightInLines === 'number') {
                return this.b * zone.heightInLines;
            }
            return this.b;
        }
        y(zone) {
            if (typeof zone.minWidthInPx === 'number') {
                return zone.minWidthInPx;
            }
            return 0;
        }
        z(zone, height) {
            if (typeof zone.onComputedHeight === 'function') {
                try {
                    zone.onComputedHeight(height);
                }
                catch (e) {
                    (0, errors_1.$Y)(e);
                }
            }
        }
        C(zone, top) {
            if (typeof zone.onDomNodeTop === 'function') {
                try {
                    zone.onDomNodeTop(top);
                }
                catch (e) {
                    (0, errors_1.$Y)(e);
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
                if (this.a[visibleWhitespace.id].isInHiddenArea) {
                    continue;
                }
                visibleZones[visibleWhitespace.id] = visibleWhitespace;
                hasVisibleZone = true;
            }
            const keys = Object.keys(this.a);
            for (let i = 0, len = keys.length; i < len; i++) {
                const id = keys[i];
                const zone = this.a[id];
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
                    this.C(zone.delegate, ctx.getScrolledTopFromAbsoluteTop(visibleZones[id].verticalOffset));
                }
                else {
                    if (zone.isVisible) {
                        zone.domNode.removeAttribute('monaco-visible-view-zone');
                        zone.isVisible = false;
                    }
                    this.C(zone.delegate, ctx.getScrolledTopFromAbsoluteTop(-1000000));
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
                this.domNode.setWidth(Math.max(ctx.scrollWidth, this.c));
                this.marginDomNode.setWidth(this.g);
            }
        }
    }
    exports.$QX = $QX;
    function safeInvoke1Arg(func, arg1) {
        try {
            return func(arg1);
        }
        catch (e) {
            (0, errors_1.$Y)(e);
        }
    }
});
//# sourceMappingURL=viewZones.js.map