/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensions/common/extensions", "vs/base/common/platform", "vs/base/common/uri", "vs/base/common/errors", "vs/base/common/process", "vs/platform/telemetry/common/telemetryUtils"], function (require, exports, strings_1, extensionManagement_1, extensions_1, platform_1, uri_1, errors_1, process_1, telemetryUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Ao = exports.$zo = exports.$yo = exports.$xo = exports.$wo = exports.$vo = exports.$uo = exports.$to = exports.$so = exports.$ro = exports.$qo = exports.$po = void 0;
    function $po(a, b) {
        if (a.uuid && b.uuid) {
            return a.uuid === b.uuid;
        }
        if (a.id === b.id) {
            return true;
        }
        return (0, strings_1.$He)(a.id, b.id) === 0;
    }
    exports.$po = $po;
    const ExtensionKeyRegex = /^([^.]+\..+)-(\d+\.\d+\.\d+)(-(.+))?$/;
    class $qo {
        static create(extension) {
            const version = extension.manifest ? extension.manifest.version : extension.version;
            const targetPlatform = extension.manifest ? extension.targetPlatform : extension.properties.targetPlatform;
            return new $qo(extension.identifier, version, targetPlatform);
        }
        static parse(key) {
            const matches = ExtensionKeyRegex.exec(key);
            return matches && matches[1] && matches[2] ? new $qo({ id: matches[1] }, matches[2], matches[4] || undefined) : null;
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
            if (!(o instanceof $qo)) {
                return false;
            }
            return $po(this, o) && this.version === o.version && this.targetPlatform === o.targetPlatform;
        }
    }
    exports.$qo = $qo;
    const EXTENSION_IDENTIFIER_WITH_VERSION_REGEX = /^([^.]+\..+)@((prerelease)|(\d+\.\d+\.\d+(-.*)?))$/;
    function $ro(id) {
        const matches = EXTENSION_IDENTIFIER_WITH_VERSION_REGEX.exec(id);
        if (matches && matches[1]) {
            return [$to(matches[1]), matches[2]];
        }
        return [$to(id), undefined];
    }
    exports.$ro = $ro;
    function $so(publisher, name) {
        return `${publisher}.${name}`;
    }
    exports.$so = $so;
    function $to(id) {
        return id.toLowerCase();
    }
    exports.$to = $to;
    function $uo(publisher, name) {
        return $to($so(publisher ?? extensions_1.$Rl, name));
    }
    exports.$uo = $uo;
    function $vo(extensions, getExtensionIdentifier) {
        const byExtension = [];
        const findGroup = (extension) => {
            for (const group of byExtension) {
                if (group.some(e => $po(getExtensionIdentifier(e), getExtensionIdentifier(extension)))) {
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
    exports.$vo = $vo;
    function $wo(extension) {
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
    exports.$wo = $wo;
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
    function $xo(extension) {
        return {
            id: new telemetryUtils_1.$_n(extension.identifier.id),
            name: new telemetryUtils_1.$_n(extension.name),
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
    exports.$xo = $xo;
    exports.$yo = new extensions_1.$Vl('pprice.better-merge');
    function $zo(installedExtensions, extension) {
        const dependencies = [];
        const extensions = extension.manifest.extensionDependencies?.slice(0) ?? [];
        while (extensions.length) {
            const id = extensions.shift();
            if (id && dependencies.every(e => !$po(e.identifier, { id }))) {
                const ext = installedExtensions.filter(e => $po(e.identifier, { id }));
                if (ext.length === 1) {
                    dependencies.push(ext[0]);
                    extensions.push(...ext[0].manifest.extensionDependencies?.slice(0) ?? []);
                }
            }
        }
        return dependencies;
    }
    exports.$zo = $zo;
    async function isAlpineLinux(fileService, logService) {
        if (!platform_1.$k) {
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
                logService.debug(`Error while getting the os-release file.`, (0, errors_1.$8)(error));
            }
        }
        return !!content && (content.match(/^ID=([^\u001b\r\n]*)/m) || [])[1] === 'alpine';
    }
    async function $Ao(fileService, logService) {
        const alpineLinux = await isAlpineLinux(fileService, logService);
        const targetPlatform = (0, extensionManagement_1.$Un)(alpineLinux ? 'alpine' : platform_1.$t, process_1.$4d);
        logService.debug('ComputeTargetPlatform:', targetPlatform);
        return targetPlatform;
    }
    exports.$Ao = $Ao;
});
//# sourceMappingURL=extensionManagementUtil.js.map