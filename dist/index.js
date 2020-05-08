module.exports =
/******/ (function(modules, runtime) { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	__webpack_require__.ab = __dirname + "/";
/******/
/******/ 	// the startup function
/******/ 	function startup() {
/******/ 		// Load entry module and return exports
/******/ 		return __webpack_require__(939);
/******/ 	};
/******/
/******/ 	// run startup
/******/ 	return startup();
/******/ })
/************************************************************************/
/******/ ({

/***/ 939:
/***/ (function() {

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "@actions/core", "@actions/github"], function (require, exports, core_1, github_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function run() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // const token = process.env.GITHUB_TOKEN;
                // if (token === undefined) {
                //     core.error("Missing GitHub token");
                //     return;
                // }
                // 
                // const octokit = new github.GitHub(token);
                // const release = await octokit.repos.getRelease();
                // const {
                //     data: {
                //         id: releaseId, tag_name: releaseTag
                //     }
                // } = release;
                console.log("HELLLO!");
                const release = github_1.context.payload;
                console.log(`Release ID=${release.id}, tag=${release.tag_name}`);
                console.log(release.id.toString());
                console.log(release.author.login);
                console.log(release.tag_name);
                console.log(release.assets_url);
                console.log("Here's the whole payload:");
                console.log(release);
                // core.setOutput("pr-ids", "Some IDs will come here")
            }
            catch (error) {
                core_1.setFailed(error.message);
            }
        });
    }
    run();
});


/***/ })

/******/ });