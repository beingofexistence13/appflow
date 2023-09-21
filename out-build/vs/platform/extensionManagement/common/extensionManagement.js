/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/platform/extensionManagement/common/extensionManagement", "vs/platform/instantiation/common/instantiation"], function (require, exports, nls_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$9n = exports.$8n = exports.$7n = exports.$6n = exports.$5n = exports.$4n = exports.$3n = exports.$2n = exports.$1n = exports.ExtensionSignaturetErrorCode = exports.ExtensionManagementErrorCode = exports.$Zn = exports.InstallOperation = exports.StatisticType = exports.SortOrder = exports.SortBy = exports.$Yn = exports.$Xn = exports.$Wn = exports.$Vn = exports.$Un = exports.$Tn = exports.$Sn = exports.$Rn = exports.$Qn = exports.$Pn = exports.$On = exports.$Nn = exports.$Mn = void 0;
    exports.$Mn = '^([a-z0-9A-Z][a-z0-9-A-Z]*)\\.([a-z0-9A-Z][a-z0-9-A-Z]*)$';
    exports.$Nn = new RegExp(exports.$Mn);
    exports.$On = '__web_extension';
    exports.$Pn = 'skipWalkthrough';
    exports.$Qn = 'extensionsSync';
    exports.$Rn = 'dependecyOrPackExtensionInstall';
    function $Sn(targetPlatform) {
        switch (targetPlatform) {
            case "win32-x64" /* TargetPlatform.WIN32_X64 */: return 'Windows 64 bit';
            case "win32-ia32" /* TargetPlatform.WIN32_IA32 */: return 'Windows 32 bit';
            case "win32-arm64" /* TargetPlatform.WIN32_ARM64 */: return 'Windows ARM';
            case "linux-x64" /* TargetPlatform.LINUX_X64 */: return 'Linux 64 bit';
            case "linux-arm64" /* TargetPlatform.LINUX_ARM64 */: return 'Linux ARM 64';
            case "linux-armhf" /* TargetPlatform.LINUX_ARMHF */: return 'Linux ARM';
            case "alpine-x64" /* TargetPlatform.ALPINE_X64 */: return 'Alpine Linux 64 bit';
            case "alpine-arm64" /* TargetPlatform.ALPINE_ARM64 */: return 'Alpine ARM 64';
            case "darwin-x64" /* TargetPlatform.DARWIN_X64 */: return 'Mac';
            case "darwin-arm64" /* TargetPlatform.DARWIN_ARM64 */: return 'Mac Silicon';
            case "web" /* TargetPlatform.WEB */: return 'Web';
            case "universal" /* TargetPlatform.UNIVERSAL */: return "universal" /* TargetPlatform.UNIVERSAL */;
            case "unknown" /* TargetPlatform.UNKNOWN */: return "unknown" /* TargetPlatform.UNKNOWN */;
            case "undefined" /* TargetPlatform.UNDEFINED */: return "undefined" /* TargetPlatform.UNDEFINED */;
        }
    }
    exports.$Sn = $Sn;
    function $Tn(targetPlatform) {
        switch (targetPlatform) {
            case "win32-x64" /* TargetPlatform.WIN32_X64 */: return "win32-x64" /* TargetPlatform.WIN32_X64 */;
            case "win32-ia32" /* TargetPlatform.WIN32_IA32 */: return "win32-ia32" /* TargetPlatform.WIN32_IA32 */;
            case "win32-arm64" /* TargetPlatform.WIN32_ARM64 */: return "win32-arm64" /* TargetPlatform.WIN32_ARM64 */;
            case "linux-x64" /* TargetPlatform.LINUX_X64 */: return "linux-x64" /* TargetPlatform.LINUX_X64 */;
            case "linux-arm64" /* TargetPlatform.LINUX_ARM64 */: return "linux-arm64" /* TargetPlatform.LINUX_ARM64 */;
            case "linux-armhf" /* TargetPlatform.LINUX_ARMHF */: return "linux-armhf" /* TargetPlatform.LINUX_ARMHF */;
            case "alpine-x64" /* TargetPlatform.ALPINE_X64 */: return "alpine-x64" /* TargetPlatform.ALPINE_X64 */;
            case "alpine-arm64" /* TargetPlatform.ALPINE_ARM64 */: return "alpine-arm64" /* TargetPlatform.ALPINE_ARM64 */;
            case "darwin-x64" /* TargetPlatform.DARWIN_X64 */: return "darwin-x64" /* TargetPlatform.DARWIN_X64 */;
            case "darwin-arm64" /* TargetPlatform.DARWIN_ARM64 */: return "darwin-arm64" /* TargetPlatform.DARWIN_ARM64 */;
            case "web" /* TargetPlatform.WEB */: return "web" /* TargetPlatform.WEB */;
            case "universal" /* TargetPlatform.UNIVERSAL */: return "universal" /* TargetPlatform.UNIVERSAL */;
            default: return "unknown" /* TargetPlatform.UNKNOWN */;
        }
    }
    exports.$Tn = $Tn;
    function $Un(platform, arch) {
        switch (platform) {
            case 3 /* Platform.Windows */:
                if (arch === 'x64') {
                    return "win32-x64" /* TargetPlatform.WIN32_X64 */;
                }
                if (arch === 'ia32') {
                    return "win32-ia32" /* TargetPlatform.WIN32_IA32 */;
                }
                if (arch === 'arm64') {
                    return "win32-arm64" /* TargetPlatform.WIN32_ARM64 */;
                }
                return "unknown" /* TargetPlatform.UNKNOWN */;
            case 2 /* Platform.Linux */:
                if (arch === 'x64') {
                    return "linux-x64" /* TargetPlatform.LINUX_X64 */;
                }
                if (arch === 'arm64') {
                    return "linux-arm64" /* TargetPlatform.LINUX_ARM64 */;
                }
                if (arch === 'arm') {
                    return "linux-armhf" /* TargetPlatform.LINUX_ARMHF */;
                }
                return "unknown" /* TargetPlatform.UNKNOWN */;
            case 'alpine':
                if (arch === 'x64') {
                    return "alpine-x64" /* TargetPlatform.ALPINE_X64 */;
                }
                if (arch === 'arm64') {
                    return "alpine-arm64" /* TargetPlatform.ALPINE_ARM64 */;
                }
                return "unknown" /* TargetPlatform.UNKNOWN */;
            case 1 /* Platform.Mac */:
                if (arch === 'x64') {
                    return "darwin-x64" /* TargetPlatform.DARWIN_X64 */;
                }
                if (arch === 'arm64') {
                    return "darwin-arm64" /* TargetPlatform.DARWIN_ARM64 */;
                }
                return "unknown" /* TargetPlatform.UNKNOWN */;
            case 0 /* Platform.Web */: return "web" /* TargetPlatform.WEB */;
        }
    }
    exports.$Un = $Un;
    function $Vn(allTargetPlatforms, productTargetPlatform) {
        // Not a web extension in web target platform
        return productTargetPlatform === "web" /* TargetPlatform.WEB */ && !allTargetPlatforms.includes("web" /* TargetPlatform.WEB */);
    }
    exports.$Vn = $Vn;
    function $Wn(extensionTargetPlatform, allTargetPlatforms, productTargetPlatform) {
        // Not compatible when extension is not a web extension in web target platform
        if ($Vn(allTargetPlatforms, productTargetPlatform)) {
            return false;
        }
        // Compatible when extension target platform is not defined
        if (extensionTargetPlatform === "undefined" /* TargetPlatform.UNDEFINED */) {
            return true;
        }
        // Compatible when extension target platform is universal
        if (extensionTargetPlatform === "universal" /* TargetPlatform.UNIVERSAL */) {
            return true;
        }
        // Not compatible when extension target platform is unknown
        if (extensionTargetPlatform === "unknown" /* TargetPlatform.UNKNOWN */) {
            return false;
        }
        // Compatible when extension and product target platforms matches
        if (extensionTargetPlatform === productTargetPlatform) {
            return true;
        }
        // Fallback
        const fallbackTargetPlatforms = $Xn(productTargetPlatform);
        return fallbackTargetPlatforms.includes(extensionTargetPlatform);
    }
    exports.$Wn = $Wn;
    function $Xn(targetPlatform) {
        switch (targetPlatform) {
            case "win32-x64" /* TargetPlatform.WIN32_X64 */: return ["win32-ia32" /* TargetPlatform.WIN32_IA32 */];
            case "win32-arm64" /* TargetPlatform.WIN32_ARM64 */: return ["win32-ia32" /* TargetPlatform.WIN32_IA32 */];
        }
        return [];
    }
    exports.$Xn = $Xn;
    function $Yn(thing) {
        return thing
            && typeof thing === 'object'
            && typeof thing.id === 'string'
            && (!thing.uuid || typeof thing.uuid === 'string');
    }
    exports.$Yn = $Yn;
    var SortBy;
    (function (SortBy) {
        SortBy[SortBy["NoneOrRelevance"] = 0] = "NoneOrRelevance";
        SortBy[SortBy["LastUpdatedDate"] = 1] = "LastUpdatedDate";
        SortBy[SortBy["Title"] = 2] = "Title";
        SortBy[SortBy["PublisherName"] = 3] = "PublisherName";
        SortBy[SortBy["InstallCount"] = 4] = "InstallCount";
        SortBy[SortBy["PublishedDate"] = 10] = "PublishedDate";
        SortBy[SortBy["AverageRating"] = 6] = "AverageRating";
        SortBy[SortBy["WeightedRating"] = 12] = "WeightedRating";
    })(SortBy || (exports.SortBy = SortBy = {}));
    var SortOrder;
    (function (SortOrder) {
        SortOrder[SortOrder["Default"] = 0] = "Default";
        SortOrder[SortOrder["Ascending"] = 1] = "Ascending";
        SortOrder[SortOrder["Descending"] = 2] = "Descending";
    })(SortOrder || (exports.SortOrder = SortOrder = {}));
    var StatisticType;
    (function (StatisticType) {
        StatisticType["Install"] = "install";
        StatisticType["Uninstall"] = "uninstall";
    })(StatisticType || (exports.StatisticType = StatisticType = {}));
    var InstallOperation;
    (function (InstallOperation) {
        InstallOperation[InstallOperation["None"] = 1] = "None";
        InstallOperation[InstallOperation["Install"] = 2] = "Install";
        InstallOperation[InstallOperation["Update"] = 3] = "Update";
        InstallOperation[InstallOperation["Migrate"] = 4] = "Migrate";
    })(InstallOperation || (exports.InstallOperation = InstallOperation = {}));
    exports.$Zn = (0, instantiation_1.$Bh)('extensionGalleryService');
    var ExtensionManagementErrorCode;
    (function (ExtensionManagementErrorCode) {
        ExtensionManagementErrorCode["Unsupported"] = "Unsupported";
        ExtensionManagementErrorCode["Deprecated"] = "Deprecated";
        ExtensionManagementErrorCode["Malicious"] = "Malicious";
        ExtensionManagementErrorCode["Incompatible"] = "Incompatible";
        ExtensionManagementErrorCode["IncompatibleTargetPlatform"] = "IncompatibleTargetPlatform";
        ExtensionManagementErrorCode["ReleaseVersionNotFound"] = "ReleaseVersionNotFound";
        ExtensionManagementErrorCode["Invalid"] = "Invalid";
        ExtensionManagementErrorCode["Download"] = "Download";
        ExtensionManagementErrorCode["Extract"] = "Extract";
        ExtensionManagementErrorCode["Delete"] = "Delete";
        ExtensionManagementErrorCode["Rename"] = "Rename";
        ExtensionManagementErrorCode["CorruptZip"] = "CorruptZip";
        ExtensionManagementErrorCode["IncompleteZip"] = "IncompleteZip";
        ExtensionManagementErrorCode["Signature"] = "Signature";
        ExtensionManagementErrorCode["Internal"] = "Internal";
    })(ExtensionManagementErrorCode || (exports.ExtensionManagementErrorCode = ExtensionManagementErrorCode = {}));
    var ExtensionSignaturetErrorCode;
    (function (ExtensionSignaturetErrorCode) {
        ExtensionSignaturetErrorCode["UnknownError"] = "UnknownError";
        ExtensionSignaturetErrorCode["PackageIsInvalidZip"] = "PackageIsInvalidZip";
        ExtensionSignaturetErrorCode["SignatureArchiveIsInvalidZip"] = "SignatureArchiveIsInvalidZip";
    })(ExtensionSignaturetErrorCode || (exports.ExtensionSignaturetErrorCode = ExtensionSignaturetErrorCode = {}));
    class $1n extends Error {
        constructor(message, code) {
            super(message);
            this.code = code;
            this.name = code;
        }
    }
    exports.$1n = $1n;
    exports.$2n = (0, instantiation_1.$Bh)('extensionManagementService');
    exports.$3n = 'extensionsIdentifiers/disabled';
    exports.$4n = 'extensionsIdentifiers/enabled';
    exports.$5n = (0, instantiation_1.$Bh)('IGlobalExtensionEnablementService');
    exports.$6n = (0, instantiation_1.$Bh)('IExtensionTipsService');
    exports.$7n = (0, nls_1.localize)(0, null);
    exports.$8n = { value: exports.$7n, original: 'Extensions' };
    exports.$9n = { value: (0, nls_1.localize)(1, null), original: 'Preferences' };
});
//# sourceMappingURL=extensionManagement.js.map