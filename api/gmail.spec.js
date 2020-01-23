const gmail = require('./gmail');
const { createBatches } = gmail();

describe('gmail tests', () => {
  describe('createBatches', () => {
    it('should works', async () => {
      const messageIds = ['01', '02', '03', '04', '05', '06'];
      const onReceiveGmailEmail = jest.fn();
      const updateLabels = jest.fn();
      const getById = jest.fn().mockImplementation(id => Promise.resolve(`data:[${id}]`));

      await createBatches(messageIds, onReceiveGmailEmail, updateLabels, getById);

      expect(getById).toHaveBeenCalledTimes(6);
      expect(onReceiveGmailEmail).toHaveBeenCalledTimes(6);
      expect(updateLabels).toHaveBeenCalledTimes(1);

      for (let i = 1; i < 7; i++) {
        expect(getById).toHaveBeenNthCalledWith(i, i < 10 ? '0' + i : '' + i);
        expect(onReceiveGmailEmail).toHaveBeenNthCalledWith(i, `data:[${i < 10 ? '0' + i : '' + i}]`);
      }

      expect(updateLabels).toHaveBeenNthCalledWith(1, ['01', '02', '03', '04', '05', '06']);
    });
  });
});
