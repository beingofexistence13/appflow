/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/canIUse", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/range", "vs/css!./contextview"], function (require, exports, canIUse_1, DOM, lifecycle_1, platform, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$5P = exports.$4P = exports.LayoutAnchorMode = exports.LayoutAnchorPosition = exports.AnchorAxisAlignment = exports.AnchorPosition = exports.AnchorAlignment = exports.$3P = exports.ContextViewDOMPosition = void 0;
    var ContextViewDOMPosition;
    (function (ContextViewDOMPosition) {
        ContextViewDOMPosition[ContextViewDOMPosition["ABSOLUTE"] = 1] = "ABSOLUTE";
        ContextViewDOMPosition[ContextViewDOMPosition["FIXED"] = 2] = "FIXED";
        ContextViewDOMPosition[ContextViewDOMPosition["FIXED_SHADOW"] = 3] = "FIXED_SHADOW";
    })(ContextViewDOMPosition || (exports.ContextViewDOMPosition = ContextViewDOMPosition = {}));
    function $3P(obj) {
        const anchor = obj;
        return !!anchor && typeof anchor.x === 'number' && typeof anchor.y === 'number';
    }
    exports.$3P = $3P;
    var AnchorAlignment;
    (function (AnchorAlignment) {
        AnchorAlignment[AnchorAlignment["LEFT"] = 0] = "LEFT";
        AnchorAlignment[AnchorAlignment["RIGHT"] = 1] = "RIGHT";
    })(AnchorAlignment || (exports.AnchorAlignment = AnchorAlignment = {}));
    var AnchorPosition;
    (function (AnchorPosition) {
        AnchorPosition[AnchorPosition["BELOW"] = 0] = "BELOW";
        AnchorPosition[AnchorPosition["ABOVE"] = 1] = "ABOVE";
    })(AnchorPosition || (exports.AnchorPosition = AnchorPosition = {}));
    var AnchorAxisAlignment;
    (function (AnchorAxisAlignment) {
        AnchorAxisAlignment[AnchorAxisAlignment["VERTICAL"] = 0] = "VERTICAL";
        AnchorAxisAlignment[AnchorAxisAlignment["HORIZONTAL"] = 1] = "HORIZONTAL";
    })(AnchorAxisAlignment || (exports.AnchorAxisAlignment = AnchorAxisAlignment = {}));
    var LayoutAnchorPosition;
    (function (LayoutAnchorPosition) {
        LayoutAnchorPosition[LayoutAnchorPosition["Before"] = 0] = "Before";
        LayoutAnchorPosition[LayoutAnchorPosition["After"] = 1] = "After";
    })(LayoutAnchorPosition || (exports.LayoutAnchorPosition = LayoutAnchorPosition = {}));
    var LayoutAnchorMode;
    (function (LayoutAnchorMode) {
        LayoutAnchorMode[LayoutAnchorMode["AVOID"] = 0] = "AVOID";
        LayoutAnchorMode[LayoutAnchorMode["ALIGN"] = 1] = "ALIGN";
    })(LayoutAnchorMode || (exports.LayoutAnchorMode = LayoutAnchorMode = {}));
    /**
     * Lays out a one dimensional view next to an anchor in a viewport.
     *
     * @returns The view offset within the viewport.
     */
    function $4P(viewportSize, viewSize, anchor) {
        const layoutAfterAnchorBoundary = anchor.mode === LayoutAnchorMode.ALIGN ? anchor.offset : anchor.offset + anchor.size;
        const layoutBeforeAnchorBoundary = anchor.mode === LayoutAnchorMode.ALIGN ? anchor.offset + anchor.size : anchor.offset;
        if (anchor.position === 0 /* LayoutAnchorPosition.Before */) {
            if (viewSize <= viewportSize - layoutAfterAnchorBoundary) {
                return layoutAfterAnchorBoundary; // happy case, lay it out after the anchor
            }
            if (viewSize <= layoutBeforeAnchorBoundary) {
                return layoutBeforeAnchorBoundary - viewSize; // ok case, lay it out before the anchor
            }
            return Math.max(viewportSize - viewSize, 0); // sad case, lay it over the anchor
        }
        else {
            if (viewSize <= layoutBeforeAnchorBoundary) {
                return layoutBeforeAnchorBoundary - viewSize; // happy case, lay it out before the anchor
            }
            if (viewSize <= viewportSize - layoutAfterAnchorBoundary) {
                return layoutAfterAnchorBoundary; // ok case, lay it out after the anchor
            }
            return 0; // sad case, lay it over the anchor
        }
    }
    exports.$4P = $4P;
    class $5P extends lifecycle_1.$kc {
        static { this.a = ['click', 'keydown', 'focus', 'blur']; }
        static { this.b = ['click']; }
        constructor(container, domPosition) {
            super();
            this.c = null;
            this.j = null;
            this.m = lifecycle_1.$kc.None;
            this.n = lifecycle_1.$kc.None;
            this.r = null;
            this.s = null;
            this.f = DOM.$('.context-view');
            this.g = false;
            this.h = false;
            DOM.$eP(this.f);
            this.setContainer(container, domPosition);
            this.B((0, lifecycle_1.$ic)(() => this.setContainer(null, 1 /* ContextViewDOMPosition.ABSOLUTE */)));
        }
        setContainer(container, domPosition) {
            if (this.c) {
                this.n.dispose();
                if (this.r) {
                    this.r.removeChild(this.f);
                    this.r = null;
                    this.s?.remove();
                    this.s = null;
                }
                else {
                    this.c.removeChild(this.f);
                }
                this.c = null;
            }
            if (container) {
                this.c = container;
                this.g = domPosition !== 1 /* ContextViewDOMPosition.ABSOLUTE */;
                this.h = domPosition === 3 /* ContextViewDOMPosition.FIXED_SHADOW */;
                if (this.h) {
                    this.s = DOM.$('.shadow-root-host');
                    this.c.appendChild(this.s);
                    this.r = this.s.attachShadow({ mode: 'open' });
                    const style = document.createElement('style');
                    style.textContent = SHADOW_ROOT_CSS;
                    this.r.appendChild(style);
                    this.r.appendChild(this.f);
                    this.r.appendChild(DOM.$('slot'));
                }
                else {
                    this.c.appendChild(this.f);
                }
                const toDisposeOnSetContainer = new lifecycle_1.$jc();
                $5P.a.forEach(event => {
                    toDisposeOnSetContainer.add(DOM.$oO(this.c, event, (e) => {
                        this.w(e, false);
                    }));
                });
                $5P.b.forEach(event => {
                    toDisposeOnSetContainer.add(DOM.$oO(this.c, event, (e) => {
                        this.w(e, true);
                    }, true));
                });
                this.n = toDisposeOnSetContainer;
            }
        }
        show(delegate) {
            if (this.u()) {
                this.hide();
            }
            // Show static box
            DOM.$lO(this.f);
            this.f.className = 'context-view';
            this.f.style.top = '0px';
            this.f.style.left = '0px';
            this.f.style.zIndex = '2575';
            this.f.style.position = this.g ? 'fixed' : 'absolute';
            DOM.$dP(this.f);
            // Render content
            this.m = delegate.render(this.f) || lifecycle_1.$kc.None;
            // Set active delegate
            this.j = delegate;
            // Layout
            this.t();
            // Focus
            this.j.focus?.();
        }
        getViewElement() {
            return this.f;
        }
        layout() {
            if (!this.u()) {
                return;
            }
            if (this.j.canRelayout === false && !(platform.$q && canIUse_1.$bO.pointerEvents)) {
                this.hide();
                return;
            }
            if (this.j.layout) {
                this.j.layout();
            }
            this.t();
        }
        t() {
            // Check that we still have a delegate - this.delegate.layout may have hidden
            if (!this.u()) {
                return;
            }
            // Get anchor
            const anchor = this.j.getAnchor();
            // Compute around
            let around;
            // Get the element's position and size (to anchor the view)
            if (DOM.$2O(anchor)) {
                const elementPosition = DOM.$FO(anchor);
                // In areas where zoom is applied to the element or its ancestors, we need to adjust the size of the element
                // e.g. The title bar has counter zoom behavior meaning it applies the inverse of zoom level.
                // Window Zoom Level: 1.5, Title Bar Zoom: 1/1.5, Size Multiplier: 1.5
                const zoom = DOM.$GO(anchor);
                around = {
                    top: elementPosition.top * zoom,
                    left: elementPosition.left * zoom,
                    width: elementPosition.width * zoom,
                    height: elementPosition.height * zoom
                };
            }
            else if ($3P(anchor)) {
                around = {
                    top: anchor.y,
                    left: anchor.x,
                    width: anchor.width || 1,
                    height: anchor.height || 2
                };
            }
            else {
                around = {
                    top: anchor.posy,
                    left: anchor.posx,
                    // We are about to position the context view where the mouse
                    // cursor is. To prevent the view being exactly under the mouse
                    // when showing and thus potentially triggering an action within,
                    // we treat the mouse location like a small sized block element.
                    width: 2,
                    height: 2
                };
            }
            const viewSizeWidth = DOM.$HO(this.f);
            const viewSizeHeight = DOM.$LO(this.f);
            const anchorPosition = this.j.anchorPosition || 0 /* AnchorPosition.BELOW */;
            const anchorAlignment = this.j.anchorAlignment || 0 /* AnchorAlignment.LEFT */;
            const anchorAxisAlignment = this.j.anchorAxisAlignment || 0 /* AnchorAxisAlignment.VERTICAL */;
            let top;
            let left;
            if (anchorAxisAlignment === 0 /* AnchorAxisAlignment.VERTICAL */) {
                const verticalAnchor = { offset: around.top - window.pageYOffset, size: around.height, position: anchorPosition === 0 /* AnchorPosition.BELOW */ ? 0 /* LayoutAnchorPosition.Before */ : 1 /* LayoutAnchorPosition.After */ };
                const horizontalAnchor = { offset: around.left, size: around.width, position: anchorAlignment === 0 /* AnchorAlignment.LEFT */ ? 0 /* LayoutAnchorPosition.Before */ : 1 /* LayoutAnchorPosition.After */, mode: LayoutAnchorMode.ALIGN };
                top = $4P(window.innerHeight, viewSizeHeight, verticalAnchor) + window.pageYOffset;
                // if view intersects vertically with anchor,  we must avoid the anchor
                if (range_1.Range.intersects({ start: top, end: top + viewSizeHeight }, { start: verticalAnchor.offset, end: verticalAnchor.offset + verticalAnchor.size })) {
                    horizontalAnchor.mode = LayoutAnchorMode.AVOID;
                }
                left = $4P(window.innerWidth, viewSizeWidth, horizontalAnchor);
            }
            else {
                const horizontalAnchor = { offset: around.left, size: around.width, position: anchorAlignment === 0 /* AnchorAlignment.LEFT */ ? 0 /* LayoutAnchorPosition.Before */ : 1 /* LayoutAnchorPosition.After */ };
                const verticalAnchor = { offset: around.top, size: around.height, position: anchorPosition === 0 /* AnchorPosition.BELOW */ ? 0 /* LayoutAnchorPosition.Before */ : 1 /* LayoutAnchorPosition.After */, mode: LayoutAnchorMode.ALIGN };
                left = $4P(window.innerWidth, viewSizeWidth, horizontalAnchor);
                // if view intersects horizontally with anchor, we must avoid the anchor
                if (range_1.Range.intersects({ start: left, end: left + viewSizeWidth }, { start: horizontalAnchor.offset, end: horizontalAnchor.offset + horizontalAnchor.size })) {
                    verticalAnchor.mode = LayoutAnchorMode.AVOID;
                }
                top = $4P(window.innerHeight, viewSizeHeight, verticalAnchor) + window.pageYOffset;
            }
            this.f.classList.remove('top', 'bottom', 'left', 'right');
            this.f.classList.add(anchorPosition === 0 /* AnchorPosition.BELOW */ ? 'bottom' : 'top');
            this.f.classList.add(anchorAlignment === 0 /* AnchorAlignment.LEFT */ ? 'left' : 'right');
            this.f.classList.toggle('fixed', this.g);
            const containerPosition = DOM.$FO(this.c);
            this.f.style.top = `${top - (this.g ? DOM.$FO(this.f).top : containerPosition.top)}px`;
            this.f.style.left = `${left - (this.g ? DOM.$FO(this.f).left : containerPosition.left)}px`;
            this.f.style.width = 'initial';
        }
        hide(data) {
            const delegate = this.j;
            this.j = null;
            if (delegate?.onHide) {
                delegate.onHide(data);
            }
            this.m.dispose();
            DOM.$eP(this.f);
        }
        u() {
            return !!this.j;
        }
        w(e, onCapture) {
            if (this.j) {
                if (this.j.onDOMEvent) {
                    this.j.onDOMEvent(e, document.activeElement);
                }
                else if (onCapture && !DOM.$NO(e.target, this.c)) {
                    this.hide();
                }
            }
        }
        dispose() {
            this.hide();
            super.dispose();
        }
    }
    exports.$5P = $5P;
    const SHADOW_ROOT_CSS = /* css */ `
	:host {
		all: initial; /* 1st rule so subsequent properties are reset. */
	}

	.codicon[class*='codicon-'] {
		font: normal normal normal 16px/1 codicon;
		display: inline-block;
		text-decoration: none;
		text-rendering: auto;
		text-align: center;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		user-select: none;
		-webkit-user-select: none;
		-ms-user-select: none;
	}

	:host {
		font-family: -apple-system, BlinkMacSystemFont, "Segoe WPC", "Segoe UI", "HelveticaNeue-Light", system-ui, "Ubuntu", "Droid Sans", sans-serif;
	}

	:host-context(.mac) { font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
	:host-context(.mac:lang(zh-Hans)) { font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", sans-serif; }
	:host-context(.mac:lang(zh-Hant)) { font-family: -apple-system, BlinkMacSystemFont, "PingFang TC", sans-serif; }
	:host-context(.mac:lang(ja)) { font-family: -apple-system, BlinkMacSystemFont, "Hiragino Kaku Gothic Pro", sans-serif; }
	:host-context(.mac:lang(ko)) { font-family: -apple-system, BlinkMacSystemFont, "Nanum Gothic", "Apple SD Gothic Neo", "AppleGothic", sans-serif; }

	:host-context(.windows) { font-family: "Segoe WPC", "Segoe UI", sans-serif; }
	:host-context(.windows:lang(zh-Hans)) { font-family: "Segoe WPC", "Segoe UI", "Microsoft YaHei", sans-serif; }
	:host-context(.windows:lang(zh-Hant)) { font-family: "Segoe WPC", "Segoe UI", "Microsoft Jhenghei", sans-serif; }
	:host-context(.windows:lang(ja)) { font-family: "Segoe WPC", "Segoe UI", "Yu Gothic UI", "Meiryo UI", sans-serif; }
	:host-context(.windows:lang(ko)) { font-family: "Segoe WPC", "Segoe UI", "Malgun Gothic", "Dotom", sans-serif; }

	:host-context(.linux) { font-family: system-ui, "Ubuntu", "Droid Sans", sans-serif; }
	:host-context(.linux:lang(zh-Hans)) { font-family: system-ui, "Ubuntu", "Droid Sans", "Source Han Sans SC", "Source Han Sans CN", "Source Han Sans", sans-serif; }
	:host-context(.linux:lang(zh-Hant)) { font-family: system-ui, "Ubuntu", "Droid Sans", "Source Han Sans TC", "Source Han Sans TW", "Source Han Sans", sans-serif; }
	:host-context(.linux:lang(ja)) { font-family: system-ui, "Ubuntu", "Droid Sans", "Source Han Sans J", "Source Han Sans JP", "Source Han Sans", sans-serif; }
	:host-context(.linux:lang(ko)) { font-family: system-ui, "Ubuntu", "Droid Sans", "Source Han Sans K", "Source Han Sans JR", "Source Han Sans", "UnDotum", "FBaekmuk Gulim", sans-serif; }
`;
});
//# sourceMappingURL=contextview.js.map