/**
 * Obtém o retrato com até três tentativas para falhas transitórias.
 * Apenas erros de rede/timeout, HTTP 429 e HTTP 5xx são repetidos;
 * erros HTTP permanentes falham imediatamente.
 *
 * A dependência de fetch e a espera podem ser substituídas nos testes.
 */
export async function fetchPortraitWithRetry(
  url,
  {
    fetchImpl = fetch,
    waitImpl = (milliseconds) => new Promise((done) => setTimeout(done, milliseconds)),
    attempts = 3,
    timeoutMs = 20_000
  } = {}
) {
  if (!Number.isInteger(attempts) || attempts < 1) {
    throw new RangeError("attempts deve ser um inteiro positivo");
  }

  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    let response;
    try {
      response = await fetchImpl(url, { signal: AbortSignal.timeout(timeoutMs) });
    } catch (error) {
      lastError = error;
    }

    if (response) {
      if (response.ok) return response;
      lastError = new Error(`HTTP ${response.status}`);
      const retryable = response.status === 429 || (response.status >= 500 && response.status <= 599);
      if (!retryable) {
        throw new Error(`Não foi possível incorporar o retrato: ${lastError.message}`, { cause: lastError });
      }
    }

    if (attempt < attempts) await waitImpl(attempt * 1000);
  }

  throw new Error(
    `Não foi possível incorporar o retrato após ${attempts} tentativas: ${lastError?.message ?? "falha desconhecida"}`,
    { cause: lastError }
  );
}
