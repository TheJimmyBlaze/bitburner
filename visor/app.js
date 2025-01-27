import { crawl } from '../lib/crawler';
import { analyze } from '../lib/analyzer';

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
        maxLevelDifficulty: 0.25,
        maxSecurityDifficulty: 0.25,
        maxFundDifficulty: 0.25,
        maxHackDifficulty: 0.25
    };

    const targets = crawl({
        ns,
        options: crawlOptions
    });

    ns.resizeTail(960, 28 * (targets.length + 1));
    ns.print(`  ${''.padEnd(24)}  ${'Security'.padEnd(18)}  ${'Funding'.padEnd(18)}  ${'Level'.padEnd(6)}  ${'Sec'.padEnd(6)}  ${'Fund'.padEnd(6)}  ${'Hack'.padEnd(6)}`);
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