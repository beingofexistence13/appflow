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
define(["require", "exports", "vs/base/browser/dom", "vs/platform/configuration/common/configuration", "vs/base/common/lifecycle", "vs/platform/terminal/common/terminal", "vs/base/browser/browser", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/platform/notification/common/notification", "vs/workbench/contrib/terminal/browser/xterm/markNavigationAddon", "vs/nls!vs/workbench/contrib/terminal/browser/xterm/xtermTerminal", "vs/platform/theme/common/themeService", "vs/workbench/common/theme", "vs/workbench/contrib/terminal/common/terminalColorRegistry", "vs/platform/terminal/common/xterm/shellIntegrationAddon", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/terminal/browser/xterm/decorationAddon", "vs/base/common/event", "vs/platform/telemetry/common/telemetry", "vs/amdX", "vs/workbench/contrib/terminal/browser/xterm/suggestAddon", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/terminal/common/terminalContextKey", "vs/platform/clipboard/common/clipboardService", "vs/base/common/decorators", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/browser/mouseEvent"], function (require, exports, dom, configuration_1, lifecycle_1, terminal_1, browser_1, log_1, storage_1, notification_1, markNavigationAddon_1, nls_1, themeService_1, theme_1, terminalColorRegistry_1, shellIntegrationAddon_1, instantiation_1, decorationAddon_1, event_1, telemetry_1, amdX_1, suggestAddon_1, contextkey_1, terminalContextKey_1, clipboardService_1, decorators_1, scrollableElement_1, mouseEvent_1) {
    "use strict";
    var $Kib_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Lib = exports.$Kib = void 0;
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
    let $Kib = class $Kib extends lifecycle_1.$kc {
        static { $Kib_1 = this; }
        static { this.f = undefined; }
        static { this.g = false; }
        get findResult() { return this.H; }
        get isStdinDisabled() { return !!this.raw.options.disableStdin; }
        get markTracker() { return this.m; }
        get shellIntegration() { return this.n; }
        get suggestController() { return this.s; }
        get textureAtlas() {
            const canvas = this.y?.textureAtlas || this.t?.textureAtlas;
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
        constructor(xtermCtor, R, cols, rows, S, U, shellIntegrationNonce, W, disableShellIntegrationReporting, X, Y, Z, $, ab, bb, cb, db, contextKeyService) {
            super();
            this.R = R;
            this.S = S;
            this.U = U;
            this.W = W;
            this.X = X;
            this.Y = Y;
            this.Z = Z;
            this.$ = $;
            this.ab = ab;
            this.bb = bb;
            this.cb = cb;
            this.db = db;
            this.j = scrollableElement_1.$QP.INSTANCE.isPhysicalMouseWheel();
            this.D = this.B(new lifecycle_1.$jc());
            this.I = this.B(new event_1.$fd());
            this.onDidRequestRunCommand = this.I.event;
            this.J = this.B(new event_1.$fd());
            this.onDidRequestFocus = this.J.event;
            this.L = this.B(new event_1.$fd());
            this.onDidRequestSendText = this.L.event;
            this.M = this.B(new event_1.$fd());
            this.onDidRequestFreePort = this.M.event;
            this.N = this.B(new event_1.$fd());
            this.onDidChangeFindResults = this.N.event;
            this.O = this.B(new event_1.$fd());
            this.onDidChangeSelection = this.O.event;
            this.P = this.B(new event_1.$fd());
            this.onDidChangeFocus = this.P.event;
            this.Q = this.B(new event_1.$fd());
            this.onDidDispose = this.Q.event;
            const font = this.R.getFont(undefined, true);
            const config = this.R.config;
            const editorOptions = this.X.getValue('editor');
            this.raw = this.B(new xtermCtor({
                allowProposedApi: true,
                cols,
                rows,
                altClickMovesCursor: config.altClickMovesCursor && editorOptions.multiCursorModifier === 'alt',
                scrollback: config.scrollback,
                theme: this.Db(),
                drawBoldTextInBrightColors: config.drawBoldTextInBrightColors,
                fontFamily: font.fontFamily,
                fontWeight: config.fontWeight,
                fontWeightBold: config.fontWeightBold,
                fontSize: font.fontSize,
                letterSpacing: font.letterSpacing,
                lineHeight: font.lineHeight,
                logLevel: vscodeToXtermLogLevel(this.Z.getLevel()),
                logger: this.Z,
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
            this.fb();
            this.c = this.raw._core;
            this.B(this.X.onDidChangeConfiguration(async (e) => {
                if (e.affectsConfiguration("terminal.integrated.gpuAcceleration" /* TerminalSettingId.GpuAcceleration */)) {
                    $Kib_1.f = undefined;
                }
                if (e.affectsConfiguration('terminal.integrated') || e.affectsConfiguration('editor.fastScrollSensitivity') || e.affectsConfiguration('editor.mouseWheelScrollSensitivity') || e.affectsConfiguration('editor.multiCursorModifier')) {
                    this.updateConfig();
                }
                if (e.affectsConfiguration("terminal.integrated.unicodeVersion" /* TerminalSettingId.UnicodeVersion */)) {
                    this.Fb();
                }
            }));
            this.B(this.bb.onDidColorThemeChange(theme => this.Eb(theme)));
            this.B(this.Z.onDidChangeLogLevel(e => this.raw.options.logLevel = vscodeToXtermLogLevel(e)));
            // Refire events
            this.B(this.raw.onSelectionChange(() => {
                this.O.fire();
                if (this.isFocused) {
                    this.G.set(this.raw.hasSelection());
                }
            }));
            // Load addons
            this.Fb();
            this.m = this.Y.createInstance(markNavigationAddon_1.$Kfb, U);
            this.raw.loadAddon(this.m);
            this.r = this.Y.createInstance(decorationAddon_1.$Cib, this.U);
            this.B(this.r.onDidRequestRunCommand(e => this.I.fire(e)));
            this.raw.loadAddon(this.r);
            this.n = new shellIntegrationAddon_1.$jib(shellIntegrationNonce, disableShellIntegrationReporting, this.cb, this.Z);
            this.raw.loadAddon(this.n);
            this.F = terminalContextKey_1.TerminalContextKeys.focusInAny.bindTo(contextKeyService);
            this.G = terminalContextKey_1.TerminalContextKeys.textSelectedInFocused.bindTo(contextKeyService);
            // Load the suggest addon, this should be loaded regardless of the setting as the sequences
            // may still come in
            if (this.W) {
                this.s = this.B(this.Y.createInstance(suggestAddon_1.$Jib, this.W));
                this.raw.loadAddon(this.s);
                this.B(this.s.onAcceptedCompletion(async (text) => {
                    this.J.fire();
                    this.L.fire(text);
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
            if (!this.z) {
                const Addon = await this.zb();
                this.z = new Addon();
                this.raw.loadAddon(this.z);
            }
            return this.z.serializeAsHTML();
        }
        async getSelectionAsHtml(command) {
            if (!this.z) {
                const Addon = await this.zb();
                this.z = new Addon();
                this.raw.loadAddon(this.z);
            }
            if (command) {
                const length = command.getOutput()?.length;
                const row = command.marker?.line;
                if (!length || !row) {
                    throw new Error(`No row ${row} or output length ${length} for command ${command}`);
                }
                this.raw.select(0, row + 1, length - Math.floor(length / this.raw.cols));
            }
            const result = this.z.serializeAsHTML({ onlySelection: true });
            if (command) {
                this.raw.clearSelection();
            }
            return result;
        }
        attachToElement(container, partialOptions) {
            const options = { enableGpu: true, ...partialOptions };
            if (!this.h) {
                this.raw.open(container);
            }
            // TODO: Move before open to the DOM renderer doesn't initialize
            if (options.enableGpu) {
                if (this.gb()) {
                    this.qb();
                }
                else if (this.hb()) {
                    this.sb();
                }
            }
            if (!this.raw.element || !this.raw.textarea) {
                throw new Error('xterm elements not set after open');
            }
            const ad = this.D;
            ad.clear();
            ad.add(dom.$nO(this.raw.textarea, 'focus', () => this.eb(true)));
            ad.add(dom.$nO(this.raw.textarea, 'blur', () => this.eb(false)));
            ad.add(dom.$nO(this.raw.textarea, 'focusout', () => this.eb(false)));
            // Track wheel events in mouse wheel classifier and update smoothScrolling when it changes
            // as it must be disabled when a trackpad is used
            ad.add(dom.$nO(this.raw.element, dom.$3O.MOUSE_WHEEL, (e) => {
                const classifier = scrollableElement_1.$QP.INSTANCE;
                classifier.acceptStandardWheelEvent(new mouseEvent_1.$gO(e));
                const value = classifier.isPhysicalMouseWheel();
                if (value !== this.j) {
                    this.j = value;
                    this.fb();
                }
            }, { passive: true }));
            this.s?.setContainer(container);
            this.h = { container, options };
            // Screen must be created at this point as xterm.open is called
            return this.h?.container.querySelector('.xterm-screen');
        }
        eb(isFocused) {
            this.P.fire(isFocused);
            this.F.set(isFocused);
            this.G.set(isFocused && this.raw.hasSelection());
        }
        write(data, callback) {
            this.raw.write(data, callback);
        }
        resize(columns, rows) {
            this.raw.resize(columns, rows);
        }
        updateConfig() {
            const config = this.R.config;
            this.raw.options.altClickMovesCursor = config.altClickMovesCursor;
            this.mb(config.cursorBlinking);
            this.nb(config.cursorStyle);
            this.ob(config.cursorStyleInactive);
            this.pb(config.cursorWidth);
            this.raw.options.scrollback = config.scrollback;
            this.raw.options.drawBoldTextInBrightColors = config.drawBoldTextInBrightColors;
            this.raw.options.minimumContrastRatio = config.minimumContrastRatio;
            this.raw.options.tabStopWidth = config.tabStopWidth;
            this.raw.options.fastScrollSensitivity = config.fastScrollSensitivity;
            this.raw.options.scrollSensitivity = config.mouseWheelScrollSensitivity;
            this.raw.options.macOptionIsMeta = config.macOptionIsMeta;
            const editorOptions = this.X.getValue('editor');
            this.raw.options.altClickMovesCursor = config.altClickMovesCursor && editorOptions.multiCursorModifier === 'alt';
            this.raw.options.macOptionClickForcesSelection = config.macOptionClickForcesSelection;
            this.raw.options.rightClickSelectsWord = config.rightClickBehavior === 'selectWord';
            this.raw.options.wordSeparator = config.wordSeparators;
            this.raw.options.customGlyphs = config.customGlyphs;
            this.raw.options.ignoreBracketedPasteMode = config.ignoreBracketedPasteMode;
            this.fb();
            if (this.h?.options.enableGpu) {
                if (this.gb()) {
                    this.qb();
                }
                else {
                    this.Bb();
                    if (this.hb()) {
                        this.sb();
                    }
                    else {
                        this.Ab();
                    }
                }
            }
        }
        fb() {
            this.raw.options.smoothScrollDuration = this.R.config.smoothScrolling && this.j ? 125 /* RenderConstants.SmoothScrollDuration */ : 0;
        }
        gb() {
            return !browser_1.$8N && (this.R.config.gpuAcceleration === 'auto' && $Kib_1.f === undefined) || this.R.config.gpuAcceleration === 'on';
        }
        hb() {
            return (this.R.config.gpuAcceleration === 'auto' && ($Kib_1.f === undefined || $Kib_1.f === 'canvas')) || this.R.config.gpuAcceleration === 'canvas';
        }
        forceRedraw() {
            this.raw.clearTextureAtlas();
        }
        clearDecorations() {
            this.r?.clearDecorations();
        }
        forceRefresh() {
            this.c.viewport?._innerRefresh();
        }
        forceUnpause() {
            // HACK: Force the renderer to unpause by simulating an IntersectionObserver event.
            // This is to fix an issue where dragging the windpow to the top of the screen to
            // maximize on Windows/Linux would fire an event saying that the terminal was not
            // visible.
            if (!!this.t) {
                this.c._renderService?._handleIntersectionChange({ intersectionRatio: 1 });
                // HACK: Force a refresh of the screen to ensure links are refresh corrected.
                // This can probably be removed when the above hack is fixed in Chromium.
                this.raw.refresh(0, this.raw.rows - 1);
            }
        }
        async findNext(term, searchOptions) {
            this.ib(searchOptions);
            return (await this.kb()).findNext(term, searchOptions);
        }
        async findPrevious(term, searchOptions) {
            this.ib(searchOptions);
            return (await this.kb()).findPrevious(term, searchOptions);
        }
        ib(searchOptions) {
            const theme = this.bb.getColorTheme();
            // Theme color names align with monaco/vscode whereas xterm.js has some different naming.
            // The mapping is as follows:
            // - findMatch -> activeMatch
            // - findMatchHighlight -> match
            const terminalBackground = theme.getColor(terminalColorRegistry_1.$ofb) || theme.getColor(theme_1.$L_);
            const findMatchBackground = theme.getColor(terminalColorRegistry_1.$Afb);
            const findMatchBorder = theme.getColor(terminalColorRegistry_1.$Cfb);
            const findMatchOverviewRuler = theme.getColor(terminalColorRegistry_1.$yfb);
            const findMatchHighlightBackground = theme.getColor(terminalColorRegistry_1.$Dfb);
            const findMatchHighlightBorder = theme.getColor(terminalColorRegistry_1.$Efb);
            const findMatchHighlightOverviewRuler = theme.getColor(terminalColorRegistry_1.$Ffb);
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
        kb() {
            if (!this.jb) {
                this.jb = this.wb().then((AddonCtor) => {
                    this.u = new AddonCtor({ highlightLimit: 1000 /* XtermTerminalConstants.SearchHighlightLimit */ });
                    this.raw.loadAddon(this.u);
                    this.u.onDidChangeResults((results) => {
                        this.H = results;
                        this.N.fire(results);
                    });
                    return this.u;
                });
            }
            return this.jb;
        }
        clearSearchDecorations() {
            this.u?.clearDecorations();
        }
        clearActiveSearchDecoration() {
            this.u?.clearActiveDecoration();
        }
        getFont() {
            return this.R.getFont(this.c);
        }
        getLongestViewportWrappedLineLength() {
            let maxLineLength = 0;
            for (let i = this.raw.buffer.active.length - 1; i >= this.raw.buffer.active.viewportY; i--) {
                const lineInfo = this.lb(i, this.raw.buffer.active);
                maxLineLength = Math.max(maxLineLength, ((lineInfo.lineCount * this.raw.cols) - lineInfo.endSpaces) || 0);
                i = lineInfo.currentIndex;
            }
            return maxLineLength;
        }
        lb(index, buffer) {
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
            this.U.get(2 /* TerminalCapability.CommandDetection */)?.handlePromptStart();
            this.U.get(2 /* TerminalCapability.CommandDetection */)?.handleCommandStart();
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
                    await this.db.writeText(this.raw.getSelection());
                }
            }
            else {
                this.$.warn((0, nls_1.localize)(0, null));
            }
        }
        mb(blink) {
            if (this.raw.options.cursorBlink !== blink) {
                this.raw.options.cursorBlink = blink;
                this.raw.refresh(0, this.raw.rows - 1);
            }
        }
        nb(style) {
            const mapped = vscodeToXtermCursorStyle(style);
            if (this.raw.options.cursorStyle !== mapped) {
                this.raw.options.cursorStyle = mapped;
            }
        }
        ob(style) {
            const mapped = vscodeToXtermCursorStyle(style);
            if (this.raw.options.cursorInactiveStyle !== mapped) {
                this.raw.options.cursorInactiveStyle = mapped;
            }
        }
        pb(width) {
            if (this.raw.options.cursorWidth !== width) {
                this.raw.options.cursorWidth = width;
            }
        }
        async qb() {
            if (!this.raw.element || this.y) {
                return;
            }
            // Check if the the WebGL renderer is compatible with xterm.js:
            // - https://github.com/microsoft/vscode/issues/190195
            // - https://github.com/xtermjs/xterm.js/issues/4665
            // - https://bugs.chromium.org/p/chromium/issues/detail?id=1476475
            if (!$Kib_1.g) {
                $Kib_1.g = true;
                const checkCanvas = document.createElement('canvas');
                const checkGl = checkCanvas.getContext('webgl2');
                const debugInfo = checkGl?.getExtension('WEBGL_debug_renderer_info');
                if (checkGl && debugInfo) {
                    const renderer = checkGl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                    if (renderer.startsWith('ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)')) {
                        this.rb();
                        return;
                    }
                }
            }
            const Addon = await this.yb();
            this.y = new Addon();
            this.Ab();
            try {
                this.raw.loadAddon(this.y);
                this.Z.trace('Webgl was loaded');
                this.y.onContextLoss(() => {
                    this.Z.info(`Webgl lost context, disposing of webgl renderer`);
                    this.Bb();
                });
                this.ub();
                // Uncomment to add the texture atlas to the DOM
                // setTimeout(() => {
                // 	if (this._webglAddon?.textureAtlas) {
                // 		document.body.appendChild(this._webglAddon?.textureAtlas);
                // 	}
                // }, 5000);
            }
            catch (e) {
                this.Z.warn(`Webgl could not be loaded. Falling back to the canvas renderer type.`, e);
                const neverMeasureRenderTime = this.ab.getBoolean("terminal.integrated.neverMeasureRenderTime" /* TerminalStorageKeys.NeverMeasureRenderTime */, -1 /* StorageScope.APPLICATION */, false);
                // if it's already set to dom, no need to measure render time
                if (!neverMeasureRenderTime && this.R.config.gpuAcceleration !== 'off') {
                    this.Cb();
                }
                this.rb();
            }
        }
        rb() {
            $Kib_1.f = 'canvas';
            this.Bb();
            this.sb();
        }
        async sb() {
            if (!this.raw.element || this.t) {
                return;
            }
            const Addon = await this.tb();
            this.t = new Addon();
            this.Bb();
            try {
                this.raw.loadAddon(this.t);
                this.Z.trace('Canvas renderer was loaded');
            }
            catch (e) {
                this.Z.warn(`Canvas renderer could not be loaded, falling back to dom renderer`, e);
                const neverMeasureRenderTime = this.ab.getBoolean("terminal.integrated.neverMeasureRenderTime" /* TerminalStorageKeys.NeverMeasureRenderTime */, -1 /* StorageScope.APPLICATION */, false);
                // if it's already set to dom, no need to measure render time
                if (!neverMeasureRenderTime && this.R.config.gpuAcceleration !== 'off') {
                    this.Cb();
                }
                $Kib_1.f = 'dom';
                this.Ab();
            }
            this.ub();
        }
        async tb() {
            if (!CanvasAddon) {
                CanvasAddon = (await (0, amdX_1.$aD)('xterm-addon-canvas', 'lib/xterm-addon-canvas.js')).CanvasAddon;
            }
            return CanvasAddon;
        }
        async ub() {
            // Only allow the image addon when a canvas is being used to avoid possible GPU issues
            if (this.R.config.enableImages && (this.t || this.y)) {
                if (!this.C) {
                    const AddonCtor = await this.vb();
                    this.C = new AddonCtor();
                    this.raw.loadAddon(this.C);
                }
            }
            else {
                try {
                    this.C?.dispose();
                }
                catch {
                    // ignore
                }
                this.C = undefined;
            }
        }
        async vb() {
            if (!ImageAddon) {
                ImageAddon = (await (0, amdX_1.$aD)('xterm-addon-image', 'lib/xterm-addon-image.js')).ImageAddon;
            }
            return ImageAddon;
        }
        async wb() {
            if (!SearchAddon) {
                SearchAddon = (await (0, amdX_1.$aD)('xterm-addon-search', 'lib/xterm-addon-search.js')).SearchAddon;
            }
            return SearchAddon;
        }
        async xb() {
            if (!Unicode11Addon) {
                Unicode11Addon = (await (0, amdX_1.$aD)('xterm-addon-unicode11', 'lib/xterm-addon-unicode11.js')).Unicode11Addon;
            }
            return Unicode11Addon;
        }
        async yb() {
            if (!WebglAddon) {
                WebglAddon = (await (0, amdX_1.$aD)('xterm-addon-webgl', 'lib/xterm-addon-webgl.js')).WebglAddon;
            }
            return WebglAddon;
        }
        async zb() {
            if (!SerializeAddon) {
                SerializeAddon = (await (0, amdX_1.$aD)('xterm-addon-serialize', 'lib/xterm-addon-serialize.js')).SerializeAddon;
            }
            return SerializeAddon;
        }
        Ab() {
            try {
                this.t?.dispose();
            }
            catch {
                // ignore
            }
            this.t = undefined;
            this.ub();
        }
        Bb() {
            try {
                this.y?.dispose();
            }
            catch {
                // ignore
            }
            this.y = undefined;
            this.ub();
        }
        async Cb() {
            const frameTimes = [];
            if (!this.c._renderService?._renderer._renderLayers) {
                return;
            }
            const textRenderLayer = this.c._renderService._renderer._renderLayers[0];
            const originalOnGridChanged = textRenderLayer?.onGridChanged;
            const evaluateCanvasRenderer = () => {
                // Discard first frame time as it's normal to take longer
                frameTimes.shift();
                const medianTime = frameTimes.sort((a, b) => a - b)[Math.floor(frameTimes.length / 2)];
                if (medianTime > 50 /* RenderConstants.SlowCanvasRenderThreshold */) {
                    if (this.R.config.gpuAcceleration === 'auto') {
                        $Kib_1.f = 'dom';
                        this.updateConfig();
                    }
                    else {
                        const promptChoices = [
                            {
                                label: (0, nls_1.localize)(1, null),
                                run: () => this.X.updateValue("terminal.integrated.gpuAcceleration" /* TerminalSettingId.GpuAcceleration */, 'off', 2 /* ConfigurationTarget.USER */)
                            },
                            {
                                label: (0, nls_1.localize)(2, null),
                                run: () => { }
                            },
                            {
                                label: (0, nls_1.localize)(3, null),
                                isSecondary: true,
                                run: () => this.ab.store("terminal.integrated.neverMeasureRenderTime" /* TerminalStorageKeys.NeverMeasureRenderTime */, true, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */)
                            }
                        ];
                        this.$.prompt(notification_1.Severity.Warning, (0, nls_1.localize)(4, null), promptChoices);
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
        Db(theme) {
            if (!theme) {
                theme = this.bb.getColorTheme();
            }
            const foregroundColor = theme.getColor(terminalColorRegistry_1.$pfb);
            const backgroundColor = this.S.getBackgroundColor(theme);
            const cursorColor = theme.getColor(terminalColorRegistry_1.$qfb) || foregroundColor;
            const cursorAccentColor = theme.getColor(terminalColorRegistry_1.$rfb) || backgroundColor;
            const selectionBackgroundColor = theme.getColor(terminalColorRegistry_1.$sfb);
            const selectionInactiveBackgroundColor = theme.getColor(terminalColorRegistry_1.$tfb);
            const selectionForegroundColor = theme.getColor(terminalColorRegistry_1.$ufb) || undefined;
            return {
                background: backgroundColor?.toString(),
                foreground: foregroundColor?.toString(),
                cursor: cursorColor?.toString(),
                cursorAccent: cursorAccentColor?.toString(),
                selectionBackground: selectionBackgroundColor?.toString(),
                selectionInactiveBackground: selectionInactiveBackgroundColor?.toString(),
                selectionForeground: selectionForegroundColor?.toString(),
                black: theme.getColor(terminalColorRegistry_1.$nfb[0])?.toString(),
                red: theme.getColor(terminalColorRegistry_1.$nfb[1])?.toString(),
                green: theme.getColor(terminalColorRegistry_1.$nfb[2])?.toString(),
                yellow: theme.getColor(terminalColorRegistry_1.$nfb[3])?.toString(),
                blue: theme.getColor(terminalColorRegistry_1.$nfb[4])?.toString(),
                magenta: theme.getColor(terminalColorRegistry_1.$nfb[5])?.toString(),
                cyan: theme.getColor(terminalColorRegistry_1.$nfb[6])?.toString(),
                white: theme.getColor(terminalColorRegistry_1.$nfb[7])?.toString(),
                brightBlack: theme.getColor(terminalColorRegistry_1.$nfb[8])?.toString(),
                brightRed: theme.getColor(terminalColorRegistry_1.$nfb[9])?.toString(),
                brightGreen: theme.getColor(terminalColorRegistry_1.$nfb[10])?.toString(),
                brightYellow: theme.getColor(terminalColorRegistry_1.$nfb[11])?.toString(),
                brightBlue: theme.getColor(terminalColorRegistry_1.$nfb[12])?.toString(),
                brightMagenta: theme.getColor(terminalColorRegistry_1.$nfb[13])?.toString(),
                brightCyan: theme.getColor(terminalColorRegistry_1.$nfb[14])?.toString(),
                brightWhite: theme.getColor(terminalColorRegistry_1.$nfb[15])?.toString()
            };
        }
        Eb(theme) {
            this.raw.options.theme = this.Db(theme);
        }
        refresh() {
            this.Eb();
            this.r.refreshLayouts();
        }
        async Fb() {
            if (!this.w && this.R.config.unicodeVersion === '11') {
                const Addon = await this.xb();
                this.w = new Addon();
                this.raw.loadAddon(this.w);
            }
            if (this.raw.unicode.activeVersion !== this.R.config.unicodeVersion) {
                this.raw.unicode.activeVersion = this.R.config.unicodeVersion;
            }
        }
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _writeText(data) {
            this.raw.write(data);
        }
        dispose() {
            this.F.reset();
            this.G.reset();
            this.Q.fire();
            super.dispose();
        }
    };
    exports.$Kib = $Kib;
    __decorate([
        (0, decorators_1.$7g)(100)
    ], $Kib.prototype, "ub", null);
    exports.$Kib = $Kib = $Kib_1 = __decorate([
        __param(9, configuration_1.$8h),
        __param(10, instantiation_1.$Ah),
        __param(11, terminal_1.$Zq),
        __param(12, notification_1.$Yu),
        __param(13, storage_1.$Vo),
        __param(14, themeService_1.$gv),
        __param(15, telemetry_1.$9k),
        __param(16, clipboardService_1.$UZ),
        __param(17, contextkey_1.$3i)
    ], $Kib);
    function $Lib(font, width, height) {
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
    exports.$Lib = $Lib;
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
//# sourceMappingURL=xtermTerminal.js.map