"use client";

import { useState } from "react";
import { X } from "lucide-react";

import SupportChat from "./SupportChat";
import SupportSuggestion from "./SupportSuggestion";
import SupportSuccess from "./SupportSuccess";
import SupportMenu from "./SupportMenu";
import SupportFeedback from "./SupportFeedback";
import SupportBug from "./SupportBug";

interface SupportPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function SupportPanel({
  open,
  onClose,
}: SupportPanelProps) {
  const [screen, setScreen] = useState<
    "menu" | "chat" | "feedback" | "bug" | "suggestion" | "success"
  >("menu");

  const [successMessage, setSuccessMessage] = useState(
    "Sua avaliação foi enviada com sucesso."
  );

  return (
    <div
      className={`
        fixed
        bottom-20
        right-6
        z-50

        w-[390px]
        rounded-2xl

        border border-white/10

        bg-zinc-900/95
        backdrop-blur-xl

        shadow-2xl

        transition-all
        duration-300

        ${
          open
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-6 pointer-events-none"
        }
      `}
    >
      <div className="flex items-center justify-between border-b border-white/10 p-5">
        <div>
          <h2 className="text-xl font-bold text-white">
            💬 Central de Ajuda
          </h2>

          <p className="mt-1 text-sm text-zinc-400">
            Como podemos ajudar hoje?
          </p>
        </div>

        <button
          onClick={onClose}
          className="
            rounded-lg
            p-2
            transition
            hover:bg-red-500/20
          "
        >
          <X className="h-5 w-5 text-zinc-400 hover:text-red-400" />
        </button>
      </div>

      {screen === "menu" && (
        <SupportMenu
          onChatClick={() => setScreen("chat")}
          onFeedbackClick={() => setScreen("feedback")}
          onBugClick={() => setScreen("bug")}
          onSuggestionClick={() => setScreen("suggestion")}
        />
      )}

      {screen === "chat" && (
        <SupportChat
          onBack={() => setScreen("menu")}
          onSuccess={() => {
            setSuccessMessage(
              "Sua mensagem foi enviada com sucesso."
            );

            setScreen("success");
          }}
        />
      )}

      {screen === "feedback" && (
        <SupportFeedback
          onBack={() => setScreen("menu")}
          onSuccess={() => {
            setSuccessMessage(
              "Sua avaliação foi enviada com sucesso."
            );

            setScreen("success");
          }}
        />
      )}

      {screen === "bug" && (
        <SupportBug
          onBack={() => setScreen("menu")}
          onSuccess={() => {
            setSuccessMessage(
              "Seu problema foi enviado com sucesso."
            );

            setScreen("success");
          }}
        />
      )}

      {screen === "suggestion" && (
        <SupportSuggestion
          onBack={() => setScreen("menu")}
          onSuccess={() => {
            setSuccessMessage(
              "Sua sugestão foi enviada com sucesso."
            );

            setScreen("success");
          }}
        />
      )}

      {screen === "success" && (
        <SupportSuccess
          message={successMessage}
          onClose={() => {
            setScreen("menu");
            onClose();
          }}
        />
      )}
    </div>
  );
}