/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/objects", "vs/editor/browser/services/editorWorkerService"], function (require, exports, objects_1, editorWorkerService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createWebWorker = void 0;
    /**
     * Create a new web worker that has model syncing capabilities built in.
     * Specify an AMD module to load that will `create` an object that will be proxied.
     */
    function createWebWorker(modelService, languageConfigurationService, opts) {
        return new MonacoWebWorkerImpl(modelService, languageConfigurationService, opts);
    }
    exports.createWebWorker = createWebWorker;
    class MonacoWebWorkerImpl extends editorWorkerService_1.EditorWorkerClient {
        constructor(modelService, languageConfigurationService, opts) {
            super(modelService, opts.keepIdleModels || false, opts.label, languageConfigurationService);
            this._foreignModuleId = opts.moduleId;
            this._foreignModuleCreateData = opts.createData || null;
            this._foreignModuleHost = opts.host || null;
            this._foreignProxy = null;
        }
        // foreign host request
        fhr(method, args) {
            if (!this._foreignModuleHost || typeof this._foreignModuleHost[method] !== 'function') {
                return Promise.reject(new Error('Missing method ' + method + ' or missing main thread foreign host.'));
            }
            try {
                return Promise.resolve(this._foreignModuleHost[method].apply(this._foreignModuleHost, args));
            }
            catch (e) {
                return Promise.reject(e);
            }
        }
        _getForeignProxy() {
            if (!this._foreignProxy) {
                this._foreignProxy = this._getProxy().then((proxy) => {
                    const foreignHostMethods = this._foreignModuleHost ? (0, objects_1.getAllMethodNames)(this._foreignModuleHost) : [];
                    return proxy.loadForeignModule(this._foreignModuleId, this._foreignModuleCreateData, foreignHostMethods).then((foreignMethods) => {
                        this._foreignModuleCreateData = null;
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
            return this._foreignProxy;
        }
        getProxy() {
            return this._getForeignProxy();
        }
        withSyncedResources(resources) {
            return this._withSyncedResources(resources).then(_ => this.getProxy());
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViV29ya2VyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2Jyb3dzZXIvc2VydmljZXMvd2ViV29ya2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVFoRzs7O09BR0c7SUFDSCxTQUFnQixlQUFlLENBQW1CLFlBQTJCLEVBQUUsNEJBQTJELEVBQUUsSUFBdUI7UUFDbEssT0FBTyxJQUFJLG1CQUFtQixDQUFJLFlBQVksRUFBRSw0QkFBNEIsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNyRixDQUFDO0lBRkQsMENBRUM7SUE4Q0QsTUFBTSxtQkFBc0MsU0FBUSx3Q0FBa0I7UUFPckUsWUFBWSxZQUEyQixFQUFFLDRCQUEyRCxFQUFFLElBQXVCO1lBQzVILEtBQUssQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLGNBQWMsSUFBSSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSw0QkFBNEIsQ0FBQyxDQUFDO1lBQzVGLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQ3RDLElBQUksQ0FBQyx3QkFBd0IsR0FBRyxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQztZQUN4RCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUM7WUFDNUMsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7UUFDM0IsQ0FBQztRQUVELHVCQUF1QjtRQUNQLEdBQUcsQ0FBQyxNQUFjLEVBQUUsSUFBVztZQUM5QyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixJQUFJLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxLQUFLLFVBQVUsRUFBRTtnQkFDdEYsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLGlCQUFpQixHQUFHLE1BQU0sR0FBRyx1Q0FBdUMsQ0FBQyxDQUFDLENBQUM7YUFDdkc7WUFFRCxJQUFJO2dCQUNILE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2FBQzdGO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1gsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3pCO1FBQ0YsQ0FBQztRQUVPLGdCQUFnQjtZQUN2QixJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRTtnQkFDeEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7b0JBQ3BELE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxJQUFBLDJCQUFpQixFQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7b0JBQ3JHLE9BQU8sS0FBSyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsd0JBQXdCLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxjQUFjLEVBQUUsRUFBRTt3QkFDaEksSUFBSSxDQUFDLHdCQUF3QixHQUFHLElBQUksQ0FBQzt3QkFFckMsTUFBTSxrQkFBa0IsR0FBRyxDQUFDLE1BQWMsRUFBRSxJQUFXLEVBQWdCLEVBQUU7NEJBQ3hFLE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7d0JBQ2hDLENBQUMsQ0FBQzt3QkFFRixNQUFNLGlCQUFpQixHQUFHLENBQUMsTUFBYyxFQUFFLGtCQUFpRSxFQUFzQixFQUFFOzRCQUNuSSxPQUFPO2dDQUNOLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0NBQ3RELE9BQU8sa0JBQWtCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDOzRCQUN6QyxDQUFDLENBQUM7d0JBQ0gsQ0FBQyxDQUFDO3dCQUVGLE1BQU0sWUFBWSxHQUFHLEVBQU8sQ0FBQzt3QkFDN0IsS0FBSyxNQUFNLGFBQWEsSUFBSSxjQUFjLEVBQUU7NEJBQ3JDLFlBQWEsQ0FBQyxhQUFhLENBQUMsR0FBRyxpQkFBaUIsQ0FBQyxhQUFhLEVBQUUsa0JBQWtCLENBQUMsQ0FBQzt5QkFDMUY7d0JBRUQsT0FBTyxZQUFZLENBQUM7b0JBQ3JCLENBQUMsQ0FBQyxDQUFDO2dCQUNKLENBQUMsQ0FBQyxDQUFDO2FBQ0g7WUFDRCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDM0IsQ0FBQztRQUVNLFFBQVE7WUFDZCxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ2hDLENBQUM7UUFFTSxtQkFBbUIsQ0FBQyxTQUFnQjtZQUMxQyxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUN4RSxDQUFDO0tBQ0QifQ==