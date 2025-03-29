import { Link, useLocation } from "wouter";
import { 
  Home, 
  ClipboardList, 
  BarChart, 
  Settings 
} from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="h-0 flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 px-2 space-y-1">
            <Link href="/">
              <a className={`${
                location === "/" 
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white" 
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
              >
                <Home className="mr-4 h-6 w-6 text-primary" />
                Dashboard
              </a>
            </Link>
            <Link href="/history">
              <a className={`${
                location === "/history" 
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white" 
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
              >
                <ClipboardList className="mr-4 h-6 w-6 text-gray-400 dark:text-gray-500" />
                History
              </a>
            </Link>
            <Link href="/insights">
              <a className={`${
                location === "/insights" 
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white" 
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
              >
                <BarChart className="mr-4 h-6 w-6 text-gray-400 dark:text-gray-500" />
                Insights
              </a>
            </Link>
            <Link href="/settings">
              <a className={`${
                location === "/settings" 
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white" 
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
              >
                <Settings className="mr-4 h-6 w-6 text-gray-400 dark:text-gray-500" />
                Settings
              </a>
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
