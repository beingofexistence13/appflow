/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, event_1, lifecycle_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$GH = void 0;
    class $GH extends lifecycle_1.$kc {
        get outputs() {
            return this.f.outputs || [];
        }
        get metadata() {
            return this.f.metadata;
        }
        get outputId() {
            return this.f.outputId;
        }
        get alternativeOutputId() {
            return this.b;
        }
        get versionId() {
            return this.c;
        }
        constructor(f) {
            super();
            this.f = f;
            this.a = this.B(new event_1.$fd());
            this.onDidChangeData = this.a.event;
            this.c = 0;
            // mime: versionId: buffer length
            this.h = {};
            this.b = this.f.outputId;
        }
        replaceData(rawData) {
            this.h = {};
            this.f = rawData;
            this.j();
            this.c = this.c + 1;
            this.a.fire();
        }
        appendData(items) {
            this.g();
            this.f.outputs.push(...items);
            this.j();
            this.c = this.c + 1;
            this.a.fire();
        }
        g() {
            this.outputs.forEach(output => {
                if ((0, notebookCommon_1.$9H)(output.mime)) {
                    if (!this.h[output.mime]) {
                        this.h[output.mime] = {};
                    }
                    this.h[output.mime][this.versionId] = output.data.byteLength;
                }
            });
        }
        appendedSinceVersion(versionId, mime) {
            const bufferLength = this.h[mime]?.[versionId];
            const output = this.outputs.find(output => output.mime === mime);
            if (bufferLength && output) {
                return output.data.slice(bufferLength);
            }
            return undefined;
        }
        j() {
            if (this.outputs.length > 1 && this.outputs.every(item => (0, notebookCommon_1.$9H)(item.mime))) {
                // Look for the mimes in the items, and keep track of their order.
                // Merge the streams into one output item, per mime type.
                const mimeOutputs = new Map();
                const mimeTypes = [];
                this.outputs.forEach(item => {
                    let items;
                    if (mimeOutputs.has(item.mime)) {
                        items = mimeOutputs.get(item.mime);
                    }
                    else {
                        items = [];
                        mimeOutputs.set(item.mime, items);
                        mimeTypes.push(item.mime);
                    }
                    items.push(item.data.buffer);
                });
                this.outputs.length = 0;
                mimeTypes.forEach(mime => {
                    const compressionResult = (0, notebookCommon_1.$0H)(mimeOutputs.get(mime));
                    this.outputs.push({
                        mime,
                        data: compressionResult.data
                    });
                    if (compressionResult.didCompression) {
                        // we can't rely on knowing buffer lengths if we've erased previous lines
                        this.h = {};
                    }
                });
            }
        }
        asDto() {
            return {
                // data: this._data,
                metadata: this.f.metadata,
                outputs: this.f.outputs,
                outputId: this.f.outputId
            };
        }
        bumpVersion() {
            this.c = this.c + 1;
        }
    }
    exports.$GH = $GH;
});
//# sourceMappingURL=notebookCellOutputTextModel.js.map