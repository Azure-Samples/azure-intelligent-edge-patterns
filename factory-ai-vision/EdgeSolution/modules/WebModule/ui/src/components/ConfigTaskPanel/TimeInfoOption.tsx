import React, { useCallback, useState, useEffect } from 'react';
import { DatePicker, IDatePickerStrings, Dropdown, IDropdownOption, Stack, Text } from '@fluentui/react';
import { isSameDay } from 'date-fns';

import { OptionLayout } from './OptionLayout';
import { OnChangeType } from './type';

const DayPickerStrings: IDatePickerStrings = {
  months: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  shortDays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  goToToday: 'Go to today',
};

const getDropdownTime = (date: Date, hour) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour).toString();
};

type Props = {
  countingStartTime: string;
  countingEndTime: string;
  onChange: OnChangeType;
};

export const TimeInfoOption = ({ countingStartTime, countingEndTime, onChange }: Props) => {
  const [localStartTime, setLocalStartTime] = useState(new Date(countingStartTime));
  const [localEndTime, setLocalEndTime] = useState(new Date(countingEndTime));

  useEffect(() => {
    setLocalStartTime(new Date(countingStartTime));
  }, [countingStartTime]);

  useEffect(() => {
    setLocalEndTime(new Date(countingEndTime));
  }, [countingEndTime]);

  const startTimeOptions: IDropdownOption[] = new Array(24).fill(0).map((_, idx) => {
    if (isSameDay(localStartTime, new Date()) && idx < new Date().getHours()) {
      return {
        key: idx,
        text: `${idx < 10 ? `0${idx}` : idx}:00`,
        disabled: true,
      };
    }

    return {
      key: idx,
      text: `${idx < 10 ? `0${idx}` : idx}:00`,
    };
  });

  const endTimeOptions: IDropdownOption[] = new Array(24).fill(0).map((_, idx) => {
    if (isSameDay(localEndTime, new Date()) && idx < new Date().getHours()) {
      return {
        key: idx,
        text: `${idx < 10 ? `0${idx}` : idx}:00`,
        disabled: true,
      };
    }

    return {
      key: idx,
      text: `${idx < 10 ? `0${idx}` : idx}:00`,
    };
  });

  const onSelectStartDate = useCallback(
    (date?: Date | null) => {
      if (!date) return;

      if (isSameDay(localStartTime, new Date())) {
        onChange('countingStartTime', getDropdownTime(date, new Date().getHours));
      }

      onChange('countingStartTime', date.toString());
    },
    [onChange, localStartTime],
  );

  const onSelectEndDate = useCallback(
    (date?: Date | null) => {
      if (!date) return;

      if (isSameDay(localStartTime, new Date())) {
        onChange('countingEndTime', getDropdownTime(date, new Date().getHours));
      }

      onChange('countingEndTime', date.toString());
    },
    [onChange, localStartTime],
  );

  const onStartTimeChange = useCallback(
    (_: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
      onChange('countingStartTime', getDropdownTime(localStartTime, option.key));
    },
    [localStartTime, onChange],
  );

  const onEndTimeChange = (_: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
    onChange('countingEndTime', getDropdownTime(localEndTime, option.key));
  };

  return (
    <OptionLayout title="Time Info">
      <Stack tokens={{ childrenGap: '10px' }} horizontal verticalAlign="center">
        <Text>Start</Text>
        <DatePicker
          showMonthPickerAsOverlay={true}
          strings={DayPickerStrings}
          value={localStartTime}
          placeholder="Select a date..."
          ariaLabel="Select a date"
          onSelectDate={onSelectStartDate}
          minDate={new Date()}
        />
        <Dropdown
          defaultSelectedKey={localStartTime.getHours()}
          options={startTimeOptions}
          onChange={onStartTimeChange}
        />
      </Stack>
      <Stack tokens={{ childrenGap: '10px' }} horizontal verticalAlign="center">
        <Text style={{ marginRight: '6px' }}>End</Text>
        <DatePicker
          showMonthPickerAsOverlay={true}
          strings={DayPickerStrings}
          value={localEndTime}
          placeholder="Select a date..."
          ariaLabel="Select a date"
          onSelectDate={onSelectEndDate}
          minDate={new Date()}
        />
        <Dropdown
          defaultSelectedKey={localEndTime.getHours()}
          options={endTimeOptions}
          onChange={onEndTimeChange}
        />
      </Stack>
    </OptionLayout>
  );
};
