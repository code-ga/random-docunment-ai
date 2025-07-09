import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light.svg";

export function Welcome() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex flex-col items-center gap-10 p-8 rounded-3xl shadow-xl bg-white/80 dark:bg-gray-900/80 max-w-xl w-full">
        <div className="w-40 mb-2">
          <img
            src={logoLight}
            alt="Study.ai Logo"
            className="block w-full dark:hidden"
          />
          <img
            src={logoDark}
            alt="Study.ai Logo"
            className="hidden w-full dark:block"
          />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white text-center">
          Welcome to Study.ai
        </h1>
        <h2 className="text-xl font-semibold text-indigo-700 dark:text-indigo-300 text-center">
          AI-powered learning tailored just for you
        </h2>
        <p className="text-gray-700 dark:text-gray-200 text-center max-w-md">
          Unlock your potential with personalized study plans, instant answers, and interactive learning tools. Let AI guide your journey, making learning efficient, engaging, and fun.
        </p>
        <a
          href="#"
          className="mt-4 px-8 py-3 bg-indigo-600 text-white rounded-full text-lg font-semibold shadow hover:bg-indigo-700 transition-colors"
        >
          Get Started
        </a>
        <a
          href="/login"
          className="mt-2 px-8 py-3 bg-white border border-indigo-600 text-indigo-700 rounded-full text-lg font-semibold shadow hover:bg-indigo-50 dark:bg-gray-800 dark:text-indigo-300 dark:border-indigo-400 transition-colors"
        >
          Login
        </a>
      </div>
    </main>
  );
}
