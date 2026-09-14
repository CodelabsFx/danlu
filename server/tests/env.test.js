describe('environment loading', () => {
  it('loads the server env file for local development', () => {
    delete process.env.DATABASE_URL;
    delete process.env.JWT_SECRET;

    jest.resetModules();
    require('../src/config').loadEnv();

    expect(process.env.DATABASE_URL).toBe('postgres://danlu:danlu@localhost:5432/danlu_db');
    expect(process.env.JWT_SECRET).toBe('change_me');
  });
});
