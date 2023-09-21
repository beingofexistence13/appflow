/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions"], function (require, exports, lifecycle_1, editorExtensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MenuPreventer = void 0;
    /**
     * Prevents the top-level menu from showing up when doing Alt + Click in the editor
     */
    class MenuPreventer extends lifecycle_1.Disposable {
        static { this.ID = 'editor.contrib.menuPreventer'; }
        constructor(editor) {
            super();
            this._editor = editor;
            this._altListeningMouse = false;
            this._altMouseTriggered = false;
            // A global crossover handler to prevent menu bar from showing up
            // When <alt> is hold, we will listen to mouse events and prevent
            // the release event up <alt> if the mouse is triggered.
            this._register(this._editor.onMouseDown((e) => {
                if (this._altListeningMouse) {
                    this._altMouseTriggered = true;
                }
            }));
            this._register(this._editor.onKeyDown((e) => {
                if (e.equals(512 /* KeyMod.Alt */)) {
                    if (!this._altListeningMouse) {
                        this._altMouseTriggered = false;
                    }
                    this._altListeningMouse = true;
                }
            }));
            this._register(this._editor.onKeyUp((e) => {
                if (e.equals(512 /* KeyMod.Alt */)) {
                    if (this._altMouseTriggered) {
                        e.preventDefault();
                    }
                    this._altListeningMouse = false;
                    this._altMouseTriggered = false;
                }
            }));
        }
    }
    exports.MenuPreventer = MenuPreventer;
    (0, editorExtensions_1.registerEditorContribution)(MenuPreventer.ID, MenuPreventer, 2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudVByZXZlbnRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NvZGVFZGl0b3IvYnJvd3Nlci9tZW51UHJldmVudGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVFoRzs7T0FFRztJQUNILE1BQWEsYUFBYyxTQUFRLHNCQUFVO2lCQUVyQixPQUFFLEdBQUcsOEJBQThCLENBQUM7UUFNM0QsWUFBWSxNQUFtQjtZQUM5QixLQUFLLEVBQUUsQ0FBQztZQUNSLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxLQUFLLENBQUM7WUFDaEMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLEtBQUssQ0FBQztZQUVoQyxpRUFBaUU7WUFDakUsaUVBQWlFO1lBQ2pFLHdEQUF3RDtZQUV4RCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7Z0JBQzdDLElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFO29CQUM1QixJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO2lCQUMvQjtZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7Z0JBQzNDLElBQUksQ0FBQyxDQUFDLE1BQU0sc0JBQVksRUFBRTtvQkFDekIsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRTt3QkFDN0IsSUFBSSxDQUFDLGtCQUFrQixHQUFHLEtBQUssQ0FBQztxQkFDaEM7b0JBQ0QsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQztpQkFDL0I7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUN6QyxJQUFJLENBQUMsQ0FBQyxNQUFNLHNCQUFZLEVBQUU7b0JBQ3pCLElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFO3dCQUM1QixDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7cUJBQ25CO29CQUNELElBQUksQ0FBQyxrQkFBa0IsR0FBRyxLQUFLLENBQUM7b0JBQ2hDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxLQUFLLENBQUM7aUJBQ2hDO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7O0lBMUNGLHNDQTJDQztJQUVELElBQUEsNkNBQTBCLEVBQUMsYUFBYSxDQUFDLEVBQUUsRUFBRSxhQUFhLGlFQUF5RCxDQUFDIn0=