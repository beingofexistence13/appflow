/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/objects", "vs/editor/browser/services/editorWorkerService"], function (require, exports, objects_1, editorWorkerService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$tBb = void 0;
    /**
     * Create a new web worker that has model syncing capabilities built in.
     * Specify an AMD module to load that will `create` an object that will be proxied.
     */
    function $tBb(modelService, languageConfigurationService, opts) {
        return new MonacoWebWorkerImpl(modelService, languageConfigurationService, opts);
    }
    exports.$tBb = $tBb;
    class MonacoWebWorkerImpl extends editorWorkerService_1.$02 {
        constructor(modelService, languageConfigurationService, opts) {
            super(modelService, opts.keepIdleModels || false, opts.label, languageConfigurationService);
            this.y = opts.moduleId;
            this.C = opts.createData || null;
            this.z = opts.host || null;
            this.D = null;
        }
        // foreign host request
        fhr(method, args) {
            if (!this.z || typeof this.z[method] !== 'function') {
                return Promise.reject(new Error('Missing method ' + method + ' or missing main thread foreign host.'));
            }
            try {
                return Promise.resolve(this.z[method].apply(this.z, args));
            }
            catch (e) {
                return Promise.reject(e);
            }
        }
        F() {
            if (!this.D) {
                this.D = this.t().then((proxy) => {
                    const foreignHostMethods = this.z ? (0, objects_1.$6m)(this.z) : [];
                    return proxy.loadForeignModule(this.y, this.C, foreignHostMethods).then((foreignMethods) => {
                        this.C = null;
                        const proxyMethodRequest = (method, args) => {
                            return proxy.fmr(method, args);
                        };
                        const createProxyMethod = (method, proxyMethodRequest) => {
                            return function () {
                                const args = Array.prototype.slice.call(arguments, 0);
                                return proxyMethodRequest(method, args);
                            };
                        };
                        const foreignProxy = {};
                        for (const foreignMethod of foreignMethods) {
                            foreignProxy[foreignMethod] = createProxyMethod(foreignMethod, proxyMethodRequest);
                        }
                        return foreignProxy;
                    });
                });
            }
            return this.D;
        }
        getProxy() {
            return this.F();
        }
        withSyncedResources(resources) {
            return this.w(resources).then(_ => this.getProxy());
        }
    }
});
//# sourceMappingURL=webWorker.js.map