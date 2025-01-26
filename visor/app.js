import { update } from './hud';

export const main = async ns => {

    ns.disableLog('ALL');

    ns.tail();
    ns.resizeTail(1024, 512);

    while(true) {
        await update({ ns });
    }
};