/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/uri", "./extHost.protocol"], function (require, exports, lifecycle_1, network_1, uri_1, extHost_protocol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostUriOpeners = void 0;
    class ExtHostUriOpeners {
        static { this.supportedSchemes = new Set([network_1.Schemas.http, network_1.Schemas.https]); }
        constructor(mainContext) {
            this._openers = new Map();
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadUriOpeners);
        }
        registerExternalUriOpener(extensionId, id, opener, metadata) {
            if (this._openers.has(id)) {
                throw new Error(`Opener with id '${id}' already registered`);
            }
            const invalidScheme = metadata.schemes.find(scheme => !ExtHostUriOpeners.supportedSchemes.has(scheme));
            if (invalidScheme) {
                throw new Error(`Scheme '${invalidScheme}' is not supported. Only http and https are currently supported.`);
            }
            this._openers.set(id, opener);
            this._proxy.$registerUriOpener(id, metadata.schemes, extensionId, metadata.label);
            return (0, lifecycle_1.toDisposable)(() => {
                this._openers.delete(id);
                this._proxy.$unregisterUriOpener(id);
            });
        }
        async $canOpenUri(id, uriComponents, token) {
            const opener = this._openers.get(id);
            if (!opener) {
                throw new Error(`Unknown opener with id: ${id}`);
            }
            const uri = uri_1.URI.revive(uriComponents);
            return opener.canOpenExternalUri(uri, token);
        }
        async $openUri(id, context, token) {
            const opener = this._openers.get(id);
            if (!opener) {
                throw new Error(`Unknown opener id: '${id}'`);
            }
            return opener.openExternalUri(uri_1.URI.revive(context.resolvedUri), {
                sourceUri: uri_1.URI.revive(context.sourceUri)
            }, token);
        }
    }
    exports.ExtHostUriOpeners = ExtHostUriOpeners;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFVyaU9wZW5lci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3RVcmlPcGVuZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBWWhHLE1BQWEsaUJBQWlCO2lCQUVMLHFCQUFnQixHQUFHLElBQUksR0FBRyxDQUFTLENBQUMsaUJBQU8sQ0FBQyxJQUFJLEVBQUUsaUJBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxBQUFqRCxDQUFrRDtRQU0xRixZQUNDLFdBQXlCO1lBSFQsYUFBUSxHQUFHLElBQUksR0FBRyxFQUFvQyxDQUFDO1lBS3ZFLElBQUksQ0FBQyxNQUFNLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyw4QkFBVyxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDdEUsQ0FBQztRQUVELHlCQUF5QixDQUN4QixXQUFnQyxFQUNoQyxFQUFVLEVBQ1YsTUFBZ0MsRUFDaEMsUUFBMEM7WUFFMUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRTtnQkFDMUIsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO2FBQzdEO1lBRUQsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3ZHLElBQUksYUFBYSxFQUFFO2dCQUNsQixNQUFNLElBQUksS0FBSyxDQUFDLFdBQVcsYUFBYSxrRUFBa0UsQ0FBQyxDQUFDO2FBQzVHO1lBRUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzlCLElBQUksQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxPQUFPLEVBQUUsV0FBVyxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUVsRixPQUFPLElBQUEsd0JBQVksRUFBQyxHQUFHLEVBQUU7Z0JBQ3hCLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUN6QixJQUFJLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3RDLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELEtBQUssQ0FBQyxXQUFXLENBQUMsRUFBVSxFQUFFLGFBQTRCLEVBQUUsS0FBd0I7WUFDbkYsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDckMsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDWixNQUFNLElBQUksS0FBSyxDQUFDLDJCQUEyQixFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQ2pEO1lBRUQsTUFBTSxHQUFHLEdBQUcsU0FBRyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUN0QyxPQUFPLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDOUMsQ0FBQztRQUVELEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBVSxFQUFFLE9BQWlFLEVBQUUsS0FBd0I7WUFDckgsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDckMsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDWixNQUFNLElBQUksS0FBSyxDQUFDLHVCQUF1QixFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQzlDO1lBRUQsT0FBTyxNQUFNLENBQUMsZUFBZSxDQUFDLFNBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFFO2dCQUM5RCxTQUFTLEVBQUUsU0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO2FBQ3hDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDWCxDQUFDOztJQXpERiw4Q0EwREMifQ==