/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/async", "vs/base/test/common/utils", "vs/workbench/contrib/debug/test/common/mockDebug"], function (require, exports, assert, async_1, utils_1, mockDebug_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Debug - AbstractDebugAdapter', () => {
        (0, utils_1.$bT)();
        suite('event ordering', () => {
            let adapter;
            let output;
            setup(() => {
                adapter = new mockDebug_1.$rfc();
                output = [];
                adapter.onEvent(ev => {
                    output.push(ev.body.output);
                    Promise.resolve().then(() => output.push('--end microtask--'));
                });
            });
            const evaluate = async (expression) => {
                await new Promise(resolve => adapter.sendRequest('evaluate', { expression }, resolve));
                output.push(`=${expression}`);
                Promise.resolve().then(() => output.push('--end microtask--'));
            };
            test('inserts task boundary before response', async () => {
                await evaluate('before.foo');
                await (0, async_1.$Hg)(0);
                assert.deepStrictEqual(output, ['before.foo', '--end microtask--', '=before.foo', '--end microtask--']);
            });
            test('inserts task boundary after response', async () => {
                await evaluate('after.foo');
                await (0, async_1.$Hg)(0);
                assert.deepStrictEqual(output, ['=after.foo', '--end microtask--', 'after.foo', '--end microtask--']);
            });
            test('does not insert boundaries between events', async () => {
                adapter.sendEventBody('output', { output: 'a' });
                adapter.sendEventBody('output', { output: 'b' });
                adapter.sendEventBody('output', { output: 'c' });
                await (0, async_1.$Hg)(0);
                assert.deepStrictEqual(output, ['a', 'b', 'c', '--end microtask--', '--end microtask--', '--end microtask--']);
            });
        });
    });
});
//# sourceMappingURL=abstractDebugAdapter.test.js.map