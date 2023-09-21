/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/platform/terminal/common/capabilities/terminalCapabilityStore"], function (require, exports, assert_1, lifecycle_1, utils_1, terminalCapabilityStore_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('TerminalCapabilityStore', () => {
        let store;
        let addEvents;
        let removeEvents;
        setup(() => {
            store = new terminalCapabilityStore_1.TerminalCapabilityStore();
            store.onDidAddCapabilityType(e => addEvents.push(e));
            store.onDidRemoveCapabilityType(e => removeEvents.push(e));
            addEvents = [];
            removeEvents = [];
        });
        teardown(() => store.dispose());
        test('should fire events when capabilities are added', () => {
            assertEvents(addEvents, []);
            store.add(0 /* TerminalCapability.CwdDetection */, {});
            assertEvents(addEvents, [0 /* TerminalCapability.CwdDetection */]);
        });
        test('should fire events when capabilities are removed', async () => {
            assertEvents(removeEvents, []);
            store.add(0 /* TerminalCapability.CwdDetection */, {});
            assertEvents(removeEvents, []);
            store.remove(0 /* TerminalCapability.CwdDetection */);
            assertEvents(removeEvents, [0 /* TerminalCapability.CwdDetection */]);
        });
        test('has should return whether a capability is present', () => {
            (0, assert_1.deepStrictEqual)(store.has(0 /* TerminalCapability.CwdDetection */), false);
            store.add(0 /* TerminalCapability.CwdDetection */, {});
            (0, assert_1.deepStrictEqual)(store.has(0 /* TerminalCapability.CwdDetection */), true);
            store.remove(0 /* TerminalCapability.CwdDetection */);
            (0, assert_1.deepStrictEqual)(store.has(0 /* TerminalCapability.CwdDetection */), false);
        });
        test('items should reflect current state', () => {
            (0, assert_1.deepStrictEqual)(Array.from(store.items), []);
            store.add(0 /* TerminalCapability.CwdDetection */, {});
            (0, assert_1.deepStrictEqual)(Array.from(store.items), [0 /* TerminalCapability.CwdDetection */]);
            store.add(1 /* TerminalCapability.NaiveCwdDetection */, {});
            (0, assert_1.deepStrictEqual)(Array.from(store.items), [0 /* TerminalCapability.CwdDetection */, 1 /* TerminalCapability.NaiveCwdDetection */]);
            store.remove(0 /* TerminalCapability.CwdDetection */);
            (0, assert_1.deepStrictEqual)(Array.from(store.items), [1 /* TerminalCapability.NaiveCwdDetection */]);
        });
    });
    suite('TerminalCapabilityStoreMultiplexer', () => {
        let store;
        let multiplexer;
        let store1;
        let store2;
        let addEvents;
        let removeEvents;
        setup(() => {
            store = new lifecycle_1.DisposableStore();
            multiplexer = store.add(new terminalCapabilityStore_1.TerminalCapabilityStoreMultiplexer());
            multiplexer.onDidAddCapabilityType(e => addEvents.push(e));
            multiplexer.onDidRemoveCapabilityType(e => removeEvents.push(e));
            store1 = store.add(new terminalCapabilityStore_1.TerminalCapabilityStore());
            store2 = store.add(new terminalCapabilityStore_1.TerminalCapabilityStore());
            addEvents = [];
            removeEvents = [];
        });
        teardown(() => store.dispose());
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('should fire events when capabilities are enabled', async () => {
            assertEvents(addEvents, []);
            multiplexer.add(store1);
            multiplexer.add(store2);
            store1.add(0 /* TerminalCapability.CwdDetection */, {});
            assertEvents(addEvents, [0 /* TerminalCapability.CwdDetection */]);
            store2.add(1 /* TerminalCapability.NaiveCwdDetection */, {});
            assertEvents(addEvents, [1 /* TerminalCapability.NaiveCwdDetection */]);
        });
        test('should fire events when capabilities are disabled', async () => {
            assertEvents(removeEvents, []);
            multiplexer.add(store1);
            multiplexer.add(store2);
            store1.add(0 /* TerminalCapability.CwdDetection */, {});
            store2.add(1 /* TerminalCapability.NaiveCwdDetection */, {});
            assertEvents(removeEvents, []);
            store1.remove(0 /* TerminalCapability.CwdDetection */);
            assertEvents(removeEvents, [0 /* TerminalCapability.CwdDetection */]);
            store2.remove(1 /* TerminalCapability.NaiveCwdDetection */);
            assertEvents(removeEvents, [1 /* TerminalCapability.NaiveCwdDetection */]);
        });
        test('should fire events when stores are added', async () => {
            assertEvents(addEvents, []);
            store1.add(0 /* TerminalCapability.CwdDetection */, {});
            assertEvents(addEvents, []);
            store2.add(1 /* TerminalCapability.NaiveCwdDetection */, {});
            multiplexer.add(store1);
            multiplexer.add(store2);
            assertEvents(addEvents, [0 /* TerminalCapability.CwdDetection */, 1 /* TerminalCapability.NaiveCwdDetection */]);
        });
        test('items should return items from all stores', () => {
            (0, assert_1.deepStrictEqual)(Array.from(multiplexer.items).sort(), [].sort());
            multiplexer.add(store1);
            multiplexer.add(store2);
            store1.add(0 /* TerminalCapability.CwdDetection */, {});
            (0, assert_1.deepStrictEqual)(Array.from(multiplexer.items).sort(), [0 /* TerminalCapability.CwdDetection */].sort());
            store1.add(2 /* TerminalCapability.CommandDetection */, {});
            store2.add(1 /* TerminalCapability.NaiveCwdDetection */, {});
            (0, assert_1.deepStrictEqual)(Array.from(multiplexer.items).sort(), [0 /* TerminalCapability.CwdDetection */, 2 /* TerminalCapability.CommandDetection */, 1 /* TerminalCapability.NaiveCwdDetection */].sort());
            store2.remove(1 /* TerminalCapability.NaiveCwdDetection */);
            (0, assert_1.deepStrictEqual)(Array.from(multiplexer.items).sort(), [0 /* TerminalCapability.CwdDetection */, 2 /* TerminalCapability.CommandDetection */].sort());
        });
        test('has should return whether a capability is present', () => {
            (0, assert_1.deepStrictEqual)(multiplexer.has(0 /* TerminalCapability.CwdDetection */), false);
            multiplexer.add(store1);
            store1.add(0 /* TerminalCapability.CwdDetection */, {});
            (0, assert_1.deepStrictEqual)(multiplexer.has(0 /* TerminalCapability.CwdDetection */), true);
            store1.remove(0 /* TerminalCapability.CwdDetection */);
            (0, assert_1.deepStrictEqual)(multiplexer.has(0 /* TerminalCapability.CwdDetection */), false);
        });
    });
    function assertEvents(actual, expected) {
        (0, assert_1.deepStrictEqual)(actual, expected);
        actual.length = 0;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxDYXBhYmlsaXR5U3RvcmUudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsL3Rlc3QvYnJvd3Nlci9jYXBhYmlsaXRpZXMvdGVybWluYWxDYXBhYmlsaXR5U3RvcmUudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVFoRyxLQUFLLENBQUMseUJBQXlCLEVBQUUsR0FBRyxFQUFFO1FBQ3JDLElBQUksS0FBOEIsQ0FBQztRQUNuQyxJQUFJLFNBQStCLENBQUM7UUFDcEMsSUFBSSxZQUFrQyxDQUFDO1FBRXZDLEtBQUssQ0FBQyxHQUFHLEVBQUU7WUFDVixLQUFLLEdBQUcsSUFBSSxpREFBdUIsRUFBRSxDQUFDO1lBQ3RDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyRCxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0QsU0FBUyxHQUFHLEVBQUUsQ0FBQztZQUNmLFlBQVksR0FBRyxFQUFFLENBQUM7UUFDbkIsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFFaEMsSUFBSSxDQUFDLGdEQUFnRCxFQUFFLEdBQUcsRUFBRTtZQUMzRCxZQUFZLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzVCLEtBQUssQ0FBQyxHQUFHLDBDQUFrQyxFQUFTLENBQUMsQ0FBQztZQUN0RCxZQUFZLENBQUMsU0FBUyxFQUFFLHlDQUFpQyxDQUFDLENBQUM7UUFDNUQsQ0FBQyxDQUFDLENB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