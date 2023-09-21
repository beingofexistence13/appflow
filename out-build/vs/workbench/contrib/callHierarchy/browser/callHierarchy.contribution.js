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
define(["require", "exports", "vs/nls!vs/workbench/contrib/callHierarchy/browser/callHierarchy.contribution", "vs/workbench/contrib/callHierarchy/common/callHierarchy", "vs/base/common/cancellation", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/callHierarchy/browser/callHierarchyPeek", "vs/base/common/event", "vs/editor/browser/editorExtensions", "vs/platform/contextkey/common/contextkey", "vs/base/common/lifecycle", "vs/editor/common/editorContextKeys", "vs/editor/contrib/peekView/browser/peekView", "vs/platform/storage/common/storage", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/range", "vs/platform/actions/common/actions", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/base/common/errors"], function (require, exports, nls_1, callHierarchy_1, cancellation_1, instantiation_1, callHierarchyPeek_1, event_1, editorExtensions_1, contextkey_1, lifecycle_1, editorContextKeys_1, peekView_1, storage_1, codeEditorService_1, range_1, actions_1, codicons_1, iconRegistry_1, errors_1) {
    "use strict";
    var CallHierarchyController_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    const _ctxHasCallHierarchyProvider = new contextkey_1.$2i('editorHasCallHierarchyProvider', false, (0, nls_1.localize)(0, null));
    const _ctxCallHierarchyVisible = new contextkey_1.$2i('callHierarchyVisible', false, (0, nls_1.localize)(1, null));
    const _ctxCallHierarchyDirection = new contextkey_1.$2i('callHierarchyDirection', undefined, { type: 'string', description: (0, nls_1.localize)(2, null) });
    function sanitizedDirection(candidate) {
        return candidate === "outgoingCalls" /* CallHierarchyDirection.CallsFrom */ || candidate === "incomingCalls" /* CallHierarchyDirection.CallsTo */
            ? candidate
            : "incomingCalls" /* CallHierarchyDirection.CallsTo */;
    }
    let CallHierarchyController = class CallHierarchyController {
        static { CallHierarchyController_1 = this; }
        static { this.Id = 'callHierarchy'; }
        static get(editor) {
            return editor.getContribution(CallHierarchyController_1.Id);
        }
        static { this.a = 'callHierarchy/defaultDirection'; }
        constructor(h, i, j, k, l) {
            this.h = h;
            this.i = i;
            this.j = j;
            this.k = k;
            this.l = l;
            this.e = new lifecycle_1.$jc();
            this.f = new lifecycle_1.$jc();
            this.c = _ctxCallHierarchyVisible.bindTo(this.i);
            this.b = _ctxHasCallHierarchyProvider.bindTo(this.i);
            this.d = _ctxCallHierarchyDirection.bindTo(this.i);
            this.e.add(event_1.Event.any(h.onDidChangeModel, h.onDidChangeModelLanguage, callHierarchy_1.$eF.onDidChange)(() => {
                this.b.set(h.hasModel() && callHierarchy_1.$eF.has(h.getModel()));
            }));
            this.e.add(this.f);
        }
        dispose() {
            this.b.reset();
            this.c.reset();
            this.e.dispose();
        }
        async startCallHierarchyFromEditor() {
            this.f.clear();
            if (!this.h.hasModel()) {
                return;
            }
            const document = this.h.getModel();
            const position = this.h.getPosition();
            if (!callHierarchy_1.$eF.has(document)) {
                return;
            }
            const cts = new cancellation_1.$pd();
            const model = callHierarchy_1.$fF.create(document, position, cts.token);
            const direction = sanitizedDirection(this.j.get(CallHierarchyController_1.a, 0 /* StorageScope.PROFILE */, "incomingCalls" /* CallHierarchyDirection.CallsTo */));
            this.m(position, direction, model, cts);
        }
        async startCallHierarchyFromCallHierarchy() {
            if (!this.g) {
                return;
            }
            const model = this.g.getModel();
            const call = this.g.getFocused();
            if (!call || !model) {
                return;
            }
            const newEditor = await this.k.openCodeEditor({ resource: call.item.uri }, this.h);
            if (!newEditor) {
                return;
            }
            const newModel = model.fork(call.item);
            this.f.clear();
            CallHierarchyController_1.get(newEditor)?.m(range_1.$ks.lift(newModel.root.selectionRange).getStartPosition(), this.g.direction, Promise.resolve(newModel), new cancellation_1.$pd());
        }
        m(position, direction, model, cts) {
            this.c.set(true);
            this.d.set(direction);
            event_1.Event.any(this.h.onDidChangeModel, this.h.onDidChangeModelLanguage)(this.endCallHierarchy, this, this.f);
            this.g = this.l.createInstance(callHierarchyPeek_1.$jZb, this.h, position, direction);
            this.g.showLoading();
            this.f.add(this.g.onDidClose(() => {
                this.endCallHierarchy();
                this.j.store(CallHierarchyController_1.a, this.g.direction, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
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
                    this.endCallHierarchy();
                    return;
                }
                this.g.showMessage((0, nls_1.localize)(4, null));
            });
        }
        showOutgoingCalls() {
            this.g?.updateDirection("outgoingCalls" /* CallHierarchyDirection.CallsFrom */);
            this.d.set("outgoingCalls" /* CallHierarchyDirection.CallsFrom */);
        }
        showIncomingCalls() {
            this.g?.updateDirection("incomingCalls" /* CallHierarchyDirection.CallsTo */);
            this.d.set("incomingCalls" /* CallHierarchyDirection.CallsTo */);
        }
        endCallHierarchy() {
            this.f.clear();
            this.c.set(false);
            this.h.focus();
        }
    };
    CallHierarchyController = CallHierarchyController_1 = __decorate([
        __param(1, contextkey_1.$3i),
        __param(2, storage_1.$Vo),
        __param(3, codeEditorService_1.$nV),
        __param(4, instantiation_1.$Ah)
    ], CallHierarchyController);
    (0, editorExtensions_1.$AV)(CallHierarchyController.Id, CallHierarchyController, 0 /* EditorContributionInstantiation.Eager */); // eager because it needs to define a context key
    (0, actions_1.$Xu)(class PeekCallHierarchyAction extends editorExtensions_1.$uV {
        constructor() {
            super({
                id: 'editor.showCallHierarchy',
                title: { value: (0, nls_1.localize)(5, null), original: 'Peek Call Hierarchy' },
                menu: {
                    id: actions_1.$Ru.EditorContextPeek,
                    group: 'navigation',
                    order: 1000,
                    when: contextkey_1.$Ii.and(_ctxHasCallHierarchyProvider, peekView_1.PeekContext.notInPeekEditor),
                },
                keybinding: {
                    when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 1024 /* KeyMod.Shift */ + 512 /* KeyMod.Alt */ + 38 /* KeyCode.KeyH */
                },
                precondition: contextkey_1.$Ii.and(_ctxHasCallHierarchyProvider, peekView_1.PeekContext.notInPeekEditor),
                f1: true
            });
        }
        async runEditorCommand(_accessor, editor) {
            return CallHierarchyController.get(editor)?.startCallHierarchyFromEditor();
        }
    });
    (0, actions_1.$Xu)(class extends editorExtensions_1.$uV {
        constructor() {
            super({
                id: 'editor.showIncomingCalls',
                title: { value: (0, nls_1.localize)(6, null), original: 'Show Incoming Calls' },
                icon: (0, iconRegistry_1.$9u)('callhierarchy-incoming', codicons_1.$Pj.callIncoming, (0, nls_1.localize)(7, null)),
                precondition: contextkey_1.$Ii.and(_ctxCallHierarchyVisible, _ctxCallHierarchyDirection.isEqualTo("outgoingCalls" /* CallHierarchyDirection.CallsFrom */)),
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 1024 /* KeyMod.Shift */ + 512 /* KeyMod.Alt */ + 38 /* KeyCode.KeyH */,
                },
                menu: {
                    id: callHierarchyPeek_1.$jZb.TitleMenu,
                    when: _ctxCallHierarchyDirection.isEqualTo("outgoingCalls" /* CallHierarchyDirection.CallsFrom */),
                    order: 1,
                }
            });
        }
        runEditorCommand(_accessor, editor) {
            return CallHierarchyController.get(editor)?.showIncomingCalls();
        }
    });
    (0, actions_1.$Xu)(class extends editorExtensions_1.$uV {
        constructor() {
            super({
                id: 'editor.showOutgoingCalls',
                title: { value: (0, nls_1.localize)(8, null), original: 'Show Outgoing Calls' },
                icon: (0, iconRegistry_1.$9u)('callhierarchy-outgoing', codicons_1.$Pj.callOutgoing, (0, nls_1.localize)(9, null)),
                precondition: contextkey_1.$Ii.and(_ctxCallHierarchyVisible, _ctxCallHierarchyDirection.isEqualTo("incomingCalls" /* CallHierarchyDirection.CallsTo */)),
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 1024 /* KeyMod.Shift */ + 512 /* KeyMod.Alt */ + 38 /* KeyCode.KeyH */,
                },
                menu: {
                    id: callHierarchyPeek_1.$jZb.TitleMenu,
                    when: _ctxCallHierarchyDirection.isEqualTo("incomingCalls" /* CallHierarchyDirection.CallsTo */),
                    order: 1
                }
            });
        }
        runEditorCommand(_accessor, editor) {
            return CallHierarchyController.get(editor)?.showOutgoingCalls();
        }
    });
    (0, actions_1.$Xu)(class extends editorExtensions_1.$uV {
        constructor() {
            super({
                id: 'editor.refocusCallHierarchy',
                title: { value: (0, nls_1.localize)(10, null), original: 'Refocus Call Hierarchy' },
                precondition: _ctxCallHierarchyVisible,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 1024 /* KeyMod.Shift */ + 3 /* KeyCode.Enter */
                }
            });
        }
        async runEditorCommand(_accessor, editor) {
            return CallHierarchyController.get(editor)?.startCallHierarchyFromCallHierarchy();
        }
    });
    (0, actions_1.$Xu)(class extends editorExtensions_1.$uV {
        constructor() {
            super({
                id: 'editor.closeCallHierarchy',
                title: (0, nls_1.localize)(11, null),
                icon: codicons_1.$Pj.close,
                precondition: _ctxCallHierarchyVisible,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 10,
                    primary: 9 /* KeyCode.Escape */,
                    when: contextkey_1.$Ii.not('config.editor.stablePeek')
                },
                menu: {
                    id: callHierarchyPeek_1.$jZb.TitleMenu,
                    order: 1000
                }
            });
        }
        runEditorCommand(_accessor, editor) {
            return CallHierarchyController.get(editor)?.endCallHierarchy();
        }
    });
});
//# sourceMappingURL=callHierarchy.contribution.js.map