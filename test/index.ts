import test from 'ava';
import { A, O } from 'boa-core';
import { init } from '../src/';
import * as sinon from 'sinon';

test.beforeEach(t => {
  const sandbox = sinon.sandbox.create();
  const request = sandbox.stub();
  request.returns(Promise.resolve({ foo: 123 }));
  const requests = [
    {
      name: 'request1',
      request
    }
  ];
  t.context.sinon = sandbox;
  t.context.request = request;
  t.context.requests = requests;
});

test.cb(t => {
  t.plan(5);
  const request: sinon.SinonStub = t.context.request;
  const requests = t.context.requests;
  const action$ = O.timer(1).map(() => ({
    type: 'request',
    data: {
      name: 'request1',
      params: { bar: 456 }
    }
  }));
  const options = {
    re: response => {
      t.truthy(request.callCount === 1);
      t.deepEqual(request.getCall(0).args, <any>[{ bar: 456 }]);
      t.truthy(response.type === 'response');
      t.truthy(response.data.request);
      t.truthy(response.data.response);
      t.end();
    }
  };
  init({ requests }).handler(action$, options).subscribe(() => void 0);
});
