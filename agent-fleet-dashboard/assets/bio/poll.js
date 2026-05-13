// Lightweight API poller for /api/services and /api/cells. Degrades gracefully
// to static JSON when the backend is not available.

const DEFAULT_INTERVAL = 7000;

export class ApiPoller {
  constructor({ endpoint, onUpdate, onError, interval = DEFAULT_INTERVAL }) {
    this.endpoint = endpoint;
    this.onUpdate = onUpdate;
    this.onError = onError || (() => {});
    this.interval = interval;
    this.timer = null;
    this.active = false;
    this.lastOk = null;
  }

  async pollOnce() {
    try {
      const res = await fetch(this.endpoint, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.lastOk = Date.now();
      this.onUpdate?.(data);
      return data;
    } catch (err) {
      this.onError?.(err);
      return null;
    }
  }

  start() {
    if (this.active) return;
    this.active = true;
    this.pollOnce();
    this.timer = setInterval(() => this.pollOnce(), this.interval);
  }

  stop() {
    this.active = false;
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}

export async function probeApiHealth(url = "/api/health") {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return false;
    const data = await res.json();
    return !!data?.ok;
  } catch (_) {
    return false;
  }
}
