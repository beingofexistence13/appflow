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
    exports.TestResultStorage = exports.InMemoryResultStorage = exports.BaseTestResultStorage = exports.ITestResultStorage = exports.RETAIN_MAX_RESULTS = void 0;
    exports.RETAIN_MAX_RESULTS = 128;
    const RETAIN_MIN_RESULTS = 16;
    const RETAIN_MAX_BYTES = 1024 * 128;
    const CLEANUP_PROBABILITY = 0.2;
    exports.ITestResultStorage = (0, instantiation_1.createDecorator)('ITestResultStorage');
    /**
     * Data revision this version of VS Code deals with. Should be bumped whenever
     * a breaking change is made to the stored results, which will cause previous
     * revisions to be discarded.
     */
    const currentRevision = 1;
    let BaseTestResultStorage = class BaseTestResultStorage extends lifecycle_1.Disposable {
        constructor(storageService, logService) {
            super();
            this.storageService = storageService;
            this.logService = logService;
            this.stored = this._register(new storedValue_1.StoredValue({
                key: 'storedTestResults',
                scope: 1 /* StorageScope.WORKSPACE */,
                target: 1 /* StorageTarget.MACHINE */
            }, this.storageService));
        }
        /**
         * @override
         */
        async read() {
            const results = await Promise.all(this.stored.get([]).map(async ({ id, rev }) => {
                if (rev !== currentRevision) {
                    return undefined;
                }
                try {
                    const contents = await this.readForResultId(id);
                    if (!contents) {
                        return undefined;
                    }
                    return new testResult_1.HydratedTestResult(contents);
                }
                catch (e) {
                    this.logService.warn(`Error deserializing stored test result ${id}`, e);
                    return undefined;
                }
            }));
            return results.filter(types_1.isDefined);
        }
        /**
         * @override
         */
        getResultOutputWriter(resultId) {
            const stream = (0, buffer_1.newWriteableBufferStream)();
            this.storeOutputForResultId(resultId, stream);
            return stream;
        }
        /**
         * @override
         */
        async persist(results) {
            const toDelete = new Map(this.stored.get([]).map(({ id, bytes }) => [id, bytes]));
            const toStore = [];
            const todo = [];
            let budget = RETAIN_MAX_BYTES;
            // Run until either:
            // 1. We store all results
            // 2. We store the max results
            // 3. We store the min results, and have no more byte budget
            for (let i = 0; i < results.length && i < exports.RETAIN_MAX_RESULTS && (budget > 0 || toStore.length < RETAIN_MIN_RESULTS); i++) {
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
                const contents = buffer_1.VSBuffer.fromString(JSON.stringify(obj));
                todo.push(this.storeForResultId(result.id, obj));
                toStore.push({ id: result.id, rev: currentRevision, bytes: contents.byteLength });
                budget -= contents.byteLength;
            }
            for (const id of toDelete.keys()) {
                todo.push(this.deleteForResultId(id).catch(() => undefined));
            }
            this.stored.store(toStore);
            await Promise.all(todo);
        }
    };
    exports.BaseTestResultStorage = BaseTestResultStorage;
    exports.BaseTestResultStorage = BaseTestResultStorage = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, log_1.ILogService)
    ], BaseTestResultStorage);
    class InMemoryResultStorage extends BaseTestResultStorage {
        constructor() {
            super(...arguments);
            this.cache = new Map();
        }
        async readForResultId(id) {
            return Promise.resolve(this.cache.get(id));
        }
        storeForResultId(id, contents) {
            this.cache.set(id, contents);
            return Promise.resolve();
        }
        deleteForResultId(id) {
            this.cache.delete(id);
            return Promise.resolve();
        }
        readOutputForResultId(id) {
            throw new Error('Method not implemented.');
        }
        storeOutputForResultId(id, input) {
            throw new Error('Method not implemented.');
        }
        readOutputRangeForResultId(id, offset, length) {
            throw new Error('Method not implemented.');
        }
    }
    exports.InMemoryResultStorage = InMemoryResultStorage;
    let TestResultStorage = class TestResultStorage extends BaseTestResultStorage {
        constructor(storageService, logService, workspaceContext, fileService, environmentService) {
            super(storageService, logService);
            this.fileService = fileService;
            this.directory = uri_1.URI.joinPath(environmentService.workspaceStorageHome, workspaceContext.getWorkspace().id, 'testResults');
        }
        async readForResultId(id) {
            const contents = await this.fileService.readFile(this.getResultJsonPath(id));
            return JSON.parse(contents.value.toString());
        }
        storeForResultId(id, contents) {
            return this.fileService.writeFile(this.getResultJsonPath(id), buffer_1.VSBuffer.fromString(JSON.stringify(contents)));
        }
        deleteForResultId(id) {
            return this.fileService.del(this.getResultJsonPath(id)).catch(() => undefined);
        }
        async readOutputRangeForResultId(id, offset, length) {
            try {
                const { value } = await this.fileService.readFile(this.getResultOutputPath(id), { position: offset, length });
                return value;
            }
            catch {
                return buffer_1.VSBuffer.alloc(0);
            }
        }
        async readOutputForResultId(id) {
            try {
                const { value } = await this.fileService.readFileStream(this.getResultOutputPath(id));
                return value;
            }
            catch {
                return (0, buffer_1.bufferToStream)(buffer_1.VSBuffer.alloc(0));
            }
        }
        async storeOutputForResultId(id, input) {
            await this.fileService.createFile(this.getResultOutputPath(id), input);
        }
        /**
         * @inheritdoc
         */
        async persist(results) {
            await super.persist(results);
            if (Math.random() < CLEANUP_PROBABILITY) {
                await this.cleanupDereferenced();
            }
        }
        /**
         * Cleans up orphaned files. For instance, output can get orphaned if it's
         * written but the editor is closed before the test run is complete.
         */
        async cleanupDereferenced() {
            const { children } = await this.fileService.resolve(this.directory);
            if (!children) {
                return;
            }
            const stored = new Set(this.stored.get([]).filter(s => s.rev === currentRevision).map(s => s.id));
            await Promise.all(children
                .filter(child => !stored.has(child.name.replace(/\.[a-z]+$/, '')))
                .map(child => this.fileService.del(child.resource).catch(() => undefined)));
        }
        getResultJsonPath(id) {
            return uri_1.URI.joinPath(this.directory, `${id}.json`);
        }
        getResultOutputPath(id) {
            return uri_1.URI.joinPath(this.directory, `${id}.output`);
        }
    };
    exports.TestResultStorage = TestResultStorage;
    exports.TestResultStorage = TestResultStorage = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, log_1.ILogService),
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, files_1.IFileService),
        __param(4, environment_1.IEnvironmentService)
    ], TestResultStorage);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdFJlc3VsdFN0b3JhZ2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXN0aW5nL2NvbW1vbi90ZXN0UmVzdWx0U3RvcmFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFnQm5GLFFBQUEsa0JBQWtCLEdBQUcsR0FBRyxDQUFDO0lBQ3RDLE1BQU0sa0JBQWtCLEdBQUcsRUFBRSxDQUFDO0lBQzlCLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQztJQUNwQyxNQUFNLG1CQUFtQixHQUFHLEdBQUcsQ0FBQztJQWdCbkIsUUFBQSxrQkFBa0IsR0FBRyxJQUFBLCtCQUFlLEVBQUMsb0JBQW9CLENBQUMsQ0FBQztJQUV4RTs7OztPQUlHO0lBQ0gsTUFBTSxlQUFlLEdBQUcsQ0FBQyxDQUFDO0lBRW5CLElBQWUscUJBQXFCLEdBQXBDLE1BQWUscUJBQXNCLFNBQVEsc0JBQVU7UUFTN0QsWUFDa0IsY0FBZ0QsRUFDcEQsVUFBd0M7WUFFckQsS0FBSyxFQUFFLENBQUM7WUFIMEIsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQ25DLGVBQVUsR0FBVixVQUFVLENBQWE7WUFSbkMsV0FBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSx5QkFBVyxDQUE0RDtnQkFDckgsR0FBRyxFQUFFLG1CQUFtQjtnQkFDeEIsS0FBSyxnQ0FBd0I7Z0JBQzdCLE1BQU0sK0JBQXVCO2FBQzdCLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7UUFPekIsQ0FBQztRQUVEOztXQUVHO1FBQ0ksS0FBSyxDQUFDLElBQUk7WUFDaEIsTUFBTSxPQUFPLEdBQUcsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcs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