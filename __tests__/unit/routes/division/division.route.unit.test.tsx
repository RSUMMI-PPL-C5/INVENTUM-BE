import divisionRoutes from '../../../../src/routes/division.route';

describe('Division Routes', () => {
  it('should export a router with required methods', () => {
    expect(divisionRoutes).toBeDefined();

    expect(divisionRoutes).toHaveProperty('post');

    expect(divisionRoutes.name).toBe('router');
  });
});