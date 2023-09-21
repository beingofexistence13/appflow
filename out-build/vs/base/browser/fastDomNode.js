/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$GP = exports.$FP = void 0;
    class $FP {
        constructor(domNode) {
            this.domNode = domNode;
            this.a = '';
            this.b = '';
            this.c = '';
            this.d = '';
            this.e = '';
            this.f = '';
            this.g = '';
            this.h = '';
            this.i = '';
            this.j = '';
            this.k = '';
            this.l = '';
            this.m = '';
            this.n = '';
            this.o = '';
            this.p = '';
            this.q = '';
            this.r = '';
            this.s = '';
            this.t = '';
            this.u = '';
            this.v = '';
            this.w = '';
            this.x = '';
            this.y = '';
            this.z = '';
            this.A = false;
            this.B = 'none';
            this.C = '';
        }
        setMaxWidth(_maxWidth) {
            const maxWidth = numberAsPixels(_maxWidth);
            if (this.a === maxWidth) {
                return;
            }
            this.a = maxWidth;
            this.domNode.style.maxWidth = this.a;
        }
        setWidth(_width) {
            const width = numberAsPixels(_width);
            if (this.b === width) {
                return;
            }
            this.b = width;
            this.domNode.style.width = this.b;
        }
        setHeight(_height) {
            const height = numberAsPixels(_height);
            if (this.c === height) {
                return;
            }
            this.c = height;
            this.domNode.style.height = this.c;
        }
        setTop(_top) {
            const top = numberAsPixels(_top);
            if (this.d === top) {
                return;
            }
            this.d = top;
            this.domNode.style.top = this.d;
        }
        setLeft(_left) {
            const left = numberAsPixels(_left);
            if (this.e === left) {
                return;
            }
            this.e = left;
            this.domNode.style.left = this.e;
        }
        setBottom(_bottom) {
            const bottom = numberAsPixels(_bottom);
            if (this.f === bottom) {
                return;
            }
            this.f = bottom;
            this.domNode.style.bottom = this.f;
        }
        setRight(_right) {
            const right = numberAsPixels(_right);
            if (this.g === right) {
                return;
            }
            this.g = right;
            this.domNode.style.right = this.g;
        }
        setPaddingTop(_paddingTop) {
            const paddingTop = numberAsPixels(_paddingTop);
            if (this.h === paddingTop) {
                return;
            }
            this.h = paddingTop;
            this.domNode.style.paddingTop = this.h;
        }
        setPaddingLeft(_paddingLeft) {
            const paddingLeft = numberAsPixels(_paddingLeft);
            if (this.i === paddingLeft) {
                return;
            }
            this.i = paddingLeft;
            this.domNode.style.paddingLeft = this.i;
        }
        setPaddingBottom(_paddingBottom) {
            const paddingBottom = numberAsPixels(_paddingBottom);
            if (this.j === paddingBottom) {
                return;
            }
            this.j = paddingBottom;
            this.domNode.style.paddingBottom = this.j;
        }
        setPaddingRight(_paddingRight) {
            const paddingRight = numberAsPixels(_paddingRight);
            if (this.k === paddingRight) {
                return;
            }
            this.k = paddingRight;
            this.domNode.style.paddingRight = this.k;
        }
        setFontFamily(fontFamily) {
            if (this.l === fontFamily) {
                return;
            }
            this.l = fontFamily;
            this.domNode.style.fontFamily = this.l;
        }
        setFontWeight(fontWeight) {
            if (this.m === fontWeight) {
                return;
            }
            this.m = fontWeight;
            this.domNode.style.fontWeight = this.m;
        }
        setFontSize(_fontSize) {
            const fontSize = numberAsPixels(_fontSize);
            if (this.n === fontSize) {
                return;
            }
            this.n = fontSize;
            this.domNode.style.fontSize = this.n;
        }
        setFontStyle(fontStyle) {
            if (this.o === fontStyle) {
                return;
            }
            this.o = fontStyle;
            this.domNode.style.fontStyle = this.o;
        }
        setFontFeatureSettings(fontFeatureSettings) {
            if (this.p === fontFeatureSettings) {
                return;
            }
            this.p = fontFeatureSettings;
            this.domNode.style.fontFeatureSettings = this.p;
        }
        setFontVariationSettings(fontVariationSettings) {
            if (this.q === fontVariationSettings) {
                return;
            }
            this.q = fontVariationSettings;
            this.domNode.style.fontVariationSettings = this.q;
        }
        setTextDecoration(textDecoration) {
            if (this.r === textDecoration) {
                return;
            }
            this.r = textDecoration;
            this.domNode.style.textDecoration = this.r;
        }
        setLineHeight(_lineHeight) {
            const lineHeight = numberAsPixels(_lineHeight);
            if (this.s === lineHeight) {
                return;
            }
            this.s = lineHeight;
            this.domNode.style.lineHeight = this.s;
        }
        setLetterSpacing(_letterSpacing) {
            const letterSpacing = numberAsPixels(_letterSpacing);
            if (this.t === letterSpacing) {
                return;
            }
            this.t = letterSpacing;
            this.domNode.style.letterSpacing = this.t;
        }
        setClassName(className) {
            if (this.u === className) {
                return;
            }
            this.u = className;
            this.domNode.className = this.u;
        }
        toggleClassName(className, shouldHaveIt) {
            this.domNode.classList.toggle(className, shouldHaveIt);
            this.u = this.domNode.className;
        }
        setDisplay(display) {
            if (this.v === display) {
                return;
            }
            this.v = display;
            this.domNode.style.display = this.v;
        }
        setPosition(position) {
            if (this.w === position) {
                return;
            }
            this.w = position;
            this.domNode.style.position = this.w;
        }
        setVisibility(visibility) {
            if (this.x === visibility) {
                return;
            }
            this.x = visibility;
            this.domNode.style.visibility = this.x;
        }
        setColor(color) {
            if (this.y === color) {
                return;
            }
            this.y = color;
            this.domNode.style.color = this.y;
        }
        setBackgroundColor(backgroundColor) {
            if (this.z === backgroundColor) {
                return;
            }
            this.z = backgroundColor;
            this.domNode.style.backgroundColor = this.z;
        }
        setLayerHinting(layerHint) {
            if (this.A === layerHint) {
                return;
            }
            this.A = layerHint;
            this.domNode.style.transform = this.A ? 'translate3d(0px, 0px, 0px)' : '';
        }
        setBoxShadow(boxShadow) {
            if (this.C === boxShadow) {
                return;
            }
            this.C = boxShadow;
            this.domNode.style.boxShadow = boxShadow;
        }
        setContain(contain) {
            if (this.B === contain) {
                return;
            }
            this.B = contain;
            this.domNode.style.contain = this.B;
        }
        setAttribute(name, value) {
            this.domNode.setAttribute(name, value);
        }
        removeAttribute(name) {
            this.domNode.removeAttribute(name);
        }
        appendChild(child) {
            this.domNode.appendChild(child.domNode);
        }
        removeChild(child) {
            this.domNode.removeChild(child.domNode);
        }
    }
    exports.$FP = $FP;
    function numberAsPixels(value) {
        return (typeof value === 'number' ? `${value}px` : value);
    }
    function $GP(domNode) {
        return new $FP(domNode);
    }
    exports.$GP = $GP;
});
//# sourceMappingURL=fastDomNode.js.map