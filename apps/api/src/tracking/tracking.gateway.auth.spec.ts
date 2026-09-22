/**
 * Verification tests for ERR-004: only an authenticated DRIVER may push
 * locations, and the persisted driver id always comes from the verified
 * socket identity — never from the client payload.
 */
import { TrackingGateway } from './tracking.gateway';

function buildGateway(updateDriverLocation: jest.Mock) {
  const gateway = new TrackingGateway(
    {} as any,
    { get: jest.fn() } as any,
    {} as any,
    { updateDriverLocation } as any,
  );
  const broadcast = jest
    .spyOn(gateway, 'broadcastDriverLocation')
    .mockResolvedValue(undefined);
  return { gateway, broadcast };
}

describe('TrackingGateway driver location authorization (ERR-004)', () => {
  it('ignores location updates from a customer socket and persists nothing', async () => {
    const updateDriverLocation = jest.fn();
    const { gateway } = buildGateway(updateDriverLocation);

    const client: any = {
      data: { user: { sub: 'cust-1', role: 'CUSTOMER' } },
      emit: jest.fn(),
    };

    const result = await gateway.handleDriverLocation(client, {
      orderId: 'o1',
      latitude: 27.7172,
      longitude: 85.324,
    });

    expect(updateDriverLocation).not.toHaveBeenCalled();
    expect(client.emit).toHaveBeenCalledWith(
      'exception',
      expect.objectContaining({ status: 'error' }),
    );
    expect(result).toBeUndefined();
  });

  it('rejects an unauthenticated socket', async () => {
    const updateDriverLocation = jest.fn();
    const { gateway } = buildGateway(updateDriverLocation);

    const client: any = { data: {}, emit: jest.fn() };

    await expect(
      gateway.handleDriverLocation(client, {
        orderId: 'o1',
        latitude: 27.7172,
        longitude: 85.324,
      } as any),
    ).rejects.toThrow();

    expect(updateDriverLocation).not.toHaveBeenCalled();
  });

  it('always uses the socket user id as the driver id (no spoofing)', async () => {
    const updateDriverLocation = jest.fn(async () => ({
      lastUpdatedAt: new Date(),
    }));
    const { gateway, broadcast } = buildGateway(updateDriverLocation);

    const client: any = {
      data: { user: { sub: 'driver-1', role: 'DRIVER' } },
      emit: jest.fn(),
    };

    await gateway.handleDriverLocation(client, {
      orderId: 'o1',
      latitude: 27.7172,
      longitude: 85.324,
      // A malicious client may send this — it must be ignored.
      driverId: 'attacker-1',
    } as any);

    expect(updateDriverLocation).toHaveBeenCalledWith(
      'driver-1',
      expect.objectContaining({ orderId: 'o1' }),
    );
    expect(broadcast).toHaveBeenCalledWith(
      'o1',
      expect.objectContaining({ driverId: 'driver-1' }),
    );
  });
});
