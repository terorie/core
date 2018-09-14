module.exports = {};
const atob = require('atob');
const btoa = require('btoa');
const JDB = require('@nimiq/jungle-db');
const fs = require('fs');
const dns = require('dns');
const https = require('https');
const http = require('http');
const cpuid = require('cpuid-git');
const chalk = require('chalk');

// Allow the user to specify the WebSocket engine through an environment variable. Default to ws
const WebSocket = require(process.env.NIMIQ_WS_ENGINE || 'ws');

global.Class = {
    scope: module.exports,
    register: clazz => {
        module.exports[clazz.prototype.constructor.name] = clazz;
    }
};

// Use CPUID to get the available processor extensions
// and choose the right version of the nimiq_node native module
const NodeNative = function() {
    try {
        const c = cpuid();
        const f = c.features;

        const optimized = [ 'avx512f', 'avx2', 'sse2' ]

        for (let ext in optimized) {
            if (f[ext]) {
                try {
                    return require('bindings')('nimiq_node_' + ext + '.node');
                } catch (e) {
                    continue;
                }
            }
        }
        throw Error("no optimized version");
    } catch (e) {
        return require('bindings')('nimiq_node_compat.node');
    }
}();
