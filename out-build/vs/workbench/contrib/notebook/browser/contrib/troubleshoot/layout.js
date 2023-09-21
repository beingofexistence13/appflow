/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/nls!vs/workbench/contrib/notebook/browser/contrib/troubleshoot/layout", "vs/platform/actions/common/actions", "vs/platform/action/common/actionCommonCategories", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/notebookEditorExtensions", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/services/editor/common/editorService"], function (require, exports, lifecycle_1, nls_1, actions_1, actionCommonCategories_1, notebookBrowser_1, notebookEditorExtensions_1, notebookService_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$EFb = void 0;
    class $EFb extends lifecycle_1.$kc {
        static { this.id = 'workbench.notebook.troubleshoot'; }
        constructor(g) {
            super();
            this.g = g;
            this.a = this.B(new lifecycle_1.$jc());
            this.b = [];
            this.c = false;
            this.f = [];
            this.B(this.g.onDidChangeModel(() => {
                this.h();
            }));
            this.h();
        }
        toggle() {
            this.c = !this.c;
            this.h();
        }
        h() {
            this.a.clear();
            this.b.forEach(listener => listener.dispose());
            if (!this.g.hasModel()) {
                return;
            }
            this.m();
        }
        j(cell, e) {
            if (this.c) {
                const oldHeight = this.g.getViewHeight(cell);
                console.log(`cell#${cell.handle}`, e, `${oldHeight} -> ${cell.layoutInfo.totalHeight}`);
            }
        }
        m() {
            if (!this.g.hasModel()) {
                return;
            }
            for (let i = 0; i < this.g.getLength(); i++) {
                const cell = this.g.cellAt(i);
                this.b.push(cell.onDidChangeLayout(e => {
                    this.j(cell, e);
                }));
            }
            this.a.add(this.g.onDidChangeViewCells(e => {
                [...e.splices].reverse().forEach(splice => {
                    const [start, deleted, newCells] = splice;
                    const deletedCells = this.b.splice(start, deleted, ...newCells.map(cell => {
                        return cell.onDidChangeLayout((e) => {
                            this.j(cell, e);
                        });
                    }));
                    (0, lifecycle_1.$fc)(deletedCells);
                });
            }));
            const vm = this.g.getViewModel();
            let items = [];
            if (this.c) {
                items = this.n();
            }
            this.f = vm.deltaCellStatusBarItems(this.f, items);
        }
        n() {
            const items = [];
            for (let i = 0; i < this.g.getLength(); i++) {
                items.push({
                    handle: i,
                    items: [
                        {
                            text: `index: ${i}`,
                            alignment: 1 /* CellStatusbarAlignment.Left */,
                            priority: Number.MAX_SAFE_INTEGER
                        }
                    ]
                });
            }
            return items;
        }
        dispose() {
            (0, lifecycle_1.$fc)(this.b);
            super.dispose();
        }
    }
    exports.$EFb = $EFb;
    (0, notebookEditorExtensions_1.$Fnb)($EFb.id, $EFb);
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'notebook.toggleLayoutTroubleshoot',
                title: {
                    value: (0, nls_1.localize)(0, null),
                    original: 'Toggle Notebook Layout Troubleshoot'
                },
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            const editor = (0, notebookBrowser_1.$Zbb)(editorService.activeEditorPane);
            if (!editor) {
                return;
            }
            const controller = editor.getContribution($EFb.id);
            controller?.toggle();
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'notebook.inspectLayout',
                title: {
                    value: (0, nls_1.localize)(1, null),
                    original: 'Inspect Notebook Layout'
                },
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            const editor = (0, notebookBrowser_1.$Zbb)(editorService.activeEditorPane);
            if (!editor || !editor.hasModel()) {
                return;
            }
            for (let i = 0; i < editor.getLength(); i++) {
                const cell = editor.cellAt(i);
                console.log(`cell#${cell.handle}`, cell.layoutInfo);
            }
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'notebook.clearNotebookEdtitorTypeCache',
                title: {
                    value: (0, nls_1.localize)(2, null),
                    original: 'Clear Notebook Editor Cache'
                },
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true
            });
        }
        async run(accessor) {
            const notebookService = accessor.get(notebookService_1.$ubb);
            notebookService.clearEditorCache();
        }
    });
});
//# sourceMappingURL=layout.js.map