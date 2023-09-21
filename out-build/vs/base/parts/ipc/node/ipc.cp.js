/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "child_process", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/console", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/node/processes", "vs/base/common/processes", "vs/base/parts/ipc/common/ipc"], function (require, exports, child_process_1, async_1, buffer_1, cancellation_1, console_1, errors, event_1, lifecycle_1, objects_1, processes_1, processes_2, ipc_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Sp = exports.$Rp = void 0;
    /**
     * This implementation doesn't perform well since it uses base64 encoding for buffers.
     * We should move all implementations to use named ipc.net, so we stop depending on cp.fork.
     */
    class $Rp extends ipc_1.$dh {
        constructor(ctx) {
            super({
                send: r => {
                    try {
                        process.send?.(r.buffer.toString('base64'));
                    }
                    catch (e) { /* not much to do */ }
                },
                onMessage: event_1.Event.fromNodeEventEmitter(process, 'message', msg => buffer_1.$Fd.wrap(Buffer.from(msg, 'base64')))
            }, ctx);
            process.once('disconnect', () => this.dispose());
        }
    }
    exports.$Rp = $Rp;
    class $Sp {
        constructor(i, j) {
            this.i = i;
            this.j = j;
            this.c = new Set();
            this.g = new Map();
            this.h = new event_1.$fd();
            this.onDidProcessExit = this.h.event;
            const timeout = j && j.timeout ? j.timeout : 60000;
            this.b = new async_1.$Dg(timeout);
            this.d = null;
            this.f = null;
        }
        getChannel(channelName) {
            const that = this;
            return {
                call(command, arg, cancellationToken) {
                    return that.k(channelName, command, arg, cancellationToken);
                },
                listen(event, arg) {
                    return that.l(channelName, event, arg);
                }
            };
        }
        k(channelName, name, arg, cancellationToken = cancellation_1.CancellationToken.None) {
            if (!this.b) {
                return Promise.reject(new Error('disposed'));
            }
            if (cancellationToken.isCancellationRequested) {
                return Promise.reject(errors.$4());
            }
            this.b.cancel();
            const channel = this.n(channelName);
            const result = (0, async_1.$ug)(token => channel.call(name, arg, token));
            const cancellationTokenListener = cancellationToken.onCancellationRequested(() => result.cancel());
            const disposable = (0, lifecycle_1.$ic)(() => result.cancel());
            this.c.add(disposable);
            result.finally(() => {
                cancellationTokenListener.dispose();
                this.c.delete(disposable);
                if (this.c.size === 0 && this.b) {
                    this.b.trigger(() => this.o());
                }
            });
            return result;
        }
        l(channelName, name, arg) {
            if (!this.b) {
                return event_1.Event.None;
            }
            this.b.cancel();
            let listener;
            const emitter = new event_1.$fd({
                onWillAddFirstListener: () => {
                    const channel = this.n(channelName);
                    const event = channel.listen(name, arg);
                    listener = event(emitter.fire, emitter);
                    this.c.add(listener);
                },
                onDidRemoveLastListener: () => {
                    this.c.delete(listener);
                    listener.dispose();
                    if (this.c.size === 0 && this.b) {
                        this.b.trigger(() => this.o());
                    }
                }
            });
            return emitter.event;
        }
        get m() {
            if (!this.f) {
                const args = this.j && this.j.args ? this.j.args : [];
                const forkOpts = Object.create(null);
                forkOpts.env = { ...(0, objects_1.$Vm)(process.env), 'VSCODE_PARENT_PID': String(process.pid) };
                if (this.j && this.j.env) {
                    forkOpts.env = { ...forkOpts.env, ...this.j.env };
                }
                if (this.j && this.j.freshExecArgv) {
                    forkOpts.execArgv = [];
                }
                if (this.j && typeof this.j.debug === 'number') {
                    forkOpts.execArgv = ['--nolazy', '--inspect=' + this.j.debug];
                }
                if (this.j && typeof this.j.debugBrk === 'number') {
                    forkOpts.execArgv = ['--nolazy', '--inspect-brk=' + this.j.debugBrk];
                }
                if (forkOpts.execArgv === undefined) {
                    forkOpts.execArgv = process.execArgv // if not set, the forked process inherits the execArgv of the parent process
                        .filter(a => !/^--inspect(-brk)?=/.test(a)) // --inspect and --inspect-brk can not be inherited as the port would conflict
                        .filter(a => !a.startsWith('--vscode-')); // --vscode-* arguments are unsupported by node.js and thus need to remove
                }
                (0, processes_2.$tl)(forkOpts.env);
                this.d = (0, child_process_1.fork)(this.i, args, forkOpts);
                const onMessageEmitter = new event_1.$fd();
                const onRawMessage = event_1.Event.fromNodeEventEmitter(this.d, 'message', msg => msg);
                onRawMessage(msg => {
                    // Handle remote console logs specially
                    if ((0, console_1.$Np)(msg)) {
                        (0, console_1.log)(msg, `IPC Library: ${this.j.serverName}`);
                        return;
                    }
                    // Anything else goes to the outside
                    onMessageEmitter.fire(buffer_1.$Fd.wrap(Buffer.from(msg, 'base64')));
                });
                const sender = this.j.useQueue ? (0, processes_1.$vl)(this.d) : this.d;
                const send = (r) => this.d && this.d.connected && sender.send(r.buffer.toString('base64'));
                const onMessage = onMessageEmitter.event;
                const protocol = { send, onMessage };
                this.f = new ipc_1.$eh(protocol);
                const onExit = () => this.o();
                process.once('exit', onExit);
                this.d.on('error', err => console.warn('IPC "' + this.j.serverName + '" errored with ' + err));
                this.d.on('exit', (code, signal) => {
                    process.removeListener('exit', onExit); // https://github.com/electron/electron/issues/21475
                    this.c.forEach(r => (0, lifecycle_1.$fc)(r));
                    this.c.clear();
                    if (code !== 0 && signal !== 'SIGTERM') {
                        console.warn('IPC "' + this.j.serverName + '" crashed with exit code ' + code + ' and signal ' + signal);
                    }
                    this.b?.cancel();
                    this.o();
                    this.h.fire({ code, signal });
                });
            }
            return this.f;
        }
        n(name) {
            let channel = this.g.get(name);
            if (!channel) {
                channel = this.m.getChannel(name);
                this.g.set(name, channel);
            }
            return channel;
        }
        o() {
            if (this.f) {
                if (this.d) {
                    this.d.kill();
                    this.d = null;
                }
                this.f = null;
                this.g.clear();
            }
        }
        dispose() {
            this.h.dispose();
            this.b?.cancel();
            this.b = undefined;
            this.o();
            this.c.clear();
        }
    }
    exports.$Sp = $Sp;
});
//# sourceMappingURL=ipc.cp.js.map