/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$y$b = void 0;
    class $y$b {
        constructor(c = () => lifecycle_1.$kc.None) {
            this.c = c;
            this.capabilities = 2048 /* FileSystemProviderCapabilities.Readonly */;
            this.a = new event_1.$fd();
            this.onDidChangeCapabilities = this.a.event;
            this.b = new event_1.$fd();
            this.onDidChangeFile = this.b.event;
        }
        emitFileChangeEvents(changes) {
            this.b.fire(changes);
        }
        setCapabilities(capabilities) {
            this.capabilities = capabilities;
            this.a.fire();
        }
        watch(resource, opts) { return this.c(); }
        async stat(resource) { return undefined; }
        async mkdir(resource) { return undefined; }
        async readdir(resource) { return undefined; }
        async delete(resource, opts) { return undefined; }
        async rename(from, to, opts) { return undefined; }
        async copy(from, to, opts) { return undefined; }
        async readFile(resource) { return undefined; }
        async writeFile(resource, content, opts) { return undefined; }
        async open(resource, opts) { return undefined; }
        async close(fd) { return undefined; }
        async read(fd, pos, data, offset, length) { return undefined; }
        async write(fd, pos, data, offset, length) { return undefined; }
    }
    exports.$y$b = $y$b;
});
//# sourceMappingURL=nullFileSystemProvider.js.map