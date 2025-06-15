"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { toast } from "react-hot-toast";
import { doc, getDoc } from "firebase/firestore";
import { Users, Calendar, BarChart2, LogOut, User } from "lucide-react";
import Cookies from "js-cookie";

export function Sidebar() {
  const pathname = usePathname();
  const [userName, setUserName] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("User");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserName(data.name || currentUser.email?.split("@")[0] || "User");
          setUserRole(data.role || "User");
        } else {
          setUserName(currentUser.email?.split("@")[0] || "User");
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        setUserName(currentUser.email?.split("@")[0] || "User");
      }
    };

    loadUserData();
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);

      // Sign out from Firebase
      await signOut(auth);

      // Clear cookies
      Cookies.remove("auth-token");

      // Clear any local storage
      localStorage.clear();
      sessionStorage.clear();

      // Show success message
      toast.success("Logged out successfully");

      // Force redirect to login page
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
      setIsLoggingOut(false);
    }
  };

  const navigation = [
    {
      name: "Students",
      href: "/dashboard/students",
      icon: Users,
    },
    {
      name: "Attendance",
      href: "/dashboard/attendance",
      icon: Calendar,
    },
    {
      name: "Attendance Report",
      href: "/dashboard/attendance-report",
      icon: BarChart2,
    },
  ];

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
          <h1 className="text-xl font-bold text-white">School Attendance</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile and Logout */}
        <div className="p-4 border-t space-y-3">
          <div className="flex items-center px-4 py-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <User className="w-5 h-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userName}
              </p>
              <p className="text-xs text-gray-500 truncate">{userRole}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50 cursor-not-allowed"
          >
            <LogOut className="w-5 h-5 mr-3" />
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </div>
  );
}
