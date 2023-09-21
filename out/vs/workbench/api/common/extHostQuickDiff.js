/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/workbench/api/common/extHost.protocol", "vs/base/common/async", "vs/workbench/api/common/extHostTypeConverters"], function (require, exports, uri_1, extHost_protocol_1, async_1, extHostTypeConverters_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostQuickDiff = void 0;
    class ExtHostQuickDiff {
        static { this.handlePool = 0; }
        constructor(mainContext, uriTransformer) {
            this.uriTransformer = uriTransformer;
            this.providers = new Map();
            this.proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadQuickDiff);
        }
        $provideOriginalResource(handle, uriComponents, token) {
            const uri = uri_1.URI.revive(uriComponents);
            const provider = this.providers.get(handle);
            if (!provider) {
                return Promise.resolve(null);
            }
            return (0, async_1.asPromise)(() => provider.provideOriginalResource(uri, token))
                .then(r => r || null);
        }
        registerQuickDiffProvider(selector, quickDiffProvider, label, rootUri) {
            const handle = ExtHostQuickDiff.handlePool++;
            this.providers.set(handle, quickDiffProvider);
            this.proxy.$registerQuickDiffProvider(handle, extHostTypeConverters_1.DocumentSelector.from(selector, this.uriTransformer), label, rootUri);
            return {
                dispose: () => {
                    this.proxy.$unregisterQuickDiffProvider(handle);
                    this.providers.delete(handle);
                }
            };
        }
    }
    exports.ExtHostQuickDiff = ExtHostQuickDiff;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFF1aWNrRGlmZi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3RRdWlja0RpZmYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBVWhHLE1BQWEsZ0JBQWdCO2lCQUNiLGVBQVUsR0FBVyxDQUFDLEFBQVosQ0FBYTtRQUt0QyxZQUNDLFdBQXlCLEVBQ1IsY0FBMkM7WUFBM0MsbUJBQWMsR0FBZCxjQUFjLENBQTZCO1lBSnJELGNBQVMsR0FBMEMsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQU1wRSxJQUFJLENBQUMsS0FBSyxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsOEJBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQ3BFLENBQUM7UUFFRCx3QkFBd0IsQ0FBQyxNQUFjLEVBQUUsYUFBNEIsRUFBRSxLQUF3QjtZQUM5RixNQUFNLEdBQUcsR0FBRyxTQUFHLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRTVDLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2QsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQzdCO1lBRUQsT0FBTyxJQUFBLGlCQUFTLEVBQUMsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLHVCQUF3QixDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztpQkFDbkUsSUFBSSxDQUF1QixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQztRQUM5QyxDQUFDO1FBRUQseUJBQXlCLENBQUMsUUFBaUMsRUFBRSxpQkFBMkMsRUFBRSxLQUFhLEVBQUUsT0FBb0I7WUFDNUksTUFBTSxNQUFNLEdBQUcsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDN0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLGlCQUFpQixDQUFDLENBQUM7WUFDOUMsSUFBSSxDQUFDLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxNQUFNLEVBQUUsd0NBQWdCLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3BILE9BQU87Z0JBQ04sT0FBTyxFQUFFLEdBQUcsRUFBRTtvQkFDYixJQUFJLENBQUMsS0FBSyxDQUFDLDRCQUE0QixDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUNoRCxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDL0IsQ0FBQzthQUNELENBQUM7UUFDSCxDQUFDOztJQW5DRiw0Q0FvQ0MifQ==