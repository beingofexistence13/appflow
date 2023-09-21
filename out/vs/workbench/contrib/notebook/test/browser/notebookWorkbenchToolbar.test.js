/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/notebook/browser/viewParts/notebookEditorToolbar", "vs/base/common/actions", "assert", "vs/base/test/common/utils"], function (require, exports, notebookEditorToolbar_1, actions_1, assert, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Calculate the visible actions in the toolbar.
     * @param action The action to measure.
     * @param container The container the action will be placed in.
     * @returns The primary and secondary actions to be rendered
     *
     * NOTE: every action requires space for ACTION_PADDING +8 to the right.
     *
     * ex: action with size 50 requires 58px of space
     */
    suite('Workbench Toolbar calculateActions (strategy always + never)', () => {
        const disposables = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        const defaultSecondaryActionModels = [
            { action: new actions_1.Action('secondaryAction0', 'Secondary Action 0'), size: 50, visible: true, renderLabel: true },
            { action: new actions_1.Action('secondaryAction1', 'Secondary Action 1'), size: 50, visible: true, renderLabel: true },
            { action: new actions_1.Action('secondaryAction2', 'Secondary Action 2'), size: 50, visible: true, renderLabel: true },
        ];
        const defaultSecondaryActions = defaultSecondaryActionModels.map(action => action.action);
        const separator = { action: new actions_1.Separator(), size: 1, visible: true, renderLabel: true };
        setup(function () {
            defaultSecondaryActionModels.forEach(action => disposables.add(action.action));
        });
        test('should return empty primary and secondary actions when given empty initial actions', () => {
            const result = (0, notebookEditorToolbar_1.workbenchCalculateActions)([], [], 100);
            assert.deepEqual(result.primaryActions, []);
            assert.deepEqual(result.secondaryActions, []);
        });
        test('should return all primary actions when they fit within the container width', () => {
            const actions = [
                { action: disposables.add(new actions_1.Action('action0', 'Action 0')), size: 50, visible: true, renderLabel: true },
                { action: disposables.add(new actions_1.Action('action1', 'Action 1')), size: 50, visible: true, renderLabel: true },
                { action: disposables.add(new actions_1.Action('action2', 'Action 2')), size: 50, visible: true, renderLabel: true },
            ];
            const result = (0, notebookEditorToolbar_1.workbenchCalculateActions)(actions, defaultSecondaryActions, 200);
            assert.deepEqual(result.primaryActions, actions);
            assert.deepEqual(result.secondaryActions, defaultSecondaryActions);
        });
        test('should move actions to secondary when they do not fit within the container width', () => {
            const actions = [
                { action: disposables.add(new actions_1.Action('action0', 'Action 0')), size: 50, visible: true, renderLabel: true },
                { action: disposables.add(new actions_1.Action('action1', 'Action 1')), size: 50, visible: true, renderLabel: true },
                { action: disposables.add(new actions_1.Action('action2', 'Action 2')), size: 50, visible: true, renderLabel: true },
            ];
            const result = (0, notebookEditorToolbar_1.workbenchCalculateActions)(actions, defaultSecondaryActions, 100);
            assert.deepEqual(result.primaryActions, [actions[0]]);
            assert.deepEqual(result.secondaryActions, [actions[1], actions[2], separator, ...defaultSecondaryActionModels].map(action => action.action));
        });
        test('should ignore second separator when two separators are in a row', () => {
            const actions = [
                { action: disposables.add(new actions_1.Action('action0', 'Action 0')), size: 50, visible: true, renderLabel: true },
                { action: new actions_1.Separator(), size: 1, visible: true, renderLabel: true },
                { action: new actions_1.Separator(), size: 1, visible: true, renderLabel: true },
                { action: disposables.add(new actions_1.Action('action1', 'Action 1')), size: 50, visible: true, renderLabel: true },
            ];
            const result = (0, notebookEditorToolbar_1.workbenchCalculateActions)(actions, defaultSecondaryActions, 125);
            assert.deepEqual(result.primaryActions, [actions[0], actions[1], actions[3]]);
            assert.deepEqual(result.secondaryActions, defaultSecondaryActions);
        });
        test('should ignore separators when they are at the end of the resulting primary actions', () => {
            const actions = [
                { action: disposables.add(new actions_1.Action('action0', 'Action 0')), size: 50, visible: true, renderLabel: true },
                { action: new actions_1.Separator(), size: 1, visible: true, renderLabel: true },
                { action: disposables.add(new actions_1.Action('action1', 'Action 1')), size: 50, visible: true, renderLabel: true },
                { action: new actions_1.Separator(), size: 1, visible: true, renderLabel: true },
            ];
            const result = (0, notebookEditorToolbar_1.workbenchCalculateActions)(actions, defaultSecondaryActions, 200);
            assert.deepEqual(result.primaryActions, [actions[0], actions[1], actions[2]]);
            assert.deepEqual(result.secondaryActions, defaultSecondaryActions);
        });
        test('should keep actions with size 0 in primary actions', () => {
            const actions = [
                { action: disposables.add(new actions_1.Action('action0', 'Action 0')), size: 50, visible: true, renderLabel: true },
                { action: disposables.add(new actions_1.Action('action1', 'Action 1')), size: 50, visible: true, renderLabel: true },
                { action: disposables.add(new actions_1.Action('action2', 'Action 2')), size: 50, visible: true, renderLabel: true },
                { action: disposables.add(new actions_1.Action('action3', 'Action 3')), size: 0, visible: true, renderLabel: true },
            ];
            const result = (0, notebookEditorToolbar_1.workbenchCalculateActions)(actions, defaultSecondaryActions, 116);
            assert.deepEqual(result.primaryActions, [actions[0], actions[1], actions[3]]);
            assert.deepEqual(result.secondaryActions, [actions[2], separator, ...defaultSecondaryActionModels].map(action => action.action));
        });
        test('should not render separator if preceeded by size 0 action(s).', () => {
            const actions = [
                { action: disposables.add(new actions_1.Action('action0', 'Action 0')), size: 0, visible: true, renderLabel: true },
                { action: new actions_1.Separator(), size: 1, visible: true, renderLabel: true },
                { action: disposables.add(new actions_1.Action('action1', 'Action 1')), size: 50, visible: true, renderLabel: true },
            ];
            const result = (0, notebookEditorToolbar_1.workbenchCalculateActions)(actions, defaultSecondaryActions, 116);
            assert.deepEqual(result.primaryActions, [actions[0], actions[2]]);
            assert.deepEqual(result.secondaryActions, defaultSecondaryActions);
        });
        test('should not render second separator if space between is hidden (size 0) actions.', () => {
            const actions = [
                { action: disposables.add(new actions_1.Action('action0', 'Action 0')), size: 50, visible: true, renderLabel: true },
                { action: new actions_1.Separator(), size: 1, visible: true, renderLabel: true },
                { action: disposables.add(new actions_1.Action('action1', 'Action 1')), size: 0, visible: true, renderLabel: true },
                { action: disposables.add(new actions_1.Action('action2', 'Action 2')), size: 0, visible: true, renderLabel: true },
                { action: new actions_1.Separator(), size: 1, visible: true, renderLabel: true },
                { action: disposables.add(new actions_1.Action('action3', 'Action 3')), size: 50, visible: true, renderLabel: true },
            ];
            const result = (0, notebookEditorToolbar_1.workbenchCalculateActions)(actions, defaultSecondaryActions, 300);
            assert.deepEqual(result.primaryActions, [actions[0], actions[1], actions[2], actions[3], actions[5]]);
            assert.deepEqual(result.secondaryActions, defaultSecondaryActions);
        });
    });
    suite('Workbench Toolbar Dynamic calculateActions (strategy dynamic)', () => {
        const disposables = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        const actionTemplate = [
            new actions_1.Action('action0', 'Action 0'),
            new actions_1.Action('action1', 'Action 1'),
            new actions_1.Action('action2', 'Action 2'),
            new actions_1.Action('action3', 'Action 3')
        ];
        const defaultSecondaryActionModels = [
            { action: new actions_1.Action('secondaryAction0', 'Secondary Action 0'), size: 50, visible: true, renderLabel: true },
            { action: new actions_1.Action('secondaryAction1', 'Secondary Action 1'), size: 50, visible: true, renderLabel: true },
            { action: new actions_1.Action('secondaryAction2', 'Secondary Action 2'), size: 50, visible: true, renderLabel: true },
        ];
        const defaultSecondaryActions = defaultSecondaryActionModels.map(action => action.action);
        setup(function () {
            defaultSecondaryActionModels.forEach(action => disposables.add(action.action));
        });
        test('should return empty primary and secondary actions when given empty initial actions', () => {
            const result = (0, notebookEditorToolbar_1.workbenchDynamicCalculateActions)([], [], 100);
            assert.deepEqual(result.primaryActions, []);
            assert.deepEqual(result.secondaryActions, []);
        });
        test('should return all primary actions as visiblewhen they fit within the container width', () => {
            const constainerSize = 200;
            const input = [
                { action: actionTemplate[0], size: 50, visible: true, renderLabel: true },
                { action: actionTemplate[1], size: 50, visible: true, renderLabel: true },
                { action: actionTemplate[2], size: 50, visible: true, renderLabel: true },
            ];
            const expected = [
                { action: actionTemplate[0], size: 50, visible: true, renderLabel: true },
                { action: actionTemplate[1], size: 50, visible: true, renderLabel: true },
                { action: actionTemplate[2], size: 50, visible: true, renderLabel: true },
            ];
            const result = (0, notebookEditorToolbar_1.workbenchDynamicCalculateActions)(input, defaultSecondaryActions, constainerSize);
            assert.deepEqual(result.primaryActions, expected);
            assert.deepEqual(result.secondaryActions, defaultSecondaryActions);
        });
        test('actions all within a group that cannot all fit, will all be icon only', () => {
            const containerSize = 150;
            const input = [
                { action: actionTemplate[0], size: 50, visible: true, renderLabel: true },
                { action: actionTemplate[1], size: 50, visible: true, renderLabel: true },
                { action: actionTemplate[2], size: 50, visible: true, renderLabel: true },
            ];
            const expected = [
                { action: actionTemplate[0], size: 50, visible: true, renderLabel: false },
                { action: actionTemplate[1], size: 50, visible: true, renderLabel: false },
                { action: actionTemplate[2], size: 50, visible: true, renderLabel: false },
            ];
            const result = (0, notebookEditorToolbar_1.workbenchDynamicCalculateActions)(input, defaultSecondaryActions, containerSize);
            assert.deepEqual(result.primaryActions, expected);
            assert.deepEqual(result.secondaryActions, [...defaultSecondaryActionModels].map(action => action.action));
        });
        test('should ignore second separator when two separators are in a row', () => {
            const containerSize = 200;
            const input = [
                { action: actionTemplate[0], size: 50, visible: true, renderLabel: true },
                { action: new actions_1.Separator(), size: 1, visible: true, renderLabel: true },
                { action: new actions_1.Separator(), size: 1, visible: true, renderLabel: true },
                { action: actionTemplate[1], size: 50, visible: true, renderLabel: true },
            ];
            const expected = [
                { action: actionTemplate[0], size: 50, visible: true, renderLabel: true },
                { action: new actions_1.Separator(), size: 1, visible: true, renderLabel: true },
                { action: actionTemplate[1], size: 50, visible: true, renderLabel: true },
            ];
            const result = (0, notebookEditorToolbar_1.workbenchDynamicCalculateActions)(input, defaultSecondaryActions, containerSize);
            assert.deepEqual(result.primaryActions, expected);
            assert.deepEqual(result.secondaryActions, defaultSecondaryActions);
        });
        test('check label visibility in different groupings', () => {
            const containerSize = 150;
            const actions = [
                { action: actionTemplate[0], size: 50, visible: true, renderLabel: true },
                { action: new actions_1.Separator(), size: 1, visible: true, renderLabel: true },
                { action: actionTemplate[1], size: 50, visible: true, renderLabel: true },
                { action: actionTemplate[2], size: 50, visible: true, renderLabel: true },
            ];
            const expectedOutputActions = [
                { action: actionTemplate[0], size: 50, visible: true, renderLabel: true },
                { action: new actions_1.Separator(), size: 1, visible: true, renderLabel: true },
                { action: actionTemplate[1], size: 50, visible: true, renderLabel: false },
                { action: actionTemplate[2], size: 50, visible: true, renderLabel: false },
            ];
            const result = (0, notebookEditorToolbar_1.workbenchDynamicCalculateActions)(actions, defaultSecondaryActions, containerSize);
            assert.deepEqual(result.primaryActions, expectedOutputActions);
            assert.deepEqual(result.secondaryActions, defaultSecondaryActions);
        });
        test('should ignore separators when they are at the end of the resulting primary actions', () => {
            const containerSize = 200;
            const input = [
                { action: actionTemplate[0], size: 50, visible: true, renderLabel: true },
                { action: new actions_1.Separator(), size: 1, visible: true, renderLabel: true },
                { action: actionTemplate[1], size: 50, visible: true, renderLabel: true },
                { action: new actions_1.Separator(), size: 1, visible: true, renderLabel: true },
            ];
            const expected = [
                { action: actionTemplate[0], size: 50, visible: true, renderLabel: true },
                { action: new actions_1.Separator(), size: 1, visible: true, renderLabel: true },
                { action: actionTemplate[1], size: 50, visible: true, renderLabel: true },
            ];
            const result = (0, notebookEditorToolbar_1.workbenchDynamicCalculateActions)(input, defaultSecondaryActions, containerSize);
            assert.deepEqual(result.primaryActions, expected);
            assert.deepEqual(result.secondaryActions, defaultSecondaryActions);
        });
        test('should keep actions with size 0 in primary actions', () => {
            const containerSize = 170;
            const input = [
                { action: actionTemplate[0], size: 50, visible: true, renderLabel: true },
                { action: actionTemplate[1], size: 50, visible: true, renderLabel: true },
                { action: new actions_1.Separator(), size: 1, visible: true, renderLabel: true },
                { action: actionTemplate[2], size: 50, visible: true, renderLabel: true },
                { action: actionTemplate[3], size: 0, visible: true, renderLabel: true },
            ];
            const expected = [
                { action: actionTemplate[0], size: 50, visible: true, renderLabel: true },
                { action: actionTemplate[1], size: 50, visible: true, renderLabel: true },
                { action: new actions_1.Separator(), size: 1, visible: true, renderLabel: true },
                { action: actionTemplate[2], size: 50, visible: true, renderLabel: false },
                { action: actionTemplate[3], size: 0, visible: true, renderLabel: false },
            ];
            const result = (0, notebookEditorToolbar_1.workbenchDynamicCalculateActions)(input, defaultSecondaryActions, containerSize);
            assert.deepEqual(result.primaryActions, expected);
            assert.deepEqual(result.secondaryActions, defaultSecondaryActions);
        });
        test('should not render separator if preceeded by size 0 action(s), but keep size 0 action in primary.', () => {
            const containerSize = 116;
            const input = [
                { action: actionTemplate[0], size: 0, visible: true, renderLabel: true },
                { action: new actions_1.Separator(), size: 1, visible: true, renderLabel: true },
                { action: actionTemplate[1], size: 50, visible: true, renderLabel: true }, // visible
            ];
            const expected = [
                { action: actionTemplate[0], size: 0, visible: true, renderLabel: true },
                { action: actionTemplate[1], size: 50, visible: true, renderLabel: true } // visible
            ];
            const result = (0, notebookEditorToolbar_1.workbenchDynamicCalculateActions)(input, defaultSecondaryActions, containerSize);
            assert.deepEqual(result.primaryActions, expected);
            assert.deepEqual(result.secondaryActions, defaultSecondaryActions);
        });
        test('should not render second separator if space between is hidden (size 0) actions.', () => {
            const containerSize = 300;
            const input = [
                { action: actionTemplate[0], size: 50, visible: true, renderLabel: true },
                { action: new actions_1.Separator(), size: 1, visible: true, renderLabel: true },
                { action: actionTemplate[1], size: 0, visible: true, renderLabel: true },
                { action: actionTemplate[2], size: 0, visible: true, renderLabel: true },
                { action: new actions_1.Separator(), size: 1, visible: true, renderLabel: true },
                { action: actionTemplate[3], size: 50, visible: true, renderLabel: true },
            ];
            const expected = [
                { action: actionTemplate[0], size: 50, visible: true, renderLabel: true },
                { action: new actions_1.Separator(), size: 1, visible: true, renderLabel: true },
                { action: actionTemplate[1], size: 0, visible: true, renderLabel: true },
                { action: actionTemplate[2], size: 0, visible: true, renderLabel: true },
                // remove separator here
                { action: actionTemplate[3], size: 50, visible: true, renderLabel: true },
            ];
            const result = (0, notebookEditorToolbar_1.workbenchDynamicCalculateActions)(input, defaultSecondaryActions, containerSize);
            assert.deepEqual(result.primaryActions, expected);
            assert.deepEqual(result.secondaryActions, defaultSecondaryActions);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tXb3JrYmVuY2hUb29sYmFyLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay90ZXN0L2Jyb3dzZXIvbm90ZWJvb2tXb3JrYmVuY2hUb29sYmFyLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFjaEc7Ozs7Ozs7OztPQVNHO0lBQ0gsS0FBSyxDQUFDLDhEQUE4RCxFQUFFLEdBQUcsRUFBRTtRQUMxRSxNQUFNLFdBQVcsR0FBRyxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFOUQsTUFBTSw0QkFBNEIsR0FBbUI7WUFDcEQsRUFBRSxNQUFNLEVBQUUsSUFBSSxnQkFBTSxDQUFDLGtCQUFrQixFQUFFLG9CQUFvQixDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUU7WUFDNUcsRUFBRSxNQUFNLEVBQUUsSUFBSSxnQkFBTSxDQUFDLGtCQUFrQixFQUFFLG9CQUFvQixDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUU7WUFDNUcsRUFBRSxNQUFNLEVBQUUsSUFBSSxnQkFBTSxDQUFDLGtCQUFrQixFQUFFLG9CQUFvQixDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUU7U0FDNUcsQ0FBQztRQUNGLE1BQU0sdUJBQXVCLEdBQWMsNEJBQTRCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3JHLE1BQU0sU0FBUyxHQUFpQixFQUFFLE1BQU0sRUFBRSxJQUFJLG1CQUFTLEVBQUUsRUFBRSxJQUFJLEVBQUUs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