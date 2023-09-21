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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/list/listPaging", "vs/base/browser/ui/list/listWidget", "vs/base/browser/ui/table/tableWidget", "vs/base/browser/ui/tree/abstractTree", "vs/base/browser/ui/tree/asyncDataTree", "vs/base/browser/ui/tree/dataTree", "vs/base/browser/ui/tree/objectTree", "vs/base/common/event", "vs/base/common/lifecycle", "vs/nls!vs/platform/list/browser/listService", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextkey/common/contextkey", "vs/platform/contextkey/common/contextkeys", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/registry/common/platform", "vs/platform/theme/browser/defaultStyles"], function (require, exports, dom_1, listPaging_1, listWidget_1, tableWidget_1, abstractTree_1, asyncDataTree_1, dataTree_1, objectTree_1, event_1, lifecycle_1, nls_1, configuration_1, configurationRegistry_1, contextkey_1, contextkeys_1, contextView_1, instantiation_1, keybinding_1, platform_1, defaultStyles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$x4 = exports.$w4 = exports.$v4 = exports.$u4 = exports.$t4 = exports.$s4 = exports.$r4 = exports.$q4 = exports.$p4 = exports.$o4 = exports.$n4 = exports.$m4 = exports.$l4 = exports.$k4 = exports.$j4 = exports.$i4 = exports.$h4 = exports.$g4 = exports.$f4 = exports.$e4 = exports.$d4 = exports.$c4 = exports.$b4 = exports.$a4 = exports.$_3 = exports.$$3 = exports.$03 = void 0;
    exports.$03 = (0, instantiation_1.$Bh)('listService');
    class $$3 {
        get lastFocusedList() {
            return this.c;
        }
        constructor() {
            this.a = new lifecycle_1.$jc();
            this.b = [];
            this.c = undefined;
            this.d = false;
        }
        f(widget) {
            if (widget === this.c) {
                return;
            }
            this.c?.getHTMLElement().classList.remove('last-focused');
            this.c = widget;
            this.c?.getHTMLElement().classList.add('last-focused');
        }
        register(widget, extraContextKeys) {
            if (!this.d) {
                this.d = true;
                // create a shared default tree style sheet for performance reasons
                const styleController = new listWidget_1.$uQ((0, dom_1.$XO)(), '');
                styleController.style(defaultStyles_1.$z2);
            }
            if (this.b.some(l => l.widget === widget)) {
                throw new Error('Cannot register the same widget multiple times');
            }
            // Keep in our lists list
            const registeredList = { widget, extraContextKeys };
            this.b.push(registeredList);
            // Check for currently being focused
            if (widget.getHTMLElement() === document.activeElement) {
                this.f(widget);
            }
            return (0, lifecycle_1.$hc)(widget.onDidFocus(() => this.f(widget)), (0, lifecycle_1.$ic)(() => this.b.splice(this.b.indexOf(registeredList), 1)), widget.onDidDispose(() => {
                this.b = this.b.filter(l => l !== registeredList);
                if (this.c === widget) {
                    this.f(undefined);
                }
            }));
        }
        dispose() {
            this.a.dispose();
        }
    }
    exports.$$3 = $$3;
    exports.$_3 = new contextkey_1.$2i('listScrollAtBoundary', 'none');
    exports.$a4 = contextkey_1.$Ii.or(exports.$_3.isEqualTo('top'), exports.$_3.isEqualTo('both'));
    exports.$b4 = contextkey_1.$Ii.or(exports.$_3.isEqualTo('bottom'), exports.$_3.isEqualTo('both'));
    exports.$c4 = new contextkey_1.$2i('listFocus', true);
    exports.$d4 = new contextkey_1.$2i('listSupportsMultiselect', true);
    exports.$e4 = contextkey_1.$Ii.and(exports.$c4, contextkey_1.$Ii.not(contextkeys_1.$83));
    exports.$f4 = new contextkey_1.$2i('listHasSelectionOrFocus', false);
    exports.$g4 = new contextkey_1.$2i('listDoubleSelection', false);
    exports.$h4 = new contextkey_1.$2i('listMultiSelection', false);
    exports.$i4 = new contextkey_1.$2i('listSelectionNavigation', false);
    exports.$j4 = new contextkey_1.$2i('listSupportsFind', true);
    exports.$k4 = new contextkey_1.$2i('treeElementCanCollapse', false);
    exports.$l4 = new contextkey_1.$2i('treeElementHasParent', false);
    exports.$m4 = new contextkey_1.$2i('treeElementCanExpand', false);
    exports.$n4 = new contextkey_1.$2i('treeElementHasChild', false);
    exports.$o4 = new contextkey_1.$2i('treeFindOpen', false);
    const WorkbenchListTypeNavigationModeKey = 'listTypeNavigationMode';
    /**
     * @deprecated in favor of WorkbenchListTypeNavigationModeKey
     */
    const WorkbenchListAutomaticKeyboardNavigationLegacyKey = 'listAutomaticKeyboardNavigation';
    function createScopedContextKeyService(contextKeyService, widget) {
        const result = contextKeyService.createScoped(widget.getHTMLElement());
        exports.$c4.bindTo(result);
        return result;
    }
    function createScrollObserver(contextKeyService, widget) {
        const listScrollAt = exports.$_3.bindTo(contextKeyService);
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
    class MultipleSelectionController extends lifecycle_1.$kc {
        constructor(b) {
            super();
            this.b = b;
            this.a = useAltAsMultipleSelectionModifier(b);
            this.c();
        }
        c() {
            this.B(this.b.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(multiSelectModifierSettingKey)) {
                    this.a = useAltAsMultipleSelectionModifier(this.b);
                }
            }));
        }
        isSelectionSingleChangeEvent(event) {
            if (this.a) {
                return event.browserEvent.altKey;
            }
            return (0, listWidget_1.$rQ)(event);
        }
        isSelectionRangeChangeEvent(event) {
            return (0, listWidget_1.$sQ)(event);
        }
    }
    function toWorkbenchListOptions(accessor, options) {
        const configurationService = accessor.get(configuration_1.$8h);
        const keybindingService = accessor.get(keybinding_1.$2D);
        const disposables = new lifecycle_1.$jc();
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
    let $p4 = class $p4 extends listWidget_1.$wQ {
        get onDidOpen() { return this.P.onDidOpen; }
        constructor(user, container, delegate, renderers, options, contextKeyService, listService, configurationService, instantiationService) {
            const horizontalScrolling = typeof options.horizontalScrolling !== 'undefined' ? options.horizontalScrolling : Boolean(configurationService.getValue(horizontalScrollingKey));
            const [workbenchListOptions, workbenchListOptionsDisposable] = instantiationService.invokeFunction(toWorkbenchListOptions, options);
            super(user, container, delegate, renderers, {
                keyboardSupport: false,
                ...workbenchListOptions,
                horizontalScrolling,
            });
            this.y.add(workbenchListOptionsDisposable);
            this.contextKeyService = createScopedContextKeyService(contextKeyService, this);
            this.y.add(createScrollObserver(this.contextKeyService, this));
            this.h = exports.$d4.bindTo(this.contextKeyService);
            this.h.set(options.multipleSelectionSupport !== false);
            const listSelectionNavigation = exports.$i4.bindTo(this.contextKeyService);
            listSelectionNavigation.set(Boolean(options.selectionNavigation));
            this.K = exports.$f4.bindTo(this.contextKeyService);
            this.L = exports.$g4.bindTo(this.contextKeyService);
            this.M = exports.$h4.bindTo(this.contextKeyService);
            this.N = options.horizontalScrolling;
            this.O = useAltAsMultipleSelectionModifier(configurationService);
            this.y.add(this.contextKeyService);
            this.y.add(listService.register(this));
            this.Q(options.overrideStyles);
            this.y.add(this.onDidChangeSelection(() => {
                const selection = this.getSelection();
                const focus = this.getFocus();
                this.contextKeyService.bufferChangeEvents(() => {
                    this.K.set(selection.length > 0 || focus.length > 0);
                    this.M.set(selection.length > 1);
                    this.L.set(selection.length === 2);
                });
            }));
            this.y.add(this.onDidChangeFocus(() => {
                const selection = this.getSelection();
                const focus = this.getFocus();
                this.K.set(selection.length > 0 || focus.length > 0);
            }));
            this.y.add(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(multiSelectModifierSettingKey)) {
                    this.O = useAltAsMultipleSelectionModifier(configurationService);
                }
                let options = {};
                if (e.affectsConfiguration(horizontalScrollingKey) && this.N === undefined) {
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
            this.P = new ListResourceNavigator(this, { configurationService, ...options });
            this.y.add(this.P);
        }
        updateOptions(options) {
            super.updateOptions(options);
            if (options.overrideStyles !== undefined) {
                this.Q(options.overrideStyles);
            }
            if (options.multipleSelectionSupport !== undefined) {
                this.h.set(!!options.multipleSelectionSupport);
            }
        }
        Q(styles) {
            this.style(styles ? (0, defaultStyles_1.$A2)(styles) : defaultStyles_1.$z2);
        }
        get useAltAsMultipleSelectionModifier() {
            return this.O;
        }
    };
    exports.$p4 = $p4;
    exports.$p4 = $p4 = __decorate([
        __param(5, contextkey_1.$3i),
        __param(6, exports.$03),
        __param(7, configuration_1.$8h),
        __param(8, instantiation_1.$Ah)
    ], $p4);
    let $q4 = class $q4 extends listPaging_1.$UR {
        get onDidOpen() { return this.h.onDidOpen; }
        constructor(user, container, delegate, renderers, options, contextKeyService, listService, configurationService, instantiationService) {
            const horizontalScrolling = typeof options.horizontalScrolling !== 'undefined' ? options.horizontalScrolling : Boolean(configurationService.getValue(horizontalScrollingKey));
            const [workbenchListOptions, workbenchListOptionsDisposable] = instantiationService.invokeFunction(toWorkbenchListOptions, options);
            super(user, container, delegate, renderers, {
                keyboardSupport: false,
                ...workbenchListOptions,
                horizontalScrolling,
            });
            this.c = new lifecycle_1.$jc();
            this.c.add(workbenchListOptionsDisposable);
            this.contextKeyService = createScopedContextKeyService(contextKeyService, this);
            this.c.add(createScrollObserver(this.contextKeyService, this.widget));
            this.g = options.horizontalScrolling;
            this.d = exports.$d4.bindTo(this.contextKeyService);
            this.d.set(options.multipleSelectionSupport !== false);
            const listSelectionNavigation = exports.$i4.bindTo(this.contextKeyService);
            listSelectionNavigation.set(Boolean(options.selectionNavigation));
            this.f = useAltAsMultipleSelectionModifier(configurationService);
            this.c.add(this.contextKeyService);
            this.c.add(listService.register(this));
            this.j(options.overrideStyles);
            this.c.add(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(multiSelectModifierSettingKey)) {
                    this.f = useAltAsMultipleSelectionModifier(configurationService);
                }
                let options = {};
                if (e.affectsConfiguration(horizontalScrollingKey) && this.g === undefined) {
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
            this.h = new ListResourceNavigator(this, { configurationService, ...options });
            this.c.add(this.h);
        }
        updateOptions(options) {
            super.updateOptions(options);
            if (options.overrideStyles !== undefined) {
                this.j(options.overrideStyles);
            }
            if (options.multipleSelectionSupport !== undefined) {
                this.d.set(!!options.multipleSelectionSupport);
            }
        }
        j(styles) {
            this.style(styles ? (0, defaultStyles_1.$A2)(styles) : defaultStyles_1.$z2);
        }
        get useAltAsMultipleSelectionModifier() {
            return this.f;
        }
        dispose() {
            this.c.dispose();
            super.dispose();
        }
    };
    exports.$q4 = $q4;
    exports.$q4 = $q4 = __decorate([
        __param(5, contextkey_1.$3i),
        __param(6, exports.$03),
        __param(7, configuration_1.$8h),
        __param(8, instantiation_1.$Ah)
    ], $q4);
    let $r4 = class $r4 extends tableWidget_1.$5R {
        get onDidOpen() { return this.x.onDidOpen; }
        constructor(user, container, delegate, columns, renderers, options, contextKeyService, listService, configurationService, instantiationService) {
            const horizontalScrolling = typeof options.horizontalScrolling !== 'undefined' ? options.horizontalScrolling : Boolean(configurationService.getValue(horizontalScrollingKey));
            const [workbenchListOptions, workbenchListOptionsDisposable] = instantiationService.invokeFunction(toWorkbenchListOptions, options);
            super(user, container, delegate, columns, renderers, {
                keyboardSupport: false,
                ...workbenchListOptions,
                horizontalScrolling,
            });
            this.k.add(workbenchListOptionsDisposable);
            this.contextKeyService = createScopedContextKeyService(contextKeyService, this);
            this.k.add(createScrollObserver(this.contextKeyService, this));
            this.q = exports.$d4.bindTo(this.contextKeyService);
            this.q.set(options.multipleSelectionSupport !== false);
            const listSelectionNavigation = exports.$i4.bindTo(this.contextKeyService);
            listSelectionNavigation.set(Boolean(options.selectionNavigation));
            this.s = exports.$f4.bindTo(this.contextKeyService);
            this.t = exports.$g4.bindTo(this.contextKeyService);
            this.u = exports.$h4.bindTo(this.contextKeyService);
            this.v = options.horizontalScrolling;
            this.w = useAltAsMultipleSelectionModifier(configurationService);
            this.k.add(this.contextKeyService);
            this.k.add(listService.register(this));
            this.y(options.overrideStyles);
            this.k.add(this.onDidChangeSelection(() => {
                const selection = this.getSelection();
                const focus = this.getFocus();
                this.contextKeyService.bufferChangeEvents(() => {
                    this.s.set(selection.length > 0 || focus.length > 0);
                    this.u.set(selection.length > 1);
                    this.t.set(selection.length === 2);
                });
            }));
            this.k.add(this.onDidChangeFocus(() => {
                const selection = this.getSelection();
                const focus = this.getFocus();
                this.s.set(selection.length > 0 || focus.length > 0);
            }));
            this.k.add(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(multiSelectModifierSettingKey)) {
                    this.w = useAltAsMultipleSelectionModifier(configurationService);
                }
                let options = {};
                if (e.affectsConfiguration(horizontalScrollingKey) && this.v === undefined) {
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
            this.x = new TableResourceNavigator(this, { configurationService, ...options });
            this.k.add(this.x);
        }
        updateOptions(options) {
            super.updateOptions(options);
            if (options.overrideStyles !== undefined) {
                this.y(options.overrideStyles);
            }
            if (options.multipleSelectionSupport !== undefined) {
                this.q.set(!!options.multipleSelectionSupport);
            }
        }
        y(styles) {
            this.style(styles ? (0, defaultStyles_1.$A2)(styles) : defaultStyles_1.$z2);
        }
        get useAltAsMultipleSelectionModifier() {
            return this.w;
        }
        dispose() {
            this.k.dispose();
            super.dispose();
        }
    };
    exports.$r4 = $r4;
    exports.$r4 = $r4 = __decorate([
        __param(6, contextkey_1.$3i),
        __param(7, exports.$03),
        __param(8, configuration_1.$8h),
        __param(9, instantiation_1.$Ah)
    ], $r4);
    function $s4(typeArg = 'keydown', preserveFocus, pinned) {
        const e = new KeyboardEvent(typeArg);
        e.preserveFocus = preserveFocus;
        e.pinned = pinned;
        e.__forceEvent = true;
        return e;
    }
    exports.$s4 = $s4;
    class ResourceNavigator extends lifecycle_1.$kc {
        constructor(c, options) {
            super();
            this.c = c;
            this.b = this.B(new event_1.$fd());
            this.onDidOpen = this.b.event;
            this.B(event_1.Event.filter(this.c.onDidChangeSelection, e => e.browserEvent instanceof KeyboardEvent)(e => this.f(e)));
            this.B(this.c.onPointer((e) => this.g(e.element, e.browserEvent)));
            this.B(this.c.onMouseDblClick((e) => this.h(e.element, e.browserEvent)));
            if (typeof options?.openOnSingleClick !== 'boolean' && options?.configurationService) {
                this.a = options?.configurationService.getValue(openModeSettingKey) !== 'doubleClick';
                this.B(options?.configurationService.onDidChangeConfiguration(e => {
                    if (e.affectsConfiguration(openModeSettingKey)) {
                        this.a = options?.configurationService.getValue(openModeSettingKey) !== 'doubleClick';
                    }
                }));
            }
            else {
                this.a = options?.openOnSingleClick ?? true;
            }
        }
        f(event) {
            if (event.elements.length !== 1) {
                return;
            }
            const selectionKeyboardEvent = event.browserEvent;
            const preserveFocus = typeof selectionKeyboardEvent.preserveFocus === 'boolean' ? selectionKeyboardEvent.preserveFocus : true;
            const pinned = typeof selectionKeyboardEvent.pinned === 'boolean' ? selectionKeyboardEvent.pinned : !preserveFocus;
            const sideBySide = false;
            this.j(this.getSelectedElement(), preserveFocus, pinned, sideBySide, event.browserEvent);
        }
        g(element, browserEvent) {
            if (!this.a) {
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
            this.j(element, preserveFocus, pinned, sideBySide, browserEvent);
        }
        h(element, browserEvent) {
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
            this.j(element, preserveFocus, pinned, sideBySide, browserEvent);
        }
        j(element, preserveFocus, pinned, sideBySide, browserEvent) {
            if (!element) {
                return;
            }
            this.b.fire({
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
            this.c = widget;
        }
        getSelectedElement() {
            return this.c.getSelectedElements()[0];
        }
    }
    class TableResourceNavigator extends ResourceNavigator {
        constructor(widget, options) {
            super(widget, options);
        }
        getSelectedElement() {
            return this.c.getSelectedElements()[0];
        }
    }
    class TreeResourceNavigator extends ResourceNavigator {
        constructor(widget, options) {
            super(widget, options);
        }
        getSelectedElement() {
            return this.c.getSelection()[0] ?? undefined;
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
    let $t4 = class $t4 extends objectTree_1.$mS {
        get contextKeyService() { return this.d.contextKeyService; }
        get useAltAsMultipleSelectionModifier() { return this.d.useAltAsMultipleSelectionModifier; }
        get onDidOpen() { return this.d.onDidOpen; }
        constructor(user, container, delegate, renderers, options, instantiationService, contextKeyService, listService, configurationService) {
            const { options: treeOptions, getTypeNavigationMode, disposable } = instantiationService.invokeFunction(workbenchTreeDataPreamble, options);
            super(user, container, delegate, renderers, treeOptions);
            this.A.add(disposable);
            this.d = new WorkbenchTreeInternals(this, options, getTypeNavigationMode, options.overrideStyles, contextKeyService, listService, configurationService);
            this.A.add(this.d);
        }
        updateOptions(options) {
            super.updateOptions(options);
            this.d.updateOptions(options);
        }
    };
    exports.$t4 = $t4;
    exports.$t4 = $t4 = __decorate([
        __param(5, instantiation_1.$Ah),
        __param(6, contextkey_1.$3i),
        __param(7, exports.$03),
        __param(8, configuration_1.$8h)
    ], $t4);
    let $u4 = class $u4 extends objectTree_1.$nS {
        get contextKeyService() { return this.c.contextKeyService; }
        get useAltAsMultipleSelectionModifier() { return this.c.useAltAsMultipleSelectionModifier; }
        get onDidOpen() { return this.c.onDidOpen; }
        constructor(user, container, delegate, renderers, options, instantiationService, contextKeyService, listService, configurationService) {
            const { options: treeOptions, getTypeNavigationMode, disposable } = instantiationService.invokeFunction(workbenchTreeDataPreamble, options);
            super(user, container, delegate, renderers, treeOptions);
            this.A.add(disposable);
            this.c = new WorkbenchTreeInternals(this, options, getTypeNavigationMode, options.overrideStyles, contextKeyService, listService, configurationService);
            this.A.add(this.c);
        }
        updateOptions(options = {}) {
            super.updateOptions(options);
            if (options.overrideStyles) {
                this.c.updateStyleOverrides(options.overrideStyles);
            }
            this.c.updateOptions(options);
        }
    };
    exports.$u4 = $u4;
    exports.$u4 = $u4 = __decorate([
        __param(5, instantiation_1.$Ah),
        __param(6, contextkey_1.$3i),
        __param(7, exports.$03),
        __param(8, configuration_1.$8h)
    ], $u4);
    let $v4 = class $v4 extends dataTree_1.$qS {
        get contextKeyService() { return this.v.contextKeyService; }
        get useAltAsMultipleSelectionModifier() { return this.v.useAltAsMultipleSelectionModifier; }
        get onDidOpen() { return this.v.onDidOpen; }
        constructor(user, container, delegate, renderers, dataSource, options, instantiationService, contextKeyService, listService, configurationService) {
            const { options: treeOptions, getTypeNavigationMode, disposable } = instantiationService.invokeFunction(workbenchTreeDataPreamble, options);
            super(user, container, delegate, renderers, dataSource, treeOptions);
            this.A.add(disposable);
            this.v = new WorkbenchTreeInternals(this, options, getTypeNavigationMode, options.overrideStyles, contextKeyService, listService, configurationService);
            this.A.add(this.v);
        }
        updateOptions(options = {}) {
            super.updateOptions(options);
            if (options.overrideStyles !== undefined) {
                this.v.updateStyleOverrides(options.overrideStyles);
            }
            this.v.updateOptions(options);
        }
    };
    exports.$v4 = $v4;
    exports.$v4 = $v4 = __decorate([
        __param(6, instantiation_1.$Ah),
        __param(7, contextkey_1.$3i),
        __param(8, exports.$03),
        __param(9, configuration_1.$8h)
    ], $v4);
    let $w4 = class $w4 extends asyncDataTree_1.$oS {
        get contextKeyService() { return this.L.contextKeyService; }
        get useAltAsMultipleSelectionModifier() { return this.L.useAltAsMultipleSelectionModifier; }
        get onDidOpen() { return this.L.onDidOpen; }
        constructor(user, container, delegate, renderers, dataSource, options, instantiationService, contextKeyService, listService, configurationService) {
            const { options: treeOptions, getTypeNavigationMode, disposable } = instantiationService.invokeFunction(workbenchTreeDataPreamble, options);
            super(user, container, delegate, renderers, dataSource, treeOptions);
            this.t.add(disposable);
            this.L = new WorkbenchTreeInternals(this, options, getTypeNavigationMode, options.overrideStyles, contextKeyService, listService, configurationService);
            this.t.add(this.L);
        }
        updateOptions(options = {}) {
            super.updateOptions(options);
            if (options.overrideStyles) {
                this.L.updateStyleOverrides(options.overrideStyles);
            }
            this.L.updateOptions(options);
        }
    };
    exports.$w4 = $w4;
    exports.$w4 = $w4 = __decorate([
        __param(6, instantiation_1.$Ah),
        __param(7, contextkey_1.$3i),
        __param(8, exports.$03),
        __param(9, configuration_1.$8h)
    ], $w4);
    let $x4 = class $x4 extends asyncDataTree_1.$pS {
        get contextKeyService() { return this.Q.contextKeyService; }
        get useAltAsMultipleSelectionModifier() { return this.Q.useAltAsMultipleSelectionModifier; }
        get onDidOpen() { return this.Q.onDidOpen; }
        constructor(user, container, virtualDelegate, compressionDelegate, renderers, dataSource, options, instantiationService, contextKeyService, listService, configurationService) {
            const { options: treeOptions, getTypeNavigationMode, disposable } = instantiationService.invokeFunction(workbenchTreeDataPreamble, options);
            super(user, container, virtualDelegate, compressionDelegate, renderers, dataSource, treeOptions);
            this.t.add(disposable);
            this.Q = new WorkbenchTreeInternals(this, options, getTypeNavigationMode, options.overrideStyles, contextKeyService, listService, configurationService);
            this.t.add(this.Q);
        }
        updateOptions(options) {
            super.updateOptions(options);
            this.Q.updateOptions(options);
        }
    };
    exports.$x4 = $x4;
    exports.$x4 = $x4 = __decorate([
        __param(7, instantiation_1.$Ah),
        __param(8, contextkey_1.$3i),
        __param(9, exports.$03),
        __param(10, configuration_1.$8h)
    ], $x4);
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
        const configurationService = accessor.get(configuration_1.$8h);
        const contextViewService = accessor.get(contextView_1.$VZ);
        const contextKeyService = accessor.get(contextkey_1.$3i);
        const instantiationService = accessor.get(instantiation_1.$Ah);
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
                findWidgetStyles: defaultStyles_1.$u2,
            }
        };
    }
    let WorkbenchTreeInternals = class WorkbenchTreeInternals {
        get onDidOpen() { return this.o.onDidOpen; }
        constructor(p, options, getTypeNavigationMode, overrideStyles, contextKeyService, listService, configurationService) {
            this.p = p;
            this.n = [];
            this.contextKeyService = createScopedContextKeyService(contextKeyService, p);
            this.n.push(createScrollObserver(this.contextKeyService, p));
            this.a = exports.$d4.bindTo(this.contextKeyService);
            this.a.set(options.multipleSelectionSupport !== false);
            const listSelectionNavigation = exports.$i4.bindTo(this.contextKeyService);
            listSelectionNavigation.set(Boolean(options.selectionNavigation));
            this.b = exports.$j4.bindTo(this.contextKeyService);
            this.b.set(options.findWidgetEnabled ?? true);
            this.c = exports.$f4.bindTo(this.contextKeyService);
            this.d = exports.$g4.bindTo(this.contextKeyService);
            this.f = exports.$h4.bindTo(this.contextKeyService);
            this.g = exports.$k4.bindTo(this.contextKeyService);
            this.h = exports.$l4.bindTo(this.contextKeyService);
            this.i = exports.$m4.bindTo(this.contextKeyService);
            this.j = exports.$n4.bindTo(this.contextKeyService);
            this.k = exports.$o4.bindTo(this.contextKeyService);
            this.m = useAltAsMultipleSelectionModifier(configurationService);
            this.updateStyleOverrides(overrideStyles);
            const updateCollapseContextKeys = () => {
                const focus = p.getFocus()[0];
                if (!focus) {
                    return;
                }
                const node = p.getNode(focus);
                this.g.set(node.collapsible && !node.collapsed);
                this.h.set(!!p.getParentElement(focus));
                this.i.set(node.collapsible && node.collapsed);
                this.j.set(!!p.getFirstElementChild(focus));
            };
            const interestingContextKeys = new Set();
            interestingContextKeys.add(WorkbenchListTypeNavigationModeKey);
            interestingContextKeys.add(WorkbenchListAutomaticKeyboardNavigationLegacyKey);
            this.n.push(this.contextKeyService, listService.register(p), p.onDidChangeSelection(() => {
                const selection = p.getSelection();
                const focus = p.getFocus();
                this.contextKeyService.bufferChangeEvents(() => {
                    this.c.set(selection.length > 0 || focus.length > 0);
                    this.f.set(selection.length > 1);
                    this.d.set(selection.length === 2);
                });
            }), p.onDidChangeFocus(() => {
                const selection = p.getSelection();
                const focus = p.getFocus();
                this.c.set(selection.length > 0 || focus.length > 0);
                updateCollapseContextKeys();
            }), p.onDidChangeCollapseState(updateCollapseContextKeys), p.onDidChangeModel(updateCollapseContextKeys), p.onDidChangeFindOpenState(enabled => this.k.set(enabled)), configurationService.onDidChangeConfiguration(e => {
                let newOptions = {};
                if (e.affectsConfiguration(multiSelectModifierSettingKey)) {
                    this.m = useAltAsMultipleSelectionModifier(configurationService);
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
                    p.updateOptions(newOptions);
                }
            }), this.contextKeyService.onDidChangeContext(e => {
                if (e.affectsSome(interestingContextKeys)) {
                    p.updateOptions({ typeNavigationMode: getTypeNavigationMode() });
                }
            }));
            this.o = new TreeResourceNavigator(p, { configurationService, ...options });
            this.n.push(this.o);
        }
        get useAltAsMultipleSelectionModifier() {
            return this.m;
        }
        updateOptions(options) {
            if (options.multipleSelectionSupport !== undefined) {
                this.a.set(!!options.multipleSelectionSupport);
            }
        }
        updateStyleOverrides(overrideStyles) {
            this.p.style(overrideStyles ? (0, defaultStyles_1.$A2)(overrideStyles) : defaultStyles_1.$z2);
        }
        dispose() {
            this.n = (0, lifecycle_1.$fc)(this.n);
        }
    };
    WorkbenchTreeInternals = __decorate([
        __param(4, contextkey_1.$3i),
        __param(5, exports.$03),
        __param(6, configuration_1.$8h)
    ], WorkbenchTreeInternals);
    const configurationRegistry = platform_1.$8m.as(configurationRegistry_1.$an.Configuration);
    configurationRegistry.registerConfiguration({
        id: 'workbench',
        order: 7,
        title: (0, nls_1.localize)(0, null),
        type: 'object',
        properties: {
            [multiSelectModifierSettingKey]: {
                type: 'string',
                enum: ['ctrlCmd', 'alt'],
                markdownEnumDescriptions: [
                    (0, nls_1.localize)(1, null),
                    (0, nls_1.localize)(2, null)
                ],
                default: 'ctrlCmd',
                description: (0, nls_1.localize)(3, null)






            },
            [openModeSettingKey]: {
                type: 'string',
                enum: ['singleClick', 'doubleClick'],
                default: 'singleClick',
                description: (0, nls_1.localize)(4, null)



            },
            [horizontalScrollingKey]: {
                type: 'boolean',
                default: false,
                description: (0, nls_1.localize)(5, null)
            },
            [scrollByPageKey]: {
                type: 'boolean',
                default: false,
                description: (0, nls_1.localize)(6, null)
            },
            [treeIndentKey]: {
                type: 'number',
                default: 8,
                minimum: 4,
                maximum: 40,
                description: (0, nls_1.localize)(7, null)
            },
            [treeRenderIndentGuidesKey]: {
                type: 'string',
                enum: ['none', 'onHover', 'always'],
                default: 'onHover',
                description: (0, nls_1.localize)(8, null)
            },
            [listSmoothScrolling]: {
                type: 'boolean',
                default: false,
                description: (0, nls_1.localize)(9, null),
            },
            [mouseWheelScrollSensitivityKey]: {
                type: 'number',
                default: 1,
                markdownDescription: (0, nls_1.localize)(10, null)
            },
            [fastScrollSensitivityKey]: {
                type: 'number',
                default: 5,
                markdownDescription: (0, nls_1.localize)(11, null)
            },
            [defaultFindModeSettingKey]: {
                type: 'string',
                enum: ['highlight', 'filter'],
                enumDescriptions: [
                    (0, nls_1.localize)(12, null),
                    (0, nls_1.localize)(13, null)
                ],
                default: 'highlight',
                description: (0, nls_1.localize)(14, null)
            },
            [keyboardNavigationSettingKey]: {
                type: 'string',
                enum: ['simple', 'highlight', 'filter'],
                enumDescriptions: [
                    (0, nls_1.localize)(15, null),
                    (0, nls_1.localize)(16, null),
                    (0, nls_1.localize)(17, null)
                ],
                default: 'highlight',
                description: (0, nls_1.localize)(18, null),
                deprecated: true,
                deprecationMessage: (0, nls_1.localize)(19, null)
            },
            [defaultFindMatchTypeSettingKey]: {
                type: 'string',
                enum: ['fuzzy', 'contiguous'],
                enumDescriptions: [
                    (0, nls_1.localize)(20, null),
                    (0, nls_1.localize)(21, null)
                ],
                default: 'fuzzy',
                description: (0, nls_1.localize)(22, null)
            },
            [treeExpandMode]: {
                type: 'string',
                enum: ['singleClick', 'doubleClick'],
                default: 'singleClick',
                description: (0, nls_1.localize)(23, null),
            },
            [typeNavigationModeSettingKey]: {
                type: 'string',
                enum: ['automatic', 'trigger'],
                default: 'automatic',
                markdownDescription: (0, nls_1.localize)(24, null),
            }
        }
    });
});
//# sourceMappingURL=listService.js.map