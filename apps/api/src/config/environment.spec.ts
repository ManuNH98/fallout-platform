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
});
