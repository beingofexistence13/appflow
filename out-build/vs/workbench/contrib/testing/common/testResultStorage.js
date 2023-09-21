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
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/lifecycle", "vs/base/common/types", "vs/base/common/uri", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/testing/common/storedValue", "vs/workbench/contrib/testing/common/testResult"], function (require, exports, buffer_1, lifecycle_1, types_1, uri_1, environment_1, files_1, instantiation_1, log_1, storage_1, workspace_1, storedValue_1, testResult_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$etb = exports.$dtb = exports.$ctb = exports.$btb = exports.$atb = void 0;
    exports.$atb = 128;
    const RETAIN_MIN_RESULTS = 16;
    const RETAIN_MAX_BYTES = 1024 * 128;
    const CLEANUP_PROBABILITY = 0.2;
    exports.$btb = (0, instantiation_1.$Bh)('ITestResultStorage');
    /**
     * Data revision this version of VS Code deals with. Should be bumped whenever
     * a breaking change is made to the stored results, which will cause previous
     * revisions to be discarded.
     */
    const currentRevision = 1;
    let $ctb = class $ctb extends lifecycle_1.$kc {
        constructor(b, c) {
            super();
            this.b = b;
            this.c = c;
            this.a = this.B(new storedValue_1.$Gsb({
                key: 'storedTestResults',
                scope: 1 /* StorageScope.WORKSPACE */,
                target: 1 /* StorageTarget.MACHINE */
            }, this.b));
        }
        /**
         * @override
         */
        async read() {
            const results = await Promise.all(this.a.get([]).map(async ({ id, rev }) => {
                if (rev !== currentRevision) {
                    return undefined;
                }
                try {
                    const contents = await this.f(id);
                    if (!contents) {
                        return undefined;
                    }
                    return new testResult_1.$3sb(contents);
                }
                catch (e) {
                    this.c.warn(`Error deserializing stored test result ${id}`, e);
                    return undefined;
                }
            }));
            return results.filter(types_1.$rf);
        }
        /**
         * @override
         */
        getResultOutputWriter(resultId) {
            const stream = (0, buffer_1.$Vd)();
            this.n(resultId, stream);
            return stream;
        }
        /**
         * @override
         */
        async persist(results) {
            const toDelete = new Map(this.a.get([]).map(({ id, bytes }) => [id, bytes]));
            const toStore = [];
            const todo = [];
            let budget = RETAIN_MAX_BYTES;
            // Run until either:
            // 1. We store all results
            // 2. We store the max results
            // 3. We store the min results, and have no more byte budget
            for (let i = 0; i < results.length && i < exports.$atb && (budget > 0 || toStore.length < RETAIN_MIN_RESULTS); i++) {
                const result = results[i];
                const existingBytes = toDelete.get(result.id);
                if (existingBytes !== undefined) {
                    toDelete.delete(result.id);
                    toStore.push({ id: result.id, rev: currentRevision, bytes: existingBytes });
                    budget -= existingBytes;
                    continue;
                }
                const obj = result.toJSON();
                if (!obj) {
                    continue;
                }
                const contents = buffer_1.$Fd.fromString(JSON.stringify(obj));
                todo.push(this.m(result.id, obj));
                toStore.push({ id: result.id, rev: currentRevision, bytes: contents.byteLength });
                budget -= contents.byteLength;
            }
            for (const id of toDelete.keys()) {
                todo.push(this.j(id).catch(() => undefined));
            }
            this.a.store(toStore);
            await Promise.all(todo);
        }
    };
    exports.$ctb = $ctb;
    exports.$ctb = $ctb = __decorate([
        __param(0, storage_1.$Vo),
        __param(1, log_1.$5i)
    ], $ctb);
    class $dtb extends $ctb {
        constructor() {
            super(...arguments);
            this.cache = new Map();
        }
        async f(id) {
            return Promise.resolve(this.cache.get(id));
        }
        m(id, contents) {
            this.cache.set(id, contents);
            return Promise.resolve();
        }
        j(id) {
            this.cache.delete(id);
            return Promise.resolve();
        }
        g(id) {
            throw new Error('Method not implemented.');
        }
        n(id, input) {
            throw new Error('Method not implemented.');
        }
        h(id, offset, length) {
            throw new Error('Method not implemented.');
        }
    }
    exports.$dtb = $dtb;
    let $etb = class $etb extends $ctb {
        constructor(storageService, logService, workspaceContext, t, environmentService) {
            super(storageService, logService);
            this.t = t;
            this.r = uri_1.URI.joinPath(environmentService.workspaceStorageHome, workspaceContext.getWorkspace().id, 'testResults');
        }
        async f(id) {
            const contents = await this.t.readFile(this.G(id));
            return JSON.parse(contents.value.toString());
        }
        m(id, contents) {
            return this.t.writeFile(this.G(id), buffer_1.$Fd.fromString(JSON.stringify(contents)));
        }
        j(id) {
            return this.t.del(this.G(id)).catch(() => undefined);
        }
        async h(id, offset, length) {
            try {
                const { value } = await this.t.readFile(this.H(id), { position: offset, length });
                return value;
            }
            catch {
                return buffer_1.$Fd.alloc(0);
            }
        }
        async g(id) {
            try {
                const { value } = await this.t.readFileStream(this.H(id));
                return value;
            }
            catch {
                return (0, buffer_1.$Td)(buffer_1.$Fd.alloc(0));
            }
        }
        async n(id, input) {
            await this.t.createFile(this.H(id), input);
        }
        /**
         * @inheritdoc
         */
        async persist(results) {
            await super.persist(results);
            if (Math.random() < CLEANUP_PROBABILITY) {
                await this.F();
            }
        }
        /**
         * Cleans up orphaned files. For instance, output can get orphaned if it's
         * written but the editor is closed before the test run is complete.
         */
        async F() {
            const { children } = await this.t.resolve(this.r);
            if (!children) {
                return;
            }
            const stored = new Set(this.a.get([]).filter(s => s.rev === currentRevision).map(s => s.id));
            await Promise.all(children
                .filter(child => !stored.has(child.name.replace(/\.[a-z]+$/, '')))
                .map(child => this.t.del(child.resource).catch(() => undefined)));
        }
        G(id) {
            return uri_1.URI.joinPath(this.r, `${id}.json`);
        }
        H(id) {
            return uri_1.URI.joinPath(this.r, `${id}.output`);
        }
    };
    exports.$etb = $etb;
    exports.$etb = $etb = __decorate([
        __param(0, storage_1.$Vo),
        __param(1, log_1.$5i),
        __param(2, workspace_1.$Kh),
        __param(3, files_1.$6j),
        __param(4, environment_1.$Ih)
    ], $etb);
});
//# sourceMappingURL=testResultStorage.js.map