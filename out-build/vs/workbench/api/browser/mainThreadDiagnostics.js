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
    exports.$Icb = void 0;
    let $Icb = class $Icb {
        constructor(extHostContext, d, e) {
            this.d = d;
            this.e = e;
            this.a = new Set();
            this.b = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostDiagnostics);
            this.c = this.d.onMarkerChanged(this.f, this);
        }
        dispose() {
            this.c.dispose();
            this.a.forEach(owner => this.d.changeAll(owner, []));
            this.a.clear();
        }
        f(resources) {
            const data = [];
            for (const resource of resources) {
                const allMarkerData = this.d.read({ resource });
                if (allMarkerData.length === 0) {
                    data.push([resource, []]);
                }
                else {
                    const forgeinMarkerData = allMarkerData.filter(marker => !this.a.has(marker.owner));
                    if (forgeinMarkerData.length > 0) {
                        data.push([resource, forgeinMarkerData]);
                    }
                }
            }
            if (data.length > 0) {
                this.b.$acceptMarkersChange(data);
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
                this.d.changeOne(owner, this.e.asCanonicalUri(uri_1.URI.revive(uri)), markers);
            }
            this.a.add(owner);
        }
        $clear(owner) {
            this.d.changeAll(owner, []);
            this.a.delete(owner);
        }
    };
    exports.$Icb = $Icb;
    exports.$Icb = $Icb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadDiagnostics),
        __param(1, markers_1.$3s),
        __param(2, uriIdentity_1.$Ck)
    ], $Icb);
});
//# sourceMappingURL=mainThreadDiagnostics.js.map