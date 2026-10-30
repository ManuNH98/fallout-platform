import {
  BadRequestException,
  Inject,
  Injectable,
  Scope,
  type PipeTransform,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class EmptyBodyPipe implements PipeTransform<unknown, undefined> {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  transform(value: unknown): undefined {
    if (
      value === undefined &&
      (Number(this.request.headers['content-length'] ?? 0) > 0 ||
        this.request.headers['transfer-encoding'])
    ) {
      throw new BadRequestException(
        'La sincronizacion del perfil no admite campos.',
      );
    }
    if (
      value === undefined ||
      (value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        Object.keys(value).length === 0)
    ) {
      return undefined;
    }
    throw new BadRequestException(
      'La sincronizacion del perfil no admite campos.',
    );
  }
}
