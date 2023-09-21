/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/fastDomNode", "vs/editor/common/viewModel/overviewZoneManager", "vs/editor/common/viewEventHandler"], function (require, exports, fastDomNode_1, overviewZoneManager_1, viewEventHandler_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$LX = void 0;
    class $LX extends viewEventHandler_1.$9U {
        constructor(context, cssClassName) {
            super();
            this.a = context;
            const options = this.a.configuration.options;
            this.b = (0, fastDomNode_1.$GP)(document.createElement('canvas'));
            this.b.setClassName(cssClassName);
            this.b.setPosition('absolute');
            this.b.setLayerHinting(true);
            this.b.setContain('strict');
            this.c = new overviewZoneManager_1.$hV((lineNumber) => this.a.viewLayout.getVerticalOffsetForLineNumber(lineNumber));
            this.c.setDOMWidth(0);
            this.c.setDOMHeight(0);
            this.c.setOuterHeight(this.a.viewLayout.getScrollHeight());
            this.c.setLineHeight(options.get(66 /* EditorOption.lineHeight */));
            this.c.setPixelRatio(options.get(141 /* EditorOption.pixelRatio */));
            this.a.addEventHandler(this);
        }
        dispose() {
            this.a.removeEventHandler(this);
            super.dispose();
        }
        // ---- begin view event handlers
        onConfigurationChanged(e) {
            const options = this.a.configuration.options;
            if (e.hasChanged(66 /* EditorOption.lineHeight */)) {
                this.c.setLineHeight(options.get(66 /* EditorOption.lineHeight */));
                this.g();
            }
            if (e.hasChanged(141 /* EditorOption.pixelRatio */)) {
                this.c.setPixelRatio(options.get(141 /* EditorOption.pixelRatio */));
                this.b.setWidth(this.c.getDOMWidth());
                this.b.setHeight(this.c.getDOMHeight());
                this.b.domNode.width = this.c.getCanvasWidth();
                this.b.domNode.height = this.c.getCanvasHeight();
                this.g();
            }
            return true;
        }
        onFlushed(e) {
            this.g();
            return true;
        }
        onScrollChanged(e) {
            if (e.scrollHeightChanged) {
                this.c.setOuterHeight(e.scrollHeight);
                this.g();
            }
            return true;
        }
        onZonesChanged(e) {
            this.g();
            return true;
        }
        // ---- end view event handlers
        getDomNode() {
            return this.b.domNode;
        }
        setLayout(position) {
            this.b.setTop(position.top);
            this.b.setRight(position.right);
            let hasChanged = false;
            hasChanged = this.c.setDOMWidth(position.width) || hasChanged;
            hasChanged = this.c.setDOMHeight(position.height) || hasChanged;
            if (hasChanged) {
                this.b.setWidth(this.c.getDOMWidth());
                this.b.setHeight(this.c.getDOMHeight());
                this.b.domNode.width = this.c.getCanvasWidth();
                this.b.domNode.height = this.c.getCanvasHeight();
                this.g();
            }
        }
        setZones(zones) {
            this.c.setZones(zones);
            this.g();
        }
        g() {
            if (this.c.getOuterHeight() === 0) {
                return false;
            }
            const width = this.c.getCanvasWidth();
            const height = this.c.getCanvasHeight();
            const colorZones = this.c.resolveColorZones();
            const id2Color = this.c.getId2Color();
            const ctx = this.b.domNode.getContext('2d');
            ctx.clearRect(0, 0, width, height);
            if (colorZones.length > 0) {
                this.j(ctx, colorZones, id2Color, width);
            }
            return true;
        }
        j(ctx, colorZones, id2Color, width) {
            let currentColorId = 0;
            let currentFrom = 0;
            let currentTo = 0;
            for (const zone of colorZones) {
                const zoneColorId = zone.colorId;
                const zoneFrom = zone.from;
                const zoneTo = zone.to;
                if (zoneColorId !== currentColorId) {
                    ctx.fillRect(0, currentFrom, width, currentTo - currentFrom);
                    currentColorId = zoneColorId;
                    ctx.fillStyle = id2Color[currentColorId];
                    currentFrom = zoneFrom;
                    currentTo = zoneTo;
                }
                else {
                    if (currentTo >= zoneFrom) {
                        currentTo = Math.max(currentTo, zoneTo);
                    }
                    else {
                        ctx.fillRect(0, currentFrom, width, currentTo - currentFrom);
                        currentFrom = zoneFrom;
                        currentTo = zoneTo;
                    }
                }
            }
            ctx.fillRect(0, currentFrom, width, currentTo - currentFrom);
        }
    }
    exports.$LX = $LX;
});
//# sourceMappingURL=overviewRuler.js.map