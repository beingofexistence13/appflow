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
define(["require", "exports", "vs/nls!vs/workbench/contrib/files/browser/views/openEditorsView", "vs/base/common/async", "vs/base/common/actions", "vs/base/browser/dom", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/editor/common/editorGroupsService", "vs/platform/configuration/common/configuration", "vs/platform/keybinding/common/keybinding", "vs/workbench/common/editor", "vs/workbench/contrib/files/browser/fileActions", "vs/workbench/contrib/files/common/files", "vs/workbench/browser/parts/editor/editorActions", "vs/platform/contextkey/common/contextkey", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/platform/list/browser/listService", "vs/workbench/browser/labels", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/telemetry/common/telemetry", "vs/base/common/lifecycle", "vs/platform/actions/common/actions", "vs/workbench/contrib/files/browser/fileConstants", "vs/workbench/common/contextkeys", "vs/platform/dnd/browser/dnd", "vs/workbench/browser/dnd", "vs/workbench/browser/parts/views/viewPane", "vs/base/browser/dnd", "vs/base/common/decorators", "vs/base/browser/ui/list/listView", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/common/views", "vs/platform/opener/common/opener", "vs/base/common/comparers", "vs/base/common/codicons", "vs/platform/commands/common/commands", "vs/base/common/network", "vs/base/common/resources", "vs/css!./media/openeditors"], function (require, exports, nls, async_1, actions_1, dom, contextView_1, instantiation_1, editorGroupsService_1, configuration_1, keybinding_1, editor_1, fileActions_1, files_1, editorActions_1, contextkey_1, themeService_1, colorRegistry_1, listService_1, labels_1, actionbar_1, telemetry_1, lifecycle_1, actions_2, fileConstants_1, contextkeys_1, dnd_1, dnd_2, viewPane_1, dnd_3, decorators_1, listView_1, workingCopyService_1, filesConfigurationService_1, views_1, opener_1, comparers_1, codicons_1, commands_1, network_1, resources_1) {
    "use strict";
    var $QLb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$QLb = void 0;
    const $ = dom.$;
    let $QLb = class $QLb extends viewPane_1.$Ieb {
        static { $QLb_1 = this; }
        static { this.a = 9; }
        static { this.b = 0; }
        static { this.ID = 'workbench.explorer.openEditorsView'; }
        static { this.NAME = nls.localize(0, null); }
        constructor(options, instantiationService, viewDescriptorService, contextMenuService, Wb, configurationService, keybindingService, contextKeyService, themeService, telemetryService, Xb, Yb, openerService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.Wb = Wb;
            this.Xb = Xb;
            this.Yb = Yb;
            this.n = false;
            this.r = [];
            this.h = 0;
            this.s = configurationService.getValue('explorer.openEditors.sortOrder');
            this.Zb();
            // Also handle configuration updates
            this.B(this.yb.onDidChangeConfiguration(e => this.ic(e)));
            // Handle dirty counter
            this.B(this.Xb.onDidChangeDirty(workingCopy => this.kc(workingCopy)));
        }
        Zb() {
            const updateWholeList = () => {
                if (!this.isBodyVisible() || !this.j) {
                    this.n = true;
                    return;
                }
                this.f?.schedule(this.h);
            };
            const groupDisposables = new Map();
            const addGroupListener = (group) => {
                const groupModelChangeListener = group.onDidModelChange(e => {
                    if (this.f?.isScheduled()) {
                        return;
                    }
                    if (!this.isBodyVisible() || !this.j) {
                        this.n = true;
                        return;
                    }
                    const index = this.ec(group, e.editor);
                    switch (e.kind) {
                        case 6 /* GroupModelChangeKind.EDITOR_ACTIVE */:
                        case 0 /* GroupModelChangeKind.GROUP_ACTIVE */:
                            this.hc();
                            break;
                        case 1 /* GroupModelChangeKind.GROUP_INDEX */:
                            if (index >= 0) {
                                this.j.splice(index, 1, [group]);
                            }
                            break;
                        case 11 /* GroupModelChangeKind.EDITOR_DIRTY */:
                        case 10 /* GroupModelChangeKind.EDITOR_STICKY */:
                        case 8 /* GroupModelChangeKind.EDITOR_CAPABILITIES */:
                        case 9 /* GroupModelChangeKind.EDITOR_PIN */:
                        case 7 /* GroupModelChangeKind.EDITOR_LABEL */:
                            this.j.splice(index, 1, [new files_1.$_db(e.editor, group)]);
                            this.hc();
                            break;
                        case 3 /* GroupModelChangeKind.EDITOR_OPEN */:
                        case 5 /* GroupModelChangeKind.EDITOR_MOVE */:
                        case 4 /* GroupModelChangeKind.EDITOR_CLOSE */:
                            updateWholeList();
                            break;
                    }
                });
                groupDisposables.set(group.id, groupModelChangeListener);
                this.B(groupDisposables.get(group.id));
            };
            this.Wb.groups.forEach(g => addGroupListener(g));
            this.B(this.Wb.onDidAddGroup(group => {
                addGroupListener(group);
                updateWholeList();
            }));
            this.B(this.Wb.onDidMoveGroup(() => updateWholeList()));
            this.B(this.Wb.onDidRemoveGroup(group => {
                (0, lifecycle_1.$fc)(groupDisposables.get(group.id));
                updateWholeList();
            }));
        }
        Ib(container) {
            super.Ib(container, this.title);
            const count = dom.$0O(container, $('.open-editors-dirty-count-container'));
            this.c = dom.$0O(count, $('.dirty-count.monaco-count-badge.long'));
            this.c.style.backgroundColor = (0, colorRegistry_1.$pv)(colorRegistry_1.$dw);
            this.c.style.color = (0, colorRegistry_1.$pv)(colorRegistry_1.$ew);
            this.c.style.border = `1px solid ${(0, colorRegistry_1.$pv)(colorRegistry_1.$Av)}`;
            this.kc();
        }
        U(container) {
            super.U(container);
            container.classList.add('open-editors');
            container.classList.add('show-file-icons');
            const delegate = new OpenEditorsDelegate();
            if (this.j) {
                this.j.dispose();
            }
            if (this.m) {
                this.m.clear();
            }
            this.m = this.Bb.createInstance(labels_1.$Llb, { onDidChangeVisibility: this.onDidChangeBodyVisibility });
            this.j = this.Bb.createInstance(listService_1.$p4, 'OpenEditors', container, delegate, [
                new EditorGroupRenderer(this.wb, this.Bb),
                new OpenEditorRenderer(this.m, this.Bb, this.wb, this.yb)
            ], {
                identityProvider: { getId: (element) => element instanceof files_1.$_db ? element.getId() : element.id.toString() },
                dnd: new OpenEditorsDragAndDrop(this.Bb, this.Wb),
                overrideStyles: {
                    listBackground: this.Rb()
                },
                accessibilityProvider: new OpenEditorsAccessibilityProvider()
            });
            this.B(this.j);
            this.B(this.m);
            // Register the refresh scheduler
            let labelChangeListeners = [];
            this.f = this.B(new async_1.$Sg(() => {
                // No need to refresh the list if it's not rendered
                if (!this.j) {
                    return;
                }
                labelChangeListeners = (0, lifecycle_1.$fc)(labelChangeListeners);
                const previousLength = this.j.length;
                const elements = this.dc();
                this.j.splice(0, this.j.length, elements);
                this.hc();
                if (previousLength !== this.j.length) {
                    this.jc();
                }
                this.n = false;
                if (this.s === 'alphabetical' || this.s === 'fullPath') {
                    // We need to resort the list if the editor label changed
                    elements.forEach(e => {
                        if (e instanceof files_1.$_db) {
                            labelChangeListeners.push(e.editor.onDidChangeLabel(() => this.f?.schedule()));
                        }
                    });
                }
            }, this.h));
            this.jc();
            // Bind context keys
            files_1.$Ydb.bindTo(this.j.contextKeyService);
            files_1.$Zdb.bindTo(this.j.contextKeyService);
            this.t = this.Bb.createInstance(contextkeys_1.$Kdb);
            this.B(this.t);
            this.L = fileConstants_1.$eHb.bindTo(this.zb);
            this.ab = fileConstants_1.$fHb.bindTo(this.zb);
            this.sb = fileConstants_1.$gHb.bindTo(this.zb);
            this.B(this.j.onContextMenu(e => this.gc(e)));
            this.j.onDidChangeFocus(e => {
                this.t.reset();
                this.L.reset();
                this.ab.reset();
                this.sb.reset();
                const element = e.elements.length ? e.elements[0] : undefined;
                if (element instanceof files_1.$_db) {
                    const resource = element.getResource();
                    this.ab.set(element.editor.isDirty() && !element.editor.isSaving());
                    this.sb.set(!!element.editor.isReadonly());
                    this.t.set(resource ?? null);
                }
                else if (!!element) {
                    this.L.set(true);
                }
            });
            // Open when selecting via keyboard
            this.B(this.j.onMouseMiddleClick(e => {
                if (e && e.element instanceof files_1.$_db) {
                    if ((0, editor_1.$2E)(e.element.group, e.element.editor, editor_1.EditorCloseMethod.MOUSE, this.Wb.partOptions)) {
                        return;
                    }
                    e.element.group.closeEditor(e.element.editor, { preserveFocus: true });
                }
            }));
            this.B(this.j.onDidOpen(e => {
                if (!e.element) {
                    return;
                }
                else if (e.element instanceof files_1.$_db) {
                    if (e.browserEvent instanceof MouseEvent && e.browserEvent.button === 1) {
                        return; // middle click already handled above: closes the editor
                    }
                    this.fc(e.element, { preserveFocus: e.editorOptions.preserveFocus, pinned: e.editorOptions.pinned, sideBySide: e.sideBySide });
                }
                else {
                    this.Wb.activateGroup(e.element);
                }
            }));
            this.f.schedule(0);
            this.B(this.onDidChangeBodyVisibility(visible => {
                if (visible && this.n) {
                    this.f?.schedule(0);
                }
            }));
            const containerModel = this.Ab.getViewContainerModel(this.Ab.getViewContainerByViewId(this.id));
            this.B(containerModel.onDidChangeAllViewDescriptors(() => {
                this.jc();
            }));
        }
        focus() {
            super.focus();
            this.j.domFocus();
        }
        getList() {
            return this.j;
        }
        W(height, width) {
            super.W(height, width);
            this.j?.layout(height, width);
        }
        get cc() {
            return this.Wb.groups.length > 1;
        }
        dc() {
            this.r = [];
            this.Wb.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */).forEach(g => {
                if (this.cc) {
                    this.r.push(g);
                }
                let editors = g.editors.map(ei => new files_1.$_db(ei, g));
                if (this.s === 'alphabetical') {
                    editors = editors.sort((first, second) => (0, comparers_1.$$p)(first.editor.getName(), second.editor.getName()));
                }
                else if (this.s === 'fullPath') {
                    editors = editors.sort((first, second) => {
                        const firstResource = first.editor.resource;
                        const secondResource = second.editor.resource;
                        //put 'system' editors before everything
                        if (firstResource === undefined && secondResource === undefined) {
                            return (0, comparers_1.$$p)(first.editor.getName(), second.editor.getName());
                        }
                        else if (firstResource === undefined) {
                            return -1;
                        }
                        else if (secondResource === undefined) {
                            return 1;
                        }
                        else {
                            const firstScheme = firstResource.scheme;
                            const secondScheme = secondResource.scheme;
                            //put non-file editors before files
                            if (firstScheme !== network_1.Schemas.file && secondScheme !== network_1.Schemas.file) {
                                return resources_1.$ag.compare(firstResource, secondResource);
                            }
                            else if (firstScheme !== network_1.Schemas.file) {
                                return -1;
                            }
                            else if (secondScheme !== network_1.Schemas.file) {
                                return 1;
                            }
                            else {
                                return resources_1.$ag.compare(firstResource, secondResource);
                            }
                        }
                    });
                }
                this.r.push(...editors);
            });
            return this.r;
        }
        ec(group, editor) {
            if (!editor) {
                return this.r.findIndex(e => !(e instanceof files_1.$_db) && e.id === group.id);
            }
            return this.r.findIndex(e => e instanceof files_1.$_db && e.editor === editor && e.group.id === group.id);
        }
        fc(element, options) {
            if (element) {
                this.Eb.publicLog2('workbenchActionExecuted', { id: 'workbench.files.openFile', from: 'openEditors' });
                const preserveActivateGroup = options.sideBySide && options.preserveFocus; // needed for https://github.com/microsoft/vscode/issues/42399
                if (!preserveActivateGroup) {
                    this.Wb.activateGroup(element.group); // needed for https://github.com/microsoft/vscode/issues/6672
                }
                const targetGroup = options.sideBySide ? this.Wb.sideGroup : this.Wb.activeGroup;
                targetGroup.openEditor(element.editor, options);
            }
        }
        gc(e) {
            if (!e.element) {
                return;
            }
            const element = e.element;
            this.xb.showContextMenu({
                menuId: actions_2.$Ru.OpenEditorsContext,
                menuActionOptions: { shouldForwardArgs: true, arg: element instanceof files_1.$_db ? editor_1.$3E.getOriginalUri(element.editor) : {} },
                contextKeyService: this.j.contextKeyService,
                getAnchor: () => e.anchor,
                getActionsContext: () => element instanceof files_1.$_db ? { groupId: element.groupId, editorIndex: element.group.getIndexOfEditor(element.editor) } : { groupId: element.id }
            });
        }
        hc() {
            if (this.j.length && this.Wb.activeGroup) {
                const index = this.ec(this.Wb.activeGroup, this.Wb.activeGroup.activeEditor);
                if (index >= 0) {
                    try {
                        this.j.setFocus([index]);
                        this.j.setSelection([index]);
                        this.j.reveal(index);
                    }
                    catch (e) {
                        // noop list updated in the meantime
                    }
                    return;
                }
            }
            this.j.setFocus([]);
            this.j.setSelection([]);
        }
        ic(event) {
            if (event.affectsConfiguration('explorer.openEditors')) {
                this.jc();
            }
            // Trigger a 'repaint' when decoration settings change or the sort order changed
            if (event.affectsConfiguration('explorer.decorations') || event.affectsConfiguration('explorer.openEditors.sortOrder')) {
                this.s = this.yb.getValue('explorer.openEditors.sortOrder');
                this.f?.schedule();
            }
        }
        jc() {
            // Adjust expanded body size
            this.minimumBodySize = this.orientation === 0 /* Orientation.VERTICAL */ ? this.nc() : 170;
            this.maximumBodySize = this.orientation === 0 /* Orientation.VERTICAL */ ? this.mc() : Number.POSITIVE_INFINITY;
        }
        kc(workingCopy) {
            if (workingCopy) {
                const gotDirty = workingCopy.isDirty();
                if (gotDirty && !(workingCopy.capabilities & 2 /* WorkingCopyCapabilities.Untitled */) && this.Yb.getAutoSaveMode() === 1 /* AutoSaveMode.AFTER_SHORT_DELAY */) {
                    return; // do not indicate dirty of working copies that are auto saved after short delay
                }
            }
            const dirty = this.Xb.dirtyCount;
            if (dirty === 0) {
                this.c.classList.add('hidden');
            }
            else {
                this.c.textContent = nls.localize(1, null, dirty);
                this.c.classList.remove('hidden');
            }
        }
        get lc() {
            return this.Wb.groups.map(g => g.count)
                .reduce((first, second) => first + second, this.cc ? this.Wb.groups.length : 0);
        }
        mc() {
            let minVisibleOpenEditors = this.yb.getValue('explorer.openEditors.minVisible');
            // If it's not a number setting it to 0 will result in dynamic resizing.
            if (typeof minVisibleOpenEditors !== 'number') {
                minVisibleOpenEditors = $QLb_1.b;
            }
            const containerModel = this.Ab.getViewContainerModel(this.Ab.getViewContainerByViewId(this.id));
            if (containerModel.visibleViewDescriptors.length <= 1) {
                return Number.POSITIVE_INFINITY;
            }
            return (Math.max(this.lc, minVisibleOpenEditors)) * OpenEditorsDelegate.ITEM_HEIGHT;
        }
        nc() {
            let visibleOpenEditors = this.yb.getValue('explorer.openEditors.visible');
            if (typeof visibleOpenEditors !== 'number') {
                visibleOpenEditors = $QLb_1.a;
            }
            return this.oc(visibleOpenEditors);
        }
        oc(visibleOpenEditors = $QLb_1.a) {
            const itemsToShow = Math.min(Math.max(visibleOpenEditors, 1), this.lc);
            return itemsToShow * OpenEditorsDelegate.ITEM_HEIGHT;
        }
        setStructuralRefreshDelay(delay) {
            this.h = delay;
        }
        getOptimalWidth() {
            const parentNode = this.j.getHTMLElement();
            const childNodes = [].slice.call(parentNode.querySelectorAll('.open-editor > a'));
            return dom.$MO(parentNode, childNodes);
        }
    };
    exports.$QLb = $QLb;
    exports.$QLb = $QLb = $QLb_1 = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, views_1.$_E),
        __param(3, contextView_1.$WZ),
        __param(4, editorGroupsService_1.$5C),
        __param(5, configuration_1.$8h),
        __param(6, keybinding_1.$2D),
        __param(7, contextkey_1.$3i),
        __param(8, themeService_1.$gv),
        __param(9, telemetry_1.$9k),
        __param(10, workingCopyService_1.$TC),
        __param(11, filesConfigurationService_1.$yD),
        __param(12, opener_1.$NT)
    ], $QLb);
    class OpenEditorActionRunner extends actions_1.$hi {
        async run(action) {
            if (!this.editor) {
                return;
            }
            return super.run(action, { groupId: this.editor.groupId, editorIndex: this.editor.group.getIndexOfEditor(this.editor.editor) });
        }
    }
    class OpenEditorsDelegate {
        static { this.ITEM_HEIGHT = 22; }
        getHeight(_element) {
            return OpenEditorsDelegate.ITEM_HEIGHT;
        }
        getTemplateId(element) {
            if (element instanceof files_1.$_db) {
                return OpenEditorRenderer.ID;
            }
            return EditorGroupRenderer.ID;
        }
    }
    class EditorGroupRenderer {
        static { this.ID = 'editorgroup'; }
        constructor(a, b) {
            this.a = a;
            this.b = b;
            // noop
        }
        get templateId() {
            return EditorGroupRenderer.ID;
        }
        renderTemplate(container) {
            const editorGroupTemplate = Object.create(null);
            editorGroupTemplate.root = dom.$0O(container, $('.editor-group'));
            editorGroupTemplate.name = dom.$0O(editorGroupTemplate.root, $('span.name'));
            editorGroupTemplate.actionBar = new actionbar_1.$1P(container);
            const saveAllInGroupAction = this.b.createInstance(fileActions_1.$XHb, fileActions_1.$XHb.ID, fileActions_1.$XHb.LABEL);
            const saveAllInGroupKey = this.a.lookupKeybinding(saveAllInGroupAction.id);
            editorGroupTemplate.actionBar.push(saveAllInGroupAction, { icon: true, label: false, keybinding: saveAllInGroupKey ? saveAllInGroupKey.getLabel() : undefined });
            const closeGroupAction = this.b.createInstance(fileActions_1.$YHb, fileActions_1.$YHb.ID, fileActions_1.$YHb.LABEL);
            const closeGroupActionKey = this.a.lookupKeybinding(closeGroupAction.id);
            editorGroupTemplate.actionBar.push(closeGroupAction, { icon: true, label: false, keybinding: closeGroupActionKey ? closeGroupActionKey.getLabel() : undefined });
            return editorGroupTemplate;
        }
        renderElement(editorGroup, _index, templateData) {
            templateData.editorGroup = editorGroup;
            templateData.name.textContent = editorGroup.label;
            templateData.actionBar.context = { groupId: editorGroup.id };
        }
        disposeTemplate(templateData) {
            templateData.actionBar.dispose();
        }
    }
    class OpenEditorRenderer {
        static { this.ID = 'openeditor'; }
        constructor(c, d, f, h) {
            this.c = c;
            this.d = d;
            this.f = f;
            this.h = h;
            this.a = this.d.createInstance(editorActions_1.$9vb, editorActions_1.$9vb.ID, editorActions_1.$9vb.LABEL);
            this.b = this.d.createInstance(editorActions_1.$0vb, editorActions_1.$0vb.ID, editorActions_1.$0vb.LABEL);
            // noop
        }
        get templateId() {
            return OpenEditorRenderer.ID;
        }
        renderTemplate(container) {
            const editorTemplate = Object.create(null);
            editorTemplate.container = container;
            editorTemplate.actionRunner = new OpenEditorActionRunner();
            editorTemplate.actionBar = new actionbar_1.$1P(container, { actionRunner: editorTemplate.actionRunner });
            editorTemplate.root = this.c.create(container);
            return editorTemplate;
        }
        renderElement(openedEditor, _index, templateData) {
            const editor = openedEditor.editor;
            templateData.actionRunner.editor = openedEditor;
            templateData.container.classList.toggle('dirty', editor.isDirty() && !editor.isSaving());
            templateData.container.classList.toggle('sticky', openedEditor.isSticky());
            templateData.root.setResource({
                resource: editor_1.$3E.getOriginalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.BOTH }),
                name: editor.getName(),
                description: editor.getDescription(1 /* Verbosity.MEDIUM */)
            }, {
                italic: openedEditor.isPreview(),
                extraClasses: ['open-editor'].concat(openedEditor.editor.getLabelExtraClasses()),
                fileDecorations: this.h.getValue().explorer.decorations,
                title: editor.getTitle(2 /* Verbosity.LONG */)
            });
            const editorAction = openedEditor.isSticky() ? this.b : this.a;
            if (!templateData.actionBar.hasAction(editorAction)) {
                if (!templateData.actionBar.isEmpty()) {
                    templateData.actionBar.clear();
                }
                templateData.actionBar.push(editorAction, { icon: true, label: false, keybinding: this.f.lookupKeybinding(editorAction.id)?.getLabel() });
            }
        }
        disposeTemplate(templateData) {
            templateData.actionBar.dispose();
            templateData.root.dispose();
            templateData.actionRunner.dispose();
        }
    }
    class OpenEditorsDragAndDrop {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        get c() {
            return this.a.createInstance(dnd_2.$ueb, { allowWorkspaceOpen: false });
        }
        getDragURI(element) {
            if (element instanceof files_1.$_db) {
                const resource = element.getResource();
                if (resource) {
                    return resource.toString();
                }
            }
            return null;
        }
        getDragLabel(elements) {
            if (elements.length > 1) {
                return String(elements.length);
            }
            const element = elements[0];
            return element instanceof files_1.$_db ? element.editor.getName() : element.label;
        }
        onDragStart(data, originalEvent) {
            const items = data.elements;
            const editors = [];
            if (items) {
                for (const item of items) {
                    if (item instanceof files_1.$_db) {
                        editors.push(item);
                    }
                }
            }
            if (editors.length) {
                // Apply some datatransfer types to allow for dragging the element outside of the application
                this.a.invokeFunction(dnd_2.$veb, editors, originalEvent);
            }
        }
        onDragOver(data, _targetElement, _targetIndex, originalEvent) {
            if (data instanceof listView_1.$lQ) {
                return (0, dnd_1.$06)(originalEvent, dnd_3.$CP.FILES, dnd_1.$56.FILES);
            }
            return true;
        }
        drop(data, targetElement, _targetIndex, originalEvent) {
            const group = targetElement instanceof files_1.$_db ? targetElement.group : targetElement || this.b.groups[this.b.count - 1];
            const index = targetElement instanceof files_1.$_db ? targetElement.group.getIndexOfEditor(targetElement.editor) : 0;
            if (data instanceof listView_1.$jQ) {
                const elementsData = data.elements;
                elementsData.forEach((oe, offset) => {
                    oe.group.moveEditor(oe.editor, group, { index: index + offset, preserveFocus: true });
                });
                this.b.activateGroup(group);
            }
            else {
                this.c.handleDrop(originalEvent, () => group, () => group.focus(), index);
            }
        }
    }
    __decorate([
        decorators_1.$6g
    ], OpenEditorsDragAndDrop.prototype, "c", null);
    class OpenEditorsAccessibilityProvider {
        getWidgetAriaLabel() {
            return nls.localize(2, null);
        }
        getAriaLabel(element) {
            if (element instanceof files_1.$_db) {
                return `${element.editor.getName()}, ${element.editor.getDescription()}`;
            }
            return element.ariaLabel;
        }
    }
    const toggleEditorGroupLayoutId = 'workbench.action.toggleEditorGroupLayout';
    (0, actions_2.$Xu)(class extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.action.toggleEditorGroupLayout',
                title: { value: nls.localize(3, null), original: 'Toggle Vertical/Horizontal Editor Layout' },
                f1: true,
                keybinding: {
                    primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 21 /* KeyCode.Digit0 */,
                    mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 21 /* KeyCode.Digit0 */ },
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                icon: codicons_1.$Pj.editorLayout,
                menu: {
                    id: actions_2.$Ru.ViewTitle,
                    group: 'navigation',
                    when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', $QLb.ID), contextkeys_1.$idb),
                    order: 10
                }
            });
        }
        async run(accessor) {
            const editorGroupService = accessor.get(editorGroupsService_1.$5C);
            const newOrientation = (editorGroupService.orientation === 1 /* GroupOrientation.VERTICAL */) ? 0 /* GroupOrientation.HORIZONTAL */ : 1 /* GroupOrientation.VERTICAL */;
            editorGroupService.setGroupOrientation(newOrientation);
        }
    });
    actions_2.$Tu.appendMenuItem(actions_2.$Ru.MenubarLayoutMenu, {
        group: '4_flip',
        command: {
            id: toggleEditorGroupLayoutId,
            title: {
                original: 'Flip Layout',
                value: nls.localize(4, null),
                mnemonicTitle: nls.localize(5, null)
            }
        },
        order: 1
    });
    (0, actions_2.$Xu)(class extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.action.files.saveAll',
                title: { value: fileConstants_1.$bHb, original: 'Save All' },
                f1: true,
                icon: codicons_1.$Pj.saveAll,
                menu: {
                    id: actions_2.$Ru.ViewTitle,
                    group: 'navigation',
                    when: contextkey_1.$Ii.equals('view', $QLb.ID),
                    order: 20
                }
            });
        }
        async run(accessor) {
            const commandService = accessor.get(commands_1.$Fr);
            await commandService.executeCommand(fileConstants_1.$aHb);
        }
    });
    (0, actions_2.$Xu)(class extends actions_2.$Wu {
        constructor() {
            super({
                id: 'openEditors.closeAll',
                title: editorActions_1.$bwb.LABEL,
                f1: false,
                icon: codicons_1.$Pj.closeAll,
                menu: {
                    id: actions_2.$Ru.ViewTitle,
                    group: 'navigation',
                    when: contextkey_1.$Ii.equals('view', $QLb.ID),
                    order: 30
                }
            });
        }
        async run(accessor) {
            const instantiationService = accessor.get(instantiation_1.$Ah);
            const closeAll = new editorActions_1.$bwb();
            await instantiationService.invokeFunction(accessor => closeAll.run(accessor));
        }
    });
    (0, actions_2.$Xu)(class extends actions_2.$Wu {
        constructor() {
            super({
                id: 'openEditors.newUntitledFile',
                title: { value: nls.localize(6, null), original: 'New Untitled Text File' },
                f1: false,
                icon: codicons_1.$Pj.newFile,
                menu: {
                    id: actions_2.$Ru.ViewTitle,
                    group: 'navigation',
                    when: contextkey_1.$Ii.equals('view', $QLb.ID),
                    order: 5
                }
            });
        }
        async run(accessor) {
            const commandService = accessor.get(commands_1.$Fr);
            await commandService.executeCommand(fileConstants_1.$oHb);
        }
    });
});
//# sourceMappingURL=openEditorsView.js.map