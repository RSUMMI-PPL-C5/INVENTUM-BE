describe('Divisi Routes', () => {
  it('should export a router with required methods', () => {
    expect(divisiRoutes).toBeDefined();

    expect(divisiRoutes).toHaveProperty('post');

    expect(divisiRoutes.name).toBe('router');
  });
});