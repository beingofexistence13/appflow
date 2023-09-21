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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/button/button", "vs/base/common/actions", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/browser/services/bulkEditService", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/css!./postEditWidget"], function (require, exports, dom, button_1, actions_1, event_1, lifecycle_1, bulkEditService_1, contextkey_1, contextView_1, instantiation_1, keybinding_1) {
    "use strict";
    var PostEditWidget_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$f7 = void 0;
    let PostEditWidget = class PostEditWidget extends lifecycle_1.$kc {
        static { PostEditWidget_1 = this; }
        static { this.a = 'editor.widget.postEditWidget'; }
        constructor(g, h, visibleContext, j, m, n, r, s, contextKeyService, t) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.allowEditorOverflow = true;
            this.suppressMouseDown = true;
            this.w();
            this.f = visibleContext.bindTo(contextKeyService);
            this.f.set(true);
            this.B((0, lifecycle_1.$ic)(() => this.f.reset()));
            this.h.addContentWidget(this);
            this.h.layoutContentWidget(this);
            this.B((0, lifecycle_1.$ic)((() => this.h.removeContentWidget(this))));
            this.B(this.h.onDidChangeCursorPosition(e => {
                if (!m.containsPosition(e.position)) {
                    this.dispose();
                }
            }));
            this.B(event_1.Event.runAndSubscribe(t.onDidUpdateKeybindings, () => {
                this.u();
            }));
        }
        u() {
            const binding = this.t.lookupKeybinding(this.j.id)?.getLabel();
            this.c.element.title = this.j.label + (binding ? ` (${binding})` : '');
        }
        w() {
            this.b = dom.$('.post-edit-widget');
            this.c = this.B(new button_1.$7Q(this.b, {
                supportIcons: true,
            }));
            this.c.label = '$(insert)';
            this.B(dom.$nO(this.b, dom.$3O.CLICK, () => this.showSelector()));
        }
        getId() {
            return PostEditWidget_1.a + '.' + this.g;
        }
        getDomNode() {
            return this.b;
        }
        getPosition() {
            return {
                position: this.m.getEndPosition(),
                preference: [2 /* ContentWidgetPositionPreference.BELOW */]
            };
        }
        showSelector() {
            this.s.showContextMenu({
                getAnchor: () => {
                    const pos = dom.$FO(this.c.element);
                    return { x: pos.left + pos.width, y: pos.top + pos.height };
                },
                getActions: () => {
                    return this.n.allEdits.map((edit, i) => (0, actions_1.$li)({
                        id: '',
                        label: edit.label,
                        checked: i === this.n.activeEditIndex,
                        run: () => {
                            if (i !== this.n.activeEditIndex) {
                                return this.r(i);
                            }
                        },
                    }));
                }
            });
        }
    };
    PostEditWidget = PostEditWidget_1 = __decorate([
        __param(7, contextView_1.$WZ),
        __param(8, contextkey_1.$3i),
        __param(9, keybinding_1.$2D)
    ], PostEditWidget);
    let $f7 = class $f7 extends lifecycle_1.$kc {
        constructor(b, c, f, g, h, j) {
            super();
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.a = this.B(new lifecycle_1.$lc());
            this.B(event_1.Event.any(c.onDidChangeModel, c.onDidChangeModelContent)(() => this.clear()));
        }
        async applyEditAndShowIfNeeded(ranges, edits, canShowWidget, token) {
            const model = this.c.getModel();
            if (!model || !ranges.length) {
                return;
            }
            const edit = edits.allEdits[edits.activeEditIndex];
            if (!edit) {
                return;
            }
            let insertTextEdit = [];
            if (typeof edit.insertText === 'string' ? edit.insertText === '' : edit.insertText.snippet === '') {
                insertTextEdit = [];
            }
            else {
                insertTextEdit = ranges.map(range => new bulkEditService_1.$p1(model.uri, typeof edit.insertText === 'string'
                    ? { range, text: edit.insertText, insertAsSnippet: false }
                    : { range, text: edit.insertText.snippet, insertAsSnippet: true }));
            }
            const allEdits = [
                ...insertTextEdit,
                ...(edit.additionalEdit?.edits ?? [])
            ];
            const combinedWorkspaceEdit = {
                edits: allEdits
            };
            // Use a decoration to track edits around the trigger range
            const primaryRange = ranges[0];
            const editTrackingDecoration = model.deltaDecorations([], [{
                    range: primaryRange,
                    options: { description: 'paste-line-suffix', stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */ }
                }]);
            let editResult;
            let editRange;
            try {
                editResult = await this.j.apply(combinedWorkspaceEdit, { editor: this.c, token });
                editRange = model.getDecorationRange(editTrackingDecoration[0]);
            }
            finally {
                model.deltaDecorations(editTrackingDecoration, []);
            }
            if (canShowWidget && editResult.isApplied && edits.allEdits.length > 1) {
                this.show(editRange ?? primaryRange, edits, async (newEditIndex) => {
                    const model = this.c.getModel();
                    if (!model) {
                        return;
                    }
                    await model.undo();
                    this.applyEditAndShowIfNeeded(ranges, { activeEditIndex: newEditIndex, allEdits: edits.allEdits }, canShowWidget, token);
                });
            }
        }
        show(range, edits, onDidSelectEdit) {
            this.clear();
            if (this.c.hasModel()) {
                this.a.value = this.h.createInstance(PostEditWidget, this.b, this.c, this.f, this.g, range, edits, onDidSelectEdit);
            }
        }
        clear() {
            this.a.clear();
        }
        tryShowSelector() {
            this.a.value?.showSelector();
        }
    };
    exports.$f7 = $f7;
    exports.$f7 = $f7 = __decorate([
        __param(4, instantiation_1.$Ah),
        __param(5, bulkEditService_1.$n1)
    ], $f7);
});
//# sourceMappingURL=postEditWidget.js.map