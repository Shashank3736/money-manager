'use client'
import firebase_app from "@/firebase/config";
import { addDoc, collection, deleteDoc, doc, getFirestore, limit, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Image from "next/image";
import piggyPlead from '/public/assets/piggy_pleading.png'
import { toast } from "@/components/ui/use-toast";
import UpdateTransactionForm from "@/components/shared/UpdateTransactionForm";

const addTransactionSchema = z.object({
  account: z.string().min(2, {message: "Need atleast 2 character long"}).max(32, {message: "Too long make it shorter than 32 characters."}),
  category: z.string().min(2, {message: "Need atleast 2 character long"}).max(32, {message: "Too long make it shorter than 32 characters."}),
  amount: z.string({required_error: "Amount is required"}).transform((v) => Number(v)),
});

const getDate = (date) => {
  try {
    return date.toDate().toLocaleString()
  } catch (error) {
    return "Invalid Date"
  }
}

export default function Home() {
  const auth = getAuth(firebase_app);
  const [user] = useAuthState(auth);
  const db = getFirestore(firebase_app);
  const tranCol = collection(db, "transaction");
  const tranQuery = query(tranCol, orderBy("date", "desc"), where("userId", "==", user? user.uid:''), limit(5));
  const [trans] = useCollection(tranQuery);

  // 1. define form
  const form = useForm<z.infer<typeof addTransactionSchema>>({
    resolver: zodResolver(addTransactionSchema),
    defaultValues: {
      account: "",
      category: "",
    }
  })

  // 2. handle form
  const onSubmit = async(values: z.infer<typeof addTransactionSchema>) => {
    console.log(values, 1)
    if(!user) {
      throw new Error("No user");
    }
    try {
      const docRef = await addDoc(tranCol, {
        ...values,
        date: serverTimestamp(),
        userId: user.uid,
      });
      form.reset()
    } catch (error) {
      console.log(error)
      toast({
        title: `Error`,
        description: "Something went wrong",
        variant: "destructive",
      })
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
                <TableHead>Update</TableHead>
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
                  <TableCell>
                    <UpdateTransactionForm oldValues={doc.data()} docId={doc.id} user={user} />
                  </TableCell>
                  <TableCell>{doc.data().account}</TableCell>
                  <TableCell>{doc.data().category}</TableCell>
                  <TableCell>{doc.data().amount}</TableCell>
                  <TableCell>{getDate(doc.data().date)}</TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. You will lose this transaction.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>No, go back</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteTransaction(doc.id)}>Yes, delete it</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
    ): (
      <div className="w-full flex flex-col md:flex-row justify-center items-center py-10">
        <Image src={piggyPlead} alt='piggy' width={1000} height={1000} className="w-96" />
        <p className="text-2xl font-bold">Please <strong className="dark:text-blue-400 text-blue-600">Login</strong> to add transactions</p>
      </div>
    )}
    </div>
  );
}
