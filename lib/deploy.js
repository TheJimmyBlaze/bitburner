
export const deploy = async ({
    ns,
    script,
    host,
    killAll = false,
    includeLib = true
}) => {

    const scriptPathParts = script.split('/');
    let copyFiles = scriptPathParts[1] ? ns.ls('home', scriptPathParts[0]) : scriptPathParts[0];

    if (includeLib) {
        copyFiles = [
            ...copyFiles,
            ...ns.ls('home', 'lib')
        ];
    }

    ns.scp(copyFiles, host);
    if (killAll) ns.killall(host);

    return await start(ns, script, host);
};

export const start = async (
    ns,
    script,
    host
) => {

    const scriptRam = ns.getScriptRam(script, host);
    if (!scriptRam) return 0;

    const ram = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);

    const maxThreads = Math.floor(ram / scriptRam);
    if (!maxThreads) return 0;

    let remainingThreads = maxThreads;
    while (remainingThreads) {

        remainingThreads--;

        ns.exec(script, host);
        await ns.sleep(0);
    };

    return maxThreads;
};