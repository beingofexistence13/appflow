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
    var $s6_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$s6 = void 0;
    let $s6 = class $s6 {
        static { $s6_1 = this; }
        static { this.AtEnd = new contextkey_1.$2i('atEndOfWord', false); }
        constructor(f, contextKeyService) {
            this.f = f;
            this.c = false;
            this.a = $s6_1.AtEnd.bindTo(contextKeyService);
            this.b = this.f.onDidChangeConfiguration(e => e.hasChanged(122 /* EditorOption.tabCompletion */) && this.g());
            this.g();
        }
        dispose() {
            this.b.dispose();
            this.d?.dispose();
            this.a.reset();
        }
        g() {
            // only update this when tab completions are enabled
            const enabled = this.f.getOption(122 /* EditorOption.tabCompletion */) === 'on';
            if (this.c === enabled) {
                return;
            }
            this.c = enabled;
            if (this.c) {
                const checkForWordEnd = () => {
                    if (!this.f.hasModel()) {
                        this.a.set(false);
                        return;
                    }
                    const model = this.f.getModel();
                    const selection = this.f.getSelection();
                    const word = model.getWordAtPosition(selection.getStartPosition());
                    if (!word) {
                        this.a.set(false);
                        return;
                    }
                    this.a.set(word.endColumn === selection.getStartPosition().column);
                };
                this.d = this.f.onDidChangeCursorSelection(checkForWordEnd);
                checkForWordEnd();
            }
            else if (this.d) {
                this.a.reset();
                this.d.dispose();
                this.d = undefined;
            }
        }
    };
    exports.$s6 = $s6;
    exports.$s6 = $s6 = $s6_1 = __decorate([
        __param(1, contextkey_1.$3i)
    ], $s6);
});
//# sourceMappingURL=wordContextKey.js.map