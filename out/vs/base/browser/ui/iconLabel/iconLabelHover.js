/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/htmlContent", "vs/base/common/iconLabels", "vs/base/common/lifecycle", "vs/base/common/types", "vs/nls"], function (require, exports, dom, async_1, cancellation_1, htmlContent_1, iconLabels_1, lifecycle_1, types_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.setupCustomHover = exports.setupNativeHover = void 0;
    function setupNativeHover(htmlElement, tooltip) {
        if ((0, types_1.isString)(tooltip)) {
            // Icons don't render in the native hover so we strip them out
            htmlElement.title = (0, iconLabels_1.stripIcons)(tooltip);
        }
        else if (tooltip?.markdownNotSupportedFallback) {
            htmlElement.title = tooltip.markdownNotSupportedFallback;
        }
        else {
            htmlElement.removeAttribute('title');
        }
    }
    exports.setupNativeHover = setupNativeHover;
    class UpdatableHoverWidget {
        constructor(hoverDelegate, target, fadeInAnimation) {
            this.hoverDelegate = hoverDelegate;
            this.target = target;
            this.fadeInAnimation = fadeInAnimation;
        }
        async update(content, focus, options) {
            if (this._cancellationTokenSource) {
                // there's an computation ongoing, cancel it
                this._cancellationTokenSource.dispose(true);
                this._cancellationTokenSource = undefined;
            }
            if (this.isDisposed) {
                return;
            }
            let resolvedContent;
            if (content === undefined || (0, types_1.isString)(content) || content instanceof HTMLElement) {
                resolvedContent = content;
            }
            else if (!(0, types_1.isFunction)(content.markdown)) {
                resolvedContent = content.markdown ?? content.markdownNotSupportedFallback;
            }
            else {
                // compute the content, potentially long-running
                // show 'Loading' if no hover is up yet
                if (!this._hoverWidget) {
                    this.show((0, nls_1.localize)('iconLabel.loading', "Loading..."), focus);
                }
                // compute the content
                this._cancellationTokenSource = new cancellation_1.CancellationTokenSource();
                const token = this._cancellationTokenSource.token;
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
            this.show(resolvedContent, focus, options);
        }
        show(content, focus, options) {
            const oldHoverWidget = this._hoverWidget;
            if (this.hasContent(content)) {
                const hoverOptions = {
                    content,
                    target: this.target,
                    showPointer: this.hoverDelegate.placement === 'element',
                    hoverPosition: 2 /* HoverPosition.BELOW */,
                    skipFadeInAnimation: !this.fadeInAnimation || !!oldHoverWidget,
                    ...options
                };
                this._hoverWidget = this.hoverDelegate.showHover(hoverOptions, focus);
            }
            oldHoverWidget?.dispose();
        }
        hasContent(content) {
            if (!content) {
                return false;
            }
            if ((0, htmlContent_1.isMarkdownString)(content)) {
                return !!content.value;
            }
            return true;
        }
        get isDisposed() {
            return this._hoverWidget?.isDisposed;
        }
        dispose() {
            this._hoverWidget?.dispose();
            this._cancellationTokenSource?.dispose(true);
            this._cancellationTokenSource = undefined;
        }
    }
    function setupCustomHover(hoverDelegate, htmlElement, content, options) {
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
            return new async_1.TimeoutTimer(async () => {
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
            const toDispose = new lifecycle_1.DisposableStore();
            const onMouseLeave = (e) => hideHover(false, e.fromElement === htmlElement);
            toDispose.add(dom.addDisposableListener(htmlElement, dom.EventType.MOUSE_LEAVE, onMouseLeave, true));
            const onMouseDown = () => hideHover(true, true);
            toDispose.add(dom.addDisposableListener(htmlElement, dom.EventType.MOUSE_DOWN, onMouseDown, true));
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
                toDispose.add(dom.addDisposableListener(htmlElement, dom.EventType.MOUSE_MOVE, onMouseMove, true));
            }
            toDispose.add(triggerShowHover(hoverDelegate.delay, false, target));
            hoverPreparation = toDispose;
        };
        const mouseOverDomEmitter = dom.addDisposableListener(htmlElement, dom.EventType.MOUSE_OVER, onMouseOver, true);
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
    exports.setupCustomHover = setupCustomHover;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvbkxhYmVsSG92ZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2Jyb3dzZXIvdWkvaWNvbkxhYmVsL2ljb25MYWJlbEhvdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWtCaEcsU0FBZ0IsZ0JBQWdCLENBQUMsV0FBd0IsRUFBRSxPQUFvRDtRQUM5RyxJQUFJLElBQUEsZ0JBQVEsRUFBQyxPQUFPLENBQUMsRUFBRTtZQUN0Qiw4REFBOEQ7WUFDOUQsV0FBVyxDQUFDLEtBQUssR0FBRyxJQUFBLHVCQUFVLEVBQUMsT0FBTyxDQUFDLENBQUM7U0FDeEM7YUFBTSxJQUFJLE9BQU8sRUFBRSw0QkFBNEIsRUFBRTtZQUNqRCxXQUFXLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyw0QkFBNEIsQ0FBQztTQUN6RDthQUFNO1lBQ04sV0FBVyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUNyQztJQUNGLENBQUM7SUFURCw0Q0FTQztJQXdDRCxNQUFNLG9CQUFvQjtRQUt6QixZQUFvQixhQUE2QixFQUFVLE1BQTBDLEVBQVUsZUFBd0I7WUFBbkgsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQVUsV0FBTSxHQUFOLE1BQU0sQ0FBb0M7WUFBVSxvQkFBZSxHQUFmLGVBQWUsQ0FBUztRQUN2SSxDQUFDO1FBRUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFzQixFQUFFLEtBQWUsRUFBRSxPQUFnQztZQUNyRixJQUFJLElBQUksQ0FBQyx3QkFBd0IsRUFBRTtnQkFDbEMsNENBQTRDO2dCQUM1QyxJQUFJLENBQUMsd0JBQXdCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM1QyxJQUFJLENBQUMsd0JBQXdCLEdBQUcsU0FBUyxDQUFDO2FBQzFDO1lBQ0QsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO2dCQUNwQixPQUFPO2FBQ1A7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