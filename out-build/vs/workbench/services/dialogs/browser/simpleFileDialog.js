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
define(["require", "exports", "vs/nls!vs/workbench/services/dialogs/browser/simpleFileDialog", "vs/base/common/resources", "vs/base/common/objects", "vs/platform/files/common/files", "vs/platform/quickinput/common/quickInput", "vs/base/common/uri", "vs/base/common/platform", "vs/platform/dialogs/common/dialogs", "vs/platform/label/common/label", "vs/platform/workspace/common/workspace", "vs/platform/notification/common/notification", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/editor/common/services/getIconClasses", "vs/base/common/network", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/remote/common/remoteAgentService", "vs/platform/contextkey/common/contextkey", "vs/base/common/strings", "vs/platform/keybinding/common/keybinding", "vs/base/common/extpath", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/async", "vs/workbench/services/editor/common/editorService", "vs/base/common/labels", "vs/workbench/services/path/common/pathService", "vs/platform/accessibility/common/accessibility"], function (require, exports, nls, resources, objects, files_1, quickInput_1, uri_1, platform_1, dialogs_1, label_1, workspace_1, notification_1, model_1, language_1, getIconClasses_1, network_1, environmentService_1, remoteAgentService_1, contextkey_1, strings_1, keybinding_1, extpath_1, event_1, lifecycle_1, async_1, editorService_1, labels_1, pathService_1, accessibility_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$$3b = exports.$03b = exports.OpenLocalFileFolderCommand = exports.OpenLocalFolderCommand = exports.SaveLocalFileCommand = exports.OpenLocalFileCommand = void 0;
    var OpenLocalFileCommand;
    (function (OpenLocalFileCommand) {
        OpenLocalFileCommand.ID = 'workbench.action.files.openLocalFile';
        OpenLocalFileCommand.LABEL = nls.localize(0, null);
        function handler() {
            return accessor => {
                const dialogService = accessor.get(dialogs_1.$qA);
                return dialogService.pickFileAndOpen({ forceNewWindow: false, availableFileSystems: [network_1.Schemas.file] });
            };
        }
        OpenLocalFileCommand.handler = handler;
    })(OpenLocalFileCommand || (exports.OpenLocalFileCommand = OpenLocalFileCommand = {}));
    var SaveLocalFileCommand;
    (function (SaveLocalFileCommand) {
        SaveLocalFileCommand.ID = 'workbench.action.files.saveLocalFile';
        SaveLocalFileCommand.LABEL = nls.localize(1, null);
        function handler() {
            return accessor => {
                const editorService = accessor.get(editorService_1.$9C);
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
        OpenLocalFolderCommand.LABEL = nls.localize(2, null);
        function handler() {
            return accessor => {
                const dialogService = accessor.get(dialogs_1.$qA);
                return dialogService.pickFolderAndOpen({ forceNewWindow: false, availableFileSystems: [network_1.Schemas.file] });
            };
        }
        OpenLocalFolderCommand.handler = handler;
    })(OpenLocalFolderCommand || (exports.OpenLocalFolderCommand = OpenLocalFolderCommand = {}));
    var OpenLocalFileFolderCommand;
    (function (OpenLocalFileFolderCommand) {
        OpenLocalFileFolderCommand.ID = 'workbench.action.files.openLocalFileFolder';
        OpenLocalFileFolderCommand.LABEL = nls.localize(3, null);
        function handler() {
            return accessor => {
                const dialogService = accessor.get(dialogs_1.$qA);
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
    exports.$03b = new contextkey_1.$2i('remoteFileDialogVisible', false);
    let $$3b = class $$3b {
        constructor(B, C, D, E, F, G, H, I, J, K, L, M, contextKeyService, N) {
            this.B = B;
            this.C = C;
            this.D = D;
            this.E = E;
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.K = K;
            this.L = L;
            this.M = M;
            this.N = N;
            this.d = false;
            this.f = true;
            this.g = false;
            this.k = false;
            this.o = '';
            this.p = '';
            this.u = false;
            this.x = '/';
            this.y = new event_1.$fd();
            this.A = [
                this.y
            ];
            this.h = this.J.remoteAuthority;
            this.n = exports.$03b.bindTo(contextKeyService);
            this.m = this.L.defaultUriScheme;
        }
        set busy(busy) {
            if (this.c.busy !== busy) {
                this.c.busy = busy;
                this.y.fire(busy);
            }
        }
        get busy() {
            return this.c.busy;
        }
        async showOpenDialog(options = {}) {
            this.m = this.Q(options.availableFileSystems, options.defaultUri);
            this.r = await this.S();
            this.t = await this.S(true);
            const newOptions = this.O(options);
            if (!newOptions) {
                return Promise.resolve(undefined);
            }
            this.a = newOptions;
            return this.T();
        }
        async showSaveDialog(options) {
            this.m = this.Q(options.availableFileSystems, options.defaultUri);
            this.r = await this.S();
            this.t = await this.S(true);
            this.k = true;
            const newOptions = this.O(options, true);
            if (!newOptions) {
                return Promise.resolve(undefined);
            }
            this.a = newOptions;
            this.a.canSelectFolders = true;
            this.a.canSelectFiles = true;
            return new Promise((resolve) => {
                this.T(true).then(folderUri => {
                    resolve(folderUri);
                });
            });
        }
        O(options, isSave = false) {
            let defaultUri = undefined;
            let filename = undefined;
            if (options.defaultUri) {
                defaultUri = (this.m === options.defaultUri.scheme) ? options.defaultUri : undefined;
                filename = isSave ? resources.$fg(options.defaultUri) : undefined;
            }
            if (!defaultUri) {
                defaultUri = this.r;
                if (filename) {
                    defaultUri = resources.$ig(defaultUri, filename);
                }
            }
            if ((this.m !== network_1.Schemas.file) && !this.B.hasProvider(defaultUri)) {
                this.F.info(nls.localize(4, null, defaultUri.toString()));
                return undefined;
            }
            const newOptions = objects.$Vm(options);
            newOptions.defaultUri = defaultUri;
            return newOptions;
        }
        P(path, hintUri) {
            if (!path.startsWith('\\\\')) {
                path = path.replace(/\\/g, '/');
            }
            const uri = this.m === network_1.Schemas.file ? uri_1.URI.file(path) : uri_1.URI.from({ scheme: this.m, path, query: hintUri?.query, fragment: hintUri?.fragment });
            // If the default scheme is file, then we don't care about the remote authority or the hint authority
            const authority = (uri.scheme === network_1.Schemas.file) ? undefined : (this.h ?? hintUri?.authority);
            return resources.$sg(uri, authority, 
            // If there is a remote authority, then we should use the system's default URI as the local scheme.
            // If there is *no* remote authority, then we should use the default scheme for this dialog as that is already local.
            authority ? this.L.defaultUriScheme : uri.scheme);
        }
        Q(available, defaultUri) {
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
        async R() {
            if (this.w === undefined) {
                this.w = await this.K.getEnvironment();
            }
            return this.w;
        }
        S(trueHome = false) {
            return trueHome
                ? this.L.userHome({ preferLocal: this.m === network_1.Schemas.file })
                : this.G.preferredHome(this.m);
        }
        async T(isSave = false) {
            this.g = !!this.a.canSelectFolders;
            this.f = !!this.a.canSelectFiles;
            this.x = this.D.getSeparator(this.m, this.h);
            this.d = false;
            this.u = await this.pb();
            let homedir = this.a.defaultUri ? this.a.defaultUri : this.E.getWorkspace().folders[0].uri;
            let stat;
            const ext = resources.$gg(homedir);
            if (this.a.defaultUri) {
                try {
                    stat = await this.B.stat(this.a.defaultUri);
                }
                catch (e) {
                    // The file or folder doesn't exist
                }
                if (!stat || !stat.isDirectory) {
                    homedir = resources.$hg(this.a.defaultUri);
                    this.l = resources.$fg(this.a.defaultUri);
                }
            }
            return new Promise((resolve) => {
                this.c = this.C.createQuickPick();
                this.busy = true;
                this.c.matchOnLabel = false;
                this.c.sortByLabel = false;
                this.c.autoFocusOnList = false;
                this.c.ignoreFocusOut = true;
                this.c.ok = true;
                if ((this.m !== network_1.Schemas.file) && this.a && this.a.availableFileSystems && (this.a.availableFileSystems.length > 1) && (this.a.availableFileSystems.indexOf(network_1.Schemas.file) > -1)) {
                    this.c.customButton = true;
                    this.c.customLabel = nls.localize(5, null);
                    let action;
                    if (isSave) {
                        action = SaveLocalFileCommand;
                    }
                    else {
                        action = this.f ? (this.g ? OpenLocalFileFolderCommand : OpenLocalFileCommand) : OpenLocalFolderCommand;
                    }
                    const keybinding = this.M.lookupKeybinding(action.ID);
                    if (keybinding) {
                        const label = keybinding.getLabel();
                        if (label) {
                            this.c.customHover = (0, strings_1.$ne)('{0} ({1})', action.LABEL, label);
                        }
                    }
                }
                let isResolving = 0;
                let isAcceptHandled = false;
                this.b = resources.$hg(homedir);
                this.o = '';
                this.p = '';
                this.c.title = this.a.title;
                this.c.value = this.nb(this.b, true);
                this.c.valueSelection = [this.c.value.length, this.c.value.length];
                this.c.items = [];
                function doResolve(dialog, uri) {
                    if (uri) {
                        uri = resources.$qg(uri, dialog.x); // Ensures that c: is c:/ since this comes from user input and can be incorrect.
                        // To be consistent, we should never have a trailing path separator on directories (or anything else). Will not remove from c:/.
                        uri = resources.$pg(uri);
                    }
                    resolve(uri);
                    dialog.n.set(false);
                    dialog.c.dispose();
                    (0, lifecycle_1.$fc)(dialog.A);
                }
                this.c.onDidCustom(() => {
                    if (isAcceptHandled || this.busy) {
                        return;
                    }
                    isAcceptHandled = true;
                    isResolving++;
                    if (this.a.availableFileSystems && (this.a.availableFileSystems.length > 1)) {
                        this.a.availableFileSystems = this.a.availableFileSystems.slice(1);
                    }
                    this.c.hide();
                    if (isSave) {
                        return this.G.showSaveDialog(this.a).then(result => {
                            doResolve(this, result);
                        });
                    }
                    else {
                        return this.G.showOpenDialog(this.a).then(result => {
                            doResolve(this, result ? result[0] : undefined);
                        });
                    }
                });
                function handleAccept(dialog) {
                    if (dialog.busy) {
                        // Save the accept until the file picker is not busy.
                        dialog.y.event((busy) => {
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
                    dialog.$().then(resolveValue => {
                        if (resolveValue) {
                            dialog.c.hide();
                            doResolve(dialog, resolveValue);
                        }
                        else if (dialog.d) {
                            doResolve(dialog, undefined);
                        }
                        else {
                            isResolving--;
                            isAcceptHandled = false;
                        }
                    });
                }
                this.c.onDidAccept(_ => {
                    handleAccept(this);
                });
                this.c.onDidChangeActive(i => {
                    isAcceptHandled = false;
                    // update input box to match the first selected item
                    if ((i.length === 1) && this.X()) {
                        this.c.validationMessage = undefined;
                        const userPath = this.Y();
                        if (!(0, strings_1.$Me)(this.c.value.substring(0, userPath.length), userPath)) {
                            this.c.valueSelection = [0, this.c.value.length];
                            this.hb(userPath, userPath);
                        }
                        this.gb(userPath, this.o, i[0], true);
                    }
                });
                this.c.onDidChangeValue(async (value) => {
                    return this.U(value);
                });
                this.c.onDidHide(() => {
                    this.d = true;
                    if (isResolving === 0) {
                        doResolve(this, undefined);
                    }
                });
                this.c.show();
                this.n.set(true);
                this.mb(homedir, true, this.l).then(() => {
                    if (this.l) {
                        this.c.valueSelection = [this.c.value.length - this.l.length, this.c.value.length - ext.length];
                    }
                    else {
                        this.c.valueSelection = [this.c.value.length, this.c.value.length];
                    }
                    this.busy = false;
                });
            });
        }
        async U(value) {
            try {
                // onDidChangeValue can also be triggered by the auto complete, so if it looks like the auto complete, don't do anything
                if (this.W()) {
                    // If the user has just entered more bad path, don't change anything
                    if (!(0, strings_1.$Me)(value, this.Y()) && !this.V(value)) {
                        this.c.validationMessage = undefined;
                        const filePickBoxUri = this.Z();
                        let updated = UpdateResult.NotUpdated;
                        if (!resources.$ag.isEqual(this.b, filePickBoxUri)) {
                            updated = await this.db(value, filePickBoxUri);
                        }
                        if ((updated === UpdateResult.NotUpdated) || (updated === UpdateResult.UpdatedWithTrailing)) {
                            this.fb(value);
                        }
                    }
                    else {
                        this.c.activeItems = [];
                        this.o = '';
                    }
                }
            }
            catch {
                // Since any text can be entered in the input box, there is potential for error causing input. If this happens, do nothing.
            }
        }
        V(value) {
            return this.v && (value.length > this.v.length) && (0, strings_1.$Me)(value.substring(0, this.v.length), this.v);
        }
        W() {
            if ((0, strings_1.$Me)(this.c.value, this.ob(this.b, this.o + this.p))) {
                return false;
            }
            return true;
        }
        X() {
            if (this.q === (this.c.activeItems ? this.c.activeItems[0] : undefined)) {
                return false;
            }
            return true;
        }
        Y() {
            const currentFolderPath = this.nb(this.b);
            if ((0, strings_1.$Me)(this.c.value.substr(0, this.o.length), this.o)) {
                if ((0, strings_1.$Me)(this.c.value.substr(0, currentFolderPath.length), currentFolderPath)) {
                    return currentFolderPath;
                }
                else {
                    return this.o;
                }
            }
            else {
                return this.ob(this.b, this.o);
            }
        }
        Z() {
            // The file pick box can't render everything, so we use the current folder to create the uri so that it is an existing path.
            const directUri = this.P(this.c.value.trimRight(), this.b);
            const currentPath = this.nb(this.b);
            if ((0, strings_1.$Me)(this.c.value, currentPath)) {
                return this.b;
            }
            const currentDisplayUri = this.P(currentPath, this.b);
            const relativePath = resources.$kg(currentDisplayUri, directUri);
            const isSameRoot = (this.c.value.length > 1 && currentPath.length > 1) ? (0, strings_1.$Me)(this.c.value.substr(0, 2), currentPath.substr(0, 2)) : false;
            if (relativePath && isSameRoot) {
                let path = resources.$ig(this.b, relativePath);
                const directBasename = resources.$fg(directUri);
                if ((directBasename === '.') || (directBasename === '..')) {
                    path = this.P(this.ob(path, directBasename), this.b);
                }
                return resources.$og(directUri) ? resources.$qg(path) : path;
            }
            else {
                return directUri;
            }
        }
        async $() {
            this.busy = true;
            if (this.c.activeItems.length === 1) {
                const item = this.c.selectedItems[0];
                if (item.isFolder) {
                    if (this.l) {
                        await this.mb(item.uri, true, this.l);
                    }
                    else {
                        // When possible, cause the update to happen by modifying the input box.
                        // This allows all input box updates to happen first, and uses the same code path as the user typing.
                        const newPath = this.nb(item.uri);
                        if ((0, strings_1.$Ne)(newPath, this.c.value) && ((0, strings_1.$Me)(item.label, resources.$fg(item.uri)))) {
                            this.c.valueSelection = [this.nb(this.b).length, this.c.value.length];
                            this.hb(newPath, this.rb(item.uri));
                        }
                        else if ((item.label === '..') && (0, strings_1.$Ne)(this.c.value, newPath)) {
                            this.c.valueSelection = [newPath.length, this.c.value.length];
                            this.hb(newPath, '');
                        }
                        else {
                            await this.mb(item.uri, true);
                        }
                    }
                    this.c.busy = false;
                    return;
                }
            }
            else {
                // If the items have updated, don't try to resolve
                if ((await this.db(this.c.value, this.Z())) !== UpdateResult.NotUpdated) {
                    this.c.busy = false;
                    return;
                }
            }
            let resolveValue;
            // Find resolve value
            if (this.c.activeItems.length === 0) {
                resolveValue = this.Z();
            }
            else if (this.c.activeItems.length === 1) {
                resolveValue = this.c.selectedItems[0].uri;
            }
            if (resolveValue) {
                resolveValue = this.ib(resolveValue);
            }
            if (await this.lb(resolveValue)) {
                this.busy = false;
                return resolveValue;
            }
            this.busy = false;
            return undefined;
        }
        ab(value) {
            let lastDir = value;
            let dir = resources.$hg(value);
            while (!resources.$bg(lastDir, dir)) {
                lastDir = dir;
                dir = resources.$hg(dir);
            }
            return dir;
        }
        bb(value) {
            const home = this.t;
            if ((value.length > 0) && (value[0] === '~')) {
                return resources.$ig(home, value.substring(1));
            }
            return this.P(value);
        }
        cb(uri, stat) {
            if (stat.isDirectory) {
                // At this point we know it's a directory and can add the trailing path separator
                if (!this.qb(uri.path)) {
                    return resources.$qg(uri);
                }
            }
            return uri;
        }
        async db(value, valueUri) {
            if ((value.length > 0) && (value[0] === '~')) {
                const newDir = this.bb(value);
                return await this.mb(newDir, true) ? UpdateResult.UpdatedWithTrailing : UpdateResult.Updated;
            }
            else if (value === '\\') {
                valueUri = this.ab(this.b);
                value = this.nb(valueUri);
                return await this.mb(valueUri, true) ? UpdateResult.UpdatedWithTrailing : UpdateResult.Updated;
            }
            else if (!resources.$ag.isEqual(this.b, valueUri) && (this.qb(value) || (!resources.$ag.isEqual(this.b, resources.$hg(valueUri)) && resources.$ag.isEqualOrParent(this.b, resources.$hg(valueUri))))) {
                let stat;
                try {
                    stat = await this.B.stat(valueUri);
                }
                catch (e) {
                    // do nothing
                }
                if (stat && stat.isDirectory && (resources.$fg(valueUri) !== '.') && this.qb(value)) {
                    valueUri = this.cb(valueUri, stat);
                    return await this.mb(valueUri) ? UpdateResult.UpdatedWithTrailing : UpdateResult.Updated;
                }
                else if (this.qb(value)) {
                    // The input box contains a path that doesn't exist on the system.
                    this.c.validationMessage = nls.localize(6, null);
                    // Save this bad path. It can take too long to a stat on every user entered character, but once a user enters a bad path they are likely
                    // to keep typing more bad path. We can compare against this bad path and see if the user entered path starts with it.
                    this.v = value;
                    return UpdateResult.InvalidPath;
                }
                else {
                    let inputUriDirname = resources.$hg(valueUri);
                    const currentFolderWithoutSep = resources.$pg(resources.$qg(this.b));
                    const inputUriDirnameWithoutSep = resources.$pg(resources.$qg(inputUriDirname));
                    if (!resources.$ag.isEqual(currentFolderWithoutSep, inputUriDirnameWithoutSep)
                        && (!/^[a-zA-Z]:$/.test(this.c.value)
                            || !(0, strings_1.$Me)(this.nb(this.b).substring(0, this.c.value.length), this.c.value))) {
                        let statWithoutTrailing;
                        try {
                            statWithoutTrailing = await this.B.stat(inputUriDirname);
                        }
                        catch (e) {
                            // do nothing
                        }
                        if (statWithoutTrailing && statWithoutTrailing.isDirectory) {
                            this.v = undefined;
                            inputUriDirname = this.cb(inputUriDirname, statWithoutTrailing);
                            return await this.mb(inputUriDirname, false, resources.$fg(valueUri)) ? UpdateResult.UpdatedWithTrailing : UpdateResult.Updated;
                        }
                    }
                }
            }
            this.v = undefined;
            return UpdateResult.NotUpdated;
        }
        eb(value) {
            const ext = resources.$gg(value);
            if (this.l && ext) {
                this.l = resources.$fg(value);
            }
        }
        fb(value) {
            value = this.nb(this.bb(value));
            const asUri = this.P(value);
            const inputBasename = resources.$fg(asUri);
            const userPath = this.Y();
            // Make sure that the folder whose children we are currently viewing matches the path in the input
            const pathsEqual = (0, strings_1.$Me)(userPath, value.substring(0, userPath.length)) ||
                (0, strings_1.$Me)(value, userPath.substring(0, value.length));
            if (pathsEqual) {
                let hasMatch = false;
                for (let i = 0; i < this.c.items.length; i++) {
                    const item = this.c.items[i];
                    if (this.gb(value, inputBasename, item)) {
                        hasMatch = true;
                        break;
                    }
                }
                if (!hasMatch) {
                    const userBasename = inputBasename.length >= 2 ? userPath.substring(userPath.length - inputBasename.length + 2) : '';
                    this.o = (userBasename === inputBasename) ? inputBasename : '';
                    this.p = '';
                    this.c.activeItems = [];
                    this.eb(asUri);
                }
            }
            else {
                this.o = inputBasename;
                this.p = '';
                this.c.activeItems = [];
                this.eb(asUri);
            }
        }
        gb(startingValue, startingBasename, quickPickItem, force = false) {
            if (this.busy) {
                // We're in the middle of something else. Doing an auto complete now can result jumbled or incorrect autocompletes.
                this.o = startingBasename;
                this.p = '';
                return false;
            }
            const itemBasename = quickPickItem.label;
            // Either force the autocomplete, or the old value should be one smaller than the new value and match the new value.
            if (itemBasename === '..') {
                // Don't match on the up directory item ever.
                this.o = '';
                this.p = '';
                this.q = quickPickItem;
                if (force) {
                    // clear any selected text
                    document.execCommand('insertText', false, '');
                }
                return false;
            }
            else if (!force && (itemBasename.length >= startingBasename.length) && (0, strings_1.$Me)(itemBasename.substr(0, startingBasename.length), startingBasename)) {
                this.o = startingBasename;
                this.q = quickPickItem;
                // Changing the active items will trigger the onDidActiveItemsChanged. Clear the autocomplete first, then set it after.
                this.p = '';
                if (quickPickItem.isFolder || !this.l) {
                    this.c.activeItems = [quickPickItem];
                }
                else {
                    this.c.activeItems = [];
                }
                return true;
            }
            else if (force && (!(0, strings_1.$Me)(this.rb(quickPickItem.uri), (this.o + this.p)))) {
                this.o = '';
                if (!this.N.isScreenReaderOptimized()) {
                    this.p = this.jb(itemBasename);
                }
                this.q = quickPickItem;
                if (!this.N.isScreenReaderOptimized()) {
                    this.c.valueSelection = [this.nb(this.b, true).length, this.c.value.length];
                    // use insert text to preserve undo buffer
                    this.hb(this.ob(this.b, this.p), this.p);
                    this.c.valueSelection = [this.c.value.length - this.p.length, this.c.value.length];
                }
                return true;
            }
            else {
                this.o = startingBasename;
                this.p = '';
                return false;
            }
        }
        hb(wholeValue, insertText) {
            if (this.c.inputHasFocus()) {
                document.execCommand('insertText', false, insertText);
                if (this.c.value !== wholeValue) {
                    this.c.value = wholeValue;
                    this.U(wholeValue);
                }
            }
            else {
                this.c.value = wholeValue;
                this.U(wholeValue);
            }
        }
        ib(uri) {
            let result = uri;
            if (this.k && this.a.filters && this.a.filters.length > 0 && !resources.$og(uri)) {
                // Make sure that the suffix is added. If the user deleted it, we automatically add it here
                let hasExt = false;
                const currentExt = resources.$gg(uri).substr(1);
                for (let i = 0; i < this.a.filters.length; i++) {
                    for (let j = 0; j < this.a.filters[i].extensions.length; j++) {
                        if ((this.a.filters[i].extensions[j] === '*') || (this.a.filters[i].extensions[j] === currentExt)) {
                            hasExt = true;
                            break;
                        }
                    }
                    if (hasExt) {
                        break;
                    }
                }
                if (!hasExt) {
                    result = resources.$ig(resources.$hg(uri), resources.$fg(uri) + '.' + this.a.filters[0].extensions[0]);
                }
            }
            return result;
        }
        jb(path) {
            return ((path.length > 1) && this.qb(path)) ? path.substr(0, path.length - 1) : path;
        }
        kb(uri, message) {
            const prompt = this.C.createQuickPick();
            prompt.title = message;
            prompt.ignoreFocusOut = true;
            prompt.ok = true;
            prompt.customButton = true;
            prompt.customLabel = nls.localize(7, null);
            prompt.value = this.nb(uri);
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
                    this.c.show();
                    this.d = false;
                    this.c.items = this.c.items;
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
        async lb(uri) {
            if (uri === undefined) {
                this.c.validationMessage = nls.localize(8, null);
                return Promise.resolve(false);
            }
            let stat;
            let statDirname;
            try {
                statDirname = await this.B.stat(resources.$hg(uri));
                stat = await this.B.stat(uri);
            }
            catch (e) {
                // do nothing
            }
            if (this.k) { // save
                if (stat && stat.isDirectory) {
                    // Can't do this
                    this.c.validationMessage = nls.localize(9, null);
                    return Promise.resolve(false);
                }
                else if (stat) {
                    // Replacing a file.
                    // Show a yes/no prompt
                    const message = nls.localize(10, null, resources.$fg(uri));
                    return this.kb(uri, message);
                }
                else if (!((0, extpath_1.$Gf)(resources.$fg(uri), this.u))) {
                    // Filename not allowed
                    this.c.validationMessage = nls.localize(11, null);
                    return Promise.resolve(false);
                }
                else if (!statDirname) {
                    // Folder to save in doesn't exist
                    const message = nls.localize(12, null, resources.$fg(resources.$hg(uri)));
                    return this.kb(uri, message);
                }
                else if (!statDirname.isDirectory) {
                    this.c.validationMessage = nls.localize(13, null);
                    return Promise.resolve(false);
                }
            }
            else { // open
                if (!stat) {
                    // File or folder doesn't exist
                    this.c.validationMessage = nls.localize(14, null);
                    return Promise.resolve(false);
                }
                else if (uri.path === '/' && this.u) {
                    this.c.validationMessage = nls.localize(15, null);
                    return Promise.resolve(false);
                }
                else if (stat.isDirectory && !this.g) {
                    // Folder selected when folder selection not permitted
                    this.c.validationMessage = nls.localize(16, null);
                    return Promise.resolve(false);
                }
                else if (!stat.isDirectory && !this.f) {
                    // File selected when file selection not permitted
                    this.c.validationMessage = nls.localize(17, null);
                    return Promise.resolve(false);
                }
            }
            return Promise.resolve(true);
        }
        // Returns true if there is a file at the end of the URI.
        async mb(newFolder, force = false, trailing) {
            this.busy = true;
            this.p = '';
            const isSave = !!trailing;
            let result = false;
            const updatingPromise = (0, async_1.$ug)(async (token) => {
                let folderStat;
                try {
                    folderStat = await this.B.resolve(newFolder);
                    if (!folderStat.isDirectory) {
                        trailing = resources.$fg(newFolder);
                        newFolder = resources.$hg(newFolder);
                        folderStat = undefined;
                        result = true;
                    }
                }
                catch (e) {
                    // The file/directory doesn't exist
                }
                const newValue = trailing ? this.ob(newFolder, trailing) : this.nb(newFolder, true);
                this.b = this.qb(newFolder.path) ? newFolder : resources.$qg(newFolder, this.x);
                this.o = trailing ? trailing : '';
                return this.tb(folderStat, this.b, token).then(items => {
                    if (token.isCancellationRequested) {
                        this.busy = false;
                        return false;
                    }
                    this.c.items = items;
                    this.c.activeItems = [this.c.items[0]];
                    this.c.activeItems = [];
                    // the user might have continued typing while we were updating. Only update the input box if it doesn't match the directory.
                    if (!(0, strings_1.$Me)(this.c.value, newValue) && force) {
                        this.c.valueSelection = [0, this.c.value.length];
                        this.hb(newValue, newValue);
                    }
                    if (force && trailing && isSave) {
                        // Keep the cursor position in front of the save as name.
                        this.c.valueSelection = [this.c.value.length - trailing.length, this.c.value.length - trailing.length];
                    }
                    else if (!trailing) {
                        // If there is trailing, we don't move the cursor. If there is no trailing, cursor goes at the end.
                        this.c.valueSelection = [this.c.value.length, this.c.value.length];
                    }
                    this.busy = false;
                    this.z = undefined;
                    return result;
                });
            });
            if (this.z !== undefined) {
                this.z.cancel();
            }
            this.z = updatingPromise;
            return updatingPromise;
        }
        nb(uri, endWithSeparator = false) {
            let result = (0, labels_1.$fA)(uri.fsPath, this.u).replace(/\n/g, '');
            if (this.x === '/') {
                result = result.replace(/\\/g, this.x);
            }
            else {
                result = result.replace(/\//g, this.x);
            }
            if (endWithSeparator && !this.qb(result)) {
                result = result + this.x;
            }
            return result;
        }
        ob(uri, additional) {
            if ((additional === '..') || (additional === '.')) {
                const basePath = this.nb(uri, true);
                return basePath + additional;
            }
            else {
                return this.nb(resources.$ig(uri, additional));
            }
        }
        async pb() {
            let isWindowsOS = platform_1.$i;
            const env = await this.R();
            if (env) {
                isWindowsOS = env.os === 1 /* OperatingSystem.Windows */;
            }
            return isWindowsOS;
        }
        qb(s) {
            return /[\/\\]$/.test(s);
        }
        rb(fullPath) {
            const child = this.nb(fullPath, true);
            const parent = this.nb(resources.$hg(fullPath), true);
            return child.substring(parent.length);
        }
        async sb(currFolder) {
            const fileRepresentationCurr = this.b.with({ scheme: network_1.Schemas.file, authority: '' });
            const fileRepresentationParent = resources.$hg(fileRepresentationCurr);
            if (!resources.$bg(fileRepresentationCurr, fileRepresentationParent)) {
                const parentFolder = resources.$hg(currFolder);
                if (await this.B.exists(parentFolder)) {
                    return { label: '..', uri: resources.$qg(parentFolder, this.x), isFolder: true };
                }
            }
            return undefined;
        }
        async tb(folder, currentFolder, token) {
            const result = [];
            const backDir = await this.sb(currentFolder);
            try {
                if (!folder) {
                    folder = await this.B.resolve(currentFolder);
                }
                const items = folder.children ? await Promise.all(folder.children.map(child => this.vb(child, currentFolder, token))) : [];
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
                const trimmed1 = this.qb(i1.label) ? i1.label.substr(0, i1.label.length - 1) : i1.label;
                const trimmed2 = this.qb(i2.label) ? i2.label.substr(0, i2.label.length - 1) : i2.label;
                return trimmed1.localeCompare(trimmed2);
            });
            if (backDir) {
                sorted.unshift(backDir);
            }
            return sorted;
        }
        ub(file) {
            if (this.a.filters) {
                for (let i = 0; i < this.a.filters.length; i++) {
                    for (let j = 0; j < this.a.filters[i].extensions.length; j++) {
                        const testExt = this.a.filters[i].extensions[j];
                        if ((testExt === '*') || (file.path.endsWith('.' + testExt))) {
                            return true;
                        }
                    }
                }
                return false;
            }
            return true;
        }
        async vb(stat, parent, token) {
            if (token.isCancellationRequested) {
                return undefined;
            }
            let fullPath = resources.$ig(parent, stat.name);
            if (stat.isDirectory) {
                const filename = resources.$fg(fullPath);
                fullPath = resources.$qg(fullPath, this.x);
                return { label: filename, uri: fullPath, isFolder: true, iconClasses: (0, getIconClasses_1.$x6)(this.H, this.I, fullPath || undefined, files_1.FileKind.FOLDER) };
            }
            else if (!stat.isDirectory && this.f && this.ub(fullPath)) {
                return { label: stat.name, uri: fullPath, isFolder: false, iconClasses: (0, getIconClasses_1.$x6)(this.H, this.I, fullPath || undefined) };
            }
            return undefined;
        }
    };
    exports.$$3b = $$3b;
    exports.$$3b = $$3b = __decorate([
        __param(0, files_1.$6j),
        __param(1, quickInput_1.$Gq),
        __param(2, label_1.$Vz),
        __param(3, workspace_1.$Kh),
        __param(4, notification_1.$Yu),
        __param(5, dialogs_1.$qA),
        __param(6, model_1.$yA),
        __param(7, language_1.$ct),
        __param(8, environmentService_1.$hJ),
        __param(9, remoteAgentService_1.$jm),
        __param(10, pathService_1.$yJ),
        __param(11, keybinding_1.$2D),
        __param(12, contextkey_1.$3i),
        __param(13, accessibility_1.$1r)
    ], $$3b);
});
//# sourceMappingURL=simpleFileDialog.js.map