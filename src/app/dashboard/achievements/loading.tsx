export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">

      {/* HERO */}

      <section className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-7">

        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/10" />

        <div className="relative">

          <div className="mb-4 h-6 w-40 rounded-full bg-zinc-800" />

          <div className="h-10 w-80 rounded-lg bg-zinc-800" />

          <div className="mt-3 h-4 w-full max-w-2xl rounded bg-zinc-900" />
          <div className="mt-2 h-4 w-2/3 max-w-xl rounded bg-zinc-900" />

          <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_180px]">

            <div>
              <div className="h-3 w-32 rounded bg-zinc-800" />

              <div className="mt-3 h-8 w-40 rounded bg-zinc-800" />

              <div className="mt-4 h-3 w-full rounded-full bg-zinc-800" />

              <div className="mt-3 flex justify-between">
                <div className="h-3 w-32 rounded bg-zinc-900" />
                <div className="h-3 w-32 rounded bg-zinc-900" />
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
              <div className="h-3 w-24 rounded bg-zinc-800" />
              <div className="mt-3 h-7 w-32 rounded bg-zinc-800" />
              <div className="mt-2 h-3 w-28 rounded bg-zinc-900" />
            </div>

          </div>

        </div>

      </section>


      {/* CONQUISTAS DIGITAIS */}

      <section>

        <div className="mb-5 flex items-end justify-between">

          <div>
            <div className="h-8 w-64 rounded-lg bg-zinc-800" />
            <div className="mt-2 h-4 w-80 rounded bg-zinc-900" />
          </div>

          <div className="h-4 w-16 rounded bg-zinc-900" />

        </div>


        <div className="grid gap-5 lg:grid-cols-2">

          {[1, 2].map((item) => (

            <div
              key={item}
              className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5"
            >

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-4">

                  <div className="h-11 w-11 rounded-xl bg-zinc-800" />

                  <div>
                    <div className="h-5 w-32 rounded bg-zinc-800" />
                    <div className="mt-2 h-3 w-24 rounded bg-zinc-900" />
                  </div>

                </div>

                <div className="h-6 w-16 rounded-full bg-zinc-900" />

              </div>


              <div className="mt-5 h-4 w-72 rounded bg-zinc-900" />


              <div className="mt-5 grid grid-cols-2 gap-3">

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
                  <div className="h-3 w-12 rounded bg-zinc-800" />
                  <div className="mt-3 h-5 w-24 rounded bg-zinc-800" />
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
                  <div className="h-3 w-20 rounded bg-zinc-800" />
                  <div className="mt-3 h-4 w-28 rounded bg-zinc-800" />
                  <div className="mt-2 h-4 w-24 rounded bg-zinc-900" />
                </div>

              </div>


              <div className="mt-5 border-t border-zinc-800 pt-4">

                <div className="flex justify-between">

                  <div className="h-3 w-24 rounded bg-zinc-900" />
                  <div className="h-3 w-10 rounded bg-zinc-900" />

                </div>

                <div className="mt-2 h-2 rounded-full bg-zinc-800" />

              </div>

            </div>

          ))}

        </div>

      </section>


      {/* PLACAS */}

      <section>

        <div className="mb-5">

          <div className="h-8 w-48 rounded-lg bg-zinc-800" />

          <div className="mt-2 h-4 w-96 max-w-full rounded bg-zinc-900" />

        </div>


        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

          {[1, 2, 3].map((item) => (

            <div
              key={item}
              className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950"
            >

              <div className="h-48 bg-zinc-900" />

              <div className="space-y-4 p-5">

                <div className="flex items-center justify-between">

                  <div>
                    <div className="h-5 w-36 rounded bg-zinc-800" />
                    <div className="mt-2 h-3 w-24 rounded bg-zinc-900" />
                  </div>

                  <div className="h-7 w-10 rounded-lg bg-zinc-900" />

                </div>

                <div className="h-4 w-full rounded bg-zinc-900" />

                <div className="h-10 rounded-xl bg-zinc-900" />

              </div>

            </div>

          ))}

        </div>

      </section>

    </div>
  );
}