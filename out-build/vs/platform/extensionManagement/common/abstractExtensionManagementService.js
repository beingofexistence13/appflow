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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/types", "vs/base/common/uri", "vs/nls!vs/platform/extensionManagement/common/abstractExtensionManagementService", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/extensions/common/extensions", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/telemetry/common/telemetry", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/userDataProfile/common/userDataProfile"], function (require, exports, arrays_1, async_1, cancellation_1, errors_1, event_1, lifecycle_1, platform_1, types_1, uri_1, nls, extensionManagement_1, extensionManagementUtil_1, extensions_1, log_1, productService_1, telemetry_1, uriIdentity_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ip = exports.$hp = exports.$gp = exports.$fp = void 0;
    let $fp = class $fp extends lifecycle_1.$kc {
        get onInstallExtension() { return this.n.event; }
        get onDidInstallExtensions() { return this.s.event; }
        get onUninstallExtension() { return this.t.event; }
        get onDidUninstallExtension() { return this.u.event; }
        get onDidUpdateExtensionMetadata() { return this.w.event; }
        constructor(z, C, D, F, G, H) {
            super();
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.h = 0;
            this.j = new Map();
            this.m = new Map();
            this.n = this.B(new event_1.$fd());
            this.s = this.B(new event_1.$fd());
            this.t = this.B(new event_1.$fd());
            this.u = this.B(new event_1.$fd());
            this.w = this.B(new event_1.$fd());
            this.y = [];
            this.B((0, lifecycle_1.$ic)(() => {
                this.j.forEach(({ task }) => task.cancel());
                this.m.forEach(promise => promise.cancel());
                this.j.clear();
                this.m.clear();
            }));
        }
        async canInstall(extension) {
            const currentTargetPlatform = await this.getTargetPlatform();
            return extension.allTargetPlatforms.some(targetPlatform => (0, extensionManagement_1.$Wn)(targetPlatform, extension.allTargetPlatforms, currentTargetPlatform));
        }
        async installFromGallery(extension, options = {}) {
            try {
                const results = await this.installGalleryExtensions([{ extension, options }]);
                const result = results.find(({ identifier }) => (0, extensionManagementUtil_1.$po)(identifier, extension.identifier));
                if (result?.local) {
                    return result?.local;
                }
                if (result?.error) {
                    throw result.error;
                }
                throw $hp(new Error(`Unknown error while installing extension ${extension.identifier.id}`));
            }
            catch (error) {
                throw $hp(error);
            }
        }
        async installGalleryExtensions(extensions) {
            if (!this.z.isEnabled()) {
                throw new extensionManagement_1.$1n(nls.localize(0, null), extensionManagement_1.ExtensionManagementErrorCode.Internal);
            }
            const results = [];
            const installableExtensions = [];
            await Promise.allSettled(extensions.map(async ({ extension, options }) => {
                try {
                    const compatible = await this.O(extension, !!options?.installGivenVersion, !!options?.installPreReleaseVersion);
                    installableExtensions.push({ ...compatible, options });
                }
                catch (error) {
                    results.push({ identifier: extension.identifier, operation: 2 /* InstallOperation.Install */, source: extension, error });
                }
            }));
            if (installableExtensions.length) {
                results.push(...await this.I(installableExtensions));
            }
            for (const result of results) {
                if (result.error) {
                    this.F.error(`Failed to install extension.`, result.identifier.id);
                    this.F.error(result.error);
                    if (result.source && !uri_1.URI.isUri(result.source)) {
                        reportTelemetry(this.C, 'extensionGallery:install', { extensionData: (0, extensionManagementUtil_1.$xo)(result.source), error: result.error });
                    }
                }
            }
            return results;
        }
        async uninstall(extension, options = {}) {
            this.F.trace('ExtensionManagementService#uninstall', extension.identifier.id);
            return this.Q(extension, options);
        }
        async toggleAppliationScope(extension, fromProfileLocation) {
            if ((0, extensions_1.$Yl)(extension.manifest) || extension.isBuiltin) {
                return extension;
            }
            if (extension.isApplicationScoped) {
                let local = await this.updateMetadata(extension, { isApplicationScoped: false }, this.H.defaultProfile.extensionsResource);
                if (!this.D.extUri.isEqual(fromProfileLocation, this.H.defaultProfile.extensionsResource)) {
                    local = await this.ab(extension, this.H.defaultProfile.extensionsResource, fromProfileLocation);
                }
                for (const profile of this.H.profiles) {
                    const existing = (await this.getInstalled(1 /* ExtensionType.User */, profile.extensionsResource))
                        .find(e => (0, extensionManagementUtil_1.$po)(e.identifier, extension.identifier));
                    if (existing) {
                        this.w.fire(existing);
                    }
                    else {
                        this.u.fire({ identifier: extension.identifier, profileLocation: profile.extensionsResource });
                    }
                }
                return local;
            }
            else {
                const local = this.D.extUri.isEqual(fromProfileLocation, this.H.defaultProfile.extensionsResource)
                    ? await this.updateMetadata(extension, { isApplicationScoped: true }, this.H.defaultProfile.extensionsResource)
                    : await this.ab(extension, fromProfileLocation, this.H.defaultProfile.extensionsResource, { isApplicationScoped: true });
                this.s.fire([{ identifier: local.identifier, operation: 2 /* InstallOperation.Install */, local, profileLocation: this.H.defaultProfile.extensionsResource, applicationScoped: true }]);
                return local;
            }
        }
        getExtensionsControlManifest() {
            const now = new Date().getTime();
            if (!this.g || now - this.h > 1000 * 60 * 5) { // 5 minute cache freshness
                this.g = this.X();
                this.h = now;
            }
            return this.g;
        }
        registerParticipant(participant) {
            this.y.push(participant);
        }
        async I(extensions) {
            const results = [];
            await Promise.allSettled(extensions.map(async (e) => {
                try {
                    const result = await this.J(e);
                    results.push(...result);
                }
                catch (error) {
                    results.push({ identifier: { id: (0, extensionManagementUtil_1.$uo)(e.manifest.publisher, e.manifest.name) }, operation: 2 /* InstallOperation.Install */, source: e.extension, error });
                }
            }));
            this.s.fire(results);
            return results;
        }
        async J({ manifest, extension, options }) {
            const isApplicationScoped = options.isApplicationScoped || options.isBuiltin || (0, extensions_1.$Yl)(manifest);
            const installExtensionTaskOptions = {
                ...options,
                installOnlyNewlyAddedFromExtensionPack: uri_1.URI.isUri(extension) ? options.installOnlyNewlyAddedFromExtensionPack : true,
                isApplicationScoped,
                profileLocation: isApplicationScoped ? this.H.defaultProfile.extensionsResource : options.profileLocation ?? this.Y()
            };
            const getInstallExtensionTaskKey = (extension) => `${extensionManagementUtil_1.$qo.create(extension).toString()}${installExtensionTaskOptions.profileLocation ? `-${installExtensionTaskOptions.profileLocation.toString()}` : ''}`;
            // only cache gallery extensions tasks
            if (!uri_1.URI.isUri(extension)) {
                const installingExtension = this.j.get(getInstallExtensionTaskKey(extension));
                if (installingExtension) {
                    this.F.info('Extensions is already requested to install', extension.identifier.id);
                    await installingExtension.task.waitUntilTaskIsFinished();
                    return [];
                }
            }
            const allInstallExtensionTasks = [];
            const alreadyRequestedInstallations = [];
            const installResults = [];
            const installExtensionTask = this.Z(manifest, extension, installExtensionTaskOptions);
            if (!uri_1.URI.isUri(extension)) {
                this.j.set(getInstallExtensionTaskKey(extension), { task: installExtensionTask, waitingTasks: [] });
            }
            this.n.fire({ identifier: installExtensionTask.identifier, source: extension, profileLocation: installExtensionTaskOptions.profileLocation });
            this.F.info('Installing extension:', installExtensionTask.identifier.id);
            allInstallExtensionTasks.push({ task: installExtensionTask, manifest });
            let installExtensionHasDependents = false;
            try {
                if (installExtensionTaskOptions.donotIncludePackAndDependencies) {
                    this.F.info('Installing the extension without checking dependencies and pack', installExtensionTask.identifier.id);
                }
                else {
                    try {
                        const allDepsAndPackExtensionsToInstall = await this.N(installExtensionTask.identifier, manifest, !!installExtensionTaskOptions.installOnlyNewlyAddedFromExtensionPack, !!installExtensionTaskOptions.installPreReleaseVersion, installExtensionTaskOptions.profileLocation);
                        const installed = await this.getInstalled(undefined, installExtensionTaskOptions.profileLocation);
                        const options = { ...installExtensionTaskOptions, donotIncludePackAndDependencies: true, context: { ...installExtensionTaskOptions.context, [extensionManagement_1.$Rn]: true } };
                        for (const { gallery, manifest } of (0, arrays_1.$Kb)(allDepsAndPackExtensionsToInstall, ({ gallery }) => gallery.identifier.id)) {
                            installExtensionHasDependents = installExtensionHasDependents || !!manifest.extensionDependencies?.some(id => (0, extensionManagementUtil_1.$po)({ id }, installExtensionTask.identifier));
                            const key = getInstallExtensionTaskKey(gallery);
                            const existingInstallingExtension = this.j.get(key);
                            if (existingInstallingExtension) {
                                if (this.L(installExtensionTask, existingInstallingExtension.task)) {
                                    const identifier = existingInstallingExtension.task.identifier;
                                    this.F.info('Waiting for already requested installing extension', identifier.id, installExtensionTask.identifier.id);
                                    existingInstallingExtension.waitingTasks.push(installExtensionTask);
                                    // add promise that waits until the extension is completely installed, ie., onDidInstallExtensions event is triggered for this extension
                                    alreadyRequestedInstallations.push(event_1.Event.toPromise(event_1.Event.filter(this.onDidInstallExtensions, results => results.some(result => (0, extensionManagementUtil_1.$po)(result.identifier, identifier)))).then(results => {
                                        this.F.info('Finished waiting for already requested installing extension', identifier.id, installExtensionTask.identifier.id);
                                        const result = results.find(result => (0, extensionManagementUtil_1.$po)(result.identifier, identifier));
                                        if (!result?.local) {
                                            // Extension failed to install
                                            throw new Error(`Extension ${identifier.id} is not installed`);
                                        }
                                    }));
                                }
                            }
                            else if (!installed.some(({ identifier }) => (0, extensionManagementUtil_1.$po)(identifier, gallery.identifier))) {
                                const task = this.Z(manifest, gallery, options);
                                this.j.set(key, { task, waitingTasks: [installExtensionTask] });
                                this.n.fire({ identifier: task.identifier, source: gallery, profileLocation: installExtensionTaskOptions.profileLocation });
                                this.F.info('Installing extension:', task.identifier.id, installExtensionTask.identifier.id);
                                allInstallExtensionTasks.push({ task, manifest });
                            }
                        }
                    }
                    catch (error) {
                        // Installing through VSIX
                        if (uri_1.URI.isUri(installExtensionTask.source)) {
                            // Ignore installing dependencies and packs
                            if ((0, arrays_1.$Jb)(manifest.extensionDependencies)) {
                                this.F.warn(`Cannot install dependencies of extension:`, installExtensionTask.identifier.id, error.message);
                            }
                            if ((0, arrays_1.$Jb)(manifest.extensionPack)) {
                                this.F.warn(`Cannot install packed extensions of extension:`, installExtensionTask.identifier.id, error.message);
                            }
                        }
                        else {
                            this.F.error('Error while preparing to install dependencies and extension packs of the extension:', installExtensionTask.identifier.id);
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
                        this.F.info('Found extensions with circular dependencies', extensionsWithoutDepsToInstall.map(({ task }) => task.identifier.id));
                        extensionsToInstall = [...extensionsToInstallMap.values()];
                    }
                    // Install extensions in parallel and wait until all extensions are installed / failed
                    await this.M(extensionsToInstall.map(async ({ task }) => {
                        const startTime = new Date().getTime();
                        try {
                            const local = await task.run();
                            await this.M(this.y.map(participant => participant.postInstall(local, task.source, installExtensionTaskOptions, cancellation_1.CancellationToken.None)));
                            if (!uri_1.URI.isUri(task.source)) {
                                const isUpdate = task.operation === 3 /* InstallOperation.Update */;
                                const durationSinceUpdate = isUpdate ? undefined : (new Date().getTime() - task.source.lastUpdated) / 1000;
                                reportTelemetry(this.C, isUpdate ? 'extensionGallery:update' : 'extensionGallery:install', {
                                    extensionData: (0, extensionManagementUtil_1.$xo)(task.source),
                                    verificationStatus: task.verificationStatus,
                                    duration: new Date().getTime() - startTime,
                                    durationSinceUpdate
                                });
                                // In web, report extension install statistics explicitly. In Desktop, statistics are automatically updated while downloading the VSIX.
                                if (platform_1.$o && task.operation !== 3 /* InstallOperation.Update */) {
                                    try {
                                        await this.z.reportStatistic(local.manifest.publisher, local.manifest.name, local.manifest.version, "install" /* StatisticType.Install */);
                                    }
                                    catch (error) { /* ignore */ }
                                }
                            }
                            installResults.push({ local, identifier: task.identifier, operation: task.operation, source: task.source, context: task.options.context, profileLocation: task.profileLocation, applicationScoped: local.isApplicationScoped });
                        }
                        catch (error) {
                            if (!uri_1.URI.isUri(task.source)) {
                                reportTelemetry(this.C, task.operation === 3 /* InstallOperation.Update */ ? 'extensionGallery:update' : 'extensionGallery:install', {
                                    extensionData: (0, extensionManagementUtil_1.$xo)(task.source),
                                    verificationStatus: task.verificationStatus,
                                    duration: new Date().getTime() - startTime,
                                    error
                                });
                            }
                            this.F.error('Error while installing the extension:', task.identifier.id);
                            throw error;
                        }
                        finally {
                            extensionsToInstallMap.delete(task.identifier.id.toLowerCase());
                        }
                    }));
                }
                if (alreadyRequestedInstallations.length) {
                    await this.M(alreadyRequestedInstallations);
                }
                installResults.forEach(({ identifier }) => this.F.info(`Extension installed successfully:`, identifier.id));
                return installResults;
            }
            catch (error) {
                // cancel all tasks
                allInstallExtensionTasks.forEach(({ task }) => task.cancel());
                // rollback installed extensions
                if (installResults.length) {
                    try {
                        const result = await Promise.allSettled(installResults.map(({ local }) => this.$(local, { versionOnly: true, profileLocation: installExtensionTaskOptions.profileLocation }).run()));
                        for (let index = 0; index < result.length; index++) {
                            const r = result[index];
                            const { identifier } = installResults[index];
                            if (r.status === 'fulfilled') {
                                this.F.info('Rollback: Uninstalled extension', identifier.id);
                            }
                            else {
                                this.F.warn('Rollback: Error while uninstalling extension', identifier.id, (0, errors_1.$8)(r.reason));
                            }
                        }
                    }
                    catch (error) {
                        // ignore error
                        this.F.warn('Error while rolling back extensions', (0, errors_1.$8)(error), installResults.map(({ identifier }) => identifier.id));
                    }
                }
                return allInstallExtensionTasks.map(({ task }) => ({ identifier: task.identifier, operation: 2 /* InstallOperation.Install */, source: task.source, context: installExtensionTaskOptions.context, profileLocation: installExtensionTaskOptions.profileLocation, error }));
            }
            finally {
                // Finally, remove all the tasks from the cache
                for (const { task } of allInstallExtensionTasks) {
                    if (task.source && !uri_1.URI.isUri(task.source)) {
                        this.j.delete(getInstallExtensionTaskKey(task.source));
                    }
                }
            }
        }
        L(taskToWait, taskToWaitFor) {
            for (const [, { task, waitingTasks }] of this.j.entries()) {
                if (task === taskToWait) {
                    // Cannot be waited, If taskToWaitFor is waiting for taskToWait
                    if (waitingTasks.includes(taskToWaitFor)) {
                        return false;
                    }
                    // Cannot be waited, If taskToWaitFor is waiting for tasks waiting for taskToWait
                    if (waitingTasks.some(waitingTask => this.L(waitingTask, taskToWaitFor))) {
                        return false;
                    }
                }
                // Cannot be waited, if the taskToWait cannot be waited for the task created the taskToWaitFor
                // Because, the task waits for the tasks it created
                if (task === taskToWaitFor && waitingTasks[0] && !this.L(taskToWait, waitingTasks[0])) {
                    return false;
                }
            }
            return true;
        }
        async M(promises) {
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
                throw $gp(errors);
            }
            return results;
        }
        async N(extensionIdentifier, manifest, getOnlyNewlyAddedFromExtensionPack, installPreRelease, profile) {
            if (!this.z.isEnabled()) {
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
                    const existing = getOnlyNewlyAddedFromExtensionPack ? installed.find(e => (0, extensionManagementUtil_1.$po)(e.identifier, extensionIdentifier)) : undefined;
                    for (const extension of manifest.extensionPack) {
                        // add only those extensions which are new in currently installed extension
                        if (!(existing && existing.manifest.extensionPack && existing.manifest.extensionPack.some(old => (0, extensionManagementUtil_1.$po)({ id: old }, { id: extension })))) {
                            if (dependenciesAndPackExtensions.every(e => !(0, extensionManagementUtil_1.$po)({ id: e }, { id: extension }))) {
                                dependenciesAndPackExtensions.push(extension);
                            }
                        }
                    }
                }
                if (dependenciesAndPackExtensions.length) {
                    // filter out known extensions
                    const ids = dependenciesAndPackExtensions.filter(id => knownIdentifiers.every(galleryIdentifier => !(0, extensionManagementUtil_1.$po)(galleryIdentifier, { id })));
                    if (ids.length) {
                        const galleryExtensions = await this.z.getExtensions(ids.map(id => ({ id, preRelease: installPreRelease })), cancellation_1.CancellationToken.None);
                        for (const galleryExtension of galleryExtensions) {
                            if (knownIdentifiers.find(identifier => (0, extensionManagementUtil_1.$po)(identifier, galleryExtension.identifier))) {
                                continue;
                            }
                            const isDependency = dependecies.some(id => (0, extensionManagementUtil_1.$po)({ id }, galleryExtension.identifier));
                            let compatible;
                            try {
                                compatible = await this.O(galleryExtension, false, installPreRelease);
                            }
                            catch (error) {
                                if (!isDependency) {
                                    this.F.info('Skipping the packed extension as it cannot be installed', galleryExtension.identifier.id, (0, errors_1.$8)(error));
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
        async O(extension, sameVersion, installPreRelease) {
            let compatibleExtension;
            const extensionsControlManifest = await this.getExtensionsControlManifest();
            if (extensionsControlManifest.malicious.some(identifier => (0, extensionManagementUtil_1.$po)(extension.identifier, identifier))) {
                throw new extensionManagement_1.$1n(nls.localize(1, null, extension.identifier.id), extensionManagement_1.ExtensionManagementErrorCode.Malicious);
            }
            const deprecationInfo = extensionsControlManifest.deprecated[extension.identifier.id.toLowerCase()];
            if (deprecationInfo?.extension?.autoMigrate) {
                this.F.info(`The '${extension.identifier.id}' extension is deprecated, fetching the compatible '${deprecationInfo.extension.id}' extension instead.`);
                compatibleExtension = (await this.z.getExtensions([{ id: deprecationInfo.extension.id, preRelease: deprecationInfo.extension.preRelease }], { targetPlatform: await this.getTargetPlatform(), compatible: true }, cancellation_1.CancellationToken.None))[0];
                if (!compatibleExtension) {
                    throw new extensionManagement_1.$1n(nls.localize(2, null, extension.identifier.id, deprecationInfo.extension.id), extensionManagement_1.ExtensionManagementErrorCode.Deprecated);
                }
            }
            else {
                if (!await this.canInstall(extension)) {
                    const targetPlatform = await this.getTargetPlatform();
                    throw new extensionManagement_1.$1n(nls.localize(3, null, extension.identifier.id, this.G.nameLong, (0, extensionManagement_1.$Sn)(targetPlatform)), extensionManagement_1.ExtensionManagementErrorCode.IncompatibleTargetPlatform);
                }
                compatibleExtension = await this.P(extension, sameVersion, installPreRelease);
                if (!compatibleExtension) {
                    /** If no compatible release version is found, check if the extension has a release version or not and throw relevant error */
                    if (!installPreRelease && extension.properties.isPreReleaseVersion && (await this.z.getExtensions([extension.identifier], cancellation_1.CancellationToken.None))[0]) {
                        throw new extensionManagement_1.$1n(nls.localize(4, null, extension.identifier.id), extensionManagement_1.ExtensionManagementErrorCode.ReleaseVersionNotFound);
                    }
                    throw new extensionManagement_1.$1n(nls.localize(5, null, extension.identifier.id, this.G.nameLong, this.G.version), extensionManagement_1.ExtensionManagementErrorCode.Incompatible);
                }
            }
            this.F.info('Getting Manifest...', compatibleExtension.identifier.id);
            const manifest = await this.z.getManifest(compatibleExtension, cancellation_1.CancellationToken.None);
            if (manifest === null) {
                throw new extensionManagement_1.$1n(`Missing manifest for extension ${compatibleExtension.identifier.id}`, extensionManagement_1.ExtensionManagementErrorCode.Invalid);
            }
            if (manifest.version !== compatibleExtension.version) {
                throw new extensionManagement_1.$1n(`Cannot install '${compatibleExtension.identifier.id}' extension because of version mismatch in Marketplace`, extensionManagement_1.ExtensionManagementErrorCode.Invalid);
            }
            return { extension: compatibleExtension, manifest };
        }
        async P(extension, sameVersion, includePreRelease) {
            const targetPlatform = await this.getTargetPlatform();
            let compatibleExtension = null;
            if (!sameVersion && extension.hasPreReleaseVersion && extension.properties.isPreReleaseVersion !== includePreRelease) {
                compatibleExtension = (await this.z.getExtensions([{ ...extension.identifier, preRelease: includePreRelease }], { targetPlatform, compatible: true }, cancellation_1.CancellationToken.None))[0] || null;
            }
            if (!compatibleExtension && await this.z.isExtensionCompatible(extension, includePreRelease, targetPlatform)) {
                compatibleExtension = extension;
            }
            if (!compatibleExtension) {
                if (sameVersion) {
                    compatibleExtension = (await this.z.getExtensions([{ ...extension.identifier, version: extension.version }], { targetPlatform, compatible: true }, cancellation_1.CancellationToken.None))[0] || null;
                }
                else {
                    compatibleExtension = await this.z.getCompatibleExtension(extension, includePreRelease, targetPlatform);
                }
            }
            return compatibleExtension;
        }
        async Q(extension, options) {
            const uninstallOptions = {
                ...options,
                profileLocation: extension.isApplicationScoped ? this.H.defaultProfile.extensionsResource : options.profileLocation ?? this.Y()
            };
            const getUninstallExtensionTaskKey = (identifier) => `${identifier.id.toLowerCase()}${uninstallOptions.versionOnly ? `-${extension.manifest.version}` : ''}${uninstallOptions.profileLocation ? `@${uninstallOptions.profileLocation.toString()}` : ''}`;
            const uninstallExtensionTask = this.m.get(getUninstallExtensionTaskKey(extension.identifier));
            if (uninstallExtensionTask) {
                this.F.info('Extensions is already requested to uninstall', extension.identifier.id);
                return uninstallExtensionTask.waitUntilTaskIsFinished();
            }
            const createUninstallExtensionTask = (extension) => {
                const uninstallExtensionTask = this.$(extension, uninstallOptions);
                this.m.set(getUninstallExtensionTaskKey(uninstallExtensionTask.extension.identifier), uninstallExtensionTask);
                if (uninstallOptions.profileLocation) {
                    this.F.info('Uninstalling extension from the profile:', `${extension.identifier.id}@${extension.manifest.version}`, uninstallOptions.profileLocation.toString());
                }
                else {
                    this.F.info('Uninstalling extension:', `${extension.identifier.id}@${extension.manifest.version}`);
                }
                this.t.fire({ identifier: extension.identifier, profileLocation: uninstallOptions.profileLocation, applicationScoped: extension.isApplicationScoped });
                return uninstallExtensionTask;
            };
            const postUninstallExtension = (extension, error) => {
                if (error) {
                    if (uninstallOptions.profileLocation) {
                        this.F.error('Failed to uninstall extension from the profile:', `${extension.identifier.id}@${extension.manifest.version}`, uninstallOptions.profileLocation.toString(), error.message);
                    }
                    else {
                        this.F.error('Failed to uninstall extension:', `${extension.identifier.id}@${extension.manifest.version}`, error.message);
                    }
                }
                else {
                    if (uninstallOptions.profileLocation) {
                        this.F.info('Successfully uninstalled extension from the profile', `${extension.identifier.id}@${extension.manifest.version}`, uninstallOptions.profileLocation.toString());
                    }
                    else {
                        this.F.info('Successfully uninstalled extension:', `${extension.identifier.id}@${extension.manifest.version}`);
                    }
                }
                reportTelemetry(this.C, 'extensionGallery:uninstall', { extensionData: (0, extensionManagementUtil_1.$wo)(extension), error });
                this.u.fire({ identifier: extension.identifier, error: error?.code, profileLocation: uninstallOptions.profileLocation, applicationScoped: extension.isApplicationScoped });
            };
            const allTasks = [];
            const processedTasks = [];
            try {
                allTasks.push(createUninstallExtensionTask(extension));
                const installed = await this.getInstalled(1 /* ExtensionType.User */, uninstallOptions.profileLocation);
                if (uninstallOptions.donotIncludePack) {
                    this.F.info('Uninstalling the extension without including packed extension', `${extension.identifier.id}@${extension.manifest.version}`);
                }
                else {
                    const packedExtensions = this.U(extension, installed);
                    for (const packedExtension of packedExtensions) {
                        if (this.m.has(getUninstallExtensionTaskKey(packedExtension.identifier))) {
                            this.F.info('Extensions is already requested to uninstall', packedExtension.identifier.id);
                        }
                        else {
                            allTasks.push(createUninstallExtensionTask(packedExtension));
                        }
                    }
                }
                if (uninstallOptions.donotCheckDependents) {
                    this.F.info('Uninstalling the extension without checking dependents', `${extension.identifier.id}@${extension.manifest.version}`);
                }
                else {
                    this.R(allTasks.map(task => task.extension), installed, extension);
                }
                // Uninstall extensions in parallel and wait until all extensions are uninstalled / failed
                await this.M(allTasks.map(async (task) => {
                    try {
                        await task.run();
                        await this.M(this.y.map(participant => participant.postUninstall(task.extension, uninstallOptions, cancellation_1.CancellationToken.None)));
                        // only report if extension has a mapped gallery extension. UUID identifies the gallery extension.
                        if (task.extension.identifier.uuid) {
                            try {
                                await this.z.reportStatistic(task.extension.manifest.publisher, task.extension.manifest.name, task.extension.manifest.version, "uninstall" /* StatisticType.Uninstall */);
                            }
                            catch (error) { /* ignore */ }
                        }
                        postUninstallExtension(task.extension);
                    }
                    catch (e) {
                        const error = e instanceof extensionManagement_1.$1n ? e : new extensionManagement_1.$1n((0, errors_1.$8)(e), extensionManagement_1.ExtensionManagementErrorCode.Internal);
                        postUninstallExtension(task.extension, error);
                        throw error;
                    }
                    finally {
                        processedTasks.push(task);
                    }
                }));
            }
            catch (e) {
                const error = e instanceof extensionManagement_1.$1n ? e : new extensionManagement_1.$1n((0, errors_1.$8)(e), extensionManagement_1.ExtensionManagementErrorCode.Internal);
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
                    if (!this.m.delete(getUninstallExtensionTaskKey(task.extension.identifier))) {
                        this.F.warn('Uninstallation task is not found in the cache', task.extension.identifier.id);
                    }
                }
            }
        }
        R(extensionsToUninstall, installed, extensionToUninstall) {
            for (const extension of extensionsToUninstall) {
                const dependents = this.W(extension, installed);
                if (dependents.length) {
                    const remainingDependents = dependents.filter(dependent => !extensionsToUninstall.some(e => (0, extensionManagementUtil_1.$po)(e.identifier, dependent.identifier)));
                    if (remainingDependents.length) {
                        throw new Error(this.S(extension, remainingDependents, extensionToUninstall));
                    }
                }
            }
        }
        S(dependingExtension, dependents, extensionToUninstall) {
            if (extensionToUninstall === dependingExtension) {
                if (dependents.length === 1) {
                    return nls.localize(6, null, extensionToUninstall.manifest.displayName || extensionToUninstall.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name);
                }
                if (dependents.length === 2) {
                    return nls.localize(7, null, extensionToUninstall.manifest.displayName || extensionToUninstall.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name, dependents[1].manifest.displayName || dependents[1].manifest.name);
                }
                return nls.localize(8, null, extensionToUninstall.manifest.displayName || extensionToUninstall.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name, dependents[1].manifest.displayName || dependents[1].manifest.name);
            }
            if (dependents.length === 1) {
                return nls.localize(9, null, extensionToUninstall.manifest.displayName || extensionToUninstall.manifest.name, dependingExtension.manifest.displayName
                    || dependingExtension.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name);
            }
            if (dependents.length === 2) {
                return nls.localize(10, null, extensionToUninstall.manifest.displayName || extensionToUninstall.manifest.name, dependingExtension.manifest.displayName
                    || dependingExtension.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name, dependents[1].manifest.displayName || dependents[1].manifest.name);
            }
            return nls.localize(11, null, extensionToUninstall.manifest.displayName || extensionToUninstall.manifest.name, dependingExtension.manifest.displayName
                || dependingExtension.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name, dependents[1].manifest.displayName || dependents[1].manifest.name);
        }
        U(extension, installed, checked = []) {
            if (checked.indexOf(extension) !== -1) {
                return [];
            }
            checked.push(extension);
            const extensionsPack = extension.manifest.extensionPack ? extension.manifest.extensionPack : [];
            if (extensionsPack.length) {
                const packedExtensions = installed.filter(i => !i.isBuiltin && extensionsPack.some(id => (0, extensionManagementUtil_1.$po)({ id }, i.identifier)));
                const packOfPackedExtensions = [];
                for (const packedExtension of packedExtensions) {
                    packOfPackedExtensions.push(...this.U(packedExtension, installed, checked));
                }
                return [...packedExtensions, ...packOfPackedExtensions];
            }
            return [];
        }
        W(extension, installed) {
            return installed.filter(e => e.manifest.extensionDependencies && e.manifest.extensionDependencies.some(id => (0, extensionManagementUtil_1.$po)({ id }, extension.identifier)));
        }
        async X() {
            try {
                this.F.trace('ExtensionManagementService.refreshReportedCache');
                const manifest = await this.z.getExtensionsControlManifest();
                this.F.trace(`ExtensionManagementService.refreshControlCache`, manifest);
                return manifest;
            }
            catch (err) {
                this.F.trace('ExtensionManagementService.refreshControlCache - failed to get extension control manifest');
                return { malicious: [], deprecated: {}, search: [] };
            }
        }
    };
    exports.$fp = $fp;
    exports.$fp = $fp = __decorate([
        __param(0, extensionManagement_1.$Zn),
        __param(1, telemetry_1.$9k),
        __param(2, uriIdentity_1.$Ck),
        __param(3, log_1.$5i),
        __param(4, productService_1.$kj),
        __param(5, userDataProfile_1.$Ek)
    ], $fp);
    function $gp(errorOrErrors) {
        const errors = Array.isArray(errorOrErrors) ? errorOrErrors : [errorOrErrors];
        if (errors.length === 1) {
            return errors[0] instanceof Error ? errors[0] : new Error(errors[0]);
        }
        return errors.reduce((previousValue, currentValue) => {
            return new Error(`${previousValue.message}${previousValue.message ? ',' : ''}${currentValue instanceof Error ? currentValue.message : currentValue}`);
        }, new Error(''));
    }
    exports.$gp = $gp;
    function $hp(error) {
        if (error instanceof extensionManagement_1.$1n) {
            return error;
        }
        const e = new extensionManagement_1.$1n(error.message, extensionManagement_1.ExtensionManagementErrorCode.Internal);
        e.stack = error.stack;
        return e;
    }
    exports.$hp = $hp;
    function reportTelemetry(telemetryService, eventName, { extensionData, verificationStatus, duration, error, durationSinceUpdate }) {
        let errorcode;
        let errorcodeDetail;
        if ((0, types_1.$rf)(verificationStatus)) {
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
            if (error instanceof extensionManagement_1.$1n) {
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
    class $ip {
        constructor() {
            this.d = new async_1.$Fg();
        }
        async waitUntilTaskIsFinished() {
            await this.d.wait();
            return this.g;
        }
        async run() {
            if (!this.g) {
                this.g = (0, async_1.$ug)(token => this.h(token));
            }
            this.d.open();
            return this.g;
        }
        cancel() {
            if (!this.g) {
                this.g = (0, async_1.$ug)(token => {
                    return new Promise((c, e) => {
                        const disposable = token.onCancellationRequested(() => {
                            disposable.dispose();
                            e(new errors_1.$3());
                        });
                    });
                });
                this.d.open();
            }
            this.g.cancel();
        }
    }
    exports.$ip = $ip;
});
//# sourceMappingURL=abstractExtensionManagementService.js.map