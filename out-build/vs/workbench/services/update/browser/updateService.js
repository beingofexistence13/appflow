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
define(["require", "exports", "vs/base/common/event", "vs/platform/update/common/update", "vs/platform/instantiation/common/extensions", "vs/workbench/services/environment/browser/environmentService", "vs/workbench/services/host/browser/host", "vs/base/common/lifecycle"], function (require, exports, event_1, update_1, extensions_1, environmentService_1, host_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$WT = void 0;
    let $WT = class $WT extends lifecycle_1.$kc {
        get state() { return this.b; }
        set state(state) {
            this.b = state;
            this.a.fire(state);
        }
        constructor(c, f) {
            super();
            this.c = c;
            this.f = f;
            this.a = this.B(new event_1.$fd());
            this.onStateChange = this.a.event;
            this.b = update_1.$TT.Uninitialized;
            this.checkForUpdates(false);
        }
        async isLatestVersion() {
            const update = await this.g(false);
            if (update === undefined) {
                return undefined; // no update provider
            }
            return !!update;
        }
        async checkForUpdates(explicit) {
            await this.g(explicit);
        }
        async g(explicit) {
            if (this.c.options && this.c.options.updateProvider) {
                const updateProvider = this.c.options.updateProvider;
                // State -> Checking for Updates
                this.state = update_1.$TT.CheckingForUpdates(explicit);
                const update = await updateProvider.checkForUpdate();
                if (update) {
                    // State -> Downloaded
                    this.state = update_1.$TT.Ready({ version: update.version, productVersion: update.version });
                }
                else {
                    // State -> Idle
                    this.state = update_1.$TT.Idle(1 /* UpdateType.Archive */);
                }
                return update;
            }
            return undefined; // no update provider to ask
        }
        async downloadUpdate() {
            // no-op
        }
        async applyUpdate() {
            this.f.reload();
        }
        async quitAndInstall() {
            this.f.reload();
        }
        async _applySpecificUpdate(packagePath) {
            // noop
        }
    };
    exports.$WT = $WT;
    exports.$WT = $WT = __decorate([
        __param(0, environmentService_1.$LT),
        __param(1, host_1.$VT)
    ], $WT);
    (0, extensions_1.$mr)(update_1.$UT, $WT, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=updateService.js.map