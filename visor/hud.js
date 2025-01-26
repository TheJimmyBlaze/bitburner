import { hunt } from '../furnace/hunter';

export const update = async ({
    ns,
    interval = 100
}) => {

    const targets = hunt({
        ns
    });

    targets.forEach(svr => report({
        ns,
        svr
    }));

    await ns.sleep(interval);
};

const report = ({
    ns, 
    svr,
    percWidth
}) => {

    const {
        hostname,
        hackDifficulty: sec,
        minDifficulty: minSec,
        moneyAvailable: fund,
        moneyMax: maxFund
    } = svr;

    const secPerc = minSec / sec;
    const secProg = drawProgress({
        perc: secPerc, 
        percWidth
    });

    const fundPerc = fund / maxFund;
    const fundProg = drawProgress({
        perc: fundPerc,
        percWidth
    });

    ns.print(` ${`${hostname}:`.padEnd(24)}  Sec ${secProg}  Fund ${fundProg}`);
};

const drawProgress = ({
    perc,
    open = '[',
    close = ']',
    mark = '|',
    noMark = ' ',
    drawWidth = 32
}) => {

    const green = "\u001b[32m";
    const reset = "\u001b[0m";

    const highlight = perc > 0.99 ? green : reset;

    let body = '';
    for(let i = 0; i < drawWidth; i++) {

        if (i < perc * drawWidth) {
            body += mark;
            continue;
        }

        body += noMark;
    };

    return `${open}${highlight}${body}${reset}${close}`;
};