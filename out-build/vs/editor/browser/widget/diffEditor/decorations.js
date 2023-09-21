/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/htmlContent", "vs/base/common/themables", "vs/editor/common/model/textModel", "vs/nls!vs/editor/browser/widget/diffEditor/decorations", "vs/platform/theme/common/iconRegistry"], function (require, exports, codicons_1, htmlContent_1, themables_1, textModel_1, nls_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$KZ = exports.$JZ = exports.$IZ = exports.$HZ = exports.$GZ = exports.$FZ = exports.$EZ = exports.$DZ = exports.$CZ = exports.$BZ = exports.$AZ = exports.$zZ = exports.$yZ = void 0;
    exports.$yZ = (0, iconRegistry_1.$9u)('diff-insert', codicons_1.$Pj.add, (0, nls_1.localize)(0, null));
    exports.$zZ = (0, iconRegistry_1.$9u)('diff-remove', codicons_1.$Pj.remove, (0, nls_1.localize)(1, null));
    exports.$AZ = textModel_1.$RC.register({
        className: 'line-insert',
        description: 'line-insert',
        isWholeLine: true,
        linesDecorationsClassName: 'insert-sign ' + themables_1.ThemeIcon.asClassName(exports.$yZ),
        marginClassName: 'gutter-insert',
    });
    exports.$BZ = textModel_1.$RC.register({
        className: 'line-delete',
        description: 'line-delete',
        isWholeLine: true,
        linesDecorationsClassName: 'delete-sign ' + themables_1.ThemeIcon.asClassName(exports.$zZ),
        marginClassName: 'gutter-delete',
    });
    exports.$CZ = textModel_1.$RC.register({
        className: 'line-insert',
        description: 'line-insert',
        isWholeLine: true,
        marginClassName: 'gutter-insert',
    });
    exports.$DZ = textModel_1.$RC.register({
        className: 'line-delete',
        description: 'line-delete',
        isWholeLine: true,
        marginClassName: 'gutter-delete',
    });
    exports.$EZ = textModel_1.$RC.register({
        className: 'char-insert',
        description: 'char-insert',
        shouldFillLineOnLineBreak: true,
    });
    exports.$FZ = textModel_1.$RC.register({
        className: 'char-insert',
        description: 'char-insert',
        isWholeLine: true,
    });
    exports.$GZ = textModel_1.$RC.register({
        className: 'char-insert diff-range-empty',
        description: 'char-insert diff-range-empty',
    });
    exports.$HZ = textModel_1.$RC.register({
        className: 'char-delete',
        description: 'char-delete',
        shouldFillLineOnLineBreak: true,
    });
    exports.$IZ = textModel_1.$RC.register({
        className: 'char-delete',
        description: 'char-delete',
        isWholeLine: true,
    });
    exports.$JZ = textModel_1.$RC.register({
        className: 'char-delete diff-range-empty',
        description: 'char-delete diff-range-empty',
    });
    exports.$KZ = textModel_1.$RC.register({
        description: 'diff-editor-arrow-revert-change',
        glyphMarginHoverMessage: new htmlContent_1.$Xj(undefined, { isTrusted: true, supportThemeIcons: true })
            .appendMarkdown((0, nls_1.localize)(2, null)),
        glyphMarginClassName: 'arrow-revert-change ' + themables_1.ThemeIcon.asClassName(codicons_1.$Pj.arrowRight),
        zIndex: 10001,
    });
});
//# sourceMappingURL=decorations.js.map