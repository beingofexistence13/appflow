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
define(["require", "exports", "vs/nls!vs/workbench/contrib/debug/browser/breakpointWidget", "vs/base/browser/ui/selectBox/selectBox", "vs/base/common/lifecycle", "vs/base/browser/dom", "vs/editor/common/core/position", "vs/editor/contrib/zoneWidget/browser/zoneWidget", "vs/platform/contextview/browser/contextView", "vs/workbench/contrib/debug/common/debug", "vs/platform/theme/common/themeService", "vs/platform/instantiation/common/instantiation", "vs/platform/contextkey/common/contextkey", "vs/editor/browser/editorExtensions", "vs/editor/common/editorContextKeys", "vs/editor/common/services/model", "vs/base/common/uri", "vs/editor/contrib/suggest/browser/suggest", "vs/editor/browser/services/codeEditorService", "vs/platform/theme/common/colorRegistry", "vs/platform/instantiation/common/serviceCollection", "vs/editor/browser/widget/codeEditorWidget", "vs/workbench/contrib/codeEditor/browser/simpleEditorOptions", "vs/editor/common/core/range", "vs/base/common/errors", "vs/platform/configuration/common/configuration", "vs/editor/common/languages/modesRegistry", "vs/editor/common/services/languageFeatures", "vs/platform/theme/browser/defaultStyles", "vs/platform/keybinding/common/keybinding", "vs/css!./media/breakpointWidget"], function (require, exports, nls, selectBox_1, lifecycle, dom, position_1, zoneWidget_1, contextView_1, debug_1, themeService_1, instantiation_1, contextkey_1, editorExtensions_1, editorContextKeys_1, model_1, uri_1, suggest_1, codeEditorService_1, colorRegistry_1, serviceCollection_1, codeEditorWidget_1, simpleEditorOptions_1, range_1, errors_1, configuration_1, modesRegistry_1, languageFeatures_1, defaultStyles_1, keybinding_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$aGb = void 0;
    const $ = dom.$;
    const IPrivateBreakpointWidgetService = (0, instantiation_1.$Bh)('privateBreakpointWidgetService');
    const DECORATION_KEY = 'breakpointwidgetdecoration';
    function isPositionInCurlyBracketBlock(input) {
        const model = input.getModel();
        const bracketPairs = model.bracketPairs.getBracketPairsInRange(range_1.$ks.fromPositions(input.getPosition()));
        return bracketPairs.some(p => p.openingBracketInfo.bracketText === '{');
    }
    function createDecorations(theme, placeHolder) {
        const transparentForeground = theme.getColor(colorRegistry_1.$xw)?.transparent(0.4);
        return [{
                range: {
                    startLineNumber: 0,
                    endLineNumber: 0,
                    startColumn: 0,
                    endColumn: 1
                },
                renderOptions: {
                    after: {
                        contentText: placeHolder,
                        color: transparentForeground ? transparentForeground.toString() : undefined
                    }
                }
            }];
    }
    let $aGb = class $aGb extends zoneWidget_1.$z3 {
        constructor(editor, v, J, context, K, L, M, N, O, P, Q, R, S, T) {
            super(editor, { showFrame: true, showArrow: false, frameWidth: 1, isAccessible: true });
            this.v = v;
            this.J = J;
            this.K = K;
            this.L = L;
            this.M = M;
            this.N = N;
            this.O = O;
            this.P = P;
            this.Q = Q;
            this.R = R;
            this.S = S;
            this.T = T;
            this.h = '';
            this.i = '';
            this.l = '';
            this.d = [];
            const model = this.editor.getModel();
            if (model) {
                const uri = model.uri;
                const breakpoints = this.L.getModel().getBreakpoints({ lineNumber: this.v, column: this.J, uri });
                this.m = breakpoints.length ? breakpoints[0] : undefined;
            }
            if (context === undefined) {
                if (this.m && !this.m.condition && !this.m.hitCondition && this.m.logMessage) {
                    this.r = 2 /* Context.LOG_MESSAGE */;
                }
                else if (this.m && !this.m.condition && this.m.hitCondition) {
                    this.r = 1 /* Context.HIT_COUNT */;
                }
                else {
                    this.r = 0 /* Context.CONDITION */;
                }
            }
            else {
                this.r = context;
            }
            this.d.push(this.L.getModel().onDidChangeBreakpoints(e => {
                if (this.m && e && e.removed && e.removed.indexOf(this.m) >= 0) {
                    this.dispose();
                }
            }));
            this.Q.registerDecorationType('breakpoint-widget', DECORATION_KEY, {});
            this.create();
        }
        get U() {
            const acceptString = this.T.lookupKeybinding(AcceptBreakpointWidgetInputAction.ID)?.getLabel() || 'Enter';
            const closeString = this.T.lookupKeybinding(CloseBreakpointWidgetCommand.ID)?.getLabel() || 'Escape';
            switch (this.r) {
                case 2 /* Context.LOG_MESSAGE */:
                    return nls.localize(0, null, acceptString, closeString);
                case 1 /* Context.HIT_COUNT */:
                    return nls.localize(1, null, acceptString, closeString);
                default:
                    return nls.localize(2, null, acceptString, closeString);
            }
        }
        V(breakpoint) {
            switch (this.r) {
                case 2 /* Context.LOG_MESSAGE */:
                    return breakpoint && breakpoint.logMessage ? breakpoint.logMessage : this.l;
                case 1 /* Context.HIT_COUNT */:
                    return breakpoint && breakpoint.hitCondition ? breakpoint.hitCondition : this.i;
                default:
                    return breakpoint && breakpoint.condition ? breakpoint.condition : this.h;
            }
        }
        W() {
            const value = this.c.getModel().getValue();
            switch (this.r) {
                case 2 /* Context.LOG_MESSAGE */:
                    this.l = value;
                    break;
                case 1 /* Context.HIT_COUNT */:
                    this.i = value;
                    break;
                default:
                    this.h = value;
            }
        }
        X() {
            if (this.editor.hasModel()) {
                // Use plaintext language for log messages, otherwise respect underlying editor language #125619
                const languageId = this.r === 2 /* Context.LOG_MESSAGE */ ? modesRegistry_1.$Yt : this.editor.getModel().getLanguageId();
                this.c.getModel().setLanguage(languageId);
            }
        }
        show(rangeOrPos) {
            const lineNum = this.c.getModel().getLineCount();
            super.show(rangeOrPos, lineNum + 1);
        }
        fitHeightToContent() {
            const lineNum = this.c.getModel().getLineCount();
            this.H(lineNum + 1);
        }
        E(container) {
            this.D('breakpoint-widget');
            const selectBox = new selectBox_1.$HQ([{ text: nls.localize(3, null) }, { text: nls.localize(4, null) }, { text: nls.localize(5, null) }], this.r, this.K, defaultStyles_1.$B2, { ariaLabel: nls.localize(6, null) });
            this.a = $('.breakpoint-select-container');
            selectBox.render(dom.$0O(container, this.a));
            selectBox.onDidSelect(e => {
                this.W();
                this.r = e.index;
                this.X();
                const value = this.V(this.m);
                this.c.getModel().setValue(value);
                this.c.focus();
            });
            this.b = $('.inputContainer');
            this.bb(dom.$0O(container, this.b));
            this.c.getModel().setValue(this.V(this.m));
            this.d.push(this.c.getModel().onDidChangeContent(() => {
                this.fitHeightToContent();
            }));
            this.c.setPosition({ lineNumber: 1, column: this.c.getModel().getLineMaxColumn(1) });
            // Due to an electron bug we have to do the timeout, otherwise we do not get focus
            setTimeout(() => this.c.focus(), 150);
        }
        G(heightInPixel, widthInPixel) {
            this.t = heightInPixel;
            this.c.layout({ height: heightInPixel, width: widthInPixel - 113 });
            this.db();
        }
        F(widthInPixel) {
            if (typeof this.t === 'number') {
                this.G(this.t, widthInPixel);
            }
        }
        bb(container) {
            const scopedContextKeyService = this.N.createScoped(container);
            this.d.push(scopedContextKeyService);
            const scopedInstatiationService = this.O.createChild(new serviceCollection_1.$zh([contextkey_1.$3i, scopedContextKeyService], [IPrivateBreakpointWidgetService, this]));
            const options = this.cb();
            const codeEditorWidgetOptions = (0, simpleEditorOptions_1.$vqb)();
            this.c = scopedInstatiationService.createInstance(codeEditorWidget_1.$uY, container, options, codeEditorWidgetOptions);
            debug_1.$BG.bindTo(scopedContextKeyService).set(true);
            const model = this.P.createModel('', null, uri_1.URI.parse(`${debug_1.$jH}:${this.editor.getId()}:breakpointinput`), true);
            if (this.editor.hasModel()) {
                model.setLanguage(this.editor.getModel().getLanguageId());
            }
            this.c.setModel(model);
            this.X();
            this.d.push(model);
            const setDecorations = () => {
                const value = this.c.getModel().getValue();
                const decorations = !!value ? [] : createDecorations(this.M.getColorTheme(), this.U);
                this.c.setDecorationsByType('breakpoint-widget', DECORATION_KEY, decorations);
            };
            this.c.getModel().onDidChangeContent(() => setDecorations());
            this.M.onDidColorThemeChange(() => setDecorations());
            this.d.push(this.S.completionProvider.register({ scheme: debug_1.$jH, hasAccessToAllModels: true }, {
                _debugDisplayName: 'breakpointWidget',
                provideCompletionItems: (model, position, _context, token) => {
                    let suggestionsPromise;
                    const underlyingModel = this.editor.getModel();
                    if (underlyingModel && (this.r === 0 /* Context.CONDITION */ || (this.r === 2 /* Context.LOG_MESSAGE */ && isPositionInCurlyBracketBlock(this.c)))) {
                        suggestionsPromise = (0, suggest_1.$35)(this.S.completionProvider, underlyingModel, new position_1.$js(this.v, 1), new suggest_1.$Y5(undefined, new Set().add(27 /* CompletionItemKind.Snippet */)), _context, token).then(suggestions => {
                            let overwriteBefore = 0;
                            if (this.r === 0 /* Context.CONDITION */) {
                                overwriteBefore = position.column - 1;
                            }
                            else {
                                // Inside the currly brackets, need to count how many useful characters are behind the position so they would all be taken into account
                                const value = this.c.getModel().getValue();
                                while ((position.column - 2 - overwriteBefore >= 0) && value[position.column - 2 - overwriteBefore] !== '{' && value[position.column - 2 - overwriteBefore] !== ' ') {
                                    overwriteBefore++;
                                }
                            }
                            return {
                                suggestions: suggestions.items.map(s => {
                                    s.completion.range = range_1.$ks.fromPositions(position.delta(0, -overwriteBefore), position);
                                    return s.completion;
                                })
                            };
                        });
                    }
                    else {
                        suggestionsPromise = Promise.resolve({ suggestions: [] });
                    }
                    return suggestionsPromise;
                }
            }));
            this.d.push(this.R.onDidChangeConfiguration((e) => {
                if (e.affectsConfiguration('editor.fontSize') || e.affectsConfiguration('editor.lineHeight')) {
                    this.c.updateOptions(this.cb());
                    this.db();
                }
            }));
        }
        cb() {
            const editorConfig = this.R.getValue('editor');
            const options = (0, simpleEditorOptions_1.$uqb)(this.R);
            options.fontSize = editorConfig.fontSize;
            options.fontFamily = editorConfig.fontFamily;
            options.lineHeight = editorConfig.lineHeight;
            options.fontLigatures = editorConfig.fontLigatures;
            options.ariaLabel = this.U;
            return options;
        }
        db() {
            if (this.container && typeof this.t === 'number') {
                const lineHeight = this.c.getOption(66 /* EditorOption.lineHeight */);
                const lineNum = this.c.getModel().getLineCount();
                const newTopMargin = (this.t - lineNum * lineHeight) / 2;
                this.b.style.marginTop = newTopMargin + 'px';
            }
        }
        close(success) {
            if (success) {
                // if there is already a breakpoint on this location - remove it.
                let condition = this.m && this.m.condition;
                let hitCondition = this.m && this.m.hitCondition;
                let logMessage = this.m && this.m.logMessage;
                this.W();
                if (this.h || this.r === 0 /* Context.CONDITION */) {
                    condition = this.h;
                }
                if (this.i || this.r === 1 /* Context.HIT_COUNT */) {
                    hitCondition = this.i;
                }
                if (this.l || this.r === 2 /* Context.LOG_MESSAGE */) {
                    logMessage = this.l;
                }
                if (this.m) {
                    const data = new Map();
                    data.set(this.m.getId(), {
                        condition,
                        hitCondition,
                        logMessage
                    });
                    this.L.updateBreakpoints(this.m.originalUri, data, false).then(undefined, errors_1.$Y);
                }
                else {
                    const model = this.editor.getModel();
                    if (model) {
                        this.L.addBreakpoints(model.uri, [{
                                lineNumber: this.v,
                                column: this.J,
                                enabled: true,
                                condition,
                                hitCondition,
                                logMessage
                            }]);
                    }
                }
            }
            this.dispose();
        }
        dispose() {
            super.dispose();
            this.c.dispose();
            lifecycle.$fc(this.d);
            setTimeout(() => this.editor.focus(), 0);
        }
    };
    exports.$aGb = $aGb;
    exports.$aGb = $aGb = __decorate([
        __param(4, contextView_1.$VZ),
        __param(5, debug_1.$nH),
        __param(6, themeService_1.$gv),
        __param(7, contextkey_1.$3i),
        __param(8, instantiation_1.$Ah),
        __param(9, model_1.$yA),
        __param(10, codeEditorService_1.$nV),
        __param(11, configuration_1.$8h),
        __param(12, languageFeatures_1.$hF),
        __param(13, keybinding_1.$2D)
    ], $aGb);
    class AcceptBreakpointWidgetInputAction extends editorExtensions_1.$rV {
        static { this.ID = 'breakpointWidget.action.acceptInput'; }
        constructor() {
            super({
                id: AcceptBreakpointWidgetInputAction.ID,
                precondition: debug_1.$AG,
                kbOpts: {
                    kbExpr: debug_1.$BG,
                    primary: 3 /* KeyCode.Enter */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        runEditorCommand(accessor, editor) {
            accessor.get(IPrivateBreakpointWidgetService).close(true);
        }
    }
    class CloseBreakpointWidgetCommand extends editorExtensions_1.$rV {
        static { this.ID = 'closeBreakpointWidget'; }
        constructor() {
            super({
                id: CloseBreakpointWidgetCommand.ID,
                precondition: debug_1.$AG,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 9 /* KeyCode.Escape */,
                    secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */],
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        runEditorCommand(accessor, editor, args) {
            const debugContribution = editor.getContribution(debug_1.$iH);
            if (debugContribution) {
                // if focus is in outer editor we need to use the debug contribution to close
                return debugContribution.closeBreakpointWidget();
            }
            accessor.get(IPrivateBreakpointWidgetService).close(false);
        }
    }
    (0, editorExtensions_1.$wV)(new AcceptBreakpointWidgetInputAction());
    (0, editorExtensions_1.$wV)(new CloseBreakpointWidgetCommand());
});
//# sourceMappingURL=breakpointWidget.js.map