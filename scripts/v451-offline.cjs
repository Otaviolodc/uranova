/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS preload requires built-ins synchronously. */
// Preparation only. No staging or other external network is enabled here.
const net = require('node:net');
const dns = require('node:dns');
const tls = require('node:tls');
function local(host) { return ['localhost','127.0.0.1','::1'].includes(host); }
const denied = () => { throw new Error('P02A_EXTERNAL_NETWORK_BLOCKED'); };
const connect = net.Socket.prototype.connect;
net.Socket.prototype.connect = function (...args) {
  const a = Array.isArray(args[0]) ? args[0] : args;
  const o = a[0];
  if (typeof o === 'object') { if (!o.port || !local(o.host || 'localhost')) denied(); }
  else if (typeof o !== 'number' || (typeof a[1] === 'string' && !local(a[1]))) denied();
  return connect.apply(this, args);
};
tls.connect = denied;
const lookup = dns.lookup;
dns.lookup = function (host, ...args) { if (!local(host)) denied(); return lookup.call(this,host,...args); };
dns.promises.lookup = async function(host, ...args) { if (!local(host)) denied(); return new Promise((res,rej)=>lookup(host,...args,(e,address,family)=>e?rej(e):res({address,family}))); };
const originalFetch = globalThis.fetch;
globalThis.fetch = function(input, init) {
  const u = new URL(typeof input==='string'||input instanceof URL ? input : input.url);
  if (u.protocol!=='http:' || !local(u.hostname) || u.username || u.password) denied();
  return originalFetch(input,{...init,redirect:'error'});
};
