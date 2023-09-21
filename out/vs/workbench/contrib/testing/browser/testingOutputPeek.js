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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/markdownRenderer", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/aria/aria", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/browser/ui/splitview/splitview", "vs/base/common/actions", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/color", "vs/base/common/event", "vs/base/common/iconLabels", "vs/base/common/iterator", "vs/base/common/lazy", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/base/common/themables", "vs/base/common/types", "vs/editor/browser/editorBrowser", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/widget/codeEditorWidget", "vs/editor/browser/widget/diffEditor/diffEditorWidget", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/editor/common/services/resolverService", "vs/editor/contrib/markdownRenderer/browser/markdownRenderer", "vs/editor/contrib/peekView/browser/peekView", "vs/nls", "vs/platform/action/common/actionCommonCategories", "vs/platform/actions/browser/floatingMenu", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/keybinding/common/keybinding", "vs/platform/list/browser/listService", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/terminal/common/capabilities/terminalCapabilityStore", "vs/platform/terminal/common/terminalStrings", "vs/platform/theme/common/themeService", "vs/platform/workspace/common/workspace", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/editor/editorModel", "vs/workbench/common/theme", "vs/workbench/common/views", "vs/workbench/contrib/terminal/browser/detachedTerminal", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/browser/xterm/xtermTerminal", "vs/workbench/contrib/terminal/common/terminalColorRegistry", "vs/workbench/contrib/testing/browser/explorerProjections/testItemContextOverlay", "vs/workbench/contrib/testing/browser/icons", "vs/workbench/contrib/testing/browser/theme", "vs/workbench/contrib/testing/common/configuration", "vs/workbench/contrib/testing/common/observableValue", "vs/workbench/contrib/testing/common/storedValue", "vs/workbench/contrib/testing/common/testExplorerFilterState", "vs/workbench/contrib/testing/common/testProfileService", "vs/workbench/contrib/testing/common/testResult", "vs/workbench/contrib/testing/common/testResultService", "vs/workbench/contrib/testing/common/testService", "vs/workbench/contrib/testing/common/testTypes", "vs/workbench/contrib/testing/common/testingContextKeys", "vs/workbench/contrib/testing/common/testingPeekOpener", "vs/workbench/contrib/testing/common/testingStates", "vs/workbench/contrib/testing/common/testingUri", "vs/workbench/services/editor/common/editorService", "vs/css!./testingOutputPeek"], function (require, exports, dom, markdownRenderer_1, actionbar_1, aria_1, iconLabels_1, scrollableElement_1, splitview_1, actions_1, async_1, codicons_1, color_1, event_1, iconLabels_2, iterator_1, lazy_1, lifecycle_1, strings_1, themables_1, types_1, editorBrowser_1, editorExtensions_1, codeEditorService_1, codeEditorWidget_1, diffEditorWidget_1, embeddedCodeEditorWidget_1, range_1, editorContextKeys_1, resolverService_1, markdownRenderer_2, peekView_1, nls_1, actionCommonCategories_1, floatingMenu_1, menuEntryActionViewItem_1, actions_2, commands_1, configuration_1, contextkey_1, contextView_1, instantiation_1, serviceCollection_1, keybinding_1, listService_1, notification_1, opener_1, storage_1, telemetry_1, terminalCapabilityStore_1, terminalStrings_1, themeService_1, workspace_1, viewPane_1, editorModel_1, theme_1, views_1, detachedTerminal_1, terminal_1, xtermTerminal_1, terminalColorRegistry_1, testItemContextOverlay_1, icons, theme_2, configuration_2, observableValue_1, storedValue_1, testExplorerFilterState_1, testProfileService_1, testResult_1, testResultService_1, testService_1, testTypes_1, testingContextKeys_1, testingPeekOpener_1, testingStates_1, testingUri_1, editorService_1) {
    "use strict";
    var TestingOutputPeekController_1, TestResultsViewContent_1, TestResultsPeek_1, TestRunElementRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ToggleTestingPeekHistory = exports.OpenMessageInEditorAction = exports.GoToPreviousMessageAction = exports.GoToNextMessageAction = exports.CloseTestPeek = exports.TestResultsView = exports.TestingOutputPeekController = exports.TestingPeekOpener = void 0;
    class MessageSubject {
        get isDiffable() {
            return this.message.type === 0 /* TestMessageType.Error */ && isDiffable(this.message);
        }
        get contextValue() {
            return this.message.type === 0 /* TestMessageType.Error */ ? this.message.contextValue : undefined;
        }
        get context() {
            return {
                $mid: 18 /* MarshalledId.TestMessageMenuArgs */,
                extId: this.test.extId,
                message: testTypes_1.ITestMessage.serialize(this.message),
            };
        }
        constructor(result, test, taskIndex, messageIndex) {
            this.result = result;
            this.taskIndex = taskIndex;
            this.messageIndex = messageIndex;
            this.test = test.item;
            const messages = test.tasks[taskIndex].messages;
            this.messageIndex = messageIndex;
            const parts = { messageIndex, resultId: result.id, taskIndex, testExtId: test.item.extId };
            this.expectedUri = (0, testingUri_1.buildTestUri)({ ...parts, type: 4 /* TestUriType.ResultExpectedOutput */ });
            this.actualUri = (0, testingUri_1.buildTestUri)({ ...parts, type: 3 /* TestUriType.ResultActualOutput */ });
            this.messageUri = (0, testingUri_1.buildTestUri)({ ...parts, type: 2 /* TestUriType.ResultMessage */ });
            const message = this.message = messages[this.messageIndex];
            this.revealLocation = message.location ?? (test.item.uri && test.item.range ? { uri: test.item.uri, range: range_1.Range.lift(test.item.range) } : undefined);
        }
    }
    class TaskSubject {
        constructor(result, taskIndex) {
            this.result = result;
            this.taskIndex = taskIndex;
            this.outputUri = (0, testingUri_1.buildTestUri)({ resultId: result.id, taskIndex, type: 0 /* TestUriType.TaskOutput */ });
        }
    }
    class TestOutputSubject {
        constructor(result, taskIndex, task, test) {
            this.result = result;
            this.taskIndex = taskIndex;
            this.task = task;
            this.test = test;
            this.outputUri = (0, testingUri_1.buildTestUri)({ resultId: this.result.id, taskIndex: this.taskIndex, testExtId: this.test.item.extId, type: 1 /* TestUriType.TestOutput */ });
        }
    }
    const equalsSubject = (a, b) => ((a instanceof MessageSubject && b instanceof MessageSubject && a.message === b.message) ||
        (a instanceof TaskSubject && b instanceof TaskSubject && a.result === b.result && a.taskIndex === b.taskIndex) ||
        (a instanceof TestOutputSubject && b instanceof TestOutputSubject && a.test === b.test && a.taskIndex === b.taskIndex));
    /** Iterates through every message in every result */
    function* allMessages(results) {
        for (const result of results) {
            for (const test of result.tests) {
                for (let taskIndex = 0; taskIndex < test.tasks.length; taskIndex++) {
                    for (let messageIndex = 0; messageIndex < test.tasks[taskIndex].messages.length; messageIndex++) {
                        yield { result, test, taskIndex, messageIndex };
                    }
                }
            }
        }
    }
    let TestingPeekOpener = class TestingPeekOpener extends lifecycle_1.Disposable {
        constructor(configuration, editorService, codeEditorService, testResults, testService, storageService, viewsService, commandService, notificationService) {
            super();
            this.configuration = configuration;
            this.editorService = editorService;
            this.codeEditorService = codeEditorService;
            this.testResults = testResults;
            this.testService = testService;
            this.storageService = storageService;
            this.viewsService = viewsService;
            this.commandService = commandService;
            this.notificationService = notificationService;
            /** @inheritdoc */
            this.historyVisible = observableValue_1.MutableObservableValue.stored(this._register(new storedValue_1.StoredValue({
                key: 'testHistoryVisibleInPeek',
                scope: 0 /* StorageScope.PROFILE */,
                target: 0 /* StorageTarget.USER */,
            }, this.storageService)), false);
            this._register(testResults.onTestChanged(this.openPeekOnFailure, this));
        }
        /** @inheritdoc */
        async open() {
            let uri;
            const active = this.editorService.activeTextEditorControl;
            if ((0, editorBrowser_1.isCodeEditor)(active) && active.getModel()?.uri) {
                const modelUri = active.getModel()?.uri;
                if (modelUri) {
                    uri = await this.getFileCandidateMessage(modelUri, active.getPosition());
                }
            }
            if (!uri) {
                uri = this.lastUri;
            }
            if (!uri) {
                uri = this.getAnyCandidateMessage();
            }
            if (!uri) {
                return false;
            }
            return this.showPeekFromUri(uri);
        }
        /** @inheritdoc */
        tryPeekFirstError(result, test, options) {
            const candidate = this.getFailedCandidateMessage(test);
            if (!candidate) {
                return false;
            }
            const message = candidate.message;
            this.showPeekFromUri({
                type: 2 /* TestUriType.ResultMessage */,
                documentUri: message.location.uri,
                taskIndex: candidate.taskId,
                messageIndex: candidate.index,
                resultId: result.id,
                testExtId: test.item.extId,
            }, undefined, { selection: message.location.range, ...options });
            return true;
        }
        /** @inheritdoc */
        peekUri(uri, options = {}) {
            const parsed = (0, testingUri_1.parseTestUri)(uri);
            const result = parsed && this.testResults.getResult(parsed.resultId);
            if (!parsed || !result || !('testExtId' in parsed)) {
                return false;
            }
            if (!('messageIndex' in parsed)) {
                return false;
            }
            const message = result.getStateById(parsed.testExtId)?.tasks[parsed.taskIndex].messages[parsed.messageIndex];
            if (!message?.location) {
                return false;
            }
            this.showPeekFromUri({
                type: 2 /* TestUriType.ResultMessage */,
                documentUri: message.location.uri,
                taskIndex: parsed.taskIndex,
                messageIndex: parsed.messageIndex,
                resultId: result.id,
                testExtId: parsed.testExtId,
            }, options.inEditor, { selection: message.location.range, ...options.options });
            return true;
        }
        /** @inheritdoc */
        closeAllPeeks() {
            for (const editor of this.codeEditorService.listCodeEditors()) {
                TestingOutputPeekController.get(editor)?.removePeek();
            }
        }
        openCurrentInEditor() {
            const current = this.getActiveControl();
            if (!current) {
                return;
            }
            const options = { pinned: false, revealIfOpened: true };
            if (current instanceof TaskSubject || current instanceof TestOutputSubject) {
                this.editorService.openEditor({ resource: current.outputUri, options });
                return;
            }
            if (current instanceof TestOutputSubject) {
                this.editorService.openEditor({ resource: current.outputUri, options });
                return;
            }
            const message = current.message;
            if (current.isDiffable) {
                this.editorService.openEditor({
                    original: { resource: current.expectedUri },
                    modified: { resource: current.actualUri },
                    options,
                });
            }
            else if (typeof message.message === 'string') {
                this.editorService.openEditor({ resource: current.messageUri, options });
            }
            else {
                this.commandService.executeCommand('markdown.showPreview', current.messageUri).catch(err => {
                    this.notificationService.error((0, nls_1.localize)('testing.markdownPeekError', 'Could not open markdown preview: {0}.\n\nPlease make sure the markdown extension is enabled.', err.message));
                });
            }
        }
        getActiveControl() {
            const editor = getPeekedEditorFromFocus(this.codeEditorService);
            const controller = editor && TestingOutputPeekController.get(editor);
            return controller?.subject ?? this.viewsService.getActiveViewWithId("workbench.panel.testResults.view" /* Testing.ResultsViewId */)?.subject;
        }
        /** @inheritdoc */
        async showPeekFromUri(uri, editor, options) {
            if ((0, editorBrowser_1.isCodeEditor)(editor)) {
                this.lastUri = uri;
                TestingOutputPeekController.get(editor)?.show((0, testingUri_1.buildTestUri)(this.lastUri));
                return true;
            }
            const pane = await this.editorService.openEditor({
                resource: uri.documentUri,
                options: { revealIfOpened: true, ...options }
            });
            const control = pane?.getControl();
            if (!(0, editorBrowser_1.isCodeEditor)(control)) {
                return false;
            }
            this.lastUri = uri;
            TestingOutputPeekController.get(control)?.show((0, testingUri_1.buildTestUri)(this.lastUri));
            return true;
        }
        /**
         * Opens the peek view on a test failure, based on user preferences.
         */
        openPeekOnFailure(evt) {
            if (evt.reason !== 1 /* TestResultItemChangeReason.OwnStateChange */) {
                return;
            }
            const candidate = this.getFailedCandidateMessage(evt.item);
            if (!candidate) {
                return;
            }
            if (evt.result.request.continuous && !(0, configuration_2.getTestingConfiguration)(this.configuration, "testing.automaticallyOpenPeekViewDuringAutoRun" /* TestingConfigKeys.AutoOpenPeekViewDuringContinuousRun */)) {
                return;
            }
            const editors = this.codeEditorService.listCodeEditors();
            const cfg = (0, configuration_2.getTestingConfiguration)(this.configuration, "testing.automaticallyOpenPeekView" /* TestingConfigKeys.AutoOpenPeekView */);
            // don't show the peek if the user asked to only auto-open peeks for visible tests,
            // and this test is not in any of the editors' models.
            switch (cfg) {
                case "failureInVisibleDocument" /* AutoOpenPeekViewWhen.FailureVisible */: {
                    const editorUris = new Set(editors.map(e => e.getModel()?.uri.toString()));
                    if (!iterator_1.Iterable.some((0, testResult_1.resultItemParents)(evt.result, evt.item), i => i.item.uri && editorUris.has(i.item.uri.toString()))) {
                        return;
                    }
                    break; //continue
                }
                case "failureAnywhere" /* AutoOpenPeekViewWhen.FailureAnywhere */:
                    break; //continue
                default:
                    return; // never show
            }
            const controllers = editors.map(TestingOutputPeekController.get);
            if (controllers.some(c => c?.subject)) {
                return;
            }
            this.tryPeekFirstError(evt.result, evt.item);
        }
        /**
         * Gets the message closest to the given position from a test in the file.
         */
        async getFileCandidateMessage(uri, position) {
            let best;
            let bestDistance = Infinity;
            // Get all tests for the document. In those, find one that has a test
            // message closest to the cursor position.
            const demandedUriStr = uri.toString();
            for (const test of this.testService.collection.all) {
                const result = this.testResults.getStateById(test.item.extId);
                if (!result) {
                    continue;
                }
                mapFindTestMessage(result[1], (_task, message, messageIndex, taskIndex) => {
                    if (message.type !== 0 /* TestMessageType.Error */ || !message.location || message.location.uri.toString() !== demandedUriStr) {
                        return;
                    }
                    const distance = position ? Math.abs(position.lineNumber - message.location.range.startLineNumber) : 0;
                    if (!best || distance <= bestDistance) {
                        bestDistance = distance;
                        best = {
                            type: 2 /* TestUriType.ResultMessage */,
                            testExtId: result[1].item.extId,
                            resultId: result[0].id,
                            taskIndex,
                            messageIndex,
                            documentUri: uri,
                        };
                    }
                });
            }
            return best;
        }
        /**
         * Gets any possible still-relevant message from the results.
         */
        getAnyCandidateMessage() {
            const seen = new Set();
            for (const result of this.testResults.results) {
                for (const test of result.tests) {
                    if (seen.has(test.item.extId)) {
                        continue;
                    }
                    seen.add(test.item.extId);
                    const found = mapFindTestMessage(test, (task, message, messageIndex, taskIndex) => (message.location && {
                        type: 2 /* TestUriType.ResultMessage */,
                        testExtId: test.item.extId,
                        resultId: result.id,
                        taskIndex,
                        messageIndex,
                        documentUri: message.location.uri,
                    }));
                    if (found) {
                        return found;
                    }
                }
            }
            return undefined;
        }
        /**
         * Gets the first failed message that can be displayed from the result.
         */
        getFailedCandidateMessage(test) {
            let best;
            mapFindTestMessage(test, (task, message, messageIndex, taskId) => {
                if (!(0, testingStates_1.isFailedState)(task.state) || !message.location) {
                    return;
                }
                if (best && message.type !== 0 /* TestMessageType.Error */) {
                    return;
                }
                best = { taskId, index: messageIndex, message };
            });
            return best;
        }
    };
    exports.TestingPeekOpener = TestingPeekOpener;
    exports.TestingPeekOpener = TestingPeekOpener = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, editorService_1.IEditorService),
        __param(2, codeEditorService_1.ICodeEditorService),
        __param(3, testResultService_1.ITestResultService),
        __param(4, testService_1.ITestService),
        __param(5, storage_1.IStorageService),
        __param(6, views_1.IViewsService),
        __param(7, commands_1.ICommandService),
        __param(8, notification_1.INotificationService)
    ], TestingPeekOpener);
    const mapFindTestMessage = (test, fn) => {
        for (let taskIndex = 0; taskIndex < test.tasks.length; taskIndex++) {
            const task = test.tasks[taskIndex];
            for (let messageIndex = 0; messageIndex < task.messages.length; messageIndex++) {
                const r = fn(task, task.messages[messageIndex], messageIndex, taskIndex);
                if (r !== undefined) {
                    return r;
                }
            }
        }
        return undefined;
    };
    /**
     * Adds output/message peek functionality to code editors.
     */
    let TestingOutputPeekController = TestingOutputPeekController_1 = class TestingOutputPeekController extends lifecycle_1.Disposable {
        /**
         * Gets the controller associated with the given code editor.
         */
        static get(editor) {
            return editor.getContribution("editor.contrib.testingOutputPeek" /* Testing.OutputPeekContributionId */);
        }
        /**
         * Gets the currently display subject. Undefined if the peek is not open.
         */
        get subject() {
            return this.peek.value?.current;
        }
        constructor(editor, codeEditorService, instantiationService, testResults, contextKeyService) {
            super();
            this.editor = editor;
            this.codeEditorService = codeEditorService;
            this.instantiationService = instantiationService;
            this.testResults = testResults;
            /**
             * Currently-shown peek view.
             */
            this.peek = this._register(new lifecycle_1.MutableDisposable());
            this.visible = testingContextKeys_1.TestingContextKeys.isPeekVisible.bindTo(contextKeyService);
            this._register(editor.onDidChangeModel(() => this.peek.clear()));
            this._register(testResults.onResultsChanged(this.closePeekOnCertainResultEvents, this));
            this._register(testResults.onTestChanged(this.closePeekOnTestChange, this));
        }
        /**
         * Toggles peek visibility for the URI.
         */
        toggle(uri) {
            if (this.currentPeekUri?.toString() === uri.toString()) {
                this.peek.clear();
            }
            else {
                this.show(uri);
            }
        }
        /**
         * Shows a peek for the message in the editor.
         */
        async show(uri) {
            const subject = this.retrieveTest(uri);
            if (!subject) {
                return;
            }
            if (!this.peek.value) {
                this.peek.value = this.instantiationService.createInstance(TestResultsPeek, this.editor);
                this.peek.value.onDidClose(() => {
                    this.visible.set(false);
                    this.currentPeekUri = undefined;
                    this.peek.value = undefined;
                });
                this.visible.set(true);
                this.peek.value.create();
            }
            if (subject instanceof MessageSubject) {
                (0, aria_1.alert)((0, markdownRenderer_1.renderStringAsPlaintext)(subject.message.message));
            }
            this.peek.value.setModel(subject);
            this.currentPeekUri = uri;
        }
        async openAndShow(uri) {
            const subject = this.retrieveTest(uri);
            if (!subject) {
                return;
            }
            if (!subject.revealLocation || subject.revealLocation.uri.toString() === this.editor.getModel()?.uri.toString()) {
                return this.show(uri);
            }
            const otherEditor = await this.codeEditorService.openCodeEditor({
                resource: subject.revealLocation.uri,
                options: { pinned: false, revealIfOpened: true }
            }, this.editor);
            if (otherEditor) {
                TestingOutputPeekController_1.get(otherEditor)?.removePeek();
                return TestingOutputPeekController_1.get(otherEditor)?.show(uri);
            }
        }
        /**
         * Disposes the peek view, if any.
         */
        removePeek() {
            this.peek.clear();
        }
        /**
         * Shows the next message in the peek, if possible.
         */
        next() {
            const subject = this.peek.value?.current;
            if (!subject) {
                return;
            }
            let found = false;
            for (const { messageIndex, taskIndex, result, test } of allMessages(this.testResults.results)) {
                if (subject instanceof TaskSubject && result.id === subject.result.id) {
                    found = true; // open the first message found in the current result
                }
                if (found) {
                    this.openAndShow((0, testingUri_1.buildTestUri)({
                        type: 2 /* TestUriType.ResultMessage */,
                        messageIndex,
                        taskIndex,
                        resultId: result.id,
                        testExtId: test.item.extId
                    }));
                    return;
                }
                if (subject instanceof TestOutputSubject && subject.test.item.extId === test.item.extId && subject.taskIndex === taskIndex && subject.result.id === result.id) {
                    found = true;
                }
                if (subject instanceof MessageSubject && subject.test.extId === test.item.extId && subject.messageIndex === messageIndex && subject.taskIndex === taskIndex && subject.result.id === result.id) {
                    found = true;
                }
            }
        }
        /**
         * Shows the previous message in the peek, if possible.
         */
        previous() {
            const subject = this.peek.value?.current;
            if (!subject) {
                return;
            }
            let previous;
            for (const m of allMessages(this.testResults.results)) {
                if (subject instanceof TaskSubject) {
                    if (m.result.id === subject.result.id) {
                        break;
                    }
                    continue;
                }
                if (subject instanceof TestOutputSubject) {
                    if (m.test.item.extId === subject.test.item.extId && m.result.id === subject.result.id && m.taskIndex === subject.taskIndex) {
                        break;
                    }
                    continue;
                }
                if (subject.test.extId === m.test.item.extId && subject.messageIndex === m.messageIndex && subject.taskIndex === m.taskIndex && subject.result.id === m.result.id) {
                    break;
                }
                previous = m;
            }
            if (previous) {
                this.openAndShow((0, testingUri_1.buildTestUri)({
                    type: 2 /* TestUriType.ResultMessage */,
                    messageIndex: previous.messageIndex,
                    taskIndex: previous.taskIndex,
                    resultId: previous.result.id,
                    testExtId: previous.test.item.extId
                }));
            }
        }
        /**
         * Removes the peek view if it's being displayed on the given test ID.
         */
        removeIfPeekingForTest(testId) {
            const c = this.peek.value?.current;
            if (c && c instanceof MessageSubject && c.test.extId === testId) {
                this.peek.clear();
            }
        }
        /**
         * If the test we're currently showing has its state change to something
         * else, then clear the peek.
         */
        closePeekOnTestChange(evt) {
            if (evt.reason !== 1 /* TestResultItemChangeReason.OwnStateChange */ || evt.previousState === evt.item.ownComputedState) {
                return;
            }
            this.removeIfPeekingForTest(evt.item.item.extId);
        }
        closePeekOnCertainResultEvents(evt) {
            if ('started' in evt) {
                this.peek.clear(); // close peek when runs start
            }
            if ('removed' in evt && this.testResults.results.length === 0) {
                this.peek.clear(); // close the peek if results are cleared
            }
        }
        retrieveTest(uri) {
            const parts = (0, testingUri_1.parseTestUri)(uri);
            if (!parts) {
                return undefined;
            }
            const result = this.testResults.results.find(r => r.id === parts.resultId);
            if (!result) {
                return;
            }
            if (parts.type === 0 /* TestUriType.TaskOutput */) {
                return new TaskSubject(result, parts.taskIndex);
            }
            if (parts.type === 1 /* TestUriType.TestOutput */) {
                const test = result.getStateById(parts.testExtId);
                const task = result.tasks[parts.taskIndex];
                if (!test || !task) {
                    return;
                }
                return new TestOutputSubject(result, parts.taskIndex, task, test);
            }
            const { testExtId, taskIndex, messageIndex } = parts;
            const test = result?.getStateById(testExtId);
            if (!test || !test.tasks[parts.taskIndex]) {
                return;
            }
            return new MessageSubject(result, test, taskIndex, messageIndex);
        }
    };
    exports.TestingOutputPeekController = TestingOutputPeekController;
    exports.TestingOutputPeekController = TestingOutputPeekController = TestingOutputPeekController_1 = __decorate([
        __param(1, codeEditorService_1.ICodeEditorService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, testResultService_1.ITestResultService),
        __param(4, contextkey_1.IContextKeyService)
    ], TestingOutputPeekController);
    let TestResultsViewContent = class TestResultsViewContent extends lifecycle_1.Disposable {
        static { TestResultsViewContent_1 = this; }
        constructor(editor, options, instantiationService, modelService, contextKeyService) {
            super();
            this.editor = editor;
            this.options = options;
            this.instantiationService = instantiationService;
            this.modelService = modelService;
            this.contextKeyService = contextKeyService;
            this.didReveal = this._register(new event_1.Emitter());
            this.currentSubjectStore = this._register(new lifecycle_1.DisposableStore());
            this.contentProvidersUpdateLimiter = this._register(new async_1.Limiter(1));
        }
        fillBody(containerElement) {
            const initialSpitWidth = TestResultsViewContent_1.lastSplitWidth;
            this.splitView = new splitview_1.SplitView(containerElement, { orientation: 1 /* Orientation.HORIZONTAL */ });
            const { historyVisible, showRevealLocationOnMessages } = this.options;
            const isInPeekView = this.editor !== undefined;
            const messageContainer = this.messageContainer = dom.append(containerElement, dom.$('.test-output-peek-message-container'));
            this.contentProviders = [
                this._register(this.instantiationService.createInstance(DiffContentProvider, this.editor, messageContainer)),
                this._register(this.instantiationService.createInstance(MarkdownTestMessagePeek, messageContainer)),
                this._register(this.instantiationService.createInstance(TerminalMessagePeek, messageContainer, isInPeekView)),
                this._register(this.instantiationService.createInstance(PlainTextMessagePeek, this.editor, messageContainer)),
            ];
            this.messageContextKeyService = this._register(this.contextKeyService.createScoped(this.messageContainer));
            this.contextKeyTestMessage = testingContextKeys_1.TestingContextKeys.testMessageContext.bindTo(this.messageContextKeyService);
            this.contextKeyResultOutdated = testingContextKeys_1.TestingContextKeys.testResultOutdated.bindTo(this.messageContextKeyService);
            const treeContainer = dom.append(containerElement, dom.$('.test-output-peek-tree'));
            const tree = this._register(this.instantiationService.createInstance(OutputPeekTree, treeContainer, this.didReveal.event, { showRevealLocationOnMessages }));
            this.onDidRequestReveal = tree.onDidRequestReview;
            this.splitView.addView({
                onDidChange: event_1.Event.None,
                element: messageContainer,
                minimumSize: 200,
                maximumSize: Number.MAX_VALUE,
                layout: width => {
                    TestResultsViewContent_1.lastSplitWidth = width;
                    if (this.dimension) {
                        for (const provider of this.contentProviders) {
                            provider.layout({ height: this.dimension.height, width });
                        }
                    }
                },
            }, splitview_1.Sizing.Distribute);
            this.splitView.addView({
                onDidChange: event_1.Event.None,
                element: treeContainer,
                minimumSize: 100,
                maximumSize: Number.MAX_VALUE,
                layout: width => {
                    if (this.dimension) {
                        tree.layout(this.dimension.height, width);
                    }
                },
            }, splitview_1.Sizing.Distribute);
            const historyViewIndex = 1;
            this.splitView.setViewVisible(historyViewIndex, historyVisible.value);
            this._register(historyVisible.onDidChange(visible => {
                this.splitView.setViewVisible(historyViewIndex, visible);
            }));
            if (initialSpitWidth) {
                queueMicrotask(() => this.splitView.resizeView(0, initialSpitWidth));
            }
        }
        /**
         * Shows a message in-place without showing or changing the peek location.
         * This is mostly used if peeking a message without a location.
         */
        reveal(opts) {
            this.didReveal.fire(opts);
            if (this.current && equalsSubject(this.current, opts.subject)) {
                return Promise.resolve();
            }
            this.current = opts.subject;
            return this.contentProvidersUpdateLimiter.queue(async () => {
                await Promise.all(this.contentProviders.map(p => p.update(opts.subject)));
                this.currentSubjectStore.clear();
                this.populateFloatingClick(opts.subject);
            });
        }
        populateFloatingClick(subject) {
            if (!(subject instanceof MessageSubject)) {
                return;
            }
            this.currentSubjectStore.add((0, lifecycle_1.toDisposable)(() => {
                this.contextKeyResultOutdated.reset();
                this.contextKeyTestMessage.reset();
            }));
            this.contextKeyTestMessage.set(subject.contextValue || '');
            if (subject.result instanceof testResult_1.LiveTestResult) {
                this.contextKeyResultOutdated.set(subject.result.getStateById(subject.test.extId)?.retired ?? false);
                this.currentSubjectStore.add(subject.result.onChange(ev => {
                    if (ev.item.item.extId === subject.test.extId) {
                        this.contextKeyResultOutdated.set(ev.item.retired ?? false);
                    }
                }));
            }
            else {
                this.contextKeyResultOutdated.set(true);
            }
            this.currentSubjectStore.add(this.instantiationService
                .createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, this.messageContextKeyService]))
                .createInstance(floatingMenu_1.FloatingClickMenu, {
                container: this.messageContainer,
                menuId: actions_2.MenuId.TestMessageContent,
                getActionArg: () => subject.context,
            }));
        }
        onLayoutBody(height, width) {
            this.dimension = new dom.Dimension(width, height);
            this.splitView.layout(width);
        }
        onWidth(width) {
            this.splitView.layout(width);
        }
    };
    TestResultsViewContent = TestResultsViewContent_1 = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, resolverService_1.ITextModelService),
        __param(4, contextkey_1.IContextKeyService)
    ], TestResultsViewContent);
    let TestResultsPeek = class TestResultsPeek extends peekView_1.PeekViewWidget {
        static { TestResultsPeek_1 = this; }
        constructor(editor, themeService, peekViewService, testingPeek, contextKeyService, menuService, instantiationService, modelService) {
            super(editor, { showFrame: true, frameWidth: 1, showArrow: true, isResizeable: true, isAccessible: true, className: 'test-output-peek' }, instantiationService);
            this.testingPeek = testingPeek;
            this.contextKeyService = contextKeyService;
            this.menuService = menuService;
            this.modelService = modelService;
            this.visibilityChange = this._disposables.add(new event_1.Emitter());
            this._disposables.add(themeService.onDidColorThemeChange(this.applyTheme, this));
            this._disposables.add(this.onDidClose(() => this.visibilityChange.fire(false)));
            this.applyTheme(themeService.getColorTheme());
            peekViewService.addExclusiveWidget(editor, this);
        }
        applyTheme(theme) {
            const borderColor = theme.getColor(theme_2.testingPeekBorder) || color_1.Color.transparent;
            const headerBg = theme.getColor(theme_2.testingPeekHeaderBackground) || color_1.Color.transparent;
            this.style({
                arrowColor: borderColor,
                frameColor: borderColor,
                headerBackgroundColor: headerBg,
                primaryHeadingColor: theme.getColor(peekView_1.peekViewTitleForeground),
                secondaryHeadingColor: theme.getColor(peekView_1.peekViewTitleInfoForeground)
            });
        }
        _fillContainer(container) {
            if (!this.scopedContextKeyService) {
                this.scopedContextKeyService = this._disposables.add(this.contextKeyService.createScoped(container));
                testingContextKeys_1.TestingContextKeys.isInPeek.bindTo(this.scopedContextKeyService).set(true);
                const instaService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, this.scopedContextKeyService]));
                this.content = this._disposables.add(instaService.createInstance(TestResultsViewContent, this.editor, { historyVisible: this.testingPeek.historyVisible, showRevealLocationOnMessages: false }));
            }
            super._fillContainer(container);
        }
        _fillHead(container) {
            super._fillHead(container);
            const actions = [];
            const menu = this.menuService.createMenu(actions_2.MenuId.TestPeekTitle, this.contextKeyService);
            (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(menu, undefined, actions);
            this._actionbarWidget.push(actions, { label: false, icon: true, index: 0 });
            menu.dispose();
        }
        _fillBody(containerElement) {
            this.content.fillBody(containerElement);
            this.content.onDidRequestReveal(sub => {
                TestingOutputPeekController.get(this.editor)?.show(sub instanceof MessageSubject
                    ? sub.messageUri
                    : sub.outputUri);
            });
        }
        /**
         * Updates the test to be shown.
         */
        setModel(subject) {
            if (subject instanceof TaskSubject || subject instanceof TestOutputSubject) {
                this.current = subject;
                return this.showInPlace(subject);
            }
            const message = subject.message;
            const previous = this.current;
            if (!subject.revealLocation && !previous) {
                return Promise.resolve();
            }
            this.current = subject;
            if (!subject.revealLocation) {
                return this.showInPlace(subject);
            }
            this.show(subject.revealLocation.range, TestResultsPeek_1.lastHeightInLines || hintMessagePeekHeight(message));
            this.editor.revealPositionNearTop(subject.revealLocation.range.getStartPosition(), 0 /* ScrollType.Smooth */);
            return this.showInPlace(subject);
        }
        /**
         * Shows a message in-place without showing or changing the peek location.
         * This is mostly used if peeking a message without a location.
         */
        async showInPlace(subject) {
            if (subject instanceof MessageSubject) {
                const message = subject.message;
                this.setTitle(firstLine((0, markdownRenderer_1.renderStringAsPlaintext)(message.message)), (0, iconLabels_2.stripIcons)(subject.test.label));
            }
            else {
                this.setTitle((0, nls_1.localize)('testOutputTitle', 'Test Output'));
            }
            await this.content.reveal({ subject: subject, preserveFocus: false });
        }
        _relayout(newHeightInLines) {
            super._relayout(newHeightInLines);
            TestResultsPeek_1.lastHeightInLines = newHeightInLines;
        }
        /** @override */
        _doLayoutBody(height, width) {
            super._doLayoutBody(height, width);
            this.content.onLayoutBody(height, width);
        }
        /** @override */
        _onWidth(width) {
            super._onWidth(width);
            if (this.dimension) {
                this.dimension = new dom.Dimension(width, this.dimension.height);
            }
            this.content.onWidth(width);
        }
    };
    TestResultsPeek = TestResultsPeek_1 = __decorate([
        __param(1, themeService_1.IThemeService),
        __param(2, peekView_1.IPeekViewService),
        __param(3, testingPeekOpener_1.ITestingPeekOpener),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, actions_2.IMenuService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, resolverService_1.ITextModelService)
    ], TestResultsPeek);
    let TestResultsView = class TestResultsView extends viewPane_1.ViewPane {
        constructor(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, resultService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.resultService = resultService;
            this.content = this._register(this.instantiationService.createInstance(TestResultsViewContent, undefined, {
                historyVisible: (0, observableValue_1.staticObservableValue)(true),
                showRevealLocationOnMessages: true,
            }));
        }
        get subject() {
            return this.content.current;
        }
        showLatestRun(preserveFocus = false) {
            const result = this.resultService.results.find(r => r.tasks.length);
            if (!result) {
                return;
            }
            this.content.reveal({ preserveFocus, subject: new TaskSubject(result, 0) });
        }
        renderBody(container) {
            super.renderBody(container);
            this.content.fillBody(container);
            this.content.onDidRequestReveal(subject => this.content.reveal({ preserveFocus: true, subject }));
            const [lastResult] = this.resultService.results;
            if (lastResult && lastResult.tasks.length) {
                this.content.reveal({ preserveFocus: true, subject: new TaskSubject(lastResult, 0) });
            }
        }
        layoutBody(height, width) {
            super.layoutBody(height, width);
            this.content.onLayoutBody(height, width);
        }
    };
    exports.TestResultsView = TestResultsView;
    exports.TestResultsView = TestResultsView = __decorate([
        __param(1, keybinding_1.IKeybindingService),
        __param(2, contextView_1.IContextMenuService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, views_1.IViewDescriptorService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, opener_1.IOpenerService),
        __param(8, themeService_1.IThemeService),
        __param(9, telemetry_1.ITelemetryService),
        __param(10, testResultService_1.ITestResultService)
    ], TestResultsView);
    const commonEditorOptions = {
        scrollBeyondLastLine: false,
        links: true,
        lineNumbers: 'off',
        scrollbar: {
            verticalScrollbarSize: 14,
            horizontal: 'auto',
            useShadows: true,
            verticalHasArrows: false,
            horizontalHasArrows: false,
            alwaysConsumeMouseWheel: false
        },
        fixedOverflowWidgets: true,
        readOnly: true,
        minimap: {
            enabled: false
        },
        wordWrap: 'on',
    };
    const diffEditorOptions = {
        ...commonEditorOptions,
        enableSplitViewResizing: true,
        isInEmbeddedEditor: true,
        renderOverviewRuler: false,
        ignoreTrimWhitespace: false,
        renderSideBySide: true,
        useInlineViewWhenSpaceIsLimited: false,
        originalAriaLabel: (0, nls_1.localize)('testingOutputExpected', 'Expected result'),
        modifiedAriaLabel: (0, nls_1.localize)('testingOutputActual', 'Actual result'),
        diffAlgorithm: 'advanced',
    };
    const isDiffable = (message) => message.type === 0 /* TestMessageType.Error */ && message.actual !== undefined && message.expected !== undefined;
    let DiffContentProvider = class DiffContentProvider extends lifecycle_1.Disposable {
        constructor(editor, container, instantiationService, modelService) {
            super();
            this.editor = editor;
            this.container = container;
            this.instantiationService = instantiationService;
            this.modelService = modelService;
            this.widget = this._register(new lifecycle_1.MutableDisposable());
            this.model = this._register(new lifecycle_1.MutableDisposable());
        }
        async update(subject) {
            if (!(subject instanceof MessageSubject)) {
                return this.clear();
            }
            const message = subject.message;
            if (!isDiffable(message)) {
                return this.clear();
            }
            const [original, modified] = await Promise.all([
                this.modelService.createModelReference(subject.expectedUri),
                this.modelService.createModelReference(subject.actualUri),
            ]);
            const model = this.model.value = new SimpleDiffEditorModel(original, modified);
            if (!this.widget.value) {
                this.widget.value = this.editor ? this.instantiationService.createInstance(embeddedCodeEditorWidget_1.EmbeddedDiffEditorWidget, this.container, diffEditorOptions, {}, this.editor) : this.instantiationService.createInstance(diffEditorWidget_1.DiffEditorWidget, this.container, diffEditorOptions, {});
                if (this.dimension) {
                    this.widget.value.layout(this.dimension);
                }
            }
            this.widget.value.setModel(model);
            this.widget.value.updateOptions(this.getOptions(isMultiline(message.expected) || isMultiline(message.actual)));
        }
        clear() {
            this.model.clear();
            this.widget.clear();
        }
        layout(dimensions) {
            this.dimension = dimensions;
            this.widget.value?.layout(dimensions);
        }
        getOptions(isMultiline) {
            return isMultiline
                ? { ...diffEditorOptions, lineNumbers: 'on' }
                : { ...diffEditorOptions, lineNumbers: 'off' };
        }
    };
    DiffContentProvider = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, resolverService_1.ITextModelService)
    ], DiffContentProvider);
    class ScrollableMarkdownMessage extends lifecycle_1.Disposable {
        constructor(container, markdown, message) {
            super();
            const rendered = this._register(markdown.render(message, {}));
            rendered.element.style.height = '100%';
            rendered.element.style.userSelect = 'text';
            container.appendChild(rendered.element);
            this.element = rendered.element;
            this.scrollable = this._register(new scrollableElement_1.DomScrollableElement(rendered.element, {
                className: 'preview-text',
            }));
            container.appendChild(this.scrollable.getDomNode());
            this._register((0, lifecycle_1.toDisposable)(() => {
                container.removeChild(this.scrollable.getDomNode());
            }));
            this.scrollable.scanDomNode();
        }
        layout(height, width) {
            // Remove padding of `.monaco-editor .zone-widget.test-output-peek .preview-text`
            this.scrollable.setScrollDimensions({
                width: width - 32,
                height: height - 16,
                scrollWidth: this.element.scrollWidth,
                scrollHeight: this.element.scrollHeight
            });
        }
    }
    let MarkdownTestMessagePeek = class MarkdownTestMessagePeek extends lifecycle_1.Disposable {
        constructor(container, instantiationService) {
            super();
            this.container = container;
            this.instantiationService = instantiationService;
            this.markdown = new lazy_1.Lazy(() => this._register(this.instantiationService.createInstance(markdownRenderer_2.MarkdownRenderer, {})));
            this.textPreview = this._register(new lifecycle_1.MutableDisposable());
        }
        update(subject) {
            if (!(subject instanceof MessageSubject)) {
                return this.textPreview.clear();
            }
            const message = subject.message;
            if (isDiffable(message) || typeof message.message === 'string') {
                return this.textPreview.clear();
            }
            this.textPreview.value = new ScrollableMarkdownMessage(this.container, this.markdown.value, message.message);
        }
        layout(dimension) {
            this.textPreview.value?.layout(dimension.height, dimension.width);
        }
    };
    MarkdownTestMessagePeek = __decorate([
        __param(1, instantiation_1.IInstantiationService)
    ], MarkdownTestMessagePeek);
    let PlainTextMessagePeek = class PlainTextMessagePeek extends lifecycle_1.Disposable {
        constructor(editor, container, instantiationService, modelService) {
            super();
            this.editor = editor;
            this.container = container;
            this.instantiationService = instantiationService;
            this.modelService = modelService;
            this.widget = this._register(new lifecycle_1.MutableDisposable());
            this.model = this._register(new lifecycle_1.MutableDisposable());
        }
        async update(subject) {
            if (!(subject instanceof MessageSubject)) {
                return this.clear();
            }
            const message = subject.message;
            if (isDiffable(message) || message.type === 1 /* TestMessageType.Output */ || typeof message.message !== 'string') {
                return this.clear();
            }
            const modelRef = this.model.value = await this.modelService.createModelReference(subject.messageUri);
            if (!this.widget.value) {
                this.widget.value = this.editor ? this.instantiationService.createInstance(embeddedCodeEditorWidget_1.EmbeddedCodeEditorWidget, this.container, commonEditorOptions, {}, this.editor) : this.instantiationService.createInstance(codeEditorWidget_1.CodeEditorWidget, this.container, commonEditorOptions, { isSimpleWidget: true });
                if (this.dimension) {
                    this.widget.value.layout(this.dimension);
                }
            }
            this.widget.value.setModel(modelRef.object.textEditorModel);
            this.widget.value.updateOptions(commonEditorOptions);
        }
        clear() {
            this.model.clear();
            this.widget.clear();
        }
        layout(dimensions) {
            this.dimension = dimensions;
            this.widget.value?.layout(dimensions);
        }
    };
    PlainTextMessagePeek = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, resolverService_1.ITextModelService)
    ], PlainTextMessagePeek);
    let TerminalMessagePeek = class TerminalMessagePeek extends lifecycle_1.Disposable {
        constructor(container, isInPeekView, terminalService, viewDescriptorService, workspaceContext) {
            super();
            this.container = container;
            this.isInPeekView = isInPeekView;
            this.terminalService = terminalService;
            this.viewDescriptorService = viewDescriptorService;
            this.workspaceContext = workspaceContext;
            this.terminalCwd = this._register(new observableValue_1.MutableObservableValue(''));
            this.xtermLayoutDelayer = this._register(new async_1.Delayer(50));
            /** Active terminal instance. */
            this.terminal = this._register(new lifecycle_1.MutableDisposable());
            /** Listener for streaming result data */
            this.outputDataListener = this._register(new lifecycle_1.MutableDisposable());
        }
        async makeTerminal() {
            const prev = this.terminal.value;
            if (prev) {
                prev.xterm.clearBuffer();
                prev.xterm.clearSearchDecorations();
                // clearBuffer tries to retain the prompt line, but this doesn't exist for tests.
                // So clear the screen (J) and move to home (H) to ensure previous data is cleaned up.
                prev.xterm.write(`\x1b[2J\x1b[0;0H`);
                return prev;
            }
            const capabilities = new terminalCapabilityStore_1.TerminalCapabilityStore();
            const cwd = this.terminalCwd;
            capabilities.add(0 /* TerminalCapability.CwdDetection */, {
                type: 0 /* TerminalCapability.CwdDetection */,
                get cwds() { return [cwd.value]; },
                onDidChangeCwd: cwd.onDidChange,
                getCwd: () => cwd.value,
                updateCwd: () => { },
            });
            return this.terminal.value = await this.terminalService.createDetachedTerminal({
                rows: 10,
                cols: 80,
                readonly: true,
                capabilities,
                processInfo: new detachedTerminal_1.DetachedProcessInfo({ initialCwd: cwd.value }),
                colorProvider: {
                    getBackgroundColor: theme => {
                        const terminalBackground = theme.getColor(terminalColorRegistry_1.TERMINAL_BACKGROUND_COLOR);
                        if (terminalBackground) {
                            return terminalBackground;
                        }
                        if (this.isInPeekView) {
                            return theme.getColor(peekView_1.peekViewResultsBackground);
                        }
                        const location = this.viewDescriptorService.getViewLocationById("workbench.panel.testResults.view" /* Testing.ResultsViewId */);
                        return location === 1 /* ViewContainerLocation.Panel */
                            ? theme.getColor(theme_1.PANEL_BACKGROUND)
                            : theme.getColor(theme_1.SIDE_BAR_BACKGROUND);
                    },
                }
            });
        }
        async update(subject) {
            this.outputDataListener.clear();
            if (subject instanceof TaskSubject) {
                await this.updateForTaskSubject(subject);
            }
            else if (subject instanceof TestOutputSubject || (subject instanceof MessageSubject && subject.message.type === 1 /* TestMessageType.Output */)) {
                await this.updateForTestSubject(subject);
            }
            else {
                this.clear();
            }
        }
        async updateForTestSubject(subject) {
            const that = this;
            const testItem = subject instanceof TestOutputSubject ? subject.test.item : subject.test;
            const terminal = await this.updateGenerically({
                subject,
                getTarget: result => result?.tasks[subject.taskIndex].output,
                *doInitialWrite(output, results) {
                    that.updateCwd(testItem.uri);
                    const state = subject instanceof TestOutputSubject ? subject.test : results.getStateById(testItem.extId);
                    if (!state) {
                        return;
                    }
                    for (const message of state.tasks[subject.taskIndex].messages) {
                        if (message.type === 1 /* TestMessageType.Output */) {
                            yield* output.getRangeIter(message.offset, message.length);
                        }
                    }
                },
                doListenForMoreData: (output, result, { xterm }) => result.onChange(e => {
                    if (e.reason === 2 /* TestResultItemChangeReason.NewMessage */ && e.item.item.extId === testItem.extId && e.message.type === 1 /* TestMessageType.Output */) {
                        for (const chunk of output.getRangeIter(e.message.offset, e.message.length)) {
                            xterm.write(chunk.buffer);
                        }
                    }
                }),
            });
            if (subject instanceof MessageSubject && subject.message.type === 1 /* TestMessageType.Output */ && subject.message.marker !== undefined) {
                terminal?.xterm.selectMarkedRange((0, testTypes_1.getMarkId)(subject.message.marker, true), (0, testTypes_1.getMarkId)(subject.message.marker, false), /* scrollIntoView= */ true);
            }
        }
        updateForTaskSubject(subject) {
            return this.updateGenerically({
                subject,
                getTarget: result => result?.tasks[subject.taskIndex],
                doInitialWrite: (task, result) => {
                    // Update the cwd and use the first test to try to hint at the correct cwd,
                    // but often this will fall back to the first workspace folder.
                    this.updateCwd(iterator_1.Iterable.find(result.tests, t => !!t.item.uri)?.item.uri);
                    return task.output.buffers;
                },
                doListenForMoreData: (task, _result, { xterm }) => task.output.onDidWriteData(e => xterm.write(e.buffer)),
            });
        }
        async updateGenerically(opts) {
            const result = opts.subject.result;
            const target = opts.getTarget(result);
            if (!target) {
                return this.clear();
            }
            const terminal = await this.makeTerminal();
            let didWriteData = false;
            const pendingWrites = new observableValue_1.MutableObservableValue(0);
            if (result instanceof testResult_1.LiveTestResult) {
                for (const chunk of opts.doInitialWrite(target, result)) {
                    didWriteData ||= chunk.byteLength > 0;
                    pendingWrites.value++;
                    terminal.xterm.write(chunk.buffer, () => pendingWrites.value--);
                }
            }
            else {
                didWriteData = true;
                this.writeNotice(terminal, (0, nls_1.localize)('runNoOutputForPast', 'Test output is only available for new test runs.'));
            }
            this.attachTerminalToDom(terminal);
            this.outputDataListener.value = result instanceof testResult_1.LiveTestResult ? opts.doListenForMoreData(target, result, terminal) : undefined;
            if (!this.outputDataListener.value && !didWriteData) {
                this.writeNotice(terminal, (0, nls_1.localize)('runNoOutput', 'The test run did not record any output.'));
            }
            // Ensure pending writes finish, otherwise the selection in `updateForTestSubject`
            // can happen before the markers are processed.
            if (pendingWrites.value > 0) {
                await new Promise(resolve => {
                    const l = pendingWrites.onDidChange(() => {
                        if (pendingWrites.value === 0) {
                            l.dispose();
                            resolve();
                        }
                    });
                });
            }
            return terminal;
        }
        updateCwd(testUri) {
            const wf = (testUri && this.workspaceContext.getWorkspaceFolder(testUri))
                || this.workspaceContext.getWorkspace().folders[0];
            if (wf) {
                this.terminalCwd.value = wf.uri.fsPath;
            }
        }
        writeNotice(terminal, str) {
            terminal.xterm.write((0, terminalStrings_1.formatMessageForTerminal)(str));
        }
        attachTerminalToDom(terminal) {
            terminal.xterm.write('\x1b[?25l'); // hide cursor
            requestAnimationFrame(() => this.layoutTerminal(terminal));
            terminal.attachToElement(this.container, { enableGpu: false });
        }
        clear() {
            this.outputDataListener.clear();
            this.xtermLayoutDelayer.cancel();
            this.terminal.clear();
        }
        layout(dimensions) {
            this.dimensions = dimensions;
            if (this.terminal.value) {
                this.layoutTerminal(this.terminal.value, dimensions.width, dimensions.height);
            }
        }
        layoutTerminal({ xterm }, width = this.dimensions?.width ?? this.container.clientWidth, height = this.dimensions?.height ?? this.container.clientHeight) {
            width -= 10 + 20; // scrollbar width + margin
            this.xtermLayoutDelayer.trigger(() => {
                const scaled = (0, xtermTerminal_1.getXtermScaledDimensions)(xterm.getFont(), width, height);
                if (scaled) {
                    xterm.resize(scaled.cols, scaled.rows);
                }
            });
        }
    };
    TerminalMessagePeek = __decorate([
        __param(2, terminal_1.ITerminalService),
        __param(3, views_1.IViewDescriptorService),
        __param(4, workspace_1.IWorkspaceContextService)
    ], TerminalMessagePeek);
    const hintMessagePeekHeight = (msg) => {
        const msgHeight = isDiffable(msg)
            ? Math.max(hintPeekStrHeight(msg.actual), hintPeekStrHeight(msg.expected))
            : hintPeekStrHeight(typeof msg.message === 'string' ? msg.message : msg.message.value);
        // add 8ish lines for the size of the title and decorations in the peek.
        return msgHeight + 8;
    };
    const firstLine = (str) => {
        const index = str.indexOf('\n');
        return index === -1 ? str : str.slice(0, index);
    };
    const isMultiline = (str) => !!str && str.includes('\n');
    const hintPeekStrHeight = (str) => Math.min((0, strings_1.count)(str, '\n'), 24);
    class SimpleDiffEditorModel extends editorModel_1.EditorModel {
        constructor(_original, _modified) {
            super();
            this._original = _original;
            this._modified = _modified;
            this.original = this._original.object.textEditorModel;
            this.modified = this._modified.object.textEditorModel;
        }
        dispose() {
            super.dispose();
            this._original.dispose();
            this._modified.dispose();
        }
    }
    function getOuterEditorFromDiffEditor(codeEditorService) {
        const diffEditors = codeEditorService.listDiffEditors();
        for (const diffEditor of diffEditors) {
            if (diffEditor.hasTextFocus() && diffEditor instanceof embeddedCodeEditorWidget_1.EmbeddedDiffEditorWidget) {
                return diffEditor.getParentEditor();
            }
        }
        return null;
    }
    class CloseTestPeek extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'editor.closeTestPeek',
                title: (0, nls_1.localize)('close', 'Close'),
                icon: codicons_1.Codicon.close,
                precondition: contextkey_1.ContextKeyExpr.or(testingContextKeys_1.TestingContextKeys.isInPeek, testingContextKeys_1.TestingContextKeys.isPeekVisible),
                keybinding: {
                    weight: 100 /* KeybindingWeight.EditorContrib */ - 101,
                    primary: 9 /* KeyCode.Escape */,
                    when: contextkey_1.ContextKeyExpr.not('config.editor.stablePeek')
                }
            });
        }
        runEditorCommand(accessor, editor) {
            const parent = getPeekedEditorFromFocus(accessor.get(codeEditorService_1.ICodeEditorService));
            TestingOutputPeekController.get(parent ?? editor)?.removePeek();
        }
    }
    exports.CloseTestPeek = CloseTestPeek;
    class TestResultElement {
        get icon() {
            return icons.testingStatesToIcons.get(this.value.completedAt === undefined
                ? 2 /* TestResultState.Running */
                : (0, testResult_1.maxCountPriority)(this.value.counts));
        }
        constructor(value) {
            this.value = value;
            this.changeEmitter = new event_1.Emitter();
            this.onDidChange = this.changeEmitter.event;
            this.type = 'result';
            this.context = this.value.id;
            this.id = this.value.id;
            this.label = this.value.name;
        }
    }
    class TestCaseElement {
        get onDidChange() {
            if (!(this.results instanceof testResult_1.LiveTestResult)) {
                return event_1.Event.None;
            }
            return event_1.Event.filter(this.results.onChange, e => e.item.item.extId === this.test.item.extId);
        }
        get state() {
            return this.test.tasks[this.taskIndex].state;
        }
        get label() {
            return this.test.item.label;
        }
        get labelWithIcons() {
            return (0, iconLabels_1.renderLabelWithIcons)(this.label);
        }
        get icon() {
            return icons.testingStatesToIcons.get(this.state);
        }
        get outputSubject() {
            return new TestOutputSubject(this.results, this.taskIndex, this.task, this.test);
        }
        constructor(results, task, test, taskIndex) {
            this.results = results;
            this.task = task;
            this.test = test;
            this.taskIndex = taskIndex;
            this.type = 'test';
            this.context = this.test.item.extId;
            this.id = `${this.results.id}/${this.test.item.extId}`;
        }
    }
    class TaskElement {
        get icon() {
            return this.results.tasks[this.index].running ? icons.testingStatesToIcons.get(2 /* TestResultState.Running */) : undefined;
        }
        constructor(results, task, index) {
            this.results = results;
            this.task = task;
            this.index = index;
            this.changeEmitter = new event_1.Emitter();
            this.onDidChange = this.changeEmitter.event;
            this.type = 'task';
            this.itemsCache = new CreationCache();
            this.id = `${results.id}/${index}`;
            this.task = results.tasks[index];
            this.context = String(index);
            this.label = this.task.name ?? (0, nls_1.localize)('testUnnamedTask', 'Unnamed Task');
        }
    }
    class TestMessageElement {
        get onDidChange() {
            if (!(this.result instanceof testResult_1.LiveTestResult)) {
                return event_1.Event.None;
            }
            // rerender when the test case changes so it gets retired events
            return event_1.Event.filter(this.result.onChange, e => e.item.item.extId === this.test.item.extId);
        }
        get context() {
            return {
                $mid: 18 /* MarshalledId.TestMessageMenuArgs */,
                extId: this.test.item.extId,
                message: testTypes_1.ITestMessage.serialize(this.message),
            };
        }
        constructor(result, test, taskIndex, messageIndex) {
            this.result = result;
            this.test = test;
            this.taskIndex = taskIndex;
            this.messageIndex = messageIndex;
            this.type = 'message';
            const m = this.message = test.tasks[taskIndex].messages[messageIndex];
            this.location = m.location;
            this.contextValue = m.type === 0 /* TestMessageType.Error */ ? m.contextValue : undefined;
            this.uri = (0, testingUri_1.buildTestUri)({
                type: 2 /* TestUriType.ResultMessage */,
                messageIndex,
                resultId: result.id,
                taskIndex,
                testExtId: test.item.extId
            });
            this.id = this.uri.toString();
            const asPlaintext = (0, markdownRenderer_1.renderStringAsPlaintext)(m.message);
            const lines = (0, strings_1.count)(asPlaintext.trimEnd(), '\n');
            this.label = firstLine(asPlaintext);
            if (lines > 0) {
                this.description = lines > 1
                    ? (0, nls_1.localize)('messageMoreLinesN', '+ {0} more lines', lines)
                    : (0, nls_1.localize)('messageMoreLines1', '+ 1 more line');
            }
        }
    }
    let OutputPeekTree = class OutputPeekTree extends lifecycle_1.Disposable {
        constructor(container, onDidReveal, options, contextMenuService, results, instantiationService, explorerFilter) {
            super();
            this.contextMenuService = contextMenuService;
            this.disposed = false;
            this.requestReveal = this._register(new event_1.Emitter());
            this.onDidRequestReview = this.requestReveal.event;
            this.treeActions = instantiationService.createInstance(TreeActionsProvider, options.showRevealLocationOnMessages, this.requestReveal);
            const diffIdentityProvider = {
                getId(e) {
                    return e.id;
                }
            };
            this.tree = this._register(instantiationService.createInstance(listService_1.WorkbenchCompressibleObjectTree, 'Test Output Peek', container, {
                getHeight: () => 22,
                getTemplateId: () => TestRunElementRenderer.ID,
            }, [instantiationService.createInstance(TestRunElementRenderer, this.treeActions)], {
                compressionEnabled: true,
                hideTwistiesOfChildlessElements: true,
                identityProvider: diffIdentityProvider,
                sorter: {
                    compare(a, b) {
                        if (a instanceof TestCaseElement && b instanceof TestCaseElement) {
                            return (0, testingStates_1.cmpPriority)(a.state, b.state);
                        }
                        return 0;
                    },
                },
                accessibilityProvider: {
                    getAriaLabel(element) {
                        return element.ariaLabel || element.label;
                    },
                    getWidgetAriaLabel() {
                        return (0, nls_1.localize)('testingPeekLabel', 'Test Result Messages');
                    }
                }
            }));
            const cc = new CreationCache();
            const getTaskChildren = (taskElem) => {
                const tests = iterator_1.Iterable.filter(taskElem.results.tests, test => test.tasks[taskElem.index].state >= 2 /* TestResultState.Running */ || test.tasks[taskElem.index].messages.length > 0);
                return iterator_1.Iterable.map(tests, test => ({
                    element: taskElem.itemsCache.getOrCreate(test, () => new TestCaseElement(taskElem.results, taskElem.task, test, taskElem.index)),
                    incompressible: true,
                    children: getTestChildren(taskElem.results, test, taskElem.index),
                }));
            };
            const getTestChildren = (result, test, taskIndex) => {
                return test.tasks[taskIndex].messages
                    .map((m, messageIndex) => m.type === 0 /* TestMessageType.Error */
                    ? { element: cc.getOrCreate(m, () => new TestMessageElement(result, test, taskIndex, messageIndex)), incompressible: false }
                    : undefined)
                    .filter(types_1.isDefined);
            };
            const getResultChildren = (result) => {
                return result.tasks.map((task, taskIndex) => {
                    const taskElem = cc.getOrCreate(task, () => new TaskElement(result, task, taskIndex));
                    return ({
                        element: taskElem,
                        incompressible: false,
                        children: getTaskChildren(taskElem),
                    });
                });
            };
            const getRootChildren = () => results.results.map(result => {
                const element = cc.getOrCreate(result, () => new TestResultElement(result));
                return {
                    element,
                    incompressible: true,
                    collapsed: this.tree.hasElement(element) ? this.tree.isCollapsed(element) : true,
                    children: getResultChildren(result)
                };
            });
            // Queued result updates to prevent spamming CPU when lots of tests are
            // completing and messaging quickly (#142514)
            const taskChildrenToUpdate = new Set();
            const taskChildrenUpdate = this._register(new async_1.RunOnceScheduler(() => {
                for (const taskNode of taskChildrenToUpdate) {
                    if (this.tree.hasElement(taskNode)) {
                        this.tree.setChildren(taskNode, getTaskChildren(taskNode), { diffIdentityProvider });
                    }
                }
                taskChildrenToUpdate.clear();
            }, 300));
            const attachToResults = (result) => {
                const resultNode = cc.get(result);
                const disposable = new lifecycle_1.DisposableStore();
                disposable.add(result.onNewTask(() => {
                    if (result.tasks.length === 1) {
                        this.requestReveal.fire(new TaskSubject(result, 0)); // reveal the first task in new runs
                    }
                    if (this.tree.hasElement(resultNode)) {
                        this.tree.setChildren(resultNode, getResultChildren(result), { diffIdentityProvider });
                    }
                }));
                disposable.add(result.onEndTask(index => {
                    cc.get(result.tasks[index])?.changeEmitter.fire();
                }));
                disposable.add(result.onChange(e => {
                    // try updating the item in each of its tasks
                    for (const [index, task] of result.tasks.entries()) {
                        const taskNode = cc.get(task);
                        if (!this.tree.hasElement(taskNode)) {
                            continue;
                        }
                        const itemNode = taskNode.itemsCache.get(e.item);
                        if (itemNode && this.tree.hasElement(itemNode)) {
                            if (e.reason === 2 /* TestResultItemChangeReason.NewMessage */ && e.message.type === 0 /* TestMessageType.Error */) {
                                this.tree.setChildren(itemNode, getTestChildren(result, e.item, index), { diffIdentityProvider });
                            }
                            return;
                        }
                        taskChildrenToUpdate.add(taskNode);
                        if (!taskChildrenUpdate.isScheduled()) {
                            taskChildrenUpdate.schedule();
                        }
                    }
                }));
                disposable.add(result.onComplete(() => {
                    resultNode.changeEmitter.fire();
                    disposable.dispose();
                }));
                return resultNode;
            };
            this._register(results.onResultsChanged(e => {
                // little hack here: a result change can cause the peek to be disposed,
                // but this listener will still be queued. Doing stuff with the tree
                // will cause errors.
                if (this.disposed) {
                    return;
                }
                if ('completed' in e) {
                    cc.get(e.completed)?.changeEmitter.fire();
                    return;
                }
                this.tree.setChildren(null, getRootChildren(), { diffIdentityProvider });
                // done after setChildren intentionally so that the ResultElement exists in the cache.
                if ('started' in e) {
                    for (const child of this.tree.getNode(null).children) {
                        this.tree.collapse(child.element, false);
                    }
                    this.tree.expand(attachToResults(e.started), true);
                }
            }));
            const revealItem = (element, preserveFocus) => {
                this.tree.setFocus([element]);
                this.tree.setSelection([element]);
                if (!preserveFocus) {
                    this.tree.domFocus();
                }
            };
            this._register(onDidReveal(async ({ subject, preserveFocus = false }) => {
                if (subject instanceof TaskSubject) {
                    const resultItem = this.tree.getNode(null).children.find(c => {
                        if (c.element instanceof TaskElement) {
                            return c.element.results.id === subject.result.id && c.element.index === subject.taskIndex;
                        }
                        if (c.element instanceof TestResultElement) {
                            return c.element.id === subject.result.id;
                        }
                        return false;
                    });
                    if (resultItem) {
                        revealItem(resultItem.element, preserveFocus);
                    }
                    return;
                }
                const revealElement = subject instanceof TestOutputSubject
                    ? cc.get(subject.task)?.itemsCache.get(subject.test)
                    : cc.get(subject.message);
                if (!revealElement || !this.tree.hasElement(revealElement)) {
                    return;
                }
                const parents = [];
                for (let parent = this.tree.getParentElement(revealElement); parent; parent = this.tree.getParentElement(parent)) {
                    parents.unshift(parent);
                }
                for (const parent of parents) {
                    this.tree.expand(parent);
                }
                if (this.tree.getRelativeTop(revealElement) === null) {
                    this.tree.reveal(revealElement, 0.5);
                }
                revealItem(revealElement, preserveFocus);
            }));
            this._register(this.tree.onDidOpen(async (e) => {
                if (e.element instanceof TestMessageElement) {
                    this.requestReveal.fire(new MessageSubject(e.element.result, e.element.test, e.element.taskIndex, e.element.messageIndex));
                }
            }));
            this._register(this.tree.onDidChangeSelection(evt => {
                for (const element of evt.elements) {
                    if (element && 'test' in element) {
                        explorerFilter.reveal.value = element.test.item.extId;
                        break;
                    }
                }
            }));
            this._register(this.tree.onContextMenu(e => this.onContextMenu(e)));
            this.tree.setChildren(null, getRootChildren());
            for (const result of results.results) {
                if (!result.completedAt && result instanceof testResult_1.LiveTestResult) {
                    attachToResults(result);
                }
            }
        }
        layout(height, width) {
            this.tree.layout(height, width);
        }
        onContextMenu(evt) {
            if (!evt.element) {
                return;
            }
            const actions = this.treeActions.provideActionBar(evt.element);
            this.contextMenuService.showContextMenu({
                getAnchor: () => evt.anchor,
                getActions: () => actions.secondary.length
                    ? [...actions.primary, new actions_1.Separator(), ...actions.secondary]
                    : actions.primary,
                getActionsContext: () => evt.element?.context
            });
        }
        dispose() {
            super.dispose();
            this.disposed = true;
        }
    };
    OutputPeekTree = __decorate([
        __param(3, contextView_1.IContextMenuService),
        __param(4, testResultService_1.ITestResultService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, testExplorerFilterState_1.ITestExplorerFilterState)
    ], OutputPeekTree);
    let TestRunElementRenderer = class TestRunElementRenderer {
        static { TestRunElementRenderer_1 = this; }
        static { this.ID = 'testRunElementRenderer'; }
        constructor(treeActions, instantiationService) {
            this.treeActions = treeActions;
            this.instantiationService = instantiationService;
            this.templateId = TestRunElementRenderer_1.ID;
        }
        /** @inheritdoc */
        renderCompressedElements(node, _index, templateData) {
            const chain = node.element.elements;
            const lastElement = chain[chain.length - 1];
            if ((lastElement instanceof TaskElement || lastElement instanceof TestMessageElement) && chain.length >= 2) {
                this.doRender(chain[chain.length - 2], templateData, lastElement);
            }
            else {
                this.doRender(lastElement, templateData);
            }
        }
        /** @inheritdoc */
        renderTemplate(container) {
            const templateDisposable = new lifecycle_1.DisposableStore();
            const wrapper = dom.append(container, dom.$('.test-peek-item'));
            const icon = dom.append(wrapper, dom.$('.state'));
            const label = dom.append(wrapper, dom.$('.name'));
            const actionBar = new actionbar_1.ActionBar(wrapper, {
                actionViewItemProvider: action => action instanceof actions_2.MenuItemAction
                    ? this.instantiationService.createInstance(menuEntryActionViewItem_1.MenuEntryActionViewItem, action, undefined)
                    : undefined
            });
            const elementDisposable = new lifecycle_1.DisposableStore();
            templateDisposable.add(elementDisposable);
            templateDisposable.add(actionBar);
            return {
                icon,
                label,
                actionBar,
                elementDisposable,
                templateDisposable,
            };
        }
        /** @inheritdoc */
        renderElement(element, _index, templateData) {
            this.doRender(element.element, templateData);
        }
        /** @inheritdoc */
        disposeTemplate(templateData) {
            templateData.templateDisposable.dispose();
        }
        /** Called to render a new element */
        doRender(element, templateData, subjectElement) {
            templateData.elementDisposable.clear();
            templateData.elementDisposable.add(element.onDidChange(() => this.doRender(element, templateData, subjectElement)));
            this.doRenderInner(element, templateData, subjectElement);
        }
        /** Called, and may be re-called, to render or re-render an element */
        doRenderInner(element, templateData, subjectElement) {
            let { label, labelWithIcons, description } = element;
            if (subjectElement instanceof TestMessageElement) {
                description = subjectElement.label;
            }
            const descriptionElement = description ? dom.$('span.test-label-description', {}, description) : '';
            if (labelWithIcons) {
                dom.reset(templateData.label, ...labelWithIcons, descriptionElement);
            }
            else {
                dom.reset(templateData.label, label, descriptionElement);
            }
            const icon = element.icon;
            templateData.icon.className = `computed-state ${icon ? themables_1.ThemeIcon.asClassName(icon) : ''}`;
            const actions = this.treeActions.provideActionBar(element);
            templateData.actionBar.clear();
            templateData.actionBar.context = element.context;
            templateData.actionBar.push(actions.primary, { icon: true, label: false });
        }
    };
    TestRunElementRenderer = TestRunElementRenderer_1 = __decorate([
        __param(1, instantiation_1.IInstantiationService)
    ], TestRunElementRenderer);
    let TreeActionsProvider = class TreeActionsProvider {
        constructor(showRevealLocationOnMessages, requestReveal, contextKeyService, menuService, commandService, testProfileService, editorService) {
            this.showRevealLocationOnMessages = showRevealLocationOnMessages;
            this.requestReveal = requestReveal;
            this.contextKeyService = contextKeyService;
            this.menuService = menuService;
            this.commandService = commandService;
            this.testProfileService = testProfileService;
            this.editorService = editorService;
        }
        provideActionBar(element) {
            const test = element instanceof TestCaseElement ? element.test : undefined;
            const capabilities = test ? this.testProfileService.capabilitiesForTest(test) : 0;
            const contextKeys = [
                ['peek', "editor.contrib.testingOutputPeek" /* Testing.OutputPeekContributionId */],
                [testingContextKeys_1.TestingContextKeys.peekItemType.key, element.type],
            ];
            let id = actions_2.MenuId.TestPeekElement;
            const primary = [];
            const secondary = [];
            if (element instanceof TaskElement) {
                primary.push(new actions_1.Action('testing.outputPeek.showResultOutput', (0, nls_1.localize)('testing.showResultOutput', "Show Result Output"), themables_1.ThemeIcon.asClassName(codicons_1.Codicon.terminal), undefined, () => this.requestReveal.fire(new TaskSubject(element.results, element.index))));
            }
            if (element instanceof TestResultElement) {
                // only show if there are no collapsed test nodes that have more specific choices
                if (element.value.tasks.length === 1) {
                    primary.push(new actions_1.Action('testing.outputPeek.showResultOutput', (0, nls_1.localize)('testing.showResultOutput', "Show Result Output"), themables_1.ThemeIcon.asClassName(codicons_1.Codicon.terminal), undefined, () => this.requestReveal.fire(new TaskSubject(element.value, 0))));
                }
                primary.push(new actions_1.Action('testing.outputPeek.reRunLastRun', (0, nls_1.localize)('testing.reRunLastRun', "Rerun Test Run"), themables_1.ThemeIcon.asClassName(icons.testingRunIcon), undefined, () => this.commandService.executeCommand('testing.reRunLastRun', element.value.id)));
                if (capabilities & 4 /* TestRunProfileBitset.Debug */) {
                    primary.push(new actions_1.Action('testing.outputPeek.debugLastRun', (0, nls_1.localize)('testing.debugLastRun', "Debug Test Run"), themables_1.ThemeIcon.asClassName(icons.testingDebugIcon), undefined, () => this.commandService.executeCommand('testing.debugLastRun', element.value.id)));
                }
            }
            if (element instanceof TestCaseElement || element instanceof TestMessageElement) {
                contextKeys.push([testingContextKeys_1.TestingContextKeys.testResultOutdated.key, element.test.retired], ...(0, testItemContextOverlay_1.getTestItemContextOverlay)(element.test, capabilities));
            }
            if (element instanceof TestCaseElement) {
                const extId = element.test.item.extId;
                if (element.test.tasks[element.taskIndex].messages.some(m => m.type === 1 /* TestMessageType.Output */)) {
                    primary.push(new actions_1.Action('testing.outputPeek.showResultOutput', (0, nls_1.localize)('testing.showResultOutput', "Show Result Output"), themables_1.ThemeIcon.asClassName(codicons_1.Codicon.terminal), undefined, () => this.requestReveal.fire(element.outputSubject)));
                }
                secondary.push(new actions_1.Action('testing.outputPeek.revealInExplorer', (0, nls_1.localize)('testing.revealInExplorer', "Reveal in Test Explorer"), themables_1.ThemeIcon.asClassName(codicons_1.Codicon.listTree), undefined, () => this.commandService.executeCommand('_revealTestInExplorer', extId)));
                if (capabilities & 2 /* TestRunProfileBitset.Run */) {
                    primary.push(new actions_1.Action('testing.outputPeek.runTest', (0, nls_1.localize)('run test', 'Run Test'), themables_1.ThemeIcon.asClassName(icons.testingRunIcon), undefined, () => this.commandService.executeCommand('vscode.runTestsById', 2 /* TestRunProfileBitset.Run */, extId)));
                }
                if (capabilities & 4 /* TestRunProfileBitset.Debug */) {
                    primary.push(new actions_1.Action('testing.outputPeek.debugTest', (0, nls_1.localize)('debug test', 'Debug Test'), themables_1.ThemeIcon.asClassName(icons.testingDebugIcon), undefined, () => this.commandService.executeCommand('vscode.runTestsById', 4 /* TestRunProfileBitset.Debug */, extId)));
                }
                primary.push(new actions_1.Action('testing.outputPeek.goToFile', (0, nls_1.localize)('testing.goToFile', "Go to Source"), themables_1.ThemeIcon.asClassName(codicons_1.Codicon.goToFile), undefined, () => this.commandService.executeCommand('vscode.revealTest', extId)));
            }
            if (element instanceof TestMessageElement) {
                id = actions_2.MenuId.TestMessageContext;
                contextKeys.push([testingContextKeys_1.TestingContextKeys.testMessageContext.key, element.contextValue]);
                if (this.showRevealLocationOnMessages && element.location) {
                    primary.push(new actions_1.Action('testing.outputPeek.goToError', (0, nls_1.localize)('testing.goToError', "Go to Source"), themables_1.ThemeIcon.asClassName(codicons_1.Codicon.goToFile), undefined, () => this.editorService.openEditor({
                        resource: element.location.uri,
                        options: {
                            selection: element.location.range,
                            preserveFocus: true,
                        }
                    })));
                }
            }
            const contextOverlay = this.contextKeyService.createOverlay(contextKeys);
            const result = { primary, secondary };
            const menu = this.menuService.createMenu(id, contextOverlay);
            try {
                (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(menu, { arg: element.context }, result, 'inline');
                return result;
            }
            finally {
                menu.dispose();
            }
        }
    };
    TreeActionsProvider = __decorate([
        __param(2, contextkey_1.IContextKeyService),
        __param(3, actions_2.IMenuService),
        __param(4, commands_1.ICommandService),
        __param(5, testProfileService_1.ITestProfileService),
        __param(6, editorService_1.IEditorService)
    ], TreeActionsProvider);
    const navWhen = contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.focus, testingContextKeys_1.TestingContextKeys.isPeekVisible);
    /**
     * Gets the appropriate editor for peeking based on the currently focused editor.
     */
    const getPeekedEditorFromFocus = (codeEditorService) => {
        const editor = codeEditorService.getFocusedCodeEditor() || codeEditorService.getActiveCodeEditor();
        return editor && getPeekedEditor(codeEditorService, editor);
    };
    /**
     * Gets the editor where the peek may be shown, bubbling upwards if the given
     * editor is embedded (i.e. inside a peek already).
     */
    const getPeekedEditor = (codeEditorService, editor) => {
        if (TestingOutputPeekController.get(editor)?.subject) {
            return editor;
        }
        if (editor instanceof embeddedCodeEditorWidget_1.EmbeddedCodeEditorWidget) {
            return editor.getParentEditor();
        }
        const outer = getOuterEditorFromDiffEditor(codeEditorService);
        if (outer) {
            return outer;
        }
        return editor;
    };
    class GoToNextMessageAction extends actions_2.Action2 {
        static { this.ID = 'testing.goToNextMessage'; }
        constructor() {
            super({
                id: GoToNextMessageAction.ID,
                f1: true,
                title: { value: (0, nls_1.localize)('testing.goToNextMessage', "Go to Next Test Failure"), original: 'Go to Next Test Failure' },
                icon: codicons_1.Codicon.arrowDown,
                category: actionCommonCategories_1.Categories.Test,
                keybinding: {
                    primary: 512 /* KeyMod.Alt */ | 66 /* KeyCode.F8 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */ + 1,
                    when: navWhen,
                },
                menu: [{
                        id: actions_2.MenuId.TestPeekTitle,
                        group: 'navigation',
                        order: 2,
                    }, {
                        id: actions_2.MenuId.CommandPalette,
                        when: navWhen
                    }],
            });
        }
        run(accessor) {
            const editor = getPeekedEditorFromFocus(accessor.get(codeEditorService_1.ICodeEditorService));
            if (editor) {
                TestingOutputPeekController.get(editor)?.next();
            }
        }
    }
    exports.GoToNextMessageAction = GoToNextMessageAction;
    class GoToPreviousMessageAction extends actions_2.Action2 {
        static { this.ID = 'testing.goToPreviousMessage'; }
        constructor() {
            super({
                id: GoToPreviousMessageAction.ID,
                f1: true,
                title: { value: (0, nls_1.localize)('testing.goToPreviousMessage', "Go to Previous Test Failure"), original: 'Go to Previous Test Failure' },
                icon: codicons_1.Codicon.arrowUp,
                category: actionCommonCategories_1.Categories.Test,
                keybinding: {
                    primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 66 /* KeyCode.F8 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */ + 1,
                    when: navWhen
                },
                menu: [{
                        id: actions_2.MenuId.TestPeekTitle,
                        group: 'navigation',
                        order: 1,
                    }, {
                        id: actions_2.MenuId.CommandPalette,
                        when: navWhen
                    }],
            });
        }
        run(accessor) {
            const editor = getPeekedEditorFromFocus(accessor.get(codeEditorService_1.ICodeEditorService));
            if (editor) {
                TestingOutputPeekController.get(editor)?.previous();
            }
        }
    }
    exports.GoToPreviousMessageAction = GoToPreviousMessageAction;
    class OpenMessageInEditorAction extends actions_2.Action2 {
        static { this.ID = 'testing.openMessageInEditor'; }
        constructor() {
            super({
                id: OpenMessageInEditorAction.ID,
                f1: false,
                title: { value: (0, nls_1.localize)('testing.openMessageInEditor', "Open in Editor"), original: 'Open in Editor' },
                icon: codicons_1.Codicon.goToFile,
                category: actionCommonCategories_1.Categories.Test,
                menu: [{ id: actions_2.MenuId.TestPeekTitle }],
            });
        }
        run(accessor) {
            accessor.get(testingPeekOpener_1.ITestingPeekOpener).openCurrentInEditor();
        }
    }
    exports.OpenMessageInEditorAction = OpenMessageInEditorAction;
    class ToggleTestingPeekHistory extends actions_2.Action2 {
        static { this.ID = 'testing.toggleTestingPeekHistory'; }
        constructor() {
            super({
                id: ToggleTestingPeekHistory.ID,
                f1: true,
                title: { value: (0, nls_1.localize)('testing.toggleTestingPeekHistory', "Toggle Test History in Peek"), original: 'Toggle Test History in Peek' },
                icon: codicons_1.Codicon.history,
                category: actionCommonCategories_1.Categories.Test,
                menu: [{
                        id: actions_2.MenuId.TestPeekTitle,
                        group: 'navigation',
                        order: 3,
                    }],
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 512 /* KeyMod.Alt */ | 38 /* KeyCode.KeyH */,
                    when: testingContextKeys_1.TestingContextKeys.isPeekVisible.isEqualTo(true),
                },
            });
        }
        run(accessor) {
            const opener = accessor.get(testingPeekOpener_1.ITestingPeekOpener);
            opener.historyVisible.value = !opener.historyVisible.value;
        }
    }
    exports.ToggleTestingPeekHistory = ToggleTestingPeekHistory;
    class CreationCache {
        constructor() {
            this.v = new WeakMap();
        }
        get(key) {
            return this.v.get(key);
        }
        getOrCreate(ref, factory) {
            const existing = this.v.get(ref);
            if (existing) {
                return existing;
            }
            const fresh = factory();
            this.v.set(ref, fresh);
            return fresh;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGluZ091dHB1dFBlZWsuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXN0aW5nL2Jyb3dzZXIvdGVzdGluZ091dHB1dFBlZWsudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQWlHaEcsTUFBTSxjQUFjO1FBUW5CLElBQVcsVUFBVTtZQUNwQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxrQ0FBMEIsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2hGLENBQUM7UUFFRCxJQUFXLFlBQVk7WUFDdEIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksa0NBQTBCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDNUYsQ0FBQztRQUVELElBQVcsT0FBTztZQUNqQixPQUFPO2dCQUNOLElBQUksMkNBQWtDO2dCQUN0QyxLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLO2dCQUN0QixPQUFPLEVBQUUsd0JBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQzthQUM3QyxDQUFDO1FBQ0gsQ0FBQztRQUVELFlBQTRCLE1BQW1CLEVBQUUsSUFBb0IsRUFBa0IsU0FBaUIsRUFBa0IsWUFBb0I7WUFBbEgsV0FBTSxHQUFOLE1BQU0sQ0FBYTtZQUF3QyxjQUFTLEdBQVQsU0FBUyxDQUFRO1lBQWtCLGlCQUFZLEdBQVosWUFBWSxDQUFRO1lBQzdJLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztZQUN0QixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztZQUNoRCxJQUFJLENBQUMsWUFB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