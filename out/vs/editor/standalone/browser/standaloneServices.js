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
define(["require", "exports", "vs/base/common/strings", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/common/event", "vs/base/common/keybindings", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/severity", "vs/base/common/uri", "vs/editor/browser/services/bulkEditService", "vs/editor/common/config/editorConfigurationSchema", "vs/editor/common/core/editOperation", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/services/model", "vs/editor/common/services/resolverService", "vs/editor/common/services/textResourceConfiguration", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationModels", "vs/platform/contextkey/common/contextkey", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/abstractKeybindingService", "vs/platform/keybinding/common/keybinding", "vs/platform/keybinding/common/keybindingResolver", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/keybinding/common/resolvedKeybindingItem", "vs/platform/keybinding/common/usLayoutResolvedKeybinding", "vs/platform/label/common/label", "vs/platform/notification/common/notification", "vs/platform/progress/common/progress", "vs/platform/telemetry/common/telemetry", "vs/platform/workspace/common/workspace", "vs/platform/layout/browser/layoutService", "vs/editor/common/standaloneStrings", "vs/base/common/resources", "vs/editor/browser/services/codeEditorService", "vs/platform/log/common/log", "vs/platform/workspace/common/workspaceTrust", "vs/platform/contextview/browser/contextView", "vs/platform/contextview/browser/contextViewService", "vs/editor/common/services/languageService", "vs/platform/contextview/browser/contextMenuService", "vs/platform/instantiation/common/extensions", "vs/editor/browser/services/openerService", "vs/editor/common/services/editorWorker", "vs/editor/browser/services/editorWorkerService", "vs/editor/common/languages/language", "vs/editor/common/services/markerDecorationsService", "vs/editor/common/services/markerDecorations", "vs/editor/common/services/modelService", "vs/editor/standalone/browser/quickInput/standaloneQuickInputService", "vs/editor/standalone/browser/standaloneThemeService", "vs/editor/standalone/common/standaloneTheme", "vs/platform/accessibility/browser/accessibilityService", "vs/platform/accessibility/common/accessibility", "vs/platform/actions/common/actions", "vs/platform/actions/common/menuService", "vs/platform/clipboard/browser/clipboardService", "vs/platform/clipboard/common/clipboardService", "vs/platform/contextkey/browser/contextKeyService", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/instantiationService", "vs/platform/instantiation/common/serviceCollection", "vs/platform/list/browser/listService", "vs/platform/markers/common/markers", "vs/platform/markers/common/markerService", "vs/platform/opener/common/opener", "vs/platform/quickinput/common/quickInput", "vs/platform/storage/common/storage", "vs/platform/configuration/common/configurations", "vs/platform/audioCues/browser/audioCueService", "vs/platform/log/common/logService", "vs/editor/common/editorFeatures", "vs/base/common/errors", "vs/platform/environment/common/environment", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/standalone/browser/standaloneCodeEditorService", "vs/editor/standalone/browser/standaloneLayoutService", "vs/platform/undoRedo/common/undoRedoService", "vs/editor/common/services/languageFeatureDebounce", "vs/editor/common/services/semanticTokensStylingService", "vs/editor/common/services/languageFeaturesService"], function (require, exports, strings, dom, keyboardEvent_1, event_1, keybindings_1, lifecycle_1, platform_1, severity_1, uri_1, bulkEditService_1, editorConfigurationSchema_1, editOperation_1, position_1, range_1, model_1, resolverService_1, textResourceConfiguration_1, commands_1, configuration_1, configurationModels_1, contextkey_1, dialogs_1, instantiation_1, abstractKeybindingService_1, keybinding_1, keybindingResolver_1, keybindingsRegistry_1, resolvedKeybindingItem_1, usLayoutResolvedKeybinding_1, label_1, notification_1, progress_1, telemetry_1, workspace_1, layoutService_1, standaloneStrings_1, resources_1, codeEditorService_1, log_1, workspaceTrust_1, contextView_1, contextViewService_1, languageService_1, contextMenuService_1, extensions_1, openerService_1, editorWorker_1, editorWorkerService_1, language_1, markerDecorationsService_1, markerDecorations_1, modelService_1, standaloneQuickInputService_1, standaloneThemeService_1, standaloneTheme_1, accessibilityService_1, accessibility_1, actions_1, menuService_1, clipboardService_1, clipboardService_2, contextKeyService_1, descriptors_1, instantiationService_1, serviceCollection_1, listService_1, markers_1, markerService_1, opener_1, quickInput_1, storage_1, configurations_1, audioCueService_1, logService_1, editorFeatures_1, errors_1, environment_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StandaloneServices = exports.updateConfigurationService = exports.StandaloneConfigurationService = exports.StandaloneKeybindingService = exports.StandaloneCommandService = exports.StandaloneNotificationService = void 0;
    class SimpleModel {
        constructor(model) {
            this.disposed = false;
            this.model = model;
            this._onWillDispose = new event_1.Emitter();
        }
        get onWillDispose() {
            return this._onWillDispose.event;
        }
        resolve() {
            return Promise.resolve();
        }
        get textEditorModel() {
            return this.model;
        }
        createSnapshot() {
            return this.model.createSnapshot();
        }
        isReadonly() {
            return false;
        }
        dispose() {
            this.disposed = true;
            this._onWillDispose.fire();
        }
        isDisposed() {
            return this.disposed;
        }
        isResolved() {
            return true;
        }
        getLanguageId() {
            return this.model.getLanguageId();
        }
    }
    let StandaloneTextModelService = class StandaloneTextModelService {
        constructor(modelService) {
            this.modelService = modelService;
        }
        createModelReference(resource) {
            const model = this.modelService.getModel(resource);
            if (!model) {
                return Promise.reject(new Error(`Model not found`));
            }
            return Promise.resolve(new lifecycle_1.ImmortalReference(new SimpleModel(model)));
        }
        registerTextModelContentProvider(scheme, provider) {
            return {
                dispose: function () { }
            };
        }
        canHandleResource(resource) {
            return false;
        }
    };
    StandaloneTextModelService = __decorate([
        __param(0, model_1.IModelService)
    ], StandaloneTextModelService);
    class StandaloneEditorProgressService {
        static { this.NULL_PROGRESS_RUNNER = {
            done: () => { },
            total: () => { },
            worked: () => { }
        }; }
        show() {
            return StandaloneEditorProgressService.NULL_PROGRESS_RUNNER;
        }
        async showWhile(promise, delay) {
            await promise;
        }
    }
    class StandaloneProgressService {
        withProgress(_options, task, onDidCancel) {
            return task({
                report: () => { },
            });
        }
    }
    class StandaloneEnvironmentService {
        constructor() {
            this.stateResource = uri_1.URI.from({ scheme: 'monaco', authority: 'stateResource' });
            this.userRoamingDataHome = uri_1.URI.from({ scheme: 'monaco', authority: 'userRoamingDataHome' });
            this.keyboardLayoutResource = uri_1.URI.from({ scheme: 'monaco', authority: 'keyboardLayoutResource' });
            this.argvResource = uri_1.URI.from({ scheme: 'monaco', authority: 'argvResource' });
            this.untitledWorkspacesHome = uri_1.URI.from({ scheme: 'monaco', authority: 'untitledWorkspacesHome' });
            this.workspaceStorageHome = uri_1.URI.from({ scheme: 'monaco', authority: 'workspaceStorageHome' });
            this.localHistoryHome = uri_1.URI.from({ scheme: 'monaco', authority: 'localHistoryHome' });
            this.cacheHome = uri_1.URI.from({ scheme: 'monaco', authority: 'cacheHome' });
            this.userDataSyncHome = uri_1.URI.from({ scheme: 'monaco', authority: 'userDataSyncHome' });
            this.sync = undefined;
            this.continueOn = undefined;
            this.editSessionId = undefined;
            this.debugExtensionHost = { port: null, break: false };
            this.isExtensionDevelopment = false;
            this.disableExtensions = false;
            this.enableExtensions = undefined;
            this.extensionDevelopmentLocationURI = undefined;
            this.extensionDevelopmentKind = undefined;
            this.extensionTestsLocationURI = undefined;
            this.logsHome = uri_1.URI.from({ scheme: 'monaco', authority: 'logsHome' });
            this.logLevel = undefined;
            this.extensionLogLevel = undefined;
            this.verbose = false;
            this.isBuilt = false;
            this.disableTelemetry = false;
            this.serviceMachineIdResource = uri_1.URI.from({ scheme: 'monaco', authority: 'serviceMachineIdResource' });
            this.policyFile = undefined;
        }
    }
    class StandaloneDialogService {
        constructor() {
            this.onWillShowDialog = event_1.Event.None;
            this.onDidShowDialog = event_1.Event.None;
        }
        async confirm(confirmation) {
            const confirmed = this.doConfirm(confirmation.message, confirmation.detail);
            return {
                confirmed,
                checkboxChecked: false // unsupported
            };
        }
        doConfirm(message, detail) {
            let messageText = message;
            if (detail) {
                messageText = messageText + '\n\n' + detail;
            }
            return window.confirm(messageText);
        }
        async prompt(prompt) {
            let result = undefined;
            const confirmed = this.doConfirm(prompt.message, prompt.detail);
            if (confirmed) {
                const promptButtons = [...(prompt.buttons ?? [])];
                if (prompt.cancelButton && typeof prompt.cancelButton !== 'string' && typeof prompt.cancelButton !== 'boolean') {
                    promptButtons.push(prompt.cancelButton);
                }
                result = await promptButtons[0]?.run({ checkboxChecked: false });
            }
            return { result };
        }
        async info(message, detail) {
            await this.prompt({ type: severity_1.default.Info, message, detail });
        }
        async warn(message, detail) {
            await this.prompt({ type: severity_1.default.Warning, message, detail });
        }
        async error(message, detail) {
            await this.prompt({ type: severity_1.default.Error, message, detail });
        }
        input() {
            return Promise.resolve({ confirmed: false }); // unsupported
        }
        about() {
            return Promise.resolve(undefined);
        }
    }
    class StandaloneNotificationService {
        constructor() {
            this.onDidAddNotification = event_1.Event.None;
            this.onDidRemoveNotification = event_1.Event.None;
            this.onDidChangeDoNotDisturbMode = event_1.Event.None;
            this.doNotDisturbMode = false;
        }
        static { this.NO_OP = new notification_1.NoOpNotification(); }
        info(message) {
            return this.notify({ severity: severity_1.default.Info, message });
        }
        warn(message) {
            return this.notify({ severity: severity_1.default.Warning, message });
        }
        error(error) {
            return this.notify({ severity: severity_1.default.Error, message: error });
        }
        notify(notification) {
            switch (notification.severity) {
                case severity_1.default.Error:
                    console.error(notification.message);
                    break;
                case severity_1.default.Warning:
                    console.warn(notification.message);
                    break;
                default:
                    console.log(notification.message);
                    break;
            }
            return StandaloneNotificationService.NO_OP;
        }
        prompt(severity, message, choices, options) {
            return StandaloneNotificationService.NO_OP;
        }
        status(message, options) {
            return lifecycle_1.Disposable.None;
        }
    }
    exports.StandaloneNotificationService = StandaloneNotificationService;
    let StandaloneCommandService = class StandaloneCommandService {
        constructor(instantiationService) {
            this._onWillExecuteCommand = new event_1.Emitter();
            this._onDidExecuteCommand = new event_1.Emitter();
            this.onWillExecuteCommand = this._onWillExecuteCommand.event;
            this.onDidExecuteCommand = this._onDidExecuteCommand.event;
            this._instantiationService = instantiationService;
        }
        executeCommand(id, ...args) {
            const command = commands_1.CommandsRegistry.getCommand(id);
            if (!command) {
                return Promise.reject(new Error(`command '${id}' not found`));
            }
            try {
                this._onWillExecuteCommand.fire({ commandId: id, args });
                const result = this._instantiationService.invokeFunction.apply(this._instantiationService, [command.handler, ...args]);
                this._onDidExecuteCommand.fire({ commandId: id, args });
                return Promise.resolve(result);
            }
            catch (err) {
                return Promise.reject(err);
            }
        }
    };
    exports.StandaloneCommandService = StandaloneCommandService;
    exports.StandaloneCommandService = StandaloneCommandService = __decorate([
        __param(0, instantiation_1.IInstantiationService)
    ], StandaloneCommandService);
    let StandaloneKeybindingService = class StandaloneKeybindingService extends abstractKeybindingService_1.AbstractKeybindingService {
        constructor(contextKeyService, commandService, telemetryService, notificationService, logService, codeEditorService) {
            super(contextKeyService, commandService, telemetryService, notificationService, logService);
            this._cachedResolver = null;
            this._dynamicKeybindings = [];
            this._domNodeListeners = [];
            const addContainer = (domNode) => {
                const disposables = new lifecycle_1.DisposableStore();
                // for standard keybindings
                disposables.add(dom.addDisposableListener(domNode, dom.EventType.KEY_DOWN, (e) => {
                    const keyEvent = new keyboardEvent_1.StandardKeyboardEvent(e);
                    const shouldPreventDefault = this._dispatch(keyEvent, keyEvent.target);
                    if (shouldPreventDefault) {
                        keyEvent.preventDefault();
                        keyEvent.stopPropagation();
                    }
                }));
                // for single modifier chord keybindings (e.g. shift shift)
                disposables.add(dom.addDisposableListener(domNode, dom.EventType.KEY_UP, (e) => {
                    const keyEvent = new keyboardEvent_1.StandardKeyboardEvent(e);
                    const shouldPreventDefault = this._singleModifierDispatch(keyEvent, keyEvent.target);
                    if (shouldPreventDefault) {
                        keyEvent.preventDefault();
                    }
                }));
                this._domNodeListeners.push(new DomNodeListeners(domNode, disposables));
            };
            const removeContainer = (domNode) => {
                for (let i = 0; i < this._domNodeListeners.length; i++) {
                    const domNodeListeners = this._domNodeListeners[i];
                    if (domNodeListeners.domNode === domNode) {
                        this._domNodeListeners.splice(i, 1);
                        domNodeListeners.dispose();
                    }
                }
            };
            const addCodeEditor = (codeEditor) => {
                if (codeEditor.getOption(61 /* EditorOption.inDiffEditor */)) {
                    return;
                }
                addContainer(codeEditor.getContainerDomNode());
            };
            const removeCodeEditor = (codeEditor) => {
                if (codeEditor.getOption(61 /* EditorOption.inDiffEditor */)) {
                    return;
                }
                removeContainer(codeEditor.getContainerDomNode());
            };
            this._register(codeEditorService.onCodeEditorAdd(addCodeEditor));
            this._register(codeEditorService.onCodeEditorRemove(removeCodeEditor));
            codeEditorService.listCodeEditors().forEach(addCodeEditor);
            const addDiffEditor = (diffEditor) => {
                addContainer(diffEditor.getContainerDomNode());
            };
            const removeDiffEditor = (diffEditor) => {
                removeContainer(diffEditor.getContainerDomNode());
            };
            this._register(codeEditorService.onDiffEditorAdd(addDiffEditor));
            this._register(codeEditorService.onDiffEditorRemove(removeDiffEditor));
            codeEditorService.listDiffEditors().forEach(addDiffEditor);
        }
        addDynamicKeybinding(command, keybinding, handler, when) {
            return (0, lifecycle_1.combinedDisposable)(commands_1.CommandsRegistry.registerCommand(command, handler), this.addDynamicKeybindings([{
                    keybinding,
                    command,
                    when
                }]));
        }
        addDynamicKeybindings(rules) {
            const entries = rules.map((rule) => {
                const keybinding = (0, keybindings_1.decodeKeybinding)(rule.keybinding, platform_1.OS);
                return {
                    keybinding,
                    command: rule.command ?? null,
                    commandArgs: rule.commandArgs,
                    when: rule.when,
                    weight1: 1000,
                    weight2: 0,
                    extensionId: null,
                    isBuiltinExtension: false
                };
            });
            this._dynamicKeybindings = this._dynamicKeybindings.concat(entries);
            this.updateResolver();
            return (0, lifecycle_1.toDisposable)(() => {
                // Search the first entry and remove them all since they will be contiguous
                for (let i = 0; i < this._dynamicKeybindings.length; i++) {
                    if (this._dynamicKeybindings[i] === entries[0]) {
                        this._dynamicKeybindings.splice(i, entries.length);
                        this.updateResolver();
                        return;
                    }
                }
            });
        }
        updateResolver() {
            this._cachedResolver = null;
            this._onDidUpdateKeybindings.fire();
        }
        _getResolver() {
            if (!this._cachedResolver) {
                const defaults = this._toNormalizedKeybindingItems(keybindingsRegistry_1.KeybindingsRegistry.getDefaultKeybindings(), true);
                const overrides = this._toNormalizedKeybindingItems(this._dynamicKeybindings, false);
                this._cachedResolver = new keybindingResolver_1.KeybindingResolver(defaults, overrides, (str) => this._log(str));
            }
            return this._cachedResolver;
        }
        _documentHasFocus() {
            return document.hasFocus();
        }
        _toNormalizedKeybindingItems(items, isDefault) {
            const result = [];
            let resultLen = 0;
            for (const item of items) {
                const when = item.when || undefined;
                const keybinding = item.keybinding;
                if (!keybinding) {
                    // This might be a removal keybinding item in user settings => accept it
                    result[resultLen++] = new resolvedKeybindingItem_1.ResolvedKeybindingItem(undefined, item.command, item.commandArgs, when, isDefault, null, false);
                }
                else {
                    const resolvedKeybindings = usLayoutResolvedKeybinding_1.USLayoutResolvedKeybinding.resolveKeybinding(keybinding, platform_1.OS);
                    for (const resolvedKeybinding of resolvedKeybindings) {
                        result[resultLen++] = new resolvedKeybindingItem_1.ResolvedKeybindingItem(resolvedKeybinding, item.command, item.commandArgs, when, isDefault, null, false);
                    }
                }
            }
            return result;
        }
        resolveKeybinding(keybinding) {
            return usLayoutResolvedKeybinding_1.USLayoutResolvedKeybinding.resolveKeybinding(keybinding, platform_1.OS);
        }
        resolveKeyboardEvent(keyboardEvent) {
            const chord = new keybindings_1.KeyCodeChord(keyboardEvent.ctrlKey, keyboardEvent.shiftKey, keyboardEvent.altKey, keyboardEvent.metaKey, keyboardEvent.keyCode);
            return new usLayoutResolvedKeybinding_1.USLayoutResolvedKeybinding([chord], platform_1.OS);
        }
        resolveUserBinding(userBinding) {
            return [];
        }
        _dumpDebugInfo() {
            return '';
        }
        _dumpDebugInfoJSON() {
            return '';
        }
        registerSchemaContribution(contribution) {
            // noop
        }
    };
    exports.StandaloneKeybindingService = StandaloneKeybindingService;
    exports.StandaloneKeybindingService = StandaloneKeybindingService = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, commands_1.ICommandService),
        __param(2, telemetry_1.ITelemetryService),
        __param(3, notification_1.INotificationService),
        __param(4, log_1.ILogService),
        __param(5, codeEditorService_1.ICodeEditorService)
    ], StandaloneKeybindingService);
    class DomNodeListeners extends lifecycle_1.Disposable {
        constructor(domNode, disposables) {
            super();
            this.domNode = domNode;
            this._register(disposables);
        }
    }
    function isConfigurationOverrides(thing) {
        return thing
            && typeof thing === 'object'
            && (!thing.overrideIdentifier || typeof thing.overrideIdentifier === 'string')
            && (!thing.resource || thing.resource instanceof uri_1.URI);
    }
    class StandaloneConfigurationService {
        constructor() {
            this._onDidChangeConfiguration = new event_1.Emitter();
            this.onDidChangeConfiguration = this._onDidChangeConfiguration.event;
            const defaultConfiguration = new configurations_1.DefaultConfiguration();
            this._configuration = new configurationModels_1.Configuration(defaultConfiguration.reload(), new configurationModels_1.ConfigurationModel(), new configurationModels_1.ConfigurationModel(), new configurationModels_1.ConfigurationModel());
            defaultConfiguration.dispose();
        }
        getValue(arg1, arg2) {
            const section = typeof arg1 === 'string' ? arg1 : undefined;
            const overrides = isConfigurationOverrides(arg1) ? arg1 : isConfigurationOverrides(arg2) ? arg2 : {};
            return this._configuration.getValue(section, overrides, undefined);
        }
        updateValues(values) {
            const previous = { data: this._configuration.toData() };
            const changedKeys = [];
            for (const entry of values) {
                const [key, value] = entry;
                if (this.getValue(key) === value) {
                    continue;
                }
                this._configuration.updateValue(key, value);
                changedKeys.push(key);
            }
            if (changedKeys.length > 0) {
                const configurationChangeEvent = new configurationModels_1.ConfigurationChangeEvent({ keys: changedKeys, overrides: [] }, previous, this._configuration);
                configurationChangeEvent.source = 8 /* ConfigurationTarget.MEMORY */;
                configurationChangeEvent.sourceConfig = null;
                this._onDidChangeConfiguration.fire(configurationChangeEvent);
            }
            return Promise.resolve();
        }
        updateValue(key, value, arg3, arg4) {
            return this.updateValues([[key, value]]);
        }
        inspect(key, options = {}) {
            return this._configuration.inspect(key, options, undefined);
        }
        keys() {
            return this._configuration.keys(undefined);
        }
        reloadConfiguration() {
            return Promise.resolve(undefined);
        }
        getConfigurationData() {
            const emptyModel = {
                contents: {},
                keys: [],
                overrides: []
            };
            return {
                defaults: emptyModel,
                policy: emptyModel,
                application: emptyModel,
                user: emptyModel,
                workspace: emptyModel,
                folders: []
            };
        }
    }
    exports.StandaloneConfigurationService = StandaloneConfigurationService;
    let StandaloneResourceConfigurationService = class StandaloneResourceConfigurationService {
        constructor(configurationService, modelService, languageService) {
            this.configurationService = configurationService;
            this.modelService = modelService;
            this.languageService = languageService;
            this._onDidChangeConfiguration = new event_1.Emitter();
            this.onDidChangeConfiguration = this._onDidChangeConfiguration.event;
            this.configurationService.onDidChangeConfiguration((e) => {
                this._onDidChangeConfiguration.fire({ affectedKeys: e.affectedKeys, affectsConfiguration: (resource, configuration) => e.affectsConfiguration(configuration) });
            });
        }
        getValue(resource, arg2, arg3) {
            const position = position_1.Position.isIPosition(arg2) ? arg2 : null;
            const section = position ? (typeof arg3 === 'string' ? arg3 : undefined) : (typeof arg2 === 'string' ? arg2 : undefined);
            const language = resource ? this.getLanguage(resource, position) : undefined;
            if (typeof section === 'undefined') {
                return this.configurationService.getValue({
                    resource,
                    overrideIdentifier: language
                });
            }
            return this.configurationService.getValue(section, {
                resource,
                overrideIdentifier: language
            });
        }
        inspect(resource, position, section) {
            const language = resource ? this.getLanguage(resource, position) : undefined;
            return this.configurationService.inspect(section, { resource, overrideIdentifier: language });
        }
        getLanguage(resource, position) {
            const model = this.modelService.getModel(resource);
            if (model) {
                return position ? model.getLanguageIdAtPosition(position.lineNumber, position.column) : model.getLanguageId();
            }
            return this.languageService.guessLanguageIdByFilepathOrFirstLine(resource);
        }
        updateValue(resource, key, value, configurationTarget) {
            return this.configurationService.updateValue(key, value, { resource }, configurationTarget);
        }
    };
    StandaloneResourceConfigurationService = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, model_1.IModelService),
        __param(2, language_1.ILanguageService)
    ], StandaloneResourceConfigurationService);
    let StandaloneResourcePropertiesService = class StandaloneResourcePropertiesService {
        constructor(configurationService) {
            this.configurationService = configurationService;
        }
        getEOL(resource, language) {
            const eol = this.configurationService.getValue('files.eol', { overrideIdentifier: language, resource });
            if (eol && typeof eol === 'string' && eol !== 'auto') {
                return eol;
            }
            return (platform_1.isLinux || platform_1.isMacintosh) ? '\n' : '\r\n';
        }
    };
    StandaloneResourcePropertiesService = __decorate([
        __param(0, configuration_1.IConfigurationService)
    ], StandaloneResourcePropertiesService);
    class StandaloneTelemetryService {
        constructor() {
            this.telemetryLevel = 0 /* TelemetryLevel.NONE */;
            this.sessionId = 'someValue.sessionId';
            this.machineId = 'someValue.machineId';
            this.firstSessionDate = 'someValue.firstSessionDate';
            this.sendErrorTelemetry = false;
        }
        setEnabled() { }
        setExperimentProperty() { }
        publicLog() { }
        publicLog2() { }
        publicLogError() { }
        publicLogError2() { }
    }
    class StandaloneWorkspaceContextService {
        static { this.SCHEME = 'inmemory'; }
        constructor() {
            this._onDidChangeWorkspaceName = new event_1.Emitter();
            this.onDidChangeWorkspaceName = this._onDidChangeWorkspaceName.event;
            this._onWillChangeWorkspaceFolders = new event_1.Emitter();
            this.onWillChangeWorkspaceFolders = this._onWillChangeWorkspaceFolders.event;
            this._onDidChangeWorkspaceFolders = new event_1.Emitter();
            this.onDidChangeWorkspaceFolders = this._onDidChangeWorkspaceFolders.event;
            this._onDidChangeWorkbenchState = new event_1.Emitter();
            this.onDidChangeWorkbenchState = this._onDidChangeWorkbenchState.event;
            const resource = uri_1.URI.from({ scheme: StandaloneWorkspaceContextService.SCHEME, authority: 'model', path: '/' });
            this.workspace = { id: workspace_1.STANDALONE_EDITOR_WORKSPACE_ID, folders: [new workspace_1.WorkspaceFolder({ uri: resource, name: '', index: 0 })] };
        }
        getCompleteWorkspace() {
            return Promise.resolve(this.getWorkspace());
        }
        getWorkspace() {
            return this.workspace;
        }
        getWorkbenchState() {
            if (this.workspace) {
                if (this.workspace.configuration) {
                    return 3 /* WorkbenchState.WORKSPACE */;
                }
                return 2 /* WorkbenchState.FOLDER */;
            }
            return 1 /* WorkbenchState.EMPTY */;
        }
        getWorkspaceFolder(resource) {
            return resource && resource.scheme === StandaloneWorkspaceContextService.SCHEME ? this.workspace.folders[0] : null;
        }
        isInsideWorkspace(resource) {
            return resource && resource.scheme === StandaloneWorkspaceContextService.SCHEME;
        }
        isCurrentWorkspace(workspaceIdOrFolder) {
            return true;
        }
    }
    function updateConfigurationService(configurationService, source, isDiffEditor) {
        if (!source) {
            return;
        }
        if (!(configurationService instanceof StandaloneConfigurationService)) {
            return;
        }
        const toUpdate = [];
        Object.keys(source).forEach((key) => {
            if ((0, editorConfigurationSchema_1.isEditorConfigurationKey)(key)) {
                toUpdate.push([`editor.${key}`, source[key]]);
            }
            if (isDiffEditor && (0, editorConfigurationSchema_1.isDiffEditorConfigurationKey)(key)) {
                toUpdate.push([`diffEditor.${key}`, source[key]]);
            }
        });
        if (toUpdate.length > 0) {
            configurationService.updateValues(toUpdate);
        }
    }
    exports.updateConfigurationService = updateConfigurationService;
    let StandaloneBulkEditService = class StandaloneBulkEditService {
        constructor(_modelService) {
            this._modelService = _modelService;
            //
        }
        hasPreviewHandler() {
            return false;
        }
        setPreviewHandler() {
            return lifecycle_1.Disposable.None;
        }
        async apply(editsIn, _options) {
            const edits = Array.isArray(editsIn) ? editsIn : bulkEditService_1.ResourceEdit.convert(editsIn);
            const textEdits = new Map();
            for (const edit of edits) {
                if (!(edit instanceof bulkEditService_1.ResourceTextEdit)) {
                    throw new Error('bad edit - only text edits are supported');
                }
                const model = this._modelService.getModel(edit.resource);
                if (!model) {
                    throw new Error('bad edit - model not found');
                }
                if (typeof edit.versionId === 'number' && model.getVersionId() !== edit.versionId) {
                    throw new Error('bad state - model changed in the meantime');
                }
                let array = textEdits.get(model);
                if (!array) {
                    array = [];
                    textEdits.set(model, array);
                }
                array.push(editOperation_1.EditOperation.replaceMove(range_1.Range.lift(edit.textEdit.range), edit.textEdit.text));
            }
            let totalEdits = 0;
            let totalFiles = 0;
            for (const [model, edits] of textEdits) {
                model.pushStackElement();
                model.pushEditOperations([], edits, () => []);
                model.pushStackElement();
                totalFiles += 1;
                totalEdits += edits.length;
            }
            return {
                ariaSummary: strings.format(standaloneStrings_1.StandaloneServicesNLS.bulkEditServiceSummary, totalEdits, totalFiles),
                isApplied: totalEdits > 0
            };
        }
    };
    StandaloneBulkEditService = __decorate([
        __param(0, model_1.IModelService)
    ], StandaloneBulkEditService);
    class StandaloneUriLabelService {
        constructor() {
            this.onDidChangeFormatters = event_1.Event.None;
        }
        getUriLabel(resource, options) {
            if (resource.scheme === 'file') {
                return resource.fsPath;
            }
            return resource.path;
        }
        getUriBasenameLabel(resource) {
            return (0, resources_1.basename)(resource);
        }
        getWorkspaceLabel(workspace, options) {
            return '';
        }
        getSeparator(scheme, authority) {
            return '/';
        }
        registerFormatter(formatter) {
            throw new Error('Not implemented');
        }
        registerCachedFormatter(formatter) {
            return this.registerFormatter(formatter);
        }
        getHostLabel() {
            return '';
        }
        getHostTooltip() {
            return undefined;
        }
    }
    let StandaloneContextViewService = class StandaloneContextViewService extends contextViewService_1.ContextViewService {
        constructor(layoutService, _codeEditorService) {
            super(layoutService);
            this._codeEditorService = _codeEditorService;
        }
        showContextView(delegate, container, shadowRoot) {
            if (!container) {
                const codeEditor = this._codeEditorService.getFocusedCodeEditor() || this._codeEditorService.getActiveCodeEditor();
                if (codeEditor) {
                    container = codeEditor.getContainerDomNode();
                }
            }
            return super.showContextView(delegate, container, shadowRoot);
        }
    };
    StandaloneContextViewService = __decorate([
        __param(0, layoutService_1.ILayoutService),
        __param(1, codeEditorService_1.ICodeEditorService)
    ], StandaloneContextViewService);
    class StandaloneWorkspaceTrustManagementService {
        constructor() {
            this._neverEmitter = new event_1.Emitter();
            this.onDidChangeTrust = this._neverEmitter.event;
            this.onDidChangeTrustedFolders = this._neverEmitter.event;
            this.workspaceResolved = Promise.resolve();
            this.workspaceTrustInitialized = Promise.resolve();
            this.acceptsOutOfWorkspaceFiles = true;
        }
        isWorkspaceTrusted() {
            return true;
        }
        isWorkspaceTrustForced() {
            return false;
        }
        canSetParentFolderTrust() {
            return false;
        }
        async setParentFolderTrust(trusted) {
            // noop
        }
        canSetWorkspaceTrust() {
            return false;
        }
        async setWorkspaceTrust(trusted) {
            // noop
        }
        getUriTrustInfo(uri) {
            throw new Error('Method not supported.');
        }
        async setUrisTrust(uri, trusted) {
            // noop
        }
        getTrustedUris() {
            return [];
        }
        async setTrustedUris(uris) {
            // noop
        }
        addWorkspaceTrustTransitionParticipant(participant) {
            throw new Error('Method not supported.');
        }
    }
    class StandaloneLanguageService extends languageService_1.LanguageService {
        constructor() {
            super();
        }
    }
    class StandaloneLogService extends logService_1.LogService {
        constructor() {
            super(new log_1.ConsoleLogger());
        }
    }
    let StandaloneContextMenuService = class StandaloneContextMenuService extends contextMenuService_1.ContextMenuService {
        constructor(telemetryService, notificationService, contextViewService, keybindingService, menuService, contextKeyService) {
            super(telemetryService, notificationService, contextViewService, keybindingService, menuService, contextKeyService);
            this.configure({ blockMouse: false }); // we do not want that in the standalone editor
        }
    };
    StandaloneContextMenuService = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, notification_1.INotificationService),
        __param(2, contextView_1.IContextViewService),
        __param(3, keybinding_1.IKeybindingService),
        __param(4, actions_1.IMenuService),
        __param(5, contextkey_1.IContextKeyService)
    ], StandaloneContextMenuService);
    class StandaloneAudioService {
        async playAudioCue(cue, options) {
        }
        async playAudioCues(cues) {
        }
        isEnabled(cue) {
            return false;
        }
        onEnabledChanged(cue) {
            return event_1.Event.None;
        }
        async playSound(cue, allowManyInParallel) {
        }
        playAudioCueLoop(cue) {
            return (0, lifecycle_1.toDisposable)(() => { });
        }
    }
    (0, extensions_1.registerSingleton)(configuration_1.IConfigurationService, StandaloneConfigurationService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.registerSingleton)(textResourceConfiguration_1.ITextResourceConfigurationService, StandaloneResourceConfigurationService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.registerSingleton)(textResourceConfiguration_1.ITextResourcePropertiesService, StandaloneResourcePropertiesService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.registerSingleton)(workspace_1.IWorkspaceContextService, StandaloneWorkspaceContextService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.registerSingleton)(label_1.ILabelService, StandaloneUriLabelService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.registerSingleton)(telemetry_1.ITelemetryService, StandaloneTelemetryService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.registerSingleton)(dialogs_1.IDialogService, StandaloneDialogService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.registerSingleton)(environment_1.IEnvironmentService, StandaloneEnvironmentService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.registerSingleton)(notification_1.INotificationService, StandaloneNotificationService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.registerSingleton)(markers_1.IMarkerService, markerService_1.MarkerService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.registerSingleton)(language_1.ILanguageService, StandaloneLanguageService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.registerSingleton)(standaloneTheme_1.IStandaloneThemeService, standaloneThemeService_1.StandaloneThemeService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.registerSingleton)(log_1.ILogService, StandaloneLogService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.registerSingleton)(model_1.IModelService, modelService_1.ModelService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.registerSingleton)(markerDecorations_1.IMarkerDecorationsService, markerDecorationsService_1.MarkerDecorationsService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.registerSingleton)(contextkey_1.IContextKeyService, contextKeyService_1.ContextKeyService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.registerSingleton)(progress_1.IProgressService, StandaloneProgressService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.registerSingleton)(progress_1.IEditorProgressService, StandaloneEditorProgressService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.registerSingleton)(storage_1.IStorageService, storage_1.InMemoryStorageService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.registerSingleton)(editorWorker_1.IEditorWorkerService, editorWorkerService_1.EditorWorkerService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.registerSingleton)(bulkEditService_1.IBulkEditService, StandaloneBulkEditService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.registerSingleton)(workspaceTrust_1.IWorkspaceTrustManagementService, StandaloneWorkspaceTrustManagementService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.registerSingleton)(resolverService_1.ITextModelService, StandaloneTextModelService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.registerSingleton)(accessibility_1.IAccessibilityService, accessibilityService_1.AccessibilityService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.registerSingleton)(listService_1.IListService, listService_1.ListService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.registerSingleton)(commands_1.ICommandService, StandaloneCommandService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.registerSingleton)(keybinding_1.IKeybindingService, StandaloneKeybindingService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.registerSingleton)(quickInput_1.IQuickInputService, standaloneQuickInputService_1.StandaloneQuickInputService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.registerSingleton)(contextView_1.IContextViewService, StandaloneContextViewService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.registerSingleton)(opener_1.IOpenerService, openerService_1.OpenerService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.registerSingleton)(clipboardService_2.IClipboardService, clipboardService_1.BrowserClipboardService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.registerSingleton)(contextView_1.IContextMenuService, StandaloneContextMenuService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.registerSingleton)(actions_1.IMenuService, menuService_1.MenuService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.registerSingleton)(audioCueService_1.IAudioCueService, StandaloneAudioService, 0 /* InstantiationType.Eager */);
    /**
     * We don't want to eagerly instantiate services because embedders get a one time chance
     * to override services when they create the first editor.
     */
    var StandaloneServices;
    (function (StandaloneServices) {
        const serviceCollection = new serviceCollection_1.ServiceCollection();
        for (const [id, descriptor] of (0, extensions_1.getSingletonServiceDescriptors)()) {
            serviceCollection.set(id, descriptor);
        }
        const instantiationService = new instantiationService_1.InstantiationService(serviceCollection, true);
        serviceCollection.set(instantiation_1.IInstantiationService, instantiationService);
        function get(serviceId) {
            if (!initialized) {
                initialize({});
            }
            const r = serviceCollection.get(serviceId);
            if (!r) {
                throw new Error('Missing service ' + serviceId);
            }
            if (r instanceof descriptors_1.SyncDescriptor) {
                return instantiationService.invokeFunction((accessor) => accessor.get(serviceId));
            }
            else {
                return r;
            }
        }
        StandaloneServices.get = get;
        let initialized = false;
        const onDidInitialize = new event_1.Emitter();
        function initialize(overrides) {
            if (initialized) {
                return instantiationService;
            }
            initialized = true;
            // Add singletons that were registered after this module loaded
            for (const [id, descriptor] of (0, extensions_1.getSingletonServiceDescriptors)()) {
                if (!serviceCollection.get(id)) {
                    serviceCollection.set(id, descriptor);
                }
            }
            // Initialize the service collection with the overrides, but only if the
            // service was not instantiated in the meantime.
            for (const serviceId in overrides) {
                if (overrides.hasOwnProperty(serviceId)) {
                    const serviceIdentifier = (0, instantiation_1.createDecorator)(serviceId);
                    const r = serviceCollection.get(serviceIdentifier);
                    if (r instanceof descriptors_1.SyncDescriptor) {
                        serviceCollection.set(serviceIdentifier, overrides[serviceId]);
                    }
                }
            }
            // Instantiate all editor features
            const editorFeatures = (0, editorFeatures_1.getEditorFeatures)();
            for (const feature of editorFeatures) {
                try {
                    instantiationService.createInstance(feature);
                }
                catch (err) {
                    (0, errors_1.onUnexpectedError)(err);
                }
            }
            onDidInitialize.fire();
            return instantiationService;
        }
        StandaloneServices.initialize = initialize;
        /**
         * Executes callback once services are initialized.
         */
        function withServices(callback) {
            if (initialized) {
                return callback();
            }
            const disposable = new lifecycle_1.DisposableStore();
            const listener = disposable.add(onDidInitialize.event(() => {
                listener.dispose();
                disposable.add(callback());
            }));
            return disposable;
        }
        StandaloneServices.withServices = withServices;
    })(StandaloneServices || (exports.StandaloneServices = StandaloneServices = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhbmRhbG9uZVNlcnZpY2VzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL3N0YW5kYWxvbmUvYnJvd3Nlci9zdGFuZGFsb25lU2VydmljZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBNEZoRyxNQUFNLFdBQVc7UUFLaEIsWUFBWSxLQUFpQjtZQXlCckIsYUFBUSxHQUFHLEtBQUssQ0FBQztZQXhCeEIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDbkIsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLGVBQU8sRUFBUSxDQUFDO1FBQzNDLENBQUM7UUFFRCxJQUFXLGFBQWE7WUFDdkIsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQztRQUNsQyxDQUFDO1FBRU0sT0FBTztZQUNiLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzFCLENBQUM7UUFFRCxJQUFXLGVBQWU7WUFDekIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ25CLENBQUM7UUFFTSxjQUFjO1lBQ3BCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUNwQyxDQUFDO1FBRU0sVUFBVTtZQUNoQixPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFHTSxPQUFPO1lBQ2IsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7WUFFckIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUM1QixDQUFDO1FBRU0sVUFBVTtZQUNoQixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDdEIsQ0FBQztRQUVNLFVBQVU7WUFDaEIsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDbkMs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