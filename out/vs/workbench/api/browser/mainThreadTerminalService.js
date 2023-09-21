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
    exports.getOutputMatchForLines = exports.MainThreadTerminalService = void 0;
    let MainThreadTerminalService = class MainThreadTerminalService {
        constructor(_extHostContext, _terminalService, _terminalLinkProviderService, _terminalQuickFixService, _instantiationService, _environmentVariableService, _logService, _terminalProfileResolverService, remoteAgentService, _terminalGroupService, _terminalEditorService, _terminalProfileService) {
            this._extHostContext = _extHostContext;
            this._terminalService = _terminalService;
            this._terminalLinkProviderService = _terminalLinkProviderService;
            this._terminalQuickFixService = _terminalQuickFixService;
            this._instantiationService = _instantiationService;
            this._environmentVariableService = _environmentVariableService;
            this._logService = _logService;
            this._terminalProfileResolverService = _terminalProfileResolverService;
            this._terminalGroupService = _terminalGroupService;
            this._terminalEditorService = _terminalEditorService;
            this._terminalProfileService = _terminalProfileService;
            this._store = new lifecycle_1.DisposableStore();
            /**
             * Stores a map from a temporary terminal id (a UUID generated on the extension host side)
             * to a numeric terminal id (an id generated on the renderer side)
             * This comes in play only when dealing with terminals created on the extension host side
             */
            this._extHostTerminals = new Map();
            this._terminalProcessProxies = new Map();
            this._profileProviders = new Map();
            this._quickFixProviders = new Map();
            this._dataEventTracker = new lifecycle_1.MutableDisposable();
            this._sendCommandEventListener = new lifecycle_1.MutableDisposable();
            this._os = platform_1.OS;
            this._proxy = _extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostTerminalService);
            // ITerminalService listeners
            this._store.add(_terminalService.onDidCreateInstance((instance) => {
                this._onTerminalOpened(instance);
                this._onInstanceDimensionsChanged(instance);
            }));
            this._store.add(_terminalService.onDidDisposeInstance(instance => this._onTerminalDisposed(instance)));
            this._store.add(_terminalService.onDidReceiveProcessId(instance => this._onTerminalProcessIdReady(instance)));
            this._store.add(_terminalService.onDidChangeInstanceDimensions(instance => this._onInstanceDimensionsChanged(instance)));
            this._store.add(_terminalService.onDidMaximumDimensionsChange(instance => this._onInstanceMaximumDimensionsChanged(instance)));
            this._store.add(_terminalService.onDidRequestStartExtensionTerminal(e => this._onRequestStartExtensionTerminal(e)));
            this._store.add(_terminalService.onDidChangeActiveInstance(instance => this._onActiveTerminalChanged(instance ? instance.instanceId : null)));
            this._store.add(_terminalService.onDidChangeInstanceTitle(instance => instance && this._onTitleChanged(instance.instanceId, instance.title)));
            this._store.add(_terminalService.onDidInputInstanceData(instance => this._proxy.$acceptTerminalInteraction(instance.instanceId)));
            this._store.add(_terminalService.onDidChangeSelection(instance => this._proxy.$acceptTerminalSelection(instance.instanceId, instance.selection)));
            // Set initial ext host state
            for (const instance of this._terminalService.instances) {
                this._onTerminalOpened(instance);
                instance.processReady.then(() => this._onTerminalProcessIdReady(instance));
            }
            const activeInstance = this._terminalService.activeInstance;
            if (activeInstance) {
                this._proxy.$acceptActiveTerminalChanged(activeInstance.instanceId);
            }
            if (this._environmentVariableService.collections.size > 0) {
                const collectionAsArray = [...this._environmentVariableService.collections.entries()];
                const serializedCollections = collectionAsArray.map(e => {
                    return [e[0], (0, environmentVariableShared_1.serializeEnvironmentVariableCollection)(e[1].map)];
                });
                this._proxy.$initEnvironmentVariableCollections(serializedCollections);
            }
            remoteAgentService.getEnvironment().then(async (env) => {
                this._os = env?.os || platform_1.OS;
                this._updateDefaultProfile();
            });
            this._store.add(this._terminalProfileService.onDidChangeAvailableProfiles(() => this._updateDefaultProfile()));
        }
        dispose() {
            this._store.dispose();
            this._linkProvider?.dispose();
            for (const provider of this._profileProviders.values()) {
                provider.dispose();
            }
            for (const provider of this._quickFixProviders.values()) {
                provider.dispose();
            }
        }
        async _updateDefaultProfile() {
            const remoteAuthority = this._extHostContext.remoteAuthority ?? undefined;
            const defaultProfile = this._terminalProfileResolverService.getDefaultProfile({ remoteAuthority, os: this._os });
            const defaultAutomationProfile = this._terminalProfileResolverService.getDefaultProfile({ remoteAuthority, os: this._os, allowAutomationShell: true });
            this._proxy.$acceptDefaultProfile(...await Promise.all([defaultProfile, defaultAutomationProfile]));
        }
        async _getTerminalInstance(id) {
            if (typeof id === 'string') {
                return this._extHostTerminals.get(id);
            }
            return this._terminalService.getInstanceFromId(id);
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
                    ? (id, cols, rows) => new terminalProcessExtHostProxy_1.TerminalProcessExtHostProxy(id, cols, rows, this._terminalService)
                    : undefined,
                extHostTerminalId,
                isFeatureTerminal: launchConfig.isFeatureTerminal,
                isExtensionOwnedTerminal: launchConfig.isExtensionOwnedTerminal,
                useShellEnvironment: launchConfig.useShellEnvironment,
                isTransient: launchConfig.isTransient
            };
            const terminal = async_1.Promises.withAsyncBody(async (r) => {
                const terminal = await this._terminalService.createTerminal({
                    config: shellLaunchConfig,
                    location: await this._deserializeParentTerminal(launchConfig.location)
                });
                r(terminal);
            });
            this._extHostTerminals.set(extHostTerminalId, terminal);
            const terminalInstance = await terminal;
            this._store.add(terminalInstance.onDisposed(() => {
                this._extHostTerminals.delete(extHostTerminalId);
            }));
        }
        async _deserializeParentTerminal(location) {
            if (typeof location === 'object' && 'parentTerminal' in location) {
                const parentTerminal = await this._extHostTerminals.get(location.parentTerminal.toString());
                return parentTerminal ? { parentTerminal } : undefined;
            }
            return location;
        }
        async $show(id, preserveFocus) {
            const terminalInstance = await this._getTerminalInstance(id);
            if (terminalInstance) {
                this._terminalService.setActiveInstance(terminalInstance);
                if (terminalInstance.target === terminal_1.TerminalLocation.Editor) {
                    await this._terminalEditorService.revealActiveEditor(preserveFocus);
                }
                else {
                    await this._terminalGroupService.showPanel(!preserveFocus);
                }
            }
        }
        async $hide(id) {
            const instanceToHide = await this._getTerminalInstance(id);
            const activeInstance = this._terminalService.activeInstance;
            if (activeInstance && activeInstance.instanceId === instanceToHide?.instanceId && activeInstance.target !== terminal_1.TerminalLocation.Editor) {
                this._terminalGroupService.hidePanel();
            }
        }
        async $dispose(id) {
            (await this._getTerminalInstance(id))?.dispose(terminal_1.TerminalExitReason.Extension);
        }
        async $sendText(id, text, addNewLine) {
            const instance = await this._getTerminalInstance(id);
            await instance?.sendText(text, addNewLine);
        }
        $sendProcessExit(terminalId, exitCode) {
            this._terminalProcessProxies.get(terminalId)?.emitExit(exitCode);
        }
        $startSendingDataEvents() {
            if (!this._dataEventTracker.value) {
                this._dataEventTracker.value = this._instantiationService.createInstance(TerminalDataEventTracker, (id, data) => {
                    this._onTerminalData(id, data);
                });
                // Send initial events if they exist
                for (const instance of this._terminalService.instances) {
                    for (const data of instance.initialDataEvents || []) {
                        this._onTerminalData(instance.instanceId, data);
                    }
                }
            }
        }
        $stopSendingDataEvents() {
            this._dataEventTracker.clear();
        }
        $startSendingCommandEvents() {
            this._logService.info('$startSendingCommandEvents');
            if (this._sendCommandEventListener.value) {
                return;
            }
            const multiplexer = this._terminalService.onInstanceCapabilityEvent(2 /* TerminalCapability.CommandDetection */, capability => capability.onCommandFinished);
            multiplexer.event(e => {
                this._onDidExecuteCommand(e.instance.instanceId, {
                    commandLine: e.data.command,
                    // TODO: Convert to URI if possible
                    cwd: e.data.cwd,
                    exitCode: e.data.exitCode,
                    output: e.data.getOutput()
                });
            });
            this._sendCommandEventListener.value = multiplexer;
        }
        $stopSendingCommandEvents() {
            this._logService.info('$stopSendingCommandEvents');
            this._sendCommandEventListener.clear();
        }
        $startLinkProvider() {
            this._linkProvider?.dispose();
            this._linkProvider = this._terminalLinkProviderService.registerLinkProvider(new ExtensionTerminalLinkProvider(this._proxy));
        }
        $stopLinkProvider() {
            this._linkProvider?.dispose();
            this._linkProvider = undefined;
        }
        $registerProcessSupport(isSupported) {
            this._terminalService.registerProcessSupport(isSupported);
        }
        $registerProfileProvider(id, extensionIdentifier) {
            // Proxy profile provider requests through the extension host
            this._profileProviders.set(id, this._terminalProfileService.registerTerminalProfileProvider(extensionIdentifier, id, {
                createContributedTerminalProfile: async (options) => {
                    return this._proxy.$createContributedProfileTerminal(id, options);
                }
            }));
        }
        $unregisterProfileProvider(id) {
            this._profileProviders.get(id)?.dispose();
            this._profileProviders.delete(id);
        }
        async $registerQuickFixProvider(id, extensionId) {
            this._quickFixProviders.set(id, this._terminalQuickFixService.registerQuickFixProvider(id, {
                provideTerminalQuickFixes: async (terminalCommand, lines, options, token) => {
                    if (token.isCancellationRequested) {
                        return;
                    }
                    if (options.outputMatcher?.length && options.outputMatcher.length > 40) {
                        options.outputMatcher.length = 40;
                        this._logService.warn('Cannot exceed output matcher length of 40');
                    }
                    const commandLineMatch = terminalCommand.command.match(options.commandLineMatcher);
                    if (!commandLineMatch || !lines) {
                        return;
                    }
                    const outputMatcher = options.outputMatcher;
                    let outputMatch;
                    if (outputMatcher) {
                        outputMatch = getOutputMatchForLines(lines, outputMatcher);
                    }
                    if (!outputMatch) {
                        return;
                    }
                    const matchResult = { commandLineMatch, outputMatch, commandLine: terminalCommand.command };
                    if (matchResult) {
                        const result = await this._proxy.$provideTerminalQuickFixes(id, matchResult, token);
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
            this._quickFixProviders.get(id)?.dispose();
            this._quickFixProviders.delete(id);
        }
        _onActiveTerminalChanged(terminalId) {
            this._proxy.$acceptActiveTerminalChanged(terminalId);
        }
        _onTerminalData(terminalId, data) {
            this._proxy.$acceptTerminalProcessData(terminalId, data);
        }
        _onDidExecuteCommand(terminalId, command) {
            this._proxy.$acceptDidExecuteCommand(terminalId, command);
        }
        _onTitleChanged(terminalId, name) {
            this._proxy.$acceptTerminalTitleChange(terminalId, name);
        }
        _onTerminalDisposed(terminalInstance) {
            this._proxy.$acceptTerminalClosed(terminalInstance.instanceId, terminalInstance.exitCode, terminalInstance.exitReason ?? terminal_1.TerminalExitReason.Unknown);
        }
        _onTerminalOpened(terminalInstance) {
            const extHostTerminalId = terminalInstance.shellLaunchConfig.extHostTerminalId;
            const shellLaunchConfigDto = {
                name: terminalInstance.shellLaunchConfig.name,
                executable: terminalInstance.shellLaunchConfig.executable,
                args: terminalInstance.shellLaunchConfig.args,
                cwd: terminalInstance.shellLaunchConfig.cwd,
                env: terminalInstance.shellLaunchConfig.env,
                hideFromUser: terminalInstance.shellLaunchConfig.hideFromUser
            };
            this._proxy.$acceptTerminalOpened(terminalInstance.instanceId, extHostTerminalId, terminalInstance.title, shellLaunchConfigDto);
        }
        _onTerminalProcessIdReady(terminalInstance) {
            if (terminalInstance.processId === undefined) {
                return;
            }
            this._proxy.$acceptTerminalProcessId(terminalInstance.instanceId, terminalInstance.processId);
        }
        _onInstanceDimensionsChanged(instance) {
            this._proxy.$acceptTerminalDimensions(instance.instanceId, instance.cols, instance.rows);
        }
        _onInstanceMaximumDimensionsChanged(instance) {
            this._proxy.$acceptTerminalMaximumDimensions(instance.instanceId, instance.maxCols, instance.maxRows);
        }
        _onRequestStartExtensionTerminal(request) {
            const proxy = request.proxy;
            this._terminalProcessProxies.set(proxy.instanceId, proxy);
            // Note that onResize is not being listened to here as it needs to fire when max dimensions
            // change, excluding the dimension override
            const initialDimensions = request.cols && request.rows ? {
                columns: request.cols,
                rows: request.rows
            } : undefined;
            this._proxy.$startExtensionTerminal(proxy.instanceId, initialDimensions).then(request.callback);
            proxy.onInput(data => this._proxy.$acceptProcessInput(proxy.instanceId, data));
            proxy.onShutdown(immediate => this._proxy.$acceptProcessShutdown(proxy.instanceId, immediate));
            proxy.onRequestCwd(() => this._proxy.$acceptProcessRequestCwd(proxy.instanceId));
            proxy.onRequestInitialCwd(() => this._proxy.$acceptProcessRequestInitialCwd(proxy.instanceId));
        }
        $sendProcessData(terminalId, data) {
            this._terminalProcessProxies.get(terminalId)?.emitData(data);
        }
        $sendProcessReady(terminalId, pid, cwd, windowsPty) {
            this._terminalProcessProxies.get(terminalId)?.emitReady(pid, cwd, windowsPty);
        }
        $sendProcessProperty(terminalId, property) {
            if (property.type === "title" /* ProcessPropertyType.Title */) {
                const instance = this._terminalService.getInstanceFromId(terminalId);
                instance?.rename(property.value);
            }
            this._terminalProcessProxies.get(terminalId)?.emitProcessProperty(property);
        }
        $setEnvironmentVariableCollection(extensionIdentifier, persistent, collection, descriptionMap) {
            if (collection) {
                const translatedCollection = {
                    persistent,
                    map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)(collection),
                    descriptionMap: (0, environmentVariableShared_1.deserializeEnvironmentDescriptionMap)(descriptionMap)
                };
                this._environmentVariableService.set(extensionIdentifier, translatedCollection);
            }
            else {
                this._environmentVariableService.delete(extensionIdentifier);
            }
        }
    };
    exports.MainThreadTerminalService = MainThreadTerminalService;
    exports.MainThreadTerminalService = MainThreadTerminalService = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadTerminalService),
        __param(1, terminal_2.ITerminalService),
        __param(2, links_1.ITerminalLinkProviderService),
        __param(3, quickFix_1.ITerminalQuickFixService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, environmentVariable_1.IEnvironmentVariableService),
        __param(6, log_1.ILogService),
        __param(7, terminal_3.ITerminalProfileResolverService),
        __param(8, remoteAgentService_1.IRemoteAgentService),
        __param(9, terminal_2.ITerminalGroupService),
        __param(10, terminal_2.ITerminalEditorService),
        __param(11, terminal_3.ITerminalProfileService)
    ], MainThreadTerminalService);
    /**
     * Encapsulates temporary tracking of data events from terminal instances, once disposed all
     * listeners are removed.
     */
    let TerminalDataEventTracker = class TerminalDataEventTracker extends lifecycle_1.Disposable {
        constructor(_callback, _terminalService) {
            super();
            this._callback = _callback;
            this._terminalService = _terminalService;
            this._register(this._bufferer = new terminalDataBuffering_1.TerminalDataBufferer(this._callback));
            for (const instance of this._terminalService.instances) {
                this._registerInstance(instance);
            }
            this._register(this._terminalService.onDidCreateInstance(instance => this._registerInstance(instance)));
            this._register(this._terminalService.onDidDisposeInstance(instance => this._bufferer.stopBuffering(instance.instanceId)));
        }
        _registerInstance(instance) {
            // Buffer data events to reduce the amount of messages going to the extension host
            this._register(this._bufferer.startBuffering(instance.instanceId, instance.onData));
        }
    };
    TerminalDataEventTracker = __decorate([
        __param(1, terminal_2.ITerminalService)
    ], TerminalDataEventTracker);
    class ExtensionTerminalLinkProvider {
        constructor(_proxy) {
            this._proxy = _proxy;
        }
        async provideLinks(instance, line) {
            const proxy = this._proxy;
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
    function getOutputMatchForLines(lines, outputMatcher) {
        const match = lines.join('\n').match(outputMatcher.lineMatcher);
        return match ? { regexMatch: match, outputLines: lines } : undefined;
    }
    exports.getOutputMatchForLines = getOutputMatchForLines;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZFRlcm1pbmFsU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvYnJvd3Nlci9tYWluVGhyZWFkVGVybWluYWxTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTBCekYsSUFBTSx5QkFBeUIsR0FBL0IsTUFBTSx5QkFBeUI7UUEwQnJDLFlBQ2tCLGVBQWdDLEVBQy9CLGdCQUFtRCxFQUN2Qyw0QkFBMkUsRUFDL0Usd0JBQW1FLEVBQ3RFLHFCQUE2RCxFQUN2RCwyQkFBeUUsRUFDekYsV0FBeUMsRUFDckIsK0JBQWlGLEVBQzdGLGtCQUF1QyxFQUNyQyxxQkFBNkQsRUFDNUQsc0JBQStELEVBQzlELHVCQUFpRTtZQVh6RSxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7WUFDZCxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1lBQ3RCLGlDQUE0QixHQUE1Qiw0QkFBNEIsQ0FBOEI7WUFDOUQsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUEwQjtZQUNyRCwwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBQ3RDLGdDQUEyQixHQUEzQiwyQkFBMkIsQ0FBNkI7WUFDeEUsZ0JBQVcsR0FBWCxXQUFXLENBQWE7WUFDSixvQ0FBK0IsR0FBL0IsK0JBQStCLENBQWlDO1lBRTFFLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFDM0MsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF3QjtZQUM3Qyw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQXlCO1lBcEMxRSxXQUFNLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFHaEQ7Ozs7ZUFJRztZQUNjLHNCQUFpQixHQUFHLElBQUksR0FBRyxFQUFzQyxDQUFDO1lBQ2xFLDRCQUF1QixHQUFHLElBQUksR0FBRyxFQUF3QyxDQUFDO1lBQzFFLHNCQUFpQixHQUFH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