
import { crawl } from '../lib/crawler';

export const main = async ns => {
    await burn({ ns });
};

export const burn = async ({
    ns,
    maxSecurityPercent = 0.99,
    maxFundPercent = 0.99,
    minHackPercent = 0.99,
    crawlOptions,
    backOff = 500
}) => {

    const targets = crawl({ns, options: crawlOptions});
    const target = targets[Math.floor(Math.random() * targets.length)];

    const server = ns.getServer(target);

    if (await ignite(
        ns,
        server,
        minHackPercent
    )) return;

    if (await burnSec(
        ns,
        server,
        maxSecurityPercent
    )) return;

    if (await kindleFund(
        ns,
        server,
        maxFundPercent
    )) return;

    await ns.sleep(backOff);
};

const ignite = async (
    ns,
    server,
    minPercent
) => {

    const {
        hostname,
        moneyAvailable: fund,
        moneyMax: maxFund
    } = server;

    const fundPerc = fund / maxFund;
    if (fundPerc < minPercent) return;

    const time = ns.getHackTime(hostname);
    ns.print(`Hacking ${hostname}: ${ns.formatPercent(fundPerc)}, ${ns.formatNumber(fund)} / ${ns.formatNumber(maxFund)} (${ns.tFormat(time)})...`);
    await ns.hack(hostname);
    return true;
};

const kindleFund = async (
    ns,
    server,
    maxPercent
) => {

    const {
        hostname,
        moneyAvailable: fund,
        moneyMax: maxFund
    } = server

    const fundPerc = fund / maxFund;
    if (fundPerc > maxPercent) return;

    const time = ns.getGrowTime(hostname);
    ns.print(`Funding ${hostname}: ${ns.formatPercent(fundPerc)}, ${ns.formatNumber(fund)} / ${ns.formatNumber(maxFund)} (${ns.tFormat(time)})...`);
    await ns.grow(hostname);
    return true;
};

const burnSec = async (
    ns,
    server,
    maxPercent
) => {

    const {
        hostname,
        hackDifficulty: sec,
        minDifficulty: minSec
    } = server;

    const secPerc = minSec / sec;
    if (secPerc > maxPercent) return;

    const time = ns.getWeakenTime(hostname);
    ns.print(`Weakening ${hostname}: ${ns.formatPercent(secPerc)}, ${ns.formatNumber(sec)} / ${ns.formatNumber(minSec)} (${ns.tFormat(time)})...`);
    await ns.weaken(hostname);
    return true;
};