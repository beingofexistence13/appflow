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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/button/button", "vs/base/browser/ui/inputbox/inputBox", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/actions", "vs/base/common/codicons", "vs/base/common/decorators", "vs/base/common/event", "vs/base/common/labels", "vs/base/common/lifecycle", "vs/base/common/linkedText", "vs/base/common/network", "vs/base/common/uri", "vs/nls", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextview/browser/contextView", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/instantiation", "vs/platform/label/common/label", "vs/platform/list/browser/listService", "vs/platform/opener/browser/link", "vs/platform/registry/common/platform", "vs/platform/workspace/common/virtualWorkspace", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/workspace/common/workspace", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/contrib/debug/browser/debugColors", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/services/configuration/common/configuration", "vs/workbench/services/extensions/common/extensionManifestPropertiesService", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/base/common/path", "vs/base/common/extpath", "vs/base/browser/keyboardEvent", "vs/platform/product/common/productService", "vs/platform/theme/common/iconRegistry", "vs/platform/theme/browser/defaultStyles", "vs/base/common/platform", "vs/platform/keybinding/common/keybinding", "vs/base/common/resources"], function (require, exports, dom_1, actionbar_1, button_1, inputBox_1, scrollableElement_1, actions_1, codicons_1, decorators_1, event_1, labels_1, lifecycle_1, linkedText_1, network_1, uri_1, nls_1, configurationRegistry_1, contextView_1, dialogs_1, instantiation_1, label_1, listService_1, link_1, platform_1, virtualWorkspace_1, storage_1, telemetry_1, colorRegistry_1, workspace_1, themeService_1, themables_1, workspaceTrust_1, editorPane_1, debugColors_1, extensions_1, configuration_1, extensionManifestPropertiesService_1, uriIdentity_1, extensionManagementUtil_1, extensionManagement_1, path_1, extpath_1, keyboardEvent_1, productService_1, iconRegistry_1, defaultStyles_1, platform_2, keybinding_1, resources_1) {
    "use strict";
    var TrustedUriActionsColumnRenderer_1, TrustedUriPathColumnRenderer_1, TrustedUriHostColumnRenderer_1, WorkspaceTrustEditor_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkspaceTrustEditor = exports.shieldIcon = void 0;
    exports.shieldIcon = (0, iconRegistry_1.registerIcon)('workspace-trust-banner', codicons_1.Codicon.shield, (0, nls_1.localize)('shieldIcon', 'Icon for workspace trust ion the banner.'));
    const checkListIcon = (0, iconRegistry_1.registerIcon)('workspace-trust-editor-check', codicons_1.Codicon.check, (0, nls_1.localize)('checkListIcon', 'Icon for the checkmark in the workspace trust editor.'));
    const xListIcon = (0, iconRegistry_1.registerIcon)('workspace-trust-editor-cross', codicons_1.Codicon.x, (0, nls_1.localize)('xListIcon', 'Icon for the cross in the workspace trust editor.'));
    const folderPickerIcon = (0, iconRegistry_1.registerIcon)('workspace-trust-editor-folder-picker', codicons_1.Codicon.folder, (0, nls_1.localize)('folderPickerIcon', 'Icon for the pick folder icon in the workspace trust editor.'));
    const editIcon = (0, iconRegistry_1.registerIcon)('workspace-trust-editor-edit-folder', codicons_1.Codicon.edit, (0, nls_1.localize)('editIcon', 'Icon for the edit folder icon in the workspace trust editor.'));
    const removeIcon = (0, iconRegistry_1.registerIcon)('workspace-trust-editor-remove-folder', codicons_1.Codicon.close, (0, nls_1.localize)('removeIcon', 'Icon for the remove folder icon in the workspace trust editor.'));
    let WorkspaceTrustedUrisTable = class WorkspaceTrustedUrisTable extends lifecycle_1.Disposable {
        constructor(container, instantiationService, workspaceService, workspaceTrustManagementService, uriService, labelService, fileDialogService) {
            super();
            this.container = container;
            this.instantiationService = instantiationService;
            this.workspaceService = workspaceService;
            this.workspaceTrustManagementService = workspaceTrustManagementService;
            this.uriService = uriService;
            this.labelService = labelService;
            this.fileDialogService = fileDialogService;
            this._onDidAcceptEdit = this._register(new event_1.Emitter());
            this.onDidAcceptEdit = this._onDidAcceptEdit.event;
            this._onDidRejectEdit = this._register(new event_1.Emitter());
            this.onDidRejectEdit = this._onDidRejectEdit.event;
            this._onEdit = this._register(new event_1.Emitter());
            this.onEdit = this._onEdit.event;
            this._onDelete = this._register(new event_1.Emitter());
            this.onDelete = this._onDelete.event;
            this.descriptionElement = container.appendChild((0, dom_1.$)('.workspace-trusted-folders-description'));
            const tableElement = container.appendChild((0, dom_1.$)('.trusted-uris-table'));
            const addButtonBarElement = container.appendChild((0, dom_1.$)('.trusted-uris-button-bar'));
            this.table = this.instantiationService.createInstance(listService_1.WorkbenchTable, 'WorkspaceTrust', tableElement, new TrustedUriTableVirtualDelegate(), [
                {
                    label: (0, nls_1.localize)('hostColumnLabel', "Host"),
                    tooltip: '',
                    weight: 1,
                    templateId: TrustedUriHostColumnRenderer.TEMPLATE_ID,
                    project(row) { return row; }
                },
                {
                    label: (0, nls_1.localize)('pathColumnLabel', "Path"),
                    tooltip: '',
                    weight: 8,
                    templateId: TrustedUriPathColumnRenderer.TEMPLATE_ID,
                    project(row) { return row; }
                },
                {
                    label: '',
                    tooltip: '',
                    weight: 1,
                    minimumWidth: 75,
                    maximumWidth: 75,
                    templateId: TrustedUriActionsColumnRenderer.TEMPLATE_ID,
                    project(row) { return row; }
                },
            ], [
                this.instantiationService.createInstance(TrustedUriHostColumnRenderer),
                this.instantiationService.createInstance(TrustedUriPathColumnRenderer, this),
                this.instantiationService.createInstance(TrustedUriActionsColumnRenderer, this, this.currentWorkspaceUri),
            ], {
                horizontalScrolling: false,
                alwaysConsumeMouseWheel: false,
                openOnSingleClick: false,
                multipleSelectionSupport: false,
                accessibilityProvider: {
                    getAriaLabel: (item) => {
                        const hostLabel = getHostLabel(this.labelService, item);
                        if (hostLabel === undefined || hostLabel.length === 0) {
                            return (0, nls_1.localize)('trustedFolderAriaLabel', "{0}, trusted", this.labelService.getUriLabel(item.uri));
                        }
                        return (0, nls_1.localize)('trustedFolderWithHostAriaLabel', "{0} on {1}, trusted", this.labelService.getUriLabel(item.uri), hostLabel);
                    },
                    getWidgetAriaLabel: () => (0, nls_1.localize)('trustedFoldersAndWorkspaces', "Trusted Folders & Workspaces")
                }
            });
            this._register(this.table.onDidOpen(item => {
                // default prevented when input box is double clicked #125052
                if (item && item.element && !item.browserEvent?.defaultPrevented) {
                    this.edit(item.element, true);
                }
            }));
            const buttonBar = this._register(new button_1.ButtonBar(addButtonBarElement));
            const addButton = this._register(buttonBar.addButton({ title: (0, nls_1.localize)('addButton', "Add Folder"), ...defaultStyles_1.defaultButtonStyles }));
            addButton.label = (0, nls_1.localize)('addButton', "Add Folder");
            this._register(addButton.onDidClick(async () => {
                const uri = await this.fileDialogService.showOpenDialog({
                    canSelectFiles: false,
                    canSelectFolders: true,
                    canSelectMany: false,
                    defaultUri: this.currentWorkspaceUri,
                    openLabel: (0, nls_1.localize)('trustUri', "Trust Folder"),
                    title: (0, nls_1.localize)('selectTrustedUri', "Select Folder To Trust")
                });
                if (uri) {
                    this.workspaceTrustManagementService.setUrisTrust(uri, true);
                }
            }));
            this._register(this.workspaceTrustManagementService.onDidChangeTrustedFolders(() => {
                this.updateTable();
            }));
        }
        getIndexOfTrustedUriEntry(item) {
            const index = this.trustedUriEntries.indexOf(item);
            if (index === -1) {
                for (let i = 0; i < this.trustedUriEntries.length; i++) {
                    if (this.trustedUriEntries[i].uri === item.uri) {
                        return i;
                    }
                }
            }
            return index;
        }
        selectTrustedUriEntry(item, focus = true) {
            const index = this.getIndexOfTrustedUriEntry(item);
            if (index !== -1) {
                if (focus) {
                    this.table.domFocus();
                    this.table.setFocus([index]);
                }
                this.table.setSelection([index]);
            }
        }
        get currentWorkspaceUri() {
            return this.workspaceService.getWorkspace().folders[0]?.uri || uri_1.URI.file('/');
        }
        get trustedUriEntries() {
            const currentWorkspace = this.workspaceService.getWorkspace();
            const currentWorkspaceUris = currentWorkspace.folders.map(folder => folder.uri);
            if (currentWorkspace.configuration) {
                currentWorkspaceUris.push(currentWorkspace.configuration);
            }
            const entries = this.workspaceTrustManagementService.getTrustedUris().map(uri => {
                let relatedToCurrentWorkspace = false;
                for (const workspaceUri of currentWorkspaceUris) {
                    relatedToCurrentWorkspace = relatedToCurrentWorkspace || this.uriService.extUri.isEqualOrParent(workspaceUri, uri);
                }
                return {
                    uri,
                    parentOfWorkspaceItem: relatedToCurrentWorkspace
                };
            });
            // Sort entries
            const sortedEntries = entries.sort((a, b) => {
                if (a.uri.scheme !== b.uri.scheme) {
                    if (a.uri.scheme === network_1.Schemas.file) {
                        return -1;
                    }
                    if (b.uri.scheme === network_1.Schemas.file) {
                        return 1;
                    }
                }
                const aIsWorkspace = a.uri.path.endsWith('.code-workspace');
                const bIsWorkspace = b.uri.path.endsWith('.code-workspace');
                if (aIsWorkspace !== bIsWorkspace) {
                    if (aIsWorkspace) {
                        return 1;
                    }
                    if (bIsWorkspace) {
                        return -1;
                    }
                }
                return a.uri.fsPath.localeCompare(b.uri.fsPath);
            });
            return sortedEntries;
        }
        layout() {
            this.table.layout((this.trustedUriEntries.length * TrustedUriTableVirtualDelegate.ROW_HEIGHT) + TrustedUriTableVirtualDelegate.HEADER_ROW_HEIGHT, undefined);
        }
        updateTable() {
            const entries = this.trustedUriEntries;
            this.container.classList.toggle('empty', entries.length === 0);
            this.descriptionElement.innerText = entries.length ?
                (0, nls_1.localize)('trustedFoldersDescription', "You trust the following folders, their subfolders, and workspace files.") :
                (0, nls_1.localize)('noTrustedFoldersDescriptions', "You haven't trusted any folders or workspace files yet.");
            this.table.splice(0, Number.POSITIVE_INFINITY, this.trustedUriEntries);
            this.layout();
        }
        validateUri(path, item) {
            if (!item) {
                return null;
            }
            if (item.uri.scheme === 'vscode-vfs') {
                const segments = path.split(path_1.posix.sep).filter(s => s.length);
                if (segments.length === 0 && path.startsWith(path_1.posix.sep)) {
                    return {
                        type: 2 /* MessageType.WARNING */,
                        content: (0, nls_1.localize)({ key: 'trustAll', comment: ['The {0} will be a host name where repositories are hosted.'] }, "You will trust all repositories on {0}.", getHostLabel(this.labelService, item))
                    };
                }
                if (segments.length === 1) {
                    return {
                        type: 2 /* MessageType.WARNING */,
                        content: (0, nls_1.localize)({ key: 'trustOrg', comment: ['The {0} will be an organization or user name.', 'The {1} will be a host name where repositories are hosted.'] }, "You will trust all repositories and forks under '{0}' on {1}.", segments[0], getHostLabel(this.labelService, item))
                    };
                }
                if (segments.length > 2) {
                    return {
                        type: 3 /* MessageType.ERROR */,
                        content: (0, nls_1.localize)('invalidTrust', "You cannot trust individual folders within a repository.", path)
                    };
                }
            }
            return null;
        }
        acceptEdit(item, uri) {
            const trustedFolders = this.workspaceTrustManagementService.getTrustedUris();
            const index = trustedFolders.findIndex(u => this.uriService.extUri.isEqual(u, item.uri));
            if (index >= trustedFolders.length || index === -1) {
                trustedFolders.push(uri);
            }
            else {
                trustedFolders[index] = uri;
            }
            this.workspaceTrustManagementService.setTrustedUris(trustedFolders);
            this._onDidAcceptEdit.fire(item);
        }
        rejectEdit(item) {
            this._onDidRejectEdit.fire(item);
        }
        async delete(item) {
            await this.workspaceTrustManagementService.setUrisTrust([item.uri], false);
            this._onDelete.fire(item);
        }
        async edit(item, usePickerIfPossible) {
            const canUseOpenDialog = item.uri.scheme === network_1.Schemas.file ||
                (item.uri.scheme === this.currentWorkspaceUri.scheme &&
                    this.uriService.extUri.isEqualAuthority(this.currentWorkspaceUri.authority, item.uri.authority) &&
                    !(0, virtualWorkspace_1.isVirtualResource)(item.uri));
            if (canUseOpenDialog && usePickerIfPossible) {
                const uri = await this.fileDialogService.showOpenDialog({
                    canSelectFiles: false,
                    canSelectFolders: true,
                    canSelectMany: false,
                    defaultUri: item.uri,
                    openLabel: (0, nls_1.localize)('trustUri', "Trust Folder"),
                    title: (0, nls_1.localize)('selectTrustedUri', "Select Folder To Trust")
                });
                if (uri) {
                    this.acceptEdit(item, uri[0]);
                }
                else {
                    this.rejectEdit(item);
                }
            }
            else {
                this.selectTrustedUriEntry(item);
                this._onEdit.fire(item);
            }
        }
    };
    WorkspaceTrustedUrisTable = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(4, uriIdentity_1.IUriIdentityService),
        __param(5, label_1.ILabelService),
        __param(6, dialogs_1.IFileDialogService)
    ], WorkspaceTrustedUrisTable);
    class TrustedUriTableVirtualDelegate {
        constructor() {
            this.headerRowHeight = TrustedUriTableVirtualDelegate.HEADER_ROW_HEIGHT;
        }
        static { this.HEADER_ROW_HEIGHT = 30; }
        static { this.ROW_HEIGHT = 24; }
        getHeight(item) {
            return TrustedUriTableVirtualDelegate.ROW_HEIGHT;
        }
    }
    let TrustedUriActionsColumnRenderer = class TrustedUriActionsColumnRenderer {
        static { TrustedUriActionsColumnRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'actions'; }
        constructor(table, currentWorkspaceUri, uriService) {
            this.table = table;
            this.currentWorkspaceUri = currentWorkspaceUri;
            this.uriService = uriService;
            this.templateId = TrustedUriActionsColumnRenderer_1.TEMPLATE_ID;
        }
        renderTemplate(container) {
            const element = container.appendChild((0, dom_1.$)('.actions'));
            const actionBar = new actionbar_1.ActionBar(element, { animated: false });
            return { actionBar };
        }
        renderElement(item, index, templateData, height) {
            templateData.actionBar.clear();
            const canUseOpenDialog = item.uri.scheme === network_1.Schemas.file ||
                (item.uri.scheme === this.currentWorkspaceUri.scheme &&
                    this.uriService.extUri.isEqualAuthority(this.currentWorkspaceUri.authority, item.uri.authority) &&
                    !(0, virtualWorkspace_1.isVirtualResource)(item.uri));
            const actions = [];
            if (canUseOpenDialog) {
                actions.push(this.createPickerAction(item));
            }
            actions.push(this.createEditAction(item));
            actions.push(this.createDeleteAction(item));
            templateData.actionBar.push(actions, { icon: true });
        }
        createEditAction(item) {
            return {
                class: themables_1.ThemeIcon.asClassName(editIcon),
                enabled: true,
                id: 'editTrustedUri',
                tooltip: (0, nls_1.localize)('editTrustedUri', "Edit Path"),
                run: () => {
                    this.table.edit(item, false);
                }
            };
        }
        createPickerAction(item) {
            return {
                class: themables_1.ThemeIcon.asClassName(folderPickerIcon),
                enabled: true,
                id: 'pickerTrustedUri',
                tooltip: (0, nls_1.localize)('pickerTrustedUri', "Open File Picker"),
                run: () => {
                    this.table.edit(item, true);
                }
            };
        }
        createDeleteAction(item) {
            return {
                class: themables_1.ThemeIcon.asClassName(removeIcon),
                enabled: true,
                id: 'deleteTrustedUri',
                tooltip: (0, nls_1.localize)('deleteTrustedUri', "Delete Path"),
                run: async () => {
                    await this.table.delete(item);
                }
            };
        }
        disposeTemplate(templateData) {
            templateData.actionBar.dispose();
        }
    };
    TrustedUriActionsColumnRenderer = TrustedUriActionsColumnRenderer_1 = __decorate([
        __param(2, uriIdentity_1.IUriIdentityService)
    ], TrustedUriActionsColumnRenderer);
    let TrustedUriPathColumnRenderer = class TrustedUriPathColumnRenderer {
        static { TrustedUriPathColumnRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'path'; }
        constructor(table, contextViewService) {
            this.table = table;
            this.contextViewService = contextViewService;
            this.templateId = TrustedUriPathColumnRenderer_1.TEMPLATE_ID;
        }
        renderTemplate(container) {
            const element = container.appendChild((0, dom_1.$)('.path'));
            const pathLabel = element.appendChild((0, dom_1.$)('div.path-label'));
            const pathInput = new inputBox_1.InputBox(element, this.contextViewService, {
                validationOptions: {
                    validation: value => this.table.validateUri(value, this.currentItem)
                },
                inputBoxStyles: defaultStyles_1.defaultInputBoxStyles
            });
            const disposables = new lifecycle_1.DisposableStore();
            const renderDisposables = disposables.add(new lifecycle_1.DisposableStore());
            return {
                element,
                pathLabel,
                pathInput,
                disposables,
                renderDisposables
            };
        }
        renderElement(item, index, templateData, height) {
            templateData.renderDisposables.clear();
            this.currentItem = item;
            templateData.renderDisposables.add(this.table.onEdit(async (e) => {
                if (item === e) {
                    templateData.element.classList.add('input-mode');
                    templateData.pathInput.focus();
                    templateData.pathInput.select();
                    templateData.element.parentElement.style.paddingLeft = '0px';
                }
            }));
            // stop double click action from re-rendering the element on the table #125052
            templateData.renderDisposables.add((0, dom_1.addDisposableListener)(templateData.pathInput.element, dom_1.EventType.DBLCLICK, e => {
                dom_1.EventHelper.stop(e);
            }));
            const hideInputBox = () => {
                templateData.element.classList.remove('input-mode');
                templateData.element.parentElement.style.paddingLeft = '5px';
            };
            const accept = () => {
                hideInputBox();
                const pathToUse = templateData.pathInput.value;
                const uri = (0, extpath_1.hasDriveLetter)(pathToUse) ? item.uri.with({ path: path_1.posix.sep + (0, extpath_1.toSlashes)(pathToUse) }) : item.uri.with({ path: pathToUse });
                templateData.pathLabel.innerText = this.formatPath(uri);
                if (uri) {
                    this.table.acceptEdit(item, uri);
                }
            };
            const reject = () => {
                hideInputBox();
                templateData.pathInput.value = stringValue;
                this.table.rejectEdit(item);
            };
            templateData.renderDisposables.add((0, dom_1.addStandardDisposableListener)(templateData.pathInput.inputElement, dom_1.EventType.KEY_DOWN, e => {
                let handled = false;
                if (e.equals(3 /* KeyCode.Enter */)) {
                    accept();
                    handled = true;
                }
                else if (e.equals(9 /* KeyCode.Escape */)) {
                    reject();
                    handled = true;
                }
                if (handled) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }));
            templateData.renderDisposables.add(((0, dom_1.addDisposableListener)(templateData.pathInput.inputElement, dom_1.EventType.BLUR, () => {
                reject();
            })));
            const stringValue = this.formatPath(item.uri);
            templateData.pathInput.value = stringValue;
            templateData.pathLabel.innerText = stringValue;
            templateData.element.classList.toggle('current-workspace-parent', item.parentOfWorkspaceItem);
        }
        disposeTemplate(templateData) {
            templateData.disposables.dispose();
            templateData.renderDisposables.dispose();
        }
        formatPath(uri) {
            if (uri.scheme === network_1.Schemas.file) {
                return (0, labels_1.normalizeDriveLetter)(uri.fsPath);
            }
            // If the path is not a file uri, but points to a windows remote, we should create windows fs path
            // e.g. /c:/user/directory => C:\user\directory
            if (uri.path.startsWith(path_1.posix.sep)) {
                const pathWithoutLeadingSeparator = uri.path.substring(1);
                const isWindowsPath = (0, extpath_1.hasDriveLetter)(pathWithoutLeadingSeparator, true);
                if (isWindowsPath) {
                    return (0, labels_1.normalizeDriveLetter)(path_1.win32.normalize(pathWithoutLeadingSeparator), true);
                }
            }
            return uri.path;
        }
    };
    TrustedUriPathColumnRenderer = TrustedUriPathColumnRenderer_1 = __decorate([
        __param(1, contextView_1.IContextViewService)
    ], TrustedUriPathColumnRenderer);
    function getHostLabel(labelService, item) {
        return item.uri.authority ? labelService.getHostLabel(item.uri.scheme, item.uri.authority) : (0, nls_1.localize)('localAuthority', "Local");
    }
    let TrustedUriHostColumnRenderer = class TrustedUriHostColumnRenderer {
        static { TrustedUriHostColumnRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'host'; }
        constructor(labelService) {
            this.labelService = labelService;
            this.templateId = TrustedUriHostColumnRenderer_1.TEMPLATE_ID;
        }
        renderTemplate(container) {
            const disposables = new lifecycle_1.DisposableStore();
            const renderDisposables = disposables.add(new lifecycle_1.DisposableStore());
            const element = container.appendChild((0, dom_1.$)('.host'));
            const hostContainer = element.appendChild((0, dom_1.$)('div.host-label'));
            const buttonBarContainer = element.appendChild((0, dom_1.$)('div.button-bar'));
            return {
                element,
                hostContainer,
                buttonBarContainer,
                disposables,
                renderDisposables
            };
        }
        renderElement(item, index, templateData, height) {
            templateData.renderDisposables.clear();
            templateData.renderDisposables.add({ dispose: () => { (0, dom_1.clearNode)(templateData.buttonBarContainer); } });
            templateData.hostContainer.innerText = getHostLabel(this.labelService, item);
            templateData.element.classList.toggle('current-workspace-parent', item.parentOfWorkspaceItem);
            templateData.hostContainer.style.display = '';
            templateData.buttonBarContainer.style.display = 'none';
        }
        disposeTemplate(templateData) {
            templateData.disposables.dispose();
        }
    };
    TrustedUriHostColumnRenderer = TrustedUriHostColumnRenderer_1 = __decorate([
        __param(0, label_1.ILabelService)
    ], TrustedUriHostColumnRenderer);
    let WorkspaceTrustEditor = class WorkspaceTrustEditor extends editorPane_1.EditorPane {
        static { WorkspaceTrustEditor_1 = this; }
        static { this.ID = 'workbench.editor.workspaceTrust'; }
        constructor(telemetryService, themeService, storageService, workspaceService, extensionWorkbenchService, extensionManifestPropertiesService, instantiationService, workspaceTrustManagementService, configurationService, extensionEnablementService, productService, keybindingService) {
            super(WorkspaceTrustEditor_1.ID, telemetryService, themeService, storageService);
            this.workspaceService = workspaceService;
            this.extensionWorkbenchService = extensionWorkbenchService;
            this.extensionManifestPropertiesService = extensionManifestPropertiesService;
            this.instantiationService = instantiationService;
            this.workspaceTrustManagementService = workspaceTrustManagementService;
            this.configurationService = configurationService;
            this.extensionEnablementService = extensionEnablementService;
            this.productService = productService;
            this.keybindingService = keybindingService;
            this.rendering = false;
            this.rerenderDisposables = this._register(new lifecycle_1.DisposableStore());
            this.layoutParticipants = [];
        }
        createEditor(parent) {
            this.rootElement = (0, dom_1.append)(parent, (0, dom_1.$)('.workspace-trust-editor', { tabindex: '0' }));
            this.createHeaderElement(this.rootElement);
            const scrollableContent = (0, dom_1.$)('.workspace-trust-editor-body');
            this.bodyScrollBar = this._register(new scrollableElement_1.DomScrollableElement(scrollableContent, {
                horizontal: 2 /* ScrollbarVisibility.Hidden */,
                vertical: 1 /* ScrollbarVisibility.Auto */,
            }));
            (0, dom_1.append)(this.rootElement, this.bodyScrollBar.getDomNode());
            this.createAffectedFeaturesElement(scrollableContent);
            this.createConfigurationElement(scrollableContent);
            this.rootElement.style.setProperty('--workspace-trust-selected-color', (0, colorRegistry_1.asCssVariable)(colorRegistry_1.buttonBackground));
            this.rootElement.style.setProperty('--workspace-trust-unselected-color', (0, colorRegistry_1.asCssVariable)(colorRegistry_1.buttonSecondaryBackground));
            this.rootElement.style.setProperty('--workspace-trust-check-color', (0, colorRegistry_1.asCssVariable)(debugColors_1.debugIconStartForeground));
            this.rootElement.style.setProperty('--workspace-trust-x-color', (0, colorRegistry_1.asCssVariable)(colorRegistry_1.editorErrorForeground));
            // Navigate page with keyboard
            this._register((0, dom_1.addDisposableListener)(this.rootElement, dom_1.EventType.KEY_DOWN, e => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.equals(16 /* KeyCode.UpArrow */) || event.equals(18 /* KeyCode.DownArrow */)) {
                    const navOrder = [this.headerContainer, this.trustedContainer, this.untrustedContainer, this.configurationContainer];
                    const currentIndex = navOrder.findIndex(element => {
                        return (0, dom_1.isAncestor)(document.activeElement, element);
                    });
                    let newIndex = currentIndex;
                    if (event.equals(18 /* KeyCode.DownArrow */)) {
                        newIndex++;
                    }
                    else if (event.equals(16 /* KeyCode.UpArrow */)) {
                        newIndex = Math.max(0, newIndex);
                        newIndex--;
                    }
                    newIndex += navOrder.length;
                    newIndex %= navOrder.length;
                    navOrder[newIndex].focus();
                }
                else if (event.equals(9 /* KeyCode.Escape */)) {
                    this.rootElement.focus();
                }
                else if (event.equals(2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */)) {
                    if (this.workspaceTrustManagementService.canSetWorkspaceTrust()) {
                        this.workspaceTrustManagementService.setWorkspaceTrust(!this.workspaceTrustManagementService.isWorkspaceTrusted());
                    }
                }
                else if (event.equals(2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */)) {
                    if (this.workspaceTrustManagementService.canSetParentFolderTrust()) {
                        this.workspaceTrustManagementService.setParentFolderTrust(true);
                    }
                }
            }));
        }
        focus() {
            this.rootElement.focus();
        }
        async setInput(input, options, context, token) {
            await super.setInput(input, options, context, token);
            if (token.isCancellationRequested) {
                return;
            }
            await this.workspaceTrustManagementService.workspaceTrustInitialized;
            this.registerListeners();
            await this.render();
        }
        registerListeners() {
            this._register(this.extensionWorkbenchService.onChange(() => this.render()));
            this._register(this.configurationService.onDidChangeRestrictedSettings(() => this.render()));
            this._register(this.workspaceTrustManagementService.onDidChangeTrust(() => this.render()));
            this._register(this.workspaceTrustManagementService.onDidChangeTrustedFolders(() => this.render()));
        }
        getHeaderContainerClass(trusted) {
            if (trusted) {
                return 'workspace-trust-header workspace-trust-trusted';
            }
            return 'workspace-trust-header workspace-trust-untrusted';
        }
        getHeaderTitleText(trusted) {
            if (trusted) {
                if (this.workspaceTrustManagementService.isWorkspaceTrustForced()) {
                    return (0, nls_1.localize)('trustedUnsettableWindow', "This window is trusted");
                }
                switch (this.workspaceService.getWorkbenchState()) {
                    case 1 /* WorkbenchState.EMPTY */:
                        return (0, nls_1.localize)('trustedHeaderWindow', "You trust this window");
                    case 2 /* WorkbenchState.FOLDER */:
                        return (0, nls_1.localize)('trustedHeaderFolder', "You trust this folder");
                    case 3 /* WorkbenchState.WORKSPACE */:
                        return (0, nls_1.localize)('trustedHeaderWorkspace', "You trust this workspace");
                }
            }
            return (0, nls_1.localize)('untrustedHeader', "You are in Restricted Mode");
        }
        getHeaderTitleIconClassNames(trusted) {
            return themables_1.ThemeIcon.asClassNameArray(exports.shieldIcon);
        }
        getFeaturesHeaderText(trusted) {
            let title = '';
            let subTitle = '';
            switch (this.workspaceService.getWorkbenchState()) {
                case 1 /* WorkbenchState.EMPTY */: {
                    title = trusted ? (0, nls_1.localize)('trustedWindow', "In a Trusted Window") : (0, nls_1.localize)('untrustedWorkspace', "In Restricted Mode");
                    subTitle = trusted ? (0, nls_1.localize)('trustedWindowSubtitle', "You trust the authors of the files in the current window. All features are enabled:") :
                        (0, nls_1.localize)('untrustedWindowSubtitle', "You do not trust the authors of the files in the current window. The following features are disabled:");
                    break;
                }
                case 2 /* WorkbenchState.FOLDER */: {
                    title = trusted ? (0, nls_1.localize)('trustedFolder', "In a Trusted Folder") : (0, nls_1.localize)('untrustedWorkspace', "In Restricted Mode");
                    subTitle = trusted ? (0, nls_1.localize)('trustedFolderSubtitle', "You trust the authors of the files in the current folder. All features are enabled:") :
                        (0, nls_1.localize)('untrustedFolderSubtitle', "You do not trust the authors of the files in the current folder. The following features are disabled:");
                    break;
                }
                case 3 /* WorkbenchState.WORKSPACE */: {
                    title = trusted ? (0, nls_1.localize)('trustedWorkspace', "In a Trusted Workspace") : (0, nls_1.localize)('untrustedWorkspace', "In Restricted Mode");
                    subTitle = trusted ? (0, nls_1.localize)('trustedWorkspaceSubtitle', "You trust the authors of the files in the current workspace. All features are enabled:") :
                        (0, nls_1.localize)('untrustedWorkspaceSubtitle', "You do not trust the authors of the files in the current workspace. The following features are disabled:");
                    break;
                }
            }
            return [title, subTitle];
        }
        async render() {
            if (this.rendering) {
                return;
            }
            this.rendering = true;
            this.rerenderDisposables.clear();
            const isWorkspaceTrusted = this.workspaceTrustManagementService.isWorkspaceTrusted();
            this.rootElement.classList.toggle('trusted', isWorkspaceTrusted);
            this.rootElement.classList.toggle('untrusted', !isWorkspaceTrusted);
            // Header Section
            this.headerTitleText.innerText = this.getHeaderTitleText(isWorkspaceTrusted);
            this.headerTitleIcon.className = 'workspace-trust-title-icon';
            this.headerTitleIcon.classList.add(...this.getHeaderTitleIconClassNames(isWorkspaceTrusted));
            this.headerDescription.innerText = '';
            const headerDescriptionText = (0, dom_1.append)(this.headerDescription, (0, dom_1.$)('div'));
            headerDescriptionText.innerText = isWorkspaceTrusted ?
                (0, nls_1.localize)('trustedDescription', "All features are enabled because trust has been granted to the workspace.") :
                (0, nls_1.localize)('untrustedDescription', "{0} is in a restricted mode intended for safe code browsing.", this.productService.nameShort);
            const headerDescriptionActions = (0, dom_1.append)(this.headerDescription, (0, dom_1.$)('div'));
            const headerDescriptionActionsText = (0, nls_1.localize)({ key: 'workspaceTrustEditorHeaderActions', comment: ['Please ensure the markdown link syntax is not broken up with whitespace [text block](link block)'] }, "[Configure your settings]({0}) or [learn more](https://aka.ms/vscode-workspace-trust).", `command:workbench.trust.configure`);
            for (const node of (0, linkedText_1.parseLinkedText)(headerDescriptionActionsText).nodes) {
                if (typeof node === 'string') {
                    (0, dom_1.append)(headerDescriptionActions, document.createTextNode(node));
                }
                else {
                    this.rerenderDisposables.add(this.instantiationService.createInstance(link_1.Link, headerDescriptionActions, { ...node, tabIndex: -1 }, {}));
                }
            }
            this.headerContainer.className = this.getHeaderContainerClass(isWorkspaceTrusted);
            this.rootElement.setAttribute('aria-label', `${(0, nls_1.localize)('root element label', "Manage Workspace Trust")}:  ${this.headerContainer.innerText}`);
            // Settings
            const restrictedSettings = this.configurationService.restrictedSettings;
            const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
            const settingsRequiringTrustedWorkspaceCount = restrictedSettings.default.filter(key => {
                const property = configurationRegistry.getConfigurationProperties()[key];
                // cannot be configured in workspace
                if (property.scope === 1 /* ConfigurationScope.APPLICATION */ || property.scope === 2 /* ConfigurationScope.MACHINE */) {
                    return false;
                }
                // If deprecated include only those configured in the workspace
                if (property.deprecationMessage || property.markdownDeprecationMessage) {
                    if (restrictedSettings.workspace?.includes(key)) {
                        return true;
                    }
                    if (restrictedSettings.workspaceFolder) {
                        for (const workspaceFolderSettings of restrictedSettings.workspaceFolder.values()) {
                            if (workspaceFolderSettings.includes(key)) {
                                return true;
                            }
                        }
                    }
                    return false;
                }
                return true;
            }).length;
            // Features List
            this.renderAffectedFeatures(settingsRequiringTrustedWorkspaceCount, this.getExtensionCount());
            // Configuration Tree
            this.workspaceTrustedUrisTable.updateTable();
            this.bodyScrollBar.getDomNode().style.height = `calc(100% - ${this.headerContainer.clientHeight}px)`;
            this.bodyScrollBar.scanDomNode();
            this.rendering = false;
        }
        getExtensionCount() {
            const set = new Set();
            const inVirtualWorkspace = (0, virtualWorkspace_1.isVirtualWorkspace)(this.workspaceService.getWorkspace());
            const localExtensions = this.extensionWorkbenchService.local.filter(ext => ext.local).map(ext => ext.local);
            for (const extension of localExtensions) {
                const enablementState = this.extensionEnablementService.getEnablementState(extension);
                if (enablementState !== 8 /* EnablementState.EnabledGlobally */ && enablementState !== 9 /* EnablementState.EnabledWorkspace */ &&
                    enablementState !== 0 /* EnablementState.DisabledByTrustRequirement */ && enablementState !== 5 /* EnablementState.DisabledByExtensionDependency */) {
                    continue;
                }
                if (inVirtualWorkspace && this.extensionManifestPropertiesService.getExtensionVirtualWorkspaceSupportType(extension.manifest) === false) {
                    continue;
                }
                if (this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(extension.manifest) !== true) {
                    set.add(extension.identifier.id);
                    continue;
                }
                const dependencies = (0, extensionManagementUtil_1.getExtensionDependencies)(localExtensions, extension);
                if (dependencies.some(ext => this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(ext.manifest) === false)) {
                    set.add(extension.identifier.id);
                }
            }
            return set.size;
        }
        createHeaderElement(parent) {
            this.headerContainer = (0, dom_1.append)(parent, (0, dom_1.$)('.workspace-trust-header', { tabIndex: '0' }));
            this.headerTitleContainer = (0, dom_1.append)(this.headerContainer, (0, dom_1.$)('.workspace-trust-title'));
            this.headerTitleIcon = (0, dom_1.append)(this.headerTitleContainer, (0, dom_1.$)('.workspace-trust-title-icon'));
            this.headerTitleText = (0, dom_1.append)(this.headerTitleContainer, (0, dom_1.$)('.workspace-trust-title-text'));
            this.headerDescription = (0, dom_1.append)(this.headerContainer, (0, dom_1.$)('.workspace-trust-description'));
        }
        createConfigurationElement(parent) {
            this.configurationContainer = (0, dom_1.append)(parent, (0, dom_1.$)('.workspace-trust-settings', { tabIndex: '0' }));
            const configurationTitle = (0, dom_1.append)(this.configurationContainer, (0, dom_1.$)('.workspace-trusted-folders-title'));
            configurationTitle.innerText = (0, nls_1.localize)('trustedFoldersAndWorkspaces', "Trusted Folders & Workspaces");
            this.workspaceTrustedUrisTable = this._register(this.instantiationService.createInstance(WorkspaceTrustedUrisTable, this.configurationContainer));
        }
        createAffectedFeaturesElement(parent) {
            this.affectedFeaturesContainer = (0, dom_1.append)(parent, (0, dom_1.$)('.workspace-trust-features'));
            this.trustedContainer = (0, dom_1.append)(this.affectedFeaturesContainer, (0, dom_1.$)('.workspace-trust-limitations.trusted', { tabIndex: '0' }));
            this.untrustedContainer = (0, dom_1.append)(this.affectedFeaturesContainer, (0, dom_1.$)('.workspace-trust-limitations.untrusted', { tabIndex: '0' }));
        }
        async renderAffectedFeatures(numSettings, numExtensions) {
            (0, dom_1.clearNode)(this.trustedContainer);
            (0, dom_1.clearNode)(this.untrustedContainer);
            // Trusted features
            const [trustedTitle, trustedSubTitle] = this.getFeaturesHeaderText(true);
            this.renderLimitationsHeaderElement(this.trustedContainer, trustedTitle, trustedSubTitle);
            const trustedContainerItems = this.workspaceService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */ ?
                [
                    (0, nls_1.localize)('trustedTasks', "Tasks are allowed to run"),
                    (0, nls_1.localize)('trustedDebugging', "Debugging is enabled"),
                    (0, nls_1.localize)('trustedExtensions', "All enabled extensions are activated")
                ] :
                [
                    (0, nls_1.localize)('trustedTasks', "Tasks are allowed to run"),
                    (0, nls_1.localize)('trustedDebugging', "Debugging is enabled"),
                    (0, nls_1.localize)('trustedSettings', "All workspace settings are applied"),
                    (0, nls_1.localize)('trustedExtensions', "All enabled extensions are activated")
                ];
            this.renderLimitationsListElement(this.trustedContainer, trustedContainerItems, themables_1.ThemeIcon.asClassNameArray(checkListIcon));
            // Restricted Mode features
            const [untrustedTitle, untrustedSubTitle] = this.getFeaturesHeaderText(false);
            this.renderLimitationsHeaderElement(this.untrustedContainer, untrustedTitle, untrustedSubTitle);
            const untrustedContainerItems = this.workspaceService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */ ?
                [
                    (0, nls_1.localize)('untrustedTasks', "Tasks are not allowed to run"),
                    (0, nls_1.localize)('untrustedDebugging', "Debugging is disabled"),
                    fixBadLocalizedLinks((0, nls_1.localize)({ key: 'untrustedExtensions', comment: ['Please ensure the markdown link syntax is not broken up with whitespace [text block](link block)'] }, "[{0} extensions]({1}) are disabled or have limited functionality", numExtensions, `command:${extensions_1.LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID}`))
                ] :
                [
                    (0, nls_1.localize)('untrustedTasks', "Tasks are not allowed to run"),
                    (0, nls_1.localize)('untrustedDebugging', "Debugging is disabled"),
                    fixBadLocalizedLinks(numSettings ? (0, nls_1.localize)({ key: 'untrustedSettings', comment: ['Please ensure the markdown link syntax is not broken up with whitespace [text block](link block)'] }, "[{0} workspace settings]({1}) are not applied", numSettings, 'command:settings.filterUntrusted') : (0, nls_1.localize)('no untrustedSettings', "Workspace settings requiring trust are not applied")),
                    fixBadLocalizedLinks((0, nls_1.localize)({ key: 'untrustedExtensions', comment: ['Please ensure the markdown link syntax is not broken up with whitespace [text block](link block)'] }, "[{0} extensions]({1}) are disabled or have limited functionality", numExtensions, `command:${extensions_1.LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID}`))
                ];
            this.renderLimitationsListElement(this.untrustedContainer, untrustedContainerItems, themables_1.ThemeIcon.asClassNameArray(xListIcon));
            if (this.workspaceTrustManagementService.isWorkspaceTrusted()) {
                if (this.workspaceTrustManagementService.canSetWorkspaceTrust()) {
                    this.addDontTrustButtonToElement(this.untrustedContainer);
                }
                else {
                    this.addTrustedTextToElement(this.untrustedContainer);
                }
            }
            else {
                if (this.workspaceTrustManagementService.canSetWorkspaceTrust()) {
                    this.addTrustButtonToElement(this.trustedContainer);
                }
            }
        }
        createButtonRow(parent, buttonInfo, enabled) {
            const buttonRow = (0, dom_1.append)(parent, (0, dom_1.$)('.workspace-trust-buttons-row'));
            const buttonContainer = (0, dom_1.append)(buttonRow, (0, dom_1.$)('.workspace-trust-buttons'));
            const buttonBar = this.rerenderDisposables.add(new button_1.ButtonBar(buttonContainer));
            for (const { action, keybinding } of buttonInfo) {
                const button = buttonBar.addButtonWithDescription(defaultStyles_1.defaultButtonStyles);
                button.label = action.label;
                button.enabled = enabled !== undefined ? enabled : action.enabled;
                button.description = keybinding.getLabel();
                button.element.ariaLabel = action.label + ', ' + (0, nls_1.localize)('keyboardShortcut', "Keyboard Shortcut: {0}", keybinding.getAriaLabel());
                this.rerenderDisposables.add(button.onDidClick(e => {
                    if (e) {
                        dom_1.EventHelper.stop(e, true);
                    }
                    action.run();
                }));
            }
        }
        addTrustButtonToElement(parent) {
            const trustAction = new actions_1.Action('workspace.trust.button.action.grant', (0, nls_1.localize)('trustButton', "Trust"), undefined, true, async () => {
                await this.workspaceTrustManagementService.setWorkspaceTrust(true);
            });
            const trustActions = [{ action: trustAction, keybinding: this.keybindingService.resolveUserBinding(platform_2.isMacintosh ? 'Cmd+Enter' : 'Ctrl+Enter')[0] }];
            if (this.workspaceTrustManagementService.canSetParentFolderTrust()) {
                const workspaceIdentifier = (0, workspace_1.toWorkspaceIdentifier)(this.workspaceService.getWorkspace());
                const name = (0, resources_1.basename)((0, resources_1.dirname)(workspaceIdentifier.uri));
                const trustMessageElement = (0, dom_1.append)(parent, (0, dom_1.$)('.trust-message-box'));
                trustMessageElement.innerText = (0, nls_1.localize)('trustMessage', "Trust the authors of all files in the current folder or its parent '{0}'.", name);
                const trustParentAction = new actions_1.Action('workspace.trust.button.action.grantParent', (0, nls_1.localize)('trustParentButton', "Trust Parent"), undefined, true, async () => {
                    await this.workspaceTrustManagementService.setParentFolderTrust(true);
                });
                trustActions.push({ action: trustParentAction, keybinding: this.keybindingService.resolveUserBinding(platform_2.isMacintosh ? 'Cmd+Shift+Enter' : 'Ctrl+Shift+Enter')[0] });
            }
            this.createButtonRow(parent, trustActions);
        }
        addDontTrustButtonToElement(parent) {
            this.createButtonRow(parent, [{
                    action: new actions_1.Action('workspace.trust.button.action.deny', (0, nls_1.localize)('dontTrustButton', "Don't Trust"), undefined, true, async () => {
                        await this.workspaceTrustManagementService.setWorkspaceTrust(false);
                    }),
                    keybinding: this.keybindingService.resolveUserBinding(platform_2.isMacintosh ? 'Cmd+Enter' : 'Ctrl+Enter')[0]
                }]);
        }
        addTrustedTextToElement(parent) {
            if (this.workspaceService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */) {
                return;
            }
            const textElement = (0, dom_1.append)(parent, (0, dom_1.$)('.workspace-trust-untrusted-description'));
            if (!this.workspaceTrustManagementService.isWorkspaceTrustForced()) {
                textElement.innerText = this.workspaceService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */ ? (0, nls_1.localize)('untrustedWorkspaceReason', "This workspace is trusted via the bolded entries in the trusted folders below.") : (0, nls_1.localize)('untrustedFolderReason', "This folder is trusted via the bolded entries in the the trusted folders below.");
            }
            else {
                textElement.innerText = (0, nls_1.localize)('trustedForcedReason', "This window is trusted by nature of the workspace that is opened.");
            }
        }
        renderLimitationsHeaderElement(parent, headerText, subtitleText) {
            const limitationsHeaderContainer = (0, dom_1.append)(parent, (0, dom_1.$)('.workspace-trust-limitations-header'));
            const titleElement = (0, dom_1.append)(limitationsHeaderContainer, (0, dom_1.$)('.workspace-trust-limitations-title'));
            const textElement = (0, dom_1.append)(titleElement, (0, dom_1.$)('.workspace-trust-limitations-title-text'));
            const subtitleElement = (0, dom_1.append)(limitationsHeaderContainer, (0, dom_1.$)('.workspace-trust-limitations-subtitle'));
            textElement.innerText = headerText;
            subtitleElement.innerText = subtitleText;
        }
        renderLimitationsListElement(parent, limitations, iconClassNames) {
            const listContainer = (0, dom_1.append)(parent, (0, dom_1.$)('.workspace-trust-limitations-list-container'));
            const limitationsList = (0, dom_1.append)(listContainer, (0, dom_1.$)('ul'));
            for (const limitation of limitations) {
                const limitationListItem = (0, dom_1.append)(limitationsList, (0, dom_1.$)('li'));
                const icon = (0, dom_1.append)(limitationListItem, (0, dom_1.$)('.list-item-icon'));
                const text = (0, dom_1.append)(limitationListItem, (0, dom_1.$)('.list-item-text'));
                icon.classList.add(...iconClassNames);
                const linkedText = (0, linkedText_1.parseLinkedText)(limitation);
                for (const node of linkedText.nodes) {
                    if (typeof node === 'string') {
                        (0, dom_1.append)(text, document.createTextNode(node));
                    }
                    else {
                        this.rerenderDisposables.add(this.instantiationService.createInstance(link_1.Link, text, { ...node, tabIndex: -1 }, {}));
                    }
                }
            }
        }
        layout(dimension) {
            if (!this.isVisible()) {
                return;
            }
            this.workspaceTrustedUrisTable.layout();
            this.layoutParticipants.forEach(participant => {
                participant.layout();
            });
            this.bodyScrollBar.scanDomNode();
        }
    };
    exports.WorkspaceTrustEditor = WorkspaceTrustEditor;
    __decorate([
        (0, decorators_1.debounce)(100)
    ], WorkspaceTrustEditor.prototype, "render", null);
    exports.WorkspaceTrustEditor = WorkspaceTrustEditor = WorkspaceTrustEditor_1 = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, themeService_1.IThemeService),
        __param(2, storage_1.IStorageService),
        __param(3, workspace_1.IWorkspaceContextService),
        __param(4, extensions_1.IExtensionsWorkbenchService),
        __param(5, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(8, configuration_1.IWorkbenchConfigurationService),
        __param(9, extensionManagement_1.IWorkbenchExtensionEnablementService),
        __param(10, productService_1.IProductService),
        __param(11, keybinding_1.IKeybindingService)
    ], WorkspaceTrustEditor);
    // Highly scoped fix for #126614
    function fixBadLocalizedLinks(badString) {
        const regex = /(.*)\[(.+)\]\s*\((.+)\)(.*)/; // markdown link match with spaces
        return badString.replace(regex, '$1[$2]($3)$4');
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlVHJ1c3RFZGl0b3IuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi93b3Jrc3BhY2UvYnJvd3Nlci93b3Jrc3BhY2VUcnVzdEVkaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBMkRuRixRQUFBLFVBQVUsR0FBRyxJQUFBLDJCQUFZLEVBQUMsd0JBQXdCLEVBQUUsa0JBQU8sQ0FBQyxNQUFNLEVBQUUsSUFBQSxjQUFRLEVBQUMsWUFBWSxFQUFFLDBDQUEwQyxDQUFDLENBQUMsQ0FBQztJQUVySixNQUFNLGFBQWEsR0FBRyxJQUFBLDJCQUFZLEVBQUMsOEJBQThCLEVBQUUsa0JBQU8sQ0FBQyxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsZUFBZSxFQUFFLHVEQUF1RCxDQUFDLENBQUMsQ0FBQztJQUN0SyxNQUFNLFNBQVMsR0FBRyxJQUFBLDJCQUFZLEVBQUMsOEJBQThCLEVBQUUsa0JBQU8sQ0FBQyxDQUFDLEVBQUUsSUFBQSxjQUFRLEVBQUMsV0FBVyxFQUFFLG1EQUFtRCxDQUFDLENBQUMsQ0FBQztJQUN0SixNQUFNLGdCQUFnQixHQUFHLElBQUEsMkJBQVksRUFBQyxzQ0FBc0MsRUFBRSxrQkFBTyxDQUFDLE1BQU0sRUFBRSxJQUFBLGNBQVEsRUFBQyxrQkFBa0IsRUFBRSw4REFBOEQsQ0FBQyxDQUFDLENBQUM7SUFDNUwsTUFBTSxRQUFRLEdBQUcsSUFBQSwyQkFBWSxFQUFDLG9DQUFvQyxFQUFFLGtCQUFPLENBQUMsSUFBSSxFQUFFLElBQUEsY0FBUSxFQUFDLFVBQVUsRUFBRSw4REFBOEQsQ0FBQyxDQUFDLENBQUM7SUFDeEssTUFBTSxVQUFVLEdBQUcsSUFBQSwyQkFBWSxFQUFDLHNDQUFzQyxFQUFFLGtCQUFPLENBQUMsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLFlBQVks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