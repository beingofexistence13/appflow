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
define(["require", "exports", "vs/platform/quickinput/browser/pickerQuickAccess", "vs/nls!vs/workbench/contrib/extensions/browser/extensionsQuickAccess", "vs/workbench/contrib/extensions/common/extensions", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/notification/common/notification", "vs/platform/log/common/log", "vs/workbench/services/panecomposite/browser/panecomposite"], function (require, exports, pickerQuickAccess_1, nls_1, extensions_1, extensionManagement_1, notification_1, log_1, panecomposite_1) {
    "use strict";
    var $NUb_1, $OUb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$OUb = exports.$NUb = void 0;
    let $NUb = class $NUb extends pickerQuickAccess_1.$sqb {
        static { $NUb_1 = this; }
        static { this.PREFIX = 'ext install '; }
        constructor(a, b, h, j, m) {
            super($NUb_1.PREFIX);
            this.a = a;
            this.b = b;
            this.h = h;
            this.j = j;
            this.m = m;
        }
        g(filter, disposables, token) {
            // Nothing typed
            if (!filter) {
                return [{
                        label: (0, nls_1.localize)(0, null)
                    }];
            }
            const genericSearchPickItem = {
                label: (0, nls_1.localize)(1, null, filter),
                accept: () => this.t(filter)
            };
            // Extension ID typed: try to find it
            if (/\./.test(filter)) {
                return this.r(filter, genericSearchPickItem, token);
            }
            // Extension name typed: offer to search it
            return [genericSearchPickItem];
        }
        async r(filter, fallback, token) {
            try {
                const [galleryExtension] = await this.b.getExtensions([{ id: filter }], token);
                if (token.isCancellationRequested) {
                    return []; // return early if canceled
                }
                if (!galleryExtension) {
                    return [fallback];
                }
                return [{
                        label: (0, nls_1.localize)(2, null, filter),
                        accept: () => this.s(galleryExtension, filter)
                    }];
            }
            catch (error) {
                if (token.isCancellationRequested) {
                    return []; // expected error
                }
                this.m.error(error);
                return [fallback];
            }
        }
        async s(extension, name) {
            try {
                await openExtensionsViewlet(this.a, `@id:${name}`);
                await this.h.installFromGallery(extension);
            }
            catch (error) {
                this.j.error(error);
            }
        }
        async t(name) {
            openExtensionsViewlet(this.a, name);
        }
    };
    exports.$NUb = $NUb;
    exports.$NUb = $NUb = $NUb_1 = __decorate([
        __param(0, panecomposite_1.$Yeb),
        __param(1, extensionManagement_1.$Zn),
        __param(2, extensionManagement_1.$2n),
        __param(3, notification_1.$Yu),
        __param(4, log_1.$5i)
    ], $NUb);
    let $OUb = class $OUb extends pickerQuickAccess_1.$sqb {
        static { $OUb_1 = this; }
        static { this.PREFIX = 'ext '; }
        constructor(a) {
            super($OUb_1.PREFIX);
            this.a = a;
        }
        g() {
            return [{
                    label: (0, nls_1.localize)(3, null),
                    accept: () => openExtensionsViewlet(this.a)
                }];
        }
    };
    exports.$OUb = $OUb;
    exports.$OUb = $OUb = $OUb_1 = __decorate([
        __param(0, panecomposite_1.$Yeb)
    ], $OUb);
    async function openExtensionsViewlet(paneCompositeService, search = '') {
        const viewlet = await paneCompositeService.openPaneComposite(extensions_1.$Ofb, 0 /* ViewContainerLocation.Sidebar */, true);
        const view = viewlet?.getViewPaneContainer();
        view?.search(search);
        view?.focus();
    }
});
//# sourceMappingURL=extensionsQuickAccess.js.map