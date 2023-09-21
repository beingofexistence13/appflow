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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/resources", "vs/base/common/uuid", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/workbench/common/memento"], function (require, exports, arrays_1, resources_1, uuid_1, contextkey_1, instantiation_1, storage_1, memento_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Obb = exports.$Nbb = exports.$Mbb = exports.WebviewContentPurpose = exports.$Lbb = exports.$Kbb = exports.$Jbb = exports.$Ibb = void 0;
    /**
     * Set when the find widget in a webview in a webview is visible.
     */
    exports.$Ibb = new contextkey_1.$2i('webviewFindWidgetVisible', false);
    /**
     * Set when the find widget in a webview is focused.
     */
    exports.$Jbb = new contextkey_1.$2i('webviewFindWidgetFocused', false);
    /**
     * Set when the find widget in a webview is enabled in a webview
     */
    exports.$Kbb = new contextkey_1.$2i('webviewFindWidgetEnabled', false);
    exports.$Lbb = (0, instantiation_1.$Bh)('webviewService');
    var WebviewContentPurpose;
    (function (WebviewContentPurpose) {
        WebviewContentPurpose["NotebookRenderer"] = "notebookRenderer";
        WebviewContentPurpose["CustomEditor"] = "customEditor";
        WebviewContentPurpose["WebviewView"] = "webviewView";
    })(WebviewContentPurpose || (exports.WebviewContentPurpose = WebviewContentPurpose = {}));
    /**
     * Check if two {@link WebviewContentOptions} are equal.
     */
    function $Mbb(a, b) {
        return (a.allowMultipleAPIAcquire === b.allowMultipleAPIAcquire
            && a.allowScripts === b.allowScripts
            && a.allowForms === b.allowForms
            && (0, arrays_1.$sb)(a.localResourceRoots, b.localResourceRoots, resources_1.$bg)
            && (0, arrays_1.$sb)(a.portMapping, b.portMapping, (a, b) => a.extensionHostPort === b.extensionHostPort && a.webviewPort === b.webviewPort)
            && areEnableCommandUrisEqual(a, b));
    }
    exports.$Mbb = $Mbb;
    function areEnableCommandUrisEqual(a, b) {
        if (a.enableCommandUris === b.enableCommandUris) {
            return true;
        }
        if (Array.isArray(a.enableCommandUris) && Array.isArray(b.enableCommandUris)) {
            return (0, arrays_1.$sb)(a.enableCommandUris, b.enableCommandUris);
        }
        return false;
    }
    /**
     * Stores the unique origins for a webview.
     *
     * These are randomly generated
     */
    let $Nbb = class $Nbb {
        constructor(rootStorageKey, storageService) {
            this.c = new memento_1.$YT(rootStorageKey, storageService);
            this.d = this.c.getMemento(-1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        }
        getOrigin(viewType, additionalKey) {
            const key = this.e(viewType, additionalKey);
            const existing = this.d[key];
            if (existing && typeof existing === 'string') {
                return existing;
            }
            const newOrigin = (0, uuid_1.$4f)();
            this.d[key] = newOrigin;
            this.c.saveMemento();
            return newOrigin;
        }
        e(viewType, additionalKey) {
            return JSON.stringify({ viewType, key: additionalKey });
        }
    };
    exports.$Nbb = $Nbb;
    exports.$Nbb = $Nbb = __decorate([
        __param(1, storage_1.$Vo)
    ], $Nbb);
    /**
     * Stores the unique origins for a webview.
     *
     * These are randomly generated, but keyed on extension and webview viewType.
     */
    let $Obb = class $Obb {
        constructor(rootStorageKey, storageService) {
            this.c = new $Nbb(rootStorageKey, storageService);
        }
        getOrigin(viewType, extId) {
            return this.c.getOrigin(viewType, extId.value);
        }
    };
    exports.$Obb = $Obb;
    exports.$Obb = $Obb = __decorate([
        __param(1, storage_1.$Vo)
    ], $Obb);
});
//# sourceMappingURL=webview.js.map