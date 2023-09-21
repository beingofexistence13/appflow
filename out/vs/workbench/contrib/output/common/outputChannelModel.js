/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/base/common/resources", "vs/editor/common/services/editorWorker", "vs/base/common/event", "vs/base/common/async", "vs/platform/files/common/files", "vs/editor/common/services/model", "vs/base/common/lifecycle", "vs/base/common/types", "vs/editor/common/core/editOperation", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/base/common/buffer", "vs/platform/log/common/log", "vs/base/common/cancellation", "vs/workbench/services/output/common/output", "vs/base/common/errors"], function (require, exports, instantiation_1, resources, editorWorker_1, event_1, async_1, files_1, model_1, lifecycle_1, types_1, editOperation_1, position_1, range_1, buffer_1, log_1, cancellation_1, output_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DelegatedOutputChannelModel = exports.FileOutputChannelModel = void 0;
    class OutputFileListener extends lifecycle_1.Disposable {
        constructor(file, fileService, logService) {
            super();
            this.file = file;
            this.fileService = fileService;
            this.logService = logService;
            this._onDidContentChange = new event_1.Emitter();
            this.onDidContentChange = this._onDidContentChange.event;
            this.watching = false;
            this.syncDelayer = new async_1.ThrottledDelayer(500);
        }
        watch(eTag) {
            if (!this.watching) {
                this.etag = eTag;
                this.poll();
                this.logService.trace('Started polling', this.file.toString());
                this.watching = true;
            }
        }
        poll() {
            const loop = () => this.doWatch().then(() => this.poll());
            this.syncDelayer.trigger(loop).catch(error => {
                if (!(0, errors_1.isCancellationError)(error)) {
                    throw error;
                }
            });
        }
        async doWatch() {
            const stat = await this.fileService.stat(this.file);
            if (stat.etag !== this.etag) {
                this.etag = stat.etag;
                this._onDidContentChange.fire(stat.size);
            }
        }
        unwatch() {
            if (this.watching) {
                this.syncDelayer.cancel();
                this.watching = false;
                this.logService.trace('Stopped polling', this.file.toString());
            }
        }
        dispose() {
            this.unwatch();
            super.dispose();
        }
    }
    let FileOutputChannelModel = class FileOutputChannelModel extends lifecycle_1.Disposable {
        constructor(modelUri, language, file, fileService, modelService, logService, editorWorkerService) {
            super();
            this.modelUri = modelUri;
            this.language = language;
            this.file = file;
            this.fileService = fileService;
            this.modelService = modelService;
            this.editorWorkerService = editorWorkerService;
            this._onDispose = this._register(new event_1.Emitter());
            this.onDispose = this._onDispose.event;
            this.etag = '';
            this.loadModelPromise = null;
            this.model = null;
            this.modelUpdateInProgress = false;
            this.modelUpdateCancellationSource = this._register(new lifecycle_1.MutableDisposable());
            this.appendThrottler = this._register(new async_1.ThrottledDelayer(300));
            this.startOffset = 0;
            this.endOffset = 0;
            this.fileHandler = this._register(new OutputFileListener(this.file, this.fileService, logService));
            this._register(this.fileHandler.onDidContentChange(size => this.onDidContentChange(size)));
            this._register((0, lifecycle_1.toDisposable)(() => this.fileHandler.unwatch()));
        }
        append(message) {
            throw new Error('Not supported');
        }
        replace(message) {
            throw new Error('Not supported');
        }
        clear() {
            this.update(output_1.OutputChannelUpdateMode.Clear, this.endOffset, true);
        }
        update(mode, till, immediate) {
            const loadModelPromise = this.loadModelPromise ? this.loadModelPromise : Promise.resolve();
            loadModelPromise.then(() => this.doUpdate(mode, till, immediate));
        }
        loadModel() {
            this.loadModelPromise = async_1.Promises.withAsyncBody(async (c, e) => {
                try {
                    let content = '';
                    if (await this.fileService.exists(this.file)) {
                        const fileContent = await this.fileService.readFile(this.file, { position: this.startOffset });
                        this.endOffset = this.startOffset + fileContent.value.byteLength;
                        this.etag = fileContent.etag;
                        content = fileContent.value.toString();
                    }
                    else {
                        this.startOffset = 0;
                        this.endOffset = 0;
                    }
                    c(this.createModel(content));
                }
                catch (error) {
                    e(error);
                }
            });
            return this.loadModelPromise;
        }
        createModel(content) {
            if (this.model) {
                this.model.setValue(content);
            }
            else {
                this.model = this.modelService.createModel(content, this.language, this.modelUri);
                this.fileHandler.watch(this.etag);
                const disposable = this.model.onWillDispose(() => {
                    this.cancelModelUpdate();
                    this.fileHandler.unwatch();
                    this.model = null;
                    (0, lifecycle_1.dispose)(disposable);
                });
            }
            return this.model;
        }
        doUpdate(mode, till, immediate) {
            if (mode === output_1.OutputChannelUpdateMode.Clear || mode === output_1.OutputChannelUpdateMode.Replace) {
                this.startOffset = this.endOffset = (0, types_1.isNumber)(till) ? till : this.endOffset;
                this.cancelModelUpdate();
            }
            if (!this.model) {
                return;
            }
            this.modelUpdateInProgress = true;
            if (!this.modelUpdateCancellationSource.value) {
                this.modelUpdateCancellationSource.value = new cancellation_1.CancellationTokenSource();
            }
            const token = this.modelUpdateCancellationSource.value.token;
            if (mode === output_1.OutputChannelUpdateMode.Clear) {
                this.clearContent(this.model);
            }
            else if (mode === output_1.OutputChannelUpdateMode.Replace) {
                this.replacePromise = this.replaceContent(this.model, token).finally(() => this.replacePromise = undefined);
            }
            else {
                this.appendContent(this.model, immediate, token);
            }
        }
        clearContent(model) {
            this.doUpdateModel(model, [editOperation_1.EditOperation.delete(model.getFullModelRange())], buffer_1.VSBuffer.fromString(''));
        }
        appendContent(model, immediate, token) {
            this.appendThrottler.trigger(async () => {
                /* Abort if operation is cancelled */
                if (token.isCancellationRequested) {
                    return;
                }
                /* Wait for replace to finish */
                if (this.replacePromise) {
                    try {
                        await this.replacePromise;
                    }
                    catch (e) { /* Ignore */ }
                    /* Abort if operation is cancelled */
                    if (token.isCancellationRequested) {
                        return;
                    }
                }
                /* Get content to append */
                const contentToAppend = await this.getContentToUpdate();
                /* Abort if operation is cancelled */
                if (token.isCancellationRequested) {
                    return;
                }
                /* Appned Content */
                const lastLine = model.getLineCount();
                const lastLineMaxColumn = model.getLineMaxColumn(lastLine);
                const edits = [editOperation_1.EditOperation.insert(new position_1.Position(lastLine, lastLineMaxColumn), contentToAppend.toString())];
                this.doUpdateModel(model, edits, contentToAppend);
            }, immediate ? 0 : undefined).catch(error => {
                if (!(0, errors_1.isCancellationError)(error)) {
                    throw error;
                }
            });
        }
        async replaceContent(model, token) {
            /* Get content to replace */
            const contentToReplace = await this.getContentToUpdate();
            /* Abort if operation is cancelled */
            if (token.isCancellationRequested) {
                return;
            }
            /* Compute Edits */
            const edits = await this.getReplaceEdits(model, contentToReplace.toString());
            /* Abort if operation is cancelled */
            if (token.isCancellationRequested) {
                return;
            }
            /* Apply Edits */
            this.doUpdateModel(model, edits, contentToReplace);
        }
        async getReplaceEdits(model, contentToReplace) {
            if (!contentToReplace) {
                return [editOperation_1.EditOperation.delete(model.getFullModelRange())];
            }
            if (contentToReplace !== model.getValue()) {
                const edits = await this.editorWorkerService.computeMoreMinimalEdits(model.uri, [{ text: contentToReplace.toString(), range: model.getFullModelRange() }]);
                if (edits?.length) {
                    return edits.map(edit => editOperation_1.EditOperation.replace(range_1.Range.lift(edit.range), edit.text));
                }
            }
            return [];
        }
        doUpdateModel(model, edits, content) {
            if (edits.length) {
                model.applyEdits(edits);
            }
            this.endOffset = this.endOffset + content.byteLength;
            this.modelUpdateInProgress = false;
        }
        cancelModelUpdate() {
            this.modelUpdateCancellationSource.value?.cancel();
            this.modelUpdateCancellationSource.value = undefined;
            this.appendThrottler.cancel();
            this.replacePromise = undefined;
            this.modelUpdateInProgress = false;
        }
        async getContentToUpdate() {
            const content = await this.fileService.readFile(this.file, { position: this.endOffset });
            this.etag = content.etag;
            return content.value;
        }
        onDidContentChange(size) {
            if (this.model) {
                if (!this.modelUpdateInProgress) {
                    if ((0, types_1.isNumber)(size) && this.endOffset > size) {
                        // Reset - Content is removed
                        this.update(output_1.OutputChannelUpdateMode.Clear, 0, true);
                    }
                }
                this.update(output_1.OutputChannelUpdateMode.Append, undefined, false /* Not needed to update immediately. Wait to collect more changes and update. */);
            }
        }
        isVisible() {
            return !!this.model;
        }
        dispose() {
            this._onDispose.fire();
            super.dispose();
        }
    };
    exports.FileOutputChannelModel = FileOutputChannelModel;
    exports.FileOutputChannelModel = FileOutputChannelModel = __decorate([
        __param(3, files_1.IFileService),
        __param(4, model_1.IModelService),
        __param(5, log_1.ILogService),
        __param(6, editorWorker_1.IEditorWorkerService)
    ], FileOutputChannelModel);
    let OutputChannelBackedByFile = class OutputChannelBackedByFile extends FileOutputChannelModel {
        constructor(id, modelUri, language, file, fileService, modelService, loggerService, logService, editorWorkerService) {
            super(modelUri, language, file, fileService, modelService, logService, editorWorkerService);
            // Donot rotate to check for the file reset
            this.logger = loggerService.createLogger(file, { logLevel: 'always', donotRotate: true, donotUseFormatters: true, hidden: true });
            this._offset = 0;
        }
        append(message) {
            this.write(message);
            this.update(output_1.OutputChannelUpdateMode.Append, undefined, this.isVisible());
        }
        replace(message) {
            const till = this._offset;
            this.write(message);
            this.update(output_1.OutputChannelUpdateMode.Replace, till, true);
        }
        write(content) {
            this._offset += buffer_1.VSBuffer.fromString(content).byteLength;
            this.logger.info(content);
            if (this.isVisible()) {
                this.logger.flush();
            }
        }
    };
    OutputChannelBackedByFile = __decorate([
        __param(4, files_1.IFileService),
        __param(5, model_1.IModelService),
        __param(6, log_1.ILoggerService),
        __param(7, log_1.ILogService),
        __param(8, editorWorker_1.IEditorWorkerService)
    ], OutputChannelBackedByFile);
    let DelegatedOutputChannelModel = class DelegatedOutputChannelModel extends lifecycle_1.Disposable {
        constructor(id, modelUri, language, outputDir, instantiationService, fileService) {
            super();
            this.instantiationService = instantiationService;
            this.fileService = fileService;
            this._onDispose = this._register(new event_1.Emitter());
            this.onDispose = this._onDispose.event;
            this.outputChannelModel = this.createOutputChannelModel(id, modelUri, language, outputDir);
        }
        async createOutputChannelModel(id, modelUri, language, outputDirPromise) {
            const outputDir = await outputDirPromise;
            const file = resources.joinPath(outputDir, `${id.replace(/[\\/:\*\?"<>\|]/g, '')}.log`);
            await this.fileService.createFile(file);
            const outputChannelModel = this._register(this.instantiationService.createInstance(OutputChannelBackedByFile, id, modelUri, language, file));
            this._register(outputChannelModel.onDispose(() => this._onDispose.fire()));
            return outputChannelModel;
        }
        append(output) {
            this.outputChannelModel.then(outputChannelModel => outputChannelModel.append(output));
        }
        update(mode, till, immediate) {
            this.outputChannelModel.then(outputChannelModel => outputChannelModel.update(mode, till, immediate));
        }
        loadModel() {
            return this.outputChannelModel.then(outputChannelModel => outputChannelModel.loadModel());
        }
        clear() {
            this.outputChannelModel.then(outputChannelModel => outputChannelModel.clear());
        }
        replace(value) {
            this.outputChannelModel.then(outputChannelModel => outputChannelModel.replace(value));
        }
    };
    exports.DelegatedOutputChannelModel = DelegatedOutputChannelModel;
    exports.DelegatedOutputChannelModel = DelegatedOutputChannelModel = __decorate([
        __param(4, instantiation_1.IInstantiationService),
        __param(5, files_1.IFileService)
    ], DelegatedOutputChannelModel);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0cHV0Q2hhbm5lbE1vZGVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvb3V0cHV0L2NvbW1vbi9vdXRwdXRDaGFubmVsTW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBZ0NoRyxNQUFNLGtCQUFtQixTQUFRLHNCQUFVO1FBUzFDLFlBQ2tCLElBQVMsRUFDVCxXQUF5QixFQUN6QixVQUF1QjtZQUV4QyxLQUFLLEVBQUUsQ0FBQztZQUpTLFNBQUksR0FBSixJQUFJLENBQUs7WUFDVCxnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQUN6QixlQUFVLEdBQVYsVUFBVSxDQUFhO1lBVnhCLHdCQUFtQixHQUFHLElBQUksZUFBTyxFQUFzQixDQUFDO1lBQ2hFLHVCQUFrQixHQUE4QixJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDO1lBRWhGLGFBQVEsR0FBWSxLQUFLLENBQUM7WUFVakMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLHdCQUFnQixDQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQ3BELENBQUM7UUFFRCxLQUFLLENBQUMsSUFBd0I7WUFDN0IsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ25CLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO2dCQUNqQixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ1osSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2dCQUMvRCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQzthQUNyQjtRQUNGLENBQUM7UUFFTyxJQUFJO1lBQ1gsTUFBTSxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFD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