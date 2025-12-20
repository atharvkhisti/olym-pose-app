export default function LoginForm() {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 text-center">
        <h2 className="text-lg font-semibold text-white">
          Authentication Disabled
        </h2>
        <p className="mt-2 text-sm text-neutral-400">
          Login is disabled in the static demo build.
        </p>
      </div>
    </div>
  );
}
