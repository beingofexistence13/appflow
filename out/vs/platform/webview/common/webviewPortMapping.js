/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network", "vs/base/common/uri", "vs/platform/tunnel/common/tunnel"], function (require, exports, network_1, uri_1, tunnel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebviewPortMappingManager = void 0;
    /**
     * Manages port mappings for a single webview.
     */
    class WebviewPortMappingManager {
        constructor(_getExtensionLocation, _getMappings, tunnelService) {
            this._getExtensionLocation = _getExtensionLocation;
            this._getMappings = _getMappings;
            this.tunnelService = tunnelService;
            this._tunnels = new Map();
        }
        async getRedirect(resolveAuthority, url) {
            const uri = uri_1.URI.parse(url);
            const requestLocalHostInfo = (0, tunnel_1.extractLocalHostUriMetaDataForPortMapping)(uri);
            if (!requestLocalHostInfo) {
                return undefined;
            }
            for (const mapping of this._getMappings()) {
                if (mapping.webviewPort === requestLocalHostInfo.port) {
                    const extensionLocation = this._getExtensionLocation();
                    if (extensionLocation && extensionLocation.scheme === network_1.Schemas.vscodeRemote) {
                        const tunnel = resolveAuthority && await this.getOrCreateTunnel(resolveAuthority, mapping.extensionHostPort);
                        if (tunnel) {
                            if (tunnel.tunnelLocalPort === mapping.webviewPort) {
                                return undefined;
                            }
                            return encodeURI(uri.with({
                                authority: `127.0.0.1:${tunnel.tunnelLocalPort}`,
                            }).toString(true));
                        }
                    }
                    if (mapping.webviewPort !== mapping.extensionHostPort) {
                        return encodeURI(uri.with({
                            authority: `${requestLocalHostInfo.address}:${mapping.extensionHostPort}`
                        }).toString(true));
                    }
                }
            }
            return undefined;
        }
        async dispose() {
            for (const tunnel of this._tunnels.values()) {
                await tunnel.dispose();
            }
            this._tunnels.clear();
        }
        async getOrCreateTunnel(remoteAuthority, remotePort) {
            const existing = this._tunnels.get(remotePort);
            if (existing) {
                return existing;
            }
            const tunnelOrError = await this.tunnelService.openTunnel({ getAddress: async () => remoteAuthority }, undefined, remotePort);
            let tunnel;
            if (typeof tunnelOrError === 'string') {
                tunnel = undefined;
            }
            if (tunnel) {
                this._tunnels.set(remotePort, tunnel);
            }
            return tunnel;
        }
    }
    exports.WebviewPortMappingManager = WebviewPortMappingManager;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vidmlld1BvcnRNYXBwaW5nLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vd2Vidmlldy9jb21tb24vd2Vidmlld1BvcnRNYXBwaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWFoRzs7T0FFRztJQUNILE1BQWEseUJBQXlCO1FBSXJDLFlBQ2tCLHFCQUE0QyxFQUM1QyxZQUFrRCxFQUNsRCxhQUE2QjtZQUY3QiwwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBQzVDLGlCQUFZLEdBQVosWUFBWSxDQUFzQztZQUNsRCxrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFMOUIsYUFBUSxHQUFHLElBQUksR0FBRyxFQUF3QixDQUFDO1FBTXhELENBQUM7UUFFRSxLQUFLLENBQUMsV0FBVyxDQUFDLGdCQUE2QyxFQUFFLEdBQVc7WUFDbEYsTUFBTSxHQUFHLEdBQUcsU0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMzQixNQUFNLG9CQUFvQixHQUFHLElBQUEsa0RBQXlDLEVBQUMsR0FBRyxDQUFDLENBQUM7WUFDNUUsSUFBSSxDQUFDLG9CQUFvQixFQUFFO2dCQUMxQixPQUFPLFNBQVMsQ0FBQzthQUNqQjtZQUVELEtBQUssTUFBTSxPQUFPLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRSxFQUFFO2dCQUMxQyxJQUFJLE9BQU8sQ0FBQyxXQUFXLEtBQUssb0JBQW9CLENBQUMsSUFBSSxFQUFFO29CQUN0RCxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO29CQUN2RCxJQUFJLGlCQUFpQixJQUFJLGlCQUFpQixDQUFDLE1BQU0sS0FBSyxpQkFBTyxDQUFDLFlBQVksRUFBRTt3QkFDM0UsTUFBTSxNQUFNLEdBQUcsZ0JBQWdCLElBQUksTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7d0JBQzdHLElBQUksTUFBTSxFQUFFOzRCQUNYLElBQUksTUFBTSxDQUFDLGVBQWUsS0FBSyxPQUFPLENBQUMsV0FBVyxFQUFFO2dDQUNuRCxPQUFPLFNBQVMsQ0FBQzs2QkFDakI7NEJBQ0QsT0FBTyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQztnQ0FDekIsU0FBUyxFQUFFLGFBQWEsTUFBTSxDQUFDLGVBQWUsRUFBRTs2QkFDaEQsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO3lCQUNuQjtxQkFDRDtvQkFFRCxJQUFJLE9BQU8sQ0FBQyxXQUFXLEtBQUssT0FBTyxDQUFDLGlCQUFpQixFQUFFO3dCQUN0RCxPQUFPLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDOzRCQUN6QixTQUFTLEVBQUUsR0FBRyxvQkFBb0IsQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLGlCQUFpQixFQUFFO3lCQUN6RSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7cUJBQ25CO2lCQUNEO2FBQ0Q7WUFFRCxPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBRUQsS0FBSyxDQUFDLE9BQU87WUFDWixLQUFLLE1BQU0sTUFBTSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLEVBQUU7Z0JBQzVDLE1BQU0sTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQ3ZCO1lBQ0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN2QixDQUFDO1FBRU8sS0FBSyxDQUFDLGlCQUFpQixDQUFDLGVBQXlCLEVBQUUsVUFBa0I7WUFDNUUsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDL0MsSUFBSSxRQUFRLEVBQUU7Z0JBQ2IsT0FBTyxRQUFRLENBQUM7YUFDaEI7WUFDRCxNQUFNLGFBQWEsR0FBRyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLEVBQUUsVUFBVSxFQUFFLEtBQUssSUFBSSxFQUFFLENBQUMsZUFBZSxFQUFFLEVBQUUsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQzlILElBQUksTUFBZ0MsQ0FBQztZQUNyQyxJQUFJLE9BQU8sYUFBYSxLQUFLLFFBQVEsRUFBRTtnQkFDdEMsTUFBTSxHQUFHLFNBQVMsQ0FBQzthQUNuQjtZQUNELElBQUksTUFBTSxFQUFFO2dCQUNYLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQzthQUN0QztZQUNELE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztLQUNEO0lBakVELDhEQWlFQyJ9