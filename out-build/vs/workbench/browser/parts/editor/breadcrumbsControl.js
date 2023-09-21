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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/mouseEvent", "vs/base/browser/ui/breadcrumbs/breadcrumbsWidget", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/base/common/uri", "vs/nls!vs/workbench/browser/parts/editor/breadcrumbsControl", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/list/browser/listService", "vs/platform/quickinput/common/quickInput", "vs/workbench/browser/labels", "vs/workbench/browser/parts/editor/breadcrumbs", "vs/workbench/browser/parts/editor/breadcrumbsModel", "vs/workbench/browser/parts/editor/breadcrumbsPicker", "vs/workbench/common/editor", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/editor/common/editorGroupsService", "vs/base/browser/browser", "vs/platform/label/common/label", "vs/platform/action/common/actionCommonCategories", "vs/platform/theme/common/iconRegistry", "vs/base/common/codicons", "vs/platform/theme/browser/defaultStyles", "vs/base/common/event", "vs/css!./media/breadcrumbscontrol"], function (require, exports, dom, mouseEvent_1, breadcrumbsWidget_1, arrays_1, async_1, lifecycle_1, resources_1, uri_1, nls_1, actions_1, configuration_1, contextkey_1, contextView_1, files_1, instantiation_1, keybindingsRegistry_1, listService_1, quickInput_1, labels_1, breadcrumbs_1, breadcrumbsModel_1, breadcrumbsPicker_1, editor_1, editorService_1, editorGroupsService_1, browser_1, label_1, actionCommonCategories_1, iconRegistry_1, codicons_1, defaultStyles_1, event_1) {
    "use strict";
    var $Jxb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Kxb = exports.$Jxb = void 0;
    class OutlineItem extends breadcrumbsWidget_1.$4Q {
        constructor(model, element, options) {
            super();
            this.model = model;
            this.element = element;
            this.options = options;
            this.c = new lifecycle_1.$jc();
        }
        dispose() {
            this.c.dispose();
        }
        equals(other) {
            if (!(other instanceof OutlineItem)) {
                return false;
            }
            return this.element.element === other.element.element &&
                this.options.showFileIcons === other.options.showFileIcons &&
                this.options.showSymbolIcons === other.options.showSymbolIcons;
        }
        render(container) {
            const { element, outline } = this.element;
            if (element === outline) {
                const element = dom.$('span', undefined, '…');
                container.appendChild(element);
                return;
            }
            const templateId = outline.config.delegate.getTemplateId(element);
            const renderer = outline.config.renderers.find(renderer => renderer.templateId === templateId);
            if (!renderer) {
                container.innerText = '<<NO RENDERER>>';
                return;
            }
            const template = renderer.renderTemplate(container);
            renderer.renderElement({
                element,
                children: [],
                depth: 0,
                visibleChildrenCount: 0,
                visibleChildIndex: 0,
                collapsible: false,
                collapsed: false,
                visible: true,
                filterData: undefined
            }, 0, template, undefined);
            this.c.add((0, lifecycle_1.$ic)(() => { renderer.disposeTemplate(template); }));
        }
    }
    class FileItem extends breadcrumbsWidget_1.$4Q {
        constructor(model, element, options, d) {
            super();
            this.model = model;
            this.element = element;
            this.options = options;
            this.d = d;
            this.c = new lifecycle_1.$jc();
        }
        dispose() {
            this.c.dispose();
        }
        equals(other) {
            if (!(other instanceof FileItem)) {
                return false;
            }
            return (resources_1.$$f.isEqual(this.element.uri, other.element.uri) &&
                this.options.showFileIcons === other.options.showFileIcons &&
                this.options.showSymbolIcons === other.options.showSymbolIcons);
        }
        render(container) {
            // file/folder
            const label = this.d.create(container);
            label.setFile(this.element.uri, {
                hidePath: true,
                hideIcon: this.element.kind === files_1.FileKind.FOLDER || !this.options.showFileIcons,
                fileKind: this.element.kind,
                fileDecorations: { colors: this.options.showDecorationColors, badges: false },
            });
            container.classList.add(files_1.FileKind[this.element.kind].toLowerCase());
            this.c.add(label);
        }
    }
    const separatorIcon = (0, iconRegistry_1.$9u)('breadcrumb-separator', codicons_1.$Pj.chevronRight, (0, nls_1.localize)(0, null));
    let $Jxb = class $Jxb {
        static { $Jxb_1 = this; }
        static { this.HEIGHT = 22; }
        static { this.a = {
            default: 3,
            large: 8
        }; }
        static { this.Payload_Reveal = {}; }
        static { this.Payload_RevealAside = {}; }
        static { this.Payload_Pick = {}; }
        static { this.CK_BreadcrumbsPossible = new contextkey_1.$2i('breadcrumbsPossible', false, (0, nls_1.localize)(1, null)); }
        static { this.CK_BreadcrumbsVisible = new contextkey_1.$2i('breadcrumbsVisible', false, (0, nls_1.localize)(2, null)); }
        static { this.CK_BreadcrumbsActive = new contextkey_1.$2i('breadcrumbsActive', false, (0, nls_1.localize)(3, null)); }
        constructor(container, p, q, r, s, t, u, v, w, z, configurationService, breadcrumbsService) {
            this.p = p;
            this.q = q;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.v = v;
            this.w = w;
            this.z = z;
            this.j = new lifecycle_1.$jc();
            this.k = new lifecycle_1.$jc();
            this.m = new lifecycle_1.$lc();
            this.n = false;
            this.domNode = document.createElement('div');
            this.domNode.classList.add('breadcrumbs-control');
            dom.$0O(container, this.domNode);
            this.f = breadcrumbs_1.$Bxb.UseQuickPick.bindTo(configurationService);
            this.g = breadcrumbs_1.$Bxb.Icons.bindTo(configurationService);
            this.h = breadcrumbs_1.$Bxb.TitleScrollbarSizing.bindTo(configurationService);
            this.l = this.t.createInstance(labels_1.$Llb, labels_1.$Klb);
            const sizing = this.h.getValue() ?? 'default';
            const styles = p.widgetStyles ?? defaultStyles_1.$x2;
            this.i = new breadcrumbsWidget_1.$5Q(this.domNode, $Jxb_1.a[sizing], separatorIcon, styles);
            this.i.onDidSelectItem(this.B, this, this.j);
            this.i.onDidFocusItem(this.A, this, this.j);
            this.i.onDidChangeFocus(this.C, this, this.j);
            this.b = $Jxb_1.CK_BreadcrumbsPossible.bindTo(this.r);
            this.c = $Jxb_1.CK_BreadcrumbsVisible.bindTo(this.r);
            this.d = $Jxb_1.CK_BreadcrumbsActive.bindTo(this.r);
            this.j.add(breadcrumbsService.register(this.q.id, this.i));
            this.hide();
        }
        dispose() {
            this.j.dispose();
            this.k.dispose();
            this.b.reset();
            this.c.reset();
            this.d.reset();
            this.f.dispose();
            this.g.dispose();
            this.i.dispose();
            this.l.dispose();
            this.domNode.remove();
        }
        get model() {
            return this.m.value;
        }
        layout(dim) {
            this.i.layout(dim);
        }
        isHidden() {
            return this.domNode.classList.contains('hidden');
        }
        hide() {
            this.k.clear();
            this.c.set(false);
            this.domNode.classList.toggle('hidden', true);
        }
        revealLast() {
            this.i.revealLast();
        }
        update() {
            this.k.clear();
            // honor diff editors and such
            const uri = editor_1.$3E.getCanonicalUri(this.q.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            const wasHidden = this.isHidden();
            if (!uri || !this.v.hasProvider(uri)) {
                // cleanup and return when there is no input or when
                // we cannot handle this input
                this.b.set(false);
                if (!wasHidden) {
                    this.hide();
                    return true;
                }
                else {
                    return false;
                }
            }
            // display uri which can be derived from certain inputs
            const fileInfoUri = editor_1.$3E.getOriginalUri(this.q.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            this.domNode.classList.toggle('hidden', false);
            this.c.set(true);
            this.b.set(true);
            const model = this.t.createInstance(breadcrumbsModel_1.$Exb, fileInfoUri ?? uri, this.q.activeEditorPane);
            this.m.value = model;
            this.domNode.classList.toggle('backslash-path', this.z.getSeparator(uri.scheme, uri.authority) === '\\');
            const updateBreadcrumbs = () => {
                this.domNode.classList.toggle('relative-path', model.isRelative());
                const showIcons = this.g.getValue();
                const options = {
                    ...this.p,
                    showFileIcons: this.p.showFileIcons && showIcons,
                    showSymbolIcons: this.p.showSymbolIcons && showIcons
                };
                const items = model.getElements().map(element => element instanceof breadcrumbsModel_1.$Cxb ? new FileItem(model, element, options, this.l) : new OutlineItem(model, element, options));
                if (items.length === 0) {
                    this.i.setEnabled(false);
                    this.i.setItems([new class extends breadcrumbsWidget_1.$4Q {
                            render(container) {
                                container.innerText = (0, nls_1.localize)(4, null);
                            }
                            equals(other) {
                                return other === this;
                            }
                        }]);
                }
                else {
                    this.i.setEnabled(true);
                    this.i.setItems(items);
                    this.i.reveal(items[items.length - 1]);
                }
            };
            const listener = model.onDidUpdate(updateBreadcrumbs);
            const configListener = this.g.onDidChange(updateBreadcrumbs);
            updateBreadcrumbs();
            this.k.clear();
            this.k.add(listener);
            this.k.add((0, lifecycle_1.$ic)(() => this.m.clear()));
            this.k.add(configListener);
            this.k.add((0, lifecycle_1.$ic)(() => this.i.setItems([])));
            const updateScrollbarSizing = () => {
                const sizing = this.h.getValue() ?? 'default';
                this.i.setHorizontalScrollbarSize($Jxb_1.a[sizing]);
            };
            updateScrollbarSizing();
            const updateScrollbarSizeListener = this.h.onDidChange(updateScrollbarSizing);
            this.k.add(updateScrollbarSizeListener);
            // close picker on hide/update
            this.k.add({
                dispose: () => {
                    if (this.n) {
                        this.s.hideContextView({ source: this });
                    }
                }
            });
            return wasHidden !== this.isHidden();
        }
        A(event) {
            if (event.item && this.n) {
                this.o = undefined;
                this.i.setSelection(event.item);
            }
        }
        B(event) {
            if (!event.item) {
                return;
            }
            if (event.item === this.o) {
                this.o = undefined;
                this.i.setFocused(undefined);
                this.i.setSelection(undefined);
                return;
            }
            const { element } = event.item;
            this.q.focus();
            const group = this.E(event.payload);
            if (group !== undefined) {
                // reveal the item
                this.i.setFocused(undefined);
                this.i.setSelection(undefined);
                this.D(event, element, group);
                return;
            }
            if (this.f.getValue()) {
                // using quick pick
                this.i.setFocused(undefined);
                this.i.setSelection(undefined);
                this.u.quickAccess.show(element instanceof breadcrumbsModel_1.$Dxb ? '@' : '');
                return;
            }
            // show picker
            let picker;
            let pickerAnchor;
            this.s.showContextView({
                render: (parent) => {
                    if (event.item instanceof FileItem) {
                        picker = this.t.createInstance(breadcrumbsPicker_1.$Hxb, parent, event.item.model.resource);
                    }
                    else if (event.item instanceof OutlineItem) {
                        picker = this.t.createInstance(breadcrumbsPicker_1.$Ixb, parent, event.item.model.resource);
                    }
                    const selectListener = picker.onWillPickElement(() => this.s.hideContextView({ source: this, didPick: true }));
                    const zoomListener = browser_1.$WN.onDidChange(() => this.s.hideContextView({ source: this }));
                    const focusTracker = dom.$8O(parent);
                    const blurListener = focusTracker.onDidBlur(() => {
                        this.o = this.i.isDOMFocused() ? event.item : undefined;
                        this.s.hideContextView({ source: this });
                    });
                    this.n = true;
                    this.C();
                    return (0, lifecycle_1.$hc)(picker, selectListener, zoomListener, focusTracker, blurListener);
                },
                getAnchor: () => {
                    if (!pickerAnchor) {
                        const maxInnerWidth = window.innerWidth - 8 /*a little less the full widget*/;
                        let maxHeight = Math.min(window.innerHeight * 0.7, 300);
                        const pickerWidth = Math.min(maxInnerWidth, Math.max(240, maxInnerWidth / 4.17));
                        const pickerArrowSize = 8;
                        let pickerArrowOffset;
                        const data = dom.$FO(event.node.firstChild);
                        const y = data.top + data.height + pickerArrowSize;
                        if (y + maxHeight >= window.innerHeight) {
                            maxHeight = window.innerHeight - y - 30 /* room for shadow and status bar*/;
                        }
                        let x = data.left;
                        if (x + pickerWidth >= maxInnerWidth) {
                            x = maxInnerWidth - pickerWidth;
                        }
                        if (event.payload instanceof mouseEvent_1.$eO) {
                            const maxPickerArrowOffset = pickerWidth - 2 * pickerArrowSize;
                            pickerArrowOffset = event.payload.posx - x;
                            if (pickerArrowOffset > maxPickerArrowOffset) {
                                x = Math.min(maxInnerWidth - pickerWidth, x + pickerArrowOffset - maxPickerArrowOffset);
                                pickerArrowOffset = maxPickerArrowOffset;
                            }
                        }
                        else {
                            pickerArrowOffset = (data.left + (data.width * 0.3)) - x;
                        }
                        picker.show(element, maxHeight, pickerWidth, pickerArrowSize, Math.max(0, pickerArrowOffset));
                        pickerAnchor = { x, y };
                    }
                    return pickerAnchor;
                },
                onHide: (data) => {
                    if (!data?.didPick) {
                        picker.restoreViewState();
                    }
                    this.n = false;
                    this.C();
                    if (data?.source === this) {
                        this.i.setFocused(undefined);
                        this.i.setSelection(undefined);
                    }
                    picker.dispose();
                }
            });
        }
        C() {
            const value = this.i.isDOMFocused() || this.n;
            this.d.set(value);
        }
        async D(event, element, group, pinned = false) {
            if (element instanceof breadcrumbsModel_1.$Cxb) {
                if (element.kind === files_1.FileKind.FILE) {
                    await this.w.openEditor({ resource: element.uri, options: { pinned } }, group);
                }
                else {
                    // show next picker
                    const items = this.i.getItems();
                    const idx = items.indexOf(event.item);
                    this.i.setFocused(items[idx + 1]);
                    this.i.setSelection(items[idx + 1], $Jxb_1.Payload_Pick);
                }
            }
            else {
                element.outline.reveal(element, { pinned }, group === editorService_1.$$C);
            }
        }
        E(data) {
            if (data === $Jxb_1.Payload_RevealAside) {
                return editorService_1.$$C;
            }
            else if (data === $Jxb_1.Payload_Reveal) {
                return editorService_1.$0C;
            }
            else {
                return undefined;
            }
        }
    };
    exports.$Jxb = $Jxb;
    exports.$Jxb = $Jxb = $Jxb_1 = __decorate([
        __param(3, contextkey_1.$3i),
        __param(4, contextView_1.$VZ),
        __param(5, instantiation_1.$Ah),
        __param(6, quickInput_1.$Gq),
        __param(7, files_1.$6j),
        __param(8, editorService_1.$9C),
        __param(9, label_1.$Vz),
        __param(10, configuration_1.$8h),
        __param(11, breadcrumbs_1.$zxb)
    ], $Jxb);
    let $Kxb = class $Kxb {
        get control() { return this.b; }
        get onDidEnablementChange() { return this.c.event; }
        constructor(container, editorGroup, options, configurationService, instantiationService, fileService) {
            this.a = new lifecycle_1.$jc();
            this.c = this.a.add(new event_1.$fd());
            const config = this.a.add(breadcrumbs_1.$Bxb.IsEnabled.bindTo(configurationService));
            this.a.add(config.onDidChange(() => {
                const value = config.getValue();
                if (!value && this.b) {
                    this.b.dispose();
                    this.b = undefined;
                    this.c.fire();
                }
                else if (value && !this.b) {
                    this.b = instantiationService.createInstance($Jxb, container, options, editorGroup);
                    this.b.update();
                    this.c.fire();
                }
            }));
            if (config.getValue()) {
                this.b = instantiationService.createInstance($Jxb, container, options, editorGroup);
            }
            this.a.add(fileService.onDidChangeFileSystemProviderRegistrations(e => {
                if (this.b?.model && this.b.model.resource.scheme !== e.scheme) {
                    // ignore if the scheme of the breadcrumbs resource is not affected
                    return;
                }
                if (this.b?.update()) {
                    this.c.fire();
                }
            }));
        }
        dispose() {
            this.a.dispose();
            this.b?.dispose();
        }
    };
    exports.$Kxb = $Kxb;
    exports.$Kxb = $Kxb = __decorate([
        __param(3, configuration_1.$8h),
        __param(4, instantiation_1.$Ah),
        __param(5, files_1.$6j)
    ], $Kxb);
    //#region commands
    // toggle command
    (0, actions_1.$Xu)(class ToggleBreadcrumb extends actions_1.$Wu {
        constructor() {
            super({
                id: 'breadcrumbs.toggle',
                title: {
                    value: (0, nls_1.localize)(5, null),
                    mnemonicTitle: (0, nls_1.localize)(6, null),
                    original: 'Toggle Breadcrumbs',
                },
                category: actionCommonCategories_1.$Nl.View,
                toggled: {
                    condition: contextkey_1.$Ii.equals('config.breadcrumbs.enabled', true),
                    title: (0, nls_1.localize)(7, null),
                    mnemonicTitle: (0, nls_1.localize)(8, null)
                },
                menu: [
                    { id: actions_1.$Ru.CommandPalette },
                    { id: actions_1.$Ru.MenubarAppearanceMenu, group: '4_editor', order: 2 },
                    { id: actions_1.$Ru.NotebookToolbar, group: 'notebookLayout', order: 2 },
                    { id: actions_1.$Ru.StickyScrollContext }
                ]
            });
        }
        run(accessor) {
            const config = accessor.get(configuration_1.$8h);
            const value = breadcrumbs_1.$Bxb.IsEnabled.bindTo(config).getValue();
            breadcrumbs_1.$Bxb.IsEnabled.bindTo(config).updateValue(!value);
        }
    });
    // focus/focus-and-select
    function focusAndSelectHandler(accessor, select) {
        // find widget and focus/select
        const groups = accessor.get(editorGroupsService_1.$5C);
        const breadcrumbs = accessor.get(breadcrumbs_1.$zxb);
        const widget = breadcrumbs.getWidget(groups.activeGroup.id);
        if (widget) {
            const item = (0, arrays_1.$qb)(widget.getItems());
            widget.setFocused(item);
            if (select) {
                widget.setSelection(item, $Jxb.Payload_Pick);
            }
        }
    }
    (0, actions_1.$Xu)(class FocusAndSelectBreadcrumbs extends actions_1.$Wu {
        constructor() {
            super({
                id: 'breadcrumbs.focusAndSelect',
                title: {
                    value: (0, nls_1.localize)(9, null),
                    original: 'Focus and Select Breadcrumbs'
                },
                precondition: $Jxb.CK_BreadcrumbsVisible,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 89 /* KeyCode.Period */,
                    when: $Jxb.CK_BreadcrumbsPossible,
                },
                f1: true
            });
        }
        run(accessor, ...args) {
            focusAndSelectHandler(accessor, true);
        }
    });
    (0, actions_1.$Xu)(class FocusBreadcrumbs extends actions_1.$Wu {
        constructor() {
            super({
                id: 'breadcrumbs.focus',
                title: {
                    value: (0, nls_1.localize)(10, null),
                    original: 'Focus Breadcrumbs'
                },
                precondition: $Jxb.CK_BreadcrumbsVisible,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 85 /* KeyCode.Semicolon */,
                    when: $Jxb.CK_BreadcrumbsPossible,
                },
                f1: true
            });
        }
        run(accessor, ...args) {
            focusAndSelectHandler(accessor, false);
        }
    });
    // this commands is only enabled when breadcrumbs are
    // disabled which it then enables and focuses
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'breadcrumbs.toggleToOn',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 89 /* KeyCode.Period */,
        when: contextkey_1.$Ii.not('config.breadcrumbs.enabled'),
        handler: async (accessor) => {
            const instant = accessor.get(instantiation_1.$Ah);
            const config = accessor.get(configuration_1.$8h);
            // check if enabled and iff not enable
            const isEnabled = breadcrumbs_1.$Bxb.IsEnabled.bindTo(config);
            if (!isEnabled.getValue()) {
                await isEnabled.updateValue(true);
                await (0, async_1.$Hg)(50); // hacky - the widget might not be ready yet...
            }
            return instant.invokeFunction(focusAndSelectHandler, true);
        }
    });
    // navigation
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'breadcrumbs.focusNext',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 17 /* KeyCode.RightArrow */,
        secondary: [2048 /* KeyMod.CtrlCmd */ | 17 /* KeyCode.RightArrow */],
        mac: {
            primary: 17 /* KeyCode.RightArrow */,
            secondary: [512 /* KeyMod.Alt */ | 17 /* KeyCode.RightArrow */],
        },
        when: contextkey_1.$Ii.and($Jxb.CK_BreadcrumbsVisible, $Jxb.CK_BreadcrumbsActive),
        handler(accessor) {
            const groups = accessor.get(editorGroupsService_1.$5C);
            const breadcrumbs = accessor.get(breadcrumbs_1.$zxb);
            const widget = breadcrumbs.getWidget(groups.activeGroup.id);
            if (!widget) {
                return;
            }
            widget.focusNext();
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'breadcrumbs.focusPrevious',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 15 /* KeyCode.LeftArrow */,
        secondary: [2048 /* KeyMod.CtrlCmd */ | 15 /* KeyCode.LeftArrow */],
        mac: {
            primary: 15 /* KeyCode.LeftArrow */,
            secondary: [512 /* KeyMod.Alt */ | 15 /* KeyCode.LeftArrow */],
        },
        when: contextkey_1.$Ii.and($Jxb.CK_BreadcrumbsVisible, $Jxb.CK_BreadcrumbsActive),
        handler(accessor) {
            const groups = accessor.get(editorGroupsService_1.$5C);
            const breadcrumbs = accessor.get(breadcrumbs_1.$zxb);
            const widget = breadcrumbs.getWidget(groups.activeGroup.id);
            if (!widget) {
                return;
            }
            widget.focusPrev();
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'breadcrumbs.focusNextWithPicker',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1,
        primary: 2048 /* KeyMod.CtrlCmd */ | 17 /* KeyCode.RightArrow */,
        mac: {
            primary: 512 /* KeyMod.Alt */ | 17 /* KeyCode.RightArrow */,
        },
        when: contextkey_1.$Ii.and($Jxb.CK_BreadcrumbsVisible, $Jxb.CK_BreadcrumbsActive, listService_1.$e4),
        handler(accessor) {
            const groups = accessor.get(editorGroupsService_1.$5C);
            const breadcrumbs = accessor.get(breadcrumbs_1.$zxb);
            const widget = breadcrumbs.getWidget(groups.activeGroup.id);
            if (!widget) {
                return;
            }
            widget.focusNext();
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'breadcrumbs.focusPreviousWithPicker',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1,
        primary: 2048 /* KeyMod.CtrlCmd */ | 15 /* KeyCode.LeftArrow */,
        mac: {
            primary: 512 /* KeyMod.Alt */ | 15 /* KeyCode.LeftArrow */,
        },
        when: contextkey_1.$Ii.and($Jxb.CK_BreadcrumbsVisible, $Jxb.CK_BreadcrumbsActive, listService_1.$e4),
        handler(accessor) {
            const groups = accessor.get(editorGroupsService_1.$5C);
            const breadcrumbs = accessor.get(breadcrumbs_1.$zxb);
            const widget = breadcrumbs.getWidget(groups.activeGroup.id);
            if (!widget) {
                return;
            }
            widget.focusPrev();
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'breadcrumbs.selectFocused',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 3 /* KeyCode.Enter */,
        secondary: [18 /* KeyCode.DownArrow */],
        when: contextkey_1.$Ii.and($Jxb.CK_BreadcrumbsVisible, $Jxb.CK_BreadcrumbsActive),
        handler(accessor) {
            const groups = accessor.get(editorGroupsService_1.$5C);
            const breadcrumbs = accessor.get(breadcrumbs_1.$zxb);
            const widget = breadcrumbs.getWidget(groups.activeGroup.id);
            if (!widget) {
                return;
            }
            widget.setSelection(widget.getFocused(), $Jxb.Payload_Pick);
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'breadcrumbs.revealFocused',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 10 /* KeyCode.Space */,
        secondary: [2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */],
        when: contextkey_1.$Ii.and($Jxb.CK_BreadcrumbsVisible, $Jxb.CK_BreadcrumbsActive),
        handler(accessor) {
            const groups = accessor.get(editorGroupsService_1.$5C);
            const breadcrumbs = accessor.get(breadcrumbs_1.$zxb);
            const widget = breadcrumbs.getWidget(groups.activeGroup.id);
            if (!widget) {
                return;
            }
            widget.setSelection(widget.getFocused(), $Jxb.Payload_Reveal);
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'breadcrumbs.selectEditor',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1,
        primary: 9 /* KeyCode.Escape */,
        when: contextkey_1.$Ii.and($Jxb.CK_BreadcrumbsVisible, $Jxb.CK_BreadcrumbsActive),
        handler(accessor) {
            const groups = accessor.get(editorGroupsService_1.$5C);
            const breadcrumbs = accessor.get(breadcrumbs_1.$zxb);
            const widget = breadcrumbs.getWidget(groups.activeGroup.id);
            if (!widget) {
                return;
            }
            widget.setFocused(undefined);
            widget.setSelection(undefined);
            groups.activeGroup.activeEditorPane?.focus();
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'breadcrumbs.revealFocusedFromTreeAside',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
        when: contextkey_1.$Ii.and($Jxb.CK_BreadcrumbsVisible, $Jxb.CK_BreadcrumbsActive, listService_1.$e4),
        handler(accessor) {
            const editors = accessor.get(editorService_1.$9C);
            const lists = accessor.get(listService_1.$03);
            const tree = lists.lastFocusedList;
            if (!(tree instanceof listService_1.$v4) && !(tree instanceof listService_1.$w4)) {
                return;
            }
            const element = tree.getFocus()[0];
            if (uri_1.URI.isUri(element?.resource)) {
                // IFileStat: open file in editor
                return editors.openEditor({
                    resource: element.resource,
                    options: { pinned: true }
                }, editorService_1.$$C);
            }
            // IOutline: check if this the outline and iff so reveal element
            const input = tree.getInput();
            if (input && typeof input.outlineKind === 'string') {
                return input.reveal(element, {
                    pinned: true,
                    preserveFocus: false
                }, true);
            }
        }
    });
});
//#endregion
//# sourceMappingURL=breadcrumbsControl.js.map