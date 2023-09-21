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
define(["require", "exports", "vs/base/common/actions", "vs/base/common/event", "vs/base/common/glob", "vs/base/common/json", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/objects", "vs/base/common/parsers", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/severity", "vs/base/common/types", "vs/base/common/uri", "vs/base/common/uuid", "vs/nls!vs/workbench/contrib/tasks/browser/abstractTaskService", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/files/common/files", "vs/platform/markers/common/markers", "vs/platform/progress/common/progress", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/workbench/contrib/tasks/common/problemMatcher", "vs/workbench/services/extensions/common/extensions", "vs/platform/dialogs/common/dialogs", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/editor/common/services/model", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/markers/common/markers", "vs/workbench/services/configurationResolver/common/configurationResolver", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/output/common/output", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/contrib/tasks/common/tasks", "vs/workbench/contrib/tasks/common/taskService", "vs/workbench/contrib/tasks/common/taskSystem", "vs/workbench/contrib/tasks/common/taskTemplates", "../common/taskConfiguration", "./terminalTaskSystem", "vs/platform/quickinput/common/quickInput", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/tasks/common/taskDefinitionRegistry", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/functional", "vs/base/common/jsonFormatter", "vs/base/common/network", "vs/base/common/themables", "vs/editor/common/services/resolverService", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/terminal/common/terminal", "vs/platform/theme/common/themeService", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/common/contextkeys", "vs/workbench/common/editor", "vs/workbench/common/views", "vs/workbench/contrib/tasks/browser/taskQuickPick", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/workbench/services/path/common/pathService", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/remote/common/remoteAgentService"], function (require, exports, actions_1, event_1, glob, json, lifecycle_1, map_1, Objects, parsers_1, Platform, resources, severity_1, Types, uri_1, UUID, nls, commands_1, configuration_1, files_1, markers_1, progress_1, storage_1, telemetry_1, problemMatcher_1, extensions_1, dialogs_1, notification_1, opener_1, model_1, workspace_1, markers_2, configurationResolver_1, editorService_1, output_1, textfiles_1, terminal_1, terminal_2, tasks_1, taskService_1, taskSystem_1, taskTemplates_1, TaskConfig, terminalTaskSystem_1, quickInput_1, contextkey_1, taskDefinitionRegistry_1, async_1, cancellation_1, functional_1, jsonFormatter_1, network_1, themables_1, resolverService_1, instantiation_1, log_1, terminal_3, themeService_1, workspaceTrust_1, contextkeys_1, editor_1, views_1, taskQuickPick_1, environmentService_1, lifecycle_2, panecomposite_1, pathService_1, preferences_1, remoteAgentService_1) {
    "use strict";
    var $LXb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$LXb = exports.ConfigureTaskAction = void 0;
    const QUICKOPEN_HISTORY_LIMIT_CONFIG = 'task.quickOpen.history';
    const PROBLEM_MATCHER_NEVER_CONFIG = 'task.problemMatchers.neverPrompt';
    const USE_SLOW_PICKER = 'task.quickOpen.showAll';
    var ConfigureTaskAction;
    (function (ConfigureTaskAction) {
        ConfigureTaskAction.ID = 'workbench.action.tasks.configureTaskRunner';
        ConfigureTaskAction.TEXT = nls.localize(0, null);
    })(ConfigureTaskAction || (exports.ConfigureTaskAction = ConfigureTaskAction = {}));
    class ProblemReporter {
        constructor(d) {
            this.d = d;
            this.c = new parsers_1.$yF();
        }
        info(message) {
            this.c.state = 1 /* ValidationState.Info */;
            this.d.append(message + '\n');
        }
        warn(message) {
            this.c.state = 2 /* ValidationState.Warning */;
            this.d.append(message + '\n');
        }
        error(message) {
            this.c.state = 3 /* ValidationState.Error */;
            this.d.append(message + '\n');
        }
        fatal(message) {
            this.c.state = 4 /* ValidationState.Fatal */;
            this.d.append(message + '\n');
        }
        get status() {
            return this.c;
        }
    }
    class TaskMap {
        constructor() {
            this.c = new Map();
        }
        forEach(callback) {
            this.c.forEach(callback);
        }
        static getKey(workspaceFolder) {
            let key;
            if (Types.$jf(workspaceFolder)) {
                key = workspaceFolder;
            }
            else {
                const uri = (0, taskQuickPick_1.$IXb)(workspaceFolder) ? workspaceFolder.uri : workspaceFolder.configuration;
                key = uri ? uri.toString() : '';
            }
            return key;
        }
        get(workspaceFolder) {
            const key = TaskMap.getKey(workspaceFolder);
            let result = this.c.get(key);
            if (!result) {
                result = [];
                this.c.set(key, result);
            }
            return result;
        }
        add(workspaceFolder, ...task) {
            const key = TaskMap.getKey(workspaceFolder);
            let values = this.c.get(key);
            if (!values) {
                values = [];
                this.c.set(key, values);
            }
            values.push(...task);
        }
        all() {
            const result = [];
            this.c.forEach((values) => result.push(...values));
            return result;
        }
    }
    let $LXb = class $LXb extends lifecycle_1.$kc {
        static { $LXb_1 = this; }
        // private static autoDetectTelemetryName: string = 'taskServer.autoDetect';
        static { this.c = 'workbench.tasks.recentlyUsedTasks'; }
        static { this.g = 'workbench.tasks.recentlyUsedTasks2'; }
        static { this.h = 'workbench.tasks.persistentTasks'; }
        static { this.j = 'workbench.tasks.ignoreTask010Shown'; }
        static { this.OutputChannelId = 'tasks'; }
        static { this.OutputChannelLabel = nls.localize(1, null); }
        static { this.m = 0; }
        get isReconnected() { return this.n; }
        constructor(Z, $, ab, bb, cb, db, eb, fb, gb, hb, ib, jb, kb, lb, mb, nb, ob, pb, qb, rb, sb, tb, ub, vb, wb, xb, yb, zb, Ab, Bb, Cb, Db, Eb, Fb, remoteAgentService, Gb) {
            super();
            this.Z = Z;
            this.$ = $;
            this.ab = ab;
            this.bb = bb;
            this.cb = cb;
            this.db = db;
            this.eb = eb;
            this.fb = fb;
            this.gb = gb;
            this.hb = hb;
            this.ib = ib;
            this.jb = jb;
            this.kb = kb;
            this.lb = lb;
            this.mb = mb;
            this.nb = nb;
            this.ob = ob;
            this.pb = pb;
            this.qb = qb;
            this.rb = rb;
            this.sb = sb;
            this.tb = tb;
            this.ub = ub;
            this.vb = vb;
            this.wb = wb;
            this.xb = xb;
            this.yb = yb;
            this.zb = zb;
            this.Ab = Ab;
            this.Bb = Bb;
            this.Cb = Cb;
            this.Db = Db;
            this.Eb = Eb;
            this.Fb = Fb;
            this.Gb = Gb;
            this.n = false;
            this.J = [];
            this.S = new event_1.$fd();
            this.U = new event_1.$fd();
            this.W = new event_1.$fd();
            this.X = false;
            this.onDidChangeTaskSystemInfo = this.W.event;
            this.Y = new event_1.$fd();
            this.onDidReconnectToTasks = this.Y.event;
            this.H = event_1.Event.toPromise(this.onDidChangeTaskSystemInfo);
            this.G = undefined;
            this.I = undefined;
            this.J = undefined;
            this.P = this.ab.getChannel($LXb_1.OutputChannelId);
            this.C = new Map();
            this.D = new Map();
            this.F = new Map();
            this.B(this.gb.onDidChangeWorkspaceFolders(() => {
                const folderSetup = this.Yc();
                if (this.Mb !== folderSetup[2]) {
                    this.Tb();
                    this.I = undefined;
                }
                this.Rb(folderSetup);
                return this.Mc(2 /* TaskRunSource.FolderOpen */);
            }));
            this.B(this.Z.onDidChangeConfiguration((e) => {
                if (!e.affectsConfiguration('tasks') || (!this.I && !this.G)) {
                    return;
                }
                if (!this.I || this.I instanceof terminalTaskSystem_1.$FXb) {
                    this.P.clear();
                }
                this.cc();
                return this.Mc(3 /* TaskRunSource.ConfigurationChange */);
            }));
            this.O = tasks_1.$aG.bindTo(ub);
            this.Q = this.B(new event_1.$fd());
            this.Jb().then(() => taskService_1.$ksb.bindTo(this.ub).set(true));
            taskService_1.$msb.bindTo(this.ub).set(Platform.$o && !remoteAgentService.getConnection()?.remoteAuthority);
            this.mb.contributeVariable('defaultBuildTask', async () => {
                let tasks = await this.sc(tasks_1.TaskGroup.Build);
                if (tasks.length > 0) {
                    const defaults = this.pd(tasks);
                    if (defaults.length === 1) {
                        return defaults[0]._label;
                    }
                    else if (defaults.length) {
                        tasks = defaults;
                    }
                }
                let entry;
                if (tasks && tasks.length > 0) {
                    entry = await this.fd(tasks, nls.localize(2, null));
                }
                const task = entry ? entry.task : undefined;
                if (!task) {
                    return undefined;
                }
                return task._label;
            });
            this.Fb.onBeforeShutdown(e => {
                this.X = e.reason !== 3 /* ShutdownReason.RELOAD */;
            });
            this.B(this.onDidStateChange(e => {
                if (e.kind === "changed" /* TaskEventKind.Changed */) {
                    // no-op
                }
                else if ((this.X || (e.kind === "terminated" /* TaskEventKind.Terminated */ && e.exitReason === terminal_3.TerminalExitReason.User)) && e.taskId) {
                    this.removePersistentTask(e.taskId);
                }
                else if (e.kind === "start" /* TaskEventKind.Start */ && e.__task && e.__task.getWorkspaceFolder()) {
                    this.fc(e.__task);
                }
            }));
            this.R = new Promise(resolve => {
                (0, functional_1.$bb)(this.U.event)(() => resolve());
            });
            if (this.nb.getReconnectedTerminals('Task')?.length) {
                this.Hb();
            }
            else {
                this.nb.whenConnected.then(() => {
                    if (this.nb.getReconnectedTerminals('Task')?.length) {
                        this.Hb();
                    }
                    else {
                        this.n = true;
                        this.Y.fire();
                    }
                });
            }
            this.Hd();
        }
        registerSupportedExecutions(custom, shell, process) {
            if (custom !== undefined) {
                const customContext = taskService_1.$isb.bindTo(this.ub);
                customContext.set(custom);
            }
            const isVirtual = !!contextkeys_1.$Wcb.getValue(this.ub);
            if (shell !== undefined) {
                const shellContext = taskService_1.$jsb.bindTo(this.ub);
                shellContext.set(shell && !isVirtual);
            }
            if (process !== undefined) {
                const processContext = taskService_1.$lsb.bindTo(this.ub);
                processContext.set(process && !isVirtual);
            }
            // update tasks so an incomplete list isn't returned when getWorkspaceTasks is called
            this.G = undefined;
            this.S.fire();
            if (custom && shell && process) {
                this.U.fire();
            }
        }
        Hb() {
            if (this.Fb.startupKind !== 3 /* StartupKind.ReloadedWindow */) {
                this.n = true;
                this.pb.remove($LXb_1.h, 1 /* StorageScope.WORKSPACE */);
            }
            if (!this.Z.getValue("task.reconnection" /* TaskSettingId.Reconnection */) || this.n) {
                this.n = true;
                return;
            }
            this.getWorkspaceTasks(4 /* TaskRunSource.Reconnect */).then(async () => {
                this.n = await this.Ib();
                this.Y.fire();
            });
        }
        async Ib() {
            const tasks = await this.getSavedTasks('persistent');
            if (!tasks.length) {
                return true;
            }
            for (const task of tasks) {
                if (tasks_1.$fG.is(task)) {
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
            return this.Q.event;
        }
        get supportsMultipleTaskExecutions() {
            return this.inTerminal();
        }
        async Jb() {
            commands_1.$Gr.registerCommand({
                id: 'workbench.action.tasks.runTask',
                handler: async (accessor, arg) => {
                    if (await this.kd()) {
                        await this.ld(arg);
                    }
                },
                description: {
                    description: 'Run Task',
                    args: [{
                            name: 'args',
                            isOptional: true,
                            description: nls.localize(3, null),
                            schema: {
                                anyOf: [
                                    {
                                        type: 'string',
                                        description: nls.localize(4, null)
                                    },
                                    {
                                        type: 'object',
                                        properties: {
                                            type: {
                                                type: 'string',
                                                description: nls.localize(5, null)
                                            },
                                            task: {
                                                type: 'string',
                                                description: nls.localize(6, null)
                                            }
                                        }
                                    }
                                ]
                            }
                        }]
                }
            });
            commands_1.$Gr.registerCommand('workbench.action.tasks.reRunTask', async (accessor, arg) => {
                if (await this.kd()) {
                    this.od();
                }
            });
            commands_1.$Gr.registerCommand('workbench.action.tasks.restartTask', async (accessor, arg) => {
                if (await this.kd()) {
                    this.ud(arg);
                }
            });
            commands_1.$Gr.registerCommand('workbench.action.tasks.terminate', async (accessor, arg) => {
                if (await this.kd()) {
                    this.td(arg);
                }
            });
            commands_1.$Gr.registerCommand('workbench.action.tasks.showLog', () => {
                this.Sb();
            });
            commands_1.$Gr.registerCommand('workbench.action.tasks.build', async () => {
                if (await this.kd()) {
                    this.rd();
                }
            });
            commands_1.$Gr.registerCommand('workbench.action.tasks.test', async () => {
                if (await this.kd()) {
                    this.sd();
                }
            });
            commands_1.$Gr.registerCommand('workbench.action.tasks.configureTaskRunner', async () => {
                if (await this.kd()) {
                    this.Cd();
                }
            });
            commands_1.$Gr.registerCommand('workbench.action.tasks.configureDefaultBuildTask', async () => {
                if (await this.kd()) {
                    this.Dd();
                }
            });
            commands_1.$Gr.registerCommand('workbench.action.tasks.configureDefaultTestTask', async () => {
                if (await this.kd()) {
                    this.Ed();
                }
            });
            commands_1.$Gr.registerCommand('workbench.action.tasks.showTasks', async () => {
                if (await this.kd()) {
                    return this.runShowTasks();
                }
            });
            commands_1.$Gr.registerCommand('workbench.action.tasks.toggleProblems', () => this.db.executeCommand(markers_2.Markers.TOGGLE_MARKERS_VIEW_ACTION_ID));
            commands_1.$Gr.registerCommand('workbench.action.tasks.openUserTasks', async () => {
                const resource = this.yc(tasks_1.TaskSourceKind.User);
                if (resource) {
                    this.xd(resource, tasks_1.TaskSourceKind.User);
                }
            });
            commands_1.$Gr.registerCommand('workbench.action.tasks.openWorkspaceFileTasks', async () => {
                const resource = this.yc(tasks_1.TaskSourceKind.WorkspaceFile);
                if (resource) {
                    this.xd(resource, tasks_1.TaskSourceKind.WorkspaceFile);
                }
            });
        }
        get Kb() {
            if (!this.u) {
                this.Rb();
            }
            return this.u;
        }
        get Lb() {
            if (!this.y) {
                this.Rb();
            }
            return this.y;
        }
        get Mb() {
            if (this.s === undefined) {
                this.Rb();
            }
            return this.s;
        }
        get Nb() {
            if (this.r === undefined) {
                this.Rb();
            }
            return this.r;
        }
        get Ob() {
            if (this.z === undefined) {
                this.z = !this.pb.getBoolean($LXb_1.j, 1 /* StorageScope.WORKSPACE */, false);
            }
            return this.z;
        }
        Pb(type) {
            const result = [];
            result.push('onCommand:workbench.action.tasks.runTask');
            if (type) {
                // send a specific activation event for this task type
                result.push(`onTaskType:${type}`);
            }
            else {
                // send activation events for all task types
                for (const definition of taskDefinitionRegistry_1.$$F.all()) {
                    result.push(`onTaskType:${definition.taskType}`);
                }
            }
            return result;
        }
        async Qb(type) {
            // We need to first wait for extensions to be registered because we might read
            // the `TaskDefinitionRegistry` in case `type` is `undefined`
            await this.kb.whenInstalledExtensionsRegistered();
            await (0, async_1.$yg)(Promise.all(this.Pb(type).map(activationEvent => this.kb.activateByEvent(activationEvent))), 5000, () => console.warn('Timed out activating extensions for task providers'));
        }
        Rb(setup) {
            if (!setup) {
                setup = this.Yc();
            }
            this.u = setup[0];
            if (this.y) {
                if (this.y.length !== setup[1].length) {
                    this.z = undefined;
                }
                else {
                    const set = new Set();
                    this.y.forEach(folder => set.add(folder.uri.toString()));
                    for (const folder of setup[1]) {
                        if (!set.has(folder.uri.toString())) {
                            this.z = undefined;
                            break;
                        }
                    }
                }
            }
            this.y = setup[1];
            this.s = setup[2];
            this.r = setup[3];
            this.w = setup[4];
        }
        Sb(runSource = 1 /* TaskRunSource.User */) {
            if (!contextkeys_1.$Wcb.getValue(this.ub) && ((runSource === 1 /* TaskRunSource.User */) || (runSource === 3 /* TaskRunSource.ConfigurationChange */))) {
                this.tb.prompt(severity_1.default.Warning, nls.localize(7, null), [{
                        label: nls.localize(8, null),
                        run: () => {
                            this.ab.showChannel(this.P.id, true);
                        }
                    }]);
            }
        }
        Tb() {
            if (this.J) {
                (0, lifecycle_1.$fc)(this.J);
                this.J = undefined;
            }
        }
        registerTaskProvider(provider, type) {
            if (!provider) {
                return {
                    dispose: () => { }
                };
            }
            const handle = $LXb_1.m++;
            this.C.set(handle, provider);
            this.D.set(handle, type);
            return {
                dispose: () => {
                    this.C.delete(handle);
                    this.D.delete(handle);
                }
            };
        }
        get hasTaskSystemInfo() {
            const infosCount = Array.from(this.F.values()).flat().length;
            // If there's a remoteAuthority, then we end up with 2 taskSystemInfos,
            // one for each extension host.
            if (this.vb.remoteAuthority) {
                return infosCount > 1;
            }
            return infosCount > 0;
        }
        registerTaskSystem(key, info) {
            // Ideally the Web caller of registerRegisterTaskSystem would use the correct key.
            // However, the caller doesn't know about the workspace folders at the time of the call, even though we know about them here.
            if (info.platform === 0 /* Platform.Platform.Web */) {
                key = this.Kb.length ? this.Kb[0].uri.scheme : key;
            }
            if (!this.F.has(key)) {
                this.F.set(key, [info]);
            }
            else {
                const infos = this.F.get(key);
                if (info.platform === 0 /* Platform.Platform.Web */) {
                    // Web infos should be pushed last.
                    infos.push(info);
                }
                else {
                    infos.unshift(info);
                }
            }
            if (this.hasTaskSystemInfo) {
                this.W.fire();
            }
        }
        Ub(key) {
            const infos = this.F.get(key);
            return (infos && infos.length) ? infos[0] : undefined;
        }
        extensionCallbackTaskComplete(task, result) {
            if (!this.I) {
                return Promise.resolve();
            }
            return this.I.customExecutionComplete(task, result);
        }
        /**
         * Get a subset of workspace tasks that match a certain predicate.
         */
        async Vb(predicate) {
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
        async Wb(group, isDefault) {
            return this.Vb((task) => {
                const taskGroup = task.configurationProperties.group;
                if (taskGroup && typeof taskGroup !== 'string') {
                    return (taskGroup._id === group._id && (!isDefault || !!taskGroup.isDefault));
                }
                return false;
            });
        }
        async getTask(folder, identifier, compareId = false, type = undefined) {
            if (!(await this.kd())) {
                return;
            }
            const name = Types.$jf(folder) ? folder : (0, taskQuickPick_1.$IXb)(folder) ? folder.name : folder.configuration ? resources.$fg(folder.configuration) : undefined;
            if (this.Lb.some(ignored => ignored.name === name)) {
                return Promise.reject(new Error(nls.localize(9, null, name)));
            }
            const key = !Types.$jf(identifier)
                ? tasks_1.TaskDefinition.createTaskIdentifier(identifier, console)
                : identifier;
            if (key === undefined) {
                return Promise.resolve(undefined);
            }
            // Try to find the task in the workspace
            const requestedFolder = TaskMap.getKey(folder);
            const matchedTasks = await this.Vb((task, workspaceFolder) => {
                const taskFolder = TaskMap.getKey(workspaceFolder);
                if (taskFolder !== requestedFolder && taskFolder !== tasks_1.$_F) {
                    return false;
                }
                return task.matches(key, compareId);
            });
            matchedTasks.sort(task => task._source.kind === tasks_1.TaskSourceKind.Extension ? 1 : -1);
            if (matchedTasks.length > 0) {
                // Nice, we found a configured task!
                const task = matchedTasks[0];
                if (tasks_1.$fG.is(task)) {
                    return this.tryResolveTask(task);
                }
                else {
                    return task;
                }
            }
            // We didn't find the task, so we need to ask all resolvers about it
            const map = await this.Kc({ type });
            let values = map.get(folder);
            values = values.concat(map.get(tasks_1.$_F));
            if (!values) {
                return undefined;
            }
            values = values.filter(task => task.matches(key, compareId)).sort(task => task._source.kind === tasks_1.TaskSourceKind.Extension ? 1 : -1);
            return values.length > 0 ? values[0] : undefined;
        }
        async tryResolveTask(configuringTask) {
            if (!(await this.kd())) {
                return;
            }
            await this.Qb(configuringTask.type);
            let matchingProvider;
            let matchingProviderUnavailable = false;
            for (const [handle, provider] of this.C) {
                const providerType = this.D.get(handle);
                if (configuringTask.type === providerType) {
                    if (providerType && !this.Jc(providerType)) {
                        matchingProviderUnavailable = true;
                        continue;
                    }
                    matchingProvider = provider;
                    break;
                }
            }
            if (!matchingProvider) {
                if (matchingProviderUnavailable) {
                    this.P.append(nls.localize(10, null, configuringTask.configures.type));
                }
                return;
            }
            // Try to resolve the task first
            try {
                const resolvedTask = await matchingProvider.resolveTask(configuringTask);
                if (resolvedTask && (resolvedTask._id === configuringTask._id)) {
                    return TaskConfig.$vXb(resolvedTask, configuringTask);
                }
            }
            catch (error) {
                // Ignore errors. The task could not be provided by any of the providers.
            }
            // The task couldn't be resolved. Instead, use the less efficient provideTask.
            const tasks = await this.tasks({ type: configuringTask.type });
            for (const task of tasks) {
                if (task._id === configuringTask._id) {
                    return TaskConfig.$vXb(task, configuringTask);
                }
            }
            return;
        }
        async tasks(filter) {
            if (!(await this.kd())) {
                return [];
            }
            if (!this.Xb(filter)) {
                return Promise.resolve([]);
            }
            return this.Kc(filter).then((map) => {
                if (!filter || !filter.type) {
                    return map.all();
                }
                const result = [];
                map.forEach((tasks) => {
                    for (const task of tasks) {
                        if (tasks_1.$gG.is(task) && ((task.defines.type === filter.type) || (task._source.label === filter.type))) {
                            result.push(task);
                        }
                        else if (tasks_1.$eG.is(task)) {
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
            if (this.mc()) {
                for (const definition of taskDefinitionRegistry_1.$$F.all()) {
                    if (this.Jc(definition.taskType)) {
                        types.push(definition.taskType);
                    }
                }
            }
            return types;
        }
        createSorter() {
            return new tasks_1.$iG(this.gb.getWorkspace() ? this.gb.getWorkspace().folders : []);
        }
        Yb() {
            if (!this.I) {
                return Promise.resolve(false);
            }
            return this.I.isActive();
        }
        async getActiveTasks() {
            if (!this.I) {
                return [];
            }
            return this.I.getActiveTasks();
        }
        async getBusyTasks() {
            if (!this.I) {
                return [];
            }
            return this.I.getBusyTasks();
        }
        getRecentlyUsedTasksV1() {
            if (this.L) {
                return this.L;
            }
            const quickOpenHistoryLimit = this.Z.getValue(QUICKOPEN_HISTORY_LIMIT_CONFIG);
            this.L = new map_1.$Ci(quickOpenHistoryLimit);
            const storageValue = this.pb.get($LXb_1.c, 1 /* StorageScope.WORKSPACE */);
            if (storageValue) {
                try {
                    const values = JSON.parse(storageValue);
                    if (Array.isArray(values)) {
                        for (const value of values) {
                            this.L.set(value, value);
                        }
                    }
                }
                catch (error) {
                    // Ignore. We use the empty result
                }
            }
            return this.L;
        }
        Zb(type) {
            return type === 'persistent' ? this.ac() : this.$b();
        }
        $b() {
            if (this.M) {
                return this.M;
            }
            const quickOpenHistoryLimit = this.Z.getValue(QUICKOPEN_HISTORY_LIMIT_CONFIG);
            this.M = new map_1.$Ci(quickOpenHistoryLimit);
            const storageValue = this.pb.get($LXb_1.g, 1 /* StorageScope.WORKSPACE */);
            if (storageValue) {
                try {
                    const values = JSON.parse(storageValue);
                    if (Array.isArray(values)) {
                        for (const value of values) {
                            this.M.set(value[0], value[1]);
                        }
                    }
                }
                catch (error) {
                    // Ignore. We use the empty result
                }
            }
            return this.M;
        }
        ac() {
            if (this.N) {
                return this.N;
            }
            //TODO: should this # be configurable?
            this.N = new map_1.$Ci(10);
            const storageValue = this.pb.get($LXb_1.h, 1 /* StorageScope.WORKSPACE */);
            if (storageValue) {
                try {
                    const values = JSON.parse(storageValue);
                    if (Array.isArray(values)) {
                        for (const value of values) {
                            this.N.set(value[0], value[1]);
                        }
                    }
                }
                catch (error) {
                    // Ignore. We use the empty result
                }
            }
            return this.N;
        }
        bc(key) {
            const keyValue = JSON.parse(key);
            return {
                folder: keyValue.folder, isWorkspaceFile: keyValue.id?.endsWith(tasks_1.TaskSourceKind.WorkspaceFile)
            };
        }
        async getSavedTasks(type) {
            const folderMap = Object.create(null);
            this.Kb.forEach(folder => {
                folderMap[folder.uri.toString()] = folder;
            });
            const folderToTasksMap = new Map();
            const workspaceToTaskMap = new Map();
            const storedTasks = this.Zb(type);
            const tasks = [];
            function addTaskToMap(map, folder, task) {
                if (folder && !map.has(folder)) {
                    map.set(folder, []);
                }
                if (folder && (folderMap[folder] || (folder === tasks_1.$_F)) && task) {
                    map.get(folder).push(task);
                }
            }
            for (const entry of storedTasks.entries()) {
                const key = entry[0];
                const task = JSON.parse(entry[1]);
                const folderInfo = this.bc(key);
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
                    await that.Vc(folderMap[key] ?? await that.Nc(), {
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
            if (this.Zb('historical').has(taskRecentlyUsedKey)) {
                this.Zb('historical').delete(taskRecentlyUsedKey);
                this.ec();
            }
        }
        removePersistentTask(key) {
            if (this.Zb('persistent').has(key)) {
                this.Zb('persistent').delete(key);
                this.gc();
            }
        }
        cc() {
            const quickOpenHistoryLimit = this.Z.getValue(QUICKOPEN_HISTORY_LIMIT_CONFIG);
            if (this.M) {
                this.M.limit = quickOpenHistoryLimit;
            }
        }
        async dc(task) {
            let key = task.getRecentlyUsedKey();
            if (!tasks_1.$hG.is(task) && key) {
                const customizations = this.wc(task);
                if (tasks_1.$gG.is(task) && customizations) {
                    const custom = [];
                    const customized = Object.create(null);
                    await this.Vc(task._source.workspaceFolder ?? this.Kb[0], {
                        version: '2.0.0',
                        tasks: [customizations]
                    }, 0 /* TaskRunSource.System */, custom, customized, TaskConfig.TaskConfigSource.TasksJson, true);
                    for (const configuration in customized) {
                        key = customized[configuration].getRecentlyUsedKey();
                    }
                }
                this.Zb('historical').set(key, JSON.stringify(customizations));
                this.ec();
            }
        }
        ec() {
            if (!this.M) {
                return;
            }
            const quickOpenHistoryLimit = this.Z.getValue(QUICKOPEN_HISTORY_LIMIT_CONFIG);
            // setting history limit to 0 means no LRU sorting
            if (quickOpenHistoryLimit === 0) {
                return;
            }
            let keys = [...this.M.keys()];
            if (keys.length > quickOpenHistoryLimit) {
                keys = keys.slice(0, quickOpenHistoryLimit);
            }
            const keyValues = [];
            for (const key of keys) {
                keyValues.push([key, this.M.get(key, 0 /* Touch.None */)]);
            }
            this.pb.store($LXb_1.g, JSON.stringify(keyValues), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        async fc(task) {
            if (!this.Z.getValue("task.reconnection" /* TaskSettingId.Reconnection */)) {
                return;
            }
            let key = task.getRecentlyUsedKey();
            if (!tasks_1.$hG.is(task) && key) {
                const customizations = this.wc(task);
                if (tasks_1.$gG.is(task) && customizations) {
                    const custom = [];
                    const customized = Object.create(null);
                    await this.Vc(task._source.workspaceFolder ?? this.Kb[0], {
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
                this.Zb('persistent').set(key, JSON.stringify(customizations));
                this.gc();
            }
        }
        gc() {
            if (!this.N) {
                return;
            }
            const keys = [...this.N.keys()];
            const keyValues = [];
            for (const key of keys) {
                keyValues.push([key, this.N.get(key, 0 /* Touch.None */)]);
            }
            this.pb.store($LXb_1.h, JSON.stringify(keyValues), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        hc() {
            this.rb.open(uri_1.URI.parse('https://code.visualstudio.com/docs/editor/tasks#_defining-a-problem-matcher'));
        }
        async ic(group) {
            const tasksOfGroup = await this.Wb(group, true);
            if ((tasksOfGroup.length === 1) && (typeof tasksOfGroup[0].configurationProperties.group !== 'string') && tasksOfGroup[0].configurationProperties.group?.isDefault) {
                let resolvedTask;
                if (tasks_1.$fG.is(tasksOfGroup[0])) {
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
        async jc() {
            const tryBuildShortcut = await this.ic(tasks_1.TaskGroup.Build);
            if (tryBuildShortcut) {
                return tryBuildShortcut;
            }
            return this.lc();
        }
        async kc() {
            const tryTestShortcut = await this.ic(tasks_1.TaskGroup.Test);
            if (tryTestShortcut) {
                return tryTestShortcut;
            }
            return this.lc(true);
        }
        async lc(test) {
            const tasks = await this.Kc();
            const runnable = this.Ac(tasks, test ? tasks_1.TaskGroup.Test : tasks_1.TaskGroup.Build);
            if (!runnable || !runnable.task) {
                if (test) {
                    if (this.Nb === 1 /* JsonSchemaVersion.V0_1_0 */) {
                        throw new taskSystem_1.$hsb(severity_1.default.Info, nls.localize(11, null), 3 /* TaskErrors.NoTestTask */);
                    }
                    else {
                        throw new taskSystem_1.$hsb(severity_1.default.Info, nls.localize(12, null), 3 /* TaskErrors.NoTestTask */);
                    }
                }
                else {
                    if (this.Nb === 1 /* JsonSchemaVersion.V0_1_0 */) {
                        throw new taskSystem_1.$hsb(severity_1.default.Info, nls.localize(13, null), 2 /* TaskErrors.NoBuildTask */);
                    }
                    else {
                        throw new taskSystem_1.$hsb(severity_1.default.Info, nls.localize(14, null), 2 /* TaskErrors.NoBuildTask */);
                    }
                }
            }
            let executeTaskResult;
            try {
                executeTaskResult = await this.Dc(runnable.task, runnable.resolver, 1 /* TaskRunSource.User */);
            }
            catch (error) {
                this.bd(error);
                return Promise.reject(error);
            }
            return executeTaskResult;
        }
        async run(task, options, runSource = 0 /* TaskRunSource.System */) {
            if (!(await this.kd())) {
                return;
            }
            if (!task) {
                throw new taskSystem_1.$hsb(severity_1.default.Info, nls.localize(15, null), 5 /* TaskErrors.TaskNotFound */);
            }
            const resolver = this.Bc();
            let executeTaskResult;
            try {
                if (options && options.attachProblemMatcher && this.pc(task) && !tasks_1.$hG.is(task)) {
                    const taskToExecute = await this.rc(task);
                    if (taskToExecute) {
                        executeTaskResult = await this.Dc(taskToExecute, resolver, runSource);
                    }
                }
                else {
                    executeTaskResult = await this.Dc(task, resolver, runSource);
                }
                return executeTaskResult;
            }
            catch (error) {
                this.bd(error);
                return Promise.reject(error);
            }
        }
        mc() {
            const settingValue = this.Z.getValue("task.autoDetect" /* TaskSettingId.AutoDetect */);
            return settingValue === 'on';
        }
        nc(type) {
            const settingValue = this.Z.getValue(PROBLEM_MATCHER_NEVER_CONFIG);
            if (Types.$pf(settingValue)) {
                return !settingValue;
            }
            if (type === undefined) {
                return true;
            }
            const settingValueMap = settingValue;
            return !settingValueMap[type];
        }
        oc(task) {
            let type;
            if (tasks_1.$eG.is(task)) {
                const configProperties = task._source.config.element;
                type = configProperties.type;
            }
            else {
                type = task.getDefinition().type;
            }
            return type;
        }
        pc(task) {
            const enabled = this.nc(this.oc(task));
            if (enabled === false) {
                return false;
            }
            if (!this.tc(task)) {
                return false;
            }
            if (task.configurationProperties.group !== undefined && task.configurationProperties.group !== tasks_1.TaskGroup.Build) {
                return false;
            }
            if (task.configurationProperties.problemMatchers !== undefined && task.configurationProperties.problemMatchers.length > 0) {
                return false;
            }
            if (tasks_1.$gG.is(task)) {
                return !task.hasDefinedMatchers && !!task.configurationProperties.problemMatchers && (task.configurationProperties.problemMatchers.length === 0);
            }
            if (tasks_1.$eG.is(task)) {
                const configProperties = task._source.config.element;
                return configProperties.problemMatcher === undefined && !task.hasDefinedMatchers;
            }
            return false;
        }
        async qc(type) {
            const current = this.Z.getValue(PROBLEM_MATCHER_NEVER_CONFIG);
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
            return this.Z.updateValue(PROBLEM_MATCHER_NEVER_CONFIG, newValue);
        }
        async rc(task) {
            let entries = [];
            for (const key of problemMatcher_1.$0F.keys()) {
                const matcher = problemMatcher_1.$0F.get(key);
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
            entries.unshift({ type: 'separator', label: nls.localize(16, null) });
            let taskType;
            if (tasks_1.$eG.is(task)) {
                const configProperties = task._source.config.element;
                taskType = configProperties.type;
            }
            else {
                taskType = task.getDefinition().type;
            }
            entries.unshift({ label: nls.localize(17, null), matcher: undefined }, { label: nls.localize(18, null), matcher: undefined, never: true }, { label: nls.localize(19, null, taskType), matcher: undefined, setting: taskType }, { label: nls.localize(20, null), matcher: undefined, learnMore: true });
            const problemMatcher = await this.lb.pick(entries, { placeHolder: nls.localize(21, null) });
            if (!problemMatcher) {
                return task;
            }
            if (problemMatcher.learnMore) {
                this.hc();
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
                const matcher = problemMatcher_1.$0F.get(problemMatcher.matcher.name);
                if (matcher && matcher.watching !== undefined) {
                    properties.isBackground = true;
                    newTask.configurationProperties.isBackground = true;
                }
                this.customize(task, properties, true);
                return newTask;
            }
            if (problemMatcher.setting) {
                await this.qc(problemMatcher.setting);
            }
            return task;
        }
        async sc(group) {
            const groups = await this.Kc();
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
            return this.gb.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */;
        }
        tc(task) {
            if (this.Nb !== 2 /* JsonSchemaVersion.V2_0_0 */) {
                return false;
            }
            if (tasks_1.$eG.is(task)) {
                return true;
            }
            if (tasks_1.$gG.is(task)) {
                return !!task.getWorkspaceFolder();
            }
            return false;
        }
        async uc(resource, task) {
            let reference;
            let stringValue = '';
            try {
                reference = await this.yb.createModelReference(resource);
                const model = reference.object.textEditorModel;
                const { tabSize, insertSpaces } = model.getOptions();
                const eol = model.getEOL();
                let stringified = (0, jsonFormatter_1.$yS)(task, { eol, tabSize, insertSpaces });
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
        async vc(resource, task, configIndex = -1) {
            if (resource === undefined) {
                return Promise.resolve(false);
            }
            const fileContent = await this.fb.readFile(resource);
            const content = fileContent.value;
            if (!content || !task) {
                return false;
            }
            const contentValue = content.toString();
            let stringValue;
            if (configIndex !== -1) {
                const json = this.Z.getValue('tasks', { resource });
                if (json.tasks && (json.tasks.length > configIndex)) {
                    stringValue = await this.uc(resource, json.tasks[configIndex]);
                }
            }
            if (!stringValue) {
                if (typeof task === 'string') {
                    stringValue = task;
                }
                else {
                    stringValue = await this.uc(resource, task);
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
            await this.eb.openEditor({
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
        wc(task) {
            let toCustomize;
            const taskConfig = tasks_1.$eG.is(task) || tasks_1.$fG.is(task) ? task._source.config : undefined;
            if (taskConfig && taskConfig.element) {
                toCustomize = { ...(taskConfig.element) };
            }
            else if (tasks_1.$gG.is(task)) {
                toCustomize = {};
                const identifier = Object.assign(Object.create(null), task.defines);
                delete identifier['_key'];
                Object.keys(identifier).forEach(key => toCustomize[key] = identifier[key]);
                if (task.configurationProperties.problemMatchers && task.configurationProperties.problemMatchers.length > 0 && Types.$kf(task.configurationProperties.problemMatchers)) {
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
            if (!(await this.kd())) {
                return;
            }
            const workspaceFolder = task.getWorkspaceFolder();
            if (!workspaceFolder) {
                return Promise.resolve(undefined);
            }
            const configuration = this.ad(workspaceFolder, task._source.kind);
            if (configuration.hasParseErrors) {
                this.tb.warn(nls.localize(22, null));
                return Promise.resolve(undefined);
            }
            const fileConfig = configuration.config;
            const toCustomize = this.wc(task);
            if (!toCustomize) {
                return Promise.resolve(undefined);
            }
            const index = tasks_1.$eG.is(task) ? task._source.config.index : undefined;
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
                    nls.localize(23, null),
                ].join('\n') + JSON.stringify(value, null, '\t').substr(1);
                const editorConfig = this.Z.getValue();
                if (editorConfig.editor.insertSpaces) {
                    content = content.replace(/(\n)(\t+)/g, (_, s1, s2) => s1 + ' '.repeat(s2.length * editorConfig.editor.tabSize));
                }
                await this.ib.create([{ resource: workspaceFolder.toResource('.vscode/tasks.json'), value: content }]);
            }
            else {
                // We have a global task configuration
                if ((index === -1) && properties) {
                    if (properties.problemMatcher !== undefined) {
                        fileConfig.problemMatcher = properties.problemMatcher;
                        await this.xc(workspaceFolder, 'tasks.problemMatchers', fileConfig.problemMatcher, task._source.kind);
                    }
                    else if (properties.group !== undefined) {
                        fileConfig.group = properties.group;
                        await this.xc(workspaceFolder, 'tasks.group', fileConfig.group, task._source.kind);
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
                    await this.xc(workspaceFolder, 'tasks.tasks', fileConfig.tasks, task._source.kind);
                }
            }
            if (openConfig) {
                this.vc(this.zc(task), toCustomize);
            }
        }
        xc(workspaceFolder, key, value, source) {
            let target = undefined;
            switch (source) {
                case tasks_1.TaskSourceKind.User:
                    target = 2 /* ConfigurationTarget.USER */;
                    break;
                case tasks_1.TaskSourceKind.WorkspaceFile:
                    target = 5 /* ConfigurationTarget.WORKSPACE */;
                    break;
                default: if (this.gb.getWorkbenchState() === 2 /* WorkbenchState.FOLDER */) {
                    target = 5 /* ConfigurationTarget.WORKSPACE */;
                }
                else if (this.gb.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
                    target = 6 /* ConfigurationTarget.WORKSPACE_FOLDER */;
                }
            }
            if (target) {
                return this.Z.updateValue(key, value, { resource: workspaceFolder.uri }, target);
            }
            else {
                return undefined;
            }
        }
        yc(kind) {
            this.Rb();
            switch (kind) {
                case tasks_1.TaskSourceKind.User: {
                    return resources.$ig(resources.$hg(this.zb.userSettingsResource), 'tasks.json');
                }
                case tasks_1.TaskSourceKind.WorkspaceFile: {
                    if (this.w && this.w.configuration) {
                        return this.w.configuration;
                    }
                }
                default: {
                    return undefined;
                }
            }
        }
        zc(task) {
            if (tasks_1.$eG.is(task)) {
                let uri = this.yc(task._source.kind);
                if (!uri) {
                    const taskFolder = task.getWorkspaceFolder();
                    if (taskFolder) {
                        uri = taskFolder.toResource(task._source.config.file);
                    }
                    else {
                        uri = this.Kb[0].uri;
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
                resource = this.zc(task);
            }
            else {
                resource = (this.u && (this.u.length > 0)) ? this.u[0].toResource('.vscode/tasks.json') : undefined;
            }
            return this.vc(resource, task ? task._label : undefined, task ? task._source.config.index : -1);
        }
        Ac(tasks, group) {
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
                    this.P.append(nls.localize(24, null));
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
                const id = UUID.$4f();
                const task = new tasks_1.$hG(id, { kind: tasks_1.TaskSourceKind.InMemory, label: 'inMemory' }, id, 'inMemory', { reevaluateOnRerun: true }, {
                    identifier: id,
                    dependsOn: extensionTasks.map((extensionTask) => { return { uri: extensionTask.getWorkspaceFolder().uri, task: extensionTask._id }; }),
                    name: id
                });
                return { task, resolver };
            }
        }
        Bc(grouped) {
            let resolverData;
            async function quickResolve(that, uri, identifier) {
                const foundTasks = await that.Vb((task) => {
                    const taskUri = ((tasks_1.$fG.is(task) || tasks_1.$eG.is(task)) ? task._source.config.workspaceFolder?.uri : undefined);
                    const originalUri = (typeof uri === 'string' ? uri : uri.toString());
                    if (taskUri?.toString() !== originalUri) {
                        return false;
                    }
                    if (Types.$jf(identifier)) {
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
                if (tasks_1.$fG.is(task)) {
                    return that.tryResolveTask(task);
                }
                return task;
            }
            async function getResolverData(that) {
                if (resolverData === undefined) {
                    resolverData = new Map();
                    (grouped || await that.Kc()).forEach((tasks, folder) => {
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
                if (Types.$jf(identifier)) {
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
        async Cc() {
            let SaveBeforeRunConfigOptions;
            (function (SaveBeforeRunConfigOptions) {
                SaveBeforeRunConfigOptions["Always"] = "always";
                SaveBeforeRunConfigOptions["Never"] = "never";
                SaveBeforeRunConfigOptions["Prompt"] = "prompt";
            })(SaveBeforeRunConfigOptions || (SaveBeforeRunConfigOptions = {}));
            const saveBeforeRunTaskConfig = this.Z.getValue("task.saveBeforeRun" /* TaskSettingId.SaveBeforeRun */);
            if (saveBeforeRunTaskConfig === SaveBeforeRunConfigOptions.Never) {
                return false;
            }
            else if (saveBeforeRunTaskConfig === SaveBeforeRunConfigOptions.Prompt && this.eb.editors.some(e => e.isDirty())) {
                const { confirmed } = await this.sb.confirm({
                    message: nls.localize(25, null),
                    detail: nls.localize(26, null),
                    primaryButton: nls.localize(27, null),
                    cancelButton: nls.localize(28, null),
                });
                if (!confirmed) {
                    return false;
                }
            }
            await this.eb.saveAll({ reason: 2 /* SaveReason.AUTO */ });
            return true;
        }
        async Dc(task, resolver, runSource) {
            let taskToRun = task;
            if (await this.Cc()) {
                await this.Z.reloadConfiguration();
                await this.Mc();
                const taskFolder = task.getWorkspaceFolder();
                const taskIdentifier = task.configurationProperties.identifier;
                const taskType = tasks_1.$eG.is(task) ? task.customizes()?.type : (tasks_1.$gG.is(task) ? task.type : undefined);
                // Since we save before running tasks, the task may have changed as part of the save.
                // However, if the TaskRunSource is not User, then we shouldn't try to fetch the task again
                // since this can cause a new'd task to get overwritten with a provided task.
                taskToRun = ((taskFolder && taskIdentifier && (runSource === 1 /* TaskRunSource.User */))
                    ? await this.getTask(taskFolder, taskIdentifier, false, taskType) : task) ?? task;
            }
            await problemMatcher_1.$0F.onReady();
            const executeResult = runSource === 4 /* TaskRunSource.Reconnect */ ? this.Ic().reconnect(taskToRun, resolver) : this.Ic().run(taskToRun, resolver);
            if (executeResult) {
                return this.Ec(executeResult, runSource);
            }
            return { exitCode: 0 };
        }
        async Ec(executeResult, runSource) {
            if (runSource === 1 /* TaskRunSource.User */) {
                await this.dc(executeResult.task);
            }
            if (executeResult.kind === 2 /* TaskExecuteKind.Active */) {
                const active = executeResult.active;
                if (active && active.same && runSource === 2 /* TaskRunSource.FolderOpen */ || runSource === 4 /* TaskRunSource.Reconnect */) {
                    // ignore, the task is already active, likely from being reconnected or from folder open.
                    this.Db.debug('Ignoring task that is already active', executeResult.task);
                    return executeResult.promise;
                }
                if (active && active.same) {
                    if (this.I?.isTaskVisible(executeResult.task)) {
                        const message = nls.localize(29, null, executeResult.task.getQualifiedLabel());
                        const lastInstance = this.Ic().getLastInstance(executeResult.task) ?? executeResult.task;
                        this.tb.prompt(severity_1.default.Warning, message, [{
                                label: nls.localize(30, null),
                                run: () => this.terminate(lastInstance)
                            },
                            {
                                label: nls.localize(31, null),
                                run: () => this.Fc(lastInstance)
                            }], { sticky: true });
                    }
                    else {
                        this.I?.revealTask(executeResult.task);
                    }
                }
                else {
                    throw new taskSystem_1.$hsb(severity_1.default.Warning, nls.localize(32, null), 1 /* TaskErrors.RunningTask */);
                }
            }
            this.dc(executeResult.task);
            return executeResult.promise;
        }
        async Fc(task) {
            if (!this.I) {
                return;
            }
            const response = await this.I.terminate(task);
            if (response.success) {
                try {
                    await this.run(task);
                }
                catch {
                    // eat the error, we don't care about it here
                }
            }
            else {
                this.tb.warn(nls.localize(33, null, Types.$jf(task) ? task : task.configurationProperties.name));
            }
        }
        async terminate(task) {
            if (!(await this.kd())) {
                return { success: true, task: undefined };
            }
            if (!this.I) {
                return { success: true, task: undefined };
            }
            return this.I.terminate(task);
        }
        Gc() {
            if (!this.I) {
                return Promise.resolve([]);
            }
            return this.I.terminateAll();
        }
        Hc() {
            return new terminalTaskSystem_1.$FXb(this.nb, this.ob, this.ab, this.bb, this.cb, this.$, this.jb, this.mb, this.gb, this.vb, $LXb_1.OutputChannelId, this.fb, this.wb, this.xb, this.Ab, this.Db, this.tb, this.Gb, (workspaceFolder) => {
                if (workspaceFolder) {
                    return this.Ub(workspaceFolder.uri.scheme);
                }
                else if (this.F.size > 0) {
                    const infos = Array.from(this.F.entries());
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
        Jc(type) {
            const definition = taskDefinitionRegistry_1.$$F.get(type);
            return !definition || !definition.when || this.ub.contextMatchesRules(definition.when);
        }
        async Kc(filter) {
            await this.R;
            const type = filter?.type;
            const needsRecentTasksMigration = this.gd();
            await this.Qb(filter?.type);
            const validTypes = Object.create(null);
            taskDefinitionRegistry_1.$$F.all().forEach(definition => validTypes[definition.taskType] = true);
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
                        if (error && Types.$jf(error.message)) {
                            this.P.append('Error: ');
                            this.P.append(error.message);
                            this.P.append('\n');
                            this.Sb();
                        }
                        else {
                            this.P.append('Unknown error received while collecting tasks from providers.\n');
                            this.Sb();
                        }
                    }
                    finally {
                        if (--counter === 0) {
                            resolve(result);
                        }
                    }
                };
                if (this.mc() && (this.Nb === 2 /* JsonSchemaVersion.V2_0_0 */) && (this.C.size > 0)) {
                    let foundAnyProviders = false;
                    for (const [handle, provider] of this.C) {
                        const providerType = this.D.get(handle);
                        if ((type === undefined) || (type === providerType)) {
                            if (providerType && !this.Jc(providerType)) {
                                continue;
                            }
                            foundAnyProviders = true;
                            counter++;
                            (0, async_1.$yg)(provider.provideTasks(validTypes).then((taskSet) => {
                                // Check that the tasks provided are of the correct type
                                for (const task of taskSet.tasks) {
                                    if (task.type !== this.D.get(handle)) {
                                        this.P.append(nls.localize(34, null, this.D.get(handle), task.type));
                                        if ((task.type !== 'shell') && (task.type !== 'process')) {
                                            this.Sb();
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
                    if (this.gb.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */) {
                        result.add(key, ...folderTasks.set.tasks);
                    }
                    else {
                        const configurations = folderTasks.configurations;
                        const legacyTaskConfigurations = folderTasks.set ? this.Lc(folderTasks.set) : undefined;
                        const customTasksToDelete = [];
                        if (configurations || legacyTaskConfigurations) {
                            const unUsedConfigurations = new Set();
                            if (configurations) {
                                Object.keys(configurations.byIdentifier).forEach(key => unUsedConfigurations.add(key));
                            }
                            for (const task of contributed) {
                                if (!tasks_1.$gG.is(task)) {
                                    continue;
                                }
                                if (configurations) {
                                    const configuringTask = configurations.byIdentifier[task.defines._key];
                                    if (configuringTask) {
                                        unUsedConfigurations.delete(task.defines._key);
                                        result.add(key, TaskConfig.$vXb(task, configuringTask));
                                    }
                                    else {
                                        result.add(key, task);
                                    }
                                }
                                else if (legacyTaskConfigurations) {
                                    const configuringTask = legacyTaskConfigurations[task.defines._key];
                                    if (configuringTask) {
                                        result.add(key, TaskConfig.$vXb(task, configuringTask));
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
                                for (const [handle, provider] of this.C) {
                                    const providerType = this.D.get(handle);
                                    if (configuringTask.type === providerType) {
                                        if (providerType && !this.Jc(providerType)) {
                                            requiredTaskProviderUnavailable = true;
                                            continue;
                                        }
                                        try {
                                            const resolvedTask = await provider.resolveTask(configuringTask);
                                            if (resolvedTask && (resolvedTask._id === configuringTask._id)) {
                                                result.add(key, TaskConfig.$vXb(resolvedTask, configuringTask));
                                                return;
                                            }
                                        }
                                        catch (error) {
                                            // Ignore errors. The task could not be provided by any of the providers.
                                        }
                                    }
                                }
                                if (requiredTaskProviderUnavailable) {
                                    this.P.append(nls.localize(35, null, configuringTask.configures.type));
                                }
                                else {
                                    this.P.append(nls.localize(36, null, configuringTask.configures.type, JSON.stringify(configuringTask._source.config.element, undefined, 4)));
                                    this.Sb();
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
                    await this.hd(result.all());
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
        Lc(workspaceTasks) {
            let result;
            function getResult() {
                if (result) {
                    return result;
                }
                result = Object.create(null);
                return result;
            }
            for (const task of workspaceTasks.tasks) {
                if (tasks_1.$eG.is(task)) {
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
            if (!(await this.kd())) {
                return new Map();
            }
            await (0, async_1.$yg)(this.R, 2000, () => {
                this.Db.warn('Timed out waiting for all supported executions');
            });
            await this.H;
            if (this.G) {
                return this.G;
            }
            return this.Mc(runSource);
        }
        Mc(runSource = 1 /* TaskRunSource.User */) {
            this.G = this.Oc(runSource);
            return this.G;
        }
        async Nc() {
            let folder = this.Kb.length > 0 ? this.Kb[0] : undefined;
            if (!folder) {
                const userhome = await this.xb.userHome();
                folder = new workspace_1.$Vh({ uri: userhome, name: resources.$fg(userhome), index: 0 });
            }
            return folder;
        }
        async Oc(runSource = 1 /* TaskRunSource.User */) {
            const promises = [];
            for (const folder of this.Kb) {
                promises.push(this.Qc(folder, runSource));
            }
            const values = await Promise.all(promises);
            const result = new Map();
            for (const value of values) {
                if (value) {
                    result.set(value.workspaceFolder.uri.toString(), value);
                }
            }
            const folder = await this.Nc();
            if (this.gb.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */) {
                const workspaceFileTasks = await this.Sc(folder, runSource);
                if (workspaceFileTasks && this.w && this.w.configuration) {
                    result.set(this.w.configuration.toString(), workspaceFileTasks);
                }
            }
            const userTasks = await this.Tc(folder, runSource);
            if (userTasks) {
                result.set(tasks_1.$_F, userTasks);
            }
            return result;
        }
        get Pc() {
            return taskService_1.$jsb.getValue(this.ub) === true && taskService_1.$lsb.getValue(this.ub) === true;
        }
        async Qc(workspaceFolder, runSource = 1 /* TaskRunSource.User */) {
            const workspaceFolderConfiguration = (this.s === tasks_1.ExecutionEngine.Process ? await this.Xc(workspaceFolder) : await this.Wc(workspaceFolder));
            if (!workspaceFolderConfiguration || !workspaceFolderConfiguration.config || workspaceFolderConfiguration.hasErrors) {
                return Promise.resolve({ workspaceFolder, set: undefined, configurations: undefined, hasErrors: workspaceFolderConfiguration ? workspaceFolderConfiguration.hasErrors : false });
            }
            await problemMatcher_1.$0F.onReady();
            const taskSystemInfo = this.Ub(workspaceFolder.uri.scheme);
            const problemReporter = new ProblemReporter(this.P);
            const parseResult = TaskConfig.$uXb(workspaceFolder, undefined, taskSystemInfo ? taskSystemInfo.platform : Platform.$t, workspaceFolderConfiguration.config, problemReporter, TaskConfig.TaskConfigSource.TasksJson, this.ub);
            let hasErrors = false;
            if (!parseResult.validationStatus.isOK() && (parseResult.validationStatus.state !== 1 /* ValidationState.Info */)) {
                hasErrors = true;
                this.Sb(runSource);
            }
            if (problemReporter.status.isFatal()) {
                problemReporter.fatal(nls.localize(37, null));
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
            if (!this.Pc && (parseResult.custom.length > 0)) {
                console.warn('Custom workspace tasks are not supported.');
            }
            return { workspaceFolder, set: { tasks: this.Pc ? parseResult.custom : [] }, configurations: customizedTasks, hasErrors };
        }
        Rc(config, location) {
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
                    this.P.append(nls.localize(38, null, location));
                    this.Sb();
                    return { config, hasParseErrors: true };
                }
            }
            return { config, hasParseErrors: false };
        }
        async Sc(workspaceFolder, runSource = 1 /* TaskRunSource.User */) {
            if (this.s === tasks_1.ExecutionEngine.Process) {
                return this.Uc(workspaceFolder);
            }
            const workspaceFileConfig = this.ad(workspaceFolder, tasks_1.TaskSourceKind.WorkspaceFile);
            const configuration = this.Rc(workspaceFileConfig.config, nls.localize(39, null));
            const customizedTasks = {
                byIdentifier: Object.create(null)
            };
            const custom = [];
            await this.Vc(workspaceFolder, configuration.config, runSource, custom, customizedTasks.byIdentifier, TaskConfig.TaskConfigSource.WorkspaceFile);
            const engine = configuration.config ? TaskConfig.ExecutionEngine.from(configuration.config) : tasks_1.ExecutionEngine.Terminal;
            if (engine === tasks_1.ExecutionEngine.Process) {
                this.tb.warn(nls.localize(40, null));
                return this.Uc(workspaceFolder);
            }
            return { workspaceFolder, set: { tasks: custom }, configurations: customizedTasks, hasErrors: configuration.hasParseErrors };
        }
        async Tc(workspaceFolder, runSource = 1 /* TaskRunSource.User */) {
            if (this.s === tasks_1.ExecutionEngine.Process) {
                return this.Uc(workspaceFolder);
            }
            const userTasksConfig = this.ad(workspaceFolder, tasks_1.TaskSourceKind.User);
            const configuration = this.Rc(userTasksConfig.config, nls.localize(41, null));
            const customizedTasks = {
                byIdentifier: Object.create(null)
            };
            const custom = [];
            await this.Vc(workspaceFolder, configuration.config, runSource, custom, customizedTasks.byIdentifier, TaskConfig.TaskConfigSource.User);
            const engine = configuration.config ? TaskConfig.ExecutionEngine.from(configuration.config) : tasks_1.ExecutionEngine.Terminal;
            if (engine === tasks_1.ExecutionEngine.Process) {
                this.tb.warn(nls.localize(42, null));
                return this.Uc(workspaceFolder);
            }
            return { workspaceFolder, set: { tasks: custom }, configurations: customizedTasks, hasErrors: configuration.hasParseErrors };
        }
        Uc(workspaceFolder) {
            return { workspaceFolder, set: undefined, configurations: undefined, hasErrors: false };
        }
        async Vc(workspaceFolder, config, runSource, custom, customized, source, isRecentTask = false) {
            if (!config) {
                return false;
            }
            const taskSystemInfo = this.Ub(workspaceFolder.uri.scheme);
            const problemReporter = new ProblemReporter(this.P);
            if (!taskSystemInfo) {
                problemReporter.fatal(nls.localize(43, null));
                return true;
            }
            const parseResult = TaskConfig.$uXb(workspaceFolder, this.w, taskSystemInfo ? taskSystemInfo.platform : Platform.$t, config, problemReporter, source, this.ub, isRecentTask);
            let hasErrors = false;
            if (!parseResult.validationStatus.isOK() && (parseResult.validationStatus.state !== 1 /* ValidationState.Info */)) {
                this.Sb(runSource);
                hasErrors = true;
            }
            if (problemReporter.status.isFatal()) {
                problemReporter.fatal(nls.localize(44, null));
                return hasErrors;
            }
            if (parseResult.configured && parseResult.configured.length > 0) {
                for (const task of parseResult.configured) {
                    customized[task.configures._key] = task;
                }
            }
            if (!this.Pc && (parseResult.custom.length > 0)) {
                console.warn('Custom workspace tasks are not supported.');
            }
            else {
                for (const task of parseResult.custom) {
                    custom.push(task);
                }
            }
            return hasErrors;
        }
        Wc(workspaceFolder) {
            const { config, hasParseErrors } = this.ad(workspaceFolder);
            return Promise.resolve({ workspaceFolder, config, hasErrors: hasParseErrors });
        }
        Yc() {
            const workspaceFolders = [];
            const ignoredWorkspaceFolders = [];
            let executionEngine = tasks_1.ExecutionEngine.Terminal;
            let schemaVersion = 2 /* JsonSchemaVersion.V2_0_0 */;
            let workspace;
            if (this.gb.getWorkbenchState() === 2 /* WorkbenchState.FOLDER */) {
                const workspaceFolder = this.gb.getWorkspace().folders[0];
                workspaceFolders.push(workspaceFolder);
                executionEngine = this.Zc(workspaceFolder);
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
                this.hb.publicLog('taskService.engineVersion', telemetryData);
                schemaVersion = this.$c(workspaceFolder);
            }
            else if (this.gb.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
                workspace = this.gb.getWorkspace();
                for (const workspaceFolder of this.gb.getWorkspace().folders) {
                    if (schemaVersion === this.$c(workspaceFolder)) {
                        workspaceFolders.push(workspaceFolder);
                    }
                    else {
                        ignoredWorkspaceFolders.push(workspaceFolder);
                        this.P.append(nls.localize(45, null, workspaceFolder.uri.fsPath));
                    }
                }
            }
            return [workspaceFolders, ignoredWorkspaceFolders, executionEngine, schemaVersion, workspace];
        }
        Zc(workspaceFolder) {
            const { config } = this.ad(workspaceFolder);
            if (!config) {
                return tasks_1.ExecutionEngine._default;
            }
            return TaskConfig.ExecutionEngine.from(config);
        }
        $c(workspaceFolder) {
            const { config } = this.ad(workspaceFolder);
            if (!config) {
                return 2 /* JsonSchemaVersion.V2_0_0 */;
            }
            return TaskConfig.JsonSchemaVersion.from(config);
        }
        ad(workspaceFolder, source) {
            let result;
            if ((source !== tasks_1.TaskSourceKind.User) && (this.gb.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */)) {
                result = undefined;
            }
            else {
                const wholeConfig = this.Z.inspect('tasks', { resource: workspaceFolder.uri });
                switch (source) {
                    case tasks_1.TaskSourceKind.User: {
                        if (wholeConfig.userValue !== wholeConfig.workspaceFolderValue) {
                            result = Objects.$Vm(wholeConfig.userValue);
                        }
                        break;
                    }
                    case tasks_1.TaskSourceKind.Workspace:
                        result = Objects.$Vm(wholeConfig.workspaceFolderValue);
                        break;
                    case tasks_1.TaskSourceKind.WorkspaceFile: {
                        if ((this.gb.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */)
                            && (wholeConfig.workspaceFolderValue !== wholeConfig.workspaceValue)) {
                            result = Objects.$Vm(wholeConfig.workspaceValue);
                        }
                        break;
                    }
                    default: result = Objects.$Vm(wholeConfig.workspaceFolderValue);
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
                    this.P.append(nls.localize(46, null));
                    this.Sb();
                    return { config: undefined, hasParseErrors: true };
                }
            }
            return { config: result, hasParseErrors: false };
        }
        inTerminal() {
            if (this.I) {
                return this.I instanceof terminalTaskSystem_1.$FXb;
            }
            return this.s === tasks_1.ExecutionEngine.Terminal;
        }
        configureAction() {
            const thisCapture = this;
            return new class extends actions_1.$gi {
                constructor() {
                    super(ConfigureTaskAction.ID, ConfigureTaskAction.TEXT, undefined, true, () => { thisCapture.Cd(); return Promise.resolve(undefined); });
                }
            };
        }
        bd(err) {
            let showOutput = true;
            if (err instanceof taskSystem_1.$hsb) {
                const buildError = err;
                const needsConfig = buildError.code === 0 /* TaskErrors.NotConfigured */ || buildError.code === 2 /* TaskErrors.NoBuildTask */ || buildError.code === 3 /* TaskErrors.NoTestTask */;
                const needsTerminate = buildError.code === 1 /* TaskErrors.RunningTask */;
                if (needsConfig || needsTerminate) {
                    this.tb.prompt(buildError.severity, buildError.message, [{
                            label: needsConfig ? ConfigureTaskAction.TEXT : nls.localize(47, null),
                            run: () => {
                                if (needsConfig) {
                                    this.Cd();
                                }
                                else {
                                    this.td();
                                }
                            }
                        }]);
                }
                else {
                    this.tb.notify({ severity: buildError.severity, message: buildError.message });
                }
            }
            else if (err instanceof Error) {
                const error = err;
                this.tb.error(error.message);
                showOutput = false;
            }
            else if (Types.$jf(err)) {
                this.tb.error(err);
            }
            else {
                this.tb.error(nls.localize(48, null));
            }
            if (showOutput) {
                this.Sb();
            }
        }
        cd() {
            return this.Z.getValue(taskQuickPick_1.$GXb);
        }
        async dd(tasks, group = false, sort = false, selectedEntry, includeRecents = true) {
            let encounteredTasks = {};
            if (tasks === undefined || tasks === null || tasks.length === 0) {
                return [];
            }
            const TaskQuickPickEntry = (task) => {
                const newEntry = { label: task._label, description: this.getTaskDescription(task), task, detail: this.cd() ? task.configurationProperties.detail : undefined };
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
                    entry.buttons = [{ iconClass: themables_1.ThemeIcon.asClassName(taskQuickPick_1.$JXb), tooltip: nls.localize(49, null) }];
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
                        fillEntries(entries, recent, nls.localize(50, null));
                    }
                    configured = configured.sort((a, b) => sorter.compare(a, b));
                    fillEntries(entries, configured, nls.localize(51, null));
                    detected = detected.sort((a, b) => sorter.compare(a, b));
                    fillEntries(entries, detected, nls.localize(52, null));
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
        async ed(placeHolder, defaultEntry, type, name) {
            return this.Gb.createInstance(taskQuickPick_1.$KXb).show(placeHolder, defaultEntry, type, name);
        }
        async fd(tasks, placeHolder, defaultEntry, group = false, sort = false, selectedEntry, additionalEntries, name) {
            const resolvedTasks = await tasks;
            const entries = await (0, async_1.$yg)(this.dd(resolvedTasks, group, sort, selectedEntry), 200, () => undefined);
            if (!entries) {
                return undefined;
            }
            if (entries.length === 1 && this.Z.getValue(taskQuickPick_1.$HXb)) {
                return entries[0];
            }
            else if ((entries.length === 0) && defaultEntry) {
                entries.push(defaultEntry);
            }
            else if (entries.length > 1 && additionalEntries && additionalEntries.length > 0) {
                entries.push({ type: 'separator', label: '' });
                entries.push(additionalEntries[0]);
            }
            const picker = this.lb.createQuickPick();
            picker.placeholder = placeHolder;
            picker.matchOnDescription = true;
            if (name) {
                picker.value = name;
            }
            picker.onDidTriggerItemButton(context => {
                const task = context.item.task;
                this.lb.cancel();
                if (tasks_1.$gG.is(task)) {
                    this.customize(task, undefined, true);
                }
                else if (tasks_1.$eG.is(task)) {
                    this.openConfig(task);
                }
            });
            picker.items = entries;
            picker.show();
            return new Promise(resolve => {
                this.B(picker.onDidAccept(async () => {
                    const selectedEntry = picker.selectedItems ? picker.selectedItems[0] : undefined;
                    picker.dispose();
                    if (!selectedEntry) {
                        resolve(undefined);
                    }
                    resolve(selectedEntry);
                }));
            });
        }
        gd() {
            return (this.getRecentlyUsedTasksV1().size > 0) && (this.Zb('historical').size === 0);
        }
        async hd(tasks) {
            if (!this.gd()) {
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
                    await this.dc(task);
                }
            }
            this.pb.remove($LXb_1.c, 1 /* StorageScope.WORKSPACE */);
        }
        jd() {
            if (this.Lb.length === 0 || !this.Ob) {
                return Promise.resolve(undefined);
            }
            this.tb.prompt(severity_1.default.Info, nls.localize(53, null, this.Lb.map(f => f.name).join(', ')), [{
                    label: nls.localize(54, null),
                    isSecondary: true,
                    run: () => {
                        this.pb.store($LXb_1.j, true, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
                        this.z = false;
                    }
                }]);
            return Promise.resolve(undefined);
        }
        async kd() {
            if (taskService_1.$msb && !taskService_1.$nsb) {
                return false;
            }
            await this.Cb.workspaceTrustInitialized;
            if (!this.Cb.isWorkspaceTrusted()) {
                return (await this.Bb.requestWorkspaceTrust({
                    message: nls.localize(55, null)
                })) === true;
            }
            return true;
        }
        async ld(filter) {
            if (!this.n) {
                return;
            }
            if (!filter) {
                return this.nd();
            }
            const type = typeof filter === 'string' ? undefined : filter.type;
            const taskName = typeof filter === 'string' ? filter : filter.task;
            const grouped = await this.Kc({ type });
            const identifier = this.vd(filter);
            const tasks = grouped.all();
            const resolver = this.Bc(grouped);
            const folderURIs = this.gb.getWorkspace().folders.map(folder => folder.uri);
            if (this.gb.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
                folderURIs.push(this.gb.getWorkspace().configuration);
            }
            folderURIs.push(tasks_1.$_F);
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
                return this.nd(tasks, type, taskName);
            }
            for (const uri of folderURIs) {
                const task = await resolver.resolve(uri, taskName);
                if (task) {
                    await this.run(task, { attachProblemMatcher: true }, 1 /* TaskRunSource.User */);
                    return;
                }
            }
        }
        md(filter) {
            if (!this.Xb(filter)) {
                return { tasks: Promise.resolve([]), grouped: Promise.resolve(new TaskMap()) };
            }
            const grouped = this.Kc(filter);
            const tasks = grouped.then((map) => {
                if (!filter || !filter.type) {
                    return map.all();
                }
                const result = [];
                map.forEach((tasks) => {
                    for (const task of tasks) {
                        if (tasks_1.$gG.is(task) && task.defines.type === filter.type) {
                            result.push(task);
                        }
                        else if (tasks_1.$eG.is(task)) {
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
        nd(tasks, type, name) {
            const pickThen = (task) => {
                if (task === undefined) {
                    return;
                }
                if (task === null) {
                    this.Cd();
                }
                else {
                    this.run(task, { attachProblemMatcher: true }, 1 /* TaskRunSource.User */).then(undefined, reason => {
                        // eat the error, it has already been surfaced to the user and we don't care about it here
                    });
                }
            };
            const placeholder = nls.localize(56, null);
            this.jd().then(() => {
                if (this.Z.getValue(USE_SLOW_PICKER)) {
                    let taskResult = undefined;
                    if (!tasks) {
                        taskResult = this.md();
                    }
                    this.fd(tasks ? tasks : taskResult.tasks, placeholder, {
                        label: '$(plus) ' + nls.localize(57, null),
                        task: null
                    }, true, undefined, undefined, undefined, name).
                        then((entry) => {
                        return pickThen(entry ? entry.task : undefined);
                    });
                }
                else {
                    this.ed(placeholder, {
                        label: '$(plus) ' + nls.localize(58, null),
                        task: null
                    }, type, name).
                        then(pickThen);
                }
            });
        }
        od() {
            problemMatcher_1.$0F.onReady().then(() => {
                return this.eb.saveAll({ reason: 2 /* SaveReason.AUTO */ }).then(() => {
                    const executeResult = this.Ic().rerun();
                    if (executeResult) {
                        return this.Ec(executeResult);
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
        pd(tasks, taskGlobsInList = false) {
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
        qd(taskGroup, strings, configure, legacyCommand) {
            if (this.Nb === 1 /* JsonSchemaVersion.V0_1_0 */) {
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
                    this.jd().then(() => {
                        this.fd(tasks, strings.select, {
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
                const absoluteURI = editor_1.$3E.getOriginalUri(this.eb.activeEditor);
                if (absoluteURI) {
                    const workspaceFolder = this.gb.getWorkspaceFolder(absoluteURI);
                    if (workspaceFolder) {
                        const configuredTasks = this.ad(workspaceFolder)?.config?.tasks;
                        if (configuredTasks) {
                            globTasksDetected = configuredTasks.filter(task => task.group && typeof task.group !== 'string' && typeof task.group.isDefault === 'string').length > 0;
                            // This will activate extensions, so only do so if necessary #185960
                            if (globTasksDetected) {
                                // Fallback to absolute path of the file if it is not in a workspace or relative path cannot be found
                                const relativePath = workspaceFolder?.uri ? (resources.$kg(workspaceFolder.uri, absoluteURI) ?? absoluteURI.path) : absoluteURI.path;
                                groupTasks = await this.Vb((task) => {
                                    const currentTaskGroup = task.configurationProperties.group;
                                    if (currentTaskGroup && typeof currentTaskGroup !== 'string' && typeof currentTaskGroup.isDefault === 'string') {
                                        return (currentTaskGroup._id === taskGroup._id && glob.$qj(currentTaskGroup.isDefault, relativePath));
                                    }
                                    return false;
                                });
                            }
                        }
                    }
                }
                if (!globTasksDetected && groupTasks.length === 0) {
                    groupTasks = await this.Wb(taskGroup, true);
                }
                const handleMultipleTasks = (areGlobTasks) => {
                    return this.sc(taskGroup).then((tasks) => {
                        if (tasks.length > 0) {
                            // If we're dealing with tasks that were chosen because of a glob match,
                            // then put globs in the defaults and everything else in none
                            const defaults = this.pd(tasks, areGlobTasks);
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
                    if (tasks_1.$fG.is(taskGroupTask)) {
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
                    groupTasks = await this.Wb(taskGroup, false);
                }
                // A single default task was returned, just run it directly
                if (groupTasks.length === 1) {
                    return resolveTaskAndRun(groupTasks[0]);
                }
                // Multiple default tasks returned, show the quickPicker
                return handleMultipleTasks(false);
            })();
            this.qb.withProgress(options, () => promise);
        }
        rd() {
            if (!this.n) {
                return;
            }
            return this.qd(tasks_1.TaskGroup.Build, {
                fetching: nls.localize(59, null),
                select: nls.localize(60, null),
                notFoundConfigure: nls.localize(61, null)
            }, this.Dd, this.jc);
        }
        sd() {
            return this.qd(tasks_1.TaskGroup.Test, {
                fetching: nls.localize(62, null),
                select: nls.localize(63, null),
                notFoundConfigure: nls.localize(64, null)
            }, this.Ed, this.kc);
        }
        td(arg) {
            if (arg === 'terminateAll') {
                this.Gc();
                return;
            }
            const runQuickPick = (promise) => {
                this.fd(promise || this.getActiveTasks(), nls.localize(65, null), {
                    label: nls.localize(66, null),
                    task: undefined
                }, false, true, undefined, [{
                        label: nls.localize(67, null),
                        id: 'terminateAll',
                        task: undefined
                    }]).then(entry => {
                    if (entry && entry.id === 'terminateAll') {
                        this.Gc();
                    }
                    const task = entry ? entry.task : undefined;
                    if (task === undefined || task === null) {
                        return;
                    }
                    this.terminate(task);
                });
            };
            if (this.inTerminal()) {
                const identifier = this.vd(arg);
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
                this.Yb().then((active) => {
                    if (active) {
                        this.Gc().then((responses) => {
                            // the output runner has only one task
                            const response = responses[0];
                            if (response.success) {
                                return;
                            }
                            if (response.code && response.code === 3 /* TerminateResponseCode.ProcessNotFound */) {
                                this.tb.error(nls.localize(68, null));
                            }
                            else {
                                this.tb.error(nls.localize(69, null));
                            }
                        });
                    }
                });
            }
        }
        async ud(arg) {
            const activeTasks = await this.getActiveTasks();
            if (activeTasks.length === 1) {
                this.Fc(activeTasks[0]);
                return;
            }
            if (this.inTerminal()) {
                // try dispatching using task identifier
                const identifier = this.vd(arg);
                if (identifier !== undefined) {
                    for (const task of activeTasks) {
                        if (task.matches(identifier)) {
                            this.Fc(task);
                            return;
                        }
                    }
                }
                // show quick pick with active tasks
                const entry = await this.fd(activeTasks, nls.localize(70, null), {
                    label: nls.localize(71, null),
                    task: null
                }, false, true);
                if (entry && entry.task) {
                    this.Fc(entry.task);
                }
            }
            else {
                if (activeTasks.length > 0) {
                    this.Fc(activeTasks[0]);
                }
            }
        }
        vd(filter) {
            let result = undefined;
            if (Types.$jf(filter)) {
                result = filter;
            }
            else if (filter && Types.$jf(filter.type)) {
                result = tasks_1.TaskDefinition.createTaskIdentifier(filter, console);
            }
            return result;
        }
        wd(taskConfig) {
            return !!taskConfig && !!taskConfig.tasks && taskConfig.tasks.length > 0;
        }
        xd(resource, taskSource) {
            let configFileCreated = false;
            this.fb.stat(resource).then((stat) => stat, () => undefined).then(async (stat) => {
                const fileExists = !!stat;
                const configValue = this.Z.inspect('tasks');
                let tasksExistInFile;
                let target;
                switch (taskSource) {
                    case tasks_1.TaskSourceKind.User:
                        tasksExistInFile = this.wd(configValue.userValue);
                        target = 2 /* ConfigurationTarget.USER */;
                        break;
                    case tasks_1.TaskSourceKind.WorkspaceFile:
                        tasksExistInFile = this.wd(configValue.workspaceValue);
                        target = 5 /* ConfigurationTarget.WORKSPACE */;
                        break;
                    default:
                        tasksExistInFile = this.wd(configValue.workspaceFolderValue);
                        target = 6 /* ConfigurationTarget.WORKSPACE_FOLDER */;
                }
                let content;
                if (!tasksExistInFile) {
                    const pickTemplateResult = await this.lb.pick((0, taskTemplates_1.$sXb)(), { placeHolder: nls.localize(72, null) });
                    if (!pickTemplateResult) {
                        return Promise.resolve(undefined);
                    }
                    content = pickTemplateResult.content;
                    const editorConfig = this.Z.getValue();
                    if (editorConfig.editor.insertSpaces) {
                        content = content.replace(/(\n)(\t+)/g, (_, s1, s2) => s1 + ' '.repeat(s2.length * editorConfig.editor.tabSize));
                    }
                    configFileCreated = true;
                }
                if (!fileExists && content) {
                    return this.ib.create([{ resource, value: content }]).then(result => {
                        return result[0].resource;
                    });
                }
                else if (fileExists && (tasksExistInFile || content)) {
                    if (content) {
                        this.Z.updateValue('tasks', json.$Lm(content), target);
                    }
                    return stat?.resource;
                }
                return undefined;
            }).then((resource) => {
                if (!resource) {
                    return;
                }
                this.eb.openEditor({
                    resource,
                    options: {
                        pinned: configFileCreated // pin only if config file is created #8727
                    }
                });
            });
        }
        yd(value) {
            const candidate = value;
            return candidate && !!candidate.task;
        }
        zd(value) {
            const candidate = value;
            return candidate && !!candidate.settingType;
        }
        Ad(task) {
            if (tasks_1.$gG.is(task)) {
                this.customize(task, undefined, true);
            }
            else if (tasks_1.$eG.is(task)) {
                this.openConfig(task);
            }
            else if (tasks_1.$fG.is(task)) {
                // Do nothing.
            }
        }
        Bd(selection) {
            if (!selection) {
                return;
            }
            if (this.yd(selection)) {
                this.Ad(selection.task);
            }
            else if (this.zd(selection)) {
                const taskQuickPick = this.Gb.createInstance(taskQuickPick_1.$KXb);
                taskQuickPick.handleSettingOption(selection.settingType);
            }
            else if (selection.folder && (this.gb.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */)) {
                this.xd(selection.folder.toResource('.vscode/tasks.json'), tasks_1.TaskSourceKind.Workspace);
            }
            else {
                const resource = this.yc(tasks_1.TaskSourceKind.User);
                if (resource) {
                    this.xd(resource, tasks_1.TaskSourceKind.User);
                }
            }
        }
        getTaskDescription(task) {
            let description;
            if (task._source.kind === tasks_1.TaskSourceKind.User) {
                description = nls.localize(73, null);
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
        async Cd() {
            if (!(await this.kd())) {
                return;
            }
            let taskPromise;
            if (this.Nb === 2 /* JsonSchemaVersion.V2_0_0 */) {
                taskPromise = this.Kc();
            }
            else {
                taskPromise = Promise.resolve(new TaskMap());
            }
            const stats = this.gb.getWorkspace().folders.map((folder) => {
                return this.fb.stat(folder.toResource('.vscode/tasks.json')).then(stat => stat, () => undefined);
            });
            const createLabel = nls.localize(74, null);
            const openLabel = nls.localize(75, null);
            const tokenSource = new cancellation_1.$pd();
            const cancellationToken = tokenSource.token;
            const entries = Promise.all(stats).then((stats) => {
                return taskPromise.then((taskMap) => {
                    const entries = [];
                    let configuredCount = 0;
                    let tasks = taskMap.all();
                    if (tasks.length > 0) {
                        tasks = tasks.sort((a, b) => a._label.localeCompare(b._label));
                        for (const task of tasks) {
                            const entry = { label: taskQuickPick_1.$KXb.getTaskLabelWithIcon(task), task, description: this.getTaskDescription(task), detail: this.cd() ? task.configurationProperties.detail : undefined };
                            taskQuickPick_1.$KXb.applyColorStyles(task, entry, this.Eb);
                            entries.push(entry);
                            if (!tasks_1.$gG.is(task)) {
                                configuredCount++;
                            }
                        }
                    }
                    const needsCreateOrOpen = (configuredCount === 0);
                    // If the only configured tasks are user tasks, then we should also show the option to create from a template.
                    if (needsCreateOrOpen || (taskMap.get(tasks_1.$_F).length === configuredCount)) {
                        const label = stats[0] !== undefined ? openLabel : createLabel;
                        if (entries.length) {
                            entries.push({ type: 'separator' });
                        }
                        entries.push({ label, folder: this.gb.getWorkspace().folders[0] });
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
            if (!timeout && ((await entries).length === 1) && this.Z.getValue(taskQuickPick_1.$HXb)) {
                const entry = ((await entries)[0]);
                if (entry.task) {
                    this.Bd(entry);
                    return;
                }
            }
            const entriesWithSettings = entries.then(resolvedEntries => {
                resolvedEntries.push(...taskQuickPick_1.$KXb.allSettingEntries(this.Z));
                return resolvedEntries;
            });
            this.lb.pick(entriesWithSettings, { placeHolder: nls.localize(76, null) }, cancellationToken).
                then(async (selection) => {
                if (cancellationToken.isCancellationRequested) {
                    // canceled when there's only one task
                    const task = (await entries)[0];
                    if (task.task) {
                        selection = task;
                    }
                }
                this.Bd(selection);
            });
        }
        Dd() {
            if (this.Nb === 2 /* JsonSchemaVersion.V2_0_0 */) {
                this.tasks().then((tasks => {
                    if (tasks.length === 0) {
                        this.Cd();
                        return;
                    }
                    const entries = [];
                    let selectedTask;
                    let selectedEntry;
                    this.jd().then(() => {
                        for (const task of tasks) {
                            const taskGroup = tasks_1.TaskGroup.from(task.configurationProperties.group);
                            if (taskGroup && taskGroup.isDefault && taskGroup._id === tasks_1.TaskGroup.Build._id) {
                                const label = nls.localize(77, null, taskQuickPick_1.$KXb.getTaskLabelWithIcon(task, task.getQualifiedLabel()));
                                selectedTask = task;
                                selectedEntry = { label, task, description: this.getTaskDescription(task), detail: this.cd() ? task.configurationProperties.detail : undefined };
                                taskQuickPick_1.$KXb.applyColorStyles(task, selectedEntry, this.Eb);
                            }
                            else {
                                const entry = { label: taskQuickPick_1.$KXb.getTaskLabelWithIcon(task), task, description: this.getTaskDescription(task), detail: this.cd() ? task.configurationProperties.detail : undefined };
                                taskQuickPick_1.$KXb.applyColorStyles(task, entry, this.Eb);
                                entries.push(entry);
                            }
                        }
                        if (selectedEntry) {
                            entries.unshift(selectedEntry);
                        }
                        const tokenSource = new cancellation_1.$pd();
                        const cancellationToken = tokenSource.token;
                        this.lb.pick(entries, { placeHolder: nls.localize(78, null) }, cancellationToken).
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
                            if (task === selectedTask && tasks_1.$eG.is(task)) {
                                this.openConfig(task);
                            }
                            if (!tasks_1.$hG.is(task)) {
                                this.customize(task, { group: { kind: 'build', isDefault: true } }, true).then(() => {
                                    if (selectedTask && (task !== selectedTask) && !tasks_1.$hG.is(selectedTask)) {
                                        this.customize(selectedTask, { group: 'build' }, false);
                                    }
                                });
                            }
                        });
                        this.lb.pick(entries, {
                            placeHolder: nls.localize(79, null)
                        }).
                            then((entry) => {
                            const task = entry && 'task' in entry ? entry.task : undefined;
                            if ((task === undefined) || (task === null)) {
                                return;
                            }
                            if (task === selectedTask && tasks_1.$eG.is(task)) {
                                this.openConfig(task);
                            }
                            if (!tasks_1.$hG.is(task)) {
                                this.customize(task, { group: { kind: 'build', isDefault: true } }, true).then(() => {
                                    if (selectedTask && (task !== selectedTask) && !tasks_1.$hG.is(selectedTask)) {
                                        this.customize(selectedTask, { group: 'build' }, false);
                                    }
                                });
                            }
                        });
                    });
                }));
            }
            else {
                this.Cd();
            }
        }
        Ed() {
            if (this.Nb === 2 /* JsonSchemaVersion.V2_0_0 */) {
                this.tasks().then((tasks => {
                    if (tasks.length === 0) {
                        this.Cd();
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
                            label: nls.localize(80, null, selectedTask.getQualifiedLabel()),
                            task: selectedTask,
                            detail: this.cd() ? selectedTask.configurationProperties.detail : undefined
                        };
                    }
                    this.jd().then(() => {
                        this.fd(tasks, nls.localize(81, null), undefined, true, false, selectedEntry).then((entry) => {
                            const task = entry ? entry.task : undefined;
                            if (!task) {
                                return;
                            }
                            if (task === selectedTask && tasks_1.$eG.is(task)) {
                                this.openConfig(task);
                            }
                            if (!tasks_1.$hG.is(task)) {
                                this.customize(task, { group: { kind: 'test', isDefault: true } }, true).then(() => {
                                    if (selectedTask && (task !== selectedTask) && !tasks_1.$hG.is(selectedTask)) {
                                        this.customize(selectedTask, { group: 'test' }, false);
                                    }
                                });
                            }
                        });
                    });
                }));
            }
            else {
                this.Cd();
            }
        }
        async runShowTasks() {
            const activeTasksPromise = this.getActiveTasks();
            const activeTasks = await activeTasksPromise;
            let group;
            if (activeTasks.length === 1) {
                this.I.revealTask(activeTasks[0]);
            }
            else if (activeTasks.length && activeTasks.every((task) => {
                if (tasks_1.$hG.is(task)) {
                    return false;
                }
                if (!group) {
                    group = task.command.presentation?.group;
                }
                return task.command.presentation?.group && (task.command.presentation.group === group);
            })) {
                this.I.revealTask(activeTasks[0]);
            }
            else {
                this.fd(activeTasksPromise, nls.localize(82, null), {
                    label: nls.localize(83, null),
                    task: null
                }, false, true).then((entry) => {
                    const task = entry ? entry.task : undefined;
                    if (task === undefined || task === null) {
                        return;
                    }
                    this.I.revealTask(task);
                });
            }
        }
        async Fd(folder) {
            const tasksFile = folder.toResource('.vscode/tasks.json');
            if (await this.fb.exists(tasksFile)) {
                const oldFile = tasksFile.with({ path: `${tasksFile.path}.old` });
                await this.fb.copy(tasksFile, oldFile, true);
                return [oldFile, tasksFile];
            }
            return undefined;
        }
        Gd(task, suppressTaskName, globalConfig) {
            if (!tasks_1.$eG.is(task)) {
                return;
            }
            const configElement = {
                label: task._label
            };
            const oldTaskTypes = new Set(['gulp', 'jake', 'grunt']);
            if (Types.$jf(task.command.name) && oldTaskTypes.has(task.command.name)) {
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
            const tempTask = new tasks_1.$eG(task._id, task._source, task._label, task.type, task.command, task.hasDefinedMatchers, task.runOptions, task.configurationProperties);
            const configTask = this.wc(tempTask);
            if (configTask) {
                return configTask;
            }
            return;
        }
        async Hd() {
            if (this.Nb === 2 /* JsonSchemaVersion.V2_0_0 */) {
                return;
            }
            if (!this.Cb.isWorkspaceTrusted()) {
                this.B(event_1.Event.once(this.Cb.onDidChangeTrust)(isTrusted => {
                    if (isTrusted) {
                        this.Hd();
                    }
                }));
                return;
            }
            const tasks = await this.Kc();
            const fileDiffs = [];
            for (const folder of this.Kb) {
                const diff = await this.Fd(folder);
                if (diff) {
                    fileDiffs.push(diff);
                }
                if (!diff) {
                    continue;
                }
                const configTasks = [];
                const suppressTaskName = !!this.Z.getValue("tasks.suppressTaskName" /* TasksSchemaProperties.SuppressTaskName */, { resource: folder.uri });
                const globalConfig = {
                    windows: this.Z.getValue("tasks.windows" /* TasksSchemaProperties.Windows */, { resource: folder.uri }),
                    osx: this.Z.getValue("tasks.osx" /* TasksSchemaProperties.Osx */, { resource: folder.uri }),
                    linux: this.Z.getValue("tasks.linux" /* TasksSchemaProperties.Linux */, { resource: folder.uri })
                };
                tasks.get(folder).forEach(task => {
                    const configTask = this.Gd(task, suppressTaskName, globalConfig);
                    if (configTask) {
                        configTasks.push(configTask);
                    }
                });
                this.I = undefined;
                this.G = undefined;
                await this.xc(folder, 'tasks.tasks', configTasks);
                await this.xc(folder, 'tasks.version', '2.0.0');
                if (this.Z.getValue("tasks.showOutput" /* TasksSchemaProperties.ShowOutput */, { resource: folder.uri })) {
                    await this.Z.updateValue("tasks.showOutput" /* TasksSchemaProperties.ShowOutput */, undefined, { resource: folder.uri });
                }
                if (this.Z.getValue("tasks.isShellCommand" /* TasksSchemaProperties.IsShellCommand */, { resource: folder.uri })) {
                    await this.Z.updateValue("tasks.isShellCommand" /* TasksSchemaProperties.IsShellCommand */, undefined, { resource: folder.uri });
                }
                if (this.Z.getValue("tasks.suppressTaskName" /* TasksSchemaProperties.SuppressTaskName */, { resource: folder.uri })) {
                    await this.Z.updateValue("tasks.suppressTaskName" /* TasksSchemaProperties.SuppressTaskName */, undefined, { resource: folder.uri });
                }
            }
            this.Rb();
            this.tb.prompt(severity_1.default.Warning, fileDiffs.length === 1 ?
                nls.localize(84, null)
                : nls.localize(85, null), [{
                    label: fileDiffs.length === 1 ? nls.localize(86, null) : nls.localize(87, null),
                    run: async () => {
                        for (const upgrade of fileDiffs) {
                            await this.eb.openEditor({
                                original: { resource: upgrade[0] },
                                modified: { resource: upgrade[1] }
                            });
                        }
                    }
                }]);
        }
    };
    exports.$LXb = $LXb;
    exports.$LXb = $LXb = $LXb_1 = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, markers_1.$3s),
        __param(2, output_1.$eJ),
        __param(3, panecomposite_1.$Yeb),
        __param(4, views_1.$$E),
        __param(5, commands_1.$Fr),
        __param(6, editorService_1.$9C),
        __param(7, files_1.$6j),
        __param(8, workspace_1.$Kh),
        __param(9, telemetry_1.$9k),
        __param(10, textfiles_1.$JD),
        __param(11, model_1.$yA),
        __param(12, extensions_1.$MF),
        __param(13, quickInput_1.$Gq),
        __param(14, configurationResolver_1.$NM),
        __param(15, terminal_1.$Mib),
        __param(16, terminal_1.$Oib),
        __param(17, storage_1.$Vo),
        __param(18, progress_1.$2u),
        __param(19, opener_1.$NT),
        __param(20, dialogs_1.$oA),
        __param(21, notification_1.$Yu),
        __param(22, contextkey_1.$3i),
        __param(23, environmentService_1.$hJ),
        __param(24, terminal_2.$EM),
        __param(25, pathService_1.$yJ),
        __param(26, resolverService_1.$uA),
        __param(27, preferences_1.$BE),
        __param(28, views_1.$_E),
        __param(29, workspaceTrust_1.$_z),
        __param(30, workspaceTrust_1.$$z),
        __param(31, log_1.$5i),
        __param(32, themeService_1.$gv),
        __param(33, lifecycle_2.$7y),
        __param(34, remoteAgentService_1.$jm),
        __param(35, instantiation_1.$Ah)
    ], $LXb);
});
//# sourceMappingURL=abstractTaskService.js.map