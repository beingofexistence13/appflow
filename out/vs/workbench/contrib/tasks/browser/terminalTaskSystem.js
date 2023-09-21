/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/event", "vs/base/common/extpath", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/objects", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/severity", "vs/base/common/types", "vs/nls", "vs/platform/markers/common/markers", "vs/workbench/contrib/markers/common/markers", "vs/workbench/contrib/tasks/common/problemMatcher", "vs/base/common/codicons", "vs/base/common/network", "vs/base/common/themables", "vs/base/common/uri", "vs/platform/terminal/common/terminalStrings", "vs/workbench/contrib/tasks/browser/taskTerminalStatus", "vs/workbench/contrib/tasks/common/problemCollectors", "vs/workbench/contrib/tasks/common/taskConfiguration", "vs/workbench/contrib/tasks/common/taskSystem", "vs/workbench/contrib/tasks/common/tasks", "vs/workbench/contrib/terminal/browser/terminalEscapeSequences", "vs/workbench/contrib/terminal/browser/terminalProcessExtHostProxy", "vs/workbench/contrib/terminal/common/terminal"], function (require, exports, arrays_1, Async, event_1, extpath_1, lifecycle_1, map_1, Objects, path, Platform, resources, severity_1, Types, nls, markers_1, markers_2, problemMatcher_1, codicons_1, network_1, themables_1, uri_1, terminalStrings_1, taskTerminalStatus_1, problemCollectors_1, taskConfiguration_1, taskSystem_1, tasks_1, terminalEscapeSequences_1, terminalProcessExtHostProxy_1, terminal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalTaskSystem = void 0;
    const ReconnectionType = 'Task';
    class VariableResolver {
        static { this._regex = /\$\{(.*?)\}/g; }
        constructor(workspaceFolder, taskSystemInfo, values, _service) {
            this.workspaceFolder = workspaceFolder;
            this.taskSystemInfo = taskSystemInfo;
            this.values = values;
            this._service = _service;
        }
        async resolve(value) {
            const replacers = [];
            value.replace(VariableResolver._regex, (match, ...args) => {
                replacers.push(this._replacer(match, args));
                return match;
            });
            const resolvedReplacers = await Promise.all(replacers);
            return value.replace(VariableResolver._regex, () => resolvedReplacers.shift());
        }
        async _replacer(match, args) {
            // Strip out the ${} because the map contains them variables without those characters.
            const result = this.values.get(match.substring(2, match.length - 1));
            if ((result !== undefined) && (result !== null)) {
                return result;
            }
            if (this._service) {
                return this._service.resolveAsync(this.workspaceFolder, match);
            }
            return match;
        }
    }
    class VerifiedTask {
        constructor(task, resolver, trigger) {
            this.task = task;
            this.resolver = resolver;
            this.trigger = trigger;
        }
        verify() {
            let verified = false;
            if (this.trigger && this.resolvedVariables && this.workspaceFolder && (this.shellLaunchConfig !== undefined)) {
                verified = true;
            }
            return verified;
        }
        getVerifiedTask() {
            if (this.verify()) {
                return { task: this.task, resolver: this.resolver, trigger: this.trigger, resolvedVariables: this.resolvedVariables, systemInfo: this.systemInfo, workspaceFolder: this.workspaceFolder, shellLaunchConfig: this.shellLaunchConfig };
            }
            else {
                throw new Error('VerifiedTask was not checked. verify must be checked before getVerifiedTask.');
            }
        }
    }
    class TerminalTaskSystem extends lifecycle_1.Disposable {
        static { this.TelemetryEventName = 'taskService'; }
        static { this.ProcessVarName = '__process__'; }
        static { this._shellQuotes = {
            'cmd': {
                strong: '"'
            },
            'powershell': {
                escape: {
                    escapeChar: '`',
                    charsToEscape: ' "\'()'
                },
                strong: '\'',
                weak: '"'
            },
            'bash': {
                escape: {
                    escapeChar: '\\',
                    charsToEscape: ' "\''
                },
                strong: '\'',
                weak: '"'
            },
            'zsh': {
                escape: {
                    escapeChar: '\\',
                    charsToEscape: ' "\''
                },
                strong: '\'',
                weak: '"'
            }
        }; }
        static { this._osShellQuotes = {
            'Linux': TerminalTaskSystem._shellQuotes['bash'],
            'Mac': TerminalTaskSystem._shellQuotes['bash'],
            'Windows': TerminalTaskSystem._shellQuotes['powershell']
        }; }
        taskShellIntegrationStartSequence(cwd) {
            return ((0, terminalEscapeSequences_1.VSCodeSequence)("A" /* VSCodeOscPt.PromptStart */) +
                (0, terminalEscapeSequences_1.VSCodeSequence)("P" /* VSCodeOscPt.Property */, `${"Task" /* VSCodeOscProperty.Task */}=True`) +
                (cwd
                    ? (0, terminalEscapeSequences_1.VSCodeSequence)("P" /* VSCodeOscPt.Property */, `${"Cwd" /* VSCodeOscProperty.Cwd */}=${typeof cwd === 'string' ? cwd : cwd.fsPath}`)
                    : '') +
                (0, terminalEscapeSequences_1.VSCodeSequence)("B" /* VSCodeOscPt.CommandStart */));
        }
        get taskShellIntegrationOutputSequence() {
            return (0, terminalEscapeSequences_1.VSCodeSequence)("C" /* VSCodeOscPt.CommandExecuted */);
        }
        constructor(_terminalService, _terminalGroupService, _outputService, _paneCompositeService, _viewsService, _markerService, _modelService, _configurationResolverService, _contextService, _environmentService, _outputChannelId, _fileService, _terminalProfileResolverService, _pathService, _viewDescriptorService, _logService, _notificationService, instantiationService, taskSystemInfoResolver) {
            super();
            this._terminalService = _terminalService;
            this._terminalGroupService = _terminalGroupService;
            this._outputService = _outputService;
            this._paneCompositeService = _paneCompositeService;
            this._viewsService = _viewsService;
            this._markerService = _markerService;
            this._modelService = _modelService;
            this._configurationResolverService = _configurationResolverService;
            this._contextService = _contextService;
            this._environmentService = _environmentService;
            this._outputChannelId = _outputChannelId;
            this._fileService = _fileService;
            this._terminalProfileResolverService = _terminalProfileResolverService;
            this._pathService = _pathService;
            this._viewDescriptorService = _viewDescriptorService;
            this._logService = _logService;
            this._notificationService = _notificationService;
            this._isRerun = false;
            this._terminalCreationQueue = Promise.resolve();
            this._hasReconnected = false;
            this._activeTasks = Object.create(null);
            this._busyTasks = Object.create(null);
            this._terminals = Object.create(null);
            this._idleTaskTerminals = new map_1.LinkedMap();
            this._sameTaskTerminals = Object.create(null);
            this._onDidStateChange = new event_1.Emitter();
            this._taskSystemInfoResolver = taskSystemInfoResolver;
            this._register(this._terminalStatusManager = instantiationService.createInstance(taskTerminalStatus_1.TaskTerminalStatus));
        }
        get onDidStateChange() {
            return this._onDidStateChange.event;
        }
        _log(value) {
            this._appendOutput(value + '\n');
        }
        _showOutput() {
            this._outputService.showChannel(this._outputChannelId, true);
        }
        reconnect(task, resolver) {
            this._reconnectToTerminals();
            return this.run(task, resolver, taskSystem_1.Triggers.reconnect);
        }
        run(task, resolver, trigger = taskSystem_1.Triggers.command) {
            task = task.clone(); // A small amount of task state is stored in the task (instance) and tasks passed in to run may have that set already.
            const instances = tasks_1.InMemoryTask.is(task) || this._isTaskEmpty(task) ? [] : this._getInstances(task);
            const validInstance = instances.length < ((task.runOptions && task.runOptions.instanceLimit) ?? 1);
            const instance = instances[0]?.count?.count ?? 0;
            this._currentTask = new VerifiedTask(task, resolver, trigger);
            if (instance > 0) {
                task.instance = instance;
            }
            if (!validInstance) {
                const terminalData = instances[instances.length - 1];
                this._lastTask = this._currentTask;
                return { kind: 2 /* TaskExecuteKind.Active */, task: terminalData.task, active: { same: true, background: task.configurationProperties.isBackground }, promise: terminalData.promise };
            }
            try {
                const executeResult = { kind: 1 /* TaskExecuteKind.Started */, task, started: {}, promise: this._executeTask(task, resolver, trigger, new Set(), new Map(), undefined) };
                executeResult.promise.then(summary => {
                    this._lastTask = this._currentTask;
                });
                return executeResult;
            }
            catch (error) {
                if (error instanceof taskSystem_1.TaskError) {
                    throw error;
                }
                else if (error instanceof Error) {
                    this._log(error.message);
                    throw new taskSystem_1.TaskError(severity_1.default.Error, error.message, 7 /* TaskErrors.UnknownError */);
                }
                else {
                    this._log(error.toString());
                    throw new taskSystem_1.TaskError(severity_1.default.Error, nls.localize('TerminalTaskSystem.unknownError', 'A unknown error has occurred while executing a task. See task output log for details.'), 7 /* TaskErrors.UnknownError */);
                }
            }
        }
        rerun() {
            if (this._lastTask && this._lastTask.verify()) {
                if ((this._lastTask.task.runOptions.reevaluateOnRerun !== undefined) && !this._lastTask.task.runOptions.reevaluateOnRerun) {
                    this._isRerun = true;
                }
                const result = this.run(this._lastTask.task, this._lastTask.resolver);
                result.promise.then(summary => {
                    this._isRerun = false;
                });
                return result;
            }
            else {
                return undefined;
            }
        }
        _showTaskLoadErrors(task) {
            if (task.taskLoadMessages && task.taskLoadMessages.length > 0) {
                task.taskLoadMessages.forEach(loadMessage => {
                    this._log(loadMessage + '\n');
                });
                const openOutput = 'Show Output';
                this._notificationService.prompt(severity_1.default.Warning, nls.localize('TerminalTaskSystem.taskLoadReporting', "There are issues with task \"{0}\". See the output for more details.", task._label), [{
                        label: openOutput,
                        run: () => this._showOutput()
                    }]);
            }
        }
        isTaskVisible(task) {
            const terminalData = this._activeTasks[task.getMapKey()];
            if (!terminalData?.terminal) {
                return false;
            }
            const activeTerminalInstance = this._terminalService.activeInstance;
            const isPanelShowingTerminal = !!this._viewsService.getActiveViewWithId(terminal_1.TERMINAL_VIEW_ID);
            return isPanelShowingTerminal && (activeTerminalInstance?.instanceId === terminalData.terminal.instanceId);
        }
        revealTask(task) {
            const terminalData = this._activeTasks[task.getMapKey()];
            if (!terminalData?.terminal) {
                return false;
            }
            const isTerminalInPanel = this._viewDescriptorService.getViewLocationById(terminal_1.TERMINAL_VIEW_ID) === 1 /* ViewContainerLocation.Panel */;
            if (isTerminalInPanel && this.isTaskVisible(task)) {
                if (this._previousPanelId) {
                    if (this._previousTerminalInstance) {
                        this._terminalService.setActiveInstance(this._previousTerminalInstance);
                    }
                    this._paneCompositeService.openPaneComposite(this._previousPanelId, 1 /* ViewContainerLocation.Panel */);
                }
                else {
                    this._paneCompositeService.hideActivePaneComposite(1 /* ViewContainerLocation.Panel */);
                }
                this._previousPanelId = undefined;
                this._previousTerminalInstance = undefined;
            }
            else {
                if (isTerminalInPanel) {
                    this._previousPanelId = this._paneCompositeService.getActivePaneComposite(1 /* ViewContainerLocation.Panel */)?.getId();
                    if (this._previousPanelId === terminal_1.TERMINAL_VIEW_ID) {
                        this._previousTerminalInstance = this._terminalService.activeInstance ?? undefined;
                    }
                }
                this._terminalService.setActiveInstance(terminalData.terminal);
                if (tasks_1.CustomTask.is(task) || tasks_1.ContributedTask.is(task)) {
                    this._terminalGroupService.showPanel(task.command.presentation.focus);
                }
            }
            return true;
        }
        isActive() {
            return Promise.resolve(this.isActiveSync());
        }
        isActiveSync() {
            return Object.values(this._activeTasks).some(value => !!value.terminal);
        }
        canAutoTerminate() {
            return Object.values(this._activeTasks).every(value => !value.task.configurationProperties.promptOnClose);
        }
        getActiveTasks() {
            return Object.values(this._activeTasks).flatMap(value => value.terminal ? value.task : []);
        }
        getLastInstance(task) {
            const recentKey = task.getRecentlyUsedKey();
            return Object.values(this._activeTasks).reverse().find((value) => recentKey && recentKey === value.task.getRecentlyUsedKey())?.task;
        }
        getBusyTasks() {
            return Object.keys(this._busyTasks).map(key => this._busyTasks[key]);
        }
        customExecutionComplete(task, result) {
            const activeTerminal = this._activeTasks[task.getMapKey()];
            if (!activeTerminal?.terminal) {
                return Promise.reject(new Error('Expected to have a terminal for a custom execution task'));
            }
            return new Promise((resolve) => {
                // activeTerminal.terminal.rendererExit(result);
                resolve();
            });
        }
        _getInstances(task) {
            const recentKey = task.getRecentlyUsedKey();
            return Object.values(this._activeTasks).filter((value) => recentKey && recentKey === value.task.getRecentlyUsedKey());
        }
        _removeFromActiveTasks(task) {
            const key = typeof task === 'string' ? task : task.getMapKey();
            const taskToRemove = this._activeTasks[key];
            if (!taskToRemove) {
                return;
            }
            delete this._activeTasks[key];
        }
        _fireTaskEvent(event) {
            if (event.kind !== "changed" /* TaskEventKind.Changed */) {
                const activeTask = this._activeTasks[event.__task.getMapKey()];
                if (activeTask) {
                    activeTask.state = event.kind;
                }
            }
            this._onDidStateChange.fire(event);
        }
        terminate(task) {
            const activeTerminal = this._activeTasks[task.getMapKey()];
            const terminal = activeTerminal.terminal;
            if (!terminal) {
                return Promise.resolve({ success: false, task: undefined });
            }
            return new Promise((resolve, reject) => {
                terminal.onDisposed(terminal => {
                    this._fireTaskEvent(tasks_1.TaskEvent.terminated(task, terminal.instanceId, terminal.exitReason));
                });
                const onExit = terminal.onExit(() => {
                    const task = activeTerminal.task;
                    try {
                        onExit.dispose();
                        this._fireTaskEvent(tasks_1.TaskEvent.terminated(task, terminal.instanceId, terminal.exitReason));
                    }
                    catch (error) {
                        // Do nothing.
                    }
                    resolve({ success: true, task: task });
                });
                terminal.dispose();
            });
        }
        terminateAll() {
            const promises = [];
            for (const [key, terminalData] of Object.entries(this._activeTasks)) {
                const terminal = terminalData.terminal;
                if (terminal) {
                    promises.push(new Promise((resolve, reject) => {
                        const onExit = terminal.onExit(() => {
                            const task = terminalData.task;
                            try {
                                onExit.dispose();
                                this._fireTaskEvent(tasks_1.TaskEvent.terminated(task, terminal.instanceId, terminal.exitReason));
                            }
                            catch (error) {
                                // Do nothing.
                            }
                            if (this._activeTasks[key] === terminalData) {
                                delete this._activeTasks[key];
                            }
                            resolve({ success: true, task: terminalData.task });
                        });
                    }));
                    terminal.dispose();
                }
            }
            return Promise.all(promises);
        }
        _showDependencyCycleMessage(task) {
            this._log(nls.localize('dependencyCycle', 'There is a dependency cycle. See task "{0}".', task._label));
            this._showOutput();
        }
        _executeTask(task, resolver, trigger, liveDependencies, encounteredTasks, alreadyResolved) {
            this._showTaskLoadErrors(task);
            const mapKey = task.getMapKey();
            // It's important that we add this task's entry to _activeTasks before
            // any of the code in the then runs (see #180541 and #180578). Wrapping
            // it in Promise.resolve().then() ensures that.
            const promise = Promise.resolve().then(async () => {
                alreadyResolved = alreadyResolved ?? new Map();
                const promises = [];
                if (task.configurationProperties.dependsOn) {
                    const nextLiveDependencies = new Set(liveDependencies).add(task.getCommonTaskId());
                    for (const dependency of task.configurationProperties.dependsOn) {
                        const dependencyTask = await resolver.resolve(dependency.uri, dependency.task);
                        if (dependencyTask) {
                            this._adoptConfigurationForDependencyTask(dependencyTask, task);
                            let taskResult;
                            const commonKey = dependencyTask.getCommonTaskId();
                            if (nextLiveDependencies.has(commonKey)) {
                                this._showDependencyCycleMessage(dependencyTask);
                                taskResult = Promise.resolve({});
                            }
                            else {
                                taskResult = encounteredTasks.get(commonKey);
                                if (!taskResult) {
                                    const activeTask = this._activeTasks[dependencyTask.getMapKey()] ?? this._getInstances(dependencyTask).pop();
                                    taskResult = activeTask && this._getDependencyPromise(activeTask);
                                }
                            }
                            if (!taskResult) {
                                this._fireTaskEvent(tasks_1.TaskEvent.general("dependsOnStarted" /* TaskEventKind.DependsOnStarted */, task));
                                taskResult = this._executeDependencyTask(dependencyTask, resolver, trigger, nextLiveDependencies, encounteredTasks, alreadyResolved);
                            }
                            encounteredTasks.set(commonKey, taskResult);
                            promises.push(taskResult);
                            if (task.configurationProperties.dependsOrder === "sequence" /* DependsOrder.sequence */) {
                                const promiseResult = await taskResult;
                                if (promiseResult.exitCode !== 0) {
                                    break;
                                }
                            }
                        }
                        else {
                            this._log(nls.localize('dependencyFailed', 'Couldn\'t resolve dependent task \'{0}\' in workspace folder \'{1}\'', Types.isString(dependency.task) ? dependency.task : JSON.stringify(dependency.task, undefined, 0), dependency.uri.toString()));
                            this._showOutput();
                        }
                    }
                }
                return Promise.all(promises).then((summaries) => {
                    for (const summary of summaries) {
                        if (summary.exitCode !== 0) {
                            return { exitCode: summary.exitCode };
                        }
                    }
                    if ((tasks_1.ContributedTask.is(task) || tasks_1.CustomTask.is(task)) && (task.command)) {
                        if (this._isRerun) {
                            return this._reexecuteCommand(task, trigger, alreadyResolved);
                        }
                        else {
                            return this._executeCommand(task, trigger, alreadyResolved);
                        }
                    }
                    return { exitCode: 0 };
                });
            }).finally(() => {
                if (this._activeTasks[mapKey] === activeTask) {
                    delete this._activeTasks[mapKey];
                }
            });
            const lastInstance = this._getInstances(task).pop();
            const count = lastInstance?.count ?? { count: 0 };
            count.count++;
            const activeTask = { task, promise, count };
            this._activeTasks[mapKey] = activeTask;
            return promise;
        }
        _createInactiveDependencyPromise(task) {
            return new Promise(resolve => {
                const taskInactiveDisposable = this.onDidStateChange(taskEvent => {
                    if ((taskEvent.kind === "inactive" /* TaskEventKind.Inactive */) && (taskEvent.__task === task)) {
                        taskInactiveDisposable.dispose();
                        resolve({ exitCode: 0 });
                    }
                });
            });
        }
        _adoptConfigurationForDependencyTask(dependencyTask, task) {
            if (dependencyTask.configurationProperties.icon) {
                dependencyTask.configurationProperties.icon.id ||= task.configurationProperties.icon?.id;
                dependencyTask.configurationProperties.icon.color ||= task.configurationProperties.icon?.color;
            }
            else {
                dependencyTask.configurationProperties.icon = task.configurationProperties.icon;
            }
            if (dependencyTask.configurationProperties.hide) {
                dependencyTask.configurationProperties.hide ||= task.configurationProperties.hide;
            }
            else {
                dependencyTask.configurationProperties.hide = task.configurationProperties.hide;
            }
        }
        async _getDependencyPromise(task) {
            if (!task.task.configurationProperties.isBackground) {
                return task.promise;
            }
            if (!task.task.configurationProperties.problemMatchers || task.task.configurationProperties.problemMatchers.length === 0) {
                return task.promise;
            }
            if (task.state === "inactive" /* TaskEventKind.Inactive */) {
                return { exitCode: 0 };
            }
            return this._createInactiveDependencyPromise(task.task);
        }
        async _executeDependencyTask(task, resolver, trigger, liveDependencies, encounteredTasks, alreadyResolved) {
            // If the task is a background task with a watching problem matcher, we don't wait for the whole task to finish,
            // just for the problem matcher to go inactive.
            if (!task.configurationProperties.isBackground) {
                return this._executeTask(task, resolver, trigger, liveDependencies, encounteredTasks, alreadyResolved);
            }
            const inactivePromise = this._createInactiveDependencyPromise(task);
            return Promise.race([inactivePromise, this._executeTask(task, resolver, trigger, liveDependencies, encounteredTasks, alreadyResolved)]);
        }
        async _resolveAndFindExecutable(systemInfo, workspaceFolder, task, cwd, envPath) {
            const command = await this._configurationResolverService.resolveAsync(workspaceFolder, tasks_1.CommandString.value(task.command.name));
            cwd = cwd ? await this._configurationResolverService.resolveAsync(workspaceFolder, cwd) : undefined;
            const paths = envPath ? await Promise.all(envPath.split(path.delimiter).map(p => this._configurationResolverService.resolveAsync(workspaceFolder, p))) : undefined;
            let foundExecutable = await systemInfo?.findExecutable(command, cwd, paths);
            if (!foundExecutable) {
                foundExecutable = path.join(cwd ?? '', command);
            }
            return foundExecutable;
        }
        _findUnresolvedVariables(variables, alreadyResolved) {
            if (alreadyResolved.size === 0) {
                return variables;
            }
            const unresolved = new Set();
            for (const variable of variables) {
                if (!alreadyResolved.has(variable.substring(2, variable.length - 1))) {
                    unresolved.add(variable);
                }
            }
            return unresolved;
        }
        _mergeMaps(mergeInto, mergeFrom) {
            for (const entry of mergeFrom) {
                if (!mergeInto.has(entry[0])) {
                    mergeInto.set(entry[0], entry[1]);
                }
            }
        }
        async _acquireInput(taskSystemInfo, workspaceFolder, task, variables, alreadyResolved) {
            const resolved = await this._resolveVariablesFromSet(taskSystemInfo, workspaceFolder, task, variables, alreadyResolved);
            this._fireTaskEvent(tasks_1.TaskEvent.general("acquiredInput" /* TaskEventKind.AcquiredInput */, task));
            return resolved;
        }
        _resolveVariablesFromSet(taskSystemInfo, workspaceFolder, task, variables, alreadyResolved) {
            const isProcess = task.command && task.command.runtime === tasks_1.RuntimeType.Process;
            const options = task.command && task.command.options ? task.command.options : undefined;
            const cwd = options ? options.cwd : undefined;
            let envPath = undefined;
            if (options && options.env) {
                for (const key of Object.keys(options.env)) {
                    if (key.toLowerCase() === 'path') {
                        if (Types.isString(options.env[key])) {
                            envPath = options.env[key];
                        }
                        break;
                    }
                }
            }
            const unresolved = this._findUnresolvedVariables(variables, alreadyResolved);
            let resolvedVariables;
            if (taskSystemInfo && workspaceFolder) {
                const resolveSet = {
                    variables: unresolved
                };
                if (taskSystemInfo.platform === 3 /* Platform.Platform.Windows */ && isProcess) {
                    resolveSet.process = { name: tasks_1.CommandString.value(task.command.name) };
                    if (cwd) {
                        resolveSet.process.cwd = cwd;
                    }
                    if (envPath) {
                        resolveSet.process.path = envPath;
                    }
                }
                resolvedVariables = taskSystemInfo.resolveVariables(workspaceFolder, resolveSet, tasks_1.TaskSourceKind.toConfigurationTarget(task._source.kind)).then(async (resolved) => {
                    if (!resolved) {
                        return undefined;
                    }
                    this._mergeMaps(alreadyResolved, resolved.variables);
                    resolved.variables = new Map(alreadyResolved);
                    if (isProcess) {
                        let process = tasks_1.CommandString.value(task.command.name);
                        if (taskSystemInfo.platform === 3 /* Platform.Platform.Windows */) {
                            process = await this._resolveAndFindExecutable(taskSystemInfo, workspaceFolder, task, cwd, envPath);
                        }
                        resolved.variables.set(TerminalTaskSystem.ProcessVarName, process);
                    }
                    return resolved;
                });
                return resolvedVariables;
            }
            else {
                const variablesArray = new Array();
                unresolved.forEach(variable => variablesArray.push(variable));
                return new Promise((resolve, reject) => {
                    this._configurationResolverService.resolveWithInteraction(workspaceFolder, variablesArray, 'tasks', undefined, tasks_1.TaskSourceKind.toConfigurationTarget(task._source.kind)).then(async (resolvedVariablesMap) => {
                        if (resolvedVariablesMap) {
                            this._mergeMaps(alreadyResolved, resolvedVariablesMap);
                            resolvedVariablesMap = new Map(alreadyResolved);
                            if (isProcess) {
                                let processVarValue;
                                if (Platform.isWindows) {
                                    processVarValue = await this._resolveAndFindExecutable(taskSystemInfo, workspaceFolder, task, cwd, envPath);
                                }
                                else {
                                    processVarValue = await this._configurationResolverService.resolveAsync(workspaceFolder, tasks_1.CommandString.value(task.command.name));
                                }
                                resolvedVariablesMap.set(TerminalTaskSystem.ProcessVarName, processVarValue);
                            }
                            const resolvedVariablesResult = {
                                variables: resolvedVariablesMap,
                            };
                            resolve(resolvedVariablesResult);
                        }
                        else {
                            resolve(undefined);
                        }
                    }, reason => {
                        reject(reason);
                    });
                });
            }
        }
        _executeCommand(task, trigger, alreadyResolved) {
            const taskWorkspaceFolder = task.getWorkspaceFolder();
            let workspaceFolder;
            if (taskWorkspaceFolder) {
                workspaceFolder = this._currentTask.workspaceFolder = taskWorkspaceFolder;
            }
            else {
                const folders = this._contextService.getWorkspace().folders;
                workspaceFolder = folders.length > 0 ? folders[0] : undefined;
            }
            const systemInfo = this._currentTask.systemInfo = this._taskSystemInfoResolver(workspaceFolder);
            const variables = new Set();
            this._collectTaskVariables(variables, task);
            const resolvedVariables = this._acquireInput(systemInfo, workspaceFolder, task, variables, alreadyResolved);
            return resolvedVariables.then((resolvedVariables) => {
                if (resolvedVariables && !this._isTaskEmpty(task)) {
                    this._currentTask.resolvedVariables = resolvedVariables;
                    return this._executeInTerminal(task, trigger, new VariableResolver(workspaceFolder, systemInfo, resolvedVariables.variables, this._configurationResolverService), workspaceFolder);
                }
                else {
                    // Allows the taskExecutions array to be updated in the extension host
                    this._fireTaskEvent(tasks_1.TaskEvent.general("end" /* TaskEventKind.End */, task));
                    return Promise.resolve({ exitCode: 0 });
                }
            }, reason => {
                return Promise.reject(reason);
            });
        }
        _isTaskEmpty(task) {
            const isCustomExecution = (task.command.runtime === tasks_1.RuntimeType.CustomExecution);
            return !((task.command !== undefined) && task.command.runtime && (isCustomExecution || (task.command.name !== undefined)));
        }
        _reexecuteCommand(task, trigger, alreadyResolved) {
            const lastTask = this._lastTask;
            if (!lastTask) {
                return Promise.reject(new Error('No task previously run'));
            }
            const workspaceFolder = this._currentTask.workspaceFolder = lastTask.workspaceFolder;
            const variables = new Set();
            this._collectTaskVariables(variables, task);
            // Check that the task hasn't changed to include new variables
            let hasAllVariables = true;
            variables.forEach(value => {
                if (value.substring(2, value.length - 1) in lastTask.getVerifiedTask().resolvedVariables) {
                    hasAllVariables = false;
                }
            });
            if (!hasAllVariables) {
                return this._acquireInput(lastTask.getVerifiedTask().systemInfo, lastTask.getVerifiedTask().workspaceFolder, task, variables, alreadyResolved).then((resolvedVariables) => {
                    if (!resolvedVariables) {
                        // Allows the taskExecutions array to be updated in the extension host
                        this._fireTaskEvent(tasks_1.TaskEvent.general("end" /* TaskEventKind.End */, task));
                        return { exitCode: 0 };
                    }
                    this._currentTask.resolvedVariables = resolvedVariables;
                    return this._executeInTerminal(task, trigger, new VariableResolver(lastTask.getVerifiedTask().workspaceFolder, lastTask.getVerifiedTask().systemInfo, resolvedVariables.variables, this._configurationResolverService), workspaceFolder);
                }, reason => {
                    return Promise.reject(reason);
                });
            }
            else {
                this._currentTask.resolvedVariables = lastTask.getVerifiedTask().resolvedVariables;
                return this._executeInTerminal(task, trigger, new VariableResolver(lastTask.getVerifiedTask().workspaceFolder, lastTask.getVerifiedTask().systemInfo, lastTask.getVerifiedTask().resolvedVariables.variables, this._configurationResolverService), workspaceFolder);
            }
        }
        async _executeInTerminal(task, trigger, resolver, workspaceFolder) {
            let terminal = undefined;
            let error = undefined;
            let promise = undefined;
            if (task.configurationProperties.isBackground) {
                const problemMatchers = await this._resolveMatchers(resolver, task.configurationProperties.problemMatchers);
                const watchingProblemMatcher = new problemCollectors_1.WatchingProblemCollector(problemMatchers, this._markerService, this._modelService, this._fileService);
                if ((problemMatchers.length > 0) && !watchingProblemMatcher.isWatching()) {
                    this._appendOutput(nls.localize('TerminalTaskSystem.nonWatchingMatcher', 'Task {0} is a background task but uses a problem matcher without a background pattern', task._label));
                    this._showOutput();
                }
                const toDispose = new lifecycle_1.DisposableStore();
                let eventCounter = 0;
                const mapKey = task.getMapKey();
                toDispose.add(watchingProblemMatcher.onDidStateChange((event) => {
                    if (event.kind === "backgroundProcessingBegins" /* ProblemCollectorEventKind.BackgroundProcessingBegins */) {
                        eventCounter++;
                        this._busyTasks[mapKey] = task;
                        this._fireTaskEvent(tasks_1.TaskEvent.general("active" /* TaskEventKind.Active */, task, terminal?.instanceId));
                    }
                    else if (event.kind === "backgroundProcessingEnds" /* ProblemCollectorEventKind.BackgroundProcessingEnds */) {
                        eventCounter--;
                        if (this._busyTasks[mapKey]) {
                            delete this._busyTasks[mapKey];
                        }
                        this._fireTaskEvent(tasks_1.TaskEvent.general("inactive" /* TaskEventKind.Inactive */, task, terminal?.instanceId));
                        if (eventCounter === 0) {
                            if ((watchingProblemMatcher.numberOfMatches > 0) && watchingProblemMatcher.maxMarkerSeverity &&
                                (watchingProblemMatcher.maxMarkerSeverity >= markers_1.MarkerSeverity.Error)) {
                                const reveal = task.command.presentation.reveal;
                                const revealProblems = task.command.presentation.revealProblems;
                                if (revealProblems === tasks_1.RevealProblemKind.OnProblem) {
                                    this._viewsService.openView(markers_2.Markers.MARKERS_VIEW_ID, true);
                                }
                                else if (reveal === tasks_1.RevealKind.Silent) {
                                    this._terminalService.setActiveInstance(terminal);
                                    this._terminalGroupService.showPanel(false);
                                }
                            }
                        }
                    }
                }));
                watchingProblemMatcher.aboutToStart();
                let delayer = undefined;
                [terminal, error] = await this._createTerminal(task, resolver, workspaceFolder);
                if (error) {
                    return Promise.reject(new Error(error.message));
                }
                if (!terminal) {
                    return Promise.reject(new Error(`Failed to create terminal for task ${task._label}`));
                }
                this._terminalStatusManager.addTerminal(task, terminal, watchingProblemMatcher);
                let processStartedSignaled = false;
                terminal.processReady.then(() => {
                    if (!processStartedSignaled) {
                        this._fireTaskEvent(tasks_1.TaskEvent.processStarted(task, terminal.instanceId, terminal.processId));
                        processStartedSignaled = true;
                    }
                }, (_error) => {
                    this._logService.error('Task terminal process never got ready');
                });
                this._fireTaskEvent(tasks_1.TaskEvent.start(task, terminal.instanceId, resolver.values));
                let onData;
                if (problemMatchers.length) {
                    // prevent https://github.com/microsoft/vscode/issues/174511 from happening
                    onData = terminal.onLineData((line) => {
                        watchingProblemMatcher.processLine(line);
                        if (!delayer) {
                            delayer = new Async.Delayer(3000);
                        }
                        delayer.trigger(() => {
                            watchingProblemMatcher.forceDelivery();
                            delayer = undefined;
                        });
                    });
                }
                promise = new Promise((resolve, reject) => {
                    const onExit = terminal.onExit((terminalLaunchResult) => {
                        const exitCode = typeof terminalLaunchResult === 'number' ? terminalLaunchResult : terminalLaunchResult?.code;
                        onData?.dispose();
                        onExit.dispose();
                        const key = task.getMapKey();
                        if (this._busyTasks[mapKey]) {
                            delete this._busyTasks[mapKey];
                        }
                        this._removeFromActiveTasks(task);
                        this._fireTaskEvent(tasks_1.TaskEvent.changed());
                        if (terminalLaunchResult !== undefined) {
                            // Only keep a reference to the terminal if it is not being disposed.
                            switch (task.command.presentation.panel) {
                                case tasks_1.PanelKind.Dedicated:
                                    this._sameTaskTerminals[key] = terminal.instanceId.toString();
                                    break;
                                case tasks_1.PanelKind.Shared:
                                    this._idleTaskTerminals.set(key, terminal.instanceId.toString(), 1 /* Touch.AsOld */);
                                    break;
                            }
                        }
                        const reveal = task.command.presentation.reveal;
                        if ((reveal === tasks_1.RevealKind.Silent) && ((exitCode !== 0) || (watchingProblemMatcher.numberOfMatches > 0) && watchingProblemMatcher.maxMarkerSeverity &&
                            (watchingProblemMatcher.maxMarkerSeverity >= markers_1.MarkerSeverity.Error))) {
                            try {
                                this._terminalService.setActiveInstance(terminal);
                                this._terminalGroupService.showPanel(false);
                            }
                            catch (e) {
                                // If the terminal has already been disposed, then setting the active instance will fail. #99828
                                // There is nothing else to do here.
                            }
                        }
                        watchingProblemMatcher.done();
                        watchingProblemMatcher.dispose();
                        if (!processStartedSignaled) {
                            this._fireTaskEvent(tasks_1.TaskEvent.processStarted(task, terminal.instanceId, terminal.processId));
                            processStartedSignaled = true;
                        }
                        this._fireTaskEvent(tasks_1.TaskEvent.processEnded(task, terminal.instanceId, exitCode));
                        for (let i = 0; i < eventCounter; i++) {
                            this._fireTaskEvent(tasks_1.TaskEvent.general("inactive" /* TaskEventKind.Inactive */, task, terminal.instanceId));
                        }
                        eventCounter = 0;
                        this._fireTaskEvent(tasks_1.TaskEvent.general("end" /* TaskEventKind.End */, task));
                        toDispose.dispose();
                        resolve({ exitCode: exitCode ?? undefined });
                    });
                });
                if (trigger === taskSystem_1.Triggers.reconnect && !!terminal.xterm) {
                    const bufferLines = [];
                    const bufferReverseIterator = terminal.xterm.getBufferReverseIterator();
                    const startRegex = new RegExp(watchingProblemMatcher.beginPatterns.map(pattern => pattern.source).join('|'));
                    for (const nextLine of bufferReverseIterator) {
                        bufferLines.push(nextLine);
                        if (startRegex.test(nextLine)) {
                            break;
                        }
                    }
                    let delayer = undefined;
                    for (let i = bufferLines.length - 1; i >= 0; i--) {
                        watchingProblemMatcher.processLine(bufferLines[i]);
                        if (!delayer) {
                            delayer = new Async.Delayer(3000);
                        }
                        delayer.trigger(() => {
                            watchingProblemMatcher.forceDelivery();
                            delayer = undefined;
                        });
                    }
                }
            }
            else {
                [terminal, error] = await this._createTerminal(task, resolver, workspaceFolder);
                if (error) {
                    return Promise.reject(new Error(error.message));
                }
                if (!terminal) {
                    return Promise.reject(new Error(`Failed to create terminal for task ${task._label}`));
                }
                let processStartedSignaled = false;
                terminal.processReady.then(() => {
                    if (!processStartedSignaled) {
                        this._fireTaskEvent(tasks_1.TaskEvent.processStarted(task, terminal.instanceId, terminal.processId));
                        processStartedSignaled = true;
                    }
                }, (_error) => {
                    // The process never got ready. Need to think how to handle this.
                });
                this._fireTaskEvent(tasks_1.TaskEvent.start(task, terminal.instanceId, resolver.values));
                const mapKey = task.getMapKey();
                this._busyTasks[mapKey] = task;
                this._fireTaskEvent(tasks_1.TaskEvent.general("active" /* TaskEventKind.Active */, task, terminal.instanceId));
                const problemMatchers = await this._resolveMatchers(resolver, task.configurationProperties.problemMatchers);
                const startStopProblemMatcher = new problemCollectors_1.StartStopProblemCollector(problemMatchers, this._markerService, this._modelService, 0 /* ProblemHandlingStrategy.Clean */, this._fileService);
                this._terminalStatusManager.addTerminal(task, terminal, startStopProblemMatcher);
                const onData = terminal.onLineData((line) => {
                    startStopProblemMatcher.processLine(line);
                });
                promise = new Promise((resolve, reject) => {
                    const onExit = terminal.onExit((terminalLaunchResult) => {
                        const exitCode = typeof terminalLaunchResult === 'number' ? terminalLaunchResult : terminalLaunchResult?.code;
                        onExit.dispose();
                        const key = task.getMapKey();
                        this._removeFromActiveTasks(task);
                        this._fireTaskEvent(tasks_1.TaskEvent.changed());
                        if (terminalLaunchResult !== undefined) {
                            // Only keep a reference to the terminal if it is not being disposed.
                            switch (task.command.presentation.panel) {
                                case tasks_1.PanelKind.Dedicated:
                                    this._sameTaskTerminals[key] = terminal.instanceId.toString();
                                    break;
                                case tasks_1.PanelKind.Shared:
                                    this._idleTaskTerminals.set(key, terminal.instanceId.toString(), 1 /* Touch.AsOld */);
                                    break;
                            }
                        }
                        const reveal = task.command.presentation.reveal;
                        const revealProblems = task.command.presentation.revealProblems;
                        const revealProblemPanel = terminal && (revealProblems === tasks_1.RevealProblemKind.OnProblem) && (startStopProblemMatcher.numberOfMatches > 0);
                        if (revealProblemPanel) {
                            this._viewsService.openView(markers_2.Markers.MARKERS_VIEW_ID);
                        }
                        else if (terminal && (reveal === tasks_1.RevealKind.Silent) && ((exitCode !== 0) || (startStopProblemMatcher.numberOfMatches > 0) && startStopProblemMatcher.maxMarkerSeverity &&
                            (startStopProblemMatcher.maxMarkerSeverity >= markers_1.MarkerSeverity.Error))) {
                            try {
                                this._terminalService.setActiveInstance(terminal);
                                this._terminalGroupService.showPanel(false);
                            }
                            catch (e) {
                                // If the terminal has already been disposed, then setting the active instance will fail. #99828
                                // There is nothing else to do here.
                            }
                        }
                        // Hack to work around #92868 until terminal is fixed.
                        setTimeout(() => {
                            onData.dispose();
                            startStopProblemMatcher.done();
                            startStopProblemMatcher.dispose();
                        }, 100);
                        if (!processStartedSignaled && terminal) {
                            this._fireTaskEvent(tasks_1.TaskEvent.processStarted(task, terminal.instanceId, terminal.processId));
                            processStartedSignaled = true;
                        }
                        this._fireTaskEvent(tasks_1.TaskEvent.processEnded(task, terminal?.instanceId, exitCode ?? undefined));
                        if (this._busyTasks[mapKey]) {
                            delete this._busyTasks[mapKey];
                        }
                        this._fireTaskEvent(tasks_1.TaskEvent.general("inactive" /* TaskEventKind.Inactive */, task, terminal?.instanceId));
                        this._fireTaskEvent(tasks_1.TaskEvent.general("end" /* TaskEventKind.End */, task, terminal?.instanceId));
                        resolve({ exitCode: exitCode ?? undefined });
                    });
                });
            }
            const showProblemPanel = task.command.presentation && (task.command.presentation.revealProblems === tasks_1.RevealProblemKind.Always);
            if (showProblemPanel) {
                this._viewsService.openView(markers_2.Markers.MARKERS_VIEW_ID);
            }
            else if (task.command.presentation && (task.command.presentation.focus || task.command.presentation.reveal === tasks_1.RevealKind.Always)) {
                this._terminalService.setActiveInstance(terminal);
                this._terminalGroupService.showPanel(task.command.presentation.focus);
            }
            this._activeTasks[task.getMapKey()].terminal = terminal;
            this._fireTaskEvent(tasks_1.TaskEvent.changed());
            return promise;
        }
        _createTerminalName(task) {
            const needsFolderQualification = this._contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */;
            return needsFolderQualification ? task.getQualifiedLabel() : (task.configurationProperties.name || '');
        }
        async _createShellLaunchConfig(task, workspaceFolder, variableResolver, platform, options, command, args, waitOnExit) {
            let shellLaunchConfig;
            const isShellCommand = task.command.runtime === tasks_1.RuntimeType.Shell;
            const needsFolderQualification = this._contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */;
            const terminalName = this._createTerminalName(task);
            const type = ReconnectionType;
            const originalCommand = task.command.name;
            let cwd;
            if (options.cwd) {
                cwd = options.cwd;
                if (!path.isAbsolute(cwd)) {
                    if (workspaceFolder && (workspaceFolder.uri.scheme === network_1.Schemas.file)) {
                        cwd = path.join(workspaceFolder.uri.fsPath, cwd);
                    }
                }
                // This must be normalized to the OS
                cwd = (0, extpath_1.isUNC)(cwd) ? cwd : resources.toLocalResource(uri_1.URI.from({ scheme: network_1.Schemas.file, path: cwd }), this._environmentService.remoteAuthority, this._pathService.defaultUriScheme);
            }
            if (isShellCommand) {
                let os;
                switch (platform) {
                    case 3 /* Platform.Platform.Windows */:
                        os = 1 /* Platform.OperatingSystem.Windows */;
                        break;
                    case 1 /* Platform.Platform.Mac */:
                        os = 2 /* Platform.OperatingSystem.Macintosh */;
                        break;
                    case 2 /* Platform.Platform.Linux */:
                    default:
                        os = 3 /* Platform.OperatingSystem.Linux */;
                        break;
                }
                const defaultProfile = await this._terminalProfileResolverService.getDefaultProfile({
                    allowAutomationShell: true,
                    os,
                    remoteAuthority: this._environmentService.remoteAuthority
                });
                let icon;
                if (task.configurationProperties.icon?.id) {
                    icon = themables_1.ThemeIcon.fromId(task.configurationProperties.icon.id);
                }
                else {
                    const taskGroupKind = task.configurationProperties.group ? taskConfiguration_1.GroupKind.to(task.configurationProperties.group) : undefined;
                    const kindId = typeof taskGroupKind === 'string' ? taskGroupKind : taskGroupKind?.kind;
                    icon = kindId === 'test' ? themables_1.ThemeIcon.fromId(codicons_1.Codicon.beaker.id) : defaultProfile.icon;
                }
                shellLaunchConfig = {
                    name: terminalName,
                    type,
                    executable: defaultProfile.path,
                    args: defaultProfile.args,
                    env: { ...defaultProfile.env },
                    icon,
                    color: task.configurationProperties.icon?.color || undefined,
                    waitOnExit
                };
                let shellSpecified = false;
                const shellOptions = task.command.options && task.command.options.shell;
                if (shellOptions) {
                    if (shellOptions.executable) {
                        // Clear out the args so that we don't end up with mismatched args.
                        if (shellOptions.executable !== shellLaunchConfig.executable) {
                            shellLaunchConfig.args = undefined;
                        }
                        shellLaunchConfig.executable = await this._resolveVariable(variableResolver, shellOptions.executable);
                        shellSpecified = true;
                    }
                    if (shellOptions.args) {
                        shellLaunchConfig.args = await this._resolveVariables(variableResolver, shellOptions.args.slice());
                    }
                }
                if (shellLaunchConfig.args === undefined) {
                    shellLaunchConfig.args = [];
                }
                const shellArgs = Array.isArray(shellLaunchConfig.args) ? shellLaunchConfig.args.slice(0) : [shellLaunchConfig.args];
                const toAdd = [];
                const basename = path.posix.basename((await this._pathService.fileURI(shellLaunchConfig.executable)).path).toLowerCase();
                const commandLine = this._buildShellCommandLine(platform, basename, shellOptions, command, originalCommand, args);
                let windowsShellArgs = false;
                if (platform === 3 /* Platform.Platform.Windows */) {
                    windowsShellArgs = true;
                    // If we don't have a cwd, then the terminal uses the home dir.
                    const userHome = await this._pathService.userHome();
                    if (basename === 'cmd.exe' && ((options.cwd && (0, extpath_1.isUNC)(options.cwd)) || (!options.cwd && (0, extpath_1.isUNC)(userHome.fsPath)))) {
                        return undefined;
                    }
                    if ((basename === 'powershell.exe') || (basename === 'pwsh.exe')) {
                        if (!shellSpecified) {
                            toAdd.push('-Command');
                        }
                    }
                    else if ((basename === 'bash.exe') || (basename === 'zsh.exe')) {
                        windowsShellArgs = false;
                        if (!shellSpecified) {
                            toAdd.push('-c');
                        }
                    }
                    else if (basename === 'wsl.exe') {
                        if (!shellSpecified) {
                            toAdd.push('-e');
                        }
                    }
                    else {
                        if (!shellSpecified) {
                            toAdd.push('/d', '/c');
                        }
                    }
                }
                else {
                    if (!shellSpecified) {
                        // Under Mac remove -l to not start it as a login shell.
                        if (platform === 1 /* Platform.Platform.Mac */) {
                            // Background on -l on osx https://github.com/microsoft/vscode/issues/107563
                            // TODO: Handle by pulling the default terminal profile?
                            // const osxShellArgs = this._configurationService.inspect(TerminalSettingId.ShellArgsMacOs);
                            // if ((osxShellArgs.user === undefined) && (osxShellArgs.userLocal === undefined) && (osxShellArgs.userLocalValue === undefined)
                            // 	&& (osxShellArgs.userRemote === undefined) && (osxShellArgs.userRemoteValue === undefined)
                            // 	&& (osxShellArgs.userValue === undefined) && (osxShellArgs.workspace === undefined)
                            // 	&& (osxShellArgs.workspaceFolder === undefined) && (osxShellArgs.workspaceFolderValue === undefined)
                            // 	&& (osxShellArgs.workspaceValue === undefined)) {
                            // 	const index = shellArgs.indexOf('-l');
                            // 	if (index !== -1) {
                            // 		shellArgs.splice(index, 1);
                            // 	}
                            // }
                        }
                        toAdd.push('-c');
                    }
                }
                const combinedShellArgs = this._addAllArgument(toAdd, shellArgs);
                combinedShellArgs.push(commandLine);
                shellLaunchConfig.args = windowsShellArgs ? combinedShellArgs.join(' ') : combinedShellArgs;
                if (task.command.presentation && task.command.presentation.echo) {
                    if (needsFolderQualification && workspaceFolder) {
                        shellLaunchConfig.initialText = this.taskShellIntegrationStartSequence(cwd) + (0, terminalStrings_1.formatMessageForTerminal)(nls.localize({
                            key: 'task.executingInFolder',
                            comment: ['The workspace folder the task is running in', 'The task command line or label']
                        }, 'Executing task in folder {0}: {1}', workspaceFolder.name, commandLine), { excludeLeadingNewLine: true }) + this.taskShellIntegrationOutputSequence;
                    }
                    else {
                        shellLaunchConfig.initialText = this.taskShellIntegrationStartSequence(cwd) + (0, terminalStrings_1.formatMessageForTerminal)(nls.localize({
                            key: 'task.executing.shellIntegration',
                            comment: ['The task command line or label']
                        }, 'Executing task: {0}', commandLine), { excludeLeadingNewLine: true }) + this.taskShellIntegrationOutputSequence;
                    }
                }
                else {
                    shellLaunchConfig.initialText = {
                        text: this.taskShellIntegrationStartSequence(cwd) + this.taskShellIntegrationOutputSequence,
                        trailingNewLine: false
                    };
                }
            }
            else {
                const commandExecutable = (task.command.runtime !== tasks_1.RuntimeType.CustomExecution) ? tasks_1.CommandString.value(command) : undefined;
                const executable = !isShellCommand
                    ? await this._resolveVariable(variableResolver, await this._resolveVariable(variableResolver, '${' + TerminalTaskSystem.ProcessVarName + '}'))
                    : commandExecutable;
                // When we have a process task there is no need to quote arguments. So we go ahead and take the string value.
                shellLaunchConfig = {
                    name: terminalName,
                    type,
                    icon: task.configurationProperties.icon?.id ? themables_1.ThemeIcon.fromId(task.configurationProperties.icon.id) : undefined,
                    color: task.configurationProperties.icon?.color || undefined,
                    executable: executable,
                    args: args.map(a => Types.isString(a) ? a : a.value),
                    waitOnExit
                };
                if (task.command.presentation && task.command.presentation.echo) {
                    const getArgsToEcho = (args) => {
                        if (!args || args.length === 0) {
                            return '';
                        }
                        if (Types.isString(args)) {
                            return args;
                        }
                        return args.join(' ');
                    };
                    if (needsFolderQualification && workspaceFolder) {
                        shellLaunchConfig.initialText = this.taskShellIntegrationStartSequence(cwd) + (0, terminalStrings_1.formatMessageForTerminal)(nls.localize({
                            key: 'task.executingInFolder',
                            comment: ['The workspace folder the task is running in', 'The task command line or label']
                        }, 'Executing task in folder {0}: {1}', workspaceFolder.name, `${shellLaunchConfig.executable} ${getArgsToEcho(shellLaunchConfig.args)}`), { excludeLeadingNewLine: true }) + this.taskShellIntegrationOutputSequence;
                    }
                    else {
                        shellLaunchConfig.initialText = this.taskShellIntegrationStartSequence(cwd) + (0, terminalStrings_1.formatMessageForTerminal)(nls.localize({
                            key: 'task.executing.shell-integration',
                            comment: ['The task command line or label']
                        }, 'Executing task: {0}', `${shellLaunchConfig.executable} ${getArgsToEcho(shellLaunchConfig.args)}`), { excludeLeadingNewLine: true }) + this.taskShellIntegrationOutputSequence;
                    }
                }
                else {
                    shellLaunchConfig.initialText = {
                        text: this.taskShellIntegrationStartSequence(cwd) + this.taskShellIntegrationOutputSequence,
                        trailingNewLine: false
                    };
                }
            }
            if (cwd) {
                shellLaunchConfig.cwd = cwd;
            }
            if (options.env) {
                if (shellLaunchConfig.env) {
                    shellLaunchConfig.env = { ...shellLaunchConfig.env, ...options.env };
                }
                else {
                    shellLaunchConfig.env = options.env;
                }
            }
            shellLaunchConfig.isFeatureTerminal = true;
            shellLaunchConfig.useShellEnvironment = true;
            return shellLaunchConfig;
        }
        _addAllArgument(shellCommandArgs, configuredShellArgs) {
            const combinedShellArgs = Objects.deepClone(configuredShellArgs);
            shellCommandArgs.forEach(element => {
                const shouldAddShellCommandArg = configuredShellArgs.every((arg, index) => {
                    if ((arg.toLowerCase() === element) && (configuredShellArgs.length > index + 1)) {
                        // We can still add the argument, but only if not all of the following arguments begin with "-".
                        return !configuredShellArgs.slice(index + 1).every(testArg => testArg.startsWith('-'));
                    }
                    else {
                        return arg.toLowerCase() !== element;
                    }
                });
                if (shouldAddShellCommandArg) {
                    combinedShellArgs.push(element);
                }
            });
            return combinedShellArgs;
        }
        async _reconnectToTerminal(task) {
            if (!this._reconnectedTerminals) {
                return;
            }
            for (let i = 0; i < this._reconnectedTerminals.length; i++) {
                const terminal = this._reconnectedTerminals[i];
                if (getReconnectionData(terminal)?.lastTask === task.getCommonTaskId()) {
                    this._reconnectedTerminals.splice(i, 1);
                    return terminal;
                }
            }
            return undefined;
        }
        async _doCreateTerminal(task, group, launchConfigs) {
            const reconnectedTerminal = await this._reconnectToTerminal(task);
            const onDisposed = (terminal) => this._fireTaskEvent(tasks_1.TaskEvent.terminated(task, terminal.instanceId, terminal.exitReason));
            if (reconnectedTerminal) {
                if ('command' in task && task.command.presentation) {
                    reconnectedTerminal.waitOnExit = getWaitOnExitValue(task.command.presentation, task.configurationProperties);
                }
                reconnectedTerminal.onDisposed(onDisposed);
                this._logService.trace('reconnected to task and terminal', task._id);
                return reconnectedTerminal;
            }
            if (group) {
                // Try to find an existing terminal to split.
                // Even if an existing terminal is found, the split can fail if the terminal width is too small.
                for (const terminal of Object.values(this._terminals)) {
                    if (terminal.group === group) {
                        this._logService.trace(`Found terminal to split for group ${group}`);
                        const originalInstance = terminal.terminal;
                        const result = await this._terminalService.createTerminal({ location: { parentTerminal: originalInstance }, config: launchConfigs });
                        result.onDisposed(onDisposed);
                        if (result) {
                            return result;
                        }
                    }
                }
                this._logService.trace(`No terminal found to split for group ${group}`);
            }
            // Either no group is used, no terminal with the group exists or splitting an existing terminal failed.
            const createdTerminal = await this._terminalService.createTerminal({ config: launchConfigs });
            createdTerminal.onDisposed(onDisposed);
            return createdTerminal;
        }
        _reconnectToTerminals() {
            if (this._hasReconnected) {
                this._logService.trace(`Already reconnected, to ${this._reconnectedTerminals?.length} terminals so returning`);
                return;
            }
            this._reconnectedTerminals = this._terminalService.getReconnectedTerminals(ReconnectionType)?.filter(t => !t.isDisposed && getReconnectionData(t)) || [];
            this._logService.trace(`Attempting reconnection of ${this._reconnectedTerminals?.length} terminals`);
            if (!this._reconnectedTerminals?.length) {
                this._logService.trace(`No terminals to reconnect to so returning`);
            }
            else {
                for (const terminal of this._reconnectedTerminals) {
                    const data = getReconnectionData(terminal);
                    if (data) {
                        const terminalData = { lastTask: data.lastTask, group: data.group, terminal };
                        this._terminals[terminal.instanceId] = terminalData;
                        this._logService.trace('Reconnecting to task terminal', terminalData.lastTask, terminal.instanceId);
                    }
                }
            }
            this._hasReconnected = true;
        }
        _deleteTaskAndTerminal(terminal, terminalData) {
            delete this._terminals[terminal.instanceId];
            delete this._sameTaskTerminals[terminalData.lastTask];
            this._idleTaskTerminals.delete(terminalData.lastTask);
            // Delete the task now as a work around for cases when the onExit isn't fired.
            // This can happen if the terminal wasn't shutdown with an "immediate" flag and is expected.
            // For correct terminal re-use, the task needs to be deleted immediately.
            // Note that this shouldn't be a problem anymore since user initiated terminal kills are now immediate.
            const mapKey = terminalData.lastTask;
            this._removeFromActiveTasks(mapKey);
            if (this._busyTasks[mapKey]) {
                delete this._busyTasks[mapKey];
            }
        }
        async _createTerminal(task, resolver, workspaceFolder) {
            const platform = resolver.taskSystemInfo ? resolver.taskSystemInfo.platform : Platform.platform;
            const options = await this._resolveOptions(resolver, task.command.options);
            const presentationOptions = task.command.presentation;
            if (!presentationOptions) {
                throw new Error('Task presentation options should not be undefined here.');
            }
            const waitOnExit = getWaitOnExitValue(presentationOptions, task.configurationProperties);
            let command;
            let args;
            let launchConfigs;
            if (task.command.runtime === tasks_1.RuntimeType.CustomExecution) {
                this._currentTask.shellLaunchConfig = launchConfigs = {
                    customPtyImplementation: (id, cols, rows) => new terminalProcessExtHostProxy_1.TerminalProcessExtHostProxy(id, cols, rows, this._terminalService),
                    waitOnExit,
                    name: this._createTerminalName(task),
                    initialText: task.command.presentation && task.command.presentation.echo ? (0, terminalStrings_1.formatMessageForTerminal)(nls.localize({
                        key: 'task.executing',
                        comment: ['The task command line or label']
                    }, 'Executing task: {0}', task._label), { excludeLeadingNewLine: true }) : undefined,
                    isFeatureTerminal: true,
                    icon: task.configurationProperties.icon?.id ? themables_1.ThemeIcon.fromId(task.configurationProperties.icon.id) : undefined,
                    color: task.configurationProperties.icon?.color || undefined
                };
            }
            else {
                const resolvedResult = await this._resolveCommandAndArgs(resolver, task.command);
                command = resolvedResult.command;
                args = resolvedResult.args;
                this._currentTask.shellLaunchConfig = launchConfigs = await this._createShellLaunchConfig(task, workspaceFolder, resolver, platform, options, command, args, waitOnExit);
                if (launchConfigs === undefined) {
                    return [undefined, new taskSystem_1.TaskError(severity_1.default.Error, nls.localize('TerminalTaskSystem', 'Can\'t execute a shell command on an UNC drive using cmd.exe.'), 7 /* TaskErrors.UnknownError */)];
                }
            }
            const prefersSameTerminal = presentationOptions.panel === tasks_1.PanelKind.Dedicated;
            const allowsSharedTerminal = presentationOptions.panel === tasks_1.PanelKind.Shared;
            const group = presentationOptions.group;
            const taskKey = task.getMapKey();
            let terminalToReuse;
            if (prefersSameTerminal) {
                const terminalId = this._sameTaskTerminals[taskKey];
                if (terminalId) {
                    terminalToReuse = this._terminals[terminalId];
                    delete this._sameTaskTerminals[taskKey];
                }
            }
            else if (allowsSharedTerminal) {
                // Always allow to reuse the terminal previously used by the same task.
                let terminalId = this._idleTaskTerminals.remove(taskKey);
                if (!terminalId) {
                    // There is no idle terminal which was used by the same task.
                    // Search for any idle terminal used previously by a task of the same group
                    // (or, if the task has no group, a terminal used by a task without group).
                    for (const taskId of this._idleTaskTerminals.keys()) {
                        const idleTerminalId = this._idleTaskTerminals.get(taskId);
                        if (idleTerminalId && this._terminals[idleTerminalId] && this._terminals[idleTerminalId].group === group) {
                            terminalId = this._idleTaskTerminals.remove(taskId);
                            break;
                        }
                    }
                }
                if (terminalId) {
                    terminalToReuse = this._terminals[terminalId];
                }
            }
            if (terminalToReuse) {
                if (!launchConfigs) {
                    throw new Error('Task shell launch configuration should not be undefined here.');
                }
                terminalToReuse.terminal.scrollToBottom();
                if (task.configurationProperties.isBackground) {
                    launchConfigs.reconnectionProperties = { ownerId: ReconnectionType, data: { lastTask: task.getCommonTaskId(), group, label: task._label, id: task._id } };
                }
                await terminalToReuse.terminal.reuseTerminal(launchConfigs);
                if (task.command.presentation && task.command.presentation.clear) {
                    terminalToReuse.terminal.clearBuffer();
                }
                this._terminals[terminalToReuse.terminal.instanceId.toString()].lastTask = taskKey;
                return [terminalToReuse.terminal, undefined];
            }
            this._terminalCreationQueue = this._terminalCreationQueue.then(() => this._doCreateTerminal(task, group, launchConfigs));
            const terminal = (await this._terminalCreationQueue);
            if (task.configurationProperties.isBackground) {
                terminal.shellLaunchConfig.reconnectionProperties = { ownerId: ReconnectionType, data: { lastTask: task.getCommonTaskId(), group, label: task._label, id: task._id } };
            }
            const terminalKey = terminal.instanceId.toString();
            const terminalData = { terminal: terminal, lastTask: taskKey, group };
            terminal.onDisposed(() => this._deleteTaskAndTerminal(terminal, terminalData));
            this._terminals[terminalKey] = terminalData;
            return [terminal, undefined];
        }
        _buildShellCommandLine(platform, shellExecutable, shellOptions, command, originalCommand, args) {
            const basename = path.parse(shellExecutable).name.toLowerCase();
            const shellQuoteOptions = this._getQuotingOptions(basename, shellOptions, platform);
            function needsQuotes(value) {
                if (value.length >= 2) {
                    const first = value[0] === shellQuoteOptions.strong ? shellQuoteOptions.strong : value[0] === shellQuoteOptions.weak ? shellQuoteOptions.weak : undefined;
                    if (first === value[value.length - 1]) {
                        return false;
                    }
                }
                let quote;
                for (let i = 0; i < value.length; i++) {
                    // We found the end quote.
                    const ch = value[i];
                    if (ch === quote) {
                        quote = undefined;
                    }
                    else if (quote !== undefined) {
                        // skip the character. We are quoted.
                        continue;
                    }
                    else if (ch === shellQuoteOptions.escape) {
                        // Skip the next character
                        i++;
                    }
                    else if (ch === shellQuoteOptions.strong || ch === shellQuoteOptions.weak) {
                        quote = ch;
                    }
                    else if (ch === ' ') {
                        return true;
                    }
                }
                return false;
            }
            function quote(value, kind) {
                if (kind === tasks_1.ShellQuoting.Strong && shellQuoteOptions.strong) {
                    return [shellQuoteOptions.strong + value + shellQuoteOptions.strong, true];
                }
                else if (kind === tasks_1.ShellQuoting.Weak && shellQuoteOptions.weak) {
                    return [shellQuoteOptions.weak + value + shellQuoteOptions.weak, true];
                }
                else if (kind === tasks_1.ShellQuoting.Escape && shellQuoteOptions.escape) {
                    if (Types.isString(shellQuoteOptions.escape)) {
                        return [value.replace(/ /g, shellQuoteOptions.escape + ' '), true];
                    }
                    else {
                        const buffer = [];
                        for (const ch of shellQuoteOptions.escape.charsToEscape) {
                            buffer.push(`\\${ch}`);
                        }
                        const regexp = new RegExp('[' + buffer.join(',') + ']', 'g');
                        const escapeChar = shellQuoteOptions.escape.escapeChar;
                        return [value.replace(regexp, (match) => escapeChar + match), true];
                    }
                }
                return [value, false];
            }
            function quoteIfNecessary(value) {
                if (Types.isString(value)) {
                    if (needsQuotes(value)) {
                        return quote(value, tasks_1.ShellQuoting.Strong);
                    }
                    else {
                        return [value, false];
                    }
                }
                else {
                    return quote(value.value, value.quoting);
                }
            }
            // If we have no args and the command is a string then use the command to stay backwards compatible with the old command line
            // model. To allow variable resolving with spaces we do continue if the resolved value is different than the original one
            // and the resolved one needs quoting.
            if ((!args || args.length === 0) && Types.isString(command) && (command === originalCommand || needsQuotes(originalCommand))) {
                return command;
            }
            const result = [];
            let commandQuoted = false;
            let argQuoted = false;
            let value;
            let quoted;
            [value, quoted] = quoteIfNecessary(command);
            result.push(value);
            commandQuoted = quoted;
            for (const arg of args) {
                [value, quoted] = quoteIfNecessary(arg);
                result.push(value);
                argQuoted = argQuoted || quoted;
            }
            let commandLine = result.join(' ');
            // There are special rules quoted command line in cmd.exe
            if (platform === 3 /* Platform.Platform.Windows */) {
                if (basename === 'cmd' && commandQuoted && argQuoted) {
                    commandLine = '"' + commandLine + '"';
                }
                else if ((basename === 'powershell' || basename === 'pwsh') && commandQuoted) {
                    commandLine = '& ' + commandLine;
                }
            }
            return commandLine;
        }
        _getQuotingOptions(shellBasename, shellOptions, platform) {
            if (shellOptions && shellOptions.quoting) {
                return shellOptions.quoting;
            }
            return TerminalTaskSystem._shellQuotes[shellBasename] || TerminalTaskSystem._osShellQuotes[Platform.PlatformToString(platform)];
        }
        _collectTaskVariables(variables, task) {
            if (task.command && task.command.name) {
                this._collectCommandVariables(variables, task.command, task);
            }
            this._collectMatcherVariables(variables, task.configurationProperties.problemMatchers);
            if (task.command.runtime === tasks_1.RuntimeType.CustomExecution && (tasks_1.CustomTask.is(task) || tasks_1.ContributedTask.is(task))) {
                let definition;
                if (tasks_1.CustomTask.is(task)) {
                    definition = task._source.config.element;
                }
                else {
                    definition = Objects.deepClone(task.defines);
                    delete definition._key;
                    delete definition.type;
                }
                this._collectDefinitionVariables(variables, definition);
            }
        }
        _collectDefinitionVariables(variables, definition) {
            if (Types.isString(definition)) {
                this._collectVariables(variables, definition);
            }
            else if (Array.isArray(definition)) {
                definition.forEach((element) => this._collectDefinitionVariables(variables, element));
            }
            else if (Types.isObject(definition)) {
                for (const key in definition) {
                    this._collectDefinitionVariables(variables, definition[key]);
                }
            }
        }
        _collectCommandVariables(variables, command, task) {
            // The custom execution should have everything it needs already as it provided
            // the callback.
            if (command.runtime === tasks_1.RuntimeType.CustomExecution) {
                return;
            }
            if (command.name === undefined) {
                throw new Error('Command name should never be undefined here.');
            }
            this._collectVariables(variables, command.name);
            command.args?.forEach(arg => this._collectVariables(variables, arg));
            // Try to get a scope.
            const scope = task._source.scope;
            if (scope !== 1 /* TaskScope.Global */) {
                variables.add('${workspaceFolder}');
            }
            if (command.options) {
                const options = command.options;
                if (options.cwd) {
                    this._collectVariables(variables, options.cwd);
                }
                const optionsEnv = options.env;
                if (optionsEnv) {
                    Object.keys(optionsEnv).forEach((key) => {
                        const value = optionsEnv[key];
                        if (Types.isString(value)) {
                            this._collectVariables(variables, value);
                        }
                    });
                }
                if (options.shell) {
                    if (options.shell.executable) {
                        this._collectVariables(variables, options.shell.executable);
                    }
                    options.shell.args?.forEach(arg => this._collectVariables(variables, arg));
                }
            }
        }
        _collectMatcherVariables(variables, values) {
            if (values === undefined || values === null || values.length === 0) {
                return;
            }
            values.forEach((value) => {
                let matcher;
                if (Types.isString(value)) {
                    if (value[0] === '$') {
                        matcher = problemMatcher_1.ProblemMatcherRegistry.get(value.substring(1));
                    }
                    else {
                        matcher = problemMatcher_1.ProblemMatcherRegistry.get(value);
                    }
                }
                else {
                    matcher = value;
                }
                if (matcher && matcher.filePrefix) {
                    if (Types.isString(matcher.filePrefix)) {
                        this._collectVariables(variables, matcher.filePrefix);
                    }
                    else {
                        for (const fp of [...(0, arrays_1.asArray)(matcher.filePrefix.include || []), ...(0, arrays_1.asArray)(matcher.filePrefix.exclude || [])]) {
                            this._collectVariables(variables, fp);
                        }
                    }
                }
            });
        }
        _collectVariables(variables, value) {
            const string = Types.isString(value) ? value : value.value;
            const r = /\$\{(.*?)\}/g;
            let matches;
            do {
                matches = r.exec(string);
                if (matches) {
                    variables.add(matches[0]);
                }
            } while (matches);
        }
        async _resolveCommandAndArgs(resolver, commandConfig) {
            // First we need to use the command args:
            let args = commandConfig.args ? commandConfig.args.slice() : [];
            args = await this._resolveVariables(resolver, args);
            const command = await this._resolveVariable(resolver, commandConfig.name);
            return { command, args };
        }
        async _resolveVariables(resolver, value) {
            return Promise.all(value.map(s => this._resolveVariable(resolver, s)));
        }
        async _resolveMatchers(resolver, values) {
            if (values === undefined || values === null || values.length === 0) {
                return [];
            }
            const result = [];
            for (const value of values) {
                let matcher;
                if (Types.isString(value)) {
                    if (value[0] === '$') {
                        matcher = problemMatcher_1.ProblemMatcherRegistry.get(value.substring(1));
                    }
                    else {
                        matcher = problemMatcher_1.ProblemMatcherRegistry.get(value);
                    }
                }
                else {
                    matcher = value;
                }
                if (!matcher) {
                    this._appendOutput(nls.localize('unknownProblemMatcher', 'Problem matcher {0} can\'t be resolved. The matcher will be ignored'));
                    continue;
                }
                const taskSystemInfo = resolver.taskSystemInfo;
                const hasFilePrefix = matcher.filePrefix !== undefined;
                const hasUriProvider = taskSystemInfo !== undefined && taskSystemInfo.uriProvider !== undefined;
                if (!hasFilePrefix && !hasUriProvider) {
                    result.push(matcher);
                }
                else {
                    const copy = Objects.deepClone(matcher);
                    if (hasUriProvider && (taskSystemInfo !== undefined)) {
                        copy.uriProvider = taskSystemInfo.uriProvider;
                    }
                    if (hasFilePrefix) {
                        const filePrefix = copy.filePrefix;
                        if (Types.isString(filePrefix)) {
                            copy.filePrefix = await this._resolveVariable(resolver, filePrefix);
                        }
                        else if (filePrefix !== undefined) {
                            if (filePrefix.include) {
                                filePrefix.include = Array.isArray(filePrefix.include)
                                    ? await Promise.all(filePrefix.include.map(x => this._resolveVariable(resolver, x)))
                                    : await this._resolveVariable(resolver, filePrefix.include);
                            }
                            if (filePrefix.exclude) {
                                filePrefix.exclude = Array.isArray(filePrefix.exclude)
                                    ? await Promise.all(filePrefix.exclude.map(x => this._resolveVariable(resolver, x)))
                                    : await this._resolveVariable(resolver, filePrefix.exclude);
                            }
                        }
                    }
                    result.push(copy);
                }
            }
            return result;
        }
        async _resolveVariable(resolver, value) {
            // TODO@Dirk Task.getWorkspaceFolder should return a WorkspaceFolder that is defined in workspace.ts
            if (Types.isString(value)) {
                return resolver.resolve(value);
            }
            else if (value !== undefined) {
                return {
                    value: await resolver.resolve(value.value),
                    quoting: value.quoting
                };
            }
            else { // This should never happen
                throw new Error('Should never try to resolve undefined.');
            }
        }
        async _resolveOptions(resolver, options) {
            if (options === undefined || options === null) {
                let cwd;
                try {
                    cwd = await this._resolveVariable(resolver, '${workspaceFolder}');
                }
                catch (e) {
                    // No workspace
                }
                return { cwd };
            }
            const result = Types.isString(options.cwd)
                ? { cwd: await this._resolveVariable(resolver, options.cwd) }
                : { cwd: await this._resolveVariable(resolver, '${workspaceFolder}') };
            if (options.env) {
                result.env = Object.create(null);
                for (const key of Object.keys(options.env)) {
                    const value = options.env[key];
                    if (Types.isString(value)) {
                        result.env[key] = await this._resolveVariable(resolver, value);
                    }
                    else {
                        result.env[key] = value.toString();
                    }
                }
            }
            return result;
        }
        static { this.WellKnownCommands = {
            'ant': true,
            'cmake': true,
            'eslint': true,
            'gradle': true,
            'grunt': true,
            'gulp': true,
            'jake': true,
            'jenkins': true,
            'jshint': true,
            'make': true,
            'maven': true,
            'msbuild': true,
            'msc': true,
            'nmake': true,
            'npm': true,
            'rake': true,
            'tsc': true,
            'xbuild': true
        }; }
        getSanitizedCommand(cmd) {
            let result = cmd.toLowerCase();
            const index = result.lastIndexOf(path.sep);
            if (index !== -1) {
                result = result.substring(index + 1);
            }
            if (TerminalTaskSystem.WellKnownCommands[result]) {
                return result;
            }
            return 'other';
        }
        _appendOutput(output) {
            const outputChannel = this._outputService.getChannel(this._outputChannelId);
            outputChannel?.append(output);
        }
    }
    exports.TerminalTaskSystem = TerminalTaskSystem;
    function getWaitOnExitValue(presentationOptions, configurationProperties) {
        if ((presentationOptions.close === undefined) || (presentationOptions.close === false)) {
            if ((presentationOptions.reveal !== tasks_1.RevealKind.Never) || !configurationProperties.isBackground || (presentationOptions.close === false)) {
                if (presentationOptions.panel === tasks_1.PanelKind.New) {
                    return taskShellIntegrationWaitOnExitSequence(nls.localize('closeTerminal', 'Press any key to close the terminal.'));
                }
                else if (presentationOptions.showReuseMessage) {
                    return taskShellIntegrationWaitOnExitSequence(nls.localize('reuseTerminal', 'Terminal will be reused by tasks, press any key to close it.'));
                }
                else {
                    return true;
                }
            }
        }
        return !presentationOptions.close;
    }
    function taskShellIntegrationWaitOnExitSequence(message) {
        return (exitCode) => {
            return `${(0, terminalEscapeSequences_1.VSCodeSequence)("D" /* VSCodeOscPt.CommandFinished */, exitCode.toString())}${message}`;
        };
    }
    function getReconnectionData(terminal) {
        return terminal.shellLaunchConfig.attachPersistentProcess?.reconnectionProperties?.data;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxUYXNrU3lzdGVtLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGFza3MvYnJvd3Nlci90ZXJtaW5hbFRhc2tTeXN0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBMEVoRyxNQUFNLGdCQUFnQixHQUFHLE1BQU0sQ0FBQztJQUVoQyxNQUFNLGdCQUFnQjtpQkFDTixXQUFNLEdBQUcsY0FBYyxDQUFDO1FBQ3ZDLFlBQW1CLGVBQTZDLEVBQVMsY0FBMkMsRUFBa0IsTUFBMkIsRUFBVSxRQUFtRDtZQUEzTSxvQkFBZSxHQUFmLGVBQWUsQ0FBOEI7WUFBUyxtQkFBYyxHQUFkLGNBQWMsQ0FBNkI7WUFBa0IsV0FBTSxHQUFOLE1BQU0sQ0FBcUI7WUFBVSxhQUFRLEdBQVIsUUFBUSxDQUEyQztRQUM5TixDQUFDO1FBQ0QsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFhO1lBQzFCLE1BQU0sU0FBUyxHQUFzQixFQUFFLENBQUM7WUFDeEMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxJQUFJLEVBQUUsRUFBRTtnQkFDekQsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUM1QyxPQUFPLEtBQUssQ0FBQztZQUNkLENBQUMsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxpQkFBaUIsR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDdkQsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUcsQ0FBQyxDQUFDO1FBRWpGLENBQUM7UUFFTyxLQUFLLENB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