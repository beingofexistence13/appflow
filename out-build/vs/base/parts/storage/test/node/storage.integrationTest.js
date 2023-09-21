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
            testDir = (0, testUtils_1.$oT)((0, os_1.tmpdir)(), 'vsctests', 'storagelibrary');
            return pfs_1.Promises.mkdir(testDir, { recursive: true });
        });
        teardown(function () {
            return pfs_1.Promises.rm(testDir);
        });
        test('objects', () => {
            return (0, timeTravelScheduler_1.$kT)({}, async function () {
                const storage = new storage_1.$Ro(new storage_2.$nT((0, path_1.$9d)(testDir, 'storage.db')));
                await storage.init();
                (0, assert_1.ok)(!storage.getObject('foo'));
                const uri = uri_1.URI.file('path/to/folder');
                storage.set('foo', { 'bar': uri });
                (0, assert_1.deepStrictEqual)(storage.getObject('foo'), { 'bar': uri });
                await storage.close();
            });
        });
        test('basics', () => {
            return (0, timeTravelScheduler_1.$kT)({}, async function () {
                const storage = new storage_1.$Ro(new storage_2.$nT((0, path_1.$9d)(testDir, 'storage.db')));
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
            return (0, timeTravelScheduler_1.$kT)({}, async function () {
                class TestSQLiteStorageDatabase extends storage_2.$nT {
                    constructor() {
                        super(...arguments);
                        this.v = new event_1.$fd();
                    }
                    get onDidChangeItemsExternal() { return this.v.event; }
                    fireDidChangeItemsExternal(event) {
                        this.v.fire(event);
                    }
                }
                const database = new TestSQLiteStorageDatabase((0, path_1.$9d)(testDir, 'storage.db'));
                const storage = new storage_1.$Ro(database);
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
                (0, assert_1.strictEqual)((0, storage_1.$Qo)({ changed }), true);
                (0, assert_1.strictEqual)((0, storage_1.$Qo)({ deleted }), true);
                (0, assert_1.strictEqual)((0, storage_1.$Qo)({ changed, deleted }), true);
                (0, assert_1.strictEqual)((0, storage_1.$Qo)(undefined), false);
                (0, assert_1.strictEqual)((0, storage_1.$Qo)({ changed: 'yes', deleted: false }), false);
                await storage.close();
            });
        });
        test('close flushes data', async () => {
            let storage = new storage_1.$Ro(new storage_2.$nT((0, path_1.$9d)(testDir, 'storage.db')));
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
            storage = new storage_1.$Ro(new storage_2.$nT((0, path_1.$9d)(testDir, 'storage.db')));
            await storage.init();
            (0, assert_1.strictEqual)(storage.get('foo'), 'bar');
            (0, assert_1.strictEqual)(storage.get('bar'), 'foo');
            await storage.close();
            storage = new storage_1.$Ro(new storage_2.$nT((0, path_1.$9d)(testDir, 'storage.db')));
            await storage.init();
            const delete1Promise = storage.delete('foo');
            const delete2Promise = storage.delete('bar');
            (0, assert_1.ok)(!storage.get('foo'));
            (0, assert_1.ok)(!storage.get('bar'));
            let deletePromiseResolved = false;
            Promise.all([delete1Promise, delete2Promise]).then(() => deletePromiseResolved = true);
            await storage.close();
            (0, assert_1.strictEqual)(deletePromiseResolved, true);
            storage = new storage_1.$Ro(new storage_2.$nT((0, path_1.$9d)(testDir, 'storage.db')));
            await storage.init();
            (0, assert_1.ok)(!storage.get('foo'));
            (0, assert_1.ok)(!storage.get('bar'));
            await storage.close();
        });
        test('explicit flush', async () => {
            const storage = new storage_1.$Ro(new storage_2.$nT((0, path_1.$9d)(testDir, 'storage.db')));
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
            return (0, timeTravelScheduler_1.$kT)({}, async function () {
                const storage = new storage_1.$Ro(new storage_2.$nT((0, path_1.$9d)(testDir, 'storage.db')));
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
            return (0, timeTravelScheduler_1.$kT)({}, async function () {
                const storageFile = (0, path_1.$9d)(testDir, 'storage.db');
                let storage = new storage_1.$Ro(new storage_2.$nT(storageFile));
                await storage.init();
                await storage.set('bar', 'foo');
                await pfs_1.Promises.writeFile(storageFile, 'This is a broken DB');
                await storage.set('foo', 'bar');
                (0, assert_1.strictEqual)(storage.get('bar'), 'foo');
                (0, assert_1.strictEqual)(storage.get('foo'), 'bar');
                await storage.close();
                storage = new storage_1.$Ro(new storage_2.$nT(storageFile));
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
            testdir = (0, testUtils_1.$oT)((0, os_1.tmpdir)(), 'vsctests', 'storagelibrary');
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
            const storage = new storage_2.$nT(path, options);
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
            await testDBBasics((0, path_1.$9d)(testdir, 'storage.db'));
        });
        test('basics (open multiple times)', async () => {
            await testDBBasics((0, path_1.$9d)(testdir, 'storage.db'));
            await testDBBasics((0, path_1.$9d)(testdir, 'storage.db'));
        });
        test('basics (corrupt DB falls back to empty DB)', async () => {
            const corruptDBPath = (0, path_1.$9d)(testdir, 'broken.db');
            await pfs_1.Promises.writeFile(corruptDBPath, 'This is a broken DB');
            let expectedError;
            await testDBBasics(corruptDBPath, error => {
                expectedError = error;
            });
            (0, assert_1.ok)(expectedError);
        });
        test('basics (corrupt DB restores from previous backup)', async () => {
            const storagePath = (0, path_1.$9d)(testdir, 'storage.db');
            let storage = new storage_2.$nT(storagePath);
            const items = new Map();
            items.set('foo', 'bar');
            items.set('some/foo/path', 'some/bar/path');
            items.set(JSON.stringify({ foo: 'bar' }), JSON.stringify({ bar: 'foo' }));
            await storage.updateItems({ insert: items });
            await storage.close();
            await pfs_1.Promises.writeFile(storagePath, 'This is now a broken DB');
            storage = new storage_2.$nT(storagePath);
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
            const storagePath = (0, path_1.$9d)(testdir, 'storage.db');
            let storage = new storage_2.$nT(storagePath);
            const items = new Map();
            items.set('foo', 'bar');
            items.set('some/foo/path', 'some/bar/path');
            items.set(JSON.stringify({ foo: 'bar' }), JSON.stringify({ bar: 'foo' }));
            await storage.updateItems({ insert: items });
            await storage.close();
            await pfs_1.Promises.writeFile(storagePath, 'This is now a broken DB');
            await pfs_1.Promises.writeFile(`${storagePath}.backup`, 'This is now also a broken DB');
            storage = new storage_2.$nT(storagePath);
            const storedItems = await storage.getItems();
            (0, assert_1.strictEqual)(storedItems.size, 0);
            await testDBBasics(storagePath);
        });
        (platform_1.$i ? test.skip /* Windows will fail to write to open DB due to locking */ : test)('basics (DB that becomes corrupt during runtime stores all state from cache on close)', async () => {
            const storagePath = (0, path_1.$9d)(testdir, 'storage.db');
            let storage = new storage_2.$nT(storagePath);
            const items = new Map();
            items.set('foo', 'bar');
            items.set('some/foo/path', 'some/bar/path');
            items.set(JSON.stringify({ foo: 'bar' }), JSON.stringify({ bar: 'foo' }));
            await storage.updateItems({ insert: items });
            await storage.close();
            const backupPath = `${storagePath}.backup`;
            (0, assert_1.strictEqual)(await pfs_1.Promises.exists(backupPath), true);
            storage = new storage_2.$nT(storagePath);
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
            storage = new storage_2.$nT(storagePath);
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
            let storage = new storage_2.$nT((0, path_1.$9d)(testdir, 'storage.db'));
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
            storage = new storage_2.$nT((0, path_1.$9d)(testdir, 'storage.db'));
            storedItems = await storage.getItems();
            (0, assert_1.strictEqual)(storedItems.size, items1.size + items2.size + items3.size);
            await storage.close();
        });
        test('very large item value', async function () {
            const storage = new storage_2.$nT((0, path_1.$9d)(testdir, 'storage.db'));
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
            return (0, timeTravelScheduler_1.$kT)({}, async () => {
                class TestStorage extends storage_1.$Ro {
                    getStorage() {
                        return this.r;
                    }
                }
                const storage = new TestStorage(new storage_2.$nT((0, path_1.$9d)(testdir, 'storage.db')));
                await storage.init();
                storage.set('foo', 'bar');
                storage.set('some/foo/path', 'some/bar/path');
                await (0, async_1.$Hg)(2);
                storage.set('foo1', 'bar');
                storage.set('some/foo1/path', 'some/bar/path');
                await (0, async_1.$Hg)(2);
                storage.set('foo2', 'bar');
                storage.set('some/foo2/path', 'some/bar/path');
                await (0, async_1.$Hg)(2);
                storage.delete('foo1');
                storage.delete('some/foo1/path');
                await (0, async_1.$Hg)(2);
                storage.delete('foo4');
                storage.delete('some/foo4/path');
                await (0, async_1.$Hg)(5);
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
            const storage = new storage_2.$nT((0, path_1.$9d)(testdir, 'storage.db'));
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
            const storage = new storage_2.$nT((0, path_1.$9d)(testdir, 'storage.db'));
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
            const storage = new storage_2.$nT((0, path_1.$9d)(testdir, 'nonexist', 'storage.db'));
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
            const dbPath = (0, path_1.$9d)(testdir, 'storage.db');
            let storage = new storage_2.$nT(dbPath);
            const { items, keys } = createManyRandomData(400, true);
            await storage.updateItems({ insert: items });
            let storedItems = await storage.getItems();
            (0, assert_1.strictEqual)(storedItems.size, items.size);
            await storage.optimize();
            await storage.close();
            const sizeBeforeDeleteAndOptimize = (await pfs_1.Promises.stat(dbPath)).size;
            storage = new storage_2.$nT(dbPath);
            storedItems = await storage.getItems();
            (0, assert_1.strictEqual)(storedItems.size, items.size);
            await storage.updateItems({ delete: keys });
            storedItems = await storage.getItems();
            (0, assert_1.strictEqual)(storedItems.size, 0);
            await storage.optimize();
            await storage.close();
            storage = new storage_2.$nT(dbPath);
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
                const uuid = (0, uuid_1.$4f)();
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
            const uuid = (0, uuid_1.$4f)();
            const value = [];
            for (let i = 0; i < 100000; i++) {
                value.push(uuid);
            }
            items.set('super.large.string', value.join()); // 3.6MB
            return { items, uuid, value };
        }
    });
});
//# sourceMappingURL=storage.integrationTest.js.map