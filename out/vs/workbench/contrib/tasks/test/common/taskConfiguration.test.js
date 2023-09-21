define(["require", "exports", "vs/base/common/uri", "assert", "vs/base/common/severity", "vs/base/common/uuid", "vs/base/common/types", "vs/base/common/platform", "vs/base/common/parsers", "vs/workbench/contrib/tasks/common/problemMatcher", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/tasks/common/tasks", "vs/workbench/contrib/tasks/common/taskConfiguration", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/workspace/test/common/testWorkspace", "vs/platform/instantiation/test/common/instantiationServiceMock"], function (require, exports, uri_1, assert, severity_1, UUID, Types, Platform, parsers_1, problemMatcher_1, workspace_1, Tasks, taskConfiguration_1, mockKeybindingService_1, testWorkspace_1, instantiationServiceMock_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const workspaceFolder = new workspace_1.WorkspaceFolder({
        uri: uri_1.URI.file('/workspace/folderOne'),
        name: 'folderOne',
        index: 0
    });
    const workspace = new testWorkspace_1.Workspace('id', [workspaceFolder]);
    class ProblemReporter {
        constructor() {
            this._validationStatus = new parsers_1.ValidationStatus();
            this.receivedMessage = false;
            this.lastMessage = undefined;
        }
        info(message) {
            this.log(message);
        }
        warn(message) {
            this.log(message);
        }
        error(message) {
            this.log(message);
        }
        fatal(message) {
            this.log(message);
        }
        get status() {
            return this._validationStatus;
        }
        log(message) {
            this.receivedMessage = true;
            this.lastMessage = message;
        }
        clearMessage() {
            this.lastMessage = undefined;
        }
    }
    class ConfigurationBuilder {
        constructor() {
            this.result = [];
            this.builders = [];
        }
        task(name, command) {
            const builder = new CustomTaskBuilder(this, name, command);
            this.builders.push(builder);
            this.result.push(builder.result);
            return builder;
        }
        done() {
            for (const builder of this.builders) {
                builder.done();
            }
        }
    }
    class PresentationBuilder {
        constructor(parent) {
            this.parent = parent;
            this.result = { echo: false, reveal: Tasks.RevealKind.Always, revealProblems: Tasks.RevealProblemKind.Never, focus: false, panel: Tasks.PanelKind.Shared, showReuseMessage: true, clear: false, close: false };
        }
        echo(value) {
            this.result.echo = value;
            return this;
        }
        reveal(value) {
            this.result.reveal = value;
            return this;
        }
        focus(value) {
            this.result.focus = value;
            return this;
        }
        instance(value) {
            this.result.panel = value;
            return this;
        }
        showReuseMessage(value) {
            this.result.showReuseMessage = value;
            return this;
        }
        close(value) {
            this.result.close = value;
            return this;
        }
        done() {
        }
    }
    class CommandConfigurationBuilder {
        constructor(parent, command) {
            this.parent = parent;
            this.presentationBuilder = new PresentationBuilder(this);
            this.result = {
                name: command,
                runtime: Tasks.RuntimeType.Process,
                args: [],
                options: {
                    cwd: '${workspaceFolder}'
                },
                presentation: this.presentationBuilder.result,
                suppressTaskName: false
            };
        }
        name(value) {
            this.result.name = value;
            return this;
        }
        runtime(value) {
            this.result.runtime = value;
            return this;
        }
        args(value) {
            this.result.args = value;
            return this;
        }
        options(value) {
            this.result.options = value;
            return this;
        }
        taskSelector(value) {
            this.result.taskSelector = value;
            return this;
        }
        suppressTaskName(value) {
            this.result.suppressTaskName = value;
            return this;
        }
        presentation() {
            return this.presentationBuilder;
        }
        done(taskName) {
            this.result.args = this.result.args.map(arg => arg === '$name' ? taskName : arg);
            this.presentationBuilder.done();
        }
    }
    class CustomTaskBuilder {
        constructor(parent, name, command) {
            this.parent = parent;
            this.commandBuilder = new CommandConfigurationBuilder(this, command);
            this.result = new Tasks.CustomTask(name, { kind: Tasks.TaskSourceKind.Workspace, label: 'workspace', config: { workspaceFolder: workspaceFolder, element: undefined, index: -1, file: '.vscode/tasks.json' } }, name, Tasks.CUSTOMIZED_TASK_TYPE, this.commandBuilder.result, false, { reevaluateOnRerun: true }, {
                identifier: name,
                name: name,
                isBackground: false,
                promptOnClose: true,
                problemMatchers: [],
            });
        }
        identifier(value) {
            this.result.configurationProperties.identifier = value;
            return this;
        }
        group(value) {
            this.result.configurationProperties.group = value;
            return this;
        }
        isBackground(value) {
            this.result.configurationProperties.isBackground = value;
            return this;
        }
        promptOnClose(value) {
            this.result.configurationProperties.promptOnClose = value;
            return this;
        }
        problemMatcher() {
            const builder = new ProblemMatcherBuilder(this);
            this.result.configurationProperties.problemMatchers.push(builder.result);
            return builder;
        }
        command() {
            return this.commandBuilder;
        }
        done() {
            this.commandBuilder.done(this.result.configurationProperties.name);
        }
    }
    class ProblemMatcherBuilder {
        static { this.DEFAULT_UUID = UUID.generateUuid(); }
        constructor(parent) {
            this.parent = parent;
            this.result = {
                owner: ProblemMatcherBuilder.DEFAULT_UUID,
                applyTo: problemMatcher_1.ApplyToKind.allDocuments,
                severity: undefined,
                fileLocation: problemMatcher_1.FileLocationKind.Relative,
                filePrefix: '${workspaceFolder}',
                pattern: undefined
            };
        }
        owner(value) {
            this.result.owner = value;
            return this;
        }
        applyTo(value) {
            this.result.applyTo = value;
            return this;
        }
        severity(value) {
            this.result.severity = value;
            return this;
        }
        fileLocation(value) {
            this.result.fileLocation = value;
            return this;
        }
        filePrefix(value) {
            this.result.filePrefix = value;
            return this;
        }
        pattern(regExp) {
            const builder = new PatternBuilder(this, regExp);
            if (!this.result.pattern) {
                this.result.pattern = builder.result;
            }
            return builder;
        }
    }
    class PatternBuilder {
        constructor(parent, regExp) {
            this.parent = parent;
            this.result = {
                regexp: regExp,
                file: 1,
                message: 0,
                line: 2,
                character: 3
            };
        }
        file(value) {
            this.result.file = value;
            return this;
        }
        message(value) {
            this.result.message = value;
            return this;
        }
        location(value) {
            this.result.location = value;
            return this;
        }
        line(value) {
            this.result.line = value;
            return this;
        }
        character(value) {
            this.result.character = value;
            return this;
        }
        endLine(value) {
            this.result.endLine = value;
            return this;
        }
        endCharacter(value) {
            this.result.endCharacter = value;
            return this;
        }
        code(value) {
            this.result.code = value;
            return this;
        }
        severity(value) {
            this.result.severity = value;
            return this;
        }
        loop(value) {
            this.result.loop = value;
            return this;
        }
    }
    class TasksMockContextKeyService extends mockKeybindingService_1.MockContextKeyService {
        getContext(domNode) {
            return {
                getValue: (_key) => {
                    return true;
                }
            };
        }
    }
    function testDefaultProblemMatcher(external, resolved) {
        const reporter = new ProblemReporter();
        const result = (0, taskConfiguration_1.parse)(workspaceFolder, workspace, Platform.platform, external, reporter, taskConfiguration_1.TaskConfigSource.TasksJson, new TasksMockContextKeyService());
        assert.ok(!reporter.receivedMessage);
        assert.strictEqual(result.custom.length, 1);
        const task = result.custom[0];
        assert.ok(task);
        assert.strictEqual(task.configurationProperties.problemMatchers.length, resolved);
    }
    function testConfiguration(external, builder) {
        builder.done();
        const reporter = new ProblemReporter();
        const result = (0, taskConfiguration_1.parse)(workspaceFolder, workspace, Platform.platform, external, reporter, taskConfiguration_1.TaskConfigSource.TasksJson, new TasksMockContextKeyService());
        if (reporter.receivedMessage) {
            assert.ok(false, reporter.lastMessage);
        }
        assertConfiguration(result, builder.result);
    }
    class TaskGroupMap {
        constructor() {
            this._store = Object.create(null);
        }
        add(group, task) {
            let tasks = this._store[group];
            if (!tasks) {
                tasks = [];
                this._store[group] = tasks;
            }
            tasks.push(task);
        }
        static assert(actual, expected) {
            const actualKeys = Object.keys(actual._store);
            const expectedKeys = Object.keys(expected._store);
            if (actualKeys.length === 0 && expectedKeys.length === 0) {
                return;
            }
            assert.strictEqual(actualKeys.length, expectedKeys.length);
            actualKeys.forEach(key => assert.ok(expected._store[key]));
            expectedKeys.forEach(key => actual._store[key]);
            actualKeys.forEach((key) => {
                const actualTasks = actual._store[key];
                const expectedTasks = expected._store[key];
                assert.strictEqual(actualTasks.length, expectedTasks.length);
                if (actualTasks.length === 1) {
                    assert.strictEqual(actualTasks[0].configurationProperties.name, expectedTasks[0].configurationProperties.name);
                    return;
                }
                const expectedTaskMap = Object.create(null);
                expectedTasks.forEach(task => expectedTaskMap[task.configurationProperties.name] = true);
                actualTasks.forEach(task => delete expectedTaskMap[task.configurationProperties.name]);
                assert.strictEqual(Object.keys(expectedTaskMap).length, 0);
            });
        }
    }
    function assertConfiguration(result, expected) {
        assert.ok(result.validationStatus.isOK());
        const actual = result.custom;
        assert.strictEqual(typeof actual, typeof expected);
        if (!actual) {
            return;
        }
        // We can't compare Ids since the parser uses UUID which are random
        // So create a new map using the name.
        const actualTasks = Object.create(null);
        const actualId2Name = Object.create(null);
        const actualTaskGroups = new TaskGroupMap();
        actual.forEach(task => {
            assert.ok(!actualTasks[task.configurationProperties.name]);
            actualTasks[task.configurationProperties.name] = task;
            actualId2Name[task._id] = task.configurationProperties.name;
            const taskId = Tasks.TaskGroup.from(task.configurationProperties.group)?._id;
            if (taskId) {
                actualTaskGroups.add(taskId, task);
            }
        });
        const expectedTasks = Object.create(null);
        const expectedTaskGroup = new TaskGroupMap();
        expected.forEach(task => {
            assert.ok(!expectedTasks[task.configurationProperties.name]);
            expectedTasks[task.configurationProperties.name] = task;
            const taskId = Tasks.TaskGroup.from(task.configurationProperties.group)?._id;
            if (taskId) {
                expectedTaskGroup.add(taskId, task);
            }
        });
        const actualKeys = Object.keys(actualTasks);
        assert.strictEqual(actualKeys.length, expected.length);
        actualKeys.forEach((key) => {
            const actualTask = actualTasks[key];
            const expectedTask = expectedTasks[key];
            assert.ok(expectedTask);
            assertTask(actualTask, expectedTask);
        });
        TaskGroupMap.assert(actualTaskGroups, expectedTaskGroup);
    }
    function assertTask(actual, expected) {
        assert.ok(actual._id);
        assert.strictEqual(actual.configurationProperties.name, expected.configurationProperties.name, 'name');
        if (!Tasks.InMemoryTask.is(actual) && !Tasks.InMemoryTask.is(expected)) {
            assertCommandConfiguration(actual.command, expected.command);
        }
        assert.strictEqual(actual.configurationProperties.isBackground, expected.configurationProperties.isBackground, 'isBackground');
        assert.strictEqual(typeof actual.configurationProperties.problemMatchers, typeof expected.configurationProperties.problemMatchers);
        assert.strictEqual(actual.configurationProperties.promptOnClose, expected.configurationProperties.promptOnClose, 'promptOnClose');
        assert.strictEqual(typeof actual.configurationProperties.group, typeof expected.configurationProperties.group, `group types unequal`);
        if (actual.configurationProperties.problemMatchers && expected.configurationProperties.problemMatchers) {
            assert.strictEqual(actual.configurationProperties.problemMatchers.length, expected.configurationProperties.problemMatchers.length);
            for (let i = 0; i < actual.configurationProperties.problemMatchers.length; i++) {
                assertProblemMatcher(actual.configurationProperties.problemMatchers[i], expected.configurationProperties.problemMatchers[i]);
            }
        }
        if (actual.configurationProperties.group && expected.configurationProperties.group) {
            if (Types.isString(actual.configurationProperties.group)) {
                assert.strictEqual(actual.configurationProperties.group, expected.configurationProperties.group);
            }
            else {
                assertGroup(actual.configurationProperties.group, expected.configurationProperties.group);
            }
        }
    }
    function assertCommandConfiguration(actual, expected) {
        assert.strictEqual(typeof actual, typeof expected);
        if (actual && expected) {
            assertPresentation(actual.presentation, expected.presentation);
            assert.strictEqual(actual.name, expected.name, 'name');
            assert.strictEqual(actual.runtime, expected.runtime, 'runtime type');
            assert.strictEqual(actual.suppressTaskName, expected.suppressTaskName, 'suppressTaskName');
            assert.strictEqual(actual.taskSelector, expected.taskSelector, 'taskSelector');
            assert.deepStrictEqual(actual.args, expected.args, 'args');
            assert.strictEqual(typeof actual.options, typeof expected.options);
            if (actual.options && expected.options) {
                assert.strictEqual(actual.options.cwd, expected.options.cwd, 'cwd');
                assert.strictEqual(typeof actual.options.env, typeof expected.options.env, 'env');
                if (actual.options.env && expected.options.env) {
                    assert.deepStrictEqual(actual.options.env, expected.options.env, 'env');
                }
            }
        }
    }
    function assertGroup(actual, expected) {
        assert.strictEqual(typeof actual, typeof expected);
        if (actual && expected) {
            assert.strictEqual(actual._id, expected._id, `group ids unequal. actual: ${actual._id} expected ${expected._id}`);
            assert.strictEqual(actual.isDefault, expected.isDefault, `group defaults unequal. actual: ${actual.isDefault} expected ${expected.isDefault}`);
        }
    }
    function assertPresentation(actual, expected) {
        assert.strictEqual(typeof actual, typeof expected);
        if (actual && expected) {
            assert.strictEqual(actual.echo, expected.echo);
            assert.strictEqual(actual.reveal, expected.reveal);
        }
    }
    function assertProblemMatcher(actual, expected) {
        assert.strictEqual(typeof actual, typeof expected);
        if (typeof actual === 'string' && typeof expected === 'string') {
            assert.strictEqual(actual, expected, 'Problem matcher references are different');
            return;
        }
        if (typeof actual !== 'string' && typeof expected !== 'string') {
            if (expected.owner === ProblemMatcherBuilder.DEFAULT_UUID) {
                assert.ok(UUID.isUUID(actual.owner), 'Owner must be a UUID');
            }
            else {
                assert.strictEqual(actual.owner, expected.owner);
            }
            assert.strictEqual(actual.applyTo, expected.applyTo);
            assert.strictEqual(actual.severity, expected.severity);
            assert.strictEqual(actual.fileLocation, expected.fileLocation);
            assert.strictEqual(actual.filePrefix, expected.filePrefix);
            if (actual.pattern && expected.pattern) {
                assertProblemPatterns(actual.pattern, expected.pattern);
            }
        }
    }
    function assertProblemPatterns(actual, expected) {
        assert.strictEqual(typeof actual, typeof expected);
        if (Array.isArray(actual)) {
            const actuals = actual;
            const expecteds = expected;
            assert.strictEqual(actuals.length, expecteds.length);
            for (let i = 0; i < actuals.length; i++) {
                assertProblemPattern(actuals[i], expecteds[i]);
            }
        }
        else {
            assertProblemPattern(actual, expected);
        }
    }
    function assertProblemPattern(actual, expected) {
        assert.strictEqual(actual.regexp.toString(), expected.regexp.toString());
        assert.strictEqual(actual.file, expected.file);
        assert.strictEqual(actual.message, expected.message);
        if (typeof expected.location !== 'undefined') {
            assert.strictEqual(actual.location, expected.location);
        }
        else {
            assert.strictEqual(actual.line, expected.line);
            assert.strictEqual(actual.character, expected.character);
            assert.strictEqual(actual.endLine, expected.endLine);
            assert.strictEqual(actual.endCharacter, expected.endCharacter);
        }
        assert.strictEqual(actual.code, expected.code);
        assert.strictEqual(actual.severity, expected.severity);
        assert.strictEqual(actual.loop, expected.loop);
    }
    suite('Tasks version 0.1.0', () => {
        test('tasks: all default', () => {
            const builder = new ConfigurationBuilder();
            builder.task('tsc', 'tsc').
                group(Tasks.TaskGroup.Build).
                command().suppressTaskName(true);
            testConfiguration({
                version: '0.1.0',
                command: 'tsc'
            }, builder);
        });
        test('tasks: global isShellCommand', () => {
            const builder = new ConfigurationBuilder();
            builder.task('tsc', 'tsc').
                group(Tasks.TaskGroup.Build).
                command().suppressTaskName(true).
                runtime(Tasks.RuntimeType.Shell);
            testConfiguration({
                version: '0.1.0',
                command: 'tsc',
                isShellCommand: true
            }, builder);
        });
        test('tasks: global show output silent', () => {
            const builder = new ConfigurationBuilder();
            builder.
                task('tsc', 'tsc').
                group(Tasks.TaskGroup.Build).
                command().suppressTaskName(true).
                presentation().reveal(Tasks.RevealKind.Silent);
            testConfiguration({
                version: '0.1.0',
                command: 'tsc',
                showOutput: 'silent'
            }, builder);
        });
        test('tasks: global promptOnClose default', () => {
            const builder = new ConfigurationBuilder();
            builder.task('tsc', 'tsc').
                group(Tasks.TaskGroup.Build).
                command().suppressTaskName(true);
            testConfiguration({
                version: '0.1.0',
                command: 'tsc',
                promptOnClose: true
            }, builder);
        });
        test('tasks: global promptOnClose', () => {
            const builder = new ConfigurationBuilder();
            builder.task('tsc', 'tsc').
                group(Tasks.TaskGroup.Build).
                promptOnClose(false).
                command().suppressTaskName(true);
            testConfiguration({
                version: '0.1.0',
                command: 'tsc',
                promptOnClose: false
            }, builder);
        });
        test('tasks: global promptOnClose default watching', () => {
            const builder = new ConfigurationBuilder();
            builder.task('tsc', 'tsc').
                group(Tasks.TaskGroup.Build).
                isBackground(true).
                promptOnClose(false).
                command().suppressTaskName(true);
            testConfiguration({
                version: '0.1.0',
                command: 'tsc',
                isWatching: true
            }, builder);
        });
        test('tasks: global show output never', () => {
            const builder = new ConfigurationBuilder();
            builder.
                task('tsc', 'tsc').
                group(Tasks.TaskGroup.Build).
                command().suppressTaskName(true).
                presentation().reveal(Tasks.RevealKind.Never);
            testConfiguration({
                version: '0.1.0',
                command: 'tsc',
                showOutput: 'never'
            }, builder);
        });
        test('tasks: global echo Command', () => {
            const builder = new ConfigurationBuilder();
            builder.
                task('tsc', 'tsc').
                group(Tasks.TaskGroup.Build).
                command().suppressTaskName(true).
                presentation().
                echo(true);
            testConfiguration({
                version: '0.1.0',
                command: 'tsc',
                echoCommand: true
            }, builder);
        });
        test('tasks: global args', () => {
            const builder = new ConfigurationBuilder();
            builder.
                task('tsc', 'tsc').
                group(Tasks.TaskGroup.Build).
                command().suppressTaskName(true).
                args(['--p']);
            testConfiguration({
                version: '0.1.0',
                command: 'tsc',
                args: [
                    '--p'
                ]
            }, builder);
        });
        test('tasks: options - cwd', () => {
            const builder = new ConfigurationBuilder();
            builder.
                task('tsc', 'tsc').
                group(Tasks.TaskGroup.Build).
                command().suppressTaskName(true).
                options({
                cwd: 'myPath'
            });
            testConfiguration({
                version: '0.1.0',
                command: 'tsc',
                options: {
                    cwd: 'myPath'
                }
            }, builder);
        });
        test('tasks: options - env', () => {
            const builder = new ConfigurationBuilder();
            builder.
                task('tsc', 'tsc').
                group(Tasks.TaskGroup.Build).
                command().suppressTaskName(true).
                options({ cwd: '${workspaceFolder}', env: { key: 'value' } });
            testConfiguration({
                version: '0.1.0',
                command: 'tsc',
                options: {
                    env: {
                        key: 'value'
                    }
                }
            }, builder);
        });
        test('tasks: os windows', () => {
            const name = Platform.isWindows ? 'tsc.win' : 'tsc';
            const builder = new ConfigurationBuilder();
            builder.
                task(name, name).
                group(Tasks.TaskGroup.Build).
                command().suppressTaskName(true);
            const external = {
                version: '0.1.0',
                command: 'tsc',
                windows: {
                    command: 'tsc.win'
                }
            };
            testConfiguration(external, builder);
        });
        test('tasks: os windows & global isShellCommand', () => {
            const name = Platform.isWindows ? 'tsc.win' : 'tsc';
            const builder = new ConfigurationBuilder();
            builder.
                task(name, name).
                group(Tasks.TaskGroup.Build).
                command().suppressTaskName(true).
                runtime(Tasks.RuntimeType.Shell);
            const external = {
                version: '0.1.0',
                command: 'tsc',
                isShellCommand: true,
                windows: {
                    command: 'tsc.win'
                }
            };
            testConfiguration(external, builder);
        });
        test('tasks: os mac', () => {
            const name = Platform.isMacintosh ? 'tsc.osx' : 'tsc';
            const builder = new ConfigurationBuilder();
            builder.
                task(name, name).
                group(Tasks.TaskGroup.Build).
                command().suppressTaskName(true);
            const external = {
                version: '0.1.0',
                command: 'tsc',
                osx: {
                    command: 'tsc.osx'
                }
            };
            testConfiguration(external, builder);
        });
        test('tasks: os linux', () => {
            const name = Platform.isLinux ? 'tsc.linux' : 'tsc';
            const builder = new ConfigurationBuilder();
            builder.
                task(name, name).
                group(Tasks.TaskGroup.Build).
                command().suppressTaskName(true);
            const external = {
                version: '0.1.0',
                command: 'tsc',
                linux: {
                    command: 'tsc.linux'
                }
            };
            testConfiguration(external, builder);
        });
        test('tasks: overwrite showOutput', () => {
            const builder = new ConfigurationBuilder();
            builder.
                task('tsc', 'tsc').
                group(Tasks.TaskGroup.Build).
                command().suppressTaskName(true).
                presentation().reveal(Platform.isWindows ? Tasks.RevealKind.Always : Tasks.RevealKind.Never);
            const external = {
                version: '0.1.0',
                command: 'tsc',
                showOutput: 'never',
                windows: {
                    showOutput: 'always'
                }
            };
            testConfiguration(external, builder);
        });
        test('tasks: overwrite echo Command', () => {
            const builder = new ConfigurationBuilder();
            builder.
                task('tsc', 'tsc').
                group(Tasks.TaskGroup.Build).
                command().suppressTaskName(true).
                presentation().
                echo(Platform.isWindows ? false : true);
            const external = {
                version: '0.1.0',
                command: 'tsc',
                echoCommand: true,
                windows: {
                    echoCommand: false
                }
            };
            testConfiguration(external, builder);
        });
        test('tasks: global problemMatcher one', () => {
            const external = {
                version: '0.1.0',
                command: 'tsc',
                problemMatcher: '$msCompile'
            };
            testDefaultProblemMatcher(external, 1);
        });
        test('tasks: global problemMatcher two', () => {
            const external = {
                version: '0.1.0',
                command: 'tsc',
                problemMatcher: ['$eslint-compact', '$msCompile']
            };
            testDefaultProblemMatcher(external, 2);
        });
        test('tasks: task definition', () => {
            const external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskName'
                    }
                ]
            };
            const builder = new ConfigurationBuilder();
            builder.task('taskName', 'tsc').command().args(['$name']);
            testConfiguration(external, builder);
        });
        test('tasks: build task', () => {
            const external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskName',
                        isBuildCommand: true
                    }
                ]
            };
            const builder = new ConfigurationBuilder();
            builder.task('taskName', 'tsc').group(Tasks.TaskGroup.Build).command().args(['$name']);
            testConfiguration(external, builder);
        });
        test('tasks: default build task', () => {
            const external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'build'
                    }
                ]
            };
            const builder = new ConfigurationBuilder();
            builder.task('build', 'tsc').group(Tasks.TaskGroup.Build).command().args(['$name']);
            testConfiguration(external, builder);
        });
        test('tasks: test task', () => {
            const external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskName',
                        isTestCommand: true
                    }
                ]
            };
            const builder = new ConfigurationBuilder();
            builder.task('taskName', 'tsc').group(Tasks.TaskGroup.Test).command().args(['$name']);
            testConfiguration(external, builder);
        });
        test('tasks: default test task', () => {
            const external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'test'
                    }
                ]
            };
            const builder = new ConfigurationBuilder();
            builder.task('test', 'tsc').group(Tasks.TaskGroup.Test).command().args(['$name']);
            testConfiguration(external, builder);
        });
        test('tasks: task with values', () => {
            const external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'test',
                        showOutput: 'never',
                        echoCommand: true,
                        args: ['--p'],
                        isWatching: true
                    }
                ]
            };
            const builder = new ConfigurationBuilder();
            builder.task('test', 'tsc').
                group(Tasks.TaskGroup.Test).
                isBackground(true).
                promptOnClose(false).
                command().args(['$name', '--p']).
                presentation().
                echo(true).reveal(Tasks.RevealKind.Never);
            testConfiguration(external, builder);
        });
        test('tasks: task inherits global values', () => {
            const external = {
                version: '0.1.0',
                command: 'tsc',
                showOutput: 'never',
                echoCommand: true,
                tasks: [
                    {
                        taskName: 'test'
                    }
                ]
            };
            const builder = new ConfigurationBuilder();
            builder.task('test', 'tsc').
                group(Tasks.TaskGroup.Test).
                command().args(['$name']).presentation().
                echo(true).reveal(Tasks.RevealKind.Never);
            testConfiguration(external, builder);
        });
        test('tasks: problem matcher default', () => {
            const external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskName',
                        problemMatcher: {
                            pattern: {
                                regexp: 'abc'
                            }
                        }
                    }
                ]
            };
            const builder = new ConfigurationBuilder();
            builder.task('taskName', 'tsc').
                command().args(['$name']).parent.
                problemMatcher().pattern(/abc/);
            testConfiguration(external, builder);
        });
        test('tasks: problem matcher .* regular expression', () => {
            const external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskName',
                        problemMatcher: {
                            pattern: {
                                regexp: '.*'
                            }
                        }
                    }
                ]
            };
            const builder = new ConfigurationBuilder();
            builder.task('taskName', 'tsc').
                command().args(['$name']).parent.
                problemMatcher().pattern(/.*/);
            testConfiguration(external, builder);
        });
        test('tasks: problem matcher owner, applyTo, severity and fileLocation', () => {
            const external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskName',
                        problemMatcher: {
                            owner: 'myOwner',
                            applyTo: 'closedDocuments',
                            severity: 'warning',
                            fileLocation: 'absolute',
                            pattern: {
                                regexp: 'abc'
                            }
                        }
                    }
                ]
            };
            const builder = new ConfigurationBuilder();
            builder.task('taskName', 'tsc').
                command().args(['$name']).parent.
                problemMatcher().
                owner('myOwner').
                applyTo(problemMatcher_1.ApplyToKind.closedDocuments).
                severity(severity_1.default.Warning).
                fileLocation(problemMatcher_1.FileLocationKind.Absolute).
                filePrefix(undefined).
                pattern(/abc/);
            testConfiguration(external, builder);
        });
        test('tasks: problem matcher fileLocation and filePrefix', () => {
            const external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskName',
                        problemMatcher: {
                            fileLocation: ['relative', 'myPath'],
                            pattern: {
                                regexp: 'abc'
                            }
                        }
                    }
                ]
            };
            const builder = new ConfigurationBuilder();
            builder.task('taskName', 'tsc').
                command().args(['$name']).parent.
                problemMatcher().
                fileLocation(problemMatcher_1.FileLocationKind.Relative).
                filePrefix('myPath').
                pattern(/abc/);
            testConfiguration(external, builder);
        });
        test('tasks: problem pattern location', () => {
            const external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskName',
                        problemMatcher: {
                            pattern: {
                                regexp: 'abc',
                                file: 10,
                                message: 11,
                                location: 12,
                                severity: 13,
                                code: 14
                            }
                        }
                    }
                ]
            };
            const builder = new ConfigurationBuilder();
            builder.task('taskName', 'tsc').
                command().args(['$name']).parent.
                problemMatcher().
                pattern(/abc/).file(10).message(11).location(12).severity(13).code(14);
            testConfiguration(external, builder);
        });
        test('tasks: problem pattern line & column', () => {
            const external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskName',
                        problemMatcher: {
                            pattern: {
                                regexp: 'abc',
                                file: 10,
                                message: 11,
                                line: 12,
                                column: 13,
                                endLine: 14,
                                endColumn: 15,
                                severity: 16,
                                code: 17
                            }
                        }
                    }
                ]
            };
            const builder = new ConfigurationBuilder();
            builder.task('taskName', 'tsc').
                command().args(['$name']).parent.
                problemMatcher().
                pattern(/abc/).file(10).message(11).
                line(12).character(13).endLine(14).endCharacter(15).
                severity(16).code(17);
            testConfiguration(external, builder);
        });
        test('tasks: prompt on close default', () => {
            const external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskName'
                    }
                ]
            };
            const builder = new ConfigurationBuilder();
            builder.task('taskName', 'tsc').
                promptOnClose(true).
                command().args(['$name']);
            testConfiguration(external, builder);
        });
        test('tasks: prompt on close watching', () => {
            const external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskName',
                        isWatching: true
                    }
                ]
            };
            const builder = new ConfigurationBuilder();
            builder.task('taskName', 'tsc').
                isBackground(true).promptOnClose(false).
                command().args(['$name']);
            testConfiguration(external, builder);
        });
        test('tasks: prompt on close set', () => {
            const external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskName',
                        promptOnClose: false
                    }
                ]
            };
            const builder = new ConfigurationBuilder();
            builder.task('taskName', 'tsc').
                promptOnClose(false).
                command().args(['$name']);
            testConfiguration(external, builder);
        });
        test('tasks: task selector set', () => {
            const external = {
                version: '0.1.0',
                command: 'tsc',
                taskSelector: '/t:',
                tasks: [
                    {
                        taskName: 'taskName',
                    }
                ]
            };
            const builder = new ConfigurationBuilder();
            builder.task('taskName', 'tsc').
                command().
                taskSelector('/t:').
                args(['/t:taskName']);
            testConfiguration(external, builder);
        });
        test('tasks: suppress task name set', () => {
            const external = {
                version: '0.1.0',
                command: 'tsc',
                suppressTaskName: false,
                tasks: [
                    {
                        taskName: 'taskName',
                        suppressTaskName: true
                    }
                ]
            };
            const builder = new ConfigurationBuilder();
            builder.task('taskName', 'tsc').
                command().suppressTaskName(true);
            testConfiguration(external, builder);
        });
        test('tasks: suppress task name inherit', () => {
            const external = {
                version: '0.1.0',
                command: 'tsc',
                suppressTaskName: true,
                tasks: [
                    {
                        taskName: 'taskName'
                    }
                ]
            };
            const builder = new ConfigurationBuilder();
            builder.task('taskName', 'tsc').
                command().suppressTaskName(true);
            testConfiguration(external, builder);
        });
        test('tasks: two tasks', () => {
            const external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskNameOne'
                    },
                    {
                        taskName: 'taskNameTwo'
                    }
                ]
            };
            const builder = new ConfigurationBuilder();
            builder.task('taskNameOne', 'tsc').
                command().args(['$name']);
            builder.task('taskNameTwo', 'tsc').
                command().args(['$name']);
            testConfiguration(external, builder);
        });
        test('tasks: with command', () => {
            const external = {
                version: '0.1.0',
                tasks: [
                    {
                        taskName: 'taskNameOne',
                        command: 'tsc'
                    }
                ]
            };
            const builder = new ConfigurationBuilder();
            builder.task('taskNameOne', 'tsc').command().suppressTaskName(true);
            testConfiguration(external, builder);
        });
        test('tasks: two tasks with command', () => {
            const external = {
                version: '0.1.0',
                tasks: [
                    {
                        taskName: 'taskNameOne',
                        command: 'tsc'
                    },
                    {
                        taskName: 'taskNameTwo',
                        command: 'dir'
                    }
                ]
            };
            const builder = new ConfigurationBuilder();
            builder.task('taskNameOne', 'tsc').command().suppressTaskName(true);
            builder.task('taskNameTwo', 'dir').command().suppressTaskName(true);
            testConfiguration(external, builder);
        });
        test('tasks: with command and args', () => {
            const external = {
                version: '0.1.0',
                tasks: [
                    {
                        taskName: 'taskNameOne',
                        command: 'tsc',
                        isShellCommand: true,
                        args: ['arg'],
                        options: {
                            cwd: 'cwd',
                            env: {
                                env: 'env'
                            }
                        }
                    }
                ]
            };
            const builder = new ConfigurationBuilder();
            builder.task('taskNameOne', 'tsc').command().suppressTaskName(true).
                runtime(Tasks.RuntimeType.Shell).args(['arg']).options({ cwd: 'cwd', env: { env: 'env' } });
            testConfiguration(external, builder);
        });
        test('tasks: with command os specific', () => {
            const name = Platform.isWindows ? 'tsc.win' : 'tsc';
            const external = {
                version: '0.1.0',
                tasks: [
                    {
                        taskName: 'taskNameOne',
                        command: 'tsc',
                        windows: {
                            command: 'tsc.win'
                        }
                    }
                ]
            };
            const builder = new ConfigurationBuilder();
            builder.task('taskNameOne', name).command().suppressTaskName(true);
            testConfiguration(external, builder);
        });
        test('tasks: with Windows specific args', () => {
            const args = Platform.isWindows ? ['arg1', 'arg2'] : ['arg1'];
            const external = {
                version: '0.1.0',
                tasks: [
                    {
                        taskName: 'tsc',
                        command: 'tsc',
                        args: ['arg1'],
                        windows: {
                            args: ['arg2']
                        }
                    }
                ]
            };
            const builder = new ConfigurationBuilder();
            builder.task('tsc', 'tsc').command().suppressTaskName(true).args(args);
            testConfiguration(external, builder);
        });
        test('tasks: with Linux specific args', () => {
            const args = Platform.isLinux ? ['arg1', 'arg2'] : ['arg1'];
            const external = {
                version: '0.1.0',
                tasks: [
                    {
                        taskName: 'tsc',
                        command: 'tsc',
                        args: ['arg1'],
                        linux: {
                            args: ['arg2']
                        }
                    }
                ]
            };
            const builder = new ConfigurationBuilder();
            builder.task('tsc', 'tsc').command().suppressTaskName(true).args(args);
            testConfiguration(external, builder);
        });
        test('tasks: global command and task command properties', () => {
            const external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskNameOne',
                        isShellCommand: true,
                    }
                ]
            };
            const builder = new ConfigurationBuilder();
            builder.task('taskNameOne', 'tsc').command().runtime(Tasks.RuntimeType.Shell).args(['$name']);
            testConfiguration(external, builder);
        });
        test('tasks: global and tasks args', () => {
            const external = {
                version: '0.1.0',
                command: 'tsc',
                args: ['global'],
                tasks: [
                    {
                        taskName: 'taskNameOne',
                        args: ['local']
                    }
                ]
            };
            const builder = new ConfigurationBuilder();
            builder.task('taskNameOne', 'tsc').command().args(['global', '$name', 'local']);
            testConfiguration(external, builder);
        });
        test('tasks: global and tasks args with task selector', () => {
            const external = {
                version: '0.1.0',
                command: 'tsc',
                args: ['global'],
                taskSelector: '/t:',
                tasks: [
                    {
                        taskName: 'taskNameOne',
                        args: ['local']
                    }
                ]
            };
            const builder = new ConfigurationBuilder();
            builder.task('taskNameOne', 'tsc').command().taskSelector('/t:').args(['global', '/t:taskNameOne', 'local']);
            testConfiguration(external, builder);
        });
    });
    suite('Tasks version 2.0.0', () => {
        test.skip('Build workspace task', () => {
            const external = {
                version: '2.0.0',
                tasks: [
                    {
                        taskName: 'dir',
                        command: 'dir',
                        type: 'shell',
                        group: 'build'
                    }
                ]
            };
            const builder = new ConfigurationBuilder();
            builder.task('dir', 'dir').
                group(Tasks.TaskGroup.Build).
                command().suppressTaskName(true).
                runtime(Tasks.RuntimeType.Shell).
                presentation().echo(true);
            testConfiguration(external, builder);
        });
        test('Global group none', () => {
            const external = {
                version: '2.0.0',
                command: 'dir',
                type: 'shell',
                group: 'none'
            };
            const builder = new ConfigurationBuilder();
            builder.task('dir', 'dir').
                command().suppressTaskName(true).
                runtime(Tasks.RuntimeType.Shell).
                presentation().echo(true);
            testConfiguration(external, builder);
        });
        test.skip('Global group build', () => {
            const external = {
                version: '2.0.0',
                command: 'dir',
                type: 'shell',
                group: 'build'
            };
            const builder = new ConfigurationBuilder();
            builder.task('dir', 'dir').
                group(Tasks.TaskGroup.Build).
                command().suppressTaskName(true).
                runtime(Tasks.RuntimeType.Shell).
                presentation().echo(true);
            testConfiguration(external, builder);
        });
        test.skip('Global group default build', () => {
            const external = {
                version: '2.0.0',
                command: 'dir',
                type: 'shell',
                group: { kind: 'build', isDefault: true }
            };
            const builder = new ConfigurationBuilder();
            const taskGroup = Tasks.TaskGroup.Build;
            taskGroup.isDefault = true;
            builder.task('dir', 'dir').
                group(taskGroup).
                command().suppressTaskName(true).
                runtime(Tasks.RuntimeType.Shell).
                presentation().echo(true);
            testConfiguration(external, builder);
        });
        test('Local group none', () => {
            const external = {
                version: '2.0.0',
                tasks: [
                    {
                        taskName: 'dir',
                        command: 'dir',
                        type: 'shell',
                        group: 'none'
                    }
                ]
            };
            const builder = new ConfigurationBuilder();
            builder.task('dir', 'dir').
                command().suppressTaskName(true).
                runtime(Tasks.RuntimeType.Shell).
                presentation().echo(true);
            testConfiguration(external, builder);
        });
        test.skip('Local group build', () => {
            const external = {
                version: '2.0.0',
                tasks: [
                    {
                        taskName: 'dir',
                        command: 'dir',
                        type: 'shell',
                        group: 'build'
                    }
                ]
            };
            const builder = new ConfigurationBuilder();
            builder.task('dir', 'dir').
                group(Tasks.TaskGroup.Build).
                command().suppressTaskName(true).
                runtime(Tasks.RuntimeType.Shell).
                presentation().echo(true);
            testConfiguration(external, builder);
        });
        test.skip('Local group default build', () => {
            const external = {
                version: '2.0.0',
                tasks: [
                    {
                        taskName: 'dir',
                        command: 'dir',
                        type: 'shell',
                        group: { kind: 'build', isDefault: true }
                    }
                ]
            };
            const builder = new ConfigurationBuilder();
            const taskGroup = Tasks.TaskGroup.Build;
            taskGroup.isDefault = true;
            builder.task('dir', 'dir').
                group(taskGroup).
                command().suppressTaskName(true).
                runtime(Tasks.RuntimeType.Shell).
                presentation().echo(true);
            testConfiguration(external, builder);
        });
        test('Arg overwrite', () => {
            const external = {
                version: '2.0.0',
                tasks: [
                    {
                        label: 'echo',
                        type: 'shell',
                        command: 'echo',
                        args: [
                            'global'
                        ],
                        windows: {
                            args: [
                                'windows'
                            ]
                        },
                        linux: {
                            args: [
                                'linux'
                            ]
                        },
                        osx: {
                            args: [
                                'osx'
                            ]
                        }
                    }
                ]
            };
            const builder = new ConfigurationBuilder();
            if (Platform.isWindows) {
                builder.task('echo', 'echo').
                    command().suppressTaskName(true).args(['windows']).
                    runtime(Tasks.RuntimeType.Shell).
                    presentation().echo(true);
                testConfiguration(external, builder);
            }
            else if (Platform.isLinux) {
                builder.task('echo', 'echo').
                    command().suppressTaskName(true).args(['linux']).
                    runtime(Tasks.RuntimeType.Shell).
                    presentation().echo(true);
                testConfiguration(external, builder);
            }
            else if (Platform.isMacintosh) {
                builder.task('echo', 'echo').
                    command().suppressTaskName(true).args(['osx']).
                    runtime(Tasks.RuntimeType.Shell).
                    presentation().echo(true);
                testConfiguration(external, builder);
            }
        });
    });
    suite('Bugs / regression tests', () => {
        (Platform.isLinux ? test.skip : test)('Bug 19548', () => {
            const external = {
                version: '0.1.0',
                windows: {
                    command: 'powershell',
                    options: {
                        cwd: '${workspaceFolder}'
                    },
                    tasks: [
                        {
                            taskName: 'composeForDebug',
                            suppressTaskName: true,
                            args: [
                                '-ExecutionPolicy',
                                'RemoteSigned',
                                '.\\dockerTask.ps1',
                                '-ComposeForDebug',
                                '-Environment',
                                'debug'
                            ],
                            isBuildCommand: false,
                            showOutput: 'always',
                            echoCommand: true
                        }
                    ]
                },
                osx: {
                    command: '/bin/bash',
                    options: {
                        cwd: '${workspaceFolder}'
                    },
                    tasks: [
                        {
                            taskName: 'composeForDebug',
                            suppressTaskName: true,
                            args: [
                                '-c',
                                './dockerTask.sh composeForDebug debug'
                            ],
                            isBuildCommand: false,
                            showOutput: 'always'
                        }
                    ]
                }
            };
            const builder = new ConfigurationBuilder();
            if (Platform.isWindows) {
                builder.task('composeForDebug', 'powershell').
                    command().suppressTaskName(true).
                    args(['-ExecutionPolicy', 'RemoteSigned', '.\\dockerTask.ps1', '-ComposeForDebug', '-Environment', 'debug']).
                    options({ cwd: '${workspaceFolder}' }).
                    presentation().echo(true).reveal(Tasks.RevealKind.Always);
                testConfiguration(external, builder);
            }
            else if (Platform.isMacintosh) {
                builder.task('composeForDebug', '/bin/bash').
                    command().suppressTaskName(true).
                    args(['-c', './dockerTask.sh composeForDebug debug']).
                    options({ cwd: '${workspaceFolder}' }).
                    presentation().reveal(Tasks.RevealKind.Always);
                testConfiguration(external, builder);
            }
        });
        test('Bug 28489', () => {
            const external = {
                version: '0.1.0',
                command: '',
                isShellCommand: true,
                args: [''],
                showOutput: 'always',
                'tasks': [
                    {
                        taskName: 'build',
                        command: 'bash',
                        args: [
                            'build.sh'
                        ]
                    }
                ]
            };
            const builder = new ConfigurationBuilder();
            builder.task('build', 'bash').
                group(Tasks.TaskGroup.Build).
                command().suppressTaskName(true).
                args(['build.sh']).
                runtime(Tasks.RuntimeType.Shell);
            testConfiguration(external, builder);
        });
    });
    class TestNamedProblemMatcher {
    }
    class TestParseContext {
    }
    class TestTaskDefinitionRegistry {
        get(key) {
            return this._task;
        }
        set(task) {
            this._task = task;
        }
    }
    suite('Task configuration conversions', () => {
        const globals = {};
        const taskConfigSource = {};
        const TaskDefinitionRegistry = new TestTaskDefinitionRegistry();
        let instantiationService;
        let parseContext;
        let namedProblemMatcher;
        let problemReporter;
        setup(() => {
            instantiationService = new instantiationServiceMock_1.TestInstantiationService();
            namedProblemMatcher = instantiationService.createInstance(TestNamedProblemMatcher);
            namedProblemMatcher.name = 'real';
            namedProblemMatcher.label = 'real label';
            problemReporter = new ProblemReporter();
            parseContext = instantiationService.createInstance(TestParseContext);
            parseContext.problemReporter = problemReporter;
            parseContext.namedProblemMatchers = { 'real': namedProblemMatcher };
            parseContext.uuidMap = new taskConfiguration_1.UUIDMap();
        });
        teardown(() => {
            instantiationService.dispose();
        });
        suite('ProblemMatcherConverter.from', () => {
            test('returns [] and an error for an unknown problem matcher', () => {
                const result = (taskConfiguration_1.ProblemMatcherConverter.from('$fake', parseContext));
                assert.deepEqual(result.value, []);
                assert.strictEqual(result.errors?.length, 1);
            });
            test('returns config for a known problem matcher', () => {
                const result = (taskConfiguration_1.ProblemMatcherConverter.from('$real', parseContext));
                assert.strictEqual(result.errors?.length, 0);
                assert.deepEqual(result.value, [{ "label": "real label" }]);
            });
            test('returns config for a known problem matcher including applyTo', () => {
                namedProblemMatcher.applyTo = problemMatcher_1.ApplyToKind.closedDocuments;
                const result = (taskConfiguration_1.ProblemMatcherConverter.from('$real', parseContext));
                assert.strictEqual(result.errors?.length, 0);
                assert.deepEqual(result.value, [{ "label": "real label", "applyTo": problemMatcher_1.ApplyToKind.closedDocuments }]);
            });
        });
        suite('TaskParser.from', () => {
            suite('CustomTask', () => {
                suite('incomplete config reports an appropriate error for missing', () => {
                    test('name', () => {
                        const result = taskConfiguration_1.TaskParser.from([{}], globals, parseContext, taskConfigSource);
                        assertTaskParseResult(result, undefined, problemReporter, 'Error: a task must provide a label property');
                    });
                    test('command', () => {
                        const result = taskConfiguration_1.TaskParser.from([{ taskName: 'task' }], globals, parseContext, taskConfigSource);
                        assertTaskParseResult(result, undefined, problemReporter, "Error: the task 'task' doesn't define a command");
                    });
                });
                test('returns expected result', () => {
                    const expected = [
                        { taskName: 'task', command: 'echo test' },
                        { taskName: 'task 2', command: 'echo test' }
                    ];
                    const result = taskConfiguration_1.TaskParser.from(expected, globals, parseContext, taskConfigSource);
                    assertTaskParseResult(result, { custom: expected }, problemReporter, undefined);
                });
            });
            suite('ConfiguredTask', () => {
                test('returns expected result', () => {
                    const expected = [{ taskName: 'task', command: 'echo test', type: 'any', label: 'task' }, { taskName: 'task 2', command: 'echo test', type: 'any', label: 'task 2' }];
                    TaskDefinitionRegistry.set({ extensionId: 'registered', taskType: 'any', properties: {} });
                    const result = taskConfiguration_1.TaskParser.from(expected, globals, parseContext, taskConfigSource, TaskDefinitionRegistry);
                    assertTaskParseResult(result, { configured: expected }, problemReporter, undefined);
                });
            });
        });
    });
    function assertTaskParseResult(actual, expected, problemReporter, expectedMessage) {
        if (expectedMessage === undefined) {
            assert.strictEqual(problemReporter.lastMessage, undefined);
        }
        else {
            assert.ok(problemReporter.lastMessage?.includes(expectedMessage));
        }
        assert.deepEqual(actual.custom.length, expected?.custom?.length || 0);
        assert.deepEqual(actual.configured.length, expected?.configured?.length || 0);
        let index = 0;
        if (expected?.configured) {
            for (const taskParseResult of expected?.configured) {
                assert.strictEqual(actual.configured[index]._label, taskParseResult.label);
                index++;
            }
        }
        index = 0;
        if (expected?.custom) {
            for (const taskParseResult of expected?.custom) {
                assert.strictEqual(actual.custom[index]._label, taskParseResult.taskName);
                index++;
            }
        }
        problemReporter.clearMessage();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFza0NvbmZpZ3VyYXRpb24udGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rhc2tzL3Rlc3QvY29tbW9uL3Rhc2tDb25maWd1cmF0aW9uLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBdUJBLE1BQU0sZUFBZSxHQUFvQixJQUFJLDJCQUFlLENBQUM7UUFDNUQsR0FBRyxFQUFFLFNBQUcsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUM7UUFDckMsSUFBSSxFQUFFLFdBQVc7UUFDakIsS0FBSyxFQUFFLENBQUM7S0FDUixDQUFDLENBQUM7SUFFSCxNQUFNLFNBQVMsR0FBZSxJQUFJLHlCQUFTLENBQUMsSUFBSSxFQUFFLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztJQUVyRSxNQUFNLGVBQWU7UUFBckI7WUFFUyxzQkFBaUIsR0FBcUIsSUFBSSwwQkFBZ0IsRUFBRSxDQUFDO1lBRTlELG9CQUFlLEdBQVksS0FBSyxDQUFDO1lBQ2pDLGdCQUFXLEdBQXVCLFNBQVMsQ0FBQztRQThCcEQsQ0FBQztRQTVCTyxJQUFJLENBQUMsT0FBZTtZQUMxQixJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ25CLENBQUM7UUFFTSxJQUFJLENBQUMsT0FBZTtZQUMxQixJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ25CLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBZTtZQUMzQixJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ25CLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBZTtZQUMzQixJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ25CLENBQUM7UUFFRCxJQUFXLE1BQU07WUFDaEIsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUM7UUFDL0IsQ0FBQztRQUVPLEdBQUcs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