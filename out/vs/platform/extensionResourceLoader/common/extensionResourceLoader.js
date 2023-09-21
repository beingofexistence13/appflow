/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/base/common/strings", "vs/base/common/uri", "vs/platform/instantiation/common/instantiation", "vs/platform/externalServices/common/serviceMachineId", "vs/platform/telemetry/common/telemetryUtils", "vs/base/common/network", "vs/platform/remote/common/remoteHosts"], function (require, exports, platform_1, strings_1, uri_1, instantiation_1, serviceMachineId_1, telemetryUtils_1, network_1, remoteHosts_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractExtensionResourceLoaderService = exports.migratePlatformSpecificExtensionGalleryResourceURL = exports.IExtensionResourceLoaderService = void 0;
    const WEB_EXTENSION_RESOURCE_END_POINT = 'web-extension-resource';
    exports.IExtensionResourceLoaderService = (0, instantiation_1.createDecorator)('extensionResourceLoaderService');
    function migratePlatformSpecificExtensionGalleryResourceURL(resource, targetPlatform) {
        if (resource.query !== `target=${targetPlatform}`) {
            return undefined;
        }
        const paths = resource.path.split('/');
        if (!paths[3]) {
            return undefined;
        }
        paths[3] = `${paths[3]}+${targetPlatform}`;
        return resource.with({ query: null, path: paths.join('/') });
    }
    exports.migratePlatformSpecificExtensionGalleryResourceURL = migratePlatformSpecificExtensionGalleryResourceURL;
    class AbstractExtensionResourceLoaderService {
        constructor(_fileService, _storageService, _productService, _environmentService, _configurationService) {
            this._fileService = _fileService;
            this._storageService = _storageService;
            this._productService = _productService;
            this._environmentService = _environmentService;
            this._configurationService = _configurationService;
            this._webExtensionResourceEndPoint = `${(0, remoteHosts_1.getRemoteServerRootPath)(_productService)}/${WEB_EXTENSION_RESOURCE_END_POINT}/`;
            if (_productService.extensionsGallery) {
                this._extensionGalleryResourceUrlTemplate = _productService.extensionsGallery.resourceUrlTemplate;
                this._extensionGalleryAuthority = this._extensionGalleryResourceUrlTemplate ? this._getExtensionGalleryAuthority(uri_1.URI.parse(this._extensionGalleryResourceUrlTemplate)) : undefined;
            }
        }
        get supportsExtensionGalleryResources() {
            return this._extensionGalleryResourceUrlTemplate !== undefined;
        }
        getExtensionGalleryResourceURL({ publisher, name, version, targetPlatform }, path) {
            if (this._extensionGalleryResourceUrlTemplate) {
                const uri = uri_1.URI.parse((0, strings_1.format2)(this._extensionGalleryResourceUrlTemplate, {
                    publisher,
                    name,
                    version: targetPlatform !== undefined
                        && targetPlatform !== "undefined" /* TargetPlatform.UNDEFINED */
                        && targetPlatform !== "unknown" /* TargetPlatform.UNKNOWN */
                        && targetPlatform !== "universal" /* TargetPlatform.UNIVERSAL */
                        ? `${version}+${targetPlatform}`
                        : version,
                    path: 'extension'
                }));
                return this._isWebExtensionResourceEndPoint(uri) ? uri.with({ scheme: network_1.RemoteAuthorities.getPreferredWebSchema() }) : uri;
            }
            return undefined;
        }
        isExtensionGalleryResource(uri) {
            return !!this._extensionGalleryAuthority && this._extensionGalleryAuthority === this._getExtensionGalleryAuthority(uri);
        }
        async getExtensionGalleryRequestHeaders() {
            const headers = {
                'X-Client-Name': `${this._productService.applicationName}${platform_1.isWeb ? '-web' : ''}`,
                'X-Client-Version': this._productService.version
            };
            if ((0, telemetryUtils_1.supportsTelemetry)(this._productService, this._environmentService) && (0, telemetryUtils_1.getTelemetryLevel)(this._configurationService) === 3 /* TelemetryLevel.USAGE */) {
                headers['X-Machine-Id'] = await this._getServiceMachineId();
            }
            if (this._productService.commit) {
                headers['X-Client-Commit'] = this._productService.commit;
            }
            return headers;
        }
        _getServiceMachineId() {
            if (!this._serviceMachineIdPromise) {
                this._serviceMachineIdPromise = (0, serviceMachineId_1.getServiceMachineId)(this._environmentService, this._fileService, this._storageService);
            }
            return this._serviceMachineIdPromise;
        }
        _getExtensionGalleryAuthority(uri) {
            if (this._isWebExtensionResourceEndPoint(uri)) {
                return uri.authority;
            }
            const index = uri.authority.indexOf('.');
            return index !== -1 ? uri.authority.substring(index + 1) : undefined;
        }
        _isWebExtensionResourceEndPoint(uri) {
            return uri.path.startsWith(this._webExtensionResourceEndPoint);
        }
    }
    exports.AbstractExtensionResourceLoaderService = AbstractExtensionResourceLoaderService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uUmVzb3VyY2VMb2FkZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9leHRlbnNpb25SZXNvdXJjZUxvYWRlci9jb21tb24vZXh0ZW5zaW9uUmVzb3VyY2VMb2FkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBbUJoRyxNQUFNLGdDQUFnQyxHQUFHLHdCQUF3QixDQUFDO0lBRXJELFFBQUEsK0JBQStCLEdBQUcsSUFBQSwrQkFBZSxFQUFrQyxnQ0FBZ0MsQ0FBQyxDQUFDO0lBNkJsSSxTQUFnQixrREFBa0QsQ0FBQyxRQUFhLEVBQUUsY0FBOEI7UUFDL0csSUFBSSxRQUFRLENBQUMsS0FBSyxLQUFLLFVBQVUsY0FBYyxFQUFFLEVBQUU7WUFDbEQsT0FBTyxTQUFTLENBQUM7U0FDakI7UUFDRCxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ2QsT0FBTyxTQUFTLENBQUM7U0FDakI7UUFDRCxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksY0FBYyxFQUFFLENBQUM7UUFDM0MsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQVZELGdIQVVDO0lBRUQsTUFBc0Isc0NBQXNDO1FBUTNELFlBQ29CLFlBQTBCLEVBQzVCLGVBQWdDLEVBQ2hDLGVBQWdDLEVBQ2hDLG1CQUF3QyxFQUN4QyxxQkFBNEM7WUFKMUMsaUJBQVksR0FBWixZQUFZLENBQWM7WUFDNUIsb0JBQWUsR0FBZixlQUFlLENBQWlCO1lBQ2hDLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtZQUNoQyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1lBQ3hDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFFN0QsSUFBSSxDQUFDLDZCQUE2QixHQUFHLEdBQUcsSUFBQSxxQ0FBdUIsRUFBQyxlQUFlLENBQUMsSUFBSSxnQ0FBZ0MsR0FBRyxDQUFDO1lBQ3hILElBQUksZUFBZSxDQUFDLGlCQUFpQixFQUFFO2dCQUN0QyxJQUFJLENBQUMsb0NBQW9DLEdBQUcsZUFBZSxDQUFDLGlCQUFpQixDQUFDLG1CQUFtQixDQUFDO2dCQUNsRyxJQUFJLENBQUMsMEJBQTBCLEdBQUcsSUFBSSxDQUFDLG9DQUFvQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsNkJBQTZCLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsb0NBQW9DLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7YUFDbkw7UUFDRixDQUFDO1FBRUQsSUFBVyxpQ0FBaUM7WUFDM0MsT0FBTyxJQUFJLENBQUMsb0NBQW9DLEtBQUssU0FBUyxDQUFDO1FBQ2hFLENBQUM7UUFFTSw4QkFBOEIsQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLGNBQWMsRUFBeUYsRUFBRSxJQUFhO1lBQ3ZMLElBQUksSUFBSSxDQUFDLG9DQUFvQyxFQUFFO2dCQUM5QyxNQUFNLEdBQUcsR0FBRyxTQUFHLENBQUMsS0FBSyxDQUFDLElBQUEsaUJBQU8sRUFBQyxJQUFJLENBQUMsb0NBQW9DLEVBQUU7b0JBQ3hFLFNBQVM7b0JBQ1QsSUFBSTtvQkFDSixPQUFPLEVBQUUsY0FBYyxLQUFLLFNBQVM7MkJBQ2pDLGNBQWMsK0NBQTZCOzJCQUMzQyxjQUFjLDJDQUEyQjsyQkFDekMsY0FBYywrQ0FBNkI7d0JBQzlDLENBQUMsQ0FBQyxHQUFHLE9BQU8sSUFBSSxjQUFjLEVBQUU7d0JBQ2hDLENBQUMsQ0FBQyxPQUFPO29CQUNWLElBQUksRUFBRSxXQUFXO2lCQUNqQixDQUFDLENBQUMsQ0FBQztnQkFDSixPQUFPLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSwyQkFBaUIsQ0FBQyxxQkFBcUIsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO2FBQ3pIO1lBQ0QsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztRQUlELDBCQUEwQixDQUFDLEdBQVE7WUFDbEMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLDBCQUEwQixJQUFJLElBQUksQ0FBQywwQkFBMEIsS0FBSyxJQUFJLENBQUMsNkJBQTZCLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDekgsQ0FBQztRQUVTLEtBQUssQ0FBQyxpQ0FBaUM7WUFDaEQsTUFBTSxPQUFPLEdBQWE7Z0JBQ3pCLGVBQWUsRUFBRSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsZUFBZSxHQUFHLGdCQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUNoRixrQkFBa0IsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU87YUFDaEQsQ0FBQztZQUNGLElBQUksSUFBQSxrQ0FBaUIsRUFBQyxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLElBQUEsa0NBQWlCLEVBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGlDQUF5QixFQUFFO2dCQUNoSixPQUFPLENBQUMsY0FBYyxDQUFDLEdBQUcsTUFBTSxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQzthQUM1RDtZQUNELElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUU7Z0JBQ2hDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDO2FBQ3pEO1lBQ0QsT0FBTyxPQUFPLENBQUM7UUFDaEIsQ0FBQztRQUdPLG9CQUFvQjtZQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLHdCQUF3QixFQUFFO2dCQUNuQyxJQUFJLENBQUMsd0JBQXdCLEdBQUcsSUFBQSxzQ0FBbUIsRUFBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7YUFDdkg7WUFDRCxPQUFPLElBQUksQ0FBQyx3QkFBd0IsQ0FBQztRQUN0QyxDQUFDO1FBRU8sNkJBQTZCLENBQUMsR0FBUTtZQUM3QyxJQUFJLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDOUMsT0FBTyxHQUFHLENBQUMsU0FBUyxDQUFDO2FBQ3JCO1lBQ0QsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDekMsT0FBTyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQ3RFLENBQUM7UUFFUywrQkFBK0IsQ0FBQyxHQUFRO1lBQ2pELE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLENBQUM7UUFDaEUsQ0FBQztLQUVEO0lBcEZELHdGQW9GQyJ9