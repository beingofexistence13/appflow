/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/types", "vs/workbench/common/editor/editorOptions", "vs/platform/contextkey/common/contextkey", "vs/base/common/resources", "vs/editor/browser/widget/codeEditorWidget", "vs/workbench/browser/parts/editor/textEditor"], function (require, exports, nls_1, types_1, editorOptions_1, contextkey_1, resources_1, codeEditorWidget_1, textEditor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractTextCodeEditor = void 0;
    /**
     * A text editor using the code editor widget.
     */
    class AbstractTextCodeEditor extends textEditor_1.AbstractTextEditor {
        constructor() {
            super(...arguments);
            this.editorControl = undefined;
        }
        get scopedContextKeyService() {
            return this.editorControl?.invokeWithinContext(accessor => accessor.get(contextkey_1.IContextKeyService));
        }
        getTitle() {
            if (this.input) {
                return this.input.getName();
            }
            return (0, nls_1.localize)('textEditor', "Text Editor");
        }
        createEditorControl(parent, initialOptions) {
            this.editorControl = this._register(this.instantiationService.createInstance(codeEditorWidget_1.CodeEditorWidget, parent, initialOptions, this.getCodeEditorWidgetOptions()));
        }
        getCodeEditorWidgetOptions() {
            return Object.create(null);
        }
        updateEditorControlOptions(options) {
            this.editorControl?.updateOptions(options);
        }
        getMainControl() {
            return this.editorControl;
        }
        getControl() {
            return this.editorControl;
        }
        computeEditorViewState(resource) {
            if (!this.editorControl) {
                return undefined;
            }
            const model = this.editorControl.getModel();
            if (!model) {
                return undefined; // view state always needs a model
            }
            const modelUri = model.uri;
            if (!modelUri) {
                return undefined; // model URI is needed to make sure we save the view state correctly
            }
            if (!(0, resources_1.isEqual)(modelUri, resource)) {
                return undefined; // prevent saving view state for a model that is not the expected one
            }
            return this.editorControl.saveViewState() ?? undefined;
        }
        setOptions(options) {
            super.setOptions(options);
            if (options) {
                (0, editorOptions_1.applyTextEditorOptions)(options, (0, types_1.assertIsDefined)(this.editorControl), 0 /* ScrollType.Smooth */);
            }
        }
        focus() {
            this.editorControl?.focus();
        }
        hasFocus() {
            return this.editorControl?.hasTextFocus() || super.hasFocus();
        }
        setEditorVisible(visible, group) {
            super.setEditorVisible(visible, group);
            if (visible) {
                this.editorControl?.onVisible();
            }
            else {
                this.editorControl?.onHide();
            }
        }
        layout(dimension) {
            this.editorControl?.layout(dimension);
        }
    }
    exports.AbstractTextCodeEditor = AbstractTextCodeEditor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dENvZGVFZGl0b3IuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9wYXJ0cy9lZGl0b3IvdGV4dENvZGVFZGl0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBa0JoRzs7T0FFRztJQUNILE1BQXNCLHNCQUFtRCxTQUFRLCtCQUFxQjtRQUF0Rzs7WUFFVyxrQkFBYSxHQUE0QixTQUFTLENBQUM7UUFxRjlELENBQUM7UUFuRkEsSUFBYSx1QkFBdUI7WUFDbkMsT0FBTyxJQUFJLENBQUMsYUFBYSxFQUFFLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQywrQkFBa0IsQ0FBQyxDQUFDLENBQUM7UUFDOUYsQ0FBQztRQUVRLFFBQVE7WUFDaEIsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNmLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUM1QjtZQUVELE9BQU8sSUFBQSxjQUFRLEVBQUMsWUFBWSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQzlDLENBQUM7UUFFUyxtQkFBbUIsQ0FBQyxNQUFtQixFQUFFLGNBQWtDO1lBQ3BGLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLG1DQUFnQixFQUFFLE1BQU0sRUFBRSxjQUFjLEVBQUUsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzVKLENBQUM7UUFFUywwQkFBMEI7WUFDbkMsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVCLENBQUM7UUFFUywwQkFBMEIsQ0FBQyxPQUEyQjtZQUMvRCxJQUFJLENBQUMsYUFBYSxFQUFFLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM1QyxDQUFDO1FBRVMsY0FBYztZQUN2QixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDM0IsQ0FBQztRQUVRLFVBQVU7WUFDbEIsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO1FBQzNCLENBQUM7UUFFa0Isc0JBQXNCLENBQUMsUUFBYTtZQUN0RCxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRTtnQkFDeEIsT0FBTyxTQUFTLENBQUM7YUFDakI7WUFFRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzVDLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ1gsT0FBTyxTQUFTLENBQUMsQ0FBQyxrQ0FBa0M7YUFDcEQ7WUFFRCxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDO1lBQzNCLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2QsT0FBTyxTQUFTLENBQUMsQ0FBQyxvRUFBb0U7YUFDdEY7WUFFRCxJQUFJLENBQUMsSUFBQSxtQkFBTyxFQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsRUFBRTtnQkFDakMsT0FBTyxTQUFTLENBQUMsQ0FBQyxxRUFBcUU7YUFDdkY7WUFFRCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxFQUFrQixJQUFJLFNBQVMsQ0FBQztRQUN4RSxDQUFDO1FBRVEsVUFBVSxDQUFDLE9BQXVDO1lBQzFELEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFMUIsSUFBSSxPQUFPLEVBQUU7Z0JBQ1osSUFBQSxzQ0FBc0IsRUFBQyxPQUFPLEVBQUUsSUFBQSx1QkFBZSxFQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsNEJBQW9CLENBQUM7YUFDeEY7UUFDRixDQUFDO1FBRVEsS0FBSztZQUNiLElBQUksQ0FBQyxhQUFhLEVBQUUsS0FBSyxFQUFFLENBQUM7UUFDN0IsQ0FBQztRQUVRLFFBQVE7WUFDaEIsT0FBTyxJQUFJLENBQUMsYUFBYSxFQUFFLFlBQVksRUFBRSxJQUFJLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUMvRCxDQUFDO1FBRWtCLGdCQUFnQixDQUFDLE9BQWdCLEVBQUUsS0FBK0I7WUFDcEYsS0FBSyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztZQUV2QyxJQUFJLE9BQU8sRUFBRTtnQkFDWixJQUFJLENBQUMsYUFBYSxFQUFFLFNBQVMsRUFBRSxDQUFDO2FBQ2hDO2lCQUFNO2dCQUNOLElBQUksQ0FBQyxhQUFhLEVBQUUsTUFBTSxFQUFFLENBQUM7YUFDN0I7UUFDRixDQUFDO1FBRVEsTUFBTSxDQUFDLFNBQW9CO1lBQ25DLElBQUksQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7S0FDRDtJQXZGRCx3REF1RkMifQ==