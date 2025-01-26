
const root = 'home';

export const main = async ns => {

  ns.disableLog('ALL');

  if (!ns.args[0]) {
    ns.tprint('no script provided as arg[0]');
    return;
  }

  ns.tprint('infecting...');

  const deployments = await infect(ns, root, null);
  ns.tprint(`${deployments} scripts started`);
};

const infect = async (ns, host, superHost) => {

  let rooted = ns.hasRootAccess(host);
  if (!rooted) rooted = crack(ns, host);
  if (!rooted) {
    ns.tprint(`${host} inaccessible`);
    return 0;
  }

  ns.print(`deploying on ${host}...`);
  let deployments = await deploy(ns, host);
  
  const net = ns.scan(host);
  const subNet = net.filter(netHost => netHost !== superHost);

  for (let i = 0; i < subNet.length; i++) {
    
    const netHost = subNet[i];
    deployments += await infect(ns, netHost, host);
  }
  
  return deployments;
};

const crack = (ns, host) => {

    ns.fileExists('BruteSSH.exe') && ns.brutessh(host);
    ns.fileExists('FTPCrack.exe') && ns.ftpcrack(host);
    ns.fileExists('relaySMTP.exe') && ns.relaysmtp(host);
    ns.fileExists('HTTPWorm.exe') && ns.httpworm(host);
    ns.fileExists('SQLInject.exe') && ns.sqlinject(host);

    const {
        sshPortOpen,
        ftpPortOpen,
        smtpPortOpen,
        httpPortOpen,
        sqlPortOpen
    } = ns.getServer(host);
    const open = sshPortOpen + ftpPortOpen + smtpPortOpen + httpPortOpen + sqlPortOpen;

    open >= ns.getServerNumPortsRequired(host) && ns.nuke(host);
    return ns.hasRootAccess(host);
};

const threadBatches = 1;
const deploy = async (ns, host) => {

  if (host === 'home') return 0;

  const script = ns.args[0];

  const parts = script.split('/');
  const copy = parts[1] ? ns.ls('home', parts[0]) : parts[0];

  ns.scp(copy, host);
  ns.killall(host);
  
  const scriptRam = ns.getScriptRam(script, host);
  const ram = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);

  const maxThreads = Math.floor(ram / scriptRam);
  if (!maxThreads) return 0;

  let remainingThreads = maxThreads;
  while (remainingThreads) {

    const threads = Math.min(remainingThreads, threadBatches);
    remainingThreads -= threads;

    ns.exec(script, host, threads);
    await ns.sleep(0);
  }

  return maxThreads;
};
