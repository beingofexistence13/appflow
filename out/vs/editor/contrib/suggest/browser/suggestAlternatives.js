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
    var SuggestAlternatives_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SuggestAlternatives = void 0;
    let SuggestAlternatives = class SuggestAlternatives {
        static { SuggestAlternatives_1 = this; }
        static { this.OtherSuggestions = new contextkey_1.RawContextKey('hasOtherSuggestions', false); }
        constructor(_editor, contextKeyService) {
            this._editor = _editor;
            this._index = 0;
            this._ckOtherSuggestions = SuggestAlternatives_1.OtherSuggestions.bindTo(contextKeyService);
        }
        dispose() {
            this.reset();
        }
        reset() {
            this._ckOtherSuggestions.reset();
            this._listener?.dispose();
            this._model = undefined;
            this._acceptNext = undefined;
            this._ignore = false;
        }
        set({ model, index }, acceptNext) {
            // no suggestions -> nothing to do
            if (model.items.length === 0) {
                this.reset();
                return;
            }
            // no alternative suggestions -> nothing to do
            const nextIndex = SuggestAlternatives_1._moveIndex(true, model, index);
            if (nextIndex === index) {
                this.reset();
                return;
            }
            this._acceptNext = acceptNext;
            this._model = model;
            this._index = index;
            this._listener = this._editor.onDidChangeCursorPosition(() => {
                if (!this._ignore) {
                    this.reset();
                }
            });
            this._ckOtherSuggestions.set(true);
        }
        static _moveIndex(fwd, model, index) {
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
            this._move(true);
        }
        prev() {
            this._move(false);
        }
        _move(fwd) {
            if (!this._model) {
                // nothing to reason about
                return;
            }
            try {
                this._ignore = true;
                this._index = SuggestAlternatives_1._moveIndex(fwd, this._model, this._index);
                this._acceptNext({ index: this._index, item: this._model.items[this._index], model: this._model });
            }
            finally {
                this._ignore = false;
            }
        }
    };
    exports.SuggestAlternatives = SuggestAlternatives;
    exports.SuggestAlternatives = SuggestAlternatives = SuggestAlternatives_1 = __decorate([
        __param(1, contextkey_1.IContextKeyService)
    ], SuggestAlternatives);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VnZ2VzdEFsdGVybmF0aXZlcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL3N1Z2dlc3QvYnJvd3Nlci9zdWdnZXN0QWx0ZXJuYXRpdmVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFRekYsSUFBTSxtQkFBbUIsR0FBekIsTUFBTSxtQkFBbUI7O2lCQUVmLHFCQUFnQixHQUFHLElBQUksMEJBQWEsQ0FBVSxxQkFBcUIsRUFBRSxLQUFLLENBQUMsQUFBM0QsQ0FBNEQ7UUFVNUYsWUFDa0IsT0FBb0IsRUFDakIsaUJBQXFDO1lBRHhDLFlBQU8sR0FBUCxPQUFPLENBQWE7WUFQOUIsV0FBTSxHQUFXLENBQUMsQ0FBQztZQVUxQixJQUFJLENBQUMsbUJBQW1CLEdBQUcscUJBQW1CLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDM0YsQ0FBQztRQUVELE9BQU87WUFDTixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDZCxDQUFDO1FBRUQsS0FBSztZQUNKLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNqQyxJQUFJLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxDQUFDO1lBQzFCLElBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDO1lBQzdCLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ3RCLENBQUM7UUFFRCxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUF1QixFQUFFLFVBQWtEO1lBRTVGLGtDQUFrQztZQUNsQyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDN0IsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFD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