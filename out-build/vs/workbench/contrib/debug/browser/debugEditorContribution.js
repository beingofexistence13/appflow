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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/event", "vs/base/browser/keyboardEvent", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/decorators", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/json", "vs/base/common/jsonEdit", "vs/base/common/lifecycle", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/strings", "vs/base/common/types", "vs/base/common/uri", "vs/editor/browser/coreCommands", "vs/editor/common/core/editOperation", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/wordHelper", "vs/editor/common/model", "vs/editor/common/services/languageFeatureDebounce", "vs/editor/common/services/languageFeatures", "vs/editor/common/services/model", "vs/editor/contrib/hover/browser/hover", "vs/nls!vs/workbench/contrib/debug/browser/debugEditorContribution", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/colorRegistry", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/contrib/debug/browser/debugHover", "vs/workbench/contrib/debug/browser/exceptionWidget", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/services/host/browser/host"], function (require, exports, dom_1, event_1, keyboardEvent_1, arrays_1, async_1, cancellation_1, decorators_1, errors_1, event_2, json_1, jsonEdit_1, lifecycle_1, path_1, env, strings, types_1, uri_1, coreCommands_1, editOperation_1, position_1, range_1, wordHelper_1, model_1, languageFeatureDebounce_1, languageFeatures_1, model_2, hover_1, nls, commands_1, configuration_1, contextkey_1, instantiation_1, colorRegistry_1, uriIdentity_1, debugHover_1, exceptionWidget_1, debug_1, debugModel_1, host_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$DRb = exports.$CRb = exports.$BRb = void 0;
    const MAX_NUM_INLINE_VALUES = 100; // JS Global scope can have 700+ entries. We want to limit ourselves for perf reasons
    const MAX_INLINE_DECORATOR_LENGTH = 150; // Max string length of each inline decorator when debugging. If exceeded ... is added
    const MAX_TOKENIZATION_LINE_LEN = 500; // If line is too long, then inline values for the line are skipped
    const DEAFULT_INLINE_DEBOUNCE_DELAY = 200;
    exports.$BRb = (0, colorRegistry_1.$sv)('editor.inlineValuesForeground', {
        dark: '#ffffff80',
        light: '#00000080',
        hcDark: '#ffffff80',
        hcLight: '#00000080'
    }, nls.localize(0, null));
    exports.$CRb = (0, colorRegistry_1.$sv)('editor.inlineValuesBackground', {
        dark: '#ffc80033',
        light: '#ffc80033',
        hcDark: '#ffc80033',
        hcLight: '#ffc80033'
    }, nls.localize(1, null));
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
                        content: strings.$gf,
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
        return str.replace(/[ \t]/g, strings.$gf);
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
                    if (range.containsPosition(new position_1.$js(lineNumber, 0))) {
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
                    wordHelper_1.$Wr.lastIndex = 0; // We assume tokens will usually map 1:1 to words if they match
                    const tokenStartOffset = lineTokens.getStartOffset(tokenIndex);
                    const tokenEndOffset = lineTokens.getEndOffset(tokenIndex);
                    const tokenStr = lineContent.substring(tokenStartOffset, tokenEndOffset);
                    const wordMatch = wordHelper_1.$Wr.exec(tokenStr);
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
    let $DRb = class $DRb {
        constructor(p, q, r, t, u, w, x, contextKeyService, y, featureDebounceService) {
            this.p = p;
            this.q = q;
            this.r = r;
            this.t = t;
            this.u = u;
            this.w = w;
            this.x = x;
            this.y = y;
            this.f = null;
            this.g = false;
            this.i = false;
            this.m = false;
            this.n = this.p.createDecorationsCollection();
            this.A = undefined;
            this.o = featureDebounceService.for(y.inlineValuesProvider, 'InlineValues', { min: DEAFULT_INLINE_DEBOUNCE_DELAY });
            this.d = this.r.createInstance(debugHover_1.$zRb, this.p);
            this.c = [];
            this.z();
            this.h = debug_1.$_G.bindTo(contextKeyService);
            this.N();
        }
        z() {
            this.c.push(this.q.getViewModel().onDidFocusStackFrame(e => this.G(e.stackFrame)));
            // hover listeners & hover widget
            this.c.push(this.p.onMouseDown((e) => this.K(e)));
            this.c.push(this.p.onMouseUp(() => this.g = false));
            this.c.push(this.p.onMouseMove((e) => this.L(e)));
            this.c.push(this.p.onMouseLeave((e) => {
                const hoverDomNode = this.d.getDomNode();
                if (!hoverDomNode) {
                    return;
                }
                const rect = hoverDomNode.getBoundingClientRect();
                // Only hide the hover widget if the editor mouse leave event is outside the hover widget #3528
                if (e.event.posx < rect.left || e.event.posx > rect.right || e.event.posy < rect.top || e.event.posy > rect.bottom) {
                    this.J();
                }
            }));
            this.c.push(this.p.onKeyDown((e) => this.M(e)));
            this.c.push(this.p.onDidChangeModelContent(() => {
                this.A = undefined;
                this.Q.schedule();
            }));
            this.c.push(this.q.getViewModel().onWillUpdateViews(() => this.Q.schedule()));
            this.c.push(this.q.getViewModel().onDidEvaluateLazyExpression(() => this.Q.schedule()));
            this.c.push(this.p.onDidChangeModel(async () => {
                this.C();
                this.N();
                this.J();
                this.A = undefined;
                const stackFrame = this.q.getViewModel().focusedStackFrame;
                await this.R(stackFrame);
            }));
            this.c.push(this.p.onDidScrollChange(() => {
                this.J();
                // Inline value provider should get called on view port change
                const model = this.p.getModel();
                if (model && this.y.inlineValuesProvider.has(model)) {
                    this.Q.schedule();
                }
            }));
            this.c.push(this.q.onDidChangeState((state) => {
                if (state !== 2 /* State.Stopped */) {
                    this.N();
                }
            }));
        }
        get B() {
            if (!this.A) {
                this.A = getWordToLineNumbersMap(this.p.getModel());
            }
            return this.A;
        }
        C() {
            const stackFrame = this.q.getViewModel().focusedStackFrame;
            const model = this.p.getModel();
            if (model) {
                this.D(model, stackFrame);
            }
        }
        D(model, stackFrame) {
            if (stackFrame && this.x.extUri.isEqual(model.uri, stackFrame.source.uri)) {
                if (this.l) {
                    this.l.dispose();
                }
                // When the alt key is pressed show regular editor hover and hide the debug hover #84561
                this.l = (0, dom_1.$nO)(document, 'keydown', keydownEvent => {
                    const standardKeyboardEvent = new keyboardEvent_1.$jO(keydownEvent);
                    if (standardKeyboardEvent.keyCode === 6 /* KeyCode.Alt */) {
                        this.m = true;
                        const debugHoverWasVisible = this.d.isVisible();
                        this.d.hide();
                        this.E();
                        if (debugHoverWasVisible && this.f) {
                            // If the debug hover was visible immediately show the editor hover for the alt transition to be smooth
                            this.F(this.f, false);
                        }
                        const onKeyUp = new event_1.$9P(document, 'keyup');
                        const listener = event_2.Event.any(this.w.onDidChangeFocus, onKeyUp.event)(keyupEvent => {
                            let standardKeyboardEvent = undefined;
                            if (keyupEvent instanceof KeyboardEvent) {
                                standardKeyboardEvent = new keyboardEvent_1.$jO(keyupEvent);
                            }
                            if (!standardKeyboardEvent || standardKeyboardEvent.keyCode === 6 /* KeyCode.Alt */) {
                                this.m = false;
                                this.p.updateOptions({ hover: { enabled: false } });
                                listener.dispose();
                                onKeyUp.dispose();
                            }
                        });
                    }
                });
                this.p.updateOptions({ hover: { enabled: false } });
            }
            else {
                this.l?.dispose();
                this.E();
            }
        }
        E() {
            if (this.p.hasModel()) {
                const model = this.p.getModel();
                const overrides = {
                    resource: model.uri,
                    overrideIdentifier: model.getLanguageId()
                };
                const defaultConfiguration = this.u.getValue('editor.hover', overrides);
                this.p.updateOptions({
                    hover: {
                        enabled: defaultConfiguration.enabled,
                        delay: defaultConfiguration.delay,
                        sticky: defaultConfiguration.sticky
                    }
                });
            }
        }
        async showHover(position, focus) {
            const sf = this.q.getViewModel().focusedStackFrame;
            const model = this.p.getModel();
            if (sf && model && this.x.extUri.isEqual(sf.source.uri, model.uri)) {
                const result = await this.d.showAt(position, focus);
                if (result === 1 /* ShowDebugHoverResult.NOT_AVAILABLE */) {
                    // When no expression available fallback to editor hover
                    this.F(position, focus);
                }
            }
            else {
                this.F(position, focus);
            }
        }
        F(position, focus) {
            const hoverController = this.p.getContribution(hover_1.$Q6.ID);
            const range = new range_1.$ks(position.lineNumber, position.column, position.lineNumber, position.column);
            hoverController?.showContentHover(range, 1 /* HoverStartMode.Immediate */, 0 /* HoverStartSource.Mouse */, focus);
        }
        async G(sf) {
            const model = this.p.getModel();
            if (model) {
                this.D(model, sf);
                if (sf && this.x.extUri.isEqual(sf.source.uri, model.uri)) {
                    await this.N();
                }
                else {
                    this.J();
                }
            }
            await this.R(sf);
        }
        get H() {
            const hoverOption = this.p.getOption(60 /* EditorOption.hover */);
            const scheduler = new async_1.$Sg(() => {
                if (this.f && !this.m) {
                    this.showHover(this.f, false);
                }
            }, hoverOption.delay * 2);
            this.c.push(scheduler);
            return scheduler;
        }
        get I() {
            const scheduler = new async_1.$Sg(() => {
                if (!this.d.isHovered()) {
                    this.d.hide();
                }
            }, 0);
            this.c.push(scheduler);
            return scheduler;
        }
        J() {
            if (!this.I.isScheduled() && this.d.willBeVisible()) {
                this.I.schedule();
            }
            this.H.cancel();
        }
        // hover business
        K(mouseEvent) {
            this.g = true;
            if (mouseEvent.target.type === 9 /* MouseTargetType.CONTENT_WIDGET */ && mouseEvent.target.detail === debugHover_1.$zRb.ID) {
                return;
            }
            this.J();
        }
        L(mouseEvent) {
            if (this.q.state !== 2 /* State.Stopped */) {
                return;
            }
            const target = mouseEvent.target;
            const stopKey = env.$j ? 'metaKey' : 'ctrlKey';
            if (!this.m) {
                if (target.type === 2 /* MouseTargetType.GUTTER_GLYPH_MARGIN */) {
                    this.p.updateOptions({ hover: { enabled: true } });
                    this.i = true;
                }
                else if (this.i) {
                    this.i = false;
                    this.C();
                }
            }
            if (target.type === 9 /* MouseTargetType.CONTENT_WIDGET */ && target.detail === debugHover_1.$zRb.ID && !mouseEvent.event[stopKey]) {
                // mouse moved on top of debug hover widget
                return;
            }
            if (target.type === 6 /* MouseTargetType.CONTENT_TEXT */) {
                if (target.position && !position_1.$js.equals(target.position, this.f)) {
                    this.f = target.position;
                    this.I.cancel();
                    this.H.schedule();
                }
            }
            else if (!this.g) {
                // Do not hide debug hover when the mouse is pressed because it usually leads to accidental closing #64620
                this.J();
            }
        }
        M(e) {
            const stopKey = env.$j ? 57 /* KeyCode.Meta */ : 5 /* KeyCode.Ctrl */;
            if (e.keyCode !== stopKey) {
                // do not hide hover when Ctrl/Meta is pressed
                this.J();
            }
        }
        // end hover business
        // exception widget
        async N() {
            // Toggles exception widget based on the state of the current editor model and debug stack frame
            const model = this.p.getModel();
            const focusedSf = this.q.getViewModel().focusedStackFrame;
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
            const sameUri = this.x.extUri.isEqual(exceptionSf.source.uri, model.uri);
            if (this.j && !sameUri) {
                this.closeExceptionWidget();
            }
            else if (sameUri) {
                const exceptionInfo = await focusedSf.thread.exceptionInfo;
                if (exceptionInfo) {
                    this.O(exceptionInfo, this.q.getViewModel().focusedSession, exceptionSf.range.startLineNumber, exceptionSf.range.startColumn);
                }
            }
        }
        O(exceptionInfo, debugSession, lineNumber, column) {
            if (this.j) {
                this.j.dispose();
            }
            this.j = this.r.createInstance(exceptionWidget_1.$ARb, this.p, exceptionInfo, debugSession);
            this.j.show({ lineNumber, column }, 0);
            this.j.focus();
            this.p.revealRangeInCenter({
                startLineNumber: lineNumber,
                startColumn: column,
                endLineNumber: lineNumber,
                endColumn: column,
            });
            this.h.set(true);
        }
        closeExceptionWidget() {
            if (this.j) {
                const shouldFocusEditor = this.j.hasFocus();
                this.j.dispose();
                this.j = undefined;
                this.h.set(false);
                if (shouldFocusEditor) {
                    this.p.focus();
                }
            }
        }
        async addLaunchConfiguration() {
            const model = this.p.getModel();
            if (!model) {
                return;
            }
            let configurationsArrayPosition;
            let lastProperty;
            const getConfigurationPosition = () => {
                let depthInArray = 0;
                (0, json_1.$Sm)(model.getValue(), {
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
                const edit = ((0, path_1.$ae)(model.uri.fsPath) === 'launch.json') ?
                    (0, jsonEdit_1.$CS)(model.getValue(), ['configurations'], [], { tabSize, insertSpaces, eol })[0] :
                    (0, jsonEdit_1.$CS)(model.getValue(), ['launch'], { 'configurations': [] }, { tabSize, insertSpaces, eol })[0];
                const startPosition = model.getPositionAt(edit.offset);
                const lineNumber = startPosition.lineNumber;
                const range = new range_1.$ks(lineNumber, startPosition.column, lineNumber, model.getLineMaxColumn(lineNumber));
                model.pushEditOperations(null, [editOperation_1.$ls.replace(range, edit.content)], () => null);
                // Go through the file again since we've edited it
                getConfigurationPosition();
            }
            if (!configurationsArrayPosition) {
                return;
            }
            this.p.focus();
            const insertLine = (position) => {
                // Check if there are more characters on a line after a "configurations": [, if yes enter a newline
                if (model.getLineLastNonWhitespaceColumn(position.lineNumber) > position.column) {
                    this.p.setPosition(position);
                    coreCommands_1.CoreEditingCommands.LineBreakInsert.runEditorCommand(null, this.p, null);
                }
                this.p.setPosition(position);
                return this.t.executeCommand('editor.action.insertLineAfter');
            };
            await insertLine(configurationsArrayPosition);
            await this.t.executeCommand('editor.action.triggerSuggest');
        }
        // Inline Decorations
        get P() {
            return new async_1.$Sg(() => {
                this.n.clear();
            }, 100);
        }
        get Q() {
            const model = this.p.getModel();
            return new async_1.$Sg(async () => await this.R(this.q.getViewModel().focusedStackFrame), model ? this.o.get(model) : DEAFULT_INLINE_DEBOUNCE_DELAY);
        }
        async R(stackFrame) {
            const var_value_format = '{0} = {1}';
            const separator = ', ';
            const model = this.p.getModel();
            const inlineValuesSetting = this.u.getValue('debug').inlineValues;
            const inlineValuesTurnedOn = inlineValuesSetting === true || inlineValuesSetting === 'on' || (inlineValuesSetting === 'auto' && model && this.y.inlineValuesProvider.has(model));
            if (!inlineValuesTurnedOn || !model || !stackFrame || model.uri.toString() !== stackFrame.source.uri.toString()) {
                if (!this.P.isScheduled()) {
                    this.P.schedule();
                }
                return;
            }
            this.P.cancel();
            let allDecorations;
            if (this.y.inlineValuesProvider.has(model)) {
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
                    stoppedLocation: new range_1.$ks(stackFrame.range.startLineNumber, stackFrame.range.startColumn + 1, stackFrame.range.endLineNumber, stackFrame.range.endColumn + 1)
                };
                const token = new cancellation_1.$pd().token;
                const ranges = this.p.getVisibleRangesPlusViewportAboveBelow();
                const providers = this.y.inlineValuesProvider.ordered(model).reverse();
                allDecorations = [];
                const lineDecorations = new Map();
                const promises = (0, arrays_1.$Pb)(providers.map(provider => ranges.map(range => Promise.resolve(provider.provideInlineValues(model, range, ctx, token)).then(async (result) => {
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
                                        text = strings.$ne(var_value_format, va, value);
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
                                        const expression = new debugModel_1.$IFb(expr);
                                        await expression.evaluate(stackFrame.thread.session, stackFrame, 'watch', true);
                                        if (expression.available) {
                                            text = strings.$ne(var_value_format, expr, expression.value);
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
                    (0, errors_1.$Z)(err);
                }))));
                const startTime = Date.now();
                await Promise.all(promises);
                // update debounce info
                this.Q.delay = this.o.update(model, Date.now() - startTime);
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
                    let range = new range_1.$ks(0, 0, stackFrame.range.startLineNumber, stackFrame.range.startColumn);
                    if (scope.range) {
                        range = range.setStartPosition(scope.range.startLineNumber, scope.range.startColumn);
                    }
                    return createInlineValueDecorationsInsideRange(variables, range, model, this.B);
                }));
                allDecorations = (0, arrays_1.$Kb)(decorationsPerScope.reduce((previous, current) => previous.concat(current), []), 
                // Deduplicate decorations since same variable can appear in multiple scopes, leading to duplicated decorations #129770
                decoration => `${decoration.range.startLineNumber}:${decoration?.options.after?.content}`);
            }
            this.n.set(allDecorations);
        }
        dispose() {
            if (this.d) {
                this.d.dispose();
            }
            if (this.k) {
                this.k.dispose();
            }
            this.c = (0, lifecycle_1.$fc)(this.c);
            this.n.clear();
        }
    };
    exports.$DRb = $DRb;
    __decorate([
        decorators_1.$6g
    ], $DRb.prototype, "H", null);
    __decorate([
        decorators_1.$6g
    ], $DRb.prototype, "I", null);
    __decorate([
        decorators_1.$6g
    ], $DRb.prototype, "P", null);
    __decorate([
        decorators_1.$6g
    ], $DRb.prototype, "Q", null);
    exports.$DRb = $DRb = __decorate([
        __param(1, debug_1.$nH),
        __param(2, instantiation_1.$Ah),
        __param(3, commands_1.$Fr),
        __param(4, configuration_1.$8h),
        __param(5, host_1.$VT),
        __param(6, uriIdentity_1.$Ck),
        __param(7, contextkey_1.$3i),
        __param(8, languageFeatures_1.$hF),
        __param(9, languageFeatureDebounce_1.$52)
    ], $DRb);
    commands_1.$Gr.registerCommand('_executeInlineValueProvider', async (accessor, uri, iRange, context) => {
        (0, types_1.$tf)(uri_1.URI.isUri(uri));
        (0, types_1.$tf)(range_1.$ks.isIRange(iRange));
        if (!context || typeof context.frameId !== 'number' || !range_1.$ks.isIRange(context.stoppedLocation)) {
            throw (0, errors_1.$5)('context');
        }
        const model = accessor.get(model_2.$yA).getModel(uri);
        if (!model) {
            throw (0, errors_1.$5)('uri');
        }
        const range = range_1.$ks.lift(iRange);
        const { inlineValuesProvider } = accessor.get(languageFeatures_1.$hF);
        const providers = inlineValuesProvider.ordered(model);
        const providerResults = await Promise.all(providers.map(provider => provider.provideInlineValues(model, range, context, cancellation_1.CancellationToken.None)));
        return providerResults.flat().filter(types_1.$rf);
    });
});
//# sourceMappingURL=debugEditorContribution.js.map