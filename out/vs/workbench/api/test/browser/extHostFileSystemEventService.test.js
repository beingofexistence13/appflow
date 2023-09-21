define(["require", "exports", "assert", "vs/workbench/api/common/extHostFileSystemEventService", "vs/platform/log/common/log", "vs/base/test/common/utils"], function (require, exports, assert, extHostFileSystemEventService_1, log_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtHostFileSystemEventService', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('FileSystemWatcher ignore events properties are reversed #26851', function () {
            const protocol = {
                getProxy: () => { return undefined; },
                set: undefined,
                dispose: undefined,
                assertRegistered: undefined,
                drain: undefined
            };
            const watcher1 = new extHostFileSystemEventService_1.ExtHostFileSystemEventService(protocol, new log_1.NullLogService(), undefined).createFileSystemWatcher(undefined, undefined, '**/somethingInteresting', false, false, false);
            assert.strictEqual(watcher1.ignoreChangeEvents, false);
            assert.strictEqual(watcher1.ignoreCreateEvents, false);
            assert.strictEqual(watcher1.ignoreDeleteEvents, false);
            watcher1.dispose();
            const watcher2 = new extHostFileSystemEventService_1.ExtHostFileSystemEventService(protocol, new log_1.NullLogService(), undefined).createFileSystemWatcher(undefined, undefined, '**/somethingBoring', true, true, true);
            assert.strictEqual(watcher2.ignoreChangeEvents, true);
            assert.strictEqual(watcher2.ignoreCreateEvents, true);
            assert.strictEqual(watcher2.ignoreDeleteEvents, true);
            watcher2.dispose();
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdEZpbGVTeXN0ZW1FdmVudFNlcnZpY2UudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvdGVzdC9icm93c2VyL2V4dEhvc3RGaWxlU3lzdGVtRXZlbnRTZXJ2aWNlLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBVUEsS0FBSyxDQUFDLCtCQUErQixFQUFFLEdBQUcsRUFBRTtRQUUzQyxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFMUMsSUFBSSxDQUFDLGdFQUFnRSxFQUFFO1lBRXRFLE1BQU0sUUFBUSxHQUFpQjtnQkFDOUIsUUFBUSxFQUFFLEdBQUcsRUFBRSxHQUFHLE9BQU8sU0FBVSxDQUFDLENBQUMsQ0FBQztnQkFDdEMsR0FBRyxFQUFFLFNBQVU7Z0JBQ2YsT0FBTyxFQUFFLFNBQVU7Z0JBQ25CLGdCQUFnQixFQUFFLFNBQVU7Z0JBQzVCLEtBQUssRUFBRSxTQUFVO2FBQ2pCLENBQUM7WUFFRixNQUFNLFFBQVEsR0FBRyxJQUFJLDZEQUE2QixDQUFDLFFBQVEsRUFBRSxJQUFJLG9CQUFjLEVBQUUsRUFBRSxTQUFVLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxTQUFVLEVBQUUsU0FBVSxFQUFFLHlCQUF5QixFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDL0wsTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDdkQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDdkQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDdkQsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBRW5CLE1BQU0sUUFBUSxHQUFHLElBQUksNkRBQTZCLENBQUMsUUFBUSxFQUFFLElBQUksb0JBQWMsRUFBRSxFQUFFLFNBQVUsQ0FBQyxDQUFDLHVCQUF1QixDQUFDLFNBQVUsRUFBRSxTQUFVLEVBQUUsb0JBQW9CLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN2TCxNQUFNLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN0RCxNQUFNLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN0RCxNQUFNLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN0RCxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDcEIsQ0FBQyxDQUFDLENBQUM7SUFFSixDQUFDLENBQUMsQ0FBQyJ9