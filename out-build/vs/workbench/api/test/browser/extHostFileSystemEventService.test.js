define(["require", "exports", "assert", "vs/workbench/api/common/extHostFileSystemEventService", "vs/platform/log/common/log", "vs/base/test/common/utils"], function (require, exports, assert, extHostFileSystemEventService_1, log_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtHostFileSystemEventService', () => {
        (0, utils_1.$bT)();
        test('FileSystemWatcher ignore events properties are reversed #26851', function () {
            const protocol = {
                getProxy: () => { return undefined; },
                set: undefined,
                dispose: undefined,
                assertRegistered: undefined,
                drain: undefined
            };
            const watcher1 = new extHostFileSystemEventService_1.$Vbc(protocol, new log_1.$fj(), undefined).createFileSystemWatcher(undefined, undefined, '**/somethingInteresting', false, false, false);
            assert.strictEqual(watcher1.ignoreChangeEvents, false);
            assert.strictEqual(watcher1.ignoreCreateEvents, false);
            assert.strictEqual(watcher1.ignoreDeleteEvents, false);
            watcher1.dispose();
            const watcher2 = new extHostFileSystemEventService_1.$Vbc(protocol, new log_1.$fj(), undefined).createFileSystemWatcher(undefined, undefined, '**/somethingBoring', true, true, true);
            assert.strictEqual(watcher2.ignoreChangeEvents, true);
            assert.strictEqual(watcher2.ignoreCreateEvents, true);
            assert.strictEqual(watcher2.ignoreDeleteEvents, true);
            watcher2.dispose();
        });
    });
});
//# sourceMappingURL=extHostFileSystemEventService.test.js.map