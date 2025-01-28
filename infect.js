import { crawl } from './lib/crawler';
import { deploy } from './lib/deploy';

export const main = async ns => {

    ns.disableLog('ALL');
    ns.tail();

    const script = ns.args[0];
    if (!script) {
        ns.tprint('no script provided as arg[0]');
        return;
    }

    ns.print('infecting...');

    const crawlOptions = {
        unhackable: false,
    }
    const targets = crawl({
        ns,
        options: crawlOptions
    });

    let instances = 0;
    for (let i = 0; i < targets.length; i++) {

        const host = targets[i];
        instances += await infect(ns, host, script);
    }

    ns.print('');

    ns.print(`${targets.length} servers infected`);
    ns.print(`${instances} scripts started`);
};

const infect = async (ns, host, script) => {

    ns.print(`deploying on ${host}...`);

    return await deploy({
        ns,
        script,
        host,
        threads: 100,
        killAll: true,
    });
};