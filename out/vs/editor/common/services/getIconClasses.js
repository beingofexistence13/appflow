/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network", "vs/base/common/resources", "vs/editor/common/languages/modesRegistry", "vs/platform/files/common/files"], function (require, exports, network_1, resources_1, modesRegistry_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getIconClassesForLanguageId = exports.getIconClasses = void 0;
    const fileIconDirectoryRegex = /(?:\/|^)(?:([^\/]+)\/)?([^\/]+)$/;
    function getIconClasses(modelService, languageService, resource, fileKind) {
        // we always set these base classes even if we do not have a path
        const classes = fileKind === files_1.FileKind.ROOT_FOLDER ? ['rootfolder-icon'] : fileKind === files_1.FileKind.FOLDER ? ['folder-icon'] : ['file-icon'];
        if (resource) {
            // Get the path and name of the resource. For data-URIs, we need to parse specially
            let name;
            if (resource.scheme === network_1.Schemas.data) {
                const metadata = resources_1.DataUri.parseMetaData(resource);
                name = metadata.get(resources_1.DataUri.META_DATA_LABEL);
            }
            else {
                const match = resource.path.match(fileIconDirectoryRegex);
                if (match) {
                    name = cssEscape(match[2].toLowerCase());
                    if (match[1]) {
                        classes.push(`${cssEscape(match[1].toLowerCase())}-name-dir-icon`); // parent directory
                    }
                }
                else {
                    name = cssEscape(resource.authority.toLowerCase());
                }
            }
            // Folders
            if (fileKind === files_1.FileKind.FOLDER) {
                classes.push(`${name}-name-folder-icon`);
            }
            // Files
            else {
                // Name & Extension(s)
                if (name) {
                    classes.push(`${name}-name-file-icon`);
                    classes.push(`name-file-icon`); // extra segment to increase file-name score
                    // Avoid doing an explosive combination of extensions for very long filenames
                    // (most file systems do not allow files > 255 length) with lots of `.` characters
                    // https://github.com/microsoft/vscode/issues/116199
                    if (name.length <= 255) {
                        const dotSegments = name.split('.');
                        for (let i = 1; i < dotSegments.length; i++) {
                            classes.push(`${dotSegments.slice(i).join('.')}-ext-file-icon`); // add each combination of all found extensions if more than one
                        }
                    }
                    classes.push(`ext-file-icon`); // extra segment to increase file-ext score
                }
                // Detected Mode
                const detectedLanguageId = detectLanguageId(modelService, languageService, resource);
                if (detectedLanguageId) {
                    classes.push(`${cssEscape(detectedLanguageId)}-lang-file-icon`);
                }
            }
        }
        return classes;
    }
    exports.getIconClasses = getIconClasses;
    function getIconClassesForLanguageId(languageId) {
        return ['file-icon', `${cssEscape(languageId)}-lang-file-icon`];
    }
    exports.getIconClassesForLanguageId = getIconClassesForLanguageId;
    function detectLanguageId(modelService, languageService, resource) {
        if (!resource) {
            return null; // we need a resource at least
        }
        let languageId = null;
        // Data URI: check for encoded metadata
        if (resource.scheme === network_1.Schemas.data) {
            const metadata = resources_1.DataUri.parseMetaData(resource);
            const mime = metadata.get(resources_1.DataUri.META_DATA_MIME);
            if (mime) {
                languageId = languageService.getLanguageIdByMimeType(mime);
            }
        }
        // Any other URI: check for model if existing
        else {
            const model = modelService.getModel(resource);
            if (model) {
                languageId = model.getLanguageId();
            }
        }
        // only take if the language id is specific (aka no just plain text)
        if (languageId && languageId !== modesRegistry_1.PLAINTEXT_LANGUAGE_ID) {
            return languageId;
        }
        // otherwise fallback to path based detection
        return languageService.guessLanguageIdByFilepathOrFirstLine(resource);
    }
    function cssEscape(str) {
        return str.replace(/[\11\12\14\15\40]/g, '/'); // HTML class names can not contain certain whitespace characters, use / instead, which doesn't exist in file names.
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0SWNvbkNsYXNzZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL3NlcnZpY2VzL2dldEljb25DbGFzc2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVVoRyxNQUFNLHNCQUFzQixHQUFHLGtDQUFrQyxDQUFDO0lBRWxFLFNBQWdCLGNBQWMsQ0FBQyxZQUEyQixFQUFFLGVBQWlDLEVBQUUsUUFBeUIsRUFBRSxRQUFtQjtRQUU1SSxpRUFBaUU7UUFDakUsTUFBTSxPQUFPLEdBQUcsUUFBUSxLQUFLLGdCQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsS0FBSyxnQkFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN6SSxJQUFJLFFBQVEsRUFBRTtZQUViLG1GQUFtRjtZQUNuRixJQUFJLElBQXdCLENBQUM7WUFDN0IsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLGlCQUFPLENBQUMsSUFBSSxFQUFFO2dCQUNyQyxNQUFNLFFBQVEsR0FBRyxtQkFBTyxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDakQsSUFBSSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsbUJBQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQzthQUM3QztpQkFBTTtnQkFDTixNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO2dCQUMxRCxJQUFJLEtBQUssRUFBRTtvQkFDVixJQUFJLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO29CQUN6QyxJQUFJLEtBQUssQ0FB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