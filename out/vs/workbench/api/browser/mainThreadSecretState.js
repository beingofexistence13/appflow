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
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/services/extensions/common/extHostCustomers", "../common/extHost.protocol", "vs/platform/log/common/log", "vs/base/common/async", "vs/platform/secrets/common/secrets", "vs/workbench/services/environment/browser/environmentService"], function (require, exports, lifecycle_1, extHostCustomers_1, extHost_protocol_1, log_1, async_1, secrets_1, environmentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadSecretState = void 0;
    let MainThreadSecretState = class MainThreadSecretState extends lifecycle_1.Disposable {
        constructor(extHostContext, secretStorageService, logService, environmentService) {
            super();
            this.secretStorageService = secretStorageService;
            this.logService = logService;
            this._sequencer = new async_1.SequencerByKey();
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostSecretState);
            this._register(this.secretStorageService.onDidChangeSecret((e) => {
                try {
                    const { extensionId, key } = this.parseKey(e);
                    if (extensionId && key) {
                        this._proxy.$onDidChangePassword({ extensionId, key });
                    }
                }
                catch (e) {
                    // Core can use non-JSON values as keys, so we may not be able to parse them.
                }
            }));
        }
        $getPassword(extensionId, key) {
            this.logService.trace(`[mainThreadSecretState] Getting password for ${extensionId} extension: `, key);
            return this._sequencer.queue(extensionId, () => this.doGetPassword(extensionId, key));
        }
        async doGetPassword(extensionId, key) {
            const fullKey = this.getKey(extensionId, key);
            const password = await this.secretStorageService.get(fullKey);
            this.logService.trace(`[mainThreadSecretState] ${password ? 'P' : 'No p'}assword found for: `, extensionId, key);
            return password;
        }
        $setPassword(extensionId, key, value) {
            this.logService.trace(`[mainThreadSecretState] Setting password for ${extensionId} extension: `, key);
            return this._sequencer.queue(extensionId, () => this.doSetPassword(extensionId, key, value));
        }
        async doSetPassword(extensionId, key, value) {
            const fullKey = this.getKey(extensionId, key);
            await this.secretStorageService.set(fullKey, value);
            this.logService.trace('[mainThreadSecretState] Password set for: ', extensionId, key);
        }
        $deletePassword(extensionId, key) {
            this.logService.trace(`[mainThreadSecretState] Deleting password for ${extensionId} extension: `, key);
            return this._sequencer.queue(extensionId, () => this.doDeletePassword(extensionId, key));
        }
        async doDeletePassword(extensionId, key) {
            const fullKey = this.getKey(extensionId, key);
            await this.secretStorageService.delete(fullKey);
            this.logService.trace('[mainThreadSecretState] Password deleted for: ', extensionId, key);
        }
        getKey(extensionId, key) {
            return JSON.stringify({ extensionId, key });
        }
        parseKey(key) {
            return JSON.parse(key);
        }
    };
    exports.MainThreadSecretState = MainThreadSecretState;
    exports.MainThreadSecretState = MainThreadSecretState = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadSecretState),
        __param(1, secrets_1.ISecretStorageService),
        __param(2, log_1.ILogService),
        __param(3, environmentService_1.IBrowserWorkbenchEnvironmentService)
    ], MainThreadSecretState);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZFNlY3JldFN0YXRlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9icm93c2VyL21haW5UaHJlYWRTZWNyZXRTdGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFXekYsSUFBTSxxQkFBcUIsR0FBM0IsTUFBTSxxQkFBc0IsU0FBUSxzQkFBVTtRQUtwRCxZQUNDLGNBQStCLEVBQ1Isb0JBQTRELEVBQ3RFLFVBQXdDLEVBQ2hCLGtCQUF1RDtZQUU1RixLQUFLLEVBQUUsQ0FBQztZQUpnQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ3JELGVBQVUsR0FBVixVQUFVLENBQWE7WUFMckMsZUFBVSxHQUFHLElBQUksc0JBQWMsRUFBVSxDQUFDO1lBVTFELElBQUksQ0FBQyxNQUFNLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxpQ0FBYyxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFFekUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFTLEVBQUUsRUFBRTtnQkFDeEUsSUFBSTtvQkFDSCxNQUFNLEVBQUUsV0FBVyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzlDLElBQUksV0FBVyxJQUFJLEdBQUcsRUFBRTt3QkFDdkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLFdBQVcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO3FCQUN2RDtpQkFDRDtnQkFBQyxPQUFPLENBQUMsRUFBRTtvQkFDWCw2RUFBNkU7aUJBQzdFO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRCxZQUFZLENBQUMsV0FBbUIsRUFBRSxHQUFXO1lBQzVDLElB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