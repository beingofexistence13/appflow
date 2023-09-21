/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls", "vs/base/common/platform", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/uri", "vs/base/common/errorMessage", "vs/base/common/actions", "vs/base/common/lifecycle", "vs/workbench/contrib/files/common/files", "vs/platform/files/common/files", "vs/workbench/common/editor", "vs/platform/quickinput/common/quickInput", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/host/browser/host", "vs/workbench/contrib/files/browser/fileConstants", "vs/editor/common/services/resolverService", "vs/platform/configuration/common/configuration", "vs/platform/clipboard/common/clipboardService", "vs/editor/common/languages/language", "vs/editor/common/services/model", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/base/common/network", "vs/platform/dialogs/common/dialogs", "vs/platform/notification/common/notification", "vs/workbench/services/editor/common/editorService", "vs/workbench/browser/parts/editor/editorCommands", "vs/base/common/arrays", "vs/workbench/contrib/files/common/explorerModel", "vs/base/common/errors", "vs/base/browser/dom", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/base/common/async", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/base/common/codicons", "vs/base/common/themables", "vs/workbench/common/views", "vs/base/common/strings", "vs/platform/uriIdentity/common/uriIdentity", "vs/editor/browser/services/bulkEditService", "vs/workbench/contrib/files/browser/files", "vs/workbench/contrib/files/browser/fileImportExport", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/services/path/common/pathService", "vs/platform/actions/common/actions", "vs/workbench/common/contextkeys", "vs/base/common/keyCodes", "vs/platform/action/common/actionCommonCategories"], function (require, exports, nls, platform_1, path_1, resources, uri_1, errorMessage_1, actions_1, lifecycle_1, files_1, files_2, editor_1, quickInput_1, instantiation_1, host_1, fileConstants_1, resolverService_1, configuration_1, clipboardService_1, language_1, model_1, commands_1, contextkey_1, network_1, dialogs_1, notification_1, editorService_1, editorCommands_1, arrays_1, explorerModel_1, errors_1, dom_1, filesConfigurationService_1, workingCopyService_1, async_1, workingCopyFileService_1, codicons_1, themables_1, views_1, strings_1, uriIdentity_1, bulkEditService_1, files_3, fileImportExport_1, panecomposite_1, remoteAgentService_1, pathService_1, actions_2, contextkeys_1, keyCodes_1, actionCommonCategories_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ResetActiveEditorReadonlyInSession = exports.ToggleActiveEditorReadonlyInSession = exports.SetActiveEditorWriteableInSession = exports.SetActiveEditorReadonlyInSession = exports.openFilePreserveFocusHandler = exports.pasteFileHandler = exports.cutFileHandler = exports.copyFileHandler = exports.deleteFileHandler = exports.moveFileToTrashHandler = exports.renameHandler = exports.CompareWithClipboardAction = exports.CompareNewUntitledTextFilesAction = exports.validateFileName = exports.ShowOpenedFileInNewWindow = exports.ShowActiveFileInExplorer = exports.FocusFilesExplorer = exports.CloseGroupAction = exports.SaveAllInGroupAction = exports.ToggleAutoSaveAction = exports.GlobalCompareResourcesAction = exports.incrementFileName = exports.findValidPasteFileTarget = exports.UPLOAD_LABEL = exports.UPLOAD_COMMAND_ID = exports.DOWNLOAD_LABEL = exports.DOWNLOAD_COMMAND_ID = exports.FileCopiedContext = exports.PASTE_FILE_LABEL = exports.COPY_FILE_LABEL = exports.MOVE_FILE_TO_TRASH_LABEL = exports.TRIGGER_RENAME_LABEL = exports.NEW_FOLDER_LABEL = exports.NEW_FOLDER_COMMAND_ID = exports.NEW_FILE_LABEL = exports.NEW_FILE_COMMAND_ID = void 0;
    exports.NEW_FILE_COMMAND_ID = 'explorer.newFile';
    exports.NEW_FILE_LABEL = nls.localize('newFile', "New File...");
    exports.NEW_FOLDER_COMMAND_ID = 'explorer.newFolder';
    exports.NEW_FOLDER_LABEL = nls.localize('newFolder', "New Folder...");
    exports.TRIGGER_RENAME_LABEL = nls.localize('rename', "Rename...");
    exports.MOVE_FILE_TO_TRASH_LABEL = nls.localize('delete', "Delete");
    exports.COPY_FILE_LABEL = nls.localize('copyFile', "Copy");
    exports.PASTE_FILE_LABEL = nls.localize('pasteFile', "Paste");
    exports.FileCopiedContext = new contextkey_1.RawContextKey('fileCopied', false);
    exports.DOWNLOAD_COMMAND_ID = 'explorer.download';
    exports.DOWNLOAD_LABEL = nls.localize('download', "Download...");
    exports.UPLOAD_COMMAND_ID = 'explorer.upload';
    exports.UPLOAD_LABEL = nls.localize('upload', "Upload...");
    const CONFIRM_DELETE_SETTING_KEY = 'explorer.confirmDelete';
    const MAX_UNDO_FILE_SIZE = 5000000; // 5mb
    function onError(notificationService, error) {
        if (error.message === 'string') {
            error = error.message;
        }
        notificationService.error((0, errorMessage_1.toErrorMessage)(error, false));
    }
    async function refreshIfSeparator(value, explorerService) {
        if (value && ((value.indexOf('/') >= 0) || (value.indexOf('\\') >= 0))) {
            // New input contains separator, multiple resources will get created workaround for #68204
            await explorerService.refresh();
        }
    }
    async function deleteFiles(explorerService, workingCopyFileService, dialogService, configurationService, elements, useTrash, skipConfirm = false, ignoreIfNotExists = false) {
        let primaryButton;
        if (useTrash) {
            primaryButton = platform_1.isWindows ? nls.localize('deleteButtonLabelRecycleBin', "&&Move to Recycle Bin") : nls.localize({ key: 'deleteButtonLabelTrash', comment: ['&& denotes a mnemonic'] }, "&&Move to Trash");
        }
        else {
            primaryButton = nls.localize({ key: 'deleteButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Delete");
        }
        // Handle dirty
        const distinctElements = resources.distinctParents(elements, e => e.resource);
        const dirtyWorkingCopies = new Set();
        for (const distinctElement of distinctElements) {
            for (const dirtyWorkingCopy of workingCopyFileService.getDirty(distinctElement.resource)) {
                dirtyWorkingCopies.add(dirtyWorkingCopy);
            }
        }
        let confirmed = true;
        if (dirtyWorkingCopies.size) {
            let message;
            if (distinctElements.length > 1) {
                message = nls.localize('dirtyMessageFilesDelete', "You are deleting files with unsaved changes. Do you want to continue?");
            }
            else if (distinctElements[0].isDirectory) {
                if (dirtyWorkingCopies.size === 1) {
                    message = nls.localize('dirtyMessageFolderOneDelete', "You are deleting a folder {0} with unsaved changes in 1 file. Do you want to continue?", distinctElements[0].name);
                }
                else {
                    message = nls.localize('dirtyMessageFolderDelete', "You are deleting a folder {0} with unsaved changes in {1} files. Do you want to continue?", distinctElements[0].name, dirtyWorkingCopies.size);
                }
            }
            else {
                message = nls.localize('dirtyMessageFileDelete', "You are deleting {0} with unsaved changes. Do you want to continue?", distinctElements[0].name);
            }
            const response = await dialogService.confirm({
                type: 'warning',
                message,
                detail: nls.localize('dirtyWarning', "Your changes will be lost if you don't save them."),
                primaryButton
            });
            if (!response.confirmed) {
                confirmed = false;
            }
            else {
                skipConfirm = true;
            }
        }
        // Check if file is dirty in editor and save it to avoid data loss
        if (!confirmed) {
            return;
        }
        let confirmation;
        // We do not support undo of folders, so in that case the delete action is irreversible
        const deleteDetail = distinctElements.some(e => e.isDirectory) ? nls.localize('irreversible', "This action is irreversible!") :
            distinctElements.length > 1 ? nls.localize('restorePlural', "You can restore these files using the Undo command") : nls.localize('restore', "You can restore this file using the Undo command");
        // Check if we need to ask for confirmation at all
        if (skipConfirm || (useTrash && configurationService.getValue(CONFIRM_DELETE_SETTING_KEY) === false)) {
            confirmation = { confirmed: true };
        }
        // Confirm for moving to trash
        else if (useTrash) {
            let { message, detail } = getMoveToTrashMessage(distinctElements);
            detail += detail ? '\n' : '';
            if (platform_1.isWindows) {
                detail += distinctElements.length > 1 ? nls.localize('undoBinFiles', "You can restore these files from the Recycle Bin.") : nls.localize('undoBin', "You can restore this file from the Recycle Bin.");
            }
            else {
                detail += distinctElements.length > 1 ? nls.localize('undoTrashFiles', "You can restore these files from the Trash.") : nls.localize('undoTrash', "You can restore this file from the Trash.");
            }
            confirmation = await dialogService.confirm({
                message,
                detail,
                primaryButton,
                checkbox: {
                    label: nls.localize('doNotAskAgain', "Do not ask me again")
                }
            });
        }
        // Confirm for deleting permanently
        else {
            let { message, detail } = getDeleteMessage(distinctElements);
            detail += detail ? '\n' : '';
            detail += deleteDetail;
            confirmation = await dialogService.confirm({
                type: 'warning',
                message,
                detail,
                primaryButton
            });
        }
        // Check for confirmation checkbox
        if (confirmation.confirmed && confirmation.checkboxChecked === true) {
            await configurationService.updateValue(CONFIRM_DELETE_SETTING_KEY, false);
        }
        // Check for confirmation
        if (!confirmation.confirmed) {
            return;
        }
        // Call function
        try {
            const resourceFileEdits = distinctElements.map(e => new bulkEditService_1.ResourceFileEdit(e.resource, undefined, { recursive: true, folder: e.isDirectory, ignoreIfNotExists, skipTrashBin: !useTrash, maxSize: MAX_UNDO_FILE_SIZE }));
            const options = {
                undoLabel: distinctElements.length > 1 ? nls.localize({ key: 'deleteBulkEdit', comment: ['Placeholder will be replaced by the number of files deleted'] }, "Delete {0} files", distinctElements.length) : nls.localize({ key: 'deleteFileBulkEdit', comment: ['Placeholder will be replaced by the name of the file deleted'] }, "Delete {0}", distinctElements[0].name),
                progressLabel: distinctElements.length > 1 ? nls.localize({ key: 'deletingBulkEdit', comment: ['Placeholder will be replaced by the number of files deleted'] }, "Deleting {0} files", distinctElements.length) : nls.localize({ key: 'deletingFileBulkEdit', comment: ['Placeholder will be replaced by the name of the file deleted'] }, "Deleting {0}", distinctElements[0].name),
            };
            await explorerService.applyBulkEdit(resourceFileEdits, options);
        }
        catch (error) {
            // Handle error to delete file(s) from a modal confirmation dialog
            let errorMessage;
            let detailMessage;
            let primaryButton;
            if (useTrash) {
                errorMessage = platform_1.isWindows ? nls.localize('binFailed', "Failed to delete using the Recycle Bin. Do you want to permanently delete instead?") : nls.localize('trashFailed', "Failed to delete using the Trash. Do you want to permanently delete instead?");
                detailMessage = deleteDetail;
                primaryButton = nls.localize({ key: 'deletePermanentlyButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Delete Permanently");
            }
            else {
                errorMessage = (0, errorMessage_1.toErrorMessage)(error, false);
                primaryButton = nls.localize({ key: 'retryButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Retry");
            }
            const res = await dialogService.confirm({
                type: 'warning',
                message: errorMessage,
                detail: detailMessage,
                primaryButton
            });
            if (res.confirmed) {
                if (useTrash) {
                    useTrash = false; // Delete Permanently
                }
                skipConfirm = true;
                ignoreIfNotExists = true;
                return deleteFiles(explorerService, workingCopyFileService, dialogService, configurationService, elements, useTrash, skipConfirm, ignoreIfNotExists);
            }
        }
    }
    function getMoveToTrashMessage(distinctElements) {
        if (containsBothDirectoryAndFile(distinctElements)) {
            return {
                message: nls.localize('confirmMoveTrashMessageFilesAndDirectories', "Are you sure you want to delete the following {0} files/directories and their contents?", distinctElements.length),
                detail: (0, dialogs_1.getFileNamesMessage)(distinctElements.map(e => e.resource))
            };
        }
        if (distinctElements.length > 1) {
            if (distinctElements[0].isDirectory) {
                return {
                    message: nls.localize('confirmMoveTrashMessageMultipleDirectories', "Are you sure you want to delete the following {0} directories and their contents?", distinctElements.length),
                    detail: (0, dialogs_1.getFileNamesMessage)(distinctElements.map(e => e.resource))
                };
            }
            return {
                message: nls.localize('confirmMoveTrashMessageMultiple', "Are you sure you want to delete the following {0} files?", distinctElements.length),
                detail: (0, dialogs_1.getFileNamesMessage)(distinctElements.map(e => e.resource))
            };
        }
        if (distinctElements[0].isDirectory && !distinctElements[0].isSymbolicLink) {
            return { message: nls.localize('confirmMoveTrashMessageFolder', "Are you sure you want to delete '{0}' and its contents?", distinctElements[0].name), detail: '' };
        }
        return { message: nls.localize('confirmMoveTrashMessageFile', "Are you sure you want to delete '{0}'?", distinctElements[0].name), detail: '' };
    }
    function getDeleteMessage(distinctElements) {
        if (containsBothDirectoryAndFile(distinctElements)) {
            return {
                message: nls.localize('confirmDeleteMessageFilesAndDirectories', "Are you sure you want to permanently delete the following {0} files/directories and their contents?", distinctElements.length),
                detail: (0, dialogs_1.getFileNamesMessage)(distinctElements.map(e => e.resource))
            };
        }
        if (distinctElements.length > 1) {
            if (distinctElements[0].isDirectory) {
                return {
                    message: nls.localize('confirmDeleteMessageMultipleDirectories', "Are you sure you want to permanently delete the following {0} directories and their contents?", distinctElements.length),
                    detail: (0, dialogs_1.getFileNamesMessage)(distinctElements.map(e => e.resource))
                };
            }
            return {
                message: nls.localize('confirmDeleteMessageMultiple', "Are you sure you want to permanently delete the following {0} files?", distinctElements.length),
                detail: (0, dialogs_1.getFileNamesMessage)(distinctElements.map(e => e.resource))
            };
        }
        if (distinctElements[0].isDirectory) {
            return { message: nls.localize('confirmDeleteMessageFolder', "Are you sure you want to permanently delete '{0}' and its contents?", distinctElements[0].name), detail: '' };
        }
        return { message: nls.localize('confirmDeleteMessageFile', "Are you sure you want to permanently delete '{0}'?", distinctElements[0].name), detail: '' };
    }
    function containsBothDirectoryAndFile(distinctElements) {
        const directory = distinctElements.find(element => element.isDirectory);
        const file = distinctElements.find(element => !element.isDirectory);
        return !!directory && !!file;
    }
    async function findValidPasteFileTarget(explorerService, fileService, dialogService, targetFolder, fileToPaste, incrementalNaming) {
        let name = resources.basenameOrAuthority(fileToPaste.resource);
        let candidate = resources.joinPath(targetFolder.resource, name);
        // In the disabled case we must ask if it's ok to overwrite the file if it exists
        if (incrementalNaming === 'disabled') {
            const canOverwrite = await askForOverwrite(fileService, dialogService, candidate);
            if (!canOverwrite) {
                return;
            }
        }
        while (true && !fileToPaste.allowOverwrite) {
            if (!explorerService.findClosest(candidate)) {
                break;
            }
            if (incrementalNaming !== 'disabled') {
                name = incrementFileName(name, !!fileToPaste.isDirectory, incrementalNaming);
            }
            candidate = resources.joinPath(targetFolder.resource, name);
        }
        return candidate;
    }
    exports.findValidPasteFileTarget = findValidPasteFileTarget;
    function incrementFileName(name, isFolder, incrementalNaming) {
        if (incrementalNaming === 'simple') {
            let namePrefix = name;
            let extSuffix = '';
            if (!isFolder) {
                extSuffix = (0, path_1.extname)(name);
                namePrefix = (0, path_1.basename)(name, extSuffix);
            }
            // name copy 5(.txt) => name copy 6(.txt)
            // name copy(.txt) => name copy 2(.txt)
            const suffixRegex = /^(.+ copy)( \d+)?$/;
            if (suffixRegex.test(namePrefix)) {
                return namePrefix.replace(suffixRegex, (match, g1, g2) => {
                    const number = (g2 ? parseInt(g2) : 1);
                    return number === 0
                        ? `${g1}`
                        : (number < 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */
                            ? `${g1} ${number + 1}`
                            : `${g1}${g2} copy`);
                }) + extSuffix;
            }
            // name(.txt) => name copy(.txt)
            return `${namePrefix} copy${extSuffix}`;
        }
        const separators = '[\\.\\-_]';
        const maxNumber = 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */;
        // file.1.txt=>file.2.txt
        const suffixFileRegex = RegExp('(.*' + separators + ')(\\d+)(\\..*)$');
        if (!isFolder && name.match(suffixFileRegex)) {
            return name.replace(suffixFileRegex, (match, g1, g2, g3) => {
                const number = parseInt(g2);
                return number < maxNumber
                    ? g1 + String(number + 1).padStart(g2.length, '0') + g3
                    : `${g1}${g2}.1${g3}`;
            });
        }
        // 1.file.txt=>2.file.txt
        const prefixFileRegex = RegExp('(\\d+)(' + separators + '.*)(\\..*)$');
        if (!isFolder && name.match(prefixFileRegex)) {
            return name.replace(prefixFileRegex, (match, g1, g2, g3) => {
                const number = parseInt(g1);
                return number < maxNumber
                    ? String(number + 1).padStart(g1.length, '0') + g2 + g3
                    : `${g1}${g2}.1${g3}`;
            });
        }
        // 1.txt=>2.txt
        const prefixFileNoNameRegex = RegExp('(\\d+)(\\..*)$');
        if (!isFolder && name.match(prefixFileNoNameRegex)) {
            return name.replace(prefixFileNoNameRegex, (match, g1, g2) => {
                const number = parseInt(g1);
                return number < maxNumber
                    ? String(number + 1).padStart(g1.length, '0') + g2
                    : `${g1}.1${g2}`;
            });
        }
        // file.txt=>file.1.txt
        const lastIndexOfDot = name.lastIndexOf('.');
        if (!isFolder && lastIndexOfDot >= 0) {
            return `${name.substr(0, lastIndexOfDot)}.1${name.substr(lastIndexOfDot)}`;
        }
        // 123 => 124
        const noNameNoExtensionRegex = RegExp('(\\d+)$');
        if (!isFolder && lastIndexOfDot === -1 && name.match(noNameNoExtensionRegex)) {
            return name.replace(noNameNoExtensionRegex, (match, g1) => {
                const number = parseInt(g1);
                return number < maxNumber
                    ? String(number + 1).padStart(g1.length, '0')
                    : `${g1}.1`;
            });
        }
        // file => file1
        // file1 => file2
        const noExtensionRegex = RegExp('(.*)(\\d*)$');
        if (!isFolder && lastIndexOfDot === -1 && name.match(noExtensionRegex)) {
            return name.replace(noExtensionRegex, (match, g1, g2) => {
                let number = parseInt(g2);
                if (isNaN(number)) {
                    number = 0;
                }
                return number < maxNumber
                    ? g1 + String(number + 1).padStart(g2.length, '0')
                    : `${g1}${g2}.1`;
            });
        }
        // folder.1=>folder.2
        if (isFolder && name.match(/(\d+)$/)) {
            return name.replace(/(\d+)$/, (match, ...groups) => {
                const number = parseInt(groups[0]);
                return number < maxNumber
                    ? String(number + 1).padStart(groups[0].length, '0')
                    : `${groups[0]}.1`;
            });
        }
        // 1.folder=>2.folder
        if (isFolder && name.match(/^(\d+)/)) {
            return name.replace(/^(\d+)(.*)$/, (match, ...groups) => {
                const number = parseInt(groups[0]);
                return number < maxNumber
                    ? String(number + 1).padStart(groups[0].length, '0') + groups[1]
                    : `${groups[0]}${groups[1]}.1`;
            });
        }
        // file/folder=>file.1/folder.1
        return `${name}.1`;
    }
    exports.incrementFileName = incrementFileName;
    /**
     * Checks to see if the resource already exists, if so prompts the user if they would be ok with it being overwritten
     * @param fileService The file service
     * @param dialogService The dialog service
     * @param targetResource The resource to be overwritten
     * @return A boolean indicating if the user is ok with resource being overwritten, if the resource does not exist it returns true.
     */
    async function askForOverwrite(fileService, dialogService, targetResource) {
        const exists = await fileService.exists(targetResource);
        if (!exists) {
            return true;
        }
        // Ask for overwrite confirmation
        const { confirmed } = await dialogService.confirm({
            type: notification_1.Severity.Warning,
            message: nls.localize('confirmOverwrite', "A file or folder with the name '{0}' already exists in the destination folder. Do you want to replace it?", (0, path_1.basename)(targetResource.path)),
            primaryButton: nls.localize('replaceButtonLabel', "&&Replace")
        });
        return confirmed;
    }
    // Global Compare with
    class GlobalCompareResourcesAction extends actions_2.Action2 {
        static { this.ID = 'workbench.files.action.compareFileWith'; }
        static { this.LABEL = nls.localize('globalCompareFile', "Compare Active File With..."); }
        constructor() {
            super({
                id: GlobalCompareResourcesAction.ID,
                title: { value: GlobalCompareResourcesAction.LABEL, original: 'Compare Active File With...' },
                f1: true,
                category: actionCommonCategories_1.Categories.File,
                precondition: contextkeys_1.ActiveEditorContext
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const textModelService = accessor.get(resolverService_1.ITextModelService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const activeInput = editorService.activeEditor;
            const activeResource = editor_1.EditorResourceAccessor.getOriginalUri(activeInput);
            if (activeResource && textModelService.canHandleResource(activeResource)) {
                const picks = await quickInputService.quickAccess.pick('', { itemActivation: quickInput_1.ItemActivation.SECOND });
                if (picks?.length === 1) {
                    const resource = picks[0].resource;
                    if (uri_1.URI.isUri(resource) && textModelService.canHandleResource(resource)) {
                        editorService.openEditor({
                            original: { resource: activeResource },
                            modified: { resource: resource },
                            options: { pinned: true }
                        });
                    }
                }
            }
        }
    }
    exports.GlobalCompareResourcesAction = GlobalCompareResourcesAction;
    class ToggleAutoSaveAction extends actions_2.Action2 {
        static { this.ID = 'workbench.action.toggleAutoSave'; }
        static { this.LABEL = nls.localize('toggleAutoSave', "Toggle Auto Save"); }
        constructor() {
            super({
                id: ToggleAutoSaveAction.ID,
                title: { value: ToggleAutoSaveAction.LABEL, original: 'Toggle Auto Save' },
                f1: true,
                category: actionCommonCategories_1.Categories.File
            });
        }
        run(accessor) {
            const filesConfigurationService = accessor.get(filesConfigurationService_1.IFilesConfigurationService);
            return filesConfigurationService.toggleAutoSave();
        }
    }
    exports.ToggleAutoSaveAction = ToggleAutoSaveAction;
    let BaseSaveAllAction = class BaseSaveAllAction extends actions_1.Action {
        constructor(id, label, commandService, notificationService, workingCopyService) {
            super(id, label);
            this.commandService = commandService;
            this.notificationService = notificationService;
            this.workingCopyService = workingCopyService;
            this.lastDirtyState = this.workingCopyService.hasDirty;
            this.enabled = this.lastDirtyState;
            this.registerListeners();
        }
        registerListeners() {
            // update enablement based on working copy changes
            this._register(this.workingCopyService.onDidChangeDirty(workingCopy => this.updateEnablement(workingCopy)));
        }
        updateEnablement(workingCopy) {
            const hasDirty = workingCopy.isDirty() || this.workingCopyService.hasDirty;
            if (this.lastDirtyState !== hasDirty) {
                this.enabled = hasDirty;
                this.lastDirtyState = this.enabled;
            }
        }
        async run(context) {
            try {
                await this.doRun(context);
            }
            catch (error) {
                onError(this.notificationService, error);
            }
        }
    };
    BaseSaveAllAction = __decorate([
        __param(2, commands_1.ICommandService),
        __param(3, notification_1.INotificationService),
        __param(4, workingCopyService_1.IWorkingCopyService)
    ], BaseSaveAllAction);
    class SaveAllInGroupAction extends BaseSaveAllAction {
        static { this.ID = 'workbench.files.action.saveAllInGroup'; }
        static { this.LABEL = nls.localize('saveAllInGroup', "Save All in Group"); }
        get class() {
            return 'explorer-action ' + themables_1.ThemeIcon.asClassName(codicons_1.Codicon.saveAll);
        }
        doRun(context) {
            return this.commandService.executeCommand(fileConstants_1.SAVE_ALL_IN_GROUP_COMMAND_ID, {}, context);
        }
    }
    exports.SaveAllInGroupAction = SaveAllInGroupAction;
    let CloseGroupAction = class CloseGroupAction extends actions_1.Action {
        static { this.ID = 'workbench.files.action.closeGroup'; }
        static { this.LABEL = nls.localize('closeGroup', "Close Group"); }
        constructor(id, label, commandService) {
            super(id, label, themables_1.ThemeIcon.asClassName(codicons_1.Codicon.closeAll));
            this.commandService = commandService;
        }
        run(context) {
            return this.commandService.executeCommand(editorCommands_1.CLOSE_EDITORS_AND_GROUP_COMMAND_ID, {}, context);
        }
    };
    exports.CloseGroupAction = CloseGroupAction;
    exports.CloseGroupAction = CloseGroupAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], CloseGroupAction);
    class FocusFilesExplorer extends actions_2.Action2 {
        static { this.ID = 'workbench.files.action.focusFilesExplorer'; }
        static { this.LABEL = nls.localize('focusFilesExplorer', "Focus on Files Explorer"); }
        constructor() {
            super({
                id: FocusFilesExplorer.ID,
                title: { value: FocusFilesExplorer.LABEL, original: 'Focus on Files Explorer' },
                f1: true,
                category: actionCommonCategories_1.Categories.File
            });
        }
        async run(accessor) {
            const paneCompositeService = accessor.get(panecomposite_1.IPaneCompositePartService);
            await paneCompositeService.openPaneComposite(files_1.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true);
        }
    }
    exports.FocusFilesExplorer = FocusFilesExplorer;
    class ShowActiveFileInExplorer extends actions_2.Action2 {
        static { this.ID = 'workbench.files.action.showActiveFileInExplorer'; }
        static { this.LABEL = nls.localize('showInExplorer', "Reveal Active File in Explorer View"); }
        constructor() {
            super({
                id: ShowActiveFileInExplorer.ID,
                title: { value: ShowActiveFileInExplorer.LABEL, original: 'Reveal Active File in Explorer View' },
                f1: true,
                category: actionCommonCategories_1.Categories.File
            });
        }
        async run(accessor) {
            const commandService = accessor.get(commands_1.ICommandService);
            const editorService = accessor.get(editorService_1.IEditorService);
            const resource = editor_1.EditorResourceAccessor.getOriginalUri(editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            if (resource) {
                commandService.executeCommand(fileConstants_1.REVEAL_IN_EXPLORER_COMMAND_ID, resource);
            }
        }
    }
    exports.ShowActiveFileInExplorer = ShowActiveFileInExplorer;
    class ShowOpenedFileInNewWindow extends actions_2.Action2 {
        static { this.ID = 'workbench.action.files.showOpenedFileInNewWindow'; }
        static { this.LABEL = nls.localize('openFileInNewWindow', "Open Active File in New Window"); }
        constructor() {
            super({
                id: ShowOpenedFileInNewWindow.ID,
                title: { value: ShowOpenedFileInNewWindow.LABEL, original: 'Open Active File in New Window' },
                f1: true,
                category: actionCommonCategories_1.Categories.File,
                keybinding: { primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 45 /* KeyCode.KeyO */), weight: 200 /* KeybindingWeight.WorkbenchContrib */ },
                precondition: contextkeys_1.EmptyWorkspaceSupportContext
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const hostService = accessor.get(host_1.IHostService);
            const dialogService = accessor.get(dialogs_1.IDialogService);
            const fileService = accessor.get(files_2.IFileService);
            const fileResource = editor_1.EditorResourceAccessor.getOriginalUri(editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            if (fileResource) {
                if (fileService.hasProvider(fileResource)) {
                    hostService.openWindow([{ fileUri: fileResource }], { forceNewWindow: true });
                }
                else {
                    dialogService.error(nls.localize('openFileToShowInNewWindow.unsupportedschema', "The active editor must contain an openable resource."));
                }
            }
        }
    }
    exports.ShowOpenedFileInNewWindow = ShowOpenedFileInNewWindow;
    function validateFileName(pathService, item, name, os) {
        // Produce a well formed file name
        name = getWellFormedFileName(name);
        // Name not provided
        if (!name || name.length === 0 || /^\s+$/.test(name)) {
            return {
                content: nls.localize('emptyFileNameError', "A file or folder name must be provided."),
                severity: notification_1.Severity.Error
            };
        }
        // Relative paths only
        if (name[0] === '/' || name[0] === '\\') {
            return {
                content: nls.localize('fileNameStartsWithSlashError', "A file or folder name cannot start with a slash."),
                severity: notification_1.Severity.Error
            };
        }
        const names = (0, arrays_1.coalesce)(name.split(/[\\/]/));
        const parent = item.parent;
        if (name !== item.name) {
            // Do not allow to overwrite existing file
            const child = parent?.getChild(name);
            if (child && child !== item) {
                return {
                    content: nls.localize('fileNameExistsError', "A file or folder **{0}** already exists at this location. Please choose a different name.", name),
                    severity: notification_1.Severity.Error
                };
            }
        }
        // Check for invalid file name.
        if (names.some(folderName => !pathService.hasValidBasename(item.resource, os, folderName))) {
            // Escape * characters
            const escapedName = name.replace(/\*/g, '\\*'); // CodeQL [SM02383] This only processes filenames which are enforced against having backslashes in them farther up in the stack.
            return {
                content: nls.localize('invalidFileNameError', "The name **{0}** is not valid as a file or folder name. Please choose a different name.", trimLongName(escapedName)),
                severity: notification_1.Severity.Error
            };
        }
        if (names.some(name => /^\s|\s$/.test(name))) {
            return {
                content: nls.localize('fileNameWhitespaceWarning', "Leading or trailing whitespace detected in file or folder name."),
                severity: notification_1.Severity.Warning
            };
        }
        return null;
    }
    exports.validateFileName = validateFileName;
    function trimLongName(name) {
        if (name?.length > 255) {
            return `${name.substr(0, 255)}...`;
        }
        return name;
    }
    function getWellFormedFileName(filename) {
        if (!filename) {
            return filename;
        }
        // Trim tabs
        filename = (0, strings_1.trim)(filename, '\t');
        // Remove trailing slashes
        filename = (0, strings_1.rtrim)(filename, '/');
        filename = (0, strings_1.rtrim)(filename, '\\');
        return filename;
    }
    class CompareNewUntitledTextFilesAction extends actions_2.Action2 {
        static { this.ID = 'workbench.files.action.compareNewUntitledTextFiles'; }
        static { this.LABEL = nls.localize('compareNewUntitledTextFiles', "Compare New Untitled Text Files"); }
        constructor() {
            super({
                id: CompareNewUntitledTextFilesAction.ID,
                title: { value: CompareNewUntitledTextFilesAction.LABEL, original: 'Compare New Untitled Text Files' },
                f1: true,
                category: actionCommonCategories_1.Categories.File
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            await editorService.openEditor({
                original: { resource: undefined },
                modified: { resource: undefined },
                options: { pinned: true }
            });
        }
    }
    exports.CompareNewUntitledTextFilesAction = CompareNewUntitledTextFilesAction;
    class CompareWithClipboardAction extends actions_2.Action2 {
        static { this.ID = 'workbench.files.action.compareWithClipboard'; }
        static { this.LABEL = nls.localize('compareWithClipboard', "Compare Active File with Clipboard"); }
        static { this.SCHEME_COUNTER = 0; }
        constructor() {
            super({
                id: CompareWithClipboardAction.ID,
                title: { value: CompareWithClipboardAction.LABEL, original: 'Compare Active File with Clipboard' },
                f1: true,
                category: actionCommonCategories_1.Categories.File,
                keybinding: { primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 33 /* KeyCode.KeyC */), weight: 200 /* KeybindingWeight.WorkbenchContrib */ }
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const instantiationService = accessor.get(instantiation_1.IInstantiationService);
            const textModelService = accessor.get(resolverService_1.ITextModelService);
            const fileService = accessor.get(files_2.IFileService);
            const resource = editor_1.EditorResourceAccessor.getOriginalUri(editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            const scheme = `clipboardCompare${CompareWithClipboardAction.SCHEME_COUNTER++}`;
            if (resource && (fileService.hasProvider(resource) || resource.scheme === network_1.Schemas.untitled)) {
                if (!this.registrationDisposal) {
                    const provider = instantiationService.createInstance(ClipboardContentProvider);
                    this.registrationDisposal = textModelService.registerTextModelContentProvider(scheme, provider);
                }
                const name = resources.basename(resource);
                const editorLabel = nls.localize('clipboardComparisonLabel', "Clipboard ↔ {0}", name);
                await editorService.openEditor({
                    original: { resource: resource.with({ scheme }) },
                    modified: { resource: resource },
                    label: editorLabel,
                    options: { pinned: true }
                }).finally(() => {
                    (0, lifecycle_1.dispose)(this.registrationDisposal);
                    this.registrationDisposal = undefined;
                });
            }
        }
        dispose() {
            (0, lifecycle_1.dispose)(this.registrationDisposal);
            this.registrationDisposal = undefined;
        }
    }
    exports.CompareWithClipboardAction = CompareWithClipboardAction;
    let ClipboardContentProvider = class ClipboardContentProvider {
        constructor(clipboardService, languageService, modelService) {
            this.clipboardService = clipboardService;
            this.languageService = languageService;
            this.modelService = modelService;
        }
        async provideTextContent(resource) {
            const text = await this.clipboardService.readText();
            const model = this.modelService.createModel(text, this.languageService.createByFilepathOrFirstLine(resource), resource);
            return model;
        }
    };
    ClipboardContentProvider = __decorate([
        __param(0, clipboardService_1.IClipboardService),
        __param(1, language_1.ILanguageService),
        __param(2, model_1.IModelService)
    ], ClipboardContentProvider);
    function onErrorWithRetry(notificationService, error, retry) {
        notificationService.prompt(notification_1.Severity.Error, (0, errorMessage_1.toErrorMessage)(error, false), [{
                label: nls.localize('retry', "Retry"),
                run: () => retry()
            }]);
    }
    async function openExplorerAndCreate(accessor, isFolder) {
        const explorerService = accessor.get(files_3.IExplorerService);
        const fileService = accessor.get(files_2.IFileService);
        const configService = accessor.get(configuration_1.IConfigurationService);
        const filesConfigService = accessor.get(filesConfigurationService_1.IFilesConfigurationService);
        const editorService = accessor.get(editorService_1.IEditorService);
        const viewsService = accessor.get(views_1.IViewsService);
        const notificationService = accessor.get(notification_1.INotificationService);
        const remoteAgentService = accessor.get(remoteAgentService_1.IRemoteAgentService);
        const commandService = accessor.get(commands_1.ICommandService);
        const pathService = accessor.get(pathService_1.IPathService);
        const wasHidden = !viewsService.isViewVisible(files_1.VIEW_ID);
        const view = await viewsService.openView(files_1.VIEW_ID, true);
        if (wasHidden) {
            // Give explorer some time to resolve itself #111218
            await (0, async_1.timeout)(500);
        }
        if (!view) {
            // Can happen in empty workspace case (https://github.com/microsoft/vscode/issues/100604)
            if (isFolder) {
                throw new Error('Open a folder or workspace first.');
            }
            return commandService.executeCommand(fileConstants_1.NEW_UNTITLED_FILE_COMMAND_ID);
        }
        const stats = explorerService.getContext(false);
        const stat = stats.length > 0 ? stats[0] : undefined;
        let folder;
        if (stat) {
            folder = stat.isDirectory ? stat : (stat.parent || explorerService.roots[0]);
        }
        else {
            folder = explorerService.roots[0];
        }
        if (folder.isReadonly) {
            throw new Error('Parent folder is readonly.');
        }
        const newStat = new explorerModel_1.NewExplorerItem(fileService, configService, filesConfigService, folder, isFolder);
        folder.addChild(newStat);
        const onSuccess = async (value) => {
            try {
                const resourceToCreate = resources.joinPath(folder.resource, value);
                if (value.endsWith('/')) {
                    isFolder = true;
                }
                await explorerService.applyBulkEdit([new bulkEditService_1.ResourceFileEdit(undefined, resourceToCreate, { folder: isFolder })], {
                    undoLabel: nls.localize('createBulkEdit', "Create {0}", value),
                    progressLabel: nls.localize('creatingBulkEdit', "Creating {0}", value),
                    confirmBeforeUndo: true
                });
                await refreshIfSeparator(value, explorerService);
                if (isFolder) {
                    await explorerService.select(resourceToCreate, true);
                }
                else {
                    await editorService.openEditor({ resource: resourceToCreate, options: { pinned: true } });
                }
            }
            catch (error) {
                onErrorWithRetry(notificationService, error, () => onSuccess(value));
            }
        };
        const os = (await remoteAgentService.getEnvironment())?.os ?? platform_1.OS;
        await explorerService.setEditable(newStat, {
            validationMessage: value => validateFileName(pathService, newStat, value, os),
            onFinish: async (value, success) => {
                folder.removeChild(newStat);
                await explorerService.setEditable(newStat, null);
                if (success) {
                    onSuccess(value);
                }
            }
        });
    }
    commands_1.CommandsRegistry.registerCommand({
        id: exports.NEW_FILE_COMMAND_ID,
        handler: async (accessor) => {
            await openExplorerAndCreate(accessor, false);
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.NEW_FOLDER_COMMAND_ID,
        handler: async (accessor) => {
            await openExplorerAndCreate(accessor, true);
        }
    });
    const renameHandler = async (accessor) => {
        const explorerService = accessor.get(files_3.IExplorerService);
        const notificationService = accessor.get(notification_1.INotificationService);
        const remoteAgentService = accessor.get(remoteAgentService_1.IRemoteAgentService);
        const pathService = accessor.get(pathService_1.IPathService);
        const configurationService = accessor.get(configuration_1.IConfigurationService);
        const stats = explorerService.getContext(false);
        const stat = stats.length > 0 ? stats[0] : undefined;
        if (!stat) {
            return;
        }
        const os = (await remoteAgentService.getEnvironment())?.os ?? platform_1.OS;
        await explorerService.setEditable(stat, {
            validationMessage: value => validateFileName(pathService, stat, value, os),
            onFinish: async (value, success) => {
                if (success) {
                    const parentResource = stat.parent.resource;
                    const targetResource = resources.joinPath(parentResource, value);
                    if (stat.resource.toString() !== targetResource.toString()) {
                        try {
                            await explorerService.applyBulkEdit([new bulkEditService_1.ResourceFileEdit(stat.resource, targetResource)], {
                                confirmBeforeUndo: configurationService.getValue().explorer.confirmUndo === "verbose" /* UndoConfirmLevel.Verbose */,
                                undoLabel: nls.localize('renameBulkEdit', "Rename {0} to {1}", stat.name, value),
                                progressLabel: nls.localize('renamingBulkEdit', "Renaming {0} to {1}", stat.name, value),
                            });
                            await refreshIfSeparator(value, explorerService);
                        }
                        catch (e) {
                            notificationService.error(e);
                        }
                    }
                }
                await explorerService.setEditable(stat, null);
            }
        });
    };
    exports.renameHandler = renameHandler;
    const moveFileToTrashHandler = async (accessor) => {
        const explorerService = accessor.get(files_3.IExplorerService);
        const stats = explorerService.getContext(true).filter(s => !s.isRoot);
        if (stats.length) {
            await deleteFiles(accessor.get(files_3.IExplorerService), accessor.get(workingCopyFileService_1.IWorkingCopyFileService), accessor.get(dialogs_1.IDialogService), accessor.get(configuration_1.IConfigurationService), stats, true);
        }
    };
    exports.moveFileToTrashHandler = moveFileToTrashHandler;
    const deleteFileHandler = async (accessor) => {
        const explorerService = accessor.get(files_3.IExplorerService);
        const stats = explorerService.getContext(true).filter(s => !s.isRoot);
        if (stats.length) {
            await deleteFiles(accessor.get(files_3.IExplorerService), accessor.get(workingCopyFileService_1.IWorkingCopyFileService), accessor.get(dialogs_1.IDialogService), accessor.get(configuration_1.IConfigurationService), stats, false);
        }
    };
    exports.deleteFileHandler = deleteFileHandler;
    let pasteShouldMove = false;
    const copyFileHandler = async (accessor) => {
        const explorerService = accessor.get(files_3.IExplorerService);
        const stats = explorerService.getContext(true);
        if (stats.length > 0) {
            await explorerService.setToCopy(stats, false);
            pasteShouldMove = false;
        }
    };
    exports.copyFileHandler = copyFileHandler;
    const cutFileHandler = async (accessor) => {
        const explorerService = accessor.get(files_3.IExplorerService);
        const stats = explorerService.getContext(true);
        if (stats.length > 0) {
            await explorerService.setToCopy(stats, true);
            pasteShouldMove = true;
        }
    };
    exports.cutFileHandler = cutFileHandler;
    const downloadFileHandler = async (accessor) => {
        const explorerService = accessor.get(files_3.IExplorerService);
        const notificationService = accessor.get(notification_1.INotificationService);
        const instantiationService = accessor.get(instantiation_1.IInstantiationService);
        const context = explorerService.getContext(true);
        const explorerItems = context.length ? context : explorerService.roots;
        const downloadHandler = instantiationService.createInstance(fileImportExport_1.FileDownload);
        try {
            await downloadHandler.download(explorerItems);
        }
        catch (error) {
            notificationService.error(error);
            throw error;
        }
    };
    commands_1.CommandsRegistry.registerCommand({
        id: exports.DOWNLOAD_COMMAND_ID,
        handler: downloadFileHandler
    });
    const uploadFileHandler = async (accessor) => {
        const explorerService = accessor.get(files_3.IExplorerService);
        const notificationService = accessor.get(notification_1.INotificationService);
        const instantiationService = accessor.get(instantiation_1.IInstantiationService);
        const context = explorerService.getContext(true);
        const element = context.length ? context[0] : explorerService.roots[0];
        try {
            const files = await (0, dom_1.triggerUpload)();
            if (files) {
                const browserUpload = instantiationService.createInstance(fileImportExport_1.BrowserFileUpload);
                await browserUpload.upload(element, files);
            }
        }
        catch (error) {
            notificationService.error(error);
            throw error;
        }
    };
    commands_1.CommandsRegistry.registerCommand({
        id: exports.UPLOAD_COMMAND_ID,
        handler: uploadFileHandler
    });
    const pasteFileHandler = async (accessor) => {
        const clipboardService = accessor.get(clipboardService_1.IClipboardService);
        const explorerService = accessor.get(files_3.IExplorerService);
        const fileService = accessor.get(files_2.IFileService);
        const notificationService = accessor.get(notification_1.INotificationService);
        const editorService = accessor.get(editorService_1.IEditorService);
        const configurationService = accessor.get(configuration_1.IConfigurationService);
        const uriIdentityService = accessor.get(uriIdentity_1.IUriIdentityService);
        const dialogService = accessor.get(dialogs_1.IDialogService);
        const context = explorerService.getContext(true);
        const toPaste = resources.distinctParents(await clipboardService.readResources(), r => r);
        const element = context.length ? context[0] : explorerService.roots[0];
        const incrementalNaming = configurationService.getValue().explorer.incrementalNaming;
        try {
            // Check if target is ancestor of pasted folder
            const sourceTargetPairs = (0, arrays_1.coalesce)(await Promise.all(toPaste.map(async (fileToPaste) => {
                if (element.resource.toString() !== fileToPaste.toString() && resources.isEqualOrParent(element.resource, fileToPaste)) {
                    throw new Error(nls.localize('fileIsAncestor', "File to paste is an ancestor of the destination folder"));
                }
                const fileToPasteStat = await fileService.stat(fileToPaste);
                // Find target
                let target;
                if (uriIdentityService.extUri.isEqual(element.resource, fileToPaste)) {
                    target = element.parent;
                }
                else {
                    target = element.isDirectory ? element : element.parent;
                }
                const targetFile = await findValidPasteFileTarget(explorerService, fileService, dialogService, target, { resource: fileToPaste, isDirectory: fileToPasteStat.isDirectory, allowOverwrite: pasteShouldMove || incrementalNaming === 'disabled' }, incrementalNaming);
                if (!targetFile) {
                    return undefined;
                }
                return { source: fileToPaste, target: targetFile };
            })));
            if (sourceTargetPairs.length >= 1) {
                // Move/Copy File
                if (pasteShouldMove) {
                    const resourceFileEdits = sourceTargetPairs.map(pair => new bulkEditService_1.ResourceFileEdit(pair.source, pair.target, { overwrite: incrementalNaming === 'disabled' }));
                    const options = {
                        confirmBeforeUndo: configurationService.getValue().explorer.confirmUndo === "verbose" /* UndoConfirmLevel.Verbose */,
                        progressLabel: sourceTargetPairs.length > 1 ? nls.localize({ key: 'movingBulkEdit', comment: ['Placeholder will be replaced by the number of files being moved'] }, "Moving {0} files", sourceTargetPairs.length)
                            : nls.localize({ key: 'movingFileBulkEdit', comment: ['Placeholder will be replaced by the name of the file moved.'] }, "Moving {0}", resources.basenameOrAuthority(sourceTargetPairs[0].target)),
                        undoLabel: sourceTargetPairs.length > 1 ? nls.localize({ key: 'moveBulkEdit', comment: ['Placeholder will be replaced by the number of files being moved'] }, "Move {0} files", sourceTargetPairs.length)
                            : nls.localize({ key: 'moveFileBulkEdit', comment: ['Placeholder will be replaced by the name of the file moved.'] }, "Move {0}", resources.basenameOrAuthority(sourceTargetPairs[0].target))
                    };
                    await explorerService.applyBulkEdit(resourceFileEdits, options);
                }
                else {
                    const resourceFileEdits = sourceTargetPairs.map(pair => new bulkEditService_1.ResourceFileEdit(pair.source, pair.target, { copy: true, overwrite: incrementalNaming === 'disabled' }));
                    const undoLevel = configurationService.getValue().explorer.confirmUndo;
                    const options = {
                        confirmBeforeUndo: undoLevel === "default" /* UndoConfirmLevel.Default */ || undoLevel === "verbose" /* UndoConfirmLevel.Verbose */,
                        progressLabel: sourceTargetPairs.length > 1 ? nls.localize({ key: 'copyingBulkEdit', comment: ['Placeholder will be replaced by the number of files being copied'] }, "Copying {0} files", sourceTargetPairs.length)
                            : nls.localize({ key: 'copyingFileBulkEdit', comment: ['Placeholder will be replaced by the name of the file copied.'] }, "Copying {0}", resources.basenameOrAuthority(sourceTargetPairs[0].target)),
                        undoLabel: sourceTargetPairs.length > 1 ? nls.localize({ key: 'copyBulkEdit', comment: ['Placeholder will be replaced by the number of files being copied'] }, "Paste {0} files", sourceTargetPairs.length)
                            : nls.localize({ key: 'copyFileBulkEdit', comment: ['Placeholder will be replaced by the name of the file copied.'] }, "Paste {0}", resources.basenameOrAuthority(sourceTargetPairs[0].target))
                    };
                    await explorerService.applyBulkEdit(resourceFileEdits, options);
                }
                const pair = sourceTargetPairs[0];
                await explorerService.select(pair.target);
                if (sourceTargetPairs.length === 1) {
                    const item = explorerService.findClosest(pair.target);
                    if (item && !item.isDirectory) {
                        await editorService.openEditor({ resource: item.resource, options: { pinned: true, preserveFocus: true } });
                    }
                }
            }
        }
        catch (e) {
            onError(notificationService, new Error(nls.localize('fileDeleted', "The file(s) to paste have been deleted or moved since you copied them. {0}", (0, errors_1.getErrorMessage)(e))));
        }
        finally {
            if (pasteShouldMove) {
                // Cut is done. Make sure to clear cut state.
                await explorerService.setToCopy([], false);
                pasteShouldMove = false;
            }
        }
    };
    exports.pasteFileHandler = pasteFileHandler;
    const openFilePreserveFocusHandler = async (accessor) => {
        const editorService = accessor.get(editorService_1.IEditorService);
        const explorerService = accessor.get(files_3.IExplorerService);
        const stats = explorerService.getContext(true);
        await editorService.openEditors(stats.filter(s => !s.isDirectory).map(s => ({
            resource: s.resource,
            options: { preserveFocus: true }
        })));
    };
    exports.openFilePreserveFocusHandler = openFilePreserveFocusHandler;
    class BaseSetActiveEditorReadonlyInSession extends actions_2.Action2 {
        constructor(id, title, newReadonlyState) {
            super({
                id,
                title,
                f1: true,
                category: actionCommonCategories_1.Categories.File,
                precondition: contextkeys_1.ActiveEditorCanToggleReadonlyContext
            });
            this.newReadonlyState = newReadonlyState;
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const filesConfigurationService = accessor.get(filesConfigurationService_1.IFilesConfigurationService);
            const fileResource = editor_1.EditorResourceAccessor.getOriginalUri(editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            if (!fileResource) {
                return;
            }
            await filesConfigurationService.updateReadonly(fileResource, this.newReadonlyState);
        }
    }
    class SetActiveEditorReadonlyInSession extends BaseSetActiveEditorReadonlyInSession {
        static { this.ID = 'workbench.action.files.setActiveEditorReadonlyInSession'; }
        static { this.LABEL = nls.localize('setActiveEditorReadonlyInSession', "Set Active Editor Read-only in Session"); }
        constructor() {
            super(SetActiveEditorReadonlyInSession.ID, { value: SetActiveEditorReadonlyInSession.LABEL, original: 'Set Active Editor Readonly in Session' }, true);
        }
    }
    exports.SetActiveEditorReadonlyInSession = SetActiveEditorReadonlyInSession;
    class SetActiveEditorWriteableInSession extends BaseSetActiveEditorReadonlyInSession {
        static { this.ID = 'workbench.action.files.setActiveEditorWriteableInSession'; }
        static { this.LABEL = nls.localize('setActiveEditorWriteableInSession', "Set Active Editor Writeable in Session"); }
        constructor() {
            super(SetActiveEditorWriteableInSession.ID, { value: SetActiveEditorWriteableInSession.LABEL, original: 'Set Active Editor Writeable in Session' }, false);
        }
    }
    exports.SetActiveEditorWriteableInSession = SetActiveEditorWriteableInSession;
    class ToggleActiveEditorReadonlyInSession extends BaseSetActiveEditorReadonlyInSession {
        static { this.ID = 'workbench.action.files.toggleActiveEditorReadonlyInSession'; }
        static { this.LABEL = nls.localize('toggleActiveEditorReadonlyInSession', "Toggle Active Editor Read-only in Session"); }
        constructor() {
            super(ToggleActiveEditorReadonlyInSession.ID, { value: ToggleActiveEditorReadonlyInSession.LABEL, original: 'Toggle Active Editor Readonly in Session' }, 'toggle');
        }
    }
    exports.ToggleActiveEditorReadonlyInSession = ToggleActiveEditorReadonlyInSession;
    class ResetActiveEditorReadonlyInSession extends BaseSetActiveEditorReadonlyInSession {
        static { this.ID = 'workbench.action.files.resetActiveEditorReadonlyInSession'; }
        static { this.LABEL = nls.localize('resetActiveEditorReadonlyInSession', "Reset Active Editor Read-only in Session"); }
        constructor() {
            super(ResetActiveEditorReadonlyInSession.ID, { value: ResetActiveEditorReadonlyInSession.LABEL, original: 'Reset Active Editor Readonly in Session' }, 'reset');
        }
    }
    exports.ResetActiveEditorReadonlyInSession = ResetActiveEditorReadonlyInSession;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZUFjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9maWxlcy9icm93c2VyL2ZpbGVBY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTBEbkYsUUFBQSxtQkFBbUIsR0FBRyxrQkFBa0IsQ0FBQztJQUN6QyxRQUFBLGNBQWMsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQztJQUN4RCxRQUFBLHFCQUFxQixHQUFHLG9CQUFvQixDQUFDO0lBQzdDLFFBQUEsZ0JBQWdCLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsZUFBZSxDQUFDLENBQUM7SUFDOUQsUUFBQSxvQkFBb0IsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUMzRCxRQUFBLHdCQUF3QixHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzVELFFBQUEsZUFBZSxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ25ELFFBQUEsZ0JBQWdCLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDdEQsUUFBQSxpQkFBaUIsR0FBRyxJQUFJLDBCQUFhLENBQVUsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3BFLFFBQUEsbUJBQW1CLEdBQUcsbUJBQW1CLENBQUM7SUFDMUMsUUFBQSxjQUFjLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFDekQsUUFBQSxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQztJQUN0QyxRQUFBLFlBQVksR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUNoRSxNQUFNLDBCQUEwQixHQUFHLHdCQUF3QixDQUFDO0lBQzVELE1BQU0sa0JBQWtCLEdBQUcsT0FBTyxDQUFDLENBQUMsTUFBTTtJQUUxQyxTQUFTLE9BQU8sQ0FBQyxtQkFBeUMsRUFBRSxLQUFVO1FBQ3JFLElBQUksS0FBSyxDQUFDLE9BQU8sS0FBSyxRQUFRLEVBQUU7WUFDL0IsS0FBSyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUM7U0FDdEI7UUFFRCxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsSUFBQSw2QkFBYyxFQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFFRCxLQUFLLFVBQVUsa0JBQWtCLENBQUMsS0FBYSxFQUFFLGVBQWlDO1FBQ2pGLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3ZFLDBGQUEwRjtZQUMxRixNQUFNLGVBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUNoQztJQUNGLENBQUM7SUFFRCxLQUFLLFVBQVUsV0FBVyxDQUFDLGVBQWlDLEVBQUUsc0JBQStDLEVBQUUsYUFBNkIsRUFBRSxvQkFBMkMsRUFBRSxRQUF3QixFQUFFLFFBQWlCLEVBQUUsV0FBVyxHQUFHLEtBQUssRUFBRSxpQkFBaUIsR0FBRyxLQUFLO1FBQ3JSLElBQUksYUFBcUIsQ0FBQztRQUMxQixJQUFJLFFBQVEsRUFBRTtZQUNiLGFBQWEsR0FBRyxvQkFBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLDZCQUE2QixFQUFFLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxHQUFHLEVBQUUsd0JBQXdCLEVBQUUsT0FBTyxFQUFFLENBQUMsdUJBQXVCLENBQUMsRUFBRSxFQUFFLGlCQUFpQixDQUFDLENBQUM7U0FDMU07YUFBTTtZQUNOLGFBQWEsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsR0FBRyxFQUFFLG1CQUFtQixFQUFFLE9BQU8sRUFBRSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQztTQUMzRztRQUVELGVBQWU7UUFDZixNQUFNLGdCQUFnQixHQUFHLFNBQVMsQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlFLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxHQUFHLEVBQWdCLENBQUM7UUFDbkQsS0FBSyxNQUFNLGVBQWUsSUFBSSxnQkFBZ0IsRUFBRTtZQUMvQyxLQUFLLE1BQU0sZ0JBQWdCLElBQUksc0JBQXNCLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDekYsa0JBQWtCLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7YUFDekM7U0FDRDtRQUNELElBQUksU0FBUyxHQUFHLElBQUksQ0FBQztRQUNyQixJQUFJLGtCQUFrQixDQUFDLElBQUksRUFBRTtZQUM1QixJQUFJLE9BQWUsQ0FBQztZQUNwQixJQUFJLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ2hDLE9BQU8sR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLHlCQUF5QixFQUFFLHVFQUF1RSxDQUFDLENBQUM7YUFDM0g7aUJBQU0sSUFBSSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUU7Z0JBQzNDLElBQUksa0JBQWtCLENBQUMsSUFBSSxLQUFLLENBQUMsRUFBRTtvQkFDbEMsT0FBTyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsNkJBQTZCLEVBQUUsd0ZBQXdGLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQzFLO3FCQUFNO29CQUNOLE9BQU8sR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLDBCQUEwQixFQUFFLDJGQUEyRixFQUFFLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDbk07YUFDRDtpQkFBTTtnQkFDTixPQUFPLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSxxRUFBcUUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUNsSjtZQUVELE1BQU0sUUFBUSxHQUFHLE1BQU0sYUFBYSxDQUFDLE9BQU8sQ0FBQztnQkFDNUMsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsT0FBTztnQkFDUCxNQUFNLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsbURBQW1ELENBQUM7Z0JBQ3pGLGFBQWE7YUFDYixDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRTtnQkFDeEIsU0FBUyxHQUFHLEtBQUssQ0FBQzthQUNsQjtpQkFBTTtnQkFDTixXQUFXLEdBQUcsSUFBSSxDQUFDO2FBQ25CO1NBQ0Q7UUFFRCxrRUFBa0U7UUFDbEUsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNmLE9BQU87U0FDUDtRQUVELElBQUksWUFBaUMsQ0FBQztRQUN0Qyx1RkFBdUY7UUFDdkYsTUFBTSxZQUFZLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSw4QkFBOEIsQ0FBQyxDQUFDLENBQUM7WUFDOUgsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsb0RBQW9ELENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsa0RBQWtELENBQUMsQ0FBQztRQUVqTSxrREFBa0Q7UUFDbEQsSUFBSSxXQUFXLElBQUksQ0FBQyxRQUFRLElBQUksb0JBQW9CLENBQUMsUUFBUSxDQUFVLDBCQUEwQixDQUFDLEtBQUssS0FBSyxDQUFDLEVBQUU7WUFDOUcsWUFBWSxHQUFHLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDO1NBQ25DO1FBRUQsOEJBQThCO2FBQ3pCLElBQUksUUFBUSxFQUFFO1lBQ2xCLElBQUksRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEdBQUcscUJBQXFCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUNsRSxNQUFNLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUM3QixJQUFJLG9CQUFTLEVBQUU7Z0JBQ2QsTUFBTSxJQUFJLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLG1EQUFtRCxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLGlEQUFpRCxDQUFDLENBQUM7YUFDdk07aUJBQU07Z0JBQ04sTUFBTSxJQUFJLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsNkNBQTZDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsMkNBQTJDLENBQUMsQ0FBQzthQUMvTDtZQUVELFlBQVksR0FBRyxNQUFNLGFBQWEsQ0FBQyxPQUFPLENBQUM7Z0JBQzFDLE9BQU87Z0JBQ1AsTUFBTTtnQkFDTixhQUFhO2dCQUNiLFFBQVEsRUFBRTtvQkFDVCxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUscUJBQXFCLENBQUM7aUJBQzNEO2FBQ0QsQ0FBQyxDQUFDO1NBQ0g7UUFFRCxtQ0FBbUM7YUFDOUI7WUFDSixJQUFJLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxHQUFHLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDN0QsTUFBTSxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDN0IsTUFBTSxJQUFJLFlBQVksQ0FBQztZQUN2QixZQUFZLEdBQUcsTUFBTSxhQUFhLENBQUMsT0FBTyxDQUFDO2dCQUMxQyxJQUFJLEVBQUUsU0FBUztnQkFDZixPQUFPO2dCQUNQLE1BQU07Z0JBQ04sYUFBYTthQUNiLENBQUMsQ0FBQztTQUNIO1FBRUQsa0NBQWtDO1FBQ2xDLElBQUksWUFBWSxDQUFDLFNBQVMsSUFBSSxZQUFZLENBQUMsZUFBZSxLQUFLLElBQUksRUFBRTtZQUNwRSxNQUFNLG9CQUFvQixDQUFDLFdBQVcsQ0FBQywwQkFBMEIsRUFBRSxLQUFLLENBQUMsQ0FBQztTQUMxRTtRQUVELHlCQUF5QjtRQUN6QixJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRTtZQUM1QixPQUFPO1NBQ1A7UUFFRCxnQkFBZ0I7UUFDaEIsSUFBSTtZQUNILE1BQU0saUJBQWlCLEdBQUcsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxrQ0FBZ0IsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsaUJBQWlCLEVBQUUsWUFBWSxFQUFFLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN0TixNQUFNLE9BQU8sR0FBRztnQkFDZixTQUFTLEVBQUUsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLEVBQUUsQ0FBQyw2REFBNkQsQ0FBQyxFQUFFLEVBQUUsa0JBQWtCLEVBQUUsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxHQUFHLEVBQUUsb0JBQW9CLEVBQUUsT0FBTyxFQUFFLENBQUMsOERBQThELENBQUMsRUFBRSxFQUFFLFlBQVksRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQ3hXLGFBQWEsRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsR0FBRyxFQUFFLGtCQUFrQixFQUFFLE9BQU8sRUFBRSxDQUFDLDZEQUE2RCxDQUFDLEVBQUUsRUFBRSxvQkFBb0IsRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxzQkFBc0IsRUFBRSxPQUFPLEVBQUUsQ0FBQyw4REFBOEQsQ0FBQyxFQUFFLEVBQUUsY0FBYyxFQUFFLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQzthQUNwWCxDQUFDO1lBQ0YsTUFBTSxlQUFlLENBQUMsYUFBYSxDQUFDLGlCQUFpQixFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQ2hFO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFFZixrRUFBa0U7WUFDbEUsSUFBSSxZQUFvQixDQUFDO1lBQ3pCLElBQUksYUFBaUMsQ0FBQztZQUN0QyxJQUFJLGFBQXFCLENBQUM7WUFDMUIsSUFBSSxRQUFRLEVBQUU7Z0JBQ2IsWUFBWSxHQUFHLG9CQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLG9GQUFvRixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLDhFQUE4RSxDQUFDLENBQUM7Z0JBQ3pQLGFBQWEsR0FBRyxZQUFZLENBQUM7Z0JBQzdCLGFBQWEsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsR0FBRyxFQUFFLDhCQUE4QixFQUFFLE9BQU8sRUFBRSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO2FBQ2xJO2lCQUFNO2dCQUNOLFlBQVksR0FBRyxJQUFBLDZCQUFjLEVBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUM1QyxhQUFhLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxrQkFBa0IsRUFBRSxPQUFPLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUM7YUFDekc7WUFFRCxNQUFNLEdBQUcsR0FBRyxNQUFNLGFBQWEsQ0FBQyxPQUFPLENBQUM7Z0JBQ3ZDLElBQUksRUFBRSxTQUFTO2dCQUNmLE9BQU8sRUFBRSxZQUFZO2dCQUNyQixNQUFNLEVBQUUsYUFBYTtnQkFDckIsYUFBYTthQUNiLENBQUMsQ0FBQztZQUVILElBQUksR0FBRyxDQUFDLFNBQVMsRUFBRTtnQkFDbEIsSUFBSSxRQUFRLEVBQUU7b0JBQ2IsUUFBUSxHQUFHLEtBQUssQ0FBQyxDQUFDLHFCQUFxQjtpQkFDdkM7Z0JBRUQsV0FBVyxHQUFHLElBQUksQ0FBQztnQkFDbkIsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO2dCQUV6QixPQUFPLFdBQVcsQ0FBQyxlQUFlLEVBQUUsc0JBQXNCLEVBQUUsYUFBYSxFQUFFLG9CQUFvQixFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixDQUFDLENBQUM7YUFDcko7U0FDRDtJQUNGLENBQUM7SUFFRCxTQUFTLHFCQUFxQixDQUFDLGdCQUFnQztRQUM5RCxJQUFJLDRCQUE0QixDQUFDLGdCQUFnQixDQUFDLEVBQUU7WUFDbkQsT0FBTztnQkFDTixPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyw0Q0FBNEMsRUFBRSx5RkFBeUYsRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUM7Z0JBQ3ZMLE1BQU0sRUFBRSxJQUFBLDZCQUFtQixFQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUNsRSxDQUFDO1NBQ0Y7UUFFRCxJQUFJLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDaEMsSUFBSSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUU7Z0JBQ3BDLE9BQU87b0JBQ04sT0FBTyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsNENBQTRDLEVBQUUsbUZBQW1GLEVBQUUsZ0JBQWdCLENBQUMsTUFBTSxDQUFDO29CQUNqTCxNQUFNLEVBQUUsSUFBQSw2QkFBbUIsRUFBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQ2xFLENBQUM7YUFDRjtZQUVELE9BQU87Z0JBQ04sT0FBTyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsaUNBQWlDLEVBQUUsMERBQTBELEVBQUUsZ0JBQWdCLENBQUMsTUFBTSxDQUFDO2dCQUM3SSxNQUFNLEVBQUUsSUFBQSw2QkFBbUIsRUFBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDbEUsQ0FBQztTQUNGO1FBRUQsSUFBSSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLEVBQUU7WUFDM0UsT0FBTyxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLCtCQUErQixFQUFFLHlEQUF5RCxFQUFFLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsQ0FBQztTQUNuSztRQUVELE9BQU8sRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyw2QkFBNkIsRUFBRSx3Q0FBd0MsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLENBQUM7SUFDakosQ0FBQztJQUVELFNBQVMsZ0JBQWdCLENBQUMsZ0JBQWdDO1FBQ3pELElBQUksNEJBQTRCLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtZQUNuRCxPQUFPO2dCQUNOLE9BQU8sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHlDQUF5QyxFQUFFLHFHQUFxRyxFQUFFLGdCQUFnQixDQUFDLE1BQU0sQ0FBQztnQkFDaE0sTUFBTSxFQUFFLElBQUEsNkJBQW1CLEVBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ2xFLENBQUM7U0FDRjtRQUVELElBQUksZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNoQyxJQUFJLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRTtnQkFDcEMsT0FBTztvQkFDTixPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx5Q0FBeUMsRUFBRSwrRkFBK0YsRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUM7b0JBQzFMLE1BQU0sRUFBRSxJQUFBLDZCQUFtQixFQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDbEUsQ0FBQzthQUNGO1lBRUQsT0FBTztnQkFDTixPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyw4QkFBOEIsRUFBRSxzRUFBc0UsRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUM7Z0JBQ3RKLE1BQU0sRUFBRSxJQUFBLDZCQUFtQixFQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUNsRSxDQUFDO1NBQ0Y7UUFFRCxJQUFJLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRTtZQUNwQyxPQUFPLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsNEJBQTRCLEVBQUUscUVBQXFFLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxDQUFDO1NBQzVLO1FBRUQsT0FBTyxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDBCQUEwQixFQUFFLG9EQUFvRCxFQUFFLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsQ0FBQztJQUMxSixDQUFDO0lBRUQsU0FBUyw0QkFBNEIsQ0FBQyxnQkFBZ0M7UUFDckUsTUFBTSxTQUFTLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3hFLE1BQU0sSUFBSSxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRXBFLE9BQU8sQ0FBQyxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQzlCLENBQUM7SUFHTSxLQUFLLFVBQVUsd0JBQXdCLENBQzdDLGVBQWlDLEVBQ2pDLFdBQXlCLEVBQ3pCLGFBQTZCLEVBQzdCLFlBQTBCLEVBQzFCLFdBQThFLEVBQzlFLGlCQUFrRDtRQUdsRCxJQUFJLElBQUksR0FBRyxTQUFTLENBQUMsbUJBQW1CLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQy9ELElBQUksU0FBUyxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUVoRSxpRkFBaUY7UUFDakYsSUFBSSxpQkFBaUIsS0FBSyxVQUFVLEVBQUU7WUFDckMsTUFBTSxZQUFZLEdBQUcsTUFBTSxlQUFlLENBQUMsV0FBVyxFQUFFLGFBQWEsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUNsRixJQUFJLENBQUMsWUFBWSxFQUFFO2dCQUNsQixPQUFPO2FBQ1A7U0FDRDtRQUVELE9BQU8sSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRTtZQUMzQyxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDNUMsTUFBTTthQUNOO1lBRUQsSUFBSSxpQkFBaUIsS0FBSyxVQUFVLEVBQUU7Z0JBQ3JDLElBQUksR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsaUJBQWlCLENBQUMsQ0FBQzthQUM3RTtZQUNELFNBQVMsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDNUQ7UUFFRCxPQUFPLFNBQVMsQ0FBQztJQUNsQixDQUFDO0lBaENELDREQWdDQztJQUVELFNBQWdCLGlCQUFpQixDQUFDLElBQVksRUFBRSxRQUFpQixFQUFFLGlCQUFxQztRQUN2RyxJQUFJLGlCQUFpQixLQUFLLFFBQVEsRUFBRTtZQUNuQyxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUM7WUFDdEIsSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDO1lBQ25CLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2QsU0FBUyxHQUFHLElBQUEsY0FBTyxFQUFDLElBQUksQ0FBQyxDQUFDO2dCQUMxQixVQUFVLEdBQUcsSUFBQSxlQUFRLEVBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO2FBQ3ZDO1lBRUQseUNBQXlDO1lBQ3pDLHVDQUF1QztZQUN2QyxNQUFNLFdBQVcsR0FBRyxvQkFBb0IsQ0FBQztZQUN6QyxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQ2pDLE9BQU8sVUFBVSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRyxFQUFFLEVBQUcsRUFBRSxFQUFFO29CQUMxRCxNQUFNLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDdkMsT0FBTyxNQUFNLEtBQUssQ0FBQzt3QkFDbEIsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO3dCQUNULENBQUMsQ0FBQyxDQUFDLE1BQU0sb0RBQW1DOzRCQUMzQyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksTUFBTSxHQUFHLENBQUMsRUFBRTs0QkFDdkIsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQ3hCLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQzthQUNmO1lBRUQsZ0NBQWdDO1lBQ2hDLE9BQU8sR0FBRyxVQUFVLFFBQVEsU0FBUyxFQUFFLENBQUM7U0FDeEM7UUFFRCxNQUFNLFVBQVUsR0FBRyxXQUFXLENBQUM7UUFDL0IsTUFBTSxTQUFTLG9EQUFtQyxDQUFDO1FBRW5ELHlCQUF5QjtRQUN6QixNQUFNLGVBQWUsR0FBRyxNQUFNLENBQUMsS0FBSyxHQUFHLFVBQVUsR0FBRyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3ZFLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsRUFBRTtZQUM3QyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUcsRUFBRSxFQUFHLEVBQUUsRUFBRyxFQUFFLEVBQUU7Z0JBQzdELE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDNUIsT0FBTyxNQUFNLEdBQUcsU0FBUztvQkFDeEIsQ0FBQyxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUU7b0JBQ3ZELENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUM7WUFDeEIsQ0FBQyxDQUFDLENBQUM7U0FDSDtRQUVELHlCQUF5QjtRQUN6QixNQUFNLGVBQWUsR0FBRyxNQUFNLENBQUMsU0FBUyxHQUFHLFVBQVUsR0FBRyxhQUFhLENBQUMsQ0FBQztRQUN2RSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLEVBQUU7WUFDN0MsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFHLEVBQUUsRUFBRyxFQUFFLEVBQUcsRUFBRSxFQUFFO2dCQUM3RCxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQzVCLE9BQU8sTUFBTSxHQUFHLFNBQVM7b0JBQ3hCLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFO29CQUN2RCxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDO1lBQ3hCLENBQUMsQ0FBQyxDQUFDO1NBQ0g7UUFFRCxlQUFlO1FBQ2YsTUFBTSxxQkFBcUIsR0FBRyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUN2RCxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMscUJBQXFCLENBQUMsRUFBRTtZQUNuRCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRyxFQUFFLEVBQUcsRUFBRSxFQUFFO2dCQUM5RCxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQzVCLE9BQU8sTUFBTSxHQUFHLFNBQVM7b0JBQ3hCLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUU7b0JBQ2xELENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQztZQUNuQixDQUFDLENBQUMsQ0FBQztTQUNIO1FBRUQsdUJBQXVCO1FBQ3ZCLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLFFBQVEsSUFBSSxjQUFjLElBQUksQ0FBQyxFQUFFO1lBQ3JDLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxjQUFjLENBQUMsS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUM7U0FDM0U7UUFFRCxhQUFhO1FBQ2IsTUFBTSxzQkFBc0IsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDLFFBQVEsSUFBSSxjQUFjLEtBQUssQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFO1lBQzdFLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFHLEVBQUUsRUFBRTtnQkFDMUQsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUM1QixPQUFPLE1BQU0sR0FBRyxTQUFTO29CQUN4QixDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUM7b0JBQzdDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDO1lBQ2QsQ0FBQyxDQUFDLENBQUM7U0FDSDtRQUVELGdCQUFnQjtRQUNoQixpQkFBaUI7UUFDakIsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDL0MsSUFBSSxDQUFDLFFBQVEsSUFBSSxjQUFjLEtBQUssQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO1lBQ3ZFLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFHLEVBQUUsRUFBRyxFQUFFLEVBQUU7Z0JBQ3pELElBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDMUIsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUU7b0JBQ2xCLE1BQU0sR0FBRyxDQUFDLENBQUM7aUJBQ1g7Z0JBQ0QsT0FBTyxNQUFNLEdBQUcsU0FBUztvQkFDeEIsQ0FBQyxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQztvQkFDbEQsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDO1lBQ25CLENBQUMsQ0FBQyxDQUFDO1NBQ0g7UUFFRCxxQkFBcUI7UUFDckIsSUFBSSxRQUFRLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUNyQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsTUFBTSxFQUFFLEVBQUU7Z0JBQ2xELE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbkMsT0FBTyxNQUFNLEdBQUcsU0FBUztvQkFDeEIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDO29CQUNwRCxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNyQixDQUFDLENBQUMsQ0FBQztTQUNIO1FBRUQscUJBQXFCO1FBQ3JCLElBQUksUUFBUSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDckMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLE1BQU0sRUFBRSxFQUFFO2dCQUN2RCxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25DLE9BQU8sTUFBTSxHQUFHLFNBQVM7b0JBQ3hCLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUM7b0JBQ2hFLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNqQyxDQUFDLENBQUMsQ0FBQztTQUNIO1FBRUQsK0JBQStCO1FBQy9CLE9BQU8sR0FBRyxJQUFJLElBQUksQ0FBQztJQUNwQixDQUFDO0lBckhELDhDQXFIQztJQUVEOzs7Ozs7T0FNRztJQUNILEtBQUssVUFBVSxlQUFlLENBQUMsV0FBeUIsRUFBRSxhQUE2QixFQUFFLGNBQW1CO1FBQzNHLE1BQU0sTUFBTSxHQUFHLE1BQU0sV0FBVyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUN4RCxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ1osT0FBTyxJQUFJLENBQUM7U0FDWjtRQUNELGlDQUFpQztRQUNqQyxNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcsTUFBTSxhQUFhLENBQUMsT0FBTyxDQUFDO1lBQ2pELElBQUksRUFBRSx1QkFBUSxDQUFDLE9BQU87WUFDdEIsT0FBTyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsMkdBQTJHLEVBQUUsSUFBQSxlQUFRLEVBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3JMLGFBQWEsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLG9CQUFvQixFQUFFLFdBQVcsQ0FBQztTQUM5RCxDQUFDLENBQUM7UUFDSCxPQUFPLFNBQVMsQ0FBQztJQUNsQixDQUFDO0lBRUQsc0JBQXNCO0lBQ3RCLE1BQWEsNEJBQTZCLFNBQVEsaUJBQU87aUJBRXhDLE9BQUUsR0FBRyx3Q0FBd0MsQ0FBQztpQkFDOUMsVUFBSyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsbUJBQW1CLEVBQUUsNkJBQTZCLENBQUMsQ0FBQztRQUV6RjtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsNEJBQTRCLENBQUMsRUFBRTtnQkFDbkMsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLDRCQUE0QixDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsNkJBQTZCLEVBQUU7Z0JBQzdGLEVBQUUsRUFBRSxJQUFJO2dCQUNSLFFBQVEsRUFBRSxtQ0FBVSxDQUFDLElBQUk7Z0JBQ3pCLFlBQVksRUFBRSxpQ0FBbUI7YUFDakMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVRLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBMEI7WUFDNUMsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyw4QkFBYyxDQUFDLENBQUM7WUFDbkQsTUFBTSxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLG1DQUFpQixDQUFDLENBQUM7WUFDekQsTUFBTSxpQkFBaUIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLCtCQUFrQixDQUFDLENBQUM7WUFFM0QsTUFBTSxXQUFXLEdBQUcsYUFBYSxDQUFDLFlBQVksQ0FBQztZQUMvQyxNQUFNLGNBQWMsR0FBRywrQkFBc0IsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDMUUsSUFBSSxjQUFjLElBQUksZ0JBQWdCLENBQUMsaUJBQWlCLENBQUMsY0FBYyxDQUFDLEVBQUU7Z0JBQ3pFLE1BQU0sS0FBSyxHQUFHLE1BQU0saUJBQWlCLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxjQUFjLEVBQUUsMkJBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO2dCQUN0RyxJQUFJLEtBQUssRUFBRSxNQUFNLEtBQUssQ0FBQyxFQUFFO29CQUN4QixNQUFNLFFBQVEsR0FBSSxLQUFLLENBQUMsQ0FBQyxDQUFzQyxDQUFDLFFBQVEsQ0FBQztvQkFDekUsSUFBSSxTQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLGdCQUFnQixDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxFQUFFO3dCQUN4RSxhQUFhLENBQUMsVUFBVSxDQUFDOzRCQUN4QixRQUFRLEVBQUUsRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFOzRCQUN0QyxRQUFRLEVBQUUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFOzRCQUNoQyxPQUFPLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO3lCQUN6QixDQUFDLENBQUM7cUJBQ0g7aUJBQ0Q7YUFDRDtRQUNGLENBQUM7O0lBbkNGLG9FQW9DQztJQUVELE1BQWEsb0JBQXFCLFNBQVEsaUJBQU87aUJBQ2hDLE9BQUUsR0FBRyxpQ0FBaUMsQ0FBQztpQkFDdkMsVUFBSyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztRQUUzRTtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsb0JBQW9CLENBQUMsRUFBRTtnQkFDM0IsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLG9CQUFvQixDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsa0JBQWtCLEVBQUU7Z0JBQzFFLEVBQUUsRUFBRSxJQUFJO2dCQUNSLFFBQVEsRUFBRSxtQ0FBVSxDQUFDLElBQUk7YUFDekIsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVRLEdBQUcsQ0FBQyxRQUEwQjtZQUN0QyxNQUFNLHlCQUF5QixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsc0RBQTBCLENBQUMsQ0FBQztZQUMzRSxPQUFPLHlCQUF5QixDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ25ELENBQUM7O0lBaEJGLG9EQWlCQztJQUVELElBQWUsaUJBQWlCLEdBQWhDLE1BQWUsaUJBQWtCLFNBQVEsZ0JBQU07UUFHOUMsWUFDQyxFQUFVLEVBQ1YsS0FBYSxFQUNjLGNBQStCLEVBQzVCLG1CQUF5QyxFQUNqQyxrQkFBdUM7WUFFN0UsS0FBSyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUpVLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUM1Qix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXNCO1lBQ2pDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFJN0UsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDO1lBQ3ZELElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztZQUVuQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUMxQixDQUFDO1FBSU8saUJBQWlCO1lBRXhCLGtEQUFrRDtZQUNsRCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0csQ0FBQztRQUVPLGdCQUFnQixDQUFDLFdBQXlCO1lBQ2pELE1BQU0sUUFBUSxHQUFHLFdBQVcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDO1lBQzNFLElBQUksSUFBSSxDQUFDLGNBQWMsS0FBSyxRQUFRLEVBQUU7Z0JBQ3JDLElBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDO2dCQUN4QixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7YUFDbkM7UUFDRixDQUFDO1FBRVEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFpQjtZQUNuQyxJQUFJO2dCQUNILE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUMxQjtZQUFDLE9BQU8sS0FBSyxFQUFFO2dCQUNmLE9BQU8sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDekM7UUFDRixDQUFDO0tBQ0QsQ0FBQTtJQXpDYyxpQkFBaUI7UUFNN0IsV0FBQSwwQkFBZSxDQUFBO1FBQ2YsV0FBQSxtQ0FBb0IsQ0FBQTtRQUNwQixXQUFBLHdDQUFtQixDQUFBO09BUlAsaUJBQWlCLENBeUMvQjtJQUVELE1BQWEsb0JBQXFCLFNBQVEsaUJBQWlCO2lCQUUxQyxPQUFFLEdBQUcsdUNBQXVDLENBQUM7aUJBQzdDLFVBQUssR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLG1CQUFtQixDQUFDLENBQUM7UUFFNUUsSUFBYSxLQUFLO1lBQ2pCLE9BQU8sa0JBQWtCLEdBQUcscUJBQVMsQ0FBQyxXQUFXLENBQUMsa0JBQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNwRSxDQUFDO1FBRVMsS0FBSyxDQUFDLE9BQWdCO1lBQy9CLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsNENBQTRCLEVBQUUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3RGLENBQUM7O0lBWEYsb0RBWUM7SUFFTSxJQUFNLGdCQUFnQixHQUF0QixNQUFNLGdCQUFpQixTQUFRLGdCQUFNO2lCQUUzQixPQUFFLEdBQUcsbUNBQW1DLEFBQXRDLENBQXVDO2lCQUN6QyxVQUFLLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsYUFBYSxDQUFDLEFBQTVDLENBQTZDO1FBRWxFLFlBQVksRUFBVSxFQUFFLEtBQWEsRUFBb0MsY0FBK0I7WUFDdkcsS0FBSyxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUscUJBQVMsQ0FBQyxXQUFXLENBQUMsa0JBQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBRGMsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1FBRXhHLENBQUM7UUFFUSxHQUFHLENBQUMsT0FBaUI7WUFDN0IsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxtREFBa0MsRUFBRSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDNUYsQ0FBQzs7SUFYVyw0Q0FBZ0I7K0JBQWhCLGdCQUFnQjtRQUtZLFdBQUEsMEJBQWUsQ0FBQTtPQUwzQyxnQkFBZ0IsQ0FZNUI7SUFFRCxNQUFhLGtCQUFtQixTQUFRLGlCQUFPO2lCQUU5QixPQUFFLEdBQUcsMkNBQTJDLENBQUM7aUJBQ2pELFVBQUssR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLG9CQUFvQixFQUFFLHlCQUF5QixDQUFDLENBQUM7UUFFdEY7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLGtCQUFrQixDQUFDLEVBQUU7Z0JBQ3pCLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLHlCQUF5QixFQUFFO2dCQUMvRSxFQUFFLEVBQUUsSUFBSTtnQkFDUixRQUFRLEVBQUUsbUNBQVUsQ0FBQyxJQUFJO2FBQ3pCLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFUSxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQTBCO1lBQzVDLE1BQU0sb0JBQW9CLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyx5Q0FBeUIsQ0FBQyxDQUFDO1lBQ3JFLE1BQU0sb0JBQW9CLENBQUMsaUJBQWlCLENBQUMsa0JBQVUseUNBQWlDLElBQUksQ0FBQyxDQUFDO1FBQy9GLENBQUM7O0lBakJGLGdEQWtCQztJQUVELE1BQWEsd0JBQXlCLFNBQVEsaUJBQU87aUJBRXBDLE9BQUUsR0FBRyxpREFBaUQsQ0FBQztpQkFDdkQsVUFBSyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUscUNBQXFDLENBQUMsQ0FBQztRQUU5RjtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsd0JBQXdCLENBQUMsRUFBRTtnQkFDL0IsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLHdCQUF3QixDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUscUNBQXFDLEVBQUU7Z0JBQ2pHLEVBQUUsRUFBRSxJQUFJO2dCQUNSLFFBQVEsRUFBRSxtQ0FBVSxDQUFDLElBQUk7YUFDekIsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVRLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBMEI7WUFDNUMsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywwQkFBZSxDQUFDLENBQUM7WUFDckQsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyw4QkFBYyxDQUFDLENBQUM7WUFDbkQsTUFBTSxRQUFRLEdBQUcsK0JBQXNCLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsRUFBRSxpQkFBaUIsRUFBRSx5QkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ3BJLElBQUksUUFBUSxFQUFFO2dCQUNiLGNBQWMsQ0FBQyxjQUFjLENBQUMsNkNBQTZCLEVBQUUsUUFBUSxDQUFDLENBQUM7YUFDdkU7UUFDRixDQUFDOztJQXJCRiw0REFzQkM7SUFFRCxNQUFhLHlCQUEwQixTQUFRLGlCQUFPO2lCQUVyQyxPQUFFLEdBQUcsa0RBQWtELENBQUM7aUJBQ3hELFVBQUssR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLHFCQUFxQixFQUFFLGdDQUFnQyxDQUFDLENBQUM7UUFFOUY7WUFFQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLHlCQUF5QixDQUFDLEVBQUU7Z0JBQ2hDLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSx5QkFBeUIsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLGdDQUFnQyxFQUFFO2dCQUM3RixFQUFFLEVBQUUsSUFBSTtnQkFDUixRQUFRLEVBQUUsbUNBQVUsQ0FBQyxJQUFJO2dCQUN6QixVQUFVLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBQSxtQkFBUSxFQUFDLGlEQUE2Qix3QkFBZSxFQUFFLE1BQU0sNkNBQW1DLEVBQUU7Z0JBQ3pILFlBQVksRUFBRSwwQ0FBNEI7YUFDMUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVRLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBMEI7WUFDNUMsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyw4QkFBYyxDQUFDLENBQUM7WUFDbkQsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxtQkFBWSxDQUFDLENBQUM7WUFDL0MsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyx3QkFBYyxDQUFDLENBQUM7WUFDbkQsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxvQkFBWSxDQUFDLENBQUM7WUFFL0MsTUFBTSxZQUFZLEdBQUcsK0JBQXNCLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsRUFBRSxpQkFBaUIsRUFBRSx5QkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ3hJLElBQUksWUFBWSxFQUFFO2dCQUNqQixJQUFJLFdBQVcsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLEVBQUU7b0JBQzFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsQ0FBQyxFQUFFLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7aUJBQzlFO3FCQUFNO29CQUNOLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyw2Q0FBNkMsRUFBRSxzREFBc0QsQ0FBQyxDQUFDLENBQUM7aUJBQ3pJO2FBQ0Q7UUFDRixDQUFDOztJQS9CRiw4REFnQ0M7SUFFRCxTQUFnQixnQkFBZ0IsQ0FBQyxXQUF5QixFQUFFLElBQWtCLEVBQUUsSUFBWSxFQUFFLEVBQW1CO1FBQ2hILGtDQUFrQztRQUNsQyxJQUFJLEdBQUcscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFbkMsb0JBQW9CO1FBQ3BCLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNyRCxPQUFPO2dCQUNOLE9BQU8sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLG9CQUFvQixFQUFFLHlDQUF5QyxDQUFDO2dCQUN0RixRQUFRLEVBQUUsdUJBQVEsQ0FBQyxLQUFLO2FBQ3hCLENBQUM7U0FDRjtRQUVELHNCQUFzQjtRQUN0QixJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRTtZQUN4QyxPQUFPO2dCQUNOLE9BQU8sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDhCQUE4QixFQUFFLGtEQUFrRCxDQUFDO2dCQUN6RyxRQUFRLEVBQUUsdUJBQVEsQ0FBQyxLQUFLO2FBQ3hCLENBQUM7U0FDRjtRQUVELE1BQU0sS0FBSyxHQUFHLElBQUEsaUJBQVEsRUFBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDNUMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUUzQixJQUFJLElBQUksS0FBSyxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ3ZCLDBDQUEwQztZQUMxQyxNQUFNLEtBQUssR0FBRyxNQUFNLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3JDLElBQUksS0FBSyxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7Z0JBQzVCLE9BQU87b0JBQ04sT0FBTyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMscUJBQXFCLEVBQUUsMkZBQTJGLEVBQUUsSUFBSSxDQUFDO29CQUMvSSxRQUFRLEVBQUUsdUJBQVEsQ0FBQyxLQUFLO2lCQUN4QixDQUFDO2FBQ0Y7U0FDRDtRQUVELCtCQUErQjtRQUMvQixJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQyxFQUFFO1lBQzNGLHNCQUFzQjtZQUN0QixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLGdJQUFnSTtZQUNoTCxPQUFPO2dCQUNOLE9BQU8sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHNCQUFzQixFQUFFLHlGQUF5RixFQUFFLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDbkssUUFBUSxFQUFFLHVCQUFRLENBQUMsS0FBSzthQUN4QixDQUFDO1NBQ0Y7UUFFRCxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUU7WUFDN0MsT0FBTztnQkFDTixPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQywyQkFBMkIsRUFBRSxpRUFBaUUsQ0FBQztnQkFDckgsUUFBUSxFQUFFLHVCQUFRLENBQUMsT0FBTzthQUMxQixDQUFDO1NBQ0Y7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFwREQsNENBb0RDO0lBRUQsU0FBUyxZQUFZLENBQUMsSUFBWTtRQUNqQyxJQUFJLElBQUksRUFBRSxNQUFNLEdBQUcsR0FBRyxFQUFFO1lBQ3ZCLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDO1NBQ25DO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQsU0FBUyxxQkFBcUIsQ0FBQyxRQUFnQjtRQUM5QyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2QsT0FBTyxRQUFRLENBQUM7U0FDaEI7UUFFRCxZQUFZO1FBQ1osUUFBUSxHQUFHLElBQUEsY0FBSSxFQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUVoQywwQkFBMEI7UUFDMUIsUUFBUSxHQUFHLElBQUEsZUFBSyxFQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNoQyxRQUFRLEdBQUcsSUFBQSxlQUFLLEVBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRWpDLE9BQU8sUUFBUSxDQUFDO0lBQ2pCLENBQUM7SUFFRCxNQUFhLGlDQUFrQyxTQUFRLGlCQUFPO2lCQUU3QyxPQUFFLEdBQUcsb0RBQW9ELENBQUM7aUJBQzFELFVBQUssR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLDZCQUE2QixFQUFFLGlDQUFpQyxDQUFDLENBQUM7UUFFdkc7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLGlDQUFpQyxDQUFDLEVBQUU7Z0JBQ3hDLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxpQ0FBaUMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLGlDQUFpQyxFQUFFO2dCQUN0RyxFQUFFLEVBQUUsSUFBSTtnQkFDUixRQUFRLEVBQUUsbUNBQVUsQ0FBQyxJQUFJO2FBQ3pCLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFUSxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQTBCO1lBQzVDLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsOEJBQWMsQ0FBQyxDQUFDO1lBRW5ELE1BQU0sYUFBYSxDQUFDLFVBQVUsQ0FBQztnQkFDOUIsUUFBUSxFQUFFLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRTtnQkFDakMsUUFBUSxFQUFFLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRTtnQkFDakMsT0FBTyxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRTthQUN6QixDQUFDLENBQUM7UUFDSixDQUFDOztJQXRCRiw4RUF1QkM7SUFFRCxNQUFhLDBCQUEyQixTQUFRLGlCQUFPO2lCQUV0QyxPQUFFLEdBQUcsNkNBQTZDLENBQUM7aUJBQ25ELFVBQUssR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLHNCQUFzQixFQUFFLG9DQUFvQyxDQUFDLENBQUM7aUJBR3BGLG1CQUFjLEdBQUcsQ0FBQyxDQUFDO1FBRWxDO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSwwQkFBMEIsQ0FBQyxFQUFFO2dCQUNqQyxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsMEJBQTBCLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxvQ0FBb0MsRUFBRTtnQkFDbEcsRUFBRSxFQUFFLElBQUk7Z0JBQ1IsUUFBUSxFQUFFLG1DQUFVLENBQUMsSUFBSTtnQkFDekIsVUFBVSxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUEsbUJBQVEsRUFBQyxpREFBNkIsd0JBQWUsRUFBRSxNQUFNLDZDQUFtQyxFQUFFO2FBQ3pILENBQUMsQ0FBQztRQUNKLENBQUM7UUFFUSxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQTBCO1lBQzVDLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsOEJBQWMsQ0FBQyxDQUFDO1lBQ25ELE1BQU0sb0JBQW9CLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUIsQ0FBQyxDQUFDO1lBQ2pFLE1BQU0sZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxtQ0FBaUIsQ0FBQyxDQUFDO1lBQ3pELE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsb0JBQVksQ0FBQyxDQUFDO1lBRS9DLE1BQU0sUUFBUSxHQUFHLCtCQUFzQixDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFLEVBQUUsaUJBQWlCLEVBQUUseUJBQWdCLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUNwSSxNQUFNLE1BQU0sR0FBRyxtQkFBbUIsMEJBQTBCLENBQUMsY0FBYyxFQUFFLEVBQUUsQ0FBQztZQUNoRixJQUFJLFFBQVEsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxpQkFBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUM1RixJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFO29CQUMvQixNQUFNLFFBQVEsR0FBRyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsd0JBQXdCLENBQUMsQ0FBQztvQkFDL0UsSUFBSSxDQUFDLG9CQUFvQixHQUFHLGdCQUFnQixDQUFDLGdDQUFnQyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztpQkFDaEc7Z0JBRUQsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDMUMsTUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQywwQkFBMEIsRUFBRSxpQkFBaUIsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFFdEYsTUFBTSxhQUFhLENBQUMsVUFBVSxDQUFDO29CQUM5QixRQUFRLEVBQUUsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUU7b0JBQ2pELFFBQVEsRUFBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUU7b0JBQ2hDLEtBQUssRUFBRSxXQUFXO29CQUNsQixPQUFPLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO2lCQUN6QixDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRTtvQkFDZixJQUFBLG1CQUFPLEVBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7b0JBQ25DLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxTQUFTLENBQUM7Z0JBQ3ZDLENBQUMsQ0FBQyxDQUFDO2FBQ0g7UUFDRixDQUFDO1FBRUQsT0FBTztZQUNOLElBQUEsbUJBQU8sRUFBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUNuQyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsU0FBUyxDQUFDO1FBQ3ZDLENBQUM7O0lBbERGLGdFQW1EQztJQUVELElBQU0sd0JBQXdCLEdBQTlCLE1BQU0sd0JBQXdCO1FBQzdCLFlBQ3FDLGdCQUFtQyxFQUNwQyxlQUFpQyxFQUNwQyxZQUEyQjtZQUZ2QixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBQ3BDLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtZQUNwQyxpQkFBWSxHQUFaLFlBQVksQ0FBZTtRQUN4RCxDQUFDO1FBRUwsS0FBSyxDQUFDLGtCQUFrQixDQUFDLFFBQWE7WUFDckMsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDcEQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsMkJBQTJCLENBQUMsUUFBUSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFFeEgsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO0tBQ0QsQ0FBQTtJQWJLLHdCQUF3QjtRQUUzQixXQUFBLG9DQUFpQixDQUFBO1FBQ2pCLFdBQUEsMkJBQWdCLENBQUE7UUFDaEIsV0FBQSxxQkFBYSxDQUFBO09BSlYsd0JBQXdCLENBYTdCO0lBRUQsU0FBUyxnQkFBZ0IsQ0FBQyxtQkFBeUMsRUFBRSxLQUFjLEVBQUUsS0FBNkI7UUFDakgsbUJBQW1CLENBQUMsTUFBTSxDQUFDLHVCQUFRLENBQUMsS0FBSyxFQUFFLElBQUEsNkJBQWMsRUFBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQ3RFLENBQUM7Z0JBQ0EsS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQztnQkFDckMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEtBQUssRUFBRTthQUNsQixDQUFDLENBQ0YsQ0FBQztJQUNILENBQUM7SUFFRCxLQUFLLFVBQVUscUJBQXFCLENBQUMsUUFBMEIsRUFBRSxRQUFpQjtRQUNqRixNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHdCQUFnQixDQUFDLENBQUM7UUFDdkQsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxvQkFBWSxDQUFDLENBQUM7UUFDL0MsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUIsQ0FBQyxDQUFDO1FBQzFELE1BQU0sa0JBQWtCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxzREFBMEIsQ0FBQyxDQUFDO1FBQ3BFLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsOEJBQWMsQ0FBQyxDQUFDO1FBQ25ELE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMscUJBQWEsQ0FBQyxDQUFDO1FBQ2pELE1BQU0sbUJBQW1CLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxtQ0FBb0IsQ0FBQyxDQUFDO1FBQy9ELE1BQU0sa0JBQWtCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyx3Q0FBbUIsQ0FBQyxDQUFDO1FBQzdELE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsMEJBQWUsQ0FBQyxDQUFDO1FBQ3JELE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsMEJBQVksQ0FBQyxDQUFDO1FBRS9DLE1BQU0sU0FBUyxHQUFHLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxlQUFPLENBQUMsQ0FBQztRQUN2RCxNQUFNLElBQUksR0FBRyxNQUFNLFlBQVksQ0FBQyxRQUFRLENBQUMsZUFBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3hELElBQUksU0FBUyxFQUFFO1lBQ2Qsb0RBQW9EO1lBQ3BELE1BQU0sSUFBQSxlQUFPLEVBQUMsR0FBRyxDQUFDLENBQUM7U0FDbkI7UUFDRCxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ1YseUZBQXlGO1lBRXpGLElBQUksUUFBUSxFQUFFO2dCQUNiLE1BQU0sSUFBSSxLQUFLLENBQUMsbUNBQW1DLENBQUMsQ0FBQzthQUNyRDtZQUVELE9BQU8sY0FBYyxDQUFDLGNBQWMsQ0FBQyw0Q0FBNEIsQ0FBQyxDQUFDO1NBQ25FO1FBRUQsTUFBTSxLQUFLLEdBQUcsZUFBZSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNoRCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDckQsSUFBSSxNQUFvQixDQUFDO1FBQ3pCLElBQUksSUFBSSxFQUFFO1lBQ1QsTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUM3RTthQUFNO1lBQ04sTUFBTSxHQUFHLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDbEM7UUFFRCxJQUFJLE1BQU0sQ0FBQyxVQUFVLEVBQUU7WUFDdEIsTUFBTSxJQUFJLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1NBQzlDO1FBRUQsTUFBTSxPQUFPLEdBQUcsSUFBSSwrQkFBZSxDQUFDLFdBQVcsRUFBRSxhQUFhLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3RHLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFekIsTUFBTSxTQUFTLEdBQUcsS0FBSyxFQUFFLEtBQWEsRUFBaUIsRUFBRTtZQUN4RCxJQUFJO2dCQUNILE1BQU0sZ0JBQWdCLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNwRSxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQ3hCLFFBQVEsR0FBRyxJQUFJLENBQUM7aUJBQ2hCO2dCQUNELE1BQU0sZUFBZSxDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUksa0NBQWdCLENBQUMsU0FBUyxFQUFFLGdCQUFnQixFQUFFLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRTtvQkFDOUcsU0FBUyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsWUFBWSxFQUFFLEtBQUssQ0FBQztvQkFDOUQsYUFBYSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsY0FBYyxFQUFFLEtBQUssQ0FBQztvQkFDdEUsaUJBQWlCLEVBQUUsSUFBSTtpQkFDdkIsQ0FBQyxDQUFDO2dCQUNILE1BQU0sa0JBQWtCLENBQUMsS0FBSyxFQUFFLGVBQWUsQ0FBQyxDQUFDO2dCQUVqRCxJQUFJLFFBQVEsRUFBRTtvQkFDYixNQUFNLGVBQWUsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLENBQUM7aUJBQ3JEO3FCQUFNO29CQUNOLE1BQU0sYUFBYSxDQUFDLFVBQVUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2lCQUMxRjthQUNEO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ2YsZ0JBQWdCLENBQUMsbUJBQW1CLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2FBQ3JFO1FBQ0YsQ0FBQyxDQUFDO1FBRUYsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNLGtCQUFrQixDQUFDLGNBQWMsRUFBRSxDQUFDLEVBQUUsRUFBRSxJQUFJLGFBQUUsQ0FBQztRQUVqRSxNQUFNLGVBQWUsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFO1lBQzFDLGlCQUFpQixFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDO1lBQzdFLFFBQVEsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFO2dCQUNsQyxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUM1QixNQUFNLGVBQWUsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNqRCxJQUFJLE9BQU8sRUFBRTtvQkFDWixTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQ2pCO1lBQ0YsQ0FBQztTQUNELENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRCwyQkFBZ0IsQ0FBQyxlQUFlLENBQUM7UUFDaEMsRUFBRSxFQUFFLDJCQUFtQjtRQUN2QixPQUFPLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxFQUFFO1lBQzNCLE1BQU0scUJBQXFCLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzlDLENBQUM7S0FDRCxDQUFDLENBQUM7SUFFSCwyQkFBZ0IsQ0FBQyxlQUFlLENBQUM7UUFDaEMsRUFBRSxFQUFFLDZCQUFxQjtRQUN6QixPQUFPLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxFQUFFO1lBQzNCLE1BQU0scUJBQXFCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzdDLENBQUM7S0FDRCxDQUFDLENBQUM7SUFFSSxNQUFNLGFBQWEsR0FBRyxLQUFLLEVBQUUsUUFBMEIsRUFBRSxFQUFFO1FBQ2pFLE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsd0JBQWdCLENBQUMsQ0FBQztRQUN2RCxNQUFNLG1CQUFtQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsbUNBQW9CLENBQUMsQ0FBQztRQUMvRCxNQUFNLGtCQUFrQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsd0NBQW1CLENBQUMsQ0FBQztRQUM3RCxNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDBCQUFZLENBQUMsQ0FBQztRQUMvQyxNQUFNLG9CQUFvQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMscUNBQXFCLENBQUMsQ0FBQztRQUVqRSxNQUFNLEtBQUssR0FBRyxlQUFlLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2hELE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUNyRCxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ1YsT0FBTztTQUNQO1FBRUQsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNLGtCQUFrQixDQUFDLGNBQWMsRUFBRSxDQUFDLEVBQUUsRUFBRSxJQUFJLGFBQUUsQ0FBQztRQUVqRSxNQUFNLGVBQWUsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFO1lBQ3ZDLGlCQUFpQixFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDO1lBQzFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFO2dCQUNsQyxJQUFJLE9BQU8sRUFBRTtvQkFDWixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsTUFBTyxDQUFDLFFBQVEsQ0FBQztvQkFDN0MsTUFBTSxjQUFjLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQ2pFLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsS0FBSyxjQUFjLENBQUMsUUFBUSxFQUFFLEVBQUU7d0JBQzNELElBQUk7NEJBQ0gsTUFBTSxlQUFlLENBQUMsYUFBYSxDQUFDLENBQUMsSUFBSSxrQ0FBZ0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLGNBQWMsQ0FBQyxDQUFDLEVBQUU7Z0NBQzFGLGlCQUFpQixFQUFFLG9CQUFvQixDQUFDLFFBQVEsRUFBdUIsQ0FBQyxRQUFRLENBQUMsV0FBVyw2Q0FBNkI7Z0NBQ3pILFNBQVMsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLG1CQUFtQixFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDO2dDQUNoRixhQUFhLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSxxQkFBcUIsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQzs2QkFDeEYsQ0FBQyxDQUFDOzRCQUNILE1BQU0sa0JBQWtCLENBQUMsS0FBSyxFQUFFLGVBQWUsQ0FBQyxDQUFDO3lCQUNqRDt3QkFBQyxPQUFPLENBQUMsRUFBRTs0QkFDWCxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQzdCO3FCQUNEO2lCQUNEO2dCQUNELE1BQU0sZUFBZSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDL0MsQ0FBQztTQUNELENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQztJQXJDVyxRQUFBLGFBQWEsaUJBcUN4QjtJQUVLLE1BQU0sc0JBQXNCLEdBQUcsS0FBSyxFQUFFLFFBQTBCLEVBQUUsRUFBRTtRQUMxRSxNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHdCQUFnQixDQUFDLENBQUM7UUFDdkQsTUFBTSxLQUFLLEdBQUcsZUFBZSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN0RSxJQUFJLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDakIsTUFBTSxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyx3QkFBZ0IsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0RBQXVCLENBQUMsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLHdCQUFjLENBQUMsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLHFDQUFxQixDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3pLO0lBQ0YsQ0FBQyxDQUFDO0lBTlcsUUFBQSxzQkFBc0IsMEJBTWpDO0lBRUssTUFBTSxpQkFBaUIsR0FBRyxLQUFLLEVBQUUsUUFBMEIsRUFBRSxFQUFFO1FBQ3JFLE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsd0JBQWdCLENBQUMsQ0FBQztRQUN2RCxNQUFNLEtBQUssR0FBRyxlQUFlLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRXRFLElBQUksS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNqQixNQUFNLFdBQVcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLHdCQUFnQixDQUFDLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnREFBdUIsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsd0JBQWMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMscUNBQXFCLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDMUs7SUFDRixDQUFDLENBQUM7SUFQVyxRQUFBLGlCQUFpQixxQkFPNUI7SUFFRixJQUFJLGVBQWUsR0FBRyxLQUFLLENBQUM7SUFDckIsTUFBTSxlQUFlLEdBQUcsS0FBSyxFQUFFLFFBQTBCLEVBQUUsRUFBRTtRQUNuRSxNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHdCQUFnQixDQUFDLENBQUM7UUFDdkQsTUFBTSxLQUFLLEdBQUcsZUFBZSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvQyxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ3JCLE1BQU0sZUFBZSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDOUMsZUFBZSxHQUFHLEtBQUssQ0FBQztTQUN4QjtJQUNGLENBQUMsQ0FBQztJQVBXLFFBQUEsZUFBZSxtQkFPMUI7SUFFSyxNQUFNLGNBQWMsR0FBRyxLQUFLLEVBQUUsUUFBMEIsRUFBRSxFQUFFO1FBQ2xFLE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsd0JBQWdCLENBQUMsQ0FBQztRQUN2RCxNQUFNLEtBQUssR0FBRyxlQUFlLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9DLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDckIsTUFBTSxlQUFlLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM3QyxlQUFlLEdBQUcsSUFBSSxDQUFDO1NBQ3ZCO0lBQ0YsQ0FBQyxDQUFDO0lBUFcsUUFBQSxjQUFjLGtCQU96QjtJQUVGLE1BQU0sbUJBQW1CLEdBQUcsS0FBSyxFQUFFLFFBQTBCLEVBQUUsRUFBRTtRQUNoRSxNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHdCQUFnQixDQUFDLENBQUM7UUFDdkQsTUFBTSxtQkFBbUIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLG1DQUFvQixDQUFDLENBQUM7UUFDL0QsTUFBTSxvQkFBb0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHFDQUFxQixDQUFDLENBQUM7UUFFakUsTUFBTSxPQUFPLEdBQUcsZUFBZSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqRCxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUM7UUFFdkUsTUFBTSxlQUFlLEdBQUcsb0JBQW9CLENBQUMsY0FBYyxDQUFDLCtCQUFZLENBQUMsQ0FBQztRQUUxRSxJQUFJO1lBQ0gsTUFBTSxlQUFlLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1NBQzlDO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDZixtQkFBbUIsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFakMsTUFBTSxLQUFLLENBQUM7U0FDWjtJQUNGLENBQUMsQ0FBQztJQUVGLDJCQUFnQixDQUFDLGVBQWUsQ0FBQztRQUNoQyxFQUFFLEVBQUUsMkJBQW1CO1FBQ3ZCLE9BQU8sRUFBRSxtQkFBbUI7S0FDNUIsQ0FBQyxDQUFDO0lBRUgsTUFBTSxpQkFBaUIsR0FBRyxLQUFLLEVBQUUsUUFBMEIsRUFBRSxFQUFFO1FBQzlELE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsd0JBQWdCLENBQUMsQ0FBQztRQUN2RCxNQUFNLG1CQUFtQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsbUNBQW9CLENBQUMsQ0FBQztRQUMvRCxNQUFNLG9CQUFvQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMscUNBQXFCLENBQUMsQ0FBQztRQUVqRSxNQUFNLE9BQU8sR0FBRyxlQUFlLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pELE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUV2RSxJQUFJO1lBQ0gsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFBLG1CQUFhLEdBQUUsQ0FBQztZQUNwQyxJQUFJLEtBQUssRUFBRTtnQkFDVixNQUFNLGFBQWEsR0FBRyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsb0NBQWlCLENBQUMsQ0FBQztnQkFDN0UsTUFBTSxhQUFhLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQzthQUMzQztTQUNEO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDZixtQkFBbUIsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFakMsTUFBTSxLQUFLLENBQUM7U0FDWjtJQUNGLENBQUMsQ0FBQztJQUVGLDJCQUFnQixDQUFDLGVBQWUsQ0FBQztRQUNoQyxFQUFFLEVBQUUseUJBQWlCO1FBQ3JCLE9BQU8sRUFBRSxpQkFBaUI7S0FDMUIsQ0FBQyxDQUFDO0lBRUksTUFBTSxnQkFBZ0IsR0FBRyxLQUFLLEVBQUUsUUFBMEIsRUFBRSxFQUFFO1FBQ3BFLE1BQU0sZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxvQ0FBaUIsQ0FBQyxDQUFDO1FBQ3pELE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsd0JBQWdCLENBQUMsQ0FBQztRQUN2RCxNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLG9CQUFZLENBQUMsQ0FBQztRQUMvQyxNQUFNLG1CQUFtQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsbUNBQW9CLENBQUMsQ0FBQztRQUMvRCxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDhCQUFjLENBQUMsQ0FBQztRQUNuRCxNQUFNLG9CQUFvQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMscUNBQXFCLENBQUMsQ0FBQztRQUNqRSxNQUFNLGtCQUFrQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsaUNBQW1CLENBQUMsQ0FBQztRQUM3RCxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHdCQUFjLENBQUMsQ0FBQztRQUVuRCxNQUFNLE9BQU8sR0FBRyxlQUFlLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pELE1BQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQyxlQUFlLENBQUMsTUFBTSxnQkFBZ0IsQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFGLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2RSxNQUFNLGlCQUFpQixHQUFHLG9CQUFvQixDQUFDLFFBQVEsRUFBdUIsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUM7UUFFMUcsSUFBSTtZQUNILCtDQUErQztZQUMvQyxNQUFNLGlCQUFpQixHQUFHLElBQUEsaUJBQVEsRUFBQyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUMsV0FBVyxFQUFDLEVBQUU7Z0JBRXBGLElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsS0FBSyxXQUFXLENBQUMsUUFBUSxFQUFFLElBQUksU0FBUyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxFQUFFO29CQUN2SCxNQUFNLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsd0RBQXdELENBQUMsQ0FBQyxDQUFDO2lCQUMxRztnQkFDRCxNQUFNLGVBQWUsR0FBRyxNQUFNLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBRTVELGNBQWM7Z0JBQ2QsSUFBSSxNQUFvQixDQUFDO2dCQUN6QixJQUFJLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsRUFBRTtvQkFDckUsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFPLENBQUM7aUJBQ3pCO3FCQUFNO29CQUNOLE1BQU0sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFPLENBQUM7aUJBQ3pEO2dCQUVELE1BQU0sVUFBVSxHQUFHLE1BQU0sd0JBQXdCLENBQ2hELGVBQWUsRUFDZixXQUFXLEVBQ1gsYUFBYSxFQUNiLE1BQU0sRUFDTixFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLGVBQWUsQ0FBQyxXQUFXLEVBQUUsY0FBYyxFQUFFLGVBQWUsSUFBSSxpQkFBaUIsS0FBSyxVQUFVLEVBQUUsRUFDeEksaUJBQWlCLENBQ2pCLENBQUM7Z0JBRUYsSUFBSSxDQUFDLFVBQVUsRUFBRTtvQkFDaEIsT0FBTyxTQUFTLENBQUM7aUJBQ2pCO2dCQUVELE9BQU8sRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsQ0FBQztZQUNwRCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFTCxJQUFJLGlCQUFpQixDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7Z0JBQ2xDLGlCQUFpQjtnQkFDakIsSUFBSSxlQUFlLEVBQUU7b0JBQ3BCLE1BQU0saUJBQWlCLEdBQUcsaUJBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxrQ0FBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxTQUFTLEVBQUUsaUJBQWlCLEtBQUssVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUN6SixNQUFNLE9BQU8sR0FBRzt3QkFDZixpQkFBaUIsRUFBRSxvQkFBb0IsQ0FBQyxRQUFRLEVBQXVCLENBQUMsUUFBUSxDQUFDLFdBQVcsNkNBQTZCO3dCQUN6SCxhQUFhLEVBQUUsaUJBQWlCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLEVBQUUsQ0FBQyxpRUFBaUUsQ0FBQyxFQUFFLEVBQUUsa0JBQWtCLEVBQUUsaUJBQWlCLENBQUMsTUFBTSxDQUFDOzRCQUNoTixDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxvQkFBb0IsRUFBRSxPQUFPLEVBQUUsQ0FBQyw2REFBNkQsQ0FBQyxFQUFFLEVBQUUsWUFBWSxFQUFFLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQzt3QkFDbE0sU0FBUyxFQUFFLGlCQUFpQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxHQUFHLEVBQUUsY0FBYyxFQUFFLE9BQU8sRUFBRSxDQUFDLGlFQUFpRSxDQUFDLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxpQkFBaUIsQ0FBQyxNQUFNLENBQUM7NEJBQ3hNLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsR0FBRyxFQUFFLGtCQUFrQixFQUFFLE9BQU8sRUFBRSxDQUFDLDZEQUE2RCxDQUFDLEVBQUUsRUFBRSxVQUFVLEVBQUUsU0FBUyxDQUFDLG1CQUFtQixDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO3FCQUM5TCxDQUFDO29CQUNGLE1BQU0sZUFBZSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRSxPQUFPLENBQUMsQ0FBQztpQkFDaEU7cUJBQU07b0JBQ04sTUFBTSxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLGtDQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLGlCQUFpQixLQUFLLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDckssTUFBTSxTQUFTLEdBQUcsb0JBQW9CLENBQUMsUUFBUSxFQUF1QixDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUM7b0JBQzVGLE1BQU0sT0FBTyxHQUFHO3dCQUNmLGlCQUFpQixFQUFFLFNBQVMsNkNBQTZCLElBQUksU0FBUyw2Q0FBNkI7d0JBQ25HLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsR0FBRyxFQUFFLGlCQUFpQixFQUFFLE9BQU8sRUFBRSxDQUFDLGtFQUFrRSxDQUFDLEVBQUUsRUFBRSxtQkFBbUIsRUFBRSxpQkFBaUIsQ0FBQyxNQUFNLENBQUM7NEJBQ25OLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsR0FBRyxFQUFFLHFCQUFxQixFQUFFLE9BQU8sRUFBRSxDQUFDLDhEQUE4RCxDQUFDLEVBQUUsRUFBRSxhQUFhLEVBQUUsU0FBUyxDQUFDLG1CQUFtQixDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUNyTSxTQUFTLEVBQUUsaUJBQWlCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxjQUFjLEVBQUUsT0FBTyxFQUFFLENBQUMsa0VBQWtFLENBQUMsRUFBRSxFQUFFLGlCQUFpQixFQUFFLGlCQUFpQixDQUFDLE1BQU0sQ0FBQzs0QkFDMU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxHQUFHLEVBQUUsa0JBQWtCLEVBQUUsT0FBTyxFQUFFLENBQUMsOERBQThELENBQUMsRUFBRSxFQUFFLFdBQVcsRUFBRSxTQUFTLENBQUMsbUJBQW1CLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7cUJBQ2hNLENBQUM7b0JBQ0YsTUFBTSxlQUFlLENBQUMsYUFBYSxDQUFDLGlCQUFpQixFQUFFLE9BQU8sQ0FBQyxDQUFDO2lCQUNoRTtnQkFFRCxNQUFNLElBQUksR0FBRyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbEMsTUFBTSxlQUFlLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDMUMsSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO29CQUNuQyxNQUFNLElBQUksR0FBRyxlQUFlLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDdEQsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFO3dCQUM5QixNQUFNLGFBQWEsQ0FBQyxVQUFVLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7cUJBQzVHO2lCQUNEO2FBQ0Q7U0FDRDtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1gsT0FBTyxDQUFDLG1CQUFtQixFQUFFLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLDRFQUE0RSxFQUFFLElBQUEsd0JBQWUsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUN2SztnQkFBUztZQUNULElBQUksZUFBZSxFQUFFO2dCQUNwQiw2Q0FBNkM7Z0JBQzdDLE1BQU0sZUFBZSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQzNDLGVBQWUsR0FBRyxLQUFLLENBQUM7YUFDeEI7U0FDRDtJQUNGLENBQUMsQ0FBQztJQTNGVyxRQUFBLGdCQUFnQixvQkEyRjNCO0lBRUssTUFBTSw0QkFBNEIsR0FBRyxLQUFLLEVBQUUsUUFBMEIsRUFBRSxFQUFFO1FBQ2hGLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsOEJBQWMsQ0FBQyxDQUFDO1FBQ25ELE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsd0JBQWdCLENBQUMsQ0FBQztRQUN2RCxNQUFNLEtBQUssR0FBRyxlQUFlLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRS9DLE1BQU0sYUFBYSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUMzRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLFFBQVE7WUFDcEIsT0FBTyxFQUFFLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRTtTQUNoQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ04sQ0FBQyxDQUFDO0lBVFcsUUFBQSw0QkFBNEIsZ0NBU3ZDO0lBRUYsTUFBTSxvQ0FBcUMsU0FBUSxpQkFBTztRQUV6RCxZQUNDLEVBQVUsRUFDVixLQUF1QixFQUNOLGdCQUFtRDtZQUVwRSxLQUFLLENBQUM7Z0JBQ0wsRUFBRTtnQkFDRixLQUFLO2dCQUNMLEVBQUUsRUFBRSxJQUFJO2dCQUNSLFFBQVEsRUFBRSxtQ0FBVSxDQUFDLElBQUk7Z0JBQ3pCLFlBQVksRUFBRSxrREFBb0M7YUFDbEQsQ0FBQyxDQUFDO1lBUmMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQztRQVNyRSxDQUFDO1FBRVEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUEwQjtZQUM1QyxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDhCQUFjLENBQUMsQ0FBQztZQUNuRCxNQUFNLHlCQUF5QixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsc0RBQTBCLENBQUMsQ0FBQztZQUUzRSxNQUFNLFlBQVksR0FBRywrQkFBc0IsQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRSxFQUFFLGlCQUFpQixFQUFFLHlCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDeEksSUFBSSxDQUFDLFlBQVksRUFBRTtnQkFDbEIsT0FBTzthQUNQO1lBRUQsTUFBTSx5QkFBeUIsQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3JGLENBQUM7S0FDRDtJQUVELE1BQWEsZ0NBQWlDLFNBQVEsb0NBQW9DO2lCQUV6RSxPQUFFLEdBQUcseURBQXlELENBQUM7aUJBQy9ELFVBQUssR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLGtDQUFrQyxFQUFFLHdDQUF3QyxDQUFDLENBQUM7UUFFbkg7WUFDQyxLQUFLLENBQ0osZ0NBQWdDLENBQUMsRUFBRSxFQUNuQyxFQUFFLEtBQUssRUFBRSxnQ0FBZ0MsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLHVDQUF1QyxFQUFFLEVBQ3BHLElBQUksQ0FDSixDQUFDO1FBQ0gsQ0FBQzs7SUFYRiw0RUFZQztJQUVELE1BQWEsaUNBQWtDLFNBQVEsb0NBQW9DO2lCQUUxRSxPQUFFLEdBQUcsMERBQTBELENBQUM7aUJBQ2hFLFVBQUssR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLG1DQUFtQyxFQUFFLHdDQUF3QyxDQUFDLENBQUM7UUFFcEg7WUFDQyxLQUFLLENBQ0osaUNBQWlDLENBQUMsRUFBRSxFQUNwQyxFQUFFLEtBQUssRUFBRSxpQ0FBaUMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLHdDQUF3QyxFQUFFLEVBQ3RHLEtBQUssQ0FDTCxDQUFDO1FBQ0gsQ0FBQzs7SUFYRiw4RUFZQztJQUVELE1BQWEsbUNBQW9DLFNBQVEsb0NBQW9DO2lCQUU1RSxPQUFFLEdBQUcsNERBQTRELENBQUM7aUJBQ2xFLFVBQUssR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLHFDQUFxQyxFQUFFLDJDQUEyQyxDQUFDLENBQUM7UUFFekg7WUFDQyxLQUFLLENBQ0osbUNBQW1DLENBQUMsRUFBRSxFQUN0QyxFQUFFLEtBQUssRUFBRSxtQ0FBbUMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLDBDQUEwQyxFQUFFLEVBQzFHLFFBQVEsQ0FDUixDQUFDO1FBQ0gsQ0FBQzs7SUFYRixrRkFZQztJQUVELE1BQWEsa0NBQW1DLFNBQVEsb0NBQW9DO2lCQUUzRSxPQUFFLEdBQUcsMkRBQTJELENBQUM7aUJBQ2pFLFVBQUssR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLG9DQUFvQyxFQUFFLDBDQUEwQyxDQUFDLENBQUM7UUFFdkg7WUFDQyxLQUFLLENBQ0osa0NBQWtDLENBQUMsRUFBRSxFQUNyQyxFQUFFLEtBQUssRUFBRSxrQ0FBa0MsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLHlDQUF5QyxFQUFFLEVBQ3hHLE9BQU8sQ0FDUCxDQUFDO1FBQ0gsQ0FBQzs7SUFYRixnRkFZQyJ9