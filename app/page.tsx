"use client";

import { useState, FormEvent, useEffect } from "react";
import { submissionManager, Submission } from "@/lib/submissionManager";
import { mockApiCall } from "@/lib/mockApi";

export default function Home() {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [currentSubmissionId, setCurrentSubmissionId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setSubmissions(submissionManager.getHistory());
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setLoading(true);

    try {
      const submission = submissionManager.createSubmission(email, parsedAmount);

      if (!submission) {
        setError("This contribution already exists.");
        setLoading(false);
        return;
      }

      const submissionId = submission.id;
      setCurrentSubmissionId(submissionId);

      setSubmissions([...submissionManager.getHistory()]);

      let attempts = 0;
      const maxRetries = 3;
      let success = false;

      while (attempts < maxRetries && !success) {
        const response = await mockApiCall(email, parsedAmount, submissionId);

        if (response.status === 200) {
          submissionManager.updateSubmission(submissionId, "success");
          success = true;

          setEmail("");
          setAmount("");
          setSubmissions([...submissionManager.getHistory()]);
          setCurrentSubmissionId(null);
        }

        else if (response.status === 503) {
          attempts++;
          submissionManager.incrementRetry(submissionId);

          if (attempts < maxRetries) {
            const backoff = Math.pow(2, attempts - 1) * 1000;
            await new Promise((resolve) => setTimeout(resolve, backoff));
          } else {
            submissionManager.updateSubmission(
              submissionId,
              "error",
              "Service unavailable after retries"
            );

            setError("Submission failed after retries.");
            setSubmissions([...submissionManager.getHistory()]);
            setCurrentSubmissionId(null);
          }
        }
      }

    } catch (err) {
      console.error(err);
      setError("Unexpected error occurred.");
    }

    setLoading(false);
  };

  const current = currentSubmissionId
    ? submissionManager.getSubmission(currentSubmissionId)
    : null;

  return (
    <main className="relative min-h-screen bg-[#0b0b0c] text-white overflow-hidden">

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-black to-black"></div>

      {/* Dot pattern */}
      <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_1px_1px,#ffffff_1px,transparent_0)] bg-[size:28px_28px]" />

      {/* Glow */}
      <div className="absolute top-[-200px] left-[-100px] w-[500px] h-[500px] bg-purple-600/30 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] bg-pink-500/20 blur-[120px] rounded-full"></div>

      <div className="relative z-10 px-6">

        {/* NAV */}
        <nav className="max-w-6xl mx-auto flex justify-between items-center py-8">
          <div className="text-lg font-semibold tracking-tight">
            Coffee.dev
          </div>
        </nav>

        {/* HERO */}
        <section className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center pt-12 pb-24">

          <div>
            <h1 className="text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight">
              Support my work
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                with a coffee
              </span>
            </h1>

            <p className="mt-6 text-lg text-white/60 max-w-lg">
              I build open-source projects and developer tools.  
              If my work helped you, consider supporting with a coffee.
            </p>
          </div>

          {/* FORM CARD */}
          <div className="relative">

            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-xl rounded-3xl"></div>

            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl">

              <h3 className="text-xl font-semibold mb-1">
                Buy me a coffee ☕
              </h3>

              <p className="text-sm text-white/60 mb-6">
                Support open-source development
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">

                <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-purple-400 outline-none text-sm"
                />

                <input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-purple-400 outline-none text-sm"
                />

                {error && (
                  <p className="text-red-400 text-sm">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 transition font-medium"
                >
                  {loading ? "Processing..." : "Support with Coffee"}
                </button>

              </form>

              {/* STATUS */}
              {current && (
                <div className="mt-4 text-sm">

                  {current.status === "pending" && (
                    <p className="text-blue-400">
                      ⏳ Processing contribution...
                    </p>
                  )}

                  {current.status === "success" && (
                    <p className="text-green-400">
                      ✓ Contribution successful
                    </p>
                  )}

                  {current.status === "error" && (
                    <p className="text-red-400">
                      ✕ Contribution failed
                    </p>
                  )}

                  {current.retryCount > 0 && (
                    <p className="text-xs text-white/50">
                      Retry attempts: {current.retryCount}
                    </p>
                  )}

                </div>
              )}

            </div>
          </div>

        </section>

        {/* SUPPORTERS */}
        {submissions.length > 0 && (
          <section className="max-w-5xl mx-auto pb-28">

            <h2 className="text-2xl font-semibold text-center mb-12">
              Recent supporters
            </h2>

            <div className="grid md:grid-cols-3 gap-6">

              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur"
                >
                  <p className="font-medium">{submission.email}</p>
                  <p className="text-sm text-white/50">
                    ${submission.amount}
                  </p>

                  <p className="text-xs mt-1">
                    {submission.status === "success" && "✓ success"}
                    {submission.status === "pending" && "⏳ pending"}
                    {submission.status === "error" && "✕ failed"}
                  </p>

                </div>
              ))}

            </div>

          </section>
        )}

      </div>
    </main>
  );
}