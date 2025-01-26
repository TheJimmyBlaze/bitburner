
export const main = ns => {

  const script = ns.args[0]
  if (!script) {
    ns.tprint('no script provided as args[0]');
    return;
  }

  const host = ns.args[1];
  if (!host) {
    ns.tprint('no host provided as args[1]');
    return;
  }

  const scriptRam = ns.getScriptRam(script, host);
  const ram = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);

  const instances = Math.floor(ram / scriptRam);
  if (!instances) return;

  for (let i = 0; i < instances; i++) {
    ns.exec(script, host);
  }
  ns.tprint(`started: ${instances} scripts`);
};