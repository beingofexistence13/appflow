/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/config/domFontInfo"], function (require, exports, domFontInfo_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.readCharWidths = exports.CharWidthRequest = exports.CharWidthRequestType = void 0;
    var CharWidthRequestType;
    (function (CharWidthRequestType) {
        CharWidthRequestType[CharWidthRequestType["Regular"] = 0] = "Regular";
        CharWidthRequestType[CharWidthRequestType["Italic"] = 1] = "Italic";
        CharWidthRequestType[CharWidthRequestType["Bold"] = 2] = "Bold";
    })(CharWidthRequestType || (exports.CharWidthRequestType = CharWidthRequestType = {}));
    class CharWidthRequest {
        constructor(chr, type) {
            this.chr = chr;
            this.type = type;
            this.width = 0;
        }
        fulfill(width) {
            this.width = width;
        }
    }
    exports.CharWidthRequest = CharWidthRequest;
    class DomCharWidthReader {
        constructor(bareFontInfo, requests) {
            this._bareFontInfo = bareFontInfo;
            this._requests = requests;
            this._container = null;
            this._testElements = null;
        }
        read() {
            // Create a test container with all these test elements
            this._createDomElements();
            // Add the container to the DOM
            document.body.appendChild(this._container);
            // Read character widths
            this._readFromDomElements();
            // Remove the container from the DOM
            document.body.removeChild(this._container);
            this._container = null;
            this._testElements = null;
        }
        _createDomElements() {
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.top = '-50000px';
            container.style.width = '50000px';
            const regularDomNode = document.createElement('div');
            (0, domFontInfo_1.applyFontInfo)(regularDomNode, this._bareFontInfo);
            container.appendChild(regularDomNode);
            const boldDomNode = document.createElement('div');
            (0, domFontInfo_1.applyFontInfo)(boldDomNode, this._bareFontInfo);
            boldDomNode.style.fontWeight = 'bold';
            container.appendChild(boldDomNode);
            const italicDomNode = document.createElement('div');
            (0, domFontInfo_1.applyFontInfo)(italicDomNode, this._bareFontInfo);
            italicDomNode.style.fontStyle = 'italic';
            container.appendChild(italicDomNode);
            const testElements = [];
            for (const request of this._requests) {
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
                DomCharWidthReader._render(testElement, request);
                parent.appendChild(testElement);
                testElements.push(testElement);
            }
            this._container = container;
            this._testElements = testElements;
        }
        static _render(testElement, request) {
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
        _readFromDomElements() {
            for (let i = 0, len = this._requests.length; i < len; i++) {
                const request = this._requests[i];
                const testElement = this._testElements[i];
                request.fulfill(testElement.offsetWidth / 256);
            }
        }
    }
    function readCharWidths(bareFontInfo, requests) {
        const reader = new DomCharWidthReader(bareFontInfo, requests);
        reader.read();
    }
    exports.readCharWidths = readCharWidths;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcldpZHRoUmVhZGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2Jyb3dzZXIvY29uZmlnL2NoYXJXaWR0aFJlYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFLaEcsSUFBa0Isb0JBSWpCO0lBSkQsV0FBa0Isb0JBQW9CO1FBQ3JDLHFFQUFXLENBQUE7UUFDWCxtRUFBVSxDQUFBO1FBQ1YsK0RBQVEsQ0FBQTtJQUNULENBQUMsRUFKaUIsb0JBQW9CLG9DQUFwQixvQkFBb0IsUUFJckM7SUFFRCxNQUFhLGdCQUFnQjtRQU01QixZQUFZLEdBQVcsRUFBRSxJQUEwQjtZQUNsRCxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUNmLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ2pCLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLENBQUM7UUFFTSxPQUFPLENBQUMsS0FBYTtZQUMzQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNwQixDQUFDO0tBQ0Q7SUFmRCw0Q0FlQztJQUVELE1BQU0sa0JBQWtCO1FBUXZCLFlBQVksWUFBMEIsRUFBRSxRQUE0QjtZQUNuRSxJQUFJLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQztZQUNsQyxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztZQUUxQixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztZQUN2QixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztRQUMzQixDQUFDO1FBRU0sSUFBSTtZQUNWLHVEQUF1RDtZQUN2RCxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUUxQiwrQkFBK0I7WUFDL0IsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVcsQ0FBQyxDQUFDO1lBRTVDLHdCQUF3QjtZQUN4QixJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUU1QixvQ0FBb0M7WUFDcEMsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVcsQ0FBQyxDQUFDO1lBRTVDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO1FBQzNCLENBQUM7UUFFTyxrQkFBa0I7WUFDekIsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNoRCxTQUFTLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUM7WUFDdEMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsVUFBVSxDQUFDO1lBQ2pDLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQztZQUVsQyxNQUFNLGNBQWMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3JELElBQUEsMkJBQWEsRUFBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ2xELFNBQVMsQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLENBQUM7WUFFdEMsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNsRCxJQUFBLDJCQUFhLEVBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUMvQyxXQUFXLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUM7WUFDdEMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUVuQyxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3BELElBQUEsMkJBQWEsRUFBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ2pELGFBQWEsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztZQUN6QyxTQUFTLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRXJDLE1BQU0sWUFBWSxHQUFzQixFQUFFLENBQUM7WUFDM0MsS0FBSyxNQUFNLE9BQU8sSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUVyQyxJQUFJLE1BQW1CLENBQUM7Z0JBQ3hCLElBQUksT0FBTyxDQUFDLElBQUkseUNBQWlDLEVBQUU7b0JBQ2xELE1BQU0sR0FBRyxjQUFjLENBQUM7aUJBQ3hCO2dCQUNELElBQUksT0FBTyxDQUFDLElBQUksc0NBQThCLEVBQUU7b0JBQy9DLE1BQU0sR0FBRyxXQUFXLENBQUM7aUJBQ3JCO2dCQUNELElBQUksT0FBTyxDQUFDLElBQUksd0NBQWdDLEVBQUU7b0JBQ2pELE1BQU0sR0FBRyxhQUFhLENBQUM7aUJBQ3ZCO2dCQUVELE1BQU8sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUVsRCxNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNuRCxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUNqRCxNQUFPLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUVqQyxZQUFZLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQy9CO1lBRUQsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7WUFDNUIsSUFBSSxDQUFDLGFBQWEsR0FBRyxZQUFZLENBQUM7UUFDbkMsQ0FBQztRQUVPLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBd0IsRUFBRSxPQUF5QjtZQUN6RSxJQUFJLE9BQU8sQ0FBQyxHQUFHLEtBQUssR0FBRyxFQUFFO2dCQUN4QixJQUFJLFVBQVUsR0FBRyxRQUFRLENBQUM7Z0JBQzFCLG1DQUFtQztnQkFDbkMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDM0IsVUFBVSxJQUFJLFVBQVUsQ0FBQztpQkFDekI7Z0JBQ0QsV0FBVyxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUM7YUFDbkM7aUJBQU07Z0JBQ04sSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztnQkFDN0IsbUNBQW1DO2dCQUNuQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUMzQixVQUFVLElBQUksVUFBVSxDQUFDO2lCQUN6QjtnQkFDRCxXQUFXLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQzthQUNyQztRQUNGLENBQUM7UUFFTyxvQkFBb0I7WUFDM0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzFELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xDLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxhQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRTNDLE9BQU8sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUMsQ0FBQzthQUMvQztRQUNGLENBQUM7S0FDRDtJQUVELFNBQWdCLGNBQWMsQ0FBQyxZQUEwQixFQUFFLFFBQTRCO1FBQ3RGLE1BQU0sTUFBTSxHQUFHLElBQUksa0JBQWtCLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzlELE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNmLENBQUM7SUFIRCx3Q0FHQyJ9