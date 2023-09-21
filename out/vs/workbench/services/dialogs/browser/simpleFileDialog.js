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
define(["require", "exports", "vs/nls", "vs/base/common/resources", "vs/base/common/objects", "vs/platform/files/common/files", "vs/platform/quickinput/common/quickInput", "vs/base/common/uri", "vs/base/common/platform", "vs/platform/dialogs/common/dialogs", "vs/platform/label/common/label", "vs/platform/workspace/common/workspace", "vs/platform/notification/common/notification", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/editor/common/services/getIconClasses", "vs/base/common/network", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/remote/common/remoteAgentService", "vs/platform/contextkey/common/contextkey", "vs/base/common/strings", "vs/platform/keybinding/common/keybinding", "vs/base/common/extpath", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/async", "vs/workbench/services/editor/common/editorService", "vs/base/common/labels", "vs/workbench/services/path/common/pathService", "vs/platform/accessibility/common/accessibility"], function (require, exports, nls, resources, objects, files_1, quickInput_1, uri_1, platform_1, dialogs_1, label_1, workspace_1, notification_1, model_1, language_1, getIconClasses_1, network_1, environmentService_1, remoteAgentService_1, contextkey_1, strings_1, keybinding_1, extpath_1, event_1, lifecycle_1, async_1, editorService_1, labels_1, pathService_1, accessibility_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SimpleFileDialog = exports.RemoteFileDialogContext = exports.OpenLocalFileFolderCommand = exports.OpenLocalFolderCommand = exports.SaveLocalFileCommand = exports.OpenLocalFileCommand = void 0;
    var OpenLocalFileCommand;
    (function (OpenLocalFileCommand) {
        OpenLocalFileCommand.ID = 'workbench.action.files.openLocalFile';
        OpenLocalFileCommand.LABEL = nls.localize('openLocalFile', "Open Local File...");
        function handler() {
            return accessor => {
                const dialogService = accessor.get(dialogs_1.IFileDialogService);
                return dialogService.pickFileAndOpen({ forceNewWindow: false, availableFileSystems: [network_1.Schemas.file] });
            };
        }
        OpenLocalFileCommand.handler = handler;
    })(OpenLocalFileCommand || (exports.OpenLocalFileCommand = OpenLocalFileCommand = {}));
    var SaveLocalFileCommand;
    (function (SaveLocalFileCommand) {
        SaveLocalFileCommand.ID = 'workbench.action.files.saveLocalFile';
        SaveLocalFileCommand.LABEL = nls.localize('saveLocalFile', "Save Local File...");
        function handler() {
            return accessor => {
                const editorService = accessor.get(editorService_1.IEditorService);
                const activeEditorPane = editorService.activeEditorPane;
                if (activeEditorPane) {
                    return editorService.save({ groupId: activeEditorPane.group.id, editor: activeEditorPane.input }, { saveAs: true, availableFileSystems: [network_1.Schemas.file], reason: 1 /* SaveReason.EXPLICIT */ });
                }
                return Promise.resolve(undefined);
            };
        }
        SaveLocalFileCommand.handler = handler;
    })(SaveLocalFileCommand || (exports.SaveLocalFileCommand = SaveLocalFileCommand = {}));
    var OpenLocalFolderCommand;
    (function (OpenLocalFolderCommand) {
        OpenLocalFolderCommand.ID = 'workbench.action.files.openLocalFolder';
        OpenLocalFolderCommand.LABEL = nls.localize('openLocalFolder', "Open Local Folder...");
        function handler() {
            return accessor => {
                const dialogService = accessor.get(dialogs_1.IFileDialogService);
                return dialogService.pickFolderAndOpen({ forceNewWindow: false, availableFileSystems: [network_1.Schemas.file] });
            };
        }
        OpenLocalFolderCommand.handler = handler;
    })(OpenLocalFolderCommand || (exports.OpenLocalFolderCommand = OpenLocalFolderCommand = {}));
    var OpenLocalFileFolderCommand;
    (function (OpenLocalFileFolderCommand) {
        OpenLocalFileFolderCommand.ID = 'workbench.action.files.openLocalFileFolder';
        OpenLocalFileFolderCommand.LABEL = nls.localize('openLocalFileFolder', "Open Local...");
        function handler() {
            return accessor => {
                const dialogService = accessor.get(dialogs_1.IFileDialogService);
                return dialogService.pickFileFolderAndOpen({ forceNewWindow: false, availableFileSystems: [network_1.Schemas.file] });
            };
        }
        OpenLocalFileFolderCommand.handler = handler;
    })(OpenLocalFileFolderCommand || (exports.OpenLocalFileFolderCommand = OpenLocalFileFolderCommand = {}));
    var UpdateResult;
    (function (UpdateResult) {
        UpdateResult[UpdateResult["Updated"] = 0] = "Updated";
        UpdateResult[UpdateResult["UpdatedWithTrailing"] = 1] = "UpdatedWithTrailing";
        UpdateResult[UpdateResult["Updating"] = 2] = "Updating";
        UpdateResult[UpdateResult["NotUpdated"] = 3] = "NotUpdated";
        UpdateResult[UpdateResult["InvalidPath"] = 4] = "InvalidPath";
    })(UpdateResult || (UpdateResult = {}));
    exports.RemoteFileDialogContext = new contextkey_1.RawContextKey('remoteFileDialogVisible', false);
    let SimpleFileDialog = class SimpleFileDialog {
        constructor(fileService, quickInputService, labelService, workspaceContextService, notificationService, fileDialogService, modelService, languageService, environmentService, remoteAgentService, pathService, keybindingService, contextKeyService, accessibilityService) {
            this.fileService = fileService;
            this.quickInputService = quickInputService;
            this.labelService = labelService;
            this.workspaceContextService = workspaceContextService;
            this.notificationService = notificationService;
            this.fileDialogService = fileDialogService;
            this.modelService = modelService;
            this.languageService = languageService;
            this.environmentService = environmentService;
            this.remoteAgentService = remoteAgentService;
            this.pathService = pathService;
            this.keybindingService = keybindingService;
            this.accessibilityService = accessibilityService;
            this.hidden = false;
            this.allowFileSelection = true;
            this.allowFolderSelection = false;
            this.requiresTrailing = false;
            this.userEnteredPathSegment = '';
            this.autoCompletePathSegment = '';
            this.isWindows = false;
            this.separator = '/';
            this.onBusyChangeEmitter = new event_1.Emitter();
            this.disposables = [
                this.onBusyChangeEmitter
            ];
            this.remoteAuthority = this.environmentService.remoteAuthority;
            this.contextKey = exports.RemoteFileDialogContext.bindTo(contextKeyService);
            this.scheme = this.pathService.defaultUriScheme;
        }
        set busy(busy) {
            if (this.filePickBox.busy !== busy) {
                this.filePickBox.busy = busy;
                this.onBusyChangeEmitter.fire(busy);
            }
        }
        get busy() {
            return this.filePickBox.busy;
        }
        async showOpenDialog(options = {}) {
            this.scheme = this.getScheme(options.availableFileSystems, options.defaultUri);
            this.userHome = await this.getUserHome();
            this.trueHome = await this.getUserHome(true);
            const newOptions = this.getOptions(options);
            if (!newOptions) {
                return Promise.resolve(undefined);
            }
            this.options = newOptions;
            return this.pickResource();
        }
        async showSaveDialog(options) {
            this.scheme = this.getScheme(options.availableFileSystems, options.defaultUri);
            this.userHome = await this.getUserHome();
            this.trueHome = await this.getUserHome(true);
            this.requiresTrailing = true;
            const newOptions = this.getOptions(options, true);
            if (!newOptions) {
                return Promise.resolve(undefined);
            }
            this.options = newOptions;
            this.options.canSelectFolders = true;
            this.options.canSelectFiles = true;
            return new Promise((resolve) => {
                this.pickResource(true).then(folderUri => {
                    resolve(folderUri);
                });
            });
        }
        getOptions(options, isSave = false) {
            let defaultUri = undefined;
            let filename = undefined;
            if (options.defaultUri) {
                defaultUri = (this.scheme === options.defaultUri.scheme) ? options.defaultUri : undefined;
                filename = isSave ? resources.basename(options.defaultUri) : undefined;
            }
            if (!defaultUri) {
                defaultUri = this.userHome;
                if (filename) {
                    defaultUri = resources.joinPath(defaultUri, filename);
                }
            }
            if ((this.scheme !== network_1.Schemas.file) && !this.fileService.hasProvider(defaultUri)) {
                this.notificationService.info(nls.localize('remoteFileDialog.notConnectedToRemote', 'File system provider for {0} is not available.', defaultUri.toString()));
                return undefined;
            }
            const newOptions = objects.deepClone(options);
            newOptions.defaultUri = defaultUri;
            return newOptions;
        }
        remoteUriFrom(path, hintUri) {
            if (!path.startsWith('\\\\')) {
                path = path.replace(/\\/g, '/');
            }
            const uri = this.scheme === network_1.Schemas.file ? uri_1.URI.file(path) : uri_1.URI.from({ scheme: this.scheme, path, query: hintUri?.query, fragment: hintUri?.fragment });
            // If the default scheme is file, then we don't care about the remote authority or the hint authority
            const authority = (uri.scheme === network_1.Schemas.file) ? undefined : (this.remoteAuthority ?? hintUri?.authority);
            return resources.toLocalResource(uri, authority, 
            // If there is a remote authority, then we should use the system's default URI as the local scheme.
            // If there is *no* remote authority, then we should use the default scheme for this dialog as that is already local.
            authority ? this.pathService.defaultUriScheme : uri.scheme);
        }
        getScheme(available, defaultUri) {
            if (available && available.length > 0) {
                if (defaultUri && (available.indexOf(defaultUri.scheme) >= 0)) {
                    return defaultUri.scheme;
                }
                return available[0];
            }
            else if (defaultUri) {
                return defaultUri.scheme;
            }
            return network_1.Schemas.file;
        }
        async getRemoteAgentEnvironment() {
            if (this.remoteAgentEnvironment === undefined) {
                this.remoteAgentEnvironment = await this.remoteAgentService.getEnvironment();
            }
            return this.remoteAgentEnvironment;
        }
        getUserHome(trueHome = false) {
            return trueHome
                ? this.pathService.userHome({ preferLocal: this.scheme === network_1.Schemas.file })
                : this.fileDialogService.preferredHome(this.scheme);
        }
        async pickResource(isSave = false) {
            this.allowFolderSelection = !!this.options.canSelectFolders;
            this.allowFileSelection = !!this.options.canSelectFiles;
            this.separator = this.labelService.getSeparator(this.scheme, this.remoteAuthority);
            this.hidden = false;
            this.isWindows = await this.checkIsWindowsOS();
            let homedir = this.options.defaultUri ? this.options.defaultUri : this.workspaceContextService.getWorkspace().folders[0].uri;
            let stat;
            const ext = resources.extname(homedir);
            if (this.options.defaultUri) {
                try {
                    stat = await this.fileService.stat(this.options.defaultUri);
                }
                catch (e) {
                    // The file or folder doesn't exist
                }
                if (!stat || !stat.isDirectory) {
                    homedir = resources.dirname(this.options.defaultUri);
                    this.trailing = resources.basename(this.options.defaultUri);
                }
            }
            return new Promise((resolve) => {
                this.filePickBox = this.quickInputService.createQuickPick();
                this.busy = true;
                this.filePickBox.matchOnLabel = false;
                this.filePickBox.sortByLabel = false;
                this.filePickBox.autoFocusOnList = false;
                this.filePickBox.ignoreFocusOut = true;
                this.filePickBox.ok = true;
                if ((this.scheme !== network_1.Schemas.file) && this.options && this.options.availableFileSystems && (this.options.availableFileSystems.length > 1) && (this.options.availableFileSystems.indexOf(network_1.Schemas.file) > -1)) {
                    this.filePickBox.customButton = true;
                    this.filePickBox.customLabel = nls.localize('remoteFileDialog.local', 'Show Local');
                    let action;
                    if (isSave) {
                        action = SaveLocalFileCommand;
                    }
                    else {
                        action = this.allowFileSelection ? (this.allowFolderSelection ? OpenLocalFileFolderCommand : OpenLocalFileCommand) : OpenLocalFolderCommand;
                    }
                    const keybinding = this.keybindingService.lookupKeybinding(action.ID);
                    if (keybinding) {
                        const label = keybinding.getLabel();
                        if (label) {
                            this.filePickBox.customHover = (0, strings_1.format)('{0} ({1})', action.LABEL, label);
                        }
                    }
                }
                let isResolving = 0;
                let isAcceptHandled = false;
                this.currentFolder = resources.dirname(homedir);
                this.userEnteredPathSegment = '';
                this.autoCompletePathSegment = '';
                this.filePickBox.title = this.options.title;
                this.filePickBox.value = this.pathFromUri(this.currentFolder, true);
                this.filePickBox.valueSelection = [this.filePickBox.value.length, this.filePickBox.value.length];
                this.filePickBox.items = [];
                function doResolve(dialog, uri) {
                    if (uri) {
                        uri = resources.addTrailingPathSeparator(uri, dialog.separator); // Ensures that c: is c:/ since this comes from user input and can be incorrect.
                        // To be consistent, we should never have a trailing path separator on directories (or anything else). Will not remove from c:/.
                        uri = resources.removeTrailingPathSeparator(uri);
                    }
                    resolve(uri);
                    dialog.contextKey.set(false);
                    dialog.filePickBox.dispose();
                    (0, lifecycle_1.dispose)(dialog.disposables);
                }
                this.filePickBox.onDidCustom(() => {
                    if (isAcceptHandled || this.busy) {
                        return;
                    }
                    isAcceptHandled = true;
                    isResolving++;
                    if (this.options.availableFileSystems && (this.options.availableFileSystems.length > 1)) {
                        this.options.availableFileSystems = this.options.availableFileSystems.slice(1);
                    }
                    this.filePickBox.hide();
                    if (isSave) {
                        return this.fileDialogService.showSaveDialog(this.options).then(result => {
                            doResolve(this, result);
                        });
                    }
                    else {
                        return this.fileDialogService.showOpenDialog(this.options).then(result => {
                            doResolve(this, result ? result[0] : undefined);
                        });
                    }
                });
                function handleAccept(dialog) {
                    if (dialog.busy) {
                        // Save the accept until the file picker is not busy.
                        dialog.onBusyChangeEmitter.event((busy) => {
                            if (!busy) {
                                handleAccept(dialog);
                            }
                        });
                        return;
                    }
                    else if (isAcceptHandled) {
                        return;
                    }
                    isAcceptHandled = true;
                    isResolving++;
                    dialog.onDidAccept().then(resolveValue => {
                        if (resolveValue) {
                            dialog.filePickBox.hide();
                            doResolve(dialog, resolveValue);
                        }
                        else if (dialog.hidden) {
                            doResolve(dialog, undefined);
                        }
                        else {
                            isResolving--;
                            isAcceptHandled = false;
                        }
                    });
                }
                this.filePickBox.onDidAccept(_ => {
                    handleAccept(this);
                });
                this.filePickBox.onDidChangeActive(i => {
                    isAcceptHandled = false;
                    // update input box to match the first selected item
                    if ((i.length === 1) && this.isSelectionChangeFromUser()) {
                        this.filePickBox.validationMessage = undefined;
                        const userPath = this.constructFullUserPath();
                        if (!(0, strings_1.equalsIgnoreCase)(this.filePickBox.value.substring(0, userPath.length), userPath)) {
                            this.filePickBox.valueSelection = [0, this.filePickBox.value.length];
                            this.insertText(userPath, userPath);
                        }
                        this.setAutoComplete(userPath, this.userEnteredPathSegment, i[0], true);
                    }
                });
                this.filePickBox.onDidChangeValue(async (value) => {
                    return this.handleValueChange(value);
                });
                this.filePickBox.onDidHide(() => {
                    this.hidden = true;
                    if (isResolving === 0) {
                        doResolve(this, undefined);
                    }
                });
                this.filePickBox.show();
                this.contextKey.set(true);
                this.updateItems(homedir, true, this.trailing).then(() => {
                    if (this.trailing) {
                        this.filePickBox.valueSelection = [this.filePickBox.value.length - this.trailing.length, this.filePickBox.value.length - ext.length];
                    }
                    else {
                        this.filePickBox.valueSelection = [this.filePickBox.value.length, this.filePickBox.value.length];
                    }
                    this.busy = false;
                });
            });
        }
        async handleValueChange(value) {
            try {
                // onDidChangeValue can also be triggered by the auto complete, so if it looks like the auto complete, don't do anything
                if (this.isValueChangeFromUser()) {
                    // If the user has just entered more bad path, don't change anything
                    if (!(0, strings_1.equalsIgnoreCase)(value, this.constructFullUserPath()) && !this.isBadSubpath(value)) {
                        this.filePickBox.validationMessage = undefined;
                        const filePickBoxUri = this.filePickBoxValue();
                        let updated = UpdateResult.NotUpdated;
                        if (!resources.extUriIgnorePathCase.isEqual(this.currentFolder, filePickBoxUri)) {
                            updated = await this.tryUpdateItems(value, filePickBoxUri);
                        }
                        if ((updated === UpdateResult.NotUpdated) || (updated === UpdateResult.UpdatedWithTrailing)) {
                            this.setActiveItems(value);
                        }
                    }
                    else {
                        this.filePickBox.activeItems = [];
                        this.userEnteredPathSegment = '';
                    }
                }
            }
            catch {
                // Since any text can be entered in the input box, there is potential for error causing input. If this happens, do nothing.
            }
        }
        isBadSubpath(value) {
            return this.badPath && (value.length > this.badPath.length) && (0, strings_1.equalsIgnoreCase)(value.substring(0, this.badPath.length), this.badPath);
        }
        isValueChangeFromUser() {
            if ((0, strings_1.equalsIgnoreCase)(this.filePickBox.value, this.pathAppend(this.currentFolder, this.userEnteredPathSegment + this.autoCompletePathSegment))) {
                return false;
            }
            return true;
        }
        isSelectionChangeFromUser() {
            if (this.activeItem === (this.filePickBox.activeItems ? this.filePickBox.activeItems[0] : undefined)) {
                return false;
            }
            return true;
        }
        constructFullUserPath() {
            const currentFolderPath = this.pathFromUri(this.currentFolder);
            if ((0, strings_1.equalsIgnoreCase)(this.filePickBox.value.substr(0, this.userEnteredPathSegment.length), this.userEnteredPathSegment)) {
                if ((0, strings_1.equalsIgnoreCase)(this.filePickBox.value.substr(0, currentFolderPath.length), currentFolderPath)) {
                    return currentFolderPath;
                }
                else {
                    return this.userEnteredPathSegment;
                }
            }
            else {
                return this.pathAppend(this.currentFolder, this.userEnteredPathSegment);
            }
        }
        filePickBoxValue() {
            // The file pick box can't render everything, so we use the current folder to create the uri so that it is an existing path.
            const directUri = this.remoteUriFrom(this.filePickBox.value.trimRight(), this.currentFolder);
            const currentPath = this.pathFromUri(this.currentFolder);
            if ((0, strings_1.equalsIgnoreCase)(this.filePickBox.value, currentPath)) {
                return this.currentFolder;
            }
            const currentDisplayUri = this.remoteUriFrom(currentPath, this.currentFolder);
            const relativePath = resources.relativePath(currentDisplayUri, directUri);
            const isSameRoot = (this.filePickBox.value.length > 1 && currentPath.length > 1) ? (0, strings_1.equalsIgnoreCase)(this.filePickBox.value.substr(0, 2), currentPath.substr(0, 2)) : false;
            if (relativePath && isSameRoot) {
                let path = resources.joinPath(this.currentFolder, relativePath);
                const directBasename = resources.basename(directUri);
                if ((directBasename === '.') || (directBasename === '..')) {
                    path = this.remoteUriFrom(this.pathAppend(path, directBasename), this.currentFolder);
                }
                return resources.hasTrailingPathSeparator(directUri) ? resources.addTrailingPathSeparator(path) : path;
            }
            else {
                return directUri;
            }
        }
        async onDidAccept() {
            this.busy = true;
            if (this.filePickBox.activeItems.length === 1) {
                const item = this.filePickBox.selectedItems[0];
                if (item.isFolder) {
                    if (this.trailing) {
                        await this.updateItems(item.uri, true, this.trailing);
                    }
                    else {
                        // When possible, cause the update to happen by modifying the input box.
                        // This allows all input box updates to happen first, and uses the same code path as the user typing.
                        const newPath = this.pathFromUri(item.uri);
                        if ((0, strings_1.startsWithIgnoreCase)(newPath, this.filePickBox.value) && ((0, strings_1.equalsIgnoreCase)(item.label, resources.basename(item.uri)))) {
                            this.filePickBox.valueSelection = [this.pathFromUri(this.currentFolder).length, this.filePickBox.value.length];
                            this.insertText(newPath, this.basenameWithTrailingSlash(item.uri));
                        }
                        else if ((item.label === '..') && (0, strings_1.startsWithIgnoreCase)(this.filePickBox.value, newPath)) {
                            this.filePickBox.valueSelection = [newPath.length, this.filePickBox.value.length];
                            this.insertText(newPath, '');
                        }
                        else {
                            await this.updateItems(item.uri, true);
                        }
                    }
                    this.filePickBox.busy = false;
                    return;
                }
            }
            else {
                // If the items have updated, don't try to resolve
                if ((await this.tryUpdateItems(this.filePickBox.value, this.filePickBoxValue())) !== UpdateResult.NotUpdated) {
                    this.filePickBox.busy = false;
                    return;
                }
            }
            let resolveValue;
            // Find resolve value
            if (this.filePickBox.activeItems.length === 0) {
                resolveValue = this.filePickBoxValue();
            }
            else if (this.filePickBox.activeItems.length === 1) {
                resolveValue = this.filePickBox.selectedItems[0].uri;
            }
            if (resolveValue) {
                resolveValue = this.addPostfix(resolveValue);
            }
            if (await this.validate(resolveValue)) {
                this.busy = false;
                return resolveValue;
            }
            this.busy = false;
            return undefined;
        }
        root(value) {
            let lastDir = value;
            let dir = resources.dirname(value);
            while (!resources.isEqual(lastDir, dir)) {
                lastDir = dir;
                dir = resources.dirname(dir);
            }
            return dir;
        }
        tildaReplace(value) {
            const home = this.trueHome;
            if ((value.length > 0) && (value[0] === '~')) {
                return resources.joinPath(home, value.substring(1));
            }
            return this.remoteUriFrom(value);
        }
        tryAddTrailingSeparatorToDirectory(uri, stat) {
            if (stat.isDirectory) {
                // At this point we know it's a directory and can add the trailing path separator
                if (!this.endsWithSlash(uri.path)) {
                    return resources.addTrailingPathSeparator(uri);
                }
            }
            return uri;
        }
        async tryUpdateItems(value, valueUri) {
            if ((value.length > 0) && (value[0] === '~')) {
                const newDir = this.tildaReplace(value);
                return await this.updateItems(newDir, true) ? UpdateResult.UpdatedWithTrailing : UpdateResult.Updated;
            }
            else if (value === '\\') {
                valueUri = this.root(this.currentFolder);
                value = this.pathFromUri(valueUri);
                return await this.updateItems(valueUri, true) ? UpdateResult.UpdatedWithTrailing : UpdateResult.Updated;
            }
            else if (!resources.extUriIgnorePathCase.isEqual(this.currentFolder, valueUri) && (this.endsWithSlash(value) || (!resources.extUriIgnorePathCase.isEqual(this.currentFolder, resources.dirname(valueUri)) && resources.extUriIgnorePathCase.isEqualOrParent(this.currentFolder, resources.dirname(valueUri))))) {
                let stat;
                try {
                    stat = await this.fileService.stat(valueUri);
                }
                catch (e) {
                    // do nothing
                }
                if (stat && stat.isDirectory && (resources.basename(valueUri) !== '.') && this.endsWithSlash(value)) {
                    valueUri = this.tryAddTrailingSeparatorToDirectory(valueUri, stat);
                    return await this.updateItems(valueUri) ? UpdateResult.UpdatedWithTrailing : UpdateResult.Updated;
                }
                else if (this.endsWithSlash(value)) {
                    // The input box contains a path that doesn't exist on the system.
                    this.filePickBox.validationMessage = nls.localize('remoteFileDialog.badPath', 'The path does not exist.');
                    // Save this bad path. It can take too long to a stat on every user entered character, but once a user enters a bad path they are likely
                    // to keep typing more bad path. We can compare against this bad path and see if the user entered path starts with it.
                    this.badPath = value;
                    return UpdateResult.InvalidPath;
                }
                else {
                    let inputUriDirname = resources.dirname(valueUri);
                    const currentFolderWithoutSep = resources.removeTrailingPathSeparator(resources.addTrailingPathSeparator(this.currentFolder));
                    const inputUriDirnameWithoutSep = resources.removeTrailingPathSeparator(resources.addTrailingPathSeparator(inputUriDirname));
                    if (!resources.extUriIgnorePathCase.isEqual(currentFolderWithoutSep, inputUriDirnameWithoutSep)
                        && (!/^[a-zA-Z]:$/.test(this.filePickBox.value)
                            || !(0, strings_1.equalsIgnoreCase)(this.pathFromUri(this.currentFolder).substring(0, this.filePickBox.value.length), this.filePickBox.value))) {
                        let statWithoutTrailing;
                        try {
                            statWithoutTrailing = await this.fileService.stat(inputUriDirname);
                        }
                        catch (e) {
                            // do nothing
                        }
                        if (statWithoutTrailing && statWithoutTrailing.isDirectory) {
                            this.badPath = undefined;
                            inputUriDirname = this.tryAddTrailingSeparatorToDirectory(inputUriDirname, statWithoutTrailing);
                            return await this.updateItems(inputUriDirname, false, resources.basename(valueUri)) ? UpdateResult.UpdatedWithTrailing : UpdateResult.Updated;
                        }
                    }
                }
            }
            this.badPath = undefined;
            return UpdateResult.NotUpdated;
        }
        tryUpdateTrailing(value) {
            const ext = resources.extname(value);
            if (this.trailing && ext) {
                this.trailing = resources.basename(value);
            }
        }
        setActiveItems(value) {
            value = this.pathFromUri(this.tildaReplace(value));
            const asUri = this.remoteUriFrom(value);
            const inputBasename = resources.basename(asUri);
            const userPath = this.constructFullUserPath();
            // Make sure that the folder whose children we are currently viewing matches the path in the input
            const pathsEqual = (0, strings_1.equalsIgnoreCase)(userPath, value.substring(0, userPath.length)) ||
                (0, strings_1.equalsIgnoreCase)(value, userPath.substring(0, value.length));
            if (pathsEqual) {
                let hasMatch = false;
                for (let i = 0; i < this.filePickBox.items.length; i++) {
                    const item = this.filePickBox.items[i];
                    if (this.setAutoComplete(value, inputBasename, item)) {
                        hasMatch = true;
                        break;
                    }
                }
                if (!hasMatch) {
                    const userBasename = inputBasename.length >= 2 ? userPath.substring(userPath.length - inputBasename.length + 2) : '';
                    this.userEnteredPathSegment = (userBasename === inputBasename) ? inputBasename : '';
                    this.autoCompletePathSegment = '';
                    this.filePickBox.activeItems = [];
                    this.tryUpdateTrailing(asUri);
                }
            }
            else {
                this.userEnteredPathSegment = inputBasename;
                this.autoCompletePathSegment = '';
                this.filePickBox.activeItems = [];
                this.tryUpdateTrailing(asUri);
            }
        }
        setAutoComplete(startingValue, startingBasename, quickPickItem, force = false) {
            if (this.busy) {
                // We're in the middle of something else. Doing an auto complete now can result jumbled or incorrect autocompletes.
                this.userEnteredPathSegment = startingBasename;
                this.autoCompletePathSegment = '';
                return false;
            }
            const itemBasename = quickPickItem.label;
            // Either force the autocomplete, or the old value should be one smaller than the new value and match the new value.
            if (itemBasename === '..') {
                // Don't match on the up directory item ever.
                this.userEnteredPathSegment = '';
                this.autoCompletePathSegment = '';
                this.activeItem = quickPickItem;
                if (force) {
                    // clear any selected text
                    document.execCommand('insertText', false, '');
                }
                return false;
            }
            else if (!force && (itemBasename.length >= startingBasename.length) && (0, strings_1.equalsIgnoreCase)(itemBasename.substr(0, startingBasename.length), startingBasename)) {
                this.userEnteredPathSegment = startingBasename;
                this.activeItem = quickPickItem;
                // Changing the active items will trigger the onDidActiveItemsChanged. Clear the autocomplete first, then set it after.
                this.autoCompletePathSegment = '';
                if (quickPickItem.isFolder || !this.trailing) {
                    this.filePickBox.activeItems = [quickPickItem];
                }
                else {
                    this.filePickBox.activeItems = [];
                }
                return true;
            }
            else if (force && (!(0, strings_1.equalsIgnoreCase)(this.basenameWithTrailingSlash(quickPickItem.uri), (this.userEnteredPathSegment + this.autoCompletePathSegment)))) {
                this.userEnteredPathSegment = '';
                if (!this.accessibilityService.isScreenReaderOptimized()) {
                    this.autoCompletePathSegment = this.trimTrailingSlash(itemBasename);
                }
                this.activeItem = quickPickItem;
                if (!this.accessibilityService.isScreenReaderOptimized()) {
                    this.filePickBox.valueSelection = [this.pathFromUri(this.currentFolder, true).length, this.filePickBox.value.length];
                    // use insert text to preserve undo buffer
                    this.insertText(this.pathAppend(this.currentFolder, this.autoCompletePathSegment), this.autoCompletePathSegment);
                    this.filePickBox.valueSelection = [this.filePickBox.value.length - this.autoCompletePathSegment.length, this.filePickBox.value.length];
                }
                return true;
            }
            else {
                this.userEnteredPathSegment = startingBasename;
                this.autoCompletePathSegment = '';
                return false;
            }
        }
        insertText(wholeValue, insertText) {
            if (this.filePickBox.inputHasFocus()) {
                document.execCommand('insertText', false, insertText);
                if (this.filePickBox.value !== wholeValue) {
                    this.filePickBox.value = wholeValue;
                    this.handleValueChange(wholeValue);
                }
            }
            else {
                this.filePickBox.value = wholeValue;
                this.handleValueChange(wholeValue);
            }
        }
        addPostfix(uri) {
            let result = uri;
            if (this.requiresTrailing && this.options.filters && this.options.filters.length > 0 && !resources.hasTrailingPathSeparator(uri)) {
                // Make sure that the suffix is added. If the user deleted it, we automatically add it here
                let hasExt = false;
                const currentExt = resources.extname(uri).substr(1);
                for (let i = 0; i < this.options.filters.length; i++) {
                    for (let j = 0; j < this.options.filters[i].extensions.length; j++) {
                        if ((this.options.filters[i].extensions[j] === '*') || (this.options.filters[i].extensions[j] === currentExt)) {
                            hasExt = true;
                            break;
                        }
                    }
                    if (hasExt) {
                        break;
                    }
                }
                if (!hasExt) {
                    result = resources.joinPath(resources.dirname(uri), resources.basename(uri) + '.' + this.options.filters[0].extensions[0]);
                }
            }
            return result;
        }
        trimTrailingSlash(path) {
            return ((path.length > 1) && this.endsWithSlash(path)) ? path.substr(0, path.length - 1) : path;
        }
        yesNoPrompt(uri, message) {
            const prompt = this.quickInputService.createQuickPick();
            prompt.title = message;
            prompt.ignoreFocusOut = true;
            prompt.ok = true;
            prompt.customButton = true;
            prompt.customLabel = nls.localize('remoteFileDialog.cancel', 'Cancel');
            prompt.value = this.pathFromUri(uri);
            let isResolving = false;
            return new Promise(resolve => {
                prompt.onDidAccept(() => {
                    isResolving = true;
                    prompt.hide();
                    resolve(true);
                });
                prompt.onDidHide(() => {
                    if (!isResolving) {
                        resolve(false);
                    }
                    this.filePickBox.show();
                    this.hidden = false;
                    this.filePickBox.items = this.filePickBox.items;
                    prompt.dispose();
                });
                prompt.onDidChangeValue(() => {
                    prompt.hide();
                });
                prompt.onDidCustom(() => {
                    prompt.hide();
                });
                prompt.show();
            });
        }
        async validate(uri) {
            if (uri === undefined) {
                this.filePickBox.validationMessage = nls.localize('remoteFileDialog.invalidPath', 'Please enter a valid path.');
                return Promise.resolve(false);
            }
            let stat;
            let statDirname;
            try {
                statDirname = await this.fileService.stat(resources.dirname(uri));
                stat = await this.fileService.stat(uri);
            }
            catch (e) {
                // do nothing
            }
            if (this.requiresTrailing) { // save
                if (stat && stat.isDirectory) {
                    // Can't do this
                    this.filePickBox.validationMessage = nls.localize('remoteFileDialog.validateFolder', 'The folder already exists. Please use a new file name.');
                    return Promise.resolve(false);
                }
                else if (stat) {
                    // Replacing a file.
                    // Show a yes/no prompt
                    const message = nls.localize('remoteFileDialog.validateExisting', '{0} already exists. Are you sure you want to overwrite it?', resources.basename(uri));
                    return this.yesNoPrompt(uri, message);
                }
                else if (!((0, extpath_1.isValidBasename)(resources.basename(uri), this.isWindows))) {
                    // Filename not allowed
                    this.filePickBox.validationMessage = nls.localize('remoteFileDialog.validateBadFilename', 'Please enter a valid file name.');
                    return Promise.resolve(false);
                }
                else if (!statDirname) {
                    // Folder to save in doesn't exist
                    const message = nls.localize('remoteFileDialog.validateCreateDirectory', 'The folder {0} does not exist. Would you like to create it?', resources.basename(resources.dirname(uri)));
                    return this.yesNoPrompt(uri, message);
                }
                else if (!statDirname.isDirectory) {
                    this.filePickBox.validationMessage = nls.localize('remoteFileDialog.validateNonexistentDir', 'Please enter a path that exists.');
                    return Promise.resolve(false);
                }
            }
            else { // open
                if (!stat) {
                    // File or folder doesn't exist
                    this.filePickBox.validationMessage = nls.localize('remoteFileDialog.validateNonexistentDir', 'Please enter a path that exists.');
                    return Promise.resolve(false);
                }
                else if (uri.path === '/' && this.isWindows) {
                    this.filePickBox.validationMessage = nls.localize('remoteFileDialog.windowsDriveLetter', 'Please start the path with a drive letter.');
                    return Promise.resolve(false);
                }
                else if (stat.isDirectory && !this.allowFolderSelection) {
                    // Folder selected when folder selection not permitted
                    this.filePickBox.validationMessage = nls.localize('remoteFileDialog.validateFileOnly', 'Please select a file.');
                    return Promise.resolve(false);
                }
                else if (!stat.isDirectory && !this.allowFileSelection) {
                    // File selected when file selection not permitted
                    this.filePickBox.validationMessage = nls.localize('remoteFileDialog.validateFolderOnly', 'Please select a folder.');
                    return Promise.resolve(false);
                }
            }
            return Promise.resolve(true);
        }
        // Returns true if there is a file at the end of the URI.
        async updateItems(newFolder, force = false, trailing) {
            this.busy = true;
            this.autoCompletePathSegment = '';
            const isSave = !!trailing;
            let result = false;
            const updatingPromise = (0, async_1.createCancelablePromise)(async (token) => {
                let folderStat;
                try {
                    folderStat = await this.fileService.resolve(newFolder);
                    if (!folderStat.isDirectory) {
                        trailing = resources.basename(newFolder);
                        newFolder = resources.dirname(newFolder);
                        folderStat = undefined;
                        result = true;
                    }
                }
                catch (e) {
                    // The file/directory doesn't exist
                }
                const newValue = trailing ? this.pathAppend(newFolder, trailing) : this.pathFromUri(newFolder, true);
                this.currentFolder = this.endsWithSlash(newFolder.path) ? newFolder : resources.addTrailingPathSeparator(newFolder, this.separator);
                this.userEnteredPathSegment = trailing ? trailing : '';
                return this.createItems(folderStat, this.currentFolder, token).then(items => {
                    if (token.isCancellationRequested) {
                        this.busy = false;
                        return false;
                    }
                    this.filePickBox.items = items;
                    this.filePickBox.activeItems = [this.filePickBox.items[0]];
                    this.filePickBox.activeItems = [];
                    // the user might have continued typing while we were updating. Only update the input box if it doesn't match the directory.
                    if (!(0, strings_1.equalsIgnoreCase)(this.filePickBox.value, newValue) && force) {
                        this.filePickBox.valueSelection = [0, this.filePickBox.value.length];
                        this.insertText(newValue, newValue);
                    }
                    if (force && trailing && isSave) {
                        // Keep the cursor position in front of the save as name.
                        this.filePickBox.valueSelection = [this.filePickBox.value.length - trailing.length, this.filePickBox.value.length - trailing.length];
                    }
                    else if (!trailing) {
                        // If there is trailing, we don't move the cursor. If there is no trailing, cursor goes at the end.
                        this.filePickBox.valueSelection = [this.filePickBox.value.length, this.filePickBox.value.length];
                    }
                    this.busy = false;
                    this.updatingPromise = undefined;
                    return result;
                });
            });
            if (this.updatingPromise !== undefined) {
                this.updatingPromise.cancel();
            }
            this.updatingPromise = updatingPromise;
            return updatingPromise;
        }
        pathFromUri(uri, endWithSeparator = false) {
            let result = (0, labels_1.normalizeDriveLetter)(uri.fsPath, this.isWindows).replace(/\n/g, '');
            if (this.separator === '/') {
                result = result.replace(/\\/g, this.separator);
            }
            else {
                result = result.replace(/\//g, this.separator);
            }
            if (endWithSeparator && !this.endsWithSlash(result)) {
                result = result + this.separator;
            }
            return result;
        }
        pathAppend(uri, additional) {
            if ((additional === '..') || (additional === '.')) {
                const basePath = this.pathFromUri(uri, true);
                return basePath + additional;
            }
            else {
                return this.pathFromUri(resources.joinPath(uri, additional));
            }
        }
        async checkIsWindowsOS() {
            let isWindowsOS = platform_1.isWindows;
            const env = await this.getRemoteAgentEnvironment();
            if (env) {
                isWindowsOS = env.os === 1 /* OperatingSystem.Windows */;
            }
            return isWindowsOS;
        }
        endsWithSlash(s) {
            return /[\/\\]$/.test(s);
        }
        basenameWithTrailingSlash(fullPath) {
            const child = this.pathFromUri(fullPath, true);
            const parent = this.pathFromUri(resources.dirname(fullPath), true);
            return child.substring(parent.length);
        }
        async createBackItem(currFolder) {
            const fileRepresentationCurr = this.currentFolder.with({ scheme: network_1.Schemas.file, authority: '' });
            const fileRepresentationParent = resources.dirname(fileRepresentationCurr);
            if (!resources.isEqual(fileRepresentationCurr, fileRepresentationParent)) {
                const parentFolder = resources.dirname(currFolder);
                if (await this.fileService.exists(parentFolder)) {
                    return { label: '..', uri: resources.addTrailingPathSeparator(parentFolder, this.separator), isFolder: true };
                }
            }
            return undefined;
        }
        async createItems(folder, currentFolder, token) {
            const result = [];
            const backDir = await this.createBackItem(currentFolder);
            try {
                if (!folder) {
                    folder = await this.fileService.resolve(currentFolder);
                }
                const items = folder.children ? await Promise.all(folder.children.map(child => this.createItem(child, currentFolder, token))) : [];
                for (const item of items) {
                    if (item) {
                        result.push(item);
                    }
                }
            }
            catch (e) {
                // ignore
                console.log(e);
            }
            if (token.isCancellationRequested) {
                return [];
            }
            const sorted = result.sort((i1, i2) => {
                if (i1.isFolder !== i2.isFolder) {
                    return i1.isFolder ? -1 : 1;
                }
                const trimmed1 = this.endsWithSlash(i1.label) ? i1.label.substr(0, i1.label.length - 1) : i1.label;
                const trimmed2 = this.endsWithSlash(i2.label) ? i2.label.substr(0, i2.label.length - 1) : i2.label;
                return trimmed1.localeCompare(trimmed2);
            });
            if (backDir) {
                sorted.unshift(backDir);
            }
            return sorted;
        }
        filterFile(file) {
            if (this.options.filters) {
                for (let i = 0; i < this.options.filters.length; i++) {
                    for (let j = 0; j < this.options.filters[i].extensions.length; j++) {
                        const testExt = this.options.filters[i].extensions[j];
                        if ((testExt === '*') || (file.path.endsWith('.' + testExt))) {
                            return true;
                        }
                    }
                }
                return false;
            }
            return true;
        }
        async createItem(stat, parent, token) {
            if (token.isCancellationRequested) {
                return undefined;
            }
            let fullPath = resources.joinPath(parent, stat.name);
            if (stat.isDirectory) {
                const filename = resources.basename(fullPath);
                fullPath = resources.addTrailingPathSeparator(fullPath, this.separator);
                return { label: filename, uri: fullPath, isFolder: true, iconClasses: (0, getIconClasses_1.getIconClasses)(this.modelService, this.languageService, fullPath || undefined, files_1.FileKind.FOLDER) };
            }
            else if (!stat.isDirectory && this.allowFileSelection && this.filterFile(fullPath)) {
                return { label: stat.name, uri: fullPath, isFolder: false, iconClasses: (0, getIconClasses_1.getIconClasses)(this.modelService, this.languageService, fullPath || undefined) };
            }
            return undefined;
        }
    };
    exports.SimpleFileDialog = SimpleFileDialog;
    exports.SimpleFileDialog = SimpleFileDialog = __decorate([
        __param(0, files_1.IFileService),
        __param(1, quickInput_1.IQuickInputService),
        __param(2, label_1.ILabelService),
        __param(3, workspace_1.IWorkspaceContextService),
        __param(4, notification_1.INotificationService),
        __param(5, dialogs_1.IFileDialogService),
        __param(6, model_1.IModelService),
        __param(7, language_1.ILanguageService),
        __param(8, environmentService_1.IWorkbenchEnvironmentService),
        __param(9, remoteAgentService_1.IRemoteAgentService),
        __param(10, pathService_1.IPathService),
        __param(11, keybinding_1.IKeybindingService),
        __param(12, contextkey_1.IContextKeyService),
        __param(13, accessibility_1.IAccessibilityService)
    ], SimpleFileDialog);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ltcGxlRmlsZURpYWxvZy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9kaWFsb2dzL2Jyb3dzZXIvc2ltcGxlRmlsZURpYWxvZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFtQ2hHLElBQWlCLG9CQUFvQixDQVNwQztJQVRELFdBQWlCLG9CQUFvQjtRQUN2Qix1QkFBRSxHQUFHLHNDQUFzQyxDQUFDO1FBQzVDLDBCQUFLLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztRQUN6RSxTQUFnQixPQUFPO1lBQ3RCLE9BQU8sUUFBUSxDQUFDLEVBQUU7Z0JBQ2pCLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsNEJBQWtCLENBQUMsQ0FBQztnQkFDdkQsT0FBTyxhQUFhLENBQUMsZUFBZSxDQUFDLEVBQUUsY0FBYyxFQUFFLEtBQUssRUFBRSxvQkFBb0IsRUFBRSxDQUFDLGlCQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZHLENBQUMsQ0FBQztRQUNILENBQUM7UUFMZSw0QkFBTyxVQUt0QixDQUFBO0lBQ0YsQ0FBQyxFQVRnQixvQkFBb0Isb0NBQXBCLG9CQUFvQixRQVNwQztJQUVELElBQWlCLG9CQUFvQixDQWNwQztJQWRELFdBQWlCLG9CQUFvQjtRQUN2Qix1QkFBRSxHQUFHLHNDQUFzQyxDQUFDO1FBQzVDLDBCQUFLLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztRQUN6RSxTQUFnQixPQUFPO1lBQ3RCLE9BQU8sUUFBUSxDQUFDLEVBQUU7Z0JBQ2pCLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsOEJBQWMsQ0FBQyxDQUFDO2dCQUNuRCxNQUFNLGdC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