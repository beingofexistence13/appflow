/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isResolvedTextEditorModel = exports.ITextModelService = void 0;
    exports.ITextModelService = (0, instantiation_1.createDecorator)('textModelService');
    function isResolvedTextEditorModel(model) {
        const candidate = model;
        return !!candidate.textEditorModel;
    }
    exports.isResolvedTextEditorModel = isResolvedTextEditorModel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZXJTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9zZXJ2aWNlcy9yZXNvbHZlclNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBU25GLFFBQUEsaUJBQWlCLEdBQUcsSUFBQSwrQkFBZSxFQUFvQixrQkFBa0IsQ0FBQyxDQUFDO0lBOER4RixTQUFnQix5QkFBeUIsQ0FBQyxLQUF1QjtRQUNoRSxNQUFNLFNBQVMsR0FBRyxLQUFpQyxDQUFDO1FBRXBELE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUM7SUFDcEMsQ0FBQztJQUpELDhEQUlDIn0=