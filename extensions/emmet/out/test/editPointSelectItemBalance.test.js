"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const assert = require("assert");
const vscode_1 = require("vscode");
const testUtils_1 = require("./testUtils");
const editPoint_1 = require("../editPoint");
const selectItem_1 = require("../selectItem");
const balance_1 = require("../balance");
suite('Tests for Next/Previous Select/Edit point and Balance actions', () => {
    teardown(testUtils_1.closeAllEditors);
    const cssContents = `
.boo {
	margin: 20px 10px;
	background-image: url('tryme.png');
}

.boo .hoo {
	margin: 10px;
}
`;
    const scssContents = `
.boo {
	margin: 20px 10px;
	background-image: url('tryme.png');

	.boo .hoo {
		margin: 10px;
	}
}
`;
    const htmlContents = `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title></title>
</head>
<body>
	<div>
\t\t
	</div>
	<div class="header">
		<ul class="nav main">
			<li class="item1">Item 1</li>
			<li class="item2">Item 2</li>
		</ul>
	</div>
</body>
</html>
`;
    test('Emmet Next/Prev Edit point in html file', function () {
        return (0, testUtils_1.withRandomFileEditor)(htmlContents, '.html', (editor, _) => {
            editor.selections = [new vscode_1.Selection(1, 5, 1, 5)];
            const expectedNextEditPoints = [[4, 16], [6, 8], [10, 2], [10, 2]];
            expectedNextEditPoints.forEach(([line, col]) => {
                (0, editPoint_1.fetchEditPoint)('next');
                testSelection(editor.selection, col, line);
            });
            const expectedPrevEditPoints = [[6, 8], [4, 16], [4, 16]];
            expectedPrevEditPoints.forEach(([line, col]) => {
                (0, editPoint_1.fetchEditPoint)('prev');
                testSelection(editor.selection, col, line);
            });
            return Promise.resolve();
        });
    });
    test('Emmet Select Next/Prev Item in html file', function () {
        return (0, testUtils_1.withRandomFileEditor)(htmlContents, '.html', (editor, _) => {
            editor.selections = [new vscode_1.Selection(2, 2, 2, 2)];
            const expectedNextItemPoints = [
                [2, 1, 5],
                [2, 6, 15],
                [2, 12, 14],
                [3, 1, 5],
                [4, 2, 6],
                [4, 7, 17],
                [5, 2, 6],
                [5, 7, 22],
                [5, 13, 21],
                [5, 23, 70],
                [5, 32, 69],
                [5, 32, 51],
                [5, 52, 69],
                [6, 2, 7] // title
            ];
            expectedNextItemPoints.forEach(([line, colstart, colend]) => {
                (0, selectItem_1.fetchSelectItem)('next');
                testSelection(editor.selection, colstart, line, colend);
            });
            editor.selections = [new vscode_1.Selection(6, 15, 6, 15)];
            expectedNextItemPoints.reverse().forEach(([line, colstart, colend]) => {
                (0, selectItem_1.fetchSelectItem)('prev');
                testSelection(editor.selection, colstart, line, colend);
            });
            return Promise.resolve();
        });
    });
    test('Emmet Select Next/Prev item at boundary', function () {
        return (0, testUtils_1.withRandomFileEditor)(htmlContents, '.html', (editor, _) => {
            editor.selections = [new vscode_1.Selection(4, 1, 4, 1)];
            (0, selectItem_1.fetchSelectItem)('next');
            testSelection(editor.selection, 2, 4, 6);
            editor.selections = [new vscode_1.Selection(4, 1, 4, 1)];
            (0, selectItem_1.fetchSelectItem)('prev');
            testSelection(editor.selection, 1, 3, 5);
            return Promise.resolve();
        });
    });
    test('Emmet Next/Prev Item in html template', function () {
        const templateContents = `
<script type="text/template">
	<div class="header">
		<ul class="nav main">
		</ul>
	</div>
</script>
`;
        return (0, testUtils_1.withRandomFileEditor)(templateContents, '.html', (editor, _) => {
            editor.selections = [new vscode_1.Selection(2, 2, 2, 2)];
            const expectedNextItemPoints = [
                [2, 2, 5],
                [2, 6, 20],
                [2, 13, 19],
                [3, 3, 5],
                [3, 6, 22],
                [3, 13, 21],
                [3, 13, 16],
                [3, 17, 21], // main
            ];
            expectedNextItemPoints.forEach(([line, colstart, colend]) => {
                (0, selectItem_1.fetchSelectItem)('next');
                testSelection(editor.selection, colstart, line, colend);
            });
            editor.selections = [new vscode_1.Selection(4, 1, 4, 1)];
            expectedNextItemPoints.reverse().forEach(([line, colstart, colend]) => {
                (0, selectItem_1.fetchSelectItem)('prev');
                testSelection(editor.selection, colstart, line, colend);
            });
            return Promise.resolve();
        });
    });
    test('Emmet Select Next/Prev Item in css file', function () {
        return (0, testUtils_1.withRandomFileEditor)(cssContents, '.css', (editor, _) => {
            editor.selections = [new vscode_1.Selection(0, 0, 0, 0)];
            const expectedNextItemPoints = [
                [1, 0, 4],
                [2, 1, 19],
                [2, 9, 18],
                [2, 9, 13],
                [2, 14, 18],
                [3, 1, 36],
                [3, 19, 35],
                [6, 0, 9],
                [7, 1, 14],
                [7, 9, 13], // 10px
            ];
            expectedNextItemPoints.forEach(([line, colstart, colend]) => {
                (0, selectItem_1.fetchSelectItem)('next');
                testSelection(editor.selection, colstart, line, colend);
            });
            editor.selections = [new vscode_1.Selection(9, 0, 9, 0)];
            expectedNextItemPoints.reverse().forEach(([line, colstart, colend]) => {
                (0, selectItem_1.fetchSelectItem)('prev');
                testSelection(editor.selection, colstart, line, colend);
            });
            return Promise.resolve();
        });
    });
    test('Emmet Select Next/Prev Item in scss file with nested rules', function () {
        return (0, testUtils_1.withRandomFileEditor)(scssContents, '.scss', (editor, _) => {
            editor.selections = [new vscode_1.Selection(0, 0, 0, 0)];
            const expectedNextItemPoints = [
                [1, 0, 4],
                [2, 1, 19],
                [2, 9, 18],
                [2, 9, 13],
                [2, 14, 18],
                [3, 1, 36],
                [3, 19, 35],
                [5, 1, 10],
                [6, 2, 15],
                [6, 10, 14], // 10px
            ];
            expectedNextItemPoints.forEach(([line, colstart, colend]) => {
                (0, selectItem_1.fetchSelectItem)('next');
                testSelection(editor.selection, colstart, line, colend);
            });
            editor.selections = [new vscode_1.Selection(8, 0, 8, 0)];
            expectedNextItemPoints.reverse().forEach(([line, colstart, colend]) => {
                (0, selectItem_1.fetchSelectItem)('prev');
                testSelection(editor.selection, colstart, line, colend);
            });
            return Promise.resolve();
        });
    });
    test('Emmet Balance Out in html file', function () {
        return (0, testUtils_1.withRandomFileEditor)(htmlContents, 'html', (editor, _) => {
            editor.selections = [new vscode_1.Selection(14, 6, 14, 10)];
            const expectedBalanceOutRanges = [
                [14, 3, 14, 32],
                [13, 23, 16, 2],
                [13, 2, 16, 7],
                [12, 21, 17, 1],
                [12, 1, 17, 7],
                [8, 6, 18, 0],
                [8, 0, 18, 7],
                [2, 16, 19, 0],
                [2, 0, 19, 7], // outer contents of <html>
            ];
            expectedBalanceOutRanges.forEach(([linestart, colstart, lineend, colend]) => {
                (0, balance_1.balanceOut)();
                testSelection(editor.selection, colstart, linestart, colend, lineend);
            });
            editor.selections = [new vscode_1.Selection(12, 7, 12, 7)];
            const expectedBalanceInRanges = [
                [12, 21, 17, 1],
                [13, 2, 16, 7],
                [13, 23, 16, 2],
                [14, 3, 14, 32],
                [14, 21, 14, 27] // Item 1
            ];
            expectedBalanceInRanges.forEach(([linestart, colstart, lineend, colend]) => {
                (0, balance_1.balanceIn)();
                testSelection(editor.selection, colstart, linestart, colend, lineend);
            });
            return Promise.resolve();
        });
    });
    test('Emmet Balance In using the same stack as Balance out in html file', function () {
        return (0, testUtils_1.withRandomFileEditor)(htmlContents, 'html', (editor, _) => {
            editor.selections = [new vscode_1.Selection(15, 6, 15, 10)];
            const expectedBalanceOutRanges = [
                [15, 3, 15, 32],
                [13, 23, 16, 2],
                [13, 2, 16, 7],
                [12, 21, 17, 1],
                [12, 1, 17, 7],
                [8, 6, 18, 0],
                [8, 0, 18, 7],
                [2, 16, 19, 0],
                [2, 0, 19, 7], // outer contents of <html>
            ];
            expectedBalanceOutRanges.forEach(([linestart, colstart, lineend, colend]) => {
                (0, balance_1.balanceOut)();
                testSelection(editor.selection, colstart, linestart, colend, lineend);
            });
            expectedBalanceOutRanges.reverse().forEach(([linestart, colstart, lineend, colend]) => {
                testSelection(editor.selection, colstart, linestart, colend, lineend);
                (0, balance_1.balanceIn)();
            });
            return Promise.resolve();
        });
    });
    test('Emmet Balance In when selection doesnt span entire node or its inner contents', function () {
        return (0, testUtils_1.withRandomFileEditor)(htmlContents, 'html', (editor, _) => {
            editor.selection = new vscode_1.Selection(13, 7, 13, 10); // Inside the open tag of <ul class="nav main">
            (0, balance_1.balanceIn)();
            testSelection(editor.selection, 23, 13, 2, 16); // inner contents of <ul class="nav main">
            editor.selection = new vscode_1.Selection(16, 4, 16, 5); // Inside the open close of <ul class="nav main">
            (0, balance_1.balanceIn)();
            testSelection(editor.selection, 23, 13, 2, 16); // inner contents of <ul class="nav main">
            editor.selection = new vscode_1.Selection(13, 7, 14, 2); // Inside the open tag of <ul class="nav main"> and the next line
            (0, balance_1.balanceIn)();
            testSelection(editor.selection, 23, 13, 2, 16); // inner contents of <ul class="nav main">
            return Promise.resolve();
        });
    });
    test('Emmet Balance In/Out in html template', function () {
        const htmlTemplate = `
<script type="text/html">
<div class="header">
	<ul class="nav main">
		<li class="item1">Item 1</li>
		<li class="item2">Item 2</li>
	</ul>
</div>
</script>`;
        return (0, testUtils_1.withRandomFileEditor)(htmlTemplate, 'html', (editor, _) => {
            editor.selections = [new vscode_1.Selection(5, 24, 5, 24)];
            const expectedBalanceOutRanges = [
                [5, 20, 5, 26],
                [5, 2, 5, 31],
                [3, 22, 6, 1],
                [3, 1, 6, 6],
                [2, 20, 7, 0],
                [2, 0, 7, 6], // outer contents of div
            ];
            expectedBalanceOutRanges.forEach(([linestart, colstart, lineend, colend]) => {
                (0, balance_1.balanceOut)();
                testSelection(editor.selection, colstart, linestart, colend, lineend);
            });
            expectedBalanceOutRanges.pop();
            expectedBalanceOutRanges.reverse().forEach(([linestart, colstart, lineend, colend]) => {
                (0, balance_1.balanceIn)();
                testSelection(editor.selection, colstart, linestart, colend, lineend);
            });
            return Promise.resolve();
        });
    });
});
function testSelection(selection, startChar, startline, endChar, endLine) {
    assert.strictEqual(selection.anchor.line, startline);
    assert.strictEqual(selection.anchor.character, startChar);
    if (!endLine && endLine !== 0) {
        assert.strictEqual(selection.isSingleLine, true);
    }
    else {
        assert.strictEqual(selection.active.line, endLine);
    }
    if (!endChar && endChar !== 0) {
        assert.strictEqual(selection.isEmpty, true);
    }
    else {
        assert.strictEqual(selection.active.character, endChar);
    }
}
//# sourceMappingURL=editPointSelectItemBalance.test.js.map