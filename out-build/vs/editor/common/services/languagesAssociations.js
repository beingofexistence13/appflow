/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/glob", "vs/base/common/mime", "vs/base/common/network", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/strings", "vs/editor/common/languages/modesRegistry"], function (require, exports, glob_1, mime_1, network_1, path_1, resources_1, strings_1, modesRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$gmb = exports.$fmb = exports.$emb = exports.$dmb = exports.$cmb = exports.$bmb = void 0;
    let registeredAssociations = [];
    let nonUserRegisteredAssociations = [];
    let userRegisteredAssociations = [];
    /**
     * Associate a language to the registry (platform).
     * * **NOTE**: This association will lose over associations registered using `registerConfiguredLanguageAssociation`.
     * * **NOTE**: Use `clearPlatformLanguageAssociations` to remove all associations registered using this function.
     */
    function $bmb(association, warnOnOverwrite = false) {
        _registerLanguageAssociation(association, false, warnOnOverwrite);
    }
    exports.$bmb = $bmb;
    /**
     * Associate a language to the registry (configured).
     * * **NOTE**: This association will win over associations registered using `registerPlatformLanguageAssociation`.
     * * **NOTE**: Use `clearConfiguredLanguageAssociations` to remove all associations registered using this function.
     */
    function $cmb(association) {
        _registerLanguageAssociation(association, true, false);
    }
    exports.$cmb = $cmb;
    function _registerLanguageAssociation(association, userConfigured, warnOnOverwrite) {
        // Register
        const associationItem = toLanguageAssociationItem(association, userConfigured);
        registeredAssociations.push(associationItem);
        if (!associationItem.userConfigured) {
            nonUserRegisteredAssociations.push(associationItem);
        }
        else {
            userRegisteredAssociations.push(associationItem);
        }
        // Check for conflicts unless this is a user configured association
        if (warnOnOverwrite && !associationItem.userConfigured) {
            registeredAssociations.forEach(a => {
                if (a.mime === associationItem.mime || a.userConfigured) {
                    return; // same mime or userConfigured is ok
                }
                if (associationItem.extension && a.extension === associationItem.extension) {
                    console.warn(`Overwriting extension <<${associationItem.extension}>> to now point to mime <<${associationItem.mime}>>`);
                }
                if (associationItem.filename && a.filename === associationItem.filename) {
                    console.warn(`Overwriting filename <<${associationItem.filename}>> to now point to mime <<${associationItem.mime}>>`);
                }
                if (associationItem.filepattern && a.filepattern === associationItem.filepattern) {
                    console.warn(`Overwriting filepattern <<${associationItem.filepattern}>> to now point to mime <<${associationItem.mime}>>`);
                }
                if (associationItem.firstline && a.firstline === associationItem.firstline) {
                    console.warn(`Overwriting firstline <<${associationItem.firstline}>> to now point to mime <<${associationItem.mime}>>`);
                }
            });
        }
    }
    function toLanguageAssociationItem(association, userConfigured) {
        return {
            id: association.id,
            mime: association.mime,
            filename: association.filename,
            extension: association.extension,
            filepattern: association.filepattern,
            firstline: association.firstline,
            userConfigured: userConfigured,
            filenameLowercase: association.filename ? association.filename.toLowerCase() : undefined,
            extensionLowercase: association.extension ? association.extension.toLowerCase() : undefined,
            filepatternLowercase: association.filepattern ? (0, glob_1.$rj)(association.filepattern.toLowerCase()) : undefined,
            filepatternOnPath: association.filepattern ? association.filepattern.indexOf(path_1.$6d.sep) >= 0 : false
        };
    }
    /**
     * Clear language associations from the registry (platform).
     */
    function $dmb() {
        registeredAssociations = registeredAssociations.filter(a => a.userConfigured);
        nonUserRegisteredAssociations = [];
    }
    exports.$dmb = $dmb;
    /**
     * Clear language associations from the registry (configured).
     */
    function $emb() {
        registeredAssociations = registeredAssociations.filter(a => !a.userConfigured);
        userRegisteredAssociations = [];
    }
    exports.$emb = $emb;
    /**
     * Given a file, return the best matching mime types for it
     * based on the registered language associations.
     */
    function $fmb(resource, firstLine) {
        return getAssociations(resource, firstLine).map(item => item.mime);
    }
    exports.$fmb = $fmb;
    /**
     * @see `getMimeTypes`
     */
    function $gmb(resource, firstLine) {
        return getAssociations(resource, firstLine).map(item => item.id);
    }
    exports.$gmb = $gmb;
    function getAssociations(resource, firstLine) {
        let path;
        if (resource) {
            switch (resource.scheme) {
                case network_1.Schemas.file:
                    path = resource.fsPath;
                    break;
                case network_1.Schemas.data: {
                    const metadata = resources_1.DataUri.parseMetaData(resource);
                    path = metadata.get(resources_1.DataUri.META_DATA_LABEL);
                    break;
                }
                case network_1.Schemas.vscodeNotebookCell:
                    // File path not relevant for language detection of cell
                    path = undefined;
                    break;
                default:
                    path = resource.path;
            }
        }
        if (!path) {
            return [{ id: 'unknown', mime: mime_1.$Hr.unknown }];
        }
        path = path.toLowerCase();
        const filename = (0, path_1.$ae)(path);
        // 1.) User configured mappings have highest priority
        const configuredLanguage = getAssociationByPath(path, filename, userRegisteredAssociations);
        if (configuredLanguage) {
            return [configuredLanguage, { id: modesRegistry_1.$Yt, mime: mime_1.$Hr.text }];
        }
        // 2.) Registered mappings have middle priority
        const registeredLanguage = getAssociationByPath(path, filename, nonUserRegisteredAssociations);
        if (registeredLanguage) {
            return [registeredLanguage, { id: modesRegistry_1.$Yt, mime: mime_1.$Hr.text }];
        }
        // 3.) Firstline has lowest priority
        if (firstLine) {
            const firstlineLanguage = getAssociationByFirstline(firstLine);
            if (firstlineLanguage) {
                return [firstlineLanguage, { id: modesRegistry_1.$Yt, mime: mime_1.$Hr.text }];
            }
        }
        return [{ id: 'unknown', mime: mime_1.$Hr.unknown }];
    }
    function getAssociationByPath(path, filename, associations) {
        let filenameMatch = undefined;
        let patternMatch = undefined;
        let extensionMatch = undefined;
        // We want to prioritize associations based on the order they are registered so that the last registered
        // association wins over all other. This is for https://github.com/microsoft/vscode/issues/20074
        for (let i = associations.length - 1; i >= 0; i--) {
            const association = associations[i];
            // First exact name match
            if (filename === association.filenameLowercase) {
                filenameMatch = association;
                break; // take it!
            }
            // Longest pattern match
            if (association.filepattern) {
                if (!patternMatch || association.filepattern.length > patternMatch.filepattern.length) {
                    const target = association.filepatternOnPath ? path : filename; // match on full path if pattern contains path separator
                    if (association.filepatternLowercase?.(target)) {
                        patternMatch = association;
                    }
                }
            }
            // Longest extension match
            if (association.extension) {
                if (!extensionMatch || association.extension.length > extensionMatch.extension.length) {
                    if (filename.endsWith(association.extensionLowercase)) {
                        extensionMatch = association;
                    }
                }
            }
        }
        // 1.) Exact name match has second highest priority
        if (filenameMatch) {
            return filenameMatch;
        }
        // 2.) Match on pattern
        if (patternMatch) {
            return patternMatch;
        }
        // 3.) Match on extension comes next
        if (extensionMatch) {
            return extensionMatch;
        }
        return undefined;
    }
    function getAssociationByFirstline(firstLine) {
        if ((0, strings_1.$0e)(firstLine)) {
            firstLine = firstLine.substr(1);
        }
        if (firstLine.length > 0) {
            // We want to prioritize associations based on the order they are registered so that the last registered
            // association wins over all other. This is for https://github.com/microsoft/vscode/issues/20074
            for (let i = registeredAssociations.length - 1; i >= 0; i--) {
                const association = registeredAssociations[i];
                if (!association.firstline) {
                    continue;
                }
                const matches = firstLine.match(association.firstline);
                if (matches && matches.length > 0) {
                    return association;
                }
            }
        }
        return undefined;
    }
});
//# sourceMappingURL=languagesAssociations.js.map