/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SimpleNotebookProviderInfo = exports.INotebookService = void 0;
    exports.INotebookService = (0, instantiation_1.createDecorator)('notebookService');
    class SimpleNotebookProviderInfo {
        constructor(viewType, serializer, extensionData) {
            this.viewType = viewType;
            this.serializer = serializer;
            this.extensionData = extensionData;
        }
    }
    exports.SimpleNotebookProviderInfo = SimpleNotebookProviderInfo;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svY29tbW9uL25vdGVib29rU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFnQm5GLFFBQUEsZ0JBQWdCLEdBQUcsSUFBQSwrQkFBZSxFQUFtQixpQkFBaUIsQ0FBQyxDQUFDO0lBcUJyRixNQUFhLDBCQUEwQjtRQUN0QyxZQUNVLFFBQWdCLEVBQ2hCLFVBQStCLEVBQy9CLGFBQTJDO1lBRjNDLGFBQVEsR0FBUixRQUFRLENBQVE7WUFDaEIsZUFBVSxHQUFWLFVBQVUsQ0FBcUI7WUFDL0Isa0JBQWEsR0FBYixhQUFhLENBQThCO1FBQ2pELENBQUM7S0FDTDtJQU5ELGdFQU1DIn0=