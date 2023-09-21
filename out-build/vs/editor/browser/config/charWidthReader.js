/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/config/domFontInfo"], function (require, exports, domFontInfo_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$xU = exports.$wU = exports.CharWidthRequestType = void 0;
    var CharWidthRequestType;
    (function (CharWidthRequestType) {
        CharWidthRequestType[CharWidthRequestType["Regular"] = 0] = "Regular";
        CharWidthRequestType[CharWidthRequestType["Italic"] = 1] = "Italic";
        CharWidthRequestType[CharWidthRequestType["Bold"] = 2] = "Bold";
    })(CharWidthRequestType || (exports.CharWidthRequestType = CharWidthRequestType = {}));
    class $wU {
        constructor(chr, type) {
            this.chr = chr;
            this.type = type;
            this.width = 0;
        }
        fulfill(width) {
            this.width = width;
        }
    }
    exports.$wU = $wU;
    class DomCharWidthReader {
        constructor(bareFontInfo, requests) {
            this.a = bareFontInfo;
            this.b = requests;
            this.c = null;
            this.d = null;
        }
        read() {
            // Create a test container with all these test elements
            this.e();
            // Add the container to the DOM
            document.body.appendChild(this.c);
            // Read character widths
            this.g();
            // Remove the container from the DOM
            document.body.removeChild(this.c);
            this.c = null;
            this.d = null;
        }
        e() {
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.top = '-50000px';
            container.style.width = '50000px';
            const regularDomNode = document.createElement('div');
            (0, domFontInfo_1.$vU)(regularDomNode, this.a);
            container.appendChild(regularDomNode);
            const boldDomNode = document.createElement('div');
            (0, domFontInfo_1.$vU)(boldDomNode, this.a);
            boldDomNode.style.fontWeight = 'bold';
            container.appendChild(boldDomNode);
            const italicDomNode = document.createElement('div');
            (0, domFontInfo_1.$vU)(italicDomNode, this.a);
            italicDomNode.style.fontStyle = 'italic';
            container.appendChild(italicDomNode);
            const testElements = [];
            for (const request of this.b) {
                let parent;
                if (request.type === 0 /* CharWidthRequestType.Regular */) {
                    parent = regularDomNode;
                }
                if (request.type === 2 /* CharWidthRequestType.Bold */) {
                    parent = boldDomNode;
                }
                if (request.type === 1 /* CharWidthRequestType.Italic */) {
                    parent = italicDomNode;
                }
                parent.appendChild(document.createElement('br'));
                const testElement = document.createElement('span');
                DomCharWidthReader.f(testElement, request);
                parent.appendChild(testElement);
                testElements.push(testElement);
            }
            this.c = container;
            this.d = testElements;
        }
        static f(testElement, request) {
            if (request.chr === ' ') {
                let htmlString = '\u00a0';
                // Repeat character 256 (2^8) times
                for (let i = 0; i < 8; i++) {
                    htmlString += htmlString;
                }
                testElement.innerText = htmlString;
            }
            else {
                let testString = request.chr;
                // Repeat character 256 (2^8) times
                for (let i = 0; i < 8; i++) {
                    testString += testString;
                }
                testElement.textContent = testString;
            }
        }
        g() {
            for (let i = 0, len = this.b.length; i < len; i++) {
                const request = this.b[i];
                const testElement = this.d[i];
                request.fulfill(testElement.offsetWidth / 256);
            }
        }
    }
    function $xU(bareFontInfo, requests) {
        const reader = new DomCharWidthReader(bareFontInfo, requests);
        reader.read();
    }
    exports.$xU = $xU;
});
//# sourceMappingURL=charWidthReader.js.map