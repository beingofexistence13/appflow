/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.userActivityRegistry = void 0;
    class UserActivityRegistry {
        constructor() {
            this.todo = [];
            this.add = (ctor) => {
                this.todo.push(ctor);
            };
        }
        take(userActivityService, instantiation) {
            this.add = ctor => instantiation.createInstance(ctor, userActivityService);
            this.todo.forEach(this.add);
            this.todo = [];
        }
    }
    exports.userActivityRegistry = new UserActivityRegistry();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckFjdGl2aXR5UmVnaXN0cnkuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvdXNlckFjdGl2aXR5L2NvbW1vbi91c2VyQWN0aXZpdHlSZWdpc3RyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFLaEcsTUFBTSxvQkFBb0I7UUFBMUI7WUFDUyxTQUFJLEdBQTRELEVBQUUsQ0FBQztZQUVwRSxRQUFHLEdBQUcsQ0FBQyxJQUEyRCxFQUFFLEVBQUU7Z0JBQzVFLElBQUksQ0FBQyxJQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3ZCLENBQUMsQ0FBQztRQU9ILENBQUM7UUFMTyxJQUFJLENBQUMsbUJBQXlDLEVBQUUsYUFBb0M7WUFDMUYsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLG1CQUFtQixDQUFDLENBQUM7WUFDM0UsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzVCLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLENBQUM7S0FDRDtJQUVZLFFBQUEsb0JBQW9CLEdBQUcsSUFBSSxvQkFBb0IsRUFBRSxDQUFDIn0=