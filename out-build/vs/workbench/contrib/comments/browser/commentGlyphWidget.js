/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/comments/browser/commentGlyphWidget", "vs/base/common/color", "vs/editor/common/model", "vs/editor/common/model/textModel", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/editor/common/languages"], function (require, exports, nls, color_1, model_1, textModel_1, colorRegistry_1, themeService_1, languages_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$8lb = exports.$7lb = void 0;
    exports.$7lb = (0, colorRegistry_1.$sv)('editorGutter.commentRangeForeground', { dark: (0, colorRegistry_1.$2y)(colorRegistry_1.$Bx, colorRegistry_1.$ww), light: (0, colorRegistry_1.$Yy)((0, colorRegistry_1.$2y)(colorRegistry_1.$Bx, colorRegistry_1.$ww), .05), hcDark: color_1.$Os.white, hcLight: color_1.$Os.black }, nls.localize(0, null));
    const overviewRulerCommentForeground = (0, colorRegistry_1.$sv)('editorOverviewRuler.commentForeground', { dark: exports.$7lb, light: exports.$7lb, hcDark: exports.$7lb, hcLight: exports.$7lb }, nls.localize(1, null));
    const overviewRulerCommentUnresolvedForeground = (0, colorRegistry_1.$sv)('editorOverviewRuler.commentUnresolvedForeground', { dark: overviewRulerCommentForeground, light: overviewRulerCommentForeground, hcDark: overviewRulerCommentForeground, hcLight: overviewRulerCommentForeground }, nls.localize(2, null));
    const editorGutterCommentGlyphForeground = (0, colorRegistry_1.$sv)('editorGutter.commentGlyphForeground', { dark: colorRegistry_1.$xw, light: colorRegistry_1.$xw, hcDark: color_1.$Os.black, hcLight: color_1.$Os.white }, nls.localize(3, null));
    (0, colorRegistry_1.$sv)('editorGutter.commentUnresolvedGlyphForeground', { dark: editorGutterCommentGlyphForeground, light: editorGutterCommentGlyphForeground, hcDark: editorGutterCommentGlyphForeground, hcLight: editorGutterCommentGlyphForeground }, nls.localize(4, null));
    class $8lb {
        static { this.description = 'comment-glyph-widget'; }
        constructor(editor, lineNumber) {
            this.e = this.f();
            this.b = editor;
            this.d = this.b.createDecorationsCollection();
            this.setLineNumber(lineNumber);
        }
        f() {
            const unresolved = this.c === languages_1.CommentThreadState.Unresolved;
            const decorationOptions = {
                description: $8lb.description,
                isWholeLine: true,
                overviewRuler: {
                    color: (0, themeService_1.$hv)(unresolved ? overviewRulerCommentUnresolvedForeground : overviewRulerCommentForeground),
                    position: model_1.OverviewRulerLane.Center
                },
                collapseOnReplaceEdit: true,
                linesDecorationsClassName: `comment-range-glyph comment-thread${unresolved ? '-unresolved' : ''}`
            };
            return textModel_1.$RC.createDynamic(decorationOptions);
        }
        setThreadState(state) {
            if (this.c !== state) {
                this.c = state;
                this.e = this.f();
                this.g();
            }
        }
        g() {
            const commentsDecorations = [{
                    range: {
                        startLineNumber: this.a, startColumn: 1,
                        endLineNumber: this.a, endColumn: 1
                    },
                    options: this.e
                }];
            this.d.set(commentsDecorations);
        }
        setLineNumber(lineNumber) {
            this.a = lineNumber;
            this.g();
        }
        getPosition() {
            const range = (this.d.length > 0 ? this.d.getRange(0) : null);
            return {
                position: {
                    lineNumber: range ? range.endLineNumber : this.a,
                    column: 1
                },
                preference: [0 /* ContentWidgetPositionPreference.EXACT */]
            };
        }
        dispose() {
            this.d.clear();
        }
    }
    exports.$8lb = $8lb;
});
//# sourceMappingURL=commentGlyphWidget.js.map