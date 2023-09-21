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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/button/button", "vs/base/browser/ui/inputbox/inputBox", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/actions", "vs/base/common/codicons", "vs/base/common/decorators", "vs/base/common/event", "vs/base/common/labels", "vs/base/common/lifecycle", "vs/base/common/linkedText", "vs/base/common/network", "vs/base/common/uri", "vs/nls!vs/workbench/contrib/workspace/browser/workspaceTrustEditor", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextview/browser/contextView", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/instantiation", "vs/platform/label/common/label", "vs/platform/list/browser/listService", "vs/platform/opener/browser/link", "vs/platform/registry/common/platform", "vs/platform/workspace/common/virtualWorkspace", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/workspace/common/workspace", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/contrib/debug/browser/debugColors", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/services/configuration/common/configuration", "vs/workbench/services/extensions/common/extensionManifestPropertiesService", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/base/common/path", "vs/base/common/extpath", "vs/base/browser/keyboardEvent", "vs/platform/product/common/productService", "vs/platform/theme/common/iconRegistry", "vs/platform/theme/browser/defaultStyles", "vs/base/common/platform", "vs/platform/keybinding/common/keybinding", "vs/base/common/resources"], function (require, exports, dom_1, actionbar_1, button_1, inputBox_1, scrollableElement_1, actions_1, codicons_1, decorators_1, event_1, labels_1, lifecycle_1, linkedText_1, network_1, uri_1, nls_1, configurationRegistry_1, contextView_1, dialogs_1, instantiation_1, label_1, listService_1, link_1, platform_1, virtualWorkspace_1, storage_1, telemetry_1, colorRegistry_1, workspace_1, themeService_1, themables_1, workspaceTrust_1, editorPane_1, debugColors_1, extensions_1, configuration_1, extensionManifestPropertiesService_1, uriIdentity_1, extensionManagementUtil_1, extensionManagement_1, path_1, extpath_1, keyboardEvent_1, productService_1, iconRegistry_1, defaultStyles_1, platform_2, keybinding_1, resources_1) {
    "use strict";
    var TrustedUriActionsColumnRenderer_1, TrustedUriPathColumnRenderer_1, TrustedUriHostColumnRenderer_1, $J1b_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$J1b = exports.$I1b = void 0;
    exports.$I1b = (0, iconRegistry_1.$9u)('workspace-trust-banner', codicons_1.$Pj.shield, (0, nls_1.localize)(0, null));
    const checkListIcon = (0, iconRegistry_1.$9u)('workspace-trust-editor-check', codicons_1.$Pj.check, (0, nls_1.localize)(1, null));
    const xListIcon = (0, iconRegistry_1.$9u)('workspace-trust-editor-cross', codicons_1.$Pj.x, (0, nls_1.localize)(2, null));
    const folderPickerIcon = (0, iconRegistry_1.$9u)('workspace-trust-editor-folder-picker', codicons_1.$Pj.folder, (0, nls_1.localize)(3, null));
    const editIcon = (0, iconRegistry_1.$9u)('workspace-trust-editor-edit-folder', codicons_1.$Pj.edit, (0, nls_1.localize)(4, null));
    const removeIcon = (0, iconRegistry_1.$9u)('workspace-trust-editor-remove-folder', codicons_1.$Pj.close, (0, nls_1.localize)(5, null));
    let WorkspaceTrustedUrisTable = class WorkspaceTrustedUrisTable extends lifecycle_1.$kc {
        constructor(n, r, t, w, y, z, C) {
            super();
            this.n = n;
            this.r = r;
            this.t = t;
            this.w = w;
            this.y = y;
            this.z = z;
            this.C = C;
            this.c = this.B(new event_1.$fd());
            this.onDidAcceptEdit = this.c.event;
            this.f = this.B(new event_1.$fd());
            this.onDidRejectEdit = this.f.event;
            this.g = this.B(new event_1.$fd());
            this.onEdit = this.g.event;
            this.h = this.B(new event_1.$fd());
            this.onDelete = this.h.event;
            this.m = n.appendChild((0, dom_1.$)('.workspace-trusted-folders-description'));
            const tableElement = n.appendChild((0, dom_1.$)('.trusted-uris-table'));
            const addButtonBarElement = n.appendChild((0, dom_1.$)('.trusted-uris-button-bar'));
            this.j = this.r.createInstance(listService_1.$r4, 'WorkspaceTrust', tableElement, new TrustedUriTableVirtualDelegate(), [
                {
                    label: (0, nls_1.localize)(6, null),
                    tooltip: '',
                    weight: 1,
                    templateId: TrustedUriHostColumnRenderer.TEMPLATE_ID,
                    project(row) { return row; }
                },
                {
                    label: (0, nls_1.localize)(7, null),
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
                this.r.createInstance(TrustedUriHostColumnRenderer),
                this.r.createInstance(TrustedUriPathColumnRenderer, this),
                this.r.createInstance(TrustedUriActionsColumnRenderer, this, this.G),
            ], {
                horizontalScrolling: false,
                alwaysConsumeMouseWheel: false,
                openOnSingleClick: false,
                multipleSelectionSupport: false,
                accessibilityProvider: {
                    getAriaLabel: (item) => {
                        const hostLabel = getHostLabel(this.z, item);
                        if (hostLabel === undefined || hostLabel.length === 0) {
                            return (0, nls_1.localize)(8, null, this.z.getUriLabel(item.uri));
                        }
                        return (0, nls_1.localize)(9, null, this.z.getUriLabel(item.uri), hostLabel);
                    },
                    getWidgetAriaLabel: () => (0, nls_1.localize)(10, null)
                }
            });
            this.B(this.j.onDidOpen(item => {
                // default prevented when input box is double clicked #125052
                if (item && item.element && !item.browserEvent?.defaultPrevented) {
                    this.edit(item.element, true);
                }
            }));
            const buttonBar = this.B(new button_1.$0Q(addButtonBarElement));
            const addButton = this.B(buttonBar.addButton({ title: (0, nls_1.localize)(11, null), ...defaultStyles_1.$i2 }));
            addButton.label = (0, nls_1.localize)(12, null);
            this.B(addButton.onDidClick(async () => {
                const uri = await this.C.showOpenDialog({
                    canSelectFiles: false,
                    canSelectFolders: true,
                    canSelectMany: false,
                    defaultUri: this.G,
                    openLabel: (0, nls_1.localize)(13, null),
                    title: (0, nls_1.localize)(14, null)
                });
                if (uri) {
                    this.w.setUrisTrust(uri, true);
                }
            }));
            this.B(this.w.onDidChangeTrustedFolders(() => {
                this.updateTable();
            }));
        }
        D(item) {
            const index = this.H.indexOf(item);
            if (index === -1) {
                for (let i = 0; i < this.H.length; i++) {
                    if (this.H[i].uri === item.uri) {
                        return i;
                    }
                }
            }
            return index;
        }
        F(item, focus = true) {
            const index = this.D(item);
            if (index !== -1) {
                if (focus) {
                    this.j.domFocus();
                    this.j.setFocus([index]);
                }
                this.j.setSelection([index]);
            }
        }
        get G() {
            return this.t.getWorkspace().folders[0]?.uri || uri_1.URI.file('/');
        }
        get H() {
            const currentWorkspace = this.t.getWorkspace();
            const currentWorkspaceUris = currentWorkspace.folders.map(folder => folder.uri);
            if (currentWorkspace.configuration) {
                currentWorkspaceUris.push(currentWorkspace.configuration);
            }
            const entries = this.w.getTrustedUris().map(uri => {
                let relatedToCurrentWorkspace = false;
                for (const workspaceUri of currentWorkspaceUris) {
                    relatedToCurrentWorkspace = relatedToCurrentWorkspace || this.y.extUri.isEqualOrParent(workspaceUri, uri);
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
            this.j.layout((this.H.length * TrustedUriTableVirtualDelegate.ROW_HEIGHT) + TrustedUriTableVirtualDelegate.HEADER_ROW_HEIGHT, undefined);
        }
        updateTable() {
            const entries = this.H;
            this.n.classList.toggle('empty', entries.length === 0);
            this.m.innerText = entries.length ?
                (0, nls_1.localize)(15, null) :
                (0, nls_1.localize)(16, null);
            this.j.splice(0, Number.POSITIVE_INFINITY, this.H);
            this.layout();
        }
        validateUri(path, item) {
            if (!item) {
                return null;
            }
            if (item.uri.scheme === 'vscode-vfs') {
                const segments = path.split(path_1.$6d.sep).filter(s => s.length);
                if (segments.length === 0 && path.startsWith(path_1.$6d.sep)) {
                    return {
                        type: 2 /* MessageType.WARNING */,
                        content: (0, nls_1.localize)(17, null, getHostLabel(this.z, item))
                    };
                }
                if (segments.length === 1) {
                    return {
                        type: 2 /* MessageType.WARNING */,
                        content: (0, nls_1.localize)(18, null, segments[0], getHostLabel(this.z, item))
                    };
                }
                if (segments.length > 2) {
                    return {
                        type: 3 /* MessageType.ERROR */,
                        content: (0, nls_1.localize)(19, null, path)
                    };
                }
            }
            return null;
        }
        acceptEdit(item, uri) {
            const trustedFolders = this.w.getTrustedUris();
            const index = trustedFolders.findIndex(u => this.y.extUri.isEqual(u, item.uri));
            if (index >= trustedFolders.length || index === -1) {
                trustedFolders.push(uri);
            }
            else {
                trustedFolders[index] = uri;
            }
            this.w.setTrustedUris(trustedFolders);
            this.c.fire(item);
        }
        rejectEdit(item) {
            this.f.fire(item);
        }
        async delete(item) {
            await this.w.setUrisTrust([item.uri], false);
            this.h.fire(item);
        }
        async edit(item, usePickerIfPossible) {
            const canUseOpenDialog = item.uri.scheme === network_1.Schemas.file ||
                (item.uri.scheme === this.G.scheme &&
                    this.y.extUri.isEqualAuthority(this.G.authority, item.uri.authority) &&
                    !(0, virtualWorkspace_1.$tJ)(item.uri));
            if (canUseOpenDialog && usePickerIfPossible) {
                const uri = await this.C.showOpenDialog({
                    canSelectFiles: false,
                    canSelectFolders: true,
                    canSelectMany: false,
                    defaultUri: item.uri,
                    openLabel: (0, nls_1.localize)(20, null),
                    title: (0, nls_1.localize)(21, null)
                });
                if (uri) {
                    this.acceptEdit(item, uri[0]);
                }
                else {
                    this.rejectEdit(item);
                }
            }
            else {
                this.F(item);
                this.g.fire(item);
            }
        }
    };
    WorkspaceTrustedUrisTable = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, workspace_1.$Kh),
        __param(3, workspaceTrust_1.$$z),
        __param(4, uriIdentity_1.$Ck),
        __param(5, label_1.$Vz),
        __param(6, dialogs_1.$qA)
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
        constructor(c, d, f) {
            this.c = c;
            this.d = d;
            this.f = f;
            this.templateId = TrustedUriActionsColumnRenderer_1.TEMPLATE_ID;
        }
        renderTemplate(container) {
            const element = container.appendChild((0, dom_1.$)('.actions'));
            const actionBar = new actionbar_1.$1P(element, { animated: false });
            return { actionBar };
        }
        renderElement(item, index, templateData, height) {
            templateData.actionBar.clear();
            const canUseOpenDialog = item.uri.scheme === network_1.Schemas.file ||
                (item.uri.scheme === this.d.scheme &&
                    this.f.extUri.isEqualAuthority(this.d.authority, item.uri.authority) &&
                    !(0, virtualWorkspace_1.$tJ)(item.uri));
            const actions = [];
            if (canUseOpenDialog) {
                actions.push(this.h(item));
            }
            actions.push(this.g(item));
            actions.push(this.j(item));
            templateData.actionBar.push(actions, { icon: true });
        }
        g(item) {
            return {
                class: themables_1.ThemeIcon.asClassName(editIcon),
                enabled: true,
                id: 'editTrustedUri',
                tooltip: (0, nls_1.localize)(22, null),
                run: () => {
                    this.c.edit(item, false);
                }
            };
        }
        h(item) {
            return {
                class: themables_1.ThemeIcon.asClassName(folderPickerIcon),
                enabled: true,
                id: 'pickerTrustedUri',
                tooltip: (0, nls_1.localize)(23, null),
                run: () => {
                    this.c.edit(item, true);
                }
            };
        }
        j(item) {
            return {
                class: themables_1.ThemeIcon.asClassName(removeIcon),
                enabled: true,
                id: 'deleteTrustedUri',
                tooltip: (0, nls_1.localize)(24, null),
                run: async () => {
                    await this.c.delete(item);
                }
            };
        }
        disposeTemplate(templateData) {
            templateData.actionBar.dispose();
        }
    };
    TrustedUriActionsColumnRenderer = TrustedUriActionsColumnRenderer_1 = __decorate([
        __param(2, uriIdentity_1.$Ck)
    ], TrustedUriActionsColumnRenderer);
    let TrustedUriPathColumnRenderer = class TrustedUriPathColumnRenderer {
        static { TrustedUriPathColumnRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'path'; }
        constructor(d, f) {
            this.d = d;
            this.f = f;
            this.templateId = TrustedUriPathColumnRenderer_1.TEMPLATE_ID;
        }
        renderTemplate(container) {
            const element = container.appendChild((0, dom_1.$)('.path'));
            const pathLabel = element.appendChild((0, dom_1.$)('div.path-label'));
            const pathInput = new inputBox_1.$sR(element, this.f, {
                validationOptions: {
                    validation: value => this.d.validateUri(value, this.c)
                },
                inputBoxStyles: defaultStyles_1.$s2
            });
            const disposables = new lifecycle_1.$jc();
            const renderDisposables = disposables.add(new lifecycle_1.$jc());
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
            this.c = item;
            templateData.renderDisposables.add(this.d.onEdit(async (e) => {
                if (item === e) {
                    templateData.element.classList.add('input-mode');
                    templateData.pathInput.focus();
                    templateData.pathInput.select();
                    templateData.element.parentElement.style.paddingLeft = '0px';
                }
            }));
            // stop double click action from re-rendering the element on the table #125052
            templateData.renderDisposables.add((0, dom_1.$nO)(templateData.pathInput.element, dom_1.$3O.DBLCLICK, e => {
                dom_1.$5O.stop(e);
            }));
            const hideInputBox = () => {
                templateData.element.classList.remove('input-mode');
                templateData.element.parentElement.style.paddingLeft = '5px';
            };
            const accept = () => {
                hideInputBox();
                const pathToUse = templateData.pathInput.value;
                const uri = (0, extpath_1.$Mf)(pathToUse) ? item.uri.with({ path: path_1.$6d.sep + (0, extpath_1.$Cf)(pathToUse) }) : item.uri.with({ path: pathToUse });
                templateData.pathLabel.innerText = this.g(uri);
                if (uri) {
                    this.d.acceptEdit(item, uri);
                }
            };
            const reject = () => {
                hideInputBox();
                templateData.pathInput.value = stringValue;
                this.d.rejectEdit(item);
            };
            templateData.renderDisposables.add((0, dom_1.$oO)(templateData.pathInput.inputElement, dom_1.$3O.KEY_DOWN, e => {
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
            templateData.renderDisposables.add(((0, dom_1.$nO)(templateData.pathInput.inputElement, dom_1.$3O.BLUR, () => {
                reject();
            })));
            const stringValue = this.g(item.uri);
            templateData.pathInput.value = stringValue;
            templateData.pathLabel.innerText = stringValue;
            templateData.element.classList.toggle('current-workspace-parent', item.parentOfWorkspaceItem);
        }
        disposeTemplate(templateData) {
            templateData.disposables.dispose();
            templateData.renderDisposables.dispose();
        }
        g(uri) {
            if (uri.scheme === network_1.Schemas.file) {
                return (0, labels_1.$fA)(uri.fsPath);
            }
            // If the path is not a file uri, but points to a windows remote, we should create windows fs path
            // e.g. /c:/user/directory => C:\user\directory
            if (uri.path.startsWith(path_1.$6d.sep)) {
                const pathWithoutLeadingSeparator = uri.path.substring(1);
                const isWindowsPath = (0, extpath_1.$Mf)(pathWithoutLeadingSeparator, true);
                if (isWindowsPath) {
                    return (0, labels_1.$fA)(path_1.$5d.normalize(pathWithoutLeadingSeparator), true);
                }
            }
            return uri.path;
        }
    };
    TrustedUriPathColumnRenderer = TrustedUriPathColumnRenderer_1 = __decorate([
        __param(1, contextView_1.$VZ)
    ], TrustedUriPathColumnRenderer);
    function getHostLabel(labelService, item) {
        return item.uri.authority ? labelService.getHostLabel(item.uri.scheme, item.uri.authority) : (0, nls_1.localize)(25, null);
    }
    let TrustedUriHostColumnRenderer = class TrustedUriHostColumnRenderer {
        static { TrustedUriHostColumnRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'host'; }
        constructor(c) {
            this.c = c;
            this.templateId = TrustedUriHostColumnRenderer_1.TEMPLATE_ID;
        }
        renderTemplate(container) {
            const disposables = new lifecycle_1.$jc();
            const renderDisposables = disposables.add(new lifecycle_1.$jc());
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
            templateData.renderDisposables.add({ dispose: () => { (0, dom_1.$lO)(templateData.buttonBarContainer); } });
            templateData.hostContainer.innerText = getHostLabel(this.c, item);
            templateData.element.classList.toggle('current-workspace-parent', item.parentOfWorkspaceItem);
            templateData.hostContainer.style.display = '';
            templateData.buttonBarContainer.style.display = 'none';
        }
        disposeTemplate(templateData) {
            templateData.disposables.dispose();
        }
    };
    TrustedUriHostColumnRenderer = TrustedUriHostColumnRenderer_1 = __decorate([
        __param(0, label_1.$Vz)
    ], TrustedUriHostColumnRenderer);
    let $J1b = class $J1b extends editorPane_1.$0T {
        static { $J1b_1 = this; }
        static { this.ID = 'workbench.editor.workspaceTrust'; }
        constructor(telemetryService, themeService, storageService, jb, kb, lb, mb, nb, ob, pb, qb, rb) {
            super($J1b_1.ID, telemetryService, themeService, storageService);
            this.jb = jb;
            this.kb = kb;
            this.lb = lb;
            this.mb = mb;
            this.nb = nb;
            this.ob = ob;
            this.pb = pb;
            this.qb = qb;
            this.rb = rb;
            this.yb = false;
            this.zb = this.B(new lifecycle_1.$jc());
            this.Mb = [];
        }
        ab(parent) {
            this.c = (0, dom_1.$0O)(parent, (0, dom_1.$)('.workspace-trust-editor', { tabindex: '0' }));
            this.Cb(this.c);
            const scrollableContent = (0, dom_1.$)('.workspace-trust-editor-body');
            this.y = this.B(new scrollableElement_1.$UP(scrollableContent, {
                horizontal: 2 /* ScrollbarVisibility.Hidden */,
                vertical: 1 /* ScrollbarVisibility.Auto */,
            }));
            (0, dom_1.$0O)(this.c, this.y.getDomNode());
            this.Eb(scrollableContent);
            this.Db(scrollableContent);
            this.c.style.setProperty('--workspace-trust-selected-color', (0, colorRegistry_1.$pv)(colorRegistry_1.$0v));
            this.c.style.setProperty('--workspace-trust-unselected-color', (0, colorRegistry_1.$pv)(colorRegistry_1.$bw));
            this.c.style.setProperty('--workspace-trust-check-color', (0, colorRegistry_1.$pv)(debugColors_1.$Dnb));
            this.c.style.setProperty('--workspace-trust-x-color', (0, colorRegistry_1.$pv)(colorRegistry_1.$lw));
            // Navigate page with keyboard
            this.B((0, dom_1.$nO)(this.c, dom_1.$3O.KEY_DOWN, e => {
                const event = new keyboardEvent_1.$jO(e);
                if (event.equals(16 /* KeyCode.UpArrow */) || event.equals(18 /* KeyCode.DownArrow */)) {
                    const navOrder = [this.f, this.fb, this.gb, this.hb];
                    const currentIndex = navOrder.findIndex(element => {
                        return (0, dom_1.$NO)(document.activeElement, element);
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
                    this.c.focus();
                }
                else if (event.equals(2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */)) {
                    if (this.nb.canSetWorkspaceTrust()) {
                        this.nb.setWorkspaceTrust(!this.nb.isWorkspaceTrusted());
                    }
                }
                else if (event.equals(2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */)) {
                    if (this.nb.canSetParentFolderTrust()) {
                        this.nb.setParentFolderTrust(true);
                    }
                }
            }));
        }
        focus() {
            this.c.focus();
        }
        async setInput(input, options, context, token) {
            await super.setInput(input, options, context, token);
            if (token.isCancellationRequested) {
                return;
            }
            await this.nb.workspaceTrustInitialized;
            this.tb();
            await this.Ab();
        }
        tb() {
            this.B(this.kb.onChange(() => this.Ab()));
            this.B(this.ob.onDidChangeRestrictedSettings(() => this.Ab()));
            this.B(this.nb.onDidChangeTrust(() => this.Ab()));
            this.B(this.nb.onDidChangeTrustedFolders(() => this.Ab()));
        }
        ub(trusted) {
            if (trusted) {
                return 'workspace-trust-header workspace-trust-trusted';
            }
            return 'workspace-trust-header workspace-trust-untrusted';
        }
        vb(trusted) {
            if (trusted) {
                if (this.nb.isWorkspaceTrustForced()) {
                    return (0, nls_1.localize)(26, null);
                }
                switch (this.jb.getWorkbenchState()) {
                    case 1 /* WorkbenchState.EMPTY */:
                        return (0, nls_1.localize)(27, null);
                    case 2 /* WorkbenchState.FOLDER */:
                        return (0, nls_1.localize)(28, null);
                    case 3 /* WorkbenchState.WORKSPACE */:
                        return (0, nls_1.localize)(29, null);
                }
            }
            return (0, nls_1.localize)(30, null);
        }
        wb(trusted) {
            return themables_1.ThemeIcon.asClassNameArray(exports.$I1b);
        }
        xb(trusted) {
            let title = '';
            let subTitle = '';
            switch (this.jb.getWorkbenchState()) {
                case 1 /* WorkbenchState.EMPTY */: {
                    title = trusted ? (0, nls_1.localize)(31, null) : (0, nls_1.localize)(32, null);
                    subTitle = trusted ? (0, nls_1.localize)(33, null) :
                        (0, nls_1.localize)(34, null);
                    break;
                }
                case 2 /* WorkbenchState.FOLDER */: {
                    title = trusted ? (0, nls_1.localize)(35, null) : (0, nls_1.localize)(36, null);
                    subTitle = trusted ? (0, nls_1.localize)(37, null) :
                        (0, nls_1.localize)(38, null);
                    break;
                }
                case 3 /* WorkbenchState.WORKSPACE */: {
                    title = trusted ? (0, nls_1.localize)(39, null) : (0, nls_1.localize)(40, null);
                    subTitle = trusted ? (0, nls_1.localize)(41, null) :
                        (0, nls_1.localize)(42, null);
                    break;
                }
            }
            return [title, subTitle];
        }
        async Ab() {
            if (this.yb) {
                return;
            }
            this.yb = true;
            this.zb.clear();
            const isWorkspaceTrusted = this.nb.isWorkspaceTrusted();
            this.c.classList.toggle('trusted', isWorkspaceTrusted);
            this.c.classList.toggle('untrusted', !isWorkspaceTrusted);
            // Header Section
            this.m.innerText = this.vb(isWorkspaceTrusted);
            this.j.className = 'workspace-trust-title-icon';
            this.j.classList.add(...this.wb(isWorkspaceTrusted));
            this.r.innerText = '';
            const headerDescriptionText = (0, dom_1.$0O)(this.r, (0, dom_1.$)('div'));
            headerDescriptionText.innerText = isWorkspaceTrusted ?
                (0, nls_1.localize)(43, null) :
                (0, nls_1.localize)(44, null, this.qb.nameShort);
            const headerDescriptionActions = (0, dom_1.$0O)(this.r, (0, dom_1.$)('div'));
            const headerDescriptionActionsText = (0, nls_1.localize)(45, null, `command:workbench.trust.configure`);
            for (const node of (0, linkedText_1.$IS)(headerDescriptionActionsText).nodes) {
                if (typeof node === 'string') {
                    (0, dom_1.$0O)(headerDescriptionActions, document.createTextNode(node));
                }
                else {
                    this.zb.add(this.mb.createInstance(link_1.$40, headerDescriptionActions, { ...node, tabIndex: -1 }, {}));
                }
            }
            this.f.className = this.ub(isWorkspaceTrusted);
            this.c.setAttribute('aria-label', `${(0, nls_1.localize)(46, null)}:  ${this.f.innerText}`);
            // Settings
            const restrictedSettings = this.ob.restrictedSettings;
            const configurationRegistry = platform_1.$8m.as(configurationRegistry_1.$an.Configuration);
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
            this.Fb(settingsRequiringTrustedWorkspaceCount, this.Bb());
            // Configuration Tree
            this.ib.updateTable();
            this.y.getDomNode().style.height = `calc(100% - ${this.f.clientHeight}px)`;
            this.y.scanDomNode();
            this.yb = false;
        }
        Bb() {
            const set = new Set();
            const inVirtualWorkspace = (0, virtualWorkspace_1.$xJ)(this.jb.getWorkspace());
            const localExtensions = this.kb.local.filter(ext => ext.local).map(ext => ext.local);
            for (const extension of localExtensions) {
                const enablementState = this.pb.getEnablementState(extension);
                if (enablementState !== 8 /* EnablementState.EnabledGlobally */ && enablementState !== 9 /* EnablementState.EnabledWorkspace */ &&
                    enablementState !== 0 /* EnablementState.DisabledByTrustRequirement */ && enablementState !== 5 /* EnablementState.DisabledByExtensionDependency */) {
                    continue;
                }
                if (inVirtualWorkspace && this.lb.getExtensionVirtualWorkspaceSupportType(extension.manifest) === false) {
                    continue;
                }
                if (this.lb.getExtensionUntrustedWorkspaceSupportType(extension.manifest) !== true) {
                    set.add(extension.identifier.id);
                    continue;
                }
                const dependencies = (0, extensionManagementUtil_1.$zo)(localExtensions, extension);
                if (dependencies.some(ext => this.lb.getExtensionUntrustedWorkspaceSupportType(ext.manifest) === false)) {
                    set.add(extension.identifier.id);
                }
            }
            return set.size;
        }
        Cb(parent) {
            this.f = (0, dom_1.$0O)(parent, (0, dom_1.$)('.workspace-trust-header', { tabIndex: '0' }));
            this.g = (0, dom_1.$0O)(this.f, (0, dom_1.$)('.workspace-trust-title'));
            this.j = (0, dom_1.$0O)(this.g, (0, dom_1.$)('.workspace-trust-title-icon'));
            this.m = (0, dom_1.$0O)(this.g, (0, dom_1.$)('.workspace-trust-title-text'));
            this.r = (0, dom_1.$0O)(this.f, (0, dom_1.$)('.workspace-trust-description'));
        }
        Db(parent) {
            this.hb = (0, dom_1.$0O)(parent, (0, dom_1.$)('.workspace-trust-settings', { tabIndex: '0' }));
            const configurationTitle = (0, dom_1.$0O)(this.hb, (0, dom_1.$)('.workspace-trusted-folders-title'));
            configurationTitle.innerText = (0, nls_1.localize)(47, null);
            this.ib = this.B(this.mb.createInstance(WorkspaceTrustedUrisTable, this.hb));
        }
        Eb(parent) {
            this.eb = (0, dom_1.$0O)(parent, (0, dom_1.$)('.workspace-trust-features'));
            this.fb = (0, dom_1.$0O)(this.eb, (0, dom_1.$)('.workspace-trust-limitations.trusted', { tabIndex: '0' }));
            this.gb = (0, dom_1.$0O)(this.eb, (0, dom_1.$)('.workspace-trust-limitations.untrusted', { tabIndex: '0' }));
        }
        async Fb(numSettings, numExtensions) {
            (0, dom_1.$lO)(this.fb);
            (0, dom_1.$lO)(this.gb);
            // Trusted features
            const [trustedTitle, trustedSubTitle] = this.xb(true);
            this.Kb(this.fb, trustedTitle, trustedSubTitle);
            const trustedContainerItems = this.jb.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */ ?
                [
                    (0, nls_1.localize)(48, null),
                    (0, nls_1.localize)(49, null),
                    (0, nls_1.localize)(50, null)
                ] :
                [
                    (0, nls_1.localize)(51, null),
                    (0, nls_1.localize)(52, null),
                    (0, nls_1.localize)(53, null),
                    (0, nls_1.localize)(54, null)
                ];
            this.Lb(this.fb, trustedContainerItems, themables_1.ThemeIcon.asClassNameArray(checkListIcon));
            // Restricted Mode features
            const [untrustedTitle, untrustedSubTitle] = this.xb(false);
            this.Kb(this.gb, untrustedTitle, untrustedSubTitle);
            const untrustedContainerItems = this.jb.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */ ?
                [
                    (0, nls_1.localize)(55, null),
                    (0, nls_1.localize)(56, null),
                    fixBadLocalizedLinks((0, nls_1.localize)(57, null, numExtensions, `command:${extensions_1.$1fb}`))
                ] :
                [
                    (0, nls_1.localize)(58, null),
                    (0, nls_1.localize)(59, null),
                    fixBadLocalizedLinks(numSettings ? (0, nls_1.localize)(60, null, numSettings, 'command:settings.filterUntrusted') : (0, nls_1.localize)(61, null)),
                    fixBadLocalizedLinks((0, nls_1.localize)(62, null, numExtensions, `command:${extensions_1.$1fb}`))
                ];
            this.Lb(this.gb, untrustedContainerItems, themables_1.ThemeIcon.asClassNameArray(xListIcon));
            if (this.nb.isWorkspaceTrusted()) {
                if (this.nb.canSetWorkspaceTrust()) {
                    this.Ib(this.gb);
                }
                else {
                    this.Jb(this.gb);
                }
            }
            else {
                if (this.nb.canSetWorkspaceTrust()) {
                    this.Hb(this.fb);
                }
            }
        }
        Gb(parent, buttonInfo, enabled) {
            const buttonRow = (0, dom_1.$0O)(parent, (0, dom_1.$)('.workspace-trust-buttons-row'));
            const buttonContainer = (0, dom_1.$0O)(buttonRow, (0, dom_1.$)('.workspace-trust-buttons'));
            const buttonBar = this.zb.add(new button_1.$0Q(buttonContainer));
            for (const { action, keybinding } of buttonInfo) {
                const button = buttonBar.addButtonWithDescription(defaultStyles_1.$i2);
                button.label = action.label;
                button.enabled = enabled !== undefined ? enabled : action.enabled;
                button.description = keybinding.getLabel();
                button.element.ariaLabel = action.label + ', ' + (0, nls_1.localize)(63, null, keybinding.getAriaLabel());
                this.zb.add(button.onDidClick(e => {
                    if (e) {
                        dom_1.$5O.stop(e, true);
                    }
                    action.run();
                }));
            }
        }
        Hb(parent) {
            const trustAction = new actions_1.$gi('workspace.trust.button.action.grant', (0, nls_1.localize)(64, null), undefined, true, async () => {
                await this.nb.setWorkspaceTrust(true);
            });
            const trustActions = [{ action: trustAction, keybinding: this.rb.resolveUserBinding(platform_2.$j ? 'Cmd+Enter' : 'Ctrl+Enter')[0] }];
            if (this.nb.canSetParentFolderTrust()) {
                const workspaceIdentifier = (0, workspace_1.$Ph)(this.jb.getWorkspace());
                const name = (0, resources_1.$fg)((0, resources_1.$hg)(workspaceIdentifier.uri));
                const trustMessageElement = (0, dom_1.$0O)(parent, (0, dom_1.$)('.trust-message-box'));
                trustMessageElement.innerText = (0, nls_1.localize)(65, null, name);
                const trustParentAction = new actions_1.$gi('workspace.trust.button.action.grantParent', (0, nls_1.localize)(66, null), undefined, true, async () => {
                    await this.nb.setParentFolderTrust(true);
                });
                trustActions.push({ action: trustParentAction, keybinding: this.rb.resolveUserBinding(platform_2.$j ? 'Cmd+Shift+Enter' : 'Ctrl+Shift+Enter')[0] });
            }
            this.Gb(parent, trustActions);
        }
        Ib(parent) {
            this.Gb(parent, [{
                    action: new actions_1.$gi('workspace.trust.button.action.deny', (0, nls_1.localize)(67, null), undefined, true, async () => {
                        await this.nb.setWorkspaceTrust(false);
                    }),
                    keybinding: this.rb.resolveUserBinding(platform_2.$j ? 'Cmd+Enter' : 'Ctrl+Enter')[0]
                }]);
        }
        Jb(parent) {
            if (this.jb.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */) {
                return;
            }
            const textElement = (0, dom_1.$0O)(parent, (0, dom_1.$)('.workspace-trust-untrusted-description'));
            if (!this.nb.isWorkspaceTrustForced()) {
                textElement.innerText = this.jb.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */ ? (0, nls_1.localize)(68, null) : (0, nls_1.localize)(69, null);
            }
            else {
                textElement.innerText = (0, nls_1.localize)(70, null);
            }
        }
        Kb(parent, headerText, subtitleText) {
            const limitationsHeaderContainer = (0, dom_1.$0O)(parent, (0, dom_1.$)('.workspace-trust-limitations-header'));
            const titleElement = (0, dom_1.$0O)(limitationsHeaderContainer, (0, dom_1.$)('.workspace-trust-limitations-title'));
            const textElement = (0, dom_1.$0O)(titleElement, (0, dom_1.$)('.workspace-trust-limitations-title-text'));
            const subtitleElement = (0, dom_1.$0O)(limitationsHeaderContainer, (0, dom_1.$)('.workspace-trust-limitations-subtitle'));
            textElement.innerText = headerText;
            subtitleElement.innerText = subtitleText;
        }
        Lb(parent, limitations, iconClassNames) {
            const listContainer = (0, dom_1.$0O)(parent, (0, dom_1.$)('.workspace-trust-limitations-list-container'));
            const limitationsList = (0, dom_1.$0O)(listContainer, (0, dom_1.$)('ul'));
            for (const limitation of limitations) {
                const limitationListItem = (0, dom_1.$0O)(limitationsList, (0, dom_1.$)('li'));
                const icon = (0, dom_1.$0O)(limitationListItem, (0, dom_1.$)('.list-item-icon'));
                const text = (0, dom_1.$0O)(limitationListItem, (0, dom_1.$)('.list-item-text'));
                icon.classList.add(...iconClassNames);
                const linkedText = (0, linkedText_1.$IS)(limitation);
                for (const node of linkedText.nodes) {
                    if (typeof node === 'string') {
                        (0, dom_1.$0O)(text, document.createTextNode(node));
                    }
                    else {
                        this.zb.add(this.mb.createInstance(link_1.$40, text, { ...node, tabIndex: -1 }, {}));
                    }
                }
            }
        }
        layout(dimension) {
            if (!this.isVisible()) {
                return;
            }
            this.ib.layout();
            this.Mb.forEach(participant => {
                participant.layout();
            });
            this.y.scanDomNode();
        }
    };
    exports.$J1b = $J1b;
    __decorate([
        (0, decorators_1.$7g)(100)
    ], $J1b.prototype, "Ab", null);
    exports.$J1b = $J1b = $J1b_1 = __decorate([
        __param(0, telemetry_1.$9k),
        __param(1, themeService_1.$gv),
        __param(2, storage_1.$Vo),
        __param(3, workspace_1.$Kh),
        __param(4, extensions_1.$Pfb),
        __param(5, extensionManifestPropertiesService_1.$vcb),
        __param(6, instantiation_1.$Ah),
        __param(7, workspaceTrust_1.$$z),
        __param(8, configuration_1.$mE),
        __param(9, extensionManagement_1.$icb),
        __param(10, productService_1.$kj),
        __param(11, keybinding_1.$2D)
    ], $J1b);
    // Highly scoped fix for #126614
    function fixBadLocalizedLinks(badString) {
        const regex = /(.*)\[(.+)\]\s*\((.+)\)(.*)/; // markdown link match with spaces
        return badString.replace(regex, '$1[$2]($3)$4');
    }
});
//# sourceMappingURL=workspaceTrustEditor.js.map