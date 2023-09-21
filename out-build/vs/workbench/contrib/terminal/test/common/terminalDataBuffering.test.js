/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/base/test/common/utils", "vs/platform/terminal/common/terminalDataBuffering"], function (require, exports, assert, event_1, utils_1, terminalDataBuffering_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    suite('Workbench - TerminalDataBufferer', () => {
        const store = (0, utils_1.$bT)();
        let bufferer;
        let counter;
        let data;
        setup(async () => {
            counter = {};
            data = {};
            bufferer = store.add(new terminalDataBuffering_1.$Skb((id, e) => {
                if (!(id in counter)) {
                    counter[id] = 0;
                }
                counter[id]++;
                if (!(id in data)) {
                    data[id] = '';
                }
                data[id] = e;
            }));
        });
        test('start', async () => {
            const terminalOnData = new event_1.$fd();
            store.add(bufferer.startBuffering(1, terminalOnData.event, 0));
            terminalOnData.fire('1');
            terminalOnData.fire('2');
            terminalOnData.fire('3');
            await wait(0);
            terminalOnData.fire('4');
            assert.strictEqual(counter[1], 1);
            assert.strictEqual(data[1], '123');
            await wait(0);
            assert.strictEqual(counter[1], 2);
            assert.strictEqual(data[1], '4');
        });
        test('start 2', async () => {
            const terminal1OnData = new event_1.$fd();
            const terminal2OnData = new event_1.$fd();
            store.add(bufferer.startBuffering(1, terminal1OnData.event, 0));
            store.add(bufferer.startBuffering(2, terminal2OnData.event, 0));
            terminal1OnData.fire('1');
            terminal2OnData.fire('4');
            terminal1OnData.fire('2');
            terminal2OnData.fire('5');
            terminal1OnData.fire('3');
            terminal2OnData.fire('6');
            terminal2OnData.fire('7');
            assert.strictEqual(counter[1], undefined);
            assert.strictEqual(data[1], undefined);
            assert.strictEqual(counter[2], undefined);
            assert.strictEqual(data[2], undefined);
            await wait(0);
            assert.strictEqual(counter[1], 1);
            assert.strictEqual(data[1], '123');
            assert.strictEqual(counter[2], 1);
            assert.strictEqual(data[2], '4567');
        });
        test('stop', async () => {
            const terminalOnData = new event_1.$fd();
            bufferer.startBuffering(1, terminalOnData.event, 0);
            terminalOnData.fire('1');
            terminalOnData.fire('2');
            terminalOnData.fire('3');
            bufferer.stopBuffering(1);
            await wait(0);
            assert.strictEqual(counter[1], 1);
            assert.strictEqual(data[1], '123');
        });
        test('start 2 stop 1', async () => {
            const terminal1OnData = new event_1.$fd();
            const terminal2OnData = new event_1.$fd();
            bufferer.startBuffering(1, terminal1OnData.event, 0);
            store.add(bufferer.startBuffering(2, terminal2OnData.event, 0));
            terminal1OnData.fire('1');
            terminal2OnData.fire('4');
            terminal1OnData.fire('2');
            terminal2OnData.fire('5');
            terminal1OnData.fire('3');
            terminal2OnData.fire('6');
            terminal2OnData.fire('7');
            assert.strictEqual(counter[1], undefined);
            assert.strictEqual(data[1], undefined);
            assert.strictEqual(counter[2], undefined);
            assert.strictEqual(data[2], undefined);
            bufferer.stopBuffering(1);
            await wait(0);
            assert.strictEqual(counter[1], 1);
            assert.strictEqual(data[1], '123');
            assert.strictEqual(counter[2], 1);
            assert.strictEqual(data[2], '4567');
        });
        test('dispose should flush remaining data events', async () => {
            const terminal1OnData = new event_1.$fd();
            const terminal2OnData = new event_1.$fd();
            store.add(bufferer.startBuffering(1, terminal1OnData.event, 0));
            store.add(bufferer.startBuffering(2, terminal2OnData.event, 0));
            terminal1OnData.fire('1');
            terminal2OnData.fire('4');
            terminal1OnData.fire('2');
            terminal2OnData.fire('5');
            terminal1OnData.fire('3');
            terminal2OnData.fire('6');
            terminal2OnData.fire('7');
            assert.strictEqual(counter[1], undefined);
            assert.strictEqual(data[1], undefined);
            assert.strictEqual(counter[2], undefined);
            assert.strictEqual(data[2], undefined);
            bufferer.dispose();
            await wait(0);
            assert.strictEqual(counter[1], 1);
            assert.strictEqual(data[1], '123');
            assert.strictEqual(counter[2], 1);
            assert.strictEqual(data[2], '4567');
        });
    });
});
//# sourceMappingURL=terminalDataBuffering.test.js.map