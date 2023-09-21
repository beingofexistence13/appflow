/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/map", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/extensions/common/extensions"], function (require, exports, event_1, lifecycle_1, map_1, extensionManagementUtil_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionsWatcher = void 0;
    class ExtensionsWatcher extends lifecycle_1.Disposable {
        constructor(extensionManagementService, extensionsScannerService, userDataProfilesService, extensionsProfileScannerService, uriIdentityService, fileService, logService) {
            super();
            this.extensionManagementService = extensionManagementService;
            this.extensionsScannerService = extensionsScannerService;
            this.userDataProfilesService = userDataProfilesService;
            this.extensionsProfileScannerService = extensionsProfileScannerService;
            this.uriIdentityService = uriIdentityService;
            this.fileService = fileService;
            this.logService = logService;
            this._onDidChangeExtensionsByAnotherSource = this._register(new event_1.Emitter());
            this.onDidChangeExtensionsByAnotherSource = this._onDidChangeExtensionsByAnotherSource.event;
            this.allExtensions = new Map;
            this.extensionsProfileWatchDisposables = this._register(new lifecycle_1.DisposableMap());
            this.initialize().then(null, error => logService.error(error));
        }
        async initialize() {
            await this.extensionsScannerService.initializeDefaultProfileExtensions();
            await this.onDidChangeProfiles(this.userDataProfilesService.profiles);
            this.registerListeners();
            await this.uninstallExtensionsNotInProfiles();
        }
        registerListeners() {
            this._register(this.userDataProfilesService.onDidChangeProfiles(e => this.onDidChangeProfiles(e.added)));
            this._register(this.extensionsProfileScannerService.onAddExtensions(e => this.onAddExtensions(e)));
            this._register(this.extensionsProfileScannerService.onDidAddExtensions(e => this.onDidAddExtensions(e)));
            this._register(this.extensionsProfileScannerService.onRemoveExtensions(e => this.onRemoveExtensions(e)));
            this._register(this.extensionsProfileScannerService.onDidRemoveExtensions(e => this.onDidRemoveExtensions(e)));
            this._register(this.fileService.onDidFilesChange(e => this.onDidFilesChange(e)));
        }
        async onDidChangeProfiles(added) {
            try {
                if (added.length) {
                    await Promise.all(added.map(profile => {
                        this.extensionsProfileWatchDisposables.set(profile.id, (0, lifecycle_1.combinedDisposable)(this.fileService.watch(this.uriIdentityService.extUri.dirname(profile.extensionsResource)), 
                        // Also listen to the resource incase the resource is a symlink - https://github.com/microsoft/vscode/issues/118134
                        this.fileService.watch(profile.extensionsResource)));
                        return this.populateExtensionsFromProfile(profile.extensionsResource);
                    }));
                }
            }
            catch (error) {
                this.logService.error(error);
                throw error;
            }
        }
        async onAddExtensions(e) {
            for (const extension of e.extensions) {
                this.addExtensionWithKey(this.getKey(extension.identifier, extension.version), e.profileLocation);
            }
        }
        async onDidAddExtensions(e) {
            for (const extension of e.extensions) {
                const key = this.getKey(extension.identifier, extension.version);
                if (e.error) {
                    this.removeExtensionWithKey(key, e.profileLocation);
                }
                else {
                    this.addExtensionWithKey(key, e.profileLocation);
                }
            }
        }
        async onRemoveExtensions(e) {
            for (const extension of e.extensions) {
                this.removeExtensionWithKey(this.getKey(extension.identifier, extension.version), e.profileLocation);
            }
        }
        async onDidRemoveExtensions(e) {
            const extensionsToUninstall = [];
            const promises = [];
            for (const extension of e.extensions) {
                const key = this.getKey(extension.identifier, extension.version);
                if (e.error) {
                    this.addExtensionWithKey(key, e.profileLocation);
                }
                else {
                    this.removeExtensionWithKey(key, e.profileLocation);
                    if (!this.allExtensions.has(key)) {
                        this.logService.debug('Extension is removed from all profiles', extension.identifier.id, extension.version);
                        promises.push(this.extensionManagementService.scanInstalledExtensionAtLocation(extension.location)
                            .then(result => {
                            if (result) {
                                extensionsToUninstall.push(result);
                            }
                            else {
                                this.logService.info('Extension not found at the location', extension.location.toString());
                            }
                        }, error => this.logService.error(error)));
                    }
                }
            }
            try {
                await Promise.all(promises);
                if (extensionsToUninstall.length) {
                    await this.uninstallExtensionsNotInProfiles(extensionsToUninstall);
                }
            }
            catch (error) {
                this.logService.error(error);
            }
        }
        onDidFilesChange(e) {
            for (const profile of this.userDataProfilesService.profiles) {
                if (e.contains(profile.extensionsResource, 0 /* FileChangeType.UPDATED */, 1 /* FileChangeType.ADDED */)) {
                    this.onDidExtensionsProfileChange(profile.extensionsResource);
                }
            }
        }
        async onDidExtensionsProfileChange(profileLocation) {
            const added = [], removed = [];
            const extensions = await this.extensionsProfileScannerService.scanProfileExtensions(profileLocation);
            const extensionKeys = new Set();
            const cached = new Set();
            for (const [key, profiles] of this.allExtensions) {
                if (profiles.has(profileLocation)) {
                    cached.add(key);
                }
            }
            for (const extension of extensions) {
                const key = this.getKey(extension.identifier, extension.version);
                extensionKeys.add(key);
                if (!cached.has(key)) {
                    added.push(extension.identifier);
                    this.addExtensionWithKey(key, profileLocation);
                }
            }
            for (const key of cached) {
                if (!extensionKeys.has(key)) {
                    const extension = this.fromKey(key);
                    if (extension) {
                        removed.push(extension.identifier);
                        this.removeExtensionWithKey(key, profileLocation);
                    }
                }
            }
            if (added.length || removed.length) {
                this._onDidChangeExtensionsByAnotherSource.fire({ added: added.length ? { extensions: added, profileLocation } : undefined, removed: removed.length ? { extensions: removed, profileLocation } : undefined });
            }
        }
        async populateExtensionsFromProfile(extensionsProfileLocation) {
            const extensions = await this.extensionsProfileScannerService.scanProfileExtensions(extensionsProfileLocation);
            for (const extension of extensions) {
                this.addExtensionWithKey(this.getKey(extension.identifier, extension.version), extensionsProfileLocation);
            }
        }
        async uninstallExtensionsNotInProfiles(toUninstall) {
            if (!toUninstall) {
                const installed = await this.extensionManagementService.scanAllUserInstalledExtensions();
                toUninstall = installed.filter(installedExtension => !this.allExtensions.has(this.getKey(installedExtension.identifier, installedExtension.manifest.version)));
            }
            if (toUninstall.length) {
                await this.extensionManagementService.markAsUninstalled(...toUninstall);
            }
        }
        addExtensionWithKey(key, extensionsProfileLocation) {
            let profiles = this.allExtensions.get(key);
            if (!profiles) {
                this.allExtensions.set(key, profiles = new map_1.ResourceSet((uri) => this.uriIdentityService.extUri.getComparisonKey(uri)));
            }
            profiles.add(extensionsProfileLocation);
        }
        removeExtensionWithKey(key, profileLocation) {
            const profiles = this.allExtensions.get(key);
            if (profiles) {
                profiles.delete(profileLocation);
            }
            if (!profiles?.size) {
                this.allExtensions.delete(key);
            }
        }
        getKey(identifier, version) {
            return `${extensions_1.ExtensionIdentifier.toKey(identifier.id)}@${version}`;
        }
        fromKey(key) {
            const [id, version] = (0, extensionManagementUtil_1.getIdAndVersion)(key);
            return version ? { identifier: { id }, version } : undefined;
        }
    }
    exports.ExtensionsWatcher = ExtensionsWatcher;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc1dhdGNoZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9leHRlbnNpb25NYW5hZ2VtZW50L25vZGUvZXh0ZW5zaW9uc1dhdGNoZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBcUJoRyxNQUFhLGlCQUFrQixTQUFRLHNCQUFVO1FBUWhELFlBQ2tCLDBCQUFtRSxFQUNuRSx3QkFBbUQsRUFDbkQsdUJBQWlELEVBQ2pELCtCQUFpRSxFQUNqRSxrQkFBdUMsRUFDdkMsV0FBeUIsRUFDekIsVUFBdUI7WUFFeEMsS0FBSyxFQUFFLENBQUM7WUFSUywrQkFBMEIsR0FBMUIsMEJBQTBCLENBQXlDO1lBQ25FLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMkI7WUFDbkQsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUEwQjtZQUNqRCxvQ0FBK0IsR0FBL0IsK0JBQStCLENBQWtDO1lBQ2pFLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFDdkMsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFDekIsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQWJ4QiwwQ0FBcUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFtQyxDQUFDLENBQUM7WUFDL0cseUNBQW9DLEdBQUcsSUFBSSxDQUFDLHFDQUFxQyxDQUFDLEtBQUssQ0FBQztZQUVoRixrQkFBYSxHQUFHLElBQUksR0FBd0IsQ0FBQztZQUM3QyxzQ0FBaUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUkseUJBQWEsRUFBVSxDQUFDLENBQUM7WUFZaEcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDaEUsQ0FBQztRQUVPLEtB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