/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/tasks/common/tasks", "vs/base/common/types", "vs/base/common/resources", "vs/base/common/objects", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/tasks/common/taskDefinitionRegistry"], function (require, exports, nls, Types, resources, Objects, contextkey_1, taskDefinitionRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TaskDefinition = exports.TasksSchemaProperties = exports.TaskSettingId = exports.KeyedTaskIdentifier = exports.TaskEvent = exports.TaskRunSource = exports.TaskRunType = exports.TaskEventKind = exports.$iG = exports.JsonSchemaVersion = exports.ExecutionEngine = exports.$hG = exports.$gG = exports.$fG = exports.$eG = exports.$dG = exports.RunOptions = exports.RunOnOptions = exports.DependsOrder = exports.TaskSourceKind = exports.TaskScope = exports.TaskGroup = exports.CommandString = exports.RuntimeType = exports.PresentationOptions = exports.PanelKind = exports.RevealProblemKind = exports.RevealKind = exports.CommandOptions = exports.$cG = exports.ShellQuoting = exports.$bG = exports.$aG = exports.$_F = void 0;
    exports.$_F = 'settings';
    exports.$aG = new contextkey_1.$2i('taskRunning', false, nls.localize(0, null));
    exports.$bG = { value: nls.localize(1, null), original: 'Tasks' };
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
    exports.$cG = '$customized';
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
            if (Types.$jf(value)) {
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
            else if (Types.$jf(value)) {
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
    class $dG {
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
            const key = { folder: this.d(), id: this._id };
            return JSON.stringify(key);
        }
        clone() {
            return this.f(Object.assign({}, this));
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
            if (Types.$jf(key)) {
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
            if (this.c === undefined) {
                this.c = [];
            }
            if (messages) {
                this.c = this.c.concat(messages);
            }
        }
        get taskLoadMessages() {
            return this.c;
        }
    }
    exports.$dG = $dG;
    /**
     * For tasks of type shell or process, this is created upon parse
     * of the tasks.json or workspace file.
     * For ContributedTasks of all other types, this is the result of
     * resolving a ConfiguringTask.
     */
    class $eG extends $dG {
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
            return new $eG(this._id, this._source, this._label, this.type, this.command, this.hasDefinedMatchers, this.runOptions, this.configurationProperties);
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
            return value instanceof $eG;
        }
        getMapKey() {
            const workspaceFolder = this._source.config.workspaceFolder;
            return workspaceFolder ? `${workspaceFolder.uri.toString()}|${this._id}|${this.instance}` : `${this._id}|${this.instance}`;
        }
        d() {
            return this._source.kind === TaskSourceKind.User ? exports.$_F : this._source.config.workspaceFolder?.uri.toString();
        }
        getCommonTaskId() {
            return this._source.customizes ? super.getCommonTaskId() : (this.getRecentlyUsedKey() ?? super.getCommonTaskId());
        }
        getRecentlyUsedKey() {
            const workspaceFolder = this.d();
            if (!workspaceFolder) {
                return undefined;
            }
            let id = this.configurationProperties.identifier;
            if (this._source.kind !== TaskSourceKind.Workspace) {
                id += this._source.kind;
            }
            const key = { type: exports.$cG, folder: workspaceFolder, id };
            return JSON.stringify(key);
        }
        getWorkspaceFolder() {
            return this._source.config.workspaceFolder;
        }
        getWorkspaceFileName() {
            return (this._source.config.workspace && this._source.config.workspace.configuration) ? resources.$fg(this._source.config.workspace.configuration) : undefined;
        }
        getTelemetryKind() {
            if (this._source.customizes) {
                return 'workspace>extension';
            }
            else {
                return 'workspace';
            }
        }
        f(object) {
            return new $eG(object._id, object._source, object._label, object.type, object.command, object.hasDefinedMatchers, object.runOptions, object.configurationProperties);
        }
    }
    exports.$eG = $eG;
    /**
     * After a contributed task has been parsed, but before
     * the task has been resolved via the extension, its properties
     * are stored in this
     */
    class $fG extends $dG {
        constructor(id, source, label, type, configures, runOptions, configurationProperties) {
            super(id, label, type, runOptions, configurationProperties, source);
            this._source = source;
            this.configures = configures;
        }
        static is(value) {
            return value instanceof $fG;
        }
        f(object) {
            return object;
        }
        getDefinition() {
            return this.configures;
        }
        getWorkspaceFileName() {
            return (this._source.config.workspace && this._source.config.workspace.configuration) ? resources.$fg(this._source.config.workspace.configuration) : undefined;
        }
        getWorkspaceFolder() {
            return this._source.config.workspaceFolder;
        }
        d() {
            return this._source.kind === TaskSourceKind.User ? exports.$_F : this._source.config.workspaceFolder?.uri.toString();
        }
        getRecentlyUsedKey() {
            const workspaceFolder = this.d();
            if (!workspaceFolder) {
                return undefined;
            }
            let id = this.configurationProperties.identifier;
            if (this._source.kind !== TaskSourceKind.Workspace) {
                id += this._source.kind;
            }
            const key = { type: exports.$cG, folder: workspaceFolder, id };
            return JSON.stringify(key);
        }
    }
    exports.$fG = $fG;
    /**
     * A task from an extension created via resolveTask or provideTask
     */
    class $gG extends $dG {
        constructor(id, source, label, type, defines, command, hasDefinedMatchers, runOptions, configurationProperties) {
            super(id, label, type, runOptions, configurationProperties, source);
            this.defines = defines;
            this.hasDefinedMatchers = hasDefinedMatchers;
            this.command = command;
            this.icon = configurationProperties.icon;
            this.hide = configurationProperties.hide;
        }
        clone() {
            return new $gG(this._id, this._source, this._label, this.type, this.defines, this.command, this.hasDefinedMatchers, this.runOptions, this.configurationProperties);
        }
        getDefinition() {
            return this.defines;
        }
        static is(value) {
            return value instanceof $gG;
        }
        getMapKey() {
            const workspaceFolder = this._source.workspaceFolder;
            return workspaceFolder
                ? `${this._source.scope.toString()}|${workspaceFolder.uri.toString()}|${this._id}|${this.instance}`
                : `${this._source.scope.toString()}|${this._id}|${this.instance}`;
        }
        d() {
            if (this._source.scope === 3 /* TaskScope.Folder */ && this._source.workspaceFolder) {
                return this._source.workspaceFolder.uri.toString();
            }
            return undefined;
        }
        getRecentlyUsedKey() {
            const key = { type: 'contributed', scope: this._source.scope, id: this._id };
            key.folder = this.d();
            return JSON.stringify(key);
        }
        getWorkspaceFolder() {
            return this._source.workspaceFolder;
        }
        getTelemetryKind() {
            return 'extension';
        }
        f(object) {
            return new $gG(object._id, object._source, object._label, object.type, object.defines, object.command, object.hasDefinedMatchers, object.runOptions, object.configurationProperties);
        }
    }
    exports.$gG = $gG;
    class $hG extends $dG {
        constructor(id, source, label, type, runOptions, configurationProperties) {
            super(id, label, type, runOptions, configurationProperties, source);
            this._source = source;
        }
        clone() {
            return new $hG(this._id, this._source, this._label, this.type, this.runOptions, this.configurationProperties);
        }
        static is(value) {
            return value instanceof $hG;
        }
        getTelemetryKind() {
            return 'composite';
        }
        getMapKey() {
            return `${this._id}|${this.instance}`;
        }
        d() {
            return undefined;
        }
        f(object) {
            return new $hG(object._id, object._source, object._label, object.type, object.runOptions, object.configurationProperties);
        }
    }
    exports.$hG = $hG;
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
    class $iG {
        constructor(workspaceFolders) {
            this.c = new Map();
            for (let i = 0; i < workspaceFolders.length; i++) {
                this.c.set(workspaceFolders[i].uri.toString(), i);
            }
        }
        compare(a, b) {
            const aw = a.getWorkspaceFolder();
            const bw = b.getWorkspaceFolder();
            if (aw && bw) {
                let ai = this.c.get(aw.uri.toString());
                ai = ai === undefined ? 0 : ai + 1;
                let bi = this.c.get(bw.uri.toString());
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
    exports.$iG = $iG;
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
            const definition = taskDefinitionRegistry_1.$$F.get(external.type);
            if (definition === undefined) {
                // We have no task definition so we can't sanitize the literal. Take it as is
                const copy = Objects.$Vm(external);
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
                        literal[property] = Objects.$Vm(schema.default);
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
                                reporter.error(nls.localize(2, null, JSON.stringify(external, undefined, 0), property));
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
//# sourceMappingURL=tasks.js.map