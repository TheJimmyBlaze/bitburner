import { start } from './lib/deploy';

export const main = async ns => {

    ns.disableLog('ALL');
    ns.tail();

    const script = ns.args[0]
    if (!script) {
        ns.tprint('no script provided as args[0]');
        return;
    }

    ns.print('maxing out home server...');

    const host = 'home';
    const instances = await start(ns, script, host);
    ns.print(`${instances} scripts started`);
};