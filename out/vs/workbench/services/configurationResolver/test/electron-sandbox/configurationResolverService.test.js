/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "sinon", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/types", "vs/base/common/uri", "vs/editor/common/core/selection", "vs/editor/common/editorCommon", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/workspace/test/common/testWorkspace", "vs/workbench/services/configurationResolver/browser/baseConfigurationResolverService", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, assert, sinon_1, event_1, lifecycle_1, network_1, path_1, platform, types_1, uri_1, selection_1, editorCommon_1, testConfigurationService_1, testWorkspace_1, baseConfigurationResolverService_1, workbenchTestServices_1, workbenchTestServices_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const mockLineNumber = 10;
    class TestEditorServiceWithActiveEditor extends workbenchTestServices_1.TestEditorService {
        get activeTextEditorControl() {
            return {
                getEditorType() {
                    return editorCommon_1.EditorType.ICodeEditor;
                },
                getSelection() {
                    return new selection_1.Selection(mockLineNumber, 1, mockLineNumber, 10);
                }
            };
        }
        get activeEditor() {
            return {
                get resource() {
                    return uri_1.URI.parse('file:///VSCode/workspaceLocation/file');
                }
            };
        }
    }
    class TestConfigurationResolverService extends baseConfigurationResolverService_1.BaseConfigurationResolverService {
    }
    const nullContext = {
        getAppRoot: () => undefined,
        getExecPath: () => undefined
    };
    suite('Configuration Resolver Service', () => {
        let configurationResolverService;
        const envVariables = { key1: 'Value for key1', key2: 'Value for key2' };
        // let environmentService: MockWorkbenchEnvironmentService;
        let mockCommandService;
        let editorService;
        let containingWorkspace;
        let workspace;
        let quickInputService;
        let labelService;
        let pathService;
        let extensionService;
        setup(() => {
            mockCommandService = new MockCommandService();
            editorService = new TestEditorServiceWithActiveEditor();
            quickInputService = new workbenchTestServices_1.TestQuickInputService();
            // environmentService = new MockWorkbenchEnvironmentService(envVariables);
            labelService = new MockLabelService();
            pathService = new MockPathService();
            extensionService = new workbenchTestServices_2.TestExtensionService();
            containingWorkspace = (0, testWorkspace_1.testWorkspace)(uri_1.URI.parse('file:///VSCode/workspaceLocation'));
            workspace = containingWorkspace.folders[0];
            configurationResolverService = new TestConfigurationResolverService(nullContext, Promise.resolve(envVariables), editorService, new MockInputsConfigurationService(), mockCommandService, new workbenchTestServices_2.TestContextService(containingWorkspace), quickInputService, labelService, pathService, extensionService);
        });
        teardown(() => {
            configurationResolverService = null;
        });
        test('substitute one', async () => {
            if (platform.isWindows) {
                assert.strictEqual(await configurationResolverService.resolveAsync(workspace, 'abc ${workspaceFolder} xyz'), 'abc \\VSCode\\workspaceLocation xyz');
            }
            else {
                assert.strictEqual(await configurationResolverService.resolveAsync(workspace, 'abc ${workspaceFolder} xyz'), 'abc /VSCode/workspaceLocation xyz');
            }
        });
        test('workspace folder with argument', async () => {
            if (platform.isWindows) {
                assert.strictEqual(await configurationResolverService.resolveAsync(workspace, 'abc ${workspaceFolder:workspaceLocation} xyz'), 'abc \\VSCode\\workspaceLocation xyz');
            }
            else {
                assert.strictEqual(await configurationResolverService.resolveAsync(workspace, 'abc ${workspaceFolder:workspaceLocation} xyz'), 'abc /VSCode/workspaceLocation xyz');
            }
        });
        test('workspace folder with invalid argument', () => {
            assert.rejects(async () => await configurationResolverService.resolveAsync(workspace, 'abc ${workspaceFolder:invalidLocation} xyz'));
        });
        test('workspace folder with undefined workspace folder', () => {
            assert.rejects(async () => await configurationResolverService.resolveAsync(undefined, 'abc ${workspaceFolder} xyz'));
        });
        test('workspace folder with argument and undefined workspace folder', async () => {
            if (platform.isWindows) {
                assert.strictEqual(await configurationResolverService.resolveAsync(undefined, 'abc ${workspaceFolder:workspaceLocation} xyz'), 'abc \\VSCode\\workspaceLocation xyz');
            }
            else {
                assert.strictEqual(await configurationResolverService.resolveAsync(undefined, 'abc ${workspaceFolder:workspaceLocation} xyz'), 'abc /VSCode/workspaceLocation xyz');
            }
        });
        test('workspace folder with invalid argument and undefined workspace folder', () => {
            assert.rejects(async () => await configurationResolverService.resolveAsync(undefined, 'abc ${workspaceFolder:invalidLocation} xyz'));
        });
        test('workspace root folder name', async () => {
            assert.strictEqual(await configurationResolverService.resolveAsync(workspace, 'abc ${workspaceRootFolderName} xyz'), 'abc workspaceLocation xyz');
        });
        test('current selected line number', async () => {
            assert.strictEqual(await configurationResolverService.resolveAsync(workspace, 'abc ${lineNumber} xyz'), `abc ${mockLineNumber} xyz`);
        });
        test('relative file', async () => {
            assert.strictEqual(await configurationResolverService.resolveAsync(workspace, 'abc ${relativeFile} xyz'), 'abc file xyz');
        });
        test('relative file with argument', async () => {
            assert.strictEqual(await configurationResolverService.resolveAsync(workspace, 'abc ${relativeFile:workspaceLocation} xyz'), 'abc file xyz');
        });
        test('relative file with invalid argument', () => {
            assert.rejects(async () => await configurationResolverService.resolveAsync(workspace, 'abc ${relativeFile:invalidLocation} xyz'));
        });
        test('relative file with undefined workspace folder', async () => {
            if (platform.isWindows) {
                assert.strictEqual(await configurationResolverService.resolveAsync(undefined, 'abc ${relativeFile} xyz'), 'abc \\VSCode\\workspaceLocation\\file xyz');
            }
            else {
                assert.strictEqual(await configurationResolverService.resolveAsync(undefined, 'abc ${relativeFile} xyz'), 'abc /VSCode/workspaceLocation/file xyz');
            }
        });
        test('relative file with argument and undefined workspace folder', async () => {
            assert.strictEqual(await configurationResolverService.resolveAsync(undefined, 'abc ${relativeFile:workspaceLocation} xyz'), 'abc file xyz');
        });
        test('relative file with invalid argument and undefined workspace folder', () => {
            assert.rejects(async () => await configurationResolverService.resolveAsync(undefined, 'abc ${relativeFile:invalidLocation} xyz'));
        });
        test('substitute many', async () => {
            if (platform.isWindows) {
                assert.strictEqual(await configurationResolverService.resolveAsync(workspace, '${workspaceFolder} - ${workspaceFolder}'), '\\VSCode\\workspaceLocation - \\VSCode\\workspaceLocation');
            }
            else {
                assert.strictEqual(await configurationResolverService.resolveAsync(workspace, '${workspaceFolder} - ${workspaceFolder}'), '/VSCode/workspaceLocation - /VSCode/workspaceLocation');
            }
        });
        test('substitute one env variable', async () => {
            if (platform.isWindows) {
                assert.strictEqual(await configurationResolverService.resolveAsync(workspace, 'abc ${workspaceFolder} ${env:key1} xyz'), 'abc \\VSCode\\workspaceLocation Value for key1 xyz');
            }
            else {
                assert.strictEqual(await configurationResolverService.resolveAsync(workspace, 'abc ${workspaceFolder} ${env:key1} xyz'), 'abc /VSCode/workspaceLocation Value for key1 xyz');
            }
        });
        test('substitute many env variable', async () => {
            if (platform.isWindows) {
                assert.strictEqual(await configurationResolverService.resolveAsync(workspace, '${workspaceFolder} - ${workspaceFolder} ${env:key1} - ${env:key2}'), '\\VSCode\\workspaceLocation - \\VSCode\\workspaceLocation Value for key1 - Value for key2');
            }
            else {
                assert.strictEqual(await configurationResolverService.resolveAsync(workspace, '${workspaceFolder} - ${workspaceFolder} ${env:key1} - ${env:key2}'), '/VSCode/workspaceLocation - /VSCode/workspaceLocation Value for key1 - Value for key2');
            }
        });
        test('disallows nested keys (#77289)', async () => {
            assert.strictEqual(await configurationResolverService.resolveAsync(workspace, '${env:key1} ${env:key1${env:key2}}'), 'Value for key1 ${env:key1${env:key2}}');
        });
        test('supports extensionDir', async () => {
            const getExtension = (0, sinon_1.stub)(extensionService, 'getExtension');
            getExtension.withArgs('publisher.extId').returns(Promise.resolve({ extensionLocation: uri_1.URI.file('/some/path') }));
            assert.strictEqual(await configurationResolverService.resolveAsync(workspace, '${extensionInstallFolder:publisher.extId}'), uri_1.URI.file('/some/path').fsPath);
        });
        // test('substitute keys and values in object', () => {
        // 	const myObject = {
        // 		'${workspaceRootFolderName}': '${lineNumber}',
        // 		'hey ${env:key1} ': '${workspaceRootFolderName}'
        // 	};
        // 	assert.deepStrictEqual(configurationResolverService!.resolveAsync(workspace, myObject), {
        // 		'workspaceLocation': `${editorService.mockLineNumber}`,
        // 		'hey Value for key1 ': 'workspaceLocation'
        // 	});
        // });
        test('substitute one env variable using platform case sensitivity', async () => {
            if (platform.isWindows) {
                assert.strictEqual(await configurationResolverService.resolveAsync(workspace, '${env:key1} - ${env:Key1}'), 'Value for key1 - Value for key1');
            }
            else {
                assert.strictEqual(await configurationResolverService.resolveAsync(workspace, '${env:key1} - ${env:Key1}'), 'Value for key1 - ');
            }
        });
        test('substitute one configuration variable', async () => {
            const configurationService = new testConfigurationService_1.TestConfigurationService({
                editor: {
                    fontFamily: 'foo'
                },
                terminal: {
                    integrated: {
                        fontFamily: 'bar'
                    }
                }
            });
            const service = new TestConfigurationResolverService(nullContext, Promise.resolve(envVariables), new TestEditorServiceWithActiveEditor(), configurationService, mockCommandService, new workbenchTestServices_2.TestContextService(), quickInputService, labelService, pathService, extensionService);
            assert.strictEqual(await service.resolveAsync(workspace, 'abc ${config:editor.fontFamily} xyz'), 'abc foo xyz');
        });
        test('substitute configuration variable with undefined workspace folder', async () => {
            const configurationService = new testConfigurationService_1.TestConfigurationService({
                editor: {
                    fontFamily: 'foo'
                }
            });
            const service = new TestConfigurationResolverService(nullContext, Promise.resolve(envVariables), new TestEditorServiceWithActiveEditor(), configurationService, mockCommandService, new workbenchTestServices_2.TestContextService(), quickInputService, labelService, pathService, extensionService);
            assert.strictEqual(await service.resolveAsync(undefined, 'abc ${config:editor.fontFamily} xyz'), 'abc foo xyz');
        });
        test('substitute many configuration variables', async () => {
            const configurationService = new testConfigurationService_1.TestConfigurationService({
                editor: {
                    fontFamily: 'foo'
                },
                terminal: {
                    integrated: {
                        fontFamily: 'bar'
                    }
                }
            });
            const service = new TestConfigurationResolverService(nullContext, Promise.resolve(envVariables), new TestEditorServiceWithActiveEditor(), configurationService, mockCommandService, new workbenchTestServices_2.TestContextService(), quickInputService, labelService, pathService, extensionService);
            assert.strictEqual(await service.resolveAsync(workspace, 'abc ${config:editor.fontFamily} ${config:terminal.integrated.fontFamily} xyz'), 'abc foo bar xyz');
        });
        test('substitute one env variable and a configuration variable', async () => {
            const configurationService = new testConfigurationService_1.TestConfigurationService({
                editor: {
                    fontFamily: 'foo'
                },
                terminal: {
                    integrated: {
                        fontFamily: 'bar'
                    }
                }
            });
            const service = new TestConfigurationResolverService(nullContext, Promise.resolve(envVariables), new TestEditorServiceWithActiveEditor(), configurationService, mockCommandService, new workbenchTestServices_2.TestContextService(), quickInputService, labelService, pathService, extensionService);
            if (platform.isWindows) {
                assert.strictEqual(await service.resolveAsync(workspace, 'abc ${config:editor.fontFamily} ${workspaceFolder} ${env:key1} xyz'), 'abc foo \\VSCode\\workspaceLocation Value for key1 xyz');
            }
            else {
                assert.strictEqual(await service.resolveAsync(workspace, 'abc ${config:editor.fontFamily} ${workspaceFolder} ${env:key1} xyz'), 'abc foo /VSCode/workspaceLocation Value for key1 xyz');
            }
        });
        test('substitute many env variable and a configuration variable', async () => {
            const configurationService = new testConfigurationService_1.TestConfigurationService({
                editor: {
                    fontFamily: 'foo'
                },
                terminal: {
                    integrated: {
                        fontFamily: 'bar'
                    }
                }
            });
            const service = new TestConfigurationResolverService(nullContext, Promise.resolve(envVariables), new TestEditorServiceWithActiveEditor(), configurationService, mockCommandService, new workbenchTestServices_2.TestContextService(), quickInputService, labelService, pathService, extensionService);
            if (platform.isWindows) {
                assert.strictEqual(await service.resolveAsync(workspace, '${config:editor.fontFamily} ${config:terminal.integrated.fontFamily} ${workspaceFolder} - ${workspaceFolder} ${env:key1} - ${env:key2}'), 'foo bar \\VSCode\\workspaceLocation - \\VSCode\\workspaceLocation Value for key1 - Value for key2');
            }
            else {
                assert.strictEqual(await service.resolveAsync(workspace, '${config:editor.fontFamily} ${config:terminal.integrated.fontFamily} ${workspaceFolder} - ${workspaceFolder} ${env:key1} - ${env:key2}'), 'foo bar /VSCode/workspaceLocation - /VSCode/workspaceLocation Value for key1 - Value for key2');
            }
        });
        test('mixed types of configuration variables', async () => {
            const configurationService = new testConfigurationService_1.TestConfigurationService({
                editor: {
                    fontFamily: 'foo',
                    lineNumbers: 123,
                    insertSpaces: false
                },
                terminal: {
                    integrated: {
                        fontFamily: 'bar'
                    }
                },
                json: {
                    schemas: [
                        {
                            fileMatch: [
                                '/myfile',
                                '/myOtherfile'
                            ],
                            url: 'schemaURL'
                        }
                    ]
                }
            });
            const service = new TestConfigurationResolverService(nullContext, Promise.resolve(envVariables), new TestEditorServiceWithActiveEditor(), configurationService, mockCommandService, new workbenchTestServices_2.TestContextService(), quickInputService, labelService, pathService, extensionService);
            assert.strictEqual(await service.resolveAsync(workspace, 'abc ${config:editor.fontFamily} ${config:editor.lineNumbers} ${config:editor.insertSpaces} xyz'), 'abc foo 123 false xyz');
        });
        test('uses original variable as fallback', async () => {
            const configurationService = new testConfigurationService_1.TestConfigurationService({
                editor: {}
            });
            const service = new TestConfigurationResolverService(nullContext, Promise.resolve(envVariables), new TestEditorServiceWithActiveEditor(), configurationService, mockCommandService, new workbenchTestServices_2.TestContextService(), quickInputService, labelService, pathService, extensionService);
            assert.strictEqual(await service.resolveAsync(workspace, 'abc ${unknownVariable} xyz'), 'abc ${unknownVariable} xyz');
            assert.strictEqual(await service.resolveAsync(workspace, 'abc ${env:unknownVariable} xyz'), 'abc  xyz');
        });
        test('configuration variables with invalid accessor', () => {
            const configurationService = new testConfigurationService_1.TestConfigurationService({
                editor: {
                    fontFamily: 'foo'
                }
            });
            const service = new TestConfigurationResolverService(nullContext, Promise.resolve(envVariables), new TestEditorServiceWithActiveEditor(), configurationService, mockCommandService, new workbenchTestServices_2.TestContextService(), quickInputService, labelService, pathService, extensionService);
            assert.rejects(async () => await service.resolveAsync(workspace, 'abc ${env} xyz'));
            assert.rejects(async () => await service.resolveAsync(workspace, 'abc ${env:} xyz'));
            assert.rejects(async () => await service.resolveAsync(workspace, 'abc ${config} xyz'));
            assert.rejects(async () => await service.resolveAsync(workspace, 'abc ${config:} xyz'));
            assert.rejects(async () => await service.resolveAsync(workspace, 'abc ${config:editor} xyz'));
            assert.rejects(async () => await service.resolveAsync(workspace, 'abc ${config:editor..fontFamily} xyz'));
            assert.rejects(async () => await service.resolveAsync(workspace, 'abc ${config:editor.none.none2} xyz'));
        });
        test('a single command variable', () => {
            const configuration = {
                'name': 'Attach to Process',
                'type': 'node',
                'request': 'attach',
                'processId': '${command:command1}',
                'port': 5858,
                'sourceMaps': false,
                'outDir': null
            };
            return configurationResolverService.resolveWithInteractionReplace(undefined, configuration).then(result => {
                assert.deepStrictEqual({ ...result }, {
                    'name': 'Attach to Process',
                    'type': 'node',
                    'request': 'attach',
                    'processId': 'command1-result',
                    'port': 5858,
                    'sourceMaps': false,
                    'outDir': null
                });
                assert.strictEqual(1, mockCommandService.callCount);
            });
        });
        test('an old style command variable', () => {
            const configuration = {
                'name': 'Attach to Process',
                'type': 'node',
                'request': 'attach',
                'processId': '${command:commandVariable1}',
                'port': 5858,
                'sourceMaps': false,
                'outDir': null
            };
            const commandVariables = Object.create(null);
            commandVariables['commandVariable1'] = 'command1';
            return configurationResolverService.resolveWithInteractionReplace(undefined, configuration, undefined, commandVariables).then(result => {
                assert.deepStrictEqual({ ...result }, {
                    'name': 'Attach to Process',
                    'type': 'node',
                    'request': 'attach',
                    'processId': 'command1-result',
                    'port': 5858,
                    'sourceMaps': false,
                    'outDir': null
                });
                assert.strictEqual(1, mockCommandService.callCount);
            });
        });
        test('multiple new and old-style command variables', () => {
            const configuration = {
                'name': 'Attach to Process',
                'type': 'node',
                'request': 'attach',
                'processId': '${command:commandVariable1}',
                'pid': '${command:command2}',
                'sourceMaps': false,
                'outDir': 'src/${command:command2}',
                'env': {
                    'processId': '__${command:command2}__',
                }
            };
            const commandVariables = Object.create(null);
            commandVariables['commandVariable1'] = 'command1';
            return configurationResolverService.resolveWithInteractionReplace(undefined, configuration, undefined, commandVariables).then(result => {
                const expected = {
                    'name': 'Attach to Process',
                    'type': 'node',
                    'request': 'attach',
                    'processId': 'command1-result',
                    'pid': 'command2-result',
                    'sourceMaps': false,
                    'outDir': 'src/command2-result',
                    'env': {
                        'processId': '__command2-result__',
                    }
                };
                assert.deepStrictEqual(Object.keys(result), Object.keys(expected));
                Object.keys(result).forEach(property => {
                    const expectedProperty = expected[property];
                    if ((0, types_1.isObject)(result[property])) {
                        assert.deepStrictEqual({ ...result[property] }, expectedProperty);
                    }
                    else {
                        assert.deepStrictEqual(result[property], expectedProperty);
                    }
                });
                assert.strictEqual(2, mockCommandService.callCount);
            });
        });
        test('a command variable that relies on resolved env vars', () => {
            const configuration = {
                'name': 'Attach to Process',
                'type': 'node',
                'request': 'attach',
                'processId': '${command:commandVariable1}',
                'value': '${env:key1}'
            };
            const commandVariables = Object.create(null);
            commandVariables['commandVariable1'] = 'command1';
            return configurationResolverService.resolveWithInteractionReplace(undefined, configuration, undefined, commandVariables).then(result => {
                assert.deepStrictEqual({ ...result }, {
                    'name': 'Attach to Process',
                    'type': 'node',
                    'request': 'attach',
                    'processId': 'Value for key1',
                    'value': 'Value for key1'
                });
                assert.strictEqual(1, mockCommandService.callCount);
            });
        });
        test('a single prompt input variable', () => {
            const configuration = {
                'name': 'Attach to Process',
                'type': 'node',
                'request': 'attach',
                'processId': '${input:input1}',
                'port': 5858,
                'sourceMaps': false,
                'outDir': null
            };
            return configurationResolverService.resolveWithInteractionReplace(workspace, configuration, 'tasks').then(result => {
                assert.deepStrictEqual({ ...result }, {
                    'name': 'Attach to Process',
                    'type': 'node',
                    'request': 'attach',
                    'processId': 'resolvedEnterinput1',
                    'port': 5858,
                    'sourceMaps': false,
                    'outDir': null
                });
                assert.strictEqual(0, mockCommandService.callCount);
            });
        });
        test('a single pick input variable', () => {
            const configuration = {
                'name': 'Attach to Process',
                'type': 'node',
                'request': 'attach',
                'processId': '${input:input2}',
                'port': 5858,
                'sourceMaps': false,
                'outDir': null
            };
            return configurationResolverService.resolveWithInteractionReplace(workspace, configuration, 'tasks').then(result => {
                assert.deepStrictEqual({ ...result }, {
                    'name': 'Attach to Process',
                    'type': 'node',
                    'request': 'attach',
                    'processId': 'selectedPick',
                    'port': 5858,
                    'sourceMaps': false,
                    'outDir': null
                });
                assert.strictEqual(0, mockCommandService.callCount);
            });
        });
        test('a single command input variable', () => {
            const configuration = {
                'name': 'Attach to Process',
                'type': 'node',
                'request': 'attach',
                'processId': '${input:input4}',
                'port': 5858,
                'sourceMaps': false,
                'outDir': null
            };
            return configurationResolverService.resolveWithInteractionReplace(workspace, configuration, 'tasks').then(result => {
                assert.deepStrictEqual({ ...result }, {
                    'name': 'Attach to Process',
                    'type': 'node',
                    'request': 'attach',
                    'processId': 'arg for command',
                    'port': 5858,
                    'sourceMaps': false,
                    'outDir': null
                });
                assert.strictEqual(1, mockCommandService.callCount);
            });
        });
        test('several input variables and command', () => {
            const configuration = {
                'name': '${input:input3}',
                'type': '${command:command1}',
                'request': '${input:input1}',
                'processId': '${input:input2}',
                'command': '${input:input4}',
                'port': 5858,
                'sourceMaps': false,
                'outDir': null
            };
            return configurationResolverService.resolveWithInteractionReplace(workspace, configuration, 'tasks').then(result => {
                assert.deepStrictEqual({ ...result }, {
                    'name': 'resolvedEnterinput3',
                    'type': 'command1-result',
                    'request': 'resolvedEnterinput1',
                    'processId': 'selectedPick',
                    'command': 'arg for command',
                    'port': 5858,
                    'sourceMaps': false,
                    'outDir': null
                });
                assert.strictEqual(2, mockCommandService.callCount);
            });
        });
        test('input variable with undefined workspace folder', () => {
            const configuration = {
                'name': 'Attach to Process',
                'type': 'node',
                'request': 'attach',
                'processId': '${input:input1}',
                'port': 5858,
                'sourceMaps': false,
                'outDir': null
            };
            return configurationResolverService.resolveWithInteractionReplace(undefined, configuration, 'tasks').then(result => {
                assert.deepStrictEqual({ ...result }, {
                    'name': 'Attach to Process',
                    'type': 'node',
                    'request': 'attach',
                    'processId': 'resolvedEnterinput1',
                    'port': 5858,
                    'sourceMaps': false,
                    'outDir': null
                });
                assert.strictEqual(0, mockCommandService.callCount);
            });
        });
        test('contributed variable', () => {
            const buildTask = 'npm: compile';
            const variable = 'defaultBuildTask';
            const configuration = {
                'name': '${' + variable + '}',
            };
            configurationResolverService.contributeVariable(variable, async () => { return buildTask; });
            return configurationResolverService.resolveWithInteractionReplace(workspace, configuration).then(result => {
                assert.deepStrictEqual({ ...result }, {
                    'name': `${buildTask}`
                });
            });
        });
        test('resolveWithEnvironment', async () => {
            const env = {
                'VAR_1': 'VAL_1',
                'VAR_2': 'VAL_2'
            };
            const configuration = 'echo ${env:VAR_1}${env:VAR_2}';
            const resolvedResult = await configurationResolverService.resolveWithEnvironment({ ...env }, undefined, configuration);
            assert.deepStrictEqual(resolvedResult, 'echo VAL_1VAL_2');
        });
    });
    class MockCommandService {
        constructor() {
            this.callCount = 0;
            this.onWillExecuteCommand = () => lifecycle_1.Disposable.None;
            this.onDidExecuteCommand = () => lifecycle_1.Disposable.None;
        }
        executeCommand(commandId, ...args) {
            this.callCount++;
            let result = `${commandId}-result`;
            if (args.length >= 1) {
                if (args[0] && args[0].value) {
                    result = args[0].value;
                }
            }
            return Promise.resolve(result);
        }
    }
    class MockLabelService {
        constructor() {
            this.onDidChangeFormatters = new event_1.Emitter().event;
        }
        getUriLabel(resource, options) {
            return (0, path_1.normalize)(resource.fsPath);
        }
        getUriBasenameLabel(resource) {
            throw new Error('Method not implemented.');
        }
        getWorkspaceLabel(workspace, options) {
            throw new Error('Method not implemented.');
        }
        getHostLabel(scheme, authority) {
            throw new Error('Method not implemented.');
        }
        getHostTooltip() {
            throw new Error('Method not implemented.');
        }
        getSeparator(scheme, authority) {
            throw new Error('Method not implemented.');
        }
        registerFormatter(formatter) {
            throw new Error('Method not implemented.');
        }
        registerCachedFormatter(formatter) {
            throw new Error('Method not implemented.');
        }
    }
    class MockPathService {
        constructor() {
            this.defaultUriScheme = network_1.Schemas.file;
        }
        get path() {
            throw new Error('Property not implemented');
        }
        fileURI(path) {
            throw new Error('Method not implemented.');
        }
        userHome(options) {
            const uri = uri_1.URI.file('c:\\users\\username');
            return options?.preferLocal ? uri : Promise.resolve(uri);
        }
        hasValidBasename(resource, arg2, name) {
            throw new Error('Method not implemented.');
        }
    }
    class MockInputsConfigurationService extends testConfigurationService_1.TestConfigurationService {
        getValue(arg1, arg2) {
            let configuration;
            if (arg1 === 'tasks') {
                configuration = {
                    inputs: [
                        {
                            id: 'input1',
                            type: 'promptString',
                            description: 'Enterinput1',
                            default: 'default input1'
                        },
                        {
                            id: 'input2',
                            type: 'pickString',
                            description: 'Enterinput1',
                            default: 'option2',
                            options: ['option1', 'option2', 'option3']
                        },
                        {
                            id: 'input3',
                            type: 'promptString',
                            description: 'Enterinput3',
                            default: 'default input3',
                            password: true
                        },
                        {
                            id: 'input4',
                            type: 'command',
                            command: 'command1',
                            args: {
                                value: 'arg for command'
                            }
                        }
                    ]
                };
            }
            return configuration;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvblJlc29sdmVyU2VydmljZS50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2NvbmZpZ3VyYXRpb25SZXNvbHZlci90ZXN0L2VsZWN0cm9uLXNhbmRib3gvY29uZmlndXJhdGlvblJlc29sdmVyU2VydmljZS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBMkJoRyxNQUFNLGNBQWMsR0FBRyxFQUFFLENBQUM7SUFDMUIsTUFBTSxpQ0FBa0MsU0FBUSx5Q0FBaUI7UUFDaEUsSUFBYSx1QkFBdUI7WUFDbkMsT0FBTztnQkFDTixhQUFhO29CQUNaLE9BQU8seUJBQVUsQ0FBQyxXQUFXLENBQUM7Z0JBQy9CLENBQUM7Z0JBQ0QsWUFBWTtvQkFDWCxPQUFPLElBQUkscUJBQVMsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxFQUFFLGNBQWMsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDN0QsQ0FBQzthQUNELENBQUM7UUFDSCxDQUFDO1FBQ0QsSUFBYSxZQUFZO1lBQ3hCLE9BQU87Z0JBQ04sSUFBSSxRQUFRO29CQUNYLE9BQU8sU0FBRyxDQUFDLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO2dCQUMzRCxDQUFDO2FBQ0QsQ0FBQztRQUNILENBQUM7S0FDRDtJQUVELE1BQU0sZ0NBQWlDLFNBQVEsbUVBQWdDO0tBRTlFO0lBRUQsTUFBTSxXQUFXLEdBQUc7UUFDbkIsVUFBVSxFQUFFLEdBQUcsRUFBRSxDQUFDLFNBQVM7UUFDM0IsV0FBVyxFQUFFLEdBQUcsRUFBRSxDQUFDLFNBQVM7S0FDNUIsQ0FBQztJQUVGLEtBQUssQ0FBQyxnQ0FBZ0MsRUFBRSxHQUFHLEVBQUU7UUFDNUMsSUFBSSw0QkFBa0UsQ0FBQztRQUN2RSxNQUFNLFlBQVksR0FBOEIsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsSUFB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