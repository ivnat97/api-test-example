import * as dotenv from 'dotenv';
import axios, { AxiosResponse, AxiosInstance, Method } from 'axios';
import * as store from 'store';
import * as FormData from 'form-data';
import { Context } from 'mocha';
import ReportHelper from '../helper/report.helper';

dotenv.config();

export default class BaseController {
  protected api: AxiosInstance;

  constructor(context: Context) {
    this.api = axios.create({
      baseURL: process.env.BASE_URL,
    });

    this.api.interceptors.request.use((config) => {
      const token = store.get('token');
      // eslint-disable-next-line
      config.headers.Authorization = token ? `Bearer ${token}` : '';
      ReportHelper.logRequest(context, config);
      return config;
    });

    this.api.interceptors.response.use((response) => {
      ReportHelper.logResponse(context, response);
      return response;
    }, (error) => {
      ReportHelper.logError(context, error);
      return error.response ? Promise.resolve(error.response) : Promise.reject(error.request);
    });
  }

  public async post<T>(endpoint: string, body: T): Promise<AxiosResponse> {
    return this.api.post(endpoint, body);
  }

  public async formDataRequest(method: Method, endpoint: string, body: FormData): Promise<AxiosResponse> {
    return this.api.request({
      method,
      url: endpoint,
      headers: body.getHeaders(),
      data: body,
    });
  }

  public async put<T>(endpoint: string, id: number, body?: T): Promise<AxiosResponse> {
    const path = `${endpoint}/${id}`;
    return this.api.put(path, body);
  }

  public async get(endpoint: string, id?: number): Promise<AxiosResponse> {
    const path = id ? `${endpoint}/${id}` : endpoint;
    return this.api.get(path);
  }

  public async delete(endpoint: string, id: number): Promise<AxiosResponse> {
    const path = `${endpoint}/${id}`;
    return this.api.delete(path);
  }
}
