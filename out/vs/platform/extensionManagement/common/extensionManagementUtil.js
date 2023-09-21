/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensions/common/extensions", "vs/base/common/platform", "vs/base/common/uri", "vs/base/common/errors", "vs/base/common/process", "vs/platform/telemetry/common/telemetryUtils"], function (require, exports, strings_1, extensionManagement_1, extensions_1, platform_1, uri_1, errors_1, process_1, telemetryUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.computeTargetPlatform = exports.getExtensionDependencies = exports.BetterMergeId = exports.getGalleryExtensionTelemetryData = exports.getLocalExtensionTelemetryData = exports.groupByExtension = exports.getGalleryExtensionId = exports.adoptToGalleryExtensionId = exports.getExtensionId = exports.getIdAndVersion = exports.ExtensionKey = exports.areSameExtensions = void 0;
    function areSameExtensions(a, b) {
        if (a.uuid && b.uuid) {
            return a.uuid === b.uuid;
        }
        if (a.id === b.id) {
            return true;
        }
        return (0, strings_1.compareIgnoreCase)(a.id, b.id) === 0;
    }
    exports.areSameExtensions = areSameExtensions;
    const ExtensionKeyRegex = /^([^.]+\..+)-(\d+\.\d+\.\d+)(-(.+))?$/;
    class ExtensionKey {
        static create(extension) {
            const version = extension.manifest ? extension.manifest.version : extension.version;
            const targetPlatform = extension.manifest ? extension.targetPlatform : extension.properties.targetPlatform;
            return new ExtensionKey(extension.identifier, version, targetPlatform);
        }
        static parse(key) {
            const matches = ExtensionKeyRegex.exec(key);
            return matches && matches[1] && matches[2] ? new ExtensionKey({ id: matches[1] }, matches[2], matches[4] || undefined) : null;
        }
        constructor(identifier, version, targetPlatform = "undefined" /* TargetPlatform.UNDEFINED */) {
            this.version = version;
            this.targetPlatform = targetPlatform;
            this.id = identifier.id;
        }
        toString() {
            return `${this.id}-${this.version}${this.targetPlatform !== "undefined" /* TargetPlatform.UNDEFINED */ ? `-${this.targetPlatform}` : ''}`;
        }
        equals(o) {
            if (!(o instanceof ExtensionKey)) {
                return false;
            }
            return areSameExtensions(this, o) && this.version === o.version && this.targetPlatform === o.targetPlatform;
        }
    }
    exports.ExtensionKey = ExtensionKey;
    const EXTENSION_IDENTIFIER_WITH_VERSION_REGEX = /^([^.]+\..+)@((prerelease)|(\d+\.\d+\.\d+(-.*)?))$/;
    function getIdAndVersion(id) {
        const matches = EXTENSION_IDENTIFIER_WITH_VERSION_REGEX.exec(id);
        if (matches && matches[1]) {
            return [adoptToGalleryExtensionId(matches[1]), matches[2]];
        }
        return [adoptToGalleryExtensionId(id), undefined];
    }
    exports.getIdAndVersion = getIdAndVersion;
    function getExtensionId(publisher, name) {
        return `${publisher}.${name}`;
    }
    exports.getExtensionId = getExtensionId;
    function adoptToGalleryExtensionId(id) {
        return id.toLowerCase();
    }
    exports.adoptToGalleryExtensionId = adoptToGalleryExtensionId;
    function getGalleryExtensionId(publisher, name) {
        return adoptToGalleryExtensionId(getExtensionId(publisher ?? extensions_1.UNDEFINED_PUBLISHER, name));
    }
    exports.getGalleryExtensionId = getGalleryExtensionId;
    function groupByExtension(extensions, getExtensionIdentifier) {
        const byExtension = [];
        const findGroup = (extension) => {
            for (const group of byExtension) {
                if (group.some(e => areSameExtensions(getExtensionIdentifier(e), getExtensionIdentifier(extension)))) {
                    return group;
                }
            }
            return null;
        };
        for (const extension of extensions) {
            const group = findGroup(extension);
            if (group) {
                group.push(extension);
            }
            else {
                byExtension.push([extension]);
            }
        }
        return byExtension;
    }
    exports.groupByExtension = groupByExtension;
    function getLocalExtensionTelemetryData(extension) {
        return {
            id: extension.identifier.id,
            name: extension.manifest.name,
            galleryId: null,
            publisherId: extension.publisherId,
            publisherName: extension.manifest.publisher,
            publisherDisplayName: extension.publisherDisplayName,
            dependencies: extension.manifest.extensionDependencies && extension.manifest.extensionDependencies.length > 0
        };
    }
    exports.getLocalExtensionTelemetryData = getLocalExtensionTelemetryData;
    /* __GDPR__FRAGMENT__
        "GalleryExtensionTelemetryData" : {
            "id" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
            "name": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
            "galleryId": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
            "publisherId": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
            "publisherName": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
            "publisherDisplayName": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
            "isPreReleaseVersion": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
            "dependencies": { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
            "isSigned": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
            "${include}": [
                "${GalleryExtensionTelemetryData2}"
            ]
        }
    */
    function getGalleryExtensionTelemetryData(extension) {
        return {
            id: new telemetryUtils_1.TelemetryTrustedValue(extension.identifier.id),
            name: new telemetryUtils_1.TelemetryTrustedValue(extension.name),
            galleryId: extension.identifier.uuid,
            publisherId: extension.publisherId,
            publisherName: extension.publisher,
            publisherDisplayName: extension.publisherDisplayName,
            isPreReleaseVersion: extension.properties.isPreReleaseVersion,
            dependencies: !!(extension.properties.dependencies && extension.properties.dependencies.length > 0),
            isSigned: extension.isSigned,
            ...extension.telemetryData
        };
    }
    exports.getGalleryExtensionTelemetryData = getGalleryExtensionTelemetryData;
    exports.BetterMergeId = new extensions_1.ExtensionIdentifier('pprice.better-merge');
    function getExtensionDependencies(installedExtensions, extension) {
        const dependencies = [];
        const extensions = extension.manifest.extensionDependencies?.slice(0) ?? [];
        while (extensions.length) {
            const id = extensions.shift();
            if (id && dependencies.every(e => !areSameExtensions(e.identifier, { id }))) {
                const ext = installedExtensions.filter(e => areSameExtensions(e.identifier, { id }));
                if (ext.length === 1) {
                    dependencies.push(ext[0]);
                    extensions.push(...ext[0].manifest.extensionDependencies?.slice(0) ?? []);
                }
            }
        }
        return dependencies;
    }
    exports.getExtensionDependencies = getExtensionDependencies;
    async function isAlpineLinux(fileService, logService) {
        if (!platform_1.isLinux) {
            return false;
        }
        let content;
        try {
            const fileContent = await fileService.readFile(uri_1.URI.file('/etc/os-release'));
            content = fileContent.value.toString();
        }
        catch (error) {
            try {
                const fileContent = await fileService.readFile(uri_1.URI.file('/usr/lib/os-release'));
                content = fileContent.value.toString();
            }
            catch (error) {
                /* Ignore */
                logService.debug(`Error while getting the os-release file.`, (0, errors_1.getErrorMessage)(error));
            }
        }
        return !!content && (content.match(/^ID=([^\u001b\r\n]*)/m) || [])[1] === 'alpine';
    }
    async function computeTargetPlatform(fileService, logService) {
        const alpineLinux = await isAlpineLinux(fileService, logService);
        const targetPlatform = (0, extensionManagement_1.getTargetPlatform)(alpineLinux ? 'alpine' : platform_1.platform, process_1.arch);
        logService.debug('ComputeTargetPlatform:', targetPlatform);
        return targetPlatform;
    }
    exports.computeTargetPlatform = computeTargetPlatform;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uTWFuYWdlbWVudFV0aWwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9leHRlbnNpb25NYW5hZ2VtZW50L2NvbW1vbi9leHRlbnNpb25NYW5hZ2VtZW50VXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFhaEcsU0FBZ0IsaUJBQWlCLENBQUMsQ0FBdUIsRUFBRSxDQUF1QjtRQUNqRixJQUFJLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRTtZQUNyQixPQUFPLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQztTQUN6QjtRQUNELElBQUksQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ2xCLE9BQU8sSUFBSSxDQUFDO1NBQ1o7UUFDRCxPQUFPLElBQUEsMkJBQWlCLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFSRCw4Q0FRQztJQUVELE1BQU0saUJBQWlCLEdBQUcsdUNBQXVDLENBQUM7SUFFbEUsTUFBYSxZQUFZO1FBRXhCLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBeUM7WUFDdEQsTUFBTSxPQUFPLEdBQUksU0FBd0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFFLFNBQXdCLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUUsU0FBK0IsQ0FBQyxPQUFPLENBQUM7WUFDM0ksTUFBTSxjQUFjLEdBQUksU0FBd0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFFLFNBQXdCLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBRSxTQUErQixDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUM7WUFDbEssT0FBTyxJQUFJLFlBQVksQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxjQUFjLENBQUMsQ0FBQztRQUN4RSxDQUFDO1FBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFXO1lBQ3ZCLE1BQU0sT0FBTyxHQUFHLGlCQUFpQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM1QyxPQUFPLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLFlBQVksQ0FBQyxFQUFFLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBbUIsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ2pKLENBQUM7UUFJRCxZQUNDLFVBQWdDLEVBQ3ZCLE9BQWUsRUFDZiwyREFBeUQ7WUFEekQsWUFBTyxHQUFQLE9BQU8sQ0FBUTtZQUNmLG1CQUFjLEdBQWQsY0FBYyxDQUEyQztZQUVsRSxJQUFJLENBQUMsRUFBRSxHQUFHLFVBQVUsQ0FBQyxFQUFFLENBQUM7UUFDekIsQ0FBQztRQUVELFFBQVE7WUFDUCxPQUFPLEdBQUcsSUFBSSxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLCtDQUE2QixDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDekgsQ0FBQztRQUVELE1BQU0sQ0FBQyxDQUFNO1lBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxZQUFZLFlBQVksQ0FBQyxFQUFFO2dCQUNqQyxPQUFPLEtBQUssQ0FBQzthQUNiO1lBQ0QsT0FBTyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxDQUFDLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxjQUFjLEtBQUssQ0FBQyxDQUFDLGNBQWMsQ0FBQztRQUM3RyxDQUFDO0tBQ0Q7SUFqQ0Qsb0NBaUNDO0lBRUQsTUFBTSx1Q0FBdUMsR0FBRyxvREFBb0QsQ0FBQztJQUNyRyxTQUFnQixlQUFlLENBQUMsRUFBVTtRQUN6QyxNQUFNLE9BQU8sR0FBRyx1Q0FBdUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDakUsSUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQzFCLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUMzRDtRQUNELE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBTkQsMENBTUM7SUFFRCxTQUFnQixjQUFjLENBQUMsU0FBaUIsRUFBRSxJQUFZO1FBQzdELE9BQU8sR0FBRyxTQUFTLElBQUksSUFBSSxFQUFFLENBQUM7SUFDL0IsQ0FBQztJQUZELHdDQUVDO0lBRUQsU0FBZ0IseUJBQXlCLENBQUMsRUFBVTtRQUNuRCxPQUFPLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN6QixDQUFDO0lBRkQsOERBRUM7SUFFRCxTQUFnQixxQkFBcUIsQ0FBQyxTQUE2QixFQUFFLElBQVk7UUFDaEYsT0FBTyx5QkFBeUIsQ0FBQyxjQUFjLENBQUMsU0FBUyxJQUFJLGdDQUFtQixFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDMUYsQ0FBQztJQUZELHNEQUVDO0lBRUQsU0FBZ0IsZ0JBQWdCLENBQUksVUFBZSxFQUFFLHNCQUFzRDtRQUMxRyxNQUFNLFdBQVcsR0FBVSxFQUFFLENBQUM7UUFDOUIsTUFBTSxTQUFTLEdBQUcsQ0FBQyxTQUFZLEVBQUUsRUFBRTtZQUNsQyxLQUFLLE1BQU0sS0FBSyxJQUFJLFdBQVcsRUFBRTtnQkFDaEMsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsaUJBQWlCLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLEVBQUUsc0JBQXNCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFO29CQUNyRyxPQUFPLEtBQUssQ0FBQztpQkFDYjthQUNEO1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDLENBQUM7UUFDRixLQUFLLE1BQU0sU0FBUyxJQUFJLFVBQVUsRUFBRTtZQUNuQyxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbkMsSUFBSSxLQUFLLEVBQUU7Z0JBQ1YsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUN0QjtpQkFBTTtnQkFDTixXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQzthQUM5QjtTQUNEO1FBQ0QsT0FBTyxXQUFXLENBQUM7SUFDcEIsQ0FBQztJQW5CRCw0Q0FtQkM7SUFFRCxTQUFnQiw4QkFBOEIsQ0FBQyxTQUEwQjtRQUN4RSxPQUFPO1lBQ04sRUFBRSxFQUFFLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUMzQixJQUFJLEVBQUUsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJO1lBQzdCLFNBQVMsRUFBRSxJQUFJO1lBQ2YsV0FBVyxFQUFFLFNBQVMsQ0FBQyxXQUFXO1lBQ2xDLGFBQWEsRUFBRSxTQUFTLENBQUMsUUFBUSxDQUFDLFNBQVM7WUFDM0Msb0JBQW9CLEVBQUUsU0FBUyxDQUFDLG9CQUFvQjtZQUNwRCxZQUFZLEVBQUUsU0FBUyxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sR0FBRyxDQUFDO1NBQzdHLENBQUM7SUFDSCxDQUFDO0lBVkQsd0VBVUM7SUFHRDs7Ozs7Ozs7Ozs7Ozs7O01BZUU7SUFDRixTQUFnQixnQ0FBZ0MsQ0FBQyxTQUE0QjtRQUM1RSxPQUFPO1lBQ04sRUFBRSxFQUFFLElBQUksc0NBQXFCLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7WUFDdEQsSUFBSSxFQUFFLElBQUksc0NBQXFCLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztZQUMvQyxTQUFTLEVBQUUsU0FBUyxDQUFDLFVBQVUsQ0FBQyxJQUFJO1lBQ3BDLFdBQVcsRUFBRSxTQUFTLENBQUMsV0FBVztZQUNsQyxhQUFhLEVBQUUsU0FBUyxDQUFDLFNBQVM7WUFDbEMsb0JBQW9CLEVBQUUsU0FBUyxDQUFDLG9CQUFvQjtZQUNwRCxtQkFBbUIsRUFBRSxTQUFTLENBQUMsVUFBVSxDQUFDLG1CQUFtQjtZQUM3RCxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxZQUFZLElBQUksU0FBUyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUNuRyxRQUFRLEVBQUUsU0FBUyxDQUFDLFFBQVE7WUFDNUIsR0FBRyxTQUFTLENBQUMsYUFBYTtTQUMxQixDQUFDO0lBQ0gsQ0FBQztJQWJELDRFQWFDO0lBRVksUUFBQSxhQUFhLEdBQUcsSUFBSSxnQ0FBbUIsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0lBRTVFLFNBQWdCLHdCQUF3QixDQUFDLG1CQUE4QyxFQUFFLFNBQXFCO1FBQzdHLE1BQU0sWUFBWSxHQUFpQixFQUFFLENBQUM7UUFDdEMsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBRTVFLE9BQU8sVUFBVSxDQUFDLE1BQU0sRUFBRTtZQUN6QixNQUFNLEVBQUUsR0FBRyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7WUFFOUIsSUFBSSxFQUFFLElBQUksWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRTtnQkFDNUUsTUFBTSxHQUFHLEdBQUcsbUJBQW1CLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDckYsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtvQkFDckIsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDMUIsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMscUJBQXFCLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO2lCQUMxRTthQUNEO1NBQ0Q7UUFFRCxPQUFPLFlBQVksQ0FBQztJQUNyQixDQUFDO0lBakJELDREQWlCQztJQUVELEtBQUssVUFBVSxhQUFhLENBQUMsV0FBeUIsRUFBRSxVQUF1QjtRQUM5RSxJQUFJLENBQUMsa0JBQU8sRUFBRTtZQUNiLE9BQU8sS0FBSyxDQUFDO1NBQ2I7UUFDRCxJQUFJLE9BQTJCLENBQUM7UUFDaEMsSUFBSTtZQUNILE1BQU0sV0FBVyxHQUFHLE1BQU0sV0FBVyxDQUFDLFFBQVEsQ0FBQyxTQUFHLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztZQUM1RSxPQUFPLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUN2QztRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ2YsSUFBSTtnQkFDSCxNQUFNLFdBQVcsR0FBRyxNQUFNLFdBQVcsQ0FBQyxRQUFRLENBQUMsU0FBRyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hGLE9BQU8sR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQ3ZDO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ2YsWUFBWTtnQkFDWixVQUFVLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxFQUFFLElBQUEsd0JBQWUsRUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2FBQ3JGO1NBQ0Q7UUFDRCxPQUFPLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxDQUFDO0lBQ3BGLENBQUM7SUFFTSxLQUFLLFVBQVUscUJBQXFCLENBQUMsV0FBeUIsRUFBRSxVQUF1QjtRQUM3RixNQUFNLFdBQVcsR0FBRyxNQUFNLGFBQWEsQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDakUsTUFBTSxjQUFjLEdBQUcsSUFBQSx1Q0FBaUIsRUFBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsbUJBQVEsRUFBRSxjQUFJLENBQUMsQ0FBQztRQUNsRixVQUFVLENBQUMsS0FBSyxDQUFDLHdCQUF3QixFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQzNELE9BQU8sY0FBYyxDQUFDO0lBQ3ZCLENBQUM7SUFMRCxzREFLQyJ9