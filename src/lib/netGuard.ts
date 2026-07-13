import dns from "node:dns/promises";
import net from "node:net";

// ---------------------------------------------------------------------------
// Guards against server-side request forgery (SSRF) when a route fetches a
// URL supplied by the user (e.g. "extract my brand from this website").
// Only plain http/https URLs whose DNS resolves to public IP addresses are
// allowed — internal/cloud-metadata/loopback addresses are rejected before
// any request is made.
// ---------------------------------------------------------------------------

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return true;
  const [a, b] = parts;
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 127) return true; // loopback
  if (a === 0) return true; // "this" network
  if (a === 169 && b === 254) return true; // link-local / cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 100 && b >= 64 && b <= 127) return true; // carrier-grade NAT
  if (a >= 224) return true; // multicast/reserved
  return false;
}

function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === "::1") return true; // loopback
  if (lower.startsWith("fe80:")) return true; // link-local
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // unique local
  if (lower.startsWith("::ffff:")) return isPrivateIPv4(lower.slice(7)); // IPv4-mapped
  return false;
}

function isPrivateIp(ip: string): boolean {
  const family = net.isIP(ip);
  if (family === 4) return isPrivateIPv4(ip);
  if (family === 6) return isPrivateIPv6(ip);
  return true; // not a recognizable IP — treat as unsafe
}

export class UnsafeUrlError extends Error {}

// Parses and validates a user-supplied URL: http(s) only, and every DNS
// answer for the hostname must be a public address. Throws UnsafeUrlError
// (safe to show its message to the caller) on any violation.
export async function assertPublicHttpUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new UnsafeUrlError("That doesn't look like a valid URL.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new UnsafeUrlError("Only http:// and https:// URLs are supported.");
  }
  const hostname = url.hostname.toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    throw new UnsafeUrlError("That address isn't reachable from here.");
  }

  let records: { address: string }[];
  try {
    records = await dns.lookup(hostname, { all: true });
  } catch {
    throw new UnsafeUrlError("Could not resolve that domain.");
  }
  if (records.length === 0 || records.some((r) => isPrivateIp(r.address))) {
    throw new UnsafeUrlError("That address isn't reachable from here.");
  }
  return url;
}
