import { LoginLayout } from "@layouts/LoginLayout";

import SignupForm from "~/components/forms/SignupForm";
import AppleLogin from "~/components/social/AppleLogin";
import DiscordLogin from "~/components/social/DiscordLogin";
import FacebookLogin from "~/components/social/FacebookLogin";
import GithubLogin from "~/components/social/GithubLogin";
import GoogleLogin from "~/components/social/GoogleLogin";
import TwitterLogin from "~/components/social/TwitterLogin";

export default function Page() {
  return (
    <>
      <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Registre una cuenta
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
            <SignupForm />

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">
                    O continúe con
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <GoogleLogin />
                {/* <FacebookLogin />
                <TwitterLogin />
                <DiscordLogin />
                <GithubLogin />
                <AppleLogin /> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

Page.getLayout = function getLayout(page: JSX.Element) {
  return <LoginLayout>{page}</LoginLayout>;
};
