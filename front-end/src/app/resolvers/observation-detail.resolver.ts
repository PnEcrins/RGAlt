import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ObservationsService } from '../services/observations.service';
import { Observation } from '../types/types';

export interface ObservationResolvedData {
  observationData: { properties: Observation } | null;
}

export const observationDetailResolver: ResolveFn<ObservationResolvedData> = (
  route: ActivatedRouteSnapshot,
): Observable<ObservationResolvedData> => {
  const observationsService = inject(ObservationsService);
  const router = inject(Router);
  const observationIdParam = route.paramMap.get('observation');

  if (!observationIdParam) {
    router.navigate(['/']);
    return EMPTY;
  }

  const observationId = observationIdParam.slice(0, 36);

  return observationsService.getObservation(observationId).pipe(
    map((data: any) => ({ observationData: data })),
    catchError((error) => {
      router.navigate(['/']);
      return EMPTY;
    }),
  );
};
