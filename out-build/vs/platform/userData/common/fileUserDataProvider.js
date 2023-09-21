define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/files/common/files", "vs/base/common/stream", "vs/base/common/ternarySearchTree", "vs/base/common/buffer", "vs/base/common/types", "vs/base/common/map"], function (require, exports, event_1, lifecycle_1, files_1, stream_1, ternarySearchTree_1, buffer_1, types_1, map_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$n7b = void 0;
    /**
     * This is a wrapper on top of the local filesystem provider which will
     * 	- Convert the user data resources to file system scheme and vice-versa
     *  - Enforces atomic reads for user data
     */
    class $n7b extends lifecycle_1.$kc {
        get capabilities() { return this.g.capabilities & ~4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */; }
        constructor(f, g, h, j, uriIdentityService, m) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.onDidChangeCapabilities = this.g.onDidChangeCapabilities;
            this.a = this.B(new event_1.$fd());
            this.onDidChangeFile = this.a.event;
            this.b = ternarySearchTree_1.$Hh.forUris(() => !(this.capabilities & 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */));
            this.c = new map_1.$Ai((uri) => uriIdentityService.extUri.getComparisonKey(this.s(uri)));
            this.n();
            this.B(j.onDidChangeProfiles(() => this.n()));
            this.B(this.g.onDidChangeFile(e => this.r(e)));
        }
        n() {
            this.c.clear();
            for (const profile of this.j.profiles) {
                this.c.add(profile.settingsResource);
                this.c.add(profile.keybindingsResource);
                this.c.add(profile.tasksResource);
                this.c.add(profile.extensionsResource);
            }
        }
        watch(resource, opts) {
            this.b.set(resource, resource);
            const disposable = this.g.watch(this.s(resource), opts);
            return (0, lifecycle_1.$ic)(() => {
                this.b.delete(resource);
                disposable.dispose();
            });
        }
        stat(resource) {
            return this.g.stat(this.s(resource));
        }
        mkdir(resource) {
            return this.g.mkdir(this.s(resource));
        }
        rename(from, to, opts) {
            return this.g.rename(this.s(from), this.s(to), opts);
        }
        readFile(resource) {
            return this.g.readFile(this.s(resource), { atomic: true });
        }
        readFileStream(resource, opts, token) {
            const stream = (0, stream_1.$td)(data => buffer_1.$Fd.concat(data.map(data => buffer_1.$Fd.wrap(data))).buffer);
            (async () => {
                try {
                    const contents = await this.readFile(resource);
                    stream.end(contents);
                }
                catch (error) {
                    stream.error(error);
                    stream.end();
                }
            })();
            return stream;
        }
        readdir(resource) {
            return this.g.readdir(this.s(resource));
        }
        writeFile(resource, content, opts) {
            if (this.c.has(resource) && !(0, types_1.$lf)(opts.atomic) && (0, files_1.$bk)(this.g)) {
                opts = { ...opts, atomic: { postfix: '.vsctmp' } };
            }
            return this.g.writeFile(this.s(resource), content, opts);
        }
        delete(resource, opts) {
            return this.g.delete(this.s(resource), opts);
        }
        copy(from, to, opts) {
            if ((0, files_1.$9j)(this.g)) {
                return this.g.copy(this.s(from), this.s(to), opts);
            }
            throw new Error('copy not supported');
        }
        r(changes) {
            const userDataChanges = [];
            for (const change of changes) {
                if (change.resource.scheme !== this.f) {
                    continue; // only interested in file schemes
                }
                const userDataResource = this.t(change.resource);
                if (this.b.findSubstr(userDataResource)) {
                    userDataChanges.push({
                        resource: userDataResource,
                        type: change.type
                    });
                }
            }
            if (userDataChanges.length) {
                this.m.debug('User data changed');
                this.a.fire(userDataChanges);
            }
        }
        s(userDataResource) {
            return userDataResource.with({ scheme: this.f });
        }
        t(fileSystemResource) {
            return fileSystemResource.with({ scheme: this.h });
        }
    }
    exports.$n7b = $n7b;
});
//# sourceMappingURL=fileUserDataProvider.js.map