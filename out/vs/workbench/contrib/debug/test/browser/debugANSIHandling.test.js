/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/color", "vs/base/common/lifecycle", "vs/base/common/uuid", "vs/base/test/common/utils", "vs/platform/theme/test/common/testThemeService", "vs/workbench/contrib/debug/browser/debugANSIHandling", "vs/workbench/contrib/debug/browser/linkDetector", "vs/workbench/contrib/debug/test/browser/callStack.test", "vs/workbench/contrib/debug/test/browser/mockDebugModel", "vs/workbench/contrib/terminal/common/terminalColorRegistry", "vs/workbench/test/browser/workbenchTestServices"], function (require, exports, assert, color_1, lifecycle_1, uuid_1, utils_1, testThemeService_1, debugANSIHandling_1, linkDetector_1, callStack_test_1, mockDebugModel_1, terminalColorRegistry_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Debug - ANSI Handling', () => {
        let disposables;
        let model;
        let session;
        let linkDetector;
        let themeService;
        /**
         * Instantiate services for use by the functions being tested.
         */
        setup(() => {
            disposables = new lifecycle_1.DisposableStore();
            model = (0, mockDebugModel_1.createMockDebugModel)(disposables);
            session = (0, callStack_test_1.createTestSession)(model);
            const instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, disposables);
            linkDetector = instantiationService.createInstance(linkDetector_1.LinkDetector);
            const colors = {};
            for (const color in terminalColorRegistry_1.ansiColorMap) {
                colors[color] = terminalColorRegistry_1.ansiColorMap[color].defaults.dark;
            }
            const testTheme = new testThemeService_1.TestColorTheme(colors);
            themeService = new testThemeService_1.TestThemeService(testTheme);
            (0, terminalColorRegistry_1.registerColors)();
        });
        teardown(() => {
            disposables.dispose();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('appendStylizedStringToContainer', () => {
            const root = document.createElement('span');
            let child;
            assert.strictEqual(0, root.children.length);
            (0, debugANSIHandling_1.appendStylizedStringToContainer)(root, 'content1', ['class1', 'class2'], linkDetector, session.root);
            (0, debugANSIHandling_1.appendStylizedStringToContainer)(root, 'content2', ['class2', 'class3'], linkDetector, session.root);
            assert.strictEqual(2, root.children.length);
            child = root.firstChild;
            if (child instanceof HTMLSpanElement) {
                assert.strictEqual('content1', child.textContent);
                assert(child.classList.contains('class1'));
                assert(child.classList.contains('class2'));
            }
            else {
                assert.fail('Unexpected assertion error');
            }
            child = root.lastChild;
            if (child instanceof HTMLSpanElement) {
                assert.strictEqual('content2', child.textContent);
                assert(child.classList.contains('class2'));
                assert(child.classList.contains('class3'));
            }
            else {
                assert.fail('Unexpected assertion error');
            }
        });
        /**
         * Apply an ANSI sequence to {@link #getSequenceOutput}.
         *
         * @param sequence The ANSI sequence to stylize.
         * @returns An {@link HTMLSpanElement} that contains the stylized text.
         */
        function getSequenceOutput(sequence) {
            const root = (0, debugANSIHandling_1.handleANSIOutput)(sequence, linkDetector, themeService, session.root);
            assert.strictEqual(1, root.children.length);
            const child = root.lastChild;
            if (child instanceof HTMLSpanElement) {
                return child;
            }
            else {
                assert.fail('Unexpected assertion error');
            }
        }
        /**
         * Assert that a given ANSI sequence maintains added content following the ANSI code, and that
         * the provided {@param assertion} passes.
         *
         * @param sequence The ANSI sequence to verify. The provided sequence should contain ANSI codes
         * only, and should not include actual text content as it is provided by this function.
         * @param assertion The function used to verify the output.
         */
        function assertSingleSequenceElement(sequence, assertion) {
            const child = getSequenceOutput(sequence + 'content');
            assert.strictEqual('content', child.textContent);
            assertion(child);
        }
        /**
         * Assert that a given DOM element has the custom inline CSS style matching
         * the color value provided.
         * @param element The HTML span element to look at.
         * @param colorType If `foreground`, will check the element's css `color`;
         * if `background`, will check the element's css `backgroundColor`.
         * if `underline`, will check the elements css `textDecorationColor`.
         * @param color RGBA object to compare color to. If `undefined` or not provided,
         * will assert that no value is set.
         * @param message Optional custom message to pass to assertion.
         * @param colorShouldMatch Optional flag (defaults TO true) which allows caller to indicate that the color SHOULD NOT MATCH
         * (for testing changes to theme colors where we need color to have changed but we don't know exact color it should have
         * changed to (but we do know the color it should NO LONGER BE))
         */
        function assertInlineColor(element, colorType, color, message, colorShouldMatch = true) {
            if (color !== undefined) {
                const cssColor = color_1.Color.Format.CSS.formatRGB(new color_1.Color(color));
                if (colorType === 'background') {
                    const styleBefore = element.style.backgroundColor;
                    element.style.backgroundColor = cssColor;
                    assert((styleBefore === element.style.backgroundColor) === colorShouldMatch, message || `Incorrect ${colorType} color style found (found color: ${styleBefore}, expected ${cssColor}).`);
                }
                else if (colorType === 'foreground') {
                    const styleBefore = element.style.color;
                    element.style.color = cssColor;
                    assert((styleBefore === element.style.color) === colorShouldMatch, message || `Incorrect ${colorType} color style found (found color: ${styleBefore}, expected ${cssColor}).`);
                }
                else {
                    const styleBefore = element.style.textDecorationColor;
                    element.style.textDecorationColor = cssColor;
                    assert((styleBefore === element.style.textDecorationColor) === colorShouldMatch, message || `Incorrect ${colorType} color style found (found color: ${styleBefore}, expected ${cssColor}).`);
                }
            }
            else {
                if (colorType === 'background') {
                    assert(!element.style.backgroundColor, message || `Defined ${colorType} color style found when it should not have been defined`);
                }
                else if (colorType === 'foreground') {
                    assert(!element.style.color, message || `Defined ${colorType} color style found when it should not have been defined`);
                }
                else {
                    assert(!element.style.textDecorationColor, message || `Defined ${colorType} color style found when it should not have been defined`);
                }
            }
        }
        test('Expected single sequence operation', () => {
            // Bold code
            assertSingleSequenceElement('\x1b[1m', (child) => {
                assert(child.classList.contains('code-bold'), 'Bold formatting not detected after bold ANSI code.');
            });
            // Italic code
            assertSingleSequenceElement('\x1b[3m', (child) => {
                assert(child.classList.contains('code-italic'), 'Italic formatting not detected after italic ANSI code.');
            });
            // Underline code
            assertSingleSequenceElement('\x1b[4m', (child) => {
                assert(child.classList.contains('code-underline'), 'Underline formatting not detected after underline ANSI code.');
            });
            for (let i = 30; i <= 37; i++) {
                const customClassName = 'code-foreground-colored';
                // Foreground colour class
                assertSingleSequenceElement('\x1b[' + i + 'm', (child) => {
                    assert(child.classList.contains(customClassName), `Custom foreground class not found on element after foreground ANSI code #${i}.`);
                });
                // Cancellation code removes colour class
                assertSingleSequenceElement('\x1b[' + i + ';39m', (child) => {
                    assert(child.classList.contains(customClassName) === false, 'Custom foreground class still found after foreground cancellation code.');
                    assertInlineColor(child, 'foreground', undefined, 'Custom color style still found after foreground cancellation code.');
                });
            }
            for (let i = 40; i <= 47; i++) {
                const customClassName = 'code-background-colored';
                // Foreground colour class
                assertSingleSequenceElement('\x1b[' + i + 'm', (child) => {
                    assert(child.classList.contains(customClassName), `Custom background class not found on element after background ANSI code #${i}.`);
                });
                // Cancellation code removes colour class
                assertSingleSequenceElement('\x1b[' + i + ';49m', (child) => {
                    assert(child.classList.contains(customClassName) === false, 'Custom background class still found after background cancellation code.');
                    assertInlineColor(child, 'foreground', undefined, 'Custom color style still found after background cancellation code.');
                });
            }
            // check all basic colors for underlines (full range is checked elsewhere, here we check cancelation)
            for (let i = 0; i <= 255; i++) {
                const customClassName = 'code-underline-colored';
                // Underline colour class
                assertSingleSequenceElement('\x1b[58;5;' + i + 'm', (child) => {
                    assert(child.classList.contains(customClassName), `Custom underline color class not found on element after underline color ANSI code 58;5;${i}m.`);
                });
                // Cancellation underline color code removes colour class
                assertSingleSequenceElement('\x1b[58;5;' + i + 'm\x1b[59m', (child) => {
                    assert(child.classList.contains(customClassName) === false, 'Custom underline color class still found after underline color cancellation code 59m.');
                    assertInlineColor(child, 'underline', undefined, 'Custom underline color style still found after underline color cancellation code 59m.');
                });
            }
            // Different codes do not cancel each other
            assertSingleSequenceElement('\x1b[1;3;4;30;41m', (child) => {
                assert.strictEqual(5, child.classList.length, 'Incorrect number of classes found for different ANSI codes.');
                assert(child.classList.contains('code-bold'));
                assert(child.classList.contains('code-italic'), 'Different ANSI codes should not cancel each other.');
                assert(child.classList.contains('code-underline'), 'Different ANSI codes should not cancel each other.');
                assert(child.classList.contains('code-foreground-colored'), 'Different ANSI codes should not cancel each other.');
                assert(child.classList.contains('code-background-colored'), 'Different ANSI codes should not cancel each other.');
            });
            // Different codes do not ACCUMULATE more than one copy of each class
            assertSingleSequenceElement('\x1b[1;1;2;2;3;3;4;4;5;5;6;6;8;8;9;9;21;21;53;53;73;73;74;74m', (child) => {
                assert(child.classList.contains('code-bold'));
                assert(child.classList.contains('code-italic'), 'italic missing Doubles of each Different ANSI codes should not cancel each other or accumulate.');
                assert(child.classList.contains('code-underline') === false, 'underline PRESENT and double underline should have removed it- Doubles of each Different ANSI codes should not cancel each other or accumulate.');
                assert(child.classList.contains('code-dim'), 'dim missing Doubles of each Different ANSI codes should not cancel each other or accumulate.');
                assert(child.classList.contains('code-blink'), 'blink missing Doubles of each Different ANSI codes should not cancel each other or accumulate.');
                assert(child.classList.contains('code-rapid-blink'), 'rapid blink mkssing Doubles of each Different ANSI codes should not cancel each other or accumulate.');
                assert(child.classList.contains('code-double-underline'), 'double underline missing Doubles of each Different ANSI codes should not cancel each other or accumulate.');
                assert(child.classList.contains('code-hidden'), 'hidden missing Doubles of each Different ANSI codes should not cancel each other or accumulate.');
                assert(child.classList.contains('code-strike-through'), 'strike-through missing Doubles of each Different ANSI codes should not cancel each other or accumulate.');
                assert(child.classList.contains('code-overline'), 'overline missing Doubles of each Different ANSI codes should not cancel each other or accumulate.');
                assert(child.classList.contains('code-superscript') === false, 'superscript PRESENT and subscript should have removed it- Doubles of each Different ANSI codes should not cancel each other or accumulate.');
                assert(child.classList.contains('code-subscript'), 'subscript missing Doubles of each Different ANSI codes should not cancel each other or accumulate.');
                assert.strictEqual(10, child.classList.length, 'Incorrect number of classes found for each style code sent twice ANSI codes.');
            });
            // More Different codes do not cancel each other
            assertSingleSequenceElement('\x1b[1;2;5;6;21;8;9m', (child) => {
                assert.strictEqual(7, child.classList.length, 'Incorrect number of classes found for different ANSI codes.');
                assert(child.classList.contains('code-bold'));
                assert(child.classList.contains('code-dim'), 'Different ANSI codes should not cancel each other.');
                assert(child.classList.contains('code-blink'), 'Different ANSI codes should not cancel each other.');
                assert(child.classList.contains('code-rapid-blink'), 'Different ANSI codes should not cancel each other.');
                assert(child.classList.contains('code-double-underline'), 'Different ANSI codes should not cancel each other.');
                assert(child.classList.contains('code-hidden'), 'Different ANSI codes should not cancel each other.');
                assert(child.classList.contains('code-strike-through'), 'Different ANSI codes should not cancel each other.');
            });
            // New foreground codes don't remove old background codes and vice versa
            assertSingleSequenceElement('\x1b[40;31;42;33m', (child) => {
                assert.strictEqual(2, child.classList.length);
                assert(child.classList.contains('code-background-colored'), 'New foreground ANSI code should not cancel existing background formatting.');
                assert(child.classList.contains('code-foreground-colored'), 'New background ANSI code should not cancel existing foreground formatting.');
            });
            // Duplicate codes do not change output
            assertSingleSequenceElement('\x1b[1;1;4;1;4;4;1;4m', (child) => {
                assert(child.classList.contains('code-bold'), 'Duplicate formatting codes should have no effect.');
                assert(child.classList.contains('code-underline'), 'Duplicate formatting codes should have no effect.');
            });
            // Extra terminating semicolon does not change output
            assertSingleSequenceElement('\x1b[1;4;m', (child) => {
                assert(child.classList.contains('code-bold'), 'Extra semicolon after ANSI codes should have no effect.');
                assert(child.classList.contains('code-underline'), 'Extra semicolon after ANSI codes should have no effect.');
            });
            // Cancellation code removes multiple codes
            assertSingleSequenceElement('\x1b[1;4;30;41;32;43;34;45;36;47;0m', (child) => {
                assert.strictEqual(0, child.classList.length, 'Cancellation ANSI code should clear ALL formatting.');
                assertInlineColor(child, 'background', undefined, 'Cancellation ANSI code should clear ALL formatting.');
                assertInlineColor(child, 'foreground', undefined, 'Cancellation ANSI code should clear ALL formatting.');
            });
        });
        test('Expected single 8-bit color sequence operation', () => {
            // Basic and bright color codes specified with 8-bit color code format
            for (let i = 0; i <= 15; i++) {
                // As these are controlled by theme, difficult to check actual color value
                // Foreground codes should add standard classes
                assertSingleSequenceElement('\x1b[38;5;' + i + 'm', (child) => {
                    assert(child.classList.contains('code-foreground-colored'), `Custom color class not found after foreground 8-bit color code 38;5;${i}`);
                });
                // Background codes should add standard classes
                assertSingleSequenceElement('\x1b[48;5;' + i + 'm', (child) => {
                    assert(child.classList.contains('code-background-colored'), `Custom color class not found after background 8-bit color code 48;5;${i}`);
                });
            }
            // 8-bit advanced colors
            for (let i = 16; i <= 255; i++) {
                // Foreground codes should add custom class and inline style
                assertSingleSequenceElement('\x1b[38;5;' + i + 'm', (child) => {
                    assert(child.classList.contains('code-foreground-colored'), `Custom color class not found after foreground 8-bit color code 38;5;${i}`);
                    assertInlineColor(child, 'foreground', (0, debugANSIHandling_1.calcANSI8bitColor)(i), `Incorrect or no color styling found after foreground 8-bit color code 38;5;${i}`);
                });
                // Background codes should add custom class and inline style
                assertSingleSequenceElement('\x1b[48;5;' + i + 'm', (child) => {
                    assert(child.classList.contains('code-background-colored'), `Custom color class not found after background 8-bit color code 48;5;${i}`);
                    assertInlineColor(child, 'background', (0, debugANSIHandling_1.calcANSI8bitColor)(i), `Incorrect or no color styling found after background 8-bit color code 48;5;${i}`);
                });
                // Color underline codes should add custom class and inline style
                assertSingleSequenceElement('\x1b[58;5;' + i + 'm', (child) => {
                    assert(child.classList.contains('code-underline-colored'), `Custom color class not found after underline 8-bit color code 58;5;${i}`);
                    assertInlineColor(child, 'underline', (0, debugANSIHandling_1.calcANSI8bitColor)(i), `Incorrect or no color styling found after underline 8-bit color code 58;5;${i}`);
                });
            }
            // Bad (nonexistent) color should not render
            assertSingleSequenceElement('\x1b[48;5;300m', (child) => {
                assert.strictEqual(0, child.classList.length, 'Bad ANSI color codes should have no effect.');
            });
            // Should ignore any codes after the ones needed to determine color
            assertSingleSequenceElement('\x1b[48;5;100;42;77;99;4;24m', (child) => {
                assert(child.classList.contains('code-background-colored'));
                assert.strictEqual(1, child.classList.length);
                assertInlineColor(child, 'background', (0, debugANSIHandling_1.calcANSI8bitColor)(100));
            });
        });
        test('Expected single 24-bit color sequence operation', () => {
            // 24-bit advanced colors
            for (let r = 0; r <= 255; r += 64) {
                for (let g = 0; g <= 255; g += 64) {
                    for (let b = 0; b <= 255; b += 64) {
                        const color = new color_1.RGBA(r, g, b);
                        // Foreground codes should add class and inline style
                        assertSingleSequenceElement(`\x1b[38;2;${r};${g};${b}m`, (child) => {
                            assert(child.classList.contains('code-foreground-colored'), 'DOM should have "code-foreground-colored" class for advanced ANSI colors.');
                            assertInlineColor(child, 'foreground', color);
                        });
                        // Background codes should add class and inline style
                        assertSingleSequenceElement(`\x1b[48;2;${r};${g};${b}m`, (child) => {
                            assert(child.classList.contains('code-background-colored'), 'DOM should have "code-foreground-colored" class for advanced ANSI colors.');
                            assertInlineColor(child, 'background', color);
                        });
                        // Underline color codes should add class and inline style
                        assertSingleSequenceElement(`\x1b[58;2;${r};${g};${b}m`, (child) => {
                            assert(child.classList.contains('code-underline-colored'), 'DOM should have "code-underline-colored" class for advanced ANSI colors.');
                            assertInlineColor(child, 'underline', color);
                        });
                    }
                }
            }
            // Invalid color should not render
            assertSingleSequenceElement('\x1b[38;2;4;4m', (child) => {
                assert.strictEqual(0, child.classList.length, `Invalid color code "38;2;4;4" should not add a class (classes found: ${child.classList}).`);
                assert(!child.style.color, `Invalid color code "38;2;4;4" should not add a custom color CSS (found color: ${child.style.color}).`);
            });
            // Bad (nonexistent) color should not render
            assertSingleSequenceElement('\x1b[48;2;150;300;5m', (child) => {
                assert.strictEqual(0, child.classList.length, `Nonexistent color code "48;2;150;300;5" should not add a class (classes found: ${child.classList}).`);
            });
            // Should ignore any codes after the ones needed to determine color
            assertSingleSequenceElement('\x1b[48;2;100;42;77;99;200;75m', (child) => {
                assert(child.classList.contains('code-background-colored'), `Color code with extra (valid) items "48;2;100;42;77;99;200;75" should still treat initial part as valid code and add class "code-background-custom".`);
                assert.strictEqual(1, child.classList.length, `Color code with extra items "48;2;100;42;77;99;200;75" should add one and only one class. (classes found: ${child.classList}).`);
                assertInlineColor(child, 'background', new color_1.RGBA(100, 42, 77), `Color code "48;2;100;42;77;99;200;75" should  style background-color as rgb(100,42,77).`);
            });
        });
        /**
         * Assert that a given ANSI sequence produces the expected number of {@link HTMLSpanElement} children. For
         * each child, run the provided assertion.
         *
         * @param sequence The ANSI sequence to verify.
         * @param assertions A set of assertions to run on the resulting children.
         */
        function assertMultipleSequenceElements(sequence, assertions, elementsExpected) {
            if (elementsExpected === undefined) {
                elementsExpected = assertions.length;
            }
            const root = (0, debugANSIHandling_1.handleANSIOutput)(sequence, linkDetector, themeService, session.root);
            assert.strictEqual(elementsExpected, root.children.length);
            for (let i = 0; i < elementsExpected; i++) {
                const child = root.children[i];
                if (child instanceof HTMLSpanElement) {
                    assertions[i](child);
                }
                else {
                    assert.fail('Unexpected assertion error');
                }
            }
        }
        test('Expected multiple sequence operation', () => {
            // Multiple codes affect the same text
            assertSingleSequenceElement('\x1b[1m\x1b[3m\x1b[4m\x1b[32m', (child) => {
                assert(child.classList.contains('code-bold'), 'Bold class not found after multiple different ANSI codes.');
                assert(child.classList.contains('code-italic'), 'Italic class not found after multiple different ANSI codes.');
                assert(child.classList.contains('code-underline'), 'Underline class not found after multiple different ANSI codes.');
                assert(child.classList.contains('code-foreground-colored'), 'Foreground color class not found after multiple different ANSI codes.');
            });
            // Consecutive codes do not affect previous ones
            assertMultipleSequenceElements('\x1b[1mbold\x1b[32mgreen\x1b[4munderline\x1b[3mitalic\x1b[0mnothing', [
                (bold) => {
                    assert.strictEqual(1, bold.classList.length);
                    assert(bold.classList.contains('code-bold'), 'Bold class not found after bold ANSI code.');
                },
                (green) => {
                    assert.strictEqual(2, green.classList.length);
                    assert(green.classList.contains('code-bold'), 'Bold class not found after both bold and color ANSI codes.');
                    assert(green.classList.contains('code-foreground-colored'), 'Color class not found after color ANSI code.');
                },
                (underline) => {
                    assert.strictEqual(3, underline.classList.length);
                    assert(underline.classList.contains('code-bold'), 'Bold class not found after bold, color, and underline ANSI codes.');
                    assert(underline.classList.contains('code-foreground-colored'), 'Color class not found after color and underline ANSI codes.');
                    assert(underline.classList.contains('code-underline'), 'Underline class not found after underline ANSI code.');
                },
                (italic) => {
                    assert.strictEqual(4, italic.classList.length);
                    assert(italic.classList.contains('code-bold'), 'Bold class not found after bold, color, underline, and italic ANSI codes.');
                    assert(italic.classList.contains('code-foreground-colored'), 'Color class not found after color, underline, and italic ANSI codes.');
                    assert(italic.classList.contains('code-underline'), 'Underline class not found after underline and italic ANSI codes.');
                    assert(italic.classList.contains('code-italic'), 'Italic class not found after italic ANSI code.');
                },
                (nothing) => {
                    assert.strictEqual(0, nothing.classList.length, 'One or more style classes still found after reset ANSI code.');
                },
            ], 5);
            // Consecutive codes with ENDING/OFF codes do not LEAVE affect previous ones
            assertMultipleSequenceElements('\x1b[1mbold\x1b[22m\x1b[32mgreen\x1b[4munderline\x1b[24m\x1b[3mitalic\x1b[23mjustgreen\x1b[0mnothing', [
                (bold) => {
                    assert.strictEqual(1, bold.classList.length);
                    assert(bold.classList.contains('code-bold'), 'Bold class not found after bold ANSI code.');
                },
                (green) => {
                    assert.strictEqual(1, green.classList.length);
                    assert(green.classList.contains('code-bold') === false, 'Bold class found after both bold WAS TURNED OFF with 22m');
                    assert(green.classList.contains('code-foreground-colored'), 'Color class not found after color ANSI code.');
                },
                (underline) => {
                    assert.strictEqual(2, underline.classList.length);
                    assert(underline.classList.contains('code-foreground-colored'), 'Color class not found after color and underline ANSI codes.');
                    assert(underline.classList.contains('code-underline'), 'Underline class not found after underline ANSI code.');
                },
                (italic) => {
                    assert.strictEqual(2, italic.classList.length);
                    assert(italic.classList.contains('code-foreground-colored'), 'Color class not found after color, underline, and italic ANSI codes.');
                    assert(italic.classList.contains('code-underline') === false, 'Underline class found after underline WAS TURNED OFF with 24m');
                    assert(italic.classList.contains('code-italic'), 'Italic class not found after italic ANSI code.');
                },
                (justgreen) => {
                    assert.strictEqual(1, justgreen.classList.length);
                    assert(justgreen.classList.contains('code-italic') === false, 'Italic class found after italic WAS TURNED OFF with 23m');
                    assert(justgreen.classList.contains('code-foreground-colored'), 'Color class not found after color ANSI code.');
                },
                (nothing) => {
                    assert.strictEqual(0, nothing.classList.length, 'One or more style classes still found after reset ANSI code.');
                },
            ], 6);
            // more Consecutive codes with ENDING/OFF codes do not LEAVE affect previous ones
            assertMultipleSequenceElements('\x1b[2mdim\x1b[22m\x1b[32mgreen\x1b[5mslowblink\x1b[25m\x1b[6mrapidblink\x1b[25mjustgreen\x1b[0mnothing', [
                (dim) => {
                    assert.strictEqual(1, dim.classList.length);
                    assert(dim.classList.contains('code-dim'), 'Dim class not found after dim ANSI code 2m.');
                },
                (green) => {
                    assert.strictEqual(1, green.classList.length);
                    assert(green.classList.contains('code-dim') === false, 'Dim class found after dim WAS TURNED OFF with 22m');
                    assert(green.classList.contains('code-foreground-colored'), 'Color class not found after color ANSI code.');
                },
                (slowblink) => {
                    assert.strictEqual(2, slowblink.classList.length);
                    assert(slowblink.classList.contains('code-foreground-colored'), 'Color class not found after color and blink ANSI codes.');
                    assert(slowblink.classList.contains('code-blink'), 'Blink class not found after underline ANSI code 5m.');
                },
                (rapidblink) => {
                    assert.strictEqual(2, rapidblink.classList.length);
                    assert(rapidblink.classList.contains('code-foreground-colored'), 'Color class not found after color, blink, and rapid blink ANSI codes.');
                    assert(rapidblink.classList.contains('code-blink') === false, 'blink class found after underline WAS TURNED OFF with 25m');
                    assert(rapidblink.classList.contains('code-rapid-blink'), 'Rapid blink class not found after rapid blink ANSI code 6m.');
                },
                (justgreen) => {
                    assert.strictEqual(1, justgreen.classList.length);
                    assert(justgreen.classList.contains('code-rapid-blink') === false, 'Rapid blink class found after rapid blink WAS TURNED OFF with 25m');
                    assert(justgreen.classList.contains('code-foreground-colored'), 'Color class not found after color ANSI code.');
                },
                (nothing) => {
                    assert.strictEqual(0, nothing.classList.length, 'One or more style classes still found after reset ANSI code.');
                },
            ], 6);
            // more Consecutive codes with ENDING/OFF codes do not LEAVE affect previous ones
            assertMultipleSequenceElements('\x1b[8mhidden\x1b[28m\x1b[32mgreen\x1b[9mcrossedout\x1b[29m\x1b[21mdoubleunderline\x1b[24mjustgreen\x1b[0mnothing', [
                (hidden) => {
                    assert.strictEqual(1, hidden.classList.length);
                    assert(hidden.classList.contains('code-hidden'), 'Hidden class not found after dim ANSI code 8m.');
                },
                (green) => {
                    assert.strictEqual(1, green.classList.length);
                    assert(green.classList.contains('code-hidden') === false, 'Hidden class found after Hidden WAS TURNED OFF with 28m');
                    assert(green.classList.contains('code-foreground-colored'), 'Color class not found after color ANSI code.');
                },
                (crossedout) => {
                    assert.strictEqual(2, crossedout.classList.length);
                    assert(crossedout.classList.contains('code-foreground-colored'), 'Color class not found after color and hidden ANSI codes.');
                    assert(crossedout.classList.contains('code-strike-through'), 'strike-through class not found after crossout/strikethrough ANSI code 9m.');
                },
                (doubleunderline) => {
                    assert.strictEqual(2, doubleunderline.classList.length);
                    assert(doubleunderline.classList.contains('code-foreground-colored'), 'Color class not found after color, hidden, and crossedout ANSI codes.');
                    assert(doubleunderline.classList.contains('code-strike-through') === false, 'strike-through class found after strike-through WAS TURNED OFF with 29m');
                    assert(doubleunderline.classList.contains('code-double-underline'), 'Double underline class not found after double underline ANSI code 21m.');
                },
                (justgreen) => {
                    assert.strictEqual(1, justgreen.classList.length);
                    assert(justgreen.classList.contains('code-double-underline') === false, 'Double underline class found after double underline WAS TURNED OFF with 24m');
                    assert(justgreen.classList.contains('code-foreground-colored'), 'Color class not found after color ANSI code.');
                },
                (nothing) => {
                    assert.strictEqual(0, nothing.classList.length, 'One or more style classes still found after reset ANSI code.');
                },
            ], 6);
            // underline, double underline are mutually exclusive, test underline->double underline->off and double underline->underline->off
            assertMultipleSequenceElements('\x1b[4munderline\x1b[21mdouble underline\x1b[24munderlineOff\x1b[21mdouble underline\x1b[4munderline\x1b[24munderlineOff', [
                (underline) => {
                    assert.strictEqual(1, underline.classList.length);
                    assert(underline.classList.contains('code-underline'), 'Underline class not found after underline ANSI code 4m.');
                },
                (doubleunderline) => {
                    assert(doubleunderline.classList.contains('code-underline') === false, 'Underline class found after double underline code 21m');
                    assert(doubleunderline.classList.contains('code-double-underline'), 'Double underline class not found after double underline code 21m');
                    assert.strictEqual(1, doubleunderline.classList.length, 'should have found only double underline');
                },
                (nothing) => {
                    assert.strictEqual(0, nothing.classList.length, 'One or more style classes still found after underline off code 4m.');
                },
                (doubleunderline) => {
                    assert(doubleunderline.classList.contains('code-double-underline'), 'Double underline class not found after double underline code 21m');
                    assert.strictEqual(1, doubleunderline.classList.length, 'should have found only double underline');
                },
                (underline) => {
                    assert(underline.classList.contains('code-double-underline') === false, 'Double underline class found after underline code 4m');
                    assert(underline.classList.contains('code-underline'), 'Underline class not found after underline ANSI code 4m.');
                    assert.strictEqual(1, underline.classList.length, 'should have found only underline');
                },
                (nothing) => {
                    assert.strictEqual(0, nothing.classList.length, 'One or more style classes still found after underline off code 4m.');
                },
            ], 6);
            // underline and strike-through and overline can exist at the same time and
            // in any combination
            assertMultipleSequenceElements('\x1b[4munderline\x1b[9mand strikethough\x1b[53mand overline\x1b[24munderlineOff\x1b[55moverlineOff\x1b[29mstriklethoughOff', [
                (underline) => {
                    assert.strictEqual(1, underline.classList.length, 'should have found only underline');
                    assert(underline.classList.contains('code-underline'), 'Underline class not found after underline ANSI code 4m.');
                },
                (strikethrough) => {
                    assert(strikethrough.classList.contains('code-underline'), 'Underline class NOT found after strikethrough code 9m');
                    assert(strikethrough.classList.contains('code-strike-through'), 'Strike through class not found after strikethrough code 9m');
                    assert.strictEqual(2, strikethrough.classList.length, 'should have found underline and strikethrough');
                },
                (overline) => {
                    assert(overline.classList.contains('code-underline'), 'Underline class NOT found after overline code 53m');
                    assert(overline.classList.contains('code-strike-through'), 'Strike through class not found after overline code 53m');
                    assert(overline.classList.contains('code-overline'), 'Overline class not found after overline code 53m');
                    assert.strictEqual(3, overline.classList.length, 'should have found underline,strikethrough and overline');
                },
                (underlineoff) => {
                    assert(underlineoff.classList.contains('code-underline') === false, 'Underline class found after underline off code 24m');
                    assert(underlineoff.classList.contains('code-strike-through'), 'Strike through class not found after underline off code 24m');
                    assert(underlineoff.classList.contains('code-overline'), 'Overline class not found after underline off code 24m');
                    assert.strictEqual(2, underlineoff.classList.length, 'should have found strikethrough and overline');
                },
                (overlineoff) => {
                    assert(overlineoff.classList.contains('code-underline') === false, 'Underline class found after overline off code 55m');
                    assert(overlineoff.classList.contains('code-overline') === false, 'Overline class found after overline off code 55m');
                    assert(overlineoff.classList.contains('code-strike-through'), 'Strike through class not found after overline off code 55m');
                    assert.strictEqual(1, overlineoff.classList.length, 'should have found only strikethrough');
                },
                (nothing) => {
                    assert(nothing.classList.contains('code-strike-through') === false, 'Strike through class found after strikethrough off code 29m');
                    assert.strictEqual(0, nothing.classList.length, 'One or more style classes still found after strikethough OFF code 29m');
                },
            ], 6);
            // double underline and strike-through and overline can exist at the same time and
            // in any combination
            assertMultipleSequenceElements('\x1b[21mdoubleunderline\x1b[9mand strikethough\x1b[53mand overline\x1b[29mstriklethoughOff\x1b[55moverlineOff\x1b[24munderlineOff', [
                (doubleunderline) => {
                    assert.strictEqual(1, doubleunderline.classList.length, 'should have found only doubleunderline');
                    assert(doubleunderline.classList.contains('code-double-underline'), 'Double underline class not found after double underline ANSI code 21m.');
                },
                (strikethrough) => {
                    assert(strikethrough.classList.contains('code-double-underline'), 'Double nderline class NOT found after strikethrough code 9m');
                    assert(strikethrough.classList.contains('code-strike-through'), 'Strike through class not found after strikethrough code 9m');
                    assert.strictEqual(2, strikethrough.classList.length, 'should have found doubleunderline and strikethrough');
                },
                (overline) => {
                    assert(overline.classList.contains('code-double-underline'), 'Double underline class NOT found after overline code 53m');
                    assert(overline.classList.contains('code-strike-through'), 'Strike through class not found after overline code 53m');
                    assert(overline.classList.contains('code-overline'), 'Overline class not found after overline code 53m');
                    assert.strictEqual(3, overline.classList.length, 'should have found doubleunderline,overline and strikethrough');
                },
                (strikethrougheoff) => {
                    assert(strikethrougheoff.classList.contains('code-double-underline'), 'Double underline class NOT found after strikethrough off code 29m');
                    assert(strikethrougheoff.classList.contains('code-overline'), 'Overline class NOT found after strikethrough off code 29m');
                    assert(strikethrougheoff.classList.contains('code-strike-through') === false, 'Strike through class found after strikethrough off code 29m');
                    assert.strictEqual(2, strikethrougheoff.classList.length, 'should have found doubleunderline and overline');
                },
                (overlineoff) => {
                    assert(overlineoff.classList.contains('code-double-underline'), 'Double underline class NOT found after overline off code 55m');
                    assert(overlineoff.classList.contains('code-strike-through') === false, 'Strike through class found after overline off code 55m');
                    assert(overlineoff.classList.contains('code-overline') === false, 'Overline class found after overline off code 55m');
                    assert.strictEqual(1, overlineoff.classList.length, 'Should have found only double underline');
                },
                (nothing) => {
                    assert(nothing.classList.contains('code-double-underline') === false, 'Double underline class found after underline off code 24m');
                    assert.strictEqual(0, nothing.classList.length, 'One or more style classes still found after underline OFF code 24m');
                },
            ], 6);
            // superscript and subscript are mutually exclusive, test superscript->subscript->off and subscript->superscript->off
            assertMultipleSequenceElements('\x1b[73msuperscript\x1b[74msubscript\x1b[75mneither\x1b[74msubscript\x1b[73msuperscript\x1b[75mneither', [
                (superscript) => {
                    assert.strictEqual(1, superscript.classList.length, 'should only be superscript class');
                    assert(superscript.classList.contains('code-superscript'), 'Superscript class not found after superscript ANSI code 73m.');
                },
                (subscript) => {
                    assert(subscript.classList.contains('code-superscript') === false, 'Superscript class found after subscript code 74m');
                    assert(subscript.classList.contains('code-subscript'), 'Subscript class not found after subscript code 74m');
                    assert.strictEqual(1, subscript.classList.length, 'should have found only subscript class');
                },
                (nothing) => {
                    assert.strictEqual(0, nothing.classList.length, 'One or more style classes still found after superscript/subscript off code 75m.');
                },
                (subscript) => {
                    assert(subscript.classList.contains('code-subscript'), 'Subscript class not found after subscript code 74m');
                    assert.strictEqual(1, subscript.classList.length, 'should have found only subscript class');
                },
                (superscript) => {
                    assert(superscript.classList.contains('code-subscript') === false, 'Subscript class found after superscript code 73m');
                    assert(superscript.classList.contains('code-superscript'), 'Superscript class not found after superscript ANSI code 73m.');
                    assert.strictEqual(1, superscript.classList.length, 'should have found only superscript class');
                },
                (nothing) => {
                    assert.strictEqual(0, nothing.classList.length, 'One or more style classes still found after superscipt/subscript off code 75m.');
                },
            ], 6);
            // Consecutive font codes switch to new font class and remove previous and then final switch to default font removes class
            assertMultipleSequenceElements('\x1b[11mFont1\x1b[12mFont2\x1b[13mFont3\x1b[14mFont4\x1b[15mFont5\x1b[10mdefaultFont', [
                (font1) => {
                    assert.strictEqual(1, font1.classList.length);
                    assert(font1.classList.contains('code-font-1'), 'font 1 class NOT found after switch to font 1 with ANSI code 11m');
                },
                (font2) => {
                    assert.strictEqual(1, font2.classList.length);
                    assert(font2.classList.contains('code-font-1') === false, 'font 1 class found after switch to font 2 with ANSI code 12m');
                    assert(font2.classList.contains('code-font-2'), 'font 2 class NOT found after switch to font 2 with ANSI code 12m');
                },
                (font3) => {
                    assert.strictEqual(1, font3.classList.length);
                    assert(font3.classList.contains('code-font-2') === false, 'font 2 class found after switch to font 3 with ANSI code 13m');
                    assert(font3.classList.contains('code-font-3'), 'font 3 class NOT found after switch to font 3 with ANSI code 13m');
                },
                (font4) => {
                    assert.strictEqual(1, font4.classList.length);
                    assert(font4.classList.contains('code-font-3') === false, 'font 3 class found after switch to font 4 with ANSI code 14m');
                    assert(font4.classList.contains('code-font-4'), 'font 4 class NOT found after switch to font 4 with ANSI code 14m');
                },
                (font5) => {
                    assert.strictEqual(1, font5.classList.length);
                    assert(font5.classList.contains('code-font-4') === false, 'font 4 class found after switch to font 5 with ANSI code 15m');
                    assert(font5.classList.contains('code-font-5'), 'font 5 class NOT found after switch to font 5 with ANSI code 15m');
                },
                (defaultfont) => {
                    assert.strictEqual(0, defaultfont.classList.length, 'One or more font style classes still found after reset to default font with ANSI code 10m.');
                },
            ], 6);
            // More Consecutive font codes switch to new font class and remove previous and then final switch to default font removes class
            assertMultipleSequenceElements('\x1b[16mFont6\x1b[17mFont7\x1b[18mFont8\x1b[19mFont9\x1b[20mFont10\x1b[10mdefaultFont', [
                (font6) => {
                    assert.strictEqual(1, font6.classList.length);
                    assert(font6.classList.contains('code-font-6'), 'font 6 class NOT found after switch to font 6 with ANSI code 16m');
                },
                (font7) => {
                    assert.strictEqual(1, font7.classList.length);
                    assert(font7.classList.contains('code-font-6') === false, 'font 6 class found after switch to font 7 with ANSI code 17m');
                    assert(font7.classList.contains('code-font-7'), 'font 7 class NOT found after switch to font 7 with ANSI code 17m');
                },
                (font8) => {
                    assert.strictEqual(1, font8.classList.length);
                    assert(font8.classList.contains('code-font-7') === false, 'font 7 class found after switch to font 8 with ANSI code 18m');
                    assert(font8.classList.contains('code-font-8'), 'font 8 class NOT found after switch to font 8 with ANSI code 18m');
                },
                (font9) => {
                    assert.strictEqual(1, font9.classList.length);
                    assert(font9.classList.contains('code-font-8') === false, 'font 8 class found after switch to font 9 with ANSI code 19m');
                    assert(font9.classList.contains('code-font-9'), 'font 9 class NOT found after switch to font 9 with ANSI code 19m');
                },
                (font10) => {
                    assert.strictEqual(1, font10.classList.length);
                    assert(font10.classList.contains('code-font-9') === false, 'font 9 class found after switch to font 10 with ANSI code 20m');
                    assert(font10.classList.contains('code-font-10'), `font 10 class NOT found after switch to font 10 with ANSI code 20m (${font10.classList})`);
                },
                (defaultfont) => {
                    assert.strictEqual(0, defaultfont.classList.length, 'One or more font style classes (2nd series) still found after reset to default font with ANSI code 10m.');
                },
            ], 6);
            // Blackletter font codes can be turned off with other font codes or 23m
            assertMultipleSequenceElements('\x1b[3mitalic\x1b[20mfont10blacklatter\x1b[23mitalicAndBlackletterOff\x1b[20mFont10Again\x1b[11mFont1\x1b[10mdefaultFont', [
                (italic) => {
                    assert.strictEqual(1, italic.classList.length);
                    assert(italic.classList.contains('code-italic'), 'italic class NOT found after italic code ANSI code 3m');
                },
                (font10) => {
                    assert.strictEqual(2, font10.classList.length);
                    assert(font10.classList.contains('code-italic'), 'no itatic class found after switch to font 10 (blackletter) with ANSI code 20m');
                    assert(font10.classList.contains('code-font-10'), 'font 10 class NOT found after switch to font 10 with ANSI code 20m');
                },
                (italicAndBlackletterOff) => {
                    assert.strictEqual(0, italicAndBlackletterOff.classList.length, 'italic or blackletter (font10) class found after both switched off with ANSI code 23m');
                },
                (font10) => {
                    assert.strictEqual(1, font10.classList.length);
                    assert(font10.classList.contains('code-font-10'), 'font 10 class NOT found after switch to font 10 with ANSI code 20m');
                },
                (font1) => {
                    assert.strictEqual(1, font1.classList.length);
                    assert(font1.classList.contains('code-font-10') === false, 'font 10 class found after switch to font 1 with ANSI code 11m');
                    assert(font1.classList.contains('code-font-1'), 'font 1 class NOT found after switch to font 1 with ANSI code 11m');
                },
                (defaultfont) => {
                    assert.strictEqual(0, defaultfont.classList.length, 'One or more font style classes (2nd series) still found after reset to default font with ANSI code 10m.');
                },
            ], 6);
            // italic can be turned on/off with affecting font codes 1-9  (italic off will clear 'blackletter'(font 23) as per spec)
            assertMultipleSequenceElements('\x1b[3mitalic\x1b[12mfont2\x1b[23mitalicOff\x1b[3mitalicFont2\x1b[10mjustitalic\x1b[23mnothing', [
                (italic) => {
                    assert.strictEqual(1, italic.classList.length);
                    assert(italic.classList.contains('code-italic'), 'italic class NOT found after italic code ANSI code 3m');
                },
                (font10) => {
                    assert.strictEqual(2, font10.classList.length);
                    assert(font10.classList.contains('code-italic'), 'no itatic class found after switch to font 2 with ANSI code 12m');
                    assert(font10.classList.contains('code-font-2'), 'font 2 class NOT found after switch to font 2 with ANSI code 12m');
                },
                (italicOff) => {
                    assert.strictEqual(1, italicOff.classList.length, 'italic class found after both switched off with ANSI code 23m');
                    assert(italicOff.classList.contains('code-italic') === false, 'itatic class found after switching it OFF with ANSI code 23m');
                    assert(italicOff.classList.contains('code-font-2'), 'font 2 class NOT found after switching italic off with ANSI code 23m');
                },
                (italicFont2) => {
                    assert.strictEqual(2, italicFont2.classList.length);
                    assert(italicFont2.classList.contains('code-italic'), 'no itatic class found after italic ANSI code 3m');
                    assert(italicFont2.classList.contains('code-font-2'), 'font 2 class NOT found after italic ANSI code 3m');
                },
                (justitalic) => {
                    assert.strictEqual(1, justitalic.classList.length);
                    assert(justitalic.classList.contains('code-font-2') === false, 'font 2 class found after switch to default font with ANSI code 10m');
                    assert(justitalic.classList.contains('code-italic'), 'italic class NOT found after switch to default font with ANSI code 10m');
                },
                (nothing) => {
                    assert.strictEqual(0, nothing.classList.length, 'One or more classes still found after final italic removal with ANSI code 23m.');
                },
            ], 6);
            // Reverse video reverses Foreground/Background colors WITH both SET and can called in sequence
            assertMultipleSequenceElements('\x1b[38;2;10;20;30mfg10,20,30\x1b[48;2;167;168;169mbg167,168,169\x1b[7m8ReverseVideo\x1b[7mDuplicateReverseVideo\x1b[27mReverseOff\x1b[27mDupReverseOff', [
                (fg10_20_30) => {
                    assert.strictEqual(1, fg10_20_30.classList.length, 'Foreground ANSI color code should add one class.');
                    assert(fg10_20_30.classList.contains('code-foreground-colored'), 'Foreground ANSI color codes should add custom foreground color class.');
                    assertInlineColor(fg10_20_30, 'foreground', new color_1.RGBA(10, 20, 30), '24-bit RGBA ANSI color code (10,20,30) should add matching color inline style.');
                },
                (bg167_168_169) => {
                    assert.strictEqual(2, bg167_168_169.classList.length, 'background ANSI color codes should only add a single class.');
                    assert(bg167_168_169.classList.contains('code-background-colored'), 'Background ANSI color codes should add custom background color class.');
                    assertInlineColor(bg167_168_169, 'background', new color_1.RGBA(167, 168, 169), '24-bit RGBA ANSI background color code (167,168,169) should add matching color inline style.');
                    assert(bg167_168_169.classList.contains('code-foreground-colored'), 'Still Foreground ANSI color codes should add custom foreground color class.');
                    assertInlineColor(bg167_168_169, 'foreground', new color_1.RGBA(10, 20, 30), 'Still 24-bit RGBA ANSI color code (10,20,30) should add matching color inline style.');
                },
                (reverseVideo) => {
                    assert.strictEqual(2, reverseVideo.classList.length, 'background ANSI color codes should only add a single class.');
                    assert(reverseVideo.classList.contains('code-background-colored'), 'Background ANSI color codes should add custom background color class.');
                    assertInlineColor(reverseVideo, 'foreground', new color_1.RGBA(167, 168, 169), 'Reversed 24-bit RGBA ANSI foreground color code (167,168,169) should add matching former background color inline style.');
                    assert(reverseVideo.classList.contains('code-foreground-colored'), 'Still Foreground ANSI color codes should add custom foreground color class.');
                    assertInlineColor(reverseVideo, 'background', new color_1.RGBA(10, 20, 30), 'Reversed 24-bit RGBA ANSI background color code (10,20,30) should add matching former foreground color inline style.');
                },
                (dupReverseVideo) => {
                    assert.strictEqual(2, dupReverseVideo.classList.length, 'After second Reverse Video - background ANSI color codes should only add a single class.');
                    assert(dupReverseVideo.classList.contains('code-background-colored'), 'After second Reverse Video - Background ANSI color codes should add custom background color class.');
                    assertInlineColor(dupReverseVideo, 'foreground', new color_1.RGBA(167, 168, 169), 'After second Reverse Video - Reversed 24-bit RGBA ANSI foreground color code (167,168,169) should add matching former background color inline style.');
                    assert(dupReverseVideo.classList.contains('code-foreground-colored'), 'After second Reverse Video - Still Foreground ANSI color codes should add custom foreground color class.');
                    assertInlineColor(dupReverseVideo, 'background', new color_1.RGBA(10, 20, 30), 'After second Reverse Video - Reversed 24-bit RGBA ANSI background color code (10,20,30) should add matching former foreground color inline style.');
                },
                (reversedBack) => {
                    assert.strictEqual(2, reversedBack.classList.length, 'Reversed Back - background ANSI color codes should only add a single class.');
                    assert(reversedBack.classList.contains('code-background-colored'), 'Reversed Back - Background ANSI color codes should add custom background color class.');
                    assertInlineColor(reversedBack, 'background', new color_1.RGBA(167, 168, 169), 'Reversed Back - 24-bit RGBA ANSI background color code (167,168,169) should add matching color inline style.');
                    assert(reversedBack.classList.contains('code-foreground-colored'), 'Reversed Back -  Foreground ANSI color codes should add custom foreground color class.');
                    assertInlineColor(reversedBack, 'foreground', new color_1.RGBA(10, 20, 30), 'Reversed Back -  24-bit RGBA ANSI color code (10,20,30) should add matching color inline style.');
                },
                (dupReversedBack) => {
                    assert.strictEqual(2, dupReversedBack.classList.length, '2nd Reversed Back - background ANSI color codes should only add a single class.');
                    assert(dupReversedBack.classList.contains('code-background-colored'), '2nd Reversed Back - Background ANSI color codes should add custom background color class.');
                    assertInlineColor(dupReversedBack, 'background', new color_1.RGBA(167, 168, 169), '2nd Reversed Back - 24-bit RGBA ANSI background color code (167,168,169) should add matching color inline style.');
                    assert(dupReversedBack.classList.contains('code-foreground-colored'), '2nd Reversed Back -  Foreground ANSI color codes should add custom foreground color class.');
                    assertInlineColor(dupReversedBack, 'foreground', new color_1.RGBA(10, 20, 30), '2nd Reversed Back -  24-bit RGBA ANSI color code (10,20,30) should add matching color inline style.');
                },
            ], 6);
            // Reverse video reverses Foreground/Background colors WITH ONLY foreground color SET
            assertMultipleSequenceElements('\x1b[38;2;10;20;30mfg10,20,30\x1b[7m8ReverseVideo\x1b[27mReverseOff', [
                (fg10_20_30) => {
                    assert.strictEqual(1, fg10_20_30.classList.length, 'Foreground ANSI color code should add one class.');
                    assert(fg10_20_30.classList.contains('code-foreground-colored'), 'Foreground ANSI color codes should add custom foreground color class.');
                    assertInlineColor(fg10_20_30, 'foreground', new color_1.RGBA(10, 20, 30), '24-bit RGBA ANSI color code (10,20,30) should add matching color inline style.');
                },
                (reverseVideo) => {
                    assert.strictEqual(1, reverseVideo.classList.length, 'Background ANSI color codes should only add a single class.');
                    assert(reverseVideo.classList.contains('code-background-colored'), 'Background ANSI color codes should add custom background color class.');
                    assert(reverseVideo.classList.contains('code-foreground-colored') === false, 'After Reverse with NO background the Foreground ANSI color codes should NOT BE SET.');
                    assertInlineColor(reverseVideo, 'background', new color_1.RGBA(10, 20, 30), 'Reversed 24-bit RGBA ANSI background color code (10,20,30) should add matching former foreground color inline style.');
                },
                (reversedBack) => {
                    assert.strictEqual(1, reversedBack.classList.length, 'Reversed Back - background ANSI color codes should only add a single class.');
                    assert(reversedBack.classList.contains('code-background-colored') === false, 'AFTER Reversed Back - Background ANSI color should NOT BE SET.');
                    assert(reversedBack.classList.contains('code-foreground-colored'), 'Reversed Back -  Foreground ANSI color codes should add custom foreground color class.');
                    assertInlineColor(reversedBack, 'foreground', new color_1.RGBA(10, 20, 30), 'Reversed Back -  24-bit RGBA ANSI color code (10,20,30) should add matching color inline style.');
                },
            ], 3);
            // Reverse video reverses Foreground/Background colors WITH ONLY background color SET
            assertMultipleSequenceElements('\x1b[48;2;167;168;169mbg167,168,169\x1b[7m8ReverseVideo\x1b[27mReverseOff', [
                (bg167_168_169) => {
                    assert.strictEqual(1, bg167_168_169.classList.length, 'Background ANSI color code should add one class.');
                    assert(bg167_168_169.classList.contains('code-background-colored'), 'Background ANSI color codes should add custom foreground color class.');
                    assertInlineColor(bg167_168_169, 'background', new color_1.RGBA(167, 168, 169), '24-bit RGBA ANSI color code (167, 168, 169) should add matching background color inline style.');
                },
                (reverseVideo) => {
                    assert.strictEqual(1, reverseVideo.classList.length, 'After ReverseVideo Foreground ANSI color codes should only add a single class.');
                    assert(reverseVideo.classList.contains('code-foreground-colored'), 'After ReverseVideo Foreground ANSI color codes should add custom background color class.');
                    assert(reverseVideo.classList.contains('code-background-colored') === false, 'After Reverse with NO foreground color the background ANSI color codes should BE SET.');
                    assertInlineColor(reverseVideo, 'foreground', new color_1.RGBA(167, 168, 169), 'Reversed 24-bit RGBA ANSI background color code (10,20,30) should add matching former background color inline style.');
                },
                (reversedBack) => {
                    assert.strictEqual(1, reversedBack.classList.length, 'Reversed Back - background ANSI color codes should only add a single class.');
                    assert(reversedBack.classList.contains('code-foreground-colored') === false, 'AFTER Reversed Back - Foreground ANSI color should NOT BE SET.');
                    assert(reversedBack.classList.contains('code-background-colored'), 'Reversed Back -  Background ANSI color codes should add custom background color class.');
                    assertInlineColor(reversedBack, 'background', new color_1.RGBA(167, 168, 169), 'Reversed Back -  24-bit RGBA ANSI color code (10,20,30) should add matching background color inline style.');
                },
            ], 3);
            // Underline color Different types of color codes still cancel each other
            assertMultipleSequenceElements('\x1b[58;2;101;102;103m24bitUnderline101,102,103\x1b[58;5;3m8bitsimpleUnderline\x1b[58;2;104;105;106m24bitUnderline104,105,106\x1b[58;5;101m8bitadvanced\x1b[58;2;200;200;200munderline200,200,200\x1b[59mUnderlineColorResetToDefault', [
                (adv24Bit) => {
                    assert.strictEqual(1, adv24Bit.classList.length, 'Underline ANSI color codes should only add a single class (1).');
                    assert(adv24Bit.classList.contains('code-underline-colored'), 'Underline ANSI color codes should add custom underline color class.');
                    assertInlineColor(adv24Bit, 'underline', new color_1.RGBA(101, 102, 103), '24-bit RGBA ANSI color code (101,102,103) should add matching color inline style.');
                },
                (adv8BitSimple) => {
                    assert.strictEqual(1, adv8BitSimple.classList.length, 'Multiple underline ANSI color codes should only add a single class (2).');
                    assert(adv8BitSimple.classList.contains('code-underline-colored'), 'Underline ANSI color codes should add custom underline color class.');
                    // changed to simple theme color, don't know exactly what it should be, but it should NO LONGER BE 101,102,103
                    assertInlineColor(adv8BitSimple, 'underline', new color_1.RGBA(101, 102, 103), 'Change to theme color SHOULD NOT STILL BE 24-bit RGBA ANSI color code (101,102,103) should add matching color inline style.', false);
                },
                (adv24BitAgain) => {
                    assert.strictEqual(1, adv24BitAgain.classList.length, 'Multiple underline ANSI color codes should only add a single class (3).');
                    assert(adv24BitAgain.classList.contains('code-underline-colored'), 'Underline ANSI color codes should add custom underline color class.');
                    assertInlineColor(adv24BitAgain, 'underline', new color_1.RGBA(104, 105, 106), '24-bit RGBA ANSI color code (100,100,100) should add matching color inline style.');
                },
                (adv8BitAdvanced) => {
                    assert.strictEqual(1, adv8BitAdvanced.classList.length, 'Multiple underline ANSI color codes should only add a single class (4).');
                    assert(adv8BitAdvanced.classList.contains('code-underline-colored'), 'Underline ANSI color codes should add custom underline color class.');
                    // changed to 8bit advanced color, don't know exactly what it should be, but it should NO LONGER BE 104,105,106
                    assertInlineColor(adv8BitAdvanced, 'underline', new color_1.RGBA(104, 105, 106), 'Change to theme color SHOULD NOT BE 24-bit RGBA ANSI color code (104,105,106) should add matching color inline style.', false);
                },
                (adv24BitUnderlin200) => {
                    assert.strictEqual(1, adv24BitUnderlin200.classList.length, 'Multiple underline ANSI color codes should only add a single class 4.');
                    assert(adv24BitUnderlin200.classList.contains('code-underline-colored'), 'Underline ANSI color codes should add custom underline color class.');
                    assertInlineColor(adv24BitUnderlin200, 'underline', new color_1.RGBA(200, 200, 200), 'after change underline color SHOULD BE 24-bit RGBA ANSI color code (200,200,200) should add matching color inline style.');
                },
                (underlineColorResetToDefault) => {
                    assert.strictEqual(0, underlineColorResetToDefault.classList.length, 'After Underline Color reset to default NO underline color class should be set.');
                    assertInlineColor(underlineColorResetToDefault, 'underline', undefined, 'after RESET TO DEFAULT underline color SHOULD NOT BE SET (no color inline style.)');
                },
            ], 6);
            // Different types of color codes still cancel each other
            assertMultipleSequenceElements('\x1b[34msimple\x1b[38;2;101;102;103m24bit\x1b[38;5;3m8bitsimple\x1b[38;2;104;105;106m24bitAgain\x1b[38;5;101m8bitadvanced', [
                (simple) => {
                    assert.strictEqual(1, simple.classList.length, 'Foreground ANSI color code should add one class.');
                    assert(simple.classList.contains('code-foreground-colored'), 'Foreground ANSI color codes should add custom foreground color class.');
                },
                (adv24Bit) => {
                    assert.strictEqual(1, adv24Bit.classList.length, 'Multiple foreground ANSI color codes should only add a single class.');
                    assert(adv24Bit.classList.contains('code-foreground-colored'), 'Foreground ANSI color codes should add custom foreground color class.');
                    assertInlineColor(adv24Bit, 'foreground', new color_1.RGBA(101, 102, 103), '24-bit RGBA ANSI color code (101,102,103) should add matching color inline style.');
                },
                (adv8BitSimple) => {
                    assert.strictEqual(1, adv8BitSimple.classList.length, 'Multiple foreground ANSI color codes should only add a single class.');
                    assert(adv8BitSimple.classList.contains('code-foreground-colored'), 'Foreground ANSI color codes should add custom foreground color class.');
                    //color is theme based, so we can't check what it should be but we know it should NOT BE 101,102,103 anymore
                    assertInlineColor(adv8BitSimple, 'foreground', new color_1.RGBA(101, 102, 103), 'SHOULD NOT LONGER BE 24-bit RGBA ANSI color code (101,102,103) after simple color change.', false);
                },
                (adv24BitAgain) => {
                    assert.strictEqual(1, adv24BitAgain.classList.length, 'Multiple foreground ANSI color codes should only add a single class.');
                    assert(adv24BitAgain.classList.contains('code-foreground-colored'), 'Foreground ANSI color codes should add custom foreground color class.');
                    assertInlineColor(adv24BitAgain, 'foreground', new color_1.RGBA(104, 105, 106), '24-bit RGBA ANSI color code (104,105,106) should add matching color inline style.');
                },
                (adv8BitAdvanced) => {
                    assert.strictEqual(1, adv8BitAdvanced.classList.length, 'Multiple foreground ANSI color codes should only add a single class.');
                    assert(adv8BitAdvanced.classList.contains('code-foreground-colored'), 'Foreground ANSI color codes should add custom foreground color class.');
                    // color should NO LONGER BE 104,105,106
                    assertInlineColor(adv8BitAdvanced, 'foreground', new color_1.RGBA(104, 105, 106), 'SHOULD NOT LONGER BE 24-bit RGBA ANSI color code (104,105,106) after advanced color change.', false);
                }
            ], 5);
        });
        /**
         * Assert that the provided ANSI sequence exactly matches the text content of the resulting
         * {@link HTMLSpanElement}.
         *
         * @param sequence The ANSI sequence to verify.
         */
        function assertSequencestrictEqualToContent(sequence) {
            const child = getSequenceOutput(sequence);
            assert(child.textContent === sequence);
        }
        test('Invalid codes treated as regular text', () => {
            // Individual components of ANSI code start are printed
            assertSequencestrictEqualToContent('\x1b');
            assertSequencestrictEqualToContent('[');
            // Unsupported sequence prints both characters
            assertSequencestrictEqualToContent('\x1b[');
            // Random strings are displayed properly
            for (let i = 0; i < 50; i++) {
                const uuid = (0, uuid_1.generateUuid)();
                assertSequencestrictEqualToContent(uuid);
            }
        });
        /**
         * Assert that a given ANSI sequence maintains added content following the ANSI code, and that
         * the expression itself is thrown away.
         *
         * @param sequence The ANSI sequence to verify. The provided sequence should contain ANSI codes
         * only, and should not include actual text content as it is provided by this function.
         */
        function assertEmptyOutput(sequence) {
            const child = getSequenceOutput(sequence + 'content');
            assert.strictEqual('content', child.textContent);
            assert.strictEqual(0, child.classList.length);
        }
        test('Empty sequence output', () => {
            const sequences = [
                // No colour codes
                '',
                '\x1b[;m',
                '\x1b[1;;m',
                '\x1b[m',
                '\x1b[99m'
            ];
            sequences.forEach(sequence => {
                assertEmptyOutput(sequence);
            });
            // Check other possible ANSI terminators
            const terminators = 'ABCDHIJKfhmpsu'.split('');
            terminators.forEach(terminator => {
                assertEmptyOutput('\x1b[content' + terminator);
            });
        });
        test('calcANSI8bitColor', () => {
            // Invalid values
            // Negative (below range), simple range, decimals
            for (let i = -10; i <= 15; i += 0.5) {
                assert((0, debugANSIHandling_1.calcANSI8bitColor)(i) === undefined, 'Values less than 16 passed to calcANSI8bitColor should return undefined.');
            }
            // In-range range decimals
            for (let i = 16.5; i < 254; i += 1) {
                assert((0, debugANSIHandling_1.calcANSI8bitColor)(i) === undefined, 'Floats passed to calcANSI8bitColor should return undefined.');
            }
            // Above range
            for (let i = 256; i < 300; i += 0.5) {
                assert((0, debugANSIHandling_1.calcANSI8bitColor)(i) === undefined, 'Values grather than 255 passed to calcANSI8bitColor should return undefined.');
            }
            // All valid colors
            for (let red = 0; red <= 5; red++) {
                for (let green = 0; green <= 5; green++) {
                    for (let blue = 0; blue <= 5; blue++) {
                        const colorOut = (0, debugANSIHandling_1.calcANSI8bitColor)(16 + red * 36 + green * 6 + blue);
                        assert(colorOut.r === Math.round(red * (255 / 5)), 'Incorrect red value encountered for color');
                        assert(colorOut.g === Math.round(green * (255 / 5)), 'Incorrect green value encountered for color');
                        assert(colorOut.b === Math.round(blue * (255 / 5)), 'Incorrect balue value encountered for color');
                    }
                }
            }
            // All grays
            for (let i = 232; i <= 255; i++) {
                const grayOut = (0, debugANSIHandling_1.calcANSI8bitColor)(i);
                assert(grayOut.r === grayOut.g);
                assert(grayOut.r === grayOut.b);
                assert(grayOut.r === Math.round((i - 232) / 23 * 255));
            }
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdBTlNJSGFuZGxpbmcudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2RlYnVnL3Rlc3QvYnJvd3Nlci9kZWJ1Z0FOU0lIYW5kbGluZy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBbUJoRyxLQUFLLENBQUMsdUJBQXVCLEVBQUUsR0FBRyxFQUFFO1FBRW5DLElBQUksV0FBNEIsQ0FBQztRQUNqQyxJQUFJLEtBQWlCLENBQUM7UUFDdEIsSUFBSSxPQUFxQixDQUFDO1FBQzFCLElBQUksWUFBMEIsQ0FBQztRQUMvQixJQUFJLFlBQTJCLENBQUM7UUFFaEM7O1dBRUc7UUFDSCxLQUFLLENBQUMsR0FBRyxFQUFFO1lBQ1YsV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBQ3BDLEtBQUssR0FBRyxJQUFBLHFDQUFvQixFQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzFDLE9BQU8sR0FBRyxJQUFBLGtDQUFpQixFQUFDLEtBQUssQ0FBQyxDQUFDO1lBRW5DLE1BQU0sb0JBQW9CLEdBQXVELElBQUEscURBQTZCLEVBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ3ZJLFlBQVksR0FBRyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsMkJBQVksQ0FBQyxDQUFDO1lBRWpFLE1BQU0sTUFBTSxHQUE2QixFQUFFLENBQUM7WUFDNUMsS0FBSyxNQUFNLEtBQUssSUFBSSxvQ0FBWSxFQUFFO2dCQUNqQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQVEsb0NBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO2FBQ3ZEO1lBQ0QsTUFBTSxTQUFTLEdBQUcsSUFBSSxpQ0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzdDLFlBQVksR0FBRyxJQUFJLG1DQUFnQixDQUFDLFNBQVMsQ0FBQyxD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