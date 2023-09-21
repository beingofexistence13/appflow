/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions"], function (require, exports, lifecycle_1, editorExtensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LongLinesHelper extends lifecycle_1.$kc {
        static { this.ID = 'editor.contrib.longLinesHelper'; }
        static get(editor) {
            return editor.getContribution(LongLinesHelper.ID);
        }
        constructor(a) {
            super();
            this.a = a;
            this.B(this.a.onMouseDown((e) => {
                const stopRenderingLineAfter = this.a.getOption(116 /* EditorOption.stopRenderingLineAfter */);
                if (stopRenderingLineAfter >= 0 && e.target.type === 6 /* MouseTargetType.CONTENT_TEXT */ && e.target.position.column >= stopRenderingLineAfter) {
                    this.a.updateOptions({
                        stopRenderingLineAfter: -1
                    });
                }
            }));
        }
    }
    (0, editorExtensions_1.$AV)(LongLinesHelper.ID, LongLinesHelper, 2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
});
//# sourceMappingURL=longLinesHelper.js.map