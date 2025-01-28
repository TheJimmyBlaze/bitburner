
export const main = ns => {

    const servers = ns.getPurchasedServers();
    servers.forEach(server => ns.killall(server));
};