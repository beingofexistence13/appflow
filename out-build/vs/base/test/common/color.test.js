/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/color"], function (require, exports, assert, color_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Color', () => {
        test('isLighterColor', () => {
            const color1 = new color_1.$Os(new color_1.$Ms(60, 1, 0.5, 1)), color2 = new color_1.$Os(new color_1.$Ms(0, 0, 0.753, 1));
            assert.ok(color1.isLighterThan(color2));
            // Abyss theme
            assert.ok(color_1.$Os.fromHex('#770811').isLighterThan(color_1.$Os.fromHex('#000c18')));
        });
        test('getLighterColor', () => {
            const color1 = new color_1.$Os(new color_1.$Ms(60, 1, 0.5, 1)), color2 = new color_1.$Os(new color_1.$Ms(0, 0, 0.753, 1));
            assert.deepStrictEqual(color1.hsla, color_1.$Os.getLighterColor(color1, color2).hsla);
            assert.deepStrictEqual(new color_1.$Ms(0, 0, 0.916, 1), color_1.$Os.getLighterColor(color2, color1).hsla);
            assert.deepStrictEqual(new color_1.$Ms(0, 0, 0.851, 1), color_1.$Os.getLighterColor(color2, color1, 0.3).hsla);
            assert.deepStrictEqual(new color_1.$Ms(0, 0, 0.981, 1), color_1.$Os.getLighterColor(color2, color1, 0.7).hsla);
            assert.deepStrictEqual(new color_1.$Ms(0, 0, 1, 1), color_1.$Os.getLighterColor(color2, color1, 1).hsla);
        });
        test('isDarkerColor', () => {
            const color1 = new color_1.$Os(new color_1.$Ms(60, 1, 0.5, 1)), color2 = new color_1.$Os(new color_1.$Ms(0, 0, 0.753, 1));
            assert.ok(color2.isDarkerThan(color1));
        });
        test('getDarkerColor', () => {
            const color1 = new color_1.$Os(new color_1.$Ms(60, 1, 0.5, 1)), color2 = new color_1.$Os(new color_1.$Ms(0, 0, 0.753, 1));
            assert.deepStrictEqual(color2.hsla, color_1.$Os.getDarkerColor(color2, color1).hsla);
            assert.deepStrictEqual(new color_1.$Ms(60, 1, 0.392, 1), color_1.$Os.getDarkerColor(color1, color2).hsla);
            assert.deepStrictEqual(new color_1.$Ms(60, 1, 0.435, 1), color_1.$Os.getDarkerColor(color1, color2, 0.3).hsla);
            assert.deepStrictEqual(new color_1.$Ms(60, 1, 0.349, 1), color_1.$Os.getDarkerColor(color1, color2, 0.7).hsla);
            assert.deepStrictEqual(new color_1.$Ms(60, 1, 0.284, 1), color_1.$Os.getDarkerColor(color1, color2, 1).hsla);
            // Abyss theme
            assert.deepStrictEqual(new color_1.$Ms(355, 0.874, 0.157, 1), color_1.$Os.getDarkerColor(color_1.$Os.fromHex('#770811'), color_1.$Os.fromHex('#000c18'), 0.4).hsla);
        });
        test('luminance', () => {
            assert.deepStrictEqual(0, new color_1.$Os(new color_1.$Ls(0, 0, 0, 1)).getRelativeLuminance());
            assert.deepStrictEqual(1, new color_1.$Os(new color_1.$Ls(255, 255, 255, 1)).getRelativeLuminance());
            assert.deepStrictEqual(0.2126, new color_1.$Os(new color_1.$Ls(255, 0, 0, 1)).getRelativeLuminance());
            assert.deepStrictEqual(0.7152, new color_1.$Os(new color_1.$Ls(0, 255, 0, 1)).getRelativeLuminance());
            assert.deepStrictEqual(0.0722, new color_1.$Os(new color_1.$Ls(0, 0, 255, 1)).getRelativeLuminance());
            assert.deepStrictEqual(0.9278, new color_1.$Os(new color_1.$Ls(255, 255, 0, 1)).getRelativeLuminance());
            assert.deepStrictEqual(0.7874, new color_1.$Os(new color_1.$Ls(0, 255, 255, 1)).getRelativeLuminance());
            assert.deepStrictEqual(0.2848, new color_1.$Os(new color_1.$Ls(255, 0, 255, 1)).getRelativeLuminance());
            assert.deepStrictEqual(0.5271, new color_1.$Os(new color_1.$Ls(192, 192, 192, 1)).getRelativeLuminance());
            assert.deepStrictEqual(0.2159, new color_1.$Os(new color_1.$Ls(128, 128, 128, 1)).getRelativeLuminance());
            assert.deepStrictEqual(0.0459, new color_1.$Os(new color_1.$Ls(128, 0, 0, 1)).getRelativeLuminance());
            assert.deepStrictEqual(0.2003, new color_1.$Os(new color_1.$Ls(128, 128, 0, 1)).getRelativeLuminance());
            assert.deepStrictEqual(0.1544, new color_1.$Os(new color_1.$Ls(0, 128, 0, 1)).getRelativeLuminance());
            assert.deepStrictEqual(0.0615, new color_1.$Os(new color_1.$Ls(128, 0, 128, 1)).getRelativeLuminance());
            assert.deepStrictEqual(0.17, new color_1.$Os(new color_1.$Ls(0, 128, 128, 1)).getRelativeLuminance());
            assert.deepStrictEqual(0.0156, new color_1.$Os(new color_1.$Ls(0, 0, 128, 1)).getRelativeLuminance());
        });
        test('blending', () => {
            assert.deepStrictEqual(new color_1.$Os(new color_1.$Ls(0, 0, 0, 0)).blend(new color_1.$Os(new color_1.$Ls(243, 34, 43))), new color_1.$Os(new color_1.$Ls(243, 34, 43)));
            assert.deepStrictEqual(new color_1.$Os(new color_1.$Ls(255, 255, 255)).blend(new color_1.$Os(new color_1.$Ls(243, 34, 43))), new color_1.$Os(new color_1.$Ls(255, 255, 255)));
            assert.deepStrictEqual(new color_1.$Os(new color_1.$Ls(122, 122, 122, 0.7)).blend(new color_1.$Os(new color_1.$Ls(243, 34, 43))), new color_1.$Os(new color_1.$Ls(158, 95, 98)));
            assert.deepStrictEqual(new color_1.$Os(new color_1.$Ls(0, 0, 0, 0.58)).blend(new color_1.$Os(new color_1.$Ls(255, 255, 255, 0.33))), new color_1.$Os(new color_1.$Ls(49, 49, 49, 0.719)));
        });
        suite('HSLA', () => {
            test('HSLA.toRGBA', () => {
                assert.deepStrictEqual(color_1.$Ms.toRGBA(new color_1.$Ms(0, 0, 0, 0)), new color_1.$Ls(0, 0, 0, 0));
                assert.deepStrictEqual(color_1.$Ms.toRGBA(new color_1.$Ms(0, 0, 0, 1)), new color_1.$Ls(0, 0, 0, 1));
                assert.deepStrictEqual(color_1.$Ms.toRGBA(new color_1.$Ms(0, 0, 1, 1)), new color_1.$Ls(255, 255, 255, 1));
                assert.deepStrictEqual(color_1.$Ms.toRGBA(new color_1.$Ms(0, 1, 0.5, 1)), new color_1.$Ls(255, 0, 0, 1));
                assert.deepStrictEqual(color_1.$Ms.toRGBA(new color_1.$Ms(120, 1, 0.5, 1)), new color_1.$Ls(0, 255, 0, 1));
                assert.deepStrictEqual(color_1.$Ms.toRGBA(new color_1.$Ms(240, 1, 0.5, 1)), new color_1.$Ls(0, 0, 255, 1));
                assert.deepStrictEqual(color_1.$Ms.toRGBA(new color_1.$Ms(60, 1, 0.5, 1)), new color_1.$Ls(255, 255, 0, 1));
                assert.deepStrictEqual(color_1.$Ms.toRGBA(new color_1.$Ms(180, 1, 0.5, 1)), new color_1.$Ls(0, 255, 255, 1));
                assert.deepStrictEqual(color_1.$Ms.toRGBA(new color_1.$Ms(300, 1, 0.5, 1)), new color_1.$Ls(255, 0, 255, 1));
                assert.deepStrictEqual(color_1.$Ms.toRGBA(new color_1.$Ms(0, 0, 0.753, 1)), new color_1.$Ls(192, 192, 192, 1));
                assert.deepStrictEqual(color_1.$Ms.toRGBA(new color_1.$Ms(0, 0, 0.502, 1)), new color_1.$Ls(128, 128, 128, 1));
                assert.deepStrictEqual(color_1.$Ms.toRGBA(new color_1.$Ms(0, 1, 0.251, 1)), new color_1.$Ls(128, 0, 0, 1));
                assert.deepStrictEqual(color_1.$Ms.toRGBA(new color_1.$Ms(60, 1, 0.251, 1)), new color_1.$Ls(128, 128, 0, 1));
                assert.deepStrictEqual(color_1.$Ms.toRGBA(new color_1.$Ms(120, 1, 0.251, 1)), new color_1.$Ls(0, 128, 0, 1));
                assert.deepStrictEqual(color_1.$Ms.toRGBA(new color_1.$Ms(300, 1, 0.251, 1)), new color_1.$Ls(128, 0, 128, 1));
                assert.deepStrictEqual(color_1.$Ms.toRGBA(new color_1.$Ms(180, 1, 0.251, 1)), new color_1.$Ls(0, 128, 128, 1));
                assert.deepStrictEqual(color_1.$Ms.toRGBA(new color_1.$Ms(240, 1, 0.251, 1)), new color_1.$Ls(0, 0, 128, 1));
            });
            test('HSLA.fromRGBA', () => {
                assert.deepStrictEqual(color_1.$Ms.fromRGBA(new color_1.$Ls(0, 0, 0, 0)), new color_1.$Ms(0, 0, 0, 0));
                assert.deepStrictEqual(color_1.$Ms.fromRGBA(new color_1.$Ls(0, 0, 0, 1)), new color_1.$Ms(0, 0, 0, 1));
                assert.deepStrictEqual(color_1.$Ms.fromRGBA(new color_1.$Ls(255, 255, 255, 1)), new color_1.$Ms(0, 0, 1, 1));
                assert.deepStrictEqual(color_1.$Ms.fromRGBA(new color_1.$Ls(255, 0, 0, 1)), new color_1.$Ms(0, 1, 0.5, 1));
                assert.deepStrictEqual(color_1.$Ms.fromRGBA(new color_1.$Ls(0, 255, 0, 1)), new color_1.$Ms(120, 1, 0.5, 1));
                assert.deepStrictEqual(color_1.$Ms.fromRGBA(new color_1.$Ls(0, 0, 255, 1)), new color_1.$Ms(240, 1, 0.5, 1));
                assert.deepStrictEqual(color_1.$Ms.fromRGBA(new color_1.$Ls(255, 255, 0, 1)), new color_1.$Ms(60, 1, 0.5, 1));
                assert.deepStrictEqual(color_1.$Ms.fromRGBA(new color_1.$Ls(0, 255, 255, 1)), new color_1.$Ms(180, 1, 0.5, 1));
                assert.deepStrictEqual(color_1.$Ms.fromRGBA(new color_1.$Ls(255, 0, 255, 1)), new color_1.$Ms(300, 1, 0.5, 1));
                assert.deepStrictEqual(color_1.$Ms.fromRGBA(new color_1.$Ls(192, 192, 192, 1)), new color_1.$Ms(0, 0, 0.753, 1));
                assert.deepStrictEqual(color_1.$Ms.fromRGBA(new color_1.$Ls(128, 128, 128, 1)), new color_1.$Ms(0, 0, 0.502, 1));
                assert.deepStrictEqual(color_1.$Ms.fromRGBA(new color_1.$Ls(128, 0, 0, 1)), new color_1.$Ms(0, 1, 0.251, 1));
                assert.deepStrictEqual(color_1.$Ms.fromRGBA(new color_1.$Ls(128, 128, 0, 1)), new color_1.$Ms(60, 1, 0.251, 1));
                assert.deepStrictEqual(color_1.$Ms.fromRGBA(new color_1.$Ls(0, 128, 0, 1)), new color_1.$Ms(120, 1, 0.251, 1));
                assert.deepStrictEqual(color_1.$Ms.fromRGBA(new color_1.$Ls(128, 0, 128, 1)), new color_1.$Ms(300, 1, 0.251, 1));
                assert.deepStrictEqual(color_1.$Ms.fromRGBA(new color_1.$Ls(0, 128, 128, 1)), new color_1.$Ms(180, 1, 0.251, 1));
                assert.deepStrictEqual(color_1.$Ms.fromRGBA(new color_1.$Ls(0, 0, 128, 1)), new color_1.$Ms(240, 1, 0.251, 1));
            });
        });
        suite('HSVA', () => {
            test('HSVA.toRGBA', () => {
                assert.deepStrictEqual(color_1.$Ns.toRGBA(new color_1.$Ns(0, 0, 0, 0)), new color_1.$Ls(0, 0, 0, 0));
                assert.deepStrictEqual(color_1.$Ns.toRGBA(new color_1.$Ns(0, 0, 0, 1)), new color_1.$Ls(0, 0, 0, 1));
                assert.deepStrictEqual(color_1.$Ns.toRGBA(new color_1.$Ns(0, 0, 1, 1)), new color_1.$Ls(255, 255, 255, 1));
                assert.deepStrictEqual(color_1.$Ns.toRGBA(new color_1.$Ns(0, 1, 1, 1)), new color_1.$Ls(255, 0, 0, 1));
                assert.deepStrictEqual(color_1.$Ns.toRGBA(new color_1.$Ns(120, 1, 1, 1)), new color_1.$Ls(0, 255, 0, 1));
                assert.deepStrictEqual(color_1.$Ns.toRGBA(new color_1.$Ns(240, 1, 1, 1)), new color_1.$Ls(0, 0, 255, 1));
                assert.deepStrictEqual(color_1.$Ns.toRGBA(new color_1.$Ns(60, 1, 1, 1)), new color_1.$Ls(255, 255, 0, 1));
                assert.deepStrictEqual(color_1.$Ns.toRGBA(new color_1.$Ns(180, 1, 1, 1)), new color_1.$Ls(0, 255, 255, 1));
                assert.deepStrictEqual(color_1.$Ns.toRGBA(new color_1.$Ns(300, 1, 1, 1)), new color_1.$Ls(255, 0, 255, 1));
                assert.deepStrictEqual(color_1.$Ns.toRGBA(new color_1.$Ns(0, 0, 0.753, 1)), new color_1.$Ls(192, 192, 192, 1));
                assert.deepStrictEqual(color_1.$Ns.toRGBA(new color_1.$Ns(0, 0, 0.502, 1)), new color_1.$Ls(128, 128, 128, 1));
                assert.deepStrictEqual(color_1.$Ns.toRGBA(new color_1.$Ns(0, 1, 0.502, 1)), new color_1.$Ls(128, 0, 0, 1));
                assert.deepStrictEqual(color_1.$Ns.toRGBA(new color_1.$Ns(60, 1, 0.502, 1)), new color_1.$Ls(128, 128, 0, 1));
                assert.deepStrictEqual(color_1.$Ns.toRGBA(new color_1.$Ns(120, 1, 0.502, 1)), new color_1.$Ls(0, 128, 0, 1));
                assert.deepStrictEqual(color_1.$Ns.toRGBA(new color_1.$Ns(300, 1, 0.502, 1)), new color_1.$Ls(128, 0, 128, 1));
                assert.deepStrictEqual(color_1.$Ns.toRGBA(new color_1.$Ns(180, 1, 0.502, 1)), new color_1.$Ls(0, 128, 128, 1));
                assert.deepStrictEqual(color_1.$Ns.toRGBA(new color_1.$Ns(240, 1, 0.502, 1)), new color_1.$Ls(0, 0, 128, 1));
                assert.deepStrictEqual(color_1.$Ns.toRGBA(new color_1.$Ns(360, 0, 0, 0)), new color_1.$Ls(0, 0, 0, 0));
                assert.deepStrictEqual(color_1.$Ns.toRGBA(new color_1.$Ns(360, 0, 0, 1)), new color_1.$Ls(0, 0, 0, 1));
                assert.deepStrictEqual(color_1.$Ns.toRGBA(new color_1.$Ns(360, 0, 1, 1)), new color_1.$Ls(255, 255, 255, 1));
                assert.deepStrictEqual(color_1.$Ns.toRGBA(new color_1.$Ns(360, 1, 1, 1)), new color_1.$Ls(255, 0, 0, 1));
                assert.deepStrictEqual(color_1.$Ns.toRGBA(new color_1.$Ns(360, 0, 0.753, 1)), new color_1.$Ls(192, 192, 192, 1));
                assert.deepStrictEqual(color_1.$Ns.toRGBA(new color_1.$Ns(360, 0, 0.502, 1)), new color_1.$Ls(128, 128, 128, 1));
                assert.deepStrictEqual(color_1.$Ns.toRGBA(new color_1.$Ns(360, 1, 0.502, 1)), new color_1.$Ls(128, 0, 0, 1));
            });
            test('HSVA.fromRGBA', () => {
                assert.deepStrictEqual(color_1.$Ns.fromRGBA(new color_1.$Ls(0, 0, 0, 0)), new color_1.$Ns(0, 0, 0, 0));
                assert.deepStrictEqual(color_1.$Ns.fromRGBA(new color_1.$Ls(0, 0, 0, 1)), new color_1.$Ns(0, 0, 0, 1));
                assert.deepStrictEqual(color_1.$Ns.fromRGBA(new color_1.$Ls(255, 255, 255, 1)), new color_1.$Ns(0, 0, 1, 1));
                assert.deepStrictEqual(color_1.$Ns.fromRGBA(new color_1.$Ls(255, 0, 0, 1)), new color_1.$Ns(0, 1, 1, 1));
                assert.deepStrictEqual(color_1.$Ns.fromRGBA(new color_1.$Ls(0, 255, 0, 1)), new color_1.$Ns(120, 1, 1, 1));
                assert.deepStrictEqual(color_1.$Ns.fromRGBA(new color_1.$Ls(0, 0, 255, 1)), new color_1.$Ns(240, 1, 1, 1));
                assert.deepStrictEqual(color_1.$Ns.fromRGBA(new color_1.$Ls(255, 255, 0, 1)), new color_1.$Ns(60, 1, 1, 1));
                assert.deepStrictEqual(color_1.$Ns.fromRGBA(new color_1.$Ls(0, 255, 255, 1)), new color_1.$Ns(180, 1, 1, 1));
                assert.deepStrictEqual(color_1.$Ns.fromRGBA(new color_1.$Ls(255, 0, 255, 1)), new color_1.$Ns(300, 1, 1, 1));
                assert.deepStrictEqual(color_1.$Ns.fromRGBA(new color_1.$Ls(192, 192, 192, 1)), new color_1.$Ns(0, 0, 0.753, 1));
                assert.deepStrictEqual(color_1.$Ns.fromRGBA(new color_1.$Ls(128, 128, 128, 1)), new color_1.$Ns(0, 0, 0.502, 1));
                assert.deepStrictEqual(color_1.$Ns.fromRGBA(new color_1.$Ls(128, 0, 0, 1)), new color_1.$Ns(0, 1, 0.502, 1));
                assert.deepStrictEqual(color_1.$Ns.fromRGBA(new color_1.$Ls(128, 128, 0, 1)), new color_1.$Ns(60, 1, 0.502, 1));
                assert.deepStrictEqual(color_1.$Ns.fromRGBA(new color_1.$Ls(0, 128, 0, 1)), new color_1.$Ns(120, 1, 0.502, 1));
                assert.deepStrictEqual(color_1.$Ns.fromRGBA(new color_1.$Ls(128, 0, 128, 1)), new color_1.$Ns(300, 1, 0.502, 1));
                assert.deepStrictEqual(color_1.$Ns.fromRGBA(new color_1.$Ls(0, 128, 128, 1)), new color_1.$Ns(180, 1, 0.502, 1));
                assert.deepStrictEqual(color_1.$Ns.fromRGBA(new color_1.$Ls(0, 0, 128, 1)), new color_1.$Ns(240, 1, 0.502, 1));
            });
            test('Keep hue value when saturation is 0', () => {
                assert.deepStrictEqual(color_1.$Ns.toRGBA(new color_1.$Ns(10, 0, 0, 0)), color_1.$Ns.toRGBA(new color_1.$Ns(20, 0, 0, 0)));
                assert.deepStrictEqual(new color_1.$Os(new color_1.$Ns(10, 0, 0, 0)).rgba, new color_1.$Os(new color_1.$Ns(20, 0, 0, 0)).rgba);
                assert.notDeepStrictEqual(new color_1.$Os(new color_1.$Ns(10, 0, 0, 0)).hsva, new color_1.$Os(new color_1.$Ns(20, 0, 0, 0)).hsva);
            });
            test('bug#36240', () => {
                assert.deepStrictEqual(color_1.$Ns.fromRGBA(new color_1.$Ls(92, 106, 196, 1)), new color_1.$Ns(232, 0.531, 0.769, 1));
                assert.deepStrictEqual(color_1.$Ns.toRGBA(color_1.$Ns.fromRGBA(new color_1.$Ls(92, 106, 196, 1))), new color_1.$Ls(92, 106, 196, 1));
            });
        });
        suite('Format', () => {
            suite('CSS', () => {
                test('parseHex', () => {
                    // invalid
                    assert.deepStrictEqual(color_1.$Os.Format.CSS.parseHex(''), null);
                    assert.deepStrictEqual(color_1.$Os.Format.CSS.parseHex('#'), null);
                    assert.deepStrictEqual(color_1.$Os.Format.CSS.parseHex('#0102030'), null);
                    // somewhat valid
                    assert.deepStrictEqual(color_1.$Os.Format.CSS.parseHex('#FFFFG0').rgba, new color_1.$Ls(255, 255, 0, 1));
                    assert.deepStrictEqual(color_1.$Os.Format.CSS.parseHex('#FFFFg0').rgba, new color_1.$Ls(255, 255, 0, 1));
                    assert.deepStrictEqual(color_1.$Os.Format.CSS.parseHex('#-FFF00').rgba, new color_1.$Ls(15, 255, 0, 1));
                    // valid
                    assert.deepStrictEqual(color_1.$Os.Format.CSS.parseHex('#000000').rgba, new color_1.$Ls(0, 0, 0, 1));
                    assert.deepStrictEqual(color_1.$Os.Format.CSS.parseHex('#FFFFFF').rgba, new color_1.$Ls(255, 255, 255, 1));
                    assert.deepStrictEqual(color_1.$Os.Format.CSS.parseHex('#FF0000').rgba, new color_1.$Ls(255, 0, 0, 1));
                    assert.deepStrictEqual(color_1.$Os.Format.CSS.parseHex('#00FF00').rgba, new color_1.$Ls(0, 255, 0, 1));
                    assert.deepStrictEqual(color_1.$Os.Format.CSS.parseHex('#0000FF').rgba, new color_1.$Ls(0, 0, 255, 1));
                    assert.deepStrictEqual(color_1.$Os.Format.CSS.parseHex('#FFFF00').rgba, new color_1.$Ls(255, 255, 0, 1));
                    assert.deepStrictEqual(color_1.$Os.Format.CSS.parseHex('#00FFFF').rgba, new color_1.$Ls(0, 255, 255, 1));
                    assert.deepStrictEqual(color_1.$Os.Format.CSS.parseHex('#FF00FF').rgba, new color_1.$Ls(255, 0, 255, 1));
                    assert.deepStrictEqual(color_1.$Os.Format.CSS.parseHex('#C0C0C0').rgba, new color_1.$Ls(192, 192, 192, 1));
                    assert.deepStrictEqual(color_1.$Os.Format.CSS.parseHex('#808080').rgba, new color_1.$Ls(128, 128, 128, 1));
                    assert.deepStrictEqual(color_1.$Os.Format.CSS.parseHex('#800000').rgba, new color_1.$Ls(128, 0, 0, 1));
                    assert.deepStrictEqual(color_1.$Os.Format.CSS.parseHex('#808000').rgba, new color_1.$Ls(128, 128, 0, 1));
                    assert.deepStrictEqual(color_1.$Os.Format.CSS.parseHex('#008000').rgba, new color_1.$Ls(0, 128, 0, 1));
                    assert.deepStrictEqual(color_1.$Os.Format.CSS.parseHex('#800080').rgba, new color_1.$Ls(128, 0, 128, 1));
                    assert.deepStrictEqual(color_1.$Os.Format.CSS.parseHex('#008080').rgba, new color_1.$Ls(0, 128, 128, 1));
                    assert.deepStrictEqual(color_1.$Os.Format.CSS.parseHex('#000080').rgba, new color_1.$Ls(0, 0, 128, 1));
                    assert.deepStrictEqual(color_1.$Os.Format.CSS.parseHex('#010203').rgba, new color_1.$Ls(1, 2, 3, 1));
                    assert.deepStrictEqual(color_1.$Os.Format.CSS.parseHex('#040506').rgba, new color_1.$Ls(4, 5, 6, 1));
                    assert.deepStrictEqual(color_1.$Os.Format.CSS.parseHex('#070809').rgba, new color_1.$Ls(7, 8, 9, 1));
                    assert.deepStrictEqual(color_1.$Os.Format.CSS.parseHex('#0a0A0a').rgba, new color_1.$Ls(10, 10, 10, 1));
                    assert.deepStrictEqual(color_1.$Os.Format.CSS.parseHex('#0b0B0b').rgba, new color_1.$Ls(11, 11, 11, 1));
                    assert.deepStrictEqual(color_1.$Os.Format.CSS.parseHex('#0c0C0c').rgba, new color_1.$Ls(12, 12, 12, 1));
                    assert.deepStrictEqual(color_1.$Os.Format.CSS.parseHex('#0d0D0d').rgba, new color_1.$Ls(13, 13, 13, 1));
                    assert.deepStrictEqual(color_1.$Os.Format.CSS.parseHex('#0e0E0e').rgba, new color_1.$Ls(14, 14, 14, 1));
                    assert.deepStrictEqual(color_1.$Os.Format.CSS.parseHex('#0f0F0f').rgba, new color_1.$Ls(15, 15, 15, 1));
                    assert.deepStrictEqual(color_1.$Os.Format.CSS.parseHex('#a0A0a0').rgba, new color_1.$Ls(160, 160, 160, 1));
                    assert.deepStrictEqual(color_1.$Os.Format.CSS.parseHex('#CFA').rgba, new color_1.$Ls(204, 255, 170, 1));
                    assert.deepStrictEqual(color_1.$Os.Format.CSS.parseHex('#CFA8').rgba, new color_1.$Ls(204, 255, 170, 0.533));
                });
            });
        });
    });
});
//# sourceMappingURL=color.test.js.map