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
define(["require", "exports", "vs/editor/browser/widget/diffEditor/workerBasedDocumentDiffProvider", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation"], function (require, exports, workerBasedDocumentDiffProvider_1, extensions_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DiffProviderFactoryService = exports.IDiffProviderFactoryService = void 0;
    exports.IDiffProviderFactoryService = (0, instantiation_1.createDecorator)('diffProviderFactoryService');
    let DiffProviderFactoryService = class DiffProviderFactoryService {
        constructor(instantiationService) {
            this.instantiationService = instantiationService;
        }
        createDiffProvider(editor, options) {
            return this.instantiationService.createInstance(workerBasedDocumentDiffProvider_1.WorkerBasedDocumentDiffProvider, options);
        }
    };
    exports.DiffProviderFactoryService = DiffProviderFactoryService;
    exports.DiffProviderFactoryService = DiffProviderFactoryService = __decorate([
        __param(0, instantiation_1.IInstantiationService)
    ], DiffProviderFactoryService);
    (0, extensions_1.registerSingleton)(exports.IDiffProviderFactoryService, DiffProviderFactoryService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlmZlByb3ZpZGVyRmFjdG9yeVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvYnJvd3Nlci93aWRnZXQvZGlmZkVkaXRvci9kaWZmUHJvdmlkZXJGYWN0b3J5U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFRbkYsUUFBQSwyQkFBMkIsR0FBRyxJQUFBLCtCQUFlLEVBQThCLDRCQUE0QixDQUFDLENBQUM7SUFXL0csSUFBTSwwQkFBMEIsR0FBaEMsTUFBTSwwQkFBMEI7UUFHdEMsWUFDeUMsb0JBQTJDO1lBQTNDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7UUFDaEYsQ0FBQztRQUVMLGtCQUFrQixDQUFDLE1BQW1CLEVBQUUsT0FBcUM7WUFDNUUsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLGlFQUErQixFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzNGLENBQUM7S0FDRCxDQUFBO0lBVlksZ0VBQTBCO3lDQUExQiwwQkFBMEI7UUFJcEMsV0FBQSxxQ0FBcUIsQ0FBQTtPQUpYLDBCQUEwQixDQVV0QztJQUVELElBQUEsOEJBQWlCLEVBQUMsbUNBQTJCLEVBQUUsMEJBQTBCLG9DQUE0QixDQUFDIn0=