/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/objects", "vs/base/common/types", "vs/base/common/uuid", "vs/workbench/contrib/tasks/common/problemMatcher", "./tasks", "./taskDefinitionRegistry", "vs/workbench/contrib/tasks/common/taskService"], function (require, exports, nls, Objects, Types, UUID, problemMatcher_1, Tasks, taskDefinitionRegistry_1, taskService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createCustomTask = exports.parse = exports.TaskConfigSource = exports.UUIDMap = exports.JsonSchemaVersion = exports.ExecutionEngine = exports.TaskParser = exports.GroupKind = exports.ProblemMatcherConverter = exports.RunOptions = exports.RunOnOptions = exports.CommandString = exports.ITaskIdentifier = exports.ShellQuoting = void 0;
    var ShellQuoting;
    (function (ShellQuoting) {
        /**
         * Default is character escaping.
         */
        ShellQuoting[ShellQuoting["escape"] = 1] = "escape";
        /**
         * Default is strong quoting
         */
        ShellQuoting[ShellQuoting["strong"] = 2] = "strong";
        /**
         * Default is weak quoting.
         */
        ShellQuoting[ShellQuoting["weak"] = 3] = "weak";
    })(ShellQuoting || (exports.ShellQuoting = ShellQuoting = {}));
    var ITaskIdentifier;
    (function (ITaskIdentifier) {
        function is(value) {
            const candidate = value;
            return candidate !== undefined && Types.isString(value.type);
        }
        ITaskIdentifier.is = is;
    })(ITaskIdentifier || (exports.ITaskIdentifier = ITaskIdentifier = {}));
    var CommandString;
    (function (CommandString) {
        function value(value) {
            if (Types.isString(value)) {
                return value;
            }
            else if (Types.isStringArray(value)) {
                return value.join(' ');
            }
            else {
                if (Types.isString(value.value)) {
                    return value.value;
                }
                else {
                    return value.value.join(' ');
                }
            }
        }
        CommandString.value = value;
    })(CommandString || (exports.CommandString = CommandString = {}));
    var ProblemMatcherKind;
    (function (ProblemMatcherKind) {
        ProblemMatcherKind[ProblemMatcherKind["Unknown"] = 0] = "Unknown";
        ProblemMatcherKind[ProblemMatcherKind["String"] = 1] = "String";
        ProblemMatcherKind[ProblemMatcherKind["ProblemMatcher"] = 2] = "ProblemMatcher";
        ProblemMatcherKind[ProblemMatcherKind["Array"] = 3] = "Array";
    })(ProblemMatcherKind || (ProblemMatcherKind = {}));
    const EMPTY_ARRAY = [];
    Object.freeze(EMPTY_ARRAY);
    function assignProperty(target, source, key) {
        const sourceAtKey = source[key];
        if (sourceAtKey !== undefined) {
            target[key] = sourceAtKey;
        }
    }
    function fillProperty(target, source, key) {
        const sourceAtKey = source[key];
        if (target[key] === undefined && sourceAtKey !== undefined) {
            target[key] = sourceAtKey;
        }
    }
    function _isEmpty(value, properties, allowEmptyArray = false) {
        if (value === undefined || value === null || properties === undefined) {
            return true;
        }
        for (const meta of properties) {
            const property = value[meta.property];
            if (property !== undefined && property !== null) {
                if (meta.type !== undefined && !meta.type.isEmpty(property)) {
                    return false;
                }
                else if (!Array.isArray(property) || (property.length > 0) || allowEmptyArray) {
                    return false;
                }
            }
        }
        return true;
    }
    function _assignProperties(target, source, properties) {
        if (!source || _isEmpty(source, properties)) {
            return target;
        }
        if (!target || _isEmpty(target, properties)) {
            return source;
        }
        for (const meta of properties) {
            const property = meta.property;
            let value;
            if (meta.type !== undefined) {
                value = meta.type.assignProperties(target[property], source[property]);
            }
            else {
                value = source[property];
            }
            if (value !== undefined && value !== null) {
                target[property] = value;
            }
        }
        return target;
    }
    function _fillProperties(target, source, properties, allowEmptyArray = false) {
        if (!source || _isEmpty(source, properties)) {
            return target;
        }
        if (!target || _isEmpty(target, properties, allowEmptyArray)) {
            return source;
        }
        for (const meta of properties) {
            const property = meta.property;
            let value;
            if (meta.type) {
                value = meta.type.fillProperties(target[property], source[property]);
            }
            else if (target[property] === undefined) {
                value = source[property];
            }
            if (value !== undefined && value !== null) {
                target[property] = value;
            }
        }
        return target;
    }
    function _fillDefaults(target, defaults, properties, context) {
        if (target && Object.isFrozen(target)) {
            return target;
        }
        if (target === undefined || target === null || defaults === undefined || defaults === null) {
            if (defaults !== undefined && defaults !== null) {
                return Objects.deepClone(defaults);
            }
            else {
                return undefined;
            }
        }
        for (const meta of properties) {
            const property = meta.property;
            if (target[property] !== undefined) {
                continue;
            }
            let value;
            if (meta.type) {
                value = meta.type.fillDefaults(target[property], context);
            }
            else {
                value = defaults[property];
            }
            if (value !== undefined && value !== null) {
                target[property] = value;
            }
        }
        return target;
    }
    function _freeze(target, properties) {
        if (target === undefined || target === null) {
            return undefined;
        }
        if (Object.isFrozen(target)) {
            return target;
        }
        for (const meta of properties) {
            if (meta.type) {
                const value = target[meta.property];
                if (value) {
                    meta.type.freeze(value);
                }
            }
        }
        Object.freeze(target);
        return target;
    }
    var RunOnOptions;
    (function (RunOnOptions) {
        function fromString(value) {
            if (!value) {
                return Tasks.RunOnOptions.default;
            }
            switch (value.toLowerCase()) {
                case 'folderopen':
                    return Tasks.RunOnOptions.folderOpen;
                case 'default':
                default:
                    return Tasks.RunOnOptions.default;
            }
        }
        RunOnOptions.fromString = fromString;
    })(RunOnOptions || (exports.RunOnOptions = RunOnOptions = {}));
    var RunOptions;
    (function (RunOptions) {
        const properties = [{ property: 'reevaluateOnRerun' }, { property: 'runOn' }, { property: 'instanceLimit' }];
        function fromConfiguration(value) {
            return {
                reevaluateOnRerun: value ? value.reevaluateOnRerun : true,
                runOn: value ? RunOnOptions.fromString(value.runOn) : Tasks.RunOnOptions.default,
                instanceLimit: value ? value.instanceLimit : 1
            };
        }
        RunOptions.fromConfiguration = fromConfiguration;
        function assignProperties(target, source) {
            return _assignProperties(target, source, properties);
        }
        RunOptions.assignProperties = assignProperties;
        function fillProperties(target, source) {
            return _fillProperties(target, source, properties);
        }
        RunOptions.fillProperties = fillProperties;
    })(RunOptions || (exports.RunOptions = RunOptions = {}));
    var ShellConfiguration;
    (function (ShellConfiguration) {
        const properties = [{ property: 'executable' }, { property: 'args' }, { property: 'quoting' }];
        function is(value) {
            const candidate = value;
            return candidate && (Types.isString(candidate.executable) || Types.isStringArray(candidate.args));
        }
        ShellConfiguration.is = is;
        function from(config, context) {
            if (!is(config)) {
                return undefined;
            }
            const result = {};
            if (config.executable !== undefined) {
                result.executable = config.executable;
            }
            if (config.args !== undefined) {
                result.args = config.args.slice();
            }
            if (config.quoting !== undefined) {
                result.quoting = Objects.deepClone(config.quoting);
            }
            return result;
        }
        ShellConfiguration.from = from;
        function isEmpty(value) {
            return _isEmpty(value, properties, true);
        }
        ShellConfiguration.isEmpty = isEmpty;
        function assignProperties(target, source) {
            return _assignProperties(target, source, properties);
        }
        ShellConfiguration.assignProperties = assignProperties;
        function fillProperties(target, source) {
            return _fillProperties(target, source, properties, true);
        }
        ShellConfiguration.fillProperties = fillProperties;
        function fillDefaults(value, context) {
            return value;
        }
        ShellConfiguration.fillDefaults = fillDefaults;
        function freeze(value) {
            if (!value) {
                return undefined;
            }
            return Object.freeze(value);
        }
        ShellConfiguration.freeze = freeze;
    })(ShellConfiguration || (ShellConfiguration = {}));
    var CommandOptions;
    (function (CommandOptions) {
        const properties = [{ property: 'cwd' }, { property: 'env' }, { property: 'shell', type: ShellConfiguration }];
        const defaults = { cwd: '${workspaceFolder}' };
        function from(options, context) {
            const result = {};
            if (options.cwd !== undefined) {
                if (Types.isString(options.cwd)) {
                    result.cwd = options.cwd;
                }
                else {
                    context.taskLoadIssues.push(nls.localize('ConfigurationParser.invalidCWD', 'Warning: options.cwd must be of type string. Ignoring value {0}\n', options.cwd));
                }
            }
            if (options.env !== undefined) {
                result.env = Objects.deepClone(options.env);
            }
            result.shell = ShellConfiguration.from(options.shell, context);
            return isEmpty(result) ? undefined : result;
        }
        CommandOptions.from = from;
        function isEmpty(value) {
            return _isEmpty(value, properties);
        }
        CommandOptions.isEmpty = isEmpty;
        function assignProperties(target, source) {
            if ((source === undefined) || isEmpty(source)) {
                return target;
            }
            if ((target === undefined) || isEmpty(target)) {
                return source;
            }
            assignProperty(target, source, 'cwd');
            if (target.env === undefined) {
                target.env = source.env;
            }
            else if (source.env !== undefined) {
                const env = Object.create(null);
                if (target.env !== undefined) {
                    Object.keys(target.env).forEach(key => env[key] = target.env[key]);
                }
                if (source.env !== undefined) {
                    Object.keys(source.env).forEach(key => env[key] = source.env[key]);
                }
                target.env = env;
            }
            target.shell = ShellConfiguration.assignProperties(target.shell, source.shell);
            return target;
        }
        CommandOptions.assignProperties = assignProperties;
        function fillProperties(target, source) {
            return _fillProperties(target, source, properties);
        }
        CommandOptions.fillProperties = fillProperties;
        function fillDefaults(value, context) {
            return _fillDefaults(value, defaults, properties, context);
        }
        CommandOptions.fillDefaults = fillDefaults;
        function freeze(value) {
            return _freeze(value, properties);
        }
        CommandOptions.freeze = freeze;
    })(CommandOptions || (CommandOptions = {}));
    var CommandConfiguration;
    (function (CommandConfiguration) {
        let PresentationOptions;
        (function (PresentationOptions) {
            const properties = [{ property: 'echo' }, { property: 'reveal' }, { property: 'revealProblems' }, { property: 'focus' }, { property: 'panel' }, { property: 'showReuseMessage' }, { property: 'clear' }, { property: 'group' }, { property: 'close' }];
            function from(config, context) {
                let echo;
                let reveal;
                let revealProblems;
                let focus;
                let panel;
                let showReuseMessage;
                let clear;
                let group;
                let close;
                let hasProps = false;
                if (Types.isBoolean(config.echoCommand)) {
                    echo = config.echoCommand;
                    hasProps = true;
                }
                if (Types.isString(config.showOutput)) {
                    reveal = Tasks.RevealKind.fromString(config.showOutput);
                    hasProps = true;
                }
                const presentation = config.presentation || config.terminal;
                if (presentation) {
                    if (Types.isBoolean(presentation.echo)) {
                        echo = presentation.echo;
                    }
                    if (Types.isString(presentation.reveal)) {
                        reveal = Tasks.RevealKind.fromString(presentation.reveal);
                    }
                    if (Types.isString(presentation.revealProblems)) {
                        revealProblems = Tasks.RevealProblemKind.fromString(presentation.revealProblems);
                    }
                    if (Types.isBoolean(presentation.focus)) {
                        focus = presentation.focus;
                    }
                    if (Types.isString(presentation.panel)) {
                        panel = Tasks.PanelKind.fromString(presentation.panel);
                    }
                    if (Types.isBoolean(presentation.showReuseMessage)) {
                        showReuseMessage = presentation.showReuseMessage;
                    }
                    if (Types.isBoolean(presentation.clear)) {
                        clear = presentation.clear;
                    }
                    if (Types.isString(presentation.group)) {
                        group = presentation.group;
                    }
                    if (Types.isBoolean(presentation.close)) {
                        close = presentation.close;
                    }
                    hasProps = true;
                }
                if (!hasProps) {
                    return undefined;
                }
                return { echo: echo, reveal: reveal, revealProblems: revealProblems, focus: focus, panel: panel, showReuseMessage: showReuseMessage, clear: clear, group, close: close };
            }
            PresentationOptions.from = from;
            function assignProperties(target, source) {
                return _assignProperties(target, source, properties);
            }
            PresentationOptions.assignProperties = assignProperties;
            function fillProperties(target, source) {
                return _fillProperties(target, source, properties);
            }
            PresentationOptions.fillProperties = fillProperties;
            function fillDefaults(value, context) {
                const defaultEcho = context.engine === Tasks.ExecutionEngine.Terminal ? true : false;
                return _fillDefaults(value, { echo: defaultEcho, reveal: Tasks.RevealKind.Always, revealProblems: Tasks.RevealProblemKind.Never, focus: false, panel: Tasks.PanelKind.Shared, showReuseMessage: true, clear: false }, properties, context);
            }
            PresentationOptions.fillDefaults = fillDefaults;
            function freeze(value) {
                return _freeze(value, properties);
            }
            PresentationOptions.freeze = freeze;
            function isEmpty(value) {
                return _isEmpty(value, properties);
            }
            PresentationOptions.isEmpty = isEmpty;
        })(PresentationOptions = CommandConfiguration.PresentationOptions || (CommandConfiguration.PresentationOptions = {}));
        let ShellString;
        (function (ShellString) {
            function from(value) {
                if (value === undefined || value === null) {
                    return undefined;
                }
                if (Types.isString(value)) {
                    return value;
                }
                else if (Types.isStringArray(value)) {
                    return value.join(' ');
                }
                else {
                    const quoting = Tasks.ShellQuoting.from(value.quoting);
                    const result = Types.isString(value.value) ? value.value : Types.isStringArray(value.value) ? value.value.join(' ') : undefined;
                    if (result) {
                        return {
                            value: result,
                            quoting: quoting
                        };
                    }
                    else {
                        return undefined;
                    }
                }
            }
            ShellString.from = from;
        })(ShellString || (ShellString = {}));
        const properties = [
            { property: 'runtime' }, { property: 'name' }, { property: 'options', type: CommandOptions },
            { property: 'args' }, { property: 'taskSelector' }, { property: 'suppressTaskName' },
            { property: 'presentation', type: PresentationOptions }
        ];
        function from(config, context) {
            let result = fromBase(config, context);
            let osConfig = undefined;
            if (config.windows && context.platform === 3 /* Platform.Windows */) {
                osConfig = fromBase(config.windows, context);
            }
            else if (config.osx && context.platform === 1 /* Platform.Mac */) {
                osConfig = fromBase(config.osx, context);
            }
            else if (config.linux && context.platform === 2 /* Platform.Linux */) {
                osConfig = fromBase(config.linux, context);
            }
            if (osConfig) {
                result = assignProperties(result, osConfig, context.schemaVersion === 2 /* Tasks.JsonSchemaVersion.V2_0_0 */);
            }
            return isEmpty(result) ? undefined : result;
        }
        CommandConfiguration.from = from;
        function fromBase(config, context) {
            const name = ShellString.from(config.command);
            let runtime;
            if (Types.isString(config.type)) {
                if (config.type === 'shell' || config.type === 'process') {
                    runtime = Tasks.RuntimeType.fromString(config.type);
                }
            }
            const isShellConfiguration = ShellConfiguration.is(config.isShellCommand);
            if (Types.isBoolean(config.isShellCommand) || isShellConfiguration) {
                runtime = Tasks.RuntimeType.Shell;
            }
            else if (config.isShellCommand !== undefined) {
                runtime = !!config.isShellCommand ? Tasks.RuntimeType.Shell : Tasks.RuntimeType.Process;
            }
            const result = {
                name: name,
                runtime: runtime,
                presentation: PresentationOptions.from(config, context)
            };
            if (config.args !== undefined) {
                result.args = [];
                for (const arg of config.args) {
                    const converted = ShellString.from(arg);
                    if (converted !== undefined) {
                        result.args.push(converted);
                    }
                    else {
                        context.taskLoadIssues.push(nls.localize('ConfigurationParser.inValidArg', 'Error: command argument must either be a string or a quoted string. Provided value is:\n{0}', arg ? JSON.stringify(arg, undefined, 4) : 'undefined'));
                    }
                }
            }
            if (config.options !== undefined) {
                result.options = CommandOptions.from(config.options, context);
                if (result.options && result.options.shell === undefined && isShellConfiguration) {
                    result.options.shell = ShellConfiguration.from(config.isShellCommand, context);
                    if (context.engine !== Tasks.ExecutionEngine.Terminal) {
                        context.taskLoadIssues.push(nls.localize('ConfigurationParser.noShell', 'Warning: shell configuration is only supported when executing tasks in the terminal.'));
                    }
                }
            }
            if (Types.isString(config.taskSelector)) {
                result.taskSelector = config.taskSelector;
            }
            if (Types.isBoolean(config.suppressTaskName)) {
                result.suppressTaskName = config.suppressTaskName;
            }
            return isEmpty(result) ? undefined : result;
        }
        function hasCommand(value) {
            return value && !!value.name;
        }
        CommandConfiguration.hasCommand = hasCommand;
        function isEmpty(value) {
            return _isEmpty(value, properties);
        }
        CommandConfiguration.isEmpty = isEmpty;
        function assignProperties(target, source, overwriteArgs) {
            if (isEmpty(source)) {
                return target;
            }
            if (isEmpty(target)) {
                return source;
            }
            assignProperty(target, source, 'name');
            assignProperty(target, source, 'runtime');
            assignProperty(target, source, 'taskSelector');
            assignProperty(target, source, 'suppressTaskName');
            if (source.args !== undefined) {
                if (target.args === undefined || overwriteArgs) {
                    target.args = source.args;
                }
                else {
                    target.args = target.args.concat(source.args);
                }
            }
            target.presentation = PresentationOptions.assignProperties(target.presentation, source.presentation);
            target.options = CommandOptions.assignProperties(target.options, source.options);
            return target;
        }
        CommandConfiguration.assignProperties = assignProperties;
        function fillProperties(target, source) {
            return _fillProperties(target, source, properties);
        }
        CommandConfiguration.fillProperties = fillProperties;
        function fillGlobals(target, source, taskName) {
            if ((source === undefined) || isEmpty(source)) {
                return target;
            }
            target = target || {
                name: undefined,
                runtime: undefined,
                presentation: undefined
            };
            if (target.name === undefined) {
                fillProperty(target, source, 'name');
                fillProperty(target, source, 'taskSelector');
                fillProperty(target, source, 'suppressTaskName');
                let args = source.args ? source.args.slice() : [];
                if (!target.suppressTaskName && taskName) {
                    if (target.taskSelector !== undefined) {
                        args.push(target.taskSelector + taskName);
                    }
                    else {
                        args.push(taskName);
                    }
                }
                if (target.args) {
                    args = args.concat(target.args);
                }
                target.args = args;
            }
            fillProperty(target, source, 'runtime');
            target.presentation = PresentationOptions.fillProperties(target.presentation, source.presentation);
            target.options = CommandOptions.fillProperties(target.options, source.options);
            return target;
        }
        CommandConfiguration.fillGlobals = fillGlobals;
        function fillDefaults(value, context) {
            if (!value || Object.isFrozen(value)) {
                return;
            }
            if (value.name !== undefined && value.runtime === undefined) {
                value.runtime = Tasks.RuntimeType.Process;
            }
            value.presentation = PresentationOptions.fillDefaults(value.presentation, context);
            if (!isEmpty(value)) {
                value.options = CommandOptions.fillDefaults(value.options, context);
            }
            if (value.args === undefined) {
                value.args = EMPTY_ARRAY;
            }
            if (value.suppressTaskName === undefined) {
                value.suppressTaskName = (context.schemaVersion === 2 /* Tasks.JsonSchemaVersion.V2_0_0 */);
            }
        }
        CommandConfiguration.fillDefaults = fillDefaults;
        function freeze(value) {
            return _freeze(value, properties);
        }
        CommandConfiguration.freeze = freeze;
    })(CommandConfiguration || (CommandConfiguration = {}));
    var ProblemMatcherConverter;
    (function (ProblemMatcherConverter) {
        function namedFrom(declares, context) {
            const result = Object.create(null);
            if (!Array.isArray(declares)) {
                return result;
            }
            declares.forEach((value) => {
                const namedProblemMatcher = (new problemMatcher_1.ProblemMatcherParser(context.problemReporter)).parse(value);
                if ((0, problemMatcher_1.isNamedProblemMatcher)(namedProblemMatcher)) {
                    result[namedProblemMatcher.name] = namedProblemMatcher;
                }
                else {
                    context.problemReporter.error(nls.localize('ConfigurationParser.noName', 'Error: Problem Matcher in declare scope must have a name:\n{0}\n', JSON.stringify(value, undefined, 4)));
                }
            });
            return result;
        }
        ProblemMatcherConverter.namedFrom = namedFrom;
        function fromWithOsConfig(external, context) {
            let result = {};
            if (external.windows && external.windows.problemMatcher && context.platform === 3 /* Platform.Windows */) {
                result = from(external.windows.problemMatcher, context);
            }
            else if (external.osx && external.osx.problemMatcher && context.platform === 1 /* Platform.Mac */) {
                result = from(external.osx.problemMatcher, context);
            }
            else if (external.linux && external.linux.problemMatcher && context.platform === 2 /* Platform.Linux */) {
                result = from(external.linux.problemMatcher, context);
            }
            else if (external.problemMatcher) {
                result = from(external.problemMatcher, context);
            }
            return result;
        }
        ProblemMatcherConverter.fromWithOsConfig = fromWithOsConfig;
        function from(config, context) {
            const result = [];
            if (config === undefined) {
                return { value: result };
            }
            const errors = [];
            function addResult(matcher) {
                if (matcher.value) {
                    result.push(matcher.value);
                }
                if (matcher.errors) {
                    errors.push(...matcher.errors);
                }
            }
            const kind = getProblemMatcherKind(config);
            if (kind === ProblemMatcherKind.Unknown) {
                const error = nls.localize('ConfigurationParser.unknownMatcherKind', 'Warning: the defined problem matcher is unknown. Supported types are string | ProblemMatcher | Array<string | ProblemMatcher>.\n{0}\n', JSON.stringify(config, null, 4));
                context.problemReporter.warn(error);
            }
            else if (kind === ProblemMatcherKind.String || kind === ProblemMatcherKind.ProblemMatcher) {
                addResult(resolveProblemMatcher(config, context));
            }
            else if (kind === ProblemMatcherKind.Array) {
                const problemMatchers = config;
                problemMatchers.forEach(problemMatcher => {
                    addResult(resolveProblemMatcher(problemMatcher, context));
                });
            }
            return { value: result, errors };
        }
        ProblemMatcherConverter.from = from;
        function getProblemMatcherKind(value) {
            if (Types.isString(value)) {
                return ProblemMatcherKind.String;
            }
            else if (Array.isArray(value)) {
                return ProblemMatcherKind.Array;
            }
            else if (!Types.isUndefined(value)) {
                return ProblemMatcherKind.ProblemMatcher;
            }
            else {
                return ProblemMatcherKind.Unknown;
            }
        }
        function resolveProblemMatcher(value, context) {
            if (Types.isString(value)) {
                let variableName = value;
                if (variableName.length > 1 && variableName[0] === '$') {
                    variableName = variableName.substring(1);
                    const global = problemMatcher_1.ProblemMatcherRegistry.get(variableName);
                    if (global) {
                        return { value: Objects.deepClone(global) };
                    }
                    let localProblemMatcher = context.namedProblemMatchers[variableName];
                    if (localProblemMatcher) {
                        localProblemMatcher = Objects.deepClone(localProblemMatcher);
                        // remove the name
                        delete localProblemMatcher.name;
                        return { value: localProblemMatcher };
                    }
                }
                return { errors: [nls.localize('ConfigurationParser.invalidVariableReference', 'Error: Invalid problemMatcher reference: {0}\n', value)] };
            }
            else {
                const json = value;
                return { value: new problemMatcher_1.ProblemMatcherParser(context.problemReporter).parse(json) };
            }
        }
    })(ProblemMatcherConverter || (exports.ProblemMatcherConverter = ProblemMatcherConverter = {}));
    const partialSource = {
        label: 'Workspace',
        config: undefined
    };
    var GroupKind;
    (function (GroupKind) {
        function from(external) {
            if (external === undefined) {
                return undefined;
            }
            else if (Types.isString(external) && Tasks.TaskGroup.is(external)) {
                return { _id: external, isDefault: false };
            }
            else if (Types.isString(external.kind) && Tasks.TaskGroup.is(external.kind)) {
                const group = external.kind;
                const isDefault = Types.isUndefined(external.isDefault) ? false : external.isDefault;
                return { _id: group, isDefault };
            }
            return undefined;
        }
        GroupKind.from = from;
        function to(group) {
            if (Types.isString(group)) {
                return group;
            }
            else if (!group.isDefault) {
                return group._id;
            }
            return {
                kind: group._id,
                isDefault: group.isDefault,
            };
        }
        GroupKind.to = to;
    })(GroupKind || (exports.GroupKind = GroupKind = {}));
    var TaskDependency;
    (function (TaskDependency) {
        function uriFromSource(context, source) {
            switch (source) {
                case TaskConfigSource.User: return Tasks.USER_TASKS_GROUP_KEY;
                case TaskConfigSource.TasksJson: return context.workspaceFolder.uri;
                default: return context.workspace && context.workspace.configuration ? context.workspace.configuration : context.workspaceFolder.uri;
            }
        }
        function from(external, context, source) {
            if (Types.isString(external)) {
                return { uri: uriFromSource(context, source), task: external };
            }
            else if (ITaskIdentifier.is(external)) {
                return {
                    uri: uriFromSource(context, source),
                    task: Tasks.TaskDefinition.createTaskIdentifier(external, context.problemReporter)
                };
            }
            else {
                return undefined;
            }
        }
        TaskDependency.from = from;
    })(TaskDependency || (TaskDependency = {}));
    var DependsOrder;
    (function (DependsOrder) {
        function from(order) {
            switch (order) {
                case "sequence" /* Tasks.DependsOrder.sequence */:
                    return "sequence" /* Tasks.DependsOrder.sequence */;
                case "parallel" /* Tasks.DependsOrder.parallel */:
                default:
                    return "parallel" /* Tasks.DependsOrder.parallel */;
            }
        }
        DependsOrder.from = from;
    })(DependsOrder || (DependsOrder = {}));
    var ConfigurationProperties;
    (function (ConfigurationProperties) {
        const properties = [
            { property: 'name' },
            { property: 'identifier' },
            { property: 'group' },
            { property: 'isBackground' },
            { property: 'promptOnClose' },
            { property: 'dependsOn' },
            { property: 'presentation', type: CommandConfiguration.PresentationOptions },
            { property: 'problemMatchers' },
            { property: 'options' },
            { property: 'icon' },
            { property: 'hide' }
        ];
        function from(external, context, includeCommandOptions, source, properties) {
            if (!external) {
                return {};
            }
            const result = {};
            if (properties) {
                for (const propertyName of Object.keys(properties)) {
                    if (external[propertyName] !== undefined) {
                        result[propertyName] = Objects.deepClone(external[propertyName]);
                    }
                }
            }
            if (Types.isString(external.taskName)) {
                result.name = external.taskName;
            }
            if (Types.isString(external.label) && context.schemaVersion === 2 /* Tasks.JsonSchemaVersion.V2_0_0 */) {
                result.name = external.label;
            }
            if (Types.isString(external.identifier)) {
                result.identifier = external.identifier;
            }
            result.icon = external.icon;
            result.hide = external.hide;
            if (external.isBackground !== undefined) {
                result.isBackground = !!external.isBackground;
            }
            if (external.promptOnClose !== undefined) {
                result.promptOnClose = !!external.promptOnClose;
            }
            result.group = GroupKind.from(external.group);
            if (external.dependsOn !== undefined) {
                if (Array.isArray(external.dependsOn)) {
                    result.dependsOn = external.dependsOn.reduce((dependencies, item) => {
                        const dependency = TaskDependency.from(item, context, source);
                        if (dependency) {
                            dependencies.push(dependency);
                        }
                        return dependencies;
                    }, []);
                }
                else {
                    const dependsOnValue = TaskDependency.from(external.dependsOn, context, source);
                    result.dependsOn = dependsOnValue ? [dependsOnValue] : undefined;
                }
            }
            result.dependsOrder = DependsOrder.from(external.dependsOrder);
            if (includeCommandOptions && (external.presentation !== undefined || external.terminal !== undefined)) {
                result.presentation = CommandConfiguration.PresentationOptions.from(external, context);
            }
            if (includeCommandOptions && (external.options !== undefined)) {
                result.options = CommandOptions.from(external.options, context);
            }
            const configProblemMatcher = ProblemMatcherConverter.fromWithOsConfig(external, context);
            if (configProblemMatcher.value !== undefined) {
                result.problemMatchers = configProblemMatcher.value;
            }
            if (external.detail) {
                result.detail = external.detail;
            }
            return isEmpty(result) ? {} : { value: result, errors: configProblemMatcher.errors };
        }
        ConfigurationProperties.from = from;
        function isEmpty(value) {
            return _isEmpty(value, properties);
        }
        ConfigurationProperties.isEmpty = isEmpty;
    })(ConfigurationProperties || (ConfigurationProperties = {}));
    var ConfiguringTask;
    (function (ConfiguringTask) {
        const grunt = 'grunt.';
        const jake = 'jake.';
        const gulp = 'gulp.';
        const npm = 'vscode.npm.';
        const typescript = 'vscode.typescript.';
        function from(external, context, index, source, registry) {
            if (!external) {
                return undefined;
            }
            const type = external.type;
            const customize = external.customize;
            if (!type && !customize) {
                context.problemReporter.error(nls.localize('ConfigurationParser.noTaskType', 'Error: tasks configuration must have a type property. The configuration will be ignored.\n{0}\n', JSON.stringify(external, null, 4)));
                return undefined;
            }
            const typeDeclaration = type ? registry?.get?.(type) || taskDefinitionRegistry_1.TaskDefinitionRegistry.get(type) : undefined;
            if (!typeDeclaration) {
                const message = nls.localize('ConfigurationParser.noTypeDefinition', 'Error: there is no registered task type \'{0}\'. Did you miss installing an extension that provides a corresponding task provider?', type);
                context.problemReporter.error(message);
                return undefined;
            }
            let identifier;
            if (Types.isString(customize)) {
                if (customize.indexOf(grunt) === 0) {
                    identifier = { type: 'grunt', task: customize.substring(grunt.length) };
                }
                else if (customize.indexOf(jake) === 0) {
                    identifier = { type: 'jake', task: customize.substring(jake.length) };
                }
                else if (customize.indexOf(gulp) === 0) {
                    identifier = { type: 'gulp', task: customize.substring(gulp.length) };
                }
                else if (customize.indexOf(npm) === 0) {
                    identifier = { type: 'npm', script: customize.substring(npm.length + 4) };
                }
                else if (customize.indexOf(typescript) === 0) {
                    identifier = { type: 'typescript', tsconfig: customize.substring(typescript.length + 6) };
                }
            }
            else {
                if (Types.isString(external.type)) {
                    identifier = external;
                }
            }
            if (identifier === undefined) {
                context.problemReporter.error(nls.localize('ConfigurationParser.missingType', 'Error: the task configuration \'{0}\' is missing the required property \'type\'. The task configuration will be ignored.', JSON.stringify(external, undefined, 0)));
                return undefined;
            }
            const taskIdentifier = Tasks.TaskDefinition.createTaskIdentifier(identifier, context.problemReporter);
            if (taskIdentifier === undefined) {
                context.problemReporter.error(nls.localize('ConfigurationParser.incorrectType', 'Error: the task configuration \'{0}\' is using an unknown type. The task configuration will be ignored.', JSON.stringify(external, undefined, 0)));
                return undefined;
            }
            const configElement = {
                workspaceFolder: context.workspaceFolder,
                file: '.vscode/tasks.json',
                index,
                element: external
            };
            let taskSource;
            switch (source) {
                case TaskConfigSource.User: {
                    taskSource = Object.assign({}, partialSource, { kind: Tasks.TaskSourceKind.User, config: configElement });
                    break;
                }
                case TaskConfigSource.WorkspaceFile: {
                    taskSource = Object.assign({}, partialSource, { kind: Tasks.TaskSourceKind.WorkspaceFile, config: configElement });
                    break;
                }
                default: {
                    taskSource = Object.assign({}, partialSource, { kind: Tasks.TaskSourceKind.Workspace, config: configElement });
                    break;
                }
            }
            const result = new Tasks.ConfiguringTask(`${typeDeclaration.extensionId}.${taskIdentifier._key}`, taskSource, undefined, type, taskIdentifier, RunOptions.fromConfiguration(external.runOptions), { hide: external.hide });
            const configuration = ConfigurationProperties.from(external, context, true, source, typeDeclaration.properties);
            result.addTaskLoadMessages(configuration.errors);
            if (configuration.value) {
                result.configurationProperties = Object.assign(result.configurationProperties, configuration.value);
                if (result.configurationProperties.name) {
                    result._label = result.configurationProperties.name;
                }
                else {
                    let label = result.configures.type;
                    if (typeDeclaration.required && typeDeclaration.required.length > 0) {
                        for (const required of typeDeclaration.required) {
                            const value = result.configures[required];
                            if (value) {
                                label = label + ': ' + value;
                                break;
                            }
                        }
                    }
                    result._label = label;
                }
                if (!result.configurationProperties.identifier) {
                    result.configurationProperties.identifier = taskIdentifier._key;
                }
            }
            return result;
        }
        ConfiguringTask.from = from;
    })(ConfiguringTask || (ConfiguringTask = {}));
    var CustomTask;
    (function (CustomTask) {
        function from(external, context, index, source) {
            if (!external) {
                return undefined;
            }
            let type = external.type;
            if (type === undefined || type === null) {
                type = Tasks.CUSTOMIZED_TASK_TYPE;
            }
            if (type !== Tasks.CUSTOMIZED_TASK_TYPE && type !== 'shell' && type !== 'process') {
                context.problemReporter.error(nls.localize('ConfigurationParser.notCustom', 'Error: tasks is not declared as a custom task. The configuration will be ignored.\n{0}\n', JSON.stringify(external, null, 4)));
                return undefined;
            }
            let taskName = external.taskName;
            if (Types.isString(external.label) && context.schemaVersion === 2 /* Tasks.JsonSchemaVersion.V2_0_0 */) {
                taskName = external.label;
            }
            if (!taskName) {
                context.problemReporter.error(nls.localize('ConfigurationParser.noTaskName', 'Error: a task must provide a label property. The task will be ignored.\n{0}\n', JSON.stringify(external, null, 4)));
                return undefined;
            }
            let taskSource;
            switch (source) {
                case TaskConfigSource.User: {
                    taskSource = Object.assign({}, partialSource, { kind: Tasks.TaskSourceKind.User, config: { index, element: external, file: '.vscode/tasks.json', workspaceFolder: context.workspaceFolder } });
                    break;
                }
                case TaskConfigSource.WorkspaceFile: {
                    taskSource = Object.assign({}, partialSource, { kind: Tasks.TaskSourceKind.WorkspaceFile, config: { index, element: external, file: '.vscode/tasks.json', workspaceFolder: context.workspaceFolder, workspace: context.workspace } });
                    break;
                }
                default: {
                    taskSource = Object.assign({}, partialSource, { kind: Tasks.TaskSourceKind.Workspace, config: { index, element: external, file: '.vscode/tasks.json', workspaceFolder: context.workspaceFolder } });
                    break;
                }
            }
            const result = new Tasks.CustomTask(context.uuidMap.getUUID(taskName), taskSource, taskName, Tasks.CUSTOMIZED_TASK_TYPE, undefined, false, RunOptions.fromConfiguration(external.runOptions), {
                name: taskName,
                identifier: taskName,
            });
            const configuration = ConfigurationProperties.from(external, context, false, source);
            result.addTaskLoadMessages(configuration.errors);
            if (configuration.value) {
                result.configurationProperties = Object.assign(result.configurationProperties, configuration.value);
            }
            const supportLegacy = true; //context.schemaVersion === Tasks.JsonSchemaVersion.V2_0_0;
            if (supportLegacy) {
                const legacy = external;
                if (result.configurationProperties.isBackground === undefined && legacy.isWatching !== undefined) {
                    result.configurationProperties.isBackground = !!legacy.isWatching;
                }
                if (result.configurationProperties.group === undefined) {
                    if (legacy.isBuildCommand === true) {
                        result.configurationProperties.group = Tasks.TaskGroup.Build;
                    }
                    else if (legacy.isTestCommand === true) {
                        result.configurationProperties.group = Tasks.TaskGroup.Test;
                    }
                }
            }
            const command = CommandConfiguration.from(external, context);
            if (command) {
                result.command = command;
            }
            if (external.command !== undefined) {
                // if the task has its own command then we suppress the
                // task name by default.
                command.suppressTaskName = true;
            }
            return result;
        }
        CustomTask.from = from;
        function fillGlobals(task, globals) {
            // We only merge a command from a global definition if there is no dependsOn
            // or there is a dependsOn and a defined command.
            if (CommandConfiguration.hasCommand(task.command) || task.configurationProperties.dependsOn === undefined) {
                task.command = CommandConfiguration.fillGlobals(task.command, globals.command, task.configurationProperties.name);
            }
            if (task.configurationProperties.problemMatchers === undefined && globals.problemMatcher !== undefined) {
                task.configurationProperties.problemMatchers = Objects.deepClone(globals.problemMatcher);
                task.hasDefinedMatchers = true;
            }
            // promptOnClose is inferred from isBackground if available
            if (task.configurationProperties.promptOnClose === undefined && task.configurationProperties.isBackground === undefined && globals.promptOnClose !== undefined) {
                task.configurationProperties.promptOnClose = globals.promptOnClose;
            }
        }
        CustomTask.fillGlobals = fillGlobals;
        function fillDefaults(task, context) {
            CommandConfiguration.fillDefaults(task.command, context);
            if (task.configurationProperties.promptOnClose === undefined) {
                task.configurationProperties.promptOnClose = task.configurationProperties.isBackground !== undefined ? !task.configurationProperties.isBackground : true;
            }
            if (task.configurationProperties.isBackground === undefined) {
                task.configurationProperties.isBackground = false;
            }
            if (task.configurationProperties.problemMatchers === undefined) {
                task.configurationProperties.problemMatchers = EMPTY_ARRAY;
            }
        }
        CustomTask.fillDefaults = fillDefaults;
        function createCustomTask(contributedTask, configuredProps) {
            const result = new Tasks.CustomTask(configuredProps._id, Object.assign({}, configuredProps._source, { customizes: contributedTask.defines }), configuredProps.configurationProperties.name || contributedTask._label, Tasks.CUSTOMIZED_TASK_TYPE, contributedTask.command, false, contributedTask.runOptions, {
                name: configuredProps.configurationProperties.name || contributedTask.configurationProperties.name,
                identifier: configuredProps.configurationProperties.identifier || contributedTask.configurationProperties.identifier,
                icon: configuredProps.configurationProperties.icon,
                hide: configuredProps.configurationProperties.hide
            });
            result.addTaskLoadMessages(configuredProps.taskLoadMessages);
            const resultConfigProps = result.configurationProperties;
            assignProperty(resultConfigProps, configuredProps.configurationProperties, 'group');
            assignProperty(resultConfigProps, configuredProps.configurationProperties, 'isBackground');
            assignProperty(resultConfigProps, configuredProps.configurationProperties, 'dependsOn');
            assignProperty(resultConfigProps, configuredProps.configurationProperties, 'problemMatchers');
            assignProperty(resultConfigProps, configuredProps.configurationProperties, 'promptOnClose');
            assignProperty(resultConfigProps, configuredProps.configurationProperties, 'detail');
            result.command.presentation = CommandConfiguration.PresentationOptions.assignProperties(result.command.presentation, configuredProps.configurationProperties.presentation);
            result.command.options = CommandOptions.assignProperties(result.command.options, configuredProps.configurationProperties.options);
            result.runOptions = RunOptions.assignProperties(result.runOptions, configuredProps.runOptions);
            const contributedConfigProps = contributedTask.configurationProperties;
            fillProperty(resultConfigProps, contributedConfigProps, 'group');
            fillProperty(resultConfigProps, contributedConfigProps, 'isBackground');
            fillProperty(resultConfigProps, contributedConfigProps, 'dependsOn');
            fillProperty(resultConfigProps, contributedConfigProps, 'problemMatchers');
            fillProperty(resultConfigProps, contributedConfigProps, 'promptOnClose');
            fillProperty(resultConfigProps, contributedConfigProps, 'detail');
            result.command.presentation = CommandConfiguration.PresentationOptions.fillProperties(result.command.presentation, contributedConfigProps.presentation);
            result.command.options = CommandOptions.fillProperties(result.command.options, contributedConfigProps.options);
            result.runOptions = RunOptions.fillProperties(result.runOptions, contributedTask.runOptions);
            if (contributedTask.hasDefinedMatchers === true) {
                result.hasDefinedMatchers = true;
            }
            return result;
        }
        CustomTask.createCustomTask = createCustomTask;
    })(CustomTask || (CustomTask = {}));
    var TaskParser;
    (function (TaskParser) {
        function isCustomTask(value) {
            const type = value.type;
            const customize = value.customize;
            return customize === undefined && (type === undefined || type === null || type === Tasks.CUSTOMIZED_TASK_TYPE || type === 'shell' || type === 'process');
        }
        const builtinTypeContextMap = {
            shell: taskService_1.ShellExecutionSupportedContext,
            process: taskService_1.ProcessExecutionSupportedContext
        };
        function from(externals, globals, context, source, registry) {
            const result = { custom: [], configured: [] };
            if (!externals) {
                return result;
            }
            const defaultBuildTask = { task: undefined, rank: -1 };
            const defaultTestTask = { task: undefined, rank: -1 };
            const schema2_0_0 = context.schemaVersion === 2 /* Tasks.JsonSchemaVersion.V2_0_0 */;
            const baseLoadIssues = Objects.deepClone(context.taskLoadIssues);
            for (let index = 0; index < externals.length; index++) {
                const external = externals[index];
                const definition = external.type ? registry?.get?.(external.type) || taskDefinitionRegistry_1.TaskDefinitionRegistry.get(external.type) : undefined;
                let typeNotSupported = false;
                if (definition && definition.when && !context.contextKeyService.contextMatchesRules(definition.when)) {
                    typeNotSupported = true;
                }
                else if (!definition && external.type) {
                    for (const key of Object.keys(builtinTypeContextMap)) {
                        if (external.type === key) {
                            typeNotSupported = !taskService_1.ShellExecutionSupportedContext.evaluate(context.contextKeyService.getContext(null));
                            break;
                        }
                    }
                }
                if (typeNotSupported) {
                    context.problemReporter.info(nls.localize('taskConfiguration.providerUnavailable', 'Warning: {0} tasks are unavailable in the current environment.\n', external.type));
                    continue;
                }
                if (isCustomTask(external)) {
                    const customTask = CustomTask.from(external, context, index, source);
                    if (customTask) {
                        CustomTask.fillGlobals(customTask, globals);
                        CustomTask.fillDefaults(customTask, context);
                        if (schema2_0_0) {
                            if ((customTask.command === undefined || customTask.command.name === undefined) && (customTask.configurationProperties.dependsOn === undefined || customTask.configurationProperties.dependsOn.length === 0)) {
                                context.problemReporter.error(nls.localize('taskConfiguration.noCommandOrDependsOn', 'Error: the task \'{0}\' neither specifies a command nor a dependsOn property. The task will be ignored. Its definition is:\n{1}', customTask.configurationProperties.name, JSON.stringify(external, undefined, 4)));
                                continue;
                            }
                        }
                        else {
                            if (customTask.command === undefined || customTask.command.name === undefined) {
                                context.problemReporter.warn(nls.localize('taskConfiguration.noCommand', 'Error: the task \'{0}\' doesn\'t define a command. The task will be ignored. Its definition is:\n{1}', customTask.configurationProperties.name, JSON.stringify(external, undefined, 4)));
                                continue;
                            }
                        }
                        if (customTask.configurationProperties.group === Tasks.TaskGroup.Build && defaultBuildTask.rank < 2) {
                            defaultBuildTask.task = customTask;
                            defaultBuildTask.rank = 2;
                        }
                        else if (customTask.configurationProperties.group === Tasks.TaskGroup.Test && defaultTestTask.rank < 2) {
                            defaultTestTask.task = customTask;
                            defaultTestTask.rank = 2;
                        }
                        else if (customTask.configurationProperties.name === 'build' && defaultBuildTask.rank < 1) {
                            defaultBuildTask.task = customTask;
                            defaultBuildTask.rank = 1;
                        }
                        else if (customTask.configurationProperties.name === 'test' && defaultTestTask.rank < 1) {
                            defaultTestTask.task = customTask;
                            defaultTestTask.rank = 1;
                        }
                        customTask.addTaskLoadMessages(context.taskLoadIssues);
                        result.custom.push(customTask);
                    }
                }
                else {
                    const configuredTask = ConfiguringTask.from(external, context, index, source, registry);
                    if (configuredTask) {
                        configuredTask.addTaskLoadMessages(context.taskLoadIssues);
                        result.configured.push(configuredTask);
                    }
                }
                context.taskLoadIssues = Objects.deepClone(baseLoadIssues);
            }
            // There is some special logic for tasks with the labels "build" and "test".
            // Even if they are not marked as a task group Build or Test, we automagically group them as such.
            // However, if they are already grouped as Build or Test, we don't need to add this grouping.
            const defaultBuildGroupName = Types.isString(defaultBuildTask.task?.configurationProperties.group) ? defaultBuildTask.task?.configurationProperties.group : defaultBuildTask.task?.configurationProperties.group?._id;
            const defaultTestTaskGroupName = Types.isString(defaultTestTask.task?.configurationProperties.group) ? defaultTestTask.task?.configurationProperties.group : defaultTestTask.task?.configurationProperties.group?._id;
            if ((defaultBuildGroupName !== Tasks.TaskGroup.Build._id) && (defaultBuildTask.rank > -1) && (defaultBuildTask.rank < 2) && defaultBuildTask.task) {
                defaultBuildTask.task.configurationProperties.group = Tasks.TaskGroup.Build;
            }
            else if ((defaultTestTaskGroupName !== Tasks.TaskGroup.Test._id) && (defaultTestTask.rank > -1) && (defaultTestTask.rank < 2) && defaultTestTask.task) {
                defaultTestTask.task.configurationProperties.group = Tasks.TaskGroup.Test;
            }
            return result;
        }
        TaskParser.from = from;
        function assignTasks(target, source) {
            if (source === undefined || source.length === 0) {
                return target;
            }
            if (target === undefined || target.length === 0) {
                return source;
            }
            if (source) {
                // Tasks are keyed by ID but we need to merge by name
                const map = Object.create(null);
                target.forEach((task) => {
                    map[task.configurationProperties.name] = task;
                });
                source.forEach((task) => {
                    map[task.configurationProperties.name] = task;
                });
                const newTarget = [];
                target.forEach(task => {
                    newTarget.push(map[task.configurationProperties.name]);
                    delete map[task.configurationProperties.name];
                });
                Object.keys(map).forEach(key => newTarget.push(map[key]));
                target = newTarget;
            }
            return target;
        }
        TaskParser.assignTasks = assignTasks;
    })(TaskParser || (exports.TaskParser = TaskParser = {}));
    var Globals;
    (function (Globals) {
        function from(config, context) {
            let result = fromBase(config, context);
            let osGlobals = undefined;
            if (config.windows && context.platform === 3 /* Platform.Windows */) {
                osGlobals = fromBase(config.windows, context);
            }
            else if (config.osx && context.platform === 1 /* Platform.Mac */) {
                osGlobals = fromBase(config.osx, context);
            }
            else if (config.linux && context.platform === 2 /* Platform.Linux */) {
                osGlobals = fromBase(config.linux, context);
            }
            if (osGlobals) {
                result = Globals.assignProperties(result, osGlobals);
            }
            const command = CommandConfiguration.from(config, context);
            if (command) {
                result.command = command;
            }
            Globals.fillDefaults(result, context);
            Globals.freeze(result);
            return result;
        }
        Globals.from = from;
        function fromBase(config, context) {
            const result = {};
            if (config.suppressTaskName !== undefined) {
                result.suppressTaskName = !!config.suppressTaskName;
            }
            if (config.promptOnClose !== undefined) {
                result.promptOnClose = !!config.promptOnClose;
            }
            if (config.problemMatcher) {
                result.problemMatcher = ProblemMatcherConverter.from(config.problemMatcher, context).value;
            }
            return result;
        }
        Globals.fromBase = fromBase;
        function isEmpty(value) {
            return !value || value.command === undefined && value.promptOnClose === undefined && value.suppressTaskName === undefined;
        }
        Globals.isEmpty = isEmpty;
        function assignProperties(target, source) {
            if (isEmpty(source)) {
                return target;
            }
            if (isEmpty(target)) {
                return source;
            }
            assignProperty(target, source, 'promptOnClose');
            assignProperty(target, source, 'suppressTaskName');
            return target;
        }
        Globals.assignProperties = assignProperties;
        function fillDefaults(value, context) {
            if (!value) {
                return;
            }
            CommandConfiguration.fillDefaults(value.command, context);
            if (value.suppressTaskName === undefined) {
                value.suppressTaskName = (context.schemaVersion === 2 /* Tasks.JsonSchemaVersion.V2_0_0 */);
            }
            if (value.promptOnClose === undefined) {
                value.promptOnClose = true;
            }
        }
        Globals.fillDefaults = fillDefaults;
        function freeze(value) {
            Object.freeze(value);
            if (value.command) {
                CommandConfiguration.freeze(value.command);
            }
        }
        Globals.freeze = freeze;
    })(Globals || (Globals = {}));
    var ExecutionEngine;
    (function (ExecutionEngine) {
        function from(config) {
            const runner = config.runner || config._runner;
            let result;
            if (runner) {
                switch (runner) {
                    case 'terminal':
                        result = Tasks.ExecutionEngine.Terminal;
                        break;
                    case 'process':
                        result = Tasks.ExecutionEngine.Process;
                        break;
                }
            }
            const schemaVersion = JsonSchemaVersion.from(config);
            if (schemaVersion === 1 /* Tasks.JsonSchemaVersion.V0_1_0 */) {
                return result || Tasks.ExecutionEngine.Process;
            }
            else if (schemaVersion === 2 /* Tasks.JsonSchemaVersion.V2_0_0 */) {
                return Tasks.ExecutionEngine.Terminal;
            }
            else {
                throw new Error('Shouldn\'t happen.');
            }
        }
        ExecutionEngine.from = from;
    })(ExecutionEngine || (exports.ExecutionEngine = ExecutionEngine = {}));
    var JsonSchemaVersion;
    (function (JsonSchemaVersion) {
        const _default = 2 /* Tasks.JsonSchemaVersion.V2_0_0 */;
        function from(config) {
            const version = config.version;
            if (!version) {
                return _default;
            }
            switch (version) {
                case '0.1.0':
                    return 1 /* Tasks.JsonSchemaVersion.V0_1_0 */;
                case '2.0.0':
                    return 2 /* Tasks.JsonSchemaVersion.V2_0_0 */;
                default:
                    return _default;
            }
        }
        JsonSchemaVersion.from = from;
    })(JsonSchemaVersion || (exports.JsonSchemaVersion = JsonSchemaVersion = {}));
    class UUIDMap {
        constructor(other) {
            this.current = Object.create(null);
            if (other) {
                for (const key of Object.keys(other.current)) {
                    const value = other.current[key];
                    if (Array.isArray(value)) {
                        this.current[key] = value.slice();
                    }
                    else {
                        this.current[key] = value;
                    }
                }
            }
        }
        start() {
            this.last = this.current;
            this.current = Object.create(null);
        }
        getUUID(identifier) {
            const lastValue = this.last ? this.last[identifier] : undefined;
            let result = undefined;
            if (lastValue !== undefined) {
                if (Array.isArray(lastValue)) {
                    result = lastValue.shift();
                    if (lastValue.length === 0) {
                        delete this.last[identifier];
                    }
                }
                else {
                    result = lastValue;
                    delete this.last[identifier];
                }
            }
            if (result === undefined) {
                result = UUID.generateUuid();
            }
            const currentValue = this.current[identifier];
            if (currentValue === undefined) {
                this.current[identifier] = result;
            }
            else {
                if (Array.isArray(currentValue)) {
                    currentValue.push(result);
                }
                else {
                    const arrayValue = [currentValue];
                    arrayValue.push(result);
                    this.current[identifier] = arrayValue;
                }
            }
            return result;
        }
        finish() {
            this.last = undefined;
        }
    }
    exports.UUIDMap = UUIDMap;
    var TaskConfigSource;
    (function (TaskConfigSource) {
        TaskConfigSource[TaskConfigSource["TasksJson"] = 0] = "TasksJson";
        TaskConfigSource[TaskConfigSource["WorkspaceFile"] = 1] = "WorkspaceFile";
        TaskConfigSource[TaskConfigSource["User"] = 2] = "User";
    })(TaskConfigSource || (exports.TaskConfigSource = TaskConfigSource = {}));
    class ConfigurationParser {
        constructor(workspaceFolder, workspace, platform, problemReporter, uuidMap) {
            this.workspaceFolder = workspaceFolder;
            this.workspace = workspace;
            this.platform = platform;
            this.problemReporter = problemReporter;
            this.uuidMap = uuidMap;
        }
        run(fileConfig, source, contextKeyService) {
            const engine = ExecutionEngine.from(fileConfig);
            const schemaVersion = JsonSchemaVersion.from(fileConfig);
            const context = {
                workspaceFolder: this.workspaceFolder,
                workspace: this.workspace,
                problemReporter: this.problemReporter,
                uuidMap: this.uuidMap,
                namedProblemMatchers: {},
                engine,
                schemaVersion,
                platform: this.platform,
                taskLoadIssues: [],
                contextKeyService
            };
            const taskParseResult = this.createTaskRunnerConfiguration(fileConfig, context, source);
            return {
                validationStatus: this.problemReporter.status,
                custom: taskParseResult.custom,
                configured: taskParseResult.configured,
                engine
            };
        }
        createTaskRunnerConfiguration(fileConfig, context, source) {
            const globals = Globals.from(fileConfig, context);
            if (this.problemReporter.status.isFatal()) {
                return { custom: [], configured: [] };
            }
            context.namedProblemMatchers = ProblemMatcherConverter.namedFrom(fileConfig.declares, context);
            let globalTasks = undefined;
            let externalGlobalTasks = undefined;
            if (fileConfig.windows && context.platform === 3 /* Platform.Windows */) {
                globalTasks = TaskParser.from(fileConfig.windows.tasks, globals, context, source).custom;
                externalGlobalTasks = fileConfig.windows.tasks;
            }
            else if (fileConfig.osx && context.platform === 1 /* Platform.Mac */) {
                globalTasks = TaskParser.from(fileConfig.osx.tasks, globals, context, source).custom;
                externalGlobalTasks = fileConfig.osx.tasks;
            }
            else if (fileConfig.linux && context.platform === 2 /* Platform.Linux */) {
                globalTasks = TaskParser.from(fileConfig.linux.tasks, globals, context, source).custom;
                externalGlobalTasks = fileConfig.linux.tasks;
            }
            if (context.schemaVersion === 2 /* Tasks.JsonSchemaVersion.V2_0_0 */ && globalTasks && globalTasks.length > 0 && externalGlobalTasks && externalGlobalTasks.length > 0) {
                const taskContent = [];
                for (const task of externalGlobalTasks) {
                    taskContent.push(JSON.stringify(task, null, 4));
                }
                context.problemReporter.error(nls.localize({ key: 'TaskParse.noOsSpecificGlobalTasks', comment: ['\"Task version 2.0.0\" refers to the 2.0.0 version of the task system. The \"version 2.0.0\" is not localizable as it is a json key and value.'] }, 'Task version 2.0.0 doesn\'t support global OS specific tasks. Convert them to a task with a OS specific command. Affected tasks are:\n{0}', taskContent.join('\n')));
            }
            let result = { custom: [], configured: [] };
            if (fileConfig.tasks) {
                result = TaskParser.from(fileConfig.tasks, globals, context, source);
            }
            if (globalTasks) {
                result.custom = TaskParser.assignTasks(result.custom, globalTasks);
            }
            if ((!result.custom || result.custom.length === 0) && (globals.command && globals.command.name)) {
                const matchers = ProblemMatcherConverter.from(fileConfig.problemMatcher, context).value ?? [];
                const isBackground = fileConfig.isBackground ? !!fileConfig.isBackground : fileConfig.isWatching ? !!fileConfig.isWatching : undefined;
                const name = Tasks.CommandString.value(globals.command.name);
                const task = new Tasks.CustomTask(context.uuidMap.getUUID(name), Object.assign({}, source, { config: { index: -1, element: fileConfig, workspaceFolder: context.workspaceFolder } }), name, Tasks.CUSTOMIZED_TASK_TYPE, {
                    name: undefined,
                    runtime: undefined,
                    presentation: undefined,
                    suppressTaskName: true
                }, false, { reevaluateOnRerun: true }, {
                    name: name,
                    identifier: name,
                    group: Tasks.TaskGroup.Build,
                    isBackground: isBackground,
                    problemMatchers: matchers
                });
                const taskGroupKind = GroupKind.from(fileConfig.group);
                if (taskGroupKind !== undefined) {
                    task.configurationProperties.group = taskGroupKind;
                }
                else if (fileConfig.group === 'none') {
                    task.configurationProperties.group = undefined;
                }
                CustomTask.fillGlobals(task, globals);
                CustomTask.fillDefaults(task, context);
                result.custom = [task];
            }
            result.custom = result.custom || [];
            result.configured = result.configured || [];
            return result;
        }
    }
    const uuidMaps = new Map();
    const recentUuidMaps = new Map();
    function parse(workspaceFolder, workspace, platform, configuration, logger, source, contextKeyService, isRecents = false) {
        const recentOrOtherMaps = isRecents ? recentUuidMaps : uuidMaps;
        let selectedUuidMaps = recentOrOtherMaps.get(source);
        if (!selectedUuidMaps) {
            recentOrOtherMaps.set(source, new Map());
            selectedUuidMaps = recentOrOtherMaps.get(source);
        }
        let uuidMap = selectedUuidMaps.get(workspaceFolder.uri.toString());
        if (!uuidMap) {
            uuidMap = new UUIDMap();
            selectedUuidMaps.set(workspaceFolder.uri.toString(), uuidMap);
        }
        try {
            uuidMap.start();
            return (new ConfigurationParser(workspaceFolder, workspace, platform, logger, uuidMap)).run(configuration, source, contextKeyService);
        }
        finally {
            uuidMap.finish();
        }
    }
    exports.parse = parse;
    function createCustomTask(contributedTask, configuredProps) {
        return CustomTask.createCustomTask(contributedTask, configuredProps);
    }
    exports.createCustomTask = createCustomTask;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFza0NvbmZpZ3VyYXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90YXNrcy9jb21tb24vdGFza0NvbmZpZ3VyYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBeUJoRyxJQUFrQixZQWVqQjtJQWZELFdBQWtCLFlBQVk7UUFDN0I7O1dBRUc7UUFDSCxtREFBVSxDQUFBO1FBRVY7O1dBRUc7UUFDSCxtREFBVSxDQUFBO1FBRVY7O1dBRUc7UUFDSCwrQ0FBUSxDQUFBO0lBQ1QsQ0FBQyxFQWZpQixZQUFZLDRCQUFaLFlBQVksUUFlN0I7SUEyR0QsSUFBaUIsZUFBZSxDQUsvQjtJQUxELFdBQWlCLGVBQWU7UUFDL0IsU0FBZ0IsRUFBRSxDQUFDLEtBQVU7WUFDNUIsTUFBTSxTQUFTLEdBQW9CLEtBQUssQ0FBQztZQUN6QyxPQUFPLFNBQVMsS0FBSyxTQUFTLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUQsQ0FBQztRQUhlLGtCQUFFLEtBR2pCLENBQUE7SUFDRixDQUFDLEVBTGdCLGVBQWUsK0JBQWYsZUFBZSxRQUsvQjtJQXdFRCxJQUFpQixhQUFhLENBYzdCO0lBZEQsV0FBaUIsYUFBYTtRQUM3QixTQUFnQixLQUFLLENBQUMsS0FBb0I7WUFDekMsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUMxQixPQUFPLEtBQUssQ0FBQzthQUNiO2lCQUFNLElBQUksS0FBSyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDdEMsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ3ZCO2lCQUFNO2dCQUNOLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUU7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