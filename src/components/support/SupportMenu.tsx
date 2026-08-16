"use client";

import React from "react";
import {
  BookOpen,
  Bug,
  ChevronRight,
  Lightbulb,
  MessageCircle,
  Star,
} from "lucide-react";

interface SupportMenuProps {
  onChatClick: () => void;
  onFeedbackClick: () => void;
  onBugClick: () => void;
  onSuggestionClick: () => void;
}

export default function SupportMenu({
  onChatClick,
  onFeedbackClick,
  onBugClick,
  onSuggestionClick,
}: SupportMenuProps) {
  return (
    <div className="space-y-3 p-4">

      <MenuItem
        icon={<BookOpen size={20} />}
        title="Base de conhecimento"
        description="Artigos e tutoriais"
        onClick={() => {}}
      />

      <MenuItem
        icon={<MessageCircle size={20} />}
        title="Conversar com suporte"
        description="Fale com nossa equipe"
        onClick={onChatClick}
      />

      <MenuItem
        icon={<Bug size={20} />}
        title="Reportar problema"
        description="Encontrou algum bug?"
        onClick={onBugClick}
      />

      <MenuItem
        icon={<Lightbulb size={20} />}
        title="Enviar sugestão"
        description="Ajude a melhorar a Uranova"
        onClick={onSuggestionClick}
      />

      <MenuItem
        icon={<Star size={20} />}
        title="Avaliar a Uranova"
        description="Conte sua experiência"
        onClick={onFeedbackClick}
      />

      <div className="mt-5 border-t border-white/10 pt-4">
        <p className="text-center text-xs text-zinc-500">
          Uranova • Central de Ajuda
        </p>
      </div>

    </div>
  );
}

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

function MenuItem({
  icon,
  title,
  description,
  onClick,
}: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className="
        group
        w-full

        flex
        items-center
        justify-between

        rounded-xl

        border
        border-white/5

        bg-zinc-800

        p-4

        transition-all
        duration-300

        hover:scale-[1.02]
        hover:border-emerald-500/40
        hover:bg-zinc-700
      "
    >
      <div className="flex items-center gap-4">
        <div className="text-emerald-400">
          {icon}
        </div>

        <div className="text-left">
          <p className="font-semibold text-white">
            {title}
          </p>

          <p className="text-xs text-zinc-400">
            {description}
          </p>
        </div>
      </div>

      <ChevronRight
        size={18}
        className="
          text-zinc-500
          transition-transform
          duration-300
          group-hover:translate-x-1
        "
      />
    </button>
  );
}