"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.colors = void 0;
const chalk_1 = __importDefault(require("chalk"));
exports.colors = {
    success: (text) => chalk_1.default.green(`✓ ${text}`),
    error: (text) => chalk_1.default.red(`✗ ${text}`),
    warning: (text) => chalk_1.default.yellow(`⚠ ${text}`),
    info: (text) => chalk_1.default.blue(`ℹ ${text}`),
    progress: (text) => chalk_1.default.cyan(`→ ${text}`),
    prompt: (text) => chalk_1.default.white(text),
};
exports.log = {
    success: (message) => console.log(exports.colors.success(message)),
    error: (message) => console.error(exports.colors.error(message)),
    warning: (message) => console.log(exports.colors.warning(message)),
    info: (message) => console.log(exports.colors.info(message)),
    progress: (message) => console.log(exports.colors.progress(message)),
    plain: (message) => console.log(message),
};
//# sourceMappingURL=logger.js.map