/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/platform/instantiation/common/instantiation", "vs/platform/remote/common/remoteHosts"], function (require, exports, strings, instantiation_1, remoteHosts_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IBuiltinExtensionsScannerService = exports.isResolverExtension = exports.isAuthenticationProviderExtension = exports.isLanguagePackExtension = exports.isApplicationScopedExtension = exports.ExtensionIdentifierMap = exports.ExtensionIdentifierSet = exports.ExtensionIdentifier = exports.TargetPlatform = exports.ExtensionType = exports.EXTENSION_CATEGORIES = exports.getWorkspaceSupportTypeMessage = exports.ALL_EXTENSION_KINDS = exports.UNDEFINED_PUBLISHER = exports.BUILTIN_MANIFEST_CACHE_FILE = exports.USER_MANIFEST_CACHE_FILE = void 0;
    exports.USER_MANIFEST_CACHE_FILE = 'extensions.user.cache';
    exports.BUILTIN_MANIFEST_CACHE_FILE = 'extensions.builtin.cache';
    exports.UNDEFINED_PUBLISHER = 'undefined_publisher';
    exports.ALL_EXTENSION_KINDS = ['ui', 'workspace', 'web'];
    function getWorkspaceSupportTypeMessage(supportType) {
        if (typeof supportType === 'object' && supportType !== null) {
            if (supportType.supported !== true) {
                return supportType.description;
            }
        }
        return undefined;
    }
    exports.getWorkspaceSupportTypeMessage = getWorkspaceSupportTypeMessage;
    exports.EXTENSION_CATEGORIES = [
        'Azure',
        'Data Science',
        'Debuggers',
        'Extension Packs',
        'Education',
        'Formatters',
        'Keymaps',
        'Language Packs',
        'Linters',
        'Machine Learning',
        'Notebooks',
        'Programming Languages',
        'SCM Providers',
        'Snippets',
        'Testing',
        'Themes',
        'Visualization',
        'Other',
    ];
    var ExtensionType;
    (function (ExtensionType) {
        ExtensionType[ExtensionType["System"] = 0] = "System";
        ExtensionType[ExtensionType["User"] = 1] = "User";
    })(ExtensionType || (exports.ExtensionType = ExtensionType = {}));
    var TargetPlatform;
    (function (TargetPlatform) {
        TargetPlatform["WIN32_X64"] = "win32-x64";
        TargetPlatform["WIN32_IA32"] = "win32-ia32";
        TargetPlatform["WIN32_ARM64"] = "win32-arm64";
        TargetPlatform["LINUX_X64"] = "linux-x64";
        TargetPlatform["LINUX_ARM64"] = "linux-arm64";
        TargetPlatform["LINUX_ARMHF"] = "linux-armhf";
        TargetPlatform["ALPINE_X64"] = "alpine-x64";
        TargetPlatform["ALPINE_ARM64"] = "alpine-arm64";
        TargetPlatform["DARWIN_X64"] = "darwin-x64";
        TargetPlatform["DARWIN_ARM64"] = "darwin-arm64";
        TargetPlatform["WEB"] = "web";
        TargetPlatform["UNIVERSAL"] = "universal";
        TargetPlatform["UNKNOWN"] = "unknown";
        TargetPlatform["UNDEFINED"] = "undefined";
    })(TargetPlatform || (exports.TargetPlatform = TargetPlatform = {}));
    /**
     * **!Do not construct directly!**
     *
     * **!Only static methods because it gets serialized!**
     *
     * This represents the "canonical" version for an extension identifier. Extension ids
     * have to be case-insensitive (due to the marketplace), but we must ensure case
     * preservation because the extension API is already public at this time.
     *
     * For example, given an extension with the publisher `"Hello"` and the name `"World"`,
     * its canonical extension identifier is `"Hello.World"`. This extension could be
     * referenced in some other extension's dependencies using the string `"hello.world"`.
     *
     * To make matters more complicated, an extension can optionally have an UUID. When two
     * extensions have the same UUID, they are considered equal even if their identifier is different.
     */
    class ExtensionIdentifier {
        constructor(value) {
            this.value = value;
            this._lower = value.toLowerCase();
        }
        static equals(a, b) {
            if (typeof a === 'undefined' || a === null) {
                return (typeof b === 'undefined' || b === null);
            }
            if (typeof b === 'undefined' || b === null) {
                return false;
            }
            if (typeof a === 'string' || typeof b === 'string') {
                // At least one of the arguments is an extension id in string form,
                // so we have to use the string comparison which ignores case.
                const aValue = (typeof a === 'string' ? a : a.value);
                const bValue = (typeof b === 'string' ? b : b.value);
                return strings.equalsIgnoreCase(aValue, bValue);
            }
            // Now we know both arguments are ExtensionIdentifier
            return (a._lower === b._lower);
        }
        /**
         * Gives the value by which to index (for equality).
         */
        static toKey(id) {
            if (typeof id === 'string') {
                return id.toLowerCase();
            }
            return id._lower;
        }
    }
    exports.ExtensionIdentifier = ExtensionIdentifier;
    class ExtensionIdentifierSet {
        get size() {
            return this._set.size;
        }
        constructor(iterable) {
            this._set = new Set();
            if (iterable) {
                for (const value of iterable) {
                    this.add(value);
                }
            }
        }
        add(id) {
            this._set.add(ExtensionIdentifier.toKey(id));
        }
        delete(extensionId) {
            return this._set.delete(ExtensionIdentifier.toKey(extensionId));
        }
        has(id) {
            return this._set.has(ExtensionIdentifier.toKey(id));
        }
    }
    exports.ExtensionIdentifierSet = ExtensionIdentifierSet;
    class ExtensionIdentifierMap {
        constructor() {
            this._map = new Map();
        }
        clear() {
            this._map.clear();
        }
        delete(id) {
            this._map.delete(ExtensionIdentifier.toKey(id));
        }
        get(id) {
            return this._map.get(ExtensionIdentifier.toKey(id));
        }
        has(id) {
            return this._map.has(ExtensionIdentifier.toKey(id));
        }
        set(id, value) {
            this._map.set(ExtensionIdentifier.toKey(id), value);
        }
        values() {
            return this._map.values();
        }
        forEach(callbackfn) {
            this._map.forEach(callbackfn);
        }
        [Symbol.iterator]() {
            return this._map[Symbol.iterator]();
        }
    }
    exports.ExtensionIdentifierMap = ExtensionIdentifierMap;
    function isApplicationScopedExtension(manifest) {
        return isLanguagePackExtension(manifest);
    }
    exports.isApplicationScopedExtension = isApplicationScopedExtension;
    function isLanguagePackExtension(manifest) {
        return manifest.contributes && manifest.contributes.localizations ? manifest.contributes.localizations.length > 0 : false;
    }
    exports.isLanguagePackExtension = isLanguagePackExtension;
    function isAuthenticationProviderExtension(manifest) {
        return manifest.contributes && manifest.contributes.authentication ? manifest.contributes.authentication.length > 0 : false;
    }
    exports.isAuthenticationProviderExtension = isAuthenticationProviderExtension;
    function isResolverExtension(manifest, remoteAuthority) {
        if (remoteAuthority) {
            const activationEvent = `onResolveRemoteAuthority:${(0, remoteHosts_1.getRemoteName)(remoteAuthority)}`;
            return !!manifest.activationEvents?.includes(activationEvent);
        }
        return false;
    }
    exports.isResolverExtension = isResolverExtension;
    exports.IBuiltinExtensionsScannerService = (0, instantiation_1.createDecorator)('IBuiltinExtensionsScannerService');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2V4dGVuc2lvbnMvY29tbW9uL2V4dGVuc2lvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBVW5GLFFBQUEsd0JBQXdCLEdBQUcsdUJBQXVCLENBQUM7SUFDbkQsUUFBQSwyQkFBMkIsR0FBRywwQkFBMEIsQ0FBQztJQUN6RCxRQUFBLG1CQUFtQixHQUFHLHFCQUFxQixDQUFDO0lBa001QyxRQUFBLG1CQUFtQixHQUE2QixDQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFTeEYsU0FBZ0IsOEJBQThCLENBQUMsV0FBOEY7UUFDNUksSUFBSSxPQUFPLFdBQVcsS0FBSyxRQUFRLElBQUksV0FBVyxLQUFLLElBQUksRUFBRTtZQUM1RCxJQUFJLFdBQVcsQ0FBQyxTQUFTLEtBQUssSUFBSSxFQUFFO2dCQUNuQyxPQUFPLFdBQVcsQ0FBQyxXQUFXLENBQUM7YUFDL0I7U0FDRDtRQUNELE9BQU8sU0FBUyxDQUFDO0lBQ2xCLENBQUM7SUFQRCx3RUFPQztJQVFZLFFBQUEsb0JBQW9CLEdBQUc7UUFDbkMsT0FBTztRQUNQLGNBQWM7UUFDZCxXQUFXO1FBQ1gsaUJBQWlCO1FBQ2pCLFdBQVc7UUFDWCxZQUFZO1FBQ1osU0FBUztRQUNULGdCQUFnQjtRQUNoQixTQUFTO1FBQ1Qsa0JBQWtCO1FBQ2xCLFdBQVc7UUFDWCx1QkFBdUI7UUFDdkIsZUFBZTtRQUNmLFVBQVU7UUFDVixTQUFTO1FBQ1QsUUFBUTtRQUNSLGVBQWU7UUFDZixPQUFPO0tBQ1AsQ0FBQztJQWlDRixJQUFrQixhQUdqQjtJQUhELFdBQWtCLGFBQWE7UUFDOUIscURBQU0sQ0FBQTtRQUNOLGlEQUFJLENBQUE7SUFDTCxDQUFDLEVBSGlCLGFBQWEsNkJBQWIsYUFBYSxRQUc5QjtJQUVELElB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