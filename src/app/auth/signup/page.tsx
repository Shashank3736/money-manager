"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import signUp from "@/firebase/auth/signup";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const signUpFormSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

export default function SignupPage() {
  const router = useRouter()

  const form = useForm<z.infer<typeof signUpFormSchema>>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      email: "",
      password: "",
    }
  })

  const onSubmit = async (values: z.infer<typeof signUpFormSchema>) => {
    const { email, password } = values;
    const { result, error } = await signUp(email, password);

    if(error) {
      console.log(error);
    }

    if(result) {
      router.push("/auth/login");
      console.log(result.user);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 p-10 min-w-96 border rounded-lg shadow-lg">
        <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input placeholder="Email address" {...field} />
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
              <Input type="password" placeholder="Password" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
        />
        <Button type="submit">Sign Up</Button>
        <p>Already have an account? <Link href='/auth/login' className="text-blue-600 dark:text-blue-400 hover:underline">Log in</Link></p>
      </form>
    </Form>
  );
}
