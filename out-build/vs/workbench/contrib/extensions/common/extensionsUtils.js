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
define(["require", "exports", "vs/nls!vs/workbench/contrib/extensions/common/extensionsUtils", "vs/base/common/event", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/notification/common/notification"], function (require, exports, nls_1, event_1, errors_1, lifecycle_1, extensionManagement_1, extensionManagement_2, extensionRecommendations_1, lifecycle_2, instantiation_1, extensionManagementUtil_1, notification_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$lGb = exports.$kGb = void 0;
    let $kGb = class $kGb extends lifecycle_1.$kc {
        constructor(a, b, c, lifecycleService, f) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            this.f = f;
            this.B(lifecycleService.onDidShutdown(() => this.dispose()));
            this.B(a.invokeFunction(onExtensionChanged)((identifiers => {
                Promise.all(identifiers.map(identifier => this.g(identifier)))
                    .then(undefined, errors_1.$Y);
            })));
        }
        g(extensionIdentifier) {
            return this.a.invokeFunction($lGb).then(extensions => {
                const keymaps = extensions.filter(extension => isKeymapExtension(this.c, extension));
                const extension = keymaps.find(extension => (0, extensionManagementUtil_1.$po)(extension.identifier, extensionIdentifier));
                if (extension && extension.globallyEnabled) {
                    const otherKeymaps = keymaps.filter(extension => !(0, extensionManagementUtil_1.$po)(extension.identifier, extensionIdentifier) && extension.globallyEnabled);
                    if (otherKeymaps.length) {
                        return this.h(extension, otherKeymaps);
                    }
                }
                return undefined;
            });
        }
        h(newKeymap, oldKeymaps) {
            const onPrompt = (confirmed) => {
                if (confirmed) {
                    this.b.setEnablement(oldKeymaps.map(keymap => keymap.local), 6 /* EnablementState.DisabledGlobally */);
                }
            };
            this.f.prompt(notification_1.Severity.Info, (0, nls_1.localize)(0, null, oldKeymaps.map(k => `'${k.local.manifest.displayName}'`).join(', ')), [{
                    label: (0, nls_1.localize)(1, null),
                    run: () => onPrompt(true)
                }, {
                    label: (0, nls_1.localize)(2, null),
                    run: () => onPrompt(false)
                }]);
        }
    };
    exports.$kGb = $kGb;
    exports.$kGb = $kGb = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, extensionManagement_2.$icb),
        __param(2, extensionRecommendations_1.$9fb),
        __param(3, lifecycle_2.$7y),
        __param(4, notification_1.$Yu)
    ], $kGb);
    function onExtensionChanged(accessor) {
        const extensionService = accessor.get(extensionManagement_1.$2n);
        const extensionEnablementService = accessor.get(extensionManagement_2.$icb);
        const onDidInstallExtensions = event_1.Event.chain(extensionService.onDidInstallExtensions, $ => $.filter(e => e.some(({ operation }) => operation === 2 /* InstallOperation.Install */))
            .map(e => e.map(({ identifier }) => identifier)));
        return event_1.Event.debounce(event_1.Event.any(event_1.Event.any(onDidInstallExtensions, event_1.Event.map(extensionService.onDidUninstallExtension, e => [e.identifier])), event_1.Event.map(extensionEnablementService.onEnablementChanged, extensions => extensions.map(e => e.identifier))), (result, identifiers) => {
            result = result || [];
            for (const identifier of identifiers) {
                if (result.some(l => !(0, extensionManagementUtil_1.$po)(l, identifier))) {
                    result.push(identifier);
                }
            }
            return result;
        });
    }
    async function $lGb(accessor) {
        const extensionService = accessor.get(extensionManagement_1.$2n);
        const extensionEnablementService = accessor.get(extensionManagement_2.$icb);
        const extensions = await extensionService.getInstalled();
        return extensions.map(extension => {
            return {
                identifier: extension.identifier,
                local: extension,
                globallyEnabled: extensionEnablementService.isEnabled(extension)
            };
        });
    }
    exports.$lGb = $lGb;
    function isKeymapExtension(tipsService, extension) {
        const cats = extension.local.manifest.categories;
        return cats && cats.indexOf('Keymaps') !== -1 || tipsService.getKeymapRecommendations().some(extensionId => (0, extensionManagementUtil_1.$po)({ id: extensionId }, extension.local.identifier));
    }
});
//# sourceMappingURL=extensionsUtils.js.map