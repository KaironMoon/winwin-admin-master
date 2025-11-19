import React from 'react';

/**
 * 기간 검색 필터 컴포넌트
 *
 * @param {Object} props
 * @param {string} props.dateRangeType - 선택된 기간 유형 (today, last7days, last15days, last30days, thismonth, all, custom)
 * @param {string} props.startDate - 시작 날짜 (YYYY-MM-DD)
 * @param {string} props.endDate - 종료 날짜 (YYYY-MM-DD)
 * @param {Function} props.onDateRangeTypeChange - 기간 유형 변경 핸들러
 * @param {Function} props.onStartDateChange - 시작 날짜 변경 핸들러
 * @param {Function} props.onEndDateChange - 종료 날짜 변경 핸들러
 */
function DateRangeFilter({
  dateRangeType,
  startDate,
  endDate,
  onDateRangeTypeChange,
  onStartDateChange,
  onEndDateChange
}) {
  return (
    <div className="flex items-center justify-end space-x-3 mt-3 pt-3 border-t border-border">
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-foreground whitespace-nowrap">
          기간 검색
        </label>
        <select
          value={dateRangeType}
          onChange={onDateRangeTypeChange}
          className="px-3 py-1.5 border border-input rounded-md bg-background text-foreground text-sm"
        >
          <option value="today">오늘</option>
          <option value="last7days">지난 7일</option>
          <option value="last15days">지난 15일</option>
          <option value="last30days">지난 30일</option>
          <option value="thismonth">이번달</option>
          <option value="all">전체</option>
          <option value="custom">기간선택</option>
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          disabled={dateRangeType !== 'custom'}
          className="px-3 py-1.5 border border-input rounded-md bg-background text-foreground text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <span className="text-sm text-muted-foreground">~</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          disabled={dateRangeType !== 'custom'}
          className="px-3 py-1.5 border border-input rounded-md bg-background text-foreground text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <span className="text-xs text-muted-foreground whitespace-nowrap">(UTC+9)</span>
      </div>
    </div>
  );
}

export default DateRangeFilter;
