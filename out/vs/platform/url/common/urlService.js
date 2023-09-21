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
define(["require", "exports", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/platform/product/common/productService"], function (require, exports, async_1, lifecycle_1, uri_1, productService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeURLService = exports.AbstractURLService = void 0;
    class AbstractURLService extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this.handlers = new Set();
        }
        open(uri, options) {
            const handlers = [...this.handlers.values()];
            return (0, async_1.first)(handlers.map(h => () => h.handleURL(uri, options)), undefined, false).then(val => val || false);
        }
        registerHandler(handler) {
            this.handlers.add(handler);
            return (0, lifecycle_1.toDisposable)(() => this.handlers.delete(handler));
        }
    }
    exports.AbstractURLService = AbstractURLService;
    let NativeURLService = class NativeURLService extends AbstractURLService {
        constructor(productService) {
            super();
            this.productService = productService;
        }
        create(options) {
            let { authority, path, query, fragment } = options ? options : { authority: undefined, path: undefined, query: undefined, fragment: undefined };
            if (authority && path && path.indexOf('/') !== 0) {
                path = `/${path}`; // URI validation requires a path if there is an authority
            }
            return uri_1.URI.from({ scheme: this.productService.urlProtocol, authority, path, query, fragment });
        }
    };
    exports.NativeURLService = NativeURLService;
    exports.NativeURLService = NativeURLService = __decorate([
        __param(0, productService_1.IProductService)
    ], NativeURLService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJsU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3VybC9jb21tb24vdXJsU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFRaEcsTUFBc0Isa0JBQW1CLFNBQVEsc0JBQVU7UUFBM0Q7O1lBSVMsYUFBUSxHQUFHLElBQUksR0FBRyxFQUFlLENBQUM7UUFhM0MsQ0FBQztRQVRBLElBQUksQ0FBQyxHQUFRLEVBQUUsT0FBeUI7WUFDdkMsTUFBTSxRQUFRLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUM3QyxPQUFPLElBQUEsYUFBSyxFQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLENBQUM7UUFDOUcsQ0FBQztRQUVELGVBQWUsQ0FBQyxPQUFvQjtZQUNuQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMzQixPQUFPLElBQUEsd0JBQVksRUFBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQzFELENBQUM7S0FDRDtJQWpCRCxnREFpQkM7SUFFTSxJQUFNLGdCQUFnQixHQUF0QixNQUFNLGdCQUFpQixTQUFRLGtCQUFrQjtRQUV2RCxZQUNxQyxjQUErQjtZQUVuRSxLQUFLLEVBQUUsQ0FBQztZQUY0QixtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7UUFHcEUsQ0FBQztRQUVELE1BQU0sQ0FBQyxPQUFnQztZQUN0QyxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxDQUFDO1lBRWhKLElBQUksU0FBUyxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDakQsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQywwREFBMEQ7YUFDN0U7WUFFRCxPQUFPLFNBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUNoRyxDQUFDO0tBQ0QsQ0FBQTtJQWpCWSw0Q0FBZ0I7K0JBQWhCLGdCQUFnQjtRQUcxQixXQUFBLGdDQUFlLENBQUE7T0FITCxnQkFBZ0IsQ0FpQjVCIn0=