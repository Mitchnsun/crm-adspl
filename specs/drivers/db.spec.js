import createDbTest from '../../drivers/db-test';
import createDbFirebase from '../../drivers/db-firebase';
import createDbFireStore from '../../drivers/db-firestore';

function check(name, create) {
  describe(name, () => {
    const db = create('test');

    beforeEach(() => {
      return db.reset();
    });

    afterAll(() => {
      return db.reset();
    });

    it('all', async () => {
      const values = await db.getAll();
      expect(values).toEqual([]);
    });

    it('all (paginated)', async () => {
      const values = await db.getAll();
      expect(values).toEqual([]);

      for (let i = 0; i < 5; i++) {
        await db.add({ id: 'test-' + i, value: 'value' + i, createAt: Date.now() + i });
      }

      const paginatedValues = await db.getAll({ limit: 3 });
      expect(paginatedValues).toEqual([
        expect.objectContaining({ id: 'test-4', value: 'value4', createAt: expect.anything() }),
        expect.objectContaining({ id: 'test-3', value: 'value3', createAt: expect.anything() }),
        expect.objectContaining({ id: 'test-2', value: 'value2', createAt: expect.anything() }),
      ]);

      const paginatedValues2 = await db.getAll({ limit: 3, startAfter: paginatedValues[2] });
      expect(paginatedValues2).toEqual([
        expect.objectContaining({ id: 'test-1', value: 'value1', createAt: expect.anything() }),
        expect.objectContaining({ id: 'test-0', value: 'value0', createAt: expect.anything() }),
      ]);
    });

    it('all (filtered by status)', async () => {
      const values = await db.getAll();
      expect(values).toEqual([]);

      function status(i) {
        if (i < 3) return 'PENDING';
        if (i < 5) return 'IN_PROGRESS';
        return 'RESOLVED';
      }

      for (let i = 0; i < 6; i++) {
        await db.add({ id: 'test-' + i, value: 'value' + i, createAt: Date.now() + i, status: status(i) });
      }

      const filteredValues = await db.getAll({ status: 'PENDING' });
      expect(filteredValues).toEqual([
        expect.objectContaining({ id: 'test-2', value: 'value2', status: 'PENDING', createAt: expect.anything() }),
        expect.objectContaining({ id: 'test-1', value: 'value1', status: 'PENDING', createAt: expect.anything() }),
        expect.objectContaining({ id: 'test-0', value: 'value0', status: 'PENDING', createAt: expect.anything() }),
      ]);

      const filteredValues2 = await db.getAll({ status: 'IN_PROGRESS' });
      expect(filteredValues2).toEqual([
        expect.objectContaining({
          id: 'test-4',
          value: 'value4',
          status: 'IN_PROGRESS',
          createAt: expect.anything(),
        }),
        expect.objectContaining({
          id: 'test-3',
          value: 'value3',
          status: 'IN_PROGRESS',
          createAt: expect.anything(),
        }),
      ]);
    });

    it('all (filtered by follower)', async () => {
      const values = await db.getAll();
      expect(values).toEqual([]);

      function followers(i) {
        if (i % 3 === 0) return ['1'];
        return [];
      }

      for (let i = 0; i < 6; i++) {
        await db.add({ id: 'test-' + i, value: 'value' + i, createAt: Date.now() + i, followers: followers(i) });
      }

      const filteredValues = await db.getAll({ follower: '1' });
      expect(filteredValues).toEqual([
        expect.objectContaining({ id: 'test-3', value: 'value3', status: 'PENDING', createAt: expect.anything() }),
        expect.objectContaining({ id: 'test-0', value: 'value0', status: 'PENDING', createAt: expect.anything() }),
      ]);
    });

    it('all (filtered by follower/status)', async () => {
      const values = await db.getAll();
      expect(values).toEqual([]);

      function followers(i) {
        if (i % 2 === 0) return ['1'];
        return [];
      }
      function status(i) {
        if (i % 4 == 0) return 'IN_PROGRESS';
        return 'PENDING';
      }

      for (let i = 0; i < 6; i++) {
        await db.add({
          id: 'test-' + i,
          value: 'value' + i,
          createAt: Date.now() + i,
          followers: followers(i),
          status: status(i),
        });
      }

      const filteredValues = await db.getAll({ follower: '1', status: 'IN_PROGRESS' });
      expect(filteredValues).toEqual([
        expect.objectContaining({ id: 'test-4', value: 'value4', status: 'IN_PROGRESS', createAt: expect.anything() }),
        expect.objectContaining({ id: 'test-0', value: 'value0', status: 'IN_PROGRESS', createAt: expect.anything() }),
      ]);
    });

    it('generateId', () => {
      const id1 = db.generateId();
      const id2 = db.generateId();
      expect(id1).not.toEqual(id2);
    });
    it('add', async () => {
      const values = await db.getAll();
      expect(values).toEqual([]);

      await db.add({ id: 'test-0', value: 'value', createAt: Date.now() });

      const newValues = await db.getAll();
      expect(newValues).toEqual([expect.objectContaining({ id: 'test-0', value: 'value' })]);
    });

    it('get', async () => {
      const values = await db.getAll();
      expect(values).toEqual([]);

      await db.add({ id: 'test-0', value: 'value', createAt: Date.now() });

      const value0 = await db.get('test-0');
      expect(value0).toEqual(expect.objectContaining({ id: 'test-0', value: 'value', createAt: expect.anything() }));

      return db.get('test-1').then(value => {
        expect(value).toBe(null);
      });
    });

    it('remove', async () => {
      const values = await db.getAll();
      expect(values).toEqual([]);

      await db.add({ id: 'test-0', value: 'value', createAt: Date.now() });
      await db.add({ id: 'test-1', value: 'value1', createAt: Date.now() });

      await db.remove('test-1');

      const newValues = await db.getAll();
      expect(newValues).toEqual([
        expect.objectContaining({ id: 'test-0', value: 'value', createAt: expect.anything() }),
      ]);
    });

    it('update', async () => {
      const values = await db.getAll();
      expect(values).toEqual([]);

      const data = { id: 'test-0', value: 'value', createAt: Date.now() };
      await db.add(data);

      data.value = 'newValue';
      await db.update(data);

      const newValues = await db.getAll();
      expect(newValues).toEqual([
        expect.objectContaining({ id: 'test-0', value: 'newValue', createAt: expect.anything() }),
      ]);
    });
  });
}

describe('Drivers: db', () => {
  check('test', createDbTest());
  // check('firebase', createDbFirebase());
  // check('firestore', createDbFireStore());
});
