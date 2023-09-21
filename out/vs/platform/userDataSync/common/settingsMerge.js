/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/json", "vs/base/common/jsonEdit", "vs/base/common/jsonFormatter", "vs/base/common/objects", "vs/platform/userDataSync/common/content", "vs/platform/userDataSync/common/userDataSync"], function (require, exports, arrays_1, json_1, jsonEdit_1, jsonFormatter_1, objects, contentUtil, userDataSync_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.addSetting = exports.isEmpty = exports.merge = exports.updateIgnoredSettings = exports.removeComments = exports.getIgnoredSettings = void 0;
    function getIgnoredSettings(defaultIgnoredSettings, configurationService, settingsContent) {
        let value = [];
        if (settingsContent) {
            value = getIgnoredSettingsFromContent(settingsContent);
        }
        else {
            value = getIgnoredSettingsFromConfig(configurationService);
        }
        const added = [], removed = [...(0, userDataSync_1.getDisallowedIgnoredSettings)()];
        if (Array.isArray(value)) {
            for (const key of value) {
                if (key.startsWith('-')) {
                    removed.push(key.substring(1));
                }
                else {
                    added.push(key);
                }
            }
        }
        return (0, arrays_1.distinct)([...defaultIgnoredSettings, ...added,].filter(setting => !removed.includes(setting)));
    }
    exports.getIgnoredSettings = getIgnoredSettings;
    function getIgnoredSettingsFromConfig(configurationService) {
        let userValue = configurationService.inspect('settingsSync.ignoredSettings').userValue;
        if (userValue !== undefined) {
            return userValue;
        }
        userValue = configurationService.inspect('sync.ignoredSettings').userValue;
        if (userValue !== undefined) {
            return userValue;
        }
        return configurationService.getValue('settingsSync.ignoredSettings') || [];
    }
    function getIgnoredSettingsFromContent(settingsContent) {
        const parsed = (0, json_1.parse)(settingsContent);
        return parsed ? parsed['settingsSync.ignoredSettings'] || parsed['sync.ignoredSettings'] || [] : [];
    }
    function removeComments(content, formattingOptions) {
        const source = (0, json_1.parse)(content) || {};
        let result = '{}';
        for (const key of Object.keys(source)) {
            const edits = (0, jsonEdit_1.setProperty)(result, [key], source[key], formattingOptions);
            result = (0, jsonEdit_1.applyEdits)(result, edits);
        }
        return result;
    }
    exports.removeComments = removeComments;
    function updateIgnoredSettings(targetContent, sourceContent, ignoredSettings, formattingOptions) {
        if (ignoredSettings.length) {
            const sourceTree = parseSettings(sourceContent);
            const source = (0, json_1.parse)(sourceContent) || {};
            const target = (0, json_1.parse)(targetContent);
            if (!target) {
                return targetContent;
            }
            const settingsToAdd = [];
            for (const key of ignoredSettings) {
                const sourceValue = source[key];
                const targetValue = target[key];
                // Remove in target
                if (sourceValue === undefined) {
                    targetContent = contentUtil.edit(targetContent, [key], undefined, formattingOptions);
                }
                // Update in target
                else if (targetValue !== undefined) {
                    targetContent = contentUtil.edit(targetContent, [key], sourceValue, formattingOptions);
                }
                else {
                    settingsToAdd.push(findSettingNode(key, sourceTree));
                }
            }
            settingsToAdd.sort((a, b) => a.startOffset - b.startOffset);
            settingsToAdd.forEach(s => targetContent = addSetting(s.setting.key, sourceContent, targetContent, formattingOptions));
        }
        return targetContent;
    }
    exports.updateIgnoredSettings = updateIgnoredSettings;
    function merge(originalLocalContent, originalRemoteContent, baseContent, ignoredSettings, resolvedConflicts, formattingOptions) {
        const localContentWithoutIgnoredSettings = updateIgnoredSettings(originalLocalContent, originalRemoteContent, ignoredSettings, formattingOptions);
        const localForwarded = baseContent !== localContentWithoutIgnoredSettings;
        const remoteForwarded = baseContent !== originalRemoteContent;
        /* no changes */
        if (!localForwarded && !remoteForwarded) {
            return { conflictsSettings: [], localContent: null, remoteContent: null, hasConflicts: false };
        }
        /* local has changed and remote has not */
        if (localForwarded && !remoteForwarded) {
            return { conflictsSettings: [], localContent: null, remoteContent: localContentWithoutIgnoredSettings, hasConflicts: false };
        }
        /* remote has changed and local has not */
        if (remoteForwarded && !localForwarded) {
            return { conflictsSettings: [], localContent: updateIgnoredSettings(originalRemoteContent, originalLocalContent, ignoredSettings, formattingOptions), remoteContent: null, hasConflicts: false };
        }
        /* local is empty and not synced before */
        if (baseContent === null && isEmpty(originalLocalContent)) {
            const localContent = areSame(originalLocalContent, originalRemoteContent, ignoredSettings) ? null : updateIgnoredSettings(originalRemoteContent, originalLocalContent, ignoredSettings, formattingOptions);
            return { conflictsSettings: [], localContent, remoteContent: null, hasConflicts: false };
        }
        /* remote and local has changed */
        let localContent = originalLocalContent;
        let remoteContent = originalRemoteContent;
        const local = (0, json_1.parse)(originalLocalContent);
        const remote = (0, json_1.parse)(originalRemoteContent);
        const base = baseContent ? (0, json_1.parse)(baseContent) : null;
        const ignored = ignoredSettings.reduce((set, key) => { set.add(key); return set; }, new Set());
        const localToRemote = compare(local, remote, ignored);
        const baseToLocal = compare(base, local, ignored);
        const baseToRemote = compare(base, remote, ignored);
        const conflicts = new Map();
        const handledConflicts = new Set();
        const handleConflict = (conflictKey) => {
            handledConflicts.add(conflictKey);
            const resolvedConflict = resolvedConflicts.filter(({ key }) => key === conflictKey)[0];
            if (resolvedConflict) {
                localContent = contentUtil.edit(localContent, [conflictKey], resolvedConflict.value, formattingOptions);
                remoteContent = contentUtil.edit(remoteContent, [conflictKey], resolvedConflict.value, formattingOptions);
            }
            else {
                conflicts.set(conflictKey, { key: conflictKey, localValue: local[conflictKey], remoteValue: remote[conflictKey] });
            }
        };
        // Removed settings in Local
        for (const key of baseToLocal.removed.values()) {
            // Conflict - Got updated in remote.
            if (baseToRemote.updated.has(key)) {
                handleConflict(key);
            }
            // Also remove in remote
            else {
                remoteContent = contentUtil.edit(remoteContent, [key], undefined, formattingOptions);
            }
        }
        // Removed settings in Remote
        for (const key of baseToRemote.removed.values()) {
            if (handledConflicts.has(key)) {
                continue;
            }
            // Conflict - Got updated in local
            if (baseToLocal.updated.has(key)) {
                handleConflict(key);
            }
            // Also remove in locals
            else {
                localContent = contentUtil.edit(localContent, [key], undefined, formattingOptions);
            }
        }
        // Updated settings in Local
        for (const key of baseToLocal.updated.values()) {
            if (handledConflicts.has(key)) {
                continue;
            }
            // Got updated in remote
            if (baseToRemote.updated.has(key)) {
                // Has different value
                if (localToRemote.updated.has(key)) {
                    handleConflict(key);
                }
            }
            else {
                remoteContent = contentUtil.edit(remoteContent, [key], local[key], formattingOptions);
            }
        }
        // Updated settings in Remote
        for (const key of baseToRemote.updated.values()) {
            if (handledConflicts.has(key)) {
                continue;
            }
            // Got updated in local
            if (baseToLocal.updated.has(key)) {
                // Has different value
                if (localToRemote.updated.has(key)) {
                    handleConflict(key);
                }
            }
            else {
                localContent = contentUtil.edit(localContent, [key], remote[key], formattingOptions);
            }
        }
        // Added settings in Local
        for (const key of baseToLocal.added.values()) {
            if (handledConflicts.has(key)) {
                continue;
            }
            // Got added in remote
            if (baseToRemote.added.has(key)) {
                // Has different value
                if (localToRemote.updated.has(key)) {
                    handleConflict(key);
                }
            }
            else {
                remoteContent = addSetting(key, localContent, remoteContent, formattingOptions);
            }
        }
        // Added settings in remote
        for (const key of baseToRemote.added.values()) {
            if (handledConflicts.has(key)) {
                continue;
            }
            // Got added in local
            if (baseToLocal.added.has(key)) {
                // Has different value
                if (localToRemote.updated.has(key)) {
                    handleConflict(key);
                }
            }
            else {
                localContent = addSetting(key, remoteContent, localContent, formattingOptions);
            }
        }
        const hasConflicts = conflicts.size > 0 || !areSame(localContent, remoteContent, ignoredSettings);
        const hasLocalChanged = hasConflicts || !areSame(localContent, originalLocalContent, []);
        const hasRemoteChanged = hasConflicts || !areSame(remoteContent, originalRemoteContent, []);
        return { localContent: hasLocalChanged ? localContent : null, remoteContent: hasRemoteChanged ? remoteContent : null, conflictsSettings: [...conflicts.values()], hasConflicts };
    }
    exports.merge = merge;
    function areSame(localContent, remoteContent, ignoredSettings) {
        if (localContent === remoteContent) {
            return true;
        }
        const local = (0, json_1.parse)(localContent);
        const remote = (0, json_1.parse)(remoteContent);
        const ignored = ignoredSettings.reduce((set, key) => { set.add(key); return set; }, new Set());
        const localTree = parseSettings(localContent).filter(node => !(node.setting && ignored.has(node.setting.key)));
        const remoteTree = parseSettings(remoteContent).filter(node => !(node.setting && ignored.has(node.setting.key)));
        if (localTree.length !== remoteTree.length) {
            return false;
        }
        for (let index = 0; index < localTree.length; index++) {
            const localNode = localTree[index];
            const remoteNode = remoteTree[index];
            if (localNode.setting && remoteNode.setting) {
                if (localNode.setting.key !== remoteNode.setting.key) {
                    return false;
                }
                if (!objects.equals(local[localNode.setting.key], remote[localNode.setting.key])) {
                    return false;
                }
            }
            else if (!localNode.setting && !remoteNode.setting) {
                if (localNode.value !== remoteNode.value) {
                    return false;
                }
            }
            else {
                return false;
            }
        }
        return true;
    }
    function isEmpty(content) {
        if (content) {
            const nodes = parseSettings(content);
            return nodes.length === 0;
        }
        return true;
    }
    exports.isEmpty = isEmpty;
    function compare(from, to, ignored) {
        const fromKeys = from ? Object.keys(from).filter(key => !ignored.has(key)) : [];
        const toKeys = Object.keys(to).filter(key => !ignored.has(key));
        const added = toKeys.filter(key => !fromKeys.includes(key)).reduce((r, key) => { r.add(key); return r; }, new Set());
        const removed = fromKeys.filter(key => !toKeys.includes(key)).reduce((r, key) => { r.add(key); return r; }, new Set());
        const updated = new Set();
        if (from) {
            for (const key of fromKeys) {
                if (removed.has(key)) {
                    continue;
                }
                const value1 = from[key];
                const value2 = to[key];
                if (!objects.equals(value1, value2)) {
                    updated.add(key);
                }
            }
        }
        return { added, removed, updated };
    }
    function addSetting(key, sourceContent, targetContent, formattingOptions) {
        const source = (0, json_1.parse)(sourceContent);
        const sourceTree = parseSettings(sourceContent);
        const targetTree = parseSettings(targetContent);
        const insertLocation = getInsertLocation(key, sourceTree, targetTree);
        return insertAtLocation(targetContent, key, source[key], insertLocation, targetTree, formattingOptions);
    }
    exports.addSetting = addSetting;
    function getInsertLocation(key, sourceTree, targetTree) {
        const sourceNodeIndex = sourceTree.findIndex(node => node.setting?.key === key);
        const sourcePreviousNode = sourceTree[sourceNodeIndex - 1];
        if (sourcePreviousNode) {
            /*
                Previous node in source is a setting.
                Find the same setting in the target.
                Insert it after that setting
            */
            if (sourcePreviousNode.setting) {
                const targetPreviousSetting = findSettingNode(sourcePreviousNode.setting.key, targetTree);
                if (targetPreviousSetting) {
                    /* Insert after target's previous setting */
                    return { index: targetTree.indexOf(targetPreviousSetting), insertAfter: true };
                }
            }
            /* Previous node in source is a comment */
            else {
                const sourcePreviousSettingNode = findPreviousSettingNode(sourceNodeIndex, sourceTree);
                /*
                    Source has a setting defined before the setting to be added.
                    Find the same previous setting in the target.
                    If found, insert before its next setting so that comments are retrieved.
                    Otherwise, insert at the end.
                */
                if (sourcePreviousSettingNode) {
                    const targetPreviousSetting = findSettingNode(sourcePreviousSettingNode.setting.key, targetTree);
                    if (targetPreviousSetting) {
                        const targetNextSetting = findNextSettingNode(targetTree.indexOf(targetPreviousSetting), targetTree);
                        const sourceCommentNodes = findNodesBetween(sourceTree, sourcePreviousSettingNode, sourceTree[sourceNodeIndex]);
                        if (targetNextSetting) {
                            const targetCommentNodes = findNodesBetween(targetTree, targetPreviousSetting, targetNextSetting);
                            const targetCommentNode = findLastMatchingTargetCommentNode(sourceCommentNodes, targetCommentNodes);
                            if (targetCommentNode) {
                                return { index: targetTree.indexOf(targetCommentNode), insertAfter: true }; /* Insert after comment */
                            }
                            else {
                                return { index: targetTree.indexOf(targetNextSetting), insertAfter: false }; /* Insert before target next setting */
                            }
                        }
                        else {
                            const targetCommentNodes = findNodesBetween(targetTree, targetPreviousSetting, targetTree[targetTree.length - 1]);
                            const targetCommentNode = findLastMatchingTargetCommentNode(sourceCommentNodes, targetCommentNodes);
                            if (targetCommentNode) {
                                return { index: targetTree.indexOf(targetCommentNode), insertAfter: true }; /* Insert after comment */
                            }
                            else {
                                return { index: targetTree.length - 1, insertAfter: true }; /* Insert at the end */
                            }
                        }
                    }
                }
            }
            const sourceNextNode = sourceTree[sourceNodeIndex + 1];
            if (sourceNextNode) {
                /*
                    Next node in source is a setting.
                    Find the same setting in the target.
                    Insert it before that setting
                */
                if (sourceNextNode.setting) {
                    const targetNextSetting = findSettingNode(sourceNextNode.setting.key, targetTree);
                    if (targetNextSetting) {
                        /* Insert before target's next setting */
                        return { index: targetTree.indexOf(targetNextSetting), insertAfter: false };
                    }
                }
                /* Next node in source is a comment */
                else {
                    const sourceNextSettingNode = findNextSettingNode(sourceNodeIndex, sourceTree);
                    /*
                        Source has a setting defined after the setting to be added.
                        Find the same next setting in the target.
                        If found, insert after its previous setting so that comments are retrieved.
                        Otherwise, insert at the beginning.
                    */
                    if (sourceNextSettingNode) {
                        const targetNextSetting = findSettingNode(sourceNextSettingNode.setting.key, targetTree);
                        if (targetNextSetting) {
                            const targetPreviousSetting = findPreviousSettingNode(targetTree.indexOf(targetNextSetting), targetTree);
                            const sourceCommentNodes = findNodesBetween(sourceTree, sourceTree[sourceNodeIndex], sourceNextSettingNode);
                            if (targetPreviousSetting) {
                                const targetCommentNodes = findNodesBetween(targetTree, targetPreviousSetting, targetNextSetting);
                                const targetCommentNode = findLastMatchingTargetCommentNode(sourceCommentNodes.reverse(), targetCommentNodes.reverse());
                                if (targetCommentNode) {
                                    return { index: targetTree.indexOf(targetCommentNode), insertAfter: false }; /* Insert before comment */
                                }
                                else {
                                    return { index: targetTree.indexOf(targetPreviousSetting), insertAfter: true }; /* Insert after target previous setting */
                                }
                            }
                            else {
                                const targetCommentNodes = findNodesBetween(targetTree, targetTree[0], targetNextSetting);
                                const targetCommentNode = findLastMatchingTargetCommentNode(sourceCommentNodes.reverse(), targetCommentNodes.reverse());
                                if (targetCommentNode) {
                                    return { index: targetTree.indexOf(targetCommentNode), insertAfter: false }; /* Insert before comment */
                                }
                                else {
                                    return { index: 0, insertAfter: false }; /* Insert at the beginning */
                                }
                            }
                        }
                    }
                }
            }
        }
        /* Insert at the end */
        return { index: targetTree.length - 1, insertAfter: true };
    }
    function insertAtLocation(content, key, value, location, tree, formattingOptions) {
        let edits;
        /* Insert at the end */
        if (location.index === -1) {
            edits = (0, jsonEdit_1.setProperty)(content, [key], value, formattingOptions);
        }
        else {
            edits = getEditToInsertAtLocation(content, key, value, location, tree, formattingOptions).map(edit => (0, jsonEdit_1.withFormatting)(content, edit, formattingOptions)[0]);
        }
        return (0, jsonEdit_1.applyEdits)(content, edits);
    }
    function getEditToInsertAtLocation(content, key, value, location, tree, formattingOptions) {
        const newProperty = `${JSON.stringify(key)}: ${JSON.stringify(value)}`;
        const eol = (0, jsonFormatter_1.getEOL)(formattingOptions, content);
        const node = tree[location.index];
        if (location.insertAfter) {
            const edits = [];
            /* Insert after a setting */
            if (node.setting) {
                edits.push({ offset: node.endOffset, length: 0, content: ',' + newProperty });
            }
            /* Insert after a comment */
            else {
                const nextSettingNode = findNextSettingNode(location.index, tree);
                const previousSettingNode = findPreviousSettingNode(location.index, tree);
                const previousSettingCommaOffset = previousSettingNode?.setting?.commaOffset;
                /* If there is a previous setting and it does not has comma then add it */
                if (previousSettingNode && previousSettingCommaOffset === undefined) {
                    edits.push({ offset: previousSettingNode.endOffset, length: 0, content: ',' });
                }
                const isPreviouisSettingIncludesComment = previousSettingCommaOffset !== undefined && previousSettingCommaOffset > node.endOffset;
                edits.push({
                    offset: isPreviouisSettingIncludesComment ? previousSettingCommaOffset + 1 : node.endOffset,
                    length: 0,
                    content: nextSettingNode ? eol + newProperty + ',' : eol + newProperty
                });
            }
            return edits;
        }
        else {
            /* Insert before a setting */
            if (node.setting) {
                return [{ offset: node.startOffset, length: 0, content: newProperty + ',' }];
            }
            /* Insert before a comment */
            const content = (tree[location.index - 1] && !tree[location.index - 1].setting /* previous node is comment */ ? eol : '')
                + newProperty
                + (findNextSettingNode(location.index, tree) ? ',' : '')
                + eol;
            return [{ offset: node.startOffset, length: 0, content }];
        }
    }
    function findSettingNode(key, tree) {
        return tree.filter(node => node.setting?.key === key)[0];
    }
    function findPreviousSettingNode(index, tree) {
        for (let i = index - 1; i >= 0; i--) {
            if (tree[i].setting) {
                return tree[i];
            }
        }
        return undefined;
    }
    function findNextSettingNode(index, tree) {
        for (let i = index + 1; i < tree.length; i++) {
            if (tree[i].setting) {
                return tree[i];
            }
        }
        return undefined;
    }
    function findNodesBetween(nodes, from, till) {
        const fromIndex = nodes.indexOf(from);
        const tillIndex = nodes.indexOf(till);
        return nodes.filter((node, index) => fromIndex < index && index < tillIndex);
    }
    function findLastMatchingTargetCommentNode(sourceComments, targetComments) {
        if (sourceComments.length && targetComments.length) {
            let index = 0;
            for (; index < targetComments.length && index < sourceComments.length; index++) {
                if (sourceComments[index].value !== targetComments[index].value) {
                    return targetComments[index - 1];
                }
            }
            return targetComments[index - 1];
        }
        return undefined;
    }
    function parseSettings(content) {
        const nodes = [];
        let hierarchyLevel = -1;
        let startOffset;
        let key;
        const visitor = {
            onObjectBegin: (offset) => {
                hierarchyLevel++;
            },
            onObjectProperty: (name, offset, length) => {
                if (hierarchyLevel === 0) {
                    // this is setting key
                    startOffset = offset;
                    key = name;
                }
            },
            onObjectEnd: (offset, length) => {
                hierarchyLevel--;
                if (hierarchyLevel === 0) {
                    nodes.push({
                        startOffset,
                        endOffset: offset + length,
                        value: content.substring(startOffset, offset + length),
                        setting: {
                            key,
                            commaOffset: undefined
                        }
                    });
                }
            },
            onArrayBegin: (offset, length) => {
                hierarchyLevel++;
            },
            onArrayEnd: (offset, length) => {
                hierarchyLevel--;
                if (hierarchyLevel === 0) {
                    nodes.push({
                        startOffset,
                        endOffset: offset + length,
                        value: content.substring(startOffset, offset + length),
                        setting: {
                            key,
                            commaOffset: undefined
                        }
                    });
                }
            },
            onLiteralValue: (value, offset, length) => {
                if (hierarchyLevel === 0) {
                    nodes.push({
                        startOffset,
                        endOffset: offset + length,
                        value: content.substring(startOffset, offset + length),
                        setting: {
                            key,
                            commaOffset: undefined
                        }
                    });
                }
            },
            onSeparator: (sep, offset, length) => {
                if (hierarchyLevel === 0) {
                    if (sep === ',') {
                        let index = nodes.length - 1;
                        for (; index >= 0; index--) {
                            if (nodes[index].setting) {
                                break;
                            }
                        }
                        const node = nodes[index];
                        if (node) {
                            nodes.splice(index, 1, {
                                startOffset: node.startOffset,
                                endOffset: node.endOffset,
                                value: node.value,
                                setting: {
                                    key: node.setting.key,
                                    commaOffset: offset
                                }
                            });
                        }
                    }
                }
            },
            onComment: (offset, length) => {
                if (hierarchyLevel === 0) {
                    nodes.push({
                        startOffset: offset,
                        endOffset: offset + length,
                        value: content.substring(offset, offset + length),
                    });
                }
            }
        };
        (0, json_1.visit)(content, visitor);
        return nodes;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3NNZXJnZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3VzZXJEYXRhU3luYy9jb21tb24vc2V0dGluZ3NNZXJnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFtQmhHLFNBQWdCLGtCQUFrQixDQUFDLHNCQUFnQyxFQUFFLG9CQUEyQyxFQUFFLGVBQXdCO1FBQ3pJLElBQUksS0FBSyxHQUEwQixFQUFFLENBQUM7UUFDdEMsSUFBSSxlQUFlLEVBQUU7WUFDcEIsS0FBSyxHQUFHLDZCQUE2QixDQUFDLGVBQWUsQ0FBQyxDQUFDO1NBQ3ZEO2FBQU07WUFDTixLQUFLLEdBQUcsNEJBQTRCLENBQUMsb0JBQW9CLENBQUMsQ0FBQztTQUMzRDtRQUNELE1BQU0sS0FBSyxHQUFhLEVBQUUsRUFBRSxPQUFPLEdBQWEsQ0FBQyxHQUFHLElBQUEsMkNBQTRCLEdBQUUsQ0FBQyxDQUFDO1FBQ3BGLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUN6QixLQUFLLE1BQU0sR0FBRyxJQUFJLEtBQUssRUFBRTtnQkFDeEIsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFO29CQUN4QixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDL0I7cUJBQU07b0JBQ04sS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDaEI7YUFDRDtTQUNEO1FBQ0QsT0FBTyxJQUFBLGlCQUFRLEVBQUMsQ0FBQyxHQUFHLHNCQUFzQixFQUFFLEdBQUcsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN2RyxD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