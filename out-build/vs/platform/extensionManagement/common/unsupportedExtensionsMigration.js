/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/platform/extensionManagement/common/extensionManagementUtil"], function (require, exports, cancellation_1, extensionManagementUtil_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$0Ub = void 0;
    /**
     * Migrates the installed unsupported nightly extension to a supported pre-release extension. It includes following:
     * 	- Uninstall the Unsupported extension
     * 	- Install (with optional storage migration) the Pre-release extension only if
     * 		- the extension is not installed
     * 		- or it is a release version and the unsupported extension is enabled.
     */
    async function $0Ub(extensionManagementService, galleryService, extensionStorageService, extensionEnablementService, logService) {
        try {
            const extensionsControlManifest = await extensionManagementService.getExtensionsControlManifest();
            if (!extensionsControlManifest.deprecated) {
                return;
            }
            const installed = await extensionManagementService.getInstalled(1 /* ExtensionType.User */);
            for (const [unsupportedExtensionId, deprecated] of Object.entries(extensionsControlManifest.deprecated)) {
                if (!deprecated?.extension) {
                    continue;
                }
                const { id: preReleaseExtensionId, autoMigrate, preRelease } = deprecated.extension;
                if (!autoMigrate) {
                    continue;
                }
                const unsupportedExtension = installed.find(i => (0, extensionManagementUtil_1.$po)(i.identifier, { id: unsupportedExtensionId }));
                // Unsupported Extension is not installed
                if (!unsupportedExtension) {
                    continue;
                }
                const gallery = (await galleryService.getExtensions([{ id: preReleaseExtensionId, preRelease }], { targetPlatform: await extensionManagementService.getTargetPlatform(), compatible: true }, cancellation_1.CancellationToken.None))[0];
                if (!gallery) {
                    logService.info(`Skipping migrating '${unsupportedExtension.identifier.id}' extension because, the comaptible target '${preReleaseExtensionId}' extension is not found`);
                    continue;
                }
                try {
                    logService.info(`Migrating '${unsupportedExtension.identifier.id}' extension to '${preReleaseExtensionId}' extension...`);
                    const isUnsupportedExtensionEnabled = !extensionEnablementService.getDisabledExtensions().some(e => (0, extensionManagementUtil_1.$po)(e, unsupportedExtension.identifier));
                    await extensionManagementService.uninstall(unsupportedExtension);
                    logService.info(`Uninstalled the unsupported extension '${unsupportedExtension.identifier.id}'`);
                    let preReleaseExtension = installed.find(i => (0, extensionManagementUtil_1.$po)(i.identifier, { id: preReleaseExtensionId }));
                    if (!preReleaseExtension || (!preReleaseExtension.isPreReleaseVersion && isUnsupportedExtensionEnabled)) {
                        preReleaseExtension = await extensionManagementService.installFromGallery(gallery, { installPreReleaseVersion: true, isMachineScoped: unsupportedExtension.isMachineScoped, operation: 4 /* InstallOperation.Migrate */ });
                        logService.info(`Installed the pre-release extension '${preReleaseExtension.identifier.id}'`);
                        if (!isUnsupportedExtensionEnabled) {
                            await extensionEnablementService.disableExtension(preReleaseExtension.identifier);
                            logService.info(`Disabled the pre-release extension '${preReleaseExtension.identifier.id}' because the unsupported extension '${unsupportedExtension.identifier.id}' is disabled`);
                        }
                        if (autoMigrate.storage) {
                            extensionStorageService.addToMigrationList((0, extensionManagementUtil_1.$so)(unsupportedExtension.manifest.publisher, unsupportedExtension.manifest.name), (0, extensionManagementUtil_1.$so)(preReleaseExtension.manifest.publisher, preReleaseExtension.manifest.name));
                            logService.info(`Added pre-release extension to the storage migration list`);
                        }
                    }
                    logService.info(`Migrated '${unsupportedExtension.identifier.id}' extension to '${preReleaseExtensionId}' extension.`);
                }
                catch (error) {
                    logService.error(error);
                }
            }
        }
        catch (error) {
            logService.error(error);
        }
    }
    exports.$0Ub = $0Ub;
});
//# sourceMappingURL=unsupportedExtensionsMigration.js.map