"use client";

import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import UserMenu from "./UserMenu";

import type { Profile } from "@/types/profile";

export default function Topbar() {
  const [profile, setProfile] = useState<Profile | null>(null);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<
  {
    id: string;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
  }[]
>([]);

  useEffect(() => {
    async function fetchProfile() {

  const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  setProfile(null);
  return;
}

  const {
    data,
    error,
  } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Topbar:", error);
    return;
  }

  if (data) {
    setProfile(data as Profile);

    const { data: notificationsData, error: notificationsError } =
  await supabase
    .from("notifications")
    .select("id, title, message, type, is_read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

if (notificationsError) {
  console.error("Notifications:", notificationsError);
} else {
  setNotifications(notificationsData ?? []);
}

  }
}
  
    fetchProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (
      notificationsRef.current &&
      !notificationsRef.current.contains(event.target as Node)
    ) {
      setIsNotificationsOpen(false);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  return (
    <header
      className="
        relative
        h-20
        border-b
        border-zinc-800
        bg-zinc-950/80
        backdrop-blur-xl
        px-8
        flex
        items-center
        justify-end
        z-50
      "
    >
      <div className="flex items-center gap-4">

        <div
          className="relative"
          ref={notificationsRef}
        >

  <button
  title="Notificações"
  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
  className="
    relative
    w-12
    h-12
    rounded-2xl
    bg-zinc-900
    border
    border-zinc-800
    flex
    items-center
    justify-center
    hover:border-green-500
    transition
  "
>
  <Bell size={20} />

  {notifications.some((notification) => !notification.is_read) && (
  <span
    className="
      absolute
      top-2
      right-2
      h-2.5
      w-2.5
      rounded-full
      bg-green-500
    "
  />
)}
</button>

  {isNotificationsOpen && (
    <div
      className="
        absolute
        right-0
        mt-3
        w-96
        rounded-2xl
        border
        border-zinc-800
        bg-zinc-950
        shadow-2xl
        z-50
        overflow-hidden
        animate-in
        fade-in
        zoom-in-95
        duration-200
      "
    >

      <div className="px-5 py-4 border-b border-zinc-800">

        <h3 className="font-semibold text-white">
          Notificações
        </h3>

      </div>

      {notifications.length === 0 ? (
  <div className="px-5 py-10 text-center">
    <div className="flex justify-center mb-3">
      <Bell size={40} className="text-green-500" />
    </div>

    <p className="font-medium text-white">
      Nenhuma notificação
    </p>

    <p className="text-sm text-zinc-400 mt-2">
      Quando houver novidades da sua conta,
      elas aparecerão aqui.
    </p>
  </div>
) : (
  <div className="max-h-96 overflow-y-auto">
    {notifications.map((notification) => (
      <div
        key={notification.id}
        className="border-b border-zinc-800 p-5"
      >
        <h4 className="font-semibold text-white">
          {notification.title}
        </h4>

        <p className="text-sm text-zinc-400 mt-1">
          {notification.message}
        </p>
      </div>
    ))}
  </div>
)}

    </div>
  )}

</div>

        <div
          className={`
            hidden
            md:flex
            px-5
            py-3
            rounded-2xl
            font-bold
            text-white
            ${
              profile?.is_pro
                ? "bg-gradient-to-r from-green-500 to-emerald-600"
                : "bg-zinc-800"
            }
          `}
        >
          {profile?.is_pro ? "💎 PRO" : "FREE"}
        </div>

        <UserMenu profile={profile} />

      </div>
    </header>
  );
}