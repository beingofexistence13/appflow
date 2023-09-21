/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/path"], function (require, exports, event_1, lifecycle_1, path_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MockLabelService = void 0;
    class MockLabelService {
        constructor() {
            this.onDidChangeFormatters = new event_1.Emitter().event;
        }
        registerCachedFormatter(formatter) {
            throw new Error('Method not implemented.');
        }
        getUriLabel(resource, options) {
            return (0, path_1.normalize)(resource.fsPath);
        }
        getUriBasenameLabel(resource) {
            return (0, path_1.basename)(resource.fsPath);
        }
        getWorkspaceLabel(workspace, options) {
            return '';
        }
        getHostLabel(scheme, authority) {
            return '';
        }
        getHostTooltip() {
            return '';
        }
        getSeparator(scheme, authority) {
            return '/';
        }
        registerFormatter(formatter) {
            return lifecycle_1.Disposable.None;
        }
    }
    exports.MockLabelService = MockLabelService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja0xhYmVsU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9sYWJlbC90ZXN0L2NvbW1vbi9tb2NrTGFiZWxTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVNoRyxNQUFhLGdCQUFnQjtRQUE3QjtZQTJCQywwQkFBcUIsR0FBaUMsSUFBSSxlQUFPLEVBQXlCLENBQUMsS0FBSyxDQUFDO1FBQ2xHLENBQUM7UUF6QkEsdUJBQXVCLENBQUMsU0FBaUM7WUFDeEQsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFDRCxXQUFXLENBQUMsUUFBYSxFQUFFLE9BQTRFO1lBQ3RHLE9BQU8sSUFBQSxnQkFBUyxFQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNuQyxDQUFDO1FBQ0QsbUJBQW1CLENBQUMsUUFBYTtZQUNoQyxPQUFPLElBQUEsZUFBUSxFQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNsQyxDQUFDO1FBQ0QsaUJBQWlCLENBQUMsU0FBa0QsRUFBRSxPQUFnQztZQUNyRyxPQUFPLEVBQUUsQ0FBQztRQUNYLENBQUM7UUFDRCxZQUFZLENBQUMsTUFBYyxFQUFFLFNBQWtCO1lBQzlDLE9BQU8sRUFBRSxDQUFDO1FBQ1gsQ0FBQztRQUNNLGNBQWM7WUFDcEIsT0FBTyxFQUFFLENBQUM7UUFDWCxDQUFDO1FBQ0QsWUFBWSxDQUFDLE1BQWMsRUFBRSxTQUFrQjtZQUM5QyxPQUFPLEdBQUcsQ0FBQztRQUNaLENBQUM7UUFDRCxpQkFBaUIsQ0FBQyxTQUFpQztZQUNsRCxPQUFPLHNCQUFVLENBQUMsSUFBSSxDQUFDO1FBQ3hCLENBQUM7S0FFRDtJQTVCRCw0Q0E0QkMifQ==