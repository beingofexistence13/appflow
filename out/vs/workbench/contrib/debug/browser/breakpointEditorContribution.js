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
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/canIUse", "vs/base/browser/dom", "vs/base/browser/mouseEvent", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/decorators", "vs/base/common/errors", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/severity", "vs/base/common/strings", "vs/base/common/themables", "vs/base/common/uuid", "vs/editor/common/core/range", "vs/editor/common/languages/language", "vs/editor/common/model", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/instantiation", "vs/platform/label/common/label", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/contrib/codeEditor/browser/editorLineNumberMenu", "vs/workbench/contrib/debug/browser/breakpointsView", "vs/workbench/contrib/debug/browser/breakpointWidget", "vs/workbench/contrib/debug/browser/debugIcons", "vs/workbench/contrib/debug/common/debug"], function (require, exports, browser_1, canIUse_1, dom, mouseEvent_1, actions_1, arrays_1, async_1, decorators_1, errors_1, htmlContent_1, lifecycle_1, env, severity_1, strings_1, themables_1, uuid_1, range_1, language_1, model_1, nls, configuration_1, contextkey_1, contextView_1, dialogs_1, instantiation_1, label_1, colorRegistry_1, themeService_1, editorLineNumberMenu_1, breakpointsView_1, breakpointWidget_1, icons, debug_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.debugIconBreakpointForeground = exports.BreakpointEditorContribution = exports.createBreakpointDecorations = void 0;
    const $ = dom.$;
    const breakpointHelperDecoration = {
        description: 'breakpoint-helper-decoration',
        glyphMarginClassName: themables_1.ThemeIcon.asClassName(icons.debugBreakpointHint),
        glyphMargin: { position: model_1.GlyphMarginLane.Right },
        stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */
    };
    function createBreakpointDecorations(accessor, model, breakpoints, state, breakpointsActivated, showBreakpointsInOverviewRuler) {
        const result = [];
        breakpoints.forEach((breakpoint) => {
            if (breakpoint.lineNumber > model.getLineCount()) {
                return;
            }
            const hasOtherBreakpointsOnLine = breakpoints.some(bp => bp !== breakpoint && bp.lineNumber === breakpoint.lineNumber);
            const column = model.getLineFirstNonWhitespaceColumn(breakpoint.lineNumber);
            const range = model.validateRange(breakpoint.column ? new range_1.Range(breakpoint.lineNumber, breakpoint.column, breakpoint.lineNumber, breakpoint.column + 1)
                : new range_1.Range(breakpoint.lineNumber, column, breakpoint.lineNumber, column + 1) // Decoration has to have a width #20688
            );
            result.push({
                options: getBreakpointDecorationOptions(accessor, model, breakpoint, state, breakpointsActivated, showBreakpointsInOverviewRuler, hasOtherBreakpointsOnLine),
                range
            });
        });
        return result;
    }
    exports.createBreakpointDecorations = createBreakpointDecorations;
    function getBreakpointDecorationOptions(accessor, model, breakpoint, state, breakpointsActivated, showBreakpointsInOverviewRuler, hasOtherBreakpointsOnLine) {
        const debugService = accessor.get(debug_1.IDebugService);
        const languageService = accessor.get(language_1.ILanguageService);
        const { icon, message, showAdapterUnverifiedMessage } = (0, breakpointsView_1.getBreakpointMessageAndIcon)(state, breakpointsActivated, breakpoint, undefined);
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
            glyphMarginHoverMessage = new htmlContent_1.MarkdownString(undefined, { isTrusted: true, supportThemeIcons: true });
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
            glyphMarginHoverMessage = new htmlContent_1.MarkdownString(undefined, { isTrusted: true, supportThemeIcons: true }).appendMarkdown(unverifiedMessage);
        }
        let overviewRulerDecoration = null;
        if (showBreakpointsInOverviewRuler) {
            overviewRulerDecoration = {
                color: (0, themeService_1.themeColorFromId)(exports.debugIconBreakpointForeground),
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
                content: strings_1.noBreakWhitespace,
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
        return await Promise.all((0, arrays_1.distinct)(lineNumbers, l => l).map(async (lineNumber) => {
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
                const range = new range_1.Range(p.lineNumber, p.column, p.lineNumber, p.column + 1);
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
                            content: strings_1.noBreakWhitespace,
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
    let BreakpointEditorContribution = class BreakpointEditorContribution {
        constructor(editor, debugService, contextMenuService, instantiationService, contextKeyService, dialogService, configurationService, labelService) {
            this.editor = editor;
            this.debugService = debugService;
            this.contextMenuService = contextMenuService;
            this.instantiationService = instantiationService;
            this.dialogService = dialogService;
            this.configurationService = configurationService;
            this.labelService = labelService;
            this.breakpointHintDecoration = null;
            this.toDispose = [];
            this.ignoreDecorationsChangedEvent = false;
            this.ignoreBreakpointsChangeEvent = false;
            this.breakpointDecorations = [];
            this.candidateDecorations = [];
            this.breakpointWidgetVisible = debug_1.CONTEXT_BREAKPOINT_WIDGET_VISIBLE.bindTo(contextKeyService);
            this.setDecorationsScheduler = new async_1.RunOnceScheduler(() => this.setDecorations(), 30);
            this.setDecorationsScheduler.schedule();
            this.registerListeners();
        }
        /**
         * Returns context menu actions at the line number if breakpoints can be
         * set. This is used by the {@link TestingDecorations} to allow breakpoint
         * setting on lines where breakpoint "run" actions are present.
         */
        getContextMenuActionsAtPosition(lineNumber, model) {
            if (!this.debugService.getAdapterManager().hasEnabledDebuggers()) {
                return [];
            }
            if (!this.debugService.canSetBreakpointsIn(model)) {
                return [];
            }
            const breakpoints = this.debugService.getModel().getBreakpoints({ lineNumber, uri: model.uri });
            return this.getContextMenuActions(breakpoints, model.uri, lineNumber);
        }
        registerListeners() {
            this.toDispose.push(this.editor.onMouseDown(async (e) => {
                if (!this.debugService.getAdapterManager().hasEnabledDebuggers()) {
                    return;
                }
                const model = this.editor.getModel();
                if (!e.target.position
                    || !model
                    || e.target.type !== 2 /* MouseTargetType.GUTTER_GLYPH_MARGIN */
                    || e.target.detail.isAfterLines
                    || !this.marginFreeFromNonDebugDecorations(e.target.position.lineNumber)
                        // don't return early if there's a breakpoint
                        && !e.target.element?.className.includes('breakpoint')) {
                    return;
                }
                const canSetBreakpoints = this.debugService.canSetBreakpointsIn(model);
                const lineNumber = e.target.position.lineNumber;
                const uri = model.uri;
                if (e.event.rightButton || (env.isMacintosh && e.event.leftButton && e.event.ctrlKey)) {
                    // handled by editor gutter context menu
                    return;
                }
                else {
                    const breakpoints = this.debugService.getModel().getBreakpoints({ uri, lineNumber });
                    if (breakpoints.length) {
                        const isShiftPressed = e.event.shiftKey;
                        const enabled = breakpoints.some(bp => bp.enabled);
                        if (isShiftPressed) {
                            breakpoints.forEach(bp => this.debugService.enableOrDisableBreakpoints(!enabled, bp));
                        }
                        else if (!env.isLinux && breakpoints.some(bp => !!bp.condition || !!bp.logMessage || !!bp.hitCondition)) {
                            // Show the dialog if there is a potential condition to be accidently lost.
                            // Do not show dialog on linux due to electron issue freezing the mouse #50026
                            const logPoint = breakpoints.every(bp => !!bp.logMessage);
                            const breakpointType = logPoint ? nls.localize('logPoint', "Logpoint") : nls.localize('breakpoint', "Breakpoint");
                            const disabledBreakpointDialogMessage = nls.localize('breakpointHasConditionDisabled', "This {0} has a {1} that will get lost on remove. Consider enabling the {0} instead.", breakpointType.toLowerCase(), logPoint ? nls.localize('message', "message") : nls.localize('condition', "condition"));
                            const enabledBreakpointDialogMessage = nls.localize('breakpointHasConditionEnabled', "This {0} has a {1} that will get lost on remove. Consider disabling the {0} instead.", breakpointType.toLowerCase(), logPoint ? nls.localize('message', "message") : nls.localize('condition', "condition"));
                            await this.dialogService.prompt({
                                type: severity_1.default.Info,
                                message: enabled ? enabledBreakpointDialogMessage : disabledBreakpointDialogMessage,
                                buttons: [
                                    {
                                        label: nls.localize({ key: 'removeLogPoint', comment: ['&& denotes a mnemonic'] }, "&&Remove {0}", breakpointType),
                                        run: () => breakpoints.forEach(bp => this.debugService.removeBreakpoints(bp.getId()))
                                    },
                                    {
                                        label: nls.localize('disableLogPoint', "{0} {1}", enabled ? nls.localize({ key: 'disable', comment: ['&& denotes a mnemonic'] }, "&&Disable") : nls.localize({ key: 'enable', comment: ['&& denotes a mnemonic'] }, "&&Enable"), breakpointType),
                                        run: () => breakpoints.forEach(bp => this.debugService.enableOrDisableBreakpoints(!enabled, bp))
                                    }
                                ],
                                cancelButton: true
                            });
                        }
                        else {
                            if (!enabled) {
                                breakpoints.forEach(bp => this.debugService.enableOrDisableBreakpoints(!enabled, bp));
                            }
                            else {
                                breakpoints.forEach(bp => this.debugService.removeBreakpoints(bp.getId()));
                            }
                        }
                    }
                    else if (canSetBreakpoints) {
                        this.debugService.addBreakpoints(uri, [{ lineNumber }]);
                    }
                }
            }));
            if (!(canIUse_1.BrowserFeatures.pointerEvents && browser_1.isSafari)) {
                /**
                 * We disable the hover feature for Safari on iOS as
                 * 1. Browser hover events are handled specially by the system (it treats first click as hover if there is `:hover` css registered). Below hover behavior will confuse users with inconsistent expeirence.
                 * 2. When users click on line numbers, the breakpoint hint displays immediately, however it doesn't create the breakpoint unless users click on the left gutter. On a touch screen, it's hard to click on that small area.
                 */
                this.toDispose.push(this.editor.onMouseMove((e) => {
                    if (!this.debugService.getAdapterManager().hasEnabledDebuggers()) {
                        return;
                    }
                    let showBreakpointHintAtLineNumber = -1;
                    const model = this.editor.getModel();
                    if (model && e.target.position && (e.target.type === 2 /* MouseTargetType.GUTTER_GLYPH_MARGIN */ || e.target.type === 3 /* MouseTargetType.GUTTER_LINE_NUMBERS */) && this.debugService.canSetBreakpointsIn(model) &&
                        this.marginFreeFromNonDebugDecorations(e.target.position.lineNumber)) {
                        const data = e.target.detail;
                        if (!data.isAfterLines) {
                            showBreakpointHintAtLineNumber = e.target.position.lineNumber;
                        }
                    }
                    this.ensureBreakpointHintDecoration(showBreakpointHintAtLineNumber);
                }));
                this.toDispose.push(this.editor.onMouseLeave(() => {
                    this.ensureBreakpointHintDecoration(-1);
                }));
            }
            this.toDispose.push(this.editor.onDidChangeModel(async () => {
                this.closeBreakpointWidget();
                await this.setDecorations();
            }));
            this.toDispose.push(this.debugService.getModel().onDidChangeBreakpoints(() => {
                if (!this.ignoreBreakpointsChangeEvent && !this.setDecorationsScheduler.isScheduled()) {
                    this.setDecorationsScheduler.schedule();
                }
            }));
            this.toDispose.push(this.debugService.onDidChangeState(() => {
                // We need to update breakpoint decorations when state changes since the top stack frame and breakpoint decoration might change
                if (!this.setDecorationsScheduler.isScheduled()) {
                    this.setDecorationsScheduler.schedule();
                }
            }));
            this.toDispose.push(this.editor.onDidChangeModelDecorations(() => this.onModelDecorationsChanged()));
            this.toDispose.push(this.configurationService.onDidChangeConfiguration(async (e) => {
                if (e.affectsConfiguration('debug.showBreakpointsInOverviewRuler') || e.affectsConfiguration('debug.showInlineBreakpointCandidates')) {
                    await this.setDecorations();
                }
            }));
        }
        getContextMenuActions(breakpoints, uri, lineNumber, column) {
            const actions = [];
            if (breakpoints.length === 1) {
                const breakpointType = breakpoints[0].logMessage ? nls.localize('logPoint', "Logpoint") : nls.localize('breakpoint', "Breakpoint");
                actions.push(new actions_1.Action('debug.removeBreakpoint', nls.localize('removeBreakpoint', "Remove {0}", breakpointType), undefined, true, async () => {
                    await this.debugService.removeBreakpoints(breakpoints[0].getId());
                }));
                actions.push(new actions_1.Action('workbench.debug.action.editBreakpointAction', nls.localize('editBreakpoint', "Edit {0}...", breakpointType), undefined, true, () => Promise.resolve(this.showBreakpointWidget(breakpoints[0].lineNumber, breakpoints[0].column))));
                actions.push(new actions_1.Action(`workbench.debug.viewlet.action.toggleBreakpoint`, breakpoints[0].enabled ? nls.localize('disableBreakpoint', "Disable {0}", breakpointType) : nls.localize('enableBreakpoint', "Enable {0}", breakpointType), undefined, true, () => this.debugService.enableOrDisableBreakpoints(!breakpoints[0].enabled, breakpoints[0])));
            }
            else if (breakpoints.length > 1) {
                const sorted = breakpoints.slice().sort((first, second) => (first.column && second.column) ? first.column - second.column : 1);
                actions.push(new actions_1.SubmenuAction('debug.removeBreakpoints', nls.localize('removeBreakpoints', "Remove Breakpoints"), sorted.map(bp => new actions_1.Action('removeInlineBreakpoint', bp.column ? nls.localize('removeInlineBreakpointOnColumn', "Remove Inline Breakpoint on Column {0}", bp.column) : nls.localize('removeLineBreakpoint', "Remove Line Breakpoint"), undefined, true, () => this.debugService.removeBreakpoints(bp.getId())))));
                actions.push(new actions_1.SubmenuAction('debug.editBreakpoints', nls.localize('editBreakpoints', "Edit Breakpoints"), sorted.map(bp => new actions_1.Action('editBreakpoint', bp.column ? nls.localize('editInlineBreakpointOnColumn', "Edit Inline Breakpoint on Column {0}", bp.column) : nls.localize('editLineBreakpoint', "Edit Line Breakpoint"), undefined, true, () => Promise.resolve(this.showBreakpointWidget(bp.lineNumber, bp.column))))));
                actions.push(new actions_1.SubmenuAction('debug.enableDisableBreakpoints', nls.localize('enableDisableBreakpoints', "Enable/Disable Breakpoints"), sorted.map(bp => new actions_1.Action(bp.enabled ? 'disableColumnBreakpoint' : 'enableColumnBreakpoint', bp.enabled ? (bp.column ? nls.localize('disableInlineColumnBreakpoint', "Disable Inline Breakpoint on Column {0}", bp.column) : nls.localize('disableBreakpointOnLine', "Disable Line Breakpoint"))
                    : (bp.column ? nls.localize('enableBreakpoints', "Enable Inline Breakpoint on Column {0}", bp.column) : nls.localize('enableBreakpointOnLine', "Enable Line Breakpoint")), undefined, true, () => this.debugService.enableOrDisableBreakpoints(!bp.enabled, bp)))));
            }
            else {
                actions.push(new actions_1.Action('addBreakpoint', nls.localize('addBreakpoint', "Add Breakpoint"), undefined, true, () => this.debugService.addBreakpoints(uri, [{ lineNumber, column }])));
                actions.push(new actions_1.Action('addConditionalBreakpoint', nls.localize('addConditionalBreakpoint', "Add Conditional Breakpoint..."), undefined, true, () => Promise.resolve(this.showBreakpointWidget(lineNumber, column, 0 /* BreakpointWidgetContext.CONDITION */))));
                actions.push(new actions_1.Action('addLogPoint', nls.localize('addLogPoint', "Add Logpoint..."), undefined, true, () => Promise.resolve(this.showBreakpointWidget(lineNumber, column, 2 /* BreakpointWidgetContext.LOG_MESSAGE */))));
            }
            if (this.debugService.state === 2 /* State.Stopped */) {
                actions.push(new actions_1.Separator());
                actions.push(new actions_1.Action('runToLine', nls.localize('runToLine', "Run to Line"), undefined, true, () => this.debugService.runTo(uri, lineNumber).catch(errors_1.onUnexpectedError)));
            }
            return actions;
        }
        marginFreeFromNonDebugDecorations(line) {
            const decorations = this.editor.getLineDecorations(line);
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
        ensureBreakpointHintDecoration(showBreakpointHintAtLineNumber) {
            this.editor.changeDecorations((accessor) => {
                if (this.breakpointHintDecoration) {
                    accessor.removeDecoration(this.breakpointHintDecoration);
                    this.breakpointHintDecoration = null;
                }
                if (showBreakpointHintAtLineNumber !== -1) {
                    this.breakpointHintDecoration = accessor.addDecoration({
                        startLineNumber: showBreakpointHintAtLineNumber,
                        startColumn: 1,
                        endLineNumber: showBreakpointHintAtLineNumber,
                        endColumn: 1
                    }, breakpointHelperDecoration);
                }
            });
        }
        async setDecorations() {
            if (!this.editor.hasModel()) {
                return;
            }
            const setCandidateDecorations = (changeAccessor, desiredCandidatePositions) => {
                const desiredCandidateDecorations = createCandidateDecorations(model, this.breakpointDecorations, desiredCandidatePositions);
                const candidateDecorationIds = changeAccessor.deltaDecorations(this.candidateDecorations.map(c => c.decorationId), desiredCandidateDecorations);
                this.candidateDecorations.forEach(candidate => {
                    candidate.inlineWidget.dispose();
                });
                this.candidateDecorations = candidateDecorationIds.map((decorationId, index) => {
                    const candidate = desiredCandidateDecorations[index];
                    // Candidate decoration has a breakpoint attached when a breakpoint is already at that location and we did not yet set a decoration there
                    // In practice this happens for the first breakpoint that was set on a line
                    // We could have also rendered this first decoration as part of desiredBreakpointDecorations however at that moment we have no location information
                    const icon = candidate.breakpoint ? (0, breakpointsView_1.getBreakpointMessageAndIcon)(this.debugService.state, this.debugService.getModel().areBreakpointsActivated(), candidate.breakpoint, this.labelService).icon : icons.breakpoint.disabled;
                    const contextMenuActions = () => this.getContextMenuActions(candidate.breakpoint ? [candidate.breakpoint] : [], activeCodeEditor.getModel().uri, candidate.range.startLineNumber, candidate.range.startColumn);
                    const inlineWidget = new InlineBreakpointWidget(activeCodeEditor, decorationId, themables_1.ThemeIcon.asClassName(icon), candidate.breakpoint, this.debugService, this.contextMenuService, contextMenuActions);
                    return {
                        decorationId,
                        inlineWidget
                    };
                });
            };
            const activeCodeEditor = this.editor;
            const model = activeCodeEditor.getModel();
            const breakpoints = this.debugService.getModel().getBreakpoints({ uri: model.uri });
            const debugSettings = this.configurationService.getValue('debug');
            const desiredBreakpointDecorations = this.instantiationService.invokeFunction(accessor => createBreakpointDecorations(accessor, model, breakpoints, this.debugService.state, this.debugService.getModel().areBreakpointsActivated(), debugSettings.showBreakpointsInOverviewRuler));
            // try to set breakpoint location candidates in the same changeDecorations()
            // call to avoid flickering, if the DA responds reasonably quickly.
            const session = this.debugService.getViewModel().focusedSession;
            const desiredCandidatePositions = debugSettings.showInlineBreakpointCandidates && session ? requestBreakpointCandidateLocations(this.editor.getModel(), desiredBreakpointDecorations.map(bp => bp.range.startLineNumber), session) : Promise.resolve([]);
            const desiredCandidatePositionsRaced = await Promise.race([desiredCandidatePositions, (0, async_1.timeout)(500).then(() => undefined)]);
            if (desiredCandidatePositionsRaced === undefined) { // the timeout resolved first
                desiredCandidatePositions.then(v => activeCodeEditor.changeDecorations(d => setCandidateDecorations(d, v)));
            }
            try {
                this.ignoreDecorationsChangedEvent = true;
                // Set breakpoint decorations
                activeCodeEditor.changeDecorations((changeAccessor) => {
                    const decorationIds = changeAccessor.deltaDecorations(this.breakpointDecorations.map(bpd => bpd.decorationId), desiredBreakpointDecorations);
                    this.breakpointDecorations.forEach(bpd => {
                        bpd.inlineWidget?.dispose();
                    });
                    this.breakpointDecorations = decorationIds.map((decorationId, index) => {
                        let inlineWidget = undefined;
                        const breakpoint = breakpoints[index];
                        if (desiredBreakpointDecorations[index].options.before) {
                            const contextMenuActions = () => this.getContextMenuActions([breakpoint], activeCodeEditor.getModel().uri, breakpoint.lineNumber, breakpoint.column);
                            inlineWidget = new InlineBreakpointWidget(activeCodeEditor, decorationId, desiredBreakpointDecorations[index].options.glyphMarginClassName, breakpoint, this.debugService, this.contextMenuService, contextMenuActions);
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
                this.ignoreDecorationsChangedEvent = false;
            }
            for (const d of this.breakpointDecorations) {
                if (d.inlineWidget) {
                    this.editor.layoutContentWidget(d.inlineWidget);
                }
            }
        }
        async onModelDecorationsChanged() {
            if (this.breakpointDecorations.length === 0 || this.ignoreDecorationsChangedEvent || !this.editor.hasModel()) {
                // I have no decorations
                return;
            }
            let somethingChanged = false;
            const model = this.editor.getModel();
            this.breakpointDecorations.forEach(breakpointDecoration => {
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
            for (let i = 0, len = this.breakpointDecorations.length; i < len; i++) {
                const breakpointDecoration = this.breakpointDecorations[i];
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
                this.ignoreBreakpointsChangeEvent = true;
                await this.debugService.updateBreakpoints(model.uri, data, true);
            }
            finally {
                this.ignoreBreakpointsChangeEvent = false;
            }
        }
        // breakpoint widget
        showBreakpointWidget(lineNumber, column, context) {
            this.breakpointWidget?.dispose();
            this.breakpointWidget = this.instantiationService.createInstance(breakpointWidget_1.BreakpointWidget, this.editor, lineNumber, column, context);
            this.breakpointWidget.show({ lineNumber, column: 1 });
            this.breakpointWidgetVisible.set(true);
        }
        closeBreakpointWidget() {
            if (this.breakpointWidget) {
                this.breakpointWidget.dispose();
                this.breakpointWidget = undefined;
                this.breakpointWidgetVisible.reset();
                this.editor.focus();
            }
        }
        dispose() {
            this.breakpointWidget?.dispose();
            this.editor.removeDecorations(this.breakpointDecorations.map(bpd => bpd.decorationId));
            (0, lifecycle_1.dispose)(this.toDispose);
        }
    };
    exports.BreakpointEditorContribution = BreakpointEditorContribution;
    exports.BreakpointEditorContribution = BreakpointEditorContribution = __decorate([
        __param(1, debug_1.IDebugService),
        __param(2, contextView_1.IContextMenuService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, dialogs_1.IDialogService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, label_1.ILabelService)
    ], BreakpointEditorContribution);
    editorLineNumberMenu_1.GutterActionsRegistry.registerGutterActionsGenerator(({ lineNumber, editor, accessor }, result) => {
        const model = editor.getModel();
        const debugService = accessor.get(debug_1.IDebugService);
        if (!model || !debugService.getAdapterManager().hasEnabledDebuggers() || !debugService.canSetBreakpointsIn(model)) {
            return;
        }
        const breakpointEditorContribution = editor.getContribution(debug_1.BREAKPOINT_EDITOR_CONTRIBUTION_ID);
        if (!breakpointEditorContribution) {
            return;
        }
        const actions = breakpointEditorContribution.getContextMenuActionsAtPosition(lineNumber, model);
        for (const action of actions) {
            result.push(action, '2_debug');
        }
    });
    class InlineBreakpointWidget {
        constructor(editor, decorationId, cssClass, breakpoint, debugService, contextMenuService, getContextMenuActions) {
            this.editor = editor;
            this.decorationId = decorationId;
            this.breakpoint = breakpoint;
            this.debugService = debugService;
            this.contextMenuService = contextMenuService;
            this.getContextMenuActions = getContextMenuActions;
            // editor.IContentWidget.allowEditorOverflow
            this.allowEditorOverflow = false;
            this.suppressMouseDown = true;
            this.toDispose = [];
            this.range = this.editor.getModel().getDecorationRange(decorationId);
            this.toDispose.push(this.editor.onDidChangeModelDecorations(() => {
                const model = this.editor.getModel();
                const range = model.getDecorationRange(this.decorationId);
                if (this.range && !this.range.equalsRange(range)) {
                    this.range = range;
                    this.editor.layoutContentWidget(this);
                }
            }));
            this.create(cssClass);
            this.editor.addContentWidget(this);
            this.editor.layoutContentWidget(this);
        }
        create(cssClass) {
            this.domNode = $('.inline-breakpoint-widget');
            if (cssClass) {
                this.domNode.classList.add(...cssClass.split(' '));
            }
            this.toDispose.push(dom.addDisposableListener(this.domNode, dom.EventType.CLICK, async (e) => {
                switch (this.breakpoint?.enabled) {
                    case undefined:
                        await this.debugService.addBreakpoints(this.editor.getModel().uri, [{ lineNumber: this.range.startLineNumber, column: this.range.startColumn }]);
                        break;
                    case true:
                        await this.debugService.removeBreakpoints(this.breakpoint.getId());
                        break;
                    case false:
                        this.debugService.enableOrDisableBreakpoints(true, this.breakpoint);
                        break;
                }
            }));
            this.toDispose.push(dom.addDisposableListener(this.domNode, dom.EventType.CONTEXT_MENU, e => {
                const event = new mouseEvent_1.StandardMouseEvent(e);
                const actions = this.getContextMenuActions();
                this.contextMenuService.showContextMenu({
                    getAnchor: () => event,
                    getActions: () => actions,
                    getActionsContext: () => this.breakpoint,
                    onHide: () => (0, lifecycle_1.disposeIfDisposable)(actions)
                });
            }));
            const updateSize = () => {
                const lineHeight = this.editor.getOption(66 /* EditorOption.lineHeight */);
                this.domNode.style.height = `${lineHeight}px`;
                this.domNode.style.width = `${Math.ceil(0.8 * lineHeight)}px`;
                this.domNode.style.marginLeft = `4px`;
            };
            updateSize();
            this.toDispose.push(this.editor.onDidChangeConfiguration(c => {
                if (c.hasChanged(52 /* EditorOption.fontSize */) || c.hasChanged(66 /* EditorOption.lineHeight */)) {
                    updateSize();
                }
            }));
        }
        getId() {
            return (0, uuid_1.generateUuid)();
        }
        getDomNode() {
            return this.domNode;
        }
        getPosition() {
            if (!this.range) {
                return null;
            }
            // Workaround: since the content widget can not be placed before the first column we need to force the left position
            this.domNode.classList.toggle('line-start', this.range.startColumn === 1);
            return {
                position: { lineNumber: this.range.startLineNumber, column: this.range.startColumn - 1 },
                preference: [0 /* ContentWidgetPositionPreference.EXACT */]
            };
        }
        dispose() {
            this.editor.removeContentWidget(this);
            (0, lifecycle_1.dispose)(this.toDispose);
        }
    }
    __decorate([
        decorators_1.memoize
    ], InlineBreakpointWidget.prototype, "getId", null);
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const debugIconBreakpointColor = theme.getColor(exports.debugIconBreakpointForeground);
        if (debugIconBreakpointColor) {
            collector.addRule(`
		${icons.allBreakpoints.map(b => `.monaco-workbench ${themables_1.ThemeIcon.asCSSSelector(b.regular)}`).join(',\n		')},
		.monaco-workbench ${themables_1.ThemeIcon.asCSSSelector(icons.debugBreakpointUnsupported)},
		.monaco-workbench ${themables_1.ThemeIcon.asCSSSelector(icons.debugBreakpointHint)}:not([class*='codicon-debug-breakpoint']):not([class*='codicon-debug-stackframe']),
		.monaco-workbench ${themables_1.ThemeIcon.asCSSSelector(icons.breakpoint.regular)}${themables_1.ThemeIcon.asCSSSelector(icons.debugStackframeFocused)}::after,
		.monaco-workbench ${themables_1.ThemeIcon.asCSSSelector(icons.breakpoint.regular)}${themables_1.ThemeIcon.asCSSSelector(icons.debugStackframe)}::after {
			color: ${debugIconBreakpointColor} !important;
		}
		`);
        }
        const debugIconBreakpointDisabledColor = theme.getColor(debugIconBreakpointDisabledForeground);
        if (debugIconBreakpointDisabledColor) {
            collector.addRule(`
		${icons.allBreakpoints.map(b => `.monaco-workbench ${themables_1.ThemeIcon.asCSSSelector(b.disabled)}`).join(',\n		')} {
			color: ${debugIconBreakpointDisabledColor};
		}
		`);
        }
        const debugIconBreakpointUnverifiedColor = theme.getColor(debugIconBreakpointUnverifiedForeground);
        if (debugIconBreakpointUnverifiedColor) {
            collector.addRule(`
		${icons.allBreakpoints.map(b => `.monaco-workbench ${themables_1.ThemeIcon.asCSSSelector(b.unverified)}`).join(',\n		')} {
			color: ${debugIconBreakpointUnverifiedColor};
		}
		`);
        }
        const debugIconBreakpointCurrentStackframeForegroundColor = theme.getColor(debugIconBreakpointCurrentStackframeForeground);
        if (debugIconBreakpointCurrentStackframeForegroundColor) {
            collector.addRule(`
		.monaco-workbench ${themables_1.ThemeIcon.asCSSSelector(icons.debugStackframe)},
		.monaco-editor .debug-top-stack-frame-column {
			color: ${debugIconBreakpointCurrentStackframeForegroundColor} !important;
		}
		`);
        }
        const debugIconBreakpointStackframeFocusedColor = theme.getColor(debugIconBreakpointStackframeForeground);
        if (debugIconBreakpointStackframeFocusedColor) {
            collector.addRule(`
		.monaco-workbench ${themables_1.ThemeIcon.asCSSSelector(icons.debugStackframeFocused)} {
			color: ${debugIconBreakpointStackframeFocusedColor} !important;
		}
		`);
        }
    });
    exports.debugIconBreakpointForeground = (0, colorRegistry_1.registerColor)('debugIcon.breakpointForeground', { dark: '#E51400', light: '#E51400', hcDark: '#E51400', hcLight: '#E51400' }, nls.localize('debugIcon.breakpointForeground', 'Icon color for breakpoints.'));
    const debugIconBreakpointDisabledForeground = (0, colorRegistry_1.registerColor)('debugIcon.breakpointDisabledForeground', { dark: '#848484', light: '#848484', hcDark: '#848484', hcLight: '#848484' }, nls.localize('debugIcon.breakpointDisabledForeground', 'Icon color for disabled breakpoints.'));
    const debugIconBreakpointUnverifiedForeground = (0, colorRegistry_1.registerColor)('debugIcon.breakpointUnverifiedForeground', { dark: '#848484', light: '#848484', hcDark: '#848484', hcLight: '#848484' }, nls.localize('debugIcon.breakpointUnverifiedForeground', 'Icon color for unverified breakpoints.'));
    const debugIconBreakpointCurrentStackframeForeground = (0, colorRegistry_1.registerColor)('debugIcon.breakpointCurrentStackframeForeground', { dark: '#FFCC00', light: '#BE8700', hcDark: '#FFCC00', hcLight: '#BE8700' }, nls.localize('debugIcon.breakpointCurrentStackframeForeground', 'Icon color for the current breakpoint stack frame.'));
    const debugIconBreakpointStackframeForeground = (0, colorRegistry_1.registerColor)('debugIcon.breakpointStackframeForeground', { dark: '#89D185', light: '#89D185', hcDark: '#89D185', hcLight: '#89D185' }, nls.localize('debugIcon.breakpointStackframeForeground', 'Icon color for all breakpoint stack frames.'));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJlYWtwb2ludEVkaXRvckNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2RlYnVnL2Jyb3dzZXIvYnJlYWtwb2ludEVkaXRvckNvbnRyaWJ1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUF3Q2hHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFTaEIsTUFBTSwwQkFBMEIsR0FBNEI7UUFDM0QsV0FBVyxFQUFFLDhCQUE4QjtRQUMzQyxvQkFBb0IsRUFBRSxxQkFBUyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUM7UUFDdEUsV0FBVyxFQUFFLEVBQUUsUUFBUSxFQUFFLHVCQUFlLENBQUMsS0FBSyxFQUFFO1FBQ2hELFVBQVUsNERBQW9EO0tBQzlELENBQUM7SUFFRixTQUFnQiwyQkFBMkIsQ0FBQyxRQUEwQixFQUFFLEtBQWlCLEVBQUUsV0FBdUMsRUFBRSxLQUFZLEVBQUUsb0JBQTZCLEVBQUUsOEJBQXVDO1FBQ3ZOLE1BQU0sTUFBTSxHQUF5RCxFQUFFLENBQUM7UUFDeEUsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFVBQVUsRUFBRSxFQUFFO1lBQ2xDLElBQUksVUFBVSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUMsWUFBWSxFQUFFLEVBQUU7Z0JBQ2pELE9BQU87YUFDUDtZQUNELE1BQU0seUJBQXlCLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxVQUFVLElBQUksRUFBRSxDQUFDLFVBQVUsS0FBSyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDdkgsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLCtCQUErQixDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUM1RSxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsYUFBYSxDQUNoQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLGFBQUssQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztnQkFDcEgsQ0FBQyxDQUFDLElBQUksYUFBSyxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsTUFBTSxFQUFFLFVBQVUsQ0FBQyxVQUFVLEVBQUUsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLHdDQUF3QzthQUN2SCxDQUFDO1lBRUYsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDWCxPQUFPLEVBQUUsOEJBQThCLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLG9CQUFvQixFQUFFLDhCQUE4QixFQUFFLHlCQUF5QixDQUFDO2dCQUM1SixLQUFLO2FBQ0wsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLE1BQU0sQ0FBQztJQUNmLENBQUM7SUFwQkQsa0VBb0JDO0lBRUQsU0FBUyw4QkFBOEIsQ0FBQyxRQUEwQixFQUFFLEtBQWlCLEVBQUUsVUFBdUIsRUFBRSxLQUFZLEVBQUUsb0JBQTZCLEVBQUUsOEJBQXVDLEVBQUUseUJBQWtDO1FBQ3ZPLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMscUJBQWEsQ0FBQyxDQUFDO1FBQ2pELE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsMkJBQWdCLENBQUMsQ0FBQztRQUN2RCxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSw0QkFBNEIsRUFBRSxHQUFHLElBQUEsNkNBQTJCLEVBQUMsS0FBSyxFQUFFLG9CQUFvQixFQUFFLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUN4SSxJQUFJLHVCQUFtRCxDQUFDO1FBRXhELElBQUksaUJBQXFDLENBQUM7UUFDMUMsSUFBSSw0QkFBNEIsRUFBRTtZQUNqQyxJQUFJLE1BQTBCLENBQUM7WUFDL0IsaUJBQWlCLEdBQUcsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDakUsTUFBTSxHQUFHLEdBQUcsWUFBWSxDQUFDLGlCQUFpQixFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQy9FLE1BQU0sT0FBTyxHQUFHLEdBQUcsRUFBRSxPQUFPLEVBQUUsQ0FBQyxzQkFBYyxDQUFDLHFCQUFxQixDQUFDLENBQUM7Z0JBQ3JFLElBQUksT0FBTyxFQUFFO29CQUNaLElBQUksQ0FBQyxNQUFNLEVBQUU7d0JBQ1osNkRBQTZEO3dCQUM3RCxNQUFNLEdBQUcsZUFBZSxDQUFDLG9DQUFvQyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxTQUFTLENBQUM7cUJBQzNGO29CQUNELE9BQU8sTUFBTSxJQUFJLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7aUJBQ3hFO2dCQUVELE9BQU8sU0FBUyxDQUFDO1lBQ2xCLENBQUMsQ0FBQztpQkFDQSxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDL0I7UUFFRCxJQUFJLE9BQU8sRUFBRTtZQUNaLHVCQUF1QixHQUFHLElBQUksNEJBQWMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFDdEcsSUFBSSxVQUFVLENBQUMsU0FBUyxJQUFJLFVBQVUsQ0FBQyxZQUFZLEVBQUU7Z0JBQ3BELE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDekMsdUJBQXVCLENBQUMsZUFBZSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDN0QsSUFBSSxpQkFBaUIsRUFBRTtvQkFDdEIsdUJBQXVCLENBQUMsY0FBYyxDQUFDLGFBQWEsR0FBRyxpQkFBaUIsQ0FBQyxDQUFDO2lCQUMxRTthQUNEO2lCQUFNO2dCQUNOLHVCQUF1QixDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDNUMsSUFBSSxpQkFBaUIsRUFBRTtvQkFDdEIsdUJBQXVCLENBQUMsY0FBYyxDQUFDLGlCQUFpQixHQUFHLGlCQUFpQixDQUFDLENBQUM7aUJBQzlFO2FBQ0Q7U0FDRDthQUFNLElBQUksaUJBQWlCLEVBQUU7WUFDN0IsdUJBQXVCLEdBQUcsSUFBSSw0QkFBYyxDQUFDLFNBQVMsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxjQUFjLENBQUMsaUJBQWlCLENBQUMsQ0FBQztTQUN4STtRQUVELElBQUksdUJBQXVCLEdBQWdELElBQUksQ0FBQztRQUNoRixJQUFJLDhCQUE4QixFQUFFO1lBQ25DLHVCQUF1QixHQUFHO2dCQUN6QixLQUFLLEVBQUUsSUFBQSwrQkFBZ0IsRUFBQyxxQ0FBNkIsQ0FBQztnQkFDdEQsUUFBUSxFQUFFLHlCQUFpQixDQUFDLElBQUk7YUFDaEMsQ0FBQztTQUNGO1FBRUQsTUFBTSxZQUFZLEdBQUcsVUFBVSxDQUFDLE1BQU0sSUFBSSxDQUFDLHlCQUF5QixJQUFJLFVBQVUsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLCtCQUErQixDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQzFKLE9BQU87WUFDTixXQUFXLEVBQUUsdUJBQXVCO1lBQ3BDLFdBQVcsRUFBRSxFQUFFLFFBQVEsRUFBRSx1QkFBZSxDQUFDLEtBQUssRUFBRTtZQUNoRCxvQkFBb0IsRUFBRSxxQkFBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUM7WUFDakQsdUJBQXVCO1lBQ3ZCLFVBQVUsNERBQW9EO1lBQzlELE1BQU0sRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDO2dCQUN0QixPQUFPLEVBQUUsMkJBQWlCO2dCQUMxQixlQUFlLEVBQUUsOEJBQThCO2dCQUMvQyxtQ0FBbUMsRUFBRSxJQUFJO2FBQ3pDLENBQUMsQ0FBQyxDQUFDLFNBQVM7WUFDYixhQUFhLEVBQUUsdUJBQXVCO1lBQ3RDLE1BQU0sRUFBRSxJQUFJO1NBQ1osQ0FBQztJQUNILENBQUM7SUFJRCxLQUFLLFVBQVUsbUNBQW1DLENBQUMsS0FBaUIsRUFBRSxXQUFxQixFQUFFLE9BQXNCO1FBQ2xILElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLGtDQUFrQyxFQUFFO1lBQzdELE9BQU8sRUFBRSxDQUFDO1NBQ1Y7UUFFRCxPQUFPLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFBLGlCQUFRLEVBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBQyxVQUFVLEVBQUMsRUFBRTtZQUM3RSxJQUFJO2dCQUNILE9BQU8sRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLE1BQU0sT0FBTyxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLEVBQUUsQ0FBQzthQUM1RjtZQUFDLE1BQU07Z0JBQ1AsT0FBTyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLENBQUM7YUFDckM7UUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELFNBQVMsMEJBQTBCLENBQUMsS0FBaUIsRUFBRSxxQkFBOEMsRUFBRSxlQUFxQztRQUMzSSxNQUFNLE1BQU0sR0FBOEYsRUFBRSxDQUFDO1FBQzdHLEtBQUssTUFBTSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsSUFBSSxlQUFlLEVBQUU7WUFDeEQsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDM0IsU0FBUzthQUNUO1lBRUQsb0dBQW9HO1lBQ3BHLE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN0RSxNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsOEJBQThCLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDcEUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDckIsTUFBTSxLQUFLLEdBQUcsSUFBSSxhQUFLLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDNUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksV0FBVyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBQUcsV0FBVyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsZUFBZSxLQUFLLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEdBQUcsVUFBVSxFQUFFO29CQUM3SyxnR0FBZ0c7b0JBQ2hHLE9BQU87aUJBQ1A7Z0JBRUQsTUFBTSxvQkFBb0IsR0FBRyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUM3RixJQUFJLG9CQUFvQixJQUFJLG9CQUFvQixDQUFDLFlBQVksRUFBRTtvQkFDOUQsbURBQW1EO29CQUNuRCxPQUFPO2lCQUNQO2dCQUNELE1BQU0sQ0FBQyxJQUFJLENBQUM7b0JBQ1gsS0FBSztvQkFDTCxPQUFPLEVBQUU7d0JBQ1IsV0FBVyxFQUFFLG1DQUFtQzt3QkFDaEQsVUFBVSw0REFBb0Q7d0JBQzlELE1BQU0sRUFBRSxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQzs0QkFDMUMsT0FBTyxFQUFFLDJCQUFpQjs0QkFDMUIsZUFBZSxFQUFFLDhCQUE4Qjs0QkFDL0MsbUNBQW1DLEVBQUUsSUFBSTt5QkFDekM7cUJBQ0Q7b0JBQ0QsVUFBVSxFQUFFLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFNBQVM7aUJBQzlFLENBQUMsQ0FBQztZQUNKLENBQUMsQ0FBQyxDQUFDO1NBQ0g7UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNmLENBQUM7SUFFTSxJQUFNLDRCQUE0QixHQUFsQyxNQUFNLDRCQUE0QjtRQVl4QyxZQUNrQixNQUFtQixFQUNyQixZQUE0QyxFQUN0QyxrQkFBd0QsRUFDdEQsb0JBQTRELEVBQy9ELGlCQUFxQyxFQUN6QyxhQUE4QyxFQUN2QyxvQkFBNEQsRUFDcEUsWUFBNEM7WUFQMUMsV0FBTSxHQUFOLE1BQU0sQ0FBYTtZQUNKLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQ3JCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFDckMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUVsRCxrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFDdEIseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUNuRCxpQkFBWSxHQUFaLFlBQVksQ0FBZTtZQWxCcEQsNkJBQXdCLEdBQWtCLElBQUksQ0FBQztZQUcvQyxjQUFTLEdBQWtCLEVBQUUsQ0FBQztZQUM5QixrQ0FBNkIsR0FBRyxLQUFLLENBQUM7WUFDdEMsaUNBQTRCLEdBQUcsS0FBSyxDQUFDO1lBQ3JDLDBCQUFxQixHQUE0QixFQUFFLENBQUM7WUFDcEQseUJBQW9CLEdBQXFFLEVBQUUsQ0FBQztZQWFuRyxJQUFJLENBQUMsdUJBQXVCLEdBQUcseUNBQWlDLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDM0YsSUFBSSxDQUFDLHVCQUF1QixHQUFHLElBQUksd0JBQWdCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3JGLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN4QyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUMxQixDQUFDO1FBRUQ7Ozs7V0FJRztRQUNJLCtCQUErQixDQUFDLFVBQWtCLEVBQUUsS0FBaUI7WUFDM0UsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxFQUFFO2dCQUNqRSxPQUFPLEVBQUUsQ0FBQzthQUNWO1lBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ2xELE9BQU8sRUFBRSxDQUFDO2FBQ1Y7WUFFRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDLGNBQWMsQ0FBQyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDaEcsT0FBTyxJQUFJLENBQUMscUJBQXFCLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDdkUsQ0FBQztRQUVPLGlCQUFpQjtZQUN4QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBb0IsRUFBRSxFQUFFO2dCQUMxRSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLG1CQUFtQixFQUFFLEVBQUU7b0JBQ2pFLE9BQU87aUJBQ1A7Z0JBRUQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDckMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUTt1QkFDbEIsQ0FBQyxLQUFLO3VCQUNOLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxnREFBd0M7dUJBQ3JELENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVk7dUJBQzVCLENBQUMsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQzt3QkFDeEUsNkNBQTZDOzJCQUMxQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLEVBQ3JEO29CQUNELE9BQU87aUJBQ1A7Z0JBQ0QsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN2RSxNQUFNLFVBQVUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUM7Z0JBQ2hELE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7Z0JBRXRCLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxXQUFXLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUU7b0JBQ3RGLHdDQUF3QztvQkFDeEMsT0FBTztpQkFDUDtxQkFBTTtvQkFDTixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDLGNBQWMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO29CQUVyRixJQUFJLFdBQVcsQ0FBQyxNQUFNLEVBQUU7d0JBQ3ZCLE1BQU0sY0FBYyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDO3dCQUN4QyxNQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUVuRCxJQUFJLGNBQWMsRUFBRTs0QkFDbkIsV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQzt5QkFDdEY7NkJBQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLElBQUksV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUU7NEJBQzFHLDJFQUEyRTs0QkFDM0UsOEVBQThFOzRCQUM5RSxNQUFNLFFBQVEsR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQzs0QkFDMUQsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsWUFBWSxDQUFDLENBQUM7NEJBRWxILE1BQU0sK0JBQStCLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FDbkQsZ0NBQWdDLEVBQ2hDLHFGQUFxRixFQUNyRixjQUFjLENBQUMsV0FBVyxFQUFFLEVBQzVCLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUN0RixDQUFDOzRCQUNGLE1BQU0sOEJBQThCLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FDbEQsK0JBQStCLEVBQy9CLHNGQUFzRixFQUN0RixjQUFjLENBQUMsV0FBVyxFQUFFLEVBQzVCLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUN0RixDQUFDOzRCQUVGLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUM7Z0NBQy9CLElBQUksRUFBRSxrQkFBUSxDQUFDLElBQUk7Z0NBQ25CLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLDhCQUE4QixDQUFDLENBQUMsQ0FBQywrQkFBK0I7Z0NBQ25GLE9BQU8sRUFBRTtvQ0FDUjt3Q0FDQyxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLEVBQUUsY0FBYyxFQUFFLGNBQWMsQ0FBQzt3Q0FDbEgsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO3FDQUNyRjtvQ0FDRDt3Q0FDQyxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsRUFBRSxVQUFVLENBQUMsRUFBRSxjQUFjLENBQUM7d0NBQ2hQLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztxQ0FDaEc7aUNBQ0Q7Z0NBQ0QsWUFBWSxFQUFFLElBQUk7NkJBQ2xCLENBQUMsQ0FBQzt5QkFDSDs2QkFBTTs0QkFDTixJQUFJLENBQUMsT0FBTyxFQUFFO2dDQUNiLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLDBCQUEwQixDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7NkJBQ3RGO2lDQUFNO2dDQUNOLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7NkJBQzNFO3lCQUNEO3FCQUNEO3lCQUFNLElBQUksaUJBQWlCLEVBQUU7d0JBQzdCLElBQUksQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO3FCQUN4RDtpQkFDRDtZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixJQUFJLENBQUMsQ0FBQyx5QkFBZSxDQUFDLGFBQWEsSUFBSSxrQkFBUSxDQUFDLEVBQUU7Z0JBQ2pEOzs7O21CQUlHO2dCQUNILElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBb0IsRUFBRSxFQUFFO29CQUNwRSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLG1CQUFtQixFQUFFLEVBQUU7d0JBQ2pFLE9BQU87cUJBQ1A7b0JBRUQsSUFBSSw4QkFBOEIsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDeEMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztvQkFDckMsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksZ0RBQXdDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLGdEQUF3QyxDQUFDLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUM7d0JBQ2pNLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRTt3QkFDdEUsTUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7d0JBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFOzRCQUN2Qiw4QkFBOEIsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUM7eUJBQzlEO3FCQUNEO29CQUNELElBQUksQ0FBQyw4QkFBOEIsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO2dCQUNyRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNKLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRTtvQkFDakQsSUFBSSxDQUFDLDhCQUE4QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDSjtZQUdELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0JBQzNELElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO2dCQUM3QixNQUFNLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUM3QixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLEVBQUU7Z0JBQzVFLElBQUksQ0FBQyxJQUFJLENBQUMsNEJBQTRCLElBQUksQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsV0FBVyxFQUFFLEVBQUU7b0JBQ3RGLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQztpQkFDeEM7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUU7Z0JBQzNELCtIQUErSDtnQkFDL0gsSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxXQUFXLEVBQUUsRUFBRTtvQkFDaEQsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFFBQVEsRUFBRSxDQUFDO2lCQUN4QztZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLDJCQUEyQixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNyRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsd0JBQXdCLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNsRixJQUFJLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxzQ0FBc0MsQ0FBQyxFQUFFO29CQUNySSxNQUFNLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztpQkFDNUI7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVPLHFCQUFxQixDQUFDLFdBQXVDLEVBQUUsR0FBUSxFQUFFLFVBQWtCLEVBQUUsTUFBZTtZQUNuSCxNQUFNLE9BQU8sR0FBYyxFQUFFLENBQUM7WUFFOUIsSUFBSSxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDN0IsTUFBTSxjQUFjLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLFlBQVksQ0FBQyxDQUFDO2dCQUNuSSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksZ0JBQU0sQ0FBQyx3QkFBd0IsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLGtCQUFrQixFQUFFLFlBQVksRUFBRSxjQUFjLENBQUMsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEtBQUssSUFBSSxFQUFFO29CQUM3SSxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsaUJBQWlCLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7Z0JBQ25FLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ0osT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLGdCQUFNLENBQ3RCLDZDQUE2QyxFQUM3QyxHQUFHLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLGFBQWEsRUFBRSxjQUFjLENBQUMsRUFDN0QsU0FBUyxFQUNULElBQUksRUFDSixHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUNsRyxDQUFDLENBQUM7Z0JBRUgsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLGdCQUFNLENBQ3RCLGlEQUFpRCxFQUNqRCxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLG1CQUFtQixFQUFFLGFBQWEsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSxZQUFZLEVBQUUsY0FBYyxDQUFDLEVBQzFKLFNBQVMsRUFDVCxJQUFJLEVBQ0osR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQzNGLENBQUMsQ0FBQzthQUNIO2lCQUFNLElBQUksV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ2xDLE1BQU0sTUFBTSxHQUFHLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvSCxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksdUJBQWEsQ0FBQyx5QkFBeUIsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLG1CQUFtQixFQUFFLG9CQUFvQixDQUFDLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksZ0JBQU0sQ0FDN0ksd0JBQXdCLEVBQ3hCLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsZ0NBQWdDLEVBQUUsd0NBQXdDLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLHNCQUFzQixFQUFFLHdCQUF3QixDQUFDLEVBQ2hMLFNBQVMsRUFDVCxJQUFJLEVBQ0osR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FDckQsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFTCxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksdUJBQWEsQ0FBQyx1QkFBdUIsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLGtCQUFrQixDQUFDLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUM1SCxJQUFJLGdCQUFNLENBQUMsZ0JBQWdCLEVBQzFCLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsOEJBQThCLEVBQUUsc0NBQXNDLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLG9CQUFvQixFQUFFLHNCQUFzQixDQUFDLEVBQ3hLLFNBQVMsRUFDVCxJQUFJLEVBQ0osR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FDMUUsQ0FDRCxDQUFDLENBQUMsQ0FBQztnQkFFSixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksdUJBQWEsQ0FBQyxnQ0FBZ0MsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDBCQUEwQixFQUFFLDRCQUE0QixDQUFDLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksZ0JBQU0sQ0FDbkssRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDLHdCQUF3QixFQUNqRSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsK0JBQStCLEVBQUUseUNBQXlDLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLHlCQUF5QixFQUFFLHlCQUF5QixDQUFDLENBQUM7b0JBQ2xNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsbUJBQW1CLEVBQUUsd0NBQXdDLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLHdCQUF3QixFQUFFLHdCQUF3QixDQUFDLENBQUMsRUFDMUssU0FBUyxFQUNULElBQUksRUFDSixHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLDBCQUEwQixDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FDbkUsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNMO2lCQUFNO2dCQUNOLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxnQkFBTSxDQUN0QixlQUFlLEVBQ2YsR0FBRyxDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsZ0JBQWdCLENBQUMsRUFDL0MsU0FBUyxFQUNULElBQUksRUFDSixHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQ3JFLENBQUMsQ0FBQztnQkFDSCxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksZ0JBQU0sQ0FDdEIsMEJBQTBCLEVBQzFCLEdBQUcsQ0FBQyxRQUFRLENBQUMsMEJBQTBCLEVBQUUsK0JBQStCLENBQUMsRUFDekUsU0FBUyxFQUNULElBQUksRUFDSixHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLEVBQUUsTUFBTSw0Q0FBb0MsQ0FBQyxDQUN2RyxDQUFDLENBQUM7Z0JBQ0gsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLGdCQUFNLENBQ3RCLGFBQWEsRUFDYixHQUFHLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxFQUM5QyxTQUFTLEVBQ1QsSUFBSSxFQUNKLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFVBQVUsRUFBRSxNQUFNLDhDQUFzQyxDQUFDLENBQ3pHLENBQUMsQ0FBQzthQUNIO1lBRUQsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssMEJBQWtCLEVBQUU7Z0JBQzlDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxtQkFBUyxFQUFFLENBQUMsQ0FBQztnQkFDOUIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLGdCQUFNLENBQ3RCLFdBQVcsRUFDWCxHQUFHLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxhQUFhLENBQUMsRUFDeEMsU0FBUyxFQUNULElBQUksRUFDSixHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUMsS0FBSyxDQUFDLDBCQUFpQixDQUFDLENBQ3ZFLENBQUMsQ0FBQzthQUNIO1lBRUQsT0FBTyxPQUFPLENBQUM7UUFDaEIsQ0FBQztRQUVPLGlDQUFpQyxDQUFDLElBQVk7WUFDckQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN6RCxJQUFJLFdBQVcsRUFBRTtnQkFDaEIsS0FBSyxNQUFNLEVBQUUsT0FBTyxFQUFFLElBQUksV0FBVyxFQUFFO29CQUN0QyxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsb0JBQW9CLENBQUM7b0JBQ3pDLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQUU7d0JBQ2xOLE9BQU8sS0FBSyxDQUFDO3FCQUNiO2lCQUNEO2FBQ0Q7WUFFRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTyw4QkFBOEIsQ0FBQyw4QkFBc0M7WUFDNUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFO2dCQUMxQyxJQUFJLElBQUksQ0FBQyx3QkFBd0IsRUFBRTtvQkFDbEMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO29CQUN6RCxJQUFJLENBQUMsd0JBQXdCLEdBQUcsSUFBSSxDQUFDO2lCQUNyQztnQkFDRCxJQUFJLDhCQUE4QixLQUFLLENBQUMsQ0FBQyxFQUFFO29CQUMxQyxJQUFJLENBQUMsd0JBQXdCLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQzt3QkFDdEQsZUFBZSxFQUFFLDhCQUE4Qjt3QkFDL0MsV0FBVyxFQUFFLENBQUM7d0JBQ2QsYUFBYSxFQUFFLDhCQUE4Qjt3QkFDN0MsU0FBUyxFQUFFLENBQUM7cUJBQ1osRUFBRSwwQkFBMEIsQ0FDNUIsQ0FBQztpQkFDRjtZQUNGLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVPLEtBQUssQ0FBQyxjQUFjO1lBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFO2dCQUM1QixPQUFPO2FBQ1A7WUFFRCxNQUFNLHVCQUF1QixHQUFHLENBQUMsY0FBK0MsRUFBRSx5QkFBK0MsRUFBRSxFQUFFO2dCQUNwSSxNQUFNLDJCQUEyQixHQUFHLDBCQUEwQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMscUJBQXFCLEVBQUUseUJBQXlCLENBQUMsQ0FBQztnQkFDN0gsTUFBTSxzQkFBc0IsR0FBRyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsRUFBRSwyQkFBMkIsQ0FBQyxDQUFDO2dCQUNoSixJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFO29CQUM3QyxTQUFTLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNsQyxDQUFDLENBQUMsQ0FBQztnQkFDSCxJQUFJLENBQUMsb0JBQW9CLEdBQUcsc0JBQXNCLENBQUMsR0FBRyxDQUFDLENBQUMsWUFBWSxFQUFFLEtBQUssRUFBRSxFQUFFO29CQUM5RSxNQUFNLFNBQVMsR0FBRywyQkFBMkIsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDckQseUlBQXlJO29CQUN6SSwyRUFBMkU7b0JBQzNFLG1KQUFtSjtvQkFDbkosTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBQSw2Q0FBMkIsRUFBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDLHVCQUF1QixFQUFFLEVBQUUsU0FBUyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQztvQkFDM04sTUFBTSxrQkFBa0IsR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztvQkFDL00sTUFBTSxZQUFZLEdBQUcsSUFBSSxzQkFBc0IsQ0FBQyxnQkFBZ0IsRUFBRSxZQUFZLEVBQUUscUJBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsU0FBUyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO29CQUVuTSxPQUFPO3dCQUNOLFlBQVk7d0JBQ1osWUFBWTtxQkFDWixDQUFDO2dCQUNILENBQUMsQ0FBQyxDQUFDO1lBQ0osQ0FBQyxDQUFDO1lBRUYsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQ3JDLE1BQU0sS0FBSyxHQUFHLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzFDLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUMsY0FBYyxDQUFDLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQ3BGLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQXNCLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZGLE1BQU0sNEJBQTRCLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLDJCQUEyQixDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUMsdUJBQXVCLEVBQUUsRUFBRSxhQUFhLENBQUMsOEJBQThCLENBQUMsQ0FBQyxDQUFDO1lBRXBSLDRFQUE0RTtZQUM1RSxtRUFBbUU7WUFDbkUsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxjQUFjLENBQUM7WUFDaEUsTUFBTSx5QkFBeUIsR0FBRyxhQUFhLENBQUMsOEJBQThCLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxtQ0FBbUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFLDRCQUE0QixDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDelAsTUFBTSw4QkFBOEIsR0FBRyxNQUFNLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyx5QkFBeUIsRUFBRSxJQUFBLGVBQU8sRUFBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNILElBQUksOEJBQThCLEtBQUssU0FBUyxFQUFFLEVBQUUsNkJBQTZCO2dCQUNoRix5QkFBeUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLHVCQUF1QixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDNUc7WUFFRCxJQUFJO2dCQUNILElBQUksQ0FBQyw2QkFBNkIsR0FBRyxJQUFJLENBQUM7Z0JBRTFDLDZCQUE2QjtnQkFDN0IsZ0JBQWdCLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxjQUFjLEVBQUUsRUFBRTtvQkFDckQsTUFBTSxhQUFhLEdBQUcsY0FBYyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUUsNEJBQTRCLENBQUMsQ0FBQztvQkFDN0ksSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTt3QkFDeEMsR0FBRyxDQUFDLFlBQVksRUFBRSxPQUFPLEVBQUUsQ0FBQztvQkFDN0IsQ0FBQyxDQUFDLENBQUM7b0JBQ0gsSUFBSSxDQUFDLHFCQUFxQixHQUFHLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxZQUFZLEVBQUUsS0FBSyxFQUFFLEVBQUU7d0JBQ3RFLElBQUksWUFBWSxHQUF1QyxTQUFTLENBQUM7d0JBQ2pFLE1BQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDdEMsSUFBSSw0QkFBNEIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFOzRCQUN2RCxNQUFNLGtCQUFrQixHQUFHLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQzs0QkFDckosWUFBWSxHQUFHLElBQUksc0JBQXNCLENBQUMsZ0JBQWdCLEVBQUUsWUFBWSxFQUFFLDRCQUE0QixDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsa0JBQWtCLENBQUMsQ0FBQzt5QkFDeE47d0JBRUQsT0FBTzs0QkFDTixZQUFZOzRCQUNaLFVBQVU7NEJBQ1YsS0FBSyxFQUFFLDRCQUE0QixDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUs7NEJBQ2hELFlBQVk7eUJBQ1osQ0FBQztvQkFDSCxDQUFDLENBQUMsQ0FBQztvQkFFSCxJQUFJLDhCQUE4QixFQUFFO3dCQUNuQyx1QkFBdUIsQ0FBQyxjQUFjLEVBQUUsOEJBQThCLENBQUMsQ0FBQztxQkFDeEU7Z0JBQ0YsQ0FBQyxDQUFDLENBQUM7YUFDSDtvQkFBUztnQkFDVCxJQUFJLENBQUMsNkJBQTZCLEdBQUcsS0FBSyxDQUFDO2FBQzNDO1lBRUQsS0FBSyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMscUJBQXFCLEVBQUU7Z0JBQzNDLElBQUksQ0FBQyxDQUFDLFlBQVksRUFBRTtvQkFDbkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUM7aUJBQ2hEO2FBQ0Q7UUFDRixDQUFDO1FBRU8sS0FBSyxDQUFDLHlCQUF5QjtZQUN0QyxJQUFJLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyw2QkFBNkIsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUU7Z0JBQzdHLHdCQUF3QjtnQkFDeEIsT0FBTzthQUNQO1lBQ0QsSUFBSSxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7WUFDN0IsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNyQyxJQUFJLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLEVBQUU7Z0JBQ3pELElBQUksZ0JBQWdCLEVBQUU7b0JBQ3JCLE9BQU87aUJBQ1A7Z0JBQ0QsTUFBTSxrQkFBa0IsR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUMsb0JBQW9CLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQ3ZGLElBQUksa0JBQWtCLElBQUksQ0FBQyxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxFQUFFO29CQUN4RixnQkFBZ0IsR0FBRyxJQUFJLENBQUM7b0JBQ3hCLG9CQUFvQixDQUFDLEtBQUssR0FBRyxrQkFBa0IsQ0FBQztpQkFDaEQ7WUFDRixDQUFDLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtnQkFDdEIsZ0RBQWdEO2dCQUNoRCxPQUFPO2FBQ1A7WUFFRCxNQUFNLElBQUksR0FBRyxJQUFJLEdBQUcsRUFBaUMsQ0FBQztZQUN0RCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUN0RSxNQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDM0QsTUFBTSxlQUFlLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLG9CQUFvQixDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUNwRixpQ0FBaUM7Z0JBQ2pDLElBQUksZUFBZSxFQUFFO29CQUNwQixrRUFBa0U7b0JBQ2xFLElBQUksb0JBQW9CLENBQUMsVUFBVSxFQUFFO3dCQUNwQyxJQUFJLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsRUFBRTs0QkFDakQsVUFBVSxFQUFFLGVBQWUsQ0FBQyxlQUFlOzRCQUMzQyxNQUFNLEVBQUUsb0JBQW9CLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsU0FBUzt5QkFDeEYsQ0FBQyxDQUFDO3FCQUNIO2lCQUNEO2FBQ0Q7WUFFRCxJQUFJO2dCQUNILElBQUksQ0FBQyw0QkFBNEIsR0FBRyxJQUFJLENBQUM7Z0JBQ3pDLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQzthQUNqRTtvQkFBUztnQkFDVCxJQUFJLENBQUMsNEJBQTRCLEdBQUcsS0FBSyxDQUFDO2FBQzFDO1FBQ0YsQ0FBQztRQUVELG9CQUFvQjtRQUNwQixvQkFBb0IsQ0FBQyxVQUFrQixFQUFFLE1BQTBCLEVBQUUsT0FBaUM7WUFDckcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLE9BQU8sRUFBRSxDQUFDO1lBRWpDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLG1DQUFnQixFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztZQUM3SCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3RELElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEMsQ0FBQztRQUVELHFCQUFxQjtZQUNwQixJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtnQkFDMUIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNoQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsU0FBUyxDQUFDO2dCQUNsQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ3JDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7YUFDcEI7UUFDRixDQUFDO1FBRUQsT0FBTztZQUNOLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxPQUFPLEVBQUUsQ0FBQztZQUNqQyxJQUFJLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUN2RixJQUFBLG1CQUFPLEVBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3pCLENBQUM7S0FDRCxDQUFBO0lBaGNZLG9FQUE0QjsyQ0FBNUIsNEJBQTRCO1FBY3RDLFdBQUEscUJBQWEsQ0FBQTtRQUNiLFdBQUEsaUNBQW1CLENBQUE7UUFDbkIsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLCtCQUFrQixDQUFBO1FBQ2xCLFdBQUEsd0JBQWMsQ0FBQTtRQUNkLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSxxQkFBYSxDQUFBO09BcEJILDRCQUE0QixDQWdjeEM7SUFFRCw0Q0FBcUIsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUNqRyxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDaEMsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxQkFBYSxDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLG1CQUFtQixFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDbEgsT0FBTztTQUNQO1FBRUQsTUFBTSw0QkFBNEIsR0FBRyxNQUFNLENBQUMsZUFBZSxDQUFnQyx5Q0FBaUMsQ0FBQyxDQUFDO1FBQzlILElBQUksQ0FBQyw0QkFBNEIsRUFBRTtZQUNsQyxPQUFPO1NBQ1A7UUFFRCxNQUFNLE9BQU8sR0FBRyw0QkFBNEIsQ0FBQywrQkFBK0IsQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFaEcsS0FBSyxNQUFNLE1BQU0sSUFBSSxPQUFPLEVBQUU7WUFDN0IsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7U0FDL0I7SUFDRixDQUFDLENBQUMsQ0FBQztJQUVILE1BQU0sc0JBQXNCO1FBVTNCLFlBQ2tCLE1BQXlCLEVBQ3pCLFlBQW9CLEVBQ3JDLFFBQW1DLEVBQ2xCLFVBQW1DLEVBQ25DLFlBQTJCLEVBQzNCLGtCQUF1QyxFQUN2QyxxQkFBc0M7WUFOdEMsV0FBTSxHQUFOLE1BQU0sQ0FBbUI7WUFDekIsaUJBQVksR0FBWixZQUFZLENBQVE7WUFFcEIsZUFBVSxHQUFWLFVBQVUsQ0FBeUI7WUFDbkMsaUJBQVksR0FBWixZQUFZLENBQWU7WUFDM0IsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUN2QywwQkFBcUIsR0FBckIscUJBQXFCLENBQWlCO1lBZnhELDRDQUE0QztZQUM1Qyx3QkFBbUIsR0FBRyxLQUFLLENBQUM7WUFDNUIsc0JBQWlCLEdBQUcsSUFBSSxDQUFDO1lBSWpCLGNBQVMsR0FBa0IsRUFBRSxDQUFDO1lBV3JDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNyRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLDJCQUEyQixDQUFDLEdBQUcsRUFBRTtnQkFDaEUsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDckMsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDMUQsSUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQ2pELElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO29CQUNuQixJQUFJLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUN0QztZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXRCLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2QyxDQUFDO1FBRU8sTUFBTSxDQUFDLFFBQW1DO1lBQ2pELElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLDJCQUEyQixDQUFDLENBQUM7WUFDOUMsSUFBSSxRQUFRLEVBQUU7Z0JBQ2IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2FBQ25EO1lBQ0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFDLENBQUMsRUFBQyxFQUFFO2dCQUMxRixRQUFRLElBQUksQ0FBQyxVQUFVLEVBQUUsT0FBTyxFQUFFO29CQUNqQyxLQUFLLFNBQVM7d0JBQ2IsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxLQUFNLENBQUMsZUFBZSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBTSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQzt3QkFDbkosTUFBTTtvQkFDUCxLQUFLLElBQUk7d0JBQ1IsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQzt3QkFDbkUsTUFBTTtvQkFDUCxLQUFLLEtBQUs7d0JBQ1QsSUFBSSxDQUFDLFlBQVksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO3dCQUNwRSxNQUFNO2lCQUNQO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxFQUFFO2dCQUMzRixNQUFNLEtBQUssR0FBRyxJQUFJLCtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN4QyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztnQkFDN0MsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGVBQWUsQ0FBQztvQkFDdkMsU0FBUyxFQUFFLEdBQUcsRUFBRSxDQUFDLEtBQUs7b0JBQ3RCLFVBQVUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPO29CQUN6QixpQkFBaUIsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVTtvQkFDeEMsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUEsK0JBQW1CLEVBQUMsT0FBTyxDQUFDO2lCQUMxQyxDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosTUFBTSxVQUFVLEdBQUcsR0FBRyxFQUFFO2dCQUN2QixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsa0NBQXlCLENBQUM7Z0JBQ2xFLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxHQUFHLFVBQVUsSUFBSSxDQUFDO2dCQUM5QyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDO2dCQUM5RCxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1lBQ3ZDLENBQUMsQ0FBQztZQUNGLFVBQVUsRUFBRSxDQUFDO1lBRWIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDNUQsSUFBSSxDQUFDLENBQUMsVUFBVSxnQ0FBdUIsSUFBSSxDQUFDLENBQUMsVUFBVSxrQ0FBeUIsRUFBRTtvQkFDakYsVUFBVSxFQUFFLENBQUM7aUJBQ2I7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUdELEtBQUs7WUFDSixPQUFPLElBQUEsbUJBQVksR0FBRSxDQUFDO1FBQ3ZCLENBQUM7UUFFRCxVQUFVO1lBQ1QsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3JCLENBQUM7UUFFRCxXQUFXO1lBQ1YsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ2hCLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFDRCxvSEFBb0g7WUFDcEgsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUUxRSxPQUFPO2dCQUNOLFFBQVEsRUFBRSxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBQUcsQ0FBQyxFQUFFO2dCQUN4RixVQUFVLEVBQUUsK0NBQXVDO2FBQ25ELENBQUM7UUFDSCxDQUFDO1FBRUQsT0FBTztZQUNOLElBQUksQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdEMsSUFBQSxtQkFBTyxFQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN6QixDQUFDO0tBQ0Q7SUF6QkE7UUFEQyxvQkFBTzt1REFHUDtJQXlCRixJQUFBLHlDQUEwQixFQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxFQUFFO1FBQy9DLE1BQU0sd0JBQXdCLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxxQ0FBNkIsQ0FBQyxDQUFDO1FBQy9FLElBQUksd0JBQXdCLEVBQUU7WUFDN0IsU0FBUyxDQUFDLE9BQU8sQ0FBQztJQUNoQixLQUFLLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLHFCQUFxQixxQkFBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7c0JBQ3BGLHFCQUFTLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQywwQkFBMEIsQ0FBQztzQkFDekQscUJBQVMsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDO3NCQUNsRCxxQkFBUyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFHLHFCQUFTLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQztzQkFDekcscUJBQVMsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsR0FBRyxxQkFBUyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDO1lBQzVHLHdCQUF3Qjs7R0FFakMsQ0FBQyxDQUFDO1NBQ0g7UUFFRCxNQUFNLGdDQUFnQyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMscUNBQXFDLENBQUMsQ0FBQztRQUMvRixJQUFJLGdDQUFnQyxFQUFFO1lBQ3JDLFNBQVMsQ0FBQyxPQUFPLENBQUM7SUFDaEIsS0FBSyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxxQkFBcUIscUJBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQy9GLGdDQUFnQzs7R0FFekMsQ0FBQyxDQUFDO1NBQ0g7UUFFRCxNQUFNLGtDQUFrQyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsdUNBQXVDLENBQUMsQ0FBQztRQUNuRyxJQUFJLGtDQUFrQyxFQUFFO1lBQ3ZDLFNBQVMsQ0FBQyxPQUFPLENBQUM7SUFDaEIsS0FBSyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxxQkFBcUIscUJBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQ2pHLGtDQUFrQzs7R0FFM0MsQ0FBQyxDQUFDO1NBQ0g7UUFFRCxNQUFNLG1EQUFtRCxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsOENBQThDLENBQUMsQ0FBQztRQUMzSCxJQUFJLG1EQUFtRCxFQUFFO1lBQ3hELFNBQVMsQ0FBQyxPQUFPLENBQUM7c0JBQ0UscUJBQVMsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQzs7WUFFeEQsbURBQW1EOztHQUU1RCxDQUFDLENBQUM7U0FDSDtRQUVELE1BQU0seUNBQXlDLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO1FBQzFHLElBQUkseUNBQXlDLEVBQUU7WUFDOUMsU0FBUyxDQUFDLE9BQU8sQ0FBQztzQkFDRSxxQkFBUyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsc0JBQXNCLENBQUM7WUFDL0QseUNBQXlDOztHQUVsRCxDQUFDLENBQUM7U0FDSDtJQUNGLENBQUMsQ0FBQyxDQUFDO0lBRVUsUUFBQSw2QkFBNkIsR0FBRyxJQUFBLDZCQUFhLEVBQUMsZ0NBQWdDLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxnQ0FBZ0MsRUFBRSw2QkFBNkIsQ0FBQyxDQUFDLENBQUM7SUFDMVAsTUFBTSxxQ0FBcUMsR0FBRyxJQUFBLDZCQUFhLEVBQUMsd0NBQXdDLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx3Q0FBd0MsRUFBRSxzQ0FBc0MsQ0FBQyxDQUFDLENBQUM7SUFDcFIsTUFBTSx1Q0FBdUMsR0FBRyxJQUFBLDZCQUFhLEVBQUMsMENBQTBDLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQywwQ0FBMEMsRUFBRSx3Q0FBd0MsQ0FBQyxDQUFDLENBQUM7SUFDNVIsTUFBTSw4Q0FBOEMsR0FBRyxJQUFBLDZCQUFhLEVBQUMsaURBQWlELEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxpREFBaUQsRUFBRSxvREFBb0QsQ0FBQyxDQUFDLENBQUM7SUFDN1QsTUFBTSx1Q0FBdUMsR0FBRyxJQUFBLDZCQUFhLEVBQUMsMENBQTBDLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQywwQ0FBMEMsRUFBRSw2Q0FBNkMsQ0FBQyxDQUFDLENBQUMifQ==