/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls"], function (require, exports, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getTemplates = void 0;
    const dotnetBuild = {
        id: 'dotnetCore',
        label: '.NET Core',
        sort: 'NET Core',
        autoDetect: false,
        description: nls.localize('dotnetCore', 'Executes .NET Core build command'),
        content: [
            '{',
            '\t// See https://go.microsoft.com/fwlink/?LinkId=733558',
            '\t// for the documentation about the tasks.json format',
            '\t"version": "2.0.0",',
            '\t"tasks": [',
            '\t\t{',
            '\t\t\t"label": "build",',
            '\t\t\t"command": "dotnet",',
            '\t\t\t"type": "shell",',
            '\t\t\t"args": [',
            '\t\t\t\t"build",',
            '\t\t\t\t// Ask dotnet build to generate full paths for file names.',
            '\t\t\t\t"/property:GenerateFullPaths=true",',
            '\t\t\t\t// Do not generate summary otherwise it leads to duplicate errors in Problems panel',
            '\t\t\t\t"/consoleloggerparameters:NoSummary"',
            '\t\t\t],',
            '\t\t\t"group": "build",',
            '\t\t\t"presentation": {',
            '\t\t\t\t"reveal": "silent"',
            '\t\t\t},',
            '\t\t\t"problemMatcher": "$msCompile"',
            '\t\t}',
            '\t]',
            '}'
        ].join('\n')
    };
    const msbuild = {
        id: 'msbuild',
        label: 'MSBuild',
        autoDetect: false,
        description: nls.localize('msbuild', 'Executes the build target'),
        content: [
            '{',
            '\t// See https://go.microsoft.com/fwlink/?LinkId=733558',
            '\t// for the documentation about the tasks.json format',
            '\t"version": "2.0.0",',
            '\t"tasks": [',
            '\t\t{',
            '\t\t\t"label": "build",',
            '\t\t\t"type": "shell",',
            '\t\t\t"command": "msbuild",',
            '\t\t\t"args": [',
            '\t\t\t\t// Ask msbuild to generate full paths for file names.',
            '\t\t\t\t"/property:GenerateFullPaths=true",',
            '\t\t\t\t"/t:build",',
            '\t\t\t\t// Do not generate summary otherwise it leads to duplicate errors in Problems panel',
            '\t\t\t\t"/consoleloggerparameters:NoSummary"',
            '\t\t\t],',
            '\t\t\t"group": "build",',
            '\t\t\t"presentation": {',
            '\t\t\t\t// Reveal the output only if unrecognized errors occur.',
            '\t\t\t\t"reveal": "silent"',
            '\t\t\t},',
            '\t\t\t// Use the standard MS compiler pattern to detect errors, warnings and infos',
            '\t\t\t"problemMatcher": "$msCompile"',
            '\t\t}',
            '\t]',
            '}'
        ].join('\n')
    };
    const command = {
        id: 'externalCommand',
        label: 'Others',
        autoDetect: false,
        description: nls.localize('externalCommand', 'Example to run an arbitrary external command'),
        content: [
            '{',
            '\t// See https://go.microsoft.com/fwlink/?LinkId=733558',
            '\t// for the documentation about the tasks.json format',
            '\t"version": "2.0.0",',
            '\t"tasks": [',
            '\t\t{',
            '\t\t\t"label": "echo",',
            '\t\t\t"type": "shell",',
            '\t\t\t"command": "echo Hello"',
            '\t\t}',
            '\t]',
            '}'
        ].join('\n')
    };
    const maven = {
        id: 'maven',
        label: 'maven',
        sort: 'MVN',
        autoDetect: false,
        description: nls.localize('Maven', 'Executes common maven commands'),
        content: [
            '{',
            '\t// See https://go.microsoft.com/fwlink/?LinkId=733558',
            '\t// for the documentation about the tasks.json format',
            '\t"version": "2.0.0",',
            '\t"tasks": [',
            '\t\t{',
            '\t\t\t"label": "verify",',
            '\t\t\t"type": "shell",',
            '\t\t\t"command": "mvn -B verify",',
            '\t\t\t"group": "build"',
            '\t\t},',
            '\t\t{',
            '\t\t\t"label": "test",',
            '\t\t\t"type": "shell",',
            '\t\t\t"command": "mvn -B test",',
            '\t\t\t"group": "test"',
            '\t\t}',
            '\t]',
            '}'
        ].join('\n')
    };
    let _templates = null;
    function getTemplates() {
        if (!_templates) {
            _templates = [dotnetBuild, msbuild, maven].sort((a, b) => {
                return (a.sort || a.label).localeCompare(b.sort || b.label);
            });
            _templates.push(command);
        }
        return _templates;
    }
    exports.getTemplates = getTemplates;
});
/** Version 1.0 templates
 *
const gulp: TaskEntry = {
    id: 'gulp',
    label: 'Gulp',
    autoDetect: true,
    content: [
        '{',
        '\t// See https://go.microsoft.com/fwlink/?LinkId=733558',
        '\t// for the documentation about the tasks.json format',
        '\t"version": "0.1.0",',
        '\t"command": "gulp",',
        '\t"isShellCommand": true,',
        '\t"args": ["--no-color"],',
        '\t"showOutput": "always"',
        '}'
    ].join('\n')
};

const grunt: TaskEntry = {
    id: 'grunt',
    label: 'Grunt',
    autoDetect: true,
    content: [
        '{',
        '\t// See https://go.microsoft.com/fwlink/?LinkId=733558',
        '\t// for the documentation about the tasks.json format',
        '\t"version": "0.1.0",',
        '\t"command": "grunt",',
        '\t"isShellCommand": true,',
        '\t"args": ["--no-color"],',
        '\t"showOutput": "always"',
        '}'
    ].join('\n')
};

const npm: TaskEntry = {
    id: 'npm',
    label: 'npm',
    sort: 'NPM',
    autoDetect: false,
    content: [
        '{',
        '\t// See https://go.microsoft.com/fwlink/?LinkId=733558',
        '\t// for the documentation about the tasks.json format',
        '\t"version": "0.1.0",',
        '\t"command": "npm",',
        '\t"isShellCommand": true,',
        '\t"showOutput": "always",',
        '\t"suppressTaskName": true,',
        '\t"tasks": [',
        '\t\t{',
        '\t\t\t"taskName": "install",',
        '\t\t\t"args": ["install"]',
        '\t\t},',
        '\t\t{',
        '\t\t\t"taskName": "update",',
        '\t\t\t"args": ["update"]',
        '\t\t},',
        '\t\t{',
        '\t\t\t"taskName": "test",',
        '\t\t\t"args": ["run", "test"]',
        '\t\t}',
        '\t]',
        '}'
    ].join('\n')
};

const tscConfig: TaskEntry = {
    id: 'tsc.config',
    label: 'TypeScript - tsconfig.json',
    autoDetect: false,
    description: nls.localize('tsc.config', 'Compiles a TypeScript project'),
    content: [
        '{',
        '\t// See https://go.microsoft.com/fwlink/?LinkId=733558',
        '\t// for the documentation about the tasks.json format',
        '\t"version": "0.1.0",',
        '\t"command": "tsc",',
        '\t"isShellCommand": true,',
        '\t"args": ["-p", "."],',
        '\t"showOutput": "silent",',
        '\t"problemMatcher": "$tsc"',
        '}'
    ].join('\n')
};

const tscWatch: TaskEntry = {
    id: 'tsc.watch',
    label: 'TypeScript - Watch Mode',
    autoDetect: false,
    description: nls.localize('tsc.watch', 'Compiles a TypeScript project in watch mode'),
    content: [
        '{',
        '\t// See https://go.microsoft.com/fwlink/?LinkId=733558',
        '\t// for the documentation about the tasks.json format',
        '\t"version": "0.1.0",',
        '\t"command": "tsc",',
        '\t"isShellCommand": true,',
        '\t"args": ["-w", "-p", "."],',
        '\t"showOutput": "silent",',
        '\t"isBackground": true,',
        '\t"problemMatcher": "$tsc-watch"',
        '}'
    ].join('\n')
};

const dotnetBuild: TaskEntry = {
    id: 'dotnetCore',
    label: '.NET Core',
    sort: 'NET Core',
    autoDetect: false,
    description: nls.localize('dotnetCore', 'Executes .NET Core build command'),
    content: [
        '{',
        '\t// See https://go.microsoft.com/fwlink/?LinkId=733558',
        '\t// for the documentation about the tasks.json format',
        '\t"version": "0.1.0",',
        '\t"command": "dotnet",',
        '\t"isShellCommand": true,',
        '\t"args": [],',
        '\t"tasks": [',
        '\t\t{',
        '\t\t\t"taskName": "build",',
        '\t\t\t"args": [ ],',
        '\t\t\t"isBuildCommand": true,',
        '\t\t\t"showOutput": "silent",',
        '\t\t\t"problemMatcher": "$msCompile"',
        '\t\t}',
        '\t]',
        '}'
    ].join('\n')
};

const msbuild: TaskEntry = {
    id: 'msbuild',
    label: 'MSBuild',
    autoDetect: false,
    description: nls.localize('msbuild', 'Executes the build target'),
    content: [
        '{',
        '\t// See https://go.microsoft.com/fwlink/?LinkId=733558',
        '\t// for the documentation about the tasks.json format',
        '\t"version": "0.1.0",',
        '\t"command": "msbuild",',
        '\t"args": [',
        '\t\t// Ask msbuild to generate full paths for file names.',
        '\t\t"/property:GenerateFullPaths=true"',
        '\t],',
        '\t"taskSelector": "/t:",',
        '\t"showOutput": "silent",',
        '\t"tasks": [',
        '\t\t{',
        '\t\t\t"taskName": "build",',
        '\t\t\t// Show the output window only if unrecognized errors occur.',
        '\t\t\t"showOutput": "silent",',
        '\t\t\t// Use the standard MS compiler pattern to detect errors, warnings and infos',
        '\t\t\t"problemMatcher": "$msCompile"',
        '\t\t}',
        '\t]',
        '}'
    ].join('\n')
};

const command: TaskEntry = {
    id: 'externalCommand',
    label: 'Others',
    autoDetect: false,
    description: nls.localize('externalCommand', 'Example to run an arbitrary external command'),
    content: [
        '{',
        '\t// See https://go.microsoft.com/fwlink/?LinkId=733558',
        '\t// for the documentation about the tasks.json format',
        '\t"version": "0.1.0",',
        '\t"command": "echo",',
        '\t"isShellCommand": true,',
        '\t"args": ["Hello World"],',
        '\t"showOutput": "always"',
        '}'
    ].join('\n')
};

const maven: TaskEntry = {
    id: 'maven',
    label: 'maven',
    sort: 'MVN',
    autoDetect: false,
    description: nls.localize('Maven', 'Executes common maven commands'),
    content: [
        '{',
        '\t// See https://go.microsoft.com/fwlink/?LinkId=733558',
        '\t// for the documentation about the tasks.json format',
        '\t"version": "0.1.0",',
        '\t"command": "mvn",',
        '\t"isShellCommand": true,',
        '\t"showOutput": "always",',
        '\t"suppressTaskName": true,',
        '\t"tasks": [',
        '\t\t{',
        '\t\t\t"taskName": "verify",',
        '\t\t\t"args": ["-B", "verify"],',
        '\t\t\t"isBuildCommand": true',
        '\t\t},',
        '\t\t{',
        '\t\t\t"taskName": "test",',
        '\t\t\t"args": ["-B", "test"],',
        '\t\t\t"isTestCommand": true',
        '\t\t}',
        '\t]',
        '}'
    ].join('\n')
};

export let templates: TaskEntry[] = [gulp, grunt, tscConfig, tscWatch, dotnetBuild, msbuild, npm, maven].sort((a, b) => {
    return (a.sort || a.label).localeCompare(b.sort || b.label);
});
templates.push(command);
*/
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFza1RlbXBsYXRlcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rhc2tzL2NvbW1vbi90YXNrVGVtcGxhdGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVloRyxNQUFNLFdBQVcsR0FBZTtRQUMvQixFQUFFLEVBQUUsWUFBWTtRQUNoQixLQUFLLEVBQUUsV0FBVztRQUNsQixJQUFJLEVBQUUsVUFBVTtRQUNoQixVQUFVLEVBQUUsS0FBSztRQUNqQixXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsa0NBQWtDLENBQUM7UUFDM0UsT0FBTyxFQUFFO1lBQ1IsR0FBRztZQUNILHlEQUF5RDtZQUN6RCx3REFBd0Q7WUFDeEQsdUJBQXVCO1lBQ3ZCLGNBQWM7WUFDZCxPQUFPO1lBQ1AseUJBQXlCO1lBQ3pCLDRCQUE0QjtZQUM1Qix3QkFBd0I7WUFDeEIsaUJBQWlCO1lBQ2pCLGtCQUFrQjtZQUNsQixvRUFBb0U7WUFDcEUsNkNBQTZDO1lBQzdDLDZGQUE2RjtZQUM3Riw4Q0FBOEM7WUFDOUMsVUFBVTtZQUNWLHlCQUF5QjtZQUN6Qix5QkFBeUI7WUFDekIsNEJBQTRCO1lBQzVCLFVBQVU7WUFDVixzQ0FBc0M7WUFDdEMsT0FBTztZQUNQLEtBQUs7WUFDTCxHQUFHO1NBQ0gsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0tBQ1osQ0FBQztJQUVGLE1BQU0sT0FBTyxHQUFlO1FBQzNCLEVBQUUsRUFBRSxTQUFTO1FBQ2IsS0FBSyxFQUFFLFNBQVM7UUFDaEIsVUFBVSxFQUFFLEtBQUs7UUFDakIsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLDJCQUEyQixDQUFDO1FBQ2pFLE9BQU8sRUFBRTtZQUNSLEdBQUc7WUFDSCx5REFBeUQ7WUFDekQsd0RBQXdEO1lBQ3hELHVCQUF1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