/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/event", "vs/base/browser/dom", "vs/platform/keybinding/common/keybinding", "vs/platform/configuration/common/configuration", "vs/editor/common/config/editorOptions", "vs/base/browser/ui/hover/hoverWidget", "vs/base/browser/ui/widget", "vs/platform/opener/common/opener", "vs/platform/instantiation/common/instantiation", "vs/editor/contrib/markdownRenderer/browser/markdownRenderer", "vs/base/common/htmlContent", "vs/nls!vs/workbench/services/hover/browser/hoverWidget", "vs/base/common/platform", "vs/platform/accessibility/common/accessibility", "vs/base/browser/ui/aria/aria"], function (require, exports, lifecycle_1, event_1, dom, keybinding_1, configuration_1, editorOptions_1, hoverWidget_1, widget_1, opener_1, instantiation_1, markdownRenderer_1, htmlContent_1, nls_1, platform_1, accessibility_1, aria_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$hBb = void 0;
    const $ = dom.$;
    var Constants;
    (function (Constants) {
        Constants[Constants["PointerSize"] = 3] = "PointerSize";
        Constants[Constants["HoverBorderWidth"] = 2] = "HoverBorderWidth";
        Constants[Constants["HoverWindowEdgeMargin"] = 2] = "HoverWindowEdgeMargin";
    })(Constants || (Constants = {}));
    let $hBb = class $hBb extends widget_1.$IP {
        get isDisposed() { return this.t; }
        get isMouseIn() { return this.b.isMouseIn; }
        get domNode() { return this.c.containerDomNode; }
        get onDispose() { return this.Q.event; }
        get onRequestLayout() { return this.R.event; }
        get anchor() { return this.w === 2 /* HoverPosition.BELOW */ ? 0 /* AnchorPosition.BELOW */ : 1 /* AnchorPosition.ABOVE */; }
        get x() { return this.L; }
        get y() { return this.M; }
        /**
         * Whether the hover is "locked" by holding the alt/option key. When locked, the hover will not
         * hide and can be hovered regardless of whether the `hideOnHover` hover option is set.
         */
        get isLocked() { return this.N; }
        set isLocked(value) {
            if (this.N === value) {
                return;
            }
            this.N = value;
            this.h.classList.toggle('locked', this.N);
        }
        constructor(options, S, U, W, X, Y) {
            super();
            this.S = S;
            this.U = U;
            this.W = W;
            this.X = X;
            this.Y = Y;
            this.a = new lifecycle_1.$jc();
            this.t = false;
            this.J = false;
            this.L = 0;
            this.M = 0;
            this.N = false;
            this.O = false;
            this.P = false;
            this.Q = this.B(new event_1.$fd());
            this.R = this.B(new event_1.$fd());
            this.s = options.linkHandler || (url => {
                return (0, markdownRenderer_1.$L2)(this.W, url, (0, htmlContent_1.$Zj)(options.content) ? options.content.isTrusted : undefined);
            });
            this.r = 'targetElements' in options.target ? options.target : new ElementHoverTarget(options.target);
            this.g = options.showPointer ? $('div.workbench-hover-pointer') : undefined;
            this.c = this.B(new hoverWidget_1.$VP());
            this.c.containerDomNode.classList.add('workbench-hover', 'fadeIn');
            if (options.compact) {
                this.c.containerDomNode.classList.add('workbench-hover', 'compact');
            }
            if (options.skipFadeInAnimation) {
                this.c.containerDomNode.classList.add('skip-fade-in');
            }
            if (options.additionalClasses) {
                this.c.containerDomNode.classList.add(...options.additionalClasses);
            }
            if (options.forcePosition) {
                this.J = true;
            }
            if (options.trapFocus) {
                this.O = true;
            }
            this.w = options.hoverPosition ?? 3 /* HoverPosition.ABOVE */;
            // Don't allow mousedown out of the widget, otherwise preventDefault will call and text will
            // not be selected.
            this.j(this.c.containerDomNode, e => e.stopPropagation());
            // Hide hover on escape
            this.z(this.c.containerDomNode, e => {
                if (e.equals(9 /* KeyCode.Escape */)) {
                    this.dispose();
                }
            });
            // Hide when the window loses focus
            this.B(dom.$nO(window, 'blur', () => this.dispose()));
            const rowElement = $('div.hover-row.markdown-hover');
            const contentsElement = $('div.hover-contents');
            if (typeof options.content === 'string') {
                contentsElement.textContent = options.content;
                contentsElement.style.whiteSpace = 'pre-wrap';
            }
            else if (options.content instanceof HTMLElement) {
                contentsElement.appendChild(options.content);
                contentsElement.classList.add('html-hover-contents');
            }
            else {
                const markdown = options.content;
                const mdRenderer = this.X.createInstance(markdownRenderer_1.$K2, { codeBlockFontFamily: this.U.getValue('editor').fontFamily || editorOptions_1.EDITOR_FONT_DEFAULTS.fontFamily });
                const { element } = mdRenderer.render(markdown, {
                    actionHandler: {
                        callback: (content) => this.s(content),
                        disposables: this.a
                    },
                    asyncRenderCallback: () => {
                        contentsElement.classList.add('code-hover-contents');
                        this.layout();
                        // This changes the dimensions of the hover so trigger a layout
                        this.R.fire();
                    }
                });
                contentsElement.appendChild(element);
            }
            rowElement.appendChild(contentsElement);
            this.c.contentsDomNode.appendChild(rowElement);
            if (options.actions && options.actions.length > 0) {
                const statusBarElement = $('div.hover-row.status-bar');
                const actionsElement = $('div.actions');
                options.actions.forEach(action => {
                    const keybinding = this.S.lookupKeybinding(action.commandId);
                    const keybindingLabel = keybinding ? keybinding.getLabel() : null;
                    hoverWidget_1.$WP.render(actionsElement, {
                        label: action.label,
                        commandId: action.commandId,
                        run: e => {
                            action.run(e);
                            this.dispose();
                        },
                        iconClass: action.iconClass
                    }, keybindingLabel);
                });
                statusBarElement.appendChild(actionsElement);
                this.c.containerDomNode.appendChild(statusBarElement);
            }
            this.h = $('div.workbench-hover-container');
            if (this.g) {
                this.h.appendChild(this.g);
            }
            this.h.appendChild(this.c.containerDomNode);
            // Determine whether to hide on hover
            let hideOnHover;
            if (options.actions && options.actions.length > 0) {
                // If there are actions, require hover so they can be accessed
                hideOnHover = false;
            }
            else {
                if (options.hideOnHover === undefined) {
                    // When unset, will default to true when it's a string or when it's markdown that
                    // appears to have a link using a naive check for '](' and '</a>'
                    hideOnHover = typeof options.content === 'string' ||
                        (0, htmlContent_1.$Zj)(options.content) && !options.content.value.includes('](') && !options.content.value.includes('</a>');
                }
                else {
                    // It's set explicitly
                    hideOnHover = options.hideOnHover;
                }
            }
            // Show the hover hint if needed
            if (hideOnHover && options.showHoverHint) {
                const statusBarElement = $('div.hover-row.status-bar');
                const infoElement = $('div.info');
                infoElement.textContent = (0, nls_1.localize)(0, null, platform_1.$j ? 'Option' : 'Alt');
                statusBarElement.appendChild(infoElement);
                this.c.containerDomNode.appendChild(statusBarElement);
            }
            const mouseTrackerTargets = [...this.r.targetElements];
            if (!hideOnHover) {
                mouseTrackerTargets.push(this.h);
            }
            const mouseTracker = this.B(new CompositeMouseTracker(mouseTrackerTargets));
            this.B(mouseTracker.onMouseOut(() => {
                if (!this.N) {
                    this.dispose();
                }
            }));
            // Setup another mouse tracker when hideOnHover is set in order to track the hover as well
            // when it is locked. This ensures the hover will hide on mouseout after alt has been
            // released to unlock the element.
            if (hideOnHover) {
                const mouseTracker2Targets = [...this.r.targetElements, this.h];
                this.b = this.B(new CompositeMouseTracker(mouseTracker2Targets));
                this.B(this.b.onMouseOut(() => {
                    if (!this.N) {
                        this.dispose();
                    }
                }));
            }
            else {
                this.b = mouseTracker;
            }
        }
        Z() {
            if (!this.O || this.P) {
                return;
            }
            this.P = true;
            // Add a hover tab loop if the hover has at least one element with a valid tabIndex
            const firstContainerFocusElement = this.c.containerDomNode;
            const lastContainerFocusElement = this.ab(this.c.containerDomNode);
            if (lastContainerFocusElement) {
                const beforeContainerFocusElement = dom.$$O(this.h, $('div'));
                const afterContainerFocusElement = dom.$0O(this.h, $('div'));
                beforeContainerFocusElement.tabIndex = 0;
                afterContainerFocusElement.tabIndex = 0;
                this.B(dom.$nO(afterContainerFocusElement, 'focus', (e) => {
                    firstContainerFocusElement.focus();
                    e.preventDefault();
                }));
                this.B(dom.$nO(beforeContainerFocusElement, 'focus', (e) => {
                    lastContainerFocusElement.focus();
                    e.preventDefault();
                }));
            }
        }
        ab(root) {
            if (root.hasChildNodes()) {
                for (let i = 0; i < root.childNodes.length; i++) {
                    const node = root.childNodes.item(root.childNodes.length - i - 1);
                    if (node.nodeType === node.ELEMENT_NODE) {
                        const parsedNode = node;
                        if (typeof parsedNode.tabIndex === 'number' && parsedNode.tabIndex >= 0) {
                            return parsedNode;
                        }
                    }
                    const recursivelyFoundElement = this.ab(node);
                    if (recursivelyFoundElement) {
                        return recursivelyFoundElement;
                    }
                }
            }
            return undefined;
        }
        render(container) {
            container.appendChild(this.h);
            const accessibleViewHint = (0, hoverWidget_1.$XP)(this.U.getValue('accessibility.verbosity.hover') === true && this.Y.isScreenReaderOptimized(), this.S.lookupKeybinding('editor.action.accessibleView')?.getAriaLabel());
            if (accessibleViewHint) {
                (0, aria_1.$_P)(accessibleViewHint);
            }
            this.layout();
            this.Z();
        }
        layout() {
            this.c.containerDomNode.classList.remove('right-aligned');
            this.c.contentsDomNode.style.maxHeight = '';
            const getZoomAccountedBoundingClientRect = (e) => {
                const zoom = dom.$GO(e);
                const boundingRect = e.getBoundingClientRect();
                return {
                    top: boundingRect.top * zoom,
                    bottom: boundingRect.bottom * zoom,
                    right: boundingRect.right * zoom,
                    left: boundingRect.left * zoom,
                };
            };
            const targetBounds = this.r.targetElements.map(e => getZoomAccountedBoundingClientRect(e));
            const top = Math.min(...targetBounds.map(e => e.top));
            const right = Math.max(...targetBounds.map(e => e.right));
            const bottom = Math.max(...targetBounds.map(e => e.bottom));
            const left = Math.min(...targetBounds.map(e => e.left));
            const width = right - left;
            const height = bottom - top;
            const targetRect = {
                top, right, bottom, left, width, height,
                center: {
                    x: left + (width / 2),
                    y: top + (height / 2)
                }
            };
            // These calls adjust the position depending on spacing.
            this.db(targetRect);
            this.eb(targetRect);
            // This call limits the maximum height of the hover.
            this.fb(targetRect);
            // Offset the hover position if there is a pointer so it aligns with the target element
            this.h.style.padding = '';
            this.h.style.margin = '';
            if (this.g) {
                switch (this.w) {
                    case 1 /* HoverPosition.RIGHT */:
                        targetRect.left += 3 /* Constants.PointerSize */;
                        targetRect.right += 3 /* Constants.PointerSize */;
                        this.h.style.paddingLeft = `${3 /* Constants.PointerSize */}px`;
                        this.h.style.marginLeft = `${-3 /* Constants.PointerSize */}px`;
                        break;
                    case 0 /* HoverPosition.LEFT */:
                        targetRect.left -= 3 /* Constants.PointerSize */;
                        targetRect.right -= 3 /* Constants.PointerSize */;
                        this.h.style.paddingRight = `${3 /* Constants.PointerSize */}px`;
                        this.h.style.marginRight = `${-3 /* Constants.PointerSize */}px`;
                        break;
                    case 2 /* HoverPosition.BELOW */:
                        targetRect.top += 3 /* Constants.PointerSize */;
                        targetRect.bottom += 3 /* Constants.PointerSize */;
                        this.h.style.paddingTop = `${3 /* Constants.PointerSize */}px`;
                        this.h.style.marginTop = `${-3 /* Constants.PointerSize */}px`;
                        break;
                    case 3 /* HoverPosition.ABOVE */:
                        targetRect.top -= 3 /* Constants.PointerSize */;
                        targetRect.bottom -= 3 /* Constants.PointerSize */;
                        this.h.style.paddingBottom = `${3 /* Constants.PointerSize */}px`;
                        this.h.style.marginBottom = `${-3 /* Constants.PointerSize */}px`;
                        break;
                }
                targetRect.center.x = targetRect.left + (width / 2);
                targetRect.center.y = targetRect.top + (height / 2);
            }
            this.bb(targetRect);
            this.cb(targetRect);
            if (this.g) {
                // reset
                this.g.classList.remove('top');
                this.g.classList.remove('left');
                this.g.classList.remove('right');
                this.g.classList.remove('bottom');
                this.gb(targetRect);
            }
            this.c.onContentsChanged();
        }
        bb(target) {
            const hoverWidth = this.c.containerDomNode.clientWidth + 2 /* Constants.HoverBorderWidth */;
            if (this.r.x !== undefined) {
                this.L = this.r.x;
            }
            else if (this.w === 1 /* HoverPosition.RIGHT */) {
                this.L = target.right;
            }
            else if (this.w === 0 /* HoverPosition.LEFT */) {
                this.L = target.left - hoverWidth;
            }
            else {
                if (this.g) {
                    this.L = target.center.x - (this.c.containerDomNode.clientWidth / 2);
                }
                else {
                    this.L = target.left;
                }
                // Hover is going beyond window towards right end
                if (this.L + hoverWidth >= document.documentElement.clientWidth) {
                    this.c.containerDomNode.classList.add('right-aligned');
                    this.L = Math.max(document.documentElement.clientWidth - hoverWidth - 2 /* Constants.HoverWindowEdgeMargin */, document.documentElement.clientLeft);
                }
            }
            // Hover is going beyond window towards left end
            if (this.L < document.documentElement.clientLeft) {
                this.L = target.left + 2 /* Constants.HoverWindowEdgeMargin */;
            }
        }
        cb(target) {
            if (this.r.y !== undefined) {
                this.M = this.r.y;
            }
            else if (this.w === 3 /* HoverPosition.ABOVE */) {
                this.M = target.top;
            }
            else if (this.w === 2 /* HoverPosition.BELOW */) {
                this.M = target.bottom - 2;
            }
            else {
                if (this.g) {
                    this.M = target.center.y + (this.c.containerDomNode.clientHeight / 2);
                }
                else {
                    this.M = target.bottom;
                }
            }
            // Hover on bottom is going beyond window
            if (this.M > window.innerHeight) {
                this.M = target.bottom;
            }
        }
        db(target) {
            // Do not adjust horizontal hover position if x cordiante is provided
            if (this.r.x !== undefined) {
                return;
            }
            // When force position is enabled, restrict max width
            if (this.J) {
                const padding = (this.g ? 3 /* Constants.PointerSize */ : 0) + 2 /* Constants.HoverBorderWidth */;
                if (this.w === 1 /* HoverPosition.RIGHT */) {
                    this.c.containerDomNode.style.maxWidth = `${document.documentElement.clientWidth - target.right - padding}px`;
                }
                else if (this.w === 0 /* HoverPosition.LEFT */) {
                    this.c.containerDomNode.style.maxWidth = `${target.left - padding}px`;
                }
                return;
            }
            // Position hover on right to target
            if (this.w === 1 /* HoverPosition.RIGHT */) {
                const roomOnRight = document.documentElement.clientWidth - target.right;
                // Hover on the right is going beyond window.
                if (roomOnRight < this.c.containerDomNode.clientWidth) {
                    const roomOnLeft = target.left;
                    // There's enough room on the left, flip the hover position
                    if (roomOnLeft >= this.c.containerDomNode.clientWidth) {
                        this.w = 0 /* HoverPosition.LEFT */;
                    }
                    // Hover on the left would go beyond window too
                    else {
                        this.w = 2 /* HoverPosition.BELOW */;
                    }
                }
            }
            // Position hover on left to target
            else if (this.w === 0 /* HoverPosition.LEFT */) {
                const roomOnLeft = target.left;
                // Hover on the left is going beyond window.
                if (roomOnLeft < this.c.containerDomNode.clientWidth) {
                    const roomOnRight = document.documentElement.clientWidth - target.right;
                    // There's enough room on the right, flip the hover position
                    if (roomOnRight >= this.c.containerDomNode.clientWidth) {
                        this.w = 1 /* HoverPosition.RIGHT */;
                    }
                    // Hover on the right would go beyond window too
                    else {
                        this.w = 2 /* HoverPosition.BELOW */;
                    }
                }
                // Hover on the left is going beyond window.
                if (target.left - this.c.containerDomNode.clientWidth <= document.documentElement.clientLeft) {
                    this.w = 1 /* HoverPosition.RIGHT */;
                }
            }
        }
        eb(target) {
            // Do not adjust vertical hover position if the y coordinate is provided
            // or the position is forced
            if (this.r.y !== undefined || this.J) {
                return;
            }
            // Position hover on top of the target
            if (this.w === 3 /* HoverPosition.ABOVE */) {
                // Hover on top is going beyond window
                if (target.top - this.c.containerDomNode.clientHeight < 0) {
                    this.w = 2 /* HoverPosition.BELOW */;
                }
            }
            // Position hover below the target
            else if (this.w === 2 /* HoverPosition.BELOW */) {
                // Hover on bottom is going beyond window
                if (target.bottom + this.c.containerDomNode.clientHeight > window.innerHeight) {
                    this.w = 3 /* HoverPosition.ABOVE */;
                }
            }
        }
        fb(target) {
            let maxHeight = window.innerHeight / 2;
            // When force position is enabled, restrict max height
            if (this.J) {
                const padding = (this.g ? 3 /* Constants.PointerSize */ : 0) + 2 /* Constants.HoverBorderWidth */;
                if (this.w === 3 /* HoverPosition.ABOVE */) {
                    maxHeight = Math.min(maxHeight, target.top - padding);
                }
                else if (this.w === 2 /* HoverPosition.BELOW */) {
                    maxHeight = Math.min(maxHeight, window.innerHeight - target.bottom - padding);
                }
            }
            this.c.containerDomNode.style.maxHeight = `${maxHeight}px`;
            if (this.c.contentsDomNode.clientHeight < this.c.contentsDomNode.scrollHeight) {
                // Add padding for a vertical scrollbar
                const extraRightPadding = `${this.c.scrollbar.options.verticalScrollbarSize}px`;
                if (this.c.contentsDomNode.style.paddingRight !== extraRightPadding) {
                    this.c.contentsDomNode.style.paddingRight = extraRightPadding;
                }
            }
        }
        gb(target) {
            if (!this.g) {
                return;
            }
            switch (this.w) {
                case 0 /* HoverPosition.LEFT */:
                case 1 /* HoverPosition.RIGHT */: {
                    this.g.classList.add(this.w === 0 /* HoverPosition.LEFT */ ? 'right' : 'left');
                    const hoverHeight = this.c.containerDomNode.clientHeight;
                    // If hover is taller than target, then show the pointer at the center of target
                    if (hoverHeight > target.height) {
                        this.g.style.top = `${target.center.y - (this.M - hoverHeight) - 3 /* Constants.PointerSize */}px`;
                    }
                    // Otherwise show the pointer at the center of hover
                    else {
                        this.g.style.top = `${Math.round((hoverHeight / 2)) - 3 /* Constants.PointerSize */}px`;
                    }
                    break;
                }
                case 3 /* HoverPosition.ABOVE */:
                case 2 /* HoverPosition.BELOW */: {
                    this.g.classList.add(this.w === 3 /* HoverPosition.ABOVE */ ? 'bottom' : 'top');
                    const hoverWidth = this.c.containerDomNode.clientWidth;
                    // Position pointer at the center of the hover
                    let pointerLeftPosition = Math.round((hoverWidth / 2)) - 3 /* Constants.PointerSize */;
                    // If pointer goes beyond target then position it at the center of the target
                    const pointerX = this.L + pointerLeftPosition;
                    if (pointerX < target.left || pointerX > target.right) {
                        pointerLeftPosition = target.center.x - this.L - 3 /* Constants.PointerSize */;
                    }
                    this.g.style.left = `${pointerLeftPosition}px`;
                    break;
                }
            }
        }
        focus() {
            this.c.containerDomNode.focus();
        }
        hide() {
            this.dispose();
        }
        dispose() {
            if (!this.t) {
                this.Q.fire();
                this.h.remove();
                this.a.dispose();
                this.r.dispose();
                super.dispose();
            }
            this.t = true;
        }
    };
    exports.$hBb = $hBb;
    exports.$hBb = $hBb = __decorate([
        __param(1, keybinding_1.$2D),
        __param(2, configuration_1.$8h),
        __param(3, opener_1.$NT),
        __param(4, instantiation_1.$Ah),
        __param(5, accessibility_1.$1r)
    ], $hBb);
    class CompositeMouseTracker extends widget_1.$IP {
        get onMouseOut() { return this.c.event; }
        get isMouseIn() { return this.a; }
        constructor(g) {
            super();
            this.g = g;
            this.a = true;
            this.c = this.B(new event_1.$fd());
            this.g.forEach(n => this.m(n, () => this.h()));
            this.g.forEach(n => this.u(n, () => this.r()));
        }
        h() {
            this.a = true;
            this.t();
        }
        r() {
            this.a = false;
            this.s();
        }
        s() {
            this.t();
            // Evaluate whether the mouse is still outside asynchronously such that other mouse targets
            // have the opportunity to first their mouse in event.
            this.b = window.setTimeout(() => this.w(), 0);
        }
        t() {
            if (this.b) {
                clearTimeout(this.b);
                this.b = undefined;
            }
        }
        w() {
            if (!this.a) {
                this.c.fire();
            }
        }
    }
    class ElementHoverTarget {
        constructor(a) {
            this.a = a;
            this.targetElements = [this.a];
        }
        dispose() {
        }
    }
});
//# sourceMappingURL=hoverWidget.js.map