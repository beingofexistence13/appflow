/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/amd", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/uri"], function (require, exports, amd_1, network_1, platform, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.importAMDNodeModule = void 0;
    class DefineCall {
        constructor(id, dependencies, callback) {
            this.id = id;
            this.dependencies = dependencies;
            this.callback = callback;
        }
    }
    class AMDModuleImporter {
        static { this.INSTANCE = new AMDModuleImporter(); }
        constructor() {
            this._isWebWorker = (typeof self === 'object' && self.constructor && self.constructor.name === 'DedicatedWorkerGlobalScope');
            this._isRenderer = typeof document === 'object';
            this._defineCalls = [];
            this._initialized = false;
        }
        _initialize() {
            if (this._initialized) {
                return;
            }
            this._initialized = true;
            globalThis.define = (id, dependencies, callback) => {
                if (typeof id !== 'string') {
                    callback = dependencies;
                    dependencies = id;
                    id = null;
                }
                if (typeof dependencies !== 'object' || !Array.isArray(dependencies)) {
                    callback = dependencies;
                    dependencies = null;
                }
                // if (!dependencies) {
                // 	dependencies = ['require', 'exports', 'module'];
                // }
                this._defineCalls.push(new DefineCall(id, dependencies, callback));
            };
            globalThis.define.amd = true;
            if (this._isRenderer) {
                this._amdPolicy = window.trustedTypes?.createPolicy('amdLoader', {
                    createScriptURL(value) {
                        if (value.startsWith(window.location.origin)) {
                            return value;
                        }
                        if (value.startsWith('vscode-file://vscode-app')) {
                            return value;
                        }
                        throw new Error(`[trusted_script_src] Invalid script url: ${value}`);
                    }
                });
            }
            else if (this._isWebWorker) {
                this._amdPolicy = globalThis.trustedTypes?.createPolicy('amdLoader', {
                    createScriptURL(value) {
                        return value;
                    }
                });
            }
        }
        async load(scriptSrc) {
            this._initialize();
            const defineCall = await (this._isWebWorker ? this._workerLoadScript(scriptSrc) : this._isRenderer ? this._rendererLoadScript(scriptSrc) : this._nodeJSLoadScript(scriptSrc));
            if (!defineCall) {
                throw new Error(`Did not receive a define call from script ${scriptSrc}`);
            }
            // TODO require, exports, module
            if (Array.isArray(defineCall.dependencies) && defineCall.dependencies.length > 0) {
                throw new Error(`Cannot resolve dependencies for script ${scriptSrc}. The dependencies are: ${defineCall.dependencies.join(', ')}`);
            }
            if (typeof defineCall.callback === 'function') {
                return defineCall.callback([]);
            }
            else {
                return defineCall.callback;
            }
        }
        _rendererLoadScript(scriptSrc) {
            return new Promise((resolve, reject) => {
                const scriptElement = document.createElement('script');
                scriptElement.setAttribute('async', 'async');
                scriptElement.setAttribute('type', 'text/javascript');
                const unbind = () => {
                    scriptElement.removeEventListener('load', loadEventListener);
                    scriptElement.removeEventListener('error', errorEventListener);
                };
                const loadEventListener = (e) => {
                    unbind();
                    resolve(this._defineCalls.pop());
                };
                const errorEventListener = (e) => {
                    unbind();
                    reject(e);
                };
                scriptElement.addEventListener('load', loadEventListener);
                scriptElement.addEventListener('error', errorEventListener);
                if (this._amdPolicy) {
                    scriptSrc = this._amdPolicy.createScriptURL(scriptSrc);
                }
                scriptElement.setAttribute('src', scriptSrc);
                document.getElementsByTagName('head')[0].appendChild(scriptElement);
            });
        }
        _workerLoadScript(scriptSrc) {
            return new Promise((resolve, reject) => {
                try {
                    if (this._amdPolicy) {
                        scriptSrc = this._amdPolicy.createScriptURL(scriptSrc);
                    }
                    importScripts(scriptSrc);
                    resolve(this._defineCalls.pop());
                }
                catch (err) {
                    reject(err);
                }
            });
        }
        async _nodeJSLoadScript(scriptSrc) {
            try {
                const fs = globalThis._VSCODE_NODE_MODULES['fs'];
                const vm = globalThis._VSCODE_NODE_MODULES['vm'];
                const module = globalThis._VSCODE_NODE_MODULES['module'];
                const filePath = uri_1.URI.parse(scriptSrc).fsPath;
                const content = fs.readFileSync(filePath).toString();
                const scriptSource = module.wrap(content.replace(/^#!.*/, ''));
                const script = new vm.Script(scriptSource);
                const compileWrapper = script.runInThisContext();
                compileWrapper.apply();
                return this._defineCalls.pop();
            }
            catch (error) {
                throw error;
            }
        }
    }
    const cache = new Map();
    let _paths = {};
    if (typeof globalThis.require === 'object') {
        _paths = globalThis.require.paths ?? {};
    }
    /**
     * Utility for importing an AMD node module. This util supports AMD and ESM contexts and should be used while the ESM adoption
     * is on its way.
     *
     * e.g. pass in `vscode-textmate/release/main.js`
     */
    async function importAMDNodeModule(nodeModuleName, pathInsideNodeModule, isBuilt) {
        if (amd_1.isESM) {
            if (isBuilt === undefined) {
                const product = globalThis._VSCODE_PRODUCT_JSON;
                isBuilt = Boolean((product ?? globalThis.vscode?.context?.configuration()?.product)?.commit);
            }
            if (_paths[nodeModuleName]) {
                nodeModuleName = _paths[nodeModuleName];
            }
            const nodeModulePath = `${nodeModuleName}/${pathInsideNodeModule}`;
            if (cache.has(nodeModulePath)) {
                return cache.get(nodeModulePath);
            }
            let scriptSrc;
            if (/^\w[\w\d+.-]*:\/\//.test(nodeModulePath)) {
                // looks like a URL
                // bit of a special case for: src/vs/workbench/services/languageDetection/browser/languageDetectionSimpleWorker.ts
                scriptSrc = nodeModulePath;
            }
            else {
                const useASAR = (isBuilt && !platform.isWeb);
                const actualNodeModulesPath = (useASAR ? network_1.nodeModulesAsarPath : network_1.nodeModulesPath);
                const resourcePath = `${actualNodeModulesPath}/${nodeModulePath}`;
                scriptSrc = network_1.FileAccess.asBrowserUri(resourcePath).toString(true);
            }
            const result = AMDModuleImporter.INSTANCE.load(scriptSrc);
            cache.set(nodeModulePath, result);
            return result;
        }
        else {
            return await new Promise((resolve_1, reject_1) => { require([nodeModuleName], resolve_1, reject_1); });
        }
    }
    exports.importAMDNodeModule = importAMDNodeModule;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW1kWC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2FtZFgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBU2hHLE1BQU0sVUFBVTtRQUNmLFlBQ2lCLEVBQTZCLEVBQzdCLFlBQXlDLEVBQ3pDLFFBQWE7WUFGYixPQUFFLEdBQUYsRUFBRSxDQUEyQjtZQUM3QixpQkFBWSxHQUFaLFlBQVksQ0FBNkI7WUFDekMsYUFBUSxHQUFSLFFBQVEsQ0FBSztRQUMxQixDQUFDO0tBQ0w7SUFFRCxNQUFNLGlCQUFpQjtpQkFDUixhQUFRLEdBQUcsSUFBSSxpQkFBaUIsRUFBRSxBQUExQixDQUEyQjtRQVdqRDtZQVRpQixpQkFBWSxHQUFHLENBQUMsT0FBTyxJQUFJLEtBQUssUUFBUSxJQUFJLElBQUksQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEtBQUssNEJBQTRCLENBQUMsQ0FBQztZQUN4SCxnQkFBVyxHQUFHLE9BQU8sUUFBUSxLQUFLLFFBQVEsQ0FBQztZQUUzQyxpQkFBWSxHQUFpQixFQUFFLENBQUM7WUFDekMsaUJBQVksR0FBRyxLQUFLLENBQUM7UUFLYixDQUFDO1FBRVQsV0FBVztZQUNsQixJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7Z0JBQ3RCLE9BQU87YUFDUDtZQUNELElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1lBRW5CLFVBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFPLEVBQUUsWUFBaUIsRUFBRSxRQUFhLEVBQUUsRUFBRTtnQkFDeEUsSUFBSSxPQUFPLEVBQUUsS0FBSyxRQUFRLEVBQUU7b0JBQzNCLFFBQVEsR0FBRyxZQUFZLENBQUM7b0JBQ3hCLFlBQVksR0FBRyxFQUFFLENBQUM7b0JBQ2xCLEVBQUUsR0FBRyxJQUFJLENBQUM7aUJBQ1Y7Z0JBQ0QsSUFBSSxPQUFPLFlBQVksS0FBSyxRQUFRLElB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