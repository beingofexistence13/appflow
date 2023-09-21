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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/uuid", "vs/editor/common/model/prefixSumComputer", "vs/workbench/contrib/notebook/browser/viewModel/cellOutputViewModel", "vs/workbench/contrib/notebook/common/notebookService"], function (require, exports, event_1, lifecycle_1, uuid_1, prefixSumComputer_1, cellOutputViewModel_1, notebookService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$CEb = void 0;
    let $CEb = class $CEb extends lifecycle_1.$kc {
        get id() {
            return this.a;
        }
        get outputs() {
            return this.textModel.outputs;
        }
        get language() {
            return this.textModel.language;
        }
        get metadata() {
            return this.textModel.metadata;
        }
        get uri() {
            return this.textModel.uri;
        }
        get handle() {
            return this.textModel.handle;
        }
        get outputIsHovered() {
            return this.c;
        }
        set outputIsHovered(v) {
            this.c = v;
            this.b.fire({ outputIsHoveredChanged: true });
        }
        get outputIsFocused() {
            return this.f;
        }
        set outputIsFocused(v) {
            this.f = v;
            this.b.fire({ outputIsFocusedChanged: true });
        }
        get outputsViewModels() {
            return this.g;
        }
        constructor(textModel, n) {
            super();
            this.textModel = textModel;
            this.n = n;
            this.b = this.B(new event_1.$fd());
            this.c = false;
            this.f = false;
            this.h = [];
            this.j = null;
            this.m = this.B(new event_1.$fd());
            this.onDidChangeOutputLayout = this.m.event;
            this.a = (0, uuid_1.$4f)();
            this.g = this.textModel.outputs.map(output => new cellOutputViewModel_1.$Knb(this, output, this.n));
            this.B(this.textModel.onDidChangeOutputs((splice) => {
                this.h.splice(splice.start, splice.deleteCount, ...splice.newOutputs.map(() => 0));
                const removed = this.g.splice(splice.start, splice.deleteCount, ...splice.newOutputs.map(output => new cellOutputViewModel_1.$Knb(this, output, this.n)));
                removed.forEach(vm => vm.dispose());
                this.j = null;
                this.m.fire();
            }));
            this.h = new Array(this.textModel.outputs.length);
        }
        r() {
            if (!this.j) {
                const values = new Uint32Array(this.h.length);
                for (let i = 0; i < this.h.length; i++) {
                    values[i] = this.h[i];
                }
                this.j = new prefixSumComputer_1.$Ju(values);
            }
        }
        getOutputOffset(index) {
            this.r();
            if (index >= this.h.length) {
                throw new Error('Output index out of range!');
            }
            return this.j.getPrefixSum(index - 1);
        }
        updateOutputHeight(index, height) {
            if (index >= this.h.length) {
                throw new Error('Output index out of range!');
            }
            this.r();
            this.h[index] = height;
            if (this.j.setValue(index, height)) {
                this.m.fire();
            }
        }
        getOutputTotalHeight() {
            this.r();
            return this.j?.getTotalSum() ?? 0;
        }
        dispose() {
            super.dispose();
            this.g.forEach(output => {
                output.dispose();
            });
        }
    };
    exports.$CEb = $CEb;
    exports.$CEb = $CEb = __decorate([
        __param(1, notebookService_1.$ubb)
    ], $CEb);
});
//# sourceMappingURL=diffNestedCellViewModel.js.map