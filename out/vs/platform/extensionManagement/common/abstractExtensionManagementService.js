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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/types", "vs/base/common/uri", "vs/nls", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/extensions/common/extensions", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/telemetry/common/telemetry", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/userDataProfile/common/userDataProfile"], function (require, exports, arrays_1, async_1, cancellation_1, errors_1, event_1, lifecycle_1, platform_1, types_1, uri_1, nls, extensionManagement_1, extensionManagementUtil_1, extensions_1, log_1, productService_1, telemetry_1, uriIdentity_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractExtensionTask = exports.toExtensionManagementError = exports.joinErrors = exports.AbstractExtensionManagementService = void 0;
    let AbstractExtensionManagementService = class AbstractExtensionManagementService extends lifecycle_1.Disposable {
        get onInstallExtension() { return this._onInstallExtension.event; }
        get onDidInstallExtensions() { return this._onDidInstallExtensions.event; }
        get onUninstallExtension() { return this._onUninstallExtension.event; }
        get onDidUninstallExtension() { return this._onDidUninstallExtension.event; }
        get onDidUpdateExtensionMetadata() { return this._onDidUpdateExtensionMetadata.event; }
        constructor(galleryService, telemetryService, uriIdentityService, logService, productService, userDataProfilesService) {
            super();
            this.galleryService = galleryService;
            this.telemetryService = telemetryService;
            this.uriIdentityService = uriIdentityService;
            this.logService = logService;
            this.productService = productService;
            this.userDataProfilesService = userDataProfilesService;
            this.lastReportTimestamp = 0;
            this.installingExtensions = new Map();
            this.uninstallingExtensions = new Map();
            this._onInstallExtension = this._register(new event_1.Emitter());
            this._onDidInstallExtensions = this._register(new event_1.Emitter());
            this._onUninstallExtension = this._register(new event_1.Emitter());
            this._onDidUninstallExtension = this._register(new event_1.Emitter());
            this._onDidUpdateExtensionMetadata = this._register(new event_1.Emitter());
            this.participants = [];
            this._register((0, lifecycle_1.toDisposable)(() => {
                this.installingExtensions.forEach(({ task }) => task.cancel());
                this.uninstallingExtensions.forEach(promise => promise.cancel());
                this.installingExtensions.clear();
                this.uninstallingExtensions.clear();
            }));
        }
        async canInstall(extension) {
            const currentTargetPlatform = await this.getTargetPlatform();
            return extension.allTargetPlatforms.some(targetPlatform => (0, extensionManagement_1.isTargetPlatformCompatible)(targetPlatform, extension.allTargetPlatforms, currentTargetPlatform));
        }
        async installFromGallery(extension, options = {}) {
            try {
                const results = await this.installGalleryExtensions([{ extension, options }]);
                const result = results.find(({ identifier }) => (0, extensionManagementUtil_1.areSameExtensions)(identifier, extension.identifier));
                if (result?.local) {
                    return result?.local;
                }
                if (result?.error) {
                    throw result.error;
                }
                throw toExtensionManagementError(new Error(`Unknown error while installing extension ${extension.identifier.id}`));
            }
            catch (error) {
                throw toExtensionManagementError(error);
            }
        }
        async installGalleryExtensions(extensions) {
            if (!this.galleryService.isEnabled()) {
                throw new extensionManagement_1.ExtensionManagementError(nls.localize('MarketPlaceDisabled', "Marketplace is not enabled"), extensionManagement_1.ExtensionManagementErrorCode.Internal);
            }
            const results = [];
            const installableExtensions = [];
            await Promise.allSettled(extensions.map(async ({ extension, options }) => {
                try {
                    const compatible = await this.checkAndGetCompatibleVersion(extension, !!options?.installGivenVersion, !!options?.installPreReleaseVersion);
                    installableExtensions.push({ ...compatible, options });
                }
                catch (error) {
                    results.push({ identifier: extension.identifier, operation: 2 /* InstallOperation.Install */, source: extension, error });
                }
            }));
            if (installableExtensions.length) {
                results.push(...await this.installExtensions(installableExtensions));
            }
            for (const result of results) {
                if (result.error) {
                    this.logService.error(`Failed to install extension.`, result.identifier.id);
                    this.logService.error(result.error);
                    if (result.source && !uri_1.URI.isUri(result.source)) {
                        reportTelemetry(this.telemetryService, 'extensionGallery:install', { extensionData: (0, extensionManagementUtil_1.getGalleryExtensionTelemetryData)(result.source), error: result.error });
                    }
                }
            }
            return results;
        }
        async uninstall(extension, options = {}) {
            this.logService.trace('ExtensionManagementService#uninstall', extension.identifier.id);
            return this.uninstallExtension(extension, options);
        }
        async toggleAppliationScope(extension, fromProfileLocation) {
            if ((0, extensions_1.isApplicationScopedExtension)(extension.manifest) || extension.isBuiltin) {
                return extension;
            }
            if (extension.isApplicationScoped) {
                let local = await this.updateMetadata(extension, { isApplicationScoped: false }, this.userDataProfilesService.defaultProfile.extensionsResource);
                if (!this.uriIdentityService.extUri.isEqual(fromProfileLocation, this.userDataProfilesService.defaultProfile.extensionsResource)) {
                    local = await this.copyExtension(extension, this.userDataProfilesService.defaultProfile.extensionsResource, fromProfileLocation);
                }
                for (const profile of this.userDataProfilesService.profiles) {
                    const existing = (await this.getInstalled(1 /* ExtensionType.User */, profile.extensionsResource))
                        .find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, extension.identifier));
                    if (existing) {
                        this._onDidUpdateExtensionMetadata.fire(existing);
                    }
                    else {
                        this._onDidUninstallExtension.fire({ identifier: extension.identifier, profileLocation: profile.extensionsResource });
                    }
                }
                return local;
            }
            else {
                const local = this.uriIdentityService.extUri.isEqual(fromProfileLocation, this.userDataProfilesService.defaultProfile.extensionsResource)
                    ? await this.updateMetadata(extension, { isApplicationScoped: true }, this.userDataProfilesService.defaultProfile.extensionsResource)
                    : await this.copyExtension(extension, fromProfileLocation, this.userDataProfilesService.defaultProfile.extensionsResource, { isApplicationScoped: true });
                this._onDidInstallExtensions.fire([{ identifier: local.identifier, operation: 2 /* InstallOperation.Install */, local, profileLocation: this.userDataProfilesService.defaultProfile.extensionsResource, applicationScoped: true }]);
                return local;
            }
        }
        getExtensionsControlManifest() {
            const now = new Date().getTime();
            if (!this.extensionsControlManifest || now - this.lastReportTimestamp > 1000 * 60 * 5) { // 5 minute cache freshness
                this.extensionsControlManifest = this.updateControlCache();
                this.lastReportTimestamp = now;
            }
            return this.extensionsControlManifest;
        }
        registerParticipant(participant) {
            this.participants.push(participant);
        }
        async installExtensions(extensions) {
            const results = [];
            await Promise.allSettled(extensions.map(async (e) => {
                try {
                    const result = await this.installExtension(e);
                    results.push(...result);
                }
                catch (error) {
                    results.push({ identifier: { id: (0, extensionManagementUtil_1.getGalleryExtensionId)(e.manifest.publisher, e.manifest.name) }, operation: 2 /* InstallOperation.Install */, source: e.extension, error });
                }
            }));
            this._onDidInstallExtensions.fire(results);
            return results;
        }
        async installExtension({ manifest, extension, options }) {
            const isApplicationScoped = options.isApplicationScoped || options.isBuiltin || (0, extensions_1.isApplicationScopedExtension)(manifest);
            const installExtensionTaskOptions = {
                ...options,
                installOnlyNewlyAddedFromExtensionPack: uri_1.URI.isUri(extension) ? options.installOnlyNewlyAddedFromExtensionPack : true,
                isApplicationScoped,
                profileLocation: isApplicationScoped ? this.userDataProfilesService.defaultProfile.extensionsResource : options.profileLocation ?? this.getCurrentExtensionsManifestLocation()
            };
            const getInstallExtensionTaskKey = (extension) => `${extensionManagementUtil_1.ExtensionKey.create(extension).toString()}${installExtensionTaskOptions.profileLocation ? `-${installExtensionTaskOptions.profileLocation.toString()}` : ''}`;
            // only cache gallery extensions tasks
            if (!uri_1.URI.isUri(extension)) {
                const installingExtension = this.installingExtensions.get(getInstallExtensionTaskKey(extension));
                if (installingExtension) {
                    this.logService.info('Extensions is already requested to install', extension.identifier.id);
                    await installingExtension.task.waitUntilTaskIsFinished();
                    return [];
                }
            }
            const allInstallExtensionTasks = [];
            const alreadyRequestedInstallations = [];
            const installResults = [];
            const installExtensionTask = this.createInstallExtensionTask(manifest, extension, installExtensionTaskOptions);
            if (!uri_1.URI.isUri(extension)) {
                this.installingExtensions.set(getInstallExtensionTaskKey(extension), { task: installExtensionTask, waitingTasks: [] });
            }
            this._onInstallExtension.fire({ identifier: installExtensionTask.identifier, source: extension, profileLocation: installExtensionTaskOptions.profileLocation });
            this.logService.info('Installing extension:', installExtensionTask.identifier.id);
            allInstallExtensionTasks.push({ task: installExtensionTask, manifest });
            let installExtensionHasDependents = false;
            try {
                if (installExtensionTaskOptions.donotIncludePackAndDependencies) {
                    this.logService.info('Installing the extension without checking dependencies and pack', installExtensionTask.identifier.id);
                }
                else {
                    try {
                        const allDepsAndPackExtensionsToInstall = await this.getAllDepsAndPackExtensions(installExtensionTask.identifier, manifest, !!installExtensionTaskOptions.installOnlyNewlyAddedFromExtensionPack, !!installExtensionTaskOptions.installPreReleaseVersion, installExtensionTaskOptions.profileLocation);
                        const installed = await this.getInstalled(undefined, installExtensionTaskOptions.profileLocation);
                        const options = { ...installExtensionTaskOptions, donotIncludePackAndDependencies: true, context: { ...installExtensionTaskOptions.context, [extensionManagement_1.EXTENSION_INSTALL_DEP_PACK_CONTEXT]: true } };
                        for (const { gallery, manifest } of (0, arrays_1.distinct)(allDepsAndPackExtensionsToInstall, ({ gallery }) => gallery.identifier.id)) {
                            installExtensionHasDependents = installExtensionHasDependents || !!manifest.extensionDependencies?.some(id => (0, extensionManagementUtil_1.areSameExtensions)({ id }, installExtensionTask.identifier));
                            const key = getInstallExtensionTaskKey(gallery);
                            const existingInstallingExtension = this.installingExtensions.get(key);
                            if (existingInstallingExtension) {
                                if (this.canWaitForTask(installExtensionTask, existingInstallingExtension.task)) {
                                    const identifier = existingInstallingExtension.task.identifier;
                                    this.logService.info('Waiting for already requested installing extension', identifier.id, installExtensionTask.identifier.id);
                                    existingInstallingExtension.waitingTasks.push(installExtensionTask);
                                    // add promise that waits until the extension is completely installed, ie., onDidInstallExtensions event is triggered for this extension
                                    alreadyRequestedInstallations.push(event_1.Event.toPromise(event_1.Event.filter(this.onDidInstallExtensions, results => results.some(result => (0, extensionManagementUtil_1.areSameExtensions)(result.identifier, identifier)))).then(results => {
                                        this.logService.info('Finished waiting for already requested installing extension', identifier.id, installExtensionTask.identifier.id);
                                        const result = results.find(result => (0, extensionManagementUtil_1.areSameExtensions)(result.identifier, identifier));
                                        if (!result?.local) {
                                            // Extension failed to install
                                            throw new Error(`Extension ${identifier.id} is not installed`);
                                        }
                                    }));
                                }
                            }
                            else if (!installed.some(({ identifier }) => (0, extensionManagementUtil_1.areSameExtensions)(identifier, gallery.identifier))) {
                                const task = this.createInstallExtensionTask(manifest, gallery, options);
                                this.installingExtensions.set(key, { task, waitingTasks: [installExtensionTask] });
                                this._onInstallExtension.fire({ identifier: task.identifier, source: gallery, profileLocation: installExtensionTaskOptions.profileLocation });
                                this.logService.info('Installing extension:', task.identifier.id, installExtensionTask.identifier.id);
                                allInstallExtensionTasks.push({ task, manifest });
                            }
                        }
                    }
                    catch (error) {
                        // Installing through VSIX
                        if (uri_1.URI.isUri(installExtensionTask.source)) {
                            // Ignore installing dependencies and packs
                            if ((0, arrays_1.isNonEmptyArray)(manifest.extensionDependencies)) {
                                this.logService.warn(`Cannot install dependencies of extension:`, installExtensionTask.identifier.id, error.message);
                            }
                            if ((0, arrays_1.isNonEmptyArray)(manifest.extensionPack)) {
                                this.logService.warn(`Cannot install packed extensions of extension:`, installExtensionTask.identifier.id, error.message);
                            }
                        }
                        else {
                            this.logService.error('Error while preparing to install dependencies and extension packs of the extension:', installExtensionTask.identifier.id);
                            throw error;
                        }
                    }
                }
                const extensionsToInstallMap = allInstallExtensionTasks.reduce((result, { task, manifest }) => {
                    result.set(task.identifier.id.toLowerCase(), { task, manifest });
                    return result;
                }, new Map());
                while (extensionsToInstallMap.size) {
                    let extensionsToInstall;
                    const extensionsWithoutDepsToInstall = [...extensionsToInstallMap.values()].filter(({ manifest }) => !manifest.extensionDependencies?.some(id => extensionsToInstallMap.has(id.toLowerCase())));
                    if (extensionsWithoutDepsToInstall.length) {
                        extensionsToInstall = extensionsToInstallMap.size === 1 ? extensionsWithoutDepsToInstall
                            /* If the main extension has no dependents remove it and install it at the end */
                            : extensionsWithoutDepsToInstall.filter(({ task }) => !(task === installExtensionTask && !installExtensionHasDependents));
                    }
                    else {
                        this.logService.info('Found extensions with circular dependencies', extensionsWithoutDepsToInstall.map(({ task }) => task.identifier.id));
                        extensionsToInstall = [...extensionsToInstallMap.values()];
                    }
                    // Install extensions in parallel and wait until all extensions are installed / failed
                    await this.joinAllSettled(extensionsToInstall.map(async ({ task }) => {
                        const startTime = new Date().getTime();
                        try {
                            const local = await task.run();
                            await this.joinAllSettled(this.participants.map(participant => participant.postInstall(local, task.source, installExtensionTaskOptions, cancellation_1.CancellationToken.None)));
                            if (!uri_1.URI.isUri(task.source)) {
                                const isUpdate = task.operation === 3 /* InstallOperation.Update */;
                                const durationSinceUpdate = isUpdate ? undefined : (new Date().getTime() - task.source.lastUpdated) / 1000;
                                reportTelemetry(this.telemetryService, isUpdate ? 'extensionGallery:update' : 'extensionGallery:install', {
                                    extensionData: (0, extensionManagementUtil_1.getGalleryExtensionTelemetryData)(task.source),
                                    verificationStatus: task.verificationStatus,
                                    duration: new Date().getTime() - startTime,
                                    durationSinceUpdate
                                });
                                // In web, report extension install statistics explicitly. In Desktop, statistics are automatically updated while downloading the VSIX.
                                if (platform_1.isWeb && task.operation !== 3 /* InstallOperation.Update */) {
                                    try {
                                        await this.galleryService.reportStatistic(local.manifest.publisher, local.manifest.name, local.manifest.version, "install" /* StatisticType.Install */);
                                    }
                                    catch (error) { /* ignore */ }
                                }
                            }
                            installResults.push({ local, identifier: task.identifier, operation: task.operation, source: task.source, context: task.options.context, profileLocation: task.profileLocation, applicationScoped: local.isApplicationScoped });
                        }
                        catch (error) {
                            if (!uri_1.URI.isUri(task.source)) {
                                reportTelemetry(this.telemetryService, task.operation === 3 /* InstallOperation.Update */ ? 'extensionGallery:update' : 'extensionGallery:install', {
                                    extensionData: (0, extensionManagementUtil_1.getGalleryExtensionTelemetryData)(task.source),
                                    verificationStatus: task.verificationStatus,
                                    duration: new Date().getTime() - startTime,
                                    error
                                });
                            }
                            this.logService.error('Error while installing the extension:', task.identifier.id);
                            throw error;
                        }
                        finally {
                            extensionsToInstallMap.delete(task.identifier.id.toLowerCase());
                        }
                    }));
                }
                if (alreadyRequestedInstallations.length) {
                    await this.joinAllSettled(alreadyRequestedInstallations);
                }
                installResults.forEach(({ identifier }) => this.logService.info(`Extension installed successfully:`, identifier.id));
                return installResults;
            }
            catch (error) {
                // cancel all tasks
                allInstallExtensionTasks.forEach(({ task }) => task.cancel());
                // rollback installed extensions
                if (installResults.length) {
                    try {
                        const result = await Promise.allSettled(installResults.map(({ local }) => this.createUninstallExtensionTask(local, { versionOnly: true, profileLocation: installExtensionTaskOptions.profileLocation }).run()));
                        for (let index = 0; index < result.length; index++) {
                            const r = result[index];
                            const { identifier } = installResults[index];
                            if (r.status === 'fulfilled') {
                                this.logService.info('Rollback: Uninstalled extension', identifier.id);
                            }
                            else {
                                this.logService.warn('Rollback: Error while uninstalling extension', identifier.id, (0, errors_1.getErrorMessage)(r.reason));
                            }
                        }
                    }
                    catch (error) {
                        // ignore error
                        this.logService.warn('Error while rolling back extensions', (0, errors_1.getErrorMessage)(error), installResults.map(({ identifier }) => identifier.id));
                    }
                }
                return allInstallExtensionTasks.map(({ task }) => ({ identifier: task.identifier, operation: 2 /* InstallOperation.Install */, source: task.source, context: installExtensionTaskOptions.context, profileLocation: installExtensionTaskOptions.profileLocation, error }));
            }
            finally {
                // Finally, remove all the tasks from the cache
                for (const { task } of allInstallExtensionTasks) {
                    if (task.source && !uri_1.URI.isUri(task.source)) {
                        this.installingExtensions.delete(getInstallExtensionTaskKey(task.source));
                    }
                }
            }
        }
        canWaitForTask(taskToWait, taskToWaitFor) {
            for (const [, { task, waitingTasks }] of this.installingExtensions.entries()) {
                if (task === taskToWait) {
                    // Cannot be waited, If taskToWaitFor is waiting for taskToWait
                    if (waitingTasks.includes(taskToWaitFor)) {
                        return false;
                    }
                    // Cannot be waited, If taskToWaitFor is waiting for tasks waiting for taskToWait
                    if (waitingTasks.some(waitingTask => this.canWaitForTask(waitingTask, taskToWaitFor))) {
                        return false;
                    }
                }
                // Cannot be waited, if the taskToWait cannot be waited for the task created the taskToWaitFor
                // Because, the task waits for the tasks it created
                if (task === taskToWaitFor && waitingTasks[0] && !this.canWaitForTask(taskToWait, waitingTasks[0])) {
                    return false;
                }
            }
            return true;
        }
        async joinAllSettled(promises) {
            const results = [];
            const errors = [];
            const promiseResults = await Promise.allSettled(promises);
            for (const r of promiseResults) {
                if (r.status === 'fulfilled') {
                    results.push(r.value);
                }
                else {
                    errors.push(r.reason);
                }
            }
            // If there are errors, throw the error.
            if (errors.length) {
                throw joinErrors(errors);
            }
            return results;
        }
        async getAllDepsAndPackExtensions(extensionIdentifier, manifest, getOnlyNewlyAddedFromExtensionPack, installPreRelease, profile) {
            if (!this.galleryService.isEnabled()) {
                return [];
            }
            const installed = await this.getInstalled(undefined, profile);
            const knownIdentifiers = [];
            const allDependenciesAndPacks = [];
            const collectDependenciesAndPackExtensionsToInstall = async (extensionIdentifier, manifest) => {
                knownIdentifiers.push(extensionIdentifier);
                const dependecies = manifest.extensionDependencies || [];
                const dependenciesAndPackExtensions = [...dependecies];
                if (manifest.extensionPack) {
                    const existing = getOnlyNewlyAddedFromExtensionPack ? installed.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, extensionIdentifier)) : undefined;
                    for (const extension of manifest.extensionPack) {
                        // add only those extensions which are new in currently installed extension
                        if (!(existing && existing.manifest.extensionPack && existing.manifest.extensionPack.some(old => (0, extensionManagementUtil_1.areSameExtensions)({ id: old }, { id: extension })))) {
                            if (dependenciesAndPackExtensions.every(e => !(0, extensionManagementUtil_1.areSameExtensions)({ id: e }, { id: extension }))) {
                                dependenciesAndPackExtensions.push(extension);
                            }
                        }
                    }
                }
                if (dependenciesAndPackExtensions.length) {
                    // filter out known extensions
                    const ids = dependenciesAndPackExtensions.filter(id => knownIdentifiers.every(galleryIdentifier => !(0, extensionManagementUtil_1.areSameExtensions)(galleryIdentifier, { id })));
                    if (ids.length) {
                        const galleryExtensions = await this.galleryService.getExtensions(ids.map(id => ({ id, preRelease: installPreRelease })), cancellation_1.CancellationToken.None);
                        for (const galleryExtension of galleryExtensions) {
                            if (knownIdentifiers.find(identifier => (0, extensionManagementUtil_1.areSameExtensions)(identifier, galleryExtension.identifier))) {
                                continue;
                            }
                            const isDependency = dependecies.some(id => (0, extensionManagementUtil_1.areSameExtensions)({ id }, galleryExtension.identifier));
                            let compatible;
                            try {
                                compatible = await this.checkAndGetCompatibleVersion(galleryExtension, false, installPreRelease);
                            }
                            catch (error) {
                                if (!isDependency) {
                                    this.logService.info('Skipping the packed extension as it cannot be installed', galleryExtension.identifier.id, (0, errors_1.getErrorMessage)(error));
                                    continue;
                                }
                                else {
                                    throw error;
                                }
                            }
                            allDependenciesAndPacks.push({ gallery: compatible.extension, manifest: compatible.manifest });
                            await collectDependenciesAndPackExtensionsToInstall(compatible.extension.identifier, compatible.manifest);
                        }
                    }
                }
            };
            await collectDependenciesAndPackExtensionsToInstall(extensionIdentifier, manifest);
            return allDependenciesAndPacks;
        }
        async checkAndGetCompatibleVersion(extension, sameVersion, installPreRelease) {
            let compatibleExtension;
            const extensionsControlManifest = await this.getExtensionsControlManifest();
            if (extensionsControlManifest.malicious.some(identifier => (0, extensionManagementUtil_1.areSameExtensions)(extension.identifier, identifier))) {
                throw new extensionManagement_1.ExtensionManagementError(nls.localize('malicious extension', "Can't install '{0}' extension since it was reported to be problematic.", extension.identifier.id), extensionManagement_1.ExtensionManagementErrorCode.Malicious);
            }
            const deprecationInfo = extensionsControlManifest.deprecated[extension.identifier.id.toLowerCase()];
            if (deprecationInfo?.extension?.autoMigrate) {
                this.logService.info(`The '${extension.identifier.id}' extension is deprecated, fetching the compatible '${deprecationInfo.extension.id}' extension instead.`);
                compatibleExtension = (await this.galleryService.getExtensions([{ id: deprecationInfo.extension.id, preRelease: deprecationInfo.extension.preRelease }], { targetPlatform: await this.getTargetPlatform(), compatible: true }, cancellation_1.CancellationToken.None))[0];
                if (!compatibleExtension) {
                    throw new extensionManagement_1.ExtensionManagementError(nls.localize('notFoundDeprecatedReplacementExtension', "Can't install '{0}' extension since it was deprecated and the replacement extension '{1}' can't be found.", extension.identifier.id, deprecationInfo.extension.id), extensionManagement_1.ExtensionManagementErrorCode.Deprecated);
                }
            }
            else {
                if (!await this.canInstall(extension)) {
                    const targetPlatform = await this.getTargetPlatform();
                    throw new extensionManagement_1.ExtensionManagementError(nls.localize('incompatible platform', "The '{0}' extension is not available in {1} for {2}.", extension.identifier.id, this.productService.nameLong, (0, extensionManagement_1.TargetPlatformToString)(targetPlatform)), extensionManagement_1.ExtensionManagementErrorCode.IncompatibleTargetPlatform);
                }
                compatibleExtension = await this.getCompatibleVersion(extension, sameVersion, installPreRelease);
                if (!compatibleExtension) {
                    /** If no compatible release version is found, check if the extension has a release version or not and throw relevant error */
                    if (!installPreRelease && extension.properties.isPreReleaseVersion && (await this.galleryService.getExtensions([extension.identifier], cancellation_1.CancellationToken.None))[0]) {
                        throw new extensionManagement_1.ExtensionManagementError(nls.localize('notFoundReleaseExtension', "Can't install release version of '{0}' extension because it has no release version.", extension.identifier.id), extensionManagement_1.ExtensionManagementErrorCode.ReleaseVersionNotFound);
                    }
                    throw new extensionManagement_1.ExtensionManagementError(nls.localize('notFoundCompatibleDependency', "Can't install '{0}' extension because it is not compatible with the current version of {1} (version {2}).", extension.identifier.id, this.productService.nameLong, this.productService.version), extensionManagement_1.ExtensionManagementErrorCode.Incompatible);
                }
            }
            this.logService.info('Getting Manifest...', compatibleExtension.identifier.id);
            const manifest = await this.galleryService.getManifest(compatibleExtension, cancellation_1.CancellationToken.None);
            if (manifest === null) {
                throw new extensionManagement_1.ExtensionManagementError(`Missing manifest for extension ${compatibleExtension.identifier.id}`, extensionManagement_1.ExtensionManagementErrorCode.Invalid);
            }
            if (manifest.version !== compatibleExtension.version) {
                throw new extensionManagement_1.ExtensionManagementError(`Cannot install '${compatibleExtension.identifier.id}' extension because of version mismatch in Marketplace`, extensionManagement_1.ExtensionManagementErrorCode.Invalid);
            }
            return { extension: compatibleExtension, manifest };
        }
        async getCompatibleVersion(extension, sameVersion, includePreRelease) {
            const targetPlatform = await this.getTargetPlatform();
            let compatibleExtension = null;
            if (!sameVersion && extension.hasPreReleaseVersion && extension.properties.isPreReleaseVersion !== includePreRelease) {
                compatibleExtension = (await this.galleryService.getExtensions([{ ...extension.identifier, preRelease: includePreRelease }], { targetPlatform, compatible: true }, cancellation_1.CancellationToken.None))[0] || null;
            }
            if (!compatibleExtension && await this.galleryService.isExtensionCompatible(extension, includePreRelease, targetPlatform)) {
                compatibleExtension = extension;
            }
            if (!compatibleExtension) {
                if (sameVersion) {
                    compatibleExtension = (await this.galleryService.getExtensions([{ ...extension.identifier, version: extension.version }], { targetPlatform, compatible: true }, cancellation_1.CancellationToken.None))[0] || null;
                }
                else {
                    compatibleExtension = await this.galleryService.getCompatibleExtension(extension, includePreRelease, targetPlatform);
                }
            }
            return compatibleExtension;
        }
        async uninstallExtension(extension, options) {
            const uninstallOptions = {
                ...options,
                profileLocation: extension.isApplicationScoped ? this.userDataProfilesService.defaultProfile.extensionsResource : options.profileLocation ?? this.getCurrentExtensionsManifestLocation()
            };
            const getUninstallExtensionTaskKey = (identifier) => `${identifier.id.toLowerCase()}${uninstallOptions.versionOnly ? `-${extension.manifest.version}` : ''}${uninstallOptions.profileLocation ? `@${uninstallOptions.profileLocation.toString()}` : ''}`;
            const uninstallExtensionTask = this.uninstallingExtensions.get(getUninstallExtensionTaskKey(extension.identifier));
            if (uninstallExtensionTask) {
                this.logService.info('Extensions is already requested to uninstall', extension.identifier.id);
                return uninstallExtensionTask.waitUntilTaskIsFinished();
            }
            const createUninstallExtensionTask = (extension) => {
                const uninstallExtensionTask = this.createUninstallExtensionTask(extension, uninstallOptions);
                this.uninstallingExtensions.set(getUninstallExtensionTaskKey(uninstallExtensionTask.extension.identifier), uninstallExtensionTask);
                if (uninstallOptions.profileLocation) {
                    this.logService.info('Uninstalling extension from the profile:', `${extension.identifier.id}@${extension.manifest.version}`, uninstallOptions.profileLocation.toString());
                }
                else {
                    this.logService.info('Uninstalling extension:', `${extension.identifier.id}@${extension.manifest.version}`);
                }
                this._onUninstallExtension.fire({ identifier: extension.identifier, profileLocation: uninstallOptions.profileLocation, applicationScoped: extension.isApplicationScoped });
                return uninstallExtensionTask;
            };
            const postUninstallExtension = (extension, error) => {
                if (error) {
                    if (uninstallOptions.profileLocation) {
                        this.logService.error('Failed to uninstall extension from the profile:', `${extension.identifier.id}@${extension.manifest.version}`, uninstallOptions.profileLocation.toString(), error.message);
                    }
                    else {
                        this.logService.error('Failed to uninstall extension:', `${extension.identifier.id}@${extension.manifest.version}`, error.message);
                    }
                }
                else {
                    if (uninstallOptions.profileLocation) {
                        this.logService.info('Successfully uninstalled extension from the profile', `${extension.identifier.id}@${extension.manifest.version}`, uninstallOptions.profileLocation.toString());
                    }
                    else {
                        this.logService.info('Successfully uninstalled extension:', `${extension.identifier.id}@${extension.manifest.version}`);
                    }
                }
                reportTelemetry(this.telemetryService, 'extensionGallery:uninstall', { extensionData: (0, extensionManagementUtil_1.getLocalExtensionTelemetryData)(extension), error });
                this._onDidUninstallExtension.fire({ identifier: extension.identifier, error: error?.code, profileLocation: uninstallOptions.profileLocation, applicationScoped: extension.isApplicationScoped });
            };
            const allTasks = [];
            const processedTasks = [];
            try {
                allTasks.push(createUninstallExtensionTask(extension));
                const installed = await this.getInstalled(1 /* ExtensionType.User */, uninstallOptions.profileLocation);
                if (uninstallOptions.donotIncludePack) {
                    this.logService.info('Uninstalling the extension without including packed extension', `${extension.identifier.id}@${extension.manifest.version}`);
                }
                else {
                    const packedExtensions = this.getAllPackExtensionsToUninstall(extension, installed);
                    for (const packedExtension of packedExtensions) {
                        if (this.uninstallingExtensions.has(getUninstallExtensionTaskKey(packedExtension.identifier))) {
                            this.logService.info('Extensions is already requested to uninstall', packedExtension.identifier.id);
                        }
                        else {
                            allTasks.push(createUninstallExtensionTask(packedExtension));
                        }
                    }
                }
                if (uninstallOptions.donotCheckDependents) {
                    this.logService.info('Uninstalling the extension without checking dependents', `${extension.identifier.id}@${extension.manifest.version}`);
                }
                else {
                    this.checkForDependents(allTasks.map(task => task.extension), installed, extension);
                }
                // Uninstall extensions in parallel and wait until all extensions are uninstalled / failed
                await this.joinAllSettled(allTasks.map(async (task) => {
                    try {
                        await task.run();
                        await this.joinAllSettled(this.participants.map(participant => participant.postUninstall(task.extension, uninstallOptions, cancellation_1.CancellationToken.None)));
                        // only report if extension has a mapped gallery extension. UUID identifies the gallery extension.
                        if (task.extension.identifier.uuid) {
                            try {
                                await this.galleryService.reportStatistic(task.extension.manifest.publisher, task.extension.manifest.name, task.extension.manifest.version, "uninstall" /* StatisticType.Uninstall */);
                            }
                            catch (error) { /* ignore */ }
                        }
                        postUninstallExtension(task.extension);
                    }
                    catch (e) {
                        const error = e instanceof extensionManagement_1.ExtensionManagementError ? e : new extensionManagement_1.ExtensionManagementError((0, errors_1.getErrorMessage)(e), extensionManagement_1.ExtensionManagementErrorCode.Internal);
                        postUninstallExtension(task.extension, error);
                        throw error;
                    }
                    finally {
                        processedTasks.push(task);
                    }
                }));
            }
            catch (e) {
                const error = e instanceof extensionManagement_1.ExtensionManagementError ? e : new extensionManagement_1.ExtensionManagementError((0, errors_1.getErrorMessage)(e), extensionManagement_1.ExtensionManagementErrorCode.Internal);
                for (const task of allTasks) {
                    // cancel the tasks
                    try {
                        task.cancel();
                    }
                    catch (error) { /* ignore */ }
                    if (!processedTasks.includes(task)) {
                        postUninstallExtension(task.extension, error);
                    }
                }
                throw error;
            }
            finally {
                // Remove tasks from cache
                for (const task of allTasks) {
                    if (!this.uninstallingExtensions.delete(getUninstallExtensionTaskKey(task.extension.identifier))) {
                        this.logService.warn('Uninstallation task is not found in the cache', task.extension.identifier.id);
                    }
                }
            }
        }
        checkForDependents(extensionsToUninstall, installed, extensionToUninstall) {
            for (const extension of extensionsToUninstall) {
                const dependents = this.getDependents(extension, installed);
                if (dependents.length) {
                    const remainingDependents = dependents.filter(dependent => !extensionsToUninstall.some(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, dependent.identifier)));
                    if (remainingDependents.length) {
                        throw new Error(this.getDependentsErrorMessage(extension, remainingDependents, extensionToUninstall));
                    }
                }
            }
        }
        getDependentsErrorMessage(dependingExtension, dependents, extensionToUninstall) {
            if (extensionToUninstall === dependingExtension) {
                if (dependents.length === 1) {
                    return nls.localize('singleDependentError', "Cannot uninstall '{0}' extension. '{1}' extension depends on this.", extensionToUninstall.manifest.displayName || extensionToUninstall.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name);
                }
                if (dependents.length === 2) {
                    return nls.localize('twoDependentsError', "Cannot uninstall '{0}' extension. '{1}' and '{2}' extensions depend on this.", extensionToUninstall.manifest.displayName || extensionToUninstall.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name, dependents[1].manifest.displayName || dependents[1].manifest.name);
                }
                return nls.localize('multipleDependentsError', "Cannot uninstall '{0}' extension. '{1}', '{2}' and other extension depend on this.", extensionToUninstall.manifest.displayName || extensionToUninstall.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name, dependents[1].manifest.displayName || dependents[1].manifest.name);
            }
            if (dependents.length === 1) {
                return nls.localize('singleIndirectDependentError', "Cannot uninstall '{0}' extension . It includes uninstalling '{1}' extension and '{2}' extension depends on this.", extensionToUninstall.manifest.displayName || extensionToUninstall.manifest.name, dependingExtension.manifest.displayName
                    || dependingExtension.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name);
            }
            if (dependents.length === 2) {
                return nls.localize('twoIndirectDependentsError', "Cannot uninstall '{0}' extension. It includes uninstalling '{1}' extension and '{2}' and '{3}' extensions depend on this.", extensionToUninstall.manifest.displayName || extensionToUninstall.manifest.name, dependingExtension.manifest.displayName
                    || dependingExtension.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name, dependents[1].manifest.displayName || dependents[1].manifest.name);
            }
            return nls.localize('multipleIndirectDependentsError', "Cannot uninstall '{0}' extension. It includes uninstalling '{1}' extension and '{2}', '{3}' and other extensions depend on this.", extensionToUninstall.manifest.displayName || extensionToUninstall.manifest.name, dependingExtension.manifest.displayName
                || dependingExtension.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name, dependents[1].manifest.displayName || dependents[1].manifest.name);
        }
        getAllPackExtensionsToUninstall(extension, installed, checked = []) {
            if (checked.indexOf(extension) !== -1) {
                return [];
            }
            checked.push(extension);
            const extensionsPack = extension.manifest.extensionPack ? extension.manifest.extensionPack : [];
            if (extensionsPack.length) {
                const packedExtensions = installed.filter(i => !i.isBuiltin && extensionsPack.some(id => (0, extensionManagementUtil_1.areSameExtensions)({ id }, i.identifier)));
                const packOfPackedExtensions = [];
                for (const packedExtension of packedExtensions) {
                    packOfPackedExtensions.push(...this.getAllPackExtensionsToUninstall(packedExtension, installed, checked));
                }
                return [...packedExtensions, ...packOfPackedExtensions];
            }
            return [];
        }
        getDependents(extension, installed) {
            return installed.filter(e => e.manifest.extensionDependencies && e.manifest.extensionDependencies.some(id => (0, extensionManagementUtil_1.areSameExtensions)({ id }, extension.identifier)));
        }
        async updateControlCache() {
            try {
                this.logService.trace('ExtensionManagementService.refreshReportedCache');
                const manifest = await this.galleryService.getExtensionsControlManifest();
                this.logService.trace(`ExtensionManagementService.refreshControlCache`, manifest);
                return manifest;
            }
            catch (err) {
                this.logService.trace('ExtensionManagementService.refreshControlCache - failed to get extension control manifest');
                return { malicious: [], deprecated: {}, search: [] };
            }
        }
    };
    exports.AbstractExtensionManagementService = AbstractExtensionManagementService;
    exports.AbstractExtensionManagementService = AbstractExtensionManagementService = __decorate([
        __param(0, extensionManagement_1.IExtensionGalleryService),
        __param(1, telemetry_1.ITelemetryService),
        __param(2, uriIdentity_1.IUriIdentityService),
        __param(3, log_1.ILogService),
        __param(4, productService_1.IProductService),
        __param(5, userDataProfile_1.IUserDataProfilesService)
    ], AbstractExtensionManagementService);
    function joinErrors(errorOrErrors) {
        const errors = Array.isArray(errorOrErrors) ? errorOrErrors : [errorOrErrors];
        if (errors.length === 1) {
            return errors[0] instanceof Error ? errors[0] : new Error(errors[0]);
        }
        return errors.reduce((previousValue, currentValue) => {
            return new Error(`${previousValue.message}${previousValue.message ? ',' : ''}${currentValue instanceof Error ? currentValue.message : currentValue}`);
        }, new Error(''));
    }
    exports.joinErrors = joinErrors;
    function toExtensionManagementError(error) {
        if (error instanceof extensionManagement_1.ExtensionManagementError) {
            return error;
        }
        const e = new extensionManagement_1.ExtensionManagementError(error.message, extensionManagement_1.ExtensionManagementErrorCode.Internal);
        e.stack = error.stack;
        return e;
    }
    exports.toExtensionManagementError = toExtensionManagementError;
    function reportTelemetry(telemetryService, eventName, { extensionData, verificationStatus, duration, error, durationSinceUpdate }) {
        let errorcode;
        let errorcodeDetail;
        if ((0, types_1.isDefined)(verificationStatus)) {
            if (verificationStatus === true) {
                verificationStatus = 'Verified';
            }
            else if (verificationStatus === false) {
                verificationStatus = 'Unverified';
            }
            else {
                errorcode = extensionManagement_1.ExtensionManagementErrorCode.Signature;
                errorcodeDetail = verificationStatus;
                verificationStatus = 'Unverified';
            }
        }
        if (error) {
            if (error instanceof extensionManagement_1.ExtensionManagementError) {
                errorcode = error.code;
                if (error.code === extensionManagement_1.ExtensionManagementErrorCode.Signature) {
                    errorcodeDetail = error.message;
                }
            }
            else {
                errorcode = extensionManagement_1.ExtensionManagementErrorCode.Internal;
            }
        }
        /* __GDPR__
            "extensionGallery:install" : {
                "owner": "sandy081",
                "success": { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true },
                "duration" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true },
                "durationSinceUpdate" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "errorcode": { "classification": "CallstackOrException", "purpose": "PerformanceAndHealth" },
                "errorcodeDetail": { "classification": "CallstackOrException", "purpose": "PerformanceAndHealth" },
                "recommendationReason": { "retiredFromVersion": "1.23.0", "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "verificationStatus" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                "${include}": [
                    "${GalleryExtensionTelemetryData}"
                ]
            }
        */
        /* __GDPR__
            "extensionGallery:uninstall" : {
                "owner": "sandy081",
                "success": { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true },
                "duration" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true },
                "errorcode": { "classification": "CallstackOrException", "purpose": "PerformanceAndHealth" },
                "${include}": [
                    "${GalleryExtensionTelemetryData}"
                ]
            }
        */
        /* __GDPR__
            "extensionGallery:update" : {
                "owner": "sandy081",
                "success": { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true },
                "duration" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true },
                "errorcode": { "classification": "CallstackOrException", "purpose": "PerformanceAndHealth" },
                "errorcodeDetail": { "classification": "CallstackOrException", "purpose": "PerformanceAndHealth" },
                "verificationStatus" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                "${include}": [
                    "${GalleryExtensionTelemetryData}"
                ]
            }
        */
        telemetryService.publicLog(eventName, { ...extensionData, verificationStatus, success: !error, duration, errorcode, errorcodeDetail, durationSinceUpdate });
    }
    class AbstractExtensionTask {
        constructor() {
            this.barrier = new async_1.Barrier();
        }
        async waitUntilTaskIsFinished() {
            await this.barrier.wait();
            return this.cancellablePromise;
        }
        async run() {
            if (!this.cancellablePromise) {
                this.cancellablePromise = (0, async_1.createCancelablePromise)(token => this.doRun(token));
            }
            this.barrier.open();
            return this.cancellablePromise;
        }
        cancel() {
            if (!this.cancellablePromise) {
                this.cancellablePromise = (0, async_1.createCancelablePromise)(token => {
                    return new Promise((c, e) => {
                        const disposable = token.onCancellationRequested(() => {
                            disposable.dispose();
                            e(new errors_1.CancellationError());
                        });
                    });
                });
                this.barrier.open();
            }
            this.cancellablePromise.cancel();
        }
    }
    exports.AbstractExtensionTask = AbstractExtensionTask;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJzdHJhY3RFeHRlbnNpb25NYW5hZ2VtZW50U2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2V4dGVuc2lvbk1hbmFnZW1lbnQvY29tbW9uL2Fic3RyYWN0RXh0ZW5zaW9uTWFuYWdlbWVudFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBaUR6RixJQUFlLGtDQUFrQyxHQUFqRCxNQUFlLGtDQUFtQyxTQUFRLHNCQUFVO1FBVTFFLElBQUksa0JBQWtCLEtBQUssT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUduRSxJQUFJLHNCQUFzQixLQUFLLE9BQU8sSUFBSSxDQUFDLHVCQUF1QixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFHM0UsSUFBSSxvQkFBb0IsS0FBSyxPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBR3ZFLElBQUksdUJBQXVCLEtBQUssT0FBTyxJQUFJLENBQUMsd0JBQXdCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUc3RSxJQUFJLDRCQUE0QixLQUFLLE9BQU8sSUFBSSxDQUFDLDZCQUE2QixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFJdkYsWUFDMkIsY0FBMkQsRUFDbEUsZ0JBQXNELEVBQ3BELGtCQUEwRCxFQUNsRSxVQUEwQyxFQUN0QyxjQUFrRCxFQUN6Qyx1QkFBb0U7WUFFOUYsS0FBSyxFQUFFLENBQUM7WUFQcUMsbUJBQWMsR0FBZCxjQUFjLENBQTBCO1lBQy9DLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFDakMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUMvQyxlQUFVLEdBQVYsVUFBVSxDQUFhO1lBQ25CLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUN0Qiw0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