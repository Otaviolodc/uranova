import { createClient }
from "@/lib/supabase/server";

export default async function UsersPage() {

  const supabase =
    await createClient();

  // USERS
  const { data: users } = await supabase
    .from("profiles")
    .select(`
      id,
      username,
      role,
      created_at
    `);

  return (

    <div>

      <div className="
        flex
        items-center
        justify-between
        mb-8
      ">

        <div>

          <h1 className="
            text-4xl
            font-bold
          ">

            Usuários

          </h1>

          <p className="
            text-zinc-400
            mt-2
          ">

            Gerencie todos os usuários do Uranova

          </p>

        </div>

        <div className="
          bg-zinc-900
          border
          border-zinc-800
          px-4
          py-2
          rounded-xl
        ">

          Total: {users?.length || 0}

        </div>

      </div>

      {/* TABLE */}
      <div className="
        bg-zinc-900
        border
        border-zinc-800
        rounded-2xl
        overflow-hidden
      ">

        {/* HEADER */}
        <div className="
          grid
          grid-cols-4
          gap-4
          p-5
          border-b
          border-zinc-800
          text-zinc-400
          text-sm
          font-medium
        ">

          <div>Username</div>
          <div>Role</div>
          <div>Criado em</div>
          <div>Ações</div>

        </div>

        {/* USERS */}
        {users?.map((user) => (

          <div
            key={user.id}
            className="
              grid
              grid-cols-4
              gap-4
              p-5
              border-b
              border-zinc-800
              items-center
              hover:bg-zinc-800/40
              transition
            "
          >

            {/* USERNAME */}
            <div className="font-medium">

              {user.username || "Sem username"}

            </div>

            {/* ROLE */}
            <div>

              <span className="
                bg-zinc-800
                border
                border-zinc-700
                px-3
                py-1
                rounded-lg
                text-sm
              ">

                {user.role || "user"}

              </span>

            </div>

            {/* CREATED */}
            <div className="text-zinc-400 text-sm">

              {new Date(
                user.created_at
              ).toLocaleDateString("pt-BR")}

            </div>

            {/* ACTIONS */}
            <div className="flex gap-2">

              <button className="
                bg-blue-500
                hover:bg-blue-400
                transition
                px-3
                py-2
                rounded-lg
                text-sm
                font-medium
              ">

                Admin

              </button>

              <button className="
                bg-red-500
                hover:bg-red-400
                transition
                px-3
                py-2
                rounded-lg
                text-sm
                font-medium
              ">

                Banir

              </button>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}