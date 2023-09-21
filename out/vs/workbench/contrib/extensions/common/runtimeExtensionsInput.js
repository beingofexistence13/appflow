/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/uri", "vs/workbench/common/editor/editorInput"], function (require, exports, nls, uri_1, editorInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RuntimeExtensionsInput = void 0;
    class RuntimeExtensionsInput extends editorInput_1.EditorInput {
        constructor() {
            super(...arguments);
            this.resource = uri_1.URI.from({
                scheme: 'runtime-extensions',
                path: 'default'
            });
        }
        static { this.ID = 'workbench.runtimeExtensions.input'; }
        get typeId() {
            return RuntimeExtensionsInput.ID;
        }
        get capabilities() {
            return 2 /* EditorInputCapabilities.Readonly */ | 8 /* EditorInputCapabilities.Singleton */;
        }
        static get instance() {
            if (!RuntimeExtensionsInput._instance || RuntimeExtensionsInput._instance.isDisposed()) {
                RuntimeExtensionsInput._instance = new RuntimeExtensionsInput();
            }
            return RuntimeExtensionsInput._instance;
        }
        getName() {
            return nls.localize('extensionsInputName', "Running Extensions");
        }
        matches(other) {
            if (super.matches(other)) {
                return true;
            }
            return other instanceof RuntimeExtensionsInput;
        }
    }
    exports.RuntimeExtensionsInput = RuntimeExtensionsInput;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVudGltZUV4dGVuc2lvbnNJbnB1dC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2V4dGVuc2lvbnMvY29tbW9uL3J1bnRpbWVFeHRlbnNpb25zSW5wdXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBT2hHLE1BQWEsc0JBQXVCLFNBQVEseUJBQVc7UUFBdkQ7O1lBcUJVLGFBQVEsR0FBRyxTQUFHLENBQUMsSUFBSSxDQUFDO2dCQUM1QixNQUFNLEVBQUUsb0JBQW9CO2dCQUM1QixJQUFJLEVBQUUsU0FBUzthQUNmLENBQUMsQ0FBQztRQVlKLENBQUM7aUJBbENnQixPQUFFLEdBQUcsbUNBQW1DLEFBQXRDLENBQXVDO1FBRXpELElBQWEsTUFBTTtZQUNsQixPQUFPLHNCQUFzQixDQUFDLEVBQUUsQ0FBQztRQUNsQyxDQUFDO1FBRUQsSUFBYSxZQUFZO1lBQ3hCLE9BQU8sb0ZBQW9FLENBQUM7UUFDN0UsQ0FBQztRQUdELE1BQU0sS0FBSyxRQUFRO1lBQ2xCLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxTQUFTLElBQUksc0JBQXNCLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxFQUFFO2dCQUN2RixzQkFBc0IsQ0FBQyxTQUFTLEdBQUcsSUFBSSxzQkFBc0IsRUFBRSxDQUFDO2FBQ2hFO1lBRUQsT0FBTyxzQkFBc0IsQ0FBQyxTQUFTLENBQUM7UUFDekMsQ0FBQztRQU9RLE9BQU87WUFDZixPQUFPLEdBQUcsQ0FBQyxRQUFRLENBQUMscUJBQXFCLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztRQUNsRSxDQUFDO1FBRVEsT0FBTyxDQUFDLEtBQXdDO1lBQ3hELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDekIsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUNELE9BQU8sS0FBSyxZQUFZLHNCQUFzQixDQUFDO1FBQ2hELENBQUM7O0lBbkNGLHdEQW9DQyJ9