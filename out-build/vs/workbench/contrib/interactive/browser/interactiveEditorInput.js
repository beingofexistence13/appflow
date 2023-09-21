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
define(["require", "exports", "vs/base/common/event", "vs/base/common/path", "vs/base/common/resources", "vs/editor/common/languages/modesRegistry", "vs/editor/common/services/resolverService", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/instantiation", "vs/workbench/common/editor/editorInput", "vs/workbench/contrib/interactive/browser/interactiveDocumentService", "vs/workbench/contrib/interactive/browser/interactiveHistoryService", "vs/workbench/contrib/notebook/common/notebookEditorInput", "vs/workbench/contrib/notebook/common/notebookService"], function (require, exports, event_1, paths, resources_1, modesRegistry_1, resolverService_1, dialogs_1, instantiation_1, editorInput_1, interactiveDocumentService_1, interactiveHistoryService_1, notebookEditorInput_1, notebookService_1) {
    "use strict";
    var $5ib_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$5ib = void 0;
    let $5ib = class $5ib extends editorInput_1.$tA {
        static { $5ib_1 = this; }
        static create(instantiationService, resource, inputResource, title, language) {
            return instantiationService.createInstance($5ib_1, resource, inputResource, title, language);
        }
        static { this.c = {}; }
        static setName(notebookUri, title) {
            if (title) {
                this.c[notebookUri.path] = title;
            }
        }
        static { this.ID = 'workbench.input.interactive'; }
        get editorId() {
            return 'interactive';
        }
        get typeId() {
            return $5ib_1.ID;
        }
        get language() {
            return this.w?.object.textEditorModel.getLanguageId() ?? this.m;
        }
        get notebookEditorInput() {
            return this.n;
        }
        get editorInputs() {
            return [this.n];
        }
        get resource() {
            return this.r;
        }
        get inputResource() {
            return this.s;
        }
        get primary() {
            return this.n;
        }
        constructor(resource, inputResource, title, languageId, instantiationService, textModelService, interactiveDocumentService, historyService, D, F) {
            const input = notebookEditorInput_1.$zbb.create(instantiationService, resource, 'interactive', {});
            super();
            this.D = D;
            this.F = F;
            this.n = input;
            this.B(this.n);
            this.j = title ?? $5ib_1.c[resource.path] ?? paths.$ae(resource.path, paths.$be(resource.path));
            this.m = languageId;
            this.r = resource;
            this.s = inputResource;
            this.t = null;
            this.u = null;
            this.w = null;
            this.y = textModelService;
            this.z = interactiveDocumentService;
            this.C = historyService;
            this.G();
        }
        G() {
            const oncePrimaryDisposed = event_1.Event.once(this.primary.onWillDispose);
            this.B(oncePrimaryDisposed(() => {
                if (!this.isDisposed()) {
                    this.dispose();
                }
            }));
            // Re-emit some events from the primary side to the outside
            this.B(this.primary.onDidChangeDirty(() => this.a.fire()));
            this.B(this.primary.onDidChangeLabel(() => this.b.fire()));
            // Re-emit some events from both sides to the outside
            this.B(this.primary.onDidChangeCapabilities(() => this.f.fire()));
        }
        get capabilities() {
            return 4 /* EditorInputCapabilities.Untitled */
                | 2 /* EditorInputCapabilities.Readonly */
                | 512 /* EditorInputCapabilities.Scratchpad */;
        }
        async H() {
            if (!this.u) {
                this.u = await this.n.resolve();
            }
            return this.u;
        }
        async resolve() {
            if (this.u) {
                return this.u;
            }
            if (this.t) {
                return this.t;
            }
            this.t = this.H();
            return this.t;
        }
        async resolveInput(language) {
            if (this.w) {
                return this.w.object.textEditorModel;
            }
            const resolvedLanguage = language ?? this.m ?? modesRegistry_1.$Yt;
            this.z.willCreateInteractiveDocument(this.resource, this.inputResource, resolvedLanguage);
            this.w = await this.y.createModelReference(this.inputResource);
            return this.w.object.textEditorModel;
        }
        async save(group, options) {
            if (this.u) {
                if (this.hasCapability(4 /* EditorInputCapabilities.Untitled */)) {
                    return this.saveAs(group, options);
                }
                else {
                    await this.u.save(options);
                }
                return this;
            }
            return undefined;
        }
        async saveAs(group, options) {
            if (!this.u) {
                return undefined;
            }
            const provider = this.D.getContributedNotebookType('interactive');
            if (!provider) {
                return undefined;
            }
            const filename = this.getName() + '.ipynb';
            const pathCandidate = (0, resources_1.$ig)(await this.F.defaultFilePath(), filename);
            const target = await this.F.pickFileToSave(pathCandidate, options?.availableFileSystems);
            if (!target) {
                return undefined; // save cancelled
            }
            return await this.u.saveAs(target);
        }
        matches(otherInput) {
            if (super.matches(otherInput)) {
                return true;
            }
            if (otherInput instanceof $5ib_1) {
                return (0, resources_1.$bg)(this.resource, otherInput.resource) && (0, resources_1.$bg)(this.inputResource, otherInput.inputResource);
            }
            return false;
        }
        getName() {
            return this.j;
        }
        isModified() {
            return this.u?.isModified() ?? false;
        }
        dispose() {
            // we support closing the interactive window without prompt, so the editor model should not be dirty
            this.u?.revert({ soft: true });
            this.n?.dispose();
            this.u?.dispose();
            this.u = null;
            this.z.willRemoveInteractiveDocument(this.resource, this.inputResource);
            this.w?.dispose();
            this.w = null;
            super.dispose();
        }
        get historyService() {
            return this.C;
        }
    };
    exports.$5ib = $5ib;
    exports.$5ib = $5ib = $5ib_1 = __decorate([
        __param(4, instantiation_1.$Ah),
        __param(5, resolverService_1.$uA),
        __param(6, interactiveDocumentService_1.$1ib),
        __param(7, interactiveHistoryService_1.$3ib),
        __param(8, notebookService_1.$ubb),
        __param(9, dialogs_1.$qA)
    ], $5ib);
});
//# sourceMappingURL=interactiveEditorInput.js.map