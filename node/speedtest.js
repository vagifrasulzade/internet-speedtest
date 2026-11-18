#!/usr/bin/env node
// Download speed test: N sequential requests to a single URL.
// Requires Node.js 18.3+ (built-in fetch and parseArgs), no external dependencies.

const { parseArgs } = require('node:util');

async function download(url, timeoutMs){
    const start = performance.now();
    const res = await fetch(url,{
        headers: { "User-Agent": "speedtest-script/1.0", "Cache-Control": "no-cache" },
        signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

    // Read the body as a stream and count bytes without keeping the whole file in memory
    let size = 0;
    for await (const chunk of res.body) size += chunk.length;

    const elapsedMs = performance.now() - start;
    return { size, elapsedMs };
}

async function main() {
    const {values , positionals} = parseArgs({
        allowPositionals: true,
        options: {
            count: { type: "string", short: "n", default: "10" },
            timeout: { type: "string", short: "t", default: "30" },
        },
    });

    const url = positionals[0];
    const count = Number(values.count);
    const timeoutMs = Number(values.timeout) * 1000;

    if(!url){
        console.error("Usage: node speedtest.js <url> [-n 10] [-t 30]");
        process.exit(2);
    }

    if(!Number.isInteger(count) || count <= 1){
        console.error("--count must be an integer >= 1");
        process.exit(2);
    }

    let totalBytes = 0;
    let totalMs = 0;

    for (let i = 1; i <= count; i++){
        try{
            const {size , elapsedMs} = await download(url, timeoutMs);
            totalBytes += size;
            totalMs += elapsedMs;
            console.log(
                `Request ${String(i).padStart(2)}: ${(size / 1e6).toFixed(2).padStart(8)} MB in ${elapsedMs.toFixed(1).padStart(8)} ms`

            );
        } catch (e){
            console.error(`Request ${i}: error - ${e.message}`);
            process.exit(1);
        }
    }

    const avgMs = totalMs / count;
    const mbitS = totalMs > 0 ? (totalBytes * 8) / (totalMs / 1000) / 1e6 : 0;

    console.log("-".repeat(44));
    console.log(`Average request time: ${avgMs.toFixed(1)} ms`);
    console.log(`Total downloaded:     ${(totalBytes / 1e6).toFixed(2)} MB (${totalBytes} bytes)`);
    console.log(`Download speed:       ${mbitS.toFixed(2)} Mbit/s (${(mbitS / 8).toFixed(2)} MB/s)`);
}

main();