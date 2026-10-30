export interface AuthActionState {
  message?: string;
  submitted?: boolean;
  fieldErrors?: { email?: string; password?: string; passwordConfirmation?: string };
}
