/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StaticServiceAccessor = void 0;
    class StaticServiceAccessor {
        constructor() {
            this.services = new Map();
        }
        withService(id, service) {
            this.services.set(id, service);
            return this;
        }
        get(id) {
            const value = this.services.get(id);
            if (!value) {
                throw new Error('Service does not exist');
            }
            return value;
        }
    }
    exports.StaticServiceAccessor = StaticServiceAccessor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi93b3JkUGFydE9wZXJhdGlvbnMvdGVzdC9icm93c2VyL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUloRyxNQUFhLHFCQUFxQjtRQUFsQztZQUNTLGFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBK0IsQ0FBQztRQWMzRCxDQUFDO1FBWk8sV0FBVyxDQUFJLEVBQXdCLEVBQUUsT0FBVTtZQUN6RCxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDL0IsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sR0FBRyxDQUFJLEVBQXdCO1lBQ3JDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3BDLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ1gsTUFBTSxJQUFJLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO2FBQzFDO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO0tBQ0Q7SUFmRCxzREFlQyJ9