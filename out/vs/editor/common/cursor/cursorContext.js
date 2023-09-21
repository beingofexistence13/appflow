/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CursorContext = void 0;
    class CursorContext {
        constructor(model, viewModel, coordinatesConverter, cursorConfig) {
            this._cursorContextBrand = undefined;
            this.model = model;
            this.viewModel = viewModel;
            this.coordinatesConverter = coordinatesConverter;
            this.cursorConfig = cursorConfig;
        }
    }
    exports.CursorContext = CursorContext;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3Vyc29yQ29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vY3Vyc29yL2N1cnNvckNvbnRleHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTWhHLE1BQWEsYUFBYTtRQVF6QixZQUFZLEtBQWlCLEVBQUUsU0FBNkIsRUFBRSxvQkFBMkMsRUFBRSxZQUFpQztZQVA1SSx3QkFBbUIsR0FBUyxTQUFTLENBQUM7WUFRckMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDbkIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7WUFDM0IsSUFBSSxDQUFDLG9CQUFvQixHQUFHLG9CQUFvQixDQUFDO1lBQ2pELElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO1FBQ2xDLENBQUM7S0FDRDtJQWRELHNDQWNDIn0=