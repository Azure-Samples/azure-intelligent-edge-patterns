import { OpenDialog, CloseDialog, OPEN_DIALOG, CLOSE_DIALOG } from './dialogIsOpenTypes';

export const openDialog = (): OpenDialog => ({ type: OPEN_DIALOG });
export const closeDialog = (): CloseDialog => ({ type: CLOSE_DIALOG });
