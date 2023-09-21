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
define(["require", "exports", "vs/base/browser/ui/contextview/contextview", "vs/base/common/lifecycle", "vs/platform/layout/browser/layoutService"], function (require, exports, contextview_1, lifecycle_1, layoutService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ContextViewService = void 0;
    let ContextViewService = class ContextViewService extends lifecycle_1.Disposable {
        constructor(layoutService) {
            super();
            this.layoutService = layoutService;
            this.currentViewDisposable = lifecycle_1.Disposable.None;
            this.container = layoutService.hasContainer ? layoutService.container : null;
            this.contextView = this._register(new contextview_1.ContextView(this.container, 1 /* ContextViewDOMPosition.ABSOLUTE */));
            this.layout();
            this._register(layoutService.onDidLayout(() => this.layout()));
        }
        // ContextView
        setContainer(container, domPosition) {
            this.contextView.setContainer(container, domPosition || 1 /* ContextViewDOMPosition.ABSOLUTE */);
        }
        showContextView(delegate, container, shadowRoot) {
            if (container) {
                if (container !== this.container || this.shadowRoot !== shadowRoot) {
                    this.container = container;
                    this.setContainer(container, shadowRoot ? 3 /* ContextViewDOMPosition.FIXED_SHADOW */ : 2 /* ContextViewDOMPosition.FIXED */);
                }
            }
            else {
                if (this.layoutService.hasContainer && this.container !== this.layoutService.container) {
                    this.container = this.layoutService.container;
                    this.setContainer(this.container, 1 /* ContextViewDOMPosition.ABSOLUTE */);
                }
            }
            this.shadowRoot = shadowRoot;
            this.contextView.show(delegate);
            const disposable = (0, lifecycle_1.toDisposable)(() => {
                if (this.currentViewDisposable === disposable) {
                    this.hideContextView();
                }
            });
            this.currentViewDisposable = disposable;
            return disposable;
        }
        getContextViewElement() {
            return this.contextView.getViewElement();
        }
        layout() {
            this.contextView.layout();
        }
        hideContextView(data) {
            this.contextView.hide(data);
        }
    };
    exports.ContextViewService = ContextViewService;
    exports.ContextViewService = ContextViewService = __decorate([
        __param(0, layoutService_1.ILayoutService)
    ], ContextViewService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dFZpZXdTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vY29udGV4dHZpZXcvYnJvd3Nlci9jb250ZXh0Vmlld1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBT3pGLElBQU0sa0JBQWtCLEdBQXhCLE1BQU0sa0JBQW1CLFNBQVEsc0JBQVU7UUFRakQsWUFDaUIsYUFBOEM7WUFFOUQsS0FBSyxFQUFFLENBQUM7WUFGeUIsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBTnZELDBCQUFxQixHQUFnQixzQkFBVSxDQUFDLElBQUksQ0FBQztZQVU1RCxJQUFJLENBQUMsU0FBUyxHQUFHLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUM3RSxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSx5QkFBVyxDQUFDLElBQUksQ0FBQyxTQUFTLDBDQUFrQyxDQUFDLENBQUM7WUFDcEcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBRWQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDaEUsQ0FBQztRQUVELGNBQWM7UUFFTixZQUFZLENBQUMsU0FBc0IsRUFBRSxXQUFvQztZQUNoRixJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsV0FBVywyQ0FBbUMsQ0FBQyxDQUFDO1FBQzFGLENBQUM7UUFFRCxlQUFlLENBQUMsUUFBOEIsRUFBRSxTQUF1QixFQUFFLFVBQW9CO1lBQzVGLElBQUksU0FBUyxFQUFFO2dCQUNkLElBQUksU0FBUyxLQUFLLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFVBQVUsS0FBSyxVQUFVLEVBQUU7b0JBQ25FLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO29CQUMzQixJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQyw2Q0FBcUMsQ0FBQyxxQ0FBNkIsQ0FBQyxDQUFDO2lCQUM5RzthQUNEO2lCQUFNO2dCQUNOLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRTtvQkFDdkYsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQztvQkFDOUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsU0FBUywwQ0FBa0MsQ0FBQztpQkFDbkU7YUFDRDtZQUVELElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1lBRTdCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRWhDLE1BQU0sVUFBVSxHQUFHLElBQUEsd0JBQVksRUFBQyxHQUFHLEVBQUU7Z0JBQ3BDLElBQUksSUFBSSxDQUFDLHFCQUFxQixLQUFLLFVBQVUsRUFBRTtvQkFDOUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO2lCQUN2QjtZQUNGLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLHFCQUFxQixHQUFHLFVBQVUsQ0FBQztZQUN4QyxPQUFPLFVBQVUsQ0FBQztRQUNuQixDQUFDO1FBRUQscUJBQXFCO1lBQ3BCLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUMxQyxDQUFDO1FBRUQsTUFBTTtZQUNMLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUVELGVBQWUsQ0FBQyxJQUFVO1lBQ3pCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdCLENBQUM7S0FDRCxDQUFBO0lBaEVZLGdEQUFrQjtpQ0FBbEIsa0JBQWtCO1FBUzVCLFdBQUEsOEJBQWMsQ0FBQTtPQVRKLGtCQUFrQixDQWdFOUIifQ==