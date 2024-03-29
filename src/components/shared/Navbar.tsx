'use client'

import firebase_app from "@/firebase/config";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { Button } from "../ui/button";
import Image from "next/image";
import logo from "/public/assets/logo.jpg"
import { useTheme } from "next-themes";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Moon, Sun } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";

export default function Navbar() {
  const auth = getAuth(firebase_app);
  const [user, loading, error] = useAuthState(auth);
  const { setTheme } = useTheme();
  if (error) return <p>Error: {error.message}</p>;
  const provider = new GoogleAuthProvider();
  return (
    <div className="w-full container mx-auto flex justify-between items-center p-4">
      <div className="flex items-center gap-4">
        <Image src={logo} alt='logo' width={100} height={100} className="rounded-full w-16" />
        <Link href={"/"} className="text-2xl font-bold">Money Manager</Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
            Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
            Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
            System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {loading ? (
        <Avatar>
          <AvatarFallback />
        </Avatar>
      ) : user? (
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="hover:cursor-pointer">
          <Avatar>
            <AvatarImage src={user?.photoURL || ""} />
            <AvatarFallback>{user.displayName ? user.displayName[0].toUpperCase():'A'}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{user.displayName}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => auth.signOut()}>Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      ) : <Button onClick={() => signInWithPopup(auth, provider)}>Sign in</Button>}
    </div>
  )
}