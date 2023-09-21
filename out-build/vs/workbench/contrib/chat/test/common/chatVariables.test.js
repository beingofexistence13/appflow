/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/cancellation", "vs/base/test/common/utils", "vs/workbench/contrib/chat/common/chatVariables"], function (require, exports, assert, cancellation_1, utils_1, chatVariables_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ChatVariables', function () {
        let service;
        setup(function () {
            service = new chatVariables_1.$EH();
        });
        (0, utils_1.$bT)();
        test('ChatVariables - resolveVariables', async function () {
            const v1 = service.registerVariable({ name: 'foo', description: 'bar' }, async () => ([{ level: 'full', value: 'farboo' }]));
            const v2 = service.registerVariable({ name: 'far', description: 'boo' }, async () => ([{ level: 'full', value: 'farboo' }]));
            {
                const data = await service.resolveVariables('Hello @foo and@far', null, cancellation_1.CancellationToken.None);
                assert.strictEqual(Object.keys(data.variables).length, 1);
                assert.deepEqual(Object.keys(data.variables).sort(), ['foo']);
                assert.strictEqual(data.prompt, 'Hello [@foo](values:foo) and@far');
            }
            {
                const data = await service.resolveVariables('@foo Hello', null, cancellation_1.CancellationToken.None);
                assert.strictEqual(Object.keys(data.variables).length, 1);
                assert.deepEqual(Object.keys(data.variables).sort(), ['foo']);
                assert.strictEqual(data.prompt, '[@foo](values:foo) Hello');
            }
            {
                const data = await service.resolveVariables('Hello @foo', null, cancellation_1.CancellationToken.None);
                assert.strictEqual(Object.keys(data.variables).length, 1);
                assert.deepEqual(Object.keys(data.variables).sort(), ['foo']);
            }
            {
                const data = await service.resolveVariables('Hello @foo?', null, cancellation_1.CancellationToken.None);
                assert.strictEqual(Object.keys(data.variables).length, 1);
                assert.deepEqual(Object.keys(data.variables).sort(), ['foo']);
                assert.strictEqual(data.prompt, 'Hello [@foo](values:foo)?');
            }
            {
                const data = await service.resolveVariables('Hello @foo and@far @foo', null, cancellation_1.CancellationToken.None);
                assert.strictEqual(Object.keys(data.variables).length, 1);
                assert.deepEqual(Object.keys(data.variables).sort(), ['foo']);
            }
            {
                const data = await service.resolveVariables('Hello @foo and @far @foo', null, cancellation_1.CancellationToken.None);
                assert.strictEqual(Object.keys(data.variables).length, 2);
                assert.deepEqual(Object.keys(data.variables).sort(), ['far', 'foo']);
            }
            {
                const data = await service.resolveVariables('Hello @foo and @far @foo @unknown', null, cancellation_1.CancellationToken.None);
                assert.strictEqual(Object.keys(data.variables).length, 2);
                assert.deepEqual(Object.keys(data.variables).sort(), ['far', 'foo']);
                assert.strictEqual(data.prompt, 'Hello [@foo](values:foo) and [@far](values:far) [@foo](values:foo) @unknown');
            }
            v1.dispose();
            v2.dispose();
        });
    });
});
//# sourceMappingURL=chatVariables.test.js.map