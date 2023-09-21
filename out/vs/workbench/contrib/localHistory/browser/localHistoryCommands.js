/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/uri", "vs/base/common/event", "vs/base/common/network", "vs/base/common/errorMessage", "vs/base/common/cancellation", "vs/workbench/services/workingCopy/common/workingCopyHistory", "vs/workbench/browser/parts/editor/editorCommands", "vs/workbench/contrib/localHistory/browser/localHistoryFileSystemProvider", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/common/actions", "vs/base/common/resources", "vs/platform/commands/common/commands", "vs/workbench/common/editor", "vs/platform/files/common/files", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/platform/dialogs/common/dialogs", "vs/workbench/services/editor/common/editorService", "vs/workbench/common/contextkeys", "vs/platform/quickinput/common/quickInput", "vs/editor/common/services/getIconClasses", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/platform/label/common/label", "vs/base/common/arrays", "vs/workbench/contrib/localHistory/browser/localHistory", "vs/workbench/services/path/common/pathService"], function (require, exports, nls_1, uri_1, event_1, network_1, errorMessage_1, cancellation_1, workingCopyHistory_1, editorCommands_1, localHistoryFileSystemProvider_1, contextkey_1, actions_1, resources_1, commands_1, editor_1, files_1, workingCopyService_1, dialogs_1, editorService_1, contextkeys_1, quickInput_1, getIconClasses_1, model_1, language_1, label_1, arrays_1, localHistory_1, pathService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.findLocalHistoryEntry = exports.toDiffEditorArguments = exports.COMPARE_WITH_FILE_LABEL = void 0;
    const LOCAL_HISTORY_CATEGORY = { value: (0, nls_1.localize)('localHistory.category', "Local History"), original: 'Local History' };
    //#region Compare with File
    exports.COMPARE_WITH_FILE_LABEL = { value: (0, nls_1.localize)('localHistory.compareWithFile', "Compare with File"), original: 'Compare with File' };
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.localHistory.compareWithFile',
                title: exports.COMPARE_WITH_FILE_LABEL,
                menu: {
                    id: actions_1.MenuId.TimelineItemContext,
                    group: '1_compare',
                    order: 1,
                    when: localHistory_1.LOCAL_HISTORY_MENU_CONTEXT_KEY
                }
            });
        }
        async run(accessor, item) {
            const commandService = accessor.get(commands_1.ICommandService);
            const workingCopyHistoryService = accessor.get(workingCopyHistory_1.IWorkingCopyHistoryService);
            const { entry } = await findLocalHistoryEntry(workingCopyHistoryService, item);
            if (entry) {
                return commandService.executeCommand(editorCommands_1.API_OPEN_DIFF_EDITOR_COMMAND_ID, ...toDiffEditorArguments(entry, entry.workingCopy.resource));
            }
        }
    });
    //#endregion
    //#region Compare with Previous
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.localHistory.compareWithPrevious',
                title: { value: (0, nls_1.localize)('localHistory.compareWithPrevious', "Compare with Previous"), original: 'Compare with Previous' },
                menu: {
                    id: actions_1.MenuId.TimelineItemContext,
                    group: '1_compare',
                    order: 2,
                    when: localHistory_1.LOCAL_HISTORY_MENU_CONTEXT_KEY
                }
            });
        }
        async run(accessor, item) {
            const commandService = accessor.get(commands_1.ICommandService);
            const workingCopyHistoryService = accessor.get(workingCopyHistory_1.IWorkingCopyHistoryService);
            const editorService = accessor.get(editorService_1.IEditorService);
            const { entry, previous } = await findLocalHistoryEntry(workingCopyHistoryService, item);
            if (entry) {
                // Without a previous entry, just show the entry directly
                if (!previous) {
                    return openEntry(entry, editorService);
                }
                // Open real diff editor
                return commandService.executeCommand(editorCommands_1.API_OPEN_DIFF_EDITOR_COMMAND_ID, ...toDiffEditorArguments(previous, entry));
            }
        }
    });
    //#endregion
    //#region Select for Compare / Compare with Selected
    let itemSelectedForCompare = undefined;
    const LocalHistoryItemSelectedForCompare = new contextkey_1.RawContextKey('localHistoryItemSelectedForCompare', false, true);
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.localHistory.selectForCompare',
                title: { value: (0, nls_1.localize)('localHistory.selectForCompare', "Select for Compare"), original: 'Select for Compare' },
                menu: {
                    id: actions_1.MenuId.TimelineItemContext,
                    group: '2_compare_with',
                    order: 2,
                    when: localHistory_1.LOCAL_HISTORY_MENU_CONTEXT_KEY
                }
            });
        }
        async run(accessor, item) {
            const workingCopyHistoryService = accessor.get(workingCopyHistory_1.IWorkingCopyHistoryService);
            const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
            const { entry } = await findLocalHistoryEntry(workingCopyHistoryService, item);
            if (entry) {
                itemSelectedForCompare = item;
                LocalHistoryItemSelectedForCompare.bindTo(contextKeyService).set(true);
            }
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.localHistory.compareWithSelected',
                title: { value: (0, nls_1.localize)('localHistory.compareWithSelected', "Compare with Selected"), original: 'Compare with Selected' },
                menu: {
                    id: actions_1.MenuId.TimelineItemContext,
                    group: '2_compare_with',
                    order: 1,
                    when: contextkey_1.ContextKeyExpr.and(localHistory_1.LOCAL_HISTORY_MENU_CONTEXT_KEY, LocalHistoryItemSelectedForCompare)
                }
            });
        }
        async run(accessor, item) {
            const workingCopyHistoryService = accessor.get(workingCopyHistory_1.IWorkingCopyHistoryService);
            const commandService = accessor.get(commands_1.ICommandService);
            if (!itemSelectedForCompare) {
                return;
            }
            const selectedEntry = (await findLocalHistoryEntry(workingCopyHistoryService, itemSelectedForCompare)).entry;
            if (!selectedEntry) {
                return;
            }
            const { entry } = await findLocalHistoryEntry(workingCopyHistoryService, item);
            if (entry) {
                return commandService.executeCommand(editorCommands_1.API_OPEN_DIFF_EDITOR_COMMAND_ID, ...toDiffEditorArguments(selectedEntry, entry));
            }
        }
    });
    //#endregion
    //#region Show Contents
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.localHistory.open',
                title: { value: (0, nls_1.localize)('localHistory.open', "Show Contents"), original: 'Show Contents' },
                menu: {
                    id: actions_1.MenuId.TimelineItemContext,
                    group: '3_contents',
                    order: 1,
                    when: localHistory_1.LOCAL_HISTORY_MENU_CONTEXT_KEY
                }
            });
        }
        async run(accessor, item) {
            const workingCopyHistoryService = accessor.get(workingCopyHistory_1.IWorkingCopyHistoryService);
            const editorService = accessor.get(editorService_1.IEditorService);
            const { entry } = await findLocalHistoryEntry(workingCopyHistoryService, item);
            if (entry) {
                return openEntry(entry, editorService);
            }
        }
    });
    //#region Restore Contents
    const RESTORE_CONTENTS_LABEL = { value: (0, nls_1.localize)('localHistory.restore', "Restore Contents"), original: 'Restore Contents' };
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.localHistory.restoreViaEditor',
                title: RESTORE_CONTENTS_LABEL,
                menu: {
                    id: actions_1.MenuId.EditorTitle,
                    group: 'navigation',
                    order: -10,
                    when: contextkeys_1.ResourceContextKey.Scheme.isEqualTo(localHistoryFileSystemProvider_1.LocalHistoryFileSystemProvider.SCHEMA)
                },
                icon: localHistory_1.LOCAL_HISTORY_ICON_RESTORE
            });
        }
        async run(accessor, uri) {
            const { associatedResource, location } = localHistoryFileSystemProvider_1.LocalHistoryFileSystemProvider.fromLocalHistoryFileSystem(uri);
            return restore(accessor, { uri: associatedResource, handle: (0, resources_1.basenameOrAuthority)(location) });
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.localHistory.restore',
                title: RESTORE_CONTENTS_LABEL,
                menu: {
                    id: actions_1.MenuId.TimelineItemContext,
                    group: '3_contents',
                    order: 2,
                    when: localHistory_1.LOCAL_HISTORY_MENU_CONTEXT_KEY
                }
            });
        }
        async run(accessor, item) {
            return restore(accessor, item);
        }
    });
    const restoreSaveSource = editor_1.SaveSourceRegistry.registerSource('localHistoryRestore.source', (0, nls_1.localize)('localHistoryRestore.source', "File Restored"));
    async function restore(accessor, item) {
        const fileService = accessor.get(files_1.IFileService);
        const dialogService = accessor.get(dialogs_1.IDialogService);
        const workingCopyService = accessor.get(workingCopyService_1.IWorkingCopyService);
        const workingCopyHistoryService = accessor.get(workingCopyHistory_1.IWorkingCopyHistoryService);
        const editorService = accessor.get(editorService_1.IEditorService);
        const { entry } = await findLocalHistoryEntry(workingCopyHistoryService, item);
        if (entry) {
            // Ask for confirmation
            const { confirmed } = await dialogService.confirm({
                type: 'warning',
                message: (0, nls_1.localize)('confirmRestoreMessage', "Do you want to restore the contents of '{0}'?", (0, resources_1.basename)(entry.workingCopy.resource)),
                detail: (0, nls_1.localize)('confirmRestoreDetail', "Restoring will discard any unsaved changes."),
                primaryButton: (0, nls_1.localize)({ key: 'restoreButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Restore")
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
                await dialogService.error((0, nls_1.localize)('unableToRestore', "Unable to restore '{0}'.", (0, resources_1.basename)(entry.workingCopy.resource)), (0, errorMessage_1.toErrorMessage)(error));
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
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.localHistory.restoreViaPicker',
                title: { value: (0, nls_1.localize)('localHistory.restoreViaPicker', "Find Entry to Restore"), original: 'Find Entry to Restore' },
                f1: true,
                category: LOCAL_HISTORY_CATEGORY
            });
        }
        async run(accessor) {
            const workingCopyHistoryService = accessor.get(workingCopyHistory_1.IWorkingCopyHistoryService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const modelService = accessor.get(model_1.IModelService);
            const languageService = accessor.get(language_1.ILanguageService);
            const labelService = accessor.get(label_1.ILabelService);
            const editorService = accessor.get(editorService_1.IEditorService);
            const fileService = accessor.get(files_1.IFileService);
            const commandService = accessor.get(commands_1.ICommandService);
            // Show all resources with associated history entries in picker
            // with progress because this operation will take longer the more
            // files have been saved overall.
            const resourcePicker = quickInputService.createQuickPick();
            let cts = new cancellation_1.CancellationTokenSource();
            resourcePicker.onDidHide(() => cts.dispose(true));
            resourcePicker.busy = true;
            resourcePicker.show();
            const resources = await workingCopyHistoryService.getAll(cts.token);
            resourcePicker.busy = false;
            resourcePicker.placeholder = (0, nls_1.localize)('restoreViaPicker.filePlaceholder', "Select the file to show local history for");
            resourcePicker.matchOnLabel = true;
            resourcePicker.matchOnDescription = true;
            resourcePicker.items = resources.map(resource => ({
                resource,
                label: (0, resources_1.basenameOrAuthority)(resource),
                description: labelService.getUriLabel((0, resources_1.dirname)(resource), { relative: true }),
                iconClasses: (0, getIconClasses_1.getIconClasses)(modelService, languageService, resource)
            })).sort((r1, r2) => r1.resource.fsPath < r2.resource.fsPath ? -1 : 1);
            await event_1.Event.toPromise(resourcePicker.onDidAccept);
            resourcePicker.dispose();
            const resource = (0, arrays_1.firstOrDefault)(resourcePicker.selectedItems)?.resource;
            if (!resource) {
                return;
            }
            // Show all entries for the picked resource in another picker
            // and open the entry in the end that was selected by the user
            const entryPicker = quickInputService.createQuickPick();
            cts = new cancellation_1.CancellationTokenSource();
            entryPicker.onDidHide(() => cts.dispose(true));
            entryPicker.busy = true;
            entryPicker.show();
            const entries = await workingCopyHistoryService.getEntries(resource, cts.token);
            entryPicker.busy = false;
            entryPicker.placeholder = (0, nls_1.localize)('restoreViaPicker.entryPlaceholder', "Select the local history entry to open");
            entryPicker.matchOnLabel = true;
            entryPicker.matchOnDescription = true;
            entryPicker.items = Array.from(entries).reverse().map(entry => ({
                entry,
                label: `$(circle-outline) ${editor_1.SaveSourceRegistry.getSourceLabel(entry.source)}`,
                description: toLocalHistoryEntryDateLabel(entry.timestamp)
            }));
            await event_1.Event.toPromise(entryPicker.onDidAccept);
            entryPicker.dispose();
            const selectedItem = (0, arrays_1.firstOrDefault)(entryPicker.selectedItems);
            if (!selectedItem) {
                return;
            }
            const resourceExists = await fileService.exists(selectedItem.entry.workingCopy.resource);
            if (resourceExists) {
                return commandService.executeCommand(editorCommands_1.API_OPEN_DIFF_EDITOR_COMMAND_ID, ...toDiffEditorArguments(selectedItem.entry, selectedItem.entry.workingCopy.resource));
            }
            return openEntry(selectedItem.entry, editorService);
        }
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.TimelineTitle, { command: { id: 'workbench.action.localHistory.restoreViaPicker', title: { value: (0, nls_1.localize)('localHistory.restoreViaPickerMenu', "Local History: Find Entry to Restore..."), original: 'Local History: Find Entry to Restore...' } }, group: 'submenu', order: 1 });
    //#endregion
    //#region Rename
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.localHistory.rename',
                title: { value: (0, nls_1.localize)('localHistory.rename', "Rename"), original: 'Rename' },
                menu: {
                    id: actions_1.MenuId.TimelineItemContext,
                    group: '5_edit',
                    order: 1,
                    when: localHistory_1.LOCAL_HISTORY_MENU_CONTEXT_KEY
                }
            });
        }
        async run(accessor, item) {
            const workingCopyHistoryService = accessor.get(workingCopyHistory_1.IWorkingCopyHistoryService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const { entry } = await findLocalHistoryEntry(workingCopyHistoryService, item);
            if (entry) {
                const inputBox = quickInputService.createInputBox();
                inputBox.title = (0, nls_1.localize)('renameLocalHistoryEntryTitle', "Rename Local History Entry");
                inputBox.ignoreFocusOut = true;
                inputBox.placeholder = (0, nls_1.localize)('renameLocalHistoryPlaceholder', "Enter the new name of the local history entry");
                inputBox.value = editor_1.SaveSourceRegistry.getSourceLabel(entry.source);
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
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.localHistory.delete',
                title: { value: (0, nls_1.localize)('localHistory.delete', "Delete"), original: 'Delete' },
                menu: {
                    id: actions_1.MenuId.TimelineItemContext,
                    group: '5_edit',
                    order: 2,
                    when: localHistory_1.LOCAL_HISTORY_MENU_CONTEXT_KEY
                }
            });
        }
        async run(accessor, item) {
            const workingCopyHistoryService = accessor.get(workingCopyHistory_1.IWorkingCopyHistoryService);
            const editorService = accessor.get(editorService_1.IEditorService);
            const dialogService = accessor.get(dialogs_1.IDialogService);
            const { entry } = await findLocalHistoryEntry(workingCopyHistoryService, item);
            if (entry) {
                // Ask for confirmation
                const { confirmed } = await dialogService.confirm({
                    type: 'warning',
                    message: (0, nls_1.localize)('confirmDeleteMessage', "Do you want to delete the local history entry of '{0}' from {1}?", entry.workingCopy.name, toLocalHistoryEntryDateLabel(entry.timestamp)),
                    detail: (0, nls_1.localize)('confirmDeleteDetail', "This action is irreversible!"),
                    primaryButton: (0, nls_1.localize)({ key: 'deleteButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Delete"),
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
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.localHistory.deleteAll',
                title: { value: (0, nls_1.localize)('localHistory.deleteAll', "Delete All"), original: 'Delete All' },
                f1: true,
                category: LOCAL_HISTORY_CATEGORY
            });
        }
        async run(accessor) {
            const dialogService = accessor.get(dialogs_1.IDialogService);
            const workingCopyHistoryService = accessor.get(workingCopyHistory_1.IWorkingCopyHistoryService);
            // Ask for confirmation
            const { confirmed } = await dialogService.confirm({
                type: 'warning',
                message: (0, nls_1.localize)('confirmDeleteAllMessage', "Do you want to delete all entries of all files in local history?"),
                detail: (0, nls_1.localize)('confirmDeleteAllDetail', "This action is irreversible!"),
                primaryButton: (0, nls_1.localize)({ key: 'deleteAllButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Delete All"),
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
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.localHistory.create',
                title: { value: (0, nls_1.localize)('localHistory.create', "Create Entry"), original: 'Create Entry' },
                f1: true,
                category: LOCAL_HISTORY_CATEGORY,
                precondition: contextkeys_1.ActiveEditorContext
            });
        }
        async run(accessor) {
            const workingCopyHistoryService = accessor.get(workingCopyHistory_1.IWorkingCopyHistoryService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const editorService = accessor.get(editorService_1.IEditorService);
            const labelService = accessor.get(label_1.ILabelService);
            const pathService = accessor.get(pathService_1.IPathService);
            const resource = editor_1.EditorResourceAccessor.getOriginalUri(editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            if (resource?.scheme !== pathService.defaultUriScheme && resource?.scheme !== network_1.Schemas.vscodeUserData) {
                return; // only enable for selected schemes
            }
            const inputBox = quickInputService.createInputBox();
            inputBox.title = (0, nls_1.localize)('createLocalHistoryEntryTitle', "Create Local History Entry");
            inputBox.ignoreFocusOut = true;
            inputBox.placeholder = (0, nls_1.localize)('createLocalHistoryPlaceholder', "Enter the new name of the local history entry for '{0}'", labelService.getUriBasenameLabel(resource));
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
        const resource = localHistoryFileSystemProvider_1.LocalHistoryFileSystemProvider.toLocalHistoryFileSystem({ location: entry.location, associatedResource: entry.workingCopy.resource });
        await editorService.openEditor({
            resource,
            label: (0, nls_1.localize)('localHistoryEditorLabel', "{0} ({1} • {2})", entry.workingCopy.name, editor_1.SaveSourceRegistry.getSourceLabel(entry.source), toLocalHistoryEntryDateLabel(entry.timestamp))
        });
    }
    async function closeEntry(entry, editorService) {
        const resource = localHistoryFileSystemProvider_1.LocalHistoryFileSystemProvider.toLocalHistoryFileSystem({ location: entry.location, associatedResource: entry.workingCopy.resource });
        const editors = editorService.findEditors(resource, { supportSideBySide: editor_1.SideBySideEditor.ANY });
        await editorService.closeEditors(editors, { preserveFocus: true });
    }
    function toDiffEditorArguments(arg1, arg2) {
        // Left hand side is always a working copy history entry
        const originalResource = localHistoryFileSystemProvider_1.LocalHistoryFileSystemProvider.toLocalHistoryFileSystem({ location: arg1.location, associatedResource: arg1.workingCopy.resource });
        let label;
        // Right hand side depends on how the method was called
        // and is either another working copy history entry
        // or the file on disk.
        let modifiedResource;
        // Compare with file on disk
        if (uri_1.URI.isUri(arg2)) {
            const resource = arg2;
            modifiedResource = resource;
            label = (0, nls_1.localize)('localHistoryCompareToFileEditorLabel', "{0} ({1} • {2}) ↔ {3}", arg1.workingCopy.name, editor_1.SaveSourceRegistry.getSourceLabel(arg1.source), toLocalHistoryEntryDateLabel(arg1.timestamp), arg1.workingCopy.name);
        }
        // Compare with another entry
        else {
            const modified = arg2;
            modifiedResource = localHistoryFileSystemProvider_1.LocalHistoryFileSystemProvider.toLocalHistoryFileSystem({ location: modified.location, associatedResource: modified.workingCopy.resource });
            label = (0, nls_1.localize)('localHistoryCompareToPreviousEditorLabel', "{0} ({1} • {2}) ↔ {3} ({4} • {5})", arg1.workingCopy.name, editor_1.SaveSourceRegistry.getSourceLabel(arg1.source), toLocalHistoryEntryDateLabel(arg1.timestamp), modified.workingCopy.name, editor_1.SaveSourceRegistry.getSourceLabel(modified.source), toLocalHistoryEntryDateLabel(modified.timestamp));
        }
        return [
            originalResource,
            modifiedResource,
            label,
            undefined // important to keep order of arguments in command proper
        ];
    }
    exports.toDiffEditorArguments = toDiffEditorArguments;
    async function findLocalHistoryEntry(workingCopyHistoryService, descriptor) {
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
    exports.findLocalHistoryEntry = findLocalHistoryEntry;
    const SEP = /\//g;
    function toLocalHistoryEntryDateLabel(timestamp) {
        return `${(0, localHistory_1.getLocalHistoryDateFormatter)().format(timestamp).replace(SEP, '-')}`; // preserving `/` will break editor labels, so replace it with a non-path symbol
    }
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxIaXN0b3J5Q29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9sb2NhbEhpc3RvcnkvYnJvd3Nlci9sb2NhbEhpc3RvcnlDb21tYW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUErQmhHLE1BQU0sc0JBQXNCLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsdUJBQXVCLEVBQUUsZUFBZSxDQUFDLEVBQUUsUUFBUSxFQUFFLGVBQWUsRUFBRSxDQUFDO0lBT3hILDJCQUEyQjtJQUVkLFFBQUEsdUJBQXVCLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsOEJBQThCLEVBQUUsbUJBQW1CLENBQUMsRUFBRSxRQUFRLEVBQUUsbUJBQW1CLEVBQUUsQ0FBQztJQUUvSSxJQUFBLHlCQUFlLEVBQUMsS0FBTSxTQUFRLGlCQUFPO1FBQ3BDO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSwrQ0FBK0M7Z0JBQ25ELEtBQUssRUFBRSwrQkFBdUI7Z0JBQzlCLElBQUksRUFBRTtvQkFDTCxFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxtQkFBbUI7b0JBQzlCLEtBQUssRUFBRSxXQUFXO29CQUNsQixLQUFLLEVBQUUsQ0FBQztvQkFDUixJQUFJLEVBQUUsNkNBQThCO2lCQUNwQzthQUNELENBQUMsQ0FBQztRQUNKLENBQUM7UUFDRCxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQTBCLEVBQUUsSUFBOEI7WUFDbkUsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywwQkFBZSxDQUFDLENBQUM7WUFDckQsTUFBTSx5QkFBeUIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLCtDQUEwQixDQUFDLENBQUM7WUFFM0UsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLE1BQU0scUJBQXFCLENB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