/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/platform/product/common/product", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/remote/electron-sandbox/remoteAuthorityResolverService"], function (require, exports, assert, utils_1, product_1, remoteAuthorityResolver_1, remoteAuthorityResolverService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('RemoteAuthorityResolverService', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('issue #147318: RemoteAuthorityResolverError keeps the same type', async () => {
            const productService = { _serviceBrand: undefined, ...product_1.default };
            const service = new remoteAuthorityResolverService_1.RemoteAuthorityResolverService(productService, undefined);
            const result = service.resolveAuthority('test+x');
            service._setResolvedAuthorityError('test+x', new remoteAuthorityResolver_1.RemoteAuthorityResolverError('something', remoteAuthorityResolver_1.RemoteAuthorityResolverErrorCode.TemporarilyNotAvailable));
            try {
                await result;
                assert.fail();
            }
            catch (err) {
                assert.strictEqual(remoteAuthorityResolver_1.RemoteAuthorityResolverError.isTemporarilyNotAvailable(err), true);
            }
            service.dispose();
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlQXV0aG9yaXR5UmVzb2x2ZXJTZXJ2aWNlLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9yZW1vdGUvdGVzdC9lbGVjdHJvbi1zYW5kYm94L3JlbW90ZUF1dGhvcml0eVJlc29sdmVyU2VydmljZS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBU2hHLEtBQUssQ0FBQyxnQ0FBZ0MsRUFBRSxHQUFHLEVBQUU7UUFFNUMsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRTFDLElBQUksQ0FBQyxpRUFBaUUsRUFBRSxLQUFLLElBQUksRUFBRTtZQUNsRixNQUFNLGNBQWMsR0FBb0IsRUFBRSxhQUFhLEVBQUUsU0FBUyxFQUFFLEdBQUcsaUJBQU8sRUFBRSxDQUFDO1lBQ2pGLE1BQU0sT0FBTyxHQUFHLElBQUksK0RBQThCLENBQUMsY0FBYyxFQUFFLFNBQWdCLENBQUMsQ0FBQztZQUNyRixNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDbEQsT0FBTyxDQUFDLDBCQUEwQixDQUFDLFFBQVEsRUFBRSxJQUFJLHNEQUE0QixDQUFDLFdBQVcsRUFBRSwwREFBZ0MsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7WUFDdEosSUFBSTtnQkFDSCxNQUFNLE1BQU0sQ0FBQztnQkFDYixNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7YUFDZDtZQUFDLE9BQU8sR0FBRyxFQUFFO2dCQUNiLE1BQU0sQ0FBQyxXQUFXLENBQUMsc0RBQTRCLENBQUMseUJBQXlCLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDdEY7WUFDRCxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDbkIsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQyJ9