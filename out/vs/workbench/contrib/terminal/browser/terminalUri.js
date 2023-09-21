/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network", "vs/base/common/uri"], function (require, exports, network_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getInstanceFromResource = exports.getTerminalResourcesFromDragEvent = exports.getTerminalUri = exports.parseTerminalUri = void 0;
    function parseTerminalUri(resource) {
        const [, workspaceId, instanceId] = resource.path.split('/');
        if (!workspaceId || !Number.parseInt(instanceId)) {
            throw new Error(`Could not parse terminal uri for resource ${resource}`);
        }
        return { workspaceId, instanceId: Number.parseInt(instanceId) };
    }
    exports.parseTerminalUri = parseTerminalUri;
    function getTerminalUri(workspaceId, instanceId, title) {
        return uri_1.URI.from({
            scheme: network_1.Schemas.vscodeTerminal,
            path: `/${workspaceId}/${instanceId}`,
            fragment: title || undefined,
        });
    }
    exports.getTerminalUri = getTerminalUri;
    function getTerminalResourcesFromDragEvent(event) {
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
    exports.getTerminalResourcesFromDragEvent = getTerminalResourcesFromDragEvent;
    function getInstanceFromResource(instances, resource) {
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
    exports.getInstanceFromResource = getInstanceFromResource;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxVcmkuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbC9icm93c2VyL3Rlcm1pbmFsVXJpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU1oRyxTQUFnQixnQkFBZ0IsQ0FBQyxRQUFhO1FBQzdDLE1BQU0sQ0FBQyxFQUFFLFdBQVcsRUFBRSxVQUFVLENBQUMsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM3RCxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUNqRCxNQUFNLElBQUksS0FBSyxDQUFDLDZDQUE2QyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1NBQ3pFO1FBQ0QsT0FBTyxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO0lBQ2pFLENBQUM7SUFORCw0Q0FNQztJQUVELFNBQWdCLGNBQWMsQ0FBQyxXQUFtQixFQUFFLFVBQWtCLEVBQUUsS0FBYztRQUNyRixPQUFPLFNBQUcsQ0FBQyxJQUFJLENBQUM7WUFDZixNQUFNLEVBQUUsaUJBQU8sQ0FBQyxjQUFjO1lBQzlCLElBQUksRUFBRSxJQUFJLFdBQVcsSUFBSSxVQUFVLEVBQUU7WUFDckMsUUFBUSxFQUFFLEtBQUssSUFBSSxTQUFTO1NBQzVCLENBQUMsQ0FBQztJQUNKLENBQUM7SUFORCx3Q0FNQztJQVdELFNBQWdCLGlDQUFpQyxDQUFDLEtBQXdCO1FBQ3pFLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxZQUFZLEVBQUUsT0FBTyxtREFBaUMsQ0FBQztRQUMvRSxJQUFJLFNBQVMsRUFBRTtZQUNkLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbkMsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDO1lBQ2xCLEtBQUssTUFBTSxLQUFLLElBQUksSUFBSSxFQUFFO2dCQUN6QixNQUFNLENBQUMsSUFBSSxDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzthQUM5QjtZQUNELE9BQU8sTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1NBQ2hEO1FBQ0QsT0FBTyxTQUFTLENBQUM7SUFDbEIsQ0FBQztJQVhELDhFQVdDO0lBRUQsU0FBZ0IsdUJBQXVCLENBQWdELFNBQWMsRUFBRSxRQUF5QjtRQUMvSCxJQUFJLFFBQVEsRUFBRTtZQUNiLEtBQUssTUFBTSxRQUFRLElBQUksU0FBUyxFQUFFO2dCQUNqQyx5RkFBeUY7Z0JBQ3pGLGdGQUFnRjtnQkFDaEYsSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksS0FBSyxRQUFRLENBQUMsSUFBSSxFQUFFO29CQUM3QyxPQUFPLFFBQVEsQ0FBQztpQkFDaEI7YUFDRDtTQUNEO1FBQ0QsT0FBTyxTQUFTLENBQUM7SUFDbEIsQ0FBQztJQVhELDBEQVdDIn0=