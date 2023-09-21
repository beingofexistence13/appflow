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
            identifier: new extensions_1.$Vl('adapter'),
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
            identifier: new extensions_1.$Vl('extension1'),
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
            identifier: new extensions_1.$Vl('extension2'),
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
        const configurationService = new testConfigurationService_1.$G0b();
        const testResourcePropertiesService = new testTextResourcePropertiesService_1.$F0b(configurationService);
        setup(() => {
            _debugger = new debugger_1.$IRb(adapterManager, debuggerContribution, extensionDescriptor0, configurationService, testResourcePropertiesService, undefined, undefined, undefined, undefined);
        });
        teardown(() => {
            _debugger = null;
        });
        test('attributes', () => {
            assert.strictEqual(_debugger.type, debuggerContribution.type);
            assert.strictEqual(_debugger.label, debuggerContribution.label);
            const ae = debugAdapter_1.$ndc.platformAdapterExecutable([extensionDescriptor0], 'mock');
            assert.strictEqual(ae.command, (0, path_1.$9d)(extensionFolderPath, debuggerContribution.program));
            assert.deepStrictEqual(ae.args, debuggerContribution.args);
        });
        test('merge platform specific attributes', function () {
            if (!process.versions.electron) {
                this.skip(); //TODO@debug this test fails when run in node.js environments
            }
            const ae = debugAdapter_1.$ndc.platformAdapterExecutable([extensionDescriptor1, extensionDescriptor2], 'mock');
            assert.strictEqual(ae.command, platform.$k ? 'linuxRuntime' : (platform.$j ? 'osxRuntime' : 'winRuntime'));
            const xprogram = platform.$k ? 'linuxProgram' : (platform.$j ? 'osxProgram' : 'winProgram');
            assert.deepStrictEqual(ae.args, ['rarg', (0, path_1.$7d)('/e2/b/c/') + xprogram, 'parg']);
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
//# sourceMappingURL=debugger.test.js.map