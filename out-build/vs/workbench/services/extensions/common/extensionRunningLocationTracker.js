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
define(["require", "exports", "vs/base/common/network", "vs/platform/configuration/common/configuration", "vs/platform/extensions/common/extensions", "vs/platform/log/common/log", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensions/common/extensionHostKind", "vs/workbench/services/extensions/common/extensionManifestPropertiesService", "vs/workbench/services/extensions/common/extensionRunningLocation"], function (require, exports, network_1, configuration_1, extensions_1, log_1, environmentService_1, extensionHostKind_1, extensionManifestPropertiesService_1, extensionRunningLocation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$L3b = exports.$K3b = exports.$J3b = void 0;
    let $J3b = class $J3b {
        get maxLocalProcessAffinity() {
            return this.b;
        }
        get maxLocalWebWorkerAffinity() {
            return this.c;
        }
        constructor(d, f, g, h, i, j) {
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.a = new extensions_1.$Xl();
            this.b = 0;
            this.c = 0;
        }
        set(extensionId, runningLocation) {
            this.a.set(extensionId, runningLocation);
        }
        readExtensionKinds(extensionDescription) {
            if (extensionDescription.isUnderDevelopment && this.g.extensionDevelopmentKind) {
                return this.g.extensionDevelopmentKind;
            }
            return this.j.getExtensionKind(extensionDescription);
        }
        getRunningLocation(extensionId) {
            return this.a.get(extensionId) || null;
        }
        filterByRunningLocation(extensions, desiredRunningLocation) {
            return $K3b(extensions, this.a, extRunningLocation => desiredRunningLocation.equals(extRunningLocation));
        }
        filterByExtensionHostKind(extensions, desiredExtensionHostKind) {
            return $K3b(extensions, this.a, extRunningLocation => extRunningLocation.kind === desiredExtensionHostKind);
        }
        filterByExtensionHostManager(extensions, extensionHostManager) {
            return $K3b(extensions, this.a, extRunningLocation => extensionHostManager.representsRunningLocation(extRunningLocation));
        }
        k(inputExtensions, extensionHostKind, isInitialAllocation) {
            // Only analyze extensions that can execute
            const extensions = new extensions_1.$Xl();
            for (const extension of inputExtensions) {
                if (extension.main || extension.browser) {
                    extensions.set(extension.identifier, extension);
                }
            }
            // Also add existing extensions of the same kind that can execute
            for (const extension of this.d.getAllExtensionDescriptions()) {
                if (extension.main || extension.browser) {
                    const runningLocation = this.a.get(extension.identifier);
                    if (runningLocation && runningLocation.kind === extensionHostKind) {
                        extensions.set(extension.identifier, extension);
                    }
                }
            }
            // Initially, each extension belongs to its own group
            const groups = new extensions_1.$Xl();
            let groupNumber = 0;
            for (const [_, extension] of extensions) {
                groups.set(extension.identifier, ++groupNumber);
            }
            const changeGroup = (from, to) => {
                for (const [key, group] of groups) {
                    if (group === from) {
                        groups.set(key, to);
                    }
                }
            };
            // We will group things together when there are dependencies
            for (const [_, extension] of extensions) {
                if (!extension.extensionDependencies) {
                    continue;
                }
                const myGroup = groups.get(extension.identifier);
                for (const depId of extension.extensionDependencies) {
                    const depGroup = groups.get(depId);
                    if (!depGroup) {
                        // probably can't execute, so it has no impact
                        continue;
                    }
                    if (depGroup === myGroup) {
                        // already in the same group
                        continue;
                    }
                    changeGroup(depGroup, myGroup);
                }
            }
            // Initialize with existing affinities
            const resultingAffinities = new Map();
            let lastAffinity = 0;
            for (const [_, extension] of extensions) {
                const runningLocation = this.a.get(extension.identifier);
                if (runningLocation) {
                    const group = groups.get(extension.identifier);
                    resultingAffinities.set(group, runningLocation.affinity);
                    lastAffinity = Math.max(lastAffinity, runningLocation.affinity);
                }
            }
            // When doing extension host debugging, we will ignore the configured affinity
            // because we can currently debug a single extension host
            if (!this.g.isExtensionDevelopment) {
                // Go through each configured affinity and try to accomodate it
                const configuredAffinities = this.h.getValue('extensions.experimental.affinity') || {};
                const configuredExtensionIds = Object.keys(configuredAffinities);
                const configuredAffinityToResultingAffinity = new Map();
                for (const extensionId of configuredExtensionIds) {
                    const configuredAffinity = configuredAffinities[extensionId];
                    if (typeof configuredAffinity !== 'number' || configuredAffinity <= 0 || Math.floor(configuredAffinity) !== configuredAffinity) {
                        this.i.info(`Ignoring configured affinity for '${extensionId}' because the value is not a positive integer.`);
                        continue;
                    }
                    const group = groups.get(extensionId);
                    if (!group) {
                        // The extension is not known or cannot execute for this extension host kind
                        continue;
                    }
                    const affinity1 = resultingAffinities.get(group);
                    if (affinity1) {
                        // Affinity for this group is already established
                        configuredAffinityToResultingAffinity.set(configuredAffinity, affinity1);
                        continue;
                    }
                    const affinity2 = configuredAffinityToResultingAffinity.get(configuredAffinity);
                    if (affinity2) {
                        // Affinity for this configuration is already established
                        resultingAffinities.set(group, affinity2);
                        continue;
                    }
                    if (!isInitialAllocation) {
                        this.i.info(`Ignoring configured affinity for '${extensionId}' because extension host(s) are already running. Reload window.`);
                        continue;
                    }
                    const affinity3 = ++lastAffinity;
                    configuredAffinityToResultingAffinity.set(configuredAffinity, affinity3);
                    resultingAffinities.set(group, affinity3);
                }
            }
            const result = new extensions_1.$Xl();
            for (const extension of inputExtensions) {
                const group = groups.get(extension.identifier) || 0;
                const affinity = resultingAffinities.get(group) || 0;
                result.set(extension.identifier, affinity);
            }
            if (lastAffinity > 0 && isInitialAllocation) {
                for (let affinity = 1; affinity <= lastAffinity; affinity++) {
                    const extensionIds = [];
                    for (const extension of inputExtensions) {
                        if (result.get(extension.identifier) === affinity) {
                            extensionIds.push(extension.identifier);
                        }
                    }
                    this.i.info(`Placing extension(s) ${extensionIds.map(e => e.value).join(', ')} on a separate extension host.`);
                }
            }
            return { affinities: result, maxAffinity: lastAffinity };
        }
        computeRunningLocation(localExtensions, remoteExtensions, isInitialAllocation) {
            return this.l(this.a, localExtensions, remoteExtensions, isInitialAllocation).runningLocation;
        }
        l(existingRunningLocation, localExtensions, remoteExtensions, isInitialAllocation) {
            // Skip extensions that have an existing running location
            localExtensions = localExtensions.filter(extension => !existingRunningLocation.has(extension.identifier));
            remoteExtensions = remoteExtensions.filter(extension => !existingRunningLocation.has(extension.identifier));
            const extensionHostKinds = (0, extensionHostKind_1.$FF)(localExtensions, remoteExtensions, (extension) => this.readExtensionKinds(extension), (extensionId, extensionKinds, isInstalledLocally, isInstalledRemotely, preference) => this.f.pickExtensionHostKind(extensionId, extensionKinds, isInstalledLocally, isInstalledRemotely, preference));
            const extensions = new extensions_1.$Xl();
            for (const extension of localExtensions) {
                extensions.set(extension.identifier, extension);
            }
            for (const extension of remoteExtensions) {
                extensions.set(extension.identifier, extension);
            }
            const result = new extensions_1.$Xl();
            const localProcessExtensions = [];
            const localWebWorkerExtensions = [];
            for (const [extensionIdKey, extensionHostKind] of extensionHostKinds) {
                let runningLocation = null;
                if (extensionHostKind === 1 /* ExtensionHostKind.LocalProcess */) {
                    const extensionDescription = extensions.get(extensionIdKey);
                    if (extensionDescription) {
                        localProcessExtensions.push(extensionDescription);
                    }
                }
                else if (extensionHostKind === 2 /* ExtensionHostKind.LocalWebWorker */) {
                    const extensionDescription = extensions.get(extensionIdKey);
                    if (extensionDescription) {
                        localWebWorkerExtensions.push(extensionDescription);
                    }
                }
                else if (extensionHostKind === 3 /* ExtensionHostKind.Remote */) {
                    runningLocation = new extensionRunningLocation_1.$IF();
                }
                result.set(extensionIdKey, runningLocation);
            }
            const { affinities, maxAffinity } = this.k(localProcessExtensions, 1 /* ExtensionHostKind.LocalProcess */, isInitialAllocation);
            for (const extension of localProcessExtensions) {
                const affinity = affinities.get(extension.identifier) || 0;
                result.set(extension.identifier, new extensionRunningLocation_1.$GF(affinity));
            }
            const { affinities: localWebWorkerAffinities, maxAffinity: maxLocalWebWorkerAffinity } = this.k(localWebWorkerExtensions, 2 /* ExtensionHostKind.LocalWebWorker */, isInitialAllocation);
            for (const extension of localWebWorkerExtensions) {
                const affinity = localWebWorkerAffinities.get(extension.identifier) || 0;
                result.set(extension.identifier, new extensionRunningLocation_1.$HF(affinity));
            }
            // Add extensions that already have an existing running location
            for (const [extensionIdKey, runningLocation] of existingRunningLocation) {
                if (runningLocation) {
                    result.set(extensionIdKey, runningLocation);
                }
            }
            return { runningLocation: result, maxLocalProcessAffinity: maxAffinity, maxLocalWebWorkerAffinity: maxLocalWebWorkerAffinity };
        }
        initializeRunningLocation(localExtensions, remoteExtensions) {
            const { runningLocation, maxLocalProcessAffinity, maxLocalWebWorkerAffinity } = this.l(this.a, localExtensions, remoteExtensions, true);
            this.a = runningLocation;
            this.b = maxLocalProcessAffinity;
            this.c = maxLocalWebWorkerAffinity;
        }
        /**
         * Returns the running locations for the removed extensions.
         */
        deltaExtensions(toAdd, toRemove) {
            // Remove old running location
            const removedRunningLocation = new extensions_1.$Xl();
            for (const extensionId of toRemove) {
                const extensionKey = extensionId;
                removedRunningLocation.set(extensionKey, this.a.get(extensionKey) || null);
                this.a.delete(extensionKey);
            }
            // Determine new running location
            this.m(toAdd);
            return removedRunningLocation;
        }
        /**
         * Update `this._runningLocation` with running locations for newly enabled/installed extensions.
         */
        m(toAdd) {
            // Determine new running location
            const localProcessExtensions = [];
            const localWebWorkerExtensions = [];
            for (const extension of toAdd) {
                const extensionKind = this.readExtensionKinds(extension);
                const isRemote = extension.extensionLocation.scheme === network_1.Schemas.vscodeRemote;
                const extensionHostKind = this.f.pickExtensionHostKind(extension.identifier, extensionKind, !isRemote, isRemote, 0 /* ExtensionRunningPreference.None */);
                let runningLocation = null;
                if (extensionHostKind === 1 /* ExtensionHostKind.LocalProcess */) {
                    localProcessExtensions.push(extension);
                }
                else if (extensionHostKind === 2 /* ExtensionHostKind.LocalWebWorker */) {
                    localWebWorkerExtensions.push(extension);
                }
                else if (extensionHostKind === 3 /* ExtensionHostKind.Remote */) {
                    runningLocation = new extensionRunningLocation_1.$IF();
                }
                this.a.set(extension.identifier, runningLocation);
            }
            const { affinities } = this.k(localProcessExtensions, 1 /* ExtensionHostKind.LocalProcess */, false);
            for (const extension of localProcessExtensions) {
                const affinity = affinities.get(extension.identifier) || 0;
                this.a.set(extension.identifier, new extensionRunningLocation_1.$GF(affinity));
            }
            const { affinities: webWorkerExtensionsAffinities } = this.k(localWebWorkerExtensions, 2 /* ExtensionHostKind.LocalWebWorker */, false);
            for (const extension of localWebWorkerExtensions) {
                const affinity = webWorkerExtensionsAffinities.get(extension.identifier) || 0;
                this.a.set(extension.identifier, new extensionRunningLocation_1.$HF(affinity));
            }
        }
    };
    exports.$J3b = $J3b;
    exports.$J3b = $J3b = __decorate([
        __param(2, environmentService_1.$hJ),
        __param(3, configuration_1.$8h),
        __param(4, log_1.$5i),
        __param(5, extensionManifestPropertiesService_1.$vcb)
    ], $J3b);
    function $K3b(extensions, runningLocation, predicate) {
        return extensions.filter((ext) => {
            const extRunningLocation = runningLocation.get(ext.identifier);
            return extRunningLocation && predicate(extRunningLocation);
        });
    }
    exports.$K3b = $K3b;
    function $L3b(extensions, runningLocation, predicate) {
        return extensions.filter((ext) => {
            const extRunningLocation = runningLocation.get(ext);
            return extRunningLocation && predicate(extRunningLocation);
        });
    }
    exports.$L3b = $L3b;
});
//# sourceMappingURL=extensionRunningLocationTracker.js.map