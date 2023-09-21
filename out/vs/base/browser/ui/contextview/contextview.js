/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/canIUse", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/range", "vs/css!./contextview"], function (require, exports, canIUse_1, DOM, lifecycle_1, platform, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ContextView = exports.layout = exports.LayoutAnchorMode = exports.LayoutAnchorPosition = exports.AnchorAxisAlignment = exports.AnchorPosition = exports.AnchorAlignment = exports.isAnchor = exports.ContextViewDOMPosition = void 0;
    var ContextViewDOMPosition;
    (function (ContextViewDOMPosition) {
        ContextViewDOMPosition[ContextViewDOMPosition["ABSOLUTE"] = 1] = "ABSOLUTE";
        ContextViewDOMPosition[ContextViewDOMPosition["FIXED"] = 2] = "FIXED";
        ContextViewDOMPosition[ContextViewDOMPosition["FIXED_SHADOW"] = 3] = "FIXED_SHADOW";
    })(ContextViewDOMPosition || (exports.ContextViewDOMPosition = ContextViewDOMPosition = {}));
    function isAnchor(obj) {
        const anchor = obj;
        return !!anchor && typeof anchor.x === 'number' && typeof anchor.y === 'number';
    }
    exports.isAnchor = isAnchor;
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
    function layout(viewportSize, viewSize, anchor) {
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
    exports.layout = layout;
    class ContextView extends lifecycle_1.Disposable {
        static { this.BUBBLE_UP_EVENTS = ['click', 'keydown', 'focus', 'blur']; }
        static { this.BUBBLE_DOWN_EVENTS = ['click']; }
        constructor(container, domPosition) {
            super();
            this.container = null;
            this.delegate = null;
            this.toDisposeOnClean = lifecycle_1.Disposable.None;
            this.toDisposeOnSetContainer = lifecycle_1.Disposable.None;
            this.shadowRoot = null;
            this.shadowRootHostElement = null;
            this.view = DOM.$('.context-view');
            this.useFixedPosition = false;
            this.useShadowDOM = false;
            DOM.hide(this.view);
            this.setContainer(container, domPosition);
            this._register((0, lifecycle_1.toDisposable)(() => this.setContainer(null, 1 /* ContextViewDOMPosition.ABSOLUTE */)));
        }
        setContainer(container, domPosition) {
            if (this.container) {
                this.toDisposeOnSetContainer.dispose();
                if (this.shadowRoot) {
                    this.shadowRoot.removeChild(this.view);
                    this.shadowRoot = null;
                    this.shadowRootHostElement?.remove();
                    this.shadowRootHostElement = null;
                }
                else {
                    this.container.removeChild(this.view);
                }
                this.container = null;
            }
            if (container) {
                this.container = container;
                this.useFixedPosition = domPosition !== 1 /* ContextViewDOMPosition.ABSOLUTE */;
                this.useShadowDOM = domPosition === 3 /* ContextViewDOMPosition.FIXED_SHADOW */;
                if (this.useShadowDOM) {
                    this.shadowRootHostElement = DOM.$('.shadow-root-host');
                    this.container.appendChild(this.shadowRootHostElement);
                    this.shadowRoot = this.shadowRootHostElement.attachShadow({ mode: 'open' });
                    const style = document.createElement('style');
                    style.textContent = SHADOW_ROOT_CSS;
                    this.shadowRoot.appendChild(style);
                    this.shadowRoot.appendChild(this.view);
                    this.shadowRoot.appendChild(DOM.$('slot'));
                }
                else {
                    this.container.appendChild(this.view);
                }
                const toDisposeOnSetContainer = new lifecycle_1.DisposableStore();
                ContextView.BUBBLE_UP_EVENTS.forEach(event => {
                    toDisposeOnSetContainer.add(DOM.addStandardDisposableListener(this.container, event, (e) => {
                        this.onDOMEvent(e, false);
                    }));
                });
                ContextView.BUBBLE_DOWN_EVENTS.forEach(event => {
                    toDisposeOnSetContainer.add(DOM.addStandardDisposableListener(this.container, event, (e) => {
                        this.onDOMEvent(e, true);
                    }, true));
                });
                this.toDisposeOnSetContainer = toDisposeOnSetContainer;
            }
        }
        show(delegate) {
            if (this.isVisible()) {
                this.hide();
            }
            // Show static box
            DOM.clearNode(this.view);
            this.view.className = 'context-view';
            this.view.style.top = '0px';
            this.view.style.left = '0px';
            this.view.style.zIndex = '2575';
            this.view.style.position = this.useFixedPosition ? 'fixed' : 'absolute';
            DOM.show(this.view);
            // Render content
            this.toDisposeOnClean = delegate.render(this.view) || lifecycle_1.Disposable.None;
            // Set active delegate
            this.delegate = delegate;
            // Layout
            this.doLayout();
            // Focus
            this.delegate.focus?.();
        }
        getViewElement() {
            return this.view;
        }
        layout() {
            if (!this.isVisible()) {
                return;
            }
            if (this.delegate.canRelayout === false && !(platform.isIOS && canIUse_1.BrowserFeatures.pointerEvents)) {
                this.hide();
                return;
            }
            if (this.delegate.layout) {
                this.delegate.layout();
            }
            this.doLayout();
        }
        doLayout() {
            // Check that we still have a delegate - this.delegate.layout may have hidden
            if (!this.isVisible()) {
                return;
            }
            // Get anchor
            const anchor = this.delegate.getAnchor();
            // Compute around
            let around;
            // Get the element's position and size (to anchor the view)
            if (DOM.isHTMLElement(anchor)) {
                const elementPosition = DOM.getDomNodePagePosition(anchor);
                // In areas where zoom is applied to the element or its ancestors, we need to adjust the size of the element
                // e.g. The title bar has counter zoom behavior meaning it applies the inverse of zoom level.
                // Window Zoom Level: 1.5, Title Bar Zoom: 1/1.5, Size Multiplier: 1.5
                const zoom = DOM.getDomNodeZoomLevel(anchor);
                around = {
                    top: elementPosition.top * zoom,
                    left: elementPosition.left * zoom,
                    width: elementPosition.width * zoom,
                    height: elementPosition.height * zoom
                };
            }
            else if (isAnchor(anchor)) {
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
            const viewSizeWidth = DOM.getTotalWidth(this.view);
            const viewSizeHeight = DOM.getTotalHeight(this.view);
            const anchorPosition = this.delegate.anchorPosition || 0 /* AnchorPosition.BELOW */;
            const anchorAlignment = this.delegate.anchorAlignment || 0 /* AnchorAlignment.LEFT */;
            const anchorAxisAlignment = this.delegate.anchorAxisAlignment || 0 /* AnchorAxisAlignment.VERTICAL */;
            let top;
            let left;
            if (anchorAxisAlignment === 0 /* AnchorAxisAlignment.VERTICAL */) {
                const verticalAnchor = { offset: around.top - window.pageYOffset, size: around.height, position: anchorPosition === 0 /* AnchorPosition.BELOW */ ? 0 /* LayoutAnchorPosition.Before */ : 1 /* LayoutAnchorPosition.After */ };
                const horizontalAnchor = { offset: around.left, size: around.width, position: anchorAlignment === 0 /* AnchorAlignment.LEFT */ ? 0 /* LayoutAnchorPosition.Before */ : 1 /* LayoutAnchorPosition.After */, mode: LayoutAnchorMode.ALIGN };
                top = layout(window.innerHeight, viewSizeHeight, verticalAnchor) + window.pageYOffset;
                // if view intersects vertically with anchor,  we must avoid the anchor
                if (range_1.Range.intersects({ start: top, end: top + viewSizeHeight }, { start: verticalAnchor.offset, end: verticalAnchor.offset + verticalAnchor.size })) {
                    horizontalAnchor.mode = LayoutAnchorMode.AVOID;
                }
                left = layout(window.innerWidth, viewSizeWidth, horizontalAnchor);
            }
            else {
                const horizontalAnchor = { offset: around.left, size: around.width, position: anchorAlignment === 0 /* AnchorAlignment.LEFT */ ? 0 /* LayoutAnchorPosition.Before */ : 1 /* LayoutAnchorPosition.After */ };
                const verticalAnchor = { offset: around.top, size: around.height, position: anchorPosition === 0 /* AnchorPosition.BELOW */ ? 0 /* LayoutAnchorPosition.Before */ : 1 /* LayoutAnchorPosition.After */, mode: LayoutAnchorMode.ALIGN };
                left = layout(window.innerWidth, viewSizeWidth, horizontalAnchor);
                // if view intersects horizontally with anchor, we must avoid the anchor
                if (range_1.Range.intersects({ start: left, end: left + viewSizeWidth }, { start: horizontalAnchor.offset, end: horizontalAnchor.offset + horizontalAnchor.size })) {
                    verticalAnchor.mode = LayoutAnchorMode.AVOID;
                }
                top = layout(window.innerHeight, viewSizeHeight, verticalAnchor) + window.pageYOffset;
            }
            this.view.classList.remove('top', 'bottom', 'left', 'right');
            this.view.classList.add(anchorPosition === 0 /* AnchorPosition.BELOW */ ? 'bottom' : 'top');
            this.view.classList.add(anchorAlignment === 0 /* AnchorAlignment.LEFT */ ? 'left' : 'right');
            this.view.classList.toggle('fixed', this.useFixedPosition);
            const containerPosition = DOM.getDomNodePagePosition(this.container);
            this.view.style.top = `${top - (this.useFixedPosition ? DOM.getDomNodePagePosition(this.view).top : containerPosition.top)}px`;
            this.view.style.left = `${left - (this.useFixedPosition ? DOM.getDomNodePagePosition(this.view).left : containerPosition.left)}px`;
            this.view.style.width = 'initial';
        }
        hide(data) {
            const delegate = this.delegate;
            this.delegate = null;
            if (delegate?.onHide) {
                delegate.onHide(data);
            }
            this.toDisposeOnClean.dispose();
            DOM.hide(this.view);
        }
        isVisible() {
            return !!this.delegate;
        }
        onDOMEvent(e, onCapture) {
            if (this.delegate) {
                if (this.delegate.onDOMEvent) {
                    this.delegate.onDOMEvent(e, document.activeElement);
                }
                else if (onCapture && !DOM.isAncestor(e.target, this.container)) {
                    this.hide();
                }
            }
        }
        dispose() {
            this.hide();
            super.dispose();
        }
    }
    exports.ContextView = ContextView;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dHZpZXcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2Jyb3dzZXIvdWkvY29udGV4dHZpZXcvY29udGV4dHZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBV2hHLElBQWtCLHNCQUlqQjtJQUpELFdBQWtCLHNCQUFzQjtRQUN2QywyRUFBWSxDQUFBO1FBQ1oscUVBQUssQ0FBQTtRQUNMLG1GQUFZLENBQUE7SUFDYixDQUFDLEVBSmlCLHNCQUFzQixzQ0FBdEIsc0JBQXNCLFFBSXZDO0lBU0QsU0FBZ0IsUUFBUSxDQUFDLEdBQVk7UUFDcEMsTUFBTSxNQUFNLEdBQUcsR0FBa0QsQ0FBQztRQUVsRSxPQUFPLENBQUMsQ0FBQyxNQUFNLElBQUksT0FBTyxNQUFNLENBQUMsQ0FBQyxLQUFLLFFBQVEsSUFBSSxPQUFPLE1BQU0sQ0FBQyxDQUFDLEtBQUssUUFBUSxDQUFDO0lBQ2pGLENBQUM7SUFKRCw0QkFJQztJQUVELElBQWtCLGVBRWpCO0lBRkQsV0FBa0IsZUFBZTtRQUNoQyxxREFBSSxDQUFBO1FBQUUsdURBQUssQ0FBQTtJQUNaLENBQUMsRUFGaUIsZUFBZSwrQkFBZixlQUFlLFFBRWhDO0lBRUQsSUFBa0IsY0FFakI7SUFGRCxXQUFrQixjQUFjO1FBQy9CLHFEQUFLLENBQUE7UUFBRSxxREFBSyxDQUFBO0lBQ2IsQ0FBQyxFQUZpQixjQUFjLDhCQUFkLGNBQWMsUUFFL0I7SUFFRCxJQUFrQixtQkFFakI7SUFGRCxXQUFrQixtQkFBbUI7UUFDcEMscUVBQVEsQ0FBQTtRQUFFLHlFQUFVLENBQUE7SUFDckIsQ0FBQyxFQUZpQixtQkFBbUIsbUNBQW5CLG1CQUFtQixRQUVwQztJQXVDRCxJQUFrQixvQkFHakI7SUFIRCxXQUFrQixvQkFBb0I7UUFDckMsbUVBQU0sQ0FBQTtRQUNOLGlFQUFLLENBQUE7SUFDTixDQUFDLEVBSGlC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