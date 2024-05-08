type Props = {
  children: React.ReactNode;
};

export default function TableElement({ children }: Props) {
  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
        {children}
      </table>
    </div>
  );
}
