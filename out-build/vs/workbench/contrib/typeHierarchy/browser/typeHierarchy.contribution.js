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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/codicons", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/range", "vs/editor/contrib/peekView/browser/peekView", "vs/nls!vs/workbench/contrib/typeHierarchy/browser/typeHierarchy.contribution", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/workbench/contrib/typeHierarchy/browser/typeHierarchyPeek", "vs/workbench/contrib/typeHierarchy/common/typeHierarchy"], function (require, exports, cancellation_1, codicons_1, errors_1, event_1, lifecycle_1, editorExtensions_1, codeEditorService_1, range_1, peekView_1, nls_1, actions_1, contextkey_1, instantiation_1, storage_1, typeHierarchyPeek_1, typeHierarchy_1) {
    "use strict";
    var TypeHierarchyController_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    const _ctxHasTypeHierarchyProvider = new contextkey_1.$2i('editorHasTypeHierarchyProvider', false, (0, nls_1.localize)(0, null));
    const _ctxTypeHierarchyVisible = new contextkey_1.$2i('typeHierarchyVisible', false, (0, nls_1.localize)(1, null));
    const _ctxTypeHierarchyDirection = new contextkey_1.$2i('typeHierarchyDirection', undefined, { type: 'string', description: (0, nls_1.localize)(2, null) });
    function sanitizedDirection(candidate) {
        return candidate === "subtypes" /* TypeHierarchyDirection.Subtypes */ || candidate === "supertypes" /* TypeHierarchyDirection.Supertypes */
            ? candidate
            : "subtypes" /* TypeHierarchyDirection.Subtypes */;
    }
    let TypeHierarchyController = class TypeHierarchyController {
        static { TypeHierarchyController_1 = this; }
        static { this.Id = 'typeHierarchy'; }
        static get(editor) {
            return editor.getContribution(TypeHierarchyController_1.Id);
        }
        static { this.a = 'typeHierarchy/defaultDirection'; }
        constructor(_editor, h, i, j, k) {
            this._editor = _editor;
            this.h = h;
            this.i = i;
            this.j = j;
            this.k = k;
            this.e = new lifecycle_1.$jc();
            this.f = new lifecycle_1.$jc();
            this.b = _ctxHasTypeHierarchyProvider.bindTo(this.h);
            this.c = _ctxTypeHierarchyVisible.bindTo(this.h);
            this.d = _ctxTypeHierarchyDirection.bindTo(this.h);
            this.e.add(event_1.Event.any(_editor.onDidChangeModel, _editor.onDidChangeModelLanguage, typeHierarchy_1.$1I.onDidChange)(() => {
                this.b.set(_editor.hasModel() && typeHierarchy_1.$1I.has(_editor.getModel()));
            }));
            this.e.add(this.f);
        }
        dispose() {
            this.e.dispose();
        }
        // Peek
        async startTypeHierarchyFromEditor() {
            this.f.clear();
            if (!this._editor.hasModel()) {
                return;
            }
            const document = this._editor.getModel();
            const position = this._editor.getPosition();
            if (!typeHierarchy_1.$1I.has(document)) {
                return;
            }
            const cts = new cancellation_1.$pd();
            const model = typeHierarchy_1.$2I.create(document, position, cts.token);
            const direction = sanitizedDirection(this.i.get(TypeHierarchyController_1.a, 0 /* StorageScope.PROFILE */, "subtypes" /* TypeHierarchyDirection.Subtypes */));
            this.l(position, direction, model, cts);
        }
        l(position, direction, model, cts) {
            this.c.set(true);
            this.d.set(direction);
            event_1.Event.any(this._editor.onDidChangeModel, this._editor.onDidChangeModelLanguage)(this.endTypeHierarchy, this, this.f);
            this.g = this.k.createInstance(typeHierarchyPeek_1.$rZb, this._editor, position, direction);
            this.g.showLoading();
            this.f.add(this.g.onDidClose(() => {
                this.endTypeHierarchy();
                this.i.store(TypeHierarchyController_1.a, this.g.direction, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            }));
            this.f.add({ dispose() { cts.dispose(true); } });
            this.f.add(this.g);
            model.then(model => {
                if (cts.token.isCancellationRequested) {
                    return; // nothing
                }
                if (model) {
                    this.f.add(model);
                    this.g.showModel(model);
                }
                else {
                    this.g.showMessage((0, nls_1.localize)(3, null));
                }
            }).catch(err => {
                if ((0, errors_1.$2)(err)) {
                    this.endTypeHierarchy();
                    return;
                }
                this.g.showMessage((0, nls_1.localize)(4, null));
            });
        }
        async startTypeHierarchyFromTypeHierarchy() {
            if (!this.g) {
                return;
            }
            const model = this.g.getModel();
            const typeItem = this.g.getFocused();
            if (!typeItem || !model) {
                return;
            }
            const newEditor = await this.j.openCodeEditor({ resource: typeItem.item.uri }, this._editor);
            if (!newEditor) {
                return;
            }
            const newModel = model.fork(typeItem.item);
            this.f.clear();
            TypeHierarchyController_1.get(newEditor)?.l(range_1.$ks.lift(newModel.root.selectionRange).getStartPosition(), this.g.direction, Promise.resolve(newModel), new cancellation_1.$pd());
        }
        showSupertypes() {
            this.g?.updateDirection("supertypes" /* TypeHierarchyDirection.Supertypes */);
            this.d.set("supertypes" /* TypeHierarchyDirection.Supertypes */);
        }
        showSubtypes() {
            this.g?.updateDirection("subtypes" /* TypeHierarchyDirection.Subtypes */);
            this.d.set("subtypes" /* TypeHierarchyDirection.Subtypes */);
        }
        endTypeHierarchy() {
            this.f.clear();
            this.c.set(false);
            this._editor.focus();
        }
    };
    TypeHierarchyController = TypeHierarchyController_1 = __decorate([
        __param(1, contextkey_1.$3i),
        __param(2, storage_1.$Vo),
        __param(3, codeEditorService_1.$nV),
        __param(4, instantiation_1.$Ah)
    ], TypeHierarchyController);
    (0, editorExtensions_1.$AV)(TypeHierarchyController.Id, TypeHierarchyController, 0 /* EditorContributionInstantiation.Eager */); // eager because it needs to define a context key
    // Peek
    (0, actions_1.$Xu)(class PeekTypeHierarchyAction extends editorExtensions_1.$uV {
        constructor() {
            super({
                id: 'editor.showTypeHierarchy',
                title: { value: (0, nls_1.localize)(5, null), original: 'Peek Type Hierarchy' },
                menu: {
                    id: actions_1.$Ru.EditorContextPeek,
                    group: 'navigation',
                    order: 1000,
                    when: contextkey_1.$Ii.and(_ctxHasTypeHierarchyProvider, peekView_1.PeekContext.notInPeekEditor),
                },
                precondition: contextkey_1.$Ii.and(_ctxHasTypeHierarchyProvider, peekView_1.PeekContext.notInPeekEditor),
                f1: true
            });
        }
        async runEditorCommand(_accessor, editor) {
            return TypeHierarchyController.get(editor)?.startTypeHierarchyFromEditor();
        }
    });
    // actions for peek widget
    (0, actions_1.$Xu)(class extends editorExtensions_1.$uV {
        constructor() {
            super({
                id: 'editor.showSupertypes',
                title: { value: (0, nls_1.localize)(6, null), original: 'Show Supertypes' },
                icon: codicons_1.$Pj.typeHierarchySuper,
                precondition: contextkey_1.$Ii.and(_ctxTypeHierarchyVisible, _ctxTypeHierarchyDirection.isEqualTo("subtypes" /* TypeHierarchyDirection.Subtypes */)),
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 1024 /* KeyMod.Shift */ + 512 /* KeyMod.Alt */ + 38 /* KeyCode.KeyH */,
                },
                menu: {
                    id: typeHierarchyPeek_1.$rZb.TitleMenu,
                    when: _ctxTypeHierarchyDirection.isEqualTo("subtypes" /* TypeHierarchyDirection.Subtypes */),
                    order: 1,
                }
            });
        }
        runEditorCommand(_accessor, editor) {
            return TypeHierarchyController.get(editor)?.showSupertypes();
        }
    });
    (0, actions_1.$Xu)(class extends editorExtensions_1.$uV {
        constructor() {
            super({
                id: 'editor.showSubtypes',
                title: { value: (0, nls_1.localize)(7, null), original: 'Show Subtypes' },
                icon: codicons_1.$Pj.typeHierarchySub,
                precondition: contextkey_1.$Ii.and(_ctxTypeHierarchyVisible, _ctxTypeHierarchyDirection.isEqualTo("supertypes" /* TypeHierarchyDirection.Supertypes */)),
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 1024 /* KeyMod.Shift */ + 512 /* KeyMod.Alt */ + 38 /* KeyCode.KeyH */,
                },
                menu: {
                    id: typeHierarchyPeek_1.$rZb.TitleMenu,
                    when: _ctxTypeHierarchyDirection.isEqualTo("supertypes" /* TypeHierarchyDirection.Supertypes */),
                    order: 1,
                }
            });
        }
        runEditorCommand(_accessor, editor) {
            return TypeHierarchyController.get(editor)?.showSubtypes();
        }
    });
    (0, actions_1.$Xu)(class extends editorExtensions_1.$uV {
        constructor() {
            super({
                id: 'editor.refocusTypeHierarchy',
                title: { value: (0, nls_1.localize)(8, null), original: 'Refocus Type Hierarchy' },
                precondition: _ctxTypeHierarchyVisible,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 1024 /* KeyMod.Shift */ + 3 /* KeyCode.Enter */
                }
            });
        }
        async runEditorCommand(_accessor, editor) {
            return TypeHierarchyController.get(editor)?.startTypeHierarchyFromTypeHierarchy();
        }
    });
    (0, actions_1.$Xu)(class extends editorExtensions_1.$uV {
        constructor() {
            super({
                id: 'editor.closeTypeHierarchy',
                title: (0, nls_1.localize)(9, null),
                icon: codicons_1.$Pj.close,
                precondition: _ctxTypeHierarchyVisible,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 10,
                    primary: 9 /* KeyCode.Escape */,
                    when: contextkey_1.$Ii.not('config.editor.stablePeek')
                },
                menu: {
                    id: typeHierarchyPeek_1.$rZb.TitleMenu,
                    order: 1000
                }
            });
        }
        runEditorCommand(_accessor, editor) {
            return TypeHierarchyController.get(editor)?.endTypeHierarchy();
        }
    });
});
//# sourceMappingURL=typeHierarchy.contribution.js.map