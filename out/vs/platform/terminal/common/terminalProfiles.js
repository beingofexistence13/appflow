/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/uri", "vs/nls", "vs/base/common/themables"], function (require, exports, codicons_1, uri_1, nls_1, themables_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isUriComponents = exports.terminalIconsEqual = exports.terminalProfileArgsMatch = exports.createProfileSchemaEnums = void 0;
    function createProfileSchemaEnums(detectedProfiles, extensionProfiles) {
        const result = [{
                name: null,
                description: (0, nls_1.localize)('terminalAutomaticProfile', 'Automatically detect the default')
            }];
        result.push(...detectedProfiles.map(e => {
            return {
                name: e.profileName,
                description: createProfileDescription(e)
            };
        }));
        if (extensionProfiles) {
            result.push(...extensionProfiles.map(extensionProfile => {
                return {
                    name: extensionProfile.title,
                    description: createExtensionProfileDescription(extensionProfile)
                };
            }));
        }
        return {
            values: result.map(e => e.name),
            markdownDescriptions: result.map(e => e.description)
        };
    }
    exports.createProfileSchemaEnums = createProfileSchemaEnums;
    function createProfileDescription(profile) {
        let description = `$(${themables_1.ThemeIcon.isThemeIcon(profile.icon) ? profile.icon.id : profile.icon ? profile.icon : codicons_1.Codicon.terminal.id}) ${profile.profileName}\n- path: ${profile.path}`;
        if (profile.args) {
            if (typeof profile.args === 'string') {
                description += `\n- args: "${profile.args}"`;
            }
            else {
                description += `\n- args: [${profile.args.length === 0 ? '' : `'${profile.args.join(`','`)}'`}]`;
            }
        }
        if (profile.overrideName !== undefined) {
            description += `\n- overrideName: ${profile.overrideName}`;
        }
        if (profile.color) {
            description += `\n- color: ${profile.color}`;
        }
        if (profile.env) {
            description += `\n- env: ${JSON.stringify(profile.env)}`;
        }
        return description;
    }
    function createExtensionProfileDescription(profile) {
        const description = `$(${themables_1.ThemeIcon.isThemeIcon(profile.icon) ? profile.icon.id : profile.icon ? profile.icon : codicons_1.Codicon.terminal.id}) ${profile.title}\n- extensionIdentifier: ${profile.extensionIdentifier}`;
        return description;
    }
    function terminalProfileArgsMatch(args1, args2) {
        if (!args1 && !args2) {
            return true;
        }
        else if (typeof args1 === 'string' && typeof args2 === 'string') {
            return args1 === args2;
        }
        else if (Array.isArray(args1) && Array.isArray(args2)) {
            if (args1.length !== args2.length) {
                return false;
            }
            for (let i = 0; i < args1.length; i++) {
                if (args1[i] !== args2[i]) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }
    exports.terminalProfileArgsMatch = terminalProfileArgsMatch;
    function terminalIconsEqual(a, b) {
        if (!a && !b) {
            return true;
        }
        else if (!a || !b) {
            return false;
        }
        if (themables_1.ThemeIcon.isThemeIcon(a) && themables_1.ThemeIcon.isThemeIcon(b)) {
            return a.id === b.id && a.color === b.color;
        }
        if (typeof a === 'object' && 'light' in a && 'dark' in a
            && typeof b === 'object' && 'light' in b && 'dark' in b) {
            const castedA = a;
            const castedB = b;
            if ((uri_1.URI.isUri(castedA.light) || isUriComponents(castedA.light)) && (uri_1.URI.isUri(castedA.dark) || isUriComponents(castedA.dark))
                && (uri_1.URI.isUri(castedB.light) || isUriComponents(castedB.light)) && (uri_1.URI.isUri(castedB.dark) || isUriComponents(castedB.dark))) {
                return castedA.light.path === castedB.light.path && castedA.dark.path === castedB.dark.path;
            }
        }
        if ((uri_1.URI.isUri(a) && uri_1.URI.isUri(b)) || (isUriComponents(a) || isUriComponents(b))) {
            const castedA = a;
            const castedB = b;
            return castedA.path === castedB.path && castedA.scheme === castedB.scheme;
        }
        return false;
    }
    exports.terminalIconsEqual = terminalIconsEqual;
    function isUriComponents(thing) {
        if (!thing) {
            return false;
        }
        return typeof thing.path === 'string' &&
            typeof thing.scheme === 'string';
    }
    exports.isUriComponents = isUriComponents;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxQcm9maWxlcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3Rlcm1pbmFsL2NvbW1vbi90ZXJtaW5hbFByb2ZpbGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVFoRyxTQUFnQix3QkFBd0IsQ0FBQyxnQkFBb0MsRUFBRSxpQkFBd0Q7UUFJdEksTUFBTSxNQUFNLEdBQW1ELENBQUM7Z0JBQy9ELElBQUksRUFBRSxJQUFJO2dCQUNWLFdBQVcsRUFBRSxJQUFBLGNBQVEsRUFBQywwQkFBMEIsRUFBRSxrQ0FBa0MsQ0FBQzthQUNyRixDQUFDLENBQUM7UUFDSCxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3ZDLE9BQU87Z0JBQ04sSUFBSSxFQUFFLENBQUMsQ0FBQyxXQUFXO2dCQUNuQixXQUFXLEVBQUUsd0JBQXdCLENBQUMsQ0FBQyxDQUFDO2FBQ3hDLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0osSUFBSSxpQkFBaUIsRUFBRTtZQUN0QixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsaUJBQWlCLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEVBQUU7Z0JBQ3ZELE9BQU87b0JBQ04sSUFBSSxFQUFFLGdCQUFnQixDQUFDLEtBQUs7b0JBQzVCLFdBQVcsRUFBRSxpQ0FBaUMsQ0FBQyxnQkFBZ0IsQ0FBQztpQkFDaEUsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDSjtRQUNELE9BQU87WUFDTixNQUFNLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDL0Isb0JBQW9CLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFD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