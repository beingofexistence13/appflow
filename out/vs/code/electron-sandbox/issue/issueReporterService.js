var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls", "vs/base/browser/dom", "vs/base/browser/ui/button/button", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/collections", "vs/base/common/decorators", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/strings", "vs/code/electron-sandbox/issue/issueReporterModel", "vs/platform/diagnostics/common/diagnostics", "vs/platform/issue/common/issue", "vs/platform/issue/common/issueReporterUtil", "vs/platform/native/common/native", "vs/platform/window/electron-sandbox/window", "vs/base/common/errors"], function (require, exports, nls_1, dom_1, button_1, iconLabels_1, async_1, codicons_1, collections_1, decorators_1, lifecycle_1, platform_1, strings_1, issueReporterModel_1, diagnostics_1, issue_1, issueReporterUtil_1, native_1, window_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.show = exports.hide = exports.IssueReporter = void 0;
    // GitHub has let us know that we could up our limit here to 8k. We chose 7500 to play it safe.
    // ref https://github.com/microsoft/vscode/issues/159191
    const MAX_URL_LENGTH = 7500;
    var IssueSource;
    (function (IssueSource) {
        IssueSource["VSCode"] = "vscode";
        IssueSource["Extension"] = "extension";
        IssueSource["Marketplace"] = "marketplace";
    })(IssueSource || (IssueSource = {}));
    let IssueReporter = class IssueReporter extends lifecycle_1.Disposable {
        constructor(configuration, nativeHostService, issueMainService) {
            super();
            this.configuration = configuration;
            this.nativeHostService = nativeHostService;
            this.issueMainService = issueMainService;
            this.numberOfSearchResultsDisplayed = 0;
            this.receivedSystemInfo = false;
            this.receivedPerformanceInfo = false;
            this.shouldQueueSearch = false;
            this.hasBeenSubmitted = false;
            this.delayedSubmit = new async_1.Delayer(300);
            const targetExtension = configuration.data.extensionId ? configuration.data.enabledExtensions.find(extension => extension.id.toLocaleLowerCase() === configuration.data.extensionId?.toLocaleLowerCase()) : undefined;
            this.issueReporterModel = new issueReporterModel_1.IssueReporterModel({
                ...configuration.data,
                issueType: configuration.data.issueType || 0 /* IssueType.Bug */,
                versionInfo: {
                    vscodeVersion: `${configuration.product.nameShort} ${!!configuration.product.darwinUniversalAssetId ? `${configuration.product.version} (Universal)` : configuration.product.version} (${configuration.product.commit || 'Commit unknown'}, ${configuration.product.date || 'Date unknown'})`,
                    os: `${this.configuration.os.type} ${this.configuration.os.arch} ${this.configuration.os.release}${platform_1.isLinuxSnap ? ' snap' : ''}`
                },
                extensionsDisabled: !!configuration.disableExtensions,
                fileOnExtension: configuration.data.extensionId ? !targetExtension?.isBuiltin : undefined,
                selectedExtension: targetExtension
            });
            const issueReporterElement = this.getElementById('issue-reporter');
            if (issueReporterElement) {
                this.previewButton = new button_1.Button(issueReporterElement, button_1.unthemedButtonStyles);
                this.updatePreviewButtonState();
            }
            const issueTitle = configuration.data.issueTitle;
            if (issueTitle) {
                const issueTitleElement = this.getElementById('issue-title');
                if (issueTitleElement) {
                    issueTitleElement.value = issueTitle;
                }
            }
            const issueBody = configuration.data.issueBody;
            if (issueBody) {
                const description = this.getElementById('description');
                if (description) {
                    description.value = issueBody;
                    this.issueReporterModel.update({ issueDescription: issueBody });
                }
            }
            this.issueMainService.$getSystemInfo().then(info => {
                this.issueReporterModel.update({ systemInfo: info });
                this.receivedSystemInfo = true;
                this.updateSystemInfo(this.issueReporterModel.getData());
                this.updatePreviewButtonState();
            });
            if (configuration.data.issueType === 1 /* IssueType.PerformanceIssue */) {
                this.issueMainService.$getPerformanceInfo().then(info => {
                    this.updatePerformanceInfo(info);
                });
            }
            if (window.document.documentElement.lang !== 'en') {
                show(this.getElementById('english'));
            }
            this.setUpTypes();
            this.setEventHandlers();
            (0, window_1.applyZoom)(configuration.data.zoomLevel);
            this.applyStyles(configuration.data.styles);
            this.handleExtensionData(configuration.data.enabledExtensions);
            this.updateExperimentsInfo(configuration.data.experiments);
            this.updateRestrictedMode(configuration.data.restrictedMode);
            this.updateUnsupportedMode(configuration.data.isUnsupported);
        }
        render() {
            this.renderBlocks();
        }
        setInitialFocus() {
            const { fileOnExtension } = this.issueReporterModel.getData();
            if (fileOnExtension) {
                const issueTitle = document.getElementById('issue-title');
                issueTitle?.focus();
            }
            else {
                const issueType = document.getElementById('issue-type');
                issueType?.focus();
            }
        }
        applyStyles(styles) {
            const styleTag = document.createElement('style');
            const content = [];
            if (styles.inputBackground) {
                content.push(`input[type="text"], textarea, select, .issues-container > .issue > .issue-state, .block-info { background-color: ${styles.inputBackground}; }`);
            }
            if (styles.inputBorder) {
                content.push(`input[type="text"], textarea, select { border: 1px solid ${styles.inputBorder}; }`);
            }
            else {
                content.push(`input[type="text"], textarea, select { border: 1px solid transparent; }`);
            }
            if (styles.inputForeground) {
                content.push(`input[type="text"], textarea, select, .issues-container > .issue > .issue-state, .block-info { color: ${styles.inputForeground}; }`);
            }
            if (styles.inputErrorBorder) {
                content.push(`.invalid-input, .invalid-input:focus, .validation-error { border: 1px solid ${styles.inputErrorBorder} !important; }`);
                content.push(`.required-input { color: ${styles.inputErrorBorder}; }`);
            }
            if (styles.inputErrorBackground) {
                content.push(`.validation-error { background: ${styles.inputErrorBackground}; }`);
            }
            if (styles.inputErrorForeground) {
                content.push(`.validation-error { color: ${styles.inputErrorForeground}; }`);
            }
            if (styles.inputActiveBorder) {
                content.push(`input[type='text']:focus, textarea:focus, select:focus, summary:focus, button:focus, a:focus, .workbenchCommand:focus  { border: 1px solid ${styles.inputActiveBorder}; outline-style: none; }`);
            }
            if (styles.textLinkColor) {
                content.push(`a, .workbenchCommand { color: ${styles.textLinkColor}; }`);
            }
            if (styles.textLinkColor) {
                content.push(`a { color: ${styles.textLinkColor}; }`);
            }
            if (styles.textLinkActiveForeground) {
                content.push(`a:hover, .workbenchCommand:hover { color: ${styles.textLinkActiveForeground}; }`);
            }
            if (styles.sliderBackgroundColor) {
                content.push(`::-webkit-scrollbar-thumb { background-color: ${styles.sliderBackgroundColor}; }`);
            }
            if (styles.sliderActiveColor) {
                content.push(`::-webkit-scrollbar-thumb:active { background-color: ${styles.sliderActiveColor}; }`);
            }
            if (styles.sliderHoverColor) {
                content.push(`::--webkit-scrollbar-thumb:hover { background-color: ${styles.sliderHoverColor}; }`);
            }
            if (styles.buttonBackground) {
                content.push(`.monaco-text-button { background-color: ${styles.buttonBackground} !important; }`);
            }
            if (styles.buttonForeground) {
                content.push(`.monaco-text-button { color: ${styles.buttonForeground} !important; }`);
            }
            if (styles.buttonHoverBackground) {
                content.push(`.monaco-text-button:not(.disabled):hover, .monaco-text-button:focus { background-color: ${styles.buttonHoverBackground} !important; }`);
            }
            styleTag.textContent = content.join('\n');
            document.head.appendChild(styleTag);
            document.body.style.color = styles.color || '';
        }
        handleExtensionData(extensions) {
            const installedExtensions = extensions.filter(x => !x.isBuiltin);
            const { nonThemes, themes } = (0, collections_1.groupBy)(installedExtensions, ext => {
                return ext.isTheme ? 'themes' : 'nonThemes';
            });
            const numberOfThemeExtesions = themes && themes.length;
            this.issueReporterModel.update({ numberOfThemeExtesions, enabledNonThemeExtesions: nonThemes, allExtensions: installedExtensions });
            this.updateExtensionTable(nonThemes, numberOfThemeExtesions);
            if (this.configuration.disableExtensions || installedExtensions.length === 0) {
                this.getElementById('disableExtensions').disabled = true;
            }
            this.updateExtensionSelector(installedExtensions);
        }
        async updateIssueReporterUri(extension) {
            try {
                const uri = await this.issueMainService.$getIssueReporterUri(extension.id);
                extension.bugsUrl = uri.toString(true);
            }
            catch (e) {
                extension.hasIssueUriRequestHandler = false;
                // The issue handler failed so fall back to old issue reporter experience.
                this.renderBlocks();
            }
        }
        setEventHandlers() {
            this.addEventListener('issue-type', 'change', (event) => {
                const issueType = parseInt(event.target.value);
                this.issueReporterModel.update({ issueType: issueType });
                if (issueType === 1 /* IssueType.PerformanceIssue */ && !this.receivedPerformanceInfo) {
                    this.issueMainService.$getPerformanceInfo().then(info => {
                        this.updatePerformanceInfo(info);
                    });
                }
                this.updatePreviewButtonState();
                this.setSourceOptions();
                this.render();
            });
            ['includeSystemInfo', 'includeProcessInfo', 'includeWorkspaceInfo', 'includeExtensions', 'includeExperiments'].forEach(elementId => {
                this.addEventListener(elementId, 'click', (event) => {
                    event.stopPropagation();
                    this.issueReporterModel.update({ [elementId]: !this.issueReporterModel.getData()[elementId] });
                });
            });
            const showInfoElements = document.getElementsByClassName('showInfo');
            for (let i = 0; i < showInfoElements.length; i++) {
                const showInfo = showInfoElements.item(i);
                showInfo.addEventListener('click', (e) => {
                    e.preventDefault();
                    const label = e.target;
                    if (label) {
                        const containingElement = label.parentElement && label.parentElement.parentElement;
                        const info = containingElement && containingElement.lastElementChild;
                        if (info && info.classList.contains('hidden')) {
                            show(info);
                            label.textContent = (0, nls_1.localize)('hide', "hide");
                        }
                        else {
                            hide(info);
                            label.textContent = (0, nls_1.localize)('show', "show");
                        }
                    }
                });
            }
            this.addEventListener('issue-source', 'change', (e) => {
                const value = e.target.value;
                const problemSourceHelpText = this.getElementById('problem-source-help-text');
                if (value === '') {
                    this.issueReporterModel.update({ fileOnExtension: undefined });
                    show(problemSourceHelpText);
                    this.clearSearchResults();
                    this.render();
                    return;
                }
                else {
                    hide(problemSourceHelpText);
                }
                let fileOnExtension, fileOnMarketplace = false;
                if (value === IssueSource.Extension) {
                    fileOnExtension = true;
                }
                else if (value === IssueSource.Marketplace) {
                    fileOnMarketplace = true;
                }
                this.issueReporterModel.update({ fileOnExtension, fileOnMarketplace });
                this.render();
                const title = this.getElementById('issue-title').value;
                this.searchIssues(title, fileOnExtension, fileOnMarketplace);
            });
            this.addEventListener('description', 'input', (e) => {
                const issueDescription = e.target.value;
                this.issueReporterModel.update({ issueDescription });
                // Only search for extension issues on title change
                if (this.issueReporterModel.fileOnExtension() === false) {
                    const title = this.getElementById('issue-title').value;
                    this.searchVSCodeIssues(title, issueDescription);
                }
            });
            this.addEventListener('issue-title', 'input', (e) => {
                const title = e.target.value;
                const lengthValidationMessage = this.getElementById('issue-title-length-validation-error');
                const issueUrl = this.getIssueUrl();
                if (title && this.getIssueUrlWithTitle(title, issueUrl).length > MAX_URL_LENGTH) {
                    show(lengthValidationMessage);
                }
                else {
                    hide(lengthValidationMessage);
                }
                const issueSource = this.getElementById('issue-source');
                if (!issueSource || issueSource.value === '') {
                    return;
                }
                const { fileOnExtension, fileOnMarketplace } = this.issueReporterModel.getData();
                this.searchIssues(title, fileOnExtension, fileOnMarketplace);
            });
            this.previewButton.onDidClick(async () => {
                this.delayedSubmit.trigger(async () => {
                    this.createIssue();
                });
            });
            this.addEventListener('disableExtensions', 'click', () => {
                this.issueMainService.$reloadWithExtensionsDisabled();
            });
            this.addEventListener('extensionBugsLink', 'click', (e) => {
                const url = e.target.innerText;
                (0, dom_1.windowOpenNoOpener)(url);
            });
            this.addEventListener('disableExtensions', 'keydown', (e) => {
                e.stopPropagation();
                if (e.keyCode === 13 || e.keyCode === 32) {
                    this.issueMainService.$reloadWithExtensionsDisabled();
                }
            });
            document.onkeydown = async (e) => {
                const cmdOrCtrlKey = platform_1.isMacintosh ? e.metaKey : e.ctrlKey;
                // Cmd/Ctrl+Enter previews issue and closes window
                if (cmdOrCtrlKey && e.keyCode === 13) {
                    this.delayedSubmit.trigger(async () => {
                        if (await this.createIssue()) {
                            this.close();
                        }
                    });
                }
                // Cmd/Ctrl + w closes issue window
                if (cmdOrCtrlKey && e.keyCode === 87) {
                    e.stopPropagation();
                    e.preventDefault();
                    const issueTitle = this.getElementById('issue-title').value;
                    const { issueDescription } = this.issueReporterModel.getData();
                    if (!this.hasBeenSubmitted && (issueTitle || issueDescription)) {
                        // fire and forget
                        this.issueMainService.$showConfirmCloseDialog();
                    }
                    else {
                        this.close();
                    }
                }
                // Cmd/Ctrl + zooms in
                if (cmdOrCtrlKey && e.keyCode === 187) {
                    (0, window_1.zoomIn)();
                }
                // Cmd/Ctrl - zooms out
                if (cmdOrCtrlKey && e.keyCode === 189) {
                    (0, window_1.zoomOut)();
                }
                // With latest electron upgrade, cmd+a is no longer propagating correctly for inputs in this window on mac
                // Manually perform the selection
                if (platform_1.isMacintosh) {
                    if (cmdOrCtrlKey && e.keyCode === 65 && e.target) {
                        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                            e.target.select();
                        }
                    }
                }
            };
        }
        updatePerformanceInfo(info) {
            this.issueReporterModel.update(info);
            this.receivedPerformanceInfo = true;
            const state = this.issueReporterModel.getData();
            this.updateProcessInfo(state);
            this.updateWorkspaceInfo(state);
            this.updatePreviewButtonState();
        }
        updatePreviewButtonState() {
            if (this.isPreviewEnabled()) {
                if (this.configuration.data.githubAccessToken) {
                    this.previewButton.label = (0, nls_1.localize)('createOnGitHub', "Create on GitHub");
                }
                else {
                    this.previewButton.label = (0, nls_1.localize)('previewOnGitHub', "Preview on GitHub");
                }
                this.previewButton.enabled = true;
            }
            else {
                this.previewButton.enabled = false;
                this.previewButton.label = (0, nls_1.localize)('loadingData', "Loading data...");
            }
        }
        isPreviewEnabled() {
            const issueType = this.issueReporterModel.getData().issueType;
            if (issueType === 0 /* IssueType.Bug */ && this.receivedSystemInfo) {
                return true;
            }
            if (issueType === 1 /* IssueType.PerformanceIssue */ && this.receivedSystemInfo && this.receivedPerformanceInfo) {
                return true;
            }
            if (issueType === 2 /* IssueType.FeatureRequest */) {
                return true;
            }
            return false;
        }
        getExtensionRepositoryUrl() {
            const selectedExtension = this.issueReporterModel.getData().selectedExtension;
            return selectedExtension && selectedExtension.repositoryUrl;
        }
        getExtensionBugsUrl() {
            const selectedExtension = this.issueReporterModel.getData().selectedExtension;
            return selectedExtension && selectedExtension.bugsUrl;
        }
        searchVSCodeIssues(title, issueDescription) {
            if (title) {
                this.searchDuplicates(title, issueDescription);
            }
            else {
                this.clearSearchResults();
            }
        }
        searchIssues(title, fileOnExtension, fileOnMarketplace) {
            if (fileOnExtension) {
                return this.searchExtensionIssues(title);
            }
            if (fileOnMarketplace) {
                return this.searchMarketplaceIssues(title);
            }
            const description = this.issueReporterModel.getData().issueDescription;
            this.searchVSCodeIssues(title, description);
        }
        searchExtensionIssues(title) {
            const url = this.getExtensionGitHubUrl();
            if (title) {
                const matches = /^https?:\/\/github\.com\/(.*)/.exec(url);
                if (matches && matches.length) {
                    const repo = matches[1];
                    return this.searchGitHub(repo, title);
                }
                // If the extension has no repository, display empty search results
                if (this.issueReporterModel.getData().selectedExtension) {
                    this.clearSearchResults();
                    return this.displaySearchResults([]);
                }
            }
            this.clearSearchResults();
        }
        searchMarketplaceIssues(title) {
            if (title) {
                const gitHubInfo = this.parseGitHubUrl(this.configuration.product.reportMarketplaceIssueUrl);
                if (gitHubInfo) {
                    return this.searchGitHub(`${gitHubInfo.owner}/${gitHubInfo.repositoryName}`, title);
                }
            }
        }
        async close() {
            await this.issueMainService.$closeReporter();
        }
        clearSearchResults() {
            const similarIssues = this.getElementById('similar-issues');
            similarIssues.innerText = '';
            this.numberOfSearchResultsDisplayed = 0;
        }
        searchGitHub(repo, title) {
            const query = `is:issue+repo:${repo}+${title}`;
            const similarIssues = this.getElementById('similar-issues');
            window.fetch(`https://api.github.com/search/issues?q=${query}`).then((response) => {
                response.json().then(result => {
                    similarIssues.innerText = '';
                    if (result && result.items) {
                        this.displaySearchResults(result.items);
                    }
                    else {
                        // If the items property isn't present, the rate limit has been hit
                        const message = (0, dom_1.$)('div.list-title');
                        message.textContent = (0, nls_1.localize)('rateLimited', "GitHub query limit exceeded. Please wait.");
                        similarIssues.appendChild(message);
                        const resetTime = response.headers.get('X-RateLimit-Reset');
                        const timeToWait = resetTime ? parseInt(resetTime) - Math.floor(Date.now() / 1000) : 1;
                        if (this.shouldQueueSearch) {
                            this.shouldQueueSearch = false;
                            setTimeout(() => {
                                this.searchGitHub(repo, title);
                                this.shouldQueueSearch = true;
                            }, timeToWait * 1000);
                        }
                    }
                }).catch(_ => {
                    // Ignore
                });
            }).catch(_ => {
                // Ignore
            });
        }
        searchDuplicates(title, body) {
            const url = 'https://vscode-probot.westus.cloudapp.azure.com:7890/duplicate_candidates';
            const init = {
                method: 'POST',
                body: JSON.stringify({
                    title,
                    body
                }),
                headers: new Headers({
                    'Content-Type': 'application/json'
                })
            };
            window.fetch(url, init).then((response) => {
                response.json().then(result => {
                    this.clearSearchResults();
                    if (result && result.candidates) {
                        this.displaySearchResults(result.candidates);
                    }
                    else {
                        throw new Error('Unexpected response, no candidates property');
                    }
                }).catch(_ => {
                    // Ignore
                });
            }).catch(_ => {
                // Ignore
            });
        }
        displaySearchResults(results) {
            const similarIssues = this.getElementById('similar-issues');
            if (results.length) {
                const issues = (0, dom_1.$)('div.issues-container');
                const issuesText = (0, dom_1.$)('div.list-title');
                issuesText.textContent = (0, nls_1.localize)('similarIssues', "Similar issues");
                this.numberOfSearchResultsDisplayed = results.length < 5 ? results.length : 5;
                for (let i = 0; i < this.numberOfSearchResultsDisplayed; i++) {
                    const issue = results[i];
                    const link = (0, dom_1.$)('a.issue-link', { href: issue.html_url });
                    link.textContent = issue.title;
                    link.title = issue.title;
                    link.addEventListener('click', (e) => this.openLink(e));
                    link.addEventListener('auxclick', (e) => this.openLink(e));
                    let issueState;
                    let item;
                    if (issue.state) {
                        issueState = (0, dom_1.$)('span.issue-state');
                        const issueIcon = (0, dom_1.$)('span.issue-icon');
                        issueIcon.appendChild((0, iconLabels_1.renderIcon)(issue.state === 'open' ? codicons_1.Codicon.issueOpened : codicons_1.Codicon.issueClosed));
                        const issueStateLabel = (0, dom_1.$)('span.issue-state.label');
                        issueStateLabel.textContent = issue.state === 'open' ? (0, nls_1.localize)('open', "Open") : (0, nls_1.localize)('closed', "Closed");
                        issueState.title = issue.state === 'open' ? (0, nls_1.localize)('open', "Open") : (0, nls_1.localize)('closed', "Closed");
                        issueState.appendChild(issueIcon);
                        issueState.appendChild(issueStateLabel);
                        item = (0, dom_1.$)('div.issue', undefined, issueState, link);
                    }
                    else {
                        item = (0, dom_1.$)('div.issue', undefined, link);
                    }
                    issues.appendChild(item);
                }
                similarIssues.appendChild(issuesText);
                similarIssues.appendChild(issues);
            }
            else {
                const message = (0, dom_1.$)('div.list-title');
                message.textContent = (0, nls_1.localize)('noSimilarIssues', "No similar issues found");
                similarIssues.appendChild(message);
            }
        }
        setUpTypes() {
            const makeOption = (issueType, description) => (0, dom_1.$)('option', { 'value': issueType.valueOf() }, (0, strings_1.escape)(description));
            const typeSelect = this.getElementById('issue-type');
            const { issueType } = this.issueReporterModel.getData();
            (0, dom_1.reset)(typeSelect, makeOption(0 /* IssueType.Bug */, (0, nls_1.localize)('bugReporter', "Bug Report")), makeOption(2 /* IssueType.FeatureRequest */, (0, nls_1.localize)('featureRequest', "Feature Request")), makeOption(1 /* IssueType.PerformanceIssue */, (0, nls_1.localize)('performanceIssue', "Performance Issue")));
            typeSelect.value = issueType.toString();
            this.setSourceOptions();
        }
        makeOption(value, description, disabled) {
            const option = document.createElement('option');
            option.disabled = disabled;
            option.value = value;
            option.textContent = description;
            return option;
        }
        setSourceOptions() {
            const sourceSelect = this.getElementById('issue-source');
            const { issueType, fileOnExtension, selectedExtension } = this.issueReporterModel.getData();
            let selected = sourceSelect.selectedIndex;
            if (selected === -1) {
                if (fileOnExtension !== undefined) {
                    selected = fileOnExtension ? 2 : 1;
                }
                else if (selectedExtension?.isBuiltin) {
                    selected = 1;
                }
            }
            sourceSelect.innerText = '';
            sourceSelect.append(this.makeOption('', (0, nls_1.localize)('selectSource', "Select source"), true));
            sourceSelect.append(this.makeOption('vscode', (0, nls_1.localize)('vscode', "Visual Studio Code"), false));
            sourceSelect.append(this.makeOption('extension', (0, nls_1.localize)('extension', "An extension"), false));
            if (this.configuration.product.reportMarketplaceIssueUrl) {
                sourceSelect.append(this.makeOption('marketplace', (0, nls_1.localize)('marketplace', "Extensions marketplace"), false));
            }
            if (issueType !== 2 /* IssueType.FeatureRequest */) {
                sourceSelect.append(this.makeOption('', (0, nls_1.localize)('unknown', "Don't know"), false));
            }
            if (selected !== -1 && selected < sourceSelect.options.length) {
                sourceSelect.selectedIndex = selected;
            }
            else {
                sourceSelect.selectedIndex = 0;
                hide(this.getElementById('problem-source-help-text'));
            }
        }
        renderBlocks() {
            // Depending on Issue Type, we render different blocks and text
            const { issueType, fileOnExtension, fileOnMarketplace, selectedExtension } = this.issueReporterModel.getData();
            const blockContainer = this.getElementById('block-container');
            const systemBlock = document.querySelector('.block-system');
            const processBlock = document.querySelector('.block-process');
            const workspaceBlock = document.querySelector('.block-workspace');
            const extensionsBlock = document.querySelector('.block-extensions');
            const experimentsBlock = document.querySelector('.block-experiments');
            const problemSource = this.getElementById('problem-source');
            const descriptionTitle = this.getElementById('issue-description-label');
            const descriptionSubtitle = this.getElementById('issue-description-subtitle');
            const extensionSelector = this.getElementById('extension-selection');
            const titleTextArea = this.getElementById('issue-title-container');
            const descriptionTextArea = this.getElementById('description');
            // Hide all by default
            hide(blockContainer);
            hide(systemBlock);
            hide(processBlock);
            hide(workspaceBlock);
            hide(extensionsBlock);
            hide(experimentsBlock);
            hide(problemSource);
            hide(extensionSelector);
            show(problemSource);
            show(titleTextArea);
            show(descriptionTextArea);
            if (fileOnExtension) {
                show(extensionSelector);
            }
            if (fileOnExtension && selectedExtension?.hasIssueUriRequestHandler) {
                hide(titleTextArea);
                hide(descriptionTextArea);
                (0, dom_1.reset)(descriptionTitle, (0, nls_1.localize)('handlesIssuesElsewhere', "This extension handles issues outside of VS Code"));
                (0, dom_1.reset)(descriptionSubtitle, (0, nls_1.localize)('elsewhereDescription', "The '{0}' extension prefers to use an external issue reporter. To be taken to that issue reporting experience, click the button below.", selectedExtension.displayName));
                this.previewButton.label = (0, nls_1.localize)('openIssueReporter', "Open External Issue Reporter");
                return;
            }
            if (issueType === 0 /* IssueType.Bug */) {
                if (!fileOnMarketplace) {
                    show(blockContainer);
                    show(systemBlock);
                    show(experimentsBlock);
                    if (!fileOnExtension) {
                        show(extensionsBlock);
                    }
                }
                (0, dom_1.reset)(descriptionTitle, (0, nls_1.localize)('stepsToReproduce', "Steps to Reproduce") + ' ', (0, dom_1.$)('span.required-input', undefined, '*'));
                (0, dom_1.reset)(descriptionSubtitle, (0, nls_1.localize)('bugDescription', "Share the steps needed to reliably reproduce the problem. Please include actual and expected results. We support GitHub-flavored Markdown. You will be able to edit your issue and add screenshots when we preview it on GitHub."));
            }
            else if (issueType === 1 /* IssueType.PerformanceIssue */) {
                if (!fileOnMarketplace) {
                    show(blockContainer);
                    show(systemBlock);
                    show(processBlock);
                    show(workspaceBlock);
                    show(experimentsBlock);
                }
                if (fileOnExtension) {
                    show(extensionSelector);
                }
                else if (!fileOnMarketplace) {
                    show(extensionsBlock);
                }
                (0, dom_1.reset)(descriptionTitle, (0, nls_1.localize)('stepsToReproduce', "Steps to Reproduce") + ' ', (0, dom_1.$)('span.required-input', undefined, '*'));
                (0, dom_1.reset)(descriptionSubtitle, (0, nls_1.localize)('performanceIssueDesciption', "When did this performance issue happen? Does it occur on startup or after a specific series of actions? We support GitHub-flavored Markdown. You will be able to edit your issue and add screenshots when we preview it on GitHub."));
            }
            else if (issueType === 2 /* IssueType.FeatureRequest */) {
                (0, dom_1.reset)(descriptionTitle, (0, nls_1.localize)('description', "Description") + ' ', (0, dom_1.$)('span.required-input', undefined, '*'));
                (0, dom_1.reset)(descriptionSubtitle, (0, nls_1.localize)('featureRequestDescription', "Please describe the feature you would like to see. We support GitHub-flavored Markdown. You will be able to edit your issue and add screenshots when we preview it on GitHub."));
            }
        }
        validateInput(inputId) {
            const inputElement = this.getElementById(inputId);
            const inputValidationMessage = this.getElementById(`${inputId}-empty-error`);
            if (!inputElement.value) {
                inputElement.classList.add('invalid-input');
                inputValidationMessage?.classList.remove('hidden');
                return false;
            }
            else {
                inputElement.classList.remove('invalid-input');
                inputValidationMessage?.classList.add('hidden');
                return true;
            }
        }
        validateInputs() {
            let isValid = true;
            ['issue-title', 'description', 'issue-source'].forEach(elementId => {
                isValid = this.validateInput(elementId) && isValid;
            });
            if (this.issueReporterModel.fileOnExtension()) {
                isValid = this.validateInput('extension-selector') && isValid;
            }
            return isValid;
        }
        async submitToGitHub(issueTitle, issueBody, gitHubDetails) {
            const url = `https://api.github.com/repos/${gitHubDetails.owner}/${gitHubDetails.repositoryName}/issues`;
            const init = {
                method: 'POST',
                body: JSON.stringify({
                    title: issueTitle,
                    body: issueBody
                }),
                headers: new Headers({
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.configuration.data.githubAccessToken}`
                })
            };
            const response = await window.fetch(url, init);
            if (!response.ok) {
                return false;
            }
            const result = await response.json();
            await this.nativeHostService.openExternal(result.html_url);
            this.close();
            return true;
        }
        async createIssue() {
            // Short circuit if the extension provides a custom issue handler
            if (this.issueReporterModel.getData().selectedExtension?.hasIssueUriRequestHandler) {
                const url = this.getExtensionBugsUrl();
                if (url) {
                    this.hasBeenSubmitted = true;
                    await this.nativeHostService.openExternal(url);
                    return true;
                }
            }
            if (!this.validateInputs()) {
                // If inputs are invalid, set focus to the first one and add listeners on them
                // to detect further changes
                const invalidInput = document.getElementsByClassName('invalid-input');
                if (invalidInput.length) {
                    invalidInput[0].focus();
                }
                this.addEventListener('issue-title', 'input', _ => {
                    this.validateInput('issue-title');
                });
                this.addEventListener('description', 'input', _ => {
                    this.validateInput('description');
                });
                this.addEventListener('issue-source', 'change', _ => {
                    this.validateInput('issue-source');
                });
                if (this.issueReporterModel.fileOnExtension()) {
                    this.addEventListener('extension-selector', 'change', _ => {
                        this.validateInput('extension-selector');
                    });
                }
                return false;
            }
            this.hasBeenSubmitted = true;
            const issueTitle = this.getElementById('issue-title').value;
            const issueBody = this.issueReporterModel.serialize();
            const issueUrl = this.getIssueUrl();
            const gitHubDetails = this.parseGitHubUrl(issueUrl);
            if (this.configuration.data.githubAccessToken && gitHubDetails) {
                return this.submitToGitHub(issueTitle, issueBody, gitHubDetails);
            }
            const baseUrl = this.getIssueUrlWithTitle(this.getElementById('issue-title').value, issueUrl);
            let url = baseUrl + `&body=${encodeURIComponent(issueBody)}`;
            if (url.length > MAX_URL_LENGTH) {
                try {
                    url = await this.writeToClipboard(baseUrl, issueBody);
                }
                catch (_) {
                    return false;
                }
            }
            await this.nativeHostService.openExternal(url);
            return true;
        }
        async writeToClipboard(baseUrl, issueBody) {
            const shouldWrite = await this.issueMainService.$showClipboardDialog();
            if (!shouldWrite) {
                throw new errors_1.CancellationError();
            }
            await this.nativeHostService.writeClipboardText(issueBody);
            return baseUrl + `&body=${encodeURIComponent((0, nls_1.localize)('pasteData', "We have written the needed data into your clipboard because it was too large to send. Please paste."))}`;
        }
        getIssueUrl() {
            return this.issueReporterModel.fileOnExtension()
                ? this.getExtensionGitHubUrl()
                : this.issueReporterModel.getData().fileOnMarketplace
                    ? this.configuration.product.reportMarketplaceIssueUrl
                    : this.configuration.product.reportIssueUrl;
        }
        parseGitHubUrl(url) {
            // Assumes a GitHub url to a particular repo, https://github.com/repositoryName/owner.
            // Repository name and owner cannot contain '/'
            const match = /^https?:\/\/github\.com\/([^\/]*)\/([^\/]*).*/.exec(url);
            if (match && match.length) {
                return {
                    owner: match[1],
                    repositoryName: match[2]
                };
            }
            return undefined;
        }
        getExtensionGitHubUrl() {
            let repositoryUrl = '';
            const bugsUrl = this.getExtensionBugsUrl();
            const extensionUrl = this.getExtensionRepositoryUrl();
            // If given, try to match the extension's bug url
            if (bugsUrl && bugsUrl.match(/^https?:\/\/github\.com\/(.*)/)) {
                repositoryUrl = (0, issueReporterUtil_1.normalizeGitHubUrl)(bugsUrl);
            }
            else if (extensionUrl && extensionUrl.match(/^https?:\/\/github\.com\/(.*)/)) {
                repositoryUrl = (0, issueReporterUtil_1.normalizeGitHubUrl)(extensionUrl);
            }
            return repositoryUrl;
        }
        getIssueUrlWithTitle(issueTitle, repositoryUrl) {
            if (this.issueReporterModel.fileOnExtension()) {
                repositoryUrl = repositoryUrl + '/issues/new';
            }
            const queryStringPrefix = repositoryUrl.indexOf('?') === -1 ? '?' : '&';
            return `${repositoryUrl}${queryStringPrefix}title=${encodeURIComponent(issueTitle)}`;
        }
        updateSystemInfo(state) {
            const target = document.querySelector('.block-system .block-info');
            if (target) {
                const systemInfo = state.systemInfo;
                const renderedDataTable = (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, 'CPUs'), (0, dom_1.$)('td', undefined, systemInfo.cpus || '')), (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, 'GPU Status'), (0, dom_1.$)('td', undefined, Object.keys(systemInfo.gpuStatus).map(key => `${key}: ${systemInfo.gpuStatus[key]}`).join('\n'))), (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, 'Load (avg)'), (0, dom_1.$)('td', undefined, systemInfo.load || '')), (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, 'Memory (System)'), (0, dom_1.$)('td', undefined, systemInfo.memory)), (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, 'Process Argv'), (0, dom_1.$)('td', undefined, systemInfo.processArgs)), (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, 'Screen Reader'), (0, dom_1.$)('td', undefined, systemInfo.screenReader)), (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, 'VM'), (0, dom_1.$)('td', undefined, systemInfo.vmHint)));
                (0, dom_1.reset)(target, renderedDataTable);
                systemInfo.remoteData.forEach(remote => {
                    target.appendChild((0, dom_1.$)('hr'));
                    if ((0, diagnostics_1.isRemoteDiagnosticError)(remote)) {
                        const remoteDataTable = (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, 'Remote'), (0, dom_1.$)('td', undefined, remote.hostName)), (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, ''), (0, dom_1.$)('td', undefined, remote.errorMessage)));
                        target.appendChild(remoteDataTable);
                    }
                    else {
                        const remoteDataTable = (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, 'Remote'), (0, dom_1.$)('td', undefined, remote.latency ? `${remote.hostName} (latency: ${remote.latency.current.toFixed(2)}ms last, ${remote.latency.average.toFixed(2)}ms average)` : remote.hostName)), (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, 'OS'), (0, dom_1.$)('td', undefined, remote.machineInfo.os)), (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, 'CPUs'), (0, dom_1.$)('td', undefined, remote.machineInfo.cpus || '')), (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, 'Memory (System)'), (0, dom_1.$)('td', undefined, remote.machineInfo.memory)), (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, 'VM'), (0, dom_1.$)('td', undefined, remote.machineInfo.vmHint)));
                        target.appendChild(remoteDataTable);
                    }
                });
            }
        }
        updateExtensionSelector(extensions) {
            const extensionOptions = extensions.map(extension => {
                return {
                    name: extension.displayName || extension.name || '',
                    id: extension.id
                };
            });
            // Sort extensions by name
            extensionOptions.sort((a, b) => {
                const aName = a.name.toLowerCase();
                const bName = b.name.toLowerCase();
                if (aName > bName) {
                    return 1;
                }
                if (aName < bName) {
                    return -1;
                }
                return 0;
            });
            const makeOption = (extension, selectedExtension) => {
                const selected = selectedExtension && extension.id === selectedExtension.id;
                return (0, dom_1.$)('option', {
                    'value': extension.id,
                    'selected': selected || ''
                }, extension.name);
            };
            const extensionsSelector = this.getElementById('extension-selector');
            if (extensionsSelector) {
                const { selectedExtension } = this.issueReporterModel.getData();
                (0, dom_1.reset)(extensionsSelector, this.makeOption('', (0, nls_1.localize)('selectExtension', "Select extension"), true), ...extensionOptions.map(extension => makeOption(extension, selectedExtension)));
                extensionsSelector.selectedIndex = 0;
                this.addEventListener('extension-selector', 'change', (e) => {
                    const selectedExtensionId = e.target.value;
                    const extensions = this.issueReporterModel.getData().allExtensions;
                    const matches = extensions.filter(extension => extension.id === selectedExtensionId);
                    if (matches.length) {
                        this.issueReporterModel.update({ selectedExtension: matches[0] });
                        if (matches[0].hasIssueUriRequestHandler) {
                            this.updateIssueReporterUri(matches[0]);
                        }
                        else {
                            this.validateSelectedExtension();
                            const title = this.getElementById('issue-title').value;
                            this.searchExtensionIssues(title);
                        }
                    }
                    else {
                        this.issueReporterModel.update({ selectedExtension: undefined });
                        this.clearSearchResults();
                        this.validateSelectedExtension();
                    }
                    this.updatePreviewButtonState();
                    this.renderBlocks();
                });
            }
            this.addEventListener('problem-source', 'change', (_) => {
                this.validateSelectedExtension();
            });
        }
        validateSelectedExtension() {
            const extensionValidationMessage = this.getElementById('extension-selection-validation-error');
            const extensionValidationNoUrlsMessage = this.getElementById('extension-selection-validation-error-no-url');
            hide(extensionValidationMessage);
            hide(extensionValidationNoUrlsMessage);
            const extension = this.issueReporterModel.getData().selectedExtension;
            if (!extension) {
                this.previewButton.enabled = true;
                return;
            }
            const hasValidGitHubUrl = this.getExtensionGitHubUrl();
            if (hasValidGitHubUrl || extension.hasIssueUriRequestHandler) {
                this.previewButton.enabled = true;
            }
            else {
                this.setExtensionValidationMessage();
                this.previewButton.enabled = false;
            }
        }
        setExtensionValidationMessage() {
            const extensionValidationMessage = this.getElementById('extension-selection-validation-error');
            const extensionValidationNoUrlsMessage = this.getElementById('extension-selection-validation-error-no-url');
            const bugsUrl = this.getExtensionBugsUrl();
            if (bugsUrl) {
                show(extensionValidationMessage);
                const link = this.getElementById('extensionBugsLink');
                link.textContent = bugsUrl;
                return;
            }
            const extensionUrl = this.getExtensionRepositoryUrl();
            if (extensionUrl) {
                show(extensionValidationMessage);
                const link = this.getElementById('extensionBugsLink');
                link.textContent = extensionUrl;
                return;
            }
            show(extensionValidationNoUrlsMessage);
        }
        updateProcessInfo(state) {
            const target = document.querySelector('.block-process .block-info');
            if (target) {
                (0, dom_1.reset)(target, (0, dom_1.$)('code', undefined, state.processInfo ?? ''));
            }
        }
        updateWorkspaceInfo(state) {
            document.querySelector('.block-workspace .block-info code').textContent = '\n' + state.workspaceInfo;
        }
        updateExtensionTable(extensions, numThemeExtensions) {
            const target = document.querySelector('.block-extensions .block-info');
            if (target) {
                if (this.configuration.disableExtensions) {
                    (0, dom_1.reset)(target, (0, nls_1.localize)('disabledExtensions', "Extensions are disabled"));
                    return;
                }
                const themeExclusionStr = numThemeExtensions ? `\n(${numThemeExtensions} theme extensions excluded)` : '';
                extensions = extensions || [];
                if (!extensions.length) {
                    target.innerText = 'Extensions: none' + themeExclusionStr;
                    return;
                }
                (0, dom_1.reset)(target, this.getExtensionTableHtml(extensions), document.createTextNode(themeExclusionStr));
            }
        }
        updateRestrictedMode(restrictedMode) {
            this.issueReporterModel.update({ restrictedMode });
        }
        updateUnsupportedMode(isUnsupported) {
            this.issueReporterModel.update({ isUnsupported });
        }
        updateExperimentsInfo(experimentInfo) {
            this.issueReporterModel.update({ experimentInfo });
            const target = document.querySelector('.block-experiments .block-info');
            if (target) {
                target.textContent = experimentInfo ? experimentInfo : (0, nls_1.localize)('noCurrentExperiments', "No current experiments.");
            }
        }
        getExtensionTableHtml(extensions) {
            return (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, 'Extension'), (0, dom_1.$)('th', undefined, 'Author (truncated)'), (0, dom_1.$)('th', undefined, 'Version')), ...extensions.map(extension => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, extension.name), (0, dom_1.$)('td', undefined, extension.publisher?.substr(0, 3) ?? 'N/A'), (0, dom_1.$)('td', undefined, extension.version))));
        }
        openLink(event) {
            event.preventDefault();
            event.stopPropagation();
            // Exclude right click
            if (event.which < 3) {
                (0, dom_1.windowOpenNoOpener)(event.target.href);
            }
        }
        getElementById(elementId) {
            const element = document.getElementById(elementId);
            if (element) {
                return element;
            }
            else {
                return undefined;
            }
        }
        addEventListener(elementId, eventType, handler) {
            const element = this.getElementById(elementId);
            element?.addEventListener(eventType, handler);
        }
    };
    exports.IssueReporter = IssueReporter;
    __decorate([
        (0, decorators_1.debounce)(300)
    ], IssueReporter.prototype, "searchGitHub", null);
    __decorate([
        (0, decorators_1.debounce)(300)
    ], IssueReporter.prototype, "searchDuplicates", null);
    exports.IssueReporter = IssueReporter = __decorate([
        __param(1, native_1.INativeHostService),
        __param(2, issue_1.IIssueMainService)
    ], IssueReporter);
    // helper functions
    function hide(el) {
        el?.classList.add('hidden');
    }
    exports.hide = hide;
    function show(el) {
        el?.classList.remove('hidden');
    }
    exports.show = show;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXNzdWVSZXBvcnRlclNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9jb2RlL2VsZWN0cm9uLXNhbmRib3gvaXNzdWUvaXNzdWVSZXBvcnRlclNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQXVCQSwrRkFBK0Y7SUFDL0Ysd0RBQXdEO0lBQ3hELE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQztJQVE1QixJQUFLLFdBSUo7SUFKRCxXQUFLLFdBQVc7UUFDZixnQ0FBaUIsQ0FBQTtRQUNqQixzQ0FBdUIsQ0FBQTtRQUN2QiwwQ0FBMkIsQ0FBQTtJQUM1QixDQUFDLEVBSkksV0FBVyxLQUFYLFdBQVcsUUFJZjtJQUVNLElBQU0sYUFBYSxHQUFuQixNQUFNLGFBQWMsU0FBUSxzQkFBVTtRQVc1QyxZQUNrQixhQUErQyxFQUM1QyxpQkFBc0QsRUFDdkQsZ0JBQW9EO1lBRXZFLEtBQUssRUFBRSxDQUFDO1lBSlMsa0JBQWEsR0FBYixhQUFhLENBQWtDO1lBQzNCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFDdEMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQVpoRSxtQ0FBOEIsR0FBRyxDQUFDLENBQUM7WUFDbkMsdUJBQWtCLEdBQUcsS0FBSyxDQUFDO1lBQzNCLDRCQUF1QixHQUFHLEtBQUssQ0FBQztZQUNoQyxzQkFBaUIsR0FBRyxLQUFLLENBQUM7WUFDMUIscUJBQWdCLEdBQUcsS0FBSyxDQUFDO1lBQ3pCLGtCQUFhLEdBQUcsSUFBSSxlQUFPLENBQU8sR0FBRyxDQUFDLENBQUM7WUFVOUMsTUFBTSxlQUFlLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FB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