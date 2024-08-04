import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import lightClasses from './Statistics.module.css';
import darkClasses from './StatisticsDark.module.css';
import { format, startOfWeek, startOfMonth, startOfYear, getDaysInMonth, isLeapYear } from 'date-fns';

function SummaryStatistics({ loglist }) {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode)
  const classes = isDarkMode ? darkClasses : lightClasses;

  const [selectedSummaryOption, setSelectedSummaryOption] = useState('day');
  const [selectedSummaryDate, setSelectedSummaryDate] = useState('');
  const [statistics, setStatistics] = useState({ users: 0, issues: 0, logs: 0, averageIssues: 0 });

  useEffect(() => {
    setDefaultSummaryDate();
  }, [selectedSummaryOption]);

  useEffect(() => {
    calculateStatistics();
  }, [selectedSummaryDate, selectedSummaryOption, loglist]);

  const setDefaultSummaryDate = () => {
    const today = new Date();
    if (selectedSummaryOption === 'day') {
      setSelectedSummaryDate(format(today, 'yyyy-MM-dd'));
    } else if (selectedSummaryOption === 'week') {
      setSelectedSummaryDate(format(startOfWeek(today), 'yyyy-MM-dd'));
    } else if (selectedSummaryOption === 'month') {
      setSelectedSummaryDate(format(startOfMonth(today), 'yyyy-MM'));
    } else if (selectedSummaryOption === 'year') {
      setSelectedSummaryDate(format(startOfYear(today), 'yyyy'));
    }
  };

  const handleSummaryOption = (event) => {
    setSelectedSummaryOption(event.target.value);
  };

  const handleSummaryDateChange = (event) => {
    setSelectedSummaryDate(event.target.value);
  };

  const calculateStatistics = () => {
    let filteredLogs = loglist.filter(log => {
      if (selectedSummaryOption === 'day') {
        return log.date === selectedSummaryDate;
      } else if (selectedSummaryOption === 'week') {
        const selectedDateObj = new Date(selectedSummaryDate);
        const logDateObj = new Date(log.date);
        const diffDays = (logDateObj - selectedDateObj) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays < 7;
      } else if (selectedSummaryOption === 'month') {
        return log.date && selectedSummaryDate && log.date.startsWith(selectedSummaryDate);
      } else if (selectedSummaryOption === 'year') {
        return log.date && selectedSummaryDate && log.date.startsWith(selectedSummaryDate);
      }
      return false;
    });

    const uniqueUsers = new Set(filteredLogs.map(log => log.id)).size;
    const issues = filteredLogs.filter(log => log.issue === 'F').length;
    const logs = filteredLogs.length;
    const daysInPeriod = selectedSummaryOption === 'day'
      ? 1
      : selectedSummaryOption === 'week'
      ? 7
      : selectedSummaryOption === 'month'
      ? getDaysInMonth(new Date(selectedSummaryDate))
      : selectedSummaryOption === 'year'
      ? (isLeapYear(new Date(selectedSummaryDate)) ? 366 : 365)
      : 1;
    const averageIssues = issues / daysInPeriod;

    setStatistics({ users: uniqueUsers, issues, logs, averageIssues });
  };

  return (
    <div className={classes.dateStatisticsContainer}>
      <div className={classes.relativeBoxContainer}>
        <div className={classes.statisticsTitleBox}>통계 요약</div>
      </div>
      <div className={classes.statisticsContent}>
        <div className={classes.dataSelectContainer}>
          <div className={classes.axisSelectBox}>
            <div className={classes.axisSelectTitle}>선택 옵션</div>
            <div className={classes.dataSelectBox}>
              <label className={classes.labelBox}>
                <input
                  type="radio"
                  value="day"
                  checked={selectedSummaryOption === 'day'}
                  onChange={handleSummaryOption}
                />
                일
              </label>
              <label className={classes.labelBox}>
                <input
                  type="radio"
                  value="week"
                  checked={selectedSummaryOption === 'week'}
                  onChange={handleSummaryOption}
                />
                주
              </label>
              <label className={classes.labelBox}>
                <input
                  type="radio"
                  value="month"
                  checked={selectedSummaryOption === 'month'}
                  onChange={handleSummaryOption}
                />
                월
              </label>
              <label className={classes.labelBox}>
                <input
                  type="radio"
                  value="year"
                  checked={selectedSummaryOption === 'year'}
                  onChange={handleSummaryOption}
                />
                년
              </label>
            </div>
            <div className={classes.buttonContainer}>
              {selectedSummaryOption === 'year' &&
                <div className={classes.emptySpace}>EMPTY</div>
              }
              {(selectedSummaryOption === 'year' || selectedSummaryOption === 'month' || selectedSummaryOption === 'week') &&
                <div className={classes.emptySpace}>EMPTY</div>
              }
              {(selectedSummaryOption === 'year' || selectedSummaryOption === 'month') &&
                <div className={classes.emptySpace}>EMPTY</div>
              }
              {(selectedSummaryOption === 'day' || selectedSummaryOption === 'week') && (
                <input
                  className={classes.inputText}
                  type="date"
                  value={selectedSummaryDate}
                  onChange={handleSummaryDateChange}
                />
              )}
              {selectedSummaryOption === 'month' && (
                <input
                  className={classes.inputText}
                  type="month"
                  value={selectedSummaryDate}
                  onChange={handleSummaryDateChange}
                />
              )}
              {selectedSummaryOption === 'year' && (
                <input
                  className={`${classes.inputText} ${classes.yearInputText}`}
                  type="number"
                  value={selectedSummaryDate}
                  onChange={handleSummaryDateChange}
                  placeholder="년도 입력"
                />
              )}
            </div>
          </div>
        </div>
        <div>
          <div className={classes.summaryStatisticsContainer}>
            <div className={classes.statisticsCard}>
              <h3>이용자 수</h3>
              <p className={classes.value}>{statistics.users} 명</p>
            </div>
            <div className={classes.statisticsCard}>
              <h3>적발 횟수</h3>
              <p className={classes.value}>{statistics.issues} 회</p>
            </div>
            <div className={classes.statisticsCard}>
              <h3>로그 수</h3>
              <p className={classes.value}>{statistics.logs} 개</p>
            </div>
            <div className={classes.statisticsCard}>
              <h3>평균 적발률</h3>
              <p className={classes.value}>{statistics.averageIssues.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SummaryStatistics;
