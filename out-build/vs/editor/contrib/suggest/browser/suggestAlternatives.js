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
define(["require", "exports", "vs/platform/contextkey/common/contextkey"], function (require, exports, contextkey_1) {
    "use strict";
    var $E6_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$E6 = void 0;
    let $E6 = class $E6 {
        static { $E6_1 = this; }
        static { this.OtherSuggestions = new contextkey_1.$2i('hasOtherSuggestions', false); }
        constructor(g, contextKeyService) {
            this.g = g;
            this.b = 0;
            this.a = $E6_1.OtherSuggestions.bindTo(contextKeyService);
        }
        dispose() {
            this.reset();
        }
        reset() {
            this.a.reset();
            this.e?.dispose();
            this.c = undefined;
            this.d = undefined;
            this.f = false;
        }
        set({ model, index }, acceptNext) {
            // no suggestions -> nothing to do
            if (model.items.length === 0) {
                this.reset();
                return;
            }
            // no alternative suggestions -> nothing to do
            const nextIndex = $E6_1.h(true, model, index);
            if (nextIndex === index) {
                this.reset();
                return;
            }
            this.d = acceptNext;
            this.c = model;
            this.b = index;
            this.e = this.g.onDidChangeCursorPosition(() => {
                if (!this.f) {
                    this.reset();
                }
            });
            this.a.set(true);
        }
        static h(fwd, model, index) {
            let newIndex = index;
            for (let rounds = model.items.length; rounds > 0; rounds--) {
                newIndex = (newIndex + model.items.length + (fwd ? +1 : -1)) % model.items.length;
                if (newIndex === index) {
                    break;
                }
                if (!model.items[newIndex].completion.additionalTextEdits) {
                    break;
                }
            }
            return newIndex;
        }
        next() {
            this.i(true);
        }
        prev() {
            this.i(false);
        }
        i(fwd) {
            if (!this.c) {
                // nothing to reason about
                return;
            }
            try {
                this.f = true;
                this.b = $E6_1.h(fwd, this.c, this.b);
                this.d({ index: this.b, item: this.c.items[this.b], model: this.c });
            }
            finally {
                this.f = false;
            }
        }
    };
    exports.$E6 = $E6;
    exports.$E6 = $E6 = $E6_1 = __decorate([
        __param(1, contextkey_1.$3i)
    ], $E6);
});
//# sourceMappingURL=suggestAlternatives.js.map