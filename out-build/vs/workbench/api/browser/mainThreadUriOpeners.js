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
define(["require", "exports", "vs/base/common/actions", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/network", "vs/nls!vs/workbench/api/browser/mainThreadUriOpeners", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/storage/common/storage", "vs/workbench/api/common/extHost.protocol", "vs/workbench/contrib/externalUriOpener/common/configuration", "vs/workbench/contrib/externalUriOpener/common/contributedOpeners", "vs/workbench/contrib/externalUriOpener/common/externalUriOpenerService", "vs/workbench/services/extensions/common/extensions", "../../services/extensions/common/extHostCustomers"], function (require, exports, actions_1, errors_1, lifecycle_1, network_1, nls_1, notification_1, opener_1, storage_1, extHost_protocol_1, configuration_1, contributedOpeners_1, externalUriOpenerService_1, extensions_1, extHostCustomers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$hlb = void 0;
    let $hlb = class $hlb extends lifecycle_1.$kc {
        constructor(context, storageService, externalUriOpenerService, f, g, h) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.b = new Map();
            this.a = context.getProxy(extHost_protocol_1.$2J.ExtHostUriOpeners);
            this.B(externalUriOpenerService.registerExternalOpenerProvider(this));
            this.c = this.B(new contributedOpeners_1.$dlb(storageService, f));
        }
        async *getOpeners(targetUri) {
            // Currently we only allow openers for http and https urls
            if (targetUri.scheme !== network_1.Schemas.http && targetUri.scheme !== network_1.Schemas.https) {
                return;
            }
            await this.f.activateByEvent(`onOpenExternalUri:${targetUri.scheme}`);
            for (const [id, openerMetadata] of this.b) {
                if (openerMetadata.schemes.has(targetUri.scheme)) {
                    yield this.j(id, openerMetadata);
                }
            }
        }
        j(id, metadata) {
            return {
                id: id,
                label: metadata.label,
                canOpen: (uri, token) => {
                    return this.a.$canOpenUri(id, uri, token);
                },
                openExternalUri: async (uri, ctx, token) => {
                    try {
                        await this.a.$openUri(id, { resolvedUri: uri, sourceUri: ctx.sourceUri }, token);
                    }
                    catch (e) {
                        if (!(0, errors_1.$2)(e)) {
                            const openDefaultAction = new actions_1.$gi('default', (0, nls_1.localize)(0, null), undefined, undefined, async () => {
                                await this.g.open(uri, {
                                    allowTunneling: false,
                                    allowContributedOpeners: configuration_1.$_kb,
                                });
                            });
                            openDefaultAction.tooltip = uri.toString();
                            this.h.notify({
                                severity: notification_1.Severity.Error,
                                message: (0, nls_1.localize)(1, null, id, e.toString()),



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
            if (this.b.has(id)) {
                throw new Error(`Opener with id '${id}' already registered`);
            }
            this.b.set(id, {
                schemes: new Set(schemes),
                label,
                extensionId,
            });
            this.c.didRegisterOpener(id, extensionId.value);
        }
        async $unregisterUriOpener(id) {
            this.b.delete(id);
            this.c.delete(id);
        }
        dispose() {
            super.dispose();
            this.b.clear();
        }
    };
    exports.$hlb = $hlb;
    exports.$hlb = $hlb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadUriOpeners),
        __param(1, storage_1.$Vo),
        __param(2, externalUriOpenerService_1.$flb),
        __param(3, extensions_1.$MF),
        __param(4, opener_1.$NT),
        __param(5, notification_1.$Yu)
    ], $hlb);
});
//# sourceMappingURL=mainThreadUriOpeners.js.map