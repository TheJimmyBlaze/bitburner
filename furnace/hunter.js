
export const main = ns => {

    const result = hunt({ ns });
    ns.tprint(result.map(svr => `${svr.hostname} - sec: ${ns.formatNumber(svr.hackDifficulty)} fund: \$${ns.formatNumber(svr.moneyAvailable)}`));
};

export const hunt = ({
    ns,
    host = 'home',
    backTrack,
    hunterSecPercThreshold = 0.5
}) => {
    
    let subSvrs = ns.scan(host);

    if (host == null) {
        const privSvrs = ns.getPurchasedServers();
        subSvrs = subSvrs.filter(svr => !privSvrs.includes(svr));
    }

    subSvrs = subSvrs.filter(svr => (
        svr !== backTrack &&
        hasFunds({
            ns,
            host: svr
        }) &&
        willHack({
            ns,
            host: svr,
            hunterSecPercThreshold
        }) && 
        canHack({
            ns,
            host: svr
        })
    )).map(svr => ns.getServer(svr));

    subSvrs.forEach(({hostname}) => {
        
        subSvrs.push(...hunt({
            ns,
            host: hostname,
            backTrack: host,
            hunterSecPercThreshold
        }));
    });

    return subSvrs;
};

const hasFunds = ({
    ns,
    host
}) => ns.getServerMaxMoney(host) > 0;

const willHack = ({
    ns,
    host,
    hunterSecPercThreshold
}) => {

    const hunterSec = ns.getHackingLevel();
    const sec = ns.getServerMinSecurityLevel(host);
    const hunterSecPerc = sec / hunterSec;

    return hunterSecPerc <= hunterSecPercThreshold;
};

const canHack = ({
    ns,
    host
}) => {

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
    sshPortOpen &&ftpPortOpen && smtpPortOpen && httpPortOpen && sqlPortOpen && ns.nuke(host);
  
    return ns.hasRootAccess(host);
};