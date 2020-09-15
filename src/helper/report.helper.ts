import { AxiosResponse, AxiosRequestConfig, AxiosError } from 'axios';
import { Context } from 'mocha';
import * as addContext from 'mochawesome/addContext';

export default class ReportHelper {
  static logRequest(context: Context, config: AxiosRequestConfig) : void {
    addContext(context, {
      title: 'URL',
      value: `${config.method} ${config.baseURL}${config.url}`,
    });
    addContext(context, {
      title: 'Request',
      value: {
        body: config.data,
      },
    });
  }

  static logResponse(context: Context, response: AxiosResponse) : void {
    addContext(context, {
      title: 'Request Headers',
      value: response.config.headers,
    });
    addContext(context, {
      title: 'Response',
      value: {
        status: response.status,
        statusText: response.statusText,
        body: response.data,
      },
    });
  }

  static logError(context: Context, error: AxiosError) : void {
    addContext(context, {
      title: 'Request Headers',
      value: error.config.headers,
    });
    if (error.response) {
      addContext(context, {
        title: ' Error Response',
        value: {
          status: error.response.status,
          statusText: error.response.statusText,
          body: error.response.data,
        },
      });
    } else if (error.request) {
      addContext(context, {
        title: 'Error',
        value: error.request,
      });
    } else {
      addContext(context, {
        title: 'Error',
        value: error.message,
      });
    }
  }
}
