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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/event", "vs/base/browser/keyboardEvent", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/decorators", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/json", "vs/base/common/jsonEdit", "vs/base/common/lifecycle", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/strings", "vs/base/common/types", "vs/base/common/uri", "vs/editor/browser/coreCommands", "vs/editor/common/core/editOperation", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/wordHelper", "vs/editor/common/model", "vs/editor/common/services/languageFeatureDebounce", "vs/editor/common/services/languageFeatures", "vs/editor/common/services/model", "vs/editor/contrib/hover/browser/hover", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/colorRegistry", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/contrib/debug/browser/debugHover", "vs/workbench/contrib/debug/browser/exceptionWidget", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/services/host/browser/host"], function (require, exports, dom_1, event_1, keyboardEvent_1, arrays_1, async_1, cancellation_1, decorators_1, errors_1, event_2, json_1, jsonEdit_1, lifecycle_1, path_1, env, strings, types_1, uri_1, coreCommands_1, editOperation_1, position_1, range_1, wordHelper_1, model_1, languageFeatureDebounce_1, languageFeatures_1, model_2, hover_1, nls, commands_1, configuration_1, contextkey_1, instantiation_1, colorRegistry_1, uriIdentity_1, debugHover_1, exceptionWidget_1, debug_1, debugModel_1, host_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DebugEditorContribution = exports.debugInlineBackground = exports.debugInlineForeground = void 0;
    const MAX_NUM_INLINE_VALUES = 100; // JS Global scope can have 700+ entries. We want to limit ourselves for perf reasons
    const MAX_INLINE_DECORATOR_LENGTH = 150; // Max string length of each inline decorator when debugging. If exceeded ... is added
    const MAX_TOKENIZATION_LINE_LEN = 500; // If line is too long, then inline values for the line are skipped
    const DEAFULT_INLINE_DEBOUNCE_DELAY = 200;
    exports.debugInlineForeground = (0, colorRegistry_1.registerColor)('editor.inlineValuesForeground', {
        dark: '#ffffff80',
        light: '#00000080',
        hcDark: '#ffffff80',
        hcLight: '#00000080'
    }, nls.localize('editor.inlineValuesForeground', "Color for the debug inline value text."));
    exports.debugInlineBackground = (0, colorRegistry_1.registerColor)('editor.inlineValuesBackground', {
        dark: '#ffc80033',
        light: '#ffc80033',
        hcDark: '#ffc80033',
        hcLight: '#ffc80033'
    }, nls.localize('editor.inlineValuesBackground', "Color for the debug inline value background."));
    class InlineSegment {
        constructor(column, text) {
            this.column = column;
            this.text = text;
        }
    }
    function createInlineValueDecoration(lineNumber, contentText, column = 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */) {
        // If decoratorText is too long, trim and add ellipses. This could happen for minified files with everything on a single line
        if (contentText.length > MAX_INLINE_DECORATOR_LENGTH) {
            contentText = contentText.substring(0, MAX_INLINE_DECORATOR_LENGTH) + '...';
        }
        return [
            {
                range: {
                    startLineNumber: lineNumber,
                    endLineNumber: lineNumber,
                    startColumn: column,
                    endColumn: column
                },
                options: {
                    description: 'debug-inline-value-decoration-spacer',
                    after: {
                        content: strings.noBreakWhitespace,
                        cursorStops: model_1.InjectedTextCursorStops.None
                    },
                    showIfCollapsed: true,
                }
            },
            {
                range: {
                    startLineNumber: lineNumber,
                    endLineNumber: lineNumber,
                    startColumn: column,
                    endColumn: column
                },
                options: {
                    description: 'debug-inline-value-decoration',
                    after: {
                        content: replaceWsWithNoBreakWs(contentText),
                        inlineClassName: 'debug-inline-value',
                        inlineClassNameAffectsLetterSpacing: true,
                        cursorStops: model_1.InjectedTextCursorStops.None
                    },
                    showIfCollapsed: true,
                }
            },
        ];
    }
    function replaceWsWithNoBreakWs(str) {
        return str.replace(/[ \t]/g, strings.noBreakWhitespace);
    }
    function createInlineValueDecorationsInsideRange(expressions, range, model, wordToLineNumbersMap) {
        const nameValueMap = new Map();
        for (const expr of expressions) {
            nameValueMap.set(expr.name, expr.value);
            // Limit the size of map. Too large can have a perf impact
            if (nameValueMap.size >= MAX_NUM_INLINE_VALUES) {
                break;
            }
        }
        const lineToNamesMap = new Map();
        // Compute unique set of names on each line
        nameValueMap.forEach((_value, name) => {
            const lineNumbers = wordToLineNumbersMap.get(name);
            if (lineNumbers) {
                for (const lineNumber of lineNumbers) {
                    if (range.containsPosition(new position_1.Position(lineNumber, 0))) {
                        if (!lineToNamesMap.has(lineNumber)) {
                            lineToNamesMap.set(lineNumber, []);
                        }
                        if (lineToNamesMap.get(lineNumber).indexOf(name) === -1) {
                            lineToNamesMap.get(lineNumber).push(name);
                        }
                    }
                }
            }
        });
        const decorations = [];
        // Compute decorators for each line
        lineToNamesMap.forEach((names, line) => {
            const contentText = names.sort((first, second) => {
                const content = model.getLineContent(line);
                return content.indexOf(first) - content.indexOf(second);
            }).map(name => `${name} = ${nameValueMap.get(name)}`).join(', ');
            decorations.push(...createInlineValueDecoration(line, contentText));
        });
        return decorations;
    }
    function getWordToLineNumbersMap(model) {
        const result = new Map();
        if (!model) {
            return result;
        }
        // For every word in every line, map its ranges for fast lookup
        for (let lineNumber = 1, len = model.getLineCount(); lineNumber <= len; ++lineNumber) {
            const lineContent = model.getLineContent(lineNumber);
            // If line is too long then skip the line
            if (lineContent.length > MAX_TOKENIZATION_LINE_LEN) {
                continue;
            }
            model.tokenization.forceTokenization(lineNumber);
            const lineTokens = model.tokenization.getLineTokens(lineNumber);
            for (let tokenIndex = 0, tokenCount = lineTokens.getCount(); tokenIndex < tokenCount; tokenIndex++) {
                const tokenType = lineTokens.getStandardTokenType(tokenIndex);
                // Token is a word and not a comment
                if (tokenType === 0 /* StandardTokenType.Other */) {
                    wordHelper_1.DEFAULT_WORD_REGEXP.lastIndex = 0; // We assume tokens will usually map 1:1 to words if they match
                    const tokenStartOffset = lineTokens.getStartOffset(tokenIndex);
                    const tokenEndOffset = lineTokens.getEndOffset(tokenIndex);
                    const tokenStr = lineContent.substring(tokenStartOffset, tokenEndOffset);
                    const wordMatch = wordHelper_1.DEFAULT_WORD_REGEXP.exec(tokenStr);
                    if (wordMatch) {
                        const word = wordMatch[0];
                        if (!result.has(word)) {
                            result.set(word, []);
                        }
                        result.get(word).push(lineNumber);
                    }
                }
            }
        }
        return result;
    }
    let DebugEditorContribution = class DebugEditorContribution {
        constructor(editor, debugService, instantiationService, commandService, configurationService, hostService, uriIdentityService, contextKeyService, languageFeaturesService, featureDebounceService) {
            this.editor = editor;
            this.debugService = debugService;
            this.instantiationService = instantiationService;
            this.commandService = commandService;
            this.configurationService = configurationService;
            this.hostService = hostService;
            this.uriIdentityService = uriIdentityService;
            this.languageFeaturesService = languageFeaturesService;
            this.hoverPosition = null;
            this.mouseDown = false;
            this.gutterIsHovered = false;
            this.altPressed = false;
            this.oldDecorations = this.editor.createDecorationsCollection();
            this._wordToLineNumbersMap = undefined;
            this.debounceInfo = featureDebounceService.for(languageFeaturesService.inlineValuesProvider, 'InlineValues', { min: DEAFULT_INLINE_DEBOUNCE_DELAY });
            this.hoverWidget = this.instantiationService.createInstance(debugHover_1.DebugHoverWidget, this.editor);
            this.toDispose = [];
            this.registerListeners();
            this.exceptionWidgetVisible = debug_1.CONTEXT_EXCEPTION_WIDGET_VISIBLE.bindTo(contextKeyService);
            this.toggleExceptionWidget();
        }
        registerListeners() {
            this.toDispose.push(this.debugService.getViewModel().onDidFocusStackFrame(e => this.onFocusStackFrame(e.stackFrame)));
            // hover listeners & hover widget
            this.toDispose.push(this.editor.onMouseDown((e) => this.onEditorMouseDown(e)));
            this.toDispose.push(this.editor.onMouseUp(() => this.mouseDown = false));
            this.toDispose.push(this.editor.onMouseMove((e) => this.onEditorMouseMove(e)));
            this.toDispose.push(this.editor.onMouseLeave((e) => {
                const hoverDomNode = this.hoverWidget.getDomNode();
                if (!hoverDomNode) {
                    return;
                }
                const rect = hoverDomNode.getBoundingClientRect();
                // Only hide the hover widget if the editor mouse leave event is outside the hover widget #3528
                if (e.event.posx < rect.left || e.event.posx > rect.right || e.event.posy < rect.top || e.event.posy > rect.bottom) {
                    this.hideHoverWidget();
                }
            }));
            this.toDispose.push(this.editor.onKeyDown((e) => this.onKeyDown(e)));
            this.toDispose.push(this.editor.onDidChangeModelContent(() => {
                this._wordToLineNumbersMap = undefined;
                this.updateInlineValuesScheduler.schedule();
            }));
            this.toDispose.push(this.debugService.getViewModel().onWillUpdateViews(() => this.updateInlineValuesScheduler.schedule()));
            this.toDispose.push(this.debugService.getViewModel().onDidEvaluateLazyExpression(() => this.updateInlineValuesScheduler.schedule()));
            this.toDispose.push(this.editor.onDidChangeModel(async () => {
                this.updateHoverConfiguration();
                this.toggleExceptionWidget();
                this.hideHoverWidget();
                this._wordToLineNumbersMap = undefined;
                const stackFrame = this.debugService.getViewModel().focusedStackFrame;
                await this.updateInlineValueDecorations(stackFrame);
            }));
            this.toDispose.push(this.editor.onDidScrollChange(() => {
                this.hideHoverWidget();
                // Inline value provider should get called on view port change
                const model = this.editor.getModel();
                if (model && this.languageFeaturesService.inlineValuesProvider.has(model)) {
                    this.updateInlineValuesScheduler.schedule();
                }
            }));
            this.toDispose.push(this.debugService.onDidChangeState((state) => {
                if (state !== 2 /* State.Stopped */) {
                    this.toggleExceptionWidget();
                }
            }));
        }
        get wordToLineNumbersMap() {
            if (!this._wordToLineNumbersMap) {
                this._wordToLineNumbersMap = getWordToLineNumbersMap(this.editor.getModel());
            }
            return this._wordToLineNumbersMap;
        }
        updateHoverConfiguration() {
            const stackFrame = this.debugService.getViewModel().focusedStackFrame;
            const model = this.editor.getModel();
            if (model) {
                this.applyHoverConfiguration(model, stackFrame);
            }
        }
        applyHoverConfiguration(model, stackFrame) {
            if (stackFrame && this.uriIdentityService.extUri.isEqual(model.uri, stackFrame.source.uri)) {
                if (this.altListener) {
                    this.altListener.dispose();
                }
                // When the alt key is pressed show regular editor hover and hide the debug hover #84561
                this.altListener = (0, dom_1.addDisposableListener)(document, 'keydown', keydownEvent => {
                    const standardKeyboardEvent = new keyboardEvent_1.StandardKeyboardEvent(keydownEvent);
                    if (standardKeyboardEvent.keyCode === 6 /* KeyCode.Alt */) {
                        this.altPressed = true;
                        const debugHoverWasVisible = this.hoverWidget.isVisible();
                        this.hoverWidget.hide();
                        this.enableEditorHover();
                        if (debugHoverWasVisible && this.hoverPosition) {
                            // If the debug hover was visible immediately show the editor hover for the alt transition to be smooth
                            this.showEditorHover(this.hoverPosition, false);
                        }
                        const onKeyUp = new event_1.DomEmitter(document, 'keyup');
                        const listener = event_2.Event.any(this.hostService.onDidChangeFocus, onKeyUp.event)(keyupEvent => {
                            let standardKeyboardEvent = undefined;
                            if (keyupEvent instanceof KeyboardEvent) {
                                standardKeyboardEvent = new keyboardEvent_1.StandardKeyboardEvent(keyupEvent);
                            }
                            if (!standardKeyboardEvent || standardKeyboardEvent.keyCode === 6 /* KeyCode.Alt */) {
                                this.altPressed = false;
                                this.editor.updateOptions({ hover: { enabled: false } });
                                listener.dispose();
                                onKeyUp.dispose();
                            }
                        });
                    }
                });
                this.editor.updateOptions({ hover: { enabled: false } });
            }
            else {
                this.altListener?.dispose();
                this.enableEditorHover();
            }
        }
        enableEditorHover() {
            if (this.editor.hasModel()) {
                const model = this.editor.getModel();
                const overrides = {
                    resource: model.uri,
                    overrideIdentifier: model.getLanguageId()
                };
                const defaultConfiguration = this.configurationService.getValue('editor.hover', overrides);
                this.editor.updateOptions({
                    hover: {
                        enabled: defaultConfiguration.enabled,
                        delay: defaultConfiguration.delay,
                        sticky: defaultConfiguration.sticky
                    }
                });
            }
        }
        async showHover(position, focus) {
            const sf = this.debugService.getViewModel().focusedStackFrame;
            const model = this.editor.getModel();
            if (sf && model && this.uriIdentityService.extUri.isEqual(sf.source.uri, model.uri)) {
                const result = await this.hoverWidget.showAt(position, focus);
                if (result === 1 /* ShowDebugHoverResult.NOT_AVAILABLE */) {
                    // When no expression available fallback to editor hover
                    this.showEditorHover(position, focus);
                }
            }
            else {
                this.showEditorHover(position, focus);
            }
        }
        showEditorHover(position, focus) {
            const hoverController = this.editor.getContribution(hover_1.ModesHoverController.ID);
            const range = new range_1.Range(position.lineNumber, position.column, position.lineNumber, position.column);
            hoverController?.showContentHover(range, 1 /* HoverStartMode.Immediate */, 0 /* HoverStartSource.Mouse */, focus);
        }
        async onFocusStackFrame(sf) {
            const model = this.editor.getModel();
            if (model) {
                this.applyHoverConfiguration(model, sf);
                if (sf && this.uriIdentityService.extUri.isEqual(sf.source.uri, model.uri)) {
                    await this.toggleExceptionWidget();
                }
                else {
                    this.hideHoverWidget();
                }
            }
            await this.updateInlineValueDecorations(sf);
        }
        get showHoverScheduler() {
            const hoverOption = this.editor.getOption(60 /* EditorOption.hover */);
            const scheduler = new async_1.RunOnceScheduler(() => {
                if (this.hoverPosition && !this.altPressed) {
                    this.showHover(this.hoverPosition, false);
                }
            }, hoverOption.delay * 2);
            this.toDispose.push(scheduler);
            return scheduler;
        }
        get hideHoverScheduler() {
            const scheduler = new async_1.RunOnceScheduler(() => {
                if (!this.hoverWidget.isHovered()) {
                    this.hoverWidget.hide();
                }
            }, 0);
            this.toDispose.push(scheduler);
            return scheduler;
        }
        hideHoverWidget() {
            if (!this.hideHoverScheduler.isScheduled() && this.hoverWidget.willBeVisible()) {
                this.hideHoverScheduler.schedule();
            }
            this.showHoverScheduler.cancel();
        }
        // hover business
        onEditorMouseDown(mouseEvent) {
            this.mouseDown = true;
            if (mouseEvent.target.type === 9 /* MouseTargetType.CONTENT_WIDGET */ && mouseEvent.target.detail === debugHover_1.DebugHoverWidget.ID) {
                return;
            }
            this.hideHoverWidget();
        }
        onEditorMouseMove(mouseEvent) {
            if (this.debugService.state !== 2 /* State.Stopped */) {
                return;
            }
            const target = mouseEvent.target;
            const stopKey = env.isMacintosh ? 'metaKey' : 'ctrlKey';
            if (!this.altPressed) {
                if (target.type === 2 /* MouseTargetType.GUTTER_GLYPH_MARGIN */) {
                    this.editor.updateOptions({ hover: { enabled: true } });
                    this.gutterIsHovered = true;
                }
                else if (this.gutterIsHovered) {
                    this.gutterIsHovered = false;
                    this.updateHoverConfiguration();
                }
            }
            if (target.type === 9 /* MouseTargetType.CONTENT_WIDGET */ && target.detail === debugHover_1.DebugHoverWidget.ID && !mouseEvent.event[stopKey]) {
                // mouse moved on top of debug hover widget
                return;
            }
            if (target.type === 6 /* MouseTargetType.CONTENT_TEXT */) {
                if (target.position && !position_1.Position.equals(target.position, this.hoverPosition)) {
                    this.hoverPosition = target.position;
                    this.hideHoverScheduler.cancel();
                    this.showHoverScheduler.schedule();
                }
            }
            else if (!this.mouseDown) {
                // Do not hide debug hover when the mouse is pressed because it usually leads to accidental closing #64620
                this.hideHoverWidget();
            }
        }
        onKeyDown(e) {
            const stopKey = env.isMacintosh ? 57 /* KeyCode.Meta */ : 5 /* KeyCode.Ctrl */;
            if (e.keyCode !== stopKey) {
                // do not hide hover when Ctrl/Meta is pressed
                this.hideHoverWidget();
            }
        }
        // end hover business
        // exception widget
        async toggleExceptionWidget() {
            // Toggles exception widget based on the state of the current editor model and debug stack frame
            const model = this.editor.getModel();
            const focusedSf = this.debugService.getViewModel().focusedStackFrame;
            const callStack = focusedSf ? focusedSf.thread.getCallStack() : null;
            if (!model || !focusedSf || !callStack || callStack.length === 0) {
                this.closeExceptionWidget();
                return;
            }
            // First call stack frame that is available is the frame where exception has been thrown
            const exceptionSf = callStack.find(sf => !!(sf && sf.source && sf.source.available && sf.source.presentationHint !== 'deemphasize'));
            if (!exceptionSf || exceptionSf !== focusedSf) {
                this.closeExceptionWidget();
                return;
            }
            const sameUri = this.uriIdentityService.extUri.isEqual(exceptionSf.source.uri, model.uri);
            if (this.exceptionWidget && !sameUri) {
                this.closeExceptionWidget();
            }
            else if (sameUri) {
                const exceptionInfo = await focusedSf.thread.exceptionInfo;
                if (exceptionInfo) {
                    this.showExceptionWidget(exceptionInfo, this.debugService.getViewModel().focusedSession, exceptionSf.range.startLineNumber, exceptionSf.range.startColumn);
                }
            }
        }
        showExceptionWidget(exceptionInfo, debugSession, lineNumber, column) {
            if (this.exceptionWidget) {
                this.exceptionWidget.dispose();
            }
            this.exceptionWidget = this.instantiationService.createInstance(exceptionWidget_1.ExceptionWidget, this.editor, exceptionInfo, debugSession);
            this.exceptionWidget.show({ lineNumber, column }, 0);
            this.exceptionWidget.focus();
            this.editor.revealRangeInCenter({
                startLineNumber: lineNumber,
                startColumn: column,
                endLineNumber: lineNumber,
                endColumn: column,
            });
            this.exceptionWidgetVisible.set(true);
        }
        closeExceptionWidget() {
            if (this.exceptionWidget) {
                const shouldFocusEditor = this.exceptionWidget.hasFocus();
                this.exceptionWidget.dispose();
                this.exceptionWidget = undefined;
                this.exceptionWidgetVisible.set(false);
                if (shouldFocusEditor) {
                    this.editor.focus();
                }
            }
        }
        async addLaunchConfiguration() {
            const model = this.editor.getModel();
            if (!model) {
                return;
            }
            let configurationsArrayPosition;
            let lastProperty;
            const getConfigurationPosition = () => {
                let depthInArray = 0;
                (0, json_1.visit)(model.getValue(), {
                    onObjectProperty: (property) => {
                        lastProperty = property;
                    },
                    onArrayBegin: (offset) => {
                        if (lastProperty === 'configurations' && depthInArray === 0) {
                            configurationsArrayPosition = model.getPositionAt(offset + 1);
                        }
                        depthInArray++;
                    },
                    onArrayEnd: () => {
                        depthInArray--;
                    }
                });
            };
            getConfigurationPosition();
            if (!configurationsArrayPosition) {
                // "configurations" array doesn't exist. Add it here.
                const { tabSize, insertSpaces } = model.getOptions();
                const eol = model.getEOL();
                const edit = ((0, path_1.basename)(model.uri.fsPath) === 'launch.json') ?
                    (0, jsonEdit_1.setProperty)(model.getValue(), ['configurations'], [], { tabSize, insertSpaces, eol })[0] :
                    (0, jsonEdit_1.setProperty)(model.getValue(), ['launch'], { 'configurations': [] }, { tabSize, insertSpaces, eol })[0];
                const startPosition = model.getPositionAt(edit.offset);
                const lineNumber = startPosition.lineNumber;
                const range = new range_1.Range(lineNumber, startPosition.column, lineNumber, model.getLineMaxColumn(lineNumber));
                model.pushEditOperations(null, [editOperation_1.EditOperation.replace(range, edit.content)], () => null);
                // Go through the file again since we've edited it
                getConfigurationPosition();
            }
            if (!configurationsArrayPosition) {
                return;
            }
            this.editor.focus();
            const insertLine = (position) => {
                // Check if there are more characters on a line after a "configurations": [, if yes enter a newline
                if (model.getLineLastNonWhitespaceColumn(position.lineNumber) > position.column) {
                    this.editor.setPosition(position);
                    coreCommands_1.CoreEditingCommands.LineBreakInsert.runEditorCommand(null, this.editor, null);
                }
                this.editor.setPosition(position);
                return this.commandService.executeCommand('editor.action.insertLineAfter');
            };
            await insertLine(configurationsArrayPosition);
            await this.commandService.executeCommand('editor.action.triggerSuggest');
        }
        // Inline Decorations
        get removeInlineValuesScheduler() {
            return new async_1.RunOnceScheduler(() => {
                this.oldDecorations.clear();
            }, 100);
        }
        get updateInlineValuesScheduler() {
            const model = this.editor.getModel();
            return new async_1.RunOnceScheduler(async () => await this.updateInlineValueDecorations(this.debugService.getViewModel().focusedStackFrame), model ? this.debounceInfo.get(model) : DEAFULT_INLINE_DEBOUNCE_DELAY);
        }
        async updateInlineValueDecorations(stackFrame) {
            const var_value_format = '{0} = {1}';
            const separator = ', ';
            const model = this.editor.getModel();
            const inlineValuesSetting = this.configurationService.getValue('debug').inlineValues;
            const inlineValuesTurnedOn = inlineValuesSetting === true || inlineValuesSetting === 'on' || (inlineValuesSetting === 'auto' && model && this.languageFeaturesService.inlineValuesProvider.has(model));
            if (!inlineValuesTurnedOn || !model || !stackFrame || model.uri.toString() !== stackFrame.source.uri.toString()) {
                if (!this.removeInlineValuesScheduler.isScheduled()) {
                    this.removeInlineValuesScheduler.schedule();
                }
                return;
            }
            this.removeInlineValuesScheduler.cancel();
            let allDecorations;
            if (this.languageFeaturesService.inlineValuesProvider.has(model)) {
                const findVariable = async (_key, caseSensitiveLookup) => {
                    const scopes = await stackFrame.getMostSpecificScopes(stackFrame.range);
                    const key = caseSensitiveLookup ? _key : _key.toLowerCase();
                    for (const scope of scopes) {
                        const variables = await scope.getChildren();
                        const found = variables.find(v => caseSensitiveLookup ? (v.name === key) : (v.name.toLowerCase() === key));
                        if (found) {
                            return found.value;
                        }
                    }
                    return undefined;
                };
                const ctx = {
                    frameId: stackFrame.frameId,
                    stoppedLocation: new range_1.Range(stackFrame.range.startLineNumber, stackFrame.range.startColumn + 1, stackFrame.range.endLineNumber, stackFrame.range.endColumn + 1)
                };
                const token = new cancellation_1.CancellationTokenSource().token;
                const ranges = this.editor.getVisibleRangesPlusViewportAboveBelow();
                const providers = this.languageFeaturesService.inlineValuesProvider.ordered(model).reverse();
                allDecorations = [];
                const lineDecorations = new Map();
                const promises = (0, arrays_1.flatten)(providers.map(provider => ranges.map(range => Promise.resolve(provider.provideInlineValues(model, range, ctx, token)).then(async (result) => {
                    if (result) {
                        for (const iv of result) {
                            let text = undefined;
                            switch (iv.type) {
                                case 'text':
                                    text = iv.text;
                                    break;
                                case 'variable': {
                                    let va = iv.variableName;
                                    if (!va) {
                                        const lineContent = model.getLineContent(iv.range.startLineNumber);
                                        va = lineContent.substring(iv.range.startColumn - 1, iv.range.endColumn - 1);
                                    }
                                    const value = await findVariable(va, iv.caseSensitiveLookup);
                                    if (value) {
                                        text = strings.format(var_value_format, va, value);
                                    }
                                    break;
                                }
                                case 'expression': {
                                    let expr = iv.expression;
                                    if (!expr) {
                                        const lineContent = model.getLineContent(iv.range.startLineNumber);
                                        expr = lineContent.substring(iv.range.startColumn - 1, iv.range.endColumn - 1);
                                    }
                                    if (expr) {
                                        const expression = new debugModel_1.Expression(expr);
                                        await expression.evaluate(stackFrame.thread.session, stackFrame, 'watch', true);
                                        if (expression.available) {
                                            text = strings.format(var_value_format, expr, expression.value);
                                        }
                                    }
                                    break;
                                }
                            }
                            if (text) {
                                const line = iv.range.startLineNumber;
                                let lineSegments = lineDecorations.get(line);
                                if (!lineSegments) {
                                    lineSegments = [];
                                    lineDecorations.set(line, lineSegments);
                                }
                                if (!lineSegments.some(iv => iv.text === text)) { // de-dupe
                                    lineSegments.push(new InlineSegment(iv.range.startColumn, text));
                                }
                            }
                        }
                    }
                }, err => {
                    (0, errors_1.onUnexpectedExternalError)(err);
                }))));
                const startTime = Date.now();
                await Promise.all(promises);
                // update debounce info
                this.updateInlineValuesScheduler.delay = this.debounceInfo.update(model, Date.now() - startTime);
                // sort line segments and concatenate them into a decoration
                lineDecorations.forEach((segments, line) => {
                    if (segments.length > 0) {
                        segments = segments.sort((a, b) => a.column - b.column);
                        const text = segments.map(s => s.text).join(separator);
                        allDecorations.push(...createInlineValueDecoration(line, text));
                    }
                });
            }
            else {
                // old "one-size-fits-all" strategy
                const scopes = await stackFrame.getMostSpecificScopes(stackFrame.range);
                // Get all top level variables in the scope chain
                const decorationsPerScope = await Promise.all(scopes.map(async (scope) => {
                    const variables = await scope.getChildren();
                    let range = new range_1.Range(0, 0, stackFrame.range.startLineNumber, stackFrame.range.startColumn);
                    if (scope.range) {
                        range = range.setStartPosition(scope.range.startLineNumber, scope.range.startColumn);
                    }
                    return createInlineValueDecorationsInsideRange(variables, range, model, this.wordToLineNumbersMap);
                }));
                allDecorations = (0, arrays_1.distinct)(decorationsPerScope.reduce((previous, current) => previous.concat(current), []), 
                // Deduplicate decorations since same variable can appear in multiple scopes, leading to duplicated decorations #129770
                decoration => `${decoration.range.startLineNumber}:${decoration?.options.after?.content}`);
            }
            this.oldDecorations.set(allDecorations);
        }
        dispose() {
            if (this.hoverWidget) {
                this.hoverWidget.dispose();
            }
            if (this.configurationWidget) {
                this.configurationWidget.dispose();
            }
            this.toDispose = (0, lifecycle_1.dispose)(this.toDispose);
            this.oldDecorations.clear();
        }
    };
    exports.DebugEditorContribution = DebugEditorContribution;
    __decorate([
        decorators_1.memoize
    ], DebugEditorContribution.prototype, "showHoverScheduler", null);
    __decorate([
        decorators_1.memoize
    ], DebugEditorContribution.prototype, "hideHoverScheduler", null);
    __decorate([
        decorators_1.memoize
    ], DebugEditorContribution.prototype, "removeInlineValuesScheduler", null);
    __decorate([
        decorators_1.memoize
    ], DebugEditorContribution.prototype, "updateInlineValuesScheduler", null);
    exports.DebugEditorContribution = DebugEditorContribution = __decorate([
        __param(1, debug_1.IDebugService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, commands_1.ICommandService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, host_1.IHostService),
        __param(6, uriIdentity_1.IUriIdentityService),
        __param(7, contextkey_1.IContextKeyService),
        __param(8, languageFeatures_1.ILanguageFeaturesService),
        __param(9, languageFeatureDebounce_1.ILanguageFeatureDebounceService)
    ], DebugEditorContribution);
    commands_1.CommandsRegistry.registerCommand('_executeInlineValueProvider', async (accessor, uri, iRange, context) => {
        (0, types_1.assertType)(uri_1.URI.isUri(uri));
        (0, types_1.assertType)(range_1.Range.isIRange(iRange));
        if (!context || typeof context.frameId !== 'number' || !range_1.Range.isIRange(context.stoppedLocation)) {
            throw (0, errors_1.illegalArgument)('context');
        }
        const model = accessor.get(model_2.IModelService).getModel(uri);
        if (!model) {
            throw (0, errors_1.illegalArgument)('uri');
        }
        const range = range_1.Range.lift(iRange);
        const { inlineValuesProvider } = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        const providers = inlineValuesProvider.ordered(model);
        const providerResults = await Promise.all(providers.map(provider => provider.provideInlineValues(model, range, context, cancellation_1.CancellationToken.None)));
        return providerResults.flat().filter(types_1.isDefined);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdFZGl0b3JDb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9kZWJ1Zy9icm93c2VyL2RlYnVnRWRpdG9yQ29udHJpYnV0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWtEaEcsTUFBTSxxQkFBcUIsR0FBRyxHQUFHLENBQUMsQ0FBQyxxRkFBcUY7SUFDeEgsTUFBTSwyQkFBMkIsR0FBRyxHQUFHLENBQUMsQ0FBQyxzRkFBc0Y7SUFDL0gsTUFBTSx5QkFBeUIsR0FBRyxHQUFHLENBQUMsQ0FBQyxtRUFBbUU7SUFFMUcsTUFBTSw2QkFBNkIsR0FBRyxHQUFHLENBQUM7SUFFN0IsUUFBQSxxQkFBcUIsR0FBRyxJQUFBLDZCQUFhLEVBQUMsK0JBQStCLEVBQUU7UUFDbkYsSUFBSSxFQUFFLFdBQVc7UUFDakIsS0FBSyxFQUFFLFdBQVc7UUFDbEIsTUFBTSxFQUFFLFdBQVc7UUFDbkIsT0FBTyxFQUFFLFdBQVc7S0FDcEIsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLCtCQUErQixFQUFFLHdDQUF3QyxDQUFDLENBQUMsQ0FBQztJQUUvRSxRQUFBLHFCQUFxQixHQUFHLElBQUEsNkJBQWEsRUFBQywrQkFBK0IsRUFBRTtRQUNuRixJQUFJLEVBQUUsV0FBVztRQUNqQixLQUFLLEVBQUUsV0FBVztRQUNsQixNQUFNLEVBQUUsV0FBVztRQUNuQixPQUFPLEVBQUUsV0FBVztLQUNwQixFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsK0JBQStCLEVBQUUsOENBQThDLENBQUMsQ0FBQyxDQUFDO0lBRWxHLE1BQU0sYUFBYTtRQUNsQixZQUFtQixNQUFjLEVBQVMsSUFBWTtZQUFuQyxXQUFNLEdBQU4sTUFBTSxDQUFRO1lBQVMsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUN0RCxDQUFDO0tBQ0Q7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