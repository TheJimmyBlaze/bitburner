
import { crawl } from './lib/crawler';

export const main = async ns => {

    const portNumber = 1;

    ns.disableLog('ALL');
    ns.atExit(() => dispose(
        ns,
        portNumber
    ));

    while (true) {

        const ticket = getTicket(
            ns,
            portNumber
        );

        const action = checkTicket(
            ns,
            ticket,
            portNumber
        );

        while(action) {
            await action();
        }

        await ns.sleep(60000);
    }
};

const weaken = async (ns, host) => await ns.weaken(host);

const fund = async (ns, host) => await ns.grow(host);

const hack = async (ns, host) => {

    const funds = ns.getServerMoneyAvailable(host);
    const maxFunds = ns.getServerMaxMoney(host);

    if (funds < maxFunds * 0.99) return ns.sleep(0);

    const hackPercent = 0.2;
    const hackFunds = maxFunds * hackPercent;

    const threadsToReachMin = Math.floor(ns.hackAnalyzeThreads(host, hackFunds));
    if (threadsToReachMin === -1) return ns.sleep(0);

    const {
        threads: runningThreads
    } = ns.getRunningScript(ns.pid);
    const hackThreads = Math.min(threadsToReachMin, runningThreads);

    ns.print(`Hacking \$${ns.formatNumber(funds - hackFunds)} from ${host}`);
    await ns.hack(host, { threads: hackThreads});
};

const getTicket = (
    ns, 
    portNumber
) => {

    const ticket = ns.peek(portNumber);
    if (ticket && ticket !== 'NULL PORT DATA') {

        appendTicket(ns, ticket);
        return ticket;
    }
        
    return buildTicket(ns);
};

const checkTicket = (
    ns,
    ticket,
    portNumber
) => {

    const {
        read,
        write
    } = ns.getPortHandle(portNumber);

    const action = markTicket(
        ns,
        ticket,
        weaken,
        fund,
        hack
    );

    read();
    write(ticket);
    
    return action;
};

const buildTicket = ns => {
    
    const targets = ticketCrawl(ns);
    if (!targets?.length) return null;

    const ticket = {};
    targets.forEach(target => ticket[target] = actionStub());

    return ticket;
};

const appendTicket = (
    ns,
    ticket
 ) => {

    const targets = ticketCrawl(ns);
    
    const missing = targets.filter(target => !Object.keys(ticket).includes(target));
    missing.forEach(target => ticket[target] = actionStub());
};

const markTicket = (
    ns,
    ticket,
    weaken,
    fund,
    hack
) => {

    let action = null;
    
    Object.entries(ticket).some(([target, actors]) => {

        if (!actors.weaken) {

            ns.print(`Weakening ${target}...`);
            action = async () => await weaken(ns, target);
            actors.weaken = ns.pid;
            return true;
        }

        if (!actors.fund) {

            ns.print(`Funding ${target}...`);
            action = async () => await fund(ns, target);
            actors.fund = ns.pid;
            return true;
        }

        if (!actors.hack) {

            ns.print(`Hacking ${target}...`);
            action = async () => await hack(ns, target);
            actors.hack = ns.pid;
            return true;
        }

        return false;
    });
    
    return action;
};

const clearTicket = (
    ns,
    ticket
) => {

    Object.values(ticket).some(actors => {

        if (actors.weaken === ns.pid) {
            actors.weaken = null;
            return true;
        }

        if (actors.fund === ns.pid) {
            actors.fund = null;
            return true;
        }

        if (actors.hack === ns.pid) {
            actors.hack = null;
            return true;
        }

        return false;
    });
}

const ticketCrawl = ns => {

    const crawlOptions = {
        privateServers: false,
        unhackable: false,
        noFunds: false
    };

    const targets = crawl({
        ns, 
        options: crawlOptions
    });
    return targets;
}

const actionStub = () => ({
    weaken: null,
    fund: null,
    hack: null
});

const dispose = (
    ns, 
    portNumber
) => {

    const {
        clear,
        read,
        write
    } = ns.getPortHandle(portNumber);

    const ticket = getTicket(
        ns,
        portNumber
    );
    clearTicket(
        ns,
        ticket
    );

    read();
    write(ticket);

    const remainingActors = Object.values(ticket).filter(
        ({
            weaken,
            fund,
            hack
        }) => weaken || fund || hack
    );

    if (remainingActors) return;

    clear();
};