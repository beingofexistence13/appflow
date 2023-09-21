/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/uri", "vs/nls!vs/platform/terminal/common/terminalProfiles", "vs/base/common/themables"], function (require, exports, codicons_1, uri_1, nls_1, themables_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$8q = exports.$7q = exports.$6q = exports.$5q = void 0;
    function $5q(detectedProfiles, extensionProfiles) {
        const result = [{
                name: null,
                description: (0, nls_1.localize)(0, null)
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
    exports.$5q = $5q;
    function createProfileDescription(profile) {
        let description = `$(${themables_1.ThemeIcon.isThemeIcon(profile.icon) ? profile.icon.id : profile.icon ? profile.icon : codicons_1.$Pj.terminal.id}) ${profile.profileName}\n- path: ${profile.path}`;
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
        const description = `$(${themables_1.ThemeIcon.isThemeIcon(profile.icon) ? profile.icon.id : profile.icon ? profile.icon : codicons_1.$Pj.terminal.id}) ${profile.title}\n- extensionIdentifier: ${profile.extensionIdentifier}`;
        return description;
    }
    function $6q(args1, args2) {
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
    exports.$6q = $6q;
    function $7q(a, b) {
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
            if ((uri_1.URI.isUri(castedA.light) || $8q(castedA.light)) && (uri_1.URI.isUri(castedA.dark) || $8q(castedA.dark))
                && (uri_1.URI.isUri(castedB.light) || $8q(castedB.light)) && (uri_1.URI.isUri(castedB.dark) || $8q(castedB.dark))) {
                return castedA.light.path === castedB.light.path && castedA.dark.path === castedB.dark.path;
            }
        }
        if ((uri_1.URI.isUri(a) && uri_1.URI.isUri(b)) || ($8q(a) || $8q(b))) {
            const castedA = a;
            const castedB = b;
            return castedA.path === castedB.path && castedA.scheme === castedB.scheme;
        }
        return false;
    }
    exports.$7q = $7q;
    function $8q(thing) {
        if (!thing) {
            return false;
        }
        return typeof thing.path === 'string' &&
            typeof thing.scheme === 'string';
    }
    exports.$8q = $8q;
});
//# sourceMappingURL=terminalProfiles.js.map