'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, User, X } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
}

interface CustomerSearchProps {
  customers: Customer[];
  selectedCustomer?: Customer | null;
  onCustomerSelect: (customer: Customer | null) => void;
  placeholder?: string;
  className?: string;
}

export function CustomerSearch({ customers, selectedCustomer, onCustomerSelect, placeholder = "جستجوی مشتری...", className }: CustomerSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedCustomer) {
      setSearchTerm(selectedCustomer.name);
    } else {
      setSearchTerm('');
    }
  }, [selectedCustomer]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm) ||
        customer.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers.slice(0, 10)); // Show first 10 customers
    }
  }, [searchTerm, customers]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (customer: Customer) => {
    setSearchTerm(customer.name);
    setIsOpen(false);
    onCustomerSelect(customer);
  };

  const handleClear = () => {
    setSearchTerm('');
    onCustomerSelect(null);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pr-10 pl-10 font-vazir"
          dir="rtl"
        />
        {selectedCustomer && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredCustomers.length > 0 ? (
            <div className="py-1">
              {filteredCustomers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => handleSelect(customer)}
                  className="w-full px-3 py-2 text-right hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                >
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 text-right">
                      <div className="font-medium font-vazir text-gray-900">
                        {customer.name}
                      </div>
                      {(customer.email || customer.phone || customer.company) && (
                        <div className="text-sm text-gray-500 font-vazir">
                          {customer.company && <span>{customer.company}</span>}
                          {customer.company && (customer.email || customer.phone) && <span> • </span>}
                          {customer.email && <span>{customer.email}</span>}
                          {customer.email && customer.phone && <span> • </span>}
                          {customer.phone && <span>{customer.phone}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-3 text-center text-gray-500 font-vazir">
              {searchTerm ? 'مشتری یافت نشد' : 'مشتری موجود نیست'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}