import Link from "next/link";
import { LoginLayout } from "@layouts/LoginLayout";

import LoginForm from "~/components/forms/LoginForm";
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
            Ingrese a su cuenta
          </h2>
        </div>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <p className="mt-2 text-sm leading-6 text-gray-500">
            ¿No tiene cuenta?{" "}
            <Link
              href="/signup"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Registrarse
            </Link>
          </p>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
            <LoginForm />

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
