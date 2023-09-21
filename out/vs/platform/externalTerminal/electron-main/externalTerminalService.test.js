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
            const testService = new externalTerminalService_1.WindowsExternalTerminalService();
            testService.spawnTerminal(mockSpawner, mockConfig.terminal.external, testShell, testCwd);
        });
        test(`WinTerminalService - uses default terminal when configuration.terminal.external.windowsExec is undefined`, done => {
            const testShell = 'cmd';
            const testCwd = 'path/to/workspace';
            const mockSpawner = {
                spawn: (command, args, opts) => {
                    (0, assert_1.strictEqual)(args[args.length - 1], externalTerminalService_1.WindowsExternalTerminalService.getDefaultTerminalWindows());
                    done();
                    return {
                        on: (evt) => evt
                    };
                }
            };
            mockConfig.terminal.external.windowsExec = undefined;
            const testService = new externalTerminalService_1.WindowsExternalTerminalService();
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
            const testService = new externalTerminalService_1.WindowsExternalTerminalService();
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
            const testService = new externalTerminalService_1.WindowsExternalTerminalService();
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
            const testService = new externalTerminalService_1.WindowsExternalTerminalService();
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
            const testService = new externalTerminalService_1.MacExternalTerminalService();
            testService.spawnTerminal(mockSpawner, mockConfig.terminal.external, testCwd);
        });
        test(`MacTerminalService - uses default terminal when configuration.terminal.external.osxExec is undefined`, done => {
            const testCwd = 'path/to/workspace';
            const mockSpawner = {
                spawn: (command, args, opts) => {
                    (0, assert_1.strictEqual)(args[1], externalTerminal_1.DEFAULT_TERMINAL_OSX);
                    done();
                    return {
                        on: (evt) => evt
                    };
                }
            };
            const testService = new externalTerminalService_1.MacExternalTerminalService();
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
            const testService = new externalTerminalService_1.LinuxExternalTerminalService();
            testService.spawnTerminal(mockSpawner, mockConfig.terminal.external, testCwd);
        });
        test(`LinuxTerminalService - uses default terminal when configuration.terminal.external.linuxExec is undefined`, done => {
            externalTerminalService_1.LinuxExternalTerminalService.getDefaultTerminalLinuxReady().then(defaultTerminalLinux => {
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
                const testService = new externalTerminalService_1.LinuxExternalTerminalService();
                testService.spawnTerminal(mockSpawner, mockConfig.terminal.external, testCwd);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZXJuYWxUZXJtaW5hbFNlcnZpY2UudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2V4dGVybmFsVGVybWluYWwvZWxlY3Ryb24tbWFpbi9leHRlcm5hbFRlcm1pbmFsU2VydmljZS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBTWhHLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQWlDO1FBQ2hFLFFBQVEsRUFBRTtZQUNULFlBQVksRUFBRSxVQUFVO1lBQ3hCLFFBQVEsRUFBRTtnQkFDVCxXQUFXLEVBQUUsa0JBQWtCO2dCQUMvQixPQUFPLEVBQUUsY0FBYztnQkFDdkIsU0FBUyxFQUFFLGdCQUFnQjthQUMzQjtTQUNEO0tBQ0QsQ0FBQyxDQUFDO0lBRUgsS0FBSyxDQUFDLHlCQUF5QixFQUFFLEdBQUcsRUFBRTtRQUNyQyxJQUFJLENBQUMsdURBQXVELEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDcEUsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBQ3hCLE1BQU0sT0FBTyxHQUFHLG1CQUFtQixDQUFDO1lBQ3BDLE1BQU0sV0FBVyxHQUFRO2dCQUN4QixLQUFLLEVBQUUsQ0FBQyxPQUFZLEVBQUUsSUFBUyxFQUFFLElBQVMsRUFBRSxFQUFFO29CQUM3QyxJQUFBLG9CQUFXLEVBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSw2QkFBNkIsQ0FBQyxDQUFDO29CQUMvRCxJQUFBLG9CQUFXLEVBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7b0JBQzdFLElBQUEsb0JBQVcsRUFBQyxJQUFJLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO29CQUMvQixJQUFJLEVBQUUsQ0FBQztvQkFDUCxP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