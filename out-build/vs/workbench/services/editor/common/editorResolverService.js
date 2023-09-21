/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/glob", "vs/base/common/network", "vs/base/common/path", "vs/base/common/resources", "vs/nls!vs/workbench/services/editor/common/editorResolverService", "vs/workbench/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform"], function (require, exports, glob, network_1, path_1, resources_1, nls_1, configuration_1, configurationRegistry_1, instantiation_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$sbb = exports.$rbb = exports.ResolvedStatus = exports.RegisteredEditorPriority = exports.$qbb = exports.$pbb = void 0;
    exports.$pbb = (0, instantiation_1.$Bh)('editorResolverService');
    exports.$qbb = 'workbench.editorAssociations';
    const configurationRegistry = platform_1.$8m.as(configurationRegistry_1.$an.Configuration);
    const editorAssociationsConfigurationNode = {
        ...configuration_1.$$y,
        properties: {
            'workbench.editorAssociations': {
                type: 'object',
                markdownDescription: (0, nls_1.localize)(0, null),
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
    function $rbb(priority) {
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
    exports.$rbb = $rbb;
    function $sbb(globPattern, resource) {
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
        const matchOnPath = typeof globPattern === 'string' && globPattern.indexOf(path_1.$6d.sep) >= 0;
        const target = matchOnPath ? `${resource.scheme}:${resource.path}` : (0, resources_1.$fg)(resource);
        return glob.$qj(typeof globPattern === 'string' ? globPattern.toLowerCase() : globPattern, target.toLowerCase());
    }
    exports.$sbb = $sbb;
});
//#endregion
//# sourceMappingURL=editorResolverService.js.map