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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/platform/opener/common/opener", "vs/workbench/services/extensions/common/extHostCustomers", "../common/extHost.protocol", "vs/workbench/services/host/browser/host", "vs/workbench/services/userActivity/common/userActivityService"], function (require, exports, event_1, lifecycle_1, uri_1, opener_1, extHostCustomers_1, extHost_protocol_1, host_1, userActivityService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadWindow = void 0;
    let MainThreadWindow = class MainThreadWindow {
        constructor(extHostContext, hostService, openerService, userActivityService) {
            this.hostService = hostService;
            this.openerService = openerService;
            this.userActivityService = userActivityService;
            this.disposables = new lifecycle_1.DisposableStore();
            this.proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostWindow);
            event_1.Event.latch(hostService.onDidChangeFocus)(this.proxy.$onDidChangeWindowFocus, this.proxy, this.disposables);
            userActivityService.onDidChangeIsActive(this.proxy.$onDidChangeWindowActive, this.proxy, this.disposables);
        }
        dispose() {
            this.disposables.dispose();
        }
        $getInitialState() {
            return Promise.resolve({
                isFocused: this.hostService.hasFocus,
                isActive: this.userActivityService.isActive,
            });
        }
        async $openUri(uriComponents, uriString, options) {
            const uri = uri_1.URI.from(uriComponents);
            let target;
            if (uriString && uri_1.URI.parse(uriString).toString() === uri.toString()) {
                // called with string and no transformation happened -> keep string
                target = uriString;
            }
            else {
                // called with URI or transformed -> use uri
                target = uri;
            }
            return this.openerService.open(target, {
                openExternal: true,
                allowTunneling: options.allowTunneling,
                allowContributedOpeners: options.allowContributedOpeners,
            });
        }
        async $asExternalUri(uriComponents, options) {
            const result = await this.openerService.resolveExternalUri(uri_1.URI.revive(uriComponents), options);
            return result.resolved;
        }
    };
    exports.MainThreadWindow = MainThreadWindow;
    exports.MainThreadWindow = MainThreadWindow = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadWindow),
        __param(1, host_1.IHostService),
        __param(2, opener_1.IOpenerService),
        __param(3, userActivityService_1.IUserActivityService)
    ], MainThreadWindow);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZFdpbmRvdy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvYnJvd3Nlci9tYWluVGhyZWFkV2luZG93LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVl6RixJQUFNLGdCQUFnQixHQUF0QixNQUFNLGdCQUFnQjtRQUs1QixZQUNDLGNBQStCLEVBQ2pCLFdBQTBDLEVBQ3hDLGFBQThDLEVBQ3hDLG1CQUEwRDtZQUZqRCxnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQUN2QixrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFDdkIsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFzQjtZQU5oRSxnQkFBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBUXBELElBQUksQ0FBQyxLQUFLLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxpQ0FBYyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRW5FLGFBQUssQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLENBQ3ZDLElBQUksQ0FBQyxLQUFLLENBQUMsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDcEUsbUJBQW1CLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM1RyxDQUFDO1FBRUQsT0FBTztZQUNOLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDNUIsQ0FBQztRQUVELGdCQUFnQjtZQUNmLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQztnQkFDdEIsU0FBUyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUTtnQkFDcEMsUUFBUSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRO2FBQzNDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxLQUFLLENBQUMsUUFBUSxDQUFDLGFBQTRCLEVBQUUsU0FBNkIsRUFBRSxPQUF3QjtZQUNuRyxNQUFNLEdBQUcsR0FBRyxTQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3BDLElBQUksTUFBb0IsQ0FBQztZQUN6QixJQUFJLFNBQVMsSUFBSSxTQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxLQUFLLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRTtnQkFDcEUsbUVBQW1FO2dCQUNuRSxNQUFNLEdBQUcsU0FBUyxDQUFDO2FBQ25CO2lCQUFNO2dCQUNOLDRDQUE0QztnQkFDNUMsTUFBTSxHQUFHLEdBQUcsQ0FBQzthQUNiO1lBQ0QsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ3RDLFlBQVksRUFBRSxJQUFJO2dCQUNsQixjQUFjLEVBQUUsT0FBTyxDQUFDLGNBQWM7Z0JBQ3RDLHVCQUF1QixFQUFFLE9BQU8sQ0FBQyx1QkFBdUI7YUFDeEQsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELEtBQUssQ0FBQyxjQUFjLENBQUMsYUFBNEIsRUFBRSxPQUF3QjtZQUMxRSxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsU0FBRyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUMvRixPQUFPLE1BQU0sQ0FBQyxRQUFRLENBQUM7UUFDeEIsQ0FBQztLQUNELENBQUE7SUFsRFksNENBQWdCOytCQUFoQixnQkFBZ0I7UUFENUIsSUFBQSx1Q0FBb0IsRUFBQyw4QkFBVyxDQUFDLGdCQUFnQixDQUFDO1FBUWhELFdBQUEsbUJBQVksQ0FBQTtRQUNaLFdBQUEsdUJBQWMsQ0FBQTtRQUNkLFdBQUEsMENBQW9CLENBQUE7T0FUVixnQkFBZ0IsQ0FrRDVCIn0=