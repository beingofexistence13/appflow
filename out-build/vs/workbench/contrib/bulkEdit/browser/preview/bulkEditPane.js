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
define(["require", "exports", "vs/platform/list/browser/listService", "vs/workbench/contrib/bulkEdit/browser/preview/bulkEditTree", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/nls!vs/workbench/contrib/bulkEdit/browser/preview/bulkEditPane", "vs/base/common/lifecycle", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/bulkEdit/browser/preview/bulkEditPreview", "vs/platform/label/common/label", "vs/editor/common/services/resolverService", "vs/workbench/browser/parts/views/viewPane", "vs/platform/keybinding/common/keybinding", "vs/platform/contextview/browser/contextView", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/workbench/browser/labels", "vs/platform/dialogs/common/dialogs", "vs/base/common/resources", "vs/platform/actions/common/actions", "vs/platform/storage/common/storage", "vs/workbench/common/views", "vs/platform/opener/common/opener", "vs/platform/telemetry/common/telemetry", "vs/base/browser/ui/button/button", "vs/platform/theme/browser/defaultStyles", "vs/css!./bulkEdit"], function (require, exports, listService_1, bulkEditTree_1, instantiation_1, themeService_1, nls_1, lifecycle_1, editorService_1, bulkEditPreview_1, label_1, resolverService_1, viewPane_1, keybinding_1, contextView_1, configuration_1, contextkey_1, labels_1, dialogs_1, resources_1, actions_1, storage_1, views_1, opener_1, telemetry_1, button_1, defaultStyles_1) {
    "use strict";
    var $xMb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$xMb = void 0;
    var State;
    (function (State) {
        State["Data"] = "data";
        State["Message"] = "message";
    })(State || (State = {}));
    let $xMb = class $xMb extends viewPane_1.$Ieb {
        static { $xMb_1 = this; }
        static { this.ID = 'refactorPreview'; }
        static { this.ctxHasCategories = new contextkey_1.$2i('refactorPreview.hasCategories', false); }
        static { this.ctxGroupByFile = new contextkey_1.$2i('refactorPreview.groupByFile', true); }
        static { this.ctxHasCheckedChanges = new contextkey_1.$2i('refactorPreview.hasCheckedChanges', true); }
        static { this.a = `${$xMb_1.ID}.groupByFile`; }
        constructor(options, ab, sb, Wb, Xb, Yb, Zb, $b, contextKeyService, viewDescriptorService, keybindingService, contextMenuService, configurationService, openerService, themeService, telemetryService) {
            super({ ...options, titleMenuId: actions_1.$Ru.BulkEditTitle }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, ab, openerService, themeService, telemetryService);
            this.ab = ab;
            this.sb = sb;
            this.Wb = Wb;
            this.Xb = Xb;
            this.Yb = Yb;
            this.Zb = Zb;
            this.$b = $b;
            this.f = new Map();
            this.n = new lifecycle_1.$jc();
            this.r = new lifecycle_1.$jc();
            this.element.classList.add('bulk-edit-panel', 'show-file-icons');
            this.h = $xMb_1.ctxHasCategories.bindTo(contextKeyService);
            this.j = $xMb_1.ctxGroupByFile.bindTo(contextKeyService);
            this.m = $xMb_1.ctxHasCheckedChanges.bindTo(contextKeyService);
        }
        dispose() {
            this.b.dispose();
            this.n.dispose();
        }
        U(parent) {
            super.U(parent);
            const resourceLabels = this.ab.createInstance(labels_1.$Llb, { onDidChangeVisibility: this.onDidChangeBodyVisibility });
            this.n.add(resourceLabels);
            const contentContainer = document.createElement('div');
            contentContainer.className = 'content';
            parent.appendChild(contentContainer);
            // tree
            const treeContainer = document.createElement('div');
            contentContainer.appendChild(treeContainer);
            this.c = this.ab.createInstance(bulkEditTree_1.$oMb);
            this.c.groupByFile = this.$b.getBoolean($xMb_1.a, 0 /* StorageScope.PROFILE */, true);
            this.j.set(this.c.groupByFile);
            this.b = this.ab.createInstance(listService_1.$w4, this.id, treeContainer, new bulkEditTree_1.$vMb(), [this.ab.createInstance(bulkEditTree_1.$uMb), this.ab.createInstance(bulkEditTree_1.$tMb, resourceLabels), this.ab.createInstance(bulkEditTree_1.$sMb)], this.c, {
                accessibilityProvider: this.ab.createInstance(bulkEditTree_1.$qMb),
                identityProvider: new bulkEditTree_1.$rMb(),
                expandOnlyOnTwistieClick: true,
                multipleSelectionSupport: false,
                keyboardNavigationLabelProvider: new bulkEditTree_1.$wMb(),
                sorter: new bulkEditTree_1.$pMb(),
                selectionNavigation: true
            });
            this.n.add(this.b.onContextMenu(this.gc, this));
            this.n.add(this.b.onDidOpen(e => this.fc(e)));
            // buttons
            const buttonsContainer = document.createElement('div');
            buttonsContainer.className = 'buttons';
            contentContainer.appendChild(buttonsContainer);
            const buttonBar = new button_1.$0Q(buttonsContainer);
            this.n.add(buttonBar);
            const btnConfirm = buttonBar.addButton({ supportIcons: true, ...defaultStyles_1.$i2 });
            btnConfirm.label = (0, nls_1.localize)(0, null);
            btnConfirm.onDidClick(() => this.accept(), this, this.n);
            const btnCancel = buttonBar.addButton({ ...defaultStyles_1.$i2, secondary: true });
            btnCancel.label = (0, nls_1.localize)(1, null);
            btnCancel.onDidClick(() => this.discard(), this, this.n);
            // message
            this.g = document.createElement('span');
            this.g.className = 'message';
            this.g.innerText = (0, nls_1.localize)(2, null);
            parent.appendChild(this.g);
            //
            this.cc("message" /* State.Message */);
        }
        W(height, width) {
            super.W(height, width);
            const treeHeight = height - 50;
            this.b.getHTMLElement().parentElement.style.height = `${treeHeight}px`;
            this.b.layout(treeHeight, width);
        }
        cc(state) {
            this.element.dataset['state'] = state;
        }
        async setInput(edit, token) {
            this.cc("data" /* State.Data */);
            this.r.clear();
            this.f.clear();
            if (this.s) {
                this.s(undefined);
                this.s = undefined;
            }
            const input = await this.ab.invokeFunction(bulkEditPreview_1.$jMb.create, edit);
            this.L = this.ab.createInstance(bulkEditPreview_1.$kMb, input);
            this.r.add(this.L);
            this.r.add(input);
            //
            const hasCategories = input.categories.length > 1;
            this.h.set(hasCategories);
            this.c.groupByFile = !hasCategories || this.c.groupByFile;
            this.m.set(input.checked.checkedCount > 0);
            this.t = input;
            return new Promise(resolve => {
                token.onCancellationRequested(() => resolve(undefined));
                this.s = resolve;
                this.dc(input);
                // refresh when check state changes
                this.r.add(input.checked.onDidChange(() => {
                    this.b.updateChildren();
                    this.m.set(input.checked.checkedCount > 0);
                }));
            });
        }
        hasInput() {
            return Boolean(this.t);
        }
        async dc(input) {
            const viewState = this.f.get(this.c.groupByFile);
            await this.b.setInput(input, viewState);
            this.b.domFocus();
            if (viewState) {
                return;
            }
            // async expandAll (max=10) is the default when no view state is given
            const expand = [...this.b.getNode(input).children].slice(0, 10);
            while (expand.length > 0) {
                const { element } = expand.shift();
                if (element instanceof bulkEditTree_1.$mMb) {
                    await this.b.expand(element, true);
                }
                if (element instanceof bulkEditTree_1.$lMb) {
                    await this.b.expand(element, true);
                    expand.push(...this.b.getNode(element).children);
                }
            }
        }
        accept() {
            const conflicts = this.t?.conflicts.list();
            if (!conflicts || conflicts.length === 0) {
                this.ec(true);
                return;
            }
            let message;
            if (conflicts.length === 1) {
                message = (0, nls_1.localize)(3, null, this.Wb.getUriLabel(conflicts[0], { relative: true }));
            }
            else {
                message = (0, nls_1.localize)(4, null, conflicts.length);
            }
            this.Yb.warn(message).finally(() => this.ec(false));
        }
        discard() {
            this.ec(false);
        }
        ec(accept) {
            this.s?.(accept ? this.t?.getWorkspaceEdit() : undefined);
            this.t = undefined;
            this.cc("message" /* State.Message */);
            this.r.clear();
        }
        toggleChecked() {
            const [first] = this.b.getFocus();
            if ((first instanceof bulkEditTree_1.$mMb || first instanceof bulkEditTree_1.$nMb) && !first.isDisabled()) {
                first.setChecked(!first.isChecked());
            }
            else if (first instanceof bulkEditTree_1.$lMb) {
                first.setChecked(!first.isChecked());
            }
        }
        groupByFile() {
            if (!this.c.groupByFile) {
                this.toggleGrouping();
            }
        }
        groupByType() {
            if (this.c.groupByFile) {
                this.toggleGrouping();
            }
        }
        toggleGrouping() {
            const input = this.b.getInput();
            if (input) {
                // (1) capture view state
                const oldViewState = this.b.getViewState();
                this.f.set(this.c.groupByFile, oldViewState);
                // (2) toggle and update
                this.c.groupByFile = !this.c.groupByFile;
                this.dc(input);
                // (3) remember preference
                this.$b.store($xMb_1.a, this.c.groupByFile, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
                this.j.set(this.c.groupByFile);
            }
        }
        async fc(e) {
            const options = { ...e.editorOptions };
            let fileElement;
            if (e.element instanceof bulkEditTree_1.$nMb) {
                fileElement = e.element.parent;
                options.selection = e.element.edit.textEdit.textEdit.range;
            }
            else if (e.element instanceof bulkEditTree_1.$mMb) {
                fileElement = e.element;
                options.selection = e.element.edit.textEdits[0]?.textEdit.textEdit.range;
            }
            else {
                // invalid event
                return;
            }
            const previewUri = this.L.asPreviewUri(fileElement.edit.uri);
            if (fileElement.edit.type & 4 /* BulkFileOperationType.Delete */) {
                // delete -> show single editor
                this.sb.openEditor({
                    label: (0, nls_1.localize)(5, null, (0, resources_1.$fg)(fileElement.edit.uri)),
                    resource: previewUri,
                    options
                });
            }
            else {
                // rename, create, edits -> show diff editr
                let leftResource;
                try {
                    (await this.Xb.createModelReference(fileElement.edit.uri)).dispose();
                    leftResource = fileElement.edit.uri;
                }
                catch {
                    leftResource = bulkEditPreview_1.$kMb.emptyPreview;
                }
                let typeLabel;
                if (fileElement.edit.type & 8 /* BulkFileOperationType.Rename */) {
                    typeLabel = (0, nls_1.localize)(6, null);
                }
                else if (fileElement.edit.type & 2 /* BulkFileOperationType.Create */) {
                    typeLabel = (0, nls_1.localize)(7, null);
                }
                let label;
                if (typeLabel) {
                    label = (0, nls_1.localize)(8, null, (0, resources_1.$fg)(fileElement.edit.uri), typeLabel);
                }
                else {
                    label = (0, nls_1.localize)(9, null, (0, resources_1.$fg)(fileElement.edit.uri));
                }
                this.sb.openEditor({
                    original: { resource: leftResource },
                    modified: { resource: previewUri },
                    label,
                    description: this.Wb.getUriLabel((0, resources_1.$hg)(leftResource), { relative: true }),
                    options
                }, e.sideBySide ? editorService_1.$$C : editorService_1.$0C);
            }
        }
        gc(e) {
            this.Zb.showContextMenu({
                menuId: actions_1.$Ru.BulkEditContext,
                contextKeyService: this.zb,
                getAnchor: () => e.anchor
            });
        }
    };
    exports.$xMb = $xMb;
    exports.$xMb = $xMb = $xMb_1 = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, editorService_1.$9C),
        __param(3, label_1.$Vz),
        __param(4, resolverService_1.$uA),
        __param(5, dialogs_1.$oA),
        __param(6, contextView_1.$WZ),
        __param(7, storage_1.$Vo),
        __param(8, contextkey_1.$3i),
        __param(9, views_1.$_E),
        __param(10, keybinding_1.$2D),
        __param(11, contextView_1.$WZ),
        __param(12, configuration_1.$8h),
        __param(13, opener_1.$NT),
        __param(14, themeService_1.$gv),
        __param(15, telemetry_1.$9k)
    ], $xMb);
});
//# sourceMappingURL=bulkEditPane.js.map