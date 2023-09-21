/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/iconLabel/iconLabels"], function (require, exports, dom_1, iconLabels_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SimpleIconLabel = void 0;
    class SimpleIconLabel {
        constructor(_container) {
            this._container = _container;
        }
        set text(text) {
            (0, dom_1.reset)(this._container, ...(0, iconLabels_1.renderLabelWithIcons)(text ?? ''));
        }
        set title(title) {
            this._container.title = title;
        }
    }
    exports.SimpleIconLabel = SimpleIconLabel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ltcGxlSWNvbkxhYmVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9icm93c2VyL3VpL2ljb25MYWJlbC9zaW1wbGVJY29uTGFiZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBS2hHLE1BQWEsZUFBZTtRQUUzQixZQUNrQixVQUF1QjtZQUF2QixlQUFVLEdBQVYsVUFBVSxDQUFhO1FBQ3JDLENBQUM7UUFFTCxJQUFJLElBQUksQ0FBQyxJQUFZO1lBQ3BCLElBQUEsV0FBSyxFQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsR0FBRyxJQUFBLGlDQUFvQixFQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzdELENBQUM7UUFFRCxJQUFJLEtBQUssQ0FBQyxLQUFhO1lBQ3RCLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUMvQixDQUFDO0tBQ0Q7SUFiRCwwQ0FhQyJ9