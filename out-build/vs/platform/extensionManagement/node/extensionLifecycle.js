/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "child_process", "vs/base/common/async", "vs/base/common/errorMessage", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/path", "vs/base/node/pfs", "vs/platform/log/common/log", "vs/platform/userDataProfile/common/userDataProfile"], function (require, exports, child_process_1, async_1, errorMessage_1, event_1, lifecycle_1, network_1, path_1, pfs_1, log_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$up = void 0;
    let $up = class $up extends lifecycle_1.$kc {
        constructor(b, f) {
            super();
            this.b = b;
            this.f = f;
            this.a = new async_1.$Mg(5); // Run max 5 processes in parallel
        }
        async postUninstall(extension) {
            const script = this.g(extension, 'uninstall');
            if (script) {
                this.f.info(extension.identifier.id, extension.manifest.version, `Running post uninstall script`);
                await this.a.queue(async () => {
                    try {
                        await this.h(script.script, 'uninstall', script.args, true, extension);
                        this.f.info(`Finished running post uninstall script`, extension.identifier.id, extension.manifest.version);
                    }
                    catch (error) {
                        this.f.error('Failed to run post uninstall script', extension.identifier.id, extension.manifest.version);
                        this.f.error(error);
                    }
                });
            }
            try {
                await pfs_1.Promises.rm(this.m(extension));
            }
            catch (error) {
                this.f.error('Error while removing extension storage path', extension.identifier.id);
                this.f.error(error);
            }
        }
        g(extension, type) {
            const scriptKey = `vscode:${type}`;
            if (extension.location.scheme === network_1.Schemas.file && extension.manifest && extension.manifest['scripts'] && typeof extension.manifest['scripts'][scriptKey] === 'string') {
                const script = extension.manifest['scripts'][scriptKey].split(' ');
                if (script.length < 2 || script[0] !== 'node' || !script[1]) {
                    this.f.warn(extension.identifier.id, extension.manifest.version, `${scriptKey} should be a node script`);
                    return null;
                }
                return { script: (0, path_1.$9d)(extension.location.fsPath, script[1]), args: script.slice(2) || [] };
            }
            return null;
        }
        h(lifecycleHook, lifecycleType, args, timeout, extension) {
            return new Promise((c, e) => {
                const extensionLifecycleProcess = this.j(lifecycleHook, lifecycleType, args, extension);
                let timeoutHandler;
                const onexit = (error) => {
                    if (timeoutHandler) {
                        clearTimeout(timeoutHandler);
                        timeoutHandler = null;
                    }
                    if (error) {
                        e(error);
                    }
                    else {
                        c(undefined);
                    }
                };
                // on error
                extensionLifecycleProcess.on('error', (err) => {
                    onexit((0, errorMessage_1.$mi)(err) || 'Unknown');
                });
                // on exit
                extensionLifecycleProcess.on('exit', (code, signal) => {
                    onexit(code ? `post-${lifecycleType} process exited with code ${code}` : undefined);
                });
                if (timeout) {
                    // timeout: kill process after waiting for 5s
                    timeoutHandler = setTimeout(() => {
                        timeoutHandler = null;
                        extensionLifecycleProcess.kill();
                        e('timed out');
                    }, 5000);
                }
            });
        }
        j(uninstallHook, lifecycleType, args, extension) {
            const opts = {
                silent: true,
                execArgv: undefined
            };
            const extensionUninstallProcess = (0, child_process_1.fork)(uninstallHook, [`--type=extension-post-${lifecycleType}`, ...args], opts);
            extensionUninstallProcess.stdout.setEncoding('utf8');
            extensionUninstallProcess.stderr.setEncoding('utf8');
            const onStdout = event_1.Event.fromNodeEventEmitter(extensionUninstallProcess.stdout, 'data');
            const onStderr = event_1.Event.fromNodeEventEmitter(extensionUninstallProcess.stderr, 'data');
            // Log output
            onStdout(data => this.f.info(extension.identifier.id, extension.manifest.version, `post-${lifecycleType}`, data));
            onStderr(data => this.f.error(extension.identifier.id, extension.manifest.version, `post-${lifecycleType}`, data));
            const onOutput = event_1.Event.any(event_1.Event.map(onStdout, o => ({ data: `%c${o}`, format: [''] })), event_1.Event.map(onStderr, o => ({ data: `%c${o}`, format: ['color: red'] })));
            // Debounce all output, so we can render it in the Chrome console as a group
            const onDebouncedOutput = event_1.Event.debounce(onOutput, (r, o) => {
                return r
                    ? { data: r.data + o.data, format: [...r.format, ...o.format] }
                    : { data: o.data, format: o.format };
            }, 100);
            // Print out output
            onDebouncedOutput(data => {
                console.group(extension.identifier.id);
                console.log(data.data, ...data.format);
                console.groupEnd();
            });
            return extensionUninstallProcess;
        }
        m(extension) {
            return (0, path_1.$9d)(this.b.defaultProfile.globalStorageHome.fsPath, extension.identifier.id.toLowerCase());
        }
    };
    exports.$up = $up;
    exports.$up = $up = __decorate([
        __param(0, userDataProfile_1.$Ek),
        __param(1, log_1.$5i)
    ], $up);
});
//# sourceMappingURL=extensionLifecycle.js.map