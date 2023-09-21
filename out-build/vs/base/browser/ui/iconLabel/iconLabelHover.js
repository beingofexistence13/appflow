/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/htmlContent", "vs/base/common/iconLabels", "vs/base/common/lifecycle", "vs/base/common/types", "vs/nls!vs/base/browser/ui/iconLabel/iconLabelHover"], function (require, exports, dom, async_1, cancellation_1, htmlContent_1, iconLabels_1, lifecycle_1, types_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ZP = exports.$YP = void 0;
    function $YP(htmlElement, tooltip) {
        if ((0, types_1.$jf)(tooltip)) {
            // Icons don't render in the native hover so we strip them out
            htmlElement.title = (0, iconLabels_1.$Tj)(tooltip);
        }
        else if (tooltip?.markdownNotSupportedFallback) {
            htmlElement.title = tooltip.markdownNotSupportedFallback;
        }
        else {
            htmlElement.removeAttribute('title');
        }
    }
    exports.$YP = $YP;
    class UpdatableHoverWidget {
        constructor(c, d, f) {
            this.c = c;
            this.d = d;
            this.f = f;
        }
        async update(content, focus, options) {
            if (this.b) {
                // there's an computation ongoing, cancel it
                this.b.dispose(true);
                this.b = undefined;
            }
            if (this.isDisposed) {
                return;
            }
            let resolvedContent;
            if (content === undefined || (0, types_1.$jf)(content) || content instanceof HTMLElement) {
                resolvedContent = content;
            }
            else if (!(0, types_1.$xf)(content.markdown)) {
                resolvedContent = content.markdown ?? content.markdownNotSupportedFallback;
            }
            else {
                // compute the content, potentially long-running
                // show 'Loading' if no hover is up yet
                if (!this.a) {
                    this.g((0, nls_1.localize)(0, null), focus);
                }
                // compute the content
                this.b = new cancellation_1.$pd();
                const token = this.b.token;
                resolvedContent = await content.markdown(token);
                if (resolvedContent === undefined) {
                    resolvedContent = content.markdownNotSupportedFallback;
                }
                if (this.isDisposed || token.isCancellationRequested) {
                    // either the widget has been closed in the meantime
                    // or there has been a new call to `update`
                    return;
                }
            }
            this.g(resolvedContent, focus, options);
        }
        g(content, focus, options) {
            const oldHoverWidget = this.a;
            if (this.h(content)) {
                const hoverOptions = {
                    content,
                    target: this.d,
                    showPointer: this.c.placement === 'element',
                    hoverPosition: 2 /* HoverPosition.BELOW */,
                    skipFadeInAnimation: !this.f || !!oldHoverWidget,
                    ...options
                };
                this.a = this.c.showHover(hoverOptions, focus);
            }
            oldHoverWidget?.dispose();
        }
        h(content) {
            if (!content) {
                return false;
            }
            if ((0, htmlContent_1.$Zj)(content)) {
                return !!content.value;
            }
            return true;
        }
        get isDisposed() {
            return this.a?.isDisposed;
        }
        dispose() {
            this.a?.dispose();
            this.b?.dispose(true);
            this.b = undefined;
        }
    }
    function $ZP(hoverDelegate, htmlElement, content, options) {
        let hoverPreparation;
        let hoverWidget;
        const hideHover = (disposeWidget, disposePreparation) => {
            const hadHover = hoverWidget !== undefined;
            if (disposeWidget) {
                hoverWidget?.dispose();
                hoverWidget = undefined;
            }
            if (disposePreparation) {
                hoverPreparation?.dispose();
                hoverPreparation = undefined;
            }
            if (hadHover) {
                hoverDelegate.onDidHideHover?.();
            }
        };
        const triggerShowHover = (delay, focus, target) => {
            return new async_1.$Qg(async () => {
                if (!hoverWidget || hoverWidget.isDisposed) {
                    hoverWidget = new UpdatableHoverWidget(hoverDelegate, target || htmlElement, delay > 0);
                    await hoverWidget.update(content, focus, options);
                }
            }, delay);
        };
        const onMouseOver = () => {
            if (hoverPreparation) {
                return;
            }
            const toDispose = new lifecycle_1.$jc();
            const onMouseLeave = (e) => hideHover(false, e.fromElement === htmlElement);
            toDispose.add(dom.$nO(htmlElement, dom.$3O.MOUSE_LEAVE, onMouseLeave, true));
            const onMouseDown = () => hideHover(true, true);
            toDispose.add(dom.$nO(htmlElement, dom.$3O.MOUSE_DOWN, onMouseDown, true));
            const target = {
                targetElements: [htmlElement],
                dispose: () => { }
            };
            if (hoverDelegate.placement === undefined || hoverDelegate.placement === 'mouse') {
                // track the mouse position
                const onMouseMove = (e) => {
                    target.x = e.x + 10;
                    if ((e.target instanceof HTMLElement) && e.target.classList.contains('action-label')) {
                        hideHover(true, true);
                    }
                };
                toDispose.add(dom.$nO(htmlElement, dom.$3O.MOUSE_MOVE, onMouseMove, true));
            }
            toDispose.add(triggerShowHover(hoverDelegate.delay, false, target));
            hoverPreparation = toDispose;
        };
        const mouseOverDomEmitter = dom.$nO(htmlElement, dom.$3O.MOUSE_OVER, onMouseOver, true);
        const hover = {
            show: focus => {
                hideHover(false, true); // terminate a ongoing mouse over preparation
                triggerShowHover(0, focus); // show hover immediately
            },
            hide: () => {
                hideHover(true, true);
            },
            update: async (newContent, hoverOptions) => {
                content = newContent;
                await hoverWidget?.update(content, undefined, hoverOptions);
            },
            dispose: () => {
                mouseOverDomEmitter.dispose();
                hideHover(true, true);
            }
        };
        return hover;
    }
    exports.$ZP = $ZP;
});
//# sourceMappingURL=iconLabelHover.js.map