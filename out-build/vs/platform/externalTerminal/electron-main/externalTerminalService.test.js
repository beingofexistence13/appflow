/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/externalTerminal/common/externalTerminal", "vs/platform/externalTerminal/node/externalTerminalService"], function (require, exports, assert_1, externalTerminal_1, externalTerminalService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const mockConfig = Object.freeze({
        terminal: {
            explorerKind: 'external',
            external: {
                windowsExec: 'testWindowsShell',
                osxExec: 'testOSXShell',
                linuxExec: 'testLinuxShell'
            }
        }
    });
    suite('ExternalTerminalService', () => {
        test(`WinTerminalService - uses terminal from configuration`, done => {
            const testShell = 'cmd';
            const testCwd = 'path/to/workspace';
            const mockSpawner = {
                spawn: (command, args, opts) => {
                    (0, assert_1.strictEqual)(command, testShell, 'shell should equal expected');
                    (0, assert_1.strictEqual)(args[args.length - 1], mockConfig.terminal.external.windowsExec);
                    (0, assert_1.strictEqual)(opts.cwd, testCwd);
                    done();
                    return {
                        on: (evt) => evt
                    };
                }
            };
            const testService = new externalTerminalService_1.$65b();
            testService.spawnTerminal(mockSpawner, mockConfig.terminal.external, testShell, testCwd);
        });
        test(`WinTerminalService - uses default terminal when configuration.terminal.external.windowsExec is undefined`, done => {
            const testShell = 'cmd';
            const testCwd = 'path/to/workspace';
            const mockSpawner = {
                spawn: (command, args, opts) => {
                    (0, assert_1.strictEqual)(args[args.length - 1], externalTerminalService_1.$65b.getDefaultTerminalWindows());
                    done();
                    return {
                        on: (evt) => evt
                    };
                }
            };
            mockConfig.terminal.external.windowsExec = undefined;
            const testService = new externalTerminalService_1.$65b();
            testService.spawnTerminal(mockSpawner, mockConfig.terminal.external, testShell, testCwd);
        });
        test(`WinTerminalService - cwd is correct regardless of case`, done => {
            const testShell = 'cmd';
            const testCwd = 'c:/foo';
            const mockSpawner = {
                spawn: (command, args, opts) => {
                    (0, assert_1.strictEqual)(opts.cwd, 'C:/foo', 'cwd should be uppercase regardless of the case that\'s passed in');
                    done();
                    return {
                        on: (evt) => evt
                    };
                }
            };
            const testService = new externalTerminalService_1.$65b();
            testService.spawnTerminal(mockSpawner, mockConfig.terminal.external, testShell, testCwd);
        });
        test(`WinTerminalService - cmder should be spawned differently`, done => {
            const testShell = 'cmd';
            const testCwd = 'c:/foo';
            const mockSpawner = {
                spawn: (command, args, opts) => {
                    (0, assert_1.deepStrictEqual)(args, ['C:/foo']);
                    (0, assert_1.strictEqual)(opts, undefined);
                    done();
                    return { on: (evt) => evt };
                }
            };
            const testService = new externalTerminalService_1.$65b();
            testService.spawnTerminal(mockSpawner, { windowsExec: 'cmder' }, testShell, testCwd);
        });
        test(`WinTerminalService - windows terminal should open workspace directory`, done => {
            const testShell = 'wt';
            const testCwd = 'c:/foo';
            const mockSpawner = {
                spawn: (command, args, opts) => {
                    (0, assert_1.strictEqual)(opts.cwd, 'C:/foo');
                    done();
                    return { on: (evt) => evt };
                }
            };
            const testService = new externalTerminalService_1.$65b();
            testService.spawnTerminal(mockSpawner, mockConfig.terminal.external, testShell, testCwd);
        });
        test(`MacTerminalService - uses terminal from configuration`, done => {
            const testCwd = 'path/to/workspace';
            const mockSpawner = {
                spawn: (command, args, opts) => {
                    (0, assert_1.strictEqual)(args[1], mockConfig.terminal.external.osxExec);
                    done();
                    return {
                        on: (evt) => evt
                    };
                }
            };
            const testService = new externalTerminalService_1.$75b();
            testService.spawnTerminal(mockSpawner, mockConfig.terminal.external, testCwd);
        });
        test(`MacTerminalService - uses default terminal when configuration.terminal.external.osxExec is undefined`, done => {
            const testCwd = 'path/to/workspace';
            const mockSpawner = {
                spawn: (command, args, opts) => {
                    (0, assert_1.strictEqual)(args[1], externalTerminal_1.$kXb);
                    done();
                    return {
                        on: (evt) => evt
                    };
                }
            };
            const testService = new externalTerminalService_1.$75b();
            testService.spawnTerminal(mockSpawner, { osxExec: undefined }, testCwd);
        });
        test(`LinuxTerminalService - uses terminal from configuration`, done => {
            const testCwd = 'path/to/workspace';
            const mockSpawner = {
                spawn: (command, args, opts) => {
                    (0, assert_1.strictEqual)(command, mockConfig.terminal.external.linuxExec);
                    (0, assert_1.strictEqual)(opts.cwd, testCwd);
                    done();
                    return {
                        on: (evt) => evt
                    };
                }
            };
            const testService = new externalTerminalService_1.$85b();
            testService.spawnTerminal(mockSpawner, mockConfig.terminal.external, testCwd);
        });
        test(`LinuxTerminalService - uses default terminal when configuration.terminal.external.linuxExec is undefined`, done => {
            externalTerminalService_1.$85b.getDefaultTerminalLinuxReady().then(defaultTerminalLinux => {
                const testCwd = 'path/to/workspace';
                const mockSpawner = {
                    spawn: (command, args, opts) => {
                        (0, assert_1.strictEqual)(command, defaultTerminalLinux);
                        done();
                        return {
                            on: (evt) => evt
                        };
                    }
                };
                mockConfig.terminal.external.linuxExec = undefined;
                const testService = new externalTerminalService_1.$85b();
                testService.spawnTerminal(mockSpawner, mockConfig.terminal.external, testCwd);
            });
        });
    });
});
//# sourceMappingURL=externalTerminalService.test.js.map