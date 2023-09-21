/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextEditorSelectionSource = exports.TextEditorSelectionRevealType = exports.EditorOpenSource = exports.EditorResolution = exports.EditorActivation = void 0;
    var EditorActivation;
    (function (EditorActivation) {
        /**
         * Activate the editor after it opened. This will automatically restore
         * the editor if it is minimized.
         */
        EditorActivation[EditorActivation["ACTIVATE"] = 1] = "ACTIVATE";
        /**
         * Only restore the editor if it is minimized but do not activate it.
         *
         * Note: will only work in combination with the `preserveFocus: true` option.
         * Otherwise, if focus moves into the editor, it will activate and restore
         * automatically.
         */
        EditorActivation[EditorActivation["RESTORE"] = 2] = "RESTORE";
        /**
         * Preserve the current active editor.
         *
         * Note: will only work in combination with the `preserveFocus: true` option.
         * Otherwise, if focus moves into the editor, it will activate and restore
         * automatically.
         */
        EditorActivation[EditorActivation["PRESERVE"] = 3] = "PRESERVE";
    })(EditorActivation || (exports.EditorActivation = EditorActivation = {}));
    var EditorResolution;
    (function (EditorResolution) {
        /**
         * Displays a picker and allows the user to decide which editor to use.
         */
        EditorResolution[EditorResolution["PICK"] = 0] = "PICK";
        /**
         * Only exclusive editors are considered.
         */
        EditorResolution[EditorResolution["EXCLUSIVE_ONLY"] = 1] = "EXCLUSIVE_ONLY";
    })(EditorResolution || (exports.EditorResolution = EditorResolution = {}));
    var EditorOpenSource;
    (function (EditorOpenSource) {
        /**
         * Default: the editor is opening via a programmatic call
         * to the editor service API.
         */
        EditorOpenSource[EditorOpenSource["API"] = 0] = "API";
        /**
         * Indicates that a user action triggered the opening, e.g.
         * via mouse or keyboard use.
         */
        EditorOpenSource[EditorOpenSource["USER"] = 1] = "USER";
    })(EditorOpenSource || (exports.EditorOpenSource = EditorOpenSource = {}));
    var TextEditorSelectionRevealType;
    (function (TextEditorSelectionRevealType) {
        /**
         * Option to scroll vertically or horizontally as necessary and reveal a range centered vertically.
         */
        TextEditorSelectionRevealType[TextEditorSelectionRevealType["Center"] = 0] = "Center";
        /**
         * Option to scroll vertically or horizontally as necessary and reveal a range centered vertically only if it lies outside the viewport.
         */
        TextEditorSelectionRevealType[TextEditorSelectionRevealType["CenterIfOutsideViewport"] = 1] = "CenterIfOutsideViewport";
        /**
         * Option to scroll vertically or horizontally as necessary and reveal a range close to the top of the viewport, but not quite at the top.
         */
        TextEditorSelectionRevealType[TextEditorSelectionRevealType["NearTop"] = 2] = "NearTop";
        /**
         * Option to scroll vertically or horizontally as necessary and reveal a range close to the top of the viewport, but not quite at the top.
         * Only if it lies outside the viewport
         */
        TextEditorSelectionRevealType[TextEditorSelectionRevealType["NearTopIfOutsideViewport"] = 3] = "NearTopIfOutsideViewport";
    })(TextEditorSelectionRevealType || (exports.TextEditorSelectionRevealType = TextEditorSelectionRevealType = {}));
    var TextEditorSelectionSource;
    (function (TextEditorSelectionSource) {
        /**
         * Programmatic source indicates a selection change that
         * was not triggered by the user via keyboard or mouse
         * but through text editor APIs.
         */
        TextEditorSelectionSource["PROGRAMMATIC"] = "api";
        /**
         * Navigation source indicates a selection change that
         * was caused via some command or UI component such as
         * an outline tree.
         */
        TextEditorSelectionSource["NAVIGATION"] = "code.navigation";
        /**
         * Jump source indicates a selection change that
         * was caused from within the text editor to another
         * location in the same or different text editor such
         * as "Go to definition".
         */
        TextEditorSelectionSource["JUMP"] = "code.jump";
    })(TextEditorSelectionSource || (exports.TextEditorSelectionSource = TextEditorSelectionSource = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vZWRpdG9yL2NvbW1vbi9lZGl0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBbUloRyxJQUFZLGdCQXlCWDtJQXpCRCxXQUFZLGdCQUFnQjtRQUUzQjs7O1dBR0c7UUFDSCwrREFBWSxDQUFBO1FBRVo7Ozs7OztXQU1HO1FBQ0gsNkRBQU8sQ0FBQTtRQUVQOzs7Ozs7V0FNRztRQUNILCtEQUFRLENBQUE7SUFDVCxDQUFDLEVBekJXLGdCQUFnQixnQ0FBaEIsZ0JBQWdCLFFBeUIzQjtJQUVELElBQVksZ0JBV1g7SUFYRCxXQUFZLGdCQUFnQjtRQUUzQjs7V0FFRztRQUNILHVEQUFJLENBQUE7UUFFSjs7V0FFRztRQUNILDJFQUFjLENBQUE7SUFDZixDQUFDLEVBWFcsZ0JBQWdCLGdDQUFoQixnQkFBZ0IsUUFXM0I7SUFFRCxJQUFZLGdCQWFYO0lBYkQsV0FBWSxnQkFBZ0I7UUFFM0I7OztXQUdHO1FBQ0gscURBQUcsQ0FBQTtRQUVIOzs7V0FHRztRQUNILHVEQUFJLENBQUE7SUFDTCxDQUFDLEVBYlcsZ0JBQWdCLGdDQUFoQixnQkFBZ0IsUUFhM0I7SUF3SEQsSUFBa0IsNkJBcUJqQjtJQXJCRCxXQUFrQiw2QkFBNkI7UUFDOUM7O1dBRUc7UUFDSCxxRkFBVSxDQUFBO1FBRVY7O1dBRUc7UUFDSCx1SEFBMkIsQ0FBQTtRQUUzQjs7V0FFRztRQUNILHVGQUFXLENBQUE7UUFFWDs7O1dBR0c7UUFDSCx5SEFBNEIsQ0FBQTtJQUM3QixDQUFDLEVBckJpQiw2QkFBNkIsNkNBQTdCLDZCQUE2QixRQXFCOUM7SUFFRCxJQUFrQix5QkF1QmpCO0lBdkJELFdBQWtCLHlCQUF5QjtRQUUxQzs7OztXQUlHO1FBQ0gsaURBQW9CLENBQUE7UUFFcEI7Ozs7V0FJRztRQUNILDJEQUE4QixDQUFBO1FBRTlCOzs7OztXQUtHO1FBQ0gsK0NBQWtCLENBQUE7SUFDbkIsQ0FBQyxFQXZCaUIseUJBQXlCLHlDQUF6Qix5QkFBeUIsUUF1QjFDIn0=