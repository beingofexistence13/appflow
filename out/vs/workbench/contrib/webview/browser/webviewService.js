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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/webview/browser/themeing", "vs/workbench/contrib/webview/browser/webviewElement", "./overlayWebview"], function (require, exports, event_1, lifecycle_1, instantiation_1, themeing_1, webviewElement_1, overlayWebview_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebviewService = void 0;
    let WebviewService = class WebviewService extends lifecycle_1.Disposable {
        constructor(_instantiationService) {
            super();
            this._instantiationService = _instantiationService;
            this._webviews = new Set();
            this._onDidChangeActiveWebview = this._register(new event_1.Emitter());
            this.onDidChangeActiveWebview = this._onDidChangeActiveWebview.event;
            this._webviewThemeDataProvider = this._instantiationService.createInstance(themeing_1.WebviewThemeDataProvider);
        }
        get activeWebview() { return this._activeWebview; }
        _updateActiveWebview(value) {
            if (value !== this._activeWebview) {
                this._activeWebview = value;
                this._onDidChangeActiveWebview.fire(value);
            }
        }
        get webviews() {
            return this._webviews.values();
        }
        createWebviewElement(initInfo) {
            const webview = this._instantiationService.createInstance(webviewElement_1.WebviewElement, initInfo, this._webviewThemeDataProvider);
            this.registerNewWebview(webview);
            return webview;
        }
        createWebviewOverlay(initInfo) {
            const webview = this._instantiationService.createInstance(overlayWebview_1.OverlayWebview, initInfo);
            this.registerNewWebview(webview);
            return webview;
        }
        registerNewWebview(webview) {
            this._webviews.add(webview);
            webview.onDidFocus(() => {
                this._updateActiveWebview(webview);
            });
            const onBlur = () => {
                if (this._activeWebview === webview) {
                    this._updateActiveWebview(undefined);
                }
            };
            webview.onDidBlur(onBlur);
            webview.onDidDispose(() => {
                onBlur();
                this._webviews.delete(webview);
            });
        }
    };
    exports.WebviewService = WebviewService;
    exports.WebviewService = WebviewService = __decorate([
        __param(0, instantiation_1.IInstantiationService)
    ], WebviewService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vidmlld1NlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi93ZWJ2aWV3L2Jyb3dzZXIvd2Vidmlld1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBVXpGLElBQU0sY0FBYyxHQUFwQixNQUFNLGNBQWUsU0FBUSxzQkFBVTtRQUs3QyxZQUN3QixxQkFBK0Q7WUFFdEYsS0FBSyxFQUFFLENBQUM7WUFGa0MsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQWlCL0UsY0FBUyxHQUFHLElBQUksR0FBRyxFQUFZLENBQUM7WUFNdkIsOEJBQXlCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBd0IsQ0FBQyxDQUFDO1lBQ2pGLDZCQUF3QixHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUM7WUFyQi9FLElBQUksQ0FBQyx5QkFBeUIsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsY0FBYyxDQUFDLG1DQUF3QixDQUFDLENBQUM7UUFDdEcsQ0FBQztRQUlELElBQVcsYUFBYSxLQUFLLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7UUFFbEQsb0JBQW9CLENBQUMsS0FBMkI7WUFDdkQsSUFBSSxLQUFLLEtBQUssSUFBSSxDQUFDLGNBQWMsRUFBRTtnQkFDbEMsSUFBSSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUM7Z0JBQzVCLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDM0M7UUFDRixDQUFDO1FBSUQsSUFBVyxRQUFRO1lBQ2xCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNoQyxDQUFDO1FBS0Qsb0JBQW9CLENBQUMsUUFBeUI7WUFDN0MsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGNBQWMsQ0FBQywrQkFBYyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQztZQUNwSCxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDakMsT0FBTyxPQUFPLENBQUM7UUFDaEIsQ0FBQztRQUVELG9CQUFvQixDQUFDLFFBQXlCO1lBQzdDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxjQUFjLENBQUMsK0JBQWMsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNwRixJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDakMsT0FBTyxPQUFPLENBQUM7UUFDaEIsQ0FBQztRQUVTLGtCQUFrQixDQUFDLE9BQWlCO1lBQzdDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRTVCLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFO2dCQUN2QixJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDcEMsQ0FBQyxDQUFDLENBQUM7WUFFSCxNQUFNLE1BQU0sR0FBRyxHQUFHLEVBQUU7Z0JBQ25CLElBQUksSUFBSSxDQUFDLGNBQWMsS0FBSyxPQUFPLEVBQUU7b0JBQ3BDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztpQkFDckM7WUFDRixDQUFDLENBQUM7WUFFRixPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzFCLE9BQU8sQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFO2dCQUN6QixNQUFNLEVBQUUsQ0FBQztnQkFDVCxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNoQyxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7S0FDRCxDQUFBO0lBL0RZLHdDQUFjOzZCQUFkLGNBQWM7UUFNeEIsV0FBQSxxQ0FBcUIsQ0FBQTtPQU5YLGNBQWMsQ0ErRDFCIn0=