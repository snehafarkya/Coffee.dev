# Coffee.dev ☕

A minimal platform where developers can support creators with a coffee.

Coffee.dev demonstrates how modern applications handle **reliable form submissions** using:

- idempotency
- automatic retries
- exponential backoff
- clear UI state management

The project simulates real-world distributed system challenges such as **temporary service failures and delayed responses**, while guaranteeing that **duplicate contributions never occur**.

---

# What Coffee.dev Does

Coffee.dev allows users to support creators by submitting:

- **Email**
- **Contribution amount**

When a contribution is submitted:

1. The UI immediately shows a **pending state**
2. A request is sent to a **mock API**
3. The API randomly returns one of the following responses:

| Response | Behavior |
|--------|---------|
| **200 Success** | Contribution processed immediately |
| **503 Temporary Failure** | Automatic retry triggered |
| **Delayed Success** | Response after 5 -10 seconds |

The system automatically retries failed requests and ensures that **no duplicate contributions are created**.

---

# Key Features

### Idempotent Submissions
Each submission generates a **deterministic idempotency key** derived from:
email + amount

This guarantees that the same submission **cannot create multiple records**.

---
### Automatic Retry Logic
Temporary API failures trigger automatic retries using **exponential backoff**.

---

### Duplicate Prevention
Duplicate submissions are prevented using **idempotency keys** and submission tracking.

---

### Clear UI States
The UI always reflects the current system state:

- Pending
- Retrying
- Success
- Failed

---

### Submission History
All contributions are tracked and displayed with their status and retry metadata.

---

# Retry Logic

Temporary failures (`503`) trigger automatic retries using **exponential backoff**.

### Retry Strategy

| Attempt | Delay |
|------|------|
| Retry 1 | 1 second |
| Retry 2 | 2 seconds |
| Retry 3 | 4 seconds |

If all retries fail, the submission transitions to an **error state**.

Exponential backoff prevents overwhelming the server while it is recovering.

This pattern is commonly used in:

- Stripe APIs
- AWS SDK
- Google Cloud APIs

---

# How Duplicate Contributions Are Prevented

Coffee.dev uses **idempotency keys** to ensure duplicate records cannot occur.

### Idempotency Key Generation

Each submission generates a deterministic key:
idempotencyKey = hash(email + amount)

Example:
email: dev@example.com

amount: 5

Generated key:
a93c12bf-idempotent-1203

---

# Mock API Behavior

The mock API simulates realistic backend behavior.

| Response Type | Probability | Description |
|---------------|-------------|-------------|
| Success (200) | 40% | Immediate response |
| Temporary Failure (503) | 30% | Triggers retry logic |
| Delayed Success | 30% | Response delayed by 5–10 seconds |

This helps simulate real-world conditions such as:

- temporary outages
- network latency
- slow external services

---

# How It Works

1. User enters **email and contribution amount**
2. User clicks **Support with Coffee**
3. System generates an **idempotency key**
4. UI immediately show **pending state**
5. Request is sent to the mock API
6. If API returns `503`, retries are triggered automatically
7. Submission history updates with final result

---
