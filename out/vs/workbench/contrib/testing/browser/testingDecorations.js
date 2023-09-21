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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/markdownRenderer", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/event", "vs/base/common/htmlContent", "vs/base/common/iconLabels", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/platform", "vs/base/common/themables", "vs/base/common/uuid", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/editorColorRegistry", "vs/editor/common/model", "vs/editor/common/services/model", "vs/nls", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/contrib/codeEditor/browser/editorLineNumberMenu", "vs/workbench/contrib/testing/browser/explorerProjections/testItemContextOverlay", "vs/workbench/contrib/testing/browser/icons", "vs/workbench/contrib/testing/common/configuration", "vs/workbench/contrib/testing/common/constants", "vs/workbench/contrib/testing/common/testId", "vs/workbench/contrib/testing/common/testProfileService", "vs/workbench/contrib/testing/common/testResult", "vs/workbench/contrib/testing/common/testResultService", "vs/workbench/contrib/testing/common/testService", "vs/workbench/contrib/testing/common/testingDecorations", "vs/workbench/contrib/testing/common/testingPeekOpener", "vs/workbench/contrib/testing/common/testingStates", "vs/workbench/contrib/testing/common/testingUri"], function (require, exports, dom, markdownRenderer_1, actions_1, arrays_1, async_1, event_1, htmlContent_1, iconLabels_1, iterator_1, lifecycle_1, map_1, platform_1, themables_1, uuid_1, codeEditorService_1, editorColorRegistry_1, model_1, model_2, nls_1, menuEntryActionViewItem_1, actions_2, commands_1, configuration_1, contextkey_1, contextView_1, instantiation_1, themeService_1, uriIdentity_1, editorLineNumberMenu_1, testItemContextOverlay_1, icons_1, configuration_2, constants_1, testId_1, testProfileService_1, testResult_1, testResultService_1, testService_1, testingDecorations_1, testingPeekOpener_1, testingStates_1, testingUri_1) {
    "use strict";
    var TestMessageDecoration_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestingDecorations = exports.TestingDecorationService = void 0;
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
            this.runByIdKey = new Map();
            this.messages = new Map();
        }
        get size() {
            return this.runByIdKey.size + this.messages.size;
        }
        /** Gets a test run decoration that contains exactly the given test IDs */
        getForExactTests(testIds) {
            const key = testIds.sort().join('\0\0');
            return this.runByIdKey.get(key);
        }
        /** Gets the decoration that corresponds to the given test message */
        getMessage(message) {
            return this.messages.get(message);
        }
        /** Removes the decoration for the given test messsage */
        removeMessage(message) {
            this.messages.delete(message);
        }
        /** Adds a new test message decoration */
        addMessage(d) {
            this.messages.set(d.testMessage, d);
        }
        /** Adds a new test run decroation */
        addTest(d) {
            const key = d.testIds.sort().join('\0\0');
            this.runByIdKey.set(key, d);
        }
        /** Finds an extension by VS Code event ID */
        getById(decorationId) {
            for (const d of this.runByIdKey.values()) {
                if (d.id === decorationId) {
                    return d;
                }
            }
            for (const d of this.messages.values()) {
                if (d.id === decorationId) {
                    return d;
                }
            }
            return undefined;
        }
        /** Iterate over all decorations */
        *[Symbol.iterator]() {
            for (const d of this.runByIdKey.values()) {
                yield d;
            }
            for (const d of this.messages.values()) {
                yield d;
            }
        }
    }
    let TestingDecorationService = class TestingDecorationService extends lifecycle_1.Disposable {
        constructor(codeEditorService, configurationService, testService, results, instantiationService, modelService) {
            super();
            this.configurationService = configurationService;
            this.testService = testService;
            this.results = results;
            this.instantiationService = instantiationService;
            this.modelService = modelService;
            this.generation = 0;
            this.changeEmitter = new event_1.Emitter();
            this.decorationCache = new map_1.ResourceMap();
            /**
             * List of messages that should be hidden because an editor changed their
             * underlying ranges. I think this is good enough, because:
             *  - Message decorations are never shown across reloads; this does not
             *    need to persist
             *  - Message instances are stable for any completed test results for
             *    the duration of the session.
             */
            this.invalidatedMessages = new WeakSet();
            /** @inheritdoc */
            this.onDidChange = this.changeEmitter.event;
            codeEditorService.registerDecorationType('test-message-decoration', TestMessageDecoration.decorationId, {}, undefined);
            modelService.onModelRemoved(e => this.decorationCache.delete(e.uri));
            const debounceInvalidate = this._register(new async_1.RunOnceScheduler(() => this.invalidate(), 100));
            // If ranges were updated in the document, mark that we should explicitly
            // sync decorations to the published lines, since we assume that everything
            // is up to date. This prevents issues, as in #138632, #138835, #138922.
            this._register(this.testService.onWillProcessDiff(diff => {
                for (const entry of diff) {
                    if (entry.op !== 2 /* TestDiffOpType.DocumentSynced */) {
                        continue;
                    }
                    const rec = this.decorationCache.get(entry.uri);
                    if (rec) {
                        rec.rangeUpdateVersionId = entry.docv;
                    }
                }
                if (!debounceInvalidate.isScheduled()) {
                    debounceInvalidate.schedule();
                }
            }));
            this._register(event_1.Event.any(this.results.onResultsChanged, this.results.onTestChanged, this.testService.excluded.onTestExclusionsChanged, this.testService.showInlineOutput.onDidChange, event_1.Event.filter(configurationService.onDidChangeConfiguration, e => e.affectsConfiguration("testing.gutterEnabled" /* TestingConfigKeys.GutterEnabled */)))(() => {
                if (!debounceInvalidate.isScheduled()) {
                    debounceInvalidate.schedule();
                }
            }));
            this._register(editorLineNumberMenu_1.GutterActionsRegistry.registerGutterActionsGenerator((context, result) => {
                const model = context.editor.getModel();
                const testingDecorations = TestingDecorations.get(context.editor);
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
            this.invalidatedMessages.add(message);
            this.invalidate();
        }
        /** @inheritdoc */
        syncDecorations(resource) {
            const model = this.modelService.getModel(resource);
            if (!model) {
                return new CachedDecorations();
            }
            const cached = this.decorationCache.get(resource);
            if (cached && cached.generation === this.generation && (cached.rangeUpdateVersionId === undefined || cached.rangeUpdateVersionId !== model.getVersionId())) {
                return cached.value;
            }
            return this.applyDecorations(model);
        }
        /** @inheritdoc */
        getDecoratedTestPosition(resource, testId) {
            const model = this.modelService.getModel(resource);
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
        invalidate() {
            this.generation++;
            this.changeEmitter.fire();
        }
        /**
         * Applies the current set of test decorations to the given text model.
         */
        applyDecorations(model) {
            const gutterEnabled = (0, configuration_2.getTestingConfiguration)(this.configurationService, "testing.gutterEnabled" /* TestingConfigKeys.GutterEnabled */);
            const uriStr = model.uri.toString();
            const cached = this.decorationCache.get(model.uri);
            const testRangesUpdated = cached?.rangeUpdateVersionId === model.getVersionId();
            const lastDecorations = cached?.value ?? new CachedDecorations();
            const newDecorations = model.changeDecorations(accessor => {
                const newDecorations = new CachedDecorations();
                const runDecorations = new testingDecorations_1.TestDecorations();
                for (const test of this.testService.collection.getNodeByUrl(model.uri)) {
                    if (!test.item.range) {
                        continue;
                    }
                    const stateLookup = this.results.getStateById(test.item.extId);
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
                            ? this.instantiationService.createInstance(MultiRunTestDecoration, tests, gutterEnabled, model)
                            : this.instantiationService.createInstance(RunSingleTestDecoration, tests[0].test, tests[0].resultItem, model, gutterEnabled));
                    }
                }
                const messageLines = new Set();
                if ((0, configuration_2.getTestingConfiguration)(this.configurationService, "testing.showAllMessages" /* TestingConfigKeys.ShowAllMessages */)) {
                    this.results.results.forEach(lastResult => this.applyDecorationsFromResult(lastResult, messageLines, uriStr, lastDecorations, model, newDecorations));
                }
                else {
                    this.applyDecorationsFromResult(this.results.results[0], messageLines, uriStr, lastDecorations, model, newDecorations);
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
                this.decorationCache.set(model.uri, {
                    generation: this.generation,
                    rangeUpdateVersionId: cached?.rangeUpdateVersionId,
                    value: newDecorations,
                });
                return newDecorations;
            });
            return newDecorations || lastDecorations;
        }
        applyDecorationsFromResult(lastResult, messageLines, uriStr, lastDecorations, model, newDecorations) {
            if (this.testService.showInlineOutput.value && lastResult instanceof testResult_1.LiveTestResult) {
                for (const task of lastResult.tasks) {
                    for (const m of task.otherMessages) {
                        if (!this.invalidatedMessages.has(m) && m.location?.uri.toString() === uriStr) {
                            const decoration = lastDecorations.getMessage(m) || this.instantiationService.createInstance(TestMessageDecoration, m, undefined, model);
                            newDecorations.addMessage(decoration);
                        }
                    }
                }
                for (const test of lastResult.tests) {
                    for (let taskId = 0; taskId < test.tasks.length; taskId++) {
                        const state = test.tasks[taskId];
                        for (let i = 0; i < state.messages.length; i++) {
                            const m = state.messages[i];
                            if (this.invalidatedMessages.has(m) || m.location?.uri.toString() !== uriStr) {
                                continue;
                            }
                            // Only add one message per line number. Overlapping messages
                            // don't appear well, and the peek will show all of them (#134129)
                            const line = m.location.range.startLineNumber;
                            if (!messageLines.has(line)) {
                                const decoration = lastDecorations.getMessage(m) || this.instantiationService.createInstance(TestMessageDecoration, m, (0, testingUri_1.buildTestUri)({
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
    exports.TestingDecorationService = TestingDecorationService;
    exports.TestingDecorationService = TestingDecorationService = __decorate([
        __param(0, codeEditorService_1.ICodeEditorService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, testService_1.ITestService),
        __param(3, testResultService_1.ITestResultService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, model_2.IModelService)
    ], TestingDecorationService);
    let TestingDecorations = class TestingDecorations extends lifecycle_1.Disposable {
        /**
         * Gets the decorations associated with the given code editor.
         */
        static get(editor) {
            return editor.getContribution("editor.contrib.testingDecorations" /* Testing.DecorationsContributionId */);
        }
        get currentUri() { return this._currentUri; }
        constructor(editor, codeEditorService, testService, decorations, uriIdentityService) {
            super();
            this.editor = editor;
            this.codeEditorService = codeEditorService;
            this.testService = testService;
            this.decorations = decorations;
            this.uriIdentityService = uriIdentityService;
            this.expectedWidget = new lifecycle_1.MutableDisposable();
            this.actualWidget = new lifecycle_1.MutableDisposable();
            codeEditorService.registerDecorationType('test-message-decoration', TestMessageDecoration.decorationId, {}, undefined, editor);
            this.attachModel(editor.getModel()?.uri);
            this._register(decorations.onDidChange(() => {
                if (this._currentUri) {
                    decorations.syncDecorations(this._currentUri);
                }
            }));
            this._register(this.editor.onDidChangeModel(e => this.attachModel(e.newModelUrl || undefined)));
            this._register(this.editor.onMouseDown(e => {
                if (e.target.position && this.currentUri) {
                    const modelDecorations = editor.getModel()?.getLineDecorations(e.target.position.lineNumber) ?? [];
                    if (!modelDecorations.length) {
                        return;
                    }
                    const cache = decorations.syncDecorations(this.currentUri);
                    for (const { id } of modelDecorations) {
                        if (cache.getById(id)?.click(e)) {
                            e.event.stopPropagation();
                            return;
                        }
                    }
                }
            }));
            this._register(event_1.Event.accumulate(this.editor.onDidChangeModelContent, 0, this._store)(evts => {
                const model = editor.getModel();
                if (!this._currentUri || !model) {
                    return;
                }
                const currentDecorations = decorations.syncDecorations(this._currentUri);
                if (!currentDecorations.size) {
                    return;
                }
                for (const e of evts) {
                    for (const change of e.changes) {
                        const modelDecorations = model.getLinesDecorations(change.range.startLineNumber, change.range.endLineNumber);
                        for (const { id } of modelDecorations) {
                            const decoration = currentDecorations.getById(id);
                            if (decoration instanceof TestMessageDecoration) {
                                decorations.invalidateResultMessage(decoration.testMessage);
                            }
                        }
                    }
                }
            }));
            const updateFontFamilyVar = () => {
                this.editor.getContainerDomNode().style.setProperty('--testMessageDecorationFontFamily', editor.getOption(49 /* EditorOption.fontFamily */));
                this.editor.getContainerDomNode().style.setProperty('--testMessageDecorationFontSize', `${editor.getOption(52 /* EditorOption.fontSize */)}px`);
            };
            this._register(this.editor.onDidChangeConfiguration((e) => {
                if (e.hasChanged(49 /* EditorOption.fontFamily */)) {
                    updateFontFamilyVar();
                }
            }));
            updateFontFamilyVar();
        }
        attachModel(uri) {
            switch (uri && (0, testingUri_1.parseTestUri)(uri)?.type) {
                case 4 /* TestUriType.ResultExpectedOutput */:
                    this.expectedWidget.value = new ExpectedLensContentWidget(this.editor);
                    this.actualWidget.clear();
                    break;
                case 3 /* TestUriType.ResultActualOutput */:
                    this.expectedWidget.clear();
                    this.actualWidget.value = new ActualLensContentWidget(this.editor);
                    break;
                default:
                    this.expectedWidget.clear();
                    this.actualWidget.clear();
            }
            if (isOriginalInDiffEditor(this.codeEditorService, this.editor)) {
                uri = undefined;
            }
            this._currentUri = uri;
            if (!uri) {
                return;
            }
            this.decorations.syncDecorations(uri);
            (async () => {
                for await (const _test of (0, testService_1.testsInFile)(this.testService, this.uriIdentityService, uri, false)) {
                    // consume the iterator so that all tests in the file get expanded. Or
                    // at least until the URI changes. If new items are requested, changes
                    // will be trigged in the `onDidProcessDiff` callback.
                    if (this._currentUri !== uri) {
                        break;
                    }
                }
            })();
        }
    };
    exports.TestingDecorations = TestingDecorations;
    exports.TestingDecorations = TestingDecorations = __decorate([
        __param(1, codeEditorService_1.ICodeEditorService),
        __param(2, testService_1.ITestService),
        __param(3, testingDecorations_1.ITestingDecorationsService),
        __param(4, uriIdentity_1.IUriIdentityService)
    ], TestingDecorations);
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
                hoverMessageParts.push((0, constants_1.labelForTestInState)(test.item.label, state));
            }
            computedState = (0, testingStates_1.maxPriority)(computedState, state);
            retired = retired || !!resultItem?.retired;
            if (!testIdWithMessages && resultItem?.tasks.some(t => t.messages.length)) {
                testIdWithMessages = test.item.extId;
            }
        }
        const hasMultipleTests = tests.length > 1 || tests[0].children.size > 0;
        const icon = computedState === 0 /* TestResultState.Unset */
            ? (hasMultipleTests ? icons_1.testingRunAllIcon : icons_1.testingRunIcon)
            : icons_1.testingStatesToIcons.get(computedState);
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
                        const building = hoverMessage = new htmlContent_1.MarkdownString('', true).appendText(hoverMessageParts.join(', ') + '.');
                        if (testIdWithMessages) {
                            const args = encodeURIComponent(JSON.stringify([testIdWithMessages]));
                            building.appendMarkdown(` [${(0, nls_1.localize)('peekTestOutout', 'Peek Test Output')}](command:vscode.peekTestError?${args})`);
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
        constructor(editor) {
            this.editor = editor;
            /** @inheritdoc */
            this.allowEditorOverflow = false;
            /** @inheritdoc */
            this.suppressMouseDown = true;
            this._domNode = dom.$('span');
            queueMicrotask(() => {
                this.applyStyling();
                this.editor.addContentWidget(this);
            });
        }
        applyStyling() {
            let fontSize = this.editor.getOption(19 /* EditorOption.codeLensFontSize */);
            let height;
            if (!fontSize || fontSize < 5) {
                fontSize = (this.editor.getOption(52 /* EditorOption.fontSize */) * .9) | 0;
                height = this.editor.getOption(66 /* EditorOption.lineHeight */);
            }
            else {
                height = (fontSize * Math.max(1.3, this.editor.getOption(66 /* EditorOption.lineHeight */) / this.editor.getOption(52 /* EditorOption.fontSize */))) | 0;
            }
            const editorFontInfo = this.editor.getOption(50 /* EditorOption.fontInfo */);
            const node = this._domNode;
            node.classList.add('testing-diff-lens-widget');
            node.textContent = this.getText();
            node.style.lineHeight = `${height}px`;
            node.style.fontSize = `${fontSize}px`;
            node.style.fontFamily = `var(--${"testingDiffLensFontFamily" /* LensContentWidgetVars.FontFamily */})`;
            node.style.fontFeatureSettings = `var(--${"testingDiffLensFontFeatures" /* LensContentWidgetVars.FontFeatures */})`;
            const containerStyle = this.editor.getContainerDomNode().style;
            containerStyle.setProperty("testingDiffLensFontFamily" /* LensContentWidgetVars.FontFamily */, this.editor.getOption(18 /* EditorOption.codeLensFontFamily */) ?? 'inherit');
            containerStyle.setProperty("testingDiffLensFontFeatures" /* LensContentWidgetVars.FontFeatures */, editorFontInfo.fontFeatureSettings);
            this.editor.changeViewZones(accessor => {
                if (this.viewZoneId) {
                    accessor.removeZone(this.viewZoneId);
                }
                this.viewZoneId = accessor.addZone({
                    afterLineNumber: 0,
                    afterColumn: 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */,
                    domNode: document.createElement('div'),
                    heightInPx: 20,
                });
            });
        }
        /** @inheritdoc */
        getDomNode() {
            return this._domNode;
        }
        /** @inheritdoc */
        dispose() {
            this.editor.changeViewZones(accessor => {
                if (this.viewZoneId) {
                    accessor.removeZone(this.viewZoneId);
                }
            });
            this.editor.removeContentWidget(this);
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
        getText() {
            return (0, nls_1.localize)('expected.title', 'Expected');
        }
    }
    class ActualLensContentWidget extends TitleLensContentWidget {
        getId() {
            return 'actualTestingLens';
        }
        getText() {
            return (0, nls_1.localize)('actual.title', 'Actual');
        }
    }
    let RunTestDecoration = class RunTestDecoration {
        get line() {
            return this.editorDecoration.range.startLineNumber;
        }
        get testIds() {
            return this.tests.map(t => t.test.item.extId);
        }
        constructor(tests, visible, model, codeEditorService, testService, contextMenuService, commandService, configurationService, testProfileService, contextKeyService, menuService) {
            this.tests = tests;
            this.visible = visible;
            this.model = model;
            this.codeEditorService = codeEditorService;
            this.testService = testService;
            this.contextMenuService = contextMenuService;
            this.commandService = commandService;
            this.configurationService = configurationService;
            this.testProfileService = testProfileService;
            this.contextKeyService = contextKeyService;
            this.menuService = menuService;
            /** @inheritdoc */
            this.id = '';
            this.displayedStates = tests.map(t => t.resultItem?.computedState);
            this.editorDecoration = createRunTestDecoration(tests.map(t => t.test), tests.map(t => t.resultItem), visible);
            this.editorDecoration.options.glyphMarginHoverMessage = new htmlContent_1.MarkdownString().appendText(this.getGutterLabel());
        }
        /** @inheritdoc */
        click(e) {
            if (e.target.type !== 2 /* MouseTargetType.GUTTER_GLYPH_MARGIN */
                // handled by editor gutter context menu
                || e.event.rightButton
                || platform_1.isMacintosh && e.event.leftButton && e.event.ctrlKey) {
                return false;
            }
            switch ((0, configuration_2.getTestingConfiguration)(this.configurationService, "testing.defaultGutterClickAction" /* TestingConfigKeys.DefaultGutterClickAction */)) {
                case "contextMenu" /* DefaultGutterClickAction.ContextMenu */:
                    this.showContextMenu(e);
                    break;
                case "debug" /* DefaultGutterClickAction.Debug */:
                    this.defaultDebug();
                    break;
                case "run" /* DefaultGutterClickAction.Run */:
                default:
                    this.defaultRun();
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
            if (visible === this.visible && (0, arrays_1.equals)(this.displayedStates, displayedStates)) {
                return false;
            }
            this.tests = newTests;
            this.displayedStates = displayedStates;
            this.visible = visible;
            this.editorDecoration.options = createRunTestDecoration(newTests.map(t => t.test), newTests.map(t => t.resultItem), visible).options;
            this.editorDecoration.options.glyphMarginHoverMessage = new htmlContent_1.MarkdownString().appendText(this.getGutterLabel());
            return true;
        }
        /**
         * Gets whether this decoration serves as the run button for the given test ID.
         */
        isForTest(testId) {
            return this.tests.some(t => t.test.item.extId === testId);
        }
        defaultRun() {
            return this.testService.runTests({
                tests: this.tests.map(({ test }) => test),
                group: 2 /* TestRunProfileBitset.Run */,
            });
        }
        defaultDebug() {
            return this.testService.runTests({
                tests: this.tests.map(({ test }) => test),
                group: 4 /* TestRunProfileBitset.Debug */,
            });
        }
        showContextMenu(e) {
            const editor = this.codeEditorService.listCodeEditors().find(e => e.getModel() === this.model);
            editor?.getContribution(editorLineNumberMenu_1.EditorLineNumberContextMenu.ID)?.show(e);
        }
        getGutterLabel() {
            switch ((0, configuration_2.getTestingConfiguration)(this.configurationService, "testing.defaultGutterClickAction" /* TestingConfigKeys.DefaultGutterClickAction */)) {
                case "contextMenu" /* DefaultGutterClickAction.ContextMenu */:
                    return (0, nls_1.localize)('testing.gutterMsg.contextMenu', 'Click for test options');
                case "debug" /* DefaultGutterClickAction.Debug */:
                    return (0, nls_1.localize)('testing.gutterMsg.debug', 'Click to debug tests, right click for more options');
                case "run" /* DefaultGutterClickAction.Run */:
                default:
                    return (0, nls_1.localize)('testing.gutterMsg.run', 'Click to run tests, right click for more options');
            }
        }
        /**
         * Gets context menu actions relevant for a singel test.
         */
        getTestContextMenuActions(test, resultItem) {
            const testActions = [];
            const capabilities = this.testProfileService.capabilitiesForTest(test);
            if (capabilities & 2 /* TestRunProfileBitset.Run */) {
                testActions.push(new actions_1.Action('testing.gutter.run', (0, nls_1.localize)('run test', 'Run Test'), undefined, undefined, () => this.testService.runTests({
                    group: 2 /* TestRunProfileBitset.Run */,
                    tests: [test],
                })));
            }
            if (capabilities & 4 /* TestRunProfileBitset.Debug */) {
                testActions.push(new actions_1.Action('testing.gutter.debug', (0, nls_1.localize)('debug test', 'Debug Test'), undefined, undefined, () => this.testService.runTests({
                    group: 4 /* TestRunProfileBitset.Debug */,
                    tests: [test],
                })));
            }
            if (capabilities & 16 /* TestRunProfileBitset.HasNonDefaultProfile */) {
                testActions.push(new actions_1.Action('testing.runUsing', (0, nls_1.localize)('testing.runUsing', 'Execute Using Profile...'), undefined, undefined, async () => {
                    const profile = await this.commandService.executeCommand('vscode.pickTestProfile', { onlyForTest: test });
                    if (!profile) {
                        return;
                    }
                    this.testService.runResolvedTests({
                        targets: [{
                                profileGroup: profile.group,
                                profileId: profile.profileId,
                                controllerId: profile.controllerId,
                                testIds: [test.item.extId]
                            }]
                    });
                }));
            }
            if (resultItem && (0, testingStates_1.isFailedState)(resultItem.computedState)) {
                testActions.push(new actions_1.Action('testing.gutter.peekFailure', (0, nls_1.localize)('peek failure', 'Peek Error'), undefined, undefined, () => this.commandService.executeCommand('vscode.peekTestError', test.item.extId)));
            }
            testActions.push(new actions_1.Action('testing.gutter.reveal', (0, nls_1.localize)('reveal test', 'Reveal in Test Explorer'), undefined, undefined, () => this.commandService.executeCommand('_revealTestInExplorer', test.item.extId)));
            const contributed = this.getContributedTestActions(test, capabilities);
            return { object: actions_1.Separator.join(testActions, contributed), dispose() { } };
        }
        getContributedTestActions(test, capabilities) {
            const contextOverlay = this.contextKeyService.createOverlay((0, testItemContextOverlay_1.getTestItemContextOverlay)(test, capabilities));
            const menu = this.menuService.createMenu(actions_2.MenuId.TestItemGutter, contextOverlay);
            try {
                const target = [];
                const arg = (0, testService_1.getContextForTestItem)(this.testService.collection, test.item.extId);
                (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(menu, { shouldForwardArgs: true, arg }, target);
                return target;
            }
            finally {
                menu.dispose();
            }
        }
    };
    RunTestDecoration = __decorate([
        __param(3, codeEditorService_1.ICodeEditorService),
        __param(4, testService_1.ITestService),
        __param(5, contextView_1.IContextMenuService),
        __param(6, commands_1.ICommandService),
        __param(7, configuration_1.IConfigurationService),
        __param(8, testProfileService_1.ITestProfileService),
        __param(9, contextkey_1.IContextKeyService),
        __param(10, actions_2.IMenuService)
    ], RunTestDecoration);
    class MultiRunTestDecoration extends RunTestDecoration {
        getContextMenuActions() {
            const allActions = [];
            if (this.tests.some(({ test }) => this.testProfileService.capabilitiesForTest(test) & 2 /* TestRunProfileBitset.Run */)) {
                allActions.push(new actions_1.Action('testing.gutter.runAll', (0, nls_1.localize)('run all test', 'Run All Tests'), undefined, undefined, () => this.defaultRun()));
            }
            if (this.tests.some(({ test }) => this.testProfileService.capabilitiesForTest(test) & 4 /* TestRunProfileBitset.Debug */)) {
                allActions.push(new actions_1.Action('testing.gutter.debugAll', (0, nls_1.localize)('debug all test', 'Debug All Tests'), undefined, undefined, () => this.defaultDebug()));
            }
            const testItems = this.tests.map(testItem => ({
                currentLabel: testItem.test.item.label,
                testItem,
                parent: testId_1.TestId.fromString(testItem.test.item.extId).parentId,
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
                        const parent = this.testService.collection.getNodeById(conflict.parent.toString());
                        conflict.currentLabel = parent?.item.label + ' > ' + conflict.currentLabel;
                        conflict.parent = conflict.parent.parentId;
                    }
                    else {
                        hasParent = false;
                    }
                }
            }
            const disposable = new lifecycle_1.DisposableStore();
            const testSubmenus = testItems.map(({ currentLabel, testItem }) => {
                const actions = this.getTestContextMenuActions(testItem.test, testItem.resultItem);
                disposable.add(actions);
                return new actions_1.SubmenuAction(testItem.test.item.extId, (0, iconLabels_1.stripIcons)(currentLabel), actions.object);
            });
            return { object: actions_1.Separator.join(allActions, testSubmenus), dispose: () => disposable.dispose() };
        }
    }
    let RunSingleTestDecoration = class RunSingleTestDecoration extends RunTestDecoration {
        constructor(test, resultItem, model, visible, codeEditorService, testService, commandService, contextMenuService, configurationService, testProfiles, contextKeyService, menuService) {
            super([{ test, resultItem }], visible, model, codeEditorService, testService, contextMenuService, commandService, configurationService, testProfiles, contextKeyService, menuService);
        }
        getContextMenuActions() {
            return this.getTestContextMenuActions(this.tests[0].test, this.tests[0].resultItem);
        }
    };
    RunSingleTestDecoration = __decorate([
        __param(4, codeEditorService_1.ICodeEditorService),
        __param(5, testService_1.ITestService),
        __param(6, commands_1.ICommandService),
        __param(7, contextView_1.IContextMenuService),
        __param(8, configuration_1.IConfigurationService),
        __param(9, testProfileService_1.ITestProfileService),
        __param(10, contextkey_1.IContextKeyService),
        __param(11, actions_2.IMenuService)
    ], RunSingleTestDecoration);
    const lineBreakRe = /\r?\n\s*/g;
    let TestMessageDecoration = class TestMessageDecoration {
        static { TestMessageDecoration_1 = this; }
        static { this.inlineClassName = 'test-message-inline-content'; }
        static { this.decorationId = `testmessage-${(0, uuid_1.generateUuid)()}`; }
        constructor(testMessage, messageUri, textModel, peekOpener, editorService) {
            this.testMessage = testMessage;
            this.messageUri = messageUri;
            this.peekOpener = peekOpener;
            this.id = '';
            this.contentIdClass = `test-message-inline-content-id${(0, uuid_1.generateUuid)()}`;
            this.location = testMessage.location;
            this.line = this.location.range.startLineNumber;
            const severity = testMessage.type;
            const message = testMessage.message;
            const options = editorService.resolveDecorationOptions(TestMessageDecoration_1.decorationId, true);
            options.hoverMessage = typeof message === 'string' ? new htmlContent_1.MarkdownString().appendText(message) : message;
            options.zIndex = 10; // todo: in spite of the z-index, this appears behind gitlens
            options.className = `testing-inline-message-severity-${severity}`;
            options.isWholeLine = true;
            options.stickiness = 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */;
            options.collapseOnReplaceEdit = true;
            let inlineText = (0, markdownRenderer_1.renderStringAsPlaintext)(message).replace(lineBreakRe, ' ');
            if (inlineText.length > MAX_INLINE_MESSAGE_LENGTH) {
                inlineText = inlineText.slice(0, MAX_INLINE_MESSAGE_LENGTH - 1) + '…';
            }
            options.after = {
                content: ' '.repeat(4) + inlineText,
                inlineClassName: `test-message-inline-content test-message-inline-content-s${severity} ${this.contentIdClass} ${messageUri ? 'test-message-inline-content-clickable' : ''}`
            };
            options.showIfCollapsed = true;
            const rulerColor = severity === 0 /* TestMessageType.Error */
                ? editorColorRegistry_1.overviewRulerError
                : editorColorRegistry_1.overviewRulerInfo;
            if (rulerColor) {
                options.overviewRuler = { color: (0, themeService_1.themeColorFromId)(rulerColor), position: model_1.OverviewRulerLane.Right };
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
            if (!this.messageUri) {
                return false;
            }
            if (e.target.element?.className.includes(this.contentIdClass)) {
                this.peekOpener.peekUri(this.messageUri);
            }
            return false;
        }
        getContextMenuActions() {
            return { object: [], dispose: () => { } };
        }
    };
    TestMessageDecoration = TestMessageDecoration_1 = __decorate([
        __param(3, testingPeekOpener_1.ITestingPeekOpener),
        __param(4, codeEditorService_1.ICodeEditorService)
    ], TestMessageDecoration);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGluZ0RlY29yYXRpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVzdGluZy9icm93c2VyL3Rlc3RpbmdEZWNvcmF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBb0RoRyxNQUFNLHlCQUF5QixHQUFHLEdBQUcsQ0FBQztJQUV0QyxTQUFTLHNCQUFzQixDQUFDLGlCQUFxQyxFQUFFLFVBQXVCO1FBQzdGLE1BQU0sV0FBVyxHQUFHLGlCQUFpQixDQUFDLGVBQWUsRUFBRSxDQUFDO1FBRXhELEtBQUssTUFBTSxVQUFVLElBQUksV0FBVyxFQUFFO1lBQ3JDLElBQUksVUFBVSxDQUFDLGlCQUFpQixFQUFFLEtBQUssVUFBVSxFQUFFO2dCQUNsRCxPQUFPLElBQUksQ0FBQzthQUNaO1NBQ0Q7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNkLENBQUM7SUFPRCwrRkFBK0Y7SUFDL0YsTUFBTSxpQkFBaUI7UUFBdkI7WUFDa0IsZUFBVSxHQUFHLElBQUksR0FBRyxFQUE2QixDQUFDO1lBQ2xELGFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBdUMsQ0FBQztRQXlENUUsQ0FBQztRQXZEQSxJQUFXLElBQUk7WUFDZCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO1FBQ2xELENBQUM7UUFFRCwwRUFBMEU7UUFDbkUsZ0JBQWdCLENBQUMsT0FBaUI7WUFDeEMsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN4QyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pDLENBQUM7UUFFRCxxRUFBcUU7UUFDOUQsVUFBVSxD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