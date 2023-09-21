/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Handler = exports.EditorType = exports.isThemeColor = exports.ScrollType = void 0;
    var ScrollType;
    (function (ScrollType) {
        ScrollType[ScrollType["Smooth"] = 0] = "Smooth";
        ScrollType[ScrollType["Immediate"] = 1] = "Immediate";
    })(ScrollType || (exports.ScrollType = ScrollType = {}));
    /**
     * @internal
     */
    function isThemeColor(o) {
        return o && typeof o.id === 'string';
    }
    exports.isThemeColor = isThemeColor;
    /**
     * The type of the `IEditor`.
     */
    exports.EditorType = {
        ICodeEditor: 'vs.editor.ICodeEditor',
        IDiffEditor: 'vs.editor.IDiffEditor'
    };
    /**
     * Built-in commands.
     * @internal
     */
    var Handler;
    (function (Handler) {
        Handler["CompositionStart"] = "compositionStart";
        Handler["CompositionEnd"] = "compositionEnd";
        Handler["Type"] = "type";
        Handler["ReplacePreviousChar"] = "replacePreviousChar";
        Handler["CompositionType"] = "compositionType";
        Handler["Paste"] = "paste";
        Handler["Cut"] = "cut";
    })(Handler || (exports.Handler = Handler = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yQ29tbW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9lZGl0b3JDb21tb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBeU1oRyxJQUFrQixVQUdqQjtJQUhELFdBQWtCLFVBQVU7UUFDM0IsK0NBQVUsQ0FBQTtRQUNWLHFEQUFhLENBQUE7SUFDZCxDQUFDLEVBSGlCLFVBQVUsMEJBQVYsVUFBVSxRQUczQjtJQStYRDs7T0FFRztJQUNILFNBQWdCLFlBQVksQ0FBQyxDQUFNO1FBQ2xDLE9BQU8sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEVBQUUsS0FBSyxRQUFRLENBQUM7SUFDdEMsQ0FBQztJQUZELG9DQUVDO0lBMEhEOztPQUVHO0lBQ1UsUUFBQSxVQUFVLEdBQUc7UUFDekIsV0FBVyxFQUFFLHVCQUF1QjtRQUNwQyxXQUFXLEVBQUUsdUJBQXVCO0tBQ3BDLENBQUM7SUFFRjs7O09BR0c7SUFDSCxJQUFrQixPQVFqQjtJQVJELFdBQWtCLE9BQU87UUFDeEIsZ0RBQXFDLENBQUE7UUFDckMsNENBQWlDLENBQUE7UUFDakMsd0JBQWEsQ0FBQTtRQUNiLHNEQUEyQyxDQUFBO1FBQzNDLDhDQUFtQyxDQUFBO1FBQ25DLDBCQUFlLENBQUE7UUFDZixzQkFBVyxDQUFBO0lBQ1osQ0FBQyxFQVJpQixPQUFPLHVCQUFQLE9BQU8sUUFReEIifQ==