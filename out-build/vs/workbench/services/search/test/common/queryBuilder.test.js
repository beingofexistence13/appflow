define(["require", "exports", "assert", "vs/base/common/platform", "vs/base/common/uri", "vs/platform/workspace/test/common/testWorkspace", "vs/workbench/services/search/common/queryBuilder", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, assert, platform_1, uri_1, testWorkspace_1, queryBuilder_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('QueryBuilderCommon', () => {
        let context;
        setup(() => {
            const workspace = (0, testWorkspace_1.$_0b)(uri_1.URI.file(platform_1.$i ? 'C:\\testWorkspace' : '/testWorkspace'));
            context = new workbenchTestServices_1.$6dc(workspace);
        });
        test('resolveResourcesForSearchIncludes passes through paths without special glob characters', () => {
            const actual = (0, queryBuilder_1.$BJ)([uri_1.URI.file(platform_1.$i ? "C:\\testWorkspace\\pages\\blog" : "/testWorkspace/pages/blog")], context);
            assert.deepStrictEqual(actual, ["./pages/blog"]);
        });
        test('resolveResourcesForSearchIncludes escapes paths with special characters', () => {
            const actual = (0, queryBuilder_1.$BJ)([uri_1.URI.file(platform_1.$i ? "C:\\testWorkspace\\pages\\blog\\[postId]" : "/testWorkspace/pages/blog/[postId]")], context);
            assert.deepStrictEqual(actual, ["./pages/blog/[[]postId[]]"]);
        });
    });
});
//# sourceMappingURL=queryBuilder.test.js.map