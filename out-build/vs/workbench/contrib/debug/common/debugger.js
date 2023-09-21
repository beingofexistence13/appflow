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
define(["require", "exports", "vs/nls!vs/workbench/contrib/debug/common/debugger", "vs/base/common/types", "vs/workbench/contrib/debug/common/debug", "vs/platform/configuration/common/configuration", "vs/workbench/services/configurationResolver/common/configurationResolver", "vs/workbench/services/configurationResolver/common/configurationResolverUtils", "vs/editor/common/services/textResourceConfiguration", "vs/base/common/uri", "vs/base/common/network", "vs/workbench/contrib/debug/common/debugUtils", "vs/platform/telemetry/common/telemetryUtils", "vs/workbench/services/environment/common/environmentService", "vs/platform/contextkey/common/contextkey", "vs/base/common/objects"], function (require, exports, nls, types_1, debug_1, configuration_1, configurationResolver_1, ConfigurationResolverUtils, textResourceConfiguration_1, uri_1, network_1, debugUtils_1, telemetryUtils_1, environmentService_1, contextkey_1, objects_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$IRb = void 0;
    let $IRb = class $IRb {
        constructor(f, dbgContribution, extensionDescription, g, h, i, j, k, l) {
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.k = k;
            this.l = l;
            this.b = [];
            this.a = { type: dbgContribution.type };
            this.merge(dbgContribution, extensionDescription);
            this.d = typeof this.a.when === 'string' ? contextkey_1.$Ii.deserialize(this.a.when) : undefined;
            this.e = typeof this.a.hiddenWhen === 'string' ? contextkey_1.$Ii.deserialize(this.a.hiddenWhen) : undefined;
        }
        merge(otherDebuggerContribution, extensionDescription) {
            /**
             * Copies all properties of source into destination. The optional parameter "overwrite" allows to control
             * if existing non-structured properties on the destination should be overwritten or not. Defaults to true (overwrite).
             */
            function mixin(destination, source, overwrite, level = 0) {
                if (!(0, types_1.$lf)(destination)) {
                    return source;
                }
                if ((0, types_1.$lf)(source)) {
                    Object.keys(source).forEach(key => {
                        if (key !== '__proto__') {
                            if ((0, types_1.$lf)(destination[key]) && (0, types_1.$lf)(source[key])) {
                                mixin(destination[key], source[key], overwrite, level + 1);
                            }
                            else {
                                if (key in destination) {
                                    if (overwrite) {
                                        if (level === 0 && key === 'type') {
                                            // don't merge the 'type' property
                                        }
                                        else {
                                            destination[key] = source[key];
                                        }
                                    }
                                }
                                else {
                                    destination[key] = source[key];
                                }
                            }
                        }
                    });
                }
                return destination;
            }
            // only if not already merged
            if (this.b.indexOf(extensionDescription) < 0) {
                // remember all extensions that have been merged for this debugger
                this.b.push(extensionDescription);
                // merge new debugger contribution into existing contributions (and don't overwrite values in built-in extensions)
                mixin(this.a, otherDebuggerContribution, extensionDescription.isBuiltin);
                // remember the extension that is considered the "main" debugger contribution
                if ((0, debugUtils_1.$mF)(otherDebuggerContribution)) {
                    this.c = extensionDescription;
                }
            }
        }
        async startDebugging(configuration, parentSessionId) {
            const parentSession = this.k.getModel().getSession(parentSessionId);
            return await this.k.startDebugging(undefined, configuration, { parentSession }, undefined);
        }
        async createDebugAdapter(session) {
            await this.f.activateDebuggers('onDebugAdapterProtocolTracker', this.type);
            const da = this.f.createDebugAdapter(session);
            if (da) {
                return Promise.resolve(da);
            }
            throw new Error(nls.localize(0, null, this.type));
        }
        async substituteVariables(folder, config) {
            const substitutedConfig = await this.f.substituteVariables(this.type, folder, config);
            return await this.i.resolveWithInteractionReplace(folder, substitutedConfig, 'launch', this.variables, substitutedConfig.__configurationTarget);
        }
        runInTerminal(args, sessionId) {
            return this.f.runInTerminal(this.type, args, sessionId);
        }
        get label() {
            return this.a.label || this.a.type;
        }
        get type() {
            return this.a.type;
        }
        get variables() {
            return this.a.variables;
        }
        get configurationSnippets() {
            return this.a.configurationSnippets;
        }
        get languages() {
            return this.a.languages;
        }
        get when() {
            return this.d;
        }
        get hiddenWhen() {
            return this.e;
        }
        get enabled() {
            return !this.d || this.l.contextMatchesRules(this.d);
        }
        get isHiddenFromDropdown() {
            if (!this.e) {
                return false;
            }
            return this.l.contextMatchesRules(this.e);
        }
        get strings() {
            return this.a.strings ?? this.a.uiMessages;
        }
        interestedInLanguage(languageId) {
            return !!(this.languages && this.languages.indexOf(languageId) >= 0);
        }
        hasInitialConfiguration() {
            return !!this.a.initialConfigurations;
        }
        hasConfigurationProvider() {
            return this.k.getConfigurationManager().hasDebugConfigurationProvider(this.type);
        }
        getInitialConfigurationContent(initialConfigs) {
            // at this point we got some configs from the package.json and/or from registered DebugConfigurationProviders
            let initialConfigurations = this.a.initialConfigurations || [];
            if (initialConfigs) {
                initialConfigurations = initialConfigurations.concat(initialConfigs);
            }
            const eol = this.h.getEOL(uri_1.URI.from({ scheme: network_1.Schemas.untitled, path: '1' })) === '\r\n' ? '\r\n' : '\n';
            const configs = JSON.stringify(initialConfigurations, null, '\t').split('\n').map(line => '\t' + line).join(eol).trim();
            const comment1 = nls.localize(1, null);
            const comment2 = nls.localize(2, null);
            const comment3 = nls.localize(3, null, 'https://go.microsoft.com/fwlink/?linkid=830387');
            let content = [
                '{',
                `\t// ${comment1}`,
                `\t// ${comment2}`,
                `\t// ${comment3}`,
                `\t"version": "0.2.0",`,
                `\t"configurations": ${configs}`,
                '}'
            ].join(eol);
            // fix formatting
            const editorConfig = this.g.getValue();
            if (editorConfig.editor && editorConfig.editor.insertSpaces) {
                content = content.replace(new RegExp('\t', 'g'), ' '.repeat(editorConfig.editor.tabSize));
            }
            return Promise.resolve(content);
        }
        getMainExtensionDescriptor() {
            return this.c || this.b[0];
        }
        getCustomTelemetryEndpoint() {
            const aiKey = this.a.aiKey;
            if (!aiKey) {
                return undefined;
            }
            const sendErrorTelemtry = (0, telemetryUtils_1.$lo)(this.j.remoteAuthority) !== 'other';
            return {
                id: `${this.getMainExtensionDescriptor().publisher}.${this.type}`,
                aiKey,
                sendErrorTelemetry: sendErrorTelemtry
            };
        }
        getSchemaAttributes(definitions) {
            if (!this.a.configurationAttributes) {
                return null;
            }
            // fill in the default configuration attributes shared by all adapters.
            return Object.keys(this.a.configurationAttributes).map(request => {
                const definitionId = `${this.type}:${request}`;
                const platformSpecificDefinitionId = `${this.type}:${request}:platform`;
                const attributes = this.a.configurationAttributes[request];
                const defaultRequired = ['name', 'type', 'request'];
                attributes.required = attributes.required && attributes.required.length ? defaultRequired.concat(attributes.required) : defaultRequired;
                attributes.additionalProperties = false;
                attributes.type = 'object';
                if (!attributes.properties) {
                    attributes.properties = {};
                }
                const properties = attributes.properties;
                properties['type'] = {
                    enum: [this.type],
                    enumDescriptions: [this.label],
                    description: nls.localize(4, null),
                    pattern: '^(?!node2)',
                    deprecationMessage: this.a.deprecated || (this.enabled ? undefined : (0, debug_1.$gH)(this.type)),
                    doNotSuggest: !!this.a.deprecated,
                    errorMessage: nls.localize(5, null),
                    patternErrorMessage: nls.localize(6, null)
                };
                properties['request'] = {
                    enum: [request],
                    description: nls.localize(7, null),
                };
                for (const prop in definitions['common'].properties) {
                    properties[prop] = {
                        $ref: `#/definitions/common/properties/${prop}`
                    };
                }
                Object.keys(properties).forEach(name => {
                    // Use schema allOf property to get independent error reporting #21113
                    ConfigurationResolverUtils.$HRb(properties[name]);
                });
                definitions[definitionId] = { ...attributes };
                definitions[platformSpecificDefinitionId] = {
                    type: 'object',
                    additionalProperties: false,
                    properties: (0, objects_1.$4m)(properties, key => key !== 'type' && key !== 'request' && key !== 'name')
                };
                // Don't add the OS props to the real attributes object so they don't show up in 'definitions'
                const attributesCopy = { ...attributes };
                attributesCopy.properties = {
                    ...properties,
                    ...{
                        windows: {
                            $ref: `#/definitions/${platformSpecificDefinitionId}`,
                            description: nls.localize(8, null),
                        },
                        osx: {
                            $ref: `#/definitions/${platformSpecificDefinitionId}`,
                            description: nls.localize(9, null),
                        },
                        linux: {
                            $ref: `#/definitions/${platformSpecificDefinitionId}`,
                            description: nls.localize(10, null),
                        }
                    }
                };
                return attributesCopy;
            });
        }
    };
    exports.$IRb = $IRb;
    exports.$IRb = $IRb = __decorate([
        __param(3, configuration_1.$8h),
        __param(4, textResourceConfiguration_1.$GA),
        __param(5, configurationResolver_1.$NM),
        __param(6, environmentService_1.$hJ),
        __param(7, debug_1.$nH),
        __param(8, contextkey_1.$3i)
    ], $IRb);
});
//# sourceMappingURL=debugger.js.map