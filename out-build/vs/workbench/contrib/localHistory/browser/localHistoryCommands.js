/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/localHistory/browser/localHistoryCommands", "vs/base/common/uri", "vs/base/common/event", "vs/base/common/network", "vs/base/common/errorMessage", "vs/base/common/cancellation", "vs/workbench/services/workingCopy/common/workingCopyHistory", "vs/workbench/browser/parts/editor/editorCommands", "vs/workbench/contrib/localHistory/browser/localHistoryFileSystemProvider", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/common/actions", "vs/base/common/resources", "vs/platform/commands/common/commands", "vs/workbench/common/editor", "vs/platform/files/common/files", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/platform/dialogs/common/dialogs", "vs/workbench/services/editor/common/editorService", "vs/workbench/common/contextkeys", "vs/platform/quickinput/common/quickInput", "vs/editor/common/services/getIconClasses", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/platform/label/common/label", "vs/base/common/arrays", "vs/workbench/contrib/localHistory/browser/localHistory", "vs/workbench/services/path/common/pathService"], function (require, exports, nls_1, uri_1, event_1, network_1, errorMessage_1, cancellation_1, workingCopyHistory_1, editorCommands_1, localHistoryFileSystemProvider_1, contextkey_1, actions_1, resources_1, commands_1, editor_1, files_1, workingCopyService_1, dialogs_1, editorService_1, contextkeys_1, quickInput_1, getIconClasses_1, model_1, language_1, label_1, arrays_1, localHistory_1, pathService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$F1b = exports.$E1b = exports.$D1b = void 0;
    const LOCAL_HISTORY_CATEGORY = { value: (0, nls_1.localize)(0, null), original: 'Local History' };
    //#region Compare with File
    exports.$D1b = { value: (0, nls_1.localize)(1, null), original: 'Compare with File' };
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.localHistory.compareWithFile',
                title: exports.$D1b,
                menu: {
                    id: actions_1.$Ru.TimelineItemContext,
                    group: '1_compare',
                    order: 1,
                    when: localHistory_1.$A1b
                }
            });
        }
        async run(accessor, item) {
            const commandService = accessor.get(commands_1.$Fr);
            const workingCopyHistoryService = accessor.get(workingCopyHistory_1.$v1b);
            const { entry } = await $F1b(workingCopyHistoryService, item);
            if (entry) {
                return commandService.executeCommand(editorCommands_1.$Xub, ...$E1b(entry, entry.workingCopy.resource));
            }
        }
    });
    //#endregion
    //#region Compare with Previous
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.localHistory.compareWithPrevious',
                title: { value: (0, nls_1.localize)(2, null), original: 'Compare with Previous' },
                menu: {
                    id: actions_1.$Ru.TimelineItemContext,
                    group: '1_compare',
                    order: 2,
                    when: localHistory_1.$A1b
                }
            });
        }
        async run(accessor, item) {
            const commandService = accessor.get(commands_1.$Fr);
            const workingCopyHistoryService = accessor.get(workingCopyHistory_1.$v1b);
            const editorService = accessor.get(editorService_1.$9C);
            const { entry, previous } = await $F1b(workingCopyHistoryService, item);
            if (entry) {
                // Without a previous entry, just show the entry directly
                if (!previous) {
                    return openEntry(entry, editorService);
                }
                // Open real diff editor
                return commandService.executeCommand(editorCommands_1.$Xub, ...$E1b(previous, entry));
            }
        }
    });
    //#endregion
    //#region Select for Compare / Compare with Selected
    let itemSelectedForCompare = undefined;
    const LocalHistoryItemSelectedForCompare = new contextkey_1.$2i('localHistoryItemSelectedForCompare', false, true);
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.localHistory.selectForCompare',
                title: { value: (0, nls_1.localize)(3, null), original: 'Select for Compare' },
                menu: {
                    id: actions_1.$Ru.TimelineItemContext,
                    group: '2_compare_with',
                    order: 2,
                    when: localHistory_1.$A1b
                }
            });
        }
        async run(accessor, item) {
            const workingCopyHistoryService = accessor.get(workingCopyHistory_1.$v1b);
            const contextKeyService = accessor.get(contextkey_1.$3i);
            const { entry } = await $F1b(workingCopyHistoryService, item);
            if (entry) {
                itemSelectedForCompare = item;
                LocalHistoryItemSelectedForCompare.bindTo(contextKeyService).set(true);
            }
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.localHistory.compareWithSelected',
                title: { value: (0, nls_1.localize)(4, null), original: 'Compare with Selected' },
                menu: {
                    id: actions_1.$Ru.TimelineItemContext,
                    group: '2_compare_with',
                    order: 1,
                    when: contextkey_1.$Ii.and(localHistory_1.$A1b, LocalHistoryItemSelectedForCompare)
                }
            });
        }
        async run(accessor, item) {
            const workingCopyHistoryService = accessor.get(workingCopyHistory_1.$v1b);
            const commandService = accessor.get(commands_1.$Fr);
            if (!itemSelectedForCompare) {
                return;
            }
            const selectedEntry = (await $F1b(workingCopyHistoryService, itemSelectedForCompare)).entry;
            if (!selectedEntry) {
                return;
            }
            const { entry } = await $F1b(workingCopyHistoryService, item);
            if (entry) {
                return commandService.executeCommand(editorCommands_1.$Xub, ...$E1b(selectedEntry, entry));
            }
        }
    });
    //#endregion
    //#region Show Contents
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.localHistory.open',
                title: { value: (0, nls_1.localize)(5, null), original: 'Show Contents' },
                menu: {
                    id: actions_1.$Ru.TimelineItemContext,
                    group: '3_contents',
                    order: 1,
                    when: localHistory_1.$A1b
                }
            });
        }
        async run(accessor, item) {
            const workingCopyHistoryService = accessor.get(workingCopyHistory_1.$v1b);
            const editorService = accessor.get(editorService_1.$9C);
            const { entry } = await $F1b(workingCopyHistoryService, item);
            if (entry) {
                return openEntry(entry, editorService);
            }
        }
    });
    //#region Restore Contents
    const RESTORE_CONTENTS_LABEL = { value: (0, nls_1.localize)(6, null), original: 'Restore Contents' };
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.localHistory.restoreViaEditor',
                title: RESTORE_CONTENTS_LABEL,
                menu: {
                    id: actions_1.$Ru.EditorTitle,
                    group: 'navigation',
                    order: -10,
                    when: contextkeys_1.$Kdb.Scheme.isEqualTo(localHistoryFileSystemProvider_1.$x1b.SCHEMA)
                },
                icon: localHistory_1.$C1b
            });
        }
        async run(accessor, uri) {
            const { associatedResource, location } = localHistoryFileSystemProvider_1.$x1b.fromLocalHistoryFileSystem(uri);
            return restore(accessor, { uri: associatedResource, handle: (0, resources_1.$eg)(location) });
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.localHistory.restore',
                title: RESTORE_CONTENTS_LABEL,
                menu: {
                    id: actions_1.$Ru.TimelineItemContext,
                    group: '3_contents',
                    order: 2,
                    when: localHistory_1.$A1b
                }
            });
        }
        async run(accessor, item) {
            return restore(accessor, item);
        }
    });
    const restoreSaveSource = editor_1.$SE.registerSource('localHistoryRestore.source', (0, nls_1.localize)(7, null));
    async function restore(accessor, item) {
        const fileService = accessor.get(files_1.$6j);
        const dialogService = accessor.get(dialogs_1.$oA);
        const workingCopyService = accessor.get(workingCopyService_1.$TC);
        const workingCopyHistoryService = accessor.get(workingCopyHistory_1.$v1b);
        const editorService = accessor.get(editorService_1.$9C);
        const { entry } = await $F1b(workingCopyHistoryService, item);
        if (entry) {
            // Ask for confirmation
            const { confirmed } = await dialogService.confirm({
                type: 'warning',
                message: (0, nls_1.localize)(8, null, (0, resources_1.$fg)(entry.workingCopy.resource)),
                detail: (0, nls_1.localize)(9, null),
                primaryButton: (0, nls_1.localize)(10, null)
            });
            if (!confirmed) {
                return;
            }
            // Revert all dirty working copies for target
            const workingCopies = workingCopyService.getAll(entry.workingCopy.resource);
            if (workingCopies) {
                for (const workingCopy of workingCopies) {
                    if (workingCopy.isDirty()) {
                        await workingCopy.revert({ soft: true });
                    }
                }
            }
            // Replace target with contents of history entry
            try {
                await fileService.cloneFile(entry.location, entry.workingCopy.resource);
            }
            catch (error) {
                // It is possible that we fail to copy the history entry to the
                // destination, for example when the destination is write protected.
                // In that case tell the user and return, it is still possible for
                // the user to manually copy the changes over from the diff editor.
                await dialogService.error((0, nls_1.localize)(11, null, (0, resources_1.$fg)(entry.workingCopy.resource)), (0, errorMessage_1.$mi)(error));
                return;
            }
            // Restore all working copies for target
            if (workingCopies) {
                for (const workingCopy of workingCopies) {
                    await workingCopy.revert({ force: true });
                }
            }
            // Open target
            await editorService.openEditor({ resource: entry.workingCopy.resource });
            // Add new entry
            await workingCopyHistoryService.addEntry({
                resource: entry.workingCopy.resource,
                source: restoreSaveSource
            }, cancellation_1.CancellationToken.None);
            // Close source
            await closeEntry(entry, editorService);
        }
    }
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.localHistory.restoreViaPicker',
                title: { value: (0, nls_1.localize)(12, null), original: 'Find Entry to Restore' },
                f1: true,
                category: LOCAL_HISTORY_CATEGORY
            });
        }
        async run(accessor) {
            const workingCopyHistoryService = accessor.get(workingCopyHistory_1.$v1b);
            const quickInputService = accessor.get(quickInput_1.$Gq);
            const modelService = accessor.get(model_1.$yA);
            const languageService = accessor.get(language_1.$ct);
            const labelService = accessor.get(label_1.$Vz);
            const editorService = accessor.get(editorService_1.$9C);
            const fileService = accessor.get(files_1.$6j);
            const commandService = accessor.get(commands_1.$Fr);
            // Show all resources with associated history entries in picker
            // with progress because this operation will take longer the more
            // files have been saved overall.
            const resourcePicker = quickInputService.createQuickPick();
            let cts = new cancellation_1.$pd();
            resourcePicker.onDidHide(() => cts.dispose(true));
            resourcePicker.busy = true;
            resourcePicker.show();
            const resources = await workingCopyHistoryService.getAll(cts.token);
            resourcePicker.busy = false;
            resourcePicker.placeholder = (0, nls_1.localize)(13, null);
            resourcePicker.matchOnLabel = true;
            resourcePicker.matchOnDescription = true;
            resourcePicker.items = resources.map(resource => ({
                resource,
                label: (0, resources_1.$eg)(resource),
                description: labelService.getUriLabel((0, resources_1.$hg)(resource), { relative: true }),
                iconClasses: (0, getIconClasses_1.$x6)(modelService, languageService, resource)
            })).sort((r1, r2) => r1.resource.fsPath < r2.resource.fsPath ? -1 : 1);
            await event_1.Event.toPromise(resourcePicker.onDidAccept);
            resourcePicker.dispose();
            const resource = (0, arrays_1.$Mb)(resourcePicker.selectedItems)?.resource;
            if (!resource) {
                return;
            }
            // Show all entries for the picked resource in another picker
            // and open the entry in the end that was selected by the user
            const entryPicker = quickInputService.createQuickPick();
            cts = new cancellation_1.$pd();
            entryPicker.onDidHide(() => cts.dispose(true));
            entryPicker.busy = true;
            entryPicker.show();
            const entries = await workingCopyHistoryService.getEntries(resource, cts.token);
            entryPicker.busy = false;
            entryPicker.placeholder = (0, nls_1.localize)(14, null);
            entryPicker.matchOnLabel = true;
            entryPicker.matchOnDescription = true;
            entryPicker.items = Array.from(entries).reverse().map(entry => ({
                entry,
                label: `$(circle-outline) ${editor_1.$SE.getSourceLabel(entry.source)}`,
                description: toLocalHistoryEntryDateLabel(entry.timestamp)
            }));
            await event_1.Event.toPromise(entryPicker.onDidAccept);
            entryPicker.dispose();
            const selectedItem = (0, arrays_1.$Mb)(entryPicker.selectedItems);
            if (!selectedItem) {
                return;
            }
            const resourceExists = await fileService.exists(selectedItem.entry.workingCopy.resource);
            if (resourceExists) {
                return commandService.executeCommand(editorCommands_1.$Xub, ...$E1b(selectedItem.entry, selectedItem.entry.workingCopy.resource));
            }
            return openEntry(selectedItem.entry, editorService);
        }
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.TimelineTitle, { command: { id: 'workbench.action.localHistory.restoreViaPicker', title: { value: (0, nls_1.localize)(15, null), original: 'Local History: Find Entry to Restore...' } }, group: 'submenu', order: 1 });
    //#endregion
    //#region Rename
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.localHistory.rename',
                title: { value: (0, nls_1.localize)(16, null), original: 'Rename' },
                menu: {
                    id: actions_1.$Ru.TimelineItemContext,
                    group: '5_edit',
                    order: 1,
                    when: localHistory_1.$A1b
                }
            });
        }
        async run(accessor, item) {
            const workingCopyHistoryService = accessor.get(workingCopyHistory_1.$v1b);
            const quickInputService = accessor.get(quickInput_1.$Gq);
            const { entry } = await $F1b(workingCopyHistoryService, item);
            if (entry) {
                const inputBox = quickInputService.createInputBox();
                inputBox.title = (0, nls_1.localize)(17, null);
                inputBox.ignoreFocusOut = true;
                inputBox.placeholder = (0, nls_1.localize)(18, null);
                inputBox.value = editor_1.$SE.getSourceLabel(entry.source);
                inputBox.show();
                inputBox.onDidAccept(() => {
                    if (inputBox.value) {
                        workingCopyHistoryService.updateEntry(entry, { source: inputBox.value }, cancellation_1.CancellationToken.None);
                    }
                    inputBox.dispose();
                });
            }
        }
    });
    //#endregion
    //#region Delete
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.localHistory.delete',
                title: { value: (0, nls_1.localize)(19, null), original: 'Delete' },
                menu: {
                    id: actions_1.$Ru.TimelineItemContext,
                    group: '5_edit',
                    order: 2,
                    when: localHistory_1.$A1b
                }
            });
        }
        async run(accessor, item) {
            const workingCopyHistoryService = accessor.get(workingCopyHistory_1.$v1b);
            const editorService = accessor.get(editorService_1.$9C);
            const dialogService = accessor.get(dialogs_1.$oA);
            const { entry } = await $F1b(workingCopyHistoryService, item);
            if (entry) {
                // Ask for confirmation
                const { confirmed } = await dialogService.confirm({
                    type: 'warning',
                    message: (0, nls_1.localize)(20, null, entry.workingCopy.name, toLocalHistoryEntryDateLabel(entry.timestamp)),
                    detail: (0, nls_1.localize)(21, null),
                    primaryButton: (0, nls_1.localize)(22, null),
                });
                if (!confirmed) {
                    return;
                }
                // Remove via service
                await workingCopyHistoryService.removeEntry(entry, cancellation_1.CancellationToken.None);
                // Close any opened editors
                await closeEntry(entry, editorService);
            }
        }
    });
    //#endregion
    //#region Delete All
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.localHistory.deleteAll',
                title: { value: (0, nls_1.localize)(23, null), original: 'Delete All' },
                f1: true,
                category: LOCAL_HISTORY_CATEGORY
            });
        }
        async run(accessor) {
            const dialogService = accessor.get(dialogs_1.$oA);
            const workingCopyHistoryService = accessor.get(workingCopyHistory_1.$v1b);
            // Ask for confirmation
            const { confirmed } = await dialogService.confirm({
                type: 'warning',
                message: (0, nls_1.localize)(24, null),
                detail: (0, nls_1.localize)(25, null),
                primaryButton: (0, nls_1.localize)(26, null),
            });
            if (!confirmed) {
                return;
            }
            // Remove via service
            await workingCopyHistoryService.removeAll(cancellation_1.CancellationToken.None);
        }
    });
    //#endregion
    //#region Create
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.localHistory.create',
                title: { value: (0, nls_1.localize)(27, null), original: 'Create Entry' },
                f1: true,
                category: LOCAL_HISTORY_CATEGORY,
                precondition: contextkeys_1.$$cb
            });
        }
        async run(accessor) {
            const workingCopyHistoryService = accessor.get(workingCopyHistory_1.$v1b);
            const quickInputService = accessor.get(quickInput_1.$Gq);
            const editorService = accessor.get(editorService_1.$9C);
            const labelService = accessor.get(label_1.$Vz);
            const pathService = accessor.get(pathService_1.$yJ);
            const resource = editor_1.$3E.getOriginalUri(editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            if (resource?.scheme !== pathService.defaultUriScheme && resource?.scheme !== network_1.Schemas.vscodeUserData) {
                return; // only enable for selected schemes
            }
            const inputBox = quickInputService.createInputBox();
            inputBox.title = (0, nls_1.localize)(28, null);
            inputBox.ignoreFocusOut = true;
            inputBox.placeholder = (0, nls_1.localize)(29, null, labelService.getUriBasenameLabel(resource));
            inputBox.show();
            inputBox.onDidAccept(async () => {
                const entrySource = inputBox.value;
                inputBox.dispose();
                if (entrySource) {
                    await workingCopyHistoryService.addEntry({ resource, source: inputBox.value }, cancellation_1.CancellationToken.None);
                }
            });
        }
    });
    //#endregion
    //#region Helpers
    async function openEntry(entry, editorService) {
        const resource = localHistoryFileSystemProvider_1.$x1b.toLocalHistoryFileSystem({ location: entry.location, associatedResource: entry.workingCopy.resource });
        await editorService.openEditor({
            resource,
            label: (0, nls_1.localize)(30, null, entry.workingCopy.name, editor_1.$SE.getSourceLabel(entry.source), toLocalHistoryEntryDateLabel(entry.timestamp))
        });
    }
    async function closeEntry(entry, editorService) {
        const resource = localHistoryFileSystemProvider_1.$x1b.toLocalHistoryFileSystem({ location: entry.location, associatedResource: entry.workingCopy.resource });
        const editors = editorService.findEditors(resource, { supportSideBySide: editor_1.SideBySideEditor.ANY });
        await editorService.closeEditors(editors, { preserveFocus: true });
    }
    function $E1b(arg1, arg2) {
        // Left hand side is always a working copy history entry
        const originalResource = localHistoryFileSystemProvider_1.$x1b.toLocalHistoryFileSystem({ location: arg1.location, associatedResource: arg1.workingCopy.resource });
        let label;
        // Right hand side depends on how the method was called
        // and is either another working copy history entry
        // or the file on disk.
        let modifiedResource;
        // Compare with file on disk
        if (uri_1.URI.isUri(arg2)) {
            const resource = arg2;
            modifiedResource = resource;
            label = (0, nls_1.localize)(31, null, arg1.workingCopy.name, editor_1.$SE.getSourceLabel(arg1.source), toLocalHistoryEntryDateLabel(arg1.timestamp), arg1.workingCopy.name);
        }
        // Compare with another entry
        else {
            const modified = arg2;
            modifiedResource = localHistoryFileSystemProvider_1.$x1b.toLocalHistoryFileSystem({ location: modified.location, associatedResource: modified.workingCopy.resource });
            label = (0, nls_1.localize)(32, null, arg1.workingCopy.name, editor_1.$SE.getSourceLabel(arg1.source), toLocalHistoryEntryDateLabel(arg1.timestamp), modified.workingCopy.name, editor_1.$SE.getSourceLabel(modified.source), toLocalHistoryEntryDateLabel(modified.timestamp));
        }
        return [
            originalResource,
            modifiedResource,
            label,
            undefined // important to keep order of arguments in command proper
        ];
    }
    exports.$E1b = $E1b;
    async function $F1b(workingCopyHistoryService, descriptor) {
        const entries = await workingCopyHistoryService.getEntries(descriptor.uri, cancellation_1.CancellationToken.None);
        let currentEntry = undefined;
        let previousEntry = undefined;
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            if (entry.id === descriptor.handle) {
                currentEntry = entry;
                previousEntry = entries[i - 1];
                break;
            }
        }
        return {
            entry: currentEntry,
            previous: previousEntry
        };
    }
    exports.$F1b = $F1b;
    const SEP = /\//g;
    function toLocalHistoryEntryDateLabel(timestamp) {
        return `${(0, localHistory_1.$y1b)().format(timestamp).replace(SEP, '-')}`; // preserving `/` will break editor labels, so replace it with a non-path symbol
    }
});
//#endregion
//# sourceMappingURL=localHistoryCommands.js.map