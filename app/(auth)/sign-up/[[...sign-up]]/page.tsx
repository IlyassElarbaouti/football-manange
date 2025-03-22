// app/(auth)/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";
 
export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[url('/images/fifa-gb.webp')] bg-cover bg-center bg-no-repeat before:absolute before:inset-0 before:bg-black/85 before:backdrop-blur-sm">
      <div className="relative z-10 w-full max-w-md">
        {/* FIFA-inspired header with Black and Gold */}
        <div className="mb-6 text-center">
          <div className="mb-2 flex justify-center">
            <div className="inline-block rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 p-1.5 shadow-lg shadow-amber-500/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-10 w-10 text-black"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            </div>
          </div>
          <div className="relative">
            <h1 className="text-4xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                FOOTBALL
              </span>
              <span className="bg-gradient-to-r from-amber-400 to-yellow-200 bg-clip-text text-transparent">
                HUB
              </span>
            </h1>
            <div className="absolute -right-2 top-0 rounded-md bg-amber-400 px-1.5 py-0.5 text-xs font-bold text-black shadow-md">
              FUT 25
            </div>
          </div>
          <p className="mt-2 text-amber-400">Join the Ultimate Team</p>
        </div>
        
        {/* Sign-up card with Black and Gold styling */}
        <div className="overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-br from-black/90 to-gray-900/80 shadow-xl backdrop-blur-md">
          <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2 text-lg font-bold text-black">
            Create Account
          </div>
          <div className="p-6">
            <SignUp
              appearance={{
                elements: {
                  formButtonPrimary: 
                    "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-sm normal-case text-black font-bold shadow-md shadow-amber-500/20",
                  card: "bg-transparent shadow-none",
                  headerTitle: "hidden",
                  headerSubtitle: "text-white/80",
                  socialButtonsBlockButton: 
                    "bg-gray-800/50 border border-amber-500/20 text-white hover:bg-gray-800/70",
                  formFieldLabel: "text-white",
                  formFieldInput: 
                    "bg-gray-800/50 border-amber-500/20 text-white focus:border-amber-400",
                  footerActionLink: "text-amber-400 hover:text-amber-300",
                  formFieldInputShowPasswordButton: "text-white/60 hover:text-white",
                  formFieldAction: "text-amber-400 hover:text-amber-300",
                  identityPreview: "bg-gray-800/50 border-amber-500/20 text-white",
                  identityPreviewText: "text-white",
                  identityPreviewEditButton: "text-amber-400 hover:text-amber-300",
                  otpCodeFieldInput: "bg-gray-800/50 border-amber-500/20 text-white",
                },
              }}
            />
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-6 text-center text-sm text-white/60">
          © 2025 Football Hub. All rights reserved.
        </div>
      </div>
    </div>
  );
}