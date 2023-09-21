/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/action/common/actionCommonCategories", "vs/platform/actions/common/actions", "vs/workbench/contrib/logs/electron-sandbox/logsActions", "vs/platform/instantiation/common/instantiation"], function (require, exports, actionCommonCategories_1, actions_1, logsActions_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: logsActions_1.OpenLogsFolderAction.ID,
                title: logsActions_1.OpenLogsFolderAction.TITLE,
                category: actionCommonCategories_1.Categories.Developer,
                f1: true
            });
        }
        run(servicesAccessor) {
            return servicesAccessor.get(instantiation_1.IInstantiationService).createInstance(logsActions_1.OpenLogsFolderAction, logsActions_1.OpenLogsFolderAction.ID, logsActions_1.OpenLogsFolderAction.TITLE.value).run();
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: logsActions_1.OpenExtensionLogsFolderAction.ID,
                title: logsActions_1.OpenExtensionLogsFolderAction.TITLE,
                category: actionCommonCategories_1.Categories.Developer,
                f1: true
            });
        }
        run(servicesAccessor) {
            return servicesAccessor.get(instantiation_1.IInstantiationService).createInstance(logsActions_1.OpenExtensionLogsFolderAction, logsActions_1.OpenExtensionLogsFolderAction.ID, logsActions_1.OpenExtensionLogsFolderAction.TITLE.value).run();
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9ncy5jb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9sb2dzL2VsZWN0cm9uLXNhbmRib3gvbG9ncy5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFRaEcsSUFBQSx5QkFBZSxFQUFDLEtBQU0sU0FBUSxpQkFBTztRQUNwQztZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsa0NBQW9CLENBQUMsRUFBRTtnQkFDM0IsS0FBSyxFQUFFLGtDQUFvQixDQUFDLEtBQUs7Z0JBQ2pDLFFBQVEsRUFBRSxtQ0FBVSxDQUFDLFNBQVM7Z0JBQzlCLEVBQUUsRUFBRSxJQUFJO2FBQ1IsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUNELEdBQUcsQ0FBQyxnQkFBa0M7WUFDckMsT0FBTyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMscUNBQXFCLENBQUMsQ0FBQyxjQUFjLENBQUMsa0NBQW9CLEVBQUUsa0NBQW9CLENBQUMsRUFBRSxFQUFFLGtDQUFvQixDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUMxSixDQUFDO0tBQ0QsQ0FBQyxDQUFDO0lBRUgsSUFBQSx5QkFBZSxFQUFDLEtBQU0sU0FBUSxpQkFBTztRQUNwQztZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsMkNBQTZCLENBQUMsRUFBRTtnQkFDcEMsS0FBSyxFQUFFLDJDQUE2QixDQUFDLEtBQUs7Z0JBQzFDLFFBQVEsRUFBRSxtQ0FBVSxDQUFDLFNBQVM7Z0JBQzlCLEVBQUUsRUFBRSxJQUFJO2FBQ1IsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUNELEdBQUcsQ0FBQyxnQkFBa0M7WUFDckMsT0FBTyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMscUNBQXFCLENBQUMsQ0FBQyxjQUFjLENBQUMsMkNBQTZCLEVBQUUsMkNBQTZCLENBQUMsRUFBRSxFQUFFLDJDQUE2QixDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNyTCxDQUFDO0tBQ0QsQ0FBQyxDQUFDIn0=