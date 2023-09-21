/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "sinon", "vs/base/common/event", "vs/workbench/contrib/terminalContrib/typeAhead/browser/terminalTypeAheadAddon", "vs/workbench/contrib/terminal/common/terminal", "vs/platform/configuration/test/common/testConfigurationService", "vs/base/test/common/utils", "vs/base/common/lifecycle"], function (require, exports, assert, sinon_1, event_1, terminalTypeAheadAddon_1, terminal_1, testConfigurationService_1, utils_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const CSI = `\x1b[`;
    var CursorMoveDirection;
    (function (CursorMoveDirection) {
        CursorMoveDirection["Back"] = "D";
        CursorMoveDirection["Forwards"] = "C";
    })(CursorMoveDirection || (CursorMoveDirection = {}));
    suite('Workbench - Terminal Typeahead', () => {
        const ds = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        suite('PredictionStats', () => {
            let stats;
            let add;
            let succeed;
            let fail;
            setup(() => {
                add = ds.add(new event_1.Emitter());
                succeed = ds.add(new event_1.Emitter());
                fail = ds.add(new event_1.Emitter());
                stats = ds.add(new terminalTypeAheadAddon_1.PredictionStats({
                    onPredictionAdded: add.event,
                    onPredictionSucceeded: succeed.event,
                    onPredictionFailed: fail.event,
                }));
            });
            test('creates sane data', () => {
                const stubs = createPredictionStubs(5);
                const clock = (0, sinon_1.useFakeTimers)();
                try {
                    for (const s of stubs) {
                        add.fire(s);
                    }
                    for (let i = 0; i < stubs.length; i++) {
                        clock.tick(100);
                        (i % 2 ? fail : succeed).fire(stubs[i]);
                    }
                    assert.strictEqual(stats.accuracy, 3 / 5);
                    assert.strictEqual(stats.sampleSize, 5);
                    assert.deepStrictEqual(stats.latency, {
                        count: 3,
                        min: 100,
                        max: 500,
                        median: 300
                    });
                }
                finally {
                    clock.restore();
                }
            });
            test('circular buffer', () => {
                const bufferSize = 24;
                const stubs = createPredictionStubs(bufferSize * 2);
                for (const s of stubs.slice(0, bufferSize)) {
                    add.fire(s);
                    succeed.fire(s);
                }
                assert.strictEqual(stats.accuracy, 1);
                for (const s of stubs.slice(bufferSize, bufferSize * 3 / 2)) {
                    add.fire(s);
                    fail.fire(s);
                }
                assert.strictEqual(stats.accuracy, 0.5);
                for (const s of stubs.slice(bufferSize * 3 / 2)) {
                    add.fire(s);
                    fail.fire(s);
                }
                assert.strictEqual(stats.accuracy, 0);
            });
        });
        suite('timeline', () => {
            let onBeforeProcessData;
            let publicLog;
            let config;
            let addon;
            const predictedHelloo = [
                `${CSI}?25l`,
                `${CSI}2;7H`,
                'o',
                `${CSI}2;8H`,
                `${CSI}?25h`, // show cursor
            ].join('');
            const expectProcessed = (input, output) => {
                const evt = { data: input };
                onBeforeProcessData.fire(evt);
                assert.strictEqual(JSON.stringify(evt.data), JSON.stringify(output));
            };
            setup(() => {
                onBeforeProcessData = ds.add(new event_1.Emitter());
                config = upcastPartial({
                    localEchoStyle: 'italic',
                    localEchoLatencyThreshold: 0,
                    localEchoExcludePrograms: terminal_1.DEFAULT_LOCAL_ECHO_EXCLUDE,
                });
                publicLog = (0, sinon_1.stub)();
                addon = new TestTypeAheadAddon(upcastPartial({ onBeforeProcessData: onBeforeProcessData.event }), new testConfigurationService_1.TestConfigurationService({ terminal: { integrated: { ...config } } }), upcastPartial({ publicLog }));
                addon.unlockMakingPredictions();
            });
            teardown(() => {
                addon.dispose();
            });
            test('predicts a single character', () => {
                const t = ds.add(createMockTerminal({ lines: ['hello|'] }));
                addon.activate(t.terminal);
                t.onData('o');
                t.expectWritten(`${CSI}3mo${CSI}23m`);
            });
            test('validates character prediction', () => {
                const t = ds.add(createMockTerminal({ lines: ['hello|'] }));
                addon.activate(t.terminal);
                t.onData('o');
                expectProcessed('o', predictedHelloo);
                assert.strictEqual(addon.stats?.accuracy, 1);
            });
            test('validates zsh prediction (#112842)', () => {
                const t = ds.add(createMockTerminal({ lines: ['hello|'] }));
                addon.activate(t.terminal);
                t.onData('o');
                expectProcessed('o', predictedHelloo);
                t.onData('x');
                expectProcessed('\box', [
                    `${CSI}?25l`,
                    `${CSI}2;8H`,
                    '\box',
                    `${CSI}2;9H`,
                    `${CSI}?25h`, // show cursor
                ].join(''));
                assert.strictEqual(addon.stats?.accuracy, 1);
            });
            test('does not validate zsh prediction on differing lookbehindn (#112842)', () => {
                const t = ds.add(createMockTerminal({ lines: ['hello|'] }));
                addon.activate(t.terminal);
                t.onData('o');
                expectProcessed('o', predictedHelloo);
                t.onData('x');
                expectProcessed('\bqx', [
                    `${CSI}?25l`,
                    `${CSI}2;8H`,
                    `${CSI}X`,
                    `${CSI}0m`,
                    '\bqx',
                    `${CSI}?25h`, // show cursor
                ].join(''));
                assert.strictEqual(addon.stats?.accuracy, 0.5);
            });
            test('rolls back character prediction', () => {
                const t = ds.add(createMockTerminal({ lines: ['hello|'] }));
                addon.activate(t.terminal);
                t.onData('o');
                expectProcessed('q', [
                    `${CSI}?25l`,
                    `${CSI}2;7H`,
                    `${CSI}X`,
                    `${CSI}0m`,
                    'q',
                    `${CSI}?25h`, // show cursor
                ].join(''));
                assert.strictEqual(addon.stats?.accuracy, 0);
            });
            test('handles left arrow when we hit the boundary', () => {
                const t = ds.add(createMockTerminal({ lines: ['|'] }));
                addon.activate(t.terminal);
                addon.unlockNavigating();
                const cursorXBefore = addon.physicalCursor(t.terminal.buffer.active)?.x;
                t.onData(`${CSI}${"D" /* CursorMoveDirection.Back */}`);
                t.expectWritten('');
                // Trigger rollback because we don't expect this data
                onBeforeProcessData.fire({ data: 'xy' });
                assert.strictEqual(addon.physicalCursor(t.terminal.buffer.active)?.x, 
                // The cursor should not have changed because we've hit the
                // boundary (start of prompt)
                cursorXBefore);
            });
            test('handles right arrow when we hit the boundary', () => {
                const t = ds.add(createMockTerminal({ lines: ['|'] }));
                addon.activate(t.terminal);
                addon.unlockNavigating();
                const cursorXBefore = addon.physicalCursor(t.terminal.buffer.active)?.x;
                t.onData(`${CSI}${"C" /* CursorMoveDirection.Forwards */}`);
                t.expectWritten('');
                // Trigger rollback because we don't expect this data
                onBeforeProcessData.fire({ data: 'xy' });
                assert.strictEqual(addon.physicalCursor(t.terminal.buffer.active)?.x, 
                // The cursor should not have changed because we've hit the
                // boundary (end of prompt)
                cursorXBefore);
            });
            test('internal cursor state is reset when all predictions are undone', () => {
                const t = ds.add(createMockTerminal({ lines: ['|'] }));
                addon.activate(t.terminal);
                addon.unlockNavigating();
                const cursorXBefore = addon.physicalCursor(t.terminal.buffer.active)?.x;
                t.onData(`${CSI}${"D" /* CursorMoveDirection.Back */}`);
                t.expectWritten('');
                addon.undoAllPredictions();
                assert.strictEqual(addon.physicalCursor(t.terminal.buffer.active)?.x, 
                // The cursor should not have changed because we've hit the
                // boundary (start of prompt)
                cursorXBefore);
            });
            test('restores cursor graphics mode', () => {
                const t = ds.add(createMockTerminal({
                    lines: ['hello|'],
                    cursorAttrs: { isAttributeDefault: false, isBold: true, isFgPalette: true, getFgColor: 1 },
                }));
                addon.activate(t.terminal);
                t.onData('o');
                expectProcessed('q', [
                    `${CSI}?25l`,
                    `${CSI}2;7H`,
                    `${CSI}X`,
                    `${CSI}1;38;5;1m`,
                    'q',
                    `${CSI}?25h`, // show cursor
                ].join(''));
                assert.strictEqual(addon.stats?.accuracy, 0);
            });
            test('validates against and applies graphics mode on predicted', () => {
                const t = ds.add(createMockTerminal({ lines: ['hello|'] }));
                addon.activate(t.terminal);
                t.onData('o');
                expectProcessed(`${CSI}4mo`, [
                    `${CSI}?25l`,
                    `${CSI}2;7H`,
                    `${CSI}4m`,
                    'o',
                    `${CSI}2;8H`,
                    `${CSI}?25h`, // show cursor
                ].join(''));
                assert.strictEqual(addon.stats?.accuracy, 1);
            });
            test('ignores cursor hides or shows', () => {
                const t = ds.add(createMockTerminal({ lines: ['hello|'] }));
                addon.activate(t.terminal);
                t.onData('o');
                expectProcessed(`${CSI}?25lo${CSI}?25h`, [
                    `${CSI}?25l`,
                    `${CSI}?25l`,
                    `${CSI}2;7H`,
                    'o',
                    `${CSI}?25h`,
                    `${CSI}2;8H`,
                    `${CSI}?25h`, // show cursor
                ].join(''));
                assert.strictEqual(addon.stats?.accuracy, 1);
            });
            test('matches backspace at EOL (bash style)', () => {
                const t = ds.add(createMockTerminal({ lines: ['hello|'] }));
                addon.activate(t.terminal);
                t.onData('\x7F');
                expectProcessed(`\b${CSI}K`, `\b${CSI}K`);
                assert.strictEqual(addon.stats?.accuracy, 1);
            });
            test('matches backspace at EOL (zsh style)', () => {
                const t = ds.add(createMockTerminal({ lines: ['hello|'] }));
                addon.activate(t.terminal);
                t.onData('\x7F');
                expectProcessed('\b \b', '\b \b');
                assert.strictEqual(addon.stats?.accuracy, 1);
            });
            test('gradually matches backspace', () => {
                const t = ds.add(createMockTerminal({ lines: ['hello|'] }));
                addon.activate(t.terminal);
                t.onData('\x7F');
                expectProcessed('\b', '');
                expectProcessed(' \b', '\b \b');
                assert.strictEqual(addon.stats?.accuracy, 1);
            });
            test('restores old character after invalid backspace', () => {
                const t = ds.add(createMockTerminal({ lines: ['hel|lo'] }));
                addon.activate(t.terminal);
                addon.unlockNavigating();
                t.onData('\x7F');
                t.expectWritten(`${CSI}2;4H${CSI}X`);
                expectProcessed('x', `${CSI}?25l${CSI}0ml${CSI}2;5H${CSI}0mx${CSI}?25h`);
                assert.strictEqual(addon.stats?.accuracy, 0);
            });
            test('waits for validation before deleting to left of cursor', () => {
                const t = ds.add(createMockTerminal({ lines: ['hello|'] }));
                addon.activate(t.terminal);
                // initially should not backspace (until the server confirms it)
                t.onData('\x7F');
                t.expectWritten('');
                expectProcessed('\b \b', '\b \b');
                t.cursor.x--;
                // enter input on the column...
                t.onData('o');
                onBeforeProcessData.fire({ data: 'o' });
                t.cursor.x++;
                t.clearWritten();
                // now that the column is 'unlocked', we should be able to predict backspace on it
                t.onData('\x7F');
                t.expectWritten(`${CSI}2;6H${CSI}X`);
            });
            test('waits for first valid prediction on a line', () => {
                const t = ds.add(createMockTerminal({ lines: ['hello|'] }));
                addon.lockMakingPredictions();
                addon.activate(t.terminal);
                t.onData('o');
                t.expectWritten('');
                expectProcessed('o', 'o');
                t.onData('o');
                t.expectWritten(`${CSI}3mo${CSI}23m`);
            });
            test('disables on title change', () => {
                const t = ds.add(createMockTerminal({ lines: ['hello|'] }));
                addon.activate(t.terminal);
                addon.reevaluateNow();
                assert.strictEqual(addon.isShowing, true, 'expected to show initially');
                t.onTitleChange.fire('foo - VIM.exe');
                addon.reevaluateNow();
                assert.strictEqual(addon.isShowing, false, 'expected to hide when vim is open');
                t.onTitleChange.fire('foo - git.exe');
                addon.reevaluateNow();
                assert.strictEqual(addon.isShowing, true, 'expected to show again after vim closed');
            });
            test('adds line wrap prediction even if behind a boundary', () => {
                const t = ds.add(createMockTerminal({ lines: ['hello|'] }));
                addon.lockMakingPredictions();
                addon.activate(t.terminal);
                t.onData('hi'.repeat(50));
                t.expectWritten('');
                expectProcessed('hi', [
                    `${CSI}?25l`,
                    'hi',
                    ...new Array(36).fill(`${CSI}3mh${CSI}23m${CSI}3mi${CSI}23m`),
                    `${CSI}2;81H`,
                    `${CSI}?25h`
                ].join(''));
            });
        });
    });
    class TestTypeAheadAddon extends terminalTypeAheadAddon_1.TypeAheadAddon {
        unlockMakingPredictions() {
            this._lastRow = { y: 1, startingX: 100, endingX: 100, charState: 2 /* CharPredictState.Validated */ };
        }
        lockMakingPredictions() {
            this._lastRow = undefined;
        }
        unlockNavigating() {
            this._lastRow = { y: 1, startingX: 1, endingX: 1, charState: 2 /* CharPredictState.Validated */ };
        }
        reevaluateNow() {
            this._reevaluatePredictorStateNow(this.stats, this._timeline);
        }
        get isShowing() {
            return !!this._timeline?.isShowingPredictions;
        }
        undoAllPredictions() {
            this._timeline?.undoAllPredictions();
        }
        physicalCursor(buffer) {
            return this._timeline?.physicalCursor(buffer);
        }
        tentativeCursor(buffer) {
            return this._timeline?.tentativeCursor(buffer);
        }
    }
    function upcastPartial(v) {
        return v;
    }
    function createPredictionStubs(n) {
        return new Array(n).fill(0).map(stubPrediction);
    }
    function stubPrediction() {
        return {
            apply: () => '',
            rollback: () => '',
            matches: () => 0,
            rollForwards: () => '',
        };
    }
    function createMockTerminal({ lines, cursorAttrs }) {
        const ds = new lifecycle_1.DisposableStore();
        const written = [];
        const cursor = { y: 1, x: 1 };
        const onTitleChange = ds.add(new event_1.Emitter());
        const onData = ds.add(new event_1.Emitter());
        const csiEmitter = ds.add(new event_1.Emitter());
        for (let y = 0; y < lines.length; y++) {
            const line = lines[y];
            if (line.includes('|')) {
                cursor.y = y + 1;
                cursor.x = line.indexOf('|') + 1;
                lines[y] = line.replace('|', ''); // CodeQL [SM02383] replacing the first occurrence is intended
                break;
            }
        }
        return {
            written,
            cursor,
            expectWritten: (s) => {
                assert.strictEqual(JSON.stringify(written.join('')), JSON.stringify(s));
                written.splice(0, written.length);
            },
            clearWritten: () => written.splice(0, written.length),
            onData: (s) => onData.fire(s),
            csiEmitter,
            onTitleChange,
            dispose: () => ds.dispose(),
            terminal: {
                cols: 80,
                rows: 5,
                onResize: new event_1.Emitter().event,
                onData: onData.event,
                onTitleChange: onTitleChange.event,
                parser: {
                    registerCsiHandler(_, callback) {
                        ds.add(csiEmitter.event(callback));
                    },
                },
                write(line) {
                    written.push(line);
                },
                _core: {
                    _inputHandler: {
                        _curAttrData: mockCell('', cursorAttrs)
                    },
                    writeSync() {
                    }
                },
                buffer: {
                    active: {
                        type: 'normal',
                        baseY: 0,
                        get cursorY() { return cursor.y; },
                        get cursorX() { return cursor.x; },
                        getLine(y) {
                            const s = lines[y - 1] || '';
                            return {
                                length: s.length,
                                getCell: (x) => mockCell(s[x - 1] || ''),
                                translateToString: (trim, start = 0, end = s.length) => {
                                    const out = s.slice(start, end);
                                    return trim ? out.trimRight() : out;
                                },
                            };
                        },
                    }
                }
            }
        };
    }
    function mockCell(char, attrs = {}) {
        return new Proxy({}, {
            get(_, prop) {
                if (typeof prop === 'string' && attrs.hasOwnProperty(prop)) {
                    return () => attrs[prop];
                }
                switch (prop) {
                    case 'getWidth':
                        return () => 1;
                    case 'getChars':
                        return () => char;
                    case 'getCode':
                        return () => char.charCodeAt(0) || 0;
                    case 'isAttributeDefault':
                        return () => true;
                    default:
                        return String(prop).startsWith('is') ? (() => false) : (() => 0);
                }
            },
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxUeXBlQWhlYWQudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsQ29udHJpYi90eXBlQWhlYWQvdGVzdC9icm93c2VyL3Rlcm1pbmFsVHlwZUFoZWFkLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFhaEcsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDO0lBRXBCLElBQVcsbUJBR1Y7SUFIRCxXQUFXLG1CQUFtQjtRQUM3QixpQ0FBVSxDQUFBO1FBQ1YscUNBQWMsQ0FBQTtJQUNmLENBQUMsRUFIVSxtQkFBbUIsS0FBbkIsbUJBQW1CLFFBRzdCO0lBRUQsS0FBSyxDQUFDLGdDQUFnQyxFQUFFLEdBQUcsRUFBRTtRQUM1QyxNQUFNLEVBQUUsR0FBRyxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFckQsS0FBSyxDQUFDLGlCQUFpQixFQUFFLEdBQUcsRUFBRTtZQUM3QixJQUFJLEtBQXNCLENBQUM7WUFDM0IsSUFBSSxHQUF5QixDQUFDO1lBQzlCLElBQUksT0FBNkIsQ0FBQztZQUNsQyxJQUFJLElBQTBCLENBQUM7WUFFL0IsS0FBSyxDQUFDLEdBQUcsRUFBRTtnQkFDVixHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLGVBQU8sRUFBZSxDQUFDLENBQUM7Z0JBQ3pDLE9BQU8sR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksZUFBTyxFQUFlLENBQUMsQ0FBQztnQkFDN0MsSUFBSSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxlQUFPLEVBQWUsQ0FBQyxDQUFDO2dCQUUxQyxLQUFLLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLHdDQUFlLENBQUM7b0JBQ2xDLGlCQUFpQixFQUFFLEdBQUcsQ0FBQyxLQUFLO29CQUM1QixxQkFBcUIsRUFBRSxPQUFP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