/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditSessionIdentityMatch = exports.IEditSessionIdentityService = void 0;
    exports.IEditSessionIdentityService = (0, instantiation_1.createDecorator)('editSessionIdentityService');
    var EditSessionIdentityMatch;
    (function (EditSessionIdentityMatch) {
        EditSessionIdentityMatch[EditSessionIdentityMatch["Complete"] = 100] = "Complete";
        EditSessionIdentityMatch[EditSessionIdentityMatch["Partial"] = 50] = "Partial";
        EditSessionIdentityMatch[EditSessionIdentityMatch["None"] = 0] = "None";
    })(EditSessionIdentityMatch || (exports.EditSessionIdentityMatch = EditSessionIdentityMatch = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdFNlc3Npb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vd29ya3NwYWNlL2NvbW1vbi9lZGl0U2Vzc2lvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBYW5GLFFBQUEsMkJBQTJCLEdBQUcsSUFBQSwrQkFBZSxFQUE4Qiw0QkFBNEIsQ0FBQyxDQUFDO0lBZ0J0SCxJQUFZLHdCQUlYO0lBSkQsV0FBWSx3QkFBd0I7UUFDbkMsaUZBQWMsQ0FBQTtRQUNkLDhFQUFZLENBQUE7UUFDWix1RUFBUSxDQUFBO0lBQ1QsQ0FBQyxFQUpXLHdCQUF3Qix3Q0FBeEIsd0JBQXdCLFFBSW5DIn0=