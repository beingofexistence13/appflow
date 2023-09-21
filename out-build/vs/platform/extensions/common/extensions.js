/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/platform/instantiation/common/instantiation", "vs/platform/remote/common/remoteHosts"], function (require, exports, strings, instantiation_1, remoteHosts_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$3l = exports.$2l = exports.$1l = exports.$Zl = exports.$Yl = exports.$Xl = exports.$Wl = exports.$Vl = exports.TargetPlatform = exports.ExtensionType = exports.$Ul = exports.$Tl = exports.$Sl = exports.$Rl = exports.$Ql = exports.$Pl = void 0;
    exports.$Pl = 'extensions.user.cache';
    exports.$Ql = 'extensions.builtin.cache';
    exports.$Rl = 'undefined_publisher';
    exports.$Sl = ['ui', 'workspace', 'web'];
    function $Tl(supportType) {
        if (typeof supportType === 'object' && supportType !== null) {
            if (supportType.supported !== true) {
                return supportType.description;
            }
        }
        return undefined;
    }
    exports.$Tl = $Tl;
    exports.$Ul = [
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
    class $Vl {
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
                return strings.$Me(aValue, bValue);
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
    exports.$Vl = $Vl;
    class $Wl {
        get size() {
            return this.c.size;
        }
        constructor(iterable) {
            this.c = new Set();
            if (iterable) {
                for (const value of iterable) {
                    this.add(value);
                }
            }
        }
        add(id) {
            this.c.add($Vl.toKey(id));
        }
        delete(extensionId) {
            return this.c.delete($Vl.toKey(extensionId));
        }
        has(id) {
            return this.c.has($Vl.toKey(id));
        }
    }
    exports.$Wl = $Wl;
    class $Xl {
        constructor() {
            this.c = new Map();
        }
        clear() {
            this.c.clear();
        }
        delete(id) {
            this.c.delete($Vl.toKey(id));
        }
        get(id) {
            return this.c.get($Vl.toKey(id));
        }
        has(id) {
            return this.c.has($Vl.toKey(id));
        }
        set(id, value) {
            this.c.set($Vl.toKey(id), value);
        }
        values() {
            return this.c.values();
        }
        forEach(callbackfn) {
            this.c.forEach(callbackfn);
        }
        [Symbol.iterator]() {
            return this.c[Symbol.iterator]();
        }
    }
    exports.$Xl = $Xl;
    function $Yl(manifest) {
        return $Zl(manifest);
    }
    exports.$Yl = $Yl;
    function $Zl(manifest) {
        return manifest.contributes && manifest.contributes.localizations ? manifest.contributes.localizations.length > 0 : false;
    }
    exports.$Zl = $Zl;
    function $1l(manifest) {
        return manifest.contributes && manifest.contributes.authentication ? manifest.contributes.authentication.length > 0 : false;
    }
    exports.$1l = $1l;
    function $2l(manifest, remoteAuthority) {
        if (remoteAuthority) {
            const activationEvent = `onResolveRemoteAuthority:${(0, remoteHosts_1.$Pk)(remoteAuthority)}`;
            return !!manifest.activationEvents?.includes(activationEvent);
        }
        return false;
    }
    exports.$2l = $2l;
    exports.$3l = (0, instantiation_1.$Bh)('IBuiltinExtensionsScannerService');
});
//# sourceMappingURL=extensions.js.map