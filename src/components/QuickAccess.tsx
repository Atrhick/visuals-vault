import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, Star, Zap, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface QuickAccessItem {
  id: string;
  title: string;
  path: string;
  timestamp: number;
  type: "recent" | "favorite" | "quick";
}

const QuickAccess = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [recentItems, setRecentItems] = useState<QuickAccessItem[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<QuickAccessItem[]>([]);
  const location = useLocation();

  // Quick action items
  const quickActions: QuickAccessItem[] = [
    { id: "trade", title: "Quick Trade", path: "/trade-insights", timestamp: Date.now(), type: "quick" },
    { id: "wallet", title: "Add Transaction", path: "/wallet", timestamp: Date.now(), type: "quick" },
    { id: "yield", title: "Stake Assets", path: "/yields", timestamp: Date.now(), type: "quick" },
    { id: "pool", title: "Invest in Pool", path: "/pivot-pool", timestamp: Date.now(), type: "quick" }
  ];

  // Track recent visits
  useEffect(() => {
    const pageMap: Record<string, string> = {
      "/": "Dashboard Overview",
      "/pivot-pool": "Pivot Pool Management",
      "/trade-insights": "Trade Insights",
      "/wallet": "Wallet & Transactions",
      "/yields": "My Yields",
      "/settings": "Settings"
    };

    const currentPage = pageMap[location.pathname];
    if (currentPage) {
      const newItem: QuickAccessItem = {
        id: location.pathname,
        title: currentPage,
        path: location.pathname,
        timestamp: Date.now(),
        type: "recent"
      };

      setRecentItems(prev => {
        const filtered = prev.filter(item => item.id !== newItem.id);
        return [newItem, ...filtered].slice(0, 5);
      });
    }
  }, [location.pathname]);

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("pivot-favorites");
    if (saved) {
      try {
        setFavoriteItems(JSON.parse(saved));
      } catch (error) {
        console.error("Failed to load favorites:", error);
      }
    }
  }, []);

  // Save favorites to localStorage
  const toggleFavorite = (item: QuickAccessItem) => {
    const newFavorites = favoriteItems.some(fav => fav.id === item.id)
      ? favoriteItems.filter(fav => fav.id !== item.id)
      : [...favoriteItems, { ...item, type: "favorite" }];
    
    setFavoriteItems(newFavorites);
    localStorage.setItem("pivot-favorites", JSON.stringify(newFavorites));
  };

  const isFavorite = (itemId: string) => favoriteItems.some(fav => fav.id === itemId);

  // Keyboard shortcut to toggle quick access
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="sm"
        variant="outline"
        className="fixed bottom-4 right-4 z-50 bg-card border-border shadow-lg hover:shadow-xl transition-all"
      >
        <Zap className="w-4 h-4 mr-2" />
        Quick Access
        <span className="ml-2 text-xs text-muted-foreground">⌘K</span>
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
      <Card className="w-full max-w-2xl bg-card border-border shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-card-foreground">Quick Access</h2>
          <Button
            onClick={() => setIsOpen(false)}
            size="sm"
            variant="ghost"
            data-close-modal="true"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 space-y-6">
          {/* Quick Actions */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <Link
                  key={action.id}
                  to={action.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex-1">
                    <div className="font-medium text-card-foreground group-hover:text-primary transition-colors">
                      {action.title}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite(action);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Star className={`w-3 h-3 ${isFavorite(action.id) ? 'fill-current text-yellow-500' : ''}`} />
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          {/* Favorites */}
          {favoriteItems.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Favorites
              </h3>
              <div className="space-y-1">
                {favoriteItems.map((item) => (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <Star className="w-3 h-3 fill-current text-yellow-500" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-card-foreground group-hover:text-primary transition-colors">
                        {item.title}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(item);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recent */}
          {recentItems.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recently Visited
              </h3>
              <div className="space-y-1">
                {recentItems.map((item) => (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-card-foreground group-hover:text-primary transition-colors">
                        {item.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(item);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Star className={`w-3 h-3 ${isFavorite(item.id) ? 'fill-current text-yellow-500' : ''}`} />
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border text-center">
          <div className="text-xs text-muted-foreground">
            Press <span className="font-mono bg-muted px-1 rounded">⌘K</span> to toggle • <span className="font-mono bg-muted px-1 rounded">Esc</span> to close
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QuickAccess;