/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/strings", "vs/base/test/common/utils", "vs/editor/common/model/textModel"], function (require, exports, assert, strings, utils_1, textModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function testTextBufferFactory(text, eol, mightContainNonBasicASCII, mightContainRTL) {
        const { disposable, textBuffer } = (0, textModel_1.createTextBufferFactory)(text).create(1 /* DefaultEndOfLine.LF */);
        assert.strictEqual(textBuffer.mightContainNonBasicASCII(), mightContainNonBasicASCII);
        assert.strictEqual(textBuffer.mightContainRTL(), mightContainRTL);
        assert.strictEqual(textBuffer.getEOL(), eol);
        disposable.dispose();
    }
    suite('ModelBuilder', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('t1', () => {
            testTextBufferFactory('', '\n', false, false);
        });
        test('t2', () => {
            testTextBufferFactory('Hello world', '\n', false, false);
        });
        test('t3', () => {
            testTextBufferFactory('Hello world\nHow are you?', '\n', false, false);
        });
        test('t4', () => {
            testTextBufferFactory('Hello world\nHow are you?\nIs everything good today?\nDo you enjoy the weather?', '\n', false, false);
        });
        test('carriage return detection (1 \\r\\n 2 \\n)', () => {
            testTextBufferFactory('Hello world\r\nHow are you?\nIs everything good today?\nDo you enjoy the weather?', '\n', false, false);
        });
        test('carriage return detection (2 \\r\\n 1 \\n)', () => {
            testTextBufferFactory('Hello world\r\nHow are you?\r\nIs everything good today?\nDo you enjoy the weather?', '\r\n', false, false);
        });
        test('carriage return detection (3 \\r\\n 0 \\n)', () => {
            testTextBufferFactory('Hello world\r\nHow are you?\r\nIs everything good today?\r\nDo you enjoy the weather?', '\r\n', false, false);
        });
        test('BOM handling', () => {
            testTextBufferFactory(strings.UTF8_BOM_CHARACTER + 'Hello world!', '\n', false, false);
        });
        test('RTL handling 2', () => {
            testTextBufferFactory('Hello world!זוהי עובדה מבוססת שדעתו', '\n', true, true);
        });
        test('RTL handling 3', () => {
            testTextBufferFactory('Hello world!זוהי \nעובדה מבוססת שדעתו', '\n', true, true);
        });
        test('ASCII handling 1', () => {
            testTextBufferFactory('Hello world!!\nHow do you do?', '\n', false, false);
        });
        test('ASCII handling 2', () => {
            testTextBufferFactory('Hello world!!\nHow do you do?Züricha📚📚b', '\n', true, false);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZXNUZXh0QnVmZmVyQnVpbGRlci50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL3Rlc3QvY29tbW9uL21vZGVsL2xpbmVzVGV4dEJ1ZmZlci9saW5lc1RleHRCdWZmZXJCdWlsZGVyLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFRaEcsU0FBUyxxQkFBcUIsQ0FBQyxJQUFZLEVBQUUsR0FBVyxFQUFFLHlCQUFrQyxFQUFFLGVBQXdCO1FBQ3JILE1BQU0sRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLEdBQUcsSUFBQSxtQ0FBdUIsRUFBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLDZCQUFxQixDQUFDO1FBRTdGLE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLHlCQUF5QixFQUFFLEVBQUUseUJBQXlCLENBQUMsQ0FBQztRQUN0RixNQUFNLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxlQUFlLEVBQUUsRUFBRSxlQUFlLENBQUMsQ0FBQztRQUNsRSxNQUFNLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUM3QyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDdEIsQ0FBQztJQUVELEtBQUssQ0FBQyxjQUFjLEVBQUUsR0FBRyxFQUFFO1FBRTFCLElBQUEsK0NBQXVDLEdBQUUsQ0FBQztRQUUxQyxJQUFJLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRTtZQUNmLHFCQUFxQixDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQy9DLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUU7WUFDZixxQkFBcUIsQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMxRCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFO1lBQ2YscUJBQXFCLENBQUMsMkJBQTJCLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN4RSxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFO1lBQ2YscUJBQXFCLENBQUMsaUZBQWlGLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM5SCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyw0Q0FBNEMsRUFBRSxHQUFHLEVBQUU7WUFDdkQscUJBQXFCLENBQUMsbUZBQW1GLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNoSSxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyw0Q0FBNEMsRUFBRSxHQUFHLEVBQUU7WUFDdkQscUJBQXFCLENBQUMscUZBQXFGLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNwSSxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyw0Q0FBNEMsRUFBRSxHQUFHLEVBQUU7WUFDdkQscUJBQXFCLENBQUMsdUZBQXVGLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN0SSxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxjQUFjLEVBQUUsR0FBRyxFQUFFO1lBQ3pCLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsR0FBRyxjQUFjLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN4RixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLEVBQUU7WUFDM0IscUJBQXFCLENBQUMscUNBQXFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNoRixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLEVBQUU7WUFDM0IscUJBQXFCLENBQUMsdUNBQXVDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNsRixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLEVBQUU7WUFDN0IscUJBQXFCLENBQUMsK0JBQStCLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM1RSxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLEVBQUU7WUFDN0IscUJBQXFCLENBQUMsMkNBQTJDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN2RixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDIn0=