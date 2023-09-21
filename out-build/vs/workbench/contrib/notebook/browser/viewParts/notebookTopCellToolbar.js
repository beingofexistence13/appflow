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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/platform/actions/browser/toolbar", "vs/platform/actions/common/actions", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/notebook/browser/view/cellParts/cellActionView"], function (require, exports, DOM, lifecycle_1, toolbar_1, actions_1, contextView_1, instantiation_1, cellActionView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$lrb = void 0;
    let $lrb = class $lrb extends lifecycle_1.$kc {
        constructor(f, contextKeyService, insertionIndicatorContainer, h, j, m) {
            super();
            this.f = f;
            this.h = h;
            this.j = j;
            this.m = m;
            this.c = this.B(new lifecycle_1.$jc());
            this.a = DOM.$0O(insertionIndicatorContainer, DOM.$('.cell-list-top-cell-toolbar-container'));
            this.b = this.B(h.createInstance(toolbar_1.$M6, this.a, this.f.creationOptions.menuIds.cellTopInsertToolbar, {
                actionViewItemProvider: action => {
                    if (action instanceof actions_1.$Vu) {
                        const item = this.h.createInstance(cellActionView_1.$lpb, action, undefined);
                        return item;
                    }
                    return undefined;
                },
                menuOptions: {
                    shouldForwardArgs: true
                },
                toolbarOptions: {
                    primaryGroup: (g) => /^inline/.test(g),
                },
                hiddenItemStrategy: 0 /* HiddenItemStrategy.Ignore */,
            }));
            this.b.context = {
                notebookEditor: f
            };
            // update toolbar container css based on cell list length
            this.B(this.f.onDidChangeModel(() => {
                this.c.clear();
                if (this.f.hasModel()) {
                    this.c.add(this.f.onDidChangeViewCells(() => {
                        this.n();
                    }));
                    this.n();
                }
            }));
            this.n();
        }
        n() {
            if (this.f.hasModel() && this.f.getLength() === 0) {
                this.a.classList.add('emptyNotebook');
            }
            else {
                this.a.classList.remove('emptyNotebook');
            }
        }
    };
    exports.$lrb = $lrb;
    exports.$lrb = $lrb = __decorate([
        __param(3, instantiation_1.$Ah),
        __param(4, contextView_1.$WZ),
        __param(5, actions_1.$Su)
    ], $lrb);
});
//# sourceMappingURL=notebookTopCellToolbar.js.map