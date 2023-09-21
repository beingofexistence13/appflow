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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/touch", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/iconLabel/iconLabel", "vs/base/browser/ui/inputbox/inputBox", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/editor/browser/editorBrowser", "vs/editor/common/languages/language", "vs/nls!vs/workbench/contrib/debug/browser/breakpointsView", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/label/common/label", "vs/platform/list/browser/listService", "vs/platform/opener/common/opener", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/browser/defaultStyles", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/views", "vs/workbench/contrib/debug/browser/debugIcons", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/contrib/debug/common/disassemblyViewInput", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/hover/browser/hover"], function (require, exports, dom, touch_1, actionbar_1, iconLabel_1, inputBox_1, actions_1, arrays_1, async_1, codicons_1, htmlContent_1, lifecycle_1, resources, editorBrowser_1, language_1, nls_1, menuEntryActionViewItem_1, actions_2, configuration_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, label_1, listService_1, opener_1, telemetry_1, defaultStyles_1, themeService_1, themables_1, viewPane_1, views_1, icons, debug_1, debugModel_1, disassemblyViewInput_1, editorService_1, hover_1) {
    "use strict";
    var BreakpointsRenderer_1, FunctionBreakpointsRenderer_1, DataBreakpointsRenderer_1, InstructionBreakpointsRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$_Fb = exports.$$Fb = exports.$0Fb = exports.$9Fb = void 0;
    const $ = dom.$;
    function createCheckbox(disposables) {
        const checkbox = $('input');
        checkbox.type = 'checkbox';
        checkbox.tabIndex = -1;
        disposables.push(touch_1.$EP.ignoreTarget(checkbox));
        return checkbox;
    }
    const MAX_VISIBLE_BREAKPOINTS = 9;
    function $9Fb(model, sessionId, countLimit) {
        const length = model.getBreakpoints().length + model.getExceptionBreakpointsForSession(sessionId).length + model.getFunctionBreakpoints().length + model.getDataBreakpoints().length + model.getInstructionBreakpoints().length;
        return Math.min(countLimit, length) * 22;
    }
    exports.$9Fb = $9Fb;
    let $0Fb = class $0Fb extends viewPane_1.$Ieb {
        constructor(options, contextMenuService, t, keybindingService, instantiationService, themeService, L, ab, configurationService, viewDescriptorService, contextKeyService, openerService, telemetryService, sb, menuService, Wb, Xb) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.t = t;
            this.L = L;
            this.ab = ab;
            this.sb = sb;
            this.Wb = Wb;
            this.Xb = Xb;
            this.b = false;
            this.c = false;
            this.f = false;
            this.n = -1;
            this.g = menuService.createMenu(actions_2.$Ru.DebugBreakpointsContext, contextKeyService);
            this.B(this.g);
            this.h = debug_1.$OG.bindTo(contextKeyService);
            this.j = debug_1.$PG.bindTo(contextKeyService);
            this.breakpointInputFocused = debug_1.$HG.bindTo(contextKeyService);
            this.B(this.t.getModel().onDidChangeBreakpoints(() => this.dc()));
            this.B(this.t.getViewModel().onDidFocusSession(() => this.dc()));
            this.B(this.t.onDidChangeState(() => this.ec()));
            this.s = this.B(new async_1.$Sg(() => this.cc(true), 4000));
        }
        U(container) {
            super.U(container);
            this.element.classList.add('debug-pane');
            container.classList.add('debug-breakpoints');
            const delegate = new BreakpointsDelegate(this);
            this.a = this.Bb.createInstance(listService_1.$p4, 'Breakpoints', container, delegate, [
                this.Bb.createInstance(BreakpointsRenderer, this.g, this.j, this.h),
                new ExceptionBreakpointsRenderer(this.g, this.j, this.h, this.t),
                new ExceptionBreakpointInputRenderer(this, this.t, this.ab),
                this.Bb.createInstance(FunctionBreakpointsRenderer, this.g, this.j, this.h),
                this.Bb.createInstance(DataBreakpointsRenderer),
                new FunctionBreakpointInputRenderer(this, this.t, this.ab, this.sb),
                this.Bb.createInstance(InstructionBreakpointsRenderer),
            ], {
                identityProvider: { getId: (element) => element.getId() },
                multipleSelectionSupport: false,
                keyboardNavigationLabelProvider: { getKeyboardNavigationLabel: (e) => e },
                accessibilityProvider: new BreakpointsAccessibilityProvider(this.t, this.sb),
                overrideStyles: {
                    listBackground: this.Rb()
                }
            });
            debug_1.$CG.bindTo(this.a.contextKeyService);
            this.B(this.a.onContextMenu(this.ac, this));
            this.a.onMouseMiddleClick(async ({ element }) => {
                if (element instanceof debugModel_1.$SFb) {
                    await this.t.removeBreakpoints(element.getId());
                }
                else if (element instanceof debugModel_1.$TFb) {
                    await this.t.removeFunctionBreakpoints(element.getId());
                }
                else if (element instanceof debugModel_1.$UFb) {
                    await this.t.removeDataBreakpoints(element.getId());
                }
                else if (element instanceof debugModel_1.$WFb) {
                    await this.t.removeInstructionBreakpoints(element.instructionReference, element.offset);
                }
            });
            this.B(this.a.onDidOpen(async (e) => {
                if (!e.element) {
                    return;
                }
                if (e.browserEvent instanceof MouseEvent && e.browserEvent.button === 1) { // middle click
                    return;
                }
                if (e.element instanceof debugModel_1.$SFb) {
                    $$Fb(e.element, e.sideBySide, e.editorOptions.preserveFocus || false, e.editorOptions.pinned || !e.editorOptions.preserveFocus, this.t, this.L);
                }
                if (e.element instanceof debugModel_1.$WFb) {
                    const disassemblyView = await this.L.openEditor(disassemblyViewInput_1.$GFb.instance);
                    // Focus on double click
                    disassemblyView.goToInstructionAndOffset(e.element.instructionReference, e.element.offset, e.browserEvent instanceof MouseEvent && e.browserEvent.detail === 2);
                }
                if (e.browserEvent instanceof MouseEvent && e.browserEvent.detail === 2 && e.element instanceof debugModel_1.$TFb && e.element !== this.inputBoxData?.breakpoint) {
                    // double click
                    this.renderInputBox({ breakpoint: e.element, type: 'name' });
                }
            }));
            this.a.splice(0, this.a.length, this.fc);
            this.B(this.onDidChangeBodyVisibility(visible => {
                if (visible) {
                    if (this.b) {
                        this.dc();
                    }
                    if (this.c) {
                        this.ec();
                    }
                }
            }));
            const containerModel = this.Ab.getViewContainerModel(this.Ab.getViewContainerByViewId(this.id));
            this.B(containerModel.onDidChangeAllViewDescriptors(() => {
                this.bc();
            }));
        }
        Ib(container, title) {
            super.Ib(container, title);
            const iconLabelContainer = dom.$0O(container, $('span.breakpoint-warning'));
            this.r = this.B(new iconLabel_1.$KR(iconLabelContainer, {
                supportIcons: true, hoverDelegate: {
                    showHover: (options, focus) => this.Wb.showHover({ content: options.content, target: this.r.element }, focus),
                    delay: this.yb.getValue('workbench.hover.delay')
                }
            }));
            dom.$eP(this.r.element);
        }
        focus() {
            super.focus();
            this.a?.domFocus();
        }
        renderInputBox(data) {
            this.m = data;
            this.dc();
            this.m = undefined;
        }
        get inputBoxData() {
            return this.m;
        }
        W(height, width) {
            if (this.f) {
                return;
            }
            super.W(height, width);
            this.a?.layout(height, width);
            try {
                this.f = true;
                this.bc();
            }
            finally {
                this.f = false;
            }
        }
        ac(e) {
            const element = e.element;
            const type = element instanceof debugModel_1.$SFb ? 'breakpoint' : element instanceof debugModel_1.$VFb ? 'exceptionBreakpoint' :
                element instanceof debugModel_1.$TFb ? 'functionBreakpoint' : element instanceof debugModel_1.$UFb ? 'dataBreakpoint' :
                    element instanceof debugModel_1.$WFb ? 'instructionBreakpoint' : undefined;
            this.h.set(type);
            const session = this.t.getViewModel().focusedSession;
            const conditionSupported = element instanceof debugModel_1.$VFb ? element.supportsCondition : (!session || !!session.capabilities.supportsConditionalBreakpoints);
            this.j.set(conditionSupported);
            const secondary = [];
            (0, menuEntryActionViewItem_1.$A3)(this.g, { arg: e.element, shouldForwardArgs: false }, { primary: [], secondary }, 'inline');
            this.xb.showContextMenu({
                getAnchor: () => e.anchor,
                getActions: () => secondary,
                getActionsContext: () => element
            });
        }
        bc() {
            const containerModel = this.Ab.getViewContainerModel(this.Ab.getViewContainerByViewId(this.id));
            // Adjust expanded body size
            const sessionId = this.t.getViewModel().focusedSession?.getId();
            this.minimumBodySize = this.orientation === 0 /* Orientation.VERTICAL */ ? $9Fb(this.t.getModel(), sessionId, MAX_VISIBLE_BREAKPOINTS) : 170;
            this.maximumBodySize = this.orientation === 0 /* Orientation.VERTICAL */ && containerModel.visibleViewDescriptors.length > 1 ? $9Fb(this.t.getModel(), sessionId, Number.POSITIVE_INFINITY) : Number.POSITIVE_INFINITY;
        }
        cc(delayed = false) {
            if (!this.r) {
                return;
            }
            const currentType = this.t.getViewModel().focusedSession?.configuration.type;
            const dbg = currentType ? this.t.getAdapterManager().getDebugger(currentType) : undefined;
            const message = dbg?.strings?.[debug_1.DebuggerString.UnverifiedBreakpoints];
            const debuggerHasUnverifiedBps = message && this.t.getModel().getBreakpoints().filter(bp => {
                if (bp.verified || !bp.enabled) {
                    return false;
                }
                const langId = this.Xb.guessLanguageIdByFilepathOrFirstLine(bp.uri);
                return langId && dbg.interestedInLanguage(langId);
            });
            if (message && debuggerHasUnverifiedBps?.length && this.t.getModel().areBreakpointsActivated()) {
                if (delayed) {
                    const mdown = new htmlContent_1.$Xj(undefined, { isTrusted: true }).appendMarkdown(message);
                    this.r.setLabel('$(warning)', undefined, { title: { markdown: mdown, markdownNotSupportedFallback: message } });
                    dom.$dP(this.r.element);
                }
                else {
                    this.s.schedule();
                }
            }
            else {
                dom.$eP(this.r.element);
            }
        }
        dc() {
            if (this.isBodyVisible()) {
                this.bc();
                if (this.a) {
                    const lastFocusIndex = this.a.getFocus()[0];
                    // Check whether focused element was removed
                    const needsRefocus = lastFocusIndex && !this.fc.includes(this.a.element(lastFocusIndex));
                    this.a.splice(0, this.a.length, this.fc);
                    this.b = false;
                    if (needsRefocus) {
                        this.a.focusNth(Math.min(lastFocusIndex, this.a.length - 1));
                    }
                }
                this.cc();
            }
            else {
                this.b = true;
            }
        }
        ec() {
            if (this.isBodyVisible()) {
                this.c = false;
                const thread = this.t.getViewModel().focusedThread;
                let found = false;
                if (thread && thread.stoppedDetails && thread.stoppedDetails.hitBreakpointIds && thread.stoppedDetails.hitBreakpointIds.length > 0) {
                    const hitBreakpointIds = thread.stoppedDetails.hitBreakpointIds;
                    const elements = this.fc;
                    const index = elements.findIndex(e => {
                        const id = e.getIdFromAdapter(thread.session.getId());
                        return typeof id === 'number' && hitBreakpointIds.indexOf(id) !== -1;
                    });
                    if (index >= 0) {
                        this.a.setFocus([index]);
                        this.a.setSelection([index]);
                        found = true;
                        this.n = index;
                    }
                }
                if (!found) {
                    // Deselect breakpoint in breakpoint view when no longer stopped on it #125528
                    const focus = this.a.getFocus();
                    const selection = this.a.getSelection();
                    if (this.n >= 0 && (0, arrays_1.$sb)(focus, selection) && focus.indexOf(this.n) >= 0) {
                        this.a.setFocus([]);
                        this.a.setSelection([]);
                    }
                    this.n = -1;
                }
                this.cc();
            }
            else {
                this.c = true;
            }
        }
        get fc() {
            const model = this.t.getModel();
            const sessionId = this.t.getViewModel().focusedSession?.getId();
            const elements = model.getExceptionBreakpointsForSession(sessionId).concat(model.getFunctionBreakpoints()).concat(model.getDataBreakpoints()).concat(model.getBreakpoints()).concat(model.getInstructionBreakpoints());
            return elements;
        }
    };
    exports.$0Fb = $0Fb;
    exports.$0Fb = $0Fb = __decorate([
        __param(1, contextView_1.$WZ),
        __param(2, debug_1.$nH),
        __param(3, keybinding_1.$2D),
        __param(4, instantiation_1.$Ah),
        __param(5, themeService_1.$gv),
        __param(6, editorService_1.$9C),
        __param(7, contextView_1.$VZ),
        __param(8, configuration_1.$8h),
        __param(9, views_1.$_E),
        __param(10, contextkey_1.$3i),
        __param(11, opener_1.$NT),
        __param(12, telemetry_1.$9k),
        __param(13, label_1.$Vz),
        __param(14, actions_2.$Su),
        __param(15, hover_1.$zib),
        __param(16, language_1.$ct)
    ], $0Fb);
    class BreakpointsDelegate {
        constructor(a) {
            this.a = a;
            // noop
        }
        getHeight(_element) {
            return 22;
        }
        getTemplateId(element) {
            if (element instanceof debugModel_1.$SFb) {
                return BreakpointsRenderer.ID;
            }
            if (element instanceof debugModel_1.$TFb) {
                const inputBoxBreakpoint = this.a.inputBoxData?.breakpoint;
                if (!element.name || (inputBoxBreakpoint && inputBoxBreakpoint.getId() === element.getId())) {
                    return FunctionBreakpointInputRenderer.ID;
                }
                return FunctionBreakpointsRenderer.ID;
            }
            if (element instanceof debugModel_1.$VFb) {
                const inputBoxBreakpoint = this.a.inputBoxData?.breakpoint;
                if (inputBoxBreakpoint && inputBoxBreakpoint.getId() === element.getId()) {
                    return ExceptionBreakpointInputRenderer.ID;
                }
                return ExceptionBreakpointsRenderer.ID;
            }
            if (element instanceof debugModel_1.$UFb) {
                return DataBreakpointsRenderer.ID;
            }
            if (element instanceof debugModel_1.$WFb) {
                return InstructionBreakpointsRenderer.ID;
            }
            return '';
        }
    }
    const breakpointIdToActionBarDomeNode = new Map();
    let BreakpointsRenderer = class BreakpointsRenderer {
        static { BreakpointsRenderer_1 = this; }
        constructor(a, b, c, d, f) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.f = f;
            // noop
        }
        static { this.ID = 'breakpoints'; }
        get templateId() {
            return BreakpointsRenderer_1.ID;
        }
        renderTemplate(container) {
            const data = Object.create(null);
            data.toDispose = [];
            data.breakpoint = dom.$0O(container, $('.breakpoint'));
            data.icon = $('.icon');
            data.checkbox = createCheckbox(data.toDispose);
            data.toDispose.push(dom.$oO(data.checkbox, 'change', (e) => {
                this.d.enableOrDisableBreakpoints(!data.context.enabled, data.context);
            }));
            dom.$0O(data.breakpoint, data.icon);
            dom.$0O(data.breakpoint, data.checkbox);
            data.name = dom.$0O(data.breakpoint, $('span.name'));
            data.filePath = dom.$0O(data.breakpoint, $('span.file-path'));
            data.actionBar = new actionbar_1.$1P(data.breakpoint);
            data.toDispose.push(data.actionBar);
            const lineNumberContainer = dom.$0O(data.breakpoint, $('.line-number-container'));
            data.lineNumber = dom.$0O(lineNumberContainer, $('span.line-number.monaco-count-badge'));
            return data;
        }
        renderElement(breakpoint, index, data) {
            data.context = breakpoint;
            data.breakpoint.classList.toggle('disabled', !this.d.getModel().areBreakpointsActivated());
            data.name.textContent = resources.$eg(breakpoint.uri);
            data.lineNumber.textContent = breakpoint.lineNumber.toString();
            if (breakpoint.column) {
                data.lineNumber.textContent += `:${breakpoint.column}`;
            }
            data.filePath.textContent = this.f.getUriLabel(resources.$hg(breakpoint.uri), { relative: true });
            data.checkbox.checked = breakpoint.enabled;
            const { message, icon } = $_Fb(this.d.state, this.d.getModel().areBreakpointsActivated(), breakpoint, this.f);
            data.icon.className = themables_1.ThemeIcon.asClassName(icon);
            data.breakpoint.title = breakpoint.message || message || '';
            const debugActive = this.d.state === 3 /* State.Running */ || this.d.state === 2 /* State.Stopped */;
            if (debugActive && !breakpoint.verified) {
                data.breakpoint.classList.add('disabled');
            }
            const primary = [];
            const session = this.d.getViewModel().focusedSession;
            this.b.set(!session || !!session.capabilities.supportsConditionalBreakpoints);
            this.c.set('breakpoint');
            (0, menuEntryActionViewItem_1.$B3)(this.a, { arg: breakpoint, shouldForwardArgs: true }, { primary, secondary: [] }, 'inline');
            data.actionBar.clear();
            data.actionBar.push(primary, { icon: true, label: false });
            breakpointIdToActionBarDomeNode.set(breakpoint.getId(), data.actionBar.domNode);
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.$fc)(templateData.toDispose);
        }
    };
    BreakpointsRenderer = BreakpointsRenderer_1 = __decorate([
        __param(3, debug_1.$nH),
        __param(4, label_1.$Vz)
    ], BreakpointsRenderer);
    class ExceptionBreakpointsRenderer {
        constructor(a, b, c, d) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            // noop
        }
        static { this.ID = 'exceptionbreakpoints'; }
        get templateId() {
            return ExceptionBreakpointsRenderer.ID;
        }
        renderTemplate(container) {
            const data = Object.create(null);
            data.toDispose = [];
            data.breakpoint = dom.$0O(container, $('.breakpoint'));
            data.checkbox = createCheckbox(data.toDispose);
            data.toDispose.push(dom.$oO(data.checkbox, 'change', (e) => {
                this.d.enableOrDisableBreakpoints(!data.context.enabled, data.context);
            }));
            dom.$0O(data.breakpoint, data.checkbox);
            data.name = dom.$0O(data.breakpoint, $('span.name'));
            data.condition = dom.$0O(data.breakpoint, $('span.condition'));
            data.breakpoint.classList.add('exception');
            data.actionBar = new actionbar_1.$1P(data.breakpoint);
            data.toDispose.push(data.actionBar);
            return data;
        }
        renderElement(exceptionBreakpoint, index, data) {
            data.context = exceptionBreakpoint;
            data.name.textContent = exceptionBreakpoint.label || `${exceptionBreakpoint.filter} exceptions`;
            data.breakpoint.title = exceptionBreakpoint.verified ? (exceptionBreakpoint.description || data.name.textContent) : exceptionBreakpoint.message || (0, nls_1.localize)(0, null);
            data.breakpoint.classList.toggle('disabled', !exceptionBreakpoint.verified);
            data.checkbox.checked = exceptionBreakpoint.enabled;
            data.condition.textContent = exceptionBreakpoint.condition || '';
            data.condition.title = (0, nls_1.localize)(1, null, exceptionBreakpoint.condition);
            const primary = [];
            this.b.set(exceptionBreakpoint.supportsCondition);
            this.c.set('exceptionBreakpoint');
            (0, menuEntryActionViewItem_1.$B3)(this.a, { arg: exceptionBreakpoint, shouldForwardArgs: true }, { primary, secondary: [] }, 'inline');
            data.actionBar.clear();
            data.actionBar.push(primary, { icon: true, label: false });
            breakpointIdToActionBarDomeNode.set(exceptionBreakpoint.getId(), data.actionBar.domNode);
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.$fc)(templateData.toDispose);
        }
    }
    let FunctionBreakpointsRenderer = class FunctionBreakpointsRenderer {
        static { FunctionBreakpointsRenderer_1 = this; }
        constructor(a, b, c, d, f) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.f = f;
            // noop
        }
        static { this.ID = 'functionbreakpoints'; }
        get templateId() {
            return FunctionBreakpointsRenderer_1.ID;
        }
        renderTemplate(container) {
            const data = Object.create(null);
            data.toDispose = [];
            data.breakpoint = dom.$0O(container, $('.breakpoint'));
            data.icon = $('.icon');
            data.checkbox = createCheckbox(data.toDispose);
            data.toDispose.push(dom.$oO(data.checkbox, 'change', (e) => {
                this.d.enableOrDisableBreakpoints(!data.context.enabled, data.context);
            }));
            dom.$0O(data.breakpoint, data.icon);
            dom.$0O(data.breakpoint, data.checkbox);
            data.name = dom.$0O(data.breakpoint, $('span.name'));
            data.condition = dom.$0O(data.breakpoint, $('span.condition'));
            data.actionBar = new actionbar_1.$1P(data.breakpoint);
            data.toDispose.push(data.actionBar);
            return data;
        }
        renderElement(functionBreakpoint, _index, data) {
            data.context = functionBreakpoint;
            data.name.textContent = functionBreakpoint.name;
            const { icon, message } = $_Fb(this.d.state, this.d.getModel().areBreakpointsActivated(), functionBreakpoint, this.f);
            data.icon.className = themables_1.ThemeIcon.asClassName(icon);
            data.icon.title = message ? message : '';
            data.checkbox.checked = functionBreakpoint.enabled;
            data.breakpoint.title = message ? message : '';
            if (functionBreakpoint.condition && functionBreakpoint.hitCondition) {
                data.condition.textContent = (0, nls_1.localize)(2, null, functionBreakpoint.condition, functionBreakpoint.hitCondition);
            }
            else {
                data.condition.textContent = functionBreakpoint.condition || functionBreakpoint.hitCondition || '';
            }
            // Mark function breakpoints as disabled if deactivated or if debug type does not support them #9099
            const session = this.d.getViewModel().focusedSession;
            data.breakpoint.classList.toggle('disabled', (session && !session.capabilities.supportsFunctionBreakpoints) || !this.d.getModel().areBreakpointsActivated());
            if (session && !session.capabilities.supportsFunctionBreakpoints) {
                data.breakpoint.title = (0, nls_1.localize)(3, null);
            }
            const primary = [];
            this.b.set(!session || !!session.capabilities.supportsConditionalBreakpoints);
            this.c.set('functionBreakpoint');
            (0, menuEntryActionViewItem_1.$B3)(this.a, { arg: functionBreakpoint, shouldForwardArgs: true }, { primary, secondary: [] }, 'inline');
            data.actionBar.clear();
            data.actionBar.push(primary, { icon: true, label: false });
            breakpointIdToActionBarDomeNode.set(functionBreakpoint.getId(), data.actionBar.domNode);
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.$fc)(templateData.toDispose);
        }
    };
    FunctionBreakpointsRenderer = FunctionBreakpointsRenderer_1 = __decorate([
        __param(3, debug_1.$nH),
        __param(4, label_1.$Vz)
    ], FunctionBreakpointsRenderer);
    let DataBreakpointsRenderer = class DataBreakpointsRenderer {
        static { DataBreakpointsRenderer_1 = this; }
        constructor(a, b) {
            this.a = a;
            this.b = b;
            // noop
        }
        static { this.ID = 'databreakpoints'; }
        get templateId() {
            return DataBreakpointsRenderer_1.ID;
        }
        renderTemplate(container) {
            const data = Object.create(null);
            data.breakpoint = dom.$0O(container, $('.breakpoint'));
            data.toDispose = [];
            data.icon = $('.icon');
            data.checkbox = createCheckbox(data.toDispose);
            data.toDispose.push(dom.$oO(data.checkbox, 'change', (e) => {
                this.a.enableOrDisableBreakpoints(!data.context.enabled, data.context);
            }));
            dom.$0O(data.breakpoint, data.icon);
            dom.$0O(data.breakpoint, data.checkbox);
            data.name = dom.$0O(data.breakpoint, $('span.name'));
            data.accessType = dom.$0O(data.breakpoint, $('span.access-type'));
            return data;
        }
        renderElement(dataBreakpoint, _index, data) {
            data.context = dataBreakpoint;
            data.name.textContent = dataBreakpoint.description;
            const { icon, message } = $_Fb(this.a.state, this.a.getModel().areBreakpointsActivated(), dataBreakpoint, this.b);
            data.icon.className = themables_1.ThemeIcon.asClassName(icon);
            data.icon.title = message ? message : '';
            data.checkbox.checked = dataBreakpoint.enabled;
            data.breakpoint.title = message ? message : '';
            // Mark function breakpoints as disabled if deactivated or if debug type does not support them #9099
            const session = this.a.getViewModel().focusedSession;
            data.breakpoint.classList.toggle('disabled', (session && !session.capabilities.supportsDataBreakpoints) || !this.a.getModel().areBreakpointsActivated());
            if (session && !session.capabilities.supportsDataBreakpoints) {
                data.breakpoint.title = (0, nls_1.localize)(4, null);
            }
            if (dataBreakpoint.accessType) {
                const accessType = dataBreakpoint.accessType === 'read' ? (0, nls_1.localize)(5, null) : dataBreakpoint.accessType === 'write' ? (0, nls_1.localize)(6, null) : (0, nls_1.localize)(7, null);
                data.accessType.textContent = accessType;
            }
            else {
                data.accessType.textContent = '';
            }
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.$fc)(templateData.toDispose);
        }
    };
    DataBreakpointsRenderer = DataBreakpointsRenderer_1 = __decorate([
        __param(0, debug_1.$nH),
        __param(1, label_1.$Vz)
    ], DataBreakpointsRenderer);
    let InstructionBreakpointsRenderer = class InstructionBreakpointsRenderer {
        static { InstructionBreakpointsRenderer_1 = this; }
        constructor(a, b) {
            this.a = a;
            this.b = b;
            // noop
        }
        static { this.ID = 'instructionBreakpoints'; }
        get templateId() {
            return InstructionBreakpointsRenderer_1.ID;
        }
        renderTemplate(container) {
            const data = Object.create(null);
            data.toDispose = [];
            data.breakpoint = dom.$0O(container, $('.breakpoint'));
            data.icon = $('.icon');
            data.checkbox = createCheckbox(data.toDispose);
            data.toDispose.push(dom.$oO(data.checkbox, 'change', (e) => {
                this.a.enableOrDisableBreakpoints(!data.context.enabled, data.context);
            }));
            dom.$0O(data.breakpoint, data.icon);
            dom.$0O(data.breakpoint, data.checkbox);
            data.name = dom.$0O(data.breakpoint, $('span.name'));
            data.address = dom.$0O(data.breakpoint, $('span.file-path'));
            data.actionBar = new actionbar_1.$1P(data.breakpoint);
            data.toDispose.push(data.actionBar);
            return data;
        }
        renderElement(breakpoint, index, data) {
            data.context = breakpoint;
            data.breakpoint.classList.toggle('disabled', !this.a.getModel().areBreakpointsActivated());
            data.name.textContent = '0x' + breakpoint.address.toString(16);
            data.name.title = `Decimal address: breakpoint.address.toString()`;
            data.checkbox.checked = breakpoint.enabled;
            const { message, icon } = $_Fb(this.a.state, this.a.getModel().areBreakpointsActivated(), breakpoint, this.b);
            data.icon.className = themables_1.ThemeIcon.asClassName(icon);
            data.breakpoint.title = breakpoint.message || message || '';
            const debugActive = this.a.state === 3 /* State.Running */ || this.a.state === 2 /* State.Stopped */;
            if (debugActive && !breakpoint.verified) {
                data.breakpoint.classList.add('disabled');
            }
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.$fc)(templateData.toDispose);
        }
    };
    InstructionBreakpointsRenderer = InstructionBreakpointsRenderer_1 = __decorate([
        __param(0, debug_1.$nH),
        __param(1, label_1.$Vz)
    ], InstructionBreakpointsRenderer);
    class FunctionBreakpointInputRenderer {
        constructor(a, b, c, d) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
        }
        static { this.ID = 'functionbreakpointinput'; }
        get templateId() {
            return FunctionBreakpointInputRenderer.ID;
        }
        renderTemplate(container) {
            const template = Object.create(null);
            const toDispose = [];
            const breakpoint = dom.$0O(container, $('.breakpoint'));
            template.icon = $('.icon');
            template.checkbox = createCheckbox(toDispose);
            dom.$0O(breakpoint, template.icon);
            dom.$0O(breakpoint, template.checkbox);
            this.a.breakpointInputFocused.set(true);
            const inputBoxContainer = dom.$0O(breakpoint, $('.inputBoxContainer'));
            const inputBox = new inputBox_1.$sR(inputBoxContainer, this.c, { inputBoxStyles: defaultStyles_1.$s2 });
            const wrapUp = (success) => {
                template.updating = true;
                try {
                    this.a.breakpointInputFocused.set(false);
                    const id = template.breakpoint.getId();
                    if (success) {
                        if (template.type === 'name') {
                            this.b.updateFunctionBreakpoint(id, { name: inputBox.value });
                        }
                        if (template.type === 'condition') {
                            this.b.updateFunctionBreakpoint(id, { condition: inputBox.value });
                        }
                        if (template.type === 'hitCount') {
                            this.b.updateFunctionBreakpoint(id, { hitCondition: inputBox.value });
                        }
                    }
                    else {
                        if (template.type === 'name' && !template.breakpoint.name) {
                            this.b.removeFunctionBreakpoints(id);
                        }
                        else {
                            this.a.renderInputBox(undefined);
                        }
                    }
                }
                finally {
                    template.updating = false;
                }
            };
            toDispose.push(dom.$oO(inputBox.inputElement, 'keydown', (e) => {
                const isEscape = e.equals(9 /* KeyCode.Escape */);
                const isEnter = e.equals(3 /* KeyCode.Enter */);
                if (isEscape || isEnter) {
                    e.preventDefault();
                    e.stopPropagation();
                    wrapUp(isEnter);
                }
            }));
            toDispose.push(dom.$nO(inputBox.inputElement, 'blur', () => {
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
            data.type = this.a.inputBoxData?.type || 'name'; // If there is no type set take the 'name' as the default
            const { icon, message } = $_Fb(this.b.state, this.b.getModel().areBreakpointsActivated(), functionBreakpoint, this.d);
            data.icon.className = themables_1.ThemeIcon.asClassName(icon);
            data.icon.title = message ? message : '';
            data.checkbox.checked = functionBreakpoint.enabled;
            data.checkbox.disabled = true;
            data.inputBox.value = functionBreakpoint.name || '';
            let placeholder = (0, nls_1.localize)(8, null);
            let ariaLabel = (0, nls_1.localize)(9, null);
            if (data.type === 'condition') {
                data.inputBox.value = functionBreakpoint.condition || '';
                placeholder = (0, nls_1.localize)(10, null);
                ariaLabel = (0, nls_1.localize)(11, null);
            }
            else if (data.type === 'hitCount') {
                data.inputBox.value = functionBreakpoint.hitCondition || '';
                placeholder = (0, nls_1.localize)(12, null);
                ariaLabel = (0, nls_1.localize)(13, null);
            }
            data.inputBox.setAriaLabel(ariaLabel);
            data.inputBox.setPlaceHolder(placeholder);
            setTimeout(() => {
                data.inputBox.focus();
                data.inputBox.select();
            }, 0);
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.$fc)(templateData.toDispose);
        }
    }
    class ExceptionBreakpointInputRenderer {
        constructor(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
            // noop
        }
        static { this.ID = 'exceptionbreakpointinput'; }
        get templateId() {
            return ExceptionBreakpointInputRenderer.ID;
        }
        renderTemplate(container) {
            const template = Object.create(null);
            const toDispose = [];
            const breakpoint = dom.$0O(container, $('.breakpoint'));
            breakpoint.classList.add('exception');
            template.checkbox = createCheckbox(toDispose);
            dom.$0O(breakpoint, template.checkbox);
            this.a.breakpointInputFocused.set(true);
            const inputBoxContainer = dom.$0O(breakpoint, $('.inputBoxContainer'));
            const inputBox = new inputBox_1.$sR(inputBoxContainer, this.c, {
                ariaLabel: (0, nls_1.localize)(14, null),
                inputBoxStyles: defaultStyles_1.$s2
            });
            const wrapUp = (success) => {
                this.a.breakpointInputFocused.set(false);
                let newCondition = template.breakpoint.condition;
                if (success) {
                    newCondition = inputBox.value !== '' ? inputBox.value : undefined;
                }
                this.b.setExceptionBreakpointCondition(template.breakpoint, newCondition);
            };
            toDispose.push(dom.$oO(inputBox.inputElement, 'keydown', (e) => {
                const isEscape = e.equals(9 /* KeyCode.Escape */);
                const isEnter = e.equals(3 /* KeyCode.Enter */);
                if (isEscape || isEnter) {
                    e.preventDefault();
                    e.stopPropagation();
                    wrapUp(isEnter);
                }
            }));
            toDispose.push(dom.$nO(inputBox.inputElement, 'blur', () => {
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
            const placeHolder = exceptionBreakpoint.conditionDescription || (0, nls_1.localize)(15, null);
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
            (0, lifecycle_1.$fc)(templateData.toDispose);
        }
    }
    class BreakpointsAccessibilityProvider {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        getWidgetAriaLabel() {
            return (0, nls_1.localize)(16, null);
        }
        getRole() {
            return 'checkbox';
        }
        isChecked(breakpoint) {
            return breakpoint.enabled;
        }
        getAriaLabel(element) {
            if (element instanceof debugModel_1.$VFb) {
                return element.toString();
            }
            const { message } = $_Fb(this.a.state, this.a.getModel().areBreakpointsActivated(), element, this.b);
            const toString = element.toString();
            return message ? `${toString}, ${message}` : toString;
        }
    }
    function $$Fb(breakpoint, sideBySide, preserveFocus, pinned, debugService, editorService) {
        if (breakpoint.uri.scheme === debug_1.$jH && debugService.state === 0 /* State.Inactive */) {
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
        }, sideBySide ? editorService_1.$$C : editorService_1.$0C);
    }
    exports.$$Fb = $$Fb;
    function $_Fb(state, breakpointsActivated, breakpoint, labelService) {
        const debugActive = state === 3 /* State.Running */ || state === 2 /* State.Stopped */;
        const breakpointIcon = breakpoint instanceof debugModel_1.$UFb ? icons.$4mb : breakpoint instanceof debugModel_1.$TFb ? icons.$2mb : breakpoint.logMessage ? icons.$5mb : icons.$1mb;
        if (!breakpoint.enabled || !breakpointsActivated) {
            return {
                icon: breakpointIcon.disabled,
                message: breakpoint.logMessage ? (0, nls_1.localize)(17, null) : (0, nls_1.localize)(18, null),
            };
        }
        const appendMessage = (text) => {
            return ('message' in breakpoint && breakpoint.message) ? text.concat(', ' + breakpoint.message) : text;
        };
        if (debugActive && !breakpoint.verified) {
            return {
                icon: breakpointIcon.unverified,
                message: ('message' in breakpoint && breakpoint.message) ? breakpoint.message : (breakpoint.logMessage ? (0, nls_1.localize)(19, null) : (0, nls_1.localize)(20, null)),
                showAdapterUnverifiedMessage: true
            };
        }
        if (breakpoint instanceof debugModel_1.$UFb) {
            if (!breakpoint.supported) {
                return {
                    icon: breakpointIcon.unverified,
                    message: (0, nls_1.localize)(21, null),
                };
            }
            return {
                icon: breakpointIcon.regular,
                message: breakpoint.message || (0, nls_1.localize)(22, null)
            };
        }
        if (breakpoint instanceof debugModel_1.$TFb) {
            if (!breakpoint.supported) {
                return {
                    icon: breakpointIcon.unverified,
                    message: (0, nls_1.localize)(23, null),
                };
            }
            const messages = [];
            messages.push(breakpoint.message || (0, nls_1.localize)(24, null));
            if (breakpoint.condition) {
                messages.push((0, nls_1.localize)(25, null, breakpoint.condition));
            }
            if (breakpoint.hitCondition) {
                messages.push((0, nls_1.localize)(26, null, breakpoint.hitCondition));
            }
            return {
                icon: breakpointIcon.regular,
                message: appendMessage(messages.join('\n'))
            };
        }
        if (breakpoint instanceof debugModel_1.$WFb) {
            if (!breakpoint.supported) {
                return {
                    icon: breakpointIcon.unverified,
                    message: (0, nls_1.localize)(27, null),
                };
            }
            const messages = [];
            if (breakpoint.message) {
                messages.push(breakpoint.message);
            }
            else if (breakpoint.instructionReference) {
                messages.push((0, nls_1.localize)(28, null, breakpoint.instructionReference));
            }
            else {
                messages.push((0, nls_1.localize)(29, null));
            }
            if (breakpoint.hitCondition) {
                messages.push((0, nls_1.localize)(30, null, breakpoint.hitCondition));
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
                    icon: icons.$7mb,
                    message: (0, nls_1.localize)(31, null),
                };
            }
            if (breakpoint.logMessage) {
                messages.push((0, nls_1.localize)(32, null, breakpoint.logMessage));
            }
            if (breakpoint.condition) {
                messages.push((0, nls_1.localize)(33, null, breakpoint.condition));
            }
            if (breakpoint.hitCondition) {
                messages.push((0, nls_1.localize)(34, null, breakpoint.hitCondition));
            }
            return {
                icon: breakpoint.logMessage ? icons.$5mb.regular : icons.$3mb.regular,
                message: appendMessage(messages.join('\n'))
            };
        }
        const message = ('message' in breakpoint && breakpoint.message) ? breakpoint.message : breakpoint instanceof debugModel_1.$SFb && labelService ? labelService.getUriLabel(breakpoint.uri) : (0, nls_1.localize)(35, null);
        return {
            icon: breakpointIcon.regular,
            message
        };
    }
    exports.$_Fb = $_Fb;
    (0, actions_2.$Xu)(class extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.debug.viewlet.action.addFunctionBreakpointAction',
                title: {
                    value: (0, nls_1.localize)(36, null),
                    original: 'Add Function Breakpoint',
                    mnemonicTitle: (0, nls_1.localize)(37, null)
                },
                f1: true,
                icon: icons.$vnb,
                menu: [{
                        id: actions_2.$Ru.ViewTitle,
                        group: 'navigation',
                        order: 10,
                        when: contextkey_1.$Ii.equals('view', debug_1.$oG)
                    }, {
                        id: actions_2.$Ru.MenubarNewBreakpointMenu,
                        group: '1_breakpoints',
                        order: 3,
                        when: debug_1.$ZG
                    }]
            });
        }
        run(accessor) {
            const debugService = accessor.get(debug_1.$nH);
            debugService.addFunctionBreakpoint();
        }
    });
    (0, actions_2.$Xu)(class extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.debug.viewlet.action.toggleBreakpointsActivatedAction',
                title: { value: (0, nls_1.localize)(38, null), original: 'Toggle Activate Breakpoints' },
                f1: true,
                icon: icons.$xnb,
                menu: {
                    id: actions_2.$Ru.ViewTitle,
                    group: 'navigation',
                    order: 20,
                    when: contextkey_1.$Ii.equals('view', debug_1.$oG)
                }
            });
        }
        run(accessor) {
            const debugService = accessor.get(debug_1.$nH);
            debugService.setBreakpointsActivated(!debugService.getModel().areBreakpointsActivated());
        }
    });
    (0, actions_2.$Xu)(class extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.debug.viewlet.action.removeBreakpoint',
                title: (0, nls_1.localize)(39, null),
                icon: codicons_1.$Pj.removeClose,
                menu: [{
                        id: actions_2.$Ru.DebugBreakpointsContext,
                        group: '3_modification',
                        order: 10,
                        when: debug_1.$OG.notEqualsTo('exceptionBreakpoint')
                    }, {
                        id: actions_2.$Ru.DebugBreakpointsContext,
                        group: 'inline',
                        order: 20,
                        when: debug_1.$OG.notEqualsTo('exceptionBreakpoint')
                    }]
            });
        }
        async run(accessor, breakpoint) {
            const debugService = accessor.get(debug_1.$nH);
            if (breakpoint instanceof debugModel_1.$SFb) {
                await debugService.removeBreakpoints(breakpoint.getId());
            }
            else if (breakpoint instanceof debugModel_1.$TFb) {
                await debugService.removeFunctionBreakpoints(breakpoint.getId());
            }
            else if (breakpoint instanceof debugModel_1.$UFb) {
                await debugService.removeDataBreakpoints(breakpoint.getId());
            }
            else if (breakpoint instanceof debugModel_1.$WFb) {
                await debugService.removeInstructionBreakpoints(breakpoint.instructionReference);
            }
        }
    });
    (0, actions_2.$Xu)(class extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.debug.viewlet.action.removeAllBreakpoints',
                title: {
                    original: 'Remove All Breakpoints',
                    value: (0, nls_1.localize)(40, null),
                    mnemonicTitle: (0, nls_1.localize)(41, null)
                },
                f1: true,
                icon: icons.$wnb,
                menu: [{
                        id: actions_2.$Ru.ViewTitle,
                        group: 'navigation',
                        order: 30,
                        when: contextkey_1.$Ii.equals('view', debug_1.$oG)
                    }, {
                        id: actions_2.$Ru.DebugBreakpointsContext,
                        group: '3_modification',
                        order: 20,
                        when: contextkey_1.$Ii.and(debug_1.$YG, debug_1.$OG.notEqualsTo('exceptionBreakpoint'))
                    }, {
                        id: actions_2.$Ru.MenubarDebugMenu,
                        group: '5_breakpoints',
                        order: 3,
                        when: debug_1.$ZG
                    }]
            });
        }
        run(accessor) {
            const debugService = accessor.get(debug_1.$nH);
            debugService.removeBreakpoints();
            debugService.removeFunctionBreakpoints();
            debugService.removeDataBreakpoints();
            debugService.removeInstructionBreakpoints();
        }
    });
    (0, actions_2.$Xu)(class extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.debug.viewlet.action.enableAllBreakpoints',
                title: {
                    original: 'Enable All Breakpoints',
                    value: (0, nls_1.localize)(42, null),
                    mnemonicTitle: (0, nls_1.localize)(43, null),
                },
                f1: true,
                precondition: debug_1.$ZG,
                menu: [{
                        id: actions_2.$Ru.DebugBreakpointsContext,
                        group: 'z_commands',
                        order: 10,
                        when: contextkey_1.$Ii.and(debug_1.$YG, debug_1.$OG.notEqualsTo('exceptionBreakpoint'))
                    }, {
                        id: actions_2.$Ru.MenubarDebugMenu,
                        group: '5_breakpoints',
                        order: 1,
                        when: debug_1.$ZG
                    }]
            });
        }
        async run(accessor) {
            const debugService = accessor.get(debug_1.$nH);
            await debugService.enableOrDisableBreakpoints(true);
        }
    });
    (0, actions_2.$Xu)(class extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.debug.viewlet.action.disableAllBreakpoints',
                title: {
                    original: 'Disable All Breakpoints',
                    value: (0, nls_1.localize)(44, null),
                    mnemonicTitle: (0, nls_1.localize)(45, null)
                },
                f1: true,
                precondition: debug_1.$ZG,
                menu: [{
                        id: actions_2.$Ru.DebugBreakpointsContext,
                        group: 'z_commands',
                        order: 20,
                        when: contextkey_1.$Ii.and(debug_1.$YG, debug_1.$OG.notEqualsTo('exceptionBreakpoint'))
                    }, {
                        id: actions_2.$Ru.MenubarDebugMenu,
                        group: '5_breakpoints',
                        order: 2,
                        when: debug_1.$ZG
                    }]
            });
        }
        async run(accessor) {
            const debugService = accessor.get(debug_1.$nH);
            await debugService.enableOrDisableBreakpoints(false);
        }
    });
    (0, actions_2.$Xu)(class extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.debug.viewlet.action.reapplyBreakpointsAction',
                title: { value: (0, nls_1.localize)(46, null), original: 'Reapply All Breakpoints' },
                f1: true,
                precondition: debug_1.$yG,
                menu: [{
                        id: actions_2.$Ru.DebugBreakpointsContext,
                        group: 'z_commands',
                        order: 30,
                        when: contextkey_1.$Ii.and(debug_1.$YG, debug_1.$OG.notEqualsTo('exceptionBreakpoint'))
                    }]
            });
        }
        async run(accessor) {
            const debugService = accessor.get(debug_1.$nH);
            await debugService.setBreakpointsActivated(true);
        }
    });
    (0, actions_2.$Xu)(class extends viewPane_1.$Keb {
        constructor() {
            super({
                id: 'debug.editBreakpoint',
                viewId: debug_1.$oG,
                title: (0, nls_1.localize)(47, null),
                icon: codicons_1.$Pj.edit,
                precondition: debug_1.$PG,
                menu: [{
                        id: actions_2.$Ru.DebugBreakpointsContext,
                        group: 'navigation',
                        order: 10
                    }, {
                        id: actions_2.$Ru.DebugBreakpointsContext,
                        group: 'inline',
                        order: 10
                    }]
            });
        }
        async runInView(accessor, view, breakpoint) {
            const debugService = accessor.get(debug_1.$nH);
            const editorService = accessor.get(editorService_1.$9C);
            if (breakpoint instanceof debugModel_1.$SFb) {
                const editor = await $$Fb(breakpoint, false, false, true, debugService, editorService);
                if (editor) {
                    const codeEditor = editor.getControl();
                    if ((0, editorBrowser_1.$iV)(codeEditor)) {
                        codeEditor.getContribution(debug_1.$iH)?.showBreakpointWidget(breakpoint.lineNumber, breakpoint.column);
                    }
                }
            }
            else if (breakpoint instanceof debugModel_1.$TFb) {
                const contextMenuService = accessor.get(contextView_1.$WZ);
                const actions = [new actions_1.$gi('breakpoint.editCondition', (0, nls_1.localize)(48, null), undefined, true, async () => view.renderInputBox({ breakpoint, type: 'condition' })),
                    new actions_1.$gi('breakpoint.editCondition', (0, nls_1.localize)(49, null), undefined, true, async () => view.renderInputBox({ breakpoint, type: 'hitCount' }))];
                const domNode = breakpointIdToActionBarDomeNode.get(breakpoint.getId());
                if (domNode) {
                    contextMenuService.showContextMenu({
                        getActions: () => actions,
                        getAnchor: () => domNode,
                        onHide: () => (0, lifecycle_1.$fc)(actions)
                    });
                }
            }
            else {
                view.renderInputBox({ breakpoint, type: 'condition' });
            }
        }
    });
    (0, actions_2.$Xu)(class extends viewPane_1.$Keb {
        constructor() {
            super({
                id: 'debug.editFunctionBreakpoint',
                viewId: debug_1.$oG,
                title: (0, nls_1.localize)(50, null),
                menu: [{
                        id: actions_2.$Ru.DebugBreakpointsContext,
                        group: '1_breakpoints',
                        order: 10,
                        when: debug_1.$OG.isEqualTo('functionBreakpoint')
                    }]
            });
        }
        runInView(_accessor, view, breakpoint) {
            view.renderInputBox({ breakpoint, type: 'name' });
        }
    });
    (0, actions_2.$Xu)(class extends viewPane_1.$Keb {
        constructor() {
            super({
                id: 'debug.editFunctionBreakpointHitCount',
                viewId: debug_1.$oG,
                title: (0, nls_1.localize)(51, null),
                precondition: debug_1.$PG,
                menu: [{
                        id: actions_2.$Ru.DebugBreakpointsContext,
                        group: 'navigation',
                        order: 20,
                        when: debug_1.$OG.isEqualTo('functionBreakpoint')
                    }]
            });
        }
        runInView(_accessor, view, breakpoint) {
            view.renderInputBox({ breakpoint, type: 'hitCount' });
        }
    });
});
//# sourceMappingURL=breakpointsView.js.map