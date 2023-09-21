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
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/path", "vs/base/common/uri", "vs/editor/browser/config/domFontInfo", "vs/editor/browser/editorBrowser", "vs/editor/common/config/fontInfo", "vs/editor/common/core/range", "vs/editor/common/core/stringBuilder", "vs/editor/common/services/resolverService", "vs/nls!vs/workbench/contrib/debug/browser/disassemblyView", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/list/browser/listService", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/contrib/debug/browser/callStackEditorContribution", "vs/workbench/contrib/debug/browser/debugIcons", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/contrib/debug/common/debugSource", "vs/workbench/contrib/debug/common/debugUtils", "vs/workbench/services/editor/common/editorService"], function (require, exports, browser_1, dom_1, arrays_1, event_1, lifecycle_1, path_1, uri_1, domFontInfo_1, editorBrowser_1, fontInfo_1, range_1, stringBuilder_1, resolverService_1, nls_1, configuration_1, contextkey_1, instantiation_1, listService_1, log_1, storage_1, telemetry_1, colorRegistry_1, themeService_1, uriIdentity_1, editorPane_1, callStackEditorContribution_1, icons, debug_1, debugModel_1, debugSource_1, debugUtils_1, editorService_1) {
    "use strict";
    var $7Fb_1, BreakpointRenderer_1, InstructionRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$8Fb = exports.$7Fb = void 0;
    // Special entry as a placeholer when disassembly is not available
    const disassemblyNotAvailable = {
        allowBreakpoint: false,
        isBreakpointSet: false,
        isBreakpointEnabled: false,
        instructionReference: '',
        instructionOffset: 0,
        instructionReferenceOffset: 0,
        address: 0n,
        instruction: {
            address: '-1',
            instruction: (0, nls_1.localize)(0, null)
        },
    };
    let $7Fb = class $7Fb extends editorPane_1.$0T {
        static { $7Fb_1 = this; }
        static { this.a = 50; }
        constructor(telemetryService, themeService, storageService, y, eb, fb) {
            super(debug_1.$pG, telemetryService, themeService, storageService);
            this.y = y;
            this.eb = eb;
            this.fb = fb;
            this.j = [];
            this.m = true;
            this.r = false;
            this.u = new Map();
            this.c = undefined;
            this.f = this.B(new event_1.$fd({ leakWarningThreshold: 1000 }));
            this.g = fb.state;
            this.b = fontInfo_1.$Rr.createFromRawSettings(y.getValue('editor'), browser_1.$WN.value);
            this.B(y.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('editor')) {
                    this.b = fontInfo_1.$Rr.createFromRawSettings(y.getValue('editor'), browser_1.$WN.value);
                }
                if (e.affectsConfiguration('debug')) {
                    // show/hide source code requires changing height which WorkbenchTable doesn't support dynamic height, thus force a total reload.
                    const newValue = this.y.getValue('debug').disassemblyView.showSourceCode;
                    if (this.m !== newValue) {
                        this.m = newValue;
                        // todo: trigger rerender
                    }
                    else {
                        this.c?.rerender();
                    }
                }
            }));
        }
        get fontInfo() { return this.b; }
        get currentInstructionAddresses() {
            return this.fb.getModel().getSessions(false).
                map(session => session.getAllThreads()).
                reduce((prev, curr) => prev.concat(curr), []).
                map(thread => thread.getTopStackFrame()).
                map(frame => frame?.instructionPointerReference).
                map(ref => ref ? this.getReferenceAddress(ref) : undefined);
        }
        // Instruction reference of the top stack frame of the focused stack
        get focusedCurrentInstructionReference() {
            return this.fb.getViewModel().focusedStackFrame?.thread.getTopStackFrame()?.instructionPointerReference;
        }
        get focusedCurrentInstructionAddress() {
            const ref = this.focusedCurrentInstructionReference;
            return ref ? this.getReferenceAddress(ref) : undefined;
        }
        get focusedInstructionReference() {
            return this.fb.getViewModel().focusedStackFrame?.instructionPointerReference;
        }
        get focusedInstructionAddress() {
            const ref = this.focusedInstructionReference;
            return ref ? this.getReferenceAddress(ref) : undefined;
        }
        get isSourceCodeRender() { return this.m; }
        get debugSession() {
            return this.fb.getViewModel().focusedSession;
        }
        get onDidChangeStackFrame() { return this.f.event; }
        get focusedAddressAndOffset() {
            const element = this.c?.getFocusedElements()[0];
            if (!element) {
                return undefined;
            }
            const reference = element.instructionReference;
            const offset = Number(element.address - this.getReferenceAddress(reference));
            return { reference, offset, address: element.address };
        }
        ab(parent) {
            this.m = this.y.getValue('debug').disassemblyView.showSourceCode;
            const lineHeight = this.fontInfo.lineHeight;
            const thisOM = this;
            const delegate = new class {
                constructor() {
                    this.headerRowHeight = 0; // No header
                }
                getHeight(row) {
                    if (thisOM.isSourceCodeRender && row.showSourceLocation && row.instruction.location?.path && row.instruction.line) {
                        // instruction line + source lines
                        if (row.instruction.endLine) {
                            return lineHeight * (row.instruction.endLine - row.instruction.line + 2);
                        }
                        else {
                            // source is only a single line.
                            return lineHeight * 2;
                        }
                    }
                    // just instruction line
                    return lineHeight;
                }
            };
            const instructionRenderer = this.B(this.eb.createInstance(InstructionRenderer, this));
            this.c = this.B(this.eb.createInstance(listService_1.$r4, 'DisassemblyView', parent, delegate, [
                {
                    label: '',
                    tooltip: '',
                    weight: 0,
                    minimumWidth: this.fontInfo.lineHeight,
                    maximumWidth: this.fontInfo.lineHeight,
                    templateId: BreakpointRenderer.TEMPLATE_ID,
                    project(row) { return row; }
                },
                {
                    label: (0, nls_1.localize)(1, null),
                    tooltip: '',
                    weight: 0.3,
                    templateId: InstructionRenderer.TEMPLATE_ID,
                    project(row) { return row; }
                },
            ], [
                this.eb.createInstance(BreakpointRenderer, this),
                instructionRenderer,
            ], {
                identityProvider: { getId: (e) => e.instruction.address },
                horizontalScrolling: false,
                overrideStyles: {
                    listBackground: colorRegistry_1.$ww
                },
                multipleSelectionSupport: false,
                setRowLineHeight: false,
                openOnSingleClick: false,
                accessibilityProvider: new AccessibilityProvider(),
                mouseSupport: false
            }));
            if (this.focusedInstructionReference) {
                this.ob(this.focusedInstructionReference, 0);
            }
            this.B(this.c.onDidScroll(e => {
                if (this.r) {
                    return;
                }
                if (e.oldScrollTop > e.scrollTop && e.scrollTop < e.height) {
                    this.r = true;
                    const prevTop = Math.floor(e.scrollTop / this.fontInfo.lineHeight);
                    this.ib($7Fb_1.a).then((loaded) => {
                        if (loaded > 0) {
                            this.c.reveal(prevTop + loaded, 0);
                        }
                        this.r = false;
                    });
                }
                else if (e.oldScrollTop < e.scrollTop && e.scrollTop + e.height > e.scrollHeight - e.height) {
                    this.r = true;
                    this.jb($7Fb_1.a).then(() => { this.r = false; });
                }
            }));
            this.B(this.fb.getViewModel().onDidFocusStackFrame(({ stackFrame }) => {
                if (this.c && stackFrame?.instructionPointerReference) {
                    this.goToInstructionAndOffset(stackFrame.instructionPointerReference, 0);
                }
                this.f.fire();
            }));
            // refresh breakpoints view
            this.B(this.fb.getModel().onDidChangeBreakpoints(bpEvent => {
                if (bpEvent && this.c) {
                    // draw viewable BP
                    let changed = false;
                    bpEvent.added?.forEach((bp) => {
                        if (bp instanceof debugModel_1.$WFb) {
                            const index = this.mb(bp.instructionReference, bp.offset);
                            if (index >= 0) {
                                this.c.row(index).isBreakpointSet = true;
                                this.c.row(index).isBreakpointEnabled = bp.enabled;
                                changed = true;
                            }
                        }
                    });
                    bpEvent.removed?.forEach((bp) => {
                        if (bp instanceof debugModel_1.$WFb) {
                            const index = this.mb(bp.instructionReference, bp.offset);
                            if (index >= 0) {
                                this.c.row(index).isBreakpointSet = false;
                                changed = true;
                            }
                        }
                    });
                    bpEvent.changed?.forEach((bp) => {
                        if (bp instanceof debugModel_1.$WFb) {
                            const index = this.mb(bp.instructionReference, bp.offset);
                            if (index >= 0) {
                                if (this.c.row(index).isBreakpointEnabled !== bp.enabled) {
                                    this.c.row(index).isBreakpointEnabled = bp.enabled;
                                    changed = true;
                                }
                            }
                        }
                    });
                    // get an updated list so that items beyond the current range would render when reached.
                    this.j = this.fb.getModel().getInstructionBreakpoints();
                    // breakpoints restored from a previous session can be based on memory
                    // references that may no longer exist in the current session. Request
                    // those instructions to be loaded so the BP can be displayed.
                    for (const bp of this.j) {
                        this.kb(bp.instructionReference);
                    }
                    if (changed) {
                        this.f.fire();
                    }
                }
            }));
            this.B(this.fb.onDidChangeState(e => {
                if ((e === 3 /* State.Running */ || e === 2 /* State.Stopped */) &&
                    (this.g !== 3 /* State.Running */ && this.g !== 2 /* State.Stopped */)) {
                    // Just started debugging, clear the view
                    this.pb();
                    this.m = this.y.getValue('debug').disassemblyView.showSourceCode;
                }
                this.g = e;
                this.f.fire();
            }));
        }
        layout(dimension) {
            this.c?.layout(dimension.height);
        }
        async goToInstructionAndOffset(instructionReference, offset, focus) {
            let addr = this.u.get(instructionReference);
            if (addr === undefined) {
                await this.lb(instructionReference, 0, -$7Fb_1.a, $7Fb_1.a);
                addr = this.u.get(instructionReference);
            }
            if (addr) {
                this.hb(addr + BigInt(offset), focus);
            }
        }
        /** Gets the address associated with the instruction reference. */
        getReferenceAddress(instructionReference) {
            return this.u.get(instructionReference);
        }
        /**
         * Go to the address provided. If no address is provided, reveal the address of the currently focused stack frame. Returns false if that address is not available.
         */
        hb(address, focus) {
            if (!this.c) {
                return false;
            }
            if (!address) {
                return false;
            }
            const index = this.nb(address);
            if (index >= 0) {
                this.c.reveal(index);
                if (focus) {
                    this.c.domFocus();
                    this.c.setFocus([index]);
                }
                return true;
            }
            return false;
        }
        async ib(instructionCount) {
            const first = this.c?.row(0);
            if (first) {
                return this.lb(first.instructionReference, first.instructionReferenceOffset, first.instructionOffset - instructionCount, instructionCount);
            }
            return 0;
        }
        async jb(instructionCount) {
            const last = this.c?.row(this.c?.length - 1);
            if (last) {
                return this.lb(last.instructionReference, last.instructionReferenceOffset, last.instructionOffset + 1, instructionCount);
            }
            return 0;
        }
        /**
         * Sets the memory reference address. We don't just loadDisassembledInstructions
         * for this, since we can't really deal with discontiguous ranges (we can't
         * detect _if_ a range is discontiguous since we don't know how much memory
         * comes between instructions.)
         */
        async kb(instructionReference) {
            if (this.u.has(instructionReference)) {
                return true;
            }
            const s = await this.debugSession?.disassemble(instructionReference, 0, 0, 1);
            if (s && s.length > 0) {
                try {
                    this.u.set(instructionReference, BigInt(s[0].address));
                    return true;
                }
                catch {
                    return false;
                }
            }
            return false;
        }
        /** Loads disasembled instructions. Returns the number of instructions that were loaded. */
        async lb(instructionReference, offset, instructionOffset, instructionCount) {
            const session = this.debugSession;
            const resultEntries = await session?.disassemble(instructionReference, offset, instructionOffset, instructionCount);
            // Ensure we always load the baseline instructions so we know what address the instructionReference refers to.
            if (!this.u.has(instructionReference) && instructionOffset !== 0) {
                await this.lb(instructionReference, 0, 0, $7Fb_1.a);
            }
            if (session && resultEntries && this.c) {
                const newEntries = [];
                let lastLocation;
                let lastLine;
                for (let i = 0; i < resultEntries.length; i++) {
                    const instruction = resultEntries[i];
                    const thisInstructionOffset = instructionOffset + i;
                    // Forward fill the missing location as detailed in the DAP spec.
                    if (instruction.location) {
                        lastLocation = instruction.location;
                        lastLine = undefined;
                    }
                    if (instruction.line) {
                        const currentLine = {
                            startLineNumber: instruction.line,
                            startColumn: instruction.column ?? 0,
                            endLineNumber: instruction.endLine ?? instruction.line,
                            endColumn: instruction.endColumn ?? 0,
                        };
                        // Add location only to the first unique range. This will give the appearance of grouping of instructions.
                        if (!range_1.$ks.equalsRange(currentLine, lastLine ?? null)) {
                            lastLine = currentLine;
                            instruction.location = lastLocation;
                        }
                    }
                    let address;
                    try {
                        address = BigInt(instruction.address);
                    }
                    catch {
                        console.error(`Could not parse disassembly address ${instruction.address} (in ${JSON.stringify(instruction)})`);
                        continue;
                    }
                    const entry = {
                        allowBreakpoint: true,
                        isBreakpointSet: false,
                        isBreakpointEnabled: false,
                        instructionReference,
                        instructionReferenceOffset: offset,
                        instructionOffset: thisInstructionOffset,
                        instruction,
                        address,
                    };
                    newEntries.push(entry);
                    // if we just loaded the first instruction for this reference, mark its address.
                    if (offset === 0 && thisInstructionOffset === 0) {
                        this.u.set(instructionReference, address);
                    }
                }
                if (newEntries.length === 0) {
                    return 0;
                }
                const refBaseAddress = this.u.get(instructionReference);
                const bps = this.j.map(p => {
                    const base = this.u.get(p.instructionReference);
                    if (!base) {
                        return undefined;
                    }
                    return {
                        enabled: p.enabled,
                        address: base + BigInt(p.offset || 0),
                    };
                });
                if (refBaseAddress !== undefined) {
                    for (const entry of newEntries) {
                        const bp = bps.find(p => p?.address === entry.address);
                        if (bp) {
                            entry.isBreakpointSet = true;
                            entry.isBreakpointEnabled = bp.enabled;
                        }
                    }
                }
                const da = this.c;
                if (da.length === 1 && this.c.row(0) === disassemblyNotAvailable) {
                    da.splice(0, 1);
                }
                const firstAddr = newEntries[0].address;
                const lastAddr = newEntries[newEntries.length - 1].address;
                const startN = (0, arrays_1.$vb)(da.length, i => Number(da.row(i).address - firstAddr));
                const start = startN < 0 ? ~startN : startN;
                const endN = (0, arrays_1.$vb)(da.length, i => Number(da.row(i).address - lastAddr));
                const end = endN < 0 ? ~endN : endN;
                const toDelete = end - start;
                // Go through everything we're about to add, and only show the source
                // location if it's different from the previous one, "grouping" instructions by line
                let lastLocated;
                for (let i = start - 1; i >= 0; i--) {
                    const { instruction } = da.row(i);
                    if (instruction.location && instruction.line !== undefined) {
                        lastLocated = instruction;
                        break;
                    }
                }
                const shouldShowLocation = (instruction) => instruction.line !== undefined && instruction.location !== undefined &&
                    (!lastLocated || !(0, debugUtils_1.$uF)(instruction.location, lastLocated.location) || instruction.line !== lastLocated.line);
                for (const entry of newEntries) {
                    if (shouldShowLocation(entry.instruction)) {
                        entry.showSourceLocation = true;
                        lastLocated = entry.instruction;
                    }
                }
                da.splice(start, toDelete, newEntries);
                return newEntries.length - toDelete;
            }
            return 0;
        }
        mb(instructionReference, offset) {
            const addr = this.u.get(instructionReference);
            if (addr === undefined) {
                return -1;
            }
            return this.nb(addr + BigInt(offset));
        }
        nb(address) {
            const disassembledInstructions = this.c;
            if (disassembledInstructions && disassembledInstructions.length > 0) {
                return (0, arrays_1.$vb)(disassembledInstructions.length, index => {
                    const row = disassembledInstructions.row(index);
                    return Number(row.address - address);
                });
            }
            return -1;
        }
        /**
         * Clears the table and reload instructions near the target address
         */
        ob(instructionReference, offset) {
            if (!this.c) {
                return;
            }
            this.r = true; // stop scrolling during the load.
            this.pb();
            this.j = this.fb.getModel().getInstructionBreakpoints();
            this.lb(instructionReference, offset, -$7Fb_1.a * 4, $7Fb_1.a * 8).then(() => {
                // on load, set the target instruction in the middle of the page.
                if (this.c.length > 0) {
                    const targetIndex = Math.floor(this.c.length / 2);
                    this.c.reveal(targetIndex, 0.5);
                    // Always focus the target address on reload, or arrow key navigation would look terrible
                    this.c.domFocus();
                    this.c.setFocus([targetIndex]);
                }
                this.r = false;
            });
        }
        pb() {
            this.u.clear();
            this.c?.splice(0, this.c.length, [disassemblyNotAvailable]);
        }
    };
    exports.$7Fb = $7Fb;
    exports.$7Fb = $7Fb = $7Fb_1 = __decorate([
        __param(0, telemetry_1.$9k),
        __param(1, themeService_1.$gv),
        __param(2, storage_1.$Vo),
        __param(3, configuration_1.$8h),
        __param(4, instantiation_1.$Ah),
        __param(5, debug_1.$nH)
    ], $7Fb);
    let BreakpointRenderer = class BreakpointRenderer {
        static { BreakpointRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'breakpoint'; }
        constructor(g, h) {
            this.g = g;
            this.h = h;
            this.templateId = BreakpointRenderer_1.TEMPLATE_ID;
            this.a = 'codicon-' + icons.$1mb.regular.id;
            this.b = 'codicon-' + icons.$1mb.disabled.id;
            this.c = 'codicon-' + icons.$6mb.id;
            this.d = 'codicon-' + icons.$9mb.id;
            this.f = 'codicon-' + icons.$0mb.id;
        }
        renderTemplate(container) {
            // align from the bottom so that it lines up with instruction when source code is present.
            container.style.alignSelf = 'flex-end';
            const icon = (0, dom_1.$0O)(container, (0, dom_1.$)('.disassembly-view'));
            icon.classList.add('codicon');
            icon.style.display = 'flex';
            icon.style.alignItems = 'center';
            icon.style.justifyContent = 'center';
            icon.style.height = this.g.fontInfo.lineHeight + 'px';
            const currentElement = { element: undefined };
            const disposables = [
                this.g.onDidChangeStackFrame(() => this.j(icon, currentElement.element)),
                (0, dom_1.$oO)(container, 'mouseover', () => {
                    if (currentElement.element?.allowBreakpoint) {
                        icon.classList.add(this.c);
                    }
                }),
                (0, dom_1.$oO)(container, 'mouseout', () => {
                    if (currentElement.element?.allowBreakpoint) {
                        icon.classList.remove(this.c);
                    }
                }),
                (0, dom_1.$oO)(container, 'click', () => {
                    if (currentElement.element?.allowBreakpoint) {
                        // click show hint while waiting for BP to resolve.
                        icon.classList.add(this.c);
                        const reference = currentElement.element.instructionReference;
                        const offset = Number(currentElement.element.address - this.g.getReferenceAddress(reference));
                        if (currentElement.element.isBreakpointSet) {
                            this.h.removeInstructionBreakpoints(reference, offset);
                        }
                        else if (currentElement.element.allowBreakpoint && !currentElement.element.isBreakpointSet) {
                            this.h.addInstructionBreakpoint(reference, offset, currentElement.element.address);
                        }
                    }
                })
            ];
            return { currentElement, icon, disposables };
        }
        renderElement(element, index, templateData, height) {
            templateData.currentElement.element = element;
            this.j(templateData.icon, element);
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.$fc)(templateData.disposables);
            templateData.disposables = [];
        }
        j(icon, element) {
            if (element?.address === this.g.focusedCurrentInstructionAddress) {
                icon.classList.add(this.d);
            }
            else if (element?.address === this.g.focusedInstructionAddress) {
                icon.classList.add(this.f);
            }
            else {
                icon.classList.remove(this.d);
                icon.classList.remove(this.f);
            }
            icon.classList.remove(this.c);
            if (element?.isBreakpointSet) {
                if (element.isBreakpointEnabled) {
                    icon.classList.add(this.a);
                    icon.classList.remove(this.b);
                }
                else {
                    icon.classList.remove(this.a);
                    icon.classList.add(this.b);
                }
            }
            else {
                icon.classList.remove(this.a);
                icon.classList.remove(this.b);
            }
        }
    };
    BreakpointRenderer = BreakpointRenderer_1 = __decorate([
        __param(1, debug_1.$nH)
    ], BreakpointRenderer);
    let InstructionRenderer = class InstructionRenderer extends lifecycle_1.$kc {
        static { InstructionRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'instruction'; }
        static { this.a = 25; }
        static { this.b = 30; }
        constructor(g, themeService, h, j, m, n) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.templateId = InstructionRenderer_1.TEMPLATE_ID;
            this.c = themeService.getColorTheme().getColor(callStackEditorContribution_1.$3Fb);
            this.f = themeService.getColorTheme().getColor(callStackEditorContribution_1.$4Fb);
            this.B(themeService.onDidColorThemeChange(e => {
                this.c = e.getColor(callStackEditorContribution_1.$3Fb);
                this.f = e.getColor(callStackEditorContribution_1.$4Fb);
            }));
        }
        renderTemplate(container) {
            const sourcecode = (0, dom_1.$0O)(container, (0, dom_1.$)('.sourcecode'));
            const instruction = (0, dom_1.$0O)(container, (0, dom_1.$)('.instruction'));
            this.y(sourcecode);
            this.y(instruction);
            const currentElement = { element: undefined };
            const cellDisposable = [];
            const disposables = [
                this.g.onDidChangeStackFrame(() => this.t(instruction, sourcecode, currentElement.element)),
                (0, dom_1.$oO)(sourcecode, 'dblclick', () => this.u(currentElement.element?.instruction)),
            ];
            return { currentElement, instruction, sourcecode, cellDisposable, disposables };
        }
        renderElement(element, index, templateData, height) {
            this.r(element, index, templateData, height);
        }
        async r(element, index, templateData, height) {
            templateData.currentElement.element = element;
            const instruction = element.instruction;
            templateData.sourcecode.innerText = '';
            const sb = new stringBuilder_1.$Es(1000);
            if (this.g.isSourceCodeRender && element.showSourceLocation && instruction.location?.path && instruction.line !== undefined) {
                const sourceURI = this.w(instruction);
                if (sourceURI) {
                    let textModel = undefined;
                    const sourceSB = new stringBuilder_1.$Es(10000);
                    const ref = await this.j.createModelReference(sourceURI);
                    textModel = ref.object.textEditorModel;
                    templateData.cellDisposable.push(ref);
                    // templateData could have moved on during async.  Double check if it is still the same source.
                    if (textModel && templateData.currentElement.element === element) {
                        let lineNumber = instruction.line;
                        while (lineNumber && lineNumber >= 1 && lineNumber <= textModel.getLineCount()) {
                            const lineContent = textModel.getLineContent(lineNumber);
                            sourceSB.appendString(`  ${lineNumber}: `);
                            sourceSB.appendString(lineContent + '\n');
                            if (instruction.endLine && lineNumber < instruction.endLine) {
                                lineNumber++;
                                continue;
                            }
                            break;
                        }
                        templateData.sourcecode.innerText = sourceSB.build();
                    }
                }
            }
            let spacesToAppend = 10;
            if (instruction.address !== '-1') {
                sb.appendString(instruction.address);
                if (instruction.address.length < InstructionRenderer_1.a) {
                    spacesToAppend = InstructionRenderer_1.a - instruction.address.length;
                }
                for (let i = 0; i < spacesToAppend; i++) {
                    sb.appendString(' ');
                }
            }
            if (instruction.instructionBytes) {
                sb.appendString(instruction.instructionBytes);
                spacesToAppend = 10;
                if (instruction.instructionBytes.length < InstructionRenderer_1.b) {
                    spacesToAppend = InstructionRenderer_1.b - instruction.instructionBytes.length;
                }
                for (let i = 0; i < spacesToAppend; i++) {
                    sb.appendString(' ');
                }
            }
            sb.appendString(instruction.instruction);
            templateData.instruction.innerText = sb.build();
            this.t(templateData.instruction, templateData.sourcecode, element);
        }
        disposeElement(element, index, templateData, height) {
            (0, lifecycle_1.$fc)(templateData.cellDisposable);
            templateData.cellDisposable = [];
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.$fc)(templateData.disposables);
            templateData.disposables = [];
        }
        t(instruction, sourceCode, element) {
            if (element && this.g.currentInstructionAddresses.includes(element.address)) {
                instruction.style.background = this.c?.toString() || 'transparent';
            }
            else if (element?.address === this.g.focusedInstructionAddress) {
                instruction.style.background = this.f?.toString() || 'transparent';
            }
            else {
                instruction.style.background = 'transparent';
            }
        }
        u(instruction) {
            if (instruction) {
                const sourceURI = this.w(instruction);
                const selection = instruction.endLine ? {
                    startLineNumber: instruction.line,
                    endLineNumber: instruction.endLine,
                    startColumn: instruction.column || 1,
                    endColumn: instruction.endColumn || 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */,
                } : {
                    startLineNumber: instruction.line,
                    endLineNumber: instruction.line,
                    startColumn: instruction.column || 1,
                    endColumn: instruction.endColumn || 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */,
                };
                this.h.openEditor({
                    resource: sourceURI,
                    description: (0, nls_1.localize)(2, null),
                    options: {
                        preserveFocus: false,
                        selection: selection,
                        revealIfOpened: true,
                        selectionRevealType: 1 /* TextEditorSelectionRevealType.CenterIfOutsideViewport */,
                        pinned: false,
                    }
                });
            }
        }
        w(instruction) {
            // Try to resolve path before consulting the debugSession.
            const path = instruction.location.path;
            if (path && (0, debugUtils_1.$pF)(path)) { // path looks like a uri
                return this.m.asCanonicalUri(uri_1.URI.parse(path));
            }
            // assume a filesystem path
            if (path && (0, path_1.$8d)(path)) {
                return this.m.asCanonicalUri(uri_1.URI.file(path));
            }
            return (0, debugSource_1.$xF)(instruction.location, instruction.location.path, this.g.debugSession.getId(), this.m, this.n);
        }
        y(element) {
            (0, domFontInfo_1.$vU)(element, this.g.fontInfo);
            element.style.whiteSpace = 'pre';
        }
    };
    InstructionRenderer = InstructionRenderer_1 = __decorate([
        __param(1, themeService_1.$gv),
        __param(2, editorService_1.$9C),
        __param(3, resolverService_1.$uA),
        __param(4, uriIdentity_1.$Ck),
        __param(5, log_1.$5i)
    ], InstructionRenderer);
    class AccessibilityProvider {
        getWidgetAriaLabel() {
            return (0, nls_1.localize)(3, null);
        }
        getAriaLabel(element) {
            let label = '';
            const instruction = element.instruction;
            if (instruction.address !== '-1') {
                label += `${(0, nls_1.localize)(4, null)}: ${instruction.address}`;
            }
            if (instruction.instructionBytes) {
                label += `, ${(0, nls_1.localize)(5, null)}: ${instruction.instructionBytes}`;
            }
            label += `, ${(0, nls_1.localize)(6, null)}: ${instruction.instruction}`;
            return label;
        }
    }
    let $8Fb = class $8Fb {
        constructor(editorService, debugService, contextKeyService) {
            contextKeyService.bufferChangeEvents(() => {
                this.c = debug_1.$eH.bindTo(contextKeyService);
            });
            const onDidActiveEditorChangeListener = () => {
                if (this.b) {
                    this.b.dispose();
                    this.b = undefined;
                }
                const activeTextEditorControl = editorService.activeTextEditorControl;
                if ((0, editorBrowser_1.$iV)(activeTextEditorControl)) {
                    const language = activeTextEditorControl.getModel()?.getLanguageId();
                    // TODO: instead of using idDebuggerInterestedInLanguage, have a specific ext point for languages
                    // support disassembly
                    this.c?.set(!!language && debugService.getAdapterManager().someDebuggerInterestedInLanguage(language));
                    this.b = activeTextEditorControl.onDidChangeModelLanguage(e => {
                        this.c?.set(debugService.getAdapterManager().someDebuggerInterestedInLanguage(e.newLanguage));
                    });
                }
                else {
                    this.c?.set(false);
                }
            };
            onDidActiveEditorChangeListener();
            this.a = editorService.onDidActiveEditorChange(onDidActiveEditorChangeListener);
        }
        dispose() {
            this.a.dispose();
            this.b?.dispose();
        }
    };
    exports.$8Fb = $8Fb;
    exports.$8Fb = $8Fb = __decorate([
        __param(0, editorService_1.$9C),
        __param(1, debug_1.$nH),
        __param(2, contextkey_1.$3i)
    ], $8Fb);
});
//# sourceMappingURL=disassemblyView.js.map