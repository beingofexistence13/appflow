/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network", "vs/base/common/uri", "vs/nls", "vs/workbench/common/editor/editorInput"], function (require, exports, network_1, uri_1, nls_1, editorInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkspaceTrustEditorInput = void 0;
    class WorkspaceTrustEditorInput extends editorInput_1.EditorInput {
        constructor() {
            super(...arguments);
            this.resource = uri_1.URI.from({
                scheme: network_1.Schemas.vscodeWorkspaceTrust,
                path: `workspaceTrustEditor`
            });
        }
        static { this.ID = 'workbench.input.workspaceTrust'; }
        get capabilities() {
            return 2 /* EditorInputCapabilities.Readonly */ | 8 /* EditorInputCapabilities.Singleton */;
        }
        get typeId() {
            return WorkspaceTrustEditorInput.ID;
        }
        matches(otherInput) {
            return super.matches(otherInput) || otherInput instanceof WorkspaceTrustEditorInput;
        }
        getName() {
            return (0, nls_1.localize)('workspaceTrustEditorInputName', "Workspace Trust");
        }
    }
    exports.WorkspaceTrustEditorInput = WorkspaceTrustEditorInput;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlVHJ1c3RFZGl0b3JJbnB1dC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy93b3Jrc3BhY2VzL2Jyb3dzZXIvd29ya3NwYWNlVHJ1c3RFZGl0b3JJbnB1dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFRaEcsTUFBYSx5QkFBMEIsU0FBUSx5QkFBVztRQUExRDs7WUFXVSxhQUFRLEdBQVEsU0FBRyxDQUFDLElBQUksQ0FBQztnQkFDakMsTUFBTSxFQUFFLGlCQUFPLENBQUMsb0JBQW9CO2dCQUNwQyxJQUFJLEVBQUUsc0JBQXNCO2FBQzVCLENBQUMsQ0FBQztRQVNKLENBQUM7aUJBdEJnQixPQUFFLEdBQVcsZ0NBQWdDLEFBQTNDLENBQTRDO1FBRTlELElBQWEsWUFBWTtZQUN4QixPQUFPLG9GQUFvRSxDQUFDO1FBQzdFLENBQUM7UUFFRCxJQUFhLE1BQU07WUFDbEIsT0FBTyx5QkFBeUIsQ0FBQyxFQUFFLENBQUM7UUFDckMsQ0FBQztRQU9RLE9BQU8sQ0FBQyxVQUE2QztZQUM3RCxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksVUFBVSxZQUFZLHlCQUF5QixDQUFDO1FBQ3JGLENBQUM7UUFFUSxPQUFPO1lBQ2YsT0FBTyxJQUFBLGNBQVEsRUFBQywrQkFBK0IsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3JFLENBQUM7O0lBdEJGLDhEQXVCQyJ9