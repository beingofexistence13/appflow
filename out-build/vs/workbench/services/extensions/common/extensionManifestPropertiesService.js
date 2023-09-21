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
define(["require", "exports", "vs/platform/configuration/common/configuration", "vs/platform/extensions/common/extensions", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/base/common/arrays", "vs/platform/product/common/productService", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/extensions", "vs/base/common/lifecycle", "vs/workbench/services/workspaces/common/workspaceTrust", "vs/base/common/types", "vs/platform/workspace/common/workspaceTrust", "vs/platform/log/common/log", "vs/base/common/platform"], function (require, exports, configuration_1, extensions_1, extensionsRegistry_1, extensionManagementUtil_1, arrays_1, productService_1, instantiation_1, extensions_2, lifecycle_1, workspaceTrust_1, types_1, workspaceTrust_2, log_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$wcb = exports.$vcb = void 0;
    exports.$vcb = (0, instantiation_1.$Bh)('extensionManifestPropertiesService');
    let $wcb = class $wcb extends lifecycle_1.$kc {
        constructor(m, n, s, t) {
            super();
            this.m = m;
            this.n = n;
            this.s = s;
            this.t = t;
            this.a = null;
            this.b = null;
            this.c = null;
            this.f = null;
            this.g = null;
            // Workspace trust request type (settings.json)
            this.h = new extensions_1.$Xl();
            const configuredExtensionWorkspaceTrustRequests = n.inspect(workspaceTrust_1.$pcb).userValue || {};
            for (const id of Object.keys(configuredExtensionWorkspaceTrustRequests)) {
                this.h.set(id, configuredExtensionWorkspaceTrustRequests[id]);
            }
            // Workspace trust request type (product.json)
            this.j = new Map();
            if (m.extensionUntrustedWorkspaceSupport) {
                for (const id of Object.keys(m.extensionUntrustedWorkspaceSupport)) {
                    this.j.set(id, m.extensionUntrustedWorkspaceSupport[id]);
                }
            }
        }
        prefersExecuteOnUI(manifest) {
            const extensionKind = this.getExtensionKind(manifest);
            return (extensionKind.length > 0 && extensionKind[0] === 'ui');
        }
        prefersExecuteOnWorkspace(manifest) {
            const extensionKind = this.getExtensionKind(manifest);
            return (extensionKind.length > 0 && extensionKind[0] === 'workspace');
        }
        prefersExecuteOnWeb(manifest) {
            const extensionKind = this.getExtensionKind(manifest);
            return (extensionKind.length > 0 && extensionKind[0] === 'web');
        }
        canExecuteOnUI(manifest) {
            const extensionKind = this.getExtensionKind(manifest);
            return extensionKind.some(kind => kind === 'ui');
        }
        canExecuteOnWorkspace(manifest) {
            const extensionKind = this.getExtensionKind(manifest);
            return extensionKind.some(kind => kind === 'workspace');
        }
        canExecuteOnWeb(manifest) {
            const extensionKind = this.getExtensionKind(manifest);
            return extensionKind.some(kind => kind === 'web');
        }
        getExtensionKind(manifest) {
            const deducedExtensionKind = this.u(manifest);
            const configuredExtensionKind = this.y(manifest);
            if (configuredExtensionKind && configuredExtensionKind.length > 0) {
                const result = [];
                for (const extensionKind of configuredExtensionKind) {
                    if (extensionKind !== '-web') {
                        result.push(extensionKind);
                    }
                }
                // If opted out from web without specifying other extension kinds then default to ui, workspace
                if (configuredExtensionKind.includes('-web') && !result.length) {
                    result.push('ui');
                    result.push('workspace');
                }
                // Add web kind if not opted out from web and can run in web
                if (platform_1.$o && !configuredExtensionKind.includes('-web') && !configuredExtensionKind.includes('web') && deducedExtensionKind.includes('web')) {
                    result.push('web');
                }
                return result;
            }
            return deducedExtensionKind;
        }
        getUserConfiguredExtensionKind(extensionIdentifier) {
            if (this.c === null) {
                const configuredExtensionKindsMap = new extensions_1.$Xl();
                const configuredExtensionKinds = this.n.getValue('remote.extensionKind') || {};
                for (const id of Object.keys(configuredExtensionKinds)) {
                    configuredExtensionKindsMap.set(id, configuredExtensionKinds[id]);
                }
                this.c = configuredExtensionKindsMap;
            }
            const userConfiguredExtensionKind = this.c.get(extensionIdentifier.id);
            return userConfiguredExtensionKind ? this.H(userConfiguredExtensionKind) : undefined;
        }
        getExtensionUntrustedWorkspaceSupportType(manifest) {
            // Workspace trust feature is disabled, or extension has no entry point
            if (!this.s.isWorkspaceTrustEnabled() || !manifest.main) {
                return true;
            }
            // Get extension workspace trust requirements from settings.json
            const configuredWorkspaceTrustRequest = this.F(manifest);
            // Get extension workspace trust requirements from product.json
            const productWorkspaceTrustRequest = this.G(manifest);
            // Use settings.json override value if it exists
            if (configuredWorkspaceTrustRequest !== undefined) {
                return configuredWorkspaceTrustRequest;
            }
            // Use product.json override value if it exists
            if (productWorkspaceTrustRequest?.override !== undefined) {
                return productWorkspaceTrustRequest.override;
            }
            // Use extension manifest value if it exists
            if (manifest.capabilities?.untrustedWorkspaces?.supported !== undefined) {
                return manifest.capabilities.untrustedWorkspaces.supported;
            }
            // Use product.json default value if it exists
            if (productWorkspaceTrustRequest?.default !== undefined) {
                return productWorkspaceTrustRequest.default;
            }
            return false;
        }
        getExtensionVirtualWorkspaceSupportType(manifest) {
            // check user configured
            const userConfiguredVirtualWorkspaceSupport = this.D(manifest);
            if (userConfiguredVirtualWorkspaceSupport !== undefined) {
                return userConfiguredVirtualWorkspaceSupport;
            }
            const productConfiguredWorkspaceSchemes = this.C(manifest);
            // check override from product
            if (productConfiguredWorkspaceSchemes?.override !== undefined) {
                return productConfiguredWorkspaceSchemes.override;
            }
            // check the manifest
            const virtualWorkspaces = manifest.capabilities?.virtualWorkspaces;
            if ((0, types_1.$pf)(virtualWorkspaces)) {
                return virtualWorkspaces;
            }
            else if (virtualWorkspaces) {
                const supported = virtualWorkspaces.supported;
                if ((0, types_1.$pf)(supported) || supported === 'limited') {
                    return supported;
                }
            }
            // check default from product
            if (productConfiguredWorkspaceSchemes?.default !== undefined) {
                return productConfiguredWorkspaceSchemes.default;
            }
            // Default - supports virtual workspace
            return true;
        }
        u(manifest) {
            // Not an UI extension if it has main
            if (manifest.main) {
                if (manifest.browser) {
                    return platform_1.$o ? ['workspace', 'web'] : ['workspace'];
                }
                return ['workspace'];
            }
            if (manifest.browser) {
                return ['web'];
            }
            let result = [...extensions_1.$Sl];
            if ((0, arrays_1.$Jb)(manifest.extensionPack) || (0, arrays_1.$Jb)(manifest.extensionDependencies)) {
                // Extension pack defaults to [workspace, web] in web and only [workspace] in desktop
                result = platform_1.$o ? ['workspace', 'web'] : ['workspace'];
            }
            if (manifest.contributes) {
                for (const contribution of Object.keys(manifest.contributes)) {
                    const supportedExtensionKinds = this.w(contribution);
                    if (supportedExtensionKinds.length) {
                        result = result.filter(extensionKind => supportedExtensionKinds.includes(extensionKind));
                    }
                }
            }
            if (!result.length) {
                this.t.warn('Cannot deduce extensionKind for extension', (0, extensionManagementUtil_1.$uo)(manifest.publisher, manifest.name));
            }
            return result;
        }
        w(extensionPoint) {
            if (this.a === null) {
                const extensionPointExtensionKindsMap = new Map();
                extensionsRegistry_1.$2F.getExtensionPoints().forEach(e => extensionPointExtensionKindsMap.set(e.name, e.defaultExtensionKind || [] /* supports all */));
                this.a = extensionPointExtensionKindsMap;
            }
            let extensionPointExtensionKind = this.a.get(extensionPoint);
            if (extensionPointExtensionKind) {
                return extensionPointExtensionKind;
            }
            extensionPointExtensionKind = this.m.extensionPointExtensionKind ? this.m.extensionPointExtensionKind[extensionPoint] : undefined;
            if (extensionPointExtensionKind) {
                return extensionPointExtensionKind;
            }
            /* Unknown extension point */
            return platform_1.$o ? ['workspace', 'web'] : ['workspace'];
        }
        y(manifest) {
            const extensionIdentifier = { id: (0, extensionManagementUtil_1.$uo)(manifest.publisher, manifest.name) };
            // check in config
            let result = this.getUserConfiguredExtensionKind(extensionIdentifier);
            if (typeof result !== 'undefined') {
                return this.H(result);
            }
            // check product.json
            result = this.z(manifest);
            if (typeof result !== 'undefined') {
                return result;
            }
            // check the manifest itself
            result = manifest.extensionKind;
            if (typeof result !== 'undefined') {
                result = this.H(result);
                return result.filter(r => ['ui', 'workspace'].includes(r));
            }
            return null;
        }
        z(manifest) {
            if (this.b === null) {
                const productExtensionKindsMap = new extensions_1.$Xl();
                if (this.m.extensionKind) {
                    for (const id of Object.keys(this.m.extensionKind)) {
                        productExtensionKindsMap.set(id, this.m.extensionKind[id]);
                    }
                }
                this.b = productExtensionKindsMap;
            }
            const extensionId = (0, extensionManagementUtil_1.$uo)(manifest.publisher, manifest.name);
            return this.b.get(extensionId);
        }
        C(manifest) {
            if (this.f === null) {
                const productWorkspaceSchemesMap = new extensions_1.$Xl();
                if (this.m.extensionVirtualWorkspacesSupport) {
                    for (const id of Object.keys(this.m.extensionVirtualWorkspacesSupport)) {
                        productWorkspaceSchemesMap.set(id, this.m.extensionVirtualWorkspacesSupport[id]);
                    }
                }
                this.f = productWorkspaceSchemesMap;
            }
            const extensionId = (0, extensionManagementUtil_1.$uo)(manifest.publisher, manifest.name);
            return this.f.get(extensionId);
        }
        D(manifest) {
            if (this.g === null) {
                const configuredWorkspaceSchemesMap = new extensions_1.$Xl();
                const configuredWorkspaceSchemes = this.n.getValue('extensions.supportVirtualWorkspaces') || {};
                for (const id of Object.keys(configuredWorkspaceSchemes)) {
                    if (configuredWorkspaceSchemes[id] !== undefined) {
                        configuredWorkspaceSchemesMap.set(id, configuredWorkspaceSchemes[id]);
                    }
                }
                this.g = configuredWorkspaceSchemesMap;
            }
            const extensionId = (0, extensionManagementUtil_1.$uo)(manifest.publisher, manifest.name);
            return this.g.get(extensionId);
        }
        F(manifest) {
            const extensionId = (0, extensionManagementUtil_1.$uo)(manifest.publisher, manifest.name);
            const extensionWorkspaceTrustRequest = this.h.get(extensionId);
            if (extensionWorkspaceTrustRequest && (extensionWorkspaceTrustRequest.version === undefined || extensionWorkspaceTrustRequest.version === manifest.version)) {
                return extensionWorkspaceTrustRequest.supported;
            }
            return undefined;
        }
        G(manifest) {
            const extensionId = (0, extensionManagementUtil_1.$uo)(manifest.publisher, manifest.name);
            return this.j.get(extensionId);
        }
        H(extensionKind) {
            if (Array.isArray(extensionKind)) {
                return extensionKind;
            }
            return extensionKind === 'ui' ? ['ui', 'workspace'] : [extensionKind];
        }
    };
    exports.$wcb = $wcb;
    exports.$wcb = $wcb = __decorate([
        __param(0, productService_1.$kj),
        __param(1, configuration_1.$8h),
        __param(2, workspaceTrust_2.$0z),
        __param(3, log_1.$5i)
    ], $wcb);
    (0, extensions_2.$mr)(exports.$vcb, $wcb, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=extensionManifestPropertiesService.js.map