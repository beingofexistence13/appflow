/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/path", "vs/platform/instantiation/common/instantiation"], function (require, exports, path_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Utils = exports.IV8InspectProfilingService = void 0;
    exports.IV8InspectProfilingService = (0, instantiation_1.createDecorator)('IV8InspectProfilingService');
    var Utils;
    (function (Utils) {
        function isValidProfile(profile) {
            return Boolean(profile.samples && profile.timeDeltas);
        }
        Utils.isValidProfile = isValidProfile;
        function rewriteAbsolutePaths(profile, replace = 'noAbsolutePaths') {
            for (const node of profile.nodes) {
                if (node.callFrame && node.callFrame.url) {
                    if ((0, path_1.isAbsolute)(node.callFrame.url) || /^\w[\w\d+.-]*:\/\/\/?/.test(node.callFrame.url)) {
                        node.callFrame.url = (0, path_1.join)(replace, (0, path_1.basename)(node.callFrame.url));
                    }
                }
            }
            return profile;
        }
        Utils.rewriteAbsolutePaths = rewriteAbsolutePaths;
    })(Utils || (exports.Utils = Utils = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZmlsaW5nLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vcHJvZmlsaW5nL2NvbW1vbi9wcm9maWxpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBOEJuRixRQUFBLDBCQUEwQixHQUFHLElBQUEsK0JBQWUsRUFBNkIsNEJBQTRCLENBQUMsQ0FBQztJQVlwSCxJQUFpQixLQUFLLENBZ0JyQjtJQWhCRCxXQUFpQixLQUFLO1FBRXJCLFNBQWdCLGNBQWMsQ0FBQyxPQUFtQjtZQUNqRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN2RCxDQUFDO1FBRmUsb0JBQWMsaUJBRTdCLENBQUE7UUFFRCxTQUFnQixvQkFBb0IsQ0FBQyxPQUFtQixFQUFFLFVBQWtCLGlCQUFpQjtZQUM1RixLQUFLLE1BQU0sSUFBSSxJQUFJLE9BQU8sQ0FBQyxLQUFLLEVBQUU7Z0JBQ2pDLElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRTtvQkFDekMsSUFBSSxJQUFBLGlCQUFVLEVBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRTt3QkFDdkYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUcsSUFBQSxXQUFJLEVBQUMsT0FBTyxFQUFFLElBQUEsZUFBUSxFQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztxQkFDakU7aUJBQ0Q7YUFDRDtZQUNELE9BQU8sT0FBTyxDQUFDO1FBQ2hCLENBQUM7UUFUZSwwQkFBb0IsdUJBU25DLENBQUE7SUFDRixDQUFDLEVBaEJnQixLQUFLLHFCQUFMLEtBQUssUUFnQnJCIn0=