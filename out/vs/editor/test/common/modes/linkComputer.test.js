define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/languages/linkComputer"], function (require, exports, assert, utils_1, linkComputer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SimpleLinkComputerTarget {
        constructor(_lines) {
            this._lines = _lines;
            // Intentional Empty
        }
        getLineCount() {
            return this._lines.length;
        }
        getLineContent(lineNumber) {
            return this._lines[lineNumber - 1];
        }
    }
    function myComputeLinks(lines) {
        const target = new SimpleLinkComputerTarget(lines);
        return (0, linkComputer_1.computeLinks)(target);
    }
    function assertLink(text, extractedLink) {
        let startColumn = 0, endColumn = 0, chr, i = 0;
        for (i = 0; i < extractedLink.length; i++) {
            chr = extractedLink.charAt(i);
            if (chr !== ' ' && chr !== '\t') {
                startColumn = i + 1;
                break;
            }
        }
        for (i = extractedLink.length - 1; i >= 0; i--) {
            chr = extractedLink.charAt(i);
            if (chr !== ' ' && chr !== '\t') {
                endColumn = i + 2;
                break;
            }
        }
        const r = myComputeLinks([text]);
        assert.deepStrictEqual(r, [{
                range: {
                    startLineNumber: 1,
                    startColumn: startColumn,
                    endLineNumber: 1,
                    endColumn: endColumn
                },
                url: extractedLink.substring(startColumn - 1, endColumn - 1)
            }]);
    }
    suite('Editor Modes - Link Computer', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('Null model', () => {
            const r = (0, linkComputer_1.computeLinks)(null);
            assert.deepStrictEqual(r, []);
        });
        test('Parsing', () => {
            assertLink('x = "http://foo.bar";', '     http://foo.bar  ');
            assertLink('x = (http://foo.bar);', '     http://foo.bar  ');
            assertLink('x = [http://foo.bar];', '     http://foo.bar  ');
            assertLink('x = \'http://foo.bar\';', '     http://foo.bar  ');
            assertLink('x =  http://foo.bar ;', '     http://foo.bar  ');
            assertLink('x = <http://foo.bar>;', '     http://foo.bar  ');
            assertLink('x = {http://foo.bar};', '     http://foo.bar  ');
            assertLink('(see http://foo.bar)', '     http://foo.bar  ');
            assertLink('[see http://foo.bar]', '     http://foo.bar  ');
            assertLink('{see http://foo.bar}', '     http://foo.bar  ');
            assertLink('<see http://foo.bar>', '     http://foo.bar  ');
            assertLink('<url>http://mylink.com</url>', '     http://mylink.com      ');
            assertLink('// Click here to learn more. https://go.microsoft.com/fwlink/?LinkID=513275&clcid=0x409', '                             https://go.microsoft.com/fwlink/?LinkID=513275&clcid=0x409');
            assertLink('// Click here to learn more. https://msdn.microsoft.com/en-us/library/windows/desktop/aa365247(v=vs.85).aspx', '                             https://msdn.microsoft.com/en-us/library/windows/desktop/aa365247(v=vs.85).aspx');
            assertLink('// https://github.com/projectkudu/kudu/blob/master/Kudu.Core/Scripts/selectNodeVersion.js', '   https://github.com/projectkudu/kudu/blob/master/Kudu.Core/Scripts/selectNodeVersion.js');
            assertLink('<!-- !!! Do not remove !!!   WebContentRef(link:https://go.microsoft.com/fwlink/?LinkId=166007, area:Admin, updated:2015, nextUpdate:2016, tags:SqlServer)   !!! Do not remove !!! -->', '                                                https://go.microsoft.com/fwlink/?LinkId=166007                                                                                        ');
            assertLink('For instructions, see https://go.microsoft.com/fwlink/?LinkId=166007.</value>', '                      https://go.microsoft.com/fwlink/?LinkId=166007         ');
            assertLink('For instructions, see https://msdn.microsoft.com/en-us/library/windows/desktop/aa365247(v=vs.85).aspx.</value>', '                      https://msdn.microsoft.com/en-us/library/windows/desktop/aa365247(v=vs.85).aspx         ');
            assertLink('x = "https://en.wikipedia.org/wiki/Zürich";', '     https://en.wikipedia.org/wiki/Zürich  ');
            assertLink('請參閱 http://go.microsoft.com/fwlink/?LinkId=761051。', '    http://go.microsoft.com/fwlink/?LinkId=761051 ');
            assertLink('（請參閱 http://go.microsoft.com/fwlink/?LinkId=761051）', '     http://go.microsoft.com/fwlink/?LinkId=761051 ');
            assertLink('x = "file:///foo.bar";', '     file:///foo.bar  ');
            assertLink('x = "file://c:/foo.bar";', '     file://c:/foo.bar  ');
            assertLink('x = "file://shares/foo.bar";', '     file://shares/foo.bar  ');
            assertLink('x = "file://shäres/foo.bar";', '     file://shäres/foo.bar  ');
            assertLink('Some text, then http://www.bing.com.', '                http://www.bing.com ');
            assertLink('let url = `http://***/_api/web/lists/GetByTitle(\'Teambuildingaanvragen\')/items`;', '           http://***/_api/web/lists/GetByTitle(\'Teambuildingaanvragen\')/items  ');
        });
        test('issue #7855', () => {
            assertLink('7. At this point, ServiceMain has been called.  There is no functionality presently in ServiceMain, but you can consult the [MSDN documentation](https://msdn.microsoft.com/en-us/library/windows/desktop/ms687414(v=vs.85).aspx) to add functionality as desired!', '                                                                                                                                                 https://msdn.microsoft.com/en-us/library/windows/desktop/ms687414(v=vs.85).aspx                                  ');
        });
        test('issue #62278: "Ctrl + click to follow link" for IPv6 URLs', () => {
            assertLink('let x = "http://[::1]:5000/connect/token"', '         http://[::1]:5000/connect/token  ');
        });
        test('issue #70254: bold links dont open in markdown file using editor mode with ctrl + click', () => {
            assertLink('2. Navigate to **https://portal.azure.com**', '                 https://portal.azure.com  ');
        });
        test('issue #86358: URL wrong recognition pattern', () => {
            assertLink('POST|https://portal.azure.com|2019-12-05|', '     https://portal.azure.com            ');
        });
        test('issue #67022: Space as end of hyperlink isn\'t always good idea', () => {
            assertLink('aa  https://foo.bar/[this is foo site]  aa', '    https://foo.bar/[this is foo site]    ');
        });
        test('issue #100353: Link detection stops at ＆(double-byte)', () => {
            assertLink('aa  http://tree-mark.chips.jp/レーズン＆ベリーミックス  aa', '    http://tree-mark.chips.jp/レーズン＆ベリーミックス    ');
        });
        test('issue #121438: Link detection stops at【...】', () => {
            assertLink('aa  https://zh.wikipedia.org/wiki/【我推的孩子】 aa', '    https://zh.wikipedia.org/wiki/【我推的孩子】   ');
        });
        test('issue #121438: Link detection stops at《...》', () => {
            assertLink('aa  https://zh.wikipedia.org/wiki/《新青年》编辑部旧址 aa', '    https://zh.wikipedia.org/wiki/《新青年》编辑部旧址   ');
        });
        test('issue #121438: Link detection stops at “...”', () => {
            assertLink('aa  https://zh.wikipedia.org/wiki/“常凯申”误译事件 aa', '    https://zh.wikipedia.org/wiki/“常凯申”误译事件   ');
        });
        test('issue #150905: Colon after bare hyperlink is treated as its part', () => {
            assertLink('https://site.web/page.html: blah blah blah', 'https://site.web/page.html                ');
        });
        // Removed because of #156875
        // test('issue #151631: Link parsing stoped where comments include a single quote ', () => {
        // 	assertLink(
        // 		`aa https://regexper.com/#%2F''%2F aa`,
        // 		`   https://regexper.com/#%2F''%2F   `,
        // 	);
        // });
        test('issue #156875: Links include quotes ', () => {
            assertLink(`"This file has been converted from https://github.com/jeff-hykin/better-c-syntax/blob/master/autogenerated/c.tmLanguage.json",`, `                                   https://github.com/jeff-hykin/better-c-syntax/blob/master/autogenerated/c.tmLanguage.json  `);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlua0NvbXB1dGVyLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvdGVzdC9jb21tb24vbW9kZXMvbGlua0NvbXB1dGVyLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBU0EsTUFBTSx3QkFBd0I7UUFFN0IsWUFBb0IsTUFBZ0I7WUFBaEIsV0FBTSxHQUFOLE1BQU0sQ0FBVTtZQUNuQyxvQkFBb0I7UUFDckIsQ0FBQztRQUVNLFlBQVk7WUFDbEIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUMzQixDQUFDO1FBRU0sY0FBYyxDQUFDLFVBQWtCO1lBQ3ZDLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDcEMsQ0FBQztLQUNEO0lBRUQsU0FBUyxjQUFjLENBQUMsS0FBZTtRQUN0QyxNQUFNLE1BQU0sR0FBRyxJQUFJLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25ELE9BQU8sSUFBQSwyQkFBWSxFQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFFRCxTQUFTLFVBQVUsQ0FBQyxJQUFZLEVBQUUsYUFBcUI7UUFDdEQsSUFBSSxXQUFXLEdBQUcsQ0FBQyxFQUNsQixTQUFTLEdBQUcsQ0FBQyxFQUNiLEdBQVcsRUFDWCxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRVAsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzFDLEdBQUcsR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlCLElBQUksR0FBRyxLQUFLLEdBQUcsSUFBSSxHQUFHLEtBQUssSUFBSSxFQUFFO2dCQUNoQyxXQUFXLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDcEIsTUFBTTthQUNOO1NB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