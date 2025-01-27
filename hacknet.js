
export const main = async ns => {

  ns.disableLog('ALL');
  ns.tail();
  ns.resizeTail(640, 500);

  ns.print('Building Hacknet...');

  while (true) {
    await upgrade(ns);
    await ns.sleep(0);
  }
};

const upgrade = async ns => {

  let best = null;
  
  const numNodes = ns.hacknet.numNodes()
  if (numNodes < ns.hacknet.maxNumNodes()) {
    best = {
      index: numNodes,
      upgradeName: 'NEW',
      cost: ns.hacknet.getPurchaseNodeCost(),
      upgrade: async () => await ns.hacknet.purchaseNode()
    };
  }

  for (let i = 0; i < numNodes; i ++) {

    const next = nodeCost(ns, i);
    if (!best || next.cost < best.cost) {
      best = next;
    }
  }
  ns.print(`Upgrading: hacknet-node-${best.index} to ${best.upgradeName} for \$${ns.formatNumber(best.cost)}...`);
  
  let money = ns.getServerMoneyAvailable('home');
  while (money < best.cost) {
    
    await ns.sleep(1000);
    money = ns.getServerMoneyAvailable('home');
  }
  await best.upgrade();
};

const nodeCost = (ns, i) => {

  const {
    level,
    ram,
    cores
  } = ns.hacknet.getNodeStats(i);

  const specs = [
    {
      index: i,
      upgradeName: `level ${level + 1}`,
      cost: ns.hacknet.getLevelUpgradeCost(i, 1),
      upgrade: async () => await ns.hacknet.upgradeLevel(i, 1)
    },
    {
      index: i,
      upgradeName: `ram ${ram + 1}`,
      cost: ns.hacknet.getRamUpgradeCost(i, 1),
      upgrade: async () => await ns.hacknet.upgradeRam(i, 1)
    },
    {
      index: i,
      upgradeName: `core ${cores + 1}`,
      cost: ns.hacknet.getCoreUpgradeCost(i, 1),
      upgrade: async () => await ns.hacknet.upgradeCore(i, 1)
    }
  ];

  return specs.sort((a, b) => a.cost - b.cost)[0];
};