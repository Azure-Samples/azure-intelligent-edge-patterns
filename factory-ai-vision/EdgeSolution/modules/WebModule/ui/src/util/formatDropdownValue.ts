import { DropdownItemProps } from '@fluentui/react-northstar';

export const formatDropdownValue = (value): DropdownItemProps | DropdownItemProps[] => {
  if (Array.isArray(value)) {
    return value.map((e) => ({
      header: e.name,
      content: {
        key: e.id,
      },
    }));
  }
  if (value) {
    return {
      header: value.name,
      content: {
        key: value.id,
      },
    };
  }
  return null;
};
