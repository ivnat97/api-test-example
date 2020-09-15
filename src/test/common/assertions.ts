/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  export namespace Chai {
    interface Assertion {
      badRequest(errorMessages: string[] | string): void;
      forbidden(errorMessages: string[] | string): void;
    }
  }
}

export default function assertErrorResponse(chai): void {
  chai.Assertion.addMethod('badRequest', function badRequest(errorMessages: string[] | string): void {
    new chai.Assertion(this._obj.statusCode).to.eq(400);
    new chai.Assertion(this._obj.message).to.eq('Bad Request');
    new chai.Assertion(this._obj.error).to.deep.equal(errorMessages);
  });

  chai.Assertion.addMethod('forbidden', function forbidden(errorMessages: string[] | string): void {
    new chai.Assertion(this._obj.statusCode).to.eq(403);
    new chai.Assertion(this._obj.message).to.eq('Forbidden');
    new chai.Assertion(this._obj.error).to.deep.equal(errorMessages);
  });
}
