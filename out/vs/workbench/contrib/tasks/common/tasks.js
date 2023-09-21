/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/types", "vs/base/common/resources", "vs/base/common/objects", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/tasks/common/taskDefinitionRegistry"], function (require, exports, nls, Types, resources, Objects, contextkey_1, taskDefinitionRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TaskDefinition = exports.TasksSchemaProperties = exports.TaskSettingId = exports.KeyedTaskIdentifier = exports.TaskEvent = exports.TaskRunSource = exports.TaskRunType = exports.TaskEventKind = exports.TaskSorter = exports.JsonSchemaVersion = exports.ExecutionEngine = exports.InMemoryTask = exports.ContributedTask = exports.ConfiguringTask = exports.CustomTask = exports.CommonTask = exports.RunOptions = exports.RunOnOptions = exports.DependsOrder = exports.TaskSourceKind = exports.TaskScope = exports.TaskGroup = exports.CommandString = exports.RuntimeType = exports.PresentationOptions = exports.PanelKind = exports.RevealProblemKind = exports.RevealKind = exports.CommandOptions = exports.CUSTOMIZED_TASK_TYPE = exports.ShellQuoting = exports.TASKS_CATEGORY = exports.TASK_RUNNING_STATE = exports.USER_TASKS_GROUP_KEY = void 0;
    exports.USER_TASKS_GROUP_KEY = 'settings';
    exports.TASK_RUNNING_STATE = new contextkey_1.RawContextKey('taskRunning', false, nls.localize('tasks.taskRunningContext', "Whether a task is currently running."));
    exports.TASKS_CATEGORY = { value: nls.localize('tasksCategory', "Tasks"), original: 'Tasks' };
    var ShellQuoting;
    (function (ShellQuoting) {
        /**
         * Use character escaping.
         */
        ShellQuoting[ShellQuoting["Escape"] = 1] = "Escape";
        /**
         * Use strong quoting
         */
        ShellQuoting[ShellQuoting["Strong"] = 2] = "Strong";
        /**
         * Use weak quoting.
         */
        ShellQuoting[ShellQuoting["Weak"] = 3] = "Weak";
    })(ShellQuoting || (exports.ShellQuoting = ShellQuoting = {}));
    exports.CUSTOMIZED_TASK_TYPE = '$customized';
    (function (ShellQuoting) {
        function from(value) {
            if (!value) {
                return ShellQuoting.Strong;
            }
            switch (value.toLowerCase()) {
                case 'escape':
                    return ShellQuoting.Escape;
                case 'strong':
                    return ShellQuoting.Strong;
                case 'weak':
                    return ShellQuoting.Weak;
                default:
                    return ShellQuoting.Strong;
            }
        }
        ShellQuoting.from = from;
    })(ShellQuoting || (exports.ShellQuoting = ShellQuoting = {}));
    var CommandOptions;
    (function (CommandOptions) {
        CommandOptions.defaults = { cwd: '${workspaceFolder}' };
    })(CommandOptions || (exports.CommandOptions = CommandOptions = {}));
    var RevealKind;
    (function (RevealKind) {
        /**
         * Always brings the terminal to front if the task is executed.
         */
        RevealKind[RevealKind["Always"] = 1] = "Always";
        /**
         * Only brings the terminal to front if a problem is detected executing the task
         * e.g. the task couldn't be started,
         * the task ended with an exit code other than zero,
         * or the problem matcher found an error.
         */
        RevealKind[RevealKind["Silent"] = 2] = "Silent";
        /**
         * The terminal never comes to front when the task is executed.
         */
        RevealKind[RevealKind["Never"] = 3] = "Never";
    })(RevealKind || (exports.RevealKind = RevealKind = {}));
    (function (RevealKind) {
        function fromString(value) {
            switch (value.toLowerCase()) {
                case 'always':
                    return RevealKind.Always;
                case 'silent':
                    return RevealKind.Silent;
                case 'never':
                    return RevealKind.Never;
                default:
                    return RevealKind.Always;
            }
        }
        RevealKind.fromString = fromString;
    })(RevealKind || (exports.RevealKind = RevealKind = {}));
    var RevealProblemKind;
    (function (RevealProblemKind) {
        /**
         * Never reveals the problems panel when this task is executed.
         */
        RevealProblemKind[RevealProblemKind["Never"] = 1] = "Never";
        /**
         * Only reveals the problems panel if a problem is found.
         */
        RevealProblemKind[RevealProblemKind["OnProblem"] = 2] = "OnProblem";
        /**
         * Never reveals the problems panel when this task is executed.
         */
        RevealProblemKind[RevealProblemKind["Always"] = 3] = "Always";
    })(RevealProblemKind || (exports.RevealProblemKind = RevealProblemKind = {}));
    (function (RevealProblemKind) {
        function fromString(value) {
            switch (value.toLowerCase()) {
                case 'always':
                    return RevealProblemKind.Always;
                case 'never':
                    return RevealProblemKind.Never;
                case 'onproblem':
                    return RevealProblemKind.OnProblem;
                default:
                    return RevealProblemKind.OnProblem;
            }
        }
        RevealProblemKind.fromString = fromString;
    })(RevealProblemKind || (exports.RevealProblemKind = RevealProblemKind = {}));
    var PanelKind;
    (function (PanelKind) {
        /**
         * Shares a panel with other tasks. This is the default.
         */
        PanelKind[PanelKind["Shared"] = 1] = "Shared";
        /**
         * Uses a dedicated panel for this tasks. The panel is not
         * shared with other tasks.
         */
        PanelKind[PanelKind["Dedicated"] = 2] = "Dedicated";
        /**
         * Creates a new panel whenever this task is executed.
         */
        PanelKind[PanelKind["New"] = 3] = "New";
    })(PanelKind || (exports.PanelKind = PanelKind = {}));
    (function (PanelKind) {
        function fromString(value) {
            switch (value.toLowerCase()) {
                case 'shared':
                    return PanelKind.Shared;
                case 'dedicated':
                    return PanelKind.Dedicated;
                case 'new':
                    return PanelKind.New;
                default:
                    return PanelKind.Shared;
            }
        }
        PanelKind.fromString = fromString;
    })(PanelKind || (exports.PanelKind = PanelKind = {}));
    var PresentationOptions;
    (function (PresentationOptions) {
        PresentationOptions.defaults = {
            echo: true, reveal: RevealKind.Always, revealProblems: RevealProblemKind.Never, focus: false, panel: PanelKind.Shared, showReuseMessage: true, clear: false
        };
    })(PresentationOptions || (exports.PresentationOptions = PresentationOptions = {}));
    var RuntimeType;
    (function (RuntimeType) {
        RuntimeType[RuntimeType["Shell"] = 1] = "Shell";
        RuntimeType[RuntimeType["Process"] = 2] = "Process";
        RuntimeType[RuntimeType["CustomExecution"] = 3] = "CustomExecution";
    })(RuntimeType || (exports.RuntimeType = RuntimeType = {}));
    (function (RuntimeType) {
        function fromString(value) {
            switch (value.toLowerCase()) {
                case 'shell':
                    return RuntimeType.Shell;
                case 'process':
                    return RuntimeType.Process;
                case 'customExecution':
                    return RuntimeType.CustomExecution;
                default:
                    return RuntimeType.Process;
            }
        }
        RuntimeType.fromString = fromString;
        function toString(value) {
            switch (value) {
                case RuntimeType.Shell: return 'shell';
                case RuntimeType.Process: return 'process';
                case RuntimeType.CustomExecution: return 'customExecution';
                default: return 'process';
            }
        }
        RuntimeType.toString = toString;
    })(RuntimeType || (exports.RuntimeType = RuntimeType = {}));
    var CommandString;
    (function (CommandString) {
        function value(value) {
            if (Types.isString(value)) {
                return value;
            }
            else {
                return value.value;
            }
        }
        CommandString.value = value;
    })(CommandString || (exports.CommandString = CommandString = {}));
    var TaskGroup;
    (function (TaskGroup) {
        TaskGroup.Clean = { _id: 'clean', isDefault: false };
        TaskGroup.Build = { _id: 'build', isDefault: false };
        TaskGroup.Rebuild = { _id: 'rebuild', isDefault: false };
        TaskGroup.Test = { _id: 'test', isDefault: false };
        function is(value) {
            return value === TaskGroup.Clean._id || value === TaskGroup.Build._id || value === TaskGroup.Rebuild._id || value === TaskGroup.Test._id;
        }
        TaskGroup.is = is;
        function from(value) {
            if (value === undefined) {
                return undefined;
            }
            else if (Types.isString(value)) {
                if (is(value)) {
                    return { _id: value, isDefault: false };
                }
                return undefined;
            }
            else {
                return value;
            }
        }
        TaskGroup.from = from;
    })(TaskGroup || (exports.TaskGroup = TaskGroup = {}));
    var TaskScope;
    (function (TaskScope) {
        TaskScope[TaskScope["Global"] = 1] = "Global";
        TaskScope[TaskScope["Workspace"] = 2] = "Workspace";
        TaskScope[TaskScope["Folder"] = 3] = "Folder";
    })(TaskScope || (exports.TaskScope = TaskScope = {}));
    var TaskSourceKind;
    (function (TaskSourceKind) {
        TaskSourceKind.Workspace = 'workspace';
        TaskSourceKind.Extension = 'extension';
        TaskSourceKind.InMemory = 'inMemory';
        TaskSourceKind.WorkspaceFile = 'workspaceFile';
        TaskSourceKind.User = 'user';
        function toConfigurationTarget(kind) {
            switch (kind) {
                case TaskSourceKind.User: return 2 /* ConfigurationTarget.USER */;
                case TaskSourceKind.WorkspaceFile: return 5 /* ConfigurationTarget.WORKSPACE */;
                default: return 6 /* ConfigurationTarget.WORKSPACE_FOLDER */;
            }
        }
        TaskSourceKind.toConfigurationTarget = toConfigurationTarget;
    })(TaskSourceKind || (exports.TaskSourceKind = TaskSourceKind = {}));
    var DependsOrder;
    (function (DependsOrder) {
        DependsOrder["parallel"] = "parallel";
        DependsOrder["sequence"] = "sequence";
    })(DependsOrder || (exports.DependsOrder = DependsOrder = {}));
    var RunOnOptions;
    (function (RunOnOptions) {
        RunOnOptions[RunOnOptions["default"] = 1] = "default";
        RunOnOptions[RunOnOptions["folderOpen"] = 2] = "folderOpen";
    })(RunOnOptions || (exports.RunOnOptions = RunOnOptions = {}));
    var RunOptions;
    (function (RunOptions) {
        RunOptions.defaults = { reevaluateOnRerun: true, runOn: RunOnOptions.default, instanceLimit: 1 };
    })(RunOptions || (exports.RunOptions = RunOptions = {}));
    class CommonTask {
        constructor(id, label, type, runOptions, configurationProperties, source) {
            /**
             * The cached label.
             */
            this._label = '';
            this._id = id;
            if (label) {
                this._label = label;
            }
            if (type) {
                this.type = type;
            }
            this.runOptions = runOptions;
            this.configurationProperties = configurationProperties;
            this._source = source;
        }
        getDefinition(useSource) {
            return undefined;
        }
        getMapKey() {
            return this._id;
        }
        getRecentlyUsedKey() {
            return undefined;
        }
        getCommonTaskId() {
            const key = { folder: this.getFolderId(), id: this._id };
            return JSON.stringify(key);
        }
        clone() {
            return this.fromObject(Object.assign({}, this));
        }
        getWorkspaceFolder() {
            return undefined;
        }
        getWorkspaceFileName() {
            return undefined;
        }
        getTelemetryKind() {
            return 'unknown';
        }
        matches(key, compareId = false) {
            if (key === undefined) {
                return false;
            }
            if (Types.isString(key)) {
                return key === this._label || key === this.configurationProperties.identifier || (compareId && key === this._id);
            }
            const identifier = this.getDefinition(true);
            return identifier !== undefined && identifier._key === key._key;
        }
        getQualifiedLabel() {
            const workspaceFolder = this.getWorkspaceFolder();
            if (workspaceFolder) {
                return `${this._label} (${workspaceFolder.name})`;
            }
            else {
                return this._label;
            }
        }
        getTaskExecution() {
            const result = {
                id: this._id,
                task: this
            };
            return result;
        }
        addTaskLoadMessages(messages) {
            if (this._taskLoadMessages === undefined) {
                this._taskLoadMessages = [];
            }
            if (messages) {
                this._taskLoadMessages = this._taskLoadMessages.concat(messages);
            }
        }
        get taskLoadMessages() {
            return this._taskLoadMessages;
        }
    }
    exports.CommonTask = CommonTask;
    /**
     * For tasks of type shell or process, this is created upon parse
     * of the tasks.json or workspace file.
     * For ContributedTasks of all other types, this is the result of
     * resolving a ConfiguringTask.
     */
    class CustomTask extends CommonTask {
        constructor(id, source, label, type, command, hasDefinedMatchers, runOptions, configurationProperties) {
            super(id, label, undefined, runOptions, configurationProperties, source);
            /**
             * The command configuration
             */
            this.command = {};
            this._source = source;
            this.hasDefinedMatchers = hasDefinedMatchers;
            if (command) {
                this.command = command;
            }
        }
        clone() {
            return new CustomTask(this._id, this._source, this._label, this.type, this.command, this.hasDefinedMatchers, this.runOptions, this.configurationProperties);
        }
        customizes() {
            if (this._source && this._source.customizes) {
                return this._source.customizes;
            }
            return undefined;
        }
        getDefinition(useSource = false) {
            if (useSource && this._source.customizes !== undefined) {
                return this._source.customizes;
            }
            else {
                let type;
                const commandRuntime = this.command ? this.command.runtime : undefined;
                switch (commandRuntime) {
                    case RuntimeType.Shell:
                        type = 'shell';
                        break;
                    case RuntimeType.Process:
                        type = 'process';
                        break;
                    case RuntimeType.CustomExecution:
                        type = 'customExecution';
                        break;
                    case undefined:
                        type = '$composite';
                        break;
                    default:
                        throw new Error('Unexpected task runtime');
                }
                const result = {
                    type,
                    _key: this._id,
                    id: this._id
                };
                return result;
            }
        }
        static is(value) {
            return value instanceof CustomTask;
        }
        getMapKey() {
            const workspaceFolder = this._source.config.workspaceFolder;
            return workspaceFolder ? `${workspaceFolder.uri.toString()}|${this._id}|${this.instance}` : `${this._id}|${this.instance}`;
        }
        getFolderId() {
            return this._source.kind === TaskSourceKind.User ? exports.USER_TASKS_GROUP_KEY : this._source.config.workspaceFolder?.uri.toString();
        }
        getCommonTaskId() {
            return this._source.customizes ? super.getCommonTaskId() : (this.getRecentlyUsedKey() ?? super.getCommonTaskId());
        }
        getRecentlyUsedKey() {
            const workspaceFolder = this.getFolderId();
            if (!workspaceFolder) {
                return undefined;
            }
            let id = this.configurationProperties.identifier;
            if (this._source.kind !== TaskSourceKind.Workspace) {
                id += this._source.kind;
            }
            const key = { type: exports.CUSTOMIZED_TASK_TYPE, folder: workspaceFolder, id };
            return JSON.stringify(key);
        }
        getWorkspaceFolder() {
            return this._source.config.workspaceFolder;
        }
        getWorkspaceFileName() {
            return (this._source.config.workspace && this._source.config.workspace.configuration) ? resources.basename(this._source.config.workspace.configuration) : undefined;
        }
        getTelemetryKind() {
            if (this._source.customizes) {
                return 'workspace>extension';
            }
            else {
                return 'workspace';
            }
        }
        fromObject(object) {
            return new CustomTask(object._id, object._source, object._label, object.type, object.command, object.hasDefinedMatchers, object.runOptions, object.configurationProperties);
        }
    }
    exports.CustomTask = CustomTask;
    /**
     * After a contributed task has been parsed, but before
     * the task has been resolved via the extension, its properties
     * are stored in this
     */
    class ConfiguringTask extends CommonTask {
        constructor(id, source, label, type, configures, runOptions, configurationProperties) {
            super(id, label, type, runOptions, configurationProperties, source);
            this._source = source;
            this.configures = configures;
        }
        static is(value) {
            return value instanceof ConfiguringTask;
        }
        fromObject(object) {
            return object;
        }
        getDefinition() {
            return this.configures;
        }
        getWorkspaceFileName() {
            return (this._source.config.workspace && this._source.config.workspace.configuration) ? resources.basename(this._source.config.workspace.configuration) : undefined;
        }
        getWorkspaceFolder() {
            return this._source.config.workspaceFolder;
        }
        getFolderId() {
            return this._source.kind === TaskSourceKind.User ? exports.USER_TASKS_GROUP_KEY : this._source.config.workspaceFolder?.uri.toString();
        }
        getRecentlyUsedKey() {
            const workspaceFolder = this.getFolderId();
            if (!workspaceFolder) {
                return undefined;
            }
            let id = this.configurationProperties.identifier;
            if (this._source.kind !== TaskSourceKind.Workspace) {
                id += this._source.kind;
            }
            const key = { type: exports.CUSTOMIZED_TASK_TYPE, folder: workspaceFolder, id };
            return JSON.stringify(key);
        }
    }
    exports.ConfiguringTask = ConfiguringTask;
    /**
     * A task from an extension created via resolveTask or provideTask
     */
    class ContributedTask extends CommonTask {
        constructor(id, source, label, type, defines, command, hasDefinedMatchers, runOptions, configurationProperties) {
            super(id, label, type, runOptions, configurationProperties, source);
            this.defines = defines;
            this.hasDefinedMatchers = hasDefinedMatchers;
            this.command = command;
            this.icon = configurationProperties.icon;
            this.hide = configurationProperties.hide;
        }
        clone() {
            return new ContributedTask(this._id, this._source, this._label, this.type, this.defines, this.command, this.hasDefinedMatchers, this.runOptions, this.configurationProperties);
        }
        getDefinition() {
            return this.defines;
        }
        static is(value) {
            return value instanceof ContributedTask;
        }
        getMapKey() {
            const workspaceFolder = this._source.workspaceFolder;
            return workspaceFolder
                ? `${this._source.scope.toString()}|${workspaceFolder.uri.toString()}|${this._id}|${this.instance}`
                : `${this._source.scope.toString()}|${this._id}|${this.instance}`;
        }
        getFolderId() {
            if (this._source.scope === 3 /* TaskScope.Folder */ && this._source.workspaceFolder) {
                return this._source.workspaceFolder.uri.toString();
            }
            return undefined;
        }
        getRecentlyUsedKey() {
            const key = { type: 'contributed', scope: this._source.scope, id: this._id };
            key.folder = this.getFolderId();
            return JSON.stringify(key);
        }
        getWorkspaceFolder() {
            return this._source.workspaceFolder;
        }
        getTelemetryKind() {
            return 'extension';
        }
        fromObject(object) {
            return new ContributedTask(object._id, object._source, object._label, object.type, object.defines, object.command, object.hasDefinedMatchers, object.runOptions, object.configurationProperties);
        }
    }
    exports.ContributedTask = ContributedTask;
    class InMemoryTask extends CommonTask {
        constructor(id, source, label, type, runOptions, configurationProperties) {
            super(id, label, type, runOptions, configurationProperties, source);
            this._source = source;
        }
        clone() {
            return new InMemoryTask(this._id, this._source, this._label, this.type, this.runOptions, this.configurationProperties);
        }
        static is(value) {
            return value instanceof InMemoryTask;
        }
        getTelemetryKind() {
            return 'composite';
        }
        getMapKey() {
            return `${this._id}|${this.instance}`;
        }
        getFolderId() {
            return undefined;
        }
        fromObject(object) {
            return new InMemoryTask(object._id, object._source, object._label, object.type, object.runOptions, object.configurationProperties);
        }
    }
    exports.InMemoryTask = InMemoryTask;
    var ExecutionEngine;
    (function (ExecutionEngine) {
        ExecutionEngine[ExecutionEngine["Process"] = 1] = "Process";
        ExecutionEngine[ExecutionEngine["Terminal"] = 2] = "Terminal";
    })(ExecutionEngine || (exports.ExecutionEngine = ExecutionEngine = {}));
    (function (ExecutionEngine) {
        ExecutionEngine._default = ExecutionEngine.Terminal;
    })(ExecutionEngine || (exports.ExecutionEngine = ExecutionEngine = {}));
    var JsonSchemaVersion;
    (function (JsonSchemaVersion) {
        JsonSchemaVersion[JsonSchemaVersion["V0_1_0"] = 1] = "V0_1_0";
        JsonSchemaVersion[JsonSchemaVersion["V2_0_0"] = 2] = "V2_0_0";
    })(JsonSchemaVersion || (exports.JsonSchemaVersion = JsonSchemaVersion = {}));
    class TaskSorter {
        constructor(workspaceFolders) {
            this._order = new Map();
            for (let i = 0; i < workspaceFolders.length; i++) {
                this._order.set(workspaceFolders[i].uri.toString(), i);
            }
        }
        compare(a, b) {
            const aw = a.getWorkspaceFolder();
            const bw = b.getWorkspaceFolder();
            if (aw && bw) {
                let ai = this._order.get(aw.uri.toString());
                ai = ai === undefined ? 0 : ai + 1;
                let bi = this._order.get(bw.uri.toString());
                bi = bi === undefined ? 0 : bi + 1;
                if (ai === bi) {
                    return a._label.localeCompare(b._label);
                }
                else {
                    return ai - bi;
                }
            }
            else if (!aw && bw) {
                return -1;
            }
            else if (aw && !bw) {
                return +1;
            }
            else {
                return 0;
            }
        }
    }
    exports.TaskSorter = TaskSorter;
    var TaskEventKind;
    (function (TaskEventKind) {
        TaskEventKind["DependsOnStarted"] = "dependsOnStarted";
        TaskEventKind["AcquiredInput"] = "acquiredInput";
        TaskEventKind["Start"] = "start";
        TaskEventKind["ProcessStarted"] = "processStarted";
        TaskEventKind["Active"] = "active";
        TaskEventKind["Inactive"] = "inactive";
        TaskEventKind["Changed"] = "changed";
        TaskEventKind["Terminated"] = "terminated";
        TaskEventKind["ProcessEnded"] = "processEnded";
        TaskEventKind["End"] = "end";
    })(TaskEventKind || (exports.TaskEventKind = TaskEventKind = {}));
    var TaskRunType;
    (function (TaskRunType) {
        TaskRunType["SingleRun"] = "singleRun";
        TaskRunType["Background"] = "background";
    })(TaskRunType || (exports.TaskRunType = TaskRunType = {}));
    var TaskRunSource;
    (function (TaskRunSource) {
        TaskRunSource[TaskRunSource["System"] = 0] = "System";
        TaskRunSource[TaskRunSource["User"] = 1] = "User";
        TaskRunSource[TaskRunSource["FolderOpen"] = 2] = "FolderOpen";
        TaskRunSource[TaskRunSource["ConfigurationChange"] = 3] = "ConfigurationChange";
        TaskRunSource[TaskRunSource["Reconnect"] = 4] = "Reconnect";
    })(TaskRunSource || (exports.TaskRunSource = TaskRunSource = {}));
    var TaskEvent;
    (function (TaskEvent) {
        function common(task) {
            return {
                taskId: task._id,
                taskName: task.configurationProperties.name,
                runType: task.configurationProperties.isBackground ? "background" /* TaskRunType.Background */ : "singleRun" /* TaskRunType.SingleRun */,
                group: task.configurationProperties.group,
                __task: task,
            };
        }
        function start(task, terminalId, resolvedVariables) {
            return {
                ...common(task),
                kind: "start" /* TaskEventKind.Start */,
                terminalId,
                resolvedVariables,
            };
        }
        TaskEvent.start = start;
        function processStarted(task, terminalId, processId) {
            return {
                ...common(task),
                kind: "processStarted" /* TaskEventKind.ProcessStarted */,
                terminalId,
                processId,
            };
        }
        TaskEvent.processStarted = processStarted;
        function processEnded(task, terminalId, exitCode) {
            return {
                ...common(task),
                kind: "processEnded" /* TaskEventKind.ProcessEnded */,
                terminalId,
                exitCode,
            };
        }
        TaskEvent.processEnded = processEnded;
        function terminated(task, terminalId, exitReason) {
            return {
                ...common(task),
                kind: "terminated" /* TaskEventKind.Terminated */,
                exitReason,
                terminalId,
            };
        }
        TaskEvent.terminated = terminated;
        function general(kind, task, terminalId) {
            return {
                ...common(task),
                kind,
                terminalId,
            };
        }
        TaskEvent.general = general;
        function changed() {
            return { kind: "changed" /* TaskEventKind.Changed */ };
        }
        TaskEvent.changed = changed;
    })(TaskEvent || (exports.TaskEvent = TaskEvent = {}));
    var KeyedTaskIdentifier;
    (function (KeyedTaskIdentifier) {
        function sortedStringify(literal) {
            const keys = Object.keys(literal).sort();
            let result = '';
            for (const key of keys) {
                let stringified = literal[key];
                if (stringified instanceof Object) {
                    stringified = sortedStringify(stringified);
                }
                else if (typeof stringified === 'string') {
                    stringified = stringified.replace(/,/g, ',,');
                }
                result += key + ',' + stringified + ',';
            }
            return result;
        }
        function create(value) {
            const resultKey = sortedStringify(value);
            const result = { _key: resultKey, type: value.taskType };
            Object.assign(result, value);
            return result;
        }
        KeyedTaskIdentifier.create = create;
    })(KeyedTaskIdentifier || (exports.KeyedTaskIdentifier = KeyedTaskIdentifier = {}));
    var TaskSettingId;
    (function (TaskSettingId) {
        TaskSettingId["AutoDetect"] = "task.autoDetect";
        TaskSettingId["SaveBeforeRun"] = "task.saveBeforeRun";
        TaskSettingId["ShowDecorations"] = "task.showDecorations";
        TaskSettingId["ProblemMatchersNeverPrompt"] = "task.problemMatchers.neverPrompt";
        TaskSettingId["SlowProviderWarning"] = "task.slowProviderWarning";
        TaskSettingId["QuickOpenHistory"] = "task.quickOpen.history";
        TaskSettingId["QuickOpenDetail"] = "task.quickOpen.detail";
        TaskSettingId["QuickOpenSkip"] = "task.quickOpen.skip";
        TaskSettingId["QuickOpenShowAll"] = "task.quickOpen.showAll";
        TaskSettingId["AllowAutomaticTasks"] = "task.allowAutomaticTasks";
        TaskSettingId["Reconnection"] = "task.reconnection";
    })(TaskSettingId || (exports.TaskSettingId = TaskSettingId = {}));
    var TasksSchemaProperties;
    (function (TasksSchemaProperties) {
        TasksSchemaProperties["Tasks"] = "tasks";
        TasksSchemaProperties["SuppressTaskName"] = "tasks.suppressTaskName";
        TasksSchemaProperties["Windows"] = "tasks.windows";
        TasksSchemaProperties["Osx"] = "tasks.osx";
        TasksSchemaProperties["Linux"] = "tasks.linux";
        TasksSchemaProperties["ShowOutput"] = "tasks.showOutput";
        TasksSchemaProperties["IsShellCommand"] = "tasks.isShellCommand";
        TasksSchemaProperties["ServiceTestSetting"] = "tasks.service.testSetting";
    })(TasksSchemaProperties || (exports.TasksSchemaProperties = TasksSchemaProperties = {}));
    var TaskDefinition;
    (function (TaskDefinition) {
        function createTaskIdentifier(external, reporter) {
            const definition = taskDefinitionRegistry_1.TaskDefinitionRegistry.get(external.type);
            if (definition === undefined) {
                // We have no task definition so we can't sanitize the literal. Take it as is
                const copy = Objects.deepClone(external);
                delete copy._key;
                return KeyedTaskIdentifier.create(copy);
            }
            const literal = Object.create(null);
            literal.type = definition.taskType;
            const required = new Set();
            definition.required.forEach(element => required.add(element));
            const properties = definition.properties;
            for (const property of Object.keys(properties)) {
                const value = external[property];
                if (value !== undefined && value !== null) {
                    literal[property] = value;
                }
                else if (required.has(property)) {
                    const schema = properties[property];
                    if (schema.default !== undefined) {
                        literal[property] = Objects.deepClone(schema.default);
                    }
                    else {
                        switch (schema.type) {
                            case 'boolean':
                                literal[property] = false;
                                break;
                            case 'number':
                            case 'integer':
                                literal[property] = 0;
                                break;
                            case 'string':
                                literal[property] = '';
                                break;
                            default:
                                reporter.error(nls.localize('TaskDefinition.missingRequiredProperty', 'Error: the task identifier \'{0}\' is missing the required property \'{1}\'. The task identifier will be ignored.', JSON.stringify(external, undefined, 0), property));
                                return undefined;
                        }
                    }
                }
            }
            return KeyedTaskIdentifier.create(literal);
        }
        TaskDefinition.createTaskIdentifier = createTaskIdentifier;
    })(TaskDefinition || (exports.TaskDefinition = TaskDefinition = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFza3MuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90YXNrcy9jb21tb24vdGFza3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBbUJuRixRQUFBLG9CQUFvQixHQUFHLFVBQVUsQ0FBQztJQUVsQyxRQUFBLGtCQUFrQixHQUFHLElBQUksMEJBQWEsQ0FBVSxhQUFhLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsMEJBQTBCLEVBQUUsc0NBQXNDLENBQUMsQ0FBQyxDQUFDO0lBQ3hKLFFBQUEsY0FBYyxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsZUFBZSxFQUFFLE9BQU8sQ0FBQyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsQ0FBQztJQUVuRyxJQUFZLFlBZVg7SUFmRCxXQUFZLFlBQVk7UUFDdkI7O1dBRUc7UUFDSCxtREFBVSxDQUFBO1FBRVY7O1dBRUc7UUFDSCxtREFBVSxDQUFBO1FBRVY7O1dBRUc7UUFDSCwrQ0FBUSxDQUFBO0lBQ1QsQ0FBQyxFQWZXLFlBQVksNEJBQVosWUFBWSxRQWV2QjtJQUVZLFFBQUEsb0JBQW9CLEdBQUcsYUFBYSxDQUFDO0lBRWxELFdBQWlCLFlBQVk7UUFDNUIsU0FBZ0IsSUFBSSxDQUFhLEtBQWE7WUFDN0MsSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDWCxPQUFPLFlBQVksQ0FBQyxNQUFNLENBQUM7YUFDM0I7WUFDRCxRQUFRLEtBQUssQ0FBQyxXQUFXLEVBQUUsRUFBRTtnQkFDNUIsS0FBSyxRQUFRO29CQUNaLE9BQU8sWUFBWSxDQUFDLE1BQU0sQ0FBQztnQkFDNUIsS0FBSyxRQUFRO29CQUNaLE9BQU8sWUFBWSxDQUFDLE1BQU0sQ0FBQztnQkFDNUIsS0FBSyxNQUFNO29CQUNWLE9BQU8sWUFBWSxDQUFDLElBQUksQ0FBQztnQkFD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