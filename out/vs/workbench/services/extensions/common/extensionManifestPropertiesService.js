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
    exports.ExtensionManifestPropertiesService = exports.IExtensionManifestPropertiesService = void 0;
    exports.IExtensionManifestPropertiesService = (0, instantiation_1.createDecorator)('extensionManifestPropertiesService');
    let ExtensionManifestPropertiesService = class ExtensionManifestPropertiesService extends lifecycle_1.Disposable {
        constructor(productService, configurationService, workspaceTrustEnablementService, logService) {
            super();
            this.productService = productService;
            this.configurationService = configurationService;
            this.workspaceTrustEnablementService = workspaceTrustEnablementService;
            this.logService = logService;
            this._extensionPointExtensionKindsMap = null;
            this._productExtensionKindsMap = null;
            this._configuredExtensionKindsMap = null;
            this._productVirtualWorkspaceSupportMap = null;
            this._configuredVirtualWorkspaceSupportMap = null;
            // Workspace trust request type (settings.json)
            this._configuredExtensionWorkspaceTrustRequestMap = new extensions_1.ExtensionIdentifierMap();
            const configuredExtensionWorkspaceTrustRequests = configurationService.inspect(workspaceTrust_1.WORKSPACE_TRUST_EXTENSION_SUPPORT).userValue || {};
            for (const id of Object.keys(configuredExtensionWorkspaceTrustRequests)) {
                this._configuredExtensionWorkspaceTrustRequestMap.set(id, configuredExtensionWorkspaceTrustRequests[id]);
            }
            // Workspace trust request type (product.json)
            this._productExtensionWorkspaceTrustRequestMap = new Map();
            if (productService.extensionUntrustedWorkspaceSupport) {
                for (const id of Object.keys(productService.extensionUntrustedWorkspaceSupport)) {
                    this._productExtensionWorkspaceTrustRequestMap.set(id, productService.extensionUntrustedWorkspaceSupport[id]);
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
            const deducedExtensionKind = this.deduceExtensionKind(manifest);
            const configuredExtensionKind = this.getConfiguredExtensionKind(manifest);
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
                if (platform_1.isWeb && !configuredExtensionKind.includes('-web') && !configuredExtensionKind.includes('web') && deducedExtensionKind.includes('web')) {
                    result.push('web');
                }
                return result;
            }
            return deducedExtensionKind;
        }
        getUserConfiguredExtensionKind(extensionIdentifier) {
            if (this._configuredExtensionKindsMap === null) {
                const configuredExtensionKindsMap = new extensions_1.ExtensionIdentifierMap();
                const configuredExtensionKinds = this.configurationService.getValue('remote.extensionKind') || {};
                for (const id of Object.keys(configuredExtensionKinds)) {
                    configuredExtensionKindsMap.set(id, configuredExtensionKinds[id]);
                }
                this._configuredExtensionKindsMap = configuredExtensionKindsMap;
            }
            const userConfiguredExtensionKind = this._configuredExtensionKindsMap.get(extensionIdentifier.id);
            return userConfiguredExtensionKind ? this.toArray(userConfiguredExtensionKind) : undefined;
        }
        getExtensionUntrustedWorkspaceSupportType(manifest) {
            // Workspace trust feature is disabled, or extension has no entry point
            if (!this.workspaceTrustEnablementService.isWorkspaceTrustEnabled() || !manifest.main) {
                return true;
            }
            // Get extension workspace trust requirements from settings.json
            const configuredWorkspaceTrustRequest = this.getConfiguredExtensionWorkspaceTrustRequest(manifest);
            // Get extension workspace trust requirements from product.json
            const productWorkspaceTrustRequest = this.getProductExtensionWorkspaceTrustRequest(manifest);
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
            const userConfiguredVirtualWorkspaceSupport = this.getConfiguredVirtualWorkspaceSupport(manifest);
            if (userConfiguredVirtualWorkspaceSupport !== undefined) {
                return userConfiguredVirtualWorkspaceSupport;
            }
            const productConfiguredWorkspaceSchemes = this.getProductVirtualWorkspaceSupport(manifest);
            // check override from product
            if (productConfiguredWorkspaceSchemes?.override !== undefined) {
                return productConfiguredWorkspaceSchemes.override;
            }
            // check the manifest
            const virtualWorkspaces = manifest.capabilities?.virtualWorkspaces;
            if ((0, types_1.isBoolean)(virtualWorkspaces)) {
                return virtualWorkspaces;
            }
            else if (virtualWorkspaces) {
                const supported = virtualWorkspaces.supported;
                if ((0, types_1.isBoolean)(supported) || supported === 'limited') {
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
        deduceExtensionKind(manifest) {
            // Not an UI extension if it has main
            if (manifest.main) {
                if (manifest.browser) {
                    return platform_1.isWeb ? ['workspace', 'web'] : ['workspace'];
                }
                return ['workspace'];
            }
            if (manifest.browser) {
                return ['web'];
            }
            let result = [...extensions_1.ALL_EXTENSION_KINDS];
            if ((0, arrays_1.isNonEmptyArray)(manifest.extensionPack) || (0, arrays_1.isNonEmptyArray)(manifest.extensionDependencies)) {
                // Extension pack defaults to [workspace, web] in web and only [workspace] in desktop
                result = platform_1.isWeb ? ['workspace', 'web'] : ['workspace'];
            }
            if (manifest.contributes) {
                for (const contribution of Object.keys(manifest.contributes)) {
                    const supportedExtensionKinds = this.getSupportedExtensionKindsForExtensionPoint(contribution);
                    if (supportedExtensionKinds.length) {
                        result = result.filter(extensionKind => supportedExtensionKinds.includes(extensionKind));
                    }
                }
            }
            if (!result.length) {
                this.logService.warn('Cannot deduce extensionKind for extension', (0, extensionManagementUtil_1.getGalleryExtensionId)(manifest.publisher, manifest.name));
            }
            return result;
        }
        getSupportedExtensionKindsForExtensionPoint(extensionPoint) {
            if (this._extensionPointExtensionKindsMap === null) {
                const extensionPointExtensionKindsMap = new Map();
                extensionsRegistry_1.ExtensionsRegistry.getExtensionPoints().forEach(e => extensionPointExtensionKindsMap.set(e.name, e.defaultExtensionKind || [] /* supports all */));
                this._extensionPointExtensionKindsMap = extensionPointExtensionKindsMap;
            }
            let extensionPointExtensionKind = this._extensionPointExtensionKindsMap.get(extensionPoint);
            if (extensionPointExtensionKind) {
                return extensionPointExtensionKind;
            }
            extensionPointExtensionKind = this.productService.extensionPointExtensionKind ? this.productService.extensionPointExtensionKind[extensionPoint] : undefined;
            if (extensionPointExtensionKind) {
                return extensionPointExtensionKind;
            }
            /* Unknown extension point */
            return platform_1.isWeb ? ['workspace', 'web'] : ['workspace'];
        }
        getConfiguredExtensionKind(manifest) {
            const extensionIdentifier = { id: (0, extensionManagementUtil_1.getGalleryExtensionId)(manifest.publisher, manifest.name) };
            // check in config
            let result = this.getUserConfiguredExtensionKind(extensionIdentifier);
            if (typeof result !== 'undefined') {
                return this.toArray(result);
            }
            // check product.json
            result = this.getProductExtensionKind(manifest);
            if (typeof result !== 'undefined') {
                return result;
            }
            // check the manifest itself
            result = manifest.extensionKind;
            if (typeof result !== 'undefined') {
                result = this.toArray(result);
                return result.filter(r => ['ui', 'workspace'].includes(r));
            }
            return null;
        }
        getProductExtensionKind(manifest) {
            if (this._productExtensionKindsMap === null) {
                const productExtensionKindsMap = new extensions_1.ExtensionIdentifierMap();
                if (this.productService.extensionKind) {
                    for (const id of Object.keys(this.productService.extensionKind)) {
                        productExtensionKindsMap.set(id, this.productService.extensionKind[id]);
                    }
                }
                this._productExtensionKindsMap = productExtensionKindsMap;
            }
            const extensionId = (0, extensionManagementUtil_1.getGalleryExtensionId)(manifest.publisher, manifest.name);
            return this._productExtensionKindsMap.get(extensionId);
        }
        getProductVirtualWorkspaceSupport(manifest) {
            if (this._productVirtualWorkspaceSupportMap === null) {
                const productWorkspaceSchemesMap = new extensions_1.ExtensionIdentifierMap();
                if (this.productService.extensionVirtualWorkspacesSupport) {
                    for (const id of Object.keys(this.productService.extensionVirtualWorkspacesSupport)) {
                        productWorkspaceSchemesMap.set(id, this.productService.extensionVirtualWorkspacesSupport[id]);
                    }
                }
                this._productVirtualWorkspaceSupportMap = productWorkspaceSchemesMap;
            }
            const extensionId = (0, extensionManagementUtil_1.getGalleryExtensionId)(manifest.publisher, manifest.name);
            return this._productVirtualWorkspaceSupportMap.get(extensionId);
        }
        getConfiguredVirtualWorkspaceSupport(manifest) {
            if (this._configuredVirtualWorkspaceSupportMap === null) {
                const configuredWorkspaceSchemesMap = new extensions_1.ExtensionIdentifierMap();
                const configuredWorkspaceSchemes = this.configurationService.getValue('extensions.supportVirtualWorkspaces') || {};
                for (const id of Object.keys(configuredWorkspaceSchemes)) {
                    if (configuredWorkspaceSchemes[id] !== undefined) {
                        configuredWorkspaceSchemesMap.set(id, configuredWorkspaceSchemes[id]);
                    }
                }
                this._configuredVirtualWorkspaceSupportMap = configuredWorkspaceSchemesMap;
            }
            const extensionId = (0, extensionManagementUtil_1.getGalleryExtensionId)(manifest.publisher, manifest.name);
            return this._configuredVirtualWorkspaceSupportMap.get(extensionId);
        }
        getConfiguredExtensionWorkspaceTrustRequest(manifest) {
            const extensionId = (0, extensionManagementUtil_1.getGalleryExtensionId)(manifest.publisher, manifest.name);
            const extensionWorkspaceTrustRequest = this._configuredExtensionWorkspaceTrustRequestMap.get(extensionId);
            if (extensionWorkspaceTrustRequest && (extensionWorkspaceTrustRequest.version === undefined || extensionWorkspaceTrustRequest.version === manifest.version)) {
                return extensionWorkspaceTrustRequest.supported;
            }
            return undefined;
        }
        getProductExtensionWorkspaceTrustRequest(manifest) {
            const extensionId = (0, extensionManagementUtil_1.getGalleryExtensionId)(manifest.publisher, manifest.name);
            return this._productExtensionWorkspaceTrustRequestMap.get(extensionId);
        }
        toArray(extensionKind) {
            if (Array.isArray(extensionKind)) {
                return extensionKind;
            }
            return extensionKind === 'ui' ? ['ui', 'workspace'] : [extensionKind];
        }
    };
    exports.ExtensionManifestPropertiesService = ExtensionManifestPropertiesService;
    exports.ExtensionManifestPropertiesService = ExtensionManifestPropertiesService = __decorate([
        __param(0, productService_1.IProductService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, workspaceTrust_2.IWorkspaceTrustEnablementService),
        __param(3, log_1.ILogService)
    ], ExtensionManifestPropertiesService);
    (0, extensions_2.registerSingleton)(exports.IExtensionManifestPropertiesService, ExtensionManifestPropertiesService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uTWFuaWZlc3RQcm9wZXJ0aWVzU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9leHRlbnNpb25zL2NvbW1vbi9leHRlbnNpb25NYW5pZmVzdFByb3BlcnRpZXNTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQW1CbkYsUUFBQSxtQ0FBbUMsR0FBRyxJQUFBLCtCQUFlLEVBQXNDLG9DQUFvQyxDQUFDLENBQUM7SUFtQnZJLElBQU0sa0NBQWtDLEdBQXhDLE1BQU0sa0NBQW1DLFNBQVEsc0JBQVU7UUFjakUsWUFDa0IsY0FBZ0QsRUFDMUMsb0JBQTRELEVBQ2pELCtCQUFrRixFQUN2RyxVQUF3QztZQUVyRCxLQUFLLEVBQUUsQ0FBQztZQUwwQixtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDekIseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUNoQyxvQ0FBK0IsR0FBL0IsK0JBQStCLENBQWtDO1lBQ3RGLGVBQVUsR0FBVixVQUFVLENBQWE7WUFkOUMscUNBQWdDLEdBQXdDLElBQUksQ0FBQztZQUM3RSw4QkFBeUIsR0FBbUQsSUFBSSxDQUFDO1lBQ2pGLGlDQUE0QixHQUFtRSxJQUFJLENBQUM7WUFFcEcsdUNBQWtDLEdBQTZFLElBQUksQ0FBQztZQUNwSCwwQ0FBcUMsR0FBMkMsSUFBSSxDQUFDO1lBYTVGLCtDQUErQztZQUMvQyxJQUFJLENBQUMsNENBQTRDLEdBQUcsSUFBSSxtQ0FBc0IsRUFBMkUsQ0FBQztZQUMxSixNQUFNLHlDQUF5QyxHQUFHLG9CQUFvQixDQUFDLE9BQU8sQ0FBNkYsa0RBQWlDLENBQUMsQ0FBQyxTQUFTLElBQUksRUFBRSxDQUFDO1lBQzlOLEtBQUssTUFBTSxFQUFFLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxF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