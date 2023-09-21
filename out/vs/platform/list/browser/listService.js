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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/list/listPaging", "vs/base/browser/ui/list/listWidget", "vs/base/browser/ui/table/tableWidget", "vs/base/browser/ui/tree/abstractTree", "vs/base/browser/ui/tree/asyncDataTree", "vs/base/browser/ui/tree/dataTree", "vs/base/browser/ui/tree/objectTree", "vs/base/common/event", "vs/base/common/lifecycle", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextkey/common/contextkey", "vs/platform/contextkey/common/contextkeys", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/registry/common/platform", "vs/platform/theme/browser/defaultStyles"], function (require, exports, dom_1, listPaging_1, listWidget_1, tableWidget_1, abstractTree_1, asyncDataTree_1, dataTree_1, objectTree_1, event_1, lifecycle_1, nls_1, configuration_1, configurationRegistry_1, contextkey_1, contextkeys_1, contextView_1, instantiation_1, keybinding_1, platform_1, defaultStyles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkbenchCompressibleAsyncDataTree = exports.WorkbenchAsyncDataTree = exports.WorkbenchDataTree = exports.WorkbenchCompressibleObjectTree = exports.WorkbenchObjectTree = exports.getSelectionKeyboardEvent = exports.WorkbenchTable = exports.WorkbenchPagedList = exports.WorkbenchList = exports.WorkbenchTreeFindOpen = exports.WorkbenchTreeElementHasChild = exports.WorkbenchTreeElementCanExpand = exports.WorkbenchTreeElementHasParent = exports.WorkbenchTreeElementCanCollapse = exports.WorkbenchListSupportsFind = exports.WorkbenchListSelectionNavigation = exports.WorkbenchListMultiSelection = exports.WorkbenchListDoubleSelection = exports.WorkbenchListHasSelectionOrFocus = exports.WorkbenchListFocusContextKey = exports.WorkbenchListSupportsMultiSelectContextKey = exports.RawWorkbenchListFocusContextKey = exports.WorkbenchListScrollAtBottomContextKey = exports.WorkbenchListScrollAtTopContextKey = exports.RawWorkbenchListScrollAtBoundaryContextKey = exports.ListService = exports.IListService = void 0;
    exports.IListService = (0, instantiation_1.createDecorator)('listService');
    class ListService {
        get lastFocusedList() {
            return this._lastFocusedWidget;
        }
        constructor() {
            this.disposables = new lifecycle_1.DisposableStore();
            this.lists = [];
            this._lastFocusedWidget = undefined;
            this._hasCreatedStyleController = false;
        }
        setLastFocusedList(widget) {
            if (widget === this._lastFocusedWidget) {
                return;
            }
            this._lastFocusedWidget?.getHTMLElement().classList.remove('last-focused');
            this._lastFocusedWidget = widget;
            this._lastFocusedWidget?.getHTMLElement().classList.add('last-focused');
        }
        register(widget, extraContextKeys) {
            if (!this._hasCreatedStyleController) {
                this._hasCreatedStyleController = true;
                // create a shared default tree style sheet for performance reasons
                const styleController = new listWidget_1.DefaultStyleController((0, dom_1.createStyleSheet)(), '');
                styleController.style(defaultStyles_1.defaultListStyles);
            }
            if (this.lists.some(l => l.widget === widget)) {
                throw new Error('Cannot register the same widget multiple times');
            }
            // Keep in our lists list
            const registeredList = { widget, extraContextKeys };
            this.lists.push(registeredList);
            // Check for currently being focused
            if (widget.getHTMLElement() === document.activeElement) {
                this.setLastFocusedList(widget);
            }
            return (0, lifecycle_1.combinedDisposable)(widget.onDidFocus(() => this.setLastFocusedList(widget)), (0, lifecycle_1.toDisposable)(() => this.lists.splice(this.lists.indexOf(registeredList), 1)), widget.onDidDispose(() => {
                this.lists = this.lists.filter(l => l !== registeredList);
                if (this._lastFocusedWidget === widget) {
                    this.setLastFocusedList(undefined);
                }
            }));
        }
        dispose() {
            this.disposables.dispose();
        }
    }
    exports.ListService = ListService;
    exports.RawWorkbenchListScrollAtBoundaryContextKey = new contextkey_1.RawContextKey('listScrollAtBoundary', 'none');
    exports.WorkbenchListScrollAtTopContextKey = contextkey_1.ContextKeyExpr.or(exports.RawWorkbenchListScrollAtBoundaryContextKey.isEqualTo('top'), exports.RawWorkbenchListScrollAtBoundaryContextKey.isEqualTo('both'));
    exports.WorkbenchListScrollAtBottomContextKey = contextkey_1.ContextKeyExpr.or(exports.RawWorkbenchListScrollAtBoundaryContextKey.isEqualTo('bottom'), exports.RawWorkbenchListScrollAtBoundaryContextKey.isEqualTo('both'));
    exports.RawWorkbenchListFocusContextKey = new contextkey_1.RawContextKey('listFocus', true);
    exports.WorkbenchListSupportsMultiSelectContextKey = new contextkey_1.RawContextKey('listSupportsMultiselect', true);
    exports.WorkbenchListFocusContextKey = contextkey_1.ContextKeyExpr.and(exports.RawWorkbenchListFocusContextKey, contextkey_1.ContextKeyExpr.not(contextkeys_1.InputFocusedContextKey));
    exports.WorkbenchListHasSelectionOrFocus = new contextkey_1.RawContextKey('listHasSelectionOrFocus', false);
    exports.WorkbenchListDoubleSelection = new contextkey_1.RawContextKey('listDoubleSelection', false);
    exports.WorkbenchListMultiSelection = new contextkey_1.RawContextKey('listMultiSelection', false);
    exports.WorkbenchListSelectionNavigation = new contextkey_1.RawContextKey('listSelectionNavigation', false);
    exports.WorkbenchListSupportsFind = new contextkey_1.RawContextKey('listSupportsFind', true);
    exports.WorkbenchTreeElementCanCollapse = new contextkey_1.RawContextKey('treeElementCanCollapse', false);
    exports.WorkbenchTreeElementHasParent = new contextkey_1.RawContextKey('treeElementHasParent', false);
    exports.WorkbenchTreeElementCanExpand = new contextkey_1.RawContextKey('treeElementCanExpand', false);
    exports.WorkbenchTreeElementHasChild = new contextkey_1.RawContextKey('treeElementHasChild', false);
    exports.WorkbenchTreeFindOpen = new contextkey_1.RawContextKey('treeFindOpen', false);
    const WorkbenchListTypeNavigationModeKey = 'listTypeNavigationMode';
    /**
     * @deprecated in favor of WorkbenchListTypeNavigationModeKey
     */
    const WorkbenchListAutomaticKeyboardNavigationLegacyKey = 'listAutomaticKeyboardNavigation';
    function createScopedContextKeyService(contextKeyService, widget) {
        const result = contextKeyService.createScoped(widget.getHTMLElement());
        exports.RawWorkbenchListFocusContextKey.bindTo(result);
        return result;
    }
    function createScrollObserver(contextKeyService, widget) {
        const listScrollAt = exports.RawWorkbenchListScrollAtBoundaryContextKey.bindTo(contextKeyService);
        const update = () => {
            const atTop = widget.scrollTop === 0;
            // We need a threshold `1` since scrollHeight is rounded.
            // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight#determine_if_an_element_has_been_totally_scrolled
            const atBottom = widget.scrollHeight - widget.renderHeight - widget.scrollTop < 1;
            if (atTop && atBottom) {
                listScrollAt.set('both');
            }
            else if (atTop) {
                listScrollAt.set('top');
            }
            else if (atBottom) {
                listScrollAt.set('bottom');
            }
            else {
                listScrollAt.set('none');
            }
        };
        update();
        return widget.onDidScroll(update);
    }
    const multiSelectModifierSettingKey = 'workbench.list.multiSelectModifier';
    const openModeSettingKey = 'workbench.list.openMode';
    const horizontalScrollingKey = 'workbench.list.horizontalScrolling';
    const defaultFindModeSettingKey = 'workbench.list.defaultFindMode';
    const typeNavigationModeSettingKey = 'workbench.list.typeNavigationMode';
    /** @deprecated in favor of `workbench.list.defaultFindMode` and `workbench.list.typeNavigationMode` */
    const keyboardNavigationSettingKey = 'workbench.list.keyboardNavigation';
    const scrollByPageKey = 'workbench.list.scrollByPage';
    const defaultFindMatchTypeSettingKey = 'workbench.list.defaultFindMatchType';
    const treeIndentKey = 'workbench.tree.indent';
    const treeRenderIndentGuidesKey = 'workbench.tree.renderIndentGuides';
    const listSmoothScrolling = 'workbench.list.smoothScrolling';
    const mouseWheelScrollSensitivityKey = 'workbench.list.mouseWheelScrollSensitivity';
    const fastScrollSensitivityKey = 'workbench.list.fastScrollSensitivity';
    const treeExpandMode = 'workbench.tree.expandMode';
    function useAltAsMultipleSelectionModifier(configurationService) {
        return configurationService.getValue(multiSelectModifierSettingKey) === 'alt';
    }
    class MultipleSelectionController extends lifecycle_1.Disposable {
        constructor(configurationService) {
            super();
            this.configurationService = configurationService;
            this.useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(multiSelectModifierSettingKey)) {
                    this.useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(this.configurationService);
                }
            }));
        }
        isSelectionSingleChangeEvent(event) {
            if (this.useAltAsMultipleSelectionModifier) {
                return event.browserEvent.altKey;
            }
            return (0, listWidget_1.isSelectionSingleChangeEvent)(event);
        }
        isSelectionRangeChangeEvent(event) {
            return (0, listWidget_1.isSelectionRangeChangeEvent)(event);
        }
    }
    function toWorkbenchListOptions(accessor, options) {
        const configurationService = accessor.get(configuration_1.IConfigurationService);
        const keybindingService = accessor.get(keybinding_1.IKeybindingService);
        const disposables = new lifecycle_1.DisposableStore();
        const result = {
            ...options,
            keyboardNavigationDelegate: { mightProducePrintableCharacter(e) { return keybindingService.mightProducePrintableCharacter(e); } },
            smoothScrolling: Boolean(configurationService.getValue(listSmoothScrolling)),
            mouseWheelScrollSensitivity: configurationService.getValue(mouseWheelScrollSensitivityKey),
            fastScrollSensitivity: configurationService.getValue(fastScrollSensitivityKey),
            multipleSelectionController: options.multipleSelectionController ?? disposables.add(new MultipleSelectionController(configurationService)),
            keyboardNavigationEventFilter: createKeyboardNavigationEventFilter(keybindingService),
            scrollByPage: Boolean(configurationService.getValue(scrollByPageKey))
        };
        return [result, disposables];
    }
    let WorkbenchList = class WorkbenchList extends listWidget_1.List {
        get onDidOpen() { return this.navigator.onDidOpen; }
        constructor(user, container, delegate, renderers, options, contextKeyService, listService, configurationService, instantiationService) {
            const horizontalScrolling = typeof options.horizontalScrolling !== 'undefined' ? options.horizontalScrolling : Boolean(configurationService.getValue(horizontalScrollingKey));
            const [workbenchListOptions, workbenchListOptionsDisposable] = instantiationService.invokeFunction(toWorkbenchListOptions, options);
            super(user, container, delegate, renderers, {
                keyboardSupport: false,
                ...workbenchListOptions,
                horizontalScrolling,
            });
            this.disposables.add(workbenchListOptionsDisposable);
            this.contextKeyService = createScopedContextKeyService(contextKeyService, this);
            this.disposables.add(createScrollObserver(this.contextKeyService, this));
            this.listSupportsMultiSelect = exports.WorkbenchListSupportsMultiSelectContextKey.bindTo(this.contextKeyService);
            this.listSupportsMultiSelect.set(options.multipleSelectionSupport !== false);
            const listSelectionNavigation = exports.WorkbenchListSelectionNavigation.bindTo(this.contextKeyService);
            listSelectionNavigation.set(Boolean(options.selectionNavigation));
            this.listHasSelectionOrFocus = exports.WorkbenchListHasSelectionOrFocus.bindTo(this.contextKeyService);
            this.listDoubleSelection = exports.WorkbenchListDoubleSelection.bindTo(this.contextKeyService);
            this.listMultiSelection = exports.WorkbenchListMultiSelection.bindTo(this.contextKeyService);
            this.horizontalScrolling = options.horizontalScrolling;
            this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
            this.disposables.add(this.contextKeyService);
            this.disposables.add(listService.register(this));
            this.updateStyles(options.overrideStyles);
            this.disposables.add(this.onDidChangeSelection(() => {
                const selection = this.getSelection();
                const focus = this.getFocus();
                this.contextKeyService.bufferChangeEvents(() => {
                    this.listHasSelectionOrFocus.set(selection.length > 0 || focus.length > 0);
                    this.listMultiSelection.set(selection.length > 1);
                    this.listDoubleSelection.set(selection.length === 2);
                });
            }));
            this.disposables.add(this.onDidChangeFocus(() => {
                const selection = this.getSelection();
                const focus = this.getFocus();
                this.listHasSelectionOrFocus.set(selection.length > 0 || focus.length > 0);
            }));
            this.disposables.add(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(multiSelectModifierSettingKey)) {
                    this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
                }
                let options = {};
                if (e.affectsConfiguration(horizontalScrollingKey) && this.horizontalScrolling === undefined) {
                    const horizontalScrolling = Boolean(configurationService.getValue(horizontalScrollingKey));
                    options = { ...options, horizontalScrolling };
                }
                if (e.affectsConfiguration(scrollByPageKey)) {
                    const scrollByPage = Boolean(configurationService.getValue(scrollByPageKey));
                    options = { ...options, scrollByPage };
                }
                if (e.affectsConfiguration(listSmoothScrolling)) {
                    const smoothScrolling = Boolean(configurationService.getValue(listSmoothScrolling));
                    options = { ...options, smoothScrolling };
                }
                if (e.affectsConfiguration(mouseWheelScrollSensitivityKey)) {
                    const mouseWheelScrollSensitivity = configurationService.getValue(mouseWheelScrollSensitivityKey);
                    options = { ...options, mouseWheelScrollSensitivity };
                }
                if (e.affectsConfiguration(fastScrollSensitivityKey)) {
                    const fastScrollSensitivity = configurationService.getValue(fastScrollSensitivityKey);
                    options = { ...options, fastScrollSensitivity };
                }
                if (Object.keys(options).length > 0) {
                    this.updateOptions(options);
                }
            }));
            this.navigator = new ListResourceNavigator(this, { configurationService, ...options });
            this.disposables.add(this.navigator);
        }
        updateOptions(options) {
            super.updateOptions(options);
            if (options.overrideStyles !== undefined) {
                this.updateStyles(options.overrideStyles);
            }
            if (options.multipleSelectionSupport !== undefined) {
                this.listSupportsMultiSelect.set(!!options.multipleSelectionSupport);
            }
        }
        updateStyles(styles) {
            this.style(styles ? (0, defaultStyles_1.getListStyles)(styles) : defaultStyles_1.defaultListStyles);
        }
        get useAltAsMultipleSelectionModifier() {
            return this._useAltAsMultipleSelectionModifier;
        }
    };
    exports.WorkbenchList = WorkbenchList;
    exports.WorkbenchList = WorkbenchList = __decorate([
        __param(5, contextkey_1.IContextKeyService),
        __param(6, exports.IListService),
        __param(7, configuration_1.IConfigurationService),
        __param(8, instantiation_1.IInstantiationService)
    ], WorkbenchList);
    let WorkbenchPagedList = class WorkbenchPagedList extends listPaging_1.PagedList {
        get onDidOpen() { return this.navigator.onDidOpen; }
        constructor(user, container, delegate, renderers, options, contextKeyService, listService, configurationService, instantiationService) {
            const horizontalScrolling = typeof options.horizontalScrolling !== 'undefined' ? options.horizontalScrolling : Boolean(configurationService.getValue(horizontalScrollingKey));
            const [workbenchListOptions, workbenchListOptionsDisposable] = instantiationService.invokeFunction(toWorkbenchListOptions, options);
            super(user, container, delegate, renderers, {
                keyboardSupport: false,
                ...workbenchListOptions,
                horizontalScrolling,
            });
            this.disposables = new lifecycle_1.DisposableStore();
            this.disposables.add(workbenchListOptionsDisposable);
            this.contextKeyService = createScopedContextKeyService(contextKeyService, this);
            this.disposables.add(createScrollObserver(this.contextKeyService, this.widget));
            this.horizontalScrolling = options.horizontalScrolling;
            this.listSupportsMultiSelect = exports.WorkbenchListSupportsMultiSelectContextKey.bindTo(this.contextKeyService);
            this.listSupportsMultiSelect.set(options.multipleSelectionSupport !== false);
            const listSelectionNavigation = exports.WorkbenchListSelectionNavigation.bindTo(this.contextKeyService);
            listSelectionNavigation.set(Boolean(options.selectionNavigation));
            this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
            this.disposables.add(this.contextKeyService);
            this.disposables.add(listService.register(this));
            this.updateStyles(options.overrideStyles);
            this.disposables.add(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(multiSelectModifierSettingKey)) {
                    this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
                }
                let options = {};
                if (e.affectsConfiguration(horizontalScrollingKey) && this.horizontalScrolling === undefined) {
                    const horizontalScrolling = Boolean(configurationService.getValue(horizontalScrollingKey));
                    options = { ...options, horizontalScrolling };
                }
                if (e.affectsConfiguration(scrollByPageKey)) {
                    const scrollByPage = Boolean(configurationService.getValue(scrollByPageKey));
                    options = { ...options, scrollByPage };
                }
                if (e.affectsConfiguration(listSmoothScrolling)) {
                    const smoothScrolling = Boolean(configurationService.getValue(listSmoothScrolling));
                    options = { ...options, smoothScrolling };
                }
                if (e.affectsConfiguration(mouseWheelScrollSensitivityKey)) {
                    const mouseWheelScrollSensitivity = configurationService.getValue(mouseWheelScrollSensitivityKey);
                    options = { ...options, mouseWheelScrollSensitivity };
                }
                if (e.affectsConfiguration(fastScrollSensitivityKey)) {
                    const fastScrollSensitivity = configurationService.getValue(fastScrollSensitivityKey);
                    options = { ...options, fastScrollSensitivity };
                }
                if (Object.keys(options).length > 0) {
                    this.updateOptions(options);
                }
            }));
            this.navigator = new ListResourceNavigator(this, { configurationService, ...options });
            this.disposables.add(this.navigator);
        }
        updateOptions(options) {
            super.updateOptions(options);
            if (options.overrideStyles !== undefined) {
                this.updateStyles(options.overrideStyles);
            }
            if (options.multipleSelectionSupport !== undefined) {
                this.listSupportsMultiSelect.set(!!options.multipleSelectionSupport);
            }
        }
        updateStyles(styles) {
            this.style(styles ? (0, defaultStyles_1.getListStyles)(styles) : defaultStyles_1.defaultListStyles);
        }
        get useAltAsMultipleSelectionModifier() {
            return this._useAltAsMultipleSelectionModifier;
        }
        dispose() {
            this.disposables.dispose();
            super.dispose();
        }
    };
    exports.WorkbenchPagedList = WorkbenchPagedList;
    exports.WorkbenchPagedList = WorkbenchPagedList = __decorate([
        __param(5, contextkey_1.IContextKeyService),
        __param(6, exports.IListService),
        __param(7, configuration_1.IConfigurationService),
        __param(8, instantiation_1.IInstantiationService)
    ], WorkbenchPagedList);
    let WorkbenchTable = class WorkbenchTable extends tableWidget_1.Table {
        get onDidOpen() { return this.navigator.onDidOpen; }
        constructor(user, container, delegate, columns, renderers, options, contextKeyService, listService, configurationService, instantiationService) {
            const horizontalScrolling = typeof options.horizontalScrolling !== 'undefined' ? options.horizontalScrolling : Boolean(configurationService.getValue(horizontalScrollingKey));
            const [workbenchListOptions, workbenchListOptionsDisposable] = instantiationService.invokeFunction(toWorkbenchListOptions, options);
            super(user, container, delegate, columns, renderers, {
                keyboardSupport: false,
                ...workbenchListOptions,
                horizontalScrolling,
            });
            this.disposables.add(workbenchListOptionsDisposable);
            this.contextKeyService = createScopedContextKeyService(contextKeyService, this);
            this.disposables.add(createScrollObserver(this.contextKeyService, this));
            this.listSupportsMultiSelect = exports.WorkbenchListSupportsMultiSelectContextKey.bindTo(this.contextKeyService);
            this.listSupportsMultiSelect.set(options.multipleSelectionSupport !== false);
            const listSelectionNavigation = exports.WorkbenchListSelectionNavigation.bindTo(this.contextKeyService);
            listSelectionNavigation.set(Boolean(options.selectionNavigation));
            this.listHasSelectionOrFocus = exports.WorkbenchListHasSelectionOrFocus.bindTo(this.contextKeyService);
            this.listDoubleSelection = exports.WorkbenchListDoubleSelection.bindTo(this.contextKeyService);
            this.listMultiSelection = exports.WorkbenchListMultiSelection.bindTo(this.contextKeyService);
            this.horizontalScrolling = options.horizontalScrolling;
            this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
            this.disposables.add(this.contextKeyService);
            this.disposables.add(listService.register(this));
            this.updateStyles(options.overrideStyles);
            this.disposables.add(this.onDidChangeSelection(() => {
                const selection = this.getSelection();
                const focus = this.getFocus();
                this.contextKeyService.bufferChangeEvents(() => {
                    this.listHasSelectionOrFocus.set(selection.length > 0 || focus.length > 0);
                    this.listMultiSelection.set(selection.length > 1);
                    this.listDoubleSelection.set(selection.length === 2);
                });
            }));
            this.disposables.add(this.onDidChangeFocus(() => {
                const selection = this.getSelection();
                const focus = this.getFocus();
                this.listHasSelectionOrFocus.set(selection.length > 0 || focus.length > 0);
            }));
            this.disposables.add(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(multiSelectModifierSettingKey)) {
                    this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
                }
                let options = {};
                if (e.affectsConfiguration(horizontalScrollingKey) && this.horizontalScrolling === undefined) {
                    const horizontalScrolling = Boolean(configurationService.getValue(horizontalScrollingKey));
                    options = { ...options, horizontalScrolling };
                }
                if (e.affectsConfiguration(scrollByPageKey)) {
                    const scrollByPage = Boolean(configurationService.getValue(scrollByPageKey));
                    options = { ...options, scrollByPage };
                }
                if (e.affectsConfiguration(listSmoothScrolling)) {
                    const smoothScrolling = Boolean(configurationService.getValue(listSmoothScrolling));
                    options = { ...options, smoothScrolling };
                }
                if (e.affectsConfiguration(mouseWheelScrollSensitivityKey)) {
                    const mouseWheelScrollSensitivity = configurationService.getValue(mouseWheelScrollSensitivityKey);
                    options = { ...options, mouseWheelScrollSensitivity };
                }
                if (e.affectsConfiguration(fastScrollSensitivityKey)) {
                    const fastScrollSensitivity = configurationService.getValue(fastScrollSensitivityKey);
                    options = { ...options, fastScrollSensitivity };
                }
                if (Object.keys(options).length > 0) {
                    this.updateOptions(options);
                }
            }));
            this.navigator = new TableResourceNavigator(this, { configurationService, ...options });
            this.disposables.add(this.navigator);
        }
        updateOptions(options) {
            super.updateOptions(options);
            if (options.overrideStyles !== undefined) {
                this.updateStyles(options.overrideStyles);
            }
            if (options.multipleSelectionSupport !== undefined) {
                this.listSupportsMultiSelect.set(!!options.multipleSelectionSupport);
            }
        }
        updateStyles(styles) {
            this.style(styles ? (0, defaultStyles_1.getListStyles)(styles) : defaultStyles_1.defaultListStyles);
        }
        get useAltAsMultipleSelectionModifier() {
            return this._useAltAsMultipleSelectionModifier;
        }
        dispose() {
            this.disposables.dispose();
            super.dispose();
        }
    };
    exports.WorkbenchTable = WorkbenchTable;
    exports.WorkbenchTable = WorkbenchTable = __decorate([
        __param(6, contextkey_1.IContextKeyService),
        __param(7, exports.IListService),
        __param(8, configuration_1.IConfigurationService),
        __param(9, instantiation_1.IInstantiationService)
    ], WorkbenchTable);
    function getSelectionKeyboardEvent(typeArg = 'keydown', preserveFocus, pinned) {
        const e = new KeyboardEvent(typeArg);
        e.preserveFocus = preserveFocus;
        e.pinned = pinned;
        e.__forceEvent = true;
        return e;
    }
    exports.getSelectionKeyboardEvent = getSelectionKeyboardEvent;
    class ResourceNavigator extends lifecycle_1.Disposable {
        constructor(widget, options) {
            super();
            this.widget = widget;
            this._onDidOpen = this._register(new event_1.Emitter());
            this.onDidOpen = this._onDidOpen.event;
            this._register(event_1.Event.filter(this.widget.onDidChangeSelection, e => e.browserEvent instanceof KeyboardEvent)(e => this.onSelectionFromKeyboard(e)));
            this._register(this.widget.onPointer((e) => this.onPointer(e.element, e.browserEvent)));
            this._register(this.widget.onMouseDblClick((e) => this.onMouseDblClick(e.element, e.browserEvent)));
            if (typeof options?.openOnSingleClick !== 'boolean' && options?.configurationService) {
                this.openOnSingleClick = options?.configurationService.getValue(openModeSettingKey) !== 'doubleClick';
                this._register(options?.configurationService.onDidChangeConfiguration(e => {
                    if (e.affectsConfiguration(openModeSettingKey)) {
                        this.openOnSingleClick = options?.configurationService.getValue(openModeSettingKey) !== 'doubleClick';
                    }
                }));
            }
            else {
                this.openOnSingleClick = options?.openOnSingleClick ?? true;
            }
        }
        onSelectionFromKeyboard(event) {
            if (event.elements.length !== 1) {
                return;
            }
            const selectionKeyboardEvent = event.browserEvent;
            const preserveFocus = typeof selectionKeyboardEvent.preserveFocus === 'boolean' ? selectionKeyboardEvent.preserveFocus : true;
            const pinned = typeof selectionKeyboardEvent.pinned === 'boolean' ? selectionKeyboardEvent.pinned : !preserveFocus;
            const sideBySide = false;
            this._open(this.getSelectedElement(), preserveFocus, pinned, sideBySide, event.browserEvent);
        }
        onPointer(element, browserEvent) {
            if (!this.openOnSingleClick) {
                return;
            }
            const isDoubleClick = browserEvent.detail === 2;
            if (isDoubleClick) {
                return;
            }
            const isMiddleClick = browserEvent.button === 1;
            const preserveFocus = true;
            const pinned = isMiddleClick;
            const sideBySide = browserEvent.ctrlKey || browserEvent.metaKey || browserEvent.altKey;
            this._open(element, preserveFocus, pinned, sideBySide, browserEvent);
        }
        onMouseDblClick(element, browserEvent) {
            if (!browserEvent) {
                return;
            }
            // copied from AbstractTree
            const target = browserEvent.target;
            const onTwistie = target.classList.contains('monaco-tl-twistie')
                || (target.classList.contains('monaco-icon-label') && target.classList.contains('folder-icon') && browserEvent.offsetX < 16);
            if (onTwistie) {
                return;
            }
            const preserveFocus = false;
            const pinned = true;
            const sideBySide = (browserEvent.ctrlKey || browserEvent.metaKey || browserEvent.altKey);
            this._open(element, preserveFocus, pinned, sideBySide, browserEvent);
        }
        _open(element, preserveFocus, pinned, sideBySide, browserEvent) {
            if (!element) {
                return;
            }
            this._onDidOpen.fire({
                editorOptions: {
                    preserveFocus,
                    pinned,
                    revealIfVisible: true
                },
                sideBySide,
                element,
                browserEvent
            });
        }
    }
    class ListResourceNavigator extends ResourceNavigator {
        constructor(widget, options) {
            super(widget, options);
            this.widget = widget;
        }
        getSelectedElement() {
            return this.widget.getSelectedElements()[0];
        }
    }
    class TableResourceNavigator extends ResourceNavigator {
        constructor(widget, options) {
            super(widget, options);
        }
        getSelectedElement() {
            return this.widget.getSelectedElements()[0];
        }
    }
    class TreeResourceNavigator extends ResourceNavigator {
        constructor(widget, options) {
            super(widget, options);
        }
        getSelectedElement() {
            return this.widget.getSelection()[0] ?? undefined;
        }
    }
    function createKeyboardNavigationEventFilter(keybindingService) {
        let inMultiChord = false;
        return event => {
            if (event.toKeyCodeChord().isModifierKey()) {
                return false;
            }
            if (inMultiChord) {
                inMultiChord = false;
                return false;
            }
            const result = keybindingService.softDispatch(event, event.target);
            if (result.kind === 1 /* ResultKind.MoreChordsNeeded */) {
                inMultiChord = true;
                return false;
            }
            inMultiChord = false;
            return result.kind === 0 /* ResultKind.NoMatchingKb */;
        };
    }
    let WorkbenchObjectTree = class WorkbenchObjectTree extends objectTree_1.ObjectTree {
        get contextKeyService() { return this.internals.contextKeyService; }
        get useAltAsMultipleSelectionModifier() { return this.internals.useAltAsMultipleSelectionModifier; }
        get onDidOpen() { return this.internals.onDidOpen; }
        constructor(user, container, delegate, renderers, options, instantiationService, contextKeyService, listService, configurationService) {
            const { options: treeOptions, getTypeNavigationMode, disposable } = instantiationService.invokeFunction(workbenchTreeDataPreamble, options);
            super(user, container, delegate, renderers, treeOptions);
            this.disposables.add(disposable);
            this.internals = new WorkbenchTreeInternals(this, options, getTypeNavigationMode, options.overrideStyles, contextKeyService, listService, configurationService);
            this.disposables.add(this.internals);
        }
        updateOptions(options) {
            super.updateOptions(options);
            this.internals.updateOptions(options);
        }
    };
    exports.WorkbenchObjectTree = WorkbenchObjectTree;
    exports.WorkbenchObjectTree = WorkbenchObjectTree = __decorate([
        __param(5, instantiation_1.IInstantiationService),
        __param(6, contextkey_1.IContextKeyService),
        __param(7, exports.IListService),
        __param(8, configuration_1.IConfigurationService)
    ], WorkbenchObjectTree);
    let WorkbenchCompressibleObjectTree = class WorkbenchCompressibleObjectTree extends objectTree_1.CompressibleObjectTree {
        get contextKeyService() { return this.internals.contextKeyService; }
        get useAltAsMultipleSelectionModifier() { return this.internals.useAltAsMultipleSelectionModifier; }
        get onDidOpen() { return this.internals.onDidOpen; }
        constructor(user, container, delegate, renderers, options, instantiationService, contextKeyService, listService, configurationService) {
            const { options: treeOptions, getTypeNavigationMode, disposable } = instantiationService.invokeFunction(workbenchTreeDataPreamble, options);
            super(user, container, delegate, renderers, treeOptions);
            this.disposables.add(disposable);
            this.internals = new WorkbenchTreeInternals(this, options, getTypeNavigationMode, options.overrideStyles, contextKeyService, listService, configurationService);
            this.disposables.add(this.internals);
        }
        updateOptions(options = {}) {
            super.updateOptions(options);
            if (options.overrideStyles) {
                this.internals.updateStyleOverrides(options.overrideStyles);
            }
            this.internals.updateOptions(options);
        }
    };
    exports.WorkbenchCompressibleObjectTree = WorkbenchCompressibleObjectTree;
    exports.WorkbenchCompressibleObjectTree = WorkbenchCompressibleObjectTree = __decorate([
        __param(5, instantiation_1.IInstantiationService),
        __param(6, contextkey_1.IContextKeyService),
        __param(7, exports.IListService),
        __param(8, configuration_1.IConfigurationService)
    ], WorkbenchCompressibleObjectTree);
    let WorkbenchDataTree = class WorkbenchDataTree extends dataTree_1.DataTree {
        get contextKeyService() { return this.internals.contextKeyService; }
        get useAltAsMultipleSelectionModifier() { return this.internals.useAltAsMultipleSelectionModifier; }
        get onDidOpen() { return this.internals.onDidOpen; }
        constructor(user, container, delegate, renderers, dataSource, options, instantiationService, contextKeyService, listService, configurationService) {
            const { options: treeOptions, getTypeNavigationMode, disposable } = instantiationService.invokeFunction(workbenchTreeDataPreamble, options);
            super(user, container, delegate, renderers, dataSource, treeOptions);
            this.disposables.add(disposable);
            this.internals = new WorkbenchTreeInternals(this, options, getTypeNavigationMode, options.overrideStyles, contextKeyService, listService, configurationService);
            this.disposables.add(this.internals);
        }
        updateOptions(options = {}) {
            super.updateOptions(options);
            if (options.overrideStyles !== undefined) {
                this.internals.updateStyleOverrides(options.overrideStyles);
            }
            this.internals.updateOptions(options);
        }
    };
    exports.WorkbenchDataTree = WorkbenchDataTree;
    exports.WorkbenchDataTree = WorkbenchDataTree = __decorate([
        __param(6, instantiation_1.IInstantiationService),
        __param(7, contextkey_1.IContextKeyService),
        __param(8, exports.IListService),
        __param(9, configuration_1.IConfigurationService)
    ], WorkbenchDataTree);
    let WorkbenchAsyncDataTree = class WorkbenchAsyncDataTree extends asyncDataTree_1.AsyncDataTree {
        get contextKeyService() { return this.internals.contextKeyService; }
        get useAltAsMultipleSelectionModifier() { return this.internals.useAltAsMultipleSelectionModifier; }
        get onDidOpen() { return this.internals.onDidOpen; }
        constructor(user, container, delegate, renderers, dataSource, options, instantiationService, contextKeyService, listService, configurationService) {
            const { options: treeOptions, getTypeNavigationMode, disposable } = instantiationService.invokeFunction(workbenchTreeDataPreamble, options);
            super(user, container, delegate, renderers, dataSource, treeOptions);
            this.disposables.add(disposable);
            this.internals = new WorkbenchTreeInternals(this, options, getTypeNavigationMode, options.overrideStyles, contextKeyService, listService, configurationService);
            this.disposables.add(this.internals);
        }
        updateOptions(options = {}) {
            super.updateOptions(options);
            if (options.overrideStyles) {
                this.internals.updateStyleOverrides(options.overrideStyles);
            }
            this.internals.updateOptions(options);
        }
    };
    exports.WorkbenchAsyncDataTree = WorkbenchAsyncDataTree;
    exports.WorkbenchAsyncDataTree = WorkbenchAsyncDataTree = __decorate([
        __param(6, instantiation_1.IInstantiationService),
        __param(7, contextkey_1.IContextKeyService),
        __param(8, exports.IListService),
        __param(9, configuration_1.IConfigurationService)
    ], WorkbenchAsyncDataTree);
    let WorkbenchCompressibleAsyncDataTree = class WorkbenchCompressibleAsyncDataTree extends asyncDataTree_1.CompressibleAsyncDataTree {
        get contextKeyService() { return this.internals.contextKeyService; }
        get useAltAsMultipleSelectionModifier() { return this.internals.useAltAsMultipleSelectionModifier; }
        get onDidOpen() { return this.internals.onDidOpen; }
        constructor(user, container, virtualDelegate, compressionDelegate, renderers, dataSource, options, instantiationService, contextKeyService, listService, configurationService) {
            const { options: treeOptions, getTypeNavigationMode, disposable } = instantiationService.invokeFunction(workbenchTreeDataPreamble, options);
            super(user, container, virtualDelegate, compressionDelegate, renderers, dataSource, treeOptions);
            this.disposables.add(disposable);
            this.internals = new WorkbenchTreeInternals(this, options, getTypeNavigationMode, options.overrideStyles, contextKeyService, listService, configurationService);
            this.disposables.add(this.internals);
        }
        updateOptions(options) {
            super.updateOptions(options);
            this.internals.updateOptions(options);
        }
    };
    exports.WorkbenchCompressibleAsyncDataTree = WorkbenchCompressibleAsyncDataTree;
    exports.WorkbenchCompressibleAsyncDataTree = WorkbenchCompressibleAsyncDataTree = __decorate([
        __param(7, instantiation_1.IInstantiationService),
        __param(8, contextkey_1.IContextKeyService),
        __param(9, exports.IListService),
        __param(10, configuration_1.IConfigurationService)
    ], WorkbenchCompressibleAsyncDataTree);
    function getDefaultTreeFindMode(configurationService) {
        const value = configurationService.getValue(defaultFindModeSettingKey);
        if (value === 'highlight') {
            return abstractTree_1.TreeFindMode.Highlight;
        }
        else if (value === 'filter') {
            return abstractTree_1.TreeFindMode.Filter;
        }
        const deprecatedValue = configurationService.getValue(keyboardNavigationSettingKey);
        if (deprecatedValue === 'simple' || deprecatedValue === 'highlight') {
            return abstractTree_1.TreeFindMode.Highlight;
        }
        else if (deprecatedValue === 'filter') {
            return abstractTree_1.TreeFindMode.Filter;
        }
        return undefined;
    }
    function getDefaultTreeFindMatchType(configurationService) {
        const value = configurationService.getValue(defaultFindMatchTypeSettingKey);
        if (value === 'fuzzy') {
            return abstractTree_1.TreeFindMatchType.Fuzzy;
        }
        else if (value === 'contiguous') {
            return abstractTree_1.TreeFindMatchType.Contiguous;
        }
        return undefined;
    }
    function workbenchTreeDataPreamble(accessor, options) {
        const configurationService = accessor.get(configuration_1.IConfigurationService);
        const contextViewService = accessor.get(contextView_1.IContextViewService);
        const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
        const instantiationService = accessor.get(instantiation_1.IInstantiationService);
        const getTypeNavigationMode = () => {
            // give priority to the context key value to specify a value
            const modeString = contextKeyService.getContextKeyValue(WorkbenchListTypeNavigationModeKey);
            if (modeString === 'automatic') {
                return listWidget_1.TypeNavigationMode.Automatic;
            }
            else if (modeString === 'trigger') {
                return listWidget_1.TypeNavigationMode.Trigger;
            }
            // also check the deprecated context key to set the mode to 'trigger'
            const modeBoolean = contextKeyService.getContextKeyValue(WorkbenchListAutomaticKeyboardNavigationLegacyKey);
            if (modeBoolean === false) {
                return listWidget_1.TypeNavigationMode.Trigger;
            }
            // finally, check the setting
            const configString = configurationService.getValue(typeNavigationModeSettingKey);
            if (configString === 'automatic') {
                return listWidget_1.TypeNavigationMode.Automatic;
            }
            else if (configString === 'trigger') {
                return listWidget_1.TypeNavigationMode.Trigger;
            }
            return undefined;
        };
        const horizontalScrolling = options.horizontalScrolling !== undefined ? options.horizontalScrolling : Boolean(configurationService.getValue(horizontalScrollingKey));
        const [workbenchListOptions, disposable] = instantiationService.invokeFunction(toWorkbenchListOptions, options);
        const paddingBottom = options.paddingBottom;
        const renderIndentGuides = options.renderIndentGuides !== undefined ? options.renderIndentGuides : configurationService.getValue(treeRenderIndentGuidesKey);
        return {
            getTypeNavigationMode,
            disposable,
            options: {
                // ...options, // TODO@Joao why is this not splatted here?
                keyboardSupport: false,
                ...workbenchListOptions,
                indent: typeof configurationService.getValue(treeIndentKey) === 'number' ? configurationService.getValue(treeIndentKey) : undefined,
                renderIndentGuides,
                smoothScrolling: Boolean(configurationService.getValue(listSmoothScrolling)),
                defaultFindMode: getDefaultTreeFindMode(configurationService),
                defaultFindMatchType: getDefaultTreeFindMatchType(configurationService),
                horizontalScrolling,
                scrollByPage: Boolean(configurationService.getValue(scrollByPageKey)),
                paddingBottom: paddingBottom,
                hideTwistiesOfChildlessElements: options.hideTwistiesOfChildlessElements,
                expandOnlyOnTwistieClick: options.expandOnlyOnTwistieClick ?? (configurationService.getValue(treeExpandMode) === 'doubleClick'),
                contextViewProvider: contextViewService,
                findWidgetStyles: defaultStyles_1.defaultFindWidgetStyles,
            }
        };
    }
    let WorkbenchTreeInternals = class WorkbenchTreeInternals {
        get onDidOpen() { return this.navigator.onDidOpen; }
        constructor(tree, options, getTypeNavigationMode, overrideStyles, contextKeyService, listService, configurationService) {
            this.tree = tree;
            this.disposables = [];
            this.contextKeyService = createScopedContextKeyService(contextKeyService, tree);
            this.disposables.push(createScrollObserver(this.contextKeyService, tree));
            this.listSupportsMultiSelect = exports.WorkbenchListSupportsMultiSelectContextKey.bindTo(this.contextKeyService);
            this.listSupportsMultiSelect.set(options.multipleSelectionSupport !== false);
            const listSelectionNavigation = exports.WorkbenchListSelectionNavigation.bindTo(this.contextKeyService);
            listSelectionNavigation.set(Boolean(options.selectionNavigation));
            this.listSupportFindWidget = exports.WorkbenchListSupportsFind.bindTo(this.contextKeyService);
            this.listSupportFindWidget.set(options.findWidgetEnabled ?? true);
            this.hasSelectionOrFocus = exports.WorkbenchListHasSelectionOrFocus.bindTo(this.contextKeyService);
            this.hasDoubleSelection = exports.WorkbenchListDoubleSelection.bindTo(this.contextKeyService);
            this.hasMultiSelection = exports.WorkbenchListMultiSelection.bindTo(this.contextKeyService);
            this.treeElementCanCollapse = exports.WorkbenchTreeElementCanCollapse.bindTo(this.contextKeyService);
            this.treeElementHasParent = exports.WorkbenchTreeElementHasParent.bindTo(this.contextKeyService);
            this.treeElementCanExpand = exports.WorkbenchTreeElementCanExpand.bindTo(this.contextKeyService);
            this.treeElementHasChild = exports.WorkbenchTreeElementHasChild.bindTo(this.contextKeyService);
            this.treeFindOpen = exports.WorkbenchTreeFindOpen.bindTo(this.contextKeyService);
            this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
            this.updateStyleOverrides(overrideStyles);
            const updateCollapseContextKeys = () => {
                const focus = tree.getFocus()[0];
                if (!focus) {
                    return;
                }
                const node = tree.getNode(focus);
                this.treeElementCanCollapse.set(node.collapsible && !node.collapsed);
                this.treeElementHasParent.set(!!tree.getParentElement(focus));
                this.treeElementCanExpand.set(node.collapsible && node.collapsed);
                this.treeElementHasChild.set(!!tree.getFirstElementChild(focus));
            };
            const interestingContextKeys = new Set();
            interestingContextKeys.add(WorkbenchListTypeNavigationModeKey);
            interestingContextKeys.add(WorkbenchListAutomaticKeyboardNavigationLegacyKey);
            this.disposables.push(this.contextKeyService, listService.register(tree), tree.onDidChangeSelection(() => {
                const selection = tree.getSelection();
                const focus = tree.getFocus();
                this.contextKeyService.bufferChangeEvents(() => {
                    this.hasSelectionOrFocus.set(selection.length > 0 || focus.length > 0);
                    this.hasMultiSelection.set(selection.length > 1);
                    this.hasDoubleSelection.set(selection.length === 2);
                });
            }), tree.onDidChangeFocus(() => {
                const selection = tree.getSelection();
                const focus = tree.getFocus();
                this.hasSelectionOrFocus.set(selection.length > 0 || focus.length > 0);
                updateCollapseContextKeys();
            }), tree.onDidChangeCollapseState(updateCollapseContextKeys), tree.onDidChangeModel(updateCollapseContextKeys), tree.onDidChangeFindOpenState(enabled => this.treeFindOpen.set(enabled)), configurationService.onDidChangeConfiguration(e => {
                let newOptions = {};
                if (e.affectsConfiguration(multiSelectModifierSettingKey)) {
                    this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
                }
                if (e.affectsConfiguration(treeIndentKey)) {
                    const indent = configurationService.getValue(treeIndentKey);
                    newOptions = { ...newOptions, indent };
                }
                if (e.affectsConfiguration(treeRenderIndentGuidesKey) && options.renderIndentGuides === undefined) {
                    const renderIndentGuides = configurationService.getValue(treeRenderIndentGuidesKey);
                    newOptions = { ...newOptions, renderIndentGuides };
                }
                if (e.affectsConfiguration(listSmoothScrolling)) {
                    const smoothScrolling = Boolean(configurationService.getValue(listSmoothScrolling));
                    newOptions = { ...newOptions, smoothScrolling };
                }
                if (e.affectsConfiguration(defaultFindModeSettingKey) || e.affectsConfiguration(keyboardNavigationSettingKey)) {
                    const defaultFindMode = getDefaultTreeFindMode(configurationService);
                    newOptions = { ...newOptions, defaultFindMode };
                }
                if (e.affectsConfiguration(typeNavigationModeSettingKey) || e.affectsConfiguration(keyboardNavigationSettingKey)) {
                    const typeNavigationMode = getTypeNavigationMode();
                    newOptions = { ...newOptions, typeNavigationMode };
                }
                if (e.affectsConfiguration(defaultFindMatchTypeSettingKey)) {
                    const defaultFindMatchType = getDefaultTreeFindMatchType(configurationService);
                    newOptions = { ...newOptions, defaultFindMatchType };
                }
                if (e.affectsConfiguration(horizontalScrollingKey) && options.horizontalScrolling === undefined) {
                    const horizontalScrolling = Boolean(configurationService.getValue(horizontalScrollingKey));
                    newOptions = { ...newOptions, horizontalScrolling };
                }
                if (e.affectsConfiguration(scrollByPageKey)) {
                    const scrollByPage = Boolean(configurationService.getValue(scrollByPageKey));
                    newOptions = { ...newOptions, scrollByPage };
                }
                if (e.affectsConfiguration(treeExpandMode) && options.expandOnlyOnTwistieClick === undefined) {
                    newOptions = { ...newOptions, expandOnlyOnTwistieClick: configurationService.getValue(treeExpandMode) === 'doubleClick' };
                }
                if (e.affectsConfiguration(mouseWheelScrollSensitivityKey)) {
                    const mouseWheelScrollSensitivity = configurationService.getValue(mouseWheelScrollSensitivityKey);
                    newOptions = { ...newOptions, mouseWheelScrollSensitivity };
                }
                if (e.affectsConfiguration(fastScrollSensitivityKey)) {
                    const fastScrollSensitivity = configurationService.getValue(fastScrollSensitivityKey);
                    newOptions = { ...newOptions, fastScrollSensitivity };
                }
                if (Object.keys(newOptions).length > 0) {
                    tree.updateOptions(newOptions);
                }
            }), this.contextKeyService.onDidChangeContext(e => {
                if (e.affectsSome(interestingContextKeys)) {
                    tree.updateOptions({ typeNavigationMode: getTypeNavigationMode() });
                }
            }));
            this.navigator = new TreeResourceNavigator(tree, { configurationService, ...options });
            this.disposables.push(this.navigator);
        }
        get useAltAsMultipleSelectionModifier() {
            return this._useAltAsMultipleSelectionModifier;
        }
        updateOptions(options) {
            if (options.multipleSelectionSupport !== undefined) {
                this.listSupportsMultiSelect.set(!!options.multipleSelectionSupport);
            }
        }
        updateStyleOverrides(overrideStyles) {
            this.tree.style(overrideStyles ? (0, defaultStyles_1.getListStyles)(overrideStyles) : defaultStyles_1.defaultListStyles);
        }
        dispose() {
            this.disposables = (0, lifecycle_1.dispose)(this.disposables);
        }
    };
    WorkbenchTreeInternals = __decorate([
        __param(4, contextkey_1.IContextKeyService),
        __param(5, exports.IListService),
        __param(6, configuration_1.IConfigurationService)
    ], WorkbenchTreeInternals);
    const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        id: 'workbench',
        order: 7,
        title: (0, nls_1.localize)('workbenchConfigurationTitle', "Workbench"),
        type: 'object',
        properties: {
            [multiSelectModifierSettingKey]: {
                type: 'string',
                enum: ['ctrlCmd', 'alt'],
                markdownEnumDescriptions: [
                    (0, nls_1.localize)('multiSelectModifier.ctrlCmd', "Maps to `Control` on Windows and Linux and to `Command` on macOS."),
                    (0, nls_1.localize)('multiSelectModifier.alt', "Maps to `Alt` on Windows and Linux and to `Option` on macOS.")
                ],
                default: 'ctrlCmd',
                description: (0, nls_1.localize)({
                    key: 'multiSelectModifier',
                    comment: [
                        '- `ctrlCmd` refers to a value the setting can take and should not be localized.',
                        '- `Control` and `Command` refer to the modifier keys Ctrl or Cmd on the keyboard and can be localized.'
                    ]
                }, "The modifier to be used to add an item in trees and lists to a multi-selection with the mouse (for example in the explorer, open editors and scm view). The 'Open to Side' mouse gestures - if supported - will adapt such that they do not conflict with the multiselect modifier.")
            },
            [openModeSettingKey]: {
                type: 'string',
                enum: ['singleClick', 'doubleClick'],
                default: 'singleClick',
                description: (0, nls_1.localize)({
                    key: 'openModeModifier',
                    comment: ['`singleClick` and `doubleClick` refers to a value the setting can take and should not be localized.']
                }, "Controls how to open items in trees and lists using the mouse (if supported). Note that some trees and lists might choose to ignore this setting if it is not applicable.")
            },
            [horizontalScrollingKey]: {
                type: 'boolean',
                default: false,
                description: (0, nls_1.localize)('horizontalScrolling setting', "Controls whether lists and trees support horizontal scrolling in the workbench. Warning: turning on this setting has a performance implication.")
            },
            [scrollByPageKey]: {
                type: 'boolean',
                default: false,
                description: (0, nls_1.localize)('list.scrollByPage', "Controls whether clicks in the scrollbar scroll page by page.")
            },
            [treeIndentKey]: {
                type: 'number',
                default: 8,
                minimum: 4,
                maximum: 40,
                description: (0, nls_1.localize)('tree indent setting', "Controls tree indentation in pixels.")
            },
            [treeRenderIndentGuidesKey]: {
                type: 'string',
                enum: ['none', 'onHover', 'always'],
                default: 'onHover',
                description: (0, nls_1.localize)('render tree indent guides', "Controls whether the tree should render indent guides.")
            },
            [listSmoothScrolling]: {
                type: 'boolean',
                default: false,
                description: (0, nls_1.localize)('list smoothScrolling setting', "Controls whether lists and trees have smooth scrolling."),
            },
            [mouseWheelScrollSensitivityKey]: {
                type: 'number',
                default: 1,
                markdownDescription: (0, nls_1.localize)('Mouse Wheel Scroll Sensitivity', "A multiplier to be used on the `deltaX` and `deltaY` of mouse wheel scroll events.")
            },
            [fastScrollSensitivityKey]: {
                type: 'number',
                default: 5,
                markdownDescription: (0, nls_1.localize)('Fast Scroll Sensitivity', "Scrolling speed multiplier when pressing `Alt`.")
            },
            [defaultFindModeSettingKey]: {
                type: 'string',
                enum: ['highlight', 'filter'],
                enumDescriptions: [
                    (0, nls_1.localize)('defaultFindModeSettingKey.highlight', "Highlight elements when searching. Further up and down navigation will traverse only the highlighted elements."),
                    (0, nls_1.localize)('defaultFindModeSettingKey.filter', "Filter elements when searching.")
                ],
                default: 'highlight',
                description: (0, nls_1.localize)('defaultFindModeSettingKey', "Controls the default find mode for lists and trees in the workbench.")
            },
            [keyboardNavigationSettingKey]: {
                type: 'string',
                enum: ['simple', 'highlight', 'filter'],
                enumDescriptions: [
                    (0, nls_1.localize)('keyboardNavigationSettingKey.simple', "Simple keyboard navigation focuses elements which match the keyboard input. Matching is done only on prefixes."),
                    (0, nls_1.localize)('keyboardNavigationSettingKey.highlight', "Highlight keyboard navigation highlights elements which match the keyboard input. Further up and down navigation will traverse only the highlighted elements."),
                    (0, nls_1.localize)('keyboardNavigationSettingKey.filter', "Filter keyboard navigation will filter out and hide all the elements which do not match the keyboard input.")
                ],
                default: 'highlight',
                description: (0, nls_1.localize)('keyboardNavigationSettingKey', "Controls the keyboard navigation style for lists and trees in the workbench. Can be simple, highlight and filter."),
                deprecated: true,
                deprecationMessage: (0, nls_1.localize)('keyboardNavigationSettingKeyDeprecated', "Please use 'workbench.list.defaultFindMode' and	'workbench.list.typeNavigationMode' instead.")
            },
            [defaultFindMatchTypeSettingKey]: {
                type: 'string',
                enum: ['fuzzy', 'contiguous'],
                enumDescriptions: [
                    (0, nls_1.localize)('defaultFindMatchTypeSettingKey.fuzzy', "Use fuzzy matching when searching."),
                    (0, nls_1.localize)('defaultFindMatchTypeSettingKey.contiguous', "Use contiguous matching when searching.")
                ],
                default: 'fuzzy',
                description: (0, nls_1.localize)('defaultFindMatchTypeSettingKey', "Controls the type of matching used when searching lists and trees in the workbench.")
            },
            [treeExpandMode]: {
                type: 'string',
                enum: ['singleClick', 'doubleClick'],
                default: 'singleClick',
                description: (0, nls_1.localize)('expand mode', "Controls how tree folders are expanded when clicking the folder names. Note that some trees and lists might choose to ignore this setting if it is not applicable."),
            },
            [typeNavigationModeSettingKey]: {
                type: 'string',
                enum: ['automatic', 'trigger'],
                default: 'automatic',
                markdownDescription: (0, nls_1.localize)('typeNavigationMode2', "Controls how type navigation works in lists and trees in the workbench. When set to `trigger`, type navigation begins once the `list.triggerTypeNavigation` command is run."),
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9saXN0L2Jyb3dzZXIvbGlzdFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBZ0NuRixRQUFBLFlBQVksR0FBRyxJQUFBLCtCQUFlLEVBQWUsYUFBYSxDQUFDLENBQUM7SUFpQnpFLE1BQWEsV0FBVztRQVN2QixJQUFJLGVBQWU7WUFDbEIsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUM7UUFDaEMsQ0FBQztRQUVEO1lBVGlCLGdCQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFDN0MsVUFBSyxHQUFzQixFQUFFLENBQUM7WUFDOUIsdUJBQWtCLEdBQW9DLFNBQVMsQ0FBQztZQUNoRSwrQkFBMEIsR0FBWSxLQUFLLENBQUM7UUFNcEMsQ0FBQztRQUVULGtCQUFrQixDQUFDLE1BQXVDO1lBQ2pFLElBQUksTUFBTSxLQUFLLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtnQkFDdkMsT0FBTzthQUNQO1lBRUQsSUFBSSxDQUFDLGtCQUFrQixFQUFFLGNBQWMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDM0UsSUFBSSxDQUFDLGtCQUFrQixHQUFHLE1BQU0sQ0FBQztZQUNqQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsY0FBYyxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUN6RSxDQUFDO1FBRUQsUUFBUSxDQUFDLE1BQTJCLEVBQUUsZ0JBQTJDO1lBQ2hGLElBQUksQ0FBQyxJQUFJLENBQUMsMEJBQTBCLEVBQUU7Z0JBQ3JDLElBQUksQ0FBQywwQkFBMEIsR0FBRyxJQUFJLENBQUM7Z0JBQ3ZDLG1FQUFtRTtnQkFDbkUsTUFBTSxlQUFlLEdBQUcsSUFBSSxtQ0FBc0Is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