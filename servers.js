import { deploy } from './lib/deploy';

export const main = async ns => {

    ns.disableLog('ALL');
    ns.tail();

    const script = ns.args[0];
    if (!script) {
        ns.tprint('no script provided as arg[0]');
        return;
    }

    while (true) {

        if (await buy(ns, script)) continue;

        await upgrade(ns, script);
        await ns.sleep(0);
    }
};

const buy = async (ns, script) => {

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

    await deploy({
        ns,
        script,
        host
    });

    return true;
};

const upgrade = async (ns, script) => {

    const servers = ns.getPurchasedServers();
    const costs = servers.map(server => project(ns, server));

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

    await deploy({
        ns,
        script,
        host
    });
}

const project = (ns, host) => {

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