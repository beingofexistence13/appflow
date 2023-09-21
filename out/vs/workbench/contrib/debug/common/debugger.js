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
define(["require", "exports", "vs/nls", "vs/base/common/types", "vs/workbench/contrib/debug/common/debug", "vs/platform/configuration/common/configuration", "vs/workbench/services/configurationResolver/common/configurationResolver", "vs/workbench/services/configurationResolver/common/configurationResolverUtils", "vs/editor/common/services/textResourceConfiguration", "vs/base/common/uri", "vs/base/common/network", "vs/workbench/contrib/debug/common/debugUtils", "vs/platform/telemetry/common/telemetryUtils", "vs/workbench/services/environment/common/environmentService", "vs/platform/contextkey/common/contextkey", "vs/base/common/objects"], function (require, exports, nls, types_1, debug_1, configuration_1, configurationResolver_1, ConfigurationResolverUtils, textResourceConfiguration_1, uri_1, network_1, debugUtils_1, telemetryUtils_1, environmentService_1, contextkey_1, objects_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Debugger = void 0;
    let Debugger = class Debugger {
        constructor(adapterManager, dbgContribution, extensionDescription, configurationService, resourcePropertiesService, configurationResolverService, environmentService, debugService, contextKeyService) {
            this.adapterManager = adapterManager;
            this.configurationService = configurationService;
            this.resourcePropertiesService = resourcePropertiesService;
            this.configurationResolverService = configurationResolverService;
            this.environmentService = environmentService;
            this.debugService = debugService;
            this.contextKeyService = contextKeyService;
            this.mergedExtensionDescriptions = [];
            this.debuggerContribution = { type: dbgContribution.type };
            this.merge(dbgContribution, extensionDescription);
            this.debuggerWhen = typeof this.debuggerContribution.when === 'string' ? contextkey_1.ContextKeyExpr.deserialize(this.debuggerContribution.when) : undefined;
            this.debuggerHiddenWhen = typeof this.debuggerContribution.hiddenWhen === 'string' ? contextkey_1.ContextKeyExpr.deserialize(this.debuggerContribution.hiddenWhen) : undefined;
        }
        merge(otherDebuggerContribution, extensionDescription) {
            /**
             * Copies all properties of source into destination. The optional parameter "overwrite" allows to control
             * if existing non-structured properties on the destination should be overwritten or not. Defaults to true (overwrite).
             */
            function mixin(destination, source, overwrite, level = 0) {
                if (!(0, types_1.isObject)(destination)) {
                    return source;
                }
                if ((0, types_1.isObject)(source)) {
                    Object.keys(source).forEach(key => {
                        if (key !== '__proto__') {
                            if ((0, types_1.isObject)(destination[key]) && (0, types_1.isObject)(source[key])) {
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
            if (this.mergedExtensionDescriptions.indexOf(extensionDescription) < 0) {
                // remember all extensions that have been merged for this debugger
                this.mergedExtensionDescriptions.push(extensionDescription);
                // merge new debugger contribution into existing contributions (and don't overwrite values in built-in extensions)
                mixin(this.debuggerContribution, otherDebuggerContribution, extensionDescription.isBuiltin);
                // remember the extension that is considered the "main" debugger contribution
                if ((0, debugUtils_1.isDebuggerMainContribution)(otherDebuggerContribution)) {
                    this.mainExtensionDescription = extensionDescription;
                }
            }
        }
        async startDebugging(configuration, parentSessionId) {
            const parentSession = this.debugService.getModel().getSession(parentSessionId);
            return await this.debugService.startDebugging(undefined, configuration, { parentSession }, undefined);
        }
        async createDebugAdapter(session) {
            await this.adapterManager.activateDebuggers('onDebugAdapterProtocolTracker', this.type);
            const da = this.adapterManager.createDebugAdapter(session);
            if (da) {
                return Promise.resolve(da);
            }
            throw new Error(nls.localize('cannot.find.da', "Cannot find debug adapter for type '{0}'.", this.type));
        }
        async substituteVariables(folder, config) {
            const substitutedConfig = await this.adapterManager.substituteVariables(this.type, folder, config);
            return await this.configurationResolverService.resolveWithInteractionReplace(folder, substitutedConfig, 'launch', this.variables, substitutedConfig.__configurationTarget);
        }
        runInTerminal(args, sessionId) {
            return this.adapterManager.runInTerminal(this.type, args, sessionId);
        }
        get label() {
            return this.debuggerContribution.label || this.debuggerContribution.type;
        }
        get type() {
            return this.debuggerContribution.type;
        }
        get variables() {
            return this.debuggerContribution.variables;
        }
        get configurationSnippets() {
            return this.debuggerContribution.configurationSnippets;
        }
        get languages() {
            return this.debuggerContribution.languages;
        }
        get when() {
            return this.debuggerWhen;
        }
        get hiddenWhen() {
            return this.debuggerHiddenWhen;
        }
        get enabled() {
            return !this.debuggerWhen || this.contextKeyService.contextMatchesRules(this.debuggerWhen);
        }
        get isHiddenFromDropdown() {
            if (!this.debuggerHiddenWhen) {
                return false;
            }
            return this.contextKeyService.contextMatchesRules(this.debuggerHiddenWhen);
        }
        get strings() {
            return this.debuggerContribution.strings ?? this.debuggerContribution.uiMessages;
        }
        interestedInLanguage(languageId) {
            return !!(this.languages && this.languages.indexOf(languageId) >= 0);
        }
        hasInitialConfiguration() {
            return !!this.debuggerContribution.initialConfigurations;
        }
        hasConfigurationProvider() {
            return this.debugService.getConfigurationManager().hasDebugConfigurationProvider(this.type);
        }
        getInitialConfigurationContent(initialConfigs) {
            // at this point we got some configs from the package.json and/or from registered DebugConfigurationProviders
            let initialConfigurations = this.debuggerContribution.initialConfigurations || [];
            if (initialConfigs) {
                initialConfigurations = initialConfigurations.concat(initialConfigs);
            }
            const eol = this.resourcePropertiesService.getEOL(uri_1.URI.from({ scheme: network_1.Schemas.untitled, path: '1' })) === '\r\n' ? '\r\n' : '\n';
            const configs = JSON.stringify(initialConfigurations, null, '\t').split('\n').map(line => '\t' + line).join(eol).trim();
            const comment1 = nls.localize('launch.config.comment1', "Use IntelliSense to learn about possible attributes.");
            const comment2 = nls.localize('launch.config.comment2', "Hover to view descriptions of existing attributes.");
            const comment3 = nls.localize('launch.config.comment3', "For more information, visit: {0}", 'https://go.microsoft.com/fwlink/?linkid=830387');
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
            const editorConfig = this.configurationService.getValue();
            if (editorConfig.editor && editorConfig.editor.insertSpaces) {
                content = content.replace(new RegExp('\t', 'g'), ' '.repeat(editorConfig.editor.tabSize));
            }
            return Promise.resolve(content);
        }
        getMainExtensionDescriptor() {
            return this.mainExtensionDescription || this.mergedExtensionDescriptions[0];
        }
        getCustomTelemetryEndpoint() {
            const aiKey = this.debuggerContribution.aiKey;
            if (!aiKey) {
                return undefined;
            }
            const sendErrorTelemtry = (0, telemetryUtils_1.cleanRemoteAuthority)(this.environmentService.remoteAuthority) !== 'other';
            return {
                id: `${this.getMainExtensionDescriptor().publisher}.${this.type}`,
                aiKey,
                sendErrorTelemetry: sendErrorTelemtry
            };
        }
        getSchemaAttributes(definitions) {
            if (!this.debuggerContribution.configurationAttributes) {
                return null;
            }
            // fill in the default configuration attributes shared by all adapters.
            return Object.keys(this.debuggerContribution.configurationAttributes).map(request => {
                const definitionId = `${this.type}:${request}`;
                const platformSpecificDefinitionId = `${this.type}:${request}:platform`;
                const attributes = this.debuggerContribution.configurationAttributes[request];
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
                    description: nls.localize('debugType', "Type of configuration."),
                    pattern: '^(?!node2)',
                    deprecationMessage: this.debuggerContribution.deprecated || (this.enabled ? undefined : (0, debug_1.debuggerDisabledMessage)(this.type)),
                    doNotSuggest: !!this.debuggerContribution.deprecated,
                    errorMessage: nls.localize('debugTypeNotRecognised', "The debug type is not recognized. Make sure that you have a corresponding debug extension installed and that it is enabled."),
                    patternErrorMessage: nls.localize('node2NotSupported', "\"node2\" is no longer supported, use \"node\" instead and set the \"protocol\" attribute to \"inspector\".")
                };
                properties['request'] = {
                    enum: [request],
                    description: nls.localize('debugRequest', "Request type of configuration. Can be \"launch\" or \"attach\"."),
                };
                for (const prop in definitions['common'].properties) {
                    properties[prop] = {
                        $ref: `#/definitions/common/properties/${prop}`
                    };
                }
                Object.keys(properties).forEach(name => {
                    // Use schema allOf property to get independent error reporting #21113
                    ConfigurationResolverUtils.applyDeprecatedVariableMessage(properties[name]);
                });
                definitions[definitionId] = { ...attributes };
                definitions[platformSpecificDefinitionId] = {
                    type: 'object',
                    additionalProperties: false,
                    properties: (0, objects_1.filter)(properties, key => key !== 'type' && key !== 'request' && key !== 'name')
                };
                // Don't add the OS props to the real attributes object so they don't show up in 'definitions'
                const attributesCopy = { ...attributes };
                attributesCopy.properties = {
                    ...properties,
                    ...{
                        windows: {
                            $ref: `#/definitions/${platformSpecificDefinitionId}`,
                            description: nls.localize('debugWindowsConfiguration', "Windows specific launch configuration attributes."),
                        },
                        osx: {
                            $ref: `#/definitions/${platformSpecificDefinitionId}`,
                            description: nls.localize('debugOSXConfiguration', "OS X specific launch configuration attributes."),
                        },
                        linux: {
                            $ref: `#/definitions/${platformSpecificDefinitionId}`,
                            description: nls.localize('debugLinuxConfiguration', "Linux specific launch configuration attributes."),
                        }
                    }
                };
                return attributesCopy;
            });
        }
    };
    exports.Debugger = Debugger;
    exports.Debugger = Debugger = __decorate([
        __param(3, configuration_1.IConfigurationService),
        __param(4, textResourceConfiguration_1.ITextResourcePropertiesService),
        __param(5, configurationResolver_1.IConfigurationResolverService),
        __param(6, environmentService_1.IWorkbenchEnvironmentService),
        __param(7, debug_1.IDebugService),
        __param(8, contextkey_1.IContextKeyService)
    ], Debugger);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdnZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9kZWJ1Zy9jb21tb24vZGVidWdnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBcUJ6RixJQUFNLFFBQVEsR0FBZCxNQUFNLFFBQVE7UUFTcEIsWUFDUyxjQUErQixFQUN2QyxlQUFzQyxFQUN0QyxvQkFBMkMsRUFDcEIsb0JBQTRELEVBQ25ELHlCQUEwRSxFQUMzRSw0QkFBNEUsRUFDN0Usa0JBQWlFLEVBQ2hGLFlBQTRDLEVBQ3ZDLGlCQUFzRDtZQVJsRSxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFHQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ2xDLDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBZ0M7WUFDMUQsaUNBQTRCLEdBQTVCLDRCQUE0QixDQUErQjtZQUM1RCx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQThCO1lBQy9ELGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQ3RCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFmbkUsZ0NBQTJCLEdBQTRCLEVBQUUsQ0FBQztZQWlCakUsSUFBSSxDQUFDLG9CQUFvQixHQUFHLEVBQUUsSUFBSSxFQUFFLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUMzRCxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBRWxELElBQUksQ0FBQyxZQUFZLEdBQUcsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsMkJBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFDaEosSUFBSSxDQUFDLGtCQUFrQixHQUFHLE9BQU8s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