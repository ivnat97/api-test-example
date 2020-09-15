export default interface IAuth {
  token: string;
  refreshToken: string;
  expireIn?: number;
}
