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
define(["require", "exports", "vs/base/common/resources", "vs/base/common/event", "vs/editor/browser/services/bulkEditService", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/editor/common/core/range", "vs/platform/instantiation/common/instantiation", "vs/platform/telemetry/common/telemetry", "vs/editor/common/services/model", "vs/editor/common/services/resolverService", "vs/base/common/lifecycle", "vs/editor/common/model/textModel", "vs/platform/log/common/log", "vs/base/common/iterator", "vs/base/common/errorMessage", "vs/base/common/errors", "vs/base/common/async"], function (require, exports, resources_1, event_1, bulkEditService_1, inlineChat_1, range_1, instantiation_1, telemetry_1, model_1, resolverService_1, lifecycle_1, textModel_1, log_1, iterator_1, errorMessage_1, errors_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$cqb = exports.$bqb = exports.$aqb = exports.$_pb = exports.$$pb = exports.$0pb = exports.$9pb = exports.$8pb = exports.$7pb = exports.ExpansionState = void 0;
    var ExpansionState;
    (function (ExpansionState) {
        ExpansionState["EXPANDED"] = "expanded";
        ExpansionState["CROPPED"] = "cropped";
        ExpansionState["NOT_CROPPED"] = "not_cropped";
    })(ExpansionState || (exports.ExpansionState = ExpansionState = {}));
    class SessionWholeRange {
        static { this.a = { description: 'inlineChat/session/wholeRange' }; }
        constructor(d, wholeRange) {
            this.d = d;
            this.b = new event_1.$fd();
            this.onDidChange = this.b.event;
            this.c = [];
            this.c = d.deltaDecorations([], [{ range: wholeRange, options: SessionWholeRange.a }]);
        }
        dispose() {
            this.b.dispose();
            if (!this.d.isDisposed()) {
                this.d.deltaDecorations(this.c, []);
            }
        }
        trackEdits(edits) {
            const newDeco = [];
            for (const edit of edits) {
                newDeco.push({ range: edit.range, options: SessionWholeRange.a });
            }
            this.c.push(...this.d.deltaDecorations([], newDeco));
            this.b.fire(this);
        }
        get value() {
            let result;
            for (const id of this.c) {
                const range = this.d.getDecorationRange(id);
                if (range) {
                    if (!result) {
                        result = range;
                    }
                    else {
                        result = range_1.$ks.plusRange(result, range);
                    }
                }
            }
            return result;
        }
    }
    class $7pb {
        constructor(editMode, editor, textModel0, textModelN, provider, session, wholeRange) {
            this.editMode = editMode;
            this.editor = editor;
            this.textModel0 = textModel0;
            this.textModelN = textModelN;
            this.provider = provider;
            this.session = session;
            this.wholeRange = wholeRange;
            this.d = false;
            this.e = [];
            this.f = new Date();
            this.textModelNAltVersion = textModelN.getAlternativeVersionId();
            this.g = {
                extension: provider.debugName,
                startTime: this.f.toISOString(),
                edits: false,
                rounds: '',
                undos: '',
                editMode
            };
        }
        addInput(input) {
            this.a = input;
        }
        get lastInput() {
            return this.a;
        }
        get isUnstashed() {
            return this.d;
        }
        markUnstashed() {
            this.d = true;
        }
        get lastExpansionState() {
            return this.b;
        }
        set lastExpansionState(state) {
            this.b = state;
        }
        get textModelNSnapshotAltVersion() {
            return this.h;
        }
        createSnapshot() {
            this.h = this.textModelN.getAlternativeVersionId();
        }
        addExchange(exchange) {
            this.d = false;
            const newLen = this.e.push(exchange);
            this.g.rounds += `${newLen}|`;
        }
        get exchanges() {
            return this.e;
        }
        get lastExchange() {
            return this.e[this.e.length - 1];
        }
        get lastTextModelChanges() {
            return this.c ?? [];
        }
        set lastTextModelChanges(changes) {
            this.c = changes;
        }
        get hasChangedText() {
            return !this.textModel0.equalsTextBuffer(this.textModelN.getTextBuffer());
        }
        asChangedText() {
            if (!this.c || this.c.length === 0) {
                return undefined;
            }
            let startLine = Number.MAX_VALUE;
            let endLine = Number.MIN_VALUE;
            for (const change of this.c) {
                startLine = Math.min(startLine, change.modified.startLineNumber);
                endLine = Math.max(endLine, change.modified.endLineNumberExclusive);
            }
            return this.textModelN.getValueInRange(new range_1.$ks(startLine, 1, endLine, Number.MAX_VALUE));
        }
        recordExternalEditOccurred(didFinish) {
            this.g.edits = true;
            this.g.finishedByEdit = didFinish;
        }
        asTelemetryData() {
            return {
                ...this.g,
                endTime: new Date().toISOString(),
            };
        }
        asRecording() {
            const result = {
                session: this.session,
                when: this.f,
                exchanges: []
            };
            for (const exchange of this.e) {
                const response = exchange.response;
                if (response instanceof $_pb || response instanceof $aqb) {
                    result.exchanges.push({ prompt: exchange.prompt.value, res: response.raw });
                }
            }
            return result;
        }
    }
    exports.$7pb = $7pb;
    class $8pb {
        constructor(value) {
            this.value = value;
            this.a = 0;
        }
        get attempt() {
            return this.a;
        }
        retry() {
            const result = new $8pb(this.value);
            result.a = this.a + 1;
            return result;
        }
    }
    exports.$8pb = $8pb;
    class $9pb {
        constructor(prompt, response) {
            this.prompt = prompt;
            this.response = response;
        }
    }
    exports.$9pb = $9pb;
    class $0pb {
    }
    exports.$0pb = $0pb;
    class $$pb {
        constructor(error) {
            this.error = error;
            this.message = (0, errorMessage_1.$mi)(error, false);
            this.isCancellation = (0, errors_1.$2)(error);
        }
    }
    exports.$$pb = $$pb;
    class $_pb {
        constructor(localUri, raw) {
            this.localUri = localUri;
            this.raw = raw;
        }
    }
    exports.$_pb = $_pb;
    class $aqb {
        constructor(localUri, modelAltVersionId, raw, progressEdits) {
            this.modelAltVersionId = modelAltVersionId;
            this.raw = raw;
            this.allLocalEdits = [];
            this.workspaceEditsIncludeLocalEdits = false;
            this.allLocalEdits.push(...progressEdits);
            if (raw.type === 'editorEdit') {
                //
                this.allLocalEdits.push(raw.edits);
                this.singleCreateFileEdit = undefined;
                this.workspaceEdits = undefined;
            }
            else {
                //
                const edits = bulkEditService_1.$o1.convert(raw.edits);
                this.workspaceEdits = edits;
                let isComplexEdit = false;
                const localEdits = [];
                for (const edit of edits) {
                    if (edit instanceof bulkEditService_1.$q1) {
                        if (!isComplexEdit && edit.newResource && !edit.oldResource) {
                            // file create
                            if (this.singleCreateFileEdit) {
                                isComplexEdit = true;
                                this.singleCreateFileEdit = undefined;
                            }
                            else {
                                this.singleCreateFileEdit = { uri: edit.newResource, edits: [] };
                                if (edit.options.contents) {
                                    this.singleCreateFileEdit.edits.push(edit.options.contents.then(x => ({ range: new range_1.$ks(1, 1, 1, 1), text: x.toString() })));
                                }
                            }
                        }
                    }
                    else if (edit instanceof bulkEditService_1.$p1) {
                        //
                        if ((0, resources_1.$bg)(edit.resource, localUri)) {
                            localEdits.push(edit.textEdit);
                            this.workspaceEditsIncludeLocalEdits = true;
                        }
                        else if ((0, resources_1.$bg)(this.singleCreateFileEdit?.uri, edit.resource)) {
                            this.singleCreateFileEdit.edits.push(Promise.resolve(edit.textEdit));
                        }
                        else {
                            isComplexEdit = true;
                        }
                    }
                }
                if (localEdits.length > 0) {
                    this.allLocalEdits.push(localEdits);
                }
                if (isComplexEdit) {
                    this.singleCreateFileEdit = undefined;
                }
            }
        }
    }
    exports.$aqb = $aqb;
    exports.$bqb = (0, instantiation_1.$Bh)('IInlineChatSessionService');
    let $cqb = class $cqb {
        constructor(f, g, h, i, j) {
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.a = new event_1.$fd();
            this.onWillStartSession = this.a.event;
            this.b = new event_1.$fd();
            this.onDidEndSession = this.b.event;
            this.c = new Map();
            this.d = new Map();
            this.e = [];
        }
        dispose() {
            this.a.dispose();
            this.b.dispose();
            this.c.forEach(x => x.store.dispose());
            this.c.clear();
        }
        async createSession(editor, options, token) {
            const provider = iterator_1.Iterable.first(this.f.getAllProvider());
            if (!provider) {
                this.j.trace('[IE] NO provider found');
                return undefined;
            }
            this.a.fire(editor);
            const textModel = editor.getModel();
            const selection = editor.getSelection();
            let raw;
            try {
                raw = await (0, async_1.$vg)(Promise.resolve(provider.prepareInlineChatSession(textModel, selection, token)), token);
            }
            catch (error) {
                this.j.error('[IE] FAILED to prepare session', provider.debugName);
                this.j.error(error);
                return undefined;
            }
            if (!raw) {
                this.j.trace('[IE] NO session', provider.debugName);
                return undefined;
            }
            this.j.trace('[IE] NEW session', provider.debugName);
            this.j.trace(`[IE] creating NEW session for ${editor.getId()},  ${provider.debugName}`);
            const store = new lifecycle_1.$jc();
            // create: keep a reference to prevent disposal of the "actual" model
            const refTextModelN = await this.i.createModelReference(textModel.uri);
            store.add(refTextModelN);
            // create: keep a snapshot of the "actual" model
            const textModel0 = this.h.createModel((0, textModel_1.$KC)(textModel.createSnapshot()), { languageId: textModel.getLanguageId(), onDidChange: event_1.Event.None }, undefined, true);
            store.add(textModel0);
            let wholeRange = options.wholeRange;
            if (!wholeRange) {
                wholeRange = raw.wholeRange ? range_1.$ks.lift(raw.wholeRange) : editor.getSelection();
            }
            // expand to whole lines
            wholeRange = new range_1.$ks(wholeRange.startLineNumber, 1, wholeRange.endLineNumber, textModel.getLineMaxColumn(wholeRange.endLineNumber));
            // install managed-marker for the decoration range
            const wholeRangeMgr = new SessionWholeRange(textModel, wholeRange);
            store.add(wholeRangeMgr);
            const session = new $7pb(options.editMode, editor, textModel0, textModel, provider, raw, wholeRangeMgr);
            // store: key -> session
            const key = this.k(editor, textModel.uri);
            if (this.c.has(key)) {
                store.dispose();
                throw new Error(`Session already stored for ${key}`);
            }
            this.c.set(key, { session, store });
            return session;
        }
        releaseSession(session) {
            const { editor } = session;
            // cleanup
            for (const [key, value] of this.c) {
                if (value.session === session) {
                    value.store.dispose();
                    this.c.delete(key);
                    this.j.trace(`[IE] did RELEASED session for ${editor.getId()}, ${session.provider.debugName}`);
                    break;
                }
            }
            // keep recording
            const newLen = this.e.unshift(session.asRecording());
            if (newLen > 5) {
                this.e.pop();
            }
            // send telemetry
            this.g.publicLog2('interactiveEditor/session', session.asTelemetryData());
            this.b.fire(editor);
        }
        getSession(editor, uri) {
            const key = this.k(editor, uri);
            return this.c.get(key)?.session;
        }
        k(editor, uri) {
            const item = this.d.get(uri.scheme);
            return item
                ? item.getComparisonKey(editor, uri)
                : `${editor.getId()}@${uri.toString()}`;
        }
        registerSessionKeyComputer(scheme, value) {
            this.d.set(scheme, value);
            return (0, lifecycle_1.$ic)(() => this.d.delete(scheme));
        }
        // --- debug
        recordings() {
            return this.e;
        }
    };
    exports.$cqb = $cqb;
    exports.$cqb = $cqb = __decorate([
        __param(0, inlineChat_1.$dz),
        __param(1, telemetry_1.$9k),
        __param(2, model_1.$yA),
        __param(3, resolverService_1.$uA),
        __param(4, log_1.$5i)
    ], $cqb);
});
//# sourceMappingURL=inlineChatSession.js.map