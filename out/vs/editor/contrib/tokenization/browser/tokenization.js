/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/stopwatch", "vs/editor/browser/editorExtensions", "vs/nls"], function (require, exports, stopwatch_1, editorExtensions_1, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ForceRetokenizeAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.forceRetokenize',
                label: nls.localize('forceRetokenize', "Developer: Force Retokenize"),
                alias: 'Developer: Force Retokenize',
                precondition: undefined
            });
        }
        run(accessor, editor) {
            if (!editor.hasModel()) {
                return;
            }
            const model = editor.getModel();
            model.tokenization.resetTokenization();
            const sw = new stopwatch_1.StopWatch();
            model.tokenization.forceTokenization(model.getLineCount());
            sw.stop();
            console.log(`tokenization took ${sw.elapsed()}`);
        }
    }
    (0, editorExtensions_1.registerEditorAction)(ForceRetokenizeAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW5pemF0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvdG9rZW5pemF0aW9uL2Jyb3dzZXIvdG9rZW5pemF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBT2hHLE1BQU0scUJBQXNCLFNBQVEsK0JBQVk7UUFDL0M7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLCtCQUErQjtnQkFDbkMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsNkJBQTZCLENBQUM7Z0JBQ3JFLEtBQUssRUFBRSw2QkFBNkI7Z0JBQ3BDLFlBQVksRUFBRSxTQUFTO2FBQ3ZCLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFTSxHQUFHLENBQUMsUUFBMEIsRUFBRSxNQUFtQjtZQUN6RCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFO2dCQUN2QixPQUFPO2FBQ1A7WUFDRCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDaEMsS0FBSyxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQ3ZDLE1BQU0sRUFBRSxHQUFHLElBQUkscUJBQVMsRUFBRSxDQUFDO1lBQzNCLEtBQUssQ0FBQyxZQUFZLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7WUFDM0QsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVsRCxDQUFDO0tBQ0Q7SUFFRCxJQUFBLHVDQUFvQixFQUFDLHFCQUFxQixDQUFDLENBQUMifQ==