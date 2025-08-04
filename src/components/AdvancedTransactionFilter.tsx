import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Filter, Calendar as CalendarIcon, X, Download, Trash2, Archive, Tag } from "lucide-react";
import { format } from "date-fns";

interface FilterCriteria {
  dateFrom?: Date;
  dateTo?: Date;
  amountMin?: string;
  amountMax?: string;
  types: string[];
  currencies: string[];
  status: string[];
  tags: string[];
  searchTerm: string;
}

interface AdvancedTransactionFilterProps {
  onApplyFilters: (filters: FilterCriteria) => void;
  onBulkAction: (action: string, selectedIds: string[]) => void;
  selectedTransactions: string[];
  totalTransactions: number;
}

const AdvancedTransactionFilter = ({ 
  onApplyFilters, 
  onBulkAction, 
  selectedTransactions, 
  totalTransactions 
}: AdvancedTransactionFilterProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterCriteria>({
    types: [],
    currencies: [],
    status: [],
    tags: [],
    searchTerm: ""
  });

  const transactionTypes = [
    { id: "deposit", label: "Deposit" },
    { id: "withdraw", label: "Withdraw" },
    { id: "trade", label: "Trade" },
    { id: "stake", label: "Stake" },
    { id: "unstake", label: "Unstake" },
    { id: "claim", label: "Claim Rewards" }
  ];

  const currencies = [
    { id: "ethereum", label: "ETH" },
    { id: "bitcoin", label: "BTC" },
    { id: "undead", label: "UNDEAD" },
    { id: "usdc", label: "USDC" }
  ];

  const statusOptions = [
    { id: "completed", label: "Completed" },
    { id: "pending", label: "Pending" },
    { id: "failed", label: "Failed" },
    { id: "cancelled", label: "Cancelled" }
  ];

  const availableTags = [
    { id: "high-value", label: "High Value" },
    { id: "recurring", label: "Recurring" },
    { id: "emergency", label: "Emergency" },
    { id: "investment", label: "Investment" },
    { id: "profit-taking", label: "Profit Taking" }
  ];

  const handleFilterChange = (key: keyof FilterCriteria, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleArrayFilterChange = (key: keyof FilterCriteria, value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [key]: checked 
        ? [...(prev[key] as string[]), value]
        : (prev[key] as string[]).filter(item => item !== value)
    }));
  };

  const applyFilters = () => {
    onApplyFilters(filters);
    setIsFilterOpen(false);
  };

  const clearFilters = () => {
    const clearedFilters: FilterCriteria = {
      types: [],
      currencies: [],
      status: [],
      tags: [],
      searchTerm: ""
    };
    setFilters(clearedFilters);
    onApplyFilters(clearedFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.dateFrom || filters.dateTo) count++;
    if (filters.amountMin || filters.amountMax) count++;
    if (filters.types.length > 0) count++;
    if (filters.currencies.length > 0) count++;
    if (filters.status.length > 0) count++;
    if (filters.tags.length > 0) count++;
    if (filters.searchTerm) count++;
    return count;
  };

  const bulkActions = [
    { id: "export", label: "Export Selected", icon: <Download className="w-4 h-4" /> },
    { id: "archive", label: "Archive", icon: <Archive className="w-4 h-4" /> },
    { id: "delete", label: "Delete", icon: <Trash2 className="w-4 h-4" />, variant: "destructive" },
    { id: "tag", label: "Add Tag", icon: <Tag className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Input
            placeholder="Search transactions..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
            className="max-w-xs"
          />
          
          <Button 
            variant="outline" 
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-1">
                {getActiveFilterCount()}
              </Badge>
            )}
          </Button>

          {getActiveFilterCount() > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedTransactions.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedTransactions.length} of {totalTransactions} selected
            </span>
            
            <Select onValueChange={(action) => onBulkAction(action, selectedTransactions)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Bulk Actions" />
              </SelectTrigger>
              <SelectContent>
                {bulkActions.map((action) => (
                  <SelectItem key={action.id} value={action.id}>
                    <div className="flex items-center gap-2">
                      {action.icon}
                      {action.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Active Filter Tags */}
      {getActiveFilterCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.dateFrom && (
            <Badge variant="secondary" className="flex items-center gap-1">
              From: {format(filters.dateFrom, "MMM d, yyyy")}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => handleFilterChange("dateFrom", undefined)}
              />
            </Badge>
          )}
          
          {filters.dateTo && (
            <Badge variant="secondary" className="flex items-center gap-1">
              To: {format(filters.dateTo, "MMM d, yyyy")}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => handleFilterChange("dateTo", undefined)}
              />
            </Badge>
          )}

          {filters.types.map(type => (
            <Badge key={type} variant="secondary" className="flex items-center gap-1">
              Type: {transactionTypes.find(t => t.id === type)?.label}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => handleArrayFilterChange("types", type, false)}
              />
            </Badge>
          ))}

          {filters.currencies.map(currency => (
            <Badge key={currency} variant="secondary" className="flex items-center gap-1">
              {currencies.find(c => c.id === currency)?.label}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => handleArrayFilterChange("currencies", currency, false)}
              />
            </Badge>
          ))}

          {filters.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {availableTags.find(t => t.id === tag)?.label}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => handleArrayFilterChange("tags", tag, false)}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Advanced Filter Dialog */}
      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent className="max-w-2xl bg-card border-border max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Advanced Filters</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Date Range */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Date Range</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateFrom ? format(filters.dateFrom, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateFrom}
                        onSelect={(date) => handleFilterChange("dateFrom", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>To</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateTo ? format(filters.dateTo, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateTo}
                        onSelect={(date) => handleFilterChange("dateTo", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Amount Range */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Amount Range</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Minimum</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={filters.amountMin || ""}
                    onChange={(e) => handleFilterChange("amountMin", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Maximum</Label>
                  <Input
                    type="number"
                    placeholder="1000.00"
                    value={filters.amountMax || ""}
                    onChange={(e) => handleFilterChange("amountMax", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Transaction Types */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Transaction Types</Label>
              <div className="grid grid-cols-2 gap-4">
                {transactionTypes.map((type) => (
                  <div key={type.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={type.id}
                      checked={filters.types.includes(type.id)}
                      onCheckedChange={(checked) => 
                        handleArrayFilterChange("types", type.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={type.id}>{type.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Currencies */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Currencies</Label>
              <div className="grid grid-cols-2 gap-4">
                {currencies.map((currency) => (
                  <div key={currency.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={currency.id}
                      checked={filters.currencies.includes(currency.id)}
                      onCheckedChange={(checked) => 
                        handleArrayFilterChange("currencies", currency.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={currency.id}>{currency.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Status</Label>
              <div className="grid grid-cols-2 gap-4">
                {statusOptions.map((status) => (
                  <div key={status.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={status.id}
                      checked={filters.status.includes(status.id)}
                      onCheckedChange={(checked) => 
                        handleArrayFilterChange("status", status.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={status.id}>{status.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Tags</Label>
              <div className="grid grid-cols-2 gap-4">
                {availableTags.map((tag) => (
                  <div key={tag.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={tag.id}
                      checked={filters.tags.includes(tag.id)}
                      onCheckedChange={(checked) => 
                        handleArrayFilterChange("tags", tag.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={tag.id}>{tag.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsFilterOpen(false)}>
              Cancel
            </Button>
            <Button onClick={clearFilters} variant="ghost">
              Clear All
            </Button>
            <Button onClick={applyFilters}>
              Apply Filters
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdvancedTransactionFilter;