/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/common/editor/editorInput", "vs/nls"], function (require, exports, editorInput_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DisassemblyViewInput = void 0;
    class DisassemblyViewInput extends editorInput_1.EditorInput {
        constructor() {
            super(...arguments);
            this.resource = undefined;
        }
        static { this.ID = 'debug.disassemblyView.input'; }
        get typeId() {
            return DisassemblyViewInput.ID;
        }
        static get instance() {
            if (!DisassemblyViewInput._instance || DisassemblyViewInput._instance.isDisposed()) {
                DisassemblyViewInput._instance = new DisassemblyViewInput();
            }
            return DisassemblyViewInput._instance;
        }
        getName() {
            return (0, nls_1.localize)('disassemblyInputName', "Disassembly");
        }
        matches(other) {
            return other instanceof DisassemblyViewInput;
        }
    }
    exports.DisassemblyViewInput = DisassemblyViewInput;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzYXNzZW1ibHlWaWV3SW5wdXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9kZWJ1Zy9jb21tb24vZGlzYXNzZW1ibHlWaWV3SW5wdXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBS2hHLE1BQWEsb0JBQXFCLFNBQVEseUJBQVc7UUFBckQ7O1lBaUJVLGFBQVEsR0FBRyxTQUFTLENBQUM7UUFVL0IsQ0FBQztpQkF6QmdCLE9BQUUsR0FBRyw2QkFBNkIsQUFBaEMsQ0FBaUM7UUFFbkQsSUFBYSxNQUFNO1lBQ2xCLE9BQU8sb0JBQW9CLENBQUMsRUFBRSxDQUFDO1FBQ2hDLENBQUM7UUFHRCxNQUFNLEtBQUssUUFBUTtZQUNsQixJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxJQUFJLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsRUFBRTtnQkFDbkYsb0JBQW9CLENBQUMsU0FBUyxHQUFHLElBQUksb0JBQW9CLEVBQUUsQ0FBQzthQUM1RDtZQUVELE9BQU8sb0JBQW9CLENBQUMsU0FBUyxDQUFDO1FBQ3ZDLENBQUM7UUFJUSxPQUFPO1lBQ2YsT0FBTyxJQUFBLGNBQVEsRUFBQyxzQkFBc0IsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUN4RCxDQUFDO1FBRVEsT0FBTyxDQUFDLEtBQWM7WUFDOUIsT0FBTyxLQUFLLFlBQVksb0JBQW9CLENBQUM7UUFDOUMsQ0FBQzs7SUF6QkYsb0RBMkJDIn0=