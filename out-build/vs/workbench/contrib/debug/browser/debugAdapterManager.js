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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/severity", "vs/base/common/strings", "vs/editor/browser/editorBrowser", "vs/editor/common/languages/language", "vs/nls!vs/workbench/contrib/debug/browser/debugAdapterManager", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/instantiation", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/quickinput/common/quickInput", "vs/platform/registry/common/platform", "vs/workbench/contrib/debug/common/breakpoints", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugger", "vs/workbench/contrib/debug/common/debugSchemas", "vs/workbench/contrib/tasks/common/taskDefinitionRegistry", "vs/workbench/services/configuration/common/configuration", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/lifecycle/common/lifecycle"], function (require, exports, event_1, lifecycle_1, severity_1, strings, editorBrowser_1, language_1, nls, commands_1, configuration_1, contextkey_1, dialogs_1, instantiation_1, jsonContributionRegistry_1, quickInput_1, platform_1, breakpoints_1, debug_1, debugger_1, debugSchemas_1, taskDefinitionRegistry_1, configuration_2, editorService_1, extensions_1, lifecycle_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ORb = void 0;
    const jsonRegistry = platform_1.$8m.as(jsonContributionRegistry_1.$9m.JSONContribution);
    let $ORb = class $ORb extends lifecycle_1.$kc {
        constructor(delegate, y, z, C, D, F, G, H, I, J, L) {
            super();
            this.y = y;
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.L = L;
            this.g = new Map();
            this.m = new event_1.$fd();
            this.n = new event_1.$fd();
            this.r = [];
            this.t = new Set();
            this.w = new Set();
            this.f = [];
            this.b = [];
            this.M();
            this.H.bufferChangeEvents(() => {
                this.h = debug_1.$ZG.bindTo(H);
                this.j = debug_1.$1G.bindTo(H);
            });
            this.B(this.H.onDidChangeContext(e => {
                if (e.affectsSome(this.t)) {
                    this.h.set(this.hasEnabledDebuggers());
                    this.N();
                }
            }));
            this.B(this.onDidDebuggersExtPointRead(() => {
                this.j.set(this.b.length > 0);
            }));
            this.L.when(4 /* LifecyclePhase.Eventually */)
                .then(() => this.j.set(this.b.length > 0)); // If no extensions with a debugger contribution are loaded
            this.B(delegate.onDidNewSession(s => {
                this.w.add(s.configuration.type);
            }));
        }
        M() {
            debugSchemas_1.$KRb.setHandler((extensions, delta) => {
                delta.added.forEach(added => {
                    added.value.forEach(rawAdapter => {
                        if (!rawAdapter.type || (typeof rawAdapter.type !== 'string')) {
                            added.collector.error(nls.localize(0, null));
                        }
                        if (rawAdapter.type !== '*') {
                            const existing = this.getDebugger(rawAdapter.type);
                            if (existing) {
                                existing.merge(rawAdapter, added.description);
                            }
                            else {
                                const dbg = this.D.createInstance(debugger_1.$IRb, this, rawAdapter, added.description);
                                dbg.when?.keys().forEach(key => this.t.add(key));
                                this.b.push(dbg);
                            }
                        }
                    });
                });
                // take care of all wildcard contributions
                extensions.forEach(extension => {
                    extension.value.forEach(rawAdapter => {
                        if (rawAdapter.type === '*') {
                            this.b.forEach(dbg => dbg.merge(rawAdapter, extension.description));
                        }
                    });
                });
                delta.removed.forEach(removed => {
                    const removedTypes = removed.value.map(rawAdapter => rawAdapter.type);
                    this.b = this.b.filter(d => removedTypes.indexOf(d.type) === -1);
                });
                this.N();
                this.n.fire();
            });
            debugSchemas_1.$LRb.setHandler(extensions => {
                this.r = extensions.flatMap(ext => ext.value.map(breakpoint => this.D.createInstance(breakpoints_1.$GRb, breakpoint)));
            });
        }
        N() {
            // update the schema to include all attributes, snippets and types from extensions.
            const items = debugSchemas_1.$NRb.properties['configurations'].items;
            const taskSchema = taskDefinitionRegistry_1.$$F.getJsonSchema();
            const definitions = {
                'common': {
                    properties: {
                        'name': {
                            type: 'string',
                            description: nls.localize(1, null),
                            default: 'Launch'
                        },
                        'debugServer': {
                            type: 'number',
                            description: nls.localize(2, null),
                            default: 4711
                        },
                        'preLaunchTask': {
                            anyOf: [taskSchema, {
                                    type: ['string']
                                }],
                            default: '',
                            defaultSnippets: [{ body: { task: '', type: '' } }],
                            description: nls.localize(3, null)
                        },
                        'postDebugTask': {
                            anyOf: [taskSchema, {
                                    type: ['string'],
                                }],
                            default: '',
                            defaultSnippets: [{ body: { task: '', type: '' } }],
                            description: nls.localize(4, null)
                        },
                        'presentation': debugSchemas_1.$MRb,
                        'internalConsoleOptions': debug_1.$kH,
                        'suppressMultipleSessionWarning': {
                            type: 'boolean',
                            description: nls.localize(5, null),
                            default: true
                        }
                    }
                }
            };
            debugSchemas_1.$NRb.definitions = definitions;
            items.oneOf = [];
            items.defaultSnippets = [];
            this.b.forEach(adapter => {
                const schemaAttributes = adapter.getSchemaAttributes(definitions);
                if (schemaAttributes && items.oneOf) {
                    items.oneOf.push(...schemaAttributes);
                }
                const configurationSnippets = adapter.configurationSnippets;
                if (configurationSnippets && items.defaultSnippets) {
                    items.defaultSnippets.push(...configurationSnippets);
                }
            });
            jsonRegistry.registerSchema(configuration_2.$_D, debugSchemas_1.$NRb);
        }
        registerDebugAdapterFactory(debugTypes, debugAdapterLauncher) {
            debugTypes.forEach(debugType => this.g.set(debugType, debugAdapterLauncher));
            this.h.set(this.hasEnabledDebuggers());
            this.m.fire();
            return {
                dispose: () => {
                    debugTypes.forEach(debugType => this.g.delete(debugType));
                }
            };
        }
        hasEnabledDebuggers() {
            for (const [type] of this.g) {
                const dbg = this.getDebugger(type);
                if (dbg && dbg.enabled) {
                    return true;
                }
            }
            return false;
        }
        createDebugAdapter(session) {
            const factory = this.g.get(session.configuration.type);
            if (factory) {
                return factory.createDebugAdapter(session);
            }
            return undefined;
        }
        substituteVariables(debugType, folder, config) {
            const factory = this.g.get(debugType);
            if (factory) {
                return factory.substituteVariables(folder, config);
            }
            return Promise.resolve(config);
        }
        runInTerminal(debugType, args, sessionId) {
            const factory = this.g.get(debugType);
            if (factory) {
                return factory.runInTerminal(args, sessionId);
            }
            return Promise.resolve(void 0);
        }
        registerDebugAdapterDescriptorFactory(debugAdapterProvider) {
            this.f.push(debugAdapterProvider);
            return {
                dispose: () => {
                    this.unregisterDebugAdapterDescriptorFactory(debugAdapterProvider);
                }
            };
        }
        unregisterDebugAdapterDescriptorFactory(debugAdapterProvider) {
            const ix = this.f.indexOf(debugAdapterProvider);
            if (ix >= 0) {
                this.f.splice(ix, 1);
            }
        }
        getDebugAdapterDescriptor(session) {
            const config = session.configuration;
            const providers = this.f.filter(p => p.type === config.type && p.createDebugAdapterDescriptor);
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
            return this.m.event;
        }
        get onDidDebuggersExtPointRead() {
            return this.n.event;
        }
        canSetBreakpointsIn(model) {
            const languageId = model.getLanguageId();
            if (!languageId || languageId === 'jsonc' || languageId === 'log') {
                // do not allow breakpoints in our settings files and output
                return false;
            }
            if (this.z.getValue('debug').allowBreakpointsEverywhere) {
                return true;
            }
            return this.r.some(breakpoints => breakpoints.language === languageId && breakpoints.enabled);
        }
        getDebugger(type) {
            return this.b.find(dbg => strings.$Me(dbg.type, type));
        }
        getEnabledDebugger(type) {
            const adapter = this.getDebugger(type);
            return adapter && adapter.enabled ? adapter : undefined;
        }
        someDebuggerInterestedInLanguage(languageId) {
            return !!this.b
                .filter(d => d.enabled)
                .find(a => a.interestedInLanguage(languageId));
        }
        async guessDebugger(gettingConfigurations) {
            const activeTextEditorControl = this.y.activeTextEditorControl;
            let candidates = [];
            let languageLabel = null;
            let model = null;
            if ((0, editorBrowser_1.$iV)(activeTextEditorControl)) {
                model = activeTextEditorControl.getModel();
                const language = model ? model.getLanguageId() : undefined;
                if (language) {
                    languageLabel = this.I.getLanguageName(language);
                }
                const adapters = this.b
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
                candidates = this.b
                    .filter(a => a.enabled)
                    .filter(dbg => dbg.hasInitialConfiguration() || dbg.hasConfigurationProvider());
            }
            if (candidates.length === 0 && languageLabel) {
                if (languageLabel.indexOf(' ') >= 0) {
                    languageLabel = `'${languageLabel}'`;
                }
                const { confirmed } = await this.J.confirm({
                    type: severity_1.default.Warning,
                    message: nls.localize(6, null, languageLabel),
                    primaryButton: nls.localize(7, null, languageLabel)
                });
                if (confirmed) {
                    await this.F.executeCommand('debug.installAdditionalDebuggers', languageLabel);
                }
                return undefined;
            }
            this.O();
            candidates.sort((first, second) => first.label.localeCompare(second.label));
            candidates = candidates.filter(a => !a.isHiddenFromDropdown);
            const suggestedCandidates = [];
            const otherCandidates = [];
            candidates.forEach(d => {
                const descriptor = d.getMainExtensionDescriptor();
                if (descriptor.id && !!this.u?.has(descriptor.id)) {
                    // Was activated early
                    suggestedCandidates.push(d);
                }
                else if (this.w.has(d.type)) {
                    // Was used already
                    suggestedCandidates.push(d);
                }
                else {
                    otherCandidates.push(d);
                }
            });
            const picks = [];
            if (suggestedCandidates.length > 0) {
                picks.push({ type: 'separator', label: nls.localize(8, null) }, ...suggestedCandidates.map(c => ({ label: c.label, debugger: c })));
            }
            if (otherCandidates.length > 0) {
                if (picks.length > 0) {
                    picks.push({ type: 'separator', label: '' });
                }
                picks.push(...otherCandidates.map(c => ({ label: c.label, debugger: c })));
            }
            picks.push({ type: 'separator', label: '' }, { label: languageLabel ? nls.localize(9, null, languageLabel) : nls.localize(10, null) });
            const placeHolder = nls.localize(11, null);
            return this.C.pick(picks, { activeItem: picks[0], placeHolder })
                .then(picked => {
                if (picked && picked.debugger) {
                    return picked.debugger;
                }
                if (picked) {
                    this.F.executeCommand('debug.installAdditionalDebuggers', languageLabel);
                }
                return undefined;
            });
        }
        O() {
            if (!this.u) {
                this.u = new Set();
                const status = this.G.getExtensionsStatus();
                for (const id in status) {
                    if (!!status[id].activationTimes) {
                        this.u.add(id);
                    }
                }
            }
        }
        async activateDebuggers(activationEvent, debugType) {
            this.O();
            const promises = [
                this.G.activateByEvent(activationEvent),
                this.G.activateByEvent('onDebug')
            ];
            if (debugType) {
                promises.push(this.G.activateByEvent(`${activationEvent}:${debugType}`));
            }
            await Promise.all(promises);
        }
    };
    exports.$ORb = $ORb;
    exports.$ORb = $ORb = __decorate([
        __param(1, editorService_1.$9C),
        __param(2, configuration_1.$8h),
        __param(3, quickInput_1.$Gq),
        __param(4, instantiation_1.$Ah),
        __param(5, commands_1.$Fr),
        __param(6, extensions_1.$MF),
        __param(7, contextkey_1.$3i),
        __param(8, language_1.$ct),
        __param(9, dialogs_1.$oA),
        __param(10, lifecycle_2.$7y)
    ], $ORb);
});
//# sourceMappingURL=debugAdapterManager.js.map