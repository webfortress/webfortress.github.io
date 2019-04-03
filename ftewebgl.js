var Module = typeof Module !== "undefined" ? Module : {};
{
    if (!Module["arguments"])
        Module["arguments"] = ["-nohome"];
    var man = window.location.protocol + "//" + window.location.host + window.location.pathname + ".fmf";
    if (window.location.hash != "")
        man = window.location.hash.substring(1);
    Module["arguments"] = Module["arguments"].concat(["-manifest", man]);
    qstring = decodeURIComponent(window.location.search.substring(1)).split(" ");
    for (var i = 0; i < qstring.length; i++) {
        if ((qstring[i] == "+sv_port_rtc" || qstring[i] == "+connect" || qstring[i] == "+join" || qstring[i] == "+observe" || qstring[i] == "+qtvplay" || qstring[i] == "+name" || qstring[i] == "+set") && i + 1 < qstring.length) {
            Module["arguments"] = Module["arguments"].concat(qstring[i + 0], qstring[i + 1]);
            i++
        } else if (!document.referrer)
            Module["arguments"] = Module["arguments"].concat(qstring[i])
    }
}
var moduleOverrides = {};
var key;
for (key in Module) {
    if (Module.hasOwnProperty(key)) {
        moduleOverrides[key] = Module[key]
    }
}
Module["arguments"] = [];
Module["thisProgram"] = "./this.program";
Module["quit"] = (function(status, toThrow) {
    throw toThrow
}
);
Module["preRun"] = [];
Module["postRun"] = [];
var ENVIRONMENT_IS_WEB = false;
var ENVIRONMENT_IS_WORKER = false;
var ENVIRONMENT_IS_NODE = false;
var ENVIRONMENT_IS_SHELL = false;
ENVIRONMENT_IS_WEB = typeof window === "object";
ENVIRONMENT_IS_WORKER = typeof importScripts === "function";
ENVIRONMENT_IS_NODE = typeof process === "object" && typeof require === "function" && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER;
ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
var scriptDirectory = "";
function locateFile(path) {
    if (Module["locateFile"]) {
        return Module["locateFile"](path, scriptDirectory)
    } else {
        return scriptDirectory + path
    }
}
if (ENVIRONMENT_IS_NODE) {
    scriptDirectory = __dirname + "/";
    var nodeFS;
    var nodePath;
    Module["read"] = function shell_read(filename, binary) {
        var ret;
        if (!nodeFS)
            nodeFS = require("fs");
        if (!nodePath)
            nodePath = require("path");
        filename = nodePath["normalize"](filename);
        ret = nodeFS["readFileSync"](filename);
        return binary ? ret : ret.toString()
    }
    ;
    Module["readBinary"] = function readBinary(filename) {
        var ret = Module["read"](filename, true);
        if (!ret.buffer) {
            ret = new Uint8Array(ret)
        }
        assert(ret.buffer);
        return ret
    }
    ;
    if (process["argv"].length > 1) {
        Module["thisProgram"] = process["argv"][1].replace(/\\/g, "/")
    }
    Module["arguments"] = process["argv"].slice(2);
    if (typeof module !== "undefined") {
        module["exports"] = Module
    }
    process["on"]("uncaughtException", (function(ex) {
        if (!(ex instanceof ExitStatus)) {
            throw ex
        }
    }
    ));
    process["on"]("unhandledRejection", (function(reason, p) {
        process["exit"](1)
    }
    ));
    Module["quit"] = (function(status) {
        process["exit"](status)
    }
    );
    Module["inspect"] = (function() {
        return "[Emscripten Module object]"
    }
    )
} else if (ENVIRONMENT_IS_SHELL) {
    if (typeof read != "undefined") {
        Module["read"] = function shell_read(f) {
            return read(f)
        }
    }
    Module["readBinary"] = function readBinary(f) {
        var data;
        if (typeof readbuffer === "function") {
            return new Uint8Array(readbuffer(f))
        }
        data = read(f, "binary");
        assert(typeof data === "object");
        return data
    }
    ;
    if (typeof scriptArgs != "undefined") {
        Module["arguments"] = scriptArgs
    } else if (typeof arguments != "undefined") {
        Module["arguments"] = arguments
    }
    if (typeof quit === "function") {
        Module["quit"] = (function(status) {
            quit(status)
        }
        )
    }
} else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
    if (ENVIRONMENT_IS_WEB) {
        if (document.currentScript) {
            scriptDirectory = document.currentScript.src
        }
    } else {
        scriptDirectory = self.location.href
    }
    if (scriptDirectory.indexOf("blob:") !== 0) {
        scriptDirectory = scriptDirectory.substr(0, scriptDirectory.lastIndexOf("/") + 1)
    } else {
        scriptDirectory = ""
    }
    Module["read"] = function shell_read(url) {
        var xhr = new XMLHttpRequest;
        xhr.open("GET", url, false);
        xhr.send(null);
        return xhr.responseText
    }
    ;
    if (ENVIRONMENT_IS_WORKER) {
        Module["readBinary"] = function readBinary(url) {
            var xhr = new XMLHttpRequest;
            xhr.open("GET", url, false);
            xhr.responseType = "arraybuffer";
            xhr.send(null);
            return new Uint8Array(xhr.response)
        }
    }
    Module["readAsync"] = function readAsync(url, onload, onerror) {
        var xhr = new XMLHttpRequest;
        xhr.open("GET", url, true);
        xhr.responseType = "arraybuffer";
        xhr.onload = function xhr_onload() {
            if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
                onload(xhr.response);
                return
            }
            onerror()
        }
        ;
        xhr.onerror = onerror;
        xhr.send(null)
    }
    ;
    Module["setWindowTitle"] = (function(title) {
        document.title = title
    }
    )
} else {}
var out = Module["print"] || (typeof console !== "undefined" ? console.log.bind(console) : typeof print !== "undefined" ? print : null);
var err = Module["printErr"] || (typeof printErr !== "undefined" ? printErr : typeof console !== "undefined" && console.warn.bind(console) || out);
for (key in moduleOverrides) {
    if (moduleOverrides.hasOwnProperty(key)) {
        Module[key] = moduleOverrides[key]
    }
}
moduleOverrides = undefined;
var STACK_ALIGN = 16;
function staticAlloc(size) {
    var ret = STATICTOP;
    STATICTOP = STATICTOP + size + 15 & -16;
    return ret
}
function dynamicAlloc(size) {
    var ret = HEAP32[DYNAMICTOP_PTR >> 2];
    var end = ret + size + 15 & -16;
    HEAP32[DYNAMICTOP_PTR >> 2] = end;
    if (end >= TOTAL_MEMORY) {
        var success = enlargeMemory();
        if (!success) {
            HEAP32[DYNAMICTOP_PTR >> 2] = ret;
            return 0
        }
    }
    return ret
}
function alignMemory(size, factor) {
    if (!factor)
        factor = STACK_ALIGN;
    var ret = size = Math.ceil(size / factor) * factor;
    return ret
}
function getNativeTypeSize(type) {
    switch (type) {
    case "i1":
    case "i8":
        return 1;
    case "i16":
        return 2;
    case "i32":
        return 4;
    case "i64":
        return 8;
    case "float":
        return 4;
    case "double":
        return 8;
    default:
        {
            if (type[type.length - 1] === "*") {
                return 4
            } else if (type[0] === "i") {
                var bits = parseInt(type.substr(1));
                assert(bits % 8 === 0);
                return bits / 8
            } else {
                return 0
            }
        }
    }
}
function warnOnce(text) {
    if (!warnOnce.shown)
        warnOnce.shown = {};
    if (!warnOnce.shown[text]) {
        warnOnce.shown[text] = 1;
        err(text)
    }
}
var asm2wasmImports = {
    "f64-rem": (function(x, y) {
        return x % y
    }
    ),
    "debugger": (function() {
        debugger
    }
    )
};
var functionPointers = new Array(0);
function dynCall(sig, ptr, args) {
    if (args && args.length) {
        return Module["dynCall_" + sig].apply(null, [ptr].concat(args))
    } else {
        return Module["dynCall_" + sig].call(null, ptr)
    }
}
var Runtime = {
    dynCall: dynCall
};
var GLOBAL_BASE = 1024;
var ABORT = false;
var EXITSTATUS = 0;
function assert(condition, text) {
    if (!condition) {
        abort("Assertion failed: " + text)
    }
}
function setValue(ptr, value, type, noSafe) {
    type = type || "i8";
    if (type.charAt(type.length - 1) === "*")
        type = "i32";
    switch (type) {
    case "i1":
        HEAP8[ptr >> 0] = value;
        break;
    case "i8":
        HEAP8[ptr >> 0] = value;
        break;
    case "i16":
        HEAP16[ptr >> 1] = value;
        break;
    case "i32":
        HEAP32[ptr >> 2] = value;
        break;
    case "i64":
        tempI64 = [value >>> 0, (tempDouble = value,
        +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)],
        HEAP32[ptr >> 2] = tempI64[0],
        HEAP32[ptr + 4 >> 2] = tempI64[1];
        break;
    case "float":
        HEAPF32[ptr >> 2] = value;
        break;
    case "double":
        HEAPF64[ptr >> 3] = value;
        break;
    default:
        abort("invalid type for setValue: " + type)
    }
}
var ALLOC_NORMAL = 0;
var ALLOC_STATIC = 2;
var ALLOC_NONE = 4;
function allocate(slab, types, allocator, ptr) {
    var zeroinit, size;
    if (typeof slab === "number") {
        zeroinit = true;
        size = slab
    } else {
        zeroinit = false;
        size = slab.length
    }
    var singleType = typeof types === "string" ? types : null;
    var ret;
    if (allocator == ALLOC_NONE) {
        ret = ptr
    } else {
        ret = [typeof _malloc === "function" ? _malloc : staticAlloc, stackAlloc, staticAlloc, dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length))
    }
    if (zeroinit) {
        var stop;
        ptr = ret;
        assert((ret & 3) == 0);
        stop = ret + (size & ~3);
        for (; ptr < stop; ptr += 4) {
            HEAP32[ptr >> 2] = 0
        }
        stop = ret + size;
        while (ptr < stop) {
            HEAP8[ptr++ >> 0] = 0
        }
        return ret
    }
    if (singleType === "i8") {
        if (slab.subarray || slab.slice) {
            HEAPU8.set(slab, ret)
        } else {
            HEAPU8.set(new Uint8Array(slab), ret)
        }
        return ret
    }
    var i = 0, type, typeSize, previousType;
    while (i < size) {
        var curr = slab[i];
        type = singleType || types[i];
        if (type === 0) {
            i++;
            continue
        }
        if (type == "i64")
            type = "i32";
        setValue(ret + i, curr, type);
        if (previousType !== type) {
            typeSize = getNativeTypeSize(type);
            previousType = type
        }
        i += typeSize
    }
    return ret
}
function getMemory(size) {
    if (!staticSealed)
        return staticAlloc(size);
    if (!runtimeInitialized)
        return dynamicAlloc(size);
    return _malloc(size)
}
function Pointer_stringify(ptr, length) {
    if (length === 0 || !ptr)
        return "";
    var hasUtf = 0;
    var t;
    var i = 0;
    while (1) {
        t = HEAPU8[ptr + i >> 0];
        hasUtf |= t;
        if (t == 0 && !length)
            break;
        i++;
        if (length && i == length)
            break
    }
    if (!length)
        length = i;
    var ret = "";
    if (hasUtf < 128) {
        var MAX_CHUNK = 1024;
        var curr;
        while (length > 0) {
            curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
            ret = ret ? ret + curr : curr;
            ptr += MAX_CHUNK;
            length -= MAX_CHUNK
        }
        return ret
    }
    return UTF8ToString(ptr)
}
var UTF8Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf8") : undefined;
function UTF8ArrayToString(u8Array, idx) {
    var endPtr = idx;
    while (u8Array[endPtr])
        ++endPtr;
    if (endPtr - idx > 16 && u8Array.subarray && UTF8Decoder) {
        return UTF8Decoder.decode(u8Array.subarray(idx, endPtr))
    } else {
        var u0, u1, u2, u3, u4, u5;
        var str = "";
        while (1) {
            u0 = u8Array[idx++];
            if (!u0)
                return str;
            if (!(u0 & 128)) {
                str += String.fromCharCode(u0);
                continue
            }
            u1 = u8Array[idx++] & 63;
            if ((u0 & 224) == 192) {
                str += String.fromCharCode((u0 & 31) << 6 | u1);
                continue
            }
            u2 = u8Array[idx++] & 63;
            if ((u0 & 240) == 224) {
                u0 = (u0 & 15) << 12 | u1 << 6 | u2
            } else {
                u3 = u8Array[idx++] & 63;
                if ((u0 & 248) == 240) {
                    u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | u3
                } else {
                    u4 = u8Array[idx++] & 63;
                    if ((u0 & 252) == 248) {
                        u0 = (u0 & 3) << 24 | u1 << 18 | u2 << 12 | u3 << 6 | u4
                    } else {
                        u5 = u8Array[idx++] & 63;
                        u0 = (u0 & 1) << 30 | u1 << 24 | u2 << 18 | u3 << 12 | u4 << 6 | u5
                    }
                }
            }
            if (u0 < 65536) {
                str += String.fromCharCode(u0)
            } else {
                var ch = u0 - 65536;
                str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023)
            }
        }
    }
}
function UTF8ToString(ptr) {
    return UTF8ArrayToString(HEAPU8, ptr)
}
function stringToUTF8Array(str, outU8Array, outIdx, maxBytesToWrite) {
    if (!(maxBytesToWrite > 0))
        return 0;
    var startIdx = outIdx;
    var endIdx = outIdx + maxBytesToWrite - 1;
    for (var i = 0; i < str.length; ++i) {
        var u = str.charCodeAt(i);
        if (u >= 55296 && u <= 57343) {
            var u1 = str.charCodeAt(++i);
            u = 65536 + ((u & 1023) << 10) | u1 & 1023
        }
        if (u <= 127) {
            if (outIdx >= endIdx)
                break;
            outU8Array[outIdx++] = u
        } else if (u <= 2047) {
            if (outIdx + 1 >= endIdx)
                break;
            outU8Array[outIdx++] = 192 | u >> 6;
            outU8Array[outIdx++] = 128 | u & 63
        } else if (u <= 65535) {
            if (outIdx + 2 >= endIdx)
                break;
            outU8Array[outIdx++] = 224 | u >> 12;
            outU8Array[outIdx++] = 128 | u >> 6 & 63;
            outU8Array[outIdx++] = 128 | u & 63
        } else if (u <= 2097151) {
            if (outIdx + 3 >= endIdx)
                break;
            outU8Array[outIdx++] = 240 | u >> 18;
            outU8Array[outIdx++] = 128 | u >> 12 & 63;
            outU8Array[outIdx++] = 128 | u >> 6 & 63;
            outU8Array[outIdx++] = 128 | u & 63
        } else if (u <= 67108863) {
            if (outIdx + 4 >= endIdx)
                break;
            outU8Array[outIdx++] = 248 | u >> 24;
            outU8Array[outIdx++] = 128 | u >> 18 & 63;
            outU8Array[outIdx++] = 128 | u >> 12 & 63;
            outU8Array[outIdx++] = 128 | u >> 6 & 63;
            outU8Array[outIdx++] = 128 | u & 63
        } else {
            if (outIdx + 5 >= endIdx)
                break;
            outU8Array[outIdx++] = 252 | u >> 30;
            outU8Array[outIdx++] = 128 | u >> 24 & 63;
            outU8Array[outIdx++] = 128 | u >> 18 & 63;
            outU8Array[outIdx++] = 128 | u >> 12 & 63;
            outU8Array[outIdx++] = 128 | u >> 6 & 63;
            outU8Array[outIdx++] = 128 | u & 63
        }
    }
    outU8Array[outIdx] = 0;
    return outIdx - startIdx
}
function stringToUTF8(str, outPtr, maxBytesToWrite) {
    return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite)
}
function lengthBytesUTF8(str) {
    var len = 0;
    for (var i = 0; i < str.length; ++i) {
        var u = str.charCodeAt(i);
        if (u >= 55296 && u <= 57343)
            u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i) & 1023;
        if (u <= 127) {
            ++len
        } else if (u <= 2047) {
            len += 2
        } else if (u <= 65535) {
            len += 3
        } else if (u <= 2097151) {
            len += 4
        } else if (u <= 67108863) {
            len += 5
        } else {
            len += 6
        }
    }
    return len
}
var UTF16Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-16le") : undefined;
function allocateUTF8(str) {
    var size = lengthBytesUTF8(str) + 1;
    var ret = _malloc(size);
    if (ret)
        stringToUTF8Array(str, HEAP8, ret, size);
    return ret
}
function allocateUTF8OnStack(str) {
    var size = lengthBytesUTF8(str) + 1;
    var ret = stackAlloc(size);
    stringToUTF8Array(str, HEAP8, ret, size);
    return ret
}
var WASM_PAGE_SIZE = 65536;
var ASMJS_PAGE_SIZE = 16777216;
function alignUp(x, multiple) {
    if (x % multiple > 0) {
        x += multiple - x % multiple
    }
    return x
}
var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
function updateGlobalBuffer(buf) {
    Module["buffer"] = buffer = buf
}
function updateGlobalBufferViews() {
    Module["HEAP8"] = HEAP8 = new Int8Array(buffer);
    Module["HEAP16"] = HEAP16 = new Int16Array(buffer);
    Module["HEAP32"] = HEAP32 = new Int32Array(buffer);
    Module["HEAPU8"] = HEAPU8 = new Uint8Array(buffer);
    Module["HEAPU16"] = HEAPU16 = new Uint16Array(buffer);
    Module["HEAPU32"] = HEAPU32 = new Uint32Array(buffer);
    Module["HEAPF32"] = HEAPF32 = new Float32Array(buffer);
    Module["HEAPF64"] = HEAPF64 = new Float64Array(buffer)
}
var STATIC_BASE, STATICTOP, staticSealed;
var STACK_BASE, STACKTOP, STACK_MAX;
var DYNAMIC_BASE, DYNAMICTOP_PTR;
STATIC_BASE = STATICTOP = STACK_BASE = STACKTOP = STACK_MAX = DYNAMIC_BASE = DYNAMICTOP_PTR = 0;
staticSealed = false;
function abortOnCannotGrowMemory() {
    abort("Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value " + TOTAL_MEMORY + ", (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ")
}
function enlargeMemory() {
    abortOnCannotGrowMemory()
}
var TOTAL_STACK = Module["TOTAL_STACK"] || 5242880;
var TOTAL_MEMORY = Module["TOTAL_MEMORY"] || 268435456;
if (TOTAL_MEMORY < TOTAL_STACK)
    err("TOTAL_MEMORY should be larger than TOTAL_STACK, was " + TOTAL_MEMORY + "! (TOTAL_STACK=" + TOTAL_STACK + ")");
if (Module["buffer"]) {
    buffer = Module["buffer"]
} else {
    if (typeof WebAssembly === "object" && typeof WebAssembly.Memory === "function") {
        Module["wasmMemory"] = new WebAssembly.Memory({
            "initial": TOTAL_MEMORY / WASM_PAGE_SIZE,
            "maximum": TOTAL_MEMORY / WASM_PAGE_SIZE
        });
        buffer = Module["wasmMemory"].buffer
    } else {
        buffer = new ArrayBuffer(TOTAL_MEMORY)
    }
    Module["buffer"] = buffer
}
updateGlobalBufferViews();
function getTotalMemory() {
    return TOTAL_MEMORY
}
function callRuntimeCallbacks(callbacks) {
    while (callbacks.length > 0) {
        var callback = callbacks.shift();
        if (typeof callback == "function") {
            callback();
            continue
        }
        var func = callback.func;
        if (typeof func === "number") {
            if (callback.arg === undefined) {
                Module["dynCall_v"](func)
            } else {
                Module["dynCall_vi"](func, callback.arg)
            }
        } else {
            func(callback.arg === undefined ? null : callback.arg)
        }
    }
}
var __ATPRERUN__ = [];
var __ATINIT__ = [];
var __ATMAIN__ = [];
var __ATEXIT__ = [];
var __ATPOSTRUN__ = [];
var runtimeInitialized = false;
var runtimeExited = false;
function preRun() {
    if (Module["preRun"]) {
        if (typeof Module["preRun"] == "function")
            Module["preRun"] = [Module["preRun"]];
        while (Module["preRun"].length) {
            addOnPreRun(Module["preRun"].shift())
        }
    }
    callRuntimeCallbacks(__ATPRERUN__)
}
function ensureInitRuntime() {
    if (runtimeInitialized)
        return;
    runtimeInitialized = true;
    callRuntimeCallbacks(__ATINIT__)
}
function preMain() {
    callRuntimeCallbacks(__ATMAIN__)
}
function exitRuntime() {
    callRuntimeCallbacks(__ATEXIT__);
    runtimeExited = true
}
function postRun() {
    if (Module["postRun"]) {
        if (typeof Module["postRun"] == "function")
            Module["postRun"] = [Module["postRun"]];
        while (Module["postRun"].length) {
            addOnPostRun(Module["postRun"].shift())
        }
    }
    callRuntimeCallbacks(__ATPOSTRUN__)
}
function addOnPreRun(cb) {
    __ATPRERUN__.unshift(cb)
}
function addOnPostRun(cb) {
    __ATPOSTRUN__.unshift(cb)
}
function writeStringToMemory(string, buffer, dontAddNull) {
    warnOnce("writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!");
    var lastChar, end;
    if (dontAddNull) {
        end = buffer + lengthBytesUTF8(string);
        lastChar = HEAP8[end]
    }
    stringToUTF8(string, buffer, Infinity);
    if (dontAddNull)
        HEAP8[end] = lastChar
}
function writeArrayToMemory(array, buffer) {
    HEAP8.set(array, buffer)
}
function writeAsciiToMemory(str, buffer, dontAddNull) {
    for (var i = 0; i < str.length; ++i) {
        HEAP8[buffer++ >> 0] = str.charCodeAt(i)
    }
    if (!dontAddNull)
        HEAP8[buffer >> 0] = 0
}
var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_min = Math.min;
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null;
function getUniqueRunDependency(id) {
    return id
}
function addRunDependency(id) {
    runDependencies++;
    if (Module["monitorRunDependencies"]) {
        Module["monitorRunDependencies"](runDependencies)
    }
}
function removeRunDependency(id) {
    runDependencies--;
    if (Module["monitorRunDependencies"]) {
        Module["monitorRunDependencies"](runDependencies)
    }
    if (runDependencies == 0) {
        if (runDependencyWatcher !== null) {
            clearInterval(runDependencyWatcher);
            runDependencyWatcher = null
        }
        if (dependenciesFulfilled) {
            var callback = dependenciesFulfilled;
            dependenciesFulfilled = null;
            callback()
        }
    }
}
Module["preloadedImages"] = {};
Module["preloadedAudios"] = {};
var dataURIPrefix = "data:application/octet-stream;base64,";
function isDataURI(filename) {
    return String.prototype.startsWith ? filename.startsWith(dataURIPrefix) : filename.indexOf(dataURIPrefix) === 0
}
function integrateWasmJS() {
    var wasmTextFile = "ftewebgl.wast";
    var wasmBinaryFile = "ftewebgl.wasm";
    var asmjsCodeFile = "ftewebgl.temp.asm.js";
    if (!isDataURI(wasmTextFile)) {
        wasmTextFile = locateFile(wasmTextFile)
    }
    if (!isDataURI(wasmBinaryFile)) {
        wasmBinaryFile = locateFile(wasmBinaryFile)
    }
    if (!isDataURI(asmjsCodeFile)) {
        asmjsCodeFile = locateFile(asmjsCodeFile)
    }
    var wasmPageSize = 64 * 1024;
    var info = {
        "global": null,
        "env": null,
        "asm2wasm": asm2wasmImports,
        "parent": Module
    };
    var exports = null;
    function mergeMemory(newBuffer) {
        var oldBuffer = Module["buffer"];
        if (newBuffer.byteLength < oldBuffer.byteLength) {
            err("the new buffer in mergeMemory is smaller than the previous one. in native wasm, we should grow memory here")
        }
        var oldView = new Int8Array(oldBuffer);
        var newView = new Int8Array(newBuffer);
        newView.set(oldView);
        updateGlobalBuffer(newBuffer);
        updateGlobalBufferViews()
    }
    function fixImports(imports) {
        return imports
    }
    function getBinary() {
        try {
            if (Module["wasmBinary"]) {
                return new Uint8Array(Module["wasmBinary"])
            }
            if (Module["readBinary"]) {
                return Module["readBinary"](wasmBinaryFile)
            } else {
                throw "both async and sync fetching of the wasm failed"
            }
        } catch (err) {
            abort(err)
        }
    }
    function getBinaryPromise() {
        if (!Module["wasmBinary"] && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) && typeof fetch === "function") {
            return fetch(wasmBinaryFile, {
                credentials: "same-origin"
            }).then((function(response) {
                if (!response["ok"]) {
                    throw "failed to load wasm binary file at '" + wasmBinaryFile + "'"
                }
                return response["arrayBuffer"]()
            }
            )).catch((function() {
                return getBinary()
            }
            ))
        }
        return new Promise((function(resolve, reject) {
            resolve(getBinary())
        }
        ))
    }
    function doNativeWasm(global, env, providedBuffer) {
        if (typeof WebAssembly !== "object") {
            err("no native wasm support detected");
            return false
        }
        if (!(Module["wasmMemory"]instanceof WebAssembly.Memory)) {
            err("no native wasm Memory in use");
            return false
        }
        env["memory"] = Module["wasmMemory"];
        info["global"] = {
            "NaN": NaN,
            "Infinity": Infinity
        };
        info["global.Math"] = Math;
        info["env"] = env;
        function receiveInstance(instance, module) {
            exports = instance.exports;
            if (exports.memory)
                mergeMemory(exports.memory);
            Module["asm"] = exports;
            Module["usingWasm"] = true;
            removeRunDependency("wasm-instantiate")
        }
        addRunDependency("wasm-instantiate");
        if (Module["instantiateWasm"]) {
            try {
                return Module["instantiateWasm"](info, receiveInstance)
            } catch (e) {
                err("Module.instantiateWasm callback failed with error: " + e);
                return false
            }
        }
        function receiveInstantiatedSource(output) {
            receiveInstance(output["instance"], output["module"])
        }
        function instantiateArrayBuffer(receiver) {
            getBinaryPromise().then((function(binary) {
                return WebAssembly.instantiate(binary, info)
            }
            )).then(receiver).catch((function(reason) {
                err("failed to asynchronously prepare wasm: " + reason);
                abort(reason)
            }
            ))
        }
        if (!Module["wasmBinary"] && typeof WebAssembly.instantiateStreaming === "function" && !isDataURI(wasmBinaryFile) && typeof fetch === "function") {
            WebAssembly.instantiateStreaming(fetch(wasmBinaryFile, {
                credentials: "same-origin"
            }), info).then(receiveInstantiatedSource).catch((function(reason) {
                err("wasm streaming compile failed: " + reason);
                err("falling back to ArrayBuffer instantiation");
                instantiateArrayBuffer(receiveInstantiatedSource)
            }
            ))
        } else {
            instantiateArrayBuffer(receiveInstantiatedSource)
        }
        return {}
    }
    Module["asmPreload"] = Module["asm"];
    var asmjsReallocBuffer = Module["reallocBuffer"];
    var wasmReallocBuffer = (function(size) {
        var PAGE_MULTIPLE = Module["usingWasm"] ? WASM_PAGE_SIZE : ASMJS_PAGE_SIZE;
        size = alignUp(size, PAGE_MULTIPLE);
        var old = Module["buffer"];
        var oldSize = old.byteLength;
        if (Module["usingWasm"]) {
            try {
                var result = Module["wasmMemory"].grow((size - oldSize) / wasmPageSize);
                if (result !== (-1 | 0)) {
                    return Module["buffer"] = Module["wasmMemory"].buffer
                } else {
                    return null
                }
            } catch (e) {
                return null
            }
        }
    }
    );
    Module["reallocBuffer"] = (function(size) {
        if (finalMethod === "asmjs") {
            return asmjsReallocBuffer(size)
        } else {
            return wasmReallocBuffer(size)
        }
    }
    );
    var finalMethod = "";
    Module["asm"] = (function(global, env, providedBuffer) {
        env = fixImports(env);
        if (!env["table"]) {
            var TABLE_SIZE = Module["wasmTableSize"];
            if (TABLE_SIZE === undefined)
                TABLE_SIZE = 1024;
            var MAX_TABLE_SIZE = Module["wasmMaxTableSize"];
            if (typeof WebAssembly === "object" && typeof WebAssembly.Table === "function") {
                if (MAX_TABLE_SIZE !== undefined) {
                    env["table"] = new WebAssembly.Table({
                        "initial": TABLE_SIZE,
                        "maximum": MAX_TABLE_SIZE,
                        "element": "anyfunc"
                    })
                } else {
                    env["table"] = new WebAssembly.Table({
                        "initial": TABLE_SIZE,
                        element: "anyfunc"
                    })
                }
            } else {
                env["table"] = new Array(TABLE_SIZE)
            }
            Module["wasmTable"] = env["table"]
        }
        if (!env["memoryBase"]) {
            env["memoryBase"] = Module["STATIC_BASE"]
        }
        if (!env["tableBase"]) {
            env["tableBase"] = 0
        }
        var exports;
        exports = doNativeWasm(global, env, providedBuffer);
        assert(exports, "no binaryen method succeeded.");
        return exports
    }
    )
}
integrateWasmJS();
STATIC_BASE = GLOBAL_BASE;
STATICTOP = STATIC_BASE + 21992112;
__ATINIT__.push({
    func: (function() {
        ___emscripten_environ_constructor()
    }
    )
});
var STATIC_BUMP = 21992112;
Module["STATIC_BASE"] = STATIC_BASE;
Module["STATIC_BUMP"] = STATIC_BUMP;
STATICTOP += 16;
var PATH = {
    splitPath: (function(filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1)
    }
    ),
    normalizeArray: (function(parts, allowAboveRoot) {
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
            var last = parts[i];
            if (last === ".") {
                parts.splice(i, 1)
            } else if (last === "..") {
                parts.splice(i, 1);
                up++
            } else if (up) {
                parts.splice(i, 1);
                up--
            }
        }
        if (allowAboveRoot) {
            for (; up; up--) {
                parts.unshift("..")
            }
        }
        return parts
    }
    ),
    normalize: (function(path) {
        var isAbsolute = path.charAt(0) === "/"
          , trailingSlash = path.substr(-1) === "/";
        path = PATH.normalizeArray(path.split("/").filter((function(p) {
            return !!p
        }
        )), !isAbsolute).join("/");
        if (!path && !isAbsolute) {
            path = "."
        }
        if (path && trailingSlash) {
            path += "/"
        }
        return (isAbsolute ? "/" : "") + path
    }
    ),
    dirname: (function(path) {
        var result = PATH.splitPath(path)
          , root = result[0]
          , dir = result[1];
        if (!root && !dir) {
            return "."
        }
        if (dir) {
            dir = dir.substr(0, dir.length - 1)
        }
        return root + dir
    }
    ),
    basename: (function(path) {
        if (path === "/")
            return "/";
        var lastSlash = path.lastIndexOf("/");
        if (lastSlash === -1)
            return path;
        return path.substr(lastSlash + 1)
    }
    ),
    extname: (function(path) {
        return PATH.splitPath(path)[3]
    }
    ),
    join: (function() {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join("/"))
    }
    ),
    join2: (function(l, r) {
        return PATH.normalize(l + "/" + r)
    }
    ),
    resolve: (function() {
        var resolvedPath = ""
          , resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
            var path = i >= 0 ? arguments[i] : FS.cwd();
            if (typeof path !== "string") {
                throw new TypeError("Arguments to path.resolve must be strings")
            } else if (!path) {
                return ""
            }
            resolvedPath = path + "/" + resolvedPath;
            resolvedAbsolute = path.charAt(0) === "/"
        }
        resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter((function(p) {
            return !!p
        }
        )), !resolvedAbsolute).join("/");
        return (resolvedAbsolute ? "/" : "") + resolvedPath || "."
    }
    ),
    relative: (function(from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
            var start = 0;
            for (; start < arr.length; start++) {
                if (arr[start] !== "")
                    break
            }
            var end = arr.length - 1;
            for (; end >= 0; end--) {
                if (arr[end] !== "")
                    break
            }
            if (start > end)
                return [];
            return arr.slice(start, end - start + 1)
        }
        var fromParts = trim(from.split("/"));
        var toParts = trim(to.split("/"));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
            if (fromParts[i] !== toParts[i]) {
                samePartsLength = i;
                break
            }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
            outputParts.push("..")
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join("/")
    }
    )
};
function _emscripten_set_main_loop_timing(mode, value) {
    Browser.mainLoop.timingMode = mode;
    Browser.mainLoop.timingValue = value;
    if (!Browser.mainLoop.func) {
        return 1
    }
    if (mode == 0) {
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setTimeout() {
            var timeUntilNextTick = Math.max(0, Browser.mainLoop.tickStartTime + value - _emscripten_get_now()) | 0;
            setTimeout(Browser.mainLoop.runner, timeUntilNextTick)
        }
        ;
        Browser.mainLoop.method = "timeout"
    } else if (mode == 1) {
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_rAF() {
            Browser.requestAnimationFrame(Browser.mainLoop.runner)
        }
        ;
        Browser.mainLoop.method = "rAF"
    } else if (mode == 2) {
        if (typeof setImmediate === "undefined") {
            var setImmediates = [];
            var emscriptenMainLoopMessageId = "setimmediate";
            function Browser_setImmediate_messageHandler(event) {
                if (event.data === emscriptenMainLoopMessageId || event.data.target === emscriptenMainLoopMessageId) {
                    event.stopPropagation();
                    setImmediates.shift()()
                }
            }
            addEventListener("message", Browser_setImmediate_messageHandler, true);
            setImmediate = function Browser_emulated_setImmediate(func) {
                setImmediates.push(func);
                if (ENVIRONMENT_IS_WORKER) {
                    if (Module["setImmediates"] === undefined)
                        Module["setImmediates"] = [];
                    Module["setImmediates"].push(func);
                    postMessage({
                        target: emscriptenMainLoopMessageId
                    })
                } else
                    postMessage(emscriptenMainLoopMessageId, "*")
            }
        }
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setImmediate() {
            setImmediate(Browser.mainLoop.runner)
        }
        ;
        Browser.mainLoop.method = "immediate"
    }
    return 0
}
function _emscripten_get_now() {
    abort()
}
function _emscripten_set_main_loop(func, fps, simulateInfiniteLoop, arg, noSetTiming) {
    Module["noExitRuntime"] = true;
    assert(!Browser.mainLoop.func, "emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.");
    Browser.mainLoop.func = func;
    Browser.mainLoop.arg = arg;
    var browserIterationFunc;
    if (typeof arg !== "undefined") {
        browserIterationFunc = (function() {
            Module["dynCall_vi"](func, arg)
        }
        )
    } else {
        browserIterationFunc = (function() {
            Module["dynCall_v"](func)
        }
        )
    }
    var thisMainLoopId = Browser.mainLoop.currentlyRunningMainloop;
    Browser.mainLoop.runner = function Browser_mainLoop_runner() {
        if (ABORT)
            return;
        if (Browser.mainLoop.queue.length > 0) {
            var start = Date.now();
            var blocker = Browser.mainLoop.queue.shift();
            blocker.func(blocker.arg);
            if (Browser.mainLoop.remainingBlockers) {
                var remaining = Browser.mainLoop.remainingBlockers;
                var next = remaining % 1 == 0 ? remaining - 1 : Math.floor(remaining);
                if (blocker.counted) {
                    Browser.mainLoop.remainingBlockers = next
                } else {
                    next = next + .5;
                    Browser.mainLoop.remainingBlockers = (8 * remaining + next) / 9
                }
            }
            console.log('main loop blocker "' + blocker.name + '" took ' + (Date.now() - start) + " ms");
            Browser.mainLoop.updateStatus();
            if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop)
                return;
            setTimeout(Browser.mainLoop.runner, 0);
            return
        }
        if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop)
            return;
        Browser.mainLoop.currentFrameNumber = Browser.mainLoop.currentFrameNumber + 1 | 0;
        if (Browser.mainLoop.timingMode == 1 && Browser.mainLoop.timingValue > 1 && Browser.mainLoop.currentFrameNumber % Browser.mainLoop.timingValue != 0) {
            Browser.mainLoop.scheduler();
            return
        } else if (Browser.mainLoop.timingMode == 0) {
            Browser.mainLoop.tickStartTime = _emscripten_get_now()
        }
        if (Browser.mainLoop.method === "timeout" && Module.ctx) {
            err("Looks like you are rendering without using requestAnimationFrame for the main loop. You should use 0 for the frame rate in emscripten_set_main_loop in order to use requestAnimationFrame, as that can greatly improve your frame rates!");
            Browser.mainLoop.method = ""
        }
        Browser.mainLoop.runIter(browserIterationFunc);
        if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop)
            return;
        if (typeof SDL === "object" && SDL.audio && SDL.audio.queueNewAudioData)
            SDL.audio.queueNewAudioData();
        Browser.mainLoop.scheduler()
    }
    ;
    if (!noSetTiming) {
        if (fps && fps > 0)
            _emscripten_set_main_loop_timing(0, 1e3 / fps);
        else
            _emscripten_set_main_loop_timing(1, 1);
        Browser.mainLoop.scheduler()
    }
    if (simulateInfiniteLoop) {
        throw "SimulateInfiniteLoop"
    }
}
var Browser = {
    mainLoop: {
        scheduler: null,
        method: "",
        currentlyRunningMainloop: 0,
        func: null,
        arg: 0,
        timingMode: 0,
        timingValue: 0,
        currentFrameNumber: 0,
        queue: [],
        pause: (function() {
            Browser.mainLoop.scheduler = null;
            Browser.mainLoop.currentlyRunningMainloop++
        }
        ),
        resume: (function() {
            Browser.mainLoop.currentlyRunningMainloop++;
            var timingMode = Browser.mainLoop.timingMode;
            var timingValue = Browser.mainLoop.timingValue;
            var func = Browser.mainLoop.func;
            Browser.mainLoop.func = null;
            _emscripten_set_main_loop(func, 0, false, Browser.mainLoop.arg, true);
            _emscripten_set_main_loop_timing(timingMode, timingValue);
            Browser.mainLoop.scheduler()
        }
        ),
        updateStatus: (function() {
            if (Module["setStatus"]) {
                var message = Module["statusMessage"] || "Please wait...";
                var remaining = Browser.mainLoop.remainingBlockers;
                var expected = Browser.mainLoop.expectedBlockers;
                if (remaining) {
                    if (remaining < expected) {
                        Module["setStatus"](message + " (" + (expected - remaining) + "/" + expected + ")")
                    } else {
                        Module["setStatus"](message)
                    }
                } else {
                    Module["setStatus"]("")
                }
            }
        }
        ),
        runIter: (function(func) {
            if (ABORT)
                return;
            if (Module["preMainLoop"]) {
                var preRet = Module["preMainLoop"]();
                if (preRet === false) {
                    return
                }
            }
            try {
                func()
            } catch (e) {
                if (e instanceof ExitStatus) {
                    return
                } else {
                    if (e && typeof e === "object" && e.stack)
                        err("exception thrown: " + [e, e.stack]);
                    throw e
                }
            }
            if (Module["postMainLoop"])
                Module["postMainLoop"]()
        }
        )
    },
    isFullscreen: false,
    pointerLock: false,
    moduleContextCreatedCallbacks: [],
    workers: [],
    init: (function() {
        if (!Module["preloadPlugins"])
            Module["preloadPlugins"] = [];
        if (Browser.initted)
            return;
        Browser.initted = true;
        try {
            new Blob;
            Browser.hasBlobConstructor = true
        } catch (e) {
            Browser.hasBlobConstructor = false;
            console.log("warning: no blob constructor, cannot create blobs with mimetypes")
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : !Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null;
        Browser.URLObject = typeof window != "undefined" ? window.URL ? window.URL : window.webkitURL : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === "undefined") {
            console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
            Module.noImageDecoding = true
        }
        var imagePlugin = {};
        imagePlugin["canHandle"] = function imagePlugin_canHandle(name) {
            return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name)
        }
        ;
        imagePlugin["handle"] = function imagePlugin_handle(byteArray, name, onload, onerror) {
            var b = null;
            if (Browser.hasBlobConstructor) {
                try {
                    b = new Blob([byteArray],{
                        type: Browser.getMimetype(name)
                    });
                    if (b.size !== byteArray.length) {
                        b = new Blob([(new Uint8Array(byteArray)).buffer],{
                            type: Browser.getMimetype(name)
                        })
                    }
                } catch (e) {
                    warnOnce("Blob constructor present but fails: " + e + "; falling back to blob builder")
                }
            }
            if (!b) {
                var bb = new Browser.BlobBuilder;
                bb.append((new Uint8Array(byteArray)).buffer);
                b = bb.getBlob()
            }
            var url = Browser.URLObject.createObjectURL(b);
            var img = new Image;
            img.onload = function img_onload() {
                assert(img.complete, "Image " + name + " could not be decoded");
                var canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                Module["preloadedImages"][name] = canvas;
                Browser.URLObject.revokeObjectURL(url);
                if (onload)
                    onload(byteArray)
            }
            ;
            img.onerror = function img_onerror(event) {
                console.log("Image " + url + " could not be decoded");
                if (onerror)
                    onerror()
            }
            ;
            img.src = url
        }
        ;
        Module["preloadPlugins"].push(imagePlugin);
        var audioPlugin = {};
        audioPlugin["canHandle"] = function audioPlugin_canHandle(name) {
            return !Module.noAudioDecoding && name.substr(-4)in {
                ".ogg": 1,
                ".wav": 1,
                ".mp3": 1
            }
        }
        ;
        audioPlugin["handle"] = function audioPlugin_handle(byteArray, name, onload, onerror) {
            var done = false;
            function finish(audio) {
                if (done)
                    return;
                done = true;
                Module["preloadedAudios"][name] = audio;
                if (onload)
                    onload(byteArray)
            }
            function fail() {
                if (done)
                    return;
                done = true;
                Module["preloadedAudios"][name] = new Audio;
                if (onerror)
                    onerror()
            }
            if (Browser.hasBlobConstructor) {
                try {
                    var b = new Blob([byteArray],{
                        type: Browser.getMimetype(name)
                    })
                } catch (e) {
                    return fail()
                }
                var url = Browser.URLObject.createObjectURL(b);
                var audio = new Audio;
                audio.addEventListener("canplaythrough", (function() {
                    finish(audio)
                }
                ), false);
                audio.onerror = function audio_onerror(event) {
                    if (done)
                        return;
                    console.log("warning: browser could not fully decode audio " + name + ", trying slower base64 approach");
                    function encode64(data) {
                        var BASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
                        var PAD = "=";
                        var ret = "";
                        var leftchar = 0;
                        var leftbits = 0;
                        for (var i = 0; i < data.length; i++) {
                            leftchar = leftchar << 8 | data[i];
                            leftbits += 8;
                            while (leftbits >= 6) {
                                var curr = leftchar >> leftbits - 6 & 63;
                                leftbits -= 6;
                                ret += BASE[curr]
                            }
                        }
                        if (leftbits == 2) {
                            ret += BASE[(leftchar & 3) << 4];
                            ret += PAD + PAD
                        } else if (leftbits == 4) {
                            ret += BASE[(leftchar & 15) << 2];
                            ret += PAD
                        }
                        return ret
                    }
                    audio.src = "data:audio/x-" + name.substr(-3) + ";base64," + encode64(byteArray);
                    finish(audio)
                }
                ;
                audio.src = url;
                Browser.safeSetTimeout((function() {
                    finish(audio)
                }
                ), 1e4)
            } else {
                return fail()
            }
        }
        ;
        Module["preloadPlugins"].push(audioPlugin);
        function pointerLockChange() {
            Browser.pointerLock = document["pointerLockElement"] === Module["canvas"] || document["mozPointerLockElement"] === Module["canvas"] || document["webkitPointerLockElement"] === Module["canvas"] || document["msPointerLockElement"] === Module["canvas"]
        }
        var canvas = Module["canvas"];
        if (canvas) {
            canvas.requestPointerLock = canvas["requestPointerLock"] || canvas["mozRequestPointerLock"] || canvas["webkitRequestPointerLock"] || canvas["msRequestPointerLock"] || (function() {}
            );
            canvas.exitPointerLock = document["exitPointerLock"] || document["mozExitPointerLock"] || document["webkitExitPointerLock"] || document["msExitPointerLock"] || (function() {}
            );
            canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
            document.addEventListener("pointerlockchange", pointerLockChange, false);
            document.addEventListener("mozpointerlockchange", pointerLockChange, false);
            document.addEventListener("webkitpointerlockchange", pointerLockChange, false);
            document.addEventListener("mspointerlockchange", pointerLockChange, false);
            if (Module["elementPointerLock"]) {
                canvas.addEventListener("click", (function(ev) {
                    if (!Browser.pointerLock && Module["canvas"].requestPointerLock) {
                        Module["canvas"].requestPointerLock();
                        ev.preventDefault()
                    }
                }
                ), false)
            }
        }
    }
    ),
    createContext: (function(canvas, useWebGL, setInModule, webGLContextAttributes) {
        if (useWebGL && Module.ctx && canvas == Module.canvas)
            return Module.ctx;
        var ctx;
        var contextHandle;
        if (useWebGL) {
            var contextAttributes = {
                antialias: false,
                alpha: false
            };
            if (webGLContextAttributes) {
                for (var attribute in webGLContextAttributes) {
                    contextAttributes[attribute] = webGLContextAttributes[attribute]
                }
            }
            contextHandle = GL.createContext(canvas, contextAttributes);
            if (contextHandle) {
                ctx = GL.getContext(contextHandle).GLctx
            }
        } else {
            ctx = canvas.getContext("2d")
        }
        if (!ctx)
            return null;
        if (setInModule) {
            if (!useWebGL)
                assert(typeof GLctx === "undefined", "cannot set in module if GLctx is used, but we are a non-GL context that would replace it");
            Module.ctx = ctx;
            if (useWebGL)
                GL.makeContextCurrent(contextHandle);
            Module.useWebGL = useWebGL;
            Browser.moduleContextCreatedCallbacks.forEach((function(callback) {
                callback()
            }
            ));
            Browser.init()
        }
        return ctx
    }
    ),
    destroyContext: (function(canvas, useWebGL, setInModule) {}
    ),
    fullscreenHandlersInstalled: false,
    lockPointer: undefined,
    resizeCanvas: undefined,
    requestFullscreen: (function(lockPointer, resizeCanvas, vrDevice) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        Browser.vrDevice = vrDevice;
        if (typeof Browser.lockPointer === "undefined")
            Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === "undefined")
            Browser.resizeCanvas = false;
        if (typeof Browser.vrDevice === "undefined")
            Browser.vrDevice = null;
        var canvas = Module["canvas"];
        function fullscreenChange() {
            Browser.isFullscreen = false;
            var canvasContainer = canvas.parentNode;
            if ((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvasContainer) {
                canvas.exitFullscreen = document["exitFullscreen"] || document["cancelFullScreen"] || document["mozCancelFullScreen"] || document["msExitFullscreen"] || document["webkitCancelFullScreen"] || (function() {}
                );
                canvas.exitFullscreen = canvas.exitFullscreen.bind(document);
                if (Browser.lockPointer)
                    canvas.requestPointerLock();
                Browser.isFullscreen = true;
                if (Browser.resizeCanvas) {
                    Browser.setFullscreenCanvasSize()
                } else {
                    Browser.updateCanvasDimensions(canvas)
                }
            } else {
                canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
                canvasContainer.parentNode.removeChild(canvasContainer);
                if (Browser.resizeCanvas) {
                    Browser.setWindowedCanvasSize()
                } else {
                    Browser.updateCanvasDimensions(canvas)
                }
            }
            if (Module["onFullScreen"])
                Module["onFullScreen"](Browser.isFullscreen);
            if (Module["onFullscreen"])
                Module["onFullscreen"](Browser.isFullscreen)
        }
        if (!Browser.fullscreenHandlersInstalled) {
            Browser.fullscreenHandlersInstalled = true;
            document.addEventListener("fullscreenchange", fullscreenChange, false);
            document.addEventListener("mozfullscreenchange", fullscreenChange, false);
            document.addEventListener("webkitfullscreenchange", fullscreenChange, false);
            document.addEventListener("MSFullscreenChange", fullscreenChange, false)
        }
        var canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
        canvasContainer.requestFullscreen = canvasContainer["requestFullscreen"] || canvasContainer["mozRequestFullScreen"] || canvasContainer["msRequestFullscreen"] || (canvasContainer["webkitRequestFullscreen"] ? (function() {
            canvasContainer["webkitRequestFullscreen"](Element["ALLOW_KEYBOARD_INPUT"])
        }
        ) : null) || (canvasContainer["webkitRequestFullScreen"] ? (function() {
            canvasContainer["webkitRequestFullScreen"](Element["ALLOW_KEYBOARD_INPUT"])
        }
        ) : null);
        if (vrDevice) {
            canvasContainer.requestFullscreen({
                vrDisplay: vrDevice
            })
        } else {
            canvasContainer.requestFullscreen()
        }
    }
    ),
    requestFullScreen: (function(lockPointer, resizeCanvas, vrDevice) {
        err("Browser.requestFullScreen() is deprecated. Please call Browser.requestFullscreen instead.");
        Browser.requestFullScreen = (function(lockPointer, resizeCanvas, vrDevice) {
            return Browser.requestFullscreen(lockPointer, resizeCanvas, vrDevice)
        }
        );
        return Browser.requestFullscreen(lockPointer, resizeCanvas, vrDevice)
    }
    ),
    nextRAF: 0,
    fakeRequestAnimationFrame: (function(func) {
        var now = Date.now();
        if (Browser.nextRAF === 0) {
            Browser.nextRAF = now + 1e3 / 60
        } else {
            while (now + 2 >= Browser.nextRAF) {
                Browser.nextRAF += 1e3 / 60
            }
        }
        var delay = Math.max(Browser.nextRAF - now, 0);
        setTimeout(func, delay)
    }
    ),
    requestAnimationFrame: function requestAnimationFrame(func) {
        if (typeof window === "undefined") {
            Browser.fakeRequestAnimationFrame(func)
        } else {
            if (!window.requestAnimationFrame) {
                window.requestAnimationFrame = window["requestAnimationFrame"] || window["mozRequestAnimationFrame"] || window["webkitRequestAnimationFrame"] || window["msRequestAnimationFrame"] || window["oRequestAnimationFrame"] || Browser.fakeRequestAnimationFrame
            }
            window.requestAnimationFrame(func)
        }
    },
    safeCallback: (function(func) {
        return (function() {
            if (!ABORT)
                return func.apply(null, arguments)
        }
        )
    }
    ),
    allowAsyncCallbacks: true,
    queuedAsyncCallbacks: [],
    pauseAsyncCallbacks: (function() {
        Browser.allowAsyncCallbacks = false
    }
    ),
    resumeAsyncCallbacks: (function() {
        Browser.allowAsyncCallbacks = true;
        if (Browser.queuedAsyncCallbacks.length > 0) {
            var callbacks = Browser.queuedAsyncCallbacks;
            Browser.queuedAsyncCallbacks = [];
            callbacks.forEach((function(func) {
                func()
            }
            ))
        }
    }
    ),
    safeRequestAnimationFrame: (function(func) {
        return Browser.requestAnimationFrame((function() {
            if (ABORT)
                return;
            if (Browser.allowAsyncCallbacks) {
                func()
            } else {
                Browser.queuedAsyncCallbacks.push(func)
            }
        }
        ))
    }
    ),
    safeSetTimeout: (function(func, timeout) {
        Module["noExitRuntime"] = true;
        return setTimeout((function() {
            if (ABORT)
                return;
            if (Browser.allowAsyncCallbacks) {
                func()
            } else {
                Browser.queuedAsyncCallbacks.push(func)
            }
        }
        ), timeout)
    }
    ),
    safeSetInterval: (function(func, timeout) {
        Module["noExitRuntime"] = true;
        return setInterval((function() {
            if (ABORT)
                return;
            if (Browser.allowAsyncCallbacks) {
                func()
            }
        }
        ), timeout)
    }
    ),
    getMimetype: (function(name) {
        return {
            "jpg": "image/jpeg",
            "jpeg": "image/jpeg",
            "png": "image/png",
            "bmp": "image/bmp",
            "ogg": "audio/ogg",
            "wav": "audio/wav",
            "mp3": "audio/mpeg"
        }[name.substr(name.lastIndexOf(".") + 1)]
    }
    ),
    getUserMedia: (function(func) {
        if (!window.getUserMedia) {
            window.getUserMedia = navigator["getUserMedia"] || navigator["mozGetUserMedia"]
        }
        window.getUserMedia(func)
    }
    ),
    getMovementX: (function(event) {
        return event["movementX"] || event["mozMovementX"] || event["webkitMovementX"] || 0
    }
    ),
    getMovementY: (function(event) {
        return event["movementY"] || event["mozMovementY"] || event["webkitMovementY"] || 0
    }
    ),
    getMouseWheelDelta: (function(event) {
        var delta = 0;
        switch (event.type) {
        case "DOMMouseScroll":
            delta = event.detail;
            break;
        case "mousewheel":
            delta = event.wheelDelta;
            break;
        case "wheel":
            delta = event["deltaY"];
            break;
        default:
            throw "unrecognized mouse wheel event: " + event.type
        }
        return delta
    }
    ),
    mouseX: 0,
    mouseY: 0,
    mouseMovementX: 0,
    mouseMovementY: 0,
    touches: {},
    lastTouches: {},
    calculateMouseEvent: (function(event) {
        if (Browser.pointerLock) {
            if (event.type != "mousemove" && "mozMovementX"in event) {
                Browser.mouseMovementX = Browser.mouseMovementY = 0
            } else {
                Browser.mouseMovementX = Browser.getMovementX(event);
                Browser.mouseMovementY = Browser.getMovementY(event)
            }
            if (typeof SDL != "undefined") {
                Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
                Browser.mouseY = SDL.mouseY + Browser.mouseMovementY
            } else {
                Browser.mouseX += Browser.mouseMovementX;
                Browser.mouseY += Browser.mouseMovementY
            }
        } else {
            var rect = Module["canvas"].getBoundingClientRect();
            var cw = Module["canvas"].width;
            var ch = Module["canvas"].height;
            var scrollX = typeof window.scrollX !== "undefined" ? window.scrollX : window.pageXOffset;
            var scrollY = typeof window.scrollY !== "undefined" ? window.scrollY : window.pageYOffset;
            if (event.type === "touchstart" || event.type === "touchend" || event.type === "touchmove") {
                var touch = event.touch;
                if (touch === undefined) {
                    return
                }
                var adjustedX = touch.pageX - (scrollX + rect.left);
                var adjustedY = touch.pageY - (scrollY + rect.top);
                adjustedX = adjustedX * (cw / rect.width);
                adjustedY = adjustedY * (ch / rect.height);
                var coords = {
                    x: adjustedX,
                    y: adjustedY
                };
                if (event.type === "touchstart") {
                    Browser.lastTouches[touch.identifier] = coords;
                    Browser.touches[touch.identifier] = coords
                } else if (event.type === "touchend" || event.type === "touchmove") {
                    var last = Browser.touches[touch.identifier];
                    if (!last)
                        last = coords;
                    Browser.lastTouches[touch.identifier] = last;
                    Browser.touches[touch.identifier] = coords
                }
                return
            }
            var x = event.pageX - (scrollX + rect.left);
            var y = event.pageY - (scrollY + rect.top);
            x = x * (cw / rect.width);
            y = y * (ch / rect.height);
            Browser.mouseMovementX = x - Browser.mouseX;
            Browser.mouseMovementY = y - Browser.mouseY;
            Browser.mouseX = x;
            Browser.mouseY = y
        }
    }
    ),
    asyncLoad: (function(url, onload, onerror, noRunDep) {
        var dep = !noRunDep ? getUniqueRunDependency("al " + url) : "";
        Module["readAsync"](url, (function(arrayBuffer) {
            assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
            onload(new Uint8Array(arrayBuffer));
            if (dep)
                removeRunDependency(dep)
        }
        ), (function(event) {
            if (onerror) {
                onerror()
            } else {
                throw 'Loading data file "' + url + '" failed.'
            }
        }
        ));
        if (dep)
            addRunDependency(dep)
    }
    ),
    resizeListeners: [],
    updateResizeListeners: (function() {
        var canvas = Module["canvas"];
        Browser.resizeListeners.forEach((function(listener) {
            listener(canvas.width, canvas.height)
        }
        ))
    }
    ),
    setCanvasSize: (function(width, height, noUpdates) {
        var canvas = Module["canvas"];
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates)
            Browser.updateResizeListeners()
    }
    ),
    windowedWidth: 0,
    windowedHeight: 0,
    setFullscreenCanvasSize: (function() {
        if (typeof SDL != "undefined") {
            var flags = HEAPU32[SDL.screen >> 2];
            flags = flags | 8388608;
            HEAP32[SDL.screen >> 2] = flags
        }
        Browser.updateCanvasDimensions(Module["canvas"]);
        Browser.updateResizeListeners()
    }
    ),
    setWindowedCanvasSize: (function() {
        if (typeof SDL != "undefined") {
            var flags = HEAPU32[SDL.screen >> 2];
            flags = flags & ~8388608;
            HEAP32[SDL.screen >> 2] = flags
        }
        Browser.updateCanvasDimensions(Module["canvas"]);
        Browser.updateResizeListeners()
    }
    ),
    updateCanvasDimensions: (function(canvas, wNative, hNative) {
        if (wNative && hNative) {
            canvas.widthNative = wNative;
            canvas.heightNative = hNative
        } else {
            wNative = canvas.widthNative;
            hNative = canvas.heightNative
        }
        var w = wNative;
        var h = hNative;
        if (Module["forcedAspectRatio"] && Module["forcedAspectRatio"] > 0) {
            if (w / h < Module["forcedAspectRatio"]) {
                w = Math.round(h * Module["forcedAspectRatio"])
            } else {
                h = Math.round(w / Module["forcedAspectRatio"])
            }
        }
        if ((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvas.parentNode && typeof screen != "undefined") {
            var factor = Math.min(screen.width / w, screen.height / h);
            w = Math.round(w * factor);
            h = Math.round(h * factor)
        }
        if (Browser.resizeCanvas) {
            if (canvas.width != w)
                canvas.width = w;
            if (canvas.height != h)
                canvas.height = h;
            if (typeof canvas.style != "undefined") {
                canvas.style.removeProperty("width");
                canvas.style.removeProperty("height")
            }
        } else {
            if (canvas.width != wNative)
                canvas.width = wNative;
            if (canvas.height != hNative)
                canvas.height = hNative;
            if (typeof canvas.style != "undefined") {
                if (w != wNative || h != hNative) {
                    canvas.style.setProperty("width", w + "px", "important");
                    canvas.style.setProperty("height", h + "px", "important")
                } else {
                    canvas.style.removeProperty("width");
                    canvas.style.removeProperty("height")
                }
            }
        }
    }
    ),
    wgetRequests: {},
    nextWgetRequestHandle: 0,
    getNextWgetRequestHandle: (function() {
        var handle = Browser.nextWgetRequestHandle;
        Browser.nextWgetRequestHandle++;
        return handle
    }
    )
};
function _SDL_GetTicks() {
    return Date.now() - SDL.startTime | 0
}
function _SDL_LockSurface(surf) {
    var surfData = SDL.surfaces[surf];
    surfData.locked++;
    if (surfData.locked > 1)
        return 0;
    if (!surfData.buffer) {
        surfData.buffer = _malloc(surfData.width * surfData.height * 4);
        HEAP32[surf + 20 >> 2] = surfData.buffer
    }
    HEAP32[surf + 20 >> 2] = surfData.buffer;
    if (surf == SDL.screen && Module.screenIsReadOnly && surfData.image)
        return 0;
    if (SDL.defaults.discardOnLock) {
        if (!surfData.image) {
            surfData.image = surfData.ctx.createImageData(surfData.width, surfData.height)
        }
        if (!SDL.defaults.opaqueFrontBuffer)
            return
    } else {
        surfData.image = surfData.ctx.getImageData(0, 0, surfData.width, surfData.height)
    }
    if (surf == SDL.screen && SDL.defaults.opaqueFrontBuffer) {
        var data = surfData.image.data;
        var num = data.length;
        for (var i = 0; i < num / 4; i++) {
            data[i * 4 + 3] = 255
        }
    }
    if (SDL.defaults.copyOnLock && !SDL.defaults.discardOnLock) {
        if (surfData.isFlagSet(2097152)) {
            throw "CopyOnLock is not supported for SDL_LockSurface with SDL_HWPALETTE flag set" + (new Error).stack
        } else {
            HEAPU8.set(surfData.image.data, surfData.buffer)
        }
    }
    return 0
}
var SDL = {
    defaults: {
        width: 320,
        height: 200,
        copyOnLock: true,
        discardOnLock: false,
        opaqueFrontBuffer: true
    },
    version: null,
    surfaces: {},
    canvasPool: [],
    events: [],
    fonts: [null],
    audios: [null],
    rwops: [null],
    music: {
        audio: null,
        volume: 1
    },
    mixerFrequency: 22050,
    mixerFormat: 32784,
    mixerNumChannels: 2,
    mixerChunkSize: 1024,
    channelMinimumNumber: 0,
    GL: false,
    glAttributes: {
        0: 3,
        1: 3,
        2: 2,
        3: 0,
        4: 0,
        5: 1,
        6: 16,
        7: 0,
        8: 0,
        9: 0,
        10: 0,
        11: 0,
        12: 0,
        13: 0,
        14: 0,
        15: 1,
        16: 0,
        17: 0,
        18: 0
    },
    keyboardState: null,
    keyboardMap: {},
    canRequestFullscreen: false,
    isRequestingFullscreen: false,
    textInput: false,
    startTime: null,
    initFlags: 0,
    buttonState: 0,
    modState: 0,
    DOMButtons: [0, 0, 0],
    DOMEventToSDLEvent: {},
    TOUCH_DEFAULT_ID: 0,
    eventHandler: null,
    eventHandlerContext: null,
    eventHandlerTemp: 0,
    keyCodes: {
        16: 1249,
        17: 1248,
        18: 1250,
        20: 1081,
        33: 1099,
        34: 1102,
        35: 1101,
        36: 1098,
        37: 1104,
        38: 1106,
        39: 1103,
        40: 1105,
        44: 316,
        45: 1097,
        46: 127,
        91: 1251,
        93: 1125,
        96: 1122,
        97: 1113,
        98: 1114,
        99: 1115,
        100: 1116,
        101: 1117,
        102: 1118,
        103: 1119,
        104: 1120,
        105: 1121,
        106: 1109,
        107: 1111,
        109: 1110,
        110: 1123,
        111: 1108,
        112: 1082,
        113: 1083,
        114: 1084,
        115: 1085,
        116: 1086,
        117: 1087,
        118: 1088,
        119: 1089,
        120: 1090,
        121: 1091,
        122: 1092,
        123: 1093,
        124: 1128,
        125: 1129,
        126: 1130,
        127: 1131,
        128: 1132,
        129: 1133,
        130: 1134,
        131: 1135,
        132: 1136,
        133: 1137,
        134: 1138,
        135: 1139,
        144: 1107,
        160: 94,
        161: 33,
        162: 34,
        163: 35,
        164: 36,
        165: 37,
        166: 38,
        167: 95,
        168: 40,
        169: 41,
        170: 42,
        171: 43,
        172: 124,
        173: 45,
        174: 123,
        175: 125,
        176: 126,
        181: 127,
        182: 129,
        183: 128,
        188: 44,
        190: 46,
        191: 47,
        192: 96,
        219: 91,
        220: 92,
        221: 93,
        222: 39,
        224: 1251
    },
    scanCodes: {
        8: 42,
        9: 43,
        13: 40,
        27: 41,
        32: 44,
        35: 204,
        39: 53,
        44: 54,
        46: 55,
        47: 56,
        48: 39,
        49: 30,
        50: 31,
        51: 32,
        52: 33,
        53: 34,
        54: 35,
        55: 36,
        56: 37,
        57: 38,
        58: 203,
        59: 51,
        61: 46,
        91: 47,
        92: 49,
        93: 48,
        96: 52,
        97: 4,
        98: 5,
        99: 6,
        100: 7,
        101: 8,
        102: 9,
        103: 10,
        104: 11,
        105: 12,
        106: 13,
        107: 14,
        108: 15,
        109: 16,
        110: 17,
        111: 18,
        112: 19,
        113: 20,
        114: 21,
        115: 22,
        116: 23,
        117: 24,
        118: 25,
        119: 26,
        120: 27,
        121: 28,
        122: 29,
        127: 76,
        305: 224,
        308: 226,
        316: 70
    },
    loadRect: (function(rect) {
        return {
            x: HEAP32[rect + 0 >> 2],
            y: HEAP32[rect + 4 >> 2],
            w: HEAP32[rect + 8 >> 2],
            h: HEAP32[rect + 12 >> 2]
        }
    }
    ),
    updateRect: (function(rect, r) {
        HEAP32[rect >> 2] = r.x;
        HEAP32[rect + 4 >> 2] = r.y;
        HEAP32[rect + 8 >> 2] = r.w;
        HEAP32[rect + 12 >> 2] = r.h
    }
    ),
    intersectionOfRects: (function(first, second) {
        var leftX = Math.max(first.x, second.x);
        var leftY = Math.max(first.y, second.y);
        var rightX = Math.min(first.x + first.w, second.x + second.w);
        var rightY = Math.min(first.y + first.h, second.y + second.h);
        return {
            x: leftX,
            y: leftY,
            w: Math.max(leftX, rightX) - leftX,
            h: Math.max(leftY, rightY) - leftY
        }
    }
    ),
    checkPixelFormat: (function(fmt) {}
    ),
    loadColorToCSSRGB: (function(color) {
        var rgba = HEAP32[color >> 2];
        return "rgb(" + (rgba & 255) + "," + (rgba >> 8 & 255) + "," + (rgba >> 16 & 255) + ")"
    }
    ),
    loadColorToCSSRGBA: (function(color) {
        var rgba = HEAP32[color >> 2];
        return "rgba(" + (rgba & 255) + "," + (rgba >> 8 & 255) + "," + (rgba >> 16 & 255) + "," + (rgba >> 24 & 255) / 255 + ")"
    }
    ),
    translateColorToCSSRGBA: (function(rgba) {
        return "rgba(" + (rgba & 255) + "," + (rgba >> 8 & 255) + "," + (rgba >> 16 & 255) + "," + (rgba >>> 24) / 255 + ")"
    }
    ),
    translateRGBAToCSSRGBA: (function(r, g, b, a) {
        return "rgba(" + (r & 255) + "," + (g & 255) + "," + (b & 255) + "," + (a & 255) / 255 + ")"
    }
    ),
    translateRGBAToColor: (function(r, g, b, a) {
        return r | g << 8 | b << 16 | a << 24
    }
    ),
    makeSurface: (function(width, height, flags, usePageCanvas, source, rmask, gmask, bmask, amask) {
        flags = flags || 0;
        var is_SDL_HWSURFACE = flags & 1;
        var is_SDL_HWPALETTE = flags & 2097152;
        var is_SDL_OPENGL = flags & 67108864;
        var surf = _malloc(60);
        var pixelFormat = _malloc(44);
        var bpp = is_SDL_HWPALETTE ? 1 : 4;
        var buffer = 0;
        if (!is_SDL_HWSURFACE && !is_SDL_OPENGL) {
            buffer = _malloc(width * height * 4)
        }
        HEAP32[surf >> 2] = flags;
        HEAP32[surf + 4 >> 2] = pixelFormat;
        HEAP32[surf + 8 >> 2] = width;
        HEAP32[surf + 12 >> 2] = height;
        HEAP32[surf + 16 >> 2] = width * bpp;
        HEAP32[surf + 20 >> 2] = buffer;
        HEAP32[surf + 36 >> 2] = 0;
        HEAP32[surf + 40 >> 2] = 0;
        HEAP32[surf + 44 >> 2] = Module["canvas"].width;
        HEAP32[surf + 48 >> 2] = Module["canvas"].height;
        HEAP32[surf + 56 >> 2] = 1;
        HEAP32[pixelFormat >> 2] = -2042224636;
        HEAP32[pixelFormat + 4 >> 2] = 0;
        HEAP8[pixelFormat + 8 >> 0] = bpp * 8;
        HEAP8[pixelFormat + 9 >> 0] = bpp;
        HEAP32[pixelFormat + 12 >> 2] = rmask || 255;
        HEAP32[pixelFormat + 16 >> 2] = gmask || 65280;
        HEAP32[pixelFormat + 20 >> 2] = bmask || 16711680;
        HEAP32[pixelFormat + 24 >> 2] = amask || 4278190080;
        SDL.GL = SDL.GL || is_SDL_OPENGL;
        var canvas;
        if (!usePageCanvas) {
            if (SDL.canvasPool.length > 0) {
                canvas = SDL.canvasPool.pop()
            } else {
                canvas = document.createElement("canvas")
            }
            canvas.width = width;
            canvas.height = height
        } else {
            canvas = Module["canvas"]
        }
        var webGLContextAttributes = {
            antialias: SDL.glAttributes[13] != 0 && SDL.glAttributes[14] > 1,
            depth: SDL.glAttributes[6] > 0,
            stencil: SDL.glAttributes[7] > 0,
            alpha: SDL.glAttributes[3] > 0
        };
        var ctx = Browser.createContext(canvas, is_SDL_OPENGL, usePageCanvas, webGLContextAttributes);
        SDL.surfaces[surf] = {
            width: width,
            height: height,
            canvas: canvas,
            ctx: ctx,
            surf: surf,
            buffer: buffer,
            pixelFormat: pixelFormat,
            alpha: 255,
            flags: flags,
            locked: 0,
            usePageCanvas: usePageCanvas,
            source: source,
            isFlagSet: (function(flag) {
                return flags & flag
            }
            )
        };
        return surf
    }
    ),
    copyIndexedColorData: (function(surfData, rX, rY, rW, rH) {
        if (!surfData.colors) {
            return
        }
        var fullWidth = Module["canvas"].width;
        var fullHeight = Module["canvas"].height;
        var startX = rX || 0;
        var startY = rY || 0;
        var endX = (rW || fullWidth - startX) + startX;
        var endY = (rH || fullHeight - startY) + startY;
        var buffer = surfData.buffer;
        if (!surfData.image.data32) {
            surfData.image.data32 = new Uint32Array(surfData.image.data.buffer)
        }
        var data32 = surfData.image.data32;
        var colors32 = surfData.colors32;
        for (var y = startY; y < endY; ++y) {
            var base = y * fullWidth;
            for (var x = startX; x < endX; ++x) {
                data32[base + x] = colors32[HEAPU8[buffer + base + x >> 0]]
            }
        }
    }
    ),
    freeSurface: (function(surf) {
        var refcountPointer = surf + 56;
        var refcount = HEAP32[refcountPointer >> 2];
        if (refcount > 1) {
            HEAP32[refcountPointer >> 2] = refcount - 1;
            return
        }
        var info = SDL.surfaces[surf];
        if (!info.usePageCanvas && info.canvas)
            SDL.canvasPool.push(info.canvas);
        if (info.buffer)
            _free(info.buffer);
        _free(info.pixelFormat);
        _free(surf);
        SDL.surfaces[surf] = null;
        if (surf === SDL.screen) {
            SDL.screen = null
        }
    }
    ),
    blitSurface: (function(src, srcrect, dst, dstrect, scale) {
        var srcData = SDL.surfaces[src];
        var dstData = SDL.surfaces[dst];
        var sr, dr;
        if (srcrect) {
            sr = SDL.loadRect(srcrect)
        } else {
            sr = {
                x: 0,
                y: 0,
                w: srcData.width,
                h: srcData.height
            }
        }
        if (dstrect) {
            dr = SDL.loadRect(dstrect)
        } else {
            dr = {
                x: 0,
                y: 0,
                w: srcData.width,
                h: srcData.height
            }
        }
        if (dstData.clipRect) {
            var widthScale = !scale || sr.w === 0 ? 1 : sr.w / dr.w;
            var heightScale = !scale || sr.h === 0 ? 1 : sr.h / dr.h;
            dr = SDL.intersectionOfRects(dstData.clipRect, dr);
            sr.w = dr.w * widthScale;
            sr.h = dr.h * heightScale;
            if (dstrect) {
                SDL.updateRect(dstrect, dr)
            }
        }
        var blitw, blith;
        if (scale) {
            blitw = dr.w;
            blith = dr.h
        } else {
            blitw = sr.w;
            blith = sr.h
        }
        if (sr.w === 0 || sr.h === 0 || blitw === 0 || blith === 0) {
            return 0
        }
        var oldAlpha = dstData.ctx.globalAlpha;
        dstData.ctx.globalAlpha = srcData.alpha / 255;
        dstData.ctx.drawImage(srcData.canvas, sr.x, sr.y, sr.w, sr.h, dr.x, dr.y, blitw, blith);
        dstData.ctx.globalAlpha = oldAlpha;
        if (dst != SDL.screen) {
            warnOnce("WARNING: copying canvas data to memory for compatibility");
            _SDL_LockSurface(dst);
            dstData.locked--
        }
        return 0
    }
    ),
    downFingers: {},
    savedKeydown: null,
    receiveEvent: (function(event) {
        function unpressAllPressedKeys() {
            for (var code in SDL.keyboardMap) {
                SDL.events.push({
                    type: "keyup",
                    keyCode: SDL.keyboardMap[code]
                })
            }
        }
        switch (event.type) {
        case "touchstart":
        case "touchmove":
            {
                event.preventDefault();
                var touches = [];
                if (event.type === "touchstart") {
                    for (var i = 0; i < event.touches.length; i++) {
                        var touch = event.touches[i];
                        if (SDL.downFingers[touch.identifier] != true) {
                            SDL.downFingers[touch.identifier] = true;
                            touches.push(touch)
                        }
                    }
                } else {
                    touches = event.touches
                }
                var firstTouch = touches[0];
                if (firstTouch) {
                    if (event.type == "touchstart") {
                        SDL.DOMButtons[0] = 1
                    }
                    var mouseEventType;
                    switch (event.type) {
                    case "touchstart":
                        mouseEventType = "mousedown";
                        break;
                    case "touchmove":
                        mouseEventType = "mousemove";
                        break
                    }
                    var mouseEvent = {
                        type: mouseEventType,
                        button: 0,
                        pageX: firstTouch.clientX,
                        pageY: firstTouch.clientY
                    };
                    SDL.events.push(mouseEvent)
                }
                for (var i = 0; i < touches.length; i++) {
                    var touch = touches[i];
                    SDL.events.push({
                        type: event.type,
                        touch: touch
                    })
                }
                break
            }
            ;
        case "touchend":
            {
                event.preventDefault();
                for (var i = 0; i < event.changedTouches.length; i++) {
                    var touch = event.changedTouches[i];
                    if (SDL.downFingers[touch.identifier] === true) {
                        delete SDL.downFingers[touch.identifier]
                    }
                }
                var mouseEvent = {
                    type: "mouseup",
                    button: 0,
                    pageX: event.changedTouches[0].clientX,
                    pageY: event.changedTouches[0].clientY
                };
                SDL.DOMButtons[0] = 0;
                SDL.events.push(mouseEvent);
                for (var i = 0; i < event.changedTouches.length; i++) {
                    var touch = event.changedTouches[i];
                    SDL.events.push({
                        type: "touchend",
                        touch: touch
                    })
                }
                break
            }
            ;
        case "DOMMouseScroll":
        case "mousewheel":
        case "wheel":
            var delta = -Browser.getMouseWheelDelta(event);
            delta = delta == 0 ? 0 : delta > 0 ? Math.max(delta, 1) : Math.min(delta, -1);
            var button = delta > 0 ? 3 : 4;
            SDL.events.push({
                type: "mousedown",
                button: button,
                pageX: event.pageX,
                pageY: event.pageY
            });
            SDL.events.push({
                type: "mouseup",
                button: button,
                pageX: event.pageX,
                pageY: event.pageY
            });
            SDL.events.push({
                type: "wheel",
                deltaX: 0,
                deltaY: delta
            });
            event.preventDefault();
            break;
        case "mousemove":
            if (SDL.DOMButtons[0] === 1) {
                SDL.events.push({
                    type: "touchmove",
                    touch: {
                        identifier: 0,
                        deviceID: -1,
                        pageX: event.pageX,
                        pageY: event.pageY
                    }
                })
            }
            if (Browser.pointerLock) {
                if ("mozMovementX"in event) {
                    event["movementX"] = event["mozMovementX"];
                    event["movementY"] = event["mozMovementY"]
                }
                if (event["movementX"] == 0 && event["movementY"] == 0) {
                    event.preventDefault();
                    return
                }
            }
            ;
        case "keydown":
        case "keyup":
        case "keypress":
        case "mousedown":
        case "mouseup":
            if (event.type !== "keydown" || !SDL.unicode && !SDL.textInput || event.keyCode === 8 || event.keyCode === 9) {
                event.preventDefault()
            }
            if (event.type == "mousedown") {
                SDL.DOMButtons[event.button] = 1;
                SDL.events.push({
                    type: "touchstart",
                    touch: {
                        identifier: 0,
                        deviceID: -1,
                        pageX: event.pageX,
                        pageY: event.pageY
                    }
                })
            } else if (event.type == "mouseup") {
                if (!SDL.DOMButtons[event.button]) {
                    return
                }
                SDL.events.push({
                    type: "touchend",
                    touch: {
                        identifier: 0,
                        deviceID: -1,
                        pageX: event.pageX,
                        pageY: event.pageY
                    }
                });
                SDL.DOMButtons[event.button] = 0
            }
            if (event.type === "keydown" || event.type === "mousedown") {
                SDL.canRequestFullscreen = true
            } else if (event.type === "keyup" || event.type === "mouseup") {
                if (SDL.isRequestingFullscreen) {
                    Module["requestFullscreen"](true, true);
                    SDL.isRequestingFullscreen = false
                }
                SDL.canRequestFullscreen = false
            }
            if (event.type === "keypress" && SDL.savedKeydown) {
                SDL.savedKeydown.keypressCharCode = event.charCode;
                SDL.savedKeydown = null
            } else if (event.type === "keydown") {
                SDL.savedKeydown = event
            }
            if (event.type !== "keypress" || SDL.textInput) {
                SDL.events.push(event)
            }
            break;
        case "mouseout":
            for (var i = 0; i < 3; i++) {
                if (SDL.DOMButtons[i]) {
                    SDL.events.push({
                        type: "mouseup",
                        button: i,
                        pageX: event.pageX,
                        pageY: event.pageY
                    });
                    SDL.DOMButtons[i] = 0
                }
            }
            event.preventDefault();
            break;
        case "focus":
            SDL.events.push(event);
            event.preventDefault();
            break;
        case "blur":
            SDL.events.push(event);
            unpressAllPressedKeys();
            event.preventDefault();
            break;
        case "visibilitychange":
            SDL.events.push({
                type: "visibilitychange",
                visible: !document.hidden
            });
            unpressAllPressedKeys();
            event.preventDefault();
            break;
        case "unload":
            if (Browser.mainLoop.runner) {
                SDL.events.push(event);
                Browser.mainLoop.runner()
            }
            return;
        case "resize":
            SDL.events.push(event);
            if (event.preventDefault) {
                event.preventDefault()
            }
            break
        }
        if (SDL.events.length >= 1e4) {
            err("SDL event queue full, dropping events");
            SDL.events = SDL.events.slice(0, 1e4)
        }
        SDL.flushEventsToHandler();
        return
    }
    ),
    lookupKeyCodeForEvent: (function(event) {
        var code = event.keyCode;
        if (code >= 65 && code <= 90) {
            code += 32
        } else {
            code = SDL.keyCodes[event.keyCode] || event.keyCode;
            if (event.location === KeyboardEvent.DOM_KEY_LOCATION_RIGHT && code >= (224 | 1 << 10) && code <= (227 | 1 << 10)) {
                code += 4
            }
        }
        return code
    }
    ),
    handleEvent: (function(event) {
        if (event.handled)
            return;
        event.handled = true;
        switch (event.type) {
        case "touchstart":
        case "touchend":
        case "touchmove":
            {
                Browser.calculateMouseEvent(event);
                break
            }
            ;
        case "keydown":
        case "keyup":
            {
                var down = event.type === "keydown";
                var code = SDL.lookupKeyCodeForEvent(event);
                HEAP8[SDL.keyboardState + code >> 0] = down;
                SDL.modState = (HEAP8[SDL.keyboardState + 1248 >> 0] ? 64 : 0) | (HEAP8[SDL.keyboardState + 1249 >> 0] ? 1 : 0) | (HEAP8[SDL.keyboardState + 1250 >> 0] ? 256 : 0) | (HEAP8[SDL.keyboardState + 1252 >> 0] ? 128 : 0) | (HEAP8[SDL.keyboardState + 1253 >> 0] ? 2 : 0) | (HEAP8[SDL.keyboardState + 1254 >> 0] ? 512 : 0);
                if (down) {
                    SDL.keyboardMap[code] = event.keyCode
                } else {
                    delete SDL.keyboardMap[code]
                }
                break
            }
            ;
        case "mousedown":
        case "mouseup":
            if (event.type == "mousedown") {
                SDL.buttonState |= 1 << event.button
            } else if (event.type == "mouseup") {
                SDL.buttonState &= ~(1 << event.button)
            }
            ;
        case "mousemove":
            {
                Browser.calculateMouseEvent(event);
                break
            }
        }
    }
    ),
    flushEventsToHandler: (function() {
        if (!SDL.eventHandler)
            return;
        while (SDL.pollEvent(SDL.eventHandlerTemp)) {
            Module["dynCall_iii"](SDL.eventHandler, SDL.eventHandlerContext, SDL.eventHandlerTemp)
        }
    }
    ),
    pollEvent: (function(ptr) {
        if (SDL.initFlags & 512 && SDL.joystickEventState) {
            SDL.queryJoysticks()
        }
        if (ptr) {
            while (SDL.events.length > 0) {
                if (SDL.makeCEvent(SDL.events.shift(), ptr) !== false)
                    return 1
            }
            return 0
        } else {
            return SDL.events.length > 0
        }
    }
    ),
    makeCEvent: (function(event, ptr) {
        if (typeof event === "number") {
            _memcpy(ptr, event, 28);
            _free(event);
            return
        }
        SDL.handleEvent(event);
        switch (event.type) {
        case "keydown":
        case "keyup":
            {
                var down = event.type === "keydown";
                var key = SDL.lookupKeyCodeForEvent(event);
                var scan;
                if (key >= 1024) {
                    scan = key - 1024
                } else {
                    scan = SDL.scanCodes[key] || key
                }
                HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
                HEAP8[ptr + 8 >> 0] = down ? 1 : 0;
                HEAP8[ptr + 9 >> 0] = 0;
                HEAP32[ptr + 12 >> 2] = scan;
                HEAP32[ptr + 16 >> 2] = key;
                HEAP16[ptr + 20 >> 1] = SDL.modState;
                HEAP32[ptr + 24 >> 2] = event.keypressCharCode || key;
                break
            }
            ;
        case "keypress":
            {
                HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
                var cStr = intArrayFromString(String.fromCharCode(event.charCode));
                for (var i = 0; i < cStr.length; ++i) {
                    HEAP8[ptr + (8 + i) >> 0] = cStr[i]
                }
                break
            }
            ;
        case "mousedown":
        case "mouseup":
        case "mousemove":
            {
                if (event.type != "mousemove") {
                    var down = event.type === "mousedown";
                    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
                    HEAP32[ptr + 4 >> 2] = 0;
                    HEAP32[ptr + 8 >> 2] = 0;
                    HEAP32[ptr + 12 >> 2] = 0;
                    HEAP8[ptr + 16 >> 0] = event.button + 1;
                    HEAP8[ptr + 17 >> 0] = down ? 1 : 0;
                    HEAP32[ptr + 20 >> 2] = Browser.mouseX;
                    HEAP32[ptr + 24 >> 2] = Browser.mouseY
                } else {
                    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
                    HEAP32[ptr + 4 >> 2] = 0;
                    HEAP32[ptr + 8 >> 2] = 0;
                    HEAP32[ptr + 12 >> 2] = 0;
                    HEAP32[ptr + 16 >> 2] = SDL.buttonState;
                    HEAP32[ptr + 20 >> 2] = Browser.mouseX;
                    HEAP32[ptr + 24 >> 2] = Browser.mouseY;
                    HEAP32[ptr + 28 >> 2] = Browser.mouseMovementX;
                    HEAP32[ptr + 32 >> 2] = Browser.mouseMovementY
                }
                break
            }
            ;
        case "wheel":
            {
                HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
                HEAP32[ptr + 16 >> 2] = event.deltaX;
                HEAP32[ptr + 20 >> 2] = event.deltaY;
                break
            }
            ;
        case "touchstart":
        case "touchend":
        case "touchmove":
            {
                var touch = event.touch;
                if (!Browser.touches[touch.identifier])
                    break;
                var w = Module["canvas"].width;
                var h = Module["canvas"].height;
                var x = Browser.touches[touch.identifier].x / w;
                var y = Browser.touches[touch.identifier].y / h;
                var lx = Browser.lastTouches[touch.identifier].x / w;
                var ly = Browser.lastTouches[touch.identifier].y / h;
                var dx = x - lx;
                var dy = y - ly;
                if (touch["deviceID"] === undefined)
                    touch.deviceID = SDL.TOUCH_DEFAULT_ID;
                if (dx === 0 && dy === 0 && event.type === "touchmove")
                    return false;
                HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
                HEAP32[ptr + 4 >> 2] = _SDL_GetTicks();
                tempI64 = [touch.deviceID >>> 0, (tempDouble = touch.deviceID,
                +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)],
                HEAP32[ptr + 8 >> 2] = tempI64[0],
                HEAP32[ptr + 12 >> 2] = tempI64[1];
                tempI64 = [touch.identifier >>> 0, (tempDouble = touch.identifier,
                +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)],
                HEAP32[ptr + 16 >> 2] = tempI64[0],
                HEAP32[ptr + 20 >> 2] = tempI64[1];
                HEAPF32[ptr + 24 >> 2] = x;
                HEAPF32[ptr + 28 >> 2] = y;
                HEAPF32[ptr + 32 >> 2] = dx;
                HEAPF32[ptr + 36 >> 2] = dy;
                if (touch.force !== undefined) {
                    HEAPF32[ptr + 40 >> 2] = touch.force
                } else {
                    HEAPF32[ptr + 40 >> 2] = event.type == "touchend" ? 0 : 1
                }
                break
            }
            ;
        case "unload":
            {
                HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
                break
            }
            ;
        case "resize":
            {
                HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
                HEAP32[ptr + 4 >> 2] = event.w;
                HEAP32[ptr + 8 >> 2] = event.h;
                break
            }
            ;
        case "joystick_button_up":
        case "joystick_button_down":
            {
                var state = event.type === "joystick_button_up" ? 0 : 1;
                HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
                HEAP8[ptr + 4 >> 0] = event.index;
                HEAP8[ptr + 5 >> 0] = event.button;
                HEAP8[ptr + 6 >> 0] = state;
                break
            }
            ;
        case "joystick_axis_motion":
            {
                HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
                HEAP8[ptr + 4 >> 0] = event.index;
                HEAP8[ptr + 5 >> 0] = event.axis;
                HEAP32[ptr + 8 >> 2] = SDL.joystickAxisValueConversion(event.value);
                break
            }
            ;
        case "focus":
            {
                var SDL_WINDOWEVENT_FOCUS_GAINED = 12;
                HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
                HEAP32[ptr + 4 >> 2] = 0;
                HEAP8[ptr + 8 >> 0] = SDL_WINDOWEVENT_FOCUS_GAINED;
                break
            }
            ;
        case "blur":
            {
                var SDL_WINDOWEVENT_FOCUS_LOST = 13;
                HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
                HEAP32[ptr + 4 >> 2] = 0;
                HEAP8[ptr + 8 >> 0] = SDL_WINDOWEVENT_FOCUS_LOST;
                break
            }
            ;
        case "visibilitychange":
            {
                var SDL_WINDOWEVENT_SHOWN = 1;
                var SDL_WINDOWEVENT_HIDDEN = 2;
                var visibilityEventID = event.visible ? SDL_WINDOWEVENT_SHOWN : SDL_WINDOWEVENT_HIDDEN;
                HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
                HEAP32[ptr + 4 >> 2] = 0;
                HEAP8[ptr + 8 >> 0] = visibilityEventID;
                break
            }
            ;
        default:
            throw "Unhandled SDL event: " + event.type
        }
    }
    ),
    makeFontString: (function(height, fontName) {
        if (fontName.charAt(0) != "'" && fontName.charAt(0) != '"') {
            fontName = '"' + fontName + '"'
        }
        return height + "px " + fontName + ", serif"
    }
    ),
    estimateTextWidth: (function(fontData, text) {
        var h = fontData.size;
        var fontString = SDL.makeFontString(h, fontData.name);
        var tempCtx = SDL.ttfContext;
        tempCtx.save();
        tempCtx.font = fontString;
        var ret = tempCtx.measureText(text).width | 0;
        tempCtx.restore();
        return ret
    }
    ),
    allocateChannels: (function(num) {
        if (SDL.numChannels && SDL.numChannels >= num && num != 0)
            return;
        SDL.numChannels = num;
        SDL.channels = [];
        for (var i = 0; i < num; i++) {
            SDL.channels[i] = {
                audio: null,
                volume: 1
            }
        }
    }
    ),
    setGetVolume: (function(info, volume) {
        if (!info)
            return 0;
        var ret = info.volume * 128;
        if (volume != -1) {
            info.volume = Math.min(Math.max(volume, 0), 128) / 128;
            if (info.audio) {
                try {
                    info.audio.volume = info.volume;
                    if (info.audio.webAudioGainNode)
                        info.audio.webAudioGainNode["gain"]["value"] = info.volume
                } catch (e) {
                    err("setGetVolume failed to set audio volume: " + e)
                }
            }
        }
        return ret
    }
    ),
    setPannerPosition: (function(info, x, y, z) {
        if (!info)
            return;
        if (info.audio) {
            if (info.audio.webAudioPannerNode) {
                info.audio.webAudioPannerNode["setPosition"](x, y, z)
            }
        }
    }
    ),
    playWebAudio: (function(audio) {
        if (!audio)
            return;
        if (audio.webAudioNode)
            return;
        if (!SDL.webAudioAvailable())
            return;
        try {
            var webAudio = audio.resource.webAudio;
            audio.paused = false;
            if (!webAudio.decodedBuffer) {
                if (webAudio.onDecodeComplete === undefined)
                    abort("Cannot play back audio object that was not loaded");
                webAudio.onDecodeComplete.push((function() {
                    if (!audio.paused)
                        SDL.playWebAudio(audio)
                }
                ));
                return
            }
            audio.webAudioNode = SDL.audioContext["createBufferSource"]();
            audio.webAudioNode["buffer"] = webAudio.decodedBuffer;
            audio.webAudioNode["loop"] = audio.loop;
            audio.webAudioNode["onended"] = (function() {
                audio["onended"]()
            }
            );
            audio.webAudioPannerNode = SDL.audioContext["createPanner"]();
            audio.webAudioPannerNode["setPosition"](0, 0, -.5);
            audio.webAudioPannerNode["panningModel"] = "equalpower";
            audio.webAudioGainNode = SDL.audioContext["createGain"]();
            audio.webAudioGainNode["gain"]["value"] = audio.volume;
            audio.webAudioNode["connect"](audio.webAudioPannerNode);
            audio.webAudioPannerNode["connect"](audio.webAudioGainNode);
            audio.webAudioGainNode["connect"](SDL.audioContext["destination"]);
            audio.webAudioNode["start"](0, audio.currentPosition);
            audio.startTime = SDL.audioContext["currentTime"] - audio.currentPosition
        } catch (e) {
            err("playWebAudio failed: " + e)
        }
    }
    ),
    pauseWebAudio: (function(audio) {
        if (!audio)
            return;
        if (audio.webAudioNode) {
            try {
                audio.currentPosition = (SDL.audioContext["currentTime"] - audio.startTime) % audio.resource.webAudio.decodedBuffer.duration;
                audio.webAudioNode["onended"] = undefined;
                audio.webAudioNode.stop(0);
                audio.webAudioNode = undefined
            } catch (e) {
                err("pauseWebAudio failed: " + e)
            }
        }
        audio.paused = true
    }
    ),
    openAudioContext: (function() {
        if (!SDL.audioContext) {
            if (typeof AudioContext !== "undefined")
                SDL.audioContext = new AudioContext;
            else if (typeof webkitAudioContext !== "undefined")
                SDL.audioContext = new webkitAudioContext
        }
    }
    ),
    webAudioAvailable: (function() {
        return !!SDL.audioContext
    }
    ),
    fillWebAudioBufferFromHeap: (function(heapPtr, sizeSamplesPerChannel, dstAudioBuffer) {
        var numChannels = SDL.audio.channels;
        for (var c = 0; c < numChannels; ++c) {
            var channelData = dstAudioBuffer["getChannelData"](c);
            if (channelData.length != sizeSamplesPerChannel) {
                throw "Web Audio output buffer length mismatch! Destination size: " + channelData.length + " samples vs expected " + sizeSamplesPerChannel + " samples!"
            }
            if (SDL.audio.format == 32784) {
                for (var j = 0; j < sizeSamplesPerChannel; ++j) {
                    channelData[j] = HEAP16[heapPtr + (j * numChannels + c) * 2 >> 1] / 32768
                }
            } else if (SDL.audio.format == 8) {
                for (var j = 0; j < sizeSamplesPerChannel; ++j) {
                    var v = HEAP8[heapPtr + (j * numChannels + c) >> 0];
                    channelData[j] = (v >= 0 ? v - 128 : v + 128) / 128
                }
            } else if (SDL.audio.format == 33056) {
                for (var j = 0; j < sizeSamplesPerChannel; ++j) {
                    channelData[j] = HEAPF32[heapPtr + (j * numChannels + c) * 4 >> 2]
                }
            } else {
                throw "Invalid SDL audio format " + SDL.audio.format + "!"
            }
        }
    }
    ),
    debugSurface: (function(surfData) {
        console.log("dumping surface " + [surfData.surf, surfData.source, surfData.width, surfData.height]);
        var image = surfData.ctx.getImageData(0, 0, surfData.width, surfData.height);
        var data = image.data;
        var num = Math.min(surfData.width, surfData.height);
        for (var i = 0; i < num; i++) {
            console.log("   diagonal " + i + ":" + [data[i * surfData.width * 4 + i * 4 + 0], data[i * surfData.width * 4 + i * 4 + 1], data[i * surfData.width * 4 + i * 4 + 2], data[i * surfData.width * 4 + i * 4 + 3]])
        }
    }
    ),
    joystickEventState: 1,
    lastJoystickState: {},
    joystickNamePool: {},
    recordJoystickState: (function(joystick, state) {
        var buttons = new Array(state.buttons.length);
        for (var i = 0; i < state.buttons.length; i++) {
            buttons[i] = SDL.getJoystickButtonState(state.buttons[i])
        }
        SDL.lastJoystickState[joystick] = {
            buttons: buttons,
            axes: state.axes.slice(0),
            timestamp: state.timestamp,
            index: state.index,
            id: state.id
        }
    }
    ),
    getJoystickButtonState: (function(button) {
        if (typeof button === "object") {
            return button["pressed"]
        } else {
            return button > 0
        }
    }
    ),
    queryJoysticks: (function() {
        for (var joystick in SDL.lastJoystickState) {
            var state = SDL.getGamepad(joystick - 1);
            var prevState = SDL.lastJoystickState[joystick];
            if (typeof state === "undefined")
                return;
            if (state === null)
                return;
            if (typeof state.timestamp !== "number" || state.timestamp !== prevState.timestamp || !state.timestamp) {
                var i;
                for (i = 0; i < state.buttons.length; i++) {
                    var buttonState = SDL.getJoystickButtonState(state.buttons[i]);
                    if (buttonState !== prevState.buttons[i]) {
                        SDL.events.push({
                            type: buttonState ? "joystick_button_down" : "joystick_button_up",
                            joystick: joystick,
                            index: joystick - 1,
                            button: i
                        })
                    }
                }
                for (i = 0; i < state.axes.length; i++) {
                    if (state.axes[i] !== prevState.axes[i]) {
                        SDL.events.push({
                            type: "joystick_axis_motion",
                            joystick: joystick,
                            index: joystick - 1,
                            axis: i,
                            value: state.axes[i]
                        })
                    }
                }
                SDL.recordJoystickState(joystick, state)
            }
        }
    }
    ),
    joystickAxisValueConversion: (function(value) {
        value = Math.min(1, Math.max(value, -1));
        return Math.ceil((value + 1) * 32767.5 - 32768)
    }
    ),
    getGamepads: (function() {
        var fcn = navigator.getGamepads || navigator.webkitGamepads || navigator.mozGamepads || navigator.gamepads || navigator.webkitGetGamepads;
        if (fcn !== undefined) {
            return fcn.apply(navigator)
        } else {
            return []
        }
    }
    ),
    getGamepad: (function(deviceIndex) {
        var gamepads = SDL.getGamepads();
        if (gamepads.length > deviceIndex && deviceIndex >= 0) {
            return gamepads[deviceIndex]
        }
        return null
    }
    )
};
function _SDL_Delay(delay) {
    if (!ENVIRONMENT_IS_WORKER)
        abort("SDL_Delay called on the main thread! Potential infinite loop, quitting.");
    var now = Date.now();
    while (Date.now() - now < delay) {}
}
var ENV = {};
function ___buildEnvironment(environ) {
    var MAX_ENV_VALUES = 64;
    var TOTAL_ENV_SIZE = 1024;
    var poolPtr;
    var envPtr;
    if (!___buildEnvironment.called) {
        ___buildEnvironment.called = true;
        ENV["USER"] = ENV["LOGNAME"] = "web_user";
        ENV["PATH"] = "/";
        ENV["PWD"] = "/";
        ENV["HOME"] = "/home/web_user";
        ENV["LANG"] = "C.UTF-8";
        ENV["_"] = Module["thisProgram"];
        poolPtr = getMemory(TOTAL_ENV_SIZE);
        envPtr = getMemory(MAX_ENV_VALUES * 4);
        HEAP32[envPtr >> 2] = poolPtr;
        HEAP32[environ >> 2] = envPtr
    } else {
        envPtr = HEAP32[environ >> 2];
        poolPtr = HEAP32[envPtr >> 2]
    }
    var strings = [];
    var totalSize = 0;
    for (var key in ENV) {
        if (typeof ENV[key] === "string") {
            var line = key + "=" + ENV[key];
            strings.push(line);
            totalSize += line.length
        }
    }
    if (totalSize > TOTAL_ENV_SIZE) {
        throw new Error("Environment size exceeded TOTAL_ENV_SIZE!")
    }
    var ptrSize = 4;
    for (var i = 0; i < strings.length; i++) {
        var line = strings[i];
        writeAsciiToMemory(line, poolPtr);
        HEAP32[envPtr + i * ptrSize >> 2] = poolPtr;
        poolPtr += line.length + 1
    }
    HEAP32[envPtr + strings.length * ptrSize >> 2] = 0
}
var SYSCALLS = {
    varargs: 0,
    get: (function(varargs) {
        SYSCALLS.varargs += 4;
        var ret = HEAP32[SYSCALLS.varargs - 4 >> 2];
        return ret
    }
    ),
    getStr: (function() {
        var ret = Pointer_stringify(SYSCALLS.get());
        return ret
    }
    ),
    get64: (function() {
        var low = SYSCALLS.get()
          , high = SYSCALLS.get();
        if (low >= 0)
            assert(high === 0);
        else
            assert(high === -1);
        return low
    }
    ),
    getZero: (function() {
        assert(SYSCALLS.get() === 0)
    }
    )
};
function ___syscall140(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var stream = SYSCALLS.getStreamFromFD()
          , offset_high = SYSCALLS.get()
          , offset_low = SYSCALLS.get()
          , result = SYSCALLS.get()
          , whence = SYSCALLS.get();
        var offset = offset_low;
        FS.llseek(stream, offset, whence);
        HEAP32[result >> 2] = stream.position;
        if (stream.getdents && offset === 0 && whence === 0)
            stream.getdents = null;
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno
    }
}
function ___syscall146(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var stream = SYSCALLS.get()
          , iov = SYSCALLS.get()
          , iovcnt = SYSCALLS.get();
        var ret = 0;
        if (!___syscall146.buffers) {
            ___syscall146.buffers = [null, [], []];
            ___syscall146.printChar = (function(stream, curr) {
                var buffer = ___syscall146.buffers[stream];
                assert(buffer);
                if (curr === 0 || curr === 10) {
                    (stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0));
                    buffer.length = 0
                } else {
                    buffer.push(curr)
                }
            }
            )
        }
        for (var i = 0; i < iovcnt; i++) {
            var ptr = HEAP32[iov + i * 8 >> 2];
            var len = HEAP32[iov + (i * 8 + 4) >> 2];
            for (var j = 0; j < len; j++) {
                ___syscall146.printChar(stream, HEAPU8[ptr + j])
            }
            ret += len
        }
        return ret
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno
    }
}
function ___syscall202(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno
    }
}
function ___syscall199() {
    return ___syscall202.apply(null, arguments)
}
var PROCINFO = {
    ppid: 1,
    pid: 42,
    sid: 42,
    pgid: 42
};
function ___syscall20(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        return PROCINFO.pid
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno
    }
}
function ___syscall54(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno
    }
}
function ___syscall6(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var stream = SYSCALLS.getStreamFromFD();
        FS.close(stream);
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno
    }
}
var AL = {
    QUEUE_INTERVAL: 25,
    QUEUE_LOOKAHEAD: .1,
    DEVICE_NAME: "Emscripten OpenAL",
    CAPTURE_DEVICE_NAME: "Emscripten OpenAL capture",
    ALC_EXTENSIONS: {
        ALC_SOFT_pause_device: true,
        ALC_SOFT_HRTF: true
    },
    AL_EXTENSIONS: {
        AL_EXT_float32: true,
        AL_SOFT_loop_points: true,
        AL_SOFT_source_length: true,
        AL_EXT_source_distance_model: true,
        AL_SOFT_source_spatialize: true
    },
    _alcErr: 0,
    alcErr: 0,
    deviceRefCounts: {},
    alcStringCache: {},
    paused: false,
    stringCache: {},
    contexts: {},
    currentCtx: null,
    buffers: {
        0: {
            id: 0,
            refCount: 0,
            audioBuf: null,
            frequency: 0,
            bytesPerSample: 2,
            channels: 1,
            length: 0
        }
    },
    paramArray: [],
    _nextId: 1,
    newId: (function() {
        return AL.freeIds.length > 0 ? AL.freeIds.pop() : AL._nextId++
    }
    ),
    freeIds: [],
    scheduleContextAudio: (function(ctx) {
        if (Browser.mainLoop.timingMode === 1 && document["visibilityState"] != "visible") {
            return
        }
        for (var i in ctx.sources) {
            AL.scheduleSourceAudio(ctx.sources[i])
        }
    }
    ),
    scheduleSourceAudio: (function(src, lookahead) {
        if (Browser.mainLoop.timingMode === 1 && document["visibilityState"] != "visible") {
            return
        }
        if (src.state !== 4114) {
            return
        }
        var currentTime = AL.updateSourceTime(src);
        var startTime = src.bufStartTime;
        var startOffset = src.bufOffset;
        var bufCursor = src.bufsProcessed;
        for (var i = 0; i < src.audioQueue.length; i++) {
            var audioSrc = src.audioQueue[i];
            startTime = audioSrc._startTime + audioSrc._duration;
            startOffset = 0;
            bufCursor += audioSrc._skipCount + 1
        }
        if (!lookahead) {
            lookahead = AL.QUEUE_LOOKAHEAD
        }
        var lookaheadTime = currentTime + lookahead;
        var skipCount = 0;
        while (startTime < lookaheadTime) {
            if (bufCursor >= src.bufQueue.length) {
                if (src.looping) {
                    bufCursor %= src.bufQueue.length
                } else {
                    break
                }
            }
            var buf = src.bufQueue[bufCursor % src.bufQueue.length];
            if (buf.length === 0) {
                skipCount++;
                if (skipCount === src.bufQueue.length) {
                    break
                }
            } else {
                var audioSrc = src.context.audioCtx.createBufferSource();
                audioSrc.buffer = buf.audioBuf;
                audioSrc.playbackRate.value = src.playbackRate;
                if (buf.audioBuf._loopStart || buf.audioBuf._loopEnd) {
                    audioSrc.loopStart = buf.audioBuf._loopStart;
                    audioSrc.loopEnd = buf.audioBuf._loopEnd
                }
                var duration = 0;
                if (src.type === 4136 && src.looping) {
                    duration = Number.POSITIVE_INFINITY;
                    audioSrc.loop = true;
                    if (buf.audioBuf._loopStart) {
                        audioSrc.loopStart = buf.audioBuf._loopStart
                    }
                    if (buf.audioBuf._loopEnd) {
                        audioSrc.loopEnd = buf.audioBuf._loopEnd
                    }
                } else {
                    duration = (buf.audioBuf.duration - startOffset) / src.playbackRate
                }
                audioSrc._startOffset = startOffset;
                audioSrc._duration = duration;
                audioSrc._skipCount = skipCount;
                skipCount = 0;
                audioSrc.connect(src.gain);
                if (typeof audioSrc.start !== "undefined") {
                    startTime = Math.max(startTime, src.context.audioCtx.currentTime);
                    audioSrc.start(startTime, startOffset)
                } else if (typeof audioSrc.noteOn !== "undefined") {
                    startTime = Math.max(startTime, src.context.audioCtx.currentTime);
                    audioSrc.noteOn(startTime)
                }
                audioSrc._startTime = startTime;
                src.audioQueue.push(audioSrc);
                startTime += duration
            }
            startOffset = 0;
            bufCursor++
        }
    }
    ),
    updateSourceTime: (function(src) {
        var currentTime = src.context.audioCtx.currentTime;
        if (src.state !== 4114) {
            return currentTime
        }
        if (!isFinite(src.bufStartTime)) {
            src.bufStartTime = currentTime - src.bufOffset / src.playbackRate;
            src.bufOffset = 0
        }
        var nextStartTime = 0;
        while (src.audioQueue.length) {
            var audioSrc = src.audioQueue[0];
            src.bufsProcessed += audioSrc._skipCount;
            nextStartTime = audioSrc._startTime + audioSrc._duration;
            if (currentTime < nextStartTime) {
                break
            }
            src.audioQueue.shift();
            src.bufStartTime = nextStartTime;
            src.bufOffset = 0;
            src.bufsProcessed++
        }
        if (src.bufsProcessed >= src.bufQueue.length && !src.looping) {
            AL.setSourceState(src, 4116)
        } else if (src.type === 4136 && src.looping) {
            var buf = src.bufQueue[0];
            if (buf.length === 0) {
                src.bufOffset = 0
            } else {
                var delta = (currentTime - src.bufStartTime) * src.playbackRate;
                var loopStart = buf.audioBuf._loopStart || 0;
                var loopEnd = buf.audioBuf._loopEnd || buf.audioBuf.duration;
                if (loopEnd <= loopStart) {
                    loopEnd = buf.audioBuf.duration
                }
                if (delta < loopEnd) {
                    src.bufOffset = delta
                } else {
                    src.bufOffset = loopStart + (delta - loopStart) % (loopEnd - loopStart)
                }
            }
        } else if (src.audioQueue[0]) {
            src.bufOffset = (currentTime - src.audioQueue[0]._startTime) * src.playbackRate
        } else {
            if (src.type !== 4136 && src.looping) {
                var srcDuration = AL.sourceDuration(src) / src.playbackRate;
                if (srcDuration > 0) {
                    src.bufStartTime += Math.floor((currentTime - src.bufStartTime) / srcDuration) * srcDuration
                }
            }
            for (var i = 0; i < src.bufQueue.length; i++) {
                if (src.bufsProcessed >= src.bufQueue.length) {
                    if (src.looping) {
                        src.bufsProcessed %= src.bufQueue.length
                    } else {
                        AL.setSourceState(src, 4116);
                        break
                    }
                }
                var buf = src.bufQueue[src.bufsProcessed];
                if (buf.length > 0) {
                    nextStartTime = src.bufStartTime + buf.audioBuf.duration / src.playbackRate;
                    if (currentTime < nextStartTime) {
                        src.bufOffset = (currentTime - src.bufStartTime) * src.playbackRate;
                        break
                    }
                    src.bufStartTime = nextStartTime
                }
                src.bufOffset = 0;
                src.bufsProcessed++
            }
        }
        return currentTime
    }
    ),
    cancelPendingSourceAudio: (function(src) {
        AL.updateSourceTime(src);
        for (var i = 1; i < src.audioQueue.length; i++) {
            var audioSrc = src.audioQueue[i];
            audioSrc.stop()
        }
        if (src.audioQueue.length > 1) {
            src.audioQueue.length = 1
        }
    }
    ),
    stopSourceAudio: (function(src) {
        for (var i = 0; i < src.audioQueue.length; i++) {
            src.audioQueue[i].stop()
        }
        src.audioQueue.length = 0
    }
    ),
    setSourceState: (function(src, state) {
        if (state === 4114) {
            if (src.state === 4114 || src.state == 4116) {
                src.bufsProcessed = 0;
                src.bufOffset = 0
            } else {}
            AL.stopSourceAudio(src);
            src.state = 4114;
            src.bufStartTime = Number.NEGATIVE_INFINITY;
            AL.scheduleSourceAudio(src)
        } else if (state === 4115) {
            if (src.state === 4114) {
                AL.updateSourceTime(src);
                AL.stopSourceAudio(src);
                src.state = 4115
            }
        } else if (state === 4116) {
            if (src.state !== 4113) {
                src.state = 4116;
                src.bufsProcessed = src.bufQueue.length;
                src.bufStartTime = Number.NEGATIVE_INFINITY;
                src.bufOffset = 0;
                AL.stopSourceAudio(src)
            }
        } else if (state === 4113) {
            if (src.state !== 4113) {
                src.state = 4113;
                src.bufsProcessed = 0;
                src.bufStartTime = Number.NEGATIVE_INFINITY;
                src.bufOffset = 0;
                AL.stopSourceAudio(src)
            }
        }
    }
    ),
    initSourcePanner: (function(src) {
        if (src.type === 4144) {
            return
        }
        var templateBuf = AL.buffers[0];
        for (var i = 0; i < src.bufQueue.length; i++) {
            if (src.bufQueue[i].id !== 0) {
                templateBuf = src.bufQueue[i];
                break
            }
        }
        if (src.spatialize === 1 || src.spatialize === 2 && templateBuf.channels === 1) {
            if (src.panner) {
                return
            }
            src.panner = src.context.audioCtx.createPanner();
            AL.updateSourceGlobal(src);
            AL.updateSourceSpace(src);
            src.panner.connect(src.context.gain);
            src.gain.disconnect();
            src.gain.connect(src.panner)
        } else {
            if (!src.panner) {
                return
            }
            src.panner.disconnect();
            src.gain.disconnect();
            src.gain.connect(src.context.gain);
            src.panner = null
        }
    }
    ),
    updateContextGlobal: (function(ctx) {
        for (var i in ctx.sources) {
            AL.updateSourceGlobal(ctx.sources[i])
        }
    }
    ),
    updateSourceGlobal: (function(src) {
        var panner = src.panner;
        if (!panner) {
            return
        }
        panner.refDistance = src.refDistance;
        panner.maxDistance = src.maxDistance;
        panner.rolloffFactor = src.rolloffFactor;
        panner.panningModel = src.context.hrtf ? "HRTF" : "equalpower";
        var distanceModel = src.context.sourceDistanceModel ? src.distanceModel : src.context.distanceModel;
        switch (distanceModel) {
        case 0:
            panner.distanceModel = "inverse";
            panner.refDistance = 3.40282e+38;
            break;
        case 53249:
        case 53250:
            panner.distanceModel = "inverse";
            break;
        case 53251:
        case 53252:
            panner.distanceModel = "linear";
            break;
        case 53253:
        case 53254:
            panner.distanceModel = "exponential";
            break
        }
    }
    ),
    updateListenerSpace: (function(ctx) {
        var listener = ctx.audioCtx.listener;
        if (listener.positionX) {
            listener.positionX.value = ctx.listener.position[0];
            listener.positionY.value = ctx.listener.position[1];
            listener.positionZ.value = ctx.listener.position[2]
        } else {
            listener.setPosition(ctx.listener.position[0], ctx.listener.position[1], ctx.listener.position[2])
        }
        if (listener.forwardX) {
            listener.forwardX.value = ctx.listener.direction[0];
            listener.forwardY.value = ctx.listener.direction[1];
            listener.forwardZ.value = ctx.listener.direction[2];
            listener.upX.value = ctx.listener.up[0];
            listener.upY.value = ctx.listener.up[1];
            listener.upZ.value = ctx.listener.up[2]
        } else {
            listener.setOrientation(ctx.listener.direction[0], ctx.listener.direction[1], ctx.listener.direction[2], ctx.listener.up[0], ctx.listener.up[1], ctx.listener.up[2])
        }
        for (var i in ctx.sources) {
            AL.updateSourceSpace(ctx.sources[i])
        }
    }
    ),
    updateSourceSpace: (function(src) {
        if (!src.panner) {
            return
        }
        var panner = src.panner;
        var posX = src.position[0];
        var posY = src.position[1];
        var posZ = src.position[2];
        var dirX = src.direction[0];
        var dirY = src.direction[1];
        var dirZ = src.direction[2];
        var listener = src.context.listener;
        var lPosX = listener.position[0];
        var lPosY = listener.position[1];
        var lPosZ = listener.position[2];
        if (src.relative) {
            var lBackX = -listener.direction[0];
            var lBackY = -listener.direction[1];
            var lBackZ = -listener.direction[2];
            var lUpX = listener.up[0];
            var lUpY = listener.up[1];
            var lUpZ = listener.up[2];
            function inverseMagnitude(x, y, z) {
                var length = Math.sqrt(x * x + y * y + z * z);
                if (length < Number.EPSILON) {
                    return 0
                }
                return 1 / length
            }
            var invMag = inverseMagnitude(lBackX, lBackY, lBackZ);
            lBackX *= invMag;
            lBackY *= invMag;
            lBackZ *= invMag;
            var invMag = inverseMagnitude(lUpX, lUpY, lUpZ);
            lUpX *= invMag;
            lUpY *= invMag;
            lUpZ *= invMag;
            var lRightX = lUpY * lBackZ - lUpZ * lBackY;
            var lRightY = lUpZ * lBackX - lUpX * lBackZ;
            var lRightZ = lUpX * lBackY - lUpY * lBackX;
            var invMag = inverseMagnitude(lRightX, lRightY, lRightZ);
            lRightX *= invMag;
            lRightY *= invMag;
            lRightZ *= invMag;
            var lUpX = lBackY * lRightZ - lBackZ * lRightY;
            var lUpY = lBackZ * lRightX - lBackX * lRightZ;
            var lUpZ = lBackX * lRightY - lBackY * lRightX;
            var oldX = dirX;
            var oldY = dirY;
            var oldZ = dirZ;
            dirX = oldX * lRightX + oldY * lUpX + oldZ * lBackX;
            dirY = oldX * lRightY + oldY * lUpY + oldZ * lBackY;
            dirZ = oldX * lRightZ + oldY * lUpZ + oldZ * lBackZ;
            var oldX = posX;
            var oldY = posY;
            var oldZ = posZ;
            posX = oldX * lRightX + oldY * lUpX + oldZ * lBackX;
            posY = oldX * lRightY + oldY * lUpY + oldZ * lBackY;
            posZ = oldX * lRightZ + oldY * lUpZ + oldZ * lBackZ;
            posX += lPosX;
            posY += lPosY;
            posZ += lPosZ
        }
        if (panner.positionX) {
            panner.positionX.value = posX;
            panner.positionY.value = posY;
            panner.positionZ.value = posZ
        } else {
            panner.setPosition(posX, posY, posZ)
        }
        if (panner.orientationX) {
            panner.orientationX.value = dirX;
            panner.orientationY.value = dirY;
            panner.orientationZ.value = dirZ
        } else {
            panner.setOrientation(dirX, dirY, dirZ)
        }
        var oldShift = src.dopplerShift;
        var velX = src.velocity[0];
        var velY = src.velocity[1];
        var velZ = src.velocity[2];
        var lVelX = listener.velocity[0];
        var lVelY = listener.velocity[1];
        var lVelZ = listener.velocity[2];
        if (posX === lPosX && posY === lPosY && posZ === lPosZ || velX === lVelX && velY === lVelY && velZ === lVelZ) {
            src.dopplerShift = 1
        } else {
            var speedOfSound = src.context.speedOfSound;
            var dopplerFactor = src.context.dopplerFactor;
            var slX = lPosX - posX;
            var slY = lPosY - posY;
            var slZ = lPosZ - posZ;
            var magSl = Math.sqrt(slX * slX + slY * slY + slZ * slZ);
            var vls = (slX * lVelX + slY * lVelY + slZ * lVelZ) / magSl;
            var vss = (slX * velX + slY * velY + slZ * velZ) / magSl;
            vls = Math.min(vls, speedOfSound / dopplerFactor);
            vss = Math.min(vss, speedOfSound / dopplerFactor);
            src.dopplerShift = (speedOfSound - dopplerFactor * vls) / (speedOfSound - dopplerFactor * vss)
        }
        if (src.dopplerShift !== oldShift) {
            AL.updateSourceRate(src)
        }
    }
    ),
    updateSourceRate: (function(src) {
        if (src.state === 4114) {
            AL.cancelPendingSourceAudio(src);
            var audioSrc = src.audioQueue[0];
            if (!audioSrc) {
                return
            }
            var duration;
            if (src.type === 4136 && src.looping) {
                duration = Number.POSITIVE_INFINITY
            } else {
                duration = (audioSrc.buffer.duration - audioSrc._startOffset) / src.playbackRate
            }
            audioSrc._duration = duration;
            audioSrc.playbackRate.value = src.playbackRate;
            AL.scheduleSourceAudio(src)
        }
    }
    ),
    sourceDuration: (function(src) {
        var length = 0;
        for (var i = 0; i < src.bufQueue.length; i++) {
            var audioBuf = src.bufQueue[i].audioBuf;
            length += audioBuf ? audioBuf.duration : 0
        }
        return length
    }
    ),
    sourceTell: (function(src) {
        AL.updateSourceTime(src);
        var offset = 0;
        for (var i = 0; i < src.bufsProcessed; i++) {
            offset += src.bufQueue[i].audioBuf.duration
        }
        offset += src.bufOffset;
        return offset
    }
    ),
    sourceSeek: (function(src, offset) {
        var playing = src.state == 4114;
        if (playing) {
            AL.setSourceState(src, 4113)
        }
        src.bufsProcessed = 0;
        while (offset > src.bufQueue[src.bufsProcessed].audioBuf.duration) {
            offset -= src.bufQueue[src.bufsProcessed].audiobuf.duration;
            src.bufsProcessed++
        }
        src.bufOffset = offset;
        if (playing) {
            AL.setSourceState(src, 4114)
        }
    }
    ),
    getGlobalParam: (function(funcname, param) {
        if (!AL.currentCtx) {
            return null
        }
        switch (param) {
        case 49152:
            return AL.currentCtx.dopplerFactor;
        case 49155:
            return AL.currentCtx.speedOfSound;
        case 53248:
            return AL.currentCtx.distanceModel;
        default:
            AL.currentCtx.err = 40962;
            return null
        }
    }
    ),
    setGlobalParam: (function(funcname, param, value) {
        if (!AL.currentCtx) {
            return
        }
        switch (param) {
        case 49152:
            if (!Number.isFinite(value) || value < 0) {
                AL.currentCtx.err = 40963;
                return
            }
            AL.currentCtx.dopplerFactor = value;
            AL.updateListenerSpace(AL.currentCtx);
            break;
        case 49155:
            if (!Number.isFinite(value) || value <= 0) {
                AL.currentCtx.err = 40963;
                return
            }
            AL.currentCtx.speedOfSound = value;
            AL.updateListenerSpace(AL.currentCtx);
            break;
        case 53248:
            switch (value) {
            case 0:
            case 53249:
            case 53250:
            case 53251:
            case 53252:
            case 53253:
            case 53254:
                AL.currentCtx.distanceModel = value;
                AL.updateContextGlobal(AL.currentCtx);
                break;
            default:
                AL.currentCtx.err = 40963;
                return
            }
            break;
        default:
            AL.currentCtx.err = 40962;
            return
        }
    }
    ),
    getListenerParam: (function(funcname, param) {
        if (!AL.currentCtx) {
            return null
        }
        switch (param) {
        case 4100:
            return AL.currentCtx.listener.position;
        case 4102:
            return AL.currentCtx.listener.velocity;
        case 4111:
            return AL.currentCtx.listener.direction.concat(AL.currentCtx.listener.up);
        case 4106:
            return AL.currentCtx.gain.gain.value;
        default:
            AL.currentCtx.err = 40962;
            return null
        }
    }
    ),
    setListenerParam: (function(funcname, param, value) {
        if (!AL.currentCtx) {
            return
        }
        if (value === null) {
            AL.currentCtx.err = 40962;
            return
        }
        var listener = AL.currentCtx.listener;
        switch (param) {
        case 4100:
            if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
                AL.currentCtx.err = 40963;
                return
            }
            listener.position[0] = value[0];
            listener.position[1] = value[1];
            listener.position[2] = value[2];
            AL.updateListenerSpace(AL.currentCtx);
            break;
        case 4102:
            if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
                AL.currentCtx.err = 40963;
                return
            }
            listener.velocity[0] = value[0];
            listener.velocity[1] = value[1];
            listener.velocity[2] = value[2];
            AL.updateListenerSpace(AL.currentCtx);
            break;
        case 4106:
            if (!Number.isFinite(value) || value < 0) {
                AL.currentCtx.err = 40963;
                return
            }
            AL.currentCtx.gain.gain.value = value;
            break;
        case 4111:
            if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2]) || !Number.isFinite(value[3]) || !Number.isFinite(value[4]) || !Number.isFinite(value[5])) {
                AL.currentCtx.err = 40963;
                return
            }
            listener.direction[0] = value[0];
            listener.direction[1] = value[1];
            listener.direction[2] = value[2];
            listener.up[0] = value[3];
            listener.up[1] = value[4];
            listener.up[2] = value[5];
            AL.updateListenerSpace(AL.currentCtx);
            break;
        default:
            AL.currentCtx.err = 40962;
            return
        }
    }
    ),
    getBufferParam: (function(funcname, bufferId, param) {
        if (!AL.currentCtx) {
            return
        }
        var buf = AL.buffers[bufferId];
        if (!buf || bufferId === 0) {
            AL.currentCtx.err = 40961;
            return
        }
        switch (param) {
        case 8193:
            return buf.frequency;
        case 8194:
            return buf.bytesPerSample * 8;
        case 8195:
            return buf.channels;
        case 8196:
            return buf.length * buf.bytesPerSample * buf.channels;
        case 8213:
            if (buf.length === 0) {
                return [0, 0]
            } else {
                return [(buf.audioBuf._loopStart || 0) * buf.frequency, (buf.audioBuf._loopEnd || buf.length) * buf.frequency]
            }
            ;
        default:
            AL.currentCtx.err = 40962;
            return null
        }
    }
    ),
    setBufferParam: (function(funcname, bufferId, param, value) {
        if (!AL.currentCtx) {
            return
        }
        var buf = AL.buffers[bufferId];
        if (!buf || bufferId === 0) {
            AL.currentCtx.err = 40961;
            return
        }
        if (value === null) {
            AL.currentCtx.err = 40962;
            return
        }
        switch (param) {
        case 8196:
            if (value !== 0) {
                AL.currentCtx.err = 40963;
                return
            }
            break;
        case 8213:
            if (value[0] < 0 || value[0] > buf.length || value[1] < 0 || value[1] > buf.Length || value[0] >= value[1]) {
                AL.currentCtx.err = 40963;
                return
            }
            if (buf.refCount > 0) {
                AL.currentCtx.err = 40964;
                return
            }
            if (buf.audioBuf) {
                buf.audioBuf._loopStart = value[0] / buf.frequency;
                buf.audioBuf._loopEnd = value[1] / buf.frequency
            }
            break;
        default:
            AL.currentCtx.err = 40962;
            return
        }
    }
    ),
    getSourceParam: (function(funcname, sourceId, param) {
        if (!AL.currentCtx) {
            return null
        }
        var src = AL.currentCtx.sources[sourceId];
        if (!src) {
            AL.currentCtx.err = 40961;
            return null
        }
        switch (param) {
        case 514:
            return src.relative;
        case 4097:
            return src.coneInnerAngle;
        case 4098:
            return src.coneOuterAngle;
        case 4099:
            return src.pitch;
        case 4100:
            return src.position;
        case 4101:
            return src.direction;
        case 4102:
            return src.velocity;
        case 4103:
            return src.looping;
        case 4105:
            if (src.type === 4136) {
                return src.bufQueue[0].id
            } else {
                return 0
            }
            ;
        case 4106:
            return src.gain.gain.value;
        case 4109:
            return src.minGain;
        case 4110:
            return src.maxGain;
        case 4112:
            return src.state;
        case 4117:
            if (src.bufQueue.length === 1 && src.bufQueue[0].id === 0) {
                return 0
            } else {
                return src.bufQueue.length
            }
            ;
        case 4118:
            if (src.bufQueue.length === 1 && src.bufQueue[0].id === 0 || src.looping) {
                return 0
            } else {
                return src.bufsProcessed
            }
            ;
        case 4128:
            return src.refDistance;
        case 4129:
            return src.rolloffFactor;
        case 4130:
            return src.coneOuterGain;
        case 4131:
            return src.maxDistance;
        case 4132:
            return AL.sourceTell(src);
        case 4133:
            var offset = AL.sourceTell(src);
            if (offset > 0) {
                offset *= src.bufQueue[0].frequency
            }
            return offset;
        case 4134:
            var offset = AL.sourceTell(src);
            if (offset > 0) {
                offset *= src.bufQueue[0].frequency * src.bufQueue[0].bytesPerSample
            }
            return offset;
        case 4135:
            return src.type;
        case 4628:
            return src.spatialize;
        case 8201:
            var length = 0;
            var bytesPerFrame = 0;
            for (var i = 0; i < src.bufQueue.length; i++) {
                length += src.bufQueue[i].length;
                if (src.bufQueue[i].id !== 0) {
                    bytesPerFrame = src.bufQueue[i].bytesPerSample * src.bufQueue[i].channels
                }
            }
            return length * bytesPerFrame;
        case 8202:
            var length = 0;
            for (var i = 0; i < src.bufQueue.length; i++) {
                length += src.bufQueue[i].length
            }
            return length;
        case 8203:
            return AL.sourceDuration(src);
        case 53248:
            return src.distanceModel;
        default:
            AL.currentCtx.err = 40962;
            return null
        }
    }
    ),
    setSourceParam: (function(funcname, sourceId, param, value) {
        if (!AL.currentCtx) {
            return
        }
        var src = AL.currentCtx.sources[sourceId];
        if (!src) {
            AL.currentCtx.err = 40961;
            return
        }
        if (value === null) {
            AL.currentCtx.err = 40962;
            return
        }
        switch (param) {
        case 514:
            if (value === 1) {
                src.relative = true;
                AL.updateSourceSpace(src)
            } else if (value === 0) {
                src.relative = false;
                AL.updateSourceSpace(src)
            } else {
                AL.currentCtx.err = 40963;
                return
            }
            break;
        case 4097:
            if (!Number.isFinite(value)) {
                AL.currentCtx.err = 40963;
                return
            }
            src.coneInnerAngle = value;
            if (src.panner) {
                src.panner.coneInnerAngle = value % 360
            }
            break;
        case 4098:
            if (!Number.isFinite(value)) {
                AL.currentCtx.err = 40963;
                return
            }
            src.coneOuterAngle = value;
            if (src.panner) {
                src.panner.coneOuterAngle = value % 360
            }
            break;
        case 4099:
            if (!Number.isFinite(value) || value <= 0) {
                AL.currentCtx.err = 40963;
                return
            }
            if (src.pitch === value) {
                break
            }
            src.pitch = value;
            AL.updateSourceRate(src);
            break;
        case 4100:
            if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
                AL.currentCtx.err = 40963;
                return
            }
            src.position[0] = value[0];
            src.position[1] = value[1];
            src.position[2] = value[2];
            AL.updateSourceSpace(src);
            break;
        case 4101:
            if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
                AL.currentCtx.err = 40963;
                return
            }
            src.direction[0] = value[0];
            src.direction[1] = value[1];
            src.direction[2] = value[2];
            AL.updateSourceSpace(src);
            break;
        case 4102:
            if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
                AL.currentCtx.err = 40963;
                return
            }
            src.velocity[0] = value[0];
            src.velocity[1] = value[1];
            src.velocity[2] = value[2];
            AL.updateSourceSpace(src);
            break;
        case 4103:
            if (value === 1) {
                src.looping = true;
                AL.updateSourceTime(src);
                if (src.type === 4136 && src.audioQueue.length > 0) {
                    var audioSrc = src.audioQueue[0];
                    audioSrc.loop = true;
                    audioSrc._duration = Number.POSITIVE_INFINITY
                }
            } else if (value === 0) {
                src.looping = false;
                var currentTime = AL.updateSourceTime(src);
                if (src.type === 4136 && src.audioQueue.length > 0) {
                    var audioSrc = src.audioQueue[0];
                    audioSrc.loop = false;
                    audioSrc._duration = src.bufQueue[0].audioBuf.duration / src.playbackRate;
                    audioSrc._startTime = currentTime - src.bufOffset / src.playbackRate
                }
            } else {
                AL.currentCtx.err = 40963;
                return
            }
            break;
        case 4105:
            if (src.state === 4114 || src.state === 4115) {
                AL.currentCtx.err = 40964;
                return
            }
            if (value === 0) {
                for (var i in src.bufQueue) {
                    src.bufQueue[i].refCount--
                }
                src.bufQueue.length = 1;
                src.bufQueue[0] = AL.buffers[0];
                src.bufsProcessed = 0;
                src.type = 4144
            } else {
                var buf = AL.buffers[value];
                if (!buf) {
                    AL.currentCtx.err = 40963;
                    return
                }
                for (var i in src.bufQueue) {
                    src.bufQueue[i].refCount--
                }
                src.bufQueue.length = 0;
                buf.refCount++;
                src.bufQueue = [buf];
                src.bufsProcessed = 0;
                src.type = 4136
            }
            AL.initSourcePanner(src);
            AL.scheduleSourceAudio(src);
            break;
        case 4106:
            if (!Number.isFinite(value) || value < 0) {
                AL.currentCtx.err = 40963;
                return
            }
            src.gain.gain.value = value;
            break;
        case 4109:
            if (!Number.isFinite(value) || value < 0 || value > Math.min(src.maxGain, 1)) {
                AL.currentCtx.err = 40963;
                return
            }
            src.minGain = value;
            break;
        case 4110:
            if (!Number.isFinite(value) || value < Math.max(0, src.minGain) || value > 1) {
                AL.currentCtx.err = 40963;
                return
            }
            src.maxGain = value;
            break;
        case 4128:
            if (!Number.isFinite(value) || value < 0) {
                AL.currentCtx.err = 40963;
                return
            }
            src.refDistance = value;
            if (src.panner) {
                src.panner.refDistance = value
            }
            break;
        case 4129:
            if (!Number.isFinite(value) || value < 0) {
                AL.currentCtx.err = 40963;
                return
            }
            src.rolloffFactor = value;
            if (src.panner) {
                src.panner.rolloffFactor = value
            }
            break;
        case 4130:
            if (!Number.isFinite(value) || value < 0 || value > 1) {
                AL.currentCtx.err = 40963;
                return
            }
            src.coneOuterGain = value;
            if (src.panner) {
                src.panner.coneOuterGain = value
            }
            break;
        case 4131:
            if (!Number.isFinite(value) || value < 0) {
                AL.currentCtx.err = 40963;
                return
            }
            src.maxDistance = value;
            if (src.panner) {
                src.panner.maxDistance = value
            }
            break;
        case 4132:
            if (value < 0 || value > AL.sourceDuration(src)) {
                AL.currentCtx.err = 40963;
                return
            }
            AL.sourceSeek(src, value);
            break;
        case 4133:
            var srcLen = AL.sourceDuration(src);
            if (srcLen > 0) {
                var frequency;
                for (var bufId in src.bufQueue) {
                    if (bufId !== 0) {
                        frequency = src.bufQueue[bufId].frequency;
                        break
                    }
                }
                value /= frequency
            }
            if (value < 0 || value > srcLen) {
                AL.currentCtx.err = 40963;
                return
            }
            AL.sourceSeek(src, value);
            break;
        case 4134:
            var srcLen = AL.sourceDuration(src);
            if (srcLen > 0) {
                var bytesPerSec;
                for (var bufId in src.bufQueue) {
                    if (bufId !== 0) {
                        var buf = src.bufQueue[bufId];
                        bytesPerSec = buf.frequency * buf.bytesPerSample * buf.channels;
                        break
                    }
                }
                value /= bytesPerSec
            }
            if (value < 0 || value > srcLen) {
                AL.currentCtx.err = 40963;
                return
            }
            AL.sourceSeek(src, value);
            break;
        case 4628:
            if (value !== 0 && value !== 1 && value !== 2) {
                AL.currentCtx.err = 40963;
                return
            }
            src.spatialize = value;
            AL.initSourcePanner(src);
            break;
        case 8201:
        case 8202:
        case 8203:
            AL.currentCtx.err = 40964;
            break;
        case 53248:
            switch (value) {
            case 0:
            case 53249:
            case 53250:
            case 53251:
            case 53252:
            case 53253:
            case 53254:
                src.distanceModel = value;
                if (AL.currentCtx.sourceDistanceModel) {
                    AL.updateContextGlobal(AL.currentCtx)
                }
                break;
            default:
                AL.currentCtx.err = 40963;
                return
            }
            break;
        default:
            AL.currentCtx.err = 40962;
            return
        }
    }
    ),
    captures: {},
    sharedCaptureAudioCtx: null,
    requireValidCaptureDevice: (function(deviceId, funcname) {
        if (deviceId === 0) {
            AL.alcErr = 40961;
            return null
        }
        var c = AL.captures[deviceId];
        if (!c) {
            AL.alcErr = 40961;
            return null
        }
        var err = c.mediaStreamError;
        if (err) {
            AL.alcErr = 40961;
            return null
        }
        return c
    }
    )
};
function _alBufferData(bufferId, format, pData, size, freq) {
    if (!AL.currentCtx) {
        return
    }
    var buf = AL.buffers[bufferId];
    if (!buf) {
        AL.currentCtx.err = 40963;
        return
    }
    if (freq <= 0) {
        AL.currentCtx.err = 40963;
        return
    }
    var audioBuf = null;
    try {
        switch (format) {
        case 4352:
            if (size > 0) {
                audioBuf = AL.currentCtx.audioCtx.createBuffer(1, size, freq);
                var channel0 = audioBuf.getChannelData(0);
                for (var i = 0; i < size; ++i) {
                    channel0[i] = HEAPU8[pData++] * .0078125 - 1
                }
            }
            buf.bytesPerSample = 1;
            buf.channels = 1;
            buf.length = size;
            break;
        case 4353:
            if (size > 0) {
                audioBuf = AL.currentCtx.audioCtx.createBuffer(1, size >> 1, freq);
                var channel0 = audioBuf.getChannelData(0);
                pData >>= 1;
                for (var i = 0; i < size >> 1; ++i) {
                    channel0[i] = HEAP16[pData++] * 30517578125e-15
                }
            }
            buf.bytesPerSample = 2;
            buf.channels = 1;
            buf.length = size >> 1;
            break;
        case 4354:
            if (size > 0) {
                audioBuf = AL.currentCtx.audioCtx.createBuffer(2, size >> 1, freq);
                var channel0 = audioBuf.getChannelData(0);
                var channel1 = audioBuf.getChannelData(1);
                for (var i = 0; i < size >> 1; ++i) {
                    channel0[i] = HEAPU8[pData++] * .0078125 - 1;
                    channel1[i] = HEAPU8[pData++] * .0078125 - 1
                }
            }
            buf.bytesPerSample = 1;
            buf.channels = 2;
            buf.length = size >> 1;
            break;
        case 4355:
            if (size > 0) {
                audioBuf = AL.currentCtx.audioCtx.createBuffer(2, size >> 2, freq);
                var channel0 = audioBuf.getChannelData(0);
                var channel1 = audioBuf.getChannelData(1);
                pData >>= 1;
                for (var i = 0; i < size >> 2; ++i) {
                    channel0[i] = HEAP16[pData++] * 30517578125e-15;
                    channel1[i] = HEAP16[pData++] * 30517578125e-15
                }
            }
            buf.bytesPerSample = 2;
            buf.channels = 2;
            buf.length = size >> 2;
            break;
        case 65552:
            if (size > 0) {
                audioBuf = AL.currentCtx.audioCtx.createBuffer(1, size >> 2, freq);
                var channel0 = audioBuf.getChannelData(0);
                pData >>= 2;
                for (var i = 0; i < size >> 2; ++i) {
                    channel0[i] = HEAPF32[pData++]
                }
            }
            buf.bytesPerSample = 4;
            buf.channels = 1;
            buf.length = size >> 2;
            break;
        case 65553:
            if (size > 0) {
                audioBuf = AL.currentCtx.audioCtx.createBuffer(2, size >> 3, freq);
                var channel0 = audioBuf.getChannelData(0);
                var channel1 = audioBuf.getChannelData(1);
                pData >>= 2;
                for (var i = 0; i < size >> 3; ++i) {
                    channel0[i] = HEAPF32[pData++];
                    channel1[i] = HEAPF32[pData++]
                }
            }
            buf.bytesPerSample = 4;
            buf.channels = 2;
            buf.length = size >> 3;
            break;
        default:
            AL.currentCtx.err = 40963;
            return
        }
        buf.frequency = freq;
        buf.audioBuf = audioBuf
    } catch (e) {
        AL.currentCtx.err = 40963;
        return
    }
}
function _alDeleteBuffers(count, pBufferIds) {
    if (!AL.currentCtx) {
        return
    }
    for (var i = 0; i < count; ++i) {
        var bufId = HEAP32[pBufferIds + i * 4 >> 2];
        if (bufId === 0) {
            continue
        }
        if (!AL.buffers[bufId]) {
            AL.currentCtx.err = 40961;
            return
        }
        if (AL.buffers[bufId].refCount) {
            AL.currentCtx.err = 40964;
            return
        }
    }
    for (var i = 0; i < count; ++i) {
        var bufId = HEAP32[pBufferIds + i * 4 >> 2];
        if (bufId === 0) {
            continue
        }
        AL.deviceRefCounts[AL.buffers[bufId].deviceId]--;
        delete AL.buffers[bufId];
        AL.freeIds.push(bufId)
    }
}
function _alSourcei(sourceId, param, value) {
    switch (param) {
    case 514:
    case 4097:
    case 4098:
    case 4103:
    case 4105:
    case 4128:
    case 4129:
    case 4131:
    case 4132:
    case 4133:
    case 4134:
    case 4628:
    case 8201:
    case 8202:
    case 53248:
        AL.setSourceParam("alSourcei", sourceId, param, value);
        break;
    default:
        AL.setSourceParam("alSourcei", sourceId, param, null);
        break
    }
}
function _alDeleteSources(count, pSourceIds) {
    if (!AL.currentCtx) {
        return
    }
    for (var i = 0; i < count; ++i) {
        var srcId = HEAP32[pSourceIds + i * 4 >> 2];
        if (!AL.currentCtx.sources[srcId]) {
            AL.currentCtx.err = 40961;
            return
        }
    }
    for (var i = 0; i < count; ++i) {
        var srcId = HEAP32[pSourceIds + i * 4 >> 2];
        AL.setSourceState(AL.currentCtx.sources[srcId], 4116);
        _alSourcei(srcId, 4105, 0);
        delete AL.currentCtx.sources[srcId];
        AL.freeIds.push(srcId)
    }
}
function _alDistanceModel(model) {
    AL.setGlobalParam("alDistanceModel", 53248, model)
}
function _alDopplerFactor(value) {
    AL.setGlobalParam("alDopplerFactor", 49152, value)
}
function _alGenBuffers(count, pBufferIds) {
    if (!AL.currentCtx) {
        return
    }
    for (var i = 0; i < count; ++i) {
        var buf = {
            deviceId: AL.currentCtx.deviceId,
            id: AL.newId(),
            refCount: 0,
            audioBuf: null,
            frequency: 0,
            bytesPerSample: 2,
            channels: 1,
            length: 0
        };
        AL.deviceRefCounts[buf.deviceId]++;
        AL.buffers[buf.id] = buf;
        HEAP32[pBufferIds + i * 4 >> 2] = buf.id
    }
}
function _alGenSources(count, pSourceIds) {
    if (!AL.currentCtx) {
        return
    }
    for (var i = 0; i < count; ++i) {
        var gain = AL.currentCtx.audioCtx.createGain();
        gain.connect(AL.currentCtx.gain);
        var src = {
            context: AL.currentCtx,
            id: AL.newId(),
            type: 4144,
            state: 4113,
            bufQueue: [AL.buffers[0]],
            audioQueue: [],
            looping: false,
            pitch: 1,
            dopplerShift: 1,
            gain: gain,
            minGain: 0,
            maxGain: 1,
            panner: null,
            bufsProcessed: 0,
            bufStartTime: Number.NEGATIVE_INFINITY,
            bufOffset: 0,
            relative: false,
            refDistance: 1,
            maxDistance: 3.40282e+38,
            rolloffFactor: 1,
            position: [0, 0, 0],
            velocity: [0, 0, 0],
            direction: [0, 0, 0],
            coneOuterGain: 0,
            coneInnerAngle: 360,
            coneOuterAngle: 360,
            distanceModel: 53250,
            spatialize: 2,
            get playbackRate() {
                return this.pitch * this.dopplerShift
            }
        };
        AL.currentCtx.sources[src.id] = src;
        HEAP32[pSourceIds + i * 4 >> 2] = src.id
    }
}
function _alGetError() {
    if (!AL.currentCtx) {
        return 40964
    } else {
        var err = AL.currentCtx.err;
        AL.currentCtx.err = 0;
        return err
    }
}
function _alGetSourcei(sourceId, param, pValue) {
    var val = AL.getSourceParam("alGetSourcei", sourceId, param);
    if (val === null) {
        return
    }
    if (!pValue) {
        AL.currentCtx.err = 40963;
        return
    }
    switch (param) {
    case 514:
    case 4097:
    case 4098:
    case 4103:
    case 4105:
    case 4112:
    case 4117:
    case 4118:
    case 4128:
    case 4129:
    case 4131:
    case 4132:
    case 4133:
    case 4134:
    case 4135:
    case 4628:
    case 8201:
    case 8202:
    case 53248:
        HEAP32[pValue >> 2] = val;
        break;
    default:
        AL.currentCtx.err = 40962;
        return
    }
}
function _alGetString(param) {
    if (!AL.currentCtx) {
        return 0
    }
    if (AL.stringCache[param]) {
        return AL.stringCache[param]
    }
    var ret;
    switch (param) {
    case 0:
        ret = "No Error";
        break;
    case 40961:
        ret = "Invalid Name";
        break;
    case 40962:
        ret = "Invalid Enum";
        break;
    case 40963:
        ret = "Invalid Value";
        break;
    case 40964:
        ret = "Invalid Operation";
        break;
    case 40965:
        ret = "Out of Memory";
        break;
    case 45057:
        ret = "Emscripten";
        break;
    case 45058:
        ret = "1.1";
        break;
    case 45059:
        ret = "WebAudio";
        break;
    case 45060:
        ret = "";
        for (ext in AL.AL_EXTENSIONS) {
            ret = ret.concat(ext);
            ret = ret.concat(" ")
        }
        ret = ret.trim();
        break;
    default:
        AL.currentCtx.err = 40962;
        return 0
    }
    ret = allocate(intArrayFromString(ret), "i8", ALLOC_NORMAL);
    AL.stringCache[param] = ret;
    return ret
}
function _alIsBuffer(bufferId) {
    if (!AL.currentCtx) {
        return false
    }
    if (bufferId > AL.buffers.length) {
        return false
    }
    if (!AL.buffers[bufferId]) {
        return false
    } else {
        return true
    }
}
function _alListenerf(param, value) {
    switch (param) {
    case 4106:
        AL.setListenerParam("alListenerf", param, value);
        break;
    default:
        AL.setListenerParam("alListenerf", param, null);
        break
    }
}
function _alListenerfv(param, pValues) {
    if (!AL.currentCtx) {
        return
    }
    if (!pValues) {
        AL.currentCtx.err = 40963;
        return
    }
    switch (param) {
    case 4100:
    case 4102:
        AL.paramArray[0] = HEAPF32[pValues >> 2];
        AL.paramArray[1] = HEAPF32[pValues + 4 >> 2];
        AL.paramArray[2] = HEAPF32[pValues + 8 >> 2];
        AL.setListenerParam("alListenerfv", param, AL.paramArray);
        break;
    case 4111:
        AL.paramArray[0] = HEAPF32[pValues >> 2];
        AL.paramArray[1] = HEAPF32[pValues + 4 >> 2];
        AL.paramArray[2] = HEAPF32[pValues + 8 >> 2];
        AL.paramArray[3] = HEAPF32[pValues + 12 >> 2];
        AL.paramArray[4] = HEAPF32[pValues + 16 >> 2];
        AL.paramArray[5] = HEAPF32[pValues + 20 >> 2];
        AL.setListenerParam("alListenerfv", param, AL.paramArray);
        break;
    default:
        AL.setListenerParam("alListenerfv", param, null);
        break
    }
}
function _alSourcePlay(sourceId) {
    if (!AL.currentCtx) {
        return
    }
    var src = AL.currentCtx.sources[sourceId];
    if (!src) {
        AL.currentCtx.err = 40961;
        return
    }
    AL.setSourceState(src, 4114)
}
function _alSourceQueueBuffers(sourceId, count, pBufferIds) {
    if (!AL.currentCtx) {
        return
    }
    var src = AL.currentCtx.sources[sourceId];
    if (!src) {
        AL.currentCtx.err = 40961;
        return
    }
    if (src.type === 4136) {
        AL.currentCtx.err = 40964;
        return
    }
    if (count === 0) {
        return
    }
    var templateBuf = AL.buffers[0];
    for (var i = 0; i < src.bufQueue.length; i++) {
        if (src.bufQueue[i].id !== 0) {
            templateBuf = src.bufQueue[i];
            break
        }
    }
    for (var i = 0; i < count; ++i) {
        var bufId = HEAP32[pBufferIds + i * 4 >> 2];
        var buf = AL.buffers[bufId];
        if (!buf) {
            AL.currentCtx.err = 40961;
            return
        }
        if (templateBuf.id !== 0 && (buf.frequency !== templateBuf.frequency || buf.bytesPerSample !== templateBuf.bytesPerSample || buf.channels !== templateBuf.channels)) {
            AL.currentCtx.err = 40964
        }
    }
    if (src.bufQueue.length === 1 && src.bufQueue[0].id === 0) {
        src.bufQueue.length = 0
    }
    src.type = 4137;
    for (var i = 0; i < count; ++i) {
        var bufId = HEAP32[pBufferIds + i * 4 >> 2];
        var buf = AL.buffers[bufId];
        buf.refCount++;
        src.bufQueue.push(buf)
    }
    if (src.looping) {
        AL.cancelPendingSourceAudio(src)
    }
    AL.initSourcePanner(src);
    AL.scheduleSourceAudio(src)
}
function _alSourceStop(sourceId) {
    if (!AL.currentCtx) {
        return
    }
    var src = AL.currentCtx.sources[sourceId];
    if (!src) {
        AL.currentCtx.err = 40961;
        return
    }
    AL.setSourceState(src, 4116)
}
function _alSourceUnqueueBuffers(sourceId, count, pBufferIds) {
    if (!AL.currentCtx) {
        return
    }
    var src = AL.currentCtx.sources[sourceId];
    if (!src) {
        AL.currentCtx.err = 40961;
        return
    }
    if (count > (src.bufQueue.length === 1 && src.bufQueue[0].id === 0 ? 0 : src.bufsProcessed)) {
        AL.currentCtx.err = 40963;
        return
    }
    if (count === 0) {
        return
    }
    for (var i = 0; i < count; i++) {
        var buf = src.bufQueue.shift();
        buf.refCount--;
        HEAP32[pBufferIds + i * 4 >> 2] = buf.id;
        src.bufsProcessed--
    }
    if (src.bufQueue.length === 0) {
        src.bufQueue.push(AL.buffers[0])
    }
    AL.initSourcePanner(src);
    AL.scheduleSourceAudio(src)
}
function _alSourcef(sourceId, param, value) {
    switch (param) {
    case 4097:
    case 4098:
    case 4099:
    case 4106:
    case 4109:
    case 4110:
    case 4128:
    case 4129:
    case 4130:
    case 4131:
    case 4132:
    case 4133:
    case 4134:
    case 8203:
        AL.setSourceParam("alSourcef", sourceId, param, value);
        break;
    default:
        AL.setSourceParam("alSourcef", sourceId, param, null);
        break
    }
}
function _alSourcefv(sourceId, param, pValues) {
    if (!AL.currentCtx) {
        return
    }
    if (!pValues) {
        AL.currentCtx.err = 40963;
        return
    }
    switch (param) {
    case 4097:
    case 4098:
    case 4099:
    case 4106:
    case 4109:
    case 4110:
    case 4128:
    case 4129:
    case 4130:
    case 4131:
    case 4132:
    case 4133:
    case 4134:
    case 8203:
        var val = HEAPF32[pValues >> 2];
        AL.setSourceParam("alSourcefv", sourceId, param, val);
        break;
    case 4100:
    case 4101:
    case 4102:
        AL.paramArray[0] = HEAPF32[pValues >> 2];
        AL.paramArray[1] = HEAPF32[pValues + 4 >> 2];
        AL.paramArray[2] = HEAPF32[pValues + 8 >> 2];
        AL.setSourceParam("alSourcefv", sourceId, param, AL.paramArray);
        break;
    default:
        AL.setSourceParam("alSourcefv", sourceId, param, null);
        break
    }
}
function _alcCloseDevice(deviceId) {
    if (!deviceId in AL.deviceRefCounts || AL.deviceRefCounts[deviceId] > 0) {
        return 0
    }
    delete AL.deviceRefCounts[deviceId];
    AL.freeIds.push(deviceId);
    return 1
}
function _alcCreateContext(deviceId, pAttrList) {
    if (!deviceId in AL.deviceRefCounts) {
        AL.alcErr = 40961;
        return 0
    }
    var options = null;
    var attrs = [];
    var hrtf = null;
    pAttrList >>= 2;
    if (pAttrList) {
        var attr = 0;
        var val = 0;
        while (true) {
            attr = HEAP32[pAttrList++];
            attrs.push(attr);
            if (attr === 0) {
                break
            }
            val = HEAP32[pAttrList++];
            attrs.push(val);
            switch (attr) {
            case 4103:
                if (!options) {
                    options = {}
                }
                options.sampleRate = val;
                break;
            case 4112:
            case 4113:
                break;
            case 6546:
                switch (val) {
                case 0:
                    hrtf = false;
                    break;
                case 1:
                    hrtf = true;
                    break;
                case 2:
                    break;
                default:
                    AL.alcErr = 40964;
                    return 0
                }
                break;
            case 6550:
                if (val !== 0) {
                    AL.alcErr = 40964;
                    return 0
                }
                break;
            default:
                AL.alcErr = 40964;
                return 0
            }
        }
    }
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    var ac = null;
    try {
        if (options) {
            ac = new AudioContext(options)
        } else {
            ac = new AudioContext
        }
    } catch (e) {
        if (e.name === "NotSupportedError") {
            AL.alcErr = 40964
        } else {
            AL.alcErr = 40961
        }
        return 0
    }
    if (typeof ac.createGain === "undefined") {
        ac.createGain = ac.createGainNode
    }
    var gain = ac.createGain();
    gain.connect(ac.destination);
    var ctx = {
        deviceId: deviceId,
        id: AL.newId(),
        attrs: attrs,
        audioCtx: ac,
        listener: {
            position: [0, 0, 0],
            velocity: [0, 0, 0],
            direction: [0, 0, 0],
            up: [0, 0, 0]
        },
        sources: [],
        interval: setInterval((function() {
            AL.scheduleContextAudio(ctx)
        }
        ), AL.QUEUE_INTERVAL),
        gain: gain,
        distanceModel: 53250,
        speedOfSound: 343.3,
        dopplerFactor: 1,
        sourceDistanceModel: false,
        hrtf: hrtf || false,
        _err: 0,
        get err() {
            return this._err
        },
        set err(val) {
            if (this._err === 0 || val === 0) {
                this._err = val
            }
        }
    };
    AL.deviceRefCounts[deviceId]++;
    AL.contexts[ctx.id] = ctx;
    if (hrtf !== null) {
        for (var ctxId in AL.contexts) {
            var c = AL.contexts[ctxId];
            if (c.deviceId === deviceId) {
                c.hrtf = hrtf;
                AL.updateContextGlobal(c)
            }
        }
    }
    return ctx.id
}
function _alcDestroyContext(contextId) {
    var ctx = AL.contexts[contextId];
    if (AL.currentCtx === ctx) {
        AL.alcErr = 40962;
        return
    }
    if (AL.contexts[contextId].interval) {
        clearInterval(AL.contexts[contextId].interval)
    }
    AL.deviceRefCounts[ctx.deviceId]--;
    delete AL.contexts[contextId];
    AL.freeIds.push(contextId)
}
function _alcGetString(deviceId, param) {
    if (AL.alcStringCache[param]) {
        return AL.alcStringCache[param]
    }
    var ret;
    switch (param) {
    case 0:
        ret = "No Error";
        break;
    case 40961:
        ret = "Invalid Device";
        break;
    case 40962:
        ret = "Invalid Context";
        break;
    case 40963:
        ret = "Invalid Enum";
        break;
    case 40964:
        ret = "Invalid Value";
        break;
    case 40965:
        ret = "Out of Memory";
        break;
    case 4100:
        if (typeof AudioContext !== "undefined" || typeof webkitAudioContext !== "undefined") {
            ret = AL.DEVICE_NAME
        } else {
            return 0
        }
        break;
    case 4101:
        if (typeof AudioContext !== "undefined" || typeof webkitAudioContext !== "undefined") {
            ret = AL.DEVICE_NAME.concat("")
        } else {
            ret = ""
        }
        break;
    case 785:
        ret = AL.CAPTURE_DEVICE_NAME;
        break;
    case 784:
        if (deviceId === 0)
            ret = AL.CAPTURE_DEVICE_NAME.concat("");
        else {
            var c = AL.requireValidCaptureDevice(deviceId, "alcGetString");
            if (!c) {
                return 0
            }
            ret = c.deviceName
        }
        break;
    case 4102:
        if (!deviceId) {
            AL.alcErr = 40961;
            return 0
        }
        ret = "";
        for (var ext in AL.ALC_EXTENSIONS) {
            ret = ret.concat(ext);
            ret = ret.concat(" ")
        }
        ret = ret.trim();
        break;
    default:
        AL.alcErr = 40963;
        return 0
    }
    ret = allocate(intArrayFromString(ret), "i8", ALLOC_NORMAL);
    AL.alcStringCache[param] = ret;
    return ret
}
function _alcMakeContextCurrent(contextId) {
    if (contextId === 0) {
        AL.currentCtx = null;
        return 0
    } else {
        AL.currentCtx = AL.contexts[contextId];
        return 1
    }
}
function _alcOpenDevice(pDeviceName) {
    if (pDeviceName) {
        var name = Pointer_stringify(pDeviceName);
        if (name !== AL.DEVICE_NAME) {
            return 0
        }
    }
    if (typeof AudioContext !== "undefined" || typeof webkitAudioContext !== "undefined") {
        var deviceId = AL.newId();
        AL.deviceRefCounts[deviceId] = 0;
        return deviceId
    } else {
        return 0
    }
}
function _clock() {
    if (_clock.start === undefined)
        _clock.start = Date.now();
    return (Date.now() - _clock.start) * (1e6 / 1e3) | 0
}
var ___tm_current = STATICTOP;
STATICTOP += 48;
var ___tm_timezone = allocate(intArrayFromString("GMT"), "i8", ALLOC_STATIC);
function _tzset() {
    if (_tzset.called)
        return;
    _tzset.called = true;
    HEAP32[__get_timezone() >> 2] = (new Date).getTimezoneOffset() * 60;
    var winter = new Date(2e3,0,1);
    var summer = new Date(2e3,6,1);
    HEAP32[__get_daylight() >> 2] = Number(winter.getTimezoneOffset() != summer.getTimezoneOffset());
    function extractZone(date) {
        var match = date.toTimeString().match(/\(([A-Za-z ]+)\)$/);
        return match ? match[1] : "GMT"
    }
    var winterName = extractZone(winter);
    var summerName = extractZone(summer);
    var winterNamePtr = allocate(intArrayFromString(winterName), "i8", ALLOC_NORMAL);
    var summerNamePtr = allocate(intArrayFromString(summerName), "i8", ALLOC_NORMAL);
    if (summer.getTimezoneOffset() < winter.getTimezoneOffset()) {
        HEAP32[__get_tzname() >> 2] = winterNamePtr;
        HEAP32[__get_tzname() + 4 >> 2] = summerNamePtr
    } else {
        HEAP32[__get_tzname() >> 2] = summerNamePtr;
        HEAP32[__get_tzname() + 4 >> 2] = winterNamePtr
    }
}
function _localtime_r(time, tmPtr) {
    _tzset();
    var date = new Date(HEAP32[time >> 2] * 1e3);
    HEAP32[tmPtr >> 2] = date.getSeconds();
    HEAP32[tmPtr + 4 >> 2] = date.getMinutes();
    HEAP32[tmPtr + 8 >> 2] = date.getHours();
    HEAP32[tmPtr + 12 >> 2] = date.getDate();
    HEAP32[tmPtr + 16 >> 2] = date.getMonth();
    HEAP32[tmPtr + 20 >> 2] = date.getFullYear() - 1900;
    HEAP32[tmPtr + 24 >> 2] = date.getDay();
    var start = new Date(date.getFullYear(),0,1);
    var yday = (date.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24) | 0;
    HEAP32[tmPtr + 28 >> 2] = yday;
    HEAP32[tmPtr + 36 >> 2] = -(date.getTimezoneOffset() * 60);
    var summerOffset = (new Date(2e3,6,1)).getTimezoneOffset();
    var winterOffset = start.getTimezoneOffset();
    var dst = (summerOffset != winterOffset && date.getTimezoneOffset() == Math.min(winterOffset, summerOffset)) | 0;
    HEAP32[tmPtr + 32 >> 2] = dst;
    var zonePtr = HEAP32[__get_tzname() + (dst ? 4 : 0) >> 2];
    HEAP32[tmPtr + 40 >> 2] = zonePtr;
    return tmPtr
}
STATICTOP += 48;
function _mktime(tmPtr) {
    _tzset();
    var date = new Date(HEAP32[tmPtr + 20 >> 2] + 1900,HEAP32[tmPtr + 16 >> 2],HEAP32[tmPtr + 12 >> 2],HEAP32[tmPtr + 8 >> 2],HEAP32[tmPtr + 4 >> 2],HEAP32[tmPtr >> 2],0);
    var dst = HEAP32[tmPtr + 32 >> 2];
    var guessedOffset = date.getTimezoneOffset();
    var start = new Date(date.getFullYear(),0,1);
    var summerOffset = (new Date(2e3,6,1)).getTimezoneOffset();
    var winterOffset = start.getTimezoneOffset();
    var dstOffset = Math.min(winterOffset, summerOffset);
    if (dst < 0) {
        HEAP32[tmPtr + 32 >> 2] = Number(summerOffset != winterOffset && dstOffset == guessedOffset)
    } else if (dst > 0 != (dstOffset == guessedOffset)) {
        var nonDstOffset = Math.max(winterOffset, summerOffset);
        var trueOffset = dst > 0 ? dstOffset : nonDstOffset;
        date.setTime(date.getTime() + (trueOffset - guessedOffset) * 6e4)
    }
    HEAP32[tmPtr + 24 >> 2] = date.getDay();
    var yday = (date.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24) | 0;
    HEAP32[tmPtr + 28 >> 2] = yday;
    return date.getTime() / 1e3 | 0
}
function _asctime_r(tmPtr, buf) {
    var date = {
        tm_sec: HEAP32[tmPtr >> 2],
        tm_min: HEAP32[tmPtr + 4 >> 2],
        tm_hour: HEAP32[tmPtr + 8 >> 2],
        tm_mday: HEAP32[tmPtr + 12 >> 2],
        tm_mon: HEAP32[tmPtr + 16 >> 2],
        tm_year: HEAP32[tmPtr + 20 >> 2],
        tm_wday: HEAP32[tmPtr + 24 >> 2]
    };
    var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var s = days[date.tm_wday] + " " + months[date.tm_mon] + (date.tm_mday < 10 ? "  " : " ") + date.tm_mday + (date.tm_hour < 10 ? " 0" : " ") + date.tm_hour + (date.tm_min < 10 ? ":0" : ":") + date.tm_min + (date.tm_sec < 10 ? ":0" : ":") + date.tm_sec + " " + (1900 + date.tm_year) + "\n";
    stringToUTF8(s, buf, 26);
    return buf
}
function _ctime_r(time, buf) {
    var stack = stackSave();
    var rv = _asctime_r(_localtime_r(time, stackAlloc(44)), buf);
    stackRestore(stack);
    return rv
}
function _ctime(timer) {
    return _ctime_r(timer, ___tm_current)
}
function _emscripten_run_script_string(ptr) {
    var s = eval(Pointer_stringify(ptr)) + "";
    var me = _emscripten_run_script_string;
    var len = lengthBytesUTF8(s);
    if (!me.bufferSize || me.bufferSize < len + 1) {
        if (me.bufferSize)
            _free(me.buffer);
        me.bufferSize = len + 1;
        me.buffer = _malloc(me.bufferSize)
    }
    stringToUTF8(s, me.buffer, me.bufferSize);
    return me.buffer
}
function _emscriptenfte_abortmainloop(fname) {
    fname = Pointer_stringify(fname);
    throw "oh noes! something bad happened in " + fname + "!\n" + Module["stackTrace"]()
}
function _emscriptenfte_al_loadaudiofile(buf, dataptr, datasize) {
    if (!buf)
        return;
    buf = buf - 1;
    var ctx = AL.currentContext || AL.currentCtx;
    try {
        var abuf = new ArrayBuffer(datasize);
        (new Uint8Array(abuf)).set(HEAPU8.subarray(dataptr, dataptr + datasize));
        AL.currentContext.ctx.decodeAudioData(abuf, (function(buffer) {
            ctx.buf[buf] = buffer
        }
        ), (function() {
            console.log("Audio Callback failed!")
        }
        ))
    } catch (e) {
        console.log("unable to decode audio data");
        console.log(e)
    }
}
function _emscriptenfte_alert(msg) {
    msg = Pointer_stringify(msg);
    console.log(msg);
    alert(msg)
}
function _emscriptenfte_async_wget_data2(url, ctx, onload, onerror, onprogress) {
    var _url = Pointer_stringify(url);
    console.log("Attempting download of " + _url);
    var http = new XMLHttpRequest;
    try {
        http.open("GET", _url, true)
    } catch (e) {
        if (onerror)
            Runtime.dynCall("vii", onerror, [ctx, 404]);
        return
    }
    http.responseType = "arraybuffer";
    http.onload = (function(e) {
        console.log("onload: " + _url + " status " + http.status);
        if (http.status == 200) {
            if (onload)
                Runtime.dynCall("vii", onload, [ctx, _emscriptenfte_buf_createfromarraybuf(http.response)])
        } else {
            if (onerror)
                Runtime.dynCall("vii", onerror, [ctx, http.status])
        }
    }
    );
    http.onerror = (function(e) {
        console.log("onerror: " + _url);
        if (onerror)
            Runtime.dynCall("vii", onerror, [ctx, 0])
    }
    );
    http.onprogress = (function(e) {
        if (onprogress)
            Runtime.dynCall("viii", onprogress, [ctx, e.loaded, e.total])
    }
    );
    try {
        http.send(null)
    } catch (e) {
        console.log(e);
        http.onerror(e)
    }
}
var FTEH = {
    h: [],
    f: {}
};
function _emscriptenfte_handle_alloc(h) {
    for (var i = 0; FTEH.h.length; i += 1) {
        if (FTEH.h[i] == null) {
            FTEH.h[i] = h;
            return i
        }
    }
    i = FTEH.h.length;
    FTEH.h[i] = h;
    return i
}
function _emscriptenfte_buf_create() {
    var b = {
        h: -1,
        r: 1,
        l: 0,
        m: 4096,
        d: new Uint8Array(4096),
        n: null
    };
    b.h = _emscriptenfte_handle_alloc(b);
    return b.h
}
function _emscriptenfte_buf_delete(name) {
    name = Pointer_stringify(name);
    var f = FTEH.f[name];
    if (f) {
        delete FTEH.f[name];
        f.n = null;
        _emscriptenfte_buf_release(f.h);
        return 1
    }
    return 0
}
function _emscriptenfte_buf_getsize(handle) {
    var b = FTEH.h[handle];
    return b.l
}
function _emscriptenfte_buf_open(name, createifneeded) {
    name = Pointer_stringify(name);
    var f = FTEH.f[name];
    var r = -1;
    if (f == null) {
        if (!FTEC.localstorefailure) {
            try {
                if (localStorage && createifneeded != 2) {
                    var str = localStorage.getItem(name);
                    if (str != null) {
                        var len = str.length;
                        var buf = new Uint8Array(len);
                        for (var i = 0; i < len; i++)
                            buf[i] = str.charCodeAt(i);
                        var b = {
                            h: -1,
                            r: 2,
                            l: len,
                            m: len,
                            d: buf,
                            n: name
                        };
                        r = b.h = _emscriptenfte_handle_alloc(b);
                        FTEH.f[name] = b;
                        return b.h
                    }
                }
            } catch (e) {
                console.log("exception while trying to read local storage for " + name);
                console.log(e);
                console.log("disabling further attempts to access local storage");
                FTEC.localstorefailure = true
            }
        }
        if (createifneeded)
            r = _emscriptenfte_buf_create();
        if (r != -1) {
            f = FTEH.h[r];
            f.r += 1;
            f.n = name;
            FTEH.f[name] = f;
            if (FTEH.f[name] != f || f.n != name)
                console.log("error creating file " + name)
        }
    } else {
        f.r += 1;
        r = f.h
    }
    if (f != null && createifneeded == 2)
        f.l = 0;
    return r
}
function _emscriptenfte_buf_pushtolocalstore(handle) {
    var b = FTEH.h[handle];
    if (b == null) {
        Module.printError("emscriptenfte_buf_pushtolocalstore with invalid handle");
        return
    }
    if (b.n == null)
        return;
    var data = b.d;
    var len = b.l;
    try {
        if (localStorage) {
            var foo = "";
            for (var i = 0; i < len; i++)
                foo += String.fromCharCode(data[i]);
            localStorage.setItem(b.n, foo)
        } else
            console.log("local storage not supported")
    } catch (e) {
        console.log("exception while trying to save " + b.n);
        console.log(e)
    }
}
function _emscriptenfte_buf_read(handle, offset, data, len) {
    var b = FTEH.h[handle];
    if (offset + len > b.l)
        len = b.l - offset;
    if (len < 0) {
        len = 0;
        if (offset + len >= b.l)
            return -1
    }
    HEAPU8.set(b.d.subarray(offset, offset + len), data);
    return len
}
function _emscriptenfte_buf_release(handle) {
    var b = FTEH.h[handle];
    if (b == null) {
        Module.printError("emscriptenfte_buf_release with invalid handle");
        return
    }
    b.r -= 1;
    if (b.r == 0) {
        if (b.n != null)
            delete FTEH.f[b.n];
        delete FTEH.h[handle];
        b.d = null
    }
}
function _emscriptenfte_buf_rename(oldname, newname) {
    oldname = Pointer_stringify(oldname);
    newname = Pointer_stringify(newname);
    var f = FTEH.f[oldname];
    if (f == null)
        return 0;
    if (FTEH.f[newname] != null)
        return 0;
    FTEH.f[newname] = f;
    delete FTEH.f[oldname];
    f.n = newname;
    return 1
}
function _emscriptenfte_buf_write(handle, offset, data, len) {
    var b = FTEH.h[handle];
    if (len < 0)
        len = 0;
    if (offset + len > b.m) {
        b.m = offset + len + 4095;
        b.m = b.m & ~4095;
        var nd = new Uint8Array(b.m);
        nd.set(b.d, 0);
        b.d = nd
    }
    b.d.set(HEAPU8.subarray(data, data + len), offset);
    if (offset + len > b.l)
        b.l = offset + len;
    return len
}
function _emscriptenfte_getvreyedata(eye, ptr_proj, ptr_view) {
    var pm;
    var vm;
    if (eye) {
        pm = FTEC.vrframeData.leftProjectionMatrix;
        vm = FTEC.vrframeData.leftViewMatrix
    } else {
        pm = FTEC.vrframeData.rightProjectionMatrix;
        vm = FTEC.vrframeData.rightViewMatrix
    }
    var i;
    ptr_proj /= 4;
    ptr_view /= 4;
    for (i = 0; i < 16; i++) {
        HEAPF32[ptr_proj + i] = pm[i];
        HEAPF32[ptr_view + i] = vm[i]
    }
}
function _emscriptenfte_getvrframedata() {
    if (!FTEC.vrDisplay)
        return 0;
    return FTEC.vrDisplay.isPresenting
}
function _emscriptenfte_gl_loadtexturefile(texid, widthptr, heightptr, dataptr, datasize, fname) {
    function encode64(data) {
        var BASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var PAD = "=";
        var ret = "";
        var leftchar = 0;
        var leftbits = 0;
        for (var i = 0; i < data.length; i++) {
            leftchar = leftchar << 8 | data[i];
            leftbits += 8;
            while (leftbits >= 6) {
                var curr = leftchar >> leftbits - 6 & 63;
                leftbits -= 6;
                ret += BASE[curr]
            }
        }
        if (leftbits == 2) {
            ret += BASE[(leftchar & 3) << 4];
            ret += PAD + PAD
        } else if (leftbits == 4) {
            ret += BASE[(leftchar & 15) << 2];
            ret += PAD
        }
        return ret
    }
    GLctx.texImage2D(GLctx.TEXTURE_2D, 0, GLctx.RGBA, 1, 1, 0, GLctx.RGBA, GLctx.UNSIGNED_BYTE, null);
    var img = new Image;
    var gltex = GL.textures[texid];
    img.name = Pointer_stringify(fname);
    img.onload = (function() {
        if (img.width < 1 || img.height < 1) {
            console.log("emscriptenfte_gl_loadtexturefile(" + img.name + "): bad image size\n");
            return
        }
        var oldtex = GLctx.getParameter(GLctx.TEXTURE_BINDING_2D);
        GLctx.bindTexture(GLctx.TEXTURE_2D, gltex);
        GLctx.texImage2D(GLctx.TEXTURE_2D, 0, GLctx.RGBA, GLctx.RGBA, GLctx.UNSIGNED_BYTE, img);
        GLctx.generateMipmap(GLctx.TEXTURE_2D);
        GLctx.bindTexture(GLctx.TEXTURE_2D, oldtex)
    }
    );
    img.crossorigin = true;
    img.src = "data:image/png;base64," + encode64(HEAPU8.subarray(dataptr, dataptr + datasize))
}
function _emscriptenfte_polljoyevents() {
    var gamepads;
    gamepads = navigator.getGamepads ? navigator.getGamepads() : navigator.webkitGetGamepads ? navigator.webkitGetGamepads : [];
    if (gamepads !== undefined)
        for (var i = 0; i < gamepads.length; i += 1) {
            var gp = gamepads[i];
            if (gp === undefined)
                continue;
            if (gp == null)
                continue;
            for (var j = 0; j < gp.buttons.length; j += 1) {
                var b = gp.buttons[j];
                var p;
                if (typeof b == "object")
                    p = b.pressed;
                else
                    p = b > .5;
                if (b.lastframe != p) {
                    b.lastframe = p;
                    Runtime.dynCall("viiii", FTEC.evcb.jbutton, [gp.index, j, p, gp.mapping == "standard"])
                }
            }
            for (var j = 0; j < gp.axes.length; j += 1)
                Runtime.dynCall("viifi", FTEC.evcb.jaxis, [gp.index, j, gp.axes[j], gp.mapping == "standard"])
        }
}
function _emscriptenfte_print(msg) {
    FTEC.linebuffer += Pointer_stringify(msg);
    for (; ; ) {
        nl = FTEC.linebuffer.indexOf("\n");
        if (nl == -1)
            break;
        console.log(FTEC.linebuffer.substring(0, nl));
        FTEC.linebuffer = FTEC.linebuffer.substring(nl + 1)
    }
}
function _emscriptenfte_rtc_candidate(sockid, offer) {
    var s = FTEH.h[sockid];
    offer = Pointer_stringify(offer);
    if (s === undefined)
        return -1;
    var desc;
    if (1)
        desc = JSON.parse(offer);
    else
        desc = {
            candidate: offer,
            sdpMid: null,
            sdpMLineIndex: 0
        };
    console.log("addIceCandidate:");
    console.log(desc);
    s.pc.addIceCandidate(desc)
}
function _emscriptenfte_rtc_create(clientside, ctxp, ctxi, callback) {
    var pcconfig = {
        iceServers: [{
            url: "stun:stun.l.google.com:19302"
        }]
    };
    var dcconfig = {
        ordered: false,
        maxRetransmits: 0,
        reliable: false
    };
    console.log("emscriptenfte_rtc_create");
    var s = {
        pc: null,
        ws: null,
        inq: [],
        err: 0,
        con: 0,
        isclient: clientside,
        callcb: (function(evtype, stringdata) {
            console.log("emscriptenfte_rtc_create callback: " + evtype);
            var stringlen = stringdata.length * 3 + 1;
            var dataptr = _malloc(stringlen);
            stringToUTF8(stringdata, dataptr, stringlen);
            Runtime.dynCall("viiii", callback, [ctxp, ctxi, evtype, dataptr]);
            _free(dataptr)
        }
        )
    };
    if (RTCPeerConnection === undefined) {
        console.log("RTCPeerConnection undefined");
        return -1
    }
    s.pc = new RTCPeerConnection(pcconfig);
    if (s.pc === undefined) {
        console.log("webrtc failed to create RTCPeerConnection");
        return -1
    }
    s.ws = s.pc.createDataChannel("quake", dcconfig);
    s.ws.binaryType = "arraybuffer";
    s.ws.onclose = (function(event) {
        console.log("webrtc datachannel closed:");
        console.log(event);
        s.con = 0;
        s.err = 1
    }
    );
    s.ws.onopen = (function(event) {
        console.log("webrtc datachannel opened:");
        console.log(event);
        s.con = 1
    }
    );
    s.ws.onmessage = (function(event) {
        assert(typeof event.data !== "string" && event.data.byteLength);
        s.inq.push(new Uint8Array(event.data))
    }
    );
    s.pc.onicecandidate = (function(e) {
        console.log("onicecandidate: ");
        console.log(e);
        var desc;
        if (1)
            desc = JSON.stringify(e.candidate);
        else
            desc = e.candidate.candidate;
        s.callcb(4, desc)
    }
    );
    s.pc.oniceconnectionstatechange = (function(e) {
        console.log("oniceconnectionstatechange: ");
        console.log(e)
    }
    );
    s.pc.onaddstream = (function(e) {
        console.log("onaddstream: ");
        console.log(e)
    }
    );
    s.pc.ondatachannel = (function(e) {
        console.log("ondatachannel: ");
        console.log(e);
        s.recvchan = e.channel;
        s.recvchan.binaryType = "arraybuffer";
        s.recvchan.onmessage = s.ws.onmessage
    }
    );
    s.pc.onnegotiationneeded = (function(e) {
        console.log("onnegotiationneeded: ");
        console.log(e)
    }
    );
    if (clientside) {
        s.pc.createOffer().then((function(desc) {
            s.pc.setLocalDescription(desc);
            console.log("gotlocaldescription: ");
            console.log(desc);
            if (1)
                desc = JSON.stringify(desc);
            else
                desc = desc.sdp;
            s.callcb(3, desc)
        }
        ), (function(event) {
            console.log("createOffer error:");
            console.log(event);
            s.err = 1
        }
        ))
    }
    return _emscriptenfte_handle_alloc(s)
}
function _emscriptenfte_rtc_offer(sockid, offer, offertype) {
    var s = FTEH.h[sockid];
    offer = Pointer_stringify(offer);
    offertype = Pointer_stringify(offertype);
    if (s === undefined)
        return -1;
    if (1)
        desc = JSON.parse(offer);
    else
        desc = {
            sdp: offer,
            type: offertype
        };
    s.pc.setRemoteDescription(desc);
    if (!s.isclient) {
        s.pc.createAnswer().then((function(desc) {
            s.pc.setLocalDescription(desc);
            console.log("gotlocaldescription: ");
            console.log(desc);
            if (1)
                desc = JSON.stringify(desc);
            else
                desc = desc.sdp;
            s.callcb(3, desc)
        }
        ), (function(event) {
            console.log("createAnswer error:" + event.toString());
            s.err = 1
        }
        ))
    }
}
function _emscriptenfte_settitle(txt) {
    document.title = Pointer_stringify(txt)
}
function _emscriptenfte_buf_createfromarraybuf(buf) {
    buf = new Uint8Array(buf);
    var len = buf.length;
    var b = {
        h: -1,
        r: 1,
        l: len,
        m: len,
        d: buf,
        n: null
    };
    b.h = _emscriptenfte_handle_alloc(b);
    return b.h
}
var FTEC = {
    ctxwarned: 0,
    pointerislocked: 0,
    pointerwantlock: 0,
    linebuffer: "",
    localstorefailure: false,
    w: -1,
    h: -1,
    donecb: 0,
    evcb: {
        resize: 0,
        mouse: 0,
        button: 0,
        key: 0,
        loadfile: 0,
        jbutton: 0,
        jaxis: 0,
        wantfullscreen: 0
    },
    loadurl: (function(url, mime, arraybuf) {
        if (FTEC.evcb.loadfile != 0) {
            var handle = -1;
            if (arraybuf !== undefined)
                handle = _emscriptenfte_buf_createfromarraybuf(arraybuf);
            var urlptr = _malloc(url.length + 1);
            writeStringToMemory(url, urlptr);
            var mimeptr = _malloc(mime.length + 1);
            writeStringToMemory(mime, mimeptr);
            Runtime.dynCall("viii", FTEC.evcb.loadfile, [urlptr, mimeptr, handle]);
            _free(mimeptr);
            _free(urlptr);
            window.focus()
        }
    }
    ),
    handleevent: (function(event) {
        switch (event.type) {
        case "message":
            console.log(event);
            console.log(event.data);
            FTEC.loadurl(event.data.url, event.data.cmd, undefined);
            break;
        case "resize":
            if (FTEC.evcb.resize != 0) {
                Runtime.dynCall("vii", FTEC.evcb.resize, [Module["canvas"].width, Module["canvas"].height])
            }
            break;
        case "mousemove":
            if (FTEC.evcb.mouse != 0) {
                if (Browser.pointerLock) {
                    if (typeof event.movementX === "undefined") {
                        event.movementX = event.mozMovementX;
                        event.movementY = event.mozMovementY
                    }
                    if (typeof event.movementX === "undefined") {
                        event.movementX = event.webkitMovementX;
                        event.movementY = event.webkitMovementY
                    }
                    Runtime.dynCall("viiffff", FTEC.evcb.mouse, [0, false, event.movementX, event.movementY, 0, 0])
                } else {
                    var rect = Module["canvas"].getBoundingClientRect();
                    Runtime.dynCall("viiffff", FTEC.evcb.mouse, [0, true, (event.clientX - rect.left) * (Module["canvas"].width / rect.width), (event.clientY - rect.top) * (Module["canvas"].height / rect.height), 0, 0])
                }
            }
            break;
        case "mousedown":
            window.focus();
            if (Browser.isFullScreen == 0)
                if (FTEC.evcb.wantfullscreen != 0)
                    if (Runtime.dynCall("i", FTEC.evcb.wantfullscreen, [])) {
                        Browser.requestFullScreen(true, true)
                    }
            if (FTEC.pointerwantlock != 0 && FTEC.pointerislocked == 0) {
                FTEC.pointerislocked = -1;
                Module["canvas"].requestPointerLock()
            }
            if (FTEC.usevr)
                if (FTEC.vrDisplay)
                    if (!FTEC.vrDisplay.isPresenting)
                        FTEC.vrDisplay.requestPresent([{
                            source: Module["canvas"]
                        }]).then((function() {
                            console.log("zomg, presenting!")
                        }
                        ), (function(err) {
                            FTEC.usevr = false;
                            console.log("cannot vrdisplay!")
                        }
                        ));
        case "mouseup":
            if (FTEC.evcb.button != 0) {
                Runtime.dynCall("viii", FTEC.evcb.button, [0, event.type == "mousedown", event.button]);
                event.preventDefault()
            }
            break;
        case "mousewheel":
        case "wheel":
            if (FTEC.evcb.button != 0) {
                Runtime.dynCall("viii", FTEC.evcb.button, [0, 2, event.deltaY]);
                event.preventDefault()
            }
            break;
        case "mouseout":
            if (FTEC.evcb.button != 0) {
                for (var i = 0; i < 8; i++)
                    Runtime.dynCall("viii", FTEC.evcb.button, [0, false, i])
            }
            if (FTEC.pointerislocked == -1)
                FTEC.pointerislocked = 0;
            break;
        case "focus":
        case "blur":
            Runtime.dynCall("iiiii", FTEC.evcb.key, [0, false, 16, 0]);
            Runtime.dynCall("iiiii", FTEC.evcb.key, [0, false, 17, 0]);
            Runtime.dynCall("iiiii", FTEC.evcb.key, [0, false, 18, 0]);
            if (FTEC.pointerislocked == -1)
                FTEC.pointerislocked = 0;
            break;
        case "keypress":
            if (FTEC.evcb.key != 0) {
                if (event.charCode >= 122 && event.charCode <= 123)
                    break;
                Runtime.dynCall("iiiii", FTEC.evcb.key, [0, 1, 0, event.charCode]);
                Runtime.dynCall("iiiii", FTEC.evcb.key, [0, 0, 0, event.charCode]);
                event.preventDefault();
                event.stopPropagation()
            }
            break;
        case "keydown":
        case "keyup":
            if (FTEC.evcb.key != 0 && event.keyCode != 122) {
                if (Runtime.dynCall("iiiii", FTEC.evcb.key, [0, event.type == "keydown", event.keyCode, 0]))
                    event.preventDefault()
            }
            break;
        case "touchstart":
        case "touchend":
        case "touchcancel":
        case "touchleave":
        case "touchmove":
            var touches = event.changedTouches;
            for (var i = 0; i < touches.length; i++) {
                var t = touches[i];
                if (FTEC.evcb.mouse)
                    Runtime.dynCall("viiffff", FTEC.evcb.mouse, [t.identifier + 1, true, t.pageX, t.pageY, 0, Math.sqrt(t.radiusX * t.radiusX + t.radiusY * t.radiusY)]);
                if (FTEC.evcb.button) {
                    if (event.type == "touchstart")
                        Runtime.dynCall("viii", FTEC.evcb.button, [t.identifier + 1, 1, 0]);
                    else if (event.type != "touchmove")
                        Runtime.dynCall("viii", FTEC.evcb.button, [t.identifier + 1, 0, 0])
                }
            }
            event.preventDefault();
            break;
        case "dragenter":
        case "dragover":
            event.stopPropagation();
            event.preventDefault();
            break;
        case "drop":
            event.stopPropagation();
            event.preventDefault();
            var files = event.dataTransfer.files;
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var reader = new FileReader;
                reader.onload = (function(evt) {
                    FTEC.loadurl(file.name, "", evt.target.result)
                }
                );
                reader.readAsArrayBuffer(file)
            }
            break;
        case "gamepadconnected":
            var gp = e.gamepad;
            if (FTEH.gamepads === undefined)
                FTEH.gamepads = [];
            FTEH.gamepads[gp.index] = gp;
            console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.", gp.index, gp.id, gp.buttons.length, gp.axes.length);
            break;
        case "gamepaddisconnected":
            var gp = e.gamepad;
            delete FTEH.gamepads[gp.index];
            if (FTEC.evcb.jaxis)
                for (var j = 0; j < 6; j += 1)
                    Runtime.dynCall("viifi", FTEC.evcb.jaxis, [gp.index, j, 0, true]);
            if (FTEC.evcb.jbutton)
                for (var j = 0; j < 32 + 4; j += 1)
                    Runtime.dynCall("viiii", FTEC.evcb.jbutton, [gp.index, j, 0, true]);
            console.log("Gamepad disconnected from index %d: %s", gp.index, gp.id);
            break;
        case "pointerlockchange":
        case "mozpointerlockchange":
        case "webkitpointerlockchange":
            FTEC.pointerislocked = document.pointerLockElement === Module["canvas"] || document.mozPointerLockElement === Module["canvas"] || document.webkitPointerLockElement === Module["canvas"];
            console.log("Pointer lock now " + FTEC.pointerislocked);
            break;
        case "vrdisplaypresentchange":
            console.log("vr present changed");
            console.log(event);
            break;
        case "vrdisplayactivate":
            console.log("vr display active");
            if (event.display == FTEC.vrDisplay) {
                FTEC.usevr = true;
                if (!FTEC.vrDisplay.isPresenting)
                    FTEC.vrDisplay.requestPresent([{
                        source: Module["canvas"]
                    }]).then((function() {
                        console.log("zomg, presenting!")
                    }
                    ), (function(err) {
                        FTEC.usevr = false;
                        console.log("cannot vrdisplay!")
                    }
                    ))
            }
            break;
        case "vrdisplaydeactivate":
            console.log("vr display inactive");
            if (event.display == FTEC.vrDisplay) {
                FTEC.vrDisplay.exitPresent();
                FTEC.usevr = false
            }
            break;
        default:
            console.log(event);
            break
        }
    }
    )
};
function _emscriptenfte_setupcanvas(nw, nh, evresize, evmouse, evmbutton, evkey, evfile, evjbutton, evjaxis, evwantfullscreen) {
    try {
        FTEC.evcb.resize = evresize;
        FTEC.evcb.mouse = evmouse;
        FTEC.evcb.button = evmbutton;
        FTEC.evcb.key = evkey;
        FTEC.evcb.loadfile = evfile;
        FTEC.evcb.jbutton = evjbutton;
        FTEC.evcb.jaxis = evjaxis;
        FTEC.evcb.wantfullscreen = evwantfullscreen;
        if (navigator.getVRDisplays) {
            FTEC.vrframeData = new VRFrameData;
            navigator.getVRDisplays().then((function(displays) {
                if (displays.length > 0) {
                    FTEC.vrDisplay = displays[0]
                }
            }
            ))
        }
        if ("GamepadEvent"in window)
            FTEH.gamepads = [];
        if (!FTEC.donecb) {
            FTEC.donecb = 1;
            var events = ["mousedown", "mouseup", "mousemove", "wheel", "mousewheel", "mouseout", "keypress", "keydown", "keyup", "touchstart", "touchend", "touchcancel", "touchleave", "touchmove", "dragenter", "dragover", "drop", "message", "resize", "pointerlockchange", "mozpointerlockchange", "webkitpointerlockchange", "focus", "blur"];
            events.forEach((function(event) {
                Module["canvas"].addEventListener(event, FTEC.handleevent, true)
            }
            ));
            var docevents = ["keypress", "keydown", "keyup", "pointerlockchange", "mozpointerlockchange", "webkitpointerlockchange"];
            docevents.forEach((function(event) {
                document.addEventListener(event, FTEC.handleevent, true)
            }
            ));
            var windowevents = ["message", "vrdisplaypresentchange", "vrdisplayactivate", "vrdisplaydeactivate", "gamepadconnected", "gamepaddisconnected"];
            windowevents.forEach((function(event) {
                window.addEventListener(event, FTEC.handleevent, true)
            }
            ))
        }
        var ctx = Browser.createContext(Module["canvas"], true, true);
        if (ctx == null) {
            var msg = "Unable to set up webgl context.\n\nPlease use a browser that supports it and has it enabled\nYour graphics drivers may also be blacklisted, so try updating those too. woo, might as well update your entire operating system while you're at it.\nIt'll be expensive, but hey, its YOUR money, not mine.\nYou can probably just disable the blacklist, but please don't moan at me when your computer blows up, seriously, make sure those drivers are not too buggy.\nI knew a guy once. True story. Boring, but true.\nYou're probably missing out on something right now. Don't you just hate it when that happens?\nMeh, its probably just tinkertoys, right?\n\nYou know, you could always try Internet Explorer, you never know, hell might have frozen over.\nDon't worry, I wasn't serious.\n\nTum te tum. Did you get it working yet?\nDude, fix it already.\n\nThis message was brought to you by Sleep Deprivation, sponsoring quake since I don't know when";
            if (FTEC.ctxwarned == 0) {
                FTEC.ctxwarned = 1;
                console.log(msg);
                alert(msg)
            }
            return 0
        }
        window.onresize = (function() {
            {
                var rect = Module["canvas"].getBoundingClientRect();
                Browser.setCanvasSize(rect.width, rect.height, false)
            }
            if (FTEC.evcb.resize != 0)
                Runtime.dynCall("vii", FTEC.evcb.resize, [Module["canvas"].width, Module["canvas"].height])
        }
        );
        window.onresize();
        if (FTEC.evcb.hashchange) {
            window.onhashchange = (function() {
                FTEC.loadurl(location.hash.substring(1), "", undefined)
            }
            )
        }
        _emscriptenfte_updatepointerlock(false, false)
    } catch (e) {
        console.log(e)
    }
    return 1
}
function _emscriptenfte_setupmainloop(fnc) {
    Module["noExitRuntime"] = true;
    Module["sched"] = (function() {
        var dovsync = false;
        var vr = false;
        if (ABORT)
            return;
        if (FTEC.vrDisplay) {
            vr = FTEC.vrDisplay.isPresenting;
            FTEC.vrDisplay.getFrameData(FTEC.vrframeData)
        }
        try {
            dovsync = Runtime.dynCall("i", fnc, [])
        } catch (err) {
            console.log(err)
        }
        if (vr)
            FTEC.vrDisplay.submitFrame();
        if (dovsync) {
            if (FTEC.vrDisplay)
                FTEC.vrDisplay.requestAnimationFrame(Module["sched"]);
            else
                Browser.requestAnimationFrame(Module["sched"])
        } else
            setTimeout(Module["sched"], 0)
    }
    );
    setTimeout(Module["sched"], 1)
}
function _emscriptenfte_ticks_ms() {
    return Date.now()
}
function _emscriptenfte_updatepointerlock(wantlock, softcursor) {
    FTEC.pointerwantlock = wantlock;
    if (wantlock == 0 && FTEC.pointerislocked != 0) {
        document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
        FTEC.pointerislocked = 0;
        if (document.exitPointerLock)
            document.exitPointerLock()
    }
    if (softcursor)
        Module.canvas.style.cursor = "none";
    else
        Module.canvas.style.cursor = "default"
}
function _emscriptenfte_window_location(msg) {
    msg = Pointer_stringify(msg);
    console.log("Redirecting page to " + msg);
    window.location = msg
}
function _emscriptenfte_ws_close(sockid) {
    var s = FTEH.h[sockid];
    if (s === undefined)
        return -1;
    s.callcb = null;
    if (s.ws != null) {
        s.ws.close();
        s.ws = null
    }
    if (s.pc != null) {
        s.pc.close();
        s.pc = null
    }
    if (s.broker != null) {
        s.broker.close();
        s.broker = null
    }
    delete FTEH.h[sockid];
    return 0
}
function _emscriptenfte_ws_connect(brokerurl, protocolname) {
    var _url = Pointer_stringify(brokerurl);
    var _protocol = Pointer_stringify(protocolname);
    var s = {
        ws: null,
        inq: [],
        err: 0,
        con: 0
    };
    try {
        s.ws = new WebSocket(_url,_protocol)
    } catch (err) {
        console.log(err)
    }
    if (s.ws === undefined)
        return -1;
    if (s.ws == null)
        return -1;
    s.ws.binaryType = "arraybuffer";
    s.ws.onerror = (function(event) {
        s.con = 0;
        s.err = 1
    }
    );
    s.ws.onclose = (function(event) {
        s.con = 0;
        s.err = 1
    }
    );
    s.ws.onopen = (function(event) {
        s.con = 1
    }
    );
    s.ws.onmessage = (function(event) {
        assert(typeof event.data !== "string" && event.data.byteLength, "websocket data is not usable");
        s.inq.push(new Uint8Array(event.data))
    }
    );
    return _emscriptenfte_handle_alloc(s)
}
function _emscriptenfte_ws_recv(sockid, data, len) {
    var s = FTEH.h[sockid];
    if (s === undefined)
        return -1;
    var inp = s.inq.shift();
    if (inp) {
        if (inp.length > len)
            inp.length = len;
        HEAPU8.set(inp, data);
        return inp.length
    }
    if (s.err)
        return -1;
    return 0
}
function _emscriptenfte_ws_send(sockid, data, len) {
    var s = FTEH.h[sockid];
    if (s === undefined)
        return -1;
    if (s.con == 0)
        return 0;
    s.ws.send(HEAPU8.subarray(data, data + len));
    return len
}
function __exit(status) {
    exit(status)
}
function _exit(status) {
    __exit(status)
}
function _getenv(name) {
    if (name === 0)
        return 0;
    name = Pointer_stringify(name);
    if (!ENV.hasOwnProperty(name))
        return 0;
    if (_getenv.ret)
        _free(_getenv.ret);
    _getenv.ret = allocateUTF8(ENV[name]);
    return _getenv.ret
}
var GL = {
    counter: 1,
    lastError: 0,
    buffers: [],
    mappedBuffers: {},
    programs: [],
    framebuffers: [],
    renderbuffers: [],
    textures: [],
    uniforms: [],
    shaders: [],
    vaos: [],
    contexts: [],
    currentContext: null,
    offscreenCanvases: {},
    timerQueriesEXT: [],
    byteSizeByTypeRoot: 5120,
    byteSizeByType: [1, 1, 2, 2, 4, 4, 4, 2, 3, 4, 8],
    programInfos: {},
    stringCache: {},
    tempFixedLengthArray: [],
    packAlignment: 4,
    unpackAlignment: 4,
    init: (function() {
        GL.miniTempBuffer = new Float32Array(GL.MINI_TEMP_BUFFER_SIZE);
        for (var i = 0; i < GL.MINI_TEMP_BUFFER_SIZE; i++) {
            GL.miniTempBufferViews[i] = GL.miniTempBuffer.subarray(0, i + 1)
        }
        for (var i = 0; i < 32; i++) {
            GL.tempFixedLengthArray.push(new Array(i))
        }
    }
    ),
    recordError: function recordError(errorCode) {
        if (!GL.lastError) {
            GL.lastError = errorCode
        }
    },
    getNewId: (function(table) {
        var ret = GL.counter++;
        for (var i = table.length; i < ret; i++) {
            table[i] = null
        }
        return ret
    }
    ),
    MINI_TEMP_BUFFER_SIZE: 256,
    miniTempBuffer: null,
    miniTempBufferViews: [0],
    getSource: (function(shader, count, string, length) {
        var source = "";
        for (var i = 0; i < count; ++i) {
            var frag;
            if (length) {
                var len = HEAP32[length + i * 4 >> 2];
                if (len < 0) {
                    frag = Pointer_stringify(HEAP32[string + i * 4 >> 2])
                } else {
                    frag = Pointer_stringify(HEAP32[string + i * 4 >> 2], len)
                }
            } else {
                frag = Pointer_stringify(HEAP32[string + i * 4 >> 2])
            }
            source += frag
        }
        return source
    }
    ),
    createContext: (function(canvas, webGLContextAttributes) {
        if (typeof webGLContextAttributes["majorVersion"] === "undefined" && typeof webGLContextAttributes["minorVersion"] === "undefined") {
            webGLContextAttributes["majorVersion"] = 1;
            webGLContextAttributes["minorVersion"] = 0
        }
        var ctx;
        var errorInfo = "?";
        function onContextCreationError(event) {
            errorInfo = event.statusMessage || errorInfo
        }
        try {
            canvas.addEventListener("webglcontextcreationerror", onContextCreationError, false);
            try {
                if (webGLContextAttributes["majorVersion"] == 1 && webGLContextAttributes["minorVersion"] == 0) {
                    ctx = canvas.getContext("webgl", webGLContextAttributes) || canvas.getContext("experimental-webgl", webGLContextAttributes)
                } else if (webGLContextAttributes["majorVersion"] == 2 && webGLContextAttributes["minorVersion"] == 0) {
                    ctx = canvas.getContext("webgl2", webGLContextAttributes)
                } else {
                    throw "Unsupported WebGL context version " + majorVersion + "." + minorVersion + "!"
                }
            } finally {
                canvas.removeEventListener("webglcontextcreationerror", onContextCreationError, false)
            }
            if (!ctx)
                throw ":("
        } catch (e) {
            out("Could not create canvas: " + [errorInfo, e, JSON.stringify(webGLContextAttributes)]);
            return 0
        }
        if (!ctx)
            return 0;
        var context = GL.registerContext(ctx, webGLContextAttributes);
        return context
    }
    ),
    registerContext: (function(ctx, webGLContextAttributes) {
        var handle = GL.getNewId(GL.contexts);
        var context = {
            handle: handle,
            attributes: webGLContextAttributes,
            version: webGLContextAttributes["majorVersion"],
            GLctx: ctx
        };
        if (ctx.canvas)
            ctx.canvas.GLctxObject = context;
        GL.contexts[handle] = context;
        if (typeof webGLContextAttributes["enableExtensionsByDefault"] === "undefined" || webGLContextAttributes["enableExtensionsByDefault"]) {
            GL.initExtensions(context)
        }
        return handle
    }
    ),
    makeContextCurrent: (function(contextHandle) {
        var context = GL.contexts[contextHandle];
        if (!context)
            return false;
        GLctx = Module.ctx = context.GLctx;
        GL.currentContext = context;
        return true
    }
    ),
    getContext: (function(contextHandle) {
        return GL.contexts[contextHandle]
    }
    ),
    deleteContext: (function(contextHandle) {
        if (GL.currentContext === GL.contexts[contextHandle])
            GL.currentContext = null;
        if (typeof JSEvents === "object")
            JSEvents.removeAllHandlersOnTarget(GL.contexts[contextHandle].GLctx.canvas);
        if (GL.contexts[contextHandle] && GL.contexts[contextHandle].GLctx.canvas)
            GL.contexts[contextHandle].GLctx.canvas.GLctxObject = undefined;
        GL.contexts[contextHandle] = null
    }
    ),
    initExtensions: (function(context) {
        if (!context)
            context = GL.currentContext;
        if (context.initExtensionsDone)
            return;
        context.initExtensionsDone = true;
        var GLctx = context.GLctx;
        context.maxVertexAttribs = GLctx.getParameter(GLctx.MAX_VERTEX_ATTRIBS);
        if (context.version < 2) {
            var instancedArraysExt = GLctx.getExtension("ANGLE_instanced_arrays");
            if (instancedArraysExt) {
                GLctx["vertexAttribDivisor"] = (function(index, divisor) {
                    instancedArraysExt["vertexAttribDivisorANGLE"](index, divisor)
                }
                );
                GLctx["drawArraysInstanced"] = (function(mode, first, count, primcount) {
                    instancedArraysExt["drawArraysInstancedANGLE"](mode, first, count, primcount)
                }
                );
                GLctx["drawElementsInstanced"] = (function(mode, count, type, indices, primcount) {
                    instancedArraysExt["drawElementsInstancedANGLE"](mode, count, type, indices, primcount)
                }
                )
            }
            var vaoExt = GLctx.getExtension("OES_vertex_array_object");
            if (vaoExt) {
                GLctx["createVertexArray"] = (function() {
                    return vaoExt["createVertexArrayOES"]()
                }
                );
                GLctx["deleteVertexArray"] = (function(vao) {
                    vaoExt["deleteVertexArrayOES"](vao)
                }
                );
                GLctx["bindVertexArray"] = (function(vao) {
                    vaoExt["bindVertexArrayOES"](vao)
                }
                );
                GLctx["isVertexArray"] = (function(vao) {
                    return vaoExt["isVertexArrayOES"](vao)
                }
                )
            }
            var drawBuffersExt = GLctx.getExtension("WEBGL_draw_buffers");
            if (drawBuffersExt) {
                GLctx["drawBuffers"] = (function(n, bufs) {
                    drawBuffersExt["drawBuffersWEBGL"](n, bufs)
                }
                )
            }
        }
        GLctx.disjointTimerQueryExt = GLctx.getExtension("EXT_disjoint_timer_query");
        var automaticallyEnabledExtensions = ["OES_texture_float", "OES_texture_half_float", "OES_standard_derivatives", "OES_vertex_array_object", "WEBGL_compressed_texture_s3tc", "WEBGL_depth_texture", "OES_element_index_uint", "EXT_texture_filter_anisotropic", "EXT_frag_depth", "WEBGL_draw_buffers", "ANGLE_instanced_arrays", "OES_texture_float_linear", "OES_texture_half_float_linear", "EXT_blend_minmax", "EXT_shader_texture_lod", "WEBGL_compressed_texture_pvrtc", "EXT_color_buffer_half_float", "WEBGL_color_buffer_float", "EXT_sRGB", "WEBGL_compressed_texture_etc1", "EXT_disjoint_timer_query", "WEBGL_compressed_texture_etc", "WEBGL_compressed_texture_astc", "EXT_color_buffer_float", "WEBGL_compressed_texture_s3tc_srgb", "EXT_disjoint_timer_query_webgl2"];
        var exts = GLctx.getSupportedExtensions();
        if (exts && exts.length > 0) {
            GLctx.getSupportedExtensions().forEach((function(ext) {
                if (automaticallyEnabledExtensions.indexOf(ext) != -1) {
                    GLctx.getExtension(ext)
                }
            }
            ))
        }
    }
    ),
    populateUniformTable: (function(program) {
        var p = GL.programs[program];
        GL.programInfos[program] = {
            uniforms: {},
            maxUniformLength: 0,
            maxAttributeLength: -1,
            maxUniformBlockNameLength: -1
        };
        var ptable = GL.programInfos[program];
        var utable = ptable.uniforms;
        var numUniforms = GLctx.getProgramParameter(p, GLctx.ACTIVE_UNIFORMS);
        for (var i = 0; i < numUniforms; ++i) {
            var u = GLctx.getActiveUniform(p, i);
            var name = u.name;
            ptable.maxUniformLength = Math.max(ptable.maxUniformLength, name.length + 1);
            if (name.indexOf("]", name.length - 1) !== -1) {
                var ls = name.lastIndexOf("[");
                name = name.slice(0, ls)
            }
            var loc = GLctx.getUniformLocation(p, name);
            if (loc != null) {
                var id = GL.getNewId(GL.uniforms);
                utable[name] = [u.size, id];
                GL.uniforms[id] = loc;
                for (var j = 1; j < u.size; ++j) {
                    var n = name + "[" + j + "]";
                    loc = GLctx.getUniformLocation(p, n);
                    id = GL.getNewId(GL.uniforms);
                    GL.uniforms[id] = loc
                }
            }
        }
    }
    )
};
function _glActiveTexture(x0) {
    GLctx["activeTexture"](x0)
}
function _glAttachShader(program, shader) {
    GLctx.attachShader(GL.programs[program], GL.shaders[shader])
}
function _glBindAttribLocation(program, index, name) {
    name = Pointer_stringify(name);
    GLctx.bindAttribLocation(GL.programs[program], index, name)
}
function _glBindBuffer(target, buffer) {
    var bufferObj = buffer ? GL.buffers[buffer] : null;
    GLctx.bindBuffer(target, bufferObj)
}
function _glBindFramebuffer(target, framebuffer) {
    GLctx.bindFramebuffer(target, framebuffer ? GL.framebuffers[framebuffer] : null)
}
function _glBindRenderbuffer(target, renderbuffer) {
    GLctx.bindRenderbuffer(target, renderbuffer ? GL.renderbuffers[renderbuffer] : null)
}
function _glBindTexture(target, texture) {
    GLctx.bindTexture(target, texture ? GL.textures[texture] : null)
}
function _glBlendFunc(x0, x1) {
    GLctx["blendFunc"](x0, x1)
}
function _glBufferData(target, size, data, usage) {
    if (!data) {
        GLctx.bufferData(target, size, usage)
    } else {
        GLctx.bufferData(target, HEAPU8.subarray(data, data + size), usage)
    }
}
function _glBufferSubData(target, offset, size, data) {
    GLctx.bufferSubData(target, offset, HEAPU8.subarray(data, data + size))
}
function _glCheckFramebufferStatus(x0) {
    return GLctx["checkFramebufferStatus"](x0)
}
function _glClear(x0) {
    GLctx["clear"](x0)
}
function _glClearColor(x0, x1, x2, x3) {
    GLctx["clearColor"](x0, x1, x2, x3)
}
function _glClearStencil(x0) {
    GLctx["clearStencil"](x0)
}
function _glColorMask(red, green, blue, alpha) {
    GLctx.colorMask(!!red, !!green, !!blue, !!alpha)
}
function _glCompileShader(shader) {
    GLctx.compileShader(GL.shaders[shader])
}
function _glCompressedTexImage2D(target, level, internalFormat, width, height, border, imageSize, data) {
    GLctx["compressedTexImage2D"](target, level, internalFormat, width, height, border, data ? HEAPU8.subarray(data, data + imageSize) : null)
}
function _glCompressedTexSubImage2D(target, level, xoffset, yoffset, width, height, format, imageSize, data) {
    GLctx["compressedTexSubImage2D"](target, level, xoffset, yoffset, width, height, format, data ? HEAPU8.subarray(data, data + imageSize) : null)
}
function _glCopyTexImage2D(x0, x1, x2, x3, x4, x5, x6, x7) {
    GLctx["copyTexImage2D"](x0, x1, x2, x3, x4, x5, x6, x7)
}
function _glCopyTexSubImage2D(x0, x1, x2, x3, x4, x5, x6, x7) {
    GLctx["copyTexSubImage2D"](x0, x1, x2, x3, x4, x5, x6, x7)
}
function _glCreateProgram() {
    var id = GL.getNewId(GL.programs);
    var program = GLctx.createProgram();
    program.name = id;
    GL.programs[id] = program;
    return id
}
function _glCreateShader(shaderType) {
    var id = GL.getNewId(GL.shaders);
    GL.shaders[id] = GLctx.createShader(shaderType);
    return id
}
function _glCullFace(x0) {
    GLctx["cullFace"](x0)
}
function _glDeleteBuffers(n, buffers) {
    for (var i = 0; i < n; i++) {
        var id = HEAP32[buffers + i * 4 >> 2];
        var buffer = GL.buffers[id];
        if (!buffer)
            continue;
        GLctx.deleteBuffer(buffer);
        buffer.name = 0;
        GL.buffers[id] = null;
        if (id == GL.currArrayBuffer)
            GL.currArrayBuffer = 0;
        if (id == GL.currElementArrayBuffer)
            GL.currElementArrayBuffer = 0
    }
}
function _glDeleteFramebuffers(n, framebuffers) {
    for (var i = 0; i < n; ++i) {
        var id = HEAP32[framebuffers + i * 4 >> 2];
        var framebuffer = GL.framebuffers[id];
        if (!framebuffer)
            continue;
        GLctx.deleteFramebuffer(framebuffer);
        framebuffer.name = 0;
        GL.framebuffers[id] = null
    }
}
function _glDeleteProgram(id) {
    if (!id)
        return;
    var program = GL.programs[id];
    if (!program) {
        GL.recordError(1281);
        return
    }
    GLctx.deleteProgram(program);
    program.name = 0;
    GL.programs[id] = null;
    GL.programInfos[id] = null
}
function _glDeleteRenderbuffers(n, renderbuffers) {
    for (var i = 0; i < n; i++) {
        var id = HEAP32[renderbuffers + i * 4 >> 2];
        var renderbuffer = GL.renderbuffers[id];
        if (!renderbuffer)
            continue;
        GLctx.deleteRenderbuffer(renderbuffer);
        renderbuffer.name = 0;
        GL.renderbuffers[id] = null
    }
}
function _glDeleteShader(id) {
    if (!id)
        return;
    var shader = GL.shaders[id];
    if (!shader) {
        GL.recordError(1281);
        return
    }
    GLctx.deleteShader(shader);
    GL.shaders[id] = null
}
function _glDeleteTextures(n, textures) {
    for (var i = 0; i < n; i++) {
        var id = HEAP32[textures + i * 4 >> 2];
        var texture = GL.textures[id];
        if (!texture)
            continue;
        GLctx.deleteTexture(texture);
        texture.name = 0;
        GL.textures[id] = null
    }
}
function _glDepthFunc(x0) {
    GLctx["depthFunc"](x0)
}
function _glDepthMask(flag) {
    GLctx.depthMask(!!flag)
}
function _glDisable(x0) {
    GLctx["disable"](x0)
}
function _glDisableVertexAttribArray(index) {
    GLctx.disableVertexAttribArray(index)
}
function _glDrawArrays(mode, first, count) {
    GLctx.drawArrays(mode, first, count)
}
function _glDrawElements(mode, count, type, indices) {
    GLctx.drawElements(mode, count, type, indices)
}
function _glEnable(x0) {
    GLctx["enable"](x0)
}
function _glEnableVertexAttribArray(index) {
    GLctx.enableVertexAttribArray(index)
}
function _glFinish() {
    GLctx["finish"]()
}
function _glFramebufferRenderbuffer(target, attachment, renderbuffertarget, renderbuffer) {
    GLctx.framebufferRenderbuffer(target, attachment, renderbuffertarget, GL.renderbuffers[renderbuffer])
}
function _glFramebufferTexture2D(target, attachment, textarget, texture, level) {
    GLctx.framebufferTexture2D(target, attachment, textarget, GL.textures[texture], level)
}
function _glGenBuffers(n, buffers) {
    for (var i = 0; i < n; i++) {
        var buffer = GLctx.createBuffer();
        if (!buffer) {
            GL.recordError(1282);
            while (i < n)
                HEAP32[buffers + i++ * 4 >> 2] = 0;
            return
        }
        var id = GL.getNewId(GL.buffers);
        buffer.name = id;
        GL.buffers[id] = buffer;
        HEAP32[buffers + i * 4 >> 2] = id
    }
}
function _glGenFramebuffers(n, ids) {
    for (var i = 0; i < n; ++i) {
        var framebuffer = GLctx.createFramebuffer();
        if (!framebuffer) {
            GL.recordError(1282);
            while (i < n)
                HEAP32[ids + i++ * 4 >> 2] = 0;
            return
        }
        var id = GL.getNewId(GL.framebuffers);
        framebuffer.name = id;
        GL.framebuffers[id] = framebuffer;
        HEAP32[ids + i * 4 >> 2] = id
    }
}
function _glGenRenderbuffers(n, renderbuffers) {
    for (var i = 0; i < n; i++) {
        var renderbuffer = GLctx.createRenderbuffer();
        if (!renderbuffer) {
            GL.recordError(1282);
            while (i < n)
                HEAP32[renderbuffers + i++ * 4 >> 2] = 0;
            return
        }
        var id = GL.getNewId(GL.renderbuffers);
        renderbuffer.name = id;
        GL.renderbuffers[id] = renderbuffer;
        HEAP32[renderbuffers + i * 4 >> 2] = id
    }
}
function _glGenTextures(n, textures) {
    for (var i = 0; i < n; i++) {
        var texture = GLctx.createTexture();
        if (!texture) {
            GL.recordError(1282);
            while (i < n)
                HEAP32[textures + i++ * 4 >> 2] = 0;
            return
        }
        var id = GL.getNewId(GL.textures);
        texture.name = id;
        GL.textures[id] = texture;
        HEAP32[textures + i * 4 >> 2] = id
    }
}
function _glGetAttribLocation(program, name) {
    program = GL.programs[program];
    name = Pointer_stringify(name);
    return GLctx.getAttribLocation(program, name)
}
function _glGetError() {
    if (GL.lastError) {
        var error = GL.lastError;
        GL.lastError = 0;
        return error
    } else {
        return GLctx.getError()
    }
}
function emscriptenWebGLGet(name_, p, type) {
    if (!p) {
        GL.recordError(1281);
        return
    }
    var ret = undefined;
    switch (name_) {
    case 36346:
        ret = 1;
        break;
    case 36344:
        if (type !== "Integer" && type !== "Integer64") {
            GL.recordError(1280)
        }
        return;
    case 36345:
        ret = 0;
        break;
    case 34466:
        var formats = GLctx.getParameter(34467);
        ret = formats.length;
        break
    }
    if (ret === undefined) {
        var result = GLctx.getParameter(name_);
        switch (typeof result) {
        case "number":
            ret = result;
            break;
        case "boolean":
            ret = result ? 1 : 0;
            break;
        case "string":
            GL.recordError(1280);
            return;
        case "object":
            if (result === null) {
                switch (name_) {
                case 34964:
                case 35725:
                case 34965:
                case 36006:
                case 36007:
                case 32873:
                case 34068:
                    {
                        ret = 0;
                        break
                    }
                    ;
                default:
                    {
                        GL.recordError(1280);
                        return
                    }
                }
            } else if (result instanceof Float32Array || result instanceof Uint32Array || result instanceof Int32Array || result instanceof Array) {
                for (var i = 0; i < result.length; ++i) {
                    switch (type) {
                    case "Integer":
                        HEAP32[p + i * 4 >> 2] = result[i];
                        break;
                    case "Float":
                        HEAPF32[p + i * 4 >> 2] = result[i];
                        break;
                    case "Boolean":
                        HEAP8[p + i >> 0] = result[i] ? 1 : 0;
                        break;
                    default:
                        throw "internal glGet error, bad type: " + type
                    }
                }
                return
            } else if (result instanceof WebGLBuffer || result instanceof WebGLProgram || result instanceof WebGLFramebuffer || result instanceof WebGLRenderbuffer || result instanceof WebGLTexture) {
                ret = result.name | 0
            } else {
                GL.recordError(1280);
                return
            }
            break;
        default:
            GL.recordError(1280);
            return
        }
    }
    switch (type) {
    case "Integer64":
        tempI64 = [ret >>> 0, (tempDouble = ret,
        +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)],
        HEAP32[p >> 2] = tempI64[0],
        HEAP32[p + 4 >> 2] = tempI64[1];
        break;
    case "Integer":
        HEAP32[p >> 2] = ret;
        break;
    case "Float":
        HEAPF32[p >> 2] = ret;
        break;
    case "Boolean":
        HEAP8[p >> 0] = ret ? 1 : 0;
        break;
    default:
        throw "internal glGet error, bad type: " + type
    }
}
function _glGetIntegerv(name_, p) {
    emscriptenWebGLGet(name_, p, "Integer")
}
function _glGetProgramInfoLog(program, maxLength, length, infoLog) {
    var log = GLctx.getProgramInfoLog(GL.programs[program]);
    if (log === null)
        log = "(unknown error)";
    if (maxLength > 0 && infoLog) {
        var numBytesWrittenExclNull = stringToUTF8(log, infoLog, maxLength);
        if (length)
            HEAP32[length >> 2] = numBytesWrittenExclNull
    } else {
        if (length)
            HEAP32[length >> 2] = 0
    }
}
function _glGetProgramiv(program, pname, p) {
    if (!p) {
        GL.recordError(1281);
        return
    }
    if (program >= GL.counter) {
        GL.recordError(1281);
        return
    }
    var ptable = GL.programInfos[program];
    if (!ptable) {
        GL.recordError(1282);
        return
    }
    if (pname == 35716) {
        var log = GLctx.getProgramInfoLog(GL.programs[program]);
        if (log === null)
            log = "(unknown error)";
        HEAP32[p >> 2] = log.length + 1
    } else if (pname == 35719) {
        HEAP32[p >> 2] = ptable.maxUniformLength
    } else if (pname == 35722) {
        if (ptable.maxAttributeLength == -1) {
            program = GL.programs[program];
            var numAttribs = GLctx.getProgramParameter(program, GLctx.ACTIVE_ATTRIBUTES);
            ptable.maxAttributeLength = 0;
            for (var i = 0; i < numAttribs; ++i) {
                var activeAttrib = GLctx.getActiveAttrib(program, i);
                ptable.maxAttributeLength = Math.max(ptable.maxAttributeLength, activeAttrib.name.length + 1)
            }
        }
        HEAP32[p >> 2] = ptable.maxAttributeLength
    } else if (pname == 35381) {
        if (ptable.maxUniformBlockNameLength == -1) {
            program = GL.programs[program];
            var numBlocks = GLctx.getProgramParameter(program, GLctx.ACTIVE_UNIFORM_BLOCKS);
            ptable.maxUniformBlockNameLength = 0;
            for (var i = 0; i < numBlocks; ++i) {
                var activeBlockName = GLctx.getActiveUniformBlockName(program, i);
                ptable.maxUniformBlockNameLength = Math.max(ptable.maxUniformBlockNameLength, activeBlockName.length + 1)
            }
        }
        HEAP32[p >> 2] = ptable.maxUniformBlockNameLength
    } else {
        HEAP32[p >> 2] = GLctx.getProgramParameter(GL.programs[program], pname)
    }
}
function _glGetShaderInfoLog(shader, maxLength, length, infoLog) {
    var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
    if (log === null)
        log = "(unknown error)";
    if (maxLength > 0 && infoLog) {
        var numBytesWrittenExclNull = stringToUTF8(log, infoLog, maxLength);
        if (length)
            HEAP32[length >> 2] = numBytesWrittenExclNull
    } else {
        if (length)
            HEAP32[length >> 2] = 0
    }
}
function _glGetShaderSource(shader, bufSize, length, source) {
    var result = GLctx.getShaderSource(GL.shaders[shader]);
    if (!result)
        return;
    if (bufSize > 0 && source) {
        var numBytesWrittenExclNull = stringToUTF8(result, source, bufSize);
        if (length)
            HEAP32[length >> 2] = numBytesWrittenExclNull
    } else {
        if (length)
            HEAP32[length >> 2] = 0
    }
}
function _glGetShaderiv(shader, pname, p) {
    if (!p) {
        GL.recordError(1281);
        return
    }
    if (pname == 35716) {
        var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
        if (log === null)
            log = "(unknown error)";
        HEAP32[p >> 2] = log.length + 1
    } else if (pname == 35720) {
        var source = GLctx.getShaderSource(GL.shaders[shader]);
        var sourceLength = source === null || source.length == 0 ? 0 : source.length + 1;
        HEAP32[p >> 2] = sourceLength
    } else {
        HEAP32[p >> 2] = GLctx.getShaderParameter(GL.shaders[shader], pname)
    }
}
function _glGetString(name_) {
    if (GL.stringCache[name_])
        return GL.stringCache[name_];
    var ret;
    switch (name_) {
    case 7936:
    case 7937:
    case 37445:
    case 37446:
        ret = allocate(intArrayFromString(GLctx.getParameter(name_)), "i8", ALLOC_NORMAL);
        break;
    case 7938:
        var glVersion = GLctx.getParameter(GLctx.VERSION);
        {
            glVersion = "OpenGL ES 2.0 (" + glVersion + ")"
        }
        ret = allocate(intArrayFromString(glVersion), "i8", ALLOC_NORMAL);
        break;
    case 7939:
        var exts = GLctx.getSupportedExtensions();
        var gl_exts = [];
        for (var i = 0; i < exts.length; ++i) {
            gl_exts.push(exts[i]);
            gl_exts.push("GL_" + exts[i])
        }
        ret = allocate(intArrayFromString(gl_exts.join(" ")), "i8", ALLOC_NORMAL);
        break;
    case 35724:
        var glslVersion = GLctx.getParameter(GLctx.SHADING_LANGUAGE_VERSION);
        var ver_re = /^WebGL GLSL ES ([0-9]\.[0-9][0-9]?)(?:$| .*)/;
        var ver_num = glslVersion.match(ver_re);
        if (ver_num !== null) {
            if (ver_num[1].length == 3)
                ver_num[1] = ver_num[1] + "0";
            glslVersion = "OpenGL ES GLSL ES " + ver_num[1] + " (" + glslVersion + ")"
        }
        ret = allocate(intArrayFromString(glslVersion), "i8", ALLOC_NORMAL);
        break;
    default:
        GL.recordError(1280);
        return 0
    }
    GL.stringCache[name_] = ret;
    return ret
}
function _glGetUniformLocation(program, name) {
    name = Pointer_stringify(name);
    var arrayOffset = 0;
    if (name.indexOf("]", name.length - 1) !== -1) {
        var ls = name.lastIndexOf("[");
        var arrayIndex = name.slice(ls + 1, -1);
        if (arrayIndex.length > 0) {
            arrayOffset = parseInt(arrayIndex);
            if (arrayOffset < 0) {
                return -1
            }
        }
        name = name.slice(0, ls)
    }
    var ptable = GL.programInfos[program];
    if (!ptable) {
        return -1
    }
    var utable = ptable.uniforms;
    var uniformInfo = utable[name];
    if (uniformInfo && arrayOffset < uniformInfo[0]) {
        return uniformInfo[1] + arrayOffset
    } else {
        return -1
    }
}
function _glLineWidth(x0) {
    GLctx["lineWidth"](x0)
}
function _glLinkProgram(program) {
    GLctx.linkProgram(GL.programs[program]);
    GL.programInfos[program] = null;
    GL.populateUniformTable(program)
}
function _glPolygonOffset(x0, x1) {
    GLctx["polygonOffset"](x0, x1)
}
function emscriptenWebGLComputeImageSize(width, height, sizePerPixel, alignment) {
    function roundedToNextMultipleOf(x, y) {
        return Math.floor((x + y - 1) / y) * y
    }
    var plainRowSize = width * sizePerPixel;
    var alignedRowSize = roundedToNextMultipleOf(plainRowSize, alignment);
    return height <= 0 ? 0 : (height - 1) * alignedRowSize + plainRowSize
}
function emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat) {
    var sizePerPixel;
    var numChannels;
    switch (format) {
    case 6406:
    case 6409:
    case 6402:
        numChannels = 1;
        break;
    case 6410:
        numChannels = 2;
        break;
    case 6407:
    case 35904:
        numChannels = 3;
        break;
    case 6408:
    case 35906:
        numChannels = 4;
        break;
    default:
        GL.recordError(1280);
        return null
    }
    switch (type) {
    case 5121:
        sizePerPixel = numChannels * 1;
        break;
    case 5123:
    case 36193:
        sizePerPixel = numChannels * 2;
        break;
    case 5125:
    case 5126:
        sizePerPixel = numChannels * 4;
        break;
    case 34042:
        sizePerPixel = 4;
        break;
    case 33635:
    case 32819:
    case 32820:
        sizePerPixel = 2;
        break;
    default:
        GL.recordError(1280);
        return null
    }
    var bytes = emscriptenWebGLComputeImageSize(width, height, sizePerPixel, GL.unpackAlignment);
    switch (type) {
    case 5121:
        return HEAPU8.subarray(pixels, pixels + bytes);
    case 5126:
        return HEAPF32.subarray(pixels >> 2, pixels + bytes >> 2);
    case 5125:
    case 34042:
        return HEAPU32.subarray(pixels >> 2, pixels + bytes >> 2);
    case 5123:
    case 33635:
    case 32819:
    case 32820:
    case 36193:
        return HEAPU16.subarray(pixels >> 1, pixels + bytes >> 1);
    default:
        GL.recordError(1280);
        return null
    }
}
function _glReadPixels(x, y, width, height, format, type, pixels) {
    var pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, format);
    if (!pixelData) {
        GL.recordError(1280);
        return
    }
    GLctx.readPixels(x, y, width, height, format, type, pixelData)
}
function _glRenderbufferStorage(x0, x1, x2, x3) {
    GLctx["renderbufferStorage"](x0, x1, x2, x3)
}
function _glScissor(x0, x1, x2, x3) {
    GLctx["scissor"](x0, x1, x2, x3)
}
function _glShaderSource(shader, count, string, length) {
    var source = GL.getSource(shader, count, string, length);
    GLctx.shaderSource(GL.shaders[shader], source)
}
function _glStencilFunc(x0, x1, x2) {
    GLctx["stencilFunc"](x0, x1, x2)
}
function _glStencilOpSeparate(x0, x1, x2, x3) {
    GLctx["stencilOpSeparate"](x0, x1, x2, x3)
}
function _glTexImage2D(target, level, internalFormat, width, height, border, format, type, pixels) {
    var pixelData = null;
    if (pixels)
        pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat);
    GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixelData)
}
function _glTexParameterf(x0, x1, x2) {
    GLctx["texParameterf"](x0, x1, x2)
}
function _glTexParameteri(x0, x1, x2) {
    GLctx["texParameteri"](x0, x1, x2)
}
function _glTexSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels) {
    var pixelData = null;
    if (pixels)
        pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, 0);
    GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixelData)
}
function _glUniform1f(location, v0) {
    GLctx.uniform1f(GL.uniforms[location], v0)
}
function _glUniform1i(location, v0) {
    GLctx.uniform1i(GL.uniforms[location], v0)
}
function _glUniform2fv(location, count, value) {
    var view;
    if (2 * count <= GL.MINI_TEMP_BUFFER_SIZE) {
        view = GL.miniTempBufferViews[2 * count - 1];
        for (var i = 0; i < 2 * count; i += 2) {
            view[i] = HEAPF32[value + 4 * i >> 2];
            view[i + 1] = HEAPF32[value + (4 * i + 4) >> 2]
        }
    } else {
        view = HEAPF32.subarray(value >> 2, value + count * 8 >> 2)
    }
    GLctx.uniform2fv(GL.uniforms[location], view)
}
function _glUniform3fv(location, count, value) {
    var view;
    if (3 * count <= GL.MINI_TEMP_BUFFER_SIZE) {
        view = GL.miniTempBufferViews[3 * count - 1];
        for (var i = 0; i < 3 * count; i += 3) {
            view[i] = HEAPF32[value + 4 * i >> 2];
            view[i + 1] = HEAPF32[value + (4 * i + 4) >> 2];
            view[i + 2] = HEAPF32[value + (4 * i + 8) >> 2]
        }
    } else {
        view = HEAPF32.subarray(value >> 2, value + count * 12 >> 2)
    }
    GLctx.uniform3fv(GL.uniforms[location], view)
}
function _glUniform4f(location, v0, v1, v2, v3) {
    GLctx.uniform4f(GL.uniforms[location], v0, v1, v2, v3)
}
function _glUniform4fv(location, count, value) {
    var view;
    if (4 * count <= GL.MINI_TEMP_BUFFER_SIZE) {
        view = GL.miniTempBufferViews[4 * count - 1];
        for (var i = 0; i < 4 * count; i += 4) {
            view[i] = HEAPF32[value + 4 * i >> 2];
            view[i + 1] = HEAPF32[value + (4 * i + 4) >> 2];
            view[i + 2] = HEAPF32[value + (4 * i + 8) >> 2];
            view[i + 3] = HEAPF32[value + (4 * i + 12) >> 2]
        }
    } else {
        view = HEAPF32.subarray(value >> 2, value + count * 16 >> 2)
    }
    GLctx.uniform4fv(GL.uniforms[location], view)
}
function _glUniformMatrix4fv(location, count, transpose, value) {
    var view;
    if (16 * count <= GL.MINI_TEMP_BUFFER_SIZE) {
        view = GL.miniTempBufferViews[16 * count - 1];
        for (var i = 0; i < 16 * count; i += 16) {
            view[i] = HEAPF32[value + 4 * i >> 2];
            view[i + 1] = HEAPF32[value + (4 * i + 4) >> 2];
            view[i + 2] = HEAPF32[value + (4 * i + 8) >> 2];
            view[i + 3] = HEAPF32[value + (4 * i + 12) >> 2];
            view[i + 4] = HEAPF32[value + (4 * i + 16) >> 2];
            view[i + 5] = HEAPF32[value + (4 * i + 20) >> 2];
            view[i + 6] = HEAPF32[value + (4 * i + 24) >> 2];
            view[i + 7] = HEAPF32[value + (4 * i + 28) >> 2];
            view[i + 8] = HEAPF32[value + (4 * i + 32) >> 2];
            view[i + 9] = HEAPF32[value + (4 * i + 36) >> 2];
            view[i + 10] = HEAPF32[value + (4 * i + 40) >> 2];
            view[i + 11] = HEAPF32[value + (4 * i + 44) >> 2];
            view[i + 12] = HEAPF32[value + (4 * i + 48) >> 2];
            view[i + 13] = HEAPF32[value + (4 * i + 52) >> 2];
            view[i + 14] = HEAPF32[value + (4 * i + 56) >> 2];
            view[i + 15] = HEAPF32[value + (4 * i + 60) >> 2]
        }
    } else {
        view = HEAPF32.subarray(value >> 2, value + count * 64 >> 2)
    }
    GLctx.uniformMatrix4fv(GL.uniforms[location], !!transpose, view)
}
function _glUseProgram(program) {
    GLctx.useProgram(program ? GL.programs[program] : null)
}
function _glVertexAttrib4f(x0, x1, x2, x3, x4) {
    GLctx["vertexAttrib4f"](x0, x1, x2, x3, x4)
}
function _glVertexAttribPointer(index, size, type, normalized, stride, ptr) {
    GLctx.vertexAttribPointer(index, size, type, !!normalized, stride, ptr)
}
function _glViewport(x0, x1, x2, x3) {
    GLctx["viewport"](x0, x1, x2, x3)
}
function _gmtime_r(time, tmPtr) {
    var date = new Date(HEAP32[time >> 2] * 1e3);
    HEAP32[tmPtr >> 2] = date.getUTCSeconds();
    HEAP32[tmPtr + 4 >> 2] = date.getUTCMinutes();
    HEAP32[tmPtr + 8 >> 2] = date.getUTCHours();
    HEAP32[tmPtr + 12 >> 2] = date.getUTCDate();
    HEAP32[tmPtr + 16 >> 2] = date.getUTCMonth();
    HEAP32[tmPtr + 20 >> 2] = date.getUTCFullYear() - 1900;
    HEAP32[tmPtr + 24 >> 2] = date.getUTCDay();
    HEAP32[tmPtr + 36 >> 2] = 0;
    HEAP32[tmPtr + 32 >> 2] = 0;
    var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
    var yday = (date.getTime() - start) / (1e3 * 60 * 60 * 24) | 0;
    HEAP32[tmPtr + 28 >> 2] = yday;
    HEAP32[tmPtr + 40 >> 2] = ___tm_timezone;
    return tmPtr
}
function _gmtime(time) {
    return _gmtime_r(time, ___tm_current)
}
var _llvm_cos_f64 = Math_cos;
var _llvm_sin_f64 = Math_sin;
function _localtime(time) {
    return _localtime_r(time, ___tm_current)
}
function _emscripten_memcpy_big(dest, src, num) {
    HEAPU8.set(HEAPU8.subarray(src, src + num), dest);
    return dest
}
function ___setErrNo(value) {
    if (Module["___errno_location"])
        HEAP32[Module["___errno_location"]() >> 2] = value;
    return value
}
function __isLeapYear(year) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
}
function __arraySum(array, index) {
    var sum = 0;
    for (var i = 0; i <= index; sum += array[i++])
        ;
    return sum
}
var __MONTH_DAYS_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var __MONTH_DAYS_REGULAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function __addDays(date, days) {
    var newDate = new Date(date.getTime());
    while (days > 0) {
        var leap = __isLeapYear(newDate.getFullYear());
        var currentMonth = newDate.getMonth();
        var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
        if (days > daysInCurrentMonth - newDate.getDate()) {
            days -= daysInCurrentMonth - newDate.getDate() + 1;
            newDate.setDate(1);
            if (currentMonth < 11) {
                newDate.setMonth(currentMonth + 1)
            } else {
                newDate.setMonth(0);
                newDate.setFullYear(newDate.getFullYear() + 1)
            }
        } else {
            newDate.setDate(newDate.getDate() + days);
            return newDate
        }
    }
    return newDate
}
function _strftime(s, maxsize, format, tm) {
    var tm_zone = HEAP32[tm + 40 >> 2];
    var date = {
        tm_sec: HEAP32[tm >> 2],
        tm_min: HEAP32[tm + 4 >> 2],
        tm_hour: HEAP32[tm + 8 >> 2],
        tm_mday: HEAP32[tm + 12 >> 2],
        tm_mon: HEAP32[tm + 16 >> 2],
        tm_year: HEAP32[tm + 20 >> 2],
        tm_wday: HEAP32[tm + 24 >> 2],
        tm_yday: HEAP32[tm + 28 >> 2],
        tm_isdst: HEAP32[tm + 32 >> 2],
        tm_gmtoff: HEAP32[tm + 36 >> 2],
        tm_zone: tm_zone ? Pointer_stringify(tm_zone) : ""
    };
    var pattern = Pointer_stringify(format);
    var EXPANSION_RULES_1 = {
        "%c": "%a %b %d %H:%M:%S %Y",
        "%D": "%m/%d/%y",
        "%F": "%Y-%m-%d",
        "%h": "%b",
        "%r": "%I:%M:%S %p",
        "%R": "%H:%M",
        "%T": "%H:%M:%S",
        "%x": "%m/%d/%y",
        "%X": "%H:%M:%S"
    };
    for (var rule in EXPANSION_RULES_1) {
        pattern = pattern.replace(new RegExp(rule,"g"), EXPANSION_RULES_1[rule])
    }
    var WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    function leadingSomething(value, digits, character) {
        var str = typeof value === "number" ? value.toString() : value || "";
        while (str.length < digits) {
            str = character[0] + str
        }
        return str
    }
    function leadingNulls(value, digits) {
        return leadingSomething(value, digits, "0")
    }
    function compareByDay(date1, date2) {
        function sgn(value) {
            return value < 0 ? -1 : value > 0 ? 1 : 0
        }
        var compare;
        if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
            if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
                compare = sgn(date1.getDate() - date2.getDate())
            }
        }
        return compare
    }
    function getFirstWeekStartDate(janFourth) {
        switch (janFourth.getDay()) {
        case 0:
            return new Date(janFourth.getFullYear() - 1,11,29);
        case 1:
            return janFourth;
        case 2:
            return new Date(janFourth.getFullYear(),0,3);
        case 3:
            return new Date(janFourth.getFullYear(),0,2);
        case 4:
            return new Date(janFourth.getFullYear(),0,1);
        case 5:
            return new Date(janFourth.getFullYear() - 1,11,31);
        case 6:
            return new Date(janFourth.getFullYear() - 1,11,30)
        }
    }
    function getWeekBasedYear(date) {
        var thisDate = __addDays(new Date(date.tm_year + 1900,0,1), date.tm_yday);
        var janFourthThisYear = new Date(thisDate.getFullYear(),0,4);
        var janFourthNextYear = new Date(thisDate.getFullYear() + 1,0,4);
        var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
        var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
        if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
            if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
                return thisDate.getFullYear() + 1
            } else {
                return thisDate.getFullYear()
            }
        } else {
            return thisDate.getFullYear() - 1
        }
    }
    var EXPANSION_RULES_2 = {
        "%a": (function(date) {
            return WEEKDAYS[date.tm_wday].substring(0, 3)
        }
        ),
        "%A": (function(date) {
            return WEEKDAYS[date.tm_wday]
        }
        ),
        "%b": (function(date) {
            return MONTHS[date.tm_mon].substring(0, 3)
        }
        ),
        "%B": (function(date) {
            return MONTHS[date.tm_mon]
        }
        ),
        "%C": (function(date) {
            var year = date.tm_year + 1900;
            return leadingNulls(year / 100 | 0, 2)
        }
        ),
        "%d": (function(date) {
            return leadingNulls(date.tm_mday, 2)
        }
        ),
        "%e": (function(date) {
            return leadingSomething(date.tm_mday, 2, " ")
        }
        ),
        "%g": (function(date) {
            return getWeekBasedYear(date).toString().substring(2)
        }
        ),
        "%G": (function(date) {
            return getWeekBasedYear(date)
        }
        ),
        "%H": (function(date) {
            return leadingNulls(date.tm_hour, 2)
        }
        ),
        "%I": (function(date) {
            var twelveHour = date.tm_hour;
            if (twelveHour == 0)
                twelveHour = 12;
            else if (twelveHour > 12)
                twelveHour -= 12;
            return leadingNulls(twelveHour, 2)
        }
        ),
        "%j": (function(date) {
            return leadingNulls(date.tm_mday + __arraySum(__isLeapYear(date.tm_year + 1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date.tm_mon - 1), 3)
        }
        ),
        "%m": (function(date) {
            return leadingNulls(date.tm_mon + 1, 2)
        }
        ),
        "%M": (function(date) {
            return leadingNulls(date.tm_min, 2)
        }
        ),
        "%n": (function() {
            return "\n"
        }
        ),
        "%p": (function(date) {
            if (date.tm_hour >= 0 && date.tm_hour < 12) {
                return "AM"
            } else {
                return "PM"
            }
        }
        ),
        "%S": (function(date) {
            return leadingNulls(date.tm_sec, 2)
        }
        ),
        "%t": (function() {
            return "\t"
        }
        ),
        "%u": (function(date) {
            var day = new Date(date.tm_year + 1900,date.tm_mon + 1,date.tm_mday,0,0,0,0);
            return day.getDay() || 7
        }
        ),
        "%U": (function(date) {
            var janFirst = new Date(date.tm_year + 1900,0,1);
            var firstSunday = janFirst.getDay() === 0 ? janFirst : __addDays(janFirst, 7 - janFirst.getDay());
            var endDate = new Date(date.tm_year + 1900,date.tm_mon,date.tm_mday);
            if (compareByDay(firstSunday, endDate) < 0) {
                var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth() - 1) - 31;
                var firstSundayUntilEndJanuary = 31 - firstSunday.getDate();
                var days = firstSundayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate();
                return leadingNulls(Math.ceil(days / 7), 2)
            }
            return compareByDay(firstSunday, janFirst) === 0 ? "01" : "00"
        }
        ),
        "%V": (function(date) {
            var janFourthThisYear = new Date(date.tm_year + 1900,0,4);
            var janFourthNextYear = new Date(date.tm_year + 1901,0,4);
            var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
            var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
            var endDate = __addDays(new Date(date.tm_year + 1900,0,1), date.tm_yday);
            if (compareByDay(endDate, firstWeekStartThisYear) < 0) {
                return "53"
            }
            if (compareByDay(firstWeekStartNextYear, endDate) <= 0) {
                return "01"
            }
            var daysDifference;
            if (firstWeekStartThisYear.getFullYear() < date.tm_year + 1900) {
                daysDifference = date.tm_yday + 32 - firstWeekStartThisYear.getDate()
            } else {
                daysDifference = date.tm_yday + 1 - firstWeekStartThisYear.getDate()
            }
            return leadingNulls(Math.ceil(daysDifference / 7), 2)
        }
        ),
        "%w": (function(date) {
            var day = new Date(date.tm_year + 1900,date.tm_mon + 1,date.tm_mday,0,0,0,0);
            return day.getDay()
        }
        ),
        "%W": (function(date) {
            var janFirst = new Date(date.tm_year,0,1);
            var firstMonday = janFirst.getDay() === 1 ? janFirst : __addDays(janFirst, janFirst.getDay() === 0 ? 1 : 7 - janFirst.getDay() + 1);
            var endDate = new Date(date.tm_year + 1900,date.tm_mon,date.tm_mday);
            if (compareByDay(firstMonday, endDate) < 0) {
                var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth() - 1) - 31;
                var firstMondayUntilEndJanuary = 31 - firstMonday.getDate();
                var days = firstMondayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate();
                return leadingNulls(Math.ceil(days / 7), 2)
            }
            return compareByDay(firstMonday, janFirst) === 0 ? "01" : "00"
        }
        ),
        "%y": (function(date) {
            return (date.tm_year + 1900).toString().substring(2)
        }
        ),
        "%Y": (function(date) {
            return date.tm_year + 1900
        }
        ),
        "%z": (function(date) {
            var off = date.tm_gmtoff;
            var ahead = off >= 0;
            off = Math.abs(off) / 60;
            off = off / 60 * 100 + off % 60;
            return (ahead ? "+" : "-") + String("0000" + off).slice(-4)
        }
        ),
        "%Z": (function(date) {
            return date.tm_zone
        }
        ),
        "%%": (function() {
            return "%"
        }
        )
    };
    for (var rule in EXPANSION_RULES_2) {
        if (pattern.indexOf(rule) >= 0) {
            pattern = pattern.replace(new RegExp(rule,"g"), EXPANSION_RULES_2[rule](date))
        }
    }
    var bytes = intArrayFromString(pattern, false);
    if (bytes.length > maxsize) {
        return 0
    }
    writeArrayToMemory(bytes, s);
    return bytes.length - 1
}
function _time(ptr) {
    var ret = Date.now() / 1e3 | 0;
    if (ptr) {
        HEAP32[ptr >> 2] = ret
    }
    return ret
}
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas, vrDevice) {
    err("Module.requestFullScreen is deprecated. Please call Module.requestFullscreen instead.");
    Module["requestFullScreen"] = Module["requestFullscreen"];
    Browser.requestFullScreen(lockPointer, resizeCanvas, vrDevice)
}
;
Module["requestFullscreen"] = function Module_requestFullscreen(lockPointer, resizeCanvas, vrDevice) {
    Browser.requestFullscreen(lockPointer, resizeCanvas, vrDevice)
}
;
Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) {
    Browser.requestAnimationFrame(func)
}
;
Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) {
    Browser.setCanvasSize(width, height, noUpdates)
}
;
Module["pauseMainLoop"] = function Module_pauseMainLoop() {
    Browser.mainLoop.pause()
}
;
Module["resumeMainLoop"] = function Module_resumeMainLoop() {
    Browser.mainLoop.resume()
}
;
Module["getUserMedia"] = function Module_getUserMedia() {
    Browser.getUserMedia()
}
;
Module["createContext"] = function Module_createContext(canvas, useWebGL, setInModule, webGLContextAttributes) {
    return Browser.createContext(canvas, useWebGL, setInModule, webGLContextAttributes)
}
;
if (ENVIRONMENT_IS_NODE) {
    _emscripten_get_now = function _emscripten_get_now_actual() {
        var t = process["hrtime"]();
        return t[0] * 1e3 + t[1] / 1e6
    }
} else if (typeof dateNow !== "undefined") {
    _emscripten_get_now = dateNow
} else if (typeof self === "object" && self["performance"] && typeof self["performance"]["now"] === "function") {
    _emscripten_get_now = (function() {
        return self["performance"]["now"]()
    }
    )
} else if (typeof performance === "object" && typeof performance["now"] === "function") {
    _emscripten_get_now = (function() {
        return performance["now"]()
    }
    )
} else {
    _emscripten_get_now = Date.now
}
var GLctx;
GL.init();
DYNAMICTOP_PTR = staticAlloc(4);
STACK_BASE = STACKTOP = alignMemory(STATICTOP);
STACK_MAX = STACK_BASE + TOTAL_STACK;
DYNAMIC_BASE = alignMemory(STACK_MAX);
HEAP32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE;
staticSealed = true;
function intArrayFromString(stringy, dontAddNull, length) {
    var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
    var u8array = new Array(len);
    var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
    if (dontAddNull)
        u8array.length = numBytesWritten;
    return u8array
}
Module["wasmTableSize"] = 2450;
Module["wasmMaxTableSize"] = 2450;
Module.asmGlobalArg = {};
Module.asmLibraryArg = {
    "abort": abort,
    "enlargeMemory": enlargeMemory,
    "getTotalMemory": getTotalMemory,
    "abortOnCannotGrowMemory": abortOnCannotGrowMemory,
    "_SDL_Delay": _SDL_Delay,
    "___buildEnvironment": ___buildEnvironment,
    "___setErrNo": ___setErrNo,
    "___syscall140": ___syscall140,
    "___syscall146": ___syscall146,
    "___syscall199": ___syscall199,
    "___syscall20": ___syscall20,
    "___syscall54": ___syscall54,
    "___syscall6": ___syscall6,
    "_alBufferData": _alBufferData,
    "_alDeleteBuffers": _alDeleteBuffers,
    "_alDeleteSources": _alDeleteSources,
    "_alDistanceModel": _alDistanceModel,
    "_alDopplerFactor": _alDopplerFactor,
    "_alGenBuffers": _alGenBuffers,
    "_alGenSources": _alGenSources,
    "_alGetError": _alGetError,
    "_alGetSourcei": _alGetSourcei,
    "_alGetString": _alGetString,
    "_alIsBuffer": _alIsBuffer,
    "_alListenerf": _alListenerf,
    "_alListenerfv": _alListenerfv,
    "_alSourcePlay": _alSourcePlay,
    "_alSourceQueueBuffers": _alSourceQueueBuffers,
    "_alSourceStop": _alSourceStop,
    "_alSourceUnqueueBuffers": _alSourceUnqueueBuffers,
    "_alSourcef": _alSourcef,
    "_alSourcefv": _alSourcefv,
    "_alSourcei": _alSourcei,
    "_alcCloseDevice": _alcCloseDevice,
    "_alcCreateContext": _alcCreateContext,
    "_alcDestroyContext": _alcDestroyContext,
    "_alcGetString": _alcGetString,
    "_alcMakeContextCurrent": _alcMakeContextCurrent,
    "_alcOpenDevice": _alcOpenDevice,
    "_clock": _clock,
    "_ctime": _ctime,
    "_emscripten_memcpy_big": _emscripten_memcpy_big,
    "_emscripten_run_script_string": _emscripten_run_script_string,
    "_emscriptenfte_abortmainloop": _emscriptenfte_abortmainloop,
    "_emscriptenfte_al_loadaudiofile": _emscriptenfte_al_loadaudiofile,
    "_emscriptenfte_alert": _emscriptenfte_alert,
    "_emscriptenfte_async_wget_data2": _emscriptenfte_async_wget_data2,
    "_emscriptenfte_buf_create": _emscriptenfte_buf_create,
    "_emscriptenfte_buf_delete": _emscriptenfte_buf_delete,
    "_emscriptenfte_buf_getsize": _emscriptenfte_buf_getsize,
    "_emscriptenfte_buf_open": _emscriptenfte_buf_open,
    "_emscriptenfte_buf_pushtolocalstore": _emscriptenfte_buf_pushtolocalstore,
    "_emscriptenfte_buf_read": _emscriptenfte_buf_read,
    "_emscriptenfte_buf_release": _emscriptenfte_buf_release,
    "_emscriptenfte_buf_rename": _emscriptenfte_buf_rename,
    "_emscriptenfte_buf_write": _emscriptenfte_buf_write,
    "_emscriptenfte_getvreyedata": _emscriptenfte_getvreyedata,
    "_emscriptenfte_getvrframedata": _emscriptenfte_getvrframedata,
    "_emscriptenfte_gl_loadtexturefile": _emscriptenfte_gl_loadtexturefile,
    "_emscriptenfte_polljoyevents": _emscriptenfte_polljoyevents,
    "_emscriptenfte_print": _emscriptenfte_print,
    "_emscriptenfte_rtc_candidate": _emscriptenfte_rtc_candidate,
    "_emscriptenfte_rtc_create": _emscriptenfte_rtc_create,
    "_emscriptenfte_rtc_offer": _emscriptenfte_rtc_offer,
    "_emscriptenfte_settitle": _emscriptenfte_settitle,
    "_emscriptenfte_setupcanvas": _emscriptenfte_setupcanvas,
    "_emscriptenfte_setupmainloop": _emscriptenfte_setupmainloop,
    "_emscriptenfte_ticks_ms": _emscriptenfte_ticks_ms,
    "_emscriptenfte_updatepointerlock": _emscriptenfte_updatepointerlock,
    "_emscriptenfte_window_location": _emscriptenfte_window_location,
    "_emscriptenfte_ws_close": _emscriptenfte_ws_close,
    "_emscriptenfte_ws_connect": _emscriptenfte_ws_connect,
    "_emscriptenfte_ws_recv": _emscriptenfte_ws_recv,
    "_emscriptenfte_ws_send": _emscriptenfte_ws_send,
    "_exit": _exit,
    "_getenv": _getenv,
    "_glActiveTexture": _glActiveTexture,
    "_glAttachShader": _glAttachShader,
    "_glBindAttribLocation": _glBindAttribLocation,
    "_glBindBuffer": _glBindBuffer,
    "_glBindFramebuffer": _glBindFramebuffer,
    "_glBindRenderbuffer": _glBindRenderbuffer,
    "_glBindTexture": _glBindTexture,
    "_glBlendFunc": _glBlendFunc,
    "_glBufferData": _glBufferData,
    "_glBufferSubData": _glBufferSubData,
    "_glCheckFramebufferStatus": _glCheckFramebufferStatus,
    "_glClear": _glClear,
    "_glClearColor": _glClearColor,
    "_glClearStencil": _glClearStencil,
    "_glColorMask": _glColorMask,
    "_glCompileShader": _glCompileShader,
    "_glCompressedTexImage2D": _glCompressedTexImage2D,
    "_glCompressedTexSubImage2D": _glCompressedTexSubImage2D,
    "_glCopyTexImage2D": _glCopyTexImage2D,
    "_glCopyTexSubImage2D": _glCopyTexSubImage2D,
    "_glCreateProgram": _glCreateProgram,
    "_glCreateShader": _glCreateShader,
    "_glCullFace": _glCullFace,
    "_glDeleteBuffers": _glDeleteBuffers,
    "_glDeleteFramebuffers": _glDeleteFramebuffers,
    "_glDeleteProgram": _glDeleteProgram,
    "_glDeleteRenderbuffers": _glDeleteRenderbuffers,
    "_glDeleteShader": _glDeleteShader,
    "_glDeleteTextures": _glDeleteTextures,
    "_glDepthFunc": _glDepthFunc,
    "_glDepthMask": _glDepthMask,
    "_glDisable": _glDisable,
    "_glDisableVertexAttribArray": _glDisableVertexAttribArray,
    "_glDrawArrays": _glDrawArrays,
    "_glDrawElements": _glDrawElements,
    "_glEnable": _glEnable,
    "_glEnableVertexAttribArray": _glEnableVertexAttribArray,
    "_glFinish": _glFinish,
    "_glFramebufferRenderbuffer": _glFramebufferRenderbuffer,
    "_glFramebufferTexture2D": _glFramebufferTexture2D,
    "_glGenBuffers": _glGenBuffers,
    "_glGenFramebuffers": _glGenFramebuffers,
    "_glGenRenderbuffers": _glGenRenderbuffers,
    "_glGenTextures": _glGenTextures,
    "_glGetAttribLocation": _glGetAttribLocation,
    "_glGetError": _glGetError,
    "_glGetIntegerv": _glGetIntegerv,
    "_glGetProgramInfoLog": _glGetProgramInfoLog,
    "_glGetProgramiv": _glGetProgramiv,
    "_glGetShaderInfoLog": _glGetShaderInfoLog,
    "_glGetShaderSource": _glGetShaderSource,
    "_glGetShaderiv": _glGetShaderiv,
    "_glGetString": _glGetString,
    "_glGetUniformLocation": _glGetUniformLocation,
    "_glLineWidth": _glLineWidth,
    "_glLinkProgram": _glLinkProgram,
    "_glPolygonOffset": _glPolygonOffset,
    "_glReadPixels": _glReadPixels,
    "_glRenderbufferStorage": _glRenderbufferStorage,
    "_glScissor": _glScissor,
    "_glShaderSource": _glShaderSource,
    "_glStencilFunc": _glStencilFunc,
    "_glStencilOpSeparate": _glStencilOpSeparate,
    "_glTexImage2D": _glTexImage2D,
    "_glTexParameterf": _glTexParameterf,
    "_glTexParameteri": _glTexParameteri,
    "_glTexSubImage2D": _glTexSubImage2D,
    "_glUniform1f": _glUniform1f,
    "_glUniform1i": _glUniform1i,
    "_glUniform2fv": _glUniform2fv,
    "_glUniform3fv": _glUniform3fv,
    "_glUniform4f": _glUniform4f,
    "_glUniform4fv": _glUniform4fv,
    "_glUniformMatrix4fv": _glUniformMatrix4fv,
    "_glUseProgram": _glUseProgram,
    "_glVertexAttrib4f": _glVertexAttrib4f,
    "_glVertexAttribPointer": _glVertexAttribPointer,
    "_glViewport": _glViewport,
    "_gmtime": _gmtime,
    "_llvm_cos_f64": _llvm_cos_f64,
    "_llvm_sin_f64": _llvm_sin_f64,
    "_localtime": _localtime,
    "_mktime": _mktime,
    "_strftime": _strftime,
    "_time": _time,
    "DYNAMICTOP_PTR": DYNAMICTOP_PTR,
    "STACKTOP": STACKTOP
};
var asm = Module["asm"](Module.asmGlobalArg, Module.asmLibraryArg, buffer);
Module["asm"] = asm;
var ___emscripten_environ_constructor = Module["___emscripten_environ_constructor"] = (function() {
    return Module["asm"]["___emscripten_environ_constructor"].apply(null, arguments)
}
);
var __get_daylight = Module["__get_daylight"] = (function() {
    return Module["asm"]["__get_daylight"].apply(null, arguments)
}
);
var __get_timezone = Module["__get_timezone"] = (function() {
    return Module["asm"]["__get_timezone"].apply(null, arguments)
}
);
var __get_tzname = Module["__get_tzname"] = (function() {
    return Module["asm"]["__get_tzname"].apply(null, arguments)
}
);
var _free = Module["_free"] = (function() {
    return Module["asm"]["_free"].apply(null, arguments)
}
);
var _main = Module["_main"] = (function() {
    return Module["asm"]["_main"].apply(null, arguments)
}
);
var _malloc = Module["_malloc"] = (function() {
    return Module["asm"]["_malloc"].apply(null, arguments)
}
);
var _memcpy = Module["_memcpy"] = (function() {
    return Module["asm"]["_memcpy"].apply(null, arguments)
}
);
var stackAlloc = Module["stackAlloc"] = (function() {
    return Module["asm"]["stackAlloc"].apply(null, arguments)
}
);
var stackRestore = Module["stackRestore"] = (function() {
    return Module["asm"]["stackRestore"].apply(null, arguments)
}
);
var stackSave = Module["stackSave"] = (function() {
    return Module["asm"]["stackSave"].apply(null, arguments)
}
);
var dynCall_ff = Module["dynCall_ff"] = (function() {
    return Module["asm"]["dynCall_ff"].apply(null, arguments)
}
);
var dynCall_fiiii = Module["dynCall_fiiii"] = (function() {
    return Module["asm"]["dynCall_fiiii"].apply(null, arguments)
}
);
var dynCall_i = Module["dynCall_i"] = (function() {
    return Module["asm"]["dynCall_i"].apply(null, arguments)
}
);
var dynCall_ii = Module["dynCall_ii"] = (function() {
    return Module["asm"]["dynCall_ii"].apply(null, arguments)
}
);
var dynCall_iii = Module["dynCall_iii"] = (function() {
    return Module["asm"]["dynCall_iii"].apply(null, arguments)
}
);
var dynCall_iiifi = Module["dynCall_iiifi"] = (function() {
    return Module["asm"]["dynCall_iiifi"].apply(null, arguments)
}
);
var dynCall_iiifii = Module["dynCall_iiifii"] = (function() {
    return Module["asm"]["dynCall_iiifii"].apply(null, arguments)
}
);
var dynCall_iiii = Module["dynCall_iiii"] = (function() {
    return Module["asm"]["dynCall_iiii"].apply(null, arguments)
}
);
var dynCall_iiiidii = Module["dynCall_iiiidii"] = (function() {
    return Module["asm"]["dynCall_iiiidii"].apply(null, arguments)
}
);
var dynCall_iiiifiii = Module["dynCall_iiiifiii"] = (function() {
    return Module["asm"]["dynCall_iiiifiii"].apply(null, arguments)
}
);
var dynCall_iiiii = Module["dynCall_iiiii"] = (function() {
    return Module["asm"]["dynCall_iiiii"].apply(null, arguments)
}
);
var dynCall_iiiiifff = Module["dynCall_iiiiifff"] = (function() {
    return Module["asm"]["dynCall_iiiiifff"].apply(null, arguments)
}
);
var dynCall_iiiiii = Module["dynCall_iiiiii"] = (function() {
    return Module["asm"]["dynCall_iiiiii"].apply(null, arguments)
}
);
var dynCall_iiiiiii = Module["dynCall_iiiiiii"] = (function() {
    return Module["asm"]["dynCall_iiiiiii"].apply(null, arguments)
}
);
var dynCall_iiiiiiii = Module["dynCall_iiiiiiii"] = (function() {
    return Module["asm"]["dynCall_iiiiiiii"].apply(null, arguments)
}
);
var dynCall_iiiiiiiiiiii = Module["dynCall_iiiiiiiiiiii"] = (function() {
    return Module["asm"]["dynCall_iiiiiiiiiiii"].apply(null, arguments)
}
);
var dynCall_v = Module["dynCall_v"] = (function() {
    return Module["asm"]["dynCall_v"].apply(null, arguments)
}
);
var dynCall_vi = Module["dynCall_vi"] = (function() {
    return Module["asm"]["dynCall_vi"].apply(null, arguments)
}
);
var dynCall_vif = Module["dynCall_vif"] = (function() {
    return Module["asm"]["dynCall_vif"].apply(null, arguments)
}
);
var dynCall_viff = Module["dynCall_viff"] = (function() {
    return Module["asm"]["dynCall_viff"].apply(null, arguments)
}
);
var dynCall_viffi = Module["dynCall_viffi"] = (function() {
    return Module["asm"]["dynCall_viffi"].apply(null, arguments)
}
);
var dynCall_vifi = Module["dynCall_vifi"] = (function() {
    return Module["asm"]["dynCall_vifi"].apply(null, arguments)
}
);
var dynCall_vifiii = Module["dynCall_vifiii"] = (function() {
    return Module["asm"]["dynCall_vifiii"].apply(null, arguments)
}
);
var dynCall_vii = Module["dynCall_vii"] = (function() {
    return Module["asm"]["dynCall_vii"].apply(null, arguments)
}
);
var dynCall_viif = Module["dynCall_viif"] = (function() {
    return Module["asm"]["dynCall_viif"].apply(null, arguments)
}
);
var dynCall_viiffff = Module["dynCall_viiffff"] = (function() {
    return Module["asm"]["dynCall_viiffff"].apply(null, arguments)
}
);
var dynCall_viifi = Module["dynCall_viifi"] = (function() {
    return Module["asm"]["dynCall_viifi"].apply(null, arguments)
}
);
var dynCall_viii = Module["dynCall_viii"] = (function() {
    return Module["asm"]["dynCall_viii"].apply(null, arguments)
}
);
var dynCall_viiifii = Module["dynCall_viiifii"] = (function() {
    return Module["asm"]["dynCall_viiifii"].apply(null, arguments)
}
);
var dynCall_viiifiii = Module["dynCall_viiifiii"] = (function() {
    return Module["asm"]["dynCall_viiifiii"].apply(null, arguments)
}
);
var dynCall_viiii = Module["dynCall_viiii"] = (function() {
    return Module["asm"]["dynCall_viiii"].apply(null, arguments)
}
);
var dynCall_viiiiff = Module["dynCall_viiiiff"] = (function() {
    return Module["asm"]["dynCall_viiiiff"].apply(null, arguments)
}
);
var dynCall_viiiii = Module["dynCall_viiiii"] = (function() {
    return Module["asm"]["dynCall_viiiii"].apply(null, arguments)
}
);
var dynCall_viiiiifffi = Module["dynCall_viiiiifffi"] = (function() {
    return Module["asm"]["dynCall_viiiiifffi"].apply(null, arguments)
}
);
var dynCall_viiiiifiif = Module["dynCall_viiiiifiif"] = (function() {
    return Module["asm"]["dynCall_viiiiifiif"].apply(null, arguments)
}
);
var dynCall_viiiiii = Module["dynCall_viiiiii"] = (function() {
    return Module["asm"]["dynCall_viiiiii"].apply(null, arguments)
}
);
var dynCall_viiiiiii = Module["dynCall_viiiiiii"] = (function() {
    return Module["asm"]["dynCall_viiiiiii"].apply(null, arguments)
}
);
Module["asm"] = asm;
function ExitStatus(status) {
    this.name = "ExitStatus";
    this.message = "Program terminated with exit(" + status + ")";
    this.status = status
}
ExitStatus.prototype = new Error;
ExitStatus.prototype.constructor = ExitStatus;
var initialStackTop;
var calledMain = false;
dependenciesFulfilled = function runCaller() {
    if (!Module["calledRun"])
        run();
    if (!Module["calledRun"])
        dependenciesFulfilled = runCaller
}
;
Module["callMain"] = function callMain(args) {
    args = args || [];
    ensureInitRuntime();
    var argc = args.length + 1;
    var argv = stackAlloc((argc + 1) * 4);
    HEAP32[argv >> 2] = allocateUTF8OnStack(Module["thisProgram"]);
    for (var i = 1; i < argc; i++) {
        HEAP32[(argv >> 2) + i] = allocateUTF8OnStack(args[i - 1])
    }
    HEAP32[(argv >> 2) + argc] = 0;
    try {
        var ret = Module["_main"](argc, argv, 0);
        exit(ret, true)
    } catch (e) {
        if (e instanceof ExitStatus) {
            return
        } else if (e == "SimulateInfiniteLoop") {
            Module["noExitRuntime"] = true;
            return
        } else {
            var toLog = e;
            if (e && typeof e === "object" && e.stack) {
                toLog = [e, e.stack]
            }
            err("exception thrown: " + toLog);
            Module["quit"](1, e)
        }
    } finally {
        calledMain = true
    }
}
;
function run(args) {
    args = args || Module["arguments"];
    if (runDependencies > 0) {
        return
    }
    preRun();
    if (runDependencies > 0)
        return;
    if (Module["calledRun"])
        return;
    function doRun() {
        if (Module["calledRun"])
            return;
        Module["calledRun"] = true;
        if (ABORT)
            return;
        ensureInitRuntime();
        preMain();
        if (Module["onRuntimeInitialized"])
            Module["onRuntimeInitialized"]();
        if (Module["_main"] && shouldRunNow)
            Module["callMain"](args);
        postRun()
    }
    if (Module["setStatus"]) {
        Module["setStatus"]("Running...");
        setTimeout((function() {
            setTimeout((function() {
                Module["setStatus"]("")
            }
            ), 1);
            doRun()
        }
        ), 1)
    } else {
        doRun()
    }
}
Module["run"] = run;
function exit(status, implicit) {
    if (implicit && Module["noExitRuntime"] && status === 0) {
        return
    }
    if (Module["noExitRuntime"]) {} else {
        ABORT = true;
        EXITSTATUS = status;
        STACKTOP = initialStackTop;
        exitRuntime();
        if (Module["onExit"])
            Module["onExit"](status)
    }
    Module["quit"](status, new ExitStatus(status))
}
function abort(what) {
    if (Module["onAbort"]) {
        Module["onAbort"](what)
    }
    if (what !== undefined) {
        out(what);
        err(what);
        what = JSON.stringify(what)
    } else {
        what = ""
    }
    ABORT = true;
    EXITSTATUS = 1;
    throw "abort(" + what + "). Build with -s ASSERTIONS=1 for more info."
}
Module["abort"] = abort;
if (Module["preInit"]) {
    if (typeof Module["preInit"] == "function")
        Module["preInit"] = [Module["preInit"]];
    while (Module["preInit"].length > 0) {
        Module["preInit"].pop()()
    }
}
var shouldRunNow = true;
if (Module["noInitialRun"]) {
    shouldRunNow = false
}
Module["noExitRuntime"] = true;
run()
