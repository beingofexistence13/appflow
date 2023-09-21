/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/arrays", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/platform/log/common/log", "vs/workbench/contrib/testing/common/testResult", "vs/workbench/contrib/testing/common/testResultStorage", "vs/workbench/contrib/testing/test/common/testStubs", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, assert, arrays_1, lifecycle_1, utils_1, log_1, testResult_1, testResultStorage_1, testStubs_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Workbench - Test Result Storage', () => {
        let storage;
        let ds;
        const makeResult = (taskName = 't') => {
            const t = ds.add(new testResult_1.$2sb('', true, { targets: [] }));
            t.addTask({ id: taskName, name: undefined, running: true });
            const tests = ds.add(testStubs_1.$$fc.nested());
            tests.expand(tests.root.id, Infinity);
            t.addTestChainToRun('ctrlId', [
                tests.root.toTestItem(),
                tests.root.children.get('id-a').toTestItem(),
                tests.root.children.get('id-a').children.get('id-aa').toTestItem(),
            ]);
            t.markComplete();
            return t;
        };
        const assertStored = async (stored) => assert.deepStrictEqual((await storage.read()).map(r => r.id), stored.map(s => s.id));
        setup(async () => {
            ds = new lifecycle_1.$jc();
            storage = ds.add(new testResultStorage_1.$dtb(ds.add(new workbenchTestServices_1.$7dc()), new log_1.$fj()));
        });
        teardown(() => ds.dispose());
        (0, utils_1.$bT)();
        test('stores a single result', async () => {
            const r = (0, arrays_1.$Qb)(5).map(() => makeResult());
            await storage.persist(r);
            await assertStored(r);
        });
        test('deletes old results', async () => {
            const r = (0, arrays_1.$Qb)(5).map(() => makeResult());
            await storage.persist(r);
            const r2 = [makeResult(), ...r.slice(0, 3)];
            await storage.persist(r2);
            await assertStored(r2);
        });
        test('limits stored results', async () => {
            const r = (0, arrays_1.$Qb)(100).map(() => makeResult());
            await storage.persist(r);
            await assertStored(r.slice(0, testResultStorage_1.$atb));
        });
        test('limits stored result by budget', async () => {
            const r = (0, arrays_1.$Qb)(100).map(() => makeResult('a'.repeat(2048)));
            await storage.persist(r);
            const length = (await storage.read()).length;
            assert.strictEqual(true, length < 50);
        });
        test('always stores the min number of results', async () => {
            const r = (0, arrays_1.$Qb)(20).map(() => makeResult('a'.repeat(1024 * 10)));
            await storage.persist(r);
            await assertStored(r.slice(0, 16));
        });
        test('takes into account existing stored bytes', async () => {
            const r = (0, arrays_1.$Qb)(10).map(() => makeResult('a'.repeat(1024 * 10)));
            await storage.persist(r);
            await assertStored(r);
            const r2 = [...r, ...(0, arrays_1.$Qb)(10).map(() => makeResult('a'.repeat(1024 * 10)))];
            await storage.persist(r2);
            await assertStored(r2.slice(0, 16));
        });
    });
});
//# sourceMappingURL=testResultStorage.test.js.map