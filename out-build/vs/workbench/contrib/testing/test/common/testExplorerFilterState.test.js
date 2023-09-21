/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/platform/storage/common/storage", "vs/workbench/contrib/testing/common/testExplorerFilterState"], function (require, exports, assert, lifecycle_1, utils_1, storage_1, testExplorerFilterState_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('TestExplorerFilterState', () => {
        let t;
        let ds;
        teardown(() => {
            ds.dispose();
        });
        (0, utils_1.$bT)();
        setup(() => {
            ds = new lifecycle_1.$jc();
            t = ds.add(new testExplorerFilterState_1.$FKb(ds.add(new storage_1.$Zo())));
        });
        const assertFilteringFor = (expected) => {
            for (const [term, expectation] of Object.entries(expected)) {
                assert.strictEqual(t.isFilteringFor(term), expectation, `expected filtering for ${term} === ${expectation}`);
            }
        };
        const termFiltersOff = {
            ["@failed" /* TestFilterTerm.Failed */]: false,
            ["@executed" /* TestFilterTerm.Executed */]: false,
            ["@doc" /* TestFilterTerm.CurrentDoc */]: false,
            ["@hidden" /* TestFilterTerm.Hidden */]: false,
        };
        test('filters simple globs', () => {
            t.setText('hello, !world');
            assert.deepStrictEqual(t.globList, [{ text: 'hello', include: true }, { text: 'world', include: false }]);
            assert.deepStrictEqual(t.includeTags, new Set());
            assert.deepStrictEqual(t.excludeTags, new Set());
            assertFilteringFor(termFiltersOff);
        });
        test('filters to patterns', () => {
            t.setText('@doc');
            assert.deepStrictEqual(t.globList, []);
            assert.deepStrictEqual(t.includeTags, new Set());
            assert.deepStrictEqual(t.excludeTags, new Set());
            assertFilteringFor({
                ...termFiltersOff,
                ["@doc" /* TestFilterTerm.CurrentDoc */]: true,
            });
        });
        test('filters to tags', () => {
            t.setText('@hello:world !@foo:bar');
            assert.deepStrictEqual(t.globList, []);
            assert.deepStrictEqual(t.includeTags, new Set(['hello\0world']));
            assert.deepStrictEqual(t.excludeTags, new Set(['foo\0bar']));
            assertFilteringFor(termFiltersOff);
        });
        test('filters to mixed terms and tags', () => {
            t.setText('@hello:world foo, !bar @doc !@foo:bar');
            assert.deepStrictEqual(t.globList, [{ text: 'foo', include: true }, { text: 'bar', include: false }]);
            assert.deepStrictEqual(t.includeTags, new Set(['hello\0world']));
            assert.deepStrictEqual(t.excludeTags, new Set(['foo\0bar']));
            assertFilteringFor({
                ...termFiltersOff,
                ["@doc" /* TestFilterTerm.CurrentDoc */]: true,
            });
        });
        test('parses quotes', () => {
            t.setText('@hello:"world" @foo:\'bar\' baz');
            assert.deepStrictEqual(t.globList, [{ text: 'baz', include: true }]);
            assert.deepStrictEqual([...t.includeTags], ['hello\0world', 'foo\0bar']);
            assert.deepStrictEqual(t.excludeTags, new Set());
        });
        test('parses quotes with escapes', () => {
            t.setText('@hello:"world\\"1" foo');
            assert.deepStrictEqual(t.globList, [{ text: 'foo', include: true }]);
            assert.deepStrictEqual([...t.includeTags], ['hello\0world"1']);
            assert.deepStrictEqual(t.excludeTags, new Set());
        });
    });
});
//# sourceMappingURL=testExplorerFilterState.test.js.map