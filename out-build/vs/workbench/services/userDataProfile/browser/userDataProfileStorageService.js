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
define(["require", "exports", "vs/base/common/event", "vs/platform/instantiation/common/extensions", "vs/platform/log/common/log", "vs/platform/userDataProfile/common/userDataProfileStorageService", "vs/platform/storage/common/storage", "vs/workbench/services/storage/browser/storageService", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/base/common/lifecycle"], function (require, exports, event_1, extensions_1, log_1, userDataProfileStorageService_1, storage_1, storageService_1, userDataProfile_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$x4b = void 0;
    let $x4b = class $x4b extends userDataProfileStorageService_1.$fAb {
        constructor(storageService, j, m) {
            super(storageService);
            this.j = j;
            this.m = m;
            this.h = this.B(new event_1.$fd());
            this.onDidChange = this.h.event;
            const disposables = this.B(new lifecycle_1.$jc());
            this.B(event_1.Event.filter(storageService.onDidChangeTarget, e => e.scope === 0 /* StorageScope.PROFILE */, disposables)(() => this.n()));
            this.B(storageService.onDidChangeValue(0 /* StorageScope.PROFILE */, undefined, disposables)(e => this.r(e)));
        }
        n() {
            // Not broadcasting changes to other windows/tabs as it is not required in web.
            // Revisit if needed in future.
            this.h.fire({ targetChanges: [this.j.currentProfile], valueChanges: [] });
        }
        r(e) {
            // Not broadcasting changes to other windows/tabs as it is not required in web
            // Revisit if needed in future.
            this.h.fire({ targetChanges: [], valueChanges: [{ profile: this.j.currentProfile, changes: [e] }] });
        }
        g(profile) {
            return (0, storage_1.$Yo)(profile) ? storageService_1.$A2b.createApplicationStorage(this.m) : storageService_1.$A2b.createProfileStorage(profile, this.m);
        }
    };
    exports.$x4b = $x4b;
    exports.$x4b = $x4b = __decorate([
        __param(0, storage_1.$Vo),
        __param(1, userDataProfile_1.$CJ),
        __param(2, log_1.$5i)
    ], $x4b);
    (0, extensions_1.$mr)(userDataProfileStorageService_1.$eAb, $x4b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=userDataProfileStorageService.js.map