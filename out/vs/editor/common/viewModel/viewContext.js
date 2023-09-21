/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/editorTheme"], function (require, exports, editorTheme_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ViewContext = void 0;
    class ViewContext {
        constructor(configuration, theme, model) {
            this.configuration = configuration;
            this.theme = new editorTheme_1.EditorTheme(theme);
            this.viewModel = model;
            this.viewLayout = model.viewLayout;
        }
        addEventHandler(eventHandler) {
            this.viewModel.addViewEventHandler(eventHandler);
        }
        removeEventHandler(eventHandler) {
            this.viewModel.removeViewEventHandler(eventHandler);
        }
    }
    exports.ViewContext = ViewContext;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld0NvbnRleHQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL3ZpZXdNb2RlbC92aWV3Q29udGV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFRaEcsTUFBYSxXQUFXO1FBT3ZCLFlBQ0MsYUFBbUMsRUFDbkMsS0FBa0IsRUFDbEIsS0FBaUI7WUFFakIsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7WUFDbkMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLHlCQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDcEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7WUFDdkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDO1FBQ3BDLENBQUM7UUFFTSxlQUFlLENBQUMsWUFBOEI7WUFDcEQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNsRCxDQUFDO1FBRU0sa0JBQWtCLENBQUMsWUFBOEI7WUFDdkQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNyRCxDQUFDO0tBQ0Q7SUF6QkQsa0NBeUJDIn0=