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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/markdownRenderer", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/event", "vs/base/common/htmlContent", "vs/base/common/iconLabels", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/platform", "vs/base/common/themables", "vs/base/common/uuid", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/editorColorRegistry", "vs/editor/common/model", "vs/editor/common/services/model", "vs/nls!vs/workbench/contrib/testing/browser/testingDecorations", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/contrib/codeEditor/browser/editorLineNumberMenu", "vs/workbench/contrib/testing/browser/explorerProjections/testItemContextOverlay", "vs/workbench/contrib/testing/browser/icons", "vs/workbench/contrib/testing/common/configuration", "vs/workbench/contrib/testing/common/constants", "vs/workbench/contrib/testing/common/testId", "vs/workbench/contrib/testing/common/testProfileService", "vs/workbench/contrib/testing/common/testResult", "vs/workbench/contrib/testing/common/testResultService", "vs/workbench/contrib/testing/common/testService", "vs/workbench/contrib/testing/common/testingDecorations", "vs/workbench/contrib/testing/common/testingPeekOpener", "vs/workbench/contrib/testing/common/testingStates", "vs/workbench/contrib/testing/common/testingUri"], function (require, exports, dom, markdownRenderer_1, actions_1, arrays_1, async_1, event_1, htmlContent_1, iconLabels_1, iterator_1, lifecycle_1, map_1, platform_1, themables_1, uuid_1, codeEditorService_1, editorColorRegistry_1, model_1, model_2, nls_1, menuEntryActionViewItem_1, actions_2, commands_1, configuration_1, contextkey_1, contextView_1, instantiation_1, themeService_1, uriIdentity_1, editorLineNumberMenu_1, testItemContextOverlay_1, icons_1, configuration_2, constants_1, testId_1, testProfileService_1, testResult_1, testResultService_1, testService_1, testingDecorations_1, testingPeekOpener_1, testingStates_1, testingUri_1) {
    "use strict";
    var TestMessageDecoration_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$pKb = exports.$oKb = void 0;
    const MAX_INLINE_MESSAGE_LENGTH = 128;
    function isOriginalInDiffEditor(codeEditorService, codeEditor) {
        const diffEditors = codeEditorService.listDiffEditors();
        for (const diffEditor of diffEditors) {
            if (diffEditor.getOriginalEditor() === codeEditor) {
                return true;
            }
        }
        return false;
    }
    /** Value for saved decorations, providing fast accessors for the hot 'syncDecorations' path */
    class CachedDecorations {
        constructor() {
            this.a = new Map();
            this.b = new Map();
        }
        get size() {
            return this.a.size + this.b.size;
        }
        /** Gets a test run decoration that contains exactly the given test IDs */
        getForExactTests(testIds) {
            const key = testIds.sort().join('\0\0');
            return this.a.get(key);
        }
        /** Gets the decoration that corresponds to the given test message */
        getMessage(message) {
            return this.b.get(message);
        }
        /** Removes the decoration for the given test messsage */
        removeMessage(message) {
            this.b.delete(message);
        }
        /** Adds a new test message decoration */
        addMessage(d) {
            this.b.set(d.testMessage, d);
        }
        /** Adds a new test run decroation */
        addTest(d) {
            const key = d.testIds.sort().join('\0\0');
            this.a.set(key, d);
        }
        /** Finds an extension by VS Code event ID */
        getById(decorationId) {
            for (const d of this.a.values()) {
                if (d.id === decorationId) {
                    return d;
                }
            }
            for (const d of this.b.values()) {
                if (d.id === decorationId) {
                    return d;
                }
            }
            return undefined;
        }
        /** Iterate over all decorations */
        *[Symbol.iterator]() {
            for (const d of this.a.values()) {
                yield d;
            }
            for (const d of this.b.values()) {
                yield d;
            }
        }
    }
    let $oKb = class $oKb extends lifecycle_1.$kc {
        constructor(codeEditorService, g, h, j, n, r) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.n = n;
            this.r = r;
            this.a = 0;
            this.b = new event_1.$fd();
            this.c = new map_1.$zi();
            /**
             * List of messages that should be hidden because an editor changed their
             * underlying ranges. I think this is good enough, because:
             *  - Message decorations are never shown across reloads; this does not
             *    need to persist
             *  - Message instances are stable for any completed test results for
             *    the duration of the session.
             */
            this.f = new WeakSet();
            /** @inheritdoc */
            this.onDidChange = this.b.event;
            codeEditorService.registerDecorationType('test-message-decoration', TestMessageDecoration.decorationId, {}, undefined);
            r.onModelRemoved(e => this.c.delete(e.uri));
            const debounceInvalidate = this.B(new async_1.$Sg(() => this.s(), 100));
            // If ranges were updated in the document, mark that we should explicitly
            // sync decorations to the published lines, since we assume that everything
            // is up to date. This prevents issues, as in #138632, #138835, #138922.
            this.B(this.h.onWillProcessDiff(diff => {
                for (const entry of diff) {
                    if (entry.op !== 2 /* TestDiffOpType.DocumentSynced */) {
                        continue;
                    }
                    const rec = this.c.get(entry.uri);
                    if (rec) {
                        rec.rangeUpdateVersionId = entry.docv;
                    }
                }
                if (!debounceInvalidate.isScheduled()) {
                    debounceInvalidate.schedule();
                }
            }));
            this.B(event_1.Event.any(this.j.onResultsChanged, this.j.onTestChanged, this.h.excluded.onTestExclusionsChanged, this.h.showInlineOutput.onDidChange, event_1.Event.filter(g.onDidChangeConfiguration, e => e.affectsConfiguration("testing.gutterEnabled" /* TestingConfigKeys.GutterEnabled */)))(() => {
                if (!debounceInvalidate.isScheduled()) {
                    debounceInvalidate.schedule();
                }
            }));
            this.B(editorLineNumberMenu_1.$1Fb.registerGutterActionsGenerator((context, result) => {
                const model = context.editor.getModel();
                const testingDecorations = $pKb.get(context.editor);
                if (!model || !testingDecorations?.currentUri) {
                    return;
                }
                const currentDecorations = this.syncDecorations(testingDecorations.currentUri);
                if (!currentDecorations.size) {
                    return;
                }
                const modelDecorations = model.getLinesDecorations(context.lineNumber, context.lineNumber);
                for (const { id } of modelDecorations) {
                    const decoration = currentDecorations.getById(id);
                    if (decoration) {
                        const { object: actions } = decoration.getContextMenuActions();
                        for (const action of actions) {
                            result.push(action, '1_testing');
                        }
                    }
                }
            }));
        }
        /** @inheritdoc */
        invalidateResultMessage(message) {
            this.f.add(message);
            this.s();
        }
        /** @inheritdoc */
        syncDecorations(resource) {
            const model = this.r.getModel(resource);
            if (!model) {
                return new CachedDecorations();
            }
            const cached = this.c.get(resource);
            if (cached && cached.generation === this.a && (cached.rangeUpdateVersionId === undefined || cached.rangeUpdateVersionId !== model.getVersionId())) {
                return cached.value;
            }
            return this.u(model);
        }
        /** @inheritdoc */
        getDecoratedTestPosition(resource, testId) {
            const model = this.r.getModel(resource);
            if (!model) {
                return undefined;
            }
            const decoration = iterator_1.Iterable.find(this.syncDecorations(resource), v => v instanceof RunTestDecoration && v.isForTest(testId));
            if (!decoration) {
                return undefined;
            }
            // decoration is collapsed, so the range is meaningless; only position matters.
            return model.getDecorationRange(decoration.id)?.getStartPosition();
        }
        s() {
            this.a++;
            this.b.fire();
        }
        /**
         * Applies the current set of test decorations to the given text model.
         */
        u(model) {
            const gutterEnabled = (0, configuration_2.$hKb)(this.g, "testing.gutterEnabled" /* TestingConfigKeys.GutterEnabled */);
            const uriStr = model.uri.toString();
            const cached = this.c.get(model.uri);
            const testRangesUpdated = cached?.rangeUpdateVersionId === model.getVersionId();
            const lastDecorations = cached?.value ?? new CachedDecorations();
            const newDecorations = model.changeDecorations(accessor => {
                const newDecorations = new CachedDecorations();
                const runDecorations = new testingDecorations_1.$iKb();
                for (const test of this.h.collection.getNodeByUrl(model.uri)) {
                    if (!test.item.range) {
                        continue;
                    }
                    const stateLookup = this.j.getStateById(test.item.extId);
                    const line = test.item.range.startLineNumber;
                    runDecorations.push({ line, id: '', test, resultItem: stateLookup?.[1] });
                }
                for (const [line, tests] of runDecorations.lines()) {
                    const multi = tests.length > 1;
                    let existing = lastDecorations.getForExactTests(tests.map(t => t.test.item.extId));
                    // see comment in the constructor for what's going on here
                    if (existing && testRangesUpdated && model.getDecorationRange(existing.id)?.startLineNumber !== line) {
                        existing = undefined;
                    }
                    if (existing) {
                        if (existing.replaceOptions(tests, gutterEnabled)) {
                            accessor.changeDecorationOptions(existing.id, existing.editorDecoration.options);
                        }
                        newDecorations.addTest(existing);
                    }
                    else {
                        newDecorations.addTest(multi
                            ? this.n.createInstance(MultiRunTestDecoration, tests, gutterEnabled, model)
                            : this.n.createInstance(RunSingleTestDecoration, tests[0].test, tests[0].resultItem, model, gutterEnabled));
                    }
                }
                const messageLines = new Set();
                if ((0, configuration_2.$hKb)(this.g, "testing.showAllMessages" /* TestingConfigKeys.ShowAllMessages */)) {
                    this.j.results.forEach(lastResult => this.w(lastResult, messageLines, uriStr, lastDecorations, model, newDecorations));
                }
                else {
                    this.w(this.j.results[0], messageLines, uriStr, lastDecorations, model, newDecorations);
                }
                const saveFromRemoval = new Set();
                for (const decoration of newDecorations) {
                    if (decoration.id === '') {
                        decoration.id = accessor.addDecoration(decoration.editorDecoration.range, decoration.editorDecoration.options);
                    }
                    else {
                        saveFromRemoval.add(decoration.id);
                    }
                }
                for (const decoration of lastDecorations) {
                    if (!saveFromRemoval.has(decoration.id)) {
                        accessor.removeDecoration(decoration.id);
                    }
                }
                this.c.set(model.uri, {
                    generation: this.a,
                    rangeUpdateVersionId: cached?.rangeUpdateVersionId,
                    value: newDecorations,
                });
                return newDecorations;
            });
            return newDecorations || lastDecorations;
        }
        w(lastResult, messageLines, uriStr, lastDecorations, model, newDecorations) {
            if (this.h.showInlineOutput.value && lastResult instanceof testResult_1.$2sb) {
                for (const task of lastResult.tasks) {
                    for (const m of task.otherMessages) {
                        if (!this.f.has(m) && m.location?.uri.toString() === uriStr) {
                            const decoration = lastDecorations.getMessage(m) || this.n.createInstance(TestMessageDecoration, m, undefined, model);
                            newDecorations.addMessage(decoration);
                        }
                    }
                }
                for (const test of lastResult.tests) {
                    for (let taskId = 0; taskId < test.tasks.length; taskId++) {
                        const state = test.tasks[taskId];
                        for (let i = 0; i < state.messages.length; i++) {
                            const m = state.messages[i];
                            if (this.f.has(m) || m.location?.uri.toString() !== uriStr) {
                                continue;
                            }
                            // Only add one message per line number. Overlapping messages
                            // don't appear well, and the peek will show all of them (#134129)
                            const line = m.location.range.startLineNumber;
                            if (!messageLines.has(line)) {
                                const decoration = lastDecorations.getMessage(m) || this.n.createInstance(TestMessageDecoration, m, (0, testingUri_1.$nKb)({
                                    type: 3 /* TestUriType.ResultActualOutput */,
                                    messageIndex: i,
                                    taskIndex: taskId,
                                    resultId: lastResult.id,
                                    testExtId: test.item.extId,
                                }), model);
                                newDecorations.addMessage(decoration);
                                messageLines.add(line);
                            }
                        }
                    }
                }
            }
        }
    };
    exports.$oKb = $oKb;
    exports.$oKb = $oKb = __decorate([
        __param(0, codeEditorService_1.$nV),
        __param(1, configuration_1.$8h),
        __param(2, testService_1.$4sb),
        __param(3, testResultService_1.$ftb),
        __param(4, instantiation_1.$Ah),
        __param(5, model_2.$yA)
    ], $oKb);
    let $pKb = class $pKb extends lifecycle_1.$kc {
        /**
         * Gets the decorations associated with the given code editor.
         */
        static get(editor) {
            return editor.getContribution("editor.contrib.testingDecorations" /* Testing.DecorationsContributionId */);
        }
        get currentUri() { return this.a; }
        constructor(f, g, h, j, n) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.n = n;
            this.b = new lifecycle_1.$lc();
            this.c = new lifecycle_1.$lc();
            g.registerDecorationType('test-message-decoration', TestMessageDecoration.decorationId, {}, undefined, f);
            this.r(f.getModel()?.uri);
            this.B(j.onDidChange(() => {
                if (this.a) {
                    j.syncDecorations(this.a);
                }
            }));
            this.B(this.f.onDidChangeModel(e => this.r(e.newModelUrl || undefined)));
            this.B(this.f.onMouseDown(e => {
                if (e.target.position && this.currentUri) {
                    const modelDecorations = f.getModel()?.getLineDecorations(e.target.position.lineNumber) ?? [];
                    if (!modelDecorations.length) {
                        return;
                    }
                    const cache = j.syncDecorations(this.currentUri);
                    for (const { id } of modelDecorations) {
                        if (cache.getById(id)?.click(e)) {
                            e.event.stopPropagation();
                            return;
                        }
                    }
                }
            }));
            this.B(event_1.Event.accumulate(this.f.onDidChangeModelContent, 0, this.q)(evts => {
                const model = f.getModel();
                if (!this.a || !model) {
                    return;
                }
                const currentDecorations = j.syncDecorations(this.a);
                if (!currentDecorations.size) {
                    return;
                }
                for (const e of evts) {
                    for (const change of e.changes) {
                        const modelDecorations = model.getLinesDecorations(change.range.startLineNumber, change.range.endLineNumber);
                        for (const { id } of modelDecorations) {
                            const decoration = currentDecorations.getById(id);
                            if (decoration instanceof TestMessageDecoration) {
                                j.invalidateResultMessage(decoration.testMessage);
                            }
                        }
                    }
                }
            }));
            const updateFontFamilyVar = () => {
                this.f.getContainerDomNode().style.setProperty('--testMessageDecorationFontFamily', f.getOption(49 /* EditorOption.fontFamily */));
                this.f.getContainerDomNode().style.setProperty('--testMessageDecorationFontSize', `${f.getOption(52 /* EditorOption.fontSize */)}px`);
            };
            this.B(this.f.onDidChangeConfiguration((e) => {
                if (e.hasChanged(49 /* EditorOption.fontFamily */)) {
                    updateFontFamilyVar();
                }
            }));
            updateFontFamilyVar();
        }
        r(uri) {
            switch (uri && (0, testingUri_1.$mKb)(uri)?.type) {
                case 4 /* TestUriType.ResultExpectedOutput */:
                    this.b.value = new ExpectedLensContentWidget(this.f);
                    this.c.clear();
                    break;
                case 3 /* TestUriType.ResultActualOutput */:
                    this.b.clear();
                    this.c.value = new ActualLensContentWidget(this.f);
                    break;
                default:
                    this.b.clear();
                    this.c.clear();
            }
            if (isOriginalInDiffEditor(this.g, this.f)) {
                uri = undefined;
            }
            this.a = uri;
            if (!uri) {
                return;
            }
            this.j.syncDecorations(uri);
            (async () => {
                for await (const _test of (0, testService_1.$8sb)(this.h, this.n, uri, false)) {
                    // consume the iterator so that all tests in the file get expanded. Or
                    // at least until the URI changes. If new items are requested, changes
                    // will be trigged in the `onDidProcessDiff` callback.
                    if (this.a !== uri) {
                        break;
                    }
                }
            })();
        }
    };
    exports.$pKb = $pKb;
    exports.$pKb = $pKb = __decorate([
        __param(1, codeEditorService_1.$nV),
        __param(2, testService_1.$4sb),
        __param(3, testingDecorations_1.$jKb),
        __param(4, uriIdentity_1.$Ck)
    ], $pKb);
    const collapseRange = (originalRange) => ({
        startLineNumber: originalRange.startLineNumber,
        endLineNumber: originalRange.startLineNumber,
        startColumn: originalRange.startColumn,
        endColumn: originalRange.startColumn,
    });
    const createRunTestDecoration = (tests, states, visible) => {
        const range = tests[0]?.item.range;
        if (!range) {
            throw new Error('Test decorations can only be created for tests with a range');
        }
        if (!visible) {
            return { range: collapseRange(range), options: { isWholeLine: true, description: 'run-test-decoration' } };
        }
        let computedState = 0 /* TestResultState.Unset */;
        const hoverMessageParts = [];
        let testIdWithMessages;
        let retired = false;
        for (let i = 0; i < tests.length; i++) {
            const test = tests[i];
            const resultItem = states[i];
            const state = resultItem?.computedState ?? 0 /* TestResultState.Unset */;
            if (hoverMessageParts.length < 10) {
                hoverMessageParts.push((0, constants_1.$Lsb)(test.item.label, state));
            }
            computedState = (0, testingStates_1.$Tsb)(computedState, state);
            retired = retired || !!resultItem?.retired;
            if (!testIdWithMessages && resultItem?.tasks.some(t => t.messages.length)) {
                testIdWithMessages = test.item.extId;
            }
        }
        const hasMultipleTests = tests.length > 1 || tests[0].children.size > 0;
        const icon = computedState === 0 /* TestResultState.Unset */
            ? (hasMultipleTests ? icons_1.$3Jb : icons_1.$1Jb)
            : icons_1.$eKb.get(computedState);
        let hoverMessage;
        let glyphMarginClassName = themables_1.ThemeIcon.asClassName(icon) + ' testing-run-glyph';
        if (retired) {
            glyphMarginClassName += ' retired';
        }
        return {
            range: collapseRange(range),
            options: {
                description: 'run-test-decoration',
                showIfCollapsed: true,
                get hoverMessage() {
                    if (!hoverMessage) {
                        const building = hoverMessage = new htmlContent_1.$Xj('', true).appendText(hoverMessageParts.join(', ') + '.');
                        if (testIdWithMessages) {
                            const args = encodeURIComponent(JSON.stringify([testIdWithMessages]));
                            building.appendMarkdown(` [${(0, nls_1.localize)(0, null)}](command:vscode.peekTestError?${args})`);
                        }
                    }
                    return hoverMessage;
                },
                glyphMarginClassName,
                stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
                zIndex: 10000,
            }
        };
    };
    var LensContentWidgetVars;
    (function (LensContentWidgetVars) {
        LensContentWidgetVars["FontFamily"] = "testingDiffLensFontFamily";
        LensContentWidgetVars["FontFeatures"] = "testingDiffLensFontFeatures";
    })(LensContentWidgetVars || (LensContentWidgetVars = {}));
    class TitleLensContentWidget {
        constructor(c) {
            this.c = c;
            /** @inheritdoc */
            this.allowEditorOverflow = false;
            /** @inheritdoc */
            this.suppressMouseDown = true;
            this.a = dom.$('span');
            queueMicrotask(() => {
                this.f();
                this.c.addContentWidget(this);
            });
        }
        f() {
            let fontSize = this.c.getOption(19 /* EditorOption.codeLensFontSize */);
            let height;
            if (!fontSize || fontSize < 5) {
                fontSize = (this.c.getOption(52 /* EditorOption.fontSize */) * .9) | 0;
                height = this.c.getOption(66 /* EditorOption.lineHeight */);
            }
            else {
                height = (fontSize * Math.max(1.3, this.c.getOption(66 /* EditorOption.lineHeight */) / this.c.getOption(52 /* EditorOption.fontSize */))) | 0;
            }
            const editorFontInfo = this.c.getOption(50 /* EditorOption.fontInfo */);
            const node = this.a;
            node.classList.add('testing-diff-lens-widget');
            node.textContent = this.g();
            node.style.lineHeight = `${height}px`;
            node.style.fontSize = `${fontSize}px`;
            node.style.fontFamily = `var(--${"testingDiffLensFontFamily" /* LensContentWidgetVars.FontFamily */})`;
            node.style.fontFeatureSettings = `var(--${"testingDiffLensFontFeatures" /* LensContentWidgetVars.FontFeatures */})`;
            const containerStyle = this.c.getContainerDomNode().style;
            containerStyle.setProperty("testingDiffLensFontFamily" /* LensContentWidgetVars.FontFamily */, this.c.getOption(18 /* EditorOption.codeLensFontFamily */) ?? 'inherit');
            containerStyle.setProperty("testingDiffLensFontFeatures" /* LensContentWidgetVars.FontFeatures */, editorFontInfo.fontFeatureSettings);
            this.c.changeViewZones(accessor => {
                if (this.b) {
                    accessor.removeZone(this.b);
                }
                this.b = accessor.addZone({
                    afterLineNumber: 0,
                    afterColumn: 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */,
                    domNode: document.createElement('div'),
                    heightInPx: 20,
                });
            });
        }
        /** @inheritdoc */
        getDomNode() {
            return this.a;
        }
        /** @inheritdoc */
        dispose() {
            this.c.changeViewZones(accessor => {
                if (this.b) {
                    accessor.removeZone(this.b);
                }
            });
            this.c.removeContentWidget(this);
        }
        /** @inheritdoc */
        getPosition() {
            return {
                position: { column: 0, lineNumber: 0 },
                preference: [1 /* ContentWidgetPositionPreference.ABOVE */],
            };
        }
    }
    class ExpectedLensContentWidget extends TitleLensContentWidget {
        getId() {
            return 'expectedTestingLens';
        }
        g() {
            return (0, nls_1.localize)(1, null);
        }
    }
    class ActualLensContentWidget extends TitleLensContentWidget {
        getId() {
            return 'actualTestingLens';
        }
        g() {
            return (0, nls_1.localize)(2, null);
        }
    }
    let RunTestDecoration = class RunTestDecoration {
        get line() {
            return this.editorDecoration.range.startLineNumber;
        }
        get testIds() {
            return this.a.map(t => t.test.item.extId);
        }
        constructor(a, b, c, f, g, h, j, k, l, n, o) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.k = k;
            this.l = l;
            this.n = n;
            this.o = o;
            /** @inheritdoc */
            this.id = '';
            this.displayedStates = a.map(t => t.resultItem?.computedState);
            this.editorDecoration = createRunTestDecoration(a.map(t => t.test), a.map(t => t.resultItem), b);
            this.editorDecoration.options.glyphMarginHoverMessage = new htmlContent_1.$Xj().appendText(this.s());
        }
        /** @inheritdoc */
        click(e) {
            if (e.target.type !== 2 /* MouseTargetType.GUTTER_GLYPH_MARGIN */
                // handled by editor gutter context menu
                || e.event.rightButton
                || platform_1.$j && e.event.leftButton && e.event.ctrlKey) {
                return false;
            }
            switch ((0, configuration_2.$hKb)(this.k, "testing.defaultGutterClickAction" /* TestingConfigKeys.DefaultGutterClickAction */)) {
                case "contextMenu" /* DefaultGutterClickAction.ContextMenu */:
                    this.r(e);
                    break;
                case "debug" /* DefaultGutterClickAction.Debug */:
                    this.q();
                    break;
                case "run" /* DefaultGutterClickAction.Run */:
                default:
                    this.p();
                    break;
            }
            return true;
        }
        /**
         * Updates the decoration to match the new set of tests.
         * @returns true if options were changed, false otherwise
         */
        replaceOptions(newTests, visible) {
            const displayedStates = newTests.map(t => t.resultItem?.computedState);
            if (visible === this.b && (0, arrays_1.$sb)(this.displayedStates, displayedStates)) {
                return false;
            }
            this.a = newTests;
            this.displayedStates = displayedStates;
            this.b = visible;
            this.editorDecoration.options = createRunTestDecoration(newTests.map(t => t.test), newTests.map(t => t.resultItem), visible).options;
            this.editorDecoration.options.glyphMarginHoverMessage = new htmlContent_1.$Xj().appendText(this.s());
            return true;
        }
        /**
         * Gets whether this decoration serves as the run button for the given test ID.
         */
        isForTest(testId) {
            return this.a.some(t => t.test.item.extId === testId);
        }
        p() {
            return this.g.runTests({
                tests: this.a.map(({ test }) => test),
                group: 2 /* TestRunProfileBitset.Run */,
            });
        }
        q() {
            return this.g.runTests({
                tests: this.a.map(({ test }) => test),
                group: 4 /* TestRunProfileBitset.Debug */,
            });
        }
        r(e) {
            const editor = this.f.listCodeEditors().find(e => e.getModel() === this.c);
            editor?.getContribution(editorLineNumberMenu_1.$2Fb.ID)?.show(e);
        }
        s() {
            switch ((0, configuration_2.$hKb)(this.k, "testing.defaultGutterClickAction" /* TestingConfigKeys.DefaultGutterClickAction */)) {
                case "contextMenu" /* DefaultGutterClickAction.ContextMenu */:
                    return (0, nls_1.localize)(3, null);
                case "debug" /* DefaultGutterClickAction.Debug */:
                    return (0, nls_1.localize)(4, null);
                case "run" /* DefaultGutterClickAction.Run */:
                default:
                    return (0, nls_1.localize)(5, null);
            }
        }
        /**
         * Gets context menu actions relevant for a singel test.
         */
        u(test, resultItem) {
            const testActions = [];
            const capabilities = this.l.capabilitiesForTest(test);
            if (capabilities & 2 /* TestRunProfileBitset.Run */) {
                testActions.push(new actions_1.$gi('testing.gutter.run', (0, nls_1.localize)(6, null), undefined, undefined, () => this.g.runTests({
                    group: 2 /* TestRunProfileBitset.Run */,
                    tests: [test],
                })));
            }
            if (capabilities & 4 /* TestRunProfileBitset.Debug */) {
                testActions.push(new actions_1.$gi('testing.gutter.debug', (0, nls_1.localize)(7, null), undefined, undefined, () => this.g.runTests({
                    group: 4 /* TestRunProfileBitset.Debug */,
                    tests: [test],
                })));
            }
            if (capabilities & 16 /* TestRunProfileBitset.HasNonDefaultProfile */) {
                testActions.push(new actions_1.$gi('testing.runUsing', (0, nls_1.localize)(8, null), undefined, undefined, async () => {
                    const profile = await this.j.executeCommand('vscode.pickTestProfile', { onlyForTest: test });
                    if (!profile) {
                        return;
                    }
                    this.g.runResolvedTests({
                        targets: [{
                                profileGroup: profile.group,
                                profileId: profile.profileId,
                                controllerId: profile.controllerId,
                                testIds: [test.item.extId]
                            }]
                    });
                }));
            }
            if (resultItem && (0, testingStates_1.$Psb)(resultItem.computedState)) {
                testActions.push(new actions_1.$gi('testing.gutter.peekFailure', (0, nls_1.localize)(9, null), undefined, undefined, () => this.j.executeCommand('vscode.peekTestError', test.item.extId)));
            }
            testActions.push(new actions_1.$gi('testing.gutter.reveal', (0, nls_1.localize)(10, null), undefined, undefined, () => this.j.executeCommand('_revealTestInExplorer', test.item.extId)));
            const contributed = this.w(test, capabilities);
            return { object: actions_1.$ii.join(testActions, contributed), dispose() { } };
        }
        w(test, capabilities) {
            const contextOverlay = this.n.createOverlay((0, testItemContextOverlay_1.$fKb)(test, capabilities));
            const menu = this.o.createMenu(actions_2.$Ru.TestItemGutter, contextOverlay);
            try {
                const target = [];
                const arg = (0, testService_1.$6sb)(this.g.collection, test.item.extId);
                (0, menuEntryActionViewItem_1.$A3)(menu, { shouldForwardArgs: true, arg }, target);
                return target;
            }
            finally {
                menu.dispose();
            }
        }
    };
    RunTestDecoration = __decorate([
        __param(3, codeEditorService_1.$nV),
        __param(4, testService_1.$4sb),
        __param(5, contextView_1.$WZ),
        __param(6, commands_1.$Fr),
        __param(7, configuration_1.$8h),
        __param(8, testProfileService_1.$9sb),
        __param(9, contextkey_1.$3i),
        __param(10, actions_2.$Su)
    ], RunTestDecoration);
    class MultiRunTestDecoration extends RunTestDecoration {
        getContextMenuActions() {
            const allActions = [];
            if (this.a.some(({ test }) => this.l.capabilitiesForTest(test) & 2 /* TestRunProfileBitset.Run */)) {
                allActions.push(new actions_1.$gi('testing.gutter.runAll', (0, nls_1.localize)(11, null), undefined, undefined, () => this.p()));
            }
            if (this.a.some(({ test }) => this.l.capabilitiesForTest(test) & 4 /* TestRunProfileBitset.Debug */)) {
                allActions.push(new actions_1.$gi('testing.gutter.debugAll', (0, nls_1.localize)(12, null), undefined, undefined, () => this.q()));
            }
            const testItems = this.a.map(testItem => ({
                currentLabel: testItem.test.item.label,
                testItem,
                parent: testId_1.$PI.fromString(testItem.test.item.extId).parentId,
            }));
            const getLabelConflicts = (tests) => {
                const labelCount = new Map();
                for (const test of tests) {
                    labelCount.set(test.currentLabel, (labelCount.get(test.currentLabel) || 0) + 1);
                }
                return tests.filter(e => labelCount.get(e.currentLabel) > 1);
            };
            let conflicts, hasParent = true;
            while ((conflicts = getLabelConflicts(testItems)).length && hasParent) {
                for (const conflict of conflicts) {
                    if (conflict.parent) {
                        const parent = this.g.collection.getNodeById(conflict.parent.toString());
                        conflict.currentLabel = parent?.item.label + ' > ' + conflict.currentLabel;
                        conflict.parent = conflict.parent.parentId;
                    }
                    else {
                        hasParent = false;
                    }
                }
            }
            const disposable = new lifecycle_1.$jc();
            const testSubmenus = testItems.map(({ currentLabel, testItem }) => {
                const actions = this.u(testItem.test, testItem.resultItem);
                disposable.add(actions);
                return new actions_1.$ji(testItem.test.item.extId, (0, iconLabels_1.$Tj)(currentLabel), actions.object);
            });
            return { object: actions_1.$ii.join(allActions, testSubmenus), dispose: () => disposable.dispose() };
        }
    }
    let RunSingleTestDecoration = class RunSingleTestDecoration extends RunTestDecoration {
        constructor(test, resultItem, model, visible, codeEditorService, testService, commandService, contextMenuService, configurationService, testProfiles, contextKeyService, menuService) {
            super([{ test, resultItem }], visible, model, codeEditorService, testService, contextMenuService, commandService, configurationService, testProfiles, contextKeyService, menuService);
        }
        getContextMenuActions() {
            return this.u(this.a[0].test, this.a[0].resultItem);
        }
    };
    RunSingleTestDecoration = __decorate([
        __param(4, codeEditorService_1.$nV),
        __param(5, testService_1.$4sb),
        __param(6, commands_1.$Fr),
        __param(7, contextView_1.$WZ),
        __param(8, configuration_1.$8h),
        __param(9, testProfileService_1.$9sb),
        __param(10, contextkey_1.$3i),
        __param(11, actions_2.$Su)
    ], RunSingleTestDecoration);
    const lineBreakRe = /\r?\n\s*/g;
    let TestMessageDecoration = class TestMessageDecoration {
        static { TestMessageDecoration_1 = this; }
        static { this.inlineClassName = 'test-message-inline-content'; }
        static { this.decorationId = `testmessage-${(0, uuid_1.$4f)()}`; }
        constructor(testMessage, b, textModel, c, editorService) {
            this.testMessage = testMessage;
            this.b = b;
            this.c = c;
            this.id = '';
            this.a = `test-message-inline-content-id${(0, uuid_1.$4f)()}`;
            this.location = testMessage.location;
            this.line = this.location.range.startLineNumber;
            const severity = testMessage.type;
            const message = testMessage.message;
            const options = editorService.resolveDecorationOptions(TestMessageDecoration_1.decorationId, true);
            options.hoverMessage = typeof message === 'string' ? new htmlContent_1.$Xj().appendText(message) : message;
            options.zIndex = 10; // todo: in spite of the z-index, this appears behind gitlens
            options.className = `testing-inline-message-severity-${severity}`;
            options.isWholeLine = true;
            options.stickiness = 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */;
            options.collapseOnReplaceEdit = true;
            let inlineText = (0, markdownRenderer_1.$BQ)(message).replace(lineBreakRe, ' ');
            if (inlineText.length > MAX_INLINE_MESSAGE_LENGTH) {
                inlineText = inlineText.slice(0, MAX_INLINE_MESSAGE_LENGTH - 1) + '…';
            }
            options.after = {
                content: ' '.repeat(4) + inlineText,
                inlineClassName: `test-message-inline-content test-message-inline-content-s${severity} ${this.a} ${b ? 'test-message-inline-content-clickable' : ''}`
            };
            options.showIfCollapsed = true;
            const rulerColor = severity === 0 /* TestMessageType.Error */
                ? editorColorRegistry_1.$sB
                : editorColorRegistry_1.$uB;
            if (rulerColor) {
                options.overviewRuler = { color: (0, themeService_1.$hv)(rulerColor), position: model_1.OverviewRulerLane.Right };
            }
            const lineLength = textModel.getLineLength(this.location.range.startLineNumber);
            const column = lineLength ? (lineLength + 1) : this.location.range.endColumn;
            this.editorDecoration = {
                options,
                range: {
                    startLineNumber: this.location.range.startLineNumber,
                    startColumn: column,
                    endColumn: column,
                    endLineNumber: this.location.range.startLineNumber,
                }
            };
        }
        click(e) {
            if (e.event.rightButton) {
                return false;
            }
            if (!this.b) {
                return false;
            }
            if (e.target.element?.className.includes(this.a)) {
                this.c.peekUri(this.b);
            }
            return false;
        }
        getContextMenuActions() {
            return { object: [], dispose: () => { } };
        }
    };
    TestMessageDecoration = TestMessageDecoration_1 = __decorate([
        __param(3, testingPeekOpener_1.$kKb),
        __param(4, codeEditorService_1.$nV)
    ], TestMessageDecoration);
});
//# sourceMappingURL=testingDecorations.js.map