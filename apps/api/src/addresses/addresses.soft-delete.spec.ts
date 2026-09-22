/**
 * Verification tests for ERR-006: deleting an address used by past orders must
 * not blow up with a foreign-key violation. Addresses are deactivated instead
 * of hard-deleted, and inactive rows disappear from the user's address list.
 */
import { AddressesService } from './addresses.service';

const address = {
  id: 'addr-1',
  userId: 'user-1',
  label: 'Home',
  addressLine: 'Lazimpat',
  city: 'Kathmandu',
  state: 'Bagmati',
  country: 'Nepal',
  postalCode: '44600',
  latitude: null,
  longitude: null,
  isDefault: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function buildService() {
  const updates: any[] = [];
  const deletes: any[] = [];
  let findFirstCall = 0;

  const db: any = {
    query: {
      addressesTable: {
        findFirst: async () =>
          findFirstCall++ === 0
            ? address
            : { ...address, id: 'addr-2', isDefault: false },
      },
    },
    select: () => ({
      from: () => ({
        where: () => ({ orderBy: async () => [address] }),
      }),
    }),
    update: () => ({
      set: (values: any) => ({
        where: async () => {
          updates.push(values);
        },
      }),
    }),
    delete: () => ({
      where: async () => {
        deletes.push(true);
      },
    }),
  };

  return { service: new AddressesService(db), updates, deletes };
}

describe('AddressesService soft delete (ERR-006)', () => {
  it('deactivates the address instead of issuing a hard DELETE', async () => {
    const { service, updates, deletes } = buildService();

    await expect(service.delete('addr-1', 'user-1')).resolves.toEqual({
      message: 'Address deleted successfully',
    });

    // No SQL DELETE — that is what triggered the FK (23503) 500 error.
    expect(deletes).toHaveLength(0);
    expect(updates[0]).toMatchObject({ isActive: false, isDefault: false });
  });

  it('promotes another active address to default', async () => {
    const { service, updates } = buildService();

    await service.delete('addr-1', 'user-1');

    expect(updates).toHaveLength(2);
    expect(updates[1]).toMatchObject({ isDefault: true });
  });
});
