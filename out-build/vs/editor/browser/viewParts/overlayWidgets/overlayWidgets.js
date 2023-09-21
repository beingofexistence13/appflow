/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/fastDomNode", "vs/editor/browser/view/viewPart", "vs/css!./overlayWidgets"], function (require, exports, fastDomNode_1, viewPart_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$JX = void 0;
    class $JX extends viewPart_1.$FW {
        constructor(context) {
            super(context);
            const options = this._context.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this.a = {};
            this.c = layoutInfo.verticalScrollbarWidth;
            this.g = layoutInfo.minimap.minimapWidth;
            this.j = layoutInfo.horizontalScrollbarHeight;
            this.m = layoutInfo.height;
            this.n = layoutInfo.width;
            this.b = (0, fastDomNode_1.$GP)(document.createElement('div'));
            viewPart_1.$GW.write(this.b, 4 /* PartFingerprint.OverlayWidgets */);
            this.b.setClassName('overlayWidgets');
        }
        dispose() {
            super.dispose();
            this.a = {};
        }
        getDomNode() {
            return this.b;
        }
        // ---- begin view event handlers
        onConfigurationChanged(e) {
            const options = this._context.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this.c = layoutInfo.verticalScrollbarWidth;
            this.g = layoutInfo.minimap.minimapWidth;
            this.j = layoutInfo.horizontalScrollbarHeight;
            this.m = layoutInfo.height;
            this.n = layoutInfo.width;
            return true;
        }
        // ---- end view event handlers
        addWidget(widget) {
            const domNode = (0, fastDomNode_1.$GP)(widget.getDomNode());
            this.a[widget.getId()] = {
                widget: widget,
                preference: null,
                domNode: domNode
            };
            // This is sync because a widget wants to be in the dom
            domNode.setPosition('absolute');
            domNode.setAttribute('widgetId', widget.getId());
            this.b.appendChild(domNode);
            this.h();
            this.s();
        }
        setWidgetPosition(widget, preference) {
            const widgetData = this.a[widget.getId()];
            if (widgetData.preference === preference) {
                this.s();
                return false;
            }
            widgetData.preference = preference;
            this.h();
            this.s();
            return true;
        }
        removeWidget(widget) {
            const widgetId = widget.getId();
            if (this.a.hasOwnProperty(widgetId)) {
                const widgetData = this.a[widgetId];
                const domNode = widgetData.domNode.domNode;
                delete this.a[widgetId];
                domNode.parentNode.removeChild(domNode);
                this.h();
                this.s();
            }
        }
        s() {
            let maxMinWidth = 0;
            const keys = Object.keys(this.a);
            for (let i = 0, len = keys.length; i < len; i++) {
                const widgetId = keys[i];
                const widget = this.a[widgetId];
                const widgetMinWidthInPx = widget.widget.getMinContentWidthInPx?.();
                if (typeof widgetMinWidthInPx !== 'undefined') {
                    maxMinWidth = Math.max(maxMinWidth, widgetMinWidthInPx);
                }
            }
            this._context.viewLayout.setOverlayWidgetsMinWidth(maxMinWidth);
        }
        t(widgetData) {
            const domNode = widgetData.domNode;
            if (widgetData.preference === null) {
                domNode.setTop('');
                return;
            }
            if (widgetData.preference === 0 /* OverlayWidgetPositionPreference.TOP_RIGHT_CORNER */) {
                domNode.setTop(0);
                domNode.setRight((2 * this.c) + this.g);
            }
            else if (widgetData.preference === 1 /* OverlayWidgetPositionPreference.BOTTOM_RIGHT_CORNER */) {
                const widgetHeight = domNode.domNode.clientHeight;
                domNode.setTop((this.m - widgetHeight - 2 * this.j));
                domNode.setRight((2 * this.c) + this.g);
            }
            else if (widgetData.preference === 2 /* OverlayWidgetPositionPreference.TOP_CENTER */) {
                domNode.setTop(0);
                domNode.domNode.style.right = '50%';
            }
        }
        prepareRender(ctx) {
            // Nothing to read
        }
        render(ctx) {
            this.b.setWidth(this.n);
            const keys = Object.keys(this.a);
            for (let i = 0, len = keys.length; i < len; i++) {
                const widgetId = keys[i];
                this.t(this.a[widgetId]);
            }
        }
    }
    exports.$JX = $JX;
});
//# sourceMappingURL=overlayWidgets.js.map