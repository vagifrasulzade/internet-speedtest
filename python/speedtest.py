#!/usr/bin/env python3
"""Download speed test: N sequential requests to a single URL."""


import argparse
import sys
import time
import urllib.request
from urllib.error import HTTPError,URLError


CHUNK_SIZE = 64 * 1024  # read the response in 64 KB chunks

def download(url: str, timeout: float )-> tuple[int, float]:
    """Download the URL fully. Returns (bytes, seconds)."""
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "speedtest-script/1.0", "Cache-Control": "no-cache"},

    )
    start = time.perf_counter()
    size = 0
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        while chunk := resp.read(CHUNK_SIZE):
            size += len(chunk)
            
    elapsed = time.perf_counter() - start
    return size, elapsed


def main() -> int:
    parser = argparse.ArgumentParser(description="Download speed test")
    parser.add_argument("url", help="URL to request")
    parser.add_argument("-n", "--count", type=int, default=10, help="number of requests (default 10)")
    parser.add_argument("-t", "--timeout", type=float, default=30, help="timeout per request, seconds") 
    args = parser.parse_args()
    
    if args.count < 1:
        parser.error("--count must be >= 1")
        
    total_bytes = 0
    total_time = 0.0
    
    for i in range(1, args.count + 1):
        try:
            size, elapsed = download(args.url, args.timeout)
        except (HTTPError, URLError, TimeoutError, OSError) as e:
            print(f"Request {i} error: {e}", file=sys.stderr)
            return 1
        total_bytes += size
        total_time += elapsed
        print(f"Request {i:>2}: {size / 1_000_000:8.2f} MB in {elapsed * 1000:8.1f} ms", flush=True)
    
    avg_ms = total_time / args.count * 1000
    mbit_s  = total_bytes * 8 / total_time / 1_000_000 if total_time > 0 else 0.0
    
    print("_" * 44)
    print(f"Average request time: {avg_ms:.1f} ms")
    print(f"Total downloaded:     {total_bytes / 1_000_000:.2f} MB ({total_bytes} bytes)")
    print(f"Download speed:       {mbit_s:.2f} Mbit/s ({mbit_s / 8:.2f} MB/s)")
    return 0

    
        
        
if __name__ == "__main__":
    sys.exit(main())