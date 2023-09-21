/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "child_process", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/console", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/node/processes", "vs/base/common/processes", "vs/base/parts/ipc/common/ipc"], function (require, exports, child_process_1, async_1, buffer_1, cancellation_1, console_1, errors, event_1, lifecycle_1, objects_1, processes_1, processes_2, ipc_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Client = exports.Server = void 0;
    /**
     * This implementation doesn't perform well since it uses base64 encoding for buffers.
     * We should move all implementations to use named ipc.net, so we stop depending on cp.fork.
     */
    class Server extends ipc_1.ChannelServer {
        constructor(ctx) {
            super({
                send: r => {
                    try {
                        process.send?.(r.buffer.toString('base64'));
                    }
                    catch (e) { /* not much to do */ }
                },
                onMessage: event_1.Event.fromNodeEventEmitter(process, 'message', msg => buffer_1.VSBuffer.wrap(Buffer.from(msg, 'base64')))
            }, ctx);
            process.once('disconnect', () => this.dispose());
        }
    }
    exports.Server = Server;
    class Client {
        constructor(modulePath, options) {
            this.modulePath = modulePath;
            this.options = options;
            this.activeRequests = new Set();
            this.channels = new Map();
            this._onDidProcessExit = new event_1.Emitter();
            this.onDidProcessExit = this._onDidProcessExit.event;
            const timeout = options && options.timeout ? options.timeout : 60000;
            this.disposeDelayer = new async_1.Delayer(timeout);
            this.child = null;
            this._client = null;
        }
        getChannel(channelName) {
            const that = this;
            return {
                call(command, arg, cancellationToken) {
                    return that.requestPromise(channelName, command, arg, cancellationToken);
                },
                listen(event, arg) {
                    return that.requestEvent(channelName, event, arg);
                }
            };
        }
        requestPromise(channelName, name, arg, cancellationToken = cancellation_1.CancellationToken.None) {
            if (!this.disposeDelayer) {
                return Promise.reject(new Error('disposed'));
            }
            if (cancellationToken.isCancellationRequested) {
                return Promise.reject(errors.canceled());
            }
            this.disposeDelayer.cancel();
            const channel = this.getCachedChannel(channelName);
            const result = (0, async_1.createCancelablePromise)(token => channel.call(name, arg, token));
            const cancellationTokenListener = cancellationToken.onCancellationRequested(() => result.cancel());
            const disposable = (0, lifecycle_1.toDisposable)(() => result.cancel());
            this.activeRequests.add(disposable);
            result.finally(() => {
                cancellationTokenListener.dispose();
                this.activeRequests.delete(disposable);
                if (this.activeRequests.size === 0 && this.disposeDelayer) {
                    this.disposeDelayer.trigger(() => this.disposeClient());
                }
            });
            return result;
        }
        requestEvent(channelName, name, arg) {
            if (!this.disposeDelayer) {
                return event_1.Event.None;
            }
            this.disposeDelayer.cancel();
            let listener;
            const emitter = new event_1.Emitter({
                onWillAddFirstListener: () => {
                    const channel = this.getCachedChannel(channelName);
                    const event = channel.listen(name, arg);
                    listener = event(emitter.fire, emitter);
                    this.activeRequests.add(listener);
                },
                onDidRemoveLastListener: () => {
                    this.activeRequests.delete(listener);
                    listener.dispose();
                    if (this.activeRequests.size === 0 && this.disposeDelayer) {
                        this.disposeDelayer.trigger(() => this.disposeClient());
                    }
                }
            });
            return emitter.event;
        }
        get client() {
            if (!this._client) {
                const args = this.options && this.options.args ? this.options.args : [];
                const forkOpts = Object.create(null);
                forkOpts.env = { ...(0, objects_1.deepClone)(process.env), 'VSCODE_PARENT_PID': String(process.pid) };
                if (this.options && this.options.env) {
                    forkOpts.env = { ...forkOpts.env, ...this.options.env };
                }
                if (this.options && this.options.freshExecArgv) {
                    forkOpts.execArgv = [];
                }
                if (this.options && typeof this.options.debug === 'number') {
                    forkOpts.execArgv = ['--nolazy', '--inspect=' + this.options.debug];
                }
                if (this.options && typeof this.options.debugBrk === 'number') {
                    forkOpts.execArgv = ['--nolazy', '--inspect-brk=' + this.options.debugBrk];
                }
                if (forkOpts.execArgv === undefined) {
                    forkOpts.execArgv = process.execArgv // if not set, the forked process inherits the execArgv of the parent process
                        .filter(a => !/^--inspect(-brk)?=/.test(a)) // --inspect and --inspect-brk can not be inherited as the port would conflict
                        .filter(a => !a.startsWith('--vscode-')); // --vscode-* arguments are unsupported by node.js and thus need to remove
                }
                (0, processes_2.removeDangerousEnvVariables)(forkOpts.env);
                this.child = (0, child_process_1.fork)(this.modulePath, args, forkOpts);
                const onMessageEmitter = new event_1.Emitter();
                const onRawMessage = event_1.Event.fromNodeEventEmitter(this.child, 'message', msg => msg);
                onRawMessage(msg => {
                    // Handle remote console logs specially
                    if ((0, console_1.isRemoteConsoleLog)(msg)) {
                        (0, console_1.log)(msg, `IPC Library: ${this.options.serverName}`);
                        return;
                    }
                    // Anything else goes to the outside
                    onMessageEmitter.fire(buffer_1.VSBuffer.wrap(Buffer.from(msg, 'base64')));
                });
                const sender = this.options.useQueue ? (0, processes_1.createQueuedSender)(this.child) : this.child;
                const send = (r) => this.child && this.child.connected && sender.send(r.buffer.toString('base64'));
                const onMessage = onMessageEmitter.event;
                const protocol = { send, onMessage };
                this._client = new ipc_1.ChannelClient(protocol);
                const onExit = () => this.disposeClient();
                process.once('exit', onExit);
                this.child.on('error', err => console.warn('IPC "' + this.options.serverName + '" errored with ' + err));
                this.child.on('exit', (code, signal) => {
                    process.removeListener('exit', onExit); // https://github.com/electron/electron/issues/21475
                    this.activeRequests.forEach(r => (0, lifecycle_1.dispose)(r));
                    this.activeRequests.clear();
                    if (code !== 0 && signal !== 'SIGTERM') {
                        console.warn('IPC "' + this.options.serverName + '" crashed with exit code ' + code + ' and signal ' + signal);
                    }
                    this.disposeDelayer?.cancel();
                    this.disposeClient();
                    this._onDidProcessExit.fire({ code, signal });
                });
            }
            return this._client;
        }
        getCachedChannel(name) {
            let channel = this.channels.get(name);
            if (!channel) {
                channel = this.client.getChannel(name);
                this.channels.set(name, channel);
            }
            return channel;
        }
        disposeClient() {
            if (this._client) {
                if (this.child) {
                    this.child.kill();
                    this.child = null;
                }
                this._client = null;
                this.channels.clear();
            }
        }
        dispose() {
            this._onDidProcessExit.dispose();
            this.disposeDelayer?.cancel();
            this.disposeDelayer = undefined;
            this.disposeClient();
            this.activeRequests.clear();
        }
    }
    exports.Client = Client;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXBjLmNwLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9wYXJ0cy9pcGMvbm9kZS9pcGMuY3AudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZWhHOzs7T0FHRztJQUVILE1BQWEsTUFBZ0MsU0FBUSxtQkFBbUI7UUFDdkUsWUFBWSxHQUFhO1lBQ3hCLEtBQUssQ0FBQztnQkFDTCxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUU7b0JBQ1QsSUFBSTt3QkFDSCxPQUFPLENBQUMsSUFBSSxFQUFFLENBQVUsQ0FBQyxDQUFDLE1BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztxQkFDdEQ7b0JBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxvQkFBb0IsRUFBRTtnQkFDckMsQ0FBQztnQkFDRCxTQUFTLEVBQUUsYUFBSyxDQUFDLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxpQkFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO2FBQzNHLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFFUixPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUNsRCxDQUFDO0tBQ0Q7SUFiRCx3QkFhQztJQStDRCxNQUFhLE1BQU07UUFXbEIsWUFBb0IsVUFBa0IsRUFBVSxPQUFvQjtZQUFoRCxlQUFVLEdBQVYsVUFBVSxDQUFRO1lBQVUsWUFBTyxHQUFQLE9BQU8sQ0FBYTtZQVI1RCxtQkFBYyxHQUFHLElBQUksR0FBRyxFQUFlLENBQUM7WUFHeEMsYUFBUSxHQUFHLElBQUksR0FBRyxFQUFvQixDQUFDO1lBRTlCLHNCQUFpQixHQUFHLElBQUksZUFBTyxF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