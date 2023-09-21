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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/dataTransfer", "vs/base/common/lifecycle", "vs/base/common/mime", "vs/base/common/platform", "vs/base/common/uuid", "vs/editor/browser/controller/textAreaInput", "vs/editor/browser/dnd", "vs/editor/browser/services/bulkEditService", "vs/editor/common/core/range", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/dropOrPasteInto/browser/edit", "vs/editor/contrib/editorState/browser/editorState", "vs/editor/contrib/inlineProgress/browser/inlineProgress", "vs/nls!vs/editor/contrib/dropOrPasteInto/browser/copyPasteController", "vs/platform/clipboard/common/clipboardService", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/progress/common/progress", "vs/platform/quickinput/common/quickInput", "./postEditWidget"], function (require, exports, dom_1, arrays_1, async_1, dataTransfer_1, lifecycle_1, mime_1, platform, uuid_1, textAreaInput_1, dnd_1, bulkEditService_1, range_1, languageFeatures_1, edit_1, editorState_1, inlineProgress_1, nls_1, clipboardService_1, contextkey_1, instantiation_1, progress_1, quickInput_1, postEditWidget_1) {
    "use strict";
    var $i7_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$i7 = exports.$h7 = exports.$g7 = void 0;
    exports.$g7 = 'editor.changePasteType';
    exports.$h7 = new contextkey_1.$2i('pasteWidgetVisible', false, (0, nls_1.localize)(0, null));
    const vscodeClipboardMime = 'application/vnd.code.copyMetadata';
    let $i7 = class $i7 extends lifecycle_1.$kc {
        static { $i7_1 = this; }
        static { this.ID = 'editor.contrib.copyPasteActionController'; }
        static get(editor) {
            return editor.getContribution($i7_1.ID);
        }
        constructor(editor, instantiationService, j, m, n, r, s) {
            super();
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.a = editor;
            const container = editor.getContainerDomNode();
            this.B((0, dom_1.$nO)(container, 'copy', e => this.u(e)));
            this.B((0, dom_1.$nO)(container, 'cut', e => this.u(e)));
            this.B((0, dom_1.$nO)(container, 'paste', e => this.w(e), true));
            this.g = this.B(new inlineProgress_1.$e7('pasteIntoEditor', editor, instantiationService));
            this.h = this.B(instantiationService.createInstance(postEditWidget_1.$f7, 'pasteIntoEditor', editor, exports.$h7, { id: exports.$g7, label: (0, nls_1.localize)(1, null) }));
        }
        changePasteType() {
            this.h.tryShowSelector();
        }
        pasteAs(preferredId) {
            this.a.focus();
            try {
                this.f = { preferredId };
                (0, dom_1.$WO)().execCommand('paste');
            }
            finally {
                this.f = undefined;
            }
        }
        clearWidgets() {
            this.h.clear();
        }
        t() {
            return this.a.getOption(84 /* EditorOption.pasteAs */).enabled
                && !this.a.getOption(90 /* EditorOption.readOnly */);
        }
        u(e) {
            if (!this.a.hasTextFocus()) {
                return;
            }
            if (platform.$o) {
                // Explicitly clear the web resources clipboard.
                // This is needed because on web, the browser clipboard is faked out using an in-memory store.
                // This means the resources clipboard is not properly updated when copying from the editor.
                this.m.writeResources([]);
            }
            if (!e.clipboardData || !this.t()) {
                return;
            }
            const model = this.a.getModel();
            const selections = this.a.getSelections();
            if (!model || !selections?.length) {
                return;
            }
            const enableEmptySelectionClipboard = this.a.getOption(37 /* EditorOption.emptySelectionClipboard */);
            let ranges = selections;
            const wasFromEmptySelection = selections.length === 1 && selections[0].isEmpty();
            if (wasFromEmptySelection) {
                if (!enableEmptySelectionClipboard) {
                    return;
                }
                ranges = [new range_1.$ks(ranges[0].startLineNumber, 1, ranges[0].startLineNumber, 1 + model.getLineLength(ranges[0].startLineNumber))];
            }
            const toCopy = this.a._getViewModel()?.getPlainTextToCopy(selections, enableEmptySelectionClipboard, platform.$i);
            const multicursorText = Array.isArray(toCopy) ? toCopy : null;
            const defaultPastePayload = {
                multicursorText,
                pasteOnNewLine: wasFromEmptySelection,
                mode: null
            };
            const providers = this.n.documentPasteEditProvider
                .ordered(model)
                .filter(x => !!x.prepareDocumentPaste);
            if (!providers.length) {
                this.C(e.clipboardData, { defaultPastePayload });
                return;
            }
            const dataTransfer = (0, dnd_1.$a7)(e.clipboardData);
            const providerCopyMimeTypes = providers.flatMap(x => x.copyMimeTypes ?? []);
            // Save off a handle pointing to data that VS Code maintains.
            const handle = (0, uuid_1.$4f)();
            this.C(e.clipboardData, {
                id: handle,
                providerCopyMimeTypes,
                defaultPastePayload
            });
            const promise = (0, async_1.$ug)(async (token) => {
                const results = (0, arrays_1.$Fb)(await Promise.all(providers.map(async (provider) => {
                    try {
                        return await provider.prepareDocumentPaste(model, ranges, dataTransfer, token);
                    }
                    catch (err) {
                        console.error(err);
                        return undefined;
                    }
                })));
                // Values from higher priority providers should overwrite values from lower priority ones.
                // Reverse the array to so that the calls to `replace` below will do this
                results.reverse();
                for (const result of results) {
                    for (const [mime, value] of result) {
                        dataTransfer.replace(mime, value);
                    }
                }
                return dataTransfer;
            });
            this.b?.dataTransferPromise.cancel();
            this.b = { handle: handle, dataTransferPromise: promise };
        }
        async w(e) {
            if (!e.clipboardData || !this.a.hasTextFocus()) {
                return;
            }
            this.c?.cancel();
            this.c = undefined;
            const model = this.a.getModel();
            const selections = this.a.getSelections();
            if (!selections?.length || !model) {
                return;
            }
            if (!this.t()) {
                return;
            }
            const metadata = this.D(e);
            const dataTransfer = (0, dnd_1.$b7)(e.clipboardData);
            dataTransfer.delete(vscodeClipboardMime);
            const allPotentialMimeTypes = [
                ...e.clipboardData.types,
                ...metadata?.providerCopyMimeTypes ?? [],
                // TODO: always adds `uri-list` because this get set if there are resources in the system clipboard.
                // However we can only check the system clipboard async. For this early check, just add it in.
                // We filter providers again once we have the final dataTransfer we will use.
                mime_1.$Hr.uriList,
            ];
            const allProviders = this.n.documentPasteEditProvider
                .ordered(model)
                .filter(provider => provider.pasteMimeTypes?.some(type => (0, dataTransfer_1.$Ss)(type, allPotentialMimeTypes)));
            if (!allProviders.length) {
                return;
            }
            // Prevent the editor's default paste handler from running.
            // Note that after this point, we are fully responsible for handling paste.
            // If we can't provider a paste for any reason, we need to explicitly delegate pasting back to the editor.
            e.preventDefault();
            e.stopImmediatePropagation();
            if (this.f) {
                this.z(this.f.preferredId, allProviders, selections, dataTransfer, metadata);
            }
            else {
                this.y(allProviders, selections, dataTransfer, metadata);
            }
        }
        y(allProviders, selections, dataTransfer, metadata) {
            const p = (0, async_1.$ug)(async (token) => {
                const editor = this.a;
                if (!editor.hasModel()) {
                    return;
                }
                const model = editor.getModel();
                const tokenSource = new editorState_1.$t1(editor, 1 /* CodeEditorStateFlag.Value */ | 2 /* CodeEditorStateFlag.Selection */, undefined, token);
                try {
                    await this.F(dataTransfer, metadata, tokenSource.token);
                    if (tokenSource.token.isCancellationRequested) {
                        return;
                    }
                    // Filter out any providers the don't match the full data transfer we will send them.
                    const supportedProviders = allProviders.filter(provider => isSupportedPasteProvider(provider, dataTransfer));
                    if (!supportedProviders.length
                        || (supportedProviders.length === 1 && supportedProviders[0].id === 'text') // Only our default text provider is active
                    ) {
                        await this.H(dataTransfer, metadata, tokenSource.token);
                        return;
                    }
                    const providerEdits = await this.G(supportedProviders, dataTransfer, model, selections, tokenSource.token);
                    if (tokenSource.token.isCancellationRequested) {
                        return;
                    }
                    // If the only edit returned is a text edit, use the default paste handler
                    if (providerEdits.length === 1 && providerEdits[0].providerId === 'text') {
                        await this.H(dataTransfer, metadata, tokenSource.token);
                        return;
                    }
                    if (providerEdits.length) {
                        const canShowWidget = editor.getOption(84 /* EditorOption.pasteAs */).showPasteSelector === 'afterPaste';
                        return this.h.applyEditAndShowIfNeeded(selections, { activeEditIndex: 0, allEdits: providerEdits }, canShowWidget, tokenSource.token);
                    }
                    await this.H(dataTransfer, metadata, tokenSource.token);
                }
                finally {
                    tokenSource.dispose();
                    if (this.c === p) {
                        this.c = undefined;
                    }
                }
            });
            this.g.showWhile(selections[0].getEndPosition(), (0, nls_1.localize)(2, null), p);
            this.c = p;
        }
        z(preferredId, allProviders, selections, dataTransfer, metadata) {
            const p = (0, async_1.$ug)(async (token) => {
                const editor = this.a;
                if (!editor.hasModel()) {
                    return;
                }
                const model = editor.getModel();
                const tokenSource = new editorState_1.$t1(editor, 1 /* CodeEditorStateFlag.Value */ | 2 /* CodeEditorStateFlag.Selection */, undefined, token);
                try {
                    await this.F(dataTransfer, metadata, tokenSource.token);
                    if (tokenSource.token.isCancellationRequested) {
                        return;
                    }
                    // Filter out any providers the don't match the full data transfer we will send them.
                    let supportedProviders = allProviders.filter(provider => isSupportedPasteProvider(provider, dataTransfer));
                    if (preferredId) {
                        // We are looking for a specific edit
                        supportedProviders = supportedProviders.filter(edit => edit.id === preferredId);
                    }
                    const providerEdits = await this.G(supportedProviders, dataTransfer, model, selections, tokenSource.token);
                    if (tokenSource.token.isCancellationRequested) {
                        return;
                    }
                    if (!providerEdits.length) {
                        return;
                    }
                    let pickedEdit;
                    if (preferredId) {
                        pickedEdit = providerEdits.at(0);
                    }
                    else {
                        const selected = await this.r.pick(providerEdits.map((edit) => ({
                            label: edit.label,
                            description: edit.providerId,
                            detail: edit.detail,
                            edit,
                        })), {
                            placeHolder: (0, nls_1.localize)(3, null),
                        });
                        pickedEdit = selected?.edit;
                    }
                    if (!pickedEdit) {
                        return;
                    }
                    const combinedWorkspaceEdit = (0, edit_1.$c7)(model.uri, selections, pickedEdit);
                    await this.j.apply(combinedWorkspaceEdit, { editor: this.a });
                }
                finally {
                    tokenSource.dispose();
                    if (this.c === p) {
                        this.c = undefined;
                    }
                }
            });
            this.s.withProgress({
                location: 10 /* ProgressLocation.Window */,
                title: (0, nls_1.localize)(4, null),
            }, () => p);
        }
        C(dataTransfer, metadata) {
            dataTransfer.setData(vscodeClipboardMime, JSON.stringify(metadata));
        }
        D(e) {
            if (!e.clipboardData) {
                return;
            }
            // Prefer using the clipboard data we saved off
            const rawMetadata = e.clipboardData.getData(vscodeClipboardMime);
            if (rawMetadata) {
                try {
                    return JSON.parse(rawMetadata);
                }
                catch {
                    return undefined;
                }
            }
            // Otherwise try to extract the generic text editor metadata
            const [_, metadata] = textAreaInput_1.$aX.getTextData(e.clipboardData);
            if (metadata) {
                return {
                    defaultPastePayload: {
                        mode: metadata.mode,
                        multicursorText: metadata.multicursorText ?? null,
                        pasteOnNewLine: !!metadata.isFromEmptySelection,
                    },
                };
            }
            return undefined;
        }
        async F(dataTransfer, metadata, token) {
            if (metadata?.id && this.b?.handle === metadata.id) {
                const toMergeDataTransfer = await this.b.dataTransferPromise;
                if (token.isCancellationRequested) {
                    return;
                }
                for (const [key, value] of toMergeDataTransfer) {
                    dataTransfer.replace(key, value);
                }
            }
            if (!dataTransfer.has(mime_1.$Hr.uriList)) {
                const resources = await this.m.readResources();
                if (token.isCancellationRequested) {
                    return;
                }
                if (resources.length) {
                    dataTransfer.append(mime_1.$Hr.uriList, (0, dataTransfer_1.$Ps)(dataTransfer_1.$Ts.create(resources)));
                }
            }
        }
        async G(providers, dataTransfer, model, selections, token) {
            const results = await (0, async_1.$vg)(Promise.all(providers.map(async (provider) => {
                try {
                    const edit = await provider.provideDocumentPasteEdits?.(model, selections, dataTransfer, token);
                    if (edit) {
                        return { ...edit, providerId: provider.id };
                    }
                }
                catch (err) {
                    console.error(err);
                }
                return undefined;
            })), token);
            const edits = (0, arrays_1.$Fb)(results ?? []);
            (0, edit_1.$d7)(edits);
            return edits;
        }
        async H(dataTransfer, metadata, token) {
            const textDataTransfer = dataTransfer.get(mime_1.$Hr.text) ?? dataTransfer.get('text');
            if (!textDataTransfer) {
                return;
            }
            const text = await textDataTransfer.asString();
            if (token.isCancellationRequested) {
                return;
            }
            const payload = {
                text,
                pasteOnNewLine: metadata?.defaultPastePayload.pasteOnNewLine ?? false,
                multicursorText: metadata?.defaultPastePayload.multicursorText ?? null,
                mode: null,
            };
            this.a.trigger('keyboard', "paste" /* Handler.Paste */, payload);
        }
    };
    exports.$i7 = $i7;
    exports.$i7 = $i7 = $i7_1 = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, bulkEditService_1.$n1),
        __param(3, clipboardService_1.$UZ),
        __param(4, languageFeatures_1.$hF),
        __param(5, quickInput_1.$Gq),
        __param(6, progress_1.$2u)
    ], $i7);
    function isSupportedPasteProvider(provider, dataTransfer) {
        return Boolean(provider.pasteMimeTypes?.some(type => dataTransfer.matches(type)));
    }
});
//# sourceMappingURL=copyPasteController.js.map