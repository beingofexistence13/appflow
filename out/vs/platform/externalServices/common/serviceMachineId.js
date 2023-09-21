/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/uuid"], function (require, exports, buffer_1, uuid_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getServiceMachineId = void 0;
    async function getServiceMachineId(environmentService, fileService, storageService) {
        let uuid = storageService ? storageService.get('storage.serviceMachineId', -1 /* StorageScope.APPLICATION */) || null : null;
        if (uuid) {
            return uuid;
        }
        try {
            const contents = await fileService.readFile(environmentService.serviceMachineIdResource);
            const value = contents.value.toString();
            uuid = (0, uuid_1.isUUID)(value) ? value : null;
        }
        catch (e) {
            uuid = null;
        }
        if (!uuid) {
            uuid = (0, uuid_1.generateUuid)();
            try {
                await fileService.writeFile(environmentService.serviceMachineIdResource, buffer_1.VSBuffer.fromString(uuid));
            }
            catch (error) {
                //noop
            }
        }
        storageService?.store('storage.serviceMachineId', uuid, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        return uuid;
    }
    exports.getServiceMachineId = getServiceMachineId;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZU1hY2hpbmVJZC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2V4dGVybmFsU2VydmljZXMvY29tbW9uL3NlcnZpY2VNYWNoaW5lSWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUXpGLEtBQUssVUFBVSxtQkFBbUIsQ0FBQyxrQkFBdUMsRUFBRSxXQUF5QixFQUFFLGNBQTJDO1FBQ3hKLElBQUksSUFBSSxHQUFrQixjQUFjLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsMEJBQTBCLG9DQUEyQixJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ25JLElBQUksSUFBSSxFQUFFO1lBQ1QsT0FBTyxJQUFJLENBQUM7U0FDWjtRQUNELElBQUk7WUFDSCxNQUFNLFFBQVEsR0FBRyxNQUFNLFdBQVcsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsd0JBQXdCLENBQUMsQ0FBQztZQUN6RixNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3hDLElBQUksR0FBRyxJQUFBLGFBQU0sRUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7U0FDcEM7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNYLElBQUksR0FBRyxJQUFJLENBQUM7U0FDWjtRQUVELElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDVixJQUFJLEdBQUcsSUFBQSxtQkFBWSxHQUFFLENBQUM7WUFDdEIsSUFBSTtnQkFDSCxNQUFNLFdBQVcsQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsd0JBQXdCLEVBQUUsaUJBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUNwRztZQUFDLE9BQU8sS0FBSyxFQUFFO2dCQUNmLE1BQU07YUFDTjtTQUNEO1FBRUQsY0FBYyxFQUFFLEtBQUssQ0FBQywwQkFBMEIsRUFBRSxJQUFJLG1FQUFrRCxDQUFDO1FBRXpHLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQXpCRCxrREF5QkMifQ==