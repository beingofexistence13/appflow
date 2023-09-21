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
    var WordContextKey_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WordContextKey = void 0;
    let WordContextKey = class WordContextKey {
        static { WordContextKey_1 = this; }
        static { this.AtEnd = new contextkey_1.RawContextKey('atEndOfWord', false); }
        constructor(_editor, contextKeyService) {
            this._editor = _editor;
            this._enabled = false;
            this._ckAtEnd = WordContextKey_1.AtEnd.bindTo(contextKeyService);
            this._configListener = this._editor.onDidChangeConfiguration(e => e.hasChanged(122 /* EditorOption.tabCompletion */) && this._update());
            this._update();
        }
        dispose() {
            this._configListener.dispose();
            this._selectionListener?.dispose();
            this._ckAtEnd.reset();
        }
        _update() {
            // only update this when tab completions are enabled
            const enabled = this._editor.getOption(122 /* EditorOption.tabCompletion */) === 'on';
            if (this._enabled === enabled) {
                return;
            }
            this._enabled = enabled;
            if (this._enabled) {
                const checkForWordEnd = () => {
                    if (!this._editor.hasModel()) {
                        this._ckAtEnd.set(false);
                        return;
                    }
                    const model = this._editor.getModel();
                    const selection = this._editor.getSelection();
                    const word = model.getWordAtPosition(selection.getStartPosition());
                    if (!word) {
                        this._ckAtEnd.set(false);
                        return;
                    }
                    this._ckAtEnd.set(word.endColumn === selection.getStartPosition().column);
                };
                this._selectionListener = this._editor.onDidChangeCursorSelection(checkForWordEnd);
                checkForWordEnd();
            }
            else if (this._selectionListener) {
                this._ckAtEnd.reset();
                this._selectionListener.dispose();
                this._selectionListener = undefined;
            }
        }
    };
    exports.WordContextKey = WordContextKey;
    exports.WordContextKey = WordContextKey = WordContextKey_1 = __decorate([
        __param(1, contextkey_1.IContextKeyService)
    ], WordContextKey);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29yZENvbnRleHRLZXkuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9zdWdnZXN0L2Jyb3dzZXIvd29yZENvbnRleHRLZXkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQU96RixJQUFNLGNBQWMsR0FBcEIsTUFBTSxjQUFjOztpQkFFVixVQUFLLEdBQUcsSUFBSSwwQkFBYSxDQUFVLGFBQWEsRUFBRSxLQUFLLENBQUMsQUFBbkQsQ0FBb0Q7UUFRekUsWUFDa0IsT0FBb0IsRUFDakIsaUJBQXFDO1lBRHhDLFlBQU8sR0FBUCxPQUFPLENBQWE7WUFKOUIsYUFBUSxHQUFZLEtBQUssQ0FBQztZQVFqQyxJQUFJLENBQUMsUUFBUSxHQUFHLGdCQUFjLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQy9ELElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLHNDQUE0QixJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQzlILElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNoQixDQUFDO1FBRUQsT0FBTztZQUNOLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDL0IsSUFBSSxDQUFDLGtCQUFrQixFQUFFLE9BQU8sRUFBRSxDQUFDO1lBQ25DLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDdkIsQ0FBQztRQUVPLE9BQU87WUFDZCxvREFBb0Q7WUFDcEQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLHNDQUE0QixLQUFLLElBQUksQ0FBQztZQUM1RSxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssT0FBTyxFQUFFO2dCQUM5QixPQUFPO2FBQ1A7WUFDRCxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztZQUV4QixJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2xCLE1BQU0sZUFBZSxHQUFHLEdBQUcsRUFBRTtvQkFDNUIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUU7d0JBQzdCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUN6QixPQUFPO3FCQUNQO29CQUNELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7b0JBQ3RDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLENBQUM7b0JBQzlDLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO29CQUNuRSxJQUFJLENBQUMsSUFBSSxFQUFFO3dCQUNWLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUN6QixPQUFPO3FCQUNQO29CQUNELElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLEtBQUssU0FBUyxDQUFDLGdCQUFnQixFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzNFLENBQUMsQ0FBQztnQkFDRixJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFDbkYsZUFBZSxFQUFFLENBQUM7YUFFbEI7aUJBQU0sSUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7Z0JBQ25DLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ3RCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDbEMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLFNBQVMsQ0FBQzthQUNwQztRQUNGLENBQUM7O0lBekRXLHdDQUFjOzZCQUFkLGNBQWM7UUFZeEIsV0FBQSwrQkFBa0IsQ0FBQTtPQVpSLGNBQWMsQ0EwRDFCIn0=