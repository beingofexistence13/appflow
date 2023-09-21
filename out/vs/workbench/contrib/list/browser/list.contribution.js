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
define(["require", "exports", "vs/platform/contextkey/common/contextkey", "vs/platform/registry/common/platform", "vs/workbench/common/contributions"], function (require, exports, contextkey_1, platform_1, contributions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListContext = void 0;
    let ListContext = class ListContext {
        constructor(contextKeyService) {
            contextKeyService.createKey('listSupportsTypeNavigation', true);
            // @deprecated in favor of listSupportsTypeNavigation
            contextKeyService.createKey('listSupportsKeyboardNavigation', true);
        }
    };
    exports.ListContext = ListContext;
    exports.ListContext = ListContext = __decorate([
        __param(0, contextkey_1.IContextKeyService)
    ], ListContext);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(ListContext, 1 /* LifecyclePhase.Starting */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC5jb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9saXN0L2Jyb3dzZXIvbGlzdC5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBT3pGLElBQU0sV0FBVyxHQUFqQixNQUFNLFdBQVc7UUFFdkIsWUFDcUIsaUJBQXFDO1lBRXpELGlCQUFpQixDQUFDLFNBQVMsQ0FBVSw0QkFBNEIsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUV6RSxxREFBcUQ7WUFDckQsaUJBQWlCLENBQUMsU0FBUyxDQUFDLGdDQUFnQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3JFLENBQUM7S0FDRCxDQUFBO0lBVlksa0NBQVc7MEJBQVgsV0FBVztRQUdyQixXQUFBLCtCQUFrQixDQUFBO09BSFIsV0FBVyxDQVV2QjtJQUVELG1CQUFRLENBQUMsRUFBRSxDQUFrQywwQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyw2QkFBNkIsQ0FBQyxXQUFXLGtDQUEwQixDQUFDIn0=