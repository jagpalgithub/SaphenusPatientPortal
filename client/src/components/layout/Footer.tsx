export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-neutral-200 dark:border-gray-700 px-4 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="text-center md:text-left">
          <p className="text-sm text-neutral-500 dark:text-gray-400">
            © {new Date().getFullYear()} Saphenus Medical Technology. All rights reserved.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-4">
          <a href="#" className="text-sm text-neutral-500 dark:text-gray-400 hover:text-neutral-700 dark:hover:text-gray-300">
            Privacy Policy
          </a>
          <a href="#" className="text-sm text-neutral-500 dark:text-gray-400 hover:text-neutral-700 dark:hover:text-gray-300">
            Terms of Service
          </a>
          <a href="#" className="text-sm text-neutral-500 dark:text-gray-400 hover:text-neutral-700 dark:hover:text-gray-300">
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  );
}
