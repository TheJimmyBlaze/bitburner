
import { burn } from './burner';

export const main = async ns => {

    ns.disableLog('ALL');

    const skipDelay = ns.args[0] === 'now';

    if (!skipDelay) {
        const delay = Math.random() * 60000;
        ns.print(`Delaying: ${ns.tFormat(delay)} before start...`);
        await ns.sleep(delay);
    }

    const crawlOptions = {
        privateServers: false,
        unhackable: false,
        noFunds: false,
        maxLevelDifficulty: 0.25,
        maxSecurityDifficulty: 0.25,
        maxFundDifficulty: 0.25,
        maxHackDifficulty: 0.25
    };

    ns.print('Burning...');
    while(true) {
        await burn({
            ns,
            crawlOptions
        });
    }
};