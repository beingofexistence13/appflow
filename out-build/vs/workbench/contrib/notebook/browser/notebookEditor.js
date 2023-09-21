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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/actions", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/base/common/uuid", "vs/editor/common/services/textResourceConfiguration", "vs/nls!vs/workbench/contrib/notebook/browser/notebookEditor", "vs/platform/contextkey/common/contextkey", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/common/editor", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/workbench/contrib/notebook/browser/services/notebookEditorService", "vs/workbench/contrib/notebook/browser/viewParts/notebookKernelView", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookEditorInput", "vs/workbench/contrib/notebook/common/notebookPerformance", "vs/workbench/services/editor/browser/editorDropService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/platform/progress/common/progress", "vs/workbench/contrib/extensions/browser/extensionsActions", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/base/common/buffer", "vs/platform/log/common/log", "vs/workbench/contrib/notebook/common/services/notebookWorkerService"], function (require, exports, DOM, actions_1, async_1, event_1, lifecycle_1, resources_1, uuid_1, textResourceConfiguration_1, nls_1, contextkey_1, files_1, instantiation_1, storage_1, telemetry_1, themeService_1, editorPane_1, editor_1, coreActions_1, notebookEditorService_1, notebookKernelView_1, notebookCommon_1, notebookEditorInput_1, notebookPerformance_1, editorDropService_1, editorGroupsService_1, editorService_1, progress_1, extensionsActions_1, notebookService_1, extensions_1, workingCopyBackup_1, buffer_1, log_1, notebookWorkerService_1) {
    "use strict";
    var $lEb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$lEb = void 0;
    const NOTEBOOK_EDITOR_VIEW_STATE_PREFERENCE_KEY = 'NotebookEditorViewState';
    let $lEb = class $lEb extends editorPane_1.$0T {
        static { $lEb_1 = this; }
        static { this.ID = notebookCommon_1.$TH; }
        get onDidFocus() { return this.r.event; }
        get onDidBlur() { return this.s.event; }
        constructor(telemetryService, themeService, eb, storageService, fb, gb, hb, ib, jb, kb, configurationService, lb, mb, nb, ob, pb, qb) {
            super($lEb_1.ID, telemetryService, themeService, storageService);
            this.eb = eb;
            this.fb = fb;
            this.gb = gb;
            this.hb = hb;
            this.ib = ib;
            this.jb = jb;
            this.kb = kb;
            this.lb = lb;
            this.mb = mb;
            this.nb = nb;
            this.ob = ob;
            this.pb = pb;
            this.qb = qb;
            this.b = this.B(new lifecycle_1.$jc());
            this.c = this.B(new lifecycle_1.$jc());
            this.f = { value: undefined };
            this.m = this.B(new lifecycle_1.$lc());
            // override onDidFocus and onDidBlur to be based on the NotebookEditorWidget element
            this.r = this.B(new event_1.$fd());
            this.s = this.B(new event_1.$fd());
            this.u = this.B(new event_1.$fd());
            this.onDidChangeModel = this.u.event;
            this.y = this.B(new event_1.$fd());
            this.onDidChangeSelection = this.y.event;
            this.a = this.cb(gb, configurationService, NOTEBOOK_EDITOR_VIEW_STATE_PREFERENCE_KEY);
            this.B(this.kb.onDidChangeFileSystemProviderCapabilities(e => this.rb(e.scheme)));
            this.B(this.kb.onDidChangeFileSystemProviderRegistrations(e => this.rb(e.scheme)));
        }
        rb(scheme) {
            if (this.input instanceof notebookEditorInput_1.$zbb && this.input.resource?.scheme === scheme) {
                this.tb(this.input);
            }
        }
        sb(input) {
            if (this.input === input) {
                this.tb(input);
            }
        }
        tb(input) {
            this.f.value?.setOptions({ isReadOnly: !!input.isReadonly() });
        }
        get textModel() {
            return this.f.value?.textModel;
        }
        get minimumWidth() { return 220; }
        get maximumWidth() { return Number.POSITIVE_INFINITY; }
        // these setters need to exist because this extends from EditorPane
        set minimumWidth(value) { }
        set maximumWidth(value) { }
        //#region Editor Core
        get scopedContextKeyService() {
            return this.f.value?.scopedContextKeyService;
        }
        ab(parent) {
            this.g = DOM.$0O(parent, DOM.$('.notebook-editor'));
            this.g.id = `notebook-editor-element-${(0, uuid_1.$4f)()}`;
        }
        getActionViewItem(action) {
            if (action.id === coreActions_1.$6ob) {
                // this is being disposed by the consumer
                return this.eb.createInstance(notebookKernelView_1.$$qb, action, this);
            }
            return undefined;
        }
        getControl() {
            return this.f.value;
        }
        bb(visible, group) {
            super.bb(visible, group);
            if (group) {
                this.b.clear();
                this.b.add(group.onWillCloseEditor(e => this.zb(e.editor)));
                this.b.add(group.onDidModelChange(() => {
                    if (this.gb.activeGroup !== group) {
                        this.f?.value?.updateEditorFocus();
                    }
                }));
            }
            if (!visible) {
                this.zb(this.input);
                if (this.input && this.f.value) {
                    // the widget is not transfered to other editor inputs
                    this.f.value.onWillHide();
                }
            }
        }
        focus() {
            super.focus();
            this.f.value?.focus();
        }
        hasFocus() {
            const activeElement = document.activeElement;
            const value = this.f.value;
            return !!value && (DOM.$NO(activeElement, value.getDomNode() || DOM.$NO(activeElement, value.getOverflowContainerDomNode())));
        }
        async setInput(input, options, context, token, noRetry) {
            try {
                let perfMarksCaptured = false;
                const fileOpenMonitor = (0, async_1.$Hg)(10000);
                fileOpenMonitor.then(() => {
                    perfMarksCaptured = true;
                    this.wb(perf, input);
                });
                const perf = new notebookPerformance_1.$ybb();
                perf.mark('startTime');
                const group = this.group;
                this.m.value = input.onDidChangeCapabilities(() => this.sb(input));
                this.c.clear();
                // there currently is a widget which we still own so
                // we need to hide it before getting a new widget
                this.f.value?.onWillHide();
                this.f = this.eb.invokeFunction(this.ib.retrieveWidget, group, input, undefined, this.j?.dimension);
                if (this.g && this.f.value.getDomNode()) {
                    this.g.setAttribute('aria-flowto', this.f.value.getDomNode().id || '');
                    DOM.$OO(this.f.value.getDomNode(), this.g);
                }
                this.c.add(this.f.value.onDidChangeModel(() => this.u.fire()));
                this.c.add(this.f.value.onDidChangeActiveCell(() => this.y.fire({ reason: 2 /* EditorPaneSelectionChangeReason.USER */ })));
                if (this.j) {
                    this.f.value.layout(this.j.dimension, this.g, this.j.position);
                }
                // only now `setInput` and yield/await. this is AFTER the actual widget is ready. This is very important
                // so that others synchronously receive a notebook editor with the correct widget being set
                await super.setInput(input, options, context, token);
                const model = await input.resolve(options, perf);
                perf.mark('inputLoaded');
                // Check for cancellation
                if (token.isCancellationRequested) {
                    return undefined;
                }
                // The widget has been taken away again. This can happen when the tab has been closed while
                // loading was in progress, in particular when open the same resource as different view type.
                // When this happen, retry once
                if (!this.f.value) {
                    if (noRetry) {
                        return undefined;
                    }
                    return this.setInput(input, options, context, token, true);
                }
                if (model === null) {
                    const knownProvider = this.mb.getViewTypeProvider(input.viewType);
                    if (!knownProvider) {
                        throw new Error((0, nls_1.localize)(0, null, input.viewType));
                    }
                    await this.nb.whenInitialized;
                    const extensionInfo = this.nb.local.find(e => e.identifier.id === knownProvider);
                    throw (0, editor_1.$7E)(new Error((0, nls_1.localize)(1, null, input.viewType)), [
                        (0, actions_1.$li)({
                            id: 'workbench.notebook.action.installOrEnableMissing', label: extensionInfo
                                ? (0, nls_1.localize)(2, null, input.viewType)
                                : (0, nls_1.localize)(3, null, input.viewType),
                            run: async () => {
                                const d = this.mb.onAddViewType(viewType => {
                                    if (viewType === input.viewType) {
                                        // serializer is registered, try to open again
                                        this.fb.openEditor({ resource: input.resource });
                                        d.dispose();
                                    }
                                });
                                const extensionInfo = this.nb.local.find(e => e.identifier.id === knownProvider);
                                try {
                                    if (extensionInfo) {
                                        await this.nb.setEnablement(extensionInfo, extensionInfo.enablementState === 7 /* EnablementState.DisabledWorkspace */ ? 9 /* EnablementState.EnabledWorkspace */ : 8 /* EnablementState.EnabledGlobally */);
                                    }
                                    else {
                                        await this.eb.createInstance(extensionsActions_1.$Zhb, knownProvider).run();
                                    }
                                }
                                catch (ex) {
                                    this.pb.error(`Failed to install or enable extension ${knownProvider}`, ex);
                                    d.dispose();
                                }
                            }
                        }),
                        (0, actions_1.$li)({
                            id: 'workbench.notebook.action.openAsText', label: (0, nls_1.localize)(4, null), run: async () => {
                                const backup = await this.ob.resolve({ resource: input.resource, typeId: notebookCommon_1.$8H.create(input.viewType) });
                                if (backup) {
                                    // with a backup present, we must resort to opening the backup contents
                                    // as untitled text file to not show the wrong data to the user
                                    const contents = await (0, buffer_1.$Rd)(backup.value);
                                    this.fb.openEditor({ resource: undefined, contents: contents.toString() });
                                }
                                else {
                                    // without a backup present, we can open the original resource
                                    this.fb.openEditor({ resource: input.resource, options: { override: editor_1.$HE.id, pinned: true } });
                                }
                            }
                        })
                    ], { allowDialog: true });
                }
                this.c.add(model.notebook.onDidChangeContent(() => this.y.fire({ reason: 3 /* EditorPaneSelectionChangeReason.EDIT */ })));
                const viewState = options?.viewState ?? this.Ab(input);
                // We might be moving the notebook widget between groups, and these services are tied to the group
                this.f.value.setParentContextKeyService(this.jb);
                this.f.value.setEditorProgressService(this.lb);
                await this.f.value.setModel(model.notebook, viewState, perf);
                const isReadOnly = !!input.isReadonly();
                await this.f.value.setOptions({ ...options, isReadOnly });
                this.c.add(this.f.value.onDidFocusWidget(() => this.r.fire()));
                this.c.add(this.f.value.onDidBlurWidget(() => this.s.fire()));
                this.c.add(this.hb.createEditorDropTarget(this.f.value.getDomNode(), {
                    containsGroup: (group) => this.group?.id === group.id
                }));
                perf.mark('editorLoaded');
                fileOpenMonitor.cancel();
                if (perfMarksCaptured) {
                    return;
                }
                this.wb(perf, input);
                this.xb(model.notebook);
            }
            catch (e) {
                this.pb.warn('NotebookEditorWidget#setInput failed', e);
                if ((0, editor_1.$6E)(e)) {
                    throw e;
                }
                const error = (0, editor_1.$7E)(e instanceof Error ? e : new Error((e ? e.message : '')), [
                    (0, actions_1.$li)({
                        id: 'workbench.notebook.action.openInTextEditor', label: (0, nls_1.localize)(5, null), run: async () => {
                            const activeEditorPane = this.fb.activeEditorPane;
                            if (!activeEditorPane) {
                                return;
                            }
                            const activeEditorResource = editor_1.$3E.getCanonicalUri(activeEditorPane.input);
                            if (!activeEditorResource) {
                                return;
                            }
                            if (activeEditorResource.toString() === input.resource?.toString()) {
                                // Replace the current editor with the text editor
                                return this.fb.openEditor({
                                    resource: activeEditorResource,
                                    options: {
                                        override: editor_1.$HE.id,
                                        pinned: true // new file gets pinned by default
                                    }
                                });
                            }
                            return;
                        }
                    })
                ], { allowDialog: true });
                throw error;
            }
        }
        wb(perf, input) {
            const perfMarks = perf.value;
            const startTime = perfMarks['startTime'];
            const extensionActivated = perfMarks['extensionActivated'];
            const inputLoaded = perfMarks['inputLoaded'];
            const customMarkdownLoaded = perfMarks['customMarkdownLoaded'];
            const editorLoaded = perfMarks['editorLoaded'];
            let extensionActivationTimespan = -1;
            let inputLoadingTimespan = -1;
            let webviewCommLoadingTimespan = -1;
            let customMarkdownLoadingTimespan = -1;
            let editorLoadingTimespan = -1;
            if (startTime !== undefined && extensionActivated !== undefined) {
                extensionActivationTimespan = extensionActivated - startTime;
                if (inputLoaded !== undefined) {
                    inputLoadingTimespan = inputLoaded - extensionActivated;
                    webviewCommLoadingTimespan = inputLoaded - extensionActivated; // TODO@rebornix, we don't track webview comm anymore
                }
                if (customMarkdownLoaded !== undefined) {
                    customMarkdownLoadingTimespan = customMarkdownLoaded - startTime;
                }
                if (editorLoaded !== undefined) {
                    editorLoadingTimespan = editorLoaded - startTime;
                }
            }
            this.P.publicLog2('notebook/editorOpenPerf', {
                scheme: input.resource.scheme,
                ext: (0, resources_1.$gg)(input.resource),
                viewType: input.viewType,
                extensionActivated: extensionActivationTimespan,
                inputLoaded: inputLoadingTimespan,
                webviewCommLoaded: webviewCommLoadingTimespan,
                customMarkdownLoaded: customMarkdownLoadingTimespan,
                editorLoaded: editorLoadingTimespan
            });
        }
        xb(model) {
            this.qb.canPromptRecommendation(model.uri).then(shouldPrompt => {
                this.P.publicLog2('notebook/shouldPromptRecommendation', {
                    shouldPrompt: shouldPrompt
                });
            });
        }
        clearInput() {
            this.m.clear();
            if (this.f.value) {
                this.zb(this.input);
                this.f.value.onWillHide();
            }
            super.clearInput();
        }
        setOptions(options) {
            this.f.value?.setOptions(options);
            super.setOptions(options);
        }
        G() {
            this.zb(this.input);
            super.G();
        }
        getViewState() {
            const input = this.input;
            if (!(input instanceof notebookEditorInput_1.$zbb)) {
                return undefined;
            }
            this.zb(input);
            return this.Ab(input);
        }
        getSelection() {
            if (this.f.value) {
                const activeCell = this.f.value.getActiveCell();
                if (activeCell) {
                    const cellUri = activeCell.uri;
                    return new NotebookEditorSelection(cellUri, activeCell.getSelections());
                }
            }
            return undefined;
        }
        zb(input) {
            if (this.group && this.f.value && input instanceof notebookEditorInput_1.$zbb) {
                if (this.f.value.isDisposed) {
                    return;
                }
                const state = this.f.value.getEditorViewState();
                this.a.saveEditorState(this.group, input.resource, state);
            }
        }
        Ab(input) {
            let result;
            if (this.group) {
                result = this.a.loadEditorState(this.group, input.resource);
            }
            if (result) {
                return result;
            }
            // when we don't have a view state for the group/input-tuple then we try to use an existing
            // editor for the same resource.
            for (const group of this.gb.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */)) {
                if (group.activeEditorPane !== this && group.activeEditorPane instanceof $lEb_1 && group.activeEditor?.matches(input)) {
                    return group.activeEditorPane.f.value?.getEditorViewState();
                }
            }
            return;
        }
        layout(dimension, position) {
            this.g.classList.toggle('mid-width', dimension.width < 1000 && dimension.width >= 600);
            this.g.classList.toggle('narrow-width', dimension.width < 600);
            this.j = { dimension, position };
            if (!this.f.value || !(this.X instanceof notebookEditorInput_1.$zbb)) {
                return;
            }
            if (this.X.resource.toString() !== this.textModel?.uri.toString() && this.f.value?.hasModel()) {
                // input and widget mismatch
                // this happens when
                // 1. open document A, pin the document
                // 2. open document B
                // 3. close document B
                // 4. a layout is triggered
                return;
            }
            this.f.value.layout(dimension, this.g, position);
        }
    };
    exports.$lEb = $lEb;
    exports.$lEb = $lEb = $lEb_1 = __decorate([
        __param(0, telemetry_1.$9k),
        __param(1, themeService_1.$gv),
        __param(2, instantiation_1.$Ah),
        __param(3, storage_1.$Vo),
        __param(4, editorService_1.$9C),
        __param(5, editorGroupsService_1.$5C),
        __param(6, editorDropService_1.$efb),
        __param(7, notebookEditorService_1.$1rb),
        __param(8, contextkey_1.$3i),
        __param(9, files_1.$6j),
        __param(10, textResourceConfiguration_1.$FA),
        __param(11, progress_1.$7u),
        __param(12, notebookService_1.$ubb),
        __param(13, extensions_1.$Pfb),
        __param(14, workingCopyBackup_1.$EA),
        __param(15, log_1.$5i),
        __param(16, notebookWorkerService_1.$kEb)
    ], $lEb);
    class NotebookEditorSelection {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        compare(other) {
            if (!(other instanceof NotebookEditorSelection)) {
                return 3 /* EditorPaneSelectionCompareResult.DIFFERENT */;
            }
            if ((0, resources_1.$bg)(this.a, other.a)) {
                return 1 /* EditorPaneSelectionCompareResult.IDENTICAL */;
            }
            return 3 /* EditorPaneSelectionCompareResult.DIFFERENT */;
        }
        restore(options) {
            const notebookOptions = {
                cellOptions: {
                    resource: this.a,
                    options: {
                        selection: this.b[0]
                    }
                }
            };
            Object.assign(notebookOptions, options);
            return notebookOptions;
        }
        log() {
            return this.a.fragment;
        }
    }
});
//# sourceMappingURL=notebookEditor.js.map