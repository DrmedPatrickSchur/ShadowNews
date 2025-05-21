import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Generate pagination items
  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    // Always show first page
    items.push(1);
    
    // Calculate start and end of visible range
    let startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);
    
    // Adjust start if end is maxed out
    if (endPage === totalPages - 1) {
      startPage = Math.max(2, endPage - (maxVisiblePages - 3));
    }
    
    // Add ellipsis after first page if needed
    if (startPage > 2) {
      items.push('ellipsis1');
    }
    
    // Add visible page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      items.push('ellipsis2');
    }
    
    // Always show last page if there is more than one page
    if (totalPages > 1) {
      items.push(totalPages);
    }
    
    return items;
  };
  
  if (totalPages <= 1) {
    return null;
  }
  
  const paginationItems = generatePaginationItems();
  
  return (
    <div className="mt-8 flex justify-center">
      <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        <Button 
          variant="outline" 
          size="sm" 
          className="relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <span className="sr-only">Previous</span>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        {paginationItems.map((item, index) => {
          if (item === 'ellipsis1' || item === 'ellipsis2') {
            return (
              <span 
                key={item} 
                className="relative inline-flex items-center px-4 py-2 border text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 transition-dark"
              >
                ...
              </span>
            );
          }
          
          return (
            <Button
              key={index}
              variant={currentPage === item ? "default" : "outline"}
              size="sm"
              className="relative inline-flex items-center px-4 py-2 border text-sm font-medium"
              onClick={() => onPageChange(Number(item))}
            >
              {item}
            </Button>
          );
        })}
        
        <Button 
          variant="outline" 
          size="sm" 
          className="relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <span className="sr-only">Next</span>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </nav>
    </div>
  );
}
