// RequestAction -> HTTP request -> ResponseAction

import { A, O, Handler } from 'boa-core';
import { _do } from 'rxjs/operator/do';
import { filter } from 'rxjs/operator/filter';
import { share } from 'rxjs/operator/share';

export interface Request {
  name: string;
  request: (params: any) => Promise<any>;
  [x: string]: any;
}

type RequestMap = { [name: string]: Request; };

export interface RequestOptions {
  requests: Request[];
  requestActionType?: string;
  responseActionType?: string;
}

export interface RequestResponse {
  handler: Handler;
}

const init = (options: RequestOptions): RequestResponse => {
  const { requests, requestActionType, responseActionType } = options;
  const requestType = requestActionType ? requestActionType : 'request';
  const responseType = responseActionType ? responseActionType : 'response';
  const requestMap: RequestMap = requests.reduce((a, i) => {
    const o: RequestMap = {};
    o[i.name] = i;
    return Object.assign({}, a, o);
  }, <RequestMap>{});
  const handler = (action$: O<A<any>>, options: any) => {
    const { re }: { re: (action: A<any>) => void; } = options;
    return share.call(
      filter.call(
        _do.call(
          filter.call(
            action$,
            (action: A<any>): boolean => action.type === requestType
          ),
          ({ data: { name, params } }: {
            data: {
              name: string;
              params: any;
            }
          }) => {
            const request = requestMap[name];
            request.request(params).then(response => {
              const responseAction = {
                type: responseType,
                data: {
                  request,
                  response
                }
              };
              re(responseAction);
            });
          }
        ),
        () => false
      )
    );
  };
  return { handler };
};

export { init };
