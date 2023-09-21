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
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/contrib/gotoSymbol/browser/peek/referencesController", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage"], function (require, exports, editorExtensions_1, codeEditorService_1, referencesController_1, configuration_1, contextkey_1, instantiation_1, notification_1, storage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$u0b = void 0;
    let $u0b = class $u0b extends referencesController_1.$M4 {
        constructor(editor, contextKeyService, editorService, notificationService, instantiationService, storageService, configurationService) {
            super(true, editor, contextKeyService, editorService, notificationService, instantiationService, storageService, configurationService);
        }
    };
    exports.$u0b = $u0b;
    exports.$u0b = $u0b = __decorate([
        __param(1, contextkey_1.$3i),
        __param(2, codeEditorService_1.$nV),
        __param(3, notification_1.$Yu),
        __param(4, instantiation_1.$Ah),
        __param(5, storage_1.$Vo),
        __param(6, configuration_1.$8h)
    ], $u0b);
    (0, editorExtensions_1.$AV)(referencesController_1.$M4.ID, $u0b, 4 /* EditorContributionInstantiation.Lazy */);
});
//# sourceMappingURL=standaloneReferenceSearch.js.map