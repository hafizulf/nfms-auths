import { Injectable } from '@nestjs/common';
import { Observable, catchError, throwError, firstValueFrom } from 'rxjs';

@Injectable()
export class GrpcClientHelper {
  async call<T>(source: string, obs: Observable<T>): Promise<T> {
    return firstValueFrom(
      obs.pipe(
        catchError((err: any) => {
          Object.defineProperty(err, 'grpcSource', { value: source, enumerable: false });
          return throwError(() => err);
        }),
      ),
    );
  }
}
