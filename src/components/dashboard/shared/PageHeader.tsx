type PageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
};

export default function PageHeader({
  title,
  subtitle,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-6 mb-8 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-4xl font-black text-white">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-2 text-zinc-400 text-lg">
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
}