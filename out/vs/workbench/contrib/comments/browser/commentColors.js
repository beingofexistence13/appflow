/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/languages", "vs/nls", "vs/platform/theme/common/colorRegistry"], function (require, exports, languages, nls, colorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getCommentThreadStateIconColor = exports.getCommentThreadStateBorderColor = exports.commentThreadStateBackgroundColorVar = exports.commentViewThreadStateColorVar = exports.commentThreadStateColorVar = exports.commentThreadRangeActiveBackground = exports.commentThreadRangeBackground = void 0;
    const resolvedCommentViewIcon = (0, colorRegistry_1.registerColor)('commentsView.resolvedIcon', { dark: colorRegistry_1.disabledForeground, light: colorRegistry_1.disabledForeground, hcDark: colorRegistry_1.contrastBorder, hcLight: colorRegistry_1.contrastBorder }, nls.localize('resolvedCommentIcon', 'Icon color for resolved comments.'));
    const unresolvedCommentViewIcon = (0, colorRegistry_1.registerColor)('commentsView.unresolvedIcon', { dark: colorRegistry_1.listFocusOutline, light: colorRegistry_1.listFocusOutline, hcDark: colorRegistry_1.contrastBorder, hcLight: colorRegistry_1.contrastBorder }, nls.localize('unresolvedCommentIcon', 'Icon color for unresolved comments.'));
    const resolvedCommentBorder = (0, colorRegistry_1.registerColor)('editorCommentsWidget.resolvedBorder', { dark: resolvedCommentViewIcon, light: resolvedCommentViewIcon, hcDark: colorRegistry_1.contrastBorder, hcLight: colorRegistry_1.contrastBorder }, nls.localize('resolvedCommentBorder', 'Color of borders and arrow for resolved comments.'));
    const unresolvedCommentBorder = (0, colorRegistry_1.registerColor)('editorCommentsWidget.unresolvedBorder', { dark: unresolvedCommentViewIcon, light: unresolvedCommentViewIcon, hcDark: colorRegistry_1.contrastBorder, hcLight: colorRegistry_1.contrastBorder }, nls.localize('unresolvedCommentBorder', 'Color of borders and arrow for unresolved comments.'));
    exports.commentThreadRangeBackground = (0, colorRegistry_1.registerColor)('editorCommentsWidget.rangeBackground', { dark: (0, colorRegistry_1.transparent)(unresolvedCommentBorder, .1), light: (0, colorRegistry_1.transparent)(unresolvedCommentBorder, .1), hcDark: (0, colorRegistry_1.transparent)(unresolvedCommentBorder, .1), hcLight: (0, colorRegistry_1.transparent)(unresolvedCommentBorder, .1) }, nls.localize('commentThreadRangeBackground', 'Color of background for comment ranges.'));
    exports.commentThreadRangeActiveBackground = (0, colorRegistry_1.registerColor)('editorCommentsWidget.rangeActiveBackground', { dark: (0, colorRegistry_1.transparent)(unresolvedCommentBorder, .1), light: (0, colorRegistry_1.transparent)(unresolvedCommentBorder, .1), hcDark: (0, colorRegistry_1.transparent)(unresolvedCommentBorder, .1), hcLight: (0, colorRegistry_1.transparent)(unresolvedCommentBorder, .1) }, nls.localize('commentThreadActiveRangeBackground', 'Color of background for currently selected or hovered comment range.'));
    const commentThreadStateBorderColors = new Map([
        [languages.CommentThreadState.Unresolved, unresolvedCommentBorder],
        [languages.CommentThreadState.Resolved, resolvedCommentBorder],
    ]);
    const commentThreadStateIconColors = new Map([
        [languages.CommentThreadState.Unresolved, unresolvedCommentViewIcon],
        [languages.CommentThreadState.Resolved, resolvedCommentViewIcon],
    ]);
    exports.commentThreadStateColorVar = '--comment-thread-state-color';
    exports.commentViewThreadStateColorVar = '--comment-view-thread-state-color';
    exports.commentThreadStateBackgroundColorVar = '--comment-thread-state-background-color';
    function getCommentThreadStateColor(state, theme, map) {
        const colorId = (state !== undefined) ? map.get(state) : undefined;
        return (colorId !== undefined) ? theme.getColor(colorId) : undefined;
    }
    function getCommentThreadStateBorderColor(state, theme) {
        return getCommentThreadStateColor(state, theme, commentThreadStateBorderColors);
    }
    exports.getCommentThreadStateBorderColor = getCommentThreadStateBorderColor;
    function getCommentThreadStateIconColor(state, theme) {
        return getCommentThreadStateColor(state, theme, commentThreadStateIconColors);
    }
    exports.getCommentThreadStateIconColor = getCommentThreadStateIconColor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWVudENvbG9ycy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NvbW1lbnRzL2Jyb3dzZXIvY29tbWVudENvbG9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFRaEcsTUFBTSx1QkFBdUIsR0FBRyxJQUFBLDZCQUFhLEVBQUMsMkJBQTJCLEVBQUUsRUFBRSxJQUFJLEVBQUUsa0NBQWtCLEVBQUUsS0FBSyxFQUFFLGtDQUFrQixFQUFFLE1BQU0sRUFBRSw4QkFBYyxFQUFFLE9BQU8sRUFBRSw4QkFBYyxFQUFFLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSxtQ0FBbUMsQ0FBQyxDQUFDLENBQUM7SUFDL1AsTUFBTSx5QkFBeUIsR0FBRyxJQUFBLDZCQUFhLEVBQUMsNkJBQTZCLEVBQUUsRUFBRSxJQUFJLEVBQUUsZ0NBQWdCLEVBQUUsS0FBSyxFQUFFLGdDQUFnQixFQUFFLE1BQU0sRUFBRSw4QkFBYyxFQUFFLE9BQU8sRUFBRSw4QkFBYyxFQUFFLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsRUFBRSxxQ0FBcUMsQ0FBQyxDQUFDLENBQUM7SUFFblEsTUFBTSxxQkFBcUIsR0FBRyxJQUFBLDZCQUFhLEVBQUMscUNBQXFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsdUJBQXVCLEVBQUUsS0FBSyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sRUFBRSw4QkFBYyxFQUFFLE9BQU8sRUFBRSw4QkFBYyxFQUFFLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsRUFBRSxtREFBbUQsQ0FBQyxDQUFDLENBQUM7SUFDblMsTUFBTSx1QkFBdUIsR0FBRyxJQUFBLDZCQUFhLEVBQUMsdUNBQXVDLEVBQUUsRUFBRSxJQUFJLEVBQUUseUJBQXlCLEVBQUUsS0FBSyxFQUFFLHlCQUF5QixFQUFFLE1B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