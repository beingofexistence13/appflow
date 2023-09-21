/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/editor/contrib/hover/browser/hoverTypes", "vs/editor/contrib/inlayHints/browser/inlayHintsController", "vs/editor/contrib/inlayHints/browser/inlayHintsHover"], function (require, exports, editorExtensions_1, hoverTypes_1, inlayHintsController_1, inlayHintsHover_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, editorExtensions_1.$AV)(inlayHintsController_1.$r9.ID, inlayHintsController_1.$r9, 1 /* EditorContributionInstantiation.AfterFirstRender */);
    hoverTypes_1.$j3.register(inlayHintsHover_1.$s9);
});
//# sourceMappingURL=inlayHintsContribution.js.map