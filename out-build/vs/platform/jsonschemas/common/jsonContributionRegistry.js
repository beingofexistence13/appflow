/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/platform/registry/common/platform"], function (require, exports, event_1, platform) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$9m = void 0;
    exports.$9m = {
        JSONContribution: 'base.contributions.json'
    };
    function normalizeId(id) {
        if (id.length > 0 && id.charAt(id.length - 1) === '#') {
            return id.substring(0, id.length - 1);
        }
        return id;
    }
    class JSONContributionRegistry {
        constructor() {
            this.b = new event_1.$fd();
            this.onDidChangeSchema = this.b.event;
            this.a = {};
        }
        registerSchema(uri, unresolvedSchemaContent) {
            this.a[normalizeId(uri)] = unresolvedSchemaContent;
            this.b.fire(uri);
        }
        notifySchemaChanged(uri) {
            this.b.fire(uri);
        }
        getSchemaContributions() {
            return {
                schemas: this.a,
            };
        }
    }
    const jsonContributionRegistry = new JSONContributionRegistry();
    platform.$8m.add(exports.$9m.JSONContribution, jsonContributionRegistry);
});
//# sourceMappingURL=jsonContributionRegistry.js.map