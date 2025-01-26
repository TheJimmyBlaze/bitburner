
export const main = async ns => {

  while (true) {

    await ns.sleep(0);
    ns.print('upgrading...');
    await upgrade(ns);
  }
};

const upgrade = async ns => {

  let best = null;
  
  if (ns.hacknet.numNodes() < ns.hacknet.maxNumNodes()) {
    best = {
      name: 'new',
      cost: ns.hacknet.getPurchaseNodeCost(),
      upgrade: async () => await ns.hacknet.purchaseNode()
    };
  }

  for (let i = 0; i < ns.hacknet.numNodes(); i ++) {

    const next = nodeCost(ns, i);
    if (!best || next.cost < best.cost) {
      best = next;
    }
  }
  ns.print(`best upgrade: ${best.name}, for cost: ${best.cost}`);
  
  let money = ns.getServerMoneyAvailable('home');
  while (money < best.cost) {
    ns.print(`upgrade requires: \$${best.cost - money}`);
    
    await ns.sleep(1000);
    money = ns.getServerMoneyAvailable('home');
  }

  ns.print(`purchasing upgrade...`);
  await best.upgrade();
};

const nodeCost = (ns, i) => {

  const specs = [
    {
      name: `${i}-level`,
      cost: ns.hacknet.getLevelUpgradeCost(i, 1),
      upgrade: async () => await ns.hacknet.upgradeLevel(i, 1)
    },
    {
      name: `${i}-ram`,
      cost: ns.hacknet.getRamUpgradeCost(i, 1),
      upgrade: async () => await ns.hacknet.upgradeRam(i, 1)
    },
    {
      name: `${i}-core`,
      cost: ns.hacknet.getCoreUpgradeCost(i, 1),
      upgrade: async () => await ns.hacknet.upgradeCore(i, 1)
    }
  ];

  return specs.sort((a, b) => a.cost - b.cost)[0];
};