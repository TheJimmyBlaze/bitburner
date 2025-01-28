import { start } from './lib/deploy';

export const main = async ns => {

    ns.disableLog('ALL');
    ns.tail();

    const script = ns.args[0]
    if (!script) {
        ns.tprint('no script provided as args[0]');
        return;
    }

    const threads = Math.max(1, ns.args[1]);

    ns.print('maxing out home server...');

    const host = 'home';
    const instances = await start(ns, script, host, threads);
    ns.print(`${instances} scripts started`);
};