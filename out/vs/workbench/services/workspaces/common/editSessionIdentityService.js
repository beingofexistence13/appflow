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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/lifecycle", "vs/platform/instantiation/common/extensions", "vs/platform/log/common/log", "vs/platform/workspace/common/editSessions", "vs/workbench/services/extensions/common/extensions"], function (require, exports, arrays_1, lifecycle_1, extensions_1, log_1, editSessions_1, extensions_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditSessionIdentityService = void 0;
    let EditSessionIdentityService = class EditSessionIdentityService {
        constructor(_extensionService, _logService) {
            this._extensionService = _extensionService;
            this._logService = _logService;
            this._editSessionIdentifierProviders = new Map();
            this._participants = [];
        }
        registerEditSessionIdentityProvider(provider) {
            if (this._editSessionIdentifierProviders.get(provider.scheme)) {
                throw new Error(`A provider has already been registered for scheme ${provider.scheme}`);
            }
            this._editSessionIdentifierProviders.set(provider.scheme, provider);
            return (0, lifecycle_1.toDisposable)(() => {
                this._editSessionIdentifierProviders.delete(provider.scheme);
            });
        }
        async getEditSessionIdentifier(workspaceFolder, token) {
            const { scheme } = workspaceFolder.uri;
            const provider = await this.activateProvider(scheme);
            this._logService.trace(`EditSessionIdentityProvider for scheme ${scheme} available: ${!!provider}`);
            return provider?.getEditSessionIdentifier(workspaceFolder, token);
        }
        async provideEditSessionIdentityMatch(workspaceFolder, identity1, identity2, cancellationToken) {
            const { scheme } = workspaceFolder.uri;
            const provider = await this.activateProvider(scheme);
            this._logService.trace(`EditSessionIdentityProvider for scheme ${scheme} available: ${!!provider}`);
            return provider?.provideEditSessionIdentityMatch?.(workspaceFolder, identity1, identity2, cancellationToken);
        }
        async onWillCreateEditSessionIdentity(workspaceFolder, cancellationToken) {
            this._logService.debug('Running onWillCreateEditSessionIdentity participants...');
            // TODO@joyceerhl show progress notification?
            for (const participant of this._participants) {
                await participant.participate(workspaceFolder, cancellationToken);
            }
            this._logService.debug(`Done running ${this._participants.length} onWillCreateEditSessionIdentity participants.`);
        }
        addEditSessionIdentityCreateParticipant(participant) {
            const dispose = (0, arrays_1.insert)(this._participants, participant);
            return (0, lifecycle_1.toDisposable)(() => dispose());
        }
        async activateProvider(scheme) {
            const transformedScheme = scheme === 'vscode-remote' ? 'file' : scheme;
            const provider = this._editSessionIdentifierProviders.get(scheme);
            if (provider) {
                return provider;
            }
            await this._extensionService.activateByEvent(`onEditSession:${transformedScheme}`);
            return this._editSessionIdentifierProviders.get(scheme);
        }
    };
    exports.EditSessionIdentityService = EditSessionIdentityService;
    exports.EditSessionIdentityService = EditSessionIdentityService = __decorate([
        __param(0, extensions_2.IExtensionService),
        __param(1, log_1.ILogService)
    ], EditSessionIdentityService);
    (0, extensions_1.registerSingleton)(editSessions_1.IEditSessionIdentityService, EditSessionIdentityService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdFNlc3Npb25JZGVudGl0eVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvd29ya3NwYWNlcy9jb21tb24vZWRpdFNlc3Npb25JZGVudGl0eVNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBV3pGLElBQU0sMEJBQTBCLEdBQWhDLE1BQU0sMEJBQTBCO1FBS3RDLFlBQ29CLGlCQUFxRCxFQUMzRCxXQUF5QztZQURsQixzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO1lBQzFDLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1lBSi9DLG9DQUErQixHQUFHLElBQUksR0FBRyxFQUF3QyxDQUFDO1lBK0NsRixrQkFBYSxHQUE0QyxFQUFFLENBQUM7UUExQ2hFLENBQUM7UUFFTCxtQ0FBbUMsQ0FBQyxRQUFzQztZQUN6RSxJQUFJLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUM5RCxNQUFNLElBQUksS0FBSyxDQUFDLHFEQUFxRCxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQzthQUN4RjtZQUVELElBQUksQ0FBQywrQkFBK0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNwRSxPQUFPLElBQUEsd0JBQVksRUFBQyxHQUFHLEVBQUU7Z0JBQ3hCLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzlELENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxlQUFpQyxFQUFFLEtBQXdCO1lBQ3pGLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxlQUFlLENBQUMsR0FBRyxDQUFDO1lB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