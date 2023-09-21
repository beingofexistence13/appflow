/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/resizable/resizable", "vs/base/common/lifecycle", "vs/editor/common/core/position", "vs/base/browser/dom"], function (require, exports, resizable_1, lifecycle_1, position_1, dom) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$14 = void 0;
    const TOP_HEIGHT = 30;
    const BOTTOM_HEIGHT = 24;
    class $14 extends lifecycle_1.$kc {
        constructor(h, minimumSize = new dom.$BO(10, 10)) {
            super();
            this.h = h;
            this.allowEditorOverflow = true;
            this.suppressMouseDown = false;
            this.c = this.B(new resizable_1.$ZR());
            this.f = null;
            this.g = false;
            this.c.domNode.style.position = 'absolute';
            this.c.minSize = dom.$BO.lift(minimumSize);
            this.c.layout(minimumSize.height, minimumSize.width);
            this.c.enableSashes(true, true, true, true);
            this.B(this.c.onDidResize(e => {
                this.s(new dom.$BO(e.dimension.width, e.dimension.height));
                if (e.done) {
                    this.g = false;
                }
            }));
            this.B(this.c.onDidWillResize(() => {
                this.g = true;
            }));
        }
        get isResizing() {
            return this.g;
        }
        getDomNode() {
            return this.c.domNode;
        }
        getPosition() {
            return this.f;
        }
        get position() {
            return this.f?.position ? position_1.$js.lift(this.f.position) : undefined;
        }
        j(position) {
            const editorDomNode = this.h.getDomNode();
            const mouseBox = this.h.getScrolledVisiblePosition(position);
            if (!editorDomNode || !mouseBox) {
                return;
            }
            const editorBox = dom.$FO(editorDomNode);
            return editorBox.top + mouseBox.top - TOP_HEIGHT;
        }
        n(position) {
            const editorDomNode = this.h.getDomNode();
            const mouseBox = this.h.getScrolledVisiblePosition(position);
            if (!editorDomNode || !mouseBox) {
                return;
            }
            const editorBox = dom.$FO(editorDomNode);
            const bodyBox = dom.$AO(editorDomNode.ownerDocument.body);
            const mouseBottom = editorBox.top + mouseBox.top + mouseBox.height;
            return bodyBox.height - mouseBottom - BOTTOM_HEIGHT;
        }
        r(widgetHeight, showAtPosition) {
            const maxHeightBelow = Math.min(this.n(showAtPosition) ?? Infinity, widgetHeight);
            const maxHeightAbove = Math.min(this.j(showAtPosition) ?? Infinity, widgetHeight);
            const maxHeight = Math.min(Math.max(maxHeightAbove, maxHeightBelow), widgetHeight);
            const height = Math.min(widgetHeight, maxHeight);
            let renderingAbove;
            if (this.h.getOption(60 /* EditorOption.hover */).above) {
                renderingAbove = height <= maxHeightAbove ? 1 /* ContentWidgetPositionPreference.ABOVE */ : 2 /* ContentWidgetPositionPreference.BELOW */;
            }
            else {
                renderingAbove = height <= maxHeightBelow ? 2 /* ContentWidgetPositionPreference.BELOW */ : 1 /* ContentWidgetPositionPreference.ABOVE */;
            }
            if (renderingAbove === 1 /* ContentWidgetPositionPreference.ABOVE */) {
                this.c.enableSashes(true, true, false, false);
            }
            else {
                this.c.enableSashes(false, true, true, false);
            }
            return renderingAbove;
        }
        s(dimension) {
            this.c.layout(dimension.height, dimension.width);
        }
    }
    exports.$14 = $14;
});
//# sourceMappingURL=resizableContentWidget.js.map