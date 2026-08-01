import { FormEvent, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import googleImage from "../assets/google.webp";
import { BEEPME } from "@/assets/logo";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoginFormData, loginSchema } from "@/schema/loginSchema";
import { useAppDispatch } from "@/redux/store";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, loginWithGoogle } from "@/redux/slice/authSlice";
import { toast } from "sonner";
import { UserLoadingSpinner } from "./UserLoadingSpinner";
import { AuthShell } from "./AuthShell";

export const Login = () => {
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const handleGoogleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoadingGoogle(true);
    const response = await dispatch(loginWithGoogle());

    setLoadingGoogle(false);

    if (response.success) {
      toast.success("Signed in");
      navigate("/");
    } else {
      toast.error(response.message || "Google login failed");
    }
  };

  const handleSubmit = async (data: LoginFormData) => {
    setLoadingLogin(true);

    const response = await dispatch(loginUser(data.email, data.password));

    setLoadingLogin(false);

    if (response.success) {
      toast.success("Signed in");
      navigate("/chats");
      form.reset();
    } else {
      toast.error(response.message || "Login failed");
    }
  };

  return (
    <AuthShell>
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center lg:hidden">
          <img
            src={BEEPME}
            alt=""
            className="size-14 rounded-2xl object-contain ring-1 ring-border"
          />
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          <h1 className="font-display text-2xl font-medium tracking-tight">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to keep buzzing.
          </p>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="mt-6 space-y-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        className="h-11 bg-background"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        placeholder="Your password"
                        className="h-11 bg-background"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                disabled={loadingLogin || loadingGoogle}
                type="submit"
                className="h-11 w-full cursor-pointer"
              >
                {loadingLogin ? <UserLoadingSpinner /> : "Sign in"}
              </Button>
            </form>
          </Form>

          <div
            className="my-5 flex items-center gap-3 text-[11px] tracking-wide text-faint uppercase"
            aria-hidden
          >
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            disabled={loadingLogin || loadingGoogle}
            onClick={handleGoogleLogin}
            variant="outline"
            className="h-11 w-full cursor-pointer"
          >
            {loadingGoogle ? (
              <UserLoadingSpinner />
            ) : (
              <>
                <img src={googleImage} alt="" className="size-4" />
                Continue with Google
              </>
            )}
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-accent transition-colors hover:text-accent-hover"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </AuthShell>
  );
};
