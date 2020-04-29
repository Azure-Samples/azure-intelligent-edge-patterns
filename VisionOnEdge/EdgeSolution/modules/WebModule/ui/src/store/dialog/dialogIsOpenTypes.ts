export const OPEN_DIALOG = 'OPEN_DIALOG';
export const CLOSE_DIALOG = 'CLOSE_DIALOG';
export type OpenDialog = { type: typeof OPEN_DIALOG };
export type CloseDialog = { type: typeof CLOSE_DIALOG };
export type DialogIsOpenAction = OpenDialog | CloseDialog;
