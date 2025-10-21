'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from 'lucide-react';
import moment from 'moment-jalaali';

// Configure moment-jalaali
moment.loadPersian({ dialect: 'persian-modern' });

interface PersianDatePickerProps {
  value?: string;
  onChange?: (date: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function PersianDatePicker({
  value,
  onChange,
  placeholder = 'انتخاب تاریخ',
  className,
  disabled = false
}: PersianDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [currentViewDate, setCurrentViewDate] = useState(() => {
    if (value) {
      const parts = value.split('/');
      if (parts.length === 3) {
        const jYear = parseInt(parts[0]);
        const jMonth = parseInt(parts[1]);
        const jDay = parseInt(parts[2]);
        return moment().jYear(jYear).jMonth(jMonth - 1).jDate(jDay);
      }
    }
    return moment();
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Validate Persian date format (YYYY/MM/DD)
    const persianDateRegex = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/;
    if (persianDateRegex.test(newValue)) {
      onChange?.(newValue);
    }
  };

  const handleTodayClick = () => {
    const today = moment().format('jYYYY/jMM/jDD');
    setInputValue(today);
    onChange?.(today);
    setIsOpen(false);
  };

  const generateCalendarDays = () => {
    const startOfMonth = currentViewDate.clone().startOf('jMonth');
    const endOfMonth = currentViewDate.clone().endOf('jMonth');
    const startOfWeek = startOfMonth.clone().startOf('week');
    const endOfWeek = endOfMonth.clone().endOf('week');

    const days = [];
    const current = startOfWeek.clone();

    while (current.isSameOrBefore(endOfWeek)) {
      days.push(current.clone());
      current.add(1, 'day');
    }

    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentViewDate(prev => prev.clone().subtract(1, 'jMonth'));
  };

  const goToNextMonth = () => {
    setCurrentViewDate(prev => prev.clone().add(1, 'jMonth'));
  };

  const handleDateClick = (date: moment.Moment) => {
    const formattedDate = date.format('jYYYY/jMM/jDD');
    setInputValue(formattedDate);
    onChange?.(formattedDate);
    setIsOpen(false);
  };

  const calendarDays = generateCalendarDays();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            value={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={`pr-10 ${className}`}
            disabled={disabled}
            dir="rtl"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
          >
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousMonth}
                className="h-8 w-8 p-0"
              >
                ‹
              </Button>
              <h4 className="font-medium font-vazir min-w-[120px] text-center">
                {currentViewDate.format('jMMMM jYYYY')}
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextMonth}
                className="h-8 w-8 p-0"
              >
                ›
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTodayClick}
              className="font-vazir"
            >
              امروز
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map((day) => (
              <div
                key={day}
                className="h-8 w-8 flex items-center justify-center text-sm font-medium text-muted-foreground font-vazir"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const isCurrentMonth = day.jMonth() === currentViewDate.jMonth();
              const isSelected = value && day.format('jYYYY/jMM/jDD') === value;
              const isToday = day.isSame(moment(), 'day');

              return (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className={`h-8 w-8 p-0 font-vazir ${!isCurrentMonth ? 'text-muted-foreground opacity-50' : ''
                    } ${isSelected ? 'bg-primary text-primary-foreground' : ''
                    } ${isToday ? 'bg-accent text-accent-foreground' : ''
                    }`}
                  onClick={() => handleDateClick(day)}
                >
                  {day.format('jDD')}
                </Button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}