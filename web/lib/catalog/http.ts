import { NextResponse } from 'next/server';
import { CatalogError } from './validations';

export function catalogErrorResponse(err: unknown) {
  if (err instanceof Error && err.name === 'CatalogDbUnavailable') {
    return NextResponse.json(
      { error: 'catalogue-unavailable', detail: err.message },
      { status: 503 },
    );
  }
  if (err instanceof CatalogError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  const message = err instanceof Error ? err.message : 'erreur';
  if (message.includes('Unique constraint')) {
    return NextResponse.json({ error: 'Enregistrement déjà existant.' }, { status: 409 });
  }
  return NextResponse.json({ error: 'Impossible de traiter la requête catalogue.' }, { status: 500 });
}

export function unauthorized() {
  return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
}
