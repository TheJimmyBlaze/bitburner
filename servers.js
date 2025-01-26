
export const main = async ns => {

  ns.disableLog('ALL');

  while (true) {

    if (await buy(ns)) return;

    await upgrade(ns);
    await ns.sleep(0);
  }
};

const buy = async ns => {

  if (ns.getPurchasedServers().length === ns.getPurchasedServerLimit()) return;

  const baseRam = 4;
  const cost = ns.getPurchasedServerCost(baseRam);

  ns.print(`Purchasing server for \$${ns.formatNumber(cost)}...`);
  let money = ns.getServerMoneyAvailable('home');
  while (money < cost) {

    await ns.sleep(1000);
    money = ns.getServerMoneyAvailable('home');
  }

  const host = `embrnet-${ns.getPurchasedServers().length}`;
  ns.print(`Purchasing: ${host}`);
  ns.purchaseServer(host, baseRam);
  deploy(ns, host);
  
  return true;
};

const upgrade = async ns => {

  const servers = ns.getPurchasedServers();
  const costs = servers.map(server => analyze(ns, server));

  const {
    host,
    cost,
    ram
  } = costs.sort((a, b) => a.cost - b.cost)[0];
  
  ns.print(`Upgrading: ${host} to ${ram}gb for \$${ns.formatNumber(cost)}...`);
  let money = ns.getServerMoneyAvailable('home');
  while (money < cost) {

    await ns.sleep(1000);
    money = ns.getServerMoneyAvailable('home');
  }

  ns.upgradePurchasedServer(host, ram);
  deploy(ns, host);
}

const analyze = (ns, host) => {

  const {
    maxRam: ram
  } = ns.getServer(host);

  const nextRam = ram * 2;
  const cost = ns.getPurchasedServerUpgradeCost(host, nextRam);

  return {
    host,
    cost,
    ram: nextRam
  };
};

const deploy = (ns, host) => {
  
  const script = ns.args[0];
  const target = ns.args[1];
  if (script && target) {

    const scriptRam = ns.getScriptRam(script, host);
    const availableRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);

    const threads = Math.floor(availableRam / scriptRam);

    ns.scp(script, target);
    ns.exec(script, host, threads, target)
  }
};