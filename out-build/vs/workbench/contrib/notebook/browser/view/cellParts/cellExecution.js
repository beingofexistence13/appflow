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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/async", "vs/base/common/lifecycle", "vs/workbench/contrib/notebook/browser/view/cellPart", "vs/workbench/contrib/notebook/common/notebookExecutionStateService"], function (require, exports, DOM, async_1, lifecycle_1, cellPart_1, notebookExecutionStateService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$jpb = void 0;
    const UPDATE_EXECUTION_ORDER_GRACE_PERIOD = 200;
    let $jpb = class $jpb extends cellPart_1.$Hnb {
        constructor(b, g, h) {
            super();
            this.b = b;
            this.g = g;
            this.h = h;
            this.a = this.B(new lifecycle_1.$jc());
            this.B(this.b.onDidChangeActiveKernel(() => {
                if (this.c) {
                    this.a.clear();
                    if (this.b.activeKernel) {
                        this.a.add(this.b.activeKernel.onDidChange(() => {
                            if (this.c) {
                                this.j(this.c.internalMetadata);
                            }
                        }));
                    }
                    this.j(this.c.internalMetadata);
                }
            }));
        }
        didRenderCell(element) {
            this.j(element.internalMetadata, true);
        }
        j(internalMetadata, forceClear = false) {
            if (this.b.activeKernel?.implementsExecutionOrder || (!this.b.activeKernel && typeof internalMetadata.executionOrder === 'number')) {
                // If the executionOrder was just cleared, and the cell is executing, wait just a bit before clearing the view to avoid flashing
                if (typeof internalMetadata.executionOrder !== 'number' && !forceClear && !!this.h.getCellExecution(this.c.uri)) {
                    const renderingCell = this.c;
                    this.f.add((0, async_1.$Ig)(() => {
                        if (this.c === renderingCell) {
                            this.j(this.c.internalMetadata, true);
                        }
                    }, UPDATE_EXECUTION_ORDER_GRACE_PERIOD));
                    return;
                }
                const executionOrderLabel = typeof internalMetadata.executionOrder === 'number' ?
                    `[${internalMetadata.executionOrder}]` :
                    '[ ]';
                this.g.innerText = executionOrderLabel;
            }
            else {
                this.g.innerText = '';
            }
        }
        updateState(element, e) {
            if (e.internalMetadataChanged) {
                this.j(element.internalMetadata);
            }
        }
        updateInternalLayoutNow(element) {
            if (element.isInputCollapsed) {
                DOM.$eP(this.g);
            }
            else {
                DOM.$dP(this.g);
                const top = element.layoutInfo.editorHeight - 22 + element.layoutInfo.statusBarHeight;
                this.g.style.top = `${top}px`;
            }
        }
    };
    exports.$jpb = $jpb;
    exports.$jpb = $jpb = __decorate([
        __param(2, notebookExecutionStateService_1.$_H)
    ], $jpb);
});
//# sourceMappingURL=cellExecution.js.map