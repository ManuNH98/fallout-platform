import { validateEnvironment } from './environment';

describe('validateEnvironment', () => {
  it('aplica valores locales por defecto', () => {
    expect(validateEnvironment({})).toMatchObject({
      NODE_ENV: 'development',
      PORT: 3001,
      WEB_URL: 'http://localhost:3000',
    });
  });

  it('rechaza un puerto invalido', () => {
    expect(() => validateEnvironment({ PORT: '70000' })).toThrow(
      'PORT debe ser un entero entre 1 y 65535.',
    );
  });

  it('rechaza una URL de frontend invalida', () => {
    expect(() => validateEnvironment({ WEB_URL: 'fallout' })).toThrow(
      'WEB_URL debe ser una URL valida.',
    );
  });

  it.each(['postgresql', 'postgres'])(
    'acepta %s y conserva credenciales codificadas y opciones TLS',
    (protocol) => {
      const databaseUrl = `${protocol}://postgres.example:p%40ss%2Fword@pooler.example:5432/postgres?sslmode=verify-full`;

      expect(
        validateEnvironment({
          WEB_URL: 'https://web.example/',
          SUPABASE_URL: 'https://example.supabase.co/',
          DATABASE_URL: databaseUrl,
          SUPABASE_STORAGE_BUCKET: 'media',
        }),
      ).toMatchObject({
        WEB_URL: 'https://web.example',
        SUPABASE_URL: 'https://example.supabase.co',
        DATABASE_URL: databaseUrl,
        SUPABASE_STORAGE_BUCKET: 'media',
      });
    },
  );

  it('permite configuracion externa vacia durante el desarrollo con mocks', () => {
    expect(
      validateEnvironment({ WEB_URL: '', DATABASE_URL: '', SUPABASE_URL: '' }),
    ).toMatchObject({ WEB_URL: 'http://localhost:3000' });
  });

  it.each(['WEB_URL', 'SUPABASE_URL'])(
    'rechaza protocolos ajenos a HTTP(S) en %s',
    (name) => {
      expect(() =>
        validateEnvironment({ [name]: 'ftp://example.com' }),
      ).toThrow(
        `${name} debe ser una URL con host y protocolo http: o https:.`,
      );
    },
  );

  it.each(['http://example.com/db', 'postgresql:database'])(
    'rechaza una conexion PostgreSQL con protocolo o host incorrectos (%s)',
    (value) => {
      expect(() => validateEnvironment({ DATABASE_URL: value })).toThrow(
        'DATABASE_URL debe ser una URL con host y protocolo postgresql: o postgres:.',
      );
    },
  );

  it.each(['WEB_URL', 'DATABASE_URL', 'SUPABASE_URL'])(
    'rechaza valores no textuales en %s',
    (name) => {
      expect(() => validateEnvironment({ [name]: 42 })).toThrow(
        `${name} debe ser una URL valida.`,
      );
    },
  );

  it('no incluye credenciales en el error de una conexion invalida', () => {
    const value = 'https://example-user:synthetic-password@example.com/db';

    expect(() => validateEnvironment({ DATABASE_URL: value })).toThrow(
      /^DATABASE_URL debe ser una URL con host y protocolo postgresql: o postgres:\.$/,
    );
  });
});
