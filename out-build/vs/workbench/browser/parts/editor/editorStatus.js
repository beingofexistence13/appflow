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
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/editor/editorStatus", "vs/base/browser/dom", "vs/base/common/strings", "vs/base/common/resources", "vs/base/common/types", "vs/base/common/uri", "vs/base/common/actions", "vs/base/common/platform", "vs/workbench/services/untitled/common/untitledTextEditorInput", "vs/workbench/common/editor", "vs/base/common/lifecycle", "vs/editor/contrib/linesOperations/browser/linesOperations", "vs/editor/contrib/indentation/browser/indentation", "vs/workbench/browser/parts/editor/binaryEditor", "vs/workbench/browser/parts/editor/binaryDiffEditor", "vs/workbench/services/editor/common/editorService", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/editor/common/languages/language", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/platform/commands/common/commands", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/services/textfile/common/encoding", "vs/editor/common/services/textResourceConfiguration", "vs/platform/configuration/common/configuration", "vs/base/common/objects", "vs/editor/browser/editorBrowser", "vs/base/common/network", "vs/workbench/services/preferences/common/preferences", "vs/platform/quickinput/common/quickInput", "vs/editor/common/services/getIconClasses", "vs/base/common/async", "vs/base/common/event", "vs/workbench/services/statusbar/browser/statusbar", "vs/platform/markers/common/markers", "vs/platform/telemetry/common/telemetry", "vs/workbench/common/editor/sideBySideEditorInput", "vs/workbench/services/languageDetection/common/languageDetectionWorkerService", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/common/actions", "vs/base/common/keyCodes", "vs/editor/browser/config/tabFocus", "vs/css!./media/editorstatus"], function (require, exports, nls_1, dom_1, strings_1, resources_1, types_1, uri_1, actions_1, platform_1, untitledTextEditorInput_1, editor_1, lifecycle_1, linesOperations_1, indentation_1, binaryEditor_1, binaryDiffEditor_1, editorService_1, files_1, instantiation_1, language_1, range_1, selection_1, commands_1, extensionManagement_1, textfiles_1, encoding_1, textResourceConfiguration_1, configuration_1, objects_1, editorBrowser_1, network_1, preferences_1, quickInput_1, getIconClasses_1, async_1, event_1, statusbar_1, markers_1, telemetry_1, sideBySideEditorInput_1, languageDetectionWorkerService_1, contextkey_1, actions_2, keyCodes_1, tabFocus_1) {
    "use strict";
    var $Mvb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Pvb = exports.$Ovb = exports.$Nvb = exports.$Mvb = exports.$Lvb = void 0;
    class SideBySideEditorEncodingSupport {
        constructor(c, d) {
            this.c = c;
            this.d = d;
        }
        getEncoding() {
            return this.c.getEncoding(); // always report from modified (right hand) side
        }
        async setEncoding(encoding, mode) {
            await async_1.Promises.settled([this.c, this.d].map(editor => editor.setEncoding(encoding, mode)));
        }
    }
    class SideBySideEditorLanguageSupport {
        constructor(c, d) {
            this.c = c;
            this.d = d;
        }
        setLanguageId(languageId, source) {
            [this.c, this.d].forEach(editor => editor.setLanguageId(languageId, source));
        }
    }
    function toEditorWithEncodingSupport(input) {
        // Untitled Text Editor
        if (input instanceof untitledTextEditorInput_1.$Bvb) {
            return input;
        }
        // Side by Side (diff) Editor
        if (input instanceof sideBySideEditorInput_1.$VC) {
            const primaryEncodingSupport = toEditorWithEncodingSupport(input.primary);
            const secondaryEncodingSupport = toEditorWithEncodingSupport(input.secondary);
            if (primaryEncodingSupport && secondaryEncodingSupport) {
                return new SideBySideEditorEncodingSupport(primaryEncodingSupport, secondaryEncodingSupport);
            }
            return primaryEncodingSupport;
        }
        // File or Resource Editor
        const encodingSupport = input;
        if ((0, types_1.$yf)(encodingSupport.setEncoding, encodingSupport.getEncoding)) {
            return encodingSupport;
        }
        // Unsupported for any other editor
        return null;
    }
    function toEditorWithLanguageSupport(input) {
        // Untitled Text Editor
        if (input instanceof untitledTextEditorInput_1.$Bvb) {
            return input;
        }
        // Side by Side (diff) Editor
        if (input instanceof sideBySideEditorInput_1.$VC) {
            const primaryLanguageSupport = toEditorWithLanguageSupport(input.primary);
            const secondaryLanguageSupport = toEditorWithLanguageSupport(input.secondary);
            if (primaryLanguageSupport && secondaryLanguageSupport) {
                return new SideBySideEditorLanguageSupport(primaryLanguageSupport, secondaryLanguageSupport);
            }
            return primaryLanguageSupport;
        }
        // File or Resource Editor
        const languageSupport = input;
        if (typeof languageSupport.setLanguageId === 'function') {
            return languageSupport;
        }
        // Unsupported for any other editor
        return null;
    }
    class StateChange {
        constructor() {
            this.indentation = false;
            this.selectionStatus = false;
            this.languageId = false;
            this.languageStatus = false;
            this.encoding = false;
            this.EOL = false;
            this.tabFocusMode = false;
            this.columnSelectionMode = false;
            this.metadata = false;
        }
        combine(other) {
            this.indentation = this.indentation || other.indentation;
            this.selectionStatus = this.selectionStatus || other.selectionStatus;
            this.languageId = this.languageId || other.languageId;
            this.languageStatus = this.languageStatus || other.languageStatus;
            this.encoding = this.encoding || other.encoding;
            this.EOL = this.EOL || other.EOL;
            this.tabFocusMode = this.tabFocusMode || other.tabFocusMode;
            this.columnSelectionMode = this.columnSelectionMode || other.columnSelectionMode;
            this.metadata = this.metadata || other.metadata;
        }
        hasChanges() {
            return this.indentation
                || this.selectionStatus
                || this.languageId
                || this.languageStatus
                || this.encoding
                || this.EOL
                || this.tabFocusMode
                || this.columnSelectionMode
                || this.metadata;
        }
    }
    class State {
        get selectionStatus() { return this.c; }
        get languageId() { return this.d; }
        get encoding() { return this.f; }
        get EOL() { return this.g; }
        get indentation() { return this.h; }
        get tabFocusMode() { return this.i; }
        get columnSelectionMode() { return this.j; }
        get metadata() { return this.l; }
        update(update) {
            const change = new StateChange();
            switch (update.type) {
                case 'selectionStatus':
                    if (this.c !== update.selectionStatus) {
                        this.c = update.selectionStatus;
                        change.selectionStatus = true;
                    }
                    break;
                case 'indentation':
                    if (this.h !== update.indentation) {
                        this.h = update.indentation;
                        change.indentation = true;
                    }
                    break;
                case 'languageId':
                    if (this.d !== update.languageId) {
                        this.d = update.languageId;
                        change.languageId = true;
                    }
                    break;
                case 'encoding':
                    if (this.f !== update.encoding) {
                        this.f = update.encoding;
                        change.encoding = true;
                    }
                    break;
                case 'EOL':
                    if (this.g !== update.EOL) {
                        this.g = update.EOL;
                        change.EOL = true;
                    }
                    break;
                case 'tabFocusMode':
                    if (this.i !== update.tabFocusMode) {
                        this.i = update.tabFocusMode;
                        change.tabFocusMode = true;
                    }
                    break;
                case 'columnSelectionMode':
                    if (this.j !== update.columnSelectionMode) {
                        this.j = update.columnSelectionMode;
                        change.columnSelectionMode = true;
                    }
                    break;
                case 'metadata':
                    if (this.l !== update.metadata) {
                        this.l = update.metadata;
                        change.metadata = true;
                    }
                    break;
            }
            return change;
        }
    }
    let TabFocusMode = class TabFocusMode extends lifecycle_1.$kc {
        constructor(f) {
            super();
            this.f = f;
            this.c = this.B(new event_1.$fd());
            this.onDidChange = this.c.event;
            this.g();
            const tabFocusModeConfig = f.getValue('editor.tabFocusMode') === true ? true : false;
            tabFocus_1.$CU.setTabFocusMode(tabFocusModeConfig);
            this.c.fire(tabFocusModeConfig);
        }
        g() {
            this.B(tabFocus_1.$CU.onDidChangeTabFocus(tabFocusMode => this.c.fire(tabFocusMode)));
            this.B(this.f.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('editor.tabFocusMode')) {
                    const tabFocusModeConfig = this.f.getValue('editor.tabFocusMode') === true ? true : false;
                    tabFocus_1.$CU.setTabFocusMode(tabFocusModeConfig);
                    this.c.fire(tabFocusModeConfig);
                }
            }));
        }
    };
    TabFocusMode = __decorate([
        __param(0, configuration_1.$8h)
    ], TabFocusMode);
    const nlsSingleSelectionRange = (0, nls_1.localize)(0, null);
    const nlsSingleSelection = (0, nls_1.localize)(1, null);
    const nlsMultiSelectionRange = (0, nls_1.localize)(2, null);
    const nlsMultiSelection = (0, nls_1.localize)(3, null);
    const nlsEOLLF = (0, nls_1.localize)(4, null);
    const nlsEOLCRLF = (0, nls_1.localize)(5, null);
    let $Lvb = class $Lvb extends lifecycle_1.$kc {
        constructor(D, F, G, H, I, J, L) {
            super();
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.L = L;
            this.c = this.B(new lifecycle_1.$lc());
            this.f = this.B(new lifecycle_1.$lc());
            this.g = this.B(new lifecycle_1.$lc());
            this.h = this.B(new lifecycle_1.$lc());
            this.j = this.B(new lifecycle_1.$lc());
            this.m = this.B(new lifecycle_1.$lc());
            this.n = this.B(new lifecycle_1.$lc());
            this.s = this.B(new lifecycle_1.$lc());
            this.t = this.B(this.J.createInstance(ShowCurrentMarkerInStatusbarContribution));
            this.u = new State();
            this.w = this.B(new lifecycle_1.$jc());
            this.y = this.B(new lifecycle_1.$lc());
            this.z = null;
            this.C = J.createInstance(TabFocusMode);
            this.N();
            this.M();
        }
        M() {
            this.B(this.D.onDidActiveEditorChange(() => this.cb()));
            this.B(this.H.untitled.onDidChangeEncoding(model => this.kb(model.resource)));
            this.B(this.H.files.onDidChangeEncoding(model => this.kb((model.resource))));
            this.B(event_1.Event.runAndSubscribe(this.C.onDidChange, (tabFocusMode) => {
                if (tabFocusMode !== undefined) {
                    this.lb(tabFocusMode);
                }
                else {
                    this.lb(this.L.getValue('editor.tabFocusMode'));
                }
            }));
        }
        N() {
            commands_1.$Gr.registerCommand({ id: 'changeEditorIndentation', handler: () => this.O() });
        }
        async O() {
            const activeTextEditorControl = (0, editorBrowser_1.$lV)(this.D.activeTextEditorControl);
            if (!activeTextEditorControl) {
                return this.F.pick([{ label: (0, nls_1.localize)(6, null) }]);
            }
            if (this.D.activeEditor?.isReadonly()) {
                return this.F.pick([{ label: (0, nls_1.localize)(7, null) }]);
            }
            const picks = [
                (0, types_1.$uf)(activeTextEditorControl.getAction(indentation_1.$b9.ID)),
                (0, types_1.$uf)(activeTextEditorControl.getAction(indentation_1.$a9.ID)),
                (0, types_1.$uf)(activeTextEditorControl.getAction(indentation_1.$c9.ID)),
                (0, types_1.$uf)(activeTextEditorControl.getAction(indentation_1.$d9.ID)),
                (0, types_1.$uf)(activeTextEditorControl.getAction(indentation_1.$08.ID)),
                (0, types_1.$uf)(activeTextEditorControl.getAction(indentation_1.$$8.ID)),
                (0, types_1.$uf)(activeTextEditorControl.getAction(linesOperations_1.$F9.ID))
            ].map((a) => {
                return {
                    id: a.id,
                    label: a.label,
                    detail: (platform_1.Language.isDefaultVariant() || a.label === a.alias) ? undefined : a.alias,
                    run: () => {
                        activeTextEditorControl.focus();
                        a.run();
                    }
                };
            });
            picks.splice(3, 0, { type: 'separator', label: (0, nls_1.localize)(8, null) });
            picks.unshift({ type: 'separator', label: (0, nls_1.localize)(9, null) });
            const action = await this.F.pick(picks, { placeHolder: (0, nls_1.localize)(10, null), matchOnDetail: true });
            return action?.run();
        }
        P(visible) {
            if (visible) {
                if (!this.c.value) {
                    const text = (0, nls_1.localize)(11, null);
                    this.c.value = this.I.addEntry({
                        name: (0, nls_1.localize)(12, null),
                        text,
                        ariaLabel: text,
                        tooltip: (0, nls_1.localize)(13, null),
                        command: 'editor.action.toggleTabFocusMode',
                        kind: 'prominent'
                    }, 'status.editor.tabFocusMode', 1 /* StatusbarAlignment.RIGHT */, 100.7);
                }
            }
            else {
                this.c.clear();
            }
        }
        Q(visible) {
            if (visible) {
                if (!this.f.value) {
                    const text = (0, nls_1.localize)(14, null);
                    this.f.value = this.I.addEntry({
                        name: (0, nls_1.localize)(15, null),
                        text,
                        ariaLabel: text,
                        tooltip: (0, nls_1.localize)(16, null),
                        command: 'editor.action.toggleColumnSelection',
                        kind: 'prominent'
                    }, 'status.editor.columnSelectionMode', 1 /* StatusbarAlignment.RIGHT */, 100.8);
                }
            }
            else {
                this.f.clear();
            }
        }
        R(text) {
            if (!text) {
                this.h.clear();
                return;
            }
            const props = {
                name: (0, nls_1.localize)(17, null),
                text,
                ariaLabel: text,
                tooltip: (0, nls_1.localize)(18, null),
                command: 'workbench.action.gotoLine'
            };
            this.Z(this.h, props, 'status.editor.selection', 1 /* StatusbarAlignment.RIGHT */, 100.5);
        }
        S(text) {
            if (!text) {
                this.g.clear();
                return;
            }
            const props = {
                name: (0, nls_1.localize)(19, null),
                text,
                ariaLabel: text,
                tooltip: (0, nls_1.localize)(20, null),
                command: 'changeEditorIndentation'
            };
            this.Z(this.g, props, 'status.editor.indentation', 1 /* StatusbarAlignment.RIGHT */, 100.4);
        }
        U(text) {
            if (!text) {
                this.j.clear();
                return;
            }
            const props = {
                name: (0, nls_1.localize)(21, null),
                text,
                ariaLabel: text,
                tooltip: (0, nls_1.localize)(22, null),
                command: 'workbench.action.editor.changeEncoding'
            };
            this.Z(this.j, props, 'status.editor.encoding', 1 /* StatusbarAlignment.RIGHT */, 100.3);
        }
        W(text) {
            if (!text) {
                this.m.clear();
                return;
            }
            const props = {
                name: (0, nls_1.localize)(23, null),
                text,
                ariaLabel: text,
                tooltip: (0, nls_1.localize)(24, null),
                command: 'workbench.action.editor.changeEOL'
            };
            this.Z(this.m, props, 'status.editor.eol', 1 /* StatusbarAlignment.RIGHT */, 100.2);
        }
        X(text) {
            if (!text) {
                this.n.clear();
                return;
            }
            const props = {
                name: (0, nls_1.localize)(25, null),
                text,
                ariaLabel: text,
                tooltip: (0, nls_1.localize)(26, null),
                command: 'workbench.action.editor.changeLanguageMode'
            };
            this.Z(this.n, props, 'status.editor.mode', 1 /* StatusbarAlignment.RIGHT */, 100.1);
        }
        Y(text) {
            if (!text) {
                this.s.clear();
                return;
            }
            const props = {
                name: (0, nls_1.localize)(27, null),
                text,
                ariaLabel: text,
                tooltip: (0, nls_1.localize)(28, null)
            };
            this.Z(this.s, props, 'status.editor.info', 1 /* StatusbarAlignment.RIGHT */, 100);
        }
        Z(element, props, id, alignment, priority) {
            if (!element.value) {
                element.value = this.I.addEntry(props, id, alignment, priority);
            }
            else {
                element.value.update(props);
            }
        }
        $(update) {
            const changed = this.u.update(update);
            if (!changed.hasChanges()) {
                return; // Nothing really changed
            }
            if (!this.z) {
                this.z = changed;
                this.y.value = (0, dom_1.$uO)(() => {
                    this.y.clear();
                    const toRender = this.z;
                    this.z = null;
                    if (toRender) {
                        this.ab(toRender);
                    }
                });
            }
            else {
                this.z.combine(changed);
            }
        }
        ab(changed) {
            this.P(!!this.u.tabFocusMode);
            this.Q(!!this.u.columnSelectionMode);
            this.S(this.u.indentation);
            this.R(this.u.selectionStatus);
            this.U(this.u.encoding);
            this.W(this.u.EOL ? this.u.EOL === '\r\n' ? nlsEOLCRLF : nlsEOLLF : undefined);
            this.X(this.u.languageId);
            this.Y(this.u.metadata);
        }
        bb(info) {
            if (!info || !info.selections) {
                return undefined;
            }
            if (info.selections.length === 1) {
                if (info.charactersSelected) {
                    return (0, strings_1.$ne)(nlsSingleSelectionRange, info.selections[0].positionLineNumber, info.selections[0].positionColumn, info.charactersSelected);
                }
                return (0, strings_1.$ne)(nlsSingleSelection, info.selections[0].positionLineNumber, info.selections[0].positionColumn);
            }
            if (info.charactersSelected) {
                return (0, strings_1.$ne)(nlsMultiSelectionRange, info.selections.length, info.charactersSelected);
            }
            if (info.selections.length > 0) {
                return (0, strings_1.$ne)(nlsMultiSelection, info.selections.length);
            }
            return undefined;
        }
        cb() {
            const activeInput = this.D.activeEditor;
            const activeEditorPane = this.D.activeEditorPane;
            const activeCodeEditor = activeEditorPane ? (0, editorBrowser_1.$lV)(activeEditorPane.getControl()) ?? undefined : undefined;
            // Update all states
            this.gb(activeCodeEditor);
            this.hb(activeCodeEditor);
            this.db(activeCodeEditor, activeInput);
            this.ib(activeCodeEditor);
            this.jb(activeEditorPane, activeCodeEditor);
            this.eb(activeCodeEditor);
            this.fb(activeEditorPane);
            this.t.update(activeCodeEditor);
            // Dispose old active editor listeners
            this.w.clear();
            // Attach new listeners to active editor
            if (activeEditorPane) {
                this.w.add(activeEditorPane.onDidChangeControl(() => {
                    // Since our editor status is mainly observing the
                    // active editor control, do a full update whenever
                    // the control changes.
                    this.cb();
                }));
            }
            // Attach new listeners to active code editor
            if (activeCodeEditor) {
                // Hook Listener for Configuration changes
                this.w.add(activeCodeEditor.onDidChangeConfiguration((event) => {
                    if (event.hasChanged(22 /* EditorOption.columnSelection */)) {
                        this.gb(activeCodeEditor);
                    }
                }));
                // Hook Listener for Selection changes
                this.w.add(event_1.Event.defer(activeCodeEditor.onDidChangeCursorPosition)(() => {
                    this.hb(activeCodeEditor);
                    this.t.update(activeCodeEditor);
                }));
                // Hook Listener for language changes
                this.w.add(activeCodeEditor.onDidChangeModelLanguage(() => {
                    this.db(activeCodeEditor, activeInput);
                }));
                // Hook Listener for content changes
                this.w.add(event_1.Event.accumulate(activeCodeEditor.onDidChangeModelContent)(e => {
                    this.ib(activeCodeEditor);
                    this.t.update(activeCodeEditor);
                    const selections = activeCodeEditor.getSelections();
                    if (selections) {
                        for (const inner of e) {
                            for (const change of inner.changes) {
                                if (selections.some(selection => range_1.$ks.areIntersecting(selection, change.range))) {
                                    this.hb(activeCodeEditor);
                                    break;
                                }
                            }
                        }
                    }
                }));
                // Hook Listener for content options changes
                this.w.add(activeCodeEditor.onDidChangeModelOptions(() => {
                    this.eb(activeCodeEditor);
                }));
            }
            // Handle binary editors
            else if (activeEditorPane instanceof binaryEditor_1.$Jvb || activeEditorPane instanceof binaryDiffEditor_1.$Kvb) {
                const binaryEditors = [];
                if (activeEditorPane instanceof binaryDiffEditor_1.$Kvb) {
                    const primary = activeEditorPane.getPrimaryEditorPane();
                    if (primary instanceof binaryEditor_1.$Jvb) {
                        binaryEditors.push(primary);
                    }
                    const secondary = activeEditorPane.getSecondaryEditorPane();
                    if (secondary instanceof binaryEditor_1.$Jvb) {
                        binaryEditors.push(secondary);
                    }
                }
                else {
                    binaryEditors.push(activeEditorPane);
                }
                for (const editor of binaryEditors) {
                    this.w.add(editor.onDidChangeMetadata(() => {
                        this.fb(activeEditorPane);
                    }));
                    this.w.add(editor.onDidOpenInPlace(() => {
                        this.cb();
                    }));
                }
            }
        }
        db(editorWidget, editorInput) {
            const info = { type: 'languageId', languageId: undefined };
            // We only support text based editors
            if (editorWidget && editorInput && toEditorWithLanguageSupport(editorInput)) {
                const textModel = editorWidget.getModel();
                if (textModel) {
                    const languageId = textModel.getLanguageId();
                    info.languageId = this.G.getLanguageName(languageId) ?? undefined;
                }
            }
            this.$(info);
        }
        eb(editorWidget) {
            const update = { type: 'indentation', indentation: undefined };
            if (editorWidget) {
                const model = editorWidget.getModel();
                if (model) {
                    const modelOpts = model.getOptions();
                    update.indentation = (modelOpts.insertSpaces
                        ? modelOpts.tabSize === modelOpts.indentSize
                            ? (0, nls_1.localize)(29, null, modelOpts.indentSize)
                            : (0, nls_1.localize)(30, null, modelOpts.indentSize, modelOpts.tabSize)
                        : (0, nls_1.localize)(31, null, modelOpts.tabSize));
                }
            }
            this.$(update);
        }
        fb(editor) {
            const update = { type: 'metadata', metadata: undefined };
            if (editor instanceof binaryEditor_1.$Jvb || editor instanceof binaryDiffEditor_1.$Kvb) {
                update.metadata = editor.getMetadata();
            }
            this.$(update);
        }
        gb(editorWidget) {
            const info = { type: 'columnSelectionMode', columnSelectionMode: false };
            if (editorWidget?.getOption(22 /* EditorOption.columnSelection */)) {
                info.columnSelectionMode = true;
            }
            this.$(info);
        }
        hb(editorWidget) {
            const info = Object.create(null);
            // We only support text based editors
            if (editorWidget) {
                // Compute selection(s)
                info.selections = editorWidget.getSelections() || [];
                // Compute selection length
                info.charactersSelected = 0;
                const textModel = editorWidget.getModel();
                if (textModel) {
                    for (const selection of info.selections) {
                        if (typeof info.charactersSelected !== 'number') {
                            info.charactersSelected = 0;
                        }
                        info.charactersSelected += textModel.getCharacterCountInRange(selection);
                    }
                }
                // Compute the visible column for one selection. This will properly handle tabs and their configured widths
                if (info.selections.length === 1) {
                    const editorPosition = editorWidget.getPosition();
                    const selectionClone = new selection_1.$ms(info.selections[0].selectionStartLineNumber, info.selections[0].selectionStartColumn, info.selections[0].positionLineNumber, editorPosition ? editorWidget.getStatusbarColumn(editorPosition) : info.selections[0].positionColumn);
                    info.selections[0] = selectionClone;
                }
            }
            this.$({ type: 'selectionStatus', selectionStatus: this.bb(info) });
        }
        ib(editorWidget) {
            const info = { type: 'EOL', EOL: undefined };
            if (editorWidget && !editorWidget.getOption(90 /* EditorOption.readOnly */)) {
                const codeEditorModel = editorWidget.getModel();
                if (codeEditorModel) {
                    info.EOL = codeEditorModel.getEOL();
                }
            }
            this.$(info);
        }
        jb(editor, editorWidget) {
            if (editor && !this.mb(editor)) {
                return;
            }
            const info = { type: 'encoding', encoding: undefined };
            // We only support text based editors that have a model associated
            // This ensures we do not show the encoding picker while an editor
            // is still loading.
            if (editor && editorWidget?.hasModel()) {
                const encodingSupport = editor.input ? toEditorWithEncodingSupport(editor.input) : null;
                if (encodingSupport) {
                    const rawEncoding = encodingSupport.getEncoding();
                    const encodingInfo = typeof rawEncoding === 'string' ? encoding_1.$rD[rawEncoding] : undefined;
                    if (encodingInfo) {
                        info.encoding = encodingInfo.labelShort; // if we have a label, take it from there
                    }
                    else {
                        info.encoding = rawEncoding; // otherwise use it raw
                    }
                }
            }
            this.$(info);
        }
        kb(resource) {
            const activeEditorPane = this.D.activeEditorPane;
            if (activeEditorPane) {
                const activeResource = editor_1.$3E.getCanonicalUri(activeEditorPane.input, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
                if (activeResource && (0, resources_1.$bg)(activeResource, resource)) {
                    const activeCodeEditor = (0, editorBrowser_1.$lV)(activeEditorPane.getControl()) ?? undefined;
                    return this.jb(activeEditorPane, activeCodeEditor); // only update if the encoding changed for the active resource
                }
            }
        }
        lb(tabFocusMode) {
            const info = { type: 'tabFocusMode', tabFocusMode };
            this.$(info);
        }
        mb(control) {
            const activeEditorPane = this.D.activeEditorPane;
            return !!activeEditorPane && activeEditorPane === control;
        }
    };
    exports.$Lvb = $Lvb;
    exports.$Lvb = $Lvb = __decorate([
        __param(0, editorService_1.$9C),
        __param(1, quickInput_1.$Gq),
        __param(2, language_1.$ct),
        __param(3, textfiles_1.$JD),
        __param(4, statusbar_1.$6$),
        __param(5, instantiation_1.$Ah),
        __param(6, configuration_1.$8h)
    ], $Lvb);
    let ShowCurrentMarkerInStatusbarContribution = class ShowCurrentMarkerInStatusbarContribution extends lifecycle_1.$kc {
        constructor(j, m, n) {
            super();
            this.j = j;
            this.m = m;
            this.n = n;
            this.f = undefined;
            this.g = [];
            this.h = null;
            this.c = this.B(new lifecycle_1.$lc());
            this.B(m.onMarkerChanged(changedResources => this.y(changedResources)));
            this.B(event_1.Event.filter(n.onDidChangeConfiguration, e => e.affectsConfiguration('problems.showCurrentInStatus'))(() => this.s()));
        }
        update(editor) {
            this.f = editor;
            this.z();
            this.s();
        }
        s() {
            const previousMarker = this.h;
            this.h = this.w();
            if (this.t(previousMarker, this.h)) {
                if (this.h) {
                    const line = (0, strings_1.$Ae)(this.h.message)[0];
                    const text = `${this.u(this.h)} ${line}`;
                    if (!this.c.value) {
                        this.c.value = this.j.addEntry({ name: (0, nls_1.localize)(32, null), text: '', ariaLabel: '' }, 'statusbar.currentProblem', 0 /* StatusbarAlignment.LEFT */);
                    }
                    this.c.value.update({ name: (0, nls_1.localize)(33, null), text, ariaLabel: text });
                }
                else {
                    this.c.clear();
                }
            }
        }
        t(previousMarker, currentMarker) {
            if (!currentMarker) {
                return true;
            }
            if (!previousMarker) {
                return true;
            }
            return markers_1.IMarkerData.makeKey(previousMarker) !== markers_1.IMarkerData.makeKey(currentMarker);
        }
        u(marker) {
            switch (marker.severity) {
                case markers_1.MarkerSeverity.Error: return '$(error)';
                case markers_1.MarkerSeverity.Warning: return '$(warning)';
                case markers_1.MarkerSeverity.Info: return '$(info)';
            }
            return '';
        }
        w() {
            if (!this.n.getValue('problems.showCurrentInStatus')) {
                return null;
            }
            if (!this.f) {
                return null;
            }
            const model = this.f.getModel();
            if (!model) {
                return null;
            }
            const position = this.f.getPosition();
            if (!position) {
                return null;
            }
            return this.g.find(marker => range_1.$ks.containsPosition(marker, position)) || null;
        }
        y(changedResources) {
            if (!this.f) {
                return;
            }
            const model = this.f.getModel();
            if (!model) {
                return;
            }
            if (model && !changedResources.some(r => (0, resources_1.$bg)(model.uri, r))) {
                return;
            }
            this.z();
        }
        z() {
            if (!this.f) {
                return;
            }
            const model = this.f.getModel();
            if (!model) {
                return;
            }
            if (model) {
                this.g = this.m.read({
                    resource: model.uri,
                    severities: markers_1.MarkerSeverity.Error | markers_1.MarkerSeverity.Warning | markers_1.MarkerSeverity.Info
                });
                this.g.sort(compareMarker);
            }
            else {
                this.g = [];
            }
            this.s();
        }
    };
    ShowCurrentMarkerInStatusbarContribution = __decorate([
        __param(0, statusbar_1.$6$),
        __param(1, markers_1.$3s),
        __param(2, configuration_1.$8h)
    ], ShowCurrentMarkerInStatusbarContribution);
    function compareMarker(a, b) {
        let res = (0, strings_1.$Fe)(a.resource.toString(), b.resource.toString());
        if (res === 0) {
            res = markers_1.MarkerSeverity.compare(a.severity, b.severity);
        }
        if (res === 0) {
            res = range_1.$ks.compareRangesUsingStarts(a, b);
        }
        return res;
    }
    let $Mvb = class $Mvb extends actions_1.$gi {
        static { $Mvb_1 = this; }
        static { this.ID = 'workbench.action.showLanguageExtensions'; }
        constructor(c, f, galleryService) {
            super($Mvb_1.ID, (0, nls_1.localize)(34, null, c));
            this.c = c;
            this.f = f;
            this.enabled = galleryService.isEnabled();
        }
        async run() {
            await this.f.executeCommand('workbench.extensions.action.showExtensionsForLanguage', this.c);
        }
    };
    exports.$Mvb = $Mvb;
    exports.$Mvb = $Mvb = $Mvb_1 = __decorate([
        __param(1, commands_1.$Fr),
        __param(2, extensionManagement_1.$Zn)
    ], $Mvb);
    class $Nvb extends actions_2.$Wu {
        static { this.ID = 'workbench.action.editor.changeLanguageMode'; }
        constructor() {
            super({
                id: $Nvb.ID,
                title: { value: (0, nls_1.localize)(35, null), original: 'Change Language Mode' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 43 /* KeyCode.KeyM */)
                },
                precondition: contextkey_1.$Ii.not('notebookEditorFocused')
            });
        }
        async run(accessor) {
            const quickInputService = accessor.get(quickInput_1.$Gq);
            const editorService = accessor.get(editorService_1.$9C);
            const languageService = accessor.get(language_1.$ct);
            const languageDetectionService = accessor.get(languageDetectionWorkerService_1.$zA);
            const textFileService = accessor.get(textfiles_1.$JD);
            const preferencesService = accessor.get(preferences_1.$BE);
            const instantiationService = accessor.get(instantiation_1.$Ah);
            const configurationService = accessor.get(configuration_1.$8h);
            const telemetryService = accessor.get(telemetry_1.$9k);
            const activeTextEditorControl = (0, editorBrowser_1.$lV)(editorService.activeTextEditorControl);
            if (!activeTextEditorControl) {
                await quickInputService.pick([{ label: (0, nls_1.localize)(36, null) }]);
                return;
            }
            const textModel = activeTextEditorControl.getModel();
            const resource = editor_1.$3E.getOriginalUri(editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            // Compute language
            let currentLanguageName;
            let currentLanguageId;
            if (textModel) {
                currentLanguageId = textModel.getLanguageId();
                currentLanguageName = languageService.getLanguageName(currentLanguageId) ?? undefined;
            }
            let hasLanguageSupport = !!resource;
            if (resource?.scheme === network_1.Schemas.untitled && !textFileService.untitled.get(resource)?.hasAssociatedFilePath) {
                hasLanguageSupport = false; // no configuration for untitled resources (e.g. "Untitled-1")
            }
            // All languages are valid picks
            const languages = languageService.getSortedRegisteredLanguageNames();
            const picks = languages
                .map(({ languageName, languageId }) => {
                const extensions = languageService.getExtensions(languageId).join(' ');
                let description;
                if (currentLanguageName === languageName) {
                    description = (0, nls_1.localize)(37, null, languageId);
                }
                else {
                    description = (0, nls_1.localize)(38, null, languageId);
                }
                return {
                    label: languageName,
                    meta: extensions,
                    iconClasses: (0, getIconClasses_1.$y6)(languageId),
                    description
                };
            });
            picks.unshift({ type: 'separator', label: (0, nls_1.localize)(39, null) });
            // Offer action to configure via settings
            let configureLanguageAssociations;
            let configureLanguageSettings;
            let galleryAction;
            if (hasLanguageSupport && resource) {
                const ext = (0, resources_1.$gg)(resource) || (0, resources_1.$fg)(resource);
                galleryAction = instantiationService.createInstance($Mvb, ext);
                if (galleryAction.enabled) {
                    picks.unshift(galleryAction);
                }
                configureLanguageSettings = { label: (0, nls_1.localize)(40, null, currentLanguageName) };
                picks.unshift(configureLanguageSettings);
                configureLanguageAssociations = { label: (0, nls_1.localize)(41, null, ext) };
                picks.unshift(configureLanguageAssociations);
            }
            // Offer to "Auto Detect"
            const autoDetectLanguage = {
                label: (0, nls_1.localize)(42, null)
            };
            picks.unshift(autoDetectLanguage);
            const pick = await quickInputService.pick(picks, { placeHolder: (0, nls_1.localize)(43, null), matchOnDescription: true });
            if (!pick) {
                return;
            }
            if (pick === galleryAction) {
                galleryAction.run();
                return;
            }
            // User decided to permanently configure associations, return right after
            if (pick === configureLanguageAssociations) {
                if (resource) {
                    this.c(resource, languageService, quickInputService, configurationService);
                }
                return;
            }
            // User decided to configure settings for current language
            if (pick === configureLanguageSettings) {
                preferencesService.openUserSettings({ jsonEditor: true, revealSetting: { key: `[${currentLanguageId ?? null}]`, edit: true } });
                return;
            }
            // Change language for active editor
            const activeEditor = editorService.activeEditor;
            if (activeEditor) {
                const languageSupport = toEditorWithLanguageSupport(activeEditor);
                if (languageSupport) {
                    // Find language
                    let languageSelection;
                    let detectedLanguage;
                    if (pick === autoDetectLanguage) {
                        if (textModel) {
                            const resource = editor_1.$3E.getOriginalUri(activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
                            if (resource) {
                                // Detect languages since we are in an untitled file
                                let languageId = languageService.guessLanguageIdByFilepathOrFirstLine(resource, textModel.getLineContent(1)) ?? undefined;
                                if (!languageId || languageId === 'unknown') {
                                    detectedLanguage = await languageDetectionService.detectLanguage(resource);
                                    languageId = detectedLanguage;
                                }
                                if (languageId) {
                                    languageSelection = languageService.createById(languageId);
                                }
                            }
                        }
                    }
                    else {
                        const languageId = languageService.getLanguageIdByLanguageName(pick.label);
                        languageSelection = languageService.createById(languageId);
                        if (resource) {
                            // fire and forget to not slow things down
                            languageDetectionService.detectLanguage(resource).then(detectedLanguageId => {
                                const chosenLanguageId = languageService.getLanguageIdByLanguageName(pick.label) || 'unknown';
                                if (detectedLanguageId === currentLanguageId && currentLanguageId !== chosenLanguageId) {
                                    // If they didn't choose the detected language (which should also be the active language if automatic detection is enabled)
                                    // then the automatic language detection was likely wrong and the user is correcting it. In this case, we want telemetry.
                                    // Keep track of what model was preferred and length of input to help track down potential differences between the result quality across models and content size.
                                    const modelPreference = configurationService.getValue('workbench.editor.preferHistoryBasedLanguageDetection') ? 'history' : 'classic';
                                    telemetryService.publicLog2(languageDetectionWorkerService_1.$BA, {
                                        currentLanguageId: currentLanguageName ?? 'unknown',
                                        nextLanguageId: pick.label,
                                        lineCount: textModel?.getLineCount() ?? -1,
                                        modelPreference,
                                    });
                                }
                            });
                        }
                    }
                    // Change language
                    if (typeof languageSelection !== 'undefined') {
                        languageSupport.setLanguageId(languageSelection.languageId, $Nvb.ID);
                        if (resource?.scheme === network_1.Schemas.untitled) {
                            const modelPreference = configurationService.getValue('workbench.editor.preferHistoryBasedLanguageDetection') ? 'history' : 'classic';
                            telemetryService.publicLog2('setUntitledDocumentLanguage', {
                                to: languageSelection.languageId,
                                from: currentLanguageId ?? 'none',
                                modelPreference,
                            });
                        }
                    }
                }
                activeTextEditorControl.focus();
            }
        }
        c(resource, languageService, quickInputService, configurationService) {
            const extension = (0, resources_1.$gg)(resource);
            const base = (0, resources_1.$fg)(resource);
            const currentAssociation = languageService.guessLanguageIdByFilepathOrFirstLine(uri_1.URI.file(base));
            const languages = languageService.getSortedRegisteredLanguageNames();
            const picks = languages.map(({ languageName, languageId }) => {
                return {
                    id: languageId,
                    label: languageName,
                    iconClasses: (0, getIconClasses_1.$y6)(languageId),
                    description: (languageId === currentAssociation) ? (0, nls_1.localize)(44, null) : undefined
                };
            });
            setTimeout(async () => {
                const language = await quickInputService.pick(picks, { placeHolder: (0, nls_1.localize)(45, null, extension || base) });
                if (language) {
                    const fileAssociationsConfig = configurationService.inspect(files_1.$sk);
                    let associationKey;
                    if (extension && base[0] !== '.') {
                        associationKey = `*${extension}`; // only use "*.ext" if the file path is in the form of <name>.<ext>
                    }
                    else {
                        associationKey = base; // otherwise use the basename (e.g. .gitignore, Dockerfile)
                    }
                    // If the association is already being made in the workspace, make sure to target workspace settings
                    let target = 2 /* ConfigurationTarget.USER */;
                    if (fileAssociationsConfig.workspaceValue && !!fileAssociationsConfig.workspaceValue[associationKey]) {
                        target = 5 /* ConfigurationTarget.WORKSPACE */;
                    }
                    // Make sure to write into the value of the target and not the merged value from USER and WORKSPACE config
                    const currentAssociations = (0, objects_1.$Vm)((target === 5 /* ConfigurationTarget.WORKSPACE */) ? fileAssociationsConfig.workspaceValue : fileAssociationsConfig.userValue) || Object.create(null);
                    currentAssociations[associationKey] = language.id;
                    configurationService.updateValue(files_1.$sk, currentAssociations, target);
                }
            }, 50 /* quick input is sensitive to being opened so soon after another */);
        }
    }
    exports.$Nvb = $Nvb;
    class $Ovb extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.action.editor.changeEOL',
                title: { value: (0, nls_1.localize)(46, null), original: 'Change End of Line Sequence' },
                f1: true
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            const quickInputService = accessor.get(quickInput_1.$Gq);
            const activeTextEditorControl = (0, editorBrowser_1.$lV)(editorService.activeTextEditorControl);
            if (!activeTextEditorControl) {
                await quickInputService.pick([{ label: (0, nls_1.localize)(47, null) }]);
                return;
            }
            if (editorService.activeEditor?.isReadonly()) {
                await quickInputService.pick([{ label: (0, nls_1.localize)(48, null) }]);
                return;
            }
            let textModel = activeTextEditorControl.getModel();
            const EOLOptions = [
                { label: nlsEOLLF, eol: 0 /* EndOfLineSequence.LF */ },
                { label: nlsEOLCRLF, eol: 1 /* EndOfLineSequence.CRLF */ },
            ];
            const selectedIndex = (textModel?.getEOL() === '\n') ? 0 : 1;
            const eol = await quickInputService.pick(EOLOptions, { placeHolder: (0, nls_1.localize)(49, null), activeItem: EOLOptions[selectedIndex] });
            if (eol) {
                const activeCodeEditor = (0, editorBrowser_1.$lV)(editorService.activeTextEditorControl);
                if (activeCodeEditor?.hasModel() && !editorService.activeEditor?.isReadonly()) {
                    textModel = activeCodeEditor.getModel();
                    textModel.pushStackElement();
                    textModel.pushEOL(eol.eol);
                    textModel.pushStackElement();
                }
            }
            activeTextEditorControl.focus();
        }
    }
    exports.$Ovb = $Ovb;
    class $Pvb extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.action.editor.changeEncoding',
                title: { value: (0, nls_1.localize)(50, null), original: 'Change File Encoding' },
                f1: true
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            const quickInputService = accessor.get(quickInput_1.$Gq);
            const fileService = accessor.get(files_1.$6j);
            const textFileService = accessor.get(textfiles_1.$JD);
            const textResourceConfigurationService = accessor.get(textResourceConfiguration_1.$FA);
            const activeTextEditorControl = (0, editorBrowser_1.$lV)(editorService.activeTextEditorControl);
            if (!activeTextEditorControl) {
                await quickInputService.pick([{ label: (0, nls_1.localize)(51, null) }]);
                return;
            }
            const activeEditorPane = editorService.activeEditorPane;
            if (!activeEditorPane) {
                await quickInputService.pick([{ label: (0, nls_1.localize)(52, null) }]);
                return;
            }
            const encodingSupport = toEditorWithEncodingSupport(activeEditorPane.input);
            if (!encodingSupport) {
                await quickInputService.pick([{ label: (0, nls_1.localize)(53, null) }]);
                return;
            }
            const saveWithEncodingPick = { label: (0, nls_1.localize)(54, null) };
            const reopenWithEncodingPick = { label: (0, nls_1.localize)(55, null) };
            if (!platform_1.Language.isDefaultVariant()) {
                const saveWithEncodingAlias = 'Save with Encoding';
                if (saveWithEncodingAlias !== saveWithEncodingPick.label) {
                    saveWithEncodingPick.detail = saveWithEncodingAlias;
                }
                const reopenWithEncodingAlias = 'Reopen with Encoding';
                if (reopenWithEncodingAlias !== reopenWithEncodingPick.label) {
                    reopenWithEncodingPick.detail = reopenWithEncodingAlias;
                }
            }
            let action;
            if (encodingSupport instanceof untitledTextEditorInput_1.$Bvb) {
                action = saveWithEncodingPick;
            }
            else if (activeEditorPane.input.isReadonly()) {
                action = reopenWithEncodingPick;
            }
            else {
                action = await quickInputService.pick([reopenWithEncodingPick, saveWithEncodingPick], { placeHolder: (0, nls_1.localize)(56, null), matchOnDetail: true });
            }
            if (!action) {
                return;
            }
            await (0, async_1.$Hg)(50); // quick input is sensitive to being opened so soon after another
            const resource = editor_1.$3E.getOriginalUri(activeEditorPane.input, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            if (!resource || (!fileService.hasProvider(resource) && resource.scheme !== network_1.Schemas.untitled)) {
                return; // encoding detection only possible for resources the file service can handle or that are untitled
            }
            let guessedEncoding = undefined;
            if (fileService.hasProvider(resource)) {
                const content = await textFileService.readStream(resource, { autoGuessEncoding: true });
                guessedEncoding = content.encoding;
            }
            const isReopenWithEncoding = (action === reopenWithEncodingPick);
            const configuredEncoding = textResourceConfigurationService.getValue(resource ?? undefined, 'files.encoding');
            let directMatchIndex;
            let aliasMatchIndex;
            // All encodings are valid picks
            const picks = Object.keys(encoding_1.$rD)
                .sort((k1, k2) => {
                if (k1 === configuredEncoding) {
                    return -1;
                }
                else if (k2 === configuredEncoding) {
                    return 1;
                }
                return encoding_1.$rD[k1].order - encoding_1.$rD[k2].order;
            })
                .filter(k => {
                if (k === guessedEncoding && guessedEncoding !== configuredEncoding) {
                    return false; // do not show encoding if it is the guessed encoding that does not match the configured
                }
                return !isReopenWithEncoding || !encoding_1.$rD[k].encodeOnly; // hide those that can only be used for encoding if we are about to decode
            })
                .map((key, index) => {
                if (key === encodingSupport.getEncoding()) {
                    directMatchIndex = index;
                }
                else if (encoding_1.$rD[key].alias === encodingSupport.getEncoding()) {
                    aliasMatchIndex = index;
                }
                return { id: key, label: encoding_1.$rD[key].labelLong, description: key };
            });
            const items = picks.slice();
            // If we have a guessed encoding, show it first unless it matches the configured encoding
            if (guessedEncoding && configuredEncoding !== guessedEncoding && encoding_1.$rD[guessedEncoding]) {
                picks.unshift({ type: 'separator' });
                picks.unshift({ id: guessedEncoding, label: encoding_1.$rD[guessedEncoding].labelLong, description: (0, nls_1.localize)(57, null) });
            }
            const encoding = await quickInputService.pick(picks, {
                placeHolder: isReopenWithEncoding ? (0, nls_1.localize)(58, null) : (0, nls_1.localize)(59, null),
                activeItem: items[typeof directMatchIndex === 'number' ? directMatchIndex : typeof aliasMatchIndex === 'number' ? aliasMatchIndex : -1]
            });
            if (!encoding) {
                return;
            }
            if (!editorService.activeEditorPane) {
                return;
            }
            const activeEncodingSupport = toEditorWithEncodingSupport(editorService.activeEditorPane.input);
            if (typeof encoding.id !== 'undefined' && activeEncodingSupport) {
                await activeEncodingSupport.setEncoding(encoding.id, isReopenWithEncoding ? 1 /* EncodingMode.Decode */ : 0 /* EncodingMode.Encode */); // Set new encoding
            }
            activeTextEditorControl.focus();
        }
    }
    exports.$Pvb = $Pvb;
});
//# sourceMappingURL=editorStatus.js.map