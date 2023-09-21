/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/stopwatch", "vs/editor/common/services/editorSimpleWorker"], function (require, exports, stopwatch_1, editorSimpleWorker_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LanguageDetectionSimpleWorker = exports.create = void 0;
    /**
     * Called on the worker side
     * @internal
     */
    function create(host) {
        return new LanguageDetectionSimpleWorker(host, null);
    }
    exports.create = create;
    /**
     * @internal
     */
    class LanguageDetectionSimpleWorker extends editorSimpleWorker_1.EditorSimpleWorker {
        constructor() {
            super(...arguments);
            this._regexpLoadFailed = false;
            this._loadFailed = false;
            this.modelIdToCoreId = new Map();
        }
        static { this.expectedRelativeConfidence = 0.2; }
        static { this.positiveConfidenceCorrectionBucket1 = 0.05; }
        static { this.positiveConfidenceCorrectionBucket2 = 0.025; }
        static { this.negativeConfidenceCorrection = 0.5; }
        async detectLanguage(uri, langBiases, preferHistory, supportedLangs) {
            const languages = [];
            const confidences = [];
            const stopWatch = new stopwatch_1.StopWatch();
            const documentTextSample = this.getTextForDetection(uri);
            if (!documentTextSample) {
                return;
            }
            const neuralResolver = async () => {
                for await (const language of this.detectLanguagesImpl(documentTextSample)) {
                    if (!this.modelIdToCoreId.has(language.languageId)) {
                        this.modelIdToCoreId.set(language.languageId, await this._host.fhr('getLanguageId', [language.languageId]));
                    }
                    const coreId = this.modelIdToCoreId.get(language.languageId);
                    if (coreId && (!supportedLangs?.length || supportedLangs.includes(coreId))) {
                        languages.push(coreId);
                        confidences.push(language.confidence);
                    }
                }
                stopWatch.stop();
                if (languages.length) {
                    this._host.fhr('sendTelemetryEvent', [languages, confidences, stopWatch.elapsed()]);
                    return languages[0];
                }
                return undefined;
            };
            const historicalResolver = async () => this.runRegexpModel(documentTextSample, langBiases ?? {}, supportedLangs);
            if (preferHistory) {
                const history = await historicalResolver();
                if (history) {
                    return history;
                }
                const neural = await neuralResolver();
                if (neural) {
                    return neural;
                }
            }
            else {
                const neural = await neuralResolver();
                if (neural) {
                    return neural;
                }
                const history = await historicalResolver();
                if (history) {
                    return history;
                }
            }
            return undefined;
        }
        getTextForDetection(uri) {
            const editorModel = this._getModel(uri);
            if (!editorModel) {
                return;
            }
            const end = editorModel.positionAt(10000);
            const content = editorModel.getValueInRange({
                startColumn: 1,
                startLineNumber: 1,
                endColumn: end.column,
                endLineNumber: end.lineNumber
            });
            return content;
        }
        async getRegexpModel() {
            if (this._regexpLoadFailed) {
                return;
            }
            if (this._regexpModel) {
                return this._regexpModel;
            }
            const uri = await this._host.fhr('getRegexpModelUri', []);
            try {
                this._regexpModel = await new Promise((resolve_1, reject_1) => { require([uri], resolve_1, reject_1); });
                return this._regexpModel;
            }
            catch (e) {
                this._regexpLoadFailed = true;
                // console.warn('error loading language detection model', e);
                return;
            }
        }
        async runRegexpModel(content, langBiases, supportedLangs) {
            const regexpModel = await this.getRegexpModel();
            if (!regexpModel) {
                return;
            }
            if (supportedLangs?.length) {
                // When using supportedLangs, normally computed biases are too extreme. Just use a "bitmask" of sorts.
                for (const lang of Object.keys(langBiases)) {
                    if (supportedLangs.includes(lang)) {
                        langBiases[lang] = 1;
                    }
                    else {
                        langBiases[lang] = 0;
                    }
                }
            }
            const detected = regexpModel.detect(content, langBiases, supportedLangs);
            return detected;
        }
        async getModelOperations() {
            if (this._modelOperations) {
                return this._modelOperations;
            }
            const uri = await this._host.fhr('getIndexJsUri', []);
            const { ModelOperations } = await new Promise((resolve_2, reject_2) => { require([uri], resolve_2, reject_2); });
            this._modelOperations = new ModelOperations({
                modelJsonLoaderFunc: async () => {
                    const response = await fetch(await this._host.fhr('getModelJsonUri', []));
                    try {
                        const modelJSON = await response.json();
                        return modelJSON;
                    }
                    catch (e) {
                        const message = `Failed to parse model JSON.`;
                        throw new Error(message);
                    }
                },
                weightsLoaderFunc: async () => {
                    const response = await fetch(await this._host.fhr('getWeightsUri', []));
                    const buffer = await response.arrayBuffer();
                    return buffer;
                }
            });
            return this._modelOperations;
        }
        // This adjusts the language confidence scores to be more accurate based on:
        // * VS Code's language usage
        // * Languages with 'problematic' syntaxes that have caused incorrect language detection
        adjustLanguageConfidence(modelResult) {
            switch (modelResult.languageId) {
                // For the following languages, we increase the confidence because
                // these are commonly used languages in VS Code and supported
                // by the model.
                case 'js':
                case 'html':
                case 'json':
                case 'ts':
                case 'css':
                case 'py':
                case 'xml':
                case 'php':
                    modelResult.confidence += LanguageDetectionSimpleWorker.positiveConfidenceCorrectionBucket1;
                    break;
                // case 'yaml': // YAML has been know to cause incorrect language detection because the language is pretty simple. We don't want to increase the confidence for this.
                case 'cpp':
                case 'sh':
                case 'java':
                case 'cs':
                case 'c':
                    modelResult.confidence += LanguageDetectionSimpleWorker.positiveConfidenceCorrectionBucket2;
                    break;
                // For the following languages, we need to be extra confident that the language is correct because
                // we've had issues like #131912 that caused incorrect guesses. To enforce this, we subtract the
                // negativeConfidenceCorrection from the confidence.
                // languages that are provided by default in VS Code
                case 'bat':
                case 'ini':
                case 'makefile':
                case 'sql':
                // languages that aren't provided by default in VS Code
                case 'csv':
                case 'toml':
                    // Other considerations for negativeConfidenceCorrection that
                    // aren't built in but suported by the model include:
                    // * Assembly, TeX - These languages didn't have clear language modes in the community
                    // * Markdown, Dockerfile - These languages are simple but they embed other languages
                    modelResult.confidence -= LanguageDetectionSimpleWorker.negativeConfidenceCorrection;
                    break;
                default:
                    break;
            }
            return modelResult;
        }
        async *detectLanguagesImpl(content) {
            if (this._loadFailed) {
                return;
            }
            let modelOperations;
            try {
                modelOperations = await this.getModelOperations();
            }
            catch (e) {
                console.log(e);
                this._loadFailed = true;
                return;
            }
            let modelResults;
            try {
                modelResults = await modelOperations.runModel(content);
            }
            catch (e) {
                console.warn(e);
            }
            if (!modelResults
                || modelResults.length === 0
                || modelResults[0].confidence < LanguageDetectionSimpleWorker.expectedRelativeConfidence) {
                return;
            }
            const firstModelResult = this.adjustLanguageConfidence(modelResults[0]);
            if (firstModelResult.confidence < LanguageDetectionSimpleWorker.expectedRelativeConfidence) {
                return;
            }
            const possibleLanguages = [firstModelResult];
            for (let current of modelResults) {
                if (current === firstModelResult) {
                    continue;
                }
                current = this.adjustLanguageConfidence(current);
                const currentHighest = possibleLanguages[possibleLanguages.length - 1];
                if (currentHighest.confidence - current.confidence >= LanguageDetectionSimpleWorker.expectedRelativeConfidence) {
                    while (possibleLanguages.length) {
                        yield possibleLanguages.shift();
                    }
                    if (current.confidence > LanguageDetectionSimpleWorker.expectedRelativeConfidence) {
                        possibleLanguages.push(current);
                        continue;
                    }
                    return;
                }
                else {
                    if (current.confidence > LanguageDetectionSimpleWorker.expectedRelativeConfidence) {
                        possibleLanguages.push(current);
                        continue;
                    }
                    return;
                }
            }
        }
    }
    exports.LanguageDetectionSimpleWorker = LanguageDetectionSimpleWorker;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2VEZXRlY3Rpb25TaW1wbGVXb3JrZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvbGFuZ3VhZ2VEZXRlY3Rpb24vYnJvd3Nlci9sYW5ndWFnZURldGVjdGlvblNpbXBsZVdvcmtlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFVaEc7OztPQUdHO0lBQ0gsU0FBZ0IsTUFBTSxDQUFDLElBQXVCO1FBQzdDLE9BQU8sSUFBSSw2QkFBNkIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUZELHdCQUVDO0lBRUQ7O09BRUc7SUFDSCxNQUFhLDZCQUE4QixTQUFRLHVDQUFrQjtRQUFyRTs7WUFPUyxzQkFBaUIsR0FBWSxLQUFLLENBQUM7WUFHbkMsZ0JBQVcsR0FBWSxLQUFLLENBQUM7WUFFN0Isb0JBQWUsR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztRQStPckQsQ0FBQztpQkExUHdCLCtCQUEwQixHQUFHLEdBQUcsQUFBTixDQUFPO2lCQUNqQyx3Q0FBbUMsR0FBRyxJQUFJLEFBQVAsQ0FBUTtpQkFDM0Msd0NBQW1DLEdBQUcsS0FBSyxBQUFSLENBQVM7aUJBQzVDLGlDQUE0QixHQUFHLEdBQUcsQUFBTixDQUFPO1FBVXBELEtBQUssQ0FBQyxjQUFjLENBQUMsR0FBVyxFQUFFLFVBQThDLEVBQUUsYUFBc0IsRUFBRSxjQUF5QjtZQUN6SSxNQUFNLFNBQVMsR0FBYSxFQUFFLENBQUM7WUFDL0IsTUFBTSxXQUFXLEdBQWEsRUFBRSxDQUFDO1lBQ2pDLE1BQU0sU0FBUyxHQUFHLElBQUkscUJBQVMsRUFBRSxDQUFDO1lBQ2xDLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3pELElBQUksQ0FBQyxrQkFBa0IsRUFBRTtnQkFB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