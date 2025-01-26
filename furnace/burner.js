
import { hunt } from './hunter';

export const main = async ns => {
    await burn({ ns });
};

export const burn = async ({
    ns,
    hunterSecPercThreshold = 0.5,
    secPercThreshold = 0.99,
    fundPercThreshold = 0.99,
    hackPerc = 0.99,
    backOff = 500
}) => {

    const targets = hunt({
        ns,
        hunterSecPercThreshold
    });
    const target = targets[Math.floor(Math.random() * targets.length)];

    if (await ignite({
        ns,
        target,
        hackPerc
    })) return;

    if (await burnSec({
        ns,
        target,
        secPercThreshold
    })) return;

    if (await kindleFund({
        ns,
        target,
        fundPercThreshold
    })) return;

    await ns.sleep(backOff);
};

const ignite = async ({
    ns,
    target,
    hackPerc
}) => {

    const {
        hostname,
        moneyAvailable: fund,
        moneyMax: maxFund
    } = target;

    const fundPerc = fund / maxFund;
    if (fundPerc < hackPerc) return;

    const time = ns.getHackTime(hostname);
    ns.print(`Hacking ${hostname}: ${ns.formatPercent(fundPerc)}, ${ns.formatNumber(fund)} / ${maxFund} (${ns.tFormat(time)})...`);
    await ns.hack(hostname);
    return true;
};

const kindleFund = async ({
    ns,
    target,
    fundPercThreshold
}) => {

    const {
        hostname,
        moneyAvailable: fund,
        moneyMax: maxFund
    } = target

    const fundPerc = fund / maxFund;
    if (fundPerc > fundPercThreshold) return;

    const time = ns.getGrowTime(hostname);
    ns.print(`Funding ${hostname}: ${ns.formatPercent(fundPerc)}, ${ns.formatNumber(fund)} / ${maxFund} (${ns.tFormat(time)})...`);
    await ns.grow(hostname);
    return true;
};

const burnSec = async ({
    ns,
    target,
    secPercThreshold
}) => {

    const {
        hostname,
        hackDifficulty: sec,
        minDifficulty: minSec
    } = target;

    const secPerc = minSec / sec;
    if (secPerc > secPercThreshold) return;

    const time = ns.getWeakenTime(hostname);
    ns.print(`Weakening ${hostname}: ${ns.formatPercent(secPerc)}, ${ns.formatNumber(sec)} / ${minSec} (${ns.tFormat(time)})...`);
    await ns.weaken(hostname);
    return true;
};