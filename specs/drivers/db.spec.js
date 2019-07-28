import createDbTest from '../../drivers/db-test';
import createDbFirebase from '../../drivers/db-firebase';

function check(name, create) {
  describe(name, () => {
    const db = create('test');

    beforeEach(() => {
      db.reset();
    });

    afterAll(() => {
      db.reset();
    });

    it('all', async () => {
      const values = await db.getAll();
      expect(values).toEqual([]);
    });
    it('generateId', () => {
      const id1 = db.generateId();
      const id2 = db.generateId();
      expect(id1).not.toEqual(id2);
    });
    it('add', async () => {
      const values = await db.getAll();
      expect(values).toEqual([]);

      await db.add({ id: 0, value: 'value' });

      const newValues = await db.getAll();
      expect(newValues).toEqual([{ id: 0, value: 'value' }]);
    });

    it('get', async () => {
      const values = await db.getAll();
      expect(values).toEqual([]);

      await db.add({ id: 0, value: 'value' });

      const value0 = await db.get(0);
      expect(value0).toEqual({ id: 0, value: 'value' });

      return db.get(1).then(value => {
        expect(value).toBe(null);
      });
    });

    it('remove', async () => {
      const values = await db.getAll();
      expect(values).toEqual([]);

      await db.add({ id: 0, value: 'value' });
      await db.add({ id: 1, value: 'value1' });

      await db.remove(1);

      const newValues = await db.getAll();
      expect(newValues).toEqual([{ id: 0, value: 'value' }]);
    });

    it('update', async () => {
      const values = await db.getAll();
      expect(values).toEqual([]);

      await db.add({ id: 0, value: 'value' });

      const newValues = await db.update({ id: 0, value: 'newValue' });

      expect(newValues).toEqual([expect.objectContaining({ id: 0, value: 'newValue' })]);
    });
  });
}

describe('Drivers: db', () => {
  check('test', createDbTest());
  check('firebase', createDbFirebase());
});
