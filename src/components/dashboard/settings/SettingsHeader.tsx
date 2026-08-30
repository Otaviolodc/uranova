type Props = {
  title: string;
  description: string;
};

export default function SettingsHeader({
  title,
  description,
}: Props) {
  return (
    <div className="mb-10">
      <h1 className="text-4xl font-black text-white">
        {title}
      </h1>

      <p className="text-zinc-400 mt-3 text-lg">
        {description}
      </p>
    </div>
  );
}