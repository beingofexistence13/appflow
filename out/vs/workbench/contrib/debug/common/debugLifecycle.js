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
define(["require", "exports", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/dialogs/common/dialogs", "vs/workbench/contrib/debug/common/debug", "vs/workbench/services/lifecycle/common/lifecycle"], function (require, exports, nls, configuration_1, dialogs_1, debug_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DebugLifecycle = void 0;
    let DebugLifecycle = class DebugLifecycle {
        constructor(lifecycleService, debugService, configurationService, dialogService) {
            this.debugService = debugService;
            this.configurationService = configurationService;
            this.dialogService = dialogService;
            lifecycleService.onBeforeShutdown(async (e) => e.veto(this.shouldVetoShutdown(e.reason), 'veto.debug'));
        }
        shouldVetoShutdown(_reason) {
            const rootSessions = this.debugService.getModel().getSessions().filter(s => s.parentSession === undefined);
            if (rootSessions.length === 0) {
                return false;
            }
            const shouldConfirmOnExit = this.configurationService.getValue('debug').confirmOnExit;
            if (shouldConfirmOnExit === 'never') {
                return false;
            }
            return this.showWindowCloseConfirmation(rootSessions.length);
        }
        async showWindowCloseConfirmation(numSessions) {
            let message;
            if (numSessions === 1) {
                message = nls.localize('debug.debugSessionCloseConfirmationSingular', "There is an active debug session, are you sure you want to stop it?");
            }
            else {
                message = nls.localize('debug.debugSessionCloseConfirmationPlural', "There are active debug sessions, are you sure you want to stop them?");
            }
            const res = await this.dialogService.confirm({
                message,
                type: 'warning',
                primaryButton: nls.localize({ key: 'debug.stop', comment: ['&& denotes a mnemonic'] }, "&&Stop Debugging")
            });
            return !res.confirmed;
        }
    };
    exports.DebugLifecycle = DebugLifecycle;
    exports.DebugLifecycle = DebugLifecycle = __decorate([
        __param(0, lifecycle_1.ILifecycleService),
        __param(1, debug_1.IDebugService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, dialogs_1.IDialogService)
    ], DebugLifecycle);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdMaWZlY3ljbGUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9kZWJ1Zy9jb21tb24vZGVidWdMaWZlY3ljbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBU3pGLElBQU0sY0FBYyxHQUFwQixNQUFNLGNBQWM7UUFDMUIsWUFDb0IsZ0JBQW1DLEVBQ3RCLFlBQTJCLEVBQ25CLG9CQUEyQyxFQUNsRCxhQUE2QjtZQUY5QixpQkFBWSxHQUFaLFlBQVksQ0FBZTtZQUNuQix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ2xELGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUU5RCxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUN2RyxDQUFDO1FBRU8sa0JBQWtCLENBQUMsT0FBdUI7WUFDakQsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsYUFBYSxLQUFLLFNBQVMsQ0FBQyxDQUFDO1lBQzNHLElBQUksWUFBWSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQzlCLE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFFRCxNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQXNCLE9BQU8sQ0FBQyxDQUFDLGFBQWEsQ0FBQztZQUMzRyxJQUFJLG1CQUFtQixLQUFLLE9BQU8sRUFBRTtnQkFDcEMsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELE9BQU8sSUFBSSxDQUFDLDJCQUEyQixDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM5RCxDQUFDO1FBRU8sS0FBSyxDQUFDLDJCQUEyQixDQUFDLFdBQW1CO1lBQzVELElBQUksT0FBZSxDQUFDO1lBQ3BCLElBQUksV0FBVyxLQUFLLENBQUMsRUFBRTtnQkFDdEIsT0FBTyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsNkNBQTZDLEVBQUUscUVBQXFFLENBQUMsQ0FBQzthQUM3STtpQkFBTTtnQkFDTixPQUFPLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQywyQ0FBMkMsRUFBRSxzRUFBc0UsQ0FBQyxDQUFDO2FBQzVJO1lBQ0QsTUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQztnQkFDNUMsT0FBTztnQkFDUCxJQUFJLEVBQUUsU0FBUztnQkFDZixhQUFhLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLENBQUMsdUJBQXVCLENBQUMsRUFBRSxFQUFFLGtCQUFrQixDQUFDO2FBQzFHLENBQUMsQ0FBQztZQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDO1FBQ3ZCLENBQUM7S0FDRCxDQUFBO0lBdENZLHdDQUFjOzZCQUFkLGNBQWM7UUFFeEIsV0FBQSw2QkFBaUIsQ0FBQTtRQUNqQixXQUFBLHFCQUFhLENBQUE7UUFDYixXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEsd0JBQWMsQ0FBQTtPQUxKLGNBQWMsQ0FzQzFCIn0=