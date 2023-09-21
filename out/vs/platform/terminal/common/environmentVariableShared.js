/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.deserializeEnvironmentVariableCollections = exports.serializeEnvironmentVariableCollections = exports.deserializeEnvironmentDescriptionMap = exports.deserializeEnvironmentVariableCollection = exports.serializeEnvironmentDescriptionMap = exports.serializeEnvironmentVariableCollection = void 0;
    // This file is shared between the renderer and extension host
    function serializeEnvironmentVariableCollection(collection) {
        return [...collection.entries()];
    }
    exports.serializeEnvironmentVariableCollection = serializeEnvironmentVariableCollection;
    function serializeEnvironmentDescriptionMap(descriptionMap) {
        return descriptionMap ? [...descriptionMap.entries()] : [];
    }
    exports.serializeEnvironmentDescriptionMap = serializeEnvironmentDescriptionMap;
    function deserializeEnvironmentVariableCollection(serializedCollection) {
        return new Map(serializedCollection);
    }
    exports.deserializeEnvironmentVariableCollection = deserializeEnvironmentVariableCollection;
    function deserializeEnvironmentDescriptionMap(serializableEnvironmentDescription) {
        return new Map(serializableEnvironmentDescription ?? []);
    }
    exports.deserializeEnvironmentDescriptionMap = deserializeEnvironmentDescriptionMap;
    function serializeEnvironmentVariableCollections(collections) {
        return Array.from(collections.entries()).map(e => {
            return [e[0], serializeEnvironmentVariableCollection(e[1].map), serializeEnvironmentDescriptionMap(e[1].descriptionMap)];
        });
    }
    exports.serializeEnvironmentVariableCollections = serializeEnvironmentVariableCollections;
    function deserializeEnvironmentVariableCollections(serializedCollection) {
        return new Map(serializedCollection.map(e => {
            return [e[0], { map: deserializeEnvironmentVariableCollection(e[1]), descriptionMap: deserializeEnvironmentDescriptionMap(e[2]) }];
        }));
    }
    exports.deserializeEnvironmentVariableCollections = deserializeEnvironmentVariableCollections;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52aXJvbm1lbnRWYXJpYWJsZVNoYXJlZC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3Rlcm1pbmFsL2NvbW1vbi9lbnZpcm9ubWVudFZhcmlhYmxlU2hhcmVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUloRyw4REFBOEQ7SUFFOUQsU0FBZ0Isc0NBQXNDLENBQUMsVUFBNEQ7UUFDbEgsT0FBTyxDQUFDLEdBQUcsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUZELHdGQUVDO0lBRUQsU0FBZ0Isa0NBQWtDLENBQUMsY0FBMEY7UUFDNUksT0FBTyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQzVELENBQUM7SUFGRCxnRkFFQztJQUVELFNBQWdCLHdDQUF3QyxDQUN2RCxvQkFBZ0U7UUFFaEUsT0FBTyxJQUFJLEdBQUcsQ0FBc0Msb0JBQW9CLENBQUMsQ0FBQztJQUMzRSxDQUFDO0lBSkQsNEZBSUM7SUFFRCxTQUFnQixvQ0FBb0MsQ0FDbkQsa0NBQXNGO1FBRXRGLE9BQU8sSUFBSSxHQUFHLENBQW9ELGtDQUFrQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQzdHLENBQUM7SUFKRCxvRkFJQztJQUVELFNBQWdCLHVDQUF1QyxDQUFDLFdBQWdFO1FBQ3ZILE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDaEQsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxzQ0FBc0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsa0NBQWtDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7UUFDMUgsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBSkQsMEZBSUM7SUFFRCxTQUFnQix5Q0FBeUMsQ0FDeEQsb0JBQWlFO1FBRWpFLE9BQU8sSUFBSSxHQUFHLENBQXlDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNuRixPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLHdDQUF3QyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLGNBQWMsRUFBRSxvQ0FBb0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDcEksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFORCw4RkFNQyJ9