/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/workspace/common/editSessions", "vs/platform/workspace/common/workspace"], function (require, exports, buffer_1, resources_1, uri_1, extensions_1, instantiation_1, editSessions_1, workspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkspaceIdentityService = exports.IWorkspaceIdentityService = void 0;
    exports.IWorkspaceIdentityService = (0, instantiation_1.createDecorator)('IWorkspaceIdentityService');
    let WorkspaceIdentityService = class WorkspaceIdentityService {
        constructor(workspaceContextService, editSessionIdentityService) {
            this.workspaceContextService = workspaceContextService;
            this.editSessionIdentityService = editSessionIdentityService;
        }
        async getWorkspaceStateFolders(cancellationToken) {
            const workspaceStateFolders = [];
            for (const workspaceFolder of this.workspaceContextService.getWorkspace().folders) {
                const workspaceFolderIdentity = await this.editSessionIdentityService.getEditSessionIdentifier(workspaceFolder, cancellationToken);
                if (!workspaceFolderIdentity) {
                    continue;
                }
                workspaceStateFolders.push({ resourceUri: workspaceFolder.uri.toString(), workspaceFolderIdentity });
            }
            return workspaceStateFolders;
        }
        async matches(incomingWorkspaceFolders, cancellationToken) {
            const incomingToCurrentWorkspaceFolderUris = {};
            const incomingIdentitiesToIncomingWorkspaceFolders = {};
            for (const workspaceFolder of incomingWorkspaceFolders) {
                incomingIdentitiesToIncomingWorkspaceFolders[workspaceFolder.workspaceFolderIdentity] = workspaceFolder.resourceUri;
            }
            // Precompute the identities of the current workspace folders
            const currentWorkspaceFoldersToIdentities = new Map();
            for (const workspaceFolder of this.workspaceContextService.getWorkspace().folders) {
                const workspaceFolderIdentity = await this.editSessionIdentityService.getEditSessionIdentifier(workspaceFolder, cancellationToken);
                if (!workspaceFolderIdentity) {
                    continue;
                }
                currentWorkspaceFoldersToIdentities.set(workspaceFolder, workspaceFolderIdentity);
            }
            // Match the current workspace folders to the incoming workspace folders
            for (const [currentWorkspaceFolder, currentWorkspaceFolderIdentity] of currentWorkspaceFoldersToIdentities.entries()) {
                // Happy case: identities do not need further disambiguation
                const incomingWorkspaceFolder = incomingIdentitiesToIncomingWorkspaceFolders[currentWorkspaceFolderIdentity];
                if (incomingWorkspaceFolder) {
                    // There is an incoming workspace folder with the exact same identity as the current workspace folder
                    incomingToCurrentWorkspaceFolderUris[incomingWorkspaceFolder] = currentWorkspaceFolder.uri.toString();
                    continue;
                }
                // Unhappy case: compare the identity of the current workspace folder to all incoming workspace folder identities
                let hasCompleteMatch = false;
                for (const [incomingIdentity, incomingFolder] of Object.entries(incomingIdentitiesToIncomingWorkspaceFolders)) {
                    if (await this.editSessionIdentityService.provideEditSessionIdentityMatch(currentWorkspaceFolder, currentWorkspaceFolderIdentity, incomingIdentity, cancellationToken) === editSessions_1.EditSessionIdentityMatch.Complete) {
                        incomingToCurrentWorkspaceFolderUris[incomingFolder] = currentWorkspaceFolder.uri.toString();
                        hasCompleteMatch = true;
                        break;
                    }
                }
                if (hasCompleteMatch) {
                    continue;
                }
                return false;
            }
            const convertUri = (uriToConvert) => {
                // Figure out which current folder the incoming URI is a child of
                for (const incomingFolderUriKey of Object.keys(incomingToCurrentWorkspaceFolderUris)) {
                    const incomingFolderUri = uri_1.URI.parse(incomingFolderUriKey);
                    if ((0, resources_1.isEqualOrParent)(incomingFolderUri, uriToConvert)) {
                        const currentWorkspaceFolderUri = incomingToCurrentWorkspaceFolderUris[incomingFolderUriKey];
                        // Compute the relative file path section of the uri to convert relative to the folder it came from
                        const relativeFilePath = (0, resources_1.relativePath)(incomingFolderUri, uriToConvert);
                        // Reparent the relative file path under the current workspace folder it belongs to
                        if (relativeFilePath) {
                            return (0, resources_1.joinPath)(uri_1.URI.parse(currentWorkspaceFolderUri), relativeFilePath);
                        }
                    }
                }
                // No conversion was possible; return the original URI
                return uriToConvert;
            };
            // Recursively look for any URIs in the provided object and
            // replace them with the URIs of the current workspace folders
            const uriReplacer = (obj, depth = 0) => {
                if (!obj || depth > 200) {
                    return obj;
                }
                if (obj instanceof buffer_1.VSBuffer || obj instanceof Uint8Array) {
                    return obj;
                }
                if (uri_1.URI.isUri(obj)) {
                    return convertUri(obj);
                }
                if (Array.isArray(obj)) {
                    for (let i = 0; i < obj.length; ++i) {
                        obj[i] = uriReplacer(obj[i], depth + 1);
                    }
                }
                else {
                    // walk object
                    for (const key in obj) {
                        if (Object.hasOwnProperty.call(obj, key)) {
                            obj[key] = uriReplacer(obj[key], depth + 1);
                        }
                    }
                }
                return obj;
            };
            return uriReplacer;
        }
    };
    exports.WorkspaceIdentityService = WorkspaceIdentityService;
    exports.WorkspaceIdentityService = WorkspaceIdentityService = __decorate([
        __param(0, workspace_1.IWorkspaceContextService),
        __param(1, editSessions_1.IEditSessionIdentityService)
    ], WorkspaceIdentityService);
    (0, extensions_1.registerSingleton)(exports.IWorkspaceIdentityService, WorkspaceIdentityService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlSWRlbnRpdHlTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3dvcmtzcGFjZXMvY29tbW9uL3dvcmtzcGFjZUlkZW50aXR5U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFZbkYsUUFBQSx5QkFBeUIsR0FBRyxJQUFBLCtCQUFlLEVBQTRCLDJCQUEyQixDQUFDLENBQUM7SUFPMUcsSUFBTSx3QkFBd0IsR0FBOUIsTUFBTSx3QkFBd0I7UUFHcEMsWUFDNEMsdUJBQWlELEVBQzlDLDBCQUF1RDtZQUQxRCw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQTBCO1lBQzlDLCtCQUEwQixHQUExQiwwQkFBMEIsQ0FBNkI7UUFDbEcsQ0FBQztRQUVMLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxpQkFBb0M7WUFDbEUsTUFBTSxxQkFBcUIsR0FBNEIsRUFBRSxDQUFDO1lBRTFELEtBQUssTUFBTSxlQUFlLElBQUksSUFBSSxDQUFDLHVCQUF1QixDQUFDLFlBQVksRUFBRSxDQUFDLE9BQU8sRUFBRTtnQkFDbEYsTUFBTSx1QkFBdUIsR0FBRyxNQUFNLElBQUksQ0FBQywwQkFBMEIsQ0FBQyx3QkFBd0IsQ0FBQyxlQUFlLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztnQkFDbkksSUFBSSxDQUFDLHVCQUF1QixFQUFFO29CQUFFLFNBQVM7aUJBQUU7Z0JBQzNDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxFQUFFLFdBQVcsRUFBRSxlQUFlLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLHVCQUF1QixFQUFFLENBQUMsQ0FBQzthQUNyRztZQUVELE9BQU8scUJBQXFCLENBQUM7UUFDOUIsQ0FBQztRQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsd0JBQWlELEVBQUUsaUJBQW9DO1lBQ3BHLE1BQU0sb0NBQW9DLEdBQThCLEVBQUUsQ0FBQztZQUUzRSxNQUFNLDRDQUE0QyxHQUE4QixFQUFFLENBQUM7WUFDbkYsS0FBSyxNQUFNLGVBQWUsSUFBSSx3QkFBd0IsRUFBRTtnQkFDdkQsNENBQTRDLENBQUMsZUFBZSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsZUFBZSxDQUFDLFdBQVcsQ0FBQzthQUNwSDtZQUVELDZEQUE2RDtZQUM3RCxNQUFNLG1DQUFtQyxHQUFHLElBQUksR0FBRyxFQUE0QixDQUFDO1lBQ2hGLEtBQUssTUFBTSxlQUFlLElBQUksSUFBSSxDQUFDLHVCQUF1QixDQUFDLFlBQVksRUFBRSxDQUFDLE9BQU8sRUFBRTtnQkFDbEYsTUFBTSx1QkFBdUIsR0FBRyxNQUFNLElBQUksQ0FBQywwQkFBMEIsQ0FBQyx3QkFBd0IsQ0FBQyxlQUFlLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztnQkFDbkksSUFBSSxDQUFDLHVCQUF1QixFQUFFO29CQUFFLFNBQVM7aUJBQUU7Z0JBQzNDLG1DQUFtQyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsdUJBQXVCLENBQUMsQ0FBQzthQUNsRjtZQUVELHdFQUF3RTtZQUN4RSxLQUFLLE1BQU0sQ0FBQyxzQkFBc0IsRUFBRSw4QkFBOEIsQ0FBQyxJQUFJLG1DQUFtQyxDQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUVySCw0REFBNEQ7Z0JBQzVELE1BQU0sdUJBQXVCLEdBQUcsNENBQTRDLENBQUMsOEJBQThCLENBQUMsQ0FBQztnQkFDN0csSUFBSSx1QkFBdUIsRUFBRTtvQkFDNUIscUdBQXFHO29CQUNyRyxvQ0FBb0MsQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztvQkFDdEcsU0FBUztpQkFDVDtnQkFFRCxpSEFBaUg7Z0JBQ2pILElBQUksZ0JBQWdCLEdBQUcsS0FBSyxDQUFDO2dCQUM3QixLQUFLLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxjQUFjLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLDRDQUE0QyxDQUFDLEVBQUU7b0JBQzlHLElBQUksTUFBTSxJQUFJLENBQUMsMEJBQTBCLENBQUMsK0JBQStCLENBQUMsc0JBQXNCLEVBQUUsOEJBQThCLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCLENBQUMsS0FBSyx1Q0FBd0IsQ0FBQyxRQUFRLEVBQUU7d0JBQzdNLG9DQUFvQyxDQUFDLGNBQWMsQ0FBQyxHQUFHLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQzt3QkFDN0YsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO3dCQUN4QixNQUFNO3FCQUNOO2lCQUNEO2dCQUVELElBQUksZ0JBQWdCLEVBQUU7b0JBQ3JCLFNBQVM7aUJBQ1Q7Z0JBRUQsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELE1BQU0sVUFBVSxHQUFHLENBQUMsWUFBaUIsRUFBRSxFQUFFO2dCQUN4QyxpRUFBaUU7Z0JBQ2pFLEtBQUssTUFBTSxvQkFBb0IsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLG9DQUFvQyxDQUFDLEVBQUU7b0JBQ3JGLE1BQU0saUJBQWlCLEdBQUcsU0FBRyxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO29CQUMxRCxJQUFJLElBQUEsMkJBQWUsRUFBQyxpQkFBaUIsRUFBRSxZQUFZLENBQUMsRUFBRTt3QkFDckQsTUFBTSx5QkFBeUIsR0FBRyxvQ0FBb0MsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO3dCQUU3RixtR0FBbUc7d0JBQ25HLE1BQU0sZ0JBQWdCLEdBQUcsSUFBQSx3QkFBWSxFQUFDLGlCQUFpQixFQUFFLFlBQVksQ0FBQyxDQUFDO3dCQUV2RSxtRkFBbUY7d0JBQ25GLElBQUksZ0JBQWdCLEVBQUU7NEJBQ3JCLE9BQU8sSUFBQSxvQkFBUSxFQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMseUJBQXlCLENBQUMsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO3lCQUN4RTtxQkFDRDtpQkFDRDtnQkFFRCxzREFBc0Q7Z0JBQ3RELE9BQU8sWUFBWSxDQUFDO1lBQ3JCLENBQUMsQ0FBQztZQUVGLDJEQUEyRDtZQUMzRCw4REFBOEQ7WUFDOUQsTUFBTSxXQUFXLEdBQUcsQ0FBQyxHQUFRLEVBQUUsS0FBSyxHQUFHLENBQUMsRUFBRSxFQUFFO2dCQUMzQyxJQUFJLENBQUMsR0FBRyxJQUFJLEtBQUssR0FBRyxHQUFHLEVBQUU7b0JBQ3hCLE9BQU8sR0FBRyxDQUFDO2lCQUNYO2dCQUVELElBQUksR0FBRyxZQUFZLGlCQUFRLElBQUksR0FBRyxZQUFZLFVBQVUsRUFBRTtvQkFDekQsT0FBWSxHQUFHLENBQUM7aUJBQ2hCO2dCQUVELElBQUksU0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDbkIsT0FBTyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ3ZCO2dCQUVELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDdkIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUU7d0JBQ3BDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztxQkFDeEM7aUJBQ0Q7cUJBQU07b0JBQ04sY0FBYztvQkFDZCxLQUFLLE1BQU0sR0FBRyxJQUFJLEdBQUcsRUFBRTt3QkFDdEIsSUFBSSxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUU7NEJBQ3pDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQzt5QkFDNUM7cUJBQ0Q7aUJBQ0Q7Z0JBRUQsT0FBTyxHQUFHLENBQUM7WUFDWixDQUFDLENBQUM7WUFFRixPQUFPLFdBQVcsQ0FBQztRQUNwQixDQUFDO0tBQ0QsQ0FBQTtJQXRIWSw0REFBd0I7dUNBQXhCLHdCQUF3QjtRQUlsQyxXQUFBLG9DQUF3QixDQUFBO1FBQ3hCLFdBQUEsMENBQTJCLENBQUE7T0FMakIsd0JBQXdCLENBc0hwQztJQUVELElBQUEsOEJBQWlCLEVBQUMsaUNBQXlCLEVBQUUsd0JBQXdCLG9DQUE0QixDQUFDIn0=