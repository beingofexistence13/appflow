/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/editor/contrib/hover/browser/hoverTypes", "vs/editor/contrib/inlayHints/browser/inlayHintsController", "vs/editor/contrib/inlayHints/browser/inlayHintsHover"], function (require, exports, editorExtensions_1, hoverTypes_1, inlayHintsController_1, inlayHintsHover_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, editorExtensions_1.registerEditorContribution)(inlayHintsController_1.InlayHintsController.ID, inlayHintsController_1.InlayHintsController, 1 /* EditorContributionInstantiation.AfterFirstRender */);
    hoverTypes_1.HoverParticipantRegistry.register(inlayHintsHover_1.InlayHintsHover);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5sYXlIaW50c0NvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2lubGF5SGludHMvYnJvd3Nlci9pbmxheUhpbnRzQ29udHJpYnV0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBT2hHLElBQUEsNkNBQTBCLEVBQUMsMkNBQW9CLENBQUMsRUFBRSxFQUFFLDJDQUFvQiwyREFBbUQsQ0FBQztJQUM1SCxxQ0FBd0IsQ0FBQyxRQUFRLENBQUMsaUNBQWUsQ0FBQyxDQUFDIn0=