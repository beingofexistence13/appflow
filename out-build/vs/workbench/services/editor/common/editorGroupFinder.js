/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/configuration/common/configuration", "vs/platform/editor/common/editor", "vs/workbench/common/editor", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService"], function (require, exports, configuration_1, editor_1, editor_2, editorGroupsService_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Rxb = void 0;
    function $Rxb(accessor, editor, preferredGroup) {
        const editorGroupService = accessor.get(editorGroupsService_1.$5C);
        const configurationService = accessor.get(configuration_1.$8h);
        const group = doFindGroup(editor, preferredGroup, editorGroupService, configurationService);
        // Resolve editor activation strategy
        let activation = undefined;
        if (editorGroupService.activeGroup !== group && // only if target group is not already active
            editor.options && !editor.options.inactive && // never for inactive editors
            editor.options.preserveFocus && // only if preserveFocus
            typeof editor.options.activation !== 'number' && // only if activation is not already defined (either true or false)
            preferredGroup !== editorService_1.$$C // never for the SIDE_GROUP
        ) {
            // If the resolved group is not the active one, we typically
            // want the group to become active. There are a few cases
            // where we stay away from encorcing this, e.g. if the caller
            // is already providing `activation`.
            //
            // Specifically for historic reasons we do not activate a
            // group is it is opened as `SIDE_GROUP` with `preserveFocus:true`.
            // repeated Alt-clicking of files in the explorer always open
            // into the same side group and not cause a group to be created each time.
            activation = editor_1.EditorActivation.ACTIVATE;
        }
        return [group, activation];
    }
    exports.$Rxb = $Rxb;
    function doFindGroup(input, preferredGroup, editorGroupService, configurationService) {
        let group;
        const editor = (0, editor_2.$YE)(input) ? input.editor : input;
        const options = input.options;
        // Group: Instance of Group
        if (preferredGroup && typeof preferredGroup !== 'number') {
            group = preferredGroup;
        }
        // Group: Specific Group
        else if (typeof preferredGroup === 'number' && preferredGroup >= 0) {
            group = editorGroupService.getGroup(preferredGroup);
        }
        // Group: Side by Side
        else if (preferredGroup === editorService_1.$$C) {
            const direction = (0, editorGroupsService_1.$8C)(configurationService);
            let candidateGroup = editorGroupService.findGroup({ direction });
            if (!candidateGroup || isGroupLockedForEditor(candidateGroup, editor)) {
                // Create new group either when the candidate group
                // is locked or was not found in the direction
                candidateGroup = editorGroupService.addGroup(editorGroupService.activeGroup, direction);
            }
            group = candidateGroup;
        }
        // Group: Unspecified without a specific index to open
        else if (!options || typeof options.index !== 'number') {
            const groupsByLastActive = editorGroupService.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */);
            // Respect option to reveal an editor if it is already visible in any group
            if (options?.revealIfVisible) {
                for (const lastActiveGroup of groupsByLastActive) {
                    if (isActive(lastActiveGroup, editor)) {
                        group = lastActiveGroup;
                        break;
                    }
                }
            }
            // Respect option to reveal an editor if it is open (not necessarily visible)
            // Still prefer to reveal an editor in a group where the editor is active though.
            // We also try to reveal an editor if it has the `Singleton` capability which
            // indicates that the same editor cannot be opened across groups.
            if (!group) {
                if (options?.revealIfOpened || configurationService.getValue('workbench.editor.revealIfOpen') || ((0, editor_2.$UE)(editor) && editor.hasCapability(8 /* EditorInputCapabilities.Singleton */))) {
                    let groupWithInputActive = undefined;
                    let groupWithInputOpened = undefined;
                    for (const group of groupsByLastActive) {
                        if (isOpened(group, editor)) {
                            if (!groupWithInputOpened) {
                                groupWithInputOpened = group;
                            }
                            if (!groupWithInputActive && group.isActive(editor)) {
                                groupWithInputActive = group;
                            }
                        }
                        if (groupWithInputOpened && groupWithInputActive) {
                            break; // we found all groups we wanted
                        }
                    }
                    // Prefer a target group where the input is visible
                    group = groupWithInputActive || groupWithInputOpened;
                }
            }
        }
        // Fallback to active group if target not valid but avoid
        // locked editor groups unless editor is already opened there
        if (!group) {
            let candidateGroup = editorGroupService.activeGroup;
            // Locked group: find the next non-locked group
            // going up the neigbours of the group or create
            // a new group otherwise
            if (isGroupLockedForEditor(candidateGroup, editor)) {
                for (const group of editorGroupService.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */)) {
                    if (isGroupLockedForEditor(group, editor)) {
                        continue;
                    }
                    candidateGroup = group;
                    break;
                }
                if (isGroupLockedForEditor(candidateGroup, editor)) {
                    // Group is still locked, so we have to create a new
                    // group to the side of the candidate group
                    group = editorGroupService.addGroup(candidateGroup, (0, editorGroupsService_1.$8C)(configurationService));
                }
                else {
                    group = candidateGroup;
                }
            }
            // Non-locked group: take as is
            else {
                group = candidateGroup;
            }
        }
        return group;
    }
    function isGroupLockedForEditor(group, editor) {
        if (!group.isLocked) {
            // only relevant for locked editor groups
            return false;
        }
        if (isOpened(group, editor)) {
            // special case: the locked group contains
            // the provided editor. in that case we do not want
            // to open the editor in any different group.
            return false;
        }
        // group is locked for this editor
        return true;
    }
    function isActive(group, editor) {
        if (!group.activeEditor) {
            return false;
        }
        return group.activeEditor.matches(editor);
    }
    function isOpened(group, editor) {
        for (const typedEditor of group.editors) {
            if (typedEditor.matches(editor)) {
                return true;
            }
        }
        return false;
    }
});
//# sourceMappingURL=editorGroupFinder.js.map