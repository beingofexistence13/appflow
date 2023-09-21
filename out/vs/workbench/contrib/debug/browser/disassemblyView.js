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
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/path", "vs/base/common/uri", "vs/editor/browser/config/domFontInfo", "vs/editor/browser/editorBrowser", "vs/editor/common/config/fontInfo", "vs/editor/common/core/range", "vs/editor/common/core/stringBuilder", "vs/editor/common/services/resolverService", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/list/browser/listService", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/contrib/debug/browser/callStackEditorContribution", "vs/workbench/contrib/debug/browser/debugIcons", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/contrib/debug/common/debugSource", "vs/workbench/contrib/debug/common/debugUtils", "vs/workbench/services/editor/common/editorService"], function (require, exports, browser_1, dom_1, arrays_1, event_1, lifecycle_1, path_1, uri_1, domFontInfo_1, editorBrowser_1, fontInfo_1, range_1, stringBuilder_1, resolverService_1, nls_1, configuration_1, contextkey_1, instantiation_1, listService_1, log_1, storage_1, telemetry_1, colorRegistry_1, themeService_1, uriIdentity_1, editorPane_1, callStackEditorContribution_1, icons, debug_1, debugModel_1, debugSource_1, debugUtils_1, editorService_1) {
    "use strict";
    var DisassemblyView_1, BreakpointRenderer_1, InstructionRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DisassemblyViewContribution = exports.DisassemblyView = void 0;
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
            instruction: (0, nls_1.localize)('instructionNotAvailable', "Disassembly not available.")
        },
    };
    let DisassemblyView = class DisassemblyView extends editorPane_1.EditorPane {
        static { DisassemblyView_1 = this; }
        static { this.NUM_INSTRUCTIONS_TO_LOAD = 50; }
        constructor(telemetryService, themeService, storageService, _configurationService, _instantiationService, _debugService) {
            super(debug_1.DISASSEMBLY_VIEW_ID, telemetryService, themeService, storageService);
            this._configurationService = _configurationService;
            this._instantiationService = _instantiationService;
            this._debugService = _debugService;
            this._instructionBpList = [];
            this._enableSourceCodeRender = true;
            this._loadingLock = false;
            this._referenceToMemoryAddress = new Map();
            this._disassembledInstructions = undefined;
            this._onDidChangeStackFrame = this._register(new event_1.Emitter({ leakWarningThreshold: 1000 }));
            this._previousDebuggingState = _debugService.state;
            this._fontInfo = fontInfo_1.BareFontInfo.createFromRawSettings(_configurationService.getValue('editor'), browser_1.PixelRatio.value);
            this._register(_configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('editor')) {
                    this._fontInfo = fontInfo_1.BareFontInfo.createFromRawSettings(_configurationService.getValue('editor'), browser_1.PixelRatio.value);
                }
                if (e.affectsConfiguration('debug')) {
                    // show/hide source code requires changing height which WorkbenchTable doesn't support dynamic height, thus force a total reload.
                    const newValue = this._configurationService.getValue('debug').disassemblyView.showSourceCode;
                    if (this._enableSourceCodeRender !== newValue) {
                        this._enableSourceCodeRender = newValue;
                        // todo: trigger rerender
                    }
                    else {
                        this._disassembledInstructions?.rerender();
                    }
                }
            }));
        }
        get fontInfo() { return this._fontInfo; }
        get currentInstructionAddresses() {
            return this._debugService.getModel().getSessions(false).
                map(session => session.getAllThreads()).
                reduce((prev, curr) => prev.concat(curr), []).
                map(thread => thread.getTopStackFrame()).
                map(frame => frame?.instructionPointerReference).
                map(ref => ref ? this.getReferenceAddress(ref) : undefined);
        }
        // Instruction reference of the top stack frame of the focused stack
        get focusedCurrentInstructionReference() {
            return this._debugService.getViewModel().focusedStackFrame?.thread.getTopStackFrame()?.instructionPointerReference;
        }
        get focusedCurrentInstructionAddress() {
            const ref = this.focusedCurrentInstructionReference;
            return ref ? this.getReferenceAddress(ref) : undefined;
        }
        get focusedInstructionReference() {
            return this._debugService.getViewModel().focusedStackFrame?.instructionPointerReference;
        }
        get focusedInstructionAddress() {
            const ref = this.focusedInstructionReference;
            return ref ? this.getReferenceAddress(ref) : undefined;
        }
        get isSourceCodeRender() { return this._enableSourceCodeRender; }
        get debugSession() {
            return this._debugService.getViewModel().focusedSession;
        }
        get onDidChangeStackFrame() { return this._onDidChangeStackFrame.event; }
        get focusedAddressAndOffset() {
            const element = this._disassembledInstructions?.getFocusedElements()[0];
            if (!element) {
                return undefined;
            }
            const reference = element.instructionReference;
            const offset = Number(element.address - this.getReferenceAddress(reference));
            return { reference, offset, address: element.address };
        }
        createEditor(parent) {
            this._enableSourceCodeRender = this._configurationService.getValue('debug').disassemblyView.showSourceCode;
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
            const instructionRenderer = this._register(this._instantiationService.createInstance(InstructionRenderer, this));
            this._disassembledInstructions = this._register(this._instantiationService.createInstance(listService_1.WorkbenchTable, 'DisassemblyView', parent, delegate, [
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
                    label: (0, nls_1.localize)('disassemblyTableColumnLabel', "instructions"),
                    tooltip: '',
                    weight: 0.3,
                    templateId: InstructionRenderer.TEMPLATE_ID,
                    project(row) { return row; }
                },
            ], [
                this._instantiationService.createInstance(BreakpointRenderer, this),
                instructionRenderer,
            ], {
                identityProvider: { getId: (e) => e.instruction.address },
                horizontalScrolling: false,
                overrideStyles: {
                    listBackground: colorRegistry_1.editorBackground
                },
                multipleSelectionSupport: false,
                setRowLineHeight: false,
                openOnSingleClick: false,
                accessibilityProvider: new AccessibilityProvider(),
                mouseSupport: false
            }));
            if (this.focusedInstructionReference) {
                this.reloadDisassembly(this.focusedInstructionReference, 0);
            }
            this._register(this._disassembledInstructions.onDidScroll(e => {
                if (this._loadingLock) {
                    return;
                }
                if (e.oldScrollTop > e.scrollTop && e.scrollTop < e.height) {
                    this._loadingLock = true;
                    const prevTop = Math.floor(e.scrollTop / this.fontInfo.lineHeight);
                    this.scrollUp_LoadDisassembledInstructions(DisassemblyView_1.NUM_INSTRUCTIONS_TO_LOAD).then((loaded) => {
                        if (loaded > 0) {
                            this._disassembledInstructions.reveal(prevTop + loaded, 0);
                        }
                        this._loadingLock = false;
                    });
                }
                else if (e.oldScrollTop < e.scrollTop && e.scrollTop + e.height > e.scrollHeight - e.height) {
                    this._loadingLock = true;
                    this.scrollDown_LoadDisassembledInstructions(DisassemblyView_1.NUM_INSTRUCTIONS_TO_LOAD).then(() => { this._loadingLock = false; });
                }
            }));
            this._register(this._debugService.getViewModel().onDidFocusStackFrame(({ stackFrame }) => {
                if (this._disassembledInstructions && stackFrame?.instructionPointerReference) {
                    this.goToInstructionAndOffset(stackFrame.instructionPointerReference, 0);
                }
                this._onDidChangeStackFrame.fire();
            }));
            // refresh breakpoints view
            this._register(this._debugService.getModel().onDidChangeBreakpoints(bpEvent => {
                if (bpEvent && this._disassembledInstructions) {
                    // draw viewable BP
                    let changed = false;
                    bpEvent.added?.forEach((bp) => {
                        if (bp instanceof debugModel_1.InstructionBreakpoint) {
                            const index = this.getIndexFromReferenceAndOffset(bp.instructionReference, bp.offset);
                            if (index >= 0) {
                                this._disassembledInstructions.row(index).isBreakpointSet = true;
                                this._disassembledInstructions.row(index).isBreakpointEnabled = bp.enabled;
                                changed = true;
                            }
                        }
                    });
                    bpEvent.removed?.forEach((bp) => {
                        if (bp instanceof debugModel_1.InstructionBreakpoint) {
                            const index = this.getIndexFromReferenceAndOffset(bp.instructionReference, bp.offset);
                            if (index >= 0) {
                                this._disassembledInstructions.row(index).isBreakpointSet = false;
                                changed = true;
                            }
                        }
                    });
                    bpEvent.changed?.forEach((bp) => {
                        if (bp instanceof debugModel_1.InstructionBreakpoint) {
                            const index = this.getIndexFromReferenceAndOffset(bp.instructionReference, bp.offset);
                            if (index >= 0) {
                                if (this._disassembledInstructions.row(index).isBreakpointEnabled !== bp.enabled) {
                                    this._disassembledInstructions.row(index).isBreakpointEnabled = bp.enabled;
                                    changed = true;
                                }
                            }
                        }
                    });
                    // get an updated list so that items beyond the current range would render when reached.
                    this._instructionBpList = this._debugService.getModel().getInstructionBreakpoints();
                    // breakpoints restored from a previous session can be based on memory
                    // references that may no longer exist in the current session. Request
                    // those instructions to be loaded so the BP can be displayed.
                    for (const bp of this._instructionBpList) {
                        this.primeMemoryReference(bp.instructionReference);
                    }
                    if (changed) {
                        this._onDidChangeStackFrame.fire();
                    }
                }
            }));
            this._register(this._debugService.onDidChangeState(e => {
                if ((e === 3 /* State.Running */ || e === 2 /* State.Stopped */) &&
                    (this._previousDebuggingState !== 3 /* State.Running */ && this._previousDebuggingState !== 2 /* State.Stopped */)) {
                    // Just started debugging, clear the view
                    this.clear();
                    this._enableSourceCodeRender = this._configurationService.getValue('debug').disassemblyView.showSourceCode;
                }
                this._previousDebuggingState = e;
                this._onDidChangeStackFrame.fire();
            }));
        }
        layout(dimension) {
            this._disassembledInstructions?.layout(dimension.height);
        }
        async goToInstructionAndOffset(instructionReference, offset, focus) {
            let addr = this._referenceToMemoryAddress.get(instructionReference);
            if (addr === undefined) {
                await this.loadDisassembledInstructions(instructionReference, 0, -DisassemblyView_1.NUM_INSTRUCTIONS_TO_LOAD, DisassemblyView_1.NUM_INSTRUCTIONS_TO_LOAD);
                addr = this._referenceToMemoryAddress.get(instructionReference);
            }
            if (addr) {
                this.goToAddress(addr + BigInt(offset), focus);
            }
        }
        /** Gets the address associated with the instruction reference. */
        getReferenceAddress(instructionReference) {
            return this._referenceToMemoryAddress.get(instructionReference);
        }
        /**
         * Go to the address provided. If no address is provided, reveal the address of the currently focused stack frame. Returns false if that address is not available.
         */
        goToAddress(address, focus) {
            if (!this._disassembledInstructions) {
                return false;
            }
            if (!address) {
                return false;
            }
            const index = this.getIndexFromAddress(address);
            if (index >= 0) {
                this._disassembledInstructions.reveal(index);
                if (focus) {
                    this._disassembledInstructions.domFocus();
                    this._disassembledInstructions.setFocus([index]);
                }
                return true;
            }
            return false;
        }
        async scrollUp_LoadDisassembledInstructions(instructionCount) {
            const first = this._disassembledInstructions?.row(0);
            if (first) {
                return this.loadDisassembledInstructions(first.instructionReference, first.instructionReferenceOffset, first.instructionOffset - instructionCount, instructionCount);
            }
            return 0;
        }
        async scrollDown_LoadDisassembledInstructions(instructionCount) {
            const last = this._disassembledInstructions?.row(this._disassembledInstructions?.length - 1);
            if (last) {
                return this.loadDisassembledInstructions(last.instructionReference, last.instructionReferenceOffset, last.instructionOffset + 1, instructionCount);
            }
            return 0;
        }
        /**
         * Sets the memory reference address. We don't just loadDisassembledInstructions
         * for this, since we can't really deal with discontiguous ranges (we can't
         * detect _if_ a range is discontiguous since we don't know how much memory
         * comes between instructions.)
         */
        async primeMemoryReference(instructionReference) {
            if (this._referenceToMemoryAddress.has(instructionReference)) {
                return true;
            }
            const s = await this.debugSession?.disassemble(instructionReference, 0, 0, 1);
            if (s && s.length > 0) {
                try {
                    this._referenceToMemoryAddress.set(instructionReference, BigInt(s[0].address));
                    return true;
                }
                catch {
                    return false;
                }
            }
            return false;
        }
        /** Loads disasembled instructions. Returns the number of instructions that were loaded. */
        async loadDisassembledInstructions(instructionReference, offset, instructionOffset, instructionCount) {
            const session = this.debugSession;
            const resultEntries = await session?.disassemble(instructionReference, offset, instructionOffset, instructionCount);
            // Ensure we always load the baseline instructions so we know what address the instructionReference refers to.
            if (!this._referenceToMemoryAddress.has(instructionReference) && instructionOffset !== 0) {
                await this.loadDisassembledInstructions(instructionReference, 0, 0, DisassemblyView_1.NUM_INSTRUCTIONS_TO_LOAD);
            }
            if (session && resultEntries && this._disassembledInstructions) {
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
                        if (!range_1.Range.equalsRange(currentLine, lastLine ?? null)) {
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
                        this._referenceToMemoryAddress.set(instructionReference, address);
                    }
                }
                if (newEntries.length === 0) {
                    return 0;
                }
                const refBaseAddress = this._referenceToMemoryAddress.get(instructionReference);
                const bps = this._instructionBpList.map(p => {
                    const base = this._referenceToMemoryAddress.get(p.instructionReference);
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
                const da = this._disassembledInstructions;
                if (da.length === 1 && this._disassembledInstructions.row(0) === disassemblyNotAvailable) {
                    da.splice(0, 1);
                }
                const firstAddr = newEntries[0].address;
                const lastAddr = newEntries[newEntries.length - 1].address;
                const startN = (0, arrays_1.binarySearch2)(da.length, i => Number(da.row(i).address - firstAddr));
                const start = startN < 0 ? ~startN : startN;
                const endN = (0, arrays_1.binarySearch2)(da.length, i => Number(da.row(i).address - lastAddr));
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
                    (!lastLocated || !(0, debugUtils_1.sourcesEqual)(instruction.location, lastLocated.location) || instruction.line !== lastLocated.line);
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
        getIndexFromReferenceAndOffset(instructionReference, offset) {
            const addr = this._referenceToMemoryAddress.get(instructionReference);
            if (addr === undefined) {
                return -1;
            }
            return this.getIndexFromAddress(addr + BigInt(offset));
        }
        getIndexFromAddress(address) {
            const disassembledInstructions = this._disassembledInstructions;
            if (disassembledInstructions && disassembledInstructions.length > 0) {
                return (0, arrays_1.binarySearch2)(disassembledInstructions.length, index => {
                    const row = disassembledInstructions.row(index);
                    return Number(row.address - address);
                });
            }
            return -1;
        }
        /**
         * Clears the table and reload instructions near the target address
         */
        reloadDisassembly(instructionReference, offset) {
            if (!this._disassembledInstructions) {
                return;
            }
            this._loadingLock = true; // stop scrolling during the load.
            this.clear();
            this._instructionBpList = this._debugService.getModel().getInstructionBreakpoints();
            this.loadDisassembledInstructions(instructionReference, offset, -DisassemblyView_1.NUM_INSTRUCTIONS_TO_LOAD * 4, DisassemblyView_1.NUM_INSTRUCTIONS_TO_LOAD * 8).then(() => {
                // on load, set the target instruction in the middle of the page.
                if (this._disassembledInstructions.length > 0) {
                    const targetIndex = Math.floor(this._disassembledInstructions.length / 2);
                    this._disassembledInstructions.reveal(targetIndex, 0.5);
                    // Always focus the target address on reload, or arrow key navigation would look terrible
                    this._disassembledInstructions.domFocus();
                    this._disassembledInstructions.setFocus([targetIndex]);
                }
                this._loadingLock = false;
            });
        }
        clear() {
            this._referenceToMemoryAddress.clear();
            this._disassembledInstructions?.splice(0, this._disassembledInstructions.length, [disassemblyNotAvailable]);
        }
    };
    exports.DisassemblyView = DisassemblyView;
    exports.DisassemblyView = DisassemblyView = DisassemblyView_1 = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, themeService_1.IThemeService),
        __param(2, storage_1.IStorageService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, debug_1.IDebugService)
    ], DisassemblyView);
    let BreakpointRenderer = class BreakpointRenderer {
        static { BreakpointRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'breakpoint'; }
        constructor(_disassemblyView, _debugService) {
            this._disassemblyView = _disassemblyView;
            this._debugService = _debugService;
            this.templateId = BreakpointRenderer_1.TEMPLATE_ID;
            this._breakpointIcon = 'codicon-' + icons.breakpoint.regular.id;
            this._breakpointDisabledIcon = 'codicon-' + icons.breakpoint.disabled.id;
            this._breakpointHintIcon = 'codicon-' + icons.debugBreakpointHint.id;
            this._debugStackframe = 'codicon-' + icons.debugStackframe.id;
            this._debugStackframeFocused = 'codicon-' + icons.debugStackframeFocused.id;
        }
        renderTemplate(container) {
            // align from the bottom so that it lines up with instruction when source code is present.
            container.style.alignSelf = 'flex-end';
            const icon = (0, dom_1.append)(container, (0, dom_1.$)('.disassembly-view'));
            icon.classList.add('codicon');
            icon.style.display = 'flex';
            icon.style.alignItems = 'center';
            icon.style.justifyContent = 'center';
            icon.style.height = this._disassemblyView.fontInfo.lineHeight + 'px';
            const currentElement = { element: undefined };
            const disposables = [
                this._disassemblyView.onDidChangeStackFrame(() => this.rerenderDebugStackframe(icon, currentElement.element)),
                (0, dom_1.addStandardDisposableListener)(container, 'mouseover', () => {
                    if (currentElement.element?.allowBreakpoint) {
                        icon.classList.add(this._breakpointHintIcon);
                    }
                }),
                (0, dom_1.addStandardDisposableListener)(container, 'mouseout', () => {
                    if (currentElement.element?.allowBreakpoint) {
                        icon.classList.remove(this._breakpointHintIcon);
                    }
                }),
                (0, dom_1.addStandardDisposableListener)(container, 'click', () => {
                    if (currentElement.element?.allowBreakpoint) {
                        // click show hint while waiting for BP to resolve.
                        icon.classList.add(this._breakpointHintIcon);
                        const reference = currentElement.element.instructionReference;
                        const offset = Number(currentElement.element.address - this._disassemblyView.getReferenceAddress(reference));
                        if (currentElement.element.isBreakpointSet) {
                            this._debugService.removeInstructionBreakpoints(reference, offset);
                        }
                        else if (currentElement.element.allowBreakpoint && !currentElement.element.isBreakpointSet) {
                            this._debugService.addInstructionBreakpoint(reference, offset, currentElement.element.address);
                        }
                    }
                })
            ];
            return { currentElement, icon, disposables };
        }
        renderElement(element, index, templateData, height) {
            templateData.currentElement.element = element;
            this.rerenderDebugStackframe(templateData.icon, element);
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.dispose)(templateData.disposables);
            templateData.disposables = [];
        }
        rerenderDebugStackframe(icon, element) {
            if (element?.address === this._disassemblyView.focusedCurrentInstructionAddress) {
                icon.classList.add(this._debugStackframe);
            }
            else if (element?.address === this._disassemblyView.focusedInstructionAddress) {
                icon.classList.add(this._debugStackframeFocused);
            }
            else {
                icon.classList.remove(this._debugStackframe);
                icon.classList.remove(this._debugStackframeFocused);
            }
            icon.classList.remove(this._breakpointHintIcon);
            if (element?.isBreakpointSet) {
                if (element.isBreakpointEnabled) {
                    icon.classList.add(this._breakpointIcon);
                    icon.classList.remove(this._breakpointDisabledIcon);
                }
                else {
                    icon.classList.remove(this._breakpointIcon);
                    icon.classList.add(this._breakpointDisabledIcon);
                }
            }
            else {
                icon.classList.remove(this._breakpointIcon);
                icon.classList.remove(this._breakpointDisabledIcon);
            }
        }
    };
    BreakpointRenderer = BreakpointRenderer_1 = __decorate([
        __param(1, debug_1.IDebugService)
    ], BreakpointRenderer);
    let InstructionRenderer = class InstructionRenderer extends lifecycle_1.Disposable {
        static { InstructionRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'instruction'; }
        static { this.INSTRUCTION_ADDR_MIN_LENGTH = 25; }
        static { this.INSTRUCTION_BYTES_MIN_LENGTH = 30; }
        constructor(_disassemblyView, themeService, editorService, textModelService, uriService, logService) {
            super();
            this._disassemblyView = _disassemblyView;
            this.editorService = editorService;
            this.textModelService = textModelService;
            this.uriService = uriService;
            this.logService = logService;
            this.templateId = InstructionRenderer_1.TEMPLATE_ID;
            this._topStackFrameColor = themeService.getColorTheme().getColor(callStackEditorContribution_1.topStackFrameColor);
            this._focusedStackFrameColor = themeService.getColorTheme().getColor(callStackEditorContribution_1.focusedStackFrameColor);
            this._register(themeService.onDidColorThemeChange(e => {
                this._topStackFrameColor = e.getColor(callStackEditorContribution_1.topStackFrameColor);
                this._focusedStackFrameColor = e.getColor(callStackEditorContribution_1.focusedStackFrameColor);
            }));
        }
        renderTemplate(container) {
            const sourcecode = (0, dom_1.append)(container, (0, dom_1.$)('.sourcecode'));
            const instruction = (0, dom_1.append)(container, (0, dom_1.$)('.instruction'));
            this.applyFontInfo(sourcecode);
            this.applyFontInfo(instruction);
            const currentElement = { element: undefined };
            const cellDisposable = [];
            const disposables = [
                this._disassemblyView.onDidChangeStackFrame(() => this.rerenderBackground(instruction, sourcecode, currentElement.element)),
                (0, dom_1.addStandardDisposableListener)(sourcecode, 'dblclick', () => this.openSourceCode(currentElement.element?.instruction)),
            ];
            return { currentElement, instruction, sourcecode, cellDisposable, disposables };
        }
        renderElement(element, index, templateData, height) {
            this.renderElementInner(element, index, templateData, height);
        }
        async renderElementInner(element, index, templateData, height) {
            templateData.currentElement.element = element;
            const instruction = element.instruction;
            templateData.sourcecode.innerText = '';
            const sb = new stringBuilder_1.StringBuilder(1000);
            if (this._disassemblyView.isSourceCodeRender && element.showSourceLocation && instruction.location?.path && instruction.line !== undefined) {
                const sourceURI = this.getUriFromSource(instruction);
                if (sourceURI) {
                    let textModel = undefined;
                    const sourceSB = new stringBuilder_1.StringBuilder(10000);
                    const ref = await this.textModelService.createModelReference(sourceURI);
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
                if (instruction.address.length < InstructionRenderer_1.INSTRUCTION_ADDR_MIN_LENGTH) {
                    spacesToAppend = InstructionRenderer_1.INSTRUCTION_ADDR_MIN_LENGTH - instruction.address.length;
                }
                for (let i = 0; i < spacesToAppend; i++) {
                    sb.appendString(' ');
                }
            }
            if (instruction.instructionBytes) {
                sb.appendString(instruction.instructionBytes);
                spacesToAppend = 10;
                if (instruction.instructionBytes.length < InstructionRenderer_1.INSTRUCTION_BYTES_MIN_LENGTH) {
                    spacesToAppend = InstructionRenderer_1.INSTRUCTION_BYTES_MIN_LENGTH - instruction.instructionBytes.length;
                }
                for (let i = 0; i < spacesToAppend; i++) {
                    sb.appendString(' ');
                }
            }
            sb.appendString(instruction.instruction);
            templateData.instruction.innerText = sb.build();
            this.rerenderBackground(templateData.instruction, templateData.sourcecode, element);
        }
        disposeElement(element, index, templateData, height) {
            (0, lifecycle_1.dispose)(templateData.cellDisposable);
            templateData.cellDisposable = [];
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.dispose)(templateData.disposables);
            templateData.disposables = [];
        }
        rerenderBackground(instruction, sourceCode, element) {
            if (element && this._disassemblyView.currentInstructionAddresses.includes(element.address)) {
                instruction.style.background = this._topStackFrameColor?.toString() || 'transparent';
            }
            else if (element?.address === this._disassemblyView.focusedInstructionAddress) {
                instruction.style.background = this._focusedStackFrameColor?.toString() || 'transparent';
            }
            else {
                instruction.style.background = 'transparent';
            }
        }
        openSourceCode(instruction) {
            if (instruction) {
                const sourceURI = this.getUriFromSource(instruction);
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
                this.editorService.openEditor({
                    resource: sourceURI,
                    description: (0, nls_1.localize)('editorOpenedFromDisassemblyDescription', "from disassembly"),
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
        getUriFromSource(instruction) {
            // Try to resolve path before consulting the debugSession.
            const path = instruction.location.path;
            if (path && (0, debugUtils_1.isUri)(path)) { // path looks like a uri
                return this.uriService.asCanonicalUri(uri_1.URI.parse(path));
            }
            // assume a filesystem path
            if (path && (0, path_1.isAbsolute)(path)) {
                return this.uriService.asCanonicalUri(uri_1.URI.file(path));
            }
            return (0, debugSource_1.getUriFromSource)(instruction.location, instruction.location.path, this._disassemblyView.debugSession.getId(), this.uriService, this.logService);
        }
        applyFontInfo(element) {
            (0, domFontInfo_1.applyFontInfo)(element, this._disassemblyView.fontInfo);
            element.style.whiteSpace = 'pre';
        }
    };
    InstructionRenderer = InstructionRenderer_1 = __decorate([
        __param(1, themeService_1.IThemeService),
        __param(2, editorService_1.IEditorService),
        __param(3, resolverService_1.ITextModelService),
        __param(4, uriIdentity_1.IUriIdentityService),
        __param(5, log_1.ILogService)
    ], InstructionRenderer);
    class AccessibilityProvider {
        getWidgetAriaLabel() {
            return (0, nls_1.localize)('disassemblyView', "Disassembly View");
        }
        getAriaLabel(element) {
            let label = '';
            const instruction = element.instruction;
            if (instruction.address !== '-1') {
                label += `${(0, nls_1.localize)('instructionAddress', "Address")}: ${instruction.address}`;
            }
            if (instruction.instructionBytes) {
                label += `, ${(0, nls_1.localize)('instructionBytes', "Bytes")}: ${instruction.instructionBytes}`;
            }
            label += `, ${(0, nls_1.localize)(`instructionText`, "Instruction")}: ${instruction.instruction}`;
            return label;
        }
    }
    let DisassemblyViewContribution = class DisassemblyViewContribution {
        constructor(editorService, debugService, contextKeyService) {
            contextKeyService.bufferChangeEvents(() => {
                this._languageSupportsDisassembleRequest = debug_1.CONTEXT_LANGUAGE_SUPPORTS_DISASSEMBLE_REQUEST.bindTo(contextKeyService);
            });
            const onDidActiveEditorChangeListener = () => {
                if (this._onDidChangeModelLanguage) {
                    this._onDidChangeModelLanguage.dispose();
                    this._onDidChangeModelLanguage = undefined;
                }
                const activeTextEditorControl = editorService.activeTextEditorControl;
                if ((0, editorBrowser_1.isCodeEditor)(activeTextEditorControl)) {
                    const language = activeTextEditorControl.getModel()?.getLanguageId();
                    // TODO: instead of using idDebuggerInterestedInLanguage, have a specific ext point for languages
                    // support disassembly
                    this._languageSupportsDisassembleRequest?.set(!!language && debugService.getAdapterManager().someDebuggerInterestedInLanguage(language));
                    this._onDidChangeModelLanguage = activeTextEditorControl.onDidChangeModelLanguage(e => {
                        this._languageSupportsDisassembleRequest?.set(debugService.getAdapterManager().someDebuggerInterestedInLanguage(e.newLanguage));
                    });
                }
                else {
                    this._languageSupportsDisassembleRequest?.set(false);
                }
            };
            onDidActiveEditorChangeListener();
            this._onDidActiveEditorChangeListener = editorService.onDidActiveEditorChange(onDidActiveEditorChangeListener);
        }
        dispose() {
            this._onDidActiveEditorChangeListener.dispose();
            this._onDidChangeModelLanguage?.dispose();
        }
    };
    exports.DisassemblyViewContribution = DisassemblyViewContribution;
    exports.DisassemblyViewContribution = DisassemblyViewContribution = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, debug_1.IDebugService),
        __param(2, contextkey_1.IContextKeyService)
    ], DisassemblyViewContribution);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzYXNzZW1ibHlWaWV3LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZGVidWcvYnJvd3Nlci9kaXNhc3NlbWJseVZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQTZEaEcsa0VBQWtFO0lBQ2xFLE1BQU0sdUJBQXVCLEdBQWtDO1FBQzlELGVBQWUsRUFBRSxLQUFLO1FBQ3RCLGVBQWUsRUFBRSxLQUFLO1FBQ3RCLG1CQUFtQixFQUFFLEtBQUs7UUFDMUIsb0JBQW9CLEVBQUUsRUFBRTtRQUN4QixpQkFBaUIsRUFBRSxDQUFDO1FBQ3BCLDBCQUEwQixFQUFFLENBQUM7UUFDN0IsT0FBTyxFQUFFLEVBQUU7UUFDWCxXQUFXLEVBQUU7WUFDWixPQUFPLEVBQUUsSUFBSTtZQUNiLFdBQVcsRUFBRSxJQUFBLGNBQVEsRUFBQyx5QkFBeUIsRUFBRSw0QkFBNEIsQ0FBQztTQUM5RTtLQUNELENBQUM7SUFFSyxJQUFNLGVBQWUsR0FBckIsTUFBTSxlQUFnQixTQUFRLHVCQUFVOztpQkFFdEIsNkJBQXdCLEdBQUcsRUFBRSxBQUFMLENBQU07UUFZdEQsWUFDb0IsZ0JBQW1DLEVBQ3ZDLFlBQTJCLEVBQ3pCLGNBQStCLEVBQ3pCLHFCQUE2RCxFQUM3RCxxQkFBNkQsRUFDckUsYUFBNkM7WUFFNUQsS0FBSyxDQUFDLDJCQUFtQixFQUFFLGdCQUFnQixFQUFFLFlBQVksRUFBRSxjQUFjLENBQUMsQ0FBQztZQUpuQywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBQzVDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFDcEQsa0JBQWEsR0FBYixhQUFhLENBQWU7WUFYckQsdUJBQWtCLEdBQXNDLEVBQUUsQ0FBQztZQUMzRCw0QkFBdUIsR0FBWSxJQUFJLENBQUM7WUFDeEMsaUJBQVksR0FBWSxLQUFLLENB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