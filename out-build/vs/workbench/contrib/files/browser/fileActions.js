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
define(["require", "exports", "vs/nls!vs/workbench/contrib/files/browser/fileActions", "vs/base/common/platform", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/uri", "vs/base/common/errorMessage", "vs/base/common/actions", "vs/base/common/lifecycle", "vs/workbench/contrib/files/common/files", "vs/platform/files/common/files", "vs/workbench/common/editor", "vs/platform/quickinput/common/quickInput", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/host/browser/host", "vs/workbench/contrib/files/browser/fileConstants", "vs/editor/common/services/resolverService", "vs/platform/configuration/common/configuration", "vs/platform/clipboard/common/clipboardService", "vs/editor/common/languages/language", "vs/editor/common/services/model", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/base/common/network", "vs/platform/dialogs/common/dialogs", "vs/platform/notification/common/notification", "vs/workbench/services/editor/common/editorService", "vs/workbench/browser/parts/editor/editorCommands", "vs/base/common/arrays", "vs/workbench/contrib/files/common/explorerModel", "vs/base/common/errors", "vs/base/browser/dom", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/base/common/async", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/base/common/codicons", "vs/base/common/themables", "vs/workbench/common/views", "vs/base/common/strings", "vs/platform/uriIdentity/common/uriIdentity", "vs/editor/browser/services/bulkEditService", "vs/workbench/contrib/files/browser/files", "vs/workbench/contrib/files/browser/fileImportExport", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/services/path/common/pathService", "vs/platform/actions/common/actions", "vs/workbench/common/contextkeys", "vs/base/common/keyCodes", "vs/platform/action/common/actionCommonCategories"], function (require, exports, nls, platform_1, path_1, resources, uri_1, errorMessage_1, actions_1, lifecycle_1, files_1, files_2, editor_1, quickInput_1, instantiation_1, host_1, fileConstants_1, resolverService_1, configuration_1, clipboardService_1, language_1, model_1, commands_1, contextkey_1, network_1, dialogs_1, notification_1, editorService_1, editorCommands_1, arrays_1, explorerModel_1, errors_1, dom_1, filesConfigurationService_1, workingCopyService_1, async_1, workingCopyFileService_1, codicons_1, themables_1, views_1, strings_1, uriIdentity_1, bulkEditService_1, files_3, fileImportExport_1, panecomposite_1, remoteAgentService_1, pathService_1, actions_2, contextkeys_1, keyCodes_1, actionCommonCategories_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$dIb = exports.$cIb = exports.$bIb = exports.$aIb = exports.$_Hb = exports.$$Hb = exports.$0Hb = exports.$9Hb = exports.$8Hb = exports.$7Hb = exports.$6Hb = exports.$5Hb = exports.$4Hb = exports.$3Hb = exports.$2Hb = exports.$1Hb = exports.$ZHb = exports.$YHb = exports.$XHb = exports.$WHb = exports.$VHb = exports.$UHb = exports.$THb = exports.$SHb = exports.$RHb = exports.$QHb = exports.$PHb = exports.$OHb = exports.$NHb = exports.$MHb = exports.$LHb = exports.$KHb = exports.$JHb = exports.$IHb = exports.$HHb = exports.$GHb = void 0;
    exports.$GHb = 'explorer.newFile';
    exports.$HHb = nls.localize(0, null);
    exports.$IHb = 'explorer.newFolder';
    exports.$JHb = nls.localize(1, null);
    exports.$KHb = nls.localize(2, null);
    exports.$LHb = nls.localize(3, null);
    exports.$MHb = nls.localize(4, null);
    exports.$NHb = nls.localize(5, null);
    exports.$OHb = new contextkey_1.$2i('fileCopied', false);
    exports.$PHb = 'explorer.download';
    exports.$QHb = nls.localize(6, null);
    exports.$RHb = 'explorer.upload';
    exports.$SHb = nls.localize(7, null);
    const CONFIRM_DELETE_SETTING_KEY = 'explorer.confirmDelete';
    const MAX_UNDO_FILE_SIZE = 5000000; // 5mb
    function onError(notificationService, error) {
        if (error.message === 'string') {
            error = error.message;
        }
        notificationService.error((0, errorMessage_1.$mi)(error, false));
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
            primaryButton = platform_1.$i ? nls.localize(8, null) : nls.localize(9, null);
        }
        else {
            primaryButton = nls.localize(10, null);
        }
        // Handle dirty
        const distinctElements = resources.$rg(elements, e => e.resource);
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
                message = nls.localize(11, null);
            }
            else if (distinctElements[0].isDirectory) {
                if (dirtyWorkingCopies.size === 1) {
                    message = nls.localize(12, null, distinctElements[0].name);
                }
                else {
                    message = nls.localize(13, null, distinctElements[0].name, dirtyWorkingCopies.size);
                }
            }
            else {
                message = nls.localize(14, null, distinctElements[0].name);
            }
            const response = await dialogService.confirm({
                type: 'warning',
                message,
                detail: nls.localize(15, null),
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
        const deleteDetail = distinctElements.some(e => e.isDirectory) ? nls.localize(16, null) :
            distinctElements.length > 1 ? nls.localize(17, null) : nls.localize(18, null);
        // Check if we need to ask for confirmation at all
        if (skipConfirm || (useTrash && configurationService.getValue(CONFIRM_DELETE_SETTING_KEY) === false)) {
            confirmation = { confirmed: true };
        }
        // Confirm for moving to trash
        else if (useTrash) {
            let { message, detail } = getMoveToTrashMessage(distinctElements);
            detail += detail ? '\n' : '';
            if (platform_1.$i) {
                detail += distinctElements.length > 1 ? nls.localize(19, null) : nls.localize(20, null);
            }
            else {
                detail += distinctElements.length > 1 ? nls.localize(21, null) : nls.localize(22, null);
            }
            confirmation = await dialogService.confirm({
                message,
                detail,
                primaryButton,
                checkbox: {
                    label: nls.localize(23, null)
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
            const resourceFileEdits = distinctElements.map(e => new bulkEditService_1.$q1(e.resource, undefined, { recursive: true, folder: e.isDirectory, ignoreIfNotExists, skipTrashBin: !useTrash, maxSize: MAX_UNDO_FILE_SIZE }));
            const options = {
                undoLabel: distinctElements.length > 1 ? nls.localize(24, null, distinctElements.length) : nls.localize(25, null, distinctElements[0].name),
                progressLabel: distinctElements.length > 1 ? nls.localize(26, null, distinctElements.length) : nls.localize(27, null, distinctElements[0].name),
            };
            await explorerService.applyBulkEdit(resourceFileEdits, options);
        }
        catch (error) {
            // Handle error to delete file(s) from a modal confirmation dialog
            let errorMessage;
            let detailMessage;
            let primaryButton;
            if (useTrash) {
                errorMessage = platform_1.$i ? nls.localize(28, null) : nls.localize(29, null);
                detailMessage = deleteDetail;
                primaryButton = nls.localize(30, null);
            }
            else {
                errorMessage = (0, errorMessage_1.$mi)(error, false);
                primaryButton = nls.localize(31, null);
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
                message: nls.localize(32, null, distinctElements.length),
                detail: (0, dialogs_1.$rA)(distinctElements.map(e => e.resource))
            };
        }
        if (distinctElements.length > 1) {
            if (distinctElements[0].isDirectory) {
                return {
                    message: nls.localize(33, null, distinctElements.length),
                    detail: (0, dialogs_1.$rA)(distinctElements.map(e => e.resource))
                };
            }
            return {
                message: nls.localize(34, null, distinctElements.length),
                detail: (0, dialogs_1.$rA)(distinctElements.map(e => e.resource))
            };
        }
        if (distinctElements[0].isDirectory && !distinctElements[0].isSymbolicLink) {
            return { message: nls.localize(35, null, distinctElements[0].name), detail: '' };
        }
        return { message: nls.localize(36, null, distinctElements[0].name), detail: '' };
    }
    function getDeleteMessage(distinctElements) {
        if (containsBothDirectoryAndFile(distinctElements)) {
            return {
                message: nls.localize(37, null, distinctElements.length),
                detail: (0, dialogs_1.$rA)(distinctElements.map(e => e.resource))
            };
        }
        if (distinctElements.length > 1) {
            if (distinctElements[0].isDirectory) {
                return {
                    message: nls.localize(38, null, distinctElements.length),
                    detail: (0, dialogs_1.$rA)(distinctElements.map(e => e.resource))
                };
            }
            return {
                message: nls.localize(39, null, distinctElements.length),
                detail: (0, dialogs_1.$rA)(distinctElements.map(e => e.resource))
            };
        }
        if (distinctElements[0].isDirectory) {
            return { message: nls.localize(40, null, distinctElements[0].name), detail: '' };
        }
        return { message: nls.localize(41, null, distinctElements[0].name), detail: '' };
    }
    function containsBothDirectoryAndFile(distinctElements) {
        const directory = distinctElements.find(element => element.isDirectory);
        const file = distinctElements.find(element => !element.isDirectory);
        return !!directory && !!file;
    }
    async function $THb(explorerService, fileService, dialogService, targetFolder, fileToPaste, incrementalNaming) {
        let name = resources.$eg(fileToPaste.resource);
        let candidate = resources.$ig(targetFolder.resource, name);
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
                name = $UHb(name, !!fileToPaste.isDirectory, incrementalNaming);
            }
            candidate = resources.$ig(targetFolder.resource, name);
        }
        return candidate;
    }
    exports.$THb = $THb;
    function $UHb(name, isFolder, incrementalNaming) {
        if (incrementalNaming === 'simple') {
            let namePrefix = name;
            let extSuffix = '';
            if (!isFolder) {
                extSuffix = (0, path_1.$be)(name);
                namePrefix = (0, path_1.$ae)(name, extSuffix);
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
    exports.$UHb = $UHb;
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
            message: nls.localize(42, null, (0, path_1.$ae)(targetResource.path)),
            primaryButton: nls.localize(43, null)
        });
        return confirmed;
    }
    // Global Compare with
    class $VHb extends actions_2.$Wu {
        static { this.ID = 'workbench.files.action.compareFileWith'; }
        static { this.LABEL = nls.localize(44, null); }
        constructor() {
            super({
                id: $VHb.ID,
                title: { value: $VHb.LABEL, original: 'Compare Active File With...' },
                f1: true,
                category: actionCommonCategories_1.$Nl.File,
                precondition: contextkeys_1.$$cb
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            const textModelService = accessor.get(resolverService_1.$uA);
            const quickInputService = accessor.get(quickInput_1.$Gq);
            const activeInput = editorService.activeEditor;
            const activeResource = editor_1.$3E.getOriginalUri(activeInput);
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
    exports.$VHb = $VHb;
    class $WHb extends actions_2.$Wu {
        static { this.ID = 'workbench.action.toggleAutoSave'; }
        static { this.LABEL = nls.localize(45, null); }
        constructor() {
            super({
                id: $WHb.ID,
                title: { value: $WHb.LABEL, original: 'Toggle Auto Save' },
                f1: true,
                category: actionCommonCategories_1.$Nl.File
            });
        }
        run(accessor) {
            const filesConfigurationService = accessor.get(filesConfigurationService_1.$yD);
            return filesConfigurationService.toggleAutoSave();
        }
    }
    exports.$WHb = $WHb;
    let BaseSaveAllAction = class BaseSaveAllAction extends actions_1.$gi {
        constructor(id, label, b, c, f) {
            super(id, label);
            this.b = b;
            this.c = c;
            this.f = f;
            this.a = this.f.hasDirty;
            this.enabled = this.a;
            this.t();
        }
        t() {
            // update enablement based on working copy changes
            this.B(this.f.onDidChangeDirty(workingCopy => this.y(workingCopy)));
        }
        y(workingCopy) {
            const hasDirty = workingCopy.isDirty() || this.f.hasDirty;
            if (this.a !== hasDirty) {
                this.enabled = hasDirty;
                this.a = this.enabled;
            }
        }
        async run(context) {
            try {
                await this.g(context);
            }
            catch (error) {
                onError(this.c, error);
            }
        }
    };
    BaseSaveAllAction = __decorate([
        __param(2, commands_1.$Fr),
        __param(3, notification_1.$Yu),
        __param(4, workingCopyService_1.$TC)
    ], BaseSaveAllAction);
    class $XHb extends BaseSaveAllAction {
        static { this.ID = 'workbench.files.action.saveAllInGroup'; }
        static { this.LABEL = nls.localize(46, null); }
        get class() {
            return 'explorer-action ' + themables_1.ThemeIcon.asClassName(codicons_1.$Pj.saveAll);
        }
        g(context) {
            return this.b.executeCommand(fileConstants_1.$cHb, {}, context);
        }
    }
    exports.$XHb = $XHb;
    let $YHb = class $YHb extends actions_1.$gi {
        static { this.ID = 'workbench.files.action.closeGroup'; }
        static { this.LABEL = nls.localize(47, null); }
        constructor(id, label, a) {
            super(id, label, themables_1.ThemeIcon.asClassName(codicons_1.$Pj.closeAll));
            this.a = a;
        }
        run(context) {
            return this.a.executeCommand(editorCommands_1.$gub, {}, context);
        }
    };
    exports.$YHb = $YHb;
    exports.$YHb = $YHb = __decorate([
        __param(2, commands_1.$Fr)
    ], $YHb);
    class $ZHb extends actions_2.$Wu {
        static { this.ID = 'workbench.files.action.focusFilesExplorer'; }
        static { this.LABEL = nls.localize(48, null); }
        constructor() {
            super({
                id: $ZHb.ID,
                title: { value: $ZHb.LABEL, original: 'Focus on Files Explorer' },
                f1: true,
                category: actionCommonCategories_1.$Nl.File
            });
        }
        async run(accessor) {
            const paneCompositeService = accessor.get(panecomposite_1.$Yeb);
            await paneCompositeService.openPaneComposite(files_1.$Mdb, 0 /* ViewContainerLocation.Sidebar */, true);
        }
    }
    exports.$ZHb = $ZHb;
    class $1Hb extends actions_2.$Wu {
        static { this.ID = 'workbench.files.action.showActiveFileInExplorer'; }
        static { this.LABEL = nls.localize(49, null); }
        constructor() {
            super({
                id: $1Hb.ID,
                title: { value: $1Hb.LABEL, original: 'Reveal Active File in Explorer View' },
                f1: true,
                category: actionCommonCategories_1.$Nl.File
            });
        }
        async run(accessor) {
            const commandService = accessor.get(commands_1.$Fr);
            const editorService = accessor.get(editorService_1.$9C);
            const resource = editor_1.$3E.getOriginalUri(editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            if (resource) {
                commandService.executeCommand(fileConstants_1.$WGb, resource);
            }
        }
    }
    exports.$1Hb = $1Hb;
    class $2Hb extends actions_2.$Wu {
        static { this.ID = 'workbench.action.files.showOpenedFileInNewWindow'; }
        static { this.LABEL = nls.localize(50, null); }
        constructor() {
            super({
                id: $2Hb.ID,
                title: { value: $2Hb.LABEL, original: 'Open Active File in New Window' },
                f1: true,
                category: actionCommonCategories_1.$Nl.File,
                keybinding: { primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 45 /* KeyCode.KeyO */), weight: 200 /* KeybindingWeight.WorkbenchContrib */ },
                precondition: contextkeys_1.$Tcb
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            const hostService = accessor.get(host_1.$VT);
            const dialogService = accessor.get(dialogs_1.$oA);
            const fileService = accessor.get(files_2.$6j);
            const fileResource = editor_1.$3E.getOriginalUri(editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            if (fileResource) {
                if (fileService.hasProvider(fileResource)) {
                    hostService.openWindow([{ fileUri: fileResource }], { forceNewWindow: true });
                }
                else {
                    dialogService.error(nls.localize(51, null));
                }
            }
        }
    }
    exports.$2Hb = $2Hb;
    function $3Hb(pathService, item, name, os) {
        // Produce a well formed file name
        name = getWellFormedFileName(name);
        // Name not provided
        if (!name || name.length === 0 || /^\s+$/.test(name)) {
            return {
                content: nls.localize(52, null),
                severity: notification_1.Severity.Error
            };
        }
        // Relative paths only
        if (name[0] === '/' || name[0] === '\\') {
            return {
                content: nls.localize(53, null),
                severity: notification_1.Severity.Error
            };
        }
        const names = (0, arrays_1.$Fb)(name.split(/[\\/]/));
        const parent = item.parent;
        if (name !== item.name) {
            // Do not allow to overwrite existing file
            const child = parent?.getChild(name);
            if (child && child !== item) {
                return {
                    content: nls.localize(54, null, name),
                    severity: notification_1.Severity.Error
                };
            }
        }
        // Check for invalid file name.
        if (names.some(folderName => !pathService.hasValidBasename(item.resource, os, folderName))) {
            // Escape * characters
            const escapedName = name.replace(/\*/g, '\\*'); // CodeQL [SM02383] This only processes filenames which are enforced against having backslashes in them farther up in the stack.
            return {
                content: nls.localize(55, null, trimLongName(escapedName)),
                severity: notification_1.Severity.Error
            };
        }
        if (names.some(name => /^\s|\s$/.test(name))) {
            return {
                content: nls.localize(56, null),
                severity: notification_1.Severity.Warning
            };
        }
        return null;
    }
    exports.$3Hb = $3Hb;
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
        filename = (0, strings_1.$te)(filename, '\t');
        // Remove trailing slashes
        filename = (0, strings_1.$ve)(filename, '/');
        filename = (0, strings_1.$ve)(filename, '\\');
        return filename;
    }
    class $4Hb extends actions_2.$Wu {
        static { this.ID = 'workbench.files.action.compareNewUntitledTextFiles'; }
        static { this.LABEL = nls.localize(57, null); }
        constructor() {
            super({
                id: $4Hb.ID,
                title: { value: $4Hb.LABEL, original: 'Compare New Untitled Text Files' },
                f1: true,
                category: actionCommonCategories_1.$Nl.File
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            await editorService.openEditor({
                original: { resource: undefined },
                modified: { resource: undefined },
                options: { pinned: true }
            });
        }
    }
    exports.$4Hb = $4Hb;
    class $5Hb extends actions_2.$Wu {
        static { this.ID = 'workbench.files.action.compareWithClipboard'; }
        static { this.LABEL = nls.localize(58, null); }
        static { this.b = 0; }
        constructor() {
            super({
                id: $5Hb.ID,
                title: { value: $5Hb.LABEL, original: 'Compare Active File with Clipboard' },
                f1: true,
                category: actionCommonCategories_1.$Nl.File,
                keybinding: { primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 33 /* KeyCode.KeyC */), weight: 200 /* KeybindingWeight.WorkbenchContrib */ }
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            const instantiationService = accessor.get(instantiation_1.$Ah);
            const textModelService = accessor.get(resolverService_1.$uA);
            const fileService = accessor.get(files_2.$6j);
            const resource = editor_1.$3E.getOriginalUri(editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            const scheme = `clipboardCompare${$5Hb.b++}`;
            if (resource && (fileService.hasProvider(resource) || resource.scheme === network_1.Schemas.untitled)) {
                if (!this.a) {
                    const provider = instantiationService.createInstance(ClipboardContentProvider);
                    this.a = textModelService.registerTextModelContentProvider(scheme, provider);
                }
                const name = resources.$fg(resource);
                const editorLabel = nls.localize(59, null, name);
                await editorService.openEditor({
                    original: { resource: resource.with({ scheme }) },
                    modified: { resource: resource },
                    label: editorLabel,
                    options: { pinned: true }
                }).finally(() => {
                    (0, lifecycle_1.$fc)(this.a);
                    this.a = undefined;
                });
            }
        }
        dispose() {
            (0, lifecycle_1.$fc)(this.a);
            this.a = undefined;
        }
    }
    exports.$5Hb = $5Hb;
    let ClipboardContentProvider = class ClipboardContentProvider {
        constructor(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
        }
        async provideTextContent(resource) {
            const text = await this.a.readText();
            const model = this.c.createModel(text, this.b.createByFilepathOrFirstLine(resource), resource);
            return model;
        }
    };
    ClipboardContentProvider = __decorate([
        __param(0, clipboardService_1.$UZ),
        __param(1, language_1.$ct),
        __param(2, model_1.$yA)
    ], ClipboardContentProvider);
    function onErrorWithRetry(notificationService, error, retry) {
        notificationService.prompt(notification_1.Severity.Error, (0, errorMessage_1.$mi)(error, false), [{
                label: nls.localize(60, null),
                run: () => retry()
            }]);
    }
    async function openExplorerAndCreate(accessor, isFolder) {
        const explorerService = accessor.get(files_3.$xHb);
        const fileService = accessor.get(files_2.$6j);
        const configService = accessor.get(configuration_1.$8h);
        const filesConfigService = accessor.get(filesConfigurationService_1.$yD);
        const editorService = accessor.get(editorService_1.$9C);
        const viewsService = accessor.get(views_1.$$E);
        const notificationService = accessor.get(notification_1.$Yu);
        const remoteAgentService = accessor.get(remoteAgentService_1.$jm);
        const commandService = accessor.get(commands_1.$Fr);
        const pathService = accessor.get(pathService_1.$yJ);
        const wasHidden = !viewsService.isViewVisible(files_1.$Ndb);
        const view = await viewsService.openView(files_1.$Ndb, true);
        if (wasHidden) {
            // Give explorer some time to resolve itself #111218
            await (0, async_1.$Hg)(500);
        }
        if (!view) {
            // Can happen in empty workspace case (https://github.com/microsoft/vscode/issues/100604)
            if (isFolder) {
                throw new Error('Open a folder or workspace first.');
            }
            return commandService.executeCommand(fileConstants_1.$oHb);
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
        const newStat = new explorerModel_1.$wHb(fileService, configService, filesConfigService, folder, isFolder);
        folder.addChild(newStat);
        const onSuccess = async (value) => {
            try {
                const resourceToCreate = resources.$ig(folder.resource, value);
                if (value.endsWith('/')) {
                    isFolder = true;
                }
                await explorerService.applyBulkEdit([new bulkEditService_1.$q1(undefined, resourceToCreate, { folder: isFolder })], {
                    undoLabel: nls.localize(61, null, value),
                    progressLabel: nls.localize(62, null, value),
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
            validationMessage: value => $3Hb(pathService, newStat, value, os),
            onFinish: async (value, success) => {
                folder.removeChild(newStat);
                await explorerService.setEditable(newStat, null);
                if (success) {
                    onSuccess(value);
                }
            }
        });
    }
    commands_1.$Gr.registerCommand({
        id: exports.$GHb,
        handler: async (accessor) => {
            await openExplorerAndCreate(accessor, false);
        }
    });
    commands_1.$Gr.registerCommand({
        id: exports.$IHb,
        handler: async (accessor) => {
            await openExplorerAndCreate(accessor, true);
        }
    });
    const $6Hb = async (accessor) => {
        const explorerService = accessor.get(files_3.$xHb);
        const notificationService = accessor.get(notification_1.$Yu);
        const remoteAgentService = accessor.get(remoteAgentService_1.$jm);
        const pathService = accessor.get(pathService_1.$yJ);
        const configurationService = accessor.get(configuration_1.$8h);
        const stats = explorerService.getContext(false);
        const stat = stats.length > 0 ? stats[0] : undefined;
        if (!stat) {
            return;
        }
        const os = (await remoteAgentService.getEnvironment())?.os ?? platform_1.OS;
        await explorerService.setEditable(stat, {
            validationMessage: value => $3Hb(pathService, stat, value, os),
            onFinish: async (value, success) => {
                if (success) {
                    const parentResource = stat.parent.resource;
                    const targetResource = resources.$ig(parentResource, value);
                    if (stat.resource.toString() !== targetResource.toString()) {
                        try {
                            await explorerService.applyBulkEdit([new bulkEditService_1.$q1(stat.resource, targetResource)], {
                                confirmBeforeUndo: configurationService.getValue().explorer.confirmUndo === "verbose" /* UndoConfirmLevel.Verbose */,
                                undoLabel: nls.localize(63, null, stat.name, value),
                                progressLabel: nls.localize(64, null, stat.name, value),
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
    exports.$6Hb = $6Hb;
    const $7Hb = async (accessor) => {
        const explorerService = accessor.get(files_3.$xHb);
        const stats = explorerService.getContext(true).filter(s => !s.isRoot);
        if (stats.length) {
            await deleteFiles(accessor.get(files_3.$xHb), accessor.get(workingCopyFileService_1.$HD), accessor.get(dialogs_1.$oA), accessor.get(configuration_1.$8h), stats, true);
        }
    };
    exports.$7Hb = $7Hb;
    const $8Hb = async (accessor) => {
        const explorerService = accessor.get(files_3.$xHb);
        const stats = explorerService.getContext(true).filter(s => !s.isRoot);
        if (stats.length) {
            await deleteFiles(accessor.get(files_3.$xHb), accessor.get(workingCopyFileService_1.$HD), accessor.get(dialogs_1.$oA), accessor.get(configuration_1.$8h), stats, false);
        }
    };
    exports.$8Hb = $8Hb;
    let pasteShouldMove = false;
    const $9Hb = async (accessor) => {
        const explorerService = accessor.get(files_3.$xHb);
        const stats = explorerService.getContext(true);
        if (stats.length > 0) {
            await explorerService.setToCopy(stats, false);
            pasteShouldMove = false;
        }
    };
    exports.$9Hb = $9Hb;
    const $0Hb = async (accessor) => {
        const explorerService = accessor.get(files_3.$xHb);
        const stats = explorerService.getContext(true);
        if (stats.length > 0) {
            await explorerService.setToCopy(stats, true);
            pasteShouldMove = true;
        }
    };
    exports.$0Hb = $0Hb;
    const downloadFileHandler = async (accessor) => {
        const explorerService = accessor.get(files_3.$xHb);
        const notificationService = accessor.get(notification_1.$Yu);
        const instantiationService = accessor.get(instantiation_1.$Ah);
        const context = explorerService.getContext(true);
        const explorerItems = context.length ? context : explorerService.roots;
        const downloadHandler = instantiationService.createInstance(fileImportExport_1.$DHb);
        try {
            await downloadHandler.download(explorerItems);
        }
        catch (error) {
            notificationService.error(error);
            throw error;
        }
    };
    commands_1.$Gr.registerCommand({
        id: exports.$PHb,
        handler: downloadFileHandler
    });
    const uploadFileHandler = async (accessor) => {
        const explorerService = accessor.get(files_3.$xHb);
        const notificationService = accessor.get(notification_1.$Yu);
        const instantiationService = accessor.get(instantiation_1.$Ah);
        const context = explorerService.getContext(true);
        const element = context.length ? context[0] : explorerService.roots[0];
        try {
            const files = await (0, dom_1.$rP)();
            if (files) {
                const browserUpload = instantiationService.createInstance(fileImportExport_1.$BHb);
                await browserUpload.upload(element, files);
            }
        }
        catch (error) {
            notificationService.error(error);
            throw error;
        }
    };
    commands_1.$Gr.registerCommand({
        id: exports.$RHb,
        handler: uploadFileHandler
    });
    const $$Hb = async (accessor) => {
        const clipboardService = accessor.get(clipboardService_1.$UZ);
        const explorerService = accessor.get(files_3.$xHb);
        const fileService = accessor.get(files_2.$6j);
        const notificationService = accessor.get(notification_1.$Yu);
        const editorService = accessor.get(editorService_1.$9C);
        const configurationService = accessor.get(configuration_1.$8h);
        const uriIdentityService = accessor.get(uriIdentity_1.$Ck);
        const dialogService = accessor.get(dialogs_1.$oA);
        const context = explorerService.getContext(true);
        const toPaste = resources.$rg(await clipboardService.readResources(), r => r);
        const element = context.length ? context[0] : explorerService.roots[0];
        const incrementalNaming = configurationService.getValue().explorer.incrementalNaming;
        try {
            // Check if target is ancestor of pasted folder
            const sourceTargetPairs = (0, arrays_1.$Fb)(await Promise.all(toPaste.map(async (fileToPaste) => {
                if (element.resource.toString() !== fileToPaste.toString() && resources.$cg(element.resource, fileToPaste)) {
                    throw new Error(nls.localize(65, null));
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
                const targetFile = await $THb(explorerService, fileService, dialogService, target, { resource: fileToPaste, isDirectory: fileToPasteStat.isDirectory, allowOverwrite: pasteShouldMove || incrementalNaming === 'disabled' }, incrementalNaming);
                if (!targetFile) {
                    return undefined;
                }
                return { source: fileToPaste, target: targetFile };
            })));
            if (sourceTargetPairs.length >= 1) {
                // Move/Copy File
                if (pasteShouldMove) {
                    const resourceFileEdits = sourceTargetPairs.map(pair => new bulkEditService_1.$q1(pair.source, pair.target, { overwrite: incrementalNaming === 'disabled' }));
                    const options = {
                        confirmBeforeUndo: configurationService.getValue().explorer.confirmUndo === "verbose" /* UndoConfirmLevel.Verbose */,
                        progressLabel: sourceTargetPairs.length > 1 ? nls.localize(66, null, sourceTargetPairs.length)
                            : nls.localize(67, null, resources.$eg(sourceTargetPairs[0].target)),
                        undoLabel: sourceTargetPairs.length > 1 ? nls.localize(68, null, sourceTargetPairs.length)
                            : nls.localize(69, null, resources.$eg(sourceTargetPairs[0].target))
                    };
                    await explorerService.applyBulkEdit(resourceFileEdits, options);
                }
                else {
                    const resourceFileEdits = sourceTargetPairs.map(pair => new bulkEditService_1.$q1(pair.source, pair.target, { copy: true, overwrite: incrementalNaming === 'disabled' }));
                    const undoLevel = configurationService.getValue().explorer.confirmUndo;
                    const options = {
                        confirmBeforeUndo: undoLevel === "default" /* UndoConfirmLevel.Default */ || undoLevel === "verbose" /* UndoConfirmLevel.Verbose */,
                        progressLabel: sourceTargetPairs.length > 1 ? nls.localize(70, null, sourceTargetPairs.length)
                            : nls.localize(71, null, resources.$eg(sourceTargetPairs[0].target)),
                        undoLabel: sourceTargetPairs.length > 1 ? nls.localize(72, null, sourceTargetPairs.length)
                            : nls.localize(73, null, resources.$eg(sourceTargetPairs[0].target))
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
            onError(notificationService, new Error(nls.localize(74, null, (0, errors_1.$8)(e))));
        }
        finally {
            if (pasteShouldMove) {
                // Cut is done. Make sure to clear cut state.
                await explorerService.setToCopy([], false);
                pasteShouldMove = false;
            }
        }
    };
    exports.$$Hb = $$Hb;
    const $_Hb = async (accessor) => {
        const editorService = accessor.get(editorService_1.$9C);
        const explorerService = accessor.get(files_3.$xHb);
        const stats = explorerService.getContext(true);
        await editorService.openEditors(stats.filter(s => !s.isDirectory).map(s => ({
            resource: s.resource,
            options: { preserveFocus: true }
        })));
    };
    exports.$_Hb = $_Hb;
    class BaseSetActiveEditorReadonlyInSession extends actions_2.$Wu {
        constructor(id, title, a) {
            super({
                id,
                title,
                f1: true,
                category: actionCommonCategories_1.$Nl.File,
                precondition: contextkeys_1.$8cb
            });
            this.a = a;
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            const filesConfigurationService = accessor.get(filesConfigurationService_1.$yD);
            const fileResource = editor_1.$3E.getOriginalUri(editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            if (!fileResource) {
                return;
            }
            await filesConfigurationService.updateReadonly(fileResource, this.a);
        }
    }
    class $aIb extends BaseSetActiveEditorReadonlyInSession {
        static { this.ID = 'workbench.action.files.setActiveEditorReadonlyInSession'; }
        static { this.LABEL = nls.localize(75, null); }
        constructor() {
            super($aIb.ID, { value: $aIb.LABEL, original: 'Set Active Editor Readonly in Session' }, true);
        }
    }
    exports.$aIb = $aIb;
    class $bIb extends BaseSetActiveEditorReadonlyInSession {
        static { this.ID = 'workbench.action.files.setActiveEditorWriteableInSession'; }
        static { this.LABEL = nls.localize(76, null); }
        constructor() {
            super($bIb.ID, { value: $bIb.LABEL, original: 'Set Active Editor Writeable in Session' }, false);
        }
    }
    exports.$bIb = $bIb;
    class $cIb extends BaseSetActiveEditorReadonlyInSession {
        static { this.ID = 'workbench.action.files.toggleActiveEditorReadonlyInSession'; }
        static { this.LABEL = nls.localize(77, null); }
        constructor() {
            super($cIb.ID, { value: $cIb.LABEL, original: 'Toggle Active Editor Readonly in Session' }, 'toggle');
        }
    }
    exports.$cIb = $cIb;
    class $dIb extends BaseSetActiveEditorReadonlyInSession {
        static { this.ID = 'workbench.action.files.resetActiveEditorReadonlyInSession'; }
        static { this.LABEL = nls.localize(78, null); }
        constructor() {
            super($dIb.ID, { value: $dIb.LABEL, original: 'Reset Active Editor Readonly in Session' }, 'reset');
        }
    }
    exports.$dIb = $dIb;
});
//# sourceMappingURL=fileActions.js.map