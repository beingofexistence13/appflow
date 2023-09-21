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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/touch", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/iconLabel/iconLabel", "vs/base/browser/ui/inputbox/inputBox", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/editor/browser/editorBrowser", "vs/editor/common/languages/language", "vs/nls", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/label/common/label", "vs/platform/list/browser/listService", "vs/platform/opener/common/opener", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/browser/defaultStyles", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/views", "vs/workbench/contrib/debug/browser/debugIcons", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/contrib/debug/common/disassemblyViewInput", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/hover/browser/hover"], function (require, exports, dom, touch_1, actionbar_1, iconLabel_1, inputBox_1, actions_1, arrays_1, async_1, codicons_1, htmlContent_1, lifecycle_1, resources, editorBrowser_1, language_1, nls_1, menuEntryActionViewItem_1, actions_2, configuration_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, label_1, listService_1, opener_1, telemetry_1, defaultStyles_1, themeService_1, themables_1, viewPane_1, views_1, icons, debug_1, debugModel_1, disassemblyViewInput_1, editorService_1, hover_1) {
    "use strict";
    var BreakpointsRenderer_1, FunctionBreakpointsRenderer_1, DataBreakpointsRenderer_1, InstructionBreakpointsRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getBreakpointMessageAndIcon = exports.openBreakpointSource = exports.BreakpointsView = exports.getExpandedBodySize = void 0;
    const $ = dom.$;
    function createCheckbox(disposables) {
        const checkbox = $('input');
        checkbox.type = 'checkbox';
        checkbox.tabIndex = -1;
        disposables.push(touch_1.Gesture.ignoreTarget(checkbox));
        return checkbox;
    }
    const MAX_VISIBLE_BREAKPOINTS = 9;
    function getExpandedBodySize(model, sessionId, countLimit) {
        const length = model.getBreakpoints().length + model.getExceptionBreakpointsForSession(sessionId).length + model.getFunctionBreakpoints().length + model.getDataBreakpoints().length + model.getInstructionBreakpoints().length;
        return Math.min(countLimit, length) * 22;
    }
    exports.getExpandedBodySize = getExpandedBodySize;
    let BreakpointsView = class BreakpointsView extends viewPane_1.ViewPane {
        constructor(options, contextMenuService, debugService, keybindingService, instantiationService, themeService, editorService, contextViewService, configurationService, viewDescriptorService, contextKeyService, openerService, telemetryService, labelService, menuService, hoverService, languageService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.debugService = debugService;
            this.editorService = editorService;
            this.contextViewService = contextViewService;
            this.labelService = labelService;
            this.hoverService = hoverService;
            this.languageService = languageService;
            this.needsRefresh = false;
            this.needsStateChange = false;
            this.ignoreLayout = false;
            this.autoFocusedIndex = -1;
            this.menu = menuService.createMenu(actions_2.MenuId.DebugBreakpointsContext, contextKeyService);
            this._register(this.menu);
            this.breakpointItemType = debug_1.CONTEXT_BREAKPOINT_ITEM_TYPE.bindTo(contextKeyService);
            this.breakpointSupportsCondition = debug_1.CONTEXT_BREAKPOINT_SUPPORTS_CONDITION.bindTo(contextKeyService);
            this.breakpointInputFocused = debug_1.CONTEXT_BREAKPOINT_INPUT_FOCUSED.bindTo(contextKeyService);
            this._register(this.debugService.getModel().onDidChangeBreakpoints(() => this.onBreakpointsChange()));
            this._register(this.debugService.getViewModel().onDidFocusSession(() => this.onBreakpointsChange()));
            this._register(this.debugService.onDidChangeState(() => this.onStateChange()));
            this.hintDelayer = this._register(new async_1.RunOnceScheduler(() => this.updateBreakpointsHint(true), 4000));
        }
        renderBody(container) {
            super.renderBody(container);
            this.element.classList.add('debug-pane');
            container.classList.add('debug-breakpoints');
            const delegate = new BreakpointsDelegate(this);
            this.list = this.instantiationService.createInstance(listService_1.WorkbenchList, 'Breakpoints', container, delegate, [
                this.instantiationService.createInstance(BreakpointsRenderer, this.menu, this.breakpointSupportsCondition, this.breakpointItemType),
                new ExceptionBreakpointsRenderer(this.menu, this.breakpointSupportsCondition, this.breakpointItemType, this.debugService),
                new ExceptionBreakpointInputRenderer(this, this.debugService, this.contextViewService),
                this.instantiationService.createInstance(FunctionBreakpointsRenderer, this.menu, this.breakpointSupportsCondition, this.breakpointItemType),
                this.instantiationService.createInstance(DataBreakpointsRenderer),
                new FunctionBreakpointInputRenderer(this, this.debugService, this.contextViewService, this.labelService),
                this.instantiationService.createInstance(InstructionBreakpointsRenderer),
            ], {
                identityProvider: { getId: (element) => element.getId() },
                multipleSelectionSupport: false,
                keyboardNavigationLabelProvider: { getKeyboardNavigationLabel: (e) => e },
                accessibilityProvider: new BreakpointsAccessibilityProvider(this.debugService, this.labelService),
                overrideStyles: {
                    listBackground: this.getBackgroundColor()
                }
            });
            debug_1.CONTEXT_BREAKPOINTS_FOCUSED.bindTo(this.list.contextKeyService);
            this._register(this.list.onContextMenu(this.onListContextMenu, this));
            this.list.onMouseMiddleClick(async ({ element }) => {
                if (element instanceof debugModel_1.Breakpoint) {
                    await this.debugService.removeBreakpoints(element.getId());
                }
                else if (element instanceof debugModel_1.FunctionBreakpoint) {
                    await this.debugService.removeFunctionBreakpoints(element.getId());
                }
                else if (element instanceof debugModel_1.DataBreakpoint) {
                    await this.debugService.removeDataBreakpoints(element.getId());
                }
                else if (element instanceof debugModel_1.InstructionBreakpoint) {
                    await this.debugService.removeInstructionBreakpoints(element.instructionReference, element.offset);
                }
            });
            this._register(this.list.onDidOpen(async (e) => {
                if (!e.element) {
                    return;
                }
                if (e.browserEvent instanceof MouseEvent && e.browserEvent.button === 1) { // middle click
                    return;
                }
                if (e.element instanceof debugModel_1.Breakpoint) {
                    openBreakpointSource(e.element, e.sideBySide, e.editorOptions.preserveFocus || false, e.editorOptions.pinned || !e.editorOptions.preserveFocus, this.debugService, this.editorService);
                }
                if (e.element instanceof debugModel_1.InstructionBreakpoint) {
                    const disassemblyView = await this.editorService.openEditor(disassemblyViewInput_1.DisassemblyViewInput.instance);
                    // Focus on double click
                    disassemblyView.goToInstructionAndOffset(e.element.instructionReference, e.element.offset, e.browserEvent instanceof MouseEvent && e.browserEvent.detail === 2);
                }
                if (e.browserEvent instanceof MouseEvent && e.browserEvent.detail === 2 && e.element instanceof debugModel_1.FunctionBreakpoint && e.element !== this.inputBoxData?.breakpoint) {
                    // double click
                    this.renderInputBox({ breakpoint: e.element, type: 'name' });
                }
            }));
            this.list.splice(0, this.list.length, this.elements);
            this._register(this.onDidChangeBodyVisibility(visible => {
                if (visible) {
                    if (this.needsRefresh) {
                        this.onBreakpointsChange();
                    }
                    if (this.needsStateChange) {
                        this.onStateChange();
                    }
                }
            }));
            const containerModel = this.viewDescriptorService.getViewContainerModel(this.viewDescriptorService.getViewContainerByViewId(this.id));
            this._register(containerModel.onDidChangeAllViewDescriptors(() => {
                this.updateSize();
            }));
        }
        renderHeaderTitle(container, title) {
            super.renderHeaderTitle(container, title);
            const iconLabelContainer = dom.append(container, $('span.breakpoint-warning'));
            this.hintContainer = this._register(new iconLabel_1.IconLabel(iconLabelContainer, {
                supportIcons: true, hoverDelegate: {
                    showHover: (options, focus) => this.hoverService.showHover({ content: options.content, target: this.hintContainer.element }, focus),
                    delay: this.configurationService.getValue('workbench.hover.delay')
                }
            }));
            dom.hide(this.hintContainer.element);
        }
        focus() {
            super.focus();
            this.list?.domFocus();
        }
        renderInputBox(data) {
            this._inputBoxData = data;
            this.onBreakpointsChange();
            this._inputBoxData = undefined;
        }
        get inputBoxData() {
            return this._inputBoxData;
        }
        layoutBody(height, width) {
            if (this.ignoreLayout) {
                return;
            }
            super.layoutBody(height, width);
            this.list?.layout(height, width);
            try {
                this.ignoreLayout = true;
                this.updateSize();
            }
            finally {
                this.ignoreLayout = false;
            }
        }
        onListContextMenu(e) {
            const element = e.element;
            const type = element instanceof debugModel_1.Breakpoint ? 'breakpoint' : element instanceof debugModel_1.ExceptionBreakpoint ? 'exceptionBreakpoint' :
                element instanceof debugModel_1.FunctionBreakpoint ? 'functionBreakpoint' : element instanceof debugModel_1.DataBreakpoint ? 'dataBreakpoint' :
                    element instanceof debugModel_1.InstructionBreakpoint ? 'instructionBreakpoint' : undefined;
            this.breakpointItemType.set(type);
            const session = this.debugService.getViewModel().focusedSession;
            const conditionSupported = element instanceof debugModel_1.ExceptionBreakpoint ? element.supportsCondition : (!session || !!session.capabilities.supportsConditionalBreakpoints);
            this.breakpointSupportsCondition.set(conditionSupported);
            const secondary = [];
            (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(this.menu, { arg: e.element, shouldForwardArgs: false }, { primary: [], secondary }, 'inline');
            this.contextMenuService.showContextMenu({
                getAnchor: () => e.anchor,
                getActions: () => secondary,
                getActionsContext: () => element
            });
        }
        updateSize() {
            const containerModel = this.viewDescriptorService.getViewContainerModel(this.viewDescriptorService.getViewContainerByViewId(this.id));
            // Adjust expanded body size
            const sessionId = this.debugService.getViewModel().focusedSession?.getId();
            this.minimumBodySize = this.orientation === 0 /* Orientation.VERTICAL */ ? getExpandedBodySize(this.debugService.getModel(), sessionId, MAX_VISIBLE_BREAKPOINTS) : 170;
            this.maximumBodySize = this.orientation === 0 /* Orientation.VERTICAL */ && containerModel.visibleViewDescriptors.length > 1 ? getExpandedBodySize(this.debugService.getModel(), sessionId, Number.POSITIVE_INFINITY) : Number.POSITIVE_INFINITY;
        }
        updateBreakpointsHint(delayed = false) {
            if (!this.hintContainer) {
                return;
            }
            const currentType = this.debugService.getViewModel().focusedSession?.configuration.type;
            const dbg = currentType ? this.debugService.getAdapterManager().getDebugger(currentType) : undefined;
            const message = dbg?.strings?.[debug_1.DebuggerString.UnverifiedBreakpoints];
            const debuggerHasUnverifiedBps = message && this.debugService.getModel().getBreakpoints().filter(bp => {
                if (bp.verified || !bp.enabled) {
                    return false;
                }
                const langId = this.languageService.guessLanguageIdByFilepathOrFirstLine(bp.uri);
                return langId && dbg.interestedInLanguage(langId);
            });
            if (message && debuggerHasUnverifiedBps?.length && this.debugService.getModel().areBreakpointsActivated()) {
                if (delayed) {
                    const mdown = new htmlContent_1.MarkdownString(undefined, { isTrusted: true }).appendMarkdown(message);
                    this.hintContainer.setLabel('$(warning)', undefined, { title: { markdown: mdown, markdownNotSupportedFallback: message } });
                    dom.show(this.hintContainer.element);
                }
                else {
                    this.hintDelayer.schedule();
                }
            }
            else {
                dom.hide(this.hintContainer.element);
            }
        }
        onBreakpointsChange() {
            if (this.isBodyVisible()) {
                this.updateSize();
                if (this.list) {
                    const lastFocusIndex = this.list.getFocus()[0];
                    // Check whether focused element was removed
                    const needsRefocus = lastFocusIndex && !this.elements.includes(this.list.element(lastFocusIndex));
                    this.list.splice(0, this.list.length, this.elements);
                    this.needsRefresh = false;
                    if (needsRefocus) {
                        this.list.focusNth(Math.min(lastFocusIndex, this.list.length - 1));
                    }
                }
                this.updateBreakpointsHint();
            }
            else {
                this.needsRefresh = true;
            }
        }
        onStateChange() {
            if (this.isBodyVisible()) {
                this.needsStateChange = false;
                const thread = this.debugService.getViewModel().focusedThread;
                let found = false;
                if (thread && thread.stoppedDetails && thread.stoppedDetails.hitBreakpointIds && thread.stoppedDetails.hitBreakpointIds.length > 0) {
                    const hitBreakpointIds = thread.stoppedDetails.hitBreakpointIds;
                    const elements = this.elements;
                    const index = elements.findIndex(e => {
                        const id = e.getIdFromAdapter(thread.session.getId());
                        return typeof id === 'number' && hitBreakpointIds.indexOf(id) !== -1;
                    });
                    if (index >= 0) {
                        this.list.setFocus([index]);
                        this.list.setSelection([index]);
                        found = true;
                        this.autoFocusedIndex = index;
                    }
                }
                if (!found) {
                    // Deselect breakpoint in breakpoint view when no longer stopped on it #125528
                    const focus = this.list.getFocus();
                    const selection = this.list.getSelection();
                    if (this.autoFocusedIndex >= 0 && (0, arrays_1.equals)(focus, selection) && focus.indexOf(this.autoFocusedIndex) >= 0) {
                        this.list.setFocus([]);
                        this.list.setSelection([]);
                    }
                    this.autoFocusedIndex = -1;
                }
                this.updateBreakpointsHint();
            }
            else {
                this.needsStateChange = true;
            }
        }
        get elements() {
            const model = this.debugService.getModel();
            const sessionId = this.debugService.getViewModel().focusedSession?.getId();
            const elements = model.getExceptionBreakpointsForSession(sessionId).concat(model.getFunctionBreakpoints()).concat(model.getDataBreakpoints()).concat(model.getBreakpoints()).concat(model.getInstructionBreakpoints());
            return elements;
        }
    };
    exports.BreakpointsView = BreakpointsView;
    exports.BreakpointsView = BreakpointsView = __decorate([
        __param(1, contextView_1.IContextMenuService),
        __param(2, debug_1.IDebugService),
        __param(3, keybinding_1.IKeybindingService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, themeService_1.IThemeService),
        __param(6, editorService_1.IEditorService),
        __param(7, contextView_1.IContextViewService),
        __param(8, configuration_1.IConfigurationService),
        __param(9, views_1.IViewDescriptorService),
        __param(10, contextkey_1.IContextKeyService),
        __param(11, opener_1.IOpenerService),
        __param(12, telemetry_1.ITelemetryService),
        __param(13, label_1.ILabelService),
        __param(14, actions_2.IMenuService),
        __param(15, hover_1.IHoverService),
        __param(16, language_1.ILanguageService)
    ], BreakpointsView);
    class BreakpointsDelegate {
        constructor(view) {
            this.view = view;
            // noop
        }
        getHeight(_element) {
            return 22;
        }
        getTemplateId(element) {
            if (element instanceof debugModel_1.Breakpoint) {
                return BreakpointsRenderer.ID;
            }
            if (element instanceof debugModel_1.FunctionBreakpoint) {
                const inputBoxBreakpoint = this.view.inputBoxData?.breakpoint;
                if (!element.name || (inputBoxBreakpoint && inputBoxBreakpoint.getId() === element.getId())) {
                    return FunctionBreakpointInputRenderer.ID;
                }
                return FunctionBreakpointsRenderer.ID;
            }
            if (element instanceof debugModel_1.ExceptionBreakpoint) {
                const inputBoxBreakpoint = this.view.inputBoxData?.breakpoint;
                if (inputBoxBreakpoint && inputBoxBreakpoint.getId() === element.getId()) {
                    return ExceptionBreakpointInputRenderer.ID;
                }
                return ExceptionBreakpointsRenderer.ID;
            }
            if (element instanceof debugModel_1.DataBreakpoint) {
                return DataBreakpointsRenderer.ID;
            }
            if (element instanceof debugModel_1.InstructionBreakpoint) {
                return InstructionBreakpointsRenderer.ID;
            }
            return '';
        }
    }
    const breakpointIdToActionBarDomeNode = new Map();
    let BreakpointsRenderer = class BreakpointsRenderer {
        static { BreakpointsRenderer_1 = this; }
        constructor(menu, breakpointSupportsCondition, breakpointItemType, debugService, labelService) {
            this.menu = menu;
            this.breakpointSupportsCondition = breakpointSupportsCondition;
            this.breakpointItemType = breakpointItemType;
            this.debugService = debugService;
            this.labelService = labelService;
            // noop
        }
        static { this.ID = 'breakpoints'; }
        get templateId() {
            return BreakpointsRenderer_1.ID;
        }
        renderTemplate(container) {
            const data = Object.create(null);
            data.toDispose = [];
            data.breakpoint = dom.append(container, $('.breakpoint'));
            data.icon = $('.icon');
            data.checkbox = createCheckbox(data.toDispose);
            data.toDispose.push(dom.addStandardDisposableListener(data.checkbox, 'change', (e) => {
                this.debugService.enableOrDisableBreakpoints(!data.context.enabled, data.context);
            }));
            dom.append(data.breakpoint, data.icon);
            dom.append(data.breakpoint, data.checkbox);
            data.name = dom.append(data.breakpoint, $('span.name'));
            data.filePath = dom.append(data.breakpoint, $('span.file-path'));
            data.actionBar = new actionbar_1.ActionBar(data.breakpoint);
            data.toDispose.push(data.actionBar);
            const lineNumberContainer = dom.append(data.breakpoint, $('.line-number-container'));
            data.lineNumber = dom.append(lineNumberContainer, $('span.line-number.monaco-count-badge'));
            return data;
        }
        renderElement(breakpoint, index, data) {
            data.context = breakpoint;
            data.breakpoint.classList.toggle('disabled', !this.debugService.getModel().areBreakpointsActivated());
            data.name.textContent = resources.basenameOrAuthority(breakpoint.uri);
            data.lineNumber.textContent = breakpoint.lineNumber.toString();
            if (breakpoint.column) {
                data.lineNumber.textContent += `:${breakpoint.column}`;
            }
            data.filePath.textContent = this.labelService.getUriLabel(resources.dirname(breakpoint.uri), { relative: true });
            data.checkbox.checked = breakpoint.enabled;
            const { message, icon } = getBreakpointMessageAndIcon(this.debugService.state, this.debugService.getModel().areBreakpointsActivated(), breakpoint, this.labelService);
            data.icon.className = themables_1.ThemeIcon.asClassName(icon);
            data.breakpoint.title = breakpoint.message || message || '';
            const debugActive = this.debugService.state === 3 /* State.Running */ || this.debugService.state === 2 /* State.Stopped */;
            if (debugActive && !breakpoint.verified) {
                data.breakpoint.classList.add('disabled');
            }
            const primary = [];
            const session = this.debugService.getViewModel().focusedSession;
            this.breakpointSupportsCondition.set(!session || !!session.capabilities.supportsConditionalBreakpoints);
            this.breakpointItemType.set('breakpoint');
            (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(this.menu, { arg: breakpoint, shouldForwardArgs: true }, { primary, secondary: [] }, 'inline');
            data.actionBar.clear();
            data.actionBar.push(primary, { icon: true, label: false });
            breakpointIdToActionBarDomeNode.set(breakpoint.getId(), data.actionBar.domNode);
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.dispose)(templateData.toDispose);
        }
    };
    BreakpointsRenderer = BreakpointsRenderer_1 = __decorate([
        __param(3, debug_1.IDebugService),
        __param(4, label_1.ILabelService)
    ], BreakpointsRenderer);
    class ExceptionBreakpointsRenderer {
        constructor(menu, breakpointSupportsCondition, breakpointItemType, debugService) {
            this.menu = menu;
            this.breakpointSupportsCondition = breakpointSupportsCondition;
            this.breakpointItemType = breakpointItemType;
            this.debugService = debugService;
            // noop
        }
        static { this.ID = 'exceptionbreakpoints'; }
        get templateId() {
            return ExceptionBreakpointsRenderer.ID;
        }
        renderTemplate(container) {
            const data = Object.create(null);
            data.toDispose = [];
            data.breakpoint = dom.append(container, $('.breakpoint'));
            data.checkbox = createCheckbox(data.toDispose);
            data.toDispose.push(dom.addStandardDisposableListener(data.checkbox, 'change', (e) => {
                this.debugService.enableOrDisableBreakpoints(!data.context.enabled, data.context);
            }));
            dom.append(data.breakpoint, data.checkbox);
            data.name = dom.append(data.breakpoint, $('span.name'));
            data.condition = dom.append(data.breakpoint, $('span.condition'));
            data.breakpoint.classList.add('exception');
            data.actionBar = new actionbar_1.ActionBar(data.breakpoint);
            data.toDispose.push(data.actionBar);
            return data;
        }
        renderElement(exceptionBreakpoint, index, data) {
            data.context = exceptionBreakpoint;
            data.name.textContent = exceptionBreakpoint.label || `${exceptionBreakpoint.filter} exceptions`;
            data.breakpoint.title = exceptionBreakpoint.verified ? (exceptionBreakpoint.description || data.name.textContent) : exceptionBreakpoint.message || (0, nls_1.localize)('unverifiedExceptionBreakpoint', "Unverified Exception Breakpoint");
            data.breakpoint.classList.toggle('disabled', !exceptionBreakpoint.verified);
            data.checkbox.checked = exceptionBreakpoint.enabled;
            data.condition.textContent = exceptionBreakpoint.condition || '';
            data.condition.title = (0, nls_1.localize)('expressionCondition', "Expression condition: {0}", exceptionBreakpoint.condition);
            const primary = [];
            this.breakpointSupportsCondition.set(exceptionBreakpoint.supportsCondition);
            this.breakpointItemType.set('exceptionBreakpoint');
            (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(this.menu, { arg: exceptionBreakpoint, shouldForwardArgs: true }, { primary, secondary: [] }, 'inline');
            data.actionBar.clear();
            data.actionBar.push(primary, { icon: true, label: false });
            breakpointIdToActionBarDomeNode.set(exceptionBreakpoint.getId(), data.actionBar.domNode);
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.dispose)(templateData.toDispose);
        }
    }
    let FunctionBreakpointsRenderer = class FunctionBreakpointsRenderer {
        static { FunctionBreakpointsRenderer_1 = this; }
        constructor(menu, breakpointSupportsCondition, breakpointItemType, debugService, labelService) {
            this.menu = menu;
            this.breakpointSupportsCondition = breakpointSupportsCondition;
            this.breakpointItemType = breakpointItemType;
            this.debugService = debugService;
            this.labelService = labelService;
            // noop
        }
        static { this.ID = 'functionbreakpoints'; }
        get templateId() {
            return FunctionBreakpointsRenderer_1.ID;
        }
        renderTemplate(container) {
            const data = Object.create(null);
            data.toDispose = [];
            data.breakpoint = dom.append(container, $('.breakpoint'));
            data.icon = $('.icon');
            data.checkbox = createCheckbox(data.toDispose);
            data.toDispose.push(dom.addStandardDisposableListener(data.checkbox, 'change', (e) => {
                this.debugService.enableOrDisableBreakpoints(!data.context.enabled, data.context);
            }));
            dom.append(data.breakpoint, data.icon);
            dom.append(data.breakpoint, data.checkbox);
            data.name = dom.append(data.breakpoint, $('span.name'));
            data.condition = dom.append(data.breakpoint, $('span.condition'));
            data.actionBar = new actionbar_1.ActionBar(data.breakpoint);
            data.toDispose.push(data.actionBar);
            return data;
        }
        renderElement(functionBreakpoint, _index, data) {
            data.context = functionBreakpoint;
            data.name.textContent = functionBreakpoint.name;
            const { icon, message } = getBreakpointMessageAndIcon(this.debugService.state, this.debugService.getModel().areBreakpointsActivated(), functionBreakpoint, this.labelService);
            data.icon.className = themables_1.ThemeIcon.asClassName(icon);
            data.icon.title = message ? message : '';
            data.checkbox.checked = functionBreakpoint.enabled;
            data.breakpoint.title = message ? message : '';
            if (functionBreakpoint.condition && functionBreakpoint.hitCondition) {
                data.condition.textContent = (0, nls_1.localize)('expressionAndHitCount', "Expression: {0} | Hit Count: {1}", functionBreakpoint.condition, functionBreakpoint.hitCondition);
            }
            else {
                data.condition.textContent = functionBreakpoint.condition || functionBreakpoint.hitCondition || '';
            }
            // Mark function breakpoints as disabled if deactivated or if debug type does not support them #9099
            const session = this.debugService.getViewModel().focusedSession;
            data.breakpoint.classList.toggle('disabled', (session && !session.capabilities.supportsFunctionBreakpoints) || !this.debugService.getModel().areBreakpointsActivated());
            if (session && !session.capabilities.supportsFunctionBreakpoints) {
                data.breakpoint.title = (0, nls_1.localize)('functionBreakpointsNotSupported', "Function breakpoints are not supported by this debug type");
            }
            const primary = [];
            this.breakpointSupportsCondition.set(!session || !!session.capabilities.supportsConditionalBreakpoints);
            this.breakpointItemType.set('functionBreakpoint');
            (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(this.menu, { arg: functionBreakpoint, shouldForwardArgs: true }, { primary, secondary: [] }, 'inline');
            data.actionBar.clear();
            data.actionBar.push(primary, { icon: true, label: false });
            breakpointIdToActionBarDomeNode.set(functionBreakpoint.getId(), data.actionBar.domNode);
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.dispose)(templateData.toDispose);
        }
    };
    FunctionBreakpointsRenderer = FunctionBreakpointsRenderer_1 = __decorate([
        __param(3, debug_1.IDebugService),
        __param(4, label_1.ILabelService)
    ], FunctionBreakpointsRenderer);
    let DataBreakpointsRenderer = class DataBreakpointsRenderer {
        static { DataBreakpointsRenderer_1 = this; }
        constructor(debugService, labelService) {
            this.debugService = debugService;
            this.labelService = labelService;
            // noop
        }
        static { this.ID = 'databreakpoints'; }
        get templateId() {
            return DataBreakpointsRenderer_1.ID;
        }
        renderTemplate(container) {
            const data = Object.create(null);
            data.breakpoint = dom.append(container, $('.breakpoint'));
            data.toDispose = [];
            data.icon = $('.icon');
            data.checkbox = createCheckbox(data.toDispose);
            data.toDispose.push(dom.addStandardDisposableListener(data.checkbox, 'change', (e) => {
                this.debugService.enableOrDisableBreakpoints(!data.context.enabled, data.context);
            }));
            dom.append(data.breakpoint, data.icon);
            dom.append(data.breakpoint, data.checkbox);
            data.name = dom.append(data.breakpoint, $('span.name'));
            data.accessType = dom.append(data.breakpoint, $('span.access-type'));
            return data;
        }
        renderElement(dataBreakpoint, _index, data) {
            data.context = dataBreakpoint;
            data.name.textContent = dataBreakpoint.description;
            const { icon, message } = getBreakpointMessageAndIcon(this.debugService.state, this.debugService.getModel().areBreakpointsActivated(), dataBreakpoint, this.labelService);
            data.icon.className = themables_1.ThemeIcon.asClassName(icon);
            data.icon.title = message ? message : '';
            data.checkbox.checked = dataBreakpoint.enabled;
            data.breakpoint.title = message ? message : '';
            // Mark function breakpoints as disabled if deactivated or if debug type does not support them #9099
            const session = this.debugService.getViewModel().focusedSession;
            data.breakpoint.classList.toggle('disabled', (session && !session.capabilities.supportsDataBreakpoints) || !this.debugService.getModel().areBreakpointsActivated());
            if (session && !session.capabilities.supportsDataBreakpoints) {
                data.breakpoint.title = (0, nls_1.localize)('dataBreakpointsNotSupported', "Data breakpoints are not supported by this debug type");
            }
            if (dataBreakpoint.accessType) {
                const accessType = dataBreakpoint.accessType === 'read' ? (0, nls_1.localize)('read', "Read") : dataBreakpoint.accessType === 'write' ? (0, nls_1.localize)('write', "Write") : (0, nls_1.localize)('access', "Access");
                data.accessType.textContent = accessType;
            }
            else {
                data.accessType.textContent = '';
            }
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.dispose)(templateData.toDispose);
        }
    };
    DataBreakpointsRenderer = DataBreakpointsRenderer_1 = __decorate([
        __param(0, debug_1.IDebugService),
        __param(1, label_1.ILabelService)
    ], DataBreakpointsRenderer);
    let InstructionBreakpointsRenderer = class InstructionBreakpointsRenderer {
        static { InstructionBreakpointsRenderer_1 = this; }
        constructor(debugService, labelService) {
            this.debugService = debugService;
            this.labelService = labelService;
            // noop
        }
        static { this.ID = 'instructionBreakpoints'; }
        get templateId() {
            return InstructionBreakpointsRenderer_1.ID;
        }
        renderTemplate(container) {
            const data = Object.create(null);
            data.toDispose = [];
            data.breakpoint = dom.append(container, $('.breakpoint'));
            data.icon = $('.icon');
            data.checkbox = createCheckbox(data.toDispose);
            data.toDispose.push(dom.addStandardDisposableListener(data.checkbox, 'change', (e) => {
                this.debugService.enableOrDisableBreakpoints(!data.context.enabled, data.context);
            }));
            dom.append(data.breakpoint, data.icon);
            dom.append(data.breakpoint, data.checkbox);
            data.name = dom.append(data.breakpoint, $('span.name'));
            data.address = dom.append(data.breakpoint, $('span.file-path'));
            data.actionBar = new actionbar_1.ActionBar(data.breakpoint);
            data.toDispose.push(data.actionBar);
            return data;
        }
        renderElement(breakpoint, index, data) {
            data.context = breakpoint;
            data.breakpoint.classList.toggle('disabled', !this.debugService.getModel().areBreakpointsActivated());
            data.name.textContent = '0x' + breakpoint.address.toString(16);
            data.name.title = `Decimal address: breakpoint.address.toString()`;
            data.checkbox.checked = breakpoint.enabled;
            const { message, icon } = getBreakpointMessageAndIcon(this.debugService.state, this.debugService.getModel().areBreakpointsActivated(), breakpoint, this.labelService);
            data.icon.className = themables_1.ThemeIcon.asClassName(icon);
            data.breakpoint.title = breakpoint.message || message || '';
            const debugActive = this.debugService.state === 3 /* State.Running */ || this.debugService.state === 2 /* State.Stopped */;
            if (debugActive && !breakpoint.verified) {
                data.breakpoint.classList.add('disabled');
            }
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.dispose)(templateData.toDispose);
        }
    };
    InstructionBreakpointsRenderer = InstructionBreakpointsRenderer_1 = __decorate([
        __param(0, debug_1.IDebugService),
        __param(1, label_1.ILabelService)
    ], InstructionBreakpointsRenderer);
    class FunctionBreakpointInputRenderer {
        constructor(view, debugService, contextViewService, labelService) {
            this.view = view;
            this.debugService = debugService;
            this.contextViewService = contextViewService;
            this.labelService = labelService;
        }
        static { this.ID = 'functionbreakpointinput'; }
        get templateId() {
            return FunctionBreakpointInputRenderer.ID;
        }
        renderTemplate(container) {
            const template = Object.create(null);
            const toDispose = [];
            const breakpoint = dom.append(container, $('.breakpoint'));
            template.icon = $('.icon');
            template.checkbox = createCheckbox(toDispose);
            dom.append(breakpoint, template.icon);
            dom.append(breakpoint, template.checkbox);
            this.view.breakpointInputFocused.set(true);
            const inputBoxContainer = dom.append(breakpoint, $('.inputBoxContainer'));
            const inputBox = new inputBox_1.InputBox(inputBoxContainer, this.contextViewService, { inputBoxStyles: defaultStyles_1.defaultInputBoxStyles });
            const wrapUp = (success) => {
                template.updating = true;
                try {
                    this.view.breakpointInputFocused.set(false);
                    const id = template.breakpoint.getId();
                    if (success) {
                        if (template.type === 'name') {
                            this.debugService.updateFunctionBreakpoint(id, { name: inputBox.value });
                        }
                        if (template.type === 'condition') {
                            this.debugService.updateFunctionBreakpoint(id, { condition: inputBox.value });
                        }
                        if (template.type === 'hitCount') {
                            this.debugService.updateFunctionBreakpoint(id, { hitCondition: inputBox.value });
                        }
                    }
                    else {
                        if (template.type === 'name' && !template.breakpoint.name) {
                            this.debugService.removeFunctionBreakpoints(id);
                        }
                        else {
                            this.view.renderInputBox(undefined);
                        }
                    }
                }
                finally {
                    template.updating = false;
                }
            };
            toDispose.push(dom.addStandardDisposableListener(inputBox.inputElement, 'keydown', (e) => {
                const isEscape = e.equals(9 /* KeyCode.Escape */);
                const isEnter = e.equals(3 /* KeyCode.Enter */);
                if (isEscape || isEnter) {
                    e.preventDefault();
                    e.stopPropagation();
                    wrapUp(isEnter);
                }
            }));
            toDispose.push(dom.addDisposableListener(inputBox.inputElement, 'blur', () => {
                if (!template.updating) {
                    wrapUp(!!inputBox.value);
                }
            }));
            template.inputBox = inputBox;
            template.toDispose = toDispose;
            return template;
        }
        renderElement(functionBreakpoint, _index, data) {
            data.breakpoint = functionBreakpoint;
            data.type = this.view.inputBoxData?.type || 'name'; // If there is no type set take the 'name' as the default
            const { icon, message } = getBreakpointMessageAndIcon(this.debugService.state, this.debugService.getModel().areBreakpointsActivated(), functionBreakpoint, this.labelService);
            data.icon.className = themables_1.ThemeIcon.asClassName(icon);
            data.icon.title = message ? message : '';
            data.checkbox.checked = functionBreakpoint.enabled;
            data.checkbox.disabled = true;
            data.inputBox.value = functionBreakpoint.name || '';
            let placeholder = (0, nls_1.localize)('functionBreakpointPlaceholder', "Function to break on");
            let ariaLabel = (0, nls_1.localize)('functionBreakPointInputAriaLabel', "Type function breakpoint.");
            if (data.type === 'condition') {
                data.inputBox.value = functionBreakpoint.condition || '';
                placeholder = (0, nls_1.localize)('functionBreakpointExpressionPlaceholder', "Break when expression evaluates to true");
                ariaLabel = (0, nls_1.localize)('functionBreakPointExpresionAriaLabel', "Type expression. Function breakpoint will break when expression evaluates to true");
            }
            else if (data.type === 'hitCount') {
                data.inputBox.value = functionBreakpoint.hitCondition || '';
                placeholder = (0, nls_1.localize)('functionBreakpointHitCountPlaceholder', "Break when hit count is met");
                ariaLabel = (0, nls_1.localize)('functionBreakPointHitCountAriaLabel', "Type hit count. Function breakpoint will break when hit count is met.");
            }
            data.inputBox.setAriaLabel(ariaLabel);
            data.inputBox.setPlaceHolder(placeholder);
            setTimeout(() => {
                data.inputBox.focus();
                data.inputBox.select();
            }, 0);
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.dispose)(templateData.toDispose);
        }
    }
    class ExceptionBreakpointInputRenderer {
        constructor(view, debugService, contextViewService) {
            this.view = view;
            this.debugService = debugService;
            this.contextViewService = contextViewService;
            // noop
        }
        static { this.ID = 'exceptionbreakpointinput'; }
        get templateId() {
            return ExceptionBreakpointInputRenderer.ID;
        }
        renderTemplate(container) {
            const template = Object.create(null);
            const toDispose = [];
            const breakpoint = dom.append(container, $('.breakpoint'));
            breakpoint.classList.add('exception');
            template.checkbox = createCheckbox(toDispose);
            dom.append(breakpoint, template.checkbox);
            this.view.breakpointInputFocused.set(true);
            const inputBoxContainer = dom.append(breakpoint, $('.inputBoxContainer'));
            const inputBox = new inputBox_1.InputBox(inputBoxContainer, this.contextViewService, {
                ariaLabel: (0, nls_1.localize)('exceptionBreakpointAriaLabel', "Type exception breakpoint condition"),
                inputBoxStyles: defaultStyles_1.defaultInputBoxStyles
            });
            const wrapUp = (success) => {
                this.view.breakpointInputFocused.set(false);
                let newCondition = template.breakpoint.condition;
                if (success) {
                    newCondition = inputBox.value !== '' ? inputBox.value : undefined;
                }
                this.debugService.setExceptionBreakpointCondition(template.breakpoint, newCondition);
            };
            toDispose.push(dom.addStandardDisposableListener(inputBox.inputElement, 'keydown', (e) => {
                const isEscape = e.equals(9 /* KeyCode.Escape */);
                const isEnter = e.equals(3 /* KeyCode.Enter */);
                if (isEscape || isEnter) {
                    e.preventDefault();
                    e.stopPropagation();
                    wrapUp(isEnter);
                }
            }));
            toDispose.push(dom.addDisposableListener(inputBox.inputElement, 'blur', () => {
                // Need to react with a timeout on the blur event due to possible concurent splices #56443
                setTimeout(() => {
                    wrapUp(true);
                });
            }));
            template.inputBox = inputBox;
            template.toDispose = toDispose;
            return template;
        }
        renderElement(exceptionBreakpoint, _index, data) {
            const placeHolder = exceptionBreakpoint.conditionDescription || (0, nls_1.localize)('exceptionBreakpointPlaceholder', "Break when expression evaluates to true");
            data.inputBox.setPlaceHolder(placeHolder);
            data.breakpoint = exceptionBreakpoint;
            data.checkbox.checked = exceptionBreakpoint.enabled;
            data.checkbox.disabled = true;
            data.inputBox.value = exceptionBreakpoint.condition || '';
            setTimeout(() => {
                data.inputBox.focus();
                data.inputBox.select();
            }, 0);
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.dispose)(templateData.toDispose);
        }
    }
    class BreakpointsAccessibilityProvider {
        constructor(debugService, labelService) {
            this.debugService = debugService;
            this.labelService = labelService;
        }
        getWidgetAriaLabel() {
            return (0, nls_1.localize)('breakpoints', "Breakpoints");
        }
        getRole() {
            return 'checkbox';
        }
        isChecked(breakpoint) {
            return breakpoint.enabled;
        }
        getAriaLabel(element) {
            if (element instanceof debugModel_1.ExceptionBreakpoint) {
                return element.toString();
            }
            const { message } = getBreakpointMessageAndIcon(this.debugService.state, this.debugService.getModel().areBreakpointsActivated(), element, this.labelService);
            const toString = element.toString();
            return message ? `${toString}, ${message}` : toString;
        }
    }
    function openBreakpointSource(breakpoint, sideBySide, preserveFocus, pinned, debugService, editorService) {
        if (breakpoint.uri.scheme === debug_1.DEBUG_SCHEME && debugService.state === 0 /* State.Inactive */) {
            return Promise.resolve(undefined);
        }
        const selection = breakpoint.endLineNumber ? {
            startLineNumber: breakpoint.lineNumber,
            endLineNumber: breakpoint.endLineNumber,
            startColumn: breakpoint.column || 1,
            endColumn: breakpoint.endColumn || 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */
        } : {
            startLineNumber: breakpoint.lineNumber,
            startColumn: breakpoint.column || 1,
            endLineNumber: breakpoint.lineNumber,
            endColumn: breakpoint.column || 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */
        };
        return editorService.openEditor({
            resource: breakpoint.uri,
            options: {
                preserveFocus,
                selection,
                revealIfOpened: true,
                selectionRevealType: 1 /* TextEditorSelectionRevealType.CenterIfOutsideViewport */,
                pinned
            }
        }, sideBySide ? editorService_1.SIDE_GROUP : editorService_1.ACTIVE_GROUP);
    }
    exports.openBreakpointSource = openBreakpointSource;
    function getBreakpointMessageAndIcon(state, breakpointsActivated, breakpoint, labelService) {
        const debugActive = state === 3 /* State.Running */ || state === 2 /* State.Stopped */;
        const breakpointIcon = breakpoint instanceof debugModel_1.DataBreakpoint ? icons.dataBreakpoint : breakpoint instanceof debugModel_1.FunctionBreakpoint ? icons.functionBreakpoint : breakpoint.logMessage ? icons.logBreakpoint : icons.breakpoint;
        if (!breakpoint.enabled || !breakpointsActivated) {
            return {
                icon: breakpointIcon.disabled,
                message: breakpoint.logMessage ? (0, nls_1.localize)('disabledLogpoint', "Disabled Logpoint") : (0, nls_1.localize)('disabledBreakpoint', "Disabled Breakpoint"),
            };
        }
        const appendMessage = (text) => {
            return ('message' in breakpoint && breakpoint.message) ? text.concat(', ' + breakpoint.message) : text;
        };
        if (debugActive && !breakpoint.verified) {
            return {
                icon: breakpointIcon.unverified,
                message: ('message' in breakpoint && breakpoint.message) ? breakpoint.message : (breakpoint.logMessage ? (0, nls_1.localize)('unverifiedLogpoint', "Unverified Logpoint") : (0, nls_1.localize)('unverifiedBreakpoint', "Unverified Breakpoint")),
                showAdapterUnverifiedMessage: true
            };
        }
        if (breakpoint instanceof debugModel_1.DataBreakpoint) {
            if (!breakpoint.supported) {
                return {
                    icon: breakpointIcon.unverified,
                    message: (0, nls_1.localize)('dataBreakpointUnsupported', "Data breakpoints not supported by this debug type"),
                };
            }
            return {
                icon: breakpointIcon.regular,
                message: breakpoint.message || (0, nls_1.localize)('dataBreakpoint', "Data Breakpoint")
            };
        }
        if (breakpoint instanceof debugModel_1.FunctionBreakpoint) {
            if (!breakpoint.supported) {
                return {
                    icon: breakpointIcon.unverified,
                    message: (0, nls_1.localize)('functionBreakpointUnsupported', "Function breakpoints not supported by this debug type"),
                };
            }
            const messages = [];
            messages.push(breakpoint.message || (0, nls_1.localize)('functionBreakpoint', "Function Breakpoint"));
            if (breakpoint.condition) {
                messages.push((0, nls_1.localize)('expression', "Expression condition: {0}", breakpoint.condition));
            }
            if (breakpoint.hitCondition) {
                messages.push((0, nls_1.localize)('hitCount', "Hit Count: {0}", breakpoint.hitCondition));
            }
            return {
                icon: breakpointIcon.regular,
                message: appendMessage(messages.join('\n'))
            };
        }
        if (breakpoint instanceof debugModel_1.InstructionBreakpoint) {
            if (!breakpoint.supported) {
                return {
                    icon: breakpointIcon.unverified,
                    message: (0, nls_1.localize)('instructionBreakpointUnsupported', "Instruction breakpoints not supported by this debug type"),
                };
            }
            const messages = [];
            if (breakpoint.message) {
                messages.push(breakpoint.message);
            }
            else if (breakpoint.instructionReference) {
                messages.push((0, nls_1.localize)('instructionBreakpointAtAddress', "Instruction breakpoint at address {0}", breakpoint.instructionReference));
            }
            else {
                messages.push((0, nls_1.localize)('instructionBreakpoint', "Instruction breakpoint"));
            }
            if (breakpoint.hitCondition) {
                messages.push((0, nls_1.localize)('hitCount', "Hit Count: {0}", breakpoint.hitCondition));
            }
            return {
                icon: breakpointIcon.regular,
                message: appendMessage(messages.join('\n'))
            };
        }
        if (breakpoint.logMessage || breakpoint.condition || breakpoint.hitCondition) {
            const messages = [];
            if (!breakpoint.supported) {
                return {
                    icon: icons.debugBreakpointUnsupported,
                    message: (0, nls_1.localize)('breakpointUnsupported', "Breakpoints of this type are not supported by the debugger"),
                };
            }
            if (breakpoint.logMessage) {
                messages.push((0, nls_1.localize)('logMessage', "Log Message: {0}", breakpoint.logMessage));
            }
            if (breakpoint.condition) {
                messages.push((0, nls_1.localize)('expression', "Expression condition: {0}", breakpoint.condition));
            }
            if (breakpoint.hitCondition) {
                messages.push((0, nls_1.localize)('hitCount', "Hit Count: {0}", breakpoint.hitCondition));
            }
            return {
                icon: breakpoint.logMessage ? icons.logBreakpoint.regular : icons.conditionalBreakpoint.regular,
                message: appendMessage(messages.join('\n'))
            };
        }
        const message = ('message' in breakpoint && breakpoint.message) ? breakpoint.message : breakpoint instanceof debugModel_1.Breakpoint && labelService ? labelService.getUriLabel(breakpoint.uri) : (0, nls_1.localize)('breakpoint', "Breakpoint");
        return {
            icon: breakpointIcon.regular,
            message
        };
    }
    exports.getBreakpointMessageAndIcon = getBreakpointMessageAndIcon;
    (0, actions_2.registerAction2)(class extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.debug.viewlet.action.addFunctionBreakpointAction',
                title: {
                    value: (0, nls_1.localize)('addFunctionBreakpoint', "Add Function Breakpoint"),
                    original: 'Add Function Breakpoint',
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miFunctionBreakpoint', comment: ['&& denotes a mnemonic'] }, "&&Function Breakpoint...")
                },
                f1: true,
                icon: icons.watchExpressionsAddFuncBreakpoint,
                menu: [{
                        id: actions_2.MenuId.ViewTitle,
                        group: 'navigation',
                        order: 10,
                        when: contextkey_1.ContextKeyExpr.equals('view', debug_1.BREAKPOINTS_VIEW_ID)
                    }, {
                        id: actions_2.MenuId.MenubarNewBreakpointMenu,
                        group: '1_breakpoints',
                        order: 3,
                        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
                    }]
            });
        }
        run(accessor) {
            const debugService = accessor.get(debug_1.IDebugService);
            debugService.addFunctionBreakpoint();
        }
    });
    (0, actions_2.registerAction2)(class extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.debug.viewlet.action.toggleBreakpointsActivatedAction',
                title: { value: (0, nls_1.localize)('activateBreakpoints', "Toggle Activate Breakpoints"), original: 'Toggle Activate Breakpoints' },
                f1: true,
                icon: icons.breakpointsActivate,
                menu: {
                    id: actions_2.MenuId.ViewTitle,
                    group: 'navigation',
                    order: 20,
                    when: contextkey_1.ContextKeyExpr.equals('view', debug_1.BREAKPOINTS_VIEW_ID)
                }
            });
        }
        run(accessor) {
            const debugService = accessor.get(debug_1.IDebugService);
            debugService.setBreakpointsActivated(!debugService.getModel().areBreakpointsActivated());
        }
    });
    (0, actions_2.registerAction2)(class extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.debug.viewlet.action.removeBreakpoint',
                title: (0, nls_1.localize)('removeBreakpoint', "Remove Breakpoint"),
                icon: codicons_1.Codicon.removeClose,
                menu: [{
                        id: actions_2.MenuId.DebugBreakpointsContext,
                        group: '3_modification',
                        order: 10,
                        when: debug_1.CONTEXT_BREAKPOINT_ITEM_TYPE.notEqualsTo('exceptionBreakpoint')
                    }, {
                        id: actions_2.MenuId.DebugBreakpointsContext,
                        group: 'inline',
                        order: 20,
                        when: debug_1.CONTEXT_BREAKPOINT_ITEM_TYPE.notEqualsTo('exceptionBreakpoint')
                    }]
            });
        }
        async run(accessor, breakpoint) {
            const debugService = accessor.get(debug_1.IDebugService);
            if (breakpoint instanceof debugModel_1.Breakpoint) {
                await debugService.removeBreakpoints(breakpoint.getId());
            }
            else if (breakpoint instanceof debugModel_1.FunctionBreakpoint) {
                await debugService.removeFunctionBreakpoints(breakpoint.getId());
            }
            else if (breakpoint instanceof debugModel_1.DataBreakpoint) {
                await debugService.removeDataBreakpoints(breakpoint.getId());
            }
            else if (breakpoint instanceof debugModel_1.InstructionBreakpoint) {
                await debugService.removeInstructionBreakpoints(breakpoint.instructionReference);
            }
        }
    });
    (0, actions_2.registerAction2)(class extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.debug.viewlet.action.removeAllBreakpoints',
                title: {
                    original: 'Remove All Breakpoints',
                    value: (0, nls_1.localize)('removeAllBreakpoints', "Remove All Breakpoints"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miRemoveAllBreakpoints', comment: ['&& denotes a mnemonic'] }, "Remove &&All Breakpoints")
                },
                f1: true,
                icon: icons.breakpointsRemoveAll,
                menu: [{
                        id: actions_2.MenuId.ViewTitle,
                        group: 'navigation',
                        order: 30,
                        when: contextkey_1.ContextKeyExpr.equals('view', debug_1.BREAKPOINTS_VIEW_ID)
                    }, {
                        id: actions_2.MenuId.DebugBreakpointsContext,
                        group: '3_modification',
                        order: 20,
                        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_BREAKPOINTS_EXIST, debug_1.CONTEXT_BREAKPOINT_ITEM_TYPE.notEqualsTo('exceptionBreakpoint'))
                    }, {
                        id: actions_2.MenuId.MenubarDebugMenu,
                        group: '5_breakpoints',
                        order: 3,
                        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
                    }]
            });
        }
        run(accessor) {
            const debugService = accessor.get(debug_1.IDebugService);
            debugService.removeBreakpoints();
            debugService.removeFunctionBreakpoints();
            debugService.removeDataBreakpoints();
            debugService.removeInstructionBreakpoints();
        }
    });
    (0, actions_2.registerAction2)(class extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.debug.viewlet.action.enableAllBreakpoints',
                title: {
                    original: 'Enable All Breakpoints',
                    value: (0, nls_1.localize)('enableAllBreakpoints', "Enable All Breakpoints"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miEnableAllBreakpoints', comment: ['&& denotes a mnemonic'] }, "&&Enable All Breakpoints"),
                },
                f1: true,
                precondition: debug_1.CONTEXT_DEBUGGERS_AVAILABLE,
                menu: [{
                        id: actions_2.MenuId.DebugBreakpointsContext,
                        group: 'z_commands',
                        order: 10,
                        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_BREAKPOINTS_EXIST, debug_1.CONTEXT_BREAKPOINT_ITEM_TYPE.notEqualsTo('exceptionBreakpoint'))
                    }, {
                        id: actions_2.MenuId.MenubarDebugMenu,
                        group: '5_breakpoints',
                        order: 1,
                        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
                    }]
            });
        }
        async run(accessor) {
            const debugService = accessor.get(debug_1.IDebugService);
            await debugService.enableOrDisableBreakpoints(true);
        }
    });
    (0, actions_2.registerAction2)(class extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.debug.viewlet.action.disableAllBreakpoints',
                title: {
                    original: 'Disable All Breakpoints',
                    value: (0, nls_1.localize)('disableAllBreakpoints', "Disable All Breakpoints"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miDisableAllBreakpoints', comment: ['&& denotes a mnemonic'] }, "Disable A&&ll Breakpoints")
                },
                f1: true,
                precondition: debug_1.CONTEXT_DEBUGGERS_AVAILABLE,
                menu: [{
                        id: actions_2.MenuId.DebugBreakpointsContext,
                        group: 'z_commands',
                        order: 20,
                        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_BREAKPOINTS_EXIST, debug_1.CONTEXT_BREAKPOINT_ITEM_TYPE.notEqualsTo('exceptionBreakpoint'))
                    }, {
                        id: actions_2.MenuId.MenubarDebugMenu,
                        group: '5_breakpoints',
                        order: 2,
                        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
                    }]
            });
        }
        async run(accessor) {
            const debugService = accessor.get(debug_1.IDebugService);
            await debugService.enableOrDisableBreakpoints(false);
        }
    });
    (0, actions_2.registerAction2)(class extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.debug.viewlet.action.reapplyBreakpointsAction',
                title: { value: (0, nls_1.localize)('reapplyAllBreakpoints', "Reapply All Breakpoints"), original: 'Reapply All Breakpoints' },
                f1: true,
                precondition: debug_1.CONTEXT_IN_DEBUG_MODE,
                menu: [{
                        id: actions_2.MenuId.DebugBreakpointsContext,
                        group: 'z_commands',
                        order: 30,
                        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_BREAKPOINTS_EXIST, debug_1.CONTEXT_BREAKPOINT_ITEM_TYPE.notEqualsTo('exceptionBreakpoint'))
                    }]
            });
        }
        async run(accessor) {
            const debugService = accessor.get(debug_1.IDebugService);
            await debugService.setBreakpointsActivated(true);
        }
    });
    (0, actions_2.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: 'debug.editBreakpoint',
                viewId: debug_1.BREAKPOINTS_VIEW_ID,
                title: (0, nls_1.localize)('editCondition', "Edit Condition..."),
                icon: codicons_1.Codicon.edit,
                precondition: debug_1.CONTEXT_BREAKPOINT_SUPPORTS_CONDITION,
                menu: [{
                        id: actions_2.MenuId.DebugBreakpointsContext,
                        group: 'navigation',
                        order: 10
                    }, {
                        id: actions_2.MenuId.DebugBreakpointsContext,
                        group: 'inline',
                        order: 10
                    }]
            });
        }
        async runInView(accessor, view, breakpoint) {
            const debugService = accessor.get(debug_1.IDebugService);
            const editorService = accessor.get(editorService_1.IEditorService);
            if (breakpoint instanceof debugModel_1.Breakpoint) {
                const editor = await openBreakpointSource(breakpoint, false, false, true, debugService, editorService);
                if (editor) {
                    const codeEditor = editor.getControl();
                    if ((0, editorBrowser_1.isCodeEditor)(codeEditor)) {
                        codeEditor.getContribution(debug_1.BREAKPOINT_EDITOR_CONTRIBUTION_ID)?.showBreakpointWidget(breakpoint.lineNumber, breakpoint.column);
                    }
                }
            }
            else if (breakpoint instanceof debugModel_1.FunctionBreakpoint) {
                const contextMenuService = accessor.get(contextView_1.IContextMenuService);
                const actions = [new actions_1.Action('breakpoint.editCondition', (0, nls_1.localize)('editCondition', "Edit Condition..."), undefined, true, async () => view.renderInputBox({ breakpoint, type: 'condition' })),
                    new actions_1.Action('breakpoint.editCondition', (0, nls_1.localize)('editHitCount', "Edit Hit Count..."), undefined, true, async () => view.renderInputBox({ breakpoint, type: 'hitCount' }))];
                const domNode = breakpointIdToActionBarDomeNode.get(breakpoint.getId());
                if (domNode) {
                    contextMenuService.showContextMenu({
                        getActions: () => actions,
                        getAnchor: () => domNode,
                        onHide: () => (0, lifecycle_1.dispose)(actions)
                    });
                }
            }
            else {
                view.renderInputBox({ breakpoint, type: 'condition' });
            }
        }
    });
    (0, actions_2.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: 'debug.editFunctionBreakpoint',
                viewId: debug_1.BREAKPOINTS_VIEW_ID,
                title: (0, nls_1.localize)('editBreakpoint', "Edit Function Breakpoint..."),
                menu: [{
                        id: actions_2.MenuId.DebugBreakpointsContext,
                        group: '1_breakpoints',
                        order: 10,
                        when: debug_1.CONTEXT_BREAKPOINT_ITEM_TYPE.isEqualTo('functionBreakpoint')
                    }]
            });
        }
        runInView(_accessor, view, breakpoint) {
            view.renderInputBox({ breakpoint, type: 'name' });
        }
    });
    (0, actions_2.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: 'debug.editFunctionBreakpointHitCount',
                viewId: debug_1.BREAKPOINTS_VIEW_ID,
                title: (0, nls_1.localize)('editHitCount', "Edit Hit Count..."),
                precondition: debug_1.CONTEXT_BREAKPOINT_SUPPORTS_CONDITION,
                menu: [{
                        id: actions_2.MenuId.DebugBreakpointsContext,
                        group: 'navigation',
                        order: 20,
                        when: debug_1.CONTEXT_BREAKPOINT_ITEM_TYPE.isEqualTo('functionBreakpoint')
                    }]
            });
        }
        runInView(_accessor, view, breakpoint) {
            view.renderInputBox({ breakpoint, type: 'hitCount' });
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJlYWtwb2ludHNWaWV3LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZGVidWcvYnJvd3Nlci9icmVha3BvaW50c1ZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQW9EaEcsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUVoQixTQUFTLGNBQWMsQ0FBQyxXQUEwQjtRQUNqRCxNQUFNLFFBQVEsR0FBcUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzlDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDO1FBQzNCLFFBQVEsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDdkIsV0FBVyxDQUFDLElBQUksQ0FBQyxlQUFPLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFFakQsT0FBTyxRQUFRLENBQUM7SUFDakIsQ0FBQztJQUVELE1BQU0sdUJBQXVCLEdBQUcsQ0FBQyxDQUFDO0lBQ2xDLFNBQWdCLG1CQUFtQixDQUFDLEtBQWtCLEVBQUUsU0FBNkIsRUFBRSxVQUFrQjtRQUN4RyxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxpQ0FBaUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLHNCQUFzQixFQUFFLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMseUJBQXlCLEVBQUUsQ0FBQyxNQUFNLENBQUM7UUFDaE8sT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDMUMsQ0FBQztJQUhELGtEQUdDO0lBUU0sSUFBTSxlQUFlLEdB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