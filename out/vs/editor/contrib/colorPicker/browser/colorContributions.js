/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/common/core/range", "vs/editor/contrib/colorPicker/browser/colorDetector", "vs/editor/contrib/colorPicker/browser/colorHoverParticipant", "vs/editor/contrib/hover/browser/hover", "vs/editor/contrib/hover/browser/hoverTypes"], function (require, exports, lifecycle_1, editorExtensions_1, range_1, colorDetector_1, colorHoverParticipant_1, hover_1, hoverTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ColorContribution = void 0;
    class ColorContribution extends lifecycle_1.Disposable {
        static { this.ID = 'editor.contrib.colorContribution'; }
        static { this.RECOMPUTE_TIME = 1000; } // ms
        constructor(_editor) {
            super();
            this._editor = _editor;
            this._register(_editor.onMouseDown((e) => this.onMouseDown(e)));
        }
        dispose() {
            super.dispose();
        }
        onMouseDown(mouseEvent) {
            const colorDecoratorsActivatedOn = this._editor.getOption(146 /* EditorOption.colorDecoratorsActivatedOn */);
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
            if (target.detail.injectedText.options.attachedData !== colorDetector_1.ColorDecorationInjectedTextMarker) {
                return;
            }
            if (!target.range) {
                return;
            }
            const hoverController = this._editor.getContribution(hover_1.ModesHoverController.ID);
            if (!hoverController) {
                return;
            }
            if (!hoverController.isColorPickerVisible) {
                const range = new range_1.Range(target.range.startLineNumber, target.range.startColumn + 1, target.range.endLineNumber, target.range.endColumn + 1);
                hoverController.showContentHover(range, 1 /* HoverStartMode.Immediate */, 0 /* HoverStartSource.Mouse */, false, true);
            }
        }
    }
    exports.ColorContribution = ColorContribution;
    (0, editorExtensions_1.registerEditorContribution)(ColorContribution.ID, ColorContribution, 2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
    hoverTypes_1.HoverParticipantRegistry.register(colorHoverParticipant_1.ColorHoverParticipant);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3JDb250cmlidXRpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvY29sb3JQaWNrZXIvYnJvd3Nlci9jb2xvckNvbnRyaWJ1dGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBY2hHLE1BQWEsaUJBQWtCLFNBQVEsc0JBQVU7aUJBRXpCLE9BQUUsR0FBVyxrQ0FBa0MsQ0FBQztpQkFFdkQsbUJBQWMsR0FBRyxJQUFJLENBQUMsR0FBQyxLQUFLO1FBRTVDLFlBQTZCLE9BQW9CO1lBRWhELEtBQUssRUFBRSxDQUFDO1lBRm9CLFlBQU8sR0FBUCxPQUFPLENBQWE7WUFHaEQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqRSxDQUFDO1FBRVEsT0FBTztZQUNmLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNqQixDQUFDO1FBRU8sV0FBVyxDQUFDLFVBQTZCO1lBRWhELE1BQU0sMEJBQTBCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLG1EQUF5QyxDQUFDO1lBQ25HLElBQUksMEJBQTBCLEtBQUssT0FBTyxJQUFJLDBCQUEwQixLQUFLLGVBQWUsRUFBRTtnQkFDN0YsT0FBTzthQUNQO1lBRUQsTUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQztZQUVqQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLHlDQUFpQyxFQUFFO2dCQUNqRCxPQUFPO2FBQ1A7WUFFRCxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUU7Z0JBQ2hDLE9BQU87YUFDUDtZQUVELElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLFlBQVksS0FBSyxpREFBaUMsRUFBRTtnQkFDMUYsT0FBTzthQUNQO1lBRUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUU7Z0JBQ2xCLE9BQU87YUFDUDtZQUVELE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUF1Qiw0QkFBb0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNwRyxJQUFJLENBQUMsZUFBZSxFQUFFO2dCQUNyQixPQUFPO2FBQ1A7WUFDRCxJQUFJLENBQUMsZUFBZSxDQUFDLG9CQUFvQixFQUFFO2dCQUMxQyxNQUFNLEtBQUssR0FBRyxJQUFJLGFBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsR0FBRyxDQUFDLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQzVJLGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLG9FQUFvRCxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDdkc7UUFDRixDQUFDOztJQWpERiw4Q0FrREM7SUFFRCxJQUFBLDZDQUEwQixFQUFDLGlCQUFpQixDQUFDLEVBQUUsRUFBRSxpQkFBaUIsaUVBQXlELENBQUM7SUFDNUgscUNBQXdCLENBQUMsUUFBUSxDQUFDLDZDQUFxQixDQUFDLENBQUMifQ==