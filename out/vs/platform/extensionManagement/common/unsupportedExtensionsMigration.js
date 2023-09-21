/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/platform/extensionManagement/common/extensionManagementUtil"], function (require, exports, cancellation_1, extensionManagementUtil_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.migrateUnsupportedExtensions = void 0;
    /**
     * Migrates the installed unsupported nightly extension to a supported pre-release extension. It includes following:
     * 	- Uninstall the Unsupported extension
     * 	- Install (with optional storage migration) the Pre-release extension only if
     * 		- the extension is not installed
     * 		- or it is a release version and the unsupported extension is enabled.
     */
    async function migrateUnsupportedExtensions(extensionManagementService, galleryService, extensionStorageService, extensionEnablementService, logService) {
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
                const unsupportedExtension = installed.find(i => (0, extensionManagementUtil_1.areSameExtensions)(i.identifier, { id: unsupportedExtensionId }));
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
                    const isUnsupportedExtensionEnabled = !extensionEnablementService.getDisabledExtensions().some(e => (0, extensionManagementUtil_1.areSameExtensions)(e, unsupportedExtension.identifier));
                    await extensionManagementService.uninstall(unsupportedExtension);
                    logService.info(`Uninstalled the unsupported extension '${unsupportedExtension.identifier.id}'`);
                    let preReleaseExtension = installed.find(i => (0, extensionManagementUtil_1.areSameExtensions)(i.identifier, { id: preReleaseExtensionId }));
                    if (!preReleaseExtension || (!preReleaseExtension.isPreReleaseVersion && isUnsupportedExtensionEnabled)) {
                        preReleaseExtension = await extensionManagementService.installFromGallery(gallery, { installPreReleaseVersion: true, isMachineScoped: unsupportedExtension.isMachineScoped, operation: 4 /* InstallOperation.Migrate */ });
                        logService.info(`Installed the pre-release extension '${preReleaseExtension.identifier.id}'`);
                        if (!isUnsupportedExtensionEnabled) {
                            await extensionEnablementService.disableExtension(preReleaseExtension.identifier);
                            logService.info(`Disabled the pre-release extension '${preReleaseExtension.identifier.id}' because the unsupported extension '${unsupportedExtension.identifier.id}' is disabled`);
                        }
                        if (autoMigrate.storage) {
                            extensionStorageService.addToMigrationList((0, extensionManagementUtil_1.getExtensionId)(unsupportedExtension.manifest.publisher, unsupportedExtension.manifest.name), (0, extensionManagementUtil_1.getExtensionId)(preReleaseExtension.manifest.publisher, preReleaseExtension.manifest.name));
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
    exports.migrateUnsupportedExtensions = migrateUnsupportedExtensions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5zdXBwb3J0ZWRFeHRlbnNpb25zTWlncmF0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vZXh0ZW5zaW9uTWFuYWdlbWVudC9jb21tb24vdW5zdXBwb3J0ZWRFeHRlbnNpb25zTWlncmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVNoRzs7Ozs7O09BTUc7SUFDSSxLQUFLLFVBQVUsNEJBQTRCLENBQUMsMEJBQXVELEVBQUUsY0FBd0MsRUFBRSx1QkFBaUQsRUFBRSwwQkFBNkQsRUFBRSxVQUF1QjtRQUM5UixJQUFJO1lBQ0gsTUFBTSx5QkFBeUIsR0FBRyxNQUFNLDBCQUEwQixDQUFDLDRCQUE0QixFQUFFLENBQUM7WUFDbEcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFVBQVUsRUFBRTtnQkFDMUMsT0FBTzthQUNQO1lBQ0QsTUFBTSxTQUFTLEdBQUcsTUFBTSwwQkFBMEIsQ0FBQyxZQUFZLDRCQUFvQixDQUFDO1lBQ3BGLEtBQUssTUFBTSxDQUFDLHNCQUFzQixFQUFFLFVBQVUsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMseUJBQXlCLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQ3hHLElBQUksQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFO29CQUMzQixTQUFTO2lCQUNUO2dCQUNELE1BQU0sRUFBRSxFQUFFLEVBQUUscUJBQXFCLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUM7Z0JBQ3BGLElBQUksQ0FBQyxXQUFXLEVBQUU7b0JBQ2pCLFNBQVM7aUJBQ1Q7Z0JBQ0QsTUFBTSxvQkFBb0IsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBQSwyQ0FBaUIsRUFBQyxDQUFDLENBQUMsVUFBVSxFQUFFLEVBQUUsRUFBRSxFQUFFLHNCQUFz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