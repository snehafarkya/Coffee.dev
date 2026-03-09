export interface Submission {
  id: string; // idempotency key (deterministic hash of email + amount)
  email: string;
  amount: number;
  status: "pending" | "success" | "error";
  createdAt: Date;
  completedAt?: Date;
  error?: string;
  retryCount: number;
}

export class SubmissionManager {
  private submissions: Map<string, Submission> = new Map();
  private submissionHistory: Submission[] = [];

  generateIdempotencyKey(email: string, amount: number): string {
    const input = `${email}:${amount}`;
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    // Convert to UUID-like format for consistency
    const hashStr = Math.abs(hash).toString(16).padStart(8, "0");
    return `${hashStr}-idempotent-${Math.abs(hash % 9999).toString().padStart(4, "0")}`;
  }

  isDuplicate(email: string, amount: number): Submission | null {
    const idempotencyKey = this.generateIdempotencyKey(email, amount);
    const existing = this.submissions.get(idempotencyKey);
    return existing || null;
  }

  createSubmission(email: string, amount: number): Submission | null {
    // Check for duplicate
    const existingSubmission = this.isDuplicate(email, amount);
    if (existingSubmission) {
      console.log(`[v0] Duplicate submission detected for ${email}:${amount}`);
      return null;
    }

    const id = this.generateIdempotencyKey(email, amount);
    const submission: Submission = {
      id,
      email,
      amount,
      status: "pending",
      createdAt: new Date(),
      retryCount: 0,
    };

    this.submissions.set(id, submission);
    this.submissionHistory.push(submission);

    console.log("[v0] Created new submission:", id);
    return submission;
  }

  updateSubmission(
    id: string,
    status: "pending" | "success" | "error",
    error?: string
  ): Submission | null {
    const submission = this.submissions.get(id);
    if (!submission) return null;

    submission.status = status;
    submission.completedAt = new Date();
    if (error) submission.error = error;

    console.log(`[v0] Updated submission ${id} to ${status}`);
    return submission;
  }

  incrementRetry(id: string): void {
    const submission = this.submissions.get(id);
    if (submission) {
      submission.retryCount++;
      console.log(`[v0] Retry attempt ${submission.retryCount} for submission ${id}`);
    }
  }

  getHistory(): Submission[] {
    return this.submissionHistory;
  }

  getSubmission(id: string): Submission | null {
    return this.submissions.get(id) || null;
  }

  clear(): void {
    this.submissions.clear();
    this.submissionHistory = [];
  }
}

export const submissionManager = new SubmissionManager();
