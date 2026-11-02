import assert from "node:assert/strict";
import test from "node:test";
import { fetchPortraitWithRetry } from "../scripts/fetch-portrait.mjs";

const url = "https://example.invalid/portrait.webp";
const ok = { ok: true, status: 200 };

test("retorna imediatamente quando o retrato está disponível", async () => {
  let requests = 0;
  const response = await fetchPortraitWithRetry(url, {
    fetchImpl: (_url, { signal }) => {
      requests += 1;
      assert.ok(signal instanceof AbortSignal);
      return ok;
    },
    waitImpl: () => { throw new Error("não deve esperar"); }
  });
  assert.equal(response, ok);
  assert.equal(requests, 1);
});

test("tenta novamente para HTTP 429 ou 5xx com espera limitada", async () => {
  const statuses = [429, 503, 200];
  const delays = [];
  const response = await fetchPortraitWithRetry(url, {
    fetchImpl: async () => {
      const status = statuses.shift();
      return { ok: status === 200, status };
    },
    waitImpl: async (ms) => delays.push(ms)
  });
  assert.equal(response.status, 200);
  assert.deepEqual(statuses, []);
  assert.deepEqual(delays, [1000, 2000]);
});

test("repete falhas de rede ou timeout sem extrapolar as tentativas", async () => {
  let attempts = 0;
  const result = await fetchPortraitWithRetry(url, {
    fetchImpl: async () => {
      attempts += 1;
      if (attempts === 1) throw new Error("TimeoutError");
      return ok;
    },
    waitImpl: async () => {}
  });
  assert.equal(result, ok);
  assert.equal(attempts, 2);
});

test("erro HTTP permanente falha imediatamente e preserva o status", async () => {
  for (const status of [400, 403, 404]) {
    let attempts = 0;
    await assert.rejects(
      () => fetchPortraitWithRetry(url, {
        fetchImpl: async () => {
          attempts += 1;
          return { ok: false, status };
        },
        waitImpl: () => { throw new Error("não deve esperar"); }
      }),
      new RegExp(`retrato: HTTP ${status}`)
    );
    assert.equal(attempts, 1);
  }
});

test("encerra após três falhas transitórias e preserva a última causa", async () => {
  let requests = 0;
  const delays = [];
  await assert.rejects(
    () => fetchPortraitWithRetry(url, {
      fetchImpl: async () => {
        requests += 1;
        return { ok: false, status: 503 };
      },
      waitImpl: async (ms) => delays.push(ms)
    }),
    /após 3 tentativas: HTTP 503/
  );
  assert.equal(requests, 3);
  assert.deepEqual(delays, [1000, 2000]);
});
