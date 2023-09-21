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
define(["require", "exports", "vs/base/common/objects", "vs/base/common/event", "vs/workbench/api/common/extHostWorkspace", "./extHost.protocol", "./extHostTypes", "vs/platform/configuration/common/configurationModels", "vs/platform/configuration/common/configurationRegistry", "vs/base/common/types", "vs/base/common/async", "vs/platform/instantiation/common/instantiation", "vs/workbench/api/common/extHostRpcService", "vs/platform/log/common/log", "vs/base/common/uri"], function (require, exports, objects_1, event_1, extHostWorkspace_1, extHost_protocol_1, extHostTypes_1, configurationModels_1, configurationRegistry_1, types_1, async_1, instantiation_1, extHostRpcService_1, log_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$mbc = exports.$lbc = exports.$kbc = void 0;
    function lookUp(tree, key) {
        if (key) {
            const parts = key.split('.');
            let node = tree;
            for (let i = 0; node && i < parts.length; i++) {
                node = node[parts[i]];
            }
            return node;
        }
    }
    function isUri(thing) {
        return thing instanceof uri_1.URI;
    }
    function isResourceLanguage(thing) {
        return thing
            && thing.uri instanceof uri_1.URI
            && (thing.languageId && typeof thing.languageId === 'string');
    }
    function isLanguage(thing) {
        return thing
            && !thing.uri
            && (thing.languageId && typeof thing.languageId === 'string');
    }
    function isWorkspaceFolder(thing) {
        return thing
            && thing.uri instanceof uri_1.URI
            && (!thing.name || typeof thing.name === 'string')
            && (!thing.index || typeof thing.index === 'number');
    }
    function scopeToOverrides(scope) {
        if (isUri(scope)) {
            return { resource: scope };
        }
        if (isResourceLanguage(scope)) {
            return { resource: scope.uri, overrideIdentifier: scope.languageId };
        }
        if (isLanguage(scope)) {
            return { overrideIdentifier: scope.languageId };
        }
        if (isWorkspaceFolder(scope)) {
            return { resource: scope.uri };
        }
        if (scope === null) {
            return { resource: null };
        }
        return undefined;
    }
    let $kbc = class $kbc {
        constructor(extHostRpc, extHostWorkspace, logService) {
            this.a = extHostRpc.getProxy(extHost_protocol_1.$1J.MainThreadConfiguration);
            this.c = extHostWorkspace;
            this.b = logService;
            this.d = new async_1.$Fg();
            this.e = null;
        }
        getConfigProvider() {
            return this.d.wait().then(_ => this.e);
        }
        $initializeConfiguration(data) {
            this.e = new $lbc(this.a, this.c, data, this.b);
            this.d.open();
        }
        $acceptConfigurationChanged(data, change) {
            this.getConfigProvider().then(provider => provider.$acceptConfigurationChanged(data, change));
        }
    };
    exports.$kbc = $kbc;
    exports.$kbc = $kbc = __decorate([
        __param(0, extHostRpcService_1.$2L),
        __param(1, extHostWorkspace_1.$jbc),
        __param(2, log_1.$5i)
    ], $kbc);
    class $lbc {
        constructor(proxy, extHostWorkspace, data, logService) {
            this.a = new event_1.$fd();
            this.b = proxy;
            this.f = logService;
            this.c = extHostWorkspace;
            this.e = configurationModels_1.$tn.parse(data);
            this.d = this.k(data.configurationScopes);
        }
        get onDidChangeConfiguration() {
            return this.a && this.a.event;
        }
        $acceptConfigurationChanged(data, change) {
            const previous = { data: this.e.toData(), workspace: this.c.workspace };
            this.e = configurationModels_1.$tn.parse(data);
            this.d = this.k(data.configurationScopes);
            this.a.fire(this.j(change, previous));
        }
        getConfiguration(section, scope, extensionDescription) {
            const overrides = scopeToOverrides(scope) || {};
            const config = this.g(section
                ? lookUp(this.e.getValue(undefined, overrides, this.c.workspace), section)
                : this.e.getValue(undefined, overrides, this.c.workspace));
            if (section) {
                this.h(section, overrides, extensionDescription?.identifier);
            }
            function parseConfigurationTarget(arg) {
                if (arg === undefined || arg === null) {
                    return null;
                }
                if (typeof arg === 'boolean') {
                    return arg ? 2 /* ConfigurationTarget.USER */ : 5 /* ConfigurationTarget.WORKSPACE */;
                }
                switch (arg) {
                    case extHostTypes_1.ConfigurationTarget.Global: return 2 /* ConfigurationTarget.USER */;
                    case extHostTypes_1.ConfigurationTarget.Workspace: return 5 /* ConfigurationTarget.WORKSPACE */;
                    case extHostTypes_1.ConfigurationTarget.WorkspaceFolder: return 6 /* ConfigurationTarget.WORKSPACE_FOLDER */;
                }
            }
            const result = {
                has(key) {
                    return typeof lookUp(config, key) !== 'undefined';
                },
                get: (key, defaultValue) => {
                    this.h(section ? `${section}.${key}` : key, overrides, extensionDescription?.identifier);
                    let result = lookUp(config, key);
                    if (typeof result === 'undefined') {
                        result = defaultValue;
                    }
                    else {
                        let clonedConfig = undefined;
                        const cloneOnWriteProxy = (target, accessor) => {
                            if ((0, types_1.$lf)(target)) {
                                let clonedTarget = undefined;
                                const cloneTarget = () => {
                                    clonedConfig = clonedConfig ? clonedConfig : (0, objects_1.$Vm)(config);
                                    clonedTarget = clonedTarget ? clonedTarget : lookUp(clonedConfig, accessor);
                                };
                                return new Proxy(target, {
                                    get: (target, property) => {
                                        if (typeof property === 'string' && property.toLowerCase() === 'tojson') {
                                            cloneTarget();
                                            return () => clonedTarget;
                                        }
                                        if (clonedConfig) {
                                            clonedTarget = clonedTarget ? clonedTarget : lookUp(clonedConfig, accessor);
                                            return clonedTarget[property];
                                        }
                                        const result = target[property];
                                        if (typeof property === 'string') {
                                            return cloneOnWriteProxy(result, `${accessor}.${property}`);
                                        }
                                        return result;
                                    },
                                    set: (_target, property, value) => {
                                        cloneTarget();
                                        if (clonedTarget) {
                                            clonedTarget[property] = value;
                                        }
                                        return true;
                                    },
                                    deleteProperty: (_target, property) => {
                                        cloneTarget();
                                        if (clonedTarget) {
                                            delete clonedTarget[property];
                                        }
                                        return true;
                                    },
                                    defineProperty: (_target, property, descriptor) => {
                                        cloneTarget();
                                        if (clonedTarget) {
                                            Object.defineProperty(clonedTarget, property, descriptor);
                                        }
                                        return true;
                                    }
                                });
                            }
                            if (Array.isArray(target)) {
                                return (0, objects_1.$Vm)(target);
                            }
                            return target;
                        };
                        result = cloneOnWriteProxy(result, key);
                    }
                    return result;
                },
                update: (key, value, extHostConfigurationTarget, scopeToLanguage) => {
                    key = section ? `${section}.${key}` : key;
                    const target = parseConfigurationTarget(extHostConfigurationTarget);
                    if (value !== undefined) {
                        return this.b.$updateConfigurationOption(target, key, value, overrides, scopeToLanguage);
                    }
                    else {
                        return this.b.$removeConfigurationOption(target, key, overrides, scopeToLanguage);
                    }
                },
                inspect: (key) => {
                    key = section ? `${section}.${key}` : key;
                    const config = this.e.inspect(key, overrides, this.c.workspace);
                    if (config) {
                        return {
                            key,
                            defaultValue: (0, objects_1.$Vm)(config.policy?.value ?? config.default?.value),
                            globalValue: (0, objects_1.$Vm)(config.user?.value ?? config.application?.value),
                            workspaceValue: (0, objects_1.$Vm)(config.workspace?.value),
                            workspaceFolderValue: (0, objects_1.$Vm)(config.workspaceFolder?.value),
                            defaultLanguageValue: (0, objects_1.$Vm)(config.default?.override),
                            globalLanguageValue: (0, objects_1.$Vm)(config.user?.override ?? config.application?.override),
                            workspaceLanguageValue: (0, objects_1.$Vm)(config.workspace?.override),
                            workspaceFolderLanguageValue: (0, objects_1.$Vm)(config.workspaceFolder?.override),
                            languageIds: (0, objects_1.$Vm)(config.overrideIdentifiers)
                        };
                    }
                    return undefined;
                }
            };
            if (typeof config === 'object') {
                (0, objects_1.$Ym)(result, config, false);
            }
            return Object.freeze(result);
        }
        g(result) {
            const readonlyProxy = (target) => {
                return (0, types_1.$lf)(target) ?
                    new Proxy(target, {
                        get: (target, property) => readonlyProxy(target[property]),
                        set: (_target, property, _value) => { throw new Error(`TypeError: Cannot assign to read only property '${String(property)}' of object`); },
                        deleteProperty: (_target, property) => { throw new Error(`TypeError: Cannot delete read only property '${String(property)}' of object`); },
                        defineProperty: (_target, property) => { throw new Error(`TypeError: Cannot define property '${String(property)}' for a readonly object`); },
                        setPrototypeOf: (_target) => { throw new Error(`TypeError: Cannot set prototype for a readonly object`); },
                        isExtensible: () => false,
                        preventExtensions: () => true
                    }) : target;
            };
            return readonlyProxy(result);
        }
        h(key, overrides, extensionId) {
            const scope = configurationRegistry_1.$kn.test(key) ? 4 /* ConfigurationScope.RESOURCE */ : this.d.get(key);
            const extensionIdText = extensionId ? `[${extensionId.value}] ` : '';
            if (4 /* ConfigurationScope.RESOURCE */ === scope) {
                if (typeof overrides?.resource === 'undefined') {
                    this.f.warn(`${extensionIdText}Accessing a resource scoped configuration without providing a resource is not expected. To get the effective value for '${key}', provide the URI of a resource or 'null' for any resource.`);
                }
                return;
            }
            if (3 /* ConfigurationScope.WINDOW */ === scope) {
                if (overrides?.resource) {
                    this.f.warn(`${extensionIdText}Accessing a window scoped configuration for a resource is not expected. To associate '${key}' to a resource, define its scope to 'resource' in configuration contributions in 'package.json'.`);
                }
                return;
            }
        }
        j(change, previous) {
            const event = new configurationModels_1.$vn(change, previous, this.e, this.c.workspace);
            return Object.freeze({
                affectsConfiguration: (section, scope) => event.affectsConfiguration(section, scopeToOverrides(scope))
            });
        }
        k(scopes) {
            return scopes.reduce((result, scope) => { result.set(scope[0], scope[1]); return result; }, new Map());
        }
    }
    exports.$lbc = $lbc;
    exports.$mbc = (0, instantiation_1.$Bh)('IExtHostConfiguration');
});
//# sourceMappingURL=extHostConfiguration.js.map