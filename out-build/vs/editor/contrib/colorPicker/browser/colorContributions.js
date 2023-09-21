/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/common/core/range", "vs/editor/contrib/colorPicker/browser/colorDetector", "vs/editor/contrib/colorPicker/browser/colorHoverParticipant", "vs/editor/contrib/hover/browser/hover", "vs/editor/contrib/hover/browser/hoverTypes"], function (require, exports, lifecycle_1, editorExtensions_1, range_1, colorDetector_1, colorHoverParticipant_1, hover_1, hoverTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$R6 = void 0;
    class $R6 extends lifecycle_1.$kc {
        static { this.ID = 'editor.contrib.colorContribution'; }
        static { this.RECOMPUTE_TIME = 1000; } // ms
        constructor(a) {
            super();
            this.a = a;
            this.B(a.onMouseDown((e) => this.b(e)));
        }
        dispose() {
            super.dispose();
        }
        b(mouseEvent) {
            const colorDecoratorsActivatedOn = this.a.getOption(146 /* EditorOption.colorDecoratorsActivatedOn */);
            if (colorDecoratorsActivatedOn !== 'click' && colorDecoratorsActivatedOn !== 'clickAndHover') {
                return;
            }
            const target = mouseEvent.target;
            if (target.type !== 6 /* MouseTargetType.CONTENT_TEXT */) {
                return;
            }
            if (!target.detail.injectedText) {
                return;
            }
            if (target.detail.injectedText.options.attachedData !== colorDetector_1.$d3) {
                return;
            }
            if (!target.range) {
                return;
            }
            const hoverController = this.a.getContribution(hover_1.$Q6.ID);
            if (!hoverController) {
                return;
            }
            if (!hoverController.isColorPickerVisible) {
                const range = new range_1.$ks(target.range.startLineNumber, target.range.startColumn + 1, target.range.endLineNumber, target.range.endColumn + 1);
                hoverController.showContentHover(range, 1 /* HoverStartMode.Immediate */, 0 /* HoverStartSource.Mouse */, false, true);
            }
        }
    }
    exports.$R6 = $R6;
    (0, editorExtensions_1.$AV)($R6.ID, $R6, 2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
    hoverTypes_1.$j3.register(colorHoverParticipant_1.$p3);
});
//# sourceMappingURL=colorContributions.js.map