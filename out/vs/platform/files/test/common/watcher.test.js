/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/uri", "vs/base/test/common/utils", "vs/platform/files/common/files", "vs/platform/files/common/watcher"], function (require, exports, assert, event_1, lifecycle_1, platform_1, resources_1, uri_1, utils_1, files_1, watcher_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TestFileWatcher extends lifecycle_1.Disposable {
        constructor() {
            super();
            this._onDidFilesChange = this._register(new event_1.Emitter());
        }
        get onDidFilesChange() {
            return this._onDidFilesChange.event;
        }
        report(changes) {
            this.onRawFileEvents(changes);
        }
        onRawFileEvents(events) {
            // Coalesce
            const coalescedEvents = (0, watcher_1.coalesceEvents)(events);
            // Emit through event emitter
            if (coalescedEvents.length > 0) {
                this._onDidFilesChange.fire({ raw: (0, watcher_1.toFileChanges)(coalescedEvents), event: this.toFileChangesEvent(coalescedEvents) });
            }
        }
        toFileChangesEvent(changes) {
            return new files_1.FileChangesEvent((0, watcher_1.toFileChanges)(changes), !platform_1.isLinux);
        }
    }
    var Path;
    (function (Path) {
        Path[Path["UNIX"] = 0] = "UNIX";
        Path[Path["WINDOWS"] = 1] = "WINDOWS";
        Path[Path["UNC"] = 2] = "UNC";
    })(Path || (Path = {}));
    suite('Watcher', () => {
        (platform_1.isWindows ? test.skip : test)('parseWatcherPatterns - posix', () => {
            const path = '/users/data/src';
            let parsedPattern = (0, watcher_1.parseWatcherPatterns)(path, ['*.js'])[0];
            assert.strictEqual(parsedPattern('/users/data/src/foo.js'), true);
            assert.strictEqual(parsedPattern('/users/data/src/foo.ts'), false);
            assert.strictEqual(parsedPattern('/users/data/src/bar/foo.js'), false);
            parsedPattern = (0, watcher_1.parseWatcherPatterns)(path, ['/users/data/src/*.js'])[0];
            assert.strictEqual(parsedPattern('/users/data/src/foo.js'), true);
            assert.strictEqual(parsedPattern('/users/data/src/foo.ts'), false);
            assert.strictEqual(parsedPattern('/users/data/src/bar/foo.js'), false);
            parsedPattern = (0, watcher_1.parseWatcherPatterns)(path, ['/users/data/src/bar/*.js'])[0];
            assert.strictEqual(parsedPattern('/users/data/src/foo.js'), false);
            assert.strictEqual(parsedPattern('/users/data/src/foo.ts'), false);
            assert.strictEqual(parsedPattern('/users/data/src/bar/foo.js'), true);
            parsedPattern = (0, watcher_1.parseWatcherPatterns)(path, ['**/*.js'])[0];
            assert.strictEqual(parsedPattern('/users/data/src/foo.js'), true);
            assert.strictEqual(parsedPattern('/users/data/src/foo.ts'), false);
            assert.strictEqual(parsedPattern('/users/data/src/bar/foo.js'), true);
        });
        (!platform_1.isWindows ? test.skip : test)('parseWatcherPatterns - windows', () => {
            const path = 'c:\\users\\data\\src';
            let parsedPattern = (0, watcher_1.parseWatcherPatterns)(path, ['*.js'])[0];
            assert.strictEqual(parsedPattern('c:\\users\\data\\src\\foo.js'), true);
            assert.strictEqual(parsedPattern('c:\\users\\data\\src\\foo.ts'), false);
            assert.strictEqual(parsedPattern('c:\\users\\data\\src\\bar/foo.js'), false);
            parsedPattern = (0, watcher_1.parseWatcherPatterns)(path, ['c:\\users\\data\\src\\*.js'])[0];
            assert.strictEqual(parsedPattern('c:\\users\\data\\src\\foo.js'), true);
            assert.strictEqual(parsedPattern('c:\\users\\data\\src\\foo.ts'), false);
            assert.strictEqual(parsedPattern('c:\\users\\data\\src\\bar\\foo.js'), false);
            parsedPattern = (0, watcher_1.parseWatcherPatterns)(path, ['c:\\users\\data\\src\\bar/*.js'])[0];
            assert.strictEqual(parsedPattern('c:\\users\\data\\src\\foo.js'), false);
            assert.strictEqual(parsedPattern('c:\\users\\data\\src\\foo.ts'), false);
            assert.strictEqual(parsedPattern('c:\\users\\data\\src\\bar\\foo.js'), true);
            parsedPattern = (0, watcher_1.parseWatcherPatterns)(path, ['**/*.js'])[0];
            assert.strictEqual(parsedPattern('c:\\users\\data\\src\\foo.js'), true);
            assert.strictEqual(parsedPattern('c:\\users\\data\\src\\foo.ts'), false);
            assert.strictEqual(parsedPattern('c:\\users\\data\\src\\bar\\foo.js'), true);
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
    suite('Watcher Events Normalizer', () => {
        const disposables = new lifecycle_1.DisposableStore();
        teardown(() => {
            disposables.clear();
        });
        test('simple add/update/delete', done => {
            const watch = disposables.add(new TestFileWatcher());
            const added = uri_1.URI.file('/users/data/src/added.txt');
            const updated = uri_1.URI.file('/users/data/src/updated.txt');
            const deleted = uri_1.URI.file('/users/data/src/deleted.txt');
            const raw = [
                { path: added.fsPath, type: 1 /* FileChangeType.ADDED */ },
                { path: updated.fsPath, type: 0 /* FileChangeType.UPDATED */ },
                { path: deleted.fsPath, type: 2 /* FileChangeType.DELETED */ },
            ];
            disposables.add(watch.onDidFilesChange(({ event, raw }) => {
                assert.ok(event);
                assert.strictEqual(raw.length, 3);
                assert.ok(event.contains(added, 1 /* FileChangeType.ADDED */));
                assert.ok(event.contains(updated, 0 /* FileChangeType.UPDATED */));
                assert.ok(event.contains(deleted, 2 /* FileChangeType.DELETED */));
                done();
            }));
            watch.report(raw);
        });
        (platform_1.isWindows ? [Path.WINDOWS, Path.UNC] : [Path.UNIX]).forEach(path => {
            test(`delete only reported for top level folder (${path})`, done => {
                const watch = disposables.add(new TestFileWatcher());
                const deletedFolderA = uri_1.URI.file(path === Path.UNIX ? '/users/data/src/todelete1' : path === Path.WINDOWS ? 'C:\\users\\data\\src\\todelete1' : '\\\\localhost\\users\\data\\src\\todelete1');
                const deletedFolderB = uri_1.URI.file(path === Path.UNIX ? '/users/data/src/todelete2' : path === Path.WINDOWS ? 'C:\\users\\data\\src\\todelete2' : '\\\\localhost\\users\\data\\src\\todelete2');
                const deletedFolderBF1 = uri_1.URI.file(path === Path.UNIX ? '/users/data/src/todelete2/file.txt' : path === Path.WINDOWS ? 'C:\\users\\data\\src\\todelete2\\file.txt' : '\\\\localhost\\users\\data\\src\\todelete2\\file.txt');
                const deletedFolderBF2 = uri_1.URI.file(path === Path.UNIX ? '/users/data/src/todelete2/more/test.txt' : path === Path.WINDOWS ? 'C:\\users\\data\\src\\todelete2\\more\\test.txt' : '\\\\localhost\\users\\data\\src\\todelete2\\more\\test.txt');
                const deletedFolderBF3 = uri_1.URI.file(path === Path.UNIX ? '/users/data/src/todelete2/super/bar/foo.txt' : path === Path.WINDOWS ? 'C:\\users\\data\\src\\todelete2\\super\\bar\\foo.txt' : '\\\\localhost\\users\\data\\src\\todelete2\\super\\bar\\foo.txt');
                const deletedFileA = uri_1.URI.file(path === Path.UNIX ? '/users/data/src/deleteme.txt' : path === Path.WINDOWS ? 'C:\\users\\data\\src\\deleteme.txt' : '\\\\localhost\\users\\data\\src\\deleteme.txt');
                const addedFile = uri_1.URI.file(path === Path.UNIX ? '/users/data/src/added.txt' : path === Path.WINDOWS ? 'C:\\users\\data\\src\\added.txt' : '\\\\localhost\\users\\data\\src\\added.txt');
                const updatedFile = uri_1.URI.file(path === Path.UNIX ? '/users/data/src/updated.txt' : path === Path.WINDOWS ? 'C:\\users\\data\\src\\updated.txt' : '\\\\localhost\\users\\data\\src\\updated.txt');
                const raw = [
                    { path: deletedFolderA.fsPath, type: 2 /* FileChangeType.DELETED */ },
                    { path: deletedFolderB.fsPath, type: 2 /* FileChangeType.DELETED */ },
                    { path: deletedFolderBF1.fsPath, type: 2 /* FileChangeType.DELETED */ },
                    { path: deletedFolderBF2.fsPath, type: 2 /* FileChangeType.DELETED */ },
                    { path: deletedFolderBF3.fsPath, type: 2 /* FileChangeType.DELETED */ },
                    { path: deletedFileA.fsPath, type: 2 /* FileChangeType.DELETED */ },
                    { path: addedFile.fsPath, type: 1 /* FileChangeType.ADDED */ },
                    { path: updatedFile.fsPath, type: 0 /* FileChangeType.UPDATED */ }
                ];
                disposables.add(watch.onDidFilesChange(({ event, raw }) => {
                    assert.ok(event);
                    assert.strictEqual(raw.length, 5);
                    assert.ok(event.contains(deletedFolderA, 2 /* FileChangeType.DELETED */));
                    assert.ok(event.contains(deletedFolderB, 2 /* FileChangeType.DELETED */));
                    assert.ok(event.contains(deletedFileA, 2 /* FileChangeType.DELETED */));
                    assert.ok(event.contains(addedFile, 1 /* FileChangeType.ADDED */));
                    assert.ok(event.contains(updatedFile, 0 /* FileChangeType.UPDATED */));
                    done();
                }));
                watch.report(raw);
            });
        });
        test('event coalescer: ignore CREATE followed by DELETE', done => {
            const watch = disposables.add(new TestFileWatcher());
            const created = uri_1.URI.file('/users/data/src/related');
            const deleted = uri_1.URI.file('/users/data/src/related');
            const unrelated = uri_1.URI.file('/users/data/src/unrelated');
            const raw = [
                { path: created.fsPath, type: 1 /* FileChangeType.ADDED */ },
                { path: deleted.fsPath, type: 2 /* FileChangeType.DELETED */ },
                { path: unrelated.fsPath, type: 0 /* FileChangeType.UPDATED */ },
            ];
            disposables.add(watch.onDidFilesChange(({ event, raw }) => {
                assert.ok(event);
                assert.strictEqual(raw.length, 1);
                assert.ok(event.contains(unrelated, 0 /* FileChangeType.UPDATED */));
                done();
            }));
            watch.report(raw);
        });
        test('event coalescer: flatten DELETE followed by CREATE into CHANGE', done => {
            const watch = disposables.add(new TestFileWatcher());
            const deleted = uri_1.URI.file('/users/data/src/related');
            const created = uri_1.URI.file('/users/data/src/related');
            const unrelated = uri_1.URI.file('/users/data/src/unrelated');
            const raw = [
                { path: deleted.fsPath, type: 2 /* FileChangeType.DELETED */ },
                { path: created.fsPath, type: 1 /* FileChangeType.ADDED */ },
                { path: unrelated.fsPath, type: 0 /* FileChangeType.UPDATED */ },
            ];
            disposables.add(watch.onDidFilesChange(({ event, raw }) => {
                assert.ok(event);
                assert.strictEqual(raw.length, 2);
                assert.ok(event.contains(deleted, 0 /* FileChangeType.UPDATED */));
                assert.ok(event.contains(unrelated, 0 /* FileChangeType.UPDATED */));
                done();
            }));
            watch.report(raw);
        });
        test('event coalescer: ignore UPDATE when CREATE received', done => {
            const watch = disposables.add(new TestFileWatcher());
            const created = uri_1.URI.file('/users/data/src/related');
            const updated = uri_1.URI.file('/users/data/src/related');
            const unrelated = uri_1.URI.file('/users/data/src/unrelated');
            const raw = [
                { path: created.fsPath, type: 1 /* FileChangeType.ADDED */ },
                { path: updated.fsPath, type: 0 /* FileChangeType.UPDATED */ },
                { path: unrelated.fsPath, type: 0 /* FileChangeType.UPDATED */ },
            ];
            disposables.add(watch.onDidFilesChange(({ event, raw }) => {
                assert.ok(event);
                assert.strictEqual(raw.length, 2);
                assert.ok(event.contains(created, 1 /* FileChangeType.ADDED */));
                assert.ok(!event.contains(created, 0 /* FileChangeType.UPDATED */));
                assert.ok(event.contains(unrelated, 0 /* FileChangeType.UPDATED */));
                done();
            }));
            watch.report(raw);
        });
        test('event coalescer: apply DELETE', done => {
            const watch = disposables.add(new TestFileWatcher());
            const updated = uri_1.URI.file('/users/data/src/related');
            const updated2 = uri_1.URI.file('/users/data/src/related');
            const deleted = uri_1.URI.file('/users/data/src/related');
            const unrelated = uri_1.URI.file('/users/data/src/unrelated');
            const raw = [
                { path: updated.fsPath, type: 0 /* FileChangeType.UPDATED */ },
                { path: updated2.fsPath, type: 0 /* FileChangeType.UPDATED */ },
                { path: unrelated.fsPath, type: 0 /* FileChangeType.UPDATED */ },
                { path: updated.fsPath, type: 2 /* FileChangeType.DELETED */ }
            ];
            disposables.add(watch.onDidFilesChange(({ event, raw }) => {
                assert.ok(event);
                assert.strictEqual(raw.length, 2);
                assert.ok(event.contains(deleted, 2 /* FileChangeType.DELETED */));
                assert.ok(!event.contains(updated, 0 /* FileChangeType.UPDATED */));
                assert.ok(event.contains(unrelated, 0 /* FileChangeType.UPDATED */));
                done();
            }));
            watch.report(raw);
        });
        test('event coalescer: track case renames', done => {
            const watch = disposables.add(new TestFileWatcher());
            const oldPath = uri_1.URI.file('/users/data/src/added');
            const newPath = uri_1.URI.file('/users/data/src/ADDED');
            const raw = [
                { path: newPath.fsPath, type: 1 /* FileChangeType.ADDED */ },
                { path: oldPath.fsPath, type: 2 /* FileChangeType.DELETED */ }
            ];
            disposables.add(watch.onDidFilesChange(({ event, raw }) => {
                assert.ok(event);
                assert.strictEqual(raw.length, 2);
                for (const r of raw) {
                    if ((0, resources_1.isEqual)(r.resource, oldPath)) {
                        assert.strictEqual(r.type, 2 /* FileChangeType.DELETED */);
                    }
                    else if ((0, resources_1.isEqual)(r.resource, newPath)) {
                        assert.strictEqual(r.type, 1 /* FileChangeType.ADDED */);
                    }
                    else {
                        assert.fail();
                    }
                }
                done();
            }));
            watch.report(raw);
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2F0Y2hlci50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vZmlsZXMvdGVzdC9jb21tb24vd2F0Y2hlci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBWWhHLE1BQU0sZUFBZ0IsU0FBUSxzQkFBVTtRQUd2QztZQUNDLEtBQUssRUFBRSxDQUFDO1lBRVIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQW1ELENBQUMsQ0FBQztRQUN6RyxDQUFDO1FBRUQsSUFBSSxnQkFBZ0I7WUFDbkIsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDO1FBQ3JDLENBQUM7UUFFRCxNQUFNLENBQUMsT0FBMEI7WUFDaEMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMvQixDQUFDO1FBRU8sZUFBZSxDQUFDLE1BQXlCO1lBRWhELFdBQVc7WUFDWCxNQUFNLGVBQWUsR0FBRyxJQUFBLHdCQUFjLEVBQUMsTUFBTSxDQUFDLENBQUM7WUFFL0MsNkJBQTZCO1lBQzdCLElBQUksZUFBZSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQy9CLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBQSx1QkFBYSxFQUFDLGVBQWUsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQ3RIO1FBQ0YsQ0FBQztRQUVPLGtCQUFrQixDQUFDLE9BQTBCO1lBQ3BELE9BQU8sSUFBSSx3QkFBZ0IsQ0FBQyxJQUFBLHVCQUFhLEVBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxrQkFBTyxDQUFDLENBQUM7UUFDL0QsQ0FBQztLQUNEO0lBRUQsSUFBSyxJQUlKO0lBSkQs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