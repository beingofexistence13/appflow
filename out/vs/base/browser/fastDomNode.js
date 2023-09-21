/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createFastDomNode = exports.FastDomNode = void 0;
    class FastDomNode {
        constructor(domNode) {
            this.domNode = domNode;
            this._maxWidth = '';
            this._width = '';
            this._height = '';
            this._top = '';
            this._left = '';
            this._bottom = '';
            this._right = '';
            this._paddingTop = '';
            this._paddingLeft = '';
            this._paddingBottom = '';
            this._paddingRight = '';
            this._fontFamily = '';
            this._fontWeight = '';
            this._fontSize = '';
            this._fontStyle = '';
            this._fontFeatureSettings = '';
            this._fontVariationSettings = '';
            this._textDecoration = '';
            this._lineHeight = '';
            this._letterSpacing = '';
            this._className = '';
            this._display = '';
            this._position = '';
            this._visibility = '';
            this._color = '';
            this._backgroundColor = '';
            this._layerHint = false;
            this._contain = 'none';
            this._boxShadow = '';
        }
        setMaxWidth(_maxWidth) {
            const maxWidth = numberAsPixels(_maxWidth);
            if (this._maxWidth === maxWidth) {
                return;
            }
            this._maxWidth = maxWidth;
            this.domNode.style.maxWidth = this._maxWidth;
        }
        setWidth(_width) {
            const width = numberAsPixels(_width);
            if (this._width === width) {
                return;
            }
            this._width = width;
            this.domNode.style.width = this._width;
        }
        setHeight(_height) {
            const height = numberAsPixels(_height);
            if (this._height === height) {
                return;
            }
            this._height = height;
            this.domNode.style.height = this._height;
        }
        setTop(_top) {
            const top = numberAsPixels(_top);
            if (this._top === top) {
                return;
            }
            this._top = top;
            this.domNode.style.top = this._top;
        }
        setLeft(_left) {
            const left = numberAsPixels(_left);
            if (this._left === left) {
                return;
            }
            this._left = left;
            this.domNode.style.left = this._left;
        }
        setBottom(_bottom) {
            const bottom = numberAsPixels(_bottom);
            if (this._bottom === bottom) {
                return;
            }
            this._bottom = bottom;
            this.domNode.style.bottom = this._bottom;
        }
        setRight(_right) {
            const right = numberAsPixels(_right);
            if (this._right === right) {
                return;
            }
            this._right = right;
            this.domNode.style.right = this._right;
        }
        setPaddingTop(_paddingTop) {
            const paddingTop = numberAsPixels(_paddingTop);
            if (this._paddingTop === paddingTop) {
                return;
            }
            this._paddingTop = paddingTop;
            this.domNode.style.paddingTop = this._paddingTop;
        }
        setPaddingLeft(_paddingLeft) {
            const paddingLeft = numberAsPixels(_paddingLeft);
            if (this._paddingLeft === paddingLeft) {
                return;
            }
            this._paddingLeft = paddingLeft;
            this.domNode.style.paddingLeft = this._paddingLeft;
        }
        setPaddingBottom(_paddingBottom) {
            const paddingBottom = numberAsPixels(_paddingBottom);
            if (this._paddingBottom === paddingBottom) {
                return;
            }
            this._paddingBottom = paddingBottom;
            this.domNode.style.paddingBottom = this._paddingBottom;
        }
        setPaddingRight(_paddingRight) {
            const paddingRight = numberAsPixels(_paddingRight);
            if (this._paddingRight === paddingRight) {
                return;
            }
            this._paddingRight = paddingRight;
            this.domNode.style.paddingRight = this._paddingRight;
        }
        setFontFamily(fontFamily) {
            if (this._fontFamily === fontFamily) {
                return;
            }
            this._fontFamily = fontFamily;
            this.domNode.style.fontFamily = this._fontFamily;
        }
        setFontWeight(fontWeight) {
            if (this._fontWeight === fontWeight) {
                return;
            }
            this._fontWeight = fontWeight;
            this.domNode.style.fontWeight = this._fontWeight;
        }
        setFontSize(_fontSize) {
            const fontSize = numberAsPixels(_fontSize);
            if (this._fontSize === fontSize) {
                return;
            }
            this._fontSize = fontSize;
            this.domNode.style.fontSize = this._fontSize;
        }
        setFontStyle(fontStyle) {
            if (this._fontStyle === fontStyle) {
                return;
            }
            this._fontStyle = fontStyle;
            this.domNode.style.fontStyle = this._fontStyle;
        }
        setFontFeatureSettings(fontFeatureSettings) {
            if (this._fontFeatureSettings === fontFeatureSettings) {
                return;
            }
            this._fontFeatureSettings = fontFeatureSettings;
            this.domNode.style.fontFeatureSettings = this._fontFeatureSettings;
        }
        setFontVariationSettings(fontVariationSettings) {
            if (this._fontVariationSettings === fontVariationSettings) {
                return;
            }
            this._fontVariationSettings = fontVariationSettings;
            this.domNode.style.fontVariationSettings = this._fontVariationSettings;
        }
        setTextDecoration(textDecoration) {
            if (this._textDecoration === textDecoration) {
                return;
            }
            this._textDecoration = textDecoration;
            this.domNode.style.textDecoration = this._textDecoration;
        }
        setLineHeight(_lineHeight) {
            const lineHeight = numberAsPixels(_lineHeight);
            if (this._lineHeight === lineHeight) {
                return;
            }
            this._lineHeight = lineHeight;
            this.domNode.style.lineHeight = this._lineHeight;
        }
        setLetterSpacing(_letterSpacing) {
            const letterSpacing = numberAsPixels(_letterSpacing);
            if (this._letterSpacing === letterSpacing) {
                return;
            }
            this._letterSpacing = letterSpacing;
            this.domNode.style.letterSpacing = this._letterSpacing;
        }
        setClassName(className) {
            if (this._className === className) {
                return;
            }
            this._className = className;
            this.domNode.className = this._className;
        }
        toggleClassName(className, shouldHaveIt) {
            this.domNode.classList.toggle(className, shouldHaveIt);
            this._className = this.domNode.className;
        }
        setDisplay(display) {
            if (this._display === display) {
                return;
            }
            this._display = display;
            this.domNode.style.display = this._display;
        }
        setPosition(position) {
            if (this._position === position) {
                return;
            }
            this._position = position;
            this.domNode.style.position = this._position;
        }
        setVisibility(visibility) {
            if (this._visibility === visibility) {
                return;
            }
            this._visibility = visibility;
            this.domNode.style.visibility = this._visibility;
        }
        setColor(color) {
            if (this._color === color) {
                return;
            }
            this._color = color;
            this.domNode.style.color = this._color;
        }
        setBackgroundColor(backgroundColor) {
            if (this._backgroundColor === backgroundColor) {
                return;
            }
            this._backgroundColor = backgroundColor;
            this.domNode.style.backgroundColor = this._backgroundColor;
        }
        setLayerHinting(layerHint) {
            if (this._layerHint === layerHint) {
                return;
            }
            this._layerHint = layerHint;
            this.domNode.style.transform = this._layerHint ? 'translate3d(0px, 0px, 0px)' : '';
        }
        setBoxShadow(boxShadow) {
            if (this._boxShadow === boxShadow) {
                return;
            }
            this._boxShadow = boxShadow;
            this.domNode.style.boxShadow = boxShadow;
        }
        setContain(contain) {
            if (this._contain === contain) {
                return;
            }
            this._contain = contain;
            this.domNode.style.contain = this._contain;
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
    exports.FastDomNode = FastDomNode;
    function numberAsPixels(value) {
        return (typeof value === 'number' ? `${value}px` : value);
    }
    function createFastDomNode(domNode) {
        return new FastDomNode(domNode);
    }
    exports.createFastDomNode = createFastDomNode;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFzdERvbU5vZGUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2Jyb3dzZXIvZmFzdERvbU5vZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBRWhHLE1BQWEsV0FBVztRQWdDdkIsWUFDaUIsT0FBVTtZQUFWLFlBQU8sR0FBUCxPQUFPLENBQUc7WUEvQm5CLGNBQVMsR0FBVyxFQUFFLENBQUM7WUFDdkIsV0FBTSxHQUFXLEVBQUUsQ0FBQztZQUNwQixZQUFPLEdBQVcsRUFBRSxDQUFDO1lBQ3JCLFNBQUksR0FBVyxFQUFFLENBQUM7WUFDbEIsVUFBSyxHQUFXLEVBQUUsQ0FBQztZQUNuQixZQUFPLEdBQVcsRUFBRSxDQUFDO1lBQ3JCLFdBQU0sR0FBVyxFQUFFLENBQUM7WUFDcEIsZ0JBQVcsR0FBVyxFQUFFLENBQUM7WUFDekIsaUJBQVksR0FBVyxFQUFFLENBQUM7WUFDMUIsbUJBQWMsR0FBVyxFQUFFLENBQUM7WUFDNUIsa0JBQWEsR0FBVyxFQUFFLENBQUM7WUFDM0IsZ0JBQVcsR0FBVyxFQUFFLENBQUM7WUFDekIsZ0JBQVcsR0FBVyxFQUFFLENBQUM7WUFDekIsY0FBUyxHQUFXLEVBQUUsQ0FBQztZQUN2QixlQUFVLEdBQVcsRUFBRSxDQUFDO1lBQ3hCLHlCQUFvQixHQUFXLEVBQUUsQ0FBQztZQUNsQywyQkFBc0IsR0FBVyxFQUFFLENBQUM7WUFDcEMsb0JBQWUsR0FBVyxFQUFFLENBQUM7WUFDN0IsZ0JBQVcsR0FBVyxFQUFFLENBQUM7WUFDekIsbUJBQWMsR0FBVyxFQUFFLENBQUM7WUFDNUIsZUFBVSxHQUFXLEVBQUUsQ0FBQztZQUN4QixhQUFRLEdBQVcsRUFBRSxDQUFDO1lBQ3RCLGNBQVMsR0FBVyxFQUFFLENBQUM7WUFDdkIsZ0JBQVcsR0FBVyxFQUFFLENBQUM7WUFDekIsV0FBTSxHQUFXLEVBQUUsQ0FBQztZQUNwQixx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