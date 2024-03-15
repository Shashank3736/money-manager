'use client'

import UpdateTransactionForm from "@/components/shared/UpdateTransactionForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
  const [last, setLast] = useState(false)

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
      q = query(transCol, orderBy("date", "desc"), where("userId", "==", user.uid), startAfter(data[data.length - 1]), limit(5));
    } else {
      q = query(transCol, orderBy("date", "desc"), where("userId", "==", user.uid), limit(5));
    }
    getDocs(q).then((snapshot) => {
      const extractData = snapshot.docs
      if(extractData.length < 5) {
        setLast(true)
      }
      setData(data.concat(extractData))
    })
  }

  if(data.length === 0 && user) getTransactions();
  
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
          {user && data.length > 0 ? data.map((doc) => (
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
          )):[...Array(5)].map((i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="w-full h-10" />
              </TableCell>
              <TableCell>
                <Skeleton className="w-full h-10" />
              </TableCell>
              <TableCell>
                <Skeleton className="w-full h-10" />
              </TableCell>
              <TableCell>
                <Skeleton className="w-full h-10" />
              </TableCell>
              <TableCell>
                <Skeleton className="w-full h-10" />
              </TableCell>
              <TableCell>
                <Skeleton className="w-full h-10" />
              </TableCell>
            </TableRow>
            ))}
        </TableBody>
      </Table>
      <Button className={"my-5 self-center " + (last || data.length === 0 ? "hidden" : "")} onClick={getTransactions}>Load More</Button>
    </div>
  )
}