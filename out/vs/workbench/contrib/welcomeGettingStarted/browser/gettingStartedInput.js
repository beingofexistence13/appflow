/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/workbench/common/editor/editorInput", "vs/base/common/uri", "vs/base/common/network", "vs/css!./media/gettingStarted"], function (require, exports, nls_1, editorInput_1, uri_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GettingStartedInput = exports.gettingStartedInputTypeId = void 0;
    exports.gettingStartedInputTypeId = 'workbench.editors.gettingStartedInput';
    class GettingStartedInput extends editorInput_1.EditorInput {
        static { this.ID = exports.gettingStartedInputTypeId; }
        static { this.RESOURCE = uri_1.URI.from({ scheme: network_1.Schemas.walkThrough, authority: 'vscode_getting_started_page' }); }
        get typeId() {
            return GettingStartedInput.ID;
        }
        get editorId() {
            return this.typeId;
        }
        toUntyped() {
            return {
                resource: GettingStartedInput.RESOURCE,
                options: {
                    override: GettingStartedInput.ID,
                    pinned: false
                }
            };
        }
        get resource() {
            return GettingStartedInput.RESOURCE;
        }
        matches(other) {
            if (super.matches(other)) {
                return true;
            }
            if (other instanceof GettingStartedInput) {
                return other.selectedCategory === this.selectedCategory;
            }
            return false;
        }
        constructor(options) {
            super();
            this.selectedCategory = options.selectedCategory;
            this.selectedStep = options.selectedStep;
            this.showTelemetryNotice = !!options.showTelemetryNotice;
        }
        getName() {
            return (0, nls_1.localize)('getStarted', "Welcome");
        }
    }
    exports.GettingStartedInput = GettingStartedInput;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0dGluZ1N0YXJ0ZWRJbnB1dC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3dlbGNvbWVHZXR0aW5nU3RhcnRlZC9icm93c2VyL2dldHRpbmdTdGFydGVkSW5wdXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBVW5GLFFBQUEseUJBQXlCLEdBQUcsdUNBQXVDLENBQUM7SUFNakYsTUFBYSxtQkFBb0IsU0FBUSx5QkFBVztpQkFFbkMsT0FBRSxHQUFHLGlDQUF5QixDQUFDO2lCQUMvQixhQUFRLEdBQUcsU0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxpQkFBTyxDQUFDLFdBQVcsRUFBRSxTQUFTLEVBQUUsNkJBQTZCLEVBQUUsQ0FBQyxDQUFDO1FBRS9HLElBQWEsTUFBTTtZQUNsQixPQUFPLG1CQUFtQixDQUFDLEVBQUUsQ0FBQztRQUMvQixDQUFDO1FBRUQsSUFBYSxRQUFRO1lBQ3BCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNwQixDQUFDO1FBRVEsU0FBUztZQUNqQixPQUFPO2dCQUNOLFFBQVEsRUFBRSxtQkFBbUIsQ0FBQyxRQUFRO2dCQUN0QyxPQUFPLEVBQUU7b0JBQ1IsUUFBUSxFQUFFLG1CQUFtQixDQUFDLEVBQUU7b0JBQ2hDLE1BQU0sRUFBRSxLQUFLO2lCQUNiO2FBQ0QsQ0FBQztRQUNILENBQUM7UUFFRCxJQUFJLFFBQVE7WUFDWCxPQUFPLG1CQUFtQixDQUFDLFFBQVEsQ0FBQztRQUNyQyxDQUFDO1FBRVEsT0FBTyxDQUFDLEtBQXdDO1lBQ3hELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDekIsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUVELElBQUksS0FBSyxZQUFZLG1CQUFtQixFQUFFO2dCQUN6QyxPQUFPLEtBQUssQ0FBQyxnQkFBZ0IsS0FBSyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7YUFDeEQ7WUFDRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFRCxZQUNDLE9BQW9DO1lBRXBDLEtBQUssRUFBRSxDQUFDO1lBQ1IsSUFBSSxDQUFDLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQztZQUNqRCxJQUFJLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUM7WUFDekMsSUFBSSxDQUFDLG1CQUFtQixHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUM7UUFDMUQsQ0FBQztRQUVRLE9BQU87WUFDZixPQUFPLElBQUEsY0FBUSxFQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsQ0FBQztRQUMxQyxDQUFDOztJQWpERixrREFzREMifQ==