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
    exports.$e1b = exports.$d1b = void 0;
    exports.$d1b = (0, instantiation_1.$Bh)('IWorkspaceIdentityService');
    let $e1b = class $e1b {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        async getWorkspaceStateFolders(cancellationToken) {
            const workspaceStateFolders = [];
            for (const workspaceFolder of this.a.getWorkspace().folders) {
                const workspaceFolderIdentity = await this.b.getEditSessionIdentifier(workspaceFolder, cancellationToken);
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
            for (const workspaceFolder of this.a.getWorkspace().folders) {
                const workspaceFolderIdentity = await this.b.getEditSessionIdentifier(workspaceFolder, cancellationToken);
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
                    if (await this.b.provideEditSessionIdentityMatch(currentWorkspaceFolder, currentWorkspaceFolderIdentity, incomingIdentity, cancellationToken) === editSessions_1.EditSessionIdentityMatch.Complete) {
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
                    if ((0, resources_1.$cg)(incomingFolderUri, uriToConvert)) {
                        const currentWorkspaceFolderUri = incomingToCurrentWorkspaceFolderUris[incomingFolderUriKey];
                        // Compute the relative file path section of the uri to convert relative to the folder it came from
                        const relativeFilePath = (0, resources_1.$kg)(incomingFolderUri, uriToConvert);
                        // Reparent the relative file path under the current workspace folder it belongs to
                        if (relativeFilePath) {
                            return (0, resources_1.$ig)(uri_1.URI.parse(currentWorkspaceFolderUri), relativeFilePath);
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
                if (obj instanceof buffer_1.$Fd || obj instanceof Uint8Array) {
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
    exports.$e1b = $e1b;
    exports.$e1b = $e1b = __decorate([
        __param(0, workspace_1.$Kh),
        __param(1, editSessions_1.$8z)
    ], $e1b);
    (0, extensions_1.$mr)(exports.$d1b, $e1b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=workspaceIdentityService.js.map