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
    exports.$7Y = exports.$6Y = void 0;
    exports.$6Y = (0, instantiation_1.$Bh)('diffProviderFactoryService');
    let $7Y = class $7Y {
        constructor(a) {
            this.a = a;
        }
        createDiffProvider(editor, options) {
            return this.a.createInstance(workerBasedDocumentDiffProvider_1.$5Y, options);
        }
    };
    exports.$7Y = $7Y;
    exports.$7Y = $7Y = __decorate([
        __param(0, instantiation_1.$Ah)
    ], $7Y);
    (0, extensions_1.$mr)(exports.$6Y, $7Y, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=diffProviderFactoryService.js.map