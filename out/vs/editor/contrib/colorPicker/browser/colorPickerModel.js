/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event"], function (require, exports, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ColorPickerModel = void 0;
    class ColorPickerModel {
        get color() {
            return this._color;
        }
        set color(color) {
            if (this._color.equals(color)) {
                return;
            }
            this._color = color;
            this._onDidChangeColor.fire(color);
        }
        get presentation() { return this.colorPresentations[this.presentationIndex]; }
        get colorPresentations() {
            return this._colorPresentations;
        }
        set colorPresentations(colorPresentations) {
            this._colorPresentations = colorPresentations;
            if (this.presentationIndex > colorPresentations.length - 1) {
                this.presentationIndex = 0;
            }
            this._onDidChangePresentation.fire(this.presentation);
        }
        constructor(color, availableColorPresentations, presentationIndex) {
            this.presentationIndex = presentationIndex;
            this._onColorFlushed = new event_1.Emitter();
            this.onColorFlushed = this._onColorFlushed.event;
            this._onDidChangeColor = new event_1.Emitter();
            this.onDidChangeColor = this._onDidChangeColor.event;
            this._onDidChangePresentation = new event_1.Emitter();
            this.onDidChangePresentation = this._onDidChangePresentation.event;
            this.originalColor = color;
            this._color = color;
            this._colorPresentations = availableColorPresentations;
        }
        selectNextColorPresentation() {
            this.presentationIndex = (this.presentationIndex + 1) % this.colorPresentations.length;
            this.flushColor();
            this._onDidChangePresentation.fire(this.presentation);
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
            if (presentationIndex !== -1 && presentationIndex !== this.presentationIndex) {
                this.presentationIndex = presentationIndex;
                this._onDidChangePresentation.fire(this.presentation);
            }
        }
        flushColor() {
            this._onColorFlushed.fire(this._color);
        }
    }
    exports.ColorPickerModel = ColorPickerModel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3JQaWNrZXJNb2RlbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2NvbG9yUGlja2VyL2Jyb3dzZXIvY29sb3JQaWNrZXJNb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFNaEcsTUFBYSxnQkFBZ0I7UUFLNUIsSUFBSSxLQUFLO1lBQ1IsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3BCLENBQUM7UUFFRCxJQUFJLEtBQUssQ0FBQyxLQUFZO1lBQ3JCLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQzlCLE9BQU87YUFDUDtZQUVELElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1lBQ3BCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDcEMsQ0FBQztRQUVELElBQUksWUFBWSxLQUF5QixPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFJbEcsSUFBSSxrQkFBa0I7WUFDckIsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUM7UUFDakMsQ0FBQztRQUVELElBQUksa0JBQWtCLENBQUMsa0JBQXdDO1lBQzlELElBQUksQ0FBQyxtQkFBbUIsR0FBRyxrQkFBa0IsQ0FBQztZQUM5QyxJQUFJLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUMzRCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO2FBQzNCO1lBQ0QsSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDdkQsQ0FBQztRQVdELFlBQVksS0FBWSxFQUFFLDJCQUFpRCxF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