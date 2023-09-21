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
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/workbench/services/hover/browser/hover", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/hover/browser/hoverWidget", "vs/base/common/lifecycle", "vs/base/browser/dom", "vs/platform/keybinding/common/keybinding", "vs/base/browser/keyboardEvent", "vs/platform/accessibility/common/accessibility", "vs/css!./media/hover"], function (require, exports, extensions_1, themeService_1, colorRegistry_1, hover_1, contextView_1, instantiation_1, hoverWidget_1, lifecycle_1, dom_1, keybinding_1, keyboardEvent_1, accessibility_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HoverService = void 0;
    let HoverService = class HoverService {
        constructor(_instantiationService, _contextViewService, contextMenuService, _keybindingService, _accessibilityService) {
            this._instantiationService = _instantiationService;
            this._contextViewService = _contextViewService;
            this._keybindingService = _keybindingService;
            this._accessibilityService = _accessibilityService;
            contextMenuService.onDidShowContextMenu(() => this.hideHover());
        }
        showHover(options, focus, skipLastFocusedUpdate) {
            if (getHoverOptionsIdentity(this._currentHoverOptions) === getHoverOptionsIdentity(options)) {
                return undefined;
            }
            this._currentHoverOptions = options;
            this._lastHoverOptions = options;
            const trapFocus = options.trapFocus || this._accessibilityService.isScreenReaderOptimized();
            // HACK, remove this check when #189076 is fixed
            if (!skipLastFocusedUpdate) {
                if (trapFocus && document.activeElement) {
                    this._lastFocusedElementBeforeOpen = document.activeElement;
                }
                else {
                    this._lastFocusedElementBeforeOpen = undefined;
                }
            }
            const hoverDisposables = new lifecycle_1.DisposableStore();
            const hover = this._instantiationService.createInstance(hoverWidget_1.HoverWidget, options);
            hover.onDispose(() => {
                // Required to handle cases such as closing the hover with the escape key
                this._lastFocusedElementBeforeOpen?.focus();
                // Only clear the current options if it's the current hover, the current options help
                // reduce flickering when the same hover is shown multiple times
                if (this._currentHoverOptions === options) {
                    this._currentHoverOptions = undefined;
                }
                hoverDisposables.dispose();
            });
            const provider = this._contextViewService;
            provider.showContextView(new HoverContextViewDelegate(hover, focus), options.container);
            hover.onRequestLayout(() => provider.layout());
            if ('targetElements' in options.target) {
                for (const element of options.target.targetElements) {
                    hoverDisposables.add((0, dom_1.addDisposableListener)(element, dom_1.EventType.CLICK, () => this.hideHover()));
                }
            }
            else {
                hoverDisposables.add((0, dom_1.addDisposableListener)(options.target, dom_1.EventType.CLICK, () => this.hideHover()));
            }
            const focusedElement = document.activeElement;
            if (focusedElement) {
                hoverDisposables.add((0, dom_1.addDisposableListener)(focusedElement, dom_1.EventType.KEY_DOWN, e => this._keyDown(e, hover, !!options.hideOnKeyDown)));
                hoverDisposables.add((0, dom_1.addDisposableListener)(document, dom_1.EventType.KEY_DOWN, e => this._keyDown(e, hover, !!options.hideOnKeyDown)));
                hoverDisposables.add((0, dom_1.addDisposableListener)(focusedElement, dom_1.EventType.KEY_UP, e => this._keyUp(e, hover)));
                hoverDisposables.add((0, dom_1.addDisposableListener)(document, dom_1.EventType.KEY_UP, e => this._keyUp(e, hover)));
            }
            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver(e => this._intersectionChange(e, hover), { threshold: 0 });
                const firstTargetElement = 'targetElements' in options.target ? options.target.targetElements[0] : options.target;
                observer.observe(firstTargetElement);
                hoverDisposables.add((0, lifecycle_1.toDisposable)(() => observer.disconnect()));
            }
            this._currentHover = hover;
            return hover;
        }
        hideHover() {
            if (this._currentHover?.isLocked || !this._currentHoverOptions) {
                return;
            }
            this._currentHover = undefined;
            this._currentHoverOptions = undefined;
            this._contextViewService.hideContextView();
        }
        _intersectionChange(entries, hover) {
            const entry = entries[entries.length - 1];
            if (!entry.isIntersecting) {
                hover.dispose();
            }
        }
        showAndFocusLastHover() {
            if (!this._lastHoverOptions) {
                return;
            }
            this.showHover(this._lastHoverOptions, true, true);
        }
        _keyDown(e, hover, hideOnKeyDown) {
            if (e.key === 'Alt') {
                hover.isLocked = true;
                return;
            }
            const event = new keyboardEvent_1.StandardKeyboardEvent(e);
            const keybinding = this._keybindingService.resolveKeyboardEvent(event);
            if (keybinding.getSingleModifierDispatchChords().some(value => !!value) || this._keybindingService.softDispatch(event, event.target).kind !== 0 /* ResultKind.NoMatchingKb */) {
                return;
            }
            if (hideOnKeyDown && (!this._currentHoverOptions?.trapFocus || e.key !== 'Tab')) {
                this.hideHover();
                this._lastFocusedElementBeforeOpen?.focus();
            }
        }
        _keyUp(e, hover) {
            if (e.key === 'Alt') {
                hover.isLocked = false;
                // Hide if alt is released while the mouse is not over hover/target
                if (!hover.isMouseIn) {
                    this.hideHover();
                    this._lastFocusedElementBeforeOpen?.focus();
                }
            }
        }
    };
    exports.HoverService = HoverService;
    exports.HoverService = HoverService = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, contextView_1.IContextViewService),
        __param(2, contextView_1.IContextMenuService),
        __param(3, keybinding_1.IKeybindingService),
        __param(4, accessibility_1.IAccessibilityService)
    ], HoverService);
    function getHoverOptionsIdentity(options) {
        if (options === undefined) {
            return undefined;
        }
        return options?.id ?? options;
    }
    class HoverContextViewDelegate {
        get anchorPosition() {
            return this._hover.anchor;
        }
        constructor(_hover, _focus = false) {
            this._hover = _hover;
            this._focus = _focus;
        }
        render(container) {
            this._hover.render(container);
            if (this._focus) {
                this._hover.focus();
            }
            return this._hover;
        }
        getAnchor() {
            return {
                x: this._hover.x,
                y: this._hover.y
            };
        }
        layout() {
            this._hover.layout();
        }
    }
    (0, extensions_1.registerSingleton)(hover_1.IHoverService, HoverService, 1 /* InstantiationType.Delayed */);
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const hoverBorder = theme.getColor(colorRegistry_1.editorHoverBorder);
        if (hoverBorder) {
            collector.addRule(`.monaco-workbench .workbench-hover .hover-row:not(:first-child):not(:empty) { border-top: 1px solid ${hoverBorder.transparent(0.5)}; }`);
            collector.addRule(`.monaco-workbench .workbench-hover hr { border-top: 1px solid ${hoverBorder.transparent(0.5)}; }`);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG92ZXJTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2hvdmVyL2Jyb3dzZXIvaG92ZXJTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWtCekYsSUFBTSxZQUFZLEdBQWxCLE1BQU0sWUFBWTtRQVN4QixZQUN5QyxxQkFBNEMsRUFDOUMsbUJBQXdDLEVBQ3pELGtCQUF1QyxFQUN2QixrQkFBc0MsRUFDbkMscUJBQTRDO1lBSjVDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFDOUMsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtZQUV6Qyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1lBQ25DLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFFcEYsa0JBQWtCLENBQUMsb0JBQW9CLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFDakUsQ0FBQztRQUVELFNBQVMsQ0FBQyxPQUFnQyxFQUFFLEtBQWUsRUFBRSxxQkFBK0I7WUFDM0YsSUFBSSx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDNUYsT0FBTyxTQUFTLENBQUM7YUFDakI7WUFDRCxJQUFJLENBQUMsb0JBQW9CLEdBQUcsT0FBTyxDQUFDO1lBQ3BDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxPQUFPLENBQUM7WUFDakMsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMscUJBQXFCLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztZQUM1RixnREFBZ0Q7WUFDaEQsSUFBSSxDQUFDLHFCQUFxQixFQUFFO2dCQUMzQixJQUFJLFNBQVMsSUFBSSxRQUFRLENBQUMsYUFBYSxF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