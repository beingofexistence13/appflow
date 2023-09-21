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
define(["require", "exports", "vs/base/common/uri", "vs/base/common/functional", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/platform/storage/electron-main/storageMain", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataProfile/electron-main/userDataProfile", "vs/platform/uriIdentity/common/uriIdentity", "vs/base/common/network"], function (require, exports, uri_1, functional_1, event_1, lifecycle_1, environment_1, files_1, instantiation_1, lifecycleMainService_1, log_1, storage_1, storageMain_1, userDataProfile_1, userDataProfile_2, uriIdentity_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$A5b = exports.$z5b = exports.$y5b = exports.$x5b = void 0;
    //#region Storage Main Service (intent: make application, profile and workspace storage accessible to windows from main process)
    exports.$x5b = (0, instantiation_1.$Bh)('storageMainService');
    let $y5b = class $y5b extends lifecycle_1.$kc {
        constructor(c, f, g, h, j, m) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.a = undefined;
            this.b = this.B(new event_1.$fd());
            this.onDidChangeProfileStorage = this.b.event;
            //#region Application Storage
            this.applicationStorage = this.B(this.s());
            //#endregion
            //#region Profile Storage
            this.t = new Map();
            //#endregion
            //#region Workspace Storage
            this.w = new Map();
            this.r();
        }
        n() {
            return {
                useInMemoryStorage: !!this.f.extensionTestsLocationURI // no storage during extension tests!
            };
        }
        r() {
            // Application Storage: Warmup when any window opens
            (async () => {
                await this.h.when(3 /* LifecycleMainPhase.AfterWindowOpen */);
                this.applicationStorage.init();
            })();
            this.B(this.h.onWillLoadWindow(e => {
                // Profile Storage: Warmup when related window with profile loads
                if (e.window.profile) {
                    this.profileStorage(e.window.profile).init();
                }
                // Workspace Storage: Warmup when related window with workspace loads
                if (e.workspace) {
                    this.workspaceStorage(e.workspace).init();
                }
            }));
            // All Storage: Close when shutting down
            this.B(this.h.onWillShutdown(e => {
                this.c.trace('storageMainService#onWillShutdown()');
                // Remember shutdown reason
                this.a = e.reason;
                // Application Storage
                e.join('applicationStorage', this.applicationStorage.close());
                // Profile Storage(s)
                for (const [, profileStorage] of this.t) {
                    e.join('profileStorage', profileStorage.close());
                }
                // Workspace Storage(s)
                for (const [, workspaceStorage] of this.w) {
                    e.join('workspaceStorage', workspaceStorage.close());
                }
            }));
            // Prepare storage location as needed
            this.B(this.g.onWillCreateProfile(e => {
                e.join((async () => {
                    if (!(await this.j.exists(e.profile.globalStorageHome))) {
                        await this.j.createFolder(e.profile.globalStorageHome);
                    }
                })());
            }));
            // Close the storage of the profile that is being removed
            this.B(this.g.onWillRemoveProfile(e => {
                const storage = this.t.get(e.profile.id);
                if (storage) {
                    e.join(storage.close());
                }
            }));
        }
        s() {
            this.c.trace(`StorageMainService: creating application storage`);
            const applicationStorage = new storageMain_1.$s5b(this.n(), this.g, this.c, this.j);
            this.B((0, functional_1.$bb)(applicationStorage.onDidCloseStorage)(() => {
                this.c.trace(`StorageMainService: closed application storage`);
            }));
            return applicationStorage;
        }
        profileStorage(profile) {
            if ((0, storage_1.$Yo)(profile)) {
                return this.applicationStorage; // for profiles using default storage, use application storage
            }
            let profileStorage = this.t.get(profile.id);
            if (!profileStorage) {
                this.c.trace(`StorageMainService: creating profile storage (${profile.name})`);
                profileStorage = this.B(this.u(profile));
                this.t.set(profile.id, profileStorage);
                const listener = this.B(profileStorage.onDidChangeStorage(e => this.b.fire({
                    ...e,
                    storage: profileStorage,
                    profile
                })));
                this.B((0, functional_1.$bb)(profileStorage.onDidCloseStorage)(() => {
                    this.c.trace(`StorageMainService: closed profile storage (${profile.name})`);
                    this.t.delete(profile.id);
                    listener.dispose();
                }));
            }
            return profileStorage;
        }
        u(profile) {
            if (this.a === 2 /* ShutdownReason.KILL */) {
                // Workaround for native crashes that we see when
                // SQLite DBs are being created even after shutdown
                // https://github.com/microsoft/vscode/issues/143186
                return new storageMain_1.$u5b(this.c, this.j);
            }
            return new storageMain_1.$r5b(profile, this.n(), this.c, this.j);
        }
        workspaceStorage(workspace) {
            let workspaceStorage = this.w.get(workspace.id);
            if (!workspaceStorage) {
                this.c.trace(`StorageMainService: creating workspace storage (${workspace.id})`);
                workspaceStorage = this.B(this.y(workspace));
                this.w.set(workspace.id, workspaceStorage);
                this.B((0, functional_1.$bb)(workspaceStorage.onDidCloseStorage)(() => {
                    this.c.trace(`StorageMainService: closed workspace storage (${workspace.id})`);
                    this.w.delete(workspace.id);
                }));
            }
            return workspaceStorage;
        }
        y(workspace) {
            if (this.a === 2 /* ShutdownReason.KILL */) {
                // Workaround for native crashes that we see when
                // SQLite DBs are being created even after shutdown
                // https://github.com/microsoft/vscode/issues/143186
                return new storageMain_1.$u5b(this.c, this.j);
            }
            return new storageMain_1.$t5b(workspace, this.n(), this.c, this.f, this.j);
        }
        //#endregion
        isUsed(path) {
            const pathUri = uri_1.URI.file(path);
            for (const storage of [this.applicationStorage, ...this.t.values(), ...this.w.values()]) {
                if (!storage.path) {
                    continue;
                }
                if (this.m.extUri.isEqualOrParent(uri_1.URI.file(storage.path), pathUri)) {
                    return true;
                }
            }
            return false;
        }
    };
    exports.$y5b = $y5b;
    exports.$y5b = $y5b = __decorate([
        __param(0, log_1.$5i),
        __param(1, environment_1.$Ih),
        __param(2, userDataProfile_2.$v5b),
        __param(3, lifecycleMainService_1.$p5b),
        __param(4, files_1.$6j),
        __param(5, uriIdentity_1.$Ck)
    ], $y5b);
    //#endregion
    //#region Application Main Storage Service (intent: use application storage from main process)
    exports.$z5b = (0, instantiation_1.$Bh)('applicationStorageMainService');
    let $A5b = class $A5b extends storage_1.$Xo {
        constructor(s, U) {
            super();
            this.s = s;
            this.U = U;
            this.whenReady = this.U.applicationStorage.whenInit;
        }
        O() {
            // application storage is being initialized as part
            // of the first window opening, so we do not trigger
            // it here but can join it
            return this.U.applicationStorage.whenInit;
        }
        P(scope) {
            if (scope === -1 /* StorageScope.APPLICATION */) {
                return this.U.applicationStorage.storage;
            }
            return undefined; // any other scope is unsupported from main process
        }
        Q(scope) {
            if (scope === -1 /* StorageScope.APPLICATION */) {
                return this.s.defaultProfile.globalStorageHome.with({ scheme: network_1.Schemas.file }).fsPath;
            }
            return undefined; // any other scope is unsupported from main process
        }
        r() {
            return false; // not needed here, will be triggered from any window that is opened
        }
        switch() {
            throw new Error('Migrating storage is unsupported from main process');
        }
        R() {
            throw new Error('Switching storage profile is unsupported from main process');
        }
        S() {
            throw new Error('Switching storage workspace is unsupported from main process');
        }
        hasScope() {
            throw new Error('Main process is never profile or workspace scoped');
        }
    };
    exports.$A5b = $A5b;
    exports.$A5b = $A5b = __decorate([
        __param(0, userDataProfile_1.$Ek),
        __param(1, exports.$x5b)
    ], $A5b);
});
//# sourceMappingURL=storageMainService.js.map