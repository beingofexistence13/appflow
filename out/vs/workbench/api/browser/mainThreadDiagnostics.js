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
define(["require", "exports", "vs/platform/markers/common/markers", "vs/base/common/uri", "../common/extHost.protocol", "vs/workbench/services/extensions/common/extHostCustomers", "vs/platform/uriIdentity/common/uriIdentity"], function (require, exports, markers_1, uri_1, extHost_protocol_1, extHostCustomers_1, uriIdentity_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadDiagnostics = void 0;
    let MainThreadDiagnostics = class MainThreadDiagnostics {
        constructor(extHostContext, _markerService, _uriIdentService) {
            this._markerService = _markerService;
            this._uriIdentService = _uriIdentService;
            this._activeOwners = new Set();
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostDiagnostics);
            this._markerListener = this._markerService.onMarkerChanged(this._forwardMarkers, this);
        }
        dispose() {
            this._markerListener.dispose();
            this._activeOwners.forEach(owner => this._markerService.changeAll(owner, []));
            this._activeOwners.clear();
        }
        _forwardMarkers(resources) {
            const data = [];
            for (const resource of resources) {
                const allMarkerData = this._markerService.read({ resource });
                if (allMarkerData.length === 0) {
                    data.push([resource, []]);
                }
                else {
                    const forgeinMarkerData = allMarkerData.filter(marker => !this._activeOwners.has(marker.owner));
                    if (forgeinMarkerData.length > 0) {
                        data.push([resource, forgeinMarkerData]);
                    }
                }
            }
            if (data.length > 0) {
                this._proxy.$acceptMarkersChange(data);
            }
        }
        $changeMany(owner, entries) {
            for (const entry of entries) {
                const [uri, markers] = entry;
                if (markers) {
                    for (const marker of markers) {
                        if (marker.relatedInformation) {
                            for (const relatedInformation of marker.relatedInformation) {
                                relatedInformation.resource = uri_1.URI.revive(relatedInformation.resource);
                            }
                        }
                        if (marker.code && typeof marker.code !== 'string') {
                            marker.code.target = uri_1.URI.revive(marker.code.target);
                        }
                    }
                }
                this._markerService.changeOne(owner, this._uriIdentService.asCanonicalUri(uri_1.URI.revive(uri)), markers);
            }
            this._activeOwners.add(owner);
        }
        $clear(owner) {
            this._markerService.changeAll(owner, []);
            this._activeOwners.delete(owner);
        }
    };
    exports.MainThreadDiagnostics = MainThreadDiagnostics;
    exports.MainThreadDiagnostics = MainThreadDiagnostics = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadDiagnostics),
        __param(1, markers_1.IMarkerService),
        __param(2, uriIdentity_1.IUriIdentityService)
    ], MainThreadDiagnostics);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZERpYWdub3N0aWNzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9icm93c2VyL21haW5UaHJlYWREaWFnbm9zdGljcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFVekYsSUFBTSxxQkFBcUIsR0FBM0IsTUFBTSxxQkFBcUI7UUFPakMsWUFDQyxjQUErQixFQUNmLGNBQStDLEVBQzFDLGdCQUFzRDtZQUQxQyxtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7WUFDekIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFxQjtZQVIzRCxrQkFBYSxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7WUFVbEQsSUFBSSxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDLGlDQUFjLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUV6RSxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDeEYsQ0FBQztRQUVELE9BQU87WUFDTixJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQy9CLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDOUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM1QixDQUFDO1FBRU8sZUFBZSxDQUFDLFNBQXlCO1lBQ2hELE1BQU0sSUFBSSxHQUFxQyxFQUFFLENBQUM7WUFDbEQsS0FBSyxNQUFNLFFBQVEsSUFBSSxTQUFTLEVBQUU7Z0JBQ2pDLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztnQkFDN0QsSUFBSSxhQUFhLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtvQkFDL0IsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUMxQjtxQkFBTTtvQkFDTixNQUFNLGlCQUFpQixHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUNoRyxJQUFJLGlCQUFpQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7d0JBQ2pDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO3FCQUN6QztpQkFDRDthQUNEO1lBQ0QsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDcEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUN2QztRQUNGLENBQUM7UUFFRCxXQUFXLENBQUMsS0FBYSxFQUFFLE9BQXlDO1lBQ25FLEtBQUssTUFBTSxLQUFLLElBQUksT0FBTyxFQUFFO2dCQUM1QixNQUFNLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFHLEtBQUssQ0FBQztnQkFDN0IsSUFBSSxPQUFPLEVBQUU7b0JBQ1osS0FBSyxNQUFNLE1BQU0sSUFBSSxPQUFPLEVBQUU7d0JBQzdCLElBQUksTUFBTSxDQUFDLGtCQUFrQixFQUFFOzRCQUM5QixLQUFLLE1BQU0sa0JBQWtCLElBQUksTUFBTSxDQUFDLGtCQUFrQixFQUFFO2dDQUMzRCxrQkFBa0IsQ0FBQyxRQUFRLEdBQUcsU0FBRyxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FBQzs2QkFDdEU7eUJBQ0Q7d0JBQ0QsSUFBSSxNQUFNLENBQUMsSUFBSSxJQUFJLE9BQU8sTUFBTSxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7NEJBQ25ELE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLFNBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzt5QkFDcEQ7cUJBQ0Q7aUJBQ0Q7Z0JBQ0QsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsU0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2FBQ3JHO1lBQ0QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDL0IsQ0FBQztRQUVELE1BQU0sQ0FBQyxLQUFhO1lBQ25CLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN6QyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNsQyxDQUFDO0tBQ0QsQ0FBQTtJQWpFWSxzREFBcUI7b0NBQXJCLHFCQUFxQjtRQURqQyxJQUFBLHVDQUFvQixFQUFDLDhCQUFXLENBQUMscUJBQXFCLENBQUM7UUFVckQsV0FBQSx3QkFBYyxDQUFBO1FBQ2QsV0FBQSxpQ0FBbUIsQ0FBQTtPQVZULHFCQUFxQixDQWlFakMifQ==