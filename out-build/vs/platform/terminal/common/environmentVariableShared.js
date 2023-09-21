/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$fr = exports.$er = exports.$dr = exports.$cr = exports.$br = exports.$ar = void 0;
    // This file is shared between the renderer and extension host
    function $ar(collection) {
        return [...collection.entries()];
    }
    exports.$ar = $ar;
    function $br(descriptionMap) {
        return descriptionMap ? [...descriptionMap.entries()] : [];
    }
    exports.$br = $br;
    function $cr(serializedCollection) {
        return new Map(serializedCollection);
    }
    exports.$cr = $cr;
    function $dr(serializableEnvironmentDescription) {
        return new Map(serializableEnvironmentDescription ?? []);
    }
    exports.$dr = $dr;
    function $er(collections) {
        return Array.from(collections.entries()).map(e => {
            return [e[0], $ar(e[1].map), $br(e[1].descriptionMap)];
        });
    }
    exports.$er = $er;
    function $fr(serializedCollection) {
        return new Map(serializedCollection.map(e => {
            return [e[0], { map: $cr(e[1]), descriptionMap: $dr(e[2]) }];
        }));
    }
    exports.$fr = $fr;
});
//# sourceMappingURL=environmentVariableShared.js.map