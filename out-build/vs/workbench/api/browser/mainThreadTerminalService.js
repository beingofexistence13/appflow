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
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/api/common/extHost.protocol", "vs/workbench/services/extensions/common/extHostCustomers", "vs/base/common/uri", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/terminal/common/terminal", "vs/platform/terminal/common/terminalDataBuffering", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/browser/terminalProcessExtHostProxy", "vs/workbench/contrib/terminal/common/environmentVariable", "vs/platform/terminal/common/environmentVariableShared", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/services/remote/common/remoteAgentService", "vs/base/common/platform", "vs/base/common/async", "vs/workbench/contrib/terminalContrib/links/browser/links", "vs/workbench/contrib/terminalContrib/quickFix/browser/quickFix"], function (require, exports, lifecycle_1, extHost_protocol_1, extHostCustomers_1, uri_1, instantiation_1, log_1, terminal_1, terminalDataBuffering_1, terminal_2, terminalProcessExtHostProxy_1, environmentVariable_1, environmentVariableShared_1, terminal_3, remoteAgentService_1, platform_1, async_1, links_1, quickFix_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$5kb = exports.$4kb = void 0;
    let $4kb = class $4kb {
        constructor(l, m, n, o, p, q, s, t, remoteAgentService, u, v, w) {
            this.l = l;
            this.m = m;
            this.n = n;
            this.o = o;
            this.p = p;
            this.q = q;
            this.s = s;
            this.t = t;
            this.u = u;
            this.v = v;
            this.w = w;
            this.a = new lifecycle_1.$jc();
            /**
             * Stores a map from a temporary terminal id (a UUID generated on the extension host side)
             * to a numeric terminal id (an id generated on the renderer side)
             * This comes in play only when dealing with terminals created on the extension host side
             */
            this.c = new Map();
            this.d = new Map();
            this.f = new Map();
            this.g = new Map();
            this.h = new lifecycle_1.$lc();
            this.i = new lifecycle_1.$lc();
            this.k = platform_1.OS;
            this.b = l.getProxy(extHost_protocol_1.$2J.ExtHostTerminalService);
            // ITerminalService listeners
            this.a.add(m.onDidCreateInstance((instance) => {
                this.F(instance);
                this.H(instance);
            }));
            this.a.add(m.onDidDisposeInstance(instance => this.E(instance)));
            this.a.add(m.onDidReceiveProcessId(instance => this.G(instance)));
            this.a.add(m.onDidChangeInstanceDimensions(instance => this.H(instance)));
            this.a.add(m.onDidMaximumDimensionsChange(instance => this.I(instance)));
            this.a.add(m.onDidRequestStartExtensionTerminal(e => this.J(e)));
            this.a.add(m.onDidChangeActiveInstance(instance => this.A(instance ? instance.instanceId : null)));
            this.a.add(m.onDidChangeInstanceTitle(instance => instance && this.D(instance.instanceId, instance.title)));
            this.a.add(m.onDidInputInstanceData(instance => this.b.$acceptTerminalInteraction(instance.instanceId)));
            this.a.add(m.onDidChangeSelection(instance => this.b.$acceptTerminalSelection(instance.instanceId, instance.selection)));
            // Set initial ext host state
            for (const instance of this.m.instances) {
                this.F(instance);
                instance.processReady.then(() => this.G(instance));
            }
            const activeInstance = this.m.activeInstance;
            if (activeInstance) {
                this.b.$acceptActiveTerminalChanged(activeInstance.instanceId);
            }
            if (this.q.collections.size > 0) {
                const collectionAsArray = [...this.q.collections.entries()];
                const serializedCollections = collectionAsArray.map(e => {
                    return [e[0], (0, environmentVariableShared_1.$ar)(e[1].map)];
                });
                this.b.$initEnvironmentVariableCollections(serializedCollections);
            }
            remoteAgentService.getEnvironment().then(async (env) => {
                this.k = env?.os || platform_1.OS;
                this.x();
            });
            this.a.add(this.w.onDidChangeAvailableProfiles(() => this.x()));
        }
        dispose() {
            this.a.dispose();
            this.j?.dispose();
            for (const provider of this.f.values()) {
                provider.dispose();
            }
            for (const provider of this.g.values()) {
                provider.dispose();
            }
        }
        async x() {
            const remoteAuthority = this.l.remoteAuthority ?? undefined;
            const defaultProfile = this.t.getDefaultProfile({ remoteAuthority, os: this.k });
            const defaultAutomationProfile = this.t.getDefaultProfile({ remoteAuthority, os: this.k, allowAutomationShell: true });
            this.b.$acceptDefaultProfile(...await Promise.all([defaultProfile, defaultAutomationProfile]));
        }
        async y(id) {
            if (typeof id === 'string') {
                return this.c.get(id);
            }
            return this.m.getInstanceFromId(id);
        }
        async $createTerminal(extHostTerminalId, launchConfig) {
            const shellLaunchConfig = {
                name: launchConfig.name,
                executable: launchConfig.shellPath,
                args: launchConfig.shellArgs,
                cwd: typeof launchConfig.cwd === 'string' ? launchConfig.cwd : uri_1.URI.revive(launchConfig.cwd),
                icon: launchConfig.icon,
                color: launchConfig.color,
                initialText: launchConfig.initialText,
                waitOnExit: launchConfig.waitOnExit,
                ignoreConfigurationCwd: true,
                env: launchConfig.env,
                strictEnv: launchConfig.strictEnv,
                hideFromUser: launchConfig.hideFromUser,
                customPtyImplementation: launchConfig.isExtensionCustomPtyTerminal
                    ? (id, cols, rows) => new terminalProcessExtHostProxy_1.$Tkb(id, cols, rows, this.m)
                    : undefined,
                extHostTerminalId,
                isFeatureTerminal: launchConfig.isFeatureTerminal,
                isExtensionOwnedTerminal: launchConfig.isExtensionOwnedTerminal,
                useShellEnvironment: launchConfig.useShellEnvironment,
                isTransient: launchConfig.isTransient
            };
            const terminal = async_1.Promises.withAsyncBody(async (r) => {
                const terminal = await this.m.createTerminal({
                    config: shellLaunchConfig,
                    location: await this.z(launchConfig.location)
                });
                r(terminal);
            });
            this.c.set(extHostTerminalId, terminal);
            const terminalInstance = await terminal;
            this.a.add(terminalInstance.onDisposed(() => {
                this.c.delete(extHostTerminalId);
            }));
        }
        async z(location) {
            if (typeof location === 'object' && 'parentTerminal' in location) {
                const parentTerminal = await this.c.get(location.parentTerminal.toString());
                return parentTerminal ? { parentTerminal } : undefined;
            }
            return location;
        }
        async $show(id, preserveFocus) {
            const terminalInstance = await this.y(id);
            if (terminalInstance) {
                this.m.setActiveInstance(terminalInstance);
                if (terminalInstance.target === terminal_1.TerminalLocation.Editor) {
                    await this.v.revealActiveEditor(preserveFocus);
                }
                else {
                    await this.u.showPanel(!preserveFocus);
                }
            }
        }
        async $hide(id) {
            const instanceToHide = await this.y(id);
            const activeInstance = this.m.activeInstance;
            if (activeInstance && activeInstance.instanceId === instanceToHide?.instanceId && activeInstance.target !== terminal_1.TerminalLocation.Editor) {
                this.u.hidePanel();
            }
        }
        async $dispose(id) {
            (await this.y(id))?.dispose(terminal_1.TerminalExitReason.Extension);
        }
        async $sendText(id, text, addNewLine) {
            const instance = await this.y(id);
            await instance?.sendText(text, addNewLine);
        }
        $sendProcessExit(terminalId, exitCode) {
            this.d.get(terminalId)?.emitExit(exitCode);
        }
        $startSendingDataEvents() {
            if (!this.h.value) {
                this.h.value = this.p.createInstance(TerminalDataEventTracker, (id, data) => {
                    this.B(id, data);
                });
                // Send initial events if they exist
                for (const instance of this.m.instances) {
                    for (const data of instance.initialDataEvents || []) {
                        this.B(instance.instanceId, data);
                    }
                }
            }
        }
        $stopSendingDataEvents() {
            this.h.clear();
        }
        $startSendingCommandEvents() {
            this.s.info('$startSendingCommandEvents');
            if (this.i.value) {
                return;
            }
            const multiplexer = this.m.onInstanceCapabilityEvent(2 /* TerminalCapability.CommandDetection */, capability => capability.onCommandFinished);
            multiplexer.event(e => {
                this.C(e.instance.instanceId, {
                    commandLine: e.data.command,
                    // TODO: Convert to URI if possible
                    cwd: e.data.cwd,
                    exitCode: e.data.exitCode,
                    output: e.data.getOutput()
                });
            });
            this.i.value = multiplexer;
        }
        $stopSendingCommandEvents() {
            this.s.info('$stopSendingCommandEvents');
            this.i.clear();
        }
        $startLinkProvider() {
            this.j?.dispose();
            this.j = this.n.registerLinkProvider(new ExtensionTerminalLinkProvider(this.b));
        }
        $stopLinkProvider() {
            this.j?.dispose();
            this.j = undefined;
        }
        $registerProcessSupport(isSupported) {
            this.m.registerProcessSupport(isSupported);
        }
        $registerProfileProvider(id, extensionIdentifier) {
            // Proxy profile provider requests through the extension host
            this.f.set(id, this.w.registerTerminalProfileProvider(extensionIdentifier, id, {
                createContributedTerminalProfile: async (options) => {
                    return this.b.$createContributedProfileTerminal(id, options);
                }
            }));
        }
        $unregisterProfileProvider(id) {
            this.f.get(id)?.dispose();
            this.f.delete(id);
        }
        async $registerQuickFixProvider(id, extensionId) {
            this.g.set(id, this.o.registerQuickFixProvider(id, {
                provideTerminalQuickFixes: async (terminalCommand, lines, options, token) => {
                    if (token.isCancellationRequested) {
                        return;
                    }
                    if (options.outputMatcher?.length && options.outputMatcher.length > 40) {
                        options.outputMatcher.length = 40;
                        this.s.warn('Cannot exceed output matcher length of 40');
                    }
                    const commandLineMatch = terminalCommand.command.match(options.commandLineMatcher);
                    if (!commandLineMatch || !lines) {
                        return;
                    }
                    const outputMatcher = options.outputMatcher;
                    let outputMatch;
                    if (outputMatcher) {
                        outputMatch = $5kb(lines, outputMatcher);
                    }
                    if (!outputMatch) {
                        return;
                    }
                    const matchResult = { commandLineMatch, outputMatch, commandLine: terminalCommand.command };
                    if (matchResult) {
                        const result = await this.b.$provideTerminalQuickFixes(id, matchResult, token);
                        if (result && Array.isArray(result)) {
                            return result.map(r => parseQuickFix(id, extensionId, r));
                        }
                        else if (result) {
                            return parseQuickFix(id, extensionId, result);
                        }
                    }
                    return;
                }
            }));
        }
        $unregisterQuickFixProvider(id) {
            this.g.get(id)?.dispose();
            this.g.delete(id);
        }
        A(terminalId) {
            this.b.$acceptActiveTerminalChanged(terminalId);
        }
        B(terminalId, data) {
            this.b.$acceptTerminalProcessData(terminalId, data);
        }
        C(terminalId, command) {
            this.b.$acceptDidExecuteCommand(terminalId, command);
        }
        D(terminalId, name) {
            this.b.$acceptTerminalTitleChange(terminalId, name);
        }
        E(terminalInstance) {
            this.b.$acceptTerminalClosed(terminalInstance.instanceId, terminalInstance.exitCode, terminalInstance.exitReason ?? terminal_1.TerminalExitReason.Unknown);
        }
        F(terminalInstance) {
            const extHostTerminalId = terminalInstance.shellLaunchConfig.extHostTerminalId;
            const shellLaunchConfigDto = {
                name: terminalInstance.shellLaunchConfig.name,
                executable: terminalInstance.shellLaunchConfig.executable,
                args: terminalInstance.shellLaunchConfig.args,
                cwd: terminalInstance.shellLaunchConfig.cwd,
                env: terminalInstance.shellLaunchConfig.env,
                hideFromUser: terminalInstance.shellLaunchConfig.hideFromUser
            };
            this.b.$acceptTerminalOpened(terminalInstance.instanceId, extHostTerminalId, terminalInstance.title, shellLaunchConfigDto);
        }
        G(terminalInstance) {
            if (terminalInstance.processId === undefined) {
                return;
            }
            this.b.$acceptTerminalProcessId(terminalInstance.instanceId, terminalInstance.processId);
        }
        H(instance) {
            this.b.$acceptTerminalDimensions(instance.instanceId, instance.cols, instance.rows);
        }
        I(instance) {
            this.b.$acceptTerminalMaximumDimensions(instance.instanceId, instance.maxCols, instance.maxRows);
        }
        J(request) {
            const proxy = request.proxy;
            this.d.set(proxy.instanceId, proxy);
            // Note that onResize is not being listened to here as it needs to fire when max dimensions
            // change, excluding the dimension override
            const initialDimensions = request.cols && request.rows ? {
                columns: request.cols,
                rows: request.rows
            } : undefined;
            this.b.$startExtensionTerminal(proxy.instanceId, initialDimensions).then(request.callback);
            proxy.onInput(data => this.b.$acceptProcessInput(proxy.instanceId, data));
            proxy.onShutdown(immediate => this.b.$acceptProcessShutdown(proxy.instanceId, immediate));
            proxy.onRequestCwd(() => this.b.$acceptProcessRequestCwd(proxy.instanceId));
            proxy.onRequestInitialCwd(() => this.b.$acceptProcessRequestInitialCwd(proxy.instanceId));
        }
        $sendProcessData(terminalId, data) {
            this.d.get(terminalId)?.emitData(data);
        }
        $sendProcessReady(terminalId, pid, cwd, windowsPty) {
            this.d.get(terminalId)?.emitReady(pid, cwd, windowsPty);
        }
        $sendProcessProperty(terminalId, property) {
            if (property.type === "title" /* ProcessPropertyType.Title */) {
                const instance = this.m.getInstanceFromId(terminalId);
                instance?.rename(property.value);
            }
            this.d.get(terminalId)?.emitProcessProperty(property);
        }
        $setEnvironmentVariableCollection(extensionIdentifier, persistent, collection, descriptionMap) {
            if (collection) {
                const translatedCollection = {
                    persistent,
                    map: (0, environmentVariableShared_1.$cr)(collection),
                    descriptionMap: (0, environmentVariableShared_1.$dr)(descriptionMap)
                };
                this.q.set(extensionIdentifier, translatedCollection);
            }
            else {
                this.q.delete(extensionIdentifier);
            }
        }
    };
    exports.$4kb = $4kb;
    exports.$4kb = $4kb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadTerminalService),
        __param(1, terminal_2.$Mib),
        __param(2, links_1.$2kb),
        __param(3, quickFix_1.$3kb),
        __param(4, instantiation_1.$Ah),
        __param(5, environmentVariable_1.$sM),
        __param(6, log_1.$5i),
        __param(7, terminal_3.$EM),
        __param(8, remoteAgentService_1.$jm),
        __param(9, terminal_2.$Oib),
        __param(10, terminal_2.$Nib),
        __param(11, terminal_3.$GM)
    ], $4kb);
    /**
     * Encapsulates temporary tracking of data events from terminal instances, once disposed all
     * listeners are removed.
     */
    let TerminalDataEventTracker = class TerminalDataEventTracker extends lifecycle_1.$kc {
        constructor(b, c) {
            super();
            this.b = b;
            this.c = c;
            this.B(this.a = new terminalDataBuffering_1.$Skb(this.b));
            for (const instance of this.c.instances) {
                this.f(instance);
            }
            this.B(this.c.onDidCreateInstance(instance => this.f(instance)));
            this.B(this.c.onDidDisposeInstance(instance => this.a.stopBuffering(instance.instanceId)));
        }
        f(instance) {
            // Buffer data events to reduce the amount of messages going to the extension host
            this.B(this.a.startBuffering(instance.instanceId, instance.onData));
        }
    };
    TerminalDataEventTracker = __decorate([
        __param(1, terminal_2.$Mib)
    ], TerminalDataEventTracker);
    class ExtensionTerminalLinkProvider {
        constructor(a) {
            this.a = a;
        }
        async provideLinks(instance, line) {
            const proxy = this.a;
            const extHostLinks = await proxy.$provideLinks(instance.instanceId, line);
            return extHostLinks.map(dto => ({
                id: dto.id,
                startIndex: dto.startIndex,
                length: dto.length,
                label: dto.label,
                activate: () => proxy.$activateLink(instance.instanceId, dto.id)
            }));
        }
    }
    function $5kb(lines, outputMatcher) {
        const match = lines.join('\n').match(outputMatcher.lineMatcher);
        return match ? { regexMatch: match, outputLines: lines } : undefined;
    }
    exports.$5kb = $5kb;
    function parseQuickFix(id, source, fix) {
        let type = quickFix_1.TerminalQuickFixType.TerminalCommand;
        if ('uri' in fix) {
            fix.uri = uri_1.URI.revive(fix.uri);
            type = quickFix_1.TerminalQuickFixType.Opener;
        }
        else if ('id' in fix) {
            type = quickFix_1.TerminalQuickFixType.VscodeCommand;
        }
        return { id, type, source, ...fix };
    }
});
//# sourceMappingURL=mainThreadTerminalService.js.map