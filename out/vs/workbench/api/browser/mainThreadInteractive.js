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
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/common/languages/modesRegistry", "vs/workbench/api/common/extHost.protocol", "vs/workbench/services/extensions/common/extHostCustomers", "vs/workbench/contrib/interactive/browser/interactiveDocumentService"], function (require, exports, lifecycle_1, modesRegistry_1, extHost_protocol_1, extHostCustomers_1, interactiveDocumentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadInteractive = void 0;
    let MainThreadInteractive = class MainThreadInteractive {
        constructor(extHostContext, interactiveDocumentService) {
            this._disposables = new lifecycle_1.DisposableStore();
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostInteractive);
            this._disposables.add(interactiveDocumentService.onWillAddInteractiveDocument((e) => {
                this._proxy.$willAddInteractiveDocument(e.inputUri, '\n', modesRegistry_1.PLAINTEXT_LANGUAGE_ID, e.notebookUri);
            }));
            this._disposables.add(interactiveDocumentService.onWillRemoveInteractiveDocument((e) => {
                this._proxy.$willRemoveInteractiveDocument(e.inputUri, e.notebookUri);
            }));
        }
        dispose() {
            this._disposables.dispose();
        }
    };
    exports.MainThreadInteractive = MainThreadInteractive;
    exports.MainThreadInteractive = MainThreadInteractive = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadInteractive),
        __param(1, interactiveDocumentService_1.IInteractiveDocumentService)
    ], MainThreadInteractive);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZEludGVyYWN0aXZlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9icm93c2VyL21haW5UaHJlYWRJbnRlcmFjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFTekYsSUFBTSxxQkFBcUIsR0FBM0IsTUFBTSxxQkFBcUI7UUFLakMsWUFDQyxjQUErQixFQUNGLDBCQUF1RDtZQUpwRSxpQkFBWSxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBTXJELElBQUksQ0FBQyxNQUFNLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxpQ0FBYyxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFFekUsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtnQkFDbkYsSUFBSSxDQUFDLE1BQU0sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxxQ0FBcUIsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDakcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLCtCQUErQixDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3RGLElBQUksQ0FBQyxNQUFNLENBQUMsOEJBQThCLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDdkUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRCxPQUFPO1lBQ04sSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUU3QixDQUFDO0tBQ0QsQ0FBQTtJQXhCWSxzREFBcUI7b0NBQXJCLHFCQUFxQjtRQURqQyxJQUFBLHVDQUFvQixFQUFDLDhCQUFXLENBQUMscUJBQXFCLENBQUM7UUFRckQsV0FBQSx3REFBMkIsQ0FBQTtPQVBqQixxQkFBcUIsQ0F3QmpDIn0=