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
define(["require", "exports", "vs/base/common/async", "vs/platform/encryption/common/encryptionService", "vs/platform/instantiation/common/extensions", "vs/platform/log/common/log", "vs/platform/secrets/common/secrets", "vs/platform/storage/common/storage", "vs/workbench/services/environment/browser/environmentService"], function (require, exports, async_1, encryptionService_1, extensions_1, log_1, secrets_1, storage_1, environmentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BrowserSecretStorageService = void 0;
    let BrowserSecretStorageService = class BrowserSecretStorageService extends secrets_1.BaseSecretStorageService {
        constructor(storageService, encryptionService, environmentService, logService) {
            // We don't have encryption in the browser so instead we use the
            // in-memory base class implementation instead.
            super(true, storageService, encryptionService, logService);
            if (environmentService.options?.secretStorageProvider) {
                this._secretStorageProvider = environmentService.options.secretStorageProvider;
                this._embedderSequencer = new async_1.SequencerByKey();
            }
        }
        get(key) {
            if (this._secretStorageProvider) {
                return this._embedderSequencer.queue(key, () => this._secretStorageProvider.get(key));
            }
            return super.get(key);
        }
        set(key, value) {
            if (this._secretStorageProvider) {
                return this._embedderSequencer.queue(key, async () => {
                    await this._secretStorageProvider.set(key, value);
                    this.onDidChangeSecretEmitter.fire(key);
                });
            }
            return super.set(key, value);
        }
        delete(key) {
            if (this._secretStorageProvider) {
                return this._embedderSequencer.queue(key, async () => {
                    await this._secretStorageProvider.delete(key);
                    this.onDidChangeSecretEmitter.fire(key);
                });
            }
            return super.delete(key);
        }
        get type() {
            if (this._secretStorageProvider) {
                return this._secretStorageProvider.type;
            }
            return super.type;
        }
    };
    exports.BrowserSecretStorageService = BrowserSecretStorageService;
    exports.BrowserSecretStorageService = BrowserSecretStorageService = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, encryptionService_1.IEncryptionService),
        __param(2, environmentService_1.IBrowserWorkbenchEnvironmentService),
        __param(3, log_1.ILogService)
    ], BrowserSecretStorageService);
    (0, extensions_1.registerSingleton)(secrets_1.ISecretStorageService, BrowserSecretStorageService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjcmV0U3RvcmFnZVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvc2VjcmV0cy9icm93c2VyL3NlY3JldFN0b3JhZ2VTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVV6RixJQUFNLDJCQUEyQixHQUFqQyxNQUFNLDJCQUE0QixTQUFRLGtDQUF3QjtRQUt4RSxZQUNrQixjQUErQixFQUM1QixpQkFBcUMsRUFDcEIsa0JBQXVELEVBQy9FLFVBQXVCO1lBRXBDLGdFQUFnRTtZQUNoRSwrQ0FBK0M7WUFDL0MsS0FBSyxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsaUJBQWlCLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFFM0QsSUFBSSxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUscUJBQXFCLEVBQUU7Z0JBQ3RELElBQUksQ0FBQyxzQkFBc0IsR0FBRyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMscUJBQXFCLENBQUM7Z0JBQy9FLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLHNCQUFjLEVBQVUsQ0FBQzthQUN2RDtRQUNGLENBQUM7UUFFUSxHQUFHLENBQUMsR0FBVztZQUN2QixJQUFJLElBQUksQ0FBQyxzQkFBc0IsRUFBRTtnQkFDaEMsT0FBTyxJQUFJLENBQUMsa0JBQW1CLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsc0JBQXVCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7YUFDeEY7WUFFRCxPQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdkIsQ0FBQztRQUVRLEdBQUcsQ0FBQyxHQUFXLEVBQUUsS0FBYTtZQUN0QyxJQUFJLElBQUksQ0FBQyxzQkFBc0IsRUFBRTtnQkFDaEMsT0FBTyxJQUFJLENBQUMsa0JBQW1CLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxLQUFLLElBQUksRUFBRTtvQkFDckQsTUFBTSxJQUFJLENBQUMsc0JBQXVCLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztvQkFDbkQsSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDekMsQ0FBQyxDQUFDLENBQUM7YUFDSDtZQUVELE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDOUIsQ0FBQztRQUVRLE1BQU0sQ0FBQyxHQUFXO1lBQzFCLElBQUksSUFBSSxDQUFDLHNCQUFzQixFQUFFO2dCQUNoQyxPQUFPLElBQUksQ0FBQyxrQkFBbUIsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEtBQUssSUFBSSxFQUFFO29CQUNyRCxNQUFNLElBQUksQ0FBQyxzQkFBdUIsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQy9DLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3pDLENBQUMsQ0FBQyxDQUFDO2FBQ0g7WUFFRCxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDMUIsQ0FBQztRQUVELElBQWEsSUFBSTtZQUNoQixJQUFJLElBQUksQ0FBQyxzQkFBc0IsRUFBRTtnQkFDaEMsT0FBTyxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDO2FBQ3hDO1lBRUQsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDO1FBQ25CLENBQUM7S0FDRCxDQUFBO0lBMURZLGtFQUEyQjswQ0FBM0IsMkJBQTJCO1FBTXJDLFdBQUEseUJBQWUsQ0FBQTtRQUNmLFdBQUEsc0NBQWtCLENBQUE7UUFDbEIsV0FBQSx3REFBbUMsQ0FBQTtRQUNuQyxXQUFBLGlCQUFXLENBQUE7T0FURCwyQkFBMkIsQ0EwRHZDO0lBRUQsSUFBQSw4QkFBaUIsRUFBQywrQkFBcUIsRUFBRSwyQkFBMkIsb0NBQTRCLENBQUMifQ==