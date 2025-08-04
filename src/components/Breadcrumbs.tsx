import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const getBreadcrumbItems = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
      { label: "Dashboard", path: "/", icon: <Home className="w-4 h-4" /> }
    ];

    let currentPath = "";
    pathnames.forEach((pathname) => {
      currentPath += `/${pathname}`;
      
      const breadcrumbMap: Record<string, string> = {
        "/pivot-pool": "Pivot Pool Management",
        "/trade-insights": "Trade Insights", 
        "/wallet": "Wallet & Transactions",
        "/wallet-transactions": "Wallet & Transactions",
        "/yields": "My Yields",
        "/settings": "Settings"
      };

      if (breadcrumbMap[currentPath]) {
        items.push({
          label: breadcrumbMap[currentPath],
          path: currentPath
        });
      }
    });

    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
      {breadcrumbItems.map((item, index) => (
        <div key={item.path} className="flex items-center space-x-2">
          {index > 0 && <ChevronRight className="w-4 h-4" />}
          
          {index === breadcrumbItems.length - 1 ? (
            <span className="flex items-center space-x-1 text-card-foreground font-medium">
              {item.icon}
              <span>{item.label}</span>
            </span>
          ) : (
            <Link
              to={item.path}
              className="flex items-center space-x-1 hover:text-card-foreground transition-colors"
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumbs;