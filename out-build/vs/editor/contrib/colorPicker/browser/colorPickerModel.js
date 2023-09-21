/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event"], function (require, exports, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$g3 = void 0;
    class $g3 {
        get color() {
            return this.a;
        }
        set color(color) {
            if (this.a.equals(color)) {
                return;
            }
            this.a = color;
            this.d.fire(color);
        }
        get presentation() { return this.colorPresentations[this.f]; }
        get colorPresentations() {
            return this.b;
        }
        set colorPresentations(colorPresentations) {
            this.b = colorPresentations;
            if (this.f > colorPresentations.length - 1) {
                this.f = 0;
            }
            this.e.fire(this.presentation);
        }
        constructor(color, availableColorPresentations, f) {
            this.f = f;
            this.c = new event_1.$fd();
            this.onColorFlushed = this.c.event;
            this.d = new event_1.$fd();
            this.onDidChangeColor = this.d.event;
            this.e = new event_1.$fd();
            this.onDidChangePresentation = this.e.event;
            this.originalColor = color;
            this.a = color;
            this.b = availableColorPresentations;
        }
        selectNextColorPresentation() {
            this.f = (this.f + 1) % this.colorPresentations.length;
            this.flushColor();
            this.e.fire(this.presentation);
        }
        guessColorPresentation(color, originalText) {
            let presentationIndex = -1;
            for (let i = 0; i < this.colorPresentations.length; i++) {
                if (originalText.toLowerCase() === this.colorPresentations[i].label) {
                    presentationIndex = i;
                    break;
                }
            }
            if (presentationIndex === -1) {
                // check which color presentation text has same prefix as original text's prefix
                const originalTextPrefix = originalText.split('(')[0].toLowerCase();
                for (let i = 0; i < this.colorPresentations.length; i++) {
                    if (this.colorPresentations[i].label.toLowerCase().startsWith(originalTextPrefix)) {
                        presentationIndex = i;
                        break;
                    }
                }
            }
            if (presentationIndex !== -1 && presentationIndex !== this.f) {
                this.f = presentationIndex;
                this.e.fire(this.presentation);
            }
        }
        flushColor() {
            this.c.fire(this.a);
        }
    }
    exports.$g3 = $g3;
});
//# sourceMappingURL=colorPickerModel.js.map