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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/lifecycle", "vs/platform/instantiation/common/extensions", "vs/platform/log/common/log", "vs/platform/workspace/common/editSessions", "vs/workbench/services/extensions/common/extensions"], function (require, exports, arrays_1, lifecycle_1, extensions_1, log_1, editSessions_1, extensions_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$nyb = void 0;
    let $nyb = class $nyb {
        constructor(b, c) {
            this.b = b;
            this.c = c;
            this.a = new Map();
            this.d = [];
        }
        registerEditSessionIdentityProvider(provider) {
            if (this.a.get(provider.scheme)) {
                throw new Error(`A provider has already been registered for scheme ${provider.scheme}`);
            }
            this.a.set(provider.scheme, provider);
            return (0, lifecycle_1.$ic)(() => {
                this.a.delete(provider.scheme);
            });
        }
        async getEditSessionIdentifier(workspaceFolder, token) {
            const { scheme } = workspaceFolder.uri;
            const provider = await this.e(scheme);
            this.c.trace(`EditSessionIdentityProvider for scheme ${scheme} available: ${!!provider}`);
            return provider?.getEditSessionIdentifier(workspaceFolder, token);
        }
        async provideEditSessionIdentityMatch(workspaceFolder, identity1, identity2, cancellationToken) {
            const { scheme } = workspaceFolder.uri;
            const provider = await this.e(scheme);
            this.c.trace(`EditSessionIdentityProvider for scheme ${scheme} available: ${!!provider}`);
            return provider?.provideEditSessionIdentityMatch?.(workspaceFolder, identity1, identity2, cancellationToken);
        }
        async onWillCreateEditSessionIdentity(workspaceFolder, cancellationToken) {
            this.c.debug('Running onWillCreateEditSessionIdentity participants...');
            // TODO@joyceerhl show progress notification?
            for (const participant of this.d) {
                await participant.participate(workspaceFolder, cancellationToken);
            }
            this.c.debug(`Done running ${this.d.length} onWillCreateEditSessionIdentity participants.`);
        }
        addEditSessionIdentityCreateParticipant(participant) {
            const dispose = (0, arrays_1.$Sb)(this.d, participant);
            return (0, lifecycle_1.$ic)(() => dispose());
        }
        async e(scheme) {
            const transformedScheme = scheme === 'vscode-remote' ? 'file' : scheme;
            const provider = this.a.get(scheme);
            if (provider) {
                return provider;
            }
            await this.b.activateByEvent(`onEditSession:${transformedScheme}`);
            return this.a.get(scheme);
        }
    };
    exports.$nyb = $nyb;
    exports.$nyb = $nyb = __decorate([
        __param(0, extensions_2.$MF),
        __param(1, log_1.$5i)
    ], $nyb);
    (0, extensions_1.$mr)(editSessions_1.$8z, $nyb, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=editSessionIdentityService.js.map