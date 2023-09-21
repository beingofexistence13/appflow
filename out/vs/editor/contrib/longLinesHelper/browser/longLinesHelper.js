/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions"], function (require, exports, lifecycle_1, editorExtensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LongLinesHelper extends lifecycle_1.Disposable {
        static { this.ID = 'editor.contrib.longLinesHelper'; }
        static get(editor) {
            return editor.getContribution(LongLinesHelper.ID);
        }
        constructor(_editor) {
            super();
            this._editor = _editor;
            this._register(this._editor.onMouseDown((e) => {
                const stopRenderingLineAfter = this._editor.getOption(116 /* EditorOption.stopRenderingLineAfter */);
                if (stopRenderingLineAfter >= 0 && e.target.type === 6 /* MouseTargetType.CONTENT_TEXT */ && e.target.position.column >= stopRenderingLineAfter) {
                    this._editor.updateOptions({
                        stopRenderingLineAfter: -1
                    });
                }
            }));
        }
    }
    (0, editorExtensions_1.registerEditorContribution)(LongLinesHelper.ID, LongLinesHelper, 2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9uZ0xpbmVzSGVscGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvbG9uZ0xpbmVzSGVscGVyL2Jyb3dzZXIvbG9uZ0xpbmVzSGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBUWhHLE1BQU0sZUFBZ0IsU0FBUSxzQkFBVTtpQkFDaEIsT0FBRSxHQUFHLGdDQUFnQyxDQUFDO1FBRXRELE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBbUI7WUFDcEMsT0FBTyxNQUFNLENBQUMsZUFBZSxDQUFrQixlQUFlLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDcEUsQ0FBQztRQUVELFlBQ2tCLE9BQW9CO1lBRXJDLEtBQUssRUFBRSxDQUFDO1lBRlMsWUFBTyxHQUFQLE9BQU8sQ0FBYTtZQUlyQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7Z0JBQzdDLE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLCtDQUFxQyxDQUFDO2dCQUMzRixJQUFJLHNCQUFzQixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUkseUNBQWlDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxJQUFJLHNCQUFzQixFQUFFO29CQUN4SSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQzt3QkFDMUIsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDO3FCQUMxQixDQUFDLENBQUM7aUJBQ0g7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQzs7SUFHRixJQUFBLDZDQUEwQixFQUFDLGVBQWUsQ0FBQyxFQUFFLEVBQUUsZUFBZSxpRUFBeUQsQ0FBQyJ9