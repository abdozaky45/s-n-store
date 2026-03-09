export default interface IUserAuthentication {
  email?: string;
  activeCode?: string;
  role: string;
  codeCreatedAt?: number;
}
