/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/uri", "vs/base/test/common/utils", "vs/platform/files/common/files", "vs/platform/files/common/watcher"], function (require, exports, assert, event_1, lifecycle_1, platform_1, resources_1, uri_1, utils_1, files_1, watcher_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TestFileWatcher extends lifecycle_1.$kc {
        constructor() {
            super();
            this.a = this.B(new event_1.$fd());
        }
        get onDidFilesChange() {
            return this.a.event;
        }
        report(changes) {
            this.b(changes);
        }
        b(events) {
            // Coalesce
            const coalescedEvents = (0, watcher_1.$Jp)(events);
            // Emit through event emitter
            if (coalescedEvents.length > 0) {
                this.a.fire({ raw: (0, watcher_1.$Ip)(coalescedEvents), event: this.c(coalescedEvents) });
            }
        }
        c(changes) {
            return new files_1.$lk((0, watcher_1.$Ip)(changes), !platform_1.$k);
        }
    }
    var Path;
    (function (Path) {
        Path[Path["UNIX"] = 0] = "UNIX";
        Path[Path["WINDOWS"] = 1] = "WINDOWS";
        Path[Path["UNC"] = 2] = "UNC";
    })(Path || (Path = {}));
    suite('Watcher', () => {
        (platform_1.$i ? test.skip : test)('parseWatcherPatterns - posix', () => {
            const path = '/users/data/src';
            let parsedPattern = (0, watcher_1.$Lp)(path, ['*.js'])[0];
            assert.strictEqual(parsedPattern('/users/data/src/foo.js'), true);
            assert.strictEqual(parsedPattern('/users/data/src/foo.ts'), false);
            assert.strictEqual(parsedPattern('/users/data/src/bar/foo.js'), false);
            parsedPattern = (0, watcher_1.$Lp)(path, ['/users/data/src/*.js'])[0];
            assert.strictEqual(parsedPattern('/users/data/src/foo.js'), true);
            assert.strictEqual(parsedPattern('/users/data/src/foo.ts'), false);
            assert.strictEqual(parsedPattern('/users/data/src/bar/foo.js'), false);
            parsedPattern = (0, watcher_1.$Lp)(path, ['/users/data/src/bar/*.js'])[0];
            assert.strictEqual(parsedPattern('/users/data/src/foo.js'), false);
            assert.strictEqual(parsedPattern('/users/data/src/foo.ts'), false);
            assert.strictEqual(parsedPattern('/users/data/src/bar/foo.js'), true);
            parsedPattern = (0, watcher_1.$Lp)(path, ['**/*.js'])[0];
            assert.strictEqual(parsedPattern('/users/data/src/foo.js'), true);
            assert.strictEqual(parsedPattern('/users/data/src/foo.ts'), false);
            assert.strictEqual(parsedPattern('/users/data/src/bar/foo.js'), true);
        });
        (!platform_1.$i ? test.skip : test)('parseWatcherPatterns - windows', () => {
            const path = 'c:\\users\\data\\src';
            let parsedPattern = (0, watcher_1.$Lp)(path, ['*.js'])[0];
            assert.strictEqual(parsedPattern('c:\\users\\data\\src\\foo.js'), true);
            assert.strictEqual(parsedPattern('c:\\users\\data\\src\\foo.ts'), false);
            assert.strictEqual(parsedPattern('c:\\users\\data\\src\\bar/foo.js'), false);
            parsedPattern = (0, watcher_1.$Lp)(path, ['c:\\users\\data\\src\\*.js'])[0];
            assert.strictEqual(parsedPattern('c:\\users\\data\\src\\foo.js'), true);
            assert.strictEqual(parsedPattern('c:\\users\\data\\src\\foo.ts'), false);
            assert.strictEqual(parsedPattern('c:\\users\\data\\src\\bar\\foo.js'), false);
            parsedPattern = (0, watcher_1.$Lp)(path, ['c:\\users\\data\\src\\bar/*.js'])[0];
            assert.strictEqual(parsedPattern('c:\\users\\data\\src\\foo.js'), false);
            assert.strictEqual(parsedPattern('c:\\users\\data\\src\\foo.ts'), false);
            assert.strictEqual(parsedPattern('c:\\users\\data\\src\\bar\\foo.js'), true);
            parsedPattern = (0, watcher_1.$Lp)(path, ['**/*.js'])[0];
            assert.strictEqual(parsedPattern('c:\\users\\data\\src\\foo.js'), true);
            assert.strictEqual(parsedPattern('c:\\users\\data\\src\\foo.ts'), false);
            assert.strictEqual(parsedPattern('c:\\users\\data\\src\\bar\\foo.js'), true);
        });
        (0, utils_1.$bT)();
    });
    suite('Watcher Events Normalizer', () => {
        const disposables = new lifecycle_1.$jc();
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
        (platform_1.$i ? [Path.WINDOWS, Path.UNC] : [Path.UNIX]).forEach(path => {
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
                    if ((0, resources_1.$bg)(r.resource, oldPath)) {
                        assert.strictEqual(r.type, 2 /* FileChangeType.DELETED */);
                    }
                    else if ((0, resources_1.$bg)(r.resource, newPath)) {
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
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=watcher.test.js.map