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
define(["require", "exports", "vs/nls", "vs/base/browser/dom", "vs/base/common/strings", "vs/base/common/resources", "vs/base/common/types", "vs/base/common/uri", "vs/base/common/actions", "vs/base/common/platform", "vs/workbench/services/untitled/common/untitledTextEditorInput", "vs/workbench/common/editor", "vs/base/common/lifecycle", "vs/editor/contrib/linesOperations/browser/linesOperations", "vs/editor/contrib/indentation/browser/indentation", "vs/workbench/browser/parts/editor/binaryEditor", "vs/workbench/browser/parts/editor/binaryDiffEditor", "vs/workbench/services/editor/common/editorService", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/editor/common/languages/language", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/platform/commands/common/commands", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/services/textfile/common/encoding", "vs/editor/common/services/textResourceConfiguration", "vs/platform/configuration/common/configuration", "vs/base/common/objects", "vs/editor/browser/editorBrowser", "vs/base/common/network", "vs/workbench/services/preferences/common/preferences", "vs/platform/quickinput/common/quickInput", "vs/editor/common/services/getIconClasses", "vs/base/common/async", "vs/base/common/event", "vs/workbench/services/statusbar/browser/statusbar", "vs/platform/markers/common/markers", "vs/platform/telemetry/common/telemetry", "vs/workbench/common/editor/sideBySideEditorInput", "vs/workbench/services/languageDetection/common/languageDetectionWorkerService", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/common/actions", "vs/base/common/keyCodes", "vs/editor/browser/config/tabFocus", "vs/css!./media/editorstatus"], function (require, exports, nls_1, dom_1, strings_1, resources_1, types_1, uri_1, actions_1, platform_1, untitledTextEditorInput_1, editor_1, lifecycle_1, linesOperations_1, indentation_1, binaryEditor_1, binaryDiffEditor_1, editorService_1, files_1, instantiation_1, language_1, range_1, selection_1, commands_1, extensionManagement_1, textfiles_1, encoding_1, textResourceConfiguration_1, configuration_1, objects_1, editorBrowser_1, network_1, preferences_1, quickInput_1, getIconClasses_1, async_1, event_1, statusbar_1, markers_1, telemetry_1, sideBySideEditorInput_1, languageDetectionWorkerService_1, contextkey_1, actions_2, keyCodes_1, tabFocus_1) {
    "use strict";
    var ShowLanguageExtensionsAction_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChangeEncodingAction = exports.ChangeEOLAction = exports.ChangeLanguageAction = exports.ShowLanguageExtensionsAction = exports.EditorStatus = void 0;
    class SideBySideEditorEncodingSupport {
        constructor(primary, secondary) {
            this.primary = primary;
            this.secondary = secondary;
        }
        getEncoding() {
            return this.primary.getEncoding(); // always report from modified (right hand) side
        }
        async setEncoding(encoding, mode) {
            await async_1.Promises.settled([this.primary, this.secondary].map(editor => editor.setEncoding(encoding, mode)));
        }
    }
    class SideBySideEditorLanguageSupport {
        constructor(primary, secondary) {
            this.primary = primary;
            this.secondary = secondary;
        }
        setLanguageId(languageId, source) {
            [this.primary, this.secondary].forEach(editor => editor.setLanguageId(languageId, source));
        }
    }
    function toEditorWithEncodingSupport(input) {
        // Untitled Text Editor
        if (input instanceof untitledTextEditorInput_1.UntitledTextEditorInput) {
            return input;
        }
        // Side by Side (diff) Editor
        if (input instanceof sideBySideEditorInput_1.SideBySideEditorInput) {
            const primaryEncodingSupport = toEditorWithEncodingSupport(input.primary);
            const secondaryEncodingSupport = toEditorWithEncodingSupport(input.secondary);
            if (primaryEncodingSupport && secondaryEncodingSupport) {
                return new SideBySideEditorEncodingSupport(primaryEncodingSupport, secondaryEncodingSupport);
            }
            return primaryEncodingSupport;
        }
        // File or Resource Editor
        const encodingSupport = input;
        if ((0, types_1.areFunctions)(encodingSupport.setEncoding, encodingSupport.getEncoding)) {
            return encodingSupport;
        }
        // Unsupported for any other editor
        return null;
    }
    function toEditorWithLanguageSupport(input) {
        // Untitled Text Editor
        if (input instanceof untitledTextEditorInput_1.UntitledTextEditorInput) {
            return input;
        }
        // Side by Side (diff) Editor
        if (input instanceof sideBySideEditorInput_1.SideBySideEditorInput) {
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
        get selectionStatus() { return this._selectionStatus; }
        get languageId() { return this._languageId; }
        get encoding() { return this._encoding; }
        get EOL() { return this._EOL; }
        get indentation() { return this._indentation; }
        get tabFocusMode() { return this._tabFocusMode; }
        get columnSelectionMode() { return this._columnSelectionMode; }
        get metadata() { return this._metadata; }
        update(update) {
            const change = new StateChange();
            switch (update.type) {
                case 'selectionStatus':
                    if (this._selectionStatus !== update.selectionStatus) {
                        this._selectionStatus = update.selectionStatus;
                        change.selectionStatus = true;
                    }
                    break;
                case 'indentation':
                    if (this._indentation !== update.indentation) {
                        this._indentation = update.indentation;
                        change.indentation = true;
                    }
                    break;
                case 'languageId':
                    if (this._languageId !== update.languageId) {
                        this._languageId = update.languageId;
                        change.languageId = true;
                    }
                    break;
                case 'encoding':
                    if (this._encoding !== update.encoding) {
                        this._encoding = update.encoding;
                        change.encoding = true;
                    }
                    break;
                case 'EOL':
                    if (this._EOL !== update.EOL) {
                        this._EOL = update.EOL;
                        change.EOL = true;
                    }
                    break;
                case 'tabFocusMode':
                    if (this._tabFocusMode !== update.tabFocusMode) {
                        this._tabFocusMode = update.tabFocusMode;
                        change.tabFocusMode = true;
                    }
                    break;
                case 'columnSelectionMode':
                    if (this._columnSelectionMode !== update.columnSelectionMode) {
                        this._columnSelectionMode = update.columnSelectionMode;
                        change.columnSelectionMode = true;
                    }
                    break;
                case 'metadata':
                    if (this._metadata !== update.metadata) {
                        this._metadata = update.metadata;
                        change.metadata = true;
                    }
                    break;
            }
            return change;
        }
    }
    let TabFocusMode = class TabFocusMode extends lifecycle_1.Disposable {
        constructor(configurationService) {
            super();
            this.configurationService = configurationService;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this.registerListeners();
            const tabFocusModeConfig = configurationService.getValue('editor.tabFocusMode') === true ? true : false;
            tabFocus_1.TabFocus.setTabFocusMode(tabFocusModeConfig);
            this._onDidChange.fire(tabFocusModeConfig);
        }
        registerListeners() {
            this._register(tabFocus_1.TabFocus.onDidChangeTabFocus(tabFocusMode => this._onDidChange.fire(tabFocusMode)));
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('editor.tabFocusMode')) {
                    const tabFocusModeConfig = this.configurationService.getValue('editor.tabFocusMode') === true ? true : false;
                    tabFocus_1.TabFocus.setTabFocusMode(tabFocusModeConfig);
                    this._onDidChange.fire(tabFocusModeConfig);
                }
            }));
        }
    };
    TabFocusMode = __decorate([
        __param(0, configuration_1.IConfigurationService)
    ], TabFocusMode);
    const nlsSingleSelectionRange = (0, nls_1.localize)('singleSelectionRange', "Ln {0}, Col {1} ({2} selected)");
    const nlsSingleSelection = (0, nls_1.localize)('singleSelection', "Ln {0}, Col {1}");
    const nlsMultiSelectionRange = (0, nls_1.localize)('multiSelectionRange', "{0} selections ({1} characters selected)");
    const nlsMultiSelection = (0, nls_1.localize)('multiSelection', "{0} selections");
    const nlsEOLLF = (0, nls_1.localize)('endOfLineLineFeed', "LF");
    const nlsEOLCRLF = (0, nls_1.localize)('endOfLineCarriageReturnLineFeed', "CRLF");
    let EditorStatus = class EditorStatus extends lifecycle_1.Disposable {
        constructor(editorService, quickInputService, languageService, textFileService, statusbarService, instantiationService, configurationService) {
            super();
            this.editorService = editorService;
            this.quickInputService = quickInputService;
            this.languageService = languageService;
            this.textFileService = textFileService;
            this.statusbarService = statusbarService;
            this.instantiationService = instantiationService;
            this.configurationService = configurationService;
            this.tabFocusModeElement = this._register(new lifecycle_1.MutableDisposable());
            this.columnSelectionModeElement = this._register(new lifecycle_1.MutableDisposable());
            this.indentationElement = this._register(new lifecycle_1.MutableDisposable());
            this.selectionElement = this._register(new lifecycle_1.MutableDisposable());
            this.encodingElement = this._register(new lifecycle_1.MutableDisposable());
            this.eolElement = this._register(new lifecycle_1.MutableDisposable());
            this.languageElement = this._register(new lifecycle_1.MutableDisposable());
            this.metadataElement = this._register(new lifecycle_1.MutableDisposable());
            this.currentProblemStatus = this._register(this.instantiationService.createInstance(ShowCurrentMarkerInStatusbarContribution));
            this.state = new State();
            this.activeEditorListeners = this._register(new lifecycle_1.DisposableStore());
            this.delayedRender = this._register(new lifecycle_1.MutableDisposable());
            this.toRender = null;
            this.tabFocusMode = instantiationService.createInstance(TabFocusMode);
            this.registerCommands();
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.editorService.onDidActiveEditorChange(() => this.updateStatusBar()));
            this._register(this.textFileService.untitled.onDidChangeEncoding(model => this.onResourceEncodingChange(model.resource)));
            this._register(this.textFileService.files.onDidChangeEncoding(model => this.onResourceEncodingChange((model.resource))));
            this._register(event_1.Event.runAndSubscribe(this.tabFocusMode.onDidChange, (tabFocusMode) => {
                if (tabFocusMode !== undefined) {
                    this.onTabFocusModeChange(tabFocusMode);
                }
                else {
                    this.onTabFocusModeChange(this.configurationService.getValue('editor.tabFocusMode'));
                }
            }));
        }
        registerCommands() {
            commands_1.CommandsRegistry.registerCommand({ id: 'changeEditorIndentation', handler: () => this.showIndentationPicker() });
        }
        async showIndentationPicker() {
            const activeTextEditorControl = (0, editorBrowser_1.getCodeEditor)(this.editorService.activeTextEditorControl);
            if (!activeTextEditorControl) {
                return this.quickInputService.pick([{ label: (0, nls_1.localize)('noEditor', "No text editor active at this time") }]);
            }
            if (this.editorService.activeEditor?.isReadonly()) {
                return this.quickInputService.pick([{ label: (0, nls_1.localize)('noWritableCodeEditor', "The active code editor is read-only.") }]);
            }
            const picks = [
                (0, types_1.assertIsDefined)(activeTextEditorControl.getAction(indentation_1.IndentUsingSpaces.ID)),
                (0, types_1.assertIsDefined)(activeTextEditorControl.getAction(indentation_1.IndentUsingTabs.ID)),
                (0, types_1.assertIsDefined)(activeTextEditorControl.getAction(indentation_1.ChangeTabDisplaySize.ID)),
                (0, types_1.assertIsDefined)(activeTextEditorControl.getAction(indentation_1.DetectIndentation.ID)),
                (0, types_1.assertIsDefined)(activeTextEditorControl.getAction(indentation_1.IndentationToSpacesAction.ID)),
                (0, types_1.assertIsDefined)(activeTextEditorControl.getAction(indentation_1.IndentationToTabsAction.ID)),
                (0, types_1.assertIsDefined)(activeTextEditorControl.getAction(linesOperations_1.TrimTrailingWhitespaceAction.ID))
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
            picks.splice(3, 0, { type: 'separator', label: (0, nls_1.localize)('indentConvert', "convert file") });
            picks.unshift({ type: 'separator', label: (0, nls_1.localize)('indentView', "change view") });
            const action = await this.quickInputService.pick(picks, { placeHolder: (0, nls_1.localize)('pickAction', "Select Action"), matchOnDetail: true });
            return action?.run();
        }
        updateTabFocusModeElement(visible) {
            if (visible) {
                if (!this.tabFocusModeElement.value) {
                    const text = (0, nls_1.localize)('tabFocusModeEnabled', "Tab Moves Focus");
                    this.tabFocusModeElement.value = this.statusbarService.addEntry({
                        name: (0, nls_1.localize)('status.editor.tabFocusMode', "Accessibility Mode"),
                        text,
                        ariaLabel: text,
                        tooltip: (0, nls_1.localize)('disableTabMode', "Disable Accessibility Mode"),
                        command: 'editor.action.toggleTabFocusMode',
                        kind: 'prominent'
                    }, 'status.editor.tabFocusMode', 1 /* StatusbarAlignment.RIGHT */, 100.7);
                }
            }
            else {
                this.tabFocusModeElement.clear();
            }
        }
        updateColumnSelectionModeElement(visible) {
            if (visible) {
                if (!this.columnSelectionModeElement.value) {
                    const text = (0, nls_1.localize)('columnSelectionModeEnabled', "Column Selection");
                    this.columnSelectionModeElement.value = this.statusbarService.addEntry({
                        name: (0, nls_1.localize)('status.editor.columnSelectionMode', "Column Selection Mode"),
                        text,
                        ariaLabel: text,
                        tooltip: (0, nls_1.localize)('disableColumnSelectionMode', "Disable Column Selection Mode"),
                        command: 'editor.action.toggleColumnSelection',
                        kind: 'prominent'
                    }, 'status.editor.columnSelectionMode', 1 /* StatusbarAlignment.RIGHT */, 100.8);
                }
            }
            else {
                this.columnSelectionModeElement.clear();
            }
        }
        updateSelectionElement(text) {
            if (!text) {
                this.selectionElement.clear();
                return;
            }
            const props = {
                name: (0, nls_1.localize)('status.editor.selection', "Editor Selection"),
                text,
                ariaLabel: text,
                tooltip: (0, nls_1.localize)('gotoLine', "Go to Line/Column"),
                command: 'workbench.action.gotoLine'
            };
            this.updateElement(this.selectionElement, props, 'status.editor.selection', 1 /* StatusbarAlignment.RIGHT */, 100.5);
        }
        updateIndentationElement(text) {
            if (!text) {
                this.indentationElement.clear();
                return;
            }
            const props = {
                name: (0, nls_1.localize)('status.editor.indentation', "Editor Indentation"),
                text,
                ariaLabel: text,
                tooltip: (0, nls_1.localize)('selectIndentation', "Select Indentation"),
                command: 'changeEditorIndentation'
            };
            this.updateElement(this.indentationElement, props, 'status.editor.indentation', 1 /* StatusbarAlignment.RIGHT */, 100.4);
        }
        updateEncodingElement(text) {
            if (!text) {
                this.encodingElement.clear();
                return;
            }
            const props = {
                name: (0, nls_1.localize)('status.editor.encoding', "Editor Encoding"),
                text,
                ariaLabel: text,
                tooltip: (0, nls_1.localize)('selectEncoding', "Select Encoding"),
                command: 'workbench.action.editor.changeEncoding'
            };
            this.updateElement(this.encodingElement, props, 'status.editor.encoding', 1 /* StatusbarAlignment.RIGHT */, 100.3);
        }
        updateEOLElement(text) {
            if (!text) {
                this.eolElement.clear();
                return;
            }
            const props = {
                name: (0, nls_1.localize)('status.editor.eol', "Editor End of Line"),
                text,
                ariaLabel: text,
                tooltip: (0, nls_1.localize)('selectEOL', "Select End of Line Sequence"),
                command: 'workbench.action.editor.changeEOL'
            };
            this.updateElement(this.eolElement, props, 'status.editor.eol', 1 /* StatusbarAlignment.RIGHT */, 100.2);
        }
        updateLanguageIdElement(text) {
            if (!text) {
                this.languageElement.clear();
                return;
            }
            const props = {
                name: (0, nls_1.localize)('status.editor.mode', "Editor Language"),
                text,
                ariaLabel: text,
                tooltip: (0, nls_1.localize)('selectLanguageMode', "Select Language Mode"),
                command: 'workbench.action.editor.changeLanguageMode'
            };
            this.updateElement(this.languageElement, props, 'status.editor.mode', 1 /* StatusbarAlignment.RIGHT */, 100.1);
        }
        updateMetadataElement(text) {
            if (!text) {
                this.metadataElement.clear();
                return;
            }
            const props = {
                name: (0, nls_1.localize)('status.editor.info', "File Information"),
                text,
                ariaLabel: text,
                tooltip: (0, nls_1.localize)('fileInfo', "File Information")
            };
            this.updateElement(this.metadataElement, props, 'status.editor.info', 1 /* StatusbarAlignment.RIGHT */, 100);
        }
        updateElement(element, props, id, alignment, priority) {
            if (!element.value) {
                element.value = this.statusbarService.addEntry(props, id, alignment, priority);
            }
            else {
                element.value.update(props);
            }
        }
        updateState(update) {
            const changed = this.state.update(update);
            if (!changed.hasChanges()) {
                return; // Nothing really changed
            }
            if (!this.toRender) {
                this.toRender = changed;
                this.delayedRender.value = (0, dom_1.runAtThisOrScheduleAtNextAnimationFrame)(() => {
                    this.delayedRender.clear();
                    const toRender = this.toRender;
                    this.toRender = null;
                    if (toRender) {
                        this.doRenderNow(toRender);
                    }
                });
            }
            else {
                this.toRender.combine(changed);
            }
        }
        doRenderNow(changed) {
            this.updateTabFocusModeElement(!!this.state.tabFocusMode);
            this.updateColumnSelectionModeElement(!!this.state.columnSelectionMode);
            this.updateIndentationElement(this.state.indentation);
            this.updateSelectionElement(this.state.selectionStatus);
            this.updateEncodingElement(this.state.encoding);
            this.updateEOLElement(this.state.EOL ? this.state.EOL === '\r\n' ? nlsEOLCRLF : nlsEOLLF : undefined);
            this.updateLanguageIdElement(this.state.languageId);
            this.updateMetadataElement(this.state.metadata);
        }
        getSelectionLabel(info) {
            if (!info || !info.selections) {
                return undefined;
            }
            if (info.selections.length === 1) {
                if (info.charactersSelected) {
                    return (0, strings_1.format)(nlsSingleSelectionRange, info.selections[0].positionLineNumber, info.selections[0].positionColumn, info.charactersSelected);
                }
                return (0, strings_1.format)(nlsSingleSelection, info.selections[0].positionLineNumber, info.selections[0].positionColumn);
            }
            if (info.charactersSelected) {
                return (0, strings_1.format)(nlsMultiSelectionRange, info.selections.length, info.charactersSelected);
            }
            if (info.selections.length > 0) {
                return (0, strings_1.format)(nlsMultiSelection, info.selections.length);
            }
            return undefined;
        }
        updateStatusBar() {
            const activeInput = this.editorService.activeEditor;
            const activeEditorPane = this.editorService.activeEditorPane;
            const activeCodeEditor = activeEditorPane ? (0, editorBrowser_1.getCodeEditor)(activeEditorPane.getControl()) ?? undefined : undefined;
            // Update all states
            this.onColumnSelectionModeChange(activeCodeEditor);
            this.onSelectionChange(activeCodeEditor);
            this.onLanguageChange(activeCodeEditor, activeInput);
            this.onEOLChange(activeCodeEditor);
            this.onEncodingChange(activeEditorPane, activeCodeEditor);
            this.onIndentationChange(activeCodeEditor);
            this.onMetadataChange(activeEditorPane);
            this.currentProblemStatus.update(activeCodeEditor);
            // Dispose old active editor listeners
            this.activeEditorListeners.clear();
            // Attach new listeners to active editor
            if (activeEditorPane) {
                this.activeEditorListeners.add(activeEditorPane.onDidChangeControl(() => {
                    // Since our editor status is mainly observing the
                    // active editor control, do a full update whenever
                    // the control changes.
                    this.updateStatusBar();
                }));
            }
            // Attach new listeners to active code editor
            if (activeCodeEditor) {
                // Hook Listener for Configuration changes
                this.activeEditorListeners.add(activeCodeEditor.onDidChangeConfiguration((event) => {
                    if (event.hasChanged(22 /* EditorOption.columnSelection */)) {
                        this.onColumnSelectionModeChange(activeCodeEditor);
                    }
                }));
                // Hook Listener for Selection changes
                this.activeEditorListeners.add(event_1.Event.defer(activeCodeEditor.onDidChangeCursorPosition)(() => {
                    this.onSelectionChange(activeCodeEditor);
                    this.currentProblemStatus.update(activeCodeEditor);
                }));
                // Hook Listener for language changes
                this.activeEditorListeners.add(activeCodeEditor.onDidChangeModelLanguage(() => {
                    this.onLanguageChange(activeCodeEditor, activeInput);
                }));
                // Hook Listener for content changes
                this.activeEditorListeners.add(event_1.Event.accumulate(activeCodeEditor.onDidChangeModelContent)(e => {
                    this.onEOLChange(activeCodeEditor);
                    this.currentProblemStatus.update(activeCodeEditor);
                    const selections = activeCodeEditor.getSelections();
                    if (selections) {
                        for (const inner of e) {
                            for (const change of inner.changes) {
                                if (selections.some(selection => range_1.Range.areIntersecting(selection, change.range))) {
                                    this.onSelectionChange(activeCodeEditor);
                                    break;
                                }
                            }
                        }
                    }
                }));
                // Hook Listener for content options changes
                this.activeEditorListeners.add(activeCodeEditor.onDidChangeModelOptions(() => {
                    this.onIndentationChange(activeCodeEditor);
                }));
            }
            // Handle binary editors
            else if (activeEditorPane instanceof binaryEditor_1.BaseBinaryResourceEditor || activeEditorPane instanceof binaryDiffEditor_1.BinaryResourceDiffEditor) {
                const binaryEditors = [];
                if (activeEditorPane instanceof binaryDiffEditor_1.BinaryResourceDiffEditor) {
                    const primary = activeEditorPane.getPrimaryEditorPane();
                    if (primary instanceof binaryEditor_1.BaseBinaryResourceEditor) {
                        binaryEditors.push(primary);
                    }
                    const secondary = activeEditorPane.getSecondaryEditorPane();
                    if (secondary instanceof binaryEditor_1.BaseBinaryResourceEditor) {
                        binaryEditors.push(secondary);
                    }
                }
                else {
                    binaryEditors.push(activeEditorPane);
                }
                for (const editor of binaryEditors) {
                    this.activeEditorListeners.add(editor.onDidChangeMetadata(() => {
                        this.onMetadataChange(activeEditorPane);
                    }));
                    this.activeEditorListeners.add(editor.onDidOpenInPlace(() => {
                        this.updateStatusBar();
                    }));
                }
            }
        }
        onLanguageChange(editorWidget, editorInput) {
            const info = { type: 'languageId', languageId: undefined };
            // We only support text based editors
            if (editorWidget && editorInput && toEditorWithLanguageSupport(editorInput)) {
                const textModel = editorWidget.getModel();
                if (textModel) {
                    const languageId = textModel.getLanguageId();
                    info.languageId = this.languageService.getLanguageName(languageId) ?? undefined;
                }
            }
            this.updateState(info);
        }
        onIndentationChange(editorWidget) {
            const update = { type: 'indentation', indentation: undefined };
            if (editorWidget) {
                const model = editorWidget.getModel();
                if (model) {
                    const modelOpts = model.getOptions();
                    update.indentation = (modelOpts.insertSpaces
                        ? modelOpts.tabSize === modelOpts.indentSize
                            ? (0, nls_1.localize)('spacesSize', "Spaces: {0}", modelOpts.indentSize)
                            : (0, nls_1.localize)('spacesAndTabsSize', "Spaces: {0} (Tab Size: {1})", modelOpts.indentSize, modelOpts.tabSize)
                        : (0, nls_1.localize)({ key: 'tabSize', comment: ['Tab corresponds to the tab key'] }, "Tab Size: {0}", modelOpts.tabSize));
                }
            }
            this.updateState(update);
        }
        onMetadataChange(editor) {
            const update = { type: 'metadata', metadata: undefined };
            if (editor instanceof binaryEditor_1.BaseBinaryResourceEditor || editor instanceof binaryDiffEditor_1.BinaryResourceDiffEditor) {
                update.metadata = editor.getMetadata();
            }
            this.updateState(update);
        }
        onColumnSelectionModeChange(editorWidget) {
            const info = { type: 'columnSelectionMode', columnSelectionMode: false };
            if (editorWidget?.getOption(22 /* EditorOption.columnSelection */)) {
                info.columnSelectionMode = true;
            }
            this.updateState(info);
        }
        onSelectionChange(editorWidget) {
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
                    const selectionClone = new selection_1.Selection(info.selections[0].selectionStartLineNumber, info.selections[0].selectionStartColumn, info.selections[0].positionLineNumber, editorPosition ? editorWidget.getStatusbarColumn(editorPosition) : info.selections[0].positionColumn);
                    info.selections[0] = selectionClone;
                }
            }
            this.updateState({ type: 'selectionStatus', selectionStatus: this.getSelectionLabel(info) });
        }
        onEOLChange(editorWidget) {
            const info = { type: 'EOL', EOL: undefined };
            if (editorWidget && !editorWidget.getOption(90 /* EditorOption.readOnly */)) {
                const codeEditorModel = editorWidget.getModel();
                if (codeEditorModel) {
                    info.EOL = codeEditorModel.getEOL();
                }
            }
            this.updateState(info);
        }
        onEncodingChange(editor, editorWidget) {
            if (editor && !this.isActiveEditor(editor)) {
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
                    const encodingInfo = typeof rawEncoding === 'string' ? encoding_1.SUPPORTED_ENCODINGS[rawEncoding] : undefined;
                    if (encodingInfo) {
                        info.encoding = encodingInfo.labelShort; // if we have a label, take it from there
                    }
                    else {
                        info.encoding = rawEncoding; // otherwise use it raw
                    }
                }
            }
            this.updateState(info);
        }
        onResourceEncodingChange(resource) {
            const activeEditorPane = this.editorService.activeEditorPane;
            if (activeEditorPane) {
                const activeResource = editor_1.EditorResourceAccessor.getCanonicalUri(activeEditorPane.input, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
                if (activeResource && (0, resources_1.isEqual)(activeResource, resource)) {
                    const activeCodeEditor = (0, editorBrowser_1.getCodeEditor)(activeEditorPane.getControl()) ?? undefined;
                    return this.onEncodingChange(activeEditorPane, activeCodeEditor); // only update if the encoding changed for the active resource
                }
            }
        }
        onTabFocusModeChange(tabFocusMode) {
            const info = { type: 'tabFocusMode', tabFocusMode };
            this.updateState(info);
        }
        isActiveEditor(control) {
            const activeEditorPane = this.editorService.activeEditorPane;
            return !!activeEditorPane && activeEditorPane === control;
        }
    };
    exports.EditorStatus = EditorStatus;
    exports.EditorStatus = EditorStatus = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, quickInput_1.IQuickInputService),
        __param(2, language_1.ILanguageService),
        __param(3, textfiles_1.ITextFileService),
        __param(4, statusbar_1.IStatusbarService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, configuration_1.IConfigurationService)
    ], EditorStatus);
    let ShowCurrentMarkerInStatusbarContribution = class ShowCurrentMarkerInStatusbarContribution extends lifecycle_1.Disposable {
        constructor(statusbarService, markerService, configurationService) {
            super();
            this.statusbarService = statusbarService;
            this.markerService = markerService;
            this.configurationService = configurationService;
            this.editor = undefined;
            this.markers = [];
            this.currentMarker = null;
            this.statusBarEntryAccessor = this._register(new lifecycle_1.MutableDisposable());
            this._register(markerService.onMarkerChanged(changedResources => this.onMarkerChanged(changedResources)));
            this._register(event_1.Event.filter(configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('problems.showCurrentInStatus'))(() => this.updateStatus()));
        }
        update(editor) {
            this.editor = editor;
            this.updateMarkers();
            this.updateStatus();
        }
        updateStatus() {
            const previousMarker = this.currentMarker;
            this.currentMarker = this.getMarker();
            if (this.hasToUpdateStatus(previousMarker, this.currentMarker)) {
                if (this.currentMarker) {
                    const line = (0, strings_1.splitLines)(this.currentMarker.message)[0];
                    const text = `${this.getType(this.currentMarker)} ${line}`;
                    if (!this.statusBarEntryAccessor.value) {
                        this.statusBarEntryAccessor.value = this.statusbarService.addEntry({ name: (0, nls_1.localize)('currentProblem', "Current Problem"), text: '', ariaLabel: '' }, 'statusbar.currentProblem', 0 /* StatusbarAlignment.LEFT */);
                    }
                    this.statusBarEntryAccessor.value.update({ name: (0, nls_1.localize)('currentProblem', "Current Problem"), text, ariaLabel: text });
                }
                else {
                    this.statusBarEntryAccessor.clear();
                }
            }
        }
        hasToUpdateStatus(previousMarker, currentMarker) {
            if (!currentMarker) {
                return true;
            }
            if (!previousMarker) {
                return true;
            }
            return markers_1.IMarkerData.makeKey(previousMarker) !== markers_1.IMarkerData.makeKey(currentMarker);
        }
        getType(marker) {
            switch (marker.severity) {
                case markers_1.MarkerSeverity.Error: return '$(error)';
                case markers_1.MarkerSeverity.Warning: return '$(warning)';
                case markers_1.MarkerSeverity.Info: return '$(info)';
            }
            return '';
        }
        getMarker() {
            if (!this.configurationService.getValue('problems.showCurrentInStatus')) {
                return null;
            }
            if (!this.editor) {
                return null;
            }
            const model = this.editor.getModel();
            if (!model) {
                return null;
            }
            const position = this.editor.getPosition();
            if (!position) {
                return null;
            }
            return this.markers.find(marker => range_1.Range.containsPosition(marker, position)) || null;
        }
        onMarkerChanged(changedResources) {
            if (!this.editor) {
                return;
            }
            const model = this.editor.getModel();
            if (!model) {
                return;
            }
            if (model && !changedResources.some(r => (0, resources_1.isEqual)(model.uri, r))) {
                return;
            }
            this.updateMarkers();
        }
        updateMarkers() {
            if (!this.editor) {
                return;
            }
            const model = this.editor.getModel();
            if (!model) {
                return;
            }
            if (model) {
                this.markers = this.markerService.read({
                    resource: model.uri,
                    severities: markers_1.MarkerSeverity.Error | markers_1.MarkerSeverity.Warning | markers_1.MarkerSeverity.Info
                });
                this.markers.sort(compareMarker);
            }
            else {
                this.markers = [];
            }
            this.updateStatus();
        }
    };
    ShowCurrentMarkerInStatusbarContribution = __decorate([
        __param(0, statusbar_1.IStatusbarService),
        __param(1, markers_1.IMarkerService),
        __param(2, configuration_1.IConfigurationService)
    ], ShowCurrentMarkerInStatusbarContribution);
    function compareMarker(a, b) {
        let res = (0, strings_1.compare)(a.resource.toString(), b.resource.toString());
        if (res === 0) {
            res = markers_1.MarkerSeverity.compare(a.severity, b.severity);
        }
        if (res === 0) {
            res = range_1.Range.compareRangesUsingStarts(a, b);
        }
        return res;
    }
    let ShowLanguageExtensionsAction = class ShowLanguageExtensionsAction extends actions_1.Action {
        static { ShowLanguageExtensionsAction_1 = this; }
        static { this.ID = 'workbench.action.showLanguageExtensions'; }
        constructor(fileExtension, commandService, galleryService) {
            super(ShowLanguageExtensionsAction_1.ID, (0, nls_1.localize)('showLanguageExtensions', "Search Marketplace Extensions for '{0}'...", fileExtension));
            this.fileExtension = fileExtension;
            this.commandService = commandService;
            this.enabled = galleryService.isEnabled();
        }
        async run() {
            await this.commandService.executeCommand('workbench.extensions.action.showExtensionsForLanguage', this.fileExtension);
        }
    };
    exports.ShowLanguageExtensionsAction = ShowLanguageExtensionsAction;
    exports.ShowLanguageExtensionsAction = ShowLanguageExtensionsAction = ShowLanguageExtensionsAction_1 = __decorate([
        __param(1, commands_1.ICommandService),
        __param(2, extensionManagement_1.IExtensionGalleryService)
    ], ShowLanguageExtensionsAction);
    class ChangeLanguageAction extends actions_2.Action2 {
        static { this.ID = 'workbench.action.editor.changeLanguageMode'; }
        constructor() {
            super({
                id: ChangeLanguageAction.ID,
                title: { value: (0, nls_1.localize)('changeMode', "Change Language Mode"), original: 'Change Language Mode' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 43 /* KeyCode.KeyM */)
                },
                precondition: contextkey_1.ContextKeyExpr.not('notebookEditorFocused')
            });
        }
        async run(accessor) {
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const editorService = accessor.get(editorService_1.IEditorService);
            const languageService = accessor.get(language_1.ILanguageService);
            const languageDetectionService = accessor.get(languageDetectionWorkerService_1.ILanguageDetectionService);
            const textFileService = accessor.get(textfiles_1.ITextFileService);
            const preferencesService = accessor.get(preferences_1.IPreferencesService);
            const instantiationService = accessor.get(instantiation_1.IInstantiationService);
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const telemetryService = accessor.get(telemetry_1.ITelemetryService);
            const activeTextEditorControl = (0, editorBrowser_1.getCodeEditor)(editorService.activeTextEditorControl);
            if (!activeTextEditorControl) {
                await quickInputService.pick([{ label: (0, nls_1.localize)('noEditor', "No text editor active at this time") }]);
                return;
            }
            const textModel = activeTextEditorControl.getModel();
            const resource = editor_1.EditorResourceAccessor.getOriginalUri(editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
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
                    description = (0, nls_1.localize)('languageDescription', "({0}) - Configured Language", languageId);
                }
                else {
                    description = (0, nls_1.localize)('languageDescriptionConfigured', "({0})", languageId);
                }
                return {
                    label: languageName,
                    meta: extensions,
                    iconClasses: (0, getIconClasses_1.getIconClassesForLanguageId)(languageId),
                    description
                };
            });
            picks.unshift({ type: 'separator', label: (0, nls_1.localize)('languagesPicks', "languages (identifier)") });
            // Offer action to configure via settings
            let configureLanguageAssociations;
            let configureLanguageSettings;
            let galleryAction;
            if (hasLanguageSupport && resource) {
                const ext = (0, resources_1.extname)(resource) || (0, resources_1.basename)(resource);
                galleryAction = instantiationService.createInstance(ShowLanguageExtensionsAction, ext);
                if (galleryAction.enabled) {
                    picks.unshift(galleryAction);
                }
                configureLanguageSettings = { label: (0, nls_1.localize)('configureModeSettings', "Configure '{0}' language based settings...", currentLanguageName) };
                picks.unshift(configureLanguageSettings);
                configureLanguageAssociations = { label: (0, nls_1.localize)('configureAssociationsExt', "Configure File Association for '{0}'...", ext) };
                picks.unshift(configureLanguageAssociations);
            }
            // Offer to "Auto Detect"
            const autoDetectLanguage = {
                label: (0, nls_1.localize)('autoDetect', "Auto Detect")
            };
            picks.unshift(autoDetectLanguage);
            const pick = await quickInputService.pick(picks, { placeHolder: (0, nls_1.localize)('pickLanguage', "Select Language Mode"), matchOnDescription: true });
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
                    this.configureFileAssociation(resource, languageService, quickInputService, configurationService);
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
                            const resource = editor_1.EditorResourceAccessor.getOriginalUri(activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
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
                                    telemetryService.publicLog2(languageDetectionWorkerService_1.AutomaticLanguageDetectionLikelyWrongId, {
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
                        languageSupport.setLanguageId(languageSelection.languageId, ChangeLanguageAction.ID);
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
        configureFileAssociation(resource, languageService, quickInputService, configurationService) {
            const extension = (0, resources_1.extname)(resource);
            const base = (0, resources_1.basename)(resource);
            const currentAssociation = languageService.guessLanguageIdByFilepathOrFirstLine(uri_1.URI.file(base));
            const languages = languageService.getSortedRegisteredLanguageNames();
            const picks = languages.map(({ languageName, languageId }) => {
                return {
                    id: languageId,
                    label: languageName,
                    iconClasses: (0, getIconClasses_1.getIconClassesForLanguageId)(languageId),
                    description: (languageId === currentAssociation) ? (0, nls_1.localize)('currentAssociation', "Current Association") : undefined
                };
            });
            setTimeout(async () => {
                const language = await quickInputService.pick(picks, { placeHolder: (0, nls_1.localize)('pickLanguageToConfigure', "Select Language Mode to Associate with '{0}'", extension || base) });
                if (language) {
                    const fileAssociationsConfig = configurationService.inspect(files_1.FILES_ASSOCIATIONS_CONFIG);
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
                    const currentAssociations = (0, objects_1.deepClone)((target === 5 /* ConfigurationTarget.WORKSPACE */) ? fileAssociationsConfig.workspaceValue : fileAssociationsConfig.userValue) || Object.create(null);
                    currentAssociations[associationKey] = language.id;
                    configurationService.updateValue(files_1.FILES_ASSOCIATIONS_CONFIG, currentAssociations, target);
                }
            }, 50 /* quick input is sensitive to being opened so soon after another */);
        }
    }
    exports.ChangeLanguageAction = ChangeLanguageAction;
    class ChangeEOLAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.editor.changeEOL',
                title: { value: (0, nls_1.localize)('changeEndOfLine', "Change End of Line Sequence"), original: 'Change End of Line Sequence' },
                f1: true
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const activeTextEditorControl = (0, editorBrowser_1.getCodeEditor)(editorService.activeTextEditorControl);
            if (!activeTextEditorControl) {
                await quickInputService.pick([{ label: (0, nls_1.localize)('noEditor', "No text editor active at this time") }]);
                return;
            }
            if (editorService.activeEditor?.isReadonly()) {
                await quickInputService.pick([{ label: (0, nls_1.localize)('noWritableCodeEditor', "The active code editor is read-only.") }]);
                return;
            }
            let textModel = activeTextEditorControl.getModel();
            const EOLOptions = [
                { label: nlsEOLLF, eol: 0 /* EndOfLineSequence.LF */ },
                { label: nlsEOLCRLF, eol: 1 /* EndOfLineSequence.CRLF */ },
            ];
            const selectedIndex = (textModel?.getEOL() === '\n') ? 0 : 1;
            const eol = await quickInputService.pick(EOLOptions, { placeHolder: (0, nls_1.localize)('pickEndOfLine', "Select End of Line Sequence"), activeItem: EOLOptions[selectedIndex] });
            if (eol) {
                const activeCodeEditor = (0, editorBrowser_1.getCodeEditor)(editorService.activeTextEditorControl);
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
    exports.ChangeEOLAction = ChangeEOLAction;
    class ChangeEncodingAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.editor.changeEncoding',
                title: { value: (0, nls_1.localize)('changeEncoding', "Change File Encoding"), original: 'Change File Encoding' },
                f1: true
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const fileService = accessor.get(files_1.IFileService);
            const textFileService = accessor.get(textfiles_1.ITextFileService);
            const textResourceConfigurationService = accessor.get(textResourceConfiguration_1.ITextResourceConfigurationService);
            const activeTextEditorControl = (0, editorBrowser_1.getCodeEditor)(editorService.activeTextEditorControl);
            if (!activeTextEditorControl) {
                await quickInputService.pick([{ label: (0, nls_1.localize)('noEditor', "No text editor active at this time") }]);
                return;
            }
            const activeEditorPane = editorService.activeEditorPane;
            if (!activeEditorPane) {
                await quickInputService.pick([{ label: (0, nls_1.localize)('noEditor', "No text editor active at this time") }]);
                return;
            }
            const encodingSupport = toEditorWithEncodingSupport(activeEditorPane.input);
            if (!encodingSupport) {
                await quickInputService.pick([{ label: (0, nls_1.localize)('noFileEditor', "No file active at this time") }]);
                return;
            }
            const saveWithEncodingPick = { label: (0, nls_1.localize)('saveWithEncoding', "Save with Encoding") };
            const reopenWithEncodingPick = { label: (0, nls_1.localize)('reopenWithEncoding', "Reopen with Encoding") };
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
            if (encodingSupport instanceof untitledTextEditorInput_1.UntitledTextEditorInput) {
                action = saveWithEncodingPick;
            }
            else if (activeEditorPane.input.isReadonly()) {
                action = reopenWithEncodingPick;
            }
            else {
                action = await quickInputService.pick([reopenWithEncodingPick, saveWithEncodingPick], { placeHolder: (0, nls_1.localize)('pickAction', "Select Action"), matchOnDetail: true });
            }
            if (!action) {
                return;
            }
            await (0, async_1.timeout)(50); // quick input is sensitive to being opened so soon after another
            const resource = editor_1.EditorResourceAccessor.getOriginalUri(activeEditorPane.input, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
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
            const picks = Object.keys(encoding_1.SUPPORTED_ENCODINGS)
                .sort((k1, k2) => {
                if (k1 === configuredEncoding) {
                    return -1;
                }
                else if (k2 === configuredEncoding) {
                    return 1;
                }
                return encoding_1.SUPPORTED_ENCODINGS[k1].order - encoding_1.SUPPORTED_ENCODINGS[k2].order;
            })
                .filter(k => {
                if (k === guessedEncoding && guessedEncoding !== configuredEncoding) {
                    return false; // do not show encoding if it is the guessed encoding that does not match the configured
                }
                return !isReopenWithEncoding || !encoding_1.SUPPORTED_ENCODINGS[k].encodeOnly; // hide those that can only be used for encoding if we are about to decode
            })
                .map((key, index) => {
                if (key === encodingSupport.getEncoding()) {
                    directMatchIndex = index;
                }
                else if (encoding_1.SUPPORTED_ENCODINGS[key].alias === encodingSupport.getEncoding()) {
                    aliasMatchIndex = index;
                }
                return { id: key, label: encoding_1.SUPPORTED_ENCODINGS[key].labelLong, description: key };
            });
            const items = picks.slice();
            // If we have a guessed encoding, show it first unless it matches the configured encoding
            if (guessedEncoding && configuredEncoding !== guessedEncoding && encoding_1.SUPPORTED_ENCODINGS[guessedEncoding]) {
                picks.unshift({ type: 'separator' });
                picks.unshift({ id: guessedEncoding, label: encoding_1.SUPPORTED_ENCODINGS[guessedEncoding].labelLong, description: (0, nls_1.localize)('guessedEncoding', "Guessed from content") });
            }
            const encoding = await quickInputService.pick(picks, {
                placeHolder: isReopenWithEncoding ? (0, nls_1.localize)('pickEncodingForReopen', "Select File Encoding to Reopen File") : (0, nls_1.localize)('pickEncodingForSave', "Select File Encoding to Save with"),
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
    exports.ChangeEncodingAction = ChangeEncodingAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yU3RhdHVzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2Jyb3dzZXIvcGFydHMvZWRpdG9yL2VkaXRvclN0YXR1cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBdURoRyxNQUFNLCtCQUErQjtRQUNwQyxZQUFvQixPQUF5QixFQUFVLFNBQTJCO1lBQTlELFlBQU8sR0FBUCxPQUFPLENBQWtCO1lBQVUsY0FBUyxHQUFULFNBQVMsQ0FBa0I7UUFBSSxDQUFDO1FBRXZGLFdBQVc7WUFDVixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxnREFBZ0Q7UUFDcEYsQ0FBQztRQUVELEtBQUssQ0FBQyxXQUFXLENBQUMsUUFBZ0IsRUFBRSxJQUFrQjtZQUNyRCxNQUFNLGdCQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFHLENBQUM7S0FDRDtJQUVELE1BQU0sK0JBQStCO1FBRXBDLFlBQW9CLE9BQXlCLEVBQVUsU0FBMkI7WUFBOUQsWUFBTyxHQUFQLE9BQU8sQ0FBa0I7WUFBVSxjQUFTLEdBQVQsU0FBUyxDQUFrQjtRQUFJLENBQUM7UUFFdkYsYUFBYSxDQUFDLFVBQWtCLEVBQUUsTUFBZTtZQUNoRCxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDNUYsQ0FB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