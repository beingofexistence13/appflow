/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/map", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/extensions/common/extensions"], function (require, exports, event_1, lifecycle_1, map_1, extensionManagementUtil_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$xp = void 0;
    class $xp extends lifecycle_1.$kc {
        constructor(f, g, h, j, m, n, r) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.a = this.B(new event_1.$fd());
            this.onDidChangeExtensionsByAnotherSource = this.a.event;
            this.b = new Map;
            this.c = this.B(new lifecycle_1.$sc());
            this.s().then(null, error => r.error(error));
        }
        async s() {
            await this.g.initializeDefaultProfileExtensions();
            await this.u(this.h.profiles);
            this.t();
            await this.H();
        }
        t() {
            this.B(this.h.onDidChangeProfiles(e => this.u(e.added)));
            this.B(this.j.onAddExtensions(e => this.w(e)));
            this.B(this.j.onDidAddExtensions(e => this.y(e)));
            this.B(this.j.onRemoveExtensions(e => this.z(e)));
            this.B(this.j.onDidRemoveExtensions(e => this.C(e)));
            this.B(this.n.onDidFilesChange(e => this.D(e)));
        }
        async u(added) {
            try {
                if (added.length) {
                    await Promise.all(added.map(profile => {
                        this.c.set(profile.id, (0, lifecycle_1.$hc)(this.n.watch(this.m.extUri.dirname(profile.extensionsResource)), 
                        // Also listen to the resource incase the resource is a symlink - https://github.com/microsoft/vscode/issues/118134
                        this.n.watch(profile.extensionsResource)));
                        return this.G(profile.extensionsResource);
                    }));
                }
            }
            catch (error) {
                this.r.error(error);
                throw error;
            }
        }
        async w(e) {
            for (const extension of e.extensions) {
                this.I(this.L(extension.identifier, extension.version), e.profileLocation);
            }
        }
        async y(e) {
            for (const extension of e.extensions) {
                const key = this.L(extension.identifier, extension.version);
                if (e.error) {
                    this.J(key, e.profileLocation);
                }
                else {
                    this.I(key, e.profileLocation);
                }
            }
        }
        async z(e) {
            for (const extension of e.extensions) {
                this.J(this.L(extension.identifier, extension.version), e.profileLocation);
            }
        }
        async C(e) {
            const extensionsToUninstall = [];
            const promises = [];
            for (const extension of e.extensions) {
                const key = this.L(extension.identifier, extension.version);
                if (e.error) {
                    this.I(key, e.profileLocation);
                }
                else {
                    this.J(key, e.profileLocation);
                    if (!this.b.has(key)) {
                        this.r.debug('Extension is removed from all profiles', extension.identifier.id, extension.version);
                        promises.push(this.f.scanInstalledExtensionAtLocation(extension.location)
                            .then(result => {
                            if (result) {
                                extensionsToUninstall.push(result);
                            }
                            else {
                                this.r.info('Extension not found at the location', extension.location.toString());
                            }
                        }, error => this.r.error(error)));
                    }
                }
            }
            try {
                await Promise.all(promises);
                if (extensionsToUninstall.length) {
                    await this.H(extensionsToUninstall);
                }
            }
            catch (error) {
                this.r.error(error);
            }
        }
        D(e) {
            for (const profile of this.h.profiles) {
                if (e.contains(profile.extensionsResource, 0 /* FileChangeType.UPDATED */, 1 /* FileChangeType.ADDED */)) {
                    this.F(profile.extensionsResource);
                }
            }
        }
        async F(profileLocation) {
            const added = [], removed = [];
            const extensions = await this.j.scanProfileExtensions(profileLocation);
            const extensionKeys = new Set();
            const cached = new Set();
            for (const [key, profiles] of this.b) {
                if (profiles.has(profileLocation)) {
                    cached.add(key);
                }
            }
            for (const extension of extensions) {
                const key = this.L(extension.identifier, extension.version);
                extensionKeys.add(key);
                if (!cached.has(key)) {
                    added.push(extension.identifier);
                    this.I(key, profileLocation);
                }
            }
            for (const key of cached) {
                if (!extensionKeys.has(key)) {
                    const extension = this.M(key);
                    if (extension) {
                        removed.push(extension.identifier);
                        this.J(key, profileLocation);
                    }
                }
            }
            if (added.length || removed.length) {
                this.a.fire({ added: added.length ? { extensions: added, profileLocation } : undefined, removed: removed.length ? { extensions: removed, profileLocation } : undefined });
            }
        }
        async G(extensionsProfileLocation) {
            const extensions = await this.j.scanProfileExtensions(extensionsProfileLocation);
            for (const extension of extensions) {
                this.I(this.L(extension.identifier, extension.version), extensionsProfileLocation);
            }
        }
        async H(toUninstall) {
            if (!toUninstall) {
                const installed = await this.f.scanAllUserInstalledExtensions();
                toUninstall = installed.filter(installedExtension => !this.b.has(this.L(installedExtension.identifier, installedExtension.manifest.version)));
            }
            if (toUninstall.length) {
                await this.f.markAsUninstalled(...toUninstall);
            }
        }
        I(key, extensionsProfileLocation) {
            let profiles = this.b.get(key);
            if (!profiles) {
                this.b.set(key, profiles = new map_1.$Ai((uri) => this.m.extUri.getComparisonKey(uri)));
            }
            profiles.add(extensionsProfileLocation);
        }
        J(key, profileLocation) {
            const profiles = this.b.get(key);
            if (profiles) {
                profiles.delete(profileLocation);
            }
            if (!profiles?.size) {
                this.b.delete(key);
            }
        }
        L(identifier, version) {
            return `${extensions_1.$Vl.toKey(identifier.id)}@${version}`;
        }
        M(key) {
            const [id, version] = (0, extensionManagementUtil_1.$ro)(key);
            return version ? { identifier: { id }, version } : undefined;
        }
    }
    exports.$xp = $xp;
});
//# sourceMappingURL=extensionsWatcher.js.map