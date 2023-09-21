/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/base/common/strings", "vs/base/common/uri", "vs/platform/instantiation/common/instantiation", "vs/platform/externalServices/common/serviceMachineId", "vs/platform/telemetry/common/telemetryUtils", "vs/base/common/network", "vs/platform/remote/common/remoteHosts"], function (require, exports, platform_1, strings_1, uri_1, instantiation_1, serviceMachineId_1, telemetryUtils_1, network_1, remoteHosts_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$4$ = exports.$3$ = exports.$2$ = void 0;
    const WEB_EXTENSION_RESOURCE_END_POINT = 'web-extension-resource';
    exports.$2$ = (0, instantiation_1.$Bh)('extensionResourceLoaderService');
    function $3$(resource, targetPlatform) {
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
    exports.$3$ = $3$;
    class $4$ {
        constructor(d, e, f, g, h) {
            this.d = d;
            this.e = e;
            this.f = f;
            this.g = g;
            this.h = h;
            this.a = `${(0, remoteHosts_1.$Qk)(f)}/${WEB_EXTENSION_RESOURCE_END_POINT}/`;
            if (f.extensionsGallery) {
                this.b = f.extensionsGallery.resourceUrlTemplate;
                this.c = this.b ? this.l(uri_1.URI.parse(this.b)) : undefined;
            }
        }
        get supportsExtensionGalleryResources() {
            return this.b !== undefined;
        }
        getExtensionGalleryResourceURL({ publisher, name, version, targetPlatform }, path) {
            if (this.b) {
                const uri = uri_1.URI.parse((0, strings_1.$oe)(this.b, {
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
                return this.m(uri) ? uri.with({ scheme: network_1.$Wf.getPreferredWebSchema() }) : uri;
            }
            return undefined;
        }
        isExtensionGalleryResource(uri) {
            return !!this.c && this.c === this.l(uri);
        }
        async i() {
            const headers = {
                'X-Client-Name': `${this.f.applicationName}${platform_1.$o ? '-web' : ''}`,
                'X-Client-Version': this.f.version
            };
            if ((0, telemetryUtils_1.$ho)(this.f, this.g) && (0, telemetryUtils_1.$jo)(this.h) === 3 /* TelemetryLevel.USAGE */) {
                headers['X-Machine-Id'] = await this.k();
            }
            if (this.f.commit) {
                headers['X-Client-Commit'] = this.f.commit;
            }
            return headers;
        }
        k() {
            if (!this.j) {
                this.j = (0, serviceMachineId_1.$2o)(this.g, this.d, this.e);
            }
            return this.j;
        }
        l(uri) {
            if (this.m(uri)) {
                return uri.authority;
            }
            const index = uri.authority.indexOf('.');
            return index !== -1 ? uri.authority.substring(index + 1) : undefined;
        }
        m(uri) {
            return uri.path.startsWith(this.a);
        }
    }
    exports.$4$ = $4$;
});
//# sourceMappingURL=extensionResourceLoader.js.map