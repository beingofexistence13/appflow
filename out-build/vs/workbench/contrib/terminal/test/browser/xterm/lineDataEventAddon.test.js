/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/terminal/browser/xterm/lineDataEventAddon", "assert", "vs/amdX", "vs/workbench/contrib/terminal/browser/terminalTestHelpers", "vs/base/test/common/utils", "vs/base/common/lifecycle"], function (require, exports, lineDataEventAddon_1, assert_1, amdX_1, terminalTestHelpers_1, utils_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('LineDataEventAddon', () => {
        let xterm;
        let lineDataEventAddon;
        let store;
        setup(() => store = new lifecycle_1.$jc());
        teardown(() => store.dispose());
        (0, utils_1.$bT)();
        suite('onLineData', () => {
            let events;
            setup(async () => {
                const TerminalCtor = (await (0, amdX_1.$aD)('xterm', 'lib/xterm.js')).Terminal;
                xterm = store.add(new TerminalCtor({ allowProposedApi: true, cols: 4 }));
                lineDataEventAddon = store.add(new lineDataEventAddon_1.$0Vb());
                xterm.loadAddon(lineDataEventAddon);
                events = [];
                store.add(lineDataEventAddon.onLineData(e => events.push(e)));
            });
            test('should fire when a non-wrapped line ends with a line feed', async () => {
                await (0, terminalTestHelpers_1.$Wfc)(xterm, 'foo');
                (0, assert_1.deepStrictEqual)(events, []);
                await (0, terminalTestHelpers_1.$Wfc)(xterm, '\n\r');
                (0, assert_1.deepStrictEqual)(events, ['foo']);
                await (0, terminalTestHelpers_1.$Wfc)(xterm, 'bar');
                (0, assert_1.deepStrictEqual)(events, ['foo']);
                await (0, terminalTestHelpers_1.$Wfc)(xterm, '\n');
                (0, assert_1.deepStrictEqual)(events, ['foo', 'bar']);
            });
            test('should not fire soft wrapped lines', async () => {
                await (0, terminalTestHelpers_1.$Wfc)(xterm, 'foo.');
                (0, assert_1.deepStrictEqual)(events, []);
                await (0, terminalTestHelpers_1.$Wfc)(xterm, 'bar.');
                (0, assert_1.deepStrictEqual)(events, []);
                await (0, terminalTestHelpers_1.$Wfc)(xterm, 'baz.');
                (0, assert_1.deepStrictEqual)(events, []);
            });
            test('should fire when a wrapped line ends with a line feed', async () => {
                await (0, terminalTestHelpers_1.$Wfc)(xterm, 'foo.bar.baz.');
                (0, assert_1.deepStrictEqual)(events, []);
                await (0, terminalTestHelpers_1.$Wfc)(xterm, '\n\r');
                (0, assert_1.deepStrictEqual)(events, ['foo.bar.baz.']);
            });
            test('should not fire on cursor move when the backing process is not on Windows', async () => {
                await (0, terminalTestHelpers_1.$Wfc)(xterm, 'foo.\x1b[H');
                (0, assert_1.deepStrictEqual)(events, []);
            });
            test('should fire on cursor move when the backing process is on Windows', async () => {
                lineDataEventAddon.setOperatingSystem(1 /* OperatingSystem.Windows */);
                await (0, terminalTestHelpers_1.$Wfc)(xterm, 'foo\x1b[H');
                (0, assert_1.deepStrictEqual)(events, ['foo']);
            });
        });
    });
});
//# sourceMappingURL=lineDataEventAddon.test.js.map