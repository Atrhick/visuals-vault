import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight, Plus, ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, X, ChevronDown } from "lucide-react";

interface Wallet {
  id: string;
  name: string;
  balance: string;
  currency: string;
}

interface Transaction {
  id: string;
  type: "Deposit" | "Withdraw";
  date: string;
  asset: {
    name: string;
    icon: string;
    color: string;
  };
  status: "Completed" | "Pending" | "Rejected";
  amount: string;
}

const wallets: Wallet[] = [
  { id: "1", name: "Main Wallet", balance: "11,000.00", currency: "UNDEAD" },
  { id: "2", name: "XYZ Wallet", balance: "150.00", currency: "UNDEAD" }
];

const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "Deposit",
    date: "07.11.2024, 11:45 AM",
    asset: { name: "Ethereum", icon: "♦", color: "bg-black" },
    status: "Completed",
    amount: "+100.00 UNDEAD"
  },
  {
    id: "2",
    type: "Withdraw",
    date: "07.11.2024, 11:45 AM",
    asset: { name: "CoinMarket", icon: "◉", color: "bg-blue-500" },
    status: "Pending",
    amount: "-50.00 UNDEAD"
  },
  {
    id: "3",
    type: "Deposit",
    date: "07.11.2024, 11:45 AM",
    asset: { name: "Bitcoin", icon: "₿", color: "bg-orange-500" },
    status: "Completed",
    amount: "+100.00 UNDEAD"
  },
  {
    id: "4",
    type: "Withdraw",
    date: "07.11.2024, 11:45 AM",
    asset: { name: "UNDEAD", icon: "●", color: "bg-red-500" },
    status: "Completed",
    amount: "-50.00 UNDEAD"
  },
  {
    id: "5",
    type: "Deposit",
    date: "07.11.2024, 11:45 AM",
    asset: { name: "Ethereum", icon: "♦", color: "bg-black" },
    status: "Pending",
    amount: "+100.00 UNDEAD"
  },
  {
    id: "6",
    type: "Withdraw",
    date: "07.11.2024, 11:45 AM",
    asset: { name: "CoinMarket", icon: "◉", color: "bg-blue-500" },
    status: "Rejected",
    amount: "-50.00 UNDEAD"
  },
  {
    id: "7",
    type: "Deposit",
    date: "07.11.2024, 11:45 AM",
    asset: { name: "UNDEAD", icon: "●", color: "bg-red-500" },
    status: "Completed",
    amount: "+100.00 UNDEAD"
  },
  {
    id: "8",
    type: "Withdraw",
    date: "07.11.2024, 11:45 AM",
    asset: { name: "Bitcoin", icon: "₿", color: "bg-orange-500" },
    status: "Completed",
    amount: "-50.00 UNDEAD"
  },
  {
    id: "9",
    type: "Deposit",
    date: "07.11.2024, 11:45 AM",
    asset: { name: "Ethereum", icon: "♦", color: "bg-black" },
    status: "Rejected",
    amount: "+100.00 UNDEAD"
  },
  {
    id: "10",
    type: "Withdraw",
    date: "07.11.2024, 11:45 AM",
    asset: { name: "UNDEAD", icon: "●", color: "bg-red-500" },
    status: "Completed",
    amount: "-50.00 UNDEAD"
  }
];

const WalletTransactions = () => {
  const [selectedType, setSelectedType] = useState("all");
  const [selectedAsset, setSelectedAsset] = useState("all");
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);
  const [isTransactionDetailsOpen, setIsTransactionDetailsOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [newTransactionType, setNewTransactionType] = useState("Withdrawal");
  const [newTransactionAsset, setNewTransactionAsset] = useState("UNDEAD");
  const [newTransactionAmount, setNewTransactionAmount] = useState("0");
  const [transactionFee] = useState("0.00");
  const [waitingPeriods] = useState("-");
  const [newWalletName, setNewWalletName] = useState("");
  const [newWalletBalance, setNewWalletBalance] = useState("");
  
  const filteredTransactions = mockTransactions.filter(transaction => {
    const typeMatch = selectedType === "all" || transaction.type === selectedType;
    const assetMatch = selectedAsset === "all" || transaction.asset.name === selectedAsset;
    return typeMatch && assetMatch;
  });
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">Completed</span>;
      case "Pending":
        return <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">Pending</span>;
      case "Rejected":
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">{status}</span>;
    }
  };
  
  const handleAddTransaction = () => {
    // Add transaction logic here
    setIsAddTransactionOpen(false);
    setNewTransactionType("Withdrawal");
    setNewTransactionAsset("UNDEAD");
    setNewTransactionAmount("0");
  };
  
  const calculateTotal = () => {
    const amount = parseFloat(newTransactionAmount) || 0;
    const fee = parseFloat(transactionFee) || 0;
    return (amount + fee).toFixed(2);
  };
  
  const handleAddWallet = () => {
    // Add wallet logic here
    setIsAddWalletOpen(false);
    setNewWalletName("");
    setNewWalletBalance("");
  };
  
  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsTransactionDetailsOpen(true);
  };

  return (
    <DashboardLayout title="Wallet & Transactions">
      <div className="p-6 space-y-6 bg-background min-h-screen">
        {/* Wallet Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {wallets.map((wallet) => (
            <Card key={wallet.id} className="p-6 bg-card border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm text-muted-foreground mb-1">{wallet.name}</h3>
                  <p className="text-2xl font-bold text-card-foreground">{wallet.balance} {wallet.currency}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-card-foreground transition-colors" />
              </div>
            </Card>
          ))}
          
          {/* Add Wallet Card */}
          <Card 
            className="p-6 border-2 border-dashed border-primary/30 bg-transparent hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
            onClick={() => setIsAddWalletOpen(true)}
          >
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <span className="font-medium text-primary">Add wallet</span>
            </div>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="p-6 bg-card border-border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-card-foreground">Recent Transactions</h2>
            
            <div className="flex items-center gap-4">
              {/* Filters */}
              <div className="flex items-center gap-3">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-32 bg-input border-border">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Deposit">Deposit</SelectItem>
                    <SelectItem value="Withdraw">Withdraw</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                  <SelectTrigger className="w-32 bg-input border-border">
                    <SelectValue placeholder="Asset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Assets</SelectItem>
                    <SelectItem value="Ethereum">Ethereum</SelectItem>
                    <SelectItem value="Bitcoin">Bitcoin</SelectItem>
                    <SelectItem value="CoinMarket">CoinMarket</SelectItem>
                    <SelectItem value="UNDEAD">UNDEAD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={() => setIsAddTransactionOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            </div>
          </div>
          
          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Asset</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-3 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-right py-3 text-sm font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr 
                    key={transaction.id} 
                    className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => handleTransactionClick(transaction)}
                  >
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        {transaction.type === "Deposit" ? (
                          <ArrowUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ArrowDown className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="text-muted-foreground">{transaction.type}</span>
                      </div>
                    </td>
                    <td className="py-4 text-card-foreground">{transaction.date}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-full ${transaction.asset.color} flex items-center justify-center text-white text-xs`}>
                          {transaction.asset.icon}
                        </div>
                        <span className="text-card-foreground">{transaction.asset.name}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="py-4 text-right">
                      <span className={`font-medium ${
                        transaction.amount.startsWith("+") ? "text-green-600" : "text-red-600"
                      }`}>
                        {transaction.amount}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <Button variant="ghost" size="icon" className="w-8 h-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <span className="text-sm text-muted-foreground">180 results shown</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Transaction Details Modal */}
      <Dialog open={isTransactionDetailsOpen} onOpenChange={setIsTransactionDetailsOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-card-foreground">Transaction Details</DialogTitle>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Type</span>
                <span className="text-sm font-medium text-card-foreground">{selectedTransaction.type}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Date</span>
                <span className="text-sm font-medium text-card-foreground">{selectedTransaction.date}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Asset</span>
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full ${selectedTransaction.asset.color} flex items-center justify-center text-white text-xs`}>
                    {selectedTransaction.asset.icon}
                  </div>
                  <span className="text-sm font-medium text-card-foreground">{selectedTransaction.asset.name}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <div>{getStatusBadge(selectedTransaction.status)}</div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className={`text-sm font-medium ${
                  selectedTransaction.amount.startsWith("+") ? "text-green-600" : "text-red-600"
                }`}>
                  {selectedTransaction.amount}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Transaction Modal */}
      <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader className="flex flex-row items-center justify-between p-0">
            <DialogTitle className="text-lg font-semibold text-card-foreground">Add Transaction</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Transaction Type Toggle */}
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={newTransactionType === "Withdrawal" ? "default" : "ghost"}
                onClick={() => setNewTransactionType("Withdrawal")}
                className="flex-1 h-10 text-sm font-medium"
              >
                Withdrawal
              </Button>
              <Button
                variant={newTransactionType === "Deposit" ? "default" : "ghost"}
                onClick={() => setNewTransactionType("Deposit")}
                className="flex-1 h-10 text-sm font-medium"
              >
                Deposit
              </Button>
            </div>
            
            {/* Amount */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-card-foreground">Amount</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={newTransactionAmount}
                  onChange={(e) => setNewTransactionAmount(e.target.value)}
                  className="flex-1 bg-input border-border text-lg h-12"
                />
                <Select value={newTransactionAsset} onValueChange={setNewTransactionAsset}>
                  <SelectTrigger className="w-20 bg-input border-border h-12">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
                        •
                      </div>
                      <ChevronDown className="w-3 h-3" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNDEAD">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
                          •
                        </div>
                        <span>UNDEAD</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Ethereum">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center text-white text-xs">
                          ♦
                        </div>
                        <span>Ethereum</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Bitcoin">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs">
                          ₿
                        </div>
                        <span>Bitcoin</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="CoinMarket">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                          ◉
                        </div>
                        <span>CoinMarket</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Transaction Details */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Transaction Fee</span>
                <span className="text-sm text-card-foreground">{transactionFee} UNDEAD</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Waiting Periods</span>
                <span className="text-sm text-card-foreground">{waitingPeriods}</span>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="text-sm font-medium text-card-foreground">Total</span>
                <span className="text-sm font-medium text-card-foreground">{calculateTotal()} UNDEAD</span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setIsAddTransactionOpen(false)}
                className="flex-1 h-11"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddTransaction}
                className="flex-1 h-11 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Add Transaction
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Wallet Modal */}
      <Dialog open={isAddWalletOpen} onOpenChange={setIsAddWalletOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader className="flex flex-row items-center justify-between p-0">
            <DialogTitle className="text-lg font-semibold text-card-foreground">Connect New Wallet</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Wallet Options Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  // Handle MetaMask connection
                  setIsAddWalletOpen(false);
                }}
                className="p-4 h-auto flex flex-col items-center gap-3 hover:border-primary hover:bg-primary/5 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                  <span className="text-white text-lg">🦊</span>
                </div>
                <span className="font-medium text-sm text-card-foreground">
                  MetaMask
                </span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  // Handle WalletConnect connection
                  setIsAddWalletOpen(false);
                }}
                className="p-4 h-auto flex flex-col items-center gap-3 hover:border-primary hover:bg-primary/5 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-lg">🔗</span>
                </div>
                <span className="font-medium text-sm text-card-foreground">
                  WalletConnect
                </span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  // Handle Coinbase Wallet connection
                  setIsAddWalletOpen(false);
                }}
                className="p-4 h-auto flex flex-col items-center gap-3 hover:border-primary hover:bg-primary/5 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-lg">◉</span>
                </div>
                <span className="font-medium text-sm text-card-foreground">
                  Coinbase Wallet
                </span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  // Handle Rainbow Wallet connection
                  setIsAddWalletOpen(false);
                }}
                className="p-4 h-auto flex flex-col items-center gap-3 hover:border-primary hover:bg-primary/5 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white text-lg">🌈</span>
                </div>
                <span className="font-medium text-sm text-card-foreground">
                  Rainbow Wallet
                </span>
              </Button>
            </div>
            
            {/* Terms */}
            <p className="text-xs text-muted-foreground text-center">
              By connecting your wallet, you agree to Terms of Service and Privacy Policy.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default WalletTransactions;