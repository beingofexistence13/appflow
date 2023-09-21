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
define(["require", "exports", "vs/base/common/actions", "vs/base/common/ports", "vs/nls", "vs/platform/dialogs/common/dialogs", "vs/platform/native/common/native", "vs/platform/product/common/productService", "vs/workbench/contrib/debug/common/debug", "vs/workbench/services/extensions/common/extensions"], function (require, exports, actions_1, ports_1, nls, dialogs_1, native_1, productService_1, debug_1, extensions_1) {
    "use strict";
    var DebugExtensionHostAction_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DebugExtensionHostAction = void 0;
    let DebugExtensionHostAction = class DebugExtensionHostAction extends actions_1.Action {
        static { DebugExtensionHostAction_1 = this; }
        static { this.ID = 'workbench.extensions.action.debugExtensionHost'; }
        static { this.LABEL = nls.localize('debugExtensionHost', "Start Debugging Extension Host"); }
        static { this.CSS_CLASS = 'debug-extension-host'; }
        constructor(_debugService, _nativeHostService, _dialogService, _extensionService, productService) {
            super(DebugExtensionHostAction_1.ID, DebugExtensionHostAction_1.LABEL, DebugExtensionHostAction_1.CSS_CLASS);
            this._debugService = _debugService;
            this._nativeHostService = _nativeHostService;
            this._dialogService = _dialogService;
            this._extensionService = _extensionService;
            this.productService = productService;
        }
        async run() {
            const inspectPorts = await this._extensionService.getInspectPorts(1 /* ExtensionHostKind.LocalProcess */, false);
            if (inspectPorts.length === 0) {
                const res = await this._dialogService.confirm({
                    message: nls.localize('restart1', "Profile Extensions"),
                    detail: nls.localize('restart2', "In order to profile extensions a restart is required. Do you want to restart '{0}' now?", this.productService.nameLong),
                    primaryButton: nls.localize({ key: 'restart3', comment: ['&& denotes a mnemonic'] }, "&&Restart")
                });
                if (res.confirmed) {
                    await this._nativeHostService.relaunch({ addArgs: [`--inspect-extensions=${(0, ports_1.randomPort)()}`] });
                }
                return;
            }
            if (inspectPorts.length > 1) {
                // TODO
                console.warn(`There are multiple extension hosts available for debugging. Picking the first one...`);
            }
            return this._debugService.startDebugging(undefined, {
                type: 'node',
                name: nls.localize('debugExtensionHost.launch.name', "Attach Extension Host"),
                request: 'attach',
                port: inspectPorts[0]
            });
        }
    };
    exports.DebugExtensionHostAction = DebugExtensionHostAction;
    exports.DebugExtensionHostAction = DebugExtensionHostAction = DebugExtensionHostAction_1 = __decorate([
        __param(0, debug_1.IDebugService),
        __param(1, native_1.INativeHostService),
        __param(2, dialogs_1.IDialogService),
        __param(3, extensions_1.IExtensionService),
        __param(4, productService_1.IProductService)
    ], DebugExtensionHostAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdFeHRlbnNpb25Ib3N0QWN0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZXh0ZW5zaW9ucy9lbGVjdHJvbi1zYW5kYm94L2RlYnVnRXh0ZW5zaW9uSG9zdEFjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBWXpGLElBQU0sd0JBQXdCLEdBQTlCLE1BQU0sd0JBQXlCLFNBQVEsZ0JBQU07O2lCQUNuQyxPQUFFLEdBQUcsZ0RBQWdELEFBQW5ELENBQW9EO2lCQUN0RCxVQUFLLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsRUFBRSxnQ0FBZ0MsQ0FBQyxBQUF2RSxDQUF3RTtpQkFDN0UsY0FBUyxHQUFHLHNCQUFzQixBQUF6QixDQUEwQjtRQUVuRCxZQUNpQyxhQUE0QixFQUN2QixrQkFBc0MsRUFDMUMsY0FBOEIsRUFDM0IsaUJBQW9DLEVBQ3RDLGNBQStCO1lBRWpFLEtBQUssQ0FBQywwQkFBd0IsQ0FBQyxFQUFFLEVBQUUsMEJBQXdCLENBQUMsS0FBSyxFQUFFLDBCQUF3QixDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBTnZFLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1lBQ3ZCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7WUFDMUMsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1lBQzNCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBbUI7WUFDdEMsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1FBR2xFLENBQUM7UUFFUSxLQUFLLENBQUMsR0FBRztZQUVqQixNQUFNLFlBQVksR0FBRyxNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLHlDQUFpQyxLQUFLLENBQUMsQ0FBQztZQUN6RyxJQUFJLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUM5QixNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDO29CQUM3QyxPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsb0JBQW9CLENBQUM7b0JBQ3ZELE1BQU0sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSx5RkFBeUYsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQztvQkFDekosYUFBYSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxHQUFHLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsRUFBRSxXQUFXLENBQUM7aUJBQ2pHLENBQUMsQ0FBQztnQkFDSCxJQUFJLEdBQUcsQ0FBQyxTQUFTLEVBQUU7b0JBQ2xCLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLHdCQUF3QixJQUFBLGtCQUFVLEdBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUM5RjtnQkFFRCxPQUFPO2FBQ1A7WUFFRCxJQUFJLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUM1QixPQUFPO2dCQUNQLE9BQU8sQ0FBQyxJQUFJLENBQUMsc0ZBQXNGLENBQUMsQ0FBQzthQUNyRztZQUVELE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFO2dCQUNuRCxJQUFJLEVBQUUsTUFBTTtnQkFDWixJQUFJLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxnQ0FBZ0MsRUFBRSx1QkFBdUIsQ0FBQztnQkFDN0UsT0FBTyxFQUFFLFFBQVE7Z0JBQ2pCLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDO2FBQ3JCLENBQUMsQ0FBQztRQUNKLENBQUM7O0lBMUNXLDREQUF3Qjt1Q0FBeEIsd0JBQXdCO1FBTWxDLFdBQUEscUJBQWEsQ0FBQTtRQUNiLFdBQUEsMkJBQWtCLENBQUE7UUFDbEIsV0FBQSx3QkFBYyxDQUFBO1FBQ2QsV0FBQSw4QkFBaUIsQ0FBQTtRQUNqQixXQUFBLGdDQUFlLENBQUE7T0FWTCx3QkFBd0IsQ0EyQ3BDIn0=