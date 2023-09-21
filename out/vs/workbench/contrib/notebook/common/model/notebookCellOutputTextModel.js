/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, event_1, lifecycle_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookCellOutputTextModel = void 0;
    class NotebookCellOutputTextModel extends lifecycle_1.Disposable {
        get outputs() {
            return this._rawOutput.outputs || [];
        }
        get metadata() {
            return this._rawOutput.metadata;
        }
        get outputId() {
            return this._rawOutput.outputId;
        }
        get alternativeOutputId() {
            return this._alternativeOutputId;
        }
        get versionId() {
            return this._versionId;
        }
        constructor(_rawOutput) {
            super();
            this._rawOutput = _rawOutput;
            this._onDidChangeData = this._register(new event_1.Emitter());
            this.onDidChangeData = this._onDidChangeData.event;
            this._versionId = 0;
            // mime: versionId: buffer length
            this.versionedBufferLengths = {};
            this._alternativeOutputId = this._rawOutput.outputId;
        }
        replaceData(rawData) {
            this.versionedBufferLengths = {};
            this._rawOutput = rawData;
            this.optimizeOutputItems();
            this._versionId = this._versionId + 1;
            this._onDidChangeData.fire();
        }
        appendData(items) {
            this.trackBufferLengths();
            this._rawOutput.outputs.push(...items);
            this.optimizeOutputItems();
            this._versionId = this._versionId + 1;
            this._onDidChangeData.fire();
        }
        trackBufferLengths() {
            this.outputs.forEach(output => {
                if ((0, notebookCommon_1.isTextStreamMime)(output.mime)) {
                    if (!this.versionedBufferLengths[output.mime]) {
                        this.versionedBufferLengths[output.mime] = {};
                    }
                    this.versionedBufferLengths[output.mime][this.versionId] = output.data.byteLength;
                }
            });
        }
        appendedSinceVersion(versionId, mime) {
            const bufferLength = this.versionedBufferLengths[mime]?.[versionId];
            const output = this.outputs.find(output => output.mime === mime);
            if (bufferLength && output) {
                return output.data.slice(bufferLength);
            }
            return undefined;
        }
        optimizeOutputItems() {
            if (this.outputs.length > 1 && this.outputs.every(item => (0, notebookCommon_1.isTextStreamMime)(item.mime))) {
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
                    const compressionResult = (0, notebookCommon_1.compressOutputItemStreams)(mimeOutputs.get(mime));
                    this.outputs.push({
                        mime,
                        data: compressionResult.data
                    });
                    if (compressionResult.didCompression) {
                        // we can't rely on knowing buffer lengths if we've erased previous lines
                        this.versionedBufferLengths = {};
                    }
                });
            }
        }
        asDto() {
            return {
                // data: this._data,
                metadata: this._rawOutput.metadata,
                outputs: this._rawOutput.outputs,
                outputId: this._rawOutput.outputId
            };
        }
        bumpVersion() {
            this._versionId = this._versionId + 1;
        }
    }
    exports.NotebookCellOutputTextModel = NotebookCellOutputTextModel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tDZWxsT3V0cHV0VGV4dE1vZGVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svY29tbW9uL21vZGVsL25vdGVib29rQ2VsbE91dHB1dFRleHRNb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFPaEcsTUFBYSwyQkFBNEIsU0FBUSxzQkFBVTtRQUsxRCxJQUFJLE9BQU87WUFDVixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQztRQUN0QyxDQUFDO1FBRUQsSUFBSSxRQUFRO1lBQ1gsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQztRQUNqQyxDQUFDO1FBRUQsSUFBSSxRQUFRO1lBQ1gsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQztRQUNqQyxDQUFDO1FBT0QsSUFBSSxtQkFBbUI7WUFDdEIsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUM7UUFDbEMsQ0FBQztRQUlELElBQUksU0FBUztZQUNaLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUN4QixDQUFDO1FBRUQsWUFDUyxVQUFzQjtZQUU5QixLQUFLLEVBQUUsQ0FBQztZQUZBLGVBQVUsR0FBVixVQUFVLENBQVk7WUEvQnZCLHFCQUFnQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQy9ELG9CQUFlLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQztZQXVCdEMsZUFBVSxHQUFHLENBQUMsQ0FBQztZQXlDdkIsaUNBQWlDO1lBQ3pCLDJCQUFzQixHQUEyQyxFQUFFLENBQUM7WUEvQjNFLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQztRQUN0RCxDQUFDO1FBRUQsV0FBVyxDQUFDLE9BQW1CO1lBQzlCLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxFQUFFLENBQUM7WUFDakMsSUFBSSxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUM7WUFDMUIsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7WUFDM0IsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztZQUN0QyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDOUIsQ0FBQztRQUVELFVBQVUsQ0FBQyxLQUF1QjtZQUNqQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUMxQixJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQztZQUN2QyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztZQUMzQixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUM5QixDQUFDO1FBRU8sa0JBQWtCO1lBQ3pCLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUM3QixJQUFJLElBQUEsaUNBQWdCLEVBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUNsQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTt3QkFDOUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7cUJBQzlDO29CQUNELElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO2lCQUNsRjtZQUNGLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUtELG9CQUFvQixDQUFDLFNBQWlCLEVBQUUsSUFBWTtZQUNuRCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNwRSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUM7WUFDakUsSUFBSSxZQUFZLElBQUksTUFBTSxFQUFFO2dCQUMzQixPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO2FBQ3ZDO1lBRUQsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztRQUVPLG1CQUFtQjtZQUMxQixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUEsaUNBQWdCLEVBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUU7Z0JBQ3ZGLGtFQUFrRTtnQkFDbEUseURBQXlEO2dCQUN6RCxNQUFNLFdBQVcsR0FBRyxJQUFJLEdBQUcsRUFBd0IsQ0FBQztnQkFDcEQsTUFBTSxTQUFTLEdBQWEsRUFBRSxDQUFDO2dCQUMvQixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDM0IsSUFBSSxLQUFtQixDQUFDO29CQUN4QixJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO3dCQUMvQixLQUFLLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFFLENBQUM7cUJBQ3BDO3lCQUFNO3dCQUNOLEtBQUssR0FBRyxFQUFFLENBQUM7d0JBQ1gsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO3dCQUNsQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDMUI7b0JBQ0QsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM5QixDQUFDLENBQUMsQ0FBQztnQkFDSCxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7Z0JBQ3hCLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ3hCLE1BQU0saUJBQWlCLEdBQUcsSUFBQSwwQ0FBeUIsRUFBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBRSxDQUFDLENBQUM7b0JBQzVFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO3dCQUNqQixJQUFJO3dCQUNKLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxJQUFJO3FCQUM1QixDQUFDLENBQUM7b0JBQ0gsSUFBSSxpQkFBaUIsQ0FBQyxjQUFjLEVBQUU7d0JBQ3JDLHlFQUF5RTt3QkFDekUsSUFBSSxDQUFDLHNCQUFzQixHQUFHLEVBQUUsQ0FBQztxQkFDakM7Z0JBQ0YsQ0FBQyxDQUFDLENBQUM7YUFDSDtRQUNGLENBQUM7UUFFRCxLQUFLO1lBQ0osT0FBTztnQkFDTixvQkFBb0I7Z0JBQ3BCLFFBQVEsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVE7Z0JBQ2xDLE9BQU8sRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU87Z0JBQ2hDLFFBQVEsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVE7YUFDbEMsQ0FBQztRQUNILENBQUM7UUFFRCxXQUFXO1lBQ1YsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztRQUN2QyxDQUFDO0tBRUQ7SUE3SEQsa0VBNkhDIn0=