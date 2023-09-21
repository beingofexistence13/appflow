define(["require", "exports", "vs/base/common/uri", "assert", "vs/base/common/severity", "vs/base/common/uuid", "vs/base/common/types", "vs/base/common/platform", "vs/base/common/parsers", "vs/workbench/contrib/tasks/common/problemMatcher", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/tasks/common/tasks", "vs/workbench/contrib/tasks/common/taskConfiguration", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/workspace/test/common/testWorkspace", "vs/platform/instantiation/test/common/instantiationServiceMock"], function (require, exports, uri_1, assert, severity_1, UUID, Types, Platform, parsers_1, problemMatcher_1, workspace_1, Tasks, taskConfiguration_1, mockKeybindingService_1, testWorkspace_1, instantiationServiceMock_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const workspaceFolder = new workspace_1.$Vh({
        uri: uri_1.URI.file('/workspace/folderOne'),
        name: 'folderOne',
        index: 0
    });
    const workspace = new testWorkspace_1.$00b('id', [workspaceFolder]);
    class ProblemReporter {
        constructor() {
            this.a = new parsers_1.$yF();
            this.receivedMessage = false;
            this.lastMessage = undefined;
        }
        info(message) {
            this.b(message);
        }
        warn(message) {
            this.b(message);
        }
        error(message) {
            this.b(message);
        }
        fatal(message) {
            this.b(message);
        }
        get status() {
            return this.a;
        }
        b(message) {
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
            this.a = [];
        }
        task(name, command) {
            const builder = new CustomTaskBuilder(this, name, command);
            this.a.push(builder);
            this.result.push(builder.result);
            return builder;
        }
        done() {
            for (const builder of this.a) {
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
            this.a = new PresentationBuilder(this);
            this.result = {
                name: command,
                runtime: Tasks.RuntimeType.Process,
                args: [],
                options: {
                    cwd: '${workspaceFolder}'
                },
                presentation: this.a.result,
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
            return this.a;
        }
        done(taskName) {
            this.result.args = this.result.args.map(arg => arg === '$name' ? taskName : arg);
            this.a.done();
        }
    }
    class CustomTaskBuilder {
        constructor(parent, name, command) {
            this.parent = parent;
            this.a = new CommandConfigurationBuilder(this, command);
            this.result = new Tasks.$eG(name, { kind: Tasks.TaskSourceKind.Workspace, label: 'workspace', config: { workspaceFolder: workspaceFolder, element: undefined, index: -1, file: '.vscode/tasks.json' } }, name, Tasks.$cG, this.a.result, false, { reevaluateOnRerun: true }, {
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
            return this.a;
        }
        done() {
            this.a.done(this.result.configurationProperties.name);
        }
    }
    class ProblemMatcherBuilder {
        static { this.DEFAULT_UUID = UUID.$4f(); }
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
    class TasksMockContextKeyService extends mockKeybindingService_1.$S0b {
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
        const result = (0, taskConfiguration_1.$uXb)(workspaceFolder, workspace, Platform.$t, external, reporter, taskConfiguration_1.TaskConfigSource.TasksJson, new TasksMockContextKeyService());
        assert.ok(!reporter.receivedMessage);
        assert.strictEqual(result.custom.length, 1);
        const task = result.custom[0];
        assert.ok(task);
        assert.strictEqual(task.configurationProperties.problemMatchers.length, resolved);
    }
    function testConfiguration(external, builder) {
        builder.done();
        const reporter = new ProblemReporter();
        const result = (0, taskConfiguration_1.$uXb)(workspaceFolder, workspace, Platform.$t, external, reporter, taskConfiguration_1.TaskConfigSource.TasksJson, new TasksMockContextKeyService());
        if (reporter.receivedMessage) {
            assert.ok(false, reporter.lastMessage);
        }
        assertConfiguration(result, builder.result);
    }
    class TaskGroupMap {
        constructor() {
            this.a = Object.create(null);
        }
        add(group, task) {
            let tasks = this.a[group];
            if (!tasks) {
                tasks = [];
                this.a[group] = tasks;
            }
            tasks.push(task);
        }
        static assert(actual, expected) {
            const actualKeys = Object.keys(actual.a);
            const expectedKeys = Object.keys(expected.a);
            if (actualKeys.length === 0 && expectedKeys.length === 0) {
                return;
            }
            assert.strictEqual(actualKeys.length, expectedKeys.length);
            actualKeys.forEach(key => assert.ok(expected.a[key]));
            expectedKeys.forEach(key => actual.a[key]);
            actualKeys.forEach((key) => {
                const actualTasks = actual.a[key];
                const expectedTasks = expected.a[key];
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
        if (!Tasks.$hG.is(actual) && !Tasks.$hG.is(expected)) {
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
            if (Types.$jf(actual.configurationProperties.group)) {
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
                assert.ok(UUID.$3f(actual.owner), 'Owner must be a UUID');
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
            const name = Platform.$i ? 'tsc.win' : 'tsc';
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
            const name = Platform.$i ? 'tsc.win' : 'tsc';
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
            const name = Platform.$j ? 'tsc.osx' : 'tsc';
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
            const name = Platform.$k ? 'tsc.linux' : 'tsc';
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
                presentation().reveal(Platform.$i ? Tasks.RevealKind.Always : Tasks.RevealKind.Never);
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
                echo(Platform.$i ? false : true);
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
            const name = Platform.$i ? 'tsc.win' : 'tsc';
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
            const args = Platform.$i ? ['arg1', 'arg2'] : ['arg1'];
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
            const args = Platform.$k ? ['arg1', 'arg2'] : ['arg1'];
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
            if (Platform.$i) {
                builder.task('echo', 'echo').
                    command().suppressTaskName(true).args(['windows']).
                    runtime(Tasks.RuntimeType.Shell).
                    presentation().echo(true);
                testConfiguration(external, builder);
            }
            else if (Platform.$k) {
                builder.task('echo', 'echo').
                    command().suppressTaskName(true).args(['linux']).
                    runtime(Tasks.RuntimeType.Shell).
                    presentation().echo(true);
                testConfiguration(external, builder);
            }
            else if (Platform.$j) {
                builder.task('echo', 'echo').
                    command().suppressTaskName(true).args(['osx']).
                    runtime(Tasks.RuntimeType.Shell).
                    presentation().echo(true);
                testConfiguration(external, builder);
            }
        });
    });
    suite('Bugs / regression tests', () => {
        (Platform.$k ? test.skip : test)('Bug 19548', () => {
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
            if (Platform.$i) {
                builder.task('composeForDebug', 'powershell').
                    command().suppressTaskName(true).
                    args(['-ExecutionPolicy', 'RemoteSigned', '.\\dockerTask.ps1', '-ComposeForDebug', '-Environment', 'debug']).
                    options({ cwd: '${workspaceFolder}' }).
                    presentation().echo(true).reveal(Tasks.RevealKind.Always);
                testConfiguration(external, builder);
            }
            else if (Platform.$j) {
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
            return this.a;
        }
        set(task) {
            this.a = task;
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
            instantiationService = new instantiationServiceMock_1.$L0b();
            namedProblemMatcher = instantiationService.createInstance(TestNamedProblemMatcher);
            namedProblemMatcher.name = 'real';
            namedProblemMatcher.label = 'real label';
            problemReporter = new ProblemReporter();
            parseContext = instantiationService.createInstance(TestParseContext);
            parseContext.problemReporter = problemReporter;
            parseContext.namedProblemMatchers = { 'real': namedProblemMatcher };
            parseContext.uuidMap = new taskConfiguration_1.$tXb();
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
//# sourceMappingURL=taskConfiguration.test.js.map