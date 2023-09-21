/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/event", "vs/base/common/extpath", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/objects", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/severity", "vs/base/common/types", "vs/nls!vs/workbench/contrib/tasks/browser/terminalTaskSystem", "vs/platform/markers/common/markers", "vs/workbench/contrib/markers/common/markers", "vs/workbench/contrib/tasks/common/problemMatcher", "vs/base/common/codicons", "vs/base/common/network", "vs/base/common/themables", "vs/base/common/uri", "vs/platform/terminal/common/terminalStrings", "vs/workbench/contrib/tasks/browser/taskTerminalStatus", "vs/workbench/contrib/tasks/common/problemCollectors", "vs/workbench/contrib/tasks/common/taskConfiguration", "vs/workbench/contrib/tasks/common/taskSystem", "vs/workbench/contrib/tasks/common/tasks", "vs/workbench/contrib/terminal/browser/terminalEscapeSequences", "vs/workbench/contrib/terminal/browser/terminalProcessExtHostProxy", "vs/workbench/contrib/terminal/common/terminal"], function (require, exports, arrays_1, Async, event_1, extpath_1, lifecycle_1, map_1, Objects, path, Platform, resources, severity_1, Types, nls, markers_1, markers_2, problemMatcher_1, codicons_1, network_1, themables_1, uri_1, terminalStrings_1, taskTerminalStatus_1, problemCollectors_1, taskConfiguration_1, taskSystem_1, tasks_1, terminalEscapeSequences_1, terminalProcessExtHostProxy_1, terminal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$FXb = void 0;
    const ReconnectionType = 'Task';
    class VariableResolver {
        static { this.b = /\$\{(.*?)\}/g; }
        constructor(workspaceFolder, taskSystemInfo, values, c) {
            this.workspaceFolder = workspaceFolder;
            this.taskSystemInfo = taskSystemInfo;
            this.values = values;
            this.c = c;
        }
        async resolve(value) {
            const replacers = [];
            value.replace(VariableResolver.b, (match, ...args) => {
                replacers.push(this.d(match, args));
                return match;
            });
            const resolvedReplacers = await Promise.all(replacers);
            return value.replace(VariableResolver.b, () => resolvedReplacers.shift());
        }
        async d(match, args) {
            // Strip out the ${} because the map contains them variables without those characters.
            const result = this.values.get(match.substring(2, match.length - 1));
            if ((result !== undefined) && (result !== null)) {
                return result;
            }
            if (this.c) {
                return this.c.resolveAsync(this.workspaceFolder, match);
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
    class $FXb extends lifecycle_1.$kc {
        static { this.TelemetryEventName = 'taskService'; }
        static { this.b = '__process__'; }
        static { this.c = {
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
        static { this.f = {
            'Linux': $FXb.c['bash'],
            'Mac': $FXb.c['bash'],
            'Windows': $FXb.c['powershell']
        }; }
        taskShellIntegrationStartSequence(cwd) {
            return ((0, terminalEscapeSequences_1.$DXb)("A" /* VSCodeOscPt.PromptStart */) +
                (0, terminalEscapeSequences_1.$DXb)("P" /* VSCodeOscPt.Property */, `${"Task" /* VSCodeOscProperty.Task */}=True`) +
                (cwd
                    ? (0, terminalEscapeSequences_1.$DXb)("P" /* VSCodeOscPt.Property */, `${"Cwd" /* VSCodeOscProperty.Cwd */}=${typeof cwd === 'string' ? cwd : cwd.fsPath}`)
                    : '') +
                (0, terminalEscapeSequences_1.$DXb)("B" /* VSCodeOscPt.CommandStart */));
        }
        get taskShellIntegrationOutputSequence() {
            return (0, terminalEscapeSequences_1.$DXb)("C" /* VSCodeOscPt.CommandExecuted */);
        }
        constructor(L, M, N, O, P, Q, R, S, U, W, X, Y, Z, $, ab, bb, cb, instantiationService, taskSystemInfoResolver) {
            super();
            this.L = L;
            this.M = M;
            this.N = N;
            this.O = O;
            this.P = P;
            this.Q = Q;
            this.R = R;
            this.S = S;
            this.U = U;
            this.W = W;
            this.X = X;
            this.Y = Y;
            this.Z = Z;
            this.$ = $;
            this.ab = ab;
            this.bb = bb;
            this.cb = cb;
            this.z = false;
            this.G = Promise.resolve();
            this.H = false;
            this.g = Object.create(null);
            this.h = Object.create(null);
            this.j = Object.create(null);
            this.m = new map_1.$Bi();
            this.n = Object.create(null);
            this.I = new event_1.$fd();
            this.u = taskSystemInfoResolver;
            this.B(this.F = instantiationService.createInstance(taskTerminalStatus_1.$CXb));
        }
        get onDidStateChange() {
            return this.I.event;
        }
        db(value) {
            this.Sb(value + '\n');
        }
        eb() {
            this.N.showChannel(this.X, true);
        }
        reconnect(task, resolver) {
            this.Db();
            return this.run(task, resolver, taskSystem_1.Triggers.reconnect);
        }
        run(task, resolver, trigger = taskSystem_1.Triggers.command) {
            task = task.clone(); // A small amount of task state is stored in the task (instance) and tasks passed in to run may have that set already.
            const instances = tasks_1.$hG.is(task) || this.vb(task) ? [] : this.gb(task);
            const validInstance = instances.length < ((task.runOptions && task.runOptions.instanceLimit) ?? 1);
            const instance = instances[0]?.count?.count ?? 0;
            this.y = new VerifiedTask(task, resolver, trigger);
            if (instance > 0) {
                task.instance = instance;
            }
            if (!validInstance) {
                const terminalData = instances[instances.length - 1];
                this.w = this.y;
                return { kind: 2 /* TaskExecuteKind.Active */, task: terminalData.task, active: { same: true, background: task.configurationProperties.isBackground }, promise: terminalData.promise };
            }
            try {
                const executeResult = { kind: 1 /* TaskExecuteKind.Started */, task, started: {}, promise: this.kb(task, resolver, trigger, new Set(), new Map(), undefined) };
                executeResult.promise.then(summary => {
                    this.w = this.y;
                });
                return executeResult;
            }
            catch (error) {
                if (error instanceof taskSystem_1.$hsb) {
                    throw error;
                }
                else if (error instanceof Error) {
                    this.db(error.message);
                    throw new taskSystem_1.$hsb(severity_1.default.Error, error.message, 7 /* TaskErrors.UnknownError */);
                }
                else {
                    this.db(error.toString());
                    throw new taskSystem_1.$hsb(severity_1.default.Error, nls.localize(0, null), 7 /* TaskErrors.UnknownError */);
                }
            }
        }
        rerun() {
            if (this.w && this.w.verify()) {
                if ((this.w.task.runOptions.reevaluateOnRerun !== undefined) && !this.w.task.runOptions.reevaluateOnRerun) {
                    this.z = true;
                }
                const result = this.run(this.w.task, this.w.resolver);
                result.promise.then(summary => {
                    this.z = false;
                });
                return result;
            }
            else {
                return undefined;
            }
        }
        fb(task) {
            if (task.taskLoadMessages && task.taskLoadMessages.length > 0) {
                task.taskLoadMessages.forEach(loadMessage => {
                    this.db(loadMessage + '\n');
                });
                const openOutput = 'Show Output';
                this.cb.prompt(severity_1.default.Warning, nls.localize(1, null, task._label), [{
                        label: openOutput,
                        run: () => this.eb()
                    }]);
            }
        }
        isTaskVisible(task) {
            const terminalData = this.g[task.getMapKey()];
            if (!terminalData?.terminal) {
                return false;
            }
            const activeTerminalInstance = this.L.activeInstance;
            const isPanelShowingTerminal = !!this.P.getActiveViewWithId(terminal_1.$tM);
            return isPanelShowingTerminal && (activeTerminalInstance?.instanceId === terminalData.terminal.instanceId);
        }
        revealTask(task) {
            const terminalData = this.g[task.getMapKey()];
            if (!terminalData?.terminal) {
                return false;
            }
            const isTerminalInPanel = this.ab.getViewLocationById(terminal_1.$tM) === 1 /* ViewContainerLocation.Panel */;
            if (isTerminalInPanel && this.isTaskVisible(task)) {
                if (this.C) {
                    if (this.D) {
                        this.L.setActiveInstance(this.D);
                    }
                    this.O.openPaneComposite(this.C, 1 /* ViewContainerLocation.Panel */);
                }
                else {
                    this.O.hideActivePaneComposite(1 /* ViewContainerLocation.Panel */);
                }
                this.C = undefined;
                this.D = undefined;
            }
            else {
                if (isTerminalInPanel) {
                    this.C = this.O.getActivePaneComposite(1 /* ViewContainerLocation.Panel */)?.getId();
                    if (this.C === terminal_1.$tM) {
                        this.D = this.L.activeInstance ?? undefined;
                    }
                }
                this.L.setActiveInstance(terminalData.terminal);
                if (tasks_1.$eG.is(task) || tasks_1.$gG.is(task)) {
                    this.M.showPanel(task.command.presentation.focus);
                }
            }
            return true;
        }
        isActive() {
            return Promise.resolve(this.isActiveSync());
        }
        isActiveSync() {
            return Object.values(this.g).some(value => !!value.terminal);
        }
        canAutoTerminate() {
            return Object.values(this.g).every(value => !value.task.configurationProperties.promptOnClose);
        }
        getActiveTasks() {
            return Object.values(this.g).flatMap(value => value.terminal ? value.task : []);
        }
        getLastInstance(task) {
            const recentKey = task.getRecentlyUsedKey();
            return Object.values(this.g).reverse().find((value) => recentKey && recentKey === value.task.getRecentlyUsedKey())?.task;
        }
        getBusyTasks() {
            return Object.keys(this.h).map(key => this.h[key]);
        }
        customExecutionComplete(task, result) {
            const activeTerminal = this.g[task.getMapKey()];
            if (!activeTerminal?.terminal) {
                return Promise.reject(new Error('Expected to have a terminal for a custom execution task'));
            }
            return new Promise((resolve) => {
                // activeTerminal.terminal.rendererExit(result);
                resolve();
            });
        }
        gb(task) {
            const recentKey = task.getRecentlyUsedKey();
            return Object.values(this.g).filter((value) => recentKey && recentKey === value.task.getRecentlyUsedKey());
        }
        hb(task) {
            const key = typeof task === 'string' ? task : task.getMapKey();
            const taskToRemove = this.g[key];
            if (!taskToRemove) {
                return;
            }
            delete this.g[key];
        }
        ib(event) {
            if (event.kind !== "changed" /* TaskEventKind.Changed */) {
                const activeTask = this.g[event.__task.getMapKey()];
                if (activeTask) {
                    activeTask.state = event.kind;
                }
            }
            this.I.fire(event);
        }
        terminate(task) {
            const activeTerminal = this.g[task.getMapKey()];
            const terminal = activeTerminal.terminal;
            if (!terminal) {
                return Promise.resolve({ success: false, task: undefined });
            }
            return new Promise((resolve, reject) => {
                terminal.onDisposed(terminal => {
                    this.ib(tasks_1.TaskEvent.terminated(task, terminal.instanceId, terminal.exitReason));
                });
                const onExit = terminal.onExit(() => {
                    const task = activeTerminal.task;
                    try {
                        onExit.dispose();
                        this.ib(tasks_1.TaskEvent.terminated(task, terminal.instanceId, terminal.exitReason));
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
            for (const [key, terminalData] of Object.entries(this.g)) {
                const terminal = terminalData.terminal;
                if (terminal) {
                    promises.push(new Promise((resolve, reject) => {
                        const onExit = terminal.onExit(() => {
                            const task = terminalData.task;
                            try {
                                onExit.dispose();
                                this.ib(tasks_1.TaskEvent.terminated(task, terminal.instanceId, terminal.exitReason));
                            }
                            catch (error) {
                                // Do nothing.
                            }
                            if (this.g[key] === terminalData) {
                                delete this.g[key];
                            }
                            resolve({ success: true, task: terminalData.task });
                        });
                    }));
                    terminal.dispose();
                }
            }
            return Promise.all(promises);
        }
        jb(task) {
            this.db(nls.localize(2, null, task._label));
            this.eb();
        }
        kb(task, resolver, trigger, liveDependencies, encounteredTasks, alreadyResolved) {
            this.fb(task);
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
                            this.mb(dependencyTask, task);
                            let taskResult;
                            const commonKey = dependencyTask.getCommonTaskId();
                            if (nextLiveDependencies.has(commonKey)) {
                                this.jb(dependencyTask);
                                taskResult = Promise.resolve({});
                            }
                            else {
                                taskResult = encounteredTasks.get(commonKey);
                                if (!taskResult) {
                                    const activeTask = this.g[dependencyTask.getMapKey()] ?? this.gb(dependencyTask).pop();
                                    taskResult = activeTask && this.nb(activeTask);
                                }
                            }
                            if (!taskResult) {
                                this.ib(tasks_1.TaskEvent.general("dependsOnStarted" /* TaskEventKind.DependsOnStarted */, task));
                                taskResult = this.ob(dependencyTask, resolver, trigger, nextLiveDependencies, encounteredTasks, alreadyResolved);
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
                            this.db(nls.localize(3, null, Types.$jf(dependency.task) ? dependency.task : JSON.stringify(dependency.task, undefined, 0), dependency.uri.toString()));
                            this.eb();
                        }
                    }
                }
                return Promise.all(promises).then((summaries) => {
                    for (const summary of summaries) {
                        if (summary.exitCode !== 0) {
                            return { exitCode: summary.exitCode };
                        }
                    }
                    if ((tasks_1.$gG.is(task) || tasks_1.$eG.is(task)) && (task.command)) {
                        if (this.z) {
                            return this.wb(task, trigger, alreadyResolved);
                        }
                        else {
                            return this.ub(task, trigger, alreadyResolved);
                        }
                    }
                    return { exitCode: 0 };
                });
            }).finally(() => {
                if (this.g[mapKey] === activeTask) {
                    delete this.g[mapKey];
                }
            });
            const lastInstance = this.gb(task).pop();
            const count = lastInstance?.count ?? { count: 0 };
            count.count++;
            const activeTask = { task, promise, count };
            this.g[mapKey] = activeTask;
            return promise;
        }
        lb(task) {
            return new Promise(resolve => {
                const taskInactiveDisposable = this.onDidStateChange(taskEvent => {
                    if ((taskEvent.kind === "inactive" /* TaskEventKind.Inactive */) && (taskEvent.__task === task)) {
                        taskInactiveDisposable.dispose();
                        resolve({ exitCode: 0 });
                    }
                });
            });
        }
        mb(dependencyTask, task) {
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
        async nb(task) {
            if (!task.task.configurationProperties.isBackground) {
                return task.promise;
            }
            if (!task.task.configurationProperties.problemMatchers || task.task.configurationProperties.problemMatchers.length === 0) {
                return task.promise;
            }
            if (task.state === "inactive" /* TaskEventKind.Inactive */) {
                return { exitCode: 0 };
            }
            return this.lb(task.task);
        }
        async ob(task, resolver, trigger, liveDependencies, encounteredTasks, alreadyResolved) {
            // If the task is a background task with a watching problem matcher, we don't wait for the whole task to finish,
            // just for the problem matcher to go inactive.
            if (!task.configurationProperties.isBackground) {
                return this.kb(task, resolver, trigger, liveDependencies, encounteredTasks, alreadyResolved);
            }
            const inactivePromise = this.lb(task);
            return Promise.race([inactivePromise, this.kb(task, resolver, trigger, liveDependencies, encounteredTasks, alreadyResolved)]);
        }
        async pb(systemInfo, workspaceFolder, task, cwd, envPath) {
            const command = await this.S.resolveAsync(workspaceFolder, tasks_1.CommandString.value(task.command.name));
            cwd = cwd ? await this.S.resolveAsync(workspaceFolder, cwd) : undefined;
            const paths = envPath ? await Promise.all(envPath.split(path.$ge).map(p => this.S.resolveAsync(workspaceFolder, p))) : undefined;
            let foundExecutable = await systemInfo?.findExecutable(command, cwd, paths);
            if (!foundExecutable) {
                foundExecutable = path.$9d(cwd ?? '', command);
            }
            return foundExecutable;
        }
        qb(variables, alreadyResolved) {
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
        rb(mergeInto, mergeFrom) {
            for (const entry of mergeFrom) {
                if (!mergeInto.has(entry[0])) {
                    mergeInto.set(entry[0], entry[1]);
                }
            }
        }
        async sb(taskSystemInfo, workspaceFolder, task, variables, alreadyResolved) {
            const resolved = await this.tb(taskSystemInfo, workspaceFolder, task, variables, alreadyResolved);
            this.ib(tasks_1.TaskEvent.general("acquiredInput" /* TaskEventKind.AcquiredInput */, task));
            return resolved;
        }
        tb(taskSystemInfo, workspaceFolder, task, variables, alreadyResolved) {
            const isProcess = task.command && task.command.runtime === tasks_1.RuntimeType.Process;
            const options = task.command && task.command.options ? task.command.options : undefined;
            const cwd = options ? options.cwd : undefined;
            let envPath = undefined;
            if (options && options.env) {
                for (const key of Object.keys(options.env)) {
                    if (key.toLowerCase() === 'path') {
                        if (Types.$jf(options.env[key])) {
                            envPath = options.env[key];
                        }
                        break;
                    }
                }
            }
            const unresolved = this.qb(variables, alreadyResolved);
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
                    this.rb(alreadyResolved, resolved.variables);
                    resolved.variables = new Map(alreadyResolved);
                    if (isProcess) {
                        let process = tasks_1.CommandString.value(task.command.name);
                        if (taskSystemInfo.platform === 3 /* Platform.Platform.Windows */) {
                            process = await this.pb(taskSystemInfo, workspaceFolder, task, cwd, envPath);
                        }
                        resolved.variables.set($FXb.b, process);
                    }
                    return resolved;
                });
                return resolvedVariables;
            }
            else {
                const variablesArray = new Array();
                unresolved.forEach(variable => variablesArray.push(variable));
                return new Promise((resolve, reject) => {
                    this.S.resolveWithInteraction(workspaceFolder, variablesArray, 'tasks', undefined, tasks_1.TaskSourceKind.toConfigurationTarget(task._source.kind)).then(async (resolvedVariablesMap) => {
                        if (resolvedVariablesMap) {
                            this.rb(alreadyResolved, resolvedVariablesMap);
                            resolvedVariablesMap = new Map(alreadyResolved);
                            if (isProcess) {
                                let processVarValue;
                                if (Platform.$i) {
                                    processVarValue = await this.pb(taskSystemInfo, workspaceFolder, task, cwd, envPath);
                                }
                                else {
                                    processVarValue = await this.S.resolveAsync(workspaceFolder, tasks_1.CommandString.value(task.command.name));
                                }
                                resolvedVariablesMap.set($FXb.b, processVarValue);
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
        ub(task, trigger, alreadyResolved) {
            const taskWorkspaceFolder = task.getWorkspaceFolder();
            let workspaceFolder;
            if (taskWorkspaceFolder) {
                workspaceFolder = this.y.workspaceFolder = taskWorkspaceFolder;
            }
            else {
                const folders = this.U.getWorkspace().folders;
                workspaceFolder = folders.length > 0 ? folders[0] : undefined;
            }
            const systemInfo = this.y.systemInfo = this.u(workspaceFolder);
            const variables = new Set();
            this.Ib(variables, task);
            const resolvedVariables = this.sb(systemInfo, workspaceFolder, task, variables, alreadyResolved);
            return resolvedVariables.then((resolvedVariables) => {
                if (resolvedVariables && !this.vb(task)) {
                    this.y.resolvedVariables = resolvedVariables;
                    return this.xb(task, trigger, new VariableResolver(workspaceFolder, systemInfo, resolvedVariables.variables, this.S), workspaceFolder);
                }
                else {
                    // Allows the taskExecutions array to be updated in the extension host
                    this.ib(tasks_1.TaskEvent.general("end" /* TaskEventKind.End */, task));
                    return Promise.resolve({ exitCode: 0 });
                }
            }, reason => {
                return Promise.reject(reason);
            });
        }
        vb(task) {
            const isCustomExecution = (task.command.runtime === tasks_1.RuntimeType.CustomExecution);
            return !((task.command !== undefined) && task.command.runtime && (isCustomExecution || (task.command.name !== undefined)));
        }
        wb(task, trigger, alreadyResolved) {
            const lastTask = this.w;
            if (!lastTask) {
                return Promise.reject(new Error('No task previously run'));
            }
            const workspaceFolder = this.y.workspaceFolder = lastTask.workspaceFolder;
            const variables = new Set();
            this.Ib(variables, task);
            // Check that the task hasn't changed to include new variables
            let hasAllVariables = true;
            variables.forEach(value => {
                if (value.substring(2, value.length - 1) in lastTask.getVerifiedTask().resolvedVariables) {
                    hasAllVariables = false;
                }
            });
            if (!hasAllVariables) {
                return this.sb(lastTask.getVerifiedTask().systemInfo, lastTask.getVerifiedTask().workspaceFolder, task, variables, alreadyResolved).then((resolvedVariables) => {
                    if (!resolvedVariables) {
                        // Allows the taskExecutions array to be updated in the extension host
                        this.ib(tasks_1.TaskEvent.general("end" /* TaskEventKind.End */, task));
                        return { exitCode: 0 };
                    }
                    this.y.resolvedVariables = resolvedVariables;
                    return this.xb(task, trigger, new VariableResolver(lastTask.getVerifiedTask().workspaceFolder, lastTask.getVerifiedTask().systemInfo, resolvedVariables.variables, this.S), workspaceFolder);
                }, reason => {
                    return Promise.reject(reason);
                });
            }
            else {
                this.y.resolvedVariables = lastTask.getVerifiedTask().resolvedVariables;
                return this.xb(task, trigger, new VariableResolver(lastTask.getVerifiedTask().workspaceFolder, lastTask.getVerifiedTask().systemInfo, lastTask.getVerifiedTask().resolvedVariables.variables, this.S), workspaceFolder);
            }
        }
        async xb(task, trigger, resolver, workspaceFolder) {
            let terminal = undefined;
            let error = undefined;
            let promise = undefined;
            if (task.configurationProperties.isBackground) {
                const problemMatchers = await this.Pb(resolver, task.configurationProperties.problemMatchers);
                const watchingProblemMatcher = new problemCollectors_1.$yXb(problemMatchers, this.Q, this.R, this.Y);
                if ((problemMatchers.length > 0) && !watchingProblemMatcher.isWatching()) {
                    this.Sb(nls.localize(4, null, task._label));
                    this.eb();
                }
                const toDispose = new lifecycle_1.$jc();
                let eventCounter = 0;
                const mapKey = task.getMapKey();
                toDispose.add(watchingProblemMatcher.onDidStateChange((event) => {
                    if (event.kind === "backgroundProcessingBegins" /* ProblemCollectorEventKind.BackgroundProcessingBegins */) {
                        eventCounter++;
                        this.h[mapKey] = task;
                        this.ib(tasks_1.TaskEvent.general("active" /* TaskEventKind.Active */, task, terminal?.instanceId));
                    }
                    else if (event.kind === "backgroundProcessingEnds" /* ProblemCollectorEventKind.BackgroundProcessingEnds */) {
                        eventCounter--;
                        if (this.h[mapKey]) {
                            delete this.h[mapKey];
                        }
                        this.ib(tasks_1.TaskEvent.general("inactive" /* TaskEventKind.Inactive */, task, terminal?.instanceId));
                        if (eventCounter === 0) {
                            if ((watchingProblemMatcher.numberOfMatches > 0) && watchingProblemMatcher.maxMarkerSeverity &&
                                (watchingProblemMatcher.maxMarkerSeverity >= markers_1.MarkerSeverity.Error)) {
                                const reveal = task.command.presentation.reveal;
                                const revealProblems = task.command.presentation.revealProblems;
                                if (revealProblems === tasks_1.RevealProblemKind.OnProblem) {
                                    this.P.openView(markers_2.Markers.MARKERS_VIEW_ID, true);
                                }
                                else if (reveal === tasks_1.RevealKind.Silent) {
                                    this.L.setActiveInstance(terminal);
                                    this.M.showPanel(false);
                                }
                            }
                        }
                    }
                }));
                watchingProblemMatcher.aboutToStart();
                let delayer = undefined;
                [terminal, error] = await this.Fb(task, resolver, workspaceFolder);
                if (error) {
                    return Promise.reject(new Error(error.message));
                }
                if (!terminal) {
                    return Promise.reject(new Error(`Failed to create terminal for task ${task._label}`));
                }
                this.F.addTerminal(task, terminal, watchingProblemMatcher);
                let processStartedSignaled = false;
                terminal.processReady.then(() => {
                    if (!processStartedSignaled) {
                        this.ib(tasks_1.TaskEvent.processStarted(task, terminal.instanceId, terminal.processId));
                        processStartedSignaled = true;
                    }
                }, (_error) => {
                    this.bb.error('Task terminal process never got ready');
                });
                this.ib(tasks_1.TaskEvent.start(task, terminal.instanceId, resolver.values));
                let onData;
                if (problemMatchers.length) {
                    // prevent https://github.com/microsoft/vscode/issues/174511 from happening
                    onData = terminal.onLineData((line) => {
                        watchingProblemMatcher.processLine(line);
                        if (!delayer) {
                            delayer = new Async.$Dg(3000);
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
                        if (this.h[mapKey]) {
                            delete this.h[mapKey];
                        }
                        this.hb(task);
                        this.ib(tasks_1.TaskEvent.changed());
                        if (terminalLaunchResult !== undefined) {
                            // Only keep a reference to the terminal if it is not being disposed.
                            switch (task.command.presentation.panel) {
                                case tasks_1.PanelKind.Dedicated:
                                    this.n[key] = terminal.instanceId.toString();
                                    break;
                                case tasks_1.PanelKind.Shared:
                                    this.m.set(key, terminal.instanceId.toString(), 1 /* Touch.AsOld */);
                                    break;
                            }
                        }
                        const reveal = task.command.presentation.reveal;
                        if ((reveal === tasks_1.RevealKind.Silent) && ((exitCode !== 0) || (watchingProblemMatcher.numberOfMatches > 0) && watchingProblemMatcher.maxMarkerSeverity &&
                            (watchingProblemMatcher.maxMarkerSeverity >= markers_1.MarkerSeverity.Error))) {
                            try {
                                this.L.setActiveInstance(terminal);
                                this.M.showPanel(false);
                            }
                            catch (e) {
                                // If the terminal has already been disposed, then setting the active instance will fail. #99828
                                // There is nothing else to do here.
                            }
                        }
                        watchingProblemMatcher.done();
                        watchingProblemMatcher.dispose();
                        if (!processStartedSignaled) {
                            this.ib(tasks_1.TaskEvent.processStarted(task, terminal.instanceId, terminal.processId));
                            processStartedSignaled = true;
                        }
                        this.ib(tasks_1.TaskEvent.processEnded(task, terminal.instanceId, exitCode));
                        for (let i = 0; i < eventCounter; i++) {
                            this.ib(tasks_1.TaskEvent.general("inactive" /* TaskEventKind.Inactive */, task, terminal.instanceId));
                        }
                        eventCounter = 0;
                        this.ib(tasks_1.TaskEvent.general("end" /* TaskEventKind.End */, task));
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
                            delayer = new Async.$Dg(3000);
                        }
                        delayer.trigger(() => {
                            watchingProblemMatcher.forceDelivery();
                            delayer = undefined;
                        });
                    }
                }
            }
            else {
                [terminal, error] = await this.Fb(task, resolver, workspaceFolder);
                if (error) {
                    return Promise.reject(new Error(error.message));
                }
                if (!terminal) {
                    return Promise.reject(new Error(`Failed to create terminal for task ${task._label}`));
                }
                let processStartedSignaled = false;
                terminal.processReady.then(() => {
                    if (!processStartedSignaled) {
                        this.ib(tasks_1.TaskEvent.processStarted(task, terminal.instanceId, terminal.processId));
                        processStartedSignaled = true;
                    }
                }, (_error) => {
                    // The process never got ready. Need to think how to handle this.
                });
                this.ib(tasks_1.TaskEvent.start(task, terminal.instanceId, resolver.values));
                const mapKey = task.getMapKey();
                this.h[mapKey] = task;
                this.ib(tasks_1.TaskEvent.general("active" /* TaskEventKind.Active */, task, terminal.instanceId));
                const problemMatchers = await this.Pb(resolver, task.configurationProperties.problemMatchers);
                const startStopProblemMatcher = new problemCollectors_1.$xXb(problemMatchers, this.Q, this.R, 0 /* ProblemHandlingStrategy.Clean */, this.Y);
                this.F.addTerminal(task, terminal, startStopProblemMatcher);
                const onData = terminal.onLineData((line) => {
                    startStopProblemMatcher.processLine(line);
                });
                promise = new Promise((resolve, reject) => {
                    const onExit = terminal.onExit((terminalLaunchResult) => {
                        const exitCode = typeof terminalLaunchResult === 'number' ? terminalLaunchResult : terminalLaunchResult?.code;
                        onExit.dispose();
                        const key = task.getMapKey();
                        this.hb(task);
                        this.ib(tasks_1.TaskEvent.changed());
                        if (terminalLaunchResult !== undefined) {
                            // Only keep a reference to the terminal if it is not being disposed.
                            switch (task.command.presentation.panel) {
                                case tasks_1.PanelKind.Dedicated:
                                    this.n[key] = terminal.instanceId.toString();
                                    break;
                                case tasks_1.PanelKind.Shared:
                                    this.m.set(key, terminal.instanceId.toString(), 1 /* Touch.AsOld */);
                                    break;
                            }
                        }
                        const reveal = task.command.presentation.reveal;
                        const revealProblems = task.command.presentation.revealProblems;
                        const revealProblemPanel = terminal && (revealProblems === tasks_1.RevealProblemKind.OnProblem) && (startStopProblemMatcher.numberOfMatches > 0);
                        if (revealProblemPanel) {
                            this.P.openView(markers_2.Markers.MARKERS_VIEW_ID);
                        }
                        else if (terminal && (reveal === tasks_1.RevealKind.Silent) && ((exitCode !== 0) || (startStopProblemMatcher.numberOfMatches > 0) && startStopProblemMatcher.maxMarkerSeverity &&
                            (startStopProblemMatcher.maxMarkerSeverity >= markers_1.MarkerSeverity.Error))) {
                            try {
                                this.L.setActiveInstance(terminal);
                                this.M.showPanel(false);
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
                            this.ib(tasks_1.TaskEvent.processStarted(task, terminal.instanceId, terminal.processId));
                            processStartedSignaled = true;
                        }
                        this.ib(tasks_1.TaskEvent.processEnded(task, terminal?.instanceId, exitCode ?? undefined));
                        if (this.h[mapKey]) {
                            delete this.h[mapKey];
                        }
                        this.ib(tasks_1.TaskEvent.general("inactive" /* TaskEventKind.Inactive */, task, terminal?.instanceId));
                        this.ib(tasks_1.TaskEvent.general("end" /* TaskEventKind.End */, task, terminal?.instanceId));
                        resolve({ exitCode: exitCode ?? undefined });
                    });
                });
            }
            const showProblemPanel = task.command.presentation && (task.command.presentation.revealProblems === tasks_1.RevealProblemKind.Always);
            if (showProblemPanel) {
                this.P.openView(markers_2.Markers.MARKERS_VIEW_ID);
            }
            else if (task.command.presentation && (task.command.presentation.focus || task.command.presentation.reveal === tasks_1.RevealKind.Always)) {
                this.L.setActiveInstance(terminal);
                this.M.showPanel(task.command.presentation.focus);
            }
            this.g[task.getMapKey()].terminal = terminal;
            this.ib(tasks_1.TaskEvent.changed());
            return promise;
        }
        yb(task) {
            const needsFolderQualification = this.U.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */;
            return needsFolderQualification ? task.getQualifiedLabel() : (task.configurationProperties.name || '');
        }
        async zb(task, workspaceFolder, variableResolver, platform, options, command, args, waitOnExit) {
            let shellLaunchConfig;
            const isShellCommand = task.command.runtime === tasks_1.RuntimeType.Shell;
            const needsFolderQualification = this.U.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */;
            const terminalName = this.yb(task);
            const type = ReconnectionType;
            const originalCommand = task.command.name;
            let cwd;
            if (options.cwd) {
                cwd = options.cwd;
                if (!path.$8d(cwd)) {
                    if (workspaceFolder && (workspaceFolder.uri.scheme === network_1.Schemas.file)) {
                        cwd = path.$9d(workspaceFolder.uri.fsPath, cwd);
                    }
                }
                // This must be normalized to the OS
                cwd = (0, extpath_1.$Ff)(cwd) ? cwd : resources.$sg(uri_1.URI.from({ scheme: network_1.Schemas.file, path: cwd }), this.W.remoteAuthority, this.$.defaultUriScheme);
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
                const defaultProfile = await this.Z.getDefaultProfile({
                    allowAutomationShell: true,
                    os,
                    remoteAuthority: this.W.remoteAuthority
                });
                let icon;
                if (task.configurationProperties.icon?.id) {
                    icon = themables_1.ThemeIcon.fromId(task.configurationProperties.icon.id);
                }
                else {
                    const taskGroupKind = task.configurationProperties.group ? taskConfiguration_1.GroupKind.to(task.configurationProperties.group) : undefined;
                    const kindId = typeof taskGroupKind === 'string' ? taskGroupKind : taskGroupKind?.kind;
                    icon = kindId === 'test' ? themables_1.ThemeIcon.fromId(codicons_1.$Pj.beaker.id) : defaultProfile.icon;
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
                        shellLaunchConfig.executable = await this.Qb(variableResolver, shellOptions.executable);
                        shellSpecified = true;
                    }
                    if (shellOptions.args) {
                        shellLaunchConfig.args = await this.Ob(variableResolver, shellOptions.args.slice());
                    }
                }
                if (shellLaunchConfig.args === undefined) {
                    shellLaunchConfig.args = [];
                }
                const shellArgs = Array.isArray(shellLaunchConfig.args) ? shellLaunchConfig.args.slice(0) : [shellLaunchConfig.args];
                const toAdd = [];
                const basename = path.$6d.basename((await this.$.fileURI(shellLaunchConfig.executable)).path).toLowerCase();
                const commandLine = this.Gb(platform, basename, shellOptions, command, originalCommand, args);
                let windowsShellArgs = false;
                if (platform === 3 /* Platform.Platform.Windows */) {
                    windowsShellArgs = true;
                    // If we don't have a cwd, then the terminal uses the home dir.
                    const userHome = await this.$.userHome();
                    if (basename === 'cmd.exe' && ((options.cwd && (0, extpath_1.$Ff)(options.cwd)) || (!options.cwd && (0, extpath_1.$Ff)(userHome.fsPath)))) {
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
                const combinedShellArgs = this.Ab(toAdd, shellArgs);
                combinedShellArgs.push(commandLine);
                shellLaunchConfig.args = windowsShellArgs ? combinedShellArgs.join(' ') : combinedShellArgs;
                if (task.command.presentation && task.command.presentation.echo) {
                    if (needsFolderQualification && workspaceFolder) {
                        shellLaunchConfig.initialText = this.taskShellIntegrationStartSequence(cwd) + (0, terminalStrings_1.$zKb)(nls.localize(5, null, workspaceFolder.name, commandLine), { excludeLeadingNewLine: true }) + this.taskShellIntegrationOutputSequence;



                    }
                    else {
                        shellLaunchConfig.initialText = this.taskShellIntegrationStartSequence(cwd) + (0, terminalStrings_1.$zKb)(nls.localize(6, null, commandLine), { excludeLeadingNewLine: true }) + this.taskShellIntegrationOutputSequence;



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
                    ? await this.Qb(variableResolver, await this.Qb(variableResolver, '${' + $FXb.b + '}'))
                    : commandExecutable;
                // When we have a process task there is no need to quote arguments. So we go ahead and take the string value.
                shellLaunchConfig = {
                    name: terminalName,
                    type,
                    icon: task.configurationProperties.icon?.id ? themables_1.ThemeIcon.fromId(task.configurationProperties.icon.id) : undefined,
                    color: task.configurationProperties.icon?.color || undefined,
                    executable: executable,
                    args: args.map(a => Types.$jf(a) ? a : a.value),
                    waitOnExit
                };
                if (task.command.presentation && task.command.presentation.echo) {
                    const getArgsToEcho = (args) => {
                        if (!args || args.length === 0) {
                            return '';
                        }
                        if (Types.$jf(args)) {
                            return args;
                        }
                        return args.join(' ');
                    };
                    if (needsFolderQualification && workspaceFolder) {
                        shellLaunchConfig.initialText = this.taskShellIntegrationStartSequence(cwd) + (0, terminalStrings_1.$zKb)(nls.localize(7, null, workspaceFolder.name, `${shellLaunchConfig.executable} ${getArgsToEcho(shellLaunchConfig.args)}`), { excludeLeadingNewLine: true }) + this.taskShellIntegrationOutputSequence;



                    }
                    else {
                        shellLaunchConfig.initialText = this.taskShellIntegrationStartSequence(cwd) + (0, terminalStrings_1.$zKb)(nls.localize(8, null, `${shellLaunchConfig.executable} ${getArgsToEcho(shellLaunchConfig.args)}`), { excludeLeadingNewLine: true }) + this.taskShellIntegrationOutputSequence;



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
        Ab(shellCommandArgs, configuredShellArgs) {
            const combinedShellArgs = Objects.$Vm(configuredShellArgs);
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
        async Bb(task) {
            if (!this.J) {
                return;
            }
            for (let i = 0; i < this.J.length; i++) {
                const terminal = this.J[i];
                if (getReconnectionData(terminal)?.lastTask === task.getCommonTaskId()) {
                    this.J.splice(i, 1);
                    return terminal;
                }
            }
            return undefined;
        }
        async Cb(task, group, launchConfigs) {
            const reconnectedTerminal = await this.Bb(task);
            const onDisposed = (terminal) => this.ib(tasks_1.TaskEvent.terminated(task, terminal.instanceId, terminal.exitReason));
            if (reconnectedTerminal) {
                if ('command' in task && task.command.presentation) {
                    reconnectedTerminal.waitOnExit = getWaitOnExitValue(task.command.presentation, task.configurationProperties);
                }
                reconnectedTerminal.onDisposed(onDisposed);
                this.bb.trace('reconnected to task and terminal', task._id);
                return reconnectedTerminal;
            }
            if (group) {
                // Try to find an existing terminal to split.
                // Even if an existing terminal is found, the split can fail if the terminal width is too small.
                for (const terminal of Object.values(this.j)) {
                    if (terminal.group === group) {
                        this.bb.trace(`Found terminal to split for group ${group}`);
                        const originalInstance = terminal.terminal;
                        const result = await this.L.createTerminal({ location: { parentTerminal: originalInstance }, config: launchConfigs });
                        result.onDisposed(onDisposed);
                        if (result) {
                            return result;
                        }
                    }
                }
                this.bb.trace(`No terminal found to split for group ${group}`);
            }
            // Either no group is used, no terminal with the group exists or splitting an existing terminal failed.
            const createdTerminal = await this.L.createTerminal({ config: launchConfigs });
            createdTerminal.onDisposed(onDisposed);
            return createdTerminal;
        }
        Db() {
            if (this.H) {
                this.bb.trace(`Already reconnected, to ${this.J?.length} terminals so returning`);
                return;
            }
            this.J = this.L.getReconnectedTerminals(ReconnectionType)?.filter(t => !t.isDisposed && getReconnectionData(t)) || [];
            this.bb.trace(`Attempting reconnection of ${this.J?.length} terminals`);
            if (!this.J?.length) {
                this.bb.trace(`No terminals to reconnect to so returning`);
            }
            else {
                for (const terminal of this.J) {
                    const data = getReconnectionData(terminal);
                    if (data) {
                        const terminalData = { lastTask: data.lastTask, group: data.group, terminal };
                        this.j[terminal.instanceId] = terminalData;
                        this.bb.trace('Reconnecting to task terminal', terminalData.lastTask, terminal.instanceId);
                    }
                }
            }
            this.H = true;
        }
        Eb(terminal, terminalData) {
            delete this.j[terminal.instanceId];
            delete this.n[terminalData.lastTask];
            this.m.delete(terminalData.lastTask);
            // Delete the task now as a work around for cases when the onExit isn't fired.
            // This can happen if the terminal wasn't shutdown with an "immediate" flag and is expected.
            // For correct terminal re-use, the task needs to be deleted immediately.
            // Note that this shouldn't be a problem anymore since user initiated terminal kills are now immediate.
            const mapKey = terminalData.lastTask;
            this.hb(mapKey);
            if (this.h[mapKey]) {
                delete this.h[mapKey];
            }
        }
        async Fb(task, resolver, workspaceFolder) {
            const platform = resolver.taskSystemInfo ? resolver.taskSystemInfo.platform : Platform.$t;
            const options = await this.Rb(resolver, task.command.options);
            const presentationOptions = task.command.presentation;
            if (!presentationOptions) {
                throw new Error('Task presentation options should not be undefined here.');
            }
            const waitOnExit = getWaitOnExitValue(presentationOptions, task.configurationProperties);
            let command;
            let args;
            let launchConfigs;
            if (task.command.runtime === tasks_1.RuntimeType.CustomExecution) {
                this.y.shellLaunchConfig = launchConfigs = {
                    customPtyImplementation: (id, cols, rows) => new terminalProcessExtHostProxy_1.$Tkb(id, cols, rows, this.L),
                    waitOnExit,
                    name: this.yb(task),
                    initialText: task.command.presentation && task.command.presentation.echo ? (0, terminalStrings_1.$zKb)(nls.localize(9, null, task._label), { excludeLeadingNewLine: true }) : undefined,



                    isFeatureTerminal: true,
                    icon: task.configurationProperties.icon?.id ? themables_1.ThemeIcon.fromId(task.configurationProperties.icon.id) : undefined,
                    color: task.configurationProperties.icon?.color || undefined
                };
            }
            else {
                const resolvedResult = await this.Nb(resolver, task.command);
                command = resolvedResult.command;
                args = resolvedResult.args;
                this.y.shellLaunchConfig = launchConfigs = await this.zb(task, workspaceFolder, resolver, platform, options, command, args, waitOnExit);
                if (launchConfigs === undefined) {
                    return [undefined, new taskSystem_1.$hsb(severity_1.default.Error, nls.localize(10, null), 7 /* TaskErrors.UnknownError */)];
                }
            }
            const prefersSameTerminal = presentationOptions.panel === tasks_1.PanelKind.Dedicated;
            const allowsSharedTerminal = presentationOptions.panel === tasks_1.PanelKind.Shared;
            const group = presentationOptions.group;
            const taskKey = task.getMapKey();
            let terminalToReuse;
            if (prefersSameTerminal) {
                const terminalId = this.n[taskKey];
                if (terminalId) {
                    terminalToReuse = this.j[terminalId];
                    delete this.n[taskKey];
                }
            }
            else if (allowsSharedTerminal) {
                // Always allow to reuse the terminal previously used by the same task.
                let terminalId = this.m.remove(taskKey);
                if (!terminalId) {
                    // There is no idle terminal which was used by the same task.
                    // Search for any idle terminal used previously by a task of the same group
                    // (or, if the task has no group, a terminal used by a task without group).
                    for (const taskId of this.m.keys()) {
                        const idleTerminalId = this.m.get(taskId);
                        if (idleTerminalId && this.j[idleTerminalId] && this.j[idleTerminalId].group === group) {
                            terminalId = this.m.remove(taskId);
                            break;
                        }
                    }
                }
                if (terminalId) {
                    terminalToReuse = this.j[terminalId];
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
                this.j[terminalToReuse.terminal.instanceId.toString()].lastTask = taskKey;
                return [terminalToReuse.terminal, undefined];
            }
            this.G = this.G.then(() => this.Cb(task, group, launchConfigs));
            const terminal = (await this.G);
            if (task.configurationProperties.isBackground) {
                terminal.shellLaunchConfig.reconnectionProperties = { ownerId: ReconnectionType, data: { lastTask: task.getCommonTaskId(), group, label: task._label, id: task._id } };
            }
            const terminalKey = terminal.instanceId.toString();
            const terminalData = { terminal: terminal, lastTask: taskKey, group };
            terminal.onDisposed(() => this.Eb(terminal, terminalData));
            this.j[terminalKey] = terminalData;
            return [terminal, undefined];
        }
        Gb(platform, shellExecutable, shellOptions, command, originalCommand, args) {
            const basename = path.$de(shellExecutable).name.toLowerCase();
            const shellQuoteOptions = this.Hb(basename, shellOptions, platform);
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
                    if (Types.$jf(shellQuoteOptions.escape)) {
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
                if (Types.$jf(value)) {
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
            if ((!args || args.length === 0) && Types.$jf(command) && (command === originalCommand || needsQuotes(originalCommand))) {
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
        Hb(shellBasename, shellOptions, platform) {
            if (shellOptions && shellOptions.quoting) {
                return shellOptions.quoting;
            }
            return $FXb.c[shellBasename] || $FXb.f[Platform.$h(platform)];
        }
        Ib(variables, task) {
            if (task.command && task.command.name) {
                this.Kb(variables, task.command, task);
            }
            this.Lb(variables, task.configurationProperties.problemMatchers);
            if (task.command.runtime === tasks_1.RuntimeType.CustomExecution && (tasks_1.$eG.is(task) || tasks_1.$gG.is(task))) {
                let definition;
                if (tasks_1.$eG.is(task)) {
                    definition = task._source.config.element;
                }
                else {
                    definition = Objects.$Vm(task.defines);
                    delete definition._key;
                    delete definition.type;
                }
                this.Jb(variables, definition);
            }
        }
        Jb(variables, definition) {
            if (Types.$jf(definition)) {
                this.Mb(variables, definition);
            }
            else if (Array.isArray(definition)) {
                definition.forEach((element) => this.Jb(variables, element));
            }
            else if (Types.$lf(definition)) {
                for (const key in definition) {
                    this.Jb(variables, definition[key]);
                }
            }
        }
        Kb(variables, command, task) {
            // The custom execution should have everything it needs already as it provided
            // the callback.
            if (command.runtime === tasks_1.RuntimeType.CustomExecution) {
                return;
            }
            if (command.name === undefined) {
                throw new Error('Command name should never be undefined here.');
            }
            this.Mb(variables, command.name);
            command.args?.forEach(arg => this.Mb(variables, arg));
            // Try to get a scope.
            const scope = task._source.scope;
            if (scope !== 1 /* TaskScope.Global */) {
                variables.add('${workspaceFolder}');
            }
            if (command.options) {
                const options = command.options;
                if (options.cwd) {
                    this.Mb(variables, options.cwd);
                }
                const optionsEnv = options.env;
                if (optionsEnv) {
                    Object.keys(optionsEnv).forEach((key) => {
                        const value = optionsEnv[key];
                        if (Types.$jf(value)) {
                            this.Mb(variables, value);
                        }
                    });
                }
                if (options.shell) {
                    if (options.shell.executable) {
                        this.Mb(variables, options.shell.executable);
                    }
                    options.shell.args?.forEach(arg => this.Mb(variables, arg));
                }
            }
        }
        Lb(variables, values) {
            if (values === undefined || values === null || values.length === 0) {
                return;
            }
            values.forEach((value) => {
                let matcher;
                if (Types.$jf(value)) {
                    if (value[0] === '$') {
                        matcher = problemMatcher_1.$0F.get(value.substring(1));
                    }
                    else {
                        matcher = problemMatcher_1.$0F.get(value);
                    }
                }
                else {
                    matcher = value;
                }
                if (matcher && matcher.filePrefix) {
                    if (Types.$jf(matcher.filePrefix)) {
                        this.Mb(variables, matcher.filePrefix);
                    }
                    else {
                        for (const fp of [...(0, arrays_1.$1b)(matcher.filePrefix.include || []), ...(0, arrays_1.$1b)(matcher.filePrefix.exclude || [])]) {
                            this.Mb(variables, fp);
                        }
                    }
                }
            });
        }
        Mb(variables, value) {
            const string = Types.$jf(value) ? value : value.value;
            const r = /\$\{(.*?)\}/g;
            let matches;
            do {
                matches = r.exec(string);
                if (matches) {
                    variables.add(matches[0]);
                }
            } while (matches);
        }
        async Nb(resolver, commandConfig) {
            // First we need to use the command args:
            let args = commandConfig.args ? commandConfig.args.slice() : [];
            args = await this.Ob(resolver, args);
            const command = await this.Qb(resolver, commandConfig.name);
            return { command, args };
        }
        async Ob(resolver, value) {
            return Promise.all(value.map(s => this.Qb(resolver, s)));
        }
        async Pb(resolver, values) {
            if (values === undefined || values === null || values.length === 0) {
                return [];
            }
            const result = [];
            for (const value of values) {
                let matcher;
                if (Types.$jf(value)) {
                    if (value[0] === '$') {
                        matcher = problemMatcher_1.$0F.get(value.substring(1));
                    }
                    else {
                        matcher = problemMatcher_1.$0F.get(value);
                    }
                }
                else {
                    matcher = value;
                }
                if (!matcher) {
                    this.Sb(nls.localize(11, null));
                    continue;
                }
                const taskSystemInfo = resolver.taskSystemInfo;
                const hasFilePrefix = matcher.filePrefix !== undefined;
                const hasUriProvider = taskSystemInfo !== undefined && taskSystemInfo.uriProvider !== undefined;
                if (!hasFilePrefix && !hasUriProvider) {
                    result.push(matcher);
                }
                else {
                    const copy = Objects.$Vm(matcher);
                    if (hasUriProvider && (taskSystemInfo !== undefined)) {
                        copy.uriProvider = taskSystemInfo.uriProvider;
                    }
                    if (hasFilePrefix) {
                        const filePrefix = copy.filePrefix;
                        if (Types.$jf(filePrefix)) {
                            copy.filePrefix = await this.Qb(resolver, filePrefix);
                        }
                        else if (filePrefix !== undefined) {
                            if (filePrefix.include) {
                                filePrefix.include = Array.isArray(filePrefix.include)
                                    ? await Promise.all(filePrefix.include.map(x => this.Qb(resolver, x)))
                                    : await this.Qb(resolver, filePrefix.include);
                            }
                            if (filePrefix.exclude) {
                                filePrefix.exclude = Array.isArray(filePrefix.exclude)
                                    ? await Promise.all(filePrefix.exclude.map(x => this.Qb(resolver, x)))
                                    : await this.Qb(resolver, filePrefix.exclude);
                            }
                        }
                    }
                    result.push(copy);
                }
            }
            return result;
        }
        async Qb(resolver, value) {
            // TODO@Dirk Task.getWorkspaceFolder should return a WorkspaceFolder that is defined in workspace.ts
            if (Types.$jf(value)) {
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
        async Rb(resolver, options) {
            if (options === undefined || options === null) {
                let cwd;
                try {
                    cwd = await this.Qb(resolver, '${workspaceFolder}');
                }
                catch (e) {
                    // No workspace
                }
                return { cwd };
            }
            const result = Types.$jf(options.cwd)
                ? { cwd: await this.Qb(resolver, options.cwd) }
                : { cwd: await this.Qb(resolver, '${workspaceFolder}') };
            if (options.env) {
                result.env = Object.create(null);
                for (const key of Object.keys(options.env)) {
                    const value = options.env[key];
                    if (Types.$jf(value)) {
                        result.env[key] = await this.Qb(resolver, value);
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
            if ($FXb.WellKnownCommands[result]) {
                return result;
            }
            return 'other';
        }
        Sb(output) {
            const outputChannel = this.N.getChannel(this.X);
            outputChannel?.append(output);
        }
    }
    exports.$FXb = $FXb;
    function getWaitOnExitValue(presentationOptions, configurationProperties) {
        if ((presentationOptions.close === undefined) || (presentationOptions.close === false)) {
            if ((presentationOptions.reveal !== tasks_1.RevealKind.Never) || !configurationProperties.isBackground || (presentationOptions.close === false)) {
                if (presentationOptions.panel === tasks_1.PanelKind.New) {
                    return taskShellIntegrationWaitOnExitSequence(nls.localize(12, null));
                }
                else if (presentationOptions.showReuseMessage) {
                    return taskShellIntegrationWaitOnExitSequence(nls.localize(13, null));
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
            return `${(0, terminalEscapeSequences_1.$DXb)("D" /* VSCodeOscPt.CommandFinished */, exitCode.toString())}${message}`;
        };
    }
    function getReconnectionData(terminal) {
        return terminal.shellLaunchConfig.attachPersistentProcess?.reconnectionProperties?.data;
    }
});
//# sourceMappingURL=terminalTaskSystem.js.map