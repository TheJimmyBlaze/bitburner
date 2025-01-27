
import { drawProgress } from './drawing';
import * as colour from './colour';

export const analyze = ({
    ns,
    host,
    optimalTime = undefined
}) => {

    const security = analyzeSecurity(ns, host);
    const funds = analyzeFunds(ns, host);

    const difficulty = analyzeDifficulty({
        ns,
        host,
        minSecurity: security.minSecurity,
        optimalTime
    });

    const result = {
        ...security,
        ...funds,
        ...difficulty,
    };

    return {
        ...result,
        format: () => format(ns, result)
    };
};

const analyzeSecurity = (
    ns,
    host
) => {

    const security = ns.getServerSecurityLevel(host);
    const minSecurity = ns.getServerMinSecurityLevel(host);
    const securityPercent = minSecurity / security;

    return {
        security,
        minSecurity,
        securityPercent
    };
};

const analyzeFunds = (
    ns,
    host
) => {

    const funds = ns.getServerMoneyAvailable(host);
    const maxFunds = ns.getServerMaxMoney(host);
    
    //If a server max fund is 0, fundPercent is always 1.0
    const fundPercent = !maxFunds ? 1 : funds / maxFunds;

    return {
        funds,
        maxFunds,
        fundPercent
    };
};

const analyzeDifficulty = ({
    ns,
    host,
    minSecurity,
    optimalTime = 300000 //5 minutes
}) => {

    const hackLevel = ns.getHackingLevel();
    const levelDifficulty = minSecurity / hackLevel;

    const securityTime = ns.getWeakenTime(host);
    const securityDifficulty = securityTime / optimalTime;

    const fundTime = ns.getGrowTime(host);
    const fundDifficulty = fundTime / optimalTime;

    const hackTime = ns.getHackTime(host);
    const hackDifficulty = hackTime / optimalTime;

    return {
        levelDifficulty,
        securityDifficulty,
        fundDifficulty,
        hackDifficulty
    }
};

const format = (ns, {
    security,
    minSecurity,
    securityPercent,
    funds,
    maxFunds,
    fundPercent,
    levelDifficulty,
    securityDifficulty,
    fundDifficulty,
    hackDifficulty
}) => ({
        security: ns.formatNumber(security),
        minSecurity: ns.formatNumber(minSecurity),
        securityPercent: `${bar(securityPercent)}${ns.formatPercent(securityPercent).padStart(6, '0')}${colour.reset}`,
        securityBar: `${bar(securityPercent)}${drawProgress(securityPercent)}${colour.reset}`,

        funds: `\$${ns.formatNumber(funds)}`,
        maxFunds: `\$${ns.formatNumber(maxFunds)}`,
        fundPercent: `${bar(fundPercent)}${ns.formatPercent(fundPercent).padStart(6, '0')}${colour.reset}`,
        fundBar: `${bar(fundPercent)}${drawProgress(fundPercent)}${colour.reset}`,

        levelDifficulty: `${difficulty(levelDifficulty)}${ns.formatPercent(levelDifficulty).padStart(6, '0')}${colour.reset}`,
        securityDifficulty: `${difficulty(securityDifficulty)}${ns.formatPercent(securityDifficulty).padStart(6, '0')}${colour.reset}`,
        fundDifficulty: `${difficulty(fundDifficulty)}${ns.formatPercent(fundDifficulty).padStart(6, '0')}${colour.reset}`,
        hackDifficulty: `${difficulty(hackDifficulty)}${ns.formatPercent(hackDifficulty).padStart(6, '0')}${colour.reset}`
});

const bar = percent => {

    if (percent > 0.99) return colour.cyan;
    if (percent > 0.75) return colour.blue;
    if (percent > 0.5) return colour.purple;
    if (percent > 0.25) return colour.red;

    return colour.red;
};

const difficulty = percent => {

    if (percent < 0.25) return colour.cyan;
    if (percent < 0.75) return colour.blue;
    if (percent < 1) return colour.purple;
    if (percent < 2) return colour.red;

    return colour.red;
};