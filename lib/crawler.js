
import { analyze } from './analyzer';

export const crawl = (
    ns,
    host = 'home',
    ignore = [],
    options = {}
) => {

    const {
        privateServers = true,
        unhackable = true,
        maxLevelDifficulty = 100,
        maxSecurityDifficulty = 100,
        maxFundDifficulty = 100,
        maxHackDifficulty = 100
    } = options;
    
    ignore[host] = true;
    const children = ns.scan(host);

    const privSvrs = !privateServers && ns.getPurchasedServers();
    let results = children.filter(child => {

        //If this server is ignored: exclude
        if (ignore[child]) return false;

        //If only public servers and this server is a private server: exclude
        if (!privateServers && privSvrs.includes(child)) return false;

        //If only hackable and this server is not hackable: exclude
        if (!unhackable && !canHack(ns, child)) return false;

        //If any difficulty is greater than the max: exclude
        const {
            levelDifficulty,
            securityDifficulty,
            fundDifficulty,
            hackDifficulty
        } = analyze(ns, child);
        if (levelDifficulty > maxLevelDifficulty) return false;
        if (securityDifficulty > maxSecurityDifficulty) return false;
        if (fundDifficulty > maxFundDifficulty) return false;
        if (hackDifficulty > maxHackDifficulty) return false;

        return true;
    });

    results.forEach(child => {
        results = [
            ...results,
            ...crawl(
                ns,
                child,
                ignore,
                options
            )
        ];
    });
    return results;
};

const canHack = (
    ns,
    host
) => {

    ns.fileExists('BruteSSH.exe') && ns.brutessh(host);
    ns.fileExists('FTPCrack.exe') && ns.ftpcrack(host);
    ns.fileExists('relaySMTP.exe') && ns.relaysmtp(host);
    ns.fileExists('HTTPWorm.exe') && ns.httpworm(host);
    ns.fileExists('SQLInject.exe') && ns.sqlinject(host);

    const {
        sshPortOpen,
        ftpPortOpen,
        smtpPortOpen,
        httpPortOpen,
        sqlPortOpen
    } = ns.getServer(host);
    const open = sshPortOpen + ftpPortOpen + smtpPortOpen + httpPortOpen + sqlPortOpen;

    open >= ns.getServerNumPortsRequired(host) && ns.nuke(host);
    return ns.hasRootAccess(host);
};