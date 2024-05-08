type Props = {
  children: React.ReactNode;
};

export default function TableHead({ children }: Props) {
  return (
    <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-200">
      <tr>{children}</tr>
    </thead>
  );
}
