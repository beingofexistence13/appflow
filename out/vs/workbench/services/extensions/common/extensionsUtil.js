/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/extensions/common/extensions", "vs/nls", "vs/base/common/semver/semver"], function (require, exports, extensions_1, nls_1, semver) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.dedupExtensions = void 0;
    // TODO: @sandy081 merge this with deduping in extensionsScannerService.ts
    function dedupExtensions(system, user, development, logService) {
        const result = new extensions_1.ExtensionIdentifierMap();
        system.forEach((systemExtension) => {
            const extension = result.get(systemExtension.identifier);
            if (extension) {
                logService.warn((0, nls_1.localize)('overwritingExtension', "Overwriting extension {0} with {1}.", extension.extensionLocation.fsPath, systemExtension.extensionLocation.fsPath));
            }
            result.set(systemExtension.identifier, systemExtension);
        });
        user.forEach((userExtension) => {
            const extension = result.get(userExtension.identifier);
            if (extension) {
                if (extension.isBuiltin) {
                    if (semver.gte(extension.version, userExtension.version)) {
                        logService.warn(`Skipping extension ${userExtension.extensionLocation.path} in favour of the builtin extension ${extension.extensionLocation.path}.`);
                        return;
                    }
                    // Overwriting a builtin extension inherits the `isBuiltin` property and it doesn't show a warning
                    userExtension.isBuiltin = true;
                }
                else {
                    logService.warn((0, nls_1.localize)('overwritingExtension', "Overwriting extension {0} with {1}.", extension.extensionLocation.fsPath, userExtension.extensionLocation.fsPath));
                }
            }
            else if (userExtension.isBuiltin) {
                logService.warn(`Skipping obsolete builtin extension ${userExtension.extensionLocation.path}`);
                return;
            }
            result.set(userExtension.identifier, userExtension);
        });
        development.forEach(developedExtension => {
            logService.info((0, nls_1.localize)('extensionUnderDevelopment', "Loading development extension at {0}", developedExtension.extensionLocation.fsPath));
            const extension = result.get(developedExtension.identifier);
            if (extension) {
                if (extension.isBuiltin) {
                    // Overwriting a builtin extension inherits the `isBuiltin` property
                    developedExtension.isBuiltin = true;
                }
            }
            result.set(developedExtension.identifier, developedExtension);
        });
        return Array.from(result.values());
    }
    exports.dedupExtensions = dedupExtensions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc1V0aWwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvZXh0ZW5zaW9ucy9jb21tb24vZXh0ZW5zaW9uc1V0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBT2hHLDBFQUEwRTtJQUMxRSxTQUFnQixlQUFlLENBQUMsTUFBK0IsRUFBRSxJQUE2QixFQUFFLFdBQW9DLEVBQUUsVUFBdUI7UUFDNUosTUFBTSxNQUFNLEdBQUcsSUFBSSxtQ0FBc0IsRUFBeUIsQ0FBQztRQUNuRSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsZUFBZSxFQUFFLEVBQUU7WUFDbEMsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDekQsSUFBSSxTQUFTLEVBQUU7Z0JBQ2QsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFBLGNBQVEsRUFBQyxzQkFBc0IsRUFBRSxxQ0FBcUMsRUFBRSxTQUFTLENBQUMsaUJBQWlCLENBQUMsTUFBTSxFQUFFLGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2FBQ3ZLO1lBQ0QsTUFBTSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsVUFBVSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQ3pELENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLGFBQWEsRUFBRSxFQUFFO1lBQzlCLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3ZELElBQUksU0FBUyxFQUFFO2dCQUNkLElBQUksU0FBUyxDQUFDLFNBQVMsRUFBRTtvQkFDeEIsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFO3dCQUN6RCxVQUFVLENBQUMsSUFBSSxDQUFDLHNCQUFzQixhQUFhLENBQUMsaUJBQWlCLENBQUMsSUFBSSx1Q0FBdUMsU0FBUyxDQUFDLGlCQUFpQixDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7d0JBQ3RKLE9BQU87cUJBQ1A7b0JBQ0Qsa0dBQWtHO29CQUNuRSxhQUFjLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztpQkFDL0Q7cUJBQU07b0JBQ04sVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFBLGNBQVEsRUFBQyxzQkFBc0IsRUFBRSxxQ0FBcUMsRUFBRSxTQUFTLENBQUMsaUJBQWlCLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2lCQUNySzthQUNEO2lCQUFNLElBQUksYUFBYSxDQUFDLFNBQVMsRUFBRTtnQkFDbkMsVUFBVSxDQUFDLElBQUksQ0FBQyx1Q0FBdUMsYUFBYSxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQy9GLE9BQU87YUFDUDtZQUNELE1BQU0sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUNyRCxDQUFDLENBQUMsQ0FBQztRQUNILFdBQVcsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsRUFBRTtZQUN4QyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUEsY0FBUSxFQUFDLDJCQUEyQixFQUFFLHNDQUFzQyxFQUFFLGtCQUFrQixDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDNUksTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUM1RCxJQUFJLFNBQVMsRUFBRTtnQkFDZCxJQUFJLFNBQVMsQ0FBQyxTQUFTLEVBQUU7b0JBQ3hCLG9FQUFvRTtvQkFDckMsa0JBQW1CLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztpQkFDcEU7YUFDRDtZQUNELE1BQU0sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsVUFBVSxFQUFFLGtCQUFrQixDQUFDLENBQUM7UUFDL0QsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQXhDRCwwQ0F3Q0MifQ==