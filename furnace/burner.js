
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

    if (await ignite({
        ns,
        targets,
        hackPerc
    })) return;

    if (await burnSec({
        ns,
        targets,
        secPercThreshold
    })) return;

    if (await kindleFund({
        ns,
        targets,
        fundPercThreshold
    })) return;

    await ns.sleep(backOff);
};

const burnSec = async ({
    ns,
    targets,
    secPercThreshold
}) => {

    const {
        hostname,
        hackDifficulty: sec,
        minDifficulty: minSec
    } = targets.sort((a, b) => (
        a.minDifficulty / a.hackDifficulty -
        b.minDifficulty / b.hackDifficulty
    ))[0];

    const secPerc = minSec / sec;
    if (secPerc > secPercThreshold) return;

    const time = ns.getWeakenTime(hostname);
    ns.print(`Weakening ${hostname}: ${ns.formatPercent(secPerc)}, ${ns.formatNumber(sec)} / ${minSec} (${ns.tFormat(time)})...`);
    await ns.weaken(hostname);
    return true;
};

const kindleFund = async ({
    ns,
    targets,
    fundPercThreshold
}) => {

    const {
        hostname,
        moneyAvailable: fund,
        moneyMax: maxFund
    } = targets.sort((a, b) => (
        a.moneyAvailable / a.moneyMax -
        b.moneyAvailable / b.moneyMax
    ))[0];

    const fundPerc = fund / maxFund;
    if (fundPerc > fundPercThreshold) return;

    const time = ns.getGrowTime(hostname);
    ns.print(`Funding ${hostname}: ${ns.formatPercent(fundPerc)}, ${ns.formatNumber(fund)} / ${maxFund} (${ns.tFormat(time)})...`);
    await ns.grow(hostname);
    return true;
};

const ignite = async ({
    ns,
    targets,
    hackPerc
}) => {

    const {
        hostname,
        moneyAvailable: fund,
        moneyMax: maxFund
    } = targets.sort((a, b) => (
        b.moneyAvailable / b.moneyMax -
        a.moneyAvailable / a.moneyMax
    ))[0];

    const fundPerc = fund / maxFund;
    if (fundPerc < hackPerc) return;

    const time = ns.getHackTime(hostname);
    ns.print(`Hacking ${hostname}: ${ns.formatPercent(fundPerc)}, ${ns.formatNumber(fund)} / ${maxFund} (${ns.tFormat(time)})...`);
    await ns.hack(hostname);
    return true;
}