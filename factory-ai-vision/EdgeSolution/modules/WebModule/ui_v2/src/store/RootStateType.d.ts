/**
 * Use declaration file to avoid circular imports.
 */

declare module 'RootStateType' {
  export type State = ReturnType<typeof import('./rootReducer').rootReducer>;
}
