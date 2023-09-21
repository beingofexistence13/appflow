/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/glob", "vs/base/common/network", "vs/base/common/path", "vs/base/common/resources", "vs/nls", "vs/workbench/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform"], function (require, exports, glob, network_1, path_1, resources_1, nls_1, configuration_1, configurationRegistry_1, instantiation_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.globMatchesResource = exports.priorityToRank = exports.ResolvedStatus = exports.RegisteredEditorPriority = exports.editorsAssociationsSettingId = exports.IEditorResolverService = void 0;
    exports.IEditorResolverService = (0, instantiation_1.createDecorator)('editorResolverService');
    exports.editorsAssociationsSettingId = 'workbench.editorAssociations';
    const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    const editorAssociationsConfigurationNode = {
        ...configuration_1.workbenchConfigurationNodeBase,
        properties: {
            'workbench.editorAssociations': {
                type: 'object',
                markdownDescription: (0, nls_1.localize)('editor.editorAssociations', "Configure [glob patterns](https://aka.ms/vscode-glob-patterns) to editors (for example `\"*.hex\": \"hexEditor.hexedit\"`). These have precedence over the default behavior."),
                additionalProperties: {
                    type: 'string'
                }
            }
        }
    };
    configurationRegistry.registerConfiguration(editorAssociationsConfigurationNode);
    //#endregion
    //#region EditorResolverService types
    var RegisteredEditorPriority;
    (function (RegisteredEditorPriority) {
        RegisteredEditorPriority["builtin"] = "builtin";
        RegisteredEditorPriority["option"] = "option";
        RegisteredEditorPriority["exclusive"] = "exclusive";
        RegisteredEditorPriority["default"] = "default";
    })(RegisteredEditorPriority || (exports.RegisteredEditorPriority = RegisteredEditorPriority = {}));
    /**
     * If we didn't resolve an editor dictates what to do with the opening state
     * ABORT = Do not continue with opening the editor
     * NONE = Continue as if the resolution has been disabled as the service could not resolve one
     */
    var ResolvedStatus;
    (function (ResolvedStatus) {
        ResolvedStatus[ResolvedStatus["ABORT"] = 1] = "ABORT";
        ResolvedStatus[ResolvedStatus["NONE"] = 2] = "NONE";
    })(ResolvedStatus || (exports.ResolvedStatus = ResolvedStatus = {}));
    //#endregion
    //#region Util functions
    function priorityToRank(priority) {
        switch (priority) {
            case RegisteredEditorPriority.exclusive:
                return 5;
            case RegisteredEditorPriority.default:
                return 4;
            case RegisteredEditorPriority.builtin:
                return 3;
            // Text editor is priority 2
            case RegisteredEditorPriority.option:
            default:
                return 1;
        }
    }
    exports.priorityToRank = priorityToRank;
    function globMatchesResource(globPattern, resource) {
        const excludedSchemes = new Set([
            network_1.Schemas.extension,
            network_1.Schemas.webviewPanel,
            network_1.Schemas.vscodeWorkspaceTrust,
            network_1.Schemas.vscodeSettings
        ]);
        // We want to say that the above schemes match no glob patterns
        if (excludedSchemes.has(resource.scheme)) {
            return false;
        }
        const matchOnPath = typeof globPattern === 'string' && globPattern.indexOf(path_1.posix.sep) >= 0;
        const target = matchOnPath ? `${resource.scheme}:${resource.path}` : (0, resources_1.basename)(resource);
        return glob.match(typeof globPattern === 'string' ? globPattern.toLowerCase() : globPattern, target.toLowerCase());
    }
    exports.globMatchesResource = globMatchesResource;
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yUmVzb2x2ZXJTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2VkaXRvci9jb21tb24vZWRpdG9yUmVzb2x2ZXJTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQW9CbkYsUUFBQSxzQkFBc0IsR0FBRyxJQUFBLCtCQUFlLEVBQXlCLHVCQUF1QixDQUFDLENBQUM7SUFhMUYsUUFBQSw0QkFBNEIsR0FBRyw4QkFBOEIsQ0FBQztJQUUzRSxNQUFNLHFCQUFxQixHQUFHLG1CQUFRLENBQUMsRUFBRSxDQUF5QixrQ0FBdUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUV6RyxNQUFNLG1DQUFtQyxHQUF1QjtRQUMvRCxHQUFHLDhDQUE4QjtRQUNqQyxVQUFVLEVBQUU7WUFDWCw4QkFBOEIsRUFBRTtnQkFDL0IsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsbUJBQW1CLEVBQUUsSUFBQSxjQUFRLEVBQUMsMkJBQTJCLEVBQUUsOEtBQThLLENBQUM7Z0JBQzFPLG9CQUFvQixFQUFFO29CQUNyQixJQUFJLEVBQUUsUUFBUTtpQkFDZDthQUNEO1NBQ0Q7S0FDRCxDQUFDO0lBUUYscUJBQXFCLENBQUMscUJBQXFCLENBQUMsbUNBQW1DLENBQUMsQ0FBQztJQUNqRixZQUFZO0lBRVoscUNBQXFDO0lBQ3JDLElBQVksd0JBS1g7SUFMRCxXQUFZLHdCQUF3QjtRQUNuQywrQ0FBbUIsQ0FBQTtRQUNuQiw2Q0FBaUIsQ0FBQTtRQUNqQixtREFBdUIsQ0FBQTtRQUN2QiwrQ0FBbUIsQ0FBQTtJQUNwQixDQUFDLEVBTFcsd0JBQXdCLHdDQUF4Qix3QkFBd0IsUUFLbkM7SUFFRDs7OztPQUlHO0lBQ0gsSUFBa0IsY0FHakI7SUFIRCxXQUFrQixjQUFjO1FBQy9CLHFEQUFTLENBQUE7UUFDVCxtREFBUSxDQUFBO0lBQ1QsQ0FBQyxFQUhpQixjQUFjLDhCQUFkLGNBQWMsUUFHL0I7SUF5R0QsWUFBWTtJQUVaLHdCQUF3QjtJQUN4QixTQUFnQixjQUFjLENBQUMsUUFBa0M7UUFDaEUsUUFBUSxRQUFRLEVBQUU7WUFDakIsS0FBSyx3QkFBd0IsQ0FBQyxTQUFTO2dCQUN0QyxPQUFPLENBQUMsQ0FBQztZQUNWLEtBQUssd0JBQXdCLENBQUMsT0FBTztnQkFDcEMsT0FBTyxDQUFDLENBQUM7WUFDVixLQUFLLHdCQUF3QixDQUFDLE9BQU87Z0JBQ3BDLE9BQU8sQ0FBQyxDQUFDO1lBQ1YsNEJBQTRCO1lBQzVCLEtBQUssd0JBQXdCLENBQUMsTUFBTSxDQUFDO1lBQ3JDO2dCQUNDLE9BQU8sQ0FBQyxDQUFDO1NBQ1Y7SUFDRixDQUFDO0lBYkQsd0NBYUM7SUFFRCxTQUFnQixtQkFBbUIsQ0FBQyxXQUEyQyxFQUFFLFFBQWE7UUFDN0YsTUFBTSxlQUFlLEdBQUcsSUFBSSxHQUFHLENBQUM7WUFDL0IsaUJBQU8sQ0FBQyxTQUFTO1lBQ2pCLGlCQUFPLENBQUMsWUFBWTtZQUNwQixpQkFBTyxDQUFDLG9CQUFvQjtZQUM1QixpQkFBTyxDQUFDLGNBQWM7U0FDdEIsQ0FBQyxDQUFDO1FBQ0gsK0RBQStEO1FBQy9ELElBQUksZUFBZSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDekMsT0FBTyxLQUFLLENBQUM7U0FDYjtRQUNELE1BQU0sV0FBVyxHQUFHLE9BQU8sV0FBVyxLQUFLLFFBQVEsSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLFlBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0YsTUFBTSxNQUFNLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFBLG9CQUFRLEVBQUMsUUFBUSxDQUFDLENBQUM7UUFDeEYsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sV0FBVyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFDcEgsQ0FBQztJQWRELGtEQWNDOztBQUNELFlBQVkifQ==