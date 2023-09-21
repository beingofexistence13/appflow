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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/severity", "vs/base/common/strings", "vs/editor/browser/editorBrowser", "vs/editor/common/languages/language", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/instantiation", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/quickinput/common/quickInput", "vs/platform/registry/common/platform", "vs/workbench/contrib/debug/common/breakpoints", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugger", "vs/workbench/contrib/debug/common/debugSchemas", "vs/workbench/contrib/tasks/common/taskDefinitionRegistry", "vs/workbench/services/configuration/common/configuration", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/lifecycle/common/lifecycle"], function (require, exports, event_1, lifecycle_1, severity_1, strings, editorBrowser_1, language_1, nls, commands_1, configuration_1, contextkey_1, dialogs_1, instantiation_1, jsonContributionRegistry_1, quickInput_1, platform_1, breakpoints_1, debug_1, debugger_1, debugSchemas_1, taskDefinitionRegistry_1, configuration_2, editorService_1, extensions_1, lifecycle_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AdapterManager = void 0;
    const jsonRegistry = platform_1.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
    let AdapterManager = class AdapterManager extends lifecycle_1.Disposable {
        constructor(delegate, editorService, configurationService, quickInputService, instantiationService, commandService, extensionService, contextKeyService, languageService, dialogService, lifecycleService) {
            super();
            this.editorService = editorService;
            this.configurationService = configurationService;
            this.quickInputService = quickInputService;
            this.instantiationService = instantiationService;
            this.commandService = commandService;
            this.extensionService = extensionService;
            this.contextKeyService = contextKeyService;
            this.languageService = languageService;
            this.dialogService = dialogService;
            this.lifecycleService = lifecycleService;
            this.debugAdapterFactories = new Map();
            this._onDidRegisterDebugger = new event_1.Emitter();
            this._onDidDebuggersExtPointRead = new event_1.Emitter();
            this.breakpointContributions = [];
            this.debuggerWhenKeys = new Set();
            this.usedDebugTypes = new Set();
            this.adapterDescriptorFactories = [];
            this.debuggers = [];
            this.registerListeners();
            this.contextKeyService.bufferChangeEvents(() => {
                this.debuggersAvailable = debug_1.CONTEXT_DEBUGGERS_AVAILABLE.bindTo(contextKeyService);
                this.debugExtensionsAvailable = debug_1.CONTEXT_DEBUG_EXTENSION_AVAILABLE.bindTo(contextKeyService);
            });
            this._register(this.contextKeyService.onDidChangeContext(e => {
                if (e.affectsSome(this.debuggerWhenKeys)) {
                    this.debuggersAvailable.set(this.hasEnabledDebuggers());
                    this.updateDebugAdapterSchema();
                }
            }));
            this._register(this.onDidDebuggersExtPointRead(() => {
                this.debugExtensionsAvailable.set(this.debuggers.length > 0);
            }));
            this.lifecycleService.when(4 /* LifecyclePhase.Eventually */)
                .then(() => this.debugExtensionsAvailable.set(this.debuggers.length > 0)); // If no extensions with a debugger contribution are loaded
            this._register(delegate.onDidNewSession(s => {
                this.usedDebugTypes.add(s.configuration.type);
            }));
        }
        registerListeners() {
            debugSchemas_1.debuggersExtPoint.setHandler((extensions, delta) => {
                delta.added.forEach(added => {
                    added.value.forEach(rawAdapter => {
                        if (!rawAdapter.type || (typeof rawAdapter.type !== 'string')) {
                            added.collector.error(nls.localize('debugNoType', "Debugger 'type' can not be omitted and must be of type 'string'."));
                        }
                        if (rawAdapter.type !== '*') {
                            const existing = this.getDebugger(rawAdapter.type);
                            if (existing) {
                                existing.merge(rawAdapter, added.description);
                            }
                            else {
                                const dbg = this.instantiationService.createInstance(debugger_1.Debugger, this, rawAdapter, added.description);
                                dbg.when?.keys().forEach(key => this.debuggerWhenKeys.add(key));
                                this.debuggers.push(dbg);
                            }
                        }
                    });
                });
                // take care of all wildcard contributions
                extensions.forEach(extension => {
                    extension.value.forEach(rawAdapter => {
                        if (rawAdapter.type === '*') {
                            this.debuggers.forEach(dbg => dbg.merge(rawAdapter, extension.description));
                        }
                    });
                });
                delta.removed.forEach(removed => {
                    const removedTypes = removed.value.map(rawAdapter => rawAdapter.type);
                    this.debuggers = this.debuggers.filter(d => removedTypes.indexOf(d.type) === -1);
                });
                this.updateDebugAdapterSchema();
                this._onDidDebuggersExtPointRead.fire();
            });
            debugSchemas_1.breakpointsExtPoint.setHandler(extensions => {
                this.breakpointContributions = extensions.flatMap(ext => ext.value.map(breakpoint => this.instantiationService.createInstance(breakpoints_1.Breakpoints, breakpoint)));
            });
        }
        updateDebugAdapterSchema() {
            // update the schema to include all attributes, snippets and types from extensions.
            const items = debugSchemas_1.launchSchema.properties['configurations'].items;
            const taskSchema = taskDefinitionRegistry_1.TaskDefinitionRegistry.getJsonSchema();
            const definitions = {
                'common': {
                    properties: {
                        'name': {
                            type: 'string',
                            description: nls.localize('debugName', "Name of configuration; appears in the launch configuration dropdown menu."),
                            default: 'Launch'
                        },
                        'debugServer': {
                            type: 'number',
                            description: nls.localize('debugServer', "For debug extension development only: if a port is specified VS Code tries to connect to a debug adapter running in server mode"),
                            default: 4711
                        },
                        'preLaunchTask': {
                            anyOf: [taskSchema, {
                                    type: ['string']
                                }],
                            default: '',
                            defaultSnippets: [{ body: { task: '', type: '' } }],
                            description: nls.localize('debugPrelaunchTask', "Task to run before debug session starts.")
                        },
                        'postDebugTask': {
                            anyOf: [taskSchema, {
                                    type: ['string'],
                                }],
                            default: '',
                            defaultSnippets: [{ body: { task: '', type: '' } }],
                            description: nls.localize('debugPostDebugTask', "Task to run after debug session ends.")
                        },
                        'presentation': debugSchemas_1.presentationSchema,
                        'internalConsoleOptions': debug_1.INTERNAL_CONSOLE_OPTIONS_SCHEMA,
                        'suppressMultipleSessionWarning': {
                            type: 'boolean',
                            description: nls.localize('suppressMultipleSessionWarning', "Disable the warning when trying to start the same debug configuration more than once."),
                            default: true
                        }
                    }
                }
            };
            debugSchemas_1.launchSchema.definitions = definitions;
            items.oneOf = [];
            items.defaultSnippets = [];
            this.debuggers.forEach(adapter => {
                const schemaAttributes = adapter.getSchemaAttributes(definitions);
                if (schemaAttributes && items.oneOf) {
                    items.oneOf.push(...schemaAttributes);
                }
                const configurationSnippets = adapter.configurationSnippets;
                if (configurationSnippets && items.defaultSnippets) {
                    items.defaultSnippets.push(...configurationSnippets);
                }
            });
            jsonRegistry.registerSchema(configuration_2.launchSchemaId, debugSchemas_1.launchSchema);
        }
        registerDebugAdapterFactory(debugTypes, debugAdapterLauncher) {
            debugTypes.forEach(debugType => this.debugAdapterFactories.set(debugType, debugAdapterLauncher));
            this.debuggersAvailable.set(this.hasEnabledDebuggers());
            this._onDidRegisterDebugger.fire();
            return {
                dispose: () => {
                    debugTypes.forEach(debugType => this.debugAdapterFactories.delete(debugType));
                }
            };
        }
        hasEnabledDebuggers() {
            for (const [type] of this.debugAdapterFactories) {
                const dbg = this.getDebugger(type);
                if (dbg && dbg.enabled) {
                    return true;
                }
            }
            return false;
        }
        createDebugAdapter(session) {
            const factory = this.debugAdapterFactories.get(session.configuration.type);
            if (factory) {
                return factory.createDebugAdapter(session);
            }
            return undefined;
        }
        substituteVariables(debugType, folder, config) {
            const factory = this.debugAdapterFactories.get(debugType);
            if (factory) {
                return factory.substituteVariables(folder, config);
            }
            return Promise.resolve(config);
        }
        runInTerminal(debugType, args, sessionId) {
            const factory = this.debugAdapterFactories.get(debugType);
            if (factory) {
                return factory.runInTerminal(args, sessionId);
            }
            return Promise.resolve(void 0);
        }
        registerDebugAdapterDescriptorFactory(debugAdapterProvider) {
            this.adapterDescriptorFactories.push(debugAdapterProvider);
            return {
                dispose: () => {
                    this.unregisterDebugAdapterDescriptorFactory(debugAdapterProvider);
                }
            };
        }
        unregisterDebugAdapterDescriptorFactory(debugAdapterProvider) {
            const ix = this.adapterDescriptorFactories.indexOf(debugAdapterProvider);
            if (ix >= 0) {
                this.adapterDescriptorFactories.splice(ix, 1);
            }
        }
        getDebugAdapterDescriptor(session) {
            const config = session.configuration;
            const providers = this.adapterDescriptorFactories.filter(p => p.type === config.type && p.createDebugAdapterDescriptor);
            if (providers.length === 1) {
                return providers[0].createDebugAdapterDescriptor(session);
            }
            else {
                // TODO@AW handle n > 1 case
            }
            return Promise.resolve(undefined);
        }
        getDebuggerLabel(type) {
            const dbgr = this.getDebugger(type);
            if (dbgr) {
                return dbgr.label;
            }
            return undefined;
        }
        get onDidRegisterDebugger() {
            return this._onDidRegisterDebugger.event;
        }
        get onDidDebuggersExtPointRead() {
            return this._onDidDebuggersExtPointRead.event;
        }
        canSetBreakpointsIn(model) {
            const languageId = model.getLanguageId();
            if (!languageId || languageId === 'jsonc' || languageId === 'log') {
                // do not allow breakpoints in our settings files and output
                return false;
            }
            if (this.configurationService.getValue('debug').allowBreakpointsEverywhere) {
                return true;
            }
            return this.breakpointContributions.some(breakpoints => breakpoints.language === languageId && breakpoints.enabled);
        }
        getDebugger(type) {
            return this.debuggers.find(dbg => strings.equalsIgnoreCase(dbg.type, type));
        }
        getEnabledDebugger(type) {
            const adapter = this.getDebugger(type);
            return adapter && adapter.enabled ? adapter : undefined;
        }
        someDebuggerInterestedInLanguage(languageId) {
            return !!this.debuggers
                .filter(d => d.enabled)
                .find(a => a.interestedInLanguage(languageId));
        }
        async guessDebugger(gettingConfigurations) {
            const activeTextEditorControl = this.editorService.activeTextEditorControl;
            let candidates = [];
            let languageLabel = null;
            let model = null;
            if ((0, editorBrowser_1.isCodeEditor)(activeTextEditorControl)) {
                model = activeTextEditorControl.getModel();
                const language = model ? model.getLanguageId() : undefined;
                if (language) {
                    languageLabel = this.languageService.getLanguageName(language);
                }
                const adapters = this.debuggers
                    .filter(a => a.enabled)
                    .filter(a => language && a.interestedInLanguage(language));
                if (adapters.length === 1) {
                    return adapters[0];
                }
                if (adapters.length > 1) {
                    candidates = adapters;
                }
            }
            // We want to get the debuggers that have configuration providers in the case we are fetching configurations
            // Or if a breakpoint can be set in the current file (good hint that an extension can handle it)
            if ((!languageLabel || gettingConfigurations || (model && this.canSetBreakpointsIn(model))) && candidates.length === 0) {
                await this.activateDebuggers('onDebugInitialConfigurations');
                candidates = this.debuggers
                    .filter(a => a.enabled)
                    .filter(dbg => dbg.hasInitialConfiguration() || dbg.hasConfigurationProvider());
            }
            if (candidates.length === 0 && languageLabel) {
                if (languageLabel.indexOf(' ') >= 0) {
                    languageLabel = `'${languageLabel}'`;
                }
                const { confirmed } = await this.dialogService.confirm({
                    type: severity_1.default.Warning,
                    message: nls.localize('CouldNotFindLanguage', "You don't have an extension for debugging {0}. Should we find a {0} extension in the Marketplace?", languageLabel),
                    primaryButton: nls.localize({ key: 'findExtension', comment: ['&& denotes a mnemonic'] }, "&&Find {0} extension", languageLabel)
                });
                if (confirmed) {
                    await this.commandService.executeCommand('debug.installAdditionalDebuggers', languageLabel);
                }
                return undefined;
            }
            this.initExtensionActivationsIfNeeded();
            candidates.sort((first, second) => first.label.localeCompare(second.label));
            candidates = candidates.filter(a => !a.isHiddenFromDropdown);
            const suggestedCandidates = [];
            const otherCandidates = [];
            candidates.forEach(d => {
                const descriptor = d.getMainExtensionDescriptor();
                if (descriptor.id && !!this.earlyActivatedExtensions?.has(descriptor.id)) {
                    // Was activated early
                    suggestedCandidates.push(d);
                }
                else if (this.usedDebugTypes.has(d.type)) {
                    // Was used already
                    suggestedCandidates.push(d);
                }
                else {
                    otherCandidates.push(d);
                }
            });
            const picks = [];
            if (suggestedCandidates.length > 0) {
                picks.push({ type: 'separator', label: nls.localize('suggestedDebuggers', "Suggested") }, ...suggestedCandidates.map(c => ({ label: c.label, debugger: c })));
            }
            if (otherCandidates.length > 0) {
                if (picks.length > 0) {
                    picks.push({ type: 'separator', label: '' });
                }
                picks.push(...otherCandidates.map(c => ({ label: c.label, debugger: c })));
            }
            picks.push({ type: 'separator', label: '' }, { label: languageLabel ? nls.localize('installLanguage', "Install an extension for {0}...", languageLabel) : nls.localize('installExt', "Install extension...") });
            const placeHolder = nls.localize('selectDebug', "Select debugger");
            return this.quickInputService.pick(picks, { activeItem: picks[0], placeHolder })
                .then(picked => {
                if (picked && picked.debugger) {
                    return picked.debugger;
                }
                if (picked) {
                    this.commandService.executeCommand('debug.installAdditionalDebuggers', languageLabel);
                }
                return undefined;
            });
        }
        initExtensionActivationsIfNeeded() {
            if (!this.earlyActivatedExtensions) {
                this.earlyActivatedExtensions = new Set();
                const status = this.extensionService.getExtensionsStatus();
                for (const id in status) {
                    if (!!status[id].activationTimes) {
                        this.earlyActivatedExtensions.add(id);
                    }
                }
            }
        }
        async activateDebuggers(activationEvent, debugType) {
            this.initExtensionActivationsIfNeeded();
            const promises = [
                this.extensionService.activateByEvent(activationEvent),
                this.extensionService.activateByEvent('onDebug')
            ];
            if (debugType) {
                promises.push(this.extensionService.activateByEvent(`${activationEvent}:${debugType}`));
            }
            await Promise.all(promises);
        }
    };
    exports.AdapterManager = AdapterManager;
    exports.AdapterManager = AdapterManager = __decorate([
        __param(1, editorService_1.IEditorService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, quickInput_1.IQuickInputService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, commands_1.ICommandService),
        __param(6, extensions_1.IExtensionService),
        __param(7, contextkey_1.IContextKeyService),
        __param(8, language_1.ILanguageService),
        __param(9, dialogs_1.IDialogService),
        __param(10, lifecycle_2.ILifecycleService)
    ], AdapterManager);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdBZGFwdGVyTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2RlYnVnL2Jyb3dzZXIvZGVidWdBZGFwdGVyTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUErQmhHLE1BQU0sWUFBWSxHQUFHLG1CQUFRLENBQUMsRUFBRSxDQUE0QixxQ0FBYyxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFNdEYsSUFBTSxjQUFjLEdBQXBCLE1BQU0sY0FBZSxTQUFRLHNCQUFVO1FBaUI3QyxZQUNDLFFBQWlDLEVBQ2pCLGFBQThDLEVBQ3ZDLG9CQUE0RCxFQUMvRCxpQkFBc0QsRUFDbkQsb0JBQTRELEVBQ2xFLGNBQWdELEVBQzlDLGdCQUFvRCxFQUNuRCxpQkFBc0QsRUFDeEQsZUFBa0QsRUFDcEQsYUFBOEMsRUFDM0MsZ0JBQW9EO1lBRXZFLEtBQUssRUFBRSxDQUFDO1lBWHlCLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUN0Qix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQzlDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFDbEMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUNqRCxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDN0IscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUNsQyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBQ3ZDLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtZQUNuQyxrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFDMUIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQXhCaEUsMEJBQXFCLEdBQUcsSUFBSSxHQUFHLEVBQWdDLENBQUM7WUFHdkQsMkJBQXNCLEdBQUcsSUFBSSxlQUFPLEVBQVEsQ0FBQztZQUM3QyxnQ0FBMkIsR0FBRyxJQUFJLGVB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