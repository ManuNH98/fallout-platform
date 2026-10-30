export interface AuthActionState {
  message?: string;
  fieldErrors?: { email?: string; password?: string };
}
