/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/languages", "vs/nls!vs/workbench/contrib/comments/browser/commentColors", "vs/platform/theme/common/colorRegistry"], function (require, exports, languages, nls, colorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Ulb = exports.$Tlb = exports.$Slb = exports.$Rlb = exports.$Qlb = exports.$Plb = exports.$Olb = void 0;
    const resolvedCommentViewIcon = (0, colorRegistry_1.$sv)('commentsView.resolvedIcon', { dark: colorRegistry_1.$vv, light: colorRegistry_1.$vv, hcDark: colorRegistry_1.$Av, hcLight: colorRegistry_1.$Av }, nls.localize(0, null));
    const unresolvedCommentViewIcon = (0, colorRegistry_1.$sv)('commentsView.unresolvedIcon', { dark: colorRegistry_1.$wx, light: colorRegistry_1.$wx, hcDark: colorRegistry_1.$Av, hcLight: colorRegistry_1.$Av }, nls.localize(1, null));
    const resolvedCommentBorder = (0, colorRegistry_1.$sv)('editorCommentsWidget.resolvedBorder', { dark: resolvedCommentViewIcon, light: resolvedCommentViewIcon, hcDark: colorRegistry_1.$Av, hcLight: colorRegistry_1.$Av }, nls.localize(2, null));
    const unresolvedCommentBorder = (0, colorRegistry_1.$sv)('editorCommentsWidget.unresolvedBorder', { dark: unresolvedCommentViewIcon, light: unresolvedCommentViewIcon, hcDark: colorRegistry_1.$Av, hcLight: colorRegistry_1.$Av }, nls.localize(3, null));
    exports.$Olb = (0, colorRegistry_1.$sv)('editorCommentsWidget.rangeBackground', { dark: (0, colorRegistry_1.$1y)(unresolvedCommentBorder, .1), light: (0, colorRegistry_1.$1y)(unresolvedCommentBorder, .1), hcDark: (0, colorRegistry_1.$1y)(unresolvedCommentBorder, .1), hcLight: (0, colorRegistry_1.$1y)(unresolvedCommentBorder, .1) }, nls.localize(4, null));
    exports.$Plb = (0, colorRegistry_1.$sv)('editorCommentsWidget.rangeActiveBackground', { dark: (0, colorRegistry_1.$1y)(unresolvedCommentBorder, .1), light: (0, colorRegistry_1.$1y)(unresolvedCommentBorder, .1), hcDark: (0, colorRegistry_1.$1y)(unresolvedCommentBorder, .1), hcLight: (0, colorRegistry_1.$1y)(unresolvedCommentBorder, .1) }, nls.localize(5, null));
    const commentThreadStateBorderColors = new Map([
        [languages.CommentThreadState.Unresolved, unresolvedCommentBorder],
        [languages.CommentThreadState.Resolved, resolvedCommentBorder],
    ]);
    const commentThreadStateIconColors = new Map([
        [languages.CommentThreadState.Unresolved, unresolvedCommentViewIcon],
        [languages.CommentThreadState.Resolved, resolvedCommentViewIcon],
    ]);
    exports.$Qlb = '--comment-thread-state-color';
    exports.$Rlb = '--comment-view-thread-state-color';
    exports.$Slb = '--comment-thread-state-background-color';
    function getCommentThreadStateColor(state, theme, map) {
        const colorId = (state !== undefined) ? map.get(state) : undefined;
        return (colorId !== undefined) ? theme.getColor(colorId) : undefined;
    }
    function $Tlb(state, theme) {
        return getCommentThreadStateColor(state, theme, commentThreadStateBorderColors);
    }
    exports.$Tlb = $Tlb;
    function $Ulb(state, theme) {
        return getCommentThreadStateColor(state, theme, commentThreadStateIconColors);
    }
    exports.$Ulb = $Ulb;
});
//# sourceMappingURL=commentColors.js.map