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
    exports.StandaloneServices = exports.$Y8b = exports.$X8b = exports.$W8b = exports.$V8b = exports.$U8b = void 0;
    class SimpleModel {
        constructor(model) {
            this.c = false;
            this.a = model;
            this.b = new event_1.$fd();
        }
        get onWillDispose() {
            return this.b.event;
        }
        resolve() {
            return Promise.resolve();
        }
        get textEditorModel() {
            return this.a;
        }
        createSnapshot() {
            return this.a.createSnapshot();
        }
        isReadonly() {
            return false;
        }
        dispose() {
            this.c = true;
            this.b.fire();
        }
        isDisposed() {
            return this.c;
        }
        isResolved() {
            return true;
        }
        getLanguageId() {
            return this.a.getLanguageId();
        }
    }
    let StandaloneTextModelService = class StandaloneTextModelService {
        constructor(a) {
            this.a = a;
        }
        createModelReference(resource) {
            const model = this.a.getModel(resource);
            if (!model) {
                return Promise.reject(new Error(`Model not found`));
            }
            return Promise.resolve(new lifecycle_1.$qc(new SimpleModel(model)));
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
        __param(0, model_1.$yA)
    ], StandaloneTextModelService);
    class StandaloneEditorProgressService {
        static { this.a = {
            done: () => { },
            total: () => { },
            worked: () => { }
        }; }
        show() {
            return StandaloneEditorProgressService.a;
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
            const confirmed = this.a(confirmation.message, confirmation.detail);
            return {
                confirmed,
                checkboxChecked: false // unsupported
            };
        }
        a(message, detail) {
            let messageText = message;
            if (detail) {
                messageText = messageText + '\n\n' + detail;
            }
            return window.confirm(messageText);
        }
        async prompt(prompt) {
            let result = undefined;
            const confirmed = this.a(prompt.message, prompt.detail);
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
    class $U8b {
        constructor() {
            this.onDidAddNotification = event_1.Event.None;
            this.onDidRemoveNotification = event_1.Event.None;
            this.onDidChangeDoNotDisturbMode = event_1.Event.None;
            this.doNotDisturbMode = false;
        }
        static { this.a = new notification_1.$Zu(); }
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
            return $U8b.a;
        }
        prompt(severity, message, choices, options) {
            return $U8b.a;
        }
        status(message, options) {
            return lifecycle_1.$kc.None;
        }
    }
    exports.$U8b = $U8b;
    let $V8b = class $V8b {
        constructor(instantiationService) {
            this.b = new event_1.$fd();
            this.c = new event_1.$fd();
            this.onWillExecuteCommand = this.b.event;
            this.onDidExecuteCommand = this.c.event;
            this.a = instantiationService;
        }
        executeCommand(id, ...args) {
            const command = commands_1.$Gr.getCommand(id);
            if (!command) {
                return Promise.reject(new Error(`command '${id}' not found`));
            }
            try {
                this.b.fire({ commandId: id, args });
                const result = this.a.invokeFunction.apply(this.a, [command.handler, ...args]);
                this.c.fire({ commandId: id, args });
                return Promise.resolve(result);
            }
            catch (err) {
                return Promise.reject(err);
            }
        }
    };
    exports.$V8b = $V8b;
    exports.$V8b = $V8b = __decorate([
        __param(0, instantiation_1.$Ah)
    ], $V8b);
    let $W8b = class $W8b extends abstractKeybindingService_1.$Ryb {
        constructor(contextKeyService, commandService, telemetryService, notificationService, logService, codeEditorService) {
            super(contextKeyService, commandService, telemetryService, notificationService, logService);
            this.M = null;
            this.N = [];
            this.O = [];
            const addContainer = (domNode) => {
                const disposables = new lifecycle_1.$jc();
                // for standard keybindings
                disposables.add(dom.$nO(domNode, dom.$3O.KEY_DOWN, (e) => {
                    const keyEvent = new keyboardEvent_1.$jO(e);
                    const shouldPreventDefault = this.I(keyEvent, keyEvent.target);
                    if (shouldPreventDefault) {
                        keyEvent.preventDefault();
                        keyEvent.stopPropagation();
                    }
                }));
                // for single modifier chord keybindings (e.g. shift shift)
                disposables.add(dom.$nO(domNode, dom.$3O.KEY_UP, (e) => {
                    const keyEvent = new keyboardEvent_1.$jO(e);
                    const shouldPreventDefault = this.J(keyEvent, keyEvent.target);
                    if (shouldPreventDefault) {
                        keyEvent.preventDefault();
                    }
                }));
                this.O.push(new DomNodeListeners(domNode, disposables));
            };
            const removeContainer = (domNode) => {
                for (let i = 0; i < this.O.length; i++) {
                    const domNodeListeners = this.O[i];
                    if (domNodeListeners.domNode === domNode) {
                        this.O.splice(i, 1);
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
            this.B(codeEditorService.onCodeEditorAdd(addCodeEditor));
            this.B(codeEditorService.onCodeEditorRemove(removeCodeEditor));
            codeEditorService.listCodeEditors().forEach(addCodeEditor);
            const addDiffEditor = (diffEditor) => {
                addContainer(diffEditor.getContainerDomNode());
            };
            const removeDiffEditor = (diffEditor) => {
                removeContainer(diffEditor.getContainerDomNode());
            };
            this.B(codeEditorService.onDiffEditorAdd(addDiffEditor));
            this.B(codeEditorService.onDiffEditorRemove(removeDiffEditor));
            codeEditorService.listDiffEditors().forEach(addDiffEditor);
        }
        addDynamicKeybinding(command, keybinding, handler, when) {
            return (0, lifecycle_1.$hc)(commands_1.$Gr.registerCommand(command, handler), this.addDynamicKeybindings([{
                    keybinding,
                    command,
                    when
                }]));
        }
        addDynamicKeybindings(rules) {
            const entries = rules.map((rule) => {
                const keybinding = (0, keybindings_1.$wq)(rule.keybinding, platform_1.OS);
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
            this.N = this.N.concat(entries);
            this.P();
            return (0, lifecycle_1.$ic)(() => {
                // Search the first entry and remove them all since they will be contiguous
                for (let i = 0; i < this.N.length; i++) {
                    if (this.N[i] === entries[0]) {
                        this.N.splice(i, entries.length);
                        this.P();
                        return;
                    }
                }
            });
        }
        P() {
            this.M = null;
            this.a.fire();
        }
        y() {
            if (!this.M) {
                const defaults = this.U(keybindingsRegistry_1.$Nu.getDefaultKeybindings(), true);
                const overrides = this.U(this.N, false);
                this.M = new keybindingResolver_1.$1D(defaults, overrides, (str) => this.D(str));
            }
            return this.M;
        }
        z() {
            return document.hasFocus();
        }
        U(items, isDefault) {
            const result = [];
            let resultLen = 0;
            for (const item of items) {
                const when = item.when || undefined;
                const keybinding = item.keybinding;
                if (!keybinding) {
                    // This might be a removal keybinding item in user settings => accept it
                    result[resultLen++] = new resolvedKeybindingItem_1.$XD(undefined, item.command, item.commandArgs, when, isDefault, null, false);
                }
                else {
                    const resolvedKeybindings = usLayoutResolvedKeybinding_1.$n3b.resolveKeybinding(keybinding, platform_1.OS);
                    for (const resolvedKeybinding of resolvedKeybindings) {
                        result[resultLen++] = new resolvedKeybindingItem_1.$XD(resolvedKeybinding, item.command, item.commandArgs, when, isDefault, null, false);
                    }
                }
            }
            return result;
        }
        resolveKeybinding(keybinding) {
            return usLayoutResolvedKeybinding_1.$n3b.resolveKeybinding(keybinding, platform_1.OS);
        }
        resolveKeyboardEvent(keyboardEvent) {
            const chord = new keybindings_1.$yq(keyboardEvent.ctrlKey, keyboardEvent.shiftKey, keyboardEvent.altKey, keyboardEvent.metaKey, keyboardEvent.keyCode);
            return new usLayoutResolvedKeybinding_1.$n3b([chord], platform_1.OS);
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
    exports.$W8b = $W8b;
    exports.$W8b = $W8b = __decorate([
        __param(0, contextkey_1.$3i),
        __param(1, commands_1.$Fr),
        __param(2, telemetry_1.$9k),
        __param(3, notification_1.$Yu),
        __param(4, log_1.$5i),
        __param(5, codeEditorService_1.$nV)
    ], $W8b);
    class DomNodeListeners extends lifecycle_1.$kc {
        constructor(domNode, disposables) {
            super();
            this.domNode = domNode;
            this.B(disposables);
        }
    }
    function isConfigurationOverrides(thing) {
        return thing
            && typeof thing === 'object'
            && (!thing.overrideIdentifier || typeof thing.overrideIdentifier === 'string')
            && (!thing.resource || thing.resource instanceof uri_1.URI);
    }
    class $X8b {
        constructor() {
            this.a = new event_1.$fd();
            this.onDidChangeConfiguration = this.a.event;
            const defaultConfiguration = new configurations_1.$wn();
            this.b = new configurationModels_1.$tn(defaultConfiguration.reload(), new configurationModels_1.$qn(), new configurationModels_1.$qn(), new configurationModels_1.$qn());
            defaultConfiguration.dispose();
        }
        getValue(arg1, arg2) {
            const section = typeof arg1 === 'string' ? arg1 : undefined;
            const overrides = isConfigurationOverrides(arg1) ? arg1 : isConfigurationOverrides(arg2) ? arg2 : {};
            return this.b.getValue(section, overrides, undefined);
        }
        updateValues(values) {
            const previous = { data: this.b.toData() };
            const changedKeys = [];
            for (const entry of values) {
                const [key, value] = entry;
                if (this.getValue(key) === value) {
                    continue;
                }
                this.b.updateValue(key, value);
                changedKeys.push(key);
            }
            if (changedKeys.length > 0) {
                const configurationChangeEvent = new configurationModels_1.$vn({ keys: changedKeys, overrides: [] }, previous, this.b);
                configurationChangeEvent.source = 8 /* ConfigurationTarget.MEMORY */;
                configurationChangeEvent.sourceConfig = null;
                this.a.fire(configurationChangeEvent);
            }
            return Promise.resolve();
        }
        updateValue(key, value, arg3, arg4) {
            return this.updateValues([[key, value]]);
        }
        inspect(key, options = {}) {
            return this.b.inspect(key, options, undefined);
        }
        keys() {
            return this.b.keys(undefined);
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
    exports.$X8b = $X8b;
    let StandaloneResourceConfigurationService = class StandaloneResourceConfigurationService {
        constructor(b, c, d) {
            this.b = b;
            this.c = c;
            this.d = d;
            this.a = new event_1.$fd();
            this.onDidChangeConfiguration = this.a.event;
            this.b.onDidChangeConfiguration((e) => {
                this.a.fire({ affectedKeys: e.affectedKeys, affectsConfiguration: (resource, configuration) => e.affectsConfiguration(configuration) });
            });
        }
        getValue(resource, arg2, arg3) {
            const position = position_1.$js.isIPosition(arg2) ? arg2 : null;
            const section = position ? (typeof arg3 === 'string' ? arg3 : undefined) : (typeof arg2 === 'string' ? arg2 : undefined);
            const language = resource ? this.f(resource, position) : undefined;
            if (typeof section === 'undefined') {
                return this.b.getValue({
                    resource,
                    overrideIdentifier: language
                });
            }
            return this.b.getValue(section, {
                resource,
                overrideIdentifier: language
            });
        }
        inspect(resource, position, section) {
            const language = resource ? this.f(resource, position) : undefined;
            return this.b.inspect(section, { resource, overrideIdentifier: language });
        }
        f(resource, position) {
            const model = this.c.getModel(resource);
            if (model) {
                return position ? model.getLanguageIdAtPosition(position.lineNumber, position.column) : model.getLanguageId();
            }
            return this.d.guessLanguageIdByFilepathOrFirstLine(resource);
        }
        updateValue(resource, key, value, configurationTarget) {
            return this.b.updateValue(key, value, { resource }, configurationTarget);
        }
    };
    StandaloneResourceConfigurationService = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, model_1.$yA),
        __param(2, language_1.$ct)
    ], StandaloneResourceConfigurationService);
    let StandaloneResourcePropertiesService = class StandaloneResourcePropertiesService {
        constructor(a) {
            this.a = a;
        }
        getEOL(resource, language) {
            const eol = this.a.getValue('files.eol', { overrideIdentifier: language, resource });
            if (eol && typeof eol === 'string' && eol !== 'auto') {
                return eol;
            }
            return (platform_1.$k || platform_1.$j) ? '\n' : '\r\n';
        }
    };
    StandaloneResourcePropertiesService = __decorate([
        __param(0, configuration_1.$8h)
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
        static { this.a = 'inmemory'; }
        constructor() {
            this.b = new event_1.$fd();
            this.onDidChangeWorkspaceName = this.b.event;
            this.c = new event_1.$fd();
            this.onWillChangeWorkspaceFolders = this.c.event;
            this.d = new event_1.$fd();
            this.onDidChangeWorkspaceFolders = this.d.event;
            this.f = new event_1.$fd();
            this.onDidChangeWorkbenchState = this.f.event;
            const resource = uri_1.URI.from({ scheme: StandaloneWorkspaceContextService.a, authority: 'model', path: '/' });
            this.g = { id: workspace_1.$4h, folders: [new workspace_1.$Vh({ uri: resource, name: '', index: 0 })] };
        }
        getCompleteWorkspace() {
            return Promise.resolve(this.getWorkspace());
        }
        getWorkspace() {
            return this.g;
        }
        getWorkbenchState() {
            if (this.g) {
                if (this.g.configuration) {
                    return 3 /* WorkbenchState.WORKSPACE */;
                }
                return 2 /* WorkbenchState.FOLDER */;
            }
            return 1 /* WorkbenchState.EMPTY */;
        }
        getWorkspaceFolder(resource) {
            return resource && resource.scheme === StandaloneWorkspaceContextService.a ? this.g.folders[0] : null;
        }
        isInsideWorkspace(resource) {
            return resource && resource.scheme === StandaloneWorkspaceContextService.a;
        }
        isCurrentWorkspace(workspaceIdOrFolder) {
            return true;
        }
    }
    function $Y8b(configurationService, source, isDiffEditor) {
        if (!source) {
            return;
        }
        if (!(configurationService instanceof $X8b)) {
            return;
        }
        const toUpdate = [];
        Object.keys(source).forEach((key) => {
            if ((0, editorConfigurationSchema_1.$l1)(key)) {
                toUpdate.push([`editor.${key}`, source[key]]);
            }
            if (isDiffEditor && (0, editorConfigurationSchema_1.$m1)(key)) {
                toUpdate.push([`diffEditor.${key}`, source[key]]);
            }
        });
        if (toUpdate.length > 0) {
            configurationService.updateValues(toUpdate);
        }
    }
    exports.$Y8b = $Y8b;
    let StandaloneBulkEditService = class StandaloneBulkEditService {
        constructor(a) {
            this.a = a;
            //
        }
        hasPreviewHandler() {
            return false;
        }
        setPreviewHandler() {
            return lifecycle_1.$kc.None;
        }
        async apply(editsIn, _options) {
            const edits = Array.isArray(editsIn) ? editsIn : bulkEditService_1.$o1.convert(editsIn);
            const textEdits = new Map();
            for (const edit of edits) {
                if (!(edit instanceof bulkEditService_1.$p1)) {
                    throw new Error('bad edit - only text edits are supported');
                }
                const model = this.a.getModel(edit.resource);
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
                array.push(editOperation_1.$ls.replaceMove(range_1.$ks.lift(edit.textEdit.range), edit.textEdit.text));
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
                ariaSummary: strings.$ne(standaloneStrings_1.StandaloneServicesNLS.bulkEditServiceSummary, totalEdits, totalFiles),
                isApplied: totalEdits > 0
            };
        }
    };
    StandaloneBulkEditService = __decorate([
        __param(0, model_1.$yA)
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
            return (0, resources_1.$fg)(resource);
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
    let StandaloneContextViewService = class StandaloneContextViewService extends contextViewService_1.$JBb {
        constructor(layoutService, j) {
            super(layoutService);
            this.j = j;
        }
        showContextView(delegate, container, shadowRoot) {
            if (!container) {
                const codeEditor = this.j.getFocusedCodeEditor() || this.j.getActiveCodeEditor();
                if (codeEditor) {
                    container = codeEditor.getContainerDomNode();
                }
            }
            return super.showContextView(delegate, container, shadowRoot);
        }
    };
    StandaloneContextViewService = __decorate([
        __param(0, layoutService_1.$XT),
        __param(1, codeEditorService_1.$nV)
    ], StandaloneContextViewService);
    class StandaloneWorkspaceTrustManagementService {
        constructor() {
            this.a = new event_1.$fd();
            this.onDidChangeTrust = this.a.event;
            this.onDidChangeTrustedFolders = this.a.event;
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
    class StandaloneLanguageService extends languageService_1.$jmb {
        constructor() {
            super();
        }
    }
    class StandaloneLogService extends logService_1.$mN {
        constructor() {
            super(new log_1.$aj());
        }
    }
    let StandaloneContextMenuService = class StandaloneContextMenuService extends contextMenuService_1.$B4b {
        constructor(telemetryService, notificationService, contextViewService, keybindingService, menuService, contextKeyService) {
            super(telemetryService, notificationService, contextViewService, keybindingService, menuService, contextKeyService);
            this.configure({ blockMouse: false }); // we do not want that in the standalone editor
        }
    };
    StandaloneContextMenuService = __decorate([
        __param(0, telemetry_1.$9k),
        __param(1, notification_1.$Yu),
        __param(2, contextView_1.$VZ),
        __param(3, keybinding_1.$2D),
        __param(4, actions_1.$Su),
        __param(5, contextkey_1.$3i)
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
            return (0, lifecycle_1.$ic)(() => { });
        }
    }
    (0, extensions_1.$mr)(configuration_1.$8h, $X8b, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(textResourceConfiguration_1.$FA, StandaloneResourceConfigurationService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(textResourceConfiguration_1.$GA, StandaloneResourcePropertiesService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(workspace_1.$Kh, StandaloneWorkspaceContextService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(label_1.$Vz, StandaloneUriLabelService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(telemetry_1.$9k, StandaloneTelemetryService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(dialogs_1.$oA, StandaloneDialogService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(environment_1.$Ih, StandaloneEnvironmentService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(notification_1.$Yu, $U8b, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(markers_1.$3s, markerService_1.$MBb, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(language_1.$ct, StandaloneLanguageService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(standaloneTheme_1.$D8b, standaloneThemeService_1.$T8b, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(log_1.$5i, StandaloneLogService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(model_1.$yA, modelService_1.$4yb, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(markerDecorations_1.$hW, markerDecorationsService_1.$KBb, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(contextkey_1.$3i, contextKeyService_1.$xtb, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(progress_1.$2u, StandaloneProgressService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(progress_1.$7u, StandaloneEditorProgressService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(storage_1.$Vo, storage_1.$Zo, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(editorWorker_1.$4Y, editorWorkerService_1.$82, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(bulkEditService_1.$n1, StandaloneBulkEditService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(workspaceTrust_1.$$z, StandaloneWorkspaceTrustManagementService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(resolverService_1.$uA, StandaloneTextModelService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(accessibility_1.$1r, accessibilityService_1.$M4b, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(listService_1.$03, listService_1.$$3, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(commands_1.$Fr, $V8b, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(keybinding_1.$2D, $W8b, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(quickInput_1.$Gq, standaloneQuickInputService_1.$I8b, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(contextView_1.$VZ, StandaloneContextViewService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(opener_1.$NT, openerService_1.$OBb, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(clipboardService_2.$UZ, clipboardService_1.$b4b, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(contextView_1.$WZ, StandaloneContextMenuService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(actions_1.$Su, menuService_1.$lyb, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(audioCueService_1.$sZ, StandaloneAudioService, 0 /* InstantiationType.Eager */);
    /**
     * We don't want to eagerly instantiate services because embedders get a one time chance
     * to override services when they create the first editor.
     */
    var StandaloneServices;
    (function (StandaloneServices) {
        const serviceCollection = new serviceCollection_1.$zh();
        for (const [id, descriptor] of (0, extensions_1.$nr)()) {
            serviceCollection.set(id, descriptor);
        }
        const instantiationService = new instantiationService_1.$6p(serviceCollection, true);
        serviceCollection.set(instantiation_1.$Ah, instantiationService);
        function get(serviceId) {
            if (!initialized) {
                initialize({});
            }
            const r = serviceCollection.get(serviceId);
            if (!r) {
                throw new Error('Missing service ' + serviceId);
            }
            if (r instanceof descriptors_1.$yh) {
                return instantiationService.invokeFunction((accessor) => accessor.get(serviceId));
            }
            else {
                return r;
            }
        }
        StandaloneServices.get = get;
        let initialized = false;
        const onDidInitialize = new event_1.$fd();
        function initialize(overrides) {
            if (initialized) {
                return instantiationService;
            }
            initialized = true;
            // Add singletons that were registered after this module loaded
            for (const [id, descriptor] of (0, extensions_1.$nr)()) {
                if (!serviceCollection.get(id)) {
                    serviceCollection.set(id, descriptor);
                }
            }
            // Initialize the service collection with the overrides, but only if the
            // service was not instantiated in the meantime.
            for (const serviceId in overrides) {
                if (overrides.hasOwnProperty(serviceId)) {
                    const serviceIdentifier = (0, instantiation_1.$Bh)(serviceId);
                    const r = serviceCollection.get(serviceIdentifier);
                    if (r instanceof descriptors_1.$yh) {
                        serviceCollection.set(serviceIdentifier, overrides[serviceId]);
                    }
                }
            }
            // Instantiate all editor features
            const editorFeatures = (0, editorFeatures_1.$_2)();
            for (const feature of editorFeatures) {
                try {
                    instantiationService.createInstance(feature);
                }
                catch (err) {
                    (0, errors_1.$Y)(err);
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
            const disposable = new lifecycle_1.$jc();
            const listener = disposable.add(onDidInitialize.event(() => {
                listener.dispose();
                disposable.add(callback());
            }));
            return disposable;
        }
        StandaloneServices.withServices = withServices;
    })(StandaloneServices || (exports.StandaloneServices = StandaloneServices = {}));
});
//# sourceMappingURL=standaloneServices.js.map