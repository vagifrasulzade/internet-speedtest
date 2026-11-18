# Speedtest — download speed measurement

A console script that makes 10 sequential requests to a given URL, fully downloads
each response, and prints the average request time, total downloaded size, and
download speed. There are two implementations with identical behavior: Python and
Node.js. No external dependencies.

## How to run

### Python (3.9+)
```bash
python3 python/speedtest.py <URL>
python3 python/speedtest.py <URL> -n 20 -t 60   # 20 requests, 60 s timeout
```

On Windows, use `python` instead of `python3` if `python3` is not found.

### Node.js (18.3+)
```bash
node node/speedtest.js <URL>
node node/speedtest.js <URL> -n 20 -t 60
```

### Example
```bash
python3 python/speedtest.py "https://speed.cloudflare.com/__down?bytes=10000000"
node node/speedtest.js "https://speed.cloudflare.com/__down?bytes=10000000"
```

Options:
- `-n, --count` — number of requests (default 10)
- `-t, --timeout` — timeout per request in seconds (default 30)

If the URL contains `?` or `&`, wrap it in quotes.

## Example output
```
Request  1:     5.00 MB in    412.3 ms
...
--------------------------------------------
Average request time: 398.7 ms
Total downloaded:     50.00 MB (50000000 bytes)
Download speed:       100.33 Mbit/s (12.54 MB/s)
```

## Units
- **Speed: Mbit/s** (megabits per second, 1 Mbit = 1,000,000 bits), the same unit
  ISPs and Speedtest use. The same speed in MB/s (1 MB = 1,000,000 bytes) is shown
  in parentheses.
- **Time: milliseconds.**
- **Size: megabytes (decimal) plus the exact number of bytes.**

## How it is calculated
- Time of one request: from sending the request until the last byte of the body
  is received (includes DNS, TCP/TLS handshake, server wait, and the download).
- Average time = sum of request times / number of requests.
- Speed = total bytes × 8 / total time of all requests.
- The body is read as a stream, so the whole file is never held in memory.
- A `Cache-Control: no-cache` header is sent to reduce the chance of a cached response.
- On an HTTP error (4xx/5xx), timeout, or network error, the script prints a
  message and exits with code 1.