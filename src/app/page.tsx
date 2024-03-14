'use client'
import firebase_app from "@/firebase/config";
import { addDoc, collection, deleteDoc, doc, getFirestore, query, serverTimestamp, where } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { getAuth } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const addTransactionSchema = z.object({
  account: z.string().min(2, {message: "Need atleast 2 character long"}).max(32, {message: "Too long make it shorter than 32 characters."}),
  category: z.string().min(2, {message: "Need atleast 2 character long"}).max(32, {message: "Too long make it shorter than 32 characters."}),
  amount: z.string({required_error: "Amount is required"}).transform((v) => Number(v)),
});

export default function Home() {
  const auth = getAuth(firebase_app);
  const [user] = useAuthState(auth);
  const db = getFirestore(firebase_app);
  const tranCol = collection(db, "transaction");
  const tranQuery = query(tranCol, where("userId", "==", user? user.uid:''));
  const [trans] = useCollection(tranQuery);

  // 1. define form
  const form = useForm<z.infer<typeof addTransactionSchema>>({
    resolver: zodResolver(addTransactionSchema),
    defaultValues: {
      account: "",
      category: "",
      amount: 0,
    }
  })

  // 2. handle form
  const onSubmit = async(values: z.infer<typeof addTransactionSchema>) => {
    if(!user) {
      throw new Error("No user");
    }
    try {
      const docRef = await addDoc(tranCol, {
        ...values,
        date: serverTimestamp(),
        userId: user.uid,
      });

      console.log(docRef.id)
      form.reset()
    } catch (error) {
      console.log(error)
    }
  }

  const deleteTransaction = async(id: string) => {
    if(!user) {
      throw new Error("No user");
    }

    try {
      await deleteDoc(doc(db, "transaction", id));
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div className="container">
        {user ? (
        <div className="flex flex-col gap-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex gap-4 mb-4">
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
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder='amount' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit">Add Transaction</Button>
            </form>
          </Form>
          <Table>
            <TableCaption>Transaction History</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trans?.docs.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>{doc.data().account}</TableCell>
                  <TableCell>{doc.data().category}</TableCell>
                  <TableCell>{doc.data().amount}</TableCell>
                  <TableCell>{doc.data().date?.toDate().toLocaleString()}</TableCell>
                  <TableCell><Button variant="outline" color="red" onClick={() => deleteTransaction(doc.id)}>Delete</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
    ): (
      <div>
        <p>Please sign in</p>
      </div>
    )}
    </div>
  );
}
