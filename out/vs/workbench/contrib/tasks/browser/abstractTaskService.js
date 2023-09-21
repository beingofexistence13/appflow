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
define(["require", "exports", "vs/base/common/actions", "vs/base/common/event", "vs/base/common/glob", "vs/base/common/json", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/objects", "vs/base/common/parsers", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/severity", "vs/base/common/types", "vs/base/common/uri", "vs/base/common/uuid", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/files/common/files", "vs/platform/markers/common/markers", "vs/platform/progress/common/progress", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/workbench/contrib/tasks/common/problemMatcher", "vs/workbench/services/extensions/common/extensions", "vs/platform/dialogs/common/dialogs", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/editor/common/services/model", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/markers/common/markers", "vs/workbench/services/configurationResolver/common/configurationResolver", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/output/common/output", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/contrib/tasks/common/tasks", "vs/workbench/contrib/tasks/common/taskService", "vs/workbench/contrib/tasks/common/taskSystem", "vs/workbench/contrib/tasks/common/taskTemplates", "../common/taskConfiguration", "./terminalTaskSystem", "vs/platform/quickinput/common/quickInput", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/tasks/common/taskDefinitionRegistry", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/functional", "vs/base/common/jsonFormatter", "vs/base/common/network", "vs/base/common/themables", "vs/editor/common/services/resolverService", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/terminal/common/terminal", "vs/platform/theme/common/themeService", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/common/contextkeys", "vs/workbench/common/editor", "vs/workbench/common/views", "vs/workbench/contrib/tasks/browser/taskQuickPick", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/workbench/services/path/common/pathService", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/remote/common/remoteAgentService"], function (require, exports, actions_1, event_1, glob, json, lifecycle_1, map_1, Objects, parsers_1, Platform, resources, severity_1, Types, uri_1, UUID, nls, commands_1, configuration_1, files_1, markers_1, progress_1, storage_1, telemetry_1, problemMatcher_1, extensions_1, dialogs_1, notification_1, opener_1, model_1, workspace_1, markers_2, configurationResolver_1, editorService_1, output_1, textfiles_1, terminal_1, terminal_2, tasks_1, taskService_1, taskSystem_1, taskTemplates_1, TaskConfig, terminalTaskSystem_1, quickInput_1, contextkey_1, taskDefinitionRegistry_1, async_1, cancellation_1, functional_1, jsonFormatter_1, network_1, themables_1, resolverService_1, instantiation_1, log_1, terminal_3, themeService_1, workspaceTrust_1, contextkeys_1, editor_1, views_1, taskQuickPick_1, environmentService_1, lifecycle_2, panecomposite_1, pathService_1, preferences_1, remoteAgentService_1) {
    "use strict";
    var AbstractTaskService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractTaskService = exports.ConfigureTaskAction = void 0;
    const QUICKOPEN_HISTORY_LIMIT_CONFIG = 'task.quickOpen.history';
    const PROBLEM_MATCHER_NEVER_CONFIG = 'task.problemMatchers.neverPrompt';
    const USE_SLOW_PICKER = 'task.quickOpen.showAll';
    var ConfigureTaskAction;
    (function (ConfigureTaskAction) {
        ConfigureTaskAction.ID = 'workbench.action.tasks.configureTaskRunner';
        ConfigureTaskAction.TEXT = nls.localize('ConfigureTaskRunnerAction.label', "Configure Task");
    })(ConfigureTaskAction || (exports.ConfigureTaskAction = ConfigureTaskAction = {}));
    class ProblemReporter {
        constructor(_outputChannel) {
            this._outputChannel = _outputChannel;
            this._validationStatus = new parsers_1.ValidationStatus();
        }
        info(message) {
            this._validationStatus.state = 1 /* ValidationState.Info */;
            this._outputChannel.append(message + '\n');
        }
        warn(message) {
            this._validationStatus.state = 2 /* ValidationState.Warning */;
            this._outputChannel.append(message + '\n');
        }
        error(message) {
            this._validationStatus.state = 3 /* ValidationState.Error */;
            this._outputChannel.append(message + '\n');
        }
        fatal(message) {
            this._validationStatus.state = 4 /* ValidationState.Fatal */;
            this._outputChannel.append(message + '\n');
        }
        get status() {
            return this._validationStatus;
        }
    }
    class TaskMap {
        constructor() {
            this._store = new Map();
        }
        forEach(callback) {
            this._store.forEach(callback);
        }
        static getKey(workspaceFolder) {
            let key;
            if (Types.isString(workspaceFolder)) {
                key = workspaceFolder;
            }
            else {
                const uri = (0, taskQuickPick_1.isWorkspaceFolder)(workspaceFolder) ? workspaceFolder.uri : workspaceFolder.configuration;
                key = uri ? uri.toString() : '';
            }
            return key;
        }
        get(workspaceFolder) {
            const key = TaskMap.getKey(workspaceFolder);
            let result = this._store.get(key);
            if (!result) {
                result = [];
                this._store.set(key, result);
            }
            return result;
        }
        add(workspaceFolder, ...task) {
            const key = TaskMap.getKey(workspaceFolder);
            let values = this._store.get(key);
            if (!values) {
                values = [];
                this._store.set(key, values);
            }
            values.push(...task);
        }
        all() {
            const result = [];
            this._store.forEach((values) => result.push(...values));
            return result;
        }
    }
    let AbstractTaskService = class AbstractTaskService extends lifecycle_1.Disposable {
        static { AbstractTaskService_1 = this; }
        // private static autoDetectTelemetryName: string = 'taskServer.autoDetect';
        static { this.RecentlyUsedTasks_Key = 'workbench.tasks.recentlyUsedTasks'; }
        static { this.RecentlyUsedTasks_KeyV2 = 'workbench.tasks.recentlyUsedTasks2'; }
        static { this.PersistentTasks_Key = 'workbench.tasks.persistentTasks'; }
        static { this.IgnoreTask010DonotShowAgain_key = 'workbench.tasks.ignoreTask010Shown'; }
        static { this.OutputChannelId = 'tasks'; }
        static { this.OutputChannelLabel = nls.localize('tasks', "Tasks"); }
        static { this._nextHandle = 0; }
        get isReconnected() { return this._tasksReconnected; }
        constructor(_configurationService, _markerService, _outputService, _paneCompositeService, _viewsService, _commandService, _editorService, _fileService, _contextService, _telemetryService, _textFileService, _modelService, _extensionService, _quickInputService, _configurationResolverService, _terminalService, _terminalGroupService, _storageService, _progressService, _openerService, _dialogService, _notificationService, _contextKeyService, _environmentService, _terminalProfileResolverService, _pathService, _textModelResolverService, _preferencesService, _viewDescriptorService, _workspaceTrustRequestService, _workspaceTrustManagementService, _logService, _themeService, _lifecycleService, remoteAgentService, _instantiationService) {
            super();
            this._configurationService = _configurationService;
            this._markerService = _markerService;
            this._outputService = _outputService;
            this._paneCompositeService = _paneCompositeService;
            this._viewsService = _viewsService;
            this._commandService = _commandService;
            this._editorService = _editorService;
            this._fileService = _fileService;
            this._contextService = _contextService;
            this._telemetryService = _telemetryService;
            this._textFileService = _textFileService;
            this._modelService = _modelService;
            this._extensionService = _extensionService;
            this._quickInputService = _quickInputService;
            this._configurationResolverService = _configurationResolverService;
            this._terminalService = _terminalService;
            this._terminalGroupService = _terminalGroupService;
            this._storageService = _storageService;
            this._progressService = _progressService;
            this._openerService = _openerService;
            this._dialogService = _dialogService;
            this._notificationService = _notificationService;
            this._contextKeyService = _contextKeyService;
            this._environmentService = _environmentService;
            this._terminalProfileResolverService = _terminalProfileResolverService;
            this._pathService = _pathService;
            this._textModelResolverService = _textModelResolverService;
            this._preferencesService = _preferencesService;
            this._viewDescriptorService = _viewDescriptorService;
            this._workspaceTrustRequestService = _workspaceTrustRequestService;
            this._workspaceTrustManagementService = _workspaceTrustManagementService;
            this._logService = _logService;
            this._themeService = _themeService;
            this._lifecycleService = _lifecycleService;
            this._instantiationService = _instantiationService;
            this._tasksReconnected = false;
            this._taskSystemListeners = [];
            this._onDidRegisterSupportedExecutions = new event_1.Emitter();
            this._onDidRegisterAllSupportedExecutions = new event_1.Emitter();
            this._onDidChangeTaskSystemInfo = new event_1.Emitter();
            this._willRestart = false;
            this.onDidChangeTaskSystemInfo = this._onDidChangeTaskSystemInfo.event;
            this._onDidReconnectToTasks = new event_1.Emitter();
            this.onDidReconnectToTasks = this._onDidReconnectToTasks.event;
            this._whenTaskSystemReady = event_1.Event.toPromise(this.onDidChangeTaskSystemInfo);
            this._workspaceTasksPromise = undefined;
            this._taskSystem = undefined;
            this._taskSystemListeners = undefined;
            this._outputChannel = this._outputService.getChannel(AbstractTaskService_1.OutputChannelId);
            this._providers = new Map();
            this._providerTypes = new Map();
            this._taskSystemInfos = new Map();
            this._register(this._contextService.onDidChangeWorkspaceFolders(() => {
                const folderSetup = this._computeWorkspaceFolderSetup();
                if (this.executionEngine !== folderSetup[2]) {
                    this._disposeTaskSystemListeners();
                    this._taskSystem = undefined;
                }
                this._updateSetup(folderSetup);
                return this._updateWorkspaceTasks(2 /* TaskRunSource.FolderOpen */);
            }));
            this._register(this._configurationService.onDidChangeConfiguration((e) => {
                if (!e.affectsConfiguration('tasks') || (!this._taskSystem && !this._workspaceTasksPromise)) {
                    return;
                }
                if (!this._taskSystem || this._taskSystem instanceof terminalTaskSystem_1.TerminalTaskSystem) {
                    this._outputChannel.clear();
                }
                this._setTaskLRUCacheLimit();
                return this._updateWorkspaceTasks(3 /* TaskRunSource.ConfigurationChange */);
            }));
            this._taskRunningState = tasks_1.TASK_RUNNING_STATE.bindTo(_contextKeyService);
            this._onDidStateChange = this._register(new event_1.Emitter());
            this._registerCommands().then(() => taskService_1.TaskCommandsRegistered.bindTo(this._contextKeyService).set(true));
            taskService_1.ServerlessWebContext.bindTo(this._contextKeyService).set(Platform.isWeb && !remoteAgentService.getConnection()?.remoteAuthority);
            this._configurationResolverService.contributeVariable('defaultBuildTask', async () => {
                let tasks = await this._getTasksForGroup(tasks_1.TaskGroup.Build);
                if (tasks.length > 0) {
                    const defaults = this._getDefaultTasks(tasks);
                    if (defaults.length === 1) {
                        return defaults[0]._label;
                    }
                    else if (defaults.length) {
                        tasks = defaults;
                    }
                }
                let entry;
                if (tasks && tasks.length > 0) {
                    entry = await this._showQuickPick(tasks, nls.localize('TaskService.pickBuildTaskForLabel', 'Select the build task (there is no default build task defined)'));
                }
                const task = entry ? entry.task : undefined;
                if (!task) {
                    return undefined;
                }
                return task._label;
            });
            this._lifecycleService.onBeforeShutdown(e => {
                this._willRestart = e.reason !== 3 /* ShutdownReason.RELOAD */;
            });
            this._register(this.onDidStateChange(e => {
                if (e.kind === "changed" /* TaskEventKind.Changed */) {
                    // no-op
                }
                else if ((this._willRestart || (e.kind === "terminated" /* TaskEventKind.Terminated */ && e.exitReason === terminal_3.TerminalExitReason.User)) && e.taskId) {
                    this.removePersistentTask(e.taskId);
                }
                else if (e.kind === "start" /* TaskEventKind.Start */ && e.__task && e.__task.getWorkspaceFolder()) {
                    this._setPersistentTask(e.__task);
                }
            }));
            this._waitForAllSupportedExecutions = new Promise(resolve => {
                (0, functional_1.once)(this._onDidRegisterAllSupportedExecutions.event)(() => resolve());
            });
            if (this._terminalService.getReconnectedTerminals('Task')?.length) {
                this._attemptTaskReconnection();
            }
            else {
                this._terminalService.whenConnected.then(() => {
                    if (this._terminalService.getReconnectedTerminals('Task')?.length) {
                        this._attemptTaskReconnection();
                    }
                    else {
                        this._tasksReconnected = true;
                        this._onDidReconnectToTasks.fire();
                    }
                });
            }
            this._upgrade();
        }
        registerSupportedExecutions(custom, shell, process) {
            if (custom !== undefined) {
                const customContext = taskService_1.CustomExecutionSupportedContext.bindTo(this._contextKeyService);
                customContext.set(custom);
            }
            const isVirtual = !!contextkeys_1.VirtualWorkspaceContext.getValue(this._contextKeyService);
            if (shell !== undefined) {
                const shellContext = taskService_1.ShellExecutionSupportedContext.bindTo(this._contextKeyService);
                shellContext.set(shell && !isVirtual);
            }
            if (process !== undefined) {
                const processContext = taskService_1.ProcessExecutionSupportedContext.bindTo(this._contextKeyService);
                processContext.set(process && !isVirtual);
            }
            // update tasks so an incomplete list isn't returned when getWorkspaceTasks is called
            this._workspaceTasksPromise = undefined;
            this._onDidRegisterSupportedExecutions.fire();
            if (custom && shell && process) {
                this._onDidRegisterAllSupportedExecutions.fire();
            }
        }
        _attemptTaskReconnection() {
            if (this._lifecycleService.startupKind !== 3 /* StartupKind.ReloadedWindow */) {
                this._tasksReconnected = true;
                this._storageService.remove(AbstractTaskService_1.PersistentTasks_Key, 1 /* StorageScope.WORKSPACE */);
            }
            if (!this._configurationService.getValue("task.reconnection" /* TaskSettingId.Reconnection */) || this._tasksReconnected) {
                this._tasksReconnected = true;
                return;
            }
            this.getWorkspaceTasks(4 /* TaskRunSource.Reconnect */).then(async () => {
                this._tasksReconnected = await this._reconnectTasks();
                this._onDidReconnectToTasks.fire();
            });
        }
        async _reconnectTasks() {
            const tasks = await this.getSavedTasks('persistent');
            if (!tasks.length) {
                return true;
            }
            for (const task of tasks) {
                if (tasks_1.ConfiguringTask.is(task)) {
                    const resolved = await this.tryResolveTask(task);
                    if (resolved) {
                        this.run(resolved, undefined, 4 /* TaskRunSource.Reconnect */);
                    }
                }
                else {
                    this.run(task, undefined, 4 /* TaskRunSource.Reconnect */);
                }
            }
            return true;
        }
        get onDidStateChange() {
            return this._onDidStateChange.event;
        }
        get supportsMultipleTaskExecutions() {
            return this.inTerminal();
        }
        async _registerCommands() {
            commands_1.CommandsRegistry.registerCommand({
                id: 'workbench.action.tasks.runTask',
                handler: async (accessor, arg) => {
                    if (await this._trust()) {
                        await this._runTaskCommand(arg);
                    }
                },
                description: {
                    description: 'Run Task',
                    args: [{
                            name: 'args',
                            isOptional: true,
                            description: nls.localize('runTask.arg', "Filters the tasks shown in the quickpick"),
                            schema: {
                                anyOf: [
                                    {
                                        type: 'string',
                                        description: nls.localize('runTask.label', "The task's label or a term to filter by")
                                    },
                                    {
                                        type: 'object',
                                        properties: {
                                            type: {
                                                type: 'string',
                                                description: nls.localize('runTask.type', "The contributed task type")
                                            },
                                            task: {
                                                type: 'string',
                                                description: nls.localize('runTask.task', "The task's label or a term to filter by")
                                            }
                                        }
                                    }
                                ]
                            }
                        }]
                }
            });
            commands_1.CommandsRegistry.registerCommand('workbench.action.tasks.reRunTask', async (accessor, arg) => {
                if (await this._trust()) {
                    this._reRunTaskCommand();
                }
            });
            commands_1.CommandsRegistry.registerCommand('workbench.action.tasks.restartTask', async (accessor, arg) => {
                if (await this._trust()) {
                    this._runRestartTaskCommand(arg);
                }
            });
            commands_1.CommandsRegistry.registerCommand('workbench.action.tasks.terminate', async (accessor, arg) => {
                if (await this._trust()) {
                    this._runTerminateCommand(arg);
                }
            });
            commands_1.CommandsRegistry.registerCommand('workbench.action.tasks.showLog', () => {
                this._showOutput();
            });
            commands_1.CommandsRegistry.registerCommand('workbench.action.tasks.build', async () => {
                if (await this._trust()) {
                    this._runBuildCommand();
                }
            });
            commands_1.CommandsRegistry.registerCommand('workbench.action.tasks.test', async () => {
                if (await this._trust()) {
                    this._runTestCommand();
                }
            });
            commands_1.CommandsRegistry.registerCommand('workbench.action.tasks.configureTaskRunner', async () => {
                if (await this._trust()) {
                    this._runConfigureTasks();
                }
            });
            commands_1.CommandsRegistry.registerCommand('workbench.action.tasks.configureDefaultBuildTask', async () => {
                if (await this._trust()) {
                    this._runConfigureDefaultBuildTask();
                }
            });
            commands_1.CommandsRegistry.registerCommand('workbench.action.tasks.configureDefaultTestTask', async () => {
                if (await this._trust()) {
                    this._runConfigureDefaultTestTask();
                }
            });
            commands_1.CommandsRegistry.registerCommand('workbench.action.tasks.showTasks', async () => {
                if (await this._trust()) {
                    return this.runShowTasks();
                }
            });
            commands_1.CommandsRegistry.registerCommand('workbench.action.tasks.toggleProblems', () => this._commandService.executeCommand(markers_2.Markers.TOGGLE_MARKERS_VIEW_ACTION_ID));
            commands_1.CommandsRegistry.registerCommand('workbench.action.tasks.openUserTasks', async () => {
                const resource = this._getResourceForKind(tasks_1.TaskSourceKind.User);
                if (resource) {
                    this._openTaskFile(resource, tasks_1.TaskSourceKind.User);
                }
            });
            commands_1.CommandsRegistry.registerCommand('workbench.action.tasks.openWorkspaceFileTasks', async () => {
                const resource = this._getResourceForKind(tasks_1.TaskSourceKind.WorkspaceFile);
                if (resource) {
                    this._openTaskFile(resource, tasks_1.TaskSourceKind.WorkspaceFile);
                }
            });
        }
        get workspaceFolders() {
            if (!this._workspaceFolders) {
                this._updateSetup();
            }
            return this._workspaceFolders;
        }
        get ignoredWorkspaceFolders() {
            if (!this._ignoredWorkspaceFolders) {
                this._updateSetup();
            }
            return this._ignoredWorkspaceFolders;
        }
        get executionEngine() {
            if (this._executionEngine === undefined) {
                this._updateSetup();
            }
            return this._executionEngine;
        }
        get schemaVersion() {
            if (this._schemaVersion === undefined) {
                this._updateSetup();
            }
            return this._schemaVersion;
        }
        get showIgnoreMessage() {
            if (this._showIgnoreMessage === undefined) {
                this._showIgnoreMessage = !this._storageService.getBoolean(AbstractTaskService_1.IgnoreTask010DonotShowAgain_key, 1 /* StorageScope.WORKSPACE */, false);
            }
            return this._showIgnoreMessage;
        }
        _getActivationEvents(type) {
            const result = [];
            result.push('onCommand:workbench.action.tasks.runTask');
            if (type) {
                // send a specific activation event for this task type
                result.push(`onTaskType:${type}`);
            }
            else {
                // send activation events for all task types
                for (const definition of taskDefinitionRegistry_1.TaskDefinitionRegistry.all()) {
                    result.push(`onTaskType:${definition.taskType}`);
                }
            }
            return result;
        }
        async _activateTaskProviders(type) {
            // We need to first wait for extensions to be registered because we might read
            // the `TaskDefinitionRegistry` in case `type` is `undefined`
            await this._extensionService.whenInstalledExtensionsRegistered();
            await (0, async_1.raceTimeout)(Promise.all(this._getActivationEvents(type).map(activationEvent => this._extensionService.activateByEvent(activationEvent))), 5000, () => console.warn('Timed out activating extensions for task providers'));
        }
        _updateSetup(setup) {
            if (!setup) {
                setup = this._computeWorkspaceFolderSetup();
            }
            this._workspaceFolders = setup[0];
            if (this._ignoredWorkspaceFolders) {
                if (this._ignoredWorkspaceFolders.length !== setup[1].length) {
                    this._showIgnoreMessage = undefined;
                }
                else {
                    const set = new Set();
                    this._ignoredWorkspaceFolders.forEach(folder => set.add(folder.uri.toString()));
                    for (const folder of setup[1]) {
                        if (!set.has(folder.uri.toString())) {
                            this._showIgnoreMessage = undefined;
                            break;
                        }
                    }
                }
            }
            this._ignoredWorkspaceFolders = setup[1];
            this._executionEngine = setup[2];
            this._schemaVersion = setup[3];
            this._workspace = setup[4];
        }
        _showOutput(runSource = 1 /* TaskRunSource.User */) {
            if (!contextkeys_1.VirtualWorkspaceContext.getValue(this._contextKeyService) && ((runSource === 1 /* TaskRunSource.User */) || (runSource === 3 /* TaskRunSource.ConfigurationChange */))) {
                this._notificationService.prompt(severity_1.default.Warning, nls.localize('taskServiceOutputPrompt', 'There are task errors. See the output for details.'), [{
                        label: nls.localize('showOutput', "Show output"),
                        run: () => {
                            this._outputService.showChannel(this._outputChannel.id, true);
                        }
                    }]);
            }
        }
        _disposeTaskSystemListeners() {
            if (this._taskSystemListeners) {
                (0, lifecycle_1.dispose)(this._taskSystemListeners);
                this._taskSystemListeners = undefined;
            }
        }
        registerTaskProvider(provider, type) {
            if (!provider) {
                return {
                    dispose: () => { }
                };
            }
            const handle = AbstractTaskService_1._nextHandle++;
            this._providers.set(handle, provider);
            this._providerTypes.set(handle, type);
            return {
                dispose: () => {
                    this._providers.delete(handle);
                    this._providerTypes.delete(handle);
                }
            };
        }
        get hasTaskSystemInfo() {
            const infosCount = Array.from(this._taskSystemInfos.values()).flat().length;
            // If there's a remoteAuthority, then we end up with 2 taskSystemInfos,
            // one for each extension host.
            if (this._environmentService.remoteAuthority) {
                return infosCount > 1;
            }
            return infosCount > 0;
        }
        registerTaskSystem(key, info) {
            // Ideally the Web caller of registerRegisterTaskSystem would use the correct key.
            // However, the caller doesn't know about the workspace folders at the time of the call, even though we know about them here.
            if (info.platform === 0 /* Platform.Platform.Web */) {
                key = this.workspaceFolders.length ? this.workspaceFolders[0].uri.scheme : key;
            }
            if (!this._taskSystemInfos.has(key)) {
                this._taskSystemInfos.set(key, [info]);
            }
            else {
                const infos = this._taskSystemInfos.get(key);
                if (info.platform === 0 /* Platform.Platform.Web */) {
                    // Web infos should be pushed last.
                    infos.push(info);
                }
                else {
                    infos.unshift(info);
                }
            }
            if (this.hasTaskSystemInfo) {
                this._onDidChangeTaskSystemInfo.fire();
            }
        }
        _getTaskSystemInfo(key) {
            const infos = this._taskSystemInfos.get(key);
            return (infos && infos.length) ? infos[0] : undefined;
        }
        extensionCallbackTaskComplete(task, result) {
            if (!this._taskSystem) {
                return Promise.resolve();
            }
            return this._taskSystem.customExecutionComplete(task, result);
        }
        /**
         * Get a subset of workspace tasks that match a certain predicate.
         */
        async _findWorkspaceTasks(predicate) {
            const result = [];
            const tasks = await this.getWorkspaceTasks();
            for (const [, workspaceTasks] of tasks) {
                if (workspaceTasks.configurations) {
                    for (const taskName in workspaceTasks.configurations.byIdentifier) {
                        const task = workspaceTasks.configurations.byIdentifier[taskName];
                        if (predicate(task, workspaceTasks.workspaceFolder)) {
                            result.push(task);
                        }
                    }
                }
                if (workspaceTasks.set) {
                    for (const task of workspaceTasks.set.tasks) {
                        if (predicate(task, workspaceTasks.workspaceFolder)) {
                            result.push(task);
                        }
                    }
                }
            }
            return result;
        }
        async _findWorkspaceTasksInGroup(group, isDefault) {
            return this._findWorkspaceTasks((task) => {
                const taskGroup = task.configurationProperties.group;
                if (taskGroup && typeof taskGroup !== 'string') {
                    return (taskGroup._id === group._id && (!isDefault || !!taskGroup.isDefault));
                }
                return false;
            });
        }
        async getTask(folder, identifier, compareId = false, type = undefined) {
            if (!(await this._trust())) {
                return;
            }
            const name = Types.isString(folder) ? folder : (0, taskQuickPick_1.isWorkspaceFolder)(folder) ? folder.name : folder.configuration ? resources.basename(folder.configuration) : undefined;
            if (this.ignoredWorkspaceFolders.some(ignored => ignored.name === name)) {
                return Promise.reject(new Error(nls.localize('TaskServer.folderIgnored', 'The folder {0} is ignored since it uses task version 0.1.0', name)));
            }
            const key = !Types.isString(identifier)
                ? tasks_1.TaskDefinition.createTaskIdentifier(identifier, console)
                : identifier;
            if (key === undefined) {
                return Promise.resolve(undefined);
            }
            // Try to find the task in the workspace
            const requestedFolder = TaskMap.getKey(folder);
            const matchedTasks = await this._findWorkspaceTasks((task, workspaceFolder) => {
                const taskFolder = TaskMap.getKey(workspaceFolder);
                if (taskFolder !== requestedFolder && taskFolder !== tasks_1.USER_TASKS_GROUP_KEY) {
                    return false;
                }
                return task.matches(key, compareId);
            });
            matchedTasks.sort(task => task._source.kind === tasks_1.TaskSourceKind.Extension ? 1 : -1);
            if (matchedTasks.length > 0) {
                // Nice, we found a configured task!
                const task = matchedTasks[0];
                if (tasks_1.ConfiguringTask.is(task)) {
                    return this.tryResolveTask(task);
                }
                else {
                    return task;
                }
            }
            // We didn't find the task, so we need to ask all resolvers about it
            const map = await this._getGroupedTasks({ type });
            let values = map.get(folder);
            values = values.concat(map.get(tasks_1.USER_TASKS_GROUP_KEY));
            if (!values) {
                return undefined;
            }
            values = values.filter(task => task.matches(key, compareId)).sort(task => task._source.kind === tasks_1.TaskSourceKind.Extension ? 1 : -1);
            return values.length > 0 ? values[0] : undefined;
        }
        async tryResolveTask(configuringTask) {
            if (!(await this._trust())) {
                return;
            }
            await this._activateTaskProviders(configuringTask.type);
            let matchingProvider;
            let matchingProviderUnavailable = false;
            for (const [handle, provider] of this._providers) {
                const providerType = this._providerTypes.get(handle);
                if (configuringTask.type === providerType) {
                    if (providerType && !this._isTaskProviderEnabled(providerType)) {
                        matchingProviderUnavailable = true;
                        continue;
                    }
                    matchingProvider = provider;
                    break;
                }
            }
            if (!matchingProvider) {
                if (matchingProviderUnavailable) {
                    this._outputChannel.append(nls.localize('TaskService.providerUnavailable', 'Warning: {0} tasks are unavailable in the current environment.\n', configuringTask.configures.type));
                }
                return;
            }
            // Try to resolve the task first
            try {
                const resolvedTask = await matchingProvider.resolveTask(configuringTask);
                if (resolvedTask && (resolvedTask._id === configuringTask._id)) {
                    return TaskConfig.createCustomTask(resolvedTask, configuringTask);
                }
            }
            catch (error) {
                // Ignore errors. The task could not be provided by any of the providers.
            }
            // The task couldn't be resolved. Instead, use the less efficient provideTask.
            const tasks = await this.tasks({ type: configuringTask.type });
            for (const task of tasks) {
                if (task._id === configuringTask._id) {
                    return TaskConfig.createCustomTask(task, configuringTask);
                }
            }
            return;
        }
        async tasks(filter) {
            if (!(await this._trust())) {
                return [];
            }
            if (!this._versionAndEngineCompatible(filter)) {
                return Promise.resolve([]);
            }
            return this._getGroupedTasks(filter).then((map) => {
                if (!filter || !filter.type) {
                    return map.all();
                }
                const result = [];
                map.forEach((tasks) => {
                    for (const task of tasks) {
                        if (tasks_1.ContributedTask.is(task) && ((task.defines.type === filter.type) || (task._source.label === filter.type))) {
                            result.push(task);
                        }
                        else if (tasks_1.CustomTask.is(task)) {
                            if (task.type === filter.type) {
                                result.push(task);
                            }
                            else {
                                const customizes = task.customizes();
                                if (customizes && customizes.type === filter.type) {
                                    result.push(task);
                                }
                            }
                        }
                    }
                });
                return result;
            });
        }
        taskTypes() {
            const types = [];
            if (this._isProvideTasksEnabled()) {
                for (const definition of taskDefinitionRegistry_1.TaskDefinitionRegistry.all()) {
                    if (this._isTaskProviderEnabled(definition.taskType)) {
                        types.push(definition.taskType);
                    }
                }
            }
            return types;
        }
        createSorter() {
            return new tasks_1.TaskSorter(this._contextService.getWorkspace() ? this._contextService.getWorkspace().folders : []);
        }
        _isActive() {
            if (!this._taskSystem) {
                return Promise.resolve(false);
            }
            return this._taskSystem.isActive();
        }
        async getActiveTasks() {
            if (!this._taskSystem) {
                return [];
            }
            return this._taskSystem.getActiveTasks();
        }
        async getBusyTasks() {
            if (!this._taskSystem) {
                return [];
            }
            return this._taskSystem.getBusyTasks();
        }
        getRecentlyUsedTasksV1() {
            if (this._recentlyUsedTasksV1) {
                return this._recentlyUsedTasksV1;
            }
            const quickOpenHistoryLimit = this._configurationService.getValue(QUICKOPEN_HISTORY_LIMIT_CONFIG);
            this._recentlyUsedTasksV1 = new map_1.LRUCache(quickOpenHistoryLimit);
            const storageValue = this._storageService.get(AbstractTaskService_1.RecentlyUsedTasks_Key, 1 /* StorageScope.WORKSPACE */);
            if (storageValue) {
                try {
                    const values = JSON.parse(storageValue);
                    if (Array.isArray(values)) {
                        for (const value of values) {
                            this._recentlyUsedTasksV1.set(value, value);
                        }
                    }
                }
                catch (error) {
                    // Ignore. We use the empty result
                }
            }
            return this._recentlyUsedTasksV1;
        }
        _getTasksFromStorage(type) {
            return type === 'persistent' ? this._getPersistentTasks() : this._getRecentTasks();
        }
        _getRecentTasks() {
            if (this._recentlyUsedTasks) {
                return this._recentlyUsedTasks;
            }
            const quickOpenHistoryLimit = this._configurationService.getValue(QUICKOPEN_HISTORY_LIMIT_CONFIG);
            this._recentlyUsedTasks = new map_1.LRUCache(quickOpenHistoryLimit);
            const storageValue = this._storageService.get(AbstractTaskService_1.RecentlyUsedTasks_KeyV2, 1 /* StorageScope.WORKSPACE */);
            if (storageValue) {
                try {
                    const values = JSON.parse(storageValue);
                    if (Array.isArray(values)) {
                        for (const value of values) {
                            this._recentlyUsedTasks.set(value[0], value[1]);
                        }
                    }
                }
                catch (error) {
                    // Ignore. We use the empty result
                }
            }
            return this._recentlyUsedTasks;
        }
        _getPersistentTasks() {
            if (this._persistentTasks) {
                return this._persistentTasks;
            }
            //TODO: should this # be configurable?
            this._persistentTasks = new map_1.LRUCache(10);
            const storageValue = this._storageService.get(AbstractTaskService_1.PersistentTasks_Key, 1 /* StorageScope.WORKSPACE */);
            if (storageValue) {
                try {
                    const values = JSON.parse(storageValue);
                    if (Array.isArray(values)) {
                        for (const value of values) {
                            this._persistentTasks.set(value[0], value[1]);
                        }
                    }
                }
                catch (error) {
                    // Ignore. We use the empty result
                }
            }
            return this._persistentTasks;
        }
        _getFolderFromTaskKey(key) {
            const keyValue = JSON.parse(key);
            return {
                folder: keyValue.folder, isWorkspaceFile: keyValue.id?.endsWith(tasks_1.TaskSourceKind.WorkspaceFile)
            };
        }
        async getSavedTasks(type) {
            const folderMap = Object.create(null);
            this.workspaceFolders.forEach(folder => {
                folderMap[folder.uri.toString()] = folder;
            });
            const folderToTasksMap = new Map();
            const workspaceToTaskMap = new Map();
            const storedTasks = this._getTasksFromStorage(type);
            const tasks = [];
            function addTaskToMap(map, folder, task) {
                if (folder && !map.has(folder)) {
                    map.set(folder, []);
                }
                if (folder && (folderMap[folder] || (folder === tasks_1.USER_TASKS_GROUP_KEY)) && task) {
                    map.get(folder).push(task);
                }
            }
            for (const entry of storedTasks.entries()) {
                const key = entry[0];
                const task = JSON.parse(entry[1]);
                const folderInfo = this._getFolderFromTaskKey(key);
                addTaskToMap(folderInfo.isWorkspaceFile ? workspaceToTaskMap : folderToTasksMap, folderInfo.folder, task);
            }
            const readTasksMap = new Map();
            async function readTasks(that, map, isWorkspaceFile) {
                for (const key of map.keys()) {
                    const custom = [];
                    const customized = Object.create(null);
                    const taskConfigSource = (folderMap[key]
                        ? (isWorkspaceFile
                            ? TaskConfig.TaskConfigSource.WorkspaceFile : TaskConfig.TaskConfigSource.TasksJson)
                        : TaskConfig.TaskConfigSource.User);
                    await that._computeTasksForSingleConfig(folderMap[key] ?? await that._getAFolder(), {
                        version: '2.0.0',
                        tasks: map.get(key)
                    }, 0 /* TaskRunSource.System */, custom, customized, taskConfigSource, true);
                    custom.forEach(task => {
                        const taskKey = task.getRecentlyUsedKey();
                        if (taskKey) {
                            readTasksMap.set(taskKey, task);
                        }
                    });
                    for (const configuration in customized) {
                        const taskKey = customized[configuration].getRecentlyUsedKey();
                        if (taskKey) {
                            readTasksMap.set(taskKey, customized[configuration]);
                        }
                    }
                }
            }
            await readTasks(this, folderToTasksMap, false);
            await readTasks(this, workspaceToTaskMap, true);
            for (const key of storedTasks.keys()) {
                if (readTasksMap.has(key)) {
                    tasks.push(readTasksMap.get(key));
                }
            }
            return tasks;
        }
        removeRecentlyUsedTask(taskRecentlyUsedKey) {
            if (this._getTasksFromStorage('historical').has(taskRecentlyUsedKey)) {
                this._getTasksFromStorage('historical').delete(taskRecentlyUsedKey);
                this._saveRecentlyUsedTasks();
            }
        }
        removePersistentTask(key) {
            if (this._getTasksFromStorage('persistent').has(key)) {
                this._getTasksFromStorage('persistent').delete(key);
                this._savePersistentTasks();
            }
        }
        _setTaskLRUCacheLimit() {
            const quickOpenHistoryLimit = this._configurationService.getValue(QUICKOPEN_HISTORY_LIMIT_CONFIG);
            if (this._recentlyUsedTasks) {
                this._recentlyUsedTasks.limit = quickOpenHistoryLimit;
            }
        }
        async _setRecentlyUsedTask(task) {
            let key = task.getRecentlyUsedKey();
            if (!tasks_1.InMemoryTask.is(task) && key) {
                const customizations = this._createCustomizableTask(task);
                if (tasks_1.ContributedTask.is(task) && customizations) {
                    const custom = [];
                    const customized = Object.create(null);
                    await this._computeTasksForSingleConfig(task._source.workspaceFolder ?? this.workspaceFolders[0], {
                        version: '2.0.0',
                        tasks: [customizations]
                    }, 0 /* TaskRunSource.System */, custom, customized, TaskConfig.TaskConfigSource.TasksJson, true);
                    for (const configuration in customized) {
                        key = customized[configuration].getRecentlyUsedKey();
                    }
                }
                this._getTasksFromStorage('historical').set(key, JSON.stringify(customizations));
                this._saveRecentlyUsedTasks();
            }
        }
        _saveRecentlyUsedTasks() {
            if (!this._recentlyUsedTasks) {
                return;
            }
            const quickOpenHistoryLimit = this._configurationService.getValue(QUICKOPEN_HISTORY_LIMIT_CONFIG);
            // setting history limit to 0 means no LRU sorting
            if (quickOpenHistoryLimit === 0) {
                return;
            }
            let keys = [...this._recentlyUsedTasks.keys()];
            if (keys.length > quickOpenHistoryLimit) {
                keys = keys.slice(0, quickOpenHistoryLimit);
            }
            const keyValues = [];
            for (const key of keys) {
                keyValues.push([key, this._recentlyUsedTasks.get(key, 0 /* Touch.None */)]);
            }
            this._storageService.store(AbstractTaskService_1.RecentlyUsedTasks_KeyV2, JSON.stringify(keyValues), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        async _setPersistentTask(task) {
            if (!this._configurationService.getValue("task.reconnection" /* TaskSettingId.Reconnection */)) {
                return;
            }
            let key = task.getRecentlyUsedKey();
            if (!tasks_1.InMemoryTask.is(task) && key) {
                const customizations = this._createCustomizableTask(task);
                if (tasks_1.ContributedTask.is(task) && customizations) {
                    const custom = [];
                    const customized = Object.create(null);
                    await this._computeTasksForSingleConfig(task._source.workspaceFolder ?? this.workspaceFolders[0], {
                        version: '2.0.0',
                        tasks: [customizations]
                    }, 0 /* TaskRunSource.System */, custom, customized, TaskConfig.TaskConfigSource.TasksJson, true);
                    for (const configuration in customized) {
                        key = customized[configuration].getRecentlyUsedKey();
                    }
                }
                if (!task.configurationProperties.isBackground) {
                    return;
                }
                this._getTasksFromStorage('persistent').set(key, JSON.stringify(customizations));
                this._savePersistentTasks();
            }
        }
        _savePersistentTasks() {
            if (!this._persistentTasks) {
                return;
            }
            const keys = [...this._persistentTasks.keys()];
            const keyValues = [];
            for (const key of keys) {
                keyValues.push([key, this._persistentTasks.get(key, 0 /* Touch.None */)]);
            }
            this._storageService.store(AbstractTaskService_1.PersistentTasks_Key, JSON.stringify(keyValues), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        _openDocumentation() {
            this._openerService.open(uri_1.URI.parse('https://code.visualstudio.com/docs/editor/tasks#_defining-a-problem-matcher'));
        }
        async _findSingleWorkspaceTaskOfGroup(group) {
            const tasksOfGroup = await this._findWorkspaceTasksInGroup(group, true);
            if ((tasksOfGroup.length === 1) && (typeof tasksOfGroup[0].configurationProperties.group !== 'string') && tasksOfGroup[0].configurationProperties.group?.isDefault) {
                let resolvedTask;
                if (tasks_1.ConfiguringTask.is(tasksOfGroup[0])) {
                    resolvedTask = await this.tryResolveTask(tasksOfGroup[0]);
                }
                else {
                    resolvedTask = tasksOfGroup[0];
                }
                if (resolvedTask) {
                    return this.run(resolvedTask, undefined, 1 /* TaskRunSource.User */);
                }
            }
            return undefined;
        }
        async _build() {
            const tryBuildShortcut = await this._findSingleWorkspaceTaskOfGroup(tasks_1.TaskGroup.Build);
            if (tryBuildShortcut) {
                return tryBuildShortcut;
            }
            return this._getGroupedTasksAndExecute();
        }
        async _runTest() {
            const tryTestShortcut = await this._findSingleWorkspaceTaskOfGroup(tasks_1.TaskGroup.Test);
            if (tryTestShortcut) {
                return tryTestShortcut;
            }
            return this._getGroupedTasksAndExecute(true);
        }
        async _getGroupedTasksAndExecute(test) {
            const tasks = await this._getGroupedTasks();
            const runnable = this._createRunnableTask(tasks, test ? tasks_1.TaskGroup.Test : tasks_1.TaskGroup.Build);
            if (!runnable || !runnable.task) {
                if (test) {
                    if (this.schemaVersion === 1 /* JsonSchemaVersion.V0_1_0 */) {
                        throw new taskSystem_1.TaskError(severity_1.default.Info, nls.localize('TaskService.noTestTask1', 'No test task defined. Mark a task with \'isTestCommand\' in the tasks.json file.'), 3 /* TaskErrors.NoTestTask */);
                    }
                    else {
                        throw new taskSystem_1.TaskError(severity_1.default.Info, nls.localize('TaskService.noTestTask2', 'No test task defined. Mark a task with as a \'test\' group in the tasks.json file.'), 3 /* TaskErrors.NoTestTask */);
                    }
                }
                else {
                    if (this.schemaVersion === 1 /* JsonSchemaVersion.V0_1_0 */) {
                        throw new taskSystem_1.TaskError(severity_1.default.Info, nls.localize('TaskService.noBuildTask1', 'No build task defined. Mark a task with \'isBuildCommand\' in the tasks.json file.'), 2 /* TaskErrors.NoBuildTask */);
                    }
                    else {
                        throw new taskSystem_1.TaskError(severity_1.default.Info, nls.localize('TaskService.noBuildTask2', 'No build task defined. Mark a task with as a \'build\' group in the tasks.json file.'), 2 /* TaskErrors.NoBuildTask */);
                    }
                }
            }
            let executeTaskResult;
            try {
                executeTaskResult = await this._executeTask(runnable.task, runnable.resolver, 1 /* TaskRunSource.User */);
            }
            catch (error) {
                this._handleError(error);
                return Promise.reject(error);
            }
            return executeTaskResult;
        }
        async run(task, options, runSource = 0 /* TaskRunSource.System */) {
            if (!(await this._trust())) {
                return;
            }
            if (!task) {
                throw new taskSystem_1.TaskError(severity_1.default.Info, nls.localize('TaskServer.noTask', 'Task to execute is undefined'), 5 /* TaskErrors.TaskNotFound */);
            }
            const resolver = this._createResolver();
            let executeTaskResult;
            try {
                if (options && options.attachProblemMatcher && this._shouldAttachProblemMatcher(task) && !tasks_1.InMemoryTask.is(task)) {
                    const taskToExecute = await this._attachProblemMatcher(task);
                    if (taskToExecute) {
                        executeTaskResult = await this._executeTask(taskToExecute, resolver, runSource);
                    }
                }
                else {
                    executeTaskResult = await this._executeTask(task, resolver, runSource);
                }
                return executeTaskResult;
            }
            catch (error) {
                this._handleError(error);
                return Promise.reject(error);
            }
        }
        _isProvideTasksEnabled() {
            const settingValue = this._configurationService.getValue("task.autoDetect" /* TaskSettingId.AutoDetect */);
            return settingValue === 'on';
        }
        _isProblemMatcherPromptEnabled(type) {
            const settingValue = this._configurationService.getValue(PROBLEM_MATCHER_NEVER_CONFIG);
            if (Types.isBoolean(settingValue)) {
                return !settingValue;
            }
            if (type === undefined) {
                return true;
            }
            const settingValueMap = settingValue;
            return !settingValueMap[type];
        }
        _getTypeForTask(task) {
            let type;
            if (tasks_1.CustomTask.is(task)) {
                const configProperties = task._source.config.element;
                type = configProperties.type;
            }
            else {
                type = task.getDefinition().type;
            }
            return type;
        }
        _shouldAttachProblemMatcher(task) {
            const enabled = this._isProblemMatcherPromptEnabled(this._getTypeForTask(task));
            if (enabled === false) {
                return false;
            }
            if (!this._canCustomize(task)) {
                return false;
            }
            if (task.configurationProperties.group !== undefined && task.configurationProperties.group !== tasks_1.TaskGroup.Build) {
                return false;
            }
            if (task.configurationProperties.problemMatchers !== undefined && task.configurationProperties.problemMatchers.length > 0) {
                return false;
            }
            if (tasks_1.ContributedTask.is(task)) {
                return !task.hasDefinedMatchers && !!task.configurationProperties.problemMatchers && (task.configurationProperties.problemMatchers.length === 0);
            }
            if (tasks_1.CustomTask.is(task)) {
                const configProperties = task._source.config.element;
                return configProperties.problemMatcher === undefined && !task.hasDefinedMatchers;
            }
            return false;
        }
        async _updateNeverProblemMatcherSetting(type) {
            const current = this._configurationService.getValue(PROBLEM_MATCHER_NEVER_CONFIG);
            if (current === true) {
                return;
            }
            let newValue;
            if (current !== false) {
                newValue = current;
            }
            else {
                newValue = Object.create(null);
            }
            newValue[type] = true;
            return this._configurationService.updateValue(PROBLEM_MATCHER_NEVER_CONFIG, newValue);
        }
        async _attachProblemMatcher(task) {
            let entries = [];
            for (const key of problemMatcher_1.ProblemMatcherRegistry.keys()) {
                const matcher = problemMatcher_1.ProblemMatcherRegistry.get(key);
                if (matcher.deprecated) {
                    continue;
                }
                if (matcher.name === matcher.label) {
                    entries.push({ label: matcher.name, matcher: matcher });
                }
                else {
                    entries.push({
                        label: matcher.label,
                        description: `$${matcher.name}`,
                        matcher: matcher
                    });
                }
            }
            if (entries.length === 0) {
                return;
            }
            entries = entries.sort((a, b) => {
                if (a.label && b.label) {
                    return a.label.localeCompare(b.label);
                }
                else {
                    return 0;
                }
            });
            entries.unshift({ type: 'separator', label: nls.localize('TaskService.associate', 'associate') });
            let taskType;
            if (tasks_1.CustomTask.is(task)) {
                const configProperties = task._source.config.element;
                taskType = configProperties.type;
            }
            else {
                taskType = task.getDefinition().type;
            }
            entries.unshift({ label: nls.localize('TaskService.attachProblemMatcher.continueWithout', 'Continue without scanning the task output'), matcher: undefined }, { label: nls.localize('TaskService.attachProblemMatcher.never', 'Never scan the task output for this task'), matcher: undefined, never: true }, { label: nls.localize('TaskService.attachProblemMatcher.neverType', 'Never scan the task output for {0} tasks', taskType), matcher: undefined, setting: taskType }, { label: nls.localize('TaskService.attachProblemMatcher.learnMoreAbout', 'Learn more about scanning the task output'), matcher: undefined, learnMore: true });
            const problemMatcher = await this._quickInputService.pick(entries, { placeHolder: nls.localize('selectProblemMatcher', 'Select for which kind of errors and warnings to scan the task output') });
            if (!problemMatcher) {
                return task;
            }
            if (problemMatcher.learnMore) {
                this._openDocumentation();
                return undefined;
            }
            if (problemMatcher.never) {
                this.customize(task, { problemMatcher: [] }, true);
                return task;
            }
            if (problemMatcher.matcher) {
                const newTask = task.clone();
                const matcherReference = `$${problemMatcher.matcher.name}`;
                const properties = { problemMatcher: [matcherReference] };
                newTask.configurationProperties.problemMatchers = [matcherReference];
                const matcher = problemMatcher_1.ProblemMatcherRegistry.get(problemMatcher.matcher.name);
                if (matcher && matcher.watching !== undefined) {
                    properties.isBackground = true;
                    newTask.configurationProperties.isBackground = true;
                }
                this.customize(task, properties, true);
                return newTask;
            }
            if (problemMatcher.setting) {
                await this._updateNeverProblemMatcherSetting(problemMatcher.setting);
            }
            return task;
        }
        async _getTasksForGroup(group) {
            const groups = await this._getGroupedTasks();
            const result = [];
            groups.forEach(tasks => {
                for (const task of tasks) {
                    const configTaskGroup = tasks_1.TaskGroup.from(task.configurationProperties.group);
                    if (configTaskGroup?._id === group._id) {
                        result.push(task);
                    }
                }
            });
            return result;
        }
        needsFolderQualification() {
            return this._contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */;
        }
        _canCustomize(task) {
            if (this.schemaVersion !== 2 /* JsonSchemaVersion.V2_0_0 */) {
                return false;
            }
            if (tasks_1.CustomTask.is(task)) {
                return true;
            }
            if (tasks_1.ContributedTask.is(task)) {
                return !!task.getWorkspaceFolder();
            }
            return false;
        }
        async _formatTaskForJson(resource, task) {
            let reference;
            let stringValue = '';
            try {
                reference = await this._textModelResolverService.createModelReference(resource);
                const model = reference.object.textEditorModel;
                const { tabSize, insertSpaces } = model.getOptions();
                const eol = model.getEOL();
                let stringified = (0, jsonFormatter_1.toFormattedString)(task, { eol, tabSize, insertSpaces });
                const regex = new RegExp(eol + (insertSpaces ? ' '.repeat(tabSize) : '\\t'), 'g');
                stringified = stringified.replace(regex, eol + (insertSpaces ? ' '.repeat(tabSize * 3) : '\t\t\t'));
                const twoTabs = insertSpaces ? ' '.repeat(tabSize * 2) : '\t\t';
                stringValue = twoTabs + stringified.slice(0, stringified.length - 1) + twoTabs + stringified.slice(stringified.length - 1);
            }
            finally {
                reference?.dispose();
            }
            return stringValue;
        }
        async _openEditorAtTask(resource, task, configIndex = -1) {
            if (resource === undefined) {
                return Promise.resolve(false);
            }
            const fileContent = await this._fileService.readFile(resource);
            const content = fileContent.value;
            if (!content || !task) {
                return false;
            }
            const contentValue = content.toString();
            let stringValue;
            if (configIndex !== -1) {
                const json = this._configurationService.getValue('tasks', { resource });
                if (json.tasks && (json.tasks.length > configIndex)) {
                    stringValue = await this._formatTaskForJson(resource, json.tasks[configIndex]);
                }
            }
            if (!stringValue) {
                if (typeof task === 'string') {
                    stringValue = task;
                }
                else {
                    stringValue = await this._formatTaskForJson(resource, task);
                }
            }
            const index = contentValue.indexOf(stringValue);
            let startLineNumber = 1;
            for (let i = 0; i < index; i++) {
                if (contentValue.charAt(i) === '\n') {
                    startLineNumber++;
                }
            }
            let endLineNumber = startLineNumber;
            for (let i = 0; i < stringValue.length; i++) {
                if (stringValue.charAt(i) === '\n') {
                    endLineNumber++;
                }
            }
            const selection = startLineNumber > 1 ? { startLineNumber, startColumn: startLineNumber === endLineNumber ? 4 : 3, endLineNumber, endColumn: startLineNumber === endLineNumber ? undefined : 4 } : undefined;
            await this._editorService.openEditor({
                resource,
                options: {
                    pinned: false,
                    forceReload: true,
                    selection,
                    selectionRevealType: 1 /* TextEditorSelectionRevealType.CenterIfOutsideViewport */
                }
            });
            return !!selection;
        }
        _createCustomizableTask(task) {
            let toCustomize;
            const taskConfig = tasks_1.CustomTask.is(task) || tasks_1.ConfiguringTask.is(task) ? task._source.config : undefined;
            if (taskConfig && taskConfig.element) {
                toCustomize = { ...(taskConfig.element) };
            }
            else if (tasks_1.ContributedTask.is(task)) {
                toCustomize = {};
                const identifier = Object.assign(Object.create(null), task.defines);
                delete identifier['_key'];
                Object.keys(identifier).forEach(key => toCustomize[key] = identifier[key]);
                if (task.configurationProperties.problemMatchers && task.configurationProperties.problemMatchers.length > 0 && Types.isStringArray(task.configurationProperties.problemMatchers)) {
                    toCustomize.problemMatcher = task.configurationProperties.problemMatchers;
                }
                if (task.configurationProperties.group) {
                    toCustomize.group = TaskConfig.GroupKind.to(task.configurationProperties.group);
                }
            }
            if (!toCustomize) {
                return undefined;
            }
            if (toCustomize.problemMatcher === undefined && task.configurationProperties.problemMatchers === undefined || (task.configurationProperties.problemMatchers && task.configurationProperties.problemMatchers.length === 0)) {
                toCustomize.problemMatcher = [];
            }
            if (task._source.label !== 'Workspace') {
                toCustomize.label = task.configurationProperties.identifier;
            }
            else {
                toCustomize.label = task._label;
            }
            toCustomize.detail = task.configurationProperties.detail;
            return toCustomize;
        }
        async customize(task, properties, openConfig) {
            if (!(await this._trust())) {
                return;
            }
            const workspaceFolder = task.getWorkspaceFolder();
            if (!workspaceFolder) {
                return Promise.resolve(undefined);
            }
            const configuration = this._getConfiguration(workspaceFolder, task._source.kind);
            if (configuration.hasParseErrors) {
                this._notificationService.warn(nls.localize('customizeParseErrors', 'The current task configuration has errors. Please fix the errors first before customizing a task.'));
                return Promise.resolve(undefined);
            }
            const fileConfig = configuration.config;
            const toCustomize = this._createCustomizableTask(task);
            if (!toCustomize) {
                return Promise.resolve(undefined);
            }
            const index = tasks_1.CustomTask.is(task) ? task._source.config.index : undefined;
            if (properties) {
                for (const property of Object.getOwnPropertyNames(properties)) {
                    const value = properties[property];
                    if (value !== undefined && value !== null) {
                        toCustomize[property] = value;
                    }
                }
            }
            if (!fileConfig) {
                const value = {
                    version: '2.0.0',
                    tasks: [toCustomize]
                };
                let content = [
                    '{',
                    nls.localize('tasksJsonComment', '\t// See https://go.microsoft.com/fwlink/?LinkId=733558 \n\t// for the documentation about the tasks.json format'),
                ].join('\n') + JSON.stringify(value, null, '\t').substr(1);
                const editorConfig = this._configurationService.getValue();
                if (editorConfig.editor.insertSpaces) {
                    content = content.replace(/(\n)(\t+)/g, (_, s1, s2) => s1 + ' '.repeat(s2.length * editorConfig.editor.tabSize));
                }
                await this._textFileService.create([{ resource: workspaceFolder.toResource('.vscode/tasks.json'), value: content }]);
            }
            else {
                // We have a global task configuration
                if ((index === -1) && properties) {
                    if (properties.problemMatcher !== undefined) {
                        fileConfig.problemMatcher = properties.problemMatcher;
                        await this._writeConfiguration(workspaceFolder, 'tasks.problemMatchers', fileConfig.problemMatcher, task._source.kind);
                    }
                    else if (properties.group !== undefined) {
                        fileConfig.group = properties.group;
                        await this._writeConfiguration(workspaceFolder, 'tasks.group', fileConfig.group, task._source.kind);
                    }
                }
                else {
                    if (!Array.isArray(fileConfig.tasks)) {
                        fileConfig.tasks = [];
                    }
                    if (index === undefined) {
                        fileConfig.tasks.push(toCustomize);
                    }
                    else {
                        fileConfig.tasks[index] = toCustomize;
                    }
                    await this._writeConfiguration(workspaceFolder, 'tasks.tasks', fileConfig.tasks, task._source.kind);
                }
            }
            if (openConfig) {
                this._openEditorAtTask(this._getResourceForTask(task), toCustomize);
            }
        }
        _writeConfiguration(workspaceFolder, key, value, source) {
            let target = undefined;
            switch (source) {
                case tasks_1.TaskSourceKind.User:
                    target = 2 /* ConfigurationTarget.USER */;
                    break;
                case tasks_1.TaskSourceKind.WorkspaceFile:
                    target = 5 /* ConfigurationTarget.WORKSPACE */;
                    break;
                default: if (this._contextService.getWorkbenchState() === 2 /* WorkbenchState.FOLDER */) {
                    target = 5 /* ConfigurationTarget.WORKSPACE */;
                }
                else if (this._contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
                    target = 6 /* ConfigurationTarget.WORKSPACE_FOLDER */;
                }
            }
            if (target) {
                return this._configurationService.updateValue(key, value, { resource: workspaceFolder.uri }, target);
            }
            else {
                return undefined;
            }
        }
        _getResourceForKind(kind) {
            this._updateSetup();
            switch (kind) {
                case tasks_1.TaskSourceKind.User: {
                    return resources.joinPath(resources.dirname(this._preferencesService.userSettingsResource), 'tasks.json');
                }
                case tasks_1.TaskSourceKind.WorkspaceFile: {
                    if (this._workspace && this._workspace.configuration) {
                        return this._workspace.configuration;
                    }
                }
                default: {
                    return undefined;
                }
            }
        }
        _getResourceForTask(task) {
            if (tasks_1.CustomTask.is(task)) {
                let uri = this._getResourceForKind(task._source.kind);
                if (!uri) {
                    const taskFolder = task.getWorkspaceFolder();
                    if (taskFolder) {
                        uri = taskFolder.toResource(task._source.config.file);
                    }
                    else {
                        uri = this.workspaceFolders[0].uri;
                    }
                }
                return uri;
            }
            else {
                return task.getWorkspaceFolder().toResource('.vscode/tasks.json');
            }
        }
        async openConfig(task) {
            let resource;
            if (task) {
                resource = this._getResourceForTask(task);
            }
            else {
                resource = (this._workspaceFolders && (this._workspaceFolders.length > 0)) ? this._workspaceFolders[0].toResource('.vscode/tasks.json') : undefined;
            }
            return this._openEditorAtTask(resource, task ? task._label : undefined, task ? task._source.config.index : -1);
        }
        _createRunnableTask(tasks, group) {
            const resolverData = new Map();
            const workspaceTasks = [];
            const extensionTasks = [];
            tasks.forEach((tasks, folder) => {
                let data = resolverData.get(folder);
                if (!data) {
                    data = {
                        id: new Map(),
                        label: new Map(),
                        identifier: new Map()
                    };
                    resolverData.set(folder, data);
                }
                for (const task of tasks) {
                    data.id.set(task._id, task);
                    data.label.set(task._label, task);
                    if (task.configurationProperties.identifier) {
                        data.identifier.set(task.configurationProperties.identifier, task);
                    }
                    if (group && task.configurationProperties.group === group) {
                        if (task._source.kind === tasks_1.TaskSourceKind.Workspace) {
                            workspaceTasks.push(task);
                        }
                        else {
                            extensionTasks.push(task);
                        }
                    }
                }
            });
            const resolver = {
                resolve: async (uri, alias) => {
                    const data = resolverData.get(typeof uri === 'string' ? uri : uri.toString());
                    if (!data) {
                        return undefined;
                    }
                    return data.id.get(alias) || data.label.get(alias) || data.identifier.get(alias);
                }
            };
            if (workspaceTasks.length > 0) {
                if (workspaceTasks.length > 1) {
                    this._outputChannel.append(nls.localize('moreThanOneBuildTask', 'There are many build tasks defined in the tasks.json. Executing the first one.\n'));
                }
                return { task: workspaceTasks[0], resolver };
            }
            if (extensionTasks.length === 0) {
                return undefined;
            }
            // We can only have extension tasks if we are in version 2.0.0. Then we can even run
            // multiple build tasks.
            if (extensionTasks.length === 1) {
                return { task: extensionTasks[0], resolver };
            }
            else {
                const id = UUID.generateUuid();
                const task = new tasks_1.InMemoryTask(id, { kind: tasks_1.TaskSourceKind.InMemory, label: 'inMemory' }, id, 'inMemory', { reevaluateOnRerun: true }, {
                    identifier: id,
                    dependsOn: extensionTasks.map((extensionTask) => { return { uri: extensionTask.getWorkspaceFolder().uri, task: extensionTask._id }; }),
                    name: id
                });
                return { task, resolver };
            }
        }
        _createResolver(grouped) {
            let resolverData;
            async function quickResolve(that, uri, identifier) {
                const foundTasks = await that._findWorkspaceTasks((task) => {
                    const taskUri = ((tasks_1.ConfiguringTask.is(task) || tasks_1.CustomTask.is(task)) ? task._source.config.workspaceFolder?.uri : undefined);
                    const originalUri = (typeof uri === 'string' ? uri : uri.toString());
                    if (taskUri?.toString() !== originalUri) {
                        return false;
                    }
                    if (Types.isString(identifier)) {
                        return ((task._label === identifier) || (task.configurationProperties.identifier === identifier));
                    }
                    else {
                        const keyedIdentifier = task.getDefinition(true);
                        const searchIdentifier = tasks_1.TaskDefinition.createTaskIdentifier(identifier, console);
                        return (searchIdentifier && keyedIdentifier) ? (searchIdentifier._key === keyedIdentifier._key) : false;
                    }
                });
                if (foundTasks.length === 0) {
                    return undefined;
                }
                const task = foundTasks[0];
                if (tasks_1.ConfiguringTask.is(task)) {
                    return that.tryResolveTask(task);
                }
                return task;
            }
            async function getResolverData(that) {
                if (resolverData === undefined) {
                    resolverData = new Map();
                    (grouped || await that._getGroupedTasks()).forEach((tasks, folder) => {
                        let data = resolverData.get(folder);
                        if (!data) {
                            data = { label: new Map(), identifier: new Map(), taskIdentifier: new Map() };
                            resolverData.set(folder, data);
                        }
                        for (const task of tasks) {
                            data.label.set(task._label, task);
                            if (task.configurationProperties.identifier) {
                                data.identifier.set(task.configurationProperties.identifier, task);
                            }
                            const keyedIdentifier = task.getDefinition(true);
                            if (keyedIdentifier !== undefined) {
                                data.taskIdentifier.set(keyedIdentifier._key, task);
                            }
                        }
                    });
                }
                return resolverData;
            }
            async function fullResolve(that, uri, identifier) {
                const allResolverData = await getResolverData(that);
                const data = allResolverData.get(typeof uri === 'string' ? uri : uri.toString());
                if (!data) {
                    return undefined;
                }
                if (Types.isString(identifier)) {
                    return data.label.get(identifier) || data.identifier.get(identifier);
                }
                else {
                    const key = tasks_1.TaskDefinition.createTaskIdentifier(identifier, console);
                    return key !== undefined ? data.taskIdentifier.get(key._key) : undefined;
                }
            }
            return {
                resolve: async (uri, identifier) => {
                    if (!identifier) {
                        return undefined;
                    }
                    if ((resolverData === undefined) && (grouped === undefined)) {
                        return (await quickResolve(this, uri, identifier)) ?? fullResolve(this, uri, identifier);
                    }
                    else {
                        return fullResolve(this, uri, identifier);
                    }
                }
            };
        }
        async _saveBeforeRun() {
            let SaveBeforeRunConfigOptions;
            (function (SaveBeforeRunConfigOptions) {
                SaveBeforeRunConfigOptions["Always"] = "always";
                SaveBeforeRunConfigOptions["Never"] = "never";
                SaveBeforeRunConfigOptions["Prompt"] = "prompt";
            })(SaveBeforeRunConfigOptions || (SaveBeforeRunConfigOptions = {}));
            const saveBeforeRunTaskConfig = this._configurationService.getValue("task.saveBeforeRun" /* TaskSettingId.SaveBeforeRun */);
            if (saveBeforeRunTaskConfig === SaveBeforeRunConfigOptions.Never) {
                return false;
            }
            else if (saveBeforeRunTaskConfig === SaveBeforeRunConfigOptions.Prompt && this._editorService.editors.some(e => e.isDirty())) {
                const { confirmed } = await this._dialogService.confirm({
                    message: nls.localize('TaskSystem.saveBeforeRun.prompt.title', "Save all editors?"),
                    detail: nls.localize('detail', "Do you want to save all editors before running the task?"),
                    primaryButton: nls.localize({ key: 'saveBeforeRun.save', comment: ['&& denotes a mnemonic'] }, '&&Save'),
                    cancelButton: nls.localize('saveBeforeRun.dontSave', 'Don\'t save'),
                });
                if (!confirmed) {
                    return false;
                }
            }
            await this._editorService.saveAll({ reason: 2 /* SaveReason.AUTO */ });
            return true;
        }
        async _executeTask(task, resolver, runSource) {
            let taskToRun = task;
            if (await this._saveBeforeRun()) {
                await this._configurationService.reloadConfiguration();
                await this._updateWorkspaceTasks();
                const taskFolder = task.getWorkspaceFolder();
                const taskIdentifier = task.configurationProperties.identifier;
                const taskType = tasks_1.CustomTask.is(task) ? task.customizes()?.type : (tasks_1.ContributedTask.is(task) ? task.type : undefined);
                // Since we save before running tasks, the task may have changed as part of the save.
                // However, if the TaskRunSource is not User, then we shouldn't try to fetch the task again
                // since this can cause a new'd task to get overwritten with a provided task.
                taskToRun = ((taskFolder && taskIdentifier && (runSource === 1 /* TaskRunSource.User */))
                    ? await this.getTask(taskFolder, taskIdentifier, false, taskType) : task) ?? task;
            }
            await problemMatcher_1.ProblemMatcherRegistry.onReady();
            const executeResult = runSource === 4 /* TaskRunSource.Reconnect */ ? this._getTaskSystem().reconnect(taskToRun, resolver) : this._getTaskSystem().run(taskToRun, resolver);
            if (executeResult) {
                return this._handleExecuteResult(executeResult, runSource);
            }
            return { exitCode: 0 };
        }
        async _handleExecuteResult(executeResult, runSource) {
            if (runSource === 1 /* TaskRunSource.User */) {
                await this._setRecentlyUsedTask(executeResult.task);
            }
            if (executeResult.kind === 2 /* TaskExecuteKind.Active */) {
                const active = executeResult.active;
                if (active && active.same && runSource === 2 /* TaskRunSource.FolderOpen */ || runSource === 4 /* TaskRunSource.Reconnect */) {
                    // ignore, the task is already active, likely from being reconnected or from folder open.
                    this._logService.debug('Ignoring task that is already active', executeResult.task);
                    return executeResult.promise;
                }
                if (active && active.same) {
                    if (this._taskSystem?.isTaskVisible(executeResult.task)) {
                        const message = nls.localize('TaskSystem.activeSame.noBackground', 'The task \'{0}\' is already active.', executeResult.task.getQualifiedLabel());
                        const lastInstance = this._getTaskSystem().getLastInstance(executeResult.task) ?? executeResult.task;
                        this._notificationService.prompt(severity_1.default.Warning, message, [{
                                label: nls.localize('terminateTask', "Terminate Task"),
                                run: () => this.terminate(lastInstance)
                            },
                            {
                                label: nls.localize('restartTask', "Restart Task"),
                                run: () => this._restart(lastInstance)
                            }], { sticky: true });
                    }
                    else {
                        this._taskSystem?.revealTask(executeResult.task);
                    }
                }
                else {
                    throw new taskSystem_1.TaskError(severity_1.default.Warning, nls.localize('TaskSystem.active', 'There is already a task running. Terminate it first before executing another task.'), 1 /* TaskErrors.RunningTask */);
                }
            }
            this._setRecentlyUsedTask(executeResult.task);
            return executeResult.promise;
        }
        async _restart(task) {
            if (!this._taskSystem) {
                return;
            }
            const response = await this._taskSystem.terminate(task);
            if (response.success) {
                try {
                    await this.run(task);
                }
                catch {
                    // eat the error, we don't care about it here
                }
            }
            else {
                this._notificationService.warn(nls.localize('TaskSystem.restartFailed', 'Failed to terminate and restart task {0}', Types.isString(task) ? task : task.configurationProperties.name));
            }
        }
        async terminate(task) {
            if (!(await this._trust())) {
                return { success: true, task: undefined };
            }
            if (!this._taskSystem) {
                return { success: true, task: undefined };
            }
            return this._taskSystem.terminate(task);
        }
        _terminateAll() {
            if (!this._taskSystem) {
                return Promise.resolve([]);
            }
            return this._taskSystem.terminateAll();
        }
        _createTerminalTaskSystem() {
            return new terminalTaskSystem_1.TerminalTaskSystem(this._terminalService, this._terminalGroupService, this._outputService, this._paneCompositeService, this._viewsService, this._markerService, this._modelService, this._configurationResolverService, this._contextService, this._environmentService, AbstractTaskService_1.OutputChannelId, this._fileService, this._terminalProfileResolverService, this._pathService, this._viewDescriptorService, this._logService, this._notificationService, this._instantiationService, (workspaceFolder) => {
                if (workspaceFolder) {
                    return this._getTaskSystemInfo(workspaceFolder.uri.scheme);
                }
                else if (this._taskSystemInfos.size > 0) {
                    const infos = Array.from(this._taskSystemInfos.entries());
                    const notFile = infos.filter(info => info[0] !== network_1.Schemas.file);
                    if (notFile.length > 0) {
                        return notFile[0][1][0];
                    }
                    return infos[0][1][0];
                }
                else {
                    return undefined;
                }
            });
        }
        _isTaskProviderEnabled(type) {
            const definition = taskDefinitionRegistry_1.TaskDefinitionRegistry.get(type);
            return !definition || !definition.when || this._contextKeyService.contextMatchesRules(definition.when);
        }
        async _getGroupedTasks(filter) {
            await this._waitForAllSupportedExecutions;
            const type = filter?.type;
            const needsRecentTasksMigration = this._needsRecentTasksMigration();
            await this._activateTaskProviders(filter?.type);
            const validTypes = Object.create(null);
            taskDefinitionRegistry_1.TaskDefinitionRegistry.all().forEach(definition => validTypes[definition.taskType] = true);
            validTypes['shell'] = true;
            validTypes['process'] = true;
            const contributedTaskSets = await new Promise(resolve => {
                const result = [];
                let counter = 0;
                const done = (value) => {
                    if (value) {
                        result.push(value);
                    }
                    if (--counter === 0) {
                        resolve(result);
                    }
                };
                const error = (error) => {
                    try {
                        if (error && Types.isString(error.message)) {
                            this._outputChannel.append('Error: ');
                            this._outputChannel.append(error.message);
                            this._outputChannel.append('\n');
                            this._showOutput();
                        }
                        else {
                            this._outputChannel.append('Unknown error received while collecting tasks from providers.\n');
                            this._showOutput();
                        }
                    }
                    finally {
                        if (--counter === 0) {
                            resolve(result);
                        }
                    }
                };
                if (this._isProvideTasksEnabled() && (this.schemaVersion === 2 /* JsonSchemaVersion.V2_0_0 */) && (this._providers.size > 0)) {
                    let foundAnyProviders = false;
                    for (const [handle, provider] of this._providers) {
                        const providerType = this._providerTypes.get(handle);
                        if ((type === undefined) || (type === providerType)) {
                            if (providerType && !this._isTaskProviderEnabled(providerType)) {
                                continue;
                            }
                            foundAnyProviders = true;
                            counter++;
                            (0, async_1.raceTimeout)(provider.provideTasks(validTypes).then((taskSet) => {
                                // Check that the tasks provided are of the correct type
                                for (const task of taskSet.tasks) {
                                    if (task.type !== this._providerTypes.get(handle)) {
                                        this._outputChannel.append(nls.localize('unexpectedTaskType', "The task provider for \"{0}\" tasks unexpectedly provided a task of type \"{1}\".\n", this._providerTypes.get(handle), task.type));
                                        if ((task.type !== 'shell') && (task.type !== 'process')) {
                                            this._showOutput();
                                        }
                                        break;
                                    }
                                }
                                return done(taskSet);
                            }, error), 5000, () => {
                                // onTimeout
                                console.error('Timed out getting tasks from ', providerType);
                                done(undefined);
                            });
                        }
                    }
                    if (!foundAnyProviders) {
                        resolve(result);
                    }
                }
                else {
                    resolve(result);
                }
            });
            const result = new TaskMap();
            const contributedTasks = new TaskMap();
            for (const set of contributedTaskSets) {
                for (const task of set.tasks) {
                    const workspaceFolder = task.getWorkspaceFolder();
                    if (workspaceFolder) {
                        contributedTasks.add(workspaceFolder, task);
                    }
                }
            }
            try {
                const customTasks = await this.getWorkspaceTasks();
                const customTasksKeyValuePairs = Array.from(customTasks);
                const customTasksPromises = customTasksKeyValuePairs.map(async ([key, folderTasks]) => {
                    const contributed = contributedTasks.get(key);
                    if (!folderTasks.set) {
                        if (contributed) {
                            result.add(key, ...contributed);
                        }
                        return;
                    }
                    if (this._contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */) {
                        result.add(key, ...folderTasks.set.tasks);
                    }
                    else {
                        const configurations = folderTasks.configurations;
                        const legacyTaskConfigurations = folderTasks.set ? this._getLegacyTaskConfigurations(folderTasks.set) : undefined;
                        const customTasksToDelete = [];
                        if (configurations || legacyTaskConfigurations) {
                            const unUsedConfigurations = new Set();
                            if (configurations) {
                                Object.keys(configurations.byIdentifier).forEach(key => unUsedConfigurations.add(key));
                            }
                            for (const task of contributed) {
                                if (!tasks_1.ContributedTask.is(task)) {
                                    continue;
                                }
                                if (configurations) {
                                    const configuringTask = configurations.byIdentifier[task.defines._key];
                                    if (configuringTask) {
                                        unUsedConfigurations.delete(task.defines._key);
                                        result.add(key, TaskConfig.createCustomTask(task, configuringTask));
                                    }
                                    else {
                                        result.add(key, task);
                                    }
                                }
                                else if (legacyTaskConfigurations) {
                                    const configuringTask = legacyTaskConfigurations[task.defines._key];
                                    if (configuringTask) {
                                        result.add(key, TaskConfig.createCustomTask(task, configuringTask));
                                        customTasksToDelete.push(configuringTask);
                                    }
                                    else {
                                        result.add(key, task);
                                    }
                                }
                                else {
                                    result.add(key, task);
                                }
                            }
                            if (customTasksToDelete.length > 0) {
                                const toDelete = customTasksToDelete.reduce((map, task) => {
                                    map[task._id] = true;
                                    return map;
                                }, Object.create(null));
                                for (const task of folderTasks.set.tasks) {
                                    if (toDelete[task._id]) {
                                        continue;
                                    }
                                    result.add(key, task);
                                }
                            }
                            else {
                                result.add(key, ...folderTasks.set.tasks);
                            }
                            const unUsedConfigurationsAsArray = Array.from(unUsedConfigurations);
                            const unUsedConfigurationPromises = unUsedConfigurationsAsArray.map(async (value) => {
                                const configuringTask = configurations.byIdentifier[value];
                                if (type && (type !== configuringTask.configures.type)) {
                                    return;
                                }
                                let requiredTaskProviderUnavailable = false;
                                for (const [handle, provider] of this._providers) {
                                    const providerType = this._providerTypes.get(handle);
                                    if (configuringTask.type === providerType) {
                                        if (providerType && !this._isTaskProviderEnabled(providerType)) {
                                            requiredTaskProviderUnavailable = true;
                                            continue;
                                        }
                                        try {
                                            const resolvedTask = await provider.resolveTask(configuringTask);
                                            if (resolvedTask && (resolvedTask._id === configuringTask._id)) {
                                                result.add(key, TaskConfig.createCustomTask(resolvedTask, configuringTask));
                                                return;
                                            }
                                        }
                                        catch (error) {
                                            // Ignore errors. The task could not be provided by any of the providers.
                                        }
                                    }
                                }
                                if (requiredTaskProviderUnavailable) {
                                    this._outputChannel.append(nls.localize('TaskService.providerUnavailable', 'Warning: {0} tasks are unavailable in the current environment.\n', configuringTask.configures.type));
                                }
                                else {
                                    this._outputChannel.append(nls.localize('TaskService.noConfiguration', 'Error: The {0} task detection didn\'t contribute a task for the following configuration:\n{1}\nThe task will be ignored.\n', configuringTask.configures.type, JSON.stringify(configuringTask._source.config.element, undefined, 4)));
                                    this._showOutput();
                                }
                            });
                            await Promise.all(unUsedConfigurationPromises);
                        }
                        else {
                            result.add(key, ...folderTasks.set.tasks);
                            result.add(key, ...contributed);
                        }
                    }
                });
                await Promise.all(customTasksPromises);
                if (needsRecentTasksMigration) {
                    // At this point we have all the tasks and can migrate the recently used tasks.
                    await this._migrateRecentTasks(result.all());
                }
                return result;
            }
            catch {
                // If we can't read the tasks.json file provide at least the contributed tasks
                const result = new TaskMap();
                for (const set of contributedTaskSets) {
                    for (const task of set.tasks) {
                        const folder = task.getWorkspaceFolder();
                        if (folder) {
                            result.add(folder, task);
                        }
                    }
                }
                return result;
            }
        }
        _getLegacyTaskConfigurations(workspaceTasks) {
            let result;
            function getResult() {
                if (result) {
                    return result;
                }
                result = Object.create(null);
                return result;
            }
            for (const task of workspaceTasks.tasks) {
                if (tasks_1.CustomTask.is(task)) {
                    const commandName = task.command && task.command.name;
                    // This is for backwards compatibility with the 0.1.0 task annotation code
                    // if we had a gulp, jake or grunt command a task specification was a annotation
                    if (commandName === 'gulp' || commandName === 'grunt' || commandName === 'jake') {
                        const identifier = tasks_1.KeyedTaskIdentifier.create({
                            type: commandName,
                            task: task.configurationProperties.name
                        });
                        getResult()[identifier._key] = task;
                    }
                }
            }
            return result;
        }
        async getWorkspaceTasks(runSource = 1 /* TaskRunSource.User */) {
            if (!(await this._trust())) {
                return new Map();
            }
            await (0, async_1.raceTimeout)(this._waitForAllSupportedExecutions, 2000, () => {
                this._logService.warn('Timed out waiting for all supported executions');
            });
            await this._whenTaskSystemReady;
            if (this._workspaceTasksPromise) {
                return this._workspaceTasksPromise;
            }
            return this._updateWorkspaceTasks(runSource);
        }
        _updateWorkspaceTasks(runSource = 1 /* TaskRunSource.User */) {
            this._workspaceTasksPromise = this._computeWorkspaceTasks(runSource);
            return this._workspaceTasksPromise;
        }
        async _getAFolder() {
            let folder = this.workspaceFolders.length > 0 ? this.workspaceFolders[0] : undefined;
            if (!folder) {
                const userhome = await this._pathService.userHome();
                folder = new workspace_1.WorkspaceFolder({ uri: userhome, name: resources.basename(userhome), index: 0 });
            }
            return folder;
        }
        async _computeWorkspaceTasks(runSource = 1 /* TaskRunSource.User */) {
            const promises = [];
            for (const folder of this.workspaceFolders) {
                promises.push(this._computeWorkspaceFolderTasks(folder, runSource));
            }
            const values = await Promise.all(promises);
            const result = new Map();
            for (const value of values) {
                if (value) {
                    result.set(value.workspaceFolder.uri.toString(), value);
                }
            }
            const folder = await this._getAFolder();
            if (this._contextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */) {
                const workspaceFileTasks = await this._computeWorkspaceFileTasks(folder, runSource);
                if (workspaceFileTasks && this._workspace && this._workspace.configuration) {
                    result.set(this._workspace.configuration.toString(), workspaceFileTasks);
                }
            }
            const userTasks = await this._computeUserTasks(folder, runSource);
            if (userTasks) {
                result.set(tasks_1.USER_TASKS_GROUP_KEY, userTasks);
            }
            return result;
        }
        get _jsonTasksSupported() {
            return taskService_1.ShellExecutionSupportedContext.getValue(this._contextKeyService) === true && taskService_1.ProcessExecutionSupportedContext.getValue(this._contextKeyService) === true;
        }
        async _computeWorkspaceFolderTasks(workspaceFolder, runSource = 1 /* TaskRunSource.User */) {
            const workspaceFolderConfiguration = (this._executionEngine === tasks_1.ExecutionEngine.Process ? await this._computeLegacyConfiguration(workspaceFolder) : await this._computeConfiguration(workspaceFolder));
            if (!workspaceFolderConfiguration || !workspaceFolderConfiguration.config || workspaceFolderConfiguration.hasErrors) {
                return Promise.resolve({ workspaceFolder, set: undefined, configurations: undefined, hasErrors: workspaceFolderConfiguration ? workspaceFolderConfiguration.hasErrors : false });
            }
            await problemMatcher_1.ProblemMatcherRegistry.onReady();
            const taskSystemInfo = this._getTaskSystemInfo(workspaceFolder.uri.scheme);
            const problemReporter = new ProblemReporter(this._outputChannel);
            const parseResult = TaskConfig.parse(workspaceFolder, undefined, taskSystemInfo ? taskSystemInfo.platform : Platform.platform, workspaceFolderConfiguration.config, problemReporter, TaskConfig.TaskConfigSource.TasksJson, this._contextKeyService);
            let hasErrors = false;
            if (!parseResult.validationStatus.isOK() && (parseResult.validationStatus.state !== 1 /* ValidationState.Info */)) {
                hasErrors = true;
                this._showOutput(runSource);
            }
            if (problemReporter.status.isFatal()) {
                problemReporter.fatal(nls.localize('TaskSystem.configurationErrors', 'Error: the provided task configuration has validation errors and can\'t not be used. Please correct the errors first.'));
                return { workspaceFolder, set: undefined, configurations: undefined, hasErrors };
            }
            let customizedTasks;
            if (parseResult.configured && parseResult.configured.length > 0) {
                customizedTasks = {
                    byIdentifier: Object.create(null)
                };
                for (const task of parseResult.configured) {
                    customizedTasks.byIdentifier[task.configures._key] = task;
                }
            }
            if (!this._jsonTasksSupported && (parseResult.custom.length > 0)) {
                console.warn('Custom workspace tasks are not supported.');
            }
            return { workspaceFolder, set: { tasks: this._jsonTasksSupported ? parseResult.custom : [] }, configurations: customizedTasks, hasErrors };
        }
        _testParseExternalConfig(config, location) {
            if (!config) {
                return { config: undefined, hasParseErrors: false };
            }
            const parseErrors = config.$parseErrors;
            if (parseErrors) {
                let isAffected = false;
                for (const parseError of parseErrors) {
                    if (/tasks\.json$/.test(parseError)) {
                        isAffected = true;
                        break;
                    }
                }
                if (isAffected) {
                    this._outputChannel.append(nls.localize({ key: 'TaskSystem.invalidTaskJsonOther', comment: ['Message notifies of an error in one of several places there is tasks related json, not necessarily in a file named tasks.json'] }, 'Error: The content of the tasks json in {0} has syntax errors. Please correct them before executing a task.\n', location));
                    this._showOutput();
                    return { config, hasParseErrors: true };
                }
            }
            return { config, hasParseErrors: false };
        }
        async _computeWorkspaceFileTasks(workspaceFolder, runSource = 1 /* TaskRunSource.User */) {
            if (this._executionEngine === tasks_1.ExecutionEngine.Process) {
                return this._emptyWorkspaceTaskResults(workspaceFolder);
            }
            const workspaceFileConfig = this._getConfiguration(workspaceFolder, tasks_1.TaskSourceKind.WorkspaceFile);
            const configuration = this._testParseExternalConfig(workspaceFileConfig.config, nls.localize('TasksSystem.locationWorkspaceConfig', 'workspace file'));
            const customizedTasks = {
                byIdentifier: Object.create(null)
            };
            const custom = [];
            await this._computeTasksForSingleConfig(workspaceFolder, configuration.config, runSource, custom, customizedTasks.byIdentifier, TaskConfig.TaskConfigSource.WorkspaceFile);
            const engine = configuration.config ? TaskConfig.ExecutionEngine.from(configuration.config) : tasks_1.ExecutionEngine.Terminal;
            if (engine === tasks_1.ExecutionEngine.Process) {
                this._notificationService.warn(nls.localize('TaskSystem.versionWorkspaceFile', 'Only tasks version 2.0.0 permitted in workspace configuration files.'));
                return this._emptyWorkspaceTaskResults(workspaceFolder);
            }
            return { workspaceFolder, set: { tasks: custom }, configurations: customizedTasks, hasErrors: configuration.hasParseErrors };
        }
        async _computeUserTasks(workspaceFolder, runSource = 1 /* TaskRunSource.User */) {
            if (this._executionEngine === tasks_1.ExecutionEngine.Process) {
                return this._emptyWorkspaceTaskResults(workspaceFolder);
            }
            const userTasksConfig = this._getConfiguration(workspaceFolder, tasks_1.TaskSourceKind.User);
            const configuration = this._testParseExternalConfig(userTasksConfig.config, nls.localize('TasksSystem.locationUserConfig', 'user settings'));
            const customizedTasks = {
                byIdentifier: Object.create(null)
            };
            const custom = [];
            await this._computeTasksForSingleConfig(workspaceFolder, configuration.config, runSource, custom, customizedTasks.byIdentifier, TaskConfig.TaskConfigSource.User);
            const engine = configuration.config ? TaskConfig.ExecutionEngine.from(configuration.config) : tasks_1.ExecutionEngine.Terminal;
            if (engine === tasks_1.ExecutionEngine.Process) {
                this._notificationService.warn(nls.localize('TaskSystem.versionSettings', 'Only tasks version 2.0.0 permitted in user settings.'));
                return this._emptyWorkspaceTaskResults(workspaceFolder);
            }
            return { workspaceFolder, set: { tasks: custom }, configurations: customizedTasks, hasErrors: configuration.hasParseErrors };
        }
        _emptyWorkspaceTaskResults(workspaceFolder) {
            return { workspaceFolder, set: undefined, configurations: undefined, hasErrors: false };
        }
        async _computeTasksForSingleConfig(workspaceFolder, config, runSource, custom, customized, source, isRecentTask = false) {
            if (!config) {
                return false;
            }
            const taskSystemInfo = this._getTaskSystemInfo(workspaceFolder.uri.scheme);
            const problemReporter = new ProblemReporter(this._outputChannel);
            if (!taskSystemInfo) {
                problemReporter.fatal(nls.localize('TaskSystem.workspaceFolderError', 'Workspace folder was undefined'));
                return true;
            }
            const parseResult = TaskConfig.parse(workspaceFolder, this._workspace, taskSystemInfo ? taskSystemInfo.platform : Platform.platform, config, problemReporter, source, this._contextKeyService, isRecentTask);
            let hasErrors = false;
            if (!parseResult.validationStatus.isOK() && (parseResult.validationStatus.state !== 1 /* ValidationState.Info */)) {
                this._showOutput(runSource);
                hasErrors = true;
            }
            if (problemReporter.status.isFatal()) {
                problemReporter.fatal(nls.localize('TaskSystem.configurationErrors', 'Error: the provided task configuration has validation errors and can\'t not be used. Please correct the errors first.'));
                return hasErrors;
            }
            if (parseResult.configured && parseResult.configured.length > 0) {
                for (const task of parseResult.configured) {
                    customized[task.configures._key] = task;
                }
            }
            if (!this._jsonTasksSupported && (parseResult.custom.length > 0)) {
                console.warn('Custom workspace tasks are not supported.');
            }
            else {
                for (const task of parseResult.custom) {
                    custom.push(task);
                }
            }
            return hasErrors;
        }
        _computeConfiguration(workspaceFolder) {
            const { config, hasParseErrors } = this._getConfiguration(workspaceFolder);
            return Promise.resolve({ workspaceFolder, config, hasErrors: hasParseErrors });
        }
        _computeWorkspaceFolderSetup() {
            const workspaceFolders = [];
            const ignoredWorkspaceFolders = [];
            let executionEngine = tasks_1.ExecutionEngine.Terminal;
            let schemaVersion = 2 /* JsonSchemaVersion.V2_0_0 */;
            let workspace;
            if (this._contextService.getWorkbenchState() === 2 /* WorkbenchState.FOLDER */) {
                const workspaceFolder = this._contextService.getWorkspace().folders[0];
                workspaceFolders.push(workspaceFolder);
                executionEngine = this._computeExecutionEngine(workspaceFolder);
                const telemetryData = {
                    executionEngineVersion: executionEngine
                };
                /* __GDPR__
                    "taskService.engineVersion" : {
                        "owner": "alexr00",
                        "comment": "The engine version of tasks. Used to determine if a user is using a deprecated version.",
                        "executionEngineVersion" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "comment": "The engine version of tasks." }
                    }
                */
                this._telemetryService.publicLog('taskService.engineVersion', telemetryData);
                schemaVersion = this._computeJsonSchemaVersion(workspaceFolder);
            }
            else if (this._contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
                workspace = this._contextService.getWorkspace();
                for (const workspaceFolder of this._contextService.getWorkspace().folders) {
                    if (schemaVersion === this._computeJsonSchemaVersion(workspaceFolder)) {
                        workspaceFolders.push(workspaceFolder);
                    }
                    else {
                        ignoredWorkspaceFolders.push(workspaceFolder);
                        this._outputChannel.append(nls.localize('taskService.ignoreingFolder', 'Ignoring task configurations for workspace folder {0}. Multi folder workspace task support requires that all folders use task version 2.0.0\n', workspaceFolder.uri.fsPath));
                    }
                }
            }
            return [workspaceFolders, ignoredWorkspaceFolders, executionEngine, schemaVersion, workspace];
        }
        _computeExecutionEngine(workspaceFolder) {
            const { config } = this._getConfiguration(workspaceFolder);
            if (!config) {
                return tasks_1.ExecutionEngine._default;
            }
            return TaskConfig.ExecutionEngine.from(config);
        }
        _computeJsonSchemaVersion(workspaceFolder) {
            const { config } = this._getConfiguration(workspaceFolder);
            if (!config) {
                return 2 /* JsonSchemaVersion.V2_0_0 */;
            }
            return TaskConfig.JsonSchemaVersion.from(config);
        }
        _getConfiguration(workspaceFolder, source) {
            let result;
            if ((source !== tasks_1.TaskSourceKind.User) && (this._contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */)) {
                result = undefined;
            }
            else {
                const wholeConfig = this._configurationService.inspect('tasks', { resource: workspaceFolder.uri });
                switch (source) {
                    case tasks_1.TaskSourceKind.User: {
                        if (wholeConfig.userValue !== wholeConfig.workspaceFolderValue) {
                            result = Objects.deepClone(wholeConfig.userValue);
                        }
                        break;
                    }
                    case tasks_1.TaskSourceKind.Workspace:
                        result = Objects.deepClone(wholeConfig.workspaceFolderValue);
                        break;
                    case tasks_1.TaskSourceKind.WorkspaceFile: {
                        if ((this._contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */)
                            && (wholeConfig.workspaceFolderValue !== wholeConfig.workspaceValue)) {
                            result = Objects.deepClone(wholeConfig.workspaceValue);
                        }
                        break;
                    }
                    default: result = Objects.deepClone(wholeConfig.workspaceFolderValue);
                }
            }
            if (!result) {
                return { config: undefined, hasParseErrors: false };
            }
            const parseErrors = result.$parseErrors;
            if (parseErrors) {
                let isAffected = false;
                for (const parseError of parseErrors) {
                    if (/tasks\.json$/.test(parseError)) {
                        isAffected = true;
                        break;
                    }
                }
                if (isAffected) {
                    this._outputChannel.append(nls.localize('TaskSystem.invalidTaskJson', 'Error: The content of the tasks.json file has syntax errors. Please correct them before executing a task.\n'));
                    this._showOutput();
                    return { config: undefined, hasParseErrors: true };
                }
            }
            return { config: result, hasParseErrors: false };
        }
        inTerminal() {
            if (this._taskSystem) {
                return this._taskSystem instanceof terminalTaskSystem_1.TerminalTaskSystem;
            }
            return this._executionEngine === tasks_1.ExecutionEngine.Terminal;
        }
        configureAction() {
            const thisCapture = this;
            return new class extends actions_1.Action {
                constructor() {
                    super(ConfigureTaskAction.ID, ConfigureTaskAction.TEXT, undefined, true, () => { thisCapture._runConfigureTasks(); return Promise.resolve(undefined); });
                }
            };
        }
        _handleError(err) {
            let showOutput = true;
            if (err instanceof taskSystem_1.TaskError) {
                const buildError = err;
                const needsConfig = buildError.code === 0 /* TaskErrors.NotConfigured */ || buildError.code === 2 /* TaskErrors.NoBuildTask */ || buildError.code === 3 /* TaskErrors.NoTestTask */;
                const needsTerminate = buildError.code === 1 /* TaskErrors.RunningTask */;
                if (needsConfig || needsTerminate) {
                    this._notificationService.prompt(buildError.severity, buildError.message, [{
                            label: needsConfig ? ConfigureTaskAction.TEXT : nls.localize('TerminateAction.label', "Terminate Task"),
                            run: () => {
                                if (needsConfig) {
                                    this._runConfigureTasks();
                                }
                                else {
                                    this._runTerminateCommand();
                                }
                            }
                        }]);
                }
                else {
                    this._notificationService.notify({ severity: buildError.severity, message: buildError.message });
                }
            }
            else if (err instanceof Error) {
                const error = err;
                this._notificationService.error(error.message);
                showOutput = false;
            }
            else if (Types.isString(err)) {
                this._notificationService.error(err);
            }
            else {
                this._notificationService.error(nls.localize('TaskSystem.unknownError', 'An error has occurred while running a task. See task log for details.'));
            }
            if (showOutput) {
                this._showOutput();
            }
        }
        _showDetail() {
            return this._configurationService.getValue(taskQuickPick_1.QUICKOPEN_DETAIL_CONFIG);
        }
        async _createTaskQuickPickEntries(tasks, group = false, sort = false, selectedEntry, includeRecents = true) {
            let encounteredTasks = {};
            if (tasks === undefined || tasks === null || tasks.length === 0) {
                return [];
            }
            const TaskQuickPickEntry = (task) => {
                const newEntry = { label: task._label, description: this.getTaskDescription(task), task, detail: this._showDetail() ? task.configurationProperties.detail : undefined };
                if (encounteredTasks[task._id]) {
                    if (encounteredTasks[task._id].length === 1) {
                        encounteredTasks[task._id][0].label += ' (1)';
                    }
                    newEntry.label = newEntry.label + ' (' + (encounteredTasks[task._id].length + 1).toString() + ')';
                }
                else {
                    encounteredTasks[task._id] = [];
                }
                encounteredTasks[task._id].push(newEntry);
                return newEntry;
            };
            function fillEntries(entries, tasks, groupLabel) {
                if (tasks.length) {
                    entries.push({ type: 'separator', label: groupLabel });
                }
                for (const task of tasks) {
                    const entry = TaskQuickPickEntry(task);
                    entry.buttons = [{ iconClass: themables_1.ThemeIcon.asClassName(taskQuickPick_1.configureTaskIcon), tooltip: nls.localize('configureTask', "Configure Task") }];
                    if (selectedEntry && (task === selectedEntry.task)) {
                        entries.unshift(selectedEntry);
                    }
                    else {
                        entries.push(entry);
                    }
                }
            }
            let entries;
            if (group) {
                entries = [];
                if (tasks.length === 1) {
                    entries.push(TaskQuickPickEntry(tasks[0]));
                }
                else {
                    const recentlyUsedTasks = await this.getSavedTasks('historical');
                    const recent = [];
                    const recentSet = new Set();
                    let configured = [];
                    let detected = [];
                    const taskMap = Object.create(null);
                    tasks.forEach(task => {
                        const key = task.getCommonTaskId();
                        if (key) {
                            taskMap[key] = task;
                        }
                    });
                    recentlyUsedTasks.reverse().forEach(recentTask => {
                        const key = recentTask.getCommonTaskId();
                        if (key) {
                            recentSet.add(key);
                            const task = taskMap[key];
                            if (task) {
                                recent.push(task);
                            }
                        }
                    });
                    for (const task of tasks) {
                        const key = task.getCommonTaskId();
                        if (!key || !recentSet.has(key)) {
                            if ((task._source.kind === tasks_1.TaskSourceKind.Workspace) || (task._source.kind === tasks_1.TaskSourceKind.User)) {
                                configured.push(task);
                            }
                            else {
                                detected.push(task);
                            }
                        }
                    }
                    const sorter = this.createSorter();
                    if (includeRecents) {
                        fillEntries(entries, recent, nls.localize('recentlyUsed', 'recently used tasks'));
                    }
                    configured = configured.sort((a, b) => sorter.compare(a, b));
                    fillEntries(entries, configured, nls.localize('configured', 'configured tasks'));
                    detected = detected.sort((a, b) => sorter.compare(a, b));
                    fillEntries(entries, detected, nls.localize('detected', 'detected tasks'));
                }
            }
            else {
                if (sort) {
                    const sorter = this.createSorter();
                    tasks = tasks.sort((a, b) => sorter.compare(a, b));
                }
                entries = tasks.map(task => TaskQuickPickEntry(task));
            }
            encounteredTasks = {};
            return entries;
        }
        async _showTwoLevelQuickPick(placeHolder, defaultEntry, type, name) {
            return this._instantiationService.createInstance(taskQuickPick_1.TaskQuickPick).show(placeHolder, defaultEntry, type, name);
        }
        async _showQuickPick(tasks, placeHolder, defaultEntry, group = false, sort = false, selectedEntry, additionalEntries, name) {
            const resolvedTasks = await tasks;
            const entries = await (0, async_1.raceTimeout)(this._createTaskQuickPickEntries(resolvedTasks, group, sort, selectedEntry), 200, () => undefined);
            if (!entries) {
                return undefined;
            }
            if (entries.length === 1 && this._configurationService.getValue(taskQuickPick_1.QUICKOPEN_SKIP_CONFIG)) {
                return entries[0];
            }
            else if ((entries.length === 0) && defaultEntry) {
                entries.push(defaultEntry);
            }
            else if (entries.length > 1 && additionalEntries && additionalEntries.length > 0) {
                entries.push({ type: 'separator', label: '' });
                entries.push(additionalEntries[0]);
            }
            const picker = this._quickInputService.createQuickPick();
            picker.placeholder = placeHolder;
            picker.matchOnDescription = true;
            if (name) {
                picker.value = name;
            }
            picker.onDidTriggerItemButton(context => {
                const task = context.item.task;
                this._quickInputService.cancel();
                if (tasks_1.ContributedTask.is(task)) {
                    this.customize(task, undefined, true);
                }
                else if (tasks_1.CustomTask.is(task)) {
                    this.openConfig(task);
                }
            });
            picker.items = entries;
            picker.show();
            return new Promise(resolve => {
                this._register(picker.onDidAccept(async () => {
                    const selectedEntry = picker.selectedItems ? picker.selectedItems[0] : undefined;
                    picker.dispose();
                    if (!selectedEntry) {
                        resolve(undefined);
                    }
                    resolve(selectedEntry);
                }));
            });
        }
        _needsRecentTasksMigration() {
            return (this.getRecentlyUsedTasksV1().size > 0) && (this._getTasksFromStorage('historical').size === 0);
        }
        async _migrateRecentTasks(tasks) {
            if (!this._needsRecentTasksMigration()) {
                return;
            }
            const recentlyUsedTasks = this.getRecentlyUsedTasksV1();
            const taskMap = Object.create(null);
            tasks.forEach(task => {
                const key = task.getRecentlyUsedKey();
                if (key) {
                    taskMap[key] = task;
                }
            });
            const reversed = [...recentlyUsedTasks.keys()].reverse();
            for (const key in reversed) {
                const task = taskMap[key];
                if (task) {
                    await this._setRecentlyUsedTask(task);
                }
            }
            this._storageService.remove(AbstractTaskService_1.RecentlyUsedTasks_Key, 1 /* StorageScope.WORKSPACE */);
        }
        _showIgnoredFoldersMessage() {
            if (this.ignoredWorkspaceFolders.length === 0 || !this.showIgnoreMessage) {
                return Promise.resolve(undefined);
            }
            this._notificationService.prompt(severity_1.default.Info, nls.localize('TaskService.ignoredFolder', 'The following workspace folders are ignored since they use task version 0.1.0: {0}', this.ignoredWorkspaceFolders.map(f => f.name).join(', ')), [{
                    label: nls.localize('TaskService.notAgain', "Don't Show Again"),
                    isSecondary: true,
                    run: () => {
                        this._storageService.store(AbstractTaskService_1.IgnoreTask010DonotShowAgain_key, true, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
                        this._showIgnoreMessage = false;
                    }
                }]);
            return Promise.resolve(undefined);
        }
        async _trust() {
            if (taskService_1.ServerlessWebContext && !taskService_1.TaskExecutionSupportedContext) {
                return false;
            }
            await this._workspaceTrustManagementService.workspaceTrustInitialized;
            if (!this._workspaceTrustManagementService.isWorkspaceTrusted()) {
                return (await this._workspaceTrustRequestService.requestWorkspaceTrust({
                    message: nls.localize('TaskService.requestTrust', "Listing and running tasks requires that some of the files in this workspace be executed as code.")
                })) === true;
            }
            return true;
        }
        async _runTaskCommand(filter) {
            if (!this._tasksReconnected) {
                return;
            }
            if (!filter) {
                return this._doRunTaskCommand();
            }
            const type = typeof filter === 'string' ? undefined : filter.type;
            const taskName = typeof filter === 'string' ? filter : filter.task;
            const grouped = await this._getGroupedTasks({ type });
            const identifier = this._getTaskIdentifier(filter);
            const tasks = grouped.all();
            const resolver = this._createResolver(grouped);
            const folderURIs = this._contextService.getWorkspace().folders.map(folder => folder.uri);
            if (this._contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
                folderURIs.push(this._contextService.getWorkspace().configuration);
            }
            folderURIs.push(tasks_1.USER_TASKS_GROUP_KEY);
            if (identifier) {
                for (const uri of folderURIs) {
                    const task = await resolver.resolve(uri, identifier);
                    if (task) {
                        this.run(task);
                        return;
                    }
                }
            }
            const exactMatchTask = !taskName ? undefined : tasks.find(t => t.configurationProperties.identifier === taskName || t.getDefinition(true)?.configurationProperties?.identifier === taskName);
            if (!exactMatchTask) {
                return this._doRunTaskCommand(tasks, type, taskName);
            }
            for (const uri of folderURIs) {
                const task = await resolver.resolve(uri, taskName);
                if (task) {
                    await this.run(task, { attachProblemMatcher: true }, 1 /* TaskRunSource.User */);
                    return;
                }
            }
        }
        _tasksAndGroupedTasks(filter) {
            if (!this._versionAndEngineCompatible(filter)) {
                return { tasks: Promise.resolve([]), grouped: Promise.resolve(new TaskMap()) };
            }
            const grouped = this._getGroupedTasks(filter);
            const tasks = grouped.then((map) => {
                if (!filter || !filter.type) {
                    return map.all();
                }
                const result = [];
                map.forEach((tasks) => {
                    for (const task of tasks) {
                        if (tasks_1.ContributedTask.is(task) && task.defines.type === filter.type) {
                            result.push(task);
                        }
                        else if (tasks_1.CustomTask.is(task)) {
                            if (task.type === filter.type) {
                                result.push(task);
                            }
                            else {
                                const customizes = task.customizes();
                                if (customizes && customizes.type === filter.type) {
                                    result.push(task);
                                }
                            }
                        }
                    }
                });
                return result;
            });
            return { tasks, grouped };
        }
        _doRunTaskCommand(tasks, type, name) {
            const pickThen = (task) => {
                if (task === undefined) {
                    return;
                }
                if (task === null) {
                    this._runConfigureTasks();
                }
                else {
                    this.run(task, { attachProblemMatcher: true }, 1 /* TaskRunSource.User */).then(undefined, reason => {
                        // eat the error, it has already been surfaced to the user and we don't care about it here
                    });
                }
            };
            const placeholder = nls.localize('TaskService.pickRunTask', 'Select the task to run');
            this._showIgnoredFoldersMessage().then(() => {
                if (this._configurationService.getValue(USE_SLOW_PICKER)) {
                    let taskResult = undefined;
                    if (!tasks) {
                        taskResult = this._tasksAndGroupedTasks();
                    }
                    this._showQuickPick(tasks ? tasks : taskResult.tasks, placeholder, {
                        label: '$(plus) ' + nls.localize('TaskService.noEntryToRun', 'Configure a Task'),
                        task: null
                    }, true, undefined, undefined, undefined, name).
                        then((entry) => {
                        return pickThen(entry ? entry.task : undefined);
                    });
                }
                else {
                    this._showTwoLevelQuickPick(placeholder, {
                        label: '$(plus) ' + nls.localize('TaskService.noEntryToRun', 'Configure a Task'),
                        task: null
                    }, type, name).
                        then(pickThen);
                }
            });
        }
        _reRunTaskCommand() {
            problemMatcher_1.ProblemMatcherRegistry.onReady().then(() => {
                return this._editorService.saveAll({ reason: 2 /* SaveReason.AUTO */ }).then(() => {
                    const executeResult = this._getTaskSystem().rerun();
                    if (executeResult) {
                        return this._handleExecuteResult(executeResult);
                    }
                    else {
                        return Promise.resolve(undefined);
                    }
                });
            });
        }
        /**
         *
         * @param tasks - The tasks which need to be filtered
         * @param tasksInList - This tells splitPerGroupType to filter out globbed tasks (into defaults)
         * @returns
         */
        _getDefaultTasks(tasks, taskGlobsInList = false) {
            const defaults = [];
            for (const task of tasks) {
                // At this point (assuming taskGlobsInList is true) there are tasks with matching globs, so only put those in defaults
                if (taskGlobsInList && typeof task.configurationProperties.group.isDefault === 'string') {
                    defaults.push(task);
                }
                else if (!taskGlobsInList && task.configurationProperties.group.isDefault === true) {
                    defaults.push(task);
                }
            }
            return defaults;
        }
        _runTaskGroupCommand(taskGroup, strings, configure, legacyCommand) {
            if (this.schemaVersion === 1 /* JsonSchemaVersion.V0_1_0 */) {
                legacyCommand();
                return;
            }
            const options = {
                location: 10 /* ProgressLocation.Window */,
                title: strings.fetching
            };
            const promise = (async () => {
                let groupTasks = [];
                async function runSingleTask(task, problemMatcherOptions, that) {
                    that.run(task, problemMatcherOptions, 1 /* TaskRunSource.User */).then(undefined, reason => {
                        // eat the error, it has already been surfaced to the user and we don't care about it here
                    });
                }
                const chooseAndRunTask = (tasks) => {
                    this._showIgnoredFoldersMessage().then(() => {
                        this._showQuickPick(tasks, strings.select, {
                            label: strings.notFoundConfigure,
                            task: null
                        }, true).then((entry) => {
                            const task = entry ? entry.task : undefined;
                            if (task === undefined) {
                                return;
                            }
                            if (task === null) {
                                configure.apply(this);
                                return;
                            }
                            runSingleTask(task, { attachProblemMatcher: true }, this);
                        });
                    });
                };
                let globTasksDetected = false;
                // First check for globs before checking for the default tasks of the task group
                const absoluteURI = editor_1.EditorResourceAccessor.getOriginalUri(this._editorService.activeEditor);
                if (absoluteURI) {
                    const workspaceFolder = this._contextService.getWorkspaceFolder(absoluteURI);
                    if (workspaceFolder) {
                        const configuredTasks = this._getConfiguration(workspaceFolder)?.config?.tasks;
                        if (configuredTasks) {
                            globTasksDetected = configuredTasks.filter(task => task.group && typeof task.group !== 'string' && typeof task.group.isDefault === 'string').length > 0;
                            // This will activate extensions, so only do so if necessary #185960
                            if (globTasksDetected) {
                                // Fallback to absolute path of the file if it is not in a workspace or relative path cannot be found
                                const relativePath = workspaceFolder?.uri ? (resources.relativePath(workspaceFolder.uri, absoluteURI) ?? absoluteURI.path) : absoluteURI.path;
                                groupTasks = await this._findWorkspaceTasks((task) => {
                                    const currentTaskGroup = task.configurationProperties.group;
                                    if (currentTaskGroup && typeof currentTaskGroup !== 'string' && typeof currentTaskGroup.isDefault === 'string') {
                                        return (currentTaskGroup._id === taskGroup._id && glob.match(currentTaskGroup.isDefault, relativePath));
                                    }
                                    return false;
                                });
                            }
                        }
                    }
                }
                if (!globTasksDetected && groupTasks.length === 0) {
                    groupTasks = await this._findWorkspaceTasksInGroup(taskGroup, true);
                }
                const handleMultipleTasks = (areGlobTasks) => {
                    return this._getTasksForGroup(taskGroup).then((tasks) => {
                        if (tasks.length > 0) {
                            // If we're dealing with tasks that were chosen because of a glob match,
                            // then put globs in the defaults and everything else in none
                            const defaults = this._getDefaultTasks(tasks, areGlobTasks);
                            if (defaults.length === 1) {
                                runSingleTask(defaults[0], undefined, this);
                                return;
                            }
                            else if (defaults.length > 0) {
                                tasks = defaults;
                            }
                        }
                        // At this this point there are multiple tasks.
                        chooseAndRunTask(tasks);
                    });
                };
                const resolveTaskAndRun = (taskGroupTask) => {
                    if (tasks_1.ConfiguringTask.is(taskGroupTask)) {
                        this.tryResolveTask(taskGroupTask).then(resolvedTask => {
                            runSingleTask(resolvedTask, undefined, this);
                        });
                    }
                    else {
                        runSingleTask(taskGroupTask, undefined, this);
                    }
                };
                // A single default glob task was returned, just run it directly
                if (groupTasks.length === 1) {
                    return resolveTaskAndRun(groupTasks[0]);
                }
                // If there's multiple globs that match we want to show the quick picker for those tasks
                // We will need to call splitPerGroupType putting globs in defaults and the remaining tasks in none.
                // We don't need to carry on after here
                if (globTasksDetected && groupTasks.length > 1) {
                    return handleMultipleTasks(true);
                }
                // If no globs are found or matched fallback to checking for default tasks of the task group
                if (!groupTasks.length) {
                    groupTasks = await this._findWorkspaceTasksInGroup(taskGroup, false);
                }
                // A single default task was returned, just run it directly
                if (groupTasks.length === 1) {
                    return resolveTaskAndRun(groupTasks[0]);
                }
                // Multiple default tasks returned, show the quickPicker
                return handleMultipleTasks(false);
            })();
            this._progressService.withProgress(options, () => promise);
        }
        _runBuildCommand() {
            if (!this._tasksReconnected) {
                return;
            }
            return this._runTaskGroupCommand(tasks_1.TaskGroup.Build, {
                fetching: nls.localize('TaskService.fetchingBuildTasks', 'Fetching build tasks...'),
                select: nls.localize('TaskService.pickBuildTask', 'Select the build task to run'),
                notFoundConfigure: nls.localize('TaskService.noBuildTask', 'No build task to run found. Configure Build Task...')
            }, this._runConfigureDefaultBuildTask, this._build);
        }
        _runTestCommand() {
            return this._runTaskGroupCommand(tasks_1.TaskGroup.Test, {
                fetching: nls.localize('TaskService.fetchingTestTasks', 'Fetching test tasks...'),
                select: nls.localize('TaskService.pickTestTask', 'Select the test task to run'),
                notFoundConfigure: nls.localize('TaskService.noTestTaskTerminal', 'No test task to run found. Configure Tasks...')
            }, this._runConfigureDefaultTestTask, this._runTest);
        }
        _runTerminateCommand(arg) {
            if (arg === 'terminateAll') {
                this._terminateAll();
                return;
            }
            const runQuickPick = (promise) => {
                this._showQuickPick(promise || this.getActiveTasks(), nls.localize('TaskService.taskToTerminate', 'Select a task to terminate'), {
                    label: nls.localize('TaskService.noTaskRunning', 'No task is currently running'),
                    task: undefined
                }, false, true, undefined, [{
                        label: nls.localize('TaskService.terminateAllRunningTasks', 'All Running Tasks'),
                        id: 'terminateAll',
                        task: undefined
                    }]).then(entry => {
                    if (entry && entry.id === 'terminateAll') {
                        this._terminateAll();
                    }
                    const task = entry ? entry.task : undefined;
                    if (task === undefined || task === null) {
                        return;
                    }
                    this.terminate(task);
                });
            };
            if (this.inTerminal()) {
                const identifier = this._getTaskIdentifier(arg);
                let promise;
                if (identifier !== undefined) {
                    promise = this.getActiveTasks();
                    promise.then((tasks) => {
                        for (const task of tasks) {
                            if (task.matches(identifier)) {
                                this.terminate(task);
                                return;
                            }
                        }
                        runQuickPick(promise);
                    });
                }
                else {
                    runQuickPick();
                }
            }
            else {
                this._isActive().then((active) => {
                    if (active) {
                        this._terminateAll().then((responses) => {
                            // the output runner has only one task
                            const response = responses[0];
                            if (response.success) {
                                return;
                            }
                            if (response.code && response.code === 3 /* TerminateResponseCode.ProcessNotFound */) {
                                this._notificationService.error(nls.localize('TerminateAction.noProcess', 'The launched process doesn\'t exist anymore. If the task spawned background tasks exiting VS Code might result in orphaned processes.'));
                            }
                            else {
                                this._notificationService.error(nls.localize('TerminateAction.failed', 'Failed to terminate running task'));
                            }
                        });
                    }
                });
            }
        }
        async _runRestartTaskCommand(arg) {
            const activeTasks = await this.getActiveTasks();
            if (activeTasks.length === 1) {
                this._restart(activeTasks[0]);
                return;
            }
            if (this.inTerminal()) {
                // try dispatching using task identifier
                const identifier = this._getTaskIdentifier(arg);
                if (identifier !== undefined) {
                    for (const task of activeTasks) {
                        if (task.matches(identifier)) {
                            this._restart(task);
                            return;
                        }
                    }
                }
                // show quick pick with active tasks
                const entry = await this._showQuickPick(activeTasks, nls.localize('TaskService.taskToRestart', 'Select the task to restart'), {
                    label: nls.localize('TaskService.noTaskToRestart', 'No task to restart'),
                    task: null
                }, false, true);
                if (entry && entry.task) {
                    this._restart(entry.task);
                }
            }
            else {
                if (activeTasks.length > 0) {
                    this._restart(activeTasks[0]);
                }
            }
        }
        _getTaskIdentifier(filter) {
            let result = undefined;
            if (Types.isString(filter)) {
                result = filter;
            }
            else if (filter && Types.isString(filter.type)) {
                result = tasks_1.TaskDefinition.createTaskIdentifier(filter, console);
            }
            return result;
        }
        _configHasTasks(taskConfig) {
            return !!taskConfig && !!taskConfig.tasks && taskConfig.tasks.length > 0;
        }
        _openTaskFile(resource, taskSource) {
            let configFileCreated = false;
            this._fileService.stat(resource).then((stat) => stat, () => undefined).then(async (stat) => {
                const fileExists = !!stat;
                const configValue = this._configurationService.inspect('tasks');
                let tasksExistInFile;
                let target;
                switch (taskSource) {
                    case tasks_1.TaskSourceKind.User:
                        tasksExistInFile = this._configHasTasks(configValue.userValue);
                        target = 2 /* ConfigurationTarget.USER */;
                        break;
                    case tasks_1.TaskSourceKind.WorkspaceFile:
                        tasksExistInFile = this._configHasTasks(configValue.workspaceValue);
                        target = 5 /* ConfigurationTarget.WORKSPACE */;
                        break;
                    default:
                        tasksExistInFile = this._configHasTasks(configValue.workspaceFolderValue);
                        target = 6 /* ConfigurationTarget.WORKSPACE_FOLDER */;
                }
                let content;
                if (!tasksExistInFile) {
                    const pickTemplateResult = await this._quickInputService.pick((0, taskTemplates_1.getTemplates)(), { placeHolder: nls.localize('TaskService.template', 'Select a Task Template') });
                    if (!pickTemplateResult) {
                        return Promise.resolve(undefined);
                    }
                    content = pickTemplateResult.content;
                    const editorConfig = this._configurationService.getValue();
                    if (editorConfig.editor.insertSpaces) {
                        content = content.replace(/(\n)(\t+)/g, (_, s1, s2) => s1 + ' '.repeat(s2.length * editorConfig.editor.tabSize));
                    }
                    configFileCreated = true;
                }
                if (!fileExists && content) {
                    return this._textFileService.create([{ resource, value: content }]).then(result => {
                        return result[0].resource;
                    });
                }
                else if (fileExists && (tasksExistInFile || content)) {
                    if (content) {
                        this._configurationService.updateValue('tasks', json.parse(content), target);
                    }
                    return stat?.resource;
                }
                return undefined;
            }).then((resource) => {
                if (!resource) {
                    return;
                }
                this._editorService.openEditor({
                    resource,
                    options: {
                        pinned: configFileCreated // pin only if config file is created #8727
                    }
                });
            });
        }
        _isTaskEntry(value) {
            const candidate = value;
            return candidate && !!candidate.task;
        }
        _isSettingEntry(value) {
            const candidate = value;
            return candidate && !!candidate.settingType;
        }
        _configureTask(task) {
            if (tasks_1.ContributedTask.is(task)) {
                this.customize(task, undefined, true);
            }
            else if (tasks_1.CustomTask.is(task)) {
                this.openConfig(task);
            }
            else if (tasks_1.ConfiguringTask.is(task)) {
                // Do nothing.
            }
        }
        _handleSelection(selection) {
            if (!selection) {
                return;
            }
            if (this._isTaskEntry(selection)) {
                this._configureTask(selection.task);
            }
            else if (this._isSettingEntry(selection)) {
                const taskQuickPick = this._instantiationService.createInstance(taskQuickPick_1.TaskQuickPick);
                taskQuickPick.handleSettingOption(selection.settingType);
            }
            else if (selection.folder && (this._contextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */)) {
                this._openTaskFile(selection.folder.toResource('.vscode/tasks.json'), tasks_1.TaskSourceKind.Workspace);
            }
            else {
                const resource = this._getResourceForKind(tasks_1.TaskSourceKind.User);
                if (resource) {
                    this._openTaskFile(resource, tasks_1.TaskSourceKind.User);
                }
            }
        }
        getTaskDescription(task) {
            let description;
            if (task._source.kind === tasks_1.TaskSourceKind.User) {
                description = nls.localize('taskQuickPick.userSettings', 'User');
            }
            else if (task._source.kind === tasks_1.TaskSourceKind.WorkspaceFile) {
                description = task.getWorkspaceFileName();
            }
            else if (this.needsFolderQualification()) {
                const workspaceFolder = task.getWorkspaceFolder();
                if (workspaceFolder) {
                    description = workspaceFolder.name;
                }
            }
            return description;
        }
        async _runConfigureTasks() {
            if (!(await this._trust())) {
                return;
            }
            let taskPromise;
            if (this.schemaVersion === 2 /* JsonSchemaVersion.V2_0_0 */) {
                taskPromise = this._getGroupedTasks();
            }
            else {
                taskPromise = Promise.resolve(new TaskMap());
            }
            const stats = this._contextService.getWorkspace().folders.map((folder) => {
                return this._fileService.stat(folder.toResource('.vscode/tasks.json')).then(stat => stat, () => undefined);
            });
            const createLabel = nls.localize('TaskService.createJsonFile', 'Create tasks.json file from template');
            const openLabel = nls.localize('TaskService.openJsonFile', 'Open tasks.json file');
            const tokenSource = new cancellation_1.CancellationTokenSource();
            const cancellationToken = tokenSource.token;
            const entries = Promise.all(stats).then((stats) => {
                return taskPromise.then((taskMap) => {
                    const entries = [];
                    let configuredCount = 0;
                    let tasks = taskMap.all();
                    if (tasks.length > 0) {
                        tasks = tasks.sort((a, b) => a._label.localeCompare(b._label));
                        for (const task of tasks) {
                            const entry = { label: taskQuickPick_1.TaskQuickPick.getTaskLabelWithIcon(task), task, description: this.getTaskDescription(task), detail: this._showDetail() ? task.configurationProperties.detail : undefined };
                            taskQuickPick_1.TaskQuickPick.applyColorStyles(task, entry, this._themeService);
                            entries.push(entry);
                            if (!tasks_1.ContributedTask.is(task)) {
                                configuredCount++;
                            }
                        }
                    }
                    const needsCreateOrOpen = (configuredCount === 0);
                    // If the only configured tasks are user tasks, then we should also show the option to create from a template.
                    if (needsCreateOrOpen || (taskMap.get(tasks_1.USER_TASKS_GROUP_KEY).length === configuredCount)) {
                        const label = stats[0] !== undefined ? openLabel : createLabel;
                        if (entries.length) {
                            entries.push({ type: 'separator' });
                        }
                        entries.push({ label, folder: this._contextService.getWorkspace().folders[0] });
                    }
                    if ((entries.length === 1) && !needsCreateOrOpen) {
                        tokenSource.cancel();
                    }
                    return entries;
                });
            });
            const timeout = await Promise.race([new Promise((resolve) => {
                    entries.then(() => resolve(false));
                }), new Promise((resolve) => {
                    const timer = setTimeout(() => {
                        clearTimeout(timer);
                        resolve(true);
                    }, 200);
                })]);
            if (!timeout && ((await entries).length === 1) && this._configurationService.getValue(taskQuickPick_1.QUICKOPEN_SKIP_CONFIG)) {
                const entry = ((await entries)[0]);
                if (entry.task) {
                    this._handleSelection(entry);
                    return;
                }
            }
            const entriesWithSettings = entries.then(resolvedEntries => {
                resolvedEntries.push(...taskQuickPick_1.TaskQuickPick.allSettingEntries(this._configurationService));
                return resolvedEntries;
            });
            this._quickInputService.pick(entriesWithSettings, { placeHolder: nls.localize('TaskService.pickTask', 'Select a task to configure') }, cancellationToken).
                then(async (selection) => {
                if (cancellationToken.isCancellationRequested) {
                    // canceled when there's only one task
                    const task = (await entries)[0];
                    if (task.task) {
                        selection = task;
                    }
                }
                this._handleSelection(selection);
            });
        }
        _runConfigureDefaultBuildTask() {
            if (this.schemaVersion === 2 /* JsonSchemaVersion.V2_0_0 */) {
                this.tasks().then((tasks => {
                    if (tasks.length === 0) {
                        this._runConfigureTasks();
                        return;
                    }
                    const entries = [];
                    let selectedTask;
                    let selectedEntry;
                    this._showIgnoredFoldersMessage().then(() => {
                        for (const task of tasks) {
                            const taskGroup = tasks_1.TaskGroup.from(task.configurationProperties.group);
                            if (taskGroup && taskGroup.isDefault && taskGroup._id === tasks_1.TaskGroup.Build._id) {
                                const label = nls.localize('TaskService.defaultBuildTaskExists', '{0} is already marked as the default build task', taskQuickPick_1.TaskQuickPick.getTaskLabelWithIcon(task, task.getQualifiedLabel()));
                                selectedTask = task;
                                selectedEntry = { label, task, description: this.getTaskDescription(task), detail: this._showDetail() ? task.configurationProperties.detail : undefined };
                                taskQuickPick_1.TaskQuickPick.applyColorStyles(task, selectedEntry, this._themeService);
                            }
                            else {
                                const entry = { label: taskQuickPick_1.TaskQuickPick.getTaskLabelWithIcon(task), task, description: this.getTaskDescription(task), detail: this._showDetail() ? task.configurationProperties.detail : undefined };
                                taskQuickPick_1.TaskQuickPick.applyColorStyles(task, entry, this._themeService);
                                entries.push(entry);
                            }
                        }
                        if (selectedEntry) {
                            entries.unshift(selectedEntry);
                        }
                        const tokenSource = new cancellation_1.CancellationTokenSource();
                        const cancellationToken = tokenSource.token;
                        this._quickInputService.pick(entries, { placeHolder: nls.localize('TaskService.pickTask', 'Select a task to configure') }, cancellationToken).
                            then(async (entry) => {
                            if (cancellationToken.isCancellationRequested) {
                                // canceled when there's only one task
                                const task = (await entries)[0];
                                if (task.task) {
                                    entry = task;
                                }
                            }
                            const task = entry && 'task' in entry ? entry.task : undefined;
                            if ((task === undefined) || (task === null)) {
                                return;
                            }
                            if (task === selectedTask && tasks_1.CustomTask.is(task)) {
                                this.openConfig(task);
                            }
                            if (!tasks_1.InMemoryTask.is(task)) {
                                this.customize(task, { group: { kind: 'build', isDefault: true } }, true).then(() => {
                                    if (selectedTask && (task !== selectedTask) && !tasks_1.InMemoryTask.is(selectedTask)) {
                                        this.customize(selectedTask, { group: 'build' }, false);
                                    }
                                });
                            }
                        });
                        this._quickInputService.pick(entries, {
                            placeHolder: nls.localize('TaskService.pickDefaultBuildTask', 'Select the task to be used as the default build task')
                        }).
                            then((entry) => {
                            const task = entry && 'task' in entry ? entry.task : undefined;
                            if ((task === undefined) || (task === null)) {
                                return;
                            }
                            if (task === selectedTask && tasks_1.CustomTask.is(task)) {
                                this.openConfig(task);
                            }
                            if (!tasks_1.InMemoryTask.is(task)) {
                                this.customize(task, { group: { kind: 'build', isDefault: true } }, true).then(() => {
                                    if (selectedTask && (task !== selectedTask) && !tasks_1.InMemoryTask.is(selectedTask)) {
                                        this.customize(selectedTask, { group: 'build' }, false);
                                    }
                                });
                            }
                        });
                    });
                }));
            }
            else {
                this._runConfigureTasks();
            }
        }
        _runConfigureDefaultTestTask() {
            if (this.schemaVersion === 2 /* JsonSchemaVersion.V2_0_0 */) {
                this.tasks().then((tasks => {
                    if (tasks.length === 0) {
                        this._runConfigureTasks();
                        return;
                    }
                    let selectedTask;
                    let selectedEntry;
                    for (const task of tasks) {
                        const taskGroup = tasks_1.TaskGroup.from(task.configurationProperties.group);
                        if (taskGroup && taskGroup.isDefault && taskGroup._id === tasks_1.TaskGroup.Test._id) {
                            selectedTask = task;
                            break;
                        }
                    }
                    if (selectedTask) {
                        selectedEntry = {
                            label: nls.localize('TaskService.defaultTestTaskExists', '{0} is already marked as the default test task.', selectedTask.getQualifiedLabel()),
                            task: selectedTask,
                            detail: this._showDetail() ? selectedTask.configurationProperties.detail : undefined
                        };
                    }
                    this._showIgnoredFoldersMessage().then(() => {
                        this._showQuickPick(tasks, nls.localize('TaskService.pickDefaultTestTask', 'Select the task to be used as the default test task'), undefined, true, false, selectedEntry).then((entry) => {
                            const task = entry ? entry.task : undefined;
                            if (!task) {
                                return;
                            }
                            if (task === selectedTask && tasks_1.CustomTask.is(task)) {
                                this.openConfig(task);
                            }
                            if (!tasks_1.InMemoryTask.is(task)) {
                                this.customize(task, { group: { kind: 'test', isDefault: true } }, true).then(() => {
                                    if (selectedTask && (task !== selectedTask) && !tasks_1.InMemoryTask.is(selectedTask)) {
                                        this.customize(selectedTask, { group: 'test' }, false);
                                    }
                                });
                            }
                        });
                    });
                }));
            }
            else {
                this._runConfigureTasks();
            }
        }
        async runShowTasks() {
            const activeTasksPromise = this.getActiveTasks();
            const activeTasks = await activeTasksPromise;
            let group;
            if (activeTasks.length === 1) {
                this._taskSystem.revealTask(activeTasks[0]);
            }
            else if (activeTasks.length && activeTasks.every((task) => {
                if (tasks_1.InMemoryTask.is(task)) {
                    return false;
                }
                if (!group) {
                    group = task.command.presentation?.group;
                }
                return task.command.presentation?.group && (task.command.presentation.group === group);
            })) {
                this._taskSystem.revealTask(activeTasks[0]);
            }
            else {
                this._showQuickPick(activeTasksPromise, nls.localize('TaskService.pickShowTask', 'Select the task to show its output'), {
                    label: nls.localize('TaskService.noTaskIsRunning', 'No task is running'),
                    task: null
                }, false, true).then((entry) => {
                    const task = entry ? entry.task : undefined;
                    if (task === undefined || task === null) {
                        return;
                    }
                    this._taskSystem.revealTask(task);
                });
            }
        }
        async _createTasksDotOld(folder) {
            const tasksFile = folder.toResource('.vscode/tasks.json');
            if (await this._fileService.exists(tasksFile)) {
                const oldFile = tasksFile.with({ path: `${tasksFile.path}.old` });
                await this._fileService.copy(tasksFile, oldFile, true);
                return [oldFile, tasksFile];
            }
            return undefined;
        }
        _upgradeTask(task, suppressTaskName, globalConfig) {
            if (!tasks_1.CustomTask.is(task)) {
                return;
            }
            const configElement = {
                label: task._label
            };
            const oldTaskTypes = new Set(['gulp', 'jake', 'grunt']);
            if (Types.isString(task.command.name) && oldTaskTypes.has(task.command.name)) {
                configElement.type = task.command.name;
                configElement.task = task.command.args[0];
            }
            else {
                if (task.command.runtime === tasks_1.RuntimeType.Shell) {
                    configElement.type = tasks_1.RuntimeType.toString(tasks_1.RuntimeType.Shell);
                }
                if (task.command.name && !suppressTaskName && !globalConfig.windows?.command && !globalConfig.osx?.command && !globalConfig.linux?.command) {
                    configElement.command = task.command.name;
                }
                else if (suppressTaskName) {
                    configElement.command = task._source.config.element.command;
                }
                if (task.command.args && (!Array.isArray(task.command.args) || (task.command.args.length > 0))) {
                    if (!globalConfig.windows?.args && !globalConfig.osx?.args && !globalConfig.linux?.args) {
                        configElement.args = task.command.args;
                    }
                    else {
                        configElement.args = task._source.config.element.args;
                    }
                }
            }
            if (task.configurationProperties.presentation) {
                configElement.presentation = task.configurationProperties.presentation;
            }
            if (task.configurationProperties.isBackground) {
                configElement.isBackground = task.configurationProperties.isBackground;
            }
            if (task.configurationProperties.problemMatchers) {
                configElement.problemMatcher = task._source.config.element.problemMatcher;
            }
            if (task.configurationProperties.group) {
                configElement.group = task.configurationProperties.group;
            }
            task._source.config.element = configElement;
            const tempTask = new tasks_1.CustomTask(task._id, task._source, task._label, task.type, task.command, task.hasDefinedMatchers, task.runOptions, task.configurationProperties);
            const configTask = this._createCustomizableTask(tempTask);
            if (configTask) {
                return configTask;
            }
            return;
        }
        async _upgrade() {
            if (this.schemaVersion === 2 /* JsonSchemaVersion.V2_0_0 */) {
                return;
            }
            if (!this._workspaceTrustManagementService.isWorkspaceTrusted()) {
                this._register(event_1.Event.once(this._workspaceTrustManagementService.onDidChangeTrust)(isTrusted => {
                    if (isTrusted) {
                        this._upgrade();
                    }
                }));
                return;
            }
            const tasks = await this._getGroupedTasks();
            const fileDiffs = [];
            for (const folder of this.workspaceFolders) {
                const diff = await this._createTasksDotOld(folder);
                if (diff) {
                    fileDiffs.push(diff);
                }
                if (!diff) {
                    continue;
                }
                const configTasks = [];
                const suppressTaskName = !!this._configurationService.getValue("tasks.suppressTaskName" /* TasksSchemaProperties.SuppressTaskName */, { resource: folder.uri });
                const globalConfig = {
                    windows: this._configurationService.getValue("tasks.windows" /* TasksSchemaProperties.Windows */, { resource: folder.uri }),
                    osx: this._configurationService.getValue("tasks.osx" /* TasksSchemaProperties.Osx */, { resource: folder.uri }),
                    linux: this._configurationService.getValue("tasks.linux" /* TasksSchemaProperties.Linux */, { resource: folder.uri })
                };
                tasks.get(folder).forEach(task => {
                    const configTask = this._upgradeTask(task, suppressTaskName, globalConfig);
                    if (configTask) {
                        configTasks.push(configTask);
                    }
                });
                this._taskSystem = undefined;
                this._workspaceTasksPromise = undefined;
                await this._writeConfiguration(folder, 'tasks.tasks', configTasks);
                await this._writeConfiguration(folder, 'tasks.version', '2.0.0');
                if (this._configurationService.getValue("tasks.showOutput" /* TasksSchemaProperties.ShowOutput */, { resource: folder.uri })) {
                    await this._configurationService.updateValue("tasks.showOutput" /* TasksSchemaProperties.ShowOutput */, undefined, { resource: folder.uri });
                }
                if (this._configurationService.getValue("tasks.isShellCommand" /* TasksSchemaProperties.IsShellCommand */, { resource: folder.uri })) {
                    await this._configurationService.updateValue("tasks.isShellCommand" /* TasksSchemaProperties.IsShellCommand */, undefined, { resource: folder.uri });
                }
                if (this._configurationService.getValue("tasks.suppressTaskName" /* TasksSchemaProperties.SuppressTaskName */, { resource: folder.uri })) {
                    await this._configurationService.updateValue("tasks.suppressTaskName" /* TasksSchemaProperties.SuppressTaskName */, undefined, { resource: folder.uri });
                }
            }
            this._updateSetup();
            this._notificationService.prompt(severity_1.default.Warning, fileDiffs.length === 1 ?
                nls.localize('taskService.upgradeVersion', "The deprecated tasks version 0.1.0 has been removed. Your tasks have been upgraded to version 2.0.0. Open the diff to review the upgrade.")
                : nls.localize('taskService.upgradeVersionPlural', "The deprecated tasks version 0.1.0 has been removed. Your tasks have been upgraded to version 2.0.0. Open the diffs to review the upgrade."), [{
                    label: fileDiffs.length === 1 ? nls.localize('taskService.openDiff', "Open diff") : nls.localize('taskService.openDiffs', "Open diffs"),
                    run: async () => {
                        for (const upgrade of fileDiffs) {
                            await this._editorService.openEditor({
                                original: { resource: upgrade[0] },
                                modified: { resource: upgrade[1] }
                            });
                        }
                    }
                }]);
        }
    };
    exports.AbstractTaskService = AbstractTaskService;
    exports.AbstractTaskService = AbstractTaskService = AbstractTaskService_1 = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, markers_1.IMarkerService),
        __param(2, output_1.IOutputService),
        __param(3, panecomposite_1.IPaneCompositePartService),
        __param(4, views_1.IViewsService),
        __param(5, commands_1.ICommandService),
        __param(6, editorService_1.IEditorService),
        __param(7, files_1.IFileService),
        __param(8, workspace_1.IWorkspaceContextService),
        __param(9, telemetry_1.ITelemetryService),
        __param(10, textfiles_1.ITextFileService),
        __param(11, model_1.IModelService),
        __param(12, extensions_1.IExtensionService),
        __param(13, quickInput_1.IQuickInputService),
        __param(14, configurationResolver_1.IConfigurationResolverService),
        __param(15, terminal_1.ITerminalService),
        __param(16, terminal_1.ITerminalGroupService),
        __param(17, storage_1.IStorageService),
        __param(18, progress_1.IProgressService),
        __param(19, opener_1.IOpenerService),
        __param(20, dialogs_1.IDialogService),
        __param(21, notification_1.INotificationService),
        __param(22, contextkey_1.IContextKeyService),
        __param(23, environmentService_1.IWorkbenchEnvironmentService),
        __param(24, terminal_2.ITerminalProfileResolverService),
        __param(25, pathService_1.IPathService),
        __param(26, resolverService_1.ITextModelService),
        __param(27, preferences_1.IPreferencesService),
        __param(28, views_1.IViewDescriptorService),
        __param(29, workspaceTrust_1.IWorkspaceTrustRequestService),
        __param(30, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(31, log_1.ILogService),
        __param(32, themeService_1.IThemeService),
        __param(33, lifecycle_2.ILifecycleService),
        __param(34, remoteAgentService_1.IRemoteAgentService),
        __param(35, instantiation_1.IInstantiationService)
    ], AbstractTaskService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJzdHJhY3RUYXNrU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rhc2tzL2Jyb3dzZXIvYWJzdHJhY3RUYXNrU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBbUZoRyxNQUFNLDhCQUE4QixHQUFHLHdCQUF3QixDQUFDO0lBQ2hFLE1BQU0sNEJBQTRCLEdBQUcsa0NBQWtDLENBQUM7SUFDeEUsTUFBTSxlQUFlLEdBQUcsd0JBQXdCLENBQUM7SUFFakQsSUFBaUIsbUJBQW1CLENBR25DO0lBSEQsV0FBaUIsbUJBQW1CO1FBQ3RCLHNCQUFFLEdBQUcsNENBQTRDLENBQUM7UUFDbEQsd0JBQUksR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLGlDQUFpQyxFQUFFLGdCQUFnQixDQUFDLENBQUM7SUFDdkYsQ0FBQyxFQUhnQixtQkFBbUIsbUNBQW5CLG1CQUFtQixRQUduQztJQUlELE1BQU0sZUFBZTtRQUlwQixZQUFvQixjQUE4QjtZQUE5QixtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7WUFDakQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksMEJBQWdCLEVBQUUsQ0FBQztRQUNqRCxDQUFDO1FBRU0sSUFBSSxDQUFDLE9BQWU7WUFDMUIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssK0JBQXVCLENBQUM7WUFDcEQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFFTSxJQUFJLENBQUMsT0FBZTtZQUMxQixJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxrQ0FBMEIsQ0FBQztZQUN2RCxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUVN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