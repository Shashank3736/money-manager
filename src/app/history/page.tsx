'use client'

import UpdateTransactionForm from "@/components/shared/UpdateTransactionForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import firebase_app from "@/firebase/config"
import { getAuth } from "firebase/auth";
import { DocumentData, QueryDocumentSnapshot, collection, deleteDoc, doc, getCountFromServer, getDocs, getFirestore, limit, orderBy, query, startAfter, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

const getDate = (date) => {
  try {
    return date.toDate().toLocaleString()
  } catch (error) {
    return "Invalid Date"
  }
}

export default function History() {
  const auth = getAuth(firebase_app);
  const [user] = useAuthState(auth);
  const db = getFirestore(firebase_app);
  const transCol = collection(db, "transaction");
  const [data, setData] = useState<QueryDocumentSnapshot<DocumentData, DocumentData>[]>([])
  const [count, setCount] = useState(0)

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

  function getTransactions() {
    if(!user) {
      throw new Error("No user");
    }
    let q;
    if(data.length > 0) {
      console.log(data[data.length - 1])
      q = query(transCol, orderBy("date", "desc"), where("userId", "==", user.uid), startAfter(data[data.length - 1]), limit(5));
    } else {
      q = query(transCol, orderBy("date", "desc"), where("userId", "==", user.uid), limit(5));
    }  
    console.log(q)
    getDocs(q).then((snapshot) => {
      const extractData = snapshot.docs
      console.log(extractData, 31)
      setData(data.concat(extractData))
      console.log(data.length, count)
    })
  }

  if(data.length === 0 && user) getTransactions();

  useEffect(() => {
    if(!user) return;
    const q = query(transCol, where("userId", "==", user.uid));
    getCountFromServer(q).then((count) => {
      setCount(count.data().count)
      console.log(count.data().count)
    })
  }, [user])
  
  return (
    <div className="container flex flex-col">
      <Table>
        {/* <TableCaption>Transaction History</TableCaption> */}
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
          {user && data.map((doc) => (
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
      <Button className={"mt-5 self-center " + (count === data.length ? "hidden" : "")} onClick={getTransactions}>Load More</Button>
    </div>
  )
}