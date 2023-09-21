/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "fs", "vs/base/common/network", "vs/base/common/uri"], function (require, exports, assert, fs_1, network_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('URI - perf', function () {
        let manyFileUris;
        setup(function () {
            manyFileUris = [];
            const data = (0, fs_1.readFileSync)(network_1.FileAccess.asFileUri('vs/base/test/node/uri.test.data.txt').fsPath).toString();
            const lines = data.split('\n');
            for (const line of lines) {
                manyFileUris.push(uri_1.URI.file(line));
            }
        });
        function perfTest(name, callback) {
            test(name, _done => {
                const t1 = Date.now();
                callback();
                const d = Date.now() - t1;
                console.log(`${name} took ${d}ms (${(d / manyFileUris.length).toPrecision(3)} ms/uri)`);
                _done();
            });
        }
        perfTest('toString', function () {
            for (const uri of manyFileUris) {
                const data = uri.toString();
                assert.ok(data);
            }
        });
        perfTest('toString(skipEncoding)', function () {
            for (const uri of manyFileUris) {
                const data = uri.toString(true);
                assert.ok(data);
            }
        });
        perfTest('fsPath', function () {
            for (const uri of manyFileUris) {
                const data = uri.fsPath;
                assert.ok(data);
            }
        });
        perfTest('toJSON', function () {
            for (const uri of manyFileUris) {
                const data = uri.toJSON();
                assert.ok(data);
            }
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJpLnRlc3QucGVyZi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvdGVzdC9ub2RlL3VyaS50ZXN0LnBlcmYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFPaEcsS0FBSyxDQUFDLFlBQVksRUFBRTtRQUVuQixJQUFJLFlBQW1CLENBQUM7UUFDeEIsS0FBSyxDQUFDO1lBQ0wsWUFBWSxHQUFHLEVBQUUsQ0FBQztZQUNsQixNQUFNLElBQUksR0FBRyxJQUFBLGlCQUFZLEVBQUMsb0JBQVUsQ0FBQyxTQUFTLENBQUMscUNBQXFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN6RyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQy9CLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFO2dCQUN6QixZQUFZLENBQUMsSUFBSSxDQUFDLFNBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUNsQztRQUNGLENBQUMsQ0FBQyxDQUFDO1FBRUgsU0FBUyxRQUFRLENBQUMsSUFBWSxFQUFFLFFBQWtCO1lBQ2pELElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUU7Z0JBQ2xCLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDdEIsUUFBUSxFQUFFLENBQUM7Z0JBQ1gsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztnQkFDMUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3hGLEtBQUssRUFBRSxDQUFDO1lBQ1QsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsUUFBUSxDQUFDLFVBQVUsRUFBRTtZQUNwQixLQUFLLE1BQU0sR0FBRyxJQUFJLFlBQVksRUFBRTtnQkFDL0IsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUM1QixNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ2hCO1FBQ0YsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsd0JBQXdCLEVBQUU7WUFDbEMsS0FBSyxNQUFNLEdBQUcsSUFBSSxZQUFZLEVBQUU7Z0JBQy9CLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2hDLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDaEI7UUFDRixDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxRQUFRLEVBQUU7WUFDbEIsS0FBSyxNQUFNLEdBQUcsSUFBSSxZQUFZLEVBQUU7Z0JBQy9CLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUM7Z0JBQ3hCLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDaEI7UUFDRixDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxRQUFRLEVBQUU7WUFDbEIsS0FBSyxNQUFNLEdBQUcsSUFBSSxZQUFZLEVBQUU7Z0JBQy9CLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDMUIsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUNoQjtRQUNGLENBQUMsQ0FBQyxDQUFDO0lBRUosQ0FBQyxDQUFDLENBQUMifQ==