/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/event"], function (require, exports, lifecycle_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$vob = void 0;
    class $vob extends lifecycle_1.$kc {
        get markupInput() {
            return this.b;
        }
        set markupInput(value) {
            if (this.b !== value) {
                this.b = value;
                this.a.fire({ markupInput: value });
            }
        }
        get markupPreview() {
            return this.c;
        }
        set markupPreview(value) {
            if (this.c !== value) {
                this.c = value;
                this.a.fire({ markupPreview: value });
            }
        }
        get codeInput() {
            return this.f;
        }
        set codeInput(value) {
            if (this.f !== value) {
                this.f = value;
                this.a.fire({ codeInput: value });
            }
        }
        get codeOutput() {
            return this.g;
        }
        set codeOutput(value) {
            if (this.g !== value) {
                this.g = value;
                this.a.fire({ codeOutput: value });
            }
        }
        constructor(markupInput, markupPreview, codeInput, codeOutput) {
            super();
            this.a = this.B(new event_1.$fd());
            this.onDidChange = this.a.event;
            this.b = true;
            this.c = true;
            this.f = true;
            this.g = true;
            this.b = markupInput;
            this.c = markupPreview;
            this.f = codeInput;
            this.g = codeOutput;
            this.h = markupInput;
            this.j = markupPreview;
            this.m = codeInput;
            this.n = codeOutput;
        }
        isModified() {
            return (this.b !== this.h
                || this.c !== this.j
                || this.f !== this.m
                || this.g !== this.n);
        }
        update(v) {
            this.b = v.markupInput;
            this.c = v.markupPreview;
            this.f = v.codeInput;
            this.g = v.codeOutput;
        }
    }
    exports.$vob = $vob;
});
//# sourceMappingURL=findFilters.js.map