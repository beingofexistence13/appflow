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
    exports.MarkerDecorationsContribution = void 0;
    let MarkerDecorationsContribution = class MarkerDecorationsContribution {
        static { this.ID = 'editor.contrib.markerDecorations'; }
        constructor(_editor, _markerDecorationsService) {
            // Doesn't do anything, just requires `IMarkerDecorationsService` to make sure it gets instantiated
        }
        dispose() {
        }
    };
    exports.MarkerDecorationsContribution = MarkerDecorationsContribution;
    exports.MarkerDecorationsContribution = MarkerDecorationsContribution = __decorate([
        __param(1, markerDecorations_1.IMarkerDecorationsService)
    ], MarkerDecorationsContribution);
    (0, editorExtensions_1.registerEditorContribution)(MarkerDecorationsContribution.ID, MarkerDecorationsContribution, 0 /* EditorContributionInstantiation.Eager */); // eager because it instantiates IMarkerDecorationsService which is responsible for rendering squiggles
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2VyRGVjb3JhdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvYnJvd3Nlci9zZXJ2aWNlcy9tYXJrZXJEZWNvcmF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFPekYsSUFBTSw2QkFBNkIsR0FBbkMsTUFBTSw2QkFBNkI7aUJBRWxCLE9BQUUsR0FBVyxrQ0FBa0MsQUFBN0MsQ0FBOEM7UUFFdkUsWUFDQyxPQUFvQixFQUNPLHlCQUFvRDtZQUUvRSxtR0FBbUc7UUFDcEcsQ0FBQztRQUVELE9BQU87UUFDUCxDQUFDOztJQVpXLHNFQUE2Qjs0Q0FBN0IsNkJBQTZCO1FBTXZDLFdBQUEsNkNBQXlCLENBQUE7T0FOZiw2QkFBNkIsQ0FhekM7SUFFRCxJQUFBLDZDQUEwQixFQUFDLDZCQUE2QixDQUFDLEVBQUUsRUFBRSw2QkFBNkIsZ0RBQXdDLENBQUMsQ0FBQyx1R0FBdUcifQ==