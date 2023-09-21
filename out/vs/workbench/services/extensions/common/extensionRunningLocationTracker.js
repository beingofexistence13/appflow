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
    exports.filterExtensionIdentifiers = exports.filterExtensionDescriptions = exports.ExtensionRunningLocationTracker = void 0;
    let ExtensionRunningLocationTracker = class ExtensionRunningLocationTracker {
        get maxLocalProcessAffinity() {
            return this._maxLocalProcessAffinity;
        }
        get maxLocalWebWorkerAffinity() {
            return this._maxLocalWebWorkerAffinity;
        }
        constructor(_registry, _extensionHostKindPicker, _environmentService, _configurationService, _logService, _extensionManifestPropertiesService) {
            this._registry = _registry;
            this._extensionHostKindPicker = _extensionHostKindPicker;
            this._environmentService = _environmentService;
            this._configurationService = _configurationService;
            this._logService = _logService;
            this._extensionManifestPropertiesService = _extensionManifestPropertiesService;
            this._runningLocation = new extensions_1.ExtensionIdentifierMap();
            this._maxLocalProcessAffinity = 0;
            this._maxLocalWebWorkerAffinity = 0;
        }
        set(extensionId, runningLocation) {
            this._runningLocation.set(extensionId, runningLocation);
        }
        readExtensionKinds(extensionDescription) {
            if (extensionDescription.isUnderDevelopment && this._environmentService.extensionDevelopmentKind) {
                return this._environmentService.extensionDevelopmentKind;
            }
            return this._extensionManifestPropertiesService.getExtensionKind(extensionDescription);
        }
        getRunningLocation(extensionId) {
            return this._runningLocation.get(extensionId) || null;
        }
        filterByRunningLocation(extensions, desiredRunningLocation) {
            return filterExtensionDescriptions(extensions, this._runningLocation, extRunningLocation => desiredRunningLocation.equals(extRunningLocation));
        }
        filterByExtensionHostKind(extensions, desiredExtensionHostKind) {
            return filterExtensionDescriptions(extensions, this._runningLocation, extRunningLocation => extRunningLocation.kind === desiredExtensionHostKind);
        }
        filterByExtensionHostManager(extensions, extensionHostManager) {
            return filterExtensionDescriptions(extensions, this._runningLocation, extRunningLocation => extensionHostManager.representsRunningLocation(extRunningLocation));
        }
        _computeAffinity(inputExtensions, extensionHostKind, isInitialAllocation) {
            // Only analyze extensions that can execute
            const extensions = new extensions_1.ExtensionIdentifierMap();
            for (const extension of inputExtensions) {
                if (extension.main || extension.browser) {
                    extensions.set(extension.identifier, extension);
                }
            }
            // Also add existing extensions of the same kind that can execute
            for (const extension of this._registry.getAllExtensionDescriptions()) {
                if (extension.main || extension.browser) {
                    const runningLocation = this._runningLocation.get(extension.identifier);
                    if (runningLocation && runningLocation.kind === extensionHostKind) {
                        extensions.set(extension.identifier, extension);
                    }
                }
            }
            // Initially, each extension belongs to its own group
            const groups = new extensions_1.ExtensionIdentifierMap();
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
                const runningLocation = this._runningLocation.get(extension.identifier);
                if (runningLocation) {
                    const group = groups.get(extension.identifier);
                    resultingAffinities.set(group, runningLocation.affinity);
                    lastAffinity = Math.max(lastAffinity, runningLocation.affinity);
                }
            }
            // When doing extension host debugging, we will ignore the configured affinity
            // because we can currently debug a single extension host
            if (!this._environmentService.isExtensionDevelopment) {
                // Go through each configured affinity and try to accomodate it
                const configuredAffinities = this._configurationService.getValue('extensions.experimental.affinity') || {};
                const configuredExtensionIds = Object.keys(configuredAffinities);
                const configuredAffinityToResultingAffinity = new Map();
                for (const extensionId of configuredExtensionIds) {
                    const configuredAffinity = configuredAffinities[extensionId];
                    if (typeof configuredAffinity !== 'number' || configuredAffinity <= 0 || Math.floor(configuredAffinity) !== configuredAffinity) {
                        this._logService.info(`Ignoring configured affinity for '${extensionId}' because the value is not a positive integer.`);
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
                        this._logService.info(`Ignoring configured affinity for '${extensionId}' because extension host(s) are already running. Reload window.`);
                        continue;
                    }
                    const affinity3 = ++lastAffinity;
                    configuredAffinityToResultingAffinity.set(configuredAffinity, affinity3);
                    resultingAffinities.set(group, affinity3);
                }
            }
            const result = new extensions_1.ExtensionIdentifierMap();
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
                    this._logService.info(`Placing extension(s) ${extensionIds.map(e => e.value).join(', ')} on a separate extension host.`);
                }
            }
            return { affinities: result, maxAffinity: lastAffinity };
        }
        computeRunningLocation(localExtensions, remoteExtensions, isInitialAllocation) {
            return this._doComputeRunningLocation(this._runningLocation, localExtensions, remoteExtensions, isInitialAllocation).runningLocation;
        }
        _doComputeRunningLocation(existingRunningLocation, localExtensions, remoteExtensions, isInitialAllocation) {
            // Skip extensions that have an existing running location
            localExtensions = localExtensions.filter(extension => !existingRunningLocation.has(extension.identifier));
            remoteExtensions = remoteExtensions.filter(extension => !existingRunningLocation.has(extension.identifier));
            const extensionHostKinds = (0, extensionHostKind_1.determineExtensionHostKinds)(localExtensions, remoteExtensions, (extension) => this.readExtensionKinds(extension), (extensionId, extensionKinds, isInstalledLocally, isInstalledRemotely, preference) => this._extensionHostKindPicker.pickExtensionHostKind(extensionId, extensionKinds, isInstalledLocally, isInstalledRemotely, preference));
            const extensions = new extensions_1.ExtensionIdentifierMap();
            for (const extension of localExtensions) {
                extensions.set(extension.identifier, extension);
            }
            for (const extension of remoteExtensions) {
                extensions.set(extension.identifier, extension);
            }
            const result = new extensions_1.ExtensionIdentifierMap();
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
                    runningLocation = new extensionRunningLocation_1.RemoteRunningLocation();
                }
                result.set(extensionIdKey, runningLocation);
            }
            const { affinities, maxAffinity } = this._computeAffinity(localProcessExtensions, 1 /* ExtensionHostKind.LocalProcess */, isInitialAllocation);
            for (const extension of localProcessExtensions) {
                const affinity = affinities.get(extension.identifier) || 0;
                result.set(extension.identifier, new extensionRunningLocation_1.LocalProcessRunningLocation(affinity));
            }
            const { affinities: localWebWorkerAffinities, maxAffinity: maxLocalWebWorkerAffinity } = this._computeAffinity(localWebWorkerExtensions, 2 /* ExtensionHostKind.LocalWebWorker */, isInitialAllocation);
            for (const extension of localWebWorkerExtensions) {
                const affinity = localWebWorkerAffinities.get(extension.identifier) || 0;
                result.set(extension.identifier, new extensionRunningLocation_1.LocalWebWorkerRunningLocation(affinity));
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
            const { runningLocation, maxLocalProcessAffinity, maxLocalWebWorkerAffinity } = this._doComputeRunningLocation(this._runningLocation, localExtensions, remoteExtensions, true);
            this._runningLocation = runningLocation;
            this._maxLocalProcessAffinity = maxLocalProcessAffinity;
            this._maxLocalWebWorkerAffinity = maxLocalWebWorkerAffinity;
        }
        /**
         * Returns the running locations for the removed extensions.
         */
        deltaExtensions(toAdd, toRemove) {
            // Remove old running location
            const removedRunningLocation = new extensions_1.ExtensionIdentifierMap();
            for (const extensionId of toRemove) {
                const extensionKey = extensionId;
                removedRunningLocation.set(extensionKey, this._runningLocation.get(extensionKey) || null);
                this._runningLocation.delete(extensionKey);
            }
            // Determine new running location
            this._updateRunningLocationForAddedExtensions(toAdd);
            return removedRunningLocation;
        }
        /**
         * Update `this._runningLocation` with running locations for newly enabled/installed extensions.
         */
        _updateRunningLocationForAddedExtensions(toAdd) {
            // Determine new running location
            const localProcessExtensions = [];
            const localWebWorkerExtensions = [];
            for (const extension of toAdd) {
                const extensionKind = this.readExtensionKinds(extension);
                const isRemote = extension.extensionLocation.scheme === network_1.Schemas.vscodeRemote;
                const extensionHostKind = this._extensionHostKindPicker.pickExtensionHostKind(extension.identifier, extensionKind, !isRemote, isRemote, 0 /* ExtensionRunningPreference.None */);
                let runningLocation = null;
                if (extensionHostKind === 1 /* ExtensionHostKind.LocalProcess */) {
                    localProcessExtensions.push(extension);
                }
                else if (extensionHostKind === 2 /* ExtensionHostKind.LocalWebWorker */) {
                    localWebWorkerExtensions.push(extension);
                }
                else if (extensionHostKind === 3 /* ExtensionHostKind.Remote */) {
                    runningLocation = new extensionRunningLocation_1.RemoteRunningLocation();
                }
                this._runningLocation.set(extension.identifier, runningLocation);
            }
            const { affinities } = this._computeAffinity(localProcessExtensions, 1 /* ExtensionHostKind.LocalProcess */, false);
            for (const extension of localProcessExtensions) {
                const affinity = affinities.get(extension.identifier) || 0;
                this._runningLocation.set(extension.identifier, new extensionRunningLocation_1.LocalProcessRunningLocation(affinity));
            }
            const { affinities: webWorkerExtensionsAffinities } = this._computeAffinity(localWebWorkerExtensions, 2 /* ExtensionHostKind.LocalWebWorker */, false);
            for (const extension of localWebWorkerExtensions) {
                const affinity = webWorkerExtensionsAffinities.get(extension.identifier) || 0;
                this._runningLocation.set(extension.identifier, new extensionRunningLocation_1.LocalWebWorkerRunningLocation(affinity));
            }
        }
    };
    exports.ExtensionRunningLocationTracker = ExtensionRunningLocationTracker;
    exports.ExtensionRunningLocationTracker = ExtensionRunningLocationTracker = __decorate([
        __param(2, environmentService_1.IWorkbenchEnvironmentService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, log_1.ILogService),
        __param(5, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService)
    ], ExtensionRunningLocationTracker);
    function filterExtensionDescriptions(extensions, runningLocation, predicate) {
        return extensions.filter((ext) => {
            const extRunningLocation = runningLocation.get(ext.identifier);
            return extRunningLocation && predicate(extRunningLocation);
        });
    }
    exports.filterExtensionDescriptions = filterExtensionDescriptions;
    function filterExtensionIdentifiers(extensions, runningLocation, predicate) {
        return extensions.filter((ext) => {
            const extRunningLocation = runningLocation.get(ext);
            return extRunningLocation && predicate(extRunningLocation);
        });
    }
    exports.filterExtensionIdentifiers = filterExtensionIdentifiers;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uUnVubmluZ0xvY2F0aW9uVHJhY2tlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9leHRlbnNpb25zL2NvbW1vbi9leHRlbnNpb25SdW5uaW5nTG9jYXRpb25UcmFja2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWN6RixJQUFNLCtCQUErQixHQUFyQyxNQUFNLCtCQUErQjtRQU0zQyxJQUFXLHVCQUF1QjtZQUNqQyxPQUFPLElBQUksQ0FBQyx3QkFBd0IsQ0FBQztRQUN0QyxDQUFDO1FBRUQsSUFBVyx5QkFBeUI7WUFDbkMsT0FBTyxJQUFJLENBQUMsMEJBQTBCLENBQUM7UUFDeEMsQ0FBQztRQUVELFlBQ2tCLFNBQWdELEVBQ2hELHdCQUFrRCxFQUNyQyxtQkFBa0UsRUFDekUscUJBQTZELEVBQ3ZFLFdBQXlDLEVBQ2pCLG1DQUF5RjtZQUw3RyxjQUFTLEdBQVQsU0FBUyxDQUF1QztZQUNoRCw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1lBQ3BCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBOEI7WUFDeEQsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUN0RCxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQUNBLHdDQUFtQyxHQUFuQyxtQ0FBbUMsQ0FBcUM7WUFsQnZILHFCQUFnQixHQUFHLElBQUksbUNBQXNCLEVBQW1DLENBQUM7WUFDakYsNkJBQXdCLEdBQVcsQ0FBQyxDQUFDO1lBQ3JDLCtCQUEwQixHQUFXLENBQUMsQ0FBQztRQWlCM0MsQ0FBQztRQUVFLEdBQUcsQ0FBQyxXQUFnQyxFQUFFLGVBQXlDO1lBQ3JGLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQ3pELENBQUM7UUFFTSxrQkFBa0IsQ0FBQyxvQkFB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