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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/dataTransfer", "vs/base/common/lifecycle", "vs/editor/browser/dnd", "vs/editor/common/core/range", "vs/editor/common/services/languageFeatures", "vs/editor/common/services/treeViewsDnd", "vs/editor/common/services/treeViewsDndService", "vs/editor/contrib/editorState/browser/editorState", "vs/editor/contrib/inlineProgress/browser/inlineProgress", "vs/nls!vs/editor/contrib/dropOrPasteInto/browser/dropIntoEditorController", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/dnd/browser/dnd", "vs/platform/instantiation/common/instantiation", "./edit", "./postEditWidget"], function (require, exports, arrays_1, async_1, dataTransfer_1, lifecycle_1, dnd_1, range_1, languageFeatures_1, treeViewsDnd_1, treeViewsDndService_1, editorState_1, inlineProgress_1, nls_1, configuration_1, contextkey_1, dnd_2, instantiation_1, edit_1, postEditWidget_1) {
    "use strict";
    var $r7_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$r7 = exports.$q7 = exports.$p7 = exports.$o7 = void 0;
    exports.$o7 = 'editor.experimental.dropIntoEditor.defaultProvider';
    exports.$p7 = 'editor.changeDropType';
    exports.$q7 = new contextkey_1.$2i('dropWidgetVisible', false, (0, nls_1.localize)(0, null));
    let $r7 = class $r7 extends lifecycle_1.$kc {
        static { $r7_1 = this; }
        static { this.ID = 'editor.contrib.dropIntoEditorController'; }
        static get(editor) {
            return editor.getContribution($r7_1.ID);
        }
        constructor(editor, instantiationService, g, h, j) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.f = dnd_2.$_6.getInstance();
            this.b = this.B(instantiationService.createInstance(inlineProgress_1.$e7, 'dropIntoEditor', editor));
            this.c = this.B(instantiationService.createInstance(postEditWidget_1.$f7, 'dropIntoEditor', editor, exports.$q7, { id: exports.$p7, label: (0, nls_1.localize)(1, null) }));
            this.B(editor.onDropIntoEditor(e => this.m(editor, e.position, e.event)));
        }
        clearWidgets() {
            this.c.clear();
        }
        changeDropType() {
            this.c.tryShowSelector();
        }
        async m(editor, position, dragEvent) {
            if (!dragEvent.dataTransfer || !editor.hasModel()) {
                return;
            }
            this.a?.cancel();
            editor.focus();
            editor.setPosition(position);
            const p = (0, async_1.$ug)(async (token) => {
                const tokenSource = new editorState_1.$t1(editor, 1 /* CodeEditorStateFlag.Value */, undefined, token);
                try {
                    const ourDataTransfer = await this.s(dragEvent);
                    if (ourDataTransfer.size === 0 || tokenSource.token.isCancellationRequested) {
                        return;
                    }
                    const model = editor.getModel();
                    if (!model) {
                        return;
                    }
                    const providers = this.h.documentOnDropEditProvider
                        .ordered(model)
                        .filter(provider => {
                        if (!provider.dropMimeTypes) {
                            // Keep all providers that don't specify mime types
                            return true;
                        }
                        return provider.dropMimeTypes.some(mime => ourDataTransfer.matches(mime));
                    });
                    const edits = await this.n(providers, model, position, ourDataTransfer, tokenSource);
                    if (tokenSource.token.isCancellationRequested) {
                        return;
                    }
                    if (edits.length) {
                        const activeEditIndex = this.r(model, edits);
                        const canShowWidget = editor.getOption(36 /* EditorOption.dropIntoEditor */).showDropSelector === 'afterDrop';
                        // Pass in the parent token here as it tracks cancelling the entire drop operation
                        await this.c.applyEditAndShowIfNeeded([range_1.$ks.fromPositions(position)], { activeEditIndex, allEdits: edits }, canShowWidget, token);
                    }
                }
                finally {
                    tokenSource.dispose();
                    if (this.a === p) {
                        this.a = undefined;
                    }
                }
            });
            this.b.showWhile(position, (0, nls_1.localize)(2, null), p);
            this.a = p;
        }
        async n(providers, model, position, dataTransfer, tokenSource) {
            const results = await (0, async_1.$vg)(Promise.all(providers.map(async (provider) => {
                try {
                    const edit = await provider.provideDocumentOnDropEdits(model, position, dataTransfer, tokenSource.token);
                    if (edit) {
                        return { ...edit, providerId: provider.id };
                    }
                }
                catch (err) {
                    console.error(err);
                }
                return undefined;
            })), tokenSource.token);
            const edits = (0, arrays_1.$Fb)(results ?? []);
            return (0, edit_1.$d7)(edits);
        }
        r(model, edits) {
            const preferredProviders = this.g.getValue(exports.$o7, { resource: model.uri });
            for (const [configMime, desiredId] of Object.entries(preferredProviders)) {
                const editIndex = edits.findIndex(edit => desiredId === edit.providerId
                    && edit.handledMimeType && (0, dataTransfer_1.$Ss)(configMime, [edit.handledMimeType]));
                if (editIndex >= 0) {
                    return editIndex;
                }
            }
            return 0;
        }
        async s(dragEvent) {
            if (!dragEvent.dataTransfer) {
                return new dataTransfer_1.$Rs();
            }
            const dataTransfer = (0, dnd_1.$b7)(dragEvent.dataTransfer);
            if (this.f.hasData(treeViewsDnd_1.$m7.prototype)) {
                const data = this.f.getData(treeViewsDnd_1.$m7.prototype);
                if (Array.isArray(data)) {
                    for (const id of data) {
                        const treeDataTransfer = await this.j.removeDragOperationTransfer(id.identifier);
                        if (treeDataTransfer) {
                            for (const [type, value] of treeDataTransfer) {
                                dataTransfer.replace(type, value);
                            }
                        }
                    }
                }
            }
            return dataTransfer;
        }
    };
    exports.$r7 = $r7;
    exports.$r7 = $r7 = $r7_1 = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, configuration_1.$8h),
        __param(3, languageFeatures_1.$hF),
        __param(4, treeViewsDndService_1.$n7)
    ], $r7);
});
//# sourceMappingURL=dropIntoEditorController.js.map