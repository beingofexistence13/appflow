/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/editor/contrib/hover/browser/hoverTypes", "vs/editor/contrib/inlineCompletions/browser/commands", "vs/editor/contrib/inlineCompletions/browser/hoverParticipant", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionsController", "vs/platform/actions/common/actions"], function (require, exports, editorExtensions_1, hoverTypes_1, commands_1, hoverParticipant_1, inlineCompletionsController_1, actions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, editorExtensions_1.$AV)(inlineCompletionsController_1.$V8.ID, inlineCompletionsController_1.$V8, 3 /* EditorContributionInstantiation.Eventually */);
    (0, editorExtensions_1.$xV)(commands_1.$Y8);
    (0, editorExtensions_1.$xV)(commands_1.$W8);
    (0, editorExtensions_1.$xV)(commands_1.$X8);
    (0, editorExtensions_1.$xV)(commands_1.$Z8);
    (0, editorExtensions_1.$xV)(commands_1.$18);
    (0, editorExtensions_1.$xV)(commands_1.$28);
    (0, editorExtensions_1.$xV)(commands_1.$38);
    (0, actions_1.$Xu)(commands_1.$48);
    hoverTypes_1.$j3.register(hoverParticipant_1.$68);
});
//# sourceMappingURL=inlineCompletions.contribution.js.map