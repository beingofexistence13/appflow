/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/base/test/common/mock", "vs/workbench/api/common/extHostEditorTabs", "vs/workbench/api/test/common/testRPCProtocol", "vs/workbench/api/common/extHostTypes", "vs/base/test/common/utils"], function (require, exports, assert, uri_1, mock_1, extHostEditorTabs_1, testRPCProtocol_1, extHostTypes_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtHostEditorTabs', function () {
        const defaultTabDto = {
            id: 'uniquestring',
            input: { kind: 1 /* TabInputKind.TextInput */, uri: uri_1.URI.parse('file://abc/def.txt') },
            isActive: true,
            isDirty: true,
            isPinned: true,
            isPreview: false,
            label: 'label1',
        };
        function createTabDto(dto) {
            return { ...defaultTabDto, ...dto };
        }
        const store = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('Ensure empty model throws when accessing active group', function () {
            const extHostEditorTabs = new extHostEditorTabs_1.ExtHostEditorTabs((0, testRPCProtocol_1.SingleProxyRPCProtocol)(new class extends (0, mock_1.mock)() {
            }));
            assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 0);
            // Active group should never be undefined (there is always an active group). Ensure accessing it undefined throws.
            // TODO @lramos15 Add a throw on the main side when a model is sent without an active group
            assert.throws(() => extHostEditorTabs.tabGroups.activeTabGroup);
        });
        test('single tab', function () {
            const extHostEditorTabs = new extHostEditorTabs_1.ExtHostEditorTabs((0, testRPCProtocol_1.SingleProxyRPCProtocol)(new class extends (0, mock_1.mock)() {
            }));
            const tab = createTabDto({
                id: 'uniquestring',
                isActive: true,
                isDirty: true,
                isPinned: true,
                label: 'label1',
            });
            extHostEditorTabs.$acceptEditorTabModel([{
                    isActive: true,
                    viewColumn: 0,
                    groupId: 12,
                    tabs: [tab]
                }]);
            assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 1);
            const [first] = extHostEditorTabs.tabGroups.all;
            assert.ok(first.activeTab);
            assert.strictEqual(first.tabs.indexOf(first.activeTab), 0);
            {
                extHostEditorTabs.$acceptEditorTabModel([{
                        isActive: true,
                        viewColumn: 0,
                        groupId: 12,
                        tabs: [tab]
                    }]);
                assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 1);
                const [first] = extHostEditorTabs.tabGroups.all;
                assert.ok(first.activeTab);
                assert.strictEqual(first.tabs.indexOf(first.activeTab), 0);
            }
        });
        test('Empty tab group', function () {
            const extHostEditorTabs = new extHostEditorTabs_1.ExtHostEditorTabs((0, testRPCProtocol_1.SingleProxyRPCProtocol)(new class extends (0, mock_1.mock)() {
            }));
            extHostEditorTabs.$acceptEditorTabModel([{
                    isActive: true,
                    viewColumn: 0,
                    groupId: 12,
                    tabs: []
                }]);
            assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 1);
            const [first] = extHostEditorTabs.tabGroups.all;
            assert.strictEqual(first.activeTab, undefined);
            assert.strictEqual(first.tabs.length, 0);
        });
        test('Ensure tabGroup change events fires', function () {
            const extHostEditorTabs = new extHostEditorTabs_1.ExtHostEditorTabs((0, testRPCProtocol_1.SingleProxyRPCProtocol)(new class extends (0, mock_1.mock)() {
            }));
            let count = 0;
            store.add(extHostEditorTabs.tabGroups.onDidChangeTabGroups(() => count++));
            assert.strictEqual(count, 0);
            extHostEditorTabs.$acceptEditorTabModel([{
                    isActive: true,
                    viewColumn: 0,
                    groupId: 12,
                    tabs: []
                }]);
            assert.ok(extHostEditorTabs.tabGroups.activeTabGroup);
            const activeTabGroup = extHostEditorTabs.tabGroups.activeTabGroup;
            assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 1);
            assert.strictEqual(activeTabGroup.tabs.length, 0);
            assert.strictEqual(count, 1);
        });
        test('Check TabGroupChangeEvent properties', function () {
            const extHostEditorTabs = new extHostEditorTabs_1.ExtHostEditorTabs((0, testRPCProtocol_1.SingleProxyRPCProtocol)(new class extends (0, mock_1.mock)() {
            }));
            const group1Data = {
                isActive: true,
                viewColumn: 0,
                groupId: 12,
                tabs: []
            };
            const group2Data = { ...group1Data, groupId: 13 };
            const events = [];
            store.add(extHostEditorTabs.tabGroups.onDidChangeTabGroups(e => events.push(e)));
            // OPEN
            extHostEditorTabs.$acceptEditorTabModel([group1Data]);
            assert.deepStrictEqual(events, [{
                    changed: [],
                    closed: [],
                    opened: [extHostEditorTabs.tabGroups.activeTabGroup]
                }]);
            // OPEN, CHANGE
            events.length = 0;
            extHostEditorTabs.$acceptEditorTabModel([{ ...group1Data, isActive: false }, group2Data]);
            assert.deepStrictEqual(events, [{
                    changed: [extHostEditorTabs.tabGroups.all[0]],
                    closed: [],
                    opened: [extHostEditorTabs.tabGroups.all[1]]
                }]);
            // CHANGE
            events.length = 0;
            extHostEditorTabs.$acceptEditorTabModel([group1Data, { ...group2Data, isActive: false }]);
            assert.deepStrictEqual(events, [{
                    changed: extHostEditorTabs.tabGroups.all,
                    closed: [],
                    opened: []
                }]);
            // CLOSE, CHANGE
            events.length = 0;
            const oldActiveGroup = extHostEditorTabs.tabGroups.activeTabGroup;
            extHostEditorTabs.$acceptEditorTabModel([group2Data]);
            assert.deepStrictEqual(events, [{
                    changed: extHostEditorTabs.tabGroups.all,
                    closed: [oldActiveGroup],
                    opened: []
                }]);
        });
        test('Ensure reference equality for activeTab and activeGroup', function () {
            const extHostEditorTabs = new extHostEditorTabs_1.ExtHostEditorTabs((0, testRPCProtocol_1.SingleProxyRPCProtocol)(new class extends (0, mock_1.mock)() {
            }));
            const tab = createTabDto({
                id: 'uniquestring',
                isActive: true,
                isDirty: true,
                isPinned: true,
                label: 'label1',
                editorId: 'default',
            });
            extHostEditorTabs.$acceptEditorTabModel([{
                    isActive: true,
                    viewColumn: 0,
                    groupId: 12,
                    tabs: [tab]
                }]);
            assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 1);
            const [first] = extHostEditorTabs.tabGroups.all;
            assert.ok(first.activeTab);
            assert.strictEqual(first.tabs.indexOf(first.activeTab), 0);
            assert.strictEqual(first.activeTab, first.tabs[0]);
            assert.strictEqual(extHostEditorTabs.tabGroups.activeTabGroup, first);
        });
        test('TextMergeTabInput surfaces in the UI', function () {
            const extHostEditorTabs = new extHostEditorTabs_1.ExtHostEditorTabs((0, testRPCProtocol_1.SingleProxyRPCProtocol)(new class extends (0, mock_1.mock)() {
            }));
            const tab = createTabDto({
                input: {
                    kind: 3 /* TabInputKind.TextMergeInput */,
                    base: uri_1.URI.from({ scheme: 'test', path: 'base' }),
                    input1: uri_1.URI.from({ scheme: 'test', path: 'input1' }),
                    input2: uri_1.URI.from({ scheme: 'test', path: 'input2' }),
                    result: uri_1.URI.from({ scheme: 'test', path: 'result' }),
                }
            });
            extHostEditorTabs.$acceptEditorTabModel([{
                    isActive: true,
                    viewColumn: 0,
                    groupId: 12,
                    tabs: [tab]
                }]);
            assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 1);
            const [first] = extHostEditorTabs.tabGroups.all;
            assert.ok(first.activeTab);
            assert.strictEqual(first.tabs.indexOf(first.activeTab), 0);
            assert.ok(first.activeTab.input instanceof extHostTypes_1.TextMergeTabInput);
        });
        test('Ensure reference stability', function () {
            const extHostEditorTabs = new extHostEditorTabs_1.ExtHostEditorTabs((0, testRPCProtocol_1.SingleProxyRPCProtocol)(new class extends (0, mock_1.mock)() {
            }));
            const tabDto = createTabDto();
            // single dirty tab
            extHostEditorTabs.$acceptEditorTabModel([{
                    isActive: true,
                    viewColumn: 0,
                    groupId: 12,
                    tabs: [tabDto]
                }]);
            let all = extHostEditorTabs.tabGroups.all.map(group => group.tabs).flat();
            assert.strictEqual(all.length, 1);
            const apiTab1 = all[0];
            assert.ok(apiTab1.input instanceof extHostTypes_1.TextTabInput);
            assert.strictEqual(tabDto.input.kind, 1 /* TabInputKind.TextInput */);
            const dtoResource = tabDto.input.uri;
            assert.strictEqual(apiTab1.input.uri.toString(), uri_1.URI.revive(dtoResource).toString());
            assert.strictEqual(apiTab1.isDirty, true);
            // NOT DIRTY anymore
            const tabDto2 = { ...tabDto, isDirty: false };
            // Accept a simple update
            extHostEditorTabs.$acceptTabOperation({
                kind: 2 /* TabModelOperationKind.TAB_UPDATE */,
                index: 0,
                tabDto: tabDto2,
                groupId: 12
            });
            all = extHostEditorTabs.tabGroups.all.map(group => group.tabs).flat();
            assert.strictEqual(all.length, 1);
            const apiTab2 = all[0];
            assert.ok(apiTab1.input instanceof extHostTypes_1.TextTabInput);
            assert.strictEqual(apiTab1.input.uri.toString(), uri_1.URI.revive(dtoResource).toString());
            assert.strictEqual(apiTab2.isDirty, false);
            assert.strictEqual(apiTab1 === apiTab2, true);
        });
        test('Tab.isActive working', function () {
            const extHostEditorTabs = new extHostEditorTabs_1.ExtHostEditorTabs((0, testRPCProtocol_1.SingleProxyRPCProtocol)(new class extends (0, mock_1.mock)() {
            }));
            const tabDtoAAA = createTabDto({
                id: 'AAA',
                isActive: true,
                isDirty: true,
                isPinned: true,
                label: 'label1',
                input: { kind: 1 /* TabInputKind.TextInput */, uri: uri_1.URI.parse('file://abc/AAA.txt') },
                editorId: 'default'
            });
            const tabDtoBBB = createTabDto({
                id: 'BBB',
                isActive: false,
                isDirty: true,
                isPinned: true,
                label: 'label1',
                input: { kind: 1 /* TabInputKind.TextInput */, uri: uri_1.URI.parse('file://abc/BBB.txt') },
                editorId: 'default'
            });
            // single dirty tab
            extHostEditorTabs.$acceptEditorTabModel([{
                    isActive: true,
                    viewColumn: 0,
                    groupId: 12,
                    tabs: [tabDtoAAA, tabDtoBBB]
                }]);
            const all = extHostEditorTabs.tabGroups.all.map(group => group.tabs).flat();
            assert.strictEqual(all.length, 2);
            const activeTab1 = extHostEditorTabs.tabGroups.activeTabGroup?.activeTab;
            assert.ok(activeTab1?.input instanceof extHostTypes_1.TextTabInput);
            assert.strictEqual(tabDtoAAA.input.kind, 1 /* TabInputKind.TextInput */);
            const dtoAAAResource = tabDtoAAA.input.uri;
            assert.strictEqual(activeTab1?.input?.uri.toString(), uri_1.URI.revive(dtoAAAResource)?.toString());
            assert.strictEqual(activeTab1?.isActive, true);
            extHostEditorTabs.$acceptTabOperation({
                groupId: 12,
                index: 1,
                kind: 2 /* TabModelOperationKind.TAB_UPDATE */,
                tabDto: { ...tabDtoBBB, isActive: true } /// BBB is now active
            });
            const activeTab2 = extHostEditorTabs.tabGroups.activeTabGroup?.activeTab;
            assert.ok(activeTab2?.input instanceof extHostTypes_1.TextTabInput);
            assert.strictEqual(tabDtoBBB.input.kind, 1 /* TabInputKind.TextInput */);
            const dtoBBBResource = tabDtoBBB.input.uri;
            assert.strictEqual(activeTab2?.input?.uri.toString(), uri_1.URI.revive(dtoBBBResource)?.toString());
            assert.strictEqual(activeTab2?.isActive, true);
            assert.strictEqual(activeTab1?.isActive, false);
        });
        test('vscode.window.tagGroups is immutable', function () {
            const extHostEditorTabs = new extHostEditorTabs_1.ExtHostEditorTabs((0, testRPCProtocol_1.SingleProxyRPCProtocol)(new class extends (0, mock_1.mock)() {
            }));
            assert.throws(() => {
                // @ts-expect-error write to readonly prop
                extHostEditorTabs.tabGroups.activeTabGroup = undefined;
            });
            assert.throws(() => {
                // @ts-expect-error write to readonly prop
                extHostEditorTabs.tabGroups.all.length = 0;
            });
            assert.throws(() => {
                // @ts-expect-error write to readonly prop
                extHostEditorTabs.tabGroups.onDidChangeActiveTabGroup = undefined;
            });
            assert.throws(() => {
                // @ts-expect-error write to readonly prop
                extHostEditorTabs.tabGroups.onDidChangeTabGroups = undefined;
            });
        });
        test('Ensure close is called with all tab ids', function () {
            const closedTabIds = [];
            const extHostEditorTabs = new extHostEditorTabs_1.ExtHostEditorTabs((0, testRPCProtocol_1.SingleProxyRPCProtocol)(new class extends (0, mock_1.mock)() {
                // override/implement $moveTab or $closeTab
                async $closeTab(tabIds, preserveFocus) {
                    closedTabIds.push(tabIds);
                    return true;
                }
            }));
            const tab = createTabDto({
                id: 'uniquestring',
                isActive: true,
                isDirty: true,
                isPinned: true,
                label: 'label1',
                editorId: 'default'
            });
            extHostEditorTabs.$acceptEditorTabModel([{
                    isActive: true,
                    viewColumn: 0,
                    groupId: 12,
                    tabs: [tab]
                }]);
            assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 1);
            const activeTab = extHostEditorTabs.tabGroups.activeTabGroup?.activeTab;
            assert.ok(activeTab);
            extHostEditorTabs.tabGroups.close(activeTab, false);
            assert.strictEqual(closedTabIds.length, 1);
            assert.deepStrictEqual(closedTabIds[0], ['uniquestring']);
            // Close with array
            extHostEditorTabs.tabGroups.close([activeTab], false);
            assert.strictEqual(closedTabIds.length, 2);
            assert.deepStrictEqual(closedTabIds[1], ['uniquestring']);
        });
        test('Update tab only sends tab change event', async function () {
            const closedTabIds = [];
            const extHostEditorTabs = new extHostEditorTabs_1.ExtHostEditorTabs((0, testRPCProtocol_1.SingleProxyRPCProtocol)(new class extends (0, mock_1.mock)() {
                // override/implement $moveTab or $closeTab
                async $closeTab(tabIds, preserveFocus) {
                    closedTabIds.push(tabIds);
                    return true;
                }
            }));
            const tabDto = createTabDto({
                id: 'uniquestring',
                isActive: true,
                isDirty: true,
                isPinned: true,
                label: 'label1',
                editorId: 'default'
            });
            extHostEditorTabs.$acceptEditorTabModel([{
                    isActive: true,
                    viewColumn: 0,
                    groupId: 12,
                    tabs: [tabDto]
                }]);
            assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 1);
            assert.strictEqual(extHostEditorTabs.tabGroups.all.map(g => g.tabs).flat().length, 1);
            const tab = extHostEditorTabs.tabGroups.all[0].tabs[0];
            const p = new Promise(resolve => store.add(extHostEditorTabs.tabGroups.onDidChangeTabs(resolve)));
            extHostEditorTabs.$acceptTabOperation({
                groupId: 12,
                index: 0,
                kind: 2 /* TabModelOperationKind.TAB_UPDATE */,
                tabDto: { ...tabDto, label: 'NEW LABEL' }
            });
            const changedTab = (await p).changed[0];
            assert.ok(tab === changedTab);
            assert.strictEqual(changedTab.label, 'NEW LABEL');
        });
        test('Active tab', function () {
            const extHostEditorTabs = new extHostEditorTabs_1.ExtHostEditorTabs((0, testRPCProtocol_1.SingleProxyRPCProtocol)(new class extends (0, mock_1.mock)() {
            }));
            const tab1 = createTabDto({
                id: 'uniquestring',
                isActive: true,
                isDirty: true,
                isPinned: true,
                label: 'label1',
            });
            const tab2 = createTabDto({
                isActive: false,
                id: 'uniquestring2',
            });
            const tab3 = createTabDto({
                isActive: false,
                id: 'uniquestring3',
            });
            extHostEditorTabs.$acceptEditorTabModel([{
                    isActive: true,
                    viewColumn: 0,
                    groupId: 12,
                    tabs: [tab1, tab2, tab3]
                }]);
            assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 1);
            assert.strictEqual(extHostEditorTabs.tabGroups.all.map(g => g.tabs).flat().length, 3);
            // Active tab is correct
            assert.strictEqual(extHostEditorTabs.tabGroups.activeTabGroup?.activeTab, extHostEditorTabs.tabGroups.activeTabGroup?.tabs[0]);
            // Switching active tab works
            tab1.isActive = false;
            tab2.isActive = true;
            extHostEditorTabs.$acceptTabOperation({
                groupId: 12,
                index: 0,
                kind: 2 /* TabModelOperationKind.TAB_UPDATE */,
                tabDto: tab1
            });
            extHostEditorTabs.$acceptTabOperation({
                groupId: 12,
                index: 1,
                kind: 2 /* TabModelOperationKind.TAB_UPDATE */,
                tabDto: tab2
            });
            assert.strictEqual(extHostEditorTabs.tabGroups.activeTabGroup?.activeTab, extHostEditorTabs.tabGroups.activeTabGroup?.tabs[1]);
            //Closing tabs out works
            tab3.isActive = true;
            extHostEditorTabs.$acceptEditorTabModel([{
                    isActive: true,
                    viewColumn: 0,
                    groupId: 12,
                    tabs: [tab3]
                }]);
            assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 1);
            assert.strictEqual(extHostEditorTabs.tabGroups.all.map(g => g.tabs).flat().length, 1);
            assert.strictEqual(extHostEditorTabs.tabGroups.activeTabGroup?.activeTab, extHostEditorTabs.tabGroups.activeTabGroup?.tabs[0]);
            // Closing out all tabs returns undefine active tab
            extHostEditorTabs.$acceptEditorTabModel([{
                    isActive: true,
                    viewColumn: 0,
                    groupId: 12,
                    tabs: []
                }]);
            assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 1);
            assert.strictEqual(extHostEditorTabs.tabGroups.all.map(g => g.tabs).flat().length, 0);
            assert.strictEqual(extHostEditorTabs.tabGroups.activeTabGroup?.activeTab, undefined);
        });
        test('Tab operations patches open and close correctly', function () {
            const extHostEditorTabs = new extHostEditorTabs_1.ExtHostEditorTabs((0, testRPCProtocol_1.SingleProxyRPCProtocol)(new class extends (0, mock_1.mock)() {
            }));
            const tab1 = createTabDto({
                id: 'uniquestring',
                isActive: true,
                label: 'label1',
            });
            const tab2 = createTabDto({
                isActive: false,
                id: 'uniquestring2',
                label: 'label2',
            });
            const tab3 = createTabDto({
                isActive: false,
                id: 'uniquestring3',
                label: 'label3',
            });
            extHostEditorTabs.$acceptEditorTabModel([{
                    isActive: true,
                    viewColumn: 0,
                    groupId: 12,
                    tabs: [tab1, tab2, tab3]
                }]);
            assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 1);
            assert.strictEqual(extHostEditorTabs.tabGroups.all.map(g => g.tabs).flat().length, 3);
            // Close tab 2
            extHostEditorTabs.$acceptTabOperation({
                groupId: 12,
                index: 1,
                kind: 1 /* TabModelOperationKind.TAB_CLOSE */,
                tabDto: tab2
            });
            assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 1);
            assert.strictEqual(extHostEditorTabs.tabGroups.all.map(g => g.tabs).flat().length, 2);
            // Close active tab and update tab 3 to be active
            extHostEditorTabs.$acceptTabOperation({
                groupId: 12,
                index: 0,
                kind: 1 /* TabModelOperationKind.TAB_CLOSE */,
                tabDto: tab1
            });
            assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 1);
            assert.strictEqual(extHostEditorTabs.tabGroups.all.map(g => g.tabs).flat().length, 1);
            tab3.isActive = true;
            extHostEditorTabs.$acceptTabOperation({
                groupId: 12,
                index: 0,
                kind: 2 /* TabModelOperationKind.TAB_UPDATE */,
                tabDto: tab3
            });
            assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 1);
            assert.strictEqual(extHostEditorTabs.tabGroups.all.map(g => g.tabs).flat().length, 1);
            assert.strictEqual(extHostEditorTabs.tabGroups.all[0]?.activeTab?.label, 'label3');
            // Open tab 2 back
            extHostEditorTabs.$acceptTabOperation({
                groupId: 12,
                index: 1,
                kind: 0 /* TabModelOperationKind.TAB_OPEN */,
                tabDto: tab2
            });
            assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 1);
            assert.strictEqual(extHostEditorTabs.tabGroups.all.map(g => g.tabs).flat().length, 2);
            assert.strictEqual(extHostEditorTabs.tabGroups.all[0]?.tabs[1]?.label, 'label2');
        });
        test('Tab operations patches move correctly', function () {
            const extHostEditorTabs = new extHostEditorTabs_1.ExtHostEditorTabs((0, testRPCProtocol_1.SingleProxyRPCProtocol)(new class extends (0, mock_1.mock)() {
            }));
            const tab1 = createTabDto({
                id: 'uniquestring',
                isActive: true,
                label: 'label1',
            });
            const tab2 = createTabDto({
                isActive: false,
                id: 'uniquestring2',
                label: 'label2',
            });
            const tab3 = createTabDto({
                isActive: false,
                id: 'uniquestring3',
                label: 'label3',
            });
            extHostEditorTabs.$acceptEditorTabModel([{
                    isActive: true,
                    viewColumn: 0,
                    groupId: 12,
                    tabs: [tab1, tab2, tab3]
                }]);
            assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 1);
            assert.strictEqual(extHostEditorTabs.tabGroups.all.map(g => g.tabs).flat().length, 3);
            // Move tab 2 to index 0
            extHostEditorTabs.$acceptTabOperation({
                groupId: 12,
                index: 0,
                oldIndex: 1,
                kind: 3 /* TabModelOperationKind.TAB_MOVE */,
                tabDto: tab2
            });
            assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 1);
            assert.strictEqual(extHostEditorTabs.tabGroups.all.map(g => g.tabs).flat().length, 3);
            assert.strictEqual(extHostEditorTabs.tabGroups.all[0]?.tabs[0]?.label, 'label2');
            // Move tab 3 to index 1
            extHostEditorTabs.$acceptTabOperation({
                groupId: 12,
                index: 1,
                oldIndex: 2,
                kind: 3 /* TabModelOperationKind.TAB_MOVE */,
                tabDto: tab3
            });
            assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 1);
            assert.strictEqual(extHostEditorTabs.tabGroups.all.map(g => g.tabs).flat().length, 3);
            assert.strictEqual(extHostEditorTabs.tabGroups.all[0]?.tabs[1]?.label, 'label3');
            assert.strictEqual(extHostEditorTabs.tabGroups.all[0]?.tabs[0]?.label, 'label2');
            assert.strictEqual(extHostEditorTabs.tabGroups.all[0]?.tabs[2]?.label, 'label1');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdEVkaXRvclRhYnMudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvdGVzdC9icm93c2VyL2V4dEhvc3RFZGl0b3JUYWJzLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFZaEcsS0FBSyxDQUFDLG1CQUFtQixFQUFFO1FBRTFCLE1BQU0sYUFBYSxHQUFrQjtZQUNwQyxFQUFFLEVBQUUsY0FBYztZQUNsQixLQUFLLEVBQUUsRUFBRSxJQUFJLGdDQUF3QixFQUFFLEdBQUcsRUFBRSxTQUFHLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLEVBQUU7WUFDN0UsUUFBUSxFQUFFLElBQUk7WUFDZCxPQUFPLEVBQUUsSUFBSTtZQUNiLFFBQVEsRUFBRSxJQUFJO1lBQ2QsU0FBUyxFQUFFLEtBQUs7WUFDaEIsS0FBSyxFQUFFLFFBQVE7U0FDZixDQUFDO1FBRUYsU0FBUyxZQUFZLENBQUMsR0FBNEI7WUFDakQsT0FBTyxFQUFFLEdBQUcsYUFBYSxFQUFFLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFDckMsQ0FBQztRQUVELE1BQU0sS0FBSyxHQUFHLElBQUEsK0NBQXVDLEdBQUUsQ0FBQztRQUV4RCxJQUFJLENBQUMsdURBQXVELEVBQUU7WUFDN0QsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLHFDQUFpQixDQUM5QyxJQUFBLHdDQUFzQixFQUFDLElBQUksS0FBTSxTQUFRLElBQUEsV0FBSSxHQUE2QjthQUV6RSxDQUFDLENBQ0YsQ0FBQztZQUVGLE1BQU0sQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDOUQsa0hBQWtIO1lBQ2xILDJGQUEyRjtZQUMzRixNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLGlCQUFpQixDQUFD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