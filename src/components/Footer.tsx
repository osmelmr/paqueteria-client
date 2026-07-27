export function Footer() {
  return (
    <footer className="flex items-center justify-center h-10 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 bg-[#dbdbdb] dark:bg-[#16171d] md:ml-[220px]">
      <span>Paqueteria &copy; {new Date().getFullYear()}</span>
    </footer>
  );
}
