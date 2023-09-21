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
define(["require", "exports", "vs/workbench/services/extensions/common/extensions", "vs/platform/progress/common/progress", "vs/nls", "vs/base/common/async", "vs/platform/log/common/log", "vs/base/common/cancellation"], function (require, exports, extensions_1, progress_1, nls_1, async_1, log_1, cancellation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionActivationProgress = void 0;
    let ExtensionActivationProgress = class ExtensionActivationProgress {
        constructor(extensionService, progressService, logService) {
            const options = {
                location: 10 /* ProgressLocation.Window */,
                title: (0, nls_1.localize)('activation', "Activating Extensions...")
            };
            let deferred;
            let count = 0;
            this._listener = extensionService.onWillActivateByEvent(e => {
                logService.trace('onWillActivateByEvent: ', e.event);
                if (!deferred) {
                    deferred = new async_1.DeferredPromise();
                    progressService.withProgress(options, _ => deferred.p);
                }
                count++;
                Promise.race([e.activation, (0, async_1.timeout)(5000, cancellation_1.CancellationToken.None)]).finally(() => {
                    if (--count === 0) {
                        deferred.complete(undefined);
                        deferred = undefined;
                    }
                });
            });
        }
        dispose() {
            this._listener.dispose();
        }
    };
    exports.ExtensionActivationProgress = ExtensionActivationProgress;
    exports.ExtensionActivationProgress = ExtensionActivationProgress = __decorate([
        __param(0, extensions_1.IExtensionService),
        __param(1, progress_1.IProgressService),
        __param(2, log_1.ILogService)
    ], ExtensionActivationProgress);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc0FjdGl2YXRpb25Qcm9ncmVzcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2V4dGVuc2lvbnMvYnJvd3Nlci9leHRlbnNpb25zQWN0aXZhdGlvblByb2dyZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVd6RixJQUFNLDJCQUEyQixHQUFqQyxNQUFNLDJCQUEyQjtRQUl2QyxZQUNvQixnQkFBbUMsRUFDcEMsZUFBaUMsRUFDdEMsVUFBdUI7WUFHcEMsTUFBTSxPQUFPLEdBQUc7Z0JBQ2YsUUFBUSxrQ0FBeUI7Z0JBQ2pDLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxZQUFZLEVBQUUsMEJBQTBCLENBQUM7YUFDekQsQ0FBQztZQUVGLElBQUksUUFBMEMsQ0FBQztZQUMvQyxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7WUFFZCxJQUFJLENBQUMsU0FBUyxHQUFHLGdCQUFnQixDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUMzRCxVQUFVLENBQUMsS0FBSyxDQUFDLHlCQUF5QixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFFckQsSUFBSSxDQUFDLFFBQVEsRUFBRTtvQkFDZCxRQUFRLEdBQUcsSUFBSSx1QkFBZSxFQUFFLENBQUM7b0JBQ2pDLGVBQWUsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsUUFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUN4RDtnQkFFRCxLQUFLLEVBQUUsQ0FBQztnQkFFUixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxJQUFBLGVBQU8sRUFBQyxJQUFJLEVBQUUsZ0NBQWlCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUU7b0JBQ2hGLElBQUksRUFBRSxLQUFLLEtBQUssQ0FBQyxFQUFFO3dCQUNsQixRQUFTLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO3dCQUM5QixRQUFRLEdBQUcsU0FBUyxDQUFDO3FCQUNyQjtnQkFDRixDQUFDLENBQUMsQ0FBQztZQUNKLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELE9BQU87WUFDTixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzFCLENBQUM7S0FDRCxDQUFBO0lBeENZLGtFQUEyQjswQ0FBM0IsMkJBQTJCO1FBS3JDLFdBQUEsOEJBQWlCLENBQUE7UUFDakIsV0FBQSwyQkFBZ0IsQ0FBQTtRQUNoQixXQUFBLGlCQUFXLENBQUE7T0FQRCwyQkFBMkIsQ0F3Q3ZDIn0=