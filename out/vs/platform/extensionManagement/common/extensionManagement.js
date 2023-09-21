/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/instantiation/common/instantiation"], function (require, exports, nls_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PreferencesLocalizedLabel = exports.ExtensionsLocalizedLabel = exports.ExtensionsLabel = exports.IExtensionTipsService = exports.IGlobalExtensionEnablementService = exports.ENABLED_EXTENSIONS_STORAGE_PATH = exports.DISABLED_EXTENSIONS_STORAGE_PATH = exports.IExtensionManagementService = exports.ExtensionManagementError = exports.ExtensionSignaturetErrorCode = exports.ExtensionManagementErrorCode = exports.IExtensionGalleryService = exports.InstallOperation = exports.StatisticType = exports.SortOrder = exports.SortBy = exports.isIExtensionIdentifier = exports.getFallbackTargetPlarforms = exports.isTargetPlatformCompatible = exports.isNotWebExtensionInWebTargetPlatform = exports.getTargetPlatform = exports.toTargetPlatform = exports.TargetPlatformToString = exports.EXTENSION_INSTALL_DEP_PACK_CONTEXT = exports.EXTENSION_INSTALL_SYNC_CONTEXT = exports.EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT = exports.WEB_EXTENSION_TAG = exports.EXTENSION_IDENTIFIER_REGEX = exports.EXTENSION_IDENTIFIER_PATTERN = void 0;
    exports.EXTENSION_IDENTIFIER_PATTERN = '^([a-z0-9A-Z][a-z0-9-A-Z]*)\\.([a-z0-9A-Z][a-z0-9-A-Z]*)$';
    exports.EXTENSION_IDENTIFIER_REGEX = new RegExp(exports.EXTENSION_IDENTIFIER_PATTERN);
    exports.WEB_EXTENSION_TAG = '__web_extension';
    exports.EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT = 'skipWalkthrough';
    exports.EXTENSION_INSTALL_SYNC_CONTEXT = 'extensionsSync';
    exports.EXTENSION_INSTALL_DEP_PACK_CONTEXT = 'dependecyOrPackExtensionInstall';
    function TargetPlatformToString(targetPlatform) {
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
    exports.TargetPlatformToString = TargetPlatformToString;
    function toTargetPlatform(targetPlatform) {
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
    exports.toTargetPlatform = toTargetPlatform;
    function getTargetPlatform(platform, arch) {
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
    exports.getTargetPlatform = getTargetPlatform;
    function isNotWebExtensionInWebTargetPlatform(allTargetPlatforms, productTargetPlatform) {
        // Not a web extension in web target platform
        return productTargetPlatform === "web" /* TargetPlatform.WEB */ && !allTargetPlatforms.includes("web" /* TargetPlatform.WEB */);
    }
    exports.isNotWebExtensionInWebTargetPlatform = isNotWebExtensionInWebTargetPlatform;
    function isTargetPlatformCompatible(extensionTargetPlatform, allTargetPlatforms, productTargetPlatform) {
        // Not compatible when extension is not a web extension in web target platform
        if (isNotWebExtensionInWebTargetPlatform(allTargetPlatforms, productTargetPlatform)) {
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
        const fallbackTargetPlatforms = getFallbackTargetPlarforms(productTargetPlatform);
        return fallbackTargetPlatforms.includes(extensionTargetPlatform);
    }
    exports.isTargetPlatformCompatible = isTargetPlatformCompatible;
    function getFallbackTargetPlarforms(targetPlatform) {
        switch (targetPlatform) {
            case "win32-x64" /* TargetPlatform.WIN32_X64 */: return ["win32-ia32" /* TargetPlatform.WIN32_IA32 */];
            case "win32-arm64" /* TargetPlatform.WIN32_ARM64 */: return ["win32-ia32" /* TargetPlatform.WIN32_IA32 */];
        }
        return [];
    }
    exports.getFallbackTargetPlarforms = getFallbackTargetPlarforms;
    function isIExtensionIdentifier(thing) {
        return thing
            && typeof thing === 'object'
            && typeof thing.id === 'string'
            && (!thing.uuid || typeof thing.uuid === 'string');
    }
    exports.isIExtensionIdentifier = isIExtensionIdentifier;
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
    exports.IExtensionGalleryService = (0, instantiation_1.createDecorator)('extensionGalleryService');
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
    class ExtensionManagementError extends Error {
        constructor(message, code) {
            super(message);
            this.code = code;
            this.name = code;
        }
    }
    exports.ExtensionManagementError = ExtensionManagementError;
    exports.IExtensionManagementService = (0, instantiation_1.createDecorator)('extensionManagementService');
    exports.DISABLED_EXTENSIONS_STORAGE_PATH = 'extensionsIdentifiers/disabled';
    exports.ENABLED_EXTENSIONS_STORAGE_PATH = 'extensionsIdentifiers/enabled';
    exports.IGlobalExtensionEnablementService = (0, instantiation_1.createDecorator)('IGlobalExtensionEnablementService');
    exports.IExtensionTipsService = (0, instantiation_1.createDecorator)('IExtensionTipsService');
    exports.ExtensionsLabel = (0, nls_1.localize)('extensions', "Extensions");
    exports.ExtensionsLocalizedLabel = { value: exports.ExtensionsLabel, original: 'Extensions' };
    exports.PreferencesLocalizedLabel = { value: (0, nls_1.localize)('preferences', "Preferences"), original: 'Preferences' };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uTWFuYWdlbWVudC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2V4dGVuc2lvbk1hbmFnZW1lbnQvY29tbW9uL2V4dGVuc2lvbk1hbmFnZW1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBWW5GLFFBQUEsNEJBQTRCLEdBQUcsMkRBQTJELENBQUM7SUFDM0YsUUFBQSwwQkFBMEIsR0FBRyxJQUFJLE1BQU0sQ0FBQyxvQ0FBNEIsQ0FBQyxDQUFDO0lBQ3RFLFFBQUEsaUJBQWlCLEdBQUcsaUJBQWlCLENBQUM7SUFDdEMsUUFBQSwwQ0FBMEMsR0FBRyxpQkFBaUIsQ0FBQztJQUMvRCxRQUFBLDhCQUE4QixHQUFHLGdCQUFnQixDQUFDO0lBQ2xELFFBQUEsa0NBQWtDLEdBQUcsaUNBQWlDLENBQUM7SUFFcEYsU0FBZ0Isc0JBQXNCLENBQUMsY0FBOEI7UUFDcEUsUUFBUSxjQUFjLEVBQUU7WUFDdkIsK0NBQTZCLENBQUMsQ0FBQyxPQUFPLGdCQUFnQixDQUFDO1lBQ3ZELGlEQUE4QixDQUFDLENBQUMsT0FBTyxnQkFBZ0IsQ0FBQztZQUN4RCxtREFBK0IsQ0FBQyxDQUFDLE9BQU8sYUFBYSxDQUFDO1lBRXRELCtDQUE2QixDQUFDLENBQUMsT0FBTyxjQUFjLENBQUM7WUFDckQsbURBQStCLENBQUMsQ0FBQyxPQUFPLGNBQWMsQ0FBQztZQUN2RCxtREFBK0IsQ0FBQyxDQUFDLE9BQU8sV0FBVyxDQUFDO1lBRXBELGlEQUE4QixDQUFDLENBQUMsT0FBTyxxQkFBcUIsQ0FBQztZQUM3RCxxREFBZ0MsQ0FBQyxDQUFDLE9BQU8sZUFBZSxDQUFDO1lBRXpELGlEQUE4QixDQUFDLENBQUMsT0FBTyxLQUFLLENBQUM7WUFDN0MscURBQWdDLENBQUMsQ0FBQyxPQUFPLGFBQWEsQ0FBQztZQUV2RCxtQ0FBdUIsQ0FBQyxDQUFDLE9B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