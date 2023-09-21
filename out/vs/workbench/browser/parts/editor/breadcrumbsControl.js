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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/mouseEvent", "vs/base/browser/ui/breadcrumbs/breadcrumbsWidget", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/base/common/uri", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/list/browser/listService", "vs/platform/quickinput/common/quickInput", "vs/workbench/browser/labels", "vs/workbench/browser/parts/editor/breadcrumbs", "vs/workbench/browser/parts/editor/breadcrumbsModel", "vs/workbench/browser/parts/editor/breadcrumbsPicker", "vs/workbench/common/editor", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/editor/common/editorGroupsService", "vs/base/browser/browser", "vs/platform/label/common/label", "vs/platform/action/common/actionCommonCategories", "vs/platform/theme/common/iconRegistry", "vs/base/common/codicons", "vs/platform/theme/browser/defaultStyles", "vs/base/common/event", "vs/css!./media/breadcrumbscontrol"], function (require, exports, dom, mouseEvent_1, breadcrumbsWidget_1, arrays_1, async_1, lifecycle_1, resources_1, uri_1, nls_1, actions_1, configuration_1, contextkey_1, contextView_1, files_1, instantiation_1, keybindingsRegistry_1, listService_1, quickInput_1, labels_1, breadcrumbs_1, breadcrumbsModel_1, breadcrumbsPicker_1, editor_1, editorService_1, editorGroupsService_1, browser_1, label_1, actionCommonCategories_1, iconRegistry_1, codicons_1, defaultStyles_1, event_1) {
    "use strict";
    var BreadcrumbsControl_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BreadcrumbsControlFactory = exports.BreadcrumbsControl = void 0;
    class OutlineItem extends breadcrumbsWidget_1.BreadcrumbsItem {
        constructor(model, element, options) {
            super();
            this.model = model;
            this.element = element;
            this.options = options;
            this._disposables = new lifecycle_1.DisposableStore();
        }
        dispose() {
            this._disposables.dispose();
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
            this._disposables.add((0, lifecycle_1.toDisposable)(() => { renderer.disposeTemplate(template); }));
        }
    }
    class FileItem extends breadcrumbsWidget_1.BreadcrumbsItem {
        constructor(model, element, options, _labels) {
            super();
            this.model = model;
            this.element = element;
            this.options = options;
            this._labels = _labels;
            this._disposables = new lifecycle_1.DisposableStore();
        }
        dispose() {
            this._disposables.dispose();
        }
        equals(other) {
            if (!(other instanceof FileItem)) {
                return false;
            }
            return (resources_1.extUri.isEqual(this.element.uri, other.element.uri) &&
                this.options.showFileIcons === other.options.showFileIcons &&
                this.options.showSymbolIcons === other.options.showSymbolIcons);
        }
        render(container) {
            // file/folder
            const label = this._labels.create(container);
            label.setFile(this.element.uri, {
                hidePath: true,
                hideIcon: this.element.kind === files_1.FileKind.FOLDER || !this.options.showFileIcons,
                fileKind: this.element.kind,
                fileDecorations: { colors: this.options.showDecorationColors, badges: false },
            });
            container.classList.add(files_1.FileKind[this.element.kind].toLowerCase());
            this._disposables.add(label);
        }
    }
    const separatorIcon = (0, iconRegistry_1.registerIcon)('breadcrumb-separator', codicons_1.Codicon.chevronRight, (0, nls_1.localize)('separatorIcon', 'Icon for the separator in the breadcrumbs.'));
    let BreadcrumbsControl = class BreadcrumbsControl {
        static { BreadcrumbsControl_1 = this; }
        static { this.HEIGHT = 22; }
        static { this.SCROLLBAR_SIZES = {
            default: 3,
            large: 8
        }; }
        static { this.Payload_Reveal = {}; }
        static { this.Payload_RevealAside = {}; }
        static { this.Payload_Pick = {}; }
        static { this.CK_BreadcrumbsPossible = new contextkey_1.RawContextKey('breadcrumbsPossible', false, (0, nls_1.localize)('breadcrumbsPossible', "Whether the editor can show breadcrumbs")); }
        static { this.CK_BreadcrumbsVisible = new contextkey_1.RawContextKey('breadcrumbsVisible', false, (0, nls_1.localize)('breadcrumbsVisible', "Whether breadcrumbs are currently visible")); }
        static { this.CK_BreadcrumbsActive = new contextkey_1.RawContextKey('breadcrumbsActive', false, (0, nls_1.localize)('breadcrumbsActive', "Whether breadcrumbs have focus")); }
        constructor(container, _options, _editorGroup, _contextKeyService, _contextViewService, _instantiationService, _quickInputService, _fileService, _editorService, _labelService, configurationService, breadcrumbsService) {
            this._options = _options;
            this._editorGroup = _editorGroup;
            this._contextKeyService = _contextKeyService;
            this._contextViewService = _contextViewService;
            this._instantiationService = _instantiationService;
            this._quickInputService = _quickInputService;
            this._fileService = _fileService;
            this._editorService = _editorService;
            this._labelService = _labelService;
            this._disposables = new lifecycle_1.DisposableStore();
            this._breadcrumbsDisposables = new lifecycle_1.DisposableStore();
            this._model = new lifecycle_1.MutableDisposable();
            this._breadcrumbsPickerShowing = false;
            this.domNode = document.createElement('div');
            this.domNode.classList.add('breadcrumbs-control');
            dom.append(container, this.domNode);
            this._cfUseQuickPick = breadcrumbs_1.BreadcrumbsConfig.UseQuickPick.bindTo(configurationService);
            this._cfShowIcons = breadcrumbs_1.BreadcrumbsConfig.Icons.bindTo(configurationService);
            this._cfTitleScrollbarSizing = breadcrumbs_1.BreadcrumbsConfig.TitleScrollbarSizing.bindTo(configurationService);
            this._labels = this._instantiationService.createInstance(labels_1.ResourceLabels, labels_1.DEFAULT_LABELS_CONTAINER);
            const sizing = this._cfTitleScrollbarSizing.getValue() ?? 'default';
            const styles = _options.widgetStyles ?? defaultStyles_1.defaultBreadcrumbsWidgetStyles;
            this._widget = new breadcrumbsWidget_1.BreadcrumbsWidget(this.domNode, BreadcrumbsControl_1.SCROLLBAR_SIZES[sizing], separatorIcon, styles);
            this._widget.onDidSelectItem(this._onSelectEvent, this, this._disposables);
            this._widget.onDidFocusItem(this._onFocusEvent, this, this._disposables);
            this._widget.onDidChangeFocus(this._updateCkBreadcrumbsActive, this, this._disposables);
            this._ckBreadcrumbsPossible = BreadcrumbsControl_1.CK_BreadcrumbsPossible.bindTo(this._contextKeyService);
            this._ckBreadcrumbsVisible = BreadcrumbsControl_1.CK_BreadcrumbsVisible.bindTo(this._contextKeyService);
            this._ckBreadcrumbsActive = BreadcrumbsControl_1.CK_BreadcrumbsActive.bindTo(this._contextKeyService);
            this._disposables.add(breadcrumbsService.register(this._editorGroup.id, this._widget));
            this.hide();
        }
        dispose() {
            this._disposables.dispose();
            this._breadcrumbsDisposables.dispose();
            this._ckBreadcrumbsPossible.reset();
            this._ckBreadcrumbsVisible.reset();
            this._ckBreadcrumbsActive.reset();
            this._cfUseQuickPick.dispose();
            this._cfShowIcons.dispose();
            this._widget.dispose();
            this._labels.dispose();
            this.domNode.remove();
        }
        get model() {
            return this._model.value;
        }
        layout(dim) {
            this._widget.layout(dim);
        }
        isHidden() {
            return this.domNode.classList.contains('hidden');
        }
        hide() {
            this._breadcrumbsDisposables.clear();
            this._ckBreadcrumbsVisible.set(false);
            this.domNode.classList.toggle('hidden', true);
        }
        revealLast() {
            this._widget.revealLast();
        }
        update() {
            this._breadcrumbsDisposables.clear();
            // honor diff editors and such
            const uri = editor_1.EditorResourceAccessor.getCanonicalUri(this._editorGroup.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            const wasHidden = this.isHidden();
            if (!uri || !this._fileService.hasProvider(uri)) {
                // cleanup and return when there is no input or when
                // we cannot handle this input
                this._ckBreadcrumbsPossible.set(false);
                if (!wasHidden) {
                    this.hide();
                    return true;
                }
                else {
                    return false;
                }
            }
            // display uri which can be derived from certain inputs
            const fileInfoUri = editor_1.EditorResourceAccessor.getOriginalUri(this._editorGroup.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            this.domNode.classList.toggle('hidden', false);
            this._ckBreadcrumbsVisible.set(true);
            this._ckBreadcrumbsPossible.set(true);
            const model = this._instantiationService.createInstance(breadcrumbsModel_1.BreadcrumbsModel, fileInfoUri ?? uri, this._editorGroup.activeEditorPane);
            this._model.value = model;
            this.domNode.classList.toggle('backslash-path', this._labelService.getSeparator(uri.scheme, uri.authority) === '\\');
            const updateBreadcrumbs = () => {
                this.domNode.classList.toggle('relative-path', model.isRelative());
                const showIcons = this._cfShowIcons.getValue();
                const options = {
                    ...this._options,
                    showFileIcons: this._options.showFileIcons && showIcons,
                    showSymbolIcons: this._options.showSymbolIcons && showIcons
                };
                const items = model.getElements().map(element => element instanceof breadcrumbsModel_1.FileElement ? new FileItem(model, element, options, this._labels) : new OutlineItem(model, element, options));
                if (items.length === 0) {
                    this._widget.setEnabled(false);
                    this._widget.setItems([new class extends breadcrumbsWidget_1.BreadcrumbsItem {
                            render(container) {
                                container.innerText = (0, nls_1.localize)('empty', "no elements");
                            }
                            equals(other) {
                                return other === this;
                            }
                        }]);
                }
                else {
                    this._widget.setEnabled(true);
                    this._widget.setItems(items);
                    this._widget.reveal(items[items.length - 1]);
                }
            };
            const listener = model.onDidUpdate(updateBreadcrumbs);
            const configListener = this._cfShowIcons.onDidChange(updateBreadcrumbs);
            updateBreadcrumbs();
            this._breadcrumbsDisposables.clear();
            this._breadcrumbsDisposables.add(listener);
            this._breadcrumbsDisposables.add((0, lifecycle_1.toDisposable)(() => this._model.clear()));
            this._breadcrumbsDisposables.add(configListener);
            this._breadcrumbsDisposables.add((0, lifecycle_1.toDisposable)(() => this._widget.setItems([])));
            const updateScrollbarSizing = () => {
                const sizing = this._cfTitleScrollbarSizing.getValue() ?? 'default';
                this._widget.setHorizontalScrollbarSize(BreadcrumbsControl_1.SCROLLBAR_SIZES[sizing]);
            };
            updateScrollbarSizing();
            const updateScrollbarSizeListener = this._cfTitleScrollbarSizing.onDidChange(updateScrollbarSizing);
            this._breadcrumbsDisposables.add(updateScrollbarSizeListener);
            // close picker on hide/update
            this._breadcrumbsDisposables.add({
                dispose: () => {
                    if (this._breadcrumbsPickerShowing) {
                        this._contextViewService.hideContextView({ source: this });
                    }
                }
            });
            return wasHidden !== this.isHidden();
        }
        _onFocusEvent(event) {
            if (event.item && this._breadcrumbsPickerShowing) {
                this._breadcrumbsPickerIgnoreOnceItem = undefined;
                this._widget.setSelection(event.item);
            }
        }
        _onSelectEvent(event) {
            if (!event.item) {
                return;
            }
            if (event.item === this._breadcrumbsPickerIgnoreOnceItem) {
                this._breadcrumbsPickerIgnoreOnceItem = undefined;
                this._widget.setFocused(undefined);
                this._widget.setSelection(undefined);
                return;
            }
            const { element } = event.item;
            this._editorGroup.focus();
            const group = this._getEditorGroup(event.payload);
            if (group !== undefined) {
                // reveal the item
                this._widget.setFocused(undefined);
                this._widget.setSelection(undefined);
                this._revealInEditor(event, element, group);
                return;
            }
            if (this._cfUseQuickPick.getValue()) {
                // using quick pick
                this._widget.setFocused(undefined);
                this._widget.setSelection(undefined);
                this._quickInputService.quickAccess.show(element instanceof breadcrumbsModel_1.OutlineElement2 ? '@' : '');
                return;
            }
            // show picker
            let picker;
            let pickerAnchor;
            this._contextViewService.showContextView({
                render: (parent) => {
                    if (event.item instanceof FileItem) {
                        picker = this._instantiationService.createInstance(breadcrumbsPicker_1.BreadcrumbsFilePicker, parent, event.item.model.resource);
                    }
                    else if (event.item instanceof OutlineItem) {
                        picker = this._instantiationService.createInstance(breadcrumbsPicker_1.BreadcrumbsOutlinePicker, parent, event.item.model.resource);
                    }
                    const selectListener = picker.onWillPickElement(() => this._contextViewService.hideContextView({ source: this, didPick: true }));
                    const zoomListener = browser_1.PixelRatio.onDidChange(() => this._contextViewService.hideContextView({ source: this }));
                    const focusTracker = dom.trackFocus(parent);
                    const blurListener = focusTracker.onDidBlur(() => {
                        this._breadcrumbsPickerIgnoreOnceItem = this._widget.isDOMFocused() ? event.item : undefined;
                        this._contextViewService.hideContextView({ source: this });
                    });
                    this._breadcrumbsPickerShowing = true;
                    this._updateCkBreadcrumbsActive();
                    return (0, lifecycle_1.combinedDisposable)(picker, selectListener, zoomListener, focusTracker, blurListener);
                },
                getAnchor: () => {
                    if (!pickerAnchor) {
                        const maxInnerWidth = window.innerWidth - 8 /*a little less the full widget*/;
                        let maxHeight = Math.min(window.innerHeight * 0.7, 300);
                        const pickerWidth = Math.min(maxInnerWidth, Math.max(240, maxInnerWidth / 4.17));
                        const pickerArrowSize = 8;
                        let pickerArrowOffset;
                        const data = dom.getDomNodePagePosition(event.node.firstChild);
                        const y = data.top + data.height + pickerArrowSize;
                        if (y + maxHeight >= window.innerHeight) {
                            maxHeight = window.innerHeight - y - 30 /* room for shadow and status bar*/;
                        }
                        let x = data.left;
                        if (x + pickerWidth >= maxInnerWidth) {
                            x = maxInnerWidth - pickerWidth;
                        }
                        if (event.payload instanceof mouseEvent_1.StandardMouseEvent) {
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
                    this._breadcrumbsPickerShowing = false;
                    this._updateCkBreadcrumbsActive();
                    if (data?.source === this) {
                        this._widget.setFocused(undefined);
                        this._widget.setSelection(undefined);
                    }
                    picker.dispose();
                }
            });
        }
        _updateCkBreadcrumbsActive() {
            const value = this._widget.isDOMFocused() || this._breadcrumbsPickerShowing;
            this._ckBreadcrumbsActive.set(value);
        }
        async _revealInEditor(event, element, group, pinned = false) {
            if (element instanceof breadcrumbsModel_1.FileElement) {
                if (element.kind === files_1.FileKind.FILE) {
                    await this._editorService.openEditor({ resource: element.uri, options: { pinned } }, group);
                }
                else {
                    // show next picker
                    const items = this._widget.getItems();
                    const idx = items.indexOf(event.item);
                    this._widget.setFocused(items[idx + 1]);
                    this._widget.setSelection(items[idx + 1], BreadcrumbsControl_1.Payload_Pick);
                }
            }
            else {
                element.outline.reveal(element, { pinned }, group === editorService_1.SIDE_GROUP);
            }
        }
        _getEditorGroup(data) {
            if (data === BreadcrumbsControl_1.Payload_RevealAside) {
                return editorService_1.SIDE_GROUP;
            }
            else if (data === BreadcrumbsControl_1.Payload_Reveal) {
                return editorService_1.ACTIVE_GROUP;
            }
            else {
                return undefined;
            }
        }
    };
    exports.BreadcrumbsControl = BreadcrumbsControl;
    exports.BreadcrumbsControl = BreadcrumbsControl = BreadcrumbsControl_1 = __decorate([
        __param(3, contextkey_1.IContextKeyService),
        __param(4, contextView_1.IContextViewService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, quickInput_1.IQuickInputService),
        __param(7, files_1.IFileService),
        __param(8, editorService_1.IEditorService),
        __param(9, label_1.ILabelService),
        __param(10, configuration_1.IConfigurationService),
        __param(11, breadcrumbs_1.IBreadcrumbsService)
    ], BreadcrumbsControl);
    let BreadcrumbsControlFactory = class BreadcrumbsControlFactory {
        get control() { return this._control; }
        get onDidEnablementChange() { return this._onDidEnablementChange.event; }
        constructor(container, editorGroup, options, configurationService, instantiationService, fileService) {
            this._disposables = new lifecycle_1.DisposableStore();
            this._onDidEnablementChange = this._disposables.add(new event_1.Emitter());
            const config = this._disposables.add(breadcrumbs_1.BreadcrumbsConfig.IsEnabled.bindTo(configurationService));
            this._disposables.add(config.onDidChange(() => {
                const value = config.getValue();
                if (!value && this._control) {
                    this._control.dispose();
                    this._control = undefined;
                    this._onDidEnablementChange.fire();
                }
                else if (value && !this._control) {
                    this._control = instantiationService.createInstance(BreadcrumbsControl, container, options, editorGroup);
                    this._control.update();
                    this._onDidEnablementChange.fire();
                }
            }));
            if (config.getValue()) {
                this._control = instantiationService.createInstance(BreadcrumbsControl, container, options, editorGroup);
            }
            this._disposables.add(fileService.onDidChangeFileSystemProviderRegistrations(e => {
                if (this._control?.model && this._control.model.resource.scheme !== e.scheme) {
                    // ignore if the scheme of the breadcrumbs resource is not affected
                    return;
                }
                if (this._control?.update()) {
                    this._onDidEnablementChange.fire();
                }
            }));
        }
        dispose() {
            this._disposables.dispose();
            this._control?.dispose();
        }
    };
    exports.BreadcrumbsControlFactory = BreadcrumbsControlFactory;
    exports.BreadcrumbsControlFactory = BreadcrumbsControlFactory = __decorate([
        __param(3, configuration_1.IConfigurationService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, files_1.IFileService)
    ], BreadcrumbsControlFactory);
    //#region commands
    // toggle command
    (0, actions_1.registerAction2)(class ToggleBreadcrumb extends actions_1.Action2 {
        constructor() {
            super({
                id: 'breadcrumbs.toggle',
                title: {
                    value: (0, nls_1.localize)('cmd.toggle', "Toggle Breadcrumbs"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miBreadcrumbs', comment: ['&& denotes a mnemonic'] }, "Toggle &&Breadcrumbs"),
                    original: 'Toggle Breadcrumbs',
                },
                category: actionCommonCategories_1.Categories.View,
                toggled: {
                    condition: contextkey_1.ContextKeyExpr.equals('config.breadcrumbs.enabled', true),
                    title: (0, nls_1.localize)('cmd.toggle2', "Breadcrumbs"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miBreadcrumbs2', comment: ['&& denotes a mnemonic'] }, "&&Breadcrumbs")
                },
                menu: [
                    { id: actions_1.MenuId.CommandPalette },
                    { id: actions_1.MenuId.MenubarAppearanceMenu, group: '4_editor', order: 2 },
                    { id: actions_1.MenuId.NotebookToolbar, group: 'notebookLayout', order: 2 },
                    { id: actions_1.MenuId.StickyScrollContext }
                ]
            });
        }
        run(accessor) {
            const config = accessor.get(configuration_1.IConfigurationService);
            const value = breadcrumbs_1.BreadcrumbsConfig.IsEnabled.bindTo(config).getValue();
            breadcrumbs_1.BreadcrumbsConfig.IsEnabled.bindTo(config).updateValue(!value);
        }
    });
    // focus/focus-and-select
    function focusAndSelectHandler(accessor, select) {
        // find widget and focus/select
        const groups = accessor.get(editorGroupsService_1.IEditorGroupsService);
        const breadcrumbs = accessor.get(breadcrumbs_1.IBreadcrumbsService);
        const widget = breadcrumbs.getWidget(groups.activeGroup.id);
        if (widget) {
            const item = (0, arrays_1.tail)(widget.getItems());
            widget.setFocused(item);
            if (select) {
                widget.setSelection(item, BreadcrumbsControl.Payload_Pick);
            }
        }
    }
    (0, actions_1.registerAction2)(class FocusAndSelectBreadcrumbs extends actions_1.Action2 {
        constructor() {
            super({
                id: 'breadcrumbs.focusAndSelect',
                title: {
                    value: (0, nls_1.localize)('cmd.focusAndSelect', "Focus and Select Breadcrumbs"),
                    original: 'Focus and Select Breadcrumbs'
                },
                precondition: BreadcrumbsControl.CK_BreadcrumbsVisible,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 89 /* KeyCode.Period */,
                    when: BreadcrumbsControl.CK_BreadcrumbsPossible,
                },
                f1: true
            });
        }
        run(accessor, ...args) {
            focusAndSelectHandler(accessor, true);
        }
    });
    (0, actions_1.registerAction2)(class FocusBreadcrumbs extends actions_1.Action2 {
        constructor() {
            super({
                id: 'breadcrumbs.focus',
                title: {
                    value: (0, nls_1.localize)('cmd.focus', "Focus Breadcrumbs"),
                    original: 'Focus Breadcrumbs'
                },
                precondition: BreadcrumbsControl.CK_BreadcrumbsVisible,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 85 /* KeyCode.Semicolon */,
                    when: BreadcrumbsControl.CK_BreadcrumbsPossible,
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
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'breadcrumbs.toggleToOn',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 89 /* KeyCode.Period */,
        when: contextkey_1.ContextKeyExpr.not('config.breadcrumbs.enabled'),
        handler: async (accessor) => {
            const instant = accessor.get(instantiation_1.IInstantiationService);
            const config = accessor.get(configuration_1.IConfigurationService);
            // check if enabled and iff not enable
            const isEnabled = breadcrumbs_1.BreadcrumbsConfig.IsEnabled.bindTo(config);
            if (!isEnabled.getValue()) {
                await isEnabled.updateValue(true);
                await (0, async_1.timeout)(50); // hacky - the widget might not be ready yet...
            }
            return instant.invokeFunction(focusAndSelectHandler, true);
        }
    });
    // navigation
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'breadcrumbs.focusNext',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 17 /* KeyCode.RightArrow */,
        secondary: [2048 /* KeyMod.CtrlCmd */ | 17 /* KeyCode.RightArrow */],
        mac: {
            primary: 17 /* KeyCode.RightArrow */,
            secondary: [512 /* KeyMod.Alt */ | 17 /* KeyCode.RightArrow */],
        },
        when: contextkey_1.ContextKeyExpr.and(BreadcrumbsControl.CK_BreadcrumbsVisible, BreadcrumbsControl.CK_BreadcrumbsActive),
        handler(accessor) {
            const groups = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const breadcrumbs = accessor.get(breadcrumbs_1.IBreadcrumbsService);
            const widget = breadcrumbs.getWidget(groups.activeGroup.id);
            if (!widget) {
                return;
            }
            widget.focusNext();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'breadcrumbs.focusPrevious',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 15 /* KeyCode.LeftArrow */,
        secondary: [2048 /* KeyMod.CtrlCmd */ | 15 /* KeyCode.LeftArrow */],
        mac: {
            primary: 15 /* KeyCode.LeftArrow */,
            secondary: [512 /* KeyMod.Alt */ | 15 /* KeyCode.LeftArrow */],
        },
        when: contextkey_1.ContextKeyExpr.and(BreadcrumbsControl.CK_BreadcrumbsVisible, BreadcrumbsControl.CK_BreadcrumbsActive),
        handler(accessor) {
            const groups = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const breadcrumbs = accessor.get(breadcrumbs_1.IBreadcrumbsService);
            const widget = breadcrumbs.getWidget(groups.activeGroup.id);
            if (!widget) {
                return;
            }
            widget.focusPrev();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'breadcrumbs.focusNextWithPicker',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1,
        primary: 2048 /* KeyMod.CtrlCmd */ | 17 /* KeyCode.RightArrow */,
        mac: {
            primary: 512 /* KeyMod.Alt */ | 17 /* KeyCode.RightArrow */,
        },
        when: contextkey_1.ContextKeyExpr.and(BreadcrumbsControl.CK_BreadcrumbsVisible, BreadcrumbsControl.CK_BreadcrumbsActive, listService_1.WorkbenchListFocusContextKey),
        handler(accessor) {
            const groups = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const breadcrumbs = accessor.get(breadcrumbs_1.IBreadcrumbsService);
            const widget = breadcrumbs.getWidget(groups.activeGroup.id);
            if (!widget) {
                return;
            }
            widget.focusNext();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'breadcrumbs.focusPreviousWithPicker',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1,
        primary: 2048 /* KeyMod.CtrlCmd */ | 15 /* KeyCode.LeftArrow */,
        mac: {
            primary: 512 /* KeyMod.Alt */ | 15 /* KeyCode.LeftArrow */,
        },
        when: contextkey_1.ContextKeyExpr.and(BreadcrumbsControl.CK_BreadcrumbsVisible, BreadcrumbsControl.CK_BreadcrumbsActive, listService_1.WorkbenchListFocusContextKey),
        handler(accessor) {
            const groups = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const breadcrumbs = accessor.get(breadcrumbs_1.IBreadcrumbsService);
            const widget = breadcrumbs.getWidget(groups.activeGroup.id);
            if (!widget) {
                return;
            }
            widget.focusPrev();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'breadcrumbs.selectFocused',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 3 /* KeyCode.Enter */,
        secondary: [18 /* KeyCode.DownArrow */],
        when: contextkey_1.ContextKeyExpr.and(BreadcrumbsControl.CK_BreadcrumbsVisible, BreadcrumbsControl.CK_BreadcrumbsActive),
        handler(accessor) {
            const groups = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const breadcrumbs = accessor.get(breadcrumbs_1.IBreadcrumbsService);
            const widget = breadcrumbs.getWidget(groups.activeGroup.id);
            if (!widget) {
                return;
            }
            widget.setSelection(widget.getFocused(), BreadcrumbsControl.Payload_Pick);
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'breadcrumbs.revealFocused',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 10 /* KeyCode.Space */,
        secondary: [2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */],
        when: contextkey_1.ContextKeyExpr.and(BreadcrumbsControl.CK_BreadcrumbsVisible, BreadcrumbsControl.CK_BreadcrumbsActive),
        handler(accessor) {
            const groups = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const breadcrumbs = accessor.get(breadcrumbs_1.IBreadcrumbsService);
            const widget = breadcrumbs.getWidget(groups.activeGroup.id);
            if (!widget) {
                return;
            }
            widget.setSelection(widget.getFocused(), BreadcrumbsControl.Payload_Reveal);
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'breadcrumbs.selectEditor',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1,
        primary: 9 /* KeyCode.Escape */,
        when: contextkey_1.ContextKeyExpr.and(BreadcrumbsControl.CK_BreadcrumbsVisible, BreadcrumbsControl.CK_BreadcrumbsActive),
        handler(accessor) {
            const groups = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const breadcrumbs = accessor.get(breadcrumbs_1.IBreadcrumbsService);
            const widget = breadcrumbs.getWidget(groups.activeGroup.id);
            if (!widget) {
                return;
            }
            widget.setFocused(undefined);
            widget.setSelection(undefined);
            groups.activeGroup.activeEditorPane?.focus();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'breadcrumbs.revealFocusedFromTreeAside',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
        when: contextkey_1.ContextKeyExpr.and(BreadcrumbsControl.CK_BreadcrumbsVisible, BreadcrumbsControl.CK_BreadcrumbsActive, listService_1.WorkbenchListFocusContextKey),
        handler(accessor) {
            const editors = accessor.get(editorService_1.IEditorService);
            const lists = accessor.get(listService_1.IListService);
            const tree = lists.lastFocusedList;
            if (!(tree instanceof listService_1.WorkbenchDataTree) && !(tree instanceof listService_1.WorkbenchAsyncDataTree)) {
                return;
            }
            const element = tree.getFocus()[0];
            if (uri_1.URI.isUri(element?.resource)) {
                // IFileStat: open file in editor
                return editors.openEditor({
                    resource: element.resource,
                    options: { pinned: true }
                }, editorService_1.SIDE_GROUP);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJlYWRjcnVtYnNDb250cm9sLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2Jyb3dzZXIvcGFydHMvZWRpdG9yL2JyZWFkY3J1bWJzQ29udHJvbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBd0NoRyxNQUFNLFdBQVksU0FBUSxtQ0FBZTtRQUl4QyxZQUNVLEtBQXVCLEVBQ3ZCLE9BQXdCLEVBQ3hCLE9BQW1DO1lBRTVDLEtBQUssRUFBRSxDQUFDO1lBSkMsVUFBSyxHQUFMLEtBQUssQ0FBa0I7WUFDdkIsWUFBTyxHQUFQLE9BQU8sQ0FBaUI7WUFDeEIsWUFBTyxHQUFQLE9BQU8sQ0FBNEI7WUFMNUIsaUJBQVksR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztRQVF0RCxDQUFDO1FBRVEsT0FBTztZQUNmLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDN0IsQ0FBQztRQUVELE1BQU0sQ0FBQyxLQUFzQjtZQUM1QixJQUFJLENBQUMsQ0FBQyxLQUFLLFlBQVksV0FBVyxDQUFDLEVBQUU7Z0JBQ3BDLE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFDRCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxLQUFLLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTztnQkFDcEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEtBQUssS0FBSyxDQUFDLE9BQU8sQ0FBQyxhQUFhO2dCQUMxRCxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsS0FBSyxLQUFLLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQztRQUNqRSxDQUFDO1FBRUQsTUFBTSxDQUFDLFNBQXNCO1lBQzVCLE1BQU0sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUUxQyxJQUFJLE9BQU8sS0FBSyxPQUFPLEVB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