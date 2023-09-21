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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/base/common/linkedList", "vs/base/common/map", "vs/editor/browser/editorBrowser", "vs/editor/browser/services/bulkEditService", "vs/nls!vs/workbench/contrib/bulkEdit/browser/bulkEditService", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/progress/common/progress", "vs/platform/registry/common/platform", "vs/platform/undoRedo/common/undoRedo", "vs/workbench/contrib/bulkEdit/browser/bulkCellEdits", "vs/workbench/contrib/bulkEdit/browser/bulkFileEdits", "vs/workbench/contrib/bulkEdit/browser/bulkTextEdits", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/workingCopy/common/workingCopyService"], function (require, exports, cancellation_1, lifecycle_1, linkedList_1, map_1, editorBrowser_1, bulkEditService_1, nls_1, configuration_1, configurationRegistry_1, dialogs_1, extensions_1, instantiation_1, log_1, progress_1, platform_1, undoRedo_1, bulkCellEdits_1, bulkFileEdits_1, bulkTextEdits_1, editorService_1, lifecycle_2, workingCopyService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$dMb = void 0;
    function liftEdits(edits) {
        return edits.map(edit => {
            if (bulkEditService_1.$p1.is(edit)) {
                return bulkEditService_1.$p1.lift(edit);
            }
            if (bulkEditService_1.$q1.is(edit)) {
                return bulkEditService_1.$q1.lift(edit);
            }
            if (bulkCellEdits_1.$3bb.is(edit)) {
                return bulkCellEdits_1.$3bb.lift(edit);
            }
            throw new Error('Unsupported edit');
        });
    }
    let BulkEdit = class BulkEdit {
        constructor(a, b, c, d, f, g, h, j, k, l, m) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
        }
        ariaMessage() {
            const otherResources = new map_1.$zi();
            const textEditResources = new map_1.$zi();
            let textEditCount = 0;
            for (const edit of this.g) {
                if (edit instanceof bulkEditService_1.$p1) {
                    textEditCount += 1;
                    textEditResources.set(edit.resource, true);
                }
                else if (edit instanceof bulkEditService_1.$q1) {
                    otherResources.set(edit.oldResource ?? edit.newResource, true);
                }
            }
            if (this.g.length === 0) {
                return (0, nls_1.localize)(0, null);
            }
            else if (otherResources.size === 0) {
                if (textEditCount > 1 && textEditResources.size > 1) {
                    return (0, nls_1.localize)(1, null, textEditCount, textEditResources.size);
                }
                else {
                    return (0, nls_1.localize)(2, null, textEditCount);
                }
            }
            else {
                return (0, nls_1.localize)(3, null, textEditCount, textEditResources.size, otherResources.size);
            }
        }
        async perform() {
            if (this.g.length === 0) {
                return [];
            }
            const ranges = [1];
            for (let i = 1; i < this.g.length; i++) {
                if (Object.getPrototypeOf(this.g[i - 1]) === Object.getPrototypeOf(this.g[i])) {
                    ranges[ranges.length - 1]++;
                }
                else {
                    ranges.push(1);
                }
            }
            // Show infinte progress when there is only 1 item since we do not know how long it takes
            const increment = this.g.length > 1 ? 0 : undefined;
            this.d.report({ increment, total: 100 });
            // Increment by percentage points since progress API expects that
            const progress = { report: _ => this.d.report({ increment: 100 / this.g.length }) };
            const resources = [];
            let index = 0;
            for (const range of ranges) {
                if (this.f.isCancellationRequested) {
                    break;
                }
                const group = this.g.slice(index, index + range);
                if (group[0] instanceof bulkEditService_1.$q1) {
                    resources.push(await this.n(group, this.h, this.j, this.k, progress));
                }
                else if (group[0] instanceof bulkEditService_1.$p1) {
                    resources.push(await this.o(group, this.h, this.j, progress));
                }
                else if (group[0] instanceof bulkCellEdits_1.$3bb) {
                    resources.push(await this.p(group, this.h, this.j, progress));
                }
                else {
                    console.log('UNKNOWN EDIT');
                }
                index = index + range;
            }
            return resources.flat();
        }
        async n(edits, undoRedoGroup, undoRedoSource, confirmBeforeUndo, progress) {
            this.m.debug('_performFileEdits', JSON.stringify(edits));
            const model = this.l.createInstance(bulkFileEdits_1.$bMb, this.a || (0, nls_1.localize)(4, null), this.b || 'undoredo.workspaceEdit', undoRedoGroup, undoRedoSource, confirmBeforeUndo, progress, this.f, edits);
            return await model.apply();
        }
        async o(edits, undoRedoGroup, undoRedoSource, progress) {
            this.m.debug('_performTextEdits', JSON.stringify(edits));
            const model = this.l.createInstance(bulkTextEdits_1.$cMb, this.a || (0, nls_1.localize)(5, null), this.b || 'undoredo.workspaceEdit', this.c, undoRedoGroup, undoRedoSource, progress, this.f, edits);
            return await model.apply();
        }
        async p(edits, undoRedoGroup, undoRedoSource, progress) {
            this.m.debug('_performCellEdits', JSON.stringify(edits));
            const model = this.l.createInstance(bulkCellEdits_1.$4bb, undoRedoGroup, undoRedoSource, progress, this.f, edits);
            return await model.apply();
        }
    };
    BulkEdit = __decorate([
        __param(9, instantiation_1.$Ah),
        __param(10, log_1.$5i)
    ], BulkEdit);
    let $dMb = class $dMb {
        constructor(c, d, f, g, h, j, k) {
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.k = k;
            this.a = new linkedList_1.$tc();
        }
        setPreviewHandler(handler) {
            this.b = handler;
            return (0, lifecycle_1.$ic)(() => {
                if (this.b === handler) {
                    this.b = undefined;
                }
            });
        }
        hasPreviewHandler() {
            return Boolean(this.b);
        }
        async apply(editsIn, options) {
            let edits = liftEdits(Array.isArray(editsIn) ? editsIn : editsIn.edits);
            if (edits.length === 0) {
                return { ariaSummary: (0, nls_1.localize)(6, null), isApplied: false };
            }
            if (this.b && (options?.showPreview || edits.some(value => value.metadata?.needsConfirmation))) {
                edits = await this.b(edits, options);
            }
            let codeEditor = options?.editor;
            // try to find code editor
            if (!codeEditor) {
                const candidate = this.f.activeTextEditorControl;
                if ((0, editorBrowser_1.$iV)(candidate)) {
                    codeEditor = candidate;
                }
                else if ((0, editorBrowser_1.$jV)(candidate)) {
                    codeEditor = candidate.getModifiedEditor();
                }
            }
            if (codeEditor && codeEditor.getOption(90 /* EditorOption.readOnly */)) {
                // If the code editor is readonly still allow bulk edits to be applied #68549
                codeEditor = undefined;
            }
            // undo-redo-group: if a group id is passed then try to find it
            // in the list of active edits. otherwise (or when not found)
            // create a separate undo-redo-group
            let undoRedoGroup;
            let undoRedoGroupRemove = () => { };
            if (typeof options?.undoRedoGroupId === 'number') {
                for (const candidate of this.a) {
                    if (candidate.id === options.undoRedoGroupId) {
                        undoRedoGroup = candidate;
                        break;
                    }
                }
            }
            if (!undoRedoGroup) {
                undoRedoGroup = new undoRedo_1.$yu();
                undoRedoGroupRemove = this.a.push(undoRedoGroup);
            }
            const label = options?.quotableLabel || options?.label;
            const bulkEdit = this.c.createInstance(BulkEdit, label, options?.code, codeEditor, options?.progress ?? progress_1.$4u.None, options?.token ?? cancellation_1.CancellationToken.None, edits, undoRedoGroup, options?.undoRedoSource, !!options?.confirmBeforeUndo);
            let listener;
            try {
                listener = this.g.onBeforeShutdown(e => e.veto(this.m(label, e.reason), 'veto.blukEditService'));
                const resources = await bulkEdit.perform();
                // when enabled (option AND setting) loop over all dirty working copies and trigger save
                // for those that were involved in this bulk edit operation.
                if (options?.respectAutoSaveConfig && this.k.getValue(autoSaveSetting) === true && resources.length > 1) {
                    await this.l(resources);
                }
                return { ariaSummary: bulkEdit.ariaMessage(), isApplied: edits.length > 0 };
            }
            catch (err) {
                // console.log('apply FAILED');
                // console.log(err);
                this.d.error(err);
                throw err;
            }
            finally {
                listener?.dispose();
                undoRedoGroupRemove();
            }
        }
        async l(resources) {
            const set = new map_1.$Ai(resources);
            const saves = this.j.dirtyWorkingCopies.map(async (copy) => {
                if (set.has(copy.resource)) {
                    await copy.save();
                }
            });
            const result = await Promise.allSettled(saves);
            for (const item of result) {
                if (item.status === 'rejected') {
                    this.d.warn(item.reason);
                }
            }
        }
        async m(label, reason) {
            let message;
            let primaryButton;
            switch (reason) {
                case 1 /* ShutdownReason.CLOSE */:
                    message = (0, nls_1.localize)(7, null);
                    primaryButton = (0, nls_1.localize)(8, null);
                    break;
                case 4 /* ShutdownReason.LOAD */:
                    message = (0, nls_1.localize)(9, null);
                    primaryButton = (0, nls_1.localize)(10, null);
                    break;
                case 3 /* ShutdownReason.RELOAD */:
                    message = (0, nls_1.localize)(11, null);
                    primaryButton = (0, nls_1.localize)(12, null);
                    break;
                default:
                    message = (0, nls_1.localize)(13, null);
                    primaryButton = (0, nls_1.localize)(14, null);
                    break;
            }
            const result = await this.h.confirm({
                message,
                detail: (0, nls_1.localize)(15, null, label || (0, nls_1.localize)(16, null)),
                primaryButton
            });
            return !result.confirmed;
        }
    };
    exports.$dMb = $dMb;
    exports.$dMb = $dMb = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, log_1.$5i),
        __param(2, editorService_1.$9C),
        __param(3, lifecycle_2.$7y),
        __param(4, dialogs_1.$oA),
        __param(5, workingCopyService_1.$TC),
        __param(6, configuration_1.$8h)
    ], $dMb);
    (0, extensions_1.$mr)(bulkEditService_1.$n1, $dMb, 1 /* InstantiationType.Delayed */);
    const autoSaveSetting = 'files.refactoring.autoSave';
    platform_1.$8m.as(configurationRegistry_1.$an.Configuration).registerConfiguration({
        id: 'files',
        properties: {
            [autoSaveSetting]: {
                description: (0, nls_1.localize)(17, null),
                default: true,
                type: 'boolean'
            }
        }
    });
});
//# sourceMappingURL=bulkEditService.js.map