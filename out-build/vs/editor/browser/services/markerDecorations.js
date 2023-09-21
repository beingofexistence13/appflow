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
define(["require", "exports", "vs/editor/common/services/markerDecorations", "vs/editor/browser/editorExtensions"], function (require, exports, markerDecorations_1, editorExtensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$iW = void 0;
    let $iW = class $iW {
        static { this.ID = 'editor.contrib.markerDecorations'; }
        constructor(_editor, _markerDecorationsService) {
            // Doesn't do anything, just requires `IMarkerDecorationsService` to make sure it gets instantiated
        }
        dispose() {
        }
    };
    exports.$iW = $iW;
    exports.$iW = $iW = __decorate([
        __param(1, markerDecorations_1.$hW)
    ], $iW);
    (0, editorExtensions_1.$AV)($iW.ID, $iW, 0 /* EditorContributionInstantiation.Eager */); // eager because it instantiates IMarkerDecorationsService which is responsible for rendering squiggles
});
//# sourceMappingURL=markerDecorations.js.map