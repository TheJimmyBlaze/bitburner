
import { burn } from './burner';

export const main = async ns => {

    ns.disableLog('ALL');

    const delay = Math.random() * 60000;
    ns.print(`Delaying: ${ns.tFormat(delay)} before start...`);
    await ns.sleep(delay);

    ns.print('Burning...');
    while(true) {
        await burn({
            ns
        });
    }
};