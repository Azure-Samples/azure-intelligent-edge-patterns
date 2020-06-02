import { DropdownItemProps } from '@fluentui/react-northstar';

export type Value = { id: number; name: string } | { id: number; name: string }[];

export const formatDropdownValue = (value: Value): DropdownItemProps | DropdownItemProps[] => {
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
