/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.refineServiceDecorator = exports.createDecorator = exports.IInstantiationService = exports._util = void 0;
    // ------ internal util
    var _util;
    (function (_util) {
        _util.serviceIds = new Map();
        _util.DI_TARGET = '$di$target';
        _util.DI_DEPENDENCIES = '$di$dependencies';
        function getServiceDependencies(ctor) {
            return ctor[_util.DI_DEPENDENCIES] || [];
        }
        _util.getServiceDependencies = getServiceDependencies;
    })(_util || (exports._util = _util = {}));
    exports.IInstantiationService = createDecorator('instantiationService');
    function storeServiceDependency(id, target, index) {
        if (target[_util.DI_TARGET] === target) {
            target[_util.DI_DEPENDENCIES].push({ id, index });
        }
        else {
            target[_util.DI_DEPENDENCIES] = [{ id, index }];
            target[_util.DI_TARGET] = target;
        }
    }
    /**
     * The *only* valid way to create a {{ServiceIdentifier}}.
     */
    function createDecorator(serviceId) {
        if (_util.serviceIds.has(serviceId)) {
            return _util.serviceIds.get(serviceId);
        }
        const id = function (target, key, index) {
            if (arguments.length !== 3) {
                throw new Error('@IServiceName-decorator can only be used to decorate a parameter');
            }
            storeServiceDependency(id, target, index);
        };
        id.toString = () => serviceId;
        _util.serviceIds.set(serviceId, id);
        return id;
    }
    exports.createDecorator = createDecorator;
    function refineServiceDecorator(serviceIdentifier) {
        return serviceIdentifier;
    }
    exports.refineServiceDecorator = refineServiceDecorator;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdGFudGlhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2luc3RhbnRpYXRpb24vY29tbW9uL2luc3RhbnRpYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBS2hHLHVCQUF1QjtJQUV2QixJQUFpQixLQUFLLENBVXJCO0lBVkQsV0FBaUIsS0FBSztRQUVSLGdCQUFVLEdBQUcsSUFBSSxHQUFHLEVBQWtDLENBQUM7UUFFdkQsZUFBUyxHQUFHLFlBQVksQ0FBQztRQUN6QixxQkFBZSxHQUFHLGtCQUFrQixDQUFDO1FBRWxELFNBQWdCLHNCQUFzQixDQUFDLElBQVM7WUFDL0MsT0FBTyxJQUFJLENBQUMsTUFBQSxlQUFlLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDcEMsQ0FBQztRQUZlLDRCQUFzQix5QkFFckMsQ0FBQTtJQUNGLENBQUMsRUFWZ0IsS0FBSyxxQkFBTCxLQUFLLFFBVXJCO0lBY1ksUUFBQSxxQkFBcUIsR0FBRyxlQUFlLENBQXdCLHNCQUFzQixDQUFDLENBQUM7SUEwQ3BHLFNBQVMsc0JBQXNCLENBQUMsRUFBWSxFQUFFLE1BQWdCLEVBQUUsS0FBYTtRQUM1RSxJQUFLLE1BQWMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssTUFBTSxFQUFFO1lBQy9DLE1BQWMsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7U0FDM0Q7YUFBTTtZQUNMLE1BQWMsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQ3hELE1BQWMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsTUFBTSxDQUFDO1NBQzFDO0lBQ0YsQ0FBQztJQUVEOztPQUVHO0lBQ0gsU0FBZ0IsZUFBZSxDQUFJLFNBQWlCO1FBRW5ELElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDcEMsT0FBTyxLQUFLLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUUsQ0FBQztTQUN4QztRQUVELE1BQU0sRUFBRSxHQUFRLFVBQVUsTUFBZ0IsRUFBRSxHQUFXLEVBQUUsS0FBYTtZQUNyRSxJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUMzQixNQUFNLElBQUksS0FBSyxDQUFDLGtFQUFrRSxDQUFDLENBQUM7YUFDcEY7WUFDRCxzQkFBc0IsQ0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzNDLENBQUMsQ0FBQztRQUVGLEVBQUUsQ0FBQyxRQUFRLEdBQUcsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDO1FBRTlCLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNwQyxPQUFPLEVBQUUsQ0FBQztJQUNYLENBQUM7SUFqQkQsMENBaUJDO0lBRUQsU0FBZ0Isc0JBQXNCLENBQW1CLGlCQUF3QztRQUNoRyxPQUE2QixpQkFBaUIsQ0FBQztJQUNoRCxDQUFDO0lBRkQsd0RBRUMifQ==