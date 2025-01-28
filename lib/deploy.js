
export const deploy = async ({
    ns,
    script,
    host,
    threads = 1,
    killAll = false,
    includeLib = true
}) => {

    const scriptPathParts = script.split('/');
    let copyFiles = scriptPathParts[1] ? ns.ls('home', scriptPathParts[0]) : scriptPathParts;

    if (includeLib) {
        copyFiles = [
            ...copyFiles,
            ...ns.ls('home', 'lib')
        ];
    }

    ns.scp(copyFiles, host);
    if (killAll) ns.killall(host);

    return await start(
        ns,
        script,
        host,
        threads
    );
};

export const start = async (
    ns,
    script,
    host,
    threads = 1
) => {

    const scriptRam = ns.getScriptRam(script, host) * threads;
    if (!scriptRam) return 0;

    const ram = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);

    const maxThreads = Math.floor(ram / scriptRam);
    if (!maxThreads) return 0;

    let remainingThreads = maxThreads;
    while (remainingThreads) {

        remainingThreads --;

        ns.exec(script, host, threads);
        await ns.sleep(0);
    };

    return maxThreads;
};