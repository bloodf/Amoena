import { execFile, spawn as spawn$1 } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir, rename } from "node:fs/promises";
import { normalize, join, dirname, resolve } from "node:path";
import { promisify } from "node:util";
import { c as commonjsGlobal, a as getDefaultExportFromCjs } from "./_commonjsHelpers-BVEIagUZ.js";
import { Buffer as Buffer$1 } from "node:buffer";
import require$$0$1 from "fs";
import require$$1 from "tty";
import require$$0$8 from "util";
import require$$0$3 from "os";
import require$$0$2, { spawn } from "child_process";
import { EventEmitter } from "node:events";
import process$1 from "node:process";
import require$$0__default from "path";
import require$$0$5 from "assert";
import require$$0$4 from "events";
import require$$0$7 from "buffer";
import require$$0$6 from "stream";
import { d as defaultShell } from "./index-d7r8qpVm.js";
var execa$1 = { exports: {} };
var crossSpawn = { exports: {} };
var windows;
var hasRequiredWindows;
function requireWindows() {
  if (hasRequiredWindows) return windows;
  hasRequiredWindows = 1;
  windows = isexe;
  isexe.sync = sync;
  var fs = require$$0$1;
  function checkPathExt(path, options) {
    var pathext = options.pathExt !== void 0 ? options.pathExt : process.env.PATHEXT;
    if (!pathext) {
      return true;
    }
    pathext = pathext.split(";");
    if (pathext.indexOf("") !== -1) {
      return true;
    }
    for (var i = 0; i < pathext.length; i++) {
      var p = pathext[i].toLowerCase();
      if (p && path.substr(-p.length).toLowerCase() === p) {
        return true;
      }
    }
    return false;
  }
  function checkStat(stat, path, options) {
    if (!stat.isSymbolicLink() && !stat.isFile()) {
      return false;
    }
    return checkPathExt(path, options);
  }
  function isexe(path, options, cb) {
    fs.stat(path, function(er, stat) {
      cb(er, er ? false : checkStat(stat, path, options));
    });
  }
  function sync(path, options) {
    return checkStat(fs.statSync(path), path, options);
  }
  return windows;
}
var mode;
var hasRequiredMode;
function requireMode() {
  if (hasRequiredMode) return mode;
  hasRequiredMode = 1;
  mode = isexe;
  isexe.sync = sync;
  var fs = require$$0$1;
  function isexe(path, options, cb) {
    fs.stat(path, function(er, stat) {
      cb(er, er ? false : checkStat(stat, options));
    });
  }
  function sync(path, options) {
    return checkStat(fs.statSync(path), options);
  }
  function checkStat(stat, options) {
    return stat.isFile() && checkMode(stat, options);
  }
  function checkMode(stat, options) {
    var mod = stat.mode;
    var uid = stat.uid;
    var gid = stat.gid;
    var myUid = options.uid !== void 0 ? options.uid : process.getuid && process.getuid();
    var myGid = options.gid !== void 0 ? options.gid : process.getgid && process.getgid();
    var u = parseInt("100", 8);
    var g = parseInt("010", 8);
    var o = parseInt("001", 8);
    var ug = u | g;
    var ret = mod & o || mod & g && gid === myGid || mod & u && uid === myUid || mod & ug && myUid === 0;
    return ret;
  }
  return mode;
}
var isexe_1;
var hasRequiredIsexe;
function requireIsexe() {
  if (hasRequiredIsexe) return isexe_1;
  hasRequiredIsexe = 1;
  var core2;
  if (process.platform === "win32" || commonjsGlobal.TESTING_WINDOWS) {
    core2 = requireWindows();
  } else {
    core2 = requireMode();
  }
  isexe_1 = isexe;
  isexe.sync = sync;
  function isexe(path, options, cb) {
    if (typeof options === "function") {
      cb = options;
      options = {};
    }
    if (!cb) {
      if (typeof Promise !== "function") {
        throw new TypeError("callback not provided");
      }
      return new Promise(function(resolve2, reject) {
        isexe(path, options || {}, function(er, is) {
          if (er) {
            reject(er);
          } else {
            resolve2(is);
          }
        });
      });
    }
    core2(path, options || {}, function(er, is) {
      if (er) {
        if (er.code === "EACCES" || options && options.ignoreErrors) {
          er = null;
          is = false;
        }
      }
      cb(er, is);
    });
  }
  function sync(path, options) {
    try {
      return core2.sync(path, options || {});
    } catch (er) {
      if (options && options.ignoreErrors || er.code === "EACCES") {
        return false;
      } else {
        throw er;
      }
    }
  }
  return isexe_1;
}
var which_1;
var hasRequiredWhich;
function requireWhich() {
  if (hasRequiredWhich) return which_1;
  hasRequiredWhich = 1;
  const isWindows = process.platform === "win32" || process.env.OSTYPE === "cygwin" || process.env.OSTYPE === "msys";
  const path = require$$0__default;
  const COLON = isWindows ? ";" : ":";
  const isexe = requireIsexe();
  const getNotFoundError = (cmd) => Object.assign(new Error(`not found: ${cmd}`), { code: "ENOENT" });
  const getPathInfo = (cmd, opt) => {
    const colon = opt.colon || COLON;
    const pathEnv = cmd.match(/\//) || isWindows && cmd.match(/\\/) ? [""] : [
      // windows always checks the cwd first
      ...isWindows ? [process.cwd()] : [],
      ...(opt.path || process.env.PATH || /* istanbul ignore next: very unusual */
      "").split(colon)
    ];
    const pathExtExe = isWindows ? opt.pathExt || process.env.PATHEXT || ".EXE;.CMD;.BAT;.COM" : "";
    const pathExt = isWindows ? pathExtExe.split(colon) : [""];
    if (isWindows) {
      if (cmd.indexOf(".") !== -1 && pathExt[0] !== "")
        pathExt.unshift("");
    }
    return {
      pathEnv,
      pathExt,
      pathExtExe
    };
  };
  const which = (cmd, opt, cb) => {
    if (typeof opt === "function") {
      cb = opt;
      opt = {};
    }
    if (!opt)
      opt = {};
    const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
    const found = [];
    const step = (i) => new Promise((resolve2, reject) => {
      if (i === pathEnv.length)
        return opt.all && found.length ? resolve2(found) : reject(getNotFoundError(cmd));
      const ppRaw = pathEnv[i];
      const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw;
      const pCmd = path.join(pathPart, cmd);
      const p = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd : pCmd;
      resolve2(subStep(p, i, 0));
    });
    const subStep = (p, i, ii) => new Promise((resolve2, reject) => {
      if (ii === pathExt.length)
        return resolve2(step(i + 1));
      const ext = pathExt[ii];
      isexe(p + ext, { pathExt: pathExtExe }, (er, is) => {
        if (!er && is) {
          if (opt.all)
            found.push(p + ext);
          else
            return resolve2(p + ext);
        }
        return resolve2(subStep(p, i, ii + 1));
      });
    });
    return cb ? step(0).then((res) => cb(null, res), cb) : step(0);
  };
  const whichSync = (cmd, opt) => {
    opt = opt || {};
    const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
    const found = [];
    for (let i = 0; i < pathEnv.length; i++) {
      const ppRaw = pathEnv[i];
      const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw;
      const pCmd = path.join(pathPart, cmd);
      const p = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd : pCmd;
      for (let j = 0; j < pathExt.length; j++) {
        const cur = p + pathExt[j];
        try {
          const is = isexe.sync(cur, { pathExt: pathExtExe });
          if (is) {
            if (opt.all)
              found.push(cur);
            else
              return cur;
          }
        } catch (ex) {
        }
      }
    }
    if (opt.all && found.length)
      return found;
    if (opt.nothrow)
      return null;
    throw getNotFoundError(cmd);
  };
  which_1 = which;
  which.sync = whichSync;
  return which_1;
}
var pathKey = { exports: {} };
var hasRequiredPathKey;
function requirePathKey() {
  if (hasRequiredPathKey) return pathKey.exports;
  hasRequiredPathKey = 1;
  const pathKey$1 = (options = {}) => {
    const environment = options.env || process.env;
    const platform = options.platform || process.platform;
    if (platform !== "win32") {
      return "PATH";
    }
    return Object.keys(environment).reverse().find((key) => key.toUpperCase() === "PATH") || "Path";
  };
  pathKey.exports = pathKey$1;
  pathKey.exports.default = pathKey$1;
  return pathKey.exports;
}
var resolveCommand_1;
var hasRequiredResolveCommand;
function requireResolveCommand() {
  if (hasRequiredResolveCommand) return resolveCommand_1;
  hasRequiredResolveCommand = 1;
  const path = require$$0__default;
  const which = requireWhich();
  const getPathKey = requirePathKey();
  function resolveCommandAttempt(parsed, withoutPathExt) {
    const env2 = parsed.options.env || process.env;
    const cwd = process.cwd();
    const hasCustomCwd = parsed.options.cwd != null;
    const shouldSwitchCwd = hasCustomCwd && process.chdir !== void 0 && !process.chdir.disabled;
    if (shouldSwitchCwd) {
      try {
        process.chdir(parsed.options.cwd);
      } catch (err) {
      }
    }
    let resolved;
    try {
      resolved = which.sync(parsed.command, {
        path: env2[getPathKey({ env: env2 })],
        pathExt: withoutPathExt ? path.delimiter : void 0
      });
    } catch (e) {
    } finally {
      if (shouldSwitchCwd) {
        process.chdir(cwd);
      }
    }
    if (resolved) {
      resolved = path.resolve(hasCustomCwd ? parsed.options.cwd : "", resolved);
    }
    return resolved;
  }
  function resolveCommand(parsed) {
    return resolveCommandAttempt(parsed) || resolveCommandAttempt(parsed, true);
  }
  resolveCommand_1 = resolveCommand;
  return resolveCommand_1;
}
var _escape = {};
var hasRequired_escape;
function require_escape() {
  if (hasRequired_escape) return _escape;
  hasRequired_escape = 1;
  const metaCharsRegExp = /([()\][%!^"`<>&|;, *?])/g;
  function escapeCommand(arg) {
    arg = arg.replace(metaCharsRegExp, "^$1");
    return arg;
  }
  function escapeArgument(arg, doubleEscapeMetaChars) {
    arg = `${arg}`;
    arg = arg.replace(/(?=(\\+?)?)\1"/g, '$1$1\\"');
    arg = arg.replace(/(?=(\\+?)?)\1$/, "$1$1");
    arg = `"${arg}"`;
    arg = arg.replace(metaCharsRegExp, "^$1");
    if (doubleEscapeMetaChars) {
      arg = arg.replace(metaCharsRegExp, "^$1");
    }
    return arg;
  }
  _escape.command = escapeCommand;
  _escape.argument = escapeArgument;
  return _escape;
}
var shebangRegex;
var hasRequiredShebangRegex;
function requireShebangRegex() {
  if (hasRequiredShebangRegex) return shebangRegex;
  hasRequiredShebangRegex = 1;
  shebangRegex = /^#!(.*)/;
  return shebangRegex;
}
var shebangCommand;
var hasRequiredShebangCommand;
function requireShebangCommand() {
  if (hasRequiredShebangCommand) return shebangCommand;
  hasRequiredShebangCommand = 1;
  const shebangRegex2 = requireShebangRegex();
  shebangCommand = (string = "") => {
    const match = string.match(shebangRegex2);
    if (!match) {
      return null;
    }
    const [path, argument] = match[0].replace(/#! ?/, "").split(" ");
    const binary = path.split("/").pop();
    if (binary === "env") {
      return argument;
    }
    return argument ? `${binary} ${argument}` : binary;
  };
  return shebangCommand;
}
var readShebang_1;
var hasRequiredReadShebang;
function requireReadShebang() {
  if (hasRequiredReadShebang) return readShebang_1;
  hasRequiredReadShebang = 1;
  const fs = require$$0$1;
  const shebangCommand2 = requireShebangCommand();
  function readShebang(command2) {
    const size = 150;
    const buffer = Buffer.alloc(size);
    let fd;
    try {
      fd = fs.openSync(command2, "r");
      fs.readSync(fd, buffer, 0, size, 0);
      fs.closeSync(fd);
    } catch (e) {
    }
    return shebangCommand2(buffer.toString());
  }
  readShebang_1 = readShebang;
  return readShebang_1;
}
var parse_1;
var hasRequiredParse;
function requireParse() {
  if (hasRequiredParse) return parse_1;
  hasRequiredParse = 1;
  const path = require$$0__default;
  const resolveCommand = requireResolveCommand();
  const escape = require_escape();
  const readShebang = requireReadShebang();
  const isWin = process.platform === "win32";
  const isExecutableRegExp = /\.(?:com|exe)$/i;
  const isCmdShimRegExp = /node_modules[\\/].bin[\\/][^\\/]+\.cmd$/i;
  function detectShebang(parsed) {
    parsed.file = resolveCommand(parsed);
    const shebang = parsed.file && readShebang(parsed.file);
    if (shebang) {
      parsed.args.unshift(parsed.file);
      parsed.command = shebang;
      return resolveCommand(parsed);
    }
    return parsed.file;
  }
  function parseNonShell(parsed) {
    if (!isWin) {
      return parsed;
    }
    const commandFile = detectShebang(parsed);
    const needsShell = !isExecutableRegExp.test(commandFile);
    if (parsed.options.forceShell || needsShell) {
      const needsDoubleEscapeMetaChars = isCmdShimRegExp.test(commandFile);
      parsed.command = path.normalize(parsed.command);
      parsed.command = escape.command(parsed.command);
      parsed.args = parsed.args.map((arg) => escape.argument(arg, needsDoubleEscapeMetaChars));
      const shellCommand = [parsed.command].concat(parsed.args).join(" ");
      parsed.args = ["/d", "/s", "/c", `"${shellCommand}"`];
      parsed.command = process.env.comspec || "cmd.exe";
      parsed.options.windowsVerbatimArguments = true;
    }
    return parsed;
  }
  function parse(command2, args2, options) {
    if (args2 && !Array.isArray(args2)) {
      options = args2;
      args2 = null;
    }
    args2 = args2 ? args2.slice(0) : [];
    options = Object.assign({}, options);
    const parsed = {
      command: command2,
      args: args2,
      options,
      file: void 0,
      original: {
        command: command2,
        args: args2
      }
    };
    return options.shell ? parsed : parseNonShell(parsed);
  }
  parse_1 = parse;
  return parse_1;
}
var enoent;
var hasRequiredEnoent;
function requireEnoent() {
  if (hasRequiredEnoent) return enoent;
  hasRequiredEnoent = 1;
  const isWin = process.platform === "win32";
  function notFoundError(original, syscall) {
    return Object.assign(new Error(`${syscall} ${original.command} ENOENT`), {
      code: "ENOENT",
      errno: "ENOENT",
      syscall: `${syscall} ${original.command}`,
      path: original.command,
      spawnargs: original.args
    });
  }
  function hookChildProcess(cp, parsed) {
    if (!isWin) {
      return;
    }
    const originalEmit = cp.emit;
    cp.emit = function(name, arg1) {
      if (name === "exit") {
        const err = verifyENOENT(arg1, parsed);
        if (err) {
          return originalEmit.call(cp, "error", err);
        }
      }
      return originalEmit.apply(cp, arguments);
    };
  }
  function verifyENOENT(status, parsed) {
    if (isWin && status === 1 && !parsed.file) {
      return notFoundError(parsed.original, "spawn");
    }
    return null;
  }
  function verifyENOENTSync(status, parsed) {
    if (isWin && status === 1 && !parsed.file) {
      return notFoundError(parsed.original, "spawnSync");
    }
    return null;
  }
  enoent = {
    hookChildProcess,
    verifyENOENT,
    verifyENOENTSync,
    notFoundError
  };
  return enoent;
}
var hasRequiredCrossSpawn;
function requireCrossSpawn() {
  if (hasRequiredCrossSpawn) return crossSpawn.exports;
  hasRequiredCrossSpawn = 1;
  const cp = require$$0$2;
  const parse = requireParse();
  const enoent2 = requireEnoent();
  function spawn2(command2, args2, options) {
    const parsed = parse(command2, args2, options);
    const spawned = cp.spawn(parsed.command, parsed.args, parsed.options);
    enoent2.hookChildProcess(spawned, parsed);
    return spawned;
  }
  function spawnSync(command2, args2, options) {
    const parsed = parse(command2, args2, options);
    const result = cp.spawnSync(parsed.command, parsed.args, parsed.options);
    result.error = result.error || enoent2.verifyENOENTSync(result.status, parsed);
    return result;
  }
  crossSpawn.exports = spawn2;
  crossSpawn.exports.spawn = spawn2;
  crossSpawn.exports.sync = spawnSync;
  crossSpawn.exports._parse = parse;
  crossSpawn.exports._enoent = enoent2;
  return crossSpawn.exports;
}
var stripFinalNewline;
var hasRequiredStripFinalNewline;
function requireStripFinalNewline() {
  if (hasRequiredStripFinalNewline) return stripFinalNewline;
  hasRequiredStripFinalNewline = 1;
  stripFinalNewline = (input) => {
    const LF = typeof input === "string" ? "\n" : "\n".charCodeAt();
    const CR = typeof input === "string" ? "\r" : "\r".charCodeAt();
    if (input[input.length - 1] === LF) {
      input = input.slice(0, input.length - 1);
    }
    if (input[input.length - 1] === CR) {
      input = input.slice(0, input.length - 1);
    }
    return input;
  };
  return stripFinalNewline;
}
var npmRunPath = { exports: {} };
npmRunPath.exports;
var hasRequiredNpmRunPath;
function requireNpmRunPath() {
  if (hasRequiredNpmRunPath) return npmRunPath.exports;
  hasRequiredNpmRunPath = 1;
  (function(module) {
    const path = require$$0__default;
    const pathKey2 = requirePathKey();
    const npmRunPath2 = (options) => {
      options = {
        cwd: process.cwd(),
        path: process.env[pathKey2()],
        execPath: process.execPath,
        ...options
      };
      let previous;
      let cwdPath = path.resolve(options.cwd);
      const result = [];
      while (previous !== cwdPath) {
        result.push(path.join(cwdPath, "node_modules/.bin"));
        previous = cwdPath;
        cwdPath = path.resolve(cwdPath, "..");
      }
      const execPathDir = path.resolve(options.cwd, options.execPath, "..");
      result.push(execPathDir);
      return result.concat(options.path).join(path.delimiter);
    };
    module.exports = npmRunPath2;
    module.exports.default = npmRunPath2;
    module.exports.env = (options) => {
      options = {
        env: process.env,
        ...options
      };
      const env2 = { ...options.env };
      const path2 = pathKey2({ env: env2 });
      options.path = env2[path2];
      env2[path2] = module.exports(options);
      return env2;
    };
  })(npmRunPath);
  return npmRunPath.exports;
}
var onetime = { exports: {} };
var mimicFn = { exports: {} };
var hasRequiredMimicFn;
function requireMimicFn() {
  if (hasRequiredMimicFn) return mimicFn.exports;
  hasRequiredMimicFn = 1;
  const mimicFn$1 = (to, from) => {
    for (const prop of Reflect.ownKeys(from)) {
      Object.defineProperty(to, prop, Object.getOwnPropertyDescriptor(from, prop));
    }
    return to;
  };
  mimicFn.exports = mimicFn$1;
  mimicFn.exports.default = mimicFn$1;
  return mimicFn.exports;
}
var hasRequiredOnetime;
function requireOnetime() {
  if (hasRequiredOnetime) return onetime.exports;
  hasRequiredOnetime = 1;
  const mimicFn2 = requireMimicFn();
  const calledFunctions = /* @__PURE__ */ new WeakMap();
  const onetime$1 = (function_, options = {}) => {
    if (typeof function_ !== "function") {
      throw new TypeError("Expected a function");
    }
    let returnValue;
    let callCount = 0;
    const functionName = function_.displayName || function_.name || "<anonymous>";
    const onetime2 = function(...arguments_) {
      calledFunctions.set(onetime2, ++callCount);
      if (callCount === 1) {
        returnValue = function_.apply(this, arguments_);
        function_ = null;
      } else if (options.throw === true) {
        throw new Error(`Function \`${functionName}\` can only be called once`);
      }
      return returnValue;
    };
    mimicFn2(onetime2, function_);
    calledFunctions.set(onetime2, callCount);
    return onetime2;
  };
  onetime.exports = onetime$1;
  onetime.exports.default = onetime$1;
  onetime.exports.callCount = (function_) => {
    if (!calledFunctions.has(function_)) {
      throw new Error(`The given function \`${function_.name}\` is not wrapped by the \`onetime\` package`);
    }
    return calledFunctions.get(function_);
  };
  return onetime.exports;
}
var main = {};
var signals$1 = {};
var core = {};
var hasRequiredCore;
function requireCore() {
  if (hasRequiredCore) return core;
  hasRequiredCore = 1;
  Object.defineProperty(core, "__esModule", { value: true });
  core.SIGNALS = void 0;
  const SIGNALS = [
    {
      name: "SIGHUP",
      number: 1,
      action: "terminate",
      description: "Terminal closed",
      standard: "posix"
    },
    {
      name: "SIGINT",
      number: 2,
      action: "terminate",
      description: "User interruption with CTRL-C",
      standard: "ansi"
    },
    {
      name: "SIGQUIT",
      number: 3,
      action: "core",
      description: "User interruption with CTRL-\\",
      standard: "posix"
    },
    {
      name: "SIGILL",
      number: 4,
      action: "core",
      description: "Invalid machine instruction",
      standard: "ansi"
    },
    {
      name: "SIGTRAP",
      number: 5,
      action: "core",
      description: "Debugger breakpoint",
      standard: "posix"
    },
    {
      name: "SIGABRT",
      number: 6,
      action: "core",
      description: "Aborted",
      standard: "ansi"
    },
    {
      name: "SIGIOT",
      number: 6,
      action: "core",
      description: "Aborted",
      standard: "bsd"
    },
    {
      name: "SIGBUS",
      number: 7,
      action: "core",
      description: "Bus error due to misaligned, non-existing address or paging error",
      standard: "bsd"
    },
    {
      name: "SIGEMT",
      number: 7,
      action: "terminate",
      description: "Command should be emulated but is not implemented",
      standard: "other"
    },
    {
      name: "SIGFPE",
      number: 8,
      action: "core",
      description: "Floating point arithmetic error",
      standard: "ansi"
    },
    {
      name: "SIGKILL",
      number: 9,
      action: "terminate",
      description: "Forced termination",
      standard: "posix",
      forced: true
    },
    {
      name: "SIGUSR1",
      number: 10,
      action: "terminate",
      description: "Application-specific signal",
      standard: "posix"
    },
    {
      name: "SIGSEGV",
      number: 11,
      action: "core",
      description: "Segmentation fault",
      standard: "ansi"
    },
    {
      name: "SIGUSR2",
      number: 12,
      action: "terminate",
      description: "Application-specific signal",
      standard: "posix"
    },
    {
      name: "SIGPIPE",
      number: 13,
      action: "terminate",
      description: "Broken pipe or socket",
      standard: "posix"
    },
    {
      name: "SIGALRM",
      number: 14,
      action: "terminate",
      description: "Timeout or timer",
      standard: "posix"
    },
    {
      name: "SIGTERM",
      number: 15,
      action: "terminate",
      description: "Termination",
      standard: "ansi"
    },
    {
      name: "SIGSTKFLT",
      number: 16,
      action: "terminate",
      description: "Stack is empty or overflowed",
      standard: "other"
    },
    {
      name: "SIGCHLD",
      number: 17,
      action: "ignore",
      description: "Child process terminated, paused or unpaused",
      standard: "posix"
    },
    {
      name: "SIGCLD",
      number: 17,
      action: "ignore",
      description: "Child process terminated, paused or unpaused",
      standard: "other"
    },
    {
      name: "SIGCONT",
      number: 18,
      action: "unpause",
      description: "Unpaused",
      standard: "posix",
      forced: true
    },
    {
      name: "SIGSTOP",
      number: 19,
      action: "pause",
      description: "Paused",
      standard: "posix",
      forced: true
    },
    {
      name: "SIGTSTP",
      number: 20,
      action: "pause",
      description: 'Paused using CTRL-Z or "suspend"',
      standard: "posix"
    },
    {
      name: "SIGTTIN",
      number: 21,
      action: "pause",
      description: "Background process cannot read terminal input",
      standard: "posix"
    },
    {
      name: "SIGBREAK",
      number: 21,
      action: "terminate",
      description: "User interruption with CTRL-BREAK",
      standard: "other"
    },
    {
      name: "SIGTTOU",
      number: 22,
      action: "pause",
      description: "Background process cannot write to terminal output",
      standard: "posix"
    },
    {
      name: "SIGURG",
      number: 23,
      action: "ignore",
      description: "Socket received out-of-band data",
      standard: "bsd"
    },
    {
      name: "SIGXCPU",
      number: 24,
      action: "core",
      description: "Process timed out",
      standard: "bsd"
    },
    {
      name: "SIGXFSZ",
      number: 25,
      action: "core",
      description: "File too big",
      standard: "bsd"
    },
    {
      name: "SIGVTALRM",
      number: 26,
      action: "terminate",
      description: "Timeout or timer",
      standard: "bsd"
    },
    {
      name: "SIGPROF",
      number: 27,
      action: "terminate",
      description: "Timeout or timer",
      standard: "bsd"
    },
    {
      name: "SIGWINCH",
      number: 28,
      action: "ignore",
      description: "Terminal window size changed",
      standard: "bsd"
    },
    {
      name: "SIGIO",
      number: 29,
      action: "terminate",
      description: "I/O is available",
      standard: "other"
    },
    {
      name: "SIGPOLL",
      number: 29,
      action: "terminate",
      description: "Watched event",
      standard: "other"
    },
    {
      name: "SIGINFO",
      number: 29,
      action: "ignore",
      description: "Request for process information",
      standard: "other"
    },
    {
      name: "SIGPWR",
      number: 30,
      action: "terminate",
      description: "Device running out of power",
      standard: "systemv"
    },
    {
      name: "SIGSYS",
      number: 31,
      action: "core",
      description: "Invalid system call",
      standard: "other"
    },
    {
      name: "SIGUNUSED",
      number: 31,
      action: "terminate",
      description: "Invalid system call",
      standard: "other"
    }
  ];
  core.SIGNALS = SIGNALS;
  return core;
}
var realtime = {};
var hasRequiredRealtime;
function requireRealtime() {
  if (hasRequiredRealtime) return realtime;
  hasRequiredRealtime = 1;
  Object.defineProperty(realtime, "__esModule", { value: true });
  realtime.SIGRTMAX = realtime.getRealtimeSignals = void 0;
  const getRealtimeSignals = function() {
    const length = SIGRTMAX - SIGRTMIN + 1;
    return Array.from({ length }, getRealtimeSignal);
  };
  realtime.getRealtimeSignals = getRealtimeSignals;
  const getRealtimeSignal = function(value, index) {
    return {
      name: `SIGRT${index + 1}`,
      number: SIGRTMIN + index,
      action: "terminate",
      description: "Application-specific signal (realtime)",
      standard: "posix"
    };
  };
  const SIGRTMIN = 34;
  const SIGRTMAX = 64;
  realtime.SIGRTMAX = SIGRTMAX;
  return realtime;
}
var hasRequiredSignals$1;
function requireSignals$1() {
  if (hasRequiredSignals$1) return signals$1;
  hasRequiredSignals$1 = 1;
  Object.defineProperty(signals$1, "__esModule", { value: true });
  signals$1.getSignals = void 0;
  var _os = require$$0$3;
  var _core = requireCore();
  var _realtime = requireRealtime();
  const getSignals = function() {
    const realtimeSignals = (0, _realtime.getRealtimeSignals)();
    const signals2 = [..._core.SIGNALS, ...realtimeSignals].map(normalizeSignal);
    return signals2;
  };
  signals$1.getSignals = getSignals;
  const normalizeSignal = function({
    name,
    number: defaultNumber,
    description,
    action,
    forced = false,
    standard
  }) {
    const {
      signals: { [name]: constantSignal }
    } = _os.constants;
    const supported = constantSignal !== void 0;
    const number = supported ? constantSignal : defaultNumber;
    return { name, number, description, supported, action, forced, standard };
  };
  return signals$1;
}
var hasRequiredMain;
function requireMain() {
  if (hasRequiredMain) return main;
  hasRequiredMain = 1;
  Object.defineProperty(main, "__esModule", { value: true });
  main.signalsByNumber = main.signalsByName = void 0;
  var _os = require$$0$3;
  var _signals = requireSignals$1();
  var _realtime = requireRealtime();
  const getSignalsByName = function() {
    const signals2 = (0, _signals.getSignals)();
    return signals2.reduce(getSignalByName, {});
  };
  const getSignalByName = function(signalByNameMemo, { name, number, description, supported, action, forced, standard }) {
    return {
      ...signalByNameMemo,
      [name]: { name, number, description, supported, action, forced, standard }
    };
  };
  const signalsByName = getSignalsByName();
  main.signalsByName = signalsByName;
  const getSignalsByNumber = function() {
    const signals2 = (0, _signals.getSignals)();
    const length = _realtime.SIGRTMAX + 1;
    const signalsA = Array.from({ length }, (value, number) => getSignalByNumber(number, signals2));
    return Object.assign({}, ...signalsA);
  };
  const getSignalByNumber = function(number, signals2) {
    const signal = findSignalByNumber(number, signals2);
    if (signal === void 0) {
      return {};
    }
    const { name, description, supported, action, forced, standard } = signal;
    return {
      [number]: {
        name,
        number,
        description,
        supported,
        action,
        forced,
        standard
      }
    };
  };
  const findSignalByNumber = function(number, signals2) {
    const signal = signals2.find(({ name }) => _os.constants.signals[name] === number);
    if (signal !== void 0) {
      return signal;
    }
    return signals2.find((signalA) => signalA.number === number);
  };
  const signalsByNumber = getSignalsByNumber();
  main.signalsByNumber = signalsByNumber;
  return main;
}
var error;
var hasRequiredError;
function requireError() {
  if (hasRequiredError) return error;
  hasRequiredError = 1;
  const { signalsByName } = requireMain();
  const getErrorPrefix = ({ timedOut, timeout, errorCode, signal, signalDescription, exitCode, isCanceled }) => {
    if (timedOut) {
      return `timed out after ${timeout} milliseconds`;
    }
    if (isCanceled) {
      return "was canceled";
    }
    if (errorCode !== void 0) {
      return `failed with ${errorCode}`;
    }
    if (signal !== void 0) {
      return `was killed with ${signal} (${signalDescription})`;
    }
    if (exitCode !== void 0) {
      return `failed with exit code ${exitCode}`;
    }
    return "failed";
  };
  const makeError = ({
    stdout,
    stderr,
    all,
    error: error2,
    signal,
    exitCode,
    command: command2,
    escapedCommand,
    timedOut,
    isCanceled,
    killed,
    parsed: { options: { timeout } }
  }) => {
    exitCode = exitCode === null ? void 0 : exitCode;
    signal = signal === null ? void 0 : signal;
    const signalDescription = signal === void 0 ? void 0 : signalsByName[signal].description;
    const errorCode = error2 && error2.code;
    const prefix = getErrorPrefix({ timedOut, timeout, errorCode, signal, signalDescription, exitCode, isCanceled });
    const execaMessage = `Command ${prefix}: ${command2}`;
    const isError = Object.prototype.toString.call(error2) === "[object Error]";
    const shortMessage = isError ? `${execaMessage}
${error2.message}` : execaMessage;
    const message = [shortMessage, stderr, stdout].filter(Boolean).join("\n");
    if (isError) {
      error2.originalMessage = error2.message;
      error2.message = message;
    } else {
      error2 = new Error(message);
    }
    error2.shortMessage = shortMessage;
    error2.command = command2;
    error2.escapedCommand = escapedCommand;
    error2.exitCode = exitCode;
    error2.signal = signal;
    error2.signalDescription = signalDescription;
    error2.stdout = stdout;
    error2.stderr = stderr;
    if (all !== void 0) {
      error2.all = all;
    }
    if ("bufferedData" in error2) {
      delete error2.bufferedData;
    }
    error2.failed = true;
    error2.timedOut = Boolean(timedOut);
    error2.isCanceled = isCanceled;
    error2.killed = killed && !timedOut;
    return error2;
  };
  error = makeError;
  return error;
}
var stdio = { exports: {} };
var hasRequiredStdio;
function requireStdio() {
  if (hasRequiredStdio) return stdio.exports;
  hasRequiredStdio = 1;
  const aliases = ["stdin", "stdout", "stderr"];
  const hasAlias = (options) => aliases.some((alias) => options[alias] !== void 0);
  const normalizeStdio = (options) => {
    if (!options) {
      return;
    }
    const { stdio: stdio2 } = options;
    if (stdio2 === void 0) {
      return aliases.map((alias) => options[alias]);
    }
    if (hasAlias(options)) {
      throw new Error(`It's not possible to provide \`stdio\` in combination with one of ${aliases.map((alias) => `\`${alias}\``).join(", ")}`);
    }
    if (typeof stdio2 === "string") {
      return stdio2;
    }
    if (!Array.isArray(stdio2)) {
      throw new TypeError(`Expected \`stdio\` to be of type \`string\` or \`Array\`, got \`${typeof stdio2}\``);
    }
    const length = Math.max(stdio2.length, aliases.length);
    return Array.from({ length }, (value, index) => stdio2[index]);
  };
  stdio.exports = normalizeStdio;
  stdio.exports.node = (options) => {
    const stdio2 = normalizeStdio(options);
    if (stdio2 === "ipc") {
      return "ipc";
    }
    if (stdio2 === void 0 || typeof stdio2 === "string") {
      return [stdio2, stdio2, stdio2, "ipc"];
    }
    if (stdio2.includes("ipc")) {
      return stdio2;
    }
    return [...stdio2, "ipc"];
  };
  return stdio.exports;
}
var signalExit = { exports: {} };
var signals = { exports: {} };
var hasRequiredSignals;
function requireSignals() {
  if (hasRequiredSignals) return signals.exports;
  hasRequiredSignals = 1;
  (function(module) {
    module.exports = [
      "SIGABRT",
      "SIGALRM",
      "SIGHUP",
      "SIGINT",
      "SIGTERM"
    ];
    if (process.platform !== "win32") {
      module.exports.push(
        "SIGVTALRM",
        "SIGXCPU",
        "SIGXFSZ",
        "SIGUSR2",
        "SIGTRAP",
        "SIGSYS",
        "SIGQUIT",
        "SIGIOT"
        // should detect profiler and enable/disable accordingly.
        // see #21
        // 'SIGPROF'
      );
    }
    if (process.platform === "linux") {
      module.exports.push(
        "SIGIO",
        "SIGPOLL",
        "SIGPWR",
        "SIGSTKFLT",
        "SIGUNUSED"
      );
    }
  })(signals);
  return signals.exports;
}
var hasRequiredSignalExit;
function requireSignalExit() {
  if (hasRequiredSignalExit) return signalExit.exports;
  hasRequiredSignalExit = 1;
  var process2 = commonjsGlobal.process;
  const processOk = function(process3) {
    return process3 && typeof process3 === "object" && typeof process3.removeListener === "function" && typeof process3.emit === "function" && typeof process3.reallyExit === "function" && typeof process3.listeners === "function" && typeof process3.kill === "function" && typeof process3.pid === "number" && typeof process3.on === "function";
  };
  if (!processOk(process2)) {
    signalExit.exports = function() {
      return function() {
      };
    };
  } else {
    var assert = require$$0$5;
    var signals2 = requireSignals();
    var isWin = /^win/i.test(process2.platform);
    var EE = require$$0$4;
    if (typeof EE !== "function") {
      EE = EE.EventEmitter;
    }
    var emitter;
    if (process2.__signal_exit_emitter__) {
      emitter = process2.__signal_exit_emitter__;
    } else {
      emitter = process2.__signal_exit_emitter__ = new EE();
      emitter.count = 0;
      emitter.emitted = {};
    }
    if (!emitter.infinite) {
      emitter.setMaxListeners(Infinity);
      emitter.infinite = true;
    }
    signalExit.exports = function(cb, opts) {
      if (!processOk(commonjsGlobal.process)) {
        return function() {
        };
      }
      assert.equal(typeof cb, "function", "a callback must be provided for exit handler");
      if (loaded === false) {
        load();
      }
      var ev = "exit";
      if (opts && opts.alwaysLast) {
        ev = "afterexit";
      }
      var remove2 = function() {
        emitter.removeListener(ev, cb);
        if (emitter.listeners("exit").length === 0 && emitter.listeners("afterexit").length === 0) {
          unload();
        }
      };
      emitter.on(ev, cb);
      return remove2;
    };
    var unload = function unload2() {
      if (!loaded || !processOk(commonjsGlobal.process)) {
        return;
      }
      loaded = false;
      signals2.forEach(function(sig) {
        try {
          process2.removeListener(sig, sigListeners[sig]);
        } catch (er) {
        }
      });
      process2.emit = originalProcessEmit;
      process2.reallyExit = originalProcessReallyExit;
      emitter.count -= 1;
    };
    signalExit.exports.unload = unload;
    var emit = function emit2(event, code, signal) {
      if (emitter.emitted[event]) {
        return;
      }
      emitter.emitted[event] = true;
      emitter.emit(event, code, signal);
    };
    var sigListeners = {};
    signals2.forEach(function(sig) {
      sigListeners[sig] = function listener() {
        if (!processOk(commonjsGlobal.process)) {
          return;
        }
        var listeners = process2.listeners(sig);
        if (listeners.length === emitter.count) {
          unload();
          emit("exit", null, sig);
          emit("afterexit", null, sig);
          if (isWin && sig === "SIGHUP") {
            sig = "SIGINT";
          }
          process2.kill(process2.pid, sig);
        }
      };
    });
    signalExit.exports.signals = function() {
      return signals2;
    };
    var loaded = false;
    var load = function load2() {
      if (loaded || !processOk(commonjsGlobal.process)) {
        return;
      }
      loaded = true;
      emitter.count += 1;
      signals2 = signals2.filter(function(sig) {
        try {
          process2.on(sig, sigListeners[sig]);
          return true;
        } catch (er) {
          return false;
        }
      });
      process2.emit = processEmit;
      process2.reallyExit = processReallyExit;
    };
    signalExit.exports.load = load;
    var originalProcessReallyExit = process2.reallyExit;
    var processReallyExit = function processReallyExit2(code) {
      if (!processOk(commonjsGlobal.process)) {
        return;
      }
      process2.exitCode = code || /* istanbul ignore next */
      0;
      emit("exit", process2.exitCode, null);
      emit("afterexit", process2.exitCode, null);
      originalProcessReallyExit.call(process2, process2.exitCode);
    };
    var originalProcessEmit = process2.emit;
    var processEmit = function processEmit2(ev, arg) {
      if (ev === "exit" && processOk(commonjsGlobal.process)) {
        if (arg !== void 0) {
          process2.exitCode = arg;
        }
        var ret = originalProcessEmit.apply(this, arguments);
        emit("exit", process2.exitCode, null);
        emit("afterexit", process2.exitCode, null);
        return ret;
      } else {
        return originalProcessEmit.apply(this, arguments);
      }
    };
  }
  return signalExit.exports;
}
var kill;
var hasRequiredKill;
function requireKill() {
  if (hasRequiredKill) return kill;
  hasRequiredKill = 1;
  const os = require$$0$3;
  const onExit = requireSignalExit();
  const DEFAULT_FORCE_KILL_TIMEOUT = 1e3 * 5;
  const spawnedKill = (kill2, signal = "SIGTERM", options = {}) => {
    const killResult = kill2(signal);
    setKillTimeout(kill2, signal, options, killResult);
    return killResult;
  };
  const setKillTimeout = (kill2, signal, options, killResult) => {
    if (!shouldForceKill(signal, options, killResult)) {
      return;
    }
    const timeout = getForceKillAfterTimeout(options);
    const t = setTimeout(() => {
      kill2("SIGKILL");
    }, timeout);
    if (t.unref) {
      t.unref();
    }
  };
  const shouldForceKill = (signal, { forceKillAfterTimeout }, killResult) => {
    return isSigterm(signal) && forceKillAfterTimeout !== false && killResult;
  };
  const isSigterm = (signal) => {
    return signal === os.constants.signals.SIGTERM || typeof signal === "string" && signal.toUpperCase() === "SIGTERM";
  };
  const getForceKillAfterTimeout = ({ forceKillAfterTimeout = true }) => {
    if (forceKillAfterTimeout === true) {
      return DEFAULT_FORCE_KILL_TIMEOUT;
    }
    if (!Number.isFinite(forceKillAfterTimeout) || forceKillAfterTimeout < 0) {
      throw new TypeError(`Expected the \`forceKillAfterTimeout\` option to be a non-negative integer, got \`${forceKillAfterTimeout}\` (${typeof forceKillAfterTimeout})`);
    }
    return forceKillAfterTimeout;
  };
  const spawnedCancel = (spawned, context) => {
    const killResult = spawned.kill();
    if (killResult) {
      context.isCanceled = true;
    }
  };
  const timeoutKill = (spawned, signal, reject) => {
    spawned.kill(signal);
    reject(Object.assign(new Error("Timed out"), { timedOut: true, signal }));
  };
  const setupTimeout = (spawned, { timeout, killSignal = "SIGTERM" }, spawnedPromise) => {
    if (timeout === 0 || timeout === void 0) {
      return spawnedPromise;
    }
    let timeoutId;
    const timeoutPromise = new Promise((resolve2, reject) => {
      timeoutId = setTimeout(() => {
        timeoutKill(spawned, killSignal, reject);
      }, timeout);
    });
    const safeSpawnedPromise = spawnedPromise.finally(() => {
      clearTimeout(timeoutId);
    });
    return Promise.race([timeoutPromise, safeSpawnedPromise]);
  };
  const validateTimeout = ({ timeout }) => {
    if (timeout !== void 0 && (!Number.isFinite(timeout) || timeout < 0)) {
      throw new TypeError(`Expected the \`timeout\` option to be a non-negative integer, got \`${timeout}\` (${typeof timeout})`);
    }
  };
  const setExitHandler = async (spawned, { cleanup, detached }, timedPromise) => {
    if (!cleanup || detached) {
      return timedPromise;
    }
    const removeExitHandler = onExit(() => {
      spawned.kill();
    });
    return timedPromise.finally(() => {
      removeExitHandler();
    });
  };
  kill = {
    spawnedKill,
    spawnedCancel,
    setupTimeout,
    validateTimeout,
    setExitHandler
  };
  return kill;
}
var isStream_1;
var hasRequiredIsStream;
function requireIsStream() {
  if (hasRequiredIsStream) return isStream_1;
  hasRequiredIsStream = 1;
  const isStream = (stream2) => stream2 !== null && typeof stream2 === "object" && typeof stream2.pipe === "function";
  isStream.writable = (stream2) => isStream(stream2) && stream2.writable !== false && typeof stream2._write === "function" && typeof stream2._writableState === "object";
  isStream.readable = (stream2) => isStream(stream2) && stream2.readable !== false && typeof stream2._read === "function" && typeof stream2._readableState === "object";
  isStream.duplex = (stream2) => isStream.writable(stream2) && isStream.readable(stream2);
  isStream.transform = (stream2) => isStream.duplex(stream2) && typeof stream2._transform === "function";
  isStream_1 = isStream;
  return isStream_1;
}
var getStream = { exports: {} };
var bufferStream;
var hasRequiredBufferStream;
function requireBufferStream() {
  if (hasRequiredBufferStream) return bufferStream;
  hasRequiredBufferStream = 1;
  const { PassThrough: PassThroughStream } = require$$0$6;
  bufferStream = (options) => {
    options = { ...options };
    const { array } = options;
    let { encoding } = options;
    const isBuffer = encoding === "buffer";
    let objectMode = false;
    if (array) {
      objectMode = !(encoding || isBuffer);
    } else {
      encoding = encoding || "utf8";
    }
    if (isBuffer) {
      encoding = null;
    }
    const stream2 = new PassThroughStream({ objectMode });
    if (encoding) {
      stream2.setEncoding(encoding);
    }
    let length = 0;
    const chunks = [];
    stream2.on("data", (chunk) => {
      chunks.push(chunk);
      if (objectMode) {
        length = chunks.length;
      } else {
        length += chunk.length;
      }
    });
    stream2.getBufferedValue = () => {
      if (array) {
        return chunks;
      }
      return isBuffer ? Buffer.concat(chunks, length) : chunks.join("");
    };
    stream2.getBufferedLength = () => length;
    return stream2;
  };
  return bufferStream;
}
var hasRequiredGetStream;
function requireGetStream() {
  if (hasRequiredGetStream) return getStream.exports;
  hasRequiredGetStream = 1;
  const { constants: BufferConstants } = require$$0$7;
  const stream2 = require$$0$6;
  const { promisify: promisify2 } = require$$0$8;
  const bufferStream2 = requireBufferStream();
  const streamPipelinePromisified = promisify2(stream2.pipeline);
  class MaxBufferError extends Error {
    constructor() {
      super("maxBuffer exceeded");
      this.name = "MaxBufferError";
    }
  }
  async function getStream$1(inputStream, options) {
    if (!inputStream) {
      throw new Error("Expected a stream");
    }
    options = {
      maxBuffer: Infinity,
      ...options
    };
    const { maxBuffer } = options;
    const stream3 = bufferStream2(options);
    await new Promise((resolve2, reject) => {
      const rejectPromise = (error2) => {
        if (error2 && stream3.getBufferedLength() <= BufferConstants.MAX_LENGTH) {
          error2.bufferedData = stream3.getBufferedValue();
        }
        reject(error2);
      };
      (async () => {
        try {
          await streamPipelinePromisified(inputStream, stream3);
          resolve2();
        } catch (error2) {
          rejectPromise(error2);
        }
      })();
      stream3.on("data", () => {
        if (stream3.getBufferedLength() > maxBuffer) {
          rejectPromise(new MaxBufferError());
        }
      });
    });
    return stream3.getBufferedValue();
  }
  getStream.exports = getStream$1;
  getStream.exports.buffer = (stream3, options) => getStream$1(stream3, { ...options, encoding: "buffer" });
  getStream.exports.array = (stream3, options) => getStream$1(stream3, { ...options, array: true });
  getStream.exports.MaxBufferError = MaxBufferError;
  return getStream.exports;
}
var mergeStream;
var hasRequiredMergeStream;
function requireMergeStream() {
  if (hasRequiredMergeStream) return mergeStream;
  hasRequiredMergeStream = 1;
  const { PassThrough } = require$$0$6;
  mergeStream = function() {
    var sources = [];
    var output = new PassThrough({ objectMode: true });
    output.setMaxListeners(0);
    output.add = add;
    output.isEmpty = isEmpty;
    output.on("unpipe", remove2);
    Array.prototype.slice.call(arguments).forEach(add);
    return output;
    function add(source) {
      if (Array.isArray(source)) {
        source.forEach(add);
        return this;
      }
      sources.push(source);
      source.once("end", remove2.bind(null, source));
      source.once("error", output.emit.bind(output, "error"));
      source.pipe(output, { end: false });
      return this;
    }
    function isEmpty() {
      return sources.length == 0;
    }
    function remove2(source) {
      sources = sources.filter(function(it) {
        return it !== source;
      });
      if (!sources.length && output.readable) {
        output.end();
      }
    }
  };
  return mergeStream;
}
var stream;
var hasRequiredStream;
function requireStream() {
  if (hasRequiredStream) return stream;
  hasRequiredStream = 1;
  const isStream = requireIsStream();
  const getStream2 = requireGetStream();
  const mergeStream2 = requireMergeStream();
  const handleInput = (spawned, input) => {
    if (input === void 0 || spawned.stdin === void 0) {
      return;
    }
    if (isStream(input)) {
      input.pipe(spawned.stdin);
    } else {
      spawned.stdin.end(input);
    }
  };
  const makeAllStream = (spawned, { all }) => {
    if (!all || !spawned.stdout && !spawned.stderr) {
      return;
    }
    const mixed = mergeStream2();
    if (spawned.stdout) {
      mixed.add(spawned.stdout);
    }
    if (spawned.stderr) {
      mixed.add(spawned.stderr);
    }
    return mixed;
  };
  const getBufferedData = async (stream2, streamPromise) => {
    if (!stream2) {
      return;
    }
    stream2.destroy();
    try {
      return await streamPromise;
    } catch (error2) {
      return error2.bufferedData;
    }
  };
  const getStreamPromise = (stream2, { encoding, buffer, maxBuffer }) => {
    if (!stream2 || !buffer) {
      return;
    }
    if (encoding) {
      return getStream2(stream2, { encoding, maxBuffer });
    }
    return getStream2.buffer(stream2, { maxBuffer });
  };
  const getSpawnedResult = async ({ stdout, stderr, all }, { encoding, buffer, maxBuffer }, processDone) => {
    const stdoutPromise = getStreamPromise(stdout, { encoding, buffer, maxBuffer });
    const stderrPromise = getStreamPromise(stderr, { encoding, buffer, maxBuffer });
    const allPromise = getStreamPromise(all, { encoding, buffer, maxBuffer: maxBuffer * 2 });
    try {
      return await Promise.all([processDone, stdoutPromise, stderrPromise, allPromise]);
    } catch (error2) {
      return Promise.all([
        { error: error2, signal: error2.signal, timedOut: error2.timedOut },
        getBufferedData(stdout, stdoutPromise),
        getBufferedData(stderr, stderrPromise),
        getBufferedData(all, allPromise)
      ]);
    }
  };
  const validateInputSync = ({ input }) => {
    if (isStream(input)) {
      throw new TypeError("The `input` option cannot be a stream in sync mode");
    }
  };
  stream = {
    handleInput,
    makeAllStream,
    getSpawnedResult,
    validateInputSync
  };
  return stream;
}
var promise;
var hasRequiredPromise;
function requirePromise() {
  if (hasRequiredPromise) return promise;
  hasRequiredPromise = 1;
  const nativePromisePrototype = (async () => {
  })().constructor.prototype;
  const descriptors = ["then", "catch", "finally"].map((property) => [
    property,
    Reflect.getOwnPropertyDescriptor(nativePromisePrototype, property)
  ]);
  const mergePromise = (spawned, promise2) => {
    for (const [property, descriptor] of descriptors) {
      const value = typeof promise2 === "function" ? (...args2) => Reflect.apply(descriptor.value, promise2(), args2) : descriptor.value.bind(promise2);
      Reflect.defineProperty(spawned, property, { ...descriptor, value });
    }
    return spawned;
  };
  const getSpawnedPromise = (spawned) => {
    return new Promise((resolve2, reject) => {
      spawned.on("exit", (exitCode, signal) => {
        resolve2({ exitCode, signal });
      });
      spawned.on("error", (error2) => {
        reject(error2);
      });
      if (spawned.stdin) {
        spawned.stdin.on("error", (error2) => {
          reject(error2);
        });
      }
    });
  };
  promise = {
    mergePromise,
    getSpawnedPromise
  };
  return promise;
}
var command;
var hasRequiredCommand;
function requireCommand() {
  if (hasRequiredCommand) return command;
  hasRequiredCommand = 1;
  const normalizeArgs = (file, args2 = []) => {
    if (!Array.isArray(args2)) {
      return [file];
    }
    return [file, ...args2];
  };
  const NO_ESCAPE_REGEXP = /^[\w.-]+$/;
  const DOUBLE_QUOTES_REGEXP = /"/g;
  const escapeArg = (arg) => {
    if (typeof arg !== "string" || NO_ESCAPE_REGEXP.test(arg)) {
      return arg;
    }
    return `"${arg.replace(DOUBLE_QUOTES_REGEXP, '\\"')}"`;
  };
  const joinCommand = (file, args2) => {
    return normalizeArgs(file, args2).join(" ");
  };
  const getEscapedCommand = (file, args2) => {
    return normalizeArgs(file, args2).map((arg) => escapeArg(arg)).join(" ");
  };
  const SPACES_REGEXP = / +/g;
  const parseCommand = (command2) => {
    const tokens = [];
    for (const token of command2.trim().split(SPACES_REGEXP)) {
      const previousToken = tokens[tokens.length - 1];
      if (previousToken && previousToken.endsWith("\\")) {
        tokens[tokens.length - 1] = `${previousToken.slice(0, -1)} ${token}`;
      } else {
        tokens.push(token);
      }
    }
    return tokens;
  };
  command = {
    joinCommand,
    getEscapedCommand,
    parseCommand
  };
  return command;
}
var hasRequiredExeca;
function requireExeca() {
  if (hasRequiredExeca) return execa$1.exports;
  hasRequiredExeca = 1;
  const path = require$$0__default;
  const childProcess = require$$0$2;
  const crossSpawn2 = requireCrossSpawn();
  const stripFinalNewline2 = requireStripFinalNewline();
  const npmRunPath2 = requireNpmRunPath();
  const onetime2 = requireOnetime();
  const makeError = requireError();
  const normalizeStdio = requireStdio();
  const { spawnedKill, spawnedCancel, setupTimeout, validateTimeout, setExitHandler } = requireKill();
  const { handleInput, getSpawnedResult, makeAllStream, validateInputSync } = requireStream();
  const { mergePromise, getSpawnedPromise } = requirePromise();
  const { joinCommand, parseCommand, getEscapedCommand } = requireCommand();
  const DEFAULT_MAX_BUFFER = 1e3 * 1e3 * 100;
  const getEnv = ({ env: envOption, extendEnv, preferLocal, localDir, execPath }) => {
    const env2 = extendEnv ? { ...process.env, ...envOption } : envOption;
    if (preferLocal) {
      return npmRunPath2.env({ env: env2, cwd: localDir, execPath });
    }
    return env2;
  };
  const handleArguments = (file, args2, options = {}) => {
    const parsed = crossSpawn2._parse(file, args2, options);
    file = parsed.command;
    args2 = parsed.args;
    options = parsed.options;
    options = {
      maxBuffer: DEFAULT_MAX_BUFFER,
      buffer: true,
      stripFinalNewline: true,
      extendEnv: true,
      preferLocal: false,
      localDir: options.cwd || process.cwd(),
      execPath: process.execPath,
      encoding: "utf8",
      reject: true,
      cleanup: true,
      all: false,
      windowsHide: true,
      ...options
    };
    options.env = getEnv(options);
    options.stdio = normalizeStdio(options);
    if (process.platform === "win32" && path.basename(file, ".exe") === "cmd") {
      args2.unshift("/q");
    }
    return { file, args: args2, options, parsed };
  };
  const handleOutput = (options, value, error2) => {
    if (typeof value !== "string" && !Buffer.isBuffer(value)) {
      return error2 === void 0 ? void 0 : "";
    }
    if (options.stripFinalNewline) {
      return stripFinalNewline2(value);
    }
    return value;
  };
  const execa2 = (file, args2, options) => {
    const parsed = handleArguments(file, args2, options);
    const command2 = joinCommand(file, args2);
    const escapedCommand = getEscapedCommand(file, args2);
    validateTimeout(parsed.options);
    let spawned;
    try {
      spawned = childProcess.spawn(parsed.file, parsed.args, parsed.options);
    } catch (error2) {
      const dummySpawned = new childProcess.ChildProcess();
      const errorPromise = Promise.reject(makeError({
        error: error2,
        stdout: "",
        stderr: "",
        all: "",
        command: command2,
        escapedCommand,
        parsed,
        timedOut: false,
        isCanceled: false,
        killed: false
      }));
      return mergePromise(dummySpawned, errorPromise);
    }
    const spawnedPromise = getSpawnedPromise(spawned);
    const timedPromise = setupTimeout(spawned, parsed.options, spawnedPromise);
    const processDone = setExitHandler(spawned, parsed.options, timedPromise);
    const context = { isCanceled: false };
    spawned.kill = spawnedKill.bind(null, spawned.kill.bind(spawned));
    spawned.cancel = spawnedCancel.bind(null, spawned, context);
    const handlePromise = async () => {
      const [{ error: error2, exitCode, signal, timedOut }, stdoutResult, stderrResult, allResult] = await getSpawnedResult(spawned, parsed.options, processDone);
      const stdout = handleOutput(parsed.options, stdoutResult);
      const stderr = handleOutput(parsed.options, stderrResult);
      const all = handleOutput(parsed.options, allResult);
      if (error2 || exitCode !== 0 || signal !== null) {
        const returnedError = makeError({
          error: error2,
          exitCode,
          signal,
          stdout,
          stderr,
          all,
          command: command2,
          escapedCommand,
          parsed,
          timedOut,
          isCanceled: context.isCanceled,
          killed: spawned.killed
        });
        if (!parsed.options.reject) {
          return returnedError;
        }
        throw returnedError;
      }
      return {
        command: command2,
        escapedCommand,
        exitCode: 0,
        stdout,
        stderr,
        all,
        failed: false,
        timedOut: false,
        isCanceled: false,
        killed: false
      };
    };
    const handlePromiseOnce = onetime2(handlePromise);
    handleInput(spawned, parsed.options.input);
    spawned.all = makeAllStream(spawned, parsed.options);
    return mergePromise(spawned, handlePromiseOnce);
  };
  execa$1.exports = execa2;
  execa$1.exports.sync = (file, args2, options) => {
    const parsed = handleArguments(file, args2, options);
    const command2 = joinCommand(file, args2);
    const escapedCommand = getEscapedCommand(file, args2);
    validateInputSync(parsed.options);
    let result;
    try {
      result = childProcess.spawnSync(parsed.file, parsed.args, parsed.options);
    } catch (error2) {
      throw makeError({
        error: error2,
        stdout: "",
        stderr: "",
        all: "",
        command: command2,
        escapedCommand,
        parsed,
        timedOut: false,
        isCanceled: false,
        killed: false
      });
    }
    const stdout = handleOutput(parsed.options, result.stdout, result.error);
    const stderr = handleOutput(parsed.options, result.stderr, result.error);
    if (result.error || result.status !== 0 || result.signal !== null) {
      const error2 = makeError({
        stdout,
        stderr,
        error: result.error,
        signal: result.signal,
        exitCode: result.status,
        command: command2,
        escapedCommand,
        parsed,
        timedOut: result.error && result.error.code === "ETIMEDOUT",
        isCanceled: false,
        killed: result.signal !== null
      });
      if (!parsed.options.reject) {
        return error2;
      }
      throw error2;
    }
    return {
      command: command2,
      escapedCommand,
      exitCode: 0,
      stdout,
      stderr,
      failed: false,
      timedOut: false,
      isCanceled: false,
      killed: false
    };
  };
  execa$1.exports.command = (command2, options) => {
    const [file, ...args2] = parseCommand(command2);
    return execa2(file, args2, options);
  };
  execa$1.exports.commandSync = (command2, options) => {
    const [file, ...args2] = parseCommand(command2);
    return execa2.sync(file, args2, options);
  };
  execa$1.exports.node = (scriptPath, args2, options = {}) => {
    if (args2 && !Array.isArray(args2) && typeof args2 === "object") {
      options = args2;
      args2 = [];
    }
    const stdio2 = normalizeStdio.node(options);
    const defaultExecArgv = process.execArgv.filter((arg) => !arg.startsWith("--inspect"));
    const {
      nodePath = process.execPath,
      nodeOptions = defaultExecArgv
    } = options;
    return execa2(
      nodePath,
      [
        ...nodeOptions,
        scriptPath,
        ...Array.isArray(args2) ? args2 : []
      ],
      {
        ...options,
        stdin: void 0,
        stdout: void 0,
        stderr: void 0,
        stdio: stdio2,
        shell: false
      }
    );
  };
  return execa$1.exports;
}
var execaExports = requireExeca();
const execa = /* @__PURE__ */ getDefaultExportFromCjs(execaExports);
function ansiRegex({ onlyFirst = false } = {}) {
  const ST = "(?:\\u0007|\\u001B\\u005C|\\u009C)";
  const osc = `(?:\\u001B\\][\\s\\S]*?${ST})`;
  const csi = "[\\u001B\\u009B][[\\]()#;?]*(?:\\d{1,4}(?:[;:]\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]";
  const pattern = `${osc}|${csi}`;
  return new RegExp(pattern, onlyFirst ? void 0 : "g");
}
const regex = ansiRegex();
function stripAnsi(string) {
  if (typeof string !== "string") {
    throw new TypeError(`Expected a \`string\`, got \`${typeof string}\``);
  }
  if (!string.includes("\x1B") && !string.includes("")) {
    return string;
  }
  return string.replace(regex, "");
}
const args = [
  "-ilc",
  // Use the command builtin to avoid shell aliases or functions named `env`.
  'echo -n "_SHELL_ENV_DELIMITER_"; command env; echo -n "_SHELL_ENV_DELIMITER_"; exit'
];
const env = {
  // Disables Oh My Zsh auto-update thing that can block the process.
  DISABLE_AUTO_UPDATE: "true",
  // Prevents the oh-my-zsh tmux plugin from auto-starting.
  ZSH_TMUX_AUTOSTARTED: "true",
  ZSH_TMUX_AUTOSTART: "false"
};
const parseEnv = (env2) => {
  env2 = env2.split("_SHELL_ENV_DELIMITER_")[1];
  const returnValue = {};
  for (const line of stripAnsi(env2).split("\n").filter(Boolean)) {
    const [key, ...values] = line.split("=");
    returnValue[key] = values.join("=");
  }
  return returnValue;
};
const fallbackShells = ["/bin/zsh", "/bin/bash"].filter((shell) => shell !== defaultShell);
async function tryFallbackShells() {
  for (const shell of fallbackShells) {
    try {
      const { stdout } = await execa(shell, args, { env });
      return parseEnv(stdout);
    } catch {
    }
  }
  return process$1.env;
}
async function shellEnv(shell) {
  if (process$1.platform === "win32") {
    return process$1.env;
  }
  try {
    const { stdout } = await execa(shell || defaultShell, args, { env });
    return parseEnv(stdout);
  } catch (error2) {
    return tryFallbackShells();
  }
}
const execFileAsync$2 = promisify(execFile);
let cachedEnv = null;
let cacheTime = 0;
let isFallbackCache = false;
const CACHE_TTL_MS = 6e4;
const FALLBACK_CACHE_TTL_MS = 1e4;
const TIMEOUT_FALLBACK_CACHE_TTL_MS = 6e4;
const SHELL_ENV_TIMEOUT_MS = 8e3;
let fallbackCacheTtlMs = FALLBACK_CACHE_TTL_MS;
let pathFixAttempted = false;
let pathFixSucceeded = false;
class ShellEnvTimeoutError extends Error {
  constructor(timeoutMs) {
    super(`[shell-env] Timed out after ${timeoutMs}ms`);
  }
}
async function getShellEnvWithTimeout() {
  let timeoutId;
  try {
    return await Promise.race([
      shellEnv(),
      new Promise((_resolve, reject) => {
        timeoutId = setTimeout(() => {
          reject(new ShellEnvTimeoutError(SHELL_ENV_TIMEOUT_MS));
        }, SHELL_ENV_TIMEOUT_MS);
      })
    ]);
  } finally {
    if (timeoutId !== void 0) {
      clearTimeout(timeoutId);
    }
  }
}
async function getShellEnvironment(options) {
  const now = Date.now();
  const ttl = isFallbackCache ? fallbackCacheTtlMs : CACHE_TTL_MS;
  if (!options?.forceRefresh && cachedEnv && now - cacheTime < ttl) {
    return { ...cachedEnv };
  }
  try {
    const env2 = await getShellEnvWithTimeout();
    cachedEnv = env2;
    cacheTime = now;
    isFallbackCache = false;
    fallbackCacheTtlMs = FALLBACK_CACHE_TTL_MS;
    return { ...cachedEnv };
  } catch (error2) {
    const isTimeout = error2 instanceof ShellEnvTimeoutError;
    console.warn(
      `[shell-env] Failed to get shell environment${isTimeout ? " (timed out)" : ""}: ${error2}. Falling back to process.env`
    );
    const fallback = {};
    for (const [key, value] of Object.entries(process.env)) {
      if (typeof value === "string") {
        fallback[key] = value;
      }
    }
    augmentPathForMacOS(fallback);
    cachedEnv = fallback;
    cacheTime = now;
    isFallbackCache = true;
    fallbackCacheTtlMs = isTimeout ? TIMEOUT_FALLBACK_CACHE_TTL_MS : FALLBACK_CACHE_TTL_MS;
    return { ...fallback };
  }
}
const COMMON_MACOS_PATHS = [
  "/opt/homebrew/bin",
  "/opt/homebrew/sbin",
  "/usr/local/bin",
  "/usr/local/sbin"
];
function augmentPathForMacOS(env2, platform = process.platform) {
  if (platform !== "darwin") return;
  const currentPath = env2.PATH ?? "";
  const currentEntries = currentPath.split(":").filter(Boolean);
  const pathEntries = new Set(currentEntries);
  const missingPaths = COMMON_MACOS_PATHS.filter(
    (path) => !pathEntries.has(path)
  );
  env2.PATH = [...missingPaths, currentPath].filter(Boolean).join(":");
}
function copyStringEnv(baseEnv = process.env) {
  const env2 = {};
  for (const [key, value] of Object.entries(baseEnv)) {
    if (typeof value === "string") {
      env2[key] = value;
    }
  }
  return env2;
}
async function getProcessEnvWithShellEnv(baseEnv = process.env, shellEnvResult) {
  const env2 = copyStringEnv(baseEnv);
  const resolvedShellEnv = shellEnvResult ?? await getShellEnvironment();
  for (const [key, value] of Object.entries(resolvedShellEnv)) {
    if (!(key in env2)) {
      env2[key] = value;
    }
  }
  return env2;
}
async function getProcessEnvWithShellPath(baseEnv = process.env, options) {
  const shellEnvResult = await getShellEnvironment(options);
  const env2 = await getProcessEnvWithShellEnv(baseEnv, shellEnvResult);
  const shellPath = shellEnvResult.PATH || shellEnvResult.Path;
  if (!shellPath) {
    return env2;
  }
  env2.PATH = shellPath;
  if (process.platform === "win32" || "Path" in baseEnv || "Path" in shellEnvResult) {
    env2.Path = shellPath;
  }
  return env2;
}
async function execWithShellEnv(cmd, args2, options) {
  const baseEnv = options?.env ? { ...process.env, ...options.env } : process.env;
  try {
    return await execFileAsync$2(cmd, args2, {
      ...options,
      encoding: "utf8",
      env: await getProcessEnvWithShellEnv(baseEnv)
    });
  } catch (error2) {
    if (process.platform !== "darwin" || pathFixSucceeded || pathFixAttempted || !(error2 instanceof Error) || !("code" in error2) || error2.code !== "ENOENT") {
      throw error2;
    }
    pathFixAttempted = true;
    console.log("[shell-env] Command not found, deriving shell environment");
    try {
      const shellEnvResult = await getShellEnvironment({ forceRefresh: true });
      const mergedShellEnv = await getProcessEnvWithShellEnv(
        baseEnv,
        shellEnvResult
      );
      const retryEnv = shellEnvResult.PATH ? { ...mergedShellEnv, PATH: shellEnvResult.PATH } : mergedShellEnv;
      const result = await execFileAsync$2(cmd, args2, {
        ...options,
        encoding: "utf8",
        env: retryEnv
      });
      if (shellEnvResult.PATH) {
        process.env.PATH = shellEnvResult.PATH;
        pathFixSucceeded = true;
        console.log("[shell-env] Fixed process.env.PATH for GUI app");
      }
      pathFixAttempted = false;
      return result;
    } catch (retryError) {
      pathFixAttempted = false;
      pathFixSucceeded = false;
      console.error("[shell-env] Retry failed:", retryError);
      throw retryError;
    }
  }
}
async function applyShellEnvToProcess(targetEnv = process.env, shellEnvResult) {
  const mergedEnv = await getProcessEnvWithShellEnv(targetEnv, shellEnvResult);
  for (const [key, value] of Object.entries(mergedEnv)) {
    if (typeof targetEnv[key] !== "string") {
      targetEnv[key] = value;
    }
  }
}
var src$1 = { exports: {} };
var browser = { exports: {} };
var ms;
var hasRequiredMs;
function requireMs() {
  if (hasRequiredMs) return ms;
  hasRequiredMs = 1;
  var s = 1e3;
  var m = s * 60;
  var h = m * 60;
  var d = h * 24;
  var w = d * 7;
  var y = d * 365.25;
  ms = function(val, options) {
    options = options || {};
    var type = typeof val;
    if (type === "string" && val.length > 0) {
      return parse(val);
    } else if (type === "number" && isFinite(val)) {
      return options.long ? fmtLong(val) : fmtShort(val);
    }
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
    );
  };
  function parse(str) {
    str = String(str);
    if (str.length > 100) {
      return;
    }
    var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
      str
    );
    if (!match) {
      return;
    }
    var n = parseFloat(match[1]);
    var type = (match[2] || "ms").toLowerCase();
    switch (type) {
      case "years":
      case "year":
      case "yrs":
      case "yr":
      case "y":
        return n * y;
      case "weeks":
      case "week":
      case "w":
        return n * w;
      case "days":
      case "day":
      case "d":
        return n * d;
      case "hours":
      case "hour":
      case "hrs":
      case "hr":
      case "h":
        return n * h;
      case "minutes":
      case "minute":
      case "mins":
      case "min":
      case "m":
        return n * m;
      case "seconds":
      case "second":
      case "secs":
      case "sec":
      case "s":
        return n * s;
      case "milliseconds":
      case "millisecond":
      case "msecs":
      case "msec":
      case "ms":
        return n;
      default:
        return void 0;
    }
  }
  function fmtShort(ms2) {
    var msAbs = Math.abs(ms2);
    if (msAbs >= d) {
      return Math.round(ms2 / d) + "d";
    }
    if (msAbs >= h) {
      return Math.round(ms2 / h) + "h";
    }
    if (msAbs >= m) {
      return Math.round(ms2 / m) + "m";
    }
    if (msAbs >= s) {
      return Math.round(ms2 / s) + "s";
    }
    return ms2 + "ms";
  }
  function fmtLong(ms2) {
    var msAbs = Math.abs(ms2);
    if (msAbs >= d) {
      return plural(ms2, msAbs, d, "day");
    }
    if (msAbs >= h) {
      return plural(ms2, msAbs, h, "hour");
    }
    if (msAbs >= m) {
      return plural(ms2, msAbs, m, "minute");
    }
    if (msAbs >= s) {
      return plural(ms2, msAbs, s, "second");
    }
    return ms2 + " ms";
  }
  function plural(ms2, msAbs, n, name) {
    var isPlural = msAbs >= n * 1.5;
    return Math.round(ms2 / n) + " " + name + (isPlural ? "s" : "");
  }
  return ms;
}
var common;
var hasRequiredCommon;
function requireCommon() {
  if (hasRequiredCommon) return common;
  hasRequiredCommon = 1;
  function setup(env2) {
    createDebug.debug = createDebug;
    createDebug.default = createDebug;
    createDebug.coerce = coerce;
    createDebug.disable = disable;
    createDebug.enable = enable;
    createDebug.enabled = enabled;
    createDebug.humanize = requireMs();
    createDebug.destroy = destroy;
    Object.keys(env2).forEach((key) => {
      createDebug[key] = env2[key];
    });
    createDebug.names = [];
    createDebug.skips = [];
    createDebug.formatters = {};
    function selectColor(namespace) {
      let hash = 0;
      for (let i = 0; i < namespace.length; i++) {
        hash = (hash << 5) - hash + namespace.charCodeAt(i);
        hash |= 0;
      }
      return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
    }
    createDebug.selectColor = selectColor;
    function createDebug(namespace) {
      let prevTime;
      let enableOverride = null;
      let namespacesCache;
      let enabledCache;
      function debug2(...args2) {
        if (!debug2.enabled) {
          return;
        }
        const self = debug2;
        const curr = Number(/* @__PURE__ */ new Date());
        const ms2 = curr - (prevTime || curr);
        self.diff = ms2;
        self.prev = prevTime;
        self.curr = curr;
        prevTime = curr;
        args2[0] = createDebug.coerce(args2[0]);
        if (typeof args2[0] !== "string") {
          args2.unshift("%O");
        }
        let index = 0;
        args2[0] = args2[0].replace(/%([a-zA-Z%])/g, (match, format) => {
          if (match === "%%") {
            return "%";
          }
          index++;
          const formatter = createDebug.formatters[format];
          if (typeof formatter === "function") {
            const val = args2[index];
            match = formatter.call(self, val);
            args2.splice(index, 1);
            index--;
          }
          return match;
        });
        createDebug.formatArgs.call(self, args2);
        const logFn = self.log || createDebug.log;
        logFn.apply(self, args2);
      }
      debug2.namespace = namespace;
      debug2.useColors = createDebug.useColors();
      debug2.color = createDebug.selectColor(namespace);
      debug2.extend = extend;
      debug2.destroy = createDebug.destroy;
      Object.defineProperty(debug2, "enabled", {
        enumerable: true,
        configurable: false,
        get: () => {
          if (enableOverride !== null) {
            return enableOverride;
          }
          if (namespacesCache !== createDebug.namespaces) {
            namespacesCache = createDebug.namespaces;
            enabledCache = createDebug.enabled(namespace);
          }
          return enabledCache;
        },
        set: (v) => {
          enableOverride = v;
        }
      });
      if (typeof createDebug.init === "function") {
        createDebug.init(debug2);
      }
      return debug2;
    }
    function extend(namespace, delimiter) {
      const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
      newDebug.log = this.log;
      return newDebug;
    }
    function enable(namespaces) {
      createDebug.save(namespaces);
      createDebug.namespaces = namespaces;
      createDebug.names = [];
      createDebug.skips = [];
      const split = (typeof namespaces === "string" ? namespaces : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
      for (const ns of split) {
        if (ns[0] === "-") {
          createDebug.skips.push(ns.slice(1));
        } else {
          createDebug.names.push(ns);
        }
      }
    }
    function matchesTemplate(search, template) {
      let searchIndex = 0;
      let templateIndex = 0;
      let starIndex = -1;
      let matchIndex = 0;
      while (searchIndex < search.length) {
        if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === "*")) {
          if (template[templateIndex] === "*") {
            starIndex = templateIndex;
            matchIndex = searchIndex;
            templateIndex++;
          } else {
            searchIndex++;
            templateIndex++;
          }
        } else if (starIndex !== -1) {
          templateIndex = starIndex + 1;
          matchIndex++;
          searchIndex = matchIndex;
        } else {
          return false;
        }
      }
      while (templateIndex < template.length && template[templateIndex] === "*") {
        templateIndex++;
      }
      return templateIndex === template.length;
    }
    function disable() {
      const namespaces = [
        ...createDebug.names,
        ...createDebug.skips.map((namespace) => "-" + namespace)
      ].join(",");
      createDebug.enable("");
      return namespaces;
    }
    function enabled(name) {
      for (const skip of createDebug.skips) {
        if (matchesTemplate(name, skip)) {
          return false;
        }
      }
      for (const ns of createDebug.names) {
        if (matchesTemplate(name, ns)) {
          return true;
        }
      }
      return false;
    }
    function coerce(val) {
      if (val instanceof Error) {
        return val.stack || val.message;
      }
      return val;
    }
    function destroy() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    createDebug.enable(createDebug.load());
    return createDebug;
  }
  common = setup;
  return common;
}
var hasRequiredBrowser;
function requireBrowser() {
  if (hasRequiredBrowser) return browser.exports;
  hasRequiredBrowser = 1;
  (function(module, exports$1) {
    exports$1.formatArgs = formatArgs;
    exports$1.save = save;
    exports$1.load = load;
    exports$1.useColors = useColors;
    exports$1.storage = localstorage();
    exports$1.destroy = /* @__PURE__ */ (() => {
      let warned = false;
      return () => {
        if (!warned) {
          warned = true;
          console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
        }
      };
    })();
    exports$1.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
        return true;
      }
      if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
      }
      let m;
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function formatArgs(args2) {
      args2[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args2[0] + (this.useColors ? "%c " : " ") + "+" + module.exports.humanize(this.diff);
      if (!this.useColors) {
        return;
      }
      const c = "color: " + this.color;
      args2.splice(1, 0, c, "color: inherit");
      let index = 0;
      let lastC = 0;
      args2[0].replace(/%[a-zA-Z%]/g, (match) => {
        if (match === "%%") {
          return;
        }
        index++;
        if (match === "%c") {
          lastC = index;
        }
      });
      args2.splice(lastC, 0, c);
    }
    exports$1.log = console.debug || console.log || (() => {
    });
    function save(namespaces) {
      try {
        if (namespaces) {
          exports$1.storage.setItem("debug", namespaces);
        } else {
          exports$1.storage.removeItem("debug");
        }
      } catch (error2) {
      }
    }
    function load() {
      let r;
      try {
        r = exports$1.storage.getItem("debug") || exports$1.storage.getItem("DEBUG");
      } catch (error2) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    function localstorage() {
      try {
        return localStorage;
      } catch (error2) {
      }
    }
    module.exports = requireCommon()(exports$1);
    const { formatters } = module.exports;
    formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (error2) {
        return "[UnexpectedJSONParseError]: " + error2.message;
      }
    };
  })(browser, browser.exports);
  return browser.exports;
}
var node = { exports: {} };
var hasFlag;
var hasRequiredHasFlag;
function requireHasFlag() {
  if (hasRequiredHasFlag) return hasFlag;
  hasRequiredHasFlag = 1;
  hasFlag = (flag, argv = process.argv) => {
    const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
    const position = argv.indexOf(prefix + flag);
    const terminatorPosition = argv.indexOf("--");
    return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
  };
  return hasFlag;
}
var supportsColor_1;
var hasRequiredSupportsColor;
function requireSupportsColor() {
  if (hasRequiredSupportsColor) return supportsColor_1;
  hasRequiredSupportsColor = 1;
  const os = require$$0$3;
  const tty = require$$1;
  const hasFlag2 = requireHasFlag();
  const { env: env2 } = process;
  let forceColor;
  if (hasFlag2("no-color") || hasFlag2("no-colors") || hasFlag2("color=false") || hasFlag2("color=never")) {
    forceColor = 0;
  } else if (hasFlag2("color") || hasFlag2("colors") || hasFlag2("color=true") || hasFlag2("color=always")) {
    forceColor = 1;
  }
  if ("FORCE_COLOR" in env2) {
    if (env2.FORCE_COLOR === "true") {
      forceColor = 1;
    } else if (env2.FORCE_COLOR === "false") {
      forceColor = 0;
    } else {
      forceColor = env2.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env2.FORCE_COLOR, 10), 3);
    }
  }
  function translateLevel(level) {
    if (level === 0) {
      return false;
    }
    return {
      level,
      hasBasic: true,
      has256: level >= 2,
      has16m: level >= 3
    };
  }
  function supportsColor(haveStream, streamIsTTY) {
    if (forceColor === 0) {
      return 0;
    }
    if (hasFlag2("color=16m") || hasFlag2("color=full") || hasFlag2("color=truecolor")) {
      return 3;
    }
    if (hasFlag2("color=256")) {
      return 2;
    }
    if (haveStream && !streamIsTTY && forceColor === void 0) {
      return 0;
    }
    const min = forceColor || 0;
    if (env2.TERM === "dumb") {
      return min;
    }
    if (process.platform === "win32") {
      const osRelease = os.release().split(".");
      if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
        return Number(osRelease[2]) >= 14931 ? 3 : 2;
      }
      return 1;
    }
    if ("CI" in env2) {
      if (["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((sign) => sign in env2) || env2.CI_NAME === "codeship") {
        return 1;
      }
      return min;
    }
    if ("TEAMCITY_VERSION" in env2) {
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env2.TEAMCITY_VERSION) ? 1 : 0;
    }
    if (env2.COLORTERM === "truecolor") {
      return 3;
    }
    if ("TERM_PROGRAM" in env2) {
      const version = parseInt((env2.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (env2.TERM_PROGRAM) {
        case "iTerm.app":
          return version >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    if (/-256(color)?$/i.test(env2.TERM)) {
      return 2;
    }
    if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env2.TERM)) {
      return 1;
    }
    if ("COLORTERM" in env2) {
      return 1;
    }
    return min;
  }
  function getSupportLevel(stream2) {
    const level = supportsColor(stream2, stream2 && stream2.isTTY);
    return translateLevel(level);
  }
  supportsColor_1 = {
    supportsColor: getSupportLevel,
    stdout: translateLevel(supportsColor(true, tty.isatty(1))),
    stderr: translateLevel(supportsColor(true, tty.isatty(2)))
  };
  return supportsColor_1;
}
var hasRequiredNode;
function requireNode() {
  if (hasRequiredNode) return node.exports;
  hasRequiredNode = 1;
  (function(module, exports$1) {
    const tty = require$$1;
    const util = require$$0$8;
    exports$1.init = init;
    exports$1.log = log;
    exports$1.formatArgs = formatArgs;
    exports$1.save = save;
    exports$1.load = load;
    exports$1.useColors = useColors;
    exports$1.destroy = util.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    );
    exports$1.colors = [6, 2, 3, 4, 5, 1];
    try {
      const supportsColor = requireSupportsColor();
      if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
        exports$1.colors = [
          20,
          21,
          26,
          27,
          32,
          33,
          38,
          39,
          40,
          41,
          42,
          43,
          44,
          45,
          56,
          57,
          62,
          63,
          68,
          69,
          74,
          75,
          76,
          77,
          78,
          79,
          80,
          81,
          92,
          93,
          98,
          99,
          112,
          113,
          128,
          129,
          134,
          135,
          148,
          149,
          160,
          161,
          162,
          163,
          164,
          165,
          166,
          167,
          168,
          169,
          170,
          171,
          172,
          173,
          178,
          179,
          184,
          185,
          196,
          197,
          198,
          199,
          200,
          201,
          202,
          203,
          204,
          205,
          206,
          207,
          208,
          209,
          214,
          215,
          220,
          221
        ];
      }
    } catch (error2) {
    }
    exports$1.inspectOpts = Object.keys(process.env).filter((key) => {
      return /^debug_/i.test(key);
    }).reduce((obj, key) => {
      const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_, k) => {
        return k.toUpperCase();
      });
      let val = process.env[key];
      if (/^(yes|on|true|enabled)$/i.test(val)) {
        val = true;
      } else if (/^(no|off|false|disabled)$/i.test(val)) {
        val = false;
      } else if (val === "null") {
        val = null;
      } else {
        val = Number(val);
      }
      obj[prop] = val;
      return obj;
    }, {});
    function useColors() {
      return "colors" in exports$1.inspectOpts ? Boolean(exports$1.inspectOpts.colors) : tty.isatty(process.stderr.fd);
    }
    function formatArgs(args2) {
      const { namespace: name, useColors: useColors2 } = this;
      if (useColors2) {
        const c = this.color;
        const colorCode = "\x1B[3" + (c < 8 ? c : "8;5;" + c);
        const prefix = `  ${colorCode};1m${name} \x1B[0m`;
        args2[0] = prefix + args2[0].split("\n").join("\n" + prefix);
        args2.push(colorCode + "m+" + module.exports.humanize(this.diff) + "\x1B[0m");
      } else {
        args2[0] = getDate() + name + " " + args2[0];
      }
    }
    function getDate() {
      if (exports$1.inspectOpts.hideDate) {
        return "";
      }
      return (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function log(...args2) {
      return process.stderr.write(util.formatWithOptions(exports$1.inspectOpts, ...args2) + "\n");
    }
    function save(namespaces) {
      if (namespaces) {
        process.env.DEBUG = namespaces;
      } else {
        delete process.env.DEBUG;
      }
    }
    function load() {
      return process.env.DEBUG;
    }
    function init(debug2) {
      debug2.inspectOpts = {};
      const keys = Object.keys(exports$1.inspectOpts);
      for (let i = 0; i < keys.length; i++) {
        debug2.inspectOpts[keys[i]] = exports$1.inspectOpts[keys[i]];
      }
    }
    module.exports = requireCommon()(exports$1);
    const { formatters } = module.exports;
    formatters.o = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts).split("\n").map((str) => str.trim()).join(" ");
    };
    formatters.O = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts);
    };
  })(node, node.exports);
  return node.exports;
}
var hasRequiredSrc$1;
function requireSrc$1() {
  if (hasRequiredSrc$1) return src$1.exports;
  hasRequiredSrc$1 = 1;
  if (typeof process === "undefined" || process.type === "renderer" || process.browser === true || process.__nwjs) {
    src$1.exports = requireBrowser();
  } else {
    src$1.exports = requireNode();
  }
  return src$1.exports;
}
var friendlyWords$1 = {};
const collections = ["accrual", "aggregation", "album", "analects", "anthology", "array", "assembly", "assortment", "bank", "batch", "bouquet", "bricolage", "bushel", "clump", "clutch", "collection", "collective", "compilation", "conglomeration", "constellation", "contribution", "cumulation", "digest", "everything", "flight", "florilegium", "garland", "gathering", "group", "gumbo", "heap", "herd", "hoard", "jumble", "kaleidoscope", "kit", "list", "lot", "mashup", "medley", "melange", "menu", "mine", "miscellany", "mishmash", "mix", "nest", "organization", "pack", "packet", "parcel", "playlist", "pool", "potpourri", "range", "reserve", "reservoir", "roll", "selection", "set", "shrewdness", "spicilege", "stack", "stockpile", "store", "supply", "treasure", "treasury", "troupe", "variety"];
const objects = /* @__PURE__ */ JSON.parse('["aardvark","aardwolf","abacus","abrosaurus","abstract","acai","acapella","accelerator","accordion","account","achillobator","acorn","acoustic","acrylic","act","action","activity","actress","adapter","adasaurus","addition","address","adjustment","advantage","adverb","aerosteon","afrovenator","aftermath","afternoon","aftershave","afterthought","agate","age","agenda","agreement","agustinia","air","airboat","airbus","airedale","airmail","airplane","airport","airship","akubra","alamosaurus","alarm","albacore","albatross","albertonykus","albertosaurus","alder","aletopelta","alfalfa","algebra","alibi","alley","alligator","allium","allosaurus","alloy","allspice","almanac","almandine","almond","alpaca","alphabet","alto","aluminum","alvarezsaurus","alyssum","amaranthus","amaryllis","amazonsaurus","ambert","ambulance","amethyst","amount","amp","ampersand","amphibian","amusement","anaconda","anatosaurus","anchovy","ancient","andesaurus","anemone","angelfish","anger","angle","anglerfish","angolatitan","angora","animal","animantarx","anise","ankle","ankylosaurus","anorak","answer","ant","antarctopelta","anteater","antelope","anthropology","antimatter","antimony","antique","antler","antlion","apartment","apatosaurus","aphid","apogee","apology","appalachiosaurus","apparatus","apparel","appeal","appendix","apple","appliance","approach","approval","apricot","aquarius","aragon","aragosaurus","arch","archaeology","archaeopteryx","archduchess","archduke","archeology","archer","area","argon","argument","aries","aristosuchus","arithmetic","armadillo","armchair","army","arrhinceratops","arrow","art","arthropod","artichoke","article","ash","asiago","asp","asparagus","aspen","asphalt","aster","asterisk","asteroid","astrodon","astronaut","astronomy","athlete","atlasaurus","atmosphere","atom","atrociraptor","attack","attempt","attention","attic","attraction","august","aura","aurora","auroraceratops","author","authority","authorization","avatar","avenue","avocado","awe","axolotl","azalea","azimuth","babcat","baboon","backbone","background","backpack","bactrosaurus","badge","badger","bag","bagel","bagpipe","bait","bakery","balance","balaur","ball","ballcap","balloon","balmoral","bambiraptor","bamboo","banana","band","bandana","bandicoot","bangle","banjo","bank","bar","barbecue","barber","barberry","bard","barge","baritone","barn","barnacle","barnyard","barometer","baron","baroness","barracuda","baryonyx","baseball","basement","basil","basilisk","basin","basket","basketball","bass","bassoon","bat","bath","bathroom","bathtub","battery","bay","bayberry","beach","bead","beak","beam","bean","beanie","bear","bearberry","beard","bearskin","beast","beat","beaufort","beauty","becklespinax","bed","bedbug","bee","beech","beechnut","beet","beetle","beginner","begonia","behavior","belief","bell","bellflower","bellusaurus","belt","beluga","bench","beret","bergamot","berry","beryllium","bestseller","bicycle","bike","bill","billboard","binder","biology","biplane","birch","bird","birthday","bismuth","bison","bistro","bit","bite","bittersweet","blackberry","blackbird","blackcurrant","bladder","blade","blanket","blarney","blender","blinker","blizzard","block","bloom","blossom","blouse","blue","bluebell","boa","boar","board","boat","boater","bobble","bobcat","bobolink","bolt","bongo","bonnet","bonobo","bonsai","book","bookcase","booklet","boot","booth","border","borogovia","boron","bosworth","botany","bottle","bottom","bougon","bounce","boursin","bow","bowl","bowler","box","boysenberry","brace","brachiosaurus","bracket","braid","brain","brake","bramble","branch","brand","brass","brazil","bread","breadfruit","break","breakfast","bream","breath","breeze","brick","bridge","brie","brisket","broccoli","brochure","broker","bromine","brontomerus","bronze","brook","broom","brother","brow","brownie","browser","brush","bubble","bubbler","buckaroo","bucket","buckthorn","buckthornpepperberry","budget","buffalo","buffer","buffet","bug","bugle","building","bulb","bumper","bun","burglar","burn","burrito","burst","bus","butter","buttercup","butterfly","butterkase","butternut","button","buzzard","cabbage","cabin","cabinet","cacao","cactus","cadet","cadmium","cafe","cairnsmore","cake","calcium","calculator","calendula","calf","calliandra","camel","camelotia","camera","camp","can","canary","candle","candy","candytuft","canidae","cannon","canoe","canopy","cantaloupe","canvas","cap","capacity","caper","cappelletti","capri","capricorn","captain","caption","capybara","car","caravan","caravel","caraway","carbon","card","cardamom","cardboard","cardigan","cardinal","care","caribou","carnation","carob","carol","carp","carpenter","carpet","carriage","carrot","cart","cartoon","cartwheel","carver","case","cashew","casquette","cast","castanet","cat","catamaran","catboat","catcher","caterpillar","catfish","cathedral","catmint","catshark","catsup","cattle","cauliflower","cause","caution","cave","cayenne","ceder","ceiling","celery","celestite","cell","cellar","cello","celsius","cement","cemetery","cent","centaur","centipede","century","cephalopod","ceramic","ceratonykus","cereal","cerise","cesium","chair","chalk","challenge","chameleon","chamomile","chance","change","channel","chanter","character","charger","chartreuse","chasmosaurus","chatter","chauffeur","check","cheddar","cheek","cheese","cheetah","chef","chemistry","cheque","cherry","cheshire","chess","chestnut","chevre","chickadee","chicken","chicory","child","chili","chill","chiller","chime","chimpanzee","chinchilla","chip","chipmunk","chips","chive","chocolate","chokeberry","chopper","chord","christmas","chronometer","chrysanthemum","chungkingosaurus","church","cicada","cilantro","cinema","cinnamon","circle","circus","cirrus","citipati","citizen","citrine","citron","citrus","city","clam","clarinet","class","clave","clavicle","clef","clematis","clementine","click","client","climb","clipper","cloak","cloche","clock","close","closet","cloth","cloud","cloudberry","clove","clover","clownfish","club","clutch","coal","coast","coaster","coat","cobalt","cobbler","cobra","cobweb","cockatoo","cockroach","cocoa","coconut","cod","coelurus","coffee","coil","coin","colby","cold","collar","collarbone","collard","college","collision","colony","color","colossus","colt","column","columnist","comb","comet","comfort","comic","comma","composer","computer","comte","concavenator","conchoraptor","concrete","condition","condor","condorraptor","cone","coneflower","confidence","conga","congress","conifer","conkerberry","consonant","constellation","constrictor","continent","contraption","cook","cookie","copper","copy","coral","cord","coreopsis","coriander","cork","corleggy","cormorant","corn","cornet","cornflower","cornucopia","cosmonaut","cosmos","cost","cotija","cotton","couch","cougar","cough","count","countess","country","course","court","cousin","cover","cow","cowbell","cowl","coyote","crab","crabapple","crafter","crane","crate","crater","crawdad","crayfish","crayon","creator","creature","credit","creek","crepe","cress","crest","crib","cricket","crime","crocodile","crocus","croissant","crop","cross","crow","crowberry","crowd","crowley","crown","cruiser","crustacean","cry","crystal","cub","cuckoo","cucumber","culotte","cup","cupboard","cupcake","curiosity","curler","currant","currency","curtain","curve","cushion","custard","cut","cuticle","cyclamen","cycle","cyclone","cylinder","cymbal","daemonosaurus","daffodil","dahlia","damselfly","dance","dancer","dandelion","danger","danthus","daphne","darkness","dart","dash","data","dataset","date","daughter","dawn","day","dead","deal","debt","decade","decimal","decision","dedication","deer","deerstalker","degree","delivery","delphinium","deltadromeus","den","denim","dentist","department","deposit","derby","desert","desk","dessert","detail","detective","device","devourer","dew","dewberry","diabloceratops","diadem","diagnostic","diagram","diamond","dianella","diascia","dibble","dichondra","dietician","digestion","digit","dill","dilophosaurus","dime","dimple","dinghy","dinner","dinosaur","diplodocus","diploma","direction","dirigible","dirt","discovery","dish","distance","ditto","dive","diver","dog","dogsled","dogwood","dollar","dolomite","dolphin","domain","donkey","donut","doom","door","doppler","dormouse","double","dove","dracopelta","dracorex","dragon","dragonfly","dragonfruit","drain","draw","drawbridge","drawer","dreadnought","dream","dress","dresser","drifter","drill","drink","drip","drive","driver","drizzle","drop","droplet","drum","dry","dryer","dryosaurus","duchess","duck","duckling","dugong","dugout","duke","dumpling","dungeon","durian","dust","dye","eagle","ear","earl","earth","earthquake","earthworm","earwig","ease","echidna","echinacea","echinodon","echium","echo","eclipse","edam","edge","editor","editorial","education","eel","effect","efraasia","egg","eggnog","eggplant","elbow","elderberry","element","elephant","elf","elk","ellipse","elm","emmental","emoji","emperor","empress","emu","end","enemy","energy","engine","engineer","english","enigmosaurus","enquiry","enthusiasm","entrance","entree","environment","eocursor","eoraptor","epoch","epoxy","equinox","equipment","era","erigeron","ermine","error","espadrille","estimate","ethernet","eucalyptus","euphonium","eustoma","evening","event","evergreen","exception","exhaust","existence","exoplanet","expansion","experience","expert","explanation","eye","eyebrow","eyelash","eyeliner","fabrosaurus","face","fact","factory","fahrenheit","failing","falcon","fall","family","fan","fanatic","fang","farm","farmer","farmhouse","fascinator","fastball","father","faucet","fear","feast","feather","fedora","feeling","feels","feet","felidae","femur","fender","fennel","fenugreek","fern","fernleaf","ferret","ferry","ferryboat","feta","feverfew","fiber","fibre","fibula","fiction","field","fifth","fig","fight","fighter","figure","filament","file","fin","finch","find","fine","fir","fire","firefly","fireman","fireplace","fireplant","firewall","fish","fisher","fisherman","flag","flame","flamingo","flannel","flare","flat","flavor","flax","flea","flier","flight","flock","flood","floor","floss","flower","fluorine","flute","fly","flyaway","flyingfish","foam","foe","fog","fold","fontina","food","football","force","forecast","forest","forger","forgery","fork","form","forsythia","fortnight","foundation","fountain","fowl","fox","foxglove","foxtail","foxtrot","fragment","fragrance","frame","freckle","freedom","freesia","freeze","freezer","freighter","freon","friction","friday","fridge","friend","frigate","fright","frill","frog","front","frost","frown","fruit","fruitadens","fuchsia","fuel","fukuiraptor","function","fur","furniture","gadget","galaxy","galette","galleon","galley","galliform","gallimimus","gallium","gallon","gambler","game","gander","garage","garden","gardenia","gargoyle","gargoyleosaurus","garlic","garment","garnet","gas","gasoline","gasosaurus","gastonia","gate","gateway","gatsby","gauge","gazelle","gear","gecko","geese","gem","gemini","general","generation","geography","geology","geometry","geranium","gerbera","gerbil","germanium","ghost","ghoul","giant","gibbon","giganotosaurus","gigantoraptor","gigantspinosaurus","gilmoreosaurus","ginger","giraffatitan","giraffe","girdle","giver","glade","gladiolus","glass","glasses","glazer","glider","glitter","globe","globeflower","glockenspiel","glove","glow","glue","goal","gojirasaurus","gold","goldenrod","goldfish","golf","gondola","gong","gooseberry","gopher","gorgonzola","gorilla","gosling","gouda","gourd","governor","grade","graffiti","grain","gram","grandiflora","grandparent","grape","grapple","grass","grasshopper","gravity","gray","grease","green","grenadilla","grey","griffin","grill","grin","grip","ground","group","grouse","growth","gruyere","guan","guanaco","guarantee","guardian","guava","guavaberry","guest","guide","guilty","guitar","gull","gum","guppy","gym","gymnast","hacksaw","haddock","hadrosaurus","hail","hair","haircut","halibut","hall","halloumi","hallway","hamburger","hammer","hamster","handball","handbell","handle","handsaw","handspring","handstand","harbor","hardboard","hardcover","hardhat","hardware","hare","harmonica","harmony","harp","harpymimus","harrier","hat","haumea","havarti","hawk","hawthorn","haze","headlight","headline","headphones","headstand","healer","health","hearing","heart","heat","heath","heather","heaven","hedge","hedgehog","height","helenium","helicona","helicopter","heliotrope","helium","hellebore","helmet","help","helper","hemisphere","hen","henley","hero","heron","herring","hexagon","hibiscus","hickory","hide","hill","hip","hippodraco","hippopotamus","hiss","hisser","hockey","holiday","hollyhock","homburg","homegrown","honesty","honey","honeycrisp","honeycup","honeydew","honeysuckle","hoodie","hoof","hook","hope","horesradish","hornet","horse","hortensia","hose","hospital","hosta","hotel","hound","hour","hourglass","house","houseboat","hovercraft","hoverfly","howler","hub","hubcap","huckleberry","hugger","humerus","humidity","hummingbird","humor","hunter","hurricane","hyacinth","hydrangea","hydrant","hydrofoil","hydrogen","hyena","hygienic","hyphen","hyssop","iberis","ice","iceberg","icebreaker","icecream","icicle","icon","idea","iguana","iguanacolossus","iguanadon","iguanodon","impala","impatiens","impulse","income","increase","index","indigo","individual","industry","infinity","ink","innocent","innovation","insect","inspiration","intelligence","interest","iodine","iridium","iris","iron","ironclad","island","isthmus","ixia","jaborosa","jackal","jacket","jackfruit","jackrabbit","jaguar","jam","jar","jargon","jasmine","jasper","jaw","jaxartosaurus","jay","jeans","jeep","jellyfish","jersey","jester","jet","jingle","jitterbug","jobaria","jodhpur","joggers","join","joke","jonquil","journey","judge","judo","juice","jujube","jump","jumper","jumpsuit","juniper","jupiter","juravenator","jury","justice","jute","kangaroo","kayak","keeper","ketch","ketchup","kettle","kettledrum","key","keyboard","kick","kicker","kidney","kileskus","kilogram","kilometer","king","kingfisher","kip","kitchen","kite","kitten","kiwi","knee","knife","knight","knot","knuckle","koala","koi","kookaburra","kosmoceratops","krill","krypton","kryptops","kumquat","laborer","lace","ladybug","lake","lamb","lamp","lamprey","lan","lancer","land","language","lantana","lantern","larch","lark","larkspur","lasagna","laser","latency","lathe","laugh","launch","laundry","lavender","law","lawyer","layer","lead","leader","leaf","learning","leather","leech","leek","legal","legend","legume","lemming","lemon","lemonade","lemongrass","lemur","lens","lentil","leo","leopard","leopon","leotard","leptoceratops","letter","lettuce","level","lever","libra","library","license","licorice","lifeboat","lift","lifter","light","lighter","lightning","lightyear","lilac","lillipilli","limburger","lime","limit","limpet","line","linen","lingo","lingonberry","link","linseed","lint","lion","lip","lipstick","liquid","list","literature","litter","liver","lizard","llama","loaf","loan","lobe","lobster","lock","locket","locust","lodge","log","loganberry","logic","longan","longship","look","lotus","louse","lumber","lunaria","lunch","lung","lunge","lungfish","lupin","lute","lychee","lycra","lynx","lyre","lyric","macadamia","macaroni","macaroon","macaw","machine","mackerel","macrame","magazine","magic","magician","magnesium","magnolia","magnosaurus","magpie","mahogany","maiasaura","mail","mailbox","mailman","maize","makemake","makeup","mall","mallet","mallow","mambo","mammal","manager","manatee","manchego","mandarin","mandevilla","mandible","mandolin","mandrill","mango","mangosteen","manicure","manner","manta","mantis","manuscript","manx","map","maple","mapusaurus","maraca","marble","march","mare","margin","marigold","marimba","marionberry","marjoram","market","marlin","marmoset","marmot","marquess","marquis","mars","marshmallow","marsupial","marten","mascara","mascarpone","mask","mass","mastodon","mat","match","math","matrix","maxilla","may","mayflower","mayonnaise","meadow","meadowlark","meal","measure","meat","mechanic","medallion","medicine","medusaceratops","meerkat","meeting","megalosaurus","megaraptor","melody","melon","memory","menu","mercury","message","metacarpal","metal","metatarsal","meteor","meteorite","meteoroid","meteorology","meter","methane","mice","microceratops","microraptor","microwave","middle","midnight","mile","milk","milkshake","millennium","mimosa","mind","mine","minibus","mink","minnow","minotaurasaurus","mint","minute","mirror","mist","mistake","mitten","mixer","mixture","moat","mochi","mockingbird","modem","mojoceratops","molasses","mole","molecule","mollusk","molybdenum","monarch","monday","money","mongoose","monitor","monkey","month","mood","moon","moonflower","moonstone","moose","moral","morning","morocco","mortarboard","mosquito","moss","moth","motion","motor","motorcycle","motorist","mountain","mouse","mousepad","moustache","mouth","move","movie","mozzarella","muenster","mulberry","mule","mum","munchkin","muscari","muscle","muse","museum","mushroom","music","musician","muskmelon","muskox","mustang","mustard","myrtle","myth","nail","name","nannyberry","napkin","naranja","narcissus","narwhal","nasturtium","nation","nautilus","navy","nebula","nectarine","need","neem","neighbor","neighborhood","nemophila","neon","nephew","neptune","nerine","nerve","nest","net","network","neutral","newsboy","newspaper","newsprint","newsstand","newt","nickel","niece","nigella","night","nightingale","nightshade","ninja","nitrogen","node","noise","noodle","noon","nose","note","notebook","notify","noun","nova","novel","november","number","numeric","nurse","nut","nutmeg","nutria","nylon","nymphea","oak","oatmeal","objective","oboe","observation","observatory","ocarina","occupation","ocean","ocelot","ocicat","octagon","octave","october","octopus","odometer","offer","office","ogre","oil","okra","olive","olivine","omelet","onion","onyx","opal","open","opera","operation","ophthalmologist","opinion","opossum","opportunity","option","orange","orangutan","orbit","orca","orchestra","orchid","order","oregano","organ","organization","origami","origin","oriole","ornament","ostrich","othnielia","otter","ounce","outfit","output","outrigger","oval","overcoat","oviraptor","owl","owner","ox","oxygen","oyster","ozraraptor","package","packet","paddleboat","page","pail","paint","painter","pair","pajama","palladium","palm","pamphlet","pan","panama","pancake","pancreas","panda","paneer","pangolin","panther","pantry","pantydraco","papaya","paper","paperback","paprika","papyrus","parade","paradox","parakeet","parallel","parallelogram","paranthodon","parcel","parent","parenthesis","park","parka","parmesan","parrot","parrotfish","parsley","parsnip","part","particle","partner","partridge","party","passbook","passenger","passionfruit","passive","pasta","paste","pastry","patch","patella","path","patient","patio","paw","pawpaw","payment","pea","peace","peach","peacock","peak","peanut","pear","pearl","pecorino","pedestrian","pediatrician","pegasus","pelican","pen","penalty","pencil","pendulum","penguin","pentaceratops","pentagon","peony","people","pepper","pepperberry","perch","perfume","peridot","perigee","period","periodical","peripheral","periwinkle","persimmon","pet","petalite","petroleum","petunia","pewter","phalange","pharaoh","pheasant","philodendron","philosophy","phone","phosphorus","phrase","physician","piano","piccolo","pick","pickle","pickup","picture","pie","pig","pigeon","pigment","pike","pillow","pilot","pin","pincushion","pine","pineapple","ping","pink","pint","pipe","piper","piranha","pirate","pisces","pitcher","pizza","place","plain","planarian","plane","planet","plank","plant","plantain","plaster","plastic","plate","platinum","platypus","play","player","playground","playroom","pleasure","plier","plot","plough","plow","plum","plume","pluto","plutonium","plywood","pocket","podium","poet","poetry","poinsettia","point","poison","polish","politician","polka","polo","polonium","polyanthus","polyester","pomegranate","pomelo","pond","pony","popcorn","poppyseed","porch","porcupine","porkpie","porpoise","port","porter","position","possum","postage","postbox","pot","potassium","potato","potential","poultry","powder","power","practice","pram","prawn","preface","prepared","pressure","price","primrose","primula","prince","princess","principal","principle","print","printer","process","produce","product","production","professor","profit","promise","promotion","proof","property","prose","prosecution","protest","protoceratops","protocol","provelone","prune","pruner","psychiatrist","psychology","ptarmigan","puck","pudding","pufferfish","puffin","pull","pullover","pulsar","puma","pump","pumpkin","punch","punishment","pupil","puppet","puppy","purchase","purple","purpose","push","puzzle","pyjama","pyramid","pyrite","pyroraptor","python","quail","quality","quark","quart","quarter","quartz","quasar","quesadilla","question","quicksand","quiet","quill","quilt","quince","quit","quiver","quokka","quotation","rabbit","raccoon","racer","raclette","radar","radiator","radio","radish","radium","radius","radon","raft","ragamuffin","ragdoll","rail","railway","rain","rainbow","raincoat","rainforest","rainstorm","raisin","raja","rake","rambutan","random","range","ranunculus","raptor","raptorex","rat","rattlesnake","raven","raver","ravioli","ray","rayon","reaction","reader","reading","reaper","reason","receipt","recess","record","recorder","red","redcurrant","referee","reference","region","regnosaurus","reindeer","relation","relative","relish","reminder","repair","replace","reply","report","reptile","request","research","resistance","resolution","resonance","respect","responsibility","rest","restaurant","result","revolve","reward","rhinoceros","rhodium","rhubarb","rhythm","rib","rice","ricotta","riddle","ridge","ring","ringer","rise","risk","river","riverbed","road","roadrunner","roadway","roar","roarer","roast","robe","robin","rock","rocket","rodent","roll","romano","rondeletia","roof","rook","room","rooster","roquefort","rose","rosehip","rosemary","rotate","roundworm","router","rover","rowboat","rubidium","ruby","rudbeckia","rugby","rule","rumba","run","runner","rutabaga","safflower","saffron","saga","sage","sagittarius","saguaro","sail","sailboat","sailfish","sailor","salad","salamander","salary","sale","salesman","salmon","salmonberry","salsa","salt","saltasaurus","saltopus","salute","samba","sand","sandal","sandalwood","sandpaper","sandwich","santanaraptor","sapphire","sarahsaurus","sardine","sassafras","satellite","satin","saturday","saturn","saturnalia","sauce","sauroposeidon","save","saver","savory","saw","sawfish","saxophone","scabiosa","scaffold","scale","scallion","scallop","scapula","scar","scarecrow","scarer","scarf","scene","scent","sceptre","school","schooner","science","scilla","scion","scissor","scooter","scorpio","scorpion","scourge","scowl","scraper","screen","screwdriver","scribe","script","sea","seagull","seahorse","seal","seaplane","search","seashore","season","seat","seatbelt","second","secretary","secure","seed","seeder","seeker","seer","seismosaurus","selenium","sense","september","serpent","servant","server","sesame","session","settee","shade","shadow","shake","shaker","shallot","shame","shampoo","shamrock","shape","share","shark","shawl","shear","sheep","sheet","shelf","shell","sherbet","shield","shift","shingle","ship","shirt","shock","shoe","shoemaker","shop","shoulder","shovel","show","shrimp","shrine","shroud","side","sidecar","sidewalk","sight","sign","silence","silene","silica","silicon","silk","silkworm","silver","silverfish","sing","singer","single","singularity","sink","situation","skate","skateboard","ski","skipjack","skirt","skull","skunk","sky","slash","slayer","sled","sleep","sleet","slice","slicer","slide","slider","slime","slip","slipper","slope","sloth","slouch","slug","smartphone","smile","smoke","snagglefoot","snail","snake","snap","snapdragon","snapper","snarl","sneeze","sneezeweed","snickerdoodle","snipe","snout","snow","snowboard","snowdrop","snowflake","snowman","snowplow","snowshoe","snowstorm","soap","soapwort","soarer","soccer","society","sociology","sock","socks","soda","sodalite","sodium","sofa","softball","soil","soldier","sole","sombrero","somersault","son","song","soprano","sorrel","sort","soul","sound","soup","source","soursop","sousaphone","sovereign","soy","soybean","space","spacecraft","spade","spaghetti","spandex","spark","sparrow","spatula","speak","speaker","spear","specialist","spectacles","spectrograph","spectroscope","spectrum","speech","speedboat","speedwell","spell","sphere","sphynx","spice","spider","spike","spinach","spinosaurus","spirit","splash","spleen","split","sponge","spoon","spoonbill","spot","spring","sprint","sprite","sprout","spruce","spur","sputter","spy","square","squash","squid","squirrel","stag","stage","staircase","stallion","stamp","star","starburst","starfish","starflower","stargazer","station","statistic","stay","stealer","steam","steed","steel","stegosaurus","stem","step","sternum","stetson","stew","stick","stilton","sting","stinger","stingray","stitch","stoat","stock","stocking","stomach","stone","stop","stoplight","store","storm","story","stove","strand","stranger","straw","strawflower","stream","street","streetcar","stretch","string","structure","study","sturgeon","stygimoloch","style","subject","submarine","substance","subway","success","sugar","suggestion","suit","sulfur","summer","sun","sundae","sunday","sundial","sunfish","sunflower","sunscreen","sunset","sunshine","sunspot","sunstone","supermarket","supernova","supply","surf","surfboard","surgeon","surprise","sushi","swallow","swamp","swan","sweater","sweatpants","sweatshirt","swift","swim","swing","switch","swoop","sword","swordfish","swordtail","sycamore","sync","syringa","syrup","system","syzygy","table","tablecloth","tabletop","tachometer","tadpole","tail","tailor","taker","taleggio","talk","talon","talos","tamarillo","tamarind","tang","tangelo","tangerine","tango","tank","tanker","tarantula","tarascosaurus","target","tarn","tarp","tarragon","tarsal","tarsier","tartan","taurus","tax","taxi","taxicab","tea","teacher","teal","team","technician","technosaurus","teeth","telephone","telescope","television","teller","tellurium","temper","temperature","temple","tempo","tendency","tennis","tenor","tent","termite","tern","terrier","territory","text","textbook","texture","theater","theory","thief","thimbleberry","thing","thistle","thorium","thorn","thought","thread","thrill","throat","throne","thrush","thumb","thunbergia","thunder","thursday","thyme","tibia","tick","ticket","tie","tiger","tiglon","tilapia","tile","timbale","time","timer","timimus","timpani","tin","tip","tire","titanium","titanoceratops","titanosaurus","tithonia","title","toad","toast","toaster","today","tomato","ton","toothbrush","toothpaste","top","topaz","toque","tornado","tortellini","tortoise","toucan","tourmaline","towel","tower","town","toy","track","tracker","tractor","trade","trader","traffic","trail","train","trampoline","transport","trapezoid","travel","traveler","trawler","tray","treatment","tree","triangle","triceratops","trick","tricorne","trigonometry","trilby","trillium","trip","trollius","trombone","troodon","trouble","trouser","trowel","truck","truffle","trumpet","trunk","trust","tsunami","tub","tuba","tuberose","tuck","tuesday","tugboat","tulip","tumble","tumbleweed","tuna","tune","tungsten","turkey","turn","turner","turnip","turnover","turquoise","turret","turtle","tv","twig","twilight","twill","twin","twine","twist","twister","typhoon","tyrannosaurus","umbra","umbrella","uncle","unicorn","uniform","universe","uranium","ursinia","utahceratops","utahraptor","utensil","vacation","vacuum","valley","value","van","vanadium","vanilla","variety","variraptor","vase","vault","vegetable","vegetarian","vehicle","veil","vein","velociraptor","velvet","venom","verbena","verdict","vermicelli","verse","vertebra","vessel","vest","veterinarian","vibraphone","viburnum","vicuna","vinyl","viola","violet","violin","viper","virgo","visage","viscose","viscount","viscountess","vise","vision","visitor","visor","voice","volcano","vole","volleyball","voyage","vulcanodon","vulture","waiter","waitress","wake","wakeboard","walk","walker","walkover","wall","wallaby","wallet","walleye","wallflower","walnut","walrus","waltz","wander","wanderer","wandflower","wannanosaurus","war","warbler","warlock","warrior","wasabi","wash","washer","wasp","waste","watch","watcher","watchmaker","water","watercress","waterfall","waterlily","wave","wavelength","wax","waxflower","way","wealth","weather","weaver","web","wedelia","wedge","wednesday","weeder","week","weight","whale","wheel","whimsey","whip","whippet","whippoorwill","whistle","whitefish","wholesaler","widget","wildcat","wildebeest","wilderness","wildflower","william","willow","wind","windflower","windscreen","windshield","wineberry","wing","winter","winterberry","wire","wish","wishbone","wisteria","witch","witness","wizard","wok","wolf","wolfberry","wolfsbane","wolverine","wombat","wood","woodpecker","woodwind","wool","woolen","word","work","workshop","wormhole","wren","wrench","wrinkle","wrist","writer","writing","xenon","xenoposeidon","xylocarp","xylophone","yacht","yak","yam","yamamomo","yard","yarn","yarrow","year","yellowhorn","yew","yogurt","yoke","yttrium","yumberry","yuzu","zebra","zebu","zenith","zenobia","zephyr","ziconium","zinc","zinnia","zipper","zircon","zone","zoo","zucchini","zydeco"]');
const predicates = /* @__PURE__ */ JSON.parse('["aback","abalone","abiding","ablaze","able","aboard","abounding","abrasive","abrupt","absorbed","absorbing","abstracted","abundance","abundant","abyssinian","accessible","accidental","accurate","achieved","acidic","acoustic","actually","acute","adaptable","adaptive","adhesive","adjoining","admitted","adorable","adventurous","aeolian","aerial","agate","aged","agreeable","ahead","airy","ajar","alabaster","alder","alert","alike","alive","alkaline","alluring","almond","almondine","aloud","alpine","aluminum","amazing","ambiguous","ambitious","amenable","amethyst","amplified","amused","amusing","ancient","angry","animated","antique","apple","apricot","aquamarine","aquatic","aromatic","arrow","artistic","ash","aspiring","assorted","astonishing","atlantic","atom","attractive","auspicious","automatic","autumn","available","awake","aware","awesome","axiomatic","azure","balanced","bald","ballistic","balsam","band","basalt","battle","bead","beaded","beautiful","bedecked","befitting","bejewled","believed","bemused","beneficial","berry","best","better","bevel","big","billowy","bird","bitter","bittersweet","blend","bloom","blossom","blue","blush","blushing","boatneck","boiled","boiling","bold","bolder","boom","booming","bottled","bottlenose","boulder","bouncy","boundless","bow","brainy","bramble","branch","branched","brash","brass","brassy","brave","brawny","brazen","breezy","brick","brief","bright","brindle","bristle","broad","broadleaf","broken","bronze","bronzed","brook","bubble","bubbly","bumpy","burly","bustling","busy","butter","buttercup","buttered","butternut","buttery","button","buttoned","bygone","cactus","cake","calico","calm","camp","canary","candied","candle","candy","canyon","capable","capricious","caramel","carbonated","carefree","careful","caring","carnation","carnelian","carpal","casual","cat","caterwauling","catkin","catnip","cautious","cedar","celestial","certain","cerulean","chain","chalk","chambray","changeable","charm","charmed","charming","chartreuse","chatter","checker","checkered","cheddar","cheerful","chemical","cherry","chestnut","chief","childish","childlike","chill","chip","chipped","chisel","chiseled","chivalrous","chlorinated","chocolate","chrome","circular","citrine","clammy","clarity","classic","classy","clean","clear","clever","cliff","climbing","closed","cloud","cloudy","clover","clumsy","coal","cobalt","coconut","coffee","coherent","cold","colorful","colossal","comet","comfortable","common","complete","complex","concise","concrete","confirmed","confused","confusion","congruous","conscious","continuous","cooing","cooked","cookie","cool","cooperative","coordinated","copper","copy","coral","cord","corner","cosmic","cotton","cottony","courageous","crawling","creative","crimson","crocus","crystal","crystalline","cubic","cuboid","cuddly","cultivate","cultured","cumbersome","curious","curse","curved","cut","cyan","cyber","cyclic","cypress","daffodil","daffy","daily","dandelion","dandy","dapper","dark","darkened","dashing","dawn","dazed","dazzling","deadpan","dear","debonair","deciduous","decisive","decorous","dedicated","deep","deeply","defiant","delicate","delicious","delightful","delirious","deluxe","denim","dent","dented","descriptive","desert","deserted","destiny","detailed","determined","developing","diagnostic","diamond","different","difficult","diligent","dirt","disco","discovered","discreet","distinct","dog","dolomite","dorian","dot","dour","dramatic","dull","dune","dust","dusty","dynamic","eager","early","earthy","east","eastern","easy","economic","educated","efficacious","efficient","eggplant","eight","elastic","elated","elderly","electric","elegant","elemental","elite","ember","emerald","eminent","emphasized","empty","enchanted","enchanting","encouraging","endurable","energetic","enormous","enshrined","entertaining","enthusiastic","equable","equal","equatorial","equinox","erratic","estimated","ethereal","evanescent","even","evening","evergreen","everlasting","excellent","excessive","excited","exciting","exclusive","expensive","experienced","extreme","exuberant","exultant","fabulous","faceted","factual","faint","fair","faithful","fallacious","false","familiar","famous","fan","fanatical","fancy","fantastic","fantasy","far","fascinated","fast","fate","fearless","feather","feline","fern","festive","few","field","fierce","fifth","fine","fir","fire","first","fish","five","fixed","flame","flannel","flash","flashy","flat","flawless","flax","flaxen","flicker","flint","florentine","flossy","flourish","flower","flowery","fluff","fluffy","fluorescent","fluoridated","fluttering","flying","foam","foamy","fog","foggy","foil","foregoing","foremost","forest","forested","fork","fortunate","fortune","fossil","foul","four","fourth","fragrant","freckle","free","freezing","frequent","fresh","friendly","frill","fringe","frost","frosted","fuchsia","full","functional","funny","furtive","future","futuristic","gainful","galvanized","gamy","garnet","garrulous","gaudy","gelatinous","gem","general","generated","gentle","geode","giant","giddy","gifted","gigantic","gilded","ginger","glacier","glamorous","glass","glaze","gleaming","glib","glimmer","glistening","glitter","glittery","global","glorious","glory","glossy","glow","glowing","gold","golden","goldenrod","good","goofy","gorgeous","gossamer","graceful","grand","grandiose","granite","grape","grass","grateful","gratis","grave","gravel","gray","great","green","gregarious","grey","grizzled","grizzly","groovy","grove","guiltless","gusty","guttural","habitual","hail","half","hallowed","halved","hammerhead","handsome","handsomely","handy","happy","hardly","harmless","harmonious","harsh","harvest","heady","healthy","heartbreaking","heather","heathered","heavenly","heavy","held","heliotrope","helix","helpful","hexagonal","hickory","highfalutin","highly","hilarious","hill","hip","hissing","historical","holistic","hollow","holy","honey","honeysuckle","honorable","honored","horn","horse","hospitable","hot","hulking","humane","humble","humdrum","humorous","hungry","hurricane","hushed","hyper","hypnotic","iced","icy","illustrious","imaginary","immediate","immense","imminent","impartial","important","imported","impossible","incandescent","inconclusive","incongruous","incredible","indecisive","indigo","indispensable","industrious","inexpensive","infrequent","ink","inky","innate","innovative","inquisitive","insidious","instinctive","intelligent","interesting","intermediate","internal","intriguing","invented","invincible","invited","iodized","ionian","ionized","iridescent","iris","iron","irradiated","island","ivy","jagged","jasper","jazzy","jealous","jelly","jet","jewel","jeweled","jolly","joyous","judicious","jumbled","jumpy","jungle","juniper","just","juvenile","kaput","keen","kind","kindhearted","kindly","kiwi","knotty","knowing","knowledgeable","lace","laced","lackadaisical","lacy","lake","languid","lapis","laser","lateral","lava","lavender","lavish","lead","leaf","lean","learned","leather","leeward","legend","legendary","lemon","level","liberating","light","lightning","like","likeable","lilac","lime","linen","literate","lithe","little","lively","living","lizard","local","locrian","lofty","long","longhaired","longing","lopsided","loud","lovely","loving","low","lowly","luck","lucky","ludicrous","lumbar","luminous","lunar","lush","luxuriant","luxurious","lydian","lying","lyrical","maddening","magenta","magic","magical","magnetic","magnificent","mahogany","maize","majestic","malachite","malleable","mammoth","mango","mangrove","maple","marble","marbled","marked","marmalade","maroon","marred","married","marsh","marshy","marvelous","massive","material","materialistic","mature","maze","meadow","medieval","mellow","melodic","melodious","melted","meowing","merciful","mercurial","mercury","mesquite","metal","meteor","mewing","mica","midi","midnight","mighty","mild","mildly","military","mini","miniature","mint","mirage","mire","mirror","misty","mixed","mixolydian","modern","modest","momentous","moored","morning","motley","mountain","mountainous","mousy","mud","muddled","muddy","mulberry","mutual","mysterious","narrow","natural","navy","near","neat","nebula","nebulous","necessary","neighborly","neon","nervous","nettle","nice","nickel","nifty","night","nimble","nine","ninth","noble","noiseless","nonchalant","nonstop","noon","north","northern","nostalgic","nosy","notch","nova","numerous","nutritious","oasis","observant","obsidian","obtainable","obvious","occipital","oceanic","octagonal","odd","oil","olive","olivine","omniscient","onyx","opalescent","opaque","open","opposite","orange","orchid","orderly","ordinary","organic","organized","ossified","outgoing","outrageous","outstanding","oval","overjoyed","oxidized","pacific","paint","painted","pale","palm","panoramic","paper","parallel","past","pastoral","patch","pattern","peaceful","peach","pear","peat","pebble","pentagonal","pepper","peppered","peppermint","perfect","peridot","periodic","periwinkle","perpetual","persistent","petal","petalite","petite","pewter","phantom","phase","phrygian","picayune","pickle","pickled","picturesque","pie","pine","pineapple","pinnate","pinto","piquant","pitch","placid","plaid","plain","planet","plant","plastic","platinum","plausible","playful","pleasant","plucky","plum","plume","plural","pointed","pointy","poised","polar","polarized","polished","polite","political","pollen","polydactyl","polyester","pond","pool","popular","positive","possible","potent","pouncing","power","powerful","prairie","precious","pretty","pricey","prickle","prickly","principled","prism","private","probable","productive","profuse","prong","protective","proud","proximal","psychedelic","puddle","pumped","purple","purrfect","purring","pushy","puzzle","puzzled","puzzling","pyrite","quaint","quark","quartz","quasar","quick","quickest","quiet","quill","quilled","quilt","quilted","quintessential","quirky","quiver","quixotic","radial","radical","rain","rainbow","rainy","rambunctious","rapid","rare","raspy","rattle","real","rebel","recent","receptive","recondite","rectangular","reflective","regal","regular","reinvented","reliable","relic","relieved","remarkable","reminiscent","repeated","resilient","resisted","resolute","resonant","respected","responsible","rhetorical","rhinestone","ribbon","rich","rift","right","righteous","rightful","rigorous","ring","ringed","ripe","ripple","ritzy","river","road","roan","roasted","robust","rocky","rogue","romantic","roomy","rose","rotated","rotating","rough","round","rounded","royal","rumbling","rune","rural","rust","rustic","saber","sable","safe","sage","salt","salty","same","sand","sandy","sapphire","sassy","satin","satisfying","savory","scalloped","scandalous","scarce","scarlet","scented","scientific","scintillating","scratch","scratched","scrawny","screeching","scythe","season","seasoned","second","secret","secretive","sedate","seed","seemly","seen","selective","separate","separated","sepia","sequoia","serene","serious","shade","shaded","shadow","shadowed","shared","sharp","sheer","shell","shelled","shimmer","shimmering","shine","shining","shiny","shocking","shore","short","shorthaired","showy","shrouded","shrub","shy","sideways","silent","silicon","silk","silken","silky","silly","silver","similar","simple","simplistic","sincere","single","six","sixth","skillful","skinny","skitter","sky","slash","sleepy","sleet","slender","slime","slimy","slow","sly","small","smart","smiling","smoggy","smooth","snapdragon","sneaky","snow","snowy","soapy","soft","solar","solid","solstice","somber","sophisticated","sordid","sore","sour","south","southern","spangle","spangled","spark","sparkling","sparkly","special","speckle","speckled","spectacled","spectacular","spectrum","sphenoid","spice","spiced","spicy","spiffy","spiky","spiny","spiral","spiritual","splashy","splendid","sponge","spot","spotless","spotted","spotty","spring","sprinkle","sprout","spurious","square","standing","star","statuesque","steadfast","steady","stealth","steel","steep","stellar","sticky","stingy","stirring","stitch","stone","storm","stormy","stream","strengthened","stripe","striped","strong","stump","stupendous","sturdy","stylish","suave","subdued","subsequent","substantial","successful","succinct","succulent","sudden","sudsy","sugar","sugared","sugary","sulfuric","sulky","summer","sumptuous","sun","sunny","sunrise","sunset","super","superb","superficial","supreme","surf","sustaining","swamp","swanky","sweet","sweltering","swift","synonymous","tabby","talented","tall","tame","tan","tangible","tangy","tar","tarry","tartan","tasteful","tasty","tattered","teal","telling","temporal","ten","tender","terrific","tested","thankful","therapeutic","thin","thinkable","third","thirsty","thoracic","thorn","thoughtful","thread","three","thrilling","thunder","thundering","tidal","tide","tidy","time","tin","tinted","tiny","titanium","toothsome","topaz","torch","torpid","tortoiseshell","tough","tourmaline","towering","trail","tranquil","translucent","transparent","trapezoidal","traveling","treasure","tree","tremendous","triangular","tricky","tricolor","trite","tropical","troubled","trusted","trusting","truth","truthful","tulip","tundra","tungsten","turquoise","twilight","twisty","typhoon","typical","ubiquitous","ultra","uncovered","understood","unequaled","uneven","unexpected","unique","universal","unleashed","unmarred","unruly","unusual","upbeat","useful","utopian","uttermost","vagabond","valiant","valley","valuable","vanilla","various","vast","vaulted","veil","veiled","verbena","verbose","verdant","versed","victorious","vigorous","vine","vintage","violet","viridian","visual","vivacious","vivid","volcano","voltaic","voracious","waiting","wakeful","walnut","wandering","warm","warp","wary","water","watery","wave","wax","wealthy","well","west","western","wheat","whimsical","whip","whispering","wholesale","wide","wiggly","wild","wind","winter","wirehaired","wiry","wise","wistful","witty","wobbly","wonderful","wood","wooded","wooden","wool","woolen","woolly","workable","working","worried","wry","yellow","yielding","young","youthful","zany","zealous","zenith","zest","zesty","zigzag","zinc","zippy","zircon"]');
const teams = ["aerie", "alliance", "assembly", "bale", "band", "barrel", "batch", "bed", "bevy", "board", "brood", "building", "bunch", "business", "cackle", "camp", "cast", "catch", "cauldron", "charm", "chattering", "chime", "choir", "circle", "clan", "class", "clattering", "cloud", "clowder", "club", "cluster", "coalition", "colony", "combination", "committee", "company", "conglomerate", "congregation", "congress", "conspiracy", "convocation", "corporation", "coven", "crew", "culture", "dazzle", "descent", "doctrine", "drift", "drove", "exaltation", "faction", "faculty", "family", "flight", "fling", "flock", "flush", "gaggle", "galaxy", "game", "gathering", "gobble", "group", "gulp", "herd", "hive", "intrigue", "jury", "kettle", "kit", "knot", "labor", "lamentation", "league", "lease", "lineup", "litter", "murmuration", "mustering", "nest", "orchestra", "order", "organization", "ostentation", "outfit", "pace", "pack", "pandemonium", "parade", "parliament", "party", "phalanx", "piteousness", "pod", "posse", "prickle", "pride", "quiver", "raffle", "romp", "rookery", "sawt", "school", "scoop", "scream", "scury", "sedge", "sentence", "shadow", "shiver", "shrewdness", "sleuth", "sloth", "squad", "staff", "suit", "swarm", "team", "thunder", "tower", "troop", "troupe", "trust", "unit", "venue", "whisp", "whiting", "wisdom", "zeal"];
const require$$0 = {
  collections,
  objects,
  predicates,
  teams
};
var hasRequiredFriendlyWords;
function requireFriendlyWords() {
  if (hasRequiredFriendlyWords) return friendlyWords$1;
  hasRequiredFriendlyWords = 1;
  const data = require$$0;
  friendlyWords$1.objects = data.objects;
  friendlyWords$1.predicates = data.predicates;
  friendlyWords$1.teams = data.teams;
  friendlyWords$1.collections = data.collections;
  return friendlyWords$1;
}
var friendlyWordsExports = requireFriendlyWords();
const friendlyWords = /* @__PURE__ */ getDefaultExportFromCjs(friendlyWordsExports);
const DEFAULT_BRANCH_SEGMENT_MAX_LENGTH = 50;
const DEFAULT_BRANCH_NAME_MAX_LENGTH = 100;
function sanitizeSegment(text, maxLength = DEFAULT_BRANCH_SEGMENT_MAX_LENGTH, { preserveCase = false } = {}) {
  const normalized = preserveCase ? text : text.toLowerCase();
  const allowedCharacters = preserveCase ? /[^a-zA-Z0-9._+@-]/g : /[^a-z0-9._+@-]/g;
  return normalized.trim().replace(/\s+/g, "-").replace(allowedCharacters, "").replace(/\.{2,}/g, ".").replace(/@\{/g, "@").replace(/-+/g, "-").replace(/^[-.]|[-.]+$/g, "").replace(/\.lock$/g, "").slice(0, maxLength);
}
function sanitizeAuthorPrefix(name) {
  return sanitizeSegment(name, DEFAULT_BRANCH_SEGMENT_MAX_LENGTH, {
    preserveCase: true
  });
}
function sanitizeBranchName(name, {
  preserveFirstSegmentCase = false,
  preserveCase = false
} = {}) {
  return name.split("/").map(
    (segment, index) => sanitizeSegment(segment, DEFAULT_BRANCH_SEGMENT_MAX_LENGTH, {
      preserveCase: preserveCase || preserveFirstSegmentCase && index === 0
    })
  ).filter(Boolean).join("/");
}
function truncateBranchName(branchName, maxLength = DEFAULT_BRANCH_NAME_MAX_LENGTH) {
  return branchName.slice(0, maxLength).replace(/\/+$/g, "");
}
function sanitizeBranchNameWithMaxLength(name, maxLength = DEFAULT_BRANCH_NAME_MAX_LENGTH, options) {
  return truncateBranchName(sanitizeBranchName(name, options), maxLength);
}
function deduplicateBranchName(candidate, existingBranchNames) {
  const normalizedCandidate = candidate.trim();
  if (!normalizedCandidate) {
    return normalizedCandidate;
  }
  const existingSet = new Set(existingBranchNames.map((b) => b.toLowerCase()));
  if (!existingSet.has(normalizedCandidate.toLowerCase())) {
    return normalizedCandidate;
  }
  const segments = normalizedCandidate.split("/");
  const lastSegment = segments.at(-1) ?? normalizedCandidate;
  const prefix = segments.slice(0, -1).join("/");
  const strippedBase = lastSegment.replace(/-\d+$/, "");
  const baseSegment = strippedBase || lastSegment;
  const append2 = (suffix) => prefix ? `${prefix}/${baseSegment}-${suffix}` : `${baseSegment}-${suffix}`;
  for (let suffix = 1; suffix < 1e4; suffix++) {
    const deduplicated = append2(suffix);
    if (!existingSet.has(deduplicated.toLowerCase())) {
      return deduplicated;
    }
  }
  return prefix ? `${prefix}/${baseSegment}-${Date.now()}` : `${baseSegment}-${Date.now()}`;
}
function getErrorText(error2) {
  if (error2 instanceof Error) {
    const parts = [error2.message];
    const gitError = error2;
    if (typeof gitError.stderr === "string" && gitError.stderr.trim()) {
      parts.push(gitError.stderr);
    }
    if (typeof gitError.stdout === "string" && gitError.stdout.trim()) {
      parts.push(gitError.stdout);
    }
    return parts.join("\n");
  }
  return String(error2);
}
function isPostCheckoutHookFailure(error2) {
  const text = getErrorText(error2).toLowerCase();
  if (!text.includes("post-checkout")) {
    return false;
  }
  return text.includes("hook") || text.includes("husky") || text.includes("command not found");
}
async function runWithPostCheckoutHookTolerance({
  run,
  didSucceed,
  context
}) {
  try {
    await run();
  } catch (error2) {
    if (!isPostCheckoutHookFailure(error2)) {
      throw error2;
    }
    let succeeded = false;
    try {
      succeeded = await didSucceed();
    } catch {
      succeeded = false;
    }
    if (!succeeded) {
      throw error2;
    }
    const message = getErrorText(error2);
    console.warn(
      `[git] ${context} but post-checkout hook failed (non-fatal): ${message}`
    );
  }
}
var dist$1 = {};
var src = {};
var hasRequiredSrc;
function requireSrc() {
  if (hasRequiredSrc) return src;
  hasRequiredSrc = 1;
  (function(exports$1) {
    var __importDefault = src && src.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports$1, "__esModule", { value: true });
    const fs_1 = require$$0$1;
    const debug_1 = __importDefault(requireSrc$1());
    const log = debug_1.default("@kwsites/file-exists");
    function check(path, isFile, isDirectory) {
      log(`checking %s`, path);
      try {
        const stat = fs_1.statSync(path);
        if (stat.isFile() && isFile) {
          log(`[OK] path represents a file`);
          return true;
        }
        if (stat.isDirectory() && isDirectory) {
          log(`[OK] path represents a directory`);
          return true;
        }
        log(`[FAIL] path represents something other than a file or directory`);
        return false;
      } catch (e) {
        if (e.code === "ENOENT") {
          log(`[FAIL] path is not accessible: %o`, e);
          return false;
        }
        log(`[FATAL] %o`, e);
        throw e;
      }
    }
    function exists(path, type = exports$1.READABLE) {
      return check(path, (type & exports$1.FILE) > 0, (type & exports$1.FOLDER) > 0);
    }
    exports$1.exists = exists;
    exports$1.FILE = 1;
    exports$1.FOLDER = 2;
    exports$1.READABLE = exports$1.FILE + exports$1.FOLDER;
  })(src);
  return src;
}
var hasRequiredDist$1;
function requireDist$1() {
  if (hasRequiredDist$1) return dist$1;
  hasRequiredDist$1 = 1;
  (function(exports$1) {
    function __export2(m) {
      for (var p in m) if (!exports$1.hasOwnProperty(p)) exports$1[p] = m[p];
    }
    Object.defineProperty(exports$1, "__esModule", { value: true });
    __export2(requireSrc());
  })(dist$1);
  return dist$1;
}
var distExports$1 = requireDist$1();
var srcExports = requireSrc$1();
const debug = /* @__PURE__ */ getDefaultExportFromCjs(srcExports);
var dist = {};
var hasRequiredDist;
function requireDist() {
  if (hasRequiredDist) return dist;
  hasRequiredDist = 1;
  Object.defineProperty(dist, "__esModule", { value: true });
  dist.createDeferred = dist.deferred = void 0;
  function deferred() {
    let done;
    let fail;
    let status = "pending";
    const promise2 = new Promise((_done, _fail) => {
      done = _done;
      fail = _fail;
    });
    return {
      promise: promise2,
      done(result) {
        if (status === "pending") {
          status = "resolved";
          done(result);
        }
      },
      fail(error2) {
        if (status === "pending") {
          status = "rejected";
          fail(error2);
        }
      },
      get fulfilled() {
        return status !== "pending";
      },
      get status() {
        return status;
      }
    };
  }
  dist.deferred = deferred;
  dist.createDeferred = deferred;
  dist.default = deferred;
  return dist;
}
var distExports = requireDist();
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
function pathspec(...paths) {
  const key = new String(paths);
  cache.set(key, paths);
  return key;
}
function isPathSpec(path) {
  return path instanceof String && cache.has(path);
}
function toPaths(pathSpec) {
  return cache.get(pathSpec) || [];
}
var cache;
var init_pathspec = __esm({
  "src/lib/args/pathspec.ts"() {
    cache = /* @__PURE__ */ new WeakMap();
  }
});
var GitError;
var init_git_error = __esm({
  "src/lib/errors/git-error.ts"() {
    GitError = class extends Error {
      constructor(task, message) {
        super(message);
        this.task = task;
        Object.setPrototypeOf(this, new.target.prototype);
      }
    };
  }
});
var GitResponseError;
var init_git_response_error = __esm({
  "src/lib/errors/git-response-error.ts"() {
    init_git_error();
    GitResponseError = class extends GitError {
      constructor(git2, message) {
        super(void 0, message || String(git2));
        this.git = git2;
      }
    };
  }
});
var TaskConfigurationError;
var init_task_configuration_error = __esm({
  "src/lib/errors/task-configuration-error.ts"() {
    init_git_error();
    TaskConfigurationError = class extends GitError {
      constructor(message) {
        super(void 0, message);
      }
    };
  }
});
function asFunction(source) {
  if (typeof source !== "function") {
    return NOOP;
  }
  return source;
}
function isUserFunction(source) {
  return typeof source === "function" && source !== NOOP;
}
function splitOn(input, char) {
  const index = input.indexOf(char);
  if (index <= 0) {
    return [input, ""];
  }
  return [input.substr(0, index), input.substr(index + 1)];
}
function first(input, offset = 0) {
  return isArrayLike(input) && input.length > offset ? input[offset] : void 0;
}
function last(input, offset = 0) {
  if (isArrayLike(input) && input.length > offset) {
    return input[input.length - 1 - offset];
  }
}
function isArrayLike(input) {
  return filterHasLength(input);
}
function toLinesWithContent(input = "", trimmed2 = true, separator = "\n") {
  return input.split(separator).reduce((output, line) => {
    const lineContent = trimmed2 ? line.trim() : line;
    if (lineContent) {
      output.push(lineContent);
    }
    return output;
  }, []);
}
function forEachLineWithContent(input, callback) {
  return toLinesWithContent(input, true).map((line) => callback(line));
}
function folderExists(path) {
  return distExports$1.exists(path, distExports$1.FOLDER);
}
function append(target, item) {
  if (Array.isArray(target)) {
    if (!target.includes(item)) {
      target.push(item);
    }
  } else {
    target.add(item);
  }
  return item;
}
function including(target, item) {
  if (Array.isArray(target) && !target.includes(item)) {
    target.push(item);
  }
  return target;
}
function remove(target, item) {
  if (Array.isArray(target)) {
    const index = target.indexOf(item);
    if (index >= 0) {
      target.splice(index, 1);
    }
  } else {
    target.delete(item);
  }
  return item;
}
function asArray(source) {
  return Array.isArray(source) ? source : [source];
}
function asCamelCase(str) {
  return str.replace(/[\s-]+(.)/g, (_all, chr) => {
    return chr.toUpperCase();
  });
}
function asStringArray(source) {
  return asArray(source).map((item) => {
    return item instanceof String ? item : String(item);
  });
}
function asNumber(source, onNaN = 0) {
  if (source == null) {
    return onNaN;
  }
  const num = parseInt(source, 10);
  return Number.isNaN(num) ? onNaN : num;
}
function prefixedArray(input, prefix) {
  const output = [];
  for (let i = 0, max = input.length; i < max; i++) {
    output.push(prefix, input[i]);
  }
  return output;
}
function bufferToString(input) {
  return (Array.isArray(input) ? Buffer$1.concat(input) : input).toString("utf-8");
}
function pick(source, properties) {
  const out = {};
  properties.forEach((key) => {
    if (source[key] !== void 0) {
      out[key] = source[key];
    }
  });
  return out;
}
function delay(duration = 0) {
  return new Promise((done) => setTimeout(done, duration));
}
function orVoid(input) {
  if (input === false) {
    return void 0;
  }
  return input;
}
var NULL, NOOP, objectToString;
var init_util = __esm({
  "src/lib/utils/util.ts"() {
    init_argument_filters();
    NULL = "\0";
    NOOP = () => {
    };
    objectToString = Object.prototype.toString.call.bind(Object.prototype.toString);
  }
});
function filterType(input, filter, def) {
  if (filter(input)) {
    return input;
  }
  return arguments.length > 2 ? def : void 0;
}
function filterPrimitives(input, omit) {
  const type = isPathSpec(input) ? "string" : typeof input;
  return /number|string|boolean/.test(type) && (!omit || !omit.includes(type));
}
function filterPlainObject(input) {
  return !!input && objectToString(input) === "[object Object]";
}
function filterFunction(input) {
  return typeof input === "function";
}
var filterArray, filterNumber, filterString, filterStringOrStringArray, filterHasLength;
var init_argument_filters = __esm({
  "src/lib/utils/argument-filters.ts"() {
    init_pathspec();
    init_util();
    filterArray = (input) => {
      return Array.isArray(input);
    };
    filterNumber = (input) => {
      return typeof input === "number";
    };
    filterString = (input) => {
      return typeof input === "string" || isPathSpec(input);
    };
    filterStringOrStringArray = (input) => {
      return filterString(input) || Array.isArray(input) && input.every(filterString);
    };
    filterHasLength = (input) => {
      if (input == null || "number|boolean|function".includes(typeof input)) {
        return false;
      }
      return typeof input.length === "number";
    };
  }
});
var ExitCodes;
var init_exit_codes = __esm({
  "src/lib/utils/exit-codes.ts"() {
    ExitCodes = /* @__PURE__ */ ((ExitCodes2) => {
      ExitCodes2[ExitCodes2["SUCCESS"] = 0] = "SUCCESS";
      ExitCodes2[ExitCodes2["ERROR"] = 1] = "ERROR";
      ExitCodes2[ExitCodes2["NOT_FOUND"] = -2] = "NOT_FOUND";
      ExitCodes2[ExitCodes2["UNCLEAN"] = 128] = "UNCLEAN";
      return ExitCodes2;
    })(ExitCodes || {});
  }
});
var GitOutputStreams;
var init_git_output_streams = __esm({
  "src/lib/utils/git-output-streams.ts"() {
    GitOutputStreams = class _GitOutputStreams {
      constructor(stdOut, stdErr) {
        this.stdOut = stdOut;
        this.stdErr = stdErr;
      }
      asStrings() {
        return new _GitOutputStreams(this.stdOut.toString("utf8"), this.stdErr.toString("utf8"));
      }
    };
  }
});
function useMatchesDefault() {
  throw new Error(`LineParser:useMatches not implemented`);
}
var LineParser, RemoteLineParser;
var init_line_parser = __esm({
  "src/lib/utils/line-parser.ts"() {
    LineParser = class {
      constructor(regExp, useMatches) {
        this.matches = [];
        this.useMatches = useMatchesDefault;
        this.parse = (line, target) => {
          this.resetMatches();
          if (!this._regExp.every((reg, index) => this.addMatch(reg, index, line(index)))) {
            return false;
          }
          return this.useMatches(target, this.prepareMatches()) !== false;
        };
        this._regExp = Array.isArray(regExp) ? regExp : [regExp];
        if (useMatches) {
          this.useMatches = useMatches;
        }
      }
      resetMatches() {
        this.matches.length = 0;
      }
      prepareMatches() {
        return this.matches;
      }
      addMatch(reg, index, line) {
        const matched = line && reg.exec(line);
        if (matched) {
          this.pushMatch(index, matched);
        }
        return !!matched;
      }
      pushMatch(_index, matched) {
        this.matches.push(...matched.slice(1));
      }
    };
    RemoteLineParser = class extends LineParser {
      addMatch(reg, index, line) {
        return /^remote:\s/.test(String(line)) && super.addMatch(reg, index, line);
      }
      pushMatch(index, matched) {
        if (index > 0 || matched.length > 1) {
          super.pushMatch(index, matched);
        }
      }
    };
  }
});
function createInstanceConfig(...options) {
  const baseDir = process.cwd();
  const config = Object.assign(
    { baseDir, ...defaultOptions },
    ...options.filter((o) => typeof o === "object" && o)
  );
  config.baseDir = config.baseDir || baseDir;
  config.trimmed = config.trimmed === true;
  return config;
}
var defaultOptions;
var init_simple_git_options = __esm({
  "src/lib/utils/simple-git-options.ts"() {
    defaultOptions = {
      binary: "git",
      maxConcurrentProcesses: 5,
      config: [],
      trimmed: false
    };
  }
});
function appendTaskOptions(options, commands = []) {
  if (!filterPlainObject(options)) {
    return commands;
  }
  return Object.keys(options).reduce((commands2, key) => {
    const value = options[key];
    if (isPathSpec(value)) {
      commands2.push(value);
    } else if (filterPrimitives(value, ["boolean"])) {
      commands2.push(key + "=" + value);
    } else if (Array.isArray(value)) {
      for (const v of value) {
        if (!filterPrimitives(v, ["string", "number"])) {
          commands2.push(key + "=" + v);
        }
      }
    } else {
      commands2.push(key);
    }
    return commands2;
  }, commands);
}
function getTrailingOptions(args2, initialPrimitive = 0, objectOnly = false) {
  const command2 = [];
  for (let i = 0, max = initialPrimitive < 0 ? args2.length : initialPrimitive; i < max; i++) {
    if ("string|number".includes(typeof args2[i])) {
      command2.push(String(args2[i]));
    }
  }
  appendTaskOptions(trailingOptionsArgument(args2), command2);
  if (!objectOnly) {
    command2.push(...trailingArrayArgument(args2));
  }
  return command2;
}
function trailingArrayArgument(args2) {
  const hasTrailingCallback = typeof last(args2) === "function";
  return asStringArray(filterType(last(args2, hasTrailingCallback ? 1 : 0), filterArray, []));
}
function trailingOptionsArgument(args2) {
  const hasTrailingCallback = filterFunction(last(args2));
  return filterType(last(args2, hasTrailingCallback ? 1 : 0), filterPlainObject);
}
function trailingFunctionArgument(args2, includeNoop = true) {
  const callback = asFunction(last(args2));
  return includeNoop || isUserFunction(callback) ? callback : void 0;
}
var init_task_options = __esm({
  "src/lib/utils/task-options.ts"() {
    init_argument_filters();
    init_util();
    init_pathspec();
  }
});
function callTaskParser(parser4, streams) {
  return parser4(streams.stdOut, streams.stdErr);
}
function parseStringResponse(result, parsers12, texts, trim = true) {
  asArray(texts).forEach((text) => {
    for (let lines = toLinesWithContent(text, trim), i = 0, max = lines.length; i < max; i++) {
      const line = (offset = 0) => {
        if (i + offset >= max) {
          return;
        }
        return lines[i + offset];
      };
      parsers12.some(({ parse }) => parse(line, result));
    }
  });
  return result;
}
var init_task_parser = __esm({
  "src/lib/utils/task-parser.ts"() {
    init_util();
  }
});
var utils_exports = {};
__export(utils_exports, {
  ExitCodes: () => ExitCodes,
  GitOutputStreams: () => GitOutputStreams,
  LineParser: () => LineParser,
  NOOP: () => NOOP,
  NULL: () => NULL,
  RemoteLineParser: () => RemoteLineParser,
  append: () => append,
  appendTaskOptions: () => appendTaskOptions,
  asArray: () => asArray,
  asCamelCase: () => asCamelCase,
  asFunction: () => asFunction,
  asNumber: () => asNumber,
  asStringArray: () => asStringArray,
  bufferToString: () => bufferToString,
  callTaskParser: () => callTaskParser,
  createInstanceConfig: () => createInstanceConfig,
  delay: () => delay,
  filterArray: () => filterArray,
  filterFunction: () => filterFunction,
  filterHasLength: () => filterHasLength,
  filterNumber: () => filterNumber,
  filterPlainObject: () => filterPlainObject,
  filterPrimitives: () => filterPrimitives,
  filterString: () => filterString,
  filterStringOrStringArray: () => filterStringOrStringArray,
  filterType: () => filterType,
  first: () => first,
  folderExists: () => folderExists,
  forEachLineWithContent: () => forEachLineWithContent,
  getTrailingOptions: () => getTrailingOptions,
  including: () => including,
  isUserFunction: () => isUserFunction,
  last: () => last,
  objectToString: () => objectToString,
  orVoid: () => orVoid,
  parseStringResponse: () => parseStringResponse,
  pick: () => pick,
  prefixedArray: () => prefixedArray,
  remove: () => remove,
  splitOn: () => splitOn,
  toLinesWithContent: () => toLinesWithContent,
  trailingFunctionArgument: () => trailingFunctionArgument,
  trailingOptionsArgument: () => trailingOptionsArgument
});
var init_utils = __esm({
  "src/lib/utils/index.ts"() {
    init_argument_filters();
    init_exit_codes();
    init_git_output_streams();
    init_line_parser();
    init_simple_git_options();
    init_task_options();
    init_task_parser();
    init_util();
  }
});
var check_is_repo_exports = {};
__export(check_is_repo_exports, {
  CheckRepoActions: () => CheckRepoActions,
  checkIsBareRepoTask: () => checkIsBareRepoTask,
  checkIsRepoRootTask: () => checkIsRepoRootTask,
  checkIsRepoTask: () => checkIsRepoTask
});
function checkIsRepoTask(action) {
  switch (action) {
    case "bare":
      return checkIsBareRepoTask();
    case "root":
      return checkIsRepoRootTask();
  }
  const commands = ["rev-parse", "--is-inside-work-tree"];
  return {
    commands,
    format: "utf-8",
    onError,
    parser
  };
}
function checkIsRepoRootTask() {
  const commands = ["rev-parse", "--git-dir"];
  return {
    commands,
    format: "utf-8",
    onError,
    parser(path) {
      return /^\.(git)?$/.test(path.trim());
    }
  };
}
function checkIsBareRepoTask() {
  const commands = ["rev-parse", "--is-bare-repository"];
  return {
    commands,
    format: "utf-8",
    onError,
    parser
  };
}
function isNotRepoMessage(error2) {
  return /(Not a git repository|Kein Git-Repository)/i.test(String(error2));
}
var CheckRepoActions, onError, parser;
var init_check_is_repo = __esm({
  "src/lib/tasks/check-is-repo.ts"() {
    init_utils();
    CheckRepoActions = /* @__PURE__ */ ((CheckRepoActions2) => {
      CheckRepoActions2["BARE"] = "bare";
      CheckRepoActions2["IN_TREE"] = "tree";
      CheckRepoActions2["IS_REPO_ROOT"] = "root";
      return CheckRepoActions2;
    })(CheckRepoActions || {});
    onError = ({ exitCode }, error2, done, fail) => {
      if (exitCode === 128 && isNotRepoMessage(error2)) {
        return done(Buffer.from("false"));
      }
      fail(error2);
    };
    parser = (text) => {
      return text.trim() === "true";
    };
  }
});
function cleanSummaryParser(dryRun, text) {
  const summary = new CleanResponse(dryRun);
  const regexp = dryRun ? dryRunRemovalRegexp : removalRegexp;
  toLinesWithContent(text).forEach((line) => {
    const removed = line.replace(regexp, "");
    summary.paths.push(removed);
    (isFolderRegexp.test(removed) ? summary.folders : summary.files).push(removed);
  });
  return summary;
}
var CleanResponse, removalRegexp, dryRunRemovalRegexp, isFolderRegexp;
var init_CleanSummary = __esm({
  "src/lib/responses/CleanSummary.ts"() {
    init_utils();
    CleanResponse = class {
      constructor(dryRun) {
        this.dryRun = dryRun;
        this.paths = [];
        this.files = [];
        this.folders = [];
      }
    };
    removalRegexp = /^[a-z]+\s*/i;
    dryRunRemovalRegexp = /^[a-z]+\s+[a-z]+\s*/i;
    isFolderRegexp = /\/$/;
  }
});
var task_exports = {};
__export(task_exports, {
  EMPTY_COMMANDS: () => EMPTY_COMMANDS,
  adhocExecTask: () => adhocExecTask,
  configurationErrorTask: () => configurationErrorTask,
  isBufferTask: () => isBufferTask,
  isEmptyTask: () => isEmptyTask,
  straightThroughBufferTask: () => straightThroughBufferTask,
  straightThroughStringTask: () => straightThroughStringTask
});
function adhocExecTask(parser4) {
  return {
    commands: EMPTY_COMMANDS,
    format: "empty",
    parser: parser4
  };
}
function configurationErrorTask(error2) {
  return {
    commands: EMPTY_COMMANDS,
    format: "empty",
    parser() {
      throw typeof error2 === "string" ? new TaskConfigurationError(error2) : error2;
    }
  };
}
function straightThroughStringTask(commands, trimmed2 = false) {
  return {
    commands,
    format: "utf-8",
    parser(text) {
      return trimmed2 ? String(text).trim() : text;
    }
  };
}
function straightThroughBufferTask(commands) {
  return {
    commands,
    format: "buffer",
    parser(buffer) {
      return buffer;
    }
  };
}
function isBufferTask(task) {
  return task.format === "buffer";
}
function isEmptyTask(task) {
  return task.format === "empty" || !task.commands.length;
}
var EMPTY_COMMANDS;
var init_task = __esm({
  "src/lib/tasks/task.ts"() {
    init_task_configuration_error();
    EMPTY_COMMANDS = [];
  }
});
var clean_exports = {};
__export(clean_exports, {
  CONFIG_ERROR_INTERACTIVE_MODE: () => CONFIG_ERROR_INTERACTIVE_MODE,
  CONFIG_ERROR_MODE_REQUIRED: () => CONFIG_ERROR_MODE_REQUIRED,
  CONFIG_ERROR_UNKNOWN_OPTION: () => CONFIG_ERROR_UNKNOWN_OPTION,
  CleanOptions: () => CleanOptions,
  cleanTask: () => cleanTask,
  cleanWithOptionsTask: () => cleanWithOptionsTask,
  isCleanOptionsArray: () => isCleanOptionsArray
});
function cleanWithOptionsTask(mode2, customArgs) {
  const { cleanMode, options, valid } = getCleanOptions(mode2);
  if (!cleanMode) {
    return configurationErrorTask(CONFIG_ERROR_MODE_REQUIRED);
  }
  if (!valid.options) {
    return configurationErrorTask(CONFIG_ERROR_UNKNOWN_OPTION + JSON.stringify(mode2));
  }
  options.push(...customArgs);
  if (options.some(isInteractiveMode)) {
    return configurationErrorTask(CONFIG_ERROR_INTERACTIVE_MODE);
  }
  return cleanTask(cleanMode, options);
}
function cleanTask(mode2, customArgs) {
  const commands = ["clean", `-${mode2}`, ...customArgs];
  return {
    commands,
    format: "utf-8",
    parser(text) {
      return cleanSummaryParser(mode2 === "n", text);
    }
  };
}
function isCleanOptionsArray(input) {
  return Array.isArray(input) && input.every((test) => CleanOptionValues.has(test));
}
function getCleanOptions(input) {
  let cleanMode;
  let options = [];
  let valid = { cleanMode: false, options: true };
  input.replace(/[^a-z]i/g, "").split("").forEach((char) => {
    if (isCleanMode(char)) {
      cleanMode = char;
      valid.cleanMode = true;
    } else {
      valid.options = valid.options && isKnownOption(options[options.length] = `-${char}`);
    }
  });
  return {
    cleanMode,
    options,
    valid
  };
}
function isCleanMode(cleanMode) {
  return cleanMode === "f" || cleanMode === "n";
}
function isKnownOption(option) {
  return /^-[a-z]$/i.test(option) && CleanOptionValues.has(option.charAt(1));
}
function isInteractiveMode(option) {
  if (/^-[^\-]/.test(option)) {
    return option.indexOf("i") > 0;
  }
  return option === "--interactive";
}
var CONFIG_ERROR_INTERACTIVE_MODE, CONFIG_ERROR_MODE_REQUIRED, CONFIG_ERROR_UNKNOWN_OPTION, CleanOptions, CleanOptionValues;
var init_clean = __esm({
  "src/lib/tasks/clean.ts"() {
    init_CleanSummary();
    init_utils();
    init_task();
    CONFIG_ERROR_INTERACTIVE_MODE = "Git clean interactive mode is not supported";
    CONFIG_ERROR_MODE_REQUIRED = 'Git clean mode parameter ("n" or "f") is required';
    CONFIG_ERROR_UNKNOWN_OPTION = "Git clean unknown option found in: ";
    CleanOptions = /* @__PURE__ */ ((CleanOptions2) => {
      CleanOptions2["DRY_RUN"] = "n";
      CleanOptions2["FORCE"] = "f";
      CleanOptions2["IGNORED_INCLUDED"] = "x";
      CleanOptions2["IGNORED_ONLY"] = "X";
      CleanOptions2["EXCLUDING"] = "e";
      CleanOptions2["QUIET"] = "q";
      CleanOptions2["RECURSIVE"] = "d";
      return CleanOptions2;
    })(CleanOptions || {});
    CleanOptionValues = /* @__PURE__ */ new Set([
      "i",
      ...asStringArray(Object.values(CleanOptions))
    ]);
  }
});
function configListParser(text) {
  const config = new ConfigList();
  for (const item of configParser(text)) {
    config.addValue(item.file, String(item.key), item.value);
  }
  return config;
}
function configGetParser(text, key) {
  let value = null;
  const values = [];
  const scopes = /* @__PURE__ */ new Map();
  for (const item of configParser(text, key)) {
    if (item.key !== key) {
      continue;
    }
    values.push(value = item.value);
    if (!scopes.has(item.file)) {
      scopes.set(item.file, []);
    }
    scopes.get(item.file).push(value);
  }
  return {
    key,
    paths: Array.from(scopes.keys()),
    scopes,
    value,
    values
  };
}
function configFilePath(filePath) {
  return filePath.replace(/^(file):/, "");
}
function* configParser(text, requestedKey = null) {
  const lines = text.split("\0");
  for (let i = 0, max = lines.length - 1; i < max; ) {
    const file = configFilePath(lines[i++]);
    let value = lines[i++];
    let key = requestedKey;
    if (value.includes("\n")) {
      const line = splitOn(value, "\n");
      key = line[0];
      value = line[1];
    }
    yield { file, key, value };
  }
}
var ConfigList;
var init_ConfigList = __esm({
  "src/lib/responses/ConfigList.ts"() {
    init_utils();
    ConfigList = class {
      constructor() {
        this.files = [];
        this.values = /* @__PURE__ */ Object.create(null);
      }
      get all() {
        if (!this._all) {
          this._all = this.files.reduce((all, file) => {
            return Object.assign(all, this.values[file]);
          }, {});
        }
        return this._all;
      }
      addFile(file) {
        if (!(file in this.values)) {
          const latest = last(this.files);
          this.values[file] = latest ? Object.create(this.values[latest]) : {};
          this.files.push(file);
        }
        return this.values[file];
      }
      addValue(file, key, value) {
        const values = this.addFile(file);
        if (!Object.hasOwn(values, key)) {
          values[key] = value;
        } else if (Array.isArray(values[key])) {
          values[key].push(value);
        } else {
          values[key] = [values[key], value];
        }
        this._all = void 0;
      }
    };
  }
});
function asConfigScope(scope, fallback) {
  if (typeof scope === "string" && Object.hasOwn(GitConfigScope, scope)) {
    return scope;
  }
  return fallback;
}
function addConfigTask(key, value, append2, scope) {
  const commands = ["config", `--${scope}`];
  if (append2) {
    commands.push("--add");
  }
  commands.push(key, value);
  return {
    commands,
    format: "utf-8",
    parser(text) {
      return text;
    }
  };
}
function getConfigTask(key, scope) {
  const commands = ["config", "--null", "--show-origin", "--get-all", key];
  if (scope) {
    commands.splice(1, 0, `--${scope}`);
  }
  return {
    commands,
    format: "utf-8",
    parser(text) {
      return configGetParser(text, key);
    }
  };
}
function listConfigTask(scope) {
  const commands = ["config", "--list", "--show-origin", "--null"];
  if (scope) {
    commands.push(`--${scope}`);
  }
  return {
    commands,
    format: "utf-8",
    parser(text) {
      return configListParser(text);
    }
  };
}
function config_default() {
  return {
    addConfig(key, value, ...rest) {
      return this._runTask(
        addConfigTask(
          key,
          value,
          rest[0] === true,
          asConfigScope(
            rest[1],
            "local"
            /* local */
          )
        ),
        trailingFunctionArgument(arguments)
      );
    },
    getConfig(key, scope) {
      return this._runTask(
        getConfigTask(key, asConfigScope(scope, void 0)),
        trailingFunctionArgument(arguments)
      );
    },
    listConfig(...rest) {
      return this._runTask(
        listConfigTask(asConfigScope(rest[0], void 0)),
        trailingFunctionArgument(arguments)
      );
    }
  };
}
var GitConfigScope;
var init_config = __esm({
  "src/lib/tasks/config.ts"() {
    init_ConfigList();
    init_utils();
    GitConfigScope = /* @__PURE__ */ ((GitConfigScope2) => {
      GitConfigScope2["system"] = "system";
      GitConfigScope2["global"] = "global";
      GitConfigScope2["local"] = "local";
      GitConfigScope2["worktree"] = "worktree";
      return GitConfigScope2;
    })(GitConfigScope || {});
  }
});
function isDiffNameStatus(input) {
  return diffNameStatus.has(input);
}
var DiffNameStatus, diffNameStatus;
var init_diff_name_status = __esm({
  "src/lib/tasks/diff-name-status.ts"() {
    DiffNameStatus = /* @__PURE__ */ ((DiffNameStatus2) => {
      DiffNameStatus2["ADDED"] = "A";
      DiffNameStatus2["COPIED"] = "C";
      DiffNameStatus2["DELETED"] = "D";
      DiffNameStatus2["MODIFIED"] = "M";
      DiffNameStatus2["RENAMED"] = "R";
      DiffNameStatus2["CHANGED"] = "T";
      DiffNameStatus2["UNMERGED"] = "U";
      DiffNameStatus2["UNKNOWN"] = "X";
      DiffNameStatus2["BROKEN"] = "B";
      return DiffNameStatus2;
    })(DiffNameStatus || {});
    diffNameStatus = new Set(Object.values(DiffNameStatus));
  }
});
function grepQueryBuilder(...params) {
  return new GrepQuery().param(...params);
}
function parseGrep(grep) {
  const paths = /* @__PURE__ */ new Set();
  const results = {};
  forEachLineWithContent(grep, (input) => {
    const [path, line, preview] = input.split(NULL);
    paths.add(path);
    (results[path] = results[path] || []).push({
      line: asNumber(line),
      path,
      preview
    });
  });
  return {
    paths,
    results
  };
}
function grep_default() {
  return {
    grep(searchTerm) {
      const then = trailingFunctionArgument(arguments);
      const options = getTrailingOptions(arguments);
      for (const option of disallowedOptions) {
        if (options.includes(option)) {
          return this._runTask(
            configurationErrorTask(`git.grep: use of "${option}" is not supported.`),
            then
          );
        }
      }
      if (typeof searchTerm === "string") {
        searchTerm = grepQueryBuilder().param(searchTerm);
      }
      const commands = ["grep", "--null", "-n", "--full-name", ...options, ...searchTerm];
      return this._runTask(
        {
          commands,
          format: "utf-8",
          parser(stdOut) {
            return parseGrep(stdOut);
          }
        },
        then
      );
    }
  };
}
var disallowedOptions, Query, _a, GrepQuery;
var init_grep = __esm({
  "src/lib/tasks/grep.ts"() {
    init_utils();
    init_task();
    disallowedOptions = ["-h"];
    Query = Symbol("grepQuery");
    GrepQuery = class {
      constructor() {
        this[_a] = [];
      }
      *[(_a = Query, Symbol.iterator)]() {
        for (const query of this[Query]) {
          yield query;
        }
      }
      and(...and) {
        and.length && this[Query].push("--and", "(", ...prefixedArray(and, "-e"), ")");
        return this;
      }
      param(...param) {
        this[Query].push(...prefixedArray(param, "-e"));
        return this;
      }
    };
  }
});
var reset_exports = {};
__export(reset_exports, {
  ResetMode: () => ResetMode,
  getResetMode: () => getResetMode,
  resetTask: () => resetTask
});
function resetTask(mode2, customArgs) {
  const commands = ["reset"];
  if (isValidResetMode(mode2)) {
    commands.push(`--${mode2}`);
  }
  commands.push(...customArgs);
  return straightThroughStringTask(commands);
}
function getResetMode(mode2) {
  if (isValidResetMode(mode2)) {
    return mode2;
  }
  switch (typeof mode2) {
    case "string":
    case "undefined":
      return "soft";
  }
  return;
}
function isValidResetMode(mode2) {
  return typeof mode2 === "string" && validResetModes.includes(mode2);
}
var ResetMode, validResetModes;
var init_reset = __esm({
  "src/lib/tasks/reset.ts"() {
    init_utils();
    init_task();
    ResetMode = /* @__PURE__ */ ((ResetMode2) => {
      ResetMode2["MIXED"] = "mixed";
      ResetMode2["SOFT"] = "soft";
      ResetMode2["HARD"] = "hard";
      ResetMode2["MERGE"] = "merge";
      ResetMode2["KEEP"] = "keep";
      return ResetMode2;
    })(ResetMode || {});
    validResetModes = asStringArray(Object.values(ResetMode));
  }
});
function createLog() {
  return debug("simple-git");
}
function prefixedLogger(to, prefix, forward) {
  if (!prefix || !String(prefix).replace(/\s*/, "")) {
    return !forward ? to : (message, ...args2) => {
      to(message, ...args2);
      forward(message, ...args2);
    };
  }
  return (message, ...args2) => {
    to(`%s ${message}`, prefix, ...args2);
    if (forward) {
      forward(message, ...args2);
    }
  };
}
function childLoggerName(name, childDebugger, { namespace: parentNamespace }) {
  if (typeof name === "string") {
    return name;
  }
  const childNamespace = childDebugger && childDebugger.namespace || "";
  if (childNamespace.startsWith(parentNamespace)) {
    return childNamespace.substr(parentNamespace.length + 1);
  }
  return childNamespace || parentNamespace;
}
function createLogger(label, verbose, initialStep, infoDebugger = createLog()) {
  const labelPrefix = label && `[${label}]` || "";
  const spawned = [];
  const debugDebugger = typeof verbose === "string" ? infoDebugger.extend(verbose) : verbose;
  const key = childLoggerName(filterType(verbose, filterString), debugDebugger, infoDebugger);
  return step(initialStep);
  function sibling(name, initial) {
    return append(
      spawned,
      createLogger(label, key.replace(/^[^:]+/, name), initial, infoDebugger)
    );
  }
  function step(phase) {
    const stepPrefix = phase && `[${phase}]` || "";
    const debug2 = debugDebugger && prefixedLogger(debugDebugger, stepPrefix) || NOOP;
    const info = prefixedLogger(infoDebugger, `${labelPrefix} ${stepPrefix}`, debug2);
    return Object.assign(debugDebugger ? debug2 : info, {
      label,
      sibling,
      info,
      step
    });
  }
}
var init_git_logger = __esm({
  "src/lib/git-logger.ts"() {
    init_utils();
    debug.formatters.L = (value) => String(filterHasLength(value) ? value.length : "-");
    debug.formatters.B = (value) => {
      if (Buffer.isBuffer(value)) {
        return value.toString("utf8");
      }
      return objectToString(value);
    };
  }
});
var TasksPendingQueue;
var init_tasks_pending_queue = __esm({
  "src/lib/runners/tasks-pending-queue.ts"() {
    init_git_error();
    init_git_logger();
    TasksPendingQueue = class _TasksPendingQueue {
      constructor(logLabel = "GitExecutor") {
        this.logLabel = logLabel;
        this._queue = /* @__PURE__ */ new Map();
      }
      withProgress(task) {
        return this._queue.get(task);
      }
      createProgress(task) {
        const name = _TasksPendingQueue.getName(task.commands[0]);
        const logger = createLogger(this.logLabel, name);
        return {
          task,
          logger,
          name
        };
      }
      push(task) {
        const progress = this.createProgress(task);
        progress.logger("Adding task to the queue, commands = %o", task.commands);
        this._queue.set(task, progress);
        return progress;
      }
      fatal(err) {
        for (const [task, { logger }] of Array.from(this._queue.entries())) {
          if (task === err.task) {
            logger.info(`Failed %o`, err);
            logger(
              `Fatal exception, any as-yet un-started tasks run through this executor will not be attempted`
            );
          } else {
            logger.info(
              `A fatal exception occurred in a previous task, the queue has been purged: %o`,
              err.message
            );
          }
          this.complete(task);
        }
        if (this._queue.size !== 0) {
          throw new Error(`Queue size should be zero after fatal: ${this._queue.size}`);
        }
      }
      complete(task) {
        const progress = this.withProgress(task);
        if (progress) {
          this._queue.delete(task);
        }
      }
      attempt(task) {
        const progress = this.withProgress(task);
        if (!progress) {
          throw new GitError(void 0, "TasksPendingQueue: attempt called for an unknown task");
        }
        progress.logger("Starting task");
        return progress;
      }
      static getName(name = "empty") {
        return `task:${name}:${++_TasksPendingQueue.counter}`;
      }
      static {
        this.counter = 0;
      }
    };
  }
});
function pluginContext(task, commands) {
  return {
    method: first(task.commands) || "",
    commands
  };
}
function onErrorReceived(target, logger) {
  return (err) => {
    logger(`[ERROR] child process exception %o`, err);
    target.push(Buffer.from(String(err.stack), "ascii"));
  };
}
function onDataReceived(target, name, logger, output) {
  return (buffer) => {
    logger(`%s received %L bytes`, name, buffer);
    output(`%B`, buffer);
    target.push(buffer);
  };
}
var GitExecutorChain;
var init_git_executor_chain = __esm({
  "src/lib/runners/git-executor-chain.ts"() {
    init_git_error();
    init_task();
    init_utils();
    init_tasks_pending_queue();
    GitExecutorChain = class {
      constructor(_executor, _scheduler, _plugins) {
        this._executor = _executor;
        this._scheduler = _scheduler;
        this._plugins = _plugins;
        this._chain = Promise.resolve();
        this._queue = new TasksPendingQueue();
      }
      get cwd() {
        return this._cwd || this._executor.cwd;
      }
      set cwd(cwd) {
        this._cwd = cwd;
      }
      get env() {
        return this._executor.env;
      }
      get outputHandler() {
        return this._executor.outputHandler;
      }
      chain() {
        return this;
      }
      push(task) {
        this._queue.push(task);
        return this._chain = this._chain.then(() => this.attemptTask(task));
      }
      async attemptTask(task) {
        const onScheduleComplete = await this._scheduler.next();
        const onQueueComplete = () => this._queue.complete(task);
        try {
          const { logger } = this._queue.attempt(task);
          return await (isEmptyTask(task) ? this.attemptEmptyTask(task, logger) : this.attemptRemoteTask(task, logger));
        } catch (e) {
          throw this.onFatalException(task, e);
        } finally {
          onQueueComplete();
          onScheduleComplete();
        }
      }
      onFatalException(task, e) {
        const gitError = e instanceof GitError ? Object.assign(e, { task }) : new GitError(task, e && String(e));
        this._chain = Promise.resolve();
        this._queue.fatal(gitError);
        return gitError;
      }
      async attemptRemoteTask(task, logger) {
        const binary = this._plugins.exec("spawn.binary", "", pluginContext(task, task.commands));
        const args2 = this._plugins.exec(
          "spawn.args",
          [...task.commands],
          pluginContext(task, task.commands)
        );
        const raw = await this.gitResponse(
          task,
          binary,
          args2,
          this.outputHandler,
          logger.step("SPAWN")
        );
        const outputStreams = await this.handleTaskData(task, args2, raw, logger.step("HANDLE"));
        logger(`passing response to task's parser as a %s`, task.format);
        if (isBufferTask(task)) {
          return callTaskParser(task.parser, outputStreams);
        }
        return callTaskParser(task.parser, outputStreams.asStrings());
      }
      async attemptEmptyTask(task, logger) {
        logger(`empty task bypassing child process to call to task's parser`);
        return task.parser(this);
      }
      handleTaskData(task, args2, result, logger) {
        const { exitCode, rejection, stdOut, stdErr } = result;
        return new Promise((done, fail) => {
          logger(`Preparing to handle process response exitCode=%d stdOut=`, exitCode);
          const { error: error2 } = this._plugins.exec(
            "task.error",
            { error: rejection },
            {
              ...pluginContext(task, args2),
              ...result
            }
          );
          if (error2 && task.onError) {
            logger.info(`exitCode=%s handling with custom error handler`);
            return task.onError(
              result,
              error2,
              (newStdOut) => {
                logger.info(`custom error handler treated as success`);
                logger(`custom error returned a %s`, objectToString(newStdOut));
                done(
                  new GitOutputStreams(
                    Array.isArray(newStdOut) ? Buffer.concat(newStdOut) : newStdOut,
                    Buffer.concat(stdErr)
                  )
                );
              },
              fail
            );
          }
          if (error2) {
            logger.info(
              `handling as error: exitCode=%s stdErr=%s rejection=%o`,
              exitCode,
              stdErr.length,
              rejection
            );
            return fail(error2);
          }
          logger.info(`retrieving task output complete`);
          done(new GitOutputStreams(Buffer.concat(stdOut), Buffer.concat(stdErr)));
        });
      }
      async gitResponse(task, command2, args2, outputHandler, logger) {
        const outputLogger = logger.sibling("output");
        const spawnOptions = this._plugins.exec(
          "spawn.options",
          {
            cwd: this.cwd,
            env: this.env,
            windowsHide: true
          },
          pluginContext(task, task.commands)
        );
        return new Promise((done) => {
          const stdOut = [];
          const stdErr = [];
          logger.info(`%s %o`, command2, args2);
          logger("%O", spawnOptions);
          let rejection = this._beforeSpawn(task, args2);
          if (rejection) {
            return done({
              stdOut,
              stdErr,
              exitCode: 9901,
              rejection
            });
          }
          this._plugins.exec("spawn.before", void 0, {
            ...pluginContext(task, args2),
            kill(reason) {
              rejection = reason || rejection;
            }
          });
          const spawned = spawn(command2, args2, spawnOptions);
          spawned.stdout.on(
            "data",
            onDataReceived(stdOut, "stdOut", logger, outputLogger.step("stdOut"))
          );
          spawned.stderr.on(
            "data",
            onDataReceived(stdErr, "stdErr", logger, outputLogger.step("stdErr"))
          );
          spawned.on("error", onErrorReceived(stdErr, logger));
          if (outputHandler) {
            logger(`Passing child process stdOut/stdErr to custom outputHandler`);
            outputHandler(command2, spawned.stdout, spawned.stderr, [...args2]);
          }
          this._plugins.exec("spawn.after", void 0, {
            ...pluginContext(task, args2),
            spawned,
            close(exitCode, reason) {
              done({
                stdOut,
                stdErr,
                exitCode,
                rejection: rejection || reason
              });
            },
            kill(reason) {
              if (spawned.killed) {
                return;
              }
              rejection = reason;
              spawned.kill("SIGINT");
            }
          });
        });
      }
      _beforeSpawn(task, args2) {
        let rejection;
        this._plugins.exec("spawn.before", void 0, {
          ...pluginContext(task, args2),
          kill(reason) {
            rejection = reason || rejection;
          }
        });
        return rejection;
      }
    };
  }
});
var git_executor_exports = {};
__export(git_executor_exports, {
  GitExecutor: () => GitExecutor
});
var GitExecutor;
var init_git_executor = __esm({
  "src/lib/runners/git-executor.ts"() {
    init_git_executor_chain();
    GitExecutor = class {
      constructor(cwd, _scheduler, _plugins) {
        this.cwd = cwd;
        this._scheduler = _scheduler;
        this._plugins = _plugins;
        this._chain = new GitExecutorChain(this, this._scheduler, this._plugins);
      }
      chain() {
        return new GitExecutorChain(this, this._scheduler, this._plugins);
      }
      push(task) {
        return this._chain.push(task);
      }
    };
  }
});
function taskCallback(task, response, callback = NOOP) {
  const onSuccess = (data) => {
    callback(null, data);
  };
  const onError2 = (err) => {
    if (err?.task === task) {
      callback(
        err instanceof GitResponseError ? addDeprecationNoticeToError(err) : err,
        void 0
      );
    }
  };
  response.then(onSuccess, onError2);
}
function addDeprecationNoticeToError(err) {
  let log = (name) => {
    console.warn(
      `simple-git deprecation notice: accessing GitResponseError.${name} should be GitResponseError.git.${name}, this will no longer be available in version 3`
    );
    log = NOOP;
  };
  return Object.create(err, Object.getOwnPropertyNames(err.git).reduce(descriptorReducer, {}));
  function descriptorReducer(all, name) {
    if (name in err) {
      return all;
    }
    all[name] = {
      enumerable: false,
      configurable: false,
      get() {
        log(name);
        return err.git[name];
      }
    };
    return all;
  }
}
var init_task_callback = __esm({
  "src/lib/task-callback.ts"() {
    init_git_response_error();
    init_utils();
  }
});
function changeWorkingDirectoryTask(directory, root) {
  return adhocExecTask((instance) => {
    if (!folderExists(directory)) {
      throw new Error(`Git.cwd: cannot change to non-directory "${directory}"`);
    }
    return (root || instance).cwd = directory;
  });
}
var init_change_working_directory = __esm({
  "src/lib/tasks/change-working-directory.ts"() {
    init_utils();
    init_task();
  }
});
function checkoutTask(args2) {
  const commands = ["checkout", ...args2];
  if (commands[1] === "-b" && commands.includes("-B")) {
    commands[1] = remove(commands, "-B");
  }
  return straightThroughStringTask(commands);
}
function checkout_default() {
  return {
    checkout() {
      return this._runTask(
        checkoutTask(getTrailingOptions(arguments, 1)),
        trailingFunctionArgument(arguments)
      );
    },
    checkoutBranch(branchName, startPoint) {
      return this._runTask(
        checkoutTask(["-b", branchName, startPoint, ...getTrailingOptions(arguments)]),
        trailingFunctionArgument(arguments)
      );
    },
    checkoutLocalBranch(branchName) {
      return this._runTask(
        checkoutTask(["-b", branchName, ...getTrailingOptions(arguments)]),
        trailingFunctionArgument(arguments)
      );
    }
  };
}
var init_checkout = __esm({
  "src/lib/tasks/checkout.ts"() {
    init_utils();
    init_task();
  }
});
function countObjectsResponse() {
  return {
    count: 0,
    garbage: 0,
    inPack: 0,
    packs: 0,
    prunePackable: 0,
    size: 0,
    sizeGarbage: 0,
    sizePack: 0
  };
}
function count_objects_default() {
  return {
    countObjects() {
      return this._runTask({
        commands: ["count-objects", "--verbose"],
        format: "utf-8",
        parser(stdOut) {
          return parseStringResponse(countObjectsResponse(), [parser2], stdOut);
        }
      });
    }
  };
}
var parser2;
var init_count_objects = __esm({
  "src/lib/tasks/count-objects.ts"() {
    init_utils();
    parser2 = new LineParser(
      /([a-z-]+): (\d+)$/,
      (result, [key, value]) => {
        const property = asCamelCase(key);
        if (Object.hasOwn(result, property)) {
          result[property] = asNumber(value);
        }
      }
    );
  }
});
function parseCommitResult(stdOut) {
  const result = {
    author: null,
    branch: "",
    commit: "",
    root: false,
    summary: {
      changes: 0,
      insertions: 0,
      deletions: 0
    }
  };
  return parseStringResponse(result, parsers, stdOut);
}
var parsers;
var init_parse_commit = __esm({
  "src/lib/parsers/parse-commit.ts"() {
    init_utils();
    parsers = [
      new LineParser(/^\[([^\s]+)( \([^)]+\))? ([^\]]+)/, (result, [branch, root, commit]) => {
        result.branch = branch;
        result.commit = commit;
        result.root = !!root;
      }),
      new LineParser(/\s*Author:\s(.+)/i, (result, [author]) => {
        const parts = author.split("<");
        const email = parts.pop();
        if (!email || !email.includes("@")) {
          return;
        }
        result.author = {
          email: email.substr(0, email.length - 1),
          name: parts.join("<").trim()
        };
      }),
      new LineParser(
        /(\d+)[^,]*(?:,\s*(\d+)[^,]*)(?:,\s*(\d+))/g,
        (result, [changes, insertions, deletions]) => {
          result.summary.changes = parseInt(changes, 10) || 0;
          result.summary.insertions = parseInt(insertions, 10) || 0;
          result.summary.deletions = parseInt(deletions, 10) || 0;
        }
      ),
      new LineParser(
        /^(\d+)[^,]*(?:,\s*(\d+)[^(]+\(([+-]))?/,
        (result, [changes, lines, direction]) => {
          result.summary.changes = parseInt(changes, 10) || 0;
          const count = parseInt(lines, 10) || 0;
          if (direction === "-") {
            result.summary.deletions = count;
          } else if (direction === "+") {
            result.summary.insertions = count;
          }
        }
      )
    ];
  }
});
function commitTask(message, files, customArgs) {
  const commands = [
    "-c",
    "core.abbrev=40",
    "commit",
    ...prefixedArray(message, "-m"),
    ...files,
    ...customArgs
  ];
  return {
    commands,
    format: "utf-8",
    parser: parseCommitResult
  };
}
function commit_default() {
  return {
    commit(message, ...rest) {
      const next = trailingFunctionArgument(arguments);
      const task = rejectDeprecatedSignatures(message) || commitTask(
        asArray(message),
        asArray(filterType(rest[0], filterStringOrStringArray, [])),
        [
          ...asStringArray(filterType(rest[1], filterArray, [])),
          ...getTrailingOptions(arguments, 0, true)
        ]
      );
      return this._runTask(task, next);
    }
  };
  function rejectDeprecatedSignatures(message) {
    return !filterStringOrStringArray(message) && configurationErrorTask(
      `git.commit: requires the commit message to be supplied as a string/string[]`
    );
  }
}
var init_commit = __esm({
  "src/lib/tasks/commit.ts"() {
    init_parse_commit();
    init_utils();
    init_task();
  }
});
function first_commit_default() {
  return {
    firstCommit() {
      return this._runTask(
        straightThroughStringTask(["rev-list", "--max-parents=0", "HEAD"], true),
        trailingFunctionArgument(arguments)
      );
    }
  };
}
var init_first_commit = __esm({
  "src/lib/tasks/first-commit.ts"() {
    init_utils();
    init_task();
  }
});
function hashObjectTask(filePath, write) {
  const commands = ["hash-object", filePath];
  if (write) {
    commands.push("-w");
  }
  return straightThroughStringTask(commands, true);
}
var init_hash_object = __esm({
  "src/lib/tasks/hash-object.ts"() {
    init_task();
  }
});
function parseInit(bare, path, text) {
  const response = String(text).trim();
  let result;
  if (result = initResponseRegex.exec(response)) {
    return new InitSummary(bare, path, false, result[1]);
  }
  if (result = reInitResponseRegex.exec(response)) {
    return new InitSummary(bare, path, true, result[1]);
  }
  let gitDir = "";
  const tokens = response.split(" ");
  while (tokens.length) {
    const token = tokens.shift();
    if (token === "in") {
      gitDir = tokens.join(" ");
      break;
    }
  }
  return new InitSummary(bare, path, /^re/i.test(response), gitDir);
}
var InitSummary, initResponseRegex, reInitResponseRegex;
var init_InitSummary = __esm({
  "src/lib/responses/InitSummary.ts"() {
    InitSummary = class {
      constructor(bare, path, existing, gitDir) {
        this.bare = bare;
        this.path = path;
        this.existing = existing;
        this.gitDir = gitDir;
      }
    };
    initResponseRegex = /^Init.+ repository in (.+)$/;
    reInitResponseRegex = /^Rein.+ in (.+)$/;
  }
});
function hasBareCommand(command2) {
  return command2.includes(bareCommand);
}
function initTask(bare = false, path, customArgs) {
  const commands = ["init", ...customArgs];
  if (bare && !hasBareCommand(commands)) {
    commands.splice(1, 0, bareCommand);
  }
  return {
    commands,
    format: "utf-8",
    parser(text) {
      return parseInit(commands.includes("--bare"), path, text);
    }
  };
}
var bareCommand;
var init_init = __esm({
  "src/lib/tasks/init.ts"() {
    init_InitSummary();
    bareCommand = "--bare";
  }
});
function logFormatFromCommand(customArgs) {
  for (let i = 0; i < customArgs.length; i++) {
    const format = logFormatRegex.exec(customArgs[i]);
    if (format) {
      return `--${format[1]}`;
    }
  }
  return "";
}
function isLogFormat(customArg) {
  return logFormatRegex.test(customArg);
}
var logFormatRegex;
var init_log_format = __esm({
  "src/lib/args/log-format.ts"() {
    logFormatRegex = /^--(stat|numstat|name-only|name-status)(=|$)/;
  }
});
var DiffSummary;
var init_DiffSummary = __esm({
  "src/lib/responses/DiffSummary.ts"() {
    DiffSummary = class {
      constructor() {
        this.changed = 0;
        this.deletions = 0;
        this.insertions = 0;
        this.files = [];
      }
    };
  }
});
function getDiffParser(format = "") {
  const parser4 = diffSummaryParsers[format];
  return (stdOut) => parseStringResponse(new DiffSummary(), parser4, stdOut, false);
}
var statParser, numStatParser, nameOnlyParser, nameStatusParser, diffSummaryParsers;
var init_parse_diff_summary = __esm({
  "src/lib/parsers/parse-diff-summary.ts"() {
    init_log_format();
    init_DiffSummary();
    init_diff_name_status();
    init_utils();
    statParser = [
      new LineParser(
        /^(.+)\s+\|\s+(\d+)(\s+[+\-]+)?$/,
        (result, [file, changes, alterations = ""]) => {
          result.files.push({
            file: file.trim(),
            changes: asNumber(changes),
            insertions: alterations.replace(/[^+]/g, "").length,
            deletions: alterations.replace(/[^-]/g, "").length,
            binary: false
          });
        }
      ),
      new LineParser(
        /^(.+) \|\s+Bin ([0-9.]+) -> ([0-9.]+) ([a-z]+)/,
        (result, [file, before, after]) => {
          result.files.push({
            file: file.trim(),
            before: asNumber(before),
            after: asNumber(after),
            binary: true
          });
        }
      ),
      new LineParser(
        /(\d+) files? changed\s*((?:, \d+ [^,]+){0,2})/,
        (result, [changed, summary]) => {
          const inserted = /(\d+) i/.exec(summary);
          const deleted = /(\d+) d/.exec(summary);
          result.changed = asNumber(changed);
          result.insertions = asNumber(inserted?.[1]);
          result.deletions = asNumber(deleted?.[1]);
        }
      )
    ];
    numStatParser = [
      new LineParser(
        /(\d+)\t(\d+)\t(.+)$/,
        (result, [changesInsert, changesDelete, file]) => {
          const insertions = asNumber(changesInsert);
          const deletions = asNumber(changesDelete);
          result.changed++;
          result.insertions += insertions;
          result.deletions += deletions;
          result.files.push({
            file,
            changes: insertions + deletions,
            insertions,
            deletions,
            binary: false
          });
        }
      ),
      new LineParser(/-\t-\t(.+)$/, (result, [file]) => {
        result.changed++;
        result.files.push({
          file,
          after: 0,
          before: 0,
          binary: true
        });
      })
    ];
    nameOnlyParser = [
      new LineParser(/(.+)$/, (result, [file]) => {
        result.changed++;
        result.files.push({
          file,
          changes: 0,
          insertions: 0,
          deletions: 0,
          binary: false
        });
      })
    ];
    nameStatusParser = [
      new LineParser(
        /([ACDMRTUXB])([0-9]{0,3})\t(.[^\t]*)(\t(.[^\t]*))?$/,
        (result, [status, similarity, from, _to, to]) => {
          result.changed++;
          result.files.push({
            file: to ?? from,
            changes: 0,
            insertions: 0,
            deletions: 0,
            binary: false,
            status: orVoid(isDiffNameStatus(status) && status),
            from: orVoid(!!to && from !== to && from),
            similarity: asNumber(similarity)
          });
        }
      )
    ];
    diffSummaryParsers = {
      [
        ""
        /* NONE */
      ]: statParser,
      [
        "--stat"
        /* STAT */
      ]: statParser,
      [
        "--numstat"
        /* NUM_STAT */
      ]: numStatParser,
      [
        "--name-status"
        /* NAME_STATUS */
      ]: nameStatusParser,
      [
        "--name-only"
        /* NAME_ONLY */
      ]: nameOnlyParser
    };
  }
});
function lineBuilder(tokens, fields) {
  return fields.reduce(
    (line, field, index) => {
      line[field] = tokens[index] || "";
      return line;
    },
    /* @__PURE__ */ Object.create({ diff: null })
  );
}
function createListLogSummaryParser(splitter = SPLITTER, fields = defaultFieldNames, logFormat = "") {
  const parseDiffResult = getDiffParser(logFormat);
  return function(stdOut) {
    const all = toLinesWithContent(
      stdOut.trim(),
      false,
      START_BOUNDARY
    ).map(function(item) {
      const lineDetail = item.split(COMMIT_BOUNDARY);
      const listLogLine = lineBuilder(lineDetail[0].split(splitter), fields);
      if (lineDetail.length > 1 && !!lineDetail[1].trim()) {
        listLogLine.diff = parseDiffResult(lineDetail[1]);
      }
      return listLogLine;
    });
    return {
      all,
      latest: all.length && all[0] || null,
      total: all.length
    };
  };
}
var START_BOUNDARY, COMMIT_BOUNDARY, SPLITTER, defaultFieldNames;
var init_parse_list_log_summary = __esm({
  "src/lib/parsers/parse-list-log-summary.ts"() {
    init_utils();
    init_parse_diff_summary();
    init_log_format();
    START_BOUNDARY = "òòòòòò ";
    COMMIT_BOUNDARY = " òò";
    SPLITTER = " ò ";
    defaultFieldNames = ["hash", "date", "message", "refs", "author_name", "author_email"];
  }
});
var diff_exports = {};
__export(diff_exports, {
  diffSummaryTask: () => diffSummaryTask,
  validateLogFormatConfig: () => validateLogFormatConfig
});
function diffSummaryTask(customArgs) {
  let logFormat = logFormatFromCommand(customArgs);
  const commands = ["diff"];
  if (logFormat === "") {
    logFormat = "--stat";
    commands.push("--stat=4096");
  }
  commands.push(...customArgs);
  return validateLogFormatConfig(commands) || {
    commands,
    format: "utf-8",
    parser: getDiffParser(logFormat)
  };
}
function validateLogFormatConfig(customArgs) {
  const flags = customArgs.filter(isLogFormat);
  if (flags.length > 1) {
    return configurationErrorTask(
      `Summary flags are mutually exclusive - pick one of ${flags.join(",")}`
    );
  }
  if (flags.length && customArgs.includes("-z")) {
    return configurationErrorTask(
      `Summary flag ${flags} parsing is not compatible with null termination option '-z'`
    );
  }
}
var init_diff = __esm({
  "src/lib/tasks/diff.ts"() {
    init_log_format();
    init_parse_diff_summary();
    init_task();
  }
});
function prettyFormat(format, splitter) {
  const fields = [];
  const formatStr = [];
  Object.keys(format).forEach((field) => {
    fields.push(field);
    formatStr.push(String(format[field]));
  });
  return [fields, formatStr.join(splitter)];
}
function userOptions(input) {
  return Object.keys(input).reduce((out, key) => {
    if (!(key in excludeOptions)) {
      out[key] = input[key];
    }
    return out;
  }, {});
}
function parseLogOptions(opt = {}, customArgs = []) {
  const splitter = filterType(opt.splitter, filterString, SPLITTER);
  const format = filterPlainObject(opt.format) ? opt.format : {
    hash: "%H",
    date: opt.strictDate === false ? "%ai" : "%aI",
    message: "%s",
    refs: "%D",
    body: opt.multiLine ? "%B" : "%b",
    author_name: opt.mailMap !== false ? "%aN" : "%an",
    author_email: opt.mailMap !== false ? "%aE" : "%ae"
  };
  const [fields, formatStr] = prettyFormat(format, splitter);
  const suffix = [];
  const command2 = [
    `--pretty=format:${START_BOUNDARY}${formatStr}${COMMIT_BOUNDARY}`,
    ...customArgs
  ];
  const maxCount = opt.n || opt["max-count"] || opt.maxCount;
  if (maxCount) {
    command2.push(`--max-count=${maxCount}`);
  }
  if (opt.from || opt.to) {
    const rangeOperator = opt.symmetric !== false ? "..." : "..";
    suffix.push(`${opt.from || ""}${rangeOperator}${opt.to || ""}`);
  }
  if (filterString(opt.file)) {
    command2.push("--follow", pathspec(opt.file));
  }
  appendTaskOptions(userOptions(opt), command2);
  return {
    fields,
    splitter,
    commands: [...command2, ...suffix]
  };
}
function logTask(splitter, fields, customArgs) {
  const parser4 = createListLogSummaryParser(splitter, fields, logFormatFromCommand(customArgs));
  return {
    commands: ["log", ...customArgs],
    format: "utf-8",
    parser: parser4
  };
}
function log_default() {
  return {
    log(...rest) {
      const next = trailingFunctionArgument(arguments);
      const options = parseLogOptions(
        trailingOptionsArgument(arguments),
        asStringArray(filterType(arguments[0], filterArray, []))
      );
      const task = rejectDeprecatedSignatures(...rest) || validateLogFormatConfig(options.commands) || createLogTask(options);
      return this._runTask(task, next);
    }
  };
  function createLogTask(options) {
    return logTask(options.splitter, options.fields, options.commands);
  }
  function rejectDeprecatedSignatures(from, to) {
    return filterString(from) && filterString(to) && configurationErrorTask(
      `git.log(string, string) should be replaced with git.log({ from: string, to: string })`
    );
  }
}
var excludeOptions;
var init_log = __esm({
  "src/lib/tasks/log.ts"() {
    init_log_format();
    init_pathspec();
    init_parse_list_log_summary();
    init_utils();
    init_task();
    init_diff();
    excludeOptions = /* @__PURE__ */ ((excludeOptions2) => {
      excludeOptions2[excludeOptions2["--pretty"] = 0] = "--pretty";
      excludeOptions2[excludeOptions2["max-count"] = 1] = "max-count";
      excludeOptions2[excludeOptions2["maxCount"] = 2] = "maxCount";
      excludeOptions2[excludeOptions2["n"] = 3] = "n";
      excludeOptions2[excludeOptions2["file"] = 4] = "file";
      excludeOptions2[excludeOptions2["format"] = 5] = "format";
      excludeOptions2[excludeOptions2["from"] = 6] = "from";
      excludeOptions2[excludeOptions2["to"] = 7] = "to";
      excludeOptions2[excludeOptions2["splitter"] = 8] = "splitter";
      excludeOptions2[excludeOptions2["symmetric"] = 9] = "symmetric";
      excludeOptions2[excludeOptions2["mailMap"] = 10] = "mailMap";
      excludeOptions2[excludeOptions2["multiLine"] = 11] = "multiLine";
      excludeOptions2[excludeOptions2["strictDate"] = 12] = "strictDate";
      return excludeOptions2;
    })(excludeOptions || {});
  }
});
var MergeSummaryConflict, MergeSummaryDetail;
var init_MergeSummary = __esm({
  "src/lib/responses/MergeSummary.ts"() {
    MergeSummaryConflict = class {
      constructor(reason, file = null, meta) {
        this.reason = reason;
        this.file = file;
        this.meta = meta;
      }
      toString() {
        return `${this.file}:${this.reason}`;
      }
    };
    MergeSummaryDetail = class {
      constructor() {
        this.conflicts = [];
        this.merges = [];
        this.result = "success";
      }
      get failed() {
        return this.conflicts.length > 0;
      }
      get reason() {
        return this.result;
      }
      toString() {
        if (this.conflicts.length) {
          return `CONFLICTS: ${this.conflicts.join(", ")}`;
        }
        return "OK";
      }
    };
  }
});
var PullSummary, PullFailedSummary;
var init_PullSummary = __esm({
  "src/lib/responses/PullSummary.ts"() {
    PullSummary = class {
      constructor() {
        this.remoteMessages = {
          all: []
        };
        this.created = [];
        this.deleted = [];
        this.files = [];
        this.deletions = {};
        this.insertions = {};
        this.summary = {
          changes: 0,
          deletions: 0,
          insertions: 0
        };
      }
    };
    PullFailedSummary = class {
      constructor() {
        this.remote = "";
        this.hash = {
          local: "",
          remote: ""
        };
        this.branch = {
          local: "",
          remote: ""
        };
        this.message = "";
      }
      toString() {
        return this.message;
      }
    };
  }
});
function objectEnumerationResult(remoteMessages) {
  return remoteMessages.objects = remoteMessages.objects || {
    compressing: 0,
    counting: 0,
    enumerating: 0,
    packReused: 0,
    reused: { count: 0, delta: 0 },
    total: { count: 0, delta: 0 }
  };
}
function asObjectCount(source) {
  const count = /^\s*(\d+)/.exec(source);
  const delta = /delta (\d+)/i.exec(source);
  return {
    count: asNumber(count && count[1] || "0"),
    delta: asNumber(delta && delta[1] || "0")
  };
}
var remoteMessagesObjectParsers;
var init_parse_remote_objects = __esm({
  "src/lib/parsers/parse-remote-objects.ts"() {
    init_utils();
    remoteMessagesObjectParsers = [
      new RemoteLineParser(
        /^remote:\s*(enumerating|counting|compressing) objects: (\d+),/i,
        (result, [action, count]) => {
          const key = action.toLowerCase();
          const enumeration = objectEnumerationResult(result.remoteMessages);
          Object.assign(enumeration, { [key]: asNumber(count) });
        }
      ),
      new RemoteLineParser(
        /^remote:\s*(enumerating|counting|compressing) objects: \d+% \(\d+\/(\d+)\),/i,
        (result, [action, count]) => {
          const key = action.toLowerCase();
          const enumeration = objectEnumerationResult(result.remoteMessages);
          Object.assign(enumeration, { [key]: asNumber(count) });
        }
      ),
      new RemoteLineParser(
        /total ([^,]+), reused ([^,]+), pack-reused (\d+)/i,
        (result, [total, reused, packReused]) => {
          const objects2 = objectEnumerationResult(result.remoteMessages);
          objects2.total = asObjectCount(total);
          objects2.reused = asObjectCount(reused);
          objects2.packReused = asNumber(packReused);
        }
      )
    ];
  }
});
function parseRemoteMessages(_stdOut, stdErr) {
  return parseStringResponse({ remoteMessages: new RemoteMessageSummary() }, parsers2, stdErr);
}
var parsers2, RemoteMessageSummary;
var init_parse_remote_messages = __esm({
  "src/lib/parsers/parse-remote-messages.ts"() {
    init_utils();
    init_parse_remote_objects();
    parsers2 = [
      new RemoteLineParser(/^remote:\s*(.+)$/, (result, [text]) => {
        result.remoteMessages.all.push(text.trim());
        return false;
      }),
      ...remoteMessagesObjectParsers,
      new RemoteLineParser(
        [/create a (?:pull|merge) request/i, /\s(https?:\/\/\S+)$/],
        (result, [pullRequestUrl]) => {
          result.remoteMessages.pullRequestUrl = pullRequestUrl;
        }
      ),
      new RemoteLineParser(
        [/found (\d+) vulnerabilities.+\(([^)]+)\)/i, /\s(https?:\/\/\S+)$/],
        (result, [count, summary, url]) => {
          result.remoteMessages.vulnerabilities = {
            count: asNumber(count),
            summary,
            url
          };
        }
      )
    ];
    RemoteMessageSummary = class {
      constructor() {
        this.all = [];
      }
    };
  }
});
function parsePullErrorResult(stdOut, stdErr) {
  const pullError = parseStringResponse(new PullFailedSummary(), errorParsers, [stdOut, stdErr]);
  return pullError.message && pullError;
}
var FILE_UPDATE_REGEX, SUMMARY_REGEX, ACTION_REGEX, parsers3, errorParsers, parsePullDetail, parsePullResult;
var init_parse_pull = __esm({
  "src/lib/parsers/parse-pull.ts"() {
    init_PullSummary();
    init_utils();
    init_parse_remote_messages();
    FILE_UPDATE_REGEX = /^\s*(.+?)\s+\|\s+\d+\s*(\+*)(-*)/;
    SUMMARY_REGEX = /(\d+)\D+((\d+)\D+\(\+\))?(\D+(\d+)\D+\(-\))?/;
    ACTION_REGEX = /^(create|delete) mode \d+ (.+)/;
    parsers3 = [
      new LineParser(FILE_UPDATE_REGEX, (result, [file, insertions, deletions]) => {
        result.files.push(file);
        if (insertions) {
          result.insertions[file] = insertions.length;
        }
        if (deletions) {
          result.deletions[file] = deletions.length;
        }
      }),
      new LineParser(SUMMARY_REGEX, (result, [changes, , insertions, , deletions]) => {
        if (insertions !== void 0 || deletions !== void 0) {
          result.summary.changes = +changes || 0;
          result.summary.insertions = +insertions || 0;
          result.summary.deletions = +deletions || 0;
          return true;
        }
        return false;
      }),
      new LineParser(ACTION_REGEX, (result, [action, file]) => {
        append(result.files, file);
        append(action === "create" ? result.created : result.deleted, file);
      })
    ];
    errorParsers = [
      new LineParser(/^from\s(.+)$/i, (result, [remote]) => void (result.remote = remote)),
      new LineParser(/^fatal:\s(.+)$/, (result, [message]) => void (result.message = message)),
      new LineParser(
        /([a-z0-9]+)\.\.([a-z0-9]+)\s+(\S+)\s+->\s+(\S+)$/,
        (result, [hashLocal, hashRemote, branchLocal, branchRemote]) => {
          result.branch.local = branchLocal;
          result.hash.local = hashLocal;
          result.branch.remote = branchRemote;
          result.hash.remote = hashRemote;
        }
      )
    ];
    parsePullDetail = (stdOut, stdErr) => {
      return parseStringResponse(new PullSummary(), parsers3, [stdOut, stdErr]);
    };
    parsePullResult = (stdOut, stdErr) => {
      return Object.assign(
        new PullSummary(),
        parsePullDetail(stdOut, stdErr),
        parseRemoteMessages(stdOut, stdErr)
      );
    };
  }
});
var parsers4, parseMergeResult, parseMergeDetail;
var init_parse_merge = __esm({
  "src/lib/parsers/parse-merge.ts"() {
    init_MergeSummary();
    init_utils();
    init_parse_pull();
    parsers4 = [
      new LineParser(/^Auto-merging\s+(.+)$/, (summary, [autoMerge]) => {
        summary.merges.push(autoMerge);
      }),
      new LineParser(/^CONFLICT\s+\((.+)\): Merge conflict in (.+)$/, (summary, [reason, file]) => {
        summary.conflicts.push(new MergeSummaryConflict(reason, file));
      }),
      new LineParser(
        /^CONFLICT\s+\((.+\/delete)\): (.+) deleted in (.+) and/,
        (summary, [reason, file, deleteRef]) => {
          summary.conflicts.push(new MergeSummaryConflict(reason, file, { deleteRef }));
        }
      ),
      new LineParser(/^CONFLICT\s+\((.+)\):/, (summary, [reason]) => {
        summary.conflicts.push(new MergeSummaryConflict(reason, null));
      }),
      new LineParser(/^Automatic merge failed;\s+(.+)$/, (summary, [result]) => {
        summary.result = result;
      })
    ];
    parseMergeResult = (stdOut, stdErr) => {
      return Object.assign(parseMergeDetail(stdOut, stdErr), parsePullResult(stdOut, stdErr));
    };
    parseMergeDetail = (stdOut) => {
      return parseStringResponse(new MergeSummaryDetail(), parsers4, stdOut);
    };
  }
});
function mergeTask(customArgs) {
  if (!customArgs.length) {
    return configurationErrorTask("Git.merge requires at least one option");
  }
  return {
    commands: ["merge", ...customArgs],
    format: "utf-8",
    parser(stdOut, stdErr) {
      const merge = parseMergeResult(stdOut, stdErr);
      if (merge.failed) {
        throw new GitResponseError(merge);
      }
      return merge;
    }
  };
}
var init_merge = __esm({
  "src/lib/tasks/merge.ts"() {
    init_git_response_error();
    init_parse_merge();
    init_task();
  }
});
function pushResultPushedItem(local, remote, status) {
  const deleted = status.includes("deleted");
  const tag = status.includes("tag") || /^refs\/tags/.test(local);
  const alreadyUpdated = !status.includes("new");
  return {
    deleted,
    tag,
    branch: !tag,
    new: !alreadyUpdated,
    alreadyUpdated,
    local,
    remote
  };
}
var parsers5, parsePushResult, parsePushDetail;
var init_parse_push = __esm({
  "src/lib/parsers/parse-push.ts"() {
    init_utils();
    init_parse_remote_messages();
    parsers5 = [
      new LineParser(/^Pushing to (.+)$/, (result, [repo]) => {
        result.repo = repo;
      }),
      new LineParser(/^updating local tracking ref '(.+)'/, (result, [local]) => {
        result.ref = {
          ...result.ref || {},
          local
        };
      }),
      new LineParser(/^[=*-]\s+([^:]+):(\S+)\s+\[(.+)]$/, (result, [local, remote, type]) => {
        result.pushed.push(pushResultPushedItem(local, remote, type));
      }),
      new LineParser(
        /^Branch '([^']+)' set up to track remote branch '([^']+)' from '([^']+)'/,
        (result, [local, remote, remoteName]) => {
          result.branch = {
            ...result.branch || {},
            local,
            remote,
            remoteName
          };
        }
      ),
      new LineParser(
        /^([^:]+):(\S+)\s+([a-z0-9]+)\.\.([a-z0-9]+)$/,
        (result, [local, remote, from, to]) => {
          result.update = {
            head: {
              local,
              remote
            },
            hash: {
              from,
              to
            }
          };
        }
      )
    ];
    parsePushResult = (stdOut, stdErr) => {
      const pushDetail = parsePushDetail(stdOut, stdErr);
      const responseDetail = parseRemoteMessages(stdOut, stdErr);
      return {
        ...pushDetail,
        ...responseDetail
      };
    };
    parsePushDetail = (stdOut, stdErr) => {
      return parseStringResponse({ pushed: [] }, parsers5, [stdOut, stdErr]);
    };
  }
});
var push_exports = {};
__export(push_exports, {
  pushTagsTask: () => pushTagsTask,
  pushTask: () => pushTask
});
function pushTagsTask(ref = {}, customArgs) {
  append(customArgs, "--tags");
  return pushTask(ref, customArgs);
}
function pushTask(ref = {}, customArgs) {
  const commands = ["push", ...customArgs];
  if (ref.branch) {
    commands.splice(1, 0, ref.branch);
  }
  if (ref.remote) {
    commands.splice(1, 0, ref.remote);
  }
  remove(commands, "-v");
  append(commands, "--verbose");
  append(commands, "--porcelain");
  return {
    commands,
    format: "utf-8",
    parser: parsePushResult
  };
}
var init_push = __esm({
  "src/lib/tasks/push.ts"() {
    init_parse_push();
    init_utils();
  }
});
function show_default() {
  return {
    showBuffer() {
      const commands = ["show", ...getTrailingOptions(arguments, 1)];
      if (!commands.includes("--binary")) {
        commands.splice(1, 0, "--binary");
      }
      return this._runTask(
        straightThroughBufferTask(commands),
        trailingFunctionArgument(arguments)
      );
    },
    show() {
      const commands = ["show", ...getTrailingOptions(arguments, 1)];
      return this._runTask(
        straightThroughStringTask(commands),
        trailingFunctionArgument(arguments)
      );
    }
  };
}
var init_show = __esm({
  "src/lib/tasks/show.ts"() {
    init_utils();
    init_task();
  }
});
var fromPathRegex, FileStatusSummary;
var init_FileStatusSummary = __esm({
  "src/lib/responses/FileStatusSummary.ts"() {
    fromPathRegex = /^(.+)\0(.+)$/;
    FileStatusSummary = class {
      constructor(path, index, working_dir) {
        this.path = path;
        this.index = index;
        this.working_dir = working_dir;
        if (index === "R" || working_dir === "R") {
          const detail = fromPathRegex.exec(path) || [null, path, path];
          this.from = detail[2] || "";
          this.path = detail[1] || "";
        }
      }
    };
  }
});
function renamedFile(line) {
  const [to, from] = line.split(NULL);
  return {
    from: from || to,
    to
  };
}
function parser3(indexX, indexY, handler) {
  return [`${indexX}${indexY}`, handler];
}
function conflicts(indexX, ...indexY) {
  return indexY.map((y) => parser3(indexX, y, (result, file) => result.conflicted.push(file)));
}
function splitLine(result, lineStr) {
  const trimmed2 = lineStr.trim();
  switch (" ") {
    case trimmed2.charAt(2):
      return data(trimmed2.charAt(0), trimmed2.charAt(1), trimmed2.slice(3));
    case trimmed2.charAt(1):
      return data(" ", trimmed2.charAt(0), trimmed2.slice(2));
    default:
      return;
  }
  function data(index, workingDir, path) {
    const raw = `${index}${workingDir}`;
    const handler = parsers6.get(raw);
    if (handler) {
      handler(result, path);
    }
    if (raw !== "##" && raw !== "!!") {
      result.files.push(new FileStatusSummary(path, index, workingDir));
    }
  }
}
var StatusSummary, parsers6, parseStatusSummary;
var init_StatusSummary = __esm({
  "src/lib/responses/StatusSummary.ts"() {
    init_utils();
    init_FileStatusSummary();
    StatusSummary = class {
      constructor() {
        this.not_added = [];
        this.conflicted = [];
        this.created = [];
        this.deleted = [];
        this.ignored = void 0;
        this.modified = [];
        this.renamed = [];
        this.files = [];
        this.staged = [];
        this.ahead = 0;
        this.behind = 0;
        this.current = null;
        this.tracking = null;
        this.detached = false;
        this.isClean = () => {
          return !this.files.length;
        };
      }
    };
    parsers6 = new Map([
      parser3(
        " ",
        "A",
        (result, file) => result.created.push(file)
      ),
      parser3(
        " ",
        "D",
        (result, file) => result.deleted.push(file)
      ),
      parser3(
        " ",
        "M",
        (result, file) => result.modified.push(file)
      ),
      parser3("A", " ", (result, file) => {
        result.created.push(file);
        result.staged.push(file);
      }),
      parser3("A", "M", (result, file) => {
        result.created.push(file);
        result.staged.push(file);
        result.modified.push(file);
      }),
      parser3("D", " ", (result, file) => {
        result.deleted.push(file);
        result.staged.push(file);
      }),
      parser3("M", " ", (result, file) => {
        result.modified.push(file);
        result.staged.push(file);
      }),
      parser3("M", "M", (result, file) => {
        result.modified.push(file);
        result.staged.push(file);
      }),
      parser3("R", " ", (result, file) => {
        result.renamed.push(renamedFile(file));
      }),
      parser3("R", "M", (result, file) => {
        const renamed = renamedFile(file);
        result.renamed.push(renamed);
        result.modified.push(renamed.to);
      }),
      parser3("!", "!", (_result, _file) => {
        (_result.ignored = _result.ignored || []).push(_file);
      }),
      parser3(
        "?",
        "?",
        (result, file) => result.not_added.push(file)
      ),
      ...conflicts(
        "A",
        "A",
        "U"
        /* UNMERGED */
      ),
      ...conflicts(
        "D",
        "D",
        "U"
        /* UNMERGED */
      ),
      ...conflicts(
        "U",
        "A",
        "D",
        "U"
        /* UNMERGED */
      ),
      [
        "##",
        (result, line) => {
          const aheadReg = /ahead (\d+)/;
          const behindReg = /behind (\d+)/;
          const currentReg = /^(.+?(?=(?:\.{3}|\s|$)))/;
          const trackingReg = /\.{3}(\S*)/;
          const onEmptyBranchReg = /\son\s(\S+?)(?=\.{3}|$)/;
          let regexResult = aheadReg.exec(line);
          result.ahead = regexResult && +regexResult[1] || 0;
          regexResult = behindReg.exec(line);
          result.behind = regexResult && +regexResult[1] || 0;
          regexResult = currentReg.exec(line);
          result.current = filterType(regexResult?.[1], filterString, null);
          regexResult = trackingReg.exec(line);
          result.tracking = filterType(regexResult?.[1], filterString, null);
          regexResult = onEmptyBranchReg.exec(line);
          if (regexResult) {
            result.current = filterType(regexResult?.[1], filterString, result.current);
          }
          result.detached = /\(no branch\)/.test(line);
        }
      ]
    ]);
    parseStatusSummary = function(text) {
      const lines = text.split(NULL);
      const status = new StatusSummary();
      for (let i = 0, l = lines.length; i < l; ) {
        let line = lines[i++].trim();
        if (!line) {
          continue;
        }
        if (line.charAt(0) === "R") {
          line += NULL + (lines[i++] || "");
        }
        splitLine(status, line);
      }
      return status;
    };
  }
});
function statusTask(customArgs) {
  const commands = [
    "status",
    "--porcelain",
    "-b",
    "-u",
    "--null",
    ...customArgs.filter((arg) => !ignoredOptions.includes(arg))
  ];
  return {
    format: "utf-8",
    commands,
    parser(text) {
      return parseStatusSummary(text);
    }
  };
}
var ignoredOptions;
var init_status = __esm({
  "src/lib/tasks/status.ts"() {
    init_StatusSummary();
    ignoredOptions = ["--null", "-z"];
  }
});
function versionResponse(major = 0, minor = 0, patch = 0, agent = "", installed = true) {
  return Object.defineProperty(
    {
      major,
      minor,
      patch,
      agent,
      installed
    },
    "toString",
    {
      value() {
        return `${this.major}.${this.minor}.${this.patch}`;
      },
      configurable: false,
      enumerable: false
    }
  );
}
function notInstalledResponse() {
  return versionResponse(0, 0, 0, "", false);
}
function version_default() {
  return {
    version() {
      return this._runTask({
        commands: ["--version"],
        format: "utf-8",
        parser: versionParser,
        onError(result, error2, done, fail) {
          if (result.exitCode === -2) {
            return done(Buffer.from(NOT_INSTALLED));
          }
          fail(error2);
        }
      });
    }
  };
}
function versionParser(stdOut) {
  if (stdOut === NOT_INSTALLED) {
    return notInstalledResponse();
  }
  return parseStringResponse(versionResponse(0, 0, 0, stdOut), parsers7, stdOut);
}
var NOT_INSTALLED, parsers7;
var init_version = __esm({
  "src/lib/tasks/version.ts"() {
    init_utils();
    NOT_INSTALLED = "installed=false";
    parsers7 = [
      new LineParser(
        /version (\d+)\.(\d+)\.(\d+)(?:\s*\((.+)\))?/,
        (result, [major, minor, patch, agent = ""]) => {
          Object.assign(
            result,
            versionResponse(asNumber(major), asNumber(minor), asNumber(patch), agent)
          );
        }
      ),
      new LineParser(
        /version (\d+)\.(\d+)\.(\D+)(.+)?$/,
        (result, [major, minor, patch, agent = ""]) => {
          Object.assign(result, versionResponse(asNumber(major), asNumber(minor), patch, agent));
        }
      )
    ];
  }
});
function createCloneTask(api, task, repoPath, ...args2) {
  if (!filterString(repoPath)) {
    return configurationErrorTask(`git.${api}() requires a string 'repoPath'`);
  }
  return task(repoPath, filterType(args2[0], filterString), getTrailingOptions(arguments));
}
function clone_default() {
  return {
    clone(repo, ...rest) {
      return this._runTask(
        createCloneTask("clone", cloneTask, filterType(repo, filterString), ...rest),
        trailingFunctionArgument(arguments)
      );
    },
    mirror(repo, ...rest) {
      return this._runTask(
        createCloneTask("mirror", cloneMirrorTask, filterType(repo, filterString), ...rest),
        trailingFunctionArgument(arguments)
      );
    }
  };
}
var cloneTask, cloneMirrorTask;
var init_clone = __esm({
  "src/lib/tasks/clone.ts"() {
    init_task();
    init_utils();
    init_pathspec();
    cloneTask = (repo, directory, customArgs) => {
      const commands = ["clone", ...customArgs];
      filterString(repo) && commands.push(pathspec(repo));
      filterString(directory) && commands.push(pathspec(directory));
      return straightThroughStringTask(commands);
    };
    cloneMirrorTask = (repo, directory, customArgs) => {
      append(customArgs, "--mirror");
      return cloneTask(repo, directory, customArgs);
    };
  }
});
var simple_git_api_exports = {};
__export(simple_git_api_exports, {
  SimpleGitApi: () => SimpleGitApi
});
var SimpleGitApi;
var init_simple_git_api = __esm({
  "src/lib/simple-git-api.ts"() {
    init_task_callback();
    init_change_working_directory();
    init_checkout();
    init_count_objects();
    init_commit();
    init_config();
    init_first_commit();
    init_grep();
    init_hash_object();
    init_init();
    init_log();
    init_merge();
    init_push();
    init_show();
    init_status();
    init_task();
    init_version();
    init_utils();
    init_clone();
    SimpleGitApi = class {
      constructor(_executor) {
        this._executor = _executor;
      }
      _runTask(task, then) {
        const chain = this._executor.chain();
        const promise2 = chain.push(task);
        if (then) {
          taskCallback(task, promise2, then);
        }
        return Object.create(this, {
          then: { value: promise2.then.bind(promise2) },
          catch: { value: promise2.catch.bind(promise2) },
          _executor: { value: chain }
        });
      }
      add(files) {
        return this._runTask(
          straightThroughStringTask(["add", ...asArray(files)]),
          trailingFunctionArgument(arguments)
        );
      }
      cwd(directory) {
        const next = trailingFunctionArgument(arguments);
        if (typeof directory === "string") {
          return this._runTask(changeWorkingDirectoryTask(directory, this._executor), next);
        }
        if (typeof directory?.path === "string") {
          return this._runTask(
            changeWorkingDirectoryTask(
              directory.path,
              directory.root && this._executor || void 0
            ),
            next
          );
        }
        return this._runTask(
          configurationErrorTask("Git.cwd: workingDirectory must be supplied as a string"),
          next
        );
      }
      hashObject(path, write) {
        return this._runTask(
          hashObjectTask(path, write === true),
          trailingFunctionArgument(arguments)
        );
      }
      init(bare) {
        return this._runTask(
          initTask(bare === true, this._executor.cwd, getTrailingOptions(arguments)),
          trailingFunctionArgument(arguments)
        );
      }
      merge() {
        return this._runTask(
          mergeTask(getTrailingOptions(arguments)),
          trailingFunctionArgument(arguments)
        );
      }
      mergeFromTo(remote, branch) {
        if (!(filterString(remote) && filterString(branch))) {
          return this._runTask(
            configurationErrorTask(
              `Git.mergeFromTo requires that the 'remote' and 'branch' arguments are supplied as strings`
            )
          );
        }
        return this._runTask(
          mergeTask([remote, branch, ...getTrailingOptions(arguments)]),
          trailingFunctionArgument(arguments, false)
        );
      }
      outputHandler(handler) {
        this._executor.outputHandler = handler;
        return this;
      }
      push() {
        const task = pushTask(
          {
            remote: filterType(arguments[0], filterString),
            branch: filterType(arguments[1], filterString)
          },
          getTrailingOptions(arguments)
        );
        return this._runTask(task, trailingFunctionArgument(arguments));
      }
      stash() {
        return this._runTask(
          straightThroughStringTask(["stash", ...getTrailingOptions(arguments)]),
          trailingFunctionArgument(arguments)
        );
      }
      status() {
        return this._runTask(
          statusTask(getTrailingOptions(arguments)),
          trailingFunctionArgument(arguments)
        );
      }
    };
    Object.assign(
      SimpleGitApi.prototype,
      checkout_default(),
      clone_default(),
      commit_default(),
      config_default(),
      count_objects_default(),
      first_commit_default(),
      grep_default(),
      log_default(),
      show_default(),
      version_default()
    );
  }
});
var scheduler_exports = {};
__export(scheduler_exports, {
  Scheduler: () => Scheduler
});
var createScheduledTask, Scheduler;
var init_scheduler = __esm({
  "src/lib/runners/scheduler.ts"() {
    init_utils();
    init_git_logger();
    createScheduledTask = /* @__PURE__ */ (() => {
      let id = 0;
      return () => {
        id++;
        const { promise: promise2, done } = distExports.createDeferred();
        return {
          promise: promise2,
          done,
          id
        };
      };
    })();
    Scheduler = class {
      constructor(concurrency = 2) {
        this.concurrency = concurrency;
        this.logger = createLogger("", "scheduler");
        this.pending = [];
        this.running = [];
        this.logger(`Constructed, concurrency=%s`, concurrency);
      }
      schedule() {
        if (!this.pending.length || this.running.length >= this.concurrency) {
          this.logger(
            `Schedule attempt ignored, pending=%s running=%s concurrency=%s`,
            this.pending.length,
            this.running.length,
            this.concurrency
          );
          return;
        }
        const task = append(this.running, this.pending.shift());
        this.logger(`Attempting id=%s`, task.id);
        task.done(() => {
          this.logger(`Completing id=`, task.id);
          remove(this.running, task);
          this.schedule();
        });
      }
      next() {
        const { promise: promise2, id } = append(this.pending, createScheduledTask());
        this.logger(`Scheduling id=%s`, id);
        this.schedule();
        return promise2;
      }
    };
  }
});
var apply_patch_exports = {};
__export(apply_patch_exports, {
  applyPatchTask: () => applyPatchTask
});
function applyPatchTask(patches, customArgs) {
  return straightThroughStringTask(["apply", ...customArgs, ...patches]);
}
var init_apply_patch = __esm({
  "src/lib/tasks/apply-patch.ts"() {
    init_task();
  }
});
function branchDeletionSuccess(branch, hash) {
  return {
    branch,
    hash,
    success: true
  };
}
function branchDeletionFailure(branch) {
  return {
    branch,
    hash: null,
    success: false
  };
}
var BranchDeletionBatch;
var init_BranchDeleteSummary = __esm({
  "src/lib/responses/BranchDeleteSummary.ts"() {
    BranchDeletionBatch = class {
      constructor() {
        this.all = [];
        this.branches = {};
        this.errors = [];
      }
      get success() {
        return !this.errors.length;
      }
    };
  }
});
function hasBranchDeletionError(data, processExitCode) {
  return processExitCode === 1 && deleteErrorRegex.test(data);
}
var deleteSuccessRegex, deleteErrorRegex, parsers8, parseBranchDeletions;
var init_parse_branch_delete = __esm({
  "src/lib/parsers/parse-branch-delete.ts"() {
    init_BranchDeleteSummary();
    init_utils();
    deleteSuccessRegex = /(\S+)\s+\(\S+\s([^)]+)\)/;
    deleteErrorRegex = /^error[^']+'([^']+)'/m;
    parsers8 = [
      new LineParser(deleteSuccessRegex, (result, [branch, hash]) => {
        const deletion = branchDeletionSuccess(branch, hash);
        result.all.push(deletion);
        result.branches[branch] = deletion;
      }),
      new LineParser(deleteErrorRegex, (result, [branch]) => {
        const deletion = branchDeletionFailure(branch);
        result.errors.push(deletion);
        result.all.push(deletion);
        result.branches[branch] = deletion;
      })
    ];
    parseBranchDeletions = (stdOut, stdErr) => {
      return parseStringResponse(new BranchDeletionBatch(), parsers8, [stdOut, stdErr]);
    };
  }
});
var BranchSummaryResult;
var init_BranchSummary = __esm({
  "src/lib/responses/BranchSummary.ts"() {
    BranchSummaryResult = class {
      constructor() {
        this.all = [];
        this.branches = {};
        this.current = "";
        this.detached = false;
      }
      push(status, detached, name, commit, label) {
        if (status === "*") {
          this.detached = detached;
          this.current = name;
        }
        this.all.push(name);
        this.branches[name] = {
          current: status === "*",
          linkedWorkTree: status === "+",
          name,
          commit,
          label
        };
      }
    };
  }
});
function branchStatus(input) {
  return input ? input.charAt(0) : "";
}
function parseBranchSummary(stdOut, currentOnly = false) {
  return parseStringResponse(
    new BranchSummaryResult(),
    currentOnly ? [currentBranchParser] : parsers9,
    stdOut
  );
}
var parsers9, currentBranchParser;
var init_parse_branch = __esm({
  "src/lib/parsers/parse-branch.ts"() {
    init_BranchSummary();
    init_utils();
    parsers9 = [
      new LineParser(
        /^([*+]\s)?\((?:HEAD )?detached (?:from|at) (\S+)\)\s+([a-z0-9]+)\s(.*)$/,
        (result, [current, name, commit, label]) => {
          result.push(branchStatus(current), true, name, commit, label);
        }
      ),
      new LineParser(
        /^([*+]\s)?(\S+)\s+([a-z0-9]+)\s?(.*)$/s,
        (result, [current, name, commit, label]) => {
          result.push(branchStatus(current), false, name, commit, label);
        }
      )
    ];
    currentBranchParser = new LineParser(/^(\S+)$/s, (result, [name]) => {
      result.push("*", false, name, "", "");
    });
  }
});
var branch_exports = {};
__export(branch_exports, {
  branchLocalTask: () => branchLocalTask,
  branchTask: () => branchTask,
  containsDeleteBranchCommand: () => containsDeleteBranchCommand,
  deleteBranchTask: () => deleteBranchTask,
  deleteBranchesTask: () => deleteBranchesTask
});
function containsDeleteBranchCommand(commands) {
  const deleteCommands = ["-d", "-D", "--delete"];
  return commands.some((command2) => deleteCommands.includes(command2));
}
function branchTask(customArgs) {
  const isDelete = containsDeleteBranchCommand(customArgs);
  const isCurrentOnly = customArgs.includes("--show-current");
  const commands = ["branch", ...customArgs];
  if (commands.length === 1) {
    commands.push("-a");
  }
  if (!commands.includes("-v")) {
    commands.splice(1, 0, "-v");
  }
  return {
    format: "utf-8",
    commands,
    parser(stdOut, stdErr) {
      if (isDelete) {
        return parseBranchDeletions(stdOut, stdErr).all[0];
      }
      return parseBranchSummary(stdOut, isCurrentOnly);
    }
  };
}
function branchLocalTask() {
  return {
    format: "utf-8",
    commands: ["branch", "-v"],
    parser(stdOut) {
      return parseBranchSummary(stdOut);
    }
  };
}
function deleteBranchesTask(branches, forceDelete = false) {
  return {
    format: "utf-8",
    commands: ["branch", "-v", forceDelete ? "-D" : "-d", ...branches],
    parser(stdOut, stdErr) {
      return parseBranchDeletions(stdOut, stdErr);
    },
    onError({ exitCode, stdOut }, error2, done, fail) {
      if (!hasBranchDeletionError(String(error2), exitCode)) {
        return fail(error2);
      }
      done(stdOut);
    }
  };
}
function deleteBranchTask(branch, forceDelete = false) {
  const task = {
    format: "utf-8",
    commands: ["branch", "-v", forceDelete ? "-D" : "-d", branch],
    parser(stdOut, stdErr) {
      return parseBranchDeletions(stdOut, stdErr).branches[branch];
    },
    onError({ exitCode, stdErr, stdOut }, error2, _, fail) {
      if (!hasBranchDeletionError(String(error2), exitCode)) {
        return fail(error2);
      }
      throw new GitResponseError(
        task.parser(bufferToString(stdOut), bufferToString(stdErr)),
        String(error2)
      );
    }
  };
  return task;
}
var init_branch = __esm({
  "src/lib/tasks/branch.ts"() {
    init_git_response_error();
    init_parse_branch_delete();
    init_parse_branch();
    init_utils();
  }
});
function toPath(input) {
  const path = input.trim().replace(/^["']|["']$/g, "");
  return path && normalize(path);
}
var parseCheckIgnore;
var init_CheckIgnore = __esm({
  "src/lib/responses/CheckIgnore.ts"() {
    parseCheckIgnore = (text) => {
      return text.split(/\n/g).map(toPath).filter(Boolean);
    };
  }
});
var check_ignore_exports = {};
__export(check_ignore_exports, {
  checkIgnoreTask: () => checkIgnoreTask
});
function checkIgnoreTask(paths) {
  return {
    commands: ["check-ignore", ...paths],
    format: "utf-8",
    parser: parseCheckIgnore
  };
}
var init_check_ignore = __esm({
  "src/lib/tasks/check-ignore.ts"() {
    init_CheckIgnore();
  }
});
function parseFetchResult(stdOut, stdErr) {
  const result = {
    raw: stdOut,
    remote: null,
    branches: [],
    tags: [],
    updated: [],
    deleted: []
  };
  return parseStringResponse(result, parsers10, [stdOut, stdErr]);
}
var parsers10;
var init_parse_fetch = __esm({
  "src/lib/parsers/parse-fetch.ts"() {
    init_utils();
    parsers10 = [
      new LineParser(/From (.+)$/, (result, [remote]) => {
        result.remote = remote;
      }),
      new LineParser(/\* \[new branch]\s+(\S+)\s*-> (.+)$/, (result, [name, tracking]) => {
        result.branches.push({
          name,
          tracking
        });
      }),
      new LineParser(/\* \[new tag]\s+(\S+)\s*-> (.+)$/, (result, [name, tracking]) => {
        result.tags.push({
          name,
          tracking
        });
      }),
      new LineParser(/- \[deleted]\s+\S+\s*-> (.+)$/, (result, [tracking]) => {
        result.deleted.push({
          tracking
        });
      }),
      new LineParser(
        /\s*([^.]+)\.\.(\S+)\s+(\S+)\s*-> (.+)$/,
        (result, [from, to, name, tracking]) => {
          result.updated.push({
            name,
            tracking,
            to,
            from
          });
        }
      )
    ];
  }
});
var fetch_exports = {};
__export(fetch_exports, {
  fetchTask: () => fetchTask
});
function disallowedCommand(command2) {
  return /^--upload-pack(=|$)/.test(command2);
}
function fetchTask(remote, branch, customArgs) {
  const commands = ["fetch", ...customArgs];
  if (remote && branch) {
    commands.push(remote, branch);
  }
  const banned = commands.find(disallowedCommand);
  if (banned) {
    return configurationErrorTask(`git.fetch: potential exploit argument blocked.`);
  }
  return {
    commands,
    format: "utf-8",
    parser: parseFetchResult
  };
}
var init_fetch = __esm({
  "src/lib/tasks/fetch.ts"() {
    init_parse_fetch();
    init_task();
  }
});
function parseMoveResult(stdOut) {
  return parseStringResponse({ moves: [] }, parsers11, stdOut);
}
var parsers11;
var init_parse_move = __esm({
  "src/lib/parsers/parse-move.ts"() {
    init_utils();
    parsers11 = [
      new LineParser(/^Renaming (.+) to (.+)$/, (result, [from, to]) => {
        result.moves.push({ from, to });
      })
    ];
  }
});
var move_exports = {};
__export(move_exports, {
  moveTask: () => moveTask
});
function moveTask(from, to) {
  return {
    commands: ["mv", "-v", ...asArray(from), to],
    format: "utf-8",
    parser: parseMoveResult
  };
}
var init_move = __esm({
  "src/lib/tasks/move.ts"() {
    init_parse_move();
    init_utils();
  }
});
var pull_exports = {};
__export(pull_exports, {
  pullTask: () => pullTask
});
function pullTask(remote, branch, customArgs) {
  const commands = ["pull", ...customArgs];
  if (remote && branch) {
    commands.splice(1, 0, remote, branch);
  }
  return {
    commands,
    format: "utf-8",
    parser(stdOut, stdErr) {
      return parsePullResult(stdOut, stdErr);
    },
    onError(result, _error, _done, fail) {
      const pullError = parsePullErrorResult(
        bufferToString(result.stdOut),
        bufferToString(result.stdErr)
      );
      if (pullError) {
        return fail(new GitResponseError(pullError));
      }
      fail(_error);
    }
  };
}
var init_pull = __esm({
  "src/lib/tasks/pull.ts"() {
    init_git_response_error();
    init_parse_pull();
    init_utils();
  }
});
function parseGetRemotes(text) {
  const remotes = {};
  forEach(text, ([name]) => remotes[name] = { name });
  return Object.values(remotes);
}
function parseGetRemotesVerbose(text) {
  const remotes = {};
  forEach(text, ([name, url, purpose]) => {
    if (!Object.hasOwn(remotes, name)) {
      remotes[name] = {
        name,
        refs: { fetch: "", push: "" }
      };
    }
    if (purpose && url) {
      remotes[name].refs[purpose.replace(/[^a-z]/g, "")] = url;
    }
  });
  return Object.values(remotes);
}
function forEach(text, handler) {
  forEachLineWithContent(text, (line) => handler(line.split(/\s+/)));
}
var init_GetRemoteSummary = __esm({
  "src/lib/responses/GetRemoteSummary.ts"() {
    init_utils();
  }
});
var remote_exports = {};
__export(remote_exports, {
  addRemoteTask: () => addRemoteTask,
  getRemotesTask: () => getRemotesTask,
  listRemotesTask: () => listRemotesTask,
  remoteTask: () => remoteTask,
  removeRemoteTask: () => removeRemoteTask
});
function addRemoteTask(remoteName, remoteRepo, customArgs) {
  return straightThroughStringTask(["remote", "add", ...customArgs, remoteName, remoteRepo]);
}
function getRemotesTask(verbose) {
  const commands = ["remote"];
  if (verbose) {
    commands.push("-v");
  }
  return {
    commands,
    format: "utf-8",
    parser: verbose ? parseGetRemotesVerbose : parseGetRemotes
  };
}
function listRemotesTask(customArgs) {
  const commands = [...customArgs];
  if (commands[0] !== "ls-remote") {
    commands.unshift("ls-remote");
  }
  return straightThroughStringTask(commands);
}
function remoteTask(customArgs) {
  const commands = [...customArgs];
  if (commands[0] !== "remote") {
    commands.unshift("remote");
  }
  return straightThroughStringTask(commands);
}
function removeRemoteTask(remoteName) {
  return straightThroughStringTask(["remote", "remove", remoteName]);
}
var init_remote = __esm({
  "src/lib/tasks/remote.ts"() {
    init_GetRemoteSummary();
    init_task();
  }
});
var stash_list_exports = {};
__export(stash_list_exports, {
  stashListTask: () => stashListTask
});
function stashListTask(opt = {}, customArgs) {
  const options = parseLogOptions(opt);
  const commands = ["stash", "list", ...options.commands, ...customArgs];
  const parser4 = createListLogSummaryParser(
    options.splitter,
    options.fields,
    logFormatFromCommand(commands)
  );
  return validateLogFormatConfig(commands) || {
    commands,
    format: "utf-8",
    parser: parser4
  };
}
var init_stash_list = __esm({
  "src/lib/tasks/stash-list.ts"() {
    init_log_format();
    init_parse_list_log_summary();
    init_diff();
    init_log();
  }
});
var sub_module_exports = {};
__export(sub_module_exports, {
  addSubModuleTask: () => addSubModuleTask,
  initSubModuleTask: () => initSubModuleTask,
  subModuleTask: () => subModuleTask,
  updateSubModuleTask: () => updateSubModuleTask
});
function addSubModuleTask(repo, path) {
  return subModuleTask(["add", repo, path]);
}
function initSubModuleTask(customArgs) {
  return subModuleTask(["init", ...customArgs]);
}
function subModuleTask(customArgs) {
  const commands = [...customArgs];
  if (commands[0] !== "submodule") {
    commands.unshift("submodule");
  }
  return straightThroughStringTask(commands);
}
function updateSubModuleTask(customArgs) {
  return subModuleTask(["update", ...customArgs]);
}
var init_sub_module = __esm({
  "src/lib/tasks/sub-module.ts"() {
    init_task();
  }
});
function singleSorted(a, b) {
  const aIsNum = Number.isNaN(a);
  const bIsNum = Number.isNaN(b);
  if (aIsNum !== bIsNum) {
    return aIsNum ? 1 : -1;
  }
  return aIsNum ? sorted(a, b) : 0;
}
function sorted(a, b) {
  return a === b ? 0 : a > b ? 1 : -1;
}
function trimmed(input) {
  return input.trim();
}
function toNumber(input) {
  if (typeof input === "string") {
    return parseInt(input.replace(/^\D+/g, ""), 10) || 0;
  }
  return 0;
}
var TagList, parseTagList;
var init_TagList = __esm({
  "src/lib/responses/TagList.ts"() {
    TagList = class {
      constructor(all, latest) {
        this.all = all;
        this.latest = latest;
      }
    };
    parseTagList = function(data, customSort = false) {
      const tags = data.split("\n").map(trimmed).filter(Boolean);
      if (!customSort) {
        tags.sort(function(tagA, tagB) {
          const partsA = tagA.split(".");
          const partsB = tagB.split(".");
          if (partsA.length === 1 || partsB.length === 1) {
            return singleSorted(toNumber(partsA[0]), toNumber(partsB[0]));
          }
          for (let i = 0, l = Math.max(partsA.length, partsB.length); i < l; i++) {
            const diff = sorted(toNumber(partsA[i]), toNumber(partsB[i]));
            if (diff) {
              return diff;
            }
          }
          return 0;
        });
      }
      const latest = customSort ? tags[0] : [...tags].reverse().find((tag) => tag.indexOf(".") >= 0);
      return new TagList(tags, latest);
    };
  }
});
var tag_exports = {};
__export(tag_exports, {
  addAnnotatedTagTask: () => addAnnotatedTagTask,
  addTagTask: () => addTagTask,
  tagListTask: () => tagListTask
});
function tagListTask(customArgs = []) {
  const hasCustomSort = customArgs.some((option) => /^--sort=/.test(option));
  return {
    format: "utf-8",
    commands: ["tag", "-l", ...customArgs],
    parser(text) {
      return parseTagList(text, hasCustomSort);
    }
  };
}
function addTagTask(name) {
  return {
    format: "utf-8",
    commands: ["tag", name],
    parser() {
      return { name };
    }
  };
}
function addAnnotatedTagTask(name, tagMessage) {
  return {
    format: "utf-8",
    commands: ["tag", "-a", "-m", tagMessage, name],
    parser() {
      return { name };
    }
  };
}
var init_tag = __esm({
  "src/lib/tasks/tag.ts"() {
    init_TagList();
  }
});
var require_git = __commonJS({
  "src/git.js"(exports$1, module) {
    var { GitExecutor: GitExecutor2 } = (init_git_executor(), __toCommonJS(git_executor_exports));
    var { SimpleGitApi: SimpleGitApi2 } = (init_simple_git_api(), __toCommonJS(simple_git_api_exports));
    var { Scheduler: Scheduler2 } = (init_scheduler(), __toCommonJS(scheduler_exports));
    var { adhocExecTask: adhocExecTask2, configurationErrorTask: configurationErrorTask2 } = (init_task(), __toCommonJS(task_exports));
    var {
      asArray: asArray2,
      filterArray: filterArray2,
      filterPrimitives: filterPrimitives2,
      filterString: filterString2,
      filterStringOrStringArray: filterStringOrStringArray2,
      filterType: filterType2,
      getTrailingOptions: getTrailingOptions2,
      trailingFunctionArgument: trailingFunctionArgument2,
      trailingOptionsArgument: trailingOptionsArgument2
    } = (init_utils(), __toCommonJS(utils_exports));
    var { applyPatchTask: applyPatchTask2 } = (init_apply_patch(), __toCommonJS(apply_patch_exports));
    var {
      branchTask: branchTask2,
      branchLocalTask: branchLocalTask2,
      deleteBranchesTask: deleteBranchesTask2,
      deleteBranchTask: deleteBranchTask2
    } = (init_branch(), __toCommonJS(branch_exports));
    var { checkIgnoreTask: checkIgnoreTask2 } = (init_check_ignore(), __toCommonJS(check_ignore_exports));
    var { checkIsRepoTask: checkIsRepoTask2 } = (init_check_is_repo(), __toCommonJS(check_is_repo_exports));
    var { cleanWithOptionsTask: cleanWithOptionsTask2, isCleanOptionsArray: isCleanOptionsArray2 } = (init_clean(), __toCommonJS(clean_exports));
    var { diffSummaryTask: diffSummaryTask2 } = (init_diff(), __toCommonJS(diff_exports));
    var { fetchTask: fetchTask2 } = (init_fetch(), __toCommonJS(fetch_exports));
    var { moveTask: moveTask2 } = (init_move(), __toCommonJS(move_exports));
    var { pullTask: pullTask2 } = (init_pull(), __toCommonJS(pull_exports));
    var { pushTagsTask: pushTagsTask2 } = (init_push(), __toCommonJS(push_exports));
    var {
      addRemoteTask: addRemoteTask2,
      getRemotesTask: getRemotesTask2,
      listRemotesTask: listRemotesTask2,
      remoteTask: remoteTask2,
      removeRemoteTask: removeRemoteTask2
    } = (init_remote(), __toCommonJS(remote_exports));
    var { getResetMode: getResetMode2, resetTask: resetTask2 } = (init_reset(), __toCommonJS(reset_exports));
    var { stashListTask: stashListTask2 } = (init_stash_list(), __toCommonJS(stash_list_exports));
    var {
      addSubModuleTask: addSubModuleTask2,
      initSubModuleTask: initSubModuleTask2,
      subModuleTask: subModuleTask2,
      updateSubModuleTask: updateSubModuleTask2
    } = (init_sub_module(), __toCommonJS(sub_module_exports));
    var { addAnnotatedTagTask: addAnnotatedTagTask2, addTagTask: addTagTask2, tagListTask: tagListTask2 } = (init_tag(), __toCommonJS(tag_exports));
    var { straightThroughBufferTask: straightThroughBufferTask2, straightThroughStringTask: straightThroughStringTask2 } = (init_task(), __toCommonJS(task_exports));
    function Git2(options, plugins) {
      this._plugins = plugins;
      this._executor = new GitExecutor2(
        options.baseDir,
        new Scheduler2(options.maxConcurrentProcesses),
        plugins
      );
      this._trimmed = options.trimmed;
    }
    (Git2.prototype = Object.create(SimpleGitApi2.prototype)).constructor = Git2;
    Git2.prototype.customBinary = function(command2) {
      this._plugins.reconfigure("binary", command2);
      return this;
    };
    Git2.prototype.env = function(name, value) {
      if (arguments.length === 1 && typeof name === "object") {
        this._executor.env = name;
      } else {
        (this._executor.env = this._executor.env || {})[name] = value;
      }
      return this;
    };
    Git2.prototype.stashList = function(options) {
      return this._runTask(
        stashListTask2(
          trailingOptionsArgument2(arguments) || {},
          filterArray2(options) && options || []
        ),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.mv = function(from, to) {
      return this._runTask(moveTask2(from, to), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.checkoutLatestTag = function(then) {
      var git2 = this;
      return this.pull(function() {
        git2.tags(function(err, tags) {
          git2.checkout(tags.latest, then);
        });
      });
    };
    Git2.prototype.pull = function(remote, branch, options, then) {
      return this._runTask(
        pullTask2(
          filterType2(remote, filterString2),
          filterType2(branch, filterString2),
          getTrailingOptions2(arguments)
        ),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.fetch = function(remote, branch) {
      return this._runTask(
        fetchTask2(
          filterType2(remote, filterString2),
          filterType2(branch, filterString2),
          getTrailingOptions2(arguments)
        ),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.silent = function(silence) {
      return this._runTask(
        adhocExecTask2(
          () => console.warn(
            "simple-git deprecation notice: git.silent: logging should be configured using the `debug` library / `DEBUG` environment variable, this method will be removed."
          )
        )
      );
    };
    Git2.prototype.tags = function(options, then) {
      return this._runTask(
        tagListTask2(getTrailingOptions2(arguments)),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.rebase = function() {
      return this._runTask(
        straightThroughStringTask2(["rebase", ...getTrailingOptions2(arguments)]),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.reset = function(mode2) {
      return this._runTask(
        resetTask2(getResetMode2(mode2), getTrailingOptions2(arguments)),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.revert = function(commit) {
      const next = trailingFunctionArgument2(arguments);
      if (typeof commit !== "string") {
        return this._runTask(configurationErrorTask2("Commit must be a string"), next);
      }
      return this._runTask(
        straightThroughStringTask2(["revert", ...getTrailingOptions2(arguments, 0, true), commit]),
        next
      );
    };
    Git2.prototype.addTag = function(name) {
      const task = typeof name === "string" ? addTagTask2(name) : configurationErrorTask2("Git.addTag requires a tag name");
      return this._runTask(task, trailingFunctionArgument2(arguments));
    };
    Git2.prototype.addAnnotatedTag = function(tagName, tagMessage) {
      return this._runTask(
        addAnnotatedTagTask2(tagName, tagMessage),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.deleteLocalBranch = function(branchName, forceDelete, then) {
      return this._runTask(
        deleteBranchTask2(branchName, typeof forceDelete === "boolean" ? forceDelete : false),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.deleteLocalBranches = function(branchNames, forceDelete, then) {
      return this._runTask(
        deleteBranchesTask2(branchNames, typeof forceDelete === "boolean" ? forceDelete : false),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.branch = function(options, then) {
      return this._runTask(
        branchTask2(getTrailingOptions2(arguments)),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.branchLocal = function(then) {
      return this._runTask(branchLocalTask2(), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.raw = function(commands) {
      const createRestCommands = !Array.isArray(commands);
      const command2 = [].slice.call(createRestCommands ? arguments : commands, 0);
      for (let i = 0; i < command2.length && createRestCommands; i++) {
        if (!filterPrimitives2(command2[i])) {
          command2.splice(i, command2.length - i);
          break;
        }
      }
      command2.push(...getTrailingOptions2(arguments, 0, true));
      var next = trailingFunctionArgument2(arguments);
      if (!command2.length) {
        return this._runTask(
          configurationErrorTask2("Raw: must supply one or more command to execute"),
          next
        );
      }
      return this._runTask(straightThroughStringTask2(command2, this._trimmed), next);
    };
    Git2.prototype.submoduleAdd = function(repo, path, then) {
      return this._runTask(addSubModuleTask2(repo, path), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.submoduleUpdate = function(args2, then) {
      return this._runTask(
        updateSubModuleTask2(getTrailingOptions2(arguments, true)),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.submoduleInit = function(args2, then) {
      return this._runTask(
        initSubModuleTask2(getTrailingOptions2(arguments, true)),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.subModule = function(options, then) {
      return this._runTask(
        subModuleTask2(getTrailingOptions2(arguments)),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.listRemote = function() {
      return this._runTask(
        listRemotesTask2(getTrailingOptions2(arguments)),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.addRemote = function(remoteName, remoteRepo, then) {
      return this._runTask(
        addRemoteTask2(remoteName, remoteRepo, getTrailingOptions2(arguments)),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.removeRemote = function(remoteName, then) {
      return this._runTask(removeRemoteTask2(remoteName), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.getRemotes = function(verbose, then) {
      return this._runTask(getRemotesTask2(verbose === true), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.remote = function(options, then) {
      return this._runTask(
        remoteTask2(getTrailingOptions2(arguments)),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.tag = function(options, then) {
      const command2 = getTrailingOptions2(arguments);
      if (command2[0] !== "tag") {
        command2.unshift("tag");
      }
      return this._runTask(straightThroughStringTask2(command2), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.updateServerInfo = function(then) {
      return this._runTask(
        straightThroughStringTask2(["update-server-info"]),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.pushTags = function(remote, then) {
      const task = pushTagsTask2(
        { remote: filterType2(remote, filterString2) },
        getTrailingOptions2(arguments)
      );
      return this._runTask(task, trailingFunctionArgument2(arguments));
    };
    Git2.prototype.rm = function(files) {
      return this._runTask(
        straightThroughStringTask2(["rm", "-f", ...asArray2(files)]),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.rmKeepLocal = function(files) {
      return this._runTask(
        straightThroughStringTask2(["rm", "--cached", ...asArray2(files)]),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.catFile = function(options, then) {
      return this._catFile("utf-8", arguments);
    };
    Git2.prototype.binaryCatFile = function() {
      return this._catFile("buffer", arguments);
    };
    Git2.prototype._catFile = function(format, args2) {
      var handler = trailingFunctionArgument2(args2);
      var command2 = ["cat-file"];
      var options = args2[0];
      if (typeof options === "string") {
        return this._runTask(
          configurationErrorTask2("Git.catFile: options must be supplied as an array of strings"),
          handler
        );
      }
      if (Array.isArray(options)) {
        command2.push.apply(command2, options);
      }
      const task = format === "buffer" ? straightThroughBufferTask2(command2) : straightThroughStringTask2(command2);
      return this._runTask(task, handler);
    };
    Git2.prototype.diff = function(options, then) {
      const task = filterString2(options) ? configurationErrorTask2(
        "git.diff: supplying options as a single string is no longer supported, switch to an array of strings"
      ) : straightThroughStringTask2(["diff", ...getTrailingOptions2(arguments)]);
      return this._runTask(task, trailingFunctionArgument2(arguments));
    };
    Git2.prototype.diffSummary = function() {
      return this._runTask(
        diffSummaryTask2(getTrailingOptions2(arguments, 1)),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.applyPatch = function(patches) {
      const task = !filterStringOrStringArray2(patches) ? configurationErrorTask2(
        `git.applyPatch requires one or more string patches as the first argument`
      ) : applyPatchTask2(asArray2(patches), getTrailingOptions2([].slice.call(arguments, 1)));
      return this._runTask(task, trailingFunctionArgument2(arguments));
    };
    Git2.prototype.revparse = function() {
      const commands = ["rev-parse", ...getTrailingOptions2(arguments, true)];
      return this._runTask(
        straightThroughStringTask2(commands, true),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.clean = function(mode2, options, then) {
      const usingCleanOptionsArray = isCleanOptionsArray2(mode2);
      const cleanMode = usingCleanOptionsArray && mode2.join("") || filterType2(mode2, filterString2) || "";
      const customArgs = getTrailingOptions2([].slice.call(arguments, usingCleanOptionsArray ? 1 : 0));
      return this._runTask(
        cleanWithOptionsTask2(cleanMode, customArgs),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.exec = function(then) {
      const task = {
        commands: [],
        format: "utf-8",
        parser() {
          if (typeof then === "function") {
            then();
          }
        }
      };
      return this._runTask(task);
    };
    Git2.prototype.clearQueue = function() {
      return this._runTask(
        adhocExecTask2(
          () => console.warn(
            "simple-git deprecation notice: clearQueue() is deprecated and will be removed, switch to using the abortPlugin instead."
          )
        )
      );
    };
    Git2.prototype.checkIgnore = function(pathnames, then) {
      return this._runTask(
        checkIgnoreTask2(asArray2(filterType2(pathnames, filterStringOrStringArray2, []))),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.checkIsRepo = function(checkType, then) {
      return this._runTask(
        checkIsRepoTask2(filterType2(checkType, filterString2)),
        trailingFunctionArgument2(arguments)
      );
    };
    module.exports = Git2;
  }
});
init_pathspec();
init_git_error();
var GitConstructError = class extends GitError {
  constructor(config, message) {
    super(void 0, message);
    this.config = config;
  }
};
init_git_error();
init_git_error();
var GitPluginError = class extends GitError {
  constructor(task, plugin, message) {
    super(task, message);
    this.task = task;
    this.plugin = plugin;
    Object.setPrototypeOf(this, new.target.prototype);
  }
};
init_git_response_error();
init_task_configuration_error();
init_check_is_repo();
init_clean();
init_config();
init_diff_name_status();
init_grep();
init_reset();
function abortPlugin(signal) {
  if (!signal) {
    return;
  }
  const onSpawnAfter = {
    type: "spawn.after",
    action(_data, context) {
      function kill2() {
        context.kill(new GitPluginError(void 0, "abort", "Abort signal received"));
      }
      signal.addEventListener("abort", kill2);
      context.spawned.on("close", () => signal.removeEventListener("abort", kill2));
    }
  };
  const onSpawnBefore = {
    type: "spawn.before",
    action(_data, context) {
      if (signal.aborted) {
        context.kill(new GitPluginError(void 0, "abort", "Abort already signaled"));
      }
    }
  };
  return [onSpawnBefore, onSpawnAfter];
}
function isConfigSwitch(arg) {
  return typeof arg === "string" && arg.trim().toLowerCase() === "-c";
}
function isCloneUploadPackSwitch(char, arg) {
  if (typeof arg !== "string" || !arg.includes(char)) {
    return false;
  }
  const cleaned = arg.trim().replace(/\0/g, "");
  return /^(--no)?-{1,2}[\dlsqvnobucj]+(\s|$)/.test(cleaned);
}
function preventConfigBuilder(config, setting, message = String(config)) {
  const regex2 = typeof config === "string" ? new RegExp(`\\s*${config}`, "i") : config;
  return function preventCommand(options, arg, next) {
    if (options[setting] !== true && isConfigSwitch(arg) && regex2.test(next)) {
      throw new GitPluginError(
        void 0,
        "unsafe",
        `Configuring ${message} is not permitted without enabling ${setting}`
      );
    }
  };
}
var preventUnsafeConfig = [
  preventConfigBuilder(
    /^\s*protocol(.[a-z]+)?.allow/i,
    "allowUnsafeProtocolOverride",
    "protocol.allow"
  ),
  preventConfigBuilder("core.sshCommand", "allowUnsafeSshCommand"),
  preventConfigBuilder("core.gitProxy", "allowUnsafeGitProxy"),
  preventConfigBuilder("core.hooksPath", "allowUnsafeHooksPath"),
  preventConfigBuilder("diff.external", "allowUnsafeDiffExternal")
];
function preventUploadPack(arg, method) {
  if (/^\s*--(upload|receive)-pack/.test(arg)) {
    throw new GitPluginError(
      void 0,
      "unsafe",
      `Use of --upload-pack or --receive-pack is not permitted without enabling allowUnsafePack`
    );
  }
  if (method === "clone" && isCloneUploadPackSwitch("u", arg)) {
    throw new GitPluginError(
      void 0,
      "unsafe",
      `Use of clone with option -u is not permitted without enabling allowUnsafePack`
    );
  }
  if (method === "push" && /^\s*--exec\b/.test(arg)) {
    throw new GitPluginError(
      void 0,
      "unsafe",
      `Use of push with option --exec is not permitted without enabling allowUnsafePack`
    );
  }
}
function blockUnsafeOperationsPlugin({
  allowUnsafePack = false,
  ...options
} = {}) {
  return {
    type: "spawn.args",
    action(args2, context) {
      args2.forEach((current, index) => {
        const next = index < args2.length ? args2[index + 1] : "";
        allowUnsafePack || preventUploadPack(current, context.method);
        preventUnsafeConfig.forEach((helper) => helper(options, current, next));
      });
      return args2;
    }
  };
}
init_utils();
function commandConfigPrefixingPlugin(configuration) {
  const prefix = prefixedArray(configuration, "-c");
  return {
    type: "spawn.args",
    action(data) {
      return [...prefix, ...data];
    }
  };
}
init_utils();
var never = distExports.deferred().promise;
function completionDetectionPlugin({
  onClose = true,
  onExit = 50
} = {}) {
  function createEvents() {
    let exitCode = -1;
    const events = {
      close: distExports.deferred(),
      closeTimeout: distExports.deferred(),
      exit: distExports.deferred(),
      exitTimeout: distExports.deferred()
    };
    const result = Promise.race([
      onClose === false ? never : events.closeTimeout.promise,
      onExit === false ? never : events.exitTimeout.promise
    ]);
    configureTimeout(onClose, events.close, events.closeTimeout);
    configureTimeout(onExit, events.exit, events.exitTimeout);
    return {
      close(code) {
        exitCode = code;
        events.close.done();
      },
      exit(code) {
        exitCode = code;
        events.exit.done();
      },
      get exitCode() {
        return exitCode;
      },
      result
    };
  }
  function configureTimeout(flag, event, timeout) {
    if (flag === false) {
      return;
    }
    (flag === true ? event.promise : event.promise.then(() => delay(flag))).then(timeout.done);
  }
  return {
    type: "spawn.after",
    async action(_data, { spawned, close }) {
      const events = createEvents();
      let deferClose = true;
      let quickClose = () => void (deferClose = false);
      spawned.stdout?.on("data", quickClose);
      spawned.stderr?.on("data", quickClose);
      spawned.on("error", quickClose);
      spawned.on("close", (code) => events.close(code));
      spawned.on("exit", (code) => events.exit(code));
      try {
        await events.result;
        if (deferClose) {
          await delay(50);
        }
        close(events.exitCode);
      } catch (err) {
        close(events.exitCode, err);
      }
    }
  };
}
init_utils();
var WRONG_NUMBER_ERR = `Invalid value supplied for custom binary, requires a single string or an array containing either one or two strings`;
var WRONG_CHARS_ERR = `Invalid value supplied for custom binary, restricted characters must be removed or supply the unsafe.allowUnsafeCustomBinary option`;
function isBadArgument(arg) {
  return !arg || !/^([a-z]:)?([a-z0-9/.\\_~-]+)$/i.test(arg);
}
function toBinaryConfig(input, allowUnsafe) {
  if (input.length < 1 || input.length > 2) {
    throw new GitPluginError(void 0, "binary", WRONG_NUMBER_ERR);
  }
  const isBad = input.some(isBadArgument);
  if (isBad) {
    if (allowUnsafe) {
      console.warn(WRONG_CHARS_ERR);
    } else {
      throw new GitPluginError(void 0, "binary", WRONG_CHARS_ERR);
    }
  }
  const [binary, prefix] = input;
  return {
    binary,
    prefix
  };
}
function customBinaryPlugin(plugins, input = ["git"], allowUnsafe = false) {
  let config = toBinaryConfig(asArray(input), allowUnsafe);
  plugins.on("binary", (input2) => {
    config = toBinaryConfig(asArray(input2), allowUnsafe);
  });
  plugins.append("spawn.binary", () => {
    return config.binary;
  });
  plugins.append("spawn.args", (data) => {
    return config.prefix ? [config.prefix, ...data] : data;
  });
}
init_git_error();
function isTaskError(result) {
  return !!(result.exitCode && result.stdErr.length);
}
function getErrorMessage(result) {
  return Buffer.concat([...result.stdOut, ...result.stdErr]);
}
function errorDetectionHandler(overwrite = false, isError = isTaskError, errorMessage = getErrorMessage) {
  return (error2, result) => {
    if (!overwrite && error2 || !isError(result)) {
      return error2;
    }
    return errorMessage(result);
  };
}
function errorDetectionPlugin(config) {
  return {
    type: "task.error",
    action(data, context) {
      const error2 = config(data.error, {
        stdErr: context.stdErr,
        stdOut: context.stdOut,
        exitCode: context.exitCode
      });
      if (Buffer.isBuffer(error2)) {
        return { error: new GitError(void 0, error2.toString("utf-8")) };
      }
      return {
        error: error2
      };
    }
  };
}
init_utils();
var PluginStore = class {
  constructor() {
    this.plugins = /* @__PURE__ */ new Set();
    this.events = new EventEmitter();
  }
  on(type, listener) {
    this.events.on(type, listener);
  }
  reconfigure(type, data) {
    this.events.emit(type, data);
  }
  append(type, action) {
    const plugin = append(this.plugins, { type, action });
    return () => this.plugins.delete(plugin);
  }
  add(plugin) {
    const plugins = [];
    asArray(plugin).forEach((plugin2) => plugin2 && this.plugins.add(append(plugins, plugin2)));
    return () => {
      plugins.forEach((plugin2) => this.plugins.delete(plugin2));
    };
  }
  exec(type, data, context) {
    let output = data;
    const contextual = Object.freeze(Object.create(context));
    for (const plugin of this.plugins) {
      if (plugin.type === type) {
        output = plugin.action(output, contextual);
      }
    }
    return output;
  }
};
init_utils();
function progressMonitorPlugin(progress) {
  const progressCommand = "--progress";
  const progressMethods = ["checkout", "clone", "fetch", "pull", "push"];
  const onProgress = {
    type: "spawn.after",
    action(_data, context) {
      if (!context.commands.includes(progressCommand)) {
        return;
      }
      context.spawned.stderr?.on("data", (chunk) => {
        const message = /^([\s\S]+?):\s*(\d+)% \((\d+)\/(\d+)\)/.exec(chunk.toString("utf8"));
        if (!message) {
          return;
        }
        progress({
          method: context.method,
          stage: progressEventStage(message[1]),
          progress: asNumber(message[2]),
          processed: asNumber(message[3]),
          total: asNumber(message[4])
        });
      });
    }
  };
  const onArgs = {
    type: "spawn.args",
    action(args2, context) {
      if (!progressMethods.includes(context.method)) {
        return args2;
      }
      return including(args2, progressCommand);
    }
  };
  return [onArgs, onProgress];
}
function progressEventStage(input) {
  return String(input.toLowerCase().split(" ", 1)) || "unknown";
}
init_utils();
function spawnOptionsPlugin(spawnOptions) {
  const options = pick(spawnOptions, ["uid", "gid"]);
  return {
    type: "spawn.options",
    action(data) {
      return { ...options, ...data };
    }
  };
}
function timeoutPlugin({
  block,
  stdErr = true,
  stdOut = true
}) {
  if (block > 0) {
    return {
      type: "spawn.after",
      action(_data, context) {
        let timeout;
        function wait() {
          timeout && clearTimeout(timeout);
          timeout = setTimeout(kill2, block);
        }
        function stop() {
          context.spawned.stdout?.off("data", wait);
          context.spawned.stderr?.off("data", wait);
          context.spawned.off("exit", stop);
          context.spawned.off("close", stop);
          timeout && clearTimeout(timeout);
        }
        function kill2() {
          stop();
          context.kill(new GitPluginError(void 0, "timeout", `block timeout reached`));
        }
        stdOut && context.spawned.stdout?.on("data", wait);
        stdErr && context.spawned.stderr?.on("data", wait);
        context.spawned.on("exit", stop);
        context.spawned.on("close", stop);
        wait();
      }
    };
  }
}
init_pathspec();
function suffixPathsPlugin() {
  return {
    type: "spawn.args",
    action(data) {
      const prefix = [];
      let suffix;
      function append2(args2) {
        (suffix = suffix || []).push(...args2);
      }
      for (let i = 0; i < data.length; i++) {
        const param = data[i];
        if (isPathSpec(param)) {
          append2(toPaths(param));
          continue;
        }
        if (param === "--") {
          append2(
            data.slice(i + 1).flatMap((item) => isPathSpec(item) && toPaths(item) || item)
          );
          break;
        }
        prefix.push(param);
      }
      return !suffix ? prefix : [...prefix, "--", ...suffix.map(String)];
    }
  };
}
init_utils();
var Git = require_git();
function gitInstanceFactory(baseDir, options) {
  const plugins = new PluginStore();
  const config = createInstanceConfig(
    baseDir && (typeof baseDir === "string" ? { baseDir } : baseDir) || {},
    options
  );
  if (!folderExists(config.baseDir)) {
    throw new GitConstructError(
      config,
      `Cannot use simple-git on a directory that does not exist`
    );
  }
  if (Array.isArray(config.config)) {
    plugins.add(commandConfigPrefixingPlugin(config.config));
  }
  plugins.add(blockUnsafeOperationsPlugin(config.unsafe));
  plugins.add(completionDetectionPlugin(config.completion));
  config.abort && plugins.add(abortPlugin(config.abort));
  config.progress && plugins.add(progressMonitorPlugin(config.progress));
  config.timeout && plugins.add(timeoutPlugin(config.timeout));
  config.spawnOptions && plugins.add(spawnOptionsPlugin(config.spawnOptions));
  plugins.add(suffixPathsPlugin());
  plugins.add(errorDetectionPlugin(errorDetectionHandler(true)));
  config.errors && plugins.add(errorDetectionPlugin(config.errors));
  customBinaryPlugin(plugins, config.binary, config.unsafe?.allowUnsafeCustomBinary);
  return new Git(config, plugins);
}
init_git_response_error();
var esm_default = gitInstanceFactory;
const execFileAsync$1 = promisify(execFile);
async function getSimpleGitWithShellPath(repoPath) {
  const git2 = repoPath ? esm_default(repoPath) : esm_default();
  git2.env(await getProcessEnvWithShellPath());
  return git2;
}
async function execGitWithShellPath(args2, options) {
  const env2 = await getProcessEnvWithShellPath(
    options?.env ? { ...process.env, ...options.env } : process.env
  );
  return execFileAsync$1("git", args2, {
    ...options,
    encoding: "utf8",
    env: env2
  });
}
function parseUpstreamRef(upstreamRef) {
  const separatorIndex = upstreamRef.indexOf("/");
  if (separatorIndex <= 0 || separatorIndex === upstreamRef.length - 1) {
    return null;
  }
  return {
    remoteName: upstreamRef.slice(0, separatorIndex),
    branchName: upstreamRef.slice(separatorIndex + 1)
  };
}
function resolveTrackingRemoteName(upstreamRef, fallback = "origin") {
  if (!upstreamRef) {
    return fallback;
  }
  return parseUpstreamRef(upstreamRef.trim())?.remoteName ?? fallback;
}
const execFileAsync = promisify(execFile);
class NotGitRepoError extends Error {
  constructor(repoPath) {
    super(`Not a git repository: ${repoPath}`);
    this.name = "NotGitRepoError";
  }
}
function isExecFileException(error2) {
  return error2 instanceof Error && ("code" in error2 || "signal" in error2 || "killed" in error2);
}
async function isWorktreeRegistered({
  mainRepoPath,
  worktreePath
}) {
  try {
    const { stdout } = await execGitWithShellPath(
      ["-C", mainRepoPath, "worktree", "list", "--porcelain"],
      { timeout: 1e4 }
    );
    const expectedPath = resolve(worktreePath);
    for (const line of stdout.split("\n")) {
      if (!line.startsWith("worktree ")) {
        continue;
      }
      const listedPath = line.slice("worktree ".length).trim();
      if (resolve(listedPath) === expectedPath) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}
async function execWorktreeAdd({
  mainRepoPath,
  args: args2,
  worktreePath,
  timeout = 12e4
}) {
  await runWithPostCheckoutHookTolerance({
    context: `Worktree created at ${worktreePath}`,
    run: async () => {
      await execGitWithShellPath(args2, { timeout });
    },
    didSucceed: async () => isWorktreeRegistered({ mainRepoPath, worktreePath })
  });
}
async function checkoutBranchWithHookTolerance({
  repoPath,
  targetBranch,
  run
}) {
  await runWithPostCheckoutHookTolerance({
    context: `Switched branch to "${targetBranch}" in ${repoPath}`,
    run,
    didSucceed: async () => {
      const current = await getCurrentBranch(repoPath);
      return current === targetBranch;
    }
  });
}
async function getGitEnv() {
  return getProcessEnvWithShellPath();
}
async function getStatusNoLock(repoPath) {
  const env2 = await getGitEnv();
  try {
    const { stdout } = await execGitWithShellPath(
      [
        "--no-optional-locks",
        "-C",
        repoPath,
        "status",
        "--porcelain=v1",
        "-b",
        "-z",
        "-uall"
      ],
      { env: env2, timeout: 3e4, maxBuffer: 10 * 1024 * 1024 }
    );
    return parsePortelainStatus(stdout);
  } catch (error2) {
    if (isExecFileException(error2)) {
      if (error2.code === "ENOENT") {
        throw new Error("Git is not installed or not found in PATH");
      }
      const stderr = error2.stderr || error2.message || "";
      if (stderr.includes("not a git repository")) {
        throw new NotGitRepoError(repoPath);
      }
    }
    throw new Error(
      `Failed to get git status: ${error2 instanceof Error ? error2.message : String(error2)}`
    );
  }
}
function parsePortelainStatus(stdout) {
  const entries = stdout.split("\0").filter(Boolean);
  let current = null;
  let tracking = null;
  let isDetached = false;
  const files = [];
  const stagedSet = /* @__PURE__ */ new Set();
  const modifiedSet = /* @__PURE__ */ new Set();
  const deletedSet = /* @__PURE__ */ new Set();
  const createdSet = /* @__PURE__ */ new Set();
  const renamed = [];
  const conflictedSet = /* @__PURE__ */ new Set();
  const notAddedSet = /* @__PURE__ */ new Set();
  let i = 0;
  while (i < entries.length) {
    const entry = entries[i];
    if (!entry) {
      i++;
      continue;
    }
    if (entry.startsWith("## ")) {
      const branchInfo = entry.slice(3);
      if (branchInfo.startsWith("HEAD (no branch)") || branchInfo === "HEAD") {
        isDetached = true;
        current = "HEAD";
      } else if (
        // Handle empty repo: "No commits yet on BRANCH" or "Initial commit on BRANCH"
        branchInfo.startsWith("No commits yet on ") || branchInfo.startsWith("Initial commit on ")
      ) {
        const parts = branchInfo.split(" ");
        current = parts[parts.length - 1] || null;
      } else {
        const trackingMatch = branchInfo.match(/^(.+?)\.\.\.(.+?)(?:\s|$)/);
        if (trackingMatch) {
          current = trackingMatch[1];
          tracking = trackingMatch[2].split(" ")[0] || null;
        } else {
          current = branchInfo.split(" ")[0] || null;
        }
      }
      i++;
      continue;
    }
    if (entry.length < 3) {
      i++;
      continue;
    }
    const indexStatus = entry[0];
    const workingStatus = entry[1];
    const path = entry.slice(3);
    let from;
    if (indexStatus === "R" || indexStatus === "C") {
      i++;
      from = entries[i];
      renamed.push({ from: from || path, to: path });
    }
    files.push({
      path,
      from: from ?? path,
      index: indexStatus,
      working_dir: workingStatus
    });
    if (indexStatus === "?" && workingStatus === "?") {
      notAddedSet.add(path);
    } else {
      if (indexStatus === "A") createdSet.add(path);
      else if (indexStatus === "M") {
        stagedSet.add(path);
        modifiedSet.add(path);
      } else if (indexStatus === "D") {
        stagedSet.add(path);
        deletedSet.add(path);
      } else if (indexStatus === "R" || indexStatus === "C")
        stagedSet.add(path);
      else if (indexStatus === "U") conflictedSet.add(path);
      else if (indexStatus !== " " && indexStatus !== "?") stagedSet.add(path);
      if (workingStatus === "M") modifiedSet.add(path);
      else if (workingStatus === "D") deletedSet.add(path);
      else if (workingStatus === "U") conflictedSet.add(path);
    }
    i++;
  }
  return {
    not_added: [...notAddedSet],
    conflicted: [...conflictedSet],
    created: [...createdSet],
    deleted: [...deletedSet],
    ignored: void 0,
    modified: [...modifiedSet],
    renamed,
    files,
    staged: [...stagedSet],
    ahead: 0,
    behind: 0,
    current,
    tracking,
    detached: isDetached,
    isClean: () => files.length === 0 || files.every((f) => f.index === "?" && f.working_dir === "?")
  };
}
const MAX_ATTEMPTS = 10;
const FALLBACK_MAX_SUFFIX = 100;
async function getGitAuthorName(repoPath) {
  try {
    const git2 = await getSimpleGitWithShellPath(repoPath);
    const name = await git2.getConfig("user.name");
    return name.value?.trim() || null;
  } catch (error2) {
    console.warn("[git/getGitAuthorName] Failed to read git user.name:", error2);
    return null;
  }
}
let cachedGitHubUsername = null;
const GITHUB_USERNAME_CACHE_TTL = 5 * 60 * 1e3;
async function getGitHubUsername(_repoPath) {
  if (cachedGitHubUsername && Date.now() - cachedGitHubUsername.timestamp < GITHUB_USERNAME_CACHE_TTL) {
    return cachedGitHubUsername.value;
  }
  const env2 = await getGitEnv();
  try {
    const { stdout } = await execFileAsync(
      "gh",
      ["api", "user", "--jq", ".login"],
      { env: env2, timeout: 1e4 }
    );
    const value = stdout.trim() || null;
    cachedGitHubUsername = { value, timestamp: Date.now() };
    return value;
  } catch (error2) {
    console.warn(
      "[git/getGitHubUsername] Failed to get GitHub username:",
      error2 instanceof Error ? error2.message : String(error2)
    );
    cachedGitHubUsername = { value: null, timestamp: Date.now() };
    return null;
  }
}
async function getAuthorPrefix(repoPath) {
  const githubUsername = await getGitHubUsername();
  if (githubUsername) {
    return githubUsername;
  }
  const gitAuthorName = await getGitAuthorName(repoPath);
  if (gitAuthorName) {
    return gitAuthorName;
  }
  return null;
}
async function getBranchPrefix({
  repoPath,
  mode: mode2,
  customPrefix
}) {
  switch (mode2) {
    case "none":
      return null;
    case "custom":
      return customPrefix || null;
    case "author": {
      const authorName = await getGitAuthorName(repoPath);
      if (authorName) {
        return sanitizeAuthorPrefix(authorName);
      }
      return null;
    }
    default:
      return getAuthorPrefix(repoPath);
  }
}
function generateBranchName({
  existingBranches = [],
  authorPrefix
} = {}) {
  const predicates2 = friendlyWords.predicates;
  const objects2 = friendlyWords.objects;
  const existingSet = new Set(existingBranches.map((b) => b.toLowerCase()));
  const prefixWouldCollide = authorPrefix && existingSet.has(authorPrefix.toLowerCase());
  const safePrefix = prefixWouldCollide ? void 0 : authorPrefix;
  const addPrefix = (name) => {
    if (safePrefix) {
      return `${safePrefix}/${name}`;
    }
    return name;
  };
  const randomTwoWord = () => {
    const predicate = predicates2[Math.floor(Math.random() * predicates2.length)];
    const object = objects2[Math.floor(Math.random() * objects2.length)];
    return `${predicate}-${object}`;
  };
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const candidate = addPrefix(randomTwoWord());
    if (!existingSet.has(candidate.toLowerCase())) {
      return candidate;
    }
  }
  const baseWord = randomTwoWord();
  for (let n = 0; n < FALLBACK_MAX_SUFFIX; n++) {
    const candidate = addPrefix(`${baseWord}-${n}`);
    if (!existingSet.has(candidate.toLowerCase())) {
      return candidate;
    }
  }
  return addPrefix(`${baseWord}-${Date.now()}`);
}
async function createWorktree(mainRepoPath, branch, worktreePath, startPoint = "origin/main") {
  try {
    const parentDir = join(worktreePath, "..");
    await mkdir(parentDir, { recursive: true });
    await execWorktreeAdd({
      mainRepoPath,
      args: [
        "-C",
        mainRepoPath,
        "worktree",
        "add",
        worktreePath,
        "-b",
        branch,
        // Append ^{commit} to force Git to treat the startPoint as a commit,
        // not a branch ref. This prevents implicit upstream tracking when
        // creating a new branch from a remote branch like origin/main.
        `${startPoint}^{commit}`
      ],
      worktreePath
    });
    await execGitWithShellPath(
      ["-C", worktreePath, "config", "--local", "push.autoSetupRemote", "true"],
      { timeout: 1e4 }
    );
    console.log(
      `Created worktree at ${worktreePath} with branch ${branch} from ${startPoint}`
    );
  } catch (error2) {
    const errorMessage = error2 instanceof Error ? error2.message : String(error2);
    const lowerError = errorMessage.toLowerCase();
    const isLockError = lowerError.includes("could not lock") || lowerError.includes("unable to lock") || lowerError.includes(".lock") && lowerError.includes("file exists");
    if (isLockError) {
      console.error(
        `Git lock file error during worktree creation: ${errorMessage}`
      );
      throw new Error(
        `Failed to create worktree: The git repository is locked by another process. This usually happens when another git operation is in progress, or a previous operation crashed. Please wait for the other operation to complete, or manually remove the lock file (e.g., .git/config.lock or .git/index.lock) if you're sure no git operations are running.`
      );
    }
    console.error(`Failed to create worktree: ${errorMessage}`);
    throw new Error(`Failed to create worktree: ${errorMessage}`);
  }
}
async function createWorktreeFromExistingBranch({
  mainRepoPath,
  branch,
  worktreePath
}) {
  try {
    const parentDir = join(worktreePath, "..");
    await mkdir(parentDir, { recursive: true });
    const git2 = await getSimpleGitWithShellPath(mainRepoPath);
    const localBranches = await git2.branchLocal();
    const branchExistsLocally = localBranches.all.includes(branch);
    if (branchExistsLocally) {
      await execWorktreeAdd({
        mainRepoPath,
        args: ["-C", mainRepoPath, "worktree", "add", worktreePath, branch],
        worktreePath
      });
    } else {
      const remoteBranches = await git2.branch(["-r"]);
      const remoteBranchName = `origin/${branch}`;
      if (remoteBranches.all.includes(remoteBranchName)) {
        await execWorktreeAdd({
          mainRepoPath,
          args: [
            "-C",
            mainRepoPath,
            "worktree",
            "add",
            "--track",
            "-b",
            branch,
            worktreePath,
            remoteBranchName
          ],
          worktreePath
        });
      } else {
        throw new Error(
          `Branch "${branch}" does not exist locally or on remote`
        );
      }
    }
    await execGitWithShellPath(
      ["-C", worktreePath, "config", "--local", "push.autoSetupRemote", "true"],
      { timeout: 1e4 }
    );
    console.log(
      `Created worktree at ${worktreePath} using existing branch ${branch}`
    );
  } catch (error2) {
    const errorMessage = error2 instanceof Error ? error2.message : String(error2);
    const lowerError = errorMessage.toLowerCase();
    const isLockError = lowerError.includes("could not lock") || lowerError.includes("unable to lock") || lowerError.includes(".lock") && lowerError.includes("file exists");
    if (isLockError) {
      console.error(
        `Git lock file error during worktree creation: ${errorMessage}`
      );
      throw new Error(
        `Failed to create worktree: The git repository is locked by another process. This usually happens when another git operation is in progress, or a previous operation crashed. Please wait for the other operation to complete, or manually remove the lock file (e.g., .git/config.lock or .git/index.lock) if you're sure no git operations are running.`
      );
    }
    if (lowerError.includes("already checked out") || lowerError.includes("is already used by worktree")) {
      throw new Error(
        `Branch "${branch}" is already checked out in another worktree. Each branch can only be checked out in one worktree at a time.`
      );
    }
    console.error(`Failed to create worktree: ${errorMessage}`);
    throw new Error(`Failed to create worktree: ${errorMessage}`);
  }
}
async function deleteLocalBranch({
  mainRepoPath,
  branch
}) {
  try {
    await execGitWithShellPath(["-C", mainRepoPath, "branch", "-D", branch], {
      timeout: 1e4
    });
    console.log(`[workspace/delete] Deleted local branch "${branch}"`);
  } catch (error2) {
    const errorMessage = error2 instanceof Error ? error2.message : String(error2);
    console.error(
      `[workspace/delete] Failed to delete local branch "${branch}": ${errorMessage}`
    );
    throw new Error(
      `Failed to delete local branch "${branch}": ${errorMessage}`
    );
  }
}
async function removeWorktree(mainRepoPath, worktreePath) {
  try {
    const tempPath = join(
      dirname(worktreePath),
      `.amoena-delete-${randomUUID()}`
    );
    await rename(worktreePath, tempPath);
    await execGitWithShellPath(["-C", mainRepoPath, "worktree", "prune"], {
      timeout: 1e4
    });
    const child = spawn$1("/bin/rm", ["-rf", tempPath], {
      detached: true,
      stdio: "ignore"
    });
    child.unref();
    child.on("error", (err) => {
      console.error(
        `[removeWorktree] Failed to spawn rm for ${tempPath}:`,
        err.message
      );
    });
    child.on("exit", (code) => {
      if (code !== 0) {
        console.error(
          `[removeWorktree] Background cleanup of ${tempPath} failed (exit ${code})`
        );
      }
    });
  } catch (error2) {
    const code = error2.code;
    if (code === "ENOENT") {
      try {
        await execGitWithShellPath(["-C", mainRepoPath, "worktree", "prune"], {
          timeout: 1e4
        });
      } catch {
      }
      return;
    }
    const errorMessage = error2 instanceof Error ? error2.message : String(error2);
    console.error(`Failed to remove worktree: ${errorMessage}`);
    throw new Error(`Failed to remove worktree: ${errorMessage}`);
  }
}
async function getGitRoot(path) {
  try {
    const git2 = await getSimpleGitWithShellPath(path);
    const root = await git2.revparse(["--show-toplevel"]);
    return root.trim();
  } catch (error2) {
    const message = error2 instanceof Error ? error2.message : String(error2);
    if (message.toLowerCase().includes("not a git repository")) {
      throw new NotGitRepoError(path);
    }
    throw error2;
  }
}
async function worktreeExists(mainRepoPath, worktreePath) {
  try {
    const git2 = await getSimpleGitWithShellPath(mainRepoPath);
    const worktrees = await git2.raw(["worktree", "list", "--porcelain"]);
    const lines = worktrees.split("\n");
    const worktreePrefix = `worktree ${worktreePath}`;
    return lines.some((line) => line.trim() === worktreePrefix);
  } catch (error2) {
    console.error(`Failed to check worktree existence: ${error2}`);
    throw error2;
  }
}
async function listExternalWorktrees(mainRepoPath) {
  try {
    const git2 = await getSimpleGitWithShellPath(mainRepoPath);
    const output = await git2.raw(["worktree", "list", "--porcelain"]);
    const result = [];
    let current = {};
    for (const line of output.split("\n")) {
      if (line.startsWith("worktree ")) {
        if (current.path) {
          result.push({
            path: current.path,
            branch: current.branch ?? null,
            isDetached: current.isDetached ?? false,
            isBare: current.isBare ?? false
          });
        }
        current = { path: line.slice("worktree ".length) };
      } else if (line.startsWith("branch refs/heads/")) {
        current.branch = line.slice("branch refs/heads/".length);
      } else if (line === "detached") {
        current.isDetached = true;
      } else if (line === "bare") {
        current.isBare = true;
      }
    }
    if (current.path) {
      result.push({
        path: current.path,
        branch: current.branch ?? null,
        isDetached: current.isDetached ?? false,
        isBare: current.isBare ?? false
      });
    }
    return result;
  } catch (error2) {
    console.error(`Failed to list external worktrees: ${error2}`);
    throw error2;
  }
}
async function getBranchWorktreePath({
  mainRepoPath,
  branch
}) {
  try {
    const git2 = await getSimpleGitWithShellPath(mainRepoPath);
    const worktreesOutput = await git2.raw(["worktree", "list", "--porcelain"]);
    const lines = worktreesOutput.split("\n");
    let currentWorktreePath = null;
    for (const line of lines) {
      if (line.startsWith("worktree ")) {
        currentWorktreePath = line.slice("worktree ".length);
      } else if (line.startsWith("branch refs/heads/")) {
        const branchName = line.slice("branch refs/heads/".length);
        if (branchName === branch && currentWorktreePath) {
          return currentWorktreePath;
        }
        currentWorktreePath = null;
      }
    }
    return null;
  } catch (error2) {
    console.error(`Failed to check branch worktree: ${error2}`);
    throw error2;
  }
}
async function hasOriginRemote(mainRepoPath) {
  try {
    const git2 = await getSimpleGitWithShellPath(mainRepoPath);
    const remotes = await git2.getRemotes();
    return remotes.some((r) => r.name === "origin");
  } catch {
    return false;
  }
}
async function getDefaultBranch(mainRepoPath) {
  const git2 = await getSimpleGitWithShellPath(mainRepoPath);
  const hasRemote = await hasOriginRemote(mainRepoPath);
  if (hasRemote) {
    try {
      const headRef = await git2.raw([
        "symbolic-ref",
        "refs/remotes/origin/HEAD"
      ]);
      const match = headRef.trim().match(/refs\/remotes\/origin\/(.+)/);
      if (match) return match[1];
    } catch {
    }
    try {
      const branches = await git2.branch(["-r"]);
      const remoteBranches = branches.all.map((b) => b.replace("origin/", ""));
      for (const candidate of ["main", "master", "develop", "trunk"]) {
        if (remoteBranches.includes(candidate)) {
          return candidate;
        }
      }
    } catch {
    }
    try {
      const result = await git2.raw(["ls-remote", "--symref", "origin", "HEAD"]);
      const symrefMatch = result.match(/ref:\s+refs\/heads\/(.+?)\tHEAD/);
      if (symrefMatch) {
        return symrefMatch[1];
      }
    } catch {
    }
  } else {
    try {
      const currentBranch = await getCurrentBranch(mainRepoPath);
      if (currentBranch) {
        return currentBranch;
      }
    } catch {
    }
    try {
      const localBranches = await git2.branchLocal();
      for (const candidate of ["main", "master", "develop", "trunk"]) {
        if (localBranches.all.includes(candidate)) {
          return candidate;
        }
      }
      if (localBranches.all.length > 0) {
        return localBranches.all[0];
      }
    } catch {
    }
  }
  return "main";
}
async function fetchDefaultBranch(mainRepoPath, defaultBranch) {
  const git2 = await getSimpleGitWithShellPath(mainRepoPath);
  await git2.fetch("origin", defaultBranch);
  const commit = await git2.revparse(`origin/${defaultBranch}`);
  return commit.trim();
}
async function refreshDefaultBranch(mainRepoPath) {
  const git2 = await getSimpleGitWithShellPath(mainRepoPath);
  const hasRemote = await hasOriginRemote(mainRepoPath);
  if (!hasRemote) {
    return null;
  }
  try {
    await git2.remote(["set-head", "origin", "--auto"]);
    const headRef = await git2.raw(["symbolic-ref", "refs/remotes/origin/HEAD"]);
    const match = headRef.trim().match(/refs\/remotes\/origin\/(.+)/);
    if (match) {
      return match[1];
    }
  } catch {
    try {
      const result = await git2.raw(["ls-remote", "--symref", "origin", "HEAD"]);
      const symrefMatch = result.match(/ref:\s+refs\/heads\/(.+?)\tHEAD/);
      if (symrefMatch) {
        return symrefMatch[1];
      }
    } catch {
    }
  }
  return null;
}
async function checkNeedsRebase(worktreePath, defaultBranch) {
  const git2 = await getSimpleGitWithShellPath(worktreePath);
  const behindCount = await git2.raw([
    "rev-list",
    "--count",
    `HEAD..origin/${defaultBranch}`
  ]);
  return Number.parseInt(behindCount.trim(), 10) > 0;
}
async function getAheadBehindCount({
  repoPath,
  defaultBranch
}) {
  const git2 = await getSimpleGitWithShellPath(repoPath);
  try {
    const output = await git2.raw([
      "rev-list",
      "--left-right",
      "--count",
      `origin/${defaultBranch}...HEAD`
    ]);
    const [behindStr, aheadStr] = output.trim().split(/\s+/);
    return {
      ahead: Number.parseInt(aheadStr || "0", 10),
      behind: Number.parseInt(behindStr || "0", 10)
    };
  } catch {
    return { ahead: 0, behind: 0 };
  }
}
async function hasUncommittedChanges(worktreePath) {
  const status = await getStatusNoLock(worktreePath);
  return !status.isClean();
}
async function hasUnpushedCommits(worktreePath) {
  const git2 = await getSimpleGitWithShellPath(worktreePath);
  try {
    const aheadCount = await git2.raw([
      "rev-list",
      "--count",
      "@{upstream}..HEAD"
    ]);
    return Number.parseInt(aheadCount.trim(), 10) > 0;
  } catch {
    try {
      const defaultBranch = await getDefaultBranch(worktreePath);
      const unmergedPatches = await git2.raw([
        "log",
        "--cherry-pick",
        "--right-only",
        "--no-merges",
        "--oneline",
        `origin/${defaultBranch}...HEAD`
      ]);
      if (unmergedPatches.trim() === "") {
        return false;
      }
    } catch (error2) {
      console.warn(
        "[git/hasUnpushedCommits] Cherry-pick fallback failed; falling back to remote reachability check.",
        {
          worktreePath,
          error: error2 instanceof Error ? error2.message : String(error2)
        }
      );
    }
    try {
      const localCommits = await git2.raw([
        "rev-list",
        "--count",
        "HEAD",
        "--not",
        "--remotes"
      ]);
      return Number.parseInt(localCommits.trim(), 10) > 0;
    } catch {
      return false;
    }
  }
}
const GIT_EXIT_CODES = {
  NO_MATCHING_REFS: 2
};
const GIT_ERROR_PATTERNS = {
  network: [
    "could not resolve host",
    "unable to access",
    "connection refused",
    "network is unreachable",
    "timed out",
    "ssl",
    "could not read from remote"
  ],
  auth: [
    "authentication",
    "permission denied",
    "403",
    "401",
    // SSH-specific auth failures
    "permission denied (publickey)",
    "host key verification failed"
  ],
  remoteNotConfigured: [
    "does not appear to be a git repository",
    "no such remote",
    "repository not found",
    "remote not found",
    "remote origin not found"
  ]
};
function categorizeGitError(errorMessage, remoteName) {
  const lowerMessage = errorMessage.toLowerCase();
  if (GIT_ERROR_PATTERNS.network.some((p) => lowerMessage.includes(p))) {
    return {
      status: "error",
      message: "Cannot connect to remote. Check your network connection."
    };
  }
  if (GIT_ERROR_PATTERNS.auth.some((p) => lowerMessage.includes(p))) {
    return {
      status: "error",
      message: "Authentication failed. Check your Git credentials."
    };
  }
  if (GIT_ERROR_PATTERNS.remoteNotConfigured.some((p) => lowerMessage.includes(p))) {
    return {
      status: "error",
      message: `Remote '${remoteName}' is not configured or the repository was not found.`
    };
  }
  return {
    status: "error",
    message: `Failed to verify branch: ${errorMessage}`
  };
}
async function branchExistsOnRemote(worktreePath, branchName, remoteName = "origin") {
  const env2 = await getGitEnv();
  try {
    await execGitWithShellPath(
      [
        "-C",
        worktreePath,
        "ls-remote",
        "--exit-code",
        "--heads",
        remoteName,
        branchName
      ],
      { env: env2, timeout: 3e4 }
    );
    return { status: "exists" };
  } catch (error2) {
    if (!isExecFileException(error2)) {
      return {
        status: "error",
        message: `Unexpected error: ${error2 instanceof Error ? error2.message : String(error2)}`
      };
    }
    if (typeof error2.code === "string") {
      if (error2.code === "ENOENT") {
        return {
          status: "error",
          message: "Git is not installed or not found in PATH."
        };
      }
      if (error2.code === "ETIMEDOUT") {
        return {
          status: "error",
          message: "Git command timed out. Check your network connection."
        };
      }
      return {
        status: "error",
        message: `System error: ${error2.code}`
      };
    }
    if (error2.killed || error2.signal) {
      return {
        status: "error",
        message: "Git command timed out. Check your network connection."
      };
    }
    if (error2.code === GIT_EXIT_CODES.NO_MATCHING_REFS) {
      return { status: "not_found" };
    }
    const errorText = error2.stderr || error2.message || "";
    return categorizeGitError(errorText, remoteName);
  }
}
async function getTrackingRemoteNameForWorktree(worktreePath) {
  try {
    const { stdout } = await execGitWithShellPath(
      ["rev-parse", "--abbrev-ref", "@{upstream}"],
      { cwd: worktreePath }
    );
    return resolveTrackingRemoteName(stdout);
  } catch {
    return "origin";
  }
}
async function detectBaseBranch(worktreePath, currentBranch, defaultBranch) {
  const git2 = await getSimpleGitWithShellPath(worktreePath);
  const candidates = [
    defaultBranch,
    "main",
    "master",
    "develop",
    "development"
  ].filter((b, i, arr) => arr.indexOf(b) === i);
  let bestCandidate = null;
  let bestAheadCount = Number.POSITIVE_INFINITY;
  for (const candidate of candidates) {
    if (candidate === currentBranch) continue;
    try {
      const remoteBranch = `origin/${candidate}`;
      await git2.raw(["rev-parse", "--verify", remoteBranch]);
      const mergeBase = await git2.raw(["merge-base", "HEAD", remoteBranch]);
      const aheadCount = await git2.raw([
        "rev-list",
        "--count",
        `${mergeBase.trim()}..HEAD`
      ]);
      const count = Number.parseInt(aheadCount.trim(), 10);
      if (count < bestAheadCount) {
        bestAheadCount = count;
        bestCandidate = candidate;
      }
    } catch {
    }
  }
  return bestCandidate;
}
async function listBranches(repoPath, options) {
  const git2 = await getSimpleGitWithShellPath(repoPath);
  if (options?.fetch) {
    try {
      await git2.fetch(["--prune"]);
    } catch {
    }
  }
  const localResult = await git2.branchLocal();
  const local = localResult.all;
  const remoteResult = await git2.branch(["-r"]);
  const remote = remoteResult.all.filter((b) => b.startsWith("origin/") && !b.includes("->")).map((b) => b.replace("origin/", ""));
  return { local, remote };
}
async function getCurrentBranch(repoPath) {
  const git2 = await getSimpleGitWithShellPath(repoPath);
  try {
    const branch = await git2.revparse(["--abbrev-ref", "HEAD"]);
    const trimmed2 = branch.trim();
    if (trimmed2 && trimmed2 !== "HEAD") {
      return trimmed2;
    }
  } catch {
  }
  try {
    const branch = await git2.raw(["symbolic-ref", "--short", "HEAD"]);
    const trimmed2 = branch.trim();
    return trimmed2 || null;
  } catch {
    return null;
  }
}
async function checkBranchCheckoutSafety(repoPath) {
  try {
    const status = await getStatusNoLock(repoPath);
    const hasUncommittedChanges2 = status.staged.length > 0 || status.modified.length > 0 || status.deleted.length > 0 || status.created.length > 0 || status.renamed.length > 0 || status.conflicted.length > 0;
    const hasUntrackedFiles = status.not_added.length > 0;
    if (hasUncommittedChanges2) {
      return {
        safe: false,
        error: "Cannot switch branches: you have uncommitted changes. Please commit or stash your changes first.",
        hasUncommittedChanges: true,
        hasUntrackedFiles
      };
    }
    if (hasUntrackedFiles) {
      return {
        safe: false,
        error: "Cannot switch branches: you have untracked files that may be overwritten. Please commit, stash, or remove them first.",
        hasUncommittedChanges: false,
        hasUntrackedFiles: true
      };
    }
    try {
      const git2 = await getSimpleGitWithShellPath(repoPath);
      await git2.fetch(["--prune"]);
    } catch {
    }
    return {
      safe: true,
      hasUncommittedChanges: false,
      hasUntrackedFiles: false
    };
  } catch (error2) {
    return {
      safe: false,
      error: `Failed to check repository status: ${error2 instanceof Error ? error2.message : String(error2)}`
    };
  }
}
async function checkoutBranch(repoPath, branch) {
  const git2 = await getSimpleGitWithShellPath(repoPath);
  const localBranches = await git2.branchLocal();
  if (localBranches.all.includes(branch)) {
    await checkoutBranchWithHookTolerance({
      repoPath,
      targetBranch: branch,
      run: async () => {
        await git2.checkout(branch);
      }
    });
    return;
  }
  const remoteBranches = await git2.branch(["-r"]);
  const remoteBranchName = `origin/${branch}`;
  if (remoteBranches.all.includes(remoteBranchName)) {
    await checkoutBranchWithHookTolerance({
      repoPath,
      targetBranch: branch,
      run: async () => {
        await git2.checkout(["-b", branch, "--track", remoteBranchName]);
      }
    });
    return;
  }
  await checkoutBranchWithHookTolerance({
    repoPath,
    targetBranch: branch,
    run: async () => {
      await git2.checkout(branch);
    }
  });
}
async function refExistsLocally(repoPath, ref) {
  const git2 = await getSimpleGitWithShellPath(repoPath);
  try {
    await git2.raw(["rev-parse", "--verify", "--quiet", `${ref}^{commit}`]);
    return true;
  } catch {
    return false;
  }
}
function sanitizeGitError(message) {
  return message.replace(/^fatal:\s*/i, "").replace(/^error:\s*/i, "").replace(/\n+/g, " ").trim();
}
async function safeCheckoutBranch(repoPath, branch) {
  const currentBranch = await getCurrentBranch(repoPath);
  if (currentBranch === branch) {
    return;
  }
  const safety = await checkBranchCheckoutSafety(repoPath);
  if (!safety.safe) {
    throw new Error(safety.error);
  }
  await checkoutBranch(repoPath, branch);
  const verifyBranch = await getCurrentBranch(repoPath);
  if (verifyBranch !== branch) {
    throw new Error(
      `Branch checkout verification failed: expected "${branch}" but HEAD is on "${verifyBranch ?? "detached HEAD"}"`
    );
  }
}
function getPrLocalBranchName(prInfo) {
  if (prInfo.isCrossRepository) {
    const forkOwner = prInfo.headRepositoryOwner.login.toLowerCase();
    return `${forkOwner}/${prInfo.headRefName}`;
  }
  return prInfo.headRefName;
}
function parsePrUrl(url) {
  let normalizedUrl = url.trim();
  if (!normalizedUrl.startsWith("http")) {
    normalizedUrl = `https://${normalizedUrl}`;
  }
  try {
    const urlObj = new URL(normalizedUrl);
    if (!urlObj.hostname.includes("github.com")) {
      return null;
    }
    const match = urlObj.pathname.match(/^\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
    if (!match) {
      return null;
    }
    return {
      owner: match[1],
      repo: match[2],
      number: Number.parseInt(match[3], 10)
    };
  } catch {
    return null;
  }
}
async function getPrInfo({
  owner,
  repo,
  prNumber
}) {
  try {
    const { stdout } = await execWithShellEnv(
      "gh",
      [
        "pr",
        "view",
        String(prNumber),
        "--repo",
        `${owner}/${repo}`,
        "--json",
        "number,title,headRefName,headRepository,headRepositoryOwner,isCrossRepository"
      ],
      { timeout: 3e4 }
    );
    return JSON.parse(stdout);
  } catch (error2) {
    if (isExecFileException(error2)) {
      if (error2.code === "ENOENT") {
        throw new Error(
          "GitHub CLI (gh) is not installed. Please install it from https://cli.github.com/"
        );
      }
      const stderr = error2.stderr || error2.message || "";
      if (stderr.includes("not logged in")) {
        throw new Error(
          "Not logged in to GitHub CLI. Please run 'gh auth login' first."
        );
      }
      if (stderr.includes("Could not resolve") || stderr.includes("not found")) {
        throw new Error(`PR #${prNumber} not found in ${owner}/${repo}`);
      }
    }
    throw new Error(
      `Failed to fetch PR info: ${error2 instanceof Error ? error2.message : String(error2)}`
    );
  }
}
async function createWorktreeFromPr({
  mainRepoPath,
  worktreePath,
  prInfo,
  localBranchName
}) {
  try {
    const parentDir = join(worktreePath, "..");
    await mkdir(parentDir, { recursive: true });
    const git2 = await getSimpleGitWithShellPath(mainRepoPath);
    const localBranches = await git2.branchLocal();
    const branchExists = localBranches.all.includes(localBranchName);
    if (branchExists) {
      await execWorktreeAdd({
        mainRepoPath,
        args: [
          "-C",
          mainRepoPath,
          "worktree",
          "add",
          worktreePath,
          localBranchName
        ],
        worktreePath
      });
    } else {
      await execWorktreeAdd({
        mainRepoPath,
        args: ["-C", mainRepoPath, "worktree", "add", "--detach", worktreePath],
        worktreePath
      });
    }
    await execWithShellEnv(
      "gh",
      [
        "pr",
        "checkout",
        String(prInfo.number),
        "--branch",
        localBranchName,
        "--force"
      ],
      { cwd: worktreePath, timeout: 12e4 }
    );
    await execGitWithShellPath(
      ["-C", worktreePath, "config", "--local", "push.autoSetupRemote", "true"],
      { timeout: 1e4 }
    );
    console.log(
      `[git] Created worktree at ${worktreePath} for PR #${prInfo.number}`
    );
  } catch (error2) {
    const errorMessage = error2 instanceof Error ? error2.message : String(error2);
    const lowerError = errorMessage.toLowerCase();
    if (lowerError.includes("already checked out") || lowerError.includes("is already used by worktree")) {
      throw new Error(
        `This PR's branch is already checked out in another worktree.`
      );
    }
    throw new Error(`Failed to create worktree from PR: ${errorMessage}`);
  }
}
const git = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  NotGitRepoError,
  branchExistsOnRemote,
  checkBranchCheckoutSafety,
  checkNeedsRebase,
  checkoutBranch,
  createWorktree,
  createWorktreeFromExistingBranch,
  createWorktreeFromPr,
  deleteLocalBranch,
  detectBaseBranch,
  fetchDefaultBranch,
  generateBranchName,
  getAheadBehindCount,
  getAuthorPrefix,
  getBranchPrefix,
  getBranchWorktreePath,
  getCurrentBranch,
  getDefaultBranch,
  getGitAuthorName,
  getGitHubUsername,
  getGitRoot,
  getPrInfo,
  getPrLocalBranchName,
  getStatusNoLock,
  getTrackingRemoteNameForWorktree,
  hasOriginRemote,
  hasUncommittedChanges,
  hasUnpushedCommits,
  listBranches,
  listExternalWorktrees,
  parsePrUrl,
  refExistsLocally,
  refreshDefaultBranch,
  removeWorktree,
  safeCheckoutBranch,
  sanitizeAuthorPrefix,
  sanitizeBranchName,
  sanitizeBranchNameWithMaxLength,
  sanitizeGitError,
  worktreeExists
}, Symbol.toStringTag, { value: "Module" }));
function mapGitStatus(gitIndex, gitWorking) {
  if (gitIndex === "A" || gitWorking === "A") return "added";
  if (gitIndex === "D" || gitWorking === "D") return "deleted";
  if (gitIndex === "R") return "renamed";
  if (gitIndex === "C") return "copied";
  if (gitIndex === "?" || gitWorking === "?") return "untracked";
  return "modified";
}
function toChangedFile(path, gitIndex, gitWorking) {
  return {
    path,
    status: mapGitStatus(gitIndex, gitWorking),
    additions: 0,
    deletions: 0
  };
}
function parseGitStatus(status) {
  const staged = [];
  const unstaged = [];
  const untracked = [];
  for (const file of status.files) {
    const path = file.path;
    const index = file.index;
    const working = file.working_dir;
    if (index === "?" && working === "?") {
      untracked.push(toChangedFile(path, index, working));
      continue;
    }
    if (index && index !== " " && index !== "?") {
      staged.push({
        path,
        oldPath: file.path !== file.from ? file.from : void 0,
        status: mapGitStatus(index, " "),
        additions: 0,
        deletions: 0
      });
    }
    if (working && working !== " " && working !== "?") {
      unstaged.push({
        path,
        status: mapGitStatus(" ", working),
        additions: 0,
        deletions: 0
      });
    }
  }
  return {
    branch: status.current || "HEAD",
    staged,
    unstaged,
    untracked
  };
}
function parseGitLog(logOutput) {
  if (!logOutput.trim()) return [];
  const commits = [];
  const lines = logOutput.trim().split("\n");
  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.split("|");
    if (parts.length < 5) continue;
    const hash = parts[0]?.trim();
    const shortHash = parts[1]?.trim();
    const message = parts.slice(2, -2).join("|").trim();
    const author = parts[parts.length - 2]?.trim();
    const dateStr = parts[parts.length - 1]?.trim();
    if (!hash || !shortHash) continue;
    let date;
    if (dateStr) {
      const parsed = new Date(dateStr);
      date = Number.isNaN(parsed.getTime()) ? /* @__PURE__ */ new Date() : parsed;
    } else {
      date = /* @__PURE__ */ new Date();
    }
    commits.push({
      hash,
      shortHash,
      message: message || "",
      author: author || "",
      date,
      files: []
    });
  }
  return commits;
}
function parseDiffNumstat(numstatOutput) {
  const stats = /* @__PURE__ */ new Map();
  for (const line of numstatOutput.trim().split("\n")) {
    if (!line.trim()) continue;
    const [addStr, delStr, ...pathParts] = line.split("	");
    const rawPath = pathParts.join("	");
    if (!rawPath) continue;
    const additions = addStr === "-" ? 0 : Number.parseInt(addStr, 10) || 0;
    const deletions = delStr === "-" ? 0 : Number.parseInt(delStr, 10) || 0;
    const statEntry = { additions, deletions };
    const renameMatch = rawPath.match(/^(.+) => (.+)$/);
    if (renameMatch) {
      const oldPath = renameMatch[1];
      const newPath = renameMatch[2];
      stats.set(newPath, statEntry);
      stats.set(oldPath, statEntry);
    } else {
      stats.set(rawPath, statEntry);
    }
  }
  return stats;
}
function parseNameStatus(nameStatusOutput) {
  const files = [];
  for (const line of nameStatusOutput.trim().split("\n")) {
    if (!line.trim()) continue;
    const parts = line.split("	");
    const statusCode = parts[0];
    if (!statusCode) continue;
    const isRenameOrCopy = statusCode.startsWith("R") || statusCode.startsWith("C");
    const path = isRenameOrCopy ? parts[2] : parts[1];
    const oldPath = isRenameOrCopy ? parts[1] : void 0;
    if (!path) continue;
    let status;
    switch (statusCode[0]) {
      case "A":
        status = "added";
        break;
      case "D":
        status = "deleted";
        break;
      case "R":
        status = "renamed";
        break;
      case "C":
        status = "copied";
        break;
      default:
        status = "modified";
    }
    files.push({
      path,
      oldPath,
      status,
      additions: 0,
      deletions: 0
    });
  }
  return files;
}
export {
  fetchDefaultBranch as A,
  createWorktree as B,
  parsePrUrl as C,
  getPrInfo as D,
  getPrLocalBranchName as E,
  safeCheckoutBranch as F,
  getBranchWorktreePath as G,
  listBranches as H,
  sanitizeBranchNameWithMaxLength as I,
  generateBranchName as J,
  createWorktreeFromPr as K,
  hasUncommittedChanges as L,
  hasUnpushedCommits as M,
  NotGitRepoError as N,
  deleteLocalBranch as O,
  getAheadBehindCount as P,
  deduplicateBranchName as Q,
  applyShellEnvToProcess as R,
  parseDiffNumstat as S,
  parseNameStatus as T,
  getStatusNoLock as U,
  parseGitLog as V,
  git as W,
  getSimpleGitWithShellPath as a,
  runWithPostCheckoutHookTolerance as b,
  getCurrentBranch as c,
  execGitWithShellPath as d,
  execWithShellEnv as e,
  branchExistsOnRemote as f,
  getProcessEnvWithShellPath as g,
  resolveTrackingRemoteName as h,
  parseGitStatus as i,
  requireMs as j,
  getGitAuthorName as k,
  refreshDefaultBranch as l,
  getDefaultBranch as m,
  getGitRoot as n,
  getGitHubUsername as o,
  parseUpstreamRef as p,
  getBranchPrefix as q,
  requireSrc$1 as r,
  sanitizeAuthorPrefix as s,
  listExternalWorktrees as t,
  createWorktreeFromExistingBranch as u,
  removeWorktree as v,
  worktreeExists as w,
  hasOriginRemote as x,
  refExistsLocally as y,
  sanitizeGitError as z
};
//# sourceMappingURL=parse-status-8uMFNboz.js.map
