define(["require", "exports", "assert", "vs/base/common/platform", "vs/base/common/uri", "vs/platform/workspace/test/common/testWorkspace", "vs/workbench/services/search/common/queryBuilder", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, assert, platform_1, uri_1, testWorkspace_1, queryBuilder_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('QueryBuilderCommon', () => {
        let context;
        setup(() => {
            const workspace = (0, testWorkspace_1.testWorkspace)(uri_1.URI.file(platform_1.isWindows ? 'C:\\testWorkspace' : '/testWorkspace'));
            context = new workbenchTestServices_1.TestContextService(workspace);
        });
        test('resolveResourcesForSearchIncludes passes through paths without special glob characters', () => {
            const actual = (0, queryBuilder_1.resolveResourcesForSearchIncludes)([uri_1.URI.file(platform_1.isWindows ? "C:\\testWorkspace\\pages\\blog" : "/testWorkspace/pages/blog")], context);
            assert.deepStrictEqual(actual, ["./pages/blog"]);
        });
        test('resolveResourcesForSearchIncludes escapes paths with special characters', () => {
            const actual = (0, queryBuilder_1.resolveResourcesForSearchIncludes)([uri_1.URI.file(platform_1.isWindows ? "C:\\testWorkspace\\pages\\blog\\[postId]" : "/testWorkspace/pages/blog/[postId]")], context);
            assert.deepStrictEqual(actual, ["./pages/blog/[[]postId[]]"]);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnlCdWlsZGVyLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvc2VhcmNoL3Rlc3QvY29tbW9uL3F1ZXJ5QnVpbGRlci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVlBLEtBQUssQ0FBQyxvQkFBb0IsRUFBRSxHQUFHLEVBQUU7UUFDaEMsSUFBSSxPQUFpQyxDQUFDO1FBRXRDLEtBQUssQ0FBQyxHQUFHLEVBQUU7WUFDVixNQUFNLFNBQVMsR0FBRyxJQUFBLDZCQUFhLEVBQUMsU0FBRyxDQUFDLElBQUksQ0FBQyxvQkFBUyxDQUFDLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1lBQzlGLE9BQU8sR0FBRyxJQUFJLDBDQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzdDLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHdGQUF3RixFQUFFLEdBQUcsRUFBRTtZQUNuRyxNQUFNLE1BQU0sR0FBRyxJQUFBLGdEQUFpQyxFQUFDLENBQUMsU0FBRyxDQUFDLElBQUksQ0FBQyxvQkFBUyxDQUFDLENBQUMsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ2xKLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztRQUNsRCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyx5RUFBeUUsRUFBRSxHQUFHLEVBQUU7WUFDcEYsTUFBTSxNQUFNLEdBQUcsSUFBQSxnREFBaUMsRUFBQyxDQUFDLFNBQUcsQ0FBQyxJQUFJLENBQUMsb0JBQVMsQ0FBQyxDQUFDLENBQUMsMENBQTBDLENBQUMsQ0FBQyxDQUFDLG9DQUFvQyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNySyxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQztRQUMvRCxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDIn0=