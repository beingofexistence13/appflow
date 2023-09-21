/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/common/component", "vs/base/browser/dom", "vs/base/common/event", "vs/base/common/types", "vs/css!./media/part"], function (require, exports, component_1, dom_1, event_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Part = void 0;
    /**
     * Parts are layed out in the workbench and have their own layout that
     * arranges an optional title and mandatory content area to show content.
     */
    class Part extends component_1.$ZT {
        get dimension() { return this.f; }
        constructor(id, t, themeService, storageService, u) {
            super(id, themeService, storageService);
            this.t = t;
            this.u = u;
            this.g = this.B(new event_1.$fd());
            this.onDidVisibilityChange = this.g.event;
            //#region ISerializableView
            this.O = this.B(new event_1.$fd());
            u.registerPart(this);
        }
        w(theme) {
            // only call if our create() method has been called
            if (this.j) {
                super.w(theme);
            }
        }
        updateStyles() {
            super.updateStyles();
        }
        /**
         * Note: Clients should not call this method, the workbench calls this
         * method. Calling it otherwise may result in unexpected behavior.
         *
         * Called to create title and content area of the part.
         */
        create(parent, options) {
            this.j = parent;
            this.m = this.I(parent, options);
            this.r = this.L(parent, options);
            this.s = new PartLayout(this.t, this.r);
            this.updateStyles();
        }
        /**
         * Returns the overall part container.
         */
        getContainer() {
            return this.j;
        }
        /**
         * Subclasses override to provide a title area implementation.
         */
        I(parent, options) {
            return undefined;
        }
        /**
         * Returns the title area container.
         */
        J() {
            return this.m;
        }
        /**
         * Subclasses override to provide a content area implementation.
         */
        L(parent, options) {
            return undefined;
        }
        /**
         * Returns the content area container.
         */
        M() {
            return this.r;
        }
        /**
         * Layout title and content area in the given dimension.
         */
        N(width, height) {
            const partLayout = (0, types_1.$uf)(this.s);
            return partLayout.layout(width, height);
        }
        get onDidChange() { return this.O.event; }
        layout(width, height, _top, _left) {
            this.f = new dom_1.$BO(width, height);
        }
        setVisible(visible) {
            this.g.fire(visible);
        }
    }
    exports.Part = Part;
    class PartLayout {
        static { this.a = 35; }
        constructor(b, c) {
            this.b = b;
            this.c = c;
        }
        layout(width, height) {
            // Title Size: Width (Fill), Height (Variable)
            let titleSize;
            if (this.b.hasTitle) {
                titleSize = new dom_1.$BO(width, Math.min(height, PartLayout.a));
            }
            else {
                titleSize = dom_1.$BO.None;
            }
            let contentWidth = width;
            if (this.b && typeof this.b.borderWidth === 'function') {
                contentWidth -= this.b.borderWidth(); // adjust for border size
            }
            // Content Size: Width (Fill), Height (Variable)
            const contentSize = new dom_1.$BO(contentWidth, height - titleSize.height);
            // Content
            if (this.c) {
                (0, dom_1.$DO)(this.c, contentSize.width, contentSize.height);
            }
            return { titleSize, contentSize };
        }
    }
});
//# sourceMappingURL=part.js.map