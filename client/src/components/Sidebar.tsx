import { Link, useLocation } from "wouter";
import { 
  Home, 
  ClipboardList, 
  BarChart, 
  Settings,
  Pill,
  CircleDashed
} from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="h-0 flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 px-2 space-y-1">
            <Link href="/">
              <div className={`${
                location === "/" 
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white" 
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                } group flex items-center px-2 py-2 text-base font-medium rounded-md cursor-pointer`}
              >
                <Home className="mr-4 h-6 w-6 text-primary" />
                Dashboard
              </div>
            </Link>
            <Link href="/history">
              <div className={`${
                location === "/history" 
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white" 
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                } group flex items-center px-2 py-2 text-base font-medium rounded-md cursor-pointer`}
              >
                <ClipboardList className="mr-4 h-6 w-6 text-gray-400 dark:text-gray-500" />
                History
              </div>
            </Link>
            <Link href="/insights">
              <div className={`${
                location === "/insights" 
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white" 
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                } group flex items-center px-2 py-2 text-base font-medium rounded-md cursor-pointer`}
              >
                <BarChart className="mr-4 h-6 w-6 text-gray-400 dark:text-gray-500" />
                Insights
              </div>
            </Link>
            <Link href="/medications">
              <div className={`${
                location === "/medications" 
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white" 
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                } group flex items-center px-2 py-2 text-base font-medium rounded-md cursor-pointer`}
              >
                <Pill className="mr-4 h-6 w-6 text-gray-400 dark:text-gray-500" />
                Medications
              </div>
            </Link>
            <Link href="/salt-tracker">
              <div className={`${
                location === "/salt-tracker" 
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white" 
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                } group flex items-center px-2 py-2 text-base font-medium rounded-md cursor-pointer`}
              >
                <CircleDashed className="mr-4 h-6 w-6 text-gray-400 dark:text-gray-500" />
                Salt Tracker
              </div>
            </Link>
            <Link href="/settings">
              <div className={`${
                location === "/settings" 
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white" 
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                } group flex items-center px-2 py-2 text-base font-medium rounded-md cursor-pointer`}
              >
                <Settings className="mr-4 h-6 w-6 text-gray-400 dark:text-gray-500" />
                Settings
              </div>
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
