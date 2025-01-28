import { crawl } from './lib/crawler';
import { analyze } from './lib/analyzer';

export const main = async ns => {

    ns.disableLog('ALL');
    ns.tail();

    while(true) {

        update(ns);
        await ns.sleep(100);
    }
};

const update = ns => {

    const crawlOptions = {
        privateServers: false,
        unhackable: false,
        noFunds: false,
        // maxLevelDifficulty: 1,
        // maxSecurityDifficulty: 1,
        // maxFundDifficulty: 1,
        // maxHackDifficulty: 1
    };

    const targets = crawl({
        ns,
        options: crawlOptions
    });

    ns.resizeTail(1024, 24 * (targets.length + 1) + 32);
    ns.print(`  ${''.padEnd(24)}  ${'Security'.padEnd(18)}  ${'Funding'.padEnd(18)}  ${'Level'.padEnd(7)}  ${'Sec'.padEnd(7)}  ${'Fund'.padEnd(7)}  ${'Hack'.padEnd(7)}`);
    targets.forEach(target => draw(ns, target));
};

const draw = (
    ns,
    host
) => {
    
    const {
        securityBar,
        fundBar,
        levelDifficulty,
        securityDifficulty,
        fundDifficulty,
        hackDifficulty
    } = analyze({
        ns,
        host
    }).format();

    ns.print(`  ${host.padEnd(24)}  ${securityBar}  ${fundBar}  ${levelDifficulty}  ${securityDifficulty}  ${fundDifficulty}  ${hackDifficulty}`);
};