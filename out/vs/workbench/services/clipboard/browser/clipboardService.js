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
define(["require", "exports", "vs/nls", "vs/platform/instantiation/common/extensions", "vs/platform/clipboard/common/clipboardService", "vs/platform/clipboard/browser/clipboardService", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/base/common/functional", "vs/base/common/lifecycle", "vs/workbench/services/environment/common/environmentService", "vs/platform/log/common/log", "vs/platform/layout/browser/layoutService"], function (require, exports, nls_1, extensions_1, clipboardService_1, clipboardService_2, notification_1, opener_1, functional_1, lifecycle_1, environmentService_1, log_1, layoutService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BrowserClipboardService = void 0;
    let BrowserClipboardService = class BrowserClipboardService extends clipboardService_2.BrowserClipboardService {
        constructor(notificationService, openerService, environmentService, logService, layoutService) {
            super(layoutService, logService);
            this.notificationService = notificationService;
            this.openerService = openerService;
            this.environmentService = environmentService;
        }
        async readText(type) {
            if (type) {
                return super.readText(type);
            }
            try {
                return await navigator.clipboard.readText();
            }
            catch (error) {
                if (!!this.environmentService.extensionTestsLocationURI) {
                    return ''; // do not ask for input in tests (https://github.com/microsoft/vscode/issues/112264)
                }
                return new Promise(resolve => {
                    // Inform user about permissions problem (https://github.com/microsoft/vscode/issues/112089)
                    const listener = new lifecycle_1.DisposableStore();
                    const handle = this.notificationService.prompt(notification_1.Severity.Error, (0, nls_1.localize)('clipboardError', "Unable to read from the browser's clipboard. Please make sure you have granted access for this website to read from the clipboard."), [{
                            label: (0, nls_1.localize)('retry', "Retry"),
                            run: async () => {
                                listener.dispose();
                                resolve(await this.readText(type));
                            }
                        }, {
                            label: (0, nls_1.localize)('learnMore', "Learn More"),
                            run: () => this.openerService.open('https://go.microsoft.com/fwlink/?linkid=2151362')
                        }], {
                        sticky: true
                    });
                    // Always resolve the promise once the notification closes
                    listener.add((0, functional_1.once)(handle.onDidClose)(() => resolve('')));
                });
            }
        }
    };
    exports.BrowserClipboardService = BrowserClipboardService;
    exports.BrowserClipboardService = BrowserClipboardService = __decorate([
        __param(0, notification_1.INotificationService),
        __param(1, opener_1.IOpenerService),
        __param(2, environmentService_1.IWorkbenchEnvironmentService),
        __param(3, log_1.ILogService),
        __param(4, layoutService_1.ILayoutService)
    ], BrowserClipboardService);
    (0, extensions_1.registerSingleton)(clipboardService_1.IClipboardService, BrowserClipboardService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpcGJvYXJkU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9jbGlwYm9hcmQvYnJvd3Nlci9jbGlwYm9hcmRTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWN6RixJQUFNLHVCQUF1QixHQUE3QixNQUFNLHVCQUF3QixTQUFRLDBDQUEyQjtRQUV2RSxZQUN3QyxtQkFBeUMsRUFDL0MsYUFBNkIsRUFDZixrQkFBZ0QsRUFDbEYsVUFBdUIsRUFDcEIsYUFBNkI7WUFFN0MsS0FBSyxDQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsQ0FBQztZQU5NLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFDL0Msa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQ2YsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUE4QjtRQUtoRyxDQUFDO1FBRVEsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFhO1lBQ3BDLElBQUksSUFBSSxFQUFFO2dCQUNULE9BQU8sS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUM1QjtZQUVELElBQUk7Z0JBQ0gsT0FBTyxNQUFNLFNBQVMsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7YUFDNUM7WUFBQyxPQUFPLEtBQUssRUFBRTtnQkFDZixJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMseUJBQXlCLEVBQUU7b0JBQ3hELE9BQU8sRUFBRSxDQUFDLENBQUMsb0ZBQW9GO2lCQUMvRjtnQkFFRCxPQUFPLElBQUksT0FBTyxDQUFTLE9BQU8sQ0FBQyxFQUFFO29CQUVwQyw0RkFBNEY7b0JBQzVGLE1BQU0sUUFBUSxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO29CQUN2QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUM3Qyx1QkFBUSxDQUFDLEtBQUssRUFDZCxJQUFBLGNBQVEsRUFBQyxnQkFBZ0IsRUFBRSxvSUFBb0ksQ0FBQyxFQUNoSyxDQUFDOzRCQUNBLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxPQUFPLEVBQUUsT0FBTyxDQUFDOzRCQUNqQyxHQUFHLEVBQUUsS0FBSyxJQUFJLEVBQUU7Z0NBQ2YsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dDQUNuQixPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7NEJBQ3BDLENBQUM7eUJBQ0QsRUFBRTs0QkFDRixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQzs0QkFDMUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLGlEQUFpRCxDQUFDO3lCQUNyRixDQUFDLEVBQ0Y7d0JBQ0MsTUFBTSxFQUFFLElBQUk7cUJBQ1osQ0FDRCxDQUFDO29CQUVGLDBEQUEwRDtvQkFDMUQsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFBLGlCQUFJLEVBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFELENBQUMsQ0FBQyxDQUFDO2FBQ0g7UUFDRixDQUFDO0tBQ0QsQ0FBQTtJQW5EWSwwREFBdUI7c0NBQXZCLHVCQUF1QjtRQUdqQyxXQUFBLG1DQUFvQixDQUFBO1FBQ3BCLFdBQUEsdUJBQWMsQ0FBQTtRQUNkLFdBQUEsaURBQTRCLENBQUE7UUFDNUIsV0FBQSxpQkFBVyxDQUFBO1FBQ1gsV0FBQSw4QkFBYyxDQUFBO09BUEosdUJBQXVCLENBbURuQztJQUVELElBQUEsOEJBQWlCLEVBQUMsb0NBQWlCLEVBQUUsdUJBQXVCLG9DQUE0QixDQUFDIn0=