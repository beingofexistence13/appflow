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
define(["require", "exports", "vs/base/common/actions", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/network", "vs/nls", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/storage/common/storage", "vs/workbench/api/common/extHost.protocol", "vs/workbench/contrib/externalUriOpener/common/configuration", "vs/workbench/contrib/externalUriOpener/common/contributedOpeners", "vs/workbench/contrib/externalUriOpener/common/externalUriOpenerService", "vs/workbench/services/extensions/common/extensions", "../../services/extensions/common/extHostCustomers"], function (require, exports, actions_1, errors_1, lifecycle_1, network_1, nls_1, notification_1, opener_1, storage_1, extHost_protocol_1, configuration_1, contributedOpeners_1, externalUriOpenerService_1, extensions_1, extHostCustomers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadUriOpeners = void 0;
    let MainThreadUriOpeners = class MainThreadUriOpeners extends lifecycle_1.Disposable {
        constructor(context, storageService, externalUriOpenerService, extensionService, openerService, notificationService) {
            super();
            this.extensionService = extensionService;
            this.openerService = openerService;
            this.notificationService = notificationService;
            this._registeredOpeners = new Map();
            this.proxy = context.getProxy(extHost_protocol_1.ExtHostContext.ExtHostUriOpeners);
            this._register(externalUriOpenerService.registerExternalOpenerProvider(this));
            this._contributedExternalUriOpenersStore = this._register(new contributedOpeners_1.ContributedExternalUriOpenersStore(storageService, extensionService));
        }
        async *getOpeners(targetUri) {
            // Currently we only allow openers for http and https urls
            if (targetUri.scheme !== network_1.Schemas.http && targetUri.scheme !== network_1.Schemas.https) {
                return;
            }
            await this.extensionService.activateByEvent(`onOpenExternalUri:${targetUri.scheme}`);
            for (const [id, openerMetadata] of this._registeredOpeners) {
                if (openerMetadata.schemes.has(targetUri.scheme)) {
                    yield this.createOpener(id, openerMetadata);
                }
            }
        }
        createOpener(id, metadata) {
            return {
                id: id,
                label: metadata.label,
                canOpen: (uri, token) => {
                    return this.proxy.$canOpenUri(id, uri, token);
                },
                openExternalUri: async (uri, ctx, token) => {
                    try {
                        await this.proxy.$openUri(id, { resolvedUri: uri, sourceUri: ctx.sourceUri }, token);
                    }
                    catch (e) {
                        if (!(0, errors_1.isCancellationError)(e)) {
                            const openDefaultAction = new actions_1.Action('default', (0, nls_1.localize)('openerFailedUseDefault', "Open using default opener"), undefined, undefined, async () => {
                                await this.openerService.open(uri, {
                                    allowTunneling: false,
                                    allowContributedOpeners: configuration_1.defaultExternalUriOpenerId,
                                });
                            });
                            openDefaultAction.tooltip = uri.toString();
                            this.notificationService.notify({
                                severity: notification_1.Severity.Error,
                                message: (0, nls_1.localize)({
                                    key: 'openerFailedMessage',
                                    comment: ['{0} is the id of the opener. {1} is the url being opened.'],
                                }, 'Could not open uri with \'{0}\': {1}', id, e.toString()),
                                actions: {
                                    primary: [
                                        openDefaultAction
                                    ]
                                }
                            });
                        }
                    }
                    return true;
                },
            };
        }
        async $registerUriOpener(id, schemes, extensionId, label) {
            if (this._registeredOpeners.has(id)) {
                throw new Error(`Opener with id '${id}' already registered`);
            }
            this._registeredOpeners.set(id, {
                schemes: new Set(schemes),
                label,
                extensionId,
            });
            this._contributedExternalUriOpenersStore.didRegisterOpener(id, extensionId.value);
        }
        async $unregisterUriOpener(id) {
            this._registeredOpeners.delete(id);
            this._contributedExternalUriOpenersStore.delete(id);
        }
        dispose() {
            super.dispose();
            this._registeredOpeners.clear();
        }
    };
    exports.MainThreadUriOpeners = MainThreadUriOpeners;
    exports.MainThreadUriOpeners = MainThreadUriOpeners = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadUriOpeners),
        __param(1, storage_1.IStorageService),
        __param(2, externalUriOpenerService_1.IExternalUriOpenerService),
        __param(3, extensions_1.IExtensionService),
        __param(4, opener_1.IOpenerService),
        __param(5, notification_1.INotificationService)
    ], MainThreadUriOpeners);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZFVyaU9wZW5lcnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2Jyb3dzZXIvbWFpblRocmVhZFVyaU9wZW5lcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBMEJ6RixJQUFNLG9CQUFvQixHQUExQixNQUFNLG9CQUFxQixTQUFRLHNCQUFVO1FBTW5ELFlBQ0MsT0FBd0IsRUFDUCxjQUErQixFQUNyQix3QkFBbUQsRUFDM0QsZ0JBQW9ELEVBQ3ZELGFBQThDLEVBQ3hDLG1CQUEwRDtZQUVoRixLQUFLLEVBQUUsQ0FBQztZQUo0QixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBQ3RDLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUN2Qix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXNCO1lBVGhFLHVCQUFrQixHQUFHLElBQUksR0FBRyxFQUFvQyxDQUFDO1lBWWpGLElBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxpQ0FBYyxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFFaEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyx3QkFBd0IsQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRTlFLElBQUksQ0FBQyxtQ0FBbUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksdURBQWtDLENBQUMsY0FBYyxFQUFFLGdCQUFnQixDQUFDLENBQUMsQ0FBQztRQUNySSxDQUFDO1FBRU0sS0FBSyxDQUFDLENBQUMsVUFBVSxDQUFDLFNBQWM7WUFFdEMsMERBQTBEO1lBQzFELElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxpQkFBTyxDQUFDLElBQUksSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLGlCQUFPLENBQUMsS0FBSyxFQUFFO2dCQUM1RSxPQUFPO2FBQ1A7WUFFRCxN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