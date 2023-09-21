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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/markdownRenderer", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/aria/aria", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/browser/ui/splitview/splitview", "vs/base/common/actions", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/color", "vs/base/common/event", "vs/base/common/iconLabels", "vs/base/common/iterator", "vs/base/common/lazy", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/base/common/themables", "vs/base/common/types", "vs/editor/browser/editorBrowser", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/widget/codeEditorWidget", "vs/editor/browser/widget/diffEditor/diffEditorWidget", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/editor/common/services/resolverService", "vs/editor/contrib/markdownRenderer/browser/markdownRenderer", "vs/editor/contrib/peekView/browser/peekView", "vs/nls!vs/workbench/contrib/testing/browser/testingOutputPeek", "vs/platform/action/common/actionCommonCategories", "vs/platform/actions/browser/floatingMenu", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/keybinding/common/keybinding", "vs/platform/list/browser/listService", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/terminal/common/capabilities/terminalCapabilityStore", "vs/platform/terminal/common/terminalStrings", "vs/platform/theme/common/themeService", "vs/platform/workspace/common/workspace", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/editor/editorModel", "vs/workbench/common/theme", "vs/workbench/common/views", "vs/workbench/contrib/terminal/browser/detachedTerminal", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/browser/xterm/xtermTerminal", "vs/workbench/contrib/terminal/common/terminalColorRegistry", "vs/workbench/contrib/testing/browser/explorerProjections/testItemContextOverlay", "vs/workbench/contrib/testing/browser/icons", "vs/workbench/contrib/testing/browser/theme", "vs/workbench/contrib/testing/common/configuration", "vs/workbench/contrib/testing/common/observableValue", "vs/workbench/contrib/testing/common/storedValue", "vs/workbench/contrib/testing/common/testExplorerFilterState", "vs/workbench/contrib/testing/common/testProfileService", "vs/workbench/contrib/testing/common/testResult", "vs/workbench/contrib/testing/common/testResultService", "vs/workbench/contrib/testing/common/testService", "vs/workbench/contrib/testing/common/testTypes", "vs/workbench/contrib/testing/common/testingContextKeys", "vs/workbench/contrib/testing/common/testingPeekOpener", "vs/workbench/contrib/testing/common/testingStates", "vs/workbench/contrib/testing/common/testingUri", "vs/workbench/services/editor/common/editorService", "vs/css!./testingOutputPeek"], function (require, exports, dom, markdownRenderer_1, actionbar_1, aria_1, iconLabels_1, scrollableElement_1, splitview_1, actions_1, async_1, codicons_1, color_1, event_1, iconLabels_2, iterator_1, lazy_1, lifecycle_1, strings_1, themables_1, types_1, editorBrowser_1, editorExtensions_1, codeEditorService_1, codeEditorWidget_1, diffEditorWidget_1, embeddedCodeEditorWidget_1, range_1, editorContextKeys_1, resolverService_1, markdownRenderer_2, peekView_1, nls_1, actionCommonCategories_1, floatingMenu_1, menuEntryActionViewItem_1, actions_2, commands_1, configuration_1, contextkey_1, contextView_1, instantiation_1, serviceCollection_1, keybinding_1, listService_1, notification_1, opener_1, storage_1, telemetry_1, terminalCapabilityStore_1, terminalStrings_1, themeService_1, workspace_1, viewPane_1, editorModel_1, theme_1, views_1, detachedTerminal_1, terminal_1, xtermTerminal_1, terminalColorRegistry_1, testItemContextOverlay_1, icons, theme_2, configuration_2, observableValue_1, storedValue_1, testExplorerFilterState_1, testProfileService_1, testResult_1, testResultService_1, testService_1, testTypes_1, testingContextKeys_1, testingPeekOpener_1, testingStates_1, testingUri_1, editorService_1) {
    "use strict";
    var $HKb_1, TestResultsViewContent_1, TestResultsPeek_1, TestRunElementRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$NKb = exports.$MKb = exports.$LKb = exports.$KKb = exports.$JKb = exports.$IKb = exports.$HKb = exports.$GKb = void 0;
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
            this.expectedUri = (0, testingUri_1.$nKb)({ ...parts, type: 4 /* TestUriType.ResultExpectedOutput */ });
            this.actualUri = (0, testingUri_1.$nKb)({ ...parts, type: 3 /* TestUriType.ResultActualOutput */ });
            this.messageUri = (0, testingUri_1.$nKb)({ ...parts, type: 2 /* TestUriType.ResultMessage */ });
            const message = this.message = messages[this.messageIndex];
            this.revealLocation = message.location ?? (test.item.uri && test.item.range ? { uri: test.item.uri, range: range_1.$ks.lift(test.item.range) } : undefined);
        }
    }
    class TaskSubject {
        constructor(result, taskIndex) {
            this.result = result;
            this.taskIndex = taskIndex;
            this.outputUri = (0, testingUri_1.$nKb)({ resultId: result.id, taskIndex, type: 0 /* TestUriType.TaskOutput */ });
        }
    }
    class TestOutputSubject {
        constructor(result, taskIndex, task, test) {
            this.result = result;
            this.taskIndex = taskIndex;
            this.task = task;
            this.test = test;
            this.outputUri = (0, testingUri_1.$nKb)({ resultId: this.result.id, taskIndex: this.taskIndex, testExtId: this.test.item.extId, type: 1 /* TestUriType.TestOutput */ });
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
    let $GKb = class $GKb extends lifecycle_1.$kc {
        constructor(g, h, j, n, s, u, w, y, z) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.n = n;
            this.s = s;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            /** @inheritdoc */
            this.historyVisible = observableValue_1.$Isb.stored(this.B(new storedValue_1.$Gsb({
                key: 'testHistoryVisibleInPeek',
                scope: 0 /* StorageScope.PROFILE */,
                target: 0 /* StorageTarget.USER */,
            }, this.u)), false);
            this.B(n.onTestChanged(this.F, this));
        }
        /** @inheritdoc */
        async open() {
            let uri;
            const active = this.h.activeTextEditorControl;
            if ((0, editorBrowser_1.$iV)(active) && active.getModel()?.uri) {
                const modelUri = active.getModel()?.uri;
                if (modelUri) {
                    uri = await this.G(modelUri, active.getPosition());
                }
            }
            if (!uri) {
                uri = this.f;
            }
            if (!uri) {
                uri = this.H();
            }
            if (!uri) {
                return false;
            }
            return this.D(uri);
        }
        /** @inheritdoc */
        tryPeekFirstError(result, test, options) {
            const candidate = this.I(test);
            if (!candidate) {
                return false;
            }
            const message = candidate.message;
            this.D({
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
            const parsed = (0, testingUri_1.$mKb)(uri);
            const result = parsed && this.n.getResult(parsed.resultId);
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
            this.D({
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
            for (const editor of this.j.listCodeEditors()) {
                $HKb.get(editor)?.removePeek();
            }
        }
        openCurrentInEditor() {
            const current = this.C();
            if (!current) {
                return;
            }
            const options = { pinned: false, revealIfOpened: true };
            if (current instanceof TaskSubject || current instanceof TestOutputSubject) {
                this.h.openEditor({ resource: current.outputUri, options });
                return;
            }
            if (current instanceof TestOutputSubject) {
                this.h.openEditor({ resource: current.outputUri, options });
                return;
            }
            const message = current.message;
            if (current.isDiffable) {
                this.h.openEditor({
                    original: { resource: current.expectedUri },
                    modified: { resource: current.actualUri },
                    options,
                });
            }
            else if (typeof message.message === 'string') {
                this.h.openEditor({ resource: current.messageUri, options });
            }
            else {
                this.y.executeCommand('markdown.showPreview', current.messageUri).catch(err => {
                    this.z.error((0, nls_1.localize)(0, null, err.message));
                });
            }
        }
        C() {
            const editor = getPeekedEditorFromFocus(this.j);
            const controller = editor && $HKb.get(editor);
            return controller?.subject ?? this.w.getActiveViewWithId("workbench.panel.testResults.view" /* Testing.ResultsViewId */)?.subject;
        }
        /** @inheritdoc */
        async D(uri, editor, options) {
            if ((0, editorBrowser_1.$iV)(editor)) {
                this.f = uri;
                $HKb.get(editor)?.show((0, testingUri_1.$nKb)(this.f));
                return true;
            }
            const pane = await this.h.openEditor({
                resource: uri.documentUri,
                options: { revealIfOpened: true, ...options }
            });
            const control = pane?.getControl();
            if (!(0, editorBrowser_1.$iV)(control)) {
                return false;
            }
            this.f = uri;
            $HKb.get(control)?.show((0, testingUri_1.$nKb)(this.f));
            return true;
        }
        /**
         * Opens the peek view on a test failure, based on user preferences.
         */
        F(evt) {
            if (evt.reason !== 1 /* TestResultItemChangeReason.OwnStateChange */) {
                return;
            }
            const candidate = this.I(evt.item);
            if (!candidate) {
                return;
            }
            if (evt.result.request.continuous && !(0, configuration_2.$hKb)(this.g, "testing.automaticallyOpenPeekViewDuringAutoRun" /* TestingConfigKeys.AutoOpenPeekViewDuringContinuousRun */)) {
                return;
            }
            const editors = this.j.listCodeEditors();
            const cfg = (0, configuration_2.$hKb)(this.g, "testing.automaticallyOpenPeekView" /* TestingConfigKeys.AutoOpenPeekView */);
            // don't show the peek if the user asked to only auto-open peeks for visible tests,
            // and this test is not in any of the editors' models.
            switch (cfg) {
                case "failureInVisibleDocument" /* AutoOpenPeekViewWhen.FailureVisible */: {
                    const editorUris = new Set(editors.map(e => e.getModel()?.uri.toString()));
                    if (!iterator_1.Iterable.some((0, testResult_1.$Zsb)(evt.result, evt.item), i => i.item.uri && editorUris.has(i.item.uri.toString()))) {
                        return;
                    }
                    break; //continue
                }
                case "failureAnywhere" /* AutoOpenPeekViewWhen.FailureAnywhere */:
                    break; //continue
                default:
                    return; // never show
            }
            const controllers = editors.map($HKb.get);
            if (controllers.some(c => c?.subject)) {
                return;
            }
            this.tryPeekFirstError(evt.result, evt.item);
        }
        /**
         * Gets the message closest to the given position from a test in the file.
         */
        async G(uri, position) {
            let best;
            let bestDistance = Infinity;
            // Get all tests for the document. In those, find one that has a test
            // message closest to the cursor position.
            const demandedUriStr = uri.toString();
            for (const test of this.s.collection.all) {
                const result = this.n.getStateById(test.item.extId);
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
        H() {
            const seen = new Set();
            for (const result of this.n.results) {
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
        I(test) {
            let best;
            mapFindTestMessage(test, (task, message, messageIndex, taskId) => {
                if (!(0, testingStates_1.$Psb)(task.state) || !message.location) {
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
    exports.$GKb = $GKb;
    exports.$GKb = $GKb = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, editorService_1.$9C),
        __param(2, codeEditorService_1.$nV),
        __param(3, testResultService_1.$ftb),
        __param(4, testService_1.$4sb),
        __param(5, storage_1.$Vo),
        __param(6, views_1.$$E),
        __param(7, commands_1.$Fr),
        __param(8, notification_1.$Yu)
    ], $GKb);
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
    let $HKb = $HKb_1 = class $HKb extends lifecycle_1.$kc {
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
            return this.f.value?.current;
        }
        constructor(j, n, s, u, contextKeyService) {
            super();
            this.j = j;
            this.n = n;
            this.s = s;
            this.u = u;
            /**
             * Currently-shown peek view.
             */
            this.f = this.B(new lifecycle_1.$lc());
            this.h = testingContextKeys_1.TestingContextKeys.isPeekVisible.bindTo(contextKeyService);
            this.B(j.onDidChangeModel(() => this.f.clear()));
            this.B(u.onResultsChanged(this.y, this));
            this.B(u.onTestChanged(this.w, this));
        }
        /**
         * Toggles peek visibility for the URI.
         */
        toggle(uri) {
            if (this.g?.toString() === uri.toString()) {
                this.f.clear();
            }
            else {
                this.show(uri);
            }
        }
        /**
         * Shows a peek for the message in the editor.
         */
        async show(uri) {
            const subject = this.z(uri);
            if (!subject) {
                return;
            }
            if (!this.f.value) {
                this.f.value = this.s.createInstance(TestResultsPeek, this.j);
                this.f.value.onDidClose(() => {
                    this.h.set(false);
                    this.g = undefined;
                    this.f.value = undefined;
                });
                this.h.set(true);
                this.f.value.create();
            }
            if (subject instanceof MessageSubject) {
                (0, aria_1.$$P)((0, markdownRenderer_1.$BQ)(subject.message.message));
            }
            this.f.value.setModel(subject);
            this.g = uri;
        }
        async openAndShow(uri) {
            const subject = this.z(uri);
            if (!subject) {
                return;
            }
            if (!subject.revealLocation || subject.revealLocation.uri.toString() === this.j.getModel()?.uri.toString()) {
                return this.show(uri);
            }
            const otherEditor = await this.n.openCodeEditor({
                resource: subject.revealLocation.uri,
                options: { pinned: false, revealIfOpened: true }
            }, this.j);
            if (otherEditor) {
                $HKb_1.get(otherEditor)?.removePeek();
                return $HKb_1.get(otherEditor)?.show(uri);
            }
        }
        /**
         * Disposes the peek view, if any.
         */
        removePeek() {
            this.f.clear();
        }
        /**
         * Shows the next message in the peek, if possible.
         */
        next() {
            const subject = this.f.value?.current;
            if (!subject) {
                return;
            }
            let found = false;
            for (const { messageIndex, taskIndex, result, test } of allMessages(this.u.results)) {
                if (subject instanceof TaskSubject && result.id === subject.result.id) {
                    found = true; // open the first message found in the current result
                }
                if (found) {
                    this.openAndShow((0, testingUri_1.$nKb)({
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
            const subject = this.f.value?.current;
            if (!subject) {
                return;
            }
            let previous;
            for (const m of allMessages(this.u.results)) {
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
                this.openAndShow((0, testingUri_1.$nKb)({
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
            const c = this.f.value?.current;
            if (c && c instanceof MessageSubject && c.test.extId === testId) {
                this.f.clear();
            }
        }
        /**
         * If the test we're currently showing has its state change to something
         * else, then clear the peek.
         */
        w(evt) {
            if (evt.reason !== 1 /* TestResultItemChangeReason.OwnStateChange */ || evt.previousState === evt.item.ownComputedState) {
                return;
            }
            this.removeIfPeekingForTest(evt.item.item.extId);
        }
        y(evt) {
            if ('started' in evt) {
                this.f.clear(); // close peek when runs start
            }
            if ('removed' in evt && this.u.results.length === 0) {
                this.f.clear(); // close the peek if results are cleared
            }
        }
        z(uri) {
            const parts = (0, testingUri_1.$mKb)(uri);
            if (!parts) {
                return undefined;
            }
            const result = this.u.results.find(r => r.id === parts.resultId);
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
    exports.$HKb = $HKb;
    exports.$HKb = $HKb = $HKb_1 = __decorate([
        __param(1, codeEditorService_1.$nV),
        __param(2, instantiation_1.$Ah),
        __param(3, testResultService_1.$ftb),
        __param(4, contextkey_1.$3i)
    ], $HKb);
    let TestResultsViewContent = class TestResultsViewContent extends lifecycle_1.$kc {
        static { TestResultsViewContent_1 = this; }
        constructor(D, F, G, H, I) {
            super();
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.g = this.B(new event_1.$fd());
            this.h = this.B(new lifecycle_1.$jc());
            this.C = this.B(new async_1.$Mg(1));
        }
        fillBody(containerElement) {
            const initialSpitWidth = TestResultsViewContent_1.f;
            this.w = new splitview_1.$bR(containerElement, { orientation: 1 /* Orientation.HORIZONTAL */ });
            const { historyVisible, showRevealLocationOnMessages } = this.F;
            const isInPeekView = this.D !== undefined;
            const messageContainer = this.y = dom.$0O(containerElement, dom.$('.test-output-peek-message-container'));
            this.z = [
                this.B(this.G.createInstance(DiffContentProvider, this.D, messageContainer)),
                this.B(this.G.createInstance(MarkdownTestMessagePeek, messageContainer)),
                this.B(this.G.createInstance(TerminalMessagePeek, messageContainer, isInPeekView)),
                this.B(this.G.createInstance(PlainTextMessagePeek, this.D, messageContainer)),
            ];
            this.j = this.B(this.I.createScoped(this.y));
            this.n = testingContextKeys_1.TestingContextKeys.testMessageContext.bindTo(this.j);
            this.s = testingContextKeys_1.TestingContextKeys.testResultOutdated.bindTo(this.j);
            const treeContainer = dom.$0O(containerElement, dom.$('.test-output-peek-tree'));
            const tree = this.B(this.G.createInstance(OutputPeekTree, treeContainer, this.g.event, { showRevealLocationOnMessages }));
            this.onDidRequestReveal = tree.onDidRequestReview;
            this.w.addView({
                onDidChange: event_1.Event.None,
                element: messageContainer,
                minimumSize: 200,
                maximumSize: Number.MAX_VALUE,
                layout: width => {
                    TestResultsViewContent_1.f = width;
                    if (this.u) {
                        for (const provider of this.z) {
                            provider.layout({ height: this.u.height, width });
                        }
                    }
                },
            }, splitview_1.Sizing.Distribute);
            this.w.addView({
                onDidChange: event_1.Event.None,
                element: treeContainer,
                minimumSize: 100,
                maximumSize: Number.MAX_VALUE,
                layout: width => {
                    if (this.u) {
                        tree.layout(this.u.height, width);
                    }
                },
            }, splitview_1.Sizing.Distribute);
            const historyViewIndex = 1;
            this.w.setViewVisible(historyViewIndex, historyVisible.value);
            this.B(historyVisible.onDidChange(visible => {
                this.w.setViewVisible(historyViewIndex, visible);
            }));
            if (initialSpitWidth) {
                queueMicrotask(() => this.w.resizeView(0, initialSpitWidth));
            }
        }
        /**
         * Shows a message in-place without showing or changing the peek location.
         * This is mostly used if peeking a message without a location.
         */
        reveal(opts) {
            this.g.fire(opts);
            if (this.current && equalsSubject(this.current, opts.subject)) {
                return Promise.resolve();
            }
            this.current = opts.subject;
            return this.C.queue(async () => {
                await Promise.all(this.z.map(p => p.update(opts.subject)));
                this.h.clear();
                this.J(opts.subject);
            });
        }
        J(subject) {
            if (!(subject instanceof MessageSubject)) {
                return;
            }
            this.h.add((0, lifecycle_1.$ic)(() => {
                this.s.reset();
                this.n.reset();
            }));
            this.n.set(subject.contextValue || '');
            if (subject.result instanceof testResult_1.$2sb) {
                this.s.set(subject.result.getStateById(subject.test.extId)?.retired ?? false);
                this.h.add(subject.result.onChange(ev => {
                    if (ev.item.item.extId === subject.test.extId) {
                        this.s.set(ev.item.retired ?? false);
                    }
                }));
            }
            else {
                this.s.set(true);
            }
            this.h.add(this.G
                .createChild(new serviceCollection_1.$zh([contextkey_1.$3i, this.j]))
                .createInstance(floatingMenu_1.$prb, {
                container: this.y,
                menuId: actions_2.$Ru.TestMessageContent,
                getActionArg: () => subject.context,
            }));
        }
        onLayoutBody(height, width) {
            this.u = new dom.$BO(width, height);
            this.w.layout(width);
        }
        onWidth(width) {
            this.w.layout(width);
        }
    };
    TestResultsViewContent = TestResultsViewContent_1 = __decorate([
        __param(2, instantiation_1.$Ah),
        __param(3, resolverService_1.$uA),
        __param(4, contextkey_1.$3i)
    ], TestResultsViewContent);
    let TestResultsPeek = class TestResultsPeek extends peekView_1.$I3 {
        static { TestResultsPeek_1 = this; }
        constructor(editor, themeService, peekViewService, gb, hb, ib, instantiationService, jb) {
            super(editor, { showFrame: true, frameWidth: 1, showArrow: true, isResizeable: true, isAccessible: true, className: 'test-output-peek' }, instantiationService);
            this.gb = gb;
            this.hb = hb;
            this.ib = ib;
            this.jb = jb;
            this.cb = this.o.add(new event_1.$fd());
            this.o.add(themeService.onDidColorThemeChange(this.kb, this));
            this.o.add(this.onDidClose(() => this.cb.fire(false)));
            this.kb(themeService.getColorTheme());
            peekViewService.addExclusiveWidget(editor, this);
        }
        kb(theme) {
            const borderColor = theme.getColor(theme_2.$UJb) || color_1.$Os.transparent;
            const headerBg = theme.getColor(theme_2.$VJb) || color_1.$Os.transparent;
            this.style({
                arrowColor: borderColor,
                frameColor: borderColor,
                headerBackgroundColor: headerBg,
                primaryHeadingColor: theme.getColor(peekView_1.$K3),
                secondaryHeadingColor: theme.getColor(peekView_1.$L3)
            });
        }
        E(container) {
            if (!this.eb) {
                this.eb = this.o.add(this.hb.createScoped(container));
                testingContextKeys_1.TestingContextKeys.isInPeek.bindTo(this.eb).set(true);
                const instaService = this.Q.createChild(new serviceCollection_1.$zh([contextkey_1.$3i, this.eb]));
                this.db = this.o.add(instaService.createInstance(TestResultsViewContent, this.editor, { historyVisible: this.gb.historyVisible, showRevealLocationOnMessages: false }));
            }
            super.E(container);
        }
        U(container) {
            super.U(container);
            const actions = [];
            const menu = this.ib.createMenu(actions_2.$Ru.TestPeekTitle, this.hb);
            (0, menuEntryActionViewItem_1.$B3)(menu, undefined, actions);
            this.O.push(actions, { label: false, icon: true, index: 0 });
            menu.dispose();
        }
        Y(containerElement) {
            this.db.fillBody(containerElement);
            this.db.onDidRequestReveal(sub => {
                $HKb.get(this.editor)?.show(sub instanceof MessageSubject
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
            this.show(subject.revealLocation.range, TestResultsPeek_1.d || hintMessagePeekHeight(message));
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
                this.setTitle(firstLine((0, markdownRenderer_1.$BQ)(message.message)), (0, iconLabels_2.$Tj)(subject.test.label));
            }
            else {
                this.setTitle((0, nls_1.localize)(1, null));
            }
            await this.db.reveal({ subject: subject, preserveFocus: false });
        }
        H(newHeightInLines) {
            super.H(newHeightInLines);
            TestResultsPeek_1.d = newHeightInLines;
        }
        /** @override */
        bb(height, width) {
            super.bb(height, width);
            this.db.onLayoutBody(height, width);
        }
        /** @override */
        F(width) {
            super.F(width);
            if (this.fb) {
                this.fb = new dom.$BO(width, this.fb.height);
            }
            this.db.onWidth(width);
        }
    };
    TestResultsPeek = TestResultsPeek_1 = __decorate([
        __param(1, themeService_1.$gv),
        __param(2, peekView_1.$G3),
        __param(3, testingPeekOpener_1.$kKb),
        __param(4, contextkey_1.$3i),
        __param(5, actions_2.$Su),
        __param(6, instantiation_1.$Ah),
        __param(7, resolverService_1.$uA)
    ], TestResultsPeek);
    let $IKb = class $IKb extends viewPane_1.$Ieb {
        constructor(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, g) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.g = g;
            this.f = this.B(this.Bb.createInstance(TestResultsViewContent, undefined, {
                historyVisible: (0, observableValue_1.$Hsb)(true),
                showRevealLocationOnMessages: true,
            }));
        }
        get subject() {
            return this.f.current;
        }
        showLatestRun(preserveFocus = false) {
            const result = this.g.results.find(r => r.tasks.length);
            if (!result) {
                return;
            }
            this.f.reveal({ preserveFocus, subject: new TaskSubject(result, 0) });
        }
        U(container) {
            super.U(container);
            this.f.fillBody(container);
            this.f.onDidRequestReveal(subject => this.f.reveal({ preserveFocus: true, subject }));
            const [lastResult] = this.g.results;
            if (lastResult && lastResult.tasks.length) {
                this.f.reveal({ preserveFocus: true, subject: new TaskSubject(lastResult, 0) });
            }
        }
        W(height, width) {
            super.W(height, width);
            this.f.onLayoutBody(height, width);
        }
    };
    exports.$IKb = $IKb;
    exports.$IKb = $IKb = __decorate([
        __param(1, keybinding_1.$2D),
        __param(2, contextView_1.$WZ),
        __param(3, configuration_1.$8h),
        __param(4, contextkey_1.$3i),
        __param(5, views_1.$_E),
        __param(6, instantiation_1.$Ah),
        __param(7, opener_1.$NT),
        __param(8, themeService_1.$gv),
        __param(9, telemetry_1.$9k),
        __param(10, testResultService_1.$ftb)
    ], $IKb);
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
        originalAriaLabel: (0, nls_1.localize)(2, null),
        modifiedAriaLabel: (0, nls_1.localize)(3, null),
        diffAlgorithm: 'advanced',
    };
    const isDiffable = (message) => message.type === 0 /* TestMessageType.Error */ && message.actual !== undefined && message.expected !== undefined;
    let DiffContentProvider = class DiffContentProvider extends lifecycle_1.$kc {
        constructor(j, n, s, u) {
            super();
            this.j = j;
            this.n = n;
            this.s = s;
            this.u = u;
            this.f = this.B(new lifecycle_1.$lc());
            this.g = this.B(new lifecycle_1.$lc());
        }
        async update(subject) {
            if (!(subject instanceof MessageSubject)) {
                return this.w();
            }
            const message = subject.message;
            if (!isDiffable(message)) {
                return this.w();
            }
            const [original, modified] = await Promise.all([
                this.u.createModelReference(subject.expectedUri),
                this.u.createModelReference(subject.actualUri),
            ]);
            const model = this.g.value = new SimpleDiffEditorModel(original, modified);
            if (!this.f.value) {
                this.f.value = this.j ? this.s.createInstance(embeddedCodeEditorWidget_1.$x3, this.n, diffEditorOptions, {}, this.j) : this.s.createInstance(diffEditorWidget_1.$6Z, this.n, diffEditorOptions, {});
                if (this.h) {
                    this.f.value.layout(this.h);
                }
            }
            this.f.value.setModel(model);
            this.f.value.updateOptions(this.y(isMultiline(message.expected) || isMultiline(message.actual)));
        }
        w() {
            this.g.clear();
            this.f.clear();
        }
        layout(dimensions) {
            this.h = dimensions;
            this.f.value?.layout(dimensions);
        }
        y(isMultiline) {
            return isMultiline
                ? { ...diffEditorOptions, lineNumbers: 'on' }
                : { ...diffEditorOptions, lineNumbers: 'off' };
        }
    };
    DiffContentProvider = __decorate([
        __param(2, instantiation_1.$Ah),
        __param(3, resolverService_1.$uA)
    ], DiffContentProvider);
    class ScrollableMarkdownMessage extends lifecycle_1.$kc {
        constructor(container, markdown, message) {
            super();
            const rendered = this.B(markdown.render(message, {}));
            rendered.element.style.height = '100%';
            rendered.element.style.userSelect = 'text';
            container.appendChild(rendered.element);
            this.g = rendered.element;
            this.f = this.B(new scrollableElement_1.$UP(rendered.element, {
                className: 'preview-text',
            }));
            container.appendChild(this.f.getDomNode());
            this.B((0, lifecycle_1.$ic)(() => {
                container.removeChild(this.f.getDomNode());
            }));
            this.f.scanDomNode();
        }
        layout(height, width) {
            // Remove padding of `.monaco-editor .zone-widget.test-output-peek .preview-text`
            this.f.setScrollDimensions({
                width: width - 32,
                height: height - 16,
                scrollWidth: this.g.scrollWidth,
                scrollHeight: this.g.scrollHeight
            });
        }
    }
    let MarkdownTestMessagePeek = class MarkdownTestMessagePeek extends lifecycle_1.$kc {
        constructor(h, j) {
            super();
            this.h = h;
            this.j = j;
            this.f = new lazy_1.$T(() => this.B(this.j.createInstance(markdownRenderer_2.$K2, {})));
            this.g = this.B(new lifecycle_1.$lc());
        }
        update(subject) {
            if (!(subject instanceof MessageSubject)) {
                return this.g.clear();
            }
            const message = subject.message;
            if (isDiffable(message) || typeof message.message === 'string') {
                return this.g.clear();
            }
            this.g.value = new ScrollableMarkdownMessage(this.h, this.f.value, message.message);
        }
        layout(dimension) {
            this.g.value?.layout(dimension.height, dimension.width);
        }
    };
    MarkdownTestMessagePeek = __decorate([
        __param(1, instantiation_1.$Ah)
    ], MarkdownTestMessagePeek);
    let PlainTextMessagePeek = class PlainTextMessagePeek extends lifecycle_1.$kc {
        constructor(j, n, s, u) {
            super();
            this.j = j;
            this.n = n;
            this.s = s;
            this.u = u;
            this.f = this.B(new lifecycle_1.$lc());
            this.g = this.B(new lifecycle_1.$lc());
        }
        async update(subject) {
            if (!(subject instanceof MessageSubject)) {
                return this.w();
            }
            const message = subject.message;
            if (isDiffable(message) || message.type === 1 /* TestMessageType.Output */ || typeof message.message !== 'string') {
                return this.w();
            }
            const modelRef = this.g.value = await this.u.createModelReference(subject.messageUri);
            if (!this.f.value) {
                this.f.value = this.j ? this.s.createInstance(embeddedCodeEditorWidget_1.$w3, this.n, commonEditorOptions, {}, this.j) : this.s.createInstance(codeEditorWidget_1.$uY, this.n, commonEditorOptions, { isSimpleWidget: true });
                if (this.h) {
                    this.f.value.layout(this.h);
                }
            }
            this.f.value.setModel(modelRef.object.textEditorModel);
            this.f.value.updateOptions(commonEditorOptions);
        }
        w() {
            this.g.clear();
            this.f.clear();
        }
        layout(dimensions) {
            this.h = dimensions;
            this.f.value?.layout(dimensions);
        }
    };
    PlainTextMessagePeek = __decorate([
        __param(2, instantiation_1.$Ah),
        __param(3, resolverService_1.$uA)
    ], PlainTextMessagePeek);
    let TerminalMessagePeek = class TerminalMessagePeek extends lifecycle_1.$kc {
        constructor(s, u, w, y, z) {
            super();
            this.s = s;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.g = this.B(new observableValue_1.$Isb(''));
            this.h = this.B(new async_1.$Dg(50));
            /** Active terminal instance. */
            this.j = this.B(new lifecycle_1.$lc());
            /** Listener for streaming result data */
            this.n = this.B(new lifecycle_1.$lc());
        }
        async C() {
            const prev = this.j.value;
            if (prev) {
                prev.xterm.clearBuffer();
                prev.xterm.clearSearchDecorations();
                // clearBuffer tries to retain the prompt line, but this doesn't exist for tests.
                // So clear the screen (J) and move to home (H) to ensure previous data is cleaned up.
                prev.xterm.write(`\x1b[2J\x1b[0;0H`);
                return prev;
            }
            const capabilities = new terminalCapabilityStore_1.$eib();
            const cwd = this.g;
            capabilities.add(0 /* TerminalCapability.CwdDetection */, {
                type: 0 /* TerminalCapability.CwdDetection */,
                get cwds() { return [cwd.value]; },
                onDidChangeCwd: cwd.onDidChange,
                getCwd: () => cwd.value,
                updateCwd: () => { },
            });
            return this.j.value = await this.w.createDetachedTerminal({
                rows: 10,
                cols: 80,
                readonly: true,
                capabilities,
                processInfo: new detachedTerminal_1.$DKb({ initialCwd: cwd.value }),
                colorProvider: {
                    getBackgroundColor: theme => {
                        const terminalBackground = theme.getColor(terminalColorRegistry_1.$ofb);
                        if (terminalBackground) {
                            return terminalBackground;
                        }
                        if (this.u) {
                            return theme.getColor(peekView_1.$N3);
                        }
                        const location = this.y.getViewLocationById("workbench.panel.testResults.view" /* Testing.ResultsViewId */);
                        return location === 1 /* ViewContainerLocation.Panel */
                            ? theme.getColor(theme_1.$L_)
                            : theme.getColor(theme_1.$Iab);
                    },
                }
            });
        }
        async update(subject) {
            this.n.clear();
            if (subject instanceof TaskSubject) {
                await this.F(subject);
            }
            else if (subject instanceof TestOutputSubject || (subject instanceof MessageSubject && subject.message.type === 1 /* TestMessageType.Output */)) {
                await this.D(subject);
            }
            else {
                this.L();
            }
        }
        async D(subject) {
            const that = this;
            const testItem = subject instanceof TestOutputSubject ? subject.test.item : subject.test;
            const terminal = await this.G({
                subject,
                getTarget: result => result?.tasks[subject.taskIndex].output,
                *doInitialWrite(output, results) {
                    that.H(testItem.uri);
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
                terminal?.xterm.selectMarkedRange((0, testTypes_1.$SI)(subject.message.marker, true), (0, testTypes_1.$SI)(subject.message.marker, false), /* scrollIntoView= */ true);
            }
        }
        F(subject) {
            return this.G({
                subject,
                getTarget: result => result?.tasks[subject.taskIndex],
                doInitialWrite: (task, result) => {
                    // Update the cwd and use the first test to try to hint at the correct cwd,
                    // but often this will fall back to the first workspace folder.
                    this.H(iterator_1.Iterable.find(result.tests, t => !!t.item.uri)?.item.uri);
                    return task.output.buffers;
                },
                doListenForMoreData: (task, _result, { xterm }) => task.output.onDidWriteData(e => xterm.write(e.buffer)),
            });
        }
        async G(opts) {
            const result = opts.subject.result;
            const target = opts.getTarget(result);
            if (!target) {
                return this.L();
            }
            const terminal = await this.C();
            let didWriteData = false;
            const pendingWrites = new observableValue_1.$Isb(0);
            if (result instanceof testResult_1.$2sb) {
                for (const chunk of opts.doInitialWrite(target, result)) {
                    didWriteData ||= chunk.byteLength > 0;
                    pendingWrites.value++;
                    terminal.xterm.write(chunk.buffer, () => pendingWrites.value--);
                }
            }
            else {
                didWriteData = true;
                this.I(terminal, (0, nls_1.localize)(4, null));
            }
            this.J(terminal);
            this.n.value = result instanceof testResult_1.$2sb ? opts.doListenForMoreData(target, result, terminal) : undefined;
            if (!this.n.value && !didWriteData) {
                this.I(terminal, (0, nls_1.localize)(5, null));
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
        H(testUri) {
            const wf = (testUri && this.z.getWorkspaceFolder(testUri))
                || this.z.getWorkspace().folders[0];
            if (wf) {
                this.g.value = wf.uri.fsPath;
            }
        }
        I(terminal, str) {
            terminal.xterm.write((0, terminalStrings_1.$zKb)(str));
        }
        J(terminal) {
            terminal.xterm.write('\x1b[?25l'); // hide cursor
            requestAnimationFrame(() => this.M(terminal));
            terminal.attachToElement(this.s, { enableGpu: false });
        }
        L() {
            this.n.clear();
            this.h.cancel();
            this.j.clear();
        }
        layout(dimensions) {
            this.f = dimensions;
            if (this.j.value) {
                this.M(this.j.value, dimensions.width, dimensions.height);
            }
        }
        M({ xterm }, width = this.f?.width ?? this.s.clientWidth, height = this.f?.height ?? this.s.clientHeight) {
            width -= 10 + 20; // scrollbar width + margin
            this.h.trigger(() => {
                const scaled = (0, xtermTerminal_1.$Lib)(xterm.getFont(), width, height);
                if (scaled) {
                    xterm.resize(scaled.cols, scaled.rows);
                }
            });
        }
    };
    TerminalMessagePeek = __decorate([
        __param(2, terminal_1.$Mib),
        __param(3, views_1.$_E),
        __param(4, workspace_1.$Kh)
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
    const hintPeekStrHeight = (str) => Math.min((0, strings_1.$re)(str, '\n'), 24);
    class SimpleDiffEditorModel extends editorModel_1.$xA {
        constructor(g, n) {
            super();
            this.g = g;
            this.n = n;
            this.original = this.g.object.textEditorModel;
            this.modified = this.n.object.textEditorModel;
        }
        dispose() {
            super.dispose();
            this.g.dispose();
            this.n.dispose();
        }
    }
    function getOuterEditorFromDiffEditor(codeEditorService) {
        const diffEditors = codeEditorService.listDiffEditors();
        for (const diffEditor of diffEditors) {
            if (diffEditor.hasTextFocus() && diffEditor instanceof embeddedCodeEditorWidget_1.$x3) {
                return diffEditor.getParentEditor();
            }
        }
        return null;
    }
    class $JKb extends editorExtensions_1.$uV {
        constructor() {
            super({
                id: 'editor.closeTestPeek',
                title: (0, nls_1.localize)(6, null),
                icon: codicons_1.$Pj.close,
                precondition: contextkey_1.$Ii.or(testingContextKeys_1.TestingContextKeys.isInPeek, testingContextKeys_1.TestingContextKeys.isPeekVisible),
                keybinding: {
                    weight: 100 /* KeybindingWeight.EditorContrib */ - 101,
                    primary: 9 /* KeyCode.Escape */,
                    when: contextkey_1.$Ii.not('config.editor.stablePeek')
                }
            });
        }
        runEditorCommand(accessor, editor) {
            const parent = getPeekedEditorFromFocus(accessor.get(codeEditorService_1.$nV));
            $HKb.get(parent ?? editor)?.removePeek();
        }
    }
    exports.$JKb = $JKb;
    class TestResultElement {
        get icon() {
            return icons.$eKb.get(this.value.completedAt === undefined
                ? 2 /* TestResultState.Running */
                : (0, testResult_1.$1sb)(this.value.counts));
        }
        constructor(value) {
            this.value = value;
            this.changeEmitter = new event_1.$fd();
            this.onDidChange = this.changeEmitter.event;
            this.type = 'result';
            this.context = this.value.id;
            this.id = this.value.id;
            this.label = this.value.name;
        }
    }
    class TestCaseElement {
        get onDidChange() {
            if (!(this.d instanceof testResult_1.$2sb)) {
                return event_1.Event.None;
            }
            return event_1.Event.filter(this.d.onChange, e => e.item.item.extId === this.test.item.extId);
        }
        get state() {
            return this.test.tasks[this.taskIndex].state;
        }
        get label() {
            return this.test.item.label;
        }
        get labelWithIcons() {
            return (0, iconLabels_1.$xQ)(this.label);
        }
        get icon() {
            return icons.$eKb.get(this.state);
        }
        get outputSubject() {
            return new TestOutputSubject(this.d, this.taskIndex, this.f, this.test);
        }
        constructor(d, f, test, taskIndex) {
            this.d = d;
            this.f = f;
            this.test = test;
            this.taskIndex = taskIndex;
            this.type = 'test';
            this.context = this.test.item.extId;
            this.id = `${this.d.id}/${this.test.item.extId}`;
        }
    }
    class TaskElement {
        get icon() {
            return this.results.tasks[this.index].running ? icons.$eKb.get(2 /* TestResultState.Running */) : undefined;
        }
        constructor(results, task, index) {
            this.results = results;
            this.task = task;
            this.index = index;
            this.changeEmitter = new event_1.$fd();
            this.onDidChange = this.changeEmitter.event;
            this.type = 'task';
            this.itemsCache = new CreationCache();
            this.id = `${results.id}/${index}`;
            this.task = results.tasks[index];
            this.context = String(index);
            this.label = this.task.name ?? (0, nls_1.localize)(7, null);
        }
    }
    class TestMessageElement {
        get onDidChange() {
            if (!(this.result instanceof testResult_1.$2sb)) {
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
            this.uri = (0, testingUri_1.$nKb)({
                type: 2 /* TestUriType.ResultMessage */,
                messageIndex,
                resultId: result.id,
                taskIndex,
                testExtId: test.item.extId
            });
            this.id = this.uri.toString();
            const asPlaintext = (0, markdownRenderer_1.$BQ)(m.message);
            const lines = (0, strings_1.$re)(asPlaintext.trimEnd(), '\n');
            this.label = firstLine(asPlaintext);
            if (lines > 0) {
                this.description = lines > 1
                    ? (0, nls_1.localize)(8, null, lines)
                    : (0, nls_1.localize)(9, null);
            }
        }
    }
    let OutputPeekTree = class OutputPeekTree extends lifecycle_1.$kc {
        constructor(container, onDidReveal, options, n, results, instantiationService, explorerFilter) {
            super();
            this.n = n;
            this.f = false;
            this.j = this.B(new event_1.$fd());
            this.onDidRequestReview = this.j.event;
            this.h = instantiationService.createInstance(TreeActionsProvider, options.showRevealLocationOnMessages, this.j);
            const diffIdentityProvider = {
                getId(e) {
                    return e.id;
                }
            };
            this.g = this.B(instantiationService.createInstance(listService_1.$u4, 'Test Output Peek', container, {
                getHeight: () => 22,
                getTemplateId: () => TestRunElementRenderer.ID,
            }, [instantiationService.createInstance(TestRunElementRenderer, this.h)], {
                compressionEnabled: true,
                hideTwistiesOfChildlessElements: true,
                identityProvider: diffIdentityProvider,
                sorter: {
                    compare(a, b) {
                        if (a instanceof TestCaseElement && b instanceof TestCaseElement) {
                            return (0, testingStates_1.$Ssb)(a.state, b.state);
                        }
                        return 0;
                    },
                },
                accessibilityProvider: {
                    getAriaLabel(element) {
                        return element.ariaLabel || element.label;
                    },
                    getWidgetAriaLabel() {
                        return (0, nls_1.localize)(10, null);
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
                    .filter(types_1.$rf);
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
                    collapsed: this.g.hasElement(element) ? this.g.isCollapsed(element) : true,
                    children: getResultChildren(result)
                };
            });
            // Queued result updates to prevent spamming CPU when lots of tests are
            // completing and messaging quickly (#142514)
            const taskChildrenToUpdate = new Set();
            const taskChildrenUpdate = this.B(new async_1.$Sg(() => {
                for (const taskNode of taskChildrenToUpdate) {
                    if (this.g.hasElement(taskNode)) {
                        this.g.setChildren(taskNode, getTaskChildren(taskNode), { diffIdentityProvider });
                    }
                }
                taskChildrenToUpdate.clear();
            }, 300));
            const attachToResults = (result) => {
                const resultNode = cc.get(result);
                const disposable = new lifecycle_1.$jc();
                disposable.add(result.onNewTask(() => {
                    if (result.tasks.length === 1) {
                        this.j.fire(new TaskSubject(result, 0)); // reveal the first task in new runs
                    }
                    if (this.g.hasElement(resultNode)) {
                        this.g.setChildren(resultNode, getResultChildren(result), { diffIdentityProvider });
                    }
                }));
                disposable.add(result.onEndTask(index => {
                    cc.get(result.tasks[index])?.changeEmitter.fire();
                }));
                disposable.add(result.onChange(e => {
                    // try updating the item in each of its tasks
                    for (const [index, task] of result.tasks.entries()) {
                        const taskNode = cc.get(task);
                        if (!this.g.hasElement(taskNode)) {
                            continue;
                        }
                        const itemNode = taskNode.itemsCache.get(e.item);
                        if (itemNode && this.g.hasElement(itemNode)) {
                            if (e.reason === 2 /* TestResultItemChangeReason.NewMessage */ && e.message.type === 0 /* TestMessageType.Error */) {
                                this.g.setChildren(itemNode, getTestChildren(result, e.item, index), { diffIdentityProvider });
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
            this.B(results.onResultsChanged(e => {
                // little hack here: a result change can cause the peek to be disposed,
                // but this listener will still be queued. Doing stuff with the tree
                // will cause errors.
                if (this.f) {
                    return;
                }
                if ('completed' in e) {
                    cc.get(e.completed)?.changeEmitter.fire();
                    return;
                }
                this.g.setChildren(null, getRootChildren(), { diffIdentityProvider });
                // done after setChildren intentionally so that the ResultElement exists in the cache.
                if ('started' in e) {
                    for (const child of this.g.getNode(null).children) {
                        this.g.collapse(child.element, false);
                    }
                    this.g.expand(attachToResults(e.started), true);
                }
            }));
            const revealItem = (element, preserveFocus) => {
                this.g.setFocus([element]);
                this.g.setSelection([element]);
                if (!preserveFocus) {
                    this.g.domFocus();
                }
            };
            this.B(onDidReveal(async ({ subject, preserveFocus = false }) => {
                if (subject instanceof TaskSubject) {
                    const resultItem = this.g.getNode(null).children.find(c => {
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
                if (!revealElement || !this.g.hasElement(revealElement)) {
                    return;
                }
                const parents = [];
                for (let parent = this.g.getParentElement(revealElement); parent; parent = this.g.getParentElement(parent)) {
                    parents.unshift(parent);
                }
                for (const parent of parents) {
                    this.g.expand(parent);
                }
                if (this.g.getRelativeTop(revealElement) === null) {
                    this.g.reveal(revealElement, 0.5);
                }
                revealItem(revealElement, preserveFocus);
            }));
            this.B(this.g.onDidOpen(async (e) => {
                if (e.element instanceof TestMessageElement) {
                    this.j.fire(new MessageSubject(e.element.result, e.element.test, e.element.taskIndex, e.element.messageIndex));
                }
            }));
            this.B(this.g.onDidChangeSelection(evt => {
                for (const element of evt.elements) {
                    if (element && 'test' in element) {
                        explorerFilter.reveal.value = element.test.item.extId;
                        break;
                    }
                }
            }));
            this.B(this.g.onContextMenu(e => this.s(e)));
            this.g.setChildren(null, getRootChildren());
            for (const result of results.results) {
                if (!result.completedAt && result instanceof testResult_1.$2sb) {
                    attachToResults(result);
                }
            }
        }
        layout(height, width) {
            this.g.layout(height, width);
        }
        s(evt) {
            if (!evt.element) {
                return;
            }
            const actions = this.h.provideActionBar(evt.element);
            this.n.showContextMenu({
                getAnchor: () => evt.anchor,
                getActions: () => actions.secondary.length
                    ? [...actions.primary, new actions_1.$ii(), ...actions.secondary]
                    : actions.primary,
                getActionsContext: () => evt.element?.context
            });
        }
        dispose() {
            super.dispose();
            this.f = true;
        }
    };
    OutputPeekTree = __decorate([
        __param(3, contextView_1.$WZ),
        __param(4, testResultService_1.$ftb),
        __param(5, instantiation_1.$Ah),
        __param(6, testExplorerFilterState_1.$EKb)
    ], OutputPeekTree);
    let TestRunElementRenderer = class TestRunElementRenderer {
        static { TestRunElementRenderer_1 = this; }
        static { this.ID = 'testRunElementRenderer'; }
        constructor(d, f) {
            this.d = d;
            this.f = f;
            this.templateId = TestRunElementRenderer_1.ID;
        }
        /** @inheritdoc */
        renderCompressedElements(node, _index, templateData) {
            const chain = node.element.elements;
            const lastElement = chain[chain.length - 1];
            if ((lastElement instanceof TaskElement || lastElement instanceof TestMessageElement) && chain.length >= 2) {
                this.g(chain[chain.length - 2], templateData, lastElement);
            }
            else {
                this.g(lastElement, templateData);
            }
        }
        /** @inheritdoc */
        renderTemplate(container) {
            const templateDisposable = new lifecycle_1.$jc();
            const wrapper = dom.$0O(container, dom.$('.test-peek-item'));
            const icon = dom.$0O(wrapper, dom.$('.state'));
            const label = dom.$0O(wrapper, dom.$('.name'));
            const actionBar = new actionbar_1.$1P(wrapper, {
                actionViewItemProvider: action => action instanceof actions_2.$Vu
                    ? this.f.createInstance(menuEntryActionViewItem_1.$C3, action, undefined)
                    : undefined
            });
            const elementDisposable = new lifecycle_1.$jc();
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
            this.g(element.element, templateData);
        }
        /** @inheritdoc */
        disposeTemplate(templateData) {
            templateData.templateDisposable.dispose();
        }
        /** Called to render a new element */
        g(element, templateData, subjectElement) {
            templateData.elementDisposable.clear();
            templateData.elementDisposable.add(element.onDidChange(() => this.g(element, templateData, subjectElement)));
            this.h(element, templateData, subjectElement);
        }
        /** Called, and may be re-called, to render or re-render an element */
        h(element, templateData, subjectElement) {
            let { label, labelWithIcons, description } = element;
            if (subjectElement instanceof TestMessageElement) {
                description = subjectElement.label;
            }
            const descriptionElement = description ? dom.$('span.test-label-description', {}, description) : '';
            if (labelWithIcons) {
                dom.$_O(templateData.label, ...labelWithIcons, descriptionElement);
            }
            else {
                dom.$_O(templateData.label, label, descriptionElement);
            }
            const icon = element.icon;
            templateData.icon.className = `computed-state ${icon ? themables_1.ThemeIcon.asClassName(icon) : ''}`;
            const actions = this.d.provideActionBar(element);
            templateData.actionBar.clear();
            templateData.actionBar.context = element.context;
            templateData.actionBar.push(actions.primary, { icon: true, label: false });
        }
    };
    TestRunElementRenderer = TestRunElementRenderer_1 = __decorate([
        __param(1, instantiation_1.$Ah)
    ], TestRunElementRenderer);
    let TreeActionsProvider = class TreeActionsProvider {
        constructor(d, f, g, h, j, k, n) {
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.k = k;
            this.n = n;
        }
        provideActionBar(element) {
            const test = element instanceof TestCaseElement ? element.test : undefined;
            const capabilities = test ? this.k.capabilitiesForTest(test) : 0;
            const contextKeys = [
                ['peek', "editor.contrib.testingOutputPeek" /* Testing.OutputPeekContributionId */],
                [testingContextKeys_1.TestingContextKeys.peekItemType.key, element.type],
            ];
            let id = actions_2.$Ru.TestPeekElement;
            const primary = [];
            const secondary = [];
            if (element instanceof TaskElement) {
                primary.push(new actions_1.$gi('testing.outputPeek.showResultOutput', (0, nls_1.localize)(11, null), themables_1.ThemeIcon.asClassName(codicons_1.$Pj.terminal), undefined, () => this.f.fire(new TaskSubject(element.results, element.index))));
            }
            if (element instanceof TestResultElement) {
                // only show if there are no collapsed test nodes that have more specific choices
                if (element.value.tasks.length === 1) {
                    primary.push(new actions_1.$gi('testing.outputPeek.showResultOutput', (0, nls_1.localize)(12, null), themables_1.ThemeIcon.asClassName(codicons_1.$Pj.terminal), undefined, () => this.f.fire(new TaskSubject(element.value, 0))));
                }
                primary.push(new actions_1.$gi('testing.outputPeek.reRunLastRun', (0, nls_1.localize)(13, null), themables_1.ThemeIcon.asClassName(icons.$1Jb), undefined, () => this.j.executeCommand('testing.reRunLastRun', element.value.id)));
                if (capabilities & 4 /* TestRunProfileBitset.Debug */) {
                    primary.push(new actions_1.$gi('testing.outputPeek.debugLastRun', (0, nls_1.localize)(14, null), themables_1.ThemeIcon.asClassName(icons.$5Jb), undefined, () => this.j.executeCommand('testing.debugLastRun', element.value.id)));
                }
            }
            if (element instanceof TestCaseElement || element instanceof TestMessageElement) {
                contextKeys.push([testingContextKeys_1.TestingContextKeys.testResultOutdated.key, element.test.retired], ...(0, testItemContextOverlay_1.$fKb)(element.test, capabilities));
            }
            if (element instanceof TestCaseElement) {
                const extId = element.test.item.extId;
                if (element.test.tasks[element.taskIndex].messages.some(m => m.type === 1 /* TestMessageType.Output */)) {
                    primary.push(new actions_1.$gi('testing.outputPeek.showResultOutput', (0, nls_1.localize)(15, null), themables_1.ThemeIcon.asClassName(codicons_1.$Pj.terminal), undefined, () => this.f.fire(element.outputSubject)));
                }
                secondary.push(new actions_1.$gi('testing.outputPeek.revealInExplorer', (0, nls_1.localize)(16, null), themables_1.ThemeIcon.asClassName(codicons_1.$Pj.listTree), undefined, () => this.j.executeCommand('_revealTestInExplorer', extId)));
                if (capabilities & 2 /* TestRunProfileBitset.Run */) {
                    primary.push(new actions_1.$gi('testing.outputPeek.runTest', (0, nls_1.localize)(17, null), themables_1.ThemeIcon.asClassName(icons.$1Jb), undefined, () => this.j.executeCommand('vscode.runTestsById', 2 /* TestRunProfileBitset.Run */, extId)));
                }
                if (capabilities & 4 /* TestRunProfileBitset.Debug */) {
                    primary.push(new actions_1.$gi('testing.outputPeek.debugTest', (0, nls_1.localize)(18, null), themables_1.ThemeIcon.asClassName(icons.$5Jb), undefined, () => this.j.executeCommand('vscode.runTestsById', 4 /* TestRunProfileBitset.Debug */, extId)));
                }
                primary.push(new actions_1.$gi('testing.outputPeek.goToFile', (0, nls_1.localize)(19, null), themables_1.ThemeIcon.asClassName(codicons_1.$Pj.goToFile), undefined, () => this.j.executeCommand('vscode.revealTest', extId)));
            }
            if (element instanceof TestMessageElement) {
                id = actions_2.$Ru.TestMessageContext;
                contextKeys.push([testingContextKeys_1.TestingContextKeys.testMessageContext.key, element.contextValue]);
                if (this.d && element.location) {
                    primary.push(new actions_1.$gi('testing.outputPeek.goToError', (0, nls_1.localize)(20, null), themables_1.ThemeIcon.asClassName(codicons_1.$Pj.goToFile), undefined, () => this.n.openEditor({
                        resource: element.location.uri,
                        options: {
                            selection: element.location.range,
                            preserveFocus: true,
                        }
                    })));
                }
            }
            const contextOverlay = this.g.createOverlay(contextKeys);
            const result = { primary, secondary };
            const menu = this.h.createMenu(id, contextOverlay);
            try {
                (0, menuEntryActionViewItem_1.$B3)(menu, { arg: element.context }, result, 'inline');
                return result;
            }
            finally {
                menu.dispose();
            }
        }
    };
    TreeActionsProvider = __decorate([
        __param(2, contextkey_1.$3i),
        __param(3, actions_2.$Su),
        __param(4, commands_1.$Fr),
        __param(5, testProfileService_1.$9sb),
        __param(6, editorService_1.$9C)
    ], TreeActionsProvider);
    const navWhen = contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.focus, testingContextKeys_1.TestingContextKeys.isPeekVisible);
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
        if ($HKb.get(editor)?.subject) {
            return editor;
        }
        if (editor instanceof embeddedCodeEditorWidget_1.$w3) {
            return editor.getParentEditor();
        }
        const outer = getOuterEditorFromDiffEditor(codeEditorService);
        if (outer) {
            return outer;
        }
        return editor;
    };
    class $KKb extends actions_2.$Wu {
        static { this.ID = 'testing.goToNextMessage'; }
        constructor() {
            super({
                id: $KKb.ID,
                f1: true,
                title: { value: (0, nls_1.localize)(21, null), original: 'Go to Next Test Failure' },
                icon: codicons_1.$Pj.arrowDown,
                category: actionCommonCategories_1.$Nl.Test,
                keybinding: {
                    primary: 512 /* KeyMod.Alt */ | 66 /* KeyCode.F8 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */ + 1,
                    when: navWhen,
                },
                menu: [{
                        id: actions_2.$Ru.TestPeekTitle,
                        group: 'navigation',
                        order: 2,
                    }, {
                        id: actions_2.$Ru.CommandPalette,
                        when: navWhen
                    }],
            });
        }
        run(accessor) {
            const editor = getPeekedEditorFromFocus(accessor.get(codeEditorService_1.$nV));
            if (editor) {
                $HKb.get(editor)?.next();
            }
        }
    }
    exports.$KKb = $KKb;
    class $LKb extends actions_2.$Wu {
        static { this.ID = 'testing.goToPreviousMessage'; }
        constructor() {
            super({
                id: $LKb.ID,
                f1: true,
                title: { value: (0, nls_1.localize)(22, null), original: 'Go to Previous Test Failure' },
                icon: codicons_1.$Pj.arrowUp,
                category: actionCommonCategories_1.$Nl.Test,
                keybinding: {
                    primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 66 /* KeyCode.F8 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */ + 1,
                    when: navWhen
                },
                menu: [{
                        id: actions_2.$Ru.TestPeekTitle,
                        group: 'navigation',
                        order: 1,
                    }, {
                        id: actions_2.$Ru.CommandPalette,
                        when: navWhen
                    }],
            });
        }
        run(accessor) {
            const editor = getPeekedEditorFromFocus(accessor.get(codeEditorService_1.$nV));
            if (editor) {
                $HKb.get(editor)?.previous();
            }
        }
    }
    exports.$LKb = $LKb;
    class $MKb extends actions_2.$Wu {
        static { this.ID = 'testing.openMessageInEditor'; }
        constructor() {
            super({
                id: $MKb.ID,
                f1: false,
                title: { value: (0, nls_1.localize)(23, null), original: 'Open in Editor' },
                icon: codicons_1.$Pj.goToFile,
                category: actionCommonCategories_1.$Nl.Test,
                menu: [{ id: actions_2.$Ru.TestPeekTitle }],
            });
        }
        run(accessor) {
            accessor.get(testingPeekOpener_1.$kKb).openCurrentInEditor();
        }
    }
    exports.$MKb = $MKb;
    class $NKb extends actions_2.$Wu {
        static { this.ID = 'testing.toggleTestingPeekHistory'; }
        constructor() {
            super({
                id: $NKb.ID,
                f1: true,
                title: { value: (0, nls_1.localize)(24, null), original: 'Toggle Test History in Peek' },
                icon: codicons_1.$Pj.history,
                category: actionCommonCategories_1.$Nl.Test,
                menu: [{
                        id: actions_2.$Ru.TestPeekTitle,
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
            const opener = accessor.get(testingPeekOpener_1.$kKb);
            opener.historyVisible.value = !opener.historyVisible.value;
        }
    }
    exports.$NKb = $NKb;
    class CreationCache {
        constructor() {
            this.d = new WeakMap();
        }
        get(key) {
            return this.d.get(key);
        }
        getOrCreate(ref, factory) {
            const existing = this.d.get(ref);
            if (existing) {
                return existing;
            }
            const fresh = factory();
            this.d.set(ref, fresh);
            return fresh;
        }
    }
});
//# sourceMappingURL=testingOutputPeek.js.map