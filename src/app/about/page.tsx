import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { supportedTools } from "@/lib/tools";

export const metadata = {
  title: "About | ToolBridge",
  description: "What ToolBridge is, why it was built, and which EDA tools it supports."
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Navbar />
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-soft dark:border-gray-800 dark:bg-gray-950/60 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600 dark:text-indigo-400">
            About ToolBridge
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            Built for students who need specific help, not generic AI answers
          </h1>

          <div className="mt-8 space-y-8 text-base leading-8 text-gray-700 dark:text-gray-200">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">What ToolBridge is</h2>
              <p className="mt-3">
                ToolBridge is a structured workflow assistant for EE and ECE students using specialized EDA tools.
                Instead of open-ended chat, it gives step-by-step guidance that looks like a senior TA walking you through an assignment.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Why it was built</h2>
              <p className="mt-3">
                It started from a familiar lab problem: an EE student at IIT Delhi stuck on ICCAP assignments with no help available,
                no clear debugging path, and too much time lost waiting for replies from classmates or TAs.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Supported tools</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {supportedTools.map((tool) => (
                  <li
                    key={tool.id}
                    className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 dark:border-gray-800 dark:bg-gray-900"
                  >
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{tool.name}</p>
                    <p className="mt-1 text-sm leading-7 text-gray-600 dark:text-gray-300">{tool.description}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Free for students</h2>
              <p className="mt-3">
                ToolBridge is free in this MVP and built specifically for students who need practical lab and assignment help without signups, payments, or setup friction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Contact</h2>
              <p className="mt-3">
                Questions, bug reports, or suggestions:{" "}
                <a href="mailto:hello@toolbridge.study" className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400">
                  hello@toolbridge.study
                </a>
              </p>
            </section>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
