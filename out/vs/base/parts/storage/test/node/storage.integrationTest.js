/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "os", "vs/base/common/async", "vs/base/common/event", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/uri", "vs/base/common/uuid", "vs/base/node/pfs", "vs/base/parts/storage/common/storage", "vs/base/parts/storage/node/storage", "vs/base/test/common/timeTravelScheduler", "vs/base/test/node/testUtils"], function (require, exports, assert_1, os_1, async_1, event_1, path_1, platform_1, uri_1, uuid_1, pfs_1, storage_1, storage_2, timeTravelScheduler_1, testUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, testUtils_1.flakySuite)('Storage Library', function () {
        let testDir;
        setup(function () {
            testDir = (0, testUtils_1.getRandomTestPath)((0, os_1.tmpdir)(), 'vsctests', 'storagelibrary');
            return pfs_1.Promises.mkdir(testDir, { recursive: true });
        });
        teardown(function () {
            return pfs_1.Promises.rm(testDir);
        });
        test('objects', () => {
            return (0, timeTravelScheduler_1.runWithFakedTimers)({}, async function () {
                const storage = new storage_1.Storage(new storage_2.SQLiteStorageDatabase((0, path_1.join)(testDir, 'storage.db')));
                await storage.init();
                (0, assert_1.ok)(!storage.getObject('foo'));
                const uri = uri_1.URI.file('path/to/folder');
                storage.set('foo', { 'bar': uri });
                (0, assert_1.deepStrictEqual)(storage.getObject('foo'), { 'bar': uri });
                await storage.close();
            });
        });
        test('basics', () => {
            return (0, timeTravelScheduler_1.runWithFakedTimers)({}, async function () {
                const storage = new storage_1.Storage(new storage_2.SQLiteStorageDatabase((0, path_1.join)(testDir, 'storage.db')));
                await storage.init();
                // Empty fallbacks
                (0, assert_1.strictEqual)(storage.get('foo', 'bar'), 'bar');
                (0, assert_1.strictEqual)(storage.getNumber('foo', 55), 55);
                (0, assert_1.strictEqual)(storage.getBoolean('foo', true), true);
                (0, assert_1.deepStrictEqual)(storage.getObject('foo', { 'bar': 'baz' }), { 'bar': 'baz' });
                let changes = new Set();
                storage.onDidChangeStorage(e => {
                    changes.add(e.key);
                });
                await storage.whenFlushed(); // returns immediately when no pending updates
                // Simple updates
                const set1Promise = storage.set('bar', 'foo');
                const set2Promise = storage.set('barNumber', 55);
                const set3Promise = storage.set('barBoolean', true);
                const set4Promise = storage.set('barObject', { 'bar': 'baz' });
                let flushPromiseResolved = false;
                storage.whenFlushed().then(() => flushPromiseResolved = true);
                (0, assert_1.strictEqual)(storage.get('bar'), 'foo');
                (0, assert_1.strictEqual)(storage.getNumber('barNumber'), 55);
                (0, assert_1.strictEqual)(storage.getBoolean('barBoolean'), true);
                (0, assert_1.deepStrictEqual)(storage.getObject('barObject'), { 'bar': 'baz' });
                (0, assert_1.strictEqual)(changes.size, 4);
                (0, assert_1.ok)(changes.has('bar'));
                (0, assert_1.ok)(changes.has('barNumber'));
                (0, assert_1.ok)(changes.has('barBoolean'));
                (0, assert_1.ok)(changes.has('barObject'));
                let setPromiseResolved = false;
                await Promise.all([set1Promise, set2Promise, set3Promise, set4Promise]).then(() => setPromiseResolved = true);
                (0, assert_1.strictEqual)(setPromiseResolved, true);
                (0, assert_1.strictEqual)(flushPromiseResolved, true);
                changes = new Set();
                // Does not trigger events for same update values
                storage.set('bar', 'foo');
                storage.set('barNumber', 55);
                storage.set('barBoolean', true);
                storage.set('barObject', { 'bar': 'baz' });
                (0, assert_1.strictEqual)(changes.size, 0);
                // Simple deletes
                const delete1Promise = storage.delete('bar');
                const delete2Promise = storage.delete('barNumber');
                const delete3Promise = storage.delete('barBoolean');
                const delete4Promise = storage.delete('barObject');
                (0, assert_1.ok)(!storage.get('bar'));
                (0, assert_1.ok)(!storage.getNumber('barNumber'));
                (0, assert_1.ok)(!storage.getBoolean('barBoolean'));
                (0, assert_1.ok)(!storage.getObject('barObject'));
                (0, assert_1.strictEqual)(changes.size, 4);
                (0, assert_1.ok)(changes.has('bar'));
                (0, assert_1.ok)(changes.has('barNumber'));
                (0, assert_1.ok)(changes.has('barBoolean'));
                (0, assert_1.ok)(changes.has('barObject'));
                changes = new Set();
                // Does not trigger events for same delete values
                storage.delete('bar');
                storage.delete('barNumber');
                storage.delete('barBoolean');
                storage.delete('barObject');
                (0, assert_1.strictEqual)(changes.size, 0);
                let deletePromiseResolved = false;
                await Promise.all([delete1Promise, delete2Promise, delete3Promise, delete4Promise]).then(() => deletePromiseResolved = true);
                (0, assert_1.strictEqual)(deletePromiseResolved, true);
                await storage.close();
                await storage.close(); // it is ok to call this multiple times
            });
        });
        test('external changes', () => {
            return (0, timeTravelScheduler_1.runWithFakedTimers)({}, async function () {
                class TestSQLiteStorageDatabase extends storage_2.SQLiteStorageDatabase {
                    constructor() {
                        super(...arguments);
                        this._onDidChangeItemsExternal = new event_1.Emitter();
                    }
                    get onDidChangeItemsExternal() { return this._onDidChangeItemsExternal.event; }
                    fireDidChangeItemsExternal(event) {
                        this._onDidChangeItemsExternal.fire(event);
                    }
                }
                const database = new TestSQLiteStorageDatabase((0, path_1.join)(testDir, 'storage.db'));
                const storage = new storage_1.Storage(database);
                const changes = new Set();
                storage.onDidChangeStorage(e => {
                    changes.add(e.key);
                });
                await storage.init();
                await storage.set('foo', 'bar');
                (0, assert_1.ok)(changes.has('foo'));
                changes.clear();
                // Nothing happens if changing to same value
                const changed = new Map();
                changed.set('foo', 'bar');
                database.fireDidChangeItemsExternal({ changed });
                (0, assert_1.strictEqual)(changes.size, 0);
                // Change is accepted if valid
                changed.set('foo', 'bar1');
                database.fireDidChangeItemsExternal({ changed });
                (0, assert_1.ok)(changes.has('foo'));
                (0, assert_1.strictEqual)(storage.get('foo'), 'bar1');
                changes.clear();
                // Delete is accepted
                const deleted = new Set(['foo']);
                database.fireDidChangeItemsExternal({ deleted });
                (0, assert_1.ok)(changes.has('foo'));
                (0, assert_1.strictEqual)(storage.get('foo', undefined), undefined);
                changes.clear();
                // Nothing happens if changing to same value
                database.fireDidChangeItemsExternal({ deleted });
                (0, assert_1.strictEqual)(changes.size, 0);
                (0, assert_1.strictEqual)((0, storage_1.isStorageItemsChangeEvent)({ changed }), true);
                (0, assert_1.strictEqual)((0, storage_1.isStorageItemsChangeEvent)({ deleted }), true);
                (0, assert_1.strictEqual)((0, storage_1.isStorageItemsChangeEvent)({ changed, deleted }), true);
                (0, assert_1.strictEqual)((0, storage_1.isStorageItemsChangeEvent)(undefined), false);
                (0, assert_1.strictEqual)((0, storage_1.isStorageItemsChangeEvent)({ changed: 'yes', deleted: false }), false);
                await storage.close();
            });
        });
        test('close flushes data', async () => {
            let storage = new storage_1.Storage(new storage_2.SQLiteStorageDatabase((0, path_1.join)(testDir, 'storage.db')));
            await storage.init();
            const set1Promise = storage.set('foo', 'bar');
            const set2Promise = storage.set('bar', 'foo');
            let flushPromiseResolved = false;
            storage.whenFlushed().then(() => flushPromiseResolved = true);
            (0, assert_1.strictEqual)(storage.get('foo'), 'bar');
            (0, assert_1.strictEqual)(storage.get('bar'), 'foo');
            let setPromiseResolved = false;
            Promise.all([set1Promise, set2Promise]).then(() => setPromiseResolved = true);
            await storage.close();
            (0, assert_1.strictEqual)(setPromiseResolved, true);
            (0, assert_1.strictEqual)(flushPromiseResolved, true);
            storage = new storage_1.Storage(new storage_2.SQLiteStorageDatabase((0, path_1.join)(testDir, 'storage.db')));
            await storage.init();
            (0, assert_1.strictEqual)(storage.get('foo'), 'bar');
            (0, assert_1.strictEqual)(storage.get('bar'), 'foo');
            await storage.close();
            storage = new storage_1.Storage(new storage_2.SQLiteStorageDatabase((0, path_1.join)(testDir, 'storage.db')));
            await storage.init();
            const delete1Promise = storage.delete('foo');
            const delete2Promise = storage.delete('bar');
            (0, assert_1.ok)(!storage.get('foo'));
            (0, assert_1.ok)(!storage.get('bar'));
            let deletePromiseResolved = false;
            Promise.all([delete1Promise, delete2Promise]).then(() => deletePromiseResolved = true);
            await storage.close();
            (0, assert_1.strictEqual)(deletePromiseResolved, true);
            storage = new storage_1.Storage(new storage_2.SQLiteStorageDatabase((0, path_1.join)(testDir, 'storage.db')));
            await storage.init();
            (0, assert_1.ok)(!storage.get('foo'));
            (0, assert_1.ok)(!storage.get('bar'));
            await storage.close();
        });
        test('explicit flush', async () => {
            const storage = new storage_1.Storage(new storage_2.SQLiteStorageDatabase((0, path_1.join)(testDir, 'storage.db')));
            await storage.init();
            storage.set('foo', 'bar');
            storage.set('bar', 'foo');
            let flushPromiseResolved = false;
            storage.whenFlushed().then(() => flushPromiseResolved = true);
            (0, assert_1.strictEqual)(flushPromiseResolved, false);
            await storage.flush(0);
            (0, assert_1.strictEqual)(flushPromiseResolved, true);
            await storage.close();
        });
        test('conflicting updates', () => {
            return (0, timeTravelScheduler_1.runWithFakedTimers)({}, async function () {
                const storage = new storage_1.Storage(new storage_2.SQLiteStorageDatabase((0, path_1.join)(testDir, 'storage.db')));
                await storage.init();
                let changes = new Set();
                storage.onDidChangeStorage(e => {
                    changes.add(e.key);
                });
                const set1Promise = storage.set('foo', 'bar1');
                const set2Promise = storage.set('foo', 'bar2');
                const set3Promise = storage.set('foo', 'bar3');
                let flushPromiseResolved = false;
                storage.whenFlushed().then(() => flushPromiseResolved = true);
                (0, assert_1.strictEqual)(storage.get('foo'), 'bar3');
                (0, assert_1.strictEqual)(changes.size, 1);
                (0, assert_1.ok)(changes.has('foo'));
                let setPromiseResolved = false;
                await Promise.all([set1Promise, set2Promise, set3Promise]).then(() => setPromiseResolved = true);
                (0, assert_1.ok)(setPromiseResolved);
                (0, assert_1.ok)(flushPromiseResolved);
                changes = new Set();
                const set4Promise = storage.set('bar', 'foo');
                const delete1Promise = storage.delete('bar');
                (0, assert_1.ok)(!storage.get('bar'));
                (0, assert_1.strictEqual)(changes.size, 1);
                (0, assert_1.ok)(changes.has('bar'));
                let setAndDeletePromiseResolved = false;
                await Promise.all([set4Promise, delete1Promise]).then(() => setAndDeletePromiseResolved = true);
                (0, assert_1.ok)(setAndDeletePromiseResolved);
                await storage.close();
            });
        });
        test('corrupt DB recovers', async () => {
            return (0, timeTravelScheduler_1.runWithFakedTimers)({}, async function () {
                const storageFile = (0, path_1.join)(testDir, 'storage.db');
                let storage = new storage_1.Storage(new storage_2.SQLiteStorageDatabase(storageFile));
                await storage.init();
                await storage.set('bar', 'foo');
                await pfs_1.Promises.writeFile(storageFile, 'This is a broken DB');
                await storage.set('foo', 'bar');
                (0, assert_1.strictEqual)(storage.get('bar'), 'foo');
                (0, assert_1.strictEqual)(storage.get('foo'), 'bar');
                await storage.close();
                storage = new storage_1.Storage(new storage_2.SQLiteStorageDatabase(storageFile));
                await storage.init();
                (0, assert_1.strictEqual)(storage.get('bar'), 'foo');
                (0, assert_1.strictEqual)(storage.get('foo'), 'bar');
                await storage.close();
            });
        });
    });
    (0, testUtils_1.flakySuite)('SQLite Storage Library', function () {
        function toSet(elements) {
            const set = new Set();
            elements.forEach(element => set.add(element));
            return set;
        }
        let testdir;
        setup(function () {
            testdir = (0, testUtils_1.getRandomTestPath)((0, os_1.tmpdir)(), 'vsctests', 'storagelibrary');
            return pfs_1.Promises.mkdir(testdir, { recursive: true });
        });
        teardown(function () {
            return pfs_1.Promises.rm(testdir);
        });
        async function testDBBasics(path, logError) {
            let options;
            if (logError) {
                options = {
                    logging: {
                        logError
                    }
                };
            }
            const storage = new storage_2.SQLiteStorageDatabase(path, options);
            const items = new Map();
            items.set('foo', 'bar');
            items.set('some/foo/path', 'some/bar/path');
            items.set(JSON.stringify({ foo: 'bar' }), JSON.stringify({ bar: 'foo' }));
            let storedItems = await storage.getItems();
            (0, assert_1.strictEqual)(storedItems.size, 0);
            await storage.updateItems({ insert: items });
            storedItems = await storage.getItems();
            (0, assert_1.strictEqual)(storedItems.size, items.size);
            (0, assert_1.strictEqual)(storedItems.get('foo'), 'bar');
            (0, assert_1.strictEqual)(storedItems.get('some/foo/path'), 'some/bar/path');
            (0, assert_1.strictEqual)(storedItems.get(JSON.stringify({ foo: 'bar' })), JSON.stringify({ bar: 'foo' }));
            await storage.updateItems({ delete: toSet(['foo']) });
            storedItems = await storage.getItems();
            (0, assert_1.strictEqual)(storedItems.size, items.size - 1);
            (0, assert_1.ok)(!storedItems.has('foo'));
            (0, assert_1.strictEqual)(storedItems.get('some/foo/path'), 'some/bar/path');
            (0, assert_1.strictEqual)(storedItems.get(JSON.stringify({ foo: 'bar' })), JSON.stringify({ bar: 'foo' }));
            await storage.updateItems({ insert: items });
            storedItems = await storage.getItems();
            (0, assert_1.strictEqual)(storedItems.size, items.size);
            (0, assert_1.strictEqual)(storedItems.get('foo'), 'bar');
            (0, assert_1.strictEqual)(storedItems.get('some/foo/path'), 'some/bar/path');
            (0, assert_1.strictEqual)(storedItems.get(JSON.stringify({ foo: 'bar' })), JSON.stringify({ bar: 'foo' }));
            const itemsChange = new Map();
            itemsChange.set('foo', 'otherbar');
            await storage.updateItems({ insert: itemsChange });
            storedItems = await storage.getItems();
            (0, assert_1.strictEqual)(storedItems.get('foo'), 'otherbar');
            await storage.updateItems({ delete: toSet(['foo', 'bar', 'some/foo/path', JSON.stringify({ foo: 'bar' })]) });
            storedItems = await storage.getItems();
            (0, assert_1.strictEqual)(storedItems.size, 0);
            await storage.updateItems({ insert: items, delete: toSet(['foo', 'some/foo/path', 'other']) });
            storedItems = await storage.getItems();
            (0, assert_1.strictEqual)(storedItems.size, 1);
            (0, assert_1.strictEqual)(storedItems.get(JSON.stringify({ foo: 'bar' })), JSON.stringify({ bar: 'foo' }));
            await storage.updateItems({ delete: toSet([JSON.stringify({ foo: 'bar' })]) });
            storedItems = await storage.getItems();
            (0, assert_1.strictEqual)(storedItems.size, 0);
            let recoveryCalled = false;
            await storage.close(() => {
                recoveryCalled = true;
                return new Map();
            });
            (0, assert_1.strictEqual)(recoveryCalled, false);
        }
        test('basics', async () => {
            await testDBBasics((0, path_1.join)(testdir, 'storage.db'));
        });
        test('basics (open multiple times)', async () => {
            await testDBBasics((0, path_1.join)(testdir, 'storage.db'));
            await testDBBasics((0, path_1.join)(testdir, 'storage.db'));
        });
        test('basics (corrupt DB falls back to empty DB)', async () => {
            const corruptDBPath = (0, path_1.join)(testdir, 'broken.db');
            await pfs_1.Promises.writeFile(corruptDBPath, 'This is a broken DB');
            let expectedError;
            await testDBBasics(corruptDBPath, error => {
                expectedError = error;
            });
            (0, assert_1.ok)(expectedError);
        });
        test('basics (corrupt DB restores from previous backup)', async () => {
            const storagePath = (0, path_1.join)(testdir, 'storage.db');
            let storage = new storage_2.SQLiteStorageDatabase(storagePath);
            const items = new Map();
            items.set('foo', 'bar');
            items.set('some/foo/path', 'some/bar/path');
            items.set(JSON.stringify({ foo: 'bar' }), JSON.stringify({ bar: 'foo' }));
            await storage.updateItems({ insert: items });
            await storage.close();
            await pfs_1.Promises.writeFile(storagePath, 'This is now a broken DB');
            storage = new storage_2.SQLiteStorageDatabase(storagePath);
            const storedItems = await storage.getItems();
            (0, assert_1.strictEqual)(storedItems.size, items.size);
            (0, assert_1.strictEqual)(storedItems.get('foo'), 'bar');
            (0, assert_1.strictEqual)(storedItems.get('some/foo/path'), 'some/bar/path');
            (0, assert_1.strictEqual)(storedItems.get(JSON.stringify({ foo: 'bar' })), JSON.stringify({ bar: 'foo' }));
            let recoveryCalled = false;
            await storage.close(() => {
                recoveryCalled = true;
                return new Map();
            });
            (0, assert_1.strictEqual)(recoveryCalled, false);
        });
        test('basics (corrupt DB falls back to empty DB if backup is corrupt)', async () => {
            const storagePath = (0, path_1.join)(testdir, 'storage.db');
            let storage = new storage_2.SQLiteStorageDatabase(storagePath);
            const items = new Map();
            items.set('foo', 'bar');
            items.set('some/foo/path', 'some/bar/path');
            items.set(JSON.stringify({ foo: 'bar' }), JSON.stringify({ bar: 'foo' }));
            await storage.updateItems({ insert: items });
            await storage.close();
            await pfs_1.Promises.writeFile(storagePath, 'This is now a broken DB');
            await pfs_1.Promises.writeFile(`${storagePath}.backup`, 'This is now also a broken DB');
            storage = new storage_2.SQLiteStorageDatabase(storagePath);
            const storedItems = await storage.getItems();
            (0, assert_1.strictEqual)(storedItems.size, 0);
            await testDBBasics(storagePath);
        });
        (platform_1.isWindows ? test.skip /* Windows will fail to write to open DB due to locking */ : test)('basics (DB that becomes corrupt during runtime stores all state from cache on close)', async () => {
            const storagePath = (0, path_1.join)(testdir, 'storage.db');
            let storage = new storage_2.SQLiteStorageDatabase(storagePath);
            const items = new Map();
            items.set('foo', 'bar');
            items.set('some/foo/path', 'some/bar/path');
            items.set(JSON.stringify({ foo: 'bar' }), JSON.stringify({ bar: 'foo' }));
            await storage.updateItems({ insert: items });
            await storage.close();
            const backupPath = `${storagePath}.backup`;
            (0, assert_1.strictEqual)(await pfs_1.Promises.exists(backupPath), true);
            storage = new storage_2.SQLiteStorageDatabase(storagePath);
            await storage.getItems();
            await pfs_1.Promises.writeFile(storagePath, 'This is now a broken DB');
            // we still need to trigger a check to the DB so that we get to know that
            // the DB is corrupt. We have no extra code on shutdown that checks for the
            // health of the DB. This is an optimization to not perform too many tasks
            // on shutdown.
            await storage.checkIntegrity(true).then(null, error => { } /* error is expected here but we do not want to fail */);
            await pfs_1.Promises.unlink(backupPath); // also test that the recovery DB is backed up properly
            let recoveryCalled = false;
            await storage.close(() => {
                recoveryCalled = true;
                return items;
            });
            (0, assert_1.strictEqual)(recoveryCalled, true);
            (0, assert_1.strictEqual)(await pfs_1.Promises.exists(backupPath), true);
            storage = new storage_2.SQLiteStorageDatabase(storagePath);
            const storedItems = await storage.getItems();
            (0, assert_1.strictEqual)(storedItems.size, items.size);
            (0, assert_1.strictEqual)(storedItems.get('foo'), 'bar');
            (0, assert_1.strictEqual)(storedItems.get('some/foo/path'), 'some/bar/path');
            (0, assert_1.strictEqual)(storedItems.get(JSON.stringify({ foo: 'bar' })), JSON.stringify({ bar: 'foo' }));
            recoveryCalled = false;
            await storage.close(() => {
                recoveryCalled = true;
                return new Map();
            });
            (0, assert_1.strictEqual)(recoveryCalled, false);
        });
        test('real world example', async function () {
            let storage = new storage_2.SQLiteStorageDatabase((0, path_1.join)(testdir, 'storage.db'));
            const items1 = new Map();
            items1.set('colorthemedata', '{"id":"vs vscode-theme-defaults-themes-light_plus-json","label":"Light+ (default light)","settingsId":"Default Light+","selector":"vs.vscode-theme-defaults-themes-light_plus-json","themeTokenColors":[{"settings":{"foreground":"#000000ff","background":"#ffffffff"}},{"scope":["meta.embedded","source.groovy.embedded"],"settings":{"foreground":"#000000ff"}},{"scope":"emphasis","settings":{"fontStyle":"italic"}},{"scope":"strong","settings":{"fontStyle":"bold"}},{"scope":"meta.diff.header","settings":{"foreground":"#000080"}},{"scope":"comment","settings":{"foreground":"#008000"}},{"scope":"constant.language","settings":{"foreground":"#0000ff"}},{"scope":["constant.numeric"],"settings":{"foreground":"#098658"}},{"scope":"constant.regexp","settings":{"foreground":"#811f3f"}},{"name":"css tags in selectors, xml tags","scope":"entity.name.tag","settings":{"foreground":"#800000"}},{"scope":"entity.name.selector","settings":{"foreground":"#800000"}},{"scope":"entity.other.attribute-name","settings":{"foreground":"#ff0000"}},{"scope":["entity.other.attribute-name.class.css","entity.other.attribute-name.class.mixin.css","entity.other.attribute-name.id.css","entity.other.attribute-name.parent-selector.css","entity.other.attribute-name.pseudo-class.css","entity.other.attribute-name.pseudo-element.css","source.css.less entity.other.attribute-name.id","entity.other.attribute-name.attribute.scss","entity.other.attribute-name.scss"],"settings":{"foreground":"#800000"}},{"scope":"invalid","settings":{"foreground":"#cd3131"}},{"scope":"markup.underline","settings":{"fontStyle":"underline"}},{"scope":"markup.bold","settings":{"fontStyle":"bold","foreground":"#000080"}},{"scope":"markup.heading","settings":{"fontStyle":"bold","foreground":"#800000"}},{"scope":"markup.italic","settings":{"fontStyle":"italic"}},{"scope":"markup.inserted","settings":{"foreground":"#098658"}},{"scope":"markup.deleted","settings":{"foreground":"#a31515"}},{"scope":"markup.changed","settings":{"foreground":"#0451a5"}},{"scope":["punctuation.definition.quote.begin.markdown","punctuation.definition.list.begin.markdown"],"settings":{"foreground":"#0451a5"}},{"scope":"markup.inline.raw","settings":{"foreground":"#800000"}},{"name":"brackets of XML/HTML tags","scope":"punctuation.definition.tag","settings":{"foreground":"#800000"}},{"scope":"meta.preprocessor","settings":{"foreground":"#0000ff"}},{"scope":"meta.preprocessor.string","settings":{"foreground":"#a31515"}},{"scope":"meta.preprocessor.numeric","settings":{"foreground":"#098658"}},{"scope":"meta.structure.dictionary.key.python","settings":{"foreground":"#0451a5"}},{"scope":"storage","settings":{"foreground":"#0000ff"}},{"scope":"storage.type","settings":{"foreground":"#0000ff"}},{"scope":"storage.modifier","settings":{"foreground":"#0000ff"}},{"scope":"string","settings":{"foreground":"#a31515"}},{"scope":["string.comment.buffered.block.pug","string.quoted.pug","string.interpolated.pug","string.unquoted.plain.in.yaml","string.unquoted.plain.out.yaml","string.unquoted.block.yaml","string.quoted.single.yaml","string.quoted.double.xml","string.quoted.single.xml","string.unquoted.cdata.xml","string.quoted.double.html","string.quoted.single.html","string.unquoted.html","string.quoted.single.handlebars","string.quoted.double.handlebars"],"settings":{"foreground":"#0000ff"}},{"scope":"string.regexp","settings":{"foreground":"#811f3f"}},{"name":"String interpolation","scope":["punctuation.definition.template-expression.begin","punctuation.definition.template-expression.end","punctuation.section.embedded"],"settings":{"foreground":"#0000ff"}},{"name":"Reset JavaScript string interpolation expression","scope":["meta.template.expression"],"settings":{"foreground":"#000000"}},{"scope":["support.constant.property-value","support.constant.font-name","support.constant.media-type","support.constant.media","constant.other.color.rgb-value","constant.other.rgb-value","support.constant.color"],"settings":{"foreground":"#0451a5"}},{"scope":["support.type.vendored.property-name","support.type.property-name","variable.css","variable.scss","variable.other.less","source.coffee.embedded"],"settings":{"foreground":"#ff0000"}},{"scope":["support.type.property-name.json"],"settings":{"foreground":"#0451a5"}},{"scope":"keyword","settings":{"foreground":"#0000ff"}},{"scope":"keyword.control","settings":{"foreground":"#0000ff"}},{"scope":"keyword.operator","settings":{"foreground":"#000000"}},{"scope":["keyword.operator.new","keyword.operator.expression","keyword.operator.cast","keyword.operator.sizeof","keyword.operator.instanceof","keyword.operator.logical.python"],"settings":{"foreground":"#0000ff"}},{"scope":"keyword.other.unit","settings":{"foreground":"#098658"}},{"scope":["punctuation.section.embedded.begin.php","punctuation.section.embedded.end.php"],"settings":{"foreground":"#800000"}},{"scope":"support.function.git-rebase","settings":{"foreground":"#0451a5"}},{"scope":"constant.sha.git-rebase","settings":{"foreground":"#098658"}},{"name":"coloring of the Java import and package identifiers","scope":["storage.modifier.import.java","variable.language.wildcard.java","storage.modifier.package.java"],"settings":{"foreground":"#000000"}},{"name":"this.self","scope":"variable.language","settings":{"foreground":"#0000ff"}},{"name":"Function declarations","scope":["entity.name.function","support.function","support.constant.handlebars"],"settings":{"foreground":"#795E26"}},{"name":"Types declaration and references","scope":["meta.return-type","support.class","support.type","entity.name.type","entity.name.class","storage.type.numeric.go","storage.type.byte.go","storage.type.boolean.go","storage.type.string.go","storage.type.uintptr.go","storage.type.error.go","storage.type.rune.go","storage.type.cs","storage.type.generic.cs","storage.type.modifier.cs","storage.type.variable.cs","storage.type.annotation.java","storage.type.generic.java","storage.type.java","storage.type.object.array.java","storage.type.primitive.array.java","storage.type.primitive.java","storage.type.token.java","storage.type.groovy","storage.type.annotation.groovy","storage.type.parameters.groovy","storage.type.generic.groovy","storage.type.object.array.groovy","storage.type.primitive.array.groovy","storage.type.primitive.groovy"],"settings":{"foreground":"#267f99"}},{"name":"Types declaration and references, TS grammar specific","scope":["meta.type.cast.expr","meta.type.new.expr","support.constant.math","support.constant.dom","support.constant.json","entity.other.inherited-class"],"settings":{"foreground":"#267f99"}},{"name":"Control flow keywords","scope":"keyword.control","settings":{"foreground":"#AF00DB"}},{"name":"Variable and parameter name","scope":["variable","meta.definition.variable.name","support.variable","entity.name.variable"],"settings":{"foreground":"#001080"}},{"name":"Object keys, TS grammar specific","scope":["meta.object-literal.key"],"settings":{"foreground":"#001080"}},{"name":"CSS property value","scope":["support.constant.property-value","support.constant.font-name","support.constant.media-type","support.constant.media","constant.other.color.rgb-value","constant.other.rgb-value","support.constant.color"],"settings":{"foreground":"#0451a5"}},{"name":"Regular expression groups","scope":["punctuation.definition.group.regexp","punctuation.definition.group.assertion.regexp","punctuation.definition.character-class.regexp","punctuation.character.set.begin.regexp","punctuation.character.set.end.regexp","keyword.operator.negation.regexp","support.other.parenthesis.regexp"],"settings":{"foreground":"#d16969"}},{"scope":["constant.character.character-class.regexp","constant.other.character-class.set.regexp","constant.other.character-class.regexp","constant.character.set.regexp"],"settings":{"foreground":"#811f3f"}},{"scope":"keyword.operator.quantifier.regexp","settings":{"foreground":"#000000"}},{"scope":["keyword.operator.or.regexp","keyword.control.anchor.regexp"],"settings":{"foreground":"#ff0000"}},{"scope":"constant.character","settings":{"foreground":"#0000ff"}},{"scope":"constant.character.escape","settings":{"foreground":"#ff0000"}},{"scope":"token.info-token","settings":{"foreground":"#316bcd"}},{"scope":"token.warn-token","settings":{"foreground":"#cd9731"}},{"scope":"token.error-token","settings":{"foreground":"#cd3131"}},{"scope":"token.debug-token","settings":{"foreground":"#800080"}}],"extensionData":{"extensionId":"vscode.theme-defaults","extensionPublisher":"vscode","extensionName":"theme-defaults","extensionIsBuiltin":true},"colorMap":{"editor.background":"#ffffff","editor.foreground":"#000000","editor.inactiveSelectionBackground":"#e5ebf1","editorIndentGuide.background":"#d3d3d3","editorIndentGuide.activeBackground":"#939393","editor.selectionHighlightBackground":"#add6ff4d","editorSuggestWidget.background":"#f3f3f3","activityBarBadge.background":"#007acc","sideBarTitle.foreground":"#6f6f6f","list.hoverBackground":"#e8e8e8","input.placeholderForeground":"#767676","settings.textInputBorder":"#cecece","settings.numberInputBorder":"#cecece"}}');
            items1.set('commandpalette.mru.cache', '{"usesLRU":true,"entries":[{"key":"revealFileInOS","value":3},{"key":"extension.openInGitHub","value":4},{"key":"workbench.extensions.action.openExtensionsFolder","value":11},{"key":"workbench.action.showRuntimeExtensions","value":14},{"key":"workbench.action.toggleTabsVisibility","value":15},{"key":"extension.liveServerPreview.open","value":16},{"key":"workbench.action.openIssueReporter","value":18},{"key":"workbench.action.openProcessExplorer","value":19},{"key":"workbench.action.toggleSharedProcess","value":20},{"key":"workbench.action.configureLocale","value":21},{"key":"workbench.action.appPerf","value":22},{"key":"workbench.action.reportPerformanceIssueUsingReporter","value":23},{"key":"workbench.action.openGlobalKeybindings","value":25},{"key":"workbench.action.output.toggleOutput","value":27},{"key":"extension.sayHello","value":29}]}');
            items1.set('cpp.1.lastsessiondate', 'Fri Oct 05 2018');
            items1.set('debug.actionswidgetposition', '0.6880952380952381');
            const items2 = new Map();
            items2.set('workbench.editors.files.textfileeditor', '{"textEditorViewState":[["file:///Users/dummy/Documents/ticino-playground/play.htm",{"0":{"cursorState":[{"inSelectionMode":false,"selectionStart":{"lineNumber":6,"column":16},"position":{"lineNumber":6,"column":16}}],"viewState":{"scrollLeft":0,"firstPosition":{"lineNumber":1,"column":1},"firstPositionDeltaTop":0},"contributionsState":{"editor.contrib.folding":{},"editor.contrib.wordHighlighter":false}}}],["file:///Users/dummy/Documents/ticino-playground/nakefile.js",{"0":{"cursorState":[{"inSelectionMode":false,"selectionStart":{"lineNumber":7,"column":81},"position":{"lineNumber":7,"column":81}}],"viewState":{"scrollLeft":0,"firstPosition":{"lineNumber":1,"column":1},"firstPositionDeltaTop":20},"contributionsState":{"editor.contrib.folding":{},"editor.contrib.wordHighlighter":false}}}],["file:///Users/dummy/Desktop/vscode2/.gitattributes",{"0":{"cursorState":[{"inSelectionMode":false,"selectionStart":{"lineNumber":9,"column":12},"position":{"lineNumber":9,"column":12}}],"viewState":{"scrollLeft":0,"firstPosition":{"lineNumber":1,"column":1},"firstPositionDeltaTop":20},"contributionsState":{"editor.contrib.folding":{},"editor.contrib.wordHighlighter":false}}}],["file:///Users/dummy/Desktop/vscode2/src/vs/workbench/contrib/search/browser/openAnythingHandler.ts",{"0":{"cursorState":[{"inSelectionMode":false,"selectionStart":{"lineNumber":1,"column":1},"position":{"lineNumber":1,"column":1}}],"viewState":{"scrollLeft":0,"firstPosition":{"lineNumber":1,"column":1},"firstPositionDeltaTop":0},"contributionsState":{"editor.contrib.folding":{},"editor.contrib.wordHighlighter":false}}}]]}');
            const items3 = new Map();
            items3.set('nps/iscandidate', 'false');
            items3.set('telemetry.instanceid', 'd52bfcd4-4be6-476b-a38f-d44c717c41d6');
            items3.set('workbench.activity.pinnedviewlets', '[{"id":"workbench.view.explorer","pinned":true,"order":0,"visible":true},{"id":"workbench.view.search","pinned":true,"order":1,"visible":true},{"id":"workbench.view.scm","pinned":true,"order":2,"visible":true},{"id":"workbench.view.debug","pinned":true,"order":3,"visible":true},{"id":"workbench.view.extensions","pinned":true,"order":4,"visible":true},{"id":"workbench.view.extension.gitlens","pinned":true,"order":7,"visible":true},{"id":"workbench.view.extension.test","pinned":false,"visible":false}]');
            items3.set('workbench.panel.height', '419');
            items3.set('very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.', 'is long');
            let storedItems = await storage.getItems();
            (0, assert_1.strictEqual)(storedItems.size, 0);
            await Promise.all([
                await storage.updateItems({ insert: items1 }),
                await storage.updateItems({ insert: items2 }),
                await storage.updateItems({ insert: items3 })
            ]);
            (0, assert_1.strictEqual)(await storage.checkIntegrity(true), 'ok');
            (0, assert_1.strictEqual)(await storage.checkIntegrity(false), 'ok');
            storedItems = await storage.getItems();
            (0, assert_1.strictEqual)(storedItems.size, items1.size + items2.size + items3.size);
            const items1Keys = [];
            items1.forEach((value, key) => {
                items1Keys.push(key);
                (0, assert_1.strictEqual)(storedItems.get(key), value);
            });
            const items2Keys = [];
            items2.forEach((value, key) => {
                items2Keys.push(key);
                (0, assert_1.strictEqual)(storedItems.get(key), value);
            });
            const items3Keys = [];
            items3.forEach((value, key) => {
                items3Keys.push(key);
                (0, assert_1.strictEqual)(storedItems.get(key), value);
            });
            await Promise.all([
                await storage.updateItems({ delete: toSet(items1Keys) }),
                await storage.updateItems({ delete: toSet(items2Keys) }),
                await storage.updateItems({ delete: toSet(items3Keys) })
            ]);
            storedItems = await storage.getItems();
            (0, assert_1.strictEqual)(storedItems.size, 0);
            await Promise.all([
                await storage.updateItems({ insert: items1 }),
                await storage.getItems(),
                await storage.updateItems({ insert: items2 }),
                await storage.getItems(),
                await storage.updateItems({ insert: items3 }),
                await storage.getItems(),
            ]);
            storedItems = await storage.getItems();
            (0, assert_1.strictEqual)(storedItems.size, items1.size + items2.size + items3.size);
            await storage.close();
            storage = new storage_2.SQLiteStorageDatabase((0, path_1.join)(testdir, 'storage.db'));
            storedItems = await storage.getItems();
            (0, assert_1.strictEqual)(storedItems.size, items1.size + items2.size + items3.size);
            await storage.close();
        });
        test('very large item value', async function () {
            const storage = new storage_2.SQLiteStorageDatabase((0, path_1.join)(testdir, 'storage.db'));
            let randomData = createLargeRandomData(); // 3.6MB
            await storage.updateItems({ insert: randomData.items });
            let storedItems = await storage.getItems();
            (0, assert_1.strictEqual)(randomData.items.get('colorthemedata'), storedItems.get('colorthemedata'));
            (0, assert_1.strictEqual)(randomData.items.get('commandpalette.mru.cache'), storedItems.get('commandpalette.mru.cache'));
            (0, assert_1.strictEqual)(randomData.items.get('super.large.string'), storedItems.get('super.large.string'));
            randomData = createLargeRandomData();
            await storage.updateItems({ insert: randomData.items });
            storedItems = await storage.getItems();
            (0, assert_1.strictEqual)(randomData.items.get('colorthemedata'), storedItems.get('colorthemedata'));
            (0, assert_1.strictEqual)(randomData.items.get('commandpalette.mru.cache'), storedItems.get('commandpalette.mru.cache'));
            (0, assert_1.strictEqual)(randomData.items.get('super.large.string'), storedItems.get('super.large.string'));
            const toDelete = new Set();
            toDelete.add('super.large.string');
            await storage.updateItems({ delete: toDelete });
            storedItems = await storage.getItems();
            (0, assert_1.strictEqual)(randomData.items.get('colorthemedata'), storedItems.get('colorthemedata'));
            (0, assert_1.strictEqual)(randomData.items.get('commandpalette.mru.cache'), storedItems.get('commandpalette.mru.cache'));
            (0, assert_1.ok)(!storedItems.get('super.large.string'));
            await storage.close();
        });
        test('multiple concurrent writes execute in sequence', async () => {
            return (0, timeTravelScheduler_1.runWithFakedTimers)({}, async () => {
                class TestStorage extends storage_1.Storage {
                    getStorage() {
                        return this.database;
                    }
                }
                const storage = new TestStorage(new storage_2.SQLiteStorageDatabase((0, path_1.join)(testdir, 'storage.db')));
                await storage.init();
                storage.set('foo', 'bar');
                storage.set('some/foo/path', 'some/bar/path');
                await (0, async_1.timeout)(2);
                storage.set('foo1', 'bar');
                storage.set('some/foo1/path', 'some/bar/path');
                await (0, async_1.timeout)(2);
                storage.set('foo2', 'bar');
                storage.set('some/foo2/path', 'some/bar/path');
                await (0, async_1.timeout)(2);
                storage.delete('foo1');
                storage.delete('some/foo1/path');
                await (0, async_1.timeout)(2);
                storage.delete('foo4');
                storage.delete('some/foo4/path');
                await (0, async_1.timeout)(5);
                storage.set('foo3', 'bar');
                await storage.set('some/foo3/path', 'some/bar/path');
                const items = await storage.getStorage().getItems();
                (0, assert_1.strictEqual)(items.get('foo'), 'bar');
                (0, assert_1.strictEqual)(items.get('some/foo/path'), 'some/bar/path');
                (0, assert_1.strictEqual)(items.has('foo1'), false);
                (0, assert_1.strictEqual)(items.has('some/foo1/path'), false);
                (0, assert_1.strictEqual)(items.get('foo2'), 'bar');
                (0, assert_1.strictEqual)(items.get('some/foo2/path'), 'some/bar/path');
                (0, assert_1.strictEqual)(items.get('foo3'), 'bar');
                (0, assert_1.strictEqual)(items.get('some/foo3/path'), 'some/bar/path');
                await storage.close();
            });
        });
        test('lots of INSERT & DELETE (below inline max)', async () => {
            const storage = new storage_2.SQLiteStorageDatabase((0, path_1.join)(testdir, 'storage.db'));
            const { items, keys } = createManyRandomData(200);
            await storage.updateItems({ insert: items });
            let storedItems = await storage.getItems();
            (0, assert_1.strictEqual)(storedItems.size, items.size);
            await storage.updateItems({ delete: keys });
            storedItems = await storage.getItems();
            (0, assert_1.strictEqual)(storedItems.size, 0);
            await storage.close();
        });
        test('lots of INSERT & DELETE (above inline max)', async () => {
            const storage = new storage_2.SQLiteStorageDatabase((0, path_1.join)(testdir, 'storage.db'));
            const { items, keys } = createManyRandomData();
            await storage.updateItems({ insert: items });
            let storedItems = await storage.getItems();
            (0, assert_1.strictEqual)(storedItems.size, items.size);
            await storage.updateItems({ delete: keys });
            storedItems = await storage.getItems();
            (0, assert_1.strictEqual)(storedItems.size, 0);
            await storage.close();
        });
        test('invalid path does not hang', async () => {
            const storage = new storage_2.SQLiteStorageDatabase((0, path_1.join)(testdir, 'nonexist', 'storage.db'));
            let error;
            try {
                await storage.getItems();
                await storage.close();
            }
            catch (e) {
                error = e;
            }
            (0, assert_1.ok)(error);
        });
        test('optimize', async () => {
            const dbPath = (0, path_1.join)(testdir, 'storage.db');
            let storage = new storage_2.SQLiteStorageDatabase(dbPath);
            const { items, keys } = createManyRandomData(400, true);
            await storage.updateItems({ insert: items });
            let storedItems = await storage.getItems();
            (0, assert_1.strictEqual)(storedItems.size, items.size);
            await storage.optimize();
            await storage.close();
            const sizeBeforeDeleteAndOptimize = (await pfs_1.Promises.stat(dbPath)).size;
            storage = new storage_2.SQLiteStorageDatabase(dbPath);
            storedItems = await storage.getItems();
            (0, assert_1.strictEqual)(storedItems.size, items.size);
            await storage.updateItems({ delete: keys });
            storedItems = await storage.getItems();
            (0, assert_1.strictEqual)(storedItems.size, 0);
            await storage.optimize();
            await storage.close();
            storage = new storage_2.SQLiteStorageDatabase(dbPath);
            storedItems = await storage.getItems();
            (0, assert_1.strictEqual)(storedItems.size, 0);
            await storage.close();
            const sizeAfterDeleteAndOptimize = (await pfs_1.Promises.stat(dbPath)).size;
            (0, assert_1.strictEqual)(sizeAfterDeleteAndOptimize < sizeBeforeDeleteAndOptimize, true);
        });
        function createManyRandomData(length = 400, includeVeryLarge = false) {
            const items = new Map();
            const keys = new Set();
            for (let i = 0; i < length; i++) {
                const uuid = (0, uuid_1.generateUuid)();
                const key = `key: ${uuid}`;
                items.set(key, `value: ${uuid}`);
                keys.add(key);
            }
            if (includeVeryLarge) {
                const largeData = createLargeRandomData();
                for (const [key, value] of largeData.items) {
                    items.set(key, value);
                    keys.add(key);
                }
            }
            return { items, keys };
        }
        function createLargeRandomData() {
            const items = new Map();
            items.set('colorthemedata', '{"id":"vs vscode-theme-defaults-themes-light_plus-json","label":"Light+ (default light)","settingsId":"Default Light+","selector":"vs.vscode-theme-defaults-themes-light_plus-json","themeTokenColors":[{"settings":{"foreground":"#000000ff","background":"#ffffffff"}},{"scope":["meta.embedded","source.groovy.embedded"],"settings":{"foreground":"#000000ff"}},{"scope":"emphasis","settings":{"fontStyle":"italic"}},{"scope":"strong","settings":{"fontStyle":"bold"}},{"scope":"meta.diff.header","settings":{"foreground":"#000080"}},{"scope":"comment","settings":{"foreground":"#008000"}},{"scope":"constant.language","settings":{"foreground":"#0000ff"}},{"scope":["constant.numeric"],"settings":{"foreground":"#098658"}},{"scope":"constant.regexp","settings":{"foreground":"#811f3f"}},{"name":"css tags in selectors, xml tags","scope":"entity.name.tag","settings":{"foreground":"#800000"}},{"scope":"entity.name.selector","settings":{"foreground":"#800000"}},{"scope":"entity.other.attribute-name","settings":{"foreground":"#ff0000"}},{"scope":["entity.other.attribute-name.class.css","entity.other.attribute-name.class.mixin.css","entity.other.attribute-name.id.css","entity.other.attribute-name.parent-selector.css","entity.other.attribute-name.pseudo-class.css","entity.other.attribute-name.pseudo-element.css","source.css.less entity.other.attribute-name.id","entity.other.attribute-name.attribute.scss","entity.other.attribute-name.scss"],"settings":{"foreground":"#800000"}},{"scope":"invalid","settings":{"foreground":"#cd3131"}},{"scope":"markup.underline","settings":{"fontStyle":"underline"}},{"scope":"markup.bold","settings":{"fontStyle":"bold","foreground":"#000080"}},{"scope":"markup.heading","settings":{"fontStyle":"bold","foreground":"#800000"}},{"scope":"markup.italic","settings":{"fontStyle":"italic"}},{"scope":"markup.inserted","settings":{"foreground":"#098658"}},{"scope":"markup.deleted","settings":{"foreground":"#a31515"}},{"scope":"markup.changed","settings":{"foreground":"#0451a5"}},{"scope":["punctuation.definition.quote.begin.markdown","punctuation.definition.list.begin.markdown"],"settings":{"foreground":"#0451a5"}},{"scope":"markup.inline.raw","settings":{"foreground":"#800000"}},{"name":"brackets of XML/HTML tags","scope":"punctuation.definition.tag","settings":{"foreground":"#800000"}},{"scope":"meta.preprocessor","settings":{"foreground":"#0000ff"}},{"scope":"meta.preprocessor.string","settings":{"foreground":"#a31515"}},{"scope":"meta.preprocessor.numeric","settings":{"foreground":"#098658"}},{"scope":"meta.structure.dictionary.key.python","settings":{"foreground":"#0451a5"}},{"scope":"storage","settings":{"foreground":"#0000ff"}},{"scope":"storage.type","settings":{"foreground":"#0000ff"}},{"scope":"storage.modifier","settings":{"foreground":"#0000ff"}},{"scope":"string","settings":{"foreground":"#a31515"}},{"scope":["string.comment.buffered.block.pug","string.quoted.pug","string.interpolated.pug","string.unquoted.plain.in.yaml","string.unquoted.plain.out.yaml","string.unquoted.block.yaml","string.quoted.single.yaml","string.quoted.double.xml","string.quoted.single.xml","string.unquoted.cdata.xml","string.quoted.double.html","string.quoted.single.html","string.unquoted.html","string.quoted.single.handlebars","string.quoted.double.handlebars"],"settings":{"foreground":"#0000ff"}},{"scope":"string.regexp","settings":{"foreground":"#811f3f"}},{"name":"String interpolation","scope":["punctuation.definition.template-expression.begin","punctuation.definition.template-expression.end","punctuation.section.embedded"],"settings":{"foreground":"#0000ff"}},{"name":"Reset JavaScript string interpolation expression","scope":["meta.template.expression"],"settings":{"foreground":"#000000"}},{"scope":["support.constant.property-value","support.constant.font-name","support.constant.media-type","support.constant.media","constant.other.color.rgb-value","constant.other.rgb-value","support.constant.color"],"settings":{"foreground":"#0451a5"}},{"scope":["support.type.vendored.property-name","support.type.property-name","variable.css","variable.scss","variable.other.less","source.coffee.embedded"],"settings":{"foreground":"#ff0000"}},{"scope":["support.type.property-name.json"],"settings":{"foreground":"#0451a5"}},{"scope":"keyword","settings":{"foreground":"#0000ff"}},{"scope":"keyword.control","settings":{"foreground":"#0000ff"}},{"scope":"keyword.operator","settings":{"foreground":"#000000"}},{"scope":["keyword.operator.new","keyword.operator.expression","keyword.operator.cast","keyword.operator.sizeof","keyword.operator.instanceof","keyword.operator.logical.python"],"settings":{"foreground":"#0000ff"}},{"scope":"keyword.other.unit","settings":{"foreground":"#098658"}},{"scope":["punctuation.section.embedded.begin.php","punctuation.section.embedded.end.php"],"settings":{"foreground":"#800000"}},{"scope":"support.function.git-rebase","settings":{"foreground":"#0451a5"}},{"scope":"constant.sha.git-rebase","settings":{"foreground":"#098658"}},{"name":"coloring of the Java import and package identifiers","scope":["storage.modifier.import.java","variable.language.wildcard.java","storage.modifier.package.java"],"settings":{"foreground":"#000000"}},{"name":"this.self","scope":"variable.language","settings":{"foreground":"#0000ff"}},{"name":"Function declarations","scope":["entity.name.function","support.function","support.constant.handlebars"],"settings":{"foreground":"#795E26"}},{"name":"Types declaration and references","scope":["meta.return-type","support.class","support.type","entity.name.type","entity.name.class","storage.type.numeric.go","storage.type.byte.go","storage.type.boolean.go","storage.type.string.go","storage.type.uintptr.go","storage.type.error.go","storage.type.rune.go","storage.type.cs","storage.type.generic.cs","storage.type.modifier.cs","storage.type.variable.cs","storage.type.annotation.java","storage.type.generic.java","storage.type.java","storage.type.object.array.java","storage.type.primitive.array.java","storage.type.primitive.java","storage.type.token.java","storage.type.groovy","storage.type.annotation.groovy","storage.type.parameters.groovy","storage.type.generic.groovy","storage.type.object.array.groovy","storage.type.primitive.array.groovy","storage.type.primitive.groovy"],"settings":{"foreground":"#267f99"}},{"name":"Types declaration and references, TS grammar specific","scope":["meta.type.cast.expr","meta.type.new.expr","support.constant.math","support.constant.dom","support.constant.json","entity.other.inherited-class"],"settings":{"foreground":"#267f99"}},{"name":"Control flow keywords","scope":"keyword.control","settings":{"foreground":"#AF00DB"}},{"name":"Variable and parameter name","scope":["variable","meta.definition.variable.name","support.variable","entity.name.variable"],"settings":{"foreground":"#001080"}},{"name":"Object keys, TS grammar specific","scope":["meta.object-literal.key"],"settings":{"foreground":"#001080"}},{"name":"CSS property value","scope":["support.constant.property-value","support.constant.font-name","support.constant.media-type","support.constant.media","constant.other.color.rgb-value","constant.other.rgb-value","support.constant.color"],"settings":{"foreground":"#0451a5"}},{"name":"Regular expression groups","scope":["punctuation.definition.group.regexp","punctuation.definition.group.assertion.regexp","punctuation.definition.character-class.regexp","punctuation.character.set.begin.regexp","punctuation.character.set.end.regexp","keyword.operator.negation.regexp","support.other.parenthesis.regexp"],"settings":{"foreground":"#d16969"}},{"scope":["constant.character.character-class.regexp","constant.other.character-class.set.regexp","constant.other.character-class.regexp","constant.character.set.regexp"],"settings":{"foreground":"#811f3f"}},{"scope":"keyword.operator.quantifier.regexp","settings":{"foreground":"#000000"}},{"scope":["keyword.operator.or.regexp","keyword.control.anchor.regexp"],"settings":{"foreground":"#ff0000"}},{"scope":"constant.character","settings":{"foreground":"#0000ff"}},{"scope":"constant.character.escape","settings":{"foreground":"#ff0000"}},{"scope":"token.info-token","settings":{"foreground":"#316bcd"}},{"scope":"token.warn-token","settings":{"foreground":"#cd9731"}},{"scope":"token.error-token","settings":{"foreground":"#cd3131"}},{"scope":"token.debug-token","settings":{"foreground":"#800080"}}],"extensionData":{"extensionId":"vscode.theme-defaults","extensionPublisher":"vscode","extensionName":"theme-defaults","extensionIsBuiltin":true},"colorMap":{"editor.background":"#ffffff","editor.foreground":"#000000","editor.inactiveSelectionBackground":"#e5ebf1","editorIndentGuide.background":"#d3d3d3","editorIndentGuide.activeBackground":"#939393","editor.selectionHighlightBackground":"#add6ff4d","editorSuggestWidget.background":"#f3f3f3","activityBarBadge.background":"#007acc","sideBarTitle.foreground":"#6f6f6f","list.hoverBackground":"#e8e8e8","input.placeholderForeground":"#767676","settings.textInputBorder":"#cecece","settings.numberInputBorder":"#cecece"}}');
            items.set('commandpalette.mru.cache', '{"usesLRU":true,"entries":[{"key":"revealFileInOS","value":3},{"key":"extension.openInGitHub","value":4},{"key":"workbench.extensions.action.openExtensionsFolder","value":11},{"key":"workbench.action.showRuntimeExtensions","value":14},{"key":"workbench.action.toggleTabsVisibility","value":15},{"key":"extension.liveServerPreview.open","value":16},{"key":"workbench.action.openIssueReporter","value":18},{"key":"workbench.action.openProcessExplorer","value":19},{"key":"workbench.action.toggleSharedProcess","value":20},{"key":"workbench.action.configureLocale","value":21},{"key":"workbench.action.appPerf","value":22},{"key":"workbench.action.reportPerformanceIssueUsingReporter","value":23},{"key":"workbench.action.openGlobalKeybindings","value":25},{"key":"workbench.action.output.toggleOutput","value":27},{"key":"extension.sayHello","value":29}]}');
            const uuid = (0, uuid_1.generateUuid)();
            const value = [];
            for (let i = 0; i < 100000; i++) {
                value.push(uuid);
            }
            items.set('super.large.string', value.join()); // 3.6MB
            return { items, uuid, value };
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZS5pbnRlZ3JhdGlvblRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL3BhcnRzL3N0b3JhZ2UvdGVzdC9ub2RlL3N0b3JhZ2UuaW50ZWdyYXRpb25UZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBZ0JoRyxJQUFBLHNCQUFVLEVBQUMsaUJBQWlCLEVBQUU7UUFFN0IsSUFBSSxPQUFlLENBQUM7UUFFcEIsS0FBSyxDQUFDO1lBQ0wsT0FBTyxHQUFHLElBQUEsNkJBQWlCLEVBQUMsSUFBQSxXQUFNLEdBQUUsRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQUVwRSxPQUFPLGNBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDckQsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUM7WUFDUixPQUFPLGNBQVEsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDN0IsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRTtZQUNwQixPQUFPLElBQUEsd0NBQWtCLEVBQUMsRUFBRSxFQUFFLEtBQUs7Z0JBQ2xDLE1BQU0sT0FBTyxHQUFHLElBQUksaUJBQU8sQ0FBQyxJQUFJLCtCQUFxQixDQUFDLElBQUEsV0FBSSxFQUFDLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXBGLE1BQU0sT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUVyQixJQUFBLFdBQUUsRUFBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDOUIsTUFBTSxHQUFHLEdBQUcsU0FBRyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUN2QyxPQUFPLENBQUMs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