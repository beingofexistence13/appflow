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
define(["require", "exports", "vs/base/common/severity", "vs/base/common/lifecycle", "vs/platform/dialogs/common/dialogs", "vs/workbench/common/dialogs", "vs/platform/instantiation/common/extensions", "vs/workbench/services/environment/common/environmentService", "vs/platform/log/common/log"], function (require, exports, severity_1, lifecycle_1, dialogs_1, dialogs_2, extensions_1, environmentService_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DialogService = void 0;
    let DialogService = class DialogService extends lifecycle_1.Disposable {
        constructor(environmentService, logService) {
            super();
            this.environmentService = environmentService;
            this.logService = logService;
            this.model = this._register(new dialogs_2.DialogsModel());
            this.onWillShowDialog = this.model.onWillShowDialog;
            this.onDidShowDialog = this.model.onDidShowDialog;
        }
        skipDialogs() {
            if (this.environmentService.isExtensionDevelopment && this.environmentService.extensionTestsLocationURI) {
                return true; // integration tests
            }
            return !!this.environmentService.enableSmokeTestDriver; // smoke tests
        }
        async confirm(confirmation) {
            if (this.skipDialogs()) {
                this.logService.trace('DialogService: refused to show confirmation dialog in tests.');
                return { confirmed: true };
            }
            const handle = this.model.show({ confirmArgs: { confirmation } });
            return await handle.result;
        }
        async prompt(prompt) {
            if (this.skipDialogs()) {
                throw new Error(`DialogService: refused to show dialog in tests. Contents: ${prompt.message}`);
            }
            const handle = this.model.show({ promptArgs: { prompt } });
            return await handle.result;
        }
        async input(input) {
            if (this.skipDialogs()) {
                throw new Error('DialogService: refused to show input dialog in tests.');
            }
            const handle = this.model.show({ inputArgs: { input } });
            return await handle.result;
        }
        async info(message, detail) {
            await this.prompt({ type: severity_1.default.Info, message, detail });
        }
        async warn(message, detail) {
            await this.prompt({ type: severity_1.default.Warning, message, detail });
        }
        async error(message, detail) {
            await this.prompt({ type: severity_1.default.Error, message, detail });
        }
        async about() {
            if (this.skipDialogs()) {
                throw new Error('DialogService: refused to show about dialog in tests.');
            }
            const handle = this.model.show({});
            await handle.result;
        }
    };
    exports.DialogService = DialogService;
    exports.DialogService = DialogService = __decorate([
        __param(0, environmentService_1.IWorkbenchEnvironmentService),
        __param(1, log_1.ILogService)
    ], DialogService);
    (0, extensions_1.registerSingleton)(dialogs_1.IDialogService, DialogService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9kaWFsb2dzL2NvbW1vbi9kaWFsb2dTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVV6RixJQUFNLGFBQWEsR0FBbkIsTUFBTSxhQUFjLFNBQVEsc0JBQVU7UUFVNUMsWUFDK0Isa0JBQWlFLEVBQ2xGLFVBQXdDO1lBRXJELEtBQUssRUFBRSxDQUFDO1lBSHVDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBOEI7WUFDakUsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQVI3QyxVQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLHNCQUFZLEVBQUUsQ0FBQyxDQUFDO1lBRTNDLHFCQUFnQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUM7WUFFL0Msb0JBQWUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQztRQU90RCxDQUFDO1FBRU8sV0FBVztZQUNsQixJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxzQkFBc0IsSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMseUJBQXlCLEVBQUU7Z0JBQ3hHLE9BQU8sSUFBSSxDQUFDLENBQUMsb0JBQW9CO2FBQ2pDO1lBRUQsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLHFCQUFxQixDQUFDLENBQUMsY0FBYztRQUN2RSxDQUFDO1FBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxZQUEyQjtZQUN4QyxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRTtnQkFDdkIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsOERBQThELENBQUMsQ0FBQztnQkFFdEYsT0FBTyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQzthQUMzQjtZQUVELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsV0FBVyxFQUFFLEVBQUUsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBRWxFLE9BQU8sTUFBTSxNQUFNLENBQUMsTUFBNkIsQ0FBQztRQUNuRCxDQUFDO1FBS0QsS0FBSyxDQUFDLE1BQU0sQ0FBSSxNQUE2RTtZQUM1RixJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRTtnQkFDdkIsTUFBTSxJQUFJLEtBQUssQ0FBQyw2REFBNkQsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7YUFDL0Y7WUFFRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLFVBQVUsRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztZQUUzRCxPQUFPLE1BQU0sTUFBTSxDQUFDLE1BQWdFLENBQUM7UUFDdEYsQ0FBQztRQUVELEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBYTtZQUN4QixJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRTtnQkFDdkIsTUFBTSxJQUFJLEtBQUssQ0FBQyx1REFBdUQsQ0FBQyxDQUFDO2FBQ3pFO1lBRUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxTQUFTLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFekQsT0FBTyxNQUFNLE1BQU0sQ0FBQyxNQUFzQixDQUFDO1FBQzVDLENBQUM7UUFFRCxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQWUsRUFBRSxNQUFlO1lBQzFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksRUFBRSxrQkFBUSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBRUQsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFlLEVBQUUsTUFBZTtZQUMxQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLEVBQUUsa0JBQVEsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDaEUsQ0FBQztRQUVELEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBZSxFQUFFLE1BQWU7WUFDM0MsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxFQUFFLGtCQUFRLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQzlELENBQUM7UUFFRCxLQUFLLENBQUMsS0FBSztZQUNWLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFO2dCQUN2QixNQUFNLElBQUksS0FBSyxDQUFDLHVEQUF1RCxDQUFDLENBQUM7YUFDekU7WUFFRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNuQyxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDckIsQ0FBQztLQUNELENBQUE7SUFoRlksc0NBQWE7NEJBQWIsYUFBYTtRQVd2QixXQUFBLGlEQUE0QixDQUFBO1FBQzVCLFdBQUEsaUJBQVcsQ0FBQTtPQVpELGFBQWEsQ0FnRnpCO0lBRUQsSUFBQSw4QkFBaUIsRUFBQyx3QkFBYyxFQUFFLGFBQWEsb0NBQTRCLENBQUMifQ==