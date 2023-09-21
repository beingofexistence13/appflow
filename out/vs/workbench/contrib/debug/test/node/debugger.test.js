/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/path", "vs/base/common/platform", "vs/workbench/contrib/debug/common/debugger", "vs/platform/configuration/test/common/testConfigurationService", "vs/base/common/uri", "vs/workbench/contrib/debug/node/debugAdapter", "vs/editor/test/common/services/testTextResourcePropertiesService", "vs/platform/extensions/common/extensions"], function (require, exports, assert, path_1, platform, debugger_1, testConfigurationService_1, uri_1, debugAdapter_1, testTextResourcePropertiesService_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Debug - Debugger', () => {
        let _debugger;
        const extensionFolderPath = '/a/b/c/';
        const debuggerContribution = {
            type: 'mock',
            label: 'Mock Debug',
            program: './out/mock/mockDebug.js',
            args: ['arg1', 'arg2'],
            configurationAttributes: {
                launch: {
                    required: ['program'],
                    properties: {
                        program: {
                            'type': 'string',
                            'description': 'Workspace relative path to a text file.',
                            'default': 'readme.md'
                        }
                    }
                }
            },
            variables: null,
            initialConfigurations: [
                {
                    name: 'Mock-Debug',
                    type: 'mock',
                    request: 'launch',
                    program: 'readme.md'
                }
            ]
        };
        const extensionDescriptor0 = {
            id: 'adapter',
            identifier: new extensions_1.ExtensionIdentifier('adapter'),
            name: 'myAdapter',
            version: '1.0.0',
            publisher: 'vscode',
            extensionLocation: uri_1.URI.file(extensionFolderPath),
            isBuiltin: false,
            isUserBuiltin: false,
            isUnderDevelopment: false,
            engines: null,
            targetPlatform: "undefined" /* TargetPlatform.UNDEFINED */,
            contributes: {
                'debuggers': [
                    debuggerContribution
                ]
            }
        };
        const extensionDescriptor1 = {
            id: 'extension1',
            identifier: new extensions_1.ExtensionIdentifier('extension1'),
            name: 'extension1',
            version: '1.0.0',
            publisher: 'vscode',
            extensionLocation: uri_1.URI.file('/e1/b/c/'),
            isBuiltin: false,
            isUserBuiltin: false,
            isUnderDevelopment: false,
            engines: null,
            targetPlatform: "undefined" /* TargetPlatform.UNDEFINED */,
            contributes: {
                'debuggers': [
                    {
                        type: 'mock',
                        runtime: 'runtime',
                        runtimeArgs: ['rarg'],
                        program: 'mockprogram',
                        args: ['parg']
                    }
                ]
            }
        };
        const extensionDescriptor2 = {
            id: 'extension2',
            identifier: new extensions_1.ExtensionIdentifier('extension2'),
            name: 'extension2',
            version: '1.0.0',
            publisher: 'vscode',
            extensionLocation: uri_1.URI.file('/e2/b/c/'),
            isBuiltin: false,
            isUserBuiltin: false,
            isUnderDevelopment: false,
            engines: null,
            targetPlatform: "undefined" /* TargetPlatform.UNDEFINED */,
            contributes: {
                'debuggers': [
                    {
                        type: 'mock',
                        win: {
                            runtime: 'winRuntime',
                            program: 'winProgram'
                        },
                        linux: {
                            runtime: 'linuxRuntime',
                            program: 'linuxProgram'
                        },
                        osx: {
                            runtime: 'osxRuntime',
                            program: 'osxProgram'
                        }
                    }
                ]
            }
        };
        const adapterManager = {
            getDebugAdapterDescriptor(session, config) {
                return Promise.resolve(undefined);
            }
        };
        const configurationService = new testConfigurationService_1.TestConfigurationService();
        const testResourcePropertiesService = new testTextResourcePropertiesService_1.TestTextResourcePropertiesService(configurationService);
        setup(() => {
            _debugger = new debugger_1.Debugger(adapterManager, debuggerContribution, extensionDescriptor0, configurationService, testResourcePropertiesService, undefined, undefined, undefined, undefined);
        });
        teardown(() => {
            _debugger = null;
        });
        test('attributes', () => {
            assert.strictEqual(_debugger.type, debuggerContribution.type);
            assert.strictEqual(_debugger.label, debuggerContribution.label);
            const ae = debugAdapter_1.ExecutableDebugAdapter.platformAdapterExecutable([extensionDescriptor0], 'mock');
            assert.strictEqual(ae.command, (0, path_1.join)(extensionFolderPath, debuggerContribution.program));
            assert.deepStrictEqual(ae.args, debuggerContribution.args);
        });
        test('merge platform specific attributes', function () {
            if (!process.versions.electron) {
                this.skip(); //TODO@debug this test fails when run in node.js environments
            }
            const ae = debugAdapter_1.ExecutableDebugAdapter.platformAdapterExecutable([extensionDescriptor1, extensionDescriptor2], 'mock');
            assert.strictEqual(ae.command, platform.isLinux ? 'linuxRuntime' : (platform.isMacintosh ? 'osxRuntime' : 'winRuntime'));
            const xprogram = platform.isLinux ? 'linuxProgram' : (platform.isMacintosh ? 'osxProgram' : 'winProgram');
            assert.deepStrictEqual(ae.args, ['rarg', (0, path_1.normalize)('/e2/b/c/') + xprogram, 'parg']);
        });
        test('initial config file content', () => {
            const expected = ['{',
                '	// Use IntelliSense to learn about possible attributes.',
                '	// Hover to view descriptions of existing attributes.',
                '	// For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387',
                '	"version": "0.2.0",',
                '	"configurations": [',
                '		{',
                '			"name": "Mock-Debug",',
                '			"type": "mock",',
                '			"request": "launch",',
                '			"program": "readme.md"',
                '		}',
                '	]',
                '}'].join(testResourcePropertiesService.getEOL(uri_1.URI.file('somefile')));
            return _debugger.getInitialConfigurationContent().then(content => {
                assert.strictEqual(content, expected);
            }, err => assert.fail(err));
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdnZXIudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2RlYnVnL3Rlc3Qvbm9kZS9kZWJ1Z2dlci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBY2hHLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLEVBQUU7UUFDOUIsSUFBSSxTQUFtQixDQUFDO1FBRXhCLE1BQU0sbUJBQW1CLEdBQUcsU0FBUyxDQUFDO1FBQ3RDLE1BQU0sb0JBQW9CLEdBQUc7WUFDNUIsSUFBSSxFQUFFLE1BQU07WUFDWixLQUFLLEVBQUUsWUFBWTtZQUNuQixPQUFPLEVBQUUseUJBQXlCO1lBQ2xDLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7WUFDdEIsdUJBQXVCLEVBQUU7Z0JBQ3hCLE1BQU0sRUFBRTtvQkFDUCxRQUFRLEVBQUUsQ0FBQyxTQUFTLENBQUM7b0JBQ3JCLFVBQVUsRUFBRTt3QkFDWCxPQUFPLEVBQUU7NEJBQ1IsTUFBTSxFQUFFLFFBQVE7NEJBQ2hCLGFBQWEsRUFBRSx5Q0FBeUM7NEJBQ3hELFNBQVMsRUFBRSxXQUFXO3lCQUN0QjtxQkFDRDtpQkFDRDthQUNEO1lBQ0QsU0FBUyxFQUFFLElBQUs7WUFDaEIscUJBQXFCLEVBQUU7Z0JBQ3RCO29CQUNDLElBQUksRUFBRSxZQUFZO29CQUNsQixJQUFJLEVBQUUsTUFBTTtvQkFDWixPQUFPLEVBQUUsUUFBUTtvQkFDakIsT0FBTyxFQUFFLFdBQVc7aUJBQ3BCO2FBQ0Q7U0FDRCxDQUFDO1FBRUYsTUFBTSxvQkFBb0IsR0FBMEI7WUFDbkQsRUFBRSxFQUFFLFNBQVM7WUFDYixVQUFVLEVBQUUsSUFBSSxnQ0FBbUIsQ0FBQyxTQUFTLENBQUM7WUFDOUMsSUFBSSxFQUFFLFdBQVc7WUFDakIsT0FBTyxFQUFFLE9BQU87WUFDaEIsU0FBUyxFQUFF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