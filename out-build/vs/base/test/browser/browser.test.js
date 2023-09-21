define(["require", "exports", "assert", "vs/base/common/platform"], function (require, exports, assert, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Browsers', () => {
        test('all', () => {
            assert(!(platform_1.$i && platform_1.$j));
        });
    });
});
//# sourceMappingURL=browser.test.js.map