import firebase_app from "@/firebase/config";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "firebase/auth";
import { doc, getFirestore, updateDoc } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { DialogClose } from "@radix-ui/react-dialog";
import { useState } from "react";

const updateTransactionSchema = z.object({
  account: z.string().min(2, {message: "Need atleast 2 character long"}).max(32, {message: "Too long make it shorter than 32 characters."}),
  category: z.string().min(2, {message: "Need atleast 2 character long"}).max(32, {message: "Too long make it shorter than 32 characters."}),
  amount: z.string().transform((v) => Number(v)),
});

export default function UpdateTransactionForm({ oldValues, user, docId, reloadAfter=false }: { oldValues: z.infer<typeof updateTransactionSchema>, user: User, docId: string, reloadAfter: boolean | null }) {
  const db = getFirestore(firebase_app);
  const [open, setOpen] = useState(false);
  // 1. define form
  const form = useForm<z.infer<typeof updateTransactionSchema>>({
    resolver: zodResolver(updateTransactionSchema),
    defaultValues: {
      account: oldValues.account,
      category: oldValues.category,
      amount: oldValues.amount.toString(),
    },
  })

  // 2. handle form
  const onSubmit = async(values: z.infer<typeof updateTransactionSchema>) => {
    if(!user) {
      throw new Error("No user");
    }
    try {
      await updateDoc(doc(db, "transaction", docId), {
        ...values,
        userId: user.uid,
      });
      setOpen(false);
      if(reloadAfter) {
        window.location.reload();
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)} variant="outline">Update</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Transaction</DialogTitle>
          <DialogDescription>
            Update your transaction
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder='amount' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder='category' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            <FormField
            control={form.control}
            name="account"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account</FormLabel>
                <FormControl>
                  <Input placeholder='account' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            />
            <DialogClose asChild>
              <Button type='submit' onClick={form.handleSubmit(onSubmit)} disabled={form.formState.isSubmitting}>Update Transaction</Button>
            </DialogClose>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}