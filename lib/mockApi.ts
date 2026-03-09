interface ApiResponse {
  status: number;
  data?: {
    email: string;
    amount: number;
    timestamp: string;
  };
  error?: string;
}

// Store for idempotency - ensures same request always gets same response
const responseCache: Record<string, { response: ApiResponse; timestamp: number }> = {};

export async function mockApiCall(
  email: string,
  amount: number,
  idempotencyKey: string
): Promise<ApiResponse> {
  // Check if we've seen this idempotency key before
  if (responseCache[idempotencyKey]) {
    console.log("[v0] Returning cached response for idempotency key:", idempotencyKey);
    return responseCache[idempotencyKey].response;
  }

  const random = Math.random();
  let response: ApiResponse;

  if (random < 0.4) {
    console.log("[v0] API: Returning 200 success");
    response = {
      status: 200,
      data: {
        email,
        amount,
        timestamp: new Date().toISOString(),
      },
    };
  } else if (random < 0.7) {
    console.log("[v0] API: Returning 503 temporary failure");
    response = {
      status: 503,
      error: "Service temporarily unavailable. Please retry.",
    };
  } else {
    const delay = Math.random() * 5000 + 5000; // 5-10 seconds
    console.log(`[v0] API: Returning delayed 200 success after ${delay}ms`);
    await new Promise((resolve) => setTimeout(resolve, delay));
    response = {
      status: 200,
      data: {
        email,
        amount,
        timestamp: new Date().toISOString(),
      },
    };
  }

  // Cache the response for this idempotency key
if (response.status === 200) {
  responseCache[idempotencyKey] = {
    response,
    timestamp: Date.now(),
  };
}

  return response;
}
