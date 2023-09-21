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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/event", "vs/base/browser/dom", "vs/platform/keybinding/common/keybinding", "vs/platform/configuration/common/configuration", "vs/editor/common/config/editorOptions", "vs/base/browser/ui/hover/hoverWidget", "vs/base/browser/ui/widget", "vs/platform/opener/common/opener", "vs/platform/instantiation/common/instantiation", "vs/editor/contrib/markdownRenderer/browser/markdownRenderer", "vs/base/common/htmlContent", "vs/nls", "vs/base/common/platform", "vs/platform/accessibility/common/accessibility", "vs/base/browser/ui/aria/aria"], function (require, exports, lifecycle_1, event_1, dom, keybinding_1, configuration_1, editorOptions_1, hoverWidget_1, widget_1, opener_1, instantiation_1, markdownRenderer_1, htmlContent_1, nls_1, platform_1, accessibility_1, aria_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HoverWidget = void 0;
    const $ = dom.$;
    var Constants;
    (function (Constants) {
        Constants[Constants["PointerSize"] = 3] = "PointerSize";
        Constants[Constants["HoverBorderWidth"] = 2] = "HoverBorderWidth";
        Constants[Constants["HoverWindowEdgeMargin"] = 2] = "HoverWindowEdgeMargin";
    })(Constants || (Constants = {}));
    let HoverWidget = class HoverWidget extends widget_1.Widget {
        get isDisposed() { return this._isDisposed; }
        get isMouseIn() { return this._lockMouseTracker.isMouseIn; }
        get domNode() { return this._hover.containerDomNode; }
        get onDispose() { return this._onDispose.event; }
        get onRequestLayout() { return this._onRequestLayout.event; }
        get anchor() { return this._hoverPosition === 2 /* HoverPosition.BELOW */ ? 0 /* AnchorPosition.BELOW */ : 1 /* AnchorPosition.ABOVE */; }
        get x() { return this._x; }
        get y() { return this._y; }
        /**
         * Whether the hover is "locked" by holding the alt/option key. When locked, the hover will not
         * hide and can be hovered regardless of whether the `hideOnHover` hover option is set.
         */
        get isLocked() { return this._isLocked; }
        set isLocked(value) {
            if (this._isLocked === value) {
                return;
            }
            this._isLocked = value;
            this._hoverContainer.classList.toggle('locked', this._isLocked);
        }
        constructor(options, _keybindingService, _configurationService, _openerService, _instantiationService, _accessibilityService) {
            super();
            this._keybindingService = _keybindingService;
            this._configurationService = _configurationService;
            this._openerService = _openerService;
            this._instantiationService = _instantiationService;
            this._accessibilityService = _accessibilityService;
            this._messageListeners = new lifecycle_1.DisposableStore();
            this._isDisposed = false;
            this._forcePosition = false;
            this._x = 0;
            this._y = 0;
            this._isLocked = false;
            this._enableFocusTraps = false;
            this._addedFocusTrap = false;
            this._onDispose = this._register(new event_1.Emitter());
            this._onRequestLayout = this._register(new event_1.Emitter());
            this._linkHandler = options.linkHandler || (url => {
                return (0, markdownRenderer_1.openLinkFromMarkdown)(this._openerService, url, (0, htmlContent_1.isMarkdownString)(options.content) ? options.content.isTrusted : undefined);
            });
            this._target = 'targetElements' in options.target ? options.target : new ElementHoverTarget(options.target);
            this._hoverPointer = options.showPointer ? $('div.workbench-hover-pointer') : undefined;
            this._hover = this._register(new hoverWidget_1.HoverWidget());
            this._hover.containerDomNode.classList.add('workbench-hover', 'fadeIn');
            if (options.compact) {
                this._hover.containerDomNode.classList.add('workbench-hover', 'compact');
            }
            if (options.skipFadeInAnimation) {
                this._hover.containerDomNode.classList.add('skip-fade-in');
            }
            if (options.additionalClasses) {
                this._hover.containerDomNode.classList.add(...options.additionalClasses);
            }
            if (options.forcePosition) {
                this._forcePosition = true;
            }
            if (options.trapFocus) {
                this._enableFocusTraps = true;
            }
            this._hoverPosition = options.hoverPosition ?? 3 /* HoverPosition.ABOVE */;
            // Don't allow mousedown out of the widget, otherwise preventDefault will call and text will
            // not be selected.
            this.onmousedown(this._hover.containerDomNode, e => e.stopPropagation());
            // Hide hover on escape
            this.onkeydown(this._hover.containerDomNode, e => {
                if (e.equals(9 /* KeyCode.Escape */)) {
                    this.dispose();
                }
            });
            // Hide when the window loses focus
            this._register(dom.addDisposableListener(window, 'blur', () => this.dispose()));
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
                const mdRenderer = this._instantiationService.createInstance(markdownRenderer_1.MarkdownRenderer, { codeBlockFontFamily: this._configurationService.getValue('editor').fontFamily || editorOptions_1.EDITOR_FONT_DEFAULTS.fontFamily });
                const { element } = mdRenderer.render(markdown, {
                    actionHandler: {
                        callback: (content) => this._linkHandler(content),
                        disposables: this._messageListeners
                    },
                    asyncRenderCallback: () => {
                        contentsElement.classList.add('code-hover-contents');
                        this.layout();
                        // This changes the dimensions of the hover so trigger a layout
                        this._onRequestLayout.fire();
                    }
                });
                contentsElement.appendChild(element);
            }
            rowElement.appendChild(contentsElement);
            this._hover.contentsDomNode.appendChild(rowElement);
            if (options.actions && options.actions.length > 0) {
                const statusBarElement = $('div.hover-row.status-bar');
                const actionsElement = $('div.actions');
                options.actions.forEach(action => {
                    const keybinding = this._keybindingService.lookupKeybinding(action.commandId);
                    const keybindingLabel = keybinding ? keybinding.getLabel() : null;
                    hoverWidget_1.HoverAction.render(actionsElement, {
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
                this._hover.containerDomNode.appendChild(statusBarElement);
            }
            this._hoverContainer = $('div.workbench-hover-container');
            if (this._hoverPointer) {
                this._hoverContainer.appendChild(this._hoverPointer);
            }
            this._hoverContainer.appendChild(this._hover.containerDomNode);
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
                        (0, htmlContent_1.isMarkdownString)(options.content) && !options.content.value.includes('](') && !options.content.value.includes('</a>');
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
                infoElement.textContent = (0, nls_1.localize)('hoverhint', 'Hold {0} key to mouse over', platform_1.isMacintosh ? 'Option' : 'Alt');
                statusBarElement.appendChild(infoElement);
                this._hover.containerDomNode.appendChild(statusBarElement);
            }
            const mouseTrackerTargets = [...this._target.targetElements];
            if (!hideOnHover) {
                mouseTrackerTargets.push(this._hoverContainer);
            }
            const mouseTracker = this._register(new CompositeMouseTracker(mouseTrackerTargets));
            this._register(mouseTracker.onMouseOut(() => {
                if (!this._isLocked) {
                    this.dispose();
                }
            }));
            // Setup another mouse tracker when hideOnHover is set in order to track the hover as well
            // when it is locked. This ensures the hover will hide on mouseout after alt has been
            // released to unlock the element.
            if (hideOnHover) {
                const mouseTracker2Targets = [...this._target.targetElements, this._hoverContainer];
                this._lockMouseTracker = this._register(new CompositeMouseTracker(mouseTracker2Targets));
                this._register(this._lockMouseTracker.onMouseOut(() => {
                    if (!this._isLocked) {
                        this.dispose();
                    }
                }));
            }
            else {
                this._lockMouseTracker = mouseTracker;
            }
        }
        addFocusTrap() {
            if (!this._enableFocusTraps || this._addedFocusTrap) {
                return;
            }
            this._addedFocusTrap = true;
            // Add a hover tab loop if the hover has at least one element with a valid tabIndex
            const firstContainerFocusElement = this._hover.containerDomNode;
            const lastContainerFocusElement = this.findLastFocusableChild(this._hover.containerDomNode);
            if (lastContainerFocusElement) {
                const beforeContainerFocusElement = dom.prepend(this._hoverContainer, $('div'));
                const afterContainerFocusElement = dom.append(this._hoverContainer, $('div'));
                beforeContainerFocusElement.tabIndex = 0;
                afterContainerFocusElement.tabIndex = 0;
                this._register(dom.addDisposableListener(afterContainerFocusElement, 'focus', (e) => {
                    firstContainerFocusElement.focus();
                    e.preventDefault();
                }));
                this._register(dom.addDisposableListener(beforeContainerFocusElement, 'focus', (e) => {
                    lastContainerFocusElement.focus();
                    e.preventDefault();
                }));
            }
        }
        findLastFocusableChild(root) {
            if (root.hasChildNodes()) {
                for (let i = 0; i < root.childNodes.length; i++) {
                    const node = root.childNodes.item(root.childNodes.length - i - 1);
                    if (node.nodeType === node.ELEMENT_NODE) {
                        const parsedNode = node;
                        if (typeof parsedNode.tabIndex === 'number' && parsedNode.tabIndex >= 0) {
                            return parsedNode;
                        }
                    }
                    const recursivelyFoundElement = this.findLastFocusableChild(node);
                    if (recursivelyFoundElement) {
                        return recursivelyFoundElement;
                    }
                }
            }
            return undefined;
        }
        render(container) {
            container.appendChild(this._hoverContainer);
            const accessibleViewHint = (0, hoverWidget_1.getHoverAccessibleViewHint)(this._configurationService.getValue('accessibility.verbosity.hover') === true && this._accessibilityService.isScreenReaderOptimized(), this._keybindingService.lookupKeybinding('editor.action.accessibleView')?.getAriaLabel());
            if (accessibleViewHint) {
                (0, aria_1.status)(accessibleViewHint);
            }
            this.layout();
            this.addFocusTrap();
        }
        layout() {
            this._hover.containerDomNode.classList.remove('right-aligned');
            this._hover.contentsDomNode.style.maxHeight = '';
            const getZoomAccountedBoundingClientRect = (e) => {
                const zoom = dom.getDomNodeZoomLevel(e);
                const boundingRect = e.getBoundingClientRect();
                return {
                    top: boundingRect.top * zoom,
                    bottom: boundingRect.bottom * zoom,
                    right: boundingRect.right * zoom,
                    left: boundingRect.left * zoom,
                };
            };
            const targetBounds = this._target.targetElements.map(e => getZoomAccountedBoundingClientRect(e));
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
            this.adjustHorizontalHoverPosition(targetRect);
            this.adjustVerticalHoverPosition(targetRect);
            // This call limits the maximum height of the hover.
            this.adjustHoverMaxHeight(targetRect);
            // Offset the hover position if there is a pointer so it aligns with the target element
            this._hoverContainer.style.padding = '';
            this._hoverContainer.style.margin = '';
            if (this._hoverPointer) {
                switch (this._hoverPosition) {
                    case 1 /* HoverPosition.RIGHT */:
                        targetRect.left += 3 /* Constants.PointerSize */;
                        targetRect.right += 3 /* Constants.PointerSize */;
                        this._hoverContainer.style.paddingLeft = `${3 /* Constants.PointerSize */}px`;
                        this._hoverContainer.style.marginLeft = `${-3 /* Constants.PointerSize */}px`;
                        break;
                    case 0 /* HoverPosition.LEFT */:
                        targetRect.left -= 3 /* Constants.PointerSize */;
                        targetRect.right -= 3 /* Constants.PointerSize */;
                        this._hoverContainer.style.paddingRight = `${3 /* Constants.PointerSize */}px`;
                        this._hoverContainer.style.marginRight = `${-3 /* Constants.PointerSize */}px`;
                        break;
                    case 2 /* HoverPosition.BELOW */:
                        targetRect.top += 3 /* Constants.PointerSize */;
                        targetRect.bottom += 3 /* Constants.PointerSize */;
                        this._hoverContainer.style.paddingTop = `${3 /* Constants.PointerSize */}px`;
                        this._hoverContainer.style.marginTop = `${-3 /* Constants.PointerSize */}px`;
                        break;
                    case 3 /* HoverPosition.ABOVE */:
                        targetRect.top -= 3 /* Constants.PointerSize */;
                        targetRect.bottom -= 3 /* Constants.PointerSize */;
                        this._hoverContainer.style.paddingBottom = `${3 /* Constants.PointerSize */}px`;
                        this._hoverContainer.style.marginBottom = `${-3 /* Constants.PointerSize */}px`;
                        break;
                }
                targetRect.center.x = targetRect.left + (width / 2);
                targetRect.center.y = targetRect.top + (height / 2);
            }
            this.computeXCordinate(targetRect);
            this.computeYCordinate(targetRect);
            if (this._hoverPointer) {
                // reset
                this._hoverPointer.classList.remove('top');
                this._hoverPointer.classList.remove('left');
                this._hoverPointer.classList.remove('right');
                this._hoverPointer.classList.remove('bottom');
                this.setHoverPointerPosition(targetRect);
            }
            this._hover.onContentsChanged();
        }
        computeXCordinate(target) {
            const hoverWidth = this._hover.containerDomNode.clientWidth + 2 /* Constants.HoverBorderWidth */;
            if (this._target.x !== undefined) {
                this._x = this._target.x;
            }
            else if (this._hoverPosition === 1 /* HoverPosition.RIGHT */) {
                this._x = target.right;
            }
            else if (this._hoverPosition === 0 /* HoverPosition.LEFT */) {
                this._x = target.left - hoverWidth;
            }
            else {
                if (this._hoverPointer) {
                    this._x = target.center.x - (this._hover.containerDomNode.clientWidth / 2);
                }
                else {
                    this._x = target.left;
                }
                // Hover is going beyond window towards right end
                if (this._x + hoverWidth >= document.documentElement.clientWidth) {
                    this._hover.containerDomNode.classList.add('right-aligned');
                    this._x = Math.max(document.documentElement.clientWidth - hoverWidth - 2 /* Constants.HoverWindowEdgeMargin */, document.documentElement.clientLeft);
                }
            }
            // Hover is going beyond window towards left end
            if (this._x < document.documentElement.clientLeft) {
                this._x = target.left + 2 /* Constants.HoverWindowEdgeMargin */;
            }
        }
        computeYCordinate(target) {
            if (this._target.y !== undefined) {
                this._y = this._target.y;
            }
            else if (this._hoverPosition === 3 /* HoverPosition.ABOVE */) {
                this._y = target.top;
            }
            else if (this._hoverPosition === 2 /* HoverPosition.BELOW */) {
                this._y = target.bottom - 2;
            }
            else {
                if (this._hoverPointer) {
                    this._y = target.center.y + (this._hover.containerDomNode.clientHeight / 2);
                }
                else {
                    this._y = target.bottom;
                }
            }
            // Hover on bottom is going beyond window
            if (this._y > window.innerHeight) {
                this._y = target.bottom;
            }
        }
        adjustHorizontalHoverPosition(target) {
            // Do not adjust horizontal hover position if x cordiante is provided
            if (this._target.x !== undefined) {
                return;
            }
            // When force position is enabled, restrict max width
            if (this._forcePosition) {
                const padding = (this._hoverPointer ? 3 /* Constants.PointerSize */ : 0) + 2 /* Constants.HoverBorderWidth */;
                if (this._hoverPosition === 1 /* HoverPosition.RIGHT */) {
                    this._hover.containerDomNode.style.maxWidth = `${document.documentElement.clientWidth - target.right - padding}px`;
                }
                else if (this._hoverPosition === 0 /* HoverPosition.LEFT */) {
                    this._hover.containerDomNode.style.maxWidth = `${target.left - padding}px`;
                }
                return;
            }
            // Position hover on right to target
            if (this._hoverPosition === 1 /* HoverPosition.RIGHT */) {
                const roomOnRight = document.documentElement.clientWidth - target.right;
                // Hover on the right is going beyond window.
                if (roomOnRight < this._hover.containerDomNode.clientWidth) {
                    const roomOnLeft = target.left;
                    // There's enough room on the left, flip the hover position
                    if (roomOnLeft >= this._hover.containerDomNode.clientWidth) {
                        this._hoverPosition = 0 /* HoverPosition.LEFT */;
                    }
                    // Hover on the left would go beyond window too
                    else {
                        this._hoverPosition = 2 /* HoverPosition.BELOW */;
                    }
                }
            }
            // Position hover on left to target
            else if (this._hoverPosition === 0 /* HoverPosition.LEFT */) {
                const roomOnLeft = target.left;
                // Hover on the left is going beyond window.
                if (roomOnLeft < this._hover.containerDomNode.clientWidth) {
                    const roomOnRight = document.documentElement.clientWidth - target.right;
                    // There's enough room on the right, flip the hover position
                    if (roomOnRight >= this._hover.containerDomNode.clientWidth) {
                        this._hoverPosition = 1 /* HoverPosition.RIGHT */;
                    }
                    // Hover on the right would go beyond window too
                    else {
                        this._hoverPosition = 2 /* HoverPosition.BELOW */;
                    }
                }
                // Hover on the left is going beyond window.
                if (target.left - this._hover.containerDomNode.clientWidth <= document.documentElement.clientLeft) {
                    this._hoverPosition = 1 /* HoverPosition.RIGHT */;
                }
            }
        }
        adjustVerticalHoverPosition(target) {
            // Do not adjust vertical hover position if the y coordinate is provided
            // or the position is forced
            if (this._target.y !== undefined || this._forcePosition) {
                return;
            }
            // Position hover on top of the target
            if (this._hoverPosition === 3 /* HoverPosition.ABOVE */) {
                // Hover on top is going beyond window
                if (target.top - this._hover.containerDomNode.clientHeight < 0) {
                    this._hoverPosition = 2 /* HoverPosition.BELOW */;
                }
            }
            // Position hover below the target
            else if (this._hoverPosition === 2 /* HoverPosition.BELOW */) {
                // Hover on bottom is going beyond window
                if (target.bottom + this._hover.containerDomNode.clientHeight > window.innerHeight) {
                    this._hoverPosition = 3 /* HoverPosition.ABOVE */;
                }
            }
        }
        adjustHoverMaxHeight(target) {
            let maxHeight = window.innerHeight / 2;
            // When force position is enabled, restrict max height
            if (this._forcePosition) {
                const padding = (this._hoverPointer ? 3 /* Constants.PointerSize */ : 0) + 2 /* Constants.HoverBorderWidth */;
                if (this._hoverPosition === 3 /* HoverPosition.ABOVE */) {
                    maxHeight = Math.min(maxHeight, target.top - padding);
                }
                else if (this._hoverPosition === 2 /* HoverPosition.BELOW */) {
                    maxHeight = Math.min(maxHeight, window.innerHeight - target.bottom - padding);
                }
            }
            this._hover.containerDomNode.style.maxHeight = `${maxHeight}px`;
            if (this._hover.contentsDomNode.clientHeight < this._hover.contentsDomNode.scrollHeight) {
                // Add padding for a vertical scrollbar
                const extraRightPadding = `${this._hover.scrollbar.options.verticalScrollbarSize}px`;
                if (this._hover.contentsDomNode.style.paddingRight !== extraRightPadding) {
                    this._hover.contentsDomNode.style.paddingRight = extraRightPadding;
                }
            }
        }
        setHoverPointerPosition(target) {
            if (!this._hoverPointer) {
                return;
            }
            switch (this._hoverPosition) {
                case 0 /* HoverPosition.LEFT */:
                case 1 /* HoverPosition.RIGHT */: {
                    this._hoverPointer.classList.add(this._hoverPosition === 0 /* HoverPosition.LEFT */ ? 'right' : 'left');
                    const hoverHeight = this._hover.containerDomNode.clientHeight;
                    // If hover is taller than target, then show the pointer at the center of target
                    if (hoverHeight > target.height) {
                        this._hoverPointer.style.top = `${target.center.y - (this._y - hoverHeight) - 3 /* Constants.PointerSize */}px`;
                    }
                    // Otherwise show the pointer at the center of hover
                    else {
                        this._hoverPointer.style.top = `${Math.round((hoverHeight / 2)) - 3 /* Constants.PointerSize */}px`;
                    }
                    break;
                }
                case 3 /* HoverPosition.ABOVE */:
                case 2 /* HoverPosition.BELOW */: {
                    this._hoverPointer.classList.add(this._hoverPosition === 3 /* HoverPosition.ABOVE */ ? 'bottom' : 'top');
                    const hoverWidth = this._hover.containerDomNode.clientWidth;
                    // Position pointer at the center of the hover
                    let pointerLeftPosition = Math.round((hoverWidth / 2)) - 3 /* Constants.PointerSize */;
                    // If pointer goes beyond target then position it at the center of the target
                    const pointerX = this._x + pointerLeftPosition;
                    if (pointerX < target.left || pointerX > target.right) {
                        pointerLeftPosition = target.center.x - this._x - 3 /* Constants.PointerSize */;
                    }
                    this._hoverPointer.style.left = `${pointerLeftPosition}px`;
                    break;
                }
            }
        }
        focus() {
            this._hover.containerDomNode.focus();
        }
        hide() {
            this.dispose();
        }
        dispose() {
            if (!this._isDisposed) {
                this._onDispose.fire();
                this._hoverContainer.remove();
                this._messageListeners.dispose();
                this._target.dispose();
                super.dispose();
            }
            this._isDisposed = true;
        }
    };
    exports.HoverWidget = HoverWidget;
    exports.HoverWidget = HoverWidget = __decorate([
        __param(1, keybinding_1.IKeybindingService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, opener_1.IOpenerService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, accessibility_1.IAccessibilityService)
    ], HoverWidget);
    class CompositeMouseTracker extends widget_1.Widget {
        get onMouseOut() { return this._onMouseOut.event; }
        get isMouseIn() { return this._isMouseIn; }
        constructor(_elements) {
            super();
            this._elements = _elements;
            this._isMouseIn = true;
            this._onMouseOut = this._register(new event_1.Emitter());
            this._elements.forEach(n => this.onmouseover(n, () => this._onTargetMouseOver()));
            this._elements.forEach(n => this.onmouseleave(n, () => this._onTargetMouseLeave()));
        }
        _onTargetMouseOver() {
            this._isMouseIn = true;
            this._clearEvaluateMouseStateTimeout();
        }
        _onTargetMouseLeave() {
            this._isMouseIn = false;
            this._evaluateMouseState();
        }
        _evaluateMouseState() {
            this._clearEvaluateMouseStateTimeout();
            // Evaluate whether the mouse is still outside asynchronously such that other mouse targets
            // have the opportunity to first their mouse in event.
            this._mouseTimeout = window.setTimeout(() => this._fireIfMouseOutside(), 0);
        }
        _clearEvaluateMouseStateTimeout() {
            if (this._mouseTimeout) {
                clearTimeout(this._mouseTimeout);
                this._mouseTimeout = undefined;
            }
        }
        _fireIfMouseOutside() {
            if (!this._isMouseIn) {
                this._onMouseOut.fire();
            }
        }
    }
    class ElementHoverTarget {
        constructor(_element) {
            this._element = _element;
            this.targetElements = [this._element];
        }
        dispose() {
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG92ZXJXaWRnZXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvaG92ZXIvYnJvd3Nlci9ob3ZlcldpZGdldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFzQmhHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFXaEIsSUFBVyxTQUlWO0lBSkQsV0FBVyxTQUFTO1FBQ25CLHVEQUFlLENBQUE7UUFDZixpRUFBb0IsQ0FBQTtRQUNwQiwyRUFBeUIsQ0FBQTtJQUMxQixDQUFDLEVBSlUsU0FBUyxLQUFULFNBQVMsUUFJbkI7SUFFTSxJQUFNLFdBQVcsR0FBakIsTUFBTSxXQUFZLFNBQVEsZUFBTTtRQW1CdEMsSUFBSSxVQUFVLEtBQWMsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUN0RCxJQUFJLFNBQVMsS0FBYyxPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ3JFLElBQUksT0FBTyxLQUFrQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1FBR25FLElBQUksU0FBUyxLQUFrQixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUU5RCxJQUFJLGVBQWUsS0FBa0IsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUUxRSxJQUFJLE1BQU0sS0FBcUIsT0FBTyxJQUFJLENBQUMsY0FBYyxnQ0FBd0IsQ0FBQyxDQUFDLDhCQUFzQixDQUFDLDZCQUFxQixDQUFDLENBQUMsQ0FBQztRQUNsSSxJQUFJLENBQUMsS0FBYSxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQyxLQUFh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