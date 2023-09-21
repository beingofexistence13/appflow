/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/configuration/common/configuration", "vs/platform/editor/common/editor", "vs/workbench/common/editor", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService"], function (require, exports, configuration_1, editor_1, editor_2, editorGroupsService_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.findGroup = void 0;
    function findGroup(accessor, editor, preferredGroup) {
        const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
        const configurationService = accessor.get(configuration_1.IConfigurationService);
        const group = doFindGroup(editor, preferredGroup, editorGroupService, configurationService);
        // Resolve editor activation strategy
        let activation = undefined;
        if (editorGroupService.activeGroup !== group && // only if target group is not already active
            editor.options && !editor.options.inactive && // never for inactive editors
            editor.options.preserveFocus && // only if preserveFocus
            typeof editor.options.activation !== 'number' && // only if activation is not already defined (either true or false)
            preferredGroup !== editorService_1.SIDE_GROUP // never for the SIDE_GROUP
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
    exports.findGroup = findGroup;
    function doFindGroup(input, preferredGroup, editorGroupService, configurationService) {
        let group;
        const editor = (0, editor_2.isEditorInputWithOptions)(input) ? input.editor : input;
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
        else if (preferredGroup === editorService_1.SIDE_GROUP) {
            const direction = (0, editorGroupsService_1.preferredSideBySideGroupDirection)(configurationService);
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
                if (options?.revealIfOpened || configurationService.getValue('workbench.editor.revealIfOpen') || ((0, editor_2.isEditorInput)(editor) && editor.hasCapability(8 /* EditorInputCapabilities.Singleton */))) {
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
                    group = editorGroupService.addGroup(candidateGroup, (0, editorGroupsService_1.preferredSideBySideGroupDirection)(configurationService));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yR3JvdXBGaW5kZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvZWRpdG9yL2NvbW1vbi9lZGl0b3JHcm91cEZpbmRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFrQmhHLFNBQWdCLFNBQVMsQ0FBQyxRQUEwQixFQUFFLE1BQW9ELEVBQUUsY0FBMEM7UUFDckosTUFBTSxrQkFBa0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDBDQUFvQixDQUFDLENBQUM7UUFDOUQsTUFBTSxvQkFBb0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHFDQUFxQixDQUFDLENBQUM7UUFFakUsTUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLE1BQU0sRUFBRSxjQUFjLEVBQUUsa0JBQWtCLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztRQUU1RixxQ0FBcUM7UUFDckMsSUFBSSxVQUFVLEdBQWlDLFNBQVMsQ0FBQztRQUN6RCxJQUNDLGtCQUFrQixDQUFDLFdBQVcsS0FBSyxLQUFLLElBQUssNkNBQTZDO1lBQzFGLE1BQU0sQ0FBQyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsSUFBSyw2QkFBNkI7WUFDNUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxhQUFhLElBQVMsd0JBQXdCO1lBQzdELE9BQU8sTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEtBQUssUUFBUSxJQUFJLG1FQUFtRTtZQUNwSCxjQUFjLEtBQUssMEJBQVUsQ0FBTSwyQkFBMkI7VUFDN0Q7WUFDRCw0REFBNEQ7WUFDNUQseURBQXlEO1lBQ3pELDZEQUE2RDtZQUM3RCxxQ0FBcUM7WUFDckMsRUFBRTtZQUNGLHlEQUF5RDtZQUN6RCxtRUFBbUU7WUFDbkUsNkRBQTZEO1lBQzdELDBFQUEwRTtZQUMxRSxVQUFVLEdBQUcseUJBQWdCLENBQUMsUUFB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