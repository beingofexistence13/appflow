/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/platform/files/node/diskFileSystemProvider", "vs/base/common/lifecycle", "vs/base/common/buffer", "vs/base/common/stream", "vs/base/common/cancellation"], function (require, exports, event_1, diskFileSystemProvider_1, lifecycle_1, buffer_1, stream_1, cancellation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$zr = exports.$yr = void 0;
    /**
     * A server implementation for a IPC based file system provider client.
     */
    class $yr extends lifecycle_1.$kc {
        constructor(a, b) {
            super();
            this.a = a;
            this.b = b;
            //#endregion
            //#region File Watching
            this.F = new Map();
            this.G = new Map();
        }
        call(ctx, command, arg) {
            const uriTransformer = this.c(ctx);
            switch (command) {
                case 'stat': return this.g(uriTransformer, arg[0]);
                case 'readdir': return this.h(uriTransformer, arg[0]);
                case 'open': return this.r(uriTransformer, arg[0], arg[1]);
                case 'close': return this.s(arg[0]);
                case 'read': return this.t(arg[0], arg[1], arg[2]);
                case 'readFile': return this.j(uriTransformer, arg[0], arg[1]);
                case 'write': return this.u(arg[0], arg[1], arg[2], arg[3], arg[4]);
                case 'writeFile': return this.n(uriTransformer, arg[0], arg[1], arg[2]);
                case 'rename': return this.z(uriTransformer, arg[0], arg[1], arg[2]);
                case 'copy': return this.C(uriTransformer, arg[0], arg[1], arg[2]);
                case 'cloneFile': return this.D(uriTransformer, arg[0], arg[1]);
                case 'mkdir': return this.w(uriTransformer, arg[0]);
                case 'delete': return this.y(uriTransformer, arg[0], arg[1]);
                case 'watch': return this.I(uriTransformer, arg[0], arg[1], arg[2], arg[3]);
                case 'unwatch': return this.J(arg[0], arg[1]);
            }
            throw new Error(`IPC Command ${command} not found`);
        }
        listen(ctx, event, arg) {
            const uriTransformer = this.c(ctx);
            switch (event) {
                case 'fileChange': return this.H(uriTransformer, arg[0]);
                case 'readFileStream': return this.m(uriTransformer, arg[0], arg[1]);
            }
            throw new Error(`Unknown event ${event}`);
        }
        //#region File Metadata Resolving
        g(uriTransformer, _resource) {
            const resource = this.f(uriTransformer, _resource, true);
            return this.a.stat(resource);
        }
        h(uriTransformer, _resource) {
            const resource = this.f(uriTransformer, _resource);
            return this.a.readdir(resource);
        }
        //#endregion
        //#region File Reading/Writing
        async j(uriTransformer, _resource, opts) {
            const resource = this.f(uriTransformer, _resource, true);
            const buffer = await this.a.readFile(resource, opts);
            return buffer_1.$Fd.wrap(buffer);
        }
        m(uriTransformer, _resource, opts) {
            const resource = this.f(uriTransformer, _resource, true);
            const cts = new cancellation_1.$pd();
            const emitter = new event_1.$fd({
                onDidRemoveLastListener: () => {
                    // Ensure to cancel the read operation when there is no more
                    // listener on the other side to prevent unneeded work.
                    cts.cancel();
                }
            });
            const fileStream = this.a.readFileStream(resource, opts, cts.token);
            (0, stream_1.$xd)(fileStream, {
                onData: chunk => emitter.fire(buffer_1.$Fd.wrap(chunk)),
                onError: error => emitter.fire(error),
                onEnd: () => {
                    // Forward event
                    emitter.fire('end');
                    // Cleanup
                    emitter.dispose();
                    cts.dispose();
                }
            });
            return emitter.event;
        }
        n(uriTransformer, _resource, content, opts) {
            const resource = this.f(uriTransformer, _resource);
            return this.a.writeFile(resource, content.buffer, opts);
        }
        r(uriTransformer, _resource, opts) {
            const resource = this.f(uriTransformer, _resource, true);
            return this.a.open(resource, opts);
        }
        s(fd) {
            return this.a.close(fd);
        }
        async t(fd, pos, length) {
            const buffer = buffer_1.$Fd.alloc(length);
            const bufferOffset = 0; // offset is 0 because we create a buffer to read into for each call
            const bytesRead = await this.a.read(fd, pos, buffer.buffer, bufferOffset, length);
            return [buffer, bytesRead];
        }
        u(fd, pos, data, offset, length) {
            return this.a.write(fd, pos, data.buffer, offset, length);
        }
        //#endregion
        //#region Move/Copy/Delete/Create Folder
        w(uriTransformer, _resource) {
            const resource = this.f(uriTransformer, _resource);
            return this.a.mkdir(resource);
        }
        y(uriTransformer, _resource, opts) {
            const resource = this.f(uriTransformer, _resource);
            return this.a.delete(resource, opts);
        }
        z(uriTransformer, _source, _target, opts) {
            const source = this.f(uriTransformer, _source);
            const target = this.f(uriTransformer, _target);
            return this.a.rename(source, target, opts);
        }
        C(uriTransformer, _source, _target, opts) {
            const source = this.f(uriTransformer, _source);
            const target = this.f(uriTransformer, _target);
            return this.a.copy(source, target, opts);
        }
        //#endregion
        //#region Clone File
        D(uriTransformer, _source, _target) {
            const source = this.f(uriTransformer, _source);
            const target = this.f(uriTransformer, _target);
            return this.a.cloneFile(source, target);
        }
        H(uriTransformer, sessionId) {
            // We want a specific emitter for the given session so that events
            // from the one session do not end up on the other session. As such
            // we create a `SessionFileWatcher` and a `Emitter` for that session.
            const emitter = new event_1.$fd({
                onWillAddFirstListener: () => {
                    this.F.set(sessionId, this.L(uriTransformer, emitter));
                },
                onDidRemoveLastListener: () => {
                    (0, lifecycle_1.$fc)(this.F.get(sessionId));
                    this.F.delete(sessionId);
                }
            });
            return emitter.event;
        }
        async I(uriTransformer, sessionId, req, _resource, opts) {
            const watcher = this.F.get(sessionId);
            if (watcher) {
                const resource = this.f(uriTransformer, _resource);
                const disposable = watcher.watch(req, resource, opts);
                this.G.set(sessionId + req, disposable);
            }
        }
        async J(sessionId, req) {
            const id = sessionId + req;
            const disposable = this.G.get(id);
            if (disposable) {
                (0, lifecycle_1.$fc)(disposable);
                this.G.delete(id);
            }
        }
        //#endregion
        dispose() {
            super.dispose();
            for (const [, disposable] of this.G) {
                disposable.dispose();
            }
            this.G.clear();
            for (const [, disposable] of this.F) {
                disposable.dispose();
            }
            this.F.clear();
        }
    }
    exports.$yr = $yr;
    class $zr extends lifecycle_1.$kc {
        constructor(c, sessionEmitter, f, g) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.a = new Map();
            // To ensure we use one file watcher per session, we keep a
            // disk file system provider instantiated for this session.
            // The provider is cheap and only stateful when file watching
            // starts.
            //
            // This is important because we want to ensure that we only
            // forward events from the watched paths for this session and
            // not other clients that asked to watch other paths.
            this.b = this.B(new diskFileSystemProvider_1.$3p(this.f, { watcher: { recursive: this.j(this.g) } }));
            this.h(sessionEmitter);
        }
        h(sessionEmitter) {
            const localChangeEmitter = this.B(new event_1.$fd());
            this.B(localChangeEmitter.event((events) => {
                sessionEmitter.fire(events.map(e => ({
                    resource: this.c.transformOutgoingURI(e.resource),
                    type: e.type
                })));
            }));
            this.B(this.b.onDidChangeFile(events => localChangeEmitter.fire(events)));
            this.B(this.b.onDidWatchError(error => sessionEmitter.fire(error)));
        }
        j(environmentService) {
            return undefined; // subclasses can override
        }
        m(environmentService) {
            return undefined; // subclasses can override
        }
        watch(req, resource, opts) {
            const extraExcludes = this.m(this.g);
            if (Array.isArray(extraExcludes)) {
                opts.excludes = [...opts.excludes, ...extraExcludes];
            }
            this.a.set(req, this.b.watch(resource, opts));
            return (0, lifecycle_1.$ic)(() => {
                (0, lifecycle_1.$fc)(this.a.get(req));
                this.a.delete(req);
            });
        }
        dispose() {
            for (const [, disposable] of this.a) {
                disposable.dispose();
            }
            this.a.clear();
            super.dispose();
        }
    }
    exports.$zr = $zr;
});
//# sourceMappingURL=diskFileSystemProviderServer.js.map