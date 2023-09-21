/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/platform", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/contextview/browser/contextMenuService", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/log/common/log", "vs/platform/terminal/common/capabilities/commandDetectionCapability", "vs/platform/terminal/common/capabilities/terminalCapabilityStore", "vs/workbench/contrib/terminalContrib/quickFix/browser/terminalQuickFixBuiltinActions", "vs/workbench/contrib/terminalContrib/quickFix/browser/quickFixAddon", "vs/base/common/uri", "vs/base/common/event", "vs/platform/label/common/label", "vs/platform/opener/common/opener", "vs/platform/storage/common/storage", "vs/workbench/test/common/workbenchTestServices", "vs/workbench/contrib/terminalContrib/quickFix/browser/quickFix", "vs/amdX", "vs/editor/test/browser/editorTestServices", "vs/base/test/common/utils"], function (require, exports, assert_1, platform_1, configuration_1, testConfigurationService_1, contextMenuService_1, contextView_1, instantiationServiceMock_1, log_1, commandDetectionCapability_1, terminalCapabilityStore_1, terminalQuickFixBuiltinActions_1, quickFixAddon_1, uri_1, event_1, label_1, opener_1, storage_1, workbenchTestServices_1, quickFix_1, amdX_1, editorTestServices_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('QuickFixAddon', () => {
        const store = (0, utils_1.$bT)();
        let quickFixAddon;
        let commandDetection;
        let commandService;
        let openerService;
        let labelService;
        let terminal;
        let instantiationService;
        setup(async () => {
            instantiationService = store.add(new instantiationServiceMock_1.$L0b());
            const TerminalCtor = (await (0, amdX_1.$aD)('xterm', 'lib/xterm.js')).Terminal;
            terminal = store.add(new TerminalCtor({
                allowProposedApi: true,
                cols: 80,
                rows: 30
            }));
            instantiationService.stub(storage_1.$Vo, store.add(new workbenchTestServices_1.$7dc()));
            instantiationService.stub(quickFix_1.$3kb, {
                onDidRegisterProvider: event_1.Event.None,
                onDidUnregisterProvider: event_1.Event.None,
                onDidRegisterCommandSelector: event_1.Event.None,
                extensionQuickFixes: Promise.resolve([])
            });
            instantiationService.stub(configuration_1.$8h, new testConfigurationService_1.$G0b());
            instantiationService.stub(label_1.$Vz, {});
            const capabilities = store.add(new terminalCapabilityStore_1.$eib());
            instantiationService.stub(log_1.$5i, new log_1.$fj());
            commandDetection = store.add(instantiationService.createInstance(commandDetectionCapability_1.$Tq, terminal));
            capabilities.add(2 /* TerminalCapability.CommandDetection */, commandDetection);
            instantiationService.stub(contextView_1.$WZ, store.add(instantiationService.createInstance(contextMenuService_1.$B4b)));
            instantiationService.stub(opener_1.$NT, {});
            commandService = new editorTestServices_1.$C0b(instantiationService);
            quickFixAddon = instantiationService.createInstance(quickFixAddon_1.$ZWb, [], capabilities);
            terminal.loadAddon(quickFixAddon);
        });
        suite('registerCommandFinishedListener & getMatchActions', () => {
            suite('gitSimilarCommand', () => {
                const expectedMap = new Map();
                const command = `git sttatus`;
                let output = `git: 'sttatus' is not a git command. See 'git --help'.

			The most similar command is
			status`;
                const exitCode = 1;
                const actions = [{
                        id: 'Git Similar',
                        enabled: true,
                        label: 'Run: git status',
                        tooltip: 'Run: git status',
                        command: 'git status'
                    }];
                const outputLines = output.split('\n');
                setup(() => {
                    const command = (0, terminalQuickFixBuiltinActions_1.$$Wb)();
                    expectedMap.set(command.commandLineMatcher.toString(), [command]);
                    quickFixAddon.registerCommandFinishedListener(command);
                });
                suite('returns undefined when', () => {
                    test('output does not match', async () => {
                        (0, assert_1.strictEqual)(await ((0, quickFixAddon_1.$1Wb)([], terminal, createCommand(command, `invalid output`, terminalQuickFixBuiltinActions_1.$5Wb, exitCode, [`invalid output`]), expectedMap, commandService, openerService, labelService)), undefined);
                    });
                    test('command does not match', async () => {
                        (0, assert_1.strictEqual)(await ((0, quickFixAddon_1.$1Wb)([], terminal, createCommand(`gt sttatus`, output, terminalQuickFixBuiltinActions_1.$5Wb, exitCode, outputLines), expectedMap, commandService, openerService, labelService)), undefined);
                    });
                });
                suite('returns actions when', () => {
                    test('expected unix exit code', async () => {
                        assertMatchOptions((await (0, quickFixAddon_1.$1Wb)([], terminal, createCommand(command, output, terminalQuickFixBuiltinActions_1.$5Wb, exitCode, outputLines), expectedMap, commandService, openerService, labelService)), actions);
                    });
                    test('matching exit status', async () => {
                        assertMatchOptions((await (0, quickFixAddon_1.$1Wb)([], terminal, createCommand(command, output, terminalQuickFixBuiltinActions_1.$5Wb, 2, outputLines), expectedMap, commandService, openerService, labelService)), actions);
                    });
                });
                suite('returns match', () => {
                    test('returns match', async () => {
                        assertMatchOptions((await (0, quickFixAddon_1.$1Wb)([], terminal, createCommand(command, output, terminalQuickFixBuiltinActions_1.$5Wb, exitCode, outputLines), expectedMap, commandService, openerService, labelService)), actions);
                    });
                    test('returns multiple match', async () => {
                        output = `git: 'pu' is not a git command. See 'git --help'.
				The most similar commands are
						pull
						push`;
                        const actions = [{
                                id: 'Git Similar',
                                enabled: true,
                                label: 'Run: git pull',
                                tooltip: 'Run: git pull',
                                command: 'git pull'
                            }, {
                                id: 'Git Similar',
                                enabled: true,
                                label: 'Run: git push',
                                tooltip: 'Run: git push',
                                command: 'git push'
                            }];
                        assertMatchOptions((await (0, quickFixAddon_1.$1Wb)([], terminal, createCommand('git pu', output, terminalQuickFixBuiltinActions_1.$5Wb, exitCode, output.split('\n')), expectedMap, commandService, openerService, labelService)), actions);
                    });
                    test('passes any arguments through', async () => {
                        output = `git: 'checkoutt' is not a git command. See 'git --help'.
				The most similar commands are
						checkout`;
                        assertMatchOptions((await (0, quickFixAddon_1.$1Wb)([], terminal, createCommand('git checkoutt .', output, terminalQuickFixBuiltinActions_1.$5Wb, exitCode, output.split('\n')), expectedMap, commandService, openerService, labelService)), [{
                                id: 'Git Similar',
                                enabled: true,
                                label: 'Run: git checkout .',
                                tooltip: 'Run: git checkout .',
                                command: 'git checkout .'
                            }]);
                    });
                });
            });
            suite('gitTwoDashes', () => {
                const expectedMap = new Map();
                const command = `git add . -all`;
                const output = 'error: did you mean `--all` (with two dashes)?';
                const exitCode = 1;
                const actions = [{
                        id: 'Git Two Dashes',
                        enabled: true,
                        label: 'Run: git add . --all',
                        tooltip: 'Run: git add . --all',
                        command: 'git add . --all'
                    }];
                setup(() => {
                    const command = (0, terminalQuickFixBuiltinActions_1.$_Wb)();
                    expectedMap.set(command.commandLineMatcher.toString(), [command]);
                    quickFixAddon.registerCommandFinishedListener(command);
                });
                suite('returns undefined when', () => {
                    test('output does not match', async () => {
                        (0, assert_1.strictEqual)((await (0, quickFixAddon_1.$1Wb)([], terminal, createCommand(command, `invalid output`, terminalQuickFixBuiltinActions_1.$4Wb, exitCode), expectedMap, commandService, openerService, labelService)), undefined);
                    });
                    test('command does not match', async () => {
                        (0, assert_1.strictEqual)((await (0, quickFixAddon_1.$1Wb)([], terminal, createCommand(`gt sttatus`, output, terminalQuickFixBuiltinActions_1.$4Wb, exitCode), expectedMap, commandService, openerService, labelService)), undefined);
                    });
                });
                suite('returns actions when', () => {
                    test('expected unix exit code', async () => {
                        assertMatchOptions((await (0, quickFixAddon_1.$1Wb)([], terminal, createCommand(command, output, terminalQuickFixBuiltinActions_1.$4Wb, exitCode), expectedMap, commandService, openerService, labelService)), actions);
                    });
                    test('matching exit status', async () => {
                        assertMatchOptions((await (0, quickFixAddon_1.$1Wb)([], terminal, createCommand(command, output, terminalQuickFixBuiltinActions_1.$4Wb, 2), expectedMap, commandService, openerService, labelService)), actions);
                    });
                });
            });
            if (!platform_1.$i) {
                suite('freePort', () => {
                    const expectedMap = new Map();
                    const portCommand = `yarn start dev`;
                    const output = `yarn run v1.22.17
			warning ../../package.json: No license field
			Error: listen EADDRINUSE: address already in use 0.0.0.0:3000
				at Server.setupListenHandle [as _listen2] (node:net:1315:16)
				at listenInCluster (node:net:1363:12)
				at doListen (node:net:1501:7)
				at processTicksAndRejections (node:internal/process/task_queues:84:21)
			Emitted 'error' event on WebSocketServer instance at:
				at Server.emit (node:events:394:28)
				at emitErrorNT (node:net:1342:8)
				at processTicksAndRejections (node:internal/process/task_queues:83:21) {
			}
			error Command failed with exit code 1.
			info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.`;
                    const actionOptions = [{
                            id: 'Free Port',
                            label: 'Free port 3000',
                            run: true,
                            tooltip: 'Free port 3000',
                            enabled: true
                        }];
                    setup(() => {
                        const command = (0, terminalQuickFixBuiltinActions_1.$aXb)(() => Promise.resolve());
                        expectedMap.set(command.commandLineMatcher.toString(), [command]);
                        quickFixAddon.registerCommandFinishedListener(command);
                    });
                    suite('returns undefined when', () => {
                        test('output does not match', async () => {
                            (0, assert_1.strictEqual)((await (0, quickFixAddon_1.$1Wb)([], terminal, createCommand(portCommand, `invalid output`, terminalQuickFixBuiltinActions_1.$6Wb), expectedMap, commandService, openerService, labelService)), undefined);
                        });
                    });
                    test('returns actions', async () => {
                        assertMatchOptions((await (0, quickFixAddon_1.$1Wb)([], terminal, createCommand(portCommand, output, terminalQuickFixBuiltinActions_1.$6Wb), expectedMap, commandService, openerService, labelService)), actionOptions);
                    });
                });
            }
            suite('gitPushSetUpstream', () => {
                const expectedMap = new Map();
                const command = `git push`;
                const output = `fatal: The current branch test22 has no upstream branch.
			To push the current branch and set the remote as upstream, use

				git push --set-upstream origin test22`;
                const exitCode = 128;
                const actions = [{
                        id: 'Git Push Set Upstream',
                        enabled: true,
                        label: 'Run: git push --set-upstream origin test22',
                        tooltip: 'Run: git push --set-upstream origin test22',
                        command: 'git push --set-upstream origin test22'
                    }];
                setup(() => {
                    const command = (0, terminalQuickFixBuiltinActions_1.$bXb)();
                    expectedMap.set(command.commandLineMatcher.toString(), [command]);
                    quickFixAddon.registerCommandFinishedListener(command);
                });
                suite('returns undefined when', () => {
                    test('output does not match', async () => {
                        (0, assert_1.strictEqual)((await (0, quickFixAddon_1.$1Wb)([], terminal, createCommand(command, `invalid output`, terminalQuickFixBuiltinActions_1.$7Wb, exitCode), expectedMap, commandService, openerService, labelService)), undefined);
                    });
                    test('command does not match', async () => {
                        (0, assert_1.strictEqual)((await (0, quickFixAddon_1.$1Wb)([], terminal, createCommand(`git status`, output, terminalQuickFixBuiltinActions_1.$7Wb, exitCode), expectedMap, commandService, openerService, labelService)), undefined);
                    });
                });
                suite('returns actions when', () => {
                    test('expected unix exit code', async () => {
                        assertMatchOptions((await (0, quickFixAddon_1.$1Wb)([], terminal, createCommand(command, output, terminalQuickFixBuiltinActions_1.$7Wb, exitCode), expectedMap, commandService, openerService, labelService)), actions);
                    });
                    test('matching exit status', async () => {
                        assertMatchOptions((await (0, quickFixAddon_1.$1Wb)([], terminal, createCommand(command, output, terminalQuickFixBuiltinActions_1.$7Wb, 2), expectedMap, commandService, openerService, labelService)), actions);
                    });
                });
            });
            suite('gitCreatePr', () => {
                const expectedMap = new Map();
                const command = `git push`;
                const output = `Total 0 (delta 0), reused 0 (delta 0), pack-reused 0
			remote:
			remote: Create a pull request for 'test22' on GitHub by visiting:
			remote:      https://github.com/meganrogge/xterm.js/pull/new/test22
			remote:
			To https://github.com/meganrogge/xterm.js
			 * [new branch]        test22 -> test22
			Branch 'test22' set up to track remote branch 'test22' from 'origin'. `;
                const exitCode = 0;
                const actions = [{
                        id: 'Git Create Pr',
                        enabled: true,
                        label: 'Open: https://github.com/meganrogge/xterm.js/pull/new/test22',
                        tooltip: 'Open: https://github.com/meganrogge/xterm.js/pull/new/test22',
                        uri: uri_1.URI.parse('https://github.com/meganrogge/xterm.js/pull/new/test22')
                    }];
                setup(() => {
                    const command = (0, terminalQuickFixBuiltinActions_1.$cXb)();
                    expectedMap.set(command.commandLineMatcher.toString(), [command]);
                    quickFixAddon.registerCommandFinishedListener(command);
                });
                suite('returns undefined when', () => {
                    test('output does not match', async () => {
                        (0, assert_1.strictEqual)((await (0, quickFixAddon_1.$1Wb)([], terminal, createCommand(command, `invalid output`, terminalQuickFixBuiltinActions_1.$8Wb, exitCode), expectedMap, commandService, openerService, labelService)), undefined);
                    });
                    test('command does not match', async () => {
                        (0, assert_1.strictEqual)((await (0, quickFixAddon_1.$1Wb)([], terminal, createCommand(`git status`, output, terminalQuickFixBuiltinActions_1.$8Wb, exitCode), expectedMap, commandService, openerService, labelService)), undefined);
                    });
                    test('failure exit status', async () => {
                        (0, assert_1.strictEqual)((await (0, quickFixAddon_1.$1Wb)([], terminal, createCommand(command, output, terminalQuickFixBuiltinActions_1.$8Wb, 2), expectedMap, commandService, openerService, labelService)), undefined);
                    });
                });
                suite('returns actions when', () => {
                    test('expected unix exit code', async () => {
                        assertMatchOptions((await (0, quickFixAddon_1.$1Wb)([], terminal, createCommand(command, output, terminalQuickFixBuiltinActions_1.$8Wb, exitCode), expectedMap, commandService, openerService, labelService)), actions);
                    });
                });
            });
        });
        suite('gitPush - multiple providers', () => {
            const expectedMap = new Map();
            const command = `git push`;
            const output = `fatal: The current branch test22 has no upstream branch.
		To push the current branch and set the remote as upstream, use

			git push --set-upstream origin test22`;
            const exitCode = 128;
            const actions = [{
                    id: 'Git Push Set Upstream',
                    enabled: true,
                    label: 'Run: git push --set-upstream origin test22',
                    tooltip: 'Run: git push --set-upstream origin test22',
                    command: 'git push --set-upstream origin test22'
                }];
            setup(() => {
                const pushCommand = (0, terminalQuickFixBuiltinActions_1.$bXb)();
                const prCommand = (0, terminalQuickFixBuiltinActions_1.$cXb)();
                quickFixAddon.registerCommandFinishedListener(prCommand);
                expectedMap.set(pushCommand.commandLineMatcher.toString(), [pushCommand, prCommand]);
            });
            suite('returns undefined when', () => {
                test('output does not match', async () => {
                    (0, assert_1.strictEqual)((await (0, quickFixAddon_1.$1Wb)([], terminal, createCommand(command, `invalid output`, terminalQuickFixBuiltinActions_1.$7Wb, exitCode), expectedMap, commandService, openerService, labelService)), undefined);
                });
                test('command does not match', async () => {
                    (0, assert_1.strictEqual)((await (0, quickFixAddon_1.$1Wb)([], terminal, createCommand(`git status`, output, terminalQuickFixBuiltinActions_1.$7Wb, exitCode), expectedMap, commandService, openerService, labelService)), undefined);
                });
            });
            suite('returns actions when', () => {
                test('expected unix exit code', async () => {
                    assertMatchOptions((await (0, quickFixAddon_1.$1Wb)([], terminal, createCommand(command, output, terminalQuickFixBuiltinActions_1.$7Wb, exitCode), expectedMap, commandService, openerService, labelService)), actions);
                });
                test('matching exit status', async () => {
                    assertMatchOptions((await (0, quickFixAddon_1.$1Wb)([], terminal, createCommand(command, output, terminalQuickFixBuiltinActions_1.$7Wb, 2), expectedMap, commandService, openerService, labelService)), actions);
                });
            });
        });
        suite('pwsh feedback providers', () => {
            suite('General', () => {
                const expectedMap = new Map();
                const command = `not important`;
                const output = [
                    `...`,
                    ``,
                    `Suggestion [General]:`,
                    `  The most similar commands are: python3, python3m, pamon, python3.6, rtmon, echo, pushd, etsn, pwsh, pwconv.`,
                    ``,
                    `Suggestion [cmd-not-found]:`,
                    `  Command 'python' not found, but can be installed with:`,
                    `  sudo apt install python3`,
                    `  sudo apt install python`,
                    `  sudo apt install python-minimal`,
                    `  You also have python3 installed, you can run 'python3' instead.'`,
                    ``,
                ].join('\n');
                const exitCode = 128;
                const actions = [
                    'python3',
                    'python3m',
                    'pamon',
                    'python3.6',
                    'rtmon',
                    'echo',
                    'pushd',
                    'etsn',
                    'pwsh',
                    'pwconv',
                ].map(command => {
                    return {
                        id: 'Pwsh General Error',
                        enabled: true,
                        label: `Run: ${command}`,
                        tooltip: `Run: ${command}`,
                        command: command
                    };
                });
                setup(() => {
                    const pushCommand = (0, terminalQuickFixBuiltinActions_1.$dXb)();
                    quickFixAddon.registerCommandFinishedListener(pushCommand);
                    expectedMap.set(pushCommand.commandLineMatcher.toString(), [pushCommand]);
                });
                test('returns undefined when output does not match', async () => {
                    (0, assert_1.strictEqual)((await (0, quickFixAddon_1.$1Wb)([], terminal, createCommand(command, `invalid output`, terminalQuickFixBuiltinActions_1.$9Wb, exitCode), expectedMap, commandService, openerService, labelService)), undefined);
                });
                test('returns actions when output matches', async () => {
                    assertMatchOptions((await (0, quickFixAddon_1.$1Wb)([], terminal, createCommand(command, output, terminalQuickFixBuiltinActions_1.$9Wb, exitCode), expectedMap, commandService, openerService, labelService)), actions);
                });
            });
            suite('Unix cmd-not-found', () => {
                const expectedMap = new Map();
                const command = `not important`;
                const output = [
                    `...`,
                    ``,
                    `Suggestion [General]`,
                    `  The most similar commands are: python3, python3m, pamon, python3.6, rtmon, echo, pushd, etsn, pwsh, pwconv.`,
                    ``,
                    `Suggestion [cmd-not-found]:`,
                    `  Command 'python' not found, but can be installed with:`,
                    `  sudo apt install python3`,
                    `  sudo apt install python`,
                    `  sudo apt install python-minimal`,
                    `  You also have python3 installed, you can run 'python3' instead.'`,
                    ``,
                ].join('\n');
                const exitCode = 128;
                const actions = [
                    'sudo apt install python3',
                    'sudo apt install python',
                    'sudo apt install python-minimal',
                    'python3',
                ].map(command => {
                    return {
                        id: 'Pwsh Unix Command Not Found Error',
                        enabled: true,
                        label: `Run: ${command}`,
                        tooltip: `Run: ${command}`,
                        command: command
                    };
                });
                setup(() => {
                    const pushCommand = (0, terminalQuickFixBuiltinActions_1.$eXb)();
                    quickFixAddon.registerCommandFinishedListener(pushCommand);
                    expectedMap.set(pushCommand.commandLineMatcher.toString(), [pushCommand]);
                });
                test('returns undefined when output does not match', async () => {
                    (0, assert_1.strictEqual)((await (0, quickFixAddon_1.$1Wb)([], terminal, createCommand(command, `invalid output`, terminalQuickFixBuiltinActions_1.$0Wb, exitCode), expectedMap, commandService, openerService, labelService)), undefined);
                });
                test('returns actions when output matches', async () => {
                    assertMatchOptions((await (0, quickFixAddon_1.$1Wb)([], terminal, createCommand(command, output, terminalQuickFixBuiltinActions_1.$0Wb, exitCode), expectedMap, commandService, openerService, labelService)), actions);
                });
            });
        });
    });
    function createCommand(command, output, outputMatcher, exitCode, outputLines) {
        return {
            cwd: '',
            commandStartLineContent: '',
            markProperties: {},
            command,
            isTrusted: true,
            exitCode,
            getOutput: () => { return output; },
            getOutputMatch: (_matcher) => {
                if (outputMatcher) {
                    const regexMatch = output.match(outputMatcher) ?? undefined;
                    if (regexMatch) {
                        return outputLines ? { regexMatch, outputLines } : { regexMatch, outputLines: [] };
                    }
                }
                return undefined;
            },
            timestamp: Date.now(),
            hasOutput: () => !!output
        };
    }
    function assertMatchOptions(actual, expected) {
        (0, assert_1.strictEqual)(actual?.length, expected.length);
        for (let i = 0; i < expected.length; i++) {
            const expectedItem = expected[i];
            const actualItem = actual[i];
            (0, assert_1.strictEqual)(actualItem.id, expectedItem.id, `ID`);
            (0, assert_1.strictEqual)(actualItem.enabled, expectedItem.enabled, `enabled`);
            (0, assert_1.strictEqual)(actualItem.label, expectedItem.label, `label`);
            (0, assert_1.strictEqual)(actualItem.tooltip, expectedItem.tooltip, `tooltip`);
            if (expectedItem.command) {
                (0, assert_1.strictEqual)(actualItem.command, expectedItem.command);
            }
            if (expectedItem.uri) {
                (0, assert_1.strictEqual)(actualItem.uri.toString(), expectedItem.uri.toString());
            }
        }
    }
});
//# sourceMappingURL=quickFixAddon.test.js.map