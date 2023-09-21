/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/editor/contrib/stickyScroll/browser/stickyScrollActions", "vs/editor/contrib/stickyScroll/browser/stickyScrollController", "vs/platform/actions/common/actions"], function (require, exports, editorExtensions_1, stickyScrollActions_1, stickyScrollController_1, actions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, editorExtensions_1.registerEditorContribution)(stickyScrollController_1.StickyScrollController.ID, stickyScrollController_1.StickyScrollController, 1 /* EditorContributionInstantiation.AfterFirstRender */);
    (0, actions_1.registerAction2)(stickyScrollActions_1.ToggleStickyScroll);
    (0, actions_1.registerAction2)(stickyScrollActions_1.FocusStickyScroll);
    (0, actions_1.registerAction2)(stickyScrollActions_1.SelectPreviousStickyScrollLine);
    (0, actions_1.registerAction2)(stickyScrollActions_1.SelectNextStickyScrollLine);
    (0, actions_1.registerAction2)(stickyScrollActions_1.GoToStickyScrollLine);
    (0, actions_1.registerAction2)(stickyScrollActions_1.SelectEditor);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RpY2t5U2Nyb2xsQ29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvc3RpY2t5U2Nyb2xsL2Jyb3dzZXIvc3RpY2t5U2Nyb2xsQ29udHJpYnV0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBT2hHLElBQUEsNkNBQTBCLEVBQUMsK0NBQXNCLENBQUMsRUFBRSxFQUFFLCtDQUFzQiwyREFBbUQsQ0FBQztJQUNoSSxJQUFBLHlCQUFlLEVBQUMsd0NBQWtCLENBQUMsQ0FBQztJQUNwQyxJQUFBLHlCQUFlLEVBQUMsdUNBQWlCLENBQUMsQ0FBQztJQUNuQyxJQUFBLHlCQUFlLEVBQUMsb0RBQThCLENBQUMsQ0FBQztJQUNoRCxJQUFBLHlCQUFlLEVBQUMsZ0RBQTBCLENBQUMsQ0FBQztJQUM1QyxJQUFBLHlCQUFlLEVBQUMsMENBQW9CLENBQUMsQ0FBQztJQUN0QyxJQUFBLHlCQUFlLEVBQUMsa0NBQVksQ0FBQyxDQUFDIn0=