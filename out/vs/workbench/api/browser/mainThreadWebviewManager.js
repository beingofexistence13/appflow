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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/workbench/api/browser/mainThreadCustomEditors", "vs/workbench/api/browser/mainThreadWebviewPanels", "vs/workbench/api/browser/mainThreadWebviews", "vs/workbench/api/browser/mainThreadWebviewViews", "vs/workbench/api/common/extHost.protocol", "../../services/extensions/common/extHostCustomers"], function (require, exports, lifecycle_1, instantiation_1, mainThreadCustomEditors_1, mainThreadWebviewPanels_1, mainThreadWebviews_1, mainThreadWebviewViews_1, extHostProtocol, extHostCustomers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadWebviewManager = void 0;
    let MainThreadWebviewManager = class MainThreadWebviewManager extends lifecycle_1.Disposable {
        constructor(context, instantiationService) {
            super();
            const webviews = this._register(instantiationService.createInstance(mainThreadWebviews_1.MainThreadWebviews, context));
            context.set(extHostProtocol.MainContext.MainThreadWebviews, webviews);
            const webviewPanels = this._register(instantiationService.createInstance(mainThreadWebviewPanels_1.MainThreadWebviewPanels, context, webviews));
            context.set(extHostProtocol.MainContext.MainThreadWebviewPanels, webviewPanels);
            const customEditors = this._register(instantiationService.createInstance(mainThreadCustomEditors_1.MainThreadCustomEditors, context, webviews, webviewPanels));
            context.set(extHostProtocol.MainContext.MainThreadCustomEditors, customEditors);
            const webviewViews = this._register(instantiationService.createInstance(mainThreadWebviewViews_1.MainThreadWebviewsViews, context, webviews));
            context.set(extHostProtocol.MainContext.MainThreadWebviewViews, webviewViews);
        }
    };
    exports.MainThreadWebviewManager = MainThreadWebviewManager;
    exports.MainThreadWebviewManager = MainThreadWebviewManager = __decorate([
        extHostCustomers_1.extHostCustomer,
        __param(1, instantiation_1.IInstantiationService)
    ], MainThreadWebviewManager);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZFdlYnZpZXdNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9icm93c2VyL21haW5UaHJlYWRXZWJ2aWV3TWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFZekYsSUFBTSx3QkFBd0IsR0FBOUIsTUFBTSx3QkFBeUIsU0FBUSxzQkFBVTtRQUN2RCxZQUNDLE9BQXdCLEVBQ0Qsb0JBQTJDO1lBRWxFLEtBQUssRUFBRSxDQUFDO1lBRVIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsdUNBQWtCLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNsRyxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsa0JBQWtCLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFFdEUsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsaURBQXVCLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDdEgsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLHVCQUF1QixFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBRWhGLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLGlEQUF1QixFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUNySSxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsdUJBQXVCLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFFaEYsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsZ0RBQXVCLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDckgsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLHNCQUFzQixFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQy9FLENBQUM7S0FDRCxDQUFBO0lBbkJZLDREQUF3Qjt1Q0FBeEIsd0JBQXdCO1FBRHBDLGtDQUFlO1FBSWIsV0FBQSxxQ0FBcUIsQ0FBQTtPQUhYLHdCQUF3QixDQW1CcEMifQ==