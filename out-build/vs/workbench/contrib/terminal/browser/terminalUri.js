/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network", "vs/base/common/uri"], function (require, exports, network_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$RVb = exports.$QVb = exports.$PVb = exports.$OVb = void 0;
    function $OVb(resource) {
        const [, workspaceId, instanceId] = resource.path.split('/');
        if (!workspaceId || !Number.parseInt(instanceId)) {
            throw new Error(`Could not parse terminal uri for resource ${resource}`);
        }
        return { workspaceId, instanceId: Number.parseInt(instanceId) };
    }
    exports.$OVb = $OVb;
    function $PVb(workspaceId, instanceId, title) {
        return uri_1.URI.from({
            scheme: network_1.Schemas.vscodeTerminal,
            path: `/${workspaceId}/${instanceId}`,
            fragment: title || undefined,
        });
    }
    exports.$PVb = $PVb;
    function $QVb(event) {
        const resources = event.dataTransfer?.getData("Terminals" /* TerminalDataTransfers.Terminals */);
        if (resources) {
            const json = JSON.parse(resources);
            const result = [];
            for (const entry of json) {
                result.push(uri_1.URI.parse(entry));
            }
            return result.length === 0 ? undefined : result;
        }
        return undefined;
    }
    exports.$QVb = $QVb;
    function $RVb(instances, resource) {
        if (resource) {
            for (const instance of instances) {
                // Note that the URI's workspace and instance id might not originally be from this window
                // Don't bother checking the scheme and assume instances only contains terminals
                if (instance.resource.path === resource.path) {
                    return instance;
                }
            }
        }
        return undefined;
    }
    exports.$RVb = $RVb;
});
//# sourceMappingURL=terminalUri.js.map