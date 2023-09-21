/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/glob", "vs/base/common/mime", "vs/base/common/network", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/strings", "vs/editor/common/languages/modesRegistry"], function (require, exports, glob_1, mime_1, network_1, path_1, resources_1, strings_1, modesRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getLanguageIds = exports.getMimeTypes = exports.clearConfiguredLanguageAssociations = exports.clearPlatformLanguageAssociations = exports.registerConfiguredLanguageAssociation = exports.registerPlatformLanguageAssociation = void 0;
    let registeredAssociations = [];
    let nonUserRegisteredAssociations = [];
    let userRegisteredAssociations = [];
    /**
     * Associate a language to the registry (platform).
     * * **NOTE**: This association will lose over associations registered using `registerConfiguredLanguageAssociation`.
     * * **NOTE**: Use `clearPlatformLanguageAssociations` to remove all associations registered using this function.
     */
    function registerPlatformLanguageAssociation(association, warnOnOverwrite = false) {
        _registerLanguageAssociation(association, false, warnOnOverwrite);
    }
    exports.registerPlatformLanguageAssociation = registerPlatformLanguageAssociation;
    /**
     * Associate a language to the registry (configured).
     * * **NOTE**: This association will win over associations registered using `registerPlatformLanguageAssociation`.
     * * **NOTE**: Use `clearConfiguredLanguageAssociations` to remove all associations registered using this function.
     */
    function registerConfiguredLanguageAssociation(association) {
        _registerLanguageAssociation(association, true, false);
    }
    exports.registerConfiguredLanguageAssociation = registerConfiguredLanguageAssociation;
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
            filepatternLowercase: association.filepattern ? (0, glob_1.parse)(association.filepattern.toLowerCase()) : undefined,
            filepatternOnPath: association.filepattern ? association.filepattern.indexOf(path_1.posix.sep) >= 0 : false
        };
    }
    /**
     * Clear language associations from the registry (platform).
     */
    function clearPlatformLanguageAssociations() {
        registeredAssociations = registeredAssociations.filter(a => a.userConfigured);
        nonUserRegisteredAssociations = [];
    }
    exports.clearPlatformLanguageAssociations = clearPlatformLanguageAssociations;
    /**
     * Clear language associations from the registry (configured).
     */
    function clearConfiguredLanguageAssociations() {
        registeredAssociations = registeredAssociations.filter(a => !a.userConfigured);
        userRegisteredAssociations = [];
    }
    exports.clearConfiguredLanguageAssociations = clearConfiguredLanguageAssociations;
    /**
     * Given a file, return the best matching mime types for it
     * based on the registered language associations.
     */
    function getMimeTypes(resource, firstLine) {
        return getAssociations(resource, firstLine).map(item => item.mime);
    }
    exports.getMimeTypes = getMimeTypes;
    /**
     * @see `getMimeTypes`
     */
    function getLanguageIds(resource, firstLine) {
        return getAssociations(resource, firstLine).map(item => item.id);
    }
    exports.getLanguageIds = getLanguageIds;
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
            return [{ id: 'unknown', mime: mime_1.Mimes.unknown }];
        }
        path = path.toLowerCase();
        const filename = (0, path_1.basename)(path);
        // 1.) User configured mappings have highest priority
        const configuredLanguage = getAssociationByPath(path, filename, userRegisteredAssociations);
        if (configuredLanguage) {
            return [configuredLanguage, { id: modesRegistry_1.PLAINTEXT_LANGUAGE_ID, mime: mime_1.Mimes.text }];
        }
        // 2.) Registered mappings have middle priority
        const registeredLanguage = getAssociationByPath(path, filename, nonUserRegisteredAssociations);
        if (registeredLanguage) {
            return [registeredLanguage, { id: modesRegistry_1.PLAINTEXT_LANGUAGE_ID, mime: mime_1.Mimes.text }];
        }
        // 3.) Firstline has lowest priority
        if (firstLine) {
            const firstlineLanguage = getAssociationByFirstline(firstLine);
            if (firstlineLanguage) {
                return [firstlineLanguage, { id: modesRegistry_1.PLAINTEXT_LANGUAGE_ID, mime: mime_1.Mimes.text }];
            }
        }
        return [{ id: 'unknown', mime: mime_1.Mimes.unknown }];
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
        if ((0, strings_1.startsWithUTF8BOM)(firstLine)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2VzQXNzb2NpYXRpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9zZXJ2aWNlcy9sYW5ndWFnZXNBc3NvY2lhdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBNEJoRyxJQUFJLHNCQUFzQixHQUErQixFQUFFLENBQUM7SUFDNUQsSUFBSSw2QkFBNkIsR0FBK0IsRUFBRSxDQUFDO0lBQ25FLElBQUksMEJBQTBCLEdBQStCLEVBQUUsQ0FBQztJQUVoRTs7OztPQUlHO0lBQ0gsU0FBZ0IsbUNBQW1DLENBQUMsV0FBaUMsRUFBRSxlQUFlLEdBQUcsS0FBSztRQUM3Ryw0QkFBNEIsQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFFLGVBQWUsQ0FBQyxDQUFDO0lBQ25FLENBQUM7SUFGRCxrRkFFQztJQUVEOzs7O09BSUc7SUFDSCxTQUFnQixxQ0FBcUMsQ0FBQyxXQUFpQztRQUN0Riw0QkFBNEIsQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFGRCxzRkFFQztJQUVELFNBQVMsNEJBQTRCLENBQUMsV0FBaUMsRUFBRSxjQUF1QixFQUFFLGVBQXdCO1FBRXpILFdBQVc7UUFDWCxNQUFNLGVBQWUsR0FBRyx5QkFBeUIsQ0FBQyxXQUFXLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDL0Usc0JBQXNCLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQzdDLElBQUksQ0FBQyxlQUFlLENBQUMsY0FBYyxFQUFFO1lBQ3BDLDZCQUE2QixDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztTQUNwRDthQUFNO1lBQ04sMEJBQTBCLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1NBQ2pEO1FBRUQsbUVBQW1FO1FBQ25FLElBQUksZUFBZSxJQUFJLENBQUMsZUFBZSxD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