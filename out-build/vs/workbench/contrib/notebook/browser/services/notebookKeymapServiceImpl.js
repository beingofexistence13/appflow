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
define(["require", "exports", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/nls!vs/workbench/contrib/notebook/browser/services/notebookKeymapServiceImpl", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/workbench/contrib/extensions/common/extensionsUtils", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/storage/common/storage", "vs/workbench/common/memento", "vs/base/common/arrays"], function (require, exports, errors_1, event_1, lifecycle_1, nls_1, instantiation_1, notification_1, extensionsUtils_1, extensionManagement_1, lifecycle_2, extensionManagement_2, extensionManagementUtil_1, storage_1, memento_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$nGb = exports.$mGb = void 0;
    function onExtensionChanged(accessor) {
        const extensionService = accessor.get(extensionManagement_2.$2n);
        const extensionEnablementService = accessor.get(extensionManagement_1.$icb);
        const onDidInstallExtensions = event_1.Event.chain(extensionService.onDidInstallExtensions, $ => $.filter(e => e.some(({ operation }) => operation === 2 /* InstallOperation.Install */))
            .map(e => e.map(({ identifier }) => identifier)));
        return event_1.Event.debounce(event_1.Event.any(event_1.Event.any(onDidInstallExtensions, event_1.Event.map(extensionService.onDidUninstallExtension, e => [e.identifier])), event_1.Event.map(extensionEnablementService.onEnablementChanged, extensions => extensions.map(e => e.identifier))), (result, identifiers) => {
            result = result || (identifiers.length ? [identifiers[0]] : []);
            for (const identifier of identifiers) {
                if (result.some(l => !(0, extensionManagementUtil_1.$po)(l, identifier))) {
                    result.push(identifier);
                }
            }
            return result;
        });
    }
    const hasRecommendedKeymapKey = 'hasRecommendedKeymap';
    let $mGb = class $mGb extends lifecycle_1.$kc {
        constructor(c, f, g, storageService, lifecycleService) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.a = new memento_1.$YT('notebookKeymap', storageService);
            this.b = this.a.getMemento(0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            this.B(lifecycleService.onDidShutdown(() => this.dispose()));
            this.B(this.c.invokeFunction(onExtensionChanged)((identifiers => {
                Promise.all(identifiers.map(identifier => this.h(identifier)))
                    .then(undefined, errors_1.$Y);
            })));
        }
        h(extensionIdentifier) {
            return this.c.invokeFunction(extensionsUtils_1.$lGb).then(extensions => {
                const keymaps = extensions.filter(extension => $nGb(extension));
                const extension = keymaps.find(extension => (0, extensionManagementUtil_1.$po)(extension.identifier, extensionIdentifier));
                if (extension && extension.globallyEnabled) {
                    // there is already a keymap extension
                    this.b[hasRecommendedKeymapKey] = true;
                    this.a.saveMemento();
                    const otherKeymaps = keymaps.filter(extension => !(0, extensionManagementUtil_1.$po)(extension.identifier, extensionIdentifier) && extension.globallyEnabled);
                    if (otherKeymaps.length) {
                        return this.j(extension, otherKeymaps);
                    }
                }
                return undefined;
            });
        }
        j(newKeymap, oldKeymaps) {
            const onPrompt = (confirmed) => {
                if (confirmed) {
                    this.f.setEnablement(oldKeymaps.map(keymap => keymap.local), 6 /* EnablementState.DisabledGlobally */);
                }
            };
            this.g.prompt(notification_1.Severity.Info, (0, nls_1.localize)(0, null, (0, arrays_1.$Kb)(oldKeymaps.map(k => k.local.manifest.displayName)).map(name => `'${name}'`).join(', ')), [{
                    label: (0, nls_1.localize)(1, null),
                    run: () => onPrompt(true)
                }, {
                    label: (0, nls_1.localize)(2, null),
                    run: () => onPrompt(false)
                }]);
        }
    };
    exports.$mGb = $mGb;
    exports.$mGb = $mGb = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, extensionManagement_1.$icb),
        __param(2, notification_1.$Yu),
        __param(3, storage_1.$Vo),
        __param(4, lifecycle_2.$7y)
    ], $mGb);
    function $nGb(extension) {
        if (extension.local.manifest.extensionPack) {
            return false;
        }
        const keywords = extension.local.manifest.keywords;
        if (!keywords) {
            return false;
        }
        return keywords.indexOf('notebook-keymap') !== -1;
    }
    exports.$nGb = $nGb;
});
//# sourceMappingURL=notebookKeymapServiceImpl.js.map