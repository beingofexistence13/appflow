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
        const disposables = (0, utils_1.$bT)();
        const defaultSecondaryActionModels = [
            { action: new actions_1.$gi('secondaryAction0', 'Secondary Action 0'), size: 50, visible: true, renderLabel: true },
            { action: new actions_1.$gi('secondaryAction1', 'Secondary Action 1'), size: 50, visible: true, renderLabel: true },
            { action: new actions_1.$gi('secondaryAction2', 'Secondary Action 2'), size: 50, visible: true, renderLabel: true },
        ];
        const defaultSecondaryActions = defaultSecondaryActionModels.map(action => action.action);
        const separator = { action: new actions_1.$ii(), size: 1, visible: true, renderLabel: true };
        setup(function () {
            defaultSecondaryActionModels.forEach(action => disposables.add(action.action));
        });
        test('should return empty primary and secondary actions when given empty initial actions', () => {
            const result = (0, notebookEditorToolbar_1.$hrb)([], [], 100);
            assert.deepEqual(result.primaryActions, []);
            assert.deepEqual(result.secondaryActions, []);
        });
        test('should return all primary actions when they fit within the container width', () => {
            const actions = [
                { action: disposables.add(new actions_1.$gi('action0', 'Action 0')), size: 50, visible: true, renderLabel: true },
                { action: disposables.add(new actions_1.$gi('action1', 'Action 1')), size: 50, visible: true, renderLabel: true },
                { action: disposables.add(new actions_1.$gi('action2', 'Action 2')), size: 50, visible: true, renderLabel: true },
            ];
            const result = (0, notebookEditorToolbar_1.$hrb)(actions, defaultSecondaryActions, 200);
            assert.deepEqual(result.primaryActions, actions);
            assert.deepEqual(result.secondaryActions, defaultSecondaryActions);
        });
        test('should move actions to secondary when they do not fit within the container width', () => {
            const actions = [
                { action: disposables.add(new actions_1.$gi('action0', 'Action 0')), size: 50, visible: true, renderLabel: true },
                { action: disposables.add(new actions_1.$gi('action1', 'Action 1')), size: 50, visible: true, renderLabel: true },
                { action: disposables.add(new actions_1.$gi('action2', 'Action 2')), size: 50, visible: true, renderLabel: true },
            ];
            const result = (0, notebookEditorToolbar_1.$hrb)(actions, defaultSecondaryActions, 100);
            assert.deepEqual(result.primaryActions, [actions[0]]);
            assert.deepEqual(result.secondaryActions, [actions[1], actions[2], separator, ...defaultSecondaryActionModels].map(action => action.action));
        });
        test('should ignore second separator when two separators are in a row', () => {
            const actions = [
                { action: disposables.add(new actions_1.$gi('action0', 'Action 0')), size: 50, visible: true, renderLabel: true },
                { action: new actions_1.$ii(), size: 1, visible: true, renderLabel: true },
                { action: new actions_1.$ii(), size: 1, visible: true, renderLabel: true },
                { action: disposables.add(new actions_1.$gi('action1', 'Action 1')), size: 50, visible: true, renderLabel: true },
            ];
            const result = (0, notebookEditorToolbar_1.$hrb)(actions, defaultSecondaryActions, 125);
            assert.deepEqual(result.primaryActions, [actions[0], actions[1], actions[3]]);
            assert.deepEqual(result.secondaryActions, defaultSecondaryActions);
        });
        test('should ignore separators when they are at the end of the resulting primary actions', () => {
            const actions = [
                { action: disposables.add(new actions_1.$gi('action0', 'Action 0')), size: 50, visible: true, renderLabel: true },
                { action: new actions_1.$ii(), size: 1, visible: true, renderLabel: true },
                { action: disposables.add(new actions_1.$gi('action1', 'Action 1')), size: 50, visible: true, renderLabel: true },
                { action: new actions_1.$ii(), size: 1, visible: true, renderLabel: true },
            ];
            const result = (0, notebookEditorToolbar_1.$hrb)(actions, defaultSecondaryActions, 200);
            assert.deepEqual(result.primaryActions, [actions[0], actions[1], actions[2]]);
            assert.deepEqual(result.secondaryActions, defaultSecondaryActions);
        });
        test('should keep actions with size 0 in primary actions', () => {
            const actions = [
                { action: disposables.add(new actions_1.$gi('action0', 'Action 0')), size: 50, visible: true, renderLabel: true },
                { action: disposables.add(new actions_1.$gi('action1', 'Action 1')), size: 50, visible: true, renderLabel: true },
                { action: disposables.add(new actions_1.$gi('action2', 'Action 2')), size: 50, visible: true, renderLabel: true },
                { action: disposables.add(new actions_1.$gi('action3', 'Action 3')), size: 0, visible: true, renderLabel: true },
            ];
            const result = (0, notebookEditorToolbar_1.$hrb)(actions, defaultSecondaryActions, 116);
            assert.deepEqual(result.primaryActions, [actions[0], actions[1], actions[3]]);
            assert.deepEqual(result.secondaryActions, [actions[2], separator, ...defaultSecondaryActionModels].map(action => action.action));
        });
        test('should not render separator if preceeded by size 0 action(s).', () => {
            const actions = [
                { action: disposables.add(new actions_1.$gi('action0', 'Action 0')), size: 0, visible: true, renderLabel: true },
                { action: new actions_1.$ii(), size: 1, visible: true, renderLabel: true },
                { action: disposables.add(new actions_1.$gi('action1', 'Action 1')), size: 50, visible: true, renderLabel: true },
            ];
            const result = (0, notebookEditorToolbar_1.$hrb)(actions, defaultSecondaryActions, 116);
            assert.deepEqual(result.primaryActions, [actions[0], actions[2]]);
            assert.deepEqual(result.secondaryActions, defaultSecondaryActions);
        });
        test('should not render second separator if space between is hidden (size 0) actions.', () => {
            const actions = [
                { action: disposables.add(new actions_1.$gi('action0', 'Action 0')), size: 50, visible: true, renderLabel: true },
                { action: new actions_1.$ii(), size: 1, visible: true, renderLabel: true },
                { action: disposables.add(new actions_1.$gi('action1', 'Action 1')), size: 0, visible: true, renderLabel: true },
                { action: disposables.add(new actions_1.$gi('action2', 'Action 2')), size: 0, visible: true, renderLabel: true },
                { action: new actions_1.$ii(), size: 1, visible: true, renderLabel: true },
                { action: disposables.add(new actions_1.$gi('action3', 'Action 3')), size: 50, visible: true, renderLabel: true },
            ];
            const result = (0, notebookEditorToolbar_1.$hrb)(actions, defaultSecondaryActions, 300);
            assert.deepEqual(result.primaryActions, [actions[0], actions[1], actions[2], actions[3], actions[5]]);
            assert.deepEqual(result.secondaryActions, defaultSecondaryActions);
        });
    });
    suite('Workbench Toolbar Dynamic calculateActions (strategy dynamic)', () => {
        const disposables = (0, utils_1.$bT)();
        const actionTemplate = [
            new actions_1.$gi('action0', 'Action 0'),
            new actions_1.$gi('action1', 'Action 1'),
            new actions_1.$gi('action2', 'Action 2'),
            new actions_1.$gi('action3', 'Action 3')
        ];
        const defaultSecondaryActionModels = [
            { action: new actions_1.$gi('secondaryAction0', 'Secondary Action 0'), size: 50, visible: true, renderLabel: true },
            { action: new actions_1.$gi('secondaryAction1', 'Secondary Action 1'), size: 50, visible: true, renderLabel: true },
            { action: new actions_1.$gi('secondaryAction2', 'Secondary Action 2'), size: 50, visible: true, renderLabel: true },
        ];
        const defaultSecondaryActions = defaultSecondaryActionModels.map(action => action.action);
        setup(function () {
            defaultSecondaryActionModels.forEach(action => disposables.add(action.action));
        });
        test('should return empty primary and secondary actions when given empty initial actions', () => {
            const result = (0, notebookEditorToolbar_1.$irb)([], [], 100);
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
            const result = (0, notebookEditorToolbar_1.$irb)(input, defaultSecondaryActions, constainerSize);
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
            const result = (0, notebookEditorToolbar_1.$irb)(input, defaultSecondaryActions, containerSize);
            assert.deepEqual(result.primaryActions, expected);
            assert.deepEqual(result.secondaryActions, [...defaultSecondaryActionModels].map(action => action.action));
        });
        test('should ignore second separator when two separators are in a row', () => {
            const containerSize = 200;
            const input = [
                { action: actionTemplate[0], size: 50, visible: true, renderLabel: true },
                { action: new actions_1.$ii(), size: 1, visible: true, renderLabel: true },
                { action: new actions_1.$ii(), size: 1, visible: true, renderLabel: true },
                { action: actionTemplate[1], size: 50, visible: true, renderLabel: true },
            ];
            const expected = [
                { action: actionTemplate[0], size: 50, visible: true, renderLabel: true },
                { action: new actions_1.$ii(), size: 1, visible: true, renderLabel: true },
                { action: actionTemplate[1], size: 50, visible: true, renderLabel: true },
            ];
            const result = (0, notebookEditorToolbar_1.$irb)(input, defaultSecondaryActions, containerSize);
            assert.deepEqual(result.primaryActions, expected);
            assert.deepEqual(result.secondaryActions, defaultSecondaryActions);
        });
        test('check label visibility in different groupings', () => {
            const containerSize = 150;
            const actions = [
                { action: actionTemplate[0], size: 50, visible: true, renderLabel: true },
                { action: new actions_1.$ii(), size: 1, visible: true, renderLabel: true },
                { action: actionTemplate[1], size: 50, visible: true, renderLabel: true },
                { action: actionTemplate[2], size: 50, visible: true, renderLabel: true },
            ];
            const expectedOutputActions = [
                { action: actionTemplate[0], size: 50, visible: true, renderLabel: true },
                { action: new actions_1.$ii(), size: 1, visible: true, renderLabel: true },
                { action: actionTemplate[1], size: 50, visible: true, renderLabel: false },
                { action: actionTemplate[2], size: 50, visible: true, renderLabel: false },
            ];
            const result = (0, notebookEditorToolbar_1.$irb)(actions, defaultSecondaryActions, containerSize);
            assert.deepEqual(result.primaryActions, expectedOutputActions);
            assert.deepEqual(result.secondaryActions, defaultSecondaryActions);
        });
        test('should ignore separators when they are at the end of the resulting primary actions', () => {
            const containerSize = 200;
            const input = [
                { action: actionTemplate[0], size: 50, visible: true, renderLabel: true },
                { action: new actions_1.$ii(), size: 1, visible: true, renderLabel: true },
                { action: actionTemplate[1], size: 50, visible: true, renderLabel: true },
                { action: new actions_1.$ii(), size: 1, visible: true, renderLabel: true },
            ];
            const expected = [
                { action: actionTemplate[0], size: 50, visible: true, renderLabel: true },
                { action: new actions_1.$ii(), size: 1, visible: true, renderLabel: true },
                { action: actionTemplate[1], size: 50, visible: true, renderLabel: true },
            ];
            const result = (0, notebookEditorToolbar_1.$irb)(input, defaultSecondaryActions, containerSize);
            assert.deepEqual(result.primaryActions, expected);
            assert.deepEqual(result.secondaryActions, defaultSecondaryActions);
        });
        test('should keep actions with size 0 in primary actions', () => {
            const containerSize = 170;
            const input = [
                { action: actionTemplate[0], size: 50, visible: true, renderLabel: true },
                { action: actionTemplate[1], size: 50, visible: true, renderLabel: true },
                { action: new actions_1.$ii(), size: 1, visible: true, renderLabel: true },
                { action: actionTemplate[2], size: 50, visible: true, renderLabel: true },
                { action: actionTemplate[3], size: 0, visible: true, renderLabel: true },
            ];
            const expected = [
                { action: actionTemplate[0], size: 50, visible: true, renderLabel: true },
                { action: actionTemplate[1], size: 50, visible: true, renderLabel: true },
                { action: new actions_1.$ii(), size: 1, visible: true, renderLabel: true },
                { action: actionTemplate[2], size: 50, visible: true, renderLabel: false },
                { action: actionTemplate[3], size: 0, visible: true, renderLabel: false },
            ];
            const result = (0, notebookEditorToolbar_1.$irb)(input, defaultSecondaryActions, containerSize);
            assert.deepEqual(result.primaryActions, expected);
            assert.deepEqual(result.secondaryActions, defaultSecondaryActions);
        });
        test('should not render separator if preceeded by size 0 action(s), but keep size 0 action in primary.', () => {
            const containerSize = 116;
            const input = [
                { action: actionTemplate[0], size: 0, visible: true, renderLabel: true },
                { action: new actions_1.$ii(), size: 1, visible: true, renderLabel: true },
                { action: actionTemplate[1], size: 50, visible: true, renderLabel: true }, // visible
            ];
            const expected = [
                { action: actionTemplate[0], size: 0, visible: true, renderLabel: true },
                { action: actionTemplate[1], size: 50, visible: true, renderLabel: true } // visible
            ];
            const result = (0, notebookEditorToolbar_1.$irb)(input, defaultSecondaryActions, containerSize);
            assert.deepEqual(result.primaryActions, expected);
            assert.deepEqual(result.secondaryActions, defaultSecondaryActions);
        });
        test('should not render second separator if space between is hidden (size 0) actions.', () => {
            const containerSize = 300;
            const input = [
                { action: actionTemplate[0], size: 50, visible: true, renderLabel: true },
                { action: new actions_1.$ii(), size: 1, visible: true, renderLabel: true },
                { action: actionTemplate[1], size: 0, visible: true, renderLabel: true },
                { action: actionTemplate[2], size: 0, visible: true, renderLabel: true },
                { action: new actions_1.$ii(), size: 1, visible: true, renderLabel: true },
                { action: actionTemplate[3], size: 50, visible: true, renderLabel: true },
            ];
            const expected = [
                { action: actionTemplate[0], size: 50, visible: true, renderLabel: true },
                { action: new actions_1.$ii(), size: 1, visible: true, renderLabel: true },
                { action: actionTemplate[1], size: 0, visible: true, renderLabel: true },
                { action: actionTemplate[2], size: 0, visible: true, renderLabel: true },
                // remove separator here
                { action: actionTemplate[3], size: 50, visible: true, renderLabel: true },
            ];
            const result = (0, notebookEditorToolbar_1.$irb)(input, defaultSecondaryActions, containerSize);
            assert.deepEqual(result.primaryActions, expected);
            assert.deepEqual(result.secondaryActions, defaultSecondaryActions);
        });
    });
});
//# sourceMappingURL=notebookWorkbenchToolbar.test.js.map