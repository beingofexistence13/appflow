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
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/canIUse", "vs/base/browser/dom", "vs/base/browser/mouseEvent", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/decorators", "vs/base/common/errors", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/severity", "vs/base/common/strings", "vs/base/common/themables", "vs/base/common/uuid", "vs/editor/common/core/range", "vs/editor/common/languages/language", "vs/editor/common/model", "vs/nls!vs/workbench/contrib/debug/browser/breakpointEditorContribution", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/instantiation", "vs/platform/label/common/label", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/contrib/codeEditor/browser/editorLineNumberMenu", "vs/workbench/contrib/debug/browser/breakpointsView", "vs/workbench/contrib/debug/browser/breakpointWidget", "vs/workbench/contrib/debug/browser/debugIcons", "vs/workbench/contrib/debug/common/debug"], function (require, exports, browser_1, canIUse_1, dom, mouseEvent_1, actions_1, arrays_1, async_1, decorators_1, errors_1, htmlContent_1, lifecycle_1, env, severity_1, strings_1, themables_1, uuid_1, range_1, language_1, model_1, nls, configuration_1, contextkey_1, contextView_1, dialogs_1, instantiation_1, label_1, colorRegistry_1, themeService_1, editorLineNumberMenu_1, breakpointsView_1, breakpointWidget_1, icons, debug_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$dGb = exports.$cGb = exports.$bGb = void 0;
    const $ = dom.$;
    const breakpointHelperDecoration = {
        description: 'breakpoint-helper-decoration',
        glyphMarginClassName: themables_1.ThemeIcon.asClassName(icons.$6mb),
        glyphMargin: { position: model_1.GlyphMarginLane.Right },
        stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */
    };
    function $bGb(accessor, model, breakpoints, state, breakpointsActivated, showBreakpointsInOverviewRuler) {
        const result = [];
        breakpoints.forEach((breakpoint) => {
            if (breakpoint.lineNumber > model.getLineCount()) {
                return;
            }
            const hasOtherBreakpointsOnLine = breakpoints.some(bp => bp !== breakpoint && bp.lineNumber === breakpoint.lineNumber);
            const column = model.getLineFirstNonWhitespaceColumn(breakpoint.lineNumber);
            const range = model.validateRange(breakpoint.column ? new range_1.$ks(breakpoint.lineNumber, breakpoint.column, breakpoint.lineNumber, breakpoint.column + 1)
                : new range_1.$ks(breakpoint.lineNumber, column, breakpoint.lineNumber, column + 1) // Decoration has to have a width #20688
            );
            result.push({
                options: getBreakpointDecorationOptions(accessor, model, breakpoint, state, breakpointsActivated, showBreakpointsInOverviewRuler, hasOtherBreakpointsOnLine),
                range
            });
        });
        return result;
    }
    exports.$bGb = $bGb;
    function getBreakpointDecorationOptions(accessor, model, breakpoint, state, breakpointsActivated, showBreakpointsInOverviewRuler, hasOtherBreakpointsOnLine) {
        const debugService = accessor.get(debug_1.$nH);
        const languageService = accessor.get(language_1.$ct);
        const { icon, message, showAdapterUnverifiedMessage } = (0, breakpointsView_1.$_Fb)(state, breakpointsActivated, breakpoint, undefined);
        let glyphMarginHoverMessage;
        let unverifiedMessage;
        if (showAdapterUnverifiedMessage) {
            let langId;
            unverifiedMessage = debugService.getModel().getSessions().map(s => {
                const dbg = debugService.getAdapterManager().getDebugger(s.configuration.type);
                const message = dbg?.strings?.[debug_1.DebuggerString.UnverifiedBreakpoints];
                if (message) {
                    if (!langId) {
                        // Lazily compute this, only if needed for some debug adapter
                        langId = languageService.guessLanguageIdByFilepathOrFirstLine(breakpoint.uri) ?? undefined;
                    }
                    return langId && dbg.interestedInLanguage(langId) ? message : undefined;
                }
                return undefined;
            })
                .find(messages => !!messages);
        }
        if (message) {
            glyphMarginHoverMessage = new htmlContent_1.$Xj(undefined, { isTrusted: true, supportThemeIcons: true });
            if (breakpoint.condition || breakpoint.hitCondition) {
                const languageId = model.getLanguageId();
                glyphMarginHoverMessage.appendCodeblock(languageId, message);
                if (unverifiedMessage) {
                    glyphMarginHoverMessage.appendMarkdown('$(warning) ' + unverifiedMessage);
                }
            }
            else {
                glyphMarginHoverMessage.appendText(message);
                if (unverifiedMessage) {
                    glyphMarginHoverMessage.appendMarkdown('\n\n$(warning) ' + unverifiedMessage);
                }
            }
        }
        else if (unverifiedMessage) {
            glyphMarginHoverMessage = new htmlContent_1.$Xj(undefined, { isTrusted: true, supportThemeIcons: true }).appendMarkdown(unverifiedMessage);
        }
        let overviewRulerDecoration = null;
        if (showBreakpointsInOverviewRuler) {
            overviewRulerDecoration = {
                color: (0, themeService_1.$hv)(exports.$dGb),
                position: model_1.OverviewRulerLane.Left
            };
        }
        const renderInline = breakpoint.column && (hasOtherBreakpointsOnLine || breakpoint.column > model.getLineFirstNonWhitespaceColumn(breakpoint.lineNumber));
        return {
            description: 'breakpoint-decoration',
            glyphMargin: { position: model_1.GlyphMarginLane.Right },
            glyphMarginClassName: themables_1.ThemeIcon.asClassName(icon),
            glyphMarginHoverMessage,
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            before: renderInline ? {
                content: strings_1.$gf,
                inlineClassName: `debug-breakpoint-placeholder`,
                inlineClassNameAffectsLetterSpacing: true
            } : undefined,
            overviewRuler: overviewRulerDecoration,
            zIndex: 9999
        };
    }
    async function requestBreakpointCandidateLocations(model, lineNumbers, session) {
        if (!session.capabilities.supportsBreakpointLocationsRequest) {
            return [];
        }
        return await Promise.all((0, arrays_1.$Kb)(lineNumbers, l => l).map(async (lineNumber) => {
            try {
                return { lineNumber, positions: await session.breakpointsLocations(model.uri, lineNumber) };
            }
            catch {
                return { lineNumber, positions: [] };
            }
        }));
    }
    function createCandidateDecorations(model, breakpointDecorations, lineBreakpoints) {
        const result = [];
        for (const { positions, lineNumber } of lineBreakpoints) {
            if (positions.length === 0) {
                continue;
            }
            // Do not render candidates if there is only one, since it is already covered by the line breakpoint
            const firstColumn = model.getLineFirstNonWhitespaceColumn(lineNumber);
            const lastColumn = model.getLineLastNonWhitespaceColumn(lineNumber);
            positions.forEach(p => {
                const range = new range_1.$ks(p.lineNumber, p.column, p.lineNumber, p.column + 1);
                if ((p.column <= firstColumn && !breakpointDecorations.some(bp => bp.range.startColumn > firstColumn && bp.range.startLineNumber === p.lineNumber)) || p.column > lastColumn) {
                    // Do not render candidates on the start of the line if there's no other breakpoint on the line.
                    return;
                }
                const breakpointAtPosition = breakpointDecorations.find(bpd => bpd.range.equalsRange(range));
                if (breakpointAtPosition && breakpointAtPosition.inlineWidget) {
                    // Space already occupied, do not render candidate.
                    return;
                }
                result.push({
                    range,
                    options: {
                        description: 'breakpoint-placeholder-decoration',
                        stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
                        before: breakpointAtPosition ? undefined : {
                            content: strings_1.$gf,
                            inlineClassName: `debug-breakpoint-placeholder`,
                            inlineClassNameAffectsLetterSpacing: true
                        },
                    },
                    breakpoint: breakpointAtPosition ? breakpointAtPosition.breakpoint : undefined
                });
            });
        }
        return result;
    }
    let $cGb = class $cGb {
        constructor(q, r, t, u, contextKeyService, w, x, y) {
            this.q = q;
            this.r = r;
            this.t = t;
            this.u = u;
            this.w = w;
            this.x = x;
            this.y = y;
            this.a = null;
            this.h = [];
            this.j = false;
            this.k = false;
            this.m = [];
            this.n = [];
            this.g = debug_1.$AG.bindTo(contextKeyService);
            this.o = new async_1.$Sg(() => this.D(), 30);
            this.o.schedule();
            this.z();
        }
        /**
         * Returns context menu actions at the line number if breakpoints can be
         * set. This is used by the {@link TestingDecorations} to allow breakpoint
         * setting on lines where breakpoint "run" actions are present.
         */
        getContextMenuActionsAtPosition(lineNumber, model) {
            if (!this.r.getAdapterManager().hasEnabledDebuggers()) {
                return [];
            }
            if (!this.r.canSetBreakpointsIn(model)) {
                return [];
            }
            const breakpoints = this.r.getModel().getBreakpoints({ lineNumber, uri: model.uri });
            return this.A(breakpoints, model.uri, lineNumber);
        }
        z() {
            this.h.push(this.q.onMouseDown(async (e) => {
                if (!this.r.getAdapterManager().hasEnabledDebuggers()) {
                    return;
                }
                const model = this.q.getModel();
                if (!e.target.position
                    || !model
                    || e.target.type !== 2 /* MouseTargetType.GUTTER_GLYPH_MARGIN */
                    || e.target.detail.isAfterLines
                    || !this.B(e.target.position.lineNumber)
                        // don't return early if there's a breakpoint
                        && !e.target.element?.className.includes('breakpoint')) {
                    return;
                }
                const canSetBreakpoints = this.r.canSetBreakpointsIn(model);
                const lineNumber = e.target.position.lineNumber;
                const uri = model.uri;
                if (e.event.rightButton || (env.$j && e.event.leftButton && e.event.ctrlKey)) {
                    // handled by editor gutter context menu
                    return;
                }
                else {
                    const breakpoints = this.r.getModel().getBreakpoints({ uri, lineNumber });
                    if (breakpoints.length) {
                        const isShiftPressed = e.event.shiftKey;
                        const enabled = breakpoints.some(bp => bp.enabled);
                        if (isShiftPressed) {
                            breakpoints.forEach(bp => this.r.enableOrDisableBreakpoints(!enabled, bp));
                        }
                        else if (!env.$k && breakpoints.some(bp => !!bp.condition || !!bp.logMessage || !!bp.hitCondition)) {
                            // Show the dialog if there is a potential condition to be accidently lost.
                            // Do not show dialog on linux due to electron issue freezing the mouse #50026
                            const logPoint = breakpoints.every(bp => !!bp.logMessage);
                            const breakpointType = logPoint ? nls.localize(0, null) : nls.localize(1, null);
                            const disabledBreakpointDialogMessage = nls.localize(2, null, breakpointType.toLowerCase(), logPoint ? nls.localize(3, null) : nls.localize(4, null));
                            const enabledBreakpointDialogMessage = nls.localize(5, null, breakpointType.toLowerCase(), logPoint ? nls.localize(6, null) : nls.localize(7, null));
                            await this.w.prompt({
                                type: severity_1.default.Info,
                                message: enabled ? enabledBreakpointDialogMessage : disabledBreakpointDialogMessage,
                                buttons: [
                                    {
                                        label: nls.localize(8, null, breakpointType),
                                        run: () => breakpoints.forEach(bp => this.r.removeBreakpoints(bp.getId()))
                                    },
                                    {
                                        label: nls.localize(9, null, enabled ? nls.localize(10, null) : nls.localize(11, null), breakpointType),
                                        run: () => breakpoints.forEach(bp => this.r.enableOrDisableBreakpoints(!enabled, bp))
                                    }
                                ],
                                cancelButton: true
                            });
                        }
                        else {
                            if (!enabled) {
                                breakpoints.forEach(bp => this.r.enableOrDisableBreakpoints(!enabled, bp));
                            }
                            else {
                                breakpoints.forEach(bp => this.r.removeBreakpoints(bp.getId()));
                            }
                        }
                    }
                    else if (canSetBreakpoints) {
                        this.r.addBreakpoints(uri, [{ lineNumber }]);
                    }
                }
            }));
            if (!(canIUse_1.$bO.pointerEvents && browser_1.$8N)) {
                /**
                 * We disable the hover feature for Safari on iOS as
                 * 1. Browser hover events are handled specially by the system (it treats first click as hover if there is `:hover` css registered). Below hover behavior will confuse users with inconsistent expeirence.
                 * 2. When users click on line numbers, the breakpoint hint displays immediately, however it doesn't create the breakpoint unless users click on the left gutter. On a touch screen, it's hard to click on that small area.
                 */
                this.h.push(this.q.onMouseMove((e) => {
                    if (!this.r.getAdapterManager().hasEnabledDebuggers()) {
                        return;
                    }
                    let showBreakpointHintAtLineNumber = -1;
                    const model = this.q.getModel();
                    if (model && e.target.position && (e.target.type === 2 /* MouseTargetType.GUTTER_GLYPH_MARGIN */ || e.target.type === 3 /* MouseTargetType.GUTTER_LINE_NUMBERS */) && this.r.canSetBreakpointsIn(model) &&
                        this.B(e.target.position.lineNumber)) {
                        const data = e.target.detail;
                        if (!data.isAfterLines) {
                            showBreakpointHintAtLineNumber = e.target.position.lineNumber;
                        }
                    }
                    this.C(showBreakpointHintAtLineNumber);
                }));
                this.h.push(this.q.onMouseLeave(() => {
                    this.C(-1);
                }));
            }
            this.h.push(this.q.onDidChangeModel(async () => {
                this.closeBreakpointWidget();
                await this.D();
            }));
            this.h.push(this.r.getModel().onDidChangeBreakpoints(() => {
                if (!this.k && !this.o.isScheduled()) {
                    this.o.schedule();
                }
            }));
            this.h.push(this.r.onDidChangeState(() => {
                // We need to update breakpoint decorations when state changes since the top stack frame and breakpoint decoration might change
                if (!this.o.isScheduled()) {
                    this.o.schedule();
                }
            }));
            this.h.push(this.q.onDidChangeModelDecorations(() => this.E()));
            this.h.push(this.x.onDidChangeConfiguration(async (e) => {
                if (e.affectsConfiguration('debug.showBreakpointsInOverviewRuler') || e.affectsConfiguration('debug.showInlineBreakpointCandidates')) {
                    await this.D();
                }
            }));
        }
        A(breakpoints, uri, lineNumber, column) {
            const actions = [];
            if (breakpoints.length === 1) {
                const breakpointType = breakpoints[0].logMessage ? nls.localize(12, null) : nls.localize(13, null);
                actions.push(new actions_1.$gi('debug.removeBreakpoint', nls.localize(14, null, breakpointType), undefined, true, async () => {
                    await this.r.removeBreakpoints(breakpoints[0].getId());
                }));
                actions.push(new actions_1.$gi('workbench.debug.action.editBreakpointAction', nls.localize(15, null, breakpointType), undefined, true, () => Promise.resolve(this.showBreakpointWidget(breakpoints[0].lineNumber, breakpoints[0].column))));
                actions.push(new actions_1.$gi(`workbench.debug.viewlet.action.toggleBreakpoint`, breakpoints[0].enabled ? nls.localize(16, null, breakpointType) : nls.localize(17, null, breakpointType), undefined, true, () => this.r.enableOrDisableBreakpoints(!breakpoints[0].enabled, breakpoints[0])));
            }
            else if (breakpoints.length > 1) {
                const sorted = breakpoints.slice().sort((first, second) => (first.column && second.column) ? first.column - second.column : 1);
                actions.push(new actions_1.$ji('debug.removeBreakpoints', nls.localize(18, null), sorted.map(bp => new actions_1.$gi('removeInlineBreakpoint', bp.column ? nls.localize(19, null, bp.column) : nls.localize(20, null), undefined, true, () => this.r.removeBreakpoints(bp.getId())))));
                actions.push(new actions_1.$ji('debug.editBreakpoints', nls.localize(21, null), sorted.map(bp => new actions_1.$gi('editBreakpoint', bp.column ? nls.localize(22, null, bp.column) : nls.localize(23, null), undefined, true, () => Promise.resolve(this.showBreakpointWidget(bp.lineNumber, bp.column))))));
                actions.push(new actions_1.$ji('debug.enableDisableBreakpoints', nls.localize(24, null), sorted.map(bp => new actions_1.$gi(bp.enabled ? 'disableColumnBreakpoint' : 'enableColumnBreakpoint', bp.enabled ? (bp.column ? nls.localize(25, null, bp.column) : nls.localize(26, null))
                    : (bp.column ? nls.localize(27, null, bp.column) : nls.localize(28, null)), undefined, true, () => this.r.enableOrDisableBreakpoints(!bp.enabled, bp)))));
            }
            else {
                actions.push(new actions_1.$gi('addBreakpoint', nls.localize(29, null), undefined, true, () => this.r.addBreakpoints(uri, [{ lineNumber, column }])));
                actions.push(new actions_1.$gi('addConditionalBreakpoint', nls.localize(30, null), undefined, true, () => Promise.resolve(this.showBreakpointWidget(lineNumber, column, 0 /* BreakpointWidgetContext.CONDITION */))));
                actions.push(new actions_1.$gi('addLogPoint', nls.localize(31, null), undefined, true, () => Promise.resolve(this.showBreakpointWidget(lineNumber, column, 2 /* BreakpointWidgetContext.LOG_MESSAGE */))));
            }
            if (this.r.state === 2 /* State.Stopped */) {
                actions.push(new actions_1.$ii());
                actions.push(new actions_1.$gi('runToLine', nls.localize(32, null), undefined, true, () => this.r.runTo(uri, lineNumber).catch(errors_1.$Y)));
            }
            return actions;
        }
        B(line) {
            const decorations = this.q.getLineDecorations(line);
            if (decorations) {
                for (const { options } of decorations) {
                    const clz = options.glyphMarginClassName;
                    if (clz && (!clz.includes('codicon-') || clz.includes('codicon-testing-') || clz.includes('codicon-merge-') || clz.includes('codicon-arrow-') || clz.includes('codicon-loading') || clz.includes('codicon-fold'))) {
                        return false;
                    }
                }
            }
            return true;
        }
        C(showBreakpointHintAtLineNumber) {
            this.q.changeDecorations((accessor) => {
                if (this.a) {
                    accessor.removeDecoration(this.a);
                    this.a = null;
                }
                if (showBreakpointHintAtLineNumber !== -1) {
                    this.a = accessor.addDecoration({
                        startLineNumber: showBreakpointHintAtLineNumber,
                        startColumn: 1,
                        endLineNumber: showBreakpointHintAtLineNumber,
                        endColumn: 1
                    }, breakpointHelperDecoration);
                }
            });
        }
        async D() {
            if (!this.q.hasModel()) {
                return;
            }
            const setCandidateDecorations = (changeAccessor, desiredCandidatePositions) => {
                const desiredCandidateDecorations = createCandidateDecorations(model, this.m, desiredCandidatePositions);
                const candidateDecorationIds = changeAccessor.deltaDecorations(this.n.map(c => c.decorationId), desiredCandidateDecorations);
                this.n.forEach(candidate => {
                    candidate.inlineWidget.dispose();
                });
                this.n = candidateDecorationIds.map((decorationId, index) => {
                    const candidate = desiredCandidateDecorations[index];
                    // Candidate decoration has a breakpoint attached when a breakpoint is already at that location and we did not yet set a decoration there
                    // In practice this happens for the first breakpoint that was set on a line
                    // We could have also rendered this first decoration as part of desiredBreakpointDecorations however at that moment we have no location information
                    const icon = candidate.breakpoint ? (0, breakpointsView_1.$_Fb)(this.r.state, this.r.getModel().areBreakpointsActivated(), candidate.breakpoint, this.y).icon : icons.$1mb.disabled;
                    const contextMenuActions = () => this.A(candidate.breakpoint ? [candidate.breakpoint] : [], activeCodeEditor.getModel().uri, candidate.range.startLineNumber, candidate.range.startColumn);
                    const inlineWidget = new InlineBreakpointWidget(activeCodeEditor, decorationId, themables_1.ThemeIcon.asClassName(icon), candidate.breakpoint, this.r, this.t, contextMenuActions);
                    return {
                        decorationId,
                        inlineWidget
                    };
                });
            };
            const activeCodeEditor = this.q;
            const model = activeCodeEditor.getModel();
            const breakpoints = this.r.getModel().getBreakpoints({ uri: model.uri });
            const debugSettings = this.x.getValue('debug');
            const desiredBreakpointDecorations = this.u.invokeFunction(accessor => $bGb(accessor, model, breakpoints, this.r.state, this.r.getModel().areBreakpointsActivated(), debugSettings.showBreakpointsInOverviewRuler));
            // try to set breakpoint location candidates in the same changeDecorations()
            // call to avoid flickering, if the DA responds reasonably quickly.
            const session = this.r.getViewModel().focusedSession;
            const desiredCandidatePositions = debugSettings.showInlineBreakpointCandidates && session ? requestBreakpointCandidateLocations(this.q.getModel(), desiredBreakpointDecorations.map(bp => bp.range.startLineNumber), session) : Promise.resolve([]);
            const desiredCandidatePositionsRaced = await Promise.race([desiredCandidatePositions, (0, async_1.$Hg)(500).then(() => undefined)]);
            if (desiredCandidatePositionsRaced === undefined) { // the timeout resolved first
                desiredCandidatePositions.then(v => activeCodeEditor.changeDecorations(d => setCandidateDecorations(d, v)));
            }
            try {
                this.j = true;
                // Set breakpoint decorations
                activeCodeEditor.changeDecorations((changeAccessor) => {
                    const decorationIds = changeAccessor.deltaDecorations(this.m.map(bpd => bpd.decorationId), desiredBreakpointDecorations);
                    this.m.forEach(bpd => {
                        bpd.inlineWidget?.dispose();
                    });
                    this.m = decorationIds.map((decorationId, index) => {
                        let inlineWidget = undefined;
                        const breakpoint = breakpoints[index];
                        if (desiredBreakpointDecorations[index].options.before) {
                            const contextMenuActions = () => this.A([breakpoint], activeCodeEditor.getModel().uri, breakpoint.lineNumber, breakpoint.column);
                            inlineWidget = new InlineBreakpointWidget(activeCodeEditor, decorationId, desiredBreakpointDecorations[index].options.glyphMarginClassName, breakpoint, this.r, this.t, contextMenuActions);
                        }
                        return {
                            decorationId,
                            breakpoint,
                            range: desiredBreakpointDecorations[index].range,
                            inlineWidget
                        };
                    });
                    if (desiredCandidatePositionsRaced) {
                        setCandidateDecorations(changeAccessor, desiredCandidatePositionsRaced);
                    }
                });
            }
            finally {
                this.j = false;
            }
            for (const d of this.m) {
                if (d.inlineWidget) {
                    this.q.layoutContentWidget(d.inlineWidget);
                }
            }
        }
        async E() {
            if (this.m.length === 0 || this.j || !this.q.hasModel()) {
                // I have no decorations
                return;
            }
            let somethingChanged = false;
            const model = this.q.getModel();
            this.m.forEach(breakpointDecoration => {
                if (somethingChanged) {
                    return;
                }
                const newBreakpointRange = model.getDecorationRange(breakpointDecoration.decorationId);
                if (newBreakpointRange && (!breakpointDecoration.range.equalsRange(newBreakpointRange))) {
                    somethingChanged = true;
                    breakpointDecoration.range = newBreakpointRange;
                }
            });
            if (!somethingChanged) {
                // nothing to do, my decorations did not change.
                return;
            }
            const data = new Map();
            for (let i = 0, len = this.m.length; i < len; i++) {
                const breakpointDecoration = this.m[i];
                const decorationRange = model.getDecorationRange(breakpointDecoration.decorationId);
                // check if the line got deleted.
                if (decorationRange) {
                    // since we know it is collapsed, it cannot grow to multiple lines
                    if (breakpointDecoration.breakpoint) {
                        data.set(breakpointDecoration.breakpoint.getId(), {
                            lineNumber: decorationRange.startLineNumber,
                            column: breakpointDecoration.breakpoint.column ? decorationRange.startColumn : undefined,
                        });
                    }
                }
            }
            try {
                this.k = true;
                await this.r.updateBreakpoints(model.uri, data, true);
            }
            finally {
                this.k = false;
            }
        }
        // breakpoint widget
        showBreakpointWidget(lineNumber, column, context) {
            this.f?.dispose();
            this.f = this.u.createInstance(breakpointWidget_1.$aGb, this.q, lineNumber, column, context);
            this.f.show({ lineNumber, column: 1 });
            this.g.set(true);
        }
        closeBreakpointWidget() {
            if (this.f) {
                this.f.dispose();
                this.f = undefined;
                this.g.reset();
                this.q.focus();
            }
        }
        dispose() {
            this.f?.dispose();
            this.q.removeDecorations(this.m.map(bpd => bpd.decorationId));
            (0, lifecycle_1.$fc)(this.h);
        }
    };
    exports.$cGb = $cGb;
    exports.$cGb = $cGb = __decorate([
        __param(1, debug_1.$nH),
        __param(2, contextView_1.$WZ),
        __param(3, instantiation_1.$Ah),
        __param(4, contextkey_1.$3i),
        __param(5, dialogs_1.$oA),
        __param(6, configuration_1.$8h),
        __param(7, label_1.$Vz)
    ], $cGb);
    editorLineNumberMenu_1.$1Fb.registerGutterActionsGenerator(({ lineNumber, editor, accessor }, result) => {
        const model = editor.getModel();
        const debugService = accessor.get(debug_1.$nH);
        if (!model || !debugService.getAdapterManager().hasEnabledDebuggers() || !debugService.canSetBreakpointsIn(model)) {
            return;
        }
        const breakpointEditorContribution = editor.getContribution(debug_1.$iH);
        if (!breakpointEditorContribution) {
            return;
        }
        const actions = breakpointEditorContribution.getContextMenuActionsAtPosition(lineNumber, model);
        for (const action of actions) {
            result.push(action, '2_debug');
        }
    });
    class InlineBreakpointWidget {
        constructor(h, j, cssClass, k, m, n, o) {
            this.h = h;
            this.j = j;
            this.k = k;
            this.m = m;
            this.n = n;
            this.o = o;
            // editor.IContentWidget.allowEditorOverflow
            this.allowEditorOverflow = false;
            this.suppressMouseDown = true;
            this.g = [];
            this.f = this.h.getModel().getDecorationRange(j);
            this.g.push(this.h.onDidChangeModelDecorations(() => {
                const model = this.h.getModel();
                const range = model.getDecorationRange(this.j);
                if (this.f && !this.f.equalsRange(range)) {
                    this.f = range;
                    this.h.layoutContentWidget(this);
                }
            }));
            this.q(cssClass);
            this.h.addContentWidget(this);
            this.h.layoutContentWidget(this);
        }
        q(cssClass) {
            this.a = $('.inline-breakpoint-widget');
            if (cssClass) {
                this.a.classList.add(...cssClass.split(' '));
            }
            this.g.push(dom.$nO(this.a, dom.$3O.CLICK, async (e) => {
                switch (this.k?.enabled) {
                    case undefined:
                        await this.m.addBreakpoints(this.h.getModel().uri, [{ lineNumber: this.f.startLineNumber, column: this.f.startColumn }]);
                        break;
                    case true:
                        await this.m.removeBreakpoints(this.k.getId());
                        break;
                    case false:
                        this.m.enableOrDisableBreakpoints(true, this.k);
                        break;
                }
            }));
            this.g.push(dom.$nO(this.a, dom.$3O.CONTEXT_MENU, e => {
                const event = new mouseEvent_1.$eO(e);
                const actions = this.o();
                this.n.showContextMenu({
                    getAnchor: () => event,
                    getActions: () => actions,
                    getActionsContext: () => this.k,
                    onHide: () => (0, lifecycle_1.$gc)(actions)
                });
            }));
            const updateSize = () => {
                const lineHeight = this.h.getOption(66 /* EditorOption.lineHeight */);
                this.a.style.height = `${lineHeight}px`;
                this.a.style.width = `${Math.ceil(0.8 * lineHeight)}px`;
                this.a.style.marginLeft = `4px`;
            };
            updateSize();
            this.g.push(this.h.onDidChangeConfiguration(c => {
                if (c.hasChanged(52 /* EditorOption.fontSize */) || c.hasChanged(66 /* EditorOption.lineHeight */)) {
                    updateSize();
                }
            }));
        }
        getId() {
            return (0, uuid_1.$4f)();
        }
        getDomNode() {
            return this.a;
        }
        getPosition() {
            if (!this.f) {
                return null;
            }
            // Workaround: since the content widget can not be placed before the first column we need to force the left position
            this.a.classList.toggle('line-start', this.f.startColumn === 1);
            return {
                position: { lineNumber: this.f.startLineNumber, column: this.f.startColumn - 1 },
                preference: [0 /* ContentWidgetPositionPreference.EXACT */]
            };
        }
        dispose() {
            this.h.removeContentWidget(this);
            (0, lifecycle_1.$fc)(this.g);
        }
    }
    __decorate([
        decorators_1.$6g
    ], InlineBreakpointWidget.prototype, "getId", null);
    (0, themeService_1.$mv)((theme, collector) => {
        const debugIconBreakpointColor = theme.getColor(exports.$dGb);
        if (debugIconBreakpointColor) {
            collector.addRule(`
		${icons.$8mb.map(b => `.monaco-workbench ${themables_1.ThemeIcon.asCSSSelector(b.regular)}`).join(',\n		')},
		.monaco-workbench ${themables_1.ThemeIcon.asCSSSelector(icons.$7mb)},
		.monaco-workbench ${themables_1.ThemeIcon.asCSSSelector(icons.$6mb)}:not([class*='codicon-debug-breakpoint']):not([class*='codicon-debug-stackframe']),
		.monaco-workbench ${themables_1.ThemeIcon.asCSSSelector(icons.$1mb.regular)}${themables_1.ThemeIcon.asCSSSelector(icons.$0mb)}::after,
		.monaco-workbench ${themables_1.ThemeIcon.asCSSSelector(icons.$1mb.regular)}${themables_1.ThemeIcon.asCSSSelector(icons.$9mb)}::after {
			color: ${debugIconBreakpointColor} !important;
		}
		`);
        }
        const debugIconBreakpointDisabledColor = theme.getColor(debugIconBreakpointDisabledForeground);
        if (debugIconBreakpointDisabledColor) {
            collector.addRule(`
		${icons.$8mb.map(b => `.monaco-workbench ${themables_1.ThemeIcon.asCSSSelector(b.disabled)}`).join(',\n		')} {
			color: ${debugIconBreakpointDisabledColor};
		}
		`);
        }
        const debugIconBreakpointUnverifiedColor = theme.getColor(debugIconBreakpointUnverifiedForeground);
        if (debugIconBreakpointUnverifiedColor) {
            collector.addRule(`
		${icons.$8mb.map(b => `.monaco-workbench ${themables_1.ThemeIcon.asCSSSelector(b.unverified)}`).join(',\n		')} {
			color: ${debugIconBreakpointUnverifiedColor};
		}
		`);
        }
        const debugIconBreakpointCurrentStackframeForegroundColor = theme.getColor(debugIconBreakpointCurrentStackframeForeground);
        if (debugIconBreakpointCurrentStackframeForegroundColor) {
            collector.addRule(`
		.monaco-workbench ${themables_1.ThemeIcon.asCSSSelector(icons.$9mb)},
		.monaco-editor .debug-top-stack-frame-column {
			color: ${debugIconBreakpointCurrentStackframeForegroundColor} !important;
		}
		`);
        }
        const debugIconBreakpointStackframeFocusedColor = theme.getColor(debugIconBreakpointStackframeForeground);
        if (debugIconBreakpointStackframeFocusedColor) {
            collector.addRule(`
		.monaco-workbench ${themables_1.ThemeIcon.asCSSSelector(icons.$0mb)} {
			color: ${debugIconBreakpointStackframeFocusedColor} !important;
		}
		`);
        }
    });
    exports.$dGb = (0, colorRegistry_1.$sv)('debugIcon.breakpointForeground', { dark: '#E51400', light: '#E51400', hcDark: '#E51400', hcLight: '#E51400' }, nls.localize(33, null));
    const debugIconBreakpointDisabledForeground = (0, colorRegistry_1.$sv)('debugIcon.breakpointDisabledForeground', { dark: '#848484', light: '#848484', hcDark: '#848484', hcLight: '#848484' }, nls.localize(34, null));
    const debugIconBreakpointUnverifiedForeground = (0, colorRegistry_1.$sv)('debugIcon.breakpointUnverifiedForeground', { dark: '#848484', light: '#848484', hcDark: '#848484', hcLight: '#848484' }, nls.localize(35, null));
    const debugIconBreakpointCurrentStackframeForeground = (0, colorRegistry_1.$sv)('debugIcon.breakpointCurrentStackframeForeground', { dark: '#FFCC00', light: '#BE8700', hcDark: '#FFCC00', hcLight: '#BE8700' }, nls.localize(36, null));
    const debugIconBreakpointStackframeForeground = (0, colorRegistry_1.$sv)('debugIcon.breakpointStackframeForeground', { dark: '#89D185', light: '#89D185', hcDark: '#89D185', hcLight: '#89D185' }, nls.localize(37, null));
});
//# sourceMappingURL=breakpointEditorContribution.js.map