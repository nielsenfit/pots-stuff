import { Link, useLocation } from "wouter";
import { 
  Home, 
  ClipboardList, 
  BarChart, 
  Settings,
  Plus 
} from "lucide-react";

interface MobileNavProps {
  openAddSymptom: () => void;
}

export default function MobileNav({ openAddSymptom }: MobileNavProps) {
  const [location] = useLocation();

  return (
    <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 fixed bottom-0 left-0 right-0 z-10">
      <div className="flex justify-around">
        <Link href="/">
          <div className={`flex flex-col items-center py-3 px-4 cursor-pointer ${
            location === "/" ? "text-primary" : "text-gray-500 dark:text-gray-400"
          }`}>
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Dashboard</span>
          </div>
        </Link>
        <Link href="/history">
          <div className={`flex flex-col items-center py-3 px-4 cursor-pointer ${
            location === "/history" ? "text-primary" : "text-gray-500 dark:text-gray-400"
          }`}>
            <ClipboardList className="h-6 w-6" />
            <span className="text-xs mt-1">History</span>
          </div>
        </Link>
        <button 
          onClick={openAddSymptom}
          className="flex flex-col items-center py-3 px-4 bg-primary text-white rounded-full -mt-6 shadow-lg"
        >
          <Plus className="h-8 w-8" />
        </button>
        <Link href="/insights">
          <div className={`flex flex-col items-center py-3 px-4 cursor-pointer ${
            location === "/insights" ? "text-primary" : "text-gray-500 dark:text-gray-400"
          }`}>
            <BarChart className="h-6 w-6" />
            <span className="text-xs mt-1">Insights</span>
          </div>
        </Link>
        <Link href="/settings">
          <div className={`flex flex-col items-center py-3 px-4 cursor-pointer ${
            location === "/settings" ? "text-primary" : "text-gray-500 dark:text-gray-400"
          }`}>
            <Settings className="h-6 w-6" />
            <span className="text-xs mt-1">Settings</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
