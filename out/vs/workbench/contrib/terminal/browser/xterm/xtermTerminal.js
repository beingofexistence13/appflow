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
define(["require", "exports", "vs/base/browser/dom", "vs/platform/configuration/common/configuration", "vs/base/common/lifecycle", "vs/platform/terminal/common/terminal", "vs/base/browser/browser", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/platform/notification/common/notification", "vs/workbench/contrib/terminal/browser/xterm/markNavigationAddon", "vs/nls", "vs/platform/theme/common/themeService", "vs/workbench/common/theme", "vs/workbench/contrib/terminal/common/terminalColorRegistry", "vs/platform/terminal/common/xterm/shellIntegrationAddon", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/terminal/browser/xterm/decorationAddon", "vs/base/common/event", "vs/platform/telemetry/common/telemetry", "vs/amdX", "vs/workbench/contrib/terminal/browser/xterm/suggestAddon", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/terminal/common/terminalContextKey", "vs/platform/clipboard/common/clipboardService", "vs/base/common/decorators", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/browser/mouseEvent"], function (require, exports, dom, configuration_1, lifecycle_1, terminal_1, browser_1, log_1, storage_1, notification_1, markNavigationAddon_1, nls_1, themeService_1, theme_1, terminalColorRegistry_1, shellIntegrationAddon_1, instantiation_1, decorationAddon_1, event_1, telemetry_1, amdX_1, suggestAddon_1, contextkey_1, terminalContextKey_1, clipboardService_1, decorators_1, scrollableElement_1, mouseEvent_1) {
    "use strict";
    var XtermTerminal_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getXtermScaledDimensions = exports.XtermTerminal = void 0;
    var RenderConstants;
    (function (RenderConstants) {
        /**
         * How long in milliseconds should an average frame take to render for a notification to appear
         * which suggests the fallback DOM-based renderer.
         */
        RenderConstants[RenderConstants["SlowCanvasRenderThreshold"] = 50] = "SlowCanvasRenderThreshold";
        RenderConstants[RenderConstants["NumberOfFramestoMeasure"] = 20] = "NumberOfFramestoMeasure";
        RenderConstants[RenderConstants["SmoothScrollDuration"] = 125] = "SmoothScrollDuration";
    })(RenderConstants || (RenderConstants = {}));
    let CanvasAddon;
    let ImageAddon;
    let SearchAddon;
    let SerializeAddon;
    let Unicode11Addon;
    let WebglAddon;
    function getFullBufferLineAsString(lineIndex, buffer) {
        let line = buffer.getLine(lineIndex);
        if (!line) {
            return { lineData: undefined, lineIndex };
        }
        let lineData = line.translateToString(true);
        while (lineIndex > 0 && line.isWrapped) {
            line = buffer.getLine(--lineIndex);
            if (!line) {
                break;
            }
            lineData = line.translateToString(false) + lineData;
        }
        return { lineData, lineIndex };
    }
    // DEBUG: This helper can be used to draw image data to the console, it's commented out as we don't
    //        want to ship it, but this is very useful for investigating texture atlas issues.
    // (console as any).image = (source: ImageData | HTMLCanvasElement, scale: number = 1) => {
    // 	function getBox(width: number, height: number) {
    // 		return {
    // 			string: '+',
    // 			style: 'font-size: 1px; padding: ' + Math.floor(height/2) + 'px ' + Math.floor(width/2) + 'px; line-height: ' + height + 'px;'
    // 		};
    // 	}
    // 	if (source instanceof HTMLCanvasElement) {
    // 		source = source.getContext('2d')?.getImageData(0, 0, source.width, source.height)!;
    // 	}
    // 	const canvas = document.createElement('canvas');
    // 	canvas.width = source.width;
    // 	canvas.height = source.height;
    // 	const ctx = canvas.getContext('2d')!;
    // 	ctx.putImageData(source, 0, 0);
    // 	const sw = source.width * scale;
    // 	const sh = source.height * scale;
    // 	const dim = getBox(sw, sh);
    // 	console.log(
    // 		`Image: ${source.width} x ${source.height}\n%c${dim.string}`,
    // 		`${dim.style}background: url(${canvas.toDataURL()}); background-size: ${sw}px ${sh}px; background-repeat: no-repeat; color: transparent;`
    // 	);
    // 	console.groupCollapsed('Zoomed');
    // 	console.log(
    // 		`%c${dim.string}`,
    // 		`${getBox(sw * 10, sh * 10).style}background: url(${canvas.toDataURL()}); background-size: ${sw * 10}px ${sh * 10}px; background-repeat: no-repeat; color: transparent; image-rendering: pixelated;-ms-interpolation-mode: nearest-neighbor;`
    // 	);
    // 	console.groupEnd();
    // };
    /**
     * Wraps the xterm object with additional functionality. Interaction with the backing process is out
     * of the scope of this class.
     */
    let XtermTerminal = class XtermTerminal extends lifecycle_1.Disposable {
        static { XtermTerminal_1 = this; }
        static { this._suggestedRendererType = undefined; }
        static { this._checkedWebglCompatible = false; }
        get findResult() { return this._lastFindResult; }
        get isStdinDisabled() { return !!this.raw.options.disableStdin; }
        get markTracker() { return this._markNavigationAddon; }
        get shellIntegration() { return this._shellIntegrationAddon; }
        get suggestController() { return this._suggestAddon; }
        get textureAtlas() {
            const canvas = this._webglAddon?.textureAtlas || this._canvasAddon?.textureAtlas;
            if (!canvas) {
                return undefined;
            }
            return createImageBitmap(canvas);
        }
        get isFocused() {
            return !!this.raw.element?.contains(document.activeElement);
        }
        /**
         * @param xtermCtor The xterm.js constructor, this is passed in so it can be fetched lazily
         * outside of this class such that {@link raw} is not nullable.
         */
        constructor(xtermCtor, _configHelper, cols, rows, _backgroundColorProvider, _capabilities, shellIntegrationNonce, _terminalSuggestWidgetVisibleContextKey, disableShellIntegrationReporting, _configurationService, _instantiationService, _logService, _notificationService, _storageService, _themeService, _telemetryService, _clipboardService, contextKeyService) {
            super();
            this._configHelper = _configHelper;
            this._backgroundColorProvider = _backgroundColorProvider;
            this._capabilities = _capabilities;
            this._terminalSuggestWidgetVisibleContextKey = _terminalSuggestWidgetVisibleContextKey;
            this._configurationService = _configurationService;
            this._instantiationService = _instantiationService;
            this._logService = _logService;
            this._notificationService = _notificationService;
            this._storageService = _storageService;
            this._themeService = _themeService;
            this._telemetryService = _telemetryService;
            this._clipboardService = _clipboardService;
            this._isPhysicalMouseWheel = scrollableElement_1.MouseWheelClassifier.INSTANCE.isPhysicalMouseWheel();
            this._attachedDisposables = this._register(new lifecycle_1.DisposableStore());
            this._onDidRequestRunCommand = this._register(new event_1.Emitter());
            this.onDidRequestRunCommand = this._onDidRequestRunCommand.event;
            this._onDidRequestFocus = this._register(new event_1.Emitter());
            this.onDidRequestFocus = this._onDidRequestFocus.event;
            this._onDidRequestSendText = this._register(new event_1.Emitter());
            this.onDidRequestSendText = this._onDidRequestSendText.event;
            this._onDidRequestFreePort = this._register(new event_1.Emitter());
            this.onDidRequestFreePort = this._onDidRequestFreePort.event;
            this._onDidChangeFindResults = this._register(new event_1.Emitter());
            this.onDidChangeFindResults = this._onDidChangeFindResults.event;
            this._onDidChangeSelection = this._register(new event_1.Emitter());
            this.onDidChangeSelection = this._onDidChangeSelection.event;
            this._onDidChangeFocus = this._register(new event_1.Emitter());
            this.onDidChangeFocus = this._onDidChangeFocus.event;
            this._onDidDispose = this._register(new event_1.Emitter());
            this.onDidDispose = this._onDidDispose.event;
            const font = this._configHelper.getFont(undefined, true);
            const config = this._configHelper.config;
            const editorOptions = this._configurationService.getValue('editor');
            this.raw = this._register(new xtermCtor({
                allowProposedApi: true,
                cols,
                rows,
                altClickMovesCursor: config.altClickMovesCursor && editorOptions.multiCursorModifier === 'alt',
                scrollback: config.scrollback,
                theme: this._getXtermTheme(),
                drawBoldTextInBrightColors: config.drawBoldTextInBrightColors,
                fontFamily: font.fontFamily,
                fontWeight: config.fontWeight,
                fontWeightBold: config.fontWeightBold,
                fontSize: font.fontSize,
                letterSpacing: font.letterSpacing,
                lineHeight: font.lineHeight,
                logLevel: vscodeToXtermLogLevel(this._logService.getLevel()),
                logger: this._logService,
                minimumContrastRatio: config.minimumContrastRatio,
                tabStopWidth: config.tabStopWidth,
                cursorBlink: config.cursorBlinking,
                cursorStyle: vscodeToXtermCursorStyle(config.cursorStyle),
                cursorInactiveStyle: vscodeToXtermCursorStyle(config.cursorStyleInactive),
                cursorWidth: config.cursorWidth,
                macOptionIsMeta: config.macOptionIsMeta,
                macOptionClickForcesSelection: config.macOptionClickForcesSelection,
                rightClickSelectsWord: config.rightClickBehavior === 'selectWord',
                fastScrollModifier: 'alt',
                fastScrollSensitivity: config.fastScrollSensitivity,
                scrollSensitivity: config.mouseWheelScrollSensitivity,
                wordSeparator: config.wordSeparators,
                overviewRulerWidth: 10,
                ignoreBracketedPasteMode: config.ignoreBracketedPasteMode
            }));
            this._updateSmoothScrolling();
            this._core = this.raw._core;
            this._register(this._configurationService.onDidChangeConfiguration(async (e) => {
                if (e.affectsConfiguration("terminal.integrated.gpuAcceleration" /* TerminalSettingId.GpuAcceleration */)) {
                    XtermTerminal_1._suggestedRendererType = undefined;
                }
                if (e.affectsConfiguration('terminal.integrated') || e.affectsConfiguration('editor.fastScrollSensitivity') || e.affectsConfiguration('editor.mouseWheelScrollSensitivity') || e.affectsConfiguration('editor.multiCursorModifier')) {
                    this.updateConfig();
                }
                if (e.affectsConfiguration("terminal.integrated.unicodeVersion" /* TerminalSettingId.UnicodeVersion */)) {
                    this._updateUnicodeVersion();
                }
            }));
            this._register(this._themeService.onDidColorThemeChange(theme => this._updateTheme(theme)));
            this._register(this._logService.onDidChangeLogLevel(e => this.raw.options.logLevel = vscodeToXtermLogLevel(e)));
            // Refire events
            this._register(this.raw.onSelectionChange(() => {
                this._onDidChangeSelection.fire();
                if (this.isFocused) {
                    this._anyFocusedTerminalHasSelection.set(this.raw.hasSelection());
                }
            }));
            // Load addons
            this._updateUnicodeVersion();
            this._markNavigationAddon = this._instantiationService.createInstance(markNavigationAddon_1.MarkNavigationAddon, _capabilities);
            this.raw.loadAddon(this._markNavigationAddon);
            this._decorationAddon = this._instantiationService.createInstance(decorationAddon_1.DecorationAddon, this._capabilities);
            this._register(this._decorationAddon.onDidRequestRunCommand(e => this._onDidRequestRunCommand.fire(e)));
            this.raw.loadAddon(this._decorationAddon);
            this._shellIntegrationAddon = new shellIntegrationAddon_1.ShellIntegrationAddon(shellIntegrationNonce, disableShellIntegrationReporting, this._telemetryService, this._logService);
            this.raw.loadAddon(this._shellIntegrationAddon);
            this._anyTerminalFocusContextKey = terminalContextKey_1.TerminalContextKeys.focusInAny.bindTo(contextKeyService);
            this._anyFocusedTerminalHasSelection = terminalContextKey_1.TerminalContextKeys.textSelectedInFocused.bindTo(contextKeyService);
            // Load the suggest addon, this should be loaded regardless of the setting as the sequences
            // may still come in
            if (this._terminalSuggestWidgetVisibleContextKey) {
                this._suggestAddon = this._register(this._instantiationService.createInstance(suggestAddon_1.SuggestAddon, this._terminalSuggestWidgetVisibleContextKey));
                this.raw.loadAddon(this._suggestAddon);
                this._register(this._suggestAddon.onAcceptedCompletion(async (text) => {
                    this._onDidRequestFocus.fire();
                    this._onDidRequestSendText.fire(text);
                }));
            }
        }
        *getBufferReverseIterator() {
            for (let i = this.raw.buffer.active.length; i >= 0; i--) {
                const { lineData, lineIndex } = getFullBufferLineAsString(i, this.raw.buffer.active);
                if (lineData) {
                    i = lineIndex;
                    yield lineData;
                }
            }
        }
        async getContentsAsHtml() {
            if (!this._serializeAddon) {
                const Addon = await this._getSerializeAddonConstructor();
                this._serializeAddon = new Addon();
                this.raw.loadAddon(this._serializeAddon);
            }
            return this._serializeAddon.serializeAsHTML();
        }
        async getSelectionAsHtml(command) {
            if (!this._serializeAddon) {
                const Addon = await this._getSerializeAddonConstructor();
                this._serializeAddon = new Addon();
                this.raw.loadAddon(this._serializeAddon);
            }
            if (command) {
                const length = command.getOutput()?.length;
                const row = command.marker?.line;
                if (!length || !row) {
                    throw new Error(`No row ${row} or output length ${length} for command ${command}`);
                }
                this.raw.select(0, row + 1, length - Math.floor(length / this.raw.cols));
            }
            const result = this._serializeAddon.serializeAsHTML({ onlySelection: true });
            if (command) {
                this.raw.clearSelection();
            }
            return result;
        }
        attachToElement(container, partialOptions) {
            const options = { enableGpu: true, ...partialOptions };
            if (!this._attached) {
                this.raw.open(container);
            }
            // TODO: Move before open to the DOM renderer doesn't initialize
            if (options.enableGpu) {
                if (this._shouldLoadWebgl()) {
                    this._enableWebglRenderer();
                }
                else if (this._shouldLoadCanvas()) {
                    this._enableCanvasRenderer();
                }
            }
            if (!this.raw.element || !this.raw.textarea) {
                throw new Error('xterm elements not set after open');
            }
            const ad = this._attachedDisposables;
            ad.clear();
            ad.add(dom.addDisposableListener(this.raw.textarea, 'focus', () => this._setFocused(true)));
            ad.add(dom.addDisposableListener(this.raw.textarea, 'blur', () => this._setFocused(false)));
            ad.add(dom.addDisposableListener(this.raw.textarea, 'focusout', () => this._setFocused(false)));
            // Track wheel events in mouse wheel classifier and update smoothScrolling when it changes
            // as it must be disabled when a trackpad is used
            ad.add(dom.addDisposableListener(this.raw.element, dom.EventType.MOUSE_WHEEL, (e) => {
                const classifier = scrollableElement_1.MouseWheelClassifier.INSTANCE;
                classifier.acceptStandardWheelEvent(new mouseEvent_1.StandardWheelEvent(e));
                const value = classifier.isPhysicalMouseWheel();
                if (value !== this._isPhysicalMouseWheel) {
                    this._isPhysicalMouseWheel = value;
                    this._updateSmoothScrolling();
                }
            }, { passive: true }));
            this._suggestAddon?.setContainer(container);
            this._attached = { container, options };
            // Screen must be created at this point as xterm.open is called
            return this._attached?.container.querySelector('.xterm-screen');
        }
        _setFocused(isFocused) {
            this._onDidChangeFocus.fire(isFocused);
            this._anyTerminalFocusContextKey.set(isFocused);
            this._anyFocusedTerminalHasSelection.set(isFocused && this.raw.hasSelection());
        }
        write(data, callback) {
            this.raw.write(data, callback);
        }
        resize(columns, rows) {
            this.raw.resize(columns, rows);
        }
        updateConfig() {
            const config = this._configHelper.config;
            this.raw.options.altClickMovesCursor = config.altClickMovesCursor;
            this._setCursorBlink(config.cursorBlinking);
            this._setCursorStyle(config.cursorStyle);
            this._setCursorStyleInactive(config.cursorStyleInactive);
            this._setCursorWidth(config.cursorWidth);
            this.raw.options.scrollback = config.scrollback;
            this.raw.options.drawBoldTextInBrightColors = config.drawBoldTextInBrightColors;
            this.raw.options.minimumContrastRatio = config.minimumContrastRatio;
            this.raw.options.tabStopWidth = config.tabStopWidth;
            this.raw.options.fastScrollSensitivity = config.fastScrollSensitivity;
            this.raw.options.scrollSensitivity = config.mouseWheelScrollSensitivity;
            this.raw.options.macOptionIsMeta = config.macOptionIsMeta;
            const editorOptions = this._configurationService.getValue('editor');
            this.raw.options.altClickMovesCursor = config.altClickMovesCursor && editorOptions.multiCursorModifier === 'alt';
            this.raw.options.macOptionClickForcesSelection = config.macOptionClickForcesSelection;
            this.raw.options.rightClickSelectsWord = config.rightClickBehavior === 'selectWord';
            this.raw.options.wordSeparator = config.wordSeparators;
            this.raw.options.customGlyphs = config.customGlyphs;
            this.raw.options.ignoreBracketedPasteMode = config.ignoreBracketedPasteMode;
            this._updateSmoothScrolling();
            if (this._attached?.options.enableGpu) {
                if (this._shouldLoadWebgl()) {
                    this._enableWebglRenderer();
                }
                else {
                    this._disposeOfWebglRenderer();
                    if (this._shouldLoadCanvas()) {
                        this._enableCanvasRenderer();
                    }
                    else {
                        this._disposeOfCanvasRenderer();
                    }
                }
            }
        }
        _updateSmoothScrolling() {
            this.raw.options.smoothScrollDuration = this._configHelper.config.smoothScrolling && this._isPhysicalMouseWheel ? 125 /* RenderConstants.SmoothScrollDuration */ : 0;
        }
        _shouldLoadWebgl() {
            return !browser_1.isSafari && (this._configHelper.config.gpuAcceleration === 'auto' && XtermTerminal_1._suggestedRendererType === undefined) || this._configHelper.config.gpuAcceleration === 'on';
        }
        _shouldLoadCanvas() {
            return (this._configHelper.config.gpuAcceleration === 'auto' && (XtermTerminal_1._suggestedRendererType === undefined || XtermTerminal_1._suggestedRendererType === 'canvas')) || this._configHelper.config.gpuAcceleration === 'canvas';
        }
        forceRedraw() {
            this.raw.clearTextureAtlas();
        }
        clearDecorations() {
            this._decorationAddon?.clearDecorations();
        }
        forceRefresh() {
            this._core.viewport?._innerRefresh();
        }
        forceUnpause() {
            // HACK: Force the renderer to unpause by simulating an IntersectionObserver event.
            // This is to fix an issue where dragging the windpow to the top of the screen to
            // maximize on Windows/Linux would fire an event saying that the terminal was not
            // visible.
            if (!!this._canvasAddon) {
                this._core._renderService?._handleIntersectionChange({ intersectionRatio: 1 });
                // HACK: Force a refresh of the screen to ensure links are refresh corrected.
                // This can probably be removed when the above hack is fixed in Chromium.
                this.raw.refresh(0, this.raw.rows - 1);
            }
        }
        async findNext(term, searchOptions) {
            this._updateFindColors(searchOptions);
            return (await this._getSearchAddon()).findNext(term, searchOptions);
        }
        async findPrevious(term, searchOptions) {
            this._updateFindColors(searchOptions);
            return (await this._getSearchAddon()).findPrevious(term, searchOptions);
        }
        _updateFindColors(searchOptions) {
            const theme = this._themeService.getColorTheme();
            // Theme color names align with monaco/vscode whereas xterm.js has some different naming.
            // The mapping is as follows:
            // - findMatch -> activeMatch
            // - findMatchHighlight -> match
            const terminalBackground = theme.getColor(terminalColorRegistry_1.TERMINAL_BACKGROUND_COLOR) || theme.getColor(theme_1.PANEL_BACKGROUND);
            const findMatchBackground = theme.getColor(terminalColorRegistry_1.TERMINAL_FIND_MATCH_BACKGROUND_COLOR);
            const findMatchBorder = theme.getColor(terminalColorRegistry_1.TERMINAL_FIND_MATCH_BORDER_COLOR);
            const findMatchOverviewRuler = theme.getColor(terminalColorRegistry_1.TERMINAL_OVERVIEW_RULER_CURSOR_FOREGROUND_COLOR);
            const findMatchHighlightBackground = theme.getColor(terminalColorRegistry_1.TERMINAL_FIND_MATCH_HIGHLIGHT_BACKGROUND_COLOR);
            const findMatchHighlightBorder = theme.getColor(terminalColorRegistry_1.TERMINAL_FIND_MATCH_HIGHLIGHT_BORDER_COLOR);
            const findMatchHighlightOverviewRuler = theme.getColor(terminalColorRegistry_1.TERMINAL_OVERVIEW_RULER_FIND_MATCH_FOREGROUND_COLOR);
            searchOptions.decorations = {
                activeMatchBackground: findMatchBackground?.toString(),
                activeMatchBorder: findMatchBorder?.toString() || 'transparent',
                activeMatchColorOverviewRuler: findMatchOverviewRuler?.toString() || 'transparent',
                // decoration bgs don't support the alpha channel so blend it with the regular bg
                matchBackground: terminalBackground ? findMatchHighlightBackground?.blend(terminalBackground).toString() : undefined,
                matchBorder: findMatchHighlightBorder?.toString() || 'transparent',
                matchOverviewRuler: findMatchHighlightOverviewRuler?.toString() || 'transparent'
            };
        }
        _getSearchAddon() {
            if (!this._searchAddonPromise) {
                this._searchAddonPromise = this._getSearchAddonConstructor().then((AddonCtor) => {
                    this._searchAddon = new AddonCtor({ highlightLimit: 1000 /* XtermTerminalConstants.SearchHighlightLimit */ });
                    this.raw.loadAddon(this._searchAddon);
                    this._searchAddon.onDidChangeResults((results) => {
                        this._lastFindResult = results;
                        this._onDidChangeFindResults.fire(results);
                    });
                    return this._searchAddon;
                });
            }
            return this._searchAddonPromise;
        }
        clearSearchDecorations() {
            this._searchAddon?.clearDecorations();
        }
        clearActiveSearchDecoration() {
            this._searchAddon?.clearActiveDecoration();
        }
        getFont() {
            return this._configHelper.getFont(this._core);
        }
        getLongestViewportWrappedLineLength() {
            let maxLineLength = 0;
            for (let i = this.raw.buffer.active.length - 1; i >= this.raw.buffer.active.viewportY; i--) {
                const lineInfo = this._getWrappedLineCount(i, this.raw.buffer.active);
                maxLineLength = Math.max(maxLineLength, ((lineInfo.lineCount * this.raw.cols) - lineInfo.endSpaces) || 0);
                i = lineInfo.currentIndex;
            }
            return maxLineLength;
        }
        _getWrappedLineCount(index, buffer) {
            let line = buffer.getLine(index);
            if (!line) {
                throw new Error('Could not get line');
            }
            let currentIndex = index;
            let endSpaces = 0;
            // line.length may exceed cols as it doesn't necessarily trim the backing array on resize
            for (let i = Math.min(line.length, this.raw.cols) - 1; i >= 0; i--) {
                if (!line?.getCell(i)?.getChars()) {
                    endSpaces++;
                }
                else {
                    break;
                }
            }
            while (line?.isWrapped && currentIndex > 0) {
                currentIndex--;
                line = buffer.getLine(currentIndex);
            }
            return { lineCount: index - currentIndex + 1, currentIndex, endSpaces };
        }
        scrollDownLine() {
            this.raw.scrollLines(1);
        }
        scrollDownPage() {
            this.raw.scrollPages(1);
        }
        scrollToBottom() {
            this.raw.scrollToBottom();
        }
        scrollUpLine() {
            this.raw.scrollLines(-1);
        }
        scrollUpPage() {
            this.raw.scrollPages(-1);
        }
        scrollToTop() {
            this.raw.scrollToTop();
        }
        clearBuffer() {
            this.raw.clear();
            // xterm.js does not clear the first prompt, so trigger these to simulate
            // the prompt being written
            this._capabilities.get(2 /* TerminalCapability.CommandDetection */)?.handlePromptStart();
            this._capabilities.get(2 /* TerminalCapability.CommandDetection */)?.handleCommandStart();
        }
        hasSelection() {
            return this.raw.hasSelection();
        }
        clearSelection() {
            this.raw.clearSelection();
        }
        selectMarkedRange(fromMarkerId, toMarkerId, scrollIntoView = false) {
            const detectionCapability = this.shellIntegration.capabilities.get(4 /* TerminalCapability.BufferMarkDetection */);
            if (!detectionCapability) {
                return;
            }
            const start = detectionCapability.getMark(fromMarkerId);
            const end = detectionCapability.getMark(toMarkerId);
            if (start === undefined || end === undefined) {
                return;
            }
            this.raw.selectLines(start.line, end.line);
            if (scrollIntoView) {
                this.raw.scrollToLine(start.line);
            }
        }
        selectAll() {
            this.raw.focus();
            this.raw.selectAll();
        }
        focus() {
            this.raw.focus();
        }
        async copySelection(asHtml, command) {
            if (this.hasSelection() || (asHtml && command)) {
                if (asHtml) {
                    const textAsHtml = await this.getSelectionAsHtml(command);
                    function listener(e) {
                        if (!e.clipboardData.types.includes('text/plain')) {
                            e.clipboardData.setData('text/plain', command?.getOutput() ?? '');
                        }
                        e.clipboardData.setData('text/html', textAsHtml);
                        e.preventDefault();
                    }
                    document.addEventListener('copy', listener);
                    document.execCommand('copy');
                    document.removeEventListener('copy', listener);
                }
                else {
                    await this._clipboardService.writeText(this.raw.getSelection());
                }
            }
            else {
                this._notificationService.warn((0, nls_1.localize)('terminal.integrated.copySelection.noSelection', 'The terminal has no selection to copy'));
            }
        }
        _setCursorBlink(blink) {
            if (this.raw.options.cursorBlink !== blink) {
                this.raw.options.cursorBlink = blink;
                this.raw.refresh(0, this.raw.rows - 1);
            }
        }
        _setCursorStyle(style) {
            const mapped = vscodeToXtermCursorStyle(style);
            if (this.raw.options.cursorStyle !== mapped) {
                this.raw.options.cursorStyle = mapped;
            }
        }
        _setCursorStyleInactive(style) {
            const mapped = vscodeToXtermCursorStyle(style);
            if (this.raw.options.cursorInactiveStyle !== mapped) {
                this.raw.options.cursorInactiveStyle = mapped;
            }
        }
        _setCursorWidth(width) {
            if (this.raw.options.cursorWidth !== width) {
                this.raw.options.cursorWidth = width;
            }
        }
        async _enableWebglRenderer() {
            if (!this.raw.element || this._webglAddon) {
                return;
            }
            // Check if the the WebGL renderer is compatible with xterm.js:
            // - https://github.com/microsoft/vscode/issues/190195
            // - https://github.com/xtermjs/xterm.js/issues/4665
            // - https://bugs.chromium.org/p/chromium/issues/detail?id=1476475
            if (!XtermTerminal_1._checkedWebglCompatible) {
                XtermTerminal_1._checkedWebglCompatible = true;
                const checkCanvas = document.createElement('canvas');
                const checkGl = checkCanvas.getContext('webgl2');
                const debugInfo = checkGl?.getExtension('WEBGL_debug_renderer_info');
                if (checkGl && debugInfo) {
                    const renderer = checkGl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                    if (renderer.startsWith('ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)')) {
                        this._disableWebglForThisSession();
                        return;
                    }
                }
            }
            const Addon = await this._getWebglAddonConstructor();
            this._webglAddon = new Addon();
            this._disposeOfCanvasRenderer();
            try {
                this.raw.loadAddon(this._webglAddon);
                this._logService.trace('Webgl was loaded');
                this._webglAddon.onContextLoss(() => {
                    this._logService.info(`Webgl lost context, disposing of webgl renderer`);
                    this._disposeOfWebglRenderer();
                });
                this._refreshImageAddon();
                // Uncomment to add the texture atlas to the DOM
                // setTimeout(() => {
                // 	if (this._webglAddon?.textureAtlas) {
                // 		document.body.appendChild(this._webglAddon?.textureAtlas);
                // 	}
                // }, 5000);
            }
            catch (e) {
                this._logService.warn(`Webgl could not be loaded. Falling back to the canvas renderer type.`, e);
                const neverMeasureRenderTime = this._storageService.getBoolean("terminal.integrated.neverMeasureRenderTime" /* TerminalStorageKeys.NeverMeasureRenderTime */, -1 /* StorageScope.APPLICATION */, false);
                // if it's already set to dom, no need to measure render time
                if (!neverMeasureRenderTime && this._configHelper.config.gpuAcceleration !== 'off') {
                    this._measureRenderTime();
                }
                this._disableWebglForThisSession();
            }
        }
        _disableWebglForThisSession() {
            XtermTerminal_1._suggestedRendererType = 'canvas';
            this._disposeOfWebglRenderer();
            this._enableCanvasRenderer();
        }
        async _enableCanvasRenderer() {
            if (!this.raw.element || this._canvasAddon) {
                return;
            }
            const Addon = await this._getCanvasAddonConstructor();
            this._canvasAddon = new Addon();
            this._disposeOfWebglRenderer();
            try {
                this.raw.loadAddon(this._canvasAddon);
                this._logService.trace('Canvas renderer was loaded');
            }
            catch (e) {
                this._logService.warn(`Canvas renderer could not be loaded, falling back to dom renderer`, e);
                const neverMeasureRenderTime = this._storageService.getBoolean("terminal.integrated.neverMeasureRenderTime" /* TerminalStorageKeys.NeverMeasureRenderTime */, -1 /* StorageScope.APPLICATION */, false);
                // if it's already set to dom, no need to measure render time
                if (!neverMeasureRenderTime && this._configHelper.config.gpuAcceleration !== 'off') {
                    this._measureRenderTime();
                }
                XtermTerminal_1._suggestedRendererType = 'dom';
                this._disposeOfCanvasRenderer();
            }
            this._refreshImageAddon();
        }
        async _getCanvasAddonConstructor() {
            if (!CanvasAddon) {
                CanvasAddon = (await (0, amdX_1.importAMDNodeModule)('xterm-addon-canvas', 'lib/xterm-addon-canvas.js')).CanvasAddon;
            }
            return CanvasAddon;
        }
        async _refreshImageAddon() {
            // Only allow the image addon when a canvas is being used to avoid possible GPU issues
            if (this._configHelper.config.enableImages && (this._canvasAddon || this._webglAddon)) {
                if (!this._imageAddon) {
                    const AddonCtor = await this._getImageAddonConstructor();
                    this._imageAddon = new AddonCtor();
                    this.raw.loadAddon(this._imageAddon);
                }
            }
            else {
                try {
                    this._imageAddon?.dispose();
                }
                catch {
                    // ignore
                }
                this._imageAddon = undefined;
            }
        }
        async _getImageAddonConstructor() {
            if (!ImageAddon) {
                ImageAddon = (await (0, amdX_1.importAMDNodeModule)('xterm-addon-image', 'lib/xterm-addon-image.js')).ImageAddon;
            }
            return ImageAddon;
        }
        async _getSearchAddonConstructor() {
            if (!SearchAddon) {
                SearchAddon = (await (0, amdX_1.importAMDNodeModule)('xterm-addon-search', 'lib/xterm-addon-search.js')).SearchAddon;
            }
            return SearchAddon;
        }
        async _getUnicode11Constructor() {
            if (!Unicode11Addon) {
                Unicode11Addon = (await (0, amdX_1.importAMDNodeModule)('xterm-addon-unicode11', 'lib/xterm-addon-unicode11.js')).Unicode11Addon;
            }
            return Unicode11Addon;
        }
        async _getWebglAddonConstructor() {
            if (!WebglAddon) {
                WebglAddon = (await (0, amdX_1.importAMDNodeModule)('xterm-addon-webgl', 'lib/xterm-addon-webgl.js')).WebglAddon;
            }
            return WebglAddon;
        }
        async _getSerializeAddonConstructor() {
            if (!SerializeAddon) {
                SerializeAddon = (await (0, amdX_1.importAMDNodeModule)('xterm-addon-serialize', 'lib/xterm-addon-serialize.js')).SerializeAddon;
            }
            return SerializeAddon;
        }
        _disposeOfCanvasRenderer() {
            try {
                this._canvasAddon?.dispose();
            }
            catch {
                // ignore
            }
            this._canvasAddon = undefined;
            this._refreshImageAddon();
        }
        _disposeOfWebglRenderer() {
            try {
                this._webglAddon?.dispose();
            }
            catch {
                // ignore
            }
            this._webglAddon = undefined;
            this._refreshImageAddon();
        }
        async _measureRenderTime() {
            const frameTimes = [];
            if (!this._core._renderService?._renderer._renderLayers) {
                return;
            }
            const textRenderLayer = this._core._renderService._renderer._renderLayers[0];
            const originalOnGridChanged = textRenderLayer?.onGridChanged;
            const evaluateCanvasRenderer = () => {
                // Discard first frame time as it's normal to take longer
                frameTimes.shift();
                const medianTime = frameTimes.sort((a, b) => a - b)[Math.floor(frameTimes.length / 2)];
                if (medianTime > 50 /* RenderConstants.SlowCanvasRenderThreshold */) {
                    if (this._configHelper.config.gpuAcceleration === 'auto') {
                        XtermTerminal_1._suggestedRendererType = 'dom';
                        this.updateConfig();
                    }
                    else {
                        const promptChoices = [
                            {
                                label: (0, nls_1.localize)('yes', "Yes"),
                                run: () => this._configurationService.updateValue("terminal.integrated.gpuAcceleration" /* TerminalSettingId.GpuAcceleration */, 'off', 2 /* ConfigurationTarget.USER */)
                            },
                            {
                                label: (0, nls_1.localize)('no', "No"),
                                run: () => { }
                            },
                            {
                                label: (0, nls_1.localize)('dontShowAgain', "Don't Show Again"),
                                isSecondary: true,
                                run: () => this._storageService.store("terminal.integrated.neverMeasureRenderTime" /* TerminalStorageKeys.NeverMeasureRenderTime */, true, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */)
                            }
                        ];
                        this._notificationService.prompt(notification_1.Severity.Warning, (0, nls_1.localize)('terminal.slowRendering', 'Terminal GPU acceleration appears to be slow on your computer. Would you like to switch to disable it which may improve performance? [Read more about terminal settings](https://code.visualstudio.com/docs/editor/integrated-terminal#_changing-how-the-terminal-is-rendered).'), promptChoices);
                    }
                }
            };
            textRenderLayer.onGridChanged = (terminal, firstRow, lastRow) => {
                const startTime = performance.now();
                originalOnGridChanged.call(textRenderLayer, terminal, firstRow, lastRow);
                frameTimes.push(performance.now() - startTime);
                if (frameTimes.length === 20 /* RenderConstants.NumberOfFramestoMeasure */) {
                    evaluateCanvasRenderer();
                    // Restore original function
                    textRenderLayer.onGridChanged = originalOnGridChanged;
                }
            };
        }
        _getXtermTheme(theme) {
            if (!theme) {
                theme = this._themeService.getColorTheme();
            }
            const foregroundColor = theme.getColor(terminalColorRegistry_1.TERMINAL_FOREGROUND_COLOR);
            const backgroundColor = this._backgroundColorProvider.getBackgroundColor(theme);
            const cursorColor = theme.getColor(terminalColorRegistry_1.TERMINAL_CURSOR_FOREGROUND_COLOR) || foregroundColor;
            const cursorAccentColor = theme.getColor(terminalColorRegistry_1.TERMINAL_CURSOR_BACKGROUND_COLOR) || backgroundColor;
            const selectionBackgroundColor = theme.getColor(terminalColorRegistry_1.TERMINAL_SELECTION_BACKGROUND_COLOR);
            const selectionInactiveBackgroundColor = theme.getColor(terminalColorRegistry_1.TERMINAL_INACTIVE_SELECTION_BACKGROUND_COLOR);
            const selectionForegroundColor = theme.getColor(terminalColorRegistry_1.TERMINAL_SELECTION_FOREGROUND_COLOR) || undefined;
            return {
                background: backgroundColor?.toString(),
                foreground: foregroundColor?.toString(),
                cursor: cursorColor?.toString(),
                cursorAccent: cursorAccentColor?.toString(),
                selectionBackground: selectionBackgroundColor?.toString(),
                selectionInactiveBackground: selectionInactiveBackgroundColor?.toString(),
                selectionForeground: selectionForegroundColor?.toString(),
                black: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[0])?.toString(),
                red: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[1])?.toString(),
                green: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[2])?.toString(),
                yellow: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[3])?.toString(),
                blue: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[4])?.toString(),
                magenta: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[5])?.toString(),
                cyan: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[6])?.toString(),
                white: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[7])?.toString(),
                brightBlack: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[8])?.toString(),
                brightRed: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[9])?.toString(),
                brightGreen: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[10])?.toString(),
                brightYellow: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[11])?.toString(),
                brightBlue: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[12])?.toString(),
                brightMagenta: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[13])?.toString(),
                brightCyan: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[14])?.toString(),
                brightWhite: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[15])?.toString()
            };
        }
        _updateTheme(theme) {
            this.raw.options.theme = this._getXtermTheme(theme);
        }
        refresh() {
            this._updateTheme();
            this._decorationAddon.refreshLayouts();
        }
        async _updateUnicodeVersion() {
            if (!this._unicode11Addon && this._configHelper.config.unicodeVersion === '11') {
                const Addon = await this._getUnicode11Constructor();
                this._unicode11Addon = new Addon();
                this.raw.loadAddon(this._unicode11Addon);
            }
            if (this.raw.unicode.activeVersion !== this._configHelper.config.unicodeVersion) {
                this.raw.unicode.activeVersion = this._configHelper.config.unicodeVersion;
            }
        }
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _writeText(data) {
            this.raw.write(data);
        }
        dispose() {
            this._anyTerminalFocusContextKey.reset();
            this._anyFocusedTerminalHasSelection.reset();
            this._onDidDispose.fire();
            super.dispose();
        }
    };
    exports.XtermTerminal = XtermTerminal;
    __decorate([
        (0, decorators_1.debounce)(100)
    ], XtermTerminal.prototype, "_refreshImageAddon", null);
    exports.XtermTerminal = XtermTerminal = XtermTerminal_1 = __decorate([
        __param(9, configuration_1.IConfigurationService),
        __param(10, instantiation_1.IInstantiationService),
        __param(11, terminal_1.ITerminalLogService),
        __param(12, notification_1.INotificationService),
        __param(13, storage_1.IStorageService),
        __param(14, themeService_1.IThemeService),
        __param(15, telemetry_1.ITelemetryService),
        __param(16, clipboardService_1.IClipboardService),
        __param(17, contextkey_1.IContextKeyService)
    ], XtermTerminal);
    function getXtermScaledDimensions(font, width, height) {
        if (!font.charWidth || !font.charHeight) {
            return null;
        }
        // Because xterm.js converts from CSS pixels to actual pixels through
        // the use of canvas, window.devicePixelRatio needs to be used here in
        // order to be precise. font.charWidth/charHeight alone as insufficient
        // when window.devicePixelRatio changes.
        const scaledWidthAvailable = width * window.devicePixelRatio;
        const scaledCharWidth = font.charWidth * window.devicePixelRatio + font.letterSpacing;
        const cols = Math.max(Math.floor(scaledWidthAvailable / scaledCharWidth), 1);
        const scaledHeightAvailable = height * window.devicePixelRatio;
        const scaledCharHeight = Math.ceil(font.charHeight * window.devicePixelRatio);
        const scaledLineHeight = Math.floor(scaledCharHeight * font.lineHeight);
        const rows = Math.max(Math.floor(scaledHeightAvailable / scaledLineHeight), 1);
        return { rows, cols };
    }
    exports.getXtermScaledDimensions = getXtermScaledDimensions;
    function vscodeToXtermLogLevel(logLevel) {
        switch (logLevel) {
            case log_1.LogLevel.Trace: return 'trace';
            case log_1.LogLevel.Debug: return 'debug';
            case log_1.LogLevel.Info: return 'info';
            case log_1.LogLevel.Warning: return 'warn';
            case log_1.LogLevel.Error: return 'error';
            default: return 'off';
        }
    }
    function vscodeToXtermCursorStyle(style) {
        // 'line' is used instead of bar in VS Code to be consistent with editor.cursorStyle
        if (style === 'line') {
            return 'bar';
        }
        return style;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieHRlcm1UZXJtaW5hbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsL2Jyb3dzZXIveHRlcm0veHRlcm1UZXJtaW5hbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBMkNoRyxJQUFXLGVBUVY7SUFSRCxXQUFXLGVBQWU7UUFDekI7OztXQUdHO1FBQ0gsZ0dBQThCLENBQUE7UUFDOUIsNEZBQTRCLENBQUE7UUFDNUIsdUZBQTBCLENBQUE7SUFDM0IsQ0FBQyxFQVJVLGVBQWUsS0FBZixlQUFlLFFBUXpCO0lBRUQsSUFBSSxXQUFtQyxDQUFDO0lBQ3hDLElBQUksVUFBaUMsQ0FBQztJQUN0QyxJQUFJLFdBQW1DLENBQUM7SUFDeEMsSUFBSSxjQUF5QyxDQUFDO0lBQzlDLElBQUksY0FBeUMsQ0FBQztJQUM5QyxJQUFJLFVBQWlDLENBQUM7SUFFdEMsU0FBUyx5QkFBeUIsQ0FBQyxTQUFpQixFQUFFLE1BQWU7UUFDcEUsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ1YsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLENBQUM7U0FDMUM7UUFDRCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUMsT0FBTyxTQUFTLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDdkMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUNuQyxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNWLE1BQU07YUFDTjtZQUNELFFBQVEsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FB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