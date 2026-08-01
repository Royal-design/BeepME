"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { RegisterFormData, registerSchema } from "@/schema/registerSchema";
import { useAppDispatch } from "@/redux/store";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "@/redux/slice/authSlice";
import { BEEPME } from "@/assets/logo";
import { toast } from "sonner";
import { UserLoadingSpinner } from "./UserLoadingSpinner";
import { AuthShell } from "./AuthShell";

export const Register = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      name: "",
      password: ""
    }
  });

  const handleSubmit = async (userData: RegisterFormData) => {
    const response = await dispatch(
      registerUser(userData.email, userData.password, userData.name)
    );

    if (response.success) {
      form.reset();
      navigate("/chats");
      toast.success("Account created");
    } else {
      toast.error(response.message || "Registration failed");
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
            Create your account
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Join the hive and start buzzing.
          </p>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="mt-6 space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="name"
                        placeholder="Your name"
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
                        autoComplete="new-password"
                        placeholder="Create a password"
                        className="h-11 bg-background"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                disabled={form.formState.isSubmitting}
                type="submit"
                className="h-11 w-full cursor-pointer"
              >
                {form.formState.isSubmitting ? (
                  <UserLoadingSpinner />
                ) : (
                  "Create account"
                )}
              </Button>
            </form>
          </Form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-accent transition-colors hover:text-accent-hover"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthShell>
  );
};
